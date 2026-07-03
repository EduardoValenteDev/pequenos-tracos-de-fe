/**
 * contentResolver.js — Camada ÚNICA de resolução de mídia (starter local × pack remoto).
 * Fase 2, F2.1a — FUNDAÇÃO.
 *
 * ⚠️ NÃO é consumido por nenhuma tela ainda. O app segue resolvendo mídia pelos loaders
 * atuais (storyImageService/audioService). Aqui só preparamos a DECISÃO:
 *   - starter                 → require estático (fonte local atual)
 *   - remote + pack ready     → file:// no localDir do pack
 *   - remote sem pack ready   → FALLBACK ao require local (asset ainda no binário no
 *                               F2.1a) → o app NÃO quebra; indica que falta o pack
 *
 * Resolvers SÍNCRONOS e PUROS: recebem o CacheEntry do pack já carregado
 * (`packEntry`, lido de `packStorageService` — async — pelo chamador). Sem storage/rede
 * aqui. Nunca lançam (delegam ao fallback seguro de storyImageService/audioService).
 *
 * Formato de retorno: { status, sourceType, source, reason }.
 */
import { getContentLayer, CONTENT_LAYERS } from '../data/contentManifest';
import { PACK_STATUS } from './packStorageService';
import {
  getOfficialSceneIllustration,
  getSceneColoringImage,
  getStoryCoverImage,
} from './storyImageService';
import { getSceneAudio } from './audioService';

export const RESOLVE_STATUS = Object.freeze({
  INCLUDED: 'included',           // fonte local (starter, ou remote ainda bundlado)
  READY: 'ready',                 // fonte do pack (file://)
  NOT_DOWNLOADED: 'not_downloaded',
  ERROR: 'error',
});

export const RESOLVE_SOURCE_TYPE = Object.freeze({
  REQUIRE: 'require',             // módulo estático (require)
  FILE: 'file',                  // { uri: 'file://...' }
  MISSING: 'missing',
});

const pad2 = (n) => String(n).padStart(2, '0');

/** Camada de conteúdo declarada da história (starter/remote/coming_soon). */
export function getStoryContentLayer(storyId) {
  return getContentLayer(storyId);
}

/** Estado do pack (SÍNCRONO): recebe o packEntry pré-carregado. starter → 'included'. */
export function getPackState(storyId, packEntry = null) {
  if (getContentLayer(storyId) === CONTENT_LAYERS.STARTER) return PACK_STATUS.INCLUDED;
  return (packEntry && packEntry.status) || PACK_STATUS.NOT_DOWNLOADED;
}

/**
 * True se a mídia da história PODE ser resolvida agora: starter, pack ready, ou
 * (transitório F2.1a) o asset ainda no binário como fallback.
 */
export function canResolveStoryMedia(storyId, packEntry = null) {
  if (getContentLayer(storyId) === CONTENT_LAYERS.STARTER) return true;
  if (packEntry && packEntry.status === PACK_STATUS.READY && packEntry.localDir) return true;
  return getOfficialSceneIllustration(storyId, 1) != null || getStoryCoverImage(storyId) != null;
}

/**
 * Decisão central: require local (starter/fallback), file:// do pack (ready), ou missing.
 * @param {*} localSource módulo require local (ou null)
 * @param {string} relPathInPack caminho relativo dentro do pack (ex.: 'cover.webp')
 */
function decide(storyId, localSource, relPathInPack, packEntry) {
  const layer = getContentLayer(storyId);

  if (layer === CONTENT_LAYERS.STARTER) {
    return localSource != null
      ? { status: RESOLVE_STATUS.INCLUDED, sourceType: RESOLVE_SOURCE_TYPE.REQUIRE, source: localSource, reason: 'starter (binário)' }
      : { status: RESOLVE_STATUS.ERROR, sourceType: RESOLVE_SOURCE_TYPE.MISSING, source: null, reason: 'starter sem asset local' };
  }

  // remote com pack pronto → file://
  if (packEntry && packEntry.status === PACK_STATUS.READY && packEntry.localDir && relPathInPack) {
    return { status: RESOLVE_STATUS.READY, sourceType: RESOLVE_SOURCE_TYPE.FILE, source: { uri: packEntry.localDir + relPathInPack }, reason: 'pack ready (file://)' };
  }

  // remote sem pack → FALLBACK ao require local (ainda no binário no F2.1a) → app não quebra
  return localSource != null
    ? { status: RESOLVE_STATUS.NOT_DOWNLOADED, sourceType: RESOLVE_SOURCE_TYPE.REQUIRE, source: localSource, reason: 'remote sem pack — fallback local (ainda no binário, F2.1a)' }
    : { status: RESOLVE_STATUS.NOT_DOWNLOADED, sourceType: RESOLVE_SOURCE_TYPE.MISSING, source: null, reason: 'remote sem pack e sem fallback local' };
}

/** Capa da história. */
export function resolveStoryCover(storyId, packEntry = null) {
  return decide(storyId, getStoryCoverImage(storyId), 'cover.webp', packEntry);
}

/** Cena ilustrada (WebP). sceneNumber = 1..N. */
export function resolveStoryScene(storyId, sceneNumber, packEntry = null) {
  return decide(storyId, getOfficialSceneIllustration(storyId, sceneNumber), `scenes/${storyId}_scene_${pad2(sceneNumber)}.webp`, packEntry);
}

/** Página de colorir (PNG — colorir segue local/PNG por ora). sceneNumber = 1..N. */
export function resolveStoryColoring(storyId, sceneNumber, packEntry = null) {
  return decide(storyId, getSceneColoringImage(storyId, sceneNumber), `coloring/scene_${pad2(sceneNumber)}.png`, packEntry);
}

/** Áudio de narração (MP3). sceneNumber = 1..N. */
export function resolveStoryAudio(storyId, sceneNumber, packEntry = null) {
  const local = getSceneAudio(storyId, `scene_${pad2(sceneNumber)}`);
  return decide(storyId, local, `audio/${storyId}_scene_${pad2(sceneNumber)}.mp3`, packEntry);
}
