/**
 * Persiste o conjunto de conquistas cujo modal já foi exibido ao usuário.
 *
 * Chave: @ptf_achievements_seen
 * Valor: JSON array de achievement IDs (strings)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';

const KEY = '@ptf_achievements_seen';

/** Retorna array de IDs de conquistas já exibidas. */
export async function getSeenAchievements() {
  try {
    const val = await AsyncStorage.getItem(KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

/** Marca uma conquista como vista (não repete o modal). */
export async function markAchievementSeen(achievementId) {
  try {
    const seen = await getSeenAchievements();
    if (!seen.includes(achievementId)) {
      await AsyncStorage.setItem(KEY, JSON.stringify([...seen, achievementId]));
    }
  } catch (e) {
    log('achievementsStorage.mark:', e);
  }
}

/** Remove todos os registros (útil para testes). */
export async function clearSeenAchievements() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    log('achievementsStorage.clear:', e);
  }
}
