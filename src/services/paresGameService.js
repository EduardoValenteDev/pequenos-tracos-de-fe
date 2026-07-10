/**
 * paresGameService.js — Núcleo PURO do jogo "Pares do Beni" (Bloco 1.3).
 *
 * Sem I/O, sem relógio, sem React, nunca lança. Recebe o aleatório por parâmetro
 * (`rnd`) para ser determinístico no teste. É este módulo que o smoke exercita.
 *
 * As cartas usam as CAPAS das histórias, que já existem em `assets/images/*_cover.webp`.
 * Nenhum asset novo é criado.
 */

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
 * Pontos de extensão de SOM (Bloco 1.7 liga isso ao audioManager).
 * Nenhum arquivo de som existe ainda — são só nomes de evento.
 */
export const PARES_SOUND_EVENTS = Object.freeze({
  FLIP: 'brincar.pares.flip',
  MATCH: 'brincar.pares.match',
  MISMATCH: 'brincar.pares.mismatch',
  WIN: 'brincar.pares.win',
});
