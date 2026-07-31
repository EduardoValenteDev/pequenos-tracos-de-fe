/**
 * useStoryPackDownload — hook de DOWNLOAD de pack por história (Fase 2B).
 *
 * ENCAPSULA o runtime de packs (`usePacks` + `packDownloadService`) atrás de um hook, para que
 * a TELA (StoryDetail) NUNCA importe `usePacks`/`packDownloadService` diretamente — preservando
 * o guardrail de arquitetura (nenhuma `src/screens/*` importa camada `pack*`).
 *
 * Expõe um estado de UI simples: 'not_downloaded' | 'downloading' | 'ready' | 'error', progresso
 * 0..1, e as ações download()/retry(). Baixa TODOS os kinds ÚTEIS (cover/scene/audio) para que
 * a história premium fique 100% offline (Narration + Livrinho). Read-only quanto a
 * progresso/acesso/compras; NÃO altera entitlement. O gate de acesso (premium-active) é da TELA.
 *
 * LP2.1a-ii-F3 — LIFECYCLE: cada execução de download() é dona de uma geração e de um controller
 * exclusivos. No unmount e na troca de `storyId`, a execução é invalidada (geração++ e abort do
 * signal), de modo que progresso/resultado obsoletos NÃO tocam o estado da tela. O abort é apenas
 * do OBSERVADOR: a instalação física continua em background e beneficia o cache. O retorno público
 * permanece o contrato legado `{ ok: true }` | `{ ok: false }`, derivado só de `res.ok`.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePacks } from '../context/PacksContext';
import { downloadStoryPackScenesFromGlobalManifest } from '../services/packDownloadService';
// LP2.1a-ii-01F: fonte global observável do estado de instalação (sobrevive ao unmount da tela).
import { subscribeStoryPackInstall, getStoryPackInstallSnapshot } from '../services/packInstallRegistry';
// [P3J-R] diagnóstico estruturado: dá NOME ao estágio da falha em desenvolvimento, sem jamais
// carregar a URL do manifesto nem qualquer valor de configuração.
import { buildDownloadDiagnostic, inferNetworkState, logDownloadDiagnostic, resolveIndexAfterCommit } from '../services/packDownloadDiagnostics';

const GLOBAL_MANIFEST_URL = process.env.EXPO_PUBLIC_GLOBAL_MANIFEST_URL || null;
// [P3J] `coloring` saiu dos kinds pedidos: com o Colorir legado aposentado, baixar os linearts
// gastaria rede e disco da família por um arquivo que nenhuma tela abre. O parser de manifesto
// (`KNOWN_KINDS`, em packDownloadService) CONTINUA aceitando o kind, para que manifestos já
// publicados sejam lidos sem erro — apenas nada desse tipo é transferido.
const REQUESTED_KINDS = ['cover', 'scene', 'audio'];

/**
 * Controller de OBSERVAÇÃO mínimo, interno ao hook e SEM dependência. A base de código trata
 * `AbortController` como não-garantido no runtime (`globalManifestService` o usa sob `typeof`-guard),
 * então não dependemos do global. Fornece só a interface que o serviço consome: `signal.aborted`,
 * `signal.addEventListener('abort', cb)`, `signal.removeEventListener('abort', cb)` e `abort()`.
 * Síncrono, idempotente, notifica todos os listeners, isola exceções; NÃO cancela rede/instalação.
 */
function createHookAbortController() {
  let aborted = false;
  const listeners = new Set();
  const signal = {
    get aborted() { return aborted; },
    addEventListener(type, cb) { if (type === 'abort' && typeof cb === 'function') listeners.add(cb); },
    removeEventListener(type, cb) { if (type === 'abort') listeners.delete(cb); },
  };
  return {
    signal,
    abort() {
      if (aborted) return;
      aborted = true;
      for (const cb of Array.from(listeners)) { try { cb(); } catch { /* listener não afeta o abort */ } }
    },
  };
}

/** Estado do índice numa forma curta e estável para o log (nunca lança, nunca traz caminho). */
function indexLabel(state) {
  if (!state) return null;
  if (typeof state.status === 'string' && state.status) return state.status;
  return state.ready ? 'ready' : 'not_downloaded';
}

/**
 * [P3J-R] Emite o diagnóstico de UMA operação encerrada, só em desenvolvimento.
 * O serviço entrega os fatos do fluxo (`res.diagnostic`); aqui entram identidade, kinds pedidos e
 * o índice antes/depois. `buildDownloadDiagnostic` sanitiza — nenhum campo pode carregar URL.
 *
 * [P3J-R.1] `indexAfterCommit` vem da ENTRADA TRANSACIONAL (`res.entry`), não do espelho do
 * contexto: entre o `await` do download e esta emissão NÃO há render, então o espelho ainda mostra
 * o estado ANTIGO — era essa a origem do `indexAfter: "not_downloaded"` após sucesso. O valor do
 * contexto continua registrado, com o nome honesto `contextAtEmit`.
 */
function reportDiagnostic({ storyId, requestedKinds, res, indexBefore, contextAtEmit, failureStageOverride }) {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return null;   // silêncio total em produção
  const d = (res && res.diagnostic) || {};
  const failureStage = failureStageOverride || d.failureStage || (res && res.ok ? 'none' : 'indeterminado');
  const diagnostic = buildDownloadDiagnostic({
    storyId,
    requestedKinds,
    manifestKinds: d.manifestKinds,
    filteredFileCount: d.filteredFileCount,
    downloadedFileCount: d.downloadedFileCount,
    failedFile: d.failedFile,
    failureStage,
    networkState: inferNetworkState({
      failureStage,
      networkError: !!(res && res.networkError),
      // Chegar a um estágio posterior à resolução prova que o servidor respondeu.
      reachedServer: ['manifest', 'filter', 'space', 'download', 'verify', 'publish', 'none'].includes(failureStage),
    }),
    indexBefore,
    // A chamada fica DENTRO da guarda `__DEV__` acima: em produção nada é calculado.
    indexAfterCommit: resolveIndexAfterCommit(res),
    contextAtEmit,
  });
  logDownloadDiagnostic(diagnostic, { isDev: true });
  return diagnostic;
}

function reasonToError(res) {
  if (!res) return 'error';
  if (res.requiresAppUpdate) return 'app_update';
  if (res.networkError) return 'network';
  if (/insufficient_space|espa[çc]o/i.test(res.reason || '')) return 'insufficient_space';
  return res.reason || 'error';
}

export function useStoryPackDownload(storyId, options = {}) {
  const appVersion = options.appVersion || '1.0.0';
  const { getStoryPackState, refreshPacks } = usePacks();
  const packState = getStoryPackState(storyId); // { layer, status, ready, ... } — reconciliado
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [error, setError] = useState(null);
  const busyRef = useRef(false);
  const generationRef = useRef(0);      // LP2.1a-ii-F3: geração corrente da execução
  const controllerRef = useRef(null);   // LP2.1a-ii-F3: controller de observação da execução corrente
  const localStateStoryIdRef = useRef(storyId);   // LP2.1a-ii-F4A: dono do estado local (downloading/progress/error)
  // [P3J-R] espelho SEMPRE atual de `getStoryPackState`, para ler o índice depois do await sem
  // acrescentar dependência ao useCallback (a identidade de `download`/`retry` fica intacta).
  const getStoryPackStateRef = useRef(getStoryPackState);
  getStoryPackStateRef.current = getStoryPackState;

  // LP2.1a-ii-F4A — corpo: prepara o estado da IDENTIDADE NOVA (reset destinado à história atual, nunca no unmount).
  // LP2.1a-ii-F3 — cleanup: invalida a execução no UNMOUNT e na TROCA de storyId (SEM setters; não cancela o físico).
  useEffect(() => {
    localStateStoryIdRef.current = storyId;   // a história atual passa a ser a dona do estado local
    setDownloading(false);
    setProgress(0);
    setError(null);
    return () => {
      generationRef.current += 1;               // 1) invalida a geração corrente ANTES do abort
      const controller = controllerRef.current; // 2) captura o controller atual em variável local
      controllerRef.current = null;             // 3) limpa o ref antes de abortar (execução nova cria o seu)
      if (controller && typeof controller.abort === 'function') controller.abort();   // 4) só o controller capturado
      busyRef.current = false;                  // 5) libera o gate para a nova história
    };
  }, [storyId]);

  const download = useCallback(async () => {
    if (busyRef.current || !storyId) return { ok: false };
    // [P3J-R] leitura do índice pelo espelho (nunca lança; `null` significa "não observado").
    const lerIndice = () => {
      try { return indexLabel(getStoryPackStateRef.current(storyId)); } catch { return null; }
    };
    if (!GLOBAL_MANIFEST_URL) {
      // [P3J-R] FALHA DE CONFIGURAÇÃO: retorna ANTES de tocar a rede. O erro fica com nome próprio
      // ('config'), o diagnóstico registra `failureStage: 'config'` e `networkState:
      // 'nao_consultada'` — e nada disso revela qual seria a URL. A tela usa esse nome para NÃO
      // chamar isto de falta de internet, que foi exatamente a confusão da validação física do P3J.
      setError('config');
      reportDiagnostic({
        storyId,
        requestedKinds: REQUESTED_KINDS,
        res: { ok: false },
        indexBefore: lerIndice(),
        contextAtEmit: lerIndice(),   // nada foi executado: por construção, o índice não mudou
        failureStageOverride: 'config',
      });
      return { ok: false };
    }
    busyRef.current = true;
    localStateStoryIdRef.current = storyId;   // LP2.1a-ii-F4A: a execução aceita reivindica a propriedade do estado
    const myGeneration = ++generationRef.current;
    const previousController = controllerRef.current;
    if (previousController && typeof previousController.abort === 'function') previousController.abort();
    const controller = createHookAbortController();
    controllerRef.current = controller;
    const isCurrentExecution = () =>
      generationRef.current === myGeneration
      && controllerRef.current === controller
      && !controller.signal.aborted;
    setError(null);
    setProgress(0);
    setDownloading(true);
    const indexBefore = lerIndice();   // [P3J-R] fotografia do índice ANTES de qualquer escrita
    let res;
    try {
      try {
        res = await downloadStoryPackScenesFromGlobalManifest({
          storyId,
          globalManifestUrl: GLOBAL_MANIFEST_URL,
          appVersion,
          requestedKinds: REQUESTED_KINDS,
          participantSignal: controller.signal,
          onProgress: (p) => {
            if (!isCurrentExecution()) return;   // progresso de execução obsoleta é ignorado
            // FIX1R — FONTE ÚNICA DO PROGRESSO: com registro global disponível, o progresso vem do
            // espelho (setInstallSnapshot). O setProgress LOCAL só roda como FALLBACK sem registro
            // (harness/ambiente antigo) — evita duas atualizações do hook para o MESMO snapshot.
            if (typeof subscribeStoryPackInstall === 'function') return;
            const total = p && p.totalBytes;
            const done = p && p.downloadedBytes;
            if (total > 0 && Number.isFinite(done)) {
              setProgress(Math.max(0, Math.min(1, done / total)));
            }
          },
        });
      } catch (e) {
        res = { ok: false, reason: String((e && e.message) || e) };
      }
      const ok = Boolean(res && res.ok);   // retorno público PURO de res.ok (independe da obsolescência)
      // [P3J-R] uma linha por operação encerrada, só em DEV. Roda antes dos setters para que o
      // estágio registrado seja o da operação, e não o efeito colateral de um render posterior.
      reportDiagnostic({
        storyId,
        requestedKinds: REQUESTED_KINDS,
        res,
        indexBefore,
        // Espelho do contexto NESTE instante — ainda pré-render, por isso não se chama "after".
        contextAtEmit: lerIndice(),
      });
      if (isCurrentExecution() && ok) {
        setProgress(1);
        // FIX1R — DONO ÚNICO DA RECONCILIAÇÃO: em produção o READY reconcilia o PacksContext via
        // subscribePackReady (registro). O refreshPacks legado só roda como FALLBACK quando NÃO há
        // registro global (harness/ambiente antigo) → uma única reconciliação por terminal READY.
        if (typeof subscribeStoryPackInstall !== 'function' && isCurrentExecution()) { try { await refreshPacks(); } catch { /* índice recarrega no próximo foco */ } }
      } else if (isCurrentExecution() && !ok) {
        setError(reasonToError(res));
      }
      return ok ? { ok: true } : { ok: false };
    } finally {
      // Só a execução PROPRIETÁRIA libera o gate/refs; um finally obsoleto não toca a execução nova.
      if (generationRef.current === myGeneration && controllerRef.current === controller) {
        busyRef.current = false;
        controllerRef.current = null;
        if (!controller.signal.aborted) setDownloading(false);
      }
    }
  }, [storyId, appVersion, refreshPacks]);

  // LP2.1a-ii-01F — ESPELHO DO REGISTRO GLOBAL (slots ADICIONADOS AO FIM para não deslocar os slots
  // auditados 0–8). Observa a instalação da história pelo registro: uma tela que monta DURANTE um voo
  // recebe status/phase/progress no replay imediato (sem novo download), e READY chega sozinho. Guardas
  // `typeof` para o carregamento sob harness (imports removidos) → snapshot nulo → comportamento LEGADO.
  const [installSnapshot, setInstallSnapshot] = useState(
    () => (typeof getStoryPackInstallSnapshot === 'function' ? getStoryPackInstallSnapshot(storyId) : null),
  );
  useEffect(() => {
    if (typeof subscribeStoryPackInstall !== 'function') return undefined;
    setInstallSnapshot(getStoryPackInstallSnapshot(storyId));   // reancora ao trocar de história
    return subscribeStoryPackInstall(storyId, (snap) => setInstallSnapshot(snap));
  }, [storyId]);
  const installBelongs = !!installSnapshot && installSnapshot.storyId === storyId;
  const installActive = installBelongs && installSnapshot.status === 'downloading';
  const installReady = installBelongs && installSnapshot.status === 'ready';
  const installError = installBelongs && installSnapshot.status === 'error';

  // LP2.1a-ii-F4A — PROPRIEDADE DO ESTADO: o estado local só é visível quando pertence ao storyId atual.
  // Garante que o PRIMEIRO render de uma nova história (antes de o effect dela rodar) não herde o
  // downloading/progress/error da história anterior. O estado antigo pode existir por um instante no
  // slot, mas fica INVISÍVEL para a nova identidade.
  const localStateBelongsToStory = localStateStoryIdRef.current === storyId;
  const visibleDownloading = localStateBelongsToStory ? downloading : false;
  const visibleError = localStateBelongsToStory ? error : null;
  // Progresso: o registro global (voo ativo) tem precedência sobre o estado local — assim ele
  // SOBREVIVE ao unmount e reaparece numa nova montagem. Sem voo → estado local legado.
  const visibleProgress = installActive
    ? installSnapshot.progress
    : (localStateBelongsToStory ? progress : 0);

  // Estado de UI derivado (a TELA renderiza a partir daqui). READY/downloading do registro global
  // têm precedência para não voltar a oferecer "Baixar" nem exigir segundo toque.
  const uiState = (visibleDownloading || installActive)
    ? 'downloading'
    : (visibleError || installError)
      ? 'error'
      : (packState.ready || installReady)
        ? 'ready'
        : 'not_downloaded';

  return {
    uiState,
    progress: visibleProgress,
    error: visibleError,
    phase: installActive ? installSnapshot.phase : null,   // ADITIVO: 'downloading'|'verifying'|'publishing'
    download,
    retry: download,
    isRemote: packState.layer === 'remote',
    isReady: !!packState.ready || installReady,
    configMissing: !GLOBAL_MANIFEST_URL,
  };
}
