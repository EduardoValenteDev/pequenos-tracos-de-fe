/**
 * atelierArtNaming.js — nomes de artes ÚNICOS e amigáveis (C1.1 · §5/§6). PURO, nunca lança.
 *
 * Regras:
 *  • Nome vazio → base "Desenho de fé" (depois "Desenho de fé 2", "3", …).
 *  • Nome digitado que já existe (normalizado) → recebe o menor sufixo livre ("Meu desenho 2", …).
 *  • Duplicidade é por nome NORMALIZADO: ignora caixa, espaços nas pontas, espaços duplicados e
 *    normalização Unicode (NFC). "Meu desenho" ≡ "meu desenho" ≡ "MEU DESENHO".
 *  • Usa o MAIOR sufixo existente + 1, evitando repetição mesmo com exclusões/dados inconsistentes.
 */

export const DEFAULT_ART_BASE = 'Desenho de fé';

/** Forma canônica para COMPARAR nomes (não é o que se exibe). */
export function normalizeArtName(s) {
  return String(s == null ? '' : s).normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Forma de EXIBIÇÃO limpa (mantém a caixa; só apara/colapsa espaços). */
export function cleanArtName(s) {
  return String(s == null ? '' : s).normalize('NFC').trim().replace(/\s+/g, ' ');
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Devolve um título ÚNICO para exibir, dado o desejado e os títulos já existentes.
 * @param {string} desired      nome digitado (pode ser vazio)
 * @param {string[]} existing   títulos atuais das artes
 * @returns {string}
 */
export function resolveArtTitle(desired, existing) {
  const titles = (Array.isArray(existing) ? existing : []).map(cleanArtName).filter(Boolean);
  const normSet = new Set(titles.map(normalizeArtName));

  let base = cleanArtName(desired);
  if (!base) base = DEFAULT_ART_BASE;
  const nb = normalizeArtName(base);

  if (!normSet.has(nb)) return base;   // livre → usa como está

  // Já existe → acha o MAIOR sufixo (o "bare" conta como 1) e soma 1.
  let max = 1;
  const re = new RegExp('^' + escapeRegex(nb) + '\\s+(\\d+)$');
  for (const t of normSet) {
    const m = re.exec(t);
    if (m) { const n = parseInt(m[1], 10); if (Number.isFinite(n) && n > max) max = n; }
  }
  return `${base} ${max + 1}`;
}

/** Nome de EXIBIÇÃO para uma arte antiga (fallback seguro, nunca vazio/undefined). */
export function displayTitle(title) {
  const t = cleanArtName(title);
  return t || DEFAULT_ART_BASE;
}

export default resolveArtTitle;
