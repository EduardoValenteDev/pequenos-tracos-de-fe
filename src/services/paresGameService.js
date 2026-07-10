/**
 * paresGameService.js — Núcleo PURO do jogo "Pares do Beni" (Bloco 1.3).
 *
 * Sem I/O, sem relógio, sem React, nunca lança. Recebe o aleatório por parâmetro
 * (`rnd`) para ser determinístico no teste. É este módulo que o smoke exercita.
 *
 * As cartas usam as CAPAS das histórias, que já existem em `assets/images/*_cover.webp`.
 * Nenhum asset novo é criado.
 */

/* ══════════════════════════ MODOS (Bloco 1.4) ══════════════════════════ */

/**
 * Dois modos. O Clássico é o jogo do Bloco 1.3, intacto. O Turbo é contra o relógio.
 * `records` diz QUAL grandeza é o recorde de cada modo — o resto do código deriva daí,
 * em vez de espalhar `if (modo === 'turbo')`.
 */
export const GAME_MODES = Object.freeze([
  {
    id: 'classico',
    label: 'Modo Clássico',
    desc: 'Encontre todos os pares no seu ritmo.',
    icon: 'classico',
    timed: false,
    records: 'bestMoves',   // menos jogadas é melhor
  },
  {
    id: 'turbo',
    label: 'Modo Turbo do Beni',
    desc: 'Encontre muitos pares antes do tempo acabar.',
    icon: 'turbo',
    timed: true,
    records: 'bestScore',   // mais pontos é melhor
  },
]);

export const DEFAULT_MODE = 'classico';

export function getMode(id) {
  return GAME_MODES.find((m) => m.id === id) || GAME_MODES[0];
}

/** Turbo: 60 s de partida. O bônus por par nunca deixa o relógio passar do teto. */
export const TURBO_DURATION_MS = 60000;
export const TURBO_BONUS_MS = 2000;
export const TURBO_MAX_MS = 90000;

/** Pontuação do Turbo. Economia simples de propósito: 1 par = 100 × multiplicador. */
export const TURBO_POINTS_PER_PAIR = 100;
export const TURBO_MAX_MULTIPLIER = 5;

/**
 * Multiplicador do combo. `streak` = acertos consecutivos JÁ contabilizados,
 * incluindo o atual. 1º acerto → 1×, 2º → 2×, … teto em 5×.
 */
export function comboMultiplier(streak) {
  const n = Number(streak);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), TURBO_MAX_MULTIPLIER);
}

/** Pontos ganhos por um par, dado o combo já atualizado. */
export function pointsForMatch(streak) {
  return TURBO_POINTS_PER_PAIR * comboMultiplier(streak);
}

/**
 * Relógio do Turbo após um acerto: soma o bônus, sem passar do teto e sem ficar
 * negativo. Erro NÃO tira tempo (o público inclui crianças pequenas).
 */
export function addTurboTime(remainingMs, bonusMs = TURBO_BONUS_MS, capMs = TURBO_MAX_MS) {
  const r = Number(remainingMs);
  const base = Number.isFinite(r) && r > 0 ? r : 0;
  const b = Number.isFinite(Number(bonusMs)) ? Number(bonusMs) : 0;
  return Math.max(0, Math.min(base + b, capMs));
}

/** Recorde de PONTOS (Turbo): maior é melhor. */
export function isBetterScore(anterior, novo) {
  const n = Number(novo);
  if (!Number.isFinite(n) || n <= 0) return false;
  const a = Number(anterior);
  if (!Number.isFinite(a) || a <= 0) return true;
  return n > a;
}

/** Recorde de JOGADAS (Clássico): menos é melhor. */
export function isBetterMoves(anterior, novo) {
  const n = Number(novo);
  if (!Number.isFinite(n) || n <= 0) return false;
  const a = Number(anterior);
  if (!Number.isFinite(a) || a <= 0) return true;
  return n < a;
}

/** Dificuldades oficiais. Médio e Difícil são benefício do Plano Família. */
export const DIFFICULTIES = Object.freeze([
  { id: 'facil', label: 'Fácil', pairs: 6, cols: 3, premium: false },
  { id: 'medio', label: 'Médio', pairs: 8, cols: 4, premium: true },
  { id: 'dificil', label: 'Difícil', pairs: 12, cols: 4, premium: true },
]);

/** Teto diário de estrelinhas ganhas em Brincar — vale para TODOS os planos. */
export const BRINCAR_DAILY_STAR_CAP = 2;

export function getDifficulty(id) {
  return DIFFICULTIES.find((d) => d.id === id) || null;
}

/** Fisher-Yates. `rnd` deve devolver [0,1). Não muta a entrada. */
export function shuffle(arr, rnd = Math.random) {
  const out = Array.isArray(arr) ? arr.slice() : [];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Escolhe N histórias distintas. Se faltar história, devolve o que houver. */
export function pickStoryIds(allIds, n, rnd = Math.random) {
  const ids = (allIds || []).filter(Boolean);
  return shuffle(ids, rnd).slice(0, Math.max(0, Math.min(n, ids.length)));
}

/**
 * Baralho: cada história vira DUAS cartas, tudo embaralhado.
 * @returns {Array<{key:string, storyId:string}>}
 */
export function buildDeck(storyIds, rnd = Math.random) {
  const dobrado = [];
  (storyIds || []).forEach((id) => {
    dobrado.push({ key: `${id}#a`, storyId: id });
    dobrado.push({ key: `${id}#b`, storyId: id });
  });
  return shuffle(dobrado, rnd);
}

/** Duas cartas formam par? (mesma história, cartas diferentes) */
export function isPair(a, b) {
  if (!a || !b) return false;
  return a.key !== b.key && a.storyId === b.storyId;
}

/**
 * Pontuação 1..3 "estrelinhas do jogo" (decorativas — a estrelinha de progresso
 * é outra coisa). Nunca pune: concluir já garante 1.
 *
 * `erros` = tentativas que não formaram par.
 */
export function computeScore({ pairs, erros, elapsedMs }) {
  const p = Number(pairs) > 0 ? Number(pairs) : 1;
  const e = Number(erros) >= 0 ? Number(erros) : 0;
  const s = Number(elapsedMs) >= 0 ? Number(elapsedMs) : 0;

  let score = 1;
  if (e <= p) score++;               // poucos erros: até 1 erro por par
  if (s <= p * 12000) score++;       // ritmo tranquilo: até 12s por par
  return Math.min(3, score);
}

/** True se `ms` é um tempo melhor que o recorde anterior (null = ainda não há). */
export function isBetterTime(anteriorMs, ms) {
  const novo = Number(ms);
  if (!Number.isFinite(novo) || novo <= 0) return false;
  const velho = Number(anteriorMs);
  if (!Number.isFinite(velho) || velho <= 0) return true;
  return novo < velho;
}

/** mm:ss legível. Entrada inválida → '--:--'. */
export function formatTime(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n < 0) return '--:--';
  const total = Math.floor(n / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Eventos de som do jogo. Os valores são as CHAVES do audioManager (`playGameSfx`),
 * para a tela nunca conhecer caminho de arquivo.
 */
export const PARES_SOUND_EVENTS = Object.freeze({
  FLIP: 'card_flip',
  MATCH: 'match_success',
  MISMATCH: 'match_error',
  WIN: 'game_victory',
  TURBO_END: 'turbo_end',
});
