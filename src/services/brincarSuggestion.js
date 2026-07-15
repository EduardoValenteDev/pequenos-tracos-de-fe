/**
 * brincarSuggestion.js — "Beni sugere hoje" (Brincar B1 · §8).
 *
 * Escolha diária DETERMINÍSTICA e EQUILIBRADA de um dos jogos, sem dependência nova
 * e sem gravação em storage. PURO, nunca lança.
 *
 * Ideia: o índice avança um por DIA (rotação equilibrada 0→1→2→3→0…), deslocado por
 * um identificador estável da criança (perfis diferentes veem sugestões diferentes no
 * mesmo dia). Estável durante o mesmo dia; não muda a cada render. Fallback seguro
 * quando não houver identificador ou a data for inválida.
 */

/** 'YYYY-MM-DD' → nº de dias desde a epoch (UTC). Formato inválido → 0. */
export function dayOrdinal(dayKey) {
  if (typeof dayKey !== 'string') return 0;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);
  if (!m) return 0;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(t)) return 0;
  return Math.floor(t / 86400000);
}

/** Deslocamento estável por criança (hash simples, não-negativo). Vazio → 0. */
export function childOffset(childId) {
  const s = String(childId == null ? '' : childId);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 1000000;   // limita o tamanho; a rotação por dia continua equilibrada
}

/**
 * Índice do jogo sugerido hoje: 0..count-1, determinístico, equilibrado por dia.
 * @param {string} dayKey  'YYYY-MM-DD'
 * @param {string} childId identificador estável (ou vazio)
 * @param {number} count   nº de jogos
 */
export function pickDailyIndex(dayKey, childId, count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const base = dayOrdinal(dayKey) + childOffset(childId);
  return ((base % n) + n) % n;   // sempre dentro de 0..n-1
}

export default pickDailyIndex;
