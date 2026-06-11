/**
 * storySceneIllustrations.js — Manifesto OFICIAL das ilustrações de cena.
 *
 * Fonte única de verdade para as ilustrações oficiais (uma por cena) usadas na
 * aventura (NarrationScreen / StorySceneVisual). Até 10 cenas por história,
 * 20 histórias = até 200 ilustrações.
 *
 * Indexado por [storyId][sceneId]:
 *   - storyId: string, idêntico ao id em stories.js (ex: 'creation', 'noah').
 *   - sceneId: número da cena (cena.id, 1..N).
 *
 * ── PADRÃO OFICIAL DE PASTAS E NOMES ──
 *   Pasta:  assets/stories/<storyId>/scenes/
 *   Nome:   <storyId>_scene_NN.png   (NN = 01..10, com zero à esquerda)
 *   Ex:     assets/stories/creation/scenes/creation_scene_01.png
 *           assets/stories/noah/scenes/noah_scene_01.png
 *
 * ── COMO REGISTRAR UMA IMAGEM ──
 *   Quando o arquivo existir no disco, adicione um require() ESTÁTICO no mapa
 *   da história, com a chave igual ao número da cena. Exemplo:
 *
 *     creation: {
 *       1: require('../../assets/stories/creation/scenes/creation_scene_01.png'),
 *       2: require('../../assets/stories/creation/scenes/creation_scene_02.png'),
 *     },
 *
 * ── REGRAS ──
 *   - NÃO criar require para arquivo inexistente (quebra o bundler).
 *   - NÃO montar caminho por string nem usar require dinâmico.
 *   - NÃO usar imagens de colorir nem capas como ilustração oficial.
 *   - Cena sem arte → ausente no mapa → resolve para null (a tela usa o
 *     fallback de ambientação, sem quebrar).
 */

/** Padrão oficial — referência para guia e auditoria. */
export const SCENE_ILLUSTRATION_PATTERN = {
  folder: 'assets/stories/<storyId>/scenes/',
  fileName: '<storyId>_scene_NN.png',
  scenesPerStory: 10,
  example: 'assets/stories/creation/scenes/creation_scene_01.png',
};

/**
 * Mapa storyId → { sceneId: require(...) }.
 * Hoje vazio (artes oficiais ainda não existem). Preencher conforme as imagens
 * forem entregues, seguindo o padrão acima.
 */
export const STORY_SCENE_ILLUSTRATIONS = {
  creation: {
    1: require('../../assets/stories/creation/scenes/creation_scene_01.png'),
    2: require('../../assets/stories/creation/scenes/creation_scene_02.png'),
    3: require('../../assets/stories/creation/scenes/creation_scene_03.png'),
    4: require('../../assets/stories/creation/scenes/creation_scene_04.png'),
    5: require('../../assets/stories/creation/scenes/creation_scene_05.png'),
    6: require('../../assets/stories/creation/scenes/creation_scene_06.png'),
    7: require('../../assets/stories/creation/scenes/creation_scene_07.png'),
    8: require('../../assets/stories/creation/scenes/creation_scene_08.png'),
    9: require('../../assets/stories/creation/scenes/creation_scene_09.png'),
    10: require('../../assets/stories/creation/scenes/creation_scene_10.png'),
  },
  noah: {
    1: require('../../assets/stories/noah/scenes/noah_scene_01.png'),
    2: require('../../assets/stories/noah/scenes/noah_scene_02.png'),
    3: require('../../assets/stories/noah/scenes/noah_scene_03.png'),
    4: require('../../assets/stories/noah/scenes/noah_scene_04.png'),
    5: require('../../assets/stories/noah/scenes/noah_scene_05.png'),
    6: require('../../assets/stories/noah/scenes/noah_scene_06.png'),
    7: require('../../assets/stories/noah/scenes/noah_scene_07.png'),
    8: require('../../assets/stories/noah/scenes/noah_scene_08.png'),
    9: require('../../assets/stories/noah/scenes/noah_scene_09.png'),
    10: require('../../assets/stories/noah/scenes/noah_scene_10.png'),
  },
  david_goliath: {
    1: require('../../assets/stories/david_goliath/scenes/david_goliath_scene_01.png'),
    2: require('../../assets/stories/david_goliath/scenes/david_goliath_scene_02.png'),
    3: require('../../assets/stories/david_goliath/scenes/david_goliath_scene_03.png'),
    4: require('../../assets/stories/david_goliath/scenes/david_goliath_scene_04.png'),
    5: require('../../assets/stories/david_goliath/scenes/david_goliath_scene_05.png'),
    6: require('../../assets/stories/david_goliath/scenes/david_goliath_scene_06.png'),
    7: require('../../assets/stories/david_goliath/scenes/david_goliath_scene_07.png'),
    8: require('../../assets/stories/david_goliath/scenes/david_goliath_scene_08.png'),
    9: require('../../assets/stories/david_goliath/scenes/david_goliath_scene_09.png'),
    10: require('../../assets/stories/david_goliath/scenes/david_goliath_scene_10.png'),
  },
  jesus_children: {
    1: require('../../assets/stories/jesus_children/scenes/jesus_children_scene_01.png'),
    2: require('../../assets/stories/jesus_children/scenes/jesus_children_scene_02.png'),
    3: require('../../assets/stories/jesus_children/scenes/jesus_children_scene_03.png'),
    4: require('../../assets/stories/jesus_children/scenes/jesus_children_scene_04.png'),
    5: require('../../assets/stories/jesus_children/scenes/jesus_children_scene_05.png'),
    6: require('../../assets/stories/jesus_children/scenes/jesus_children_scene_06.png'),
    7: require('../../assets/stories/jesus_children/scenes/jesus_children_scene_07.png'),
    8: require('../../assets/stories/jesus_children/scenes/jesus_children_scene_08.png'),
    9: require('../../assets/stories/jesus_children/scenes/jesus_children_scene_09.png'),
    10: require('../../assets/stories/jesus_children/scenes/jesus_children_scene_10.png'),
  },
  daniel_lions: {
    1: require('../../assets/stories/daniel_lions/scenes/daniel_lions_scene_01.png'),
    2: require('../../assets/stories/daniel_lions/scenes/daniel_lions_scene_02.png'),
    3: require('../../assets/stories/daniel_lions/scenes/daniel_lions_scene_03.png'),
    4: require('../../assets/stories/daniel_lions/scenes/daniel_lions_scene_04.png'),
    5: require('../../assets/stories/daniel_lions/scenes/daniel_lions_scene_05.png'),
    6: require('../../assets/stories/daniel_lions/scenes/daniel_lions_scene_06.png'),
    7: require('../../assets/stories/daniel_lions/scenes/daniel_lions_scene_07.png'),
    8: require('../../assets/stories/daniel_lions/scenes/daniel_lions_scene_08.png'),
    9: require('../../assets/stories/daniel_lions/scenes/daniel_lions_scene_09.png'),
    10: require('../../assets/stories/daniel_lions/scenes/daniel_lions_scene_10.png'),
  },
  jonah_big_fish: {
    1: require('../../assets/stories/jonah_big_fish/scenes/jonah_big_fish_scene_01.png'),
    2: require('../../assets/stories/jonah_big_fish/scenes/jonah_big_fish_scene_02.png'),
    3: require('../../assets/stories/jonah_big_fish/scenes/jonah_big_fish_scene_03.png'),
    4: require('../../assets/stories/jonah_big_fish/scenes/jonah_big_fish_scene_04.png'),
    5: require('../../assets/stories/jonah_big_fish/scenes/jonah_big_fish_scene_05.png'),
    6: require('../../assets/stories/jonah_big_fish/scenes/jonah_big_fish_scene_06.png'),
    7: require('../../assets/stories/jonah_big_fish/scenes/jonah_big_fish_scene_07.png'),
    8: require('../../assets/stories/jonah_big_fish/scenes/jonah_big_fish_scene_08.png'),
    9: require('../../assets/stories/jonah_big_fish/scenes/jonah_big_fish_scene_09.png'),
    10: require('../../assets/stories/jonah_big_fish/scenes/jonah_big_fish_scene_10.png'),
  },
  lost_sheep: {
    1: require('../../assets/stories/lost_sheep/scenes/lost_sheep_scene_01.png'),
    2: require('../../assets/stories/lost_sheep/scenes/lost_sheep_scene_02.png'),
    3: require('../../assets/stories/lost_sheep/scenes/lost_sheep_scene_03.png'),
    4: require('../../assets/stories/lost_sheep/scenes/lost_sheep_scene_04.png'),
    5: require('../../assets/stories/lost_sheep/scenes/lost_sheep_scene_05.png'),
    6: require('../../assets/stories/lost_sheep/scenes/lost_sheep_scene_06.png'),
    7: require('../../assets/stories/lost_sheep/scenes/lost_sheep_scene_07.png'),
    8: require('../../assets/stories/lost_sheep/scenes/lost_sheep_scene_08.png'),
    9: require('../../assets/stories/lost_sheep/scenes/lost_sheep_scene_09.png'),
    10: require('../../assets/stories/lost_sheep/scenes/lost_sheep_scene_10.png'),
  },
  good_samaritan: {
    1: require('../../assets/stories/good_samaritan/scenes/good_samaritan_scene_01.png'),
    2: require('../../assets/stories/good_samaritan/scenes/good_samaritan_scene_02.png'),
    3: require('../../assets/stories/good_samaritan/scenes/good_samaritan_scene_03.png'),
    4: require('../../assets/stories/good_samaritan/scenes/good_samaritan_scene_04.png'),
    5: require('../../assets/stories/good_samaritan/scenes/good_samaritan_scene_05.png'),
    6: require('../../assets/stories/good_samaritan/scenes/good_samaritan_scene_06.png'),
    7: require('../../assets/stories/good_samaritan/scenes/good_samaritan_scene_07.png'),
    8: require('../../assets/stories/good_samaritan/scenes/good_samaritan_scene_08.png'),
    9: require('../../assets/stories/good_samaritan/scenes/good_samaritan_scene_09.png'),
    10: require('../../assets/stories/good_samaritan/scenes/good_samaritan_scene_10.png'),
  },
  abraham_stars: {
    1: require('../../assets/stories/abraham_stars/scenes/abraham_stars_scene_01.png'),
    2: require('../../assets/stories/abraham_stars/scenes/abraham_stars_scene_02.png'),
    3: require('../../assets/stories/abraham_stars/scenes/abraham_stars_scene_03.png'),
    4: require('../../assets/stories/abraham_stars/scenes/abraham_stars_scene_04.png'),
    5: require('../../assets/stories/abraham_stars/scenes/abraham_stars_scene_05.png'),
    6: require('../../assets/stories/abraham_stars/scenes/abraham_stars_scene_06.png'),
    7: require('../../assets/stories/abraham_stars/scenes/abraham_stars_scene_07.png'),
    8: require('../../assets/stories/abraham_stars/scenes/abraham_stars_scene_08.png'),
    9: require('../../assets/stories/abraham_stars/scenes/abraham_stars_scene_09.png'),
    10: require('../../assets/stories/abraham_stars/scenes/abraham_stars_scene_10.png'),
  },
  // storyId 'joseph_colorful_coat' (igual a stories.js e ao áudio); a pasta de
  // assets entregue é 'joseph_tunic' — o slug da história continua o oficial.
  joseph_colorful_coat: {
    1: require('../../assets/stories/joseph_tunic/scenes/joseph_tunic_scene_01.png'),
    2: require('../../assets/stories/joseph_tunic/scenes/joseph_tunic_scene_02.png'),
    3: require('../../assets/stories/joseph_tunic/scenes/joseph_tunic_scene_03.png'),
    4: require('../../assets/stories/joseph_tunic/scenes/joseph_tunic_scene_04.png'),
    5: require('../../assets/stories/joseph_tunic/scenes/joseph_tunic_scene_05.png'),
    6: require('../../assets/stories/joseph_tunic/scenes/joseph_tunic_scene_06.png'),
    7: require('../../assets/stories/joseph_tunic/scenes/joseph_tunic_scene_07.png'),
    8: require('../../assets/stories/joseph_tunic/scenes/joseph_tunic_scene_08.png'),
    9: require('../../assets/stories/joseph_tunic/scenes/joseph_tunic_scene_09.png'),
    10: require('../../assets/stories/joseph_tunic/scenes/joseph_tunic_scene_10.png'),
  },
  moses_red_sea: {
    1: require('../../assets/stories/moses_red_sea/scenes/moses_red_sea_scene_01.png'),
    2: require('../../assets/stories/moses_red_sea/scenes/moses_red_sea_scene_02.png'),
    3: require('../../assets/stories/moses_red_sea/scenes/moses_red_sea_scene_03.png'),
    4: require('../../assets/stories/moses_red_sea/scenes/moses_red_sea_scene_04.png'),
    5: require('../../assets/stories/moses_red_sea/scenes/moses_red_sea_scene_05.png'),
    6: require('../../assets/stories/moses_red_sea/scenes/moses_red_sea_scene_06.png'),
    7: require('../../assets/stories/moses_red_sea/scenes/moses_red_sea_scene_07.png'),
    8: require('../../assets/stories/moses_red_sea/scenes/moses_red_sea_scene_08.png'),
    9: require('../../assets/stories/moses_red_sea/scenes/moses_red_sea_scene_09.png'),
    10: require('../../assets/stories/moses_red_sea/scenes/moses_red_sea_scene_10.png'),
  },
  ruth_naomi: {},
  esther_queen: {},
  miraculous_catch: {},
  samuel_hears_god: {},
  josiah_young_king: {},
  solomon_wisdom: {},
  mary_says_yes: {},
  timothy_faith: {},
  jesus_temple: {},
};

/**
 * Retorna o asset (módulo de require) da ilustração oficial de uma cena, ou
 * null se ainda não existir. Nunca lança erro por storyId/sceneId inválidos.
 *
 * @param {string} storyId
 * @param {number} sceneId — cena.id (1..N)
 * @returns {*} módulo de imagem (require) ou null
 */
export function getSceneIllustrationAsset(storyId, sceneId) {
  const map = STORY_SCENE_ILLUSTRATIONS?.[storyId];
  return (map && map[sceneId]) ? map[sceneId] : null;
}
