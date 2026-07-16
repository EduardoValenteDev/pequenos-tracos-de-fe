import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stories } from '../data/stories';
import { markOnce } from '../services/performanceTrace';
import { warn } from '../utils/logger';
import {
  isQuizDone,
  isStoryBookOpened,
  getReflection,
  getBonusStars,
} from '../services/postStoryStorage';
import { getRewardsSummary } from '../services/rewardService';
import { getStoryJourneyStatus } from '../services/storyJourneyService';
import { loadStoriesWithColoringDone } from '../services/coloringActivityService';
import { getStoryAccessStatus } from '../services/contentAccessService';
import {
  getRegionFrontierStory as regionFrontierStory,
  isRegionNarrativeComplete as regionNarrativeComplete,
  getRegionRevealFraction as regionRevealFraction,
  getOrderedAdventureStories,
} from '../data/adventureMap';

const PROGRESS_KEY = '@ptf_progress';
const STORY_IDS = stories.map(s => s.id);
const STORY_BY_ID = Object.fromEntries(stories.map(s => [s.id, s]));
// Ordem OFICIAL da jornada (mesma do mapa) — fonte da SEQUÊNCIA (A0.10).
const ORDERED_STORY_IDS = getOrderedAdventureStories().map(s => s.id);

async function loadAllProgress() {
  const keys = STORY_IDS.map(id => `${PROGRESS_KEY}_${id}`);
  const pairs = await AsyncStorage.multiGet(keys);
  const result = {};
  pairs.forEach(([key, raw]) => {
    const storyId = key.slice(PROGRESS_KEY.length + 1);
    if (!raw) { result[storyId] = {}; return; }
    try {
      result[storyId] = JSON.parse(raw);
    } catch {
      warn(`ProgressContext: invalid JSON for ${storyId}, treating as empty`);
      result[storyId] = {};
    }
  });
  return result;
}

async function loadAllPostStoryStatuses() {
  const entries = await Promise.all(
    STORY_IDS.map(async id => {
      const [storyBookOpened, quizDone, reflection] = await Promise.all([
        isStoryBookOpened(id),
        isQuizDone(id),
        getReflection(id),
      ]);
      const reflectionDone = !!reflection;
      return [id, {
        storyBookOpened,
        quizDone,
        reflectionDone,
        hasPendingRewards: !storyBookOpened || !quizDone || !reflectionDone,
      }];
    }),
  );
  return Object.fromEntries(entries);
}

function computeSummary(progressByStory, postStoryStatusByStory, bonusStars) {
  const playable = stories.filter(s => (s.totalCenas ?? 0) > 0);

  const rewards = getRewardsSummary(progressByStory, postStoryStatusByStory, stories);

  let startedStories = 0;
  let completedStories = 0;
  let pendingRewardsCount = 0;
  const storiesWithPendingRewards = [];
  let storyBookOpenedCount = 0;
  let quizCompletedCount = 0;
  let lumiCompletedCount = 0;

  playable.forEach(s => {
    const prog = progressByStory[s.id] || {};
    const done = Object.values(prog).filter(Boolean).length;
    const total = s.totalCenas ?? 0;
    if (done > 0 && done < total) startedStories++;
    if (done >= total) completedStories++;

    const pss = postStoryStatusByStory[s.id];
    if (pss) {
      if (pss.hasPendingRewards && done >= total) {
        pendingRewardsCount++;
        storiesWithPendingRewards.push(s.id);
      }
      if (pss.storyBookOpened) storyBookOpenedCount++;
      if (pss.quizDone) quizCompletedCount++;
      if (pss.reflectionDone) lumiCompletedCount++;
    }
  });

  const nextRecommendedStory = playable.find(s => {
    const prog = progressByStory[s.id] || {};
    return Object.values(prog).filter(Boolean).length === 0;
  }) ?? null;

  return {
    totalStories: stories.length,
    availableStories: stories.filter(s => s.status === 'available').length,
    freeStories: stories.filter(s => s.accessType === 'free').length,
    premiumStories: stories.filter(s => s.accessType === 'premium').length,
    startedStories,
    completedStories,
    totalScenes: rewards.maxSceneStars,
    completedScenes: rewards.sceneStars,
    completionPercent: rewards.maxSceneStars > 0 ? rewards.sceneStars / rewards.maxSceneStars : 0,
    pendingRewardsCount,
    storiesWithPendingRewards,
    storyBookOpenedCount,
    quizCompletedCount,
    lumiCompletedCount,
    totalBonusStars: bonusStars,
    hasAnyProgress: rewards.sceneStars > 0,
    nextRecommendedStory,
    sceneStars: rewards.sceneStars,
    specialStars: rewards.specialStars,
    totalStars: rewards.totalStars,
    maxSceneStars: rewards.maxSceneStars,
    maxSpecialStars: rewards.maxSpecialStars,
    maxTotalStars: rewards.maxTotalStars,
  };
}

const ProgressContext = createContext({
  progressByStory: {},
  postStoryStatusByStory: {},
  progressSummary: null,
  isLoadingProgress: true,
  progressError: null,
  refreshProgress: async () => {},
  getStoryProgress: () => ({}),
  isStoryCompleted: () => false,
  isStoryJourneyComplete: () => false,
  isStorySequenceUnlocked: () => true,
  getStoryContractStatus: () => null,
  isNarrativeComplete: () => false,
  getRegionFrontierStory: () => null,
  isRegionNarrativeComplete: () => false,
  getRegionRevealFraction: () => 0,
  getCompletedScenesCount: () => 0,
  getTotalScenesCount: () => 0,
  getStoryCompletionPercent: () => 0,
  getPostStoryStatusForStory: () => null,
  hasPendingRewardsForStory: () => false,
  markProgressDirty: async () => {},
});

export function ProgressProvider({ children }) {
  const [progressByStory, setProgressByStory] = useState({});
  const [postStoryStatusByStory, setPostStoryStatusByStory] = useState({});
  const [coloringDoneByStory, setColoringDoneByStory] = useState(() => new Set());
  const [progressSummary, setProgressSummary] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [progressError, setProgressError] = useState(null);

  const loadAll = useCallback(async () => {
    // LP1M-A: só OBSERVA. `markOnce` = mede a hidratação do BOOT (a 1ª carga); os refreshes
    // seguintes não remarcam. Nenhuma leitura foi reordenada, agrupada ou trocada por multiGet.
    markOnce('progress_hydration_start');
    setIsLoadingProgress(true);
    setProgressError(null);
    try {
      const [progress, postStatus, bonusStars, coloringDone] = await Promise.all([
        loadAllProgress(),
        loadAllPostStoryStatuses(),
        getBonusStars(),
        loadStoriesWithColoringDone(STORY_IDS),
      ]);
      setProgressByStory(progress);
      setPostStoryStatusByStory(postStatus);
      setColoringDoneByStory(coloringDone);
      setProgressSummary(computeSummary(progress, postStatus, bonusStars));
    } catch (e) {
      markOnce('progress_hydration_error', { reason: 'error' });
      warn('ProgressContext.loadAll:', e);
      setProgressError(e);
    } finally {
      markOnce('progress_hydration_end');
      setIsLoadingProgress(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, []);

  const refreshProgress = useCallback(() => loadAll(), [loadAll]);
  const markProgressDirty = refreshProgress;

  const getStoryProgress = useCallback(
    storyId => progressByStory[storyId] || {},
    [progressByStory],
  );

  const getTotalScenesCount = useCallback(
    storyId => stories.find(s => s.id === storyId)?.totalCenas ?? 0,
    [],
  );

  const getCompletedScenesCount = useCallback(
    storyId => Object.values(progressByStory[storyId] || {}).filter(Boolean).length,
    [progressByStory],
  );

  const isStoryCompleted = useCallback(
    storyId => {
      const total = getTotalScenesCount(storyId);
      return total > 0 && getCompletedScenesCount(storyId) >= total;
    },
    [getCompletedScenesCount, getTotalScenesCount],
  );

  // A0.10 — CONTRATO da jornada via FONTE ÚNICA storyJourneyService.
  // journeyComplete = cenas + Livrinho aberto + quiz + reflexão + colorir (≥1 página).
  // Cenas completas NÃO bastam. Deriva de dados JÁ carregados (sem storage novo aqui).
  const isStoryJourneyComplete = useCallback(
    storyId => getStoryJourneyStatus({
      totalScenes: getTotalScenesCount(storyId),
      sceneDoneCount: getCompletedScenesCount(storyId),
      postStoryStatus: postStoryStatusByStory[storyId] ?? null,
      coloringComplete: coloringDoneByStory.has(storyId),
      accessStatus: 'full',
      isFirstStory: true, // sequência irrelevante para o booleano de jornada
    }).journeyComplete,
    [getTotalScenesCount, getCompletedScenesCount, postStoryStatusByStory, coloringDoneByStory],
  );

  // SEQUÊNCIA: 1ª história (ordem oficial) sempre liberada; demais só se a ANTERIOR
  // estiver journeyComplete. Cenas completas NÃO liberam a próxima (A0.10).
  const isStorySequenceUnlocked = useCallback(
    storyId => {
      const idx = ORDERED_STORY_IDS.indexOf(storyId);
      if (idx <= 0) return true;
      return isStoryJourneyComplete(ORDERED_STORY_IDS[idx - 1]);
    },
    [isStoryJourneyComplete],
  );

  // CONTRATO COMPLETO (acesso + jornada + sequência) — fonte única de mapa/card/
  // detalhe/estante/pais. Usa getStoryAccessStatus (acesso real NÃO é reescrito).
  const getStoryContractStatus = useCallback(
    storyId => {
      const story = STORY_BY_ID[storyId];
      const idx = ORDERED_STORY_IDS.indexOf(storyId);
      const isFirstStory = idx <= 0;
      const previousJourneyComplete = idx > 0 ? isStoryJourneyComplete(ORDERED_STORY_IDS[idx - 1]) : true;
      return getStoryJourneyStatus({
        totalScenes: getTotalScenesCount(storyId),
        sceneDoneCount: getCompletedScenesCount(storyId),
        postStoryStatus: postStoryStatusByStory[storyId] ?? null,
        coloringComplete: coloringDoneByStory.has(storyId),
        accessStatus: getStoryAccessStatus(story),
        accessType: story?.accessType,
        isFirstStory,
        previousJourneyComplete,
      });
    },
    [getTotalScenesCount, getCompletedScenesCount, postStoryStatusByStory, coloringDoneByStory, isStoryJourneyComplete],
  );

  // "narrativa concluída" = só cenas (mantido para compat/consumidores externos).
  const isNarrativeComplete = isStoryCompleted;

  // A0.10 — helpers de reveal por região agora injetam a JORNADA (journeyComplete),
  // não mais só cenas: o mapa avança a fronteira por journeyComplete. Puros/derivados.
  const getRegionFrontierStory = useCallback(
    (region) => regionFrontierStory(region, isStoryJourneyComplete),
    [isStoryJourneyComplete],
  );
  const isRegionNarrativeComplete = useCallback(
    (region) => regionNarrativeComplete(region, isStoryJourneyComplete),
    [isStoryJourneyComplete],
  );
  const getRegionRevealFraction = useCallback(
    (region, options) => regionRevealFraction(region, isStoryJourneyComplete, options),
    [isStoryJourneyComplete],
  );

  const getStoryCompletionPercent = useCallback(
    storyId => {
      const total = getTotalScenesCount(storyId);
      if (total === 0) return 0;
      return Math.min(100, Math.round((getCompletedScenesCount(storyId) / total) * 100));
    },
    [getCompletedScenesCount, getTotalScenesCount],
  );

  const getPostStoryStatusForStory = useCallback(
    storyId => postStoryStatusByStory[storyId] ?? null,
    [postStoryStatusByStory],
  );

  const hasPendingRewardsForStory = useCallback(
    storyId => postStoryStatusByStory[storyId]?.hasPendingRewards ?? false,
    [postStoryStatusByStory],
  );

  const value = useMemo(() => ({
    progressByStory,
    postStoryStatusByStory,
    progressSummary,
    isLoadingProgress,
    progressError,
    refreshProgress,
    getStoryProgress,
    isStoryCompleted,
    isStoryJourneyComplete,
    isStorySequenceUnlocked,
    getStoryContractStatus,
    isNarrativeComplete,
    getRegionFrontierStory,
    isRegionNarrativeComplete,
    getRegionRevealFraction,
    getCompletedScenesCount,
    getTotalScenesCount,
    getStoryCompletionPercent,
    getPostStoryStatusForStory,
    hasPendingRewardsForStory,
    markProgressDirty,
  }), [
    progressByStory,
    postStoryStatusByStory,
    progressSummary,
    isLoadingProgress,
    progressError,
    refreshProgress,
    getStoryProgress,
    isStoryCompleted,
    isStoryJourneyComplete,
    isStorySequenceUnlocked,
    getStoryContractStatus,
    isNarrativeComplete,
    getRegionFrontierStory,
    isRegionNarrativeComplete,
    getRegionRevealFraction,
    getCompletedScenesCount,
    getTotalScenesCount,
    getStoryCompletionPercent,
    getPostStoryStatusForStory,
    hasPendingRewardsForStory,
    markProgressDirty,
  ]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext() {
  return useContext(ProgressContext);
}
