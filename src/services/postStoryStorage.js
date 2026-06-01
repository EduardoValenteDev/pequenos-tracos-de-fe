import AsyncStorage from '@react-native-async-storage/async-storage';

function quizKey(storyId)       { return `@ptf_quiz_done_${storyId}`; }
function reflectionKey(storyId) { return `@ptf_reflection_${storyId}`; }
function storyBookKey(storyId)  { return `@ptf_storybook_opened_${storyId}`; }
function lumiMomentKey()        { return `@ptf_lumi_moment_${new Date().toISOString().slice(0, 10)}`; }

/* ── Quiz ── */
export async function isQuizDone(storyId) {
  try {
    return (await AsyncStorage.getItem(quizKey(storyId))) === 'true';
  } catch { return false; }
}

export async function markQuizDone(storyId) {
  try { await AsyncStorage.setItem(quizKey(storyId), 'true'); } catch {}
}

/* ── Reflection ── */
export async function getReflection(storyId) {
  try {
    const raw = await AsyncStorage.getItem(reflectionKey(storyId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function saveReflection(storyId, data) {
  try { await AsyncStorage.setItem(reflectionKey(storyId), JSON.stringify(data)); } catch {}
}

/* ── Story Book ── */
export async function isStoryBookOpened(storyId) {
  try {
    return (await AsyncStorage.getItem(storyBookKey(storyId))) === 'true';
  } catch { return false; }
}

export async function markStoryBookOpened(storyId) {
  try { await AsyncStorage.setItem(storyBookKey(storyId), 'true'); } catch {}
}

export async function getPostStoryStatus(storyId) {
  const [storyBookOpened, quizDone, reflection] = await Promise.all([
    isStoryBookOpened(storyId),
    isQuizDone(storyId),
    getReflection(storyId),
  ]);
  const reflectionDone = !!reflection;
  return {
    storyBookOpened,
    quizDone,
    reflectionDone,
    hasPendingRewards: !storyBookOpened || !quizDone || !reflectionDone,
  };
}

/* ── Bonus stars ── */
const BONUS_KEY = '@ptf_bonus_stars';

export async function getBonusStars() {
  try {
    const raw = await AsyncStorage.getItem(BONUS_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch { return 0; }
}

export async function addBonusStars(amount) {
  try {
    const current = await getBonusStars();
    await AsyncStorage.setItem(BONUS_KEY, String(current + amount));
  } catch {}
}

/* ── Daily Lumi moment ── */
const LUMI_EVER_KEY = '@ptf_lumi_moment_ever';

export async function isLumiMomentDoneToday() {
  try {
    return (await AsyncStorage.getItem(lumiMomentKey())) === 'true';
  } catch { return false; }
}

export async function markLumiMomentDoneToday() {
  try { await AsyncStorage.setItem(lumiMomentKey(), 'true'); } catch {}
}

export async function isLumiMomentEverDone() {
  try {
    return (await AsyncStorage.getItem(LUMI_EVER_KEY)) === 'true';
  } catch { return false; }
}

export async function markLumiMomentEverDone() {
  try { await AsyncStorage.setItem(LUMI_EVER_KEY, 'true'); } catch {}
}
