// [P3J] `hasSavedDrawing` PERMANECE: é a leitura das pinturas legadas já registradas no aparelho.
// A aposentadoria do Colorir legado não apaga nada do storage, então quem já tinha "Primeiro traço"
// e "Artista da arca" continua tendo — conquista não se revoga.
import { hasSavedDrawing } from './drawingStorage';
// [P3J] Reconhecimento NOVO de obra do Colorir com o Beni. Lê a jornada C60 pelo leitor
// RECONCILIADO (conclusão atual + instantâneo íntegro), nunca por `hasEverCompleted` e nunca pela
// simples existência de um PNG: abrir a tela ou dar um toque sem cor não conta.
// Deliberadamente SEM o portão do piloto — uma obra já pintada não pode desaparecer do álbum
// porque a flag mudou de valor.
import { COLORING60_STORY_ID } from './coloring60Pilot';
import { loadColoring60JourneyState } from './coloring60ProgressReader';
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
  // [P3J] "Primeiro traço" também acende com obra do Colorir com o Beni. Sem isto, a conquista
  // ficaria inalcançável para quem chegar depois da aposentadoria do legado — pintaria de verdade
  // e nada aconteceria. As três leituras acima continuam valendo primeiro: nada legado se perde.
  //
  // O que conta como obra: `completedCount >= 1` do leitor reconciliado, ou seja, atividade
  // CONCLUÍDA (que já exige pintura significativa lá na conclusão) ou instantâneo íntegro de uma
  // conclusão anterior. Abrir a tela não conta; um toque sem cor não conta.
  //
  // Defensivo em três frentes: (1) só consulta se ainda não acendeu, para não pagar I/O à toa;
  // (2) o leitor REJEITA quando o storage falha, e uma falha de leitura jamais pode apagar uma
  // conquista — por isso o catch devolve o valor anterior intacto; (3) nada de portão do piloto
  // aqui: obra pintada é obra pintada, mesmo que a flag feche depois.
  if (!hasAnyDrawing) {
    try {
      const c60 = await loadColoring60JourneyState(COLORING60_STORY_ID);
      if ((c60?.completedCount ?? 0) >= 1) hasAnyDrawing = true;
    } catch {
      // leitura indisponível → mantém o que já foi apurado; nunca revoga
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
