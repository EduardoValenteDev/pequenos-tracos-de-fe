/**
 * ovelhaScenes.js — CENAS AUTORAIS reais de "Cadê a Ovelhinha?" (Bloco 2.2e).
 *
 * Cinco ambientes novos substituem armazém/fazenda antigos. Quatro terrestres JOGÁVEIS com
 * as três ovelhas atuais (front/peekLeft/peekRight); o fundo do mar fica REGISTRADO mas
 * DESABILITADO até existir a pose própria `sheep_diver` (nunca sortear ovelha terrestre
 * debaixo d'água).
 *
 * ── Dimensões por cena ────────────────────────────────────────────────────────
 *   Cada cena registra designWidth/designHeight/aspectRatio REAIS (não uma constante global).
 *   O viewport e a conversão arte<->pixel usam a cena ATIVA (ver ovelhaGameService/contentRect).
 *
 * ── Direção da pose (contrato em ovelhaGameService) ──────────────────────────
 *   peekLeft  → corpo escondido à DIREITA  → clip.side='right'
 *   peekRight → corpo escondido à ESQUERDA → clip.side='left'
 *   front     → só CAMOUFLAGE entre elementos claros/brancos, sem clip.
 *
 * ── FOREGROUNDS PENDENTES (para reativar spots que exijam oclusor transparente real) ──
 *   Continuam pendentes: tecidos/flores/cesto/barril, feno/cerca/carrinho etc. Neste bloco
 *   usamos só PEEK alinhado a borda real e front por camuflagem — nada de oclusor falso.
 *
 * As coordenadas normalizadas abaixo são INICIAIS (derivadas dos anchors descritos) e devem
 * ser calibradas no aparelho pela Asset Gallery + modo de calibração.
 */

/** Poses aceitas (arte integrada tem front/peekLeft/peekRight; sheep_diver é futura). */
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

/** Fábrica de cena terrestre (todas as novas artes são 1122×1402 hoje; estrutura é por-cena). */
const cena = ({ id, spots, dw = DW, dh = DH }) => Object.freeze({
  id,
  background: { assetKey: id, tipo: 'image' },
  designWidth: dw, designHeight: dh, aspectRatio: dw / dh,
  safeArea: SAFE,
  enabled: true,
  hidingSpots: Object.freeze(spots),
});

/* ── Fazenda animada ── */
const FARM_LIVELY_01 = cena({
  id: 'farm_lively_01',
  spots: [
    { id: 'farm_hay_right', pos: { x: nx(0.700), y: ny(0.550) }, escala: 0.075, pose: 'peekLeft', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, apoio: 'lateral esquerda da pilha de feno do lado direito', plano: 'medio', dificuldades: ['facil'] },
    { id: 'farm_cotton_left', pos: { x: nx(0.205), y: ny(0.720) }, escala: 0.085, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', apoio: 'algodão claro do lado esquerdo inferior', plano: 'primeiro', dificuldades: ['facil'] },
    { id: 'farm_geese_center', pos: { x: nx(0.500), y: ny(0.625) }, escala: 0.070, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', apoio: 'grupo de aves brancas na região central', plano: 'medio', dificuldades: ['facil'] },
  ],
});

/* ── Padaria ── */
const BAKERY_01 = cena({
  id: 'bakery_01',
  spots: [
    { id: 'bakery_flour_sacks_left', pos: { x: nx(0.185), y: ny(0.580) }, escala: 0.075, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'left', visibleFraction: 0.6 }, apoio: 'sacos de farinha claros à esquerda', plano: 'medio', dificuldades: ['facil'] },
    { id: 'bakery_towels_lower', pos: { x: nx(0.625), y: ny(0.755) }, escala: 0.078, pose: 'peekLeft', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, apoio: 'panos/toalhas claras enroladas da região inferior', plano: 'primeiro', dificuldades: ['facil'] },
    { id: 'bakery_cakes_ceramics', pos: { x: nx(0.420), y: ny(0.660) }, escala: 0.080, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', apoio: 'bolos com cobertura e louças claras', plano: 'medio', dificuldades: ['facil'] },
  ],
});

/* ── Oficina de brinquedos ── */
const TOY_WORKSHOP_01 = cena({
  id: 'toy_workshop_01',
  spots: [
    { id: 'toy_plush_center', pos: { x: nx(0.480), y: ny(0.600) }, escala: 0.080, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', apoio: 'bichos de pelúcia claros', plano: 'medio', dificuldades: ['facil'] },
    { id: 'toy_cotton_basket', pos: { x: nx(0.245), y: ny(0.660) }, escala: 0.075, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'left', visibleFraction: 0.6 }, apoio: 'lateral do grande cesto de algodão', plano: 'primeiro', dificuldades: ['facil'] },
    { id: 'toy_fabrics_right', pos: { x: nx(0.740), y: ny(0.500) }, escala: 0.070, pose: 'peekLeft', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, apoio: 'tecidos claros empilhados à direita', plano: 'medio', dificuldades: ['facil'] },
  ],
});

/* ── Quintal da lavanderia ── */
const LAUNDRY_YARD_01 = cena({
  id: 'laundry_yard_01',
  spots: [
    { id: 'laundry_sheet_left', pos: { x: nx(0.200), y: ny(0.450) }, escala: 0.072, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'left', visibleFraction: 0.6 }, apoio: 'lateral do grande lençol branco à esquerda', plano: 'medio', dificuldades: ['facil'] },
    { id: 'laundry_basket_center', pos: { x: nx(0.520), y: ny(0.680) }, escala: 0.076, pose: 'peekLeft', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, apoio: 'lateral do cesto de roupas da região central', plano: 'primeiro', dificuldades: ['facil'] },
    { id: 'laundry_foam_tub', pos: { x: nx(0.660), y: ny(0.720) }, escala: 0.082, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', apoio: 'espuma branca da bacia', plano: 'primeiro', dificuldades: ['facil'] },
  ],
});

/* ── Fundo do mar — REGISTRADO, mas DESABILITADO (exige pose sheep_diver). ── */
const UNDERWATER_01 = Object.freeze({
  id: 'underwater_01',
  background: { assetKey: 'underwater_01', tipo: 'image' },
  designWidth: DW, designHeight: DH, aspectRatio: DW / DH,
  safeArea: SAFE,
  enabled: false,
  reason: 'requires_sheep_diver',
  hidingSpots: Object.freeze([]),   // nenhum esconderijo enquanto não houver a pose própria
});

/** Todas as cenas (inclui a desabilitada, para a galeria). */
export const OVELHA_SCENES = Object.freeze([FARM_LIVELY_01, BAKERY_01, TOY_WORKSHOP_01, LAUNDRY_YARD_01, UNDERWATER_01]);

export function getScene(id) {
  return OVELHA_SCENES.find((s) => s.id === id) || OVELHA_SCENES[0];
}

/** Cenas realmente jogáveis (enabled !== false). */
export function cenasHabilitadas() {
  return OVELHA_SCENES.filter((s) => s.enabled !== false);
}

export const OVELHA_SCENE_PADRAO = 'farm_lively_01';
