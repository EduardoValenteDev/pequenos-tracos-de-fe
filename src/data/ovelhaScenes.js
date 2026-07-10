/**
 * ovelhaScenes.js — CENAS AUTORAIS reais de "Cadê a Ovelhinha?" (Bloco 2.2c).
 *
 * Reconstrução dos esconderijos após a reprovação visual no iPhone (2.2b). Preferimos
 * MENOS esconderijos BONS: 4 por cena (8 no total), cada um sobre um apoio visual REAL,
 * respeitando a direção da pose e a perspectiva. Nada de janela/céu/parede/pessoas.
 *
 * ── Coordenadas ──────────────────────────────────────────────────────────────
 * Guardadas em px de ARTE = dimensões reais do background (1122×1402). Cada spot nasce
 * de uma coordenada NORMALIZADA (fração 0..1) para facilitar calibração; abaixo cada
 * `pos` traz a fração de origem no comentário. A tela converte arte→viewport pelo
 * `contentRect` REAL da imagem (ver ovelhaGameService), não por um 4:5 nominal.
 *
 * ── hidingSpot ───────────────────────────────────────────────────────────────
 *   { id, pos{x,y}, escala (fração da largura da arte), pose, orientacao, modo,
 *     clip?{side,visibleFraction}, apoio (objeto real de apoio), plano, dificuldades }
 *   Direção da pose (contrato em ovelhaGameService):
 *     peekLeft  → corpo escondido à DIREITA  → clip.side='right'
 *     peekRight → corpo escondido à ESQUERDA → clip.side='left'
 *     front     → sem clip (camuflagem) ou clip.side='bottom' (recorte inferior)
 *   A hitbox e a caixa visível são DERIVADAS (alpha bbox + escala + clip) — não ficam aqui.
 */

/** Poses aceitas (arte integrada tem front/peekLeft/peekRight; found/celebrating reusam). */
export const OVELHA_POSES = Object.freeze([
  'front', 'peekLeft', 'peekRight', 'crouched', 'found', 'celebrating',
]);
export const OVELHA_ORIENTACOES = Object.freeze(['normal', 'flip']);
/** Modos de esconderijo (sem oclusor geométrico: camuflagem, peek lateral e recorte inferior). */
export const OVELHA_MODOS = Object.freeze(['CAMOUFLAGE', 'PEEK', 'PARTIAL']);

const DESIGN_W = 1122;
const DESIGN_H = 1402;                       // razão real ≈ 1.2496
const SAFE = { x: 48, y: 60, w: 1026, h: 1290 };

/** Converte fração normalizada (0..1) da arte em px de arte. */
const nx = (f) => Math.round(f * DESIGN_W);
const ny = (f) => Math.round(f * DESIGN_H);

/** Armazém: loja densa (tecidos, cestos, sacos, barris, flores/mesa). */
const WAREHOUSE_01 = Object.freeze({
  id: 'warehouse_01',
  background: { assetKey: 'warehouse_01', tipo: 'image' },
  designWidth: DESIGN_W, designHeight: DESIGN_H, safeArea: SAFE,
  hidingSpots: Object.freeze([
    // peekRight: olha à direita, corpo escondido à ESQUERDA (clip.side='left').
    { id: 'warehouse_left_textile', pos: { x: nx(0.18), y: ny(0.45) }, escala: 0.085, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'left', visibleFraction: 0.6 }, apoio: 'peça estampada / cesto da esquerda', plano: 'medio', dificuldades: ['facil'] },
    // peekLeft: olha à esquerda, corpo escondido à DIREITA (clip.side='right').
    { id: 'warehouse_right_fabrics', pos: { x: nx(0.73), y: ny(0.40) }, escala: 0.075, pose: 'peekLeft', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, apoio: 'pilha de tecidos da direita', plano: 'distante', dificuldades: ['facil'] },
    // front: entre mercadorias baixas (sacos/barris), sem oclusor falso.
    { id: 'warehouse_sacks_barrels', pos: { x: nx(0.67), y: ny(0.55) }, escala: 0.085, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', apoio: 'sacos e barris da região central direita', plano: 'medio', dificuldades: ['facil'] },
    // front: entre flores e objetos sobre a mesa (primeiro plano, um pouco maior).
    { id: 'warehouse_flower_table', pos: { x: nx(0.38), y: ny(0.62) }, escala: 0.095, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', apoio: 'flores e objetos da mesa', plano: 'primeiro', dificuldades: ['facil'] },
  ]),
});

/** Fazenda: quintal denso (poste/casinha, porta do celeiro, feno/carroça, animais/cestos). */
const FARM_01 = Object.freeze({
  id: 'farm_01',
  background: { assetKey: 'farm_01', tipo: 'image' },
  designWidth: DESIGN_W, designHeight: DESIGN_H, safeArea: SAFE,
  hidingSpots: Object.freeze([
    { id: 'farm_birdhouse_left', pos: { x: nx(0.18), y: ny(0.58) }, escala: 0.085, pose: 'peekRight', orientacao: 'normal', modo: 'PEEK', clip: { side: 'left', visibleFraction: 0.6 }, apoio: 'casinha de pássaros / poste da esquerda', plano: 'medio', dificuldades: ['facil'] },
    { id: 'farm_barn_door_right', pos: { x: nx(0.73), y: ny(0.40) }, escala: 0.075, pose: 'peekLeft', orientacao: 'normal', modo: 'PEEK', clip: { side: 'right', visibleFraction: 0.6 }, apoio: 'lateral da porta do celeiro', plano: 'distante', dificuldades: ['facil'] },
    { id: 'farm_hay_cart', pos: { x: nx(0.65), y: ny(0.53) }, escala: 0.080, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', apoio: 'feno e carroça', plano: 'medio', dificuldades: ['facil'] },
    // front pequeno, entre os animais próximos (escala menor é justificada pelo tamanho deles).
    { id: 'farm_animals_center', pos: { x: nx(0.50), y: ny(0.63) }, escala: 0.075, pose: 'front', orientacao: 'normal', modo: 'CAMOUFLAGE', apoio: 'grupo de animais e cestos', plano: 'primeiro', dificuldades: ['facil'] },
  ]),
});

export const OVELHA_SCENES = Object.freeze([WAREHOUSE_01, FARM_01]);

export function getScene(id) {
  return OVELHA_SCENES.find((s) => s.id === id) || OVELHA_SCENES[0];
}

export const OVELHA_SCENE_PADRAO = 'warehouse_01';
