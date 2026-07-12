/**
 * palavrinhasWords.js — BANCO de palavras de "Palavrinhas do Beni" (Fase 0 · T-A1).
 *
 * MÓDULO PURO: sem React Native, sem Expo, sem UI, sem áudio, sem imagem (nenhum `require`
 * de asset), sem storage. Só dados + derivações determinísticas. Avaliável fora do RN
 * (smoke via `new Function`). Ver spec §10 e plan (regra de módulos puros).
 *
 * ── Estrutura por palavra (spec §10.1) ────────────────────────────────────────
 *   id · word · displayWord · normalizedWord · letters · letterInstances · syllables? ·
 *   difficulty · category · imageRef · enabled · activityEligibility · missingPatterns ·
 *   distractors · focusLetters · traceTargets · accentRules · confusableLetters ·
 *   reinforcementPatterns.
 *
 * ── Regras (Portão 1) ─────────────────────────────────────────────────────────
 *   - Letras repetidas = INSTÂNCIAS próprias (`letterInstances[].iid`), não só o caractere.
 *   - `displayWord` preserva o glifo visual (acentos/Ç); `normalizedWord` é só lógica.
 *   - Acentos/Ç ficam RESTRITOS ao Difícil e só depois da infra validada → tais palavras
 *     nascem `enabled: false` (não entram no jogo na v1).
 *   - `imageRef` é METADADO SEGURO (chave + status), nunca um caminho de asset exigido.
 *     Status: 'reuso-candidato' (avaliado no Portão Visual 2) · 'novo' (produção P13).
 */

/** Categorias válidas (spec §10). */
export const PALAVRINHAS_CATEGORIAS = Object.freeze([
  'animais', 'natureza', 'objetos', 'alimentos', 'familia', 'biblia', 'app',
]);

/** Confusões de letras a tratar (spec §20) — nunca exploradas por distratores enganosos. */
export const PALAVRINHAS_CONFUSOES = Object.freeze([
  ['B', 'D'], ['P', 'B'], ['M', 'N'], ['F', 'T'], ['C', 'G'], ['O', 'Q'], ['I', 'L'],
]);

const POOL_DISTRATOR = 'ABCDEFGHIJLMNOPQRSTUVZ'.split('');

/** Remove acentos (mantém caixa). PURO. */
const semAcento = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '');
/** Normalização de lógica: sem acento, Ç→C, maiúsculas. NUNCA usado para exibir. PURO. */
const normalizar = (w) => semAcento(w).replace(/[Çç]/g, 'C').toUpperCase();
/** A palavra depende de infraestrutura de acentos/Ç ainda não validada? PURO. */
const dependeInfra = (w) => /[ÁÉÍÓÚÂÊÔÀÃÕÇ]/.test(w);

/** missingPatterns padrão por dificuldade (índices sempre válidos, dentro do tamanho). */
const gerarMissing = (letters, difficulty) => {
  const n = letters.length;
  const complete = [];
  for (let i = 0; i < n; i++) complete.push([i]);            // lacunas de 1 letra em cada posição
  if (difficulty !== 'facil' && n >= 4) complete.push([1, n - 1]); // 1 padrão de 2 letras nos modos maiores
  return Object.freeze({ complete: Object.freeze(complete.map((p) => Object.freeze(p))), monte: Object.freeze(['ALL']) });
};

/** Distratores padrão: letras maiúsculas que NÃO estão na palavra (determinístico). */
const gerarDistratores = (letters) => POOL_DISTRATOR.filter((c) => !letters.includes(c)).slice(0, 3);

/** Letras confundíveis presentes na palavra (spec §20). */
const gerarConfundiveis = (letters) => {
  const set = new Set();
  for (const [a, b] of PALAVRINHAS_CONFUSOES) if (letters.includes(a) || letters.includes(b)) { set.add(a); set.add(b); }
  return [...set];
};

/**
 * Fábrica de palavra. Deriva letters/letterInstances/normalizedWord de `displayWord` e
 * aplica defaults determinísticos. `enabled` cai para false quando a palavra depende de
 * acentos/Ç (infra não validada). PURO.
 */
const palavra = ({ id, displayWord, difficulty, category, img, enabled }) => {
  const word = displayWord;                          // canônica = exibida (maiúsculas, com acento)
  const letters = Array.from(displayWord);           // cada glifo é um cartão (Ç/acento = 1 cartão)
  const letterInstances = letters.map((ch, pos) => ({ iid: `${id}#${pos}`, ch, pos }));
  const normalizedWord = normalizar(displayWord);
  const infra = dependeInfra(displayWord);
  const focusLetters = [...new Set(letters.filter((c) => !dependeInfra(c)))]; // sem acento/Ç no traçado
  return Object.freeze({
    id,
    word,
    displayWord,
    normalizedWord,
    letters: Object.freeze(letters),
    letterInstances: Object.freeze(letterInstances.map((li) => Object.freeze(li))),
    syllables: null,                                 // opcional; não usado na Fase 0
    difficulty,
    category,
    imageRef: Object.freeze({ key: img.key, status: img.status }),   // METADADO seguro (sem require)
    enabled: enabled != null ? enabled : !infra,     // acentuadas/Ç ⇒ false até infra validar
    activityEligibility: Object.freeze({ complete: true, monte: true, trace: focusLetters.length > 0 }),
    missingPatterns: gerarMissing(letters, difficulty),
    distractors: Object.freeze(gerarDistratores(letters)),
    focusLetters: Object.freeze(focusLetters),
    traceTargets: Object.freeze(focusLetters.slice()),   // metadados (geometria real só no protótipo)
    accentRules: Object.freeze({ hasAccent: infra, accentChars: Object.freeze([...new Set(letters.filter(dependeInfra))]), introducedAt: 'dificil' }),
    confusableLetters: Object.freeze(gerarConfundiveis(letters)),
    reinforcementPatterns: Object.freeze({ pattern: Object.freeze([Math.max(0, letters.length - 2)]), options: 2 }),
  });
};

const R = (key) => ({ key, status: 'reuso-candidato' });   // 6 candidatas (avaliadas no Portão Visual 2)
const N = (id) => ({ key: `palavra_${id}`, status: 'novo' }); // 30 obrigatórias (produção P13)

/* ── FÁCIL (12) — sem acento/Ç/dígrafo ── */
const FACIL = [
  palavra({ id: 'sol', displayWord: 'SOL', difficulty: 'facil', category: 'natureza', img: N('sol') }),
  palavra({ id: 'lua', displayWord: 'LUA', difficulty: 'facil', category: 'natureza', img: N('lua') }),
  palavra({ id: 'bola', displayWord: 'BOLA', difficulty: 'facil', category: 'objetos', img: N('bola') }),
  palavra({ id: 'pato', displayWord: 'PATO', difficulty: 'facil', category: 'animais', img: N('pato') }),
  palavra({ id: 'gato', displayWord: 'GATO', difficulty: 'facil', category: 'animais', img: N('gato') }),
  palavra({ id: 'casa', displayWord: 'CASA', difficulty: 'facil', category: 'objetos', img: N('casa') }),
  palavra({ id: 'uva', displayWord: 'UVA', difficulty: 'facil', category: 'alimentos', img: N('uva') }),
  palavra({ id: 'bolo', displayWord: 'BOLO', difficulty: 'facil', category: 'alimentos', img: N('bolo') }),
  palavra({ id: 'rei', displayWord: 'REI', difficulty: 'facil', category: 'biblia', img: N('rei') }),
  palavra({ id: 'arca', displayWord: 'ARCA', difficulty: 'facil', category: 'biblia', img: R('avatar_ark') }),
  palavra({ id: 'peixe', displayWord: 'PEIXE', difficulty: 'facil', category: 'animais', img: R('avatar_fish') }),
  palavra({ id: 'mel', displayWord: 'MEL', difficulty: 'facil', category: 'alimentos', img: N('mel') }),
];

/* ── MÉDIO (12) — dígrafos LH/NH/CH; sem acento/Ç ── */
const MEDIO = [
  palavra({ id: 'ovelha', displayWord: 'OVELHA', difficulty: 'medio', category: 'animais', img: R('avatar_sheep') }),
  palavra({ id: 'pomba', displayWord: 'POMBA', difficulty: 'medio', category: 'biblia', img: R('avatar_dove') }),
  palavra({ id: 'estrela', displayWord: 'ESTRELA', difficulty: 'medio', category: 'natureza', img: R('avatar_star') }),
  palavra({ id: 'cavalo', displayWord: 'CAVALO', difficulty: 'medio', category: 'animais', img: N('cavalo') }),
  palavra({ id: 'chuva', displayWord: 'CHUVA', difficulty: 'medio', category: 'natureza', img: N('chuva') }),
  palavra({ id: 'galinha', displayWord: 'GALINHA', difficulty: 'medio', category: 'animais', img: N('galinha') }),
  palavra({ id: 'coelho', displayWord: 'COELHO', difficulty: 'medio', category: 'animais', img: N('coelho') }),
  palavra({ id: 'boneca', displayWord: 'BONECA', difficulty: 'medio', category: 'objetos', img: N('boneca') }),
  palavra({ id: 'sapato', displayWord: 'SAPATO', difficulty: 'medio', category: 'objetos', img: N('sapato') }),
  palavra({ id: 'banana', displayWord: 'BANANA', difficulty: 'medio', category: 'alimentos', img: N('banana') }),
  palavra({ id: 'igreja', displayWord: 'IGREJA', difficulty: 'medio', category: 'biblia', img: N('igreja') }),
  palavra({ id: 'chave', displayWord: 'CHAVE', difficulty: 'medio', category: 'objetos', img: N('chave') }),
];

/* ── DIFÍCIL (12) — maiores, letras repetidas; acentuadas/Ç nascem enabled:false ── */
const DIFICIL = [
  palavra({ id: 'leao', displayWord: 'LEÃO', difficulty: 'dificil', category: 'animais', img: R('avatar_lion') }),
  palavra({ id: 'coracao', displayWord: 'CORAÇÃO', difficulty: 'dificil', category: 'familia', img: N('coracao') }),
  palavra({ id: 'arara', displayWord: 'ARARA', difficulty: 'dificil', category: 'animais', img: N('arara') }),
  palavra({ id: 'elefante', displayWord: 'ELEFANTE', difficulty: 'dificil', category: 'animais', img: N('elefante') }),
  palavra({ id: 'borboleta', displayWord: 'BORBOLETA', difficulty: 'dificil', category: 'natureza', img: N('borboleta') }),
  palavra({ id: 'macaco', displayWord: 'MACACO', difficulty: 'dificil', category: 'animais', img: N('macaco') }),
  palavra({ id: 'passaro', displayWord: 'PÁSSARO', difficulty: 'dificil', category: 'animais', img: N('passaro') }),
  palavra({ id: 'caminhao', displayWord: 'CAMINHÃO', difficulty: 'dificil', category: 'objetos', img: N('caminhao') }),
  palavra({ id: 'tartaruga', displayWord: 'TARTARUGA', difficulty: 'dificil', category: 'animais', img: N('tartaruga') }),
  palavra({ id: 'aviao', displayWord: 'AVIÃO', difficulty: 'dificil', category: 'objetos', img: N('aviao') }),
  palavra({ id: 'familia', displayWord: 'FAMÍLIA', difficulty: 'dificil', category: 'familia', img: N('familia') }),
  palavra({ id: 'girafa', displayWord: 'GIRAFA', difficulty: 'dificil', category: 'animais', img: N('girafa') }),
];

/** Banco completo (36 palavras: 12 fácil · 12 médio · 12 difícil). */
export const PALAVRINHAS_WORDS = Object.freeze([...FACIL, ...MEDIO, ...DIFICIL]);

export function getWord(id) {
  return PALAVRINHAS_WORDS.find((w) => w.id === id) || null;
}

/** Palavras realmente jogáveis (enabled !== false). */
export function palavrasHabilitadas() {
  return PALAVRINHAS_WORDS.filter((w) => w.enabled !== false);
}
