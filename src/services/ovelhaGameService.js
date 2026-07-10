/**
 * ovelhaGameService.js — Núcleo PURO de "Cadê a Ovelhinha?" (2.1 · 2.1a · 2.1b · 2.2a).
 *
 * Sem I/O, sem relógio, sem React, sem áudio, nunca lança. `rnd` injetável → determinístico.
 *
 * ── Modelo de CENA AUTORAL (2.2a) ─────────────────────────────────────────────
 * O jogo deixou de sortear 3 ícones em posições livres. Agora sorteia um ESCONDERIJO
 * (`hidingSpot`) previamente composto dentro de uma cena ilustrada (ver ovelhaScenes).
 * A rodada é `{ roundId, sceneId, spot, pose, orientacao, foreground, targetHitbox,
 * visivelFrac }`. A cena INTEIRA recebe o toque; o acerto é o ponto tocado cair dentro
 * da hitbox do esconderijo — não há mais distratores clicáveis (são parte da arte).
 *
 * Todas as coordenadas de esconderijo/hitbox vêm em COORDENADAS DE ARTE (px do design
 * `designWidth × designHeight`, 4:5). A conversão arte↔viewport é um fator de escala único.
 */
import { getScene, OVELHA_POSES, OVELHA_ORIENTACOES } from '../data/ovelhaScenes';

export const OVELHA_HITBOX_MIN = 56;
export const OVELHA_ROUNDS = 5;

/** Sentinela de "toque fora da ovelha" — vira um erro suave na máquina. */
export const MISS_ID = '__miss__';

/** Dificuldades. Só a Fácil neste bloco; a estrutura já comporta as demais (2.3). */
export const OVELHA_DIFFICULTIES = Object.freeze([
  { id: 'facil', label: 'Fácil', premium: false, minEsconderijos: 3 },
]);

export function getDifficulty(id) {
  return OVELHA_DIFFICULTIES.find((d) => d.id === id) || OVELHA_DIFFICULTIES[0];
}

/* ─────────────────────────── Utilidades ─────────────────────────── */

/** Fisher-Yates com `rnd` injetável. Não muta a entrada. */
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

export const CENA_RATIO = 5 / 4;   // altura / largura (4:5 → 1.25)

/**
 * Viewport da cena: 4:5, largura responsiva, altura derivada, teto em tablets, centrado.
 * @returns {{ w:number, h:number, x0:number, y0:number }} — x0/y0 = offset dentro do container.
 */
export function computeViewport({ largura, altura, maxLargura = 520 }) {
  const w0 = Number(largura) > 0 ? largura : 0;
  const h0 = Number(altura) > 0 ? altura : Infinity;
  let w = Math.min(w0, maxLargura);
  let h = w * CENA_RATIO;
  if (h > h0) { h = h0; w = h / CENA_RATIO; }   // não estoura a altura disponível
  return { w: Math.round(w), h: Math.round(h), x0: Math.round((w0 - w) / 2), y0: 0 };
}

/** Fator de escala arte→viewport (uniforme, pois ambos são 4:5). */
export function escalaArte(scene, viewport) {
  const dw = scene?.designWidth || 1;
  return (viewport?.w || 0) / dw;
}

/** Ponto de arte → px do viewport (relativo ao viewport, não ao container). */
export function artToPx(pt, scene, viewport) {
  const s = escalaArte(scene, viewport);
  return { px: (Number(pt?.x) || 0) * s, py: (Number(pt?.y) || 0) * s };
}

/** Px do viewport → ponto de arte. */
export function pxToArt(px, py, scene, viewport) {
  const s = escalaArte(scene, viewport) || 1;
  return { x: (Number(px) || 0) / s, y: (Number(py) || 0) / s };
}

/** Retângulo (arte) da hitbox de um esconderijo: {x0,y0,x1,y1} centrado em spot.pos. */
export function hitboxRect(spot) {
  const w = spot?.hitbox?.w || 0;
  const h = spot?.hitbox?.h || 0;
  const cx = spot?.pos?.x || 0;
  const cy = spot?.pos?.y || 0;
  return { x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
}

/** O ponto de arte cai dentro da hitbox do esconderijo? PURO. */
export function pontoNaHitboxArte(artPt, spot) {
  const r = hitboxRect(spot);
  const x = Number(artPt?.x);
  const y = Number(artPt?.y);
  return x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
}

/** Um toque em px do viewport acertou a ovelha do esconderijo? PURO. */
export function toqueAcertou(px, py, spot, scene, viewport) {
  return pontoNaHitboxArte(pxToArt(px, py, scene, viewport), spot);
}

/**
 * Célula grossa (grade 4×4 sobre a arte) de um ponto tocado — id para o ANTI-SPAM de
 * erros. Tocar sempre no mesmo lugar → mesma célula (cooldown-gated); alternar → conta.
 */
export function celulaToque(artPt, scene, cols = 4, rows = 4) {
  const dw = scene?.designWidth || 1;
  const dh = scene?.designHeight || 1;
  const c = clamp(Math.floor(((Number(artPt?.x) || 0) / dw) * cols), 0, cols - 1);
  const l = clamp(Math.floor(((Number(artPt?.y) || 0) / dh) * rows), 0, rows - 1);
  return `cell-${l}-${c}`;
}

/* ─────────────────────────── Contrato de esconderijo ─────────────────────────── */

export function poseValida(pose) {
  return OVELHA_POSES.includes(pose);
}
export function orientacaoValida(o) {
  return OVELHA_ORIENTACOES.includes(o);
}

/** O esconderijo está dentro da safe area (a hitbox não vaza a área jogável)? */
export function spotDentroSafeArea(spot, scene) {
  const sa = scene?.safeArea;
  if (!sa) return false;
  const r = hitboxRect(spot);
  return r.x0 >= sa.x - 0.5 && r.y0 >= sa.y - 0.5
    && r.x1 <= sa.x + sa.w + 0.5 && r.y1 <= sa.y + sa.h + 0.5;
}

/** A hitbox cabe no viewport (após a escala) e respeita o piso de toque de 56px? */
export function spotHitboxDentroViewport(spot, scene, viewport) {
  const s = escalaArte(scene, viewport);
  const wpx = (spot?.hitbox?.w || 0) * s;
  const hpx = (spot?.hitbox?.h || 0) * s;
  return wpx >= OVELHA_HITBOX_MIN && hpx >= OVELHA_HITBOX_MIN
    && wpx <= viewport.w + 0.5 && hpx <= viewport.h + 0.5;
}

/** O foreground referenciado pelo esconderijo existe na cena? */
export function spotForegroundExiste(spot, scene) {
  return !!(spot?.foreground && scene?.foregrounds && scene.foregrounds[spot.foreground]);
}

/** Fração visível do esconderijo declarada e parcial (≥40% e <100%). */
export function spotVisivelOk(spot, min = 0.40) {
  const v = Number(spot?.visivelFrac);
  return Number.isFinite(v) && v >= min && v < 1;
}

/** O esconderijo permite esta dificuldade? */
export function spotDificuldadeOk(spot, dificuldade) {
  return Array.isArray(spot?.dificuldades) && spot.dificuldades.includes(dificuldade);
}

/** Contrato COMPLETO de um esconderijo (sem depender do viewport). PURO. */
export function spotContratoValido(spot, scene, dificuldade = 'facil') {
  return !!spot
    && typeof spot.id === 'string'
    && poseValida(spot.pose)
    && orientacaoValida(spot.orientacao)
    && spotForegroundExiste(spot, scene)
    && spotVisivelOk(spot)
    && spotDificuldadeOk(spot, dificuldade)
    && spot?.hitbox?.w > 0 && spot?.hitbox?.h > 0
    && spotDentroSafeArea(spot, scene);
}

/** A cena tem esconderijos suficientes e todos com contrato válido? */
export function sceneValida(scene, dificuldade = 'facil') {
  const dif = getDifficulty(dificuldade);
  const spots = (scene?.hidingSpots || []).filter((s) => spotDificuldadeOk(s, dificuldade));
  if (spots.length < (dif.minEsconderijos || 3)) return false;
  return spots.every((s) => spotContratoValido(s, scene, dificuldade));
}

/* ─────────────────────────── Composição da rodada ─────────────────────────── */

/**
 * Monta uma rodada a partir de uma cena AUTORAL. PURO. Sorteia um esconderijo
 * compatível com a dificuldade, evitando repetir o anterior. Não inventa posições.
 *
 * @returns rodada válida, ou null se a cena/esconderijos não passarem no contrato.
 */
export function buildRound({ sceneId, dificuldade = 'facil', rnd = Math.random, spotAnterior = null, roundId = 0 }) {
  const scene = getScene(sceneId);
  if (!sceneValida(scene, dificuldade)) return null;

  const elegiveis = scene.hidingSpots.filter((s) => spotDificuldadeOk(s, dificuldade));
  // Evita repetir o esconderijo anterior (se houver alternativa).
  const semAnterior = elegiveis.filter((s) => s.id !== spotAnterior);
  const pool = semAnterior.length ? semAnterior : elegiveis;
  const spot = shuffle(pool, rnd)[0];
  if (!spotContratoValido(spot, scene, dificuldade)) return null;

  return {
    roundId,
    sceneId: scene.id,
    spot,
    pose: spot.pose,
    orientacao: spot.orientacao,
    foreground: spot.foreground,
    visivelFrac: spot.visivelFrac,
    targetHitbox: hitboxRect(spot),   // em coordenadas de arte
    targetId: `${scene.id}:${spot.id}:${roundId}`,
  };
}

/* ─────────────────────────── Invariantes da rodada ─────────────────────────── */

export function exactlyOneTarget(round) {
  return !!round && !!round.spot && typeof round.targetId === 'string';
}

export function targetRenderable(round) {
  const scene = getScene(round?.sceneId);
  return !!round?.spot && poseValida(round.pose) && spotForegroundExiste(round.spot, scene);
}

export function targetInsideBounds(round) {
  const scene = getScene(round?.sceneId);
  return !!round?.spot && spotDentroSafeArea(round.spot, scene);
}

export function targetHitboxValid(round, scene, viewport) {
  const sc = scene || getScene(round?.sceneId);
  return !!round?.spot && spotHitboxDentroViewport(round.spot, sc, viewport);
}

/** Fração visível do alvo aceitável (parcial, nunca total). */
export function targetVisibleAreaMinima(round, min = 0.40) {
  return !!round?.spot && spotVisivelOk(round.spot, min);
}

/** A rodada é jogável? (Sem depender do viewport — a hitbox px é checada na tela.) */
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
  TOQUE: 'card_flip',
  ACERTO: 'match_success',
  ERRO: 'match_error',
  TROCA: 'board_complete',
  VITORIA: 'classic_victory_jingle',
});

/* ─────────────────────────── Dicas (2.1b, mantidas) ─────────────────────────── */

export const DICA = Object.freeze({
  T1_MS: 10000, T2_MS: 14000, T3_MS: 18000,
  E1: 2, E2: 3, E3: 5,
});

export const ERRO_ELEGIVEL_COOLDOWN_MS = 700;

/**
 * Estágios de dica NATURAIS (2.2a — contrato). O nível numérico vira um estágio visual:
 *   1 balido (sem pista) · 2 movimento de folha/arbusto · 3 brilho discreto na região ·
 *   4 pequeno contorno na PARTE VISÍVEL da ovelha. Sem círculo grande, sem preencher.
 */
export const DICA_ESTAGIOS = Object.freeze(['nenhum', 'balido', 'movimento', 'brilho', 'contorno']);

/** Estágio de dica (0..4) a partir do nível (0..3). Nível 1 = balido; 2 = brilho; 3 = contorno.
 *  O "movimento" (estágio 2) acompanha o nível 1 como reforço não-espacial. */
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
