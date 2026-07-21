/**
 * useStoryPackDownload — hook de DOWNLOAD de pack por história (Fase 2B).
 *
 * ENCAPSULA o runtime de packs (`usePacks` + `packDownloadService`) atrás de um hook, para que
 * a TELA (StoryDetail) NUNCA importe `usePacks`/`packDownloadService` diretamente — preservando
 * o guardrail de arquitetura (nenhuma `src/screens/*` importa camada `pack*`).
 *
 * Expõe um estado de UI simples: 'not_downloaded' | 'downloading' | 'ready' | 'error', progresso
 * 0..1, e as ações download()/retry(). Baixa TODOS os kinds (cover/scene/coloring/audio) para que
 * a história premium fique 100% offline (Narration + Coloring + Livrinho). Read-only quanto a
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

const GLOBAL_MANIFEST_URL = process.env.EXPO_PUBLIC_GLOBAL_MANIFEST_URL || null;
const REQUESTED_KINDS = ['cover', 'scene', 'coloring', 'audio'];

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
    if (!GLOBAL_MANIFEST_URL) { setError('config'); return { ok: false }; }
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
      if (isCurrentExecution() && ok) {
        setProgress(1);
        if (isCurrentExecution()) { try { await refreshPacks(); } catch { /* índice recarrega no próximo foco */ } }
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

  // LP2.1a-ii-F4A — PROPRIEDADE DO ESTADO: o estado local só é visível quando pertence ao storyId atual.
  // Garante que o PRIMEIRO render de uma nova história (antes de o effect dela rodar) não herde o
  // downloading/progress/error da história anterior. O estado antigo pode existir por um instante no
  // slot, mas fica INVISÍVEL para a nova identidade.
  const localStateBelongsToStory = localStateStoryIdRef.current === storyId;
  const visibleDownloading = localStateBelongsToStory ? downloading : false;
  const visibleProgress = localStateBelongsToStory ? progress : 0;
  const visibleError = localStateBelongsToStory ? error : null;

  // Estado de UI derivado (a TELA renderiza a partir daqui).
  const uiState = visibleDownloading
    ? 'downloading'
    : visibleError
      ? 'error'
      : packState.ready
        ? 'ready'
        : 'not_downloaded';

  return {
    uiState,
    progress: visibleProgress,
    error: visibleError,
    download,
    retry: download,
    isRemote: packState.layer === 'remote',
    isReady: !!packState.ready,
    configMissing: !GLOBAL_MANIFEST_URL,
  };
}
