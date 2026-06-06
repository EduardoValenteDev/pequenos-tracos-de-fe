/**
 * storyCovers.js — Manifest central das capas oficiais das histórias (16:9).
 *
 * Fonte única de verdade para as capas principais. Keyed pelo ID real da
 * história (igual ao `id` em src/data/stories.js). Usa require estático,
 * compatível com o bundler do Metro/Expo.
 *
 * As capas ficam em assets/images/<nome>_cover.png.
 *
 * Para resolver a capa de uma história use getStoryCover(storyId).
 * As telas também resolvem via images[`${id}_cover`] (ver src/assets/images.js),
 * derivado deste manifest, mantendo o fluxo existente de imagemCapa.
 */
export const STORY_COVERS = {
  creation:             require('../../assets/images/criacao_cover.png'),
  noah:                 require('../../assets/images/noe_cover.png'),
  david_goliath:        require('../../assets/images/david_goliath_cover.png'),
  jesus_children:       require('../../assets/images/jesus_children_cover.png'),
  daniel_lions:         require('../../assets/images/daniel_leoes_cover.png'),
  jonah_big_fish:       require('../../assets/images/jonas_peixe_cover.png'),
  lost_sheep:           require('../../assets/images/ovelha_perdida_cover.png'),
  good_samaritan:       require('../../assets/images/bom_samaritano_cover.png'),
  abraham_stars:        require('../../assets/images/abraao_estrelas_cover.png'),
  joseph_colorful_coat: require('../../assets/images/jose_tunica_cover.png'),
  moses_red_sea:        require('../../assets/images/moises_mar_vermelho_cover.png'),
  ruth_naomi:           require('../../assets/images/rute_noemi_cover.png'),
  esther_queen:         require('../../assets/images/ester_rainha_cover.png'),
  miraculous_catch:     require('../../assets/images/pesca_milagrosa_cover.png'),
  samuel_hears_god:     require('../../assets/images/samuel_ouve_cover.png'),
  josiah_young_king:    require('../../assets/images/josias_rei_jovem_cover.png'),
  solomon_wisdom:       require('../../assets/images/salomao_sabedoria_cover.png'),
  mary_says_yes:        require('../../assets/images/maria_boa_noticia_cover.png'),
  timothy_faith:        require('../../assets/images/timoteo_fe_cover.png'),
  jesus_temple:         require('../../assets/images/jesus_templo_cover.png'),
};

/**
 * STORY_COVER_META — metadados visuais de enquadramento por história.
 *
 * focusX / focusY (0..1) indicam o ponto de interesse da capa. Usados quando o
 * container NÃO é exatamente 16:9 (a capa precisa ser recortada). Em containers
 * 16:9 a capa aparece inteira e o foco não tem efeito (no-op seguro).
 *
 * focusY < 0.4 → alinhar topo · 0.4–0.6 → centro · > 0.6 → alinhar base.
 */
export const STORY_COVER_META = {
  creation:             { focusX: 0.5,  focusY: 0.45 },
  noah:                 { focusX: 0.5,  focusY: 0.55 },
  david_goliath:        { focusX: 0.58, focusY: 0.48 },
  jesus_children:       { focusX: 0.5,  focusY: 0.55 },
  daniel_lions:         { focusX: 0.5,  focusY: 0.55 },
  jonah_big_fish:       { focusX: 0.5,  focusY: 0.52 },
  lost_sheep:           { focusX: 0.5,  focusY: 0.55 },
  good_samaritan:       { focusX: 0.5,  focusY: 0.55 },
  abraham_stars:        { focusX: 0.5,  focusY: 0.5  },
  joseph_colorful_coat: { focusX: 0.5,  focusY: 0.55 },
  moses_red_sea:        { focusX: 0.5,  focusY: 0.52 },
  ruth_naomi:           { focusX: 0.5,  focusY: 0.55 },
  esther_queen:         { focusX: 0.5,  focusY: 0.55 },
  miraculous_catch:     { focusX: 0.5,  focusY: 0.55 },
  samuel_hears_god:     { focusX: 0.5,  focusY: 0.55 },
  josiah_young_king:    { focusX: 0.5,  focusY: 0.55 },
  solomon_wisdom:       { focusX: 0.5,  focusY: 0.55 },
  mary_says_yes:        { focusX: 0.5,  focusY: 0.55 },
  timothy_faith:        { focusX: 0.5,  focusY: 0.55 },
  jesus_temple:         { focusX: 0.5,  focusY: 0.55 },
};

const DEFAULT_FOCUS = { focusX: 0.5, focusY: 0.5 };

/**
 * Retorna a capa oficial de uma história pelo ID, ou null se não houver
 * (mantém fallback seguro — o consumidor mostra StoryFallbackCover).
 * @param {string} storyId
 * @returns {*} módulo de imagem (require) ou null
 */
export function getStoryCover(storyId) {
  return STORY_COVERS[storyId] ?? null;
}

/**
 * Retorna o foco de enquadramento da capa de uma história.
 * @param {string} storyId
 * @returns {{focusX:number, focusY:number}}
 */
export function getStoryCoverMeta(storyId) {
  return STORY_COVER_META[storyId] ?? DEFAULT_FOCUS;
}
