/**
 * storyImageService.js — Resolução central de imagens da história.
 *
 * Centraliza, com fallback seguro, as três fontes visuais:
 *   1. official scene illustration  — ilustração oficial da cena (aventura)
 *   2. coloring image               — desenho para colorir (Ateliê)
 *   3. story cover                  — capa da história
 *
 * E prepara a página do livrinho futuro (book page image), que prioriza a
 * arte da criança (child art) quando existir.
 *
 * REGRAS: sem require dinâmico, sem caminho por string, sem URL/fetch, sem
 * import de asset inexistente. Nunca quebra com storyId/sceneId inválidos.
 */
import { getSceneIllustrationAsset, STORY_SCENE_ILLUSTRATIONS } from '../data/storySceneIllustrations';
import { getColoringImage } from '../assets/coloringImages';
import { getStoryCover } from '../assets/storyCovers';
import { Asset } from 'expo-asset';

/** Ilustração oficial da cena (ou null se ainda não existir). */
export function getOfficialSceneIllustration(storyId, sceneId) {
  try {
    return getSceneIllustrationAsset(storyId, sceneId);
  } catch {
    return null;
  }
}

/** Imagem de colorir da cena (manifest atual), ou null. */
export function getSceneColoringImage(storyId, sceneId) {
  try {
    return getColoringImage(storyId, sceneId) ?? null;
  } catch {
    return null;
  }
}

/** Capa oficial da história, ou null. */
export function getStoryCoverImage(storyId) {
  try {
    return getStoryCover(storyId) ?? null;
  } catch {
    return null;
  }
}

/**
 * Melhor visual disponível para uma cena na aventura.
 *   1. ilustração oficial da cena (se existir)
 *   2. capa da história (fallback)
 *   3. null (a tela usa seu fallback interno: "Cena especial")
 */
export function getBestSceneVisual(storyId, sceneId) {
  return (
    getOfficialSceneIllustration(storyId, sceneId) ??
    getStoryCoverImage(storyId) ??
    null
  );
}

/**
 * Fonte de imagem para a página do livrinho (book page image) — FUTURO.
 * Prioridade:
 *   1. arte da criança (child art): previewBase64 / uri / data URL
 *   2. ilustração oficial da cena
 *   3. capa da história
 *   4. null
 *
 * @param {{ storyId:string, sceneId:number, childArt?:any }} params
 * @returns {{uri:string}|number|null} source pronto para <Image> ou null
 */
export function getBookPageImageSource({ storyId, sceneId, childArt } = {}) {
  // 1. Arte da criança
  if (childArt) {
    if (typeof childArt === 'string' && childArt.length > 0) return { uri: childArt };
    if (childArt.previewBase64) return { uri: childArt.previewBase64 };
    if (childArt.thumbnailBase64) return { uri: childArt.thumbnailBase64 };
    if (childArt.uri) return { uri: childArt.uri };
  }
  // 2. Ilustração oficial → 3. capa → 4. null
  return getBestSceneVisual(storyId, sceneId);
}

/**
 * getBestStoryBookVisual — fonte de imagem para a página do livrinho.
 *
 * Formaliza o nome que a Sprint 4.1 vai usar. A regra (prioridade) é:
 *   1. arte da criança (child art), quando existir;
 *   2. ilustração oficial da cena;
 *   3. capa da história (fallback de ambientação);
 *   4. null (a tela usa seu fallback interno).
 *
 * Hoje delega para getBookPageImageSource (mesma lógica). A integração real no
 * livrinho será feita na Sprint 4.1 — aqui só garantimos a base/assinatura.
 *
 * @param {string} storyId
 * @param {number} sceneId — cena.id
 * @param {*} [childArt] — arte salva da criança (opcional)
 * @returns {{uri:string}|number|null}
 */
export function getBestStoryBookVisual(storyId, sceneId, childArt = null) {
  return getBookPageImageSource({ storyId, sceneId, childArt });
}

/**
 * Pré-carrega APENAS as ilustrações oficiais existentes de uma história.
 * Ignora null, usa Promise.allSettled, nunca trava o app. Não é chamada
 * globalmente enquanto não houver artes oficiais.
 * @param {string} storyId
 * @returns {Promise<{total:number, ok:number}>}
 */
export function preloadStorySceneIllustrations(storyId) {
  const map = STORY_SCENE_ILLUSTRATIONS?.[storyId] ?? {};
  const assets = Object.values(map).filter(Boolean);
  if (assets.length === 0) return Promise.resolve({ total: 0, ok: 0 });
  return Promise.allSettled(
    assets.map(a => Asset.fromModule(a).downloadAsync()),
  ).then(results => ({
    total: results.length,
    ok: results.filter(r => r.status === 'fulfilled').length,
  }));
}
