/**
 * monteACenaShuffle.js — EMBARALHAMENTO DETERMINÍSTICO da bandeja de "Monte a Cena" (M1R8A).
 *
 * A ordem natural das peças (p00, p01, …) revela a posição correta: a peça do 1º poço corresponde ao
 * 1º alvo. Aqui geramos um DERANGEMENT (permutação SEM ponto fixo) por seed: nenhuma peça fica no
 * índice do seu próprio alvo. Só muda a POSIÇÃO VISUAL na bandeja — `pieceId`/`targetPieceId` são
 * intocados. Determinístico (mesma seed → mesma ordem), estável na rodada, salvo na sessão.
 *
 * Sem `sort(() => Math.random())`, sem `Math.random`: PRNG mulberry32 semeado por hash FNV-1a da seed.
 * Puro (sem imports/efeitos) → testável no smoke.
 */

/** Hash FNV-1a: string → uint32 determinístico. */
export function hashSeed(str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** PRNG mulberry32 (determinístico) a partir de um uint32. Retorna () => [0,1). */
export function mulberry32(a) {
  let t = a >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates com PRNG semeado (cópia; não muta a entrada). */
export function seededShuffle(arr, rng) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
  }
  return out;
}

/** Posição de grade lógica a partir do id 'pRC' (r,c de 0..2). */
function gridPos(id) {
  const s = String(id);
  return { r: parseInt(s[1], 10) || 0, c: parseInt(s[2], 10) || 0 };
}

/** DERANGEMENT: nenhuma peça no índice do seu próprio alvo (order[i] !== natural[i]). */
export function isDerangement(order, natural) {
  if (!order || order.length !== natural.length) return false;
  for (let i = 0; i < natural.length; i++) if (order[i] === natural[i]) return false;
  return true;
}

/**
 * Qualidade da grade: em 4 peças o derangement já basta (cada célula é um quadrante). Em 6/9, pelo
 * menos METADE das peças deve mudar de LINHA lógica E pelo menos metade mudar de COLUNA lógica
 * (evita embaralhamento "só troca dentro da linha/coluna").
 */
export function gridScrambleOk(order, natural) {
  const n = order.length;
  if (n <= 4) return true;
  let rowChg = 0; let colChg = 0;
  for (let i = 0; i < n; i++) {
    const a = gridPos(order[i]); const b = gridPos(natural[i]);
    if (a.r !== b.r) rowChg++;
    if (a.c !== b.c) colChg++;
  }
  const half = Math.ceil(n / 2);
  return rowChg >= half && colChg >= half;
}

/**
 * Ordem da bandeja: DERANGEMENT determinístico de `pieceIds` (ordem natural = ordem da geometria).
 * Tenta variações determinísticas da seed até satisfazer derangement + qualidade de grade; se falhar,
 * usa uma ROTAÇÃO (derangement garantido). Nunca usa Math.random.
 */
export function createSeededDerangement(pieceIds, seed) {
  const natural = pieceIds.slice();
  const n = natural.length;
  if (n <= 1) return natural;
  for (let attempt = 0; attempt < 40; attempt++) {
    const s = attempt === 0 ? String(seed) : `${seed}|v${attempt}`;
    const order = seededShuffle(natural, mulberry32(hashSeed(s)));
    if (isDerangement(order, natural) && gridScrambleOk(order, natural)) return order;
  }
  // Fallback determinístico: rotação por k (1..n-1) → derangement garantido.
  const k = 1 + (hashSeed(String(seed)) % (n - 1));
  return natural.map((_, i) => natural[(i + k) % n]);
}

export default createSeededDerangement;
