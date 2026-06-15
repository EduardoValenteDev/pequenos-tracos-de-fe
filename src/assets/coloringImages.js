/**
 * coloringImages.js — Mapa central de imagens de colorir.
 *
 * Indexado por [storyId][sceneId] — storyId é string (igual a stories.js), sceneId numérico.
 * Todos os require() são literais (Metro Bundler exige estáticos) e apontam para
 * arquivos que EXISTEM fisicamente no disco. Nome padronizado: scene_01.png … scene_10.png.
 *
 * Convenção de pasta por história (igual ao que está salvo em disco):
 *   creation        → assets/stories/creation/coloring/   (pasta em inglês)
 *   noah            → assets/stories/noah/colorir/
 *   david_goliath   → assets/stories/david_goliath/colorir/
 *   jesus_children  → assets/stories/jesus_children/colorir/
 *
 * Histórias sem pacote ativo retornam null em getColoringImage → ColoringScreen
 * exibe o estado de imagem ausente já existente (sem crash, sem tela branca).
 */

const coloringImages = {

  // ── creation: A Criação ──────────────────────────────────────────────────
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

  // ── noah: Noé ────────────────────────────────────────────────────────────
  noah: {
    1:  require('../../assets/stories/noah/colorir/scene_01.png'),
    2:  require('../../assets/stories/noah/colorir/scene_02.png'),
    3:  require('../../assets/stories/noah/colorir/scene_03.png'),
    4:  require('../../assets/stories/noah/colorir/scene_04.png'),
    5:  require('../../assets/stories/noah/colorir/scene_05.png'),
    6:  require('../../assets/stories/noah/colorir/scene_06.png'),
    7:  require('../../assets/stories/noah/colorir/scene_07.png'),
    8:  require('../../assets/stories/noah/colorir/scene_08.png'),
    9:  require('../../assets/stories/noah/colorir/scene_09.png'),
    10: require('../../assets/stories/noah/colorir/scene_10.png'),
  },

  // ── david_goliath: Davi e Golias ─────────────────────────────────────────
  david_goliath: {
    1:  require('../../assets/stories/david_goliath/colorir/scene_01.png'),
    2:  require('../../assets/stories/david_goliath/colorir/scene_02.png'),
    3:  require('../../assets/stories/david_goliath/colorir/scene_03.png'),
    4:  require('../../assets/stories/david_goliath/colorir/scene_04.png'),
    5:  require('../../assets/stories/david_goliath/colorir/scene_05.png'),
    6:  require('../../assets/stories/david_goliath/colorir/scene_06.png'),
    7:  require('../../assets/stories/david_goliath/colorir/scene_07.png'),
    8:  require('../../assets/stories/david_goliath/colorir/scene_08.png'),
    9:  require('../../assets/stories/david_goliath/colorir/scene_09.png'),
    10: require('../../assets/stories/david_goliath/colorir/scene_10.png'),
  },

  // ── jesus_children: Jesus e as Crianças ──────────────────────────────────
  jesus_children: {
    1:  require('../../assets/stories/jesus_children/colorir/scene_01.png'),
    2:  require('../../assets/stories/jesus_children/colorir/scene_02.png'),
    3:  require('../../assets/stories/jesus_children/colorir/scene_03.png'),
    4:  require('../../assets/stories/jesus_children/colorir/scene_04.png'),
    5:  require('../../assets/stories/jesus_children/colorir/scene_05.png'),
    6:  require('../../assets/stories/jesus_children/colorir/scene_06.png'),
    7:  require('../../assets/stories/jesus_children/colorir/scene_07.png'),
    8:  require('../../assets/stories/jesus_children/colorir/scene_08.png'),
    9:  require('../../assets/stories/jesus_children/colorir/scene_09.png'),
    10: require('../../assets/stories/jesus_children/colorir/scene_10.png'),
  },

  // ── daniel_lions: Daniel e os Leões ──────────────────────────────────────
  daniel_lions: {
    1:  require('../../assets/stories/daniel_lions/coloring/scene_01.png'),
    2:  require('../../assets/stories/daniel_lions/coloring/scene_02.png'),
    3:  require('../../assets/stories/daniel_lions/coloring/scene_03.png'),
    4:  require('../../assets/stories/daniel_lions/coloring/scene_04.png'),
    5:  require('../../assets/stories/daniel_lions/coloring/scene_05.png'),
    6:  require('../../assets/stories/daniel_lions/coloring/scene_06.png'),
    7:  require('../../assets/stories/daniel_lions/coloring/scene_07.png'),
    8:  require('../../assets/stories/daniel_lions/coloring/scene_08.png'),
    9:  require('../../assets/stories/daniel_lions/coloring/scene_09.png'),
    10: require('../../assets/stories/daniel_lions/coloring/scene_10.png'),
  },

  // ── jonah_big_fish: Jonas e o Grande Peixe ───────────────────────────────
  jonah_big_fish: {
    1:  require('../../assets/stories/jonah_big_fish/coloring/scene_01.png'),
    2:  require('../../assets/stories/jonah_big_fish/coloring/scene_02.png'),
    3:  require('../../assets/stories/jonah_big_fish/coloring/scene_03.png'),
    4:  require('../../assets/stories/jonah_big_fish/coloring/scene_04.png'),
    5:  require('../../assets/stories/jonah_big_fish/coloring/scene_05.png'),
    6:  require('../../assets/stories/jonah_big_fish/coloring/scene_06.png'),
    7:  require('../../assets/stories/jonah_big_fish/coloring/scene_07.png'),
    8:  require('../../assets/stories/jonah_big_fish/coloring/scene_08.png'),
    9:  require('../../assets/stories/jonah_big_fish/coloring/scene_09.png'),
    10: require('../../assets/stories/jonah_big_fish/coloring/scene_10.png'),
  },

};

/**
 * Retorna a imagem de colorir para uma história + cena, ou null se não disponível.
 * ColoringScreen exibe o estado de imagem ausente quando null é retornado.
 *
 * @param {string} storyId  - story.id de stories.js ('creation','noah','david_goliath','jesus_children')
 * @param {number} sceneId  - cena.id de stories.js (1–10)
 * @returns {object|null}   - resultado de require() ou null
 */
export function getColoringImage(storyId, sceneId) {
  return coloringImages[storyId]?.[sceneId] ?? null;
}

export default coloringImages;
