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
import { getPackIndex, getPackLocalDir, PACK_STATUS } from '../services/packStorageService';
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

  const getPackEntry = useCallback(
    storyId => (storyId ? normalizedIndex[storyId] : null) || null,
    [normalizedIndex],
  );

  // Estado do pack considerando a CAMADA. Puro/derivado; nunca lança.
  const getStoryPackState = useCallback(
    storyId => {
      if (!storyId) return EMPTY_STATE;
      const layer = getContentLayer(storyId);
      if (layer === CONTENT_LAYERS.STARTER) {
        return { storyId, layer, status: PACK_STATUS.INCLUDED, ready: false, localDir: null, entry: null };
      }
      const entry = normalizedIndex[storyId] || null;
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
    [normalizedIndex],
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
    packIndex: normalizedIndex,
    isLoadingPacks,
    packsError,
    refreshPacks,
    getPackEntry,
    getPackStatus,
    isPackReady,
    getStoryPackState,
  }), [
    normalizedIndex,
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
