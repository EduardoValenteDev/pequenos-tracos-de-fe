import { useState, useRef, useCallback } from 'react';
import { stories } from '../data/stories';
import { ACHIEVEMENTS } from '../data/achievements';
import { buildCtx } from '../services/achievementService';
import {
  getSeenAchievementIds,
  markAchievementAsSeen,
  diffNewAchievements,
  silentlyMarkAllCurrentAsSeen,
} from '../services/achievementSeenService';

/**
 * Hook para detectar e celebrar novas conquistas após ações importantes.
 *
 * - Dispara apenas quando checkForNewAchievements() é chamado manualmente.
 * - Primeira execução: se usuário já tem conquistas não vistas, marca todas
 *   silenciosamente para evitar spam ao instalar o Sprint 13.
 * - Não concede estrelas. Não altera progressão.
 * - Falha silenciosamente em caso de erro.
 *
 * @param {object} params
 * @param {object} params.progressByStory - do ProgressContext
 * @param {object} params.postStoryStatusByStory - do ProgressContext
 * @param {boolean} [params.enabled=true] - desligar em telas que não devem disparar
 * @param {string}  [params.source] - identificador para logs (ex: 'CongratsScreen')
 *
 * @returns {{ pendingAchievement, checkForNewAchievements, dismissAchievement }}
 */
export function useAchievementCelebration({ progressByStory, postStoryStatusByStory, enabled = true, source = '' }) {
  const [queue, setQueue] = useState([]);
  const [pendingAchievement, setPendingAchievement] = useState(null);
  const firstCheckRef = useRef(false);
  const runningRef = useRef(false);

  const checkForNewAchievements = useCallback(async () => {
    if (!enabled) return;
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      const ctx = await buildCtx(progressByStory, stories, { postStoryStatusByStory });
      const seenIds = await getSeenAchievementIds();
      const unlockedIds = ACHIEVEMENTS.filter(a => a.check(ctx)).map(a => a.id);

      // Primeira execução: se o usuário já tem conquistas acumuladas antes deste
      // sprint, marca todas silenciosamente para não spammar modais.
      if (!firstCheckRef.current && seenIds.length === 0 && unlockedIds.length > 0) {
        firstCheckRef.current = true;
        await silentlyMarkAllCurrentAsSeen(ctx);
        return;
      }
      firstCheckRef.current = true;

      const newIds = diffNewAchievements(unlockedIds, seenIds);
      if (newIds.length === 0) return;

      const newAchievements = newIds
        .map(id => ACHIEVEMENTS.find(a => a.id === id))
        .filter(Boolean);

      if (newAchievements.length === 1) {
        setPendingAchievement(newAchievements[0]);
      } else if (newAchievements.length > 1) {
        // Mostrar a primeira, enfileirar o restante
        setPendingAchievement(newAchievements[0]);
        setQueue(newAchievements.slice(1));
      }
    } catch (err) {
      // Falha silenciosa — nunca quebrar tela por causa da celebração
      if (__DEV__) console.log(`[useAchievementCelebration:${source}] error:`, err);
    } finally {
      runningRef.current = false;
    }
  }, [progressByStory, postStoryStatusByStory, enabled, source]);

  const dismissAchievement = useCallback(async () => {
    if (!pendingAchievement) return;
    const dismissing = pendingAchievement;
    setPendingAchievement(null);

    try {
      await markAchievementAsSeen(dismissing.id);
    } catch {}

    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      setPendingAchievement(next);
    }
  }, [pendingAchievement, queue]);

  return { pendingAchievement, checkForNewAchievements, dismissAchievement };
}
