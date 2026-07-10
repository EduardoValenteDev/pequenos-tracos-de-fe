/**
 * ovelhaGameService.js — Núcleo PURO de "Cadê a Ovelhinha?" (2.1→2.2b).
 *
 * Sem I/O, sem relógio, sem React, sem áudio, nunca lança. `rnd` injetável → determinístico.
 *
 * ── Cenas autorais reais (2.2b) ───────────────────────────────────────────────
 * A rodada sorteia um ESCONDERIJO (`hidingSpot`) autoral dentro de uma cena ilustrada
 * REAL (ver ovelhaScenes). A CENA INTEIRA recebe o toque; o acerto é o ponto cair na
 * hitbox do esconderijo. A hitbox é DERIVADA do sprite processado (alpha bbox) por pose,
 * escala e clip — não é o canvas inteiro. Modos: CAMOUFLAGE / PEEK / PARTIAL (clip real,
 * nenhum oclusor geométrico colorido).
 *
 * Coordenadas de esconderijo em px de ARTE (design = dimensões do background). A conversão
 * arte↔viewport é um fator de escala único (4:5).
 */
import { getScene, OVELHA_SCENES, OVELHA_POSES, OVELHA_ORIENTACOES, OVELHA_MODOS } from '../data/ovelhaScenes';

export const OVELHA_HITBOX_MIN = 56;
export const OVELHA_ROUNDS = 5;

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
  { id: 'facil', label: 'Fácil', premium: false, minEsconderijos: 6 },
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

/* ─────────────────────────── Viewport 4:5 ─────────────────────────── */

export const CENA_RATIO = 5 / 4;   // altura/largura

export function computeViewport({ largura, altura, maxLargura = 520 }) {
  const w0 = Number(largura) > 0 ? largura : 0;
  const h0 = Number(altura) > 0 ? altura : Infinity;
  let w = Math.min(w0, maxLargura);
  let h = w * CENA_RATIO;
  if (h > h0) { h = h0; w = h / CENA_RATIO; }
  return { w: Math.round(w), h: Math.round(h), x0: Math.round((w0 - w) / 2), y0: 0 };
}

export function escalaArte(scene, viewport) {
  const dw = scene?.designWidth || 1;
  return (viewport?.w || 0) / dw;
}
export function artToPx(pt, scene, viewport) {
  const s = escalaArte(scene, viewport);
  return { px: (Number(pt?.x) || 0) * s, py: (Number(pt?.y) || 0) * s };
}
export function pxToArt(px, py, scene, viewport) {
  const s = escalaArte(scene, viewport) || 1;
  return { x: (Number(px) || 0) / s, y: (Number(py) || 0) / s };
}

/* ─────────────────────────── Sprite · clip · hitbox (derivados) ─────────────────────────── */

/** Caixa do sprite (em ARTE), centrada em spot.pos. Largura = escala × designWidth. */
export function spriteBoxArt(spot, scene) {
  const w = (Number(spot?.escala) || 0.1) * (scene?.designWidth || 1);
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
 * Hitbox em PIXELS do viewport, INFLADA ao piso de 56×56 (a área tocável pode ser maior
 * que o sprite visível quando a ovelha é pequena/distante — evita alvo microscópico sem
 * mover o desenho). Centrada na área visível.
 */
export function hitboxPxRect(spot, scene, viewport) {
  const s = escalaArte(scene, viewport);
  const a = hitboxArt(spot, scene);
  const cx = a.cx * s;
  const cy = a.cy * s;
  const w = Math.max(OVELHA_HITBOX_MIN, a.w * s);
  const h = Math.max(OVELHA_HITBOX_MIN, a.h * s);
  return { cx, cy, w, h, x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
}

export function pontoNaHitboxArte(artPt, spot, scene) {
  const r = hitboxArt(spot, scene);
  const x = Number(artPt?.x);
  const y = Number(artPt?.y);
  return x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
}

/** Um toque em px do viewport acertou a ovelha? Usa a hitbox px (inflada). PURO. */
export function toqueAcertou(px, py, spot, scene, viewport) {
  const r = hitboxPxRect(spot, scene, viewport);
  return px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1;
}

/** Célula grossa (4×4) de um ponto — id para o anti-spam de erros por região. */
export function celulaToque(artPt, scene, cols = 4, rows = 4) {
  const dw = scene?.designWidth || 1;
  const dh = scene?.designHeight || 1;
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

/** A hitbox px (inflada) fica dentro do viewport, sem estourar as bordas? */
export function spotHitboxDentroViewport(spot, scene, viewport) {
  const r = hitboxPxRect(spot, scene, viewport);
  return r.w >= OVELHA_HITBOX_MIN && r.h >= OVELHA_HITBOX_MIN
    && r.x0 >= -0.5 && r.y0 >= -0.5 && r.x1 <= viewport.w + 0.5 && r.y1 <= viewport.h + 0.5;
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
    && escalaValida(spot)
    && clipValido(spot)
    && spotVisibilidadeOk(spot)
    && spotDificuldadeOk(spot, dificuldade)
    && spriteDentroSafeArea(spot, scene);
}

export function sceneValida(scene, dificuldade = 'facil') {
  const dif = getDifficulty(dificuldade);
  const spots = (scene?.hidingSpots || []).filter((s) => spotDificuldadeOk(s, dificuldade));
  if (spots.length < (dif.minEsconderijos || 6)) return false;
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
      // troca a rodada 3 (meio), evitando colidir com vizinhas
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
