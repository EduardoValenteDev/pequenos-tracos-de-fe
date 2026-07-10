/**
 * ovelhaScenes.js — CENAS AUTORAIS reais de "Cadê a Ovelhinha?" (Bloco 2.2d).
 *
 * Redução TEMPORÁRIA para 4 esconderijos CONFIÁVEIS (2 por cena), todos PEEK, para provar
 * a composição, a apresentação do alvo e a transição em duplo buffer. Os spots frontais
 * (CAMOUFLAGE/recorte inferior) do 2.2c ficam SUSPENSOS até existirem foregrounds reais.
 *
 * ── Regra deste bloco ────────────────────────────────────────────────────────
 *   Só PEEK alinhado a uma borda REAL do cenário. Nada de front/CAMOUFLAGE/PARTIAL, nada
 *   que dependa de foreground inexistente. Direção da pose (contrato em ovelhaGameService):
 *     peekLeft  → corpo escondido à DIREITA  → clip.side='right'
 *     peekRight → corpo escondido à ESQUERDA → clip.side='left'
 *
 * ── FOREGROUNDS PENDENTES (pré-requisito para reativar spots frontais) ───────
 *   Warehouse: tecidos · flores · cesto · barril/caixa.
 *   Farm:      feno · cerca · flores · carrinho de vegetais.
 *   Só depois desses assets transparentes existirem os spots frontais voltam.
 *
 * ── Coordenadas ──────────────────────────────────────────────────────────────
 *   Guardadas em px de ARTE = dimensões reais do background (1122×1402). Cada `pos` nasce
 *   de uma fração normalizada (0..1) — ver comentário. A tela converte arte→viewport pelo
 *   contentRect REAL (ver ovelhaGameService), renderizado em retângulo explícito.
 */

/** Poses aceitas (arte integrada tem front/peekLeft/peekRight; found/celebrating reusam). */
export const OVELHA_POSES = Object.freeze([
  'front', 'peekLeft', 'peekRight', 'crouched', 'found', 'celebrating',
]);
export const OVELHA_ORIENTACOES = Object.freeze(['normal', 'flip']);
/** Modos de esconderijo (neste bloco só PEEK; CAMOUFLAGE/PARTIAL seguem suportados pelo contrato). */
export const OVELHA_MODOS = Object.freeze(['CAMOUFLAGE', 'PEEK', 'PARTIAL']);

const DESIGN_W = 1122;
const DESIGN_H = 1402;                       // razão real ≈ 1.2496
const SAFE = { x: 40, y: 48, w: 1042, h: 1306 };

/** Converte fração normalizada (0..1) da arte em px de arte. */
const nx = (f) => Math.round(f * DESIGN_W);
const ny = (f) => Math.round(f * DESIGN_H);

/** Armazém: dois espreitares laterais alinhados a bordas reais (peça estampada / tecidos). */
const WAREHOUSE_01 = Object.freeze({
  id: 'warehouse_01',
  background: { assetKey: 'warehouse_01', tipo: 'image' },
  designWidth: DESIGN_W, designHeight: DESIGN_H, safeArea: SAFE,
  hidingSpots: Object.freeze([
    // peekRight: olha à direita, corpo escondido à ESQUERDA (clip.side='left').
    { id: 'warehouse_tapestry_left', pos: { x: nx(0.205), y: ny(0.355) }, escala: 0.070, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'left', visibleFraction: 0.6 }, apoio: 'borda da grande peça estampada da esquerda', plano: 'medio', dificuldades: ['facil'] },
    // peekLeft: olha à esquerda, corpo escondido à DIREITA (clip.side='right').
    { id: 'warehouse_fabrics_right', pos: { x: nx(0.772), y: ny(0.405) }, escala: 0.066, pose: 'peekLeft', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, apoio: 'pilha de tecidos da direita', plano: 'distante', dificuldades: ['facil'] },
  ]),
});

/** Fazenda: dois espreitares laterais (casinha/poste de pássaros · lateral da porta do celeiro). */
const FARM_01 = Object.freeze({
  id: 'farm_01',
  background: { assetKey: 'farm_01', tipo: 'image' },
  designWidth: DESIGN_W, designHeight: DESIGN_H, safeArea: SAFE,
  hidingSpots: Object.freeze([
    { id: 'farm_birdhouse_left', pos: { x: nx(0.145), y: ny(0.285) }, escala: 0.062, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'left', visibleFraction: 0.6 }, apoio: 'casinha ou poste de pássaros', plano: 'distante', dificuldades: ['facil'] },
    { id: 'farm_barn_door_right', pos: { x: nx(0.690), y: ny(0.330) }, escala: 0.064, pose: 'peekLeft', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, apoio: 'lateral da porta do celeiro', plano: 'medio', dificuldades: ['facil'] },
  ]),
});

export const OVELHA_SCENES = Object.freeze([WAREHOUSE_01, FARM_01]);

export function getScene(id) {
  return OVELHA_SCENES.find((s) => s.id === id) || OVELHA_SCENES[0];
}

export const OVELHA_SCENE_PADRAO = 'warehouse_01';
