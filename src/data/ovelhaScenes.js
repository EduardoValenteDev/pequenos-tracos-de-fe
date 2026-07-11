/**
 * ovelhaScenes.js — CENAS AUTORAIS de "Cadê a Ovelhinha?" (2.2f-refino cluster: 18 spots/cena).
 *
 * ── Pose única frontal ────────────────────────────────────────────────────────
 *   Runtime usa SOMENTE a pose frontal (`front`, CAMOUFLAGE, sem clip). No fundo do mar a
 *   MESMA ovelha frontal aparece dentro de uma BOLHA mágica (componente RN, ver a tela).
 *
 * ── Tiers + zonas + clusters ──────────────────────────────────────────────────
 *   Cada esconderijo tem `difficulty` (facil/medio/dificil), uma `zone` (banda visual ampla
 *   <banda_y>_<banda_x>, ex.: inf_cen) e um `cluster` (grupo visual FINO: spots percebidos
 *   como semelhantes/no mesmo objeto compartilham cluster). O MODO de jogo escolhe os tiers,
 *   o nº de rodadas, a escala e o piso da área clicável (ovelhaGameService). Cada cena tem 18
 *   spots (6 facil · 6 medio · 6 dificil) em ≥10 clusters distintos — 90 spots no total.
 *
 * ── Curadoria das coordenadas ────────────────────────────────────────────────
 *   Normalizadas (0..1), curadas por posição/zona/tier (banda de y por tier: facil baixo,
 *   medio meio, dificil meio-alto sem ser aéreo) e REFINADAS com análise de brilho dos
 *   backgrounds reais (regiões plausíveis, claras para camuflagem justa; dificil pode ser
 *   mais carregada). Os spots NOVOS foram colocados por seleção de ponto-mais-distante numa
 *   grade curada (NÃO aleatório, NÃO só brilho), com separação relevante dos existentes; os
 *   12 originais foram preservados. Clusters derivam da proximidade real (spots a <0.09 de
 *   distância compartilham cluster). Validação em ovelhaGameService.auditarSpots + Asset
 *   Gallery (revisão individual no aparelho).
 *
 * ── Expansão ──────────────────────────────────────────────────────────────────
 *   Nova cena = add asset + registrar cena + registrar spots (com zona+cluster) + validar na
 *   Asset Gallery. A lógica central (baralhos/dificuldades/rotação) é agnóstica ao nº de cenas.
 */

/** Poses aceitas (arte tem front/peekLeft/peekRight; runtime usa só front). */
export const OVELHA_POSES = Object.freeze([
  'front', 'peekLeft', 'peekRight', 'diver', 'found', 'celebrating',
]);
export const OVELHA_ORIENTACOES = Object.freeze(['normal', 'flip']);
export const OVELHA_MODOS = Object.freeze(['CAMOUFLAGE', 'PEEK', 'PARTIAL']);

const DW = 1122;
const DH = 1402;                              // razão real ≈ 1.2496
const SAFE = { x: 40, y: 48, w: 1042, h: 1306 };
const nx = (f) => Math.round(f * DW);
const ny = (f) => Math.round(f * DH);

/** Cena (terrestre ou aquática). `aquatico` liga a bolha mágica ao redor da ovelha frontal. */
const cena = ({ id, spots, aquatico = false, enabled = true, reason, dw = DW, dh = DH }) => Object.freeze({
  id,
  background: { assetKey: id, tipo: 'image' },
  designWidth: dw, designHeight: dh, aspectRatio: dw / dh,
  safeArea: SAFE,
  aquatico,
  enabled,
  ...(reason ? { reason } : {}),
  hidingSpots: Object.freeze(spots || []),
});

/** Esconderijo frontal (pose única, CAMOUFLAGE) com TIER, ZONA e CLUSTER. */
const spot = ({ id, x, y, escala, difficulty, zone, cluster }) => ({
  id, pos: { x: nx(x), y: ny(y) }, escala, difficulty, zone, cluster,
  pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE',
  apoio: `zona ${zone} / grupo ${cluster} (região clara curada)`,
});

/* -- Fazenda animada — objetos claros -- */
const FARM_LIVELY_01 = cena({
  id: 'farm_lively_01',
  spots: [
    spot({ id: 'farm_f1', x: 0.604, y: 0.883, escala: 0.088, difficulty: 'facil', zone: 'inf_cen', cluster: 'farm_baixo_centro' }),
    spot({ id: 'farm_f2', x: 0.25, y: 0.75, escala: 0.088, difficulty: 'facil', zone: 'inf_esq', cluster: 'farm_baixo_esq' }),
    spot({ id: 'farm_m1', x: 0.729, y: 0.667, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'farm_meio_dir' }),
    spot({ id: 'farm_m2', x: 0.521, y: 0.667, escala: 0.074, difficulty: 'medio', zone: 'meio_cen', cluster: 'farm_meio_centro' }),
    spot({ id: 'farm_d1', x: 0.625, y: 0.46, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'farm_alto_dir' }),
    spot({ id: 'farm_d2', x: 0.354, y: 0.46, escala: 0.066, difficulty: 'dificil', zone: 'sup_esq', cluster: 'farm_alto_esq' }),
    spot({ id: 'farm_f3', x: 0.86, y: 0.8, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'farm_baixo_dir' }),
    spot({ id: 'farm_f4', x: 0.78, y: 0.8, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'farm_baixo_dir' }),
    spot({ id: 'farm_m3', x: 0.28, y: 0.57, escala: 0.074, difficulty: 'medio', zone: 'meio_esq', cluster: 'farm_meio_esq' }),
    spot({ id: 'farm_m4', x: 0.81, y: 0.66, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'farm_meio_dir' }),
    spot({ id: 'farm_d3', x: 0.51, y: 0.49, escala: 0.066, difficulty: 'dificil', zone: 'sup_cen', cluster: 'farm_alto_centro' }),
    spot({ id: 'farm_d4', x: 0.7, y: 0.44, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'farm_alto_dir' }),
    spot({ id: 'farm_f5', x: 0.42, y: 0.85, escala: 0.088, difficulty: 'facil', zone: 'inf_cen', cluster: 'farm_baixo_centro_2' }),
    spot({ id: 'farm_f6', x: 0.18, y: 0.9, escala: 0.088, difficulty: 'facil', zone: 'inf_esq', cluster: 'farm_baixo_esq_2' }),
    spot({ id: 'farm_m5', x: 0.14, y: 0.63, escala: 0.074, difficulty: 'medio', zone: 'meio_esq', cluster: 'farm_meio_esq_2' }),
    spot({ id: 'farm_m6', x: 0.38, y: 0.68, escala: 0.074, difficulty: 'medio', zone: 'meio_cen', cluster: 'farm_meio_centro_2' }),
    spot({ id: 'farm_d5', x: 0.18, y: 0.43, escala: 0.066, difficulty: 'dificil', zone: 'sup_esq', cluster: 'farm_alto_esq_2' }),
    spot({ id: 'farm_d6', x: 0.86, y: 0.48, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'farm_alto_dir_2' }),
  ],
});

/* -- Padaria — louças/panos claros -- */
const BAKERY_01 = cena({
  id: 'bakery_01',
  spots: [
    spot({ id: 'bakery_f1', x: 0.396, y: 0.85, escala: 0.088, difficulty: 'facil', zone: 'inf_cen', cluster: 'bakery_baixo_centro' }),
    spot({ id: 'bakery_f2', x: 0.688, y: 0.817, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'bakery_baixo_dir' }),
    spot({ id: 'bakery_m1', x: 0.125, y: 0.717, escala: 0.074, difficulty: 'medio', zone: 'inf_esq', cluster: 'bakery_baixo_esq' }),
    spot({ id: 'bakery_m2', x: 0.646, y: 0.633, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'bakery_meio_dir' }),
    spot({ id: 'bakery_d1', x: 0.313, y: 0.633, escala: 0.066, difficulty: 'dificil', zone: 'meio_esq', cluster: 'bakery_meio_esq' }),
    spot({ id: 'bakery_d2', x: 0.229, y: 0.46, escala: 0.066, difficulty: 'dificil', zone: 'sup_esq', cluster: 'bakery_alto_esq' }),
    spot({ id: 'bakery_f3', x: 0.85, y: 0.89, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'bakery_baixo_dir_2' }),
    spot({ id: 'bakery_f4', x: 0.83, y: 0.79, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'bakery_baixo_dir_3' }),
    spot({ id: 'bakery_m3', x: 0.44, y: 0.61, escala: 0.074, difficulty: 'medio', zone: 'meio_cen', cluster: 'bakery_meio_centro' }),
    spot({ id: 'bakery_m4', x: 0.84, y: 0.7, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'bakery_meio_dir_2' }),
    spot({ id: 'bakery_d3', x: 0.75, y: 0.49, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'bakery_alto_dir' }),
    spot({ id: 'bakery_d4', x: 0.47, y: 0.48, escala: 0.066, difficulty: 'dificil', zone: 'sup_cen', cluster: 'bakery_alto_centro' }),
    spot({ id: 'bakery_f5', x: 0.54, y: 0.75, escala: 0.088, difficulty: 'facil', zone: 'inf_cen', cluster: 'bakery_baixo_centro_2' }),
    spot({ id: 'bakery_f6', x: 0.54, y: 0.9, escala: 0.088, difficulty: 'facil', zone: 'inf_cen', cluster: 'bakery_baixo_centro_3' }),
    spot({ id: 'bakery_m5', x: 0.14, y: 0.58, escala: 0.074, difficulty: 'medio', zone: 'meio_esq', cluster: 'bakery_meio_esq_2' }),
    spot({ id: 'bakery_m6', x: 0.86, y: 0.58, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'bakery_meio_dir_3' }),
    spot({ id: 'bakery_d5', x: 0.62, y: 0.455, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'bakery_alto_dir_2' }),
    spot({ id: 'bakery_d6', x: 0.86, y: 0.43, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'bakery_alto_dir_3' }),
  ],
});

/* -- Oficina de brinquedos — pelúcias/tecidos claros -- */
const TOY_WORKSHOP_01 = cena({
  id: 'toy_workshop_01',
  spots: [
    spot({ id: 'toy_f1', x: 0.458, y: 0.85, escala: 0.088, difficulty: 'facil', zone: 'inf_cen', cluster: 'toy_baixo_centro' }),
    spot({ id: 'toy_f2', x: 0.229, y: 0.75, escala: 0.088, difficulty: 'facil', zone: 'inf_esq', cluster: 'toy_baixo_esq' }),
    spot({ id: 'toy_m1', x: 0.583, y: 0.65, escala: 0.074, difficulty: 'medio', zone: 'meio_cen', cluster: 'toy_meio_centro' }),
    spot({ id: 'toy_m2', x: 0.188, y: 0.567, escala: 0.074, difficulty: 'medio', zone: 'meio_esq', cluster: 'toy_meio_esq' }),
    spot({ id: 'toy_d1', x: 0.75, y: 0.483, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'toy_alto_dir' }),
    spot({ id: 'toy_d2', x: 0.5, y: 0.46, escala: 0.066, difficulty: 'dificil', zone: 'sup_cen', cluster: 'toy_alto_centro' }),
    spot({ id: 'toy_f3', x: 0.86, y: 0.78, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'toy_baixo_dir' }),
    spot({ id: 'toy_f4', x: 0.18, y: 0.88, escala: 0.088, difficulty: 'facil', zone: 'inf_esq', cluster: 'toy_baixo_esq_2' }),
    spot({ id: 'toy_m3', x: 0.85, y: 0.63, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'toy_meio_dir' }),
    spot({ id: 'toy_m4', x: 0.14, y: 0.63, escala: 0.074, difficulty: 'medio', zone: 'meio_esq', cluster: 'toy_meio_esq' }),
    spot({ id: 'toy_d3', x: 0.27, y: 0.49, escala: 0.066, difficulty: 'dificil', zone: 'sup_esq', cluster: 'toy_alto_esq' }),
    spot({ id: 'toy_d4', x: 0.83, y: 0.46, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'toy_alto_dir' }),
    spot({ id: 'toy_f5', x: 0.62, y: 0.8, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'toy_baixo_dir_2' }),
    spot({ id: 'toy_f6', x: 0.46, y: 0.7, escala: 0.088, difficulty: 'facil', zone: 'inf_cen', cluster: 'toy_baixo_centro_2' }),
    spot({ id: 'toy_m5', x: 0.38, y: 0.58, escala: 0.074, difficulty: 'medio', zone: 'meio_cen', cluster: 'toy_meio_centro_2' }),
    spot({ id: 'toy_m6', x: 0.7, y: 0.605, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'toy_meio_dir_2' }),
    spot({ id: 'toy_d5', x: 0.14, y: 0.43, escala: 0.066, difficulty: 'dificil', zone: 'sup_esq', cluster: 'toy_alto_esq_2' }),
    spot({ id: 'toy_d6', x: 0.62, y: 0.505, escala: 0.066, difficulty: 'dificil', zone: 'meio_dir', cluster: 'toy_meio_dir_3' }),
  ],
});

/* -- Quintal da lavanderia — lençóis/roupas claros -- */
const LAUNDRY_YARD_01 = cena({
  id: 'laundry_yard_01',
  spots: [
    spot({ id: 'laundry_f1', x: 0.438, y: 0.817, escala: 0.088, difficulty: 'facil', zone: 'inf_cen', cluster: 'laundry_baixo_centro' }),
    spot({ id: 'laundry_f2', x: 0.813, y: 0.75, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'laundry_baixo_dir' }),
    spot({ id: 'laundry_m1', x: 0.833, y: 0.517, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'laundry_meio_dir' }),
    spot({ id: 'laundry_m2', x: 0.125, y: 0.517, escala: 0.074, difficulty: 'medio', zone: 'meio_esq', cluster: 'laundry_meio_esq' }),
    spot({ id: 'laundry_d1', x: 0.646, y: 0.5, escala: 0.066, difficulty: 'dificil', zone: 'meio_dir', cluster: 'laundry_meio_dir_2' }),
    spot({ id: 'laundry_d2', x: 0.354, y: 0.5, escala: 0.066, difficulty: 'dificil', zone: 'meio_esq', cluster: 'laundry_meio_esq_2' }),
    spot({ id: 'laundry_f3', x: 0.24, y: 0.85, escala: 0.088, difficulty: 'facil', zone: 'inf_esq', cluster: 'laundry_baixo_esq' }),
    spot({ id: 'laundry_f4', x: 0.21, y: 0.77, escala: 0.088, difficulty: 'facil', zone: 'inf_esq', cluster: 'laundry_baixo_esq' }),
    spot({ id: 'laundry_m3', x: 0.59, y: 0.63, escala: 0.074, difficulty: 'medio', zone: 'meio_cen', cluster: 'laundry_meio_centro' }),
    spot({ id: 'laundry_m4', x: 0.85, y: 0.64, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'laundry_meio_dir_3' }),
    spot({ id: 'laundry_d3', x: 0.25, y: 0.44, escala: 0.066, difficulty: 'dificil', zone: 'sup_esq', cluster: 'laundry_alto_esq' }),
    spot({ id: 'laundry_d4', x: 0.49, y: 0.49, escala: 0.066, difficulty: 'dificil', zone: 'sup_cen', cluster: 'laundry_alto_centro' }),
    spot({ id: 'laundry_f5', x: 0.7, y: 0.875, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'laundry_baixo_dir_2' }),
    spot({ id: 'laundry_f6', x: 0.34, y: 0.7, escala: 0.088, difficulty: 'facil', zone: 'inf_esq', cluster: 'laundry_baixo_esq_2' }),
    spot({ id: 'laundry_m5', x: 0.14, y: 0.655, escala: 0.074, difficulty: 'medio', zone: 'meio_esq', cluster: 'laundry_meio_esq_3' }),
    spot({ id: 'laundry_m6', x: 0.46, y: 0.63, escala: 0.074, difficulty: 'medio', zone: 'meio_cen', cluster: 'laundry_meio_centro_2' }),
    spot({ id: 'laundry_d5', x: 0.26, y: 0.605, escala: 0.066, difficulty: 'dificil', zone: 'meio_esq', cluster: 'laundry_meio_esq_4' }),
    spot({ id: 'laundry_d6', x: 0.74, y: 0.43, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'laundry_alto_dir' }),
  ],
});

/* -- Fundo do mar — areia/água clara (bolha) -- */
const UNDERWATER_01 = cena({
  id: 'underwater_01',
  aquatico: true,
  spots: [
    spot({ id: 'sea_f1', x: 0.5, y: 0.867, escala: 0.088, difficulty: 'facil', zone: 'inf_cen', cluster: 'underwater_baixo_centro' }),
    spot({ id: 'sea_f2', x: 0.75, y: 0.817, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'underwater_baixo_dir' }),
    spot({ id: 'sea_m1', x: 0.313, y: 0.8, escala: 0.074, difficulty: 'medio', zone: 'inf_esq', cluster: 'underwater_baixo_esq' }),
    spot({ id: 'sea_m2', x: 0.542, y: 0.65, escala: 0.074, difficulty: 'medio', zone: 'meio_cen', cluster: 'underwater_meio_centro' }),
    spot({ id: 'sea_d1', x: 0.125, y: 0.6, escala: 0.066, difficulty: 'dificil', zone: 'meio_esq', cluster: 'underwater_meio_esq' }),
    spot({ id: 'sea_d2', x: 0.625, y: 0.483, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'underwater_alto_dir' }),
    spot({ id: 'sea_f3', x: 0.25, y: 0.76, escala: 0.088, difficulty: 'facil', zone: 'inf_esq', cluster: 'underwater_baixo_esq' }),
    spot({ id: 'sea_f4', x: 0.32, y: 0.87, escala: 0.088, difficulty: 'facil', zone: 'inf_esq', cluster: 'underwater_baixo_esq' }),
    spot({ id: 'sea_m3', x: 0.65, y: 0.6, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'underwater_meio_dir' }),
    spot({ id: 'sea_m4', x: 0.42, y: 0.65, escala: 0.074, difficulty: 'medio', zone: 'meio_cen', cluster: 'underwater_meio_centro_2' }),
    spot({ id: 'sea_d3', x: 0.36, y: 0.46, escala: 0.066, difficulty: 'dificil', zone: 'sup_esq', cluster: 'underwater_alto_esq' }),
    spot({ id: 'sea_d4', x: 0.47, y: 0.45, escala: 0.066, difficulty: 'dificil', zone: 'sup_cen', cluster: 'underwater_alto_centro' }),
    spot({ id: 'sea_f5', x: 0.14, y: 0.9, escala: 0.088, difficulty: 'facil', zone: 'inf_esq', cluster: 'underwater_baixo_esq_2' }),
    spot({ id: 'sea_f6', x: 0.86, y: 0.7, escala: 0.088, difficulty: 'facil', zone: 'inf_dir', cluster: 'underwater_baixo_dir_2' }),
    spot({ id: 'sea_m5', x: 0.82, y: 0.53, escala: 0.074, difficulty: 'medio', zone: 'meio_dir', cluster: 'underwater_meio_dir_2' }),
    spot({ id: 'sea_m6', x: 0.26, y: 0.555, escala: 0.074, difficulty: 'medio', zone: 'meio_esq', cluster: 'underwater_meio_esq_2' }),
    spot({ id: 'sea_d5', x: 0.14, y: 0.43, escala: 0.066, difficulty: 'dificil', zone: 'sup_esq', cluster: 'underwater_alto_esq_2' }),
    spot({ id: 'sea_d6', x: 0.74, y: 0.43, escala: 0.066, difficulty: 'dificil', zone: 'sup_dir', cluster: 'underwater_alto_dir_2' }),
  ],
});

/** Todas as cenas (5 jogáveis, 18 spots cada). */
export const OVELHA_SCENES = Object.freeze([FARM_LIVELY_01, BAKERY_01, TOY_WORKSHOP_01, LAUNDRY_YARD_01, UNDERWATER_01]);

export function getScene(id) {
  return OVELHA_SCENES.find((s) => s.id === id) || OVELHA_SCENES[0];
}

/** Cenas realmente jogáveis (enabled !== false). */
export function cenasHabilitadas() {
  return OVELHA_SCENES.filter((s) => s.enabled !== false);
}

export const OVELHA_SCENE_PADRAO = 'farm_lively_01';
