/**
 * mediaReadyService.js — Regra central de "mídia pronta" por história.
 *
 * Objetivo (Sprint B1): impedir que histórias sem mídia suficiente apareçam
 * como jogáveis. Histórias "só capa" (ou com mídia incompleta para o fluxo
 * narrado) devem mostrar selo "Em breve" e NÃO abrir o player vazio.
 *
 * Fonte de verdade = o MANIFESTO de ilustrações de cena (STORY_SCENE_ILLUSTRATIONS),
 * já validado contra o disco pelos testes A1. Nada de lista manual frágil:
 * a disponibilidade é DERIVADA do que está registrado no manifesto.
 *
 * Definição mínima de jogável no MVP:
 *   - Precisa de uma ILUSTRAÇÃO DE CENA para CADA cena prometida (totalCenas).
 *     Sem isso, o player cairia em fundo/gradiente vazio — exatamente o que
 *     este bloco evita.
 *   - Áudio NÃO é exigido: o produto aceita narração pendente comunicada
 *     (hoje só A Criação tem áudio real; bloquear por áudio derrubaria tudo).
 *   - Colorir NÃO é exigido: é bônus. (Hoje só noah/david/jesus têm colorir;
 *     exigir derrubaria a vitrine grátis A Criação, que é narrada e ilustrada.)
 *
 * Exceção documentada — A Criação: é vitrine grátis, narrada e com 10
 * ilustrações + 10 áudios, porém ainda SEM imagens de colorir. Pela regra acima
 * ela é mediaReady=true (jogável como história narrada). Colorir continua sendo
 * um extra que pode chegar depois sem bloquear a experiência.
 */

import { STORY_SCENE_ILLUSTRATIONS } from '../data/storySceneIllustrations';

/**
 * Flag INTERNA de QA — NÃO é o Modo Criador visual.
 * Em produção deve ser false. Quando true, só para QA interna, permite abrir
 * histórias sem mídia para inspeção. O Modo Criador visual jamais destrava
 * história sem mídia: apenas esta flag, explícita e separada, faz isso.
 */
export const QA_ALLOW_INCOMPLETE_STORIES = false;

/** Quantidade de ilustrações de cena registradas no manifesto para a história. */
export function getStorySceneIllustrationCount(storyId) {
  const map = STORY_SCENE_ILLUSTRATIONS && STORY_SCENE_ILLUSTRATIONS[storyId];
  if (!map || typeof map !== 'object') return 0;
  return Object.keys(map).length;
}

/**
 * Status de mídia de uma história (objeto rico para UI e auditoria).
 *
 * @param {object} story — item de stories.js
 * @returns {{
 *   storyId: string|null, mediaReady: boolean, sceneIllustrations: number,
 *   expectedScenes: number, hasAnyScene: boolean, reason: string
 * }}
 */
export function getStoryMediaStatus(story) {
  if (!story || !story.id) {
    return {
      storyId: null, mediaReady: false, sceneIllustrations: 0,
      expectedScenes: 0, hasAnyScene: false, reason: 'no_story',
    };
  }
  const expectedScenes = (typeof story.totalCenas === 'number' && story.totalCenas > 0)
    ? story.totalCenas
    : (Array.isArray(story.cenas) ? story.cenas.length : 0);
  const sceneIllustrations = getStorySceneIllustrationCount(story.id);
  const hasAnyScene = sceneIllustrations > 0;
  const enough = expectedScenes > 0 && sceneIllustrations >= expectedScenes;
  return {
    storyId: story.id,
    mediaReady: enough,
    sceneIllustrations,
    expectedScenes,
    hasAnyScene,
    reason: enough ? 'ready' : (hasAnyScene ? 'insufficient_scene_media' : 'cover_only'),
  };
}

/** True se a história tem mídia suficiente para o fluxo narrado do MVP. */
export function isStoryMediaReady(story) {
  return getStoryMediaStatus(story).mediaReady;
}

/** True se a história deve mostrar selo "Em breve" por falta de mídia. */
export function isStoryComingSoonByMedia(story) {
  return !isStoryMediaReady(story);
}

/**
 * Pode abrir o fluxo jogável do ponto de vista de MÍDIA?
 * Mídia pronta OU flag QA interna explícita. O Modo Criador visual não conta.
 */
export function canOpenStoryMedia(story) {
  return isStoryMediaReady(story) || QA_ALLOW_INCOMPLETE_STORIES;
}
