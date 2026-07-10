/**
 * ovelhaScenes.js — CENAS AUTORAIS reais de "Cadê a Ovelhinha?" (Bloco 2.2b).
 *
 * Duas paisagens integradas (armazém e fazenda), com esconderijos calibrados sobre
 * regiões densas de cada arte (nunca em cima de rostos/pessoas, nunca no vazio). O jogo
 * sorteia SÓ entre estes esconderijos — nada de posição aleatória.
 *
 * ── Coordenadas ──────────────────────────────────────────────────────────────
 * Em px de ARTE = dimensões do background (`designWidth × designHeight`, 4:5). A tela
 * converte arte→viewport por um fator de escala único (ver ovelhaGameService).
 *
 * ── hidingSpot ───────────────────────────────────────────────────────────────
 *   { id, pos{x,y}, escala (fração da largura da arte), pose, orientacao, modo,
 *     clip?{side,visibleFraction}, plano (profundidade), dificuldades }
 *   A hitbox e a caixa visível são DERIVADAS (alpha bbox por pose + escala + clip)
 *   no ovelhaGameService — não ficam gravadas aqui.
 */

/** Poses aceitas (arte integrada tem front/peekLeft/peekRight; found/celebrating reusam). */
export const OVELHA_POSES = Object.freeze([
  'front', 'peekLeft', 'peekRight', 'crouched', 'found', 'celebrating',
]);
export const OVELHA_ORIENTACOES = Object.freeze(['normal', 'flip']);
/** Modos de esconderijo (sem oclusor geométrico: só camuflagem, peek e clip real). */
export const OVELHA_MODOS = Object.freeze(['CAMOUFLAGE', 'PEEK', 'PARTIAL']);

const DESIGN_W = 1122;
const DESIGN_H = 1402;                       // 4:5
const SAFE = { x: 48, y: 60, w: 1026, h: 1290 };

/** Armazém: loja densa (caixas, sacos, barris, cestos, tecidos, vasos, flores, prateleiras). */
const WAREHOUSE_01 = Object.freeze({
  id: 'warehouse_01',
  background: { assetKey: 'warehouse_01', tipo: 'image' },
  designWidth: DESIGN_W, designHeight: DESIGN_H, safeArea: SAFE,
  hidingSpots: Object.freeze([
    { id: 'warehouse_boxes_left', pos: { x: 235, y: 1120 }, escala: 0.145, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', plano: 'primeiro', dificuldades: ['facil'] },
    { id: 'warehouse_fabrics_right', pos: { x: 905, y: 1055 }, escala: 0.125, pose: 'peekLeft', orientacao: 'normal', modo: 'PEEK', clip: { side: 'left', visibleFraction: 0.6 }, plano: 'medio', dificuldades: ['facil'] },
    { id: 'warehouse_sacks_center', pos: { x: 610, y: 930 }, escala: 0.115, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, plano: 'medio', dificuldades: ['facil'] },
    { id: 'warehouse_barrels_left', pos: { x: 185, y: 985 }, escala: 0.12, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', plano: 'medio', dificuldades: ['facil'] },
    { id: 'warehouse_baskets_front', pos: { x: 760, y: 1235 }, escala: 0.15, pose: 'front', orientacao: 'normal', modo: 'PARTIAL', clip: { side: 'bottom', visibleFraction: 0.6 }, plano: 'primeiro', dificuldades: ['facil'] },
    { id: 'warehouse_shelf_right', pos: { x: 980, y: 770 }, escala: 0.09, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.58 }, plano: 'distante', dificuldades: ['facil'] },
  ]),
});

/** Fazenda: quintal denso (feno, celeiro, cabras, vaca, galinhas, patos, coelho, cerca). */
const FARM_01 = Object.freeze({
  id: 'farm_01',
  background: { assetKey: 'farm_01', tipo: 'image' },
  designWidth: DESIGN_W, designHeight: DESIGN_H, safeArea: SAFE,
  hidingSpots: Object.freeze([
    { id: 'farm_hay_barn', pos: { x: 800, y: 210 }, escala: 0.09, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', plano: 'distante', dificuldades: ['facil'] },
    { id: 'farm_goats_right', pos: { x: 955, y: 645 }, escala: 0.105, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, plano: 'medio', dificuldades: ['facil'] },
    { id: 'farm_vegetables_front', pos: { x: 430, y: 1185 }, escala: 0.15, pose: 'front', orientacao: 'normal', modo: 'PARTIAL', clip: { side: 'bottom', visibleFraction: 0.6 }, plano: 'primeiro', dificuldades: ['facil'] },
    { id: 'farm_hens_left', pos: { x: 195, y: 1010 }, escala: 0.13, pose: 'peekLeft', orientacao: 'normal', modo: 'PEEK', clip: { side: 'left', visibleFraction: 0.62 }, plano: 'medio', dificuldades: ['facil'] },
    { id: 'farm_rabbit_right', pos: { x: 875, y: 1130 }, escala: 0.12, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', plano: 'primeiro', dificuldades: ['facil'] },
    { id: 'farm_fence_left', pos: { x: 145, y: 770 }, escala: 0.1, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, plano: 'medio', dificuldades: ['facil'] },
  ]),
});

export const OVELHA_SCENES = Object.freeze([WAREHOUSE_01, FARM_01]);

export function getScene(id) {
  return OVELHA_SCENES.find((s) => s.id === id) || OVELHA_SCENES[0];
}

export const OVELHA_SCENE_PADRAO = 'warehouse_01';
