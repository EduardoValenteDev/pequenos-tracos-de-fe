/**
 * catalog.js — Catálogo oficial do MVP organizado por trilha.
 *
 * Todas as entradas são type:'story' — todos os IDs existem em stories.js.
 * Histórias coming_soon aparecem no catálogo mas não podem ser abertas.
 *
 * Trilha 1 — Comece Aqui (gratuita, 2 histórias)
 * Trilha 2 — Pequeninos (premium, 6 histórias)
 * Trilha 3 — Descobridores (premium, 6 histórias)
 * Trilha 4 — Jovens da Fé (premium, 6 histórias)
 */

export const CATALOG = {
  comece: [
    { type: 'story', storyId: 'creation' },
    { type: 'story', storyId: 'noah' },
  ],

  pequeninos: [
    { type: 'story', storyId: 'david_goliath' },
    { type: 'story', storyId: 'jesus_children' },
    { type: 'story', storyId: 'daniel_lions' },
    { type: 'story', storyId: 'jonah_big_fish' },
    { type: 'story', storyId: 'lost_sheep' },
    { type: 'story', storyId: 'good_samaritan' },
  ],

  descobridores: [
    { type: 'story', storyId: 'abraham_stars' },
    { type: 'story', storyId: 'joseph_colorful_coat' },
    { type: 'story', storyId: 'moses_red_sea' },
    { type: 'story', storyId: 'ruth_naomi' },
    { type: 'story', storyId: 'esther_queen' },
    { type: 'story', storyId: 'miraculous_catch' },
  ],

  jovens_da_fe: [
    { type: 'story', storyId: 'samuel_hears_god' },
    { type: 'story', storyId: 'josiah_young_king' },
    { type: 'story', storyId: 'solomon_wisdom' },
    { type: 'story', storyId: 'mary_says_yes' },
    { type: 'story', storyId: 'timothy_faith' },
    { type: 'story', storyId: 'jesus_temple' },
  ],
};
