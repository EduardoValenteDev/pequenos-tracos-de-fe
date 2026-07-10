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
 * }
 *
 * `pares` é o recorde do modo CLÁSSICO (nome legado, mantido para não perder dados
 * de quem já jogou). `turbo` nasce vazio. Os recordes NUNCA se misturam entre modos:
 * no Clássico vale menos jogadas/menos tempo; no Turbo vale mais pontos.
 *
 * O teto diário de estrelinhas (`starsToday`) é COMPARTILHADO pelos dois modos — é o
 * que impede o Turbo de virar uma fonte infinita de recompensa.
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

const difVazia = () => ({ plays: 0, wins: 0, bestMs: null, bestErros: null, bestMoves: null });
const turboVazio = () => ({ plays: 0, bestScore: 0, bestPairs: 0, bestCombo: 0 });

/* ══════════════════════════ NÚCLEO PURO ══════════════════════════ */

const nOr0 = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : 0);
const posOrNull = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : null);
const zeroOrNull = (v) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.floor(Number(v)) : null);

/**
 * Normaliza qualquer coisa vinda do storage. Corrompido → estado zerado.
 * Tolera o formato ANTIGO (sem `turbo`, sem `bestMoves`): quem já jogou o Clássico
 * mantém tempo e erros; os campos novos nascem vazios.
 */
export function sanitizeStats(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const pares = {};
  const turbo = {};
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
    };
  }
  return {
    day: typeof src.day === 'string' ? src.day : null,
    starsToday: nOr0(src.starsToday),
    lastMode: MODOS.includes(src.lastMode) ? src.lastMode : DEFAULT_MODE,
    pares,
    turbo,
  };
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
          },
        },
      },
      isBest,
      starAwarded,
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
  return { isBest: r.isBest, starAwarded: r.starAwarded, stats: r.stats };
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
