/**
 * Constantes reutilizáveis para organização das histórias.
 * Importe aqui em qualquer tela que precise filtrar ou exibir categorias bíblicas.
 */

/* ── Níveis de experiência por idade ────────────────────────────── */
export const LEVELS = {
  PEQUENINOS:   'pequeninos',    // 3–6 anos
  DESCOBRIDORES: 'descobridores', // 6–9 anos
  JOVENS_DA_FE: 'jovens_da_fe',  // 9–12 anos
};

export const LEVEL_TITLES = {
  pequeninos:    'Pequeninos',
  descobridores: 'Descobridores',
  jovens_da_fe:  'Jovens da Fé',
};

export const LEVEL_AGE_RANGE = {
  pequeninos:    '3 a 6',
  descobridores: '6 a 9',
  jovens_da_fe:  '9 a 12',
};

/* ── Coleções bíblicas (ordem cronológica) ──────────────────────── */
export const BIBLICAL_COLLECTIONS = {
  CRIACAO_E_COMECOS:  'criacao_e_comecos',
  PATRIARCAS:         'patriarcas',
  EXODO_E_DESERTO:    'exodo_e_deserto',
  JUIZES_E_LIDERES:   'juizes_e_lideres',
  REIS_DE_ISRAEL:     'reis_de_israel',
  PROFETAS:           'profetas',
  VIDA_DE_JESUS:      'vida_de_jesus',
  PARABOLAS_DE_JESUS: 'parabolas_de_jesus',
  MILAGRES_DE_JESUS:  'milagres_de_jesus',
  IGREJA_PRIMITIVA:   'igreja_primitiva',
  VIDA_CRISTA:        'vida_crista',
};

export const BIBLICAL_COLLECTION_TITLES = {
  criacao_e_comecos:  'Criação e Começos',
  patriarcas:         'Patriarcas',
  exodo_e_deserto:    'Êxodo e Deserto',
  juizes_e_lideres:   'Juízes e Líderes',
  reis_de_israel:     'Reis de Israel',
  profetas:           'Profetas',
  vida_de_jesus:      'Vida de Jesus',
  parabolas_de_jesus: 'Parábolas de Jesus',
  milagres_de_jesus:  'Milagres de Jesus',
  igreja_primitiva:   'Igreja Primitiva',
  vida_crista:        'Vida Cristã',
};

/* ── Testamentos ────────────────────────────────────────────────── */
export const TESTAMENTS = {
  ANTIGO: 'antigo',
  NOVO:   'novo',
};

/* ── Status possíveis de uma história ──────────────────────────── */
export const STORY_STATUS = {
  AVAILABLE:    'available',
  COMING_SOON:  'coming_soon',
  PREMIUM:      'premium',
};
