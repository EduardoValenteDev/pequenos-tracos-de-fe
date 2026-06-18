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
  'Modo Criador aparece na Área dos Pais atrás do gate de teste (SHOW_TEST_TOOLS)',
  parentQaSrc.includes('isCreatorQaModeAllowed') &&
  parentQaSrc.includes('SHOW_TEST_TOOLS &&') &&
  parentQaSrc.includes('Modo Criador') &&
  parentQaSrc.includes('não altera o plano dos usuários reais'),
  'ParentAreaScreen must show the Creator toggle behind the test-tools gate, with the QA warning',
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
  'A6: ReflectionScreen (Guardar no coração) NÃO é gateada por plano (grátis no MVP)',
  !readSrc('src/screens/ReflectionScreen.js').includes('canOpenLumi') &&
  !readSrc('src/screens/ReflectionScreen.js').includes('PremiumLockCard'),
  'ReflectionScreen ainda trava "Guardar no coração" por plano — deve ser grátis no MVP',
);

check(
  'A6: LumiMomentScreen (Momento com Beni) NÃO é gateado por plano (grátis no MVP)',
  !readSrc('src/screens/LumiMomentScreen.js').includes('canOpenMomentoLumi') &&
  !readSrc('src/screens/LumiMomentScreen.js').includes('PremiumLockCard'),
  'LumiMomentScreen ainda trava "Momento com Beni" por plano — deve ser grátis no MVP',
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
  'A6: ReflectionScreen não chama canOpenLumi (Guardar no coração liberado)',
  !reflSrcS3.includes('canOpenLumi'),
  'ReflectionScreen ainda referencia canOpenLumi — gating removido no A6',
);

check(
  'A6: PostStoryHub "Guardar no coração" sem rótulo Plano Família (grátis no MVP)',
  !postHubSrc.includes('canOpenLumi') &&
  /title="Guardar no coração"[\s\S]{0,200}\+1 ⭐/.test(postHubSrc),
  'PostStoryHub ainda rotula "Guardar no coração" como Plano Família',
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
  'ParentAreaScreen: Plano Família informativo, sem botão de compra/restauração',
  pasSrc.includes('Disponível em uma próxima atualização') &&
  !pasSrc.includes('Restaurar compra') &&
  !pasSrc.includes('Ativar em breve'),
  'ParentAreaScreen still shows actionable purchase/restore for the Premium plan',
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
  'A6: hasMomentoLumiAccess é grátis no MVP (return true) — Momento com Beni não exige plano',
  acSourceS3.includes('export function hasMomentoLumiAccess') &&
    /export function hasMomentoLumiAccess\(\)\s*\{\s*return true;/.test(acSourceS3),
  'hasMomentoLumiAccess não retorna true — Momento com Beni continuaria gateado',
);

check(
  'A6: hasLumiAccessForStory é grátis no MVP (return true) — Guardar no coração não exige plano',
  /export function hasLumiAccessForStory\(story\)\s*\{\s*return true;/.test(acSourceS3),
  'hasLumiAccessForStory não retorna true — Guardar no coração continuaria gateado',
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
  'SoundButton delega o som ao AudioManager central (playUiSound)',
  soundBtnSrc.includes('playUiSound') &&
    soundBtnSrc.includes("from '../services/audioManager'"),
  'SoundButton.js não usa o AudioManager central (playUiSound)',
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
  storyBookSrc.includes('handleStartLivrinho') &&
  storyBookSrc.includes('Abrir história ilustrada') &&
  storyBookSrc.includes('Abrir meu livrinho colorido'),
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

// [A1] Removido o check que exigia o nome 'resolveStoryBookVisual' (helper legado
// não chamado). Sua presença ficava "travada" só pelo smoke; a remoção da função
// é tarefa do Bloco A2. A composição real do Livrinho é validada pelos tipos
// (paintWithLineart/official/fallback) abaixo, produzidos por make*Visual.

check(
  'StoryBookScreen has computeLineartStyle (pixel-aligned lineart positioning)',
  storyBookSrc.includes('computeLineartStyle'),
  'StoryBookScreen missing computeLineartStyle — lineart overlay will misalign with paint layer',
);

check(
  'Livrinho visual: tipo paintWithLineart presente (makeChildArtVisual)',
  storyBookSrc.includes("'paintWithLineart'") || storyBookSrc.includes('"paintWithLineart"'),
  'StoryBookScreen missing paintWithLineart type — never correctly overlays paint + lineart',
);

check(
  'StoryBook: arte da criança SEMPRE com contorno (paintWithLineartFull, sem paintOnly)',
  storyBookSrc.includes('paintWithLineartFull') && !storyBookSrc.includes("'paintOnly'"),
  'StoryBookScreen ainda usa paintOnly (cor sem contorno) — Bloco 1 exige lineart sempre',
);

check(
  'Livrinho visual: tipo official presente (makeOfficialVisual)',
  storyBookSrc.includes("'official'") || storyBookSrc.includes('"official"'),
  'StoryBookScreen missing official type — Livrinho no longer uses official illustration as priority B',
);

check(
  'Livrinho visual: tipo fallback presente (makeFallbackVisual)',
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
  narrationCompletionSrc.includes('Colorir cena'),
  'NarrationScreen missing custom header / Cena anterior / Colorir cena labels',
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
  'ParentAreaScreen tem aviso de dados locais (Resumo de privacidade)',
  parentSrc7.includes('Os dados ficam neste aparelho'),
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
  atelierCanvasSrc.includes('use o Modo Criador nos testes ou aguarde o Plano Família'),
  'AtelierCanvasScreen limit modal text does not match official product copy',
);

check(
  'AtelierCanvasScreen limit modal has "Ver Área dos Pais" button',
  atelierCanvasSrc.includes('Ver Área dos Pais'),
  'AtelierCanvasScreen limit modal missing "Ver Área dos Pais" button text',
);

// ── Hotfix: texto do Desenho guiado não pode cortar ───────────────────────────
check(
  'AtelierCanvasScreen headerSub NÃO usa numberOfLines={1} (texto da missão não pode cortar)',
  atelierCanvasSrc.includes('<Text style={styles.headerSub}>'),
  'AtelierCanvasScreen headerSub ganhou atributos (ex.: numberOfLines) — frase do Desenho guiado pode cortar',
);

check(
  'AtelierCanvasScreen headerSub tem lineHeight (multi-linha legível)',
  atelierCanvasSrc.includes('lineHeight') && atelierCanvasSrc.includes('headerSub'),
  'AtelierCanvasScreen headerSub sem lineHeight — texto multi-linha fica apertado',
);

check(
  'AtelierCanvasScreen headerCenter mantém flex: 1 (texto não empurra botão Salvar)',
  atelierCanvasSrc.includes('headerCenter') && atelierCanvasSrc.includes('flex: 1'),
  'AtelierCanvasScreen headerCenter sem flex:1 — texto da missão pode ultrapassar o botão Salvar',
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
// [A1] Removido o 2º check que exigia o nome 'resolveStoryBookVisual' (helper
// legado). A integridade do Livrinho é coberta por onSceneAudioComplete /
// advanceToNextScene e pelos tipos de visual; a remoção da função fica para A2.

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
  'AtelierCanvas exportState emits previewBase64 (full-res JPEG, achatado contra o fundo)',
  atelierCanvasCompSrc.includes('previewData=flat.toDataURL') && atelierCanvasCompSrc.includes('previewBase64:previewData'),
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
  'atelierStorage stores preview no fullArt (A5: ponteiro previewUri + fallback base64), nunca na meta',
  (() => {
    const fullBlock = atelierStorageSrc81.slice(
      atelierStorageSrc81.indexOf('const fullArt ='),
      atelierStorageSrc81.indexOf('const meta ='),
    );
    // fullArt deve carregar o ponteiro do preview (previewUri) e o fallback inline.
    return fullBlock.includes('previewUri') && fullBlock.includes('previewBase64');
  })(),
  'atelierStorage não guarda o preview (previewUri + fallback) no fullArt',
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
  'AtelierGalleryScreen viewer usa resolvers (previewUri/base64 → thumbUri/base64) p/ formato novo e antigo',
  atelierGallerySrc81.includes('resolveArtPreviewUri(viewingArtFull)') &&
  atelierGallerySrc81.includes('resolveArtThumbUri(viewingArt)'),
  'AtelierGalleryScreen viewer não usa os resolvers de URI (preview/thumb)',
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
  'HomeScreen não usa rótulo de bloqueio "Especial da Família" (Bloco 1)',
  !homeSrc9.includes('Especial da Família'),
  'HomeScreen ainda usa "Especial da Família"',
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
  'AtelierScreen: card "Desenho guiado pelo Beni" explica a ação (Receba uma ideia simples)',
  atelierSrc9.includes('Desenho guiado pelo Beni') &&
  atelierSrc9.includes('Receba uma ideia simples para desenhar hoje'),
  'AtelierScreen não tem o card "Desenho guiado pelo Beni" com a explicação correta',
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
  'StatusBadge premium defaultLabel is "Plano Família" (Bloco 1)',
  statusBadgeSrc.includes("defaultLabel: 'Plano Família'") && !statusBadgeSrc.includes("'Especial da Família'"),
  'StatusBadge premium defaultLabel deve ser "Plano Família"',
);

// Language — child areas
check(
  'HomeScreen LumiMomentCard locked button says "Pedir ao responsável" (not "Ver plano familiar")',
  homeSrc91.includes('Pedir ao responsável') && !homeSrc91.includes('Ver plano familiar'),
  'HomeScreen LumiMomentCard still shows "Ver plano familiar" when locked',
);

check(
  'PostStoryHubScreen Lumi cta says "Plano Família" (Bloco 1)',
  postHubSrc91.includes('Plano Família') && !postHubSrc91.includes('Especial da Família'),
  'PostStoryHubScreen Lumi cta deve usar "Plano Família"',
);

check(
  'contentAccessService locked label is "Pedir ao responsável" (not "💎 Ver Plano Familiar")',
  contentSvcSrc91.includes('Pedir ao responsável') && !contentSvcSrc91.includes('💎 Ver Plano Familiar'),
  'contentAccessService still uses "💎 Ver Plano Familiar" as locked primary label',
);

check(
  'contentAccessService getLockedStoryMessage returns "Plano Família" (Bloco 1)',
  contentSvcSrc91.includes('Plano Família') && !contentSvcSrc91.includes('Especial da Família'),
  'contentAccessService getLockedStoryMessage deve usar "Plano Família"',
);

check(
  'QuizScreen PremiumLockCard usa "Plano Família" (Bloco 1)',
  quizSrc91.includes('Plano Família') && !quizSrc91.includes('Especial da Família'),
  'QuizScreen PremiumLockCard deve usar "Plano Família"',
);

check(
  'A6: ReflectionScreen sem lock de "Plano Família" (Guardar no coração é grátis no MVP)',
  !reflSrc91.includes('Plano Família') && !reflSrc91.includes('Especial da Família'),
  'ReflectionScreen ainda contém copy de lock "Plano Família" — feature é grátis no MVP',
);

check(
  'A6: LumiMomentScreen sem lock de "Plano Família" (Momento com Beni é grátis no MVP)',
  !lumiMomSrc91.includes('Plano Família') && !lumiMomSrc91.includes('Especial da Família'),
  'LumiMomentScreen ainda contém copy de lock "Plano Família" — feature é grátis no MVP',
);

check(
  'StoryBookScreen locked title usa "Plano Família" (Bloco 1)',
  sbSrc91.includes('Plano Família') && !sbSrc91.includes('Especial da Família'),
  'StoryBookScreen locked title deve usar "Plano Família"',
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
  'AtelierCanvasScreen renderiza a paleta por famílias (COLOR_FAMILIES)',
  atelierScreenSrc92.includes('COLOR_FAMILIES.map'),
  'AtelierCanvasScreen não renderiza a paleta organizada por famílias',
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
  'Colorir V2: ferramentas em ícones compactos (CompactTool) e borracha com ícone de borracha real',
  coloringScreenSrc93.includes('function CompactTool') &&
  coloringScreenSrc93.includes('MaterialCommunityIcons name="eraser"'),
  'ColoringScreen não usa CompactTool / ícone de borracha real',
);
check(
  'Colorir V2: botão "Ampliar" removido da barra (zoom é por gesto de dois dedos)',
  !coloringScreenSrc93.includes('"Ampliar"') && !coloringScreenSrc93.includes('handleZoomIn'),
  'Botão Ampliar ainda presente — deveria ter sido removido',
);
check(
  'Colorir V2: "Enquadrar" virou "Ver tudo (centralizar)" via accessibilityLabel',
  !coloringScreenSrc93.includes('"Enquadrar"') &&
  coloringScreenSrc93.includes('Ver tudo (centralizar)'),
  'Ação de centralizar não está clara (Ver tudo/Centralizar)',
);
check(
  'ColoringScreen has no old "Zoom ↺" label',
  !coloringScreenSrc93.includes('"Zoom ↺"'),
  '"Zoom ↺" label still present — should be replaced by Ampliar/Enquadrar',
);
check(
  'Colorir V2: "Limpar" movido para menu compacto (fora do destaque) + confirmação',
  coloringScreenSrc93.includes('Limpar tudo') &&
  /showMenu/.test(coloringScreenSrc93) &&
  coloringScreenSrc93.includes('handleClearAll'),
  'Limpar não foi movido para o menu / perdeu a confirmação',
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
  coloringScreenSrc94.includes('Alert.alert(') &&
  coloringScreenSrc94.includes("'Apagar as cores deste desenho?'"),
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

// Dica fixa de dois dedos REMOVIDA (mais área para o desenho) — o gesto continua
// funcionando, apenas sem o texto fixo ocupando altura.
check(
  'ColoringScreen: dica fixa de dois dedos removida (texto + estilo)',
  !coloringScreenSrc94.includes('Dois dedos: mover e ampliar') &&
  !coloringScreenSrc94.includes('twoFingerHint:'),
  'ColoringScreen ainda contém a dica fixa de dois dedos — deveria ter sido removida',
);

// ── Colorir Imersivo V1: canvas full-bleed + controles em overlay flutuante ──
check(
  'Imersivo: canvas full-bleed (flex:1, sem altura fixa / CANVAS_MARGIN)',
  /canvasArea:\s*\{\s*flex:\s*1/.test(coloringScreenSrc94) &&
  !coloringScreenSrc94.includes('CANVAS_MARGIN') &&
  !coloringScreenSrc94.includes('canvasHeight'),
  'canvas não é full-bleed — ainda preso à altura exata da imagem (CANVAS_MARGIN/canvasHeight)',
);
check(
  'Imersivo: ferramentas/paleta viram overlay absoluto (não empurram o canvas)',
  /overlayPanel:\s*\{[\s\S]{0,200}position:\s*'absolute'/.test(coloringScreenSrc94) &&
  coloringScreenSrc94.includes('styles.overlayPanel') &&
  !coloringScreenSrc94.includes('styles.bottomPanel'),
  'barra inferior ainda ocupa faixa no fluxo (bottomPanel) — não virou overlay',
);
check(
  'Imersivo: overlay com visual leve (creme translúcido + cantos arredondados)',
  /overlayPanel:\s*\{[\s\S]{0,260}rgba\(255,253,248,0\.94\)/.test(coloringScreenSrc94) &&
  /overlayPanel:\s*\{[\s\S]{0,260}borderRadius:\s*22/.test(coloringScreenSrc94),
  'overlay não tem o visual infantil leve (creme translúcido / borderRadius)',
);
check(
  'Imersivo: clamp permite pan inferior extra (inset nomeado) p/ alcançar área sob o overlay',
  coloringCanvasSrc94.includes('INITIAL_VIEW_BOTTOM_SAFE_INSET=Math.round(H*INITIAL_VIEW_BOTTOM_SAFE_FRAC);') &&
  coloringCanvasSrc94.includes('ty=Math.max(H*(1-scale)-INITIAL_VIEW_BOTTOM_SAFE_INSET,Math.min(0,ty));'),
  'clamp não tem inset inferior nomeado — parte da arte fica presa sob o overlay',
);
check(
  'ColoringScreen lineTip bottom updated to 168',
  coloringScreenSrc94.includes('bottom: 168 + insets.bottom'),
  'lineTip bottom not updated — toast may overlap bottom panel after layout changes',
);

// ── Hotfix render: lineart confiável + sem canvas branco silencioso ──────────
check(
  'Colorir: lineart entregue via expo-asset + expo-file-system (sem blob/FileReader instável como primário)',
  coloringCanvasSrc94.includes("from 'expo-asset'") &&
  coloringCanvasSrc94.includes("from 'expo-file-system/legacy'") &&
  coloringCanvasSrc94.includes('Asset.fromModule(imageSource)') &&
  coloringCanvasSrc94.includes('readAsStringAsync'),
  'ColoringCanvas não usa expo-asset/file-system para carregar a lineart de forma confiável',
);
check(
  'Colorir: WebView só monta com a lineart pronta — nunca canvas branco silencioso',
  /imageDataUrl != null \|\| imageSource == null/.test(coloringCanvasSrc94) &&
  /catch \(err\)[\s\S]{0,400}setErrorType\('error'\)/.test(coloringCanvasSrc94),
  'ColoringCanvas pode mostrar canvas branco "pronto" quando a imagem não carregou',
);
check(
  'Colorir: ColoringScreen passa storyId/sceneNumber ao canvas (erro amigável em dev)',
  coloringScreenSrc94.includes('storyId={story.id}') &&
  coloringScreenSrc94.includes('sceneNumber={cena.id}'),
  'ColoringScreen não passa storyId/sceneNumber — erro de carregamento sem contexto',
);
check(
  'Colorir: motor de pintura intacto (loadPaint/flood fill não tocados neste hotfix)',
  coloringCanvasSrc94.includes('window.loadPaint=function') &&
  coloringCanvasSrc94.includes('window.exportPaint=function'),
  'Motor de pintura (loadPaint/exportPaint) foi alterado indevidamente',
);
check(
  'Colorir: cache em memória da lineart (CACHE HIT/MISS) — reabrir cena é mais rápido',
  coloringCanvasSrc94.includes('const lineartCache = new Map()') &&
  coloringCanvasSrc94.includes('lineartCache.get(imageSource)') &&
  coloringCanvasSrc94.includes('lineartCache.set(imageSource') &&
  coloringCanvasSrc94.includes('CACHE HIT') && coloringCanvasSrc94.includes('CACHE MISS'),
  'ColoringCanvas não tem cache em memória da lineart — reaberturas reconvertem o asset',
);
check(
  'Colorir V2: nitidez via devicePixelRatio (backing físico) + toque convertido por DPR (fill/coords corretos)',
  /var DPR=Math\.min\(window\.devicePixelRatio\|\|1,3\)/.test(coloringCanvasSrc94) &&
  /W=Math\.round\(cssW\*DPR\); H=Math\.round\(cssH\*DPR\)/.test(coloringCanvasSrc94) &&
  coloringCanvasSrc94.includes("C.style.width=cssW+'px'") &&
  /\(touch\.clientX-r\.left\)\*DPR-tx/.test(coloringCanvasSrc94),
  'ColoringCanvas não aplica devicePixelRatio (lineart continua apagada) ou não converte coordenadas',
);

// ── V2.1: Colorir topo-alinhado + Ateliê no mesmo padrão visual ──────────────
check(
  'Colorir Imersivo: sem canvasWrapper de alinhamento (superado pelo full-bleed + overlay)',
  !coloringScreenSrc94.includes('canvasWrapper'),
  'canvasWrapper ainda existe — alinhamento vertical foi substituído pelo modo imersivo',
);
{
  const atelierSrc21 = readSrc('src/screens/AtelierCanvasScreen.js');
  check(
    'Ateliê V2.1: mesmo padrão do Colorir — painel mais baixo + canvas sem moldura "card grande"',
    atelierSrc21.includes('PANEL_CONTENT_H = 116') &&
    !/canvasFrame:\s*\{[\s\S]{0,200}borderWidth:\s*5/.test(atelierSrc21) &&
    /panelTab:\s*\{[\s\S]{0,200}paddingVertical:\s*7/.test(atelierSrc21),
    'AtelierCanvasScreen não foi compactado para o padrão do Colorir (moldura/painel/abas)',
  );
  check(
    'Ateliê V2.1: motor de pintura (AtelierCanvas) e Salvar preservados',
    atelierSrc21.includes('<AtelierCanvas') &&
    atelierSrc21.includes('handleSavePress'),
    'AtelierCanvasScreen perdeu o canvas ou o Salvar',
  );
}

// ── Modo Colorir Grande (zoom inicial leve, centralizado, "Ver tudo" volta) ──
check(
  'Colorir Grande: INITIAL_COLORING_SCALE elegante na faixa 1.14–1.16 (Imersivo refinado: 1.15)',
  /const INITIAL_COLORING_SCALE = 1\.1[456];/.test(coloringCanvasSrc94),
  'INITIAL_COLORING_SCALE ausente ou fora da faixa elegante 1.14–1.16',
);
check(
  'Colorir Grande: zoom inicial aplicado no initCanvas (scale=INITIAL_COLORING_SCALE)',
  coloringCanvasSrc94.includes('scale=INITIAL_COLORING_SCALE;'),
  'initCanvas não aplica o zoom inicial — desenho não abre maior',
);
check(
  'Colorir Imersivo: câmera inicial centraliza na ÁREA VISUAL SEGURA (acima do overlay)',
  coloringCanvasSrc94.includes('var safeCenterY=(H-INITIAL_VIEW_BOTTOM_SAFE_INSET)/2;') &&
  coloringCanvasSrc94.includes('tx=safeCenterX-focusX*scale;') &&
  coloringCanvasSrc94.includes('ty=safeCenterY-focusY*scale;'),
  'câmera inicial não usa o centro visual seguro — foco pode abrir atrás do overlay',
);
check(
  'Colorir Grande: "Ver tudo" continua voltando a 1.0 (imagem inteira)',
  coloringCanvasSrc94.includes('window.resetZoom=function(){scale=1;tx=0;ty=0;show();}'),
  'resetZoom não volta a scale 1.0 — "Ver tudo" quebrado',
);
check(
  'Colorir Grande: zoom inicial é só VIEW — motor (flood fill/export/load) intacto',
  coloringCanvasSrc94.includes('window.exportPaint=function') &&
  coloringCanvasSrc94.includes('window.loadPaint=function') &&
  coloringCanvasSrc94.includes('function isBFSBarrier'),
  'motor de pintura alterado pelo Modo Colorir Grande',
);
check(
  'Colorir Grande: botão "Ampliar" NÃO voltou (zoom é por gesto)',
  !/accessibilityLabel="Ampliar"/.test(coloringScreenSrc94) &&
  !coloringScreenSrc94.includes('handleZoomIn'),
  'botão Ampliar reapareceu na tela de colorir',
);
check(
  'Colorir Grande: dica de primeira vez (dois dedos) — uma vez, persistida, não fixa',
  coloringScreenSrc94.includes('@ptf_coloring_biggie_hint_v1') &&
  coloringScreenSrc94.includes('Use dois dedos para mover o desenho') &&
  coloringScreenSrc94.includes('setShowPanHint(false)'),
  'dica de pan ausente, fixa, ou sem persistência de "primeira vez"',
);
check(
  'Colorir Grande: paleta principal segue compacta e visível (não escondida neste bloco)',
  coloringScreenSrc94.includes('styles.paletteScroll') &&
  coloringScreenSrc94.includes('COLOR_PALETTE.map'),
  'paleta principal foi removida ou escondida',
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

// Language — "Plano Família" in trail chips (Bloco 1)
check(
  'StoriesScreen chips usam "Plano Família" para trilhas premium (Bloco 1)',
  storiesScreenSrc10.includes('Plano Família') && !storiesScreenSrc10.includes('Especial da Família') && !storiesScreenSrc10.includes("'Premium'"),
  'StoriesScreen trail chips devem usar "Plano Família"',
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
  'HomeScreen tem o hero "Missão de Hoje" (Portal do Beni — Mundo Vivo 1.0)',
  homeSrc11.includes('MISSÃO DE HOJE') && homeSrc11.includes('MissaoDeHoje') &&
  homeSrc11.includes('getShowcaseStory'),
  'HomeScreen perdeu o hero Missão de Hoje (Portal do Beni)',
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
  'TrophiesScreen mostra progresso em conquistas bloqueadas (barra/label)',
  trophiesSrc11.includes('cardProgressText') && trophiesSrc11.includes('cardProgressFill'),
  'TrophiesScreen não mostra progresso nos cards bloqueados',
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
  'achievements.js first_premium_story_done desc usa "Plano Família" (Bloco 1)',
  achievDataSrc11.includes('Plano Família') && !achievDataSrc11.includes('Especial da Família'),
  'achievements.js first_premium_story_done desc deve usar "Plano Família"',
);
check(
  'achievements.js has at least 5 progressLabel functions',
  (achievDataSrc11.match(/progressLabel:/g) || []).length >= 5,
  'achievements.js has fewer than 5 progressLabel entries — progress hints under-implemented',
);

// Language sweep
check(
  'NextAdventureCard usa badge "Plano Família" (Bloco 1)',
  nextAdvSrc11.includes('Plano Família') && !nextAdvSrc11.includes('Especial da Família'),
  'NextAdventureCard deve mostrar "Plano Família" como rótulo de bloqueio',
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

// [482] progressResetService NÃO remove a Galeria do Ateliê.
// (Comentários podem citar a chave em prosa com crase; o que não pode existir é a
//  chave como STRING LITERAL — que entraria no multiRemove.)
check(
  'progressResetService não remove a Galeria do Ateliê (sem string-chave ptf_atelier_arts)',
  !/['"]ptf_atelier_arts/.test(resetSvcSrc13),
  'progressResetService usa string-chave de atelier arts — Galeria não pode ser apagada no reset',
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

// [489] TrophiesScreen tem orientação positiva (próxima conquista), sem tela vazia
check(
  'TrophiesScreen tem orientação positiva (próxima conquista) sem culpa',
  trophies13.includes('PRÓXIMA CONQUISTA') &&
  trophies13.includes('descobrir sua próxima estrelinha'),
  'TrophiesScreen não tem o bloco de próxima conquista / orientação positiva',
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

// [613.1] coloringImages.js registra as histórias de colorir oficiais (inclui as 3 novas)
(function() {
  const imgSrc = readSrc('src/assets/coloringImages.js');
  const expected = ['creation','noah','david_goliath','jesus_children','daniel_lions',
    'jonah_big_fish','abraham_stars','good_samaritan','lost_sheep'];
  const missing = expected.filter(id => !new RegExp(`^  ${id}: \\{`, 'm').test(imgSrc));
  check(
    'coloringImages.js registra as 9 histórias de colorir oficiais (+abraham_stars/good_samaritan/lost_sheep)',
    missing.length === 0,
    `storyIds de colorir não registrados: ${missing.join(', ')}`,
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

// ── Livrinho: 2 modos finais (UX 1.0 Bloco 3 — sem modo misto) ───────────────
check(
  'Livrinho tem APENAS 2 modos (História ilustrada / Meu livrinho colorido), sem modo misto',
  livroSrc.includes('Como você quer ver?') &&
  livroSrc.includes('História ilustrada') &&
  livroSrc.includes('Meu livrinho colorido') &&
  !livroSrc.includes('Livro mágico misto') &&
  !/setViewMode\('mixed'\)|useState\('mixed'\)/.test(livroSrc),
  'StoryBookScreen must offer exactly two predictable modes (História ilustrada / Meu livrinho colorido), no mixed mode',
);

check(
  'Livrinho: estado vazio do colorido com 0 artes + CTA para colorir',
  livroSrc.includes('Você ainda não pintou cenas desta aventura') &&
  livroSrc.includes('Pinte uma cena para criar seu livrinho') &&
  livroSrc.includes("viewMode === 'child' && childArtCount === 0") &&
  livroSrc.includes("navigation.navigate('Coloring'"),
  'StoryBookScreen missing empty state + CTA for "Meu livrinho colorido" with zero saved drawings',
);

check(
  'Livrinho visual: visualType childArt/official/fallback presente (make*Visual)',
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
  'Livrinho resolve por modo: official sempre oficial; child só arte da criança (com contorno) → fallback',
  livroSrc.includes('function resolveStoryBookPageImage') &&
  /makeChildArtVisual\(cena, story, p\)/.test(livroSrc) &&
  /if \(childVisual\) return childVisual/.test(livroSrc) &&
  /mode === 'official'[\s\S]*?if \(official\) return makeOfficialVisual[\s\S]*?return makeFallbackVisual/.test(livroSrc) &&
  !/mode === 'mixed'/.test(livroSrc),
  'StoryBookScreen must resolve official mode = official always, child mode = child art only (no mixed)',
);

check(
  'Modo "História ilustrada" (official) nunca usa arte da criança; modo child nunca usa oficial',
  (() => {
    const m = livroSrc.match(/function resolveStoryBookPageImage\([\s\S]*?\n\}/);
    if (!m) return false;
    const body = m[0];
    // A ilustração oficial só é buscada no ramo 'official'.
    const officialOnlyInOfficialBranch =
      /mode === 'official'[\s\S]*?getOfficialSceneIllustration/.test(body) &&
      (body.match(/getOfficialSceneIllustration/g) || []).length === 1;
    // O ramo official retorna antes de qualquer leitura de arte da criança.
    const officialReturnsBeforeChildArt =
      body.indexOf("mode === 'official'") < body.indexOf('makeChildArtVisual');
    return officialOnlyInOfficialBranch && officialReturnsBeforeChildArt;
  })(),
  'StoryBookScreen: official mode must never read child art; child mode must never use official illustration',
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
  'Tela final tem os 3 botões (Ver de novo / Escolher outro modo / Voltar para Aventuras)',
  livroSrc.includes('Ver de novo') &&
  livroSrc.includes('Escolher outro modo') &&
  livroSrc.includes('Voltar para Aventuras'),
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

// ── Hotfix persistência do colorir: validar antes do modal + curar incompatível ──
{
  const cc = readSrc('src/components/ColoringCanvas.js');
  const cs = readSrc('src/screens/ColoringScreen.js');
  const ds = readSrc('src/services/drawingStorage.js');

  check(
    'Persistência: canvas valida desenho salvo SEM aplicar (validatePaint → PAINT_VALID/PAINT_INVALID)',
    cc.includes('window.validatePaint=function') &&
    cc.includes("'PAINT_VALID'") &&
    cc.includes("'PAINT_INVALID'"),
    'ColoringCanvas não tem validatePaint que diferencia válido/incompatível',
  );
  check(
    'Persistência: validatePaint compara dimensões salvas com o canvas atual (compatibilidade real)',
    /sw===W&&sh===H/.test(cc) && cc.includes('im.naturalWidth===W&&im.naturalHeight===H'),
    'validatePaint não checa compatibilidade de tamanho (W/H) — modal pode abrir branco',
  );
  check(
    'Persistência: canvas expõe validatePaint imperativo com fila até READY',
    /validatePaint\(savedData\)\s*\{/.test(cc) &&
    cc.includes('pendingValidateRef') &&
    cc.includes('window.validatePaint(${JSON.stringify(pendingValidateRef.current)})'),
    'método validatePaint imperativo/fila ausente — validação pode rodar antes do canvas pronto',
  );
  check(
    'Persistência: ColoringScreen VALIDA antes de mostrar o modal (não abre por mera existência da chave)',
    cs.includes('hasMeaningfulPaint(saved)') &&
    cs.includes('canvasRef.current?.validatePaint(saved)') &&
    cs.includes('onPaintValid={() => setShowResumeDialog(true)}'),
    'ColoringScreen ainda abre o modal sem validar o desenho salvo',
  );
  check(
    'Persistência: estados inválido/incompatível/corrompido se curam (limpam a chave da cena)',
    cs.includes('function healInvalidSavedDrawing') &&
    cs.includes('onPaintInvalid={healInvalidSavedDrawing}') &&
    /onLoadIncompatible=\{\(\)\s*=>\s*\{[\s\S]{0,360}healInvalidSavedDrawing\(\)/.test(cs) &&
    /onLoadCorrupted=\{\(\)\s*=>\s*\{[\s\S]{0,360}healInvalidSavedDrawing\(\)/.test(cs),
    'ColoringScreen não cura (clear) estados de colorir inválidos — modal falso persiste',
  );
  check(
    'Persistência: "Continuar meu desenho" aplica o paint validado (cores aparecem)',
    /function handleContinueDrawing[\s\S]{0,200}loadPaint\(savedDrawing\)/.test(cs),
    'handleContinueDrawing não carrega o desenho validado',
  );
  check(
    'Persistência: "Pronto" é o ÚNICO ponto que persiste (concluído só após salvar) ',
    /handleProximo[\s\S]{0,700}saveDrawingState\(story\.id, cena\.id, exportData\)/.test(cs) &&
    (cs.match(/saveDrawingState\(/g) || []).length === 1,
    'cena pode ser marcada como concluída sem o Pronto (mais de um saveDrawingState)',
  );
  check(
    'Persistência: hasSavedDrawing exige tinta real (card "Você já coloriu" = conclusão real)',
    /hasSavedDrawing[\s\S]{0,260}hasMeaningfulPaint\(v\)/.test(ds),
    'hasSavedDrawing ainda marca colorido por mera existência da chave',
  );
  check(
    'Persistência: reset de jornada limpa colorir por cena e PRESERVA a Galeria do Ateliê',
    readSrc('src/services/progressResetService.js').includes('clearAllSavedDrawings(') &&
    !/['"]ptf_atelier_arts/.test(readSrc('src/services/progressResetService.js')),
    'reset não delega limpeza de colorir a clearAllSavedDrawings ou toca na Galeria',
  );
}

// ── Mapa Pergaminho M2: visual real (imagens de assets/maps/) + card de foco ──
{
  const nav = readSrc('src/navigation/AppNavigator.js');
  const mapScreen = readSrc('src/screens/AdventureMapScreen.js');
  const mapData = readSrc('src/data/adventureMap.js');
  const mapPath = readSrc('src/components/map/MapPath.js');
  const marker = readSrc('src/components/map/StoryMapMarker.js');
  const region = readSrc('src/components/map/MapRegion.js');
  const banner = readSrc('src/components/map/NextAdventureBanner.js');
  const focus = readSrc('src/components/map/StoryFocusModal.js');
  const storiesSrcMap = readSrc('src/data/stories.js');
  const mapFiles = [mapScreen, mapData, mapPath, marker, region, banner, focus];
  const MAPS = ['R1A', 'R1B', 'R2A', 'R2B', 'R3A', 'R3B', 'R4A', 'R4B'];

  check(
    'Mapa M2: a aba Aventuras renderiza AdventureMapScreen (substitui a lista)',
    /name:\s*'Aventuras'[\s\S]{0,160}component:\s*AdventureMapScreen/.test(nav) &&
    nav.includes("import AdventureMapScreen from '../screens/AdventureMapScreen'"),
    'aba Aventuras não aponta para AdventureMapScreen',
  );
  check(
    'Mapa M2: regiões usam a classificação OFICIAL (trackId) — 4 regiões reais',
    mapData.includes("from './stories'") &&
    mapData.includes('s.trackId === meta.id') &&
    ['comece_aqui', 'pequeninos', 'descobridores', 'jovens_da_fe'].every((t) => mapData.includes(`'${t}'`)),
    'adventureMap não deriva as regiões do trackId oficial',
  );
  check(
    'Mapa M2: usa as 8 imagens REAIS de assets/maps/ (R1A..R4B, pares A/B)',
    MAPS.every((r) => mapData.includes(`assets/maps/${r}.jpg`)) &&
    region.includes('source={source}') &&
    region.includes('region.images'),
    'mapa não importa/usa as imagens reais R1A..R4B como fundo das regiões',
  );
  check(
    'Mapa B2.4: mapas em JPG (leves) — nenhum require .png no fluxo + os 8 .jpg existem em disco',
    MAPS.every((r) => mapData.includes(`require('../../assets/maps/${r}.jpg')`)) &&
    !/require\([^)]*assets\/maps\/R[0-9][AB]\.png/.test(mapData) &&
    MAPS.every((r) => fs.existsSync(path.join(root, 'assets/maps', `${r}.jpg`))),
    'adventureMap ainda referencia PNG do mapa, ou faltam os JPGs em disco',
  );
  check(
    'Mapa M2.2: A/B oficial — A=DESPERTA/colorida, B=ADORMECIDA; desperta por engajamento',
    /comece_aqui:\s*\{\s*awake:\s*require\('\.\.\/\.\.\/assets\/maps\/R1A\.jpg'\),\s*asleep:\s*require\('\.\.\/\.\.\/assets\/maps\/R1B\.jpg'\)/.test(mapData) &&
    region.includes('awake ? imgs.awake : imgs.asleep') &&
    /isRegionAwake[\s\S]{0,260}isStoryCompleted\(s\.id\)[\s\S]{0,120}getStoryCompletionPercent\(s\.id\) > 0[\s\S]{0,40}s\.id === currentId/.test(mapScreen),
    'A/B invertido (A precisa ser awake/R1A) ou não considera progresso/atual',
  );
  check(
    'Mapa M2: emoji dormindo (😴) REMOVIDO de todos os arquivos do mapa',
    mapFiles.every((s) => !s.includes('😴')),
    'ainda há 😴 em algum arquivo do mapa',
  );
  check(
    'Mapa B3.4: caminho tracejado NÃO é mais renderizado no mapa (a trilha da arte guia); MapPath.js preservado',
    !region.includes('MapPath') &&
    !region.includes("from './MapPath'") &&
    fs.existsSync(path.join(root, 'src/components/map/MapPath.js')),
    'mapa ainda renderiza MapPath, ou MapPath.js foi removido',
  );
  check(
    'Mapa B3.2: marcadores reduzidos (current 68, available/completed 58, locked 56)',
    /SIZE = \{ current: 68, available: 58, completed: 58, locked: 56, nextLocked: 56 \}/.test(marker) &&
    marker.includes('getStoryCover(story.id)') &&
    /borderRadius:\s*inner\s*\/\s*2/.test(marker) &&
    marker.includes('fallback'),
    'marcadores não estão no tamanho médio (presença sem cobrir o mapa)',
  );
  check(
    'Mapa M2: 3 estados (bloqueado/atual/concluído) calculados por leitura',
    marker.includes("'completed'") && marker.includes("'current'") && marker.includes("'locked'") &&
    /getState[\s\S]{0,260}return 'completed'[\s\S]{0,160}return 'current'[\s\S]{0,160}'locked'/.test(mapScreen),
    'estados bloqueado/atual/concluído não definidos',
  );
  check(
    'Mapa M2: tocar no marco ABRE o card de foco (não navega seco)',
    mapScreen.includes('StoryFocusModal') &&
    mapScreen.includes('onPressStory={openFocus}') &&
    /openFocus[\s\S]{0,120}setModalVisible\(true\)/.test(mapScreen) &&
    focus.includes('Animated'),
    'toque no marco não abre o modal de foco com Animated',
  );
  check(
    'Mapa M2: a navegação para StoryDetail acontece no BOTÃO do modal (preservada)',
    /confirmOpenStory[\s\S]{0,200}navigation\.navigate\('StoryDetail', \{ story \}\)/.test(mapScreen) &&
    mapScreen.includes('onOpen={confirmOpenStory}'),
    'navegação para StoryDetail não está no botão do modal',
  );
  check(
    'Mapa M2.3: abrir história só pelos MARCOS (toque abre o card de foco)',
    mapScreen.includes('onPressStory={openFocus}') &&
    /openFocus[\s\S]{0,120}setModalVisible\(true\)/.test(mapScreen),
    'marcos não abrem o card de foco',
  );
  check(
    'Mapa M2: NÃO usa os Benis novos (08-11) — ficam para M3',
    mapFiles.every((s) => !/(require\(|from\s*)['"][^'"]*mascot\/beni\/(08|09|10|11)_/.test(s)),
    'arquivo do mapa importou um Beni novo (proibido no M2)',
  );
  check(
    'Mapa M2: estados são LEITURA — não altera accessControl/mediaReady/storage/progresso',
    mapScreen.includes("from '../services/contentAccessService'") &&
    mapScreen.includes("from '../context/ProgressContext'") &&
    mapFiles.every((s) => !s.includes('AsyncStorage')) &&
    mapFiles.every((s) => !/from '\.\.\/services\/accessControl'/.test(s)) &&
    mapFiles.every((s) => !/from '\.\.\/services\/mediaReadyService'/.test(s)),
    'mapa toca em accessControl/mediaReady/storage em vez de só ler',
  );

  // ── M2.1 polish ──
  check(
    'Mapa B1: SEM seams cobrindo a base (placeholder de pergaminho é permitido, atrás da arte)',
    !region.includes('seam') &&
    !region.includes('SEAM_H') &&
    region.includes('styles.placeholder'),
    'ainda há seam cobrindo a base, ou falta o placeholder de pergaminho',
  );
  check(
    'Mapa M3: jornada SOBE — A Criação (y 0.67) ABAIXO de Noé (y 0.29) por coordenada',
    /creation:\s*\{ x: 0\.73, y: 0\.67/.test(mapData) &&
    /noah:\s*\{ x: 0\.61, y: 0\.29/.test(mapData) &&
    region.includes('getStoryMapCoord(s.id'),
    'coordenadas não colocam A Criação abaixo de Noé / região não usa coords',
  );
  check(
    'Mapa M2.1: história atual com brilho (halo) — mais mágica',
    marker.includes('halo'),
    'marco da história atual sem halo/brilho',
  );
  check(
    'Mapa M2.1: título legível em pílula CLARA (sem tarja preta pesada)',
    /labelPill:\s*\{[\s\S]{0,160}rgba\(255,250,238/.test(marker),
    'título do marco ainda usa tarja escura pesada',
  );
  check(
    'Mapa M2.1: card de foco com abertura mágica (slide + scale + brilhos)',
    focus.includes('translateY: cardTranslateY') &&
    focus.includes('scale: cardScale') &&
    focus.includes('SPARKS'),
    'modal de foco sem slide/scale/brilhos',
  );
  check(
    'Mapa M2.1: botão principal do modal com gradiente premium (LinearGradient)',
    focus.includes("from 'expo-linear-gradient'") &&
    /primaryGrad|primaryBtn[\s\S]{0,200}LinearGradient/.test(focus) &&
    focus.includes('<LinearGradient'),
    'botão principal do modal não tem gradiente premium',
  );
  check(
    'Mapa M2.1: entrada mágica na aba (fade-in + slide do mapa, uma vez)',
    mapScreen.includes('entrance') &&
    /Animated\.timing\(entrance/.test(mapScreen) &&
    mapScreen.includes('entranceTranslate'),
    'mapa não tem animação de entrada (fade/slide)',
  );
  check(
    'Mapa M2.1: não instalou pacote novo (usa expo-linear-gradient já existente)',
    !!require(path.join(root, 'package.json')).dependencies['expo-linear-gradient'] &&
    !!require(path.join(root, 'package.json')).dependencies['react-native-svg'],
    'dependências de gradiente/svg ausentes (não instalar nada novo)',
  );

  // ── M2.2 estrutural: direção da jornada, R1 inteiro, scroll, header ──
  check(
    'Mapa M2.2: ordem VISUAL invertida (topo = Jovens da Fé, base = Comece Aqui)',
    mapScreen.includes('regions.slice().reverse()') &&
    mapScreen.includes('regionsVisual'),
    'regiões não foram invertidas para jornada de baixo para cima',
  );
  check(
    'Mapa M2.2: creation é a 1ª história da jornada (comece_aqui 1ª região + creation order 1)',
    /ADVENTURE_REGION_META = \[\s*\{\s*id:\s*'comece_aqui'/.test(mapData) &&
    /id:\s*'creation'[\s\S]{0,140}trackId:\s*'comece_aqui'[\s\S]{0,40}order:\s*1,/.test(readSrc('src/data/stories.js')),
    'creation não é o primeiro marco lógico da jornada',
  );
  check(
    'Mapa M5: altura SÓ proporcional via MAP_ASPECT (computeRegionHeight = width/MAP_ASPECT)',
    mapData.includes('export function computeRegionHeight') &&
    /computeRegionHeight\(width\)\s*\{\s*return Math\.round\(width \/ MAP_ASPECT\);/.test(mapData) &&
    region.includes('computeRegionHeight(width)') &&
    !region.includes('width * 1.32') &&
    !mapData.includes('Math.max(proportional') &&
    !mapData.includes('MARKER_MIN_GAP'),
    'altura da região não usa computeRegionHeight = width/MAP_ASPECT',
  );
  check(
    'Mapa M3: câmera por MARCO (coord do cameraStoryId) com clamp ~58% (sem scrollToEnd)',
    mapScreen.includes('cameraStoryId') &&
    mapScreen.includes('getStoryMapCoord(cameraStoryId)') &&
    mapScreen.includes('Math.min(anchorY - vp * 0.58, maxY)') &&
    mapScreen.includes('const maxY = Math.max(0, h - vp)') &&
    !mapScreen.includes('scrollToEnd'),
    'câmera não foca o marco atual por coordenada com clamp',
  );
  check(
    'Mapa B1: SEM overlap (marginTop negativo) — não corta a base da região',
    !region.includes('-OVERLAP') &&
    !region.includes('const OVERLAP') &&
    /const REGION_OVERLAP = 0\b/.test(mapScreen),
    'ainda há overlap negativo cobrindo a base da arte',
  );
  check(
    'Mapa B3.4: MapPath.js preserva o highlight da próxima aventura (mas não é mais usado no mapa)',
    mapPath.includes('highlightIndex') && !region.includes('highlightIndex'),
    'MapPath perdeu o highlight, ou o mapa ainda renderiza highlightIndex',
  );
  check(
    'Mapa M2.3: header refinado estilo pergaminho + subtítulo "Suba o caminho da fé"',
    mapScreen.includes("from 'expo-linear-gradient'") &&
    /<LinearGradient[\s\S]{0,200}styles\.header/.test(mapScreen) &&
    mapScreen.includes('Suba o caminho da fé'),
    'header não foi refinado / subtítulo errado',
  );
  check(
    'Mapa M2.2: card de foco com brilho atrás da capa (recompensa)',
    focus.includes('coverGlow') && focus.includes('SPARKS'),
    'modal sem brilho/partículas de recompensa',
  );
  check(
    'Mapa M2.2: marco da próxima aventura com pulso sutil (Animated.loop)',
    marker.includes('Animated.loop') && marker.includes('haloScale'),
    'marco atual sem pulso sutil',
  );

  // ── M2.3 limpeza: sem CTA inferior, zona segura do título, pílula de região, reorder ──
  check(
    'Mapa M2.3: CTA inferior REMOVIDO da renderização (não usa NextAdventureBanner)',
    !mapScreen.includes('NextAdventureBanner'),
    'o CTA inferior ainda é renderizado na tela do mapa',
  );
  check(
    'Mapa M2.3: zona segura do título — marcos só na banda (não usam a altura toda)',
    mapData.includes('export const REGION_TITLE_SAFE') &&
    mapData.includes('export function regionMarkerBand') &&
    /top:\s*0\.(1|3)/.test(mapData) && /bottom:\s*0\.8/.test(mapData),
    'sem zona segura do título / marcos podem colidir com o título da região',
  );
  check(
    'Mapa M2.7: pílula de região acompanha a rolagem (onScroll → activeIdx/activeRegion)',
    mapScreen.includes('setActiveIdx') &&
    mapScreen.includes('onScroll') &&
    mapScreen.includes('regionPill') &&
    mapScreen.includes('activeRegion?.title'),
    'sem pílula de região que acompanha a rolagem',
  );
  check(
    'Mapa M2.3: reorder oficial — jonah→descobridores/6, miraculous→descobridores/5, esther→pequeninos/4',
    /id:\s*'jonah_big_fish'[\s\S]{0,80}trackId:\s*'descobridores'[\s\S]{0,30}order:\s*6,/.test(storiesSrcMap) &&
    /id:\s*'miraculous_catch'[\s\S]{0,80}trackId:\s*'descobridores'[\s\S]{0,30}order:\s*5,/.test(storiesSrcMap) &&
    /id:\s*'esther_queen'[\s\S]{0,80}trackId:\s*'pequeninos'[\s\S]{0,30}order:\s*4,/.test(storiesSrcMap),
    'a troca oficial de posição de Jonas/Pesca/Ester não está correta',
  );
  check(
    'Mapa M2.3: creation continua abaixo de noah (markerFraction decresce com i)',
    mapData.includes('markerFraction') &&
    /b\.bottom - \(\(b\.bottom - b\.top\) \/ \(storyCount - 1\)\) \* index/.test(mapData),
    'creation/noah não respeitam o sentido de baixo para cima',
  );
  check(
    'Mapa M2.3: títulos longos em 2 linhas (sem ellipsis duro de 1 linha)',
    marker.includes('numberOfLines={2}') &&
    marker.includes("ellipsizeMode=\"tail\"") &&
    marker.includes('adjustsFontSizeToFit'),
    'títulos (Abraão/Samuel) ainda dependem de 1 linha com corte',
  );

  // ── M2.4 enquadramento + loading ──
  check(
    'Mapa FIX: arte com dimensões EXPLÍCITAS (width × regionH) — encolhe à caixa, sem recorte',
    region.includes('width, height: regionH') &&
    !/style=\{StyleSheet\.absoluteFill\}\s*\n\s*fadeDuration/.test(region) &&
    !region.includes('resizeMode="stretch"'),
    'arte não usa dimensões explícitas (volta a renderizar no tamanho do arquivo = zoom)',
  );
  check(
    'Mapa M2.4: placeholder de pergaminho NEUTRO (sem fundo azul/region.tint cru)',
    mapData.includes('export const REGION_PARCHMENT_BG') &&
    /REGION_PARCHMENT_BG\s*=\s*'#E7D6B0'/.test(mapData) &&
    region.includes('backgroundColor: REGION_PARCHMENT_BG') &&
    !region.includes('region.tint'),
    'fundo da região ainda usa cor crua (azul) em vez de pergaminho neutro',
  );
  check(
    'Mapa: arte FINAL é camada Image separada (reveal A/B) e só monta com renderImageFinal',
    region.includes('renderImageFinal && source') &&
    /<Image\b/.test(region) &&
    region.includes('source={source}'),
    'arte final não é camada Image separada/condicional',
  );
  check(
    'Mapa RENDER: arte final é LAZY por região (renderImageFinal por id, sem mountedAll) + offset síncrono',
    mapScreen.includes('renderImageFinal={loadedFinalIds.has(region.id)}') &&
    !mapScreen.includes('mountedAll') &&
    mapScreen.includes('contentOffset={{ x: 0, y: initialOffsetY }}'),
    'arte final não é lazy por região / sem offset inicial síncrono (risco de branco/pulo)',
  );
  check(
    'Mapa M2.4: NÃO instalou expo-image (usa Image do React Native)',
    !require(path.join(root, 'package.json')).dependencies['expo-image'] &&
    region.includes("from 'react-native'") &&
    region.includes('Image'),
    'expo-image foi instalado (não permitido) ou Image RN ausente',
  );

  // ── M2.7 dois modos: Caminhada Cinematográfica (principal) + Ver mapa (overview) ──
  check(
    'Mapa M2.7: modo PRINCIPAL cinematográfico — full-width + proporção, SEM contain como principal',
    region.includes('computeRegionHeight(width)') &&
    region.includes('resizeMode="cover"') &&
    !region.includes('resizeMode="contain"') &&
    !region.includes('alignSelf'),
    'modo principal não é full-width cinematográfico (ou usa contain)',
  );
  check(
    'Mapa B2: "Ver mapa" mostra a região INTEIRA via imageRect explícito (sem absoluteFill, sem zoom)',
    mapScreen.includes('Ver mapa') &&
    mapScreen.includes('overviewVisible') &&
    mapScreen.includes('openOverview') &&
    mapScreen.includes('computeImageRect(ovBox.w, ovBox.h)') &&
    /left: rect\.left, top: rect\.top, width: rect\.width, height: rect\.height/.test(mapScreen) &&
    mapScreen.includes('ovCard'),
    'overview não usa imageRect explícito (risco de zoom como o bug raiz)',
  );
  check(
    'Mapa B2.1: SEM preload pesado no mount (não compete com a 1ª pintura) + overview com placeholder/onError',
    !mapScreen.includes('preloadMapRegionAssets') &&
    !readSrc('src/services/assetPreloadService.js').includes('preloadMapRegionAssets') &&
    mapScreen.includes('ActivityIndicator') &&
    mapScreen.includes('onError={() => setOvLoaded(true)}'),
    'preload pesado ainda roda no mount, ou overview sem placeholder/onError',
  );
  check(
    'Mapa B2.3: marcadores por atraso CURTO (showOverlay ~400ms), NÃO por imageLoaded',
    !region.includes('imageLoaded') &&
    !region.includes('const ready =') &&
    region.includes('showOverlay') &&
    /setTimeout\(\(\) => setShowOverlay\(true\), OVERLAY_DELAY_MS\)/.test(region) &&
    region.includes('styles.overlayFront'),
    'marcadores não usam atraso curto (showOverlay) — voltaram a depender de carregamento',
  );
  check(
    'Mapa B2.3: placeholder de pergaminho (LinearGradient atrás da arte) + preload LEVE e TARDIO',
    region.includes('styles.placeholder') &&
    region.includes("from 'expo-linear-gradient'") &&
    /placeholder:\s*\{[\s\S]{0,80}zIndex:\s*0/.test(region) &&
    mapScreen.includes('InteractionManager.runAfterInteractions') &&
    !mapScreen.includes('preloadMapRegionAssets'),
    'sem placeholder/gradiente ou preload no mount (regressão) em vez de tardio',
  );
  check(
    'Mapa B2.5: PREVIEW leve por região (~60 KB) — 8 *_preview.jpg em disco (30–80 KB) + 4 pares no adventureMap',
    MAPS.every((r) => fs.existsSync(path.join(root, 'assets/maps', `${r}_preview.jpg`))) &&
    MAPS.every((r) => {
      const sz = fs.statSync(path.join(root, 'assets/maps', `${r}_preview.jpg`)).size;
      return sz >= 20 * 1024 && sz <= 90 * 1024; // alvo 30–80 KB, com folga
    }) &&
    MAPS.every((r) => mapData.includes(`require('../../assets/maps/${r}_preview.jpg')`)) &&
    mapData.includes('awakePreview') && mapData.includes('asleepPreview'),
    'faltam os 8 previews em disco/peso, ou adventureMap não declara awakePreview/asleepPreview',
  );
  check(
    'Mapa B2.5: MapRegion mostra PREVIEW de imediato (z1) e FINAL por cima (z2) — ambas dimensão explícita, sem absoluteFill',
    region.includes('previewSource') &&
    region.includes('awake ? imgs.awakePreview : imgs.asleepPreview') &&
    /previewSource &&[\s\S]{0,200}zIndex:\s*1/.test(region) &&
    /renderImageFinal && source[\s\S]{0,260}zIndex:\s*2/.test(region) &&
    !region.includes('absoluteFill}'),
    'MapRegion não alterna preview(z1)/final(z2) com dimensão explícita',
  );
  check(
    'Mapa B2.5: arte final escalonada por TEMPO (comece_aqui→…→jovens) + por PROXIMIDADE (activeIdx±1)',
    /loadedFinalIds.*new Set\(\['comece_aqui'\]\)/.test(mapScreen) &&
    /setTimeout\(\(\) => addFinal\('pequeninos'\), 300\)/.test(mapScreen) &&
    mapScreen.includes("addFinal('jovens_da_fe')") &&
    /\[activeIdx - 1, activeIdx, activeIdx \+ 1\]\.forEach\(\(i\) => addFinal\(regionsVisual\[i\]\?\.id\)\)/.test(mapScreen),
    'arte final não é escalonada (tempo/proximidade) com prioridade comece_aqui',
  );
  check(
    'Mapa B2.5: "Ver mapa" também usa preview imediata (spinner só sem preview)',
    mapScreen.includes('awakeReg ? imgs.awakePreview : imgs.asleepPreview') &&
    mapScreen.includes('!ovLoaded && !ovPreview'),
    'overview não usa preview imediata como o modo principal',
  );
  // ── B2.8 (corrigido): bases circulares REMOVIDAS; pins/labels menores + path suave ──
  check(
    'Mapa B2.8 fix: StoryStoneSlot REMOVIDO — arquivo apagado e sem referência no mapa',
    !fs.existsSync(path.join(root, 'src/components/map/StoryStoneSlot.js')) &&
    !region.includes('StoryStoneSlot') &&
    !marker.includes('<StoryStoneSlot') &&
    [mapScreen, mapData, mapPath, marker, region].every((s) => !s.includes('import StoryStoneSlot')),
    'StoryStoneSlot ainda existe ou continua referenciado',
  );
  check(
    'Mapa B3.4: SEM base/círculo e SEM caminho atrás dos marcos — só marcadores (overlayFront z7), título oculto',
    !region.includes('StoryStoneSlot') &&
    !region.includes('MapPath') &&
    !region.includes('overlayBack') &&
    /styles\.overlayFront[\s\S]{0,40}pointerEvents="box-none"/.test(region) &&
    /overlayFront:\s*\{[\s\S]{0,80}zIndex:\s*7/.test(region) &&
    region.includes('showLabel={false}'),
    'mapa ainda desenha base/caminho atrás dos marcos ou mostra título no pin',
  );
  check(
    'Mapa B3.2: labels menores (LABEL_W 84, fonte 9) — legenda, não cartão grande',
    /LABEL_W = 84/.test(marker) &&
    /label:\s*\{[\s\S]{0,120}fontSize:\s*9\b/.test(marker),
    'labels não foram reduzidos (LABEL_W/fonte)',
  );
  check(
    'Mapa B3.4: título OCULTO no mapa via showLabel (default true; gate no render) — accessibilityLabel preservado',
    /showLabel = true/.test(marker) &&
    /\{showLabel &&[\s\S]{0,80}styles\.labelBox/.test(marker) &&
    marker.includes('accessibilityLabel={`${story.titulo}') &&
    marker.includes('{story.titulo}'),
    'marker não tem showLabel/gate do título ou perdeu accessibilityLabel/titulo',
  );
  check(
    'Mapa B3.5: markerScale por história (clamp 0.85–1.25) — pin maior/menor sem mudar o global',
    /markerScale = 1/.test(marker) &&
    /Math\.min\(1\.25, Math\.max\(0\.85, markerScale/.test(marker) &&
    /Math\.round\(\(SIZE\[state\] \|\| SIZE\.available\) \* scale\)/.test(marker) &&
    region.includes('markerScale={it.markerScale}') &&
    region.includes('coord.markerScale') &&
    /creation:\s*\{[^}]*markerScale: 1\.22/.test(mapData) &&
    /noah:\s*\{[^}]*markerScale: 1\.10/.test(mapData),
    'markerScale ausente / sem clamp / não propagado das coords ao marcador',
  );
  check(
    'Mapa B3.6: paleta de PIN por região (completed/current) — sem verde fixo; 4 regiões com cores próprias',
    /comece_aqui[\s\S]{0,140}completedColor: '#8E5CF7'[\s\S]{0,40}currentColor: '#B48CFF'/.test(mapData) &&
    /pequeninos[\s\S]{0,140}completedColor: '#D59A2E'/.test(mapData) &&
    /descobridores[\s\S]{0,140}completedColor: '#2F9E9E'/.test(mapData) &&
    /jovens_da_fe[\s\S]{0,140}completedColor: '#B56AD8'/.test(mapData) &&
    region.includes('completedColor={region.completedColor}') &&
    region.includes('currentColor={region.currentColor}'),
    'paleta de pin por região ausente ou não propagada ao marcador',
  );
  check(
    'Mapa B3.6: StoryMapMarker usa completedColor/currentColor (borda + badge + halo), sem verde fixo no render',
    /completedColor = '#5EBE6E'/.test(marker) &&
    /currentColor = '#F4B73E'/.test(marker) &&
    /const ringColor = state === 'completed' \? completedColor[\s\S]{0,60}isCurrent \? currentColor/.test(marker) &&
    marker.includes('borderColor: ringColor') &&
    /doneBadge,\s*\{ backgroundColor: completedColor \}/.test(marker) &&
    marker.includes('`${currentColor}33`') &&
    marker.includes('shadowColor: currentColor'),
    'marcador não aplica as cores da região em borda/badge/halo',
  );
  check(
    'Mapa B3.6: pulso na cor da região, calmo (1100–1600ms); completed estável; capa locked esmaecida',
    /if \(!shouldPulse\) return undefined/.test(marker) &&
    /duration: 1[1-6]\d\d/.test(marker) &&
    /coverDim = isLocked \? 0\.55/.test(marker) &&
    marker.includes('haloScale'),
    'pulso fora da faixa de duração / sem cor da região / locked não esmaecido',
  );
  check(
    'Mapa B3.7: AdventureMapScreen calcula nextLocked (1ª da trilha não concluída e bloqueada) sem mudar acesso',
    mapScreen.includes('ordered.find((s) => !isStoryCompleted(s.id))') &&
    /const currentId = useMemo\(\s*\(\) => \(nextJourney && isOpenable\(nextJourney\)/.test(mapScreen) &&
    /const nextLockedId = useMemo\(\s*\(\) => \(nextJourney && !isOpenable\(nextJourney\)/.test(mapScreen) &&
    /story\.id === nextLockedId\) return 'nextLocked'/.test(mapScreen) &&
    !mapScreen.includes('AsyncStorage'),
    'nextLocked não é derivado da trilha em getState (ou mexe em storage)',
  );
  check(
    'Mapa B3.7: só UM pulsa (current OU nextLocked); nextLocked = visual locked + pulso; toque preserva fluxo locked',
    marker.includes('shouldPulse = isCurrent || isNextLocked') &&
    /SIZE = \{[^}]*nextLocked: 56/.test(marker) &&
    /RING = \{[\s\S]*?nextLocked:\s*\{/.test(marker) &&
    marker.includes('showLock = isLocked || isNextLocked') &&
    marker.includes('isNextLocked ? NEXTLOCKED_COLOR') &&
    region.includes('completedColor={region.completedColor}') &&
    /st === 'nextLocked' \? 'locked' : st/.test(mapScreen),
    'nextLocked não compartilha visual locked+pulso, ou toque não preserva o locked',
  );
  check(
    'Mapa B3.8: nextLocked usa cor GLOBAL azul celeste (#4FC3FF / brilho #EAFBFF), não a cor da região',
    /NEXTLOCKED_COLOR = '#4FC3FF'/.test(marker) &&
    /NEXTLOCKED_GLOW = '#EAFBFF'/.test(marker) &&
    marker.includes('isNextLocked ? NEXTLOCKED_COLOR') &&
    marker.includes('haloFill = isNextLocked ? `${NEXTLOCKED_COLOR}40`') &&
    marker.includes('shadowColor: NEXTLOCKED_COLOR') &&
    marker.includes('outputRange: isNextLocked ? [0.3, 0.6]'),
    'nextLocked não usa a cor global azul celeste na borda/halo/pulso',
  );
  check(
    'Mapa B2.8: caminho suavizado (traço fino 4, dash curto "9 12", opacidade menor, sombra leve)',
    /strokeWidth=\{4\}[\s\S]{0,80}strokeDasharray="9 12"/.test(mapPath) &&
    mapPath.includes('opacity={0.62}') &&
    !mapPath.includes('strokeWidth={11}'),
    'caminho não foi suavizado (ainda pesado)',
  );
  check(
    'Mapa M2.7: overview não usa preto puro nem azul (fundo escurecido quente)',
    /ovBackdrop:\s*\{[\s\S]{0,120}rgba\(38,28,14/.test(mapScreen) &&
    !/ovBackdrop:\s*\{[\s\S]{0,120}#000000|rgba\(0,\s*0,\s*0,\s*1\)/.test(mapScreen),
    'overview usa fundo preto puro',
  );
  check(
    'Mapa M5: MAP_ASPECT = 9/16 (FONTE ÚNICA) + computeImageRect para a Visão Geral',
    mapData.includes('export const MAP_ASPECT = 9 / 16') &&
    mapData.includes('export function computeImageRect'),
    'MAP_ASPECT não é 9/16 ou computeImageRect ausente',
  );
  check(
    'Mapa M2.7: sem CTA inferior e ordem oficial preservada (stories.js intacto)',
    !mapScreen.includes('NextAdventureBanner') &&
    /id:\s*'jonah_big_fish'[\s\S]{0,80}trackId:\s*'descobridores'[\s\S]{0,30}order:\s*6,/.test(storiesSrcMap) &&
    /id:\s*'esther_queen'[\s\S]{0,80}trackId:\s*'pequeninos'[\s\S]{0,30}order:\s*4,/.test(storiesSrcMap),
    'CTA voltou ou ordem Jonas/Ester alterada',
  );

  // ── M3 geometria base: coordenadas explícitas (fonte única), path = pins, chip interno ──
  {
    const MAP_STORY_IDS = [
      'creation', 'noah', 'david_goliath', 'jesus_children', 'daniel_lions', 'esther_queen',
      'lost_sheep', 'good_samaritan', 'abraham_stars', 'joseph_colorful_coat', 'moses_red_sea',
      'ruth_naomi', 'miraculous_catch', 'jonah_big_fish', 'samuel_hears_god', 'josiah_young_king',
      'solomon_wisdom', 'mary_says_yes', 'timothy_faith', 'jesus_temple',
    ];
    const missingCoord = MAP_STORY_IDS.filter((id) => !new RegExp(`\\n\\s*${id}:\\s*\\{ x: [01]?\\.\\d+, y: [01]?\\.\\d+, label: '(below|left|right)'(?:, markerScale: [01]?\\.\\d+)? \\}`).test(mapData));
    check(
      'Mapa M3: TODAS as 20 histórias do mapa têm coordenada explícita {x,y,label}',
      mapData.includes('export const STORY_MAP_COORDS') && missingCoord.length === 0,
      `histórias sem coordenada explícita: ${missingCoord.join(', ')}`,
    );
  }
  check(
    'Mapa M3: fonte única — região deriva pontos das COORDS (não de fórmula de índice)',
    region.includes('getStoryMapCoord(s.id, i, n)') &&
    !region.includes('markerFraction(') &&
    !/colX\[i % 2\]/.test(region),
    'região ainda usa fórmula de índice como fonte de posição',
  );
  check(
    'Mapa B3.4: marcadores derivam das COORDS (items = list.map por getStoryMapCoord), sem caminho desenhado',
    region.includes('list.map((s, i)') &&
    region.includes('x: Math.round(coord.x * width)') &&
    region.includes('y: Math.round(coord.y * regionH)') &&
    !region.includes('MapPath'),
    'marcadores não derivam das coords / ainda há MapPath',
  );
  check(
    'Mapa M3: chip de título INTERNO (zona segura) — sem pílula flutuante duplicada',
    region.includes('chipWrap') &&
    region.includes('CHIP_SAFE_Y') &&
    !/<View style=\{styles\.regionPillWrap\}/.test(mapScreen),
    'há duplicação de chip (interno + flutuante) ou falta chip interno seguro',
  );
  check(
    'Mapa M3: labels protegidos por lado (below/left/right), até 2 linhas',
    marker.includes('labelPos') &&
    marker.includes('labelBoxStyle') &&
    /labelPos[\s\S]{0,40}'below'/.test(marker) &&
    marker.includes('numberOfLines={2}'),
    'labels não têm posicionamento seguro por lado / 2 linhas',
  );
  check(
    'Mapa B3.2: marcadores no novo tamanho reduzido (current 68) — nem mini, nem gigante',
    /SIZE = \{ current: 68, available: 58, completed: 58, locked: 56, nextLocked: 56 \}/.test(marker),
    'marcadores fora do tamanho reduzido B3.2',
  );

  // ── M2.5B Full-Bleed Recovery (desfaz o frame 0.86 do M2.5) ──
  check(
    'Mapa M2.5B: mapFrameWidth REMOVIDO — sem frame estreito (0.86) no mapa',
    !mapData.includes('mapFrameWidth') &&
    !mapScreen.includes('mapFrameWidth') &&
    !mapData.includes('0.86') &&
    !region.includes('frameWidth') &&
    !mapScreen.includes('frameWidth'),
    'mapFrameWidth/0.86/frameWidth ainda presentes (frame estreito)',
  );
  check(
    'Mapa M2.5B: região FULL-BLEED — largura total da tela, sem moldura central',
    /region:\s*\{[\s\S]{0,160}width:\s*'100%'/.test(region) &&
    !region.includes("alignSelf: 'center'") &&
    region.includes('computeRegionHeight(width)') &&
    region.includes('width, height: regionH'),
    'região não é full-bleed (ainda tem frame/alignSelf central)',
  );
  check(
    'Mapa M2.5B: container do mapa em pergaminho claro (sem preto #2B2114, sem borda lateral)',
    mapScreen.includes('backgroundColor: REGION_PARCHMENT_BG') &&
    !mapScreen.includes('#2B2114'),
    'container do mapa ainda tem fundo preto/escuro',
  );
  check(
    'Mapa M5/FIX: regionHeight = width/MAP_ASPECT (9:16) + arte cover na caixa explícita',
    /computeRegionHeight\(width\)\s*\{\s*return Math\.round\(width \/ MAP_ASPECT\);/.test(mapData) &&
    region.includes('resizeMode="cover"') &&
    region.includes('width, height: regionH'),
    'proporção/resize do mapa incorretos',
  );
  check(
    'Mapa M5: nenhuma proporção 768/2048 remanescente em adventureMap/MapRegion',
    !/2048|(\b768\b)/.test(mapData) &&
    !/2048|(\b768\b)/.test(region),
    'ainda há proporção 768/2048 hardcoded fora de MAP_ASPECT',
  );
}

check(
  'StoryBookScreen importa hasMeaningfulPaint de drawingStorage',
  storyBookSrc.includes('hasMeaningfulPaint') &&
  storyBookSrc.includes("from '../services/drawingStorage'"),
  'StoryBookScreen não importa hasMeaningfulPaint',
);

check(
  'StoryBookScreen usa hasMeaningfulPaint no modo colorido (não usa childArt sem tinta real)',
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

// ── Sprint 1 — Fundação de Dados do MVP Completo ─────────────────────────────

console.log('\n── Sprint 1 — Fundação de Dados do MVP Completo ──');

const storageKeysSrc      = fs.readFileSync(path.join(__dirname, '../src/services/storageKeys.js'), 'utf8');
const appDataModelSrc     = fs.readFileSync(path.join(__dirname, '../src/data/appDataModel.js'), 'utf8');
const childProfileSvcSrc  = fs.readFileSync(path.join(__dirname, '../src/services/childProfileService.js'), 'utf8');
const parentSettingsSrc   = fs.readFileSync(path.join(__dirname, '../src/services/parentSettingsService.js'), 'utf8');
const churchModeSrc       = fs.readFileSync(path.join(__dirname, '../src/services/churchModeService.js'), 'utf8');
const certificateSvcSrc   = fs.readFileSync(path.join(__dirname, '../src/services/certificateService.js'), 'utf8');
const shareCardSvcSrc     = fs.readFileSync(path.join(__dirname, '../src/services/shareCardService.js'), 'utf8');
const weeklyReportSvcSrc  = fs.readFileSync(path.join(__dirname, '../src/services/weeklyReportService.js'), 'utf8');
const migrationSvcSrc     = fs.readFileSync(path.join(__dirname, '../src/services/storageMigrationService.js'), 'utf8');
const profileCtxSrc       = fs.readFileSync(path.join(__dirname, '../src/context/ProfileContext.js'), 'utf8');
const appNavigatorSrc     = fs.readFileSync(path.join(__dirname, '../src/navigation/AppNavigator.js'), 'utf8');

check(
  'storageKeys.js existe e exporta APP_STORAGE_SCHEMA_VERSION',
  storageKeysSrc.includes('export const APP_STORAGE_SCHEMA_VERSION'),
  'storageKeys.js não exporta APP_STORAGE_SCHEMA_VERSION',
);

check(
  'storageKeys.js exporta STORAGE_KEYS com chaves essenciais',
  storageKeysSrc.includes('SCHEMA_VERSION') &&
  storageKeysSrc.includes('LEGACY_PROFILE') &&
  storageKeysSrc.includes('ACHIEVEMENTS_SEEN') &&
  storageKeysSrc.includes('BONUS_STARS') &&
  storageKeysSrc.includes('CHILD_PROFILES_LIST'),
  'storageKeys.js não contém todas as chaves essenciais',
);

check(
  'appDataModel.js existe e exporta factories obrigatórias',
  appDataModelSrc.includes('export function createChildProfile') &&
  appDataModelSrc.includes('export function createDefaultParentSettings') &&
  appDataModelSrc.includes('export function createDefaultPlanState') &&
  appDataModelSrc.includes('export function createChurchGroup') &&
  appDataModelSrc.includes('export function createCertificateRecord') &&
  appDataModelSrc.includes('export function createShareCardRecord') &&
  appDataModelSrc.includes('export function createWeeklyReport') &&
  appDataModelSrc.includes('export function createMigrationResult'),
  'appDataModel.js não exporta todas as factories obrigatórias',
);

check(
  'childProfileService.js exporta funções obrigatórias',
  childProfileSvcSrc.includes('export async function getChildProfiles') &&
  childProfileSvcSrc.includes('export async function getActiveChildProfile') &&
  childProfileSvcSrc.includes('export async function createChildProfile') &&
  childProfileSvcSrc.includes('export async function updateChildProfile') &&
  childProfileSvcSrc.includes('export async function setActiveChildProfile') &&
  childProfileSvcSrc.includes('export async function deleteChildProfile') &&
  childProfileSvcSrc.includes('export async function ensureDefaultChildProfile') &&
  childProfileSvcSrc.includes('export async function migrateLegacyProfileIfNeeded'),
  'childProfileService.js não exporta todas as funções obrigatórias',
);

check(
  'parentSettingsService.js exporta funções obrigatórias',
  parentSettingsSrc.includes('export async function getParentSettings') &&
  parentSettingsSrc.includes('export async function updateParentSettings') &&
  parentSettingsSrc.includes('export async function resetParentSettings') &&
  parentSettingsSrc.includes('export async function getParentalConsent') &&
  parentSettingsSrc.includes('export async function acceptParentalConsent') &&
  parentSettingsSrc.includes('export async function revokeParentalConsent'),
  'parentSettingsService.js não exporta todas as funções obrigatórias',
);

check(
  'churchModeService.js exporta funções obrigatórias',
  churchModeSrc.includes('export async function getChurchGroups') &&
  churchModeSrc.includes('export async function createChurchGroup') &&
  churchModeSrc.includes('export async function updateChurchGroup') &&
  churchModeSrc.includes('export async function deleteChurchGroup') &&
  churchModeSrc.includes('export async function getChurchGroupByInviteCode') &&
  churchModeSrc.includes('export async function setWeeklyStory') &&
  churchModeSrc.includes('export async function getChurchProgressSummary'),
  'churchModeService.js não exporta todas as funções obrigatórias',
);

check(
  'certificateService.js exporta funções obrigatórias',
  certificateSvcSrc.includes('export async function createStoryCertificate') &&
  certificateSvcSrc.includes('export async function createTrackCertificate') &&
  certificateSvcSrc.includes('export async function listCertificatesByChild') &&
  certificateSvcSrc.includes('export async function getCertificate') &&
  certificateSvcSrc.includes('export async function deleteCertificate'),
  'certificateService.js não exporta todas as funções obrigatórias',
);

check(
  'shareCardService.js exporta funções obrigatórias',
  shareCardSvcSrc.includes('export async function createShareCardRecord') &&
  shareCardSvcSrc.includes('export async function listShareCardsByChild') &&
  shareCardSvcSrc.includes('export async function getShareCardRecord') &&
  shareCardSvcSrc.includes('export async function deleteShareCardRecord') &&
  shareCardSvcSrc.includes('export async function buildSafeShareCardPayload'),
  'shareCardService.js não exporta todas as funções obrigatórias',
);

check(
  'shareCardService.js garante safeForSharing:true no payload',
  shareCardSvcSrc.includes('safeForSharing: true'),
  'shareCardService.js não garante safeForSharing:true no payload',
);

check(
  'weeklyReportService.js exporta funções obrigatórias',
  weeklyReportSvcSrc.includes('export async function buildWeeklyReport') &&
  weeklyReportSvcSrc.includes('export async function saveWeeklyReport') &&
  weeklyReportSvcSrc.includes('export async function getLatestWeeklyReport') &&
  weeklyReportSvcSrc.includes('export async function listWeeklyReportsByChild') &&
  weeklyReportSvcSrc.includes('export async function deleteWeeklyReport'),
  'weeklyReportService.js não exporta todas as funções obrigatórias',
);

check(
  'storageMigrationService.js exporta funções obrigatórias',
  migrationSvcSrc.includes('export async function getCurrentSchemaVersion') &&
  migrationSvcSrc.includes('export async function setCurrentSchemaVersion') &&
  migrationSvcSrc.includes('export async function runLocalMigrations') &&
  migrationSvcSrc.includes('export async function migrateToV1') &&
  migrationSvcSrc.includes('export async function getMigrationStatus'),
  'storageMigrationService.js não exporta todas as funções obrigatórias',
);

check(
  'storageMigrationService.js é idempotente (chama migrateLegacyProfileIfNeeded)',
  migrationSvcSrc.includes('migrateLegacyProfileIfNeeded'),
  'storageMigrationService.js não referencia migrateLegacyProfileIfNeeded',
);

check(
  'ProfileContext ainda exporta ProfileProvider e useProfile',
  profileCtxSrc.includes('export function ProfileProvider') &&
  profileCtxSrc.includes('export function useProfile'),
  'ProfileContext não exporta ProfileProvider ou useProfile',
);

check(
  'ProfileContext mantém chave legada @ptf_profile intacta',
  profileCtxSrc.includes('@ptf_profile'),
  'ProfileContext não referencia mais @ptf_profile (pode ter quebrado compatibilidade)',
);

check(
  'Nenhuma rota foi removida do AppNavigator',
  appNavigatorSrc.includes('NarrationScreen') &&
  appNavigatorSrc.includes('ColoringScreen') &&
  appNavigatorSrc.includes('StoryBookScreen') &&
  appNavigatorSrc.includes('PostStoryHubScreen') &&
  appNavigatorSrc.includes('QuizScreen'),
  'Uma ou mais rotas críticas foram removidas do AppNavigator',
);

check(
  'planConfig.js continua existindo',
  fs.existsSync(path.join(__dirname, '../src/data/planConfig.js')),
  'planConfig.js foi apagado',
);

check(
  'stories.js continua com 20 histórias',
  (() => {
    const src = fs.readFileSync(path.join(__dirname, '../src/data/stories.js'), 'utf8');
    const matches = src.match(/id:\s*['"`][a-z_]+['"`]/g);
    return matches && matches.length >= 20;
  })(),
  'stories.js contém menos de 20 histórias',
);

check(
  'audioManifest.js continua existindo',
  fs.existsSync(path.join(__dirname, '../src/data/audioManifest.js')),
  'audioManifest.js foi apagado',
);

check(
  'storySceneIllustrations.js continua existindo',
  fs.existsSync(path.join(__dirname, '../src/data/storySceneIllustrations.js')),
  'storySceneIllustrations.js foi apagado',
);

check(
  'drawingStorage.js continua existindo',
  fs.existsSync(path.join(__dirname, '../src/services/drawingStorage.js')),
  'drawingStorage.js foi apagado',
);

check(
  'achievementService.js continua existindo',
  fs.existsSync(path.join(__dirname, '../src/services/achievementService.js')),
  'achievementService.js foi apagado',
);

// ── Sprint 2 — Onboarding Progressivo com Beni ───────────────────────────────

console.log('\n── Sprint 2 — Onboarding Progressivo com Beni ──');

const onboardingSvcSrc   = fs.readFileSync(path.join(__dirname, '../src/services/onboardingService.js'), 'utf8');
const onboardingScreenSrc = fs.readFileSync(path.join(__dirname, '../src/screens/OnboardingScreen.js'), 'utf8');
const splashSrcS2        = fs.readFileSync(path.join(__dirname, '../src/screens/SplashScreen.js'), 'utf8');
const appNavSrcS2        = fs.readFileSync(path.join(__dirname, '../src/navigation/AppNavigator.js'), 'utf8');
const storageKeysSrcS2   = fs.readFileSync(path.join(__dirname, '../src/services/storageKeys.js'), 'utf8');

check(
  'OnboardingScreen existe',
  fs.existsSync(path.join(__dirname, '../src/screens/OnboardingScreen.js')),
  'OnboardingScreen.js não foi criado',
);

check(
  'onboardingService.js existe',
  fs.existsSync(path.join(__dirname, '../src/services/onboardingService.js')),
  'onboardingService.js não foi criado',
);

check(
  'onboardingService exporta getOnboardingState',
  onboardingSvcSrc.includes('export async function getOnboardingState'),
  'onboardingService não exporta getOnboardingState',
);

check(
  'onboardingService exporta markOnboardingCompleted',
  onboardingSvcSrc.includes('export async function markOnboardingCompleted'),
  'onboardingService não exporta markOnboardingCompleted',
);

check(
  'onboardingService exporta resetOnboarding',
  onboardingSvcSrc.includes('export async function resetOnboarding'),
  'onboardingService não exporta resetOnboarding',
);

check(
  'onboardingService exporta shouldShowOnboarding',
  onboardingSvcSrc.includes('export async function shouldShowOnboarding'),
  'onboardingService não exporta shouldShowOnboarding',
);

check(
  'storageKeys.js contém chave de onboarding',
  storageKeysSrcS2.includes('ONBOARDING_STATE') && storageKeysSrcS2.includes('@ptf_onboarding'),
  'storageKeys.js não contém chave ONBOARDING_STATE',
);

check(
  'Rota Onboarding está registrada no AppNavigator',
  appNavSrcS2.includes("name=\"Onboarding\"") && appNavSrcS2.includes('OnboardingScreen'),
  'Rota Onboarding não foi registrada no AppNavigator',
);

check(
  'SplashScreen possui decisão segura de onboarding',
  splashSrcS2.includes('shouldShowOnboarding') && splashSrcS2.includes('Onboarding'),
  'SplashScreen não possui decisão de onboarding',
);

check(
  'OnboardingScreen usa BeniAvatar',
  onboardingScreenSrc.includes('BeniAvatar'),
  'OnboardingScreen não usa BeniAvatar (Beni deve ser o guia)',
);

check(
  'childProfileService continua existindo',
  fs.existsSync(path.join(__dirname, '../src/services/childProfileService.js')),
  'childProfileService.js foi apagado',
);

check(
  'ProfileContext continua existindo',
  fs.existsSync(path.join(__dirname, '../src/context/ProfileContext.js')),
  'ProfileContext.js foi apagado',
);

check(
  'Nenhuma rota antiga foi removida do AppNavigator',
  appNavSrcS2.includes('NarrationScreen') &&
  appNavSrcS2.includes('ColoringScreen') &&
  appNavSrcS2.includes('StoryBookScreen') &&
  appNavSrcS2.includes('PostStoryHubScreen') &&
  appNavSrcS2.includes('QuizScreen') &&
  appNavSrcS2.includes('ParentAreaScreen'),
  'Uma ou mais rotas antigas foram removidas do AppNavigator',
);

check(
  'HomeScreen continua existindo',
  fs.existsSync(path.join(__dirname, '../src/screens/HomeScreen.js')),
  'HomeScreen.js foi apagado',
);

check(
  'ProfileScreen continua existindo',
  fs.existsSync(path.join(__dirname, '../src/screens/ProfileScreen.js')),
  'ProfileScreen.js foi apagado',
);

check(
  'stories.js continua com A Criação',
  (() => {
    const src = fs.readFileSync(path.join(__dirname, '../src/data/stories.js'), 'utf8');
    return src.includes("id: 'creation'") && src.includes("titulo: 'A Criação'");
  })(),
  'stories.js não contém a história da Criação',
);

check(
  'OnboardingScreen não contém palavras de preço ou paywall',
  !onboardingScreenSrc.match(/\b(preço|assinatura|premium|comprar|plano|plan|price|subscribe|paywall)\b/i),
  'OnboardingScreen contém palavras de preço ou paywall (não deve aparecer para criança)',
);

check(
  'OnboardingScreen não pede email, telefone, idade ou senha',
  !onboardingScreenSrc.match(/\b(email|e-mail|telefone|phone|idade|age|senha|password)\b/i),
  'OnboardingScreen pede dados sensíveis (email/telefone/idade/senha)',
);

// ── Sprint 2.1 — Hotfix do Onboarding + Polimento Mágico Visual ─────────────

console.log('\n── Sprint 2.1 — Hotfix + Polimento Visual ──');

const narrationScreenSrc = fs.readFileSync(path.join(__dirname, '../src/screens/NarrationScreen.js'), 'utf8');

check(
  'OnboardingScreen importa stories canônicas para navegação final',
  onboardingScreenSrc.includes("from '../data/stories'"),
  'OnboardingScreen deve importar stories de data/stories para resolver história completa com cenas',
);

check(
  'OnboardingScreen tem resolveFullStory para catálogo canônico',
  onboardingScreenSrc.includes('resolveFullStory') && onboardingScreenSrc.includes('allStories.find'),
  'OnboardingScreen não tem resolveFullStory — história passada para navegação pode não ter cenas',
);

check(
  'OnboardingScreen navega com história resolvida do catálogo canônico',
  onboardingScreenSrc.includes('resolveFullStory(selectedStoryId)') &&
  (onboardingScreenSrc.includes('story: fullStory') || onboardingScreenSrc.includes("params: { story: fullStory")),
  'OnboardingScreen deve chamar resolveFullStory(selectedStoryId) e navegar com o resultado',
);

check(
  'NarrationScreen tem guarda contra story sem cenas',
  narrationScreenSrc.includes('hasCenas') || narrationScreenSrc.includes('story?.cenas?.length'),
  'NarrationScreen não tem guarda: crash se story não tiver cenas',
);

check(
  'NarrationScreen não acessa story.cenas sem validação prévia',
  !narrationScreenSrc.match(/const cena = story\.cenas\[cenaIndex\]/),
  'NarrationScreen acessa story.cenas[cenaIndex] diretamente sem verificar hasCenas',
);

check(
  'OnboardingScreen não promete áudio para Noé',
  (() => {
    const noahLines = onboardingScreenSrc.split('\n').filter(l => l.toLowerCase().includes('noah'));
    return !noahLines.some(l => /narr[aã]|áudio|audio|som\b/i.test(l));
  })(),
  'OnboardingScreen promete áudio para a história de Noé (áudio ainda não existe)',
);

check(
  'OnboardingScreen usa LinearGradient no fundo mágico',
  onboardingScreenSrc.includes('LinearGradient') && onboardingScreenSrc.includes('expo-linear-gradient'),
  'OnboardingScreen não usa LinearGradient — visual mágico não implementado',
);

check(
  'OnboardingScreen tem maxLength no campo de nome',
  onboardingScreenSrc.includes('maxLength'),
  'OnboardingScreen não tem maxLength no TextInput do nome',
);

// ── Sprint 2.2 — Reset Seguro do Onboarding para QA e Proteção de Usuários Legados ──

console.log('\n── Sprint 2.2 — Reset Seguro + Proteção Legada ──');

check(
  'onboardingService exporta resetOnboardingForQa',
  onboardingSvcSrc.includes('export async function resetOnboardingForQa'),
  'onboardingService não exporta resetOnboardingForQa — reset seguro de QA não está disponível',
);

check(
  'shouldShowOnboarding verifica perfil legado (@ptf_profile)',
  onboardingSvcSrc.includes('LEGACY_PROFILE') || onboardingSvcSrc.includes("'@ptf_profile'"),
  'shouldShowOnboarding não verifica @ptf_profile — usuários antigos podem ver onboarding indesejado',
);

check(
  'shouldShowOnboarding marca onboarding concluído ao encontrar perfil legado válido',
  (() => {
    const fn = onboardingSvcSrc.indexOf('shouldShowOnboarding');
    const snippet = onboardingSvcSrc.slice(fn, fn + 800);
    return snippet.includes('markOnboardingCompleted') && snippet.includes('legacy');
  })(),
  'shouldShowOnboarding não chama markOnboardingCompleted para proteger usuários legados',
);

check(
  'ParentAreaScreen contém opção de rever apresentação do Beni',
  parentAreaSrc.includes('Rever apresentação do Beni'),
  'ParentAreaScreen não tem a opção "Rever apresentação do Beni" no modo QA',
);

check(
  'ParentAreaScreen chama resetOnboardingForQa',
  parentAreaSrc.includes('resetOnboardingForQa'),
  'ParentAreaScreen não chama resetOnboardingForQa — botão de reset não está conectado',
);

check(
  'resetOnboardingForQa não usa AsyncStorage.clear',
  !onboardingSvcSrc.match(/resetOnboardingForQa[\s\S]{0,500}AsyncStorage\.clear/),
  'resetOnboardingForQa chama AsyncStorage.clear() — apagaria TODOS os dados do app!',
);

check(
  'resetOnboardingForQa usa writeState com DEFAULT_STATE (reset seguro)',
  (() => {
    const fn = onboardingSvcSrc.indexOf('resetOnboardingForQa');
    const snippet = onboardingSvcSrc.slice(fn, fn + 300);
    return snippet.includes('writeState') && snippet.includes('DEFAULT_STATE');
  })(),
  'resetOnboardingForQa não usa writeState com DEFAULT_STATE — comportamento de reset não verificado',
);

// ── Sprint 2.3 — Correção Visual da Etapa de Nome do Onboarding ─────────────

console.log('\n── Sprint 2.3 — Correção Visual Etapa Nome ──');

check(
  'OnboardingScreen TextInput tem placeholder descritivo com "Digite"',
  onboardingScreenSrc.includes('Digite seu nome'),
  'Placeholder do TextInput não é descritivo — usuário pode não saber onde digitar',
);

check(
  'OnboardingScreen Beni usa tamanho compacto na etapa de nome',
  onboardingScreenSrc.includes("'name' ? 'medium'") ||
  onboardingScreenSrc.includes("=== 'name' ? 'medium'") ||
  // Sprint 2.4: renderNameStep tem layout próprio com size="medium" direto
  (onboardingScreenSrc.includes('function renderNameStep') && onboardingScreenSrc.includes('size="medium"')),
  'Beni sempre usa tamanho hero na etapa de nome — pode deixar sem espaço para o TextInput',
);

check(
  'OnboardingScreen TextInput tem altura mínima garantida (minHeight >= 56)',
  onboardingScreenSrc.includes('minHeight: 60') || onboardingScreenSrc.includes('minHeight: 56') || onboardingScreenSrc.includes('minHeight: 64'),
  'TextInput não tem minHeight — pode ficar invisível com teclado aberto no iPhone',
);

check(
  'OnboardingScreen usa KeyboardAvoidingView para tratar teclado',
  onboardingScreenSrc.includes('KeyboardAvoidingView'),
  'OnboardingScreen não usa KeyboardAvoidingView — botão pode ficar coberto pelo teclado',
);

// ── Sprint 2.4 — Correção Real da Etapa de Nome do Onboarding ────────────────

console.log('\n── Sprint 2.4 — Correção Estrutural Etapa Nome ──');

check(
  'OnboardingScreen tem função renderNameStep dedicada',
  onboardingScreenSrc.includes('function renderNameStep'),
  'renderNameStep não existe — etapa de nome ainda usa layout compartilhado que colapsa com teclado',
);

check(
  'OnboardingScreen retorna renderNameStep() antes do layout geral (early return)',
  onboardingScreenSrc.includes("currentStep === 'name') return renderNameStep()"),
  'Não há early return para a etapa de nome — renderNameStep() não é chamada quando necessário',
);

check(
  'OnboardingScreen NÃO tem autoFocus no TextInput',
  !onboardingScreenSrc.includes('autoFocus'),
  'autoFocus presente — abre o teclado automaticamente e pode colapsar o layout antes do usuário interagir',
);

check(
  'OnboardingScreen TextInput é controlado (value={childName})',
  onboardingScreenSrc.includes('value={childName}'),
  'TextInput não tem prop value — não é controlado, estado pode divergir da UI',
);

check(
  'OnboardingScreen TextInput tem onChangeText',
  onboardingScreenSrc.includes('onChangeText'),
  'TextInput não tem onChangeText — alterações de texto não são capturadas',
);

check(
  'OnboardingScreen etapa de nome tem botão próprio (nameStepButton)',
  onboardingScreenSrc.includes('nameStepButton'),
  'nameStepButton não existe — botão da etapa nome ainda depende do footer compartilhado',
);

check(
  'OnboardingScreen nameStep usa keyboardShouldPersistTaps="handled"',
  onboardingScreenSrc.includes('keyboardShouldPersistTaps'),
  'keyboardShouldPersistTaps ausente — toque no botão pode fechar o teclado sem executar a ação',
);

check(
  'OnboardingScreen TextInput tem returnKeyType',
  onboardingScreenSrc.includes('returnKeyType'),
  'returnKeyType ausente — teclado virtual não mostra botão de confirmar',
);

check(
  'OnboardingScreen nameStepScroll tem paddingBottom para afastar botão da borda',
  onboardingScreenSrc.includes('nameStepScroll') && onboardingScreenSrc.includes('paddingBottom: 48'),
  'nameStepScroll sem paddingBottom — botão pode ficar colado na borda inferior',
);

check(
  'OnboardingScreen nameInput tem width explícito',
  onboardingScreenSrc.includes("width: '100%'"),
  "nameInput sem width: '100%' — TextInput pode não ocupar toda a largura disponível",
);

// ── Sprint 3 — Área dos Pais como Central Adulta do MVP ──────────────────────

console.log('\n── Sprint 3 — Área dos Pais Central Adulta ──');

check(
  'ParentAreaScreen mantém ParentalGate',
  parentAreaSrc.includes('ParentalGate'),
  'ParentalGate foi removido da Área dos Pais — tela não está mais protegida',
);

check(
  'ParentAreaScreen contém seção de visão geral da criança',
  parentAreaSrc.includes('Visão geral da criança'),
  'Seção "Visão geral da criança" não encontrada na Área dos Pais',
);

check(
  'ParentAreaScreen contém seção Jornada e progresso',
  parentAreaSrc.includes('Jornada e progresso'),
  'Seção "Jornada e progresso" não encontrada na Área dos Pais',
);

check(
  'ParentAreaScreen contém seção Segurança e privacidade',
  parentAreaSrc.includes('Segurança e privacidade'),
  'Seção "Segurança e privacidade" não encontrada na Área dos Pais',
);

check(
  'ParentAreaScreen tem Resumo da criança + Próximo passo recomendado',
  parentAreaSrc.includes('Resumo da criança') &&
  parentAreaSrc.includes('Próximo passo recomendado'),
  'Resumo da criança / Próximo passo recomendado não encontrados',
);

check(
  'ParentAreaScreen contém seção Plano familiar',
  parentAreaSrc.includes('Plano familiar'),
  'Seção "Plano familiar" não encontrada na Área dos Pais',
);

check(
  'ParentAreaScreen contém seção de Modo Igreja',
  parentAreaSrc.includes('Modo Igreja'),
  'Seção "Modo Igreja" não encontrada na Área dos Pais',
);

check(
  'ParentAreaScreen mantém seção Ferramentas do Criador',
  parentAreaSrc.includes('Ferramentas do Criador'),
  'Seção "Ferramentas do Criador" foi removida da Área dos Pais',
);

check(
  'ParentAreaScreen mantém "Rever apresentação do Beni"',
  parentAreaSrc.includes('Rever apresentação do Beni'),
  'Botão "Rever apresentação do Beni" foi removido — QA do onboarding perdido',
);

check(
  'ParentAreaScreen usa parentSettingsService',
  parentAreaSrc.includes('parentSettingsService'),
  'parentSettingsService não está importado na Área dos Pais',
);

check(
  'ParentAreaScreen usa churchModeService',
  parentAreaSrc.includes('churchModeService'),
  'churchModeService não está importado — Modo Igreja não tem suporte de serviço',
);

check(
  'ParentAreaScreen não contém implementação de RevenueCat',
  !parentAreaSrc.includes('RevenueCat') && !parentAreaSrc.includes('revenuecat'),
  'RevenueCat encontrado na Área dos Pais — compra não deve ser implementada neste sprint',
);

check(
  'ParentAreaScreen não ativa compra real',
  !parentAreaSrc.includes('isPurchaseEnabled = true') && !parentAreaSrc.includes('initPurchases('),
  'Compra real está sendo ativada na Área dos Pais — não permitido neste sprint',
);

check(
  'ParentAreaScreen não chama AsyncStorage.clear diretamente',
  !parentAreaSrc.includes('AsyncStorage.clear'),
  'AsyncStorage.clear encontrado — apagaria TODOS os dados do app sem controle',
);

check(
  'ParentAreaScreen não pede email, telefone, idade ou senha da criança',
  !parentAreaSrc.includes("placeholder=\"Email\"") &&
  !parentAreaSrc.includes("placeholder=\"Telefone\"") &&
  !parentAreaSrc.includes("placeholder=\"Senha\"") &&
  !parentAreaSrc.includes('email da criança') &&
  !parentAreaSrc.includes('telefone da criança'),
  'Área dos Pais pede dados pessoais da criança — não permitido',
);

check(
  'ParentAreaScreen não remove reset de onboarding',
  parentAreaSrc.includes('resetOnboardingForQa'),
  'resetOnboardingForQa foi removido da Área dos Pais — QA do onboarding perdido',
);

check(
  'ParentAreaScreen não remove reset de progresso',
  parentAreaSrc.includes('resetProgress'),
  'resetProgress foi removido da Área dos Pais — reset de progresso perdido',
);

check(
  'Nenhuma rota antiga foi removida do AppNavigator',
  appNavSrc.includes('Onboarding') &&
  appNavSrc.includes('Home') &&
  appNavSrc.includes('Narration') &&
  appNavSrc.includes('ParentArea'),
  'Uma rota essencial foi removida do AppNavigator — navegação pode estar quebrada',
);

check(
  'OnboardingScreen continua existindo',
  srcExists('src/screens/OnboardingScreen.js'),
  'OnboardingScreen.js foi removido — onboarding do Beni perdido',
);

check(
  'onboardingService continua existindo',
  srcExists('src/services/onboardingService.js'),
  'onboardingService.js foi removido — controle de onboarding perdido',
);

// ── Sprint 3.1 — Progresso por História Recolhido e Polimento Visual ─────────

console.log('\n── Sprint 3.1 — Progresso Recolhido ──');

const parentAreaSrc31 = readSrc('src/screens/ParentAreaScreen.js');

check(
  'ParentAreaScreen tem estado storyProgressExpanded',
  parentAreaSrc31.includes('storyProgressExpanded'),
  'Estado storyProgressExpanded não encontrado — seção de histórias não é colapsável',
);

check(
  'storyProgressExpanded inicia como false (recolhido por padrão)',
  parentAreaSrc31.includes('const [storyProgressExpanded, setStoryProgressExpanded] = useState(false)'),
  'storyProgressExpanded não inicia como false — seção abre expandida por padrão (errado)',
);

check(
  'ParentAreaScreen tem setter setStoryProgressExpanded',
  parentAreaSrc31.includes('setStoryProgressExpanded'),
  'setStoryProgressExpanded não encontrado — toggle não pode ser acionado',
);

check(
  'ParentAreaScreen tem botão "Ver histórias"',
  parentAreaSrc31.includes('Ver histórias'),
  'Texto "Ver histórias" não encontrado — botão de expandir ausente',
);

check(
  'ParentAreaScreen tem indicadores chevron ▼ e ▲',
  parentAreaSrc31.includes('▼') && parentAreaSrc31.includes('▲'),
  'Indicadores de chevron ▼/▲ não encontrados na Área dos Pais',
);

check(
  'Lista de histórias é condicional ao storyProgressExpanded',
  parentAreaSrc31.includes('storyProgressExpanded &&'),
  'Lista de histórias não está condicionada a storyProgressExpanded — sempre exibida',
);

check(
  'ParentAreaScreen tem botão "Recolher"',
  parentAreaSrc31.includes('Recolher'),
  'Texto "Recolher" não encontrado — botão de colapsar a lista ausente',
);

check(
  'ParentAreaScreen importa TouchableOpacity (header do toggle)',
  parentAreaSrc31.includes('TouchableOpacity'),
  'TouchableOpacity não importado — cabeçalho do toggle não é clicável',
);

check(
  'Área dos Pais: ordem de blocos (Resumo → Jornada → Plano → Segurança → Igreja)',
  parentAreaSrc31.indexOf('Resumo da criança') < parentAreaSrc31.indexOf('Jornada e progresso') &&
  parentAreaSrc31.indexOf('Jornada e progresso') < parentAreaSrc31.indexOf('Plano familiar') &&
  parentAreaSrc31.indexOf('Plano familiar') < parentAreaSrc31.indexOf('Segurança e privacidade') &&
  parentAreaSrc31.indexOf('Segurança e privacidade') < parentAreaSrc31.indexOf('⛪ Modo Igreja'),
  'Área dos Pais blocks are not in the expected order',
);

check(
  'Resumo recolhido mostra contagem de histórias em andamento',
  parentAreaSrc31.includes('em andamento'),
  'Resumo recolhido não mostra histórias "em andamento" — stats da seção colapsada incompletos',
);

// ── Sprint Maturidade — Beni speech layer + Área dos Pais 2.0 + Modo Igreja ──
const beniLinesSrc = readSrc('src/data/beniLines.js');
const speechCardSrc = readSrc('src/components/beni/BeniSpeechCard.js');
const parentSrc = readSrc('src/screens/ParentAreaScreen.js');

check(
  'beniLines.js tem os contextos + getBeniLine + hasBeniLineAudio',
  ['home', 'onboarding', 'stories', 'storyStart', 'sceneComplete', 'quizStart',
   'atelier', 'storyBook', 'parentArea', 'churchMode', 'premium']
    .every(c => new RegExp(`\\b${c}:`).test(beniLinesSrc)) &&
  beniLinesSrc.includes('export function getBeniLine') &&
  beniLinesSrc.includes('export function hasBeniLineAudio'),
  'beniLines.js missing contexts / getBeniLine / hasBeniLineAudio',
);

check(
  'BeniSpeechCard usa fallback de áudio (hasBeniLineAudio) e não exige áudio',
  speechCardSrc.includes('hasBeniLineAudio') &&
  speechCardSrc.includes('getBeniLine') &&
  /audioReady\s*\?/.test(speechCardSrc) &&
  speechCardSrc.includes('será preparada'),
  'BeniSpeechCard must gate the listen button behind hasBeniLineAudio with a graceful fallback',
);

check(
  'BeniSpeechCard exportado em components/beni',
  readSrc('src/components/beni/index.js').includes('BeniSpeechCard'),
  'BeniSpeechCard not exported from components/beni',
);

check(
  'Área dos Pais usa Dica do Beni (BeniSpeechCard adult) e Próximo passo recomendado',
  parentSrc.includes('BeniSpeechCard') &&
  parentSrc.includes('Próximo passo recomendado') &&
  parentSrc.includes('const nextStep'),
  'ParentAreaScreen missing Beni tip / recommended next step',
);

check(
  'Área dos Pais: ferramentas de teste aparecem em DEV/Expo Go (gate SHOW_TEST_TOOLS)',
  parentSrc.includes('const SHOW_TEST_TOOLS') &&
  /__DEV__[\s\S]*?isCreatorQaModeAllowed\(\)/.test(parentSrc) &&
  /\{SHOW_TEST_TOOLS &&[\s\S]*?Ferramentas do Criador/.test(parentSrc),
  'Creator/QA/Build test tools must show in dev/Expo Go via SHOW_TEST_TOOLS',
);

check(
  'Área dos Pais: ferramentas de teste podem ficar ocultas em produção',
  // SHOW_TEST_TOOLS é false em prod (sem __DEV__ e sem a flag de build)
  /SHOW_TEST_TOOLS\s*=\s*\(typeof __DEV__/.test(parentSrc),
  'SHOW_TEST_TOOLS must be derivable false in production (no __DEV__ / no build flag)',
);

check(
  'Modo Igreja: explicação em 3 passos (criar turma / história da semana / orientar famílias)',
  parentSrc.includes('Crie uma turma local') &&
  parentSrc.includes('Escolha a História da Semana') &&
  parentSrc.includes('Compartilhe uma orientação com as famílias'),
  'ParentAreaScreen Church mode missing the 3-step explanation',
);

// ── Sprint Design System 1.0 + Beni nas telas da criança ─────────────────────
const themeSrc = readSrc('src/theme/theme.js');
check(
  'Design System 1.0 (theme.js) define os tokens centrais',
  ['typography', 'buttonSizes', 'cardStyles', 'badges', 'sectionHeaders', 'palette']
    .every(t => new RegExp(`export const ${t}`).test(themeSrc)) &&
  /export \{ colors, radii, spacing, shadows, layout \}/.test(themeSrc),
  'theme.js missing Design System tokens (typography/buttonSizes/cardStyles/badges/sectionHeaders/palette)',
);

check(
  'QuizScreen mostra Beni (quizStart) só na primeira pergunta',
  readSrc('src/screens/QuizScreen.js').includes('BeniSpeechCard') &&
  readSrc('src/screens/QuizScreen.js').includes('context="quizStart"') &&
  /current === 0 &&[\s\S]*?<BeniSpeechCard/.test(readSrc('src/screens/QuizScreen.js')),
  'QuizScreen must show a single quizStart Beni line on the first question',
);

check(
  'PremiumLockCard mostra fala do Beni (premium), suavizando o bloqueio',
  readSrc('src/components/premium/PremiumLockCard.js').includes('BeniSpeechCard') &&
  readSrc('src/components/premium/PremiumLockCard.js').includes('context="premium"'),
  'PremiumLockCard must show a child-friendly Beni premium line',
);

check(
  'Beni não é duplicado nas telas que já têm guia (sem BeniSpeechCard onde já há BeniGuideBubble)',
  ['NarrationScreen', 'StoryDetailScreen', 'StoriesScreen', 'AtelierScreen'].every(s => {
    const src = readSrc(`src/screens/${s}.js`);
    return !(src.includes('BeniGuideBubble') && src.includes('BeniSpeechCard'));
  }),
  'A screen uses both BeniGuideBubble and BeniSpeechCard — avoid duplicating Beni',
);

// ── Sprint Mundo Vivo do Beni — Jornada Principal 1.0 ────────────────────────
const showcaseSrc = readSrc('src/services/showcaseStory.js');
check(
  'showcaseStory service escolhe a história vitrine (grátis, jogável, comece_aqui)',
  showcaseSrc.includes('getShowcaseStory') &&
  showcaseSrc.includes('comece_aqui') &&
  showcaseSrc.includes('accessType'),
  'showcaseStory.js ausente ou sem critério de história vitrine',
);

const homeMundoSrc = readSrc('src/screens/HomeScreen.js');
check(
  'Home: hero da missão mostra o que a criança vai viver (Ouvir / Colorir / Estrelas)',
  homeMundoSrc.includes('🔊 Ouvir') &&
  homeMundoSrc.includes('🎨 Colorir') &&
  homeMundoSrc.includes('⭐ Estrelas'),
  'Home perdeu a linha de features (Ouvir/Colorir/Estrelas) do hero da missão',
);
check(
  'Home: hero traz a lição do coração e a promessa do Livrinho',
  homeMundoSrc.includes('licaoCoracao') &&
  homeMundoSrc.includes('Livrinho da Fé'),
  'Home não conecta lição do coração + Livrinho no hero da missão',
);

const unlockSrc = readSrc('src/components/UnlockCelebration.js');
check(
  'Primeira vitória: UnlockCelebration é emocional e cita o Beni',
  unlockSrc.includes('avançou na aventura') &&
  unlockSrc.includes('Beni') &&
  !unlockSrc.includes('Vamos para a próxima cena?'),
  'UnlockCelebration ainda usa copy fria / sem o Beni',
);

// ── Sprint Pós Cena e Recompensa 2.0 ──────────────────────────────────────────
console.log('\n── Sprint Pós Cena 2.0 — celebração + próximos passos ──');

const unlockSrc20    = readSrc('src/components/UnlockCelebration.js');
const narrationSrc20 = readSrc('src/screens/NarrationScreen.js');

check(
  'UnlockCelebration tem botão primário "Continuar aventura"',
  unlockSrc20.includes('Continuar aventura'),
  'UnlockCelebration não exibe "Continuar aventura" — botão principal ausente',
);

check(
  'UnlockCelebration aceita prop onColorir (atalho para Colorir cena)',
  unlockSrc20.includes('onColorir'),
  'UnlockCelebration sem prop onColorir — colorir não acessível da celebração',
);

check(
  'UnlockCelebration aceita prop onBau (atalho para Baú do Beni)',
  unlockSrc20.includes('onBau'),
  'UnlockCelebration sem prop onBau — Baú não acessível da celebração',
);

check(
  'UnlockCelebration aceita prop onEstrelinhas (atalho para Estrelinhas)',
  unlockSrc20.includes('onEstrelinhas'),
  'UnlockCelebration sem prop onEstrelinhas — Estrelinhas não acessível da celebração',
);

check(
  'UnlockCelebration destaca Livrinho da Fé no fim da aventura (isLast)',
  unlockSrc20.includes('onLibrinho') && unlockSrc20.includes('Livrinho da Fé'),
  'UnlockCelebration não destaca Livrinho da Fé na última cena',
);

check(
  'UnlockCelebration exibe badge de estrela conquistada em cenas intermediárias',
  unlockSrc20.includes('starBadge') && unlockSrc20.includes('+1 estrela conquistada'),
  'UnlockCelebration sem badge visual de estrela — criança não vê claramente que ganhou ⭐',
);

check(
  'UnlockCelebration recebe sceneNumber e totalCenas (progresso contextual)',
  unlockSrc20.includes('sceneNumber') && unlockSrc20.includes('totalCenas'),
  'UnlockCelebration sem sceneNumber/totalCenas — contexto de progresso ausente',
);

check(
  'NarrationScreen passa onColorir para UnlockCelebration',
  narrationSrc20.includes('onColorir={handleColorirFromCelebration}'),
  'NarrationScreen não passa onColorir — colorir não acessível da celebração',
);

check(
  'NarrationScreen passa onBau para UnlockCelebration',
  narrationSrc20.includes('onBau={handleBauFromCelebration}'),
  'NarrationScreen não passa onBau — Baú não acessível da celebração',
);

check(
  'NarrationScreen passa onEstrelinhas para UnlockCelebration',
  narrationSrc20.includes('onEstrelinhas={handleEstrelinhasFromCelebration}'),
  'NarrationScreen não passa onEstrelinhas — Estrelinhas não acessível da celebração',
);

// ── Hotfix Pós Cena Persistente — hub de vitória não fica preso sobre outras telas ─
console.log('\n── Hotfix Pós Cena Persistente ──');

check(
  'NarrationScreen: celebrationHandledRef.current = true aparece exatamente uma vez (só em handleContinue)',
  (narrationSrc20.match(/celebrationHandledRef\.current\s*=\s*true/g) || []).length === 1,
  'celebrationHandledRef.current = true deve aparecer SOMENTE em handleContinue — handlers secundários não devem encerrar a celebração',
);

check(
  'NarrationScreen: handlers secundários chamam setShowCelebration(false) antes de navegar (modal não fica preso)',
  narrationSrc20.includes('handleColorirFromCelebration') &&
  narrationSrc20.includes('handleBauFromCelebration') &&
  narrationSrc20.includes('handleEstrelinhasFromCelebration') &&
  // cada handler secundário deve ter setShowCelebration(false) antes do navigate
  /handleColorirFromCelebration[\s\S]{0,200}setShowCelebration\(false\)[\s\S]{0,200}navigate/.test(narrationSrc20) &&
  /handleBauFromCelebration[\s\S]{0,200}setShowCelebration\(false\)[\s\S]{0,200}navigate/.test(narrationSrc20) &&
  /handleEstrelinhasFromCelebration[\s\S]{0,200}setShowCelebration\(false\)[\s\S]{0,200}navigate/.test(narrationSrc20),
  'Handlers secundários devem chamar setShowCelebration(false) antes de navegar — Modal do RN sobrepõe a tela de destino',
);

check(
  'NarrationScreen: Estrelinhas navega para EstrelinhasCena (rota Stack — preserva NarrationScreen na pilha)',
  narrationSrc20.includes("navigate('EstrelinhasCena'") ||
  narrationSrc20.includes('navigate("EstrelinhasCena"'),
  "handleEstrelinhasFromCelebration deve usar navigate('EstrelinhasCena') — rota Stack que mantém NarrationScreen na pilha para o botão Voltar funcionar",
);

check(
  'NarrationScreen: celebrationPendingRef existe (reabertura do modal ao voltar de visita)',
  narrationSrc20.includes('celebrationPendingRef'),
  'celebrationPendingRef não encontrado — useFocusEffect não consegue reabrir o modal ao retornar de ação secundária',
);

check(
  'NarrationScreen: useFocusEffect reabre celebração se pendente e não encerrada',
  narrationSrc20.includes('useFocusEffect') &&
  narrationSrc20.includes('celebrationPendingRef.current') &&
  narrationSrc20.includes('celebrationHandledRef.current'),
  'useFocusEffect deve verificar celebrationPendingRef + celebrationHandledRef para reabrir o modal ao voltar',
);

// ── Hotfix Estrelinhas — botão Voltar via rota Stack ─────────────────────────
console.log('\n── Hotfix Estrelinhas: botão Voltar ──');

const appNavSrcHotfix = readSrc('src/navigation/AppNavigator.js');
const trophiesSrcHotfix = readSrc('src/screens/TrophiesScreen.js');

check(
  'AppNavigator registra EstrelinhasCena como rota Stack (push sem remover NarrationScreen)',
  appNavSrcHotfix.includes("name=\"EstrelinhasCena\"") || appNavSrcHotfix.includes("name='EstrelinhasCena'"),
  "AppNavigator não registra EstrelinhasCena — navigate('EstrelinhasCena') vai falhar em runtime",
);

check(
  'NarrationScreen passa fromPostSceneCelebration: true ao navegar para EstrelinhasCena',
  narrationSrc20.includes('fromPostSceneCelebration'),
  'handleEstrelinhasFromCelebration deve passar fromPostSceneCelebration: true como parâmetro',
);

check(
  'TrophiesScreen lê fromPostSceneCelebration de route.params',
  trophiesSrcHotfix.includes('fromPostSceneCelebration'),
  'TrophiesScreen não lê fromPostSceneCelebration — não saberá quando exibir o botão Voltar',
);

check(
  'TrophiesScreen exibe botão Voltar apenas quando fromCena é true (via modal pós cena)',
  trophiesSrcHotfix.includes('fromCena') &&
  trophiesSrcHotfix.includes('backLabelFor') &&
  /fromCena[\s\S]{0,300}backLabelFor/.test(trophiesSrcHotfix),
  'TrophiesScreen não exibe botão Voltar condicional ao fromCena',
);

check(
  'TrophiesScreen: botão Voltar chama navigation.goBack() (volta para NarrationScreen na pilha)',
  /fromCena[\s\S]{0,500}navigation\.goBack\(\)/.test(trophiesSrcHotfix),
  'Botão Voltar em TrophiesScreen deve chamar navigation.goBack()',
);

check(
  'TrophiesScreen: paddingTop do ScrollView é reduzido quando fromCena (back row assume o topo)',
  trophiesSrcHotfix.includes('fromCena ? 8') || trophiesSrcHotfix.includes('fromCena?8') ||
  /fromCena[\s\S]{0,100}paddingTop/.test(trophiesSrcHotfix),
  'TrophiesScreen não ajusta paddingTop do ScrollView quando fromCena — pode haver espaçamento duplo no topo',
);

// ── Sprint Livrinho da Fé 2.0 — conclusão memorável ─────────────────────────
console.log('\n── Sprint Livrinho 2.0 + Conclusão ──');

const congratsSrc20 = readSrc('src/screens/CongratsScreen.js');
const storyBookSrc20 = readSrc('src/screens/StoryBookScreen.js');
const trophiesSrc20 = readSrc('src/screens/TrophiesScreen.js');
const livrinhoPagesSvc = readSrc('src/services/storyBookPagesService.js');

// CongratsScreen
check(
  'CongratsScreen: botão primário do Livrinho da Fé existe',
  congratsSrc20.includes('Abrir Livrinho da Fé') &&
  congratsSrc20.includes('Seu presente principal'),
  'CongratsScreen sem botão primário "Abrir Livrinho da Fé" ou sem subtexto correto',
);

check(
  'CongratsScreen: navega para StoryBook com fromStoryCompletion: true',
  congratsSrc20.includes('fromStoryCompletion: true') &&
  congratsSrc20.includes("navigate('StoryBook'"),
  'CongratsScreen deve passar fromStoryCompletion: true ao abrir StoryBook',
);

check(
  'CongratsScreen: ação para Baú do Beni (BeniChest)',
  congratsSrc20.includes("navigate('BeniChest'"),
  'CongratsScreen sem ação para Baú do Beni',
);

check(
  'CongratsScreen: ação para Estrelinhas (EstrelinhasCena)',
  congratsSrc20.includes("navigate('EstrelinhasCena'"),
  'CongratsScreen sem ação para Estrelinhas',
);

check(
  'CongratsScreen: ação para Colorir',
  congratsSrc20.includes("navigate('Coloring'"),
  'CongratsScreen sem ação para Colorir cenas',
);

check(
  'CongratsScreen: Certificado da aventura existe (modal local, sem share/PDF)',
  congratsSrc20.includes('Certificado da aventura') &&
  !congratsSrc20.includes('Share') &&
  !congratsSrc20.includes('shareAsync') &&
  !congratsSrc20.includes('printAsync') &&
  !congratsSrc20.includes('MediaLibrary'),
  'CongratsScreen: Certificado ausente ou usa share/PDF/permissão — não permitido',
);

check(
  'CongratsScreen: frase de retenção presente',
  congratsSrc20.includes('Cada aventura completa') ||
  congratsSrc20.includes('cartinhas e estrelinhas'),
  'CongratsScreen sem frase de retenção ao final',
);

// StoryBookScreen
check(
  'StoryBookScreen: aceita fromStoryCompletion em route.params',
  storyBookSrc20.includes('fromStoryCompletion'),
  'StoryBookScreen não lê fromStoryCompletion — botão "Ver conclusão" não aparecerá',
);

check(
  'StoryBookScreen: ended state tem botão "Ver conclusão" condicional ao fromStoryCompletion',
  storyBookSrc20.includes('fromStoryCompletion') &&
  storyBookSrc20.includes('Ver conclusão'),
  'StoryBookScreen ended state sem botão "Ver conclusão" — usuário sem caminho de volta à conclusão',
);

check(
  'StoryBookScreen: notCompleted state tem botão "Continuar história"',
  storyBookSrc20.includes('Continuar história') || storyBookSrc20.includes('Continuar a história'),
  'StoryBookScreen notCompleted sem botão para continuar a história',
);

check(
  'StoryBookScreen: intro exibe referência bíblica da história',
  storyBookSrc20.includes('story.referencia') || storyBookSrc20.includes('referencia'),
  'StoryBookScreen intro não exibe referência bíblica',
);

check(
  'StoryBookScreen: fallback de imagem (makeFallbackVisual) sempre retorna visual válido',
  storyBookSrc20.includes('makeFallbackVisual'),
  'StoryBookScreen sem makeFallbackVisual — pode ter tela preta em cenas sem imagem',
);

check(
  'StoryBookScreen: modo colorido usa arte da criança via hasMeaningfulPaint → makeChildArtVisual',
  storyBookSrc20.includes('hasMeaningfulPaint') &&
  /hasMeaningfulPaint[\s\S]{0,200}makeChildArtVisual/.test(storyBookSrc20),
  'StoryBookScreen não usa arte da criança no modo colorido do Livrinho',
);

// TrophiesScreen: fromStoryCompletion suportado
check(
  'TrophiesScreen: fromStoryCompletion também ativa botão Voltar',
  trophiesSrc20.includes('fromStoryCompletion'),
  'TrophiesScreen não suporta fromStoryCompletion — botão Voltar não aparece ao vir da conclusão',
);

// Helper storyBookPagesService
check(
  'storyBookPagesService existe',
  livrinhoPagesSvc.length > 0,
  'src/services/storyBookPagesService.js não existe',
);

check(
  'storyBookPagesService retorna [] quando story é null',
  livrinhoPagesSvc.includes('!story?.cenas?.length') || livrinhoPagesSvc.includes('!story?.cenas'),
  'storyBookPagesService não trata story null — pode lançar em runtime',
);

check(
  'storyBookPagesService retorna campos id, sceneNumber, title, text, image, imageSourceLabel, isCompleted, hasChildDrawing',
  livrinhoPagesSvc.includes('sceneNumber') &&
  livrinhoPagesSvc.includes('imageSourceLabel') &&
  livrinhoPagesSvc.includes('isCompleted') &&
  livrinhoPagesSvc.includes('hasChildDrawing'),
  'storyBookPagesService não retorna todos os campos esperados de página',
);

check(
  'storyBookPagesService prioriza desenho da criança antes da ilustração oficial',
  /hasMeaningfulPaint[\s\S]{0,200}Desenho da criança/.test(livrinhoPagesSvc) ||
  livrinhoPagesSvc.includes('Desenho da criança'),
  'storyBookPagesService não prioriza desenho da criança',
);

check(
  'storyBookPagesService usa try/catch por página (nunca lança)',
  (livrinhoPagesSvc.match(/try\s*{/g) || []).length >= 2,
  'storyBookPagesService sem try/catch por página — pode lançar se storage falhar',
);

// Escopo proibido: Área dos Pais, Modo Criador, Onboarding, RevenueCat não alterados
const parentAreaSrc20 = readSrc('src/screens/ParentAreaScreen.js');
check(
  'Área dos Pais não foi alterada nesta sprint (sem fromStoryCompletion)',
  !parentAreaSrc20.includes('fromStoryCompletion'),
  'ParentAreaScreen foi alterada nesta sprint — fora do escopo',
);

// ── Hotfix Conclusão 2.1 — hierarquia do Livrinho da Fé ──────────────────────
console.log('\n── Hotfix Conclusão 2.1: hierarquia do Livrinho ──');

const congrats21 = readSrc('src/screens/CongratsScreen.js');

check(
  'CongratsScreen 2.1: texto "Sua aventura virou um presente!" presente',
  congrats21.includes('Sua aventura virou um presente!'),
  'CongratsScreen sem "Sua aventura virou um presente!" — bloco do presente ausente',
);

check(
  'CongratsScreen 2.1: subtexto correto do botão Livrinho (sem texto fixo sobre desenhos)',
  congrats21.includes('Seu presente principal') &&
  !congrats21.includes('Sua história com seus próprios desenhos'),
  'CongratsScreen ainda usa texto fixo sobre desenhos — deve usar texto neutro',
);

check(
  'CongratsScreen 2.1: Livrinho aparece antes do Resumo da aventura (ordem correta)',
  congrats21.indexOf('Abrir Livrinho da Fé') < congrats21.indexOf('Resumo da aventura'),
  'Livrinho da Fé aparece depois do Resumo da aventura — hierarquia invertida',
);

check(
  'CongratsScreen 2.1: timeline title mudou para "Resumo da aventura"',
  congrats21.includes('Resumo da aventura'),
  'Título da timeline não foi atualizado para "Resumo da aventura"',
);

check(
  'UnlockCelebration não foi alterado nesta sprint',
  (() => {
    const src = readSrc('src/components/UnlockCelebration.js');
    return src.includes('onContinue') && src.includes('isLast') && !src.includes('fromStoryCompletion');
  })(),
  'UnlockCelebration foi alterado — fora do escopo desta sprint',
);

check(
  'NarrationScreen não foi alterado nesta sprint (não contém Resumo da aventura)',
  (() => {
    const src = readSrc('src/screens/NarrationScreen.js');
    return !src.includes('Resumo da aventura');
  })(),
  'NarrationScreen foi alterado nesta sprint — fora do escopo',
);

check(
  'CongratsScreen 2.1: sem share, PDF, permissão ou dependência nova',
  !congrats21.includes('Share') &&
  !congrats21.includes('shareAsync') &&
  !congrats21.includes('printAsync') &&
  !congrats21.includes('MediaLibrary') &&
  !congrats21.includes('Permissions'),
  'CongratsScreen usa share/PDF/permissão — não permitido',
);

// ── Hotfix imagem próxima aventura (CongratsScreen) ──────────────────────────
console.log('\n── Hotfix imagem próxima aventura ──');

const nextAdvCardSrc = readSrc('src/components/story/NextAdventureCard.js');
const storyCoverSrc  = readSrc('src/components/story/StoryCoverImage.js');

check(
  'NextAdventureCard: não usa focusTop hardcoded por story.id (causa zoom exagerado)',
  !nextAdvCardSrc.includes("focusTop={story.id"),
  'NextAdventureCard ainda usa focusTop={story.id === ...} — isso força imageTopFocus e zoom na capa',
);

check(
  'NextAdventureCard: usa StoryCoverImage sem override de foco (foco vem de getStoryCoverMeta)',
  nextAdvCardSrc.includes('StoryCoverImage') &&
  !nextAdvCardSrc.includes('focusTop'),
  'NextAdventureCard ainda passa focusTop — a capa da próxima aventura pode aparecer cortada',
);

check(
  'StoryCoverImage: imageTopFocus só é aplicado quando focusY < 0.4 ou focusTop explícito (não por default)',
  storyCoverSrc.includes('focusY < 0.4'),
  'StoryCoverImage não verifica focusY < 0.4 — lógica de foco pode estar sempre ativa',
);

check(
  'CongratsScreen: ordem correta — "Sua aventura virou um presente!" antes de "Resumo da aventura"',
  (() => {
    const src = readSrc('src/screens/CongratsScreen.js');
    return src.indexOf('Sua aventura virou um presente!') < src.indexOf('Resumo da aventura');
  })(),
  'CongratsScreen: Livrinho / "presente" não aparece antes do "Resumo da aventura"',
);

check(
  'UnlockCelebration não foi alterado neste hotfix',
  (() => {
    const src = readSrc('src/components/UnlockCelebration.js');
    return src.includes('onContinue') && !src.includes('focusTop');
  })(),
  'UnlockCelebration foi alterado — fora do escopo',
);

check(
  'NarrationScreen não foi alterado neste hotfix',
  (() => {
    const src = readSrc('src/screens/NarrationScreen.js');
    return !src.includes('focusTop') && !src.includes('Resumo da aventura');
  })(),
  'NarrationScreen foi alterado — fora do escopo',
);

const bookHeroMundoSrc = readSrc('src/components/story/StoryBookHero.js');
check(
  'Entrada da história promete o Livrinho e mostra ganho de estrelas',
  bookHeroMundoSrc.includes('Livrinho da Fé') &&
  bookHeroMundoSrc.includes('ganhar estrelas'),
  'StoryBookHero não promete Livrinho / não mostra ganho de estrelas',
);

const storiesMundoSrc = readSrc('src/screens/StoriesScreen.js');
check(
  'Mapa das Histórias destaca a história recomendada (Comece por aqui)',
  storiesMundoSrc.includes('getShowcaseStory') &&
  storiesMundoSrc.includes('isRecommended') &&
  storiesMundoSrc.includes('Comece por aqui'),
  'StoriesScreen não destaca mais a história recomendada na trilha',
);

// ── Sprint Jornada Principal 1.1 — direção visual + encanto ──────────────────
const ptThemeSrc = readSrc('src/theme/productTheme.js');
check(
  'Paleta: papéis azul fé / laranja Beni / verde vida / roxo mágico definidos em productTheme',
  ptThemeSrc.includes('faithBlue') && ptThemeSrc.includes('#2B5BA1') &&
  ptThemeSrc.includes('beni:') && ptThemeSrc.includes('#F3722C') &&
  ptThemeSrc.includes('#90BE6D'),
  'productTheme não define os papéis de cor da direção visual (azul fé / Beni / verde vida)',
);

const homeVisualSrc = readSrc('src/screens/HomeScreen.js');
check(
  'Home agrupa Ideia do dia + versículo em "Cantinho do Beni"',
  homeVisualSrc.includes('Cantinho do Beni') && homeVisualSrc.includes('CantinhoDoBeni') &&
  homeVisualSrc.includes('Uma ideia para hoje') && homeVisualSrc.includes('versículo para guardar'),
  'Home não agrupou ideia + versículo no Cantinho do Beni',
);
check(
  'Home: conquista vira recompensa ("VOCÊ CONQUISTOU")',
  homeVisualSrc.includes('VOCÊ CONQUISTOU') && homeVisualSrc.includes('ConquistaCard'),
  'Home não tem conquista-recompensa',
);
// Bloco 2 (UX 1.0): Home enxuta — seção "Caminhos da fé"/mundos REMOVIDA (não duplicar a tab Aventuras)
check(
  'Home enxuta (Bloco 2): sem seção "Caminhos da fé"/mundos (não duplica a tab Aventuras)',
  !homeVisualSrc.includes('Caminhos da fé') &&
  !homeVisualSrc.includes('WorldCardCompact') &&
  !homeVisualSrc.includes('Cada mundo guarda novas histórias'),
  'Home ainda tem a seção de mundos "Caminhos da fé" — deveria ter sido removida no Bloco 2',
);

const storyCardSrc = readSrc('src/components/StoryCard.js');
check(
  'StoryCard parece livro: lombada colorida + folha de rosto + linha de cenas',
  storyCardSrc.includes('spine') && storyCardSrc.includes('cenasChip') &&
  storyCardSrc.includes('cenas'),
  'StoryCard não tem cara de livro (lombada / folha de rosto / cenas)',
);

const storiesVisualSrc = readSrc('src/screens/StoriesScreen.js');
check(
  'Aventuras: "Próxima aventura" com botão pílula "Continuar →" (sem ▶ feio)',
  storiesVisualSrc.includes('Próxima aventura') &&
  storiesVisualSrc.includes('Continuar  →') &&
  !storiesVisualSrc.includes('continueBtnText}>▶'),
  'StoriesScreen ainda usa o botão de player feio / não renomeou para Próxima aventura',
);

const audioVisualSrc = readSrc('src/components/AudioPlayer.js');
check(
  'AudioPlayer usa azul fé (botão de ouvir) em vez do laranja antigo',
  audioVisualSrc.includes('faithBlue') && !audioVisualSrc.includes("'#FF6B35'"),
  'AudioPlayer não foi recolorido para azul fé',
);

const narrationVisualSrc = readSrc('src/screens/NarrationScreen.js');
check(
  'Narração: convite forte para colorir ("Hora de colorir") + estado "já coloriu"',
  narrationVisualSrc.includes('Hora de colorir') &&
  narrationVisualSrc.includes('Colorir cena') &&
  narrationVisualSrc.includes('Você já coloriu esta cena') &&
  narrationVisualSrc.includes('sceneHasDrawing'),
  'NarrationScreen não tem convite forte para colorir nem estado de cena já colorida',
);

const bookHeroVisualSrc = readSrc('src/components/story/StoryBookHero.js');
check(
  'Entrada da história: linha única "ouvir, colorir e ganhar estrelas" e botão laranja Beni',
  bookHeroVisualSrc.includes('Nesta aventura você vai') &&
  bookHeroVisualSrc.includes('pt.beni'),
  'StoryBookHero não tem a linha de experiência / botão Beni dominante',
);

// ── Sprint Ateliê Premium e Canvas Infantil 1.0 ─────────────────────────────
const homeAtelierSrc = readSrc('src/screens/HomeScreen.js');
check(
  'Home: Cantinho do Beni é bloco especial com 3 itens (ideia + versículo + oração)',
  homeAtelierSrc.includes('Uma ideia para hoje') &&
  homeAtelierSrc.includes('Um versículo para guardar') &&
  homeAtelierSrc.includes('Uma oração curtinha') &&
  homeAtelierSrc.includes('DAILY_PRAYERS'),
  'Home Cantinho do Beni não tem os 3 itens (ideia/versículo/oração)',
);

const badgeSrc = readSrc('src/components/ui/StatusBadge.js');
check(
  'Selo "Em andamento" não usa ícone de player (▶)',
  !badgeSrc.includes("icon: '▶'") && badgeSrc.includes('Em andamento'),
  'StatusBadge in_progress ainda usa o ícone de player ▶',
);

const atelierMesaSrc = readSrc('src/screens/AtelierScreen.js');
check(
  'Ateliê: 3 ações claras (Colorir uma história / Desenho guiado pelo Beni / Criar livre)',
  atelierMesaSrc.includes('Colorir uma história') && atelierMesaSrc.includes('Escolher cena') &&
  atelierMesaSrc.includes('Desenho guiado pelo Beni') && atelierMesaSrc.includes('Começar desafio') &&
  atelierMesaSrc.includes('Criar livre') && atelierMesaSrc.includes('Abrir folha'),
  'Ateliê não tem as 3 ações renomeadas e explicadas',
);
check(
  'Ateliê: Minhas artes com "Ver galeria" e aviso amigável de limite cheio',
  atelierMesaSrc.includes('Ver galeria') &&
  atelierMesaSrc.includes('use o Modo Criador nos') &&
  atelierMesaSrc.includes('Plano Família'),
  'Ateliê Minhas artes sem botão de galeria / aviso amigável de limite',
);

const canvasSrc2 = readSrc('src/screens/AtelierCanvasScreen.js');
check(
  'Canvas: ferramentas Desenhar / Borracha / Carimbos (sem Apagar/Enfeitar)',
  canvasSrc2.includes("label: 'Borracha'") && canvasSrc2.includes("label: 'Carimbos'") &&
  canvasSrc2.includes("label: 'Desenhar'") &&
  !canvasSrc2.includes("label: 'Apagar'") && !canvasSrc2.includes("label: 'Enfeitar'"),
  'Canvas não renomeou as ferramentas para Borracha/Carimbos',
);
check(
  'Canvas: pincel Pequeno/Médio/Grande (sem Fino/Grosso)',
  canvasSrc2.includes("label: 'Pequeno'") && canvasSrc2.includes("label: 'Grande'") &&
  !canvasSrc2.includes("label: 'Fino'") && !canvasSrc2.includes("label: 'Grosso'"),
  'Canvas ainda usa Fino/Grosso no pincel',
);
check(
  'Canvas: Carimbos da Fé = 5 itens (com Cordeirinho, sem Cruz); Limpar tudo separado',
  canvasSrc2.includes("label: 'Cordeirinho'") && !canvasSrc2.includes("label: 'Cruz'") &&
  canvasSrc2.includes("label: 'Pombinha'") &&
  canvasSrc2.includes('Limpar tudo'),
  'Canvas não rebaixou os Carimbos da Fé para 5 itens / removeu a cruz',
);
check(
  'Canvas: salvar é emocional ("Beni salvou sua criação com carinho")',
  canvasSrc2.includes('Beni salvou sua criação com carinho') &&
  canvasSrc2.includes('Ver minhas artes'),
  'Canvas não tem feedback emocional de salvamento',
);

const paletteSrc = readSrc('src/constants/colorPalette.js');
check(
  'colorPalette exporta COLOR_FAMILIES (paleta organizada, compatível)',
  paletteSrc.includes('export const COLOR_FAMILIES') &&
  paletteSrc.includes('Principais') && paletteSrc.includes('Natureza') && paletteSrc.includes('Especiais'),
  'colorPalette não define COLOR_FAMILIES por família',
);

// ── Sprint Canvas Premium 2.0 e Retenção ────────────────────────────────────
const canvasV2 = readSrc('src/screens/AtelierCanvasScreen.js');
check(
  'Canvas 2.0: painel inferior por abas Cores / Pincel / Ferramentas',
  canvasV2.includes('panelTab') &&
  canvasV2.includes("label: 'Cores'") && canvasV2.includes("label: 'Pincel'") &&
  canvasV2.includes("label: 'Ferramentas'"),
  'AtelierCanvasScreen não tem painel inferior por abas (Cores/Pincel/Ferramentas)',
);
check(
  'Canvas 2.0: aba Pincel mostra preview do traço',
  canvasV2.includes('brushPreview'),
  'AtelierCanvasScreen não mostra preview do traço na aba Pincel',
);
check(
  'Canvas 2.0: diferencia modo guiado / criar livre',
  canvasV2.includes("mission ? 'guided' : 'free'") &&
  canvasV2.includes('Desenho guiado pelo Beni') && canvasV2.includes('Criar livre'),
  'AtelierCanvasScreen não diferencia os modos da mesa',
);
check(
  // H1.1: a dica de altura foi removida do modo borracha para os tamanhos
  // (Pequena/Média/Grande) caberem sem rolagem. Agora os rótulos orientam.
  'Canvas: borracha mostra os tamanhos (Pequena/Média/Grande) no modo borracha',
  canvasV2.includes("activeTool === 'borracha'") && canvasV2.includes('ERASER_SIZES.map'),
  'AtelierCanvasScreen não mostra os tamanhos da borracha',
);
check(
  'Canvas 2.0: recompensa ao salvar com progresso + Livrinho + Ver minhas artes',
  canvasV2.includes('rewardVisible') &&
  canvasV2.includes('Beni salvou sua criação com carinho') &&
  canvasV2.includes('entrar no seu Livrinho da Fé') &&
  canvasV2.includes('Continuar desenhando'),
  'AtelierCanvasScreen sem microfeedback de retenção ao salvar',
);
check(
  'Canvas 2.0: salvar arte aciona verificação de conquistas (Parte 7)',
  canvasV2.includes('useAchievementCelebration') &&
  canvasV2.includes('checkForNewAchievements') &&
  canvasV2.includes('AchievementUnlockModal'),
  'AtelierCanvasScreen não aciona conquistas ao salvar',
);
check(
  'Canvas 2.0: comentário de ganchos de retenção (Cultinho / Domingo / Relatório)',
  canvasV2.includes('Modo Cultinho em Casa') &&
  canvasV2.includes('História do Domingo') &&
  canvasV2.includes('Relatório semanal'),
  'AtelierCanvasScreen sem nota de preparação de retenção (Plano Mestre)',
);
check(
  'Canvas 2.0: TODO de assets próprios para os carimbos',
  canvasV2.includes('TODO(assets)'),
  'AtelierCanvasScreen sem TODO de assets próprios dos carimbos',
);

// ── Sprint Álbum de Conquistas e Recompensas 1.0 ────────────────────────────
const achSrc = readSrc('src/data/achievements.js');
check(
  'Conquistas: categorias definidas (ACHIEVEMENT_CATEGORIES) e campo category nas conquistas',
  achSrc.includes('ACHIEVEMENT_CATEGORIES') &&
  achSrc.includes("category: 'historias'") && achSrc.includes("category: 'cenas'") &&
  achSrc.includes("category: 'atelie'") && achSrc.includes("category: 'momentos'"),
  'achievements.js sem categorias / campo category',
);
check(
  'Conquistas: novas conquistas seguras (Guardião da Criação, Primeiro Livrinho, Pequeno artista da fé)',
  achSrc.includes("id: 'creation_complete'") &&
  achSrc.includes("id: 'first_book_opened'") &&
  achSrc.includes("id: 'little_artist_faith'"),
  'achievements.js não tem as novas conquistas seguras',
);
check(
  'Conquistas: progress() data-driven para a próxima conquista',
  achSrc.includes('progress: ctx =>'),
  'achievements.js sem progress() para calcular próxima conquista',
);

const achSvc = readSrc('src/services/achievementService.js');
check(
  'achievementService: anyBookOpened (gancho do Livrinho)',
  achSvc.includes('anyBookOpened') && achSvc.includes('storyBookOpened'),
  'achievementService não calcula anyBookOpened para a conquista do Livrinho',
);

const albumSrc = readSrc('src/screens/TrophiesScreen.js');
check(
  'Álbum: hero + frase explicativa + próxima conquista + categorias',
  albumSrc.includes('Álbum de Estrelinhas') &&
  albumSrc.includes('Você ganha estrelinhas ao completar cenas, histórias e momentos especiais.') &&
  albumSrc.includes('computeNextAchievement') &&
  albumSrc.includes('ACHIEVEMENT_CATEGORIES'),
  'TrophiesScreen não virou álbum por categorias com próxima conquista',
);
check(
  'Álbum: detalhe da conquista (modal) com "Como conquistar" e status do Beni',
  albumSrc.includes('COMO CONQUISTAR') &&
  albumSrc.includes('Beni viu essa vitória') &&
  albumSrc.includes('Continue sua jornada para desbloquear'),
  'TrophiesScreen sem modal de detalhe da conquista',
);
check(
  'Álbum: comentários de retenção futura (Cultinho / Domingo / Certificado / rotina semanal)',
  albumSrc.includes('Modo Cultinho em Casa') &&
  albumSrc.includes('História do Domingo') &&
  albumSrc.includes('Certificado por história') &&
  albumSrc.includes('rotina semanal'),
  'TrophiesScreen sem notas de preparação de retenção',
);

const unlockModalSrc = readSrc('src/components/achievements/AchievementUnlockModal.js');
check(
  'Celebração: mostra Beni + "Beni viu essa vitória" + botão Continuar',
  unlockModalSrc.includes('BeniAvatar') &&
  unlockModalSrc.includes('Beni viu essa vitória') &&
  unlockModalSrc.includes('Continuar'),
  'AchievementUnlockModal não foi melhorado (Beni + copy)',
);

const homeAlbumSrc = readSrc('src/screens/HomeScreen.js');
check(
  'Home: card "Você conquistou" leva ao Álbum de Estrelinhas',
  homeAlbumSrc.includes("navigation.navigate('Estrelinhas')") &&
  homeAlbumSrc.includes('VOCÊ CONQUISTOU'),
  'Home: ConquistaCard não aponta para Estrelinhas',
);

// ── Sprint Baú do Beni e Cartinhas da Fé 1.0 ────────────────────────────────
const navSrc2 = readSrc('src/navigation/AppNavigator.js');
const homeChestSrc = readSrc('src/screens/HomeScreen.js');
const chestSvc = readSrc('src/services/beniChestService.js');
check(
  'beniChestService define tipos de cartinha e categorias',
  chestSvc.includes('CHEST_CARD_TYPES') && chestSvc.includes('CHEST_CATEGORIES') &&
  chestSvc.includes('buildBeniChestCards') &&
  chestSvc.includes("historia") && chestSvc.includes("cena") && chestSvc.includes("arte") &&
  chestSvc.includes("livrinho"),
  'beniChestService não define tipos/categorias de cartinhas',
);
check(
  'beniChestService deriva de dados existentes e não coleta dado sensível',
  chestSvc.includes('getStoryCoverImage') && chestSvc.includes('thumbnailBase64') &&
  !/expo-location|expo-camera|ImagePicker|Geolocation|AsyncStorage/i.test(chestSvc),
  'beniChestService usa storage/API sensível ou não reaproveita assets',
);

const chestScreen = readSrc('src/screens/BeniChestScreen.js');
check(
  'BeniChestScreen tem hero, progresso, próxima cartinha e detalhe',
  chestScreen.includes('Baú do Beni') &&
  chestScreen.includes('cartinha') &&
  chestScreen.includes('PRÓXIMA CARTINHA') &&
  chestScreen.includes('Continue sua jornada para revelar'),
  'BeniChestScreen incompleta',
);
check(
  'AppNavigator registra a rota BeniChest',
  navSrc2.includes('name="BeniChest"') && navSrc2.includes('BeniChestScreen'),
  'Rota BeniChest não registrada',
);
check(
  'Home tem entrada para o Baú do Beni (card → BeniChest)',
  homeChestSrc.includes('Baú do Beni') &&
  homeChestSrc.includes("navigation.navigate('BeniChest')") &&
  homeChestSrc.includes('Suas cartinhas de fé'),
  'Home sem entrada para o Baú do Beni',
);
check(
  'Conquista de primeiro passo (first_chest_card) existe, sem confundir com o Baú',
  achSrc.includes("id: 'first_chest_card'") &&
  achSrc.includes("category: 'momentos'") &&
  !achSrc.includes('Encontrou sua primeira cartinha'),
  'Conquista de primeiro passo ausente ou ainda referencia o Baú',
);

// Execução real: buildBeniChestCards null-safe (sandbox com stubs de imagem).
(() => {
  let ok = false, err = null, hasBeniCard = false;
  try {
    const raw = readSrc('src/services/beniChestService.js');
    const code =
      'const getOfficialSceneIllustration=()=>null,getStoryCoverImage=()=>null;'
      + raw
        .replace(/import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?/g, '')
        .replace(/export\s+function\s+/g, 'function ')
        .replace(/export\s+const\s+/g, 'const ')
      + '\nreturn { buildBeniChestCards, getBeniChestSummary, getNextChestCard };';
    // eslint-disable-next-line no-new-func
    const mod = new Function(code)();
    const inputs = [
      undefined, null, {},
      { progressByStory: null, stories: null, arts: null, ctx: null },
      { progressByStory: {}, stories: [], arts: [], ctx: {} },
      { stories: [{ id: 'x' }], progressByStory: {}, arts: [], ctx: {} },
      { stories: [{ id: 'y', totalCenas: 2, cenas: [{ id: 1 }] }], progressByStory: { y: { 1: true } }, arts: [{ id: 'a', thumbnailBase64: null }], ctx: { totalScenes: 1 } },
      { ctx: { familyWorshipDone: true, anyBookOpened: true } },
    ];
    for (const inp of inputs) {
      const cards = mod.buildBeniChestCards(inp);
      const sum = mod.getBeniChestSummary(cards);
      mod.getNextChestCard(cards);
      if (!Array.isArray(cards) || typeof sum.unlocked !== 'number') err = err || 'shape inválido';
    }
    const baseCards = mod.buildBeniChestCards({});
    hasBeniCard = Array.isArray(baseCards) && baseCards.some(c => c && c.category === 'beni' && c.unlocked);
    ok = true;
  } catch (e) {
    err = e.message;
  }
  check(
    'buildBeniChestCards executa null-safe com ctx/arts/progresso vazios e nunca lança',
    ok && err === null,
    `Baú quebrou com entrada hostil → ${err}`,
  );
  check(
    'Baú nunca abre vazio: sempre há a cartinha inicial do Beni desbloqueada',
    hasBeniCard,
    'Baú do Beni pode abrir vazio (sem cartinha inicial)',
  );
})();

// ── Correção Baú 2.0.1: imagens de cenas e estado Nova ──────────────────────
const chestSvc3 = readSrc('src/services/beniChestService.js');
check(
  'beniChestService: resolveCardImageSource + CARD_FALLBACK por categoria',
  chestSvc3.includes('export function resolveCardImageSource') &&
  chestSvc3.includes('CARD_FALLBACK') &&
  chestSvc3.includes('cenas:') && chestSvc3.includes('Cena da história'),
  'beniChestService sem resolver de imagem / fallback de categoria',
);
check(
  'Cartinha de Cena resolve ilustração oficial → capa → fallback',
  chestSvc3.includes('getOfficialSceneIllustration(s.id, cena1 && cena1.id) || getStoryCoverImage(s.id)'),
  'Cartinha de Cena não tenta ilustração oficial e capa',
);

const chestCard2 = readSrc('src/components/beni/BeniChestCard.js');
check(
  'BeniChestCard usa resolveCardImageSource e CategoryFallback (nunca corpo vazio)',
  chestCard2.includes('resolveCardImageSource') &&
  chestCard2.includes('CategoryFallback') &&
  chestCard2.includes('CardArt'),
  'BeniChestCard não normaliza imagem / não tem fallback de categoria',
);
check(
  'BeniChestCard usa <Image> + CategoryFallback de categoria (desbloqueada nunca vazia)',
  chestCard2.includes('CategoryFallback') &&
  /Image source=\{source\}/.test(chestCard2) &&
  !chestCard2.includes('SafeImage'),
  'BeniChestCard não usa Image + CategoryFallback (rollback de capa)',
);
check(
  'BeniChestCard: artes usam resizeMode contain',
  /isArt && source/.test(chestCard2) && chestCard2.includes('resizeMode="contain"'),
  'BeniChestCard não usa contain nas artes',
);
check(
  'BeniChestCard: título permite 2 linhas',
  chestCard2.includes('numberOfLines={2}'),
  'BeniChestCard ainda corta título em 1 linha',
);

const chestScreen3 = readSrc('src/screens/BeniChestScreen.js');
check(
  'Detalhe da cartinha também usa resolveCardImageSource + fallback',
  chestScreen3.includes('resolveCardImageSource(selected)') &&
  chestScreen3.includes('detailFallback'),
  'Detalhe da cartinha pode aparecer sem imagem',
);
check(
  'Estado Nova: deriva de getUnseenUnlockedChestCards e some ao guardar',
  chestScreen3.includes('getUnseenUnlockedChestCards') &&
  chestScreen3.includes('markManyChestCardsSeen(revealQueue.map') &&
  chestScreen3.includes('setNewIds([])'),
  'Fluxo do badge Nova incorreto',
);

// ── Sprint Baú do Beni 2.0: revelação, premium, coleção viva ────────────────
const seenSvc = readSrc('src/services/beniChestSeenStorage.js');
check(
  'Storage de cartinhas vistas existe e salva só ids (chave dedicada)',
  seenSvc.includes('@ptf_beni_chest_seen_cards_v1') &&
  seenSvc.includes('getSeenChestCardIds') && seenSvc.includes('markChestCardSeen') &&
  seenSvc.includes('markManyChestCardsSeen') && seenSvc.includes('getUnseenUnlockedChestCards') &&
  seenSvc.includes("typeof id === 'string'"),
  'beniChestSeenStorage ausente ou não restringe a ids',
);
check(
  'Storage de vistas não coleta dado sensível',
  !/expo-location|expo-camera|ImagePicker|Geolocation|previewBase64|thumbnailBase64/i.test(seenSvc),
  'beniChestSeenStorage parece salvar dado sensível/imagem',
);

const chestSvc2 = readSrc('src/services/beniChestService.js');
check(
  'Cartinhas têm raridade common/special/shiny',
  chestSvc2.includes('CHEST_RARITIES') &&
  chestSvc2.includes("rarity: 'common'") && chestSvc2.includes("rarity: 'special'") &&
  chestSvc2.includes("rarity: 'shiny'"),
  'beniChestService não define raridades nas cartinhas',
);

const chestCardComp = readSrc('src/components/beni/BeniChestCard.js');
check(
  'BeniChestCard: estados (new/locked), badge "Nova", verso de cartinha (sem "???")',
  chestCardComp.includes('isNew') && chestCardComp.includes('Nova') &&
  chestCardComp.includes('Cartinha escondida') && chestCardComp.includes('backCover') &&
  !chestCardComp.includes('???'),
  'BeniChestCard sem estados/verso adequados',
);

const chestScreen2 = readSrc('src/screens/BeniChestScreen.js');
check(
  'Baú 2.0: modal de revelação ("Beni encontrou uma nova cartinha" + Guardar no Baú)',
  chestScreen2.includes('Beni encontrou uma nova cartinha') &&
  chestScreen2.includes('Guardar no Baú') &&
  chestScreen2.includes('getUnseenUnlockedChestCards'),
  'BeniChestScreen sem modal de revelação',
);
check(
  'Baú 2.0: abas/chips por categoria + limite de bloqueadas (Ver cartinhas escondidas)',
  chestScreen2.includes('activeTab') &&
  chestScreen2.includes('Ver cartinhas escondidas') &&
  chestScreen2.includes('MAX_LOCKED_CATEGORY'),
  'BeniChestScreen sem filtros/limite de bloqueadas',
);
check(
  'Baú 2.0: tela não usa "???" como texto principal',
  !chestScreen2.includes('???'),
  'BeniChestScreen ainda usa "???"',
);
check(
  'Home: card do Baú sem texto cortado (subtítulo curto + contador)',
  homeChestSrc.includes('Suas cartinhas de fé') &&
  homeChestSrc.includes('encontrada') &&
  homeChestSrc.includes('bauCountPill'),
  'Home: card do Baú ainda corta texto / sem contador',
);

// Execução real (síncrona): storage de vistas não lança com entradas hostis.
(() => {
  let err = null;
  try {
    const raw = readSrc('src/services/beniChestSeenStorage.js');
    const store = {};
    const code =
      'const AsyncStorage={getItem:async k=>(k in store?store[k]:null),setItem:async (k,v)=>{store[k]=v;}};'
      + raw
        .replace(/import\s+[^;]+;?/g, '')
        .replace(/export\s+async\s+function\s+/g, 'async function ')
        .replace(/export\s+function\s+/g, 'function ')
        .replace(/export\s+const\s+/g, 'const ')
      + '\nreturn { getSeenChestCardIds, markChestCardSeen, markManyChestCardsSeen, getUnseenUnlockedChestCards };';
    // eslint-disable-next-line no-new-func
    const mod = new Function('store', code)(store);
    const swallow = p => { if (p && typeof p.then === 'function') p.catch(() => {}); };
    // Nenhuma chamada pode lançar de forma síncrona, mesmo com lixo de entrada.
    swallow(mod.getSeenChestCardIds());
    swallow(mod.markChestCardSeen(null));
    swallow(mod.markChestCardSeen(undefined));
    swallow(mod.markChestCardSeen('hist_creation'));
    swallow(mod.markManyChestCardsSeen(null));
    swallow(mod.markManyChestCardsSeen(['a', 1, null, 'b']));
    swallow(mod.getUnseenUnlockedChestCards(null));
    swallow(mod.getUnseenUnlockedChestCards([{ id: 'x', unlocked: true }, null, { unlocked: true }]));
  } catch (e) {
    err = e.message;
  }
  check(
    'beniChestSeenStorage não lança com null/undefined/dados inválidos',
    err === null,
    `Storage de vistas quebrou → ${err}`,
  );
})();

// ── Sprint Modo Cultinho em Casa 1.0 ────────────────────────────────────────
const worshipSvc = readSrc('src/services/familyWorshipService.js');
check(
  'familyWorshipService existe com funções esperadas',
  worshipSvc.includes('getFamilyWorshipSummary') &&
  worshipSvc.includes('markFamilyWorshipCompleted') &&
  worshipSvc.includes('getLastFamilyWorshipDate'),
  'familyWorshipService sem as funções de registro local do cultinho',
);
check(
  'familyWorshipService só guarda dados não sensíveis (count/lastDate/lastStoryId, sem APIs sensíveis)',
  worshipSvc.includes('count') && worshipSvc.includes('lastStoryId') && worshipSvc.includes('lastDate') &&
  !/expo-location|expo-camera|expo-image-picker|ImagePicker|Geolocation|getCurrentPositionAsync/i.test(worshipSvc),
  'familyWorshipService usa alguma API de dado sensível (localização/câmera/foto)',
);
check(
  'familyWorshipService prepara História do Domingo (getStoryOfTheWeek) sem push/agendamento real',
  worshipSvc.includes('getStoryOfTheWeek') &&
  !/expo-notifications|scheduleNotificationAsync|registerForPushNotifications/i.test(worshipSvc),
  'familyWorshipService não prepara História do Domingo de forma segura',
);

const cultinhoScreen = readSrc('src/screens/CultinhoEmCasaScreen.js');
check(
  'CultinhoEmCasaScreen tem a estrutura 4B (passagem, Beni explica, conversa, oração, concluir)',
  cultinhoScreen.includes('Cultinho em Casa') &&
  cultinhoScreen.includes('A passagem de hoje') &&
  cultinhoScreen.includes('Beni explica') &&
  cultinhoScreen.includes('Conversa em família') &&
  cultinhoScreen.includes('Oração curtinha') &&
  cultinhoScreen.includes('Concluir cultinho') &&
  cultinhoScreen.includes('Cultinho guardado'),
  'CultinhoEmCasaScreen incompleta (faltam blocos do fluxo 4B)',
);
check(
  'CultinhoEmCasaScreen registra localmente e escolhe história vitrine (getStoryOfTheWeek)',
  cultinhoScreen.includes('markFamilyWorshipCompleted') &&
  cultinhoScreen.includes('getStoryOfTheWeek'),
  'CultinhoEmCasaScreen não registra cultinho / não usa história recomendada',
);

const navSrc = readSrc('src/navigation/AppNavigator.js');
check(
  'AppNavigator registra a rota FamilyWorship (Cultinho em Casa)',
  navSrc.includes("name=\"FamilyWorship\"") && navSrc.includes('CultinhoEmCasaScreen'),
  'Rota FamilyWorship não registrada no navegador',
);

const homeCultinho = readSrc('src/screens/HomeScreen.js');
check(
  'Home tem entrada para o Cultinho em Casa (card → FamilyWorship)',
  homeCultinho.includes('Cultinho em Casa') &&
  homeCultinho.includes("navigation.navigate('FamilyWorship')") &&
  homeCultinho.includes('5 min'),
  'Home sem card de entrada para o Cultinho em Casa',
);

check(
  'Conquista "Primeiro cultinho" existe, categoria coração, check defensivo (flag/familyWorshipDone)',
  achSrc.includes("id: 'first_family_worship'") &&
  achSrc.includes("flag(ctx, 'familyWorshipDone')"),
  'Conquista do cultinho ausente ou não-defensiva',
);
check(
  'achievementService alimenta familyWorshipDone (gancho do cultinho)',
  achSvc.includes('familyWorshipDone') && achSvc.includes('getFamilyWorshipSummary'),
  'achievementService não calcula familyWorshipDone',
);

// ── Fix crash Estrelinhas: conquistas null-safe (execução real) ─────────────
// Avalia achievements.js num sandbox e roda check/progress/progressLabel contra
// contextos hostis. Garante que NENHUMA função lança exceção (regressão do
// "Cannot read property 'totalScenes' of null").
(() => {
  let loadOk = false;
  let ACH = [];
  try {
    const raw = readSrc('src/data/achievements.js');
    const code = raw
      .replace(/import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?/g, '') // remove imports ESM
      .replace(/export\s+const\s+/g, 'const ')
      + '\nreturn { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES };';
    const colorsStub = new Proxy({}, { get: () => '#000000' });
    // eslint-disable-next-line no-new-func
    const factory = new Function('colors', code);
    const mod = factory(colorsStub);
    ACH = mod.ACHIEVEMENTS || [];
    loadOk = Array.isArray(ACH) && ACH.length > 0;
  } catch (e) {
    loadOk = false;
  }

  check(
    'achievements.js avalia em sandbox (ESM stripável) e expõe ACHIEVEMENTS',
    loadOk,
    'Não foi possível avaliar achievements.js para o teste de robustez',
  );
  if (!loadOk) return;

  // Contextos hostis: undefined, null, vazio, progressByStory vazio/null, storyId ausente, tipos errados.
  const hostileCtxs = [
    undefined,
    null,
    {},
    { progressByStory: {} },
    { progressByStory: null },
    { totalScenes: undefined, completedStories: null, savedDrawingCount: undefined },
    { totalScenes: 'x', completedStories: NaN, savedDrawingCount: {} },
    { someMissingStory: null },
  ];

  let firstError = null;
  let progressShapeOk = true;
  for (const a of ACH) {
    for (const ctx of hostileCtxs) {
      try { a.check(ctx); } catch (e) { firstError = firstError || `check '${a.id}': ${e.message}`; }
      if (typeof a.progress === 'function') {
        try {
          const p = a.progress(ctx);
          // Para ctx objeto, progress deve devolver shape numérico válido.
          if (ctx && typeof ctx === 'object') {
            if (!p || typeof p.current !== 'number' || typeof p.target !== 'number' ||
                !Number.isFinite(p.current) || !Number.isFinite(p.target)) {
              progressShapeOk = false;
            }
          }
        } catch (e) { firstError = firstError || `progress '${a.id}': ${e.message}`; }
      }
      if (typeof a.progressLabel === 'function') {
        try { a.progressLabel(ctx); } catch (e) { firstError = firstError || `progressLabel '${a.id}': ${e.message}`; }
      }
    }
  }

  check(
    'Conquistas: check/progress/progressLabel nunca lançam com ctx hostil (null/{}/sem storyId)',
    firstError === null,
    `Conquista quebrou com ctx hostil → ${firstError}`,
  );
  check(
    'Conquistas: progress() sempre retorna { current:number, target:number } finito',
    progressShapeOk,
    'Alguma progress() retornou shape inválido com ctx objeto',
  );

  // Toda conquista com progressLabel também tem progress (e vice-versa, coerência)
  const progressCoherent = ACH.every(a =>
    (typeof a.progress === 'function') === (typeof a.progressLabel === 'function'),
  );
  check(
    'Conquistas: progress e progressLabel andam juntos (coerência)',
    progressCoherent,
    'Conquista tem só progress ou só progressLabel — pode confundir a UI',
  );
})();

// ── Sprint UX 1 · Bloco 1 — Confiança ───────────────────────────────────────

// Tarefa 1 — Quiz por id
const quizModelSrc = readSrc('src/services/quizModel.js');
const quizScreenB1 = readSrc('src/screens/QuizScreen.js');
check(
  'quizModel: normaliza para options {id,text} + correctOptionId e embaralha',
  quizModelSrc.includes('correctOptionId') && quizModelSrc.includes('prepareQuizQuestions') &&
  quizModelSrc.includes('normalizeQuizQuestion'),
  'quizModel ausente / sem modelo por id',
);
check(
  'QuizScreen valida por selectedOptionId === correctOptionId (não por posição)',
  quizScreenB1.includes('selectedOptionId === question.correctOptionId') &&
  quizScreenB1.includes('prepareQuizQuestions') &&
  !quizScreenB1.includes('selected === question.correct'),
  'QuizScreen ainda valida por índice/letra',
);
check(
  'QuizScreen: letra A/B/C é só rótulo visual (String.fromCharCode por idx)',
  quizScreenB1.includes('String.fromCharCode(65 + idx)'),
  'QuizScreen não usa a letra apenas como rótulo visual',
);
// Execução real (sandbox): modelo por id, normalização legada e null-safe.
(() => {
  let err = null, ok = false;
  try {
    const raw = readSrc('src/services/quizModel.js');
    const code = raw
      .replace(/export\s+function\s+/g, 'function ')
      + '\nreturn { normalizeQuizQuestion, prepareQuizQuestions, getCorrectOptionText };';
    // eslint-disable-next-line no-new-func
    const m = new Function(code)();
    // Legado: correct índice 0 → correctOptionId aponta para a 1ª opção.
    const n = m.normalizeQuizQuestion({ id: 'q1', question: 'p', options: ['A', 'B', 'C'], correct: 0 });
    const correct = n.options.find(o => o.id === n.correctOptionId);
    if (!correct || correct.text !== 'A') err = 'normalize legado falhou';
    // Após embaralhar, a opção correta continua sendo a de texto 'A'.
    const prepared = m.prepareQuizQuestions([{ id: 'q1', question: 'p', options: ['A', 'B', 'C'], correct: 0 }]);
    const pc = prepared[0].options.find(o => o.id === prepared[0].correctOptionId);
    if (!pc || pc.text !== 'A') err = err || 'shuffle perdeu a correta';
    // Null-safe.
    if (m.normalizeQuizQuestion(null) !== null) err = err || 'normalize(null) deveria ser null';
    if (!Array.isArray(m.prepareQuizQuestions(null))) err = err || 'prepare(null) deveria ser []';
    ok = true;
  } catch (e) { err = e.message; }
  check('quizModel executa por id, normaliza legado e é null-safe (sandbox)', ok && err === null, `quizModel falhou → ${err}`);
})();

// Tarefa 2 — SafeImage
const safeImgSrc = readSrc('src/components/ui/SafeImage.js');
check(
  'SafeImage tem estados loading/loaded/erro + fallback',
  safeImgSrc.includes("'loading'") && safeImgSrc.includes("'error'") &&
  safeImgSrc.includes('onError') && safeImgSrc.includes('renderFallback'),
  'SafeImage sem estados de carregamento/erro/fallback',
);
check(
  'SafeImage mantido onde não alterou o visual (Galeria); existe e segue robusto',
  readSrc('src/screens/AtelierGalleryScreen.js').includes('SafeImage') &&
  safeImgSrc.includes('SafeImage'),
  'SafeImage não está mais na Galeria',
);
check(
  'ROLLBACK: capas de história usam <Image> original (SafeImage removido dos cards)',
  readSrc('src/components/StoryCard.js').includes('<Image source={coverImg}') &&
  !readSrc('src/components/StoryCard.js').includes('SafeImage') &&
  !readSrc('src/components/beni/BeniChestCard.js').includes('SafeImage') &&
  !readSrc('src/components/story/StoryCoverImage.js').includes('SafeImage') &&
  !readSrc('src/screens/StoryBookScreen.js').includes('SafeImage'),
  'Capas de história ainda usam SafeImage — rollback incompleto',
);
check(
  'Home/Aventuras: capa de história volta ao caminho original (Image + images[imagemCapa])',
  readSrc('src/screens/HomeScreen.js').includes('source={images[story.imagemCapa]}') &&
  !readSrc('src/screens/HomeScreen.js').includes('SafeImage') &&
  readSrc('src/components/StoryCard.js').includes('resizeMode="cover"'),
  'Capa de Home/Aventuras não voltou ao <Image> original',
);

// Tarefa 3 — lineart sempre presente + guarda de salvar
const coloringCanvasB1 = readSrc('src/components/ColoringCanvas.js');
const coloringScreenB1 = readSrc('src/screens/ColoringScreen.js');
check(
  'ColoringCanvas expõe prontidão (onReadyChange) e mostra "Carregando desenho..."',
  coloringCanvasB1.includes('onReadyChange') && coloringCanvasB1.includes('Carregando desenho'),
  'ColoringCanvas sem sinal de prontidão / texto de carregamento',
);
check(
  'ColoringScreen bloqueia salvar sem lineart carregado (canvasReady)',
  coloringScreenB1.includes('canvasReady') && coloringScreenB1.includes('onReadyChange={setCanvasReady}') &&
  /if \(!canvasReady\)/.test(coloringScreenB1),
  'ColoringScreen não bloqueia salvar sem lineart',
);

// Tarefa 4 — planConfig + acesso (consolidado em src/data/planConfig.js)
const planCfgSrc = readSrc('src/data/planConfig.js');
const accessB1 = readSrc('src/services/accessControl.js');
check(
  'planConfig: fonte única (FREE_STORY_IDS creation+noah, sem david) + rótulos',
  planCfgSrc.includes("FREE_STORY_IDS = ['creation', 'noah']") &&
  planCfgSrc.includes("free: 'Grátis'") && planCfgSrc.includes("premium: 'Plano Família'") &&
  planCfgSrc.includes("coming_soon: 'Em breve'") &&
  planCfgSrc.includes('export function getStoryPlan'),
  'planConfig não define corretamente grátis/rótulos',
);
check(
  'accessControl consulta planConfig (getStoryPlan) como fonte única',
  accessB1.includes("from '../data/planConfig'") && accessB1.includes('getStoryPlan(story)'),
  'accessControl não usa planConfig',
);
// Varredura: nenhum rótulo de bloqueio proibido nas telas/components infantis.
(() => {
  const files = [
    'src/components/ui/StatusBadge.js', 'src/components/StoryCard.js',
    'src/components/story/NextAdventureCard.js', 'src/components/premium/PremiumLockCard.js',
    'src/components/premium/LockedStoryFallback.js', 'src/services/contentAccessService.js',
    'src/screens/StoriesScreen.js', 'src/screens/HomeScreen.js', 'src/screens/QuizScreen.js',
    'src/screens/ReflectionScreen.js', 'src/screens/LumiMomentScreen.js',
    'src/screens/StoryBookScreen.js', 'src/screens/PostStoryHubScreen.js',
    'src/screens/StoryDetailScreen.js', 'src/data/achievements.js',
  ];
  const offenders = files.filter(f => {
    const s = readSrc(f);
    return s.includes('Especial da Família') || s.includes('Conteúdo familiar') || s.includes('Conteudo familiar');
  });
  check(
    'Nenhum rótulo "Especial da Família"/"Conteúdo familiar" nas telas/components infantis',
    offenders.length === 0,
    `Rótulo de bloqueio proibido em: ${offenders.join(', ')}`,
  );
})();

// Tarefa 5 — banner Modo Criador
const bannerSrc = readSrc('src/components/dev/CreatorModeBanner.js');
const creatorSvcB1 = readSrc('src/services/creatorQaMode.js');
const navB1 = readSrc('src/navigation/AppNavigator.js');
check(
  'CreatorModeBanner mostra "MODO CRIADOR ATIVO" e assina mudanças do modo',
  bannerSrc.includes('MODO CRIADOR ATIVO') && bannerSrc.includes('subscribeCreatorQaMode') &&
  creatorSvcB1.includes('export function subscribeCreatorQaMode') && creatorSvcB1.includes('notifyListeners'),
  'CreatorModeBanner / subscribe ausentes',
);
check(
  'AppNavigator renderiza o banner global do Modo Criador',
  navB1.includes('CreatorModeBanner') && navB1.includes('<CreatorModeBanner'),
  'AppNavigator não renderiza o CreatorModeBanner',
);

// Tarefa 6 — header único no Momento com Beni
check(
  'Momento com Beni tem header único (nativo desligado + controle contextual)',
  /name="LumiMoment"[\s\S]*?headerShown: false/.test(navB1) &&
  lumiMomSrc91.includes('navigation.canGoBack()'),
  'LumiMoment ainda tem header duplicado',
);

// ── Sprint Reestruturação UX 1.0 — Bloco 2: estrutura da jornada ─────────────
console.log('\n── Sprint UX 1.0 — Bloco 2 ──');

const ux2Home = readSrc('src/screens/HomeScreen.js');
const ux2Nav = readSrc('src/navigation/AppNavigator.js');
const ux2Cultinho = readSrc('src/screens/CultinhoEmCasaScreen.js');
const ux2Canvas = readSrc('src/screens/AtelierCanvasScreen.js');
const ux2Atelier = readSrc('src/screens/AtelierScreen.js');
const ux2Congrats = readSrc('src/screens/CongratsScreen.js');
const ux2Coloring = readSrc('src/screens/ColoringScreen.js');
const ux2Beni = readSrc('src/screens/BeniChestScreen.js');
const ux2Trophies = readSrc('src/screens/TrophiesScreen.js');
const ux2Origin = readSrc('src/utils/originBack.js');

check(
  'Bloco 2: helper originBack expõe backLabelFor + isFromTab e rótulo storyComplete = "Voltar para a conclusão"',
  ux2Origin.includes('export function backLabelFor') &&
  ux2Origin.includes('export function isFromTab') &&
  ux2Origin.includes('Voltar para a conclusão') &&
  ux2Origin.includes("'Voltar ao Início'"),
  'src/utils/originBack.js ausente ou sem rótulos esperados',
);

check(
  'Bloco 2: Home não duplica a tab Aventuras (sem WORLDS/Caminhos da fé)',
  !ux2Home.includes('Caminhos da fé') && !ux2Home.includes('const WORLDS') &&
  !ux2Home.includes('WorldCardCompact'),
  'HomeScreen ainda contém a seção de mundos',
);

check(
  'Bloco 2: Home tem atalho "Criar com Beni" que abre fluxo contextual (from: createWithBeni)',
  ux2Home.includes('Criar com Beni') && ux2Home.includes("from: 'createWithBeni'") &&
  ux2Home.includes("navigation.navigate('AtelierCanvas'"),
  'HomeScreen não tem o atalho Criar com Beni contextual',
);

check(
  'Bloco 2: AppNavigator registra rota Stack AtelierFromContext (sem quebrar a tab Ateliê)',
  ux2Nav.includes('name="AtelierFromContext"') && ux2Nav.includes('component={AtelierScreen}'),
  'AppNavigator não registra a rota AtelierFromContext',
);

check(
  'Bloco 2: Cultinho abre o Ateliê via AtelierFromContext com from: cultinho (e pode voltar)',
  ux2Cultinho.includes("navigation.navigate('AtelierFromContext'") &&
  ux2Cultinho.includes("from: 'cultinho'"),
  'CultinhoEmCasaScreen não abre AtelierFromContext from:cultinho',
);

check(
  'Bloco 2: AtelierScreen mostra Voltar contextual quando não vem da tab (isFromTab/backLabelFor)',
  ux2Atelier.includes('isFromTab') && ux2Atelier.includes('backLabelFor'),
  'AtelierScreen não usa o back contextual por origem',
);

check(
  'Bloco 2: Canvas reconhece modo Criar com Beni (header "Criar com Beni" + voltar ao Início)',
  ux2Canvas.includes("from === 'createWithBeni'") &&
  ux2Canvas.includes('Criar com Beni') &&
  ux2Canvas.includes('Início'),
  'AtelierCanvasScreen não trata o modo createWithBeni',
);

check(
  'Bloco 2: Conclusão tem 3 ações principais (Livrinho/Quiz/Próxima aventura) com reward tiles',
  ux2Congrats.includes('Abrir Livrinho da Fé') &&
  ux2Congrats.includes('mainActionBtn') &&
  ux2Congrats.includes('rewardGrid') &&
  ux2Congrats.includes('RewardTile') &&
  ux2Congrats.includes('Você desbloqueou'),
  'CongratsScreen não tem a primeira dobra com 3 ações + grade de recompensas',
);

check(
  'Bloco 2: Conclusão propaga from: storyComplete nas recompensas e Livrinho antes do Resumo',
  ux2Congrats.includes("from: 'storyComplete'") &&
  ux2Congrats.indexOf('Abrir Livrinho da Fé') < ux2Congrats.indexOf('Resumo da aventura'),
  'CongratsScreen não propaga origem ou ordem incorreta',
);

check(
  'Bloco 2: telas reusadas mostram back contextual por origem (Colorir/Baú/Estrelinhas)',
  ux2Coloring.includes('backLabelFor') &&
  ux2Beni.includes('backLabelFor') &&
  ux2Trophies.includes('backLabelFor'),
  'Alguma tela reusada não importou backLabelFor',
);

// ── Sprint Reestruturação UX 1.0 — Bloco 3: Livrinho 2 modos + Ateliê simples ─
console.log('\n── Sprint UX 1.0 — Bloco 3 ──');

const ux3Flags = readSrc('src/config/featureFlags.js');
const ux3Livro = readSrc('src/screens/StoryBookScreen.js');
const ux3Canvas = readSrc('src/screens/AtelierCanvasScreen.js');

check(
  'Bloco 3: featureFlags expõe STAMPS_ENABLED = false',
  /export const STAMPS_ENABLED\s*=\s*false/.test(ux3Flags),
  'src/config/featureFlags.js ausente ou STAMPS_ENABLED não é false',
);

check(
  'Bloco 3: Livrinho default = História ilustrada (official), nunca inicia em mixed',
  ux3Livro.includes("useState('official')") &&
  !ux3Livro.includes("useState('mixed')"),
  'StoryBookScreen deve iniciar no modo official (História ilustrada)',
);

check(
  'Bloco 3: Livrinho preserva contorno por cima da arte (Bloco 1 intacto, sem paintOnly)',
  ux3Livro.includes('paintWithLineart') &&
  ux3Livro.includes('paintWithLineartFull') &&
  ux3Livro.includes('lineartMultiply') &&
  !ux3Livro.includes('paintOnly'),
  'StoryBookScreen enfraqueceu a regra de lineart por cima da arte (Bloco 1)',
);

// HOTFIX Bloco 3 — readiness: cor + contorno juntos, nunca cor sozinha por 1 frame
check(
  'HOTFIX: ChildArtWithLineart só revela quando cor E contorno carregaram (sem frame sem lineart)',
  ux3Livro.includes('function ChildArtWithLineart') &&
  ux3Livro.includes('paintLoaded') && ux3Livro.includes('lineartLoaded') &&
  /const ready = paintLoaded && lineartLoaded/.test(ux3Livro) &&
  /opacity: ready \? 1 : 0/.test(ux3Livro) &&
  ux3Livro.includes('Carregando desenho'),
  'StoryBookScreen não garante readiness de cor+contorno (pode piscar cor sem lineart)',
);

check(
  'HOTFIX: arte da criança renderiza via ChildArtWithLineart com key estável (remount por página)',
  /<ChildArtWithLineart/.test(ux3Livro) &&
  /key=\{`art-\$\{story\.id\}-\$\{cena\.id\}-\$\{viewMode\}/.test(ux3Livro) &&
  ux3Livro.includes('onLoad={() => setPaintLoaded(true)}') &&
  ux3Livro.includes('onLoad={() => setLineartLoaded(true)}'),
  'StoryBookScreen não usa ChildArtWithLineart com key estável + onLoad das duas camadas',
);

check(
  'Bloco 3: cards de modo têm título, descrição e prévia visual distinta',
  ux3Livro.includes('Reveja a aventura com as imagens da história.') &&
  ux3Livro.includes('Veja as cenas que você pintou.') &&
  ux3Livro.includes('modePreview') &&
  ux3Livro.includes('officialPreview'),
  'StoryBookScreen: cards de modo sem descrição/prévia visual distinta',
);

check(
  'Bloco 3: Canvas importa STAMPS_ENABLED e esconde carimbos por flag',
  ux3Canvas.includes("from '../config/featureFlags'") &&
  ux3Canvas.includes('STAMPS_ENABLED ? [{ id:') &&
  ux3Canvas.includes('STAMPS_ENABLED && activeTool === \'carimbos\'') &&
  ux3Canvas.includes("STAMPS_ENABLED && openTab === 'carimbos'"),
  'AtelierCanvasScreen não esconde os carimbos (chip + painel + init) por STAMPS_ENABLED',
);

check(
  'Bloco 3: código de carimbos preservado (não deletado) no Canvas',
  ux3Canvas.includes('CORE_STAMPS') &&
  ux3Canvas.includes('handleStampPress') &&
  ux3Canvas.includes('handleResizeStamp'),
  'AtelierCanvasScreen perdeu o código de carimbos — deveria apenas escondê-lo',
);

check(
  'Bloco 3: Canvas mantém ferramentas essenciais (cores/pincel/borracha/desfazer/limpar/pronto)',
  ux3Canvas.includes("id: 'desenhar'") && ux3Canvas.includes("id: 'borracha'") &&
  ux3Canvas.includes('handleUndo') && ux3Canvas.includes('handleClearAll') &&
  ux3Canvas.includes('BRUSH_SIZES'),
  'AtelierCanvasScreen perdeu alguma ferramenta essencial do fluxo principal',
);

// ── Sprint Reestruturação UX 1.0 — Bloco 4A: Baú valor percebido ─────────────
console.log('\n── Sprint UX 1.0 — Bloco 4A ──');

const ux4Svc = readSrc('src/services/beniChestService.js');
const ux4Card = readSrc('src/components/beni/BeniChestCard.js');
const ux4Screen = readSrc('src/screens/BeniChestScreen.js');

check(
  'Bloco 4A: CARD_FALLBACK tem gradiente vivo (gradStrong) por categoria',
  ux4Svc.includes('gradStrong') &&
  (ux4Svc.match(/gradStrong:/g) || []).length >= 6,
  'beniChestService: CARD_FALLBACK sem gradiente premium (gradStrong) por categoria',
);

check(
  'Bloco 4A: origens comunicam "por que ganhei" (Coração/Livrinho/Cenas/Artes)',
  ux4Svc.includes('Você ganhou ao fazer um Cultinho em Casa.') &&
  ux4Svc.includes('Você ganhou ao concluir uma aventura.') &&
  /origin: `Você ganhou ao viver uma cena de/.test(ux4Svc) &&
  ux4Svc.includes('Você ganhou ao salvar uma arte no Ateliê.'),
  'beniChestService: origens não explicam por que a cartinha foi ganha',
);

check(
  'Bloco 4A: cartinhas de história/cena carregam storyId (para ação "Rever história")',
  /storyId: s\.id/.test(ux4Svc) &&
  (ux4Svc.match(/storyId: s\.id/g) || []).length >= 2,
  'beniChestService: histórias/cenas sem storyId para a ação do detalhe',
);

check(
  'Bloco 4A: card desbloqueado sem imagem usa PremiumFallback (vivo + selo + origem)',
  ux4Card.includes('function PremiumFallback') &&
  ux4Card.includes('gradStrong') &&
  ux4Card.includes('✓ Desbloqueada') &&
  /return <PremiumFallback card=\{card\} \/>/.test(ux4Card),
  'BeniChestCard: desbloqueada sem imagem ainda usa fallback apagado (não premium)',
);

check(
  'Bloco 4A: card desbloqueado tem selo de check "Desbloqueada"; bloqueado tem cadeado + texto correto',
  ux4Card.includes('unlockedSeal') &&
  ux4Card.includes('Continue a aventura para revelar.') &&
  ux4Card.includes('backLock'),
  'BeniChestCard: desbloqueado/bloqueado não são distinguíveis (selo/cadeado/texto)',
);

check(
  'Bloco 4A: Baú explica sua função em uma frase (hero)',
  ux4Screen.includes('Suas cartinhas guardam lembranças das aventuras que você viveu com Beni.'),
  'BeniChestScreen: hero não explica a função do Baú',
);

check(
  'Bloco 4A: detalhe da cartinha mostra categoria + "Como você ganhou" + ação contextual',
  ux4Screen.includes('detailCategory') &&
  ux4Screen.includes('Como você ganhou') &&
  ux4Screen.includes('function detailAction') &&
  ux4Screen.includes("navigation.navigate('StoryDetail'") &&
  ux4Screen.includes("navigation.navigate('AtelierGallery')"),
  'BeniChestScreen: detalhe sem categoria/origem rotulada/ação contextual',
);

// HOTFIX Bloco 4A — loading das imagens de Cena (nunca card quebrado)
check(
  'HOTFIX 4A: BeniChestCardImage mostra PremiumFallback até onLoad (imagem oculta antes de carregar)',
  ux4Card.includes('function BeniChestCardImage') &&
  ux4Card.includes('<PremiumFallback card={card} />') &&
  ux4Card.includes('onLoad={() => setLoaded(true)}') &&
  ux4Card.includes('onError={() => setErrored(true)}') &&
  /!loaded && styles\.imgHidden/.test(ux4Card),
  'BeniChestCard: imagem da cartinha sem gate de onLoad/fallback premium (pode parecer quebrada)',
);

check(
  'HOTFIX 4A: cartinha com imagem usa BeniChestCardImage com key estável (sem vazar load entre cards)',
  /<BeniChestCardImage/.test(ux4Card) &&
  ux4Card.includes('function sourceSignature') &&
  /key=\{`img-\$\{card\.id\}-\$\{sourceSignature\(source\)\}`\}/.test(ux4Card),
  'BeniChestCard: ramo de imagem não usa BeniChestCardImage com key estável',
);

check(
  'HOTFIX 4A: Baú pré-carrega imagens locais das cartinhas (best-effort, não trava)',
  ux4Screen.includes("from 'expo-asset'") &&
  ux4Screen.includes('Asset.fromModule(n).downloadAsync()') &&
  ux4Screen.includes("typeof s === 'number'"),
  'BeniChestScreen: sem preload best-effort das imagens locais do Baú',
);

// ── Sprint Reestruturação UX 1.0 — Bloco 4B: Cultinho familiar ───────────────
console.log('\n── Sprint UX 1.0 — Bloco 4B ──');

const ux4bData = readSrc('src/data/cultinhoData.js');
const ux4bScreen = readSrc('src/screens/CultinhoEmCasaScreen.js');

check(
  'Bloco 4B: cultinhoData expõe getCultinhoForStory + conteúdo curado + fallback seguro',
  ux4bData.includes('export function getCultinhoForStory') &&
  ux4bData.includes('CULTINHO_BY_STORY') &&
  ux4bData.includes('beniExplica') && ux4bData.includes('fraseDoDia') &&
  ux4bData.includes('pergunta') && ux4bData.includes('oracao'),
  'cultinhoData ausente ou sem estrutura (frase/explica/pergunta/oração + fallback)',
);

check(
  'Bloco 4B: cultinhoData sem backend/IA/texto livre',
  !/fetch\(|axios|expo-notifications|openai|gpt|TextInput/i.test(ux4bData),
  'cultinhoData não pode usar backend/IA/texto livre',
);

check(
  'Bloco 4B: Cultinho NÃO reabre a história como etapa (sem botão "Abrir história"); só link "Rever a história"',
  !ux4bScreen.includes('Abrir história') &&
  !ux4bScreen.includes('Abrir Ateliê') &&
  ux4bScreen.includes('Rever a história') &&
  ux4bScreen.includes('handleReviewStory'),
  'CultinhoEmCasaScreen ainda reabre a história como etapa principal',
);

check(
  'Bloco 4B: estrutura limpa (passagem → Beni explica → conversa → oração) usando cultinhoData',
  ux4bScreen.includes("from '../data/cultinhoData'") &&
  ux4bScreen.includes('getCultinhoForStory') &&
  ux4bScreen.includes('cultinho.fraseDoDia') &&
  ux4bScreen.includes('cultinho.beniExplica.map') &&
  ux4bScreen.includes('cultinho.pergunta') &&
  ux4bScreen.includes('cultinho.oracao'),
  'CultinhoEmCasaScreen não usa a estrutura/conteúdo do cultinhoData',
);

check(
  'Bloco 4B: Colorir juntos é opcional ao final, abre Ateliê from:cultinho e volta',
  ux4bScreen.includes('Colorir juntos (opcional)') &&
  ux4bScreen.includes('handleColorirJuntos') &&
  ux4bScreen.includes("navigation.navigate('AtelierFromContext', { from: 'cultinho' })"),
  'CultinhoEmCasaScreen: Colorir juntos não está opcional/contextual (from:cultinho)',
);

check(
  'Bloco 4B: finalização guarda no coração e preserva o registro (cartinha de Coração)',
  ux4bScreen.includes('Esse momento ficou guardado no coração') &&
  ux4bScreen.includes('markFamilyWorshipCompleted'),
  'CultinhoEmCasaScreen: finalização/registro do cultinho alterada indevidamente',
);

// ── Sprint Reestruturação UX 1.0 — Bloco 4C: Guardar no coração simples ──────
console.log('\n── Sprint UX 1.0 — Bloco 4C ──');

const ux4cData = readSrc('src/data/lumiReflections.js');
const ux4cScreen = readSrc('src/screens/ReflectionScreen.js');

const hfBody = (ux4cData.match(/export const HEART_FEELINGS = \[([\s\S]*?)\];/) || [])[1] || '';
const hkBody = (ux4cData.match(/export const HEART_KEEPS = \[([\s\S]*?)\];/) || [])[1] || '';
const hfCount = (hfBody.match(/label:/g) || []).length;
const hkCount = (hkBody.match(/'[^']+'/g) || []).length;

check(
  'Bloco 4C: lumiReflections expõe HEART_FEELINGS (4) e HEART_KEEPS (4)',
  hfCount === 4 && hkCount === 4 &&
  hkBody.includes('Deus cuida de mim') && hkBody.includes('Quero fazer o bem'),
  `Listas enxutas do coração incorretas (feelings=${hfCount}, keeps=${hkCount})`,
);

check(
  'Bloco 4C: Reflection usa as listas enxutas e o fluxo de 2 perguntas + feedback (não quiz)',
  ux4cScreen.includes('HEART_FEELINGS') && ux4cScreen.includes('HEART_KEEPS') &&
  ux4cScreen.includes("const STEPS = ['feeling', 'keep', 'done']") &&
  !ux4cScreen.includes('LUMI_LEARNED') && !ux4cScreen.includes('LUMI_PRAYERS') &&
  !ux4cScreen.includes('LEARNING_VERSES') && !ux4cScreen.includes('Repita com Beni'),
  'ReflectionScreen ainda usa o fluxo longo/versículo (parece quiz)',
);

check(
  'Bloco 4C: perguntas certas + propósito de lembrança (não é prova)',
  ux4cScreen.includes('Como seu coração ficou com essa história?') &&
  ux4cScreen.includes('O que você quer guardar no coração?') &&
  ux4cScreen.includes('Escolha uma lembrança para guardar com Beni.') &&
  ux4cScreen.includes('não uma prova'),
  'ReflectionScreen sem as perguntas/propósito esperados do Bloco 4C',
);

check(
  'Bloco 4C: feedback curto do Beni + botão "Guardar no coração"',
  ux4cScreen.includes('Que lindo! Beni guardou esse momento com carinho.') &&
  ux4cScreen.includes('Guardar no coração') &&
  ux4cScreen.includes('handleGuardar'),
  'ReflectionScreen sem feedback final/botão "Guardar no coração"',
);

check(
  'Bloco 4C: recompensa/progresso preservados e volta para a conclusão (goBack)',
  ux4cScreen.includes('saveReflection') && ux4cScreen.includes('addBonusStars') &&
  ux4cScreen.includes('alreadyDone') && ux4cScreen.includes('refreshProgress') &&
  /handleGuardar[\s\S]*?navigation\.goBack\(\)/.test(ux4cScreen),
  'ReflectionScreen quebrou a recompensa/registro ou o retorno à conclusão',
);

// ── Sprint Reestruturação UX 1.0 — Bloco 4D: Estrelinhas = progresso ─────────
console.log('\n── Sprint UX 1.0 — Bloco 4D ──');

const ux4dData = readSrc('src/data/achievements.js');
const ux4dScreen = readSrc('src/screens/TrophiesScreen.js');

const ux4dIdCount = (ux4dData.match(/\n\s{4}id: '/g) || []).length;
const ux4dHowCount = (ux4dData.match(/\n\s{4}how: '/g) || []).length;
const ux4dEarnedCount = (ux4dData.match(/\n\s{4}earned: '/g) || []).length;

check(
  'Bloco 4D: 4 categorias claras (Histórias, Cenas, Ateliê, Momentos com Beni)',
  ux4dData.includes("id: 'historias'") && ux4dData.includes("id: 'cenas'") &&
  ux4dData.includes("id: 'atelie'") && ux4dData.includes("id: 'momentos'") &&
  ux4dData.includes("label: 'Momentos com Beni'") &&
  !ux4dData.includes("{ id: 'jornada'"),
  'achievements.js sem as 4 categorias do Bloco 4D',
);

check(
  'Bloco 4D: conquistas de cena usam unidade "cenas" no título (sem "estrelas")',
  ux4dData.includes("title: 'Cinco cenas'") && ux4dData.includes("title: 'Cinquenta cenas'") &&
  !/title: '[^']*[Ee]strela/.test(ux4dData),
  'achievements.js ainda mistura unidade (título "estrelas" medindo cenas)',
);

check(
  'Bloco 4D: toda conquista tem how (como conquistar) e earned (como conquistou)',
  ux4dIdCount > 0 && ux4dHowCount === ux4dIdCount && ux4dEarnedCount === ux4dIdCount,
  `achievements.js: how/earned não cobrem todas as conquistas (ids=${ux4dIdCount}, how=${ux4dHowCount}, earned=${ux4dEarnedCount})`,
);

check(
  'Bloco 4D: Estrelinhas explica seu propósito e se diferencia do Baú',
  ux4dScreen.includes('Você ganha estrelinhas ao completar cenas, histórias e momentos especiais.') &&
  ux4dScreen.includes('As estrelinhas mostram seu progresso. O Baú guarda suas lembranças.'),
  'TrophiesScreen sem frase explicativa / diferenciação do Baú',
);

check(
  'Bloco 4D: detalhe mostra "COMO VOCÊ GANHOU" (concluída) ou "COMO CONQUISTAR" (bloqueada)',
  ux4dScreen.includes('COMO VOCÊ GANHOU') && ux4dScreen.includes('COMO CONQUISTAR') &&
  ux4dScreen.includes('selected.earned') && ux4dScreen.includes('selected.how') &&
  ux4dScreen.includes('achievement.how'),
  'TrophiesScreen não usa how/earned nos estados de conquista',
);

check(
  'Bloco 4D: navegação contextual preservada (volta para a conclusão)',
  ux4dScreen.includes('fromStoryCompletion') &&
  ux4dScreen.includes('backLabelFor(route?.params?.from)') &&
  /backBtn[\s\S]*?navigation\.goBack\(\)/.test(ux4dScreen),
  'TrophiesScreen quebrou o retorno contextual à conclusão',
);

// ── Sprint Reestruturação UX 1.0 — Bloco 4E: Área dos Pais organizada ────────
console.log('\n── Sprint UX 1.0 — Bloco 4E ──');

const ux4eFlags = readSrc('src/config/featureFlags.js');
const ux4eScreen = readSrc('src/screens/ParentAreaScreen.js');

check(
  'Bloco 4E: featureFlags expõe PARENTAL_CONSENT_FLOW_ENABLED = false',
  /export const PARENTAL_CONSENT_FLOW_ENABLED\s*=\s*false/.test(ux4eFlags),
  'featureFlags sem PARENTAL_CONSENT_FLOW_ENABLED=false',
);

check(
  'Bloco 4E: Área dos Pais usa seções recolhíveis (AccordionSection)',
  ux4eScreen.includes('function AccordionSection') &&
  /<AccordionSection/.test(ux4eScreen),
  'ParentAreaScreen não usa seções recolhíveis',
);

check(
  'Bloco 4E: apenas "Resumo da criança" abre por padrão (único defaultOpen)',
  /<AccordionSection title="Resumo da criança" defaultOpen>/.test(ux4eScreen) &&
  (ux4eScreen.match(/<AccordionSection[^>]*\sdefaultOpen/g) || []).length === 1,
  'Mais de uma seção abre por padrão (ou Resumo não é a aberta)',
);

check(
  'Bloco 4E: Segurança e privacidade resumida (mensagem principal curta)',
  ux4eScreen.includes('Este app salva apenas dados locais neste aparelho. Nada é enviado automaticamente para a internet.'),
  'ParentAreaScreen sem a mensagem-resumo de privacidade',
);

check(
  'Bloco 4E: consentimento decorativo atrás de flag, com texto informativo',
  ux4eScreen.includes('PARENTAL_CONSENT_FLOW_ENABLED') &&
  ux4eScreen.includes('Quando houver recursos de compartilhamento ou envio externo, o responsável será avisado antes.') &&
  // o fluxo de registrar/revogar só renderiza quando a flag está ligada
  /PARENTAL_CONSENT_FLOW_ENABLED \?[\s\S]*?Registrar consentimento/.test(ux4eScreen),
  'ParentAreaScreen ainda mostra o consentimento formal como ação principal',
);

check(
  'Bloco 4E: Modo Igreja discreto (texto provisório, recolhido, no fim)',
  ux4eScreen.includes('Recurso em preparação para turmas, professores e encontros infantis.') &&
  /<AccordionSection\s+title="⛪ Modo Igreja"/.test(ux4eScreen) &&
  ux4eScreen.indexOf('Sobre e suporte') < ux4eScreen.indexOf('⛪ Modo Igreja'),
  'ParentAreaScreen: Modo Igreja não está discreto/no fim',
);

check(
  'Bloco 4E: Gerenciar dados mantém confirmação (APAGAR) e ações sensíveis',
  ux4eScreen.includes('Gerenciar dados') &&
  ux4eScreen.includes('Limpar progresso') &&
  (ux4eScreen.includes("'APAGAR'") || ux4eScreen.includes('"APAGAR"')) &&
  ux4eScreen.includes('resetProgress'),
  'ParentAreaScreen: Gerenciar dados perdeu confirmação/ações sensíveis',
);

// ── Sprint Reestruturação UX 1.0 — Bloco 5: AudioManager + preferências ──────
console.log('\n── Sprint UX 1.0 — Bloco 5 ──');

const ux5Mgr = readSrc('src/services/audioManager.js');
const ux5SoundBtn = readSrc('src/components/SoundButton.js');
const ux5Player = readSrc('src/components/AudioPlayer.js');
const ux5Canvas = readSrc('src/screens/AtelierCanvasScreen.js');
const ux5Coloring = readSrc('src/screens/ColoringScreen.js');
const ux5Parent = readSrc('src/screens/ParentAreaScreen.js');

check(
  'Bloco 5: AudioManager central expõe a API de áudio',
  ux5Mgr.includes('export function playUiSound') &&
  ux5Mgr.includes('export async function playMusic') &&
  ux5Mgr.includes('export function stopMusic') &&
  ux5Mgr.includes('export function pauseMusic') &&
  ux5Mgr.includes('export function resumeMusic') &&
  ux5Mgr.includes('export async function setSoundsEnabled') &&
  ux5Mgr.includes('export async function setMusicEnabled') &&
  ux5Mgr.includes('export function getAudioPreferences') &&
  ux5Mgr.includes('export function onNarrationStart') &&
  ux5Mgr.includes('export function onNarrationEnd'),
  'audioManager não expõe a API central completa',
);

check(
  'Bloco 5: preferências locais em chave nova, sons on / música off por padrão',
  ux5Mgr.includes("'@ptf_audio_prefs_v1'") &&
  /DEFAULT_PREFS\s*=\s*\{\s*soundsEnabled:\s*true,\s*musicEnabled:\s*false/.test(ux5Mgr) &&
  ux5Mgr.includes('AsyncStorage'),
  'audioManager sem preferências persistidas com os padrões corretos',
);

check(
  'Bloco 5: sem trilha externa/protegida — música é infraestrutura (MUSIC_TRACK null)',
  /const MUSIC_TRACK\s*=\s*null/.test(ux5Mgr) &&
  !/https?:\/\//.test(ux5Mgr),
  'audioManager não deve buscar música externa nem prometer trilha final',
);

check(
  'Bloco 5: SoundButton delega ao manager e suporta silent (ações repetitivas)',
  ux5SoundBtn.includes('playUiSound') &&
  ux5SoundBtn.includes('silent') &&
  /if \(!silent\) playUiSound/.test(ux5SoundBtn),
  'SoundButton não delega ao AudioManager / não suporta silent',
);

check(
  'Bloco 5: narração nunca sobrepõe música (AudioPlayer chama onNarrationStart/End)',
  ux5Player.includes('onNarrationStart') && ux5Player.includes('onNarrationEnd') &&
  ux5Player.includes("appStatus === 'playing') onNarrationStart()") &&
  ux5Player.includes('onNarrationEnd();'),
  'AudioPlayer não coordena a música com a narração',
);

check(
  'Bloco 5: sons de clique não tocam em ações repetitivas do Ateliê/Colorir (silent)',
  (ux5Canvas.match(/\bsilent\b/g) || []).length >= 4 &&
  ux5Coloring.includes('silent'),
  'Botões repetitivos do Ateliê/Colorir ainda tocam som',
);

check(
  'Bloco 5: Área dos Pais tem toggles de Sons de botões e Música de fundo (accordion fechado)',
  ux5Parent.includes('Sons e música') &&
  ux5Parent.includes('Sons de botões') &&
  ux5Parent.includes('Música de fundo') &&
  ux5Parent.includes('handleToggleSounds') && ux5Parent.includes('handleToggleMusic') &&
  ux5Parent.includes('setSoundsEnabled') && ux5Parent.includes('setMusicEnabled') &&
  !/<AccordionSection\s+title="Sons e música" defaultOpen/.test(ux5Parent),
  'ParentAreaScreen sem os toggles de áudio na seção recolhível',
);

// ── Hotfix H1 — Ateliê canvas clipping (painel com altura reservada) ─────────
console.log('\n── Hotfix H1: Ateliê canvas clipping ──');

const h1Atelier = readSrc('src/screens/AtelierCanvasScreen.js');

check(
  'H1: painel inferior tem altura RESERVADA fixa (não cresce com a aba/Borracha)',
  /const PANEL_CONTENT_H\s*=\s*\d+/.test(h1Atelier) &&
  /panelContent:\s*\{\s*height:\s*PANEL_CONTENT_H\s*\}/.test(h1Atelier) &&
  !/panelContent:\s*\{[^}]*minHeight/.test(h1Atelier),
  'AtelierCanvasScreen: painelContent não usa altura reservada fixa (canvas pode encolher de novo)',
);

check(
  'H1: conteúdo do painel rola por dentro, sem empurrar o canvas (panelScroll)',
  h1Atelier.includes('panelScroll') &&
  /style=\{styles\.panelScroll\}/.test(h1Atelier),
  'AtelierCanvasScreen: painel não rola internamente — conteúdo alto pode comprimir o canvas',
);

check(
  'H1: área do canvas permanece estável (canvasOuter flex:1), sem mexer no motor',
  /canvasOuter:\s*\{\s*\n?\s*flex:\s*1/.test(h1Atelier),
  'AtelierCanvasScreen: canvasOuter perdeu o flex estável da área do canvas',
);

check(
  'H1.1: painel compactado (PANEL_CONTENT_H <= 160) — devolve área de canvas',
  (() => { const m = h1Atelier.match(/const PANEL_CONTENT_H\s*=\s*(\d+)/); return !!m && Number(m[1]) <= 160; })(),
  'AtelierCanvasScreen: painel não foi compactado (PANEL_CONTENT_H > 160)',
);

check(
  'H1.1: tamanhos da borracha sem rolagem (dica não rouba altura no modo borracha)',
  !h1Atelier.includes('Passe por cima para apagar') &&
  /activeTool === 'borracha'[\s\S]{0,400}styles\.sizeRow/.test(h1Atelier),
  'AtelierCanvasScreen: modo borracha ainda usa a dica que rouba altura / tamanhos podem exigir rolagem',
);

// ════════════════════════════════════════════════════════════════════════════
// Sprint Estabilização A — Bloco A1: testes que pegam mentira
// Validação COMPORTAMENTAL/ESTRUTURAL (disco real, parse, round-trip em sandbox,
// rotas), reduzindo a dependência de checks que só confirmam que uma string
// existe. Onde resta inspeção textual, o relatório explica por que é aceitável.
// ════════════════════════════════════════════════════════════════════════════
console.log('\n── Sprint A1: testes que pegam mentira ──');

// ── Helpers locais (fs/path/root já existem no topo do arquivo) ──────────────
function a1StripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}
function a1ExtractRequires(src) {
  const out = [];
  const re = /require\(\s*['"]([^'"]+)['"]\s*\)/g; let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}
function a1AbsFromRequire(fileRelDir, requirePath) {
  return path.join(root, fileRelDir, requirePath);
}
function a1ParseStoryMap(src, marker) {
  const noC = a1StripComments(src);
  const idx = noC.indexOf(marker);
  const body = idx >= 0 ? noC.slice(idx) : noC;
  const map = {};
  const re = /([A-Za-z_]\w*):\s*\{([\s\S]*?)\n\s*\},?/g; let m;
  while ((m = re.exec(body))) {
    const reqs = [...m[2].matchAll(/(\d+):\s*require\(\s*['"]([^'"]+)['"]/g)]
      .map(x => ({ n: Number(x[1]), p: x[2] }));
    if (reqs.length) map[m[1]] = reqs;
  }
  return map;
}
// Avalia um módulo ESM simples em sandbox: remove imports, converte exports e
// injeta dependências (ex.: AsyncStorage mock). Permite ROUND-TRIP real do código.
function a1LoadSandbox(relPath, deps, returnNames) {
  let code = readSrc(relPath)
    .replace(/^\s*import\s.*$/gm, '')                     // remove imports (1 linha)
    .replace(/export\s+default\s+/g, 'const __default = ')
    .replace(/export\s+(async\s+function|function|const|let|var)\s+/g, '$1 ');
  code += `\nreturn { ${returnNames.join(', ')} };`;
  const names = Object.keys(deps);
  // eslint-disable-next-line no-new-func
  const fn = new Function(...names, code);
  return fn(...names.map(n => deps[n]));
}
function a1MockAsyncStorage() {
  const store = new Map();
  return {
    store,
    api: {
      setItem: (k, v) => { store.set(k, String(v)); return Promise.resolve(); },
      getItem: (k) => Promise.resolve(store.has(k) ? store.get(k) : null),
      removeItem: (k) => { store.delete(k); return Promise.resolve(); },
      multiRemove: (ks) => { (ks || []).forEach(k => store.delete(k)); return Promise.resolve(); },
      getAllKeys: () => Promise.resolve([...store.keys()]),
    },
  };
}

// ── A1.1 Integridade de mídia: todo require de manifest existe no disco ───────
const a1SceneSrc   = readSrc('src/data/storySceneIllustrations.js');
const a1ColorSrc   = readSrc('src/assets/coloringImages.js');
const a1AudioSrc   = readSrc('src/data/audioManifest.js');
const a1CoversSrc  = readSrc('src/assets/storyCovers.js');

function a1CheckRequiresExist(label, src, fileRelDir) {
  const reqs = a1ExtractRequires(a1StripComments(src)).filter(r => r.includes('assets/'));
  const missing = reqs.filter(r => !fs.existsSync(a1AbsFromRequire(fileRelDir, r)));
  check(label, reqs.length > 0 && missing.length === 0,
    missing.length ? `arquivo(s) inexistente(s): ${missing.slice(0, 4).join(', ')}${missing.length > 4 ? ' …' : ''}`
                   : 'nenhum require de mídia encontrado');
}
a1CheckRequiresExist('A1 mídia: cenas ilustrativas — todo require aponta para arquivo existente', a1SceneSrc, 'src/data');
a1CheckRequiresExist('A1 mídia: imagens de colorir — todo require aponta para arquivo existente', a1ColorSrc, 'src/assets');
a1CheckRequiresExist('A1 mídia: áudios manifestados — todo require aponta para arquivo existente', a1AudioSrc, 'src/data');
a1CheckRequiresExist('A1 mídia: capas — todo require aponta para arquivo existente', a1CoversSrc, 'src/assets');

// ── A1.2 Paridade manifest × disco ───────────────────────────────────────────
// Cenas: numeração contígua 1..N por história (pega cena faltando/duplicada).
{
  const scn = a1ParseStoryMap(a1SceneSrc, 'STORY_SCENE_ILLUSTRATIONS = {');
  let ok = true, detail = '';
  for (const id of Object.keys(scn)) {
    const nums = scn[id].map(x => x.n).sort((a, b) => a - b);
    const contiguous = nums.length > 0 && nums.every((n, i) => n === i + 1);
    if (!contiguous) { ok = false; detail += `${id}: [${nums.join(',')}]; `; }
  }
  check('A1 paridade: cenas ilustrativas — numeração contígua 1..N por história', ok, detail);
}
// Colorir: contagem do manifest === .png na pasta /colorir referenciada.
{
  const col = a1ParseStoryMap(a1ColorSrc, 'const coloringImages = {');
  let ok = true, detail = '';
  for (const id of Object.keys(col)) {
    const reqs = col[id];
    // Aceita a pasta legada 'colorir' e a nova 'coloring' (creation, teste 16:9).
    const fm = reqs[0].p.match(/assets\/stories\/([^/]+)\/(colorir|coloring)\//);
    const folder = fm ? fm[1] : id;
    const subdir = fm ? fm[2] : 'colorir';
    const dir = path.join(root, 'assets/stories', folder, subdir);
    const disk = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.png')).length : 0;
    if (reqs.length !== disk) { ok = false; detail += `${id}: manifest ${reqs.length} ≠ disco ${disk}; `; }
  }
  check('A1 paridade: colorir — contagem do manifest === arquivos .png no disco', ok, detail);
}
// Áudio: contagem de entradas ready por história === .mp3 no disco.
{
  const ready = [...a1StripComments(a1AudioSrc)
    .matchAll(/storyId:\s*'([^']+)',\s*sceneKey:\s*'[^']+',\s*audioAsset:\s*require/g)].map(m => m[1]);
  const counts = {}; ready.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  let ok = true, detail = '';
  for (const id of Object.keys(counts)) {
    const dir = path.join(root, 'assets/audio', id);
    const disk = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.mp3')).length : 0;
    if (counts[id] !== disk) { ok = false; detail += `${id}: manifest ${counts[id]} ≠ disco ${disk}; `; }
  }
  check('A1 paridade: áudio — contagem ready do manifest === .mp3 no disco', ok && ready.length > 0,
    ready.length ? detail : 'nenhum áudio manifestado');
}

// ── A1.3 Rotas existentes: todo navigate('X') aponta para rota registrada ─────
{
  const navSrc = readSrc('src/navigation/AppNavigator.js');
  const stackRoutes = new Set([...navSrc.matchAll(/name="(\w+)"/g)].map(m => m[1]));
  const tabBlock = (navSrc.match(/const TAB_DEFS\s*=\s*\[([\s\S]*?)\];/) || [])[1] || '';
  const tabNames = new Set([...tabBlock.matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]));
  const known = new Set([...stackRoutes, ...tabNames]);
  // walk de todos os .js de src
  const files = [];
  (function rec(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) rec(p);
      else if (e.name.endsWith('.js')) files.push(p);
    }
  })(path.join(root, 'src'));
  const targets = new Map();
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(/navigate\(\s*['"]([A-Za-z]\w*)['"]/g)) {
      if (!targets.has(m[1])) targets.set(m[1], path.relative(root, f).replace(/\\/g, '/'));
    }
  }
  const broken = [...targets.keys()].filter(r => !known.has(r));
  check('A1 rotas: todo navigate(\'X\') aponta para uma rota registrada (Stack ou tab)',
    targets.size > 0 && broken.length === 0,
    broken.length ? `rota(s) não registrada(s): ${broken.map(r => `${r} ← ${targets.get(r)}`).join('; ')}` : '');
}

// ── A1.4 Round-trip de AsyncStorage (execução real em sandbox) ────────────────
// storageKeys — chaves estáveis (pega mudança de formato que quebraria dados).
try {
  const sk = a1LoadSandbox('src/services/storageKeys.js', {}, ['STORAGE_KEYS', 'storageKey', 'APP_STORAGE_SCHEMA_VERSION']);
  check('A1 storage: storageKeys gera chaves estáveis (progress/drawing/quiz/reflection/storybook)',
    sk.storageKey.progress('noah') === '@ptf_progress_noah' &&
    sk.storageKey.drawing('noah', 3) === '@ptf_drawing_snoah_c3' &&
    sk.storageKey.quizDone('noah') === '@ptf_quiz_done_noah' &&
    sk.storageKey.reflection('noah') === '@ptf_reflection_noah' &&
    sk.storageKey.storyBookOpened('noah') === '@ptf_storybook_opened_noah' &&
    typeof sk.APP_STORAGE_SCHEMA_VERSION === 'number',
    'storageKeys mudou o formato das chaves — risco de perder dados já salvos');
} catch (e) {
  check('A1 storage: storageKeys avaliável e estável', false, String(e && e.message));
}
// drawingStorage — hasMeaningfulPaint é puro/síncrono (v1/v2/v3). O round-trip de
// GRAVAÇÃO virou assíncrono em A5 (escreve o blob em arquivo antes do setItem) e
// roda no bloco assíncrono, junto dos testes A5, antes do resumo.
try {
  const ds = a1LoadSandbox('src/services/drawingStorage.js',
    { AsyncStorage: a1MockAsyncStorage().api, log: () => {},
      writeBlob: () => null, readBlobAsDataUrl: () => null, deleteBlob: () => {},
      safeName: (s) => String(s),
      isDataUrl: (s) => typeof s === 'string' && s.startsWith('data:'),
      dataUrlMime: () => 'image/png' },
    ['hasMeaningfulPaint']);
  const url = 'data:image/png;base64,' + 'A'.repeat(2000);
  const ptr = '{"v":3,"fmt":1,"uri":"file:///x.png","mime":"image/png"}';
  const meaningful = ds.hasMeaningfulPaint(url) === true &&
                     ds.hasMeaningfulPaint(ptr) === true &&
                     ds.hasMeaningfulPaint('data:image/png;base64,AAAA') === false &&
                     ds.hasMeaningfulPaint(null) === false;
  check('A1 storage: drawingStorage.hasMeaningfulPaint reconhece v1/v3 (tinta real), rejeita branco/null',
    meaningful, `meaningful=${meaningful}`);
} catch (e) {
  check('A1 storage: drawingStorage hasMeaningfulPaint', false, String(e && e.message));
}

// ── A1.5 Whitelist de reset (execução real) — NÃO apaga desenhos/artes ────────
// (O round-trip que EXECUTA resetProgress virou assíncrono em A3 — resetProgress
//  agora usa getAllKeys — e roda no bloco assíncrono antes do resumo.)
try {
  const stories = [{ id: 'creation' }, { id: 'noah' }, { id: 'david_goliath' }];
  const pr = a1LoadSandbox('src/services/progressResetService.js',
    { AsyncStorage: a1MockAsyncStorage().api, stories }, ['getResettableKeys']);
  const wl = pr.getResettableKeys();
  const coversProgress = ['@ptf_progress_noah', '@ptf_quiz_done_noah', '@ptf_reflection_noah',
    '@ptf_storybook_opened_noah', '@ptf_bonus_stars', '@ptf_achievements_seen', '@ptf_lumi_moment_ever',
    '@ptf_beni_chest_seen_cards_v1', '@ptf_family_worship_v1']
    .every(k => wl.includes(k));
  // A Galeria do Ateliê (ptf_atelier_arts_*) NUNCA entra no reset. O vínculo de
  // colorir por cena (@ptf_drawing_*) é limpo dinamicamente por prefixo (não pela
  // whitelist estática), então também não deve aparecer na whitelist estática.
  const preservesGallery = !wl.some(k => k.startsWith('ptf_atelier_arts'));
  // Colorir por cena é limpo delegando a clearAllSavedDrawings (remove chaves
  // @ptf_drawing_* + arquivos de blob). A Galeria (ptf_atelier_arts_*) é preservada.
  const drawingClearedViaCanonical = readSrc('src/services/progressResetService.js').includes('clearAllSavedDrawings(');
  check('A1 reset: whitelist cobre progresso + Baú + Cultinho; preserva Galeria; limpa colorir (clearAllSavedDrawings)',
    coversProgress && preservesGallery && drawingClearedViaCanonical,
    `coversProgress=${coversProgress} preservesGallery=${preservesGallery} drawingCleared=${drawingClearedViaCanonical}`);
} catch (e) {
  check('A1 reset: progressResetService whitelist', false, String(e && e.message));
}

// ── A1.6 Preferências de áudio (execução real) + supressão de som ─────────────
try {
  const { store, api } = a1MockAsyncStorage();
  let playerCreates = 0;
  const createAudioPlayer = () => { playerCreates++; return { play() {}, pause() {}, seekTo() {}, volume: 0, loop: false }; };
  const setAudioModeAsync = () => Promise.resolve();
  const am = a1LoadSandbox('src/services/audioManager.js',
    { AsyncStorage: api, createAudioPlayer, setAudioModeAsync, require: () => 1 },
    ['getAudioPreferences', 'setSoundsEnabled', 'setMusicEnabled', 'playUiSound']);
  am.setSoundsEnabled(false);
  const offPersisted = (store.get('@ptf_audio_prefs_v1') || '').includes('"soundsEnabled":false');
  const offRead = am.getAudioPreferences().soundsEnabled === false;
  playerCreates = 0; am.playUiSound('tap');
  const mutedNoSound = playerCreates === 0;            // som desligado → não toca
  am.setSoundsEnabled(true);
  playerCreates = 0; am.playUiSound('tap');
  const onPlaysSound = playerCreates === 1;            // som ligado → toca
  am.setMusicEnabled(true);
  const musicPersisted = (store.get('@ptf_audio_prefs_v1') || '').includes('"musicEnabled":true') &&
                         am.getAudioPreferences().musicEnabled === true;
  check('A1 áudio: preferências de sons/música persistem e são lidas corretamente',
    offPersisted && offRead && musicPersisted, `offPersisted=${offPersisted} offRead=${offRead} musicPersisted=${musicPersisted}`);
  check('A1 áudio: desligar sons silencia (playUiSound não cria player); ligar reativa',
    mutedNoSound && onPlaysSound, `mutedNoSound=${mutedNoSound} onPlaysSound=${onPlaysSound}`);
} catch (e) {
  check('A1 áudio: audioManager round-trip', false, String(e && e.message));
}
// Ligação SoundButton → playUiSound só quando !silent. SoundButton é componente
// React Native (não executável em Node), então a regra "silent suprime o som" é
// validada de forma ESTRUTURAL aqui e COMPORTAMENTAL no manager (acima).
{
  const sb = readSrc('src/components/SoundButton.js');
  check('A1 áudio: SoundButton só dispara som quando !silent (estrutural — componente RN)',
    sb.includes('playUiSound') && /if \(!silent\)\s*playUiSound/.test(sb),
    'SoundButton não condiciona o som à prop silent');
}

// ════════════════════════════════════════════════════════════════════════════
// Sprint Estabilização A — Bloco A3: navegação e storage leve
// ════════════════════════════════════════════════════════════════════════════
console.log('\n── Sprint A3: navegação e storage leve ──');

const a3StoryBook = readSrc('src/screens/StoryBookScreen.js');
const a3Cultinho  = readSrc('src/screens/CultinhoEmCasaScreen.js');
const a3Atelier   = readSrc('src/screens/AtelierScreen.js');
const a3Reset     = readSrc('src/services/progressResetService.js');

// Item 1 — Livrinho "Voltar para Aventuras" usa a TAB, não empilha StoriesScreen.
check(
  'A3 Livrinho: "Voltar para Aventuras" usa a tab (navigate Home/Aventuras), sem navigate(\'Stories\')',
  /Voltar para Aventuras/.test(a3StoryBook) &&
  a3StoryBook.includes("navigate('Home', { screen: 'Aventuras' })") &&
  !a3StoryBook.includes("navigate('Stories')"),
  'StoryBookScreen ainda empilha StoriesScreen em vez de voltar pela tab Aventuras',
);

// Item 5 — "Colorir juntos" do Cultinho abre AtelierFromContext from:cultinho e
// a tela do Ateliê volta por goBack() (canGoBack) → retorna ao Cultinho, não Home.
check(
  'A3 Cultinho: "Colorir juntos" → AtelierFromContext from:cultinho e back via goBack (volta ao Cultinho)',
  a3Cultinho.includes("navigation.navigate('AtelierFromContext', { from: 'cultinho' })") &&
  /navigation\.canGoBack\(\)\s*\?\s*navigation\.goBack\(\)/.test(a3Atelier),
  'O retorno do "Colorir juntos" ao Cultinho não está garantido por goBack',
);

// Itens 2/3 — reset limpa as chaves diárias do Momento (prefixo) + Baú + Cultinho.
check(
  'A3 reset: limpeza dinâmica das chaves diárias do Momento (getAllKeys + prefixo) + Baú/Cultinho na whitelist',
  a3Reset.includes('getAllKeys') &&
  /startsWith\(LUMI_MOMENT_PREFIX\)/.test(a3Reset) &&
  a3Reset.includes("'@ptf_beni_chest_seen_cards_v1'") &&
  a3Reset.includes("'@ptf_family_worship_v1'"),
  'progressResetService não limpa Momentos diários por prefixo / não inclui Baú+Cultinho',
);

// ════════════════════════════════════════════════════════════════════════════
// Sprint Estabilização A — Bloco A4: virtualização de listas
// ════════════════════════════════════════════════════════════════════════════
console.log('\n── Sprint A4: virtualização de listas ──');

const a4Gallery   = readSrc('src/screens/AtelierGalleryScreen.js');
const a4Chest     = readSrc('src/screens/BeniChestScreen.js');
const a4Album     = readSrc('src/screens/TrophiesScreen.js');
const a4StoryCard = readSrc('src/components/StoryCard.js');

check(
  'A4 Galeria: virtualizada com FlatList (sem arts.map em ScrollView) e preserva abrir/apagar arte',
  a4Gallery.includes('FlatList') && a4Gallery.includes('renderItem') &&
  !a4Gallery.includes('arts.map(') &&
  a4Gallery.includes('handleViewArt') && a4Gallery.includes('handleDelete'),
  'AtelierGalleryScreen não foi virtualizada ou perdeu as ações de arte',
);

check(
  'A4 Baú: virtualizado com FlatList numColumns={2} (sem sections.map renderizando a grade)',
  a4Chest.includes('FlatList') && a4Chest.includes('numColumns={2}') &&
  a4Chest.includes('renderItem') &&
  !a4Chest.includes('sections.map(sec'),
  'BeniChestScreen não foi virtualizado como grade 2-col',
);

check(
  'A4 Álbum: virtualizado com SectionList por categoria (renderSectionHeader + sections={albumSections})',
  a4Album.includes('SectionList') && a4Album.includes('renderSectionHeader') &&
  a4Album.includes('sections={albumSections}'),
  'TrophiesScreen não virou SectionList por categoria',
);

check(
  'A4 capas: StoryCard (Aventuras) usa Image original nas capas aprovadas — sem SafeImage',
  a4StoryCard.includes('<Image source={coverImg}') && !a4StoryCard.includes('SafeImage'),
  'StoryCard passou a usar SafeImage nas capas aprovadas — proibido',
);

// ── Hotfix H2 — borracha não exporta como preto + modal "Arte guardada" ──────
console.log('\n── Hotfix H2: borracha export + modal ──');

const h2Canvas = readSrc('src/components/AtelierCanvas.js');
const h2Screen = readSrc('src/screens/AtelierCanvasScreen.js');

check(
  'H2: export achata a borracha contra o fundo (preview/thumb de canvas opaco, não de C)',
  h2Canvas.includes('fctx.fillStyle=bgColor') &&
  h2Canvas.includes('fctx.drawImage(C,0,0)') &&
  h2Canvas.includes('previewData=flat.toDataURL') &&
  /drawImage\(flat,0,0,tw,th\)/.test(h2Canvas) &&
  !h2Canvas.includes('previewData=C.toDataURL'),
  'AtelierCanvas exporta o preview/thumb direto de C — borracha transparente vira preta no JPEG',
);

check(
  'H2: borracha continua apagando no render ao vivo (destination-out), nunca tinta preta source-over',
  h2Canvas.includes("s.eraser?'destination-out':'source-over'"),
  'AtelierCanvas mudou o composite da borracha no render ao vivo',
);

check(
  'H2: stateJson preserva strokes/stamps/bgColor (edição futura intacta)',
  h2Canvas.includes('JSON.stringify({v:2,strokes:strokes,stamps:stamps,bgColor:bgColor})'),
  'AtelierCanvas alterou o stateJson — edição futura pode quebrar',
);

check(
  'H2: modal "Arte guardada" empilha os botões secundários (sem aperto lado a lado)',
  h2Screen.includes('Ver minhas artes') &&
  !/rewardBtnRow:\s*\{\s*flexDirection:\s*'row'/.test(h2Screen) &&
  !/rewardBtnSecondary:\s*\{\s*flex:\s*1/.test(h2Screen),
  'Modal de sucesso ainda aperta os botões secundários lado a lado (flex:1 em row)',
);

// ════════════════════════════════════════════════════════════════════════════
// Sprint Estabilização A — Bloco A5: migração de blobs base64 → FileSystem
// Checks ESTRUTURAIS aqui; o round-trip COMPORTAMENTAL (com fileBlobStore mockado)
// roda no bloco assíncrono, antes do resumo. A confirmação final em FileSystem
// nativo fica para a Sprint C (Development Build).
// ════════════════════════════════════════════════════════════════════════════
console.log('\n── Sprint A5: migração de blobs base64 → FileSystem ──');

const a5Pkg          = JSON.parse(readSrc('package.json'));
const a5BlobStore    = readSrc('src/services/fileBlobStore.js');
const a5Atelier      = readSrc('src/services/atelierStorage.js');
const a5Drawing      = readSrc('src/services/drawingStorage.js');
const a5Migration    = readSrc('src/services/storageMigrationService.js');
const a5Keys         = readSrc('src/services/storageKeys.js');

check(
  'A5: expo-file-system instalado (dependência) e usado via entrypoint legacy estável',
  !!(a5Pkg.dependencies && a5Pkg.dependencies['expo-file-system']) &&
  a5BlobStore.includes("from 'expo-file-system/legacy'"),
  'expo-file-system ausente do package.json ou fileBlobStore não usa o entrypoint legacy',
);

check(
  'A5: fileBlobStore grava base64 como bytes (EncodingType.Base64) e confirma com getInfoAsync antes de retornar',
  a5BlobStore.includes('EncodingType.Base64') &&
  a5BlobStore.includes('writeAsStringAsync') &&
  /getInfoAsync[\s\S]{0,120}info\.exists/.test(a5BlobStore) &&
  a5BlobStore.includes('export async function writeBlob'),
  'fileBlobStore não confirma a escrita do arquivo antes de descartar o base64',
);

check(
  'A5: nomes de arquivo derivam de IDs internos sanitizados (safeName), nunca de texto livre',
  /safeName\(id\)\s*\{[\s\S]{0,80}replace\(\/\[\^A-Za-z0-9_-\]/.test(a5BlobStore) &&
  a5Atelier.includes('safeName(id)') && a5Drawing.includes('safeName('),
  'fileBlobStore.safeName ausente ou serviços não derivam nome de arquivo de id interno',
);

check(
  'A5 atelier: saveArt grava blobs em arquivo (writeBlob) e guarda ponteiro previewUri + fallback inline',
  a5Atelier.includes("from './fileBlobStore'") &&
  a5Atelier.includes('writeBlob(BLOB_SUBDIR') &&
  a5Atelier.includes('previewUri,') &&
  a5Atelier.includes('previewBase64: previewUri ? null :') &&
  a5Atelier.includes('thumbnailBase64: thumbnailUri ? null :'),
  'atelierStorage.saveArt não move blobs para arquivo / não mantém fallback inline',
);

check(
  'A5 atelier: deleteArt apaga os arquivos locais antes de remover o metadado (sem órfãos)',
  /deleteBlob\(full\.previewUri\)[\s\S]{0,400}deleteBlob\(meta\.thumbnailUri\)/.test(a5Atelier) &&
  a5Atelier.includes('export async function migrateArtsToFiles'),
  'atelierStorage.deleteArt não apaga os arquivos locais / migrateArtsToFiles ausente',
);

check(
  'A5 atelier: migração idempotente (pula itens com uri) e não apaga base64 sem confirmar arquivo',
  /thumbnailBase64 && !meta\.thumbnailUri/.test(a5Atelier) &&
  /previewBase64 && !full\.previewUri/.test(a5Atelier),
  'migrateArtsToFiles não tem guarda de idempotência (uri já presente)',
);

check(
  'A5 drawing: ponteiro v3 preserva layout (W/H/imgX...) e move só o blob; getSavedDrawing resolve p/ v1/v2',
  a5Drawing.includes("from './fileBlobStore'") &&
  a5Drawing.includes('v: POINTER_VERSION') &&
  a5Drawing.includes('Object.assign(ptr, layout)') &&
  a5Drawing.includes('async function resolvePointer') &&
  a5Drawing.includes('export async function migrateDrawingsToFiles'),
  'drawingStorage não preserva layout no ponteiro ou não resolve o formato antigo',
);

check(
  'A5 drawing: fallback de leitura do formato antigo (retorna raw quando não é ponteiro v3)',
  /if \(isDrawingPointer\(raw\)\)[\s\S]{0,160}return raw;/.test(a5Drawing),
  'getSavedDrawing não faz fallback do formato antigo',
);

check(
  'A5 migração: migrateToV2 registrada no runner + schema bump p/ 2, escopo só atelier+drawings',
  a5Migration.includes('export async function migrateToV2') &&
  a5Migration.includes('{ version: 2, run: migrateToV2 }') &&
  a5Migration.includes('migrateArtsToFiles') &&
  a5Migration.includes('migrateDrawingsToFiles') &&
  a5Keys.includes('APP_STORAGE_SCHEMA_VERSION = 2'),
  'migrateToV2 não está registrada / schema não foi para 2',
);

check(
  'A5: nenhum AsyncStorage.clear nos serviços novos/alterados (preserva dados — só whitelist/multiRemove)',
  !a5BlobStore.includes('AsyncStorage.clear') &&
  !a5Atelier.includes('AsyncStorage.clear') &&
  !a5Drawing.includes('AsyncStorage.clear') &&
  !a5Migration.includes('AsyncStorage.clear'),
  'Algum serviço A5 usa AsyncStorage.clear — proibido',
);

// ════════════════════════════════════════════════════════════════════════════
// Sprint Estabilização A — Bloco A6: plano e conquistas
// Estrutural aqui; o comportamental (accessControl free + invariante de conquista)
// roda no bloco assíncrono. Decisões: Guardar no coração e Momento com Beni são
// GRÁTIS no MVP; "Primeira aventura" nunca fica atrás de uma conquista específica.
// ════════════════════════════════════════════════════════════════════════════
console.log('\n── Sprint A6: plano e conquistas ──');

const a6PlanCfg   = readSrc('src/data/planConfig.js');
const a6AchSvc    = readSrc('src/services/achievementService.js');
const a6AchData   = readSrc('src/data/achievements.js');
const a6Qa        = readSrc('src/services/creatorQaMode.js');

check(
  'A6 copy: "Guardar no coração" e "Momento com Beni" estão no FREE_PLAN e NÃO no PREMIUM_PLAN',
  (() => {
    const freeBlock = a6PlanCfg.slice(a6PlanCfg.indexOf('FREE_PLAN'), a6PlanCfg.indexOf('PREMIUM_PLAN'));
    const premBlock = a6PlanCfg.slice(a6PlanCfg.indexOf('PREMIUM_PLAN'), a6PlanCfg.indexOf('PLAN_PRICING'));
    return freeBlock.includes('Guardar no coração') && freeBlock.includes('Momento com Beni') &&
           !premBlock.includes('Guardar no coração') && !premBlock.includes('Momento com Beni');
  })(),
  'planConfig ainda vende Guardar no coração / Momento com Beni como exclusivos do Plano Família',
);

check(
  'A6 conquistas: buildCtx deriva anyStoryComplete das flags de história e o retorna',
  /const anyStoryComplete =[\s\S]{0,260}creationComplete[\s\S]{0,200}allStoriesComplete/.test(a6AchSvc) &&
  /return \{[\s\S]*anyStoryComplete,[\s\S]*\}/.test(a6AchSvc),
  'achievementService não computa/retorna anyStoryComplete',
);

check(
  'A6 conquistas: first_story ("Primeira aventura") considera anyStoryComplete (não só completedStories)',
  /id: 'first_story'[\s\S]{0,800}check: ctx => cnt\(ctx, 'completedStories'\) >= 1 \|\| flag\(ctx, 'anyStoryComplete'\)/.test(a6AchData),
  'first_story.check não usa anyStoryComplete — risco de inconsistência com conquistas específicas',
);

check(
  'A6 conta limpa: Modo Criador (QA) não fabrica progresso/desenhos/artes (só flag de permissão)',
  !a6Qa.includes('@ptf_progress') && !a6Qa.includes('@ptf_drawing') && !a6Qa.includes('ptf_atelier'),
  'creatorQaMode escreve dados de progresso — poderia herdar conquista indevida em conta limpa',
);

// ════════════════════════════════════════════════════════════════════════════
// Sprint B — Bloco B1: mediaReady e histórias "Em breve"
// Estrutural + paridade de manifesto aqui; o comportamental (derivação + gate)
// roda no bloco assíncrono. Regra: história sem mídia suficiente → "Em breve",
// não abre o player vazio, e NÃO cai em paywall.
// ════════════════════════════════════════════════════════════════════════════
console.log('\n── Sprint B1: mediaReady e histórias "Em breve" ──');

const b1MediaSvc   = readSrc('src/services/mediaReadyService.js');
const b1Content    = readSrc('src/services/contentAccessService.js');
const b1StoryCard  = readSrc('src/components/StoryCard.js');
const b1StoryDet   = readSrc('src/screens/StoryDetailScreen.js');
const b1Narration  = readSrc('src/screens/NarrationScreen.js');
const b1SceneIllu  = readSrc('src/data/storySceneIllustrations.js');

check(
  'B1: mediaReady é DERIVADO do manifesto de ilustrações (sem lista manual frágil)',
  b1MediaSvc.includes("from '../data/storySceneIllustrations'") &&
  b1MediaSvc.includes('STORY_SCENE_ILLUSTRATIONS') &&
  b1MediaSvc.includes('export function isStoryMediaReady') &&
  b1MediaSvc.includes('sceneIllustrations >= expectedScenes'),
  'mediaReadyService não deriva do manifesto / usa lista manual',
);

check(
  'B1: flag QA interna existe e é SEPARADA do Modo Criador (false em produção)',
  /QA_ALLOW_INCOMPLETE_STORIES = false/.test(b1MediaSvc) &&
  !b1MediaSvc.includes('creatorQaMode') &&
  /canOpenStoryMedia[\s\S]{0,160}QA_ALLOW_INCOMPLETE_STORIES/.test(b1MediaSvc),
  'flag QA ausente, ligada por engano, ou acoplada ao Modo Criador',
);

check(
  'B1: contentAccessService trata falta de mídia como "Em breve" (isStoryComingSoon usa canOpenStoryMedia)',
  /isStoryComingSoon\(story\)\s*\{[\s\S]{0,200}!canOpenStoryMedia\(story\)/.test(b1Content) &&
  b1Content.includes('export function getStoryLockReason') &&
  b1Content.includes("from './mediaReadyService'"),
  'contentAccessService não integra mediaReady no estado "Em breve"',
);

check(
  'B1: getStoryLockReason separa mídia ("media") de plano ("premium")',
  /getStoryLockReason[\s\S]{0,260}return 'media'[\s\S]{0,160}return 'premium'/.test(b1Content),
  'getStoryLockReason não distingue falta de mídia de trava de plano',
);

check(
  'B1 card: StoryCard usa isStoryComingSoon (mídia) e esconde a promessa de "N cenas" quando "Em breve"',
  b1StoryCard.includes('isStoryComingSoon(story)') &&
  /!isComingSoon && story\.totalCenas > 0/.test(b1StoryCard),
  'StoryCard não reflete "Em breve" por mídia / ainda promete cenas em história incompleta',
);

check(
  'B1 detalhe: StoryDetail usa isStoryComingSoon e bloqueia as cenas (sem abrir player vazio)',
  b1StoryDet.includes('isStoryComingSoon(story)') &&
  /if \(isComingSoon\) return 'locked'/.test(b1StoryDet),
  'StoryDetailScreen não bloqueia história "Em breve"',
);

check(
  'B1 player: NarrationScreen redireciona por motivo — premium→Área dos Pais; mídia→volta (sem paywall)',
  b1Narration.includes('getStoryLockReason(story)') &&
  /getStoryLockReason\(story\) === 'premium'[\s\S]{0,160}ParentArea/.test(b1Narration) &&
  /canGoBack\(\)[\s\S]{0,80}goBack\(\)/.test(b1Narration),
  'NarrationScreen ainda manda história sem mídia para a Área dos Pais (paywall enganoso)',
);

check(
  'B1 capas: StoryCard mantém <Image source={coverImg}> nas capas (sem SafeImage)',
  b1StoryCard.includes('<Image source={coverImg}') && !b1StoryCard.includes('SafeImage'),
  'StoryCard trocou a capa aprovada por SafeImage — proibido',
);

// Paridade com o manifesto (não-frágil): conta requires de cena por história e
// confirma que a vitrine grátis (creation/noah) está pronta e que existe ao menos
// uma história "só capa" (mapa vazio) — provando que a regra tem efeito real.
{
  const counts = {};
  // pega cada bloco "<id>: { ... }" do mapa STORY_SCENE_ILLUSTRATIONS
  for (const m of b1SceneIllu.matchAll(/([a-z_]+):\s*\{([\s\S]*?)\}/g)) {
    const id = m[1];
    if (id === 'folder' || id === 'fileName' || id === 'example') continue; // ignora o PATTERN
    const n = (m[2].match(/\d+:\s*require\(/g) || []).length;
    counts[id] = n;
  }
  const creationReady = (counts.creation ?? 0) >= 10;
  const noahReady = (counts.noah ?? 0) >= 10;
  const coverOnly = Object.values(counts).filter(n => n === 0).length;
  const fullyReady = Object.values(counts).filter(n => n >= 10).length;
  check(
    'B1 paridade: creation+noah prontos (≥10 cenas) e existe ≥1 história "só capa" (mapa vazio)',
    creationReady && noahReady && coverOnly >= 1 && fullyReady >= 2,
    `creation=${counts.creation} noah=${counts.noah} coverOnly=${coverOnly} fullyReady=${fullyReady}`,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Sprint B — Bloco B2: integração controlada de mídia nova
// As 5 histórias entregues (mapas antes vazios) passam a ter 10 cenas reais.
// Valida: 10 requires por história integrada, cada arquivo no disco, storyIds
// reais (sem duplicar), e que as 4 restantes seguem "Em breve".
// ════════════════════════════════════════════════════════════════════════════
console.log('\n── Sprint B2: integração controlada de mídia nova ──');

const B2_INTEGRATED = ['ruth_naomi', 'esther_queen', 'miraculous_catch', 'samuel_hears_god', 'josiah_young_king'];
const B2_STILL_SOON = ['solomon_wisdom', 'mary_says_yes', 'timothy_faith', 'jesus_temple'];
const b2SceneSrc = readSrc('src/data/storySceneIllustrations.js');

// Conta requires de cena por história no manifesto.
function b2SceneCount(sid) {
  return (b2SceneSrc.match(new RegExp(`stories/${sid}/scenes/${sid}_scene_\\d\\d\\.png`, 'g')) || []).length;
}

check(
  'B2: cada história integrada tem exatamente 10 cenas registradas (storyIds reais do catálogo)',
  B2_INTEGRATED.every(sid => b2SceneCount(sid) === 10) &&
  B2_INTEGRATED.every(sid => /id: '(.+)'/.test(`id: '${sid}'`) && readSrc('src/data/stories.js').includes(`id: '${sid}'`)),
  'Alguma história integrada não tem 10 cenas ou usa storyId inexistente',
);

check(
  'B2: cada require das 5 histórias integradas aponta para arquivo existente no disco (50/50)',
  (() => {
    let ok = 0;
    for (const sid of B2_INTEGRATED) {
      for (let n = 1; n <= 10; n++) {
        const nn = String(n).padStart(2, '0');
        const rel = `assets/stories/${sid}/scenes/${sid}_scene_${nn}.png`;
        if (b2SceneSrc.includes(`'../../${rel}'`) && fs.existsSync(path.join(root, rel))) ok++;
      }
    }
    return ok === 50;
  })(),
  'Há require de cena integrada sem arquivo correspondente no disco (require quebrado)',
);

check(
  'B2: nenhuma pasta odd-named/idioma sobrou em assets/stories (Miracle_Fishing/Samuel.../ester.../rute.../young...)',
  (() => {
    const dirs = fs.readdirSync(path.join(root, 'assets/stories'));
    const bad = dirs.filter(d => /^Miracle_Fishing$|^Samuel_heard_god|^ester_the_brave_queen$|^rute_noemi$|^young_king_josiah$/.test(d));
    return bad.length === 0;
  })(),
  'Sobrou pasta de mídia com nome não-padronizado (deveria virar <storyId>/scenes/)',
);

check(
  'B2: as 4 histórias ainda sem mídia continuam "Em breve" (mapa vazio, 0 cenas)',
  B2_STILL_SOON.every(sid => b2SceneCount(sid) === 0) &&
  B2_STILL_SOON.every(sid => new RegExp(`${sid}: \\{\\}`).test(b2SceneSrc)),
  'Uma história sem mídia foi integrada por engano (deveria continuar Em breve)',
);

check(
  'B2: sem storyId duplicado no manifesto (cada chave de história aparece 1×)',
  (() => {
    const keys = (b2SceneSrc.match(/^  [a-z_]+: \{/gm) || []).map(s => s.trim());
    return new Set(keys).size === keys.length;
  })(),
  'storyId duplicado no manifesto de cenas',
);

// ════════════════════════════════════════════════════════════════════════════
// Beni mascote OFICIAL — registro/poses novas, sem referência a asset apagado.
// (Pega regressão de require para arquivo inexistente, que doctor/smoke não
// detectam por não fazerem bundle.)
// ════════════════════════════════════════════════════════════════════════════
console.log('\n── Beni mascote oficial ──');

const beniImgSrc   = readSrc('src/assets/mascot/beniImages.js');
const beniMascotSrc = readSrc('src/components/common/BeniMascotImage.js');
const beniAssetsSrc = readSrc('src/assets/beniAssets.js');
const beniAvatarSrc = readSrc('src/components/beni/BeniAvatar.js');
const BENI_OFFICIAL = ['01_beni_avatar_base', '02_beni_acenando', '03_beni_celebrando',
  '04_beni_com_bau', '05_beni_ensinando', '06_beni_orando', '07_beni_atelie'];

check(
  'Beni: beniImages.js registra as 7 poses oficiais e cada PNG existe no disco',
  BENI_OFFICIAL.every(f => beniImgSrc.includes(`${f}.png`) &&
    fs.existsSync(path.join(root, `assets/mascot/beni/${f}.png`))) &&
  beniImgSrc.includes('avatarBase') && beniImgSrc.includes('orando') && beniImgSrc.includes('comBau'),
  'beniImages não referencia as 7 poses oficiais ou falta arquivo no disco',
);

check(
  'Beni: nenhum source referencia os assets antigos apagados (beni_main/idle/...)',
  (() => {
    const hits = [];
    for (const rel of ['src/assets/beniAssets.js', 'src/components/beni/BeniAvatar.js',
                       'src/assets/mascot/beniImages.js', 'src/components/common/BeniMascotImage.js']) {
      if (/beni_(main|idle|pointing|celebrating|artist|thinking|reading)\.png/.test(readSrc(rel))) hits.push(rel);
    }
    return hits.length === 0;
  })(),
  'Ainda há require para asset antigo de Beni apagado (quebraria o bundle)',
);

check(
  'Beni: BeniMascotImage tem default avatarBase + fallback seguro + resizeMode contain, sem require dinâmico',
  beniMascotSrc.includes("variant = BENI_DEFAULT_VARIANT") &&
  beniMascotSrc.includes("BENI_IMAGES[variant] || BENI_IMAGES[BENI_DEFAULT_VARIANT]") &&
  beniMascotSrc.includes("resizeMode = 'contain'") &&
  !/require\([^'")]/.test(beniMascotSrc),
  'BeniMascotImage sem default/fallback seguro ou usa require dinâmico',
);

check(
  'Beni: beniAssets (preload) consome o registro central; BeniAvatar renderiza via BeniCircularArt (sem require literal)',
  beniAssetsSrc.includes("from './mascot/beniImages'") &&
  beniAvatarSrc.includes("from '../common/BeniCircularArt'") &&
  !/require\(.*assets\/mascot\/beni\//.test(beniAvatarSrc),
  'BeniAvatar não delega a BeniCircularArt / beniAssets não usa o registro central',
);

check(
  'Beni: BeniCircularArt = avatar com cover + presets de crop (preenche o círculo, sem retângulo); full=contain só p/ exibição grande',
  (() => {
    const src = readSrc('src/components/common/BeniCircularArt.js');
    const coverOk = src.includes('resizeMode="cover"');                 // avatar preenche o círculo
    const presetsOk = /CROP_PRESETS\s*=\s*\{[\s\S]*cropScale/.test(src) &&
      /avatarBase:\s*\{\s*cropScale:\s*1\.08/.test(src) &&
      /comBau:\s*\{\s*cropScale:\s*1\.12/.test(src);
    const modesOk = /mode\s*=\s*'avatar'/.test(src) &&                  // avatar é o padrão
      src.includes("mode === 'full'") && src.includes('resizeMode="contain"'); // full = contain
    const clipOk = src.includes("overflow: 'hidden'") && src.includes('borderRadius: size / 2');
    return coverOk && presetsOk && modesOk && clipOk;
  })(),
  'BeniCircularArt não faz crop circular (cover + presets) — avatar ficaria como retângulo/contain',
);

// ── A3 (assíncrono): round-trip REAL do reset (resetProgress agora usa getAllKeys).
// O resumo só é impresso depois que o reset assíncrono terminar.
(async () => {
  try {
    const { store, api } = a1MockAsyncStorage();
    const stories = [{ id: 'noah' }];
    // resetProgress delega a limpeza de colorir a clearAllSavedDrawings — mock
    // que remove as chaves @ptf_drawing_* do store (espelha o comportamento real).
    const clearAllSavedDrawings = async () => {
      const ks = [...store.keys()].filter(k => k.startsWith('@ptf_drawing_'));
      ks.forEach(k => store.delete(k));
      return ks.length;
    };
    const pr = a1LoadSandbox('src/services/progressResetService.js',
      { AsyncStorage: api, stories, clearAllSavedDrawings }, ['resetProgress']);
    store.set('@ptf_progress_noah', '{"1":true}');
    store.set('@ptf_quiz_done_noah', 'true');
    store.set('@ptf_beni_chest_seen_cards_v1', '["x"]');   // Baú visto
    store.set('@ptf_family_worship_v1', '{"count":2}');    // Cultinho
    store.set('@ptf_lumi_moment_2026-06-11', 'done');      // Momento diário
    store.set('@ptf_lumi_moment_ever', 'true');
    store.set('@ptf_drawing_snoah_c1', 'data:image/png;base64,AAA'); // colorir por cena → LIMPAR
    store.set('ptf_atelier_arts_v1_index', '[]');                    // Galeria → PRESERVAR
    await pr.resetProgress();
    const cleaned = !store.has('@ptf_progress_noah') && !store.has('@ptf_quiz_done_noah') &&
      !store.has('@ptf_beni_chest_seen_cards_v1') && !store.has('@ptf_family_worship_v1') &&
      !store.has('@ptf_lumi_moment_2026-06-11') && !store.has('@ptf_lumi_moment_ever');
    // Novo: o vínculo de colorir por cena é limpo (cena não fica "já colorida");
    // a Galeria do Ateliê é preservada.
    const drawingCleared = !store.has('@ptf_drawing_snoah_c1');
    const galleryPreserved = store.has('ptf_atelier_arts_v1_index');
    check('A3 reset (round-trip real): limpa progresso + Baú + Cultinho + Momentos + colorir por cena; PRESERVA Galeria',
      cleaned && drawingCleared && galleryPreserved,
      `cleaned=${cleaned} drawingCleared=${drawingCleared} galleryPreserved=${galleryPreserved}`);
  } catch (e) {
    check('A3 reset: resetProgress round-trip assíncrono', false, String(e && e.message));
  }

  // ── A1.4b (assíncrono): round-trip REAL do postStoryStorage (serviço principal) ──
  // Exercita save→read de quiz, reflexão (objeto serializado), livrinho, estrelas
  // bônus (acúmulo) e o status agregado — comportamento, não string.
  try {
    const { store, api } = a1MockAsyncStorage();
    const ps = a1LoadSandbox('src/services/postStoryStorage.js',
      { AsyncStorage: api },
      ['markQuizDone', 'isQuizDone', 'saveReflection', 'getReflection',
       'markStoryBookOpened', 'isStoryBookOpened', 'addBonusStars', 'getBonusStars',
       'getPostStoryStatus']);
    const cleanStart = (await ps.isQuizDone('noah')) === false &&
      (await ps.getReflection('noah')) === null &&
      (await ps.getBonusStars()) === 0;
    await ps.markQuizDone('noah');
    const quizOk = (await ps.isQuizDone('noah')) === true &&
      (await ps.isQuizDone('david_goliath')) === false; // isolado por história
    await ps.saveReflection('noah', { feeling: 'feliz', keep: 'amar a Deus' });
    const refl = await ps.getReflection('noah');
    const reflOk = !!refl && refl.feeling === 'feliz' && refl.keep === 'amar a Deus'; // objeto round-trip
    await ps.markStoryBookOpened('noah');
    const bookOk = (await ps.isStoryBookOpened('noah')) === true;
    await ps.addBonusStars(2); await ps.addBonusStars(3);
    const starsOk = (await ps.getBonusStars()) === 5; // acúmulo real
    const status = await ps.getPostStoryStatus('noah');
    const statusOk = status.quizDone && status.reflectionDone && status.storyBookOpened &&
      status.hasPendingRewards === false;
    const keysOk = store.has('@ptf_quiz_done_noah') && store.has('@ptf_reflection_noah') &&
      store.has('@ptf_storybook_opened_noah') && store.has('@ptf_bonus_stars');
    check('A1 storage: postStoryStorage round-trip real (quiz/reflexão/livrinho/estrelas + status agregado)',
      cleanStart && quizOk && reflOk && bookOk && starsOk && statusOk && keysOk,
      `clean=${cleanStart} quiz=${quizOk} refl=${reflOk} book=${bookOk} stars=${starsOk} status=${statusOk} keys=${keysOk}`);
  } catch (e) {
    check('A1 storage: postStoryStorage round-trip', false, String(e && e.message));
  }

  // ── A5 (assíncrono): round-trip REAL de blobs com fileBlobStore mockado ──────
  // O FS nativo não roda em Node, então injetamos um fileBlobStore em memória
  // (mesmo contrato: uri determinística por subdir+filename, guarda base64, lê de
  // volta como data URL). Valida ponteiros, resolução, migração idempotente,
  // fallback e limpeza de arquivos — a parte que poderia "mentir".
  function a5MockBlobStore() {
    const files = new Map();
    const isDataUrl = (s) => typeof s === 'string' && s.startsWith('data:');
    const dataUrlMime = (d, fb = 'image/png') => {
      if (!isDataUrl(d)) return fb;
      const m = /^data:([^;,]+)[;,]/.exec(d); return (m && m[1]) || fb;
    };
    const stripPrefix = (d) => {
      const i = typeof d === 'string' ? d.indexOf('base64,') : -1;
      return i >= 0 ? d.slice(i + 7) : d;
    };
    const toDataUrl = (b64, mime = 'image/png') => 'data:' + mime + ';base64,' + b64;
    const safeName = (id) => String(id == null ? '' : id).replace(/[^A-Za-z0-9_-]/g, '_');
    return {
      files,
      deps: {
        safeName, isDataUrl, dataUrlMime,
        writeBlob: async (subdir, filename, dataUrlOrBase64, mimeHint) => {
          if (!dataUrlOrBase64) return null;
          const mime = mimeHint || dataUrlMime(dataUrlOrBase64);
          const b64 = isDataUrl(dataUrlOrBase64) ? stripPrefix(dataUrlOrBase64) : dataUrlOrBase64;
          const uri = 'file:///mock/' + subdir + '/' + filename;
          files.set(uri, { b64, mime });
          return { uri, mime };
        },
        readBlobAsDataUrl: async (uri, mime = 'image/png') => {
          const f = files.get(uri); if (!f) return null;
          return toDataUrl(f.b64, f.mime || mime);
        },
        deleteBlob: async (uri) => { files.delete(uri); },
      },
    };
  }

  // A5.1 — drawing: salva ponteiro (não base64 grande) + resolve v2 com layout + clear apaga arquivo.
  try {
    const { store, api } = a1MockAsyncStorage();
    const blob = a5MockBlobStore();
    const ds = a1LoadSandbox('src/services/drawingStorage.js',
      { AsyncStorage: api, log: () => {}, ...blob.deps },
      ['saveDrawingState', 'getSavedDrawing', 'clearDrawingState']);
    const big = 'A'.repeat(3000);
    const v2 = JSON.stringify({ v: 2, W: 390, H: 600, imgX: 3, imgY: 4, imgW: 300, imgH: 400, data: 'data:image/png;base64,' + big });
    await ds.saveDrawingState('noah', 3, v2);
    const stored = store.get('@ptf_drawing_snoah_c3');
    let isPointer = false;
    try { const p = JSON.parse(stored); isPointer = p.v === 3 && typeof p.uri === 'string' && !stored.includes(big); } catch {}
    const fileHasBlob = [...blob.files.values()].some(f => f.b64 === big);
    const resolved = await ds.getSavedDrawing('noah', 3);
    let rt = false;
    try { const p = JSON.parse(resolved); rt = p.v === 2 && p.W === 390 && p.imgX === 3 && p.data === 'data:image/png;base64,' + big; } catch {}
    await ds.clearDrawingState('noah', 3);
    const cleared = !store.has('@ptf_drawing_snoah_c3') && blob.files.size === 0;
    check('A5 drawing: salva ponteiro (sem base64 grande) + resolve v2 com layout + clear apaga arquivo',
      isPointer && fileHasBlob && rt && cleared,
      `pointer=${isPointer} file=${fileHasBlob} resolve=${rt} cleared=${cleared}`);
  } catch (e) {
    check('A5 drawing: round-trip ponteiro', false, String(e && e.message));
  }

  // A5.2 — drawing: fallback lê formato antigo + migração idempotente preservando o conteúdo.
  try {
    const { store, api } = a1MockAsyncStorage();
    const blob = a5MockBlobStore();
    const ds = a1LoadSandbox('src/services/drawingStorage.js',
      { AsyncStorage: api, log: () => {}, ...blob.deps },
      ['getSavedDrawing', 'migrateDrawingsToFiles']);
    const oldUrl = 'data:image/png;base64,' + 'B'.repeat(3000);
    store.set('@ptf_drawing_screation_c1', oldUrl);          // formato antigo v1 inline
    const fallbackOk = (await ds.getSavedDrawing('creation', 1)) === oldUrl;
    const n1 = await ds.migrateDrawingsToFiles();            // migra 1
    const afterMig = store.get('@ptf_drawing_screation_c1');
    let migratedToPointer = false;
    try { const p = JSON.parse(afterMig); migratedToPointer = p.v === 3 && typeof p.uri === 'string'; } catch {}
    const stillReads = (await ds.getSavedDrawing('creation', 1)) === oldUrl; // resolve = mesmo conteúdo
    const n2 = await ds.migrateDrawingsToFiles();            // idempotente: 0
    check('A5 drawing: fallback lê formato antigo + migração idempotente (1, depois 0) preservando conteúdo',
      fallbackOk && n1 === 1 && migratedToPointer && stillReads && n2 === 0,
      `fallback=${fallbackOk} n1=${n1} pointer=${migratedToPointer} stillReads=${stillReads} n2=${n2}`);
  } catch (e) {
    check('A5 drawing: fallback + migração idempotente', false, String(e && e.message));
  }

  // A5.3 — atelier: salva ponteiros (sem base64 grande) + resolve file:// + delete apaga arquivos.
  try {
    const { store, api } = a1MockAsyncStorage();
    const blob = a5MockBlobStore();
    const as = a1LoadSandbox('src/services/atelierStorage.js',
      { AsyncStorage: api, log: () => {}, ...blob.deps },
      ['saveArt', 'getArt', 'listArts', 'deleteArt', 'resolveArtPreviewUri', 'resolveArtThumbUri']);
    const preview = 'data:image/jpeg;base64,' + 'P'.repeat(4000);
    const thumb = 'data:image/jpeg;base64,' + 'T'.repeat(2000);
    const id = await as.saveArt({ title: 'Arte', mission: null, stateJson: '{"v":2}', thumbnailBase64: thumb, previewBase64: preview });
    const fullRaw = store.get('ptf_atelier_arts_v1_' + id);
    const idxRaw = store.get('ptf_atelier_arts_v1_index');
    const noBigBlob = !fullRaw.includes('P'.repeat(4000)) && !idxRaw.includes('T'.repeat(2000));
    const full = await as.getArt(id);
    const meta = (await as.listArts())[0];
    const pUri = as.resolveArtPreviewUri(full);
    const tUri = as.resolveArtThumbUri(meta);
    const urisOk = typeof pUri === 'string' && pUri.startsWith('file:') && typeof tUri === 'string' && tUri.startsWith('file:');
    const filesOk = [...blob.files.values()].some(f => f.b64 === 'P'.repeat(4000)) &&
                    [...blob.files.values()].some(f => f.b64 === 'T'.repeat(2000));
    await as.deleteArt(id);
    const deletedClean = !store.has('ptf_atelier_arts_v1_' + id) && blob.files.size === 0 && (await as.listArts()).length === 0;
    check('A5 atelier: salva ponteiros (sem base64 grande) + resolve file:// + delete apaga arquivos',
      noBigBlob && urisOk && filesOk && deletedClean,
      `noBigBlob=${noBigBlob} uris=${urisOk} files=${filesOk} deletedClean=${deletedClean}`);
  } catch (e) {
    check('A5 atelier: round-trip ponteiros', false, String(e && e.message));
  }

  // A5.4 — atelier: migração move base64→arquivo (idempotente) e fallback lê o formato antigo antes de migrar.
  try {
    const { store, api } = a1MockAsyncStorage();
    const blob = a5MockBlobStore();
    const as = a1LoadSandbox('src/services/atelierStorage.js',
      { AsyncStorage: api, log: () => {}, ...blob.deps },
      ['getArt', 'listArts', 'resolveArtPreviewUri', 'resolveArtThumbUri', 'migrateArtsToFiles']);
    const oldId = 'art_old';
    store.set('ptf_atelier_arts_v1_' + oldId, JSON.stringify({ id: oldId, title: 'Velha', stateJson: '{}', previewBase64: 'data:image/jpeg;base64,' + 'X'.repeat(4000) }));
    store.set('ptf_atelier_arts_v1_index', JSON.stringify([{ id: oldId, title: 'Velha', thumbnailBase64: 'data:image/jpeg;base64,' + 'Y'.repeat(2000) }]));
    const fullBefore = await as.getArt(oldId);
    const fallbackPreview = as.resolveArtPreviewUri(fullBefore).startsWith('data:'); // lê antigo
    const n1 = await as.migrateArtsToFiles();          // migra preview + thumb = 2
    const fullAfter = await as.getArt(oldId);
    const metaAfter = (await as.listArts())[0];
    const moved = !!fullAfter.previewUri && fullAfter.previewBase64 === null &&
                  !!metaAfter.thumbnailUri && metaAfter.thumbnailBase64 === null;
    const n2 = await as.migrateArtsToFiles();          // idempotente: 0
    check('A5 atelier: migração base64→arquivo (idempotente: 2, depois 0) + fallback antigo antes de migrar',
      fallbackPreview && n1 === 2 && moved && n2 === 0,
      `fallback=${fallbackPreview} n1=${n1} moved=${moved} n2=${n2}`);
  } catch (e) {
    check('A5 atelier: migração idempotente + fallback', false, String(e && e.message));
  }

  // ── A6 (comportamental): accessControl free + invariante de conquista ────────
  // accessControl executado em sandbox (plano free, sem QA). Prova que os dois
  // recursos ficam livres E que conteúdo premium (histórias) SEGUE gateado.
  try {
    const ac = a1LoadSandbox('src/services/accessControl.js',
      { isCreatorQaModeEnabled: () => false,
        getStoryPlan: (s) => (s && s.plan) || 'premium',
        PLAN: { FREE: 'free', PREMIUM: 'premium', COMING_SOON: 'coming_soon' } },
      ['hasMomentoLumiAccess', 'canOpenMomentoLumi', 'hasLumiAccessForStory', 'hasStoryAccess', 'isPremiumUser']);
    const premiumStory = { id: 'david_goliath', plan: 'premium' };
    const freeStory = { id: 'creation', plan: 'free' };
    const momentoFree = ac.hasMomentoLumiAccess() === true && ac.canOpenMomentoLumi() === true;
    const guardarFree = ac.hasLumiAccessForStory(premiumStory) === true && ac.hasLumiAccessForStory(freeStory) === true;
    const premiumStillGated = ac.isPremiumUser() === false &&
      ac.hasStoryAccess(premiumStory) === false && ac.hasStoryAccess(freeStory) === true;
    check('A6 accessControl: Guardar no coração + Momento com Beni grátis p/ conta free; histórias premium SEGUEM gateadas',
      momentoFree && guardarFree && premiumStillGated,
      `momentoFree=${momentoFree} guardarFree=${guardarFree} premiumStillGated=${premiumStillGated}`);
  } catch (e) {
    check('A6 accessControl: gating grátis no MVP', false, String(e && e.message));
  }

  // Invariante de conquista: "Guardião da Criação" nunca acende sem "Primeira
  // aventura"; conta limpa não herda conquista.
  try {
    const ach = a1LoadSandbox('src/data/achievements.js',
      { colors: new Proxy({}, { get: () => '#000000' }) },
      ['ACHIEVEMENTS']);
    const find = id => ach.ACHIEVEMENTS.find(a => a.id === id);
    const firstStory = find('first_story');
    const creationAch = find('creation_complete');
    const noahAch = find('noah_done');
    // ctx "Criação concluída" como buildCtx produziria (anyStoryComplete derivado).
    const ctxCreation = { creationComplete: true, anyStoryComplete: true, completedStories: 1 };
    const bothFire = creationAch.check(ctxCreation) === true && firstStory.check(ctxCreation) === true;
    // Invariante mesmo se a contagem travasse em 0: a flag garante first_story.
    const ctxEdge = { creationComplete: true, anyStoryComplete: true, completedStories: 0 };
    const invariant = creationAch.check(ctxEdge) === true && firstStory.check(ctxEdge) === true;
    // Mesmo para outra história específica (Noé).
    const ctxNoah = { noahComplete: true, anyStoryComplete: true, completedStories: 0 };
    const noahInvariant = noahAch.check(ctxNoah) === true && firstStory.check(ctxNoah) === true;
    // Conta limpa: nada acende.
    const ctxClean = {};
    const cleanOk = creationAch.check(ctxClean) === false && firstStory.check(ctxClean) === false &&
                    noahAch.check(ctxClean) === false;
    check('A6 conquistas: conquista específica de história nunca acende sem "Primeira aventura"; conta limpa não herda',
      bothFire && invariant && noahInvariant && cleanOk,
      `both=${bothFire} inv=${invariant} noah=${noahInvariant} clean=${cleanOk}`);
  } catch (e) {
    check('A6 conquistas: invariante first_story', false, String(e && e.message));
  }

  // ── B1 (comportamental): derivação de mediaReady + gate de conteúdo ──────────
  // mediaReadyService com manifesto MOCK (o real usa require() de PNG, nativo).
  try {
    const mr = a1LoadSandbox('src/services/mediaReadyService.js',
      { STORY_SCENE_ILLUSTRATIONS: {
          ready10: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 1, 1])),
          partial3: { 1: 1, 2: 1, 3: 1 },
          coverOnly: {},
        } },
      ['getStoryMediaStatus', 'isStoryMediaReady', 'canOpenStoryMedia']);
    const ready = mr.isStoryMediaReady({ id: 'ready10', totalCenas: 10 }) === true;
    const partial = mr.isStoryMediaReady({ id: 'partial3', totalCenas: 10 }) === false;
    const cover = mr.isStoryMediaReady({ id: 'coverOnly', totalCenas: 10 }) === false;
    const st = mr.getStoryMediaStatus({ id: 'coverOnly', totalCenas: 10 });
    const reasonOk = st.reason === 'cover_only' && st.sceneIllustrations === 0 && st.expectedScenes === 10;
    // QA flag é false → canOpenStoryMedia segue mediaReady (não abre incompleta).
    const qaOff = mr.canOpenStoryMedia({ id: 'ready10', totalCenas: 10 }) === true &&
                  mr.canOpenStoryMedia({ id: 'coverOnly', totalCenas: 10 }) === false;
    check('B1 mediaReady: full→true, parcial→false, só capa→false (reason cover_only); QA off não abre incompleta',
      ready && partial && cover && reasonOk && qaOff,
      `ready=${ready} partial=${partial} cover=${cover} reason=${reasonOk} qaOff=${qaOff}`);
  } catch (e) {
    check('B1 mediaReady: derivação', false, String(e && e.message));
  }

  // contentAccessService: falta de mídia → "Em breve" (sem paywall); plano premium
  // continua sendo paywall; QA (canOpenStoryMedia true) deixa passar p/ o plano.
  try {
    const mediaMap = { rf: true, rp: true, nr: false, cs: true, qa: true };
    const ca = a1LoadSandbox('src/services/contentAccessService.js',
      { ACCESS_TYPE: { FREE: 'free', PREMIUM: 'premium' },
        isPremiumUser: () => false,
        canOpenStoryMedia: (s) => !!(s && mediaMap[s.id]),
        isStoryMediaReady: (s) => !!(s && mediaMap[s.id]) },
      ['isStoryComingSoon', 'canOpenStoryFullExperience', 'getStoryBadgeType',
       'getStoryPrimaryAction', 'getStoryLockReason', 'getStoryAccessStatus']);
    const readyFree = { id: 'rf', status: 'available', accessType: 'free' };
    const readyPrem = { id: 'rp', status: 'available', accessType: 'premium' };
    const notReady = { id: 'nr', status: 'available', accessType: 'premium' };
    const catalogSoon = { id: 'cs', status: 'coming_soon', accessType: 'free' };

    const freeOk = ca.isStoryComingSoon(readyFree) === false &&
      ca.canOpenStoryFullExperience(readyFree) === true &&
      ca.getStoryLockReason(readyFree) === null;
    // Sem mídia: Em breve, não abre, badge comingSoon, motivo 'media' (NÃO premium).
    const mediaOk = ca.isStoryComingSoon(notReady) === true &&
      ca.canOpenStoryFullExperience(notReady) === false &&
      ca.getStoryBadgeType(notReady, 0, false) === 'comingSoon' &&
      ca.getStoryPrimaryAction(notReady) === 'disabled' &&
      ca.getStoryAccessStatus(notReady) === 'coming_soon' &&
      ca.getStoryLockReason(notReady) === 'media';
    // Premium pronto (usuário free): NÃO é "Em breve"; trava é de PLANO.
    const premOk = ca.isStoryComingSoon(readyPrem) === false &&
      ca.canOpenStoryFullExperience(readyPrem) === false &&
      ca.getStoryLockReason(readyPrem) === 'premium';
    // Catálogo coming_soon → motivo coming_soon.
    const soonOk = ca.isStoryComingSoon(catalogSoon) === true &&
      ca.getStoryLockReason(catalogSoon) === 'coming_soon';
    check('B1 gate: falta de mídia vira "Em breve"/back (motivo media), premium segue paywall, catálogo coming_soon distinto',
      freeOk && mediaOk && premOk && soonOk,
      `free=${freeOk} media=${mediaOk} prem=${premOk} soon=${soonOk}`);
  } catch (e) {
    check('B1 gate: contentAccessService', false, String(e && e.message));
  }

  // B2 (comportamental): a mídia integrada faz mediaReady virar true PELA REGRA
  // real do B1 (mediaReadyService), usando as contagens reais do manifesto.
  try {
    const allIds = [...B2_INTEGRATED, ...B2_STILL_SOON, 'creation', 'noah'];
    const mockMap = {};
    for (const sid of allIds) {
      const c = b2SceneCount(sid);
      mockMap[sid] = Object.fromEntries(Array.from({ length: c }, (_, i) => [i + 1, 1]));
    }
    const mr = a1LoadSandbox('src/services/mediaReadyService.js',
      { STORY_SCENE_ILLUSTRATIONS: mockMap }, ['isStoryMediaReady']);
    const integratedReady = B2_INTEGRATED.every(sid => mr.isStoryMediaReady({ id: sid, totalCenas: 10 }) === true);
    const soonNotReady = B2_STILL_SOON.every(sid => mr.isStoryMediaReady({ id: sid, totalCenas: 10 }) === false);
    const showcaseIntact = mr.isStoryMediaReady({ id: 'creation', totalCenas: 10 }) === true &&
                           mr.isStoryMediaReady({ id: 'noah', totalCenas: 10 }) === true;
    check('B2 mediaReady: as 5 integradas viram true pela regra do B1; as 4 restantes seguem false; creation/noah intactos',
      integratedReady && soonNotReady && showcaseIntact,
      `integrated=${integratedReady} soon=${soonNotReady} showcase=${showcaseIntact}`);
  } catch (e) {
    check('B2 mediaReady: flip pelas contagens reais', false, String(e && e.message));
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = passes + failures;
  console.log(`\n── Result: ${passes}/${total} passed, ${failures} failed ──\n`);
  if (failures > 0) process.exit(1);
})();
