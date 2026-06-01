/**
 * achievementSeenService — gerencia quais conquistas já foram celebradas.
 *
 * Delega armazenamento para achievementsStorage (chave @ptf_achievements_seen).
 * Adiciona helpers de diff e marcação em lote.
 */
import {
  getSeenAchievements,
  markAchievementSeen,
} from './achievementsStorage';
import { ACHIEVEMENTS } from '../data/achievements';

/** Retorna array de IDs de conquistas já celebradas. */
export async function getSeenAchievementIds() {
  return getSeenAchievements();
}

/** Marca uma conquista como celebrada. */
export async function markAchievementAsSeen(id) {
  return markAchievementSeen(id);
}

/** Marca um array de IDs como celebrados (sem duplicar). */
export async function markAchievementsAsSeen(ids) {
  for (const id of ids) {
    await markAchievementSeen(id);
  }
}

/**
 * Retorna IDs que estão em unlockedIds mas não em seenIds.
 * Ordem: mesma que ACHIEVEMENTS para priorizar as mais básicas primeiro.
 */
export function diffNewAchievements(unlockedIds, seenIds) {
  const seenSet = new Set(seenIds);
  return ACHIEVEMENTS
    .map(a => a.id)
    .filter(id => unlockedIds.includes(id) && !seenSet.has(id));
}

/**
 * Silenciosamente marca todas as conquistas atualmente desbloqueadas como vistas.
 * Uso: primeira execução após instalação do Sprint 13, para não spammar modais.
 */
export async function silentlyMarkAllCurrentAsSeen(ctx) {
  if (!ctx) return;
  const unlockedIds = ACHIEVEMENTS.filter(a => a.check(ctx)).map(a => a.id);
  await markAchievementsAsSeen(unlockedIds);
}
