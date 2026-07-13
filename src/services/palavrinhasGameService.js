/**
 * palavrinhasGameService.js — Núcleo PURO de "Palavrinhas do Beni" (P4R · SEM imagem).
 *
 * MÓDULO PURO: sem React Native, sem Expo, sem UI, sem áudio, sem imagem, sem storage. `rng`
 * injetável → determinístico. Nunca lança. Reusa o modelo determinístico da Ovelhinha
 * (seed/baralho/planId), agora produzindo PÁGINAS de COMPLETE (palavra + lacunas + opções).
 */
import {
  PALAVRINHAS_WORDS, palavrasHabilitadas, PALAVRINHAS_CATEGORIAS, PALAVRINHAS_FAIXAS,
} from '../data/palavrinhasWords';

/* ─────────────────────────── Modos de jogo (P4R) ─────────────────────────── */

/**
 * Três modos DISTINTOS (P4R4). Identidade travada:
 *  - Fácil "Livro Tranquilo": 8 palavras, sem tempo, 1 lacuna, 3 opções, SEM Magia/Baú/poderes.
 *  - Médio "Corrida das Palavras": meta 8, cronometrado, 2 lacunas, 4 opções, Magia/Baú EXCLUSIVOS
 *    (Baú abre só após a 5ª palavra completa; no máximo 1 por partida).
 *  - Difícil "Turbo Relâmpago": sobrevivência (sem quantidade fixa), cronometrado, 5 opções,
 *    SEM Magia/Baú/poderes e SEM qualquer pré-visualização da resposta.
 * Flags: `magia`/`poderes` habilitam o ciclo do Baú; `bauApos` = nº de palavras para abrir;
 * `bauMax` = teto de baús por partida. Tempos em ms.
 */
export const PALAVRINHAS_DIFFICULTIES = Object.freeze([
  // Livro Tranquilo: 8 palavras, sem tempo/Baú/poderes. Termina ao completar 8.
  { id: 'facil', label: 'Livro Tranquilo', tiers: ['facil'], opcoes: 3, lacunasMin: 1, lacunasMax: 1, timed: false, rounds: 8, metaPalavras: 8, infinito: false, sobrevivencia: false, magia: false, poderes: false, bauApos: 0, bauMax: 0, distratorProximo: false },
  // Corrida das Palavras (P4R8): INFINITO — sem meta de 8, termina por tempo/encerramento. Baú a cada 4 palavras, VÁRIOS por partida.
  { id: 'medio', label: 'Corrida das Palavras', tiers: ['medio'], opcoes: 4, lacunasMin: 2, lacunasMax: 3, timed: true, rounds: 9999, metaPalavras: null, infinito: true, sobrevivencia: true, magia: true, poderes: true, bauApos: 4, bauMax: 9999, tempoInicialMs: 45000, tempoMaxMs: 60000, bonusMs: 5000, alertaMs: 10000, penalidade1oErroMs: 0, penalidade2oErroMs: 1000, distratorProximo: false },
  // Turbo Relâmpago (P4R8): INFINITO — sem meta, termina por tempo/encerramento. Sem Baú/poderes.
  { id: 'dificil', label: 'Turbo Relâmpago', tiers: ['dificil'], opcoes: 5, lacunasMin: 2, lacunasMax: 4, timed: true, rounds: 9999, metaPalavras: null, infinito: true, sobrevivencia: true, magia: false, poderes: false, bauApos: 0, bauMax: 0, tempoInicialMs: 22000, tempoMaxMs: 30000, bonusMs: 3000, alertaMs: 7000, penalidade1oErroMs: 0, penalidade2oErroMs: 2000, distratorProximo: true },
]);

/**
 * Poderes do Baú Mágico do Beni (dados puros). `soTimed` = só faz sentido em modo com tempo
 * (Relógio de Luz). Ícones = nomes do FaithIcon. Só a Corrida das Palavras abre o Baú.
 */
export const PALAVRINHAS_PODERES = Object.freeze([
  { id: 'lanterna', nome: 'Lanterna do Beni', icon: 'lumi', desc: 'Depois de pensar um tempinho, mostra a letrinha certa.' },
  { id: 'relogio', nome: 'Relógio de Luz', icon: 'timer', desc: 'Ganha 6 segundos.', soTimed: true },
  { id: 'vento', nome: 'Vento Mágico', icon: 'swap', desc: 'Some com 2 letrinhas erradas.' },
  { id: 'escudo', nome: 'Escudo de Estrelas', icon: 'heart', desc: 'O próximo erro não tira combo nem tempo.' },
  { id: 'dourada', nome: 'Palavra Dourada', icon: 'star', desc: 'A próxima palavra vale brilho dobrado.' },
]);

/** Folga mínima de tempo (ms) para valer a pena oferecer o Relógio de Luz (senão o bônus seria desperdiçado). */
export const RELOGIO_FOLGA_MIN_MS = 2000;

/**
 * Elegibilidade PURA de um poder no contexto atual da partida. Regras (P4R4 §7):
 *  - Relógio de Luz só em modo com tempo E quando há folga (senão o bônus seria desperdiçado no teto);
 *  - nunca oferecer um poder já ativo;
 *  - nunca oferecer poder incompatível com o modo.
 * `ctx`: { timed, ativos:string[], restanteMs, tempoMaxMs }. Nunca lança.
 */
export function poderElegivel(poder, ctx = {}) {
  if (!poder || !poder.id) return false;
  const { timed = false, ativos = [], restanteMs = null, tempoMaxMs = null } = ctx || {};
  if (poder.soTimed && !timed) return false;
  if (Array.isArray(ativos) && ativos.includes(poder.id)) return false;
  if (poder.id === 'relogio') {
    if (!timed) return false;
    if (restanteMs != null && tempoMaxMs != null && (tempoMaxMs - restanteMs) < RELOGIO_FOLGA_MIN_MS) return false;
  }
  return true;
}

/** Sorteia 2 poderes DISTINTOS elegíveis para o contexto (usa `poderElegivel`). PURO. */
export function sortearPoderes(dificuldade = 'facil', rng = Math.random, ctx = {}) {
  const dif = getDifficulty(dificuldade);
  const base = { timed: dif.timed, ...(ctx || {}) };
  const validos = PALAVRINHAS_PODERES.filter((p) => poderElegivel(p, base));
  rng(); rng();                                    // aquece o LCG (evita viés do 1º valor com seeds sequenciais)
  return shuffle(validos, rng).slice(0, 2);
}

export function getDifficulty(id) {
  return PALAVRINHAS_DIFFICULTIES.find((d) => d.id === id) || PALAVRINHAS_DIFFICULTIES[0];
}

/** Tamanho do bloco da pausa pedagógica (modos infinitos). P4.1. */
export const PAUSA_BLOCO = 16;

/**
 * Decide, de forma PURA, se a pausa pedagógica deve abrir agora (P4.1). Só em modos INFINITOS,
 * a cada `tamanhoBloco` palavras concluídas, uma única vez por marco. Fonte única = `concluidas`.
 * @returns {boolean}
 */
export function devePausarBloco(cfg, concluidas, ultimoMarco, tamanhoBloco = PAUSA_BLOCO) {
  if (!cfg || !cfg.infinito) return false;                 // Livro Tranquilo nunca pausa
  const n = Number(concluidas) || 0;
  const t = Number(tamanhoBloco) || PAUSA_BLOCO;
  if (n <= 0 || n % t !== 0) return false;                 // só nos múltiplos exatos (16, 32, 48…)
  if (n === ultimoMarco) return false;                     // não repete no mesmo marco
  return true;
}

const DIFS = ['facil', 'medio', 'dificil'];
const tierValido = (t) => DIFS.includes(t);

/** Comprimento compatível com o tier (difícil aceita curtas quando são ortograficamente complexas: acento/Ç/repetidas/encontro). PURO. */
export function comprimentoCompativel(word) {
  const of = word.orthographicFeatures || { length: (word.letters || []).length, complexa: false };
  const n = of.length;
  const f = PALAVRINHAS_FAIXAS[word.difficulty];
  if (!f) return false;
  if (word.difficulty === 'dificil') return (n >= 7 && n <= 12) || (of.complexa && n >= 4 && n <= 12);
  return n >= f.min && n <= f.max;
}

/** Uma palavra é elegível num modo: habilitada, tier do modo e comprimento compatível. PURO. */
export function palavraElegivel(word, dificuldade = 'facil') {
  const dif = getDifficulty(dificuldade);
  return !!word && word.enabled !== false && tierValido(word.difficulty)
    && dif.tiers.includes(word.difficulty) && comprimentoCompativel(word);
}

/* ─────────────────────────── RNG determinístico ─────────────────────────── */

export function novaSeed() {
  return (Math.floor(Math.random() * 0x7fffffff) ^ (Date.now() & 0xffff)) >>> 0;
}
export function criarRng(seed) {
  let s = (Number(seed) >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
export function shuffle(arr, rnd = Math.random) {
  const out = Array.isArray(arr) ? arr.slice() : [];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

/* ─────────────────────────── Validador do banco (P4R) ─────────────────────────── */

const svcSemAcento = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '');
const svcNormalizar = (w) => svcSemAcento(w).replace(/[Çç]/g, 'C').toUpperCase();
const GRAFIA_OK = /^[A-ZÁÉÍÓÚÂÊÔÀÃÕÇ]+$/;

/**
 * Auditoria do banco (dev). PURO. Retorna PROBLEMAS (string[]) — vazio = ok. Cobre: ids
 * únicos, palavras únicas, grafia válida (sem caractere ilegal), tier válido, comprimento
 * compatível, normalização correta, instâncias por ocorrência, ≥40 por tier e ≥120 total.
 */
export function validarBanco(words = PALAVRINHAS_WORDS) {
  const probs = [];
  const ids = new Set();
  const grafias = new Set();
  const porTier = { facil: 0, medio: 0, dificil: 0 };
  for (const w of words) {
    const tag = w && w.id ? w.id : '(sem id)';
    if (!w || typeof w.id !== 'string' || ids.has(w.id)) probs.push(`${tag}: id ausente/repetido`); else ids.add(w.id);
    if (typeof w.displayWord !== 'string' || grafias.has(w.displayWord)) probs.push(`${tag}: displayWord ausente/repetida`); else grafias.add(w.displayWord);
    if (typeof w.displayWord === 'string' && !GRAFIA_OK.test(w.displayWord)) probs.push(`${tag}: caractere ilegal em "${w.displayWord}"`);
    if (!tierValido(w.difficulty)) probs.push(`${tag}: tier inválido`); else porTier[w.difficulty]++;
    if (!PALAVRINHAS_CATEGORIAS.includes(w.category)) probs.push(`${tag}: categoria inválida`);
    if (w.normalizedWord !== svcNormalizar(w.displayWord || '')) probs.push(`${tag}: normalizedWord incorreta`);
    if (!comprimentoCompativel(w)) probs.push(`${tag}: comprimento incompatível com o tier`);
    const letters = Array.isArray(w.letters) ? w.letters : [];
    if (letters.length !== Array.from(w.displayWord || '').length) probs.push(`${tag}: letters diverge de displayWord`);
    const li = Array.isArray(w.letterInstances) ? w.letterInstances : [];
    const iids = new Set();
    if (li.length !== letters.length) probs.push(`${tag}: letterInstances não cobre cada ocorrência`);
    li.forEach((x, k) => {
      if (!x || typeof x.iid !== 'string' || iids.has(x.iid)) probs.push(`${tag}: iid ausente/repetido`); else iids.add(x.iid);
      if (!x || x.ch !== letters[k] || x.pos !== k) probs.push(`${tag}: instância ${k} incoerente`);
    });
    if (!w.orthographicFeatures || typeof w.orthographicFeatures.length !== 'number') probs.push(`${tag}: orthographicFeatures ausente`);
    // P4R não usa imagem: nenhum campo de imagem deve existir
    if ('imageRef' in (w || {})) probs.push(`${tag}: imageRef não deve existir no P4R`);
  }
  for (const t of DIFS) if (porTier[t] < 40) probs.push(`banco: ${t} com ${porTier[t]} palavras (<40)`);
  if (words.length < 120) probs.push(`banco: total ${words.length} (<120)`);
  return probs;
}

/* ─────────────────────────── Composição da PÁGINA (lacunas + opções) ─────────────────────────── */

/** Escolhe K lacunas espalhadas, preferindo o interior; nunca a 1ª letra e evitando a última. PURO. */
export function escolherLacunas(n, K, rng) {
  let cand = [];
  for (let i = 1; i < n - 1; i++) cand.push(i);          // interior (sem 1ª nem última)
  if (cand.length < K) { const extra = []; for (let i = 1; i < n; i++) if (!cand.includes(i)) extra.push(i); cand = cand.concat(extra); }
  cand = [...new Set(cand)].sort((a, b) => a - b);
  const k = Math.max(1, Math.min(K, cand.length));
  const chosen = new Set();
  const size = cand.length / k;
  for (let b = 0; b < k; b++) {
    const s = Math.floor(b * size), e = Math.max(s + 1, Math.floor((b + 1) * size));
    const bucket = cand.slice(s, e);
    chosen.add(bucket[Math.floor(rng() * bucket.length)]);
  }
  return [...chosen].sort((a, b) => a - b);
}

/** Banco de opções: letras faltantes (distintas) + distratores até `nOpcoes`, embaralhado. PURO. */
export function montarOpcoes(word, lacunas, nOpcoes, rng) {
  const faltantes = [...new Set(lacunas.map((p) => word.letters[p]))];
  const bank = faltantes.slice();
  const distr = (word.distractors || []).filter((d) => !bank.includes(d));
  while (bank.length < nOpcoes && distr.length) bank.push(distr.shift());
  return shuffle(bank, rng);
}

/** Número de lacunas do modo para uma palavra (varia entre min/max, limitado ao interior). PURO. */
function nLacunas(word, dif, rng) {
  const n = word.letters.length;
  const teto = Math.max(1, n - 2);                        // no máximo interior
  const lo = Math.max(1, dif.lacunasMin), hi = Math.max(lo, dif.lacunasMax);
  const k = lo + Math.floor(rng() * (hi - lo + 1));
  return Math.max(1, Math.min(k, teto));
}

const balde = (n) => (n <= 4 ? 'curta' : n <= 7 ? 'media' : 'longa');
const padrao = (of) => (of.especial ? 'especial' : of.hasCluster ? 'encontro' : of.hasDigrafo ? 'digrafo' : of.hasRepeated ? 'repetida' : 'simples');

/* ─────────────────────────── Baralho rotativo + deckState ─────────────────────────── */

export const PALAVRINHAS_HIST_MAX = 16;
/** Janela recente-alvo (meta 12–20; sempre limitada a `pool-1` para nunca ser impossível). P4.4. */
export const PALAVRINHAS_JANELA_RECENTE = 16;

/** Chave canônica p/ deduplicar duplicatas ACIDENTAIS (espaços/caixa/forma Unicode); PRESERVA acento. P4.4. */
export function chaveCanonica(w) {
  const s = (w && (w.displayWord || w.word)) || '';
  return s.normalize('NFC').trim().toLocaleUpperCase('pt-BR');
}
export function dedupCanonico(arr) {
  const seen = new Set(); const out = [];
  for (const w of (arr || [])) { const k = chaveCanonica(w); if (k && !seen.has(k)) { seen.add(k); out.push(w); } }
  return out;
}
/** Rotaciona a nova sacola p/ que a 1ª carta evite a JANELA RECENTE (e nunca repita a última). P4.4. PURO. */
export function evitarRecentesNoInicio(ciclo, deck, hist, poolLen) {
  if (!Array.isArray(ciclo) || ciclo.length <= 1) return ciclo;
  const cap = Math.max(0, Math.min(PALAVRINHAS_JANELA_RECENTE, poolLen - 1));
  const recentes = new Set((hist || []).slice(-cap).map((h) => h && h.wordId).filter(Boolean));
  if (deck && deck.ultimo) recentes.add(deck.ultimo);
  let j = ciclo.findIndex((id) => !recentes.has(id));                          // 1ª fora da janela recente
  if (j < 0) j = ciclo.findIndex((id, k) => k > 0 && id !== (deck && deck.ultimo));   // fallback: só não-imediata (pool pequeno)
  if (j > 0) { const t = ciclo[0]; ciclo[0] = ciclo[j]; ciclo[j] = t; }
  return ciclo;
}

export function criarDeckState() { return { ver: 1, decks: {}, hist: {} }; }
export function clonarDeckState(ds) {
  const base = ds || criarDeckState();
  return {
    ver: 1,
    decks: Object.fromEntries(Object.entries(base.decks || {}).map(([k, v]) => [k, { restantes: (v.restantes || []).slice(), ultimo: v.ultimo ?? null, ultimaCategoria: v.ultimaCategoria ?? null, ultimoBalde: v.ultimoBalde ?? null, ultimoPadrao: v.ultimoPadrao ?? null }])),
    hist: Object.fromEntries(Object.entries(base.hist || {}).map(([k, v]) => [k, (v || []).slice()])),
  };
}
export function assinaturaDeck(ds, dificuldade) {
  const base = ds || criarDeckState();
  const d = (base.decks || {})[dificuldade];
  return d ? `${dificuldade}:${(d.restantes || []).length}` : '—';
}
export function planId(plano) {
  const str = (plano || []).map((p) => `${p.wordId}:${(p.lacunas || []).join('.')}`).join('|');
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36).padStart(6, '0').slice(-6);
}

/**
 * Baralho rotativo de PÁGINAS. PURO (clona o deckState; não muta a entrada nem o banco). Regras:
 * nenhuma palavra repete antes de esgotar as elegíveis do ciclo; alterna categoria, tamanho e
 * padrão ortográfico quando há alternativa; ao renovar, 1ª ≠ última; posições das lacunas variadas
 * (nunca a 1ª letra); determinístico sob `rng`.
 * @returns {{ baralho: Array<{wordId,lacunas,options,category,difficulty,length}>, deckState }}
 */
export function montarBaralhoPalavras({ dificuldade = 'facil', rng = Math.random, words = palavrasHabilitadas(), rounds, deckState = null }) {
  const dif = getDifficulty(dificuldade);
  const total = Number(rounds) > 0 ? rounds : dif.rounds;
  const ds = clonarDeckState(deckState);
  const pool = dedupCanonico(words.filter((w) => palavraElegivel(w, dificuldade)));
  const out = [];
  if (!pool.length) return { baralho: out, deckState: ds };
  const byId = (id) => pool.find((w) => w.id === id);
  const preferir = (arr, pred) => { const s = arr.filter(pred); return s.length ? s : arr; };
  const usados = new Set();
  const key = dificuldade;
  const deck = ds.decks[key] || (ds.decks[key] = { restantes: [], ultimo: null, ultimaCategoria: null, ultimoBalde: null, ultimoPadrao: null });
  const hist = ds.hist[key] || (ds.hist[key] = []);
  let ultCat = null, ultBalde = null, ultPad = null;
  for (let i = 0; i < total; i++) {
    if (!deck.restantes.length) {
      const ciclo = evitarRecentesNoInicio(shuffle(pool.map((w) => w.id), rng), deck, hist, pool.length);
      deck.restantes = ciclo;
    }
    let cand = deck.restantes.map(byId).filter(Boolean);
    cand = preferir(cand, (w) => !usados.has(w.id));
    if (ultCat) cand = preferir(cand, (w) => w.category !== ultCat);
    if (ultBalde) cand = preferir(cand, (w) => balde(w.letters.length) !== ultBalde);
    if (ultPad) cand = preferir(cand, (w) => padrao(w.orthographicFeatures) !== ultPad);
    const pick = shuffle(cand, rng)[0];
    const K = nLacunas(pick, dif, rng);
    const lacunas = escolherLacunas(pick.letters.length, K, rng);
    const options = montarOpcoes(pick, lacunas, dif.opcoes, rng);
    deck.restantes = deck.restantes.filter((id) => id !== pick.id);
    deck.ultimo = pick.id; deck.ultimaCategoria = pick.category;
    deck.ultimoBalde = balde(pick.letters.length); deck.ultimoPadrao = padrao(pick.orthographicFeatures);
    usados.add(pick.id); ultCat = pick.category; ultBalde = deck.ultimoBalde; ultPad = deck.ultimoPadrao;
    hist.push({ wordId: pick.id, category: pick.category, roundIndex: i });
    while (hist.length > PALAVRINHAS_HIST_MAX) hist.shift();
    out.push({ wordId: pick.id, lacunas, options, category: pick.category, difficulty: pick.difficulty, length: pick.letters.length });
  }
  return { baralho: out, deckState: ds };
}

/**
 * Plano da partida (páginas). PURO e determinístico: MESMA seed + MESMO deckState → MESMO plano
 * e MESMO planId (entrada nunca mutada). Retorna o novo deckState e o planId.
 * @returns {{ plano: Array, deckState: object, planId: string }}
 */
export function planPartida({ rng = Math.random, dificuldade = 'facil', words = palavrasHabilitadas(), rounds, deckState = null } = {}) {
  const validas = words.filter((w) => palavraElegivel(w, dificuldade));
  if (!validas.length) return { plano: [], deckState: clonarDeckState(deckState), planId: planId([]) };
  const { baralho, deckState: ds } = montarBaralhoPalavras({ dificuldade, rng, words: validas, rounds, deckState });
  return { plano: baralho, deckState: ds, planId: planId(baralho) };
}

/* ─────────────────────────── Diretor adaptativo da rodada (P4R2) ─────────────────────────── */

/** Perfil de dificuldade dinâmico pelo combo e erros recentes. PURO. */
export function perfilCombo(combo = 0, errosSeguidos = 0) {
  if (errosSeguidos >= 2) return { faixa: 'apoio', tamanho: 'menor', lacunasBias: 'min', distratorProximo: false };
  if (combo >= 6) return { faixa: 'alto', tamanho: 'complexa', lacunasBias: 'max', distratorProximo: true };
  if (combo >= 3) return { faixa: 'medio', tamanho: 'media', lacunasBias: 'mais', distratorProximo: true };
  return { faixa: 'base', tamanho: 'menor', lacunasBias: 'min', distratorProximo: false };
}

/** Pontuação de complexidade ortográfica (para o Diretor escolher dentro do envelope). PURO. */
export function complexidade(word) {
  const of = word.orthographicFeatures || {};
  return (of.length || 0) + (of.hasAccent ? 2 : 0) + (of.hasCedilha ? 2 : 0) + (of.hasDigrafo ? 1 : 0) + (of.hasCluster ? 1 : 0) + (of.hasRepeated ? 1 : 0);
}

/** Nº de lacunas conforme modo + perfil (respeita o teto do tamanho). PURO. */
export function nLacunasAdaptativo(word, dif, perfil, primeira) {
  if (dif.id === 'facil') return 1;
  const teto = Math.max(2, Math.min(dif.lacunasMax, word.letters.length - 2));
  if (primeira || perfil.faixa === 'apoio') return Math.min(dif.lacunasMin, teto);   // início e apoio: mínimo
  let alvo = dif.lacunasMin;
  if (perfil.lacunasBias === 'max') alvo = dif.lacunasMax;
  else if (perfil.lacunasBias === 'mais') alvo = Math.min(dif.lacunasMax, dif.lacunasMin + 1);
  return Math.max(dif.lacunasMin, Math.min(alvo, teto));
}

/** Opções com proximidade de distratores conforme o perfil (mais próximas = confundíveis). PURO. */
export function montarOpcoesAdaptativo(word, lacunas, dif, perfil, rng) {
  const faltantes = [...new Set(lacunas.map((p) => word.letters[p]))];
  const bank = faltantes.slice();
  const usarProximos = perfil.distratorProximo || dif.distratorProximo;
  const confus = (word.confusableLetters || []).filter((c) => !bank.includes(c));
  const distintos = (word.distractors || []).filter((d) => !bank.includes(d) && !confus.includes(d));
  const fonte = usarProximos ? confus.concat(distintos) : distintos.concat(confus);
  let i = 0;
  while (bank.length < dif.opcoes && i < fonte.length) { bank.push(fonte[i]); i += 1; }
  return shuffle(bank, rng);
}

/**
 * Próxima página ADAPTATIVA (on-demand, para os modos cronometrados e o fácil). PURO: clona o
 * deckState; não muta o banco. O Diretor escolhe DENTRO do envelope (tamanho/complexidade da
 * palavra + nº de lacunas + proximidade de distratores) conforme combo/erros, mantendo o baralho
 * determinístico sob `rng`. Regra do Turbo: a 1ª página nunca é palavra longa com muitas lacunas.
 * @returns {{ pagina: {wordId,lacunas,options,category,difficulty,length,complexidade}, deckState }}
 */
export function proximaPaginaAdaptativa({ dificuldade = 'facil', rng = Math.random, words = palavrasHabilitadas(), deckState = null, combo = 0, errosSeguidos = 0, primeira = false }) {
  const dif = getDifficulty(dificuldade);
  const ds = clonarDeckState(deckState);
  const pool = dedupCanonico(words.filter((w) => palavraElegivel(w, dificuldade)));
  if (!pool.length) return { pagina: null, deckState: ds };
  const byId = (id) => pool.find((w) => w.id === id);
  const preferir = (arr, pred) => { const s = arr.filter(pred); return s.length ? s : arr; };
  const perfil = perfilCombo(combo, errosSeguidos);
  const key = dificuldade;
  const deck = ds.decks[key] || (ds.decks[key] = { restantes: [], ultimo: null, ultimaCategoria: null, ultimoBalde: null, ultimoPadrao: null });
  const hist = ds.hist[key] || (ds.hist[key] = []);
  if (!deck.restantes.length) {
    // nova sacola: 1ª carta evita a janela recente (e nunca repete a última do ciclo anterior).
    deck.restantes = evitarRecentesNoInicio(shuffle(pool.map((w) => w.id), rng), deck, hist, pool.length);
  }
  let cand = deck.restantes.map(byId).filter(Boolean);
  if (deck.ultimaCategoria) cand = preferir(cand, (w) => w.category !== deck.ultimaCategoria);
  // viés de tamanho/complexidade pelo perfil
  const comps = cand.map(complexidade);
  const lo = Math.min(...comps), hi = Math.max(...comps), meio = (lo + hi) / 2;
  if (perfil.tamanho === 'menor') cand = preferir(cand, (w) => complexidade(w) <= meio);
  else if (perfil.tamanho === 'complexa') cand = preferir(cand, (w) => complexidade(w) >= meio);
  else cand = preferir(cand, (w) => Math.abs(complexidade(w) - meio) <= (hi - lo) / 3 + 0.01);
  // Turbo: 1ª página nunca palavra longa (não começar difícil demais)
  if (dif.id === 'dificil' && primeira) cand = preferir(cand, (w) => w.letters.length <= 8);
  const pick = shuffle(cand, rng)[0];
  const nl = nLacunasAdaptativo(pick, dif, perfil, primeira);
  const lacunas = escolherLacunas(pick.letters.length, nl, rng);
  const options = montarOpcoesAdaptativo(pick, lacunas, dif, perfil, rng);
  deck.restantes = deck.restantes.filter((id) => id !== pick.id);
  deck.ultimo = pick.id; deck.ultimaCategoria = pick.category;
  hist.push({ wordId: pick.id, roundIndex: hist.length });
  while (hist.length > PALAVRINHAS_HIST_MAX) hist.shift();
  return { pagina: { wordId: pick.id, lacunas, options, category: pick.category, difficulty: pick.difficulty, length: pick.letters.length, complexidade: complexidade(pick) }, deckState: ds };
}
