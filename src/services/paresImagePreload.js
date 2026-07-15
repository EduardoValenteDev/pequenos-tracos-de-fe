/**
 * paresImagePreload.js — Pré-carregamento das capas de UMA rodada do Pares (R2A · §2).
 *
 * As faces das cartas são as capas das histórias (require estático). Num require, a
 * imagem existe no bundle, mas a TEXTURA só é decodificada/enviada à GPU no primeiro
 * desenho — o que pode causar um "pop" de 1 frame. O R2A pede que a criança NÃO vire
 * uma carta cuja imagem ainda não está pronta; enquanto a rodada carrega, a tela mostra
 * "Beni está preparando as cartas...".
 *
 * Aqui só se AQUECE o cache (expo-asset), como `assetPreloadService` faz no boot — as
 * capas costumam já estar quentes. Idempotente (Set em memória de ids prontos) e
 * resiliente: um asset que falhe/demore não trava o jogo (há fallback na carta e um
 * teto de tempo). Não é núcleo puro (usa I/O): o smoke só confere sua existência.
 */
import { Asset } from 'expo-asset';
import { getStoryCoverImage } from './storyImageService';

/** Ids cujas capas já foram decodificadas nesta sessão. Repetir uma rodada é instantâneo. */
const prontos = new Set();

/** Teto de espera: passado ele, libera as cartas mesmo assim (a carta tem fallback). */
export const PRELOAD_TIMEOUT_MS = 2200;

/**
 * True se TODAS as capas destes ids já estão prontas (ou não têm capa — nada a decodificar).
 * @param {string[]} storyIds
 */
export function coversReady(storyIds) {
  return (storyIds || []).every((id) => prontos.has(id) || !getStoryCoverImage(id));
}

/** Ids distintos de um baralho (`[{storyId}]`). Fonte única para a tela não repetir a lógica. */
export function deckStoryIds(deck) {
  return Array.from(new Set((deck || []).map((c) => c && c.storyId).filter(Boolean)));
}

/**
 * Aquece as capas de uma rodada. Resolve quando todas decodificam OU quando o teto de
 * tempo estoura — o que vier primeiro. Nunca lança.
 * @param {string[]} storyIds
 * @param {{timeoutMs?:number}} [opts]
 * @returns {Promise<{ready:boolean}>}
 */
export async function preloadCovers(storyIds, opts = {}) {
  const ids = Array.from(new Set((storyIds || []).filter(Boolean)));
  const pendentes = ids.filter((id) => !prontos.has(id) && !!getStoryCoverImage(id));
  if (!pendentes.length) return { ready: coversReady(ids) };

  const timeoutMs = Number.isFinite(Number(opts.timeoutMs)) ? Number(opts.timeoutMs) : PRELOAD_TIMEOUT_MS;

  const work = Promise.allSettled(
    pendentes.map(async (id) => {
      const cover = getStoryCoverImage(id);
      if (!cover) return;
      await Asset.fromModule(cover).downloadAsync();
      prontos.add(id);
    }),
  );

  // Não prende o jogo: passado o teto, segue (as que faltarem terminam em background).
  await Promise.race([
    work,
    new Promise((resolve) => setTimeout(resolve, Math.max(0, timeoutMs))),
  ]);

  return { ready: coversReady(ids) };
}

export default preloadCovers;
