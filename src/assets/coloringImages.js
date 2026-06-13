/**
 * coloringImages.js — Mapa central de imagens de colorir.
 *
 * Indexado por [storyId][sceneId] — storyId é string (igual a stories.js), sceneId numérico.
 * Todos os require() são literais (Metro Bundler exige estáticos).
 *
 * TESTE TEMPORÁRIO: apenas a história `creation` tem pacote de colorir ATIVO.
 * As imagens estão em assets/stories/creation/coloring/ no formato 16:9
 * (scene_01.png … scene_10.png) — novo padrão temporário em teste.
 * NÃO converter para 4:5 nem redimensionar.
 *
 * Histórias sem pacote ativo (ex.: noah, david_goliath, jesus_children) retornam
 * null em getColoringImage → ColoringScreen exibe o estado de imagem ausente já
 * existente (sem crash, sem tela branca, sem fallback indevido).
 */

const coloringImages = {

  // ── creation: A Criação (pacote de colorir em teste — formato 16:9) ──────
  creation: {
    1:  require('../../assets/stories/creation/coloring/scene_01.png'),
    2:  require('../../assets/stories/creation/coloring/scene_02.png'),
    3:  require('../../assets/stories/creation/coloring/scene_03.png'),
    4:  require('../../assets/stories/creation/coloring/scene_04.png'),
    5:  require('../../assets/stories/creation/coloring/scene_05.png'),
    6:  require('../../assets/stories/creation/coloring/scene_06.png'),
    7:  require('../../assets/stories/creation/coloring/scene_07.png'),
    8:  require('../../assets/stories/creation/coloring/scene_08.png'),
    9:  require('../../assets/stories/creation/coloring/scene_09.png'),
    10: require('../../assets/stories/creation/coloring/scene_10.png'),
  },

};

/**
 * Retorna a imagem de colorir para uma história + cena, ou null se não disponível.
 * ColoringScreen exibe o estado de imagem ausente quando null é retornado.
 *
 * @param {string} storyId  - story.id de stories.js (ativo no teste: 'creation')
 * @param {number} sceneId  - cena.id de stories.js (1–10)
 * @returns {object|null}   - resultado de require() ou null
 */
export function getColoringImage(storyId, sceneId) {
  return coloringImages[storyId]?.[sceneId] ?? null;
}

export default coloringImages;
