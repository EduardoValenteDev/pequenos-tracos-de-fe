/**
 * PacksContext.js — Estado READ-ONLY dos packs premium (Fase 2, F2.1d).
 *
 * Expõe ao app o estado de cada pack a partir do índice local `@ptf_packs_v1`
 * (via packStorageService), SEM nenhum consumo visual ainda: nenhuma tela lê este
 * contexto neste bloco. É apenas a base para o F2.1e integrar leitura de mídia.
 *
 * ⚠️ SOMENTE LEITURA: lê o índice no boot (getPackIndex — nunca lança). NÃO grava
 * `@ptf_packs_v1`, NÃO instala pack, NÃO baixa, NÃO limpa, NÃO toca R2. AsyncStorage
 * vazio → índice vazio seguro. Erro de leitura → capturado, app NÃO quebra.
 *
 * F2.5-hardening-2: reconciliação índice↔disco EM MEMÓRIA — um `ready` cujo localDir/
 * manifest.json não existem é tratado como `not_downloaded` (resolver cai no require). Só
 * lê disco (getInfoAsync); NÃO grava o índice (read-only preservado; downgrade-safe).
 *
 * Camada × estado:
 *   - starter (creation/noah) → status `included` (no binário; não é pack baixável).
 *   - remote sem entrada no índice → `not_downloaded`.
 *   - remote com entrada → o status do índice (`ready`/`downloading`/...).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { getPackIndex, getPackLocalDir, PACK_STATUS } from '../services/packStorageService';
import { collectPackProbes, computeInvalidReadyIds, reconcileEntry } from '../services/packReconcileService';
import { getContentLayer, CONTENT_LAYERS } from '../data/contentManifest';
import { markOnce } from '../services/performanceTrace';
import { subscribePackReady } from '../services/packInstallRegistry';
import { warn } from '../utils/logger';

const EMPTY_STATE = Object.freeze({
  storyId: null,
  layer: null,
  status: PACK_STATUS.NOT_DOWNLOADED,
  ready: false,
  localDir: null,
  entry: null,
});

const PacksContext = createContext({
  packIndex: {},
  isLoadingPacks: true,
  packsError: null,
  refreshPacks: async () => {},
  getPackEntry: () => null,
  getPackStatus: () => PACK_STATUS.NOT_DOWNLOADED,
  isPackReady: () => false,
  getStoryPackState: () => EMPTY_STATE,
});

// F2.5-hardening-2 — casca FS FINA (fora do render): checa localDir + manifest.json. Se
// getInfoAsync LANÇAR, retorna probe INDETERMINADO {null,null} → o núcleo puro NÃO rebaixa
// (conservador). READ-ONLY (só getInfoAsync; nunca grava índice/baixa).
async function probePackDisk(localDir) {
  if (!localDir) return { localDirExists: false, manifestExists: false };
  try {
    const d = await FileSystem.getInfoAsync(localDir);
    if (!d || !d.exists) return { localDirExists: false, manifestExists: false };
    const m = await FileSystem.getInfoAsync(`${localDir}manifest.json`);
    return { localDirExists: true, manifestExists: !!(m && m.exists) };
  } catch {
    return { localDirExists: null, manifestExists: null };
  }
}

// True se o conjunto de storyIds inválidos é o MESMO (evita setState/render à toa).
function sameIds(prevSet, nextArr) {
  if (prevSet.size !== nextArr.length) return false;
  for (const id of nextArr) if (!prevSet.has(id)) return false;
  return true;
}

export function PacksProvider({ children }) {
  const [packIndex, setPackIndex] = useState({});
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const [packsError, setPacksError] = useState(null);

  // LP2.1-G4 — GERAÇÃO DE LEITURA (uma por INSTÂNCIA do provider; `useRef` sobrevive ao render e
  // morre com a instância). `getPackIndex` é um `AsyncStorage.getItem` CRU: a fila serializada do
  // packStorageService cobre só as MUTAÇÕES do índice (gravar/limpar entrada), nunca as leituras. Logo
  // duas chamadas concorrentes de `loadPacks` — ouvinte de READY global, `refreshPacks` das telas,
  // carga inicial — podem concluir FORA da ordem de despacho, e a leitura mais ANTIGA sobrescrever
  // a mais NOVA no estado React: a história recém-baixada some da estante, sem erro e sem log.
  // A guarda DESCARTA o resultado obsoleto. Não faz merge (o índice lido é o snapshot COMPLETO, e
  // por isso remoções/resets/FAILED continuam refletidos), não serializa leitura nenhuma, não
  // atrasa nada e não depende de qualquer garantia de ordenação do AsyncStorage.
  const loadGenRef = useRef(0);
  // Uma leitura pode estar em voo quando o provider desmonta: nada de setState depois disso.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true; // StrictMode remonta o efeito: reativa antes da próxima carga
    return () => { mountedRef.current = false; };
  }, []);

  // READ-ONLY: só lê o índice. Nunca grava/instala/baixa.
  const loadPacks = useCallback(async () => {
    // LP1M-A: só OBSERVA a hidratação do BOOT (`markOnce`); refreshes seguintes não remarcam.
    markOnce('packs_hydration_start');
    // LP2.1-G4: incremento SÍNCRONO — nada pode acontecer entre a captura da geração e o despacho
    // da leitura. `gen` é a identidade DESTA chamada; `isCurrent()` responde "ainda sou a leitura
    // mais recente de um provider montado?" e governa TODA escrita de estado deste ciclo.
    const gen = ++loadGenRef.current;
    const isCurrent = () => mountedRef.current && gen === loadGenRef.current;
    if (isCurrent()) {
      setIsLoadingPacks(true);
      setPacksError(null);
    }
    try {
      const index = await getPackIndex(); // {} se vazio/erro (packStorageService nunca lança)
      if (!isCurrent()) return; // leitura OBSOLETA (ou provider desmontado) → descartada
      setPackIndex(index && typeof index === 'object' ? index : {});
    } catch (e) {
      // Observação/diagnóstico NÃO são guardados: um erro continua marcado e logado mesmo vindo de
      // uma leitura obsoleta. O que a guarda protege é o ESTADO React.
      markOnce('packs_hydration_error', { reason: 'error' });
      warn('PacksContext.loadPacks:', e);
      if (!isCurrent()) return;
      setPacksError(e);
      setPackIndex({});
    } finally {
      markOnce('packs_hydration_end');
      // `isLoadingPacks` também é estado: uma leitura obsoleta não pode anunciar "terminou"
      // enquanto a leitura mais recente ainda está em voo.
      if (isCurrent()) setIsLoadingPacks(false);
    }
  }, []);

  useEffect(() => { loadPacks(); }, [loadPacks]);

  // LP2.1a-ii-01F: READY GLOBAL — quando uma instalação conclui (em QUALQUER tela, ou mesmo sem
  // tela montada), o registro global dispara este ouvinte e o índice é recarregado. Assim READY
  // chega ao contexto INDEPENDENTE da tela iniciadora (não depende de `isCurrentExecution` nem de
  // segundo toque). Só reage a READY (disponibilidade persistida) — NÃO recebe progresso por
  // arquivo, evitando tempestade de renders durante o download.
  // FIX1R: o callback é async (loadPacks) — isolar a rejeição para NUNCA virar unhandled rejection,
  // mantendo-a diagnosticável (warn) e sem desfazer o READY persistido (loadPacks só LÊ o índice).
  useEffect(() => subscribePackReady(() => {
    loadPacks().catch((e) => warn('PacksContext.readyListener:', e));
  }), [loadPacks]);

  const refreshPacks = useCallback(() => loadPacks(), [loadPacks]);

  // F2.5-hardening-1 C3: recompõe `localDir` a partir do `documentDirectory` ATUAL (no iOS o
  // container muda de UUID entre updates/restores → o file:// ABSOLUTO persistido fica inválido).
  // Migração IMPLÍCITA e idempotente: o localDir persistido é ignorado no boundary de leitura;
  // recompomos por (storyId, version). Sem storyId/version válidos → mantém a entry CRUA.
  // READ-ONLY (não grava índice). Memoizado em [packIndex] → estabilidade referencial preservada
  // (getPackEntry/useSandboxScenePackEntry mantêm identidade → Livrinho não rebuilda a timeline).
  const normalizedIndex = useMemo(() => {
    const out = {};
    for (const sid of Object.keys(packIndex)) {
      const e = packIndex[sid];
      if (!e || typeof e !== 'object') { out[sid] = e; continue; }
      const dir = e.version ? getPackLocalDir(e.storyId || sid, e.version) : null;
      out[sid] = dir ? { ...e, localDir: dir } : e;
    }
    return out;
  }, [packIndex]);

  // F2.5-hardening-2 — reconciliação índice↔disco EM MEMÓRIA (não grava índice). Overlay de
  // storyIds cujo `ready` não bate com o disco (localDir/manifest.json ausentes). Roda em
  // useEffect APÓS o índice cru carregar (não bloqueia loadPacks/1ª pintura). Cancellation
  // impede aplicar resultado antigo; setState só quando o conjunto muda (sem render à toa).
  const [invalidReadyIds, setInvalidReadyIds] = useState(() => new Set());
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Sonda só o que reivindica arquivos (toda entry `ready`). A coleta vive no núcleo puro
      // para que a sequência sondar→invalidar seja testável sem duplicar a lógica.
      const probes = await collectPackProbes(normalizedIndex, probePackDisk);
      if (cancelled) return;
      const invalid = computeInvalidReadyIds(normalizedIndex, probes); // núcleo PURO
      setInvalidReadyIds(prev => (sameIds(prev, invalid) ? prev : new Set(invalid)));
    })();
    return () => { cancelled = true; };
  }, [normalizedIndex]);

  // Índice EFETIVO: `ready` inválido → NOT_DOWNLOADED (via núcleo puro). Sem WRITE. Mantém a
  // MESMA referência quando não há inválidos (estabilidade referencial preservada).
  const reconciledIndex = useMemo(() => {
    if (!invalidReadyIds.size) return normalizedIndex;
    const out = {};
    for (const sid of Object.keys(normalizedIndex)) {
      out[sid] = reconcileEntry(normalizedIndex[sid], invalidReadyIds.has(sid));
    }
    return out;
  }, [normalizedIndex, invalidReadyIds]);

  const getPackEntry = useCallback(
    storyId => (storyId ? reconciledIndex[storyId] : null) || null,
    [reconciledIndex],
  );

  // Estado do pack considerando a CAMADA. Puro/derivado; nunca lança.
  const getStoryPackState = useCallback(
    storyId => {
      if (!storyId) return EMPTY_STATE;
      const layer = getContentLayer(storyId);
      if (layer === CONTENT_LAYERS.STARTER) {
        return { storyId, layer, status: PACK_STATUS.INCLUDED, ready: false, localDir: null, entry: null };
      }
      const entry = reconciledIndex[storyId] || null;
      const status = entry?.status || PACK_STATUS.NOT_DOWNLOADED;
      return {
        storyId,
        layer,
        status,
        ready: status === PACK_STATUS.READY,
        localDir: entry?.localDir || null,
        entry,
      };
    },
    [reconciledIndex],
  );

  const getPackStatus = useCallback(
    storyId => getStoryPackState(storyId).status,
    [getStoryPackState],
  );

  const isPackReady = useCallback(
    storyId => getStoryPackState(storyId).status === PACK_STATUS.READY,
    [getStoryPackState],
  );

  const value = useMemo(() => ({
    packIndex: reconciledIndex,
    isLoadingPacks,
    packsError,
    refreshPacks,
    getPackEntry,
    getPackStatus,
    isPackReady,
    getStoryPackState,
  }), [
    reconciledIndex,
    isLoadingPacks,
    packsError,
    refreshPacks,
    getPackEntry,
    getPackStatus,
    isPackReady,
    getStoryPackState,
  ]);

  return (
    <PacksContext.Provider value={value}>
      {children}
    </PacksContext.Provider>
  );
}

export function usePacks() {
  return useContext(PacksContext);
}
