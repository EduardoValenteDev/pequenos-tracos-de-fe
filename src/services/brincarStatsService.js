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
 *   day: 'YYYY-MM-DD', starsToday: n,
 *   pares: { facil: {plays, wins, bestMs, bestErros}, medio: {...}, dificil: {...} },
 * }
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { isBetterTime, BRINCAR_DAILY_STAR_CAP } from './paresGameService';
import { warn } from '../utils/logger';

const DIFS = ['facil', 'medio', 'dificil'];

const difVazia = () => ({ plays: 0, wins: 0, bestMs: null, bestErros: null });

/* ══════════════════════════ NÚCLEO PURO ══════════════════════════ */

/** Normaliza qualquer coisa vinda do storage. Corrompido → estado zerado. */
export function sanitizeStats(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const pares = {};
  for (const d of DIFS) {
    const p = (src.pares && src.pares[d]) || {};
    const nOr0 = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : 0);
    const msOrNull = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : null);
    const errOrNull = (v) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.floor(Number(v)) : null);
    pares[d] = { plays: nOr0(p.plays), wins: nOr0(p.wins), bestMs: msOrNull(p.bestMs), bestErros: errOrNull(p.bestErros) };
  }
  return {
    day: typeof src.day === 'string' ? src.day : null,
    starsToday: Number.isFinite(Number(src.starsToday)) && Number(src.starsToday) > 0 ? Math.floor(Number(src.starsToday)) : 0,
    pares,
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
 * @returns {{ stats: object, isBest: boolean, starAwarded: boolean }}
 */
export function applyResult(stats, { dificuldade, elapsedMs, erros, day }, cap = BRINCAR_DAILY_STAR_CAP) {
  const s = sanitizeStats(stats);
  if (!DIFS.includes(dificuldade)) return { stats: s, isBest: false, starAwarded: false };

  const antes = s.pares[dificuldade];
  const isBest = isBetterTime(antes.bestMs, elapsedMs);
  const errosNum = Number.isFinite(Number(erros)) && Number(erros) >= 0 ? Math.floor(Number(erros)) : 0;

  const proximoDia = s.day === day ? s.starsToday : 0;
  const starAwarded = proximoDia < cap;

  return {
    stats: {
      day,
      starsToday: proximoDia + (starAwarded ? 1 : 0),
      pares: {
        ...s.pares,
        [dificuldade]: {
          plays: antes.plays + 1,
          wins: antes.wins + 1,
          bestMs: isBest ? Math.floor(Number(elapsedMs)) : antes.bestMs,
          bestErros: antes.bestErros == null ? errosNum : Math.min(antes.bestErros, errosNum),
        },
      },
    },
    isBest,
    starAwarded,
  };
}

/** Flags derivadas para as conquistas. PURO. */
export function toAchievementCtx(stats) {
  const s = sanitizeStats(stats);
  const total = DIFS.reduce((a, d) => a + s.pares[d].wins, 0);
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
 */
export async function recordParesResult({ dificuldade, elapsedMs, erros, day }) {
  const atual = await readStats();
  const r = applyResult(atual, { dificuldade, elapsedMs, erros, day });
  await writeStats(r.stats);
  return { isBest: r.isBest, starAwarded: r.starAwarded, stats: r.stats };
}

/** Flags de conquista, já lidas do storage. Erro → flags vazias (nunca lança). */
export async function readAchievementCtx() {
  return toAchievementCtx(await readStats());
}
