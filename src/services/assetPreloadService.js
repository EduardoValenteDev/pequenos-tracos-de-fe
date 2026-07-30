/**
 * assetPreloadService.js — Pré-carregamento de assets locais críticos.
 *
 * Aquece o cache de imagens (capas das histórias + mascote Beni) no início do
 * app para que Home, Aventuras, StoryDetail e Ateliê exibam as imagens de forma
 * instantânea ou quase instantânea.
 *
 * Resiliente: se um asset falhar, não quebra o app (Promise.allSettled).
 * Idempotente: cache em memória evita pré-carregar o mesmo conjunto duas vezes.
 *
 * Não pré-carrega imagens de colorir, cenas internas nem áudio (fora do escopo).
 *
 * Isso inclui as 5 poses do "Colorir com o Beni": elas moram em BENI_IMAGES, mas ficam
 * FORA de BENI_ASSET_LIST (ver BENI_COLORING60_IMAGE_LIST em mascot/beniImages.js). Só
 * aparecem depois de a criança concluir uma atividade, então aquecê-las no boot custaria
 * 4.287.389 bytes por assets que talvez nunca sejam exibidos. Quem for mostrar o overlay
 * de conclusão é que deve aquecer a lista escopada — não reintroduza-as aqui.
 */
import { Asset } from 'expo-asset';
import { STORY_COVERS } from '../assets/storyCovers';
import { BENI_ASSET_LIST } from '../assets/beniAssets';

const PRELOAD_TIMEOUT_MS = 2500;

// Cache em memória — evita disparar o mesmo preload várias vezes.
let preloadPromise = null;
let preloadCompleted = false;

/**
 * Pré-carrega uma lista de módulos de imagem (require estático).
 * @param {Array<*>} list
 * @returns {Promise<{total:number, ok:number, failed:number}>}
 */
function preloadModules(list) {
  const unique = Array.from(new Set((list || []).filter(Boolean)));
  return Promise.allSettled(
    unique.map((assetModule) => Asset.fromModule(assetModule).downloadAsync()),
  ).then((results) => {
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - ok;
    if (failed > 0 && typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(`[assetPreload] ${failed}/${results.length} asset(s) falharam ao pré-carregar.`);
    }
    return { total: results.length, ok, failed };
  });
}

/** Pré-carrega todas as capas de histórias (STORY_COVERS). */
export function preloadStoryCoverAssets() {
  return preloadModules(Object.values(STORY_COVERS));
}

/** Pré-carrega os assets de imagem do mascote Beni. */
export function preloadBeniAssets() {
  return preloadModules(BENI_ASSET_LIST);
}

/**
 * Pré-carrega o conjunto crítico (Beni + todas as capas), uma única vez.
 * Resolve dentro de PRELOAD_TIMEOUT_MS mesmo que algum download demore — os
 * downloads restantes continuam em background sem prender a UI.
 * @returns {Promise<{total:number, ok:number, failed:number, timedOut?:boolean}>}
 */
export function preloadCriticalAssets() {
  if (preloadPromise) return preloadPromise;

  const criticalList = [...BENI_ASSET_LIST, ...Object.values(STORY_COVERS)];

  const work = preloadModules(criticalList).then((summary) => {
    preloadCompleted = true;
    return summary;
  });

  // Garante settle em até PRELOAD_TIMEOUT_MS (não prende a navegação).
  const guarded = Promise.race([
    work,
    new Promise((resolve) =>
      setTimeout(() => resolve({ total: criticalList.length, ok: 0, failed: 0, timedOut: true }), PRELOAD_TIMEOUT_MS),
    ),
  ]);

  preloadPromise = guarded;
  return guarded;
}

/** True se o preload crítico já terminou (downloads concluídos). */
export function isPreloadCompleted() {
  return preloadCompleted;
}
