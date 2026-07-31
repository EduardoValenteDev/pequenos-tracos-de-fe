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
// [P3J] `getSceneColoringImage` saiu do import: era o único caminho pelo qual este resolvedor
// alcançava os linearts legados. Cena, capa e áudio permanecem intactos.
import {
  getOfficialSceneIllustration,
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

// [P3J] REMOVIDO: `resolveStoryColoring`. Resolvia a página de colorir por cena (require local do
// lineart legado, ou `coloring/scene_NN.png` do pack baixado). Com o Colorir legado aposentado não
// há mais superfície que peça essa mídia, e o require local que ele devolvia deixou de existir
// junto com `coloringImages.js`. O Colorir com o Beni não passa por aqui: resolve suas três
// atividades por `coloring60LocalAssets` (require estático próprio, sem packs).

/** Áudio de narração (MP3). sceneNumber = 1..N. */
export function resolveStoryAudio(storyId, sceneNumber, packEntry = null) {
  const local = getSceneAudio(storyId, `scene_${pad2(sceneNumber)}`);
  return decide(storyId, local, `audio/${storyId}_scene_${pad2(sceneNumber)}.mp3`, packEntry);
}

/**
 * Resolve mídia por TIPO a partir de um packEntry (ADITIVO, F2.1c).
 *
 * Unifica os quatro resolvers atrás de um `mediaKind`, para que um chamador
 * (sandbox de verificação, e no futuro um PacksContext) resolva as 31 mídias de uma
 * história por um único ponto de entrada. NÃO é consumido por telas e NÃO altera o
 * comportamento atual — apenas delega às funções acima, preservando o fallback local
 * (remote sem pack → require local; starter → require).
 *
 * [P3J] `'coloring'` saiu da lista de kinds resolvíveis (o Colorir legado foi aposentado). Um
 * chamador antigo que ainda peça esse kind cai no `default` e recebe um envelope de ERRO explícito
 * — nunca um require quebrado nem um `file://` para arquivo que não é mais baixado.
 *
 * @param {string} mediaKind 'cover' | 'scene' | 'audio'
 * @param {number|null} sceneNumber 1..N (ignorado para 'cover')
 * @returns {{status:string, sourceType:string, source:*, reason:string}}
 */
export function resolveStoryMediaFromPackEntry(storyId, mediaKind, sceneNumber = null, packEntry = null) {
  switch (mediaKind) {
    case 'cover': return resolveStoryCover(storyId, packEntry);
    case 'scene': return resolveStoryScene(storyId, sceneNumber, packEntry);
    case 'audio': return resolveStoryAudio(storyId, sceneNumber, packEntry);
    default:
      return { status: RESOLVE_STATUS.ERROR, sourceType: RESOLVE_SOURCE_TYPE.MISSING, source: null, reason: `mediaKind inválido: ${mediaKind}` };
  }
}

/**
 * Camada de resolução de mídia POR HISTÓRIA (ADITIVO, F2.1e).
 *
 * Resolve o CONJUNTO de mídias de uma história de uma vez (capa + N cenas + N áudios),
 * consultando o estado do pack (`packEntry`, vindo do PacksContext) para
 * decidir pack `ready` (file://) ou FALLBACK LOCAL (require no binário). Construída
 * sobre os resolvers per-item acima — não os substitui.
 *
 * PURA e READ-ONLY: não escreve no índice, não baixa, não instala; não toca progresso,
 * acesso/entitlement nem compras. Nunca lança. NÃO é consumida por telas ainda (F2.1e).
 * Inicialmente `david_goliath` é o único com pack sandbox; o fallback local vale para
 * TODAS as histórias (sem pack `ready` → require).
 *
 * [P3J] O conjunto perdeu a dimensão `coloring`: os linearts legados não existem mais no binário
 * nem são pedidos no download. Capa, cenas e áudios seguem exatamente como estavam.
 *
 * @param {string} storyId
 * @param {{ packEntry?: object|null, sceneCount?: number }} [options]
 * @returns {{ storyId, layer, packStatus, usesPack, cover, scenes:Array, audio:Array }}
 */
export function resolveStoryMedia(storyId, options = {}) {
  const packEntry = options.packEntry || null;
  const sceneCount = Number.isInteger(options.sceneCount) && options.sceneCount > 0 ? options.sceneCount : 0;
  const layer = getContentLayer(storyId);
  const packStatus = getPackState(storyId, packEntry);

  const cover = resolveStoryCover(storyId, packEntry);
  const scenes = [];
  const audio = [];
  for (let n = 1; n <= sceneCount; n += 1) {
    scenes.push(resolveStoryScene(storyId, n, packEntry));
    audio.push(resolveStoryAudio(storyId, n, packEntry));
  }
  const usesPack = [cover, ...scenes, ...audio].some((r) => r.sourceType === RESOLVE_SOURCE_TYPE.FILE);

  return { storyId, layer, packStatus, usesPack, cover, scenes, audio };
}
