/**
 * palavrinhasGameService.js — Núcleo PURO de "Palavrinhas do Beni" (Fase 0 · T-A2).
 *
 * MÓDULO PURO: sem React Native, sem Expo, sem UI, sem áudio, sem imagem, sem storage, sem
 * contexto React. `rng` injetável → determinístico. Nunca lança. Avaliável fora do RN
 * (smoke via `new Function`). Reusa o modelo determinístico validado em "Cadê a Ovelhinha?"
 * (seed/baralho/planId), adaptado para PALAVRAS (spec §13; plan P2).
 *
 * Contratos públicos (spec/plan): validador do banco · seed (`novaSeed`/`criarRng`) · baralho
 * rotativo · `deckState` (+`clonarDeckState`/`assinaturaDeck`) · `planPartida → {plano,
 * deckState, planId}` (plano IMUTÁVEL após gerado) · `planId` determinístico.
 */
import {
  PALAVRINHAS_WORDS, palavrasHabilitadas, PALAVRINHAS_CATEGORIAS,
} from '../data/palavrinhasWords';

/* ─────────────────────────── Dificuldades (modos) ─────────────────────────── */

/**
 * Modos de dificuldade. Cada modo define nº de rodadas, quais TIERS de palavra entram
 * (+ tier predominante e probabilidade), a proporção-alvo de COMPLETE (o resto = MONTE) e
 * se a dica leve é automática. NÃO há cronômetro punitivo. (spec §6)
 */
export const PALAVRINHAS_DIFFICULTIES = Object.freeze([
  { id: 'facil', label: 'Fácil', rounds: 5, tiers: ['facil'], tierPrincipal: 'facil', predominancia: 1, propCompletar: 0.7, dicaAuto: true },
  { id: 'medio', label: 'Médio', rounds: 7, tiers: ['facil', 'medio'], tierPrincipal: 'medio', predominancia: 0.7, propCompletar: 0.4, dicaAuto: false },
  { id: 'dificil', label: 'Difícil', rounds: 10, tiers: ['medio', 'dificil'], tierPrincipal: 'dificil', predominancia: 0.7, propCompletar: 0.2, dicaAuto: false },
]);

export function getDifficulty(id) {
  return PALAVRINHAS_DIFFICULTIES.find((d) => d.id === id) || PALAVRINHAS_DIFFICULTIES[0];
}

const DIFS = ['facil', 'medio', 'dificil'];
const ATIVIDADES = ['complete', 'monte'];
const tierValido = (t) => DIFS.includes(t);

/** Uma palavra é elegível num modo: habilitada E o tier dela entra no modo. PURO. */
export function palavraElegivel(word, dificuldade = 'facil') {
  const dif = getDifficulty(dificuldade);
  return !!word && word.enabled !== false && tierValido(word.difficulty) && dif.tiers.includes(word.difficulty);
}

/* ─────────────────────────── RNG determinístico (sem lib) ─────────────────────────── */

/** Seed de sessão (uso na borda/UI; o núcleo puro só recebe a seed pronta). */
export function novaSeed() {
  return (Math.floor(Math.random() * 0x7fffffff) ^ (Date.now() & 0xffff)) >>> 0;
}
/** LCG determinístico a partir de uma seed → função rnd() em [0,1). PURO. */
export function criarRng(seed) {
  let s = (Number(seed) >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
/** Fisher-Yates com rnd injetável; NÃO muta a entrada (retorna cópia). PURO. */
export function shuffle(arr, rnd = Math.random) {
  const out = Array.isArray(arr) ? arr.slice() : [];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ─────────────────────────── Validador do banco (T-A1↔T-A2) ─────────────────────────── */

const svcSemAcento = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '');
const svcNormalizar = (w) => svcSemAcento(w).replace(/[Çç]/g, 'C').toUpperCase();
const svcDependeInfra = (w) => /[ÁÉÍÓÚÂÊÔÀÃÕÇ]/.test(w);

/**
 * Auditoria do banco (dev). PURO. Retorna PROBLEMAS (string[]) — vazio = ok. Cobre spec §21
 * itens 1–13: ids únicos, palavra↔dificuldade, categoria, atividade permitida, contagem de
 * letras, instâncias independentes p/ letras repetidas, acentos/Ç ⇒ enabled:false, imageRef
 * SEGURO (metadado, sem require), distratores/missingPatterns/traceTargets válidos, 12/12/12.
 */
export function validarBanco(words = PALAVRINHAS_WORDS) {
  const probs = [];
  const ids = new Set();
  const porDif = { facil: 0, medio: 0, dificil: 0 };
  const statusOk = new Set(['reuso-candidato', 'novo', 'substituida', 'criada', 'reutilizada']);
  for (const w of words) {
    const tag = w && w.id ? w.id : '(sem id)';
    if (!w || typeof w.id !== 'string' || ids.has(w.id)) probs.push(`${tag}: id ausente/repetido`); else ids.add(w.id);
    if (!tierValido(w.difficulty)) probs.push(`${tag}: dificuldade inválida`); else porDif[w.difficulty]++;
    if (!PALAVRINHAS_CATEGORIAS.includes(w.category)) probs.push(`${tag}: categoria inválida`);
    if (!w.activityEligibility || typeof w.activityEligibility.complete !== 'boolean' || typeof w.activityEligibility.monte !== 'boolean') probs.push(`${tag}: activityEligibility ausente`);
    // letras e instâncias
    const letters = Array.isArray(w.letters) ? w.letters : [];
    if (!Array.isArray(w.letters) || letters.length !== Array.from(w.displayWord || '').length) probs.push(`${tag}: contagem de letras diverge de displayWord`);
    const li = Array.isArray(w.letterInstances) ? w.letterInstances : [];
    if (li.length !== letters.length) probs.push(`${tag}: letterInstances não cobre cada ocorrência`);
    const iids = new Set();
    li.forEach((x, k) => {
      if (!x || typeof x.iid !== 'string' || iids.has(x.iid)) probs.push(`${tag}: iid ausente/repetido`); else iids.add(x.iid);
      if (!x || x.ch !== letters[k] || x.pos !== k) probs.push(`${tag}: instância ${k} não corresponde à letra`);
    });
    // normalização (lógica) sem apagar a exibição
    if (w.normalizedWord !== svcNormalizar(w.displayWord || '')) probs.push(`${tag}: normalizedWord incorreta`);
    // acentos/Ç ⇒ enabled:false até infra validar
    if (svcDependeInfra(w.displayWord || '') && w.enabled !== false) probs.push(`${tag}: acento/Ç exige enabled:false na v1`);
    // imageRef SEGURO (metadado; sem require/caminho)
    const ref = w.imageRef;
    if (!ref || typeof ref !== 'object' || typeof ref.key !== 'string' || /[./\\]/.test(ref.key) || !statusOk.has(ref.status)) probs.push(`${tag}: imageRef inseguro (deve ser metadado key+status)`);
    // missingPatterns dentro do tamanho
    const mp = w.missingPatterns || {};
    for (const grp of (mp.complete || [])) for (const idx of grp) if (!(idx >= 0 && idx < letters.length)) probs.push(`${tag}: missingPattern fora do alcance`);
    if (!Array.isArray(mp.monte) || !mp.monte.includes('ALL')) probs.push(`${tag}: monte deve conter 'ALL'`);
    // distratores: maiúsculas, fora da palavra
    for (const d of (w.distractors || [])) if (typeof d !== 'string' || d.length !== 1 || d !== d.toUpperCase() || letters.includes(d)) probs.push(`${tag}: distrator inválido "${d}"`);
    // traceTargets ⊆ focusLetters
    for (const t of (w.traceTargets || [])) if (!(w.focusLetters || []).includes(t)) probs.push(`${tag}: traceTarget fora de focusLetters`);
  }
  for (const d of DIFS) if (porDif[d] !== 12) probs.push(`banco: ${d} com ${porDif[d]} palavras (esperado 12)`);
  if (words.length !== 36) probs.push(`banco: total ${words.length} (esperado 36)`);
  return probs;
}

/* ─────────────────────────── Baralho rotativo + deckState ─────────────────────────── */

export const PALAVRINHAS_HIST_MAX = 12;

/** Estado inicial do baralho rotativo (por modo) + histórico recente (por modo). PURO. */
export function criarDeckState() {
  return { ver: 1, decks: {}, hist: {} };
}

/** Clona o deckState (a entrada NUNCA é mutada). PURO. */
export function clonarDeckState(ds) {
  const base = ds || criarDeckState();
  return {
    ver: 1,
    decks: Object.fromEntries(Object.entries(base.decks || {}).map(([k, v]) => [k, { restantes: (v.restantes || []).slice(), ultimo: v.ultimo ?? null, ultimaCategoria: v.ultimaCategoria ?? null }])),
    hist: Object.fromEntries(Object.entries(base.hist || {}).map(([k, v]) => [k, (v || []).slice()])),
  };
}

/** Assinatura curta do deckState para um modo (Modo Criador): "modo:restantes". PURO. */
export function assinaturaDeck(ds, dificuldade) {
  const base = ds || criarDeckState();
  const d = (base.decks || {})[dificuldade];
  return d ? `${dificuldade}:${(d.restantes || []).length}` : '—';
}

/** Identificador determinístico curto (FNV-1a → base36) de um plano de partida. PURO. */
export function planId(plano) {
  const str = (plano || []).map((p) => `${p.wordId}:${p.activity}:${p.patternKey}`).join('|');
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36).padStart(6, '0').slice(-6);
}

const patternKeyDe = (activity, pattern) => `${activity}:${JSON.stringify(pattern)}`;

/**
 * Escolhe a ATIVIDADE de uma palavra (complete|monte), respeitando elegibilidade, a
 * proporção-alvo do modo e evitando 3+ iguais em sequência. Determinístico sob `rng`. PURO.
 */
function escolherAtividade(word, dif, rng, ultimasDuas) {
  const el = word.activityEligibility || { complete: true, monte: true };
  if (el.complete && !el.monte) return 'complete';
  if (el.monte && !el.complete) return 'monte';
  let a = rng() < (dif.propCompletar ?? 0.5) ? 'complete' : 'monte';
  // evita a 3ª repetição consecutiva quando a alternativa é elegível
  if (ultimasDuas.length === 2 && ultimasDuas[0] === a && ultimasDuas[1] === a) {
    const alt = a === 'complete' ? 'monte' : 'complete';
    if (el[alt]) a = alt;
  }
  return a;
}

/** Escolhe um padrão de lacunas para a atividade, evitando repetir o último. PURO. */
function escolherPadrao(word, activity, rng, ultimoKey) {
  const mp = word.missingPatterns || {};
  const lista = activity === 'complete' ? (mp.complete || [[0]]) : (mp.monte || ['ALL']);
  let pool = lista.filter((p) => patternKeyDe(activity, p) !== ultimoKey);
  if (!pool.length) pool = lista.slice();
  return shuffle(pool, rng)[0];
}

/**
 * Baralho rotativo de PALAVRAS. PURO (clona o deckState; não muta a entrada). Regras (spec §13):
 * nenhuma palavra repete antes de esgotar as elegíveis do ciclo; ao renovar, 1ª ≠ última e
 * categoria ≠ última quando há alternativa; dentro da partida nunca repete palavra; alterna
 * categoria/atividade/padrão de lacunas; predominância do tier principal; determinístico.
 * @returns {{ baralho: Array<{wordId,activity,missingPattern,patternKey,traceTarget,category,difficulty}>, deckState }}
 */
export function montarBaralhoPalavras({ dificuldade = 'facil', rng = Math.random, words = palavrasHabilitadas(), rounds, deckState = null }) {
  const dif = getDifficulty(dificuldade);
  const total = Number(rounds) > 0 ? rounds : dif.rounds;
  const ds = clonarDeckState(deckState);
  const pool = words.filter((w) => palavraElegivel(w, dificuldade));
  const out = [];
  if (!pool.length) return { baralho: out, deckState: ds };
  const byId = (id) => pool.find((w) => w.id === id);
  const preferir = (arr, pred) => { const s = arr.filter(pred); return s.length ? s : arr; };
  const usadosGame = new Set();
  const key = dificuldade;
  const deck = ds.decks[key] || (ds.decks[key] = { restantes: [], ultimo: null, ultimaCategoria: null });
  const hist = ds.hist[key] || (ds.hist[key] = []);
  let ultimaCategoriaGame = null;
  const ultimasAtividades = [];
  let ultimoPatternKey = null;
  for (let i = 0; i < total; i++) {
    if (!deck.restantes.length) {
      let ciclo = shuffle(pool.map((w) => w.id), rng);
      if (deck.ultimo && ciclo.length > 1 && ciclo[0] === deck.ultimo) {
        const j = ciclo.findIndex((id, k) => k > 0 && id !== deck.ultimo);
        if (j > 0) { const t = ciclo[0]; ciclo[0] = ciclo[j]; ciclo[j] = t; }
      }
      if (deck.ultimaCategoria && ciclo.length > 1 && byId(ciclo[0]).category === deck.ultimaCategoria) {
        const j = ciclo.findIndex((id, k) => k > 0 && byId(id).category !== deck.ultimaCategoria && id !== deck.ultimo);
        if (j > 0) { const t = ciclo[0]; ciclo[0] = ciclo[j]; ciclo[j] = t; }
      }
      deck.restantes = ciclo;
    }
    let cand = deck.restantes.map(byId).filter(Boolean);
    cand = preferir(cand, (w) => !usadosGame.has(w.id));                              // nunca repete na partida
    if (ultimaCategoriaGame) cand = preferir(cand, (w) => w.category !== ultimaCategoriaGame); // alterna categoria
    const doPrincipal = cand.filter((w) => w.difficulty === dif.tierPrincipal);
    const escolhaPool = (doPrincipal.length && rng() < (dif.predominancia ?? 1)) ? doPrincipal : cand;
    const pick = shuffle(escolhaPool, rng)[0];
    const activity = escolherAtividade(pick, dif, rng, ultimasAtividades);
    const missingPattern = escolherPadrao(pick, activity, rng, ultimoPatternKey);
    const patternKey = patternKeyDe(activity, missingPattern);
    const traceTarget = (pick.traceTargets && pick.traceTargets.length) ? shuffle(pick.traceTargets, rng)[0] : null;
    // consome + memórias
    deck.restantes = deck.restantes.filter((id) => id !== pick.id);
    deck.ultimo = pick.id; deck.ultimaCategoria = pick.category;
    usadosGame.add(pick.id); ultimaCategoriaGame = pick.category;
    ultimasAtividades.push(activity); if (ultimasAtividades.length > 2) ultimasAtividades.shift();
    ultimoPatternKey = patternKey;
    hist.push({ wordId: pick.id, category: pick.category, activity, patternKey, roundIndex: i });
    while (hist.length > PALAVRINHAS_HIST_MAX) hist.shift();
    out.push({ wordId: pick.id, activity, missingPattern, patternKey, traceTarget, category: pick.category, difficulty: pick.difficulty });
  }
  return { baralho: out, deckState: ds };
}

/**
 * Plano da partida. PURO e determinístico: MESMA seed + MESMO deckState inicial → MESMO plano
 * e MESMO planId (a entrada nunca é mutada). Retorna o novo deckState (p/ "jogar novamente"
 * continuar o ciclo) e o planId. O nº de rodadas vem do modo (facil 5 · medio 7 · dificil 10).
 * @returns {{ plano: Array, deckState: object, planId: string }}
 */
export function planPartida({ rng = Math.random, dificuldade = 'facil', words = palavrasHabilitadas(), rounds, deckState = null } = {}) {
  const validas = words.filter((w) => palavraElegivel(w, dificuldade));
  if (!validas.length) return { plano: [], deckState: clonarDeckState(deckState), planId: planId([]) };
  const { baralho, deckState: ds } = montarBaralhoPalavras({ dificuldade, rng, words: validas, rounds, deckState });
  return { plano: baralho, deckState: ds, planId: planId(baralho) };
}
