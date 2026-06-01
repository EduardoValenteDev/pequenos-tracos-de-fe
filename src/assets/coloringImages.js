/**
 * coloringImages.js — Mapa central de imagens de colorir.
 *
 * Indexado por [storyId][sceneId] — storyId é string (igual a stories.js), sceneId numérico.
 *
 * Todos os require() são literais (Metro Bundler exige estáticos).
 *
 * Pastas normalizadas usadas para evitar problemas com espaços e
 * acentos no Metro Bundler no Windows:
 *   noe          → assets/stories/noe/colorir/
 *   davi_golias  → assets/stories/davi_golias/colorir/
 *   jesus_criancas → assets/stories/jesus_criancas/colorir/
 */

const coloringImages = {

  // ── noah: Noé e o Arco-Íris ────────────────────────────────────────
  noah: {
    1:  require('../../assets/stories/noe/colorir/noe_scene_01_coloring.png'),
    2:  require('../../assets/stories/noe/colorir/noe_scene_02_coloring.png'),
    3:  require('../../assets/stories/noe/colorir/noe_scene_03_coloring.png'),
    4:  require('../../assets/stories/noe/colorir/noe_scene_04_coloring.png'),
    5:  require('../../assets/stories/noe/colorir/noe_scene_05_coloring.png'),
    6:  require('../../assets/stories/noe/colorir/noe_scene_06_coloring.png'),
    7:  require('../../assets/stories/noe/colorir/noe_scene_07_coloring.png'),
    8:  require('../../assets/stories/noe/colorir/noe_scene_08_coloring.png'),
    9:  require('../../assets/stories/noe/colorir/noe_scene_09_coloring.png'),
    10: require('../../assets/stories/noe/colorir/noe_scene_10_coloring.png'),
  },

  // ── david_goliath: Davi e Golias ───────────────────────────────────
  david_goliath: {
    1:  require('../../assets/stories/davi_golias/colorir/davi_scene_01_coloring.png'),
    2:  require('../../assets/stories/davi_golias/colorir/davi_scene_02_coloring.png'),
    3:  require('../../assets/stories/davi_golias/colorir/davi_scene_03_coloring.png'),
    4:  require('../../assets/stories/davi_golias/colorir/davi_scene_04_coloring.png'),
    5:  require('../../assets/stories/davi_golias/colorir/davi_scene_05_coloring.png'),
    6:  require('../../assets/stories/davi_golias/colorir/davi_scene_06_coloring.png'),
    7:  require('../../assets/stories/davi_golias/colorir/davi_scene_07_coloring.png'),
    8:  require('../../assets/stories/davi_golias/colorir/davi_scene_08_coloring.png'),
    9:  require('../../assets/stories/davi_golias/colorir/davi_scene_09_coloring.png'),
    10: require('../../assets/stories/davi_golias/colorir/davi_scene_10_coloring.png'),
  },

  // ── jesus_children: Jesus e as Crianças ───────────────────────────
  jesus_children: {
    1:  require('../../assets/stories/jesus_criancas/colorir/jesus_children_scene_01_coloring.png'),
    2:  require('../../assets/stories/jesus_criancas/colorir/jesus_children_scene_02_coloring.png'),
    3:  require('../../assets/stories/jesus_criancas/colorir/jesus_children_scene_03_coloring.png'),
    4:  require('../../assets/stories/jesus_criancas/colorir/jesus_children_scene_04_coloring.png'),
    5:  require('../../assets/stories/jesus_criancas/colorir/jesus_children_scene_05_coloring.png'),
    6:  require('../../assets/stories/jesus_criancas/colorir/jesus_children_scene_06_coloring.png'),
    7:  require('../../assets/stories/jesus_criancas/colorir/jesus_children_scene_07_coloring.png'),
    8:  require('../../assets/stories/jesus_criancas/colorir/jesus_children_scene_08_coloring.png'),
    9:  require('../../assets/stories/jesus_criancas/colorir/jesus_children_scene_09_coloring.png'),
    10: require('../../assets/stories/jesus_criancas/colorir/jesus_children_scene_10_coloring.png'),
  },

};

/**
 * Retorna a imagem de colorir para uma história + cena, ou null se não disponível.
 * ColoringScreen exibe placeholder quando null é retornado.
 *
 * @param {string} storyId  - story.id de stories.js ('noah', 'david_goliath', 'jesus_children')
 * @param {number} sceneId  - cena.id de stories.js (1–10)
 * @returns {object|null}   - resultado de require() ou null
 */
export function getColoringImage(storyId, sceneId) {
  return coloringImages[storyId]?.[sceneId] ?? null;
}

export default coloringImages;
