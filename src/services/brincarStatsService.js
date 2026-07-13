/**
 * brincarStatsService.js — Recordes LOCAIS de Brincar (Bloco 1.3).
 *
 * Sem ranking online, sem rede, sem backend. Tudo vive em `@ptf_brincar_stats_v1`,
 * no aparelho, junto com o perfil local.
 *
 * ── Teto diário de estrelinhas ────────────────────────────────────────────────
 * Uma partida concluída vale 1 estrelinha, com TETO de `BRINCAR_DAILY_STAR_CAP`
 * por dia — para TODOS os planos. O Plano Família joga sem limite de rodadas, mas
 * não farma estrelinha infinita. Sem o teto, a economia de Estrelinhas quebraria.
 *
 * ── Arquitetura ───────────────────────────────────────────────────────────────
 * NÚCLEO PURO (sem I/O, sem relógio, nunca lança) + casca async. O smoke exercita
 * o núcleo. Não toca progresso de histórias nem chaves legadas do Ateliê.
 *
 * Formato: {
 *   day: 'YYYY-MM-DD', starsToday: n, lastMode: 'classico'|'turbo',
 *   pares: { facil: {plays, wins, bestMs, bestErros, bestMoves}, medio: {...}, dificil: {...} },
 *   turbo: { facil: {plays, bestScore, bestPairs, bestCombo}, medio: {...}, dificil: {...} },
 *   ovelha: { facil: {plays, encontradas, bestSequencia}, medio: {...}, dificil: {...} },
 * }
 *
 * `pares` é o recorde do modo CLÁSSICO (nome legado, mantido para não perder dados
 * de quem já jogou). `turbo` nasce vazio. Os recordes NUNCA se misturam entre modos:
 * no Clássico vale menos jogadas/menos tempo; no Turbo vale mais pontos.
 *
 * `ovelha` (Bloco 2.1) é o recorde de "Cadê a Ovelhinha?" — outro jogo da mesma aba.
 * Vive na MESMA chave, e o teto de estrelinhas (`starsToday`) é COMPARTILHADO por
 * TODOS os jogos: é o que impede qualquer um deles de virar fonte infinita de estrela.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import {
  isBetterTime, isBetterScore, isBetterMoves,
  BRINCAR_DAILY_STAR_CAP, DEFAULT_MODE,
} from './paresGameService';
import { warn } from '../utils/logger';

const DIFS = ['facil', 'medio', 'dificil'];
const MODOS = ['classico', 'turbo'];

/** Quantas partidas o histórico pessoal guarda POR DIFICULDADE. Local, sem servidor. */
export const RANKING_MAX = 5;

/* ══════════════════════════ NÚCLEO PURO ══════════════════════════ */

const nOr0 = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : 0);
const posOrNull = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : null);
const zeroOrNull = (v) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.floor(Number(v)) : null);

/**
 * OV2 — recorde de MELHOR TEMPO por cenário: mapa `{ [sceneId]: ms inteiro > 0 }`. Sanitiza qualquer
 * coisa vinda do disco (chaves não-string / valores inválidos são descartados; recordes válidos NUNCA
 * são reduzidos ou apagados). PURO. Não importa dados de cena (mantém o serviço desacoplado).
 */
export function sanitizeBestTimeByScene(raw) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const out = {};
  for (const k of Object.keys(src)) {
    const v = posOrNull(src[k]);
    if (typeof k === 'string' && k && v != null) out[k] = v;
  }
  return out;
}

/**
 * Normaliza qualquer coisa vinda do storage. Corrompido → estado zerado.
 * Tolera o formato ANTIGO (sem `turbo`, sem `bestMoves`): quem já jogou o Clássico
 * mantém tempo e erros; os campos novos nascem vazios.
 */
export function sanitizeStats(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const pares = {};
  const turbo = {};
  const ovelha = {};
  for (const d of DIFS) {
    const p = (src.pares && src.pares[d]) || {};
    pares[d] = {
      plays: nOr0(p.plays), wins: nOr0(p.wins),
      bestMs: posOrNull(p.bestMs), bestErros: zeroOrNull(p.bestErros),
      bestMoves: posOrNull(p.bestMoves),
    };
    const t = (src.turbo && src.turbo[d]) || {};
    turbo[d] = {
      plays: nOr0(t.plays), bestScore: nOr0(t.bestScore),
      bestPairs: nOr0(t.bestPairs), bestCombo: nOr0(t.bestCombo),
      // Histórico pessoal: saneado, reordenado e cortado — mesmo se o disco vier torto.
      ranking: (Array.isArray(t.ranking) ? t.ranking : [])
        .map(sanitizeRankingEntry).filter(Boolean)
        .sort(compararTurbo).slice(0, RANKING_MAX),
    };
    // Bloco 2.1 — "Cadê a Ovelhinha?". Formato antigo (sem `ovelha`/`bestTimeByScene`) nasce zerado/vazio.
    const o = (src.ovelha && src.ovelha[d]) || {};
    ovelha[d] = {
      plays: nOr0(o.plays), encontradas: nOr0(o.encontradas), bestSequencia: nOr0(o.bestSequencia),
      bestTimeByScene: sanitizeBestTimeByScene(o.bestTimeByScene),   // OV2 — melhor tempo por cenário
      bestCompletionMs: posOrNull(o.bestCompletionMs),               // OV3R3 — melhor tempo p/ concluir (só Difícil); antigo → null
    };
  }
  // OV2 — apresentação diária "Encontre esta ovelhinha" (dia local já apresentado). Fica DENTRO de `ovelha`. Antigo → null.
  ovelha.apresentacaoDay = (src.ovelha && typeof src.ovelha.apresentacaoDay === 'string') ? src.ovelha.apresentacaoDay : null;
  // OV3 — Modo Infinito. Fica DENTRO de `ovelha` (mesma chave). Ausente/antigo → objeto zerado.
  ovelha.infinito = sanitizeInfinito(src.ovelha && src.ovelha.infinito);
  return {
    day: typeof src.day === 'string' ? src.day : null,
    starsToday: nOr0(src.starsToday),
    lastMode: MODOS.includes(src.lastMode) ? src.lastMode : DEFAULT_MODE,
    pares,
    turbo,
    ovelha,
  };
}

/* ─────────────────── Ranking pessoal do Turbo (local, sem servidor) ─────────────────── */

/** Normaliza uma entrada do histórico. Entrada inválida → null (nunca entra no ranking). */
export function sanitizeRankingEntry(raw) {
  const e = raw && typeof raw === 'object' ? raw : null;
  if (!e) return null;
  const pontos = nOr0(e.pontos);
  if (pontos <= 0) return null;   // partida sem nenhum par não vira registro
  return {
    pontos,
    pares: nOr0(e.pares),
    maiorCombo: nOr0(e.maiorCombo),
    grades: nOr0(e.grades),
    dificuldade: DIFS.includes(e.dificuldade) ? e.dificuldade : 'facil',
    data: typeof e.data === 'string' ? e.data : '',
    duracaoMs: nOr0(e.duracaoMs),
  };
}

/**
 * Ordem do ranking: pontos ↓ · pares ↓ · maior combo ↓ · partida mais recente ↓.
 * Devolve <0 se `a` vem antes de `b` (a é melhor).
 */
export function compararTurbo(a, b) {
  if (b.pontos !== a.pontos) return b.pontos - a.pontos;
  if (b.pares !== a.pares) return b.pares - a.pares;
  if (b.maiorCombo !== a.maiorCombo) return b.maiorCombo - a.maiorCombo;
  return String(b.data).localeCompare(String(a.data));   // mais recente primeiro
}

/**
 * Insere a partida no histórico e corta em RANKING_MAX. PURO.
 * @returns {{ lista: object[], posicao: number }} posicao 1-based, ou 0 se ficou fora.
 */
export function inserirNoRanking(lista, entrada, max = RANKING_MAX) {
  const atual = (Array.isArray(lista) ? lista : []).map(sanitizeRankingEntry).filter(Boolean);
  const nova = sanitizeRankingEntry(entrada);
  if (!nova) return { lista: atual.slice(0, max), posicao: 0 };

  const ordenada = [...atual, nova].sort(compararTurbo).slice(0, max);
  // Identidade por referência: a entrada nova é a única que não veio de `atual`.
  const idx = ordenada.indexOf(nova);
  return { lista: ordenada, posicao: idx >= 0 ? idx + 1 : 0 };
}

/** Estrelinhas já ganhas HOJE. Dia diferente → 0 (o dia virou). */
export function starsToday(stats, today) {
  const s = sanitizeStats(stats);
  return s.day === today ? s.starsToday : 0;
}

/** Ainda cabe estrelinha hoje? */
export function canEarnStar(stats, today, cap = BRINCAR_DAILY_STAR_CAP) {
  return starsToday(stats, today) < cap;
}

/**
 * Aplica o resultado de uma partida CONCLUÍDA. Puro: devolve o próximo estado.
 * Partida não concluída nunca chega aqui — quem chama é a tela, no fim da rodada.
 *
 * `modo` define QUAL recorde é comparado. Os dois modos dividem o mesmo teto diário
 * de estrelinhas: nenhum deles vira caminho de recompensa infinita.
 *
 * @returns {{ stats: object, isBest: boolean, starAwarded: boolean }}
 */
export function applyResult(stats, partida, cap = BRINCAR_DAILY_STAR_CAP) {
  const s = sanitizeStats(stats);
  const { modo = DEFAULT_MODE, dificuldade, day } = partida || {};
  if (!DIFS.includes(dificuldade) || !MODOS.includes(modo)) {
    return { stats: s, isBest: false, starAwarded: false };
  }

  const proximoDia = s.day === day ? s.starsToday : 0;
  const starAwarded = proximoDia < cap;
  const base = { day, starsToday: proximoDia + (starAwarded ? 1 : 0), lastMode: modo };

  if (modo === 'turbo') {
    const antes = s.turbo[dificuldade];
    const pontos = nOr0(partida.pontos);
    const isBest = isBetterScore(antes.bestScore, pontos);

    // Histórico pessoal daquele nível. `data` vem de fora: a função continua pura.
    const { lista, posicao } = inserirNoRanking(antes.ranking, {
      pontos, pares: partida.pares, maiorCombo: partida.maiorCombo,
      grades: partida.grades, dificuldade, data: partida.data || day,
      duracaoMs: partida.duracaoMs,
    });

    return {
      stats: {
        ...s, ...base,
        turbo: {
          ...s.turbo,
          [dificuldade]: {
            plays: antes.plays + 1,
            bestScore: isBest ? pontos : antes.bestScore,
            bestPairs: Math.max(antes.bestPairs, nOr0(partida.pares)),
            bestCombo: Math.max(antes.bestCombo, nOr0(partida.maiorCombo)),
            ranking: lista,
          },
        },
      },
      isBest,
      starAwarded,
      posicao,   // 0 = ficou fora das cinco melhores
    };
  }

  // Clássico: recorde de TEMPO (legado) e de JOGADAS. Ambos "menos é melhor".
  const antes = s.pares[dificuldade];
  const elapsedMs = partida.elapsedMs;
  const jogadas = nOr0(partida.jogadas);
  const errosNum = zeroOrNull(partida.erros) ?? 0;
  const melhorTempo = isBetterTime(antes.bestMs, elapsedMs);
  const melhorJogadas = isBetterMoves(antes.bestMoves, jogadas);

  return {
    stats: {
      ...s, ...base,
      pares: {
        ...s.pares,
        [dificuldade]: {
          plays: antes.plays + 1,
          wins: antes.wins + 1,
          bestMs: melhorTempo ? Math.floor(Number(elapsedMs)) : antes.bestMs,
          bestErros: antes.bestErros == null ? errosNum : Math.min(antes.bestErros, errosNum),
          bestMoves: melhorJogadas ? jogadas : antes.bestMoves,
        },
      },
    },
    // "Novo recorde" no Clássico = melhorou o tempo OU as jogadas.
    isBest: melhorTempo || melhorJogadas,
    starAwarded,
  };
}

/**
 * Aplica o resultado de uma partida CONCLUÍDA de "Cadê a Ovelhinha?". PURO.
 * Separado do `applyResult` do Pares de propósito — os dois jogos não se acoplam —,
 * mas COMPARTILHA o mesmo teto diário de estrelinhas (`starsToday`).
 *
 * @returns {{ stats: object, isBest: boolean, starAwarded: boolean }}
 */
export function applyOvelhaResult(stats, partida, cap = BRINCAR_DAILY_STAR_CAP) {
  const s = sanitizeStats(stats);
  const { dificuldade, day, permitirEstrela = true } = partida || {};
  if (!DIFS.includes(dificuldade)) return { stats: s, isBest: false, starAwarded: false };

  const proximoDia = s.day === day ? s.starsToday : 0;
  // OV3R3 — `permitirEstrela` false (ex.: DERROTA por tempo no Difícil) NÃO concede nem consome estrela.
  const starAwarded = permitirEstrela && proximoDia < cap;

  const antes = s.ovelha[dificuldade];
  const sequencia = nOr0(partida.sequencia);
  const isBest = sequencia > antes.bestSequencia;

  return {
    stats: {
      ...s,
      day,
      starsToday: proximoDia + (starAwarded ? 1 : 0),
      ovelha: {
        ...s.ovelha,
        [dificuldade]: {
          plays: antes.plays + 1,
          encontradas: antes.encontradas + nOr0(partida.encontradas),
          bestSequencia: Math.max(antes.bestSequencia, sequencia),
          bestTimeByScene: antes.bestTimeByScene,   // OV2 — preservado (tempos gravados por fase, não aqui)
          bestCompletionMs: antes.bestCompletionMs, // OV3R3 — preservado (gravado só na vitória Difícil)
        },
      },
    },
    isBest,
    starAwarded,
  };
}

/* ─────────────── OV2: recorde de TEMPO por fase + apresentação diária (PUROS) ─────────────── */

/** Já mostrou a apresentação "Encontre esta ovelhinha" no dia `today`? PURO. */
export function ovelhaApresentouHoje(stats, today) {
  const s = sanitizeStats(stats);
  return !!today && s.ovelha.apresentacaoDay === today;
}

/** Marca a apresentação diária como vista em `day`. PURO (devolve o próximo estado). */
export function aplicarApresentacaoOvelha(stats, day) {
  const s = sanitizeStats(stats);
  if (!day) return { stats: s };
  return { stats: { ...s, ovelha: { ...s.ovelha, apresentacaoDay: day } } };
}

/* ─────────────── OV3: Modo Infinito (PUROS) ─────────────── */

/** Normaliza o objeto `infinito` (inteiros não-negativos). Ausente/corrompido → zerado. PURO. */
export function sanitizeInfinito(raw) {
  const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    plays: nOr0(o.plays),
    bestScore: nOr0(o.bestScore),
    bestEncontradas: nOr0(o.bestEncontradas),
    bestSequencia: nOr0(o.bestSequencia),
  };
}

/**
 * Aplica o resultado de UMA sessão do Modo Infinito. PURO. Só é válida com ≥1 ovelha encontrada.
 * Recordes só AUMENTAM (empate não é recorde). Divide o MESMO teto diário de estrelinhas.
 * Nenhuma chave nova, nenhum ranking global. @returns {{ stats, isBestScore, starAwarded }}
 */
export function applyInfinitoResult(stats, partida, cap = BRINCAR_DAILY_STAR_CAP) {
  const s = sanitizeStats(stats);
  const { day } = partida || {};
  const score = nOr0(partida && partida.score);
  const encontradas = nOr0(partida && partida.encontradas);
  const sequencia = nOr0(partida && partida.sequencia);
  if (encontradas < 1) return { stats: s, isBestScore: false, starAwarded: false };   // sessão sem ovelha não é válida

  const proximoDia = s.day === day ? s.starsToday : 0;
  const starAwarded = proximoDia < cap;
  const antes = s.ovelha.infinito;
  const isBestScore = score > antes.bestScore;   // empate NÃO é recorde
  return {
    stats: {
      ...s,
      day,
      starsToday: proximoDia + (starAwarded ? 1 : 0),
      ovelha: {
        ...s.ovelha,
        infinito: {
          plays: antes.plays + 1,
          bestScore: Math.max(antes.bestScore, score),
          bestEncontradas: Math.max(antes.bestEncontradas, encontradas),
          bestSequencia: Math.max(antes.bestSequencia, sequencia),
        },
      },
    },
    isBestScore,
    starAwarded,
  };
}

/** Novo recorde? menor tempo (estrito) substitui; empate/maior NÃO. PURO. */
export function novoRecordeTempo(atualMs, novoMs) {
  const n = posOrNull(novoMs);
  if (n == null) return false;
  const a = posOrNull(atualMs);
  return a == null || n < a;
}

/**
 * Aplica o MELHOR TEMPO de uma FASE (cenário) numa dificuldade. Só registra se `elegivel`
 * (sem dica direta e sem tempo esgotado) e se for recorde novo (menor tempo estrito). PURO.
 * Nunca reduz/apaga um recorde válido. @returns {{ stats, novoRecorde }}
 */
export function aplicarTempoFaseOvelha(stats, { dificuldade, sceneId, ms, elegivel = true } = {}) {
  const s = sanitizeStats(stats);
  const n = posOrNull(ms);
  if (!DIFS.includes(dificuldade) || typeof sceneId !== 'string' || !sceneId || n == null || !elegivel) {
    return { stats: s, novoRecorde: false };
  }
  const antes = s.ovelha[dificuldade];
  const atual = antes.bestTimeByScene[sceneId];
  if (!novoRecordeTempo(atual, n)) return { stats: s, novoRecorde: false };
  return {
    stats: {
      ...s,
      ovelha: {
        ...s.ovelha,
        [dificuldade]: { ...antes, bestTimeByScene: { ...antes.bestTimeByScene, [sceneId]: n } },
      },
    },
    novoRecorde: true,
  };
}

/**
 * OV3R3 — Melhor tempo para CONCLUIR o Difícil (10/10 antes do tempo). PURO. Só grava se for
 * menor (estrito); empate/maior NÃO. Fica em `ovelha.dificil.bestCompletionMs` (sem chave nova).
 * @returns {{ stats, novoRecorde }}
 */
export function aplicarCompletionDificil(stats, ms) {
  const s = sanitizeStats(stats);
  const n = posOrNull(ms);
  if (n == null) return { stats: s, novoRecorde: false };
  const antes = s.ovelha.dificil;
  const atual = antes.bestCompletionMs;
  if (!(atual == null || n < atual)) return { stats: s, novoRecorde: false };   // empate/maior não substitui
  return {
    stats: { ...s, ovelha: { ...s.ovelha, dificil: { ...antes, bestCompletionMs: n } } },
    novoRecorde: true,
  };
}

/**
 * Concede 1 estrelinha de "Palavrinhas do Beni" respeitando o TETO DIÁRIO COMPARTILHADO
 * (`starsToday`/`BRINCAR_DAILY_STAR_CAP`), sem tocar nenhum recorde específico do jogo
 * (recordes de Palavrinhas ficam para depois do MVP). PURO. Reusa a MESMA chave/cap dos
 * demais jogos — nada de contador ou chave paralela. @returns {{ stats, starAwarded }}
 */
export function applyPalavrinhasStar(stats, day, cap = BRINCAR_DAILY_STAR_CAP) {
  const s = sanitizeStats(stats);
  const proximoDia = s.day === day ? s.starsToday : 0;
  const starAwarded = proximoDia < cap;
  return { stats: { ...s, day, starsToday: proximoDia + (starAwarded ? 1 : 0) }, starAwarded };
}

/** Flags derivadas para as conquistas. PURO. */
export function toAchievementCtx(stats) {
  const s = sanitizeStats(stats);
  // Partidas concluídas nos DOIS modos contam para "jogou N vezes".
  const total = DIFS.reduce((a, d) => a + s.pares[d].wins + s.turbo[d].plays, 0);
  const menosErros = DIFS
    .map((d) => s.pares[d].bestErros)
    .filter((v) => v != null);
  return {
    paresPlays: total,
    paresWinFacil: s.pares.facil.wins > 0,
    paresWinMedio: s.pares.medio.wins > 0,
    paresWinDificil: s.pares.dificil.wins > 0,
    paresPoucosErros: menosErros.length > 0 && Math.min(...menosErros) <= 2,
  };
}

/* ══════════════════════════ CASCA (async, nunca lança) ══════════════════════ */

export async function readStats() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.BRINCAR_STATS);
    return sanitizeStats(raw ? JSON.parse(raw) : null);
  } catch (e) {
    warn('brincarStatsService.readStats:', e);
    return sanitizeStats(null);
  }
}

async function writeStats(stats) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BRINCAR_STATS, JSON.stringify(stats));
    return true;
  } catch (e) {
    warn('brincarStatsService.writeStats:', e);
    return false;
  }
}

/**
 * Registra uma partida concluída e devolve o que a tela precisa mostrar.
 * NÃO concede a estrelinha: só diz se ela foi autorizada (`starAwarded`).
 * Quem credita é a tela, via addBonusStars — um único ponto de escrita.
 *
 * `partida` = { modo, dificuldade, day, ... } — Clássico usa elapsedMs/erros/jogadas;
 * Turbo usa pontos/pares/maiorCombo.
 */
export async function recordParesResult(partida) {
  const atual = await readStats();
  const r = applyResult(atual, partida);
  await writeStats(r.stats);
  return { isBest: r.isBest, starAwarded: r.starAwarded, stats: r.stats, posicao: r.posicao ?? 0 };
}

/**
 * Registra uma partida concluída de "Cadê a Ovelhinha?". Mesmo contrato do Pares:
 * NÃO credita a estrelinha — só diz se foi autorizada. Quem credita é a tela.
 * `partida` = { dificuldade, day, encontradas, sequencia }.
 */
export async function recordOvelhaResult(partida) {
  const atual = await readStats();
  const r = applyOvelhaResult(atual, partida);
  await writeStats(r.stats);
  return { isBest: r.isBest, starAwarded: r.starAwarded, stats: r.stats };
}

/** OV2 — grava o MELHOR TEMPO de uma FASE (cenário×dif). Falha de storage não impede o resultado. */
export async function recordOvelhaFaseTime(partida) {
  try {
    const atual = await readStats();
    const r = aplicarTempoFaseOvelha(atual, partida);
    if (r.novoRecorde) await writeStats(r.stats);
    return { novoRecorde: r.novoRecorde, stats: r.stats };
  } catch (e) { warn('brincarStatsService.recordOvelhaFaseTime:', e); return { novoRecorde: false, stats: null }; }
}

/** OV3 — registra UMA sessão do Modo Infinito. Mesmo contrato: NÃO credita a estrelinha (a tela
 *  credita via addBonusStars) — só diz se foi autorizada. Falha de storage não impede o resultado. */
export async function recordInfinitoResult(partida) {
  try {
    const atual = await readStats();
    const r = applyInfinitoResult(atual, partida);
    await writeStats(r.stats);
    return { isBestScore: r.isBestScore, starAwarded: r.starAwarded, stats: r.stats };
  } catch (e) { warn('brincarStatsService.recordInfinitoResult:', e); return { isBestScore: false, starAwarded: false, stats: null }; }
}

/** OV3R3 — grava o melhor tempo de CONCLUSÃO do Difícil (só na vitória). Falha não impede o resultado. */
export async function recordCompletionDificil(ms) {
  try {
    const atual = await readStats();
    const r = aplicarCompletionDificil(atual, ms);
    if (r.novoRecorde) await writeStats(r.stats);
    return { novoRecorde: r.novoRecorde, stats: r.stats };
  } catch (e) { warn('brincarStatsService.recordCompletionDificil:', e); return { novoRecorde: false, stats: null }; }
}

/** OV2 — marca a apresentação diária "Encontre esta ovelhinha" como vista em `day`. */
export async function marcarApresentacaoOvelha(day) {
  try {
    const atual = await readStats();
    const r = aplicarApresentacaoOvelha(atual, day);
    await writeStats(r.stats);
    return true;
  } catch (e) { warn('brincarStatsService.marcarApresentacaoOvelha:', e); return false; }
}

/**
 * Registra a estrelinha de uma partida VÁLIDA de "Palavrinhas do Beni". Mesmo contrato dos
 * demais: NÃO credita a estrelinha (quem credita é a tela, via `addBonusStars`) — só diz se
 * foi autorizada pelo teto diário compartilhado. `day` = 'YYYY-MM-DD' (fonte oficial `toDayKey`).
 */
export async function recordPalavrinhasStar(day) {
  const atual = await readStats();
  const r = applyPalavrinhasStar(atual, day);
  await writeStats(r.stats);
  return { starAwarded: r.starAwarded };
}

/** Lembra o último modo escolhido (preferência leve; falha não atrapalha o jogo). */
export async function saveLastMode(modo) {
  if (!MODOS.includes(modo)) return;
  try {
    const atual = await readStats();
    await writeStats({ ...atual, lastMode: modo });
  } catch (e) {
    warn('brincarStatsService.saveLastMode:', e);
  }
}

/** Flags de conquista, já lidas do storage. Erro → flags vazias (nunca lança). */
export async function readAchievementCtx() {
  return toAchievementCtx(await readStats());
}
