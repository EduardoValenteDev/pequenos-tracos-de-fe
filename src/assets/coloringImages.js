/**
 * coloringImages.js — Mapa central de imagens de colorir.
 *
 * Indexado por [storyId][sceneId] — storyId é string (igual a stories.js), sceneId numérico.
 * Todos os require() são literais (Metro Bundler exige estáticos) e apontam para
 * arquivos que EXISTEM fisicamente no disco. Nome padronizado: scene_01.png … scene_10.png.
 *
 * Convenção de pasta por história (igual ao que está salvo em disco):
 *   creation        → assets/stories/creation/coloring/   (pasta em inglês)
 *   noah            → assets/stories/noah/coloring/
 *   david_goliath   → assets/stories/david_goliath/coloring/
 *   jesus_children  → assets/stories/jesus_children/coloring/
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
    1:  require('../../assets/stories/noah/coloring/scene_01.png'),
    2:  require('../../assets/stories/noah/coloring/scene_02.png'),
    3:  require('../../assets/stories/noah/coloring/scene_03.png'),
    4:  require('../../assets/stories/noah/coloring/scene_04.png'),
    5:  require('../../assets/stories/noah/coloring/scene_05.png'),
    6:  require('../../assets/stories/noah/coloring/scene_06.png'),
    7:  require('../../assets/stories/noah/coloring/scene_07.png'),
    8:  require('../../assets/stories/noah/coloring/scene_08.png'),
    9:  require('../../assets/stories/noah/coloring/scene_09.png'),
    10: require('../../assets/stories/noah/coloring/scene_10.png'),
  },

  // ── david_goliath: Davi e Golias ─────────────────────────────────────────
  david_goliath: {
    1:  require('../../assets/stories/david_goliath/coloring/scene_01.png'),
    2:  require('../../assets/stories/david_goliath/coloring/scene_02.png'),
    3:  require('../../assets/stories/david_goliath/coloring/scene_03.png'),
    4:  require('../../assets/stories/david_goliath/coloring/scene_04.png'),
    5:  require('../../assets/stories/david_goliath/coloring/scene_05.png'),
    6:  require('../../assets/stories/david_goliath/coloring/scene_06.png'),
    7:  require('../../assets/stories/david_goliath/coloring/scene_07.png'),
    8:  require('../../assets/stories/david_goliath/coloring/scene_08.png'),
    9:  require('../../assets/stories/david_goliath/coloring/scene_09.png'),
    10: require('../../assets/stories/david_goliath/coloring/scene_10.png'),
  },

  // ── jesus_children: Jesus e as Crianças ──────────────────────────────────
  jesus_children: {
    1:  require('../../assets/stories/jesus_children/coloring/scene_01.png'),
    2:  require('../../assets/stories/jesus_children/coloring/scene_02.png'),
    3:  require('../../assets/stories/jesus_children/coloring/scene_03.png'),
    4:  require('../../assets/stories/jesus_children/coloring/scene_04.png'),
    5:  require('../../assets/stories/jesus_children/coloring/scene_05.png'),
    6:  require('../../assets/stories/jesus_children/coloring/scene_06.png'),
    7:  require('../../assets/stories/jesus_children/coloring/scene_07.png'),
    8:  require('../../assets/stories/jesus_children/coloring/scene_08.png'),
    9:  require('../../assets/stories/jesus_children/coloring/scene_09.png'),
    10: require('../../assets/stories/jesus_children/coloring/scene_10.png'),
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

  // ── abraham_stars: Abraão e as Estrelas ──────────────────────────────────
  abraham_stars: {
    1:  require('../../assets/stories/abraham_stars/coloring/scene_01.png'),
    2:  require('../../assets/stories/abraham_stars/coloring/scene_02.png'),
    3:  require('../../assets/stories/abraham_stars/coloring/scene_03.png'),
    4:  require('../../assets/stories/abraham_stars/coloring/scene_04.png'),
    5:  require('../../assets/stories/abraham_stars/coloring/scene_05.png'),
    6:  require('../../assets/stories/abraham_stars/coloring/scene_06.png'),
    7:  require('../../assets/stories/abraham_stars/coloring/scene_07.png'),
    8:  require('../../assets/stories/abraham_stars/coloring/scene_08.png'),
    9:  require('../../assets/stories/abraham_stars/coloring/scene_09.png'),
    10: require('../../assets/stories/abraham_stars/coloring/scene_10.png'),
  },

  // ── good_samaritan: O Bom Samaritano ─────────────────────────────────────
  good_samaritan: {
    1:  require('../../assets/stories/good_samaritan/coloring/scene_01.png'),
    2:  require('../../assets/stories/good_samaritan/coloring/scene_02.png'),
    3:  require('../../assets/stories/good_samaritan/coloring/scene_03.png'),
    4:  require('../../assets/stories/good_samaritan/coloring/scene_04.png'),
    5:  require('../../assets/stories/good_samaritan/coloring/scene_05.png'),
    6:  require('../../assets/stories/good_samaritan/coloring/scene_06.png'),
    7:  require('../../assets/stories/good_samaritan/coloring/scene_07.png'),
    8:  require('../../assets/stories/good_samaritan/coloring/scene_08.png'),
    9:  require('../../assets/stories/good_samaritan/coloring/scene_09.png'),
    10: require('../../assets/stories/good_samaritan/coloring/scene_10.png'),
  },

  // ── lost_sheep: A Ovelha Perdida ─────────────────────────────────────────
  lost_sheep: {
    1:  require('../../assets/stories/lost_sheep/coloring/scene_01.png'),
    2:  require('../../assets/stories/lost_sheep/coloring/scene_02.png'),
    3:  require('../../assets/stories/lost_sheep/coloring/scene_03.png'),
    4:  require('../../assets/stories/lost_sheep/coloring/scene_04.png'),
    5:  require('../../assets/stories/lost_sheep/coloring/scene_05.png'),
    6:  require('../../assets/stories/lost_sheep/coloring/scene_06.png'),
    7:  require('../../assets/stories/lost_sheep/coloring/scene_07.png'),
    8:  require('../../assets/stories/lost_sheep/coloring/scene_08.png'),
    9:  require('../../assets/stories/lost_sheep/coloring/scene_09.png'),
    10: require('../../assets/stories/lost_sheep/coloring/scene_10.png'),
  },

  // ── solomon_wisdom: A Sabedoria de Salomão ───────────────────────────────
  solomon_wisdom: {
    1:  require('../../assets/stories/solomon_wisdom/coloring/scene_01.png'),
    2:  require('../../assets/stories/solomon_wisdom/coloring/scene_02.png'),
    3:  require('../../assets/stories/solomon_wisdom/coloring/scene_03.png'),
    4:  require('../../assets/stories/solomon_wisdom/coloring/scene_04.png'),
    5:  require('../../assets/stories/solomon_wisdom/coloring/scene_05.png'),
    6:  require('../../assets/stories/solomon_wisdom/coloring/scene_06.png'),
    7:  require('../../assets/stories/solomon_wisdom/coloring/scene_07.png'),
    8:  require('../../assets/stories/solomon_wisdom/coloring/scene_08.png'),
    9:  require('../../assets/stories/solomon_wisdom/coloring/scene_09.png'),
    10: require('../../assets/stories/solomon_wisdom/coloring/scene_10.png'),
  },

  // ── timothy_faith: A Fé de Timóteo ───────────────────────────────────────
  timothy_faith: {
    1:  require('../../assets/stories/timothy_faith/coloring/scene_01.png'),
    2:  require('../../assets/stories/timothy_faith/coloring/scene_02.png'),
    3:  require('../../assets/stories/timothy_faith/coloring/scene_03.png'),
    4:  require('../../assets/stories/timothy_faith/coloring/scene_04.png'),
    5:  require('../../assets/stories/timothy_faith/coloring/scene_05.png'),
    6:  require('../../assets/stories/timothy_faith/coloring/scene_06.png'),
    7:  require('../../assets/stories/timothy_faith/coloring/scene_07.png'),
    8:  require('../../assets/stories/timothy_faith/coloring/scene_08.png'),
    9:  require('../../assets/stories/timothy_faith/coloring/scene_09.png'),
    10: require('../../assets/stories/timothy_faith/coloring/scene_10.png'),
  },

  // ── jesus_temple: Jesus no Templo ────────────────────────────────────────
  jesus_temple: {
    1:  require('../../assets/stories/jesus_temple/coloring/scene_01.png'),
    2:  require('../../assets/stories/jesus_temple/coloring/scene_02.png'),
    3:  require('../../assets/stories/jesus_temple/coloring/scene_03.png'),
    4:  require('../../assets/stories/jesus_temple/coloring/scene_04.png'),
    5:  require('../../assets/stories/jesus_temple/coloring/scene_05.png'),
    6:  require('../../assets/stories/jesus_temple/coloring/scene_06.png'),
    7:  require('../../assets/stories/jesus_temple/coloring/scene_07.png'),
    8:  require('../../assets/stories/jesus_temple/coloring/scene_08.png'),
    9:  require('../../assets/stories/jesus_temple/coloring/scene_09.png'),
    10: require('../../assets/stories/jesus_temple/coloring/scene_10.png'),
  },

  // ── esther_queen: Rainha Ester ───────────────────────────────────────────
  esther_queen: {
    1:  require('../../assets/stories/esther_queen/coloring/scene_01.png'),
    2:  require('../../assets/stories/esther_queen/coloring/scene_02.png'),
    3:  require('../../assets/stories/esther_queen/coloring/scene_03.png'),
    4:  require('../../assets/stories/esther_queen/coloring/scene_04.png'),
    5:  require('../../assets/stories/esther_queen/coloring/scene_05.png'),
    6:  require('../../assets/stories/esther_queen/coloring/scene_06.png'),
    7:  require('../../assets/stories/esther_queen/coloring/scene_07.png'),
    8:  require('../../assets/stories/esther_queen/coloring/scene_08.png'),
    9:  require('../../assets/stories/esther_queen/coloring/scene_09.png'),
    10: require('../../assets/stories/esther_queen/coloring/scene_10.png'),
  },

  // ── joseph_colorful_coat: José e a Túnica Colorida ───────────────────────
  joseph_colorful_coat: {
    1:  require('../../assets/stories/joseph_colorful_coat/coloring/scene_01.png'),
    2:  require('../../assets/stories/joseph_colorful_coat/coloring/scene_02.png'),
    3:  require('../../assets/stories/joseph_colorful_coat/coloring/scene_03.png'),
    4:  require('../../assets/stories/joseph_colorful_coat/coloring/scene_04.png'),
    5:  require('../../assets/stories/joseph_colorful_coat/coloring/scene_05.png'),
    6:  require('../../assets/stories/joseph_colorful_coat/coloring/scene_06.png'),
    7:  require('../../assets/stories/joseph_colorful_coat/coloring/scene_07.png'),
    8:  require('../../assets/stories/joseph_colorful_coat/coloring/scene_08.png'),
    9:  require('../../assets/stories/joseph_colorful_coat/coloring/scene_09.png'),
    10: require('../../assets/stories/joseph_colorful_coat/coloring/scene_10.png'),
  },

  // ── moses_red_sea: Moisés e o Mar Vermelho ───────────────────────────────
  moses_red_sea: {
    1:  require('../../assets/stories/moses_red_sea/coloring/scene_01.png'),
    2:  require('../../assets/stories/moses_red_sea/coloring/scene_02.png'),
    3:  require('../../assets/stories/moses_red_sea/coloring/scene_03.png'),
    4:  require('../../assets/stories/moses_red_sea/coloring/scene_04.png'),
    5:  require('../../assets/stories/moses_red_sea/coloring/scene_05.png'),
    6:  require('../../assets/stories/moses_red_sea/coloring/scene_06.png'),
    7:  require('../../assets/stories/moses_red_sea/coloring/scene_07.png'),
    8:  require('../../assets/stories/moses_red_sea/coloring/scene_08.png'),
    9:  require('../../assets/stories/moses_red_sea/coloring/scene_09.png'),
    10: require('../../assets/stories/moses_red_sea/coloring/scene_10.png'),
  },

  // ── ruth_naomi: Rute e Noemi ─────────────────────────────────────────────
  ruth_naomi: {
    1:  require('../../assets/stories/ruth_naomi/coloring/scene_01.png'),
    2:  require('../../assets/stories/ruth_naomi/coloring/scene_02.png'),
    3:  require('../../assets/stories/ruth_naomi/coloring/scene_03.png'),
    4:  require('../../assets/stories/ruth_naomi/coloring/scene_04.png'),
    5:  require('../../assets/stories/ruth_naomi/coloring/scene_05.png'),
    6:  require('../../assets/stories/ruth_naomi/coloring/scene_06.png'),
    7:  require('../../assets/stories/ruth_naomi/coloring/scene_07.png'),
    8:  require('../../assets/stories/ruth_naomi/coloring/scene_08.png'),
    9:  require('../../assets/stories/ruth_naomi/coloring/scene_09.png'),
    10: require('../../assets/stories/ruth_naomi/coloring/scene_10.png'),
  },

  // ── miraculous_catch: A Pesca Milagrosa ──────────────────────────────────
  miraculous_catch: {
    1:  require('../../assets/stories/miraculous_catch/coloring/scene_01.png'),
    2:  require('../../assets/stories/miraculous_catch/coloring/scene_02.png'),
    3:  require('../../assets/stories/miraculous_catch/coloring/scene_03.png'),
    4:  require('../../assets/stories/miraculous_catch/coloring/scene_04.png'),
    5:  require('../../assets/stories/miraculous_catch/coloring/scene_05.png'),
    6:  require('../../assets/stories/miraculous_catch/coloring/scene_06.png'),
    7:  require('../../assets/stories/miraculous_catch/coloring/scene_07.png'),
    8:  require('../../assets/stories/miraculous_catch/coloring/scene_08.png'),
    9:  require('../../assets/stories/miraculous_catch/coloring/scene_09.png'),
    10: require('../../assets/stories/miraculous_catch/coloring/scene_10.png'),
  },

  // ── samuel_hears_god: Samuel Ouve a Deus ─────────────────────────────────
  samuel_hears_god: {
    1:  require('../../assets/stories/samuel_hears_god/coloring/scene_01.png'),
    2:  require('../../assets/stories/samuel_hears_god/coloring/scene_02.png'),
    3:  require('../../assets/stories/samuel_hears_god/coloring/scene_03.png'),
    4:  require('../../assets/stories/samuel_hears_god/coloring/scene_04.png'),
    5:  require('../../assets/stories/samuel_hears_god/coloring/scene_05.png'),
    6:  require('../../assets/stories/samuel_hears_god/coloring/scene_06.png'),
    7:  require('../../assets/stories/samuel_hears_god/coloring/scene_07.png'),
    8:  require('../../assets/stories/samuel_hears_god/coloring/scene_08.png'),
    9:  require('../../assets/stories/samuel_hears_god/coloring/scene_09.png'),
    10: require('../../assets/stories/samuel_hears_god/coloring/scene_10.png'),
  },

  // ── josiah_young_king: Josias, o Jovem Rei ───────────────────────────────
  josiah_young_king: {
    1:  require('../../assets/stories/josiah_young_king/coloring/scene_01.png'),
    2:  require('../../assets/stories/josiah_young_king/coloring/scene_02.png'),
    3:  require('../../assets/stories/josiah_young_king/coloring/scene_03.png'),
    4:  require('../../assets/stories/josiah_young_king/coloring/scene_04.png'),
    5:  require('../../assets/stories/josiah_young_king/coloring/scene_05.png'),
    6:  require('../../assets/stories/josiah_young_king/coloring/scene_06.png'),
    7:  require('../../assets/stories/josiah_young_king/coloring/scene_07.png'),
    8:  require('../../assets/stories/josiah_young_king/coloring/scene_08.png'),
    9:  require('../../assets/stories/josiah_young_king/coloring/scene_09.png'),
    10: require('../../assets/stories/josiah_young_king/coloring/scene_10.png'),
  },

  // ── mary_says_yes: Maria Diz Sim ─────────────────────────────────────────
  mary_says_yes: {
    1:  require('../../assets/stories/mary_says_yes/coloring/scene_01.png'),
    2:  require('../../assets/stories/mary_says_yes/coloring/scene_02.png'),
    3:  require('../../assets/stories/mary_says_yes/coloring/scene_03.png'),
    4:  require('../../assets/stories/mary_says_yes/coloring/scene_04.png'),
    5:  require('../../assets/stories/mary_says_yes/coloring/scene_05.png'),
    6:  require('../../assets/stories/mary_says_yes/coloring/scene_06.png'),
    7:  require('../../assets/stories/mary_says_yes/coloring/scene_07.png'),
    8:  require('../../assets/stories/mary_says_yes/coloring/scene_08.png'),
    9:  require('../../assets/stories/mary_says_yes/coloring/scene_09.png'),
    10: require('../../assets/stories/mary_says_yes/coloring/scene_10.png'),
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

/**
 * IDs de história que possuem PACOTE de colorir (chaves do manifesto). Só leitura —
 * usado pela ferramenta de QA do Criador para enumerar os desenhos.
 */
export function getColoringStoryIds() {
  return Object.keys(coloringImages);
}

/** IDs de cena (ordenados) com imagem de colorir para uma história. Só leitura. */
export function getColoringSceneIds(storyId) {
  const pack = coloringImages[storyId];
  return pack ? Object.keys(pack).map(Number).sort((a, b) => a - b) : [];
}

export default coloringImages;
