/**
 * ovelhaGameService.js — Núcleo PURO de "Cadê a Ovelhinha?" (2.1→2.2c).
 *
 * Sem I/O, sem relógio, sem React, sem áudio, nunca lança. `rnd` injetável → determinístico.
 *
 * ── Enquadramento correto (2.2c) ──────────────────────────────────────────────
 * O background é exibido por CONTAIN (nunca cover, nunca zoom): a arte inteira aparece,
 * na razão real do asset (1122×1402). O viewport tem a MESMA razão da arte; qualquer
 * folga mínima de arredondamento vira um `contentRect` (retângulo REAL exibido pela
 * imagem). TODA conversão arte↔pixel passa pelo `contentRect` — é ele que alinha a ovelha
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
import { getScene, OVELHA_SCENES, OVELHA_POSES, OVELHA_ORIENTACOES, OVELHA_MODOS } from '../data/ovelhaScenes';

export const OVELHA_HITBOX_MIN = 56;
export const OVELHA_ROUNDS = 5;

/** Dimensões REAIS dos backgrounds integrados (px de arte). Base do enquadramento. */
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

export const OVELHA_DIFFICULTIES = Object.freeze([
  { id: 'facil', label: 'Fácil', premium: false, minEsconderijos: 4 },
]);

export function getDifficulty(id) {
  return OVELHA_DIFFICULTIES.find((d) => d.id === id) || OVELHA_DIFFICULTIES[0];
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
export function hitboxPxRect(spot, scene, viewport) {
  const cr = contentRect(scene, viewport);
  const a = hitboxArt(spot, scene);
  const cx = cr.x + a.cx * cr.scale;
  const cy = cr.y + a.cy * cr.scale;
  const w = Math.max(OVELHA_HITBOX_MIN, a.w * cr.scale);
  const h = Math.max(OVELHA_HITBOX_MIN, a.h * cr.scale);
  return { cx, cy, w, h, x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
}

export function pontoNaHitboxArte(artPt, spot, scene) {
  const r = hitboxArt(spot, scene);
  const x = Number(artPt?.x);
  const y = Number(artPt?.y);
  return x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
}

/** Um toque em px do viewport acertou a ovelha? Usa a hitbox px (via contentRect). PURO. */
export function toqueAcertou(px, py, spot, scene, viewport) {
  const r = hitboxPxRect(spot, scene, viewport);
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
export function spotHitboxDentroViewport(spot, scene, viewport) {
  const r = hitboxPxRect(spot, scene, viewport);
  return r.w >= OVELHA_HITBOX_MIN && r.h >= OVELHA_HITBOX_MIN
    && r.x0 >= -0.5 && r.y0 >= -0.5 && r.x1 <= viewport.w + 0.5 && r.y1 <= viewport.h + 0.5;
}

/** Visibilidade mínima: peek/partial mantêm 45–75% visível; camuflagem ~100%. */
export function spotVisibilidadeOk(spot) {
  const f = visivelFracEfetiva(spot);
  if (spot?.modo === 'CAMOUFLAGE') return f >= 0.9;
  return f >= 0.45 && f <= 0.75;   // PEEK/PARTIAL
}

export function spotDificuldadeOk(spot, dificuldade) {
  return Array.isArray(spot?.dificuldades) && spot.dificuldades.includes(dificuldade);
}

/** Contrato COMPLETO de um esconderijo (sem depender do viewport). PURO. */
export function spotContratoValido(spot, scene, dificuldade = 'facil') {
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
    && spotDificuldadeOk(spot, dificuldade)
    && spriteDentroSafeArea(spot, scene);
}

export function sceneValida(scene, dificuldade = 'facil') {
  const dif = getDifficulty(dificuldade);
  const spots = (scene?.hidingSpots || []).filter((s) => spotDificuldadeOk(s, dificuldade));
  if (spots.length < (dif.minEsconderijos || 4)) return false;
  return !!scene?.background && spots.every((s) => spotContratoValido(s, scene, dificuldade));
}

/* ─────────────────────────── Composição da rodada ─────────────────────────── */

/** Monta a rodada a partir de uma cena+esconderijo já escolhidos. PURO. */
export function buildRoundFromSpot({ scene, spot, roundId = 0 }) {
  if (!scene || !spot) return null;
  return {
    roundId,
    sceneId: scene.id,
    spot,
    pose: spot.pose,
    orientacao: spot.orientacao,
    modo: spot.modo,
    clip: spot.clip || null,
    visivelFrac: visivelFracEfetiva(spot),
    targetHitbox: hitboxArt(spot, scene),
    spriteBox: spriteBoxArt(spot, scene),
    targetId: `${scene.id}:${spot.id}:${roundId}`,
  };
}

/** Sorteia UMA rodada (uma cena, um esconderijo), evitando repetir cena/esconderijo. */
export function buildRound({ dificuldade = 'facil', rnd = Math.random, sceneAnterior = null, spotAnterior = null, roundId = 0, scenes = OVELHA_SCENES }) {
  const validas = scenes.filter((sc) => sceneValida(sc, dificuldade));
  if (!validas.length) return null;
  const semCena = validas.filter((sc) => sc.id !== sceneAnterior);
  const cenaPool = semCena.length ? semCena : validas;
  const scene = shuffle(cenaPool, rnd)[0];

  const elegiveis = scene.hidingSpots.filter((s) => spotDificuldadeOk(s, dificuldade));
  const semSpot = elegiveis.filter((s) => s.id !== spotAnterior);
  const spotPool = semSpot.length ? semSpot : elegiveis;
  const spot = shuffle(spotPool, rnd)[0];
  if (!spotContratoValido(spot, scene, dificuldade)) return null;

  return buildRoundFromSpot({ scene, spot, roundId });
}

/**
 * Plano DETERMINÍSTICO da partida (5 rodadas): alterna as cenas quando possível, não
 * repete esconderijo, garante ≥2 poses distintas e nunca só `front`. PURO.
 * @returns Array<{ sceneId, spotId, pose }>
 */
export function planPartida({ rounds = 5, rnd = Math.random, dificuldade = 'facil', scenes = OVELHA_SCENES }) {
  const validas = scenes.filter((sc) => sceneValida(sc, dificuldade));
  const todos = validas.flatMap((sc) => sc.hidingSpots
    .filter((s) => spotDificuldadeOk(s, dificuldade))
    .map((s) => ({ sceneId: sc.id, spotId: s.id, pose: s.pose })));
  if (!todos.length) return [];

  const plano = [];
  let prevScene = null, prevSpot = null;
  for (let i = 0; i < rounds; i++) {
    let cand = todos.filter((x) => x.sceneId !== prevScene && x.spotId !== prevSpot);
    if (!cand.length) cand = todos.filter((x) => x.spotId !== prevSpot);
    if (!cand.length) cand = todos;
    const pick = shuffle(cand, rnd)[0];
    plano.push(pick);
    prevScene = pick.sceneId; prevSpot = pick.spotId;
  }

  // Garante ≥2 poses distintas e não-só-front trocando uma rodada por um spot de pose diferente.
  const poses = plano.map((p) => p.pose);
  const soFront = poses.every((p) => p === 'front');
  const umaPoseSo = new Set(poses).size < 2;
  if (soFront || umaPoseSo) {
    const alvoPose = poses[0];
    const alt = shuffle(todos.filter((x) => x.pose !== alvoPose), rnd)[0];
    if (alt) {
      const idx = Math.min(2, plano.length - 1);
      if (plano[idx].spotId !== plano[Math.max(0, idx - 1)].spotId) plano[idx] = alt;
      else plano[Math.min(plano.length - 1, idx + 1)] = alt;
    }
  }
  return plano;
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
export function roundValido(round, dificuldade = 'facil') {
  if (!round || !round.spot) return false;
  const scene = getScene(round.sceneId);
  return exactlyOneTarget(round)
    && targetRenderable(round)
    && targetInsideBounds(round)
    && targetVisibleAreaMinima(round)
    && spotContratoValido(round.spot, scene, dificuldade);
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
