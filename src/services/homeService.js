/**
 * getHomePrimaryAction — pure function, no I/O, no navigation.
 *
 * Resolves what the primary CTA block in HomeScreen should show based on
 * current progress. Priority: A → B → C → D.
 *
 * @returns {{ targetType: string, title: string, description: string, buttonLabel: string, storyId: string|null }}
 */
export function getHomePrimaryAction({
  progressByStory,
  progressSummary,
  stories,
  postStoryStatusByStory,
}) {
  const getCount = id => {
    const p = progressByStory[id] || {};
    return Object.values(p).filter(Boolean).length;
  };
  const playable = stories.filter(s => (s.totalCenas ?? 0) > 0);
  const totalStars = progressSummary?.totalStars ?? 0;

  // Scenario A: no progress at all — invite to start
  if (totalStars === 0) {
    const firstStory = playable.find(s => getCount(s.id) === 0) ?? playable[0] ?? null;
    return {
      targetType: 'startFirstStory',
      title: 'Sua aventura começa aqui!',
      description: 'Pinte sua primeira cena e ganhe uma estrela.',
      buttonLabel: 'Começar agora →',
      storyId: firstStory?.id ?? null,
    };
  }

  // Scenario B: story in progress (started but not complete)
  const inProgress = playable.find(s => {
    const cnt = getCount(s.id);
    return cnt > 0 && cnt < (s.totalCenas ?? 0);
  });
  if (inProgress) {
    const cnt = getCount(inProgress.id);
    return {
      targetType: 'continueStory',
      title: 'Continue sua aventura!',
      description: `${inProgress.titulo} · ${cnt}/${inProgress.totalCenas} cenas`,
      buttonLabel: 'Continuar →',
      storyId: inProgress.id,
    };
  }

  // Scenario C: completed story with pending rewards
  const pendingStory = playable.find(s =>
    getCount(s.id) >= (s.totalCenas ?? 0) &&
    postStoryStatusByStory[s.id]?.hasPendingRewards,
  );
  if (pendingStory) {
    return {
      targetType: 'pendingRewards',
      title: 'Você tem recompensas te esperando!',
      description: `${pendingStory.titulo} — Livrinho, Quiz e Lumi disponíveis.`,
      buttonLabel: 'Ver recompensas →',
      storyId: pendingStory.id,
    };
  }

  // Scenario D: all done or no pending action
  const allDone = playable.length > 0 &&
    playable.every(s => getCount(s.id) >= (s.totalCenas ?? 0));
  if (allDone) {
    return {
      targetType: 'openAdventures',
      title: 'Você completou todas as aventuras!',
      description: 'Incrível! Sua jornada ficou completa!',
      buttonLabel: 'Ver conquistas →',
      storyId: null,
    };
  }
  const nextUnstarted = playable.find(s => getCount(s.id) === 0) ?? null;
  return {
    targetType: 'openAdventures',
    title: nextUnstarted ? 'Próxima aventura te espera!' : 'Escolha sua próxima aventura!',
    description: nextUnstarted?.titulo ?? 'Explore novas histórias e ganhe mais estrelas.',
    buttonLabel: nextUnstarted ? 'Começar →' : 'Ver aventuras →',
    storyId: nextUnstarted?.id ?? null,
  };
}
