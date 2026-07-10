import { hasSavedDrawing } from './drawingStorage';
import { listArts } from './atelierStorage';
import { getFamilyWorshipSummary } from './familyWorshipService';
import { readAchievementCtx as readBrincarAchievementCtx } from './brincarStatsService';
import {
  isQuizDone, getReflection, isLumiMomentEverDone, isStoryBookOpened,
} from './postStoryStorage';

export async function buildCtx(progressMap, storiesList, options = {}) {
  const getCount = id => {
    const p = progressMap[id] || {};
    return Object.values(p).filter(Boolean).length;
  };

  const totalScenes = storiesList.reduce(
    (acc, s) => acc + getCount(s.id), 0,
  );
  const completedStories = storiesList.filter(
    s => (s.totalCenas ?? 0) > 0 && getCount(s.id) >= s.totalCenas,
  ).length;
  const noahComplete = (() => {
    const noah = storiesList.find(s => s.id === 'noah');
    return !!noah && (noah.totalCenas ?? 0) > 0 && getCount('noah') >= noah.totalCenas;
  })();
  const davidComplete = (() => {
    const s = storiesList.find(s => s.id === 'david_goliath');
    return !!s && (s.totalCenas ?? 0) > 0 && getCount('david_goliath') >= s.totalCenas;
  })();
  const jesusComplete = (() => {
    const s = storiesList.find(s => s.id === 'jesus_children');
    return !!s && (s.totalCenas ?? 0) > 0 && getCount('jesus_children') >= s.totalCenas;
  })();
  const creationComplete = (() => {
    const s = storiesList.find(s => s.id === 'creation');
    return !!s && (s.totalCenas ?? 0) > 0 && getCount('creation') >= s.totalCenas;
  })();

  const makeComplete = id => {
    const s = storiesList.find(s => s.id === id);
    return !!s && (s.totalCenas ?? 0) > 0 && getCount(id) >= s.totalCenas;
  };

  const descobridoresIds = ['abraham_stars', 'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi', 'esther_queen', 'miraculous_catch'];
  const jovensDaFeIds = ['samuel_hears_god', 'josiah_young_king', 'solomon_wisdom', 'mary_says_yes', 'timothy_faith', 'jesus_temple'];
  const descobridoresComplete = descobridoresIds.every(makeComplete);
  const jovensDaFeComplete = jovensDaFeIds.every(makeComplete);
  const allStoriesComplete = completedStories >= storiesList.filter(s => (s.totalCenas ?? 0) > 0).length && storiesList.filter(s => (s.totalCenas ?? 0) > 0).length > 0;

  // A6 — invariante de consistência: "Primeira aventura" (first_story) deve acender
  // sempre que QUALQUER conquista específica de "história concluída" acender. Como
  // completedStories e as flags por história derivam do MESMO predicado
  // (getCount >= totalCenas), isto já é verdade hoje; tornamos explícito para
  // travar a relação contra regressões futuras. Conta limpa → tudo false.
  const anyStoryComplete =
    completedStories >= 1 ||
    creationComplete || noahComplete || davidComplete || jesusComplete ||
    descobridoresComplete || jovensDaFeComplete || allStoriesComplete;
  const davidScene1Done = !!(progressMap['david_goliath'] ?? {})[
    storiesList.find(s => s.id === 'david_goliath')?.cenas[0]?.id
  ];
  const jesusScene1Done = !!(progressMap['jesus_children'] ?? {})[
    storiesList.find(s => s.id === 'jesus_children')?.cenas[0]?.id
  ];
  const davidAnyScene = getCount('david_goliath') > 0;

  const hasArkDrawing = await hasSavedDrawing(
    'noah',
    storiesList.find(s => s.id === 'noah')?.cenas[0]?.id ?? 1,
  );

  let hasAnyDrawing = hasArkDrawing;
  if (!hasAnyDrawing) {
    outer: for (const story of storiesList) {
      const p = progressMap[story.id] || {};
      for (const cena of story.cenas) {
        if (p[cena.id] && await hasSavedDrawing(story.id, cena.id)) {
          hasAnyDrawing = true;
          break outer;
        }
      }
    }
  }

  const arts = await listArts();
  const savedDrawingCount = arts.length;

  let anyQuizDone, anyReflectionDone, noahReflectionDone, jesusReflectionDone, anyBookOpened;

  if (options.postStoryStatusByStory) {
    const pss = options.postStoryStatusByStory;
    anyQuizDone = Object.values(pss).some(s => !!s.quizDone);
    anyReflectionDone = Object.values(pss).some(s => !!s.reflectionDone);
    noahReflectionDone = !!pss['noah']?.reflectionDone;
    jesusReflectionDone = !!pss['jesus_children']?.reflectionDone;
    anyBookOpened = Object.values(pss).some(s => !!s.storyBookOpened);
  } else {
    anyQuizDone = (
      await Promise.all(storiesList.map(s => isQuizDone(s.id)))
    ).some(Boolean);
    const reflections = await Promise.all(storiesList.map(s => getReflection(s.id)));
    anyReflectionDone = reflections.some(Boolean);
    noahReflectionDone = !!(await getReflection('noah'));
    jesusReflectionDone = !!(await getReflection('jesus_children'));
    anyBookOpened = (
      await Promise.all(storiesList.map(s => isStoryBookOpened(s.id)))
    ).some(Boolean);
  }

  const lumiMomentEverDone = await isLumiMomentEverDone();

  const familyWorship = await getFamilyWorshipSummary();
  const familyWorshipDone = (familyWorship?.count ?? 0) > 0;

  // Bloco 1.3 — flags do Brincar (paresPlays, paresWinFacil/Medio/Dificil,
  // paresPoucosErros). Defensivo: se a leitura falhar, o ctx segue sem elas e
  // as conquistas de Brincar apenas não acendem — nada quebra.
  let brincarCtx = {};
  try {
    brincarCtx = (await readBrincarAchievementCtx()) || {};
  } catch {
    brincarCtx = {};
  }

  return {
    ...brincarCtx,
    totalScenes,
    completedStories,
    noahComplete,
    davidComplete,
    jesusComplete,
    creationComplete,
    descobridoresComplete,
    jovensDaFeComplete,
    allStoriesComplete,
    anyStoryComplete,
    davidScene1Done,
    jesusScene1Done,
    davidAnyScene,
    hasAnyDrawing,
    hasArkDrawing,
    savedDrawingCount,
    anyQuizDone,
    anyReflectionDone,
    noahReflectionDone,
    jesusReflectionDone,
    anyBookOpened,
    lumiMomentEverDone,
    familyWorshipDone,
  };
}
