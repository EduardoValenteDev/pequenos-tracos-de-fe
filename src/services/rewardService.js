export function getRewardsSummary(progressByStory, postStoryStatusByStory, storiesList) {
  const playable = storiesList.filter(s => (s.totalCenas ?? 0) > 0);

  let sceneStars = 0;
  let maxSceneStars = 0;
  let specialStars = 0;
  let maxSpecialStars = 0;

  playable.forEach(s => {
    const prog = progressByStory[s.id] || {};
    sceneStars += Object.values(prog).filter(Boolean).length;
    maxSceneStars += s.totalCenas ?? 0;

    maxSpecialStars += 3;
    const pss = postStoryStatusByStory[s.id];
    if (pss) {
      if (pss.quizDone) specialStars++;
      if (pss.reflectionDone) specialStars++;
      if (pss.storyBookOpened) specialStars++;
    }
  });

  return {
    sceneStars,
    specialStars,
    totalStars: sceneStars + specialStars,
    maxSceneStars,
    maxSpecialStars,
    maxTotalStars: maxSceneStars + maxSpecialStars,
  };
}

export function getStoryRewardBreakdown(progressByStory, postStoryStatusByStory, storyId, story) {
  const prog = progressByStory[storyId] || {};
  const sceneStars = Object.values(prog).filter(Boolean).length;
  const maxSceneStars = story?.totalCenas ?? 0;

  const pss = postStoryStatusByStory[storyId] || {};
  const quizStar = pss.quizDone ? 1 : 0;
  const reflectionStar = pss.reflectionDone ? 1 : 0;
  const storyBookStar = pss.storyBookOpened ? 1 : 0;
  const specialStars = quizStar + reflectionStar + storyBookStar;

  return {
    sceneStars,
    maxSceneStars,
    quizStar,
    reflectionStar,
    storyBookStar,
    specialStars,
    totalStars: sceneStars + specialStars,
    maxTotalStars: maxSceneStars + 3,
  };
}
