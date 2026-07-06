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
  useState,
} from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { getPackIndex, getPackLocalDir, PACK_STATUS } from '../services/packStorageService';
import { needsDiskCheck, computeInvalidReadyIds, reconcileEntry } from '../services/packReconcileService';
import { getContentLayer, CONTENT_LAYERS } from '../data/contentManifest';
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

  // READ-ONLY: só lê o índice. Nunca grava/instala/baixa.
  const loadPacks = useCallback(async () => {
    setIsLoadingPacks(true);
    setPacksError(null);
    try {
      const index = await getPackIndex(); // {} se vazio/erro (packStorageService nunca lança)
      setPackIndex(index && typeof index === 'object' ? index : {});
    } catch (e) {
      warn('PacksContext.loadPacks:', e);
      setPacksError(e);
      setPackIndex({});
    } finally {
      setIsLoadingPacks(false);
    }
  }, []);

  useEffect(() => { loadPacks(); }, [loadPacks]);

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
      const probes = {};
      for (const sid of Object.keys(normalizedIndex)) {
        const e = normalizedIndex[sid];
        if (!needsDiskCheck(e)) continue; // só entries `ready` com localDir
        probes[sid] = await probePackDisk(e.localDir);
      }
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
