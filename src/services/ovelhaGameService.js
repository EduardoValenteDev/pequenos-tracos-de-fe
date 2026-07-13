/**
 * ovelhaGameService.js — Núcleo PURO de "Cadê a Ovelhinha?" (2.1→2.2c).
 *
 * Sem I/O, sem relógio, sem React, sem áudio, nunca lança. `rnd` injetável → determinístico.
 *
 * ── Enquadramento correto (2.2c) ──────────────────────────────────────────────
 * O background é exibido por CONTAIN (nunca cover, nunca zoom): a arte inteira aparece,
 * na razão real do asset (1122×1402). O viewport tem a MESMA razão da arte; qualquer
 * folga mínima de arredondamento vira um `contentRect` (retângulo REAL exibido pela
 * imagem). TODA conversão arte<->pixel passa pelo `contentRect` — é ele que alinha a ovelha
 * e a hitbox ao que o olho vê.
 *
 * ── Cenas autorais reais ──────────────────────────────────────────────────────
 * A rodada segue um esconderijo (`hidingSpot`) sobre uma cena ilustrada real (ver
 * ovelhaScenes). A CENA INTEIRA recebe o toque; o acerto é o ponto cair na hitbox
 * DERIVADA do sprite processado (alpha bbox) por pose, escala e clip — nunca o canvas.
 * Modos: CAMOUFLAGE (ovelha inteira, sem clip) · PEEK (clip lateral alinhado a borda real)
 * · PARTIAL (recorte inferior). Contrato de DIREÇÃO por pose:
 *   peekLeft  → olha à esquerda, corpo escondido à DIREITA  → clip.side = 'right'
 *   peekRight → olha à direita,  corpo escondido à ESQUERDA → clip.side = 'left'
 *   front     → só atrás de objeto baixo/entre mercadorias → sem clip ou clip.side='bottom'
 */
import { getScene, OVELHA_SCENES, OVELHA_POSES, OVELHA_ORIENTACOES, OVELHA_MODOS, cenasHabilitadas } from '../data/ovelhaScenes';
import { FASES, EFEITOS } from './ovelhaGameMachine';   // enums PUROS (import read-only; a máquina não é alterada)

export const OVELHA_HITBOX_MIN = 56;
export const OVELHA_ROUNDS = 5;

/** Dimensões PADRÃO de arte (fallback). Cada cena carrega as suas em designWidth/Height. */
export const OVELHA_ART_W = 1122;
export const OVELHA_ART_H = 1402;

/** Sentinela de "toque fora da ovelha" — vira um erro suave na máquina. */
export const MISS_ID = '__miss__';

/**
 * Aspecto (largura/altura) do ALPHA BOUNDING BOX de cada pose PROCESSADA. Fixo (arte),
 * usado para derivar a caixa do sprite sem ler o arquivo. Medido no processamento 2.2b.
 */
export const OVELHA_SPRITE_ASPECT = Object.freeze({
  front: 774 / 954,        // 0.811
  peekLeft: 596 / 757,     // 0.787
  peekRight: 706 / 749,    // 0.943
});

export function spriteAspect(pose) {
  return OVELHA_SPRITE_ASPECT[pose] || OVELHA_SPRITE_ASPECT.front;
}

/** Níveis de esconderijo (tier por spot). O modo de jogo escolhe QUAIS tiers entram. */
export const OVELHA_TIERS = Object.freeze(['facil', 'medio', 'dificil']);
export function tierValido(t) { return OVELHA_TIERS.includes(t); }

/**
 * Modos de dificuldade (2.2f). Cada modo define: nº de rodadas, piso da área clicável (pt),
 * multiplicador de escala da ovelha, quais TIERS de spot entram (+ tier predominante e a
 * probabilidade de puxar o predominante), e o tempo/forma da dica (auto no fácil; botão no
 * médio/difícil). NÃO há cronômetro punitivo em nenhum modo.
 */
// OV2 — campos adicionais (não alteram gameplay existente):
//   timerTipo: 'nenhum' (Fácil) · 'fase' (Médio, regressiva por fase) · 'partida' (Difícil, relógio
//              ÚNICO da partida inteira) · 'sessao_infinita' (Infinito, sessão com pontuação).
//   tempoLimiteMs: regressiva POR FASE (só 'fase'); tempoGlobalMs: relógio da PARTIDA (só 'partida').
//   dicaErros: [limite1, limite2] em ERROS ELEGÍVEIS — 1º limite acende brilho regional;
//              +2 (limite2) revela contorno. A dica NUNCA aponta a resposta.
export const OVELHA_DIFFICULTIES = Object.freeze([
  { id: 'facil', label: 'Fácil', premium: false, rounds: 5, hitboxMin: 64, escalaMul: 1.10, tiers: ['facil'], tierPrincipal: 'facil', predominancia: 1, dicaAuto: true, dicaMs: 8000, timerTipo: 'nenhum', tempoLimiteMs: null, tempoGlobalMs: null, dicaErros: [4, 6] },
  { id: 'medio', label: 'Médio', premium: false, rounds: 7, hitboxMin: 56, escalaMul: 1.00, tiers: ['facil', 'medio'], tierPrincipal: 'medio', predominancia: 0.7, dicaAuto: false, dicaMs: 12000, timerTipo: 'fase', tempoLimiteMs: 45000, tempoGlobalMs: null, dicaErros: [6, 8] },
  // OV3R3 — Difícil: relógio ÚNICO da PARTIDA (2min30s de busca ATIVA para encontrar as 10). NÃO usa
  // mais regressiva por fase (tempoLimiteMs: null). Zero antes das 10 → DERROTA da partida inteira.
  { id: 'dificil', label: 'Difícil', premium: false, rounds: 10, hitboxMin: 56, escalaMul: 0.92, tiers: ['medio', 'dificil'], tierPrincipal: 'dificil', predominancia: 0.7, dicaAuto: false, dicaMs: 18000, timerTipo: 'partida', tempoLimiteMs: null, tempoGlobalMs: 150000, dicaErros: [8, 10] },
  // OV3 — Modo Infinito: sem nº fixo de fases; sessão de 60s de busca ATIVA (cronômetro global,
  // não por fase). `rounds` alto é só o teto da máquina (a sessão termina pelo tempo, não por
  // contagem). Dificuldade progressiva por getInfiniteStageConfig; dica por erros [3,5]/tempo [8s,12s].
  { id: 'infinito', label: 'Infinito', premium: false, rounds: 999, hitboxMin: 56, escalaMul: 1.00, tiers: ['facil', 'medio', 'dificil'], tierPrincipal: 'medio', predominancia: 0.7, dicaAuto: false, dicaMs: 12000, timerTipo: 'sessao_infinita', tempoLimiteMs: null, tempoGlobalMs: null, dicaErros: [3, 5], infinito: true, sessaoMs: 60000 },
]);

export function getDifficulty(id) {
  return OVELHA_DIFFICULTIES.find((d) => d.id === id) || OVELHA_DIFFICULTIES[0];
}

/** Um spot é elegível num modo se o TIER dele está entre os tiers do modo. */
export function spotElegivel(spot, dificuldade = 'facil') {
  const dif = getDifficulty(dificuldade);
  return tierValido(spot?.difficulty) && dif.tiers.includes(spot.difficulty);
}

/* ─────────────────────────── RNG determinístico por seed (sem lib) ─────────────────────────── */

/** Gera uma seed de sessão (uso na UI; o núcleo puro só recebe a seed pronta). */
export function novaSeed() {
  return (Math.floor(Math.random() * 0x7fffffff) ^ (Date.now() & 0xffff)) >>> 0;
}
/** LCG determinístico a partir de uma seed → função rnd() em [0,1). PURO. */
export function criarRng(seed) {
  let s = (Number(seed) >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* ─────────────────────────── Utilidades ─────────────────────────── */

export function shuffle(arr, rnd = Math.random) {
  const out = Array.isArray(arr) ? arr.slice() : [];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ─────────────── Faixa horizontal (OV2: guarda contra padrões perceptíveis) ─────────────── */

/** Classifica um spot em 'esq' | 'cen' | 'dir' pela ZONA declarada (fallback: coordenada x real). PURO. */
export function bandaDe(spot) {
  const z = (spot && spot.zone) || '';
  const b = z.split('_')[1];
  if (b === 'esq' || b === 'cen' || b === 'dir') return b;
  const fx = spot && spot.pos ? spot.pos.x / OVELHA_ART_W : 0.5;   // art coords normalizadas
  return fx < 0.38 ? 'esq' : fx > 0.62 ? 'dir' : 'cen';
}

/** Sorteio PONDERADO determinístico (usa o RNG injetável). Peso 0/total 0 → uniforme. PURO. */
export function pickWeighted(arr, pesos, rng = Math.random) {
  const list = Array.isArray(arr) ? arr : [];
  if (!list.length) return null;
  const total = pesos.reduce((a, b) => a + (b > 0 ? b : 0), 0);
  if (!(total > 0)) return list[Math.floor((rng() || 0) * list.length)] || list[0];
  let r = rng() * total;
  for (let i = 0; i < list.length; i++) { r -= (pesos[i] > 0 ? pesos[i] : 0); if (r < 0) return list[i]; }
  return list[list.length - 1];
}

/* ─────────────────────────── Viewport + contentRect (contain) ─────────────────────────── */

/** Razão altura/largura da ARTE real (não um 4:5 nominal). */
export const CENA_RATIO = OVELHA_ART_H / OVELHA_ART_W;   // ≈ 1.2496

/**
 * Viewport que respeita a razão REAL da arte, cabendo na área disponível (contain do box).
 * A imagem preenche integralmente esse viewport; o `contentRect` cobre qualquer resíduo.
 */
export function computeViewport({ largura, altura, maxLargura = 560, artW = OVELHA_ART_W, artH = OVELHA_ART_H }) {
  const ratio = (Number(artH) > 0 && Number(artW) > 0) ? artH / artW : CENA_RATIO;
  const w0 = Number(largura) > 0 ? largura : 0;
  const h0 = Number(altura) > 0 ? altura : Infinity;
  let w = Math.min(w0, maxLargura);
  let h = w * ratio;
  if (h > h0) { h = h0; w = h / ratio; }
  return { w: Math.round(w), h: Math.round(h), x0: Math.round((w0 - w) / 2), y0: 0 };
}

/**
 * Retângulo REAL exibido pela imagem sob CONTAIN dentro do viewport. Centrado; a escala
 * é a MENOR entre ajustar por largura e por altura (nunca amplia além do "cabe inteiro").
 * @returns {{ x:number, y:number, w:number, h:number, scale:number }}
 */
export function contentRect(scene, viewport) {
  const aw = scene?.designWidth || OVELHA_ART_W;
  const ah = scene?.designHeight || OVELHA_ART_H;
  const vw = viewport?.w || 0;
  const vh = viewport?.h || 0;
  const scale = Math.min(vw / aw, vh / ah) || 0;
  const w = aw * scale;
  const h = ah * scale;
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h, scale };
}

/** Escala arte→px = escala do contentRect (contain). */
export function escalaArte(scene, viewport) {
  return contentRect(scene, viewport).scale;
}

/** Ponto de ARTE → px do viewport, através do retângulo REAL exibido. */
export function artToPx(pt, scene, viewport) {
  const cr = contentRect(scene, viewport);
  return { px: cr.x + (Number(pt?.x) || 0) * cr.scale, py: cr.y + (Number(pt?.y) || 0) * cr.scale };
}

/** px do viewport → ponto de ARTE, através do retângulo REAL exibido. */
export function pxToArt(px, py, scene, viewport) {
  const cr = contentRect(scene, viewport);
  const s = cr.scale || 1;
  return { x: ((Number(px) || 0) - cr.x) / s, y: ((Number(py) || 0) - cr.y) / s };
}

/* ─────────────────────────── Sprite · clip · hitbox (derivados) ─────────────────────────── */

/** Caixa do sprite (em ARTE), centrada em spot.pos. Largura = escala × designWidth. */
export function spriteBoxArt(spot, scene) {
  const w = (Number(spot?.escala) || 0.1) * (scene?.designWidth || OVELHA_ART_W);
  const h = w / spriteAspect(spot?.pose);
  const cx = spot?.pos?.x || 0;
  const cy = spot?.pos?.y || 0;
  return { cx, cy, w, h, x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
}

/** Fração visível efetiva do sprite: do clip (se houver) ou 1 (camuflagem/inteiro). */
export function visivelFracEfetiva(spot) {
  if (spot?.clip && Number.isFinite(Number(spot.clip.visibleFraction))) return Number(spot.clip.visibleFraction);
  const v = Number(spot?.visivelFrac);
  return Number.isFinite(v) ? v : 1;
}

/**
 * Caixa VISÍVEL do sprite (em ARTE), aplicando o clip. `clip.side` = lado ESCONDIDO
 * (alinhado a um objeto real do cenário); mostra `visibleFraction` a partir do lado oposto.
 */
export function visibleBoxArt(spot, scene) {
  const b = spriteBoxArt(spot, scene);
  const clip = spot?.clip;
  if (!clip) return b;
  const f = clamp(Number(clip.visibleFraction) || 1, 0.1, 1);
  if (clip.side === 'left') return { ...b, x0: b.x1 - b.w * f, w: b.w * f, cx: b.x1 - b.w * f / 2 };
  if (clip.side === 'right') return { ...b, x1: b.x0 + b.w * f, w: b.w * f, cx: b.x0 + b.w * f / 2 };
  if (clip.side === 'top') return { ...b, y0: b.y1 - b.h * f, h: b.h * f, cy: b.y1 - b.h * f / 2 };
  if (clip.side === 'bottom') return { ...b, y1: b.y0 + b.h * f, h: b.h * f, cy: b.y0 + b.h * f / 2 };
  return b;
}

/**
 * HITBOX (em ARTE) — a área VISÍVEL da ovelha, levemente inflada (~8%), nunca o canvas
 * inteiro. Para poses peek/partial cobre a parte aparente (cabeça/rosto/lã). PURO.
 */
export function hitboxArt(spot, scene) {
  const v = visibleBoxArt(spot, scene);
  const infl = 1.08;
  const w = v.w * infl;
  const h = v.h * infl;
  return { cx: v.cx, cy: v.cy, w, h, x0: v.cx - w / 2, y0: v.cy - h / 2, x1: v.cx + w / 2, y1: v.cy + h / 2 };
}

/** Retrocompat: retângulo da hitbox em ARTE (visível + 8%). */
export function hitboxRect(spot, scene) {
  return hitboxArt(spot, scene || getScene(spot?._sceneId));
}

/**
 * Hitbox em PIXELS do viewport, através do contentRect, INFLADA ao piso de 56×56 (a área
 * tocável pode ser maior que o sprite visível quando a ovelha é pequena/distante — evita
 * alvo microscópico sem mover o desenho). Centrada na área visível.
 */
export function hitboxPxRect(spot, scene, viewport, hitMin = OVELHA_HITBOX_MIN) {
  const cr = contentRect(scene, viewport);
  const a = hitboxArt(spot, scene);
  const piso = Number(hitMin) > 0 ? hitMin : OVELHA_HITBOX_MIN;
  const cx = cr.x + a.cx * cr.scale;
  const cy = cr.y + a.cy * cr.scale;
  const w = Math.max(piso, a.w * cr.scale);
  const h = Math.max(piso, a.h * cr.scale);
  return { cx, cy, w, h, x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
}

export function pontoNaHitboxArte(artPt, spot, scene) {
  const r = hitboxArt(spot, scene);
  const x = Number(artPt?.x);
  const y = Number(artPt?.y);
  return x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
}

/** Um toque em px do viewport acertou a ovelha? Usa a hitbox px (via contentRect). PURO. */
export function toqueAcertou(px, py, spot, scene, viewport, hitMin = OVELHA_HITBOX_MIN) {
  const r = hitboxPxRect(spot, scene, viewport, hitMin);
  return px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1;
}

/** Célula grossa (4×4) de um ponto de ARTE — id para o anti-spam de erros por região. */
export function celulaToque(artPt, scene, cols = 4, rows = 4) {
  const dw = scene?.designWidth || OVELHA_ART_W;
  const dh = scene?.designHeight || OVELHA_ART_H;
  const c = clamp(Math.floor(((Number(artPt?.x) || 0) / dw) * cols), 0, cols - 1);
  const l = clamp(Math.floor(((Number(artPt?.y) || 0) / dh) * rows), 0, rows - 1);
  return `cell-${l}-${c}`;
}

/* ─────────────────────────── Contrato de esconderijo ─────────────────────────── */

export function poseValida(pose) { return OVELHA_POSES.includes(pose); }
export function orientacaoValida(o) { return OVELHA_ORIENTACOES.includes(o); }
export function modoValido(m) { return OVELHA_MODOS.includes(m); }

/** Escala dentro da faixa jogável (6%–18% da largura da arte). */
export function escalaValida(spot) {
  const e = Number(spot?.escala);
  return Number.isFinite(e) && e >= 0.06 && e <= 0.18;
}

/** Clip válido: lado conhecido e fração visível 0.45–0.75 (Fácil). Sem clip = ok. */
export function clipValido(spot) {
  if (!spot?.clip) return true;
  const s = spot.clip.side;
  const f = Number(spot.clip.visibleFraction);
  return ['left', 'right', 'top', 'bottom'].includes(s) && f >= 0.45 && f <= 0.75;
}

/**
 * Coerência MODO × clip:
 *   CAMOUFLAGE → sem clip · PEEK → clip lateral (left/right) · PARTIAL → clip inferior (bottom).
 */
export function modoCoerente(spot) {
  if (spot?.modo === 'CAMOUFLAGE') return !spot.clip;
  if (spot?.modo === 'PEEK') return !!spot.clip && (spot.clip.side === 'left' || spot.clip.side === 'right');
  if (spot?.modo === 'PARTIAL') return !!spot.clip && spot.clip.side === 'bottom';
  return false;
}

/**
 * Contrato de DIREÇÃO por pose (regra visual 2.2c):
 *   peekLeft  exige clip.side === 'right' (objeto esconde o corpo à direita);
 *   peekRight exige clip.side === 'left'  (objeto esconde o corpo à esquerda);
 *   front sem clip OU clip inferior ('bottom'). Nunca peek com o corpo exposto no lado errado.
 */
export function poseLadoValido(spot) {
  const pose = spot?.pose;
  const side = spot?.clip?.side;
  if (pose === 'peekLeft') return side === 'right';
  if (pose === 'peekRight') return side === 'left';
  if (pose === 'front') return !spot?.clip || side === 'bottom';
  // found/celebrating/crouched não são usados como esconderijo autoral neste bloco
  return false;
}

/** Banda vertical (normalizada) permitida — nada no céu (topo) nem abaixo da arte. */
export const SPOT_Y_MIN = 0.28;
export const SPOT_Y_MAX = 0.94;
export const FRONT_Y_MIN = 0.42;   // front nunca "aéreo": só na metade inferior (chão/mercadorias)

/** O esconderijo não é aéreo (céu/parede alta)? front exige estar na parte baixa. */
export function spotNaoAereo(spot, scene) {
  const dh = scene?.designHeight || OVELHA_ART_H;
  const yN = (Number(spot?.pos?.y) || 0) / dh;
  if (yN < SPOT_Y_MIN || yN > SPOT_Y_MAX) return false;
  if (spot?.pose === 'front' && yN < FRONT_Y_MIN) return false;
  return true;
}

/** Objetos/regiões PROIBIDOS como apoio (janela, céu, parede, teto, pessoas). */
const APOIO_PROIBIDO = /janela|c[eé]u|sky|window|parede|teto|telhado|vendedor|crian|pessoa|homem|mulher|beb[eê]|rosto|face/i;

/** Todo esconderijo precisa citar um apoio visual REAL (e não uma região proibida). */
export function spotComApoio(spot) {
  const a = typeof spot?.apoio === 'string' ? spot.apoio.trim() : '';
  return a.length > 0 && !APOIO_PROIBIDO.test(a);
}

/** Sprite VISÍVEL dentro da safe area (não corta a ovelha de forma inválida). */
export function spriteDentroSafeArea(spot, scene) {
  const sa = scene?.safeArea;
  if (!sa) return false;
  const b = visibleBoxArt(spot, scene);
  // Folga pequena tolerada: o clip/borda pode encostar num objeto real da cena.
  return b.x0 >= sa.x - b.w * 0.10 && b.y0 >= sa.y - b.h * 0.10
    && b.x1 <= sa.x + sa.w + b.w * 0.10 && b.y1 <= sa.y + sa.h + b.h * 0.10;
}

/** A hitbox px (inflada) fica dentro do viewport, sem estourar as bordas? */
export function spotHitboxDentroViewport(spot, scene, viewport, hitMin = OVELHA_HITBOX_MIN) {
  const r = hitboxPxRect(spot, scene, viewport, hitMin);
  return r.w >= (hitMin || OVELHA_HITBOX_MIN) && r.h >= (hitMin || OVELHA_HITBOX_MIN)
    && r.x0 >= -0.5 && r.y0 >= -0.5 && r.x1 <= viewport.w + 0.5 && r.y1 <= viewport.h + 0.5;
}

/** Visibilidade mínima: peek/partial mantêm 45–75% visível; camuflagem ~100%. */
export function spotVisibilidadeOk(spot) {
  const f = visivelFracEfetiva(spot);
  if (spot?.modo === 'CAMOUFLAGE') return f >= 0.9;
  return f >= 0.45 && f <= 0.75;   // PEEK/PARTIAL
}

/** Retrocompat: um spot serve ao modo? (delega ao tier). */
export function spotDificuldadeOk(spot, dificuldade) {
  return spotElegivel(spot, dificuldade);
}

/** Zona (banda visual ampla) válida: string não-vazia. */
export function zoneValida(spot) {
  return typeof spot?.zone === 'string' && spot.zone.trim().length > 0;
}

/**
 * Cluster (grupo visual fino) válido: string não-vazia. Dois spots no MESMO objeto/pequena
 * região compartilham cluster; o seletor evita repetir clusters recentes. spotId diferente
 * NÃO garante esconderijo visualmente diferente — o cluster é que representa isso.
 */
export function clusterValida(spot) {
  return typeof spot?.cluster === 'string' && spot.cluster.trim().length > 0;
}

/**
 * Contrato COMPLETO de um esconderijo (sem depender do viewport). PURO.
 * Valida a estrutura, o TIER (facil/medio/dificil), a ZONA e o CLUSTER — independente do modo.
 */
export function spotContratoValido(spot, scene) {
  return !!spot
    && typeof spot.id === 'string'
    && poseValida(spot.pose)
    && orientacaoValida(spot.orientacao)
    && modoValido(spot.modo)
    && modoCoerente(spot)
    && poseLadoValido(spot)
    && escalaValida(spot)
    && clipValido(spot)
    && spotVisibilidadeOk(spot)
    && spotNaoAereo(spot, scene)
    && spotComApoio(spot)
    && tierValido(spot.difficulty)
    && zoneValida(spot)
    && clusterValida(spot)
    && spriteDentroSafeArea(spot, scene);
}

/**
 * Auditoria de configuração dos esconderijos (dev). PURO. Retorna lista de PROBLEMAS
 * (string[]) — vazia = ok. Detecta (refino 2.2f cluster): cena <18, tier <6, total <90,
 * sem zona, sem CLUSTER, id repetido, tier/escala inválidos, fora dos limites/safe area,
 * duplicados, PAR PRÓXIMO em clusters DIFERENTES (deveria compartilhar cluster),
 * concentração excessiva de um cluster e menos de N clusters distintos por cena.
 */
export function auditarSpots(
  scenes = OVELHA_SCENES,
  { minSpots = 18, minPorTier = 6, minTotal = 90, minClusters = 10, minSepDiffCluster = 0.09 } = {},
) {
  const probs = [];
  const dist = (a, bb) => Math.hypot((a.pos.x - bb.pos.x) / a._dw, (a.pos.y - bb.pos.y) / a._dh);
  let total = 0;
  for (const sc of scenes) {
    const spots = (sc.hidingSpots || []).map((s) => ({ ...s, _dw: sc.designWidth, _dh: sc.designHeight }));
    total += spots.length;
    if (spots.length < minSpots) probs.push(`${sc.id}: cena com ${spots.length} spots (<${minSpots})`);
    const ids = new Set();
    const clusters = new Set();
    const porTier = { facil: 0, medio: 0, dificil: 0 };
    const clusterPorTier = { facil: {}, medio: {}, dificil: {} };
    for (const s of spots) {
      if (!s.id || ids.has(s.id)) probs.push(`${sc.id}: id repetido/ausente "${s.id}"`); else ids.add(s.id);
      if (!tierValido(s.difficulty)) probs.push(`${sc.id}/${s.id}: tier inválido`); else porTier[s.difficulty]++;
      if (!escalaValida(s)) probs.push(`${sc.id}/${s.id}: escala inválida`);
      if (!zoneValida(s)) probs.push(`${sc.id}/${s.id}: sem zona`);
      if (!clusterValida(s)) probs.push(`${sc.id}/${s.id}: sem cluster`); else clusters.add(s.cluster);
      if (tierValido(s.difficulty) && clusterValida(s)) clusterPorTier[s.difficulty][s.cluster] = (clusterPorTier[s.difficulty][s.cluster] || 0) + 1;
      const xN = s.pos.x / sc.designWidth, yN = s.pos.y / sc.designHeight;
      if (xN < 0.05 || xN > 0.95 || yN < SPOT_Y_MIN || yN > SPOT_Y_MAX) probs.push(`${sc.id}/${s.id}: fora dos limites`);
      if (!spriteDentroSafeArea(s, sc)) probs.push(`${sc.id}/${s.id}: fora da safe area`);
    }
    for (const t of ['facil', 'medio', 'dificil']) {
      if (porTier[t] < minPorTier) probs.push(`${sc.id}: tier ${t} com ${porTier[t]} spots (<${minPorTier})`);
      // nenhum cluster pode concentrar TODOS os spots de um tier
      const maxNoCluster = Math.max(0, ...Object.values(clusterPorTier[t]));
      if (porTier[t] > 0 && maxNoCluster >= porTier[t]) probs.push(`${sc.id}: tier ${t} concentrado em 1 cluster (${maxNoCluster}/${porTier[t]})`);
    }
    if (clusters.size < minClusters) probs.push(`${sc.id}: ${clusters.size} clusters (<${minClusters})`);
    for (let i = 0; i < spots.length; i++) for (let j = i + 1; j < spots.length; j++) {
      const d = dist(spots[i], spots[j]);
      const mesmoCluster = spots[i].cluster === spots[j].cluster;
      if (d < 0.02) probs.push(`${sc.id}: ${spots[i].id}/${spots[j].id} DUPLICADOS (${d.toFixed(3)})`);
      // par visualmente próximo em clusters DIFERENTES → deveria compartilhar cluster
      else if (!mesmoCluster && d < minSepDiffCluster) probs.push(`${sc.id}: ${spots[i].id}/${spots[j].id} próximos (${d.toFixed(3)}) mas clusters diferentes`);
    }
  }
  if (total < minTotal) probs.push(`TOTAL: ${total} spots (<${minTotal})`);
  return probs;
}

/**
 * Cena jogável num modo: habilitada, TODOS os spots com contrato válido, e com pelo menos
 * DOIS spots elegíveis no modo (garante spot diferente quando a cena repete num ciclo).
 */
export function sceneValida(scene, dificuldade = 'facil') {
  if (!scene || scene.enabled === false) return false;
  if (!scene.background) return false;
  const spots = scene.hidingSpots || [];
  if (!spots.every((s) => spotContratoValido(s, scene))) return false;
  return spots.filter((s) => spotElegivel(s, dificuldade)).length >= 2;
}

/** Cena "completa" para expansão de conteúdo: ≥18 spots com contrato válido. */
export function sceneCompleta(scene) {
  const spots = scene?.hidingSpots || [];
  return spots.length >= 18 && spots.every((s) => spotContratoValido(s, scene));
}

/* ─────────────────────────── Composição da rodada ─────────────────────────── */

/** Escala efetiva do spot no modo (aplica escalaMul, mantém dentro da faixa jogável). */
export function escalaEfetiva(spot, dificuldade = 'facil') {
  const mul = getDifficulty(dificuldade).escalaMul || 1;
  return clamp((Number(spot?.escala) || 0.08) * mul, 0.06, 0.18);
}

/**
 * Monta a rodada a partir de uma cena+esconderijo já escolhidos. PURO. `escalaMul` (do modo)
 * é embutido no spot efetivo, então TODA a geometria (sprite/hitbox) usa o tamanho do modo.
 */
export function buildRoundFromSpot({ scene, spot, roundId = 0, dificuldade = 'facil' }) {
  if (!scene || !spot) return null;
  const spotEf = { ...spot, escala: escalaEfetiva(spot, dificuldade) };
  return {
    roundId,
    sceneId: scene.id,
    spot: spotEf,
    pose: spotEf.pose,
    difficulty: spot.difficulty,
    aquatico: scene.aquatico === true,
    orientacao: spotEf.orientacao,
    modo: spotEf.modo,
    clip: spotEf.clip || null,
    visivelFrac: visivelFracEfetiva(spotEf),
    targetHitbox: hitboxArt(spotEf, scene),
    spriteBox: spriteBoxArt(spotEf, scene),
    targetId: `${scene.id}:${spot.id}:${roundId}`,
  };
}

/* ─────────────────────────── Baralho de CENAS (Parte 3) ─────────────────────────── */

/**
 * Baralho de CENAS da sessão. PURO. Regras: nenhuma cena repete antes de todas aparecerem
 * (cada ciclo = embaralhada de todas); o 1º de um ciclo novo ≠ último do ciclo anterior;
 * logo, nunca há repetição consecutiva. Se rounds > nº de cenas, começa novo ciclo.
 * @returns string[] (sceneIds), tamanho = rounds.
 */
export function montarBaralhoCenas({ rounds, rng = Math.random, cenaIds = [] }) {
  const ids = Array.from(new Set(cenaIds));
  if (!ids.length) return [];
  const out = [];
  let ultimo = null;
  while (out.length < rounds) {
    let ciclo = shuffle(ids, rng);
    // 1º do novo ciclo não pode ser igual ao último já colocado (evita repetição consecutiva).
    if (ultimo != null && ciclo.length > 1 && ciclo[0] === ultimo) {
      const j = 1 + Math.floor(rng() * (ciclo.length - 1));
      [ciclo[0], ciclo[j]] = [ciclo[j], ciclo[0]];
    }
    for (const id of ciclo) { if (out.length >= rounds) break; out.push(id); ultimo = id; }
  }
  return out;
}

/* ─────────────────────────── Baralho ROTATIVO de ESCONDERIJOS (Parte 3/4) ─────────────────────────── */

/** Quantas rodadas de histórico manter por cena e quantas contam como "cluster recente". */
export const OVELHA_HIST_MAX = 12;
export const OVELHA_CLUSTER_RECENTE = 3;

/** Estado inicial do baralho rotativo (por cena×dificuldade) + histórico recente (por cena). */
export function criarDeckState() {
  return { ver: 1, decks: {}, hist: {} };
}

/** Clona o estado do baralho (mantém a pureza: a entrada nunca é mutada). PURO. */
export function clonarDeckState(ds) {
  const base = ds || criarDeckState();
  return {
    ver: 1,
    decks: Object.fromEntries(Object.entries(base.decks || {}).map(([k, v]) => [k, { restantes: (v.restantes || []).slice(), ultimoSpot: v.ultimoSpot ?? null, ultimoCluster: v.ultimoCluster ?? null }])),
    hist: Object.fromEntries(Object.entries(base.hist || {}).map(([k, v]) => [k, (v || []).slice()])),
  };
}

/** Assinatura curta do estado do baralho para um modo (Modo Criador): "cena:restantes …". */
export function assinaturaDeck(ds, dificuldade) {
  const base = ds || criarDeckState();
  const parts = Object.entries(base.decks || {})
    .filter(([k]) => k.endsWith(`::${dificuldade}`))
    .map(([k, v]) => `${k.split('::')[0].split('_')[0]}:${(v.restantes || []).length}`);
  return parts.length ? parts.join(' ') : '—';
}

/** Identificador determinístico curto (FNV-1a → base36) de um plano de partida. PURO. */
export function planId(plano) {
  const str = (plano || []).map((p) => `${p.sceneId}:${p.spotId}`).join('|');
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36).padStart(6, '0').slice(-6);
}

/**
 * Para um baralho de cenas, escolhe um SPOT por rodada consumindo um BARALHO ROTATIVO por
 * cena×dificuldade e evitando clusters/spots recentes. PURO (clona o estado, não muta a
 * entrada). Regras (Partes 3/4):
 *  - baralho por cena×dif: spot usado sai do ciclo; só retorna quando todas as alternativas
 *    elegíveis foram usadas (renova embaralhando); 1º do novo ciclo ≠ último do anterior e,
 *    quando há alternativa, cluster ≠ último cluster;
 *  - dentro da partida: nunca repete spot; evita repetir cluster;
 *  - histórico recente (por cena): evita cluster recente e a mesma combinação cena+spot no
 *    mesmo índice de rodada; prefere zona diferente da aparição anterior na partida;
 *  - predominância do tier principal; determinístico sob `rng`.
 * @returns {{ baralho: Array<{sceneId,spotId,difficulty,pose,zone,cluster}>, deckState }}
 */
export function montarBaralhoSpots({ baralhoCenas = [], dificuldade = 'facil', rng = Math.random, scenes = cenasHabilitadas(), deckState = null, stageResolver = null }) {
  // OV3 — `stageResolver(i)` opcional permite dificuldade progressiva POR ÍNDICE (Modo Infinito):
  // retorna { difId, predominancia }. Ausente (modos finitos) → comportamento IDÊNTICO ao anterior.
  const ds = clonarDeckState(deckState);
  const spotById = (scene, id) => (scene.hidingSpots || []).find((s) => s.id === id);
  const preferir = (pool, pred) => { const s = pool.filter(pred); return s.length ? s : pool; };
  const usadosGame = new Set();            // spotIds usados NESTA partida
  const clustersGame = new Set();          // clusters usados NESTA partida
  const ultimaZonaGame = {};               // zona da última aparição da cena nesta partida
  const ultimoClusterGame = {};            // cluster da última aparição da cena nesta partida
  const bandasPlano = [];                  // OV2: faixas horizontais escolhidas no plano (cruzando cenas)
  const out = [];
  for (let i = 0; i < baralhoCenas.length; i++) {
    const sceneId = baralhoCenas[i];
    const scene = scenes.find((s) => s.id === sceneId) || getScene(sceneId);
    // Dificuldade EFETIVA da rodada (fixa nos modos finitos; progressiva no Infinito).
    const stage = stageResolver ? stageResolver(i) : null;
    const difIdRod = stage && stage.difId ? stage.difId : dificuldade;
    const dif = getDifficulty(difIdRod);
    const predominancia = stage && stage.predominancia != null ? stage.predominancia : (dif.predominancia ?? 1);
    const elegiveis = (scene.hidingSpots || []).filter((s) => spotElegivel(s, difIdRod));
    if (!elegiveis.length) { out.push({ sceneId, spotId: null, difficulty: null, pose: 'front', zone: null, cluster: null }); continue; }
    const key = `${sceneId}::${difIdRod}`;
    const deck = ds.decks[key] || (ds.decks[key] = { restantes: [], ultimoSpot: null, ultimoCluster: null });
    // renova o ciclo quando esgota
    if (!deck.restantes.length) {
      let ciclo = shuffle(elegiveis.map((s) => s.id), rng);
      if (deck.ultimoSpot && ciclo.length > 1 && ciclo[0] === deck.ultimoSpot) {
        const j = ciclo.findIndex((id, k) => k > 0 && id !== deck.ultimoSpot);
        if (j > 0) { const t = ciclo[0]; ciclo[0] = ciclo[j]; ciclo[j] = t; }
      }
      if (deck.ultimoCluster && ciclo.length > 1 && spotById(scene, ciclo[0])?.cluster === deck.ultimoCluster) {
        const j = ciclo.findIndex((id, k) => k > 0 && spotById(scene, id)?.cluster !== deck.ultimoCluster && id !== deck.ultimoSpot);
        if (j > 0) { const t = ciclo[0]; ciclo[0] = ciclo[j]; ciclo[j] = t; }
      }
      deck.restantes = ciclo;
    }
    let pool = deck.restantes.map((id) => spotById(scene, id)).filter(Boolean);
    const histCena = ds.hist[sceneId] || [];
    const clustersRecentes = new Set(histCena.slice(-OVELHA_CLUSTER_RECENTE).map((h) => h.cluster));
    const spotMesmoIndice = new Set(histCena.filter((h) => h.roundIndex === i).map((h) => h.spotId));
    pool = preferir(pool, (s) => !usadosGame.has(s.id));                       // nunca repete spot na partida
    pool = preferir(pool, (s) => !clustersRecentes.has(s.cluster));           // cluster não usado recentemente (histórico)
    pool = preferir(pool, (s) => !clustersGame.has(s.cluster));               // evita repetir cluster na partida
    pool = preferir(pool, (s) => !spotMesmoIndice.has(s.id));                 // combinação cena+spot nova no índice
    if (ultimaZonaGame[sceneId]) pool = preferir(pool, (s) => s.zone !== ultimaZonaGame[sceneId]);         // zona diferente ao reaparecer
    if (ultimoClusterGame[sceneId]) pool = preferir(pool, (s) => s.cluster !== ultimoClusterGame[sceneId]); // cluster diferente ao reaparecer
    const doPrincipal = pool.filter((s) => s.difficulty === dif.tierPrincipal);
    const escolhaPool = (doPrincipal.length && rng() < predominancia) ? doPrincipal : pool;
    // OV2 — guarda de FAIXA HORIZONTAL (sem alternância fixa): os contratos (dif/cluster/zona/
    // hist/safe) já filtraram `escolhaPool`. Aqui: (a) proíbe a 3ª faixa igual seguida quando há
    // alternativa; (b) penaliza (não proíbe) repetir a faixa anterior; (c) penaliza continuar A,B,A,B.
    const nb = bandasPlano.length;
    const b1 = nb >= 1 ? bandasPlano[nb - 1] : null;   // faixa da rodada anterior
    const b2 = nb >= 2 ? bandasPlano[nb - 2] : null;
    const b3 = nb >= 3 ? bandasPlano[nb - 3] : null;
    const b4 = nb >= 4 ? bandasPlano[nb - 4] : null;
    let candBanda = escolhaPool;
    if (b1 && b1 === b2) {                              // NUNCA 3 faixas iguais quando há alternativa VÁLIDA
      // "válida" = respeita os contratos DUROS (tier elegível + não repetir spot na partida); as
      // preferências macias (cluster/zona/hist/predominância) cedem para quebrar o run de 3.
      const poolHard = deck.restantes.map((id) => spotById(scene, id)).filter((s) => s && !usadosGame.has(s.id));
      let outros = escolhaPool.filter((s) => bandaDe(s) !== b1);
      if (!outros.length) outros = pool.filter((s) => bandaDe(s) !== b1);
      if (!outros.length) outros = poolHard.filter((s) => bandaDe(s) !== b1);
      if (outros.length) candBanda = outros;            // (se NENHUM candidato de outra faixa: 3ª igual inevitável)
    }
    const abab = !!b4 && b4 === b2 && b3 === b1 && b4 !== b3;   // últimas 4 = A,B,A,B → penaliza a continuação A (=b2)
    const pesos = candBanda.map((s) => {
      const b = bandaDe(s);
      let w = 1;
      if (b1 && b === b1) w *= 0.30;                    // repetir a faixa anterior fica improvável (não proibido)
      if (abab && b === b2) w *= 0.18;                  // quebra o padrão alternado longo
      return w;
    });
    const pick = pickWeighted(candBanda, pesos, rng);
    // consome do baralho + atualiza memórias
    deck.restantes = deck.restantes.filter((id) => id !== pick.id);
    deck.ultimoSpot = pick.id; deck.ultimoCluster = pick.cluster;
    usadosGame.add(pick.id); clustersGame.add(pick.cluster);
    bandasPlano.push(bandaDe(pick));
    ultimaZonaGame[sceneId] = pick.zone; ultimoClusterGame[sceneId] = pick.cluster;
    const h = ds.hist[sceneId] || (ds.hist[sceneId] = []);
    h.push({ spotId: pick.id, cluster: pick.cluster, roundIndex: i, dificuldade: difIdRod });
    while (h.length > OVELHA_HIST_MAX) h.shift();
    out.push({ sceneId, spotId: pick.id, difficulty: pick.difficulty, pose: pick.pose, zone: pick.zone, cluster: pick.cluster });
  }
  return { baralho: out, deckState: ds };
}

/**
 * Plano da partida = baralho de cenas + baralho rotativo de esconderijos. PURO e
 * determinístico: MESMA seed + MESMO deckState inicial → MESMO plano (o deckState de entrada
 * nunca é mutado). Retorna o novo deckState (para "jogar novamente" continuar o ciclo) e um
 * planId curto para reproduzir a partida. Rodadas vêm do modo (facil 5 · medio 7 · dificil 10).
 * @returns {{ plano: Array, deckState: object, planId: string }}
 */
export function planPartida({ rng = Math.random, dificuldade = 'facil', scenes = cenasHabilitadas(), rounds, deckState = null } = {}) {
  const dif = getDifficulty(dificuldade);
  const total = Number(rounds) > 0 ? rounds : dif.rounds;
  const validas = scenes.filter((sc) => sceneValida(sc, dificuldade));
  if (!validas.length) return { plano: [], deckState: clonarDeckState(deckState), planId: planId([]) };
  const baralhoCenas = montarBaralhoCenas({ rounds: total, rng, cenaIds: validas.map((s) => s.id) });
  const { baralho, deckState: ds } = montarBaralhoSpots({ baralhoCenas, dificuldade, rng, scenes: validas, deckState });
  return { plano: baralho, deckState: ds, planId: planId(baralho) };
}

/* ─────────────────────────── Modo Infinito (OV3) ─────────────────────────── */

/** Constantes do Infinito. Pontuação transparente, sem punição, sem moedas/vidas/energia. */
export const INFINITO = Object.freeze({
  SESSAO_MS: 60000,            // 60s de busca ATIVA (cronômetro global; não por fase)
  PLANO_MAX: 60,               // fases pré-sorteadas por sessão (folga p/ a sessão inteira)
  BASE: 100,                   // pontos por ovelha encontrada
  VEL_5S_MS: 5000, VEL_10S_MS: 10000, BONUS_VEL_5: 50, BONUS_VEL_10: 25,
  BONUS_PERFEITO: 25,          // sem erro elegível e sem dica
  BONUS_SEQ_POR_NIVEL: 20, BONUS_SEQ_TETO: 100,
  MARCO_A_CADA: 5, BONUS_MARCO: 200,
  DICA_ERROS: [3, 5],          // 1º brilho após 3 erros elegíveis; contorno após 5
  DICA_MS: [8000, 12000],      // ou 8s / 12s ativos na mesma fase
});

/**
 * Dificuldade progressiva do Infinito por nº de ovelhas já encontradas (0-based no índice da
 * fase a sortear). Faixa 1 (1–5) ≈ Médio; Faixa 2 (6–12) ≈ Difícil; Faixa 3 (13+) = Difícil com
 * prioridade a spots mais difíceis. NÃO altera scene/hitbox/escala/assets — só escolhe tiers. PURO.
 */
export function getInfiniteStageConfig(encontradas) {
  const n = Math.max(0, Math.floor(Number(encontradas) || 0));
  if (n < 5) return { faixa: 1, difId: 'medio', predominancia: 0.7, priorizarDificil: false };
  if (n < 12) return { faixa: 2, difId: 'dificil', predominancia: 0.7, priorizarDificil: false };
  return { faixa: 3, difId: 'dificil', predominancia: 0.85, priorizarDificil: true };
}

/**
 * Plano do Infinito: baralho de cenas + spots com dificuldade PROGRESSIVA por índice (Faixas).
 * Reusa integralmente as sacolas, o guarda de faixa e o ABABA (via montarBaralhoSpots + stageResolver).
 * PURO/determinístico sob `rng`. `total` grande cobre a sessão sem repetir a sequência. PURO.
 * @returns {{ plano: Array, deckState: object, planId: string }}
 */
export function planPartidaInfinito({ rng = Math.random, scenes = cenasHabilitadas(), total = INFINITO.PLANO_MAX, deckState = null } = {}) {
  // Cenas válidas para AMBAS as bases usadas (médio e difícil) — todas têm 6/6/6 spots por tier.
  const validas = scenes.filter((sc) => sceneValida(sc, 'medio') && sceneValida(sc, 'dificil'));
  if (!validas.length) return { plano: [], deckState: clonarDeckState(deckState), planId: planId([]) };
  const baralhoCenas = montarBaralhoCenas({ rounds: total, rng, cenaIds: validas.map((s) => s.id) });
  const stageResolver = (i) => { const c = getInfiniteStageConfig(i); return { difId: c.difId, predominancia: c.predominancia }; };
  const { baralho, deckState: ds } = montarBaralhoSpots({ baralhoCenas, dificuldade: 'medio', rng, scenes: validas, deckState, stageResolver });
  return { plano: baralho, deckState: ds, planId: planId(baralho) };
}

/**
 * Pontuação de UMA fase do Infinito. PURO/determinístico. `sequenciaAntes` = sequência perfeita
 * ANTES desta fase. Base 100 sempre; velocidade (sem dica); perfeito (sem erro e sem dica);
 * sequência perfeita (20×seq, teto 100). Nunca desconta. Não usa moeda/vida/energia.
 * @returns {{ pontos, perfeita, novaSequencia }}
 */
export function pontosFaseInfinito({ ms, houveErro = false, usouDica = false, sequenciaAntes = 0 } = {}) {
  const t = Math.max(0, Number(ms) || 0);
  const semErro = !houveErro;
  const semDica = !usouDica;
  let pontos = INFINITO.BASE;
  if (semDica) {
    if (t <= INFINITO.VEL_5S_MS) pontos += INFINITO.BONUS_VEL_5;
    else if (t <= INFINITO.VEL_10S_MS) pontos += INFINITO.BONUS_VEL_10;
  }
  const perfeita = semErro && semDica;
  if (perfeita) pontos += INFINITO.BONUS_PERFEITO;
  const seqAntes = Math.max(0, Math.floor(Number(sequenciaAntes) || 0));
  const novaSequencia = perfeita ? seqAntes + 1 : 0;   // erro/dica quebram a sequência
  if (novaSequencia > 0) pontos += Math.min(INFINITO.BONUS_SEQ_TETO, INFINITO.BONUS_SEQ_POR_NIVEL * novaSequencia);
  return { pontos, perfeita, novaSequencia };
}

/** Bônus de MARCO: +200 a cada 5 ovelhas encontradas (encontradas > 0). PURO. */
export function bonusMarcoInfinito(encontradas) {
  const n = Math.floor(Number(encontradas) || 0);
  return (n > 0 && n % INFINITO.MARCO_A_CADA === 0) ? INFINITO.BONUS_MARCO : 0;
}

/** Nível de dica do Infinito por tempo ATIVO na fase (8s→brilho, 12s→contorno). Combina com erros. PURO. */
export function nivelDicaInfinitoPorTempo(msAtivos) {
  const t = Math.max(0, Number(msAtivos) || 0);
  if (t >= INFINITO.DICA_MS[1]) return 3;
  if (t >= INFINITO.DICA_MS[0]) return 2;
  return 0;
}

/* ─────────────────────────── OV3R2 — Tempo esgotado encerra a fase (finitos) ─────────────────────────── */

/**
 * Resolução PURA de "tempo esgotado" numa fase FINITA (Médio/Difícil). Espelha `avancar` da máquina,
 * porém a partir de PROCURANDO e SEM contabilizar ovelha: NÃO incrementa `encontradas`, ZERA a
 * sequência corrente (mantém `bestSequencia`) e avança a fase. Última fase → FIM (finaliza); senão →
 * TROCANDO (próxima rodada). Determinística; devolve `{ estado, efeitos }` no mesmo contrato da máquina.
 * A máquina de estados NÃO é alterada — este helper só reusa os enums FASES/EFEITOS.
 */
export function expirarFaseFinita(estado) {
  if (!estado || estado.fase !== FASES.PROCURANDO) return { estado, efeitos: [] };
  const base = { ...estado, sequencia: 0 };   // timeout quebra a sequência atual (bestSequencia intacto)
  if (estado.rodada >= estado.rounds) {
    return { estado: { ...base, fase: FASES.FIM }, efeitos: [EFEITOS.FINALIZAR] };
  }
  return {
    estado: { ...base, fase: FASES.TROCANDO, rodada: estado.rodada + 1, targetId: null, itemIds: [] },
    efeitos: [EFEITOS.SOM_TROCA],
  };
}

/* ─────────────────────────── Invariantes da rodada ─────────────────────────── */

export function exactlyOneTarget(round) {
  return !!round && !!round.spot && typeof round.targetId === 'string';
}
export function targetRenderable(round) {
  return !!round?.spot && poseValida(round.pose) && modoValido(round.modo);
}
export function targetInsideBounds(round) {
  const scene = getScene(round?.sceneId);
  return !!round?.spot && spriteDentroSafeArea(round.spot, scene);
}
export function targetHitboxValid(round, scene, viewport) {
  const sc = scene || getScene(round?.sceneId);
  return !!round?.spot && spotHitboxDentroViewport(round.spot, sc, viewport);
}
export function targetVisibleAreaMinima(round, min = 0.40) {
  return !!round?.spot && visivelFracEfetiva(round.spot) >= min;
}
export function roundValido(round) {
  if (!round || !round.spot) return false;
  const scene = getScene(round.sceneId);
  return exactlyOneTarget(round)
    && targetRenderable(round)
    && targetInsideBounds(round)
    && targetVisibleAreaMinima(round)
    && spotContratoValido(round.spot, scene);
}

/* ─────────────────────────── Som ─────────────────────────── */

export const OVELHA_SOUND_EVENTS = Object.freeze({
  TOQUE: 'card_flip', ACERTO: 'match_success', ERRO: 'match_error',
  TROCA: 'board_complete', VITORIA: 'classic_victory_jingle',
});

/* ─────────────────────────── Dicas (por rodada, anti-spam) ─────────────────────────── */

export const DICA = Object.freeze({ T1_MS: 10000, T2_MS: 14000, T3_MS: 18000, E1: 2, E2: 3, E3: 5 });
export const ERRO_ELEGIVEL_COOLDOWN_MS = 700;
export const DICA_ESTAGIOS = Object.freeze(['nenhum', 'incentivo', 'movimento', 'brilho', 'contorno']);

export function estagioDica(nivel) {
  const n = Number(nivel) || 0;
  return clamp(n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 3 : 4, 0, 4);
}
export function erroElegivel({ id, ultimoId, agoraMs, ultimoMs }, cooldown = ERRO_ELEGIVEL_COOLDOWN_MS) {
  if (id !== ultimoId) return true;
  return (Number(agoraMs) - Number(ultimoMs)) >= cooldown;
}
export function nivelDica(elapsedMs, errosElegiveis) {
  const t = Number(elapsedMs) || 0;
  const e = Number(errosElegiveis) || 0;
  let nivel = 0;
  if (t >= DICA.T1_MS || e >= DICA.E1) nivel = 1;
  if (t >= DICA.T2_MS || e >= DICA.E2) nivel = 2;
  if (t >= DICA.T3_MS || e >= DICA.E3) nivel = 3;
  return nivel;
}

/**
 * OV2 — dica POR ERROS ELEGÍVEIS (independe de tempo). `limites` = [limite1, limite2].
 *   e >= limite1  → nível 2 (brilho regional; o nível 1 região é implícito).
 *   e >= limite2  → nível 3 (contorno). Nunca aponta a resposta.
 * Sem limites válidos → 0 (o modo não escala dica por erro).
 */
export function nivelDicaPorErros(errosElegiveis, limites) {
  const e = Number(errosElegiveis) || 0;
  const l1 = Array.isArray(limites) ? Number(limites[0]) : NaN;
  const l2 = Array.isArray(limites) ? Number(limites[1]) : NaN;
  if (l2 > 0 && e >= l2) return 3;
  if (l1 > 0 && e >= l1) return 2;
  return 0;
}

/** OV2 — formata ms para exibição infantil: "8s" (<1min) ou "1:05". `ceil` p/ regressiva.
 *  OV3R3 — `mmss` força SEMPRE M:SS (ex.: relógio da PARTIDA do Difícil: "2:30", "0:09", "0:00"). */
export function formatarTempoMs(ms, ceil = false, mmss = false) {
  const seg = (Number(ms) || 0) / 1000;
  const n = Math.max(0, ceil ? Math.ceil(seg) : Math.round(seg));
  const m = Math.floor(n / 60);
  const s = n % 60;
  if (mmss) return `${m}:${String(s).padStart(2, '0')}`;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}
