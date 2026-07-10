/**
 * brincarDailyService.js — Rodadas diárias do Brincar (Bloco 1.1 — fundação).
 *
 * Regra oficial: o plano GRATUITO tem 2 rodadas por dia em Brincar. O Plano Família
 * joga sem limite. O bloqueio é AMIGÁVEL — a criança não é punida, ela é convidada a
 * voltar amanhã (a mensagem vive na tela, não aqui).
 *
 * ── Arquitetura ──────────────────────────────────────────────────────────────
 * NÚCLEO PURO (sem I/O, sem relógio, nunca lança): recebe o estado e a data já
 * resolvidos e devolve decisão. É ele que o smoke exercita.
 * CASCA (async): lê/grava `@ptf_brincar_daily_v1` no AsyncStorage e consulta o plano.
 *
 * ── Chave nova ───────────────────────────────────────────────────────────────
 * `@ptf_brincar_daily_v1` = { day: 'YYYY-MM-DD', used: <int> }
 * NÃO toca nenhuma chave legada do Ateliê (`ptf_atelier_arts_v1_index` e afins).
 *
 * ── Limite honesto ───────────────────────────────────────────────────────────
 * O contador é LOCAL. Mudar o relógio do aparelho reseta o dia. Isso é aceitável para
 * um app infantil sem backend, e é decisão consciente — não descuido. O contador nunca
 * concede estrelinha: quem dá recompensa é o jogo, depois de uma rodada real.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { isPremiumUser } from './accessControl';
import { warn } from '../utils/logger';

/** Rodadas grátis por dia no plano gratuito. */
export const BRINCAR_FREE_DAILY_ROUNDS = 2;

/** Sentinela de "sem limite" (Plano Família). */
export const UNLIMITED = Infinity;

/* ══════════════════════ NÚCLEO PURO (sem I/O, nunca lança) ══════════════════ */

/**
 * Dia LOCAL no formato 'YYYY-MM-DD'. Usa os getters locais (não `toISOString`, que
 * converte para UTC e viraria o dia cedo demais em fusos negativos como o BR).
 * @param {Date} date
 * @returns {string|null} null se a data for inválida
 */
export function toDayKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Entry saneada. Formato desconhecido/corrompido → dia nulo e 0 usadas. */
export function sanitizeEntry(entry) {
  const day = entry && typeof entry.day === 'string' ? entry.day : null;
  const usedRaw = entry && Number(entry.used);
  const used = Number.isFinite(usedRaw) && usedRaw > 0 ? Math.floor(usedRaw) : 0;
  return { day, used };
}

/**
 * Quantas rodadas já foram usadas HOJE. Entry de outro dia → 0 (o dia virou).
 * @param {object|null} entry
 * @param {string} today  'YYYY-MM-DD'
 */
export function usedToday(entry, today) {
  const e = sanitizeEntry(entry);
  return e.day === today ? e.used : 0;
}

/**
 * Rodadas restantes hoje. Premium → UNLIMITED.
 * @param {object|null} entry
 * @param {string} today
 * @param {boolean} premium
 * @param {number} [limit=BRINCAR_FREE_DAILY_ROUNDS]
 */
export function remainingRounds(entry, today, premium, limit = BRINCAR_FREE_DAILY_ROUNDS) {
  if (premium) return UNLIMITED;
  return Math.max(0, limit - usedToday(entry, today));
}

/** True se pode jogar mais uma rodada agora. */
export function canPlayRound(entry, today, premium, limit = BRINCAR_FREE_DAILY_ROUNDS) {
  return remainingRounds(entry, today, premium, limit) > 0;
}

/**
 * Estado APÓS consumir uma rodada. PURO: não decide se pode — quem decide é
 * `canPlayRound`. Premium não incrementa nada (não há o que contar).
 * @returns {{day: string, used: number}}
 */
export function nextEntryAfterRound(entry, today, premium) {
  if (premium) return { day: today, used: usedToday(entry, today) };
  return { day: today, used: usedToday(entry, today) + 1 };
}

/* ══════════════════════════ CASCA (async, nunca lança) ══════════════════════ */

/** Lê a entry crua. Vazio/corrompido/erro → null. */
export async function readEntry() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.BRINCAR_DAILY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (e) {
    warn('brincarDailyService.readEntry:', e);
    return null;
  }
}

/** Grava a entry. Retorna true/false; nunca lança. */
export async function writeEntry(entry) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BRINCAR_DAILY, JSON.stringify(entry));
    return true;
  } catch (e) {
    warn('brincarDailyService.writeEntry:', e);
    return false;
  }
}

/**
 * Estado das rodadas de hoje, já considerando o plano.
 * @returns {Promise<{premium:boolean, used:number, remaining:number, canPlay:boolean, day:string}>}
 */
export async function getDailyRounds(now = new Date()) {
  const today = toDayKey(now) || '1970-01-01';
  const premium = isPremiumUser();
  const entry = await readEntry();
  return {
    premium,
    day: today,
    used: usedToday(entry, today),
    remaining: remainingRounds(entry, today, premium),
    canPlay: canPlayRound(entry, today, premium),
  };
}

/**
 * Consome uma rodada. Se não houver rodada disponível, NÃO grava e devolve
 * `{ ok: false }` — a tela mostra o convite amigável para voltar amanhã.
 */
export async function consumeRound(now = new Date()) {
  const today = toDayKey(now) || '1970-01-01';
  const premium = isPremiumUser();
  const entry = await readEntry();

  if (!canPlayRound(entry, today, premium)) {
    return { ok: false, remaining: 0, premium };
  }
  const next = nextEntryAfterRound(entry, today, premium);
  await writeEntry(next);
  return { ok: true, remaining: remainingRounds(next, today, premium), premium };
}
