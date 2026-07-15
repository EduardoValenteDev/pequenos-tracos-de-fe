/**
 * onboardingName.js — regras PURAS do nome do onboarding (O2 · §12). Nunca lança, sem I/O.
 *
 * • Aceita Unicode e acentos.
 * • Aparado (trim) e com espaços internos normalizados (colapsados).
 * • Não pode ser vazio nem formado apenas por pontuação/símbolos (exige ≥1 letra ou número).
 * • Limite de 20 caracteres (após normalizar).
 * O nome NUNCA sai do aparelho; não há moderação remota.
 */
export const NAME_MAX = 20;

/** Forma canônica exibível: NFC + colapsa espaços + trim. */
export function normalizeName(raw) {
  return String(raw == null ? '' : raw).normalize('NFC').replace(/\s+/g, ' ').trim();
}

/** Tem ao menos uma letra OU número (qualquer idioma)? */
export function hasLetterOrNumber(s) {
  return /[\p{L}\p{N}]/u.test(String(s == null ? '' : s));
}

/** Nome válido = normalizado não-vazio, com ≥1 letra/número e dentro do limite. */
export function isValidName(raw) {
  const n = normalizeName(raw);
  return n.length > 0 && n.length <= NAME_MAX && hasLetterOrNumber(n);
}

/** Nome final a persistir (normalizado + cortado no limite). Vazio inválido → ''. */
export function finalizeName(raw) {
  const n = normalizeName(raw).slice(0, NAME_MAX);
  return isValidName(n) ? n : '';
}

export default isValidName;
