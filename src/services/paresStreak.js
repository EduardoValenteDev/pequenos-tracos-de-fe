/**
 * paresStreak.js — "Fogo da Memória": sequência de PARES consecutivos (R2B · §8).
 *
 * Núcleo PURO (sem React, sem I/O, nunca lança). A CONTAGEM da sequência já vive na
 * máquina do jogo (`combo` = acertos seguidos, zerado no erro; `maiorCombo` = melhor).
 * Aqui só se DERIVA o nível visual e o rótulo — a máquina não muda. Assim Clássico e
 * Turbo compartilham exatamente o mesmo sistema, e o smoke exercita a regra de verdade.
 *
 * Conta PARES, não cartas: a máquina só incrementa `combo` quando um par fecha.
 */

/** A partir de quantos pares seguidos acende o "Fogo da Memória". */
export const FOGO_THRESHOLD = 4;

/**
 * Nível da chama pela sequência:
 *   0–1 par → 0 (sem chama) · 2 → 1 (acesa) · 3 → 2 (maior) · 4+ → 3 (Fogo da Memória)
 */
export function streakLevel(streak) {
  const n = Number(streak);
  if (!Number.isFinite(n) || n < 2) return 0;
  if (n >= FOGO_THRESHOLD) return 3;
  if (n >= 3) return 2;
  return 1;
}

/** True quando a sequência acende o Fogo da Memória (4+ pares seguidos). */
export function isFogo(streak) {
  return streakLevel(streak) >= 3;
}

/**
 * Rótulo positivo da sequência. Abaixo de 2 não há rótulo (string vazia). Nunca texto
 * negativo — o erro apenas zera a sequência, sem punição.
 */
export function streakLabel(streak) {
  const n = Number(streak);
  if (!Number.isFinite(n) || n < 2) return '';
  if (n >= FOGO_THRESHOLD) return 'Fogo da Memória!';
  return `Sequência ${Math.floor(n)}×`;
}

/**
 * Fotografia da sequência para a UI. `eventId` cresce a cada NOVO par — é ele que
 * dispara a centelha uma única vez, sem um evento antigo apagar o efeito novo (§8).
 * @returns {{currentStreak:number,bestStreak:number,streakLevel:number,fogo:boolean,label:string,streakEventId:number}}
 */
export function streakSnapshot(currentStreak, bestStreak, eventId) {
  const cur = Number.isFinite(Number(currentStreak)) && Number(currentStreak) > 0 ? Math.floor(Number(currentStreak)) : 0;
  const best = Number.isFinite(Number(bestStreak)) && Number(bestStreak) > 0 ? Math.floor(Number(bestStreak)) : 0;
  return {
    currentStreak: cur,
    bestStreak: Math.max(best, cur),
    streakLevel: streakLevel(cur),
    fogo: isFogo(cur),
    label: streakLabel(cur),
    streakEventId: Number.isFinite(Number(eventId)) ? Math.floor(Number(eventId)) : 0,
  };
}

export default streakSnapshot;
