/**
 * scripts/smoke.js — Sprint 10 smoke test.
 *
 * Run: node scripts/smoke.js
 *
 * Validations covering:
 *   stories.js integrity, access control, screen guards,
 *   dead field removal, premium language, critical files,
 *   audio infrastructure (Sprint 4), expo-audio migration (Sprint 4.1),
 *   Livrinho architecture (Sprints 5–5.4), ProgressContext (Sprint 6),
 *   rewardService / star fields / achievementService (Sprint 7),
 *   "+2 ⭐" text fixes / CongratsScreen rename (Sprint 7.1),
 *   Ateliê e Galeria Local (Sprint 8),
 *   Viewer alta qualidade / previewBase64 (Sprint 8.1),
 *   Safe Area, icons, ParentalGate, ProfileScreen, language polish (Sprint 9),
 *   Safe Area aplicada em telas reais, FaithIcon nos pontos visíveis, linguagem
 *   Especial da Família em toda área infantil (Sprint 9.1),
 *   Paleta unificada, drawStamp actualBoundingBox, flood fill threshold 210 (Sprint 9.2),
 *   Coloring UX Sprint 9.3 (zoomIn, FILL_REJECTED, FaithIcon tools, lineTip),
 *   Coloring comfort Sprint 9.4 (clear text, two-finger pan, layout),
 *   Aventuras como Estante de Histórias Sprint 10 (FaithIcon chips, 16:9 card,
 *   scroll-to-top, center chip, infantile header, language, docs).
 *   Home/Lumi/Minhas Estrelinhas Sprint 11 (getHomePrimaryAction, 4 scenarios,
 *   "Continuar minha aventura", TrophiesScreen renamed, dimmed stars, progressLabel,
 *   tab "Estrelinhas", language sweep — no "Premium" in child areas).
 */

const fs = require('fs');
const path = require('path');

let failures = 0;
let passes = 0;
let checkIndex = 0;

function pass(msg) {
  checkIndex++;
  console.log(`  [${String(checkIndex).padStart(2, '0')}] ✓ ${msg}`);
  passes++;
}

function fail(msg, detail) {
  checkIndex++;
  console.error(`  [${String(checkIndex).padStart(2, '0')}] ✗ ${msg}`);
  if (detail) console.error(`       → ${detail}`);
  failures++;
}

function check(label, condition, failDetail) {
  if (condition) pass(label);
  else fail(label, failDetail);
}

const root = path.resolve(__dirname, '..');

function readSrc(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function srcExists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

// ── [01–05] stories.js integrity ────────────────────────────────────────────
console.log('\n── stories.js integrity ──');

const storiesSource = readSrc('src/data/stories.js');

check(
  'No devUnlocked field',
  !/\bdevUnlocked\b/.test(storiesSource),
  'devUnlocked still present in stories.js',
);

check(
  'No isFree field',
  !/\bisFree\s*:/.test(storiesSource),
  'isFree field still present in stories.js',
);

check(
  'No isPremium field',
  !/\bisPremium\s*:/.test(storiesSource),
  'isPremium field still present in stories.js',
);

const freeCount = (storiesSource.match(/accessType:\s*['"]free['"]/g) || []).length;
check(
  `Exactly 2 free stories (found ${freeCount})`,
  freeCount === 2,
  `Expected 2, got ${freeCount}`,
);

const premiumCount = (storiesSource.match(/accessType:\s*['"]premium['"]/g) || []).length;
check(
  `Exactly 18 premium stories (found ${premiumCount})`,
  premiumCount === 18,
  `Expected 18, got ${premiumCount}`,
);

// ── [06–10] story status ─────────────────────────────────────────────────────
console.log('\n── story status ──');

const availableCount = (storiesSource.match(/status:\s*['"]available['"]/g) || []).length;
check(
  `20 available stories (found ${availableCount})`,
  availableCount === 20,
  `Expected 20 available, got ${availableCount}`,
);

const comingSoonStatusCount = (storiesSource.match(/status:\s*['"]coming_soon['"]/g) || []).length;
check(
  `Zero stories with status coming_soon (found ${comingSoonStatusCount})`,
  comingSoonStatusCount === 0,
  `${comingSoonStatusCount} story/stories still have status: 'coming_soon'`,
);

check(
  'creation story is free',
  /id:\s*['"]creation['"]/.test(storiesSource) &&
    storiesSource.includes("id: 'creation'") &&
    storiesSource.indexOf("accessType: 'free'") < storiesSource.indexOf("id: 'noah'"),
  'creation story not found as free',
);

check(
  'noah story is free',
  /id:\s*['"]noah['"]/.test(storiesSource),
  'noah story not found',
);

check(
  'No single story declares access via both isFree and accessType',
  !/\bisFree\s*:/.test(storiesSource),
  'Found redundant isFree alongside accessType',
);

// ── [11–15] accessControl.js safety ─────────────────────────────────────────
console.log('\n── accessControl.js safety ──');

const acSource = readSrc('src/services/accessControl.js');

check(
  'ENABLE_LOCAL_PREMIUM_TEST_MODE = false',
  /ENABLE_LOCAL_PREMIUM_TEST_MODE\s*=\s*false/.test(acSource),
  'ENABLE_LOCAL_PREMIUM_TEST_MODE is not false — never ship as true!',
);

const devProductLines = acSource
  .split('\n')
  .filter(l => l.includes('__DEV__'))
  .filter(l => !l.trim().startsWith('//') && !l.trim().startsWith('*'))
  .filter(l => !/console\.(log|warn|error)/.test(l));
check(
  'No __DEV__ product gate in accessControl.js',
  devProductLines.length === 0,
  devProductLines.join(' | '),
);

check(
  'console.warn present for test mode',
  /console\.warn.*ENABLE_LOCAL_PREMIUM_TEST_MODE/.test(acSource),
  'Missing console.warn when test mode active',
);

check(
  'isPremiumUser exported',
  acSource.includes('export function isPremiumUser'),
  'isPremiumUser not exported from accessControl',
);

check(
  'hasAccess (alias) exported',
  acSource.includes('export function hasAccess'),
  'hasAccess not exported from accessControl',
);

// ── Modo Criador / QA (override de permissão local, seguro p/ produção) ──
const qaSrc = readSrc('src/services/creatorQaMode.js');

check(
  'creatorQaMode só é permitido em __DEV__ ou flag de build (não liga em prod)',
  /isCreatorQaModeAllowed/.test(qaSrc) &&
  qaSrc.includes('__DEV__') &&
  qaSrc.includes("EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE === 'true'"),
  'creatorQaMode allowed gate must be __DEV__ or EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE',
);

check(
  'creatorQaMode: enabled é ignorado quando não permitido (prod ignora storage)',
  /isCreatorQaModeEnabled\(\)\s*\{[\s\S]*?if \(!isCreatorQaModeAllowed\(\)\) return false/.test(qaSrc),
  'isCreatorQaModeEnabled must return false when the mode is not allowed (production safety)',
);

check(
  'creatorQaMode persiste em AsyncStorage só quando permitido',
  qaSrc.includes('@ptf_creator_qa_mode') &&
  /setCreatorQaModeEnabled[\s\S]*?if \(!isCreatorQaModeAllowed\(\)\)/.test(qaSrc),
  'setCreatorQaModeEnabled must guard persistence behind isCreatorQaModeAllowed',
);

check(
  'creatorQaMode NÃO marca compra/plano real (só override de permissão)',
  !qaSrc.includes('premiumPurchased') && !/getCurrentPlan|PREMIUM_PLAN|premium'/.test(qaSrc),
  'creatorQaMode must not touch real plan/purchase — it is only a permission override',
);

check(
  'accessControl: isPremiumUser passa pela camada de QA (libera com Modo Criador)',
  acSource.includes("import { isCreatorQaModeEnabled } from './creatorQaMode'") &&
  /isPremiumUser\(\)\s*\{[\s\S]*?getCurrentPlan\(\) === 'premium'[\s\S]*?isCreatorQaModeEnabled\(\)/.test(acSource),
  'isPremiumUser must grant access for real Premium OR Creator QA mode',
);

check(
  'accessControl: QA desligado mantém Premium bloqueado (plano real free)',
  /getCurrentPlan\(\)\s*\{[\s\S]*?return 'free'/.test(acSource),
  'Default plan must remain free — Creator QA is an override, not a global unlock',
);

check(
  'hasPremiumAccess exportado (pronto p/ futura compra real)',
  acSource.includes('export function hasPremiumAccess'),
  'hasPremiumAccess alias not exported',
);

const parentQaSrc = readSrc('src/screens/ParentAreaScreen.js');
check(
  'Modo Criador aparece só na Área dos Pais e só se permitido (atrás do gate)',
  parentQaSrc.includes('isCreatorQaModeAllowed') &&
  parentQaSrc.includes('qaAllowed &&') &&
  parentQaSrc.includes('Modo Criador') &&
  parentQaSrc.includes('não altera o plano dos usuários reais'),
  'ParentAreaScreen must show the Creator toggle only when allowed, with the QA warning',
);

check(
  'Toggle do Modo Criador NÃO está em telas infantis (Home/Stories/Profile)',
  !readSrc('src/screens/HomeScreen.js').includes('CreatorQaMode') &&
  !readSrc('src/screens/StoriesScreen.js').includes('CreatorQaMode') &&
  !readSrc('src/screens/ProfileScreen.js').includes('CreatorQaMode'),
  'Creator QA toggle must not appear on child-facing screens',
);

check(
  'App.js carrega o Modo Criador no boot',
  readSrc('App.js').includes('loadCreatorQaMode'),
  'App.js must load the creator QA mode on startup',
);

// ── [16–20] contentAccessService.js API ─────────────────────────────────────
console.log('\n── contentAccessService.js API ──');

const csSource = readSrc('src/services/contentAccessService.js');

for (const fn of [
  'canOpenStoryFullExperience',
  'getStoryUIState',
  'getStoryPrimaryAction',
  'getLockedStoryMessage',
  'getParentPremiumMessage',
]) {
  check(
    `exports ${fn}`,
    csSource.includes(`export function ${fn}`),
    `Missing export: ${fn}`,
  );
}

// ── [21–27] screen guards ────────────────────────────────────────────────────
console.log('\n── screen guards ──');

check(
  'NarrationScreen has canOpenStoryFullExperience guard',
  readSrc('src/screens/NarrationScreen.js').includes('canOpenStoryFullExperience'),
  'NarrationScreen missing access guard',
);

check(
  'ColoringScreen has canOpenStoryFullExperience guard',
  readSrc('src/screens/ColoringScreen.js').includes('canOpenStoryFullExperience'),
  'ColoringScreen missing access guard',
);

check(
  'QuizScreen has canOpenQuiz guard',
  readSrc('src/screens/QuizScreen.js').includes('canOpenQuiz'),
  'QuizScreen missing canOpenQuiz guard',
);

check(
  'ReflectionScreen has canOpenLumi guard',
  readSrc('src/screens/ReflectionScreen.js').includes('canOpenLumi'),
  'ReflectionScreen missing canOpenLumi guard',
);

check(
  'LumiMomentScreen has canOpenMomentoLumi guard',
  readSrc('src/screens/LumiMomentScreen.js').includes('canOpenMomentoLumi'),
  'LumiMomentScreen missing canOpenMomentoLumi guard',
);

check(
  'PostStoryHubScreen has canOpenStoryFullExperience guard',
  readSrc('src/screens/PostStoryHubScreen.js').includes('canOpenStoryFullExperience'),
  'PostStoryHubScreen missing access guard',
);

check(
  'ParentAreaScreen has session gate (unlockedForSession)',
  readSrc('src/screens/ParentAreaScreen.js').includes('unlockedForSession'),
  'ParentAreaScreen missing session gate',
);

// ── [28–30] critical files exist ─────────────────────────────────────────────
console.log('\n── critical files ──');

check(
  'PremiumLockCard exists',
  srcExists('src/components/premium/PremiumLockCard.js'),
  'PremiumLockCard.js not found',
);

check(
  'LockedStoryFallback exists',
  srcExists('src/components/premium/LockedStoryFallback.js'),
  'LockedStoryFallback.js not found',
);

check(
  'ParentalGate exists',
  srcExists('src/components/ParentalGate.js'),
  'ParentalGate.js not found',
);

// ── [31–33] safety: no supabase, no external links unguarded ────────────────
console.log('\n── safety ──');

const pkgJson = readSrc('package.json');
check(
  'No @supabase/supabase-js in package.json',
  !pkgJson.includes('@supabase/supabase-js'),
  'supabase-js found in package.json',
);

function walkSrc(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules') out.push(...walkSrc(full));
    else if (e.isFile() && /\.(js|ts|tsx|jsx)$/.test(e.name)) out.push(full);
  }
  return out;
}

const allFiles = walkSrc(path.join(root, 'src'));

// devUnlocked global scan
const duFiles = allFiles.filter(f => {
  const src = fs.readFileSync(f, 'utf8');
  return src.split('\n').some(l =>
    l.includes('devUnlocked') &&
    !l.trim().startsWith('//') &&
    !l.trim().startsWith('*'),
  );
});
check(
  'No devUnlocked references anywhere in src/',
  duFiles.length === 0,
  duFiles.map(f => path.relative(root, f)).join(', '),
);

// isFree / isPremium as object fields in src (not function names)
const deadFieldFiles = allFiles.filter(f => {
  const src = fs.readFileSync(f, 'utf8');
  return /\bisFree\s*:|isPremium\s*:/.test(src);
});
check(
  'No isFree:/isPremium: object fields in src/',
  deadFieldFiles.length === 0,
  deadFieldFiles.map(f => path.relative(root, f)).join(', '),
);

// ── [34] language consistency ────────────────────────────────────────────────
console.log('\n── language ──');

// "Plano Família" is the official adult-area plan name (ParentAreaScreen).
// "Plano Familiar" is the old/wrong form — must not appear anywhere in src/.
const planFamiliarFiles = allFiles.filter(f => {
  const src = fs.readFileSync(f, 'utf8');
  return src.includes('Plano Familiar');
});
check(
  'No "Plano Familiar" (old form) in src/ — correct form is "Plano Família"',
  planFamiliarFiles.length === 0,
  planFamiliarFiles.map(f => path.relative(root, f)).join(', '),
);

// ── [35–40] Lumi rule fix ────────────────────────────────────────────────────
console.log('\n── Lumi rule fix ──');

const acSourceS3 = readSrc('src/services/accessControl.js');
const postHubSrc = readSrc('src/screens/PostStoryHubScreen.js');
const reflSrcS3 = readSrc('src/screens/ReflectionScreen.js');

check(
  'hasLumiAccessForStory exported from accessControl',
  acSourceS3.includes('export function hasLumiAccessForStory'),
  'hasLumiAccessForStory not found in accessControl.js',
);

check(
  'canOpenLumi delegates to hasLumiAccessForStory',
  acSourceS3.includes('return hasLumiAccessForStory('),
  'canOpenLumi does not call hasLumiAccessForStory',
);

check(
  'ReflectionScreen passes story to canOpenLumi',
  reflSrcS3.includes('canOpenLumi(story)'),
  'ReflectionScreen missing canOpenLumi(story) call',
);

check(
  'PostStoryHubScreen passes story to canOpenLumi',
  postHubSrc.includes('canOpenLumi(story)'),
  'PostStoryHubScreen missing canOpenLumi(story) call',
);

// ── [39–40] Livrinho fix ─────────────────────────────────────────────────────
console.log('\n── Livrinho fix ──');

check(
  'PostStoryHubScreen does not call markStoryBookOpened',
  !postHubSrc.includes('markStoryBookOpened('),
  'markStoryBookOpened( call still present in PostStoryHubScreen',
);

check(
  'PostStoryHubScreen does not import markStoryBookOpened',
  !postHubSrc.includes('markStoryBookOpened'),
  'markStoryBookOpened still referenced in PostStoryHubScreen',
);

// ── [41–43] Email cleanup ────────────────────────────────────────────────────
console.log('\n── Email cleanup ──');

const emailFiles = allFiles.filter(f => fs.readFileSync(f, 'utf8').includes('valentee078'));
check(
  'No valentee078 email anywhere in src/',
  emailFiles.length === 0,
  emailFiles.map(f => path.relative(root, f)).join(', '),
);

check(
  'productConfig.js has support email (email centralizado no Sprint Beni 1.0)',
  readSrc('src/config/productConfig.js').includes('contato@pequenostracosdefe.com'),
  'Support email not found in productConfig.js',
);

check(
  'ProfileScreen has no direct email (Enviar Feedback removed in Sprint 9)',
  !readSrc('src/screens/ProfileScreen.js').includes('contato@pequenostracosdefe.com'),
  'ProfileScreen still contains support email — Enviar Feedback card was supposed to be removed in Sprint 9',
);

// ── [44–48] planConfig expansion ────────────────────────────────────────────
console.log('\n── planConfig expansion ──');

const pcSourceS3 = readSrc('src/data/planConfig.js');

check(
  'PLAN_PRICING exported from planConfig',
  pcSourceS3.includes('export const PLAN_PRICING'),
  'PLAN_PRICING not exported from planConfig.js',
);

check(
  'isPurchaseEnabled: false in planConfig',
  pcSourceS3.includes('isPurchaseEnabled: false'),
  'isPurchaseEnabled: false not found in planConfig.js',
);

check(
  'productIdPlaceholder in planConfig',
  pcSourceS3.includes('productIdPlaceholder'),
  'productIdPlaceholder not found in planConfig.js',
);

check(
  'PLAN_PRICING has monthly entry',
  pcSourceS3.includes("'monthly'") || pcSourceS3.includes('"monthly"'),
  'PLAN_PRICING missing monthly entry',
);

check(
  'PLAN_PRICING has annual entry',
  pcSourceS3.includes("'annual'") || pcSourceS3.includes('"annual"'),
  'PLAN_PRICING missing annual entry',
);

// ── [49–51] ParentAreaScreen redesign ───────────────────────────────────────
console.log('\n── ParentAreaScreen redesign ──');

const pasSrc = readSrc('src/screens/ParentAreaScreen.js');

check(
  'ParentAreaScreen imports useProgressContext (replaces getBonusStars — Sprint 7)',
  pasSrc.includes('useProgressContext'),
  'ParentAreaScreen does not import useProgressContext — progress section disconnected from context',
);

check(
  'ParentAreaScreen has disabled Ativar em breve button',
  pasSrc.includes('Ativar em breve'),
  'ParentAreaScreen missing disabled purchase button text',
);

check(
  'ParentAreaScreen security section has Sem login point',
  pasSrc.includes('Sem login'),
  'Security section missing "Sem login" point',
);

// ── [52–54] Language & safety ────────────────────────────────────────────────
console.log('\n── Language & safety ──');

const compreCFiles = allFiles.filter(f => fs.readFileSync(f, 'utf8').includes('Compre agora'));
check(
  'No "Compre agora" anywhere in src/',
  compreCFiles.length === 0,
  compreCFiles.map(f => path.relative(root, f)).join(', '),
);

check(
  'canOpenMomentoLumi unchanged (always premium)',
  acSourceS3.includes('export function canOpenMomentoLumi') &&
    acSourceS3.includes('return hasMomentoLumiAccess()'),
  'canOpenMomentoLumi may have been incorrectly modified',
);

check(
  'LumiMomentScreen still uses canOpenMomentoLumi guard',
  readSrc('src/screens/LumiMomentScreen.js').includes('canOpenMomentoLumi()'),
  'LumiMomentScreen missing canOpenMomentoLumi() guard',
);

// ── [55–74] Sprint 4 — Audio infrastructure ──────────────────────────────────
console.log('\n── Sprint 4: audio infrastructure ──');

const manifestSrc = readSrc('src/data/audioManifest.js');
const audioSvcSrc = readSrc('src/services/audioService.js');
const audioPlayerSrc = readSrc('src/components/AudioPlayer.js');
const narrationSrc = readSrc('src/screens/NarrationScreen.js');
const heroSrc = readSrc('src/components/story/StoryBookHero.js');

check(
  'audioManifest.js exists',
  srcExists('src/data/audioManifest.js'),
  'src/data/audioManifest.js not found',
);

check(
  'audioManifest exports AUDIO_MANIFEST',
  manifestSrc.includes('export const AUDIO_MANIFEST'),
  'AUDIO_MANIFEST not exported from audioManifest.js',
);

check(
  'audioManifest exports AUDIO_STATUS',
  manifestSrc.includes('export const AUDIO_STATUS'),
  'AUDIO_STATUS not exported from audioManifest.js',
);

check(
  'audioManifest lists all 20 story IDs',
  [
    'creation', 'noah', 'david_goliath', 'jesus_children', 'daniel_lions',
    'jonah_big_fish', 'lost_sheep', 'good_samaritan', 'abraham_stars',
    'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi', 'esther_queen',
    'miraculous_catch', 'samuel_hears_god', 'josiah_young_king', 'solomon_wisdom',
    'mary_says_yes', 'timothy_faith', 'jesus_temple',
  ].every(id => manifestSrc.includes(`'${id}'`)),
  'One or more story IDs missing from audioManifest.js',
);

// Integrity: every require() in _readyEntries must point to a file that exists on disk.
// When _readyEntries is empty this passes trivially (0 checked = 0 broken).
// When audio is added the physical file must already be in assets/audio/ first.
const _mfReadySection = manifestSrc.split('const _readyEntries')[1]?.split('];')[0] ?? '';
const _mfRequirePaths = [..._mfReadySection.matchAll(/require\(['"](.*?)['"]\)/g)].map(m => m[1]);
const _mfBrokenPaths = _mfRequirePaths.filter(p => !fs.existsSync(path.join(root, p.replace(/^\.\.\/\.\.\//, ''))));
check(
  `audioManifest: all _readyEntries require() paths exist on disk (${_mfRequirePaths.length} declared)`,
  _mfBrokenPaths.length === 0,
  `Broken paths (no file): ${_mfBrokenPaths.join(', ')}`,
);

check(
  'audioManifest has no remote URLs',
  !/https?:\/\//.test(manifestSrc),
  'Remote URL found in audioManifest.js — audio must be local bundled assets',
);

check(
  'audioService exports getSceneAudio',
  audioSvcSrc.includes('export function getSceneAudio'),
  'getSceneAudio not exported from audioService.js',
);

check(
  'audioService exports hasSceneAudio',
  audioSvcSrc.includes('export function hasSceneAudio'),
  'hasSceneAudio not exported from audioService.js',
);

check(
  'audioService exports storyHasAllRequiredAudio',
  audioSvcSrc.includes('export function storyHasAllRequiredAudio'),
  'storyHasAllRequiredAudio not exported from audioService.js',
);

check(
  'audioService exports getAudioLaunchReadiness',
  audioSvcSrc.includes('export function getAudioLaunchReadiness'),
  'getAudioLaunchReadiness not exported from audioService.js',
);

check(
  'AudioPlayer uses useAudioPlayer from expo-audio (real playback)',
  audioPlayerSrc.includes('useAudioPlayer') && audioPlayerSrc.includes('expo-audio'),
  'AudioPlayer.js does not use useAudioPlayer from expo-audio',
);

check(
  'AudioPlayer has no DURACAO_SIMULADA (fake timer removed)',
  !audioPlayerSrc.includes('DURACAO_SIMULADA'),
  'DURACAO_SIMULADA still present in AudioPlayer.js',
);

check(
  'AudioPlayer has no setInterval (fake progress removed)',
  !audioPlayerSrc.includes('setInterval'),
  'setInterval still present in AudioPlayer.js',
);

check(
  'AudioPlayer uses audioAsset prop (not audioUrl)',
  audioPlayerSrc.includes('audioAsset') && !audioPlayerSrc.includes('audioUrl'),
  'AudioPlayer.js still uses audioUrl instead of audioAsset',
);

check(
  'NarrationScreen imports hasSceneAudio from audioService',
  narrationSrc.includes('hasSceneAudio') && narrationSrc.includes('audioService'),
  'NarrationScreen.js missing hasSceneAudio import from audioService',
);

check(
  'NarrationScreen does not reference cena.audio',
  !narrationSrc.includes('cena.audio'),
  'NarrationScreen.js still references cena.audio instead of audioService',
);

check(
  'NarrationScreen passes audioAsset to AudioPlayer',
  narrationSrc.includes('audioAsset'),
  'NarrationScreen.js does not pass audioAsset prop to AudioPlayer',
);

check(
  'StoryBookHero uses storyHasAllRequiredAudio (not cena.audio)',
  heroSrc.includes('storyHasAllRequiredAudio') && !heroSrc.includes('cena.audio'),
  'StoryBookHero.js still uses cena.audio instead of storyHasAllRequiredAudio',
);

check(
  'audio-audit.js script exists',
  srcExists('scripts/audio-audit.js'),
  'scripts/audio-audit.js not found',
);

check(
  'package.json has audio:audit script',
  readSrc('package.json').includes('"audio:audit"'),
  'audio:audit script missing from package.json',
);

check(
  'package.json has audio:audit:strict script',
  readSrc('package.json').includes('"audio:audit:strict"'),
  'audio:audit:strict script missing from package.json',
);

// ── [76–85] Sprint 4.1 — expo-audio migration ────────────────────────────────
console.log('\n── Sprint 4.1: expo-audio migration ──');

const pkgJsonSrc = readSrc('package.json');
const pkgParsed = JSON.parse(pkgJsonSrc);
const appJsonSrc = readSrc('app.json');
const appJsonParsed = JSON.parse(appJsonSrc);
const soundBtnSrc = readSrc('src/components/SoundButton.js');

check(
  'expo-audio present in package.json dependencies',
  'expo-audio' in (pkgParsed.dependencies || {}),
  'expo-audio not found in package.json dependencies',
);

check(
  'expo-av NOT present in package.json (removed)',
  !('expo-av' in (pkgParsed.dependencies || {})),
  'expo-av still listed in package.json — must be removed',
);

const expoAvImports = allFiles.filter(f => {
  const src = fs.readFileSync(f, 'utf8');
  return src.split('\n').some(l =>
    l.includes('expo-av') &&
    !l.trim().startsWith('//') &&
    !l.trim().startsWith('*'),
  );
});
check(
  'No imports from expo-av anywhere in src/',
  expoAvImports.length === 0,
  expoAvImports.map(f => path.relative(root, f)).join(', '),
);

check(
  'AudioPlayer imports useAudioPlayer from expo-audio',
  audioPlayerSrc.includes("from 'expo-audio'") &&
    audioPlayerSrc.includes('useAudioPlayer'),
  'AudioPlayer.js missing useAudioPlayer import from expo-audio',
);

check(
  'AudioPlayer imports useAudioPlayerStatus from expo-audio',
  audioPlayerSrc.includes('useAudioPlayerStatus'),
  'AudioPlayer.js missing useAudioPlayerStatus from expo-audio',
);

check(
  'AudioPlayer has inner/outer guard pattern (AudioPlayerInner)',
  audioPlayerSrc.includes('AudioPlayerInner'),
  'AudioPlayer.js missing inner/outer hook-safety pattern',
);

check(
  'SoundButton imports createAudioPlayer from expo-audio',
  soundBtnSrc.includes('createAudioPlayer') &&
    soundBtnSrc.includes('expo-audio'),
  'SoundButton.js missing createAudioPlayer from expo-audio',
);

check(
  'SoundButton has no expo-av references',
  !soundBtnSrc.includes('expo-av') && !soundBtnSrc.includes('Audio.Sound'),
  'SoundButton.js still references expo-av or Audio.Sound',
);

const expoAudioPlugin = appJsonParsed.expo?.plugins?.find(
  p => (Array.isArray(p) && p[0] === 'expo-audio') || p === 'expo-audio',
);
check(
  'app.json expo-audio plugin is configured as array (not bare string)',
  Array.isArray(expoAudioPlugin),
  'app.json has expo-audio as bare string — must be ["expo-audio", {...}] to disable recording permissions',
);

const expoAudioPluginOpts = Array.isArray(expoAudioPlugin) ? expoAudioPlugin[1] : null;
check(
  'app.json expo-audio plugin has recordAudioAndroid: false',
  expoAudioPluginOpts?.recordAudioAndroid === false,
  'app.json expo-audio plugin missing recordAudioAndroid: false',
);

// ── [86–100] Sprint 5 — Livrinho da Fé estrutural ────────────────────────────
console.log('\n── Sprint 5: StoryBookScreen ──');

const storyBookSrc = readSrc('src/screens/StoryBookScreen.js');
const appNavSrc    = readSrc('src/navigation/AppNavigator.js');
const postHubSrc2  = readSrc('src/screens/PostStoryHubScreen.js');
const congratsSrc  = readSrc('src/screens/CongratsScreen.js');

check(
  'StoryBookScreen.js exists',
  srcExists('src/screens/StoryBookScreen.js'),
  'src/screens/StoryBookScreen.js not found',
);

check(
  'StoryBookScreen has canOpenStoryFullExperience guard',
  storyBookSrc.includes('canOpenStoryFullExperience'),
  'StoryBookScreen missing access guard canOpenStoryFullExperience',
);

check(
  'StoryBookScreen imports markStoryBookOpened from postStoryStorage',
  storyBookSrc.includes('markStoryBookOpened') && storyBookSrc.includes('postStoryStorage'),
  'StoryBookScreen missing markStoryBookOpened import from postStoryStorage',
);

check(
  'StoryBookScreen calls markStoryBookOpened (marks as opened)',
  storyBookSrc.includes('markStoryBookOpened(story.id)'),
  'StoryBookScreen does not call markStoryBookOpened — bookOpened will never clear',
);

check(
  'StoryBookScreen has notCompleted state (honest gate)',
  storyBookSrc.includes("'notCompleted'") || storyBookSrc.includes('"notCompleted"'),
  'StoryBookScreen missing notCompleted state',
);

check(
  'StoryBookScreen has all 9 required states (Sprint 5.1 playback)',
  ["'loading'", "'intro'", "'playing'", "'ended'", "'notCompleted'", "'locked'", "'invalidStory'", "'emptyScenes'", "'error'"]
    .every(s => storyBookSrc.includes(s)),
  'One or more required states missing from StoryBookScreen (must include intro/playing/ended, not ready)',
);

check(
  'StoryBookScreen uses getSavedDrawing from drawingStorage',
  storyBookSrc.includes('getSavedDrawing') && storyBookSrc.includes('drawingStorage'),
  'StoryBookScreen missing getSavedDrawing from drawingStorage',
);

check(
  'StoryBookScreen uses getColoringImage from coloringImages',
  storyBookSrc.includes('getColoringImage') && storyBookSrc.includes('coloringImages'),
  'StoryBookScreen missing getColoringImage from coloringImages',
);

check(
  'StoryBookScreen uses hasSceneAudio from audioService',
  storyBookSrc.includes('hasSceneAudio') && storyBookSrc.includes('audioService'),
  'StoryBookScreen missing hasSceneAudio from audioService',
);

check(
  'StoryBookScreen uses AudioPlayer component',
  storyBookSrc.includes('AudioPlayer'),
  'StoryBookScreen missing AudioPlayer component usage',
);

console.log('\n── Sprint 5: PostStoryHubScreen bookOpened fix ──');

check(
  'PostStoryHubScreen navigates to StoryBook (not modal)',
  postHubSrc2.includes("navigate('StoryBook'"),
  "PostStoryHubScreen does not navigate to 'StoryBook'",
);

check(
  'PostStoryHubScreen has no livrinhoModal (coming-soon modal removed)',
  !postHubSrc2.includes('livrinhoModal'),
  'livrinhoModal still present in PostStoryHubScreen — coming-soon modal not removed',
);

check(
  'PostStoryHubScreen imports isStoryBookOpened from postStoryStorage',
  postHubSrc2.includes('isStoryBookOpened') && postHubSrc2.includes('postStoryStorage'),
  'PostStoryHubScreen missing isStoryBookOpened import — bookOpened not persisted',
);

check(
  'PostStoryHubScreen loads bookOpened in useFocusEffect',
  postHubSrc2.includes('isStoryBookOpened(story.id)'),
  'PostStoryHubScreen does not load bookOpened from storage in useFocusEffect',
);

console.log('\n── Sprint 5: AppNavigator & audioService ──');

check(
  'AppNavigator imports StoryBookScreen',
  appNavSrc.includes('StoryBookScreen'),
  'AppNavigator.js does not import StoryBookScreen',
);

check(
  'AppNavigator has StoryBook route registered',
  appNavSrc.includes("name=\"StoryBook\""),
  'AppNavigator missing StoryBook Stack.Screen route',
);

check(
  'audioService exports getStoryAudioSequence (for Livrinho)',
  readSrc('src/services/audioService.js').includes('export function getStoryAudioSequence'),
  'getStoryAudioSequence not exported from audioService.js',
);

// ── [103–115] Sprint 5.1 — StoryBook playback redesign ───────────────────────
console.log('\n── Sprint 5.1: StoryBook playback ──');

const storyDetailSrc = readSrc('src/screens/StoryDetailScreen.js');
const reflSrc51      = readSrc('src/screens/ReflectionScreen.js');
const lumiMomSrc51   = readSrc('src/screens/LumiMomentScreen.js');
const congratsSrc51  = readSrc('src/screens/CongratsScreen.js');
const pcSrc51        = readSrc('src/data/planConfig.js');

check(
  'StoryBookScreen has intro state (playback redesign)',
  storyBookSrc.includes("'intro'"),
  "StoryBookScreen missing 'intro' state — still using old scrollable-list version",
);

check(
  'StoryBookScreen has playing state (scene-by-scene)',
  storyBookSrc.includes("'playing'"),
  "StoryBookScreen missing 'playing' state",
);

check(
  'StoryBookScreen has ended state (completion screen)',
  storyBookSrc.includes("'ended'"),
  "StoryBookScreen missing 'ended' state",
);

check(
  'StoryBookScreen marks bookOpened inside handleStartLivrinho (not on data load)',
  storyBookSrc.includes('handleStartLivrinho') && storyBookSrc.includes('markStoryBookOpened(story.id)'),
  'StoryBookScreen should mark bookOpened inside handleStartLivrinho, not on data load',
);

check(
  'StoryBookScreen has no setInterval (no fake narration timer)',
  !storyBookSrc.includes('setInterval'),
  'setInterval found in StoryBookScreen — remove fake timer',
);

check(
  'StoryBookScreen tracks current slide index',
  storyBookSrc.includes('currentSlideIndex'),
  'StoryBookScreen does not track currentSlideIndex',
);

check(
  'StoryBookScreen passes onFinished to AudioPlayer (auto-advance ready)',
  storyBookSrc.includes('onFinished'),
  'StoryBookScreen does not pass onFinished to AudioPlayer — auto-advance not wired',
);

check(
  'StoryDetailScreen navigates to StoryBook for Livrinho card',
  storyDetailSrc.includes("navigate('StoryBook'"),
  "StoryDetailScreen Livrinho PostStoryCard still navigates to PostStoryHub instead of StoryBook",
);

check(
  'CongratsScreen navigates to Quiz directly (not PostStoryHub)',
  congratsSrc51.includes("navigate('Quiz'"),
  "CongratsScreen does not navigate directly to Quiz",
);

check(
  'CongratsScreen navigates to Reflection directly (not PostStoryHub)',
  congratsSrc51.includes("navigate('Reflection'"),
  "CongratsScreen does not navigate directly to Reflection",
);

check(
  'LumiMomentScreen has back button in main view (not only in premium lock)',
  (lumiMomSrc51.match(/goBack\(\)/g) || []).length >= 2,
  'LumiMomentScreen missing back button in main view header',
);

check(
  'ReflectionScreen has back button in main header (not only in premium lock)',
  (reflSrc51.match(/goBack\(\)/g) || []).length >= 2,
  'ReflectionScreen missing back button in main header',
);

check(
  'planConfig.js comingSoonItems has no audio narration item',
  !pcSrc51.includes('Narração especial com áudio'),
  'planConfig.js still lists "Narração especial com áudio" in comingSoonItems — must be removed',
);

// ── [116–128] Sprint 5.2 — Livrinho drawing fix & playback polish ────────────
console.log('\n── Sprint 5.2: Livrinho drawing & playback ──');

check(
  'StoryBookScreen has parseDrawingPayload (v1/v2 drawing format)',
  storyBookSrc.includes('parseDrawingPayload'),
  'StoryBookScreen missing parseDrawingPayload — drawings will not render',
);

check(
  'StoryBookScreen extracts .data from JSON payload (not raw JSON as URI)',
  storyBookSrc.includes('p.data') || storyBookSrc.includes('payload.data') || storyBookSrc.includes('p?.data'),
  'StoryBookScreen does not extract .data field from drawing JSON — will pass raw JSON string as Image URI',
);

check(
  'StoryBookScreen uses resizeMode="contain" for paint layer (not cover)',
  storyBookSrc.includes('resizeMode="contain"') || storyBookSrc.includes("resizeMode='contain'"),
  'StoryBookScreen does not use resizeMode contain — images may be cropped',
);

check(
  'StoryBookScreen does NOT use resizeMode="cover" in playback',
  !storyBookSrc.includes('resizeMode="cover"') && !storyBookSrc.includes("resizeMode='cover'"),
  'StoryBookScreen uses resizeMode cover — scenes will be cropped on tall phones',
);

check(
  'StoryBookScreen has isPaused state (play/pause toggle)',
  storyBookSrc.includes('isPaused'),
  'StoryBookScreen missing isPaused state — no play/pause control',
);

check(
  'StoryBookScreen has handleTogglePause (play/pause handler)',
  storyBookSrc.includes('handleTogglePause') || storyBookSrc.includes('TogglePause'),
  'StoryBookScreen missing play/pause toggle handler',
);

check(
  'StoryBookScreen intro uses ScrollView (button accessible on tablets)',
  storyBookSrc.includes('ScrollView'),
  'StoryBookScreen intro does not use ScrollView — button may be hidden behind tablet nav',
);

check(
  'StoryBookScreen has no setInterval (no fake timer)',
  !storyBookSrc.includes('setInterval'),
  'setInterval found in StoryBookScreen — remove fake auto-advance timer',
);

check(
  'StoryBookScreen has no text about future audio narration',
  !storyBookSrc.includes('narração') && !storyBookSrc.includes('futura') &&
  !storyBookSrc.includes('áudio em breve') && !storyBookSrc.includes('som em breve') &&
  !storyBookSrc.includes('som será'),
  'StoryBookScreen contains text about future audio narration — must be removed',
);

check(
  'StoryBookScreen has a mode-aware "Abrir" button in intro',
  storyBookSrc.includes('handleStartLivrinho') && storyBookSrc.includes('Abrir livro mágico misto'),
  'StoryBookScreen missing the intro start button (mode-aware labels)',
);

check(
  'CongratsScreen Livrinho card has no primary prop (all cards same visual)',
  !(/Meu Livrinho da Fé[\s\S]{0,200}primary\b(?!=)/.test(congratsSrc)),
  'CongratsScreen Livrinho RewardCard still has primary prop — visually different from Quiz/Lumi cards',
);

check(
  'audioManifest: no hardcoded status: "ready" literal (structural — uses AUDIO_STATUS constant)',
  !/status:\s*['"]ready['"]/.test(manifestSrc),
  'audioManifest has a status: "ready" literal — use _readyEntries + AUDIO_STATUS.READY instead',
);

// ── [128–145] Sprint 5.3 — Livrinho composição visual definitiva ──────────────
console.log('\n── Sprint 5.3: Livrinho visual composition ──');

check(
  'StoryBookScreen has resolveStoryBookVisual (visual resolution helper)',
  storyBookSrc.includes('resolveStoryBookVisual'),
  'StoryBookScreen missing resolveStoryBookVisual — rendering logic is not centralized',
);

check(
  'StoryBookScreen has computeLineartStyle (pixel-aligned lineart positioning)',
  storyBookSrc.includes('computeLineartStyle'),
  'StoryBookScreen missing computeLineartStyle — lineart overlay will misalign with paint layer',
);

check(
  'resolveStoryBookVisual returns paintWithLineart type',
  storyBookSrc.includes("'paintWithLineart'") || storyBookSrc.includes('"paintWithLineart"'),
  'StoryBookScreen missing paintWithLineart type — never correctly overlays paint + lineart',
);

check(
  'resolveStoryBookVisual returns paintOnly type (v1/no-lineart fallback)',
  storyBookSrc.includes("'paintOnly'") || storyBookSrc.includes('"paintOnly"'),
  'StoryBookScreen missing paintOnly type — no fallback when lineart cannot be aligned',
);

check(
  'resolveStoryBookVisual returns official type (Sprint 4.1 hybrid)',
  storyBookSrc.includes("'official'") || storyBookSrc.includes('"official"'),
  'StoryBookScreen missing official type — Livrinho no longer uses official illustration as priority B',
);

check(
  'resolveStoryBookVisual returns fallback type',
  storyBookSrc.includes("'fallback'") || storyBookSrc.includes('"fallback"'),
  'StoryBookScreen missing fallback type — no display when neither paint nor lineart exists',
);

check(
  'StoryBookScreen uses onLayout to measure image container',
  storyBookSrc.includes('onLayout') && storyBookSrc.includes('imgContainerSize'),
  'StoryBookScreen missing onLayout measurement — computeLineartStyle has no container dimensions',
);

check(
  'StoryBookScreen lineart uses computed absolute style result (not absoluteFill)',
  storyBookSrc.includes('lineartAbsStyle') && storyBookSrc.includes('computeLineartStyle'),
  'StoryBookScreen missing lineartAbsStyle/computeLineartStyle — lineart alignment uses wrong approach',
);

check(
  'StoryBookScreen lineart uses resizeMode stretch (positioned box matches natural ratio)',
  storyBookSrc.includes('resizeMode="stretch"') || storyBookSrc.includes("resizeMode='stretch'"),
  'StoryBookScreen lineart overlay not using resizeMode stretch — may distort at positioned box',
);

check(
  'StoryBookScreen header has back and home buttons in intro (quiz-style)',
  (storyBookSrc.match(/navigation\.goBack\(\)/g) || []).length >= 2,
  'StoryBookScreen intro header missing back/home navigation buttons',
);

check(
  'StoryBookScreen playing uses useSafeAreaInsets for bottom padding',
  storyBookSrc.includes('insets.bottom'),
  'StoryBookScreen missing insets.bottom — controls may overlap system navigation on tablets',
);

check(
  'StoryBookScreen playing top bar navigates goBack (exits livrinho)',
  storyBookSrc.includes('navigation.goBack()'),
  'StoryBookScreen playing has no goBack call — user cannot exit playback',
);

check(
  'StoryBookScreen has no text about future audio narration',
  !storyBookSrc.includes('narração') && !storyBookSrc.includes('futura') &&
  !storyBookSrc.includes('áudio em breve') && !storyBookSrc.includes('som em breve') &&
  !storyBookSrc.includes('som será'),
  'StoryBookScreen contains text about future audio narration — must be removed',
);

check(
  'StoryBookScreen has no setInterval (no fake auto-advance)',
  !storyBookSrc.includes('setInterval'),
  'setInterval found in StoryBookScreen — remove fake timer',
);

check(
  'audioManifest: no hardcoded status: "ready" literal (structural — uses AUDIO_STATUS constant)',
  !/status:\s*['"]ready['"]/.test(manifestSrc),
  'audioManifest has a status: "ready" literal — use _readyEntries + AUDIO_STATUS.READY instead',
);

// ── [143–154] Sprint 5.4 — Livrinho auto-advance architecture ────────────────
console.log('\n── Sprint 5.4: Livrinho auto-advance readiness ──');

check(
  'StoryBookScreen has advanceToNextScene (core advance logic)',
  storyBookSrc.includes('advanceToNextScene'),
  'StoryBookScreen missing advanceToNextScene — auto-advance and manual skip share no common function',
);

check(
  'StoryBookScreen has onSceneAudioComplete (audio-end callback)',
  storyBookSrc.includes('onSceneAudioComplete'),
  'StoryBookScreen missing onSceneAudioComplete — AudioPlayer has no hook to trigger scene advance',
);

check(
  'onSceneAudioComplete calls advanceToNextScene (auto-advance chain wired)',
  storyBookSrc.includes('onSceneAudioComplete') && storyBookSrc.includes('advanceToNextScene'),
  'Both onSceneAudioComplete and advanceToNextScene must be present for the auto-advance chain to work',
);

check(
  'AudioPlayer accepts paused prop (external play/pause control)',
  audioPlayerSrc.includes('paused') && audioPlayerSrc.includes('AudioPlayerInner'),
  'AudioPlayer.js does not accept paused prop — StoryBookScreen cannot control playback externally',
);

check(
  'AudioPlayer has finishedCalledRef guard (no double scene-advance)',
  audioPlayerSrc.includes('finishedCalledRef'),
  'AudioPlayer.js missing finishedCalledRef guard — onFinished could fire twice for the same audio end',
);

check(
  'AudioPlayer uses didJustFinish for end detection (not timer)',
  audioPlayerSrc.includes('didJustFinish') && !audioPlayerSrc.includes('setTimeout'),
  'AudioPlayer.js must use status.didJustFinish from expo-audio, not a timer, to detect end of audio',
);

check(
  'StoryBookScreen passes paused={isPaused} to AudioPlayer',
  storyBookSrc.includes('paused={isPaused}'),
  'StoryBookScreen does not pass paused prop to AudioPlayer — external pause/play is not wired',
);

check(
  'StoryBookScreen resets AudioPlayer per slide (key changes each slide)',
  storyBookSrc.includes('key={slideKey}'),
  'StoryBookScreen missing per-slide key on AudioPlayer — stale audio state may leak between slides',
);

check(
  'StoryBookScreen has getStoryBookPlaybackReadiness (autoplay readiness helper)',
  storyBookSrc.includes('getStoryBookPlaybackReadiness'),
  'StoryBookScreen missing getStoryBookPlaybackReadiness — cannot report when story is ready for auto-play',
);

check(
  'getStoryBookPlaybackReadiness returns canAutoPlay and allScenesHaveAudio',
  storyBookSrc.includes('canAutoPlay') && storyBookSrc.includes('allScenesHaveAudio'),
  'getStoryBookPlaybackReadiness must return canAutoPlay and allScenesHaveAudio fields',
);

check(
  'StoryBookScreen has no setInterval (no fake scene-advance loop)',
  !storyBookSrc.includes('setInterval'),
  'setInterval found in StoryBookScreen — no interval loop should be used to simulate scene advance',
);

check(
  'audioManifest: no hardcoded status: "ready" literal (Sprint 5.4 — structural check)',
  !/status:\s*['"]ready['"]/.test(manifestSrc),
  'audioManifest has a status: "ready" literal — use _readyEntries + AUDIO_STATUS.READY instead',
);

// ── [155–182] Sprint 6 — ProgressContext, centralized progress ────────────────
console.log('\n── Sprint 6: ProgressContext ──');

const progressCtxPath = 'src/context/ProgressContext.js';
const progressCtxSrc = srcExists(progressCtxPath) ? readSrc(progressCtxPath) : '';

check(
  'ProgressContext.js file exists',
  srcExists(progressCtxPath),
  'src/context/ProgressContext.js missing — ProgressContext not created',
);

check(
  'ProgressContext exports ProgressProvider',
  progressCtxSrc.includes('export function ProgressProvider'),
  'ProgressContext.js missing export function ProgressProvider',
);

check(
  'ProgressContext exports useProgressContext',
  progressCtxSrc.includes('export function useProgressContext'),
  'ProgressContext.js missing export function useProgressContext',
);

check(
  'ProgressContext has progressByStory state',
  progressCtxSrc.includes('progressByStory'),
  'ProgressContext.js missing progressByStory — centralized progress map not exposed',
);

check(
  'ProgressContext has progressSummary',
  progressCtxSrc.includes('progressSummary'),
  'ProgressContext.js missing progressSummary — aggregate stats not computed',
);

check(
  'ProgressContext uses multiGet for batch loading',
  progressCtxSrc.includes('multiGet'),
  'ProgressContext.js does not use AsyncStorage.multiGet — misses the performance benefit',
);

check(
  'ProgressContext has loadAllProgress function',
  progressCtxSrc.includes('loadAllProgress'),
  'ProgressContext.js missing loadAllProgress — async storage batch read not centralized',
);

check(
  'ProgressContext has computeSummary function',
  progressCtxSrc.includes('computeSummary'),
  'ProgressContext.js missing computeSummary — aggregate computation not separated',
);

check(
  'ProgressContext has refreshProgress',
  progressCtxSrc.includes('refreshProgress'),
  'ProgressContext.js missing refreshProgress — external refresh not possible',
);

check(
  'ProgressContext has markProgressDirty (alias for refreshProgress)',
  progressCtxSrc.includes('markProgressDirty'),
  'ProgressContext.js missing markProgressDirty — write-side screens cannot invalidate cache',
);

check(
  'ProgressContext exposes isLoadingProgress',
  progressCtxSrc.includes('isLoadingProgress'),
  'ProgressContext.js missing isLoadingProgress — consumers cannot show loading state',
);

check(
  'ProgressContext exposes isStoryCompleted',
  progressCtxSrc.includes('isStoryCompleted'),
  'ProgressContext.js missing isStoryCompleted helper',
);

check(
  'ProgressContext exposes getCompletedScenesCount',
  progressCtxSrc.includes('getCompletedScenesCount'),
  'ProgressContext.js missing getCompletedScenesCount helper',
);

check(
  'ProgressContext exposes getPostStoryStatusForStory',
  progressCtxSrc.includes('getPostStoryStatusForStory'),
  'ProgressContext.js missing getPostStoryStatusForStory — post-story status not in context',
);

check(
  'ProgressContext exposes hasPendingRewardsForStory',
  progressCtxSrc.includes('hasPendingRewardsForStory'),
  'ProgressContext.js missing hasPendingRewardsForStory helper',
);

check(
  'ProgressContext has postStoryStatusByStory (pre-loaded post-story data)',
  progressCtxSrc.includes('postStoryStatusByStory'),
  'ProgressContext.js missing postStoryStatusByStory — post-story data not pre-loaded',
);

const appJsSrc = readSrc('App.js');

check(
  'App.js imports ProgressProvider',
  appJsSrc.includes('ProgressProvider'),
  'App.js does not import ProgressProvider — context is not mounted at app root',
);

check(
  'App.js wraps AppNavigator in ProgressProvider',
  appJsSrc.includes('<ProgressProvider>'),
  'App.js missing <ProgressProvider> wrapper around AppNavigator',
);

const homeScreenSrc = readSrc('src/screens/HomeScreen.js');

check(
  'HomeScreen no longer has 20 useProgress calls',
  !(homeScreenSrc.includes("useProgress('noah')") || homeScreenSrc.includes('useProgress("noah")')),
  'HomeScreen still has individual useProgress calls — migration to ProgressContext incomplete',
);

check(
  'HomeScreen imports useProgressContext',
  homeScreenSrc.includes('useProgressContext'),
  'HomeScreen does not import useProgressContext — still using old pattern',
);

check(
  'AppNavigator no longer has useStarsTotal hook',
  !appNavSrc.includes('useStarsTotal'),
  'AppNavigator still has useStarsTotal — 20 useProgress calls not removed',
);

check(
  'AppNavigator imports useProgressContext',
  appNavSrc.includes('useProgressContext'),
  'AppNavigator does not import useProgressContext',
);

const profileScreenSrc = readSrc('src/screens/ProfileScreen.js');

check(
  'ProfileScreen imports useProgressContext (not 20 useProgress calls)',
  profileScreenSrc.includes('useProgressContext'),
  'ProfileScreen does not import useProgressContext — migration incomplete',
);

check(
  'ProfileScreen has no individual useProgress calls for all-story summary',
  !(profileScreenSrc.includes("useProgress('noah')") || profileScreenSrc.includes('useProgress("noah")')),
  'ProfileScreen still has individual useProgress calls — migration incomplete',
);

const trophiesScreenSrc = readSrc('src/screens/TrophiesScreen.js');

check(
  'TrophiesScreen imports useProgressContext',
  trophiesScreenSrc.includes('useProgressContext'),
  'TrophiesScreen does not import useProgressContext',
);

check(
  'TrophiesScreen has no individual useProgress calls for all stories',
  !(trophiesScreenSrc.includes("useProgress('noah')") || trophiesScreenSrc.includes('useProgress("noah")')),
  'TrophiesScreen still has individual useProgress calls — migration incomplete',
);

const storiesScreenSrc = readSrc('src/screens/StoriesScreen.js');

check(
  'StoriesScreen imports useProgressContext',
  storiesScreenSrc.includes('useProgressContext'),
  'StoriesScreen does not import useProgressContext',
);

check(
  'StoriesScreen has no individual useProgress calls',
  !(storiesScreenSrc.includes("useProgress('noah')") || storiesScreenSrc.includes('useProgress("noah")')),
  'StoriesScreen still has individual useProgress calls — migration incomplete',
);

const coloringScreenSrc = readSrc('src/screens/ColoringScreen.js');

check(
  'ColoringScreen never completes a scene (decoupled from progress)',
  !coloringScreenSrc.includes('salvarCena') && !coloringScreenSrc.includes('UnlockCelebration'),
  'ColoringScreen still calls salvarCena/UnlockCelebration — coloring must only save art, never complete a scene or give a star',
);

const narrationCompletionSrc = readSrc('src/screens/NarrationScreen.js');

check(
  'NarrationScreen owns scene completion (Concluir cena + salvarCena + celebration)',
  narrationCompletionSrc.includes('Concluir cena') &&
  narrationCompletionSrc.includes('salvarCena') &&
  narrationCompletionSrc.includes('UnlockCelebration'),
  'NarrationScreen must be the only place a scene is completed (Concluir cena ⭐ → salvarCena → UnlockCelebration)',
);

check(
  'NarrationScreen has custom Portuguese header (Voltar / Início), no native route names',
  narrationCompletionSrc.includes('Voltar') && narrationCompletionSrc.includes('Início') &&
  narrationCompletionSrc.includes('Cena anterior') &&
  narrationCompletionSrc.includes('Pintar no Ateliê'),
  'NarrationScreen missing custom header / Cena anterior / Pintar no Ateliê labels',
);

const appNavHeaderSrc = readSrc('src/navigation/AppNavigator.js');

check(
  'AppNavigator uses custom BackBtn + minimal back display (no iOS route-name leak)',
  appNavHeaderSrc.includes('function BackBtn') &&
  appNavHeaderSrc.includes("headerBackButtonDisplayMode: 'minimal'") &&
  appNavHeaderSrc.includes('headerLeft: () => <BackBtn'),
  'AppNavigator missing BackBtn / headerBackButtonDisplayMode minimal — native headers may leak Home/Back on iOS',
);

const quizScreenSrc = readSrc('src/screens/QuizScreen.js');

check(
  'QuizScreen calls refreshProgress after markQuizDone',
  quizScreenSrc.includes('refreshProgress') && quizScreenSrc.includes('markQuizDone'),
  'QuizScreen missing refreshProgress after markQuizDone — context stays stale after quiz completion',
);

const reflectionScreenSrc = readSrc('src/screens/ReflectionScreen.js');

check(
  'ReflectionScreen calls refreshProgress after saveReflection',
  reflectionScreenSrc.includes('refreshProgress') && reflectionScreenSrc.includes('saveReflection'),
  'ReflectionScreen missing refreshProgress after saveReflection — context stays stale after reflection save',
);

check(
  'StoryBookScreen calls refreshProgress after markStoryBookOpened',
  storyBookSrc.includes('refreshProgress') && storyBookSrc.includes('markStoryBookOpened'),
  'StoryBookScreen missing refreshProgress after markStoryBookOpened — context stays stale',
);

// ── [187–224] Sprint 7 — Fonte Única de Estrelas, Conquistas e Recompensas ───
console.log('\n── Sprint 7: Stars, achievements, rewards ──');

const rewardSvcPath = 'src/services/rewardService.js';
const rewardSvcSrc = srcExists(rewardSvcPath) ? readSrc(rewardSvcPath) : '';
const achieveSvcSrc = readSrc('src/services/achievementService.js');
const trophiesSrc7  = readSrc('src/screens/TrophiesScreen.js');
const homeSrc7      = readSrc('src/screens/HomeScreen.js');
const appNavSrc7    = readSrc('src/navigation/AppNavigator.js');
const profileSrc7   = readSrc('src/screens/ProfileScreen.js');
const parentSrc7    = readSrc('src/screens/ParentAreaScreen.js');
const progressCtx7  = readSrc('src/context/ProgressContext.js');
const quizSrc7      = readSrc('src/screens/QuizScreen.js');
const reflSrc7      = readSrc('src/screens/ReflectionScreen.js');
const achievDataSrc = readSrc('src/data/achievements.js');
const acSvcSrc7     = readSrc('src/services/accessControl.js');

check(
  'rewardService.js exists',
  srcExists(rewardSvcPath),
  'src/services/rewardService.js not found — pure reward calculation service not created',
);

check(
  'rewardService exports getRewardsSummary',
  rewardSvcSrc.includes('export function getRewardsSummary'),
  'rewardService.js missing export function getRewardsSummary',
);

check(
  'rewardService exports getStoryRewardBreakdown',
  rewardSvcSrc.includes('export function getStoryRewardBreakdown'),
  'rewardService.js missing export function getStoryRewardBreakdown',
);

check(
  'rewardService has no AsyncStorage import (pure service)',
  !rewardSvcSrc.includes('AsyncStorage'),
  'rewardService.js imports AsyncStorage — must be a pure calculation service with no storage reads',
);

check(
  'rewardService getRewardsSummary is sync (not async)',
  !rewardSvcSrc.includes('async function getRewardsSummary'),
  'getRewardsSummary is async — it should be a pure sync calculation function',
);

check(
  'ProgressContext imports getRewardsSummary from rewardService',
  progressCtx7.includes('getRewardsSummary') && progressCtx7.includes('rewardService'),
  'ProgressContext.js does not import getRewardsSummary from rewardService',
);

check(
  'ProgressContext computeSummary uses getRewardsSummary',
  progressCtx7.includes('getRewardsSummary('),
  'ProgressContext.js computeSummary does not call getRewardsSummary',
);

check(
  'progressSummary has totalStars field',
  progressCtx7.includes('totalStars:'),
  'ProgressContext.js missing totalStars in progressSummary — star total not exposed',
);

check(
  'progressSummary has sceneStars field',
  progressCtx7.includes('sceneStars:'),
  'ProgressContext.js missing sceneStars in progressSummary',
);

check(
  'progressSummary has specialStars field',
  progressCtx7.includes('specialStars:'),
  'ProgressContext.js missing specialStars in progressSummary — bonus stars (quiz/lumi/livrinho) not counted',
);

check(
  'progressSummary has maxTotalStars field',
  progressCtx7.includes('maxTotalStars:'),
  'ProgressContext.js missing maxTotalStars in progressSummary — star denominator not exposed',
);

check(
  'achievementService buildCtx accepts options param',
  achieveSvcSrc.includes('buildCtx(progressMap, storiesList, options'),
  'achievementService.js buildCtx does not accept options parameter',
);

check(
  'achievementService has fast path using options.postStoryStatusByStory',
  achieveSvcSrc.includes('options.postStoryStatusByStory'),
  'achievementService.js missing fast path — still always reads AsyncStorage for quiz/reflection data',
);

check(
  'achievementService preserves legacy fallback (isQuizDone import kept)',
  achieveSvcSrc.includes('isQuizDone'),
  'achievementService.js removed isQuizDone import — legacy fallback broken',
);

check(
  'TrophiesScreen destructures postStoryStatusByStory from useProgressContext',
  trophiesSrc7.includes('postStoryStatusByStory') && trophiesSrc7.includes('useProgressContext'),
  'TrophiesScreen does not destructure postStoryStatusByStory from useProgressContext',
);

check(
  'TrophiesScreen passes postStoryStatusByStory to buildCtx',
  trophiesSrc7.includes('buildCtx(progressByStory, stories, { postStoryStatusByStory })'),
  'TrophiesScreen does not pass postStoryStatusByStory to buildCtx — fast path not used',
);

check(
  'TrophiesScreen dependency array includes postStoryStatusByStory',
  trophiesSrc7.includes('[progressByStory, postStoryStatusByStory]'),
  'TrophiesScreen useEffect dependency array missing postStoryStatusByStory',
);

check(
  'HomeScreen uses progressSummary.totalStars (not .completedScenes for star display)',
  homeSrc7.includes('progressSummary?.totalStars') || homeSrc7.includes("progressSummary?.['totalStars']"),
  'HomeScreen still reads progressSummary.completedScenes for star display instead of totalStars',
);

check(
  'HomeScreen uses progressSummary.maxTotalStars (not .totalScenes for max stars)',
  homeSrc7.includes('progressSummary?.maxTotalStars') || homeSrc7.includes("progressSummary?.['maxTotalStars']"),
  'HomeScreen still reads progressSummary.totalScenes for max stars instead of maxTotalStars',
);

check(
  'HomeScreen has no totalXP variable (renamed to totalStars)',
  !homeSrc7.includes('totalXP'),
  'HomeScreen still has totalXP variable — rename to totalStars',
);

check(
  'HomeScreen has no xpBarOuter style (renamed to progressBarOuter)',
  !homeSrc7.includes('xpBarOuter'),
  'HomeScreen still has xpBarOuter style — rename to progressBarOuter',
);

check(
  'AppNavigator uses progressSummary.totalStars',
  appNavSrc7.includes('progressSummary?.totalStars'),
  'AppNavigator does not use progressSummary.totalStars — tablet sidebar star count is stale',
);

check(
  'AppNavigator uses progressSummary.maxTotalStars',
  appNavSrc7.includes('progressSummary?.maxTotalStars'),
  'AppNavigator does not use progressSummary.maxTotalStars',
);

check(
  'ProfileScreen uses progressSummary.totalStars',
  profileSrc7.includes('progressSummary?.totalStars'),
  'ProfileScreen does not use progressSummary.totalStars — star count may be wrong',
);

check(
  'ProfileScreen uses progressSummary.maxTotalStars',
  profileSrc7.includes('progressSummary?.maxTotalStars'),
  'ProfileScreen does not use progressSummary.maxTotalStars',
);

check(
  'ProfileScreen label says "estrelas alcançadas" (not "cenas concluídas")',
  profileSrc7.includes('estrelas alcançadas'),
  'ProfileScreen progress bar label still says "cenas concluídas" instead of "estrelas alcançadas"',
);

check(
  'ParentAreaScreen imports useProgressContext',
  parentSrc7.includes('useProgressContext'),
  'ParentAreaScreen does not import useProgressContext — still reading stars directly from AsyncStorage',
);

check(
  'ParentAreaScreen has no getBonusStars direct read',
  !parentSrc7.includes('getBonusStars'),
  'ParentAreaScreen still calls getBonusStars directly — must use progressSummary from ProgressContext',
);

check(
  'ParentAreaScreen uses progressSummary for star count',
  parentSrc7.includes('progressSummary'),
  'ParentAreaScreen does not use progressSummary — progress section not connected to ProgressContext',
);

check(
  'ParentAreaScreen shows "Este resumo é salvo apenas neste aparelho."',
  parentSrc7.includes('Este resumo é salvo apenas neste aparelho'),
  'ParentAreaScreen missing local-storage disclaimer for parents',
);

check(
  'ParentAreaScreen description matches official star rule (+1 for quiz, not +2)',
  parentSrc7.includes('+1 estrela') && !parentSrc7.includes('+2 estrelas'),
  'ParentAreaScreen still shows "+2 estrelas" for quiz — must be updated to +1 per official rule',
);

check(
  'QuizScreen has alreadyDone guard (idempotency)',
  quizSrc7.includes('alreadyDone'),
  'QuizScreen missing alreadyDone guard — quiz bonus stars could be duplicated on re-entry',
);

check(
  'ReflectionScreen has alreadyDone guard (idempotency)',
  reflSrc7.includes('alreadyDone'),
  'ReflectionScreen missing alreadyDone guard — reflection bonus stars could be duplicated on re-entry',
);

check(
  'StoryBookScreen has markedRef guard (idempotency)',
  storyBookSrc.includes('markedRef'),
  'StoryBookScreen missing markedRef guard — markStoryBookOpened could be called multiple times',
);

check(
  '"explorador nato" absent from achievements.js',
  !achievDataSrc.includes('explorador nato'),
  'achievements.js contains "explorador nato" — this achievement was not planned and should not exist',
);

check(
  '"pequeno aventureiro" present in achievements.js',
  achievDataSrc.includes('pequeno aventureiro'),
  'achievements.js missing "pequeno aventureiro" achievement',
);

check(
  'ENABLE_LOCAL_PREMIUM_TEST_MODE is false',
  acSvcSrc7.includes('ENABLE_LOCAL_PREMIUM_TEST_MODE = false'),
  'ENABLE_LOCAL_PREMIUM_TEST_MODE is not false — premium gate is disabled in production code',
);

check(
  'audioManifest: no hardcoded status: "ready" literal (Sprint 7 — structural check)',
  !/status:\s*['"]ready['"]/.test(manifestSrc),
  'audioManifest has a status: "ready" literal — use _readyEntries + AUDIO_STATUS.READY instead',
);

// ── [225–235] Sprint 7.1 — "+2 ⭐" text fixes & CongratsScreen rename ────────
console.log('\n── Sprint 7.1: "+2 ⭐" text fixes & CongratsScreen rename ──');

const congrats71 = readSrc('src/screens/CongratsScreen.js');
const postHub71 = readSrc('src/screens/PostStoryHubScreen.js');
const quiz71 = readSrc('src/screens/QuizScreen.js');

check(
  'CongratsScreen has no totalXP variable',
  !congrats71.includes('totalXP'),
  'CongratsScreen still uses "totalXP" — rename to completedScenesCount per official star rule',
);

check(
  'CongratsScreen has no xpPercent variable',
  !congrats71.includes('xpPercent'),
  'CongratsScreen still uses "xpPercent" — rename to scenesPercent',
);

check(
  'CongratsScreen has no animatedXP variable',
  !congrats71.includes('animatedXP'),
  'CongratsScreen still uses "animatedXP" — rename to animatedProgress',
);

check(
  'CongratsScreen has no xpBarOuter style',
  !congrats71.includes('xpBarOuter'),
  'CongratsScreen still has "xpBarOuter" style — rename to starsBarOuter',
);

check(
  'CongratsScreen has no xpBarInner style',
  !congrats71.includes('xpBarInner'),
  'CongratsScreen still has "xpBarInner" style — rename to starsBarInner',
);

check(
  'CongratsScreen quiz desc says "+1 ⭐" (not "+2 ⭐")',
  congrats71.includes('+1 ⭐') && !congrats71.includes('+2 ⭐'),
  'CongratsScreen quiz RewardCard still shows "+2 ⭐" — must be updated to +1 per official star rule',
);

check(
  'PostStoryHubScreen quiz card says "+1 ⭐" (not "+2 ⭐")',
  postHub71.includes('+1 ⭐') && !postHub71.includes('+2 ⭐'),
  'PostStoryHubScreen quiz HubCard cta still shows "+2 ⭐" — must be updated to +1 per official star rule',
);

check(
  'QuizScreen result bonus says "+1 ⭐" (not dynamic STAR_BONUS)',
  quiz71.includes('+1 ⭐ estrelas ganhas') && !quiz71.includes('+{STAR_BONUS}'),
  'QuizScreen result bonus text is still dynamic (+{STAR_BONUS}) — must be hardcoded to +1 per official star rule',
);

check(
  'CongratsScreen uses completedScenesCount for star row',
  congrats71.includes('completedScenesCount'),
  'CongratsScreen missing completedScenesCount variable — star row comparison broken',
);

check(
  'CongratsScreen uses animatedProgress for bar width',
  congrats71.includes('animatedProgress'),
  'CongratsScreen missing animatedProgress — XP bar animation broken',
);

check(
  'CongratsScreen uses scenesPercent for animation output',
  congrats71.includes('scenesPercent'),
  'CongratsScreen missing scenesPercent — animation range not computed from scene completion',
);

// ── [236–272] Sprint 8 — Ateliê e Galeria Local ──────────────────────────────
console.log('\n── Sprint 8: Ateliê e Galeria Local ──');

const atelierStorageSrc  = readSrc('src/services/atelierStorage.js');
const atelierScreenSrc   = readSrc('src/screens/AtelierScreen.js');
const atelierCanvasSrc   = readSrc('src/screens/AtelierCanvasScreen.js');
const atelierGallerySrc  = readSrc('src/screens/AtelierGalleryScreen.js');
const drawingStorageSrc  = readSrc('src/services/drawingStorage.js');
const acSrc8             = readSrc('src/services/accessControl.js');
const appNavSrc8         = readSrc('src/navigation/AppNavigator.js');
const sbSrc8             = readSrc('src/screens/StoryBookScreen.js');
const audioSrc8          = readSrc('src/components/AudioPlayer.js');
const progCtxSrc8        = readSrc('src/context/ProgressContext.js');
const rwdSvcSrc8         = readSrc('src/services/rewardService.js');

// Storage
check(
  'atelierStorage.js exists',
  srcExists('src/services/atelierStorage.js'),
  'atelierStorage.js is missing — Ateliê has no persistence layer',
);

check(
  'atelierStorage exports ATELIER_FREE_SAVE_LIMIT',
  atelierStorageSrc.includes('ATELIER_FREE_SAVE_LIMIT'),
  'atelierStorage missing ATELIER_FREE_SAVE_LIMIT constant',
);

check(
  'atelierStorage ATELIER_FREE_SAVE_LIMIT equals 3',
  atelierStorageSrc.includes('ATELIER_FREE_SAVE_LIMIT = 3'),
  'ATELIER_FREE_SAVE_LIMIT is not 3 — free limit changed without product decision',
);

check(
  'atelierStorage exports listArts',
  atelierStorageSrc.includes('export async function listArts'),
  'atelierStorage missing listArts export',
);

check(
  'atelierStorage exports saveArt',
  atelierStorageSrc.includes('export async function saveArt'),
  'atelierStorage missing saveArt export',
);

check(
  'atelierStorage exports deleteArt',
  atelierStorageSrc.includes('export async function deleteArt'),
  'atelierStorage missing deleteArt export',
);

check(
  'atelierStorage exports getArtCount',
  atelierStorageSrc.includes('export async function getArtCount'),
  'atelierStorage missing getArtCount export',
);

check(
  'drawingStorage is separate from atelierStorage (Livrinho safe)',
  drawingStorageSrc.includes('@ptf_drawing_') && !drawingStorageSrc.includes('ptf_atelier'),
  'drawingStorage and atelierStorage appear to share keys — Livrinho data may be at risk',
);

// Limit enforcement
check(
  'AtelierCanvasScreen checks hasAtelierUnlimitedAccess for save limit',
  atelierCanvasSrc.includes('hasAtelierUnlimitedAccess'),
  'AtelierCanvasScreen does not use hasAtelierUnlimitedAccess — premium limit check may be wrong',
);

check(
  'AtelierCanvasScreen limit check uses ATELIER_FREE_SAVE_LIMIT',
  atelierCanvasSrc.includes('ATELIER_FREE_SAVE_LIMIT'),
  'AtelierCanvasScreen does not reference ATELIER_FREE_SAVE_LIMIT constant',
);

check(
  'AtelierCanvasScreen limit check does not use __DEV__',
  !atelierCanvasSrc.includes('if (__DEV__)') || !atelierCanvasSrc.includes('hasAtelierUnlimited'),
  'AtelierCanvasScreen uses __DEV__ as product gate — forbidden',
);

check(
  'AtelierCanvasScreen limit check does not use ENABLE_LOCAL_PREMIUM_TEST_MODE directly',
  !atelierCanvasSrc.includes('ENABLE_LOCAL_PREMIUM_TEST_MODE'),
  'AtelierCanvasScreen uses ENABLE_LOCAL_PREMIUM_TEST_MODE directly — must go through accessControl',
);

// Limit modal → ParentArea
check(
  'AtelierCanvasScreen limit modal navigates to ParentArea',
  atelierCanvasSrc.includes("navigate('ParentArea')"),
  'AtelierCanvasScreen limit modal does not navigate to ParentArea — premium upsell broken',
);

check(
  'AtelierCanvasScreen limit modal message matches official text',
  atelierCanvasSrc.includes('Para guardar mais criações, peça a um responsável'),
  'AtelierCanvasScreen limit modal text does not match official product copy',
);

check(
  'AtelierCanvasScreen limit modal has "Ver Área dos Pais" button',
  atelierCanvasSrc.includes('Ver Área dos Pais'),
  'AtelierCanvasScreen limit modal missing "Ver Área dos Pais" button text',
);

// Gallery
check(
  'AtelierGalleryScreen exists',
  srcExists('src/screens/AtelierGalleryScreen.js'),
  'AtelierGalleryScreen.js is missing — gallery not reachable',
);

check(
  'AtelierGalleryScreen has correct empty state title (Sprint Beni 3.0)',
  atelierGallerySrc.includes('Seu Ateliê ainda está vazio'),
  'AtelierGalleryScreen empty state title wrong — should say "Seu Ateliê ainda está vazio"',
);

check(
  'AtelierGalleryScreen has correct empty state description (Sprint Beni 3.0)',
  atelierGallerySrc.includes('Crie seu primeiro desenho para guardar aqui'),
  'AtelierGalleryScreen empty state description wrong',
);

check(
  'AtelierGalleryScreen empty state has action to start drawing (Sprint Beni 3.0)',
  atelierGallerySrc.includes('Começar a desenhar'),
  'AtelierGalleryScreen empty state missing action to start drawing',
);

check(
  'AtelierGalleryScreen has viewer modal (full-screen image)',
  atelierGallerySrc.includes('viewingArt') && atelierGallerySrc.includes('Modal'),
  'AtelierGalleryScreen missing full-screen viewer modal',
);

check(
  'AtelierGalleryScreen viewer uses resizeMode contain',
  atelierGallerySrc.includes('resizeMode="contain"'),
  'AtelierGalleryScreen viewer does not use resizeMode="contain" — image may be cropped',
);

check(
  'AtelierGalleryScreen delete uses Alert confirmation',
  atelierGallerySrc.includes('Alert.alert') && atelierGallerySrc.includes('Apagar'),
  'AtelierGalleryScreen delete does not use Alert confirmation — data loss risk',
);

check(
  'AtelierGalleryScreen uses useSafeAreaInsets (iPhone safe)',
  atelierGallerySrc.includes('useSafeAreaInsets'),
  'AtelierGalleryScreen missing useSafeAreaInsets — buttons may overlap system UI on iPhone',
);

// AppNavigator routes
check(
  'AppNavigator registers AtelierCanvas route',
  appNavSrc8.includes('name="AtelierCanvas"'),
  'AppNavigator missing AtelierCanvas route',
);

check(
  'AppNavigator registers AtelierGallery route',
  appNavSrc8.includes('name="AtelierGallery"'),
  'AppNavigator missing AtelierGallery route',
);

// accessControl
check(
  'accessControl exports hasAtelierUnlimitedAccess',
  acSrc8.includes('export function hasAtelierUnlimitedAccess'),
  'accessControl missing hasAtelierUnlimitedAccess export',
);

check(
  'accessControl FREE_ATELIER_SAVE_LIMIT equals 3',
  acSrc8.includes('FREE_ATELIER_SAVE_LIMIT = 3'),
  'accessControl FREE_ATELIER_SAVE_LIMIT is not 3',
);

// Baseline protections (Sprint 8 re-validation)
check(
  'StoryBookScreen resolveStoryBookVisual still intact (Sprint 8)',
  sbSrc8.includes('resolveStoryBookVisual'),
  'StoryBookScreen lost resolveStoryBookVisual — Livrinho visual composition broken',
);

check(
  'StoryBookScreen onSceneAudioComplete still intact (Sprint 8)',
  sbSrc8.includes('onSceneAudioComplete'),
  'StoryBookScreen lost onSceneAudioComplete — Livrinho auto-advance broken',
);

check(
  'StoryBookScreen advanceToNextScene still intact (Sprint 8)',
  sbSrc8.includes('advanceToNextScene'),
  'StoryBookScreen lost advanceToNextScene',
);

check(
  'AudioPlayer onFinished still intact (Sprint 8)',
  audioSrc8.includes('onFinished'),
  'AudioPlayer lost onFinished prop — Livrinho auto-advance broken',
);

check(
  'ProgressContext multiGet still intact (Sprint 8)',
  progCtxSrc8.includes('multiGet'),
  'ProgressContext lost multiGet — reverted to 20 individual reads',
);

check(
  'rewardService still pure sync (Sprint 8)',
  !rwdSvcSrc8.includes('AsyncStorage'),
  'rewardService now imports AsyncStorage — pure sync contract broken',
);

check(
  'ENABLE_LOCAL_PREMIUM_TEST_MODE false (Sprint 8)',
  acSrc8.includes('ENABLE_LOCAL_PREMIUM_TEST_MODE = false'),
  'ENABLE_LOCAL_PREMIUM_TEST_MODE is not false — premium gate disabled in production',
);

check(
  'audioManifest: no hardcoded status: "ready" literal (Sprint 8 — structural check)',
  !/status:\s*['"]ready['"]/.test(readSrc('src/data/audioManifest.js')),
  'audioManifest has a status: "ready" literal — use _readyEntries + AUDIO_STATUS.READY instead',
);

// ── [273–285] Sprint 8.1 — Viewer em alta qualidade (previewBase64) ──────────
console.log('\n── Sprint 8.1: Viewer alta qualidade (previewBase64) ──');

const atelierCanvasCompSrc = readSrc('src/components/AtelierCanvas.js');
const atelierCanvasSrc81   = readSrc('src/screens/AtelierCanvasScreen.js');
const atelierGallerySrc81  = readSrc('src/screens/AtelierGalleryScreen.js');
const atelierStorageSrc81  = readSrc('src/services/atelierStorage.js');

check(
  'AtelierCanvas exportState emits previewBase64 (full-res JPEG)',
  atelierCanvasCompSrc.includes('previewData=C.toDataURL') && atelierCanvasCompSrc.includes('previewBase64:previewData'),
  'AtelierCanvas exportState does not generate previewBase64 — viewer will still show 300px thumbnail',
);

check(
  'AtelierCanvas exportState uses 0.85 quality for preview',
  atelierCanvasCompSrc.includes("toDataURL('image/jpeg',0.85)"),
  'AtelierCanvas previewData does not use 0.85 quality JPEG',
);

check(
  'AtelierCanvas protocol comment mentions previewBase64',
  atelierCanvasCompSrc.includes('previewBase64'),
  'AtelierCanvas protocol comment not updated to document previewBase64',
);

check(
  'atelierStorage saveArt accepts previewBase64 param',
  atelierStorageSrc81.includes('previewBase64') && atelierStorageSrc81.includes('export async function saveArt'),
  'atelierStorage.saveArt does not accept previewBase64 param',
);

check(
  'atelierStorage stores previewBase64 in fullArt (not in meta)',
  atelierStorageSrc81.includes('previewBase64: previewBase64') || atelierStorageSrc81.includes('previewBase64:previewBase64||null') || atelierStorageSrc81.includes('previewBase64: previewBase64 ||'),
  'atelierStorage does not store previewBase64 in fullArt object',
);

check(
  'atelierStorage meta object does NOT contain previewBase64 (keeps index lightweight)',
  (() => {
    const metaBlock = atelierStorageSrc81.slice(
      atelierStorageSrc81.indexOf('const meta ='),
      atelierStorageSrc81.indexOf('await AsyncStorage.setItem(artKey'),
    );
    return !metaBlock.includes('previewBase64');
  })(),
  'atelierStorage meta (index) contains previewBase64 — index will be too large for list loading',
);

check(
  'AtelierCanvasScreen passes previewBase64 to saveArt',
  atelierCanvasSrc81.includes('previewBase64,') || atelierCanvasSrc81.includes('previewBase64 }') || atelierCanvasSrc81.includes('previewBase64\n'),
  'AtelierCanvasScreen does not pass previewBase64 to saveArt',
);

check(
  'AtelierCanvasScreen exportState callback destructures previewBase64',
  atelierCanvasSrc81.includes('previewBase64 }') || atelierCanvasSrc81.includes('previewBase64\n') || atelierCanvasSrc81.includes('{ stateJson, thumbnailBase64, previewBase64 }'),
  'AtelierCanvasScreen exportState callback does not destructure previewBase64',
);

check(
  'AtelierCanvasScreen pre-fills title from mission on save press',
  atelierCanvasSrc81.includes('mission.slice(0, 35)') || atelierCanvasSrc81.includes("mission ? mission.slice"),
  'AtelierCanvasScreen does not pre-fill title from mission — save UX improvement missing',
);

check(
  'AtelierGalleryScreen imports getArt from atelierStorage',
  atelierGallerySrc81.includes('getArt') && atelierGallerySrc81.includes('atelierStorage'),
  'AtelierGalleryScreen does not import getArt — cannot load full-res preview',
);

check(
  'AtelierGalleryScreen has viewingArtFull state',
  atelierGallerySrc81.includes('viewingArtFull'),
  'AtelierGalleryScreen missing viewingArtFull state — full-res preview not loaded',
);

check(
  'AtelierGalleryScreen viewer shows previewBase64 with thumbnailBase64 fallback',
  atelierGallerySrc81.includes('previewBase64') && atelierGallerySrc81.includes('thumbnailBase64'),
  'AtelierGalleryScreen viewer does not use previewBase64 || thumbnailBase64 pattern',
);

check(
  'AtelierGalleryScreen has closeViewer helper (clears both viewingArt and viewingArtFull)',
  atelierGallerySrc81.includes('closeViewer'),
  'AtelierGalleryScreen missing closeViewer helper — viewingArtFull may leak between opens',
);

// ── [284–303] Sprint 9 — Safe Area, icons, ParentalGate, ProfileScreen, language ──
console.log('\n── Sprint 9: UX polish, Safe Area, language ──');

// AppScreen component
check(
  'AppScreen component exists (src/components/layout/AppScreen.js)',
  srcExists('src/components/layout/AppScreen.js'),
  'AppScreen.js is missing — Safe Area wrapper not created',
);

const appScreenSrc = srcExists('src/components/layout/AppScreen.js')
  ? readSrc('src/components/layout/AppScreen.js')
  : '';

check(
  'AppScreen uses useSafeAreaInsets',
  appScreenSrc.includes('useSafeAreaInsets'),
  'AppScreen does not use useSafeAreaInsets — Safe Area not applied',
);

check(
  'AppScreen supports scroll prop (wraps ScrollView)',
  appScreenSrc.includes('scroll') && appScreenSrc.includes('ScrollView'),
  'AppScreen missing scroll prop or ScrollView support',
);

// FaithIcon component
check(
  'FaithIcon component exists (src/components/ui/FaithIcon.js)',
  srcExists('src/components/ui/FaithIcon.js'),
  'FaithIcon.js is missing — vector icon system not created',
);

const faithIconSrc = srcExists('src/components/ui/FaithIcon.js')
  ? readSrc('src/components/ui/FaithIcon.js')
  : '';

check(
  'FaithIcon imports from @expo/vector-icons',
  faithIconSrc.includes('@expo/vector-icons'),
  'FaithIcon does not import from @expo/vector-icons',
);

check(
  'FaithIcon has ICON_MAP with at least 10 semantic names',
  (faithIconSrc.match(/home|adventures|atelier|trophies|profile|bible|star|lock|heart|paint|gallery|parent|lumi|play|back|close|check|family/g) || []).length >= 10,
  'FaithIcon ICON_MAP has fewer than 10 semantic names',
);

// ParentalGate
const pgSrc9 = readSrc('src/components/ParentalGate.js');

check(
  'ParentalGate first factor starts at 6 (Math.floor(Math.random() * 7) + 6)',
  pgSrc9.includes('Math.floor(Math.random() * 7) + 6'),
  'ParentalGate first factor range not updated to 6–12',
);

check(
  'ParentalGate second factor starts at 4 (Math.floor(Math.random() * 9) + 4)',
  pgSrc9.includes('Math.floor(Math.random() * 9) + 4'),
  'ParentalGate second factor range not updated to 4–12',
);

check(
  'ParentalGate button says "Entrar" (not "Confirmar")',
  pgSrc9.includes('Entrar') && !pgSrc9.includes('Confirmar'),
  'ParentalGate button still says "Confirmar" — must be "Entrar"',
);

check(
  'ParentalGate has visible error text "Resposta incorreta"',
  pgSrc9.includes('Resposta incorreta'),
  'ParentalGate missing visible error text "Resposta incorreta. Tente novamente."',
);

check(
  'ParentalGate has no lockEmoji style (emoji removed as main icon)',
  !pgSrc9.includes('lockEmoji'),
  'ParentalGate still has lockEmoji style — emoji must be removed as main visual',
);

// ParentAreaScreen — no insets.top on inner headers
const parentAreaSrc9 = readSrc('src/screens/ParentAreaScreen.js');

check(
  'ParentAreaScreen inner header has no Math.max(insets.top) (overlay fix)',
  !parentAreaSrc9.includes('Math.max(insets.top'),
  'ParentAreaScreen inner header still uses Math.max(insets.top) — purple overlay will appear on iPhone',
);

// ProfileScreen — simplified adult block
const profileSrc9 = readSrc('src/screens/ProfileScreen.js');

check(
  'ProfileScreen has no "Meu Plano" AdultCard',
  !profileSrc9.includes('Meu Plano'),
  'ProfileScreen still has "Meu Plano" AdultCard — must be removed from child area',
);

check(
  'ProfileScreen has no "Enviar Feedback" AdultCard',
  !profileSrc9.includes('Enviar Feedback'),
  'ProfileScreen still has "Enviar Feedback" AdultCard — must be removed from child area',
);

check(
  'ProfileScreen does not import ParentalGate (no longer needed)',
  !profileSrc9.includes("import ParentalGate"),
  'ProfileScreen still imports ParentalGate — remove unused import',
);

// Language polish — child areas
const homeSrc9 = readSrc('src/screens/HomeScreen.js');

check(
  'HomeScreen WORLDS has no bare "Premium" accessLabel',
  !homeSrc9.includes("accessLabel: 'Premium'") && !homeSrc9.includes('accessLabel: "Premium"'),
  'HomeScreen WORLDS still uses "Premium" accessLabel — must be "Especial da Família"',
);

check(
  'HomeScreen LumiMomentCard badge says "Especial da Família" (not "💎 Plano Familiar")',
  homeSrc9.includes('Especial da Família') && !homeSrc9.includes('Plano Familiar'),
  'HomeScreen LumiMomentCard still says "💎 Plano Familiar" — must be "Especial da Família"',
);

const storyDetailSrc9 = readSrc('src/screens/StoryDetailScreen.js');

check(
  'StoryDetailScreen locked primary label says "Pedir ao responsável"',
  storyDetailSrc9.includes('Pedir ao responsável'),
  'StoryDetailScreen locked label still says "💎 Ver Plano Familiar" — must be "Pedir ao responsável"',
);

// AtelierScreen grammar
const atelierSrc9 = readSrc('src/screens/AtelierScreen.js');

check(
  'AtelierScreen header subtitle corrected (no "crie artes especiais com sua imaginação")',
  !atelierSrc9.includes('crie artes especiais com sua imaginação'),
  'AtelierScreen header subtitle not corrected — still has old grammar',
);

check(
  'AtelierScreen desafio card says "Uma ideia especial" (not "Receba uma ideia")',
  atelierSrc9.includes('Uma ideia especial para desenhar hoje') &&
  !atelierSrc9.includes('Receba uma ideia especial para desenhar hoje'),
  'AtelierScreen desafio card still says "Receba uma ideia especial para desenhar hoje"',
);

// ── [304–337] Sprint 9.1 — Safe Area real, FaithIcon aplicado, linguagem ──────
console.log('\n── Sprint 9.1: Safe Area real, FaithIcon, Especial da Família ──');

const storiesScreenSrc91 = readSrc('src/screens/StoriesScreen.js');
const appNavSrc91        = readSrc('src/navigation/AppNavigator.js');
const statusBadgeSrc     = readSrc('src/components/ui/StatusBadge.js');
const premiumLockSrc91   = readSrc('src/components/premium/PremiumLockCard.js');
const lockedFbSrc91      = readSrc('src/components/premium/LockedStoryFallback.js');
const trophiesSrc91      = readSrc('src/screens/TrophiesScreen.js');
const homeSrc91          = readSrc('src/screens/HomeScreen.js');
const postHubSrc91       = readSrc('src/screens/PostStoryHubScreen.js');
const contentSvcSrc91    = readSrc('src/services/contentAccessService.js');
const quizSrc91          = readSrc('src/screens/QuizScreen.js');
const reflSrc91          = readSrc('src/screens/ReflectionScreen.js');
const lumiMomSrc91       = readSrc('src/screens/LumiMomentScreen.js');
const sbSrc91            = readSrc('src/screens/StoryBookScreen.js');
const atelierCanvasSrc91 = readSrc('src/screens/AtelierCanvasScreen.js');
const parentAreaSrc91    = readSrc('src/screens/ParentAreaScreen.js');

// Safe Area — StoriesScreen
check(
  'StoriesScreen applies insets.top to contentContainerStyle (paddingTop)',
  storiesScreenSrc91.includes('insets.top') &&
  (storiesScreenSrc91.includes('paddingTop: insets.top') || storiesScreenSrc91.includes('insets.top + 16')),
  'StoriesScreen missing insets.top in contentContainerStyle — titles under status bar on iPhone',
);

check(
  'StoriesScreen does NOT use paddingVertical only (must have paddingTop separately)',
  !storiesScreenSrc91.includes('paddingVertical: 16'),
  'StoriesScreen still uses paddingVertical:16 — top not respecting insets',
);

// FaithIcon in AppNavigator
check(
  'AppNavigator imports FaithIcon',
  appNavSrc91.includes("import FaithIcon"),
  'AppNavigator does not import FaithIcon — tab icons still emoji-based',
);

check(
  'AppNavigator TabIcon uses FaithIcon component (not Text emoji)',
  appNavSrc91.includes('FaithIcon') && !appNavSrc91.includes('fontSize: focused ? 26'),
  'AppNavigator TabIcon still uses emoji Text — tab icons not updated to FaithIcon',
);

check(
  'AppNavigator TAB_DEFS use faithIcon (not emoji)',
  appNavSrc91.includes('faithIcon:') && !appNavSrc91.includes("emoji: '🏠'"),
  'AppNavigator TAB_DEFS still use emoji property instead of faithIcon',
);

// FaithIcon in PremiumLockCard
check(
  'PremiumLockCard imports FaithIcon',
  premiumLockSrc91.includes("import FaithIcon"),
  'PremiumLockCard does not import FaithIcon',
);

check(
  'PremiumLockCard uses FaithIcon instead of 💎 emoji icon',
  premiumLockSrc91.includes('FaithIcon') && !premiumLockSrc91.includes('<Text style={styles.icon}>💎</Text>'),
  'PremiumLockCard still uses 💎 emoji as main icon',
);

// FaithIcon in LockedStoryFallback
check(
  'LockedStoryFallback imports FaithIcon',
  lockedFbSrc91.includes("import FaithIcon"),
  'LockedStoryFallback does not import FaithIcon',
);

check(
  'LockedStoryFallback uses FaithIcon instead of 🔒 emoji',
  lockedFbSrc91.includes('FaithIcon') && !lockedFbSrc91.includes("<Text style={styles.emoji}>🔒</Text>"),
  'LockedStoryFallback still uses 🔒 emoji as main icon',
);

check(
  'LockedStoryFallback button has no emoji prefix (👨‍👩‍👧 removed)',
  !lockedFbSrc91.includes('👨‍👩‍👧 Chamar') && !lockedFbSrc91.includes('👨‍👩‍👧 Chamar'),
  'LockedStoryFallback "Chamar responsável" button still has emoji prefix',
);

// FaithIcon in TrophiesScreen
check(
  'TrophiesScreen imports FaithIcon',
  trophiesSrc91.includes("import FaithIcon"),
  'TrophiesScreen does not import FaithIcon',
);

check(
  'TrophiesScreen uses FaithIcon for header icon (not 🏆 Text)',
  trophiesSrc91.includes('FaithIcon') && !trophiesSrc91.includes('<Text style={styles.headerEmoji}>🏆</Text>'),
  'TrophiesScreen still uses 🏆 emoji as header icon instead of FaithIcon',
);

check(
  'TrophiesScreen uses FaithIcon for locked achievement (not 🔒 Text)',
  trophiesSrc91.includes('FaithIcon') && !trophiesSrc91.includes("'🔒'"),
  'TrophiesScreen still uses 🔒 emoji for locked achievements',
);

// StatusBadge premium label
check(
  'StatusBadge premium defaultLabel is "Especial da Família" (not "Premium")',
  statusBadgeSrc.includes("defaultLabel: 'Especial da Família'"),
  'StatusBadge premium defaultLabel still says "Premium" — visible on all premium story badges',
);

// Language — child areas
check(
  'HomeScreen LumiMomentCard locked button says "Pedir ao responsável" (not "Ver plano familiar")',
  homeSrc91.includes('Pedir ao responsável') && !homeSrc91.includes('Ver plano familiar'),
  'HomeScreen LumiMomentCard still shows "Ver plano familiar" when locked',
);

check(
  'PostStoryHubScreen Lumi cta says "Especial da Família" (not "💎 Premium")',
  postHubSrc91.includes('Especial da Família') && !postHubSrc91.includes("'💎 Premium'"),
  'PostStoryHubScreen Lumi cta still says "💎 Premium"',
);

check(
  'contentAccessService locked label is "Pedir ao responsável" (not "💎 Ver Plano Familiar")',
  contentSvcSrc91.includes('Pedir ao responsável') && !contentSvcSrc91.includes('💎 Ver Plano Familiar'),
  'contentAccessService still uses "💎 Ver Plano Familiar" as locked primary label',
);

check(
  'contentAccessService getLockedStoryMessage returns "Especial da Família"',
  contentSvcSrc91.includes("Especial da Família") && !contentSvcSrc91.includes('Desbloqueie com o Plano Familiar'),
  'contentAccessService getLockedStoryMessage still says "Desbloqueie com o Plano Familiar"',
);

check(
  'QuizScreen PremiumLockCard title says "Especial da Família"',
  quizSrc91.includes('Especial da Família'),
  'QuizScreen PremiumLockCard still uses "plano familiar" language',
);

check(
  'ReflectionScreen PremiumLockCard description says "Especial da Família"',
  reflSrc91.includes('Especial da Família'),
  'ReflectionScreen PremiumLockCard still says "plano familiar"',
);

check(
  'LumiMomentScreen PremiumLockCard description says "Especial da Família"',
  lumiMomSrc91.includes('Especial da Família'),
  'LumiMomentScreen PremiumLockCard still says "plano familiar"',
);

check(
  'StoryBookScreen locked title says "Especial da Família" (not "Plano Familiar")',
  sbSrc91.includes('Especial da Família') && !sbSrc91.includes('guardado no Plano Familiar'),
  'StoryBookScreen locked title still says "Plano Familiar"',
);

check(
  'AtelierCanvasScreen limit modal has no "Plano Familiar" text',
  !atelierCanvasSrc91.includes('ver o Plano Familiar'),
  'AtelierCanvasScreen modal still says "ver o Plano Familiar"',
);

// ParentArea adult language
check(
  'ParentAreaScreen uses "Plano Família" (not "Plano Familiar Premium") as plan name',
  parentAreaSrc91.includes('Plano Família') && !parentAreaSrc91.includes('Plano Familiar Premium'),
  'ParentAreaScreen still uses "Plano Familiar Premium" — should be "Plano Família"',
);

// ── [328–355] Sprint 9.2 — Paleta unificada, sticker fix, fill fix ───────────
console.log('\n── Sprint 9.2: colorPalette, drawStamp, flood fill ──');

const colorPaletteSrc   = readSrc('src/constants/colorPalette.js');
const atelierCanvasSrc92 = readSrc('src/components/AtelierCanvas.js');
const coloringCanvasSrc92 = readSrc('src/components/ColoringCanvas.js');
const coloringScreenSrc92 = readSrc('src/screens/ColoringScreen.js');
const atelierScreenSrc92  = readSrc('src/screens/AtelierCanvasScreen.js');

check(
  'colorPalette.js exists (src/constants/colorPalette.js)',
  colorPaletteSrc.length > 0,
  'colorPalette.js not found — create src/constants/colorPalette.js',
);
check(
  'colorPalette exports COLOR_PALETTE',
  colorPaletteSrc.includes('export const COLOR_PALETTE'),
  'COLOR_PALETTE not exported from colorPalette.js',
);
check(
  'colorPalette exports DEFAULT_COLOR',
  colorPaletteSrc.includes('export const DEFAULT_COLOR'),
  'DEFAULT_COLOR not exported from colorPalette.js',
);
check(
  'COLOR_PALETTE has at least 34 colors (≥ original Colorir palette)',
  (colorPaletteSrc.match(/hex:/g) || []).length >= 34,
  'COLOR_PALETTE has fewer than 34 colors — less than original Colorir palette',
);
check(
  'ColoringScreen imports from colorPalette (not inline PALETTE)',
  coloringScreenSrc92.includes("from '../constants/colorPalette'"),
  'ColoringScreen does not import from colorPalette.js — palette not unified',
);
check(
  'ColoringScreen has no inline PALETTE array definition',
  !coloringScreenSrc92.includes('const PALETTE = ['),
  'ColoringScreen still defines inline PALETTE — remove it and use COLOR_PALETTE',
);
check(
  'ColoringScreen uses COLOR_PALETTE in JSX',
  coloringScreenSrc92.includes('COLOR_PALETTE.map'),
  'ColoringScreen does not use COLOR_PALETTE.map — palette rendering not updated',
);
check(
  'AtelierCanvasScreen imports from colorPalette (not atelierData)',
  atelierScreenSrc92.includes("from '../constants/colorPalette'"),
  'AtelierCanvasScreen does not import from colorPalette.js — palette not unified',
);
check(
  'AtelierCanvasScreen has no ATELIER_PALETTE import',
  !atelierScreenSrc92.includes("ATELIER_PALETTE"),
  'AtelierCanvasScreen still uses ATELIER_PALETTE — should use COLOR_PALETTE',
);
check(
  'AtelierCanvasScreen uses COLOR_PALETTE in JSX',
  atelierScreenSrc92.includes('COLOR_PALETTE.map'),
  'AtelierCanvasScreen does not use COLOR_PALETTE.map — palette rendering not updated',
);
check(
  'AtelierCanvas drawStamp uses actualBoundingBoxLeft (glyph centering)',
  atelierCanvasSrc92.includes('actualBoundingBoxLeft'),
  'drawStamp does not use actualBoundingBoxLeft — emoji centering fix not applied',
);
check(
  'AtelierCanvas drawStamp uses actualBoundingBoxAscent (glyph centering)',
  atelierCanvasSrc92.includes('actualBoundingBoxAscent'),
  'drawStamp does not use actualBoundingBoxAscent — emoji centering fix not applied',
);
check(
  'AtelierCanvas drawStamp has fallback for environments without actualBoundingBox',
  atelierCanvasSrc92.includes("typeof m.actualBoundingBoxLeft==='number'"),
  'drawStamp has no fallback — will break in environments without TextMetrics level-2',
);
check(
  'AtelierCanvas drawStamp ring still centered at (s.x, s.y)',
  atelierCanvasSrc92.includes('ctx.arc(s.x,s.y,s.size/2+10'),
  'Selection ring is not at (s.x,s.y) — ring may be misaligned with emoji',
);
check(
  'ColoringCanvas has isBFSBarrier (fill fringe fix)',
  coloringCanvasSrc92.includes('function isBFSBarrier'),
  'isBFSBarrier not found in ColoringCanvas — fill fringe fix not applied',
);
check(
  'ColoringCanvas BFS uses isBFSBarrier (not isBarrier) for expansion',
  coloringCanvasSrc92.includes('isBFSBarrier(bd[ni]'),
  'BFS expansion still uses isBarrier — isBFSBarrier must replace it inside the BFS loop',
);
check(
  'ColoringCanvas keeps isBarrier for tap rejection (threshold 230)',
  coloringCanvasSrc92.includes('function isBarrier') && coloringCanvasSrc92.includes('lum(r,g,b)<230'),
  'isBarrier (threshold 230) removed or changed — tap rejection no longer strict',
);
check(
  'ColoringCanvas isBFSBarrier uses threshold 210',
  coloringCanvasSrc92.includes('lum(r,g,b)<210'),
  'isBFSBarrier does not use threshold 210 — fringe expansion may be wrong',
);
check(
  'ColoringCanvas exportPaint still exists (no breakage)',
  coloringCanvasSrc92.includes('window.exportPaint=function'),
  'exportPaint removed or renamed — breaks paint persistence',
);
check(
  'ColoringCanvas loadPaint still exists (no breakage)',
  coloringCanvasSrc92.includes('window.loadPaint=function'),
  'loadPaint removed or renamed — breaks loading saved drawings',
);
check(
  'AtelierCanvas previewBase64 still exported',
  atelierCanvasSrc92.includes('previewBase64:previewData'),
  'previewBase64 no longer exported from AtelierCanvas — breaks gallery viewer',
);
check(
  'AtelierCanvas stamps format unchanged (v:2, strokes, stamps, bgColor)',
  atelierCanvasSrc92.includes('"v":2') || atelierCanvasSrc92.includes("v:2,strokes:strokes,stamps:stamps"),
  'AtelierCanvas state format changed — breaks loading existing saved arts',
);
check(
  'AtelierCanvas loadState handles v2 and legacy ops format',
  atelierCanvasSrc92.includes("d.v===2") && atelierCanvasSrc92.includes("d.ops"),
  'AtelierCanvas loadState compatibility branches missing — old arts will not load',
);

// ── [351–374] Sprint 9.3 — Coloring UX (zoomIn, FILL_REJECTED, FaithIcon tools, lineTip) ─
console.log('\n── Sprint 9.3: coloring UX improvements ──');

const faithIconSrc93      = readSrc('src/components/ui/FaithIcon.js');
const coloringCanvasSrc93 = readSrc('src/components/ColoringCanvas.js');
const coloringScreenSrc93 = readSrc('src/screens/ColoringScreen.js');

check(
  'FaithIcon has erase semantic name',
  faithIconSrc93.includes('erase:'),
  'FaithIcon missing erase — coloring tool buttons cannot use FaithIcon',
);
check(
  'FaithIcon has undo semantic name',
  faithIconSrc93.includes('undo:'),
  'FaithIcon missing undo — coloring tool buttons cannot use FaithIcon',
);
check(
  'FaithIcon has clear semantic name',
  faithIconSrc93.includes('clear:'),
  'FaithIcon missing clear — coloring tool buttons cannot use FaithIcon',
);
check(
  'FaithIcon has zoom_in semantic name',
  faithIconSrc93.includes('zoom_in:'),
  'FaithIcon missing zoom_in — Ampliar button cannot use FaithIcon',
);
check(
  'FaithIcon has zoom_reset semantic name',
  faithIconSrc93.includes('zoom_reset:'),
  'FaithIcon missing zoom_reset — Enquadrar button cannot use FaithIcon',
);
check(
  'ColoringCanvas has window.zoomIn (Ampliar API)',
  coloringCanvasSrc93.includes('window.zoomIn=function'),
  'window.zoomIn not found in ColoringCanvas — Ampliar button will not work',
);
check(
  'ColoringCanvas zoomIn clamps to maxScale (1.5× step)',
  coloringCanvasSrc93.includes('Math.min(maxScale,scale*1.5)'),
  'zoomIn does not use 1.5x step clamped to maxScale',
);
check(
  'ColoringCanvas exposes zoomIn via useImperativeHandle',
  coloringCanvasSrc93.includes("zoomIn()") && coloringCanvasSrc93.includes("window.zoomIn()"),
  'zoomIn not exposed via ref — canvasRef.current.zoomIn() will fail',
);
check(
  'ColoringCanvas postMessages FILL_REJECTED on barrier tap',
  coloringCanvasSrc93.includes("postMessage('FILL_REJECTED')"),
  'FILL_REJECTED message missing — no touch feedback when tapping on a line',
);
check(
  'ColoringCanvas FILL_REJECTED has 2s throttle (lastFillRejectedAt)',
  coloringCanvasSrc93.includes('lastFillRejectedAt'),
  'No throttle on FILL_REJECTED — message will spam on repeated line taps',
);
check(
  'ColoringCanvas accepts onFillRejected prop',
  coloringCanvasSrc93.includes('onFillRejected'),
  'onFillRejected prop missing from ColoringCanvas',
);
check(
  'ColoringCanvas handles FILL_REJECTED message',
  coloringCanvasSrc93.includes("msg === 'FILL_REJECTED'") && coloringCanvasSrc93.includes('onFillRejected?.()'),
  'FILL_REJECTED not dispatched to onFillRejected callback',
);
check(
  'ColoringCanvas resetZoom still intact (Enquadrar)',
  coloringCanvasSrc93.includes('window.resetZoom=function'),
  'resetZoom removed — Enquadrar button broken',
);
check(
  'ColoringCanvas undo still intact',
  coloringCanvasSrc93.includes('window.undo=function'),
  'undo removed — Desfazer button broken',
);
check(
  'ColoringScreen imports FaithIcon',
  coloringScreenSrc93.includes("from '../components/ui/FaithIcon'"),
  'FaithIcon not imported in ColoringScreen',
);
check(
  'ColoringScreen ToolBtn uses iconName prop (no emoji icon)',
  coloringScreenSrc93.includes('iconName') && !coloringScreenSrc93.includes('icon="🧹"'),
  'ToolBtn still uses emoji icon — FaithIcon not applied',
);
check(
  'ColoringScreen has Ampliar button',
  coloringScreenSrc93.includes('"Ampliar"'),
  'Ampliar button not found in ColoringScreen',
);
check(
  'ColoringScreen has Enquadrar button',
  coloringScreenSrc93.includes('"Enquadrar"'),
  'Enquadrar button not found in ColoringScreen',
);
check(
  'ColoringScreen has no old "Zoom ↺" label',
  !coloringScreenSrc93.includes('"Zoom ↺"'),
  '"Zoom ↺" label still present — should be replaced by Ampliar/Enquadrar',
);
check(
  'ColoringScreen handleZoomIn calls canvasRef.current?.zoomIn()',
  coloringScreenSrc93.includes('canvasRef.current?.zoomIn()'),
  'handleZoomIn not wired to zoomIn() — Ampliar button will not zoom',
);
check(
  'ColoringScreen passes onFillRejected to ColoringCanvas',
  coloringScreenSrc93.includes('onFillRejected={handleFillRejected}'),
  'onFillRejected not passed to ColoringCanvas — touch feedback disabled',
);
check(
  'ColoringScreen has showLineTip state',
  coloringScreenSrc93.includes('showLineTip'),
  'showLineTip state missing — line tip toast cannot show',
);
check(
  'ColoringScreen lineTip text is correct',
  coloringScreenSrc93.includes('Toque dentro de uma parte branca para colorir'),
  'lineTip instructional text not found',
);
check(
  'ColoringScreen lineTip has pointerEvents="none"',
  coloringScreenSrc93.includes('pointerEvents="none"'),
  'lineTip missing pointerEvents="none" — tip overlay blocks canvas touches',
);

const coloringAssetGuide = (() => {
  try { return fs.readFileSync(path.join(root, 'docs/COLORING_ASSET_GUIDE.md'), 'utf8'); } catch (_) { return ''; }
})();
check(
  'docs/COLORING_ASSET_GUIDE.md exists',
  coloringAssetGuide.length > 0,
  'COLORING_ASSET_GUIDE.md not found — create docs/COLORING_ASSET_GUIDE.md',
);
check(
  'COLORING_ASSET_GUIDE.md documents BFS thresholds (210 and 230)',
  coloringAssetGuide.includes('210') && coloringAssetGuide.includes('230'),
  'COLORING_ASSET_GUIDE.md missing BFS threshold documentation',
);

// ── [377–410] Sprint 9.4 — Coloring UX confort: clear text, two-finger pan, layout ─
console.log('\n── Sprint 9.4: coloring comfort & two-finger pan ──');

const coloringCanvasSrc94 = readSrc('src/components/ColoringCanvas.js');
const coloringScreenSrc94 = readSrc('src/screens/ColoringScreen.js');
const coloringAssetGuide94 = (() => {
  try { return fs.readFileSync(path.join(root, 'docs/COLORING_ASSET_GUIDE.md'), 'utf8'); } catch (_) { return ''; }
})();

// Limpar confirmation text (Tarefa 2)
check(
  'ColoringScreen Limpar title is "Apagar as cores deste desenho?"',
  coloringScreenSrc94.includes('Apagar as cores deste desenho?'),
  'Limpar confirmation title not updated — should say "Apagar as cores deste desenho?"',
);
check(
  'ColoringScreen Limpar description is "Você pode continuar colorindo depois."',
  coloringScreenSrc94.includes('Você pode continuar colorindo depois.'),
  'Limpar description not updated — should say "Você pode continuar colorindo depois."',
);
check(
  'ColoringScreen Limpar destructive button text is "Apagar" (not "Apagar tudo")',
  coloringScreenSrc94.includes("text: 'Apagar'") && !coloringScreenSrc94.includes("text: 'Apagar tudo'"),
  'Limpar button still says "Apagar tudo" — should be shortened to "Apagar"',
);
check(
  'ColoringScreen Limpar still has Alert.alert (confirmation intact)',
  coloringScreenSrc94.includes("Alert.alert(\n      'Apagar as cores deste desenho?'"),
  'Limpar confirmation was removed — destructive action must always confirm',
);

// Two-finger pan — Option A (Tarefa 5)
check(
  'ColoringCanvas has pinchMX variable (two-finger pan)',
  coloringCanvasSrc94.includes('pinchMX'),
  'pinchMX not found — two-finger pan not implemented',
);
check(
  'ColoringCanvas has pinchMY variable (two-finger pan)',
  coloringCanvasSrc94.includes('pinchMY'),
  'pinchMY not found — two-finger pan not implemented',
);
check(
  'ColoringCanvas touchmove uses pinchMX/pinchMY in zoom formula (corrected pan+zoom)',
  coloringCanvasSrc94.includes('tx=mX-(pinchMX-tx)*(ns/scale)'),
  'Corrected pan+zoom formula not found — two-finger pan will not work',
);
check(
  'ColoringCanvas updates pinchMX/pinchMY after each touchmove frame',
  coloringCanvasSrc94.includes('pinchD=nd; pinchMX=mX; pinchMY=mY;'),
  'pinchMX/pinchMY not updated per frame — pan will drift',
);
check(
  'ColoringCanvas initialises pinchMX/pinchMY in touchstart',
  coloringCanvasSrc94.includes('pinchMX=(e.touches[0].clientX+e.touches[1].clientX)/2'),
  'pinchMX not initialised in touchstart — first pan frame will be wrong',
);
check(
  'ColoringCanvas single-finger no longer has pan state in touchmove',
  !coloringCanvasSrc94.includes("touchState==='pan'"),
  'Single-finger pan still active — conflicts with Option A (two-finger only)',
);
check(
  'ColoringCanvas touchend sets single-finger to tap (not pan after pinch)',
  coloringCanvasSrc94.includes("touchState='tap';") && !coloringCanvasSrc94.includes("(prev==='pinch')?'pan':'tap'"),
  'After pinch, single finger still becomes pan — Option A not fully applied',
);
check(
  'ColoringCanvas suppressPaintUntil cooldown still present after pinch',
  coloringCanvasSrc94.includes("if(prev==='pinch') suppressPaintUntil=Date.now()+300"),
  'suppressPaintUntil removed — accidental fills after pinch no longer prevented',
);

// Two-finger hint in ColoringScreen (Tarefa 5)
check(
  'ColoringScreen has two-finger hint text',
  coloringScreenSrc94.includes('Dois dedos: mover e ampliar'),
  'Two-finger hint text not found in ColoringScreen',
);
check(
  'ColoringScreen has twoFingerHint style',
  coloringScreenSrc94.includes('twoFingerHint:'),
  'twoFingerHint style missing from ColoringScreen',
);

// Layout improvements (Tarefa 6)
check(
  'ColoringScreen uses CANVAS_MARGIN constant',
  coloringScreenSrc94.includes('CANVAS_MARGIN'),
  'CANVAS_MARGIN not found — margin is not parameterised',
);
check(
  'ColoringScreen CANVAS_MARGIN is 6 (reduced from 10)',
  coloringScreenSrc94.includes('CANVAS_MARGIN = 6'),
  'CANVAS_MARGIN is not 6 — canvas margin not reduced',
);
check(
  'ColoringScreen approxBottomH updated to 158',
  coloringScreenSrc94.includes('approxBottomH = 158'),
  'approxBottomH not updated — canvas height calculation may be inaccurate',
);
check(
  'ColoringScreen lineTip bottom updated to 168',
  coloringScreenSrc94.includes('bottom: 168 + insets.bottom'),
  'lineTip bottom not updated — toast may overlap bottom panel after layout changes',
);

// Protections intact
check(
  'ColoringCanvas exportPaint intact (Sprint 9.4)',
  coloringCanvasSrc94.includes('window.exportPaint=function'),
  'exportPaint removed — paint persistence broken',
);
check(
  'ColoringCanvas loadPaint intact (Sprint 9.4)',
  coloringCanvasSrc94.includes('window.loadPaint=function'),
  'loadPaint removed — loading saved drawings broken',
);
check(
  'ColoringCanvas FILL_REJECTED intact (Sprint 9.4)',
  coloringCanvasSrc94.includes("postMessage('FILL_REJECTED')"),
  'FILL_REJECTED removed — touch feedback on line tap lost',
);
check(
  'ColoringCanvas zoomIn intact (Sprint 9.4)',
  coloringCanvasSrc94.includes('window.zoomIn=function'),
  'zoomIn removed — Ampliar button broken',
);
check(
  'ColoringCanvas resetZoom intact (Sprint 9.4)',
  coloringCanvasSrc94.includes('window.resetZoom=function'),
  'resetZoom removed — Enquadrar button broken',
);
check(
  'ColoringCanvas undo intact (Sprint 9.4)',
  coloringCanvasSrc94.includes('window.undo=function'),
  'undo removed — Desfazer button broken',
);
check(
  'ColoringCanvas isBFSBarrier threshold 210 intact (Sprint 9.4)',
  coloringCanvasSrc94.includes('lum(r,g,b)<210'),
  'isBFSBarrier threshold changed — fringe fill behaviour altered',
);
check(
  'ColoringCanvas isBarrier threshold 230 intact (Sprint 9.4)',
  coloringCanvasSrc94.includes('lum(r,g,b)<230'),
  'isBarrier threshold changed — tap rejection altered',
);

// COLORING_ASSET_GUIDE provisional notice (Tarefa 10)
check(
  'COLORING_ASSET_GUIDE.md has provisional drawings notice',
  coloringAssetGuide94.includes('provisório') || coloringAssetGuide94.includes('provisórios'),
  'COLORING_ASSET_GUIDE.md missing provisional drawings notice',
);

// ── [404–430] Sprint 10 — Aventuras como Estante de Histórias ───────────────
console.log('\n── Sprint 10: Estante de Histórias ──');

const storiesScreenSrc10 = readSrc('src/screens/StoriesScreen.js');
const storyCardSrc10     = readSrc('src/components/StoryCard.js');
const storyDetailSrc10   = readSrc('src/screens/StoryDetailScreen.js');
const storyBookSrc10     = readSrc('src/screens/StoryBookScreen.js');
const progressCtxSrc10   = readSrc('src/context/ProgressContext.js');
const rewardSvcSrc10     = readSrc('src/services/rewardService.js');
const acSrc10            = readSrc('src/services/accessControl.js');

// Infantile header
check(
  'StoriesScreen has "Mapa das Histórias" title (Sprint Beni 2.2)',
  storiesScreenSrc10.includes('Mapa das Histórias'),
  'StoriesScreen missing "Mapa das Histórias" title — updated in Sprint Beni 2.2',
);
check(
  'StoriesScreen has Beni subtitle (Sprint Beni 2.2)',
  storiesScreenSrc10.includes('Escolha um caminho com Beni'),
  'StoriesScreen missing subtitle — should say "Escolha um caminho com Beni."',
);

// Trail chips — FaithIcon
check(
  'StoriesScreen imports FaithIcon',
  storiesScreenSrc10.includes("import FaithIcon from '../components/ui/FaithIcon'"),
  'FaithIcon not imported in StoriesScreen',
);
check(
  'StoriesScreen CATEGORIES have faithIcon field',
  storiesScreenSrc10.includes('faithIcon:'),
  'CATEGORIES missing faithIcon field — FaithIcon cannot be used in chips',
);
check(
  'StoriesScreen chips render FaithIcon (not only emoji text)',
  storiesScreenSrc10.includes('<FaithIcon') && storiesScreenSrc10.includes('cat.faithIcon'),
  'StoriesScreen chips do not render FaithIcon — still emoji-only',
);
check(
  'StoriesScreen chip shows shortDesc',
  storiesScreenSrc10.includes('shortDesc') && storiesScreenSrc10.includes('cat.shortDesc'),
  'StoriesScreen chip missing shortDesc — no description in chips',
);

// Language — "Especial da Família" in trail chips
check(
  'StoriesScreen chips show "Especial da Família" for premium trails (not "Premium")',
  storiesScreenSrc10.includes('Especial da Família') && !storiesScreenSrc10.includes("'Premium'"),
  'StoriesScreen trail chips still show "Premium" instead of "Especial da Família"',
);

// Scroll to top
check(
  'StoriesScreen has outerScrollRef',
  storiesScreenSrc10.includes('outerScrollRef'),
  'outerScrollRef not found — scroll-to-top on trail change not implemented',
);
check(
  'StoriesScreen scrolls to top on activeCategory change',
  storiesScreenSrc10.includes('scrollTo({ y: 0') || storiesScreenSrc10.includes("scrollTo({y:0"),
  'StoriesScreen does not scroll to top on trail change',
);
check(
  'StoriesScreen passes outerScrollRef to outer ScrollView',
  storiesScreenSrc10.includes('ref={outerScrollRef}'),
  'outerScrollRef not attached to outer ScrollView',
);

// Center active chip
check(
  'StoriesScreen has chipScrollRef',
  storiesScreenSrc10.includes('chipScrollRef'),
  'chipScrollRef not found — chip centering not implemented',
);
check(
  'StoriesScreen has chipLayouts ref for tracking chip positions',
  storiesScreenSrc10.includes('chipLayouts'),
  'chipLayouts ref not found — chip positions not tracked',
);
check(
  'StoriesScreen chips use onLayout to track position',
  storiesScreenSrc10.includes('onLayout') && storiesScreenSrc10.includes('chipLayouts.current[cat.id]'),
  'StoriesScreen chips missing onLayout — chip centering cannot work',
);
check(
  'StoriesScreen centers chip on activeCategory change (scrollTo)',
  storiesScreenSrc10.includes('chipScrollRef.current') && storiesScreenSrc10.includes('scrollTo('),
  'StoriesScreen does not center chip on trail change',
);
check(
  'StoriesScreen imports useWindowDimensions (for chip centering)',
  storiesScreenSrc10.includes('useWindowDimensions'),
  'useWindowDimensions not imported — chip centering formula cannot use screen width',
);

// StoryCard 16:9 layout
check(
  'StoryCard cover has aspectRatio 16/9',
  storyCardSrc10.includes('aspectRatio: 16 / 9') || storyCardSrc10.includes('aspectRatio:16/9'),
  'StoryCard cover does not have aspectRatio 16/9 — card not prepared for future covers',
);
check(
  'StoryCard has no fixed cover width: 96',
  !storyCardSrc10.includes('width: 96'),
  'StoryCard cover still has fixed width: 96 — old horizontal layout not removed',
);
check(
  'StoryCard cover uses width 100% (vertical layout, not fixed 96px column)',
  storyCardSrc10.includes("width: '100%'") && storyCardSrc10.includes('aspectRatio'),
  'StoryCard cover does not use width: 100% — old horizontal column layout still active',
);

// StoriesScreen uses ProgressContext (not own reads)
check(
  'StoriesScreen uses useProgressContext (not useProgress)',
  storiesScreenSrc10.includes('useProgressContext') && !storiesScreenSrc10.includes("useProgress("),
  'StoriesScreen uses old useProgress hook — should use useProgressContext exclusively',
);

// Docs
const adventuresGuide = (() => {
  try { return fs.readFileSync(path.join(root, 'docs/ADVENTURES_GUIDE.md'), 'utf8'); } catch (_) { return ''; }
})();
check(
  'docs/ADVENTURES_GUIDE.md exists',
  adventuresGuide.length > 0,
  'ADVENTURES_GUIDE.md not found — create docs/ADVENTURES_GUIDE.md',
);
check(
  'ADVENTURES_GUIDE.md documents trail chips',
  adventuresGuide.includes('Comece Aqui') && adventuresGuide.includes('FaithIcon'),
  'ADVENTURES_GUIDE.md missing trail chip documentation',
);

const uxPolishSrc10 = readSrc('docs/UX_POLISH_GUIDE.md');
check(
  'UX_POLISH_GUIDE.md updated to Sprint 10',
  uxPolishSrc10.includes('Sprint 10'),
  'UX_POLISH_GUIDE.md header not updated to Sprint 10',
);

// Protections intact
check(
  'StoryDetailScreen not broken (useProgress still present)',
  storyDetailSrc10.includes('useProgress'),
  'StoryDetailScreen broken — useProgress removed',
);
check(
  'StoryBookScreen not broken (advanceToNextScene still present)',
  storyBookSrc10.includes('advanceToNextScene'),
  'StoryBookScreen broken — advanceToNextScene removed',
);
check(
  'ProgressContext not broken (loadAllProgress still present)',
  progressCtxSrc10.includes('loadAllProgress'),
  'ProgressContext broken — loadAllProgress removed',
);
check(
  'rewardService not broken (getRewardsSummary still present)',
  rewardSvcSrc10.includes('getRewardsSummary') || rewardSvcSrc10.includes('export function getRewardsSummary'),
  'rewardService broken — getRewardsSummary removed',
);
check(
  'ENABLE_LOCAL_PREMIUM_TEST_MODE still false (Sprint 10)',
  acSrc10.includes('ENABLE_LOCAL_PREMIUM_TEST_MODE = false'),
  'ENABLE_LOCAL_PREMIUM_TEST_MODE is not false — premium gate bypassed',
);

// ── [431–458] Sprint 11 — Home, Lumi e Minhas Estrelinhas ───────────────────
console.log('\n── Sprint 11: Home, Lumi, Minhas Estrelinhas ──');

const homeSvcPath    = 'src/services/homeService.js';
const homeSvcSrc     = srcExists(homeSvcPath) ? readSrc(homeSvcPath) : '';
const homeSrc11      = readSrc('src/screens/HomeScreen.js');
const trophiesSrc11  = readSrc('src/screens/TrophiesScreen.js');
const appNavSrc11    = readSrc('src/navigation/AppNavigator.js');
const sidebarSrc11   = readSrc('src/components/TabletSidebar.js');
const achievDataSrc11 = readSrc('src/data/achievements.js');
const nextAdvSrc11   = readSrc('src/components/story/NextAdventureCard.js');
const lumiLockedSrc11 = readSrc('src/components/beni/BeniLockedState.js');
const acSrc11        = readSrc('src/services/accessControl.js');

// homeService.js
check(
  'homeService.js exists',
  srcExists(homeSvcPath),
  'src/services/homeService.js not found — pure primary action helper not created',
);
check(
  'homeService exports getHomePrimaryAction',
  homeSvcSrc.includes('export function getHomePrimaryAction'),
  'homeService.js missing export function getHomePrimaryAction',
);
check(
  'homeService has no AsyncStorage import (pure function)',
  !homeSvcSrc.includes('AsyncStorage'),
  'homeService.js imports AsyncStorage — must be a pure function with no storage reads',
);
check(
  'homeService has startFirstStory targetType',
  homeSvcSrc.includes("'startFirstStory'") || homeSvcSrc.includes('"startFirstStory"'),
  'homeService missing startFirstStory targetType',
);
check(
  'homeService has continueStory targetType',
  homeSvcSrc.includes("'continueStory'") || homeSvcSrc.includes('"continueStory"'),
  'homeService missing continueStory targetType',
);
check(
  'homeService has pendingRewards targetType',
  homeSvcSrc.includes("'pendingRewards'") || homeSvcSrc.includes('"pendingRewards"'),
  'homeService missing pendingRewards targetType',
);
check(
  'homeService has openAdventures targetType',
  homeSvcSrc.includes("'openAdventures'") || homeSvcSrc.includes('"openAdventures"'),
  'homeService missing openAdventures targetType',
);

// HomeScreen
check(
  'HomeScreen imports getHomePrimaryAction from homeService',
  homeSrc11.includes('getHomePrimaryAction') && homeSrc11.includes('homeService'),
  'HomeScreen does not import getHomePrimaryAction from homeService',
);
check(
  'HomeScreen has "Hoje com Beni" compact panel (Sprint Beni A++ 3.0)',
  homeSrc11.includes('Hoje com Beni') && homeSrc11.includes('HojeComBeni'),
  'HomeScreen missing "Hoje com Beni" compact panel — restructured in Sprint Beni A++ 3.0',
);
check(
  'HomeScreen uses primaryAction via useMemo',
  homeSrc11.includes('primaryAction') && homeSrc11.includes('useMemo'),
  'HomeScreen does not use primaryAction via useMemo',
);
check(
  'HomeScreen uses postStoryStatusByStory from ProgressContext',
  homeSrc11.includes('postStoryStatusByStory'),
  'HomeScreen missing postStoryStatusByStory from ProgressContext — pendingRewards scenario broken',
);
check(
  'HomeScreen has no standalone pendingRewardsStory state (integrated into primaryAction)',
  !homeSrc11.includes('setPendingRewardsStory') && !homeSrc11.includes('pendingRewardsStory,'),
  'HomeScreen still has standalone pendingRewardsStory state — pendingRewards not unified into primaryAction',
);

// TrophiesScreen
check(
  'TrophiesScreen title is "Álbum de Estrelinhas" (Sprint Beni A++ 3.0)',
  trophiesSrc11.includes('Álbum de Estrelinhas'),
  'TrophiesScreen title should be "Álbum de Estrelinhas" — renamed in Sprint Beni A++ 3.0',
);
check(
  'TrophiesScreen header uses FaithIcon star',
  trophiesSrc11.includes("FaithIcon") && trophiesSrc11.includes('name="star"'),
  'TrophiesScreen header does not use FaithIcon name="star" for Minhas Estrelinhas',
);
check(
  'TrophiesScreen AchievementCard locked state shows dimmed emoji (no FaithIcon lock in card)',
  trophiesSrc11.includes('cardEmojiDimmed') && !trophiesSrc11.includes('name="lock"'),
  'TrophiesScreen AchievementCard locked state still uses FaithIcon lock instead of dimmed emoji',
);
check(
  'TrophiesScreen has progressHint style for locked achievement progress',
  trophiesSrc11.includes('progressHint'),
  'TrophiesScreen missing progressHint style — no progress display in locked cards',
);
check(
  'TrophiesScreen passes ctx to AchievementCard',
  trophiesSrc11.includes('ctx={ctx}'),
  'TrophiesScreen does not pass ctx to AchievementCard — progress hints cannot render',
);

// AppNavigator + TabletSidebar
check(
  'AppNavigator tab is "Estrelinhas" (not "Conquistas")',
  appNavSrc11.includes("name: 'Estrelinhas'") && !appNavSrc11.includes("name: 'Conquistas'"),
  'AppNavigator still has "Conquistas" tab — should be renamed to "Estrelinhas"',
);
check(
  'TabletSidebar has "Estrelinhas" tab (not "Conquistas")',
  sidebarSrc11.includes("'Estrelinhas'") && !sidebarSrc11.includes("'Conquistas'"),
  'TabletSidebar TABS still has "Conquistas" — must match AppNavigator "Estrelinhas"',
);

// achievements.js language
check(
  'achievements.js has no "Primeiro passo premium" title (child-visible)',
  !achievDataSrc11.includes('Primeiro passo premium'),
  'achievements.js still has child-visible "Primeiro passo premium" — change to "Primeira aventura especial"',
);
check(
  'achievements.js has "Primeira aventura especial" as replacement title',
  achievDataSrc11.includes('Primeira aventura especial'),
  'achievements.js missing "Primeira aventura especial" replacement achievement title',
);
check(
  'achievements.js first_premium_story_done desc uses "Especial da Família" (not "trilha Premium")',
  achievDataSrc11.includes('Especial da Família') && !achievDataSrc11.includes('trilha Premium'),
  'achievements.js first_premium_story_done desc still says "trilha Premium"',
);
check(
  'achievements.js has at least 5 progressLabel functions',
  (achievDataSrc11.match(/progressLabel:/g) || []).length >= 5,
  'achievements.js has fewer than 5 progressLabel entries — progress hints under-implemented',
);

// Language sweep
check(
  'NextAdventureCard shows "Especial da Família" badge (not "Premium" as visible text)',
  nextAdvSrc11.includes('Especial da Família') && !nextAdvSrc11.includes('>Premium<'),
  'NextAdventureCard still shows "Premium" as visible badge text in child area',
);
check(
  'BeniLockedState default message uses "Plano Família" (not "plano premium")',
  lumiLockedSrc11.includes('Plano Família') && !lumiLockedSrc11.includes('plano premium'),
  'BeniLockedState default message still says "plano premium"',
);

// Docs
const homeLumiGuide = (() => {
  try { return fs.readFileSync(path.join(root, 'docs/HOME_LUMI_STARS_GUIDE.md'), 'utf8'); } catch (_) { return ''; }
})();
check(
  'docs/HOME_LUMI_STARS_GUIDE.md exists',
  homeLumiGuide.length > 0,
  'HOME_LUMI_STARS_GUIDE.md not found — create docs/HOME_LUMI_STARS_GUIDE.md',
);
check(
  'HOME_LUMI_STARS_GUIDE.md documents getHomePrimaryAction',
  homeLumiGuide.includes('getHomePrimaryAction'),
  'HOME_LUMI_STARS_GUIDE.md missing getHomePrimaryAction documentation',
);
check(
  'HOME_LUMI_STARS_GUIDE.md mentions Minhas Estrelinhas',
  homeLumiGuide.includes('Minhas Estrelinhas'),
  'HOME_LUMI_STARS_GUIDE.md missing Minhas Estrelinhas documentation',
);

// Protections
check(
  'ENABLE_LOCAL_PREMIUM_TEST_MODE still false (Sprint 11)',
  acSrc11.includes('ENABLE_LOCAL_PREMIUM_TEST_MODE = false'),
  'ENABLE_LOCAL_PREMIUM_TEST_MODE is not false — premium gate bypassed',
);

// ── [460–502] Sprint 13 — Celebrações, Área dos Pais, Estados Vazios ─────────
console.log('\n── Sprint 13: celebrações, ParentArea, estados vazios ──');

const achievModalSrc13   = srcExists('src/components/achievements/AchievementUnlockModal.js')
  ? readSrc('src/components/achievements/AchievementUnlockModal.js') : '';
const achievSeenSvcSrc13 = srcExists('src/services/achievementSeenService.js')
  ? readSrc('src/services/achievementSeenService.js') : '';
const celebHookSrc13     = srcExists('src/hooks/useAchievementCelebration.js')
  ? readSrc('src/hooks/useAchievementCelebration.js') : '';
const congrats13         = readSrc('src/screens/CongratsScreen.js');
const quiz13             = readSrc('src/screens/QuizScreen.js');
const storyBook13        = readSrc('src/screens/StoryBookScreen.js');
const parentArea13       = readSrc('src/screens/ParentAreaScreen.js');
const resetSvcSrc13      = srcExists('src/services/progressResetService.js')
  ? readSrc('src/services/progressResetService.js') : '';
const storeLinksSrc13    = srcExists('src/config/storeLinks.js')
  ? readSrc('src/config/storeLinks.js') : '';
const narration13        = readSrc('src/screens/NarrationScreen.js');
const trophies13         = readSrc('src/screens/TrophiesScreen.js');
const profile13          = readSrc('src/screens/ProfileScreen.js');
const acSrc13            = readSrc('src/services/accessControl.js');
const progCtxSrc13       = readSrc('src/context/ProgressContext.js');
const rewardSvcSrc13     = srcExists('src/services/rewardService.js')
  ? readSrc('src/services/rewardService.js') : '';
const storyBook13Audio   = storyBook13;
const audioPlayerSrc13   = readSrc('src/components/AudioPlayer.js');
const coloringCanvasSrc13 = readSrc('src/components/ColoringCanvas.js');
const atelierCanvasSrc13  = readSrc('src/components/AtelierCanvas.js');
const audioManifestSrc13  = readSrc('src/data/audioManifest.js');
const storiesDataSrc13    = readSrc('src/data/stories.js');

// [460] AchievementUnlockModal exists
check(
  'AchievementUnlockModal.js exists (Sprint 13)',
  srcExists('src/components/achievements/AchievementUnlockModal.js'),
  'src/components/achievements/AchievementUnlockModal.js not found — celebration modal not created',
);

// [461] AchievementUnlockModal has "Nova estrelinha acesa!" title
check(
  'AchievementUnlockModal title is "Nova estrelinha acesa! ✨"',
  achievModalSrc13.includes('Nova estrelinha acesa!'),
  'AchievementUnlockModal title is wrong — must say "Nova estrelinha acesa! ✨"',
);

// [462] AchievementUnlockModal does not grant stars (no star-grant calls)
check(
  'AchievementUnlockModal does not grant stars (no addBonusStars / grantStar)',
  !achievModalSrc13.includes('addBonusStars') && !achievModalSrc13.includes('grantStar') &&
  !achievModalSrc13.includes('setBonusStars') && !achievModalSrc13.includes('totalStars'),
  'AchievementUnlockModal calls a star-granting function — modal must ONLY celebrate, never grant stars',
);

// [463] AchievementUnlockModal has no XP reference (check uppercase XP / camelCase variants)
check(
  'AchievementUnlockModal has no XP reference',
  !achievModalSrc13.includes('totalXP') && !achievModalSrc13.includes('xpPercent') &&
  !achievModalSrc13.includes('animatedXP') && !achievModalSrc13.includes('STAR_XP') &&
  !achievModalSrc13.includes(' XP ') && !achievModalSrc13.includes('"XP"'),
  'AchievementUnlockModal contains XP reference — remove all XP language',
);

// [464] achievementSeenService.js exists
check(
  'achievementSeenService.js exists (Sprint 13)',
  srcExists('src/services/achievementSeenService.js'),
  'src/services/achievementSeenService.js not found',
);

// [465] achievementSeenService exports diffNewAchievements
check(
  'achievementSeenService exports diffNewAchievements',
  achievSeenSvcSrc13.includes('export function diffNewAchievements'),
  'achievementSeenService.js missing export function diffNewAchievements',
);

// [466] achievementSeenService exports silentlyMarkAllCurrentAsSeen
check(
  'achievementSeenService exports silentlyMarkAllCurrentAsSeen',
  achievSeenSvcSrc13.includes('export async function silentlyMarkAllCurrentAsSeen'),
  'achievementSeenService.js missing silentlyMarkAllCurrentAsSeen — first-run spam prevention not implemented',
);

// [467] achievementSeenService has no AsyncStorage.clear
check(
  'achievementSeenService has no AsyncStorage.clear',
  !achievSeenSvcSrc13.includes('AsyncStorage.clear'),
  'achievementSeenService.js calls AsyncStorage.clear — forbidden, use whitelist only',
);

// [468] useAchievementCelebration hook exists
check(
  'useAchievementCelebration hook exists (Sprint 13)',
  srcExists('src/hooks/useAchievementCelebration.js'),
  'src/hooks/useAchievementCelebration.js not found',
);

// [469] useAchievementCelebration exports the hook function
check(
  'useAchievementCelebration exports useAchievementCelebration',
  celebHookSrc13.includes('export function useAchievementCelebration'),
  'useAchievementCelebration.js missing export function useAchievementCelebration',
);

// [470] useAchievementCelebration has first-run protection (firstCheckRef)
check(
  'useAchievementCelebration has first-run spam prevention (firstCheckRef)',
  celebHookSrc13.includes('firstCheckRef'),
  'useAchievementCelebration missing firstCheckRef — existing users will be spammed with old achievement modals',
);

// [471] CongratsScreen uses useProgressContext (not legacy useProgress)
check(
  'CongratsScreen uses useProgressContext (Sprint 13 migration)',
  congrats13.includes('useProgressContext'),
  'CongratsScreen does not import useProgressContext — legacy hook migration incomplete',
);

// [472] CongratsScreen does not import legacy useProgress hook
check(
  'CongratsScreen does not use legacy useProgress hook',
  !congrats13.includes("from '../hooks/useProgress'") && !congrats13.includes('useProgress('),
  'CongratsScreen still imports/uses legacy useProgress hook — migration to useProgressContext incomplete',
);

// [473] CongratsScreen can trigger achievement celebration
check(
  'CongratsScreen imports and uses useAchievementCelebration',
  congrats13.includes('useAchievementCelebration') && congrats13.includes('checkForNewAchievements'),
  'CongratsScreen missing useAchievementCelebration — celebration not triggered after painting',
);

// [474] QuizScreen can trigger achievement celebration
check(
  'QuizScreen imports and uses useAchievementCelebration',
  quiz13.includes('useAchievementCelebration') && quiz13.includes('checkForNewAchievements'),
  'QuizScreen missing useAchievementCelebration — celebration not triggered after quiz',
);

// [475] StoryBookScreen can trigger achievement celebration
check(
  'StoryBookScreen imports and uses useAchievementCelebration',
  storyBook13.includes('useAchievementCelebration') && storyBook13.includes('checkForNewAchievements'),
  'StoryBookScreen missing useAchievementCelebration — celebration not triggered after livrinho',
);

// [476] ParentAreaScreen has "Progresso por história" section
check(
  'ParentAreaScreen has "Progresso por história" section (Sprint 13)',
  parentArea13.includes('Progresso por história'),
  'ParentAreaScreen missing "Progresso por história" section — per-story breakdown not added',
);

// [477] ParentAreaScreen has "Limpar progresso" section
check(
  'ParentAreaScreen has "Limpar progresso" section (Sprint 13)',
  parentArea13.includes('Limpar progresso'),
  'ParentAreaScreen missing "Limpar progresso" section — reset flow not added',
);

// [478] ParentAreaScreen has "Avaliar o app" section or equivalent
check(
  'ParentAreaScreen has "Avaliar o app" section (Sprint 13)',
  parentArea13.includes('Avaliar o app'),
  'ParentAreaScreen missing "Avaliar o app" section',
);

// [479] progressResetService.js exists
check(
  'progressResetService.js exists (Sprint 13)',
  srcExists('src/services/progressResetService.js'),
  'src/services/progressResetService.js not found — safe reset service not created',
);

// [480] progressResetService uses multiRemove whitelist (not AsyncStorage.clear())
check(
  'progressResetService uses AsyncStorage.multiRemove (not .clear)',
  resetSvcSrc13.includes('AsyncStorage.multiRemove') && !resetSvcSrc13.includes('AsyncStorage.clear()'),
  'progressResetService uses AsyncStorage.clear() — must use explicit whitelist with multiRemove',
);

// [481] progressResetService does NOT reset profile key
check(
  'progressResetService does not reset @ptf_profile',
  !resetSvcSrc13.includes('@ptf_profile'),
  'progressResetService includes @ptf_profile in whitelist — child profile must never be reset',
);

// [482] progressResetService does NOT reset atelier arts key
check(
  'progressResetService does not reset atelier arts keys',
  !resetSvcSrc13.includes('ptf_atelier_arts'),
  'progressResetService includes atelier arts key — drawings must never be reset with progress',
);

// [483] Reset requires typing "APAGAR" confirmation
check(
  'ParentAreaScreen reset requires typing "APAGAR" to confirm',
  parentArea13.includes("'APAGAR'") || parentArea13.includes('"APAGAR"'),
  'ParentAreaScreen reset does not require typing "APAGAR" — double confirmation not enforced',
);

// [484] storeLinks.js exists with null URLs
check(
  'storeLinks.js exists with null APP_STORE_URL and PLAY_STORE_URL (Sprint 13)',
  srcExists('src/config/storeLinks.js') &&
    storeLinksSrc13.includes('APP_STORE_URL = null') &&
    storeLinksSrc13.includes('PLAY_STORE_URL = null'),
  'storeLinks.js missing or does not have null store URLs — fake URLs must not be used',
);

// [485] Linking.openURL only called when URL is non-null (ParentAreaScreen)
check(
  'ParentAreaScreen Linking.openURL only called when storeUrl is non-null',
  parentArea13.includes('getStoreReviewUrl') && !parentArea13.includes("Linking.openURL(null)"),
  'ParentAreaScreen may call Linking.openURL with null — guard missing',
);

// [486] docs/MEDIA_PLACEHOLDER_GUIDE.md exists
const mediaPlaceholderGuide = (() => {
  try { return fs.readFileSync(path.join(root, 'docs/MEDIA_PLACEHOLDER_GUIDE.md'), 'utf8'); } catch (_) { return ''; }
})();
check(
  'docs/MEDIA_PLACEHOLDER_GUIDE.md exists (Sprint 13)',
  mediaPlaceholderGuide.length > 0,
  'MEDIA_PLACEHOLDER_GUIDE.md not found — create docs/MEDIA_PLACEHOLDER_GUIDE.md',
);

// [487] NarrationScreen shows gentle no-audio hint (not player-less silence)
check(
  'NarrationScreen shows no-audio hint when audio absent',
  narration13.includes('noAudioHint') && narration13.includes('O som desta cena será adicionado depois'),
  'NarrationScreen missing noAudioHint — audio absence not communicated gently to child',
);

// [488] NarrationScreen no-audio text has no technical words
check(
  'NarrationScreen no-audio text has no technical language (missing/error/null)',
  !narration13.includes('missing') && !narration13.includes('no audio file') &&
  !narration13.includes('error') && !narration13.includes('undefined'),
  'NarrationScreen no-audio text contains technical language forbidden in child UI',
);

// [489] TrophiesScreen has positive empty-state hint
check(
  'TrophiesScreen has positive empty-state hint when unlockedCount === 0',
  trophies13.includes('unlockedCount === 0') && trophies13.includes('Pinte sua primeira cena'),
  'TrophiesScreen missing positive empty-state hint — child sees blank screen with 0 achievements',
);

// [490] ProfileScreen default name is "Pequeno artista" (not "explorador")
check(
  'ProfileScreen default name is "Pequeno artista" (not "Pequeno explorador")',
  profile13.includes('Pequeno artista') && !profile13.includes('Pequeno explorador'),
  'ProfileScreen default name is still "Pequeno explorador" — must be "Pequeno artista"',
);

// [491] audioManifest: no hardcoded status literal (Sprint 13)
check(
  'audioManifest: no hardcoded status: "ready" literal (Sprint 13 — structural check)',
  !/status:\s*['"]ready['"]/.test(audioManifestSrc13),
  'audioManifest has a status: "ready" literal — use _readyEntries + AUDIO_STATUS.READY instead',
);

// [492] StoriesScreen still has 16:9 StoryCards (not broken by Sprint 13)
const storyCardSrc13 = readSrc('src/components/StoryCard.js');
check(
  'StoryCard cover still has aspectRatio 16/9 (Sprint 13 regression check)',
  storyCardSrc13.includes('aspectRatio: 16 / 9') || storyCardSrc13.includes('aspectRatio:16/9'),
  'StoryCard 16/9 aspect ratio broken — StoriesScreen regression',
);

// [493] StoryBookScreen still has onSceneAudioComplete (Sprint 13 regression check)
check(
  'StoryBookScreen still has onSceneAudioComplete (Sprint 13)',
  storyBook13Audio.includes('onSceneAudioComplete'),
  'StoryBookScreen onSceneAudioComplete removed — auto-advance livrinho broken',
);

// [494] StoryBookScreen still has advanceToNextScene (Sprint 13 regression check)
check(
  'StoryBookScreen still has advanceToNextScene (Sprint 13)',
  storyBook13Audio.includes('advanceToNextScene'),
  'StoryBookScreen advanceToNextScene removed — livrinho auto-advance broken',
);

// [495] AudioPlayer still has onFinished prop (Sprint 13 regression check)
check(
  'AudioPlayer still has onFinished prop (Sprint 13)',
  audioPlayerSrc13.includes('onFinished'),
  'AudioPlayer onFinished removed — livrinho audio auto-advance broken',
);

// [496] ColoringCanvas not altered (Sprint 13 regression check)
check(
  'ColoringCanvas exportPaint intact (Sprint 13)',
  coloringCanvasSrc13.includes('window.exportPaint=function'),
  'ColoringCanvas exportPaint removed — paint persistence broken by Sprint 13',
);

// [497] AtelierCanvas not altered (Sprint 13 regression check)
check(
  'AtelierCanvas previewBase64 intact (Sprint 13)',
  atelierCanvasSrc13.includes('previewBase64:previewData'),
  'AtelierCanvas previewBase64 removed — gallery viewer broken by Sprint 13',
);

// [498] ENABLE_LOCAL_PREMIUM_TEST_MODE still false (Sprint 13)
check(
  'ENABLE_LOCAL_PREMIUM_TEST_MODE still false (Sprint 13)',
  acSrc13.includes('ENABLE_LOCAL_PREMIUM_TEST_MODE = false'),
  'ENABLE_LOCAL_PREMIUM_TEST_MODE is not false — premium gate bypassed',
);

// [499] "A Criação" still free
check(
  'A Criação still free (Sprint 13)',
  storiesDataSrc13.includes("id: 'creation'") &&
    (() => {
      const idx = storiesDataSrc13.indexOf("id: 'creation'");
      const block = storiesDataSrc13.slice(idx, idx + 300);
      return !block.includes("premium: true");
    })(),
  '"A Criação" was made premium — must remain free',
);

// [500] Noé still free
check(
  'Noé still free (Sprint 13)',
  storiesDataSrc13.includes("id: 'noah'") &&
    (() => {
      const idx = storiesDataSrc13.indexOf("id: 'noah'");
      const block = storiesDataSrc13.slice(idx, idx + 300);
      return !block.includes("premium: true");
    })(),
  'Noé was made premium — must remain free',
);

// [501] ProgressContext still intact (Sprint 13 regression check)
check(
  'ProgressContext still has loadAllProgress (Sprint 13)',
  progCtxSrc13.includes('loadAllProgress'),
  'ProgressContext loadAllProgress removed — context broken by Sprint 13',
);

// [502] rewardService still pure — no AsyncStorage (Sprint 13 regression check)
check(
  'rewardService still has no AsyncStorage import (Sprint 13)',
  !rewardSvcSrc13.includes('AsyncStorage'),
  'rewardService.js now imports AsyncStorage — must remain a pure calculation service',
);

// ── [503–517] Sprint 14 — EAS Build readiness ────────────────────────────────
console.log('\n── Sprint 14: EAS Build readiness ──');

const easJson14 = (() => {
  try { return fs.readFileSync(path.join(root, 'eas.json'), 'utf8'); } catch (_) { return ''; }
})();
const appJson14 = (() => {
  try { return fs.readFileSync(path.join(root, 'app.json'), 'utf8'); } catch (_) { return ''; }
})();
const privacyPlugin14 = (() => {
  try { return fs.readFileSync(path.join(root, 'plugins/withPrivacyManifest.js'), 'utf8'); } catch (_) { return ''; }
})();
const pkgJson14 = (() => {
  try { return fs.readFileSync(path.join(root, 'package.json'), 'utf8'); } catch (_) { return ''; }
})();

check(
  'eas.json exists (Sprint 14)',
  easJson14.length > 0,
  'eas.json not found — run "eas build:configure" or create eas.json manually',
);
check(
  'eas.json has development profile',
  easJson14.includes('"development"'),
  'eas.json missing "development" build profile',
);
check(
  'eas.json has preview profile (internal distribution)',
  easJson14.includes('"preview"') && easJson14.includes('"internal"'),
  'eas.json missing "preview" profile with internal distribution',
);
check(
  'eas.json has production profile',
  easJson14.includes('"production"'),
  'eas.json missing "production" build profile',
);
check(
  'app.json has bundleIdentifier set',
  appJson14.includes('"bundleIdentifier"') && appJson14.includes('valentedev'),
  'app.json missing bundleIdentifier — iOS builds will fail',
);
check(
  'app.json has android package set',
  appJson14.includes('"package"') && appJson14.includes('valentedev'),
  'app.json missing android package — Android builds will fail',
);
check(
  'app.json has buildNumber (iOS)',
  appJson14.includes('"buildNumber"'),
  'app.json missing buildNumber — required for App Store submission',
);
check(
  'app.json has versionCode (Android)',
  appJson14.includes('"versionCode"'),
  'app.json missing versionCode — required for Play Store submission',
);
check(
  'app.json has usesNonExemptEncryption: false (iOS)',
  appJson14.includes('"usesNonExemptEncryption": false'),
  'app.json missing usesNonExemptEncryption: false — App Store submission blocked without this',
);
check(
  'app.json has deep link scheme',
  appJson14.includes('"scheme"'),
  'app.json missing scheme — deep linking not configured',
);
check(
  'app.json splash backgroundColor is not white (avoids white flash)',
  !appJson14.includes('"backgroundColor": "#ffffff"'),
  'splash backgroundColor is white — replace with app primary color to avoid flash on launch',
);
check(
  'app.json has native privacyManifests under ios (Sprint 15.1)',
  appJson14.includes('"privacyManifests"'),
  'app.json ios.privacyManifests missing — Privacy Manifest not configured via native Expo field',
);
check(
  'Privacy manifest custom plugin NOT registered in app.json (superseded by native)',
  !appJson14.includes('withPrivacyManifest'),
  'withPrivacyManifest custom plugin still registered — should use native expo.ios.privacyManifests instead',
);
check(
  'package.json has build:preview scripts (Sprint 14)',
  pkgJson14.includes('"build:preview"'),
  'package.json missing build:preview scripts',
);
check(
  'package.json has build:production scripts (Sprint 14)',
  pkgJson14.includes('"build:production"'),
  'package.json missing build:production scripts',
);

// ── [518–540] Sprint 15.1 — Build Readiness final adjustments ────────────────
console.log('\n── Sprint 15.1: Build Readiness final adjustments ──');

const appJson151    = appJson14;
const easJson151    = easJson14;
const pkgJson151    = pkgJson14;
const easGuide151   = (() => {
  try { return require('fs').readFileSync(require('path').join(root, 'docs/EAS_BUILD_GUIDE.md'), 'utf8'); } catch (_) { return ''; }
})();

// Privacy Manifest — CA92.1 reason
check(
  'app.json privacyManifests uses CA92.1 for UserDefaults (Sprint 15.1)',
  appJson151.includes('CA92.1'),
  'app.json privacyManifests does not use CA92.1 for NSPrivacyAccessedAPICategoryUserDefaults',
);
check(
  'app.json privacyManifests has NSPrivacyTracking: false',
  appJson151.includes('"NSPrivacyTracking": false'),
  'app.json privacyManifests missing NSPrivacyTracking: false — tracking status not declared',
);
check(
  'app.json has no NSUserTrackingUsageDescription (no tracking)',
  !appJson151.includes('NSUserTrackingUsageDescription'),
  'NSUserTrackingUsageDescription found in app.json — app should not track users',
);

// OTA — must be absent
check(
  'package.json has no expo-updates (OTA deferred to Sprint 16)',
  !pkgJson151.includes('expo-updates'),
  'expo-updates found in package.json — OTA not planned for this sprint',
);
check(
  'app.json has no updates.url (no OTA)',
  !appJson151.includes('updates.url'),
  'updates.url found in app.json — OTA not configured in this sprint',
);
check(
  'app.json has no runtimeVersion for OTA',
  !appJson151.includes('runtimeVersion'),
  'runtimeVersion found in app.json — OTA not configured in this sprint',
);
check(
  'eas.json build profiles have no channel (no OTA)',
  !/"channel"/.test(easJson151),
  'eas.json build profiles have channel — OTA not configured in this sprint',
);

// Submit scripts — must be absent
check(
  'package.json has no submit:ios script (Sprint 15.1)',
  !pkgJson151.includes('"submit:ios"'),
  'submit:ios script found in package.json — submit scripts deferred until store accounts ready',
);
check(
  'package.json has no submit:android script (Sprint 15.1)',
  !pkgJson151.includes('"submit:android"'),
  'submit:android script found in package.json — submit scripts deferred until store accounts ready',
);

// EAS guide — correct sprint and first-build order
check(
  'EAS_BUILD_GUIDE.md references Sprint 15 (not Sprint 14)',
  easGuide151.includes('Sprint 15') && !easGuide151.includes('Sprint 14 —'),
  'EAS_BUILD_GUIDE.md still references Sprint 14 — update header to Sprint 15',
);
check(
  'EAS_BUILD_GUIDE.md recommends Android as first build',
  easGuide151.includes('build:preview:android') && easGuide151.includes('PRIMEIRO BUILD'),
  'EAS_BUILD_GUIDE.md does not recommend Android preview as first build',
);

// Identifier consistency
check(
  'app.json bundleIdentifier matches com.valentedev.pequenostracosdefe',
  appJson151.includes('"bundleIdentifier": "com.valentedev.pequenostracosdefe"'),
  'app.json bundleIdentifier does not match expected value',
);
check(
  'app.json android.package matches com.valentedev.pequenostracosdefe',
  appJson151.includes('"package": "com.valentedev.pequenostracosdefe"'),
  'app.json android.package does not match expected value',
);

// Regression guards (Sprint 15.1 — confirm nothing broken)
check(
  'ENABLE_LOCAL_PREMIUM_TEST_MODE still false (Sprint 15.1)',
  readSrc('src/services/accessControl.js').includes('ENABLE_LOCAL_PREMIUM_TEST_MODE = false'),
  'ENABLE_LOCAL_PREMIUM_TEST_MODE is not false — premium gate bypassed',
);
check(
  'audioManifest: no hardcoded status: "ready" literal (Sprint 15.1 — structural check)',
  !/status:\s*['"]ready['"]/.test(readSrc('src/data/audioManifest.js')),
  'audioManifest has a status: "ready" literal — use _readyEntries + AUDIO_STATUS.READY instead',
);
check(
  'HomeScreen not broken — useProgressContext present (Sprint 15.1)',
  readSrc('src/screens/HomeScreen.js').includes('useProgressContext'),
  'HomeScreen broken — useProgressContext removed',
);
check(
  'StoriesScreen not broken — useProgressContext present (Sprint 15.1)',
  readSrc('src/screens/StoriesScreen.js').includes('useProgressContext'),
  'StoriesScreen broken — useProgressContext removed',
);
check(
  'StoryBookScreen still has onSceneAudioComplete (Sprint 15.1)',
  readSrc('src/screens/StoryBookScreen.js').includes('onSceneAudioComplete'),
  'StoryBookScreen onSceneAudioComplete removed',
);
check(
  'AudioPlayer still has onFinished (Sprint 15.1)',
  readSrc('src/components/AudioPlayer.js').includes('onFinished'),
  'AudioPlayer onFinished removed',
);
check(
  'ProgressContext still has loadAllProgress (Sprint 15.1)',
  readSrc('src/context/ProgressContext.js').includes('loadAllProgress'),
  'ProgressContext broken',
);
check(
  'rewardService still has no AsyncStorage import (Sprint 15.1)',
  !readSrc('src/services/rewardService.js').includes('AsyncStorage'),
  'rewardService imports AsyncStorage — must remain a pure calculation service',
);

// ── [539–562] Sprint 16 — Audio Pipeline Readiness ───────────────────────────
console.log('\n── Sprint 16: Audio Pipeline Readiness ──');

const manifestSrc16  = readSrc('src/data/audioManifest.js');
const audioSvcSrc16  = readSrc('src/services/audioService.js');
const audioPlayerSrc16 = readSrc('src/components/AudioPlayer.js');
const narrationSrc16 = readSrc('src/screens/NarrationScreen.js');
const storyBookSrc16 = readSrc('src/screens/StoryBookScreen.js');
const auditScriptSrc16 = readSrc('scripts/audio-audit.js');

// [539] AUDIO_PIPELINE_GUIDE.md exists
check(
  'AUDIO_PIPELINE_GUIDE.md exists',
  srcExists('docs/AUDIO_PIPELINE_GUIDE.md'),
  'docs/AUDIO_PIPELINE_GUIDE.md not found',
);

// [540] MEDIA_BUDGET_GUIDE.md exists
check(
  'MEDIA_BUDGET_GUIDE.md exists',
  srcExists('docs/MEDIA_BUDGET_GUIDE.md'),
  'docs/MEDIA_BUDGET_GUIDE.md not found',
);

// [541] audioManifest comment uses new path convention (no 'stories/' subdirectory)
check(
  "audioManifest comment uses correct path convention (no 'stories/' subfolder)",
  !manifestSrc16.includes("audio/stories/") && manifestSrc16.includes("assets/audio/{storyId}"),
  "audioManifest.js still references old 'audio/stories/' convention",
);

// [542] audioManifest has example entry comment with new naming convention
check(
  'audioManifest has example entry comment with {storyId}_scene_NN.mp3 naming',
  manifestSrc16.includes('creation_scene_01.mp3'),
  'audioManifest.js missing example entry showing {storyId}_scene_NN.mp3 naming',
);

// [543] audioManifest references AUDIO_PIPELINE_GUIDE.md
check(
  'audioManifest references AUDIO_PIPELINE_GUIDE.md',
  manifestSrc16.includes('AUDIO_PIPELINE_GUIDE.md'),
  'audioManifest.js does not reference AUDIO_PIPELINE_GUIDE.md',
);

// [544] audio-audit.js uses new path convention (no 'stories' subdir in audioDir)
check(
  "audio-audit.js uses new path (no 'audio/stories' directory)",
  !auditScriptSrc16.includes("audio', 'stories'") && auditScriptSrc16.includes("assets', 'audio'"),
  "audio-audit.js still references 'audio/stories' directory",
);

// [545] audio-audit.js filename includes storyId prefix ({storyId}_scene_XX.mp3)
check(
  'audio-audit.js filename pattern uses {storyId}_scene_XX.mp3',
  auditScriptSrc16.includes('`${storyId}_${sceneKey}.mp3`') ||
    auditScriptSrc16.includes("storyId}_${sceneKey}.mp3"),
  'audio-audit.js does not use {storyId}_{sceneKey}.mp3 naming pattern',
);

// [546] audio-audit.js has integrity check for broken require() paths
check(
  'audio-audit.js has integrity check for broken require() paths',
  auditScriptSrc16.includes('brokenRequires') || auditScriptSrc16.includes('INTEGRITY ERROR'),
  'audio-audit.js missing require() integrity check',
);

// [547] All 20 story audio folders exist
const expectedFolders = [
  'creation', 'noah', 'david_goliath', 'jesus_children', 'daniel_lions',
  'jonah_big_fish', 'lost_sheep', 'good_samaritan', 'abraham_stars',
  'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi', 'esther_queen',
  'miraculous_catch', 'samuel_hears_god', 'josiah_young_king', 'solomon_wisdom',
  'mary_says_yes', 'timothy_faith', 'jesus_temple',
];
const missingFolders = expectedFolders.filter(
  id => !srcExists(`assets/audio/${id}`)
);
check(
  `All 20 story audio folders exist in assets/audio/ (found ${expectedFolders.length - missingFolders.length}/20)`,
  missingFolders.length === 0,
  `Missing: ${missingFolders.join(', ')}`,
);

// [548] audioManifest _readyEntries integrity: require() paths exist on disk
const _s16ReadySection = manifestSrc16.split('const _readyEntries')[1]?.split('];')[0] ?? '';
const _s16RequirePaths = [..._s16ReadySection.matchAll(/require\(['"](.*?)['"]\)/g)].map(m => m[1]);
const _s16BrokenPaths = _s16RequirePaths.filter(
  p => !fs.existsSync(path.join(root, p.replace(/^\.\.\/\.\.\//, '')))
);
check(
  `audioManifest integrity: all require() paths exist on disk (${_s16RequirePaths.length} checked)`,
  _s16BrokenPaths.length === 0,
  `Broken paths: ${_s16BrokenPaths.join(', ')}`,
);

// [549] audioService exports getStoryAudioSequence (Livrinho uses this)
check(
  'audioService exports getStoryAudioSequence',
  audioSvcSrc16.includes('export function getStoryAudioSequence'),
  'audioService.js missing getStoryAudioSequence — Livrinho auto-play depends on this',
);

// [550] audioService exports getAudioLaunchReadiness
check(
  'audioService exports getAudioLaunchReadiness',
  audioSvcSrc16.includes('export function getAudioLaunchReadiness'),
  'audioService.js missing getAudioLaunchReadiness',
);

// [551] AudioPlayer has onFinished prop (auto-advance chain intact)
check(
  'AudioPlayer has onFinished prop',
  audioPlayerSrc16.includes('onFinished'),
  'AudioPlayer.js missing onFinished prop — auto-advance chain broken',
);

// [552] AudioPlayer has no setInterval (no fake timers)
check(
  'AudioPlayer has no setInterval (no fake progress timer)',
  !audioPlayerSrc16.includes('setInterval'),
  'AudioPlayer.js uses setInterval — fake timer must not be present',
);

// [553] AudioPlayer returns null when audioAsset is null (guard pattern intact)
check(
  'AudioPlayer returns null when audioAsset is null (outer guard)',
  audioPlayerSrc16.includes('if (!audioAsset) return null'),
  'AudioPlayer.js missing null guard — would render broken player when no audio',
);

// [554] NarrationScreen shows noAudioHint when scene has no audio
check(
  'NarrationScreen shows noAudioHint when no audio available',
  narrationSrc16.includes('noAudioHint'),
  'NarrationScreen.js missing noAudioHint — empty state for missing audio removed',
);

// [555] StoryBookScreen has onSceneAudioComplete → advanceToNextScene chain
check(
  'StoryBookScreen has onSceneAudioComplete → advanceToNextScene chain',
  storyBookSrc16.includes('onSceneAudioComplete') && storyBookSrc16.includes('advanceToNextScene'),
  'StoryBookScreen.js missing auto-advance chain',
);

// [556] StoryBookScreen resets AudioPlayer per slide (key changes each slide)
check(
  'StoryBookScreen resets AudioPlayer per slide',
  storyBookSrc16.includes('key={slideKey}'),
  'StoryBookScreen.js missing per-slide key on AudioPlayer — player state may not reset between slides',
);

// [557] audioManifest has no remote URLs (must remain local)
check(
  'audioManifest has no remote URLs',
  !/https?:\/\//.test(manifestSrc16),
  'Remote URL found in audioManifest.js — audio must be local bundled assets only',
);

// [558] ENABLE_LOCAL_PREMIUM_TEST_MODE still false (Sprint 16 regression)
check(
  'ENABLE_LOCAL_PREMIUM_TEST_MODE still false (Sprint 16)',
  readSrc('src/services/accessControl.js').includes('ENABLE_LOCAL_PREMIUM_TEST_MODE = false'),
  'ENABLE_LOCAL_PREMIUM_TEST_MODE is not false — premium gate bypassed',
);

// [559] ColoringCanvas not touched (approved screen guard)
check(
  'ColoringCanvas not broken — BFS threshold 210 intact (Sprint 16)',
  readSrc('src/components/ColoringCanvas.js').includes('210'),
  'ColoringCanvas.js appears modified — BFS threshold 210 not found',
);

// [560] AtelierCanvas not touched (approved screen guard)
check(
  'AtelierCanvas not broken — previewBase64 intact (Sprint 16)',
  readSrc('src/components/AtelierCanvas.js').includes('previewBase64'),
  'AtelierCanvas.js appears modified — previewBase64 not found',
);

// [561] No expo-updates installed
check(
  'expo-updates NOT installed (Sprint 16)',
  !JSON.parse(readSrc('package.json')).dependencies?.['expo-updates'],
  'expo-updates was installed — OTA must remain disabled',
);

// [562] AUDIO_GUIDE.md updated to new path convention
check(
  "AUDIO_GUIDE.md updated to new path convention (no 'stories/' subfolder)",
  !readSrc('docs/AUDIO_GUIDE.md').includes("audio/stories/"),
  "AUDIO_GUIDE.md still references old 'audio/stories/' path",
);

// ── [563–582] Sprint 16.0.1 — Audio Pipeline Hardening ───────────────────────
console.log('\n── Sprint 16.0.1: Audio Pipeline Hardening ──');

// [563] FIRST_AUDIO_PILOT_CHECKLIST.md exists
check(
  'FIRST_AUDIO_PILOT_CHECKLIST.md exists',
  srcExists('docs/FIRST_AUDIO_PILOT_CHECKLIST.md'),
  'docs/FIRST_AUDIO_PILOT_CHECKLIST.md not found',
);

// [564] BUILD_SIZE_LOG.md exists
check(
  'BUILD_SIZE_LOG.md exists',
  srcExists('docs/BUILD_SIZE_LOG.md'),
  'docs/BUILD_SIZE_LOG.md not found',
);

// [565] audio-audit self-test script exists
check(
  'audio-audit-self-test.js exists',
  srcExists('scripts/audio-audit-self-test.js'),
  'scripts/audio-audit-self-test.js not found',
);

// [566] package.json has audio:audit:self-test script
check(
  'package.json has audio:audit:self-test script',
  readSrc('package.json').includes('"audio:audit:self-test"'),
  'audio:audit:self-test script missing from package.json',
);

// [567] No doc uses assets/audio/stories/ as current convention
const storyBookGuide = readSrc('docs/STORYBOOK_GUIDE.md');
check(
  "STORYBOOK_GUIDE.md uses new path convention (no 'audio/stories/')",
  !storyBookGuide.includes('audio/stories/'),
  "STORYBOOK_GUIDE.md still references old 'audio/stories/' convention",
);

// [568] STORYBOOK_GUIDE.md does not use incorrect entry format with status: 'ready' in _readyEntries doc
check(
  "STORYBOOK_GUIDE.md entry format does not include status: 'ready' in _readyEntries",
  !storyBookGuide.includes("status: 'ready'"),
  "STORYBOOK_GUIDE.md shows status: 'ready' in entry format — entries should not include status field",
);

// [569] MEDIA_PLACEHOLDER_GUIDE.md does not say 0/200 must be permanent
const mediaPlaceholderSrc = readSrc('docs/MEDIA_PLACEHOLDER_GUIDE.md');
check(
  "MEDIA_PLACEHOLDER_GUIDE.md does not mandate permanent 0/200 ready",
  !mediaPlaceholderSrc.includes('deve continuar reportando `0/200 ready`'),
  "MEDIA_PLACEHOLDER_GUIDE.md still says audio:audit must always report 0/200 ready — update to gradual delivery",
);

// [570] MEDIA_BUDGET_GUIDE.md has risk alert for high audio count
const mediaBudgetSrc = readSrc('docs/MEDIA_BUDGET_GUIDE.md');
check(
  'MEDIA_BUDGET_GUIDE.md has risk alert for 80+ audio files',
  mediaBudgetSrc.includes('80') && mediaBudgetSrc.includes('CDN'),
  'MEDIA_BUDGET_GUIDE.md missing risk alert for growing audio count',
);

// [571] BUILD_SIZE_LOG.md has threshold table
check(
  'BUILD_SIZE_LOG.md has size threshold table',
  readSrc('docs/BUILD_SIZE_LOG.md').includes('130 MB'),
  'BUILD_SIZE_LOG.md missing size threshold guidance',
);

// [572] EAS_BUILD_GUIDE.md smoke count updated (no longer says '517+/517')
check(
  "EAS_BUILD_GUIDE.md smoke count not stale (no '517+/517' reference)",
  !readSrc('docs/EAS_BUILD_GUIDE.md').includes('517+/517'),
  "EAS_BUILD_GUIDE.md still has stale smoke count '517+/517'",
);

// [573] audio-audit-self-test.js has 'stories/' path test (scenario 09)
check(
  "audio-audit-self-test.js validates 'stories/' path is rejected",
  readSrc('scripts/audio-audit-self-test.js').includes("stories/"),
  "audio-audit-self-test.js missing test for old 'stories/' path convention",
);

// [574] audio-audit-self-test.js tests zero-padding (scene1 vs scene_01)
check(
  'audio-audit-self-test.js validates zero-padding in scene key',
  readSrc('scripts/audio-audit-self-test.js').includes('creation_scene1.mp3'),
  'audio-audit-self-test.js missing zero-padding test',
);

// [575] FIRST_AUDIO_PILOT_CHECKLIST.md mentions creation_scene_01.mp3 (correct name)
const pilotChecklistSrc = readSrc('docs/FIRST_AUDIO_PILOT_CHECKLIST.md');
check(
  'FIRST_AUDIO_PILOT_CHECKLIST.md has correct filename creation_scene_01.mp3',
  pilotChecklistSrc.includes('creation_scene_01.mp3'),
  'FIRST_AUDIO_PILOT_CHECKLIST.md missing or has wrong filename for pilot audio',
);

// [576] FIRST_AUDIO_PILOT_CHECKLIST.md mentions NarrationScreen test step
check(
  'FIRST_AUDIO_PILOT_CHECKLIST.md covers NarrationScreen test',
  pilotChecklistSrc.includes('NarrationScreen'),
  'FIRST_AUDIO_PILOT_CHECKLIST.md missing NarrationScreen test section',
);

// [577] FIRST_AUDIO_PILOT_CHECKLIST.md covers StoryBookScreen mixed-scene test
check(
  'FIRST_AUDIO_PILOT_CHECKLIST.md covers StoryBookScreen mixed-scene test',
  pilotChecklistSrc.includes('StoryBookScreen') && pilotChecklistSrc.includes('auto-avan'),
  'FIRST_AUDIO_PILOT_CHECKLIST.md missing StoryBookScreen mixed-scene test',
);

// [578] No doc warns of "permanent 0/200" as a rule (audit docs are consistent)
const audioGuide578 = readSrc('docs/AUDIO_GUIDE.md');
check(
  "AUDIO_GUIDE.md does not mandate permanent 0/200 ready",
  !audioGuide578.includes('deve continuar reportando') && !audioGuide578.includes('always 0'),
  "AUDIO_GUIDE.md mandates 0/200 as permanent — update to reflect gradual delivery",
);

// [579] audioManifest comment references AUDIO_PIPELINE_GUIDE (not old AUDIO_GUIDE)
check(
  'audioManifest.js references AUDIO_PIPELINE_GUIDE.md (not old AUDIO_GUIDE.md as primary)',
  readSrc('src/data/audioManifest.js').includes('AUDIO_PIPELINE_GUIDE.md'),
  'audioManifest.js does not reference AUDIO_PIPELINE_GUIDE.md',
);

// [580] audio-audit.js has no 'stories' directory in scan path
check(
  "audio-audit.js scan path has no 'stories' subdirectory",
  !readSrc('scripts/audio-audit.js').includes("'stories'"),
  "audio-audit.js still references 'stories' in scan path",
);

// [581] AUDIO_PIPELINE_GUIDE.md mentions what NOT to do (Sprint 16.1 scope)
check(
  'AUDIO_PIPELINE_GUIDE.md has rules section (what NOT to do)',
  readSrc('docs/AUDIO_PIPELINE_GUIDE.md').includes('Regras absolutas'),
  'AUDIO_PIPELINE_GUIDE.md missing rules/constraints section',
);

// [582] FIRST_AUDIO_PILOT_CHECKLIST.md has "O QUE NÃO FAZER" section
check(
  'FIRST_AUDIO_PILOT_CHECKLIST.md has "O QUE NÃO FAZER" section',
  pilotChecklistSrc.includes('NÃO FAZER'),
  'FIRST_AUDIO_PILOT_CHECKLIST.md missing "O QUE NÃO FAZER" section',
);

// ── [583–600] Sprint 17.0 — Production Foundation ────────────────────────────
console.log('\n── Sprint 17.0: Production Foundation ──');

// [583] logger.js exists
check(
  'src/utils/logger.js exists',
  srcExists('src/utils/logger.js'),
  'src/utils/logger.js not found — centralized logger missing',
);

const loggerSrc = readSrc('src/utils/logger.js');

// [584] logger exports log, warn, error
check(
  'logger.js exports log, warn and error functions',
  loggerSrc.includes('export function log') &&
  loggerSrc.includes('export function warn') &&
  loggerSrc.includes('export function error'),
  'logger.js missing one of: log, warn, error exports',
);

// [585] logger guards all calls with __DEV__
check(
  'logger.js guards all calls with __DEV__',
  loggerSrc.includes('if (__DEV__)'),
  'logger.js does not guard with __DEV__ — logs will leak in production',
);

// [586] useProgress uses logger not raw console.log
check(
  'useProgress.js uses logger (no bare console.log)',
  !readSrc('src/hooks/useProgress.js').includes("console.log('useProgress"),
  'useProgress.js still has bare console.log — use logger instead',
);

// [587] achievementsStorage uses logger
check(
  'achievementsStorage.js uses logger (no bare console.log)',
  !readSrc('src/services/achievementsStorage.js').includes("console.log('achievements"),
  'achievementsStorage.js still has bare console.log',
);

// [588] drawingStorage uses logger
check(
  'drawingStorage.js uses logger (no bare console.log)',
  !readSrc('src/services/drawingStorage.js').includes("console.log('drawing"),
  'drawingStorage.js still has bare console.log',
);

// [589] atelierStorage uses logger
check(
  'atelierStorage.js uses logger (no bare console.log)',
  !readSrc('src/services/atelierStorage.js').includes("console.log('atelier"),
  'atelierStorage.js still has bare console.log',
);

// [590] ProfileContext uses logger
check(
  'ProfileContext.js uses logger (no bare console.log)',
  !readSrc('src/context/ProfileContext.js').includes("console.log('ProfileContext"),
  'ProfileContext.js still has bare console.log',
);

// [591] ProgressContext uses logger/warn (no bare console.warn)
check(
  'ProgressContext.js uses logger (no bare console.warn)',
  !readSrc('src/context/ProgressContext.js').includes("console.warn('ProgressContext"),
  'ProgressContext.js still has bare console.warn',
);

// [592] docs/legal/ folder has PRIVACY_POLICY_DRAFT.md
check(
  'docs/legal/PRIVACY_POLICY_DRAFT.md exists',
  srcExists('docs/legal/PRIVACY_POLICY_DRAFT.md'),
  'docs/legal/PRIVACY_POLICY_DRAFT.md not found — privacy policy draft missing',
);

// [593] docs/legal/ folder has TERMS_OF_USE_DRAFT.md
check(
  'docs/legal/TERMS_OF_USE_DRAFT.md exists',
  srcExists('docs/legal/TERMS_OF_USE_DRAFT.md'),
  'docs/legal/TERMS_OF_USE_DRAFT.md not found — terms of use draft missing',
);

// [594] docs/legal/ has CHILD_DATA_MATRIX.md
check(
  'docs/legal/CHILD_DATA_MATRIX.md exists',
  srcExists('docs/legal/CHILD_DATA_MATRIX.md'),
  'docs/legal/CHILD_DATA_MATRIX.md not found — LGPD child data matrix missing',
);

// [595] docs/legal/ has STORE_COMPLIANCE_CHECKLIST.md
check(
  'docs/legal/STORE_COMPLIANCE_CHECKLIST.md exists',
  srcExists('docs/legal/STORE_COMPLIANCE_CHECKLIST.md'),
  'docs/legal/STORE_COMPLIANCE_CHECKLIST.md not found',
);

// [596] docs/PRODUCTION_FLAGS_CHECKLIST.md exists
check(
  'docs/PRODUCTION_FLAGS_CHECKLIST.md exists',
  srcExists('docs/PRODUCTION_FLAGS_CHECKLIST.md'),
  'docs/PRODUCTION_FLAGS_CHECKLIST.md not found',
);

// [597] docs/SECRETS_AUDIT.md exists
check(
  'docs/SECRETS_AUDIT.md exists',
  srcExists('docs/SECRETS_AUDIT.md'),
  'docs/SECRETS_AUDIT.md not found',
);

// [598] Privacy policy mentions LGPD and crianças
const privacyDraft = readSrc('docs/legal/PRIVACY_POLICY_DRAFT.md');
check(
  'PRIVACY_POLICY_DRAFT.md covers LGPD and crianças',
  privacyDraft.includes('LGPD') && privacyDraft.includes('crian'),
  'PRIVACY_POLICY_DRAFT.md missing LGPD or crianças coverage',
);

// [599] ParentAreaScreen has Restore Purchase button (not just static text)
const parentAreaSrc = readSrc('src/screens/ParentAreaScreen.js');
check(
  'ParentAreaScreen has interactive Restore Purchase (restoreState)',
  parentAreaSrc.includes('restoreState') && parentAreaSrc.includes('handleRestorePurchase'),
  'ParentAreaScreen missing interactive Restore Purchase — still static text only',
);

// [600] AudioPlayer has accessibilityLabel on play button
const audioPlayerFinalSrc = readSrc('src/components/AudioPlayer.js');
check(
  'AudioPlayer play button has accessibilityLabel',
  audioPlayerFinalSrc.includes('accessibilityLabel') && audioPlayerFinalSrc.includes('narração'),
  'AudioPlayer play button missing accessibilityLabel',
);

// ── [601–620] Sprint 18.0 — Release Readiness & Asset Pipeline ───────────────
console.log('\n── Sprint 18.0: Release Readiness & Asset Pipeline ──');

// [601] scripts/audit-assets.js exists
check(
  'scripts/audit-assets.js exists',
  srcExists('scripts/audit-assets.js'),
  'scripts/audit-assets.js not found — asset pipeline missing',
);

// [602] scripts/validate-audio-assets.js exists
check(
  'scripts/validate-audio-assets.js exists',
  srcExists('scripts/validate-audio-assets.js'),
  'scripts/validate-audio-assets.js not found',
);

// [603] scripts/validate-image-assets.js exists
check(
  'scripts/validate-image-assets.js exists',
  srcExists('scripts/validate-image-assets.js'),
  'scripts/validate-image-assets.js not found',
);

// [604] scripts/report-image-sizes.js exists
check(
  'scripts/report-image-sizes.js exists',
  srcExists('scripts/report-image-sizes.js'),
  'scripts/report-image-sizes.js not found',
);

// [605] docs/EXPECTED_ASSETS_MANIFEST.md exists
check(
  'docs/EXPECTED_ASSETS_MANIFEST.md exists',
  srcExists('docs/EXPECTED_ASSETS_MANIFEST.md'),
  'docs/EXPECTED_ASSETS_MANIFEST.md not found',
);

// [606] docs/ASSET_PIPELINE_GUIDE.md exists
check(
  'docs/ASSET_PIPELINE_GUIDE.md exists',
  srcExists('docs/ASSET_PIPELINE_GUIDE.md'),
  'docs/ASSET_PIPELINE_GUIDE.md not found',
);

// [607] docs/IMAGE_COMPRESSION_STRATEGY.md exists
check(
  'docs/IMAGE_COMPRESSION_STRATEGY.md exists',
  srcExists('docs/IMAGE_COMPRESSION_STRATEGY.md'),
  'docs/IMAGE_COMPRESSION_STRATEGY.md not found',
);

// [608] docs/STORE_RELEASE_READINESS_CHECKLIST.md exists
check(
  'docs/STORE_RELEASE_READINESS_CHECKLIST.md exists',
  srcExists('docs/STORE_RELEASE_READINESS_CHECKLIST.md'),
  'docs/STORE_RELEASE_READINESS_CHECKLIST.md not found',
);

// [609] docs/LEGAL_PUBLICATION_GUIDE.md exists
check(
  'docs/LEGAL_PUBLICATION_GUIDE.md exists',
  srcExists('docs/LEGAL_PUBLICATION_GUIDE.md'),
  'docs/LEGAL_PUBLICATION_GUIDE.md not found',
);

// [610] docs/BUILD_PRODUCTION_AUDIT.md exists
check(
  'docs/BUILD_PRODUCTION_AUDIT.md exists',
  srcExists('docs/BUILD_PRODUCTION_AUDIT.md'),
  'docs/BUILD_PRODUCTION_AUDIT.md not found',
);

// [611] docs/PERFORMANCE_ACTION_PLAN.md exists
check(
  'docs/PERFORMANCE_ACTION_PLAN.md exists',
  srcExists('docs/PERFORMANCE_ACTION_PLAN.md'),
  'docs/PERFORMANCE_ACTION_PLAN.md not found',
);

// [612] All 20 audio folders exist in assets/audio/
(function() {
  let src = '';
  try { src = fs.readFileSync(path.join(root, 'src', 'data', 'stories.js'), 'utf8'); } catch { return; }
  src = src.replace(/^export\s+const\s+(\w+)\s*=/, 'const $1 =');
  try {
    const fn18 = new Function('module', 'exports', src + '\nmodule.exports={stories};');
    const mod18 = { exports: {} };
    fn18(mod18, mod18.exports);
    const { stories: s18 } = mod18.exports;
    const allFoldersExist = s18.every(s => {
      const fp = path.join(root, 'assets', 'audio', s.id);
      return fs.existsSync(fp);
    });
    check(
      'All 20 audio folders exist in assets/audio/',
      allFoldersExist,
      'One or more audio folders missing — run: mkdir assets/audio/{storyId}',
    );
  } catch(e) {
    fail('Could not verify audio folders: ' + e.message);
  }
})();

// [613] coloringImages.js has no broken require() (critical check)
(function() {
  const imgSrc = readSrc('src/assets/coloringImages.js');
  const imgDir = path.join(root, 'src', 'assets');
  const requires = [...imgSrc.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  const brokenCount = requires.filter(req => {
    const abs = path.resolve(imgDir, req);
    return !fs.existsSync(abs);
  }).length;
  check(
    'coloringImages.js has no broken require() paths',
    brokenCount === 0,
    `${brokenCount} broken require() in coloringImages.js — files missing from disk`,
  );
})();

// [614] audioManifest.js _readyEntries only has require() for files that exist
(function() {
  const mSrc = readSrc('src/data/audioManifest.js');
  // Strip comments before finding requires
  const stripped = mSrc
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  const mDir = path.join(root, 'src', 'data');
  const requires = [...stripped.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  const broken = requires.filter(req => !fs.existsSync(path.resolve(mDir, req)));
  check(
    'audioManifest.js _readyEntries require() paths all exist on disk',
    broken.length === 0,
    `${broken.length} broken require() in audioManifest.js: ${broken.join(', ')}`,
  );
})();

// [615] No bare console.log in src/screens (except guarded by __DEV__ or logger)
// Considers: lines with [DEV] prefix, lines inside if(__DEV__) blocks, and console.warn with __DEV__
(function() {
  const screenFiles = fs.readdirSync(path.join(root, 'src', 'screens'))
    .filter(f => f.endsWith('.js'))
    .map(f => path.join(root, 'src', 'screens', f));
  const bareLogs = screenFiles.filter(fp => {
    const content = fs.readFileSync(fp, 'utf8');
    const lines = content.split('\n');
    return lines.some((line, idx) => {
      const trimmed = line.trim();
      const isConsoleCall = /^\s*console\.(log|warn|error)\(/.test(line);
      if (!isConsoleCall) return false;
      // OK if line itself contains __DEV__ check
      if (line.includes('__DEV__')) return false;
      // OK if line contains [DEV] tag (dev-only helper)
      if (line.includes('[DEV]') || line.includes('[DEV ')) return false;
      // OK if previous line has __DEV__ guard
      const prevLine = idx > 0 ? lines[idx - 1] : '';
      if (prevLine.includes('__DEV__') || prevLine.includes('if (!__DEV__)')) return false;
      return true;
    });
  }).map(fp => path.basename(fp));
  check(
    'No bare console.log/warn in src/screens/ (without __DEV__ guard)',
    bareLogs.length === 0,
    `Bare console calls in screens: ${bareLogs.join(', ')} — use logger.js or wrap with if(__DEV__)`,
  );
})();

// [616] Store checklist exists and mentions Apple and Google
const storeChecklistSrc = readSrc('docs/STORE_RELEASE_READINESS_CHECKLIST.md');
check(
  'STORE_RELEASE_READINESS_CHECKLIST.md covers Apple and Google',
  storeChecklistSrc.includes('Apple') && storeChecklistSrc.includes('Google'),
  'STORE_RELEASE_READINESS_CHECKLIST.md missing Apple or Google section',
);

// [617] EXPECTED_ASSETS_MANIFEST.md mentions all 20 story IDs
(function() {
  const manifestContent = readSrc('docs/EXPECTED_ASSETS_MANIFEST.md');
  const expectedIds = ['creation','noah','david_goliath','jesus_children','daniel_lions',
    'jonah_big_fish','lost_sheep','good_samaritan','abraham_stars','joseph_colorful_coat',
    'moses_red_sea','ruth_naomi','esther_queen','miraculous_catch','samuel_hears_god',
    'josiah_young_king','solomon_wisdom','mary_says_yes','timothy_faith','jesus_temple'];
  const missingIds = expectedIds.filter(id => !manifestContent.includes(id));
  check(
    'EXPECTED_ASSETS_MANIFEST.md contains all 20 story IDs',
    missingIds.length === 0,
    `Missing story IDs in manifest: ${missingIds.join(', ')}`,
  );
})();

// [618] ColoringScreen has fallback for missing imageSource (no white screen)
check(
  'ColoringScreen has fallback for missing coloring image (no white screen)',
  readSrc('src/screens/ColoringScreen.js').includes('missingContainer') &&
  readSrc('src/screens/ColoringScreen.js').includes('caminho'),
  'ColoringScreen missing fallback for absent coloring image',
);

// [619] ASSET_PIPELINE_GUIDE.md mentions audioManifest.js workflow
check(
  'ASSET_PIPELINE_GUIDE.md covers audioManifest.js workflow',
  readSrc('docs/ASSET_PIPELINE_GUIDE.md').includes('audioManifest') &&
  readSrc('docs/ASSET_PIPELINE_GUIDE.md').includes('_readyEntries'),
  'ASSET_PIPELINE_GUIDE.md missing audioManifest.js workflow',
);

// [620] No stale 'stories/' path in audio folder references (normalized paths only)
check(
  'Audio folder structure uses storyId directly (no stories/ subdirectory)',
  !readSrc('src/data/audioManifest.js').includes("assets/audio/stories/"),
  'audioManifest.js references deprecated stories/ subdirectory in audio path',
);

// ── Sprint Histórias 4.0 — base oficial de ilustrações por cena ──────────────
const sceneManifestSrc = readSrc('src/data/storySceneIllustrations.js');
const STORY_IDS_40 = [
  'creation', 'noah', 'david_goliath', 'jesus_children', 'daniel_lions',
  'jonah_big_fish', 'lost_sheep', 'good_samaritan', 'abraham_stars',
  'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi', 'esther_queen',
  'miraculous_catch', 'samuel_hears_god', 'josiah_young_king', 'solomon_wisdom',
  'mary_says_yes', 'timothy_faith', 'jesus_temple',
];

check(
  'src/data/storySceneIllustrations.js exists with all 20 story IDs + getter',
  STORY_IDS_40.every(id => new RegExp(`\\b${id}\\s*:\\s*\\{`).test(sceneManifestSrc)) &&
  sceneManifestSrc.includes('export function getSceneIllustrationAsset'),
  'storySceneIllustrations.js (src/data) missing some story IDs or getSceneIllustrationAsset',
);

check(
  'storyImageService imports manifest from src/data (single source of truth)',
  readSrc('src/services/storyImageService.js').includes("from '../data/storySceneIllustrations'"),
  'storyImageService no longer points to src/data/storySceneIllustrations',
);

check(
  'storyImageService exposes getOfficialSceneIllustration + getBestStoryBookVisual',
  readSrc('src/services/storyImageService.js').includes('export function getOfficialSceneIllustration') &&
  readSrc('src/services/storyImageService.js').includes('export function getBestStoryBookVisual'),
  'storyImageService missing getOfficialSceneIllustration / getBestStoryBookVisual',
);

check(
  'StorySceneVisual keeps both seals (Cena ilustrada / Cena especial)',
  readSrc('src/components/story/StorySceneVisual.js').includes('Cena ilustrada') &&
  readSrc('src/components/story/StorySceneVisual.js').includes('Cena especial'),
  'StorySceneVisual missing official/ambiance seals',
);

check(
  'scene:images:audit script + npm command + guide exist',
  srcExists('scripts/sceneIllustrationsAudit.js') &&
  readSrc('package.json').includes('scene:images:audit') &&
  srcExists('SCENE_ILLUSTRATIONS_GUIDE.md'),
  'Missing sceneIllustrationsAudit.js / scene:images:audit script / SCENE_ILLUSTRATIONS_GUIDE.md',
);

check(
  'No global preload of all scene illustrations (on-demand only)',
  !readSrc('src/services/assetPreloadService.js').includes('STORY_SCENE_ILLUSTRATIONS') &&
  !readSrc('src/services/assetPreloadService.js').includes('preloadStorySceneIllustrations'),
  'assetPreloadService appears to preload scene illustrations globally — must stay on-demand',
);

// ── Sprint Histórias 4.1 — Livrinho da Fé Híbrido ────────────────────────────
const livroSrc = readSrc('src/screens/StoryBookScreen.js');

check(
  'Livrinho usa prioridade arte da criança > ilustração oficial > fallback',
  livroSrc.includes('getOfficialSceneIllustration') &&
  livroSrc.includes("seal: 'Sua arte'") &&
  livroSrc.includes("seal: 'Cena ilustrada'") &&
  livroSrc.includes("seal: 'Cena especial'"),
  'StoryBookScreen missing hybrid priority (child art / official / fallback) seals',
);

check(
  'Livrinho não conclui cena nem soma estrela (sem salvarCena)',
  !livroSrc.includes('salvarCena'),
  'StoryBookScreen calls salvarCena — Livrinho must never complete a scene or add a star',
);

check(
  'Livrinho não exige ilustração oficial para abrir (fallback seguro)',
  livroSrc.includes("type: 'fallback'") && livroSrc.includes("seal: 'Cena especial'"),
  'StoryBookScreen missing safe fallback — Livrinho must open without official illustrations',
);

check(
  'Livrinho pré-carrega só a história aberta (preload por storyId, sem global)',
  livroSrc.includes('preloadStorySceneIllustrations(story.id)') &&
  !livroSrc.includes('STORY_SCENE_ILLUSTRATIONS'),
  'StoryBookScreen must preload only the open story (no global scene-illustration preload)',
);

check(
  'Livrinho tem auto-avanço por timer quando não há áudio',
  livroSrc.includes('setTimeout') && livroSrc.includes('advanceToNextScene') &&
  livroSrc.includes('hasSceneAudio'),
  'StoryBookScreen missing timer-based auto-advance fallback for scenes without audio',
);

check(
  'Livrinho header sem nome técnico de rota (Voltar / 🏠 em português)',
  livroSrc.includes('← Voltar') && !/>\s*(Home|Back|Coloring|Narration)\s*</.test(livroSrc),
  'StoryBookScreen header may leak an internal route name',
);

// ── Livrinho: 2 modos finais (recompensa criativa, não repete a história) ────
check(
  'Livrinho tem APENAS 2 modos (Livro mágico misto / Meu livrinho colorido), sem "História ilustrada"',
  livroSrc.includes('Como você quer ver?') &&
  livroSrc.includes('Livro mágico misto') &&
  livroSrc.includes('Meu livrinho colorido') &&
  !livroSrc.includes('História ilustrada'),
  'StoryBookScreen must offer only the two creative modes (no official-only mode)',
);

check(
  'Livrinho tem estado vazio quando não há desenhos (Pinte uma cena...)',
  livroSrc.includes('Pinte uma cena para criar seu livrinho') &&
  livroSrc.includes('childArtCount === 0'),
  'StoryBookScreen missing empty state when the child has no saved drawings',
);

check(
  'resolveStoryBookVisual expõe visualType childArt/official/fallback',
  livroSrc.includes("visualType: 'childArt'") &&
  livroSrc.includes("visualType: 'official'") &&
  livroSrc.includes("visualType: 'fallback'"),
  'StoryBookScreen missing visualType semantic field',
);

check(
  'Livrinho usa transição suave com trava de toque + fade-in que termina em 1',
  livroSrc.includes('isTransitioning') && livroSrc.includes('lockRef') &&
  livroSrc.includes('fadeAnim.setValue(1)') && livroSrc.includes('onLoadEnd'),
  'StoryBookScreen missing hardened transition (lock + fade-in always ending at opacity 1 + onLoadEnd)',
);

// ── Sprint Histórias 4.2.1 — timeline mista real + transição blindada ────────
check(
  'Livrinho constrói timeline por modo (buildStoryBookTimeline)',
  livroSrc.includes('function buildStoryBookTimeline') &&
  livroSrc.includes('const timeline = useMemo'),
  'StoryBookScreen missing buildStoryBookTimeline / memoized timeline',
);

check(
  'Livrinho misto resolve por cena: arte da criança → oficial → fallback (1 slide/cena)',
  livroSrc.includes('function resolveStoryBookPageImage') &&
  /if \(p\) return makeChildArtVisual/.test(livroSrc) &&
  /mode === 'mixed'[\s\S]*?if \(official\) return makeOfficialVisual[\s\S]*?return makeFallbackVisual/.test(livroSrc),
  'StoryBookScreen mixed mode must resolve child art → official → fallback per scene',
);

check(
  'Modo "Meu livrinho colorido" (child) não usa ilustração oficial',
  (() => {
    const m = livroSrc.match(/function resolveStoryBookPageImage\([\s\S]*?\n\}/);
    if (!m) return false;
    const body = m[0];
    // a ilustração oficial só é buscada dentro do ramo mixed
    return /mode === 'mixed'[\s\S]*?getOfficialSceneIllustration/.test(body) &&
           !/if \(p\) return[\s\S]*?getOfficialSceneIllustration[\s\S]*?mode === 'mixed'/.test(body);
  })(),
  'StoryBookScreen child mode must never use the official illustration',
);

check(
  'Livrinho usa um único timer de autoplay (constante AUTOPLAY_MS, efeito único)',
  (livroSrc.match(/setTimeout\(\(\) => \{ advanceToNextScene\(\); \}, AUTOPLAY_MS\)/g) || []).length === 1,
  'StoryBookScreen has zero or multiple autoplay timers',
);

check(
  'isTransitioning/lockRef bloqueia avanço duplo (guards em advance/prev/pause)',
  (livroSrc.match(/if \(lockRef\.current\) return;/g) || []).length >= 3,
  'StoryBookScreen does not guard rapid taps on next/prev/pause with lockRef',
);

check(
  'Trocar de modo reseta a timeline (handleSelectMode → index 0)',
  livroSrc.includes('function handleSelectMode') &&
  /handleSelectMode\([\s\S]*?setCurrentSlideIndex\(0\)/.test(livroSrc),
  'StoryBookScreen handleSelectMode does not reset the timeline to the start',
);

// ── Sprint Histórias 4.2.2 — final do Livrinho com retorno aos modos ─────────
check(
  'Tela final tem os 3 botões (Ver de novo / Escolher outro modo / Voltar para a aventura)',
  livroSrc.includes('Ver de novo') &&
  livroSrc.includes('Escolher outro modo') &&
  livroSrc.includes('Voltar para a aventura'),
  'StoryBookScreen ended state missing one of the 3 final buttons',
);

check(
  'Escolher outro modo volta à seleção sem sair do StoryBookScreen (intro) e reseta slide',
  (() => {
    const m = livroSrc.match(/function handleChooseMode\(\)\s*\{([\s\S]*?)\n  \}/);
    if (!m) return false;
    const body = m[1];
    return body.includes("setScreenState('intro')") &&
           body.includes('setCurrentSlideIndex(0)') &&
           !body.includes('navigation.navigate') &&
           !body.includes('navigation.goBack');
  })(),
  'handleChooseMode must reset slide to 0 and return to intro without navigating away',
);

check(
  'Ver de novo reseta slide para 0 e sai de finished (volta a playing)',
  (() => {
    const m = livroSrc.match(/function handleReplay\(\)\s*\{([\s\S]*?)\n  \}/);
    if (!m) return false;
    const body = m[1];
    return body.includes('setCurrentSlideIndex(0)') && body.includes("setScreenState('playing')");
  })(),
  'handleReplay must reset slide to 0 and resume playing',
);

check(
  'Livrinho não usa controles técnicos antigos (sem ▶▶)',
  !livroSrc.includes('▶▶'),
  'StoryBookScreen still uses the old technical ▶▶ control',
);

check(
  'Livrinho fallback usa frase amigável e sem texto técnico',
  livroSrc.includes('Imagem da cena em breve.') &&
  !livroSrc.includes('Ilustração em breve') &&
  !livroSrc.includes('placeholder') &&
  !livroSrc.includes('Sem imagem'),
  'StoryBookScreen fallback contains technical text or wrong copy',
);

check(
  'Livrinho controles têm labels de acessibilidade em português',
  livroSrc.includes('Página anterior') && livroSrc.includes('Próxima página') &&
  livroSrc.includes('Pausar livrinho') && livroSrc.includes('Continuar livrinho'),
  'StoryBookScreen controls missing accessibility labels',
);

check(
  'Livrinho tem entrada mágica (MagicBookEntrance) e nav de página secundária',
  livroSrc.includes('MagicBookEntrance') && livroSrc.includes('handleEnterLivrinho') &&
  livroSrc.includes('pageNavRow') && !livroSrc.includes('ctrlBtnPlay'),
  'StoryBookScreen missing magic entrance / simplified page-nav controls',
);

// ── Sprint Histórias 5.0 — pipeline oficial das imagens IA por cena ──────────
const imgServiceSrc = readSrc('src/services/storyImageService.js');
const sceneAuditSrc = readSrc('scripts/sceneIllustrationsAudit.js');
const narration50 = readSrc('src/screens/NarrationScreen.js');
const livro50 = readSrc('src/screens/StoryBookScreen.js');

check(
  'getOfficialSceneIllustration retorna null com segurança (try/catch)',
  /export function getOfficialSceneIllustration[\s\S]*?try \{[\s\S]*?catch[\s\S]*?return null/.test(imgServiceSrc),
  'getOfficialSceneIllustration must safely return null (try/catch) when no image exists',
);

check(
  'NarrationScreen consome imagem oficial automaticamente',
  narration50.includes('getOfficialSceneIllustration(story.id, cena.id)'),
  'NarrationScreen does not consume getOfficialSceneIllustration',
);

check(
  'StoryBook pré-carrega só a história aberta (sem preload global)',
  livro50.includes('preloadStorySceneIllustrations(story.id)') &&
  !livro50.includes('STORY_SCENE_ILLUSTRATIONS'),
  'StoryBookScreen must preload only the open story (no global 200-image preload)',
);

check(
  'scene:images:audit lista ausentes/encontradas sem quebrar (modo normal exit 0)',
  sceneAuditSrc.includes('Imagens ausentes') &&
  sceneAuditSrc.includes('Imagens encontradas') &&
  sceneAuditSrc.includes('process.exit(0)'),
  'sceneIllustrationsAudit must list found/missing images and not fail in normal mode',
);

check(
  'scene:images:audit tem modo strict que falha quando faltam imagens',
  sceneAuditSrc.includes('--strict') &&
  /STRICT && totalMissing > 0[\s\S]*?process\.exit\(1\)/.test(sceneAuditSrc),
  'sceneIllustrationsAudit missing strict mode that exits 1 on missing images',
);

check(
  'package.json tem scene:images:audit e variante strict',
  readSrc('package.json').includes('"scene:images:audit"') &&
  readSrc('package.json').includes('"scene:images:audit:strict"'),
  'package.json missing scene:images:audit / :strict scripts',
);

check(
  'OFFICIAL_SCENE_IMAGES_GUIDE.md existe e cobre o pipeline',
  srcExists('OFFICIAL_SCENE_IMAGES_GUIDE.md') &&
  readSrc('OFFICIAL_SCENE_IMAGES_GUIDE.md').includes('getOfficialSceneIllustration') &&
  readSrc('OFFICIAL_SCENE_IMAGES_GUIDE.md').includes('scene:images:audit'),
  'OFFICIAL_SCENE_IMAGES_GUIDE.md missing or incomplete',
);

check(
  'Preservação: nenhuma chave AsyncStorage do Livrinho renomeada (@ptf_progress)',
  livro50.includes('@ptf_progress') && !livro50.includes('salvarCena'),
  'StoryBookScreen storage/stars invariants changed',
);

// ── Sprint RC 1.1 — cabeçalhos seguros (SafeScreenHeader) ────────────────────
const safeHeaderSrc = readSrc('src/components/layout/SafeScreenHeader.js');

check(
  'SafeScreenHeader existe com zonas de largura mínima (minWidth)',
  safeHeaderSrc.includes('minWidth') && safeHeaderSrc.includes('SIDE_MIN'),
  'SafeScreenHeader missing fixed minWidth side zones',
);

check(
  'SafeScreenHeader: botões com hitSlop e área tocável 44×44',
  safeHeaderSrc.includes('hitSlop') && /minWidth:\s*44/.test(safeHeaderSrc) && /minHeight:\s*44/.test(safeHeaderSrc),
  'SafeScreenHeader buttons missing hitSlop / 44×44 touch target',
);

check(
  'SafeScreenHeader: título trunca (numberOfLines={1} + ellipsizeMode="tail")',
  safeHeaderSrc.includes('numberOfLines={1}') && safeHeaderSrc.includes('ellipsizeMode="tail"'),
  'SafeScreenHeader title does not truncate safely',
);

check(
  'SafeScreenHeader usa Safe Area (useSafeAreaInsets + paddingTop)',
  safeHeaderSrc.includes('useSafeAreaInsets') && safeHeaderSrc.includes('insets.top'),
  'SafeScreenHeader does not apply safe-area top inset',
);

for (const screen of ['QuizScreen', 'StoryBookScreen', 'NarrationScreen', 'ReflectionScreen']) {
  check(
    `${screen} usa SafeScreenHeader`,
    readSrc(`src/screens/${screen}.js`).includes('SafeScreenHeader'),
    `${screen} does not use the global SafeScreenHeader`,
  );
}

check(
  'QuizScreen não usa mais header nativo (headerShown:false na rota Quiz)',
  /name="Quiz"[\s\S]*?options=\{\{ headerShown: false \}\}/.test(readSrc('src/navigation/AppNavigator.js')),
  'Quiz route still uses the native header (risk of cropped back button)',
);

check(
  'Headers nativos restantes reservam largura do botão (headerLeftContainerStyle minWidth)',
  /const headerLeftContainerStyle = \{ minWidth: 120/.test(readSrc('src/navigation/AppNavigator.js')),
  'Native headers do not reserve back-button width — risk of cropped "‹ Voltar"',
);

// Nenhum texto visível "Home" ou "Back" nas telas do fluxo
const headerFlowScreens = ['QuizScreen', 'StoryBookScreen', 'NarrationScreen', 'ReflectionScreen', 'StoryDetailScreen', 'ParentAreaScreen', 'CongratsScreen'];
for (const screen of headerFlowScreens) {
  const src = readSrc(`src/screens/${screen}.js`);
  check(
    `${screen} não exibe texto visível "Home"/"Back"`,
    !/>\s*Home\s*</.test(src) && !/>\s*Back\s*</.test(src) &&
    !/>\s*‹\s*Back\s*</.test(src) && !/>\s*🏠\s*Home\s*</.test(src),
    `${screen} renders a visible "Home"/"Back" technical label`,
  );
}

// ── Sprint Histórias 5.1 — validação por história ────────────────────────────
const sceneAudit51 = readSrc('scripts/sceneIllustrationsAudit.js');

check(
  'sceneIllustrationsAudit aceita filtro --story',
  sceneAudit51.includes("indexOf('--story')") && sceneAudit51.includes('const SCOPE'),
  'sceneIllustrationsAudit does not support --story filtering',
);

check(
  'sceneIllustrationsAudit combina --story com --strict (exit 1 no escopo)',
  sceneAudit51.includes('STRICT') && sceneAudit51.includes('SCOPE') &&
  /STRICT && totalMissing > 0[\s\S]*?process\.exit\(1\)/.test(sceneAudit51),
  'sceneIllustrationsAudit strict does not honor --story scope',
);

check(
  'sceneIllustrationsAudit dá erro claro para storyId inválido (lista IDs)',
  sceneAudit51.includes('storyId inválido') &&
  sceneAudit51.includes('storyIds disponíveis') &&
  /!availableIds\.includes\(STORY\)[\s\S]*?process\.exit\(1\)/.test(sceneAudit51),
  'sceneIllustrationsAudit does not error clearly on invalid storyId',
);

check(
  'sceneIllustrationsAudit mostra caminhos esperados no modo --story',
  sceneAudit51.includes('caminhos esperados') && sceneAudit51.includes('expectedPath'),
  'sceneIllustrationsAudit per-story report missing expected file paths',
);

check(
  'package.json tem scripts scene:images:audit:story e :story:strict',
  readSrc('package.json').includes('"scene:images:audit:story"') &&
  readSrc('package.json').includes('"scene:images:audit:story:strict"'),
  'package.json missing per-story audit scripts',
);

check(
  'Guia canônico documenta Produção por história',
  readSrc('OFFICIAL_SCENE_IMAGES_GUIDE.md').includes('Produção por história') &&
  readSrc('OFFICIAL_SCENE_IMAGES_GUIDE.md').includes('--story'),
  'OFFICIAL_SCENE_IMAGES_GUIDE.md missing per-story production section',
);

check(
  'Checklist da história piloto existe com colunas corretas',
  srcExists('OFFICIAL_SCENE_IMAGES_CHECKLIST.md') &&
  readSrc('OFFICIAL_SCENE_IMAGES_CHECKLIST.md').includes('| storyId |') &&
  readSrc('OFFICIAL_SCENE_IMAGES_CHECKLIST.md').includes('arquivo esperado') &&
  readSrc('OFFICIAL_SCENE_IMAGES_CHECKLIST.md').includes('pendente'),
  'OFFICIAL_SCENE_IMAGES_CHECKLIST.md missing or malformed',
);

check(
  'Manifesto oficial: nenhum require() aponta para arquivo inexistente',
  (() => {
    const obj = readSrc('src/data/storySceneIllustrations.js').split('STORY_SCENE_ILLUSTRATIONS = {')[1] || '';
    const reqs = [...obj.matchAll(/require\(['"](.*?)['"]\)/g)].map(x => x[1]);
    // caminhos relativos a src/data → resolvem como ../../assets/...
    return reqs.every(p => srcExists(p.replace(/^\.\.\/\.\.\//, '')));
  })(),
  'storySceneIllustrations contains a require() pointing to a missing file',
);

check(
  'História creation registrada com 10 cenas oficiais (5.2)',
  (() => {
    const obj = readSrc('src/data/storySceneIllustrations.js').split('STORY_SCENE_ILLUSTRATIONS = {')[1] || '';
    const block = /\bcreation\s*:\s*\{([\s\S]*?)\}/.exec(obj);
    if (!block) return false;
    const scenes = [...block[1].matchAll(/(\d+)\s*:\s*require\(/g)].map(x => Number(x[1]));
    return [1,2,3,4,5,6,7,8,9,10].every(n => scenes.includes(n)) && scenes.length === 10;
  })(),
  'creation must register exactly 10 official scene illustrations (1..10)',
);

// ── Sprint Histórias 5.5 — imagens de cena em 4:5 responsivo ─────────────────
const livro54 = readSrc('src/screens/StoryBookScreen.js');
const sceneVisual54 = readSrc('src/components/story/StorySceneVisual.js');
const officialConst54 = readSrc('src/constants/officialImage.js');
const officialImgSrc = readSrc('src/components/story/OfficialSceneImage.js');

check(
  'Constante OFFICIAL_IMAGE_ASPECT_RATIO = 4/5 (retrato)',
  officialConst54.includes('OFFICIAL_IMAGE_ASPECT_RATIO') && officialConst54.includes('4 / 5') &&
  !officialConst54.includes('16 / 9'),
  'officialImage.js must define OFFICIAL_IMAGE_ASPECT_RATIO = 4/5 (no 16/9)',
);

check(
  'officialImage.js expõe os tamanhos responsivos scene/book',
  officialConst54.includes('export function computeSceneImageSize') &&
  officialConst54.includes('export function computeBookImageSize') &&
  officialConst54.includes('* 0.46') && officialConst54.includes('* 0.56'),
  'officialImage.js missing computeSceneImageSize/computeBookImageSize (46%/56%)',
);

check(
  'OfficialSceneImage usa 4:5 responsivo (variant scene/book) — sem aspectRatio 16/9',
  officialImgSrc.includes('computeSceneImageSize') && officialImgSrc.includes('computeBookImageSize') &&
  officialImgSrc.includes("variant === 'book'") &&
  /width:\s*size\.width/.test(officialImgSrc) && /height:\s*size\.height/.test(officialImgSrc) &&
  !officialImgSrc.includes('OFFICIAL_IMAGE_ASPECT_RATIO'),
  'OfficialSceneImage must size itself 4:5 via computeScene/BookImageSize (no aspectRatio)',
);

check(
  'OfficialSceneImage não usa scale, ImageBackground nem flex:1 (e não ocupa tela inteira)',
  !officialImgSrc.includes('ImageBackground') &&
  !/scale\s*:/.test(officialImgSrc) && !officialImgSrc.includes('flex: 1') &&
  !officialImgSrc.includes('fullBleed'),
  'OfficialSceneImage uses a forbidden scale/background/flex/full-screen layout',
);

check(
  'StorySceneVisual usa OfficialSceneImage variant="scene" para a imagem oficial',
  /officialIllustration\)\s*\{[\s\S]*?<OfficialSceneImage[\s\S]*?variant="scene"/.test(sceneVisual54),
  'StorySceneVisual official state must use OfficialSceneImage variant="scene" (4:5)',
);

check(
  'StoryBook renderiza tudo na moldura fixa 4:5 com width/height 100% (nasce sem zoom gigante)',
  livro54.includes('bookArtFrame') &&
  /width: bookSize\.width, height: bookSize\.height/.test(livro54) &&
  livro54.includes("bookFullImage: { width: '100%', height: '100%' }") &&
  // a imagem principal NÃO usa absoluteFill (causava zoom no 1º frame)
  /visual\.type === 'official'[\s\S]*?style=\{styles\.bookFullImage\}[\s\S]*?resizeMode="contain"/.test(livro54),
  'StoryBookScreen images must use a fixed 4:5 frame + width/height 100% (no absoluteFill zoom)',
);

check(
  'Livrinho: arte da criança em fundo CLARO (não fica preta)',
  livro54.includes('const isUserArt =') &&
  /isUserArt \? '#FFFDF8'/.test(livro54) &&
  // sem overlay/opacity/tint escurecendo a arte da criança
  !/bookFullImage[\s\S]{0,120}opacity/.test(livro54) &&
  !livro54.includes('tintColor'),
  'StoryBookScreen child art must render on a light background (no dark overlay/opacity/tint)',
);

check(
  'StoryBook calcula tamanho 4:5 do Livrinho (computeBookImageSize) e não usa 16:9',
  livro54.includes('computeBookImageSize(width, screenH)') &&
  !livro54.includes('OFFICIAL_IMAGE_ASPECT_RATIO') &&
  !livro54.includes('bookVisualStage'),
  'StoryBookScreen must compute the 4:5 book size (no 16:9 aspectRatio / flex stage)',
);

check(
  'StoryBook separa área de imagem e área de controles (image section + bottom panel)',
  livro54.includes('bookImageSection') && livro54.includes('bookArtFrame') &&
  livro54.includes('bookBottomPanel'),
  'StoryBookScreen does not separate image area from controls area',
);

check(
  'StoryBook painel inferior respeita Safe Area (insets.bottom + 20) e é compacto',
  /bookBottomPanel[\s\S]*?paddingBottom: Math\.max\(insets\.bottom \+ 20/.test(livro54) &&
  !/bookBottomPanel:\s*\{[^}]*flex:\s*1/.test(livro54),
  'StoryBookScreen bottom panel must respect safe area and stay compact (no flex:1)',
);

check(
  'StoryBook fade inicial não parece imagem branca (opacity >= 0.85)',
  livro54.includes('fadeAnim.setValue(0.85)'),
  'StoryBookScreen transition starts too transparent (looks like a blank image)',
);

check(
  'Guia documenta o padrão 4:5 das imagens de cena',
  (() => {
    const g = readSrc('OFFICIAL_SCENE_IMAGES_GUIDE.md');
    return g.includes('4:5') && g.includes('sempre aparecer');
  })(),
  'OFFICIAL_SCENE_IMAGES_GUIDE.md does not document the 4:5 scene image standard',
);

// ── Bug fixes Sprint N: hasMeaningfulPaint / Livrinho / MagicBookEntrance ────
console.log('\n── hasMeaningfulPaint / Pronto / Livrinho / MagicBookEntrance ──');

const coloringSrc = readSrc('src/screens/ColoringScreen.js');
const storyBookSrcBugFix = readSrc('src/screens/StoryBookScreen.js');
const drawingStorageSrcBugFix = readSrc('src/services/drawingStorage.js');
const magicBookSrc = readSrc('src/components/story/MagicBookEntrance.js');

check(
  'ColoringScreen usa hasMeaningfulPaint ou seta hasPainted ao continuar desenho salvo',
  coloringSrc.includes('setHasPainted(true)') &&
  coloringSrc.includes('handleContinueDrawing'),
  'ColoringScreen.handleContinueDrawing deve chamar setHasPainted(true)',
);

check(
  'ColoringScreen não bloqueia Pronto quando há pintura salva carregada',
  (() => {
    const fnMatch = coloringSrc.match(/function handleContinueDrawing[\s\S]*?\}/);
    return fnMatch ? fnMatch[0].includes('setHasPainted(true)') : false;
  })(),
  'handleContinueDrawing deve conter setHasPainted(true)',
);

check(
  'drawingStorage exporta hasMeaningfulPaint',
  drawingStorageSrcBugFix.includes('export function hasMeaningfulPaint'),
  'hasMeaningfulPaint não exportada em drawingStorage.js',
);

check(
  'StoryBookScreen importa hasMeaningfulPaint de drawingStorage',
  storyBookSrc.includes('hasMeaningfulPaint') &&
  storyBookSrc.includes("from '../services/drawingStorage'"),
  'StoryBookScreen não importa hasMeaningfulPaint',
);

check(
  'StoryBookScreen usa hasMeaningfulPaint no modo misto (não usa childArt sem tinta real)',
  storyBookSrc.includes('hasMeaningfulPaint(raw)') &&
  storyBookSrc.includes('resolveStoryBookPageImage'),
  'resolveStoryBookPageImage deve checar hasMeaningfulPaint antes de usar childArt',
);

check(
  'StoryBookScreen modo colorido filtra artes com tinta significativa',
  storyBookSrc.includes('hasMeaningfulPaint(raw)') &&
  storyBookSrc.includes("Você ainda não pintou esta cena."),
  'StoryBookScreen modo child deve usar hasMeaningfulPaint e ter fallback por cena',
);

check(
  'MagicBookEntrance não contém ImageBackground',
  !magicBookSrc.includes('ImageBackground'),
  'MagicBookEntrance usa ImageBackground (causa zoom gigante)',
);

check(
  'MagicBookEntrance não contém Animated.Image',
  !magicBookSrc.includes('Animated.Image'),
  'MagicBookEntrance usa Animated.Image',
);

check(
  'MagicBookEntrance não contém <Image',
  !/<Image[\s>]/.test(magicBookSrc),
  'MagicBookEntrance renderiza <Image> (causa zoom gigante no iOS)',
);

check(
  'MagicBookEntrance não contém resizeMode',
  !magicBookSrc.includes('resizeMode'),
  'MagicBookEntrance usa resizeMode (imagem de capa pode vazar do container animado)',
);

check(
  'MagicBookEntrance não contém officialImage, coverImage, sceneImage nem source=',
  !magicBookSrc.includes('officialImage') &&
  !magicBookSrc.includes('coverImage') &&
  !magicBookSrc.includes('sceneImage') &&
  !/source=/.test(magicBookSrc),
  'MagicBookEntrance ainda referencia source/officialImage/coverImage/sceneImage',
);

check(
  'StoryBookScreen não passa cover para MagicBookEntrance',
  !storyBookSrc.includes('cover={') || (() => {
    const magicCall = storyBookSrc.match(/<MagicBookEntrance[\s\S]*?\/>/);
    return magicCall ? !magicCall[0].includes('cover=') : true;
  })(),
  'StoryBookScreen ainda passa cover= para MagicBookEntrance',
);

// ── Summary ──────────────────────────────────────────────────────────────────
const total = passes + failures;
console.log(`\n── Result: ${passes}/${total} passed, ${failures} failed ──\n`);
if (failures > 0) process.exit(1);
