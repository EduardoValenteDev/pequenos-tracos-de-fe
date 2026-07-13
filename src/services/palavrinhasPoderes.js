/**
 * palavrinhasPoderes.js — Banco de poderes do "Bolso Mágico do Beni" (P4R7).
 *
 * MÓDULO PURO (sem RN/Expo/UI/áudio/storage). Oito poderes, elegibilidade por contexto e sorteio
 * determinístico de 2 cartas distintas. Só a Corrida das Palavras usa poderes; a escolha vai para
 * o inventário e é ATIVADA MANUALMENTE (nunca consumida automaticamente). A eligibilidade fina
 * (lacuna/vogal/opções) é reavaliada no momento da ativação.
 */

/** Vogais consideradas pela lógica (a normalização de acento é feita por quem chama). */
export const VOGAIS = Object.freeze(['A', 'E', 'I', 'O', 'U']);

/**
 * Oito poderes. `ativacao`: 'imediata' (efeito começa ao tocar) ou 'armado' (fica armado e é
 * consumido num evento futuro, ex.: Escudo no próximo erro). `curto` = nome curto para o HUD.
 */
export const PALAVRINHAS_PODERES = Object.freeze([
  { id: 'lanterna', nome: 'Lanterna do Beni',  curto: 'Lanterna', icon: 'lumi',        ativacao: 'imediata', cor: '#E0A21A', label: 'LANTERNA!',        dica: 'Mostra a letra certa.' },
  { id: 'relogio',  nome: 'Relógio de Luz',    curto: 'Relógio',  icon: 'timer',       ativacao: 'imediata', soTimed: true, cor: '#2B5BA1', label: 'TEMPO EXTRA!', dica: 'Ganha seis segundos.' },
  { id: 'vento',    nome: 'Vento Mágico',      curto: 'Vento',    icon: 'swap',        ativacao: 'imediata', cor: '#5E9C3E', label: 'VENTO MÁGICO!',    dica: 'Remove letras erradas.' },
  { id: 'escudo',   nome: 'Escudo de Estrelas', curto: 'Escudo',  icon: 'heart',       ativacao: 'armado',   cor: '#F9C74F', label: 'ESCUDO PRONTO!',   dica: 'Protege seu próximo erro.' },
  { id: 'dourada',  nome: 'Palavra Dourada',   curto: 'Dourada',  icon: 'star',        ativacao: 'imediata', cor: '#E0A21A', label: 'BRILHOS EM DOBRO!', dica: 'Dobra seus brilhos.' },
  { id: 'ima',      nome: 'Ímã de Letras',     curto: 'Ímã',      icon: 'combo',       ativacao: 'imediata', cor: '#7C3AED', label: 'LETRA ATRAÍDA!',   dica: 'Puxa uma letra certa.' },
  { id: 'vogais',   nome: 'Chuva de Vogais',   curto: 'Vogais',   icon: 'palavrinhas', ativacao: 'imediata', cor: '#4FC3F7', label: 'CHUVA DE VOGAIS!', dica: 'Completa uma vogal.' },
  { id: 'troca',    nome: 'Troca Mágica',      curto: 'Troca',    icon: 'restart',     ativacao: 'imediata', cor: '#F3722C', label: 'NOVA PALAVRA!',    dica: 'Troca a palavra atual.' },
]);

/** Fases da máquina visual de efeito de poder (P4R8 §10) — o consumo ocorre em `impact`. */
export const POWER_FX_FASES = Object.freeze(['idle', 'prepare', 'impact', 'resolve', 'finish']);
/** Durações (ms) por poder: prepare → impact → resolve. PURO (dados). */
export const POWER_FX_TIMING = Object.freeze({
  lanterna: { prepare: 380, impact: 420, resolve: 400 },
  relogio:  { prepare: 340, impact: 360, resolve: 300 },
  vento:    { prepare: 360, impact: 440, resolve: 300 },
  escudo:   { prepare: 320, impact: 240, resolve: 140 },
  dourada:  { prepare: 320, impact: 260, resolve: 220 },
  ima:      { prepare: 380, impact: 420, resolve: 300 },
  vogais:   { prepare: 420, impact: 480, resolve: 400 },
  troca:    { prepare: 420, impact: 380, resolve: 400 },
});
export function fxTiming(id) { return POWER_FX_TIMING[id] || { prepare: 360, impact: 360, resolve: 300 }; }
export function fxDuracaoTotal(id) { const t = fxTiming(id); return t.prepare + t.impact + t.resolve; }

export const RELOGIO_FOLGA_MIN_MS = 3000;   // bônus útil mínimo do Relógio

export function getPoder(id) { return PALAVRINHAS_PODERES.find((p) => p.id === id) || null; }

/**
 * avaliarUsoDoPoder — função PURA e ÚNICA de disponibilidade (P4R9 §17). Nunca bloqueia em silêncio:
 * o slot sempre abre o painel; se não puder usar, o painel mostra o `motivo`. Retorna
 * `{ podeUsar, motivo, quantidadeDeEfeito }`. `contexto`: { timed, restanteMs, tempoMaxMs,
 * lacunaAtiva, emResgate, nOpcoes, nIncorretasRemoviveis, palavraComecada, palavraAtiva,
 * vogalNaLacunaAtual, temOutraPalavra, emCelebracao }.
 */
export function avaliarUsoDoPoder(poder, contexto = {}) {
  if (!poder || !poder.id) return { podeUsar: false, motivo: null, quantidadeDeEfeito: 0 };
  const c = contexto || {};
  const timed = c.timed !== false;
  switch (poder.id) {
    case 'lanterna': {
      const ok = (c.lacunaAtiva !== false) && !c.emResgate && (c.nOpcoes ?? 4) > 1;
      return { podeUsar: ok, motivo: ok ? null : 'Use quando houver uma letra para descobrir.', quantidadeDeEfeito: ok ? 1 : 0 };
    }
    case 'relogio': {
      if (!timed) return { podeUsar: false, motivo: 'Funciona nos modos com tempo.', quantidadeDeEfeito: 0 };
      const folga = (c.tempoMaxMs != null && c.restanteMs != null) ? (c.tempoMaxMs - c.restanteMs) : 9999;
      const ok = folga >= RELOGIO_FOLGA_MIN_MS;
      return { podeUsar: ok, motivo: ok ? null : 'Use quando faltar mais tempo.', quantidadeDeEfeito: ok ? 6 : 0 };
    }
    case 'vento': {
      // quantidadeRemover = min(2, incorretas, opcoesVisiveis - 2). Nunca depende do total original.
      const inc = c.nIncorretasRemoviveis ?? 0;
      const vis = c.nOpcoes ?? 0;
      const q = Math.min(2, inc, Math.max(0, vis - 2));
      const ok = q > 0;
      return { podeUsar: ok, motivo: ok ? null : 'Use quando houver letras erradas para remover.', quantidadeDeEfeito: q };
    }
    case 'escudo': return { podeUsar: true, motivo: null, quantidadeDeEfeito: 1 };
    case 'dourada': {
      const ok = !c.palavraComecada && !c.emResgate;
      return { podeUsar: ok, motivo: ok ? null : 'Use no começo de uma palavra.', quantidadeDeEfeito: ok ? 2 : 0 };
    }
    case 'ima': {
      const ok = (c.lacunaAtiva !== false) && !c.emResgate && (c.palavraAtiva !== false);
      return { podeUsar: ok, motivo: ok ? null : 'Use quando houver uma lacuna para preencher.', quantidadeDeEfeito: ok ? 1 : 0 };
    }
    case 'vogais': {
      const ok = c.vogalNaLacunaAtual === true;
      return { podeUsar: ok, motivo: ok ? null : 'Este poder funciona quando falta uma vogal.', quantidadeDeEfeito: ok ? 1 : 0 };
    }
    case 'troca': {
      const ok = (c.temOutraPalavra !== false) && !c.emCelebracao;
      return { podeUsar: ok, motivo: ok ? null : 'Use durante uma palavra.', quantidadeDeEfeito: ok ? 1 : 0 };
    }
    default: return { podeUsar: false, motivo: null, quantidadeDeEfeito: 0 };
  }
}

/**
 * Elegibilidade PURA de um poder no contexto atual. `contexto` fino (ativação) ou grosso (sorteio):
 * { timed, restanteMs, tempoMaxMs, ativos, lacunaAtiva, emResgate, nOpcoes, nIncorretasRemoviveis,
 *   palavraComecada, palavraAtiva, vogalNaLacunaAtual, temOutraPalavra, emCelebracao }. Nunca lança.
 */
export function poderElegivel(poder, contexto = {}) {
  if (!poder || !poder.id) return false;
  const c = contexto || {};
  const timed = c.timed !== false;
  const ativos = Array.isArray(c.ativos) ? c.ativos : [];
  if (ativos.includes(poder.id)) return false;                 // já está no inventário
  switch (poder.id) {
    case 'lanterna': return (c.lacunaAtiva !== false) && !c.emResgate && (c.nOpcoes ?? 4) > 1;
    case 'relogio':
      if (!timed) return false;
      if (c.restanteMs != null && c.tempoMaxMs != null && (c.tempoMaxMs - c.restanteMs) < RELOGIO_FOLGA_MIN_MS) return false;
      return true;
    case 'vento': return (c.nOpcoes ?? 4) >= 4 && (c.nIncorretasRemoviveis ?? 0) >= 2;
    case 'escudo': return true;                                 // armado — sempre elegível para guardar
    case 'dourada': return !c.palavraComecada && !c.emResgate;
    case 'ima': return (c.lacunaAtiva !== false) && !c.emResgate && (c.palavraAtiva !== false);
    case 'vogais': return c.vogalNaLacunaAtual === true;
    case 'troca': return (c.temOutraPalavra !== false) && !c.emCelebracao;
    default: return false;
  }
}

/* ─────────── Sorteio determinístico das 2 cartas ─────────── */

function shuffle(arr, rnd) {
  const out = Array.isArray(arr) ? arr.slice() : [];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

/** Chave canônica de um par de cartas (para evitar repetição entre aberturas). */
export function parKey(cartas) { return (cartas || []).map((c) => c.id).slice().sort().join('|'); }

/**
 * Sorteia 2 cartas DISTINTAS elegíveis. `contexto` grosso (sorteio: timed/tempo/ativos; para poderes
 * dependentes da palavra usa defaults otimistas — a checagem fina ocorre na ATIVAÇÃO). Determinístico
 * sob `rng`; reduz repetição do mesmo par consecutivo. Nunca usa Math.random. PURO.
 */
export function sortearCartas(rng = Math.random, contexto = {}, evitarPar = null) {
  const ctxSorteio = {
    timed: contexto.timed !== false, restanteMs: contexto.restanteMs, tempoMaxMs: contexto.tempoMaxMs,
    ativos: contexto.ativos || [],
    // otimista p/ poderes dependentes da palavra (reavaliados na ativação)
    lacunaAtiva: true, nOpcoes: contexto.nOpcoes ?? 4, nIncorretasRemoviveis: 2,
    palavraComecada: false, palavraAtiva: true, vogalNaLacunaAtual: true, temOutraPalavra: true, emCelebracao: false,
  };
  const validos = PALAVRINHAS_PODERES.filter((p) => poderElegivel(p, ctxSorteio));
  rng(); rng();                                    // aquece o LCG
  let cartas = shuffle(validos, rng).slice(0, 2);
  if (evitarPar && cartas.length === 2 && parKey(cartas) === evitarPar && validos.length > 2) {
    cartas = shuffle(validos, rng).slice(0, 2);    // segunda tentativa reduz repetição do par
  }
  return cartas;
}
