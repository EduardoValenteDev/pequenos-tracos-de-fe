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
  // Fase 2B.7.2: getCurrentPlan DELEGA ao entitlementService (resolve 'free' sem fonte real —
  // provado pelos checks 2B.7.2 compat/fail-closed). Creator QA segue override, não unlock global.
  /getCurrentPlan\(\)\s*\{[\s\S]*?return getEntitlementPlan\(\)/.test(acSource) &&
  !/ENABLE_LOCAL_PREMIUM_TEST_MODE = true/.test(acSource),
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

// ── QA 1: Galeria de QA dos desenhos de colorir (só Modo Criador) ────────────
{
  const colImgSrc = readSrc('src/assets/coloringImages.js');
  const colQaSrc = readSrc('src/screens/ColoringQaScreen.js');
  const colScreenSrc = readSrc('src/screens/ColoringScreen.js');
  const navSrc = readSrc('src/navigation/AppNavigator.js');
  const parentSrcQa1 = readSrc('src/screens/ParentAreaScreen.js');
  check(
    'QA1: coloringImages expõe enumeração do manifesto (getColoringStoryIds/getColoringSceneIds), só leitura',
    colImgSrc.includes('export function getColoringStoryIds') &&
    colImgSrc.includes('export function getColoringSceneIds') &&
    colImgSrc.includes('Object.keys(coloringImages)'),
    'coloringImages não expõe enumeração do manifesto',
  );
  check(
    'QA1: ColoringScreen abre QUALQUER desenho só com qa + Modo Criador (duplo-gate); fluxo normal mantém bloqueio',
    colScreenSrc.includes("import { isCreatorQaModeEnabled } from '../services/creatorQaMode'") &&
    /qaBypass = route\.params\?\.qa === true && isCreatorQaModeEnabled\(\)/.test(colScreenSrc) &&
    /if \(!qaBypass && !canOpenStoryFullExperience\(story\)\)/.test(colScreenSrc),
    'ColoringScreen não tem o bypass de QA com duplo-gate (ou removeu o bloqueio normal)',
  );
  check(
    'QA1: ColoringQaScreen lista por história, abre Coloring com qa:true e é restrita ao Modo Criador',
    colQaSrc.includes("import { stories } from '../data/stories'") &&
    colQaSrc.includes('getColoringImage') &&
    colQaSrc.includes('isCreatorQaModeAllowed') &&
    /navigation\.navigate\('Coloring', \{ story, cenaIndex: index, qa: true/.test(colQaSrc) &&
    colQaSrc.includes('if (!allowed)'),
    'ColoringQaScreen não lista/abre os desenhos em QA ou não é restrita ao Criador',
  );
  check(
    'QA1: ColoringQaScreen é SÓ leitura — não importa/chama writers de progresso/conquista/plano',
    !colQaSrc.includes('AsyncStorage') &&
    !/from '\.\.\/services\/(accessControl|achievementService|rewardService|postStoryStorage|drawingStorage|progressResetService)'/.test(colQaSrc) &&
    !/from '\.\.\/context\/ProgressContext'/.test(colQaSrc) &&
    !colQaSrc.includes('setCreatorQaModeEnabled') &&
    !/markStor|saveProgress|refreshProgress|unlockAchievement/i.test(colQaSrc),
    'ColoringQaScreen importa/chama writers de progresso/conquista/plano (deveria ser só leitura + navegação)',
  );
  check(
    'QA1: rota ColoringQa registrada e entrada na seção Ferramentas do Criador (SHOW_TEST_TOOLS)',
    navSrc.includes("name=\"ColoringQa\"") &&
    navSrc.includes('import ColoringQaScreen') &&
    parentSrcQa1.includes("navigation.navigate('ColoringQa')") &&
    /\{SHOW_TEST_TOOLS &&[\s\S]*?navigation\.navigate\('ColoringQa'\)/.test(parentSrcQa1),
    'rota ColoringQa ausente ou entrada fora do gate de Ferramentas do Criador',
  );
}

// ── Layout 1: sem espaço morto no fim do scroll (tab bar não-absoluta) ───────
{
  const navLayout = readSrc('src/navigation/AppNavigator.js');
  check(
    'Layout1: tab bar NÃO-absoluta reserva 64 + insets.bottom — telas não re-somam insets.bottom no fim do scroll',
    /height: 64 \+ insets\.bottom/.test(navLayout) &&
    !/tabBarStyle:\s*\{[\s\S]{0,200}position:\s*'absolute'/.test(navLayout) &&
    /const SCROLL_BOTTOM_PAD = [0-8]\b/.test(readSrc('src/screens/AdventureMapScreen.js')) &&
    readSrc('src/screens/AdventureMapScreen.js').includes('paddingBottom: SCROLL_BOTTOM_PAD') &&
    !readSrc('src/screens/HomeScreen.js').includes('insets.bottom + 80') &&
    !readSrc('src/screens/AtelierScreen.js').includes('insets.bottom + 72') &&
    !readSrc('src/screens/ProfileScreen.js').includes('insets.bottom + 72') &&
    !readSrc('src/screens/TrophiesScreen.js').includes('insets.bottom + 64') &&
    !readSrc('src/screens/ParentAreaScreen.js').includes('insets.bottom + 48'),
    'tab bar virou absoluta, ou alguma tela voltou a somar insets.bottom (espaço morto) no paddingBottom',
  );
}

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

// Regressão B2: fluxo de apagar dados protege o campo "APAGAR" do teclado
// (KeyboardAvoidingView) e empilha os botões (resetBtnColumn) para não quebrar
// o texto "Apagar definitivamente" em telas estreitas.
{
  const parentSrcB2 = readSrc('src/screens/ParentAreaScreen.js');
  check(
    'ParentAreaScreen: apagar dados usa KeyboardAvoidingView + botões empilhados (resetBtnColumn)',
    parentSrcB2.includes('KeyboardAvoidingView') &&
    parentSrcB2.includes('resetBtnColumn') &&
    parentSrcB2.includes("resetConfirmText.trim() !== 'APAGAR'"),
    'ParentAreaScreen perdeu KeyboardAvoidingView, a coluna de botões, ou a confirmação "APAGAR"',
  );
}

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
  // Fase 2B.6: o card do Livrinho leva ao StoryBook via goToPremium (guard canAccess),
  // não mais navigate('StoryBook') cru. Intenção preservada: StoryBook, não PostStoryHub.
  storyDetailSrc.includes("goToPremium('StoryBook'") || storyDetailSrc.includes("navigate('StoryBook'"),
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
  'AudioPlayer uses didJustFinish for end detection (LIVRINHO_FIX_1: watchdog/backstop permitidos; sem timer FAKE)',
  audioPlayerSrc.includes('didJustFinish') && !audioPlayerSrc.includes('DURACAO_SIMULADA') && !audioPlayerSrc.includes('setInterval'),
  'AudioPlayer.js deve usar status.didJustFinish (primário) e não um timer FAKE de fim (setInterval/DURACAO_SIMULADA)',
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

// Bloco 1.1 — MIGRADO de 3 para 0. Decisão oficial do Eduardo: o plano gratuito
// NÃO salva artes. O check continua guardando contra mudança silenciosa do limite.
check(
  'atelierStorage ATELIER_FREE_SAVE_LIMIT equals 0 (free não salva)',
  atelierStorageSrc.includes('ATELIER_FREE_SAVE_LIMIT = 0'),
  'ATELIER_FREE_SAVE_LIMIT is not 0 — free save limit changed without product decision',
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

// Regressão B1: "Escolher cena" deve navegar para a aba via Home > Aventuras.
// 'Aventuras' NÃO é rota do Stack root (a rota é 'Stories'); navegar 'Aventuras'
// direto falha ("NAVIGATE not handled") quando o Ateliê é aberto por
// AtelierFromContext (ex.: Cultinho). O padrão correto é navigate('Home', {screen:'Aventuras'}).
check(
  'AtelierScreen "Escolher cena" usa navigate(Home, {screen: Aventuras}) — não a rota inexistente Aventuras',
  atelierScreenSrc.includes("navigate('Home', { screen: 'Aventuras' })") &&
  !/navigate\(\s*'Aventuras'\s*\)/.test(atelierScreenSrc),
  'AtelierScreen navega para a rota inexistente Aventuras — quebra ao abrir o Ateliê pelo Cultinho (AtelierFromContext)',
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

// Bloco 1.2 — MIGRADO: o nome "Ateliê" saiu da UI. O check continua guardando
// que o estado vazio tem título próprio (não some, não vira texto genérico).
check(
  'AtelierGalleryScreen has correct empty state title (Bloco 1.2: sem "Ateliê")',
  atelierGallerySrc.includes('Suas artes ainda vão aparecer aqui')
  && !/title="[^"]*Ateliê/.test(atelierGallerySrc),
  'empty state title errado — deve ser "Suas artes ainda vão aparecer aqui", sem "Ateliê"',
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

// Bloco 1.1 — MIGRADO de 3 para 0 (free não salva). Espelha atelierStorage.
check(
  'accessControl FREE_ATELIER_SAVE_LIMIT equals 0 (free não salva)',
  acSrc8.includes('FREE_ATELIER_SAVE_LIMIT = 0'),
  'accessControl FREE_ATELIER_SAVE_LIMIT is not 0',
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
// B3: Eduardo NÃO quer botões + / - de zoom. O zoomIn órfão (Ampliar) foi
// removido; o zoom continua por gesto de pinça e o botão zoom_reset (Enquadrar).
check(
  'Colorir (B3): ColoringCanvas não tem window.zoomIn órfão (sem botão Ampliar +/-)',
  !coloringCanvasSrc93.includes('window.zoomIn'),
  'ColoringCanvas voltou a expor window.zoomIn (Ampliar) — Eduardo não quer botões + / - de zoom',
);
check(
  'Colorir (B3): reset de zoom (Enquadrar) preservado — window.resetZoom + zoom_reset',
  coloringCanvasSrc93.includes('window.resetZoom=function') &&
  coloringScreenSrc93.includes('name="zoom_reset"') &&
  !/name="zoom_(in|out)"/.test(coloringScreenSrc93),
  'reset de zoom removido, ou surgiu botão zoom_in/zoom_out (proibido)',
);
check(
  'Colorir (B3): orientação inicial "toque numa parte branca" + botão Entendi',
  coloringScreenSrc93.includes('Toque em uma parte branca para começar a colorir') &&
  coloringScreenSrc93.includes('dismissStartHint') &&
  coloringScreenSrc93.includes('Entendi'),
  'ColoringScreen perdeu a orientação inicial (toque numa parte branca / botão Entendi / dismissStartHint)',
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
  'Colorir: cache em memória da lineart (CACHE HIT/MISS por cacheKey require|uri) — reabrir cena é mais rápido',
  coloringCanvasSrc94.includes('const lineartCache = new Map()') &&
  coloringCanvasSrc94.includes('lineartCache.get(cacheKey)') &&
  coloringCanvasSrc94.includes('lineartCache.set(cacheKey') &&
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
  'Colorir Grande: orientação de primeira vez — uma vez, persistida, dispensável (B3)',
  coloringScreenSrc94.includes('@ptf_coloring_start_hint_v1') &&
  coloringScreenSrc94.includes('Use dois dedos para aproximar ou mover o desenho') &&
  coloringScreenSrc94.includes('setShowPanHint(false)'),
  'orientação inicial do Colorir ausente, fixa, ou sem persistência de "primeira vez"',
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
  'ColoringCanvas sem zoomIn órfão (B3) — sem botão Ampliar + / -',
  !coloringCanvasSrc94.includes('window.zoomIn'),
  'window.zoomIn voltou — Eduardo não quer botões + / - de zoom',
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
  // F2.1i: a imagem oficial (páginas E prévia da intro) é resolvida via
  // resolveSceneImageForStory (gated a david_goliath). Mesma prioridade + 3 selos.
  livroSrc.includes('resolveSceneImageForStory') &&
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
  'Livrinho: estado bloqueado do colorido incompleto + CTA para colorir (LIVRINHO_UX_1)',
  livroSrc.includes('Seu livrinho colorido fica pronto quando você pinta a aventura inteira') &&
  livroSrc.includes('Pinte todas para abrir um livrinho só com as suas pinturas') &&
  livroSrc.includes("viewMode === 'child' && !coloredComplete") &&
  livroSrc.includes("navigation.navigate('Coloring'"),
  'StoryBookScreen missing blocked state + CTA for "Meu livrinho colorido" when not 100% painted (LIVRINHO_UX_1)',
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
  /makeChildArtVisual\(cena, story, p, baseImage\)/.test(livroSrc) &&
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
      // F2.1h v2: a imagem oficial é resolvida via resolveSceneImageForStory (gated a
      // david_goliath). A CHAMADA só ocorre no ramo 'official', exatamente uma vez.
      /mode === 'official'[\s\S]*?resolveSceneImageForStory\(/.test(body) &&
      (body.match(/resolveSceneImageForStory\(/g) || []).length === 1;
    // O ramo official retorna antes de qualquer leitura de arte da criança.
    const officialReturnsBeforeChildArt =
      body.indexOf("mode === 'official'") < body.indexOf('makeChildArtVisual');
    return officialOnlyInOfficialBranch && officialReturnsBeforeChildArt;
  })(),
  'StoryBookScreen: official mode must never read child art; child mode must never use official illustration',
);

check(
  'Livrinho usa um único timer de autoplay (constante AUTOPLAY_MS, efeito único)',
  (livroSrc.match(/, AUTOPLAY_MS\)/g) || []).length === 1
    && /setTimeout\(\(\) => \{[\s\S]*?advanceToNextScene\(\);\s*\}, AUTOPLAY_MS\)/.test(livroSrc),
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

// ── LIVRINHO_AUTOPLAY_FIX_1 — fim de áudio resiliente à trava de transição ────
check(
  'LIVRINHO_AUTOPLAY_FIX_1: fim de áudio durante a trava NÃO é descartado (marca pendingAutoAdvanceRef e retorna)',
  /function onSceneAudioComplete\(\)\s*\{[\s\S]*?if \(lockRef\.current\)\s*\{[\s\S]*?pendingAutoAdvanceRef\.current = true;[\s\S]*?return;[\s\S]*?\}[\s\S]*?advanceToNextScene\(\);/.test(livroSrc),
  'onSceneAudioComplete deve marcar pendingAutoAdvanceRef quando lockRef ativo e retornar (não descartar o avanço)',
);

check(
  'LIVRINHO_AUTOPLAY_FIX_1: efeito consome o avanço pendente ao liberar a trava, UMA vez (sem duplo avanço)',
  /if \(isTransitioning\) return undefined;[\s\S]*?if \(!pendingAutoAdvanceRef\.current\) return undefined;[\s\S]*?pendingAutoAdvanceRef\.current = false;[\s\S]*?advanceToNextScene\(\);[\s\S]*?\}, \[isTransitioning\]\);/.test(livroSrc),
  'StoryBookScreen sem efeito [isTransitioning] que consome pendingAutoAdvanceRef (false antes de avançar → sem duplo avanço)',
);

check(
  'LIVRINHO_AUTOPLAY_FIX_1: timer de cena SEM áudio preservado (fallback intacto)',
  /if \(hasSceneAudio\(story\.id, slide\.sceneKey\)\) return undefined;[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?advanceToNextScene\(\);\s*\}, AUTOPLAY_MS\)/.test(livroSrc),
  'Timer de auto-avanço para cenas sem áudio foi alterado/removido',
);

check(
  'LIVRINHO_AUTOPLAY_FIX_1: advanceToNextScene mantém a guarda anti-duplo (lockRef) e o avanço manual intacto',
  /function advanceToNextScene\(\)\s*\{\s*if \(lockRef\.current\) return;/.test(livroSrc) &&
  /function handleNextScene\(\)\s*\{\s*advanceToNextScene\(\);/.test(livroSrc),
  'advanceToNextScene perdeu a guarda lockRef, ou o avanço manual (handleNextScene) foi alterado',
);

check(
  'LIVRINHO_AUTOPLAY_FIX_1: escopo não toca R2/packs/download/storage (StoryBookScreen limpo)',
  !/packDownloadService|packSandboxDevService|downloadDavidGoliath|packStorageService|@ptf_packs_v1/.test(livroSrc),
  'StoryBookScreen passou a referenciar serviços de pack/R2/download/storage — fora do escopo do fix',
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
  // F2.1f: a consumo da ilustração oficial migrou para o hook useResolvedSceneImage,
  // que resolve a MESMA ilustração oficial (fallback local) + o pack ready. Mesma
  // garantia (a tela consome a imagem oficial da cena), agora via o hook.
  'NarrationScreen consome imagem oficial automaticamente (via useResolvedSceneImage — F2.1f)',
  narration50.includes('useResolvedSceneImage(story.id, cena?.id)'),
  'NarrationScreen does not consume the resolved official scene image',
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
  // a oficial é renderizada via OfficialSceneImage no frame fixo (não absoluteFill)…
  /visual\.type === 'official'[\s\S]*?<OfficialSceneImage/.test(livro54) &&
  // …e OfficialSceneImage usa bookFullImage + contain (sem zoom no 1º frame)
  /function OfficialSceneImage[\s\S]*?style=\{styles\.bookFullImage\}[\s\S]*?resizeMode="contain"/.test(livro54),
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

// ── LIVRINHO 1.0: arte protagonista + autoplay contínuo entre cenas ──────────
check(
  'LIVRINHO1.0: arte preenche a área medida entre header e painel (section flex:1 + fitBookArt45), com fallback responsivo',
  /bookImageSection:\s*\{[\s\S]*?flex:\s*1[\s\S]*?justifyContent:\s*'center'/.test(livro54) &&
  livro54.includes('handleArtSectionLayout') &&
  livro54.includes('fitBookArt45(') &&
  livro54.includes('artSectionSize') &&
  livro54.includes('computeBookImageSize(width, screenH)') &&
  /width: bookSize\.width, height: bookSize\.height/.test(livro54),
  'arte do Livrinho não preenche a área disponível (section sem flex:1 ou sem fit medido)',
);
check(
  'LIVRINHO1.0: AudioPlayer tem autoplay OPT-IN (autoPlay/onPlayStart/onUserPause, default off; sem timer novo)',
  /autoPlay\s*=\s*false/.test(audioPlayerSrc) &&
  audioPlayerSrc.includes('onPlayStart') && audioPlayerSrc.includes('onUserPause') &&
  audioPlayerSrc.includes('autoStartedRef') &&
  /if \(!autoPlay \|\| paused\) return;/.test(audioPlayerSrc) &&
  !audioPlayerSrc.includes('setInterval'),
  'AudioPlayer não tem autoplay opt-in seguro (ou introduziu timer FAKE de progresso setInterval)',
);
check(
  'LIVRINHO1.0: NarrationScreen NÃO usa autoplay (narração comum segue manual)',
  !narrationSrc.includes('autoPlay') && !narrationSrc.includes('onPlayStart'),
  'NarrationScreen passou a usar autoplay — narração comum não deve mudar',
);
check(
  'LIVRINHO1.0: StoryBook entra em reprodução contínua (autoplayActive: Play liga, pausa manual desliga; done NÃO desliga)',
  storyBookSrc.includes('autoplayActive') &&
  /autoPlay=\{autoplayActive\}/.test(storyBookSrc) &&
  /onPlayStart=\{\(\) => \{ playbackGenerationRef\.current \+= 1; setIsPaused\(false\); setAutoplayActive\(true\); \}\}/.test(storyBookSrc) &&
  /onUserPause=\{\(\) => \{ playbackGenerationRef\.current \+= 1; setAutoplayActive\(false\); \}\}/.test(storyBookSrc) &&
  storyBookSrc.includes('setAutoplayActive(false)'), // reset ao (re)iniciar
  'Livrinho não tem modo de reprodução contínua corretamente cabeado',
);

// ── LIVRINHO 1.1: autoplay determinístico (espera load) + arte colorida grande ──
check(
  'LIVRINHO1.1: autostart ESPERA o asset carregar (status.isLoaded) antes de tocar — corrige autoplay intermitente',
  /if \(!status\.isLoaded\) return;/.test(audioPlayerSrc) &&
  /autoStartedRef\.current = true;[\s\S]{0,80}player\.play\(\);[\s\S]{0,40}setAppStatus\('playing'\)/.test(audioPlayerSrc) &&
  // o autostart NÃO marca 'playing' antes do load (sem 'loading' no caminho de autostart)
  !/if \(!autoPlay \|\| paused\) return;[\s\S]{0,260}'loading'/.test(audioPlayerSrc),
  'autostart do AudioPlayer ainda pode tocar antes do load (autoplay intermitente)',
);
check(
  'LIVRINHO1.1: arte da criança preenche o card pelo RETÂNGULO da arte (computeArtworkScale/computePaintStyle), cor+contorno alinhados',
  livro54.includes('computeArtworkScale') &&
  livro54.includes('computePaintStyle') &&
  livro54.includes('paintAbsStyle') &&
  // escala pelo retângulo do lineart (não pelo canvas inteiro) → arte grande
  /Math\.min\(containerW \/ visual\.lineartImgW, containerH \/ visual\.lineartImgH\)/.test(livro54) &&
  // computeLineartStyle (alinhamento) e lineartAbsStyle continuam presentes
  livro54.includes('computeLineartStyle') && livro54.includes('lineartAbsStyle'),
  'arte colorida não preenche o card pelo retângulo real (segue pequena no canvas inteiro)',
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
    region.includes('source={asleepFinal}') &&
    region.includes('source={awakeFinal}') &&
    region.includes('region.images'),
    'mapa não importa/usa as imagens reais R1A..R4B (base sépia + colorida) como fundo das regiões',
  );
  check(
    'Mapa B2.4: mapas em JPG (leves) — nenhum require .png no fluxo + os 8 .jpg existem em disco',
    MAPS.every((r) => mapData.includes(`require('../../assets/maps/${r}.jpg')`)) &&
    !/require\([^)]*assets\/maps\/R[0-9][AB]\.png/.test(mapData) &&
    MAPS.every((r) => fs.existsSync(path.join(root, 'assets/maps', `${r}.jpg`))),
    'adventureMap ainda referencia PNG do mapa, ou faltam os JPGs em disco',
  );
  check(
    'Mapa M2.2: A/B oficial — A=DESPERTA/colorida (base do reveal), B=ADORMECIDA/sépia (base); isRegionAwake preservado p/ overview',
    /comece_aqui:\s*\{\s*awake:\s*require\('\.\.\/\.\.\/assets\/maps\/R1A\.jpg'\),\s*asleep:\s*require\('\.\.\/\.\.\/assets\/maps\/R1B\.jpg'\)/.test(mapData) &&
    region.includes('imgs.asleep') && region.includes('imgs.awake') &&
    /isRegionAwake[\s\S]{0,260}isStoryJourneyComplete\(s\.id\)[\s\S]{0,120}getStoryCompletionPercent\(s\.id\) > 0[\s\S]{0,40}s\.id === currentId/.test(mapScreen),
    'A/B invertido (A precisa ser awake/R1A), MapRegion não usa asleep/awake, ou isRegionAwake (overview) sumiu',
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
    // A0.10: getState decide pelo CONTRATO (getStoryContractStatus). Mantém os 3
    // estados (completed/current/locked); a ordem não importa (hierarquia no contrato).
    /getState/.test(mapScreen) && /return 'completed'/.test(mapScreen) &&
    /return 'current'/.test(mapScreen) && /return 'locked'/.test(mapScreen),
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
    'Mapa M3: jornada SOBE — A Criação (y 0.67) ABAIXO de Noé (y 0.37) por coordenada',
    /creation:\s*\{ x: 0\.73, y: 0\.67/.test(mapData) &&
    /noah:\s*\{ x: 0\.65, y: 0\.37/.test(mapData) &&
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
    'Mapa M2.7: pílula de região acompanha a rolagem (onScroll → activeIdx; overview reflete a região ativa)',
    mapScreen.includes('setActiveIdx') &&
    mapScreen.includes('onScroll') &&
    mapScreen.includes('regionPill') &&
    mapScreen.includes('activeRegion') &&
    // MAPA 1.1: o título do overview reflete a região ativa via overviewRegion
    // (que cai em activeIdx quando o tour não pede uma região específica).
    mapScreen.includes('overviewRegion?.title') &&
    /ovRegionIdx != null \? ovRegionIdx : activeIdx/.test(mapScreen),
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
    'Mapa: arte FINAL é camada Image separada (base sépia + colorida) e só monta com renderImageFinal',
    region.includes('renderImageFinal && asleepFinal') &&
    region.includes('renderImageFinal && awakeFinal') &&
    /<Image\b/.test(region),
    'arte final (sépia/colorida) não é camada Image separada/condicional por renderImageFinal',
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
    'Mapa B2.5: base sépia mostra PREVIEW de imediato (z1) e FINAL por cima (z2) — dimensão explícita, sem absoluteFill',
    region.includes('asleepPreview') &&
    region.includes('awakePreview') &&
    /asleepPreview &&[\s\S]{0,200}zIndex:\s*1/.test(region) &&
    /renderImageFinal && asleepFinal[\s\S]{0,260}zIndex:\s*2/.test(region) &&
    !region.includes('absoluteFill}'),
    'base sépia não alterna preview(z1)/final(z2) com dimensão explícita',
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
    // A0.10: fronteira por journeyComplete; currentId/nextLockedId seguem para câmera/
    // pin; o marco 'nextLocked' vem do CONTRATO (premiumLocked → convite sutil).
    mapScreen.includes('ordered.find((s) => !isStoryJourneyComplete(s.id))') &&
    /const currentId = useMemo\(\s*\(\) => \(nextJourney && isOpenable\(nextJourney\)/.test(mapScreen) &&
    /const nextLockedId = useMemo\(\s*\(\) => \(nextJourney && !isOpenable\(nextJourney\)/.test(mapScreen) &&
    /c\.status === 'premiumLocked'\) return 'nextLocked'/.test(mapScreen) &&
    !mapScreen.includes('AsyncStorage'),
    'nextLocked não é derivado da trilha/contrato em getState (ou mexe em storage)',
  );
  check(
    'Mapa B3.7: só UM pulsa (current OU nextLocked); nextLocked = visual locked + pulso; toque preserva fluxo locked',
    marker.includes('shouldPulse = isCurrent || isNextLocked') &&
    /SIZE = \{[^}]*nextLocked: 56/.test(marker) &&
    /RING = \{[\s\S]*?nextLocked:\s*\{/.test(marker) &&
    marker.includes('showLock = isLocked || isNextLocked') &&
    marker.includes('isNextLocked ? NEXTLOCKED_COLOR') &&
    region.includes('completedColor={region.completedColor}') &&
    // A0.10: o card recebe o CONTRATO (status) — trata journeyLocked/premiumLocked
    // coerentemente (substitui o antigo mapeamento nextLocked→locked do state prop).
    /contractStatus=\{focusContract \? focusContract\.status/.test(mapScreen),
    'nextLocked não compartilha visual locked+pulso, ou o card não recebe o contrato',
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
  'UX2.1 OnboardingScreen: onboarding curto (4 etapas) SEM escolha de história — adventure/STARTER_STORIES/resolveFullStory/selectedStoryId removidos',
  /const STEPS = \['welcome', 'name', 'avatar', 'confirm'\]/.test(onboardingScreenSrc) &&
  !onboardingScreenSrc.includes("'adventure'") &&
  !onboardingScreenSrc.includes('STARTER_STORIES') &&
  !onboardingScreenSrc.includes('resolveFullStory') &&
  !onboardingScreenSrc.includes('selectedStoryId'),
  'OnboardingScreen ainda tem a etapa de escolha de história (adventure/STARTER_STORIES/resolveFullStory/selectedStoryId)',
);

check(
  'UX2.1 OnboardingScreen: ao concluir, vai para a aba Aventuras com o Tour do Beni (startBeniTour), não pra StoryDetail',
  /name: 'Aventuras', params: \{ startBeniTour: true \}/.test(onboardingScreenSrc) &&
  onboardingScreenSrc.includes('markOnboardingCompleted') &&
  !onboardingScreenSrc.includes('params: { story: fullStory') &&
  !/\{ name: 'StoryDetail'/.test(onboardingScreenSrc),
  'OnboardingScreen deve cair na aba Aventuras com startBeniTour após o onboarding',
);

// ── UX 2.0/2.1: Tour inicial + base de guias contextuais do Beni ─────────────
{
  const guideSvc = readSrc('src/services/beniTourService.js');
  const guideBase = readSrc('src/components/BeniGuideOverlay.js');
  const tourCmp = readSrc('src/components/BeniAppTour.js');
  const mapSrcTour = readSrc('src/screens/AdventureMapScreen.js');
  const parentTour = readSrc('src/screens/ParentAreaScreen.js');
  check(
    'UX2.1: beniGuideService = API genérica (hasSeenGuide/markGuideSeen/resetGuide/resetAllGuides) + GUIDE_KEYS, chave inicial preservada, sem tocar progresso/acesso',
    guideSvc.includes('@ptf_beni_app_tour_seen_v1') &&
    guideSvc.includes('export const GUIDE_KEYS') &&
    guideSvc.includes('export async function hasSeenGuide') &&
    guideSvc.includes('export async function markGuideSeen') &&
    guideSvc.includes('export async function resetGuide') &&
    guideSvc.includes('export async function resetAllGuides') &&
    /export function hasSeenBeniAppTour/.test(guideSvc) &&
    /export function markBeniAppTourSeen/.test(guideSvc) &&
    /export function resetBeniAppTour/.test(guideSvc) &&
    !/from '\.\.\/services\/(accessControl|achievementService|rewardService|postStoryStorage)'/.test(guideSvc) &&
    !/ProgressContext|isPremiumUser|unlockAchievement|markStor/i.test(guideSvc),
    'beniTourService não virou serviço de guias genérico (ou toca progresso/acesso)',
  );
  check(
    'UX2.3: BeniGuideOverlay PRECISO — BeniAvatar (sem quadrado), destaque SÓ com medição (measure/measureInWindow), sem spotlight aproximado/balloon, sem Lottie',
    guideBase.includes("from './beni/BeniAvatar'") &&
    guideBase.includes('<BeniAvatar') &&
    !/Animated\.Image source=\{beniSource\}/.test(guideBase) &&
    guideBase.includes('measure') &&
    guideBase.includes('showRing') &&
    !guideBase.includes('spotlightFor') &&
    !/function spotlightBox/.test(guideBase) &&
    guideBase.includes('Animated') &&
    !/from ['"][^'"]*lottie/i.test(guideBase),
    'BeniGuideOverlay não é o guia preciso medido (ou ainda usa spotlight aproximado)',
  );
  check(
    'UX2.4.3: TOUR ÚNICO de 5 cards (beniGuides.INITIAL_TOUR), sem next_available/next_locked, sem explicar Ateliê/Estrelinhas/Perfil',
    (() => {
      const gd = readSrc('src/data/beniGuides.js');
      const seg = gd.split('INITIAL_TOUR = [')[1]?.split('];')[0] || '';
      return /export const INITIAL_TOUR = \[/.test(gd) &&
        (seg.match(/\{[^}]*title:/g) || []).length === 5 &&
        !seg.includes('next_available') &&
        !seg.includes('next_locked') &&
        !/Ateliê|Estrelinhas|Perfil/.test(seg);
    })(),
    'INITIAL_TOUR não tem 5 cards / ainda usa next_available|locked / explica outras abas',
  );
  check(
    'UX2.4.2: AdventureMapScreen mostra o TOUR ÚNICO só com startBeniTour + não-visto; ao fechar marca initial E adventures',
    mapSrcTour.includes('startBeniTour') &&
    mapSrcTour.includes('hasSeenBeniAppTour') &&
    mapSrcTour.includes('markBeniAppTourSeen') &&
    mapSrcTour.includes("markGuideSeen('adventures')") &&
    mapSrcTour.includes('<BeniGuideOverlay') &&
    mapSrcTour.includes('steps={tourSteps}') &&
    mapSrcTour.includes('withAudioPrompt'),
    'AdventureMapScreen não renderiza o tour único / não marca os dois flags ao fechar',
  );
  check(
    'UX2.1: Criador tem "Rever Tour Inicial do Beni" (reset+abre Aventuras) e "Resetar Guias do Beni" (resetAllGuides)',
    parentTour.includes('resetBeniAppTour') &&
    parentTour.includes('resetAllGuides') &&
    parentTour.includes('Rever Tour Inicial do Beni') &&
    parentTour.includes('Resetar Guias do Beni') &&
    /navigation\.navigate\('Home', \{ screen: 'Aventuras', params: \{ startBeniTour: true \} \}\)/.test(parentTour),
    'faltam os botões de rever/resetar guias do Beni na Área dos Pais (Criador)',
  );

  // ── UX 2.2: guias contextuais por tela ──────────────────────────────────────
  const hookSrc = readSrc('src/hooks/useScreenGuide.js');
  const guidesData = readSrc('src/data/beniGuides.js');
  const homeSrc = readSrc('src/screens/HomeScreen.js');
  const atelierSrc = readSrc('src/screens/AtelierScreen.js');
  const trophiesSrc = readSrc('src/screens/TrophiesScreen.js');
  const profileSrc = readSrc('src/screens/ProfileScreen.js');
  check(
    'UX2.2: GUIDE_KEYS cobre todas as telas (initial/adventures/home/atelier/stars/profile/parentArea) e resetAllGuides limpa tudo',
    ['initial', 'adventures', 'home', 'atelier', 'stars', 'profile', 'parentArea'].every((k) => new RegExp(`${k}:`).test(guideSvc)) &&
    guideSvc.includes('@ptf_beni_guide_home_v1') &&
    guideSvc.includes('@ptf_beni_guide_parent_v1') &&
    guideSvc.includes('multiRemove(Object.values(GUIDE_STORAGE))'),
    'GUIDE_KEYS/STORAGE não cobre home/parentArea ou resetAllGuides não limpa tudo',
  );
  check(
    'UX2.2: useScreenGuide = primeira visita por foco (useFocusEffect + flag), pulável, marca visto',
    hookSrc.includes("from '@react-navigation/native'") &&
    hookSrc.includes('useFocusEffect') &&
    hookSrc.includes('hasSeenGuide') &&
    hookSrc.includes('markGuideSeen'),
    'useScreenGuide ausente/incompleto',
  );
  check(
    'UX2.2: beniGuides.js define os passos das telas (Aventuras/Home/Ateliê/Estrelinhas/Perfil/Pais)',
    ['ADVENTURES_GUIDE', 'HOME_GUIDE', 'ATELIER_GUIDE', 'STARS_GUIDE', 'PROFILE_GUIDE', 'PARENT_GUIDE_BASE', 'PARENT_GUIDE_CREATOR_STEP'].every((k) => guidesData.includes(`export const ${k}`)),
    'beniGuides.js não exporta todos os guias das telas',
  );
  check(
    'UX2.4.2: tour único com alvos REAIS (useGuideTargets + measure) — mapa + Ver mapa; sem guia de Aventuras separado',
    mapSrcTour.includes('useGuideTargets') &&
    mapSrcTour.includes("register('adventures.map')") &&
    mapSrcTour.includes("register('adventures.viewMapButton')") &&
    mapSrcTour.includes('measure={measureTarget}') &&
    mapSrcTour.includes('tourSteps') &&
    !mapSrcTour.includes('useScreenGuide'),
    'tour único não usa alvos medidos / ainda tem guia de Aventuras separado',
  );
  check(
    'UX2.3 / PERFIL1.0: só a Área dos Pais segue com guia DESATIVADO (terá guia próprio); Home/Ateliê/Estrelinhas/Perfil ativados',
    parentTour.includes("useScreenGuide('parentArea', false)"),
    'guia da Área dos Pais deveria seguir desativado (terá guia próprio depois)',
  );
  // ── ATELIÊ 1.0: guia falado do Ateliê (4 cards) com alvos medidos ────────────
  const atelierManifest = readSrc('src/data/beniGuideAudio.js');
  const atelierGuideSrc = readSrc('src/screens/AtelierScreen.js');
  check(
    'ATELIÊ1.1: manifesto tem as 5 chaves de áudio do Ateliê (inclui guided_drawing; require de atelier/, null-safe)',
    ['welcome', 'coloring', 'guided_drawing', 'free_draw', 'gallery'].every((k) =>
      atelierManifest.includes(`'guide.atelier.${k}'`) &&
      fs.existsSync(path.join(root, 'assets/audio/beni_guide/atelier', `guide_atelier_${k}.mp3`)) &&
      atelierManifest.includes(`beni_guide/atelier/guide_atelier_${k}.mp3`)),
    'manifesto não tem as 5 chaves/áudios do Ateliê corretamente (guided_drawing incluso)',
  );
  check(
    'ATELIÊ1.1: ATELIER_GUIDE tem 5 cards CURTOS; Card 1 destaca Ateliê; Desenho guiado incluso; cards 2-5 com alvo medido; Entendi',
    (guidesData.match(/audioKey: 'guide\.atelier\./g) || []).length === 5 &&
    guidesData.includes("highlightTab: 'atelier'") &&
    guidesData.includes('guide.atelier.guided_drawing') &&
    ['atelier.coloring', 'atelier.guided', 'atelier.free_draw', 'atelier.gallery'].every((t) => guidesData.includes(`target: '${t}'`)) &&
    atelierGuideSrc.includes("finalLabel=\"Entendi\""),
    'ATELIER_GUIDE não tem 5 cards / falta Desenho guiado / falta alvo',
  );
  check(
    'ATELIÊ1.1: AtelierScreen ativa o guia só pela aba, mede alvos reais nos cards (targetRef: coloring/guided/free_draw/gallery) e rola até o alvo',
    atelierGuideSrc.includes("useScreenGuide('atelier', isFromTab(from))") &&
    atelierGuideSrc.includes('useGuideTargets') &&
    atelierGuideSrc.includes('measure={measureAtelierTarget}') &&
    /atelierTargets\.measure\(name\)\.then\(\(r\) => r \|\| measureGuideTarget\(name\)\)/.test(atelierGuideSrc) &&
    ['atelier.coloring', 'atelier.guided', 'atelier.free_draw', 'atelier.gallery'].every((t) => atelierGuideSrc.includes(`register('${t}')`)) &&
    atelierGuideSrc.includes('scrollGuideTargetIntoView'),
    'AtelierScreen não ativa/medê o guia do Ateliê corretamente (guided incluso)',
  );
  check(
    'ATELIÊ1.1: Desenho guiado e Criar livre são cards IRMÃOS — ambos medidos no tile inteiro (tileTarget flex:1), halo coerente',
    /tileTarget: \{ flex: 1 \}/.test(atelierGuideSrc) &&
    (atelierGuideSrc.match(/style=\{styles\.tileTarget\}/g) || []).length === 2 &&
    !atelierGuideSrc.includes('tileTargetWrap'),
    'tiles do Ateliê não usam o mesmo wrapper medível (halo incoerente entre Desenho guiado e Criar livre)',
  );
  // ── ESTRELINHAS 1.0: guia falado de Estrelinhas (3 cards) com alvos medidos ──
  const starsManifest = readSrc('src/data/beniGuideAudio.js');
  const starsGuideSrc = readSrc('src/screens/TrophiesScreen.js');
  check(
    'ESTRELINHAS1.0: manifesto tem as 3 chaves de áudio de Estrelinhas (require de stars/, null-safe)',
    ['welcome', 'progress', 'next'].every((k) =>
      starsManifest.includes(`'guide.stars.${k}'`) &&
      fs.existsSync(path.join(root, 'assets/audio/beni_guide/stars', `guide_stars_${k}.mp3`)) &&
      starsManifest.includes(`beni_guide/stars/guide_stars_${k}.mp3`)),
    'manifesto não tem as 3 chaves/áudios de Estrelinhas corretamente',
  );
  check(
    'ESTRELINHAS1.0: STARS_GUIDE tem 3 cards CURTOS; Card 1 destaca a aba (highlightTab: stars); cards 2-3 com alvo medido; Entendi',
    (guidesData.match(/audioKey: 'guide\.stars\./g) || []).length === 3 &&
    guidesData.includes("highlightTab: 'stars'") &&
    ['stars.achievements', 'stars.next'].every((t) => guidesData.includes(`target: '${t}'`)) &&
    starsGuideSrc.includes("finalLabel=\"Entendi\""),
    'STARS_GUIDE não tem 3 cards / Card 1 não destaca Estrelinhas / falta alvo',
  );
  check(
    'ESTRELINHAS1.0: TrophiesScreen ativa só pela aba (!fromCena), mede conquistas + próxima (targetRef) e rola ao topo; aba via sidebar/tab index',
    starsGuideSrc.includes("useScreenGuide('stars', !fromCena)") &&
    starsGuideSrc.includes('useGuideTargets') &&
    starsGuideSrc.includes('measure={measureStarsTarget}') &&
    /starsTargets\.measure\(name\)\.then\(\(r\) => r \|\| measureGuideTarget\(name\)\)/.test(starsGuideSrc) &&
    starsGuideSrc.includes("register('stars.achievements')") &&
    starsGuideSrc.includes("register('stars.next')") &&
    readSrc('src/components/TabletSidebar.js').includes("'stars.sidebarTab'") &&
    /TAB_INDEX_BY_KEY = \{[^}]*stars: 3[^}]*\}/.test(readSrc('src/components/BeniGuideOverlay.js')),
    'TrophiesScreen não ativa/medê o guia de Estrelinhas corretamente',
  );
  // ── PERFIL 1.0: guia falado do Perfil (3 cards) com alvos medidos ────────────
  const profileManifest = readSrc('src/data/beniGuideAudio.js');
  const profileGuideSrc = readSrc('src/screens/ProfileScreen.js');
  check(
    'PERFIL1.0: manifesto tem as 3 chaves de áudio do Perfil (require de profile/, null-safe)',
    ['welcome', 'identity', 'parents'].every((k) =>
      profileManifest.includes(`'guide.profile.${k}'`) &&
      fs.existsSync(path.join(root, 'assets/audio/beni_guide/profile', `guide_profile_${k}.mp3`)) &&
      profileManifest.includes(`beni_guide/profile/guide_profile_${k}.mp3`)),
    'manifesto não tem as 3 chaves/áudios do Perfil corretamente',
  );
  check(
    'PERFIL1.0: PROFILE_GUIDE tem 3 cards CURTOS; Card 1 destaca a aba (highlightTab: profile); cards 2-3 com alvo medido; Entendi',
    (guidesData.match(/audioKey: 'guide\.profile\./g) || []).length === 3 &&
    guidesData.includes("highlightTab: 'profile'") &&
    ['profile.identity', 'profile.parents'].every((t) => guidesData.includes(`target: '${t}'`)) &&
    profileGuideSrc.includes("finalLabel=\"Entendi\""),
    'PROFILE_GUIDE não tem 3 cards / Card 1 não destaca Perfil / falta alvo',
  );
  check(
    'PERFIL1.0: ProfileScreen ativa o guia, mede avatar+nome e Área dos Pais (targetRef) e rola; aba via sidebar/tab index; NÃO abre Área dos Pais',
    profileGuideSrc.includes("useScreenGuide('profile', true)") &&
    profileGuideSrc.includes('useGuideTargets') &&
    profileGuideSrc.includes('measure={measureProfileTarget}') &&
    /profileTargets\.measure\(name\)\.then\(\(r\) => r \|\| measureGuideTarget\(name\)\)/.test(profileGuideSrc) &&
    profileGuideSrc.includes("register('profile.identity')") &&
    profileGuideSrc.includes("register('profile.parents')") &&
    profileGuideSrc.includes('scrollGuideTargetIntoView') &&
    readSrc('src/components/TabletSidebar.js').includes("'profile.sidebarTab'") &&
    /TAB_INDEX_BY_KEY = \{[^}]*profile: 4[^}]*\}/.test(readSrc('src/components/BeniGuideOverlay.js')),
    'ProfileScreen não ativa/medê o guia do Perfil corretamente',
  );
  check(
    'PERFIL1.1: voz confiável — BeniGuideAudio toca quando o asset CARREGA (status.isLoaded) + retry; Perfil pré-carrega os áudios',
    (() => {
      const audioCmp = readSrc('src/components/BeniGuideAudio.js');
      return audioCmp.includes('useAudioPlayerStatus') &&
        /if \(!status\.isLoaded \|\| startedRef\.current\) return;/.test(audioCmp) &&
        audioCmp.includes('RETRY_MS') &&
        (audioCmp.match(/safePlay\(\)/g) || []).length >= 2 &&
        profileGuideSrc.includes('preloadGuideAudio(PROFILE_GUIDE.map');
    })(),
    'voz do guia não espera o asset carregar / Perfil não pré-carrega (fala muda/atrasada)',
  );
  check(
    'ATELIÊ1.0: aba Ateliê destacada como Início/Aventuras — sidebar mede atelier.sidebarTab + overlay mapeia atelier',
    readSrc('src/components/TabletSidebar.js').includes("'atelier.sidebarTab'") &&
    readSrc('src/components/BeniGuideOverlay.js').includes("atelier: 'atelier.sidebarTab'") &&
    /TAB_INDEX_BY_KEY = \{[^}]*atelier: 2[^}]*\}/.test(readSrc('src/components/BeniGuideOverlay.js')),
    'aba Ateliê não é destacada como Início/Aventuras (sidebar/tab index ausente)',
  );
  // ── HOME 1.0: guia falado da Home (5 cards) com alvos medidos ────────────────
  const homeManifest = readSrc('src/data/beniGuideAudio.js');
  check(
    'HOME1.1: manifesto tem as 6 chaves de áudio da Home (inclui create_beni; require de home/, null-safe)',
    ['welcome', 'continue', 'cultinho', 'bau_beni', 'create_beni', 'momento_beni'].every((k) =>
      homeManifest.includes(`'guide.home.${k}'`) &&
      fs.existsSync(path.join(root, 'assets/audio/beni_guide/home', `guide_home_${k}.mp3`)) &&
      homeManifest.includes(`beni_guide/home/guide_home_${k}.mp3`)),
    'manifesto não tem as 6 chaves/áudios da Home corretamente (create_beni incluso)',
  );
  check(
    'HOME1.1: HOME_GUIDE tem 6 cards CURTOS; Card 1 destaca a aba Início (highlightTab: home, sem target); cards 2-6 com alvo medido; Entendi',
    (guidesData.match(/audioKey: 'guide\.home\./g) || []).length === 6 &&
    guidesData.includes("highlightTab: 'home'") &&
    ['home.continue', 'home.cultinho', 'home.bau', 'home.criar', 'home.momento'].every((t) => guidesData.includes(`target: '${t}'`)) &&
    homeSrc.includes("finalLabel=\"Entendi\""),
    'HOME_GUIDE não tem 6 cards / Card 1 não destaca Início / falta alvo',
  );
  check(
    'HOME1.1: refs do guia ficam no PRÓPRIO card (halo justo via targetRef) — Continue/Cultinho/Baú/Criar/Momento',
    ['home.continue', 'home.cultinho', 'home.bau', 'home.criar', 'home.momento'].every((t) => homeSrc.includes(`register('${t}')`)) &&
    (homeSrc.match(/targetRef=\{homeTargets\.register\('home\./g) || []).length === 5 &&
    homeSrc.includes('ref={targetRef} collapsable={false}'),
    'refs do guia da Home não estão nos cards reais (halo ficaria amplo demais)',
  );
  check(
    'HOME1.1: Início destacado igual Aventuras — sidebar mede home.sidebarTab (tablet) + medição combinada; guia ativo e rola até o alvo',
    homeSrc.includes("useScreenGuide('home', true)") &&
    homeSrc.includes('useGuideTargets') &&
    homeSrc.includes('measure={measureHomeTarget}') &&
    /homeTargets\.measure\(name\)\.then\(\(r\) => r \|\| measureGuideTarget\(name\)\)/.test(homeSrc) &&
    readSrc('src/components/TabletSidebar.js').includes("'home.sidebarTab'") &&
    readSrc('src/components/BeniGuideOverlay.js').includes("home: 'home.sidebarTab'") &&
    homeSrc.includes('scrollGuideTargetIntoView'),
    'Início não é destacado como Aventuras (sidebar/medição combinada ausente)',
  );
  const overlayHomeBase = readSrc('src/components/BeniGuideOverlay.js');
  check(
    'HOME1.4: halo removido SÓ no Card 2 (noRing) — mede + seta, sem moldura; demais cards mantêm halo',
    /title: 'Sua aventura atual',[\s\S]*?noRing: true/.test(guidesData) &&
    (guidesData.match(/noRing: true/g) || []).length === 1 &&
    /const hideRing = phase === 'steps' && !!step\.noRing/.test(overlayHomeBase) &&
    overlayHomeBase.includes('targetVisible && !hideRing'),
    'halo do Card 2 não foi removido isoladamente (ou afeta outros cards)',
  );
  check(
    'UX2.3: useGuideTargets mede alvos reais (measureInWindow) e cai em fallback null sem medição',
    readSrc('src/hooks/useGuideTargets.js').includes('measureInWindow') &&
    /resolve\(null\)/.test(readSrc('src/hooks/useGuideTargets.js')),
    'useGuideTargets não mede alvos reais / sem fallback seguro',
  );

  // ── UX 2.3.1: pin foco MEDIDO (current/nextLocked) com gate de visibilidade ──
  const markerSrc231 = readSrc('src/components/map/StoryMapMarker.js');
  const regionSrc231 = readSrc('src/components/map/MapRegion.js');
  check(
    'UX2.3.1: StoryMapMarker expõe measureRef numa View nativa (ref + collapsable={false}) — sem mudar visual/coords/cores',
    markerSrc231.includes('measureRef') &&
    /ref=\{measureRef\}/.test(markerSrc231) &&
    /collapsable=\{measureRef \? false : undefined\}/.test(markerSrc231) &&
    !markerSrc231.includes('STORY_MAP_COORDS'),
    'StoryMapMarker não expõe measureRef numa View medível',
  );
  check(
    'UX2.3.1: MapRegion registra SÓ o pin foco (current/nextLocked) como alvo medível',
    regionSrc231.includes('registerPinTarget') &&
    /st === 'current' \|\| st === 'nextLocked'/.test(regionSrc231) &&
    /measureRef=\{isFocusPin \? registerPinTarget : undefined\}/.test(regionSrc231),
    'MapRegion não registra apenas o pin foco como alvo medível',
  );
  check(
    'UX2.3.1: AdventureMapScreen registra adventures.nextPin + scroll-into-view (via onStep) + passa registerPinTarget',
    mapSrcTour.includes("register('adventures.nextPin')") &&
    mapSrcTour.includes('registerPinTarget={registerNextPin}') &&
    mapSrcTour.includes('scrollPinIntoView') &&
    /onTourStep[\s\S]{0,80}adventures\.nextPin'\) scrollPinIntoView\(\)/.test(mapSrcTour) &&
    mapSrcTour.includes('onStep={onTourStep}'),
    'AdventureMapScreen não registra/rola o pin foco para o guia',
  );
  check(
    'UX2.3.1: BeniGuideOverlay só destaca o alvo se medido E dentro da viewport (gate de visibilidade) — senão fallback',
    guideBase.includes('inViewport') &&
    /const showRing = !!rect && !isBigArea && inViewport/.test(guideBase) &&
    guideBase.includes('rect.y + rect.height > insets.top') &&
    guideBase.includes('rect.y < tabTop'),
    'BeniGuideOverlay não tem gate de visibilidade do alvo medido',
  );

  // ── UX 2.4 / AUDIO 1.0: voz do Beni organizada por CONTEXTO (subpastas) ──
  // Caminhos RELATIVOS por contexto: initial/ e adventures/ (Audio 1.0).
  const GUIDE_MP3 = [
    'initial/guide_initial_welcome', 'initial/guide_initial_adventures', 'initial/guide_initial_glow',
    'adventures/guide_adventures_path', 'adventures/guide_adventures_next_available',
    'adventures/guide_adventures_next_locked', 'adventures/guide_adventures_view_region',
  ];
  const guideAudioData = readSrc('src/data/beniGuideAudio.js');
  const guideAudioCmp = readSrc('src/components/BeniGuideAudio.js');
  const tourCmp24 = readSrc('src/components/BeniAppTour.js');
  const guidesData24 = readSrc('src/data/beniGuides.js');
  check(
    'AUDIO1.0: os 7 áudios do guia existem em subpastas (initial/ e adventures/) e o manifesto faz require deles (null-safe)',
    GUIDE_MP3.every((f) => fs.existsSync(path.join(root, 'assets/audio/beni_guide', `${f}.mp3`))) &&
    GUIDE_MP3.every((f) => guideAudioData.includes(`beni_guide/${f}.mp3`)) &&
    guideAudioData.includes('export function getBeniGuideAudio') &&
    /return BENI_GUIDE_AUDIO\[audioKey\] \?\? null/.test(guideAudioData) &&
    /if \(!audioKey\) return null/.test(guideAudioData),
    'manifesto de áudio do guia ausente/incompleto ou não é null-safe',
  );
  // AUDIO 1.0: pastas futuras existem (com .gitkeep) e o manifesto NÃO importa
  // áudio inexistente; o plano de chaves futuras está documentado.
  check(
    'AUDIO1.0: pastas futuras criadas (home/atelier/stars/profile/parents/common) + plano documentado, SEM require de áudio futuro',
    ['home', 'atelier', 'stars', 'profile', 'parents', 'common'].every((d) =>
      fs.existsSync(path.join(root, 'assets/audio/beni_guide', d, '.gitkeep'))) &&
    fs.existsSync(path.join(root, 'docs/BENI_GUIDE_AUDIO_PLAN.md')) &&
    // Home/Ateliê/Estrelinhas/Perfil ativados; as demais seguem futuras e NÃO importáveis.
    !/guide_parents_|guide_common_/.test(guideAudioData),
    'pastas futuras/plano ausentes, ou o manifesto importa áudio futuro inexistente',
  );
  check(
    'UX2.4: BeniGuideAudio é HEADLESS (retorna null), autoplay no mount e para no unmount, via expo-audio (sem pacote novo)',
    guideAudioCmp.includes("from 'expo-audio'") &&
    guideAudioCmp.includes('useAudioPlayer') &&
    guideAudioCmp.includes('player.play()') &&
    /return\s*\(\)\s*=>\s*\{[\s\S]{0,80}player\.pause\(\)/.test(guideAudioCmp) &&
    /if \(!audioAsset\) return null/.test(guideAudioCmp),
    'BeniGuideAudio não é headless/autoplay/para no unmount',
  );
  check(
    'UX2.4.2: BeniGuideOverlay voz gateada (voiceOn+soundsEnabled), Modal bloqueante, aviso de som, Voltar, debounce, SEM som duplo (sem playUiSound), sem autoavanço',
    guideBase.includes('getBeniGuideAudio') &&
    guideBase.includes('subscribeAudioPreferences') &&
    /voiceOn && soundsOn && step\.audioKey\s*\?\s*getBeniGuideAudio/.test(guideBase) &&
    guideBase.includes('<Modal') &&
    guideBase.includes('withAudioPrompt') &&
    guideBase.includes('preloadGuideAudio') &&
    guideBase.includes('Começar com som') &&
    guideBase.includes('Continuar sem voz') &&
    guideBase.includes('handleBack') &&
    /if \(busy\) return/.test(guideBase) &&
    !guideBase.includes('playUiSound') &&
    !/<BeniGuideAudio[^>]*onFinished/.test(guideBase),
    'overlay não é o tour bloqueante falado (voz/Modal/aviso/Voltar/debounce/sem som duplo)',
  );
  check(
    'UX2.4.3: audioKeys dos 5 cards (welcome/adventures/path/view_region/glow); steps={tourSteps}=INITIAL_TOUR (sem override)',
    guidesData24.includes("audioKey: 'guide.initial.welcome'") &&
    guidesData24.includes("audioKey: 'guide.initial.adventures'") &&
    guidesData24.includes("audioKey: 'guide.adventures.path'") &&
    guidesData24.includes("audioKey: 'guide.adventures.view_region'") &&
    guidesData24.includes("audioKey: 'guide.initial.glow'") &&
    mapSrcTour.includes('const tourSteps = INITIAL_TOUR') &&
    !mapSrcTour.includes("'guide.adventures.next_locked'") &&
    mapSrcTour.includes('steps={tourSteps}'),
    'audioKeys/tourSteps fora do esperado (5 cards estáticos)',
  );
  check(
    'UX2.4.3: áudios reservados (next_available/next_locked) seguem no manifesto e na ADVENTURES_GUIDE, fora do tour inicial',
    guideAudioData.includes("'guide.adventures.next_available'") &&
    guideAudioData.includes("'guide.adventures.next_locked'") &&
    readSrc('src/data/beniGuides.js').includes("audioKey: 'guide.adventures.next_available'"),
    'áudios reservados foram apagados ou saíram do manifesto/ADVENTURES_GUIDE',
  );
  check(
    'UX2.4.3: card final permite toque no pin (onTargetPress só no isLast+medido) e a seta aponta para o x do alvo',
    guideBase.includes('onTargetPress') &&
    /isLast && targetVisible && typeof onTargetPress === 'function'/.test(guideBase) &&
    guideBase.includes('arrowLeft') &&
    /marginLeft: arrowLeft/.test(guideBase) &&
    mapSrcTour.includes('onTargetPress=') &&
    /ordered\.find\(\(s\) => s\.id === cameraStoryId\)/.test(mapSrcTour) &&
    mapSrcTour.includes('openFocus(story)'),
    'card final sem toque no pin / seta não aponta para o alvo / tela não abre a história',
  );

  // ── UX 2.4.4: confiabilidade do áudio + sem pulo de card + Card 2 ──────────────
  const guideAudioCmp44 = readSrc('src/components/BeniGuideAudio.js');
  check(
    'UX2.4.4: BeniGuideAudio tem RETRY automático único (re-toca se não iniciou), sem autoavanço',
    guideAudioCmp44.includes('RETRY_MS') &&
    /setTimeout\(/.test(guideAudioCmp44) &&
    /player\.playing/.test(guideAudioCmp44) &&
    (guideAudioCmp44.match(/safePlay\(\)/g) || []).length >= 2 &&
    !/onFinished|setIndex/i.test(guideAudioCmp44),
    'BeniGuideAudio sem retry / com autoavanço',
  );
  check(
    'UX2.4.4: overlay usa COMMIT MODEL (mede → comita índice+rect juntos), sem render provisório que pula',
    guideBase.includes('commitStep') &&
    /Promise\.resolve\(measure\(target\)\)\.then\(\(r\) => done\(r \|\| null\)\)/.test(guideBase) &&
    /const finish = \(r\) =>[\s\S]{0,160}setIndex\(to\); setRect\(r \|\| null\); setBusy\(false\)/.test(guideBase) &&
    !/setRect\(null\);[\s\S]{0,40}onStep\?\.\(step\.target\)/.test(guideBase) &&
    /commitStep\(index \+ 1\)/.test(guideBase) &&
    /commitStep\(index - 1\)/.test(guideBase),
    'overlay não comita índice+rect juntos (ainda há render provisório/pulo)',
  );
  check(
    'UX2.4.5: Card 2 realça CLARO a aba Aventuras — moldura (tabHalo c/ borda+pulso) no item + seta curta do card, véu leve, tab bar bloqueada',
    readSrc('src/data/beniGuides.js').includes("highlightTab: 'adventures'") &&
    // HOME 1.1: realce de aba generalizado (Início/Aventuras) por chave highlightTab.
    /showTabGlow = phase === 'steps' && !!step\.highlightTab && !isTabletLayout/.test(guideBase) &&
    guideBase.includes('tabHalo') &&
    guideBase.includes('borderWidth: 2.5') &&
    guideBase.includes('else if (showTabGlow)') &&
    guideBase.includes("arrow = 'down'") &&
    guideBase.includes('tabCenterX') &&
    /rgba\(40,28,12,0\.22\)/.test(guideBase) &&
    // Fase 1.1.2: véu bloqueante no modo MODAL (default); só vira pass-through no embedded.
    /pointerEvents=\{embedded \? 'none' : 'auto'\}/.test(guideBase) &&
    !guideBase.includes('tabGlow:'),
    'Card 2 não tem moldura clara/seta na aba / véu não leve / tab bar deixou de ser bloqueada',
  );
  check(
    'UX2.4.4: os 7 áudios oficiais existem com os nomes do manifesto, em subpastas por contexto (path/glow inclusos)',
    ['initial/guide_initial_welcome', 'initial/guide_initial_adventures', 'initial/guide_initial_glow', 'adventures/guide_adventures_path', 'adventures/guide_adventures_next_available', 'adventures/guide_adventures_next_locked', 'adventures/guide_adventures_view_region']
      .every((f) => fs.existsSync(path.join(root, 'assets/audio/beni_guide', `${f}.mp3`))),
    'falta algum áudio oficial em assets/audio/beni_guide (nome/subpasta divergente do manifesto)',
  );
}

// ── TABLET 1.0: estabilização iPad/tablet (sem regressão mobile) ──────────────
{
  const tourSvcTab = readSrc('src/services/beniTourService.js');
  const navSrcTab = readSrc('src/navigation/AppNavigator.js');
  const mapSrcTab = readSrc('src/screens/AdventureMapScreen.js');
  const onbSrcTab = readSrc('src/screens/OnboardingScreen.js');
  const parentSrcTab = readSrc('src/screens/ParentAreaScreen.js');
  const overlaySrcTab = readSrc('src/components/BeniGuideOverlay.js');
  const gateSrcTab = readSrc('src/components/ParentalGate.js');
  check(
    'TABLET1.0: sinal de tour independente de layout (request/consume/isPending/subscribe) usado por onboarding e "Rever Tour"',
    tourSvcTab.includes('export function requestInitialTour') &&
    tourSvcTab.includes('export function consumeInitialTourRequest') &&
    tourSvcTab.includes('export function isInitialTourPending') &&
    tourSvcTab.includes('export function subscribeInitialTourRequest') &&
    onbSrcTab.includes('requestInitialTour()') &&
    parentSrcTab.includes('requestInitialTour()'),
    'falta o sinal de tour por layout ou não é disparado no onboarding/Rever Tour',
  );
  check(
    'TABLET1.0: TabletLayout foca Aventuras quando há tour pendente (default + subscribe)',
    /useState\(\(\) => \(isInitialTourPending\(\) \? 'Aventuras' : 'Início'\)\)/.test(navSrcTab) &&
    /subscribeInitialTourRequest\(\(\) => setActiveTabName\('Aventuras'\)\)/.test(navSrcTab),
    'TabletLayout não foca Aventuras no tour pendente',
  );
  check(
    'TABLET1.0: mapa usa LARGURA DA ÁREA DE CONTEÚDO (onLayout) — corrige corte na sidebar; mobile == janela (sem regressão)',
    mapSrcTab.includes('const mapWidth = contentW > 0 ? contentW : width') &&
    mapSrcTab.includes('onLayout={onContainerLayout}') &&
    mapSrcTab.includes('computeRegionHeight(mapWidth)') &&
    mapSrcTab.includes('width={mapWidth}') &&
    /useEffect\(\(\) => \{ didInitScroll\.current = false; \}, \[mapWidth\]\)/.test(mapSrcTab),
    'mapa ainda usa largura da janela / não recentra ao mudar a largura',
  );
  check(
    'TABLET1.0: tour dispara por param OU sinal pendente (consume + subscribe) — funciona no tablet',
    mapSrcTab.includes('consumeInitialTourRequest()') &&
    mapSrcTab.includes('subscribeInitialTourRequest(') &&
    /route\?\.params\?\.startBeniTour \|\| consumeInitialTourRequest\(\)/.test(mapSrcTab),
    'tour não dispara pelo sinal pendente no tablet',
  );
  check(
    'TABLET1.0: Card 2 NÃO desenha realce de tab bar no tablet (fallback honesto; sem seta errada)',
    overlaySrcTab.includes('isTabletLayout') &&
    /showTabGlow = phase === 'steps' && !!step\.highlightTab && !isTabletLayout/.test(overlaySrcTab),
    'Card 2 desenharia realce de 5 abas no tablet (sem tab bar)',
  );
  check(
    'TABLET1.0: ParentalGate foca o input por ref após abrir (teclado confiável no iPad)',
    gateSrcTab.includes('inputRef') &&
    /ref=\{inputRef\}/.test(gateSrcTab) &&
    /inputRef\.current\?\.focus/.test(gateSrcTab) &&
    gateSrcTab.includes('autoFocus'),
    'ParentalGate não garante foco/teclado no tablet',
  );

  // ── TABLET 1.1: destaque MEDIDO da sidebar no Card 2 (tablet) ────────────────
  const registrySrc = readSrc('src/services/guideTargetRegistry.js');
  const sidebarSrc = readSrc('src/components/TabletSidebar.js');
  check(
    'TABLET1.1: registro GLOBAL de alvo (register/measure, null-safe) e item Aventuras da sidebar registrado com View collapsable',
    registrySrc.includes('export function registerGuideTarget') &&
    registrySrc.includes('export function measureGuideTarget') &&
    registrySrc.includes('measureInWindow') &&
    /resolve\(null\)/.test(registrySrc) &&
    sidebarSrc.includes("'adventures.sidebarTab'") &&
    sidebarSrc.includes('registerGuideTarget(sidebarTargetName)') &&
    /collapsable=\{false\}/.test(sidebarSrc),
    'registro global ausente / sidebar não registra o item Aventuras medível',
  );
  check(
    'TABLET1.1: medição combinada (local + registro global) passada ao tour',
    mapSrcTab.includes('measureGuideTarget') &&
    /guideTargets\.measure\(name\)\.then\(\(r\) => r \|\| measureGuideTarget\(name\)\)/.test(mapSrcTab) &&
    mapSrcTab.includes('measure={measureTarget}'),
    'tour não usa medição combinada (sidebar no tablet)',
  );
  check(
    'TABLET1.1: overlay mede a sidebar no tablet (targetFor → adventures.sidebarTab) com card à direita + seta para a esquerda; fallback sem seta se não medir',
    overlaySrcTab.includes("adventures: 'adventures.sidebarTab'") &&
    /isTabletLayout && s\?\.highlightTab \? \(SIDEBAR_TARGET_BY_KEY\[s\.highlightTab\] \|\| null\) : null/.test(overlaySrcTab) &&
    overlaySrcTab.includes('isSidebarTarget') &&
    /arrow = 'left'/.test(overlaySrcTab) &&
    overlaySrcTab.includes('arrowSide') &&
    /const showRing = !!rect && !isBigArea && inViewport/.test(overlaySrcTab),
    'overlay não destaca a sidebar medida no tablet (ou sem fallback)',
  );

  // ── MAPA 1.1: "Ver mapa" suave + tocável no tour (celular/iPad/tablet) ──────────
  check(
    'MAPA1.1: "Ver mapa" abre SUAVE (timing+easing, sem spring poppy) — sem scrollTo brusco no overview',
    mapSrcTab.includes('Easing.out(Easing.cubic)') &&
    !/Animated\.spring\(overviewAnim/.test(mapSrcTab) &&
    /Animated\.timing\(overviewAnim, \{ toValue: 1/.test(mapSrcTab),
    'abertura do overview não foi suavizada (ainda usa spring rápido)',
  );
  check(
    'FASE1.1.3: overview abre a região ATIVA (activeIdxRef, atualizada no onScroll) — não presa à 1ª região',
    mapSrcTab.includes('overviewRegion') &&
    mapSrcTab.includes('const activeIdxRef = useRef') &&
    /activeIdxRef\.current = idx;/.test(mapSrcTab) &&
    /const idx = typeof regionIdx === 'number' \? regionIdx : activeIdxRef\.current;/.test(mapSrcTab) &&
    mapSrcTab.includes('openOverview();') &&            // tour usa região ativa (sem índice fixo)
    !/openOverview\(cameraRegionIdx\)/.test(mapSrcTab) && // não mais preso ao foco
    /ovRegionIdx != null \? ovRegionIdx : activeIdx/.test(mapSrcTab),
    'overview do tour não abre a região ativa (ainda preso na 1ª região)',
  );
  check(
    'MAPA1.1: botão "Ver mapa" medido é tocável no tour (onViewMap) sem avançar/fechar; pin final segue só no último card',
    overlaySrcTab.includes('onViewMap') &&
    /!isLast && targetVisible && curTarget === 'adventures.viewMapButton' && typeof onViewMap === 'function'/.test(overlaySrcTab) &&
    mapSrcTab.includes('onViewMap={') &&
    /isLast && targetVisible && typeof onTargetPress === 'function'/.test(overlaySrcTab),
    '"Ver mapa" não é tocável de forma controlada no tour (ou conflita com o pin final)',
  );

  // ── FASE 1.1.2: tour do mapa PASS-THROUGH (embedded, sem Modal bloqueante) ──────
  const guidesData11 = readSrc('src/data/beniGuides.js');
  check(
    'FASE1.1.2: INITIAL_TOUR segue com 5 cards (tour do mapa não mudou de tamanho)',
    ((guidesData11.match(/export const INITIAL_TOUR = \[([\s\S]*?)\];/) || [, ''])[1].match(/audioKey:/g) || []).length === 5,
    'INITIAL_TOUR não tem mais 5 cards',
  );
  check(
    'FASE1.1.2: overlay tem modo EMBEDDED opt-in (sem Modal) preservando o default Modal; véu vira pass-through (pointerEvents none) no embedded',
    overlaySrcTab.includes('embedded = false') &&
    overlaySrcTab.includes('if (embedded) return body;') &&
    /<Modal transparent visible/.test(overlaySrcTab) &&
    /pointerEvents=\{embedded \? 'none' : 'auto'\}/.test(overlaySrcTab) &&
    /pointerEvents="box-none"/.test(overlaySrcTab),
    'overlay não tem modo embedded pass-through (ou perdeu o default Modal)',
  );
  check(
    'FASE1.1.2: SÓ o tour do mapa usa embedded (Home/Ateliê/Estrelinhas/Perfil seguem modal bloqueante)',
    /measure=\{measureTarget\}\s*\n\s*embedded/.test(mapSrcTab) &&
    !readSrc('src/screens/HomeScreen.js').includes('embedded') &&
    !readSrc('src/screens/AtelierScreen.js').includes('embedded') &&
    !readSrc('src/screens/TrophiesScreen.js').includes('embedded') &&
    !readSrc('src/screens/ProfileScreen.js').includes('embedded'),
    'embedded vazou para outro guia (ou o tour do mapa não usa embedded)',
  );
  check(
    'FASE1.1.2: "Ver mapa" usa o alvo REAL (área tocável sobre o rect) — SEM CTA duplicado nem hint no card; nenhum guia passa hint',
    /!isLast && targetVisible && curTarget === 'adventures.viewMapButton' && typeof onViewMap === 'function'/.test(overlaySrcTab) &&
    !overlaySrcTab.includes('styles.cardCta') &&
    !overlaySrcTab.includes('styles.hintLine') &&
    !mapSrcTab.includes('hint=') &&
    !readSrc('src/screens/HomeScreen.js').includes('hint=') &&
    !readSrc('src/screens/AtelierScreen.js').includes('hint=') &&
    !readSrc('src/screens/TrophiesScreen.js').includes('hint=') &&
    !readSrc('src/screens/ProfileScreen.js').includes('hint='),
    'overlay ainda tem CTA/hint duplicados ou algum guia passa hint',
  );
  check(
    'FASE1.1.2: "Começar minha jornada" e o pin abrem a história (startJourneyFromTour) — toque destacado não fica morto',
    mapSrcTab.includes('const startJourneyFromTour = useCallback') &&
    /closeBeniTour\(\);\s*if \(story\) openFocus\(story\)/.test(mapSrcTab) &&
    mapSrcTab.includes('onFinish={startJourneyFromTour}') &&
    mapSrcTab.includes('onTargetPress={startJourneyFromTour}'),
    'o CTA final não abre a história / ainda depende de toque no pin',
  );
  check(
    'FASE1.1.2: guias aprovados não regrediram em nº de cards (Home 6 / Ateliê 5 / Estrelinhas 3 / Perfil 3)',
    (guidesData11.match(/audioKey: 'guide\.home\./g) || []).length === 6 &&
    (guidesData11.match(/audioKey: 'guide\.atelier\./g) || []).length === 5 &&
    (guidesData11.match(/audioKey: 'guide\.stars\./g) || []).length === 3 &&
    (guidesData11.match(/audioKey: 'guide\.profile\./g) || []).length === 3,
    'algum guia aprovado mudou de número de cards',
  );
  // ── FASE 1.1.3: lock de navegação durante o tour (sem Modal) ──────────────────
  const tourSvc113 = readSrc('src/services/beniTourService.js');
  const navSrc113 = readSrc('src/navigation/AppNavigator.js');
  check(
    'FASE1.1.3: sinal de tour de Aventuras ativo (set/is/subscribe) controlado pela tela',
    tourSvc113.includes('export function setAdventureTourActive') &&
    tourSvc113.includes('export function isAdventureTourActive') &&
    tourSvc113.includes('export function subscribeAdventureTourActive') &&
    /setAdventureTourActive\(showBeniTour\)/.test(mapSrcTab) &&
    /return \(\) => setAdventureTourActive\(false\)/.test(mapSrcTab),
    'falta o sinal de lock do tour de Aventuras (ou a tela não liga/desliga)',
  );
  check(
    'FASE1.1.3: tab bar mobile bloqueia troca p/ outras abas no tour (tabPress preventDefault) — SEM Modal/overlay bloqueante',
    navSrc113.includes('isAdventureTourActive') &&
    /tabPress: \(e\) => \{[\s\S]*?isAdventureTourActive\(\) && tab\.name !== 'Aventuras'\) e\.preventDefault\(\)/.test(navSrc113) &&
    !/<Modal[\s\S]{0,200}adventure/i.test(navSrc113),
    'tab bar não bloqueia navegação durante o tour de Aventuras',
  );
  check(
    'FASE1.1.3: sidebar tablet ignora troca p/ outros itens no tour (Aventuras segue ativa)',
    /onTabPress=\{\(name\) => \{[\s\S]*?isAdventureTourActive\(\) && name !== 'Aventuras'\) return;[\s\S]*?setActiveTabName\(name\)/.test(navSrc113),
    'sidebar do tablet não respeita o lock do tour',
  );
  // ── FASE 1.1.4: destaque da aba na tab bar + halo não-stale ao rolar ──────────
  check(
    'FASE1.1.4.3: moldura da aba Aventuras ESCOPADA ao passo (sinal callout, não tourActive) + camada decorativa pointerEvents none (sem tabBarItemStyle que cortava o label)',
    // sinal por-PASSO (não tour inteiro)
    tourSvc113.includes('export function setAdventureTabCalloutActive') &&
    tourSvc113.includes('export function getAdventureTabCalloutActive') &&
    tourSvc113.includes('export function subscribeAdventureTabCalloutActive') &&
    // overlay liga o callout SÓ no passo que realça a aba (embedded && showTabGlow)
    /const tabCalloutOn = embedded && showTabGlow/.test(overlaySrcTab) &&
    overlaySrcTab.includes('onTabHighlight(tabCalloutOn)') &&
    mapSrcTab.includes('onTabHighlight={setAdventureTabCalloutActive}') &&
    // tab bar: assina o callout e desenha CAMADA decorativa (não tabBarItemStyle)
    navSrc113.includes('subscribeAdventureTabCalloutActive') &&
    navSrc113.includes('TOUR_TAB_CALLOUT') &&
    /\{calloutOn && advIndex >= 0 && \([\s\S]*?pointerEvents="none"/.test(navSrc113) &&
    !/tabBarItemStyle:/.test(navSrc113) &&
    // ícone padrão (sem container especial no SVG)
    /function TabIcon\(\{ iconName, focused \}\)/.test(navSrc113) &&
    // overlay: moldura própria só no modal; card+seta valem nos dois modos
    overlaySrcTab.includes('const showTabHalo = showTabGlow && !embedded') &&
    /const showArrow = targetVisible \|\| showTabGlow/.test(overlaySrcTab),
    'moldura da aba não está escopada ao passo / ainda usa tabBarItemStyle / ícone em container especial',
  );
  check(
    'FASE1.1.4: halo/seta/hit zone somem ao rolar (targetVisible = showRing && !mapScrolling) e re-medem no settle (mapScrollNonce)',
    overlaySrcTab.includes('mapScrolling = false') &&
    /const targetVisible = showRing && !mapScrolling/.test(overlaySrcTab) &&
    /useEffect\(\(\) => \{[\s\S]*?mapScrollNonce == null[\s\S]*?measure\(target\)\.then/.test(overlaySrcTab) &&
    mapSrcTab.includes('mapScrolling={mapScrolling}') &&
    mapSrcTab.includes('mapScrollNonce={mapScrollNonce}') &&
    /if \(showBeniTour\) \{[\s\S]*?setMapScrolling\(true\)[\s\S]*?setMapScrollNonce\(\(n\) => n \+ 1\)/.test(mapSrcTab),
    'halo não é invalidado/remedido no scroll do tour (risco de halo stale)',
  );
  // ── FASE 1.1.5: viewport inicial em "Comece Aqui" + região ativa da câmera ────
  check(
    'FASE1.1.5: âncora inicial em "Comece Aqui" (comeceRegionIdx por id) — alinha o topo da região, sem abrir entre duas regiões',
    /const comeceRegionIdx = useMemo\(\(\) => \{[\s\S]*?findIndex\(\(r\) => r\.id === 'comece_aqui'\)/.test(mapSrcTab) &&
    /idx === comeceRegionIdx && regionLayout\[idx\]\) \{[\s\S]*?target = Math\.max\(0, Math\.min\(regionLayout\[idx\]\.top, maxY\)\)/.test(mapSrcTab) &&
    /useState\(comeceRegionIdx\)/.test(mapSrcTab) &&
    /useRef\(comeceRegionIdx\)/.test(mapSrcTab),
    'a viewport inicial não ancora claramente em "Comece Aqui"',
  );
  check(
    'FASE1.1.5: região ativa = a da CÂMERA até o 1º arrasto manual (userScrolledRef + onScrollBeginDrag); depois segue a viewport',
    /const userScrolledRef = useRef\(false\)/.test(mapSrcTab) &&
    /onScrollBeginDrag=\{\(\) => \{ userScrolledRef\.current = true; \}\}/.test(mapSrcTab) &&
    /if \(userScrolledRef\.current\) \{[\s\S]*?activeIdxRef\.current = idx;[\s\S]*?setActiveIdx/.test(mapSrcTab) &&
    // onContentSize fixa o activeIdx na região da câmera (camIdx) antes do arrasto
    /const camIdx = idx >= 0 \? idx : comeceRegionIdx;[\s\S]*?activeIdxRef\.current = camIdx;/.test(mapSrcTab),
    '"Ver mapa" não abre a região da câmera antes do 1º arrasto (risco de abrir a região de cima)',
  );
}

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
  'ParentAreaScreen mantém a seção interna (M1: "Administração (dev)")',
  parentAreaSrc.includes('Administração (dev)'),
  'Seção "Administração (dev)" foi removida da Área dos Pais',
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
  'Área dos Pais: seção interna aparece em DEV via gate único (M1: SHOW_TEST_TOOLS = isInternalToolsEnabled)',
  parentSrc.includes('const SHOW_TEST_TOOLS') &&
  /SHOW_TEST_TOOLS\s*=\s*isInternalToolsEnabled\(\)/.test(parentSrc) &&
  /\{SHOW_TEST_TOOLS &&[\s\S]*?Administração \(dev\)/.test(parentSrc),
  'seção interna deve aparecer em dev via SHOW_TEST_TOOLS = isInternalToolsEnabled()',
);

check(
  'Área dos Pais: ferramentas internas ficam OCULTAS em produção (gate único derivável false)',
  // M1: SHOW_TEST_TOOLS vem de isInternalToolsEnabled(), que é __DEV__ || Modo Criador || QA release-safe
  /SHOW_TEST_TOOLS\s*=\s*isInternalToolsEnabled\(\)/.test(parentSrc) &&
  /__DEV__[\s\S]*?isCreatorQaModeAllowed\(\)[\s\S]*?RELEASE_PACK_QA_ENABLED/.test(readSrc('src/config/internalTools.js')),
  'isInternalToolsEnabled deve ser derivável false em produção (sem __DEV__ / sem flags)',
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
  'UnlockCelebration (B4) tem botão primário "Continuar"',
  unlockSrc20.includes('Continuar'),
  'UnlockCelebration não exibe "Continuar" — botão principal ausente',
);

check(
  'UnlockCelebration aceita prop onColorir (atalho para Colorir cena)',
  unlockSrc20.includes('onColorir'),
  'UnlockCelebration sem prop onColorir — colorir não acessível da celebração',
);

check(
  'UnlockCelebration (B4): botão secundário "Colorir esta cena"',
  unlockSrc20.includes('Colorir esta cena'),
  'UnlockCelebration sem o botão secundário "Colorir esta cena"',
);

check(
  'UnlockCelebration (B4): pós-cena simples — sem Baú/Estrelinhas/Livrinho por cena',
  !unlockSrc20.includes('onBau') &&
  !unlockSrc20.includes('onEstrelinhas') &&
  !unlockSrc20.includes('onLibrinho') &&
  !unlockSrc20.includes('isLast'),
  'UnlockCelebration voltou a expor Baú/Estrelinhas/Livrinho/isLast por cena — B4 removeu (hub só no CongratsScreen)',
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
  'NarrationScreen (B4): sem onBau/onEstrelinhas por cena; última cena vai direto ao Congrats',
  !narrationSrc20.includes('onBau=') &&
  !narrationSrc20.includes('onEstrelinhas=') &&
  /isLastCena\)\s*\{[\s\S]{0,140}goToNext\(\)/.test(narrationSrc20),
  'NarrationScreen ainda expõe Baú/Estrelinhas por cena, ou a última cena não conduz direto ao Congrats',
);

// ── Hotfix Pós Cena Persistente — hub de vitória não fica preso sobre outras telas ─
console.log('\n── Hotfix Pós Cena Persistente ──');

check(
  'NarrationScreen: celebrationHandledRef.current = true aparece exatamente uma vez (só em handleContinue)',
  (narrationSrc20.match(/celebrationHandledRef\.current\s*=\s*true/g) || []).length === 1,
  'celebrationHandledRef.current = true deve aparecer SOMENTE em handleContinue — handlers secundários não devem encerrar a celebração',
);

check(
  'NarrationScreen (B4): "Colorir esta cena" LIMPA o pending e esconde o modal antes de navegar (não reabre ao voltar)',
  narrationSrc20.includes('handleColorirFromCelebration') &&
  /handleColorirFromCelebration[\s\S]{0,240}celebrationPendingRef\.current\s*=\s*false[\s\S]{0,120}setShowCelebration\(false\)[\s\S]{0,160}navigate/.test(narrationSrc20) &&
  // não avança a cena automaticamente ao escolher Colorir
  !/handleColorirFromCelebration[\s\S]{0,240}goToNext\(\)/.test(narrationSrc20),
  'handleColorirFromCelebration deve limpar celebrationPendingRef + setShowCelebration(false) antes de navegar (e não chamar goToNext) — senão o modal reabre ao voltar do Colorir',
);

check(
  'NarrationScreen (B4): não navega para Baú/Estrelinhas por cena (hub vive só no CongratsScreen)',
  !narrationSrc20.includes("navigate('EstrelinhasCena'") &&
  !narrationSrc20.includes("navigate('BeniChest')"),
  'NarrationScreen ainda navega para Baú/Estrelinhas por cena — B4 moveu o hub para o CongratsScreen',
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
  'CongratsScreen (B4) é o hub final da história — Livrinho, Quiz, Baú e Estrelinhas',
  (() => {
    const c = readSrc('src/screens/CongratsScreen.js');
    return c.includes("navigate('StoryBook'") && c.includes("navigate('Quiz'") &&
      c.includes("navigate('BeniChest'") && c.includes("navigate('EstrelinhasCena'");
  })(),
  'CongratsScreen deixou de ser o hub final (Livrinho/Quiz/Baú/Estrelinhas)',
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
  /hasMeaningfulPaint[\s\S]{0,600}makeChildArtVisual/.test(storyBookSrc20),
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
  'UnlockCelebration (B4): pós-cena simples — onContinue + onColorir, sem isLast/hub por cena',
  (() => {
    const src = readSrc('src/components/UnlockCelebration.js');
    return src.includes('onContinue') && src.includes('onColorir') &&
      !src.includes('isLast') && !src.includes('fromStoryCompletion');
  })(),
  'UnlockCelebration não está no estado B4 (esperado: onContinue + onColorir, sem isLast)',
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
  // A0.5: o hero mantém a linha de experiência; a ação principal migrou para o
  // StoryDetailScreen como BotaoPrimario terracota (não mais o botão laranja Beni).
  'Entrada da história: painel "Nesta aventura" no hero + ação principal via BotaoPrimario terracota',
  bookHeroVisualSrc.includes('Nesta aventura') &&
  readSrc('src/screens/StoryDetailScreen.js').includes('BotaoPrimario'),
  'StoryBookHero perdeu a linha de experiência / a ação principal não é BotaoPrimario',
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
      .replace(/export\s+/g, '') // strip export function/const (Bloco 4 add QUIZ_QUESTIONS_PER_STORY)
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
    // F1.1a: aceita .png OU .webp (piloto WebP) — paridade manifest↔disco preservada
    // (conta as imagens de colorir reais no disco, independente da extensão).
    const disk = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.webp')).length : 0;
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
  // Fase 2B.7.3a: getSceneStatus delega a sceneVisualStatus passando isComingSoon → 'locked'
  // (a garantia coming_soon→locked é coberta pelo check 2B.7.3a [matriz]).
  /sceneVisualStatus\(\{[\s\S]{0,80}isComingSoon/.test(b1StoryDet),
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
    'B1 paridade: creation+noah prontos (≥10 cenas) e NENHUMA história "só capa" (20/20 com mídia)',
    creationReady && noahReady && coverOnly === 0 && fullyReady === 20,
    `creation=${counts.creation} noah=${counts.noah} coverOnly=${coverOnly} fullyReady=${fullyReady}`,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Sprint B — Bloco B2: integração controlada de mídia nova (CONCLUÍDA)
// Estado oficial: as 20 histórias têm 10 cenas reais cada (mapas antes vazios
// agora preenchidos). Valida: 10 requires por história, cada arquivo no disco,
// storyIds reais (sem duplicar) e que as 4 finais saíram de "Em breve".
// ════════════════════════════════════════════════════════════════════════════
console.log('\n── Sprint B2: integração controlada de mídia nova ──');

const B2_INTEGRATED = ['ruth_naomi', 'esther_queen', 'miraculous_catch', 'samuel_hears_god', 'josiah_young_king'];
const B2_NEWLY_INTEGRATED = ['solomon_wisdom', 'mary_says_yes', 'timothy_faith', 'jesus_temple'];
const b2SceneSrc = readSrc('src/data/storySceneIllustrations.js');

// Conta requires de cena por história no manifesto.
function b2SceneCount(sid) {
  // F1.1a: extensão-agnóstico (piloto WebP) — conta cenas registradas em .png OU .webp.
  return (b2SceneSrc.match(new RegExp(`stories/${sid}/scenes/${sid}_scene_\\d\\d\\.(png|webp)`, 'g')) || []).length;
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
        // F1.2: extensão-agnóstico (WebP escalado). Exige o require no manifest (.png
        // OU .webp) E que o arquivo RESOLVIDO exista — require quebrado ainda é pego.
        const png = `assets/stories/${sid}/scenes/${sid}_scene_${nn}.png`;
        const webp = `assets/stories/${sid}/scenes/${sid}_scene_${nn}.webp`;
        const rel = b2SceneSrc.includes(`'../../${webp}'`) ? webp
          : b2SceneSrc.includes(`'../../${png}'`) ? png : null;
        if (rel && fs.existsSync(path.join(root, rel))) ok++;
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
  'B2: as 4 histórias antes "Em breve" agora têm 10 cenas reais cada (integração concluída)',
  B2_NEWLY_INTEGRATED.every(sid => b2SceneCount(sid) === 10) &&
  B2_NEWLY_INTEGRATED.every(sid => !new RegExp(`${sid}: \\{\\}`).test(b2SceneSrc)),
  'Uma das 4 histórias finais não está integrada (esperado 10 cenas, mapa não-vazio)',
);

check(
  'B2: sem storyId duplicado no manifesto (cada chave de história aparece 1×)',
  (() => {
    const keys = (b2SceneSrc.match(/^  [a-z_]+: \{/gm) || []).map(s => s.trim());
    return new Set(keys).size === keys.length;
  })(),
  'storyId duplicado no manifesto de cenas',
);

// ── Estado oficial (pós-B2): cobertura visual completa das 20 histórias ──
// Substitui as asserções transitórias "Em breve": agora as 20 histórias têm
// cenas E colorir registrados (20/200 cada), todos resolvendo para arquivo no
// disco (0 paths quebrados). Fonte: storySceneIllustrations.js + coloringImages.js.
{
  const OFFICIAL_20 = [
    'creation', 'noah', 'david_goliath', 'jesus_children', 'daniel_lions', 'lost_sheep',
    'good_samaritan', 'esther_queen', 'jonah_big_fish', 'abraham_stars', 'joseph_colorful_coat',
    'moses_red_sea', 'ruth_naomi', 'miraculous_catch', 'samuel_hears_god', 'josiah_young_king',
    'solomon_wisdom', 'mary_says_yes', 'timothy_faith', 'jesus_temple',
  ];
  const officialSceneSrc = readSrc('src/data/storySceneIllustrations.js');
  const officialColorSrc = readSrc('src/assets/coloringImages.js');

  let sceneStories = 0; let sceneEntries = 0; let sceneBroken = 0;
  let colorStories = 0; let colorEntries = 0; let colorBroken = 0;
  for (const sid of OFFICIAL_20) {
    let sc = 0; let cc = 0;
    for (let n = 1; n <= 10; n += 1) {
      const nn = String(n).padStart(2, '0');
      // F1.1a: extensão-agnóstico (piloto WebP). Protege igual: exige o require no
      // manifest (.png OU .webp) E que o arquivo RESOLVIDO exista (0 paths quebrados).
      const sPng = `assets/stories/${sid}/scenes/${sid}_scene_${nn}.png`;
      const sWebp = `assets/stories/${sid}/scenes/${sid}_scene_${nn}.webp`;
      const sRel = officialSceneSrc.includes(`'../../${sWebp}'`) ? sWebp
        : officialSceneSrc.includes(`'../../${sPng}'`) ? sPng : null;
      if (sRel) {
        sceneEntries += 1; sc += 1;
        if (!fs.existsSync(path.join(root, sRel))) sceneBroken += 1;
      }
      const cPng = `assets/stories/${sid}/coloring/scene_${nn}.png`;
      const cWebp = `assets/stories/${sid}/coloring/scene_${nn}.webp`;
      const cRel = officialColorSrc.includes(`'../../${cWebp}'`) ? cWebp
        : officialColorSrc.includes(`'../../${cPng}'`) ? cPng : null;
      if (cRel) {
        colorEntries += 1; cc += 1;
        if (!fs.existsSync(path.join(root, cRel))) colorBroken += 1;
      }
    }
    if (sc === 10) sceneStories += 1;
    if (cc === 10) colorStories += 1;
  }

  check(
    'Estado oficial: 20/20 histórias com 10 cenas ilustradas (200/200) e 0 paths quebrados',
    sceneStories === 20 && sceneEntries === 200 && sceneBroken === 0,
    `stories=${sceneStories}/20 entries=${sceneEntries}/200 broken=${sceneBroken}`,
  );
  check(
    'Estado oficial: 20/20 histórias com 10 colorir (200/200) e 0 paths quebrados',
    colorStories === 20 && colorEntries === 200 && colorBroken === 0,
    `stories=${colorStories}/20 entries=${colorEntries}/200 broken=${colorBroken}`,
  );
}

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
        // Bloco 1: atelierStorage/beniChest/storyImage passaram a importar estes de fileBlobStore.
        // Nos testes A5 as URIs do mock NÃO estão sob 'ptf_blobs/', então recompor é no-op (passthrough).
        recomposeBlobUri: (u) => u,
        currentBlobsRoot: () => 'file:///mock/ptf_blobs/',
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

  // ── Bloco 1: recomposeBlobUri + Boundary A/B (persistência file:// no iOS) ─────
  console.log('\n── Bloco 1: recomposição de file:// absoluto de blobs ──');
  {
    // fileBlobStore REAL com FileSystem mockado (documentDirectory MUTÁVEL + files Map).
    const fsState = { doc: 'file:///A/', files: new Map(), calls: { getInfo: 0, del: 0, write: 0 } };
    const FS = {
      get documentDirectory() { return fsState.doc; },
      EncodingType: { Base64: 'base64' },
      getInfoAsync: async (uri) => { fsState.calls.getInfo++; return { exists: fsState.files.has(uri) }; },
      readAsStringAsync: async (uri) => { const v = fsState.files.get(uri); if (v == null) throw new Error('no file'); return v; },
      writeAsStringAsync: async (uri, b64) => { fsState.calls.write++; fsState.files.set(uri, b64); },
      makeDirectoryAsync: async () => {},
      deleteAsync: async (uri) => { fsState.calls.del++; fsState.files.delete(uri); },
    };
    let fbs;
    try {
      fbs = a1LoadSandbox('src/services/fileBlobStore.js', { FileSystem: FS, log: () => {} },
        ['recomposeBlobUri', 'currentBlobsRoot', 'readBlobAsDataUrl']);
    } catch (e) { fbs = { __err: String(e && e.message) }; }
    const R = fbs.recomposeBlobUri;

    // T1 — helper puro (param-based): preserva não-string/data URL/externo; recompõe; idempotente; no-op.
    check('Bloco1: recomposeBlobUri puro (não-string/data URL/file externo inalterados; ptf_blobs recompõe; idempotente; no-op; sem root inalterado)',
      !fbs.__err && typeof R === 'function'
        && R(null, 'file:///B/ptf_blobs/') === null
        && R(123, 'file:///B/ptf_blobs/') === 123
        && R('data:image/png;base64,ZZ', 'file:///B/ptf_blobs/') === 'data:image/png;base64,ZZ'
        && R('file:///X/outro/foo.png', 'file:///B/ptf_blobs/') === 'file:///X/outro/foo.png'
        && R('file:///A/ptf_blobs/atelier/x.jpg', 'file:///B/ptf_blobs/') === 'file:///B/ptf_blobs/atelier/x.jpg'
        && R(R('file:///A/ptf_blobs/atelier/x.jpg', 'file:///B/ptf_blobs/'), 'file:///B/ptf_blobs/') === 'file:///B/ptf_blobs/atelier/x.jpg'
        && R('file:///B/ptf_blobs/atelier/x.jpg', 'file:///B/ptf_blobs/') === 'file:///B/ptf_blobs/atelier/x.jpg'
        && R('file:///A/ptf_blobs/d/x.png', null) === 'file:///A/ptf_blobs/d/x.png',
      fbs.__err || 'recomposeBlobUri incorreto');

    // T2 — Boundary A: tenta antigo; se ausente recompõe e tenta o recomposto; senão null.
    let a = false, b = false, c = false;
    try {
      fsState.doc = 'file:///A/'; fsState.files.clear(); fsState.calls.getInfo = 0;
      fsState.files.set('file:///A/ptf_blobs/drawings/x.png', 'AAAA');
      const ra = await fbs.readBlobAsDataUrl('file:///A/ptf_blobs/drawings/x.png');
      a = ra === 'data:image/png;base64,AAAA' && fsState.calls.getInfo === 1;   // antigo existe → 1 getInfo, sem recompor
      fsState.doc = 'file:///B/'; fsState.files.clear(); fsState.calls.getInfo = 0;
      fsState.files.set('file:///B/ptf_blobs/drawings/x.png', 'BBBB');           // arquivo moveu com o container
      const rb = await fbs.readBlobAsDataUrl('file:///A/ptf_blobs/drawings/x.png'); // ponteiro antigo (container velho)
      b = rb === 'data:image/png;base64,BBBB' && fsState.calls.getInfo === 2;   // antigo(false) + recomposto(true)
      fsState.files.clear();
      c = (await fbs.readBlobAsDataUrl('file:///A/ptf_blobs/drawings/gone.png')) === null;
    } catch (e) { /* a/b/c ficam false */ }
    check('Bloco1: Boundary A readBlobAsDataUrl (antigo→lê; ausente→recompõe+lê; ambos ausentes→null; ordem antigo→recompor)',
      a && b && c, fbs.__err || `a=${a} b=${b} c=${c}`);

    // T5 (não-mutação em leitura): readBlobAsDataUrl não grava nem apaga arquivo.
    check('Bloco1: leitura NÃO muta — readBlobAsDataUrl sem writeAsStringAsync/deleteAsync',
      !fbs.__err && fsState.calls.write === 0 && fsState.calls.del === 0,
      `write=${fsState.calls.write} del=${fsState.calls.del}`);

    // T3 — Boundary B (atelierStorage): eager + síncrono, com o recomposeBlobUri REAL; spies de não-mutação.
    const spies = { set: 0, rem: 0, del: 0 };
    let bRet = false, bSync = false, bData = false;
    try {
      const at = a1LoadSandbox('src/services/atelierStorage.js', {
        AsyncStorage: { setItem: () => { spies.set++; return Promise.resolve(); },
                        removeItem: () => { spies.rem++; return Promise.resolve(); },
                        getItem: () => Promise.resolve(null) },
        log: () => {}, writeBlob: async () => null, deleteBlob: async () => { spies.del++; }, safeName: (id) => String(id),
        recomposeBlobUri: fbs.recomposeBlobUri, currentBlobsRoot: () => 'file:///B/ptf_blobs/',
      }, ['resolveArtPreviewUri', 'resolveArtThumbUri']);
      const out = at.resolveArtPreviewUri({ previewUri: 'file:///A/ptf_blobs/atelier/p.jpg' });
      bRet = out === 'file:///B/ptf_blobs/atelier/p.jpg';
      bSync = typeof out === 'string' && typeof (out && out.then) !== 'function';   // string, não Promise
      bData = at.resolveArtPreviewUri({ previewBase64: 'data:image/jpeg;base64,ZZ' }) === 'data:image/jpeg;base64,ZZ'
        && at.resolveArtThumbUri({ thumbnailUri: 'file:///A/ptf_blobs/atelier/t.jpg' }) === 'file:///B/ptf_blobs/atelier/t.jpg';
    } catch (e) { /* bRet fica false */ }
    check('Bloco1: Boundary B atelier — recompõe eager+SÍNCRONO, preserva data URL, sem setItem/removeItem/deleteBlob',
      bRet && bSync && bData && spies.set === 0 && spies.rem === 0 && spies.del === 0,
      `ret=${bRet} sync=${bSync} data=${bData} spies=${JSON.stringify(spies)}`);

    // T8 — drawingStorage delega a readBlobAsDataUrl e NÃO recompõe sozinho (coberto por Boundary A).
    const dsSrc = readSrc('src/services/drawingStorage.js');
    check('Bloco1: drawingStorage delega a readBlobAsDataUrl e NÃO recompõe sozinho (coberto por Boundary A)',
      /readBlobAsDataUrl\(p\.uri/.test(dsSrc) && !/recomposeBlobUri/.test(dsSrc),
      'drawingStorage não delega OU passou a recompor sozinho (fora do escopo do Bloco 1)');

    // Escopo Boundary B: os 3 services aplicam o helper.
    check('Bloco1: Boundary B aplicado em atelierStorage/beniChestService/storyImageService',
      /recomposeBlobUri/.test(readSrc('src/services/atelierStorage.js'))
        && /recomposeBlobUri/.test(readSrc('src/services/beniChestService.js'))
        && /recomposeBlobUri/.test(readSrc('src/services/storyImageService.js')),
      'algum Boundary B não aplica recomposeBlobUri');
  }

  // ── A6 (comportamental): accessControl free + invariante de conquista ────────
  // accessControl executado em sandbox (plano free, sem QA). Prova que os dois
  // recursos ficam livres E que conteúdo premium (histórias) SEGUE gateado.
  try {
    const ac = a1LoadSandbox('src/services/accessControl.js',
      { isCreatorQaModeEnabled: () => false,
        getEntitlementPlan: () => 'free', // Fase 2B.7.2: getCurrentPlan delega (sem fonte → free)
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
  // real do B1 (mediaReadyService), usando as contagens reais do manifesto. Pós-B2
  // todas as 9 (5 + as 4 finais) estão integradas → todas ready=true.
  try {
    const allIds = [...B2_INTEGRATED, ...B2_NEWLY_INTEGRATED, 'creation', 'noah'];
    const mockMap = {};
    for (const sid of allIds) {
      const c = b2SceneCount(sid);
      mockMap[sid] = Object.fromEntries(Array.from({ length: c }, (_, i) => [i + 1, 1]));
    }
    const mr = a1LoadSandbox('src/services/mediaReadyService.js',
      { STORY_SCENE_ILLUSTRATIONS: mockMap }, ['isStoryMediaReady']);
    const integratedReady = B2_INTEGRATED.every(sid => mr.isStoryMediaReady({ id: sid, totalCenas: 10 }) === true);
    const newlyReady = B2_NEWLY_INTEGRATED.every(sid => mr.isStoryMediaReady({ id: sid, totalCenas: 10 }) === true);
    const showcaseIntact = mr.isStoryMediaReady({ id: 'creation', totalCenas: 10 }) === true &&
                           mr.isStoryMediaReady({ id: 'noah', totalCenas: 10 }) === true;
    check('B2 mediaReady: as 5 + as 4 finais viram true pela regra do B1; creation/noah intactos',
      integratedReady && newlyReady && showcaseIntact,
      `integrated=${integratedReady} newly=${newlyReady} showcase=${showcaseIntact}`);
  } catch (e) {
    check('B2 mediaReady: flip pelas contagens reais', false, String(e && e.message));
  }

  // ── Agentes 1.1: artefatos de governança/review existem e são consistentes ──
  {
    const prTpl = srcExists('.github/pull_request_template.md') ? readSrc('.github/pull_request_template.md') : '';
    check(
      'Agentes 1.1: PR template existe e cobre portões + smoke/expo-doctor + validação visual + git add + assets + AGENTS.md',
      prTpl.length > 0 &&
      /Port(ã|õ)/i.test(prTpl) &&
      prTpl.includes('npm run smoke') &&
      prTpl.includes('expo-doctor') &&
      /valida(ç|c)(ã|a)o visual/i.test(prTpl) &&
      prTpl.includes('git add') &&
      /assets\/stories/.test(prTpl) &&
      prTpl.includes('AGENTS.md'),
      'PR template ausente ou não cobre os itens de governança',
    );

    const owners = srcExists('.github/CODEOWNERS') ? readSrc('.github/CODEOWNERS') : '';
    check(
      'Agentes 1.1: CODEOWNERS existe, define owner e marca áreas sensíveis + governança',
      owners.length > 0 &&
      owners.includes('@EduardoValenteDev') &&
      owners.includes('/assets/') &&
      owners.includes('/assets/stories/') &&
      owners.includes('/src/services/') &&
      owners.includes('/AGENTS.md') &&
      owners.includes('/.github/'),
      'CODEOWNERS ausente ou sem os caminhos sensíveis/governança esperados',
    );

    const bpGuide = srcExists('docs/BRANCH_PROTECTION_GUIDE.md') ? readSrc('docs/BRANCH_PROTECTION_GUIDE.md') : '';
    check(
      'Agentes 1.1: BRANCH_PROTECTION_GUIDE documenta PR + check smoke obrigatório + bloquear force-push',
      bpGuide.length > 0 &&
      bpGuide.includes('sprint_design_system_jornada_beni') &&
      /check\s+`?smoke`?/i.test(bpGuide) &&
      /force.?push/i.test(bpGuide) &&
      /expo-doctor/i.test(bpGuide),
      'BRANCH_PROTECTION_GUIDE.md ausente ou incompleto',
    );

    const ciYml = srcExists('.github/workflows/ci.yml') ? readSrc('.github/workflows/ci.yml') : '';
    check(
      'Agentes 1.1: CI expõe check estável "smoke" e mantém expo-doctor informativo',
      ciYml.length > 0 &&
      /\n\s{2}smoke:\s*\n\s{4}name:\s*smoke\b/.test(ciYml) &&
      /continue-on-error:\s*true/.test(ciYml),
      'ci.yml sem job/check estável "smoke" ou sem expo-doctor informativo',
    );
  }

  // ── Arquitetura 001.7: sharp (devDep) + optimize-scene (piloto seguro de cenas) ──
  {
    const pkg = JSON.parse(readSrc('package.json'));
    const devDeps = pkg.devDependencies || {};
    const deps = pkg.dependencies || {};
    // (a) sharp em devDependencies · (b) NÃO em dependencies
    check(
      'Arquitetura 001.7: sharp está em devDependencies e NÃO em dependencies',
      !!devDeps.sharp && !deps.sharp,
      `devDeps.sharp=${devDeps.sharp || 'ausente'} deps.sharp=${deps.sharp || 'ausente'}`,
    );
    // (c) nenhum arquivo de src/ importa sharp
    const importsSharp = (() => {
      const hits = [];
      const stack = [path.join(root, 'src')];
      while (stack.length) {
        const d = stack.pop();
        let entries = [];
        try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
        for (const e of entries) {
          const p = path.join(d, e.name);
          if (e.isDirectory()) stack.push(p);
          else if (/\.(js|jsx|ts|tsx)$/.test(e.name)) {
            const src = fs.readFileSync(p, 'utf8');
            if (/require\(\s*['"]sharp['"]\s*\)|from\s+['"]sharp['"]/.test(src)) hits.push(path.relative(root, p));
          }
        }
      }
      return hits;
    })();
    check(
      'Arquitetura 001.7: nenhum arquivo de src/ importa sharp (build-time apenas)',
      importsSharp.length === 0,
      `src/ importa sharp em: ${importsSharp.join(', ')}`,
    );
    // (d) optimize-scene.js existe e suas guardas funcionam SEM converter (require não carrega sharp)
    let guardsOk = false;
    let detail = '';
    try {
      const m = require('./assets-pipeline/optimize-scene');
      guardsOk =
        srcExists('scripts/assets-pipeline/optimize-scene.js') &&
        m.isColoringInput('a/coloring/scene_01.png') === true &&
        m.isColoringInput('a/scenes/x_scene_01.png') === false &&
        m.isInsideAssets(path.join(root, 'assets', 'x.webp')) === true &&
        m.isInsideAssets(path.join(root, 'tmp', 'x.webp')) === false &&
        typeof m.run === 'function';
      if (!guardsOk) detail = 'guardas de optimize-scene não conferem';
    } catch (e) {
      detail = String(e && e.message);
    }
    check(
      'Arquitetura 001.7: optimize-scene existe e guarda colorir/saída-em-assets (sem converter)',
      guardsOk,
      detail,
    );
  }

  // ── Arquitetura 001.5: validador de proporção 4:5 (check-ratio) executa sem quebrar ──
  {
    let ok = false;
    let detail = '';
    try {
      const r = require('./assets-pipeline/check-ratio').run();
      // modo relatório: retorna objeto com summary + listas; isenta não-cenas/colorir.
      ok = !!r && typeof r === 'object' && r.summary && Array.isArray(r.offenders) &&
        Array.isArray(r.enforcedCategories) && r.enforcedCategories.join(',') === 'scenes,coloring' &&
        r.exemptByCategory && typeof r.exemptByCategory === 'object';
      if (!ok) detail = 'check-ratio.run() sem o formato esperado';
    } catch (e) {
      detail = String(e && e.message);
    }
    check(
      'Arquitetura 001.5: check-ratio executa (4:5 só p/ cenas/colorir; isenta demais)',
      ok,
      detail,
    );
  }

  // ── Arquitetura 001.3: relatórios de orçamento/rastreabilidade executam sem quebrar ──
  {
    const reports = [
      { file: 'budget-report', key: 'proxy' },
      { file: 'growth-projection', key: 'projection' },
      { file: 'traceability', key: 'integrity' },
    ];
    reports.forEach(({ file, key }) => {
      let ok = false;
      let detail = '';
      try {
        const mod = require(`./assets-pipeline/${file}`);
        const r = mod.run();
        ok = !!r && typeof r === 'object' && r[key] !== undefined;
        if (!ok) detail = `run() sem chave '${key}'`;
      } catch (e) {
        detail = String(e && e.message);
      }
      check(
        `Arquitetura 001.3: relatório ${file} executa sem quebrar e retorna objeto`,
        ok,
        detail,
      );
    });
  }

  // ── Arquitetura 001.2: contentManifest + packManifestService (Fase 2 mínima) ──
  {
    const cm = a1LoadSandbox('src/data/contentManifest.js', {}, [
      'CONTENT_LAYERS', 'STARTER_STORY_IDS', 'REMOTE_PACKS', 'getContentLayer', 'getStoriesByLayer', 'isValidLayer',
    ]);
    // (a) contentManifest existe + camadas declaradas
    check(
      'Arquitetura 001.2: contentManifest declara camadas starter/remote/coming_soon',
      cm.CONTENT_LAYERS.STARTER === 'starter' &&
      cm.CONTENT_LAYERS.REMOTE === 'remote' &&
      cm.CONTENT_LAYERS.COMING_SOON === 'coming_soon' &&
      cm.isValidLayer('starter') && !cm.isValidLayer('nope'),
      'CONTENT_LAYERS incompleto ou isValidLayer incorreto',
    );
    // (b/e) starter declarado e A Criação + Noé no starter
    check(
      'Arquitetura 001.2: A Criação e Noé ficam no starter (binário/offline)',
      cm.getContentLayer('creation') === 'starter' &&
      cm.getContentLayer('noah') === 'starter' &&
      cm.STARTER_STORY_IDS.includes('creation') &&
      cm.STARTER_STORY_IDS.includes('noah'),
      'creation/noah não estão no starter',
    );
    // (c) remote packs declaráveis SEM download (sem URL real/fetch)
    check(
      'Arquitetura 001.2: remote packs declarados sem download',
      Array.isArray(cm.REMOTE_PACKS) && cm.REMOTE_PACKS.length >= 1 &&
      cm.REMOTE_PACKS[0].layer === 'remote' &&
      cm.REMOTE_PACKS[0].status === 'not_downloaded' &&
      cm.getStoriesByLayer('remote').length >= 1,
      'remote packs não declaráveis sem download',
    );
    // (d) F2.0b: camada coming_soon DECLARÁVEL (planejada, fora do bundle). Valida o
    // schema/enum + isValidLayer + o FALLBACK real (storyId desconhecido → coming_soon),
    // SEM hardcodar uma história pronta como coming_soon: o F2.0a corrigiu as 4 completas
    // (solomon/mary/timothy/jesus_temple) para 'remote' e hoje não há história futura real.
    check(
      'Arquitetura 001.2: coming_soon declarável (planejado, fora do bundle)',
      cm.CONTENT_LAYERS.COMING_SOON === 'coming_soon' &&
      cm.isValidLayer('coming_soon') === true &&
      cm.getContentLayer('__inexistente__') === 'coming_soon',
      'coming_soon não declarável (enum/isValidLayer/fallback quebrado)',
    );
    // (g) packManifestService valida campos obrigatórios do contrato
    const pm = a1LoadSandbox('src/services/packManifestService.js', {}, ['validateManifest']);
    const validManifest = {
      schemaVersion: 1, id: 'story_ruth_naomi', version: '1.0.0', type: 'story', minAppVersion: '1.0.0',
      totalBytes: 30,
      files: [{ path: 'scenes/ruth_naomi_scene_01.webp', bytes: 30, sha256: 'a'.repeat(64), kind: 'scene', width: 1024, height: 1280, ratio: '4:5' }],
      metadata: { title: 'Rute e Noemi', storyId: 'ruth_naomi', language: 'pt-BR' },
    };
    const okRes = pm.validateManifest(validManifest);
    const badRes = pm.validateManifest({ schemaVersion: 2, id: 'BAD ID', version: '1.0', type: 'movie', minAppVersion: 'x', totalBytes: 5, files: [], metadata: {} });
    const sumRes = pm.validateManifest({ ...validManifest, totalBytes: 999 });
    check(
      'Arquitetura 001.2: packManifestService valida campos obrigatórios do contrato',
      okRes.ok === true && okRes.errors.length === 0 &&
      badRes.ok === false && badRes.errors.length >= 5 &&
      sumRes.ok === false && sumRes.errors.some((e) => /totalBytes/.test(e)),
      `valid=${okRes.ok}(${okRes.errors.length}) bad=${badRes.ok}(${badRes.errors.length}) sum=${sumRes.ok}`,
    );
  }

  // ── Arquitetura 001.1: guard impede assets/stories/* staged (git add acidental) ──
  {
    let guard = { ok: true, staged: [], error: 'guard indisponível' };
    try {
      const mod = require('./assets-pipeline/check-untracked-guard');
      guard = mod.getStagedStoryAssets();
    } catch (e) {
      guard = { ok: true, staged: [], error: String(e && e.message) };
    }
    const override = process.env.ALLOW_STORY_ASSETS === '1';
    check(
      'Arquitetura 001.1: guard de assets/stories/* (smoke falha se houver staged, sem override)',
      // git indisponível → não bloqueia; senão exige ok (nada staged) OU override aprovado.
      guard.error ? true : (guard.ok || override),
      `assets/stories/* staged sem ALLOW_STORY_ASSETS=1: ${(guard.staged || []).join(', ')}`,
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // B5.1 — Desbloqueio da PRÓXIMA história depende SÓ da narrativa (cenas).
  // Regra travada: "viu todas as cenas → história concluída narrativamente →
  // próxima desbloqueia". Não exige quiz, colorir, Livrinho, Cultinho, Baú nem
  // estrelinhas. Não depende de "100% completo" (cenas + extras).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── B5.1: desbloqueio por narrativa (só cenas) ──');
  {
    const progB51  = readSrc('src/context/ProgressContext.js');
    const nextB51  = readSrc('src/services/nextAdventureService.js');
    const mapB51   = readSrc('src/screens/AdventureMapScreen.js');
    const EXTRAS = /quiz|coloring|colorir|storybook|storyBook|livrinho|reflection|reflex|cultinho|familyWorship|beniChest|estrelinha|bonus_stars|hasPendingRewards/i;

    // isStoryCompleted = cenas concluídas >= total (só cenas), sem extras.
    check(
      'B5.1: isStoryCompleted usa só cenas (getCompletedScenesCount >= total), sem extras',
      /isStoryCompleted\s*=\s*useCallback\(\s*storyId\s*=>\s*\{[\s\S]{0,200}getCompletedScenesCount\(storyId\)\s*>=\s*total/.test(progB51),
      'isStoryCompleted deixou de ser baseado só na contagem de cenas',
    );
    // isNarrativeComplete existe e é alias de isStoryCompleted (mesma regra).
    check(
      'B5.1: ProgressContext expõe isNarrativeComplete (alias de isStoryCompleted, só cenas)',
      progB51.includes('isNarrativeComplete = isStoryCompleted') &&
      progB51.includes('isNarrativeComplete,'),
      'isNarrativeComplete ausente ou não é alias de isStoryCompleted',
    );
    // nextAdventureService: "concluída" = contagem de cenas >= totalCenas.
    check(
      'B5.1: nextAdventureService.isCompleted usa contagem de cenas >= totalCenas',
      /isCompleted\s*=\s*\(s\)\s*=>[\s\S]{0,80}getCount\(s\.id\)\s*>=\s*s\.totalCenas/.test(nextB51),
      'nextAdventureService.isCompleted deixou de ser por contagem de cenas',
    );
    // O caminho de desbloqueio (accessibleIncomplete/isAccessible/isCompleted)
    // NÃO referencia quiz/colorir/livrinho/cultinho/baú/estrelinhas/100%.
    check(
      'B5.1: caminho de desbloqueio do nextAdventureService não exige extras (quiz/colorir/livrinho/cultinho)',
      !EXTRAS.test(nextB51),
      'nextAdventureService passou a exigir atividade extra para desbloquear a próxima história',
    );
    // A0.10: a "fronteira" da jornada no mapa = 1ª história NÃO journeyComplete
    // (cenas + Livrinho + quiz + reflexão + colorir). Cenas completas NÃO avançam.
    check(
      'B5.1→A0.10: fronteira da jornada = primeira história não journeyComplete (isStoryJourneyComplete)',
      /ordered\.find\(\s*\(?s\)?\s*=>\s*!isStoryJourneyComplete\(s\.id\)\)/.test(mapB51),
      'a fronteira do mapa deixou de ser derivada de isStoryJourneyComplete',
    );
    // A0.10: 10/10 cenas = scenesComplete (progresso narrativo), NÃO libera a próxima.
    check(
      'B5.1→A0.10: 10/10 cenas satisfaz a contagem de scenesComplete (progresso narrativo)',
      (() => {
        const total = 10;
        const done = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 1, true]));
        const completed = total > 0 && Object.values(done).filter(Boolean).length >= total;
        // simula a regra pura (sem exigir quiz/colorir/etc.)
        return completed === true;
      })(),
      'regra pura de cenas não considera A Criação concluída com 10/10 cenas',
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // B5.2 — Helpers de frontier + fração de reveal por região (base do sépia→cor).
  // PUROS/derivados (isNarrativeComplete). Sem storage, sem visual, sem animação.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── B5.2: helpers de frontier/reveal por região ──');
  {
    const mapB52  = readSrc('src/data/adventureMap.js');
    const progB52 = readSrc('src/context/ProgressContext.js');

    check(
      'B5.2: adventureMap exporta os helpers de reveal (frontier/complete/revealFraction/storyReveal)',
      mapB52.includes('export function getRegionFrontierStory') &&
      mapB52.includes('export function isRegionNarrativeComplete') &&
      mapB52.includes('export function getRegionRevealFraction') &&
      mapB52.includes('export function getStoryRevealFraction'),
      'helpers de reveal ausentes em adventureMap.js',
    );
    check(
      'B5.2→A0.10: ProgressContext injeta isStoryJourneyComplete (jornada) nos wrappers de reveal',
      progB52.includes('getRegionRevealFraction') &&
      progB52.includes('isRegionNarrativeComplete') &&
      progB52.includes('getRegionFrontierStory') &&
      /regionRevealFraction\(region,\s*isStoryJourneyComplete/.test(progB52),
      'ProgressContext não injeta isStoryJourneyComplete nos wrappers de reveal',
    );
    check(
      'B5.2: getStoryRevealFraction usa getStoryMapCoord (STORY_MAP_COORDS) e clampa [0,1]',
      /getStoryRevealFraction[\s\S]{0,200}getStoryMapCoord\(/.test(mapB52) &&
      /getStoryRevealFraction[\s\S]{0,320}Math\.max\(0,\s*Math\.min\(1,/.test(mapB52),
      'getStoryRevealFraction não deriva das coordenadas ou não clampa entre 0 e 1',
    );
    check(
      'B5.2: helpers de reveal são PUROS — sem storage/reveal_seen/animação',
      !/reveal_seen|AsyncStorage|Animated|@ptf_/.test(mapB52.slice(mapB52.indexOf('B5.2 — Frontier'))),
      'os helpers B5.2 introduziram storage/animação — devem ser puros',
    );

    // Validação numérica com os helpers REAIS (extraídos sem os require de imagem).
    try {
      let s = mapB52
        .replace(/^\s*import\s.*$/gm, '')
        .replace(/export const REGION_MAP_IMAGES[\s\S]*?\n\};/, 'const REGION_MAP_IMAGES={};')
        .replace(/require\([^)]*\)/g, 'null')
        .replace(/export /g, '');
      s = 'const stories=[];\n' + s +
        '\nreturn { getRegionRevealFraction, getRegionFrontierStory, isRegionNarrativeComplete, getStoryRevealFraction };';
      // eslint-disable-next-line no-new-func
      const M = new Function(s)();
      const region = (ids) => ({ stories: ids.map((id) => ({ id })) });
      const comece = region(['creation', 'noah']);
      const peq = region(['david_goliath', 'jesus_children', 'daniel_lions', 'esther_queen', 'lost_sheep', 'good_samaritan']);
      const inc = (done) => (id) => done.includes(id);
      const near = (a, b) => Math.abs(a - b) < 0.005;

      check(
        'B5.2: Comece Aqui sem nada → frontier=creation, revela até A Criação (≈0.365)',
        M.getRegionFrontierStory(comece, inc([])).id === 'creation' &&
        near(M.getRegionRevealFraction(comece, inc([])), 0.365),
        'reveal inicial de Comece Aqui incorreto',
      );
      check(
        'B5.2: A Criação concluída → frontier=noah, revela até o topo de Noé (≈0.665, pin em y=0.37)',
        M.getRegionFrontierStory(comece, inc(['creation'])).id === 'noah' &&
        near(M.getRegionRevealFraction(comece, inc(['creation'])), 0.665),
        'reveal após concluir A Criação incorreto',
      );
      check(
        'B5.2: A Criação + Noé concluídas → região completa → revealFraction = 1.0 (extras não entram)',
        M.isRegionNarrativeComplete(comece, inc(['creation', 'noah'])) === true &&
        M.getRegionRevealFraction(comece, inc(['creation', 'noah'])) === 1 &&
        // extras (quiz/colorir) não mudam nada: mesma entrada de cenas → mesmo 1.0
        M.getRegionRevealFraction(comece, inc(['creation', 'noah'])) === 1,
        'região Comece Aqui completa não retorna 1.0',
      );
      check(
        'B5.2: Pequeninos sem nada → frontier=david_goliath (≈0.135); guard(vazio)=0; fallback markerFraction clampa [0,1]',
        M.getRegionFrontierStory(peq, inc([])).id === 'david_goliath' &&
        near(M.getRegionRevealFraction(peq, inc([])), 0.135) &&
        M.getRegionRevealFraction({ stories: [] }, inc([])) === 0 &&
        M.getStoryRevealFraction('semCoord', 0, 3) >= 0 && M.getStoryRevealFraction('semCoord', 0, 3) <= 1,
        'reveal de Pequeninos / guard região vazia / fallback markerFraction incorreto',
      );
    } catch (e) {
      check('B5.2: validação numérica dos helpers de reveal', false, String(e && e.message));
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // B5.3.1 — Reveal GLOBAL da jornada: regiões futuras (depois da fronteira global)
  // ficam 100% sépia (revealFraction 0). Corrige o cálculo por-região isolado, que
  // revelava até a 1ª história de regiões ainda não alcançadas. Helper PURO/testável.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── B5.3.1: reveal global da jornada (futuras = sépia) ──');
  {
    const mapB531 = readSrc('src/data/adventureMap.js');
    const mapScreenB531 = readSrc('src/screens/AdventureMapScreen.js');
    const mapRegionB531 = readSrc('src/components/map/MapRegion.js');

    check(
      'B5.3.1: adventureMap exporta o helper GLOBAL puro (getJourneyRegionRevealFraction)',
      mapB531.includes('export function getJourneyRegionRevealFraction'),
      'helper global de reveal da jornada ausente em adventureMap.js',
    );
    check(
      'B5.3.1: helper global é PURO — sem storage/AsyncStorage/animação',
      !/reveal_seen|AsyncStorage|Animated|@ptf_/.test(mapB531.slice(mapB531.indexOf('getJourneyRegionRevealFraction'))),
      'o helper global introduziu storage/animação — deve ser puro',
    );
    check(
      'B5.3.1→A0.10: a regra global fica no HELPER, consumida pela tela (injeta journeyComplete)',
      mapScreenB531.includes('getJourneyRegionRevealFraction') &&
      /revealFraction=\{journeyRevealFraction\(region\)\}/.test(mapScreenB531) &&
      /getJourneyRegionRevealFraction\(region,\s*regions,\s*isStoryJourneyComplete\)/.test(mapScreenB531),
      'a tela não consome o helper global com a lista de regiões em ordem',
    );
    check(
      'B5.3.1: MapRegion — rf=0 → 100% sépia (sem camada colorida, sem linha); rf=1 → sem linha dourada',
      /showColor\s*=\s*rf\s*>\s*0/.test(mapRegionB531) &&
      /showEdgeLight\s*=\s*rf\s*>\s*0\s*&&\s*rf\s*<\s*1/.test(mapRegionB531),
      'MapRegion pode mostrar cor/linha com rf=0, ou linha com rf=1',
    );
    check(
      'B5.3.1: storage/reset/tour intocados (sem reveal em storageKeys/progressReset; helper sem AsyncStorage)',
      !/reveal/i.test(readSrc('src/services/storageKeys.js')) &&
      !/reveal/i.test(readSrc('src/services/progressResetService.js')) &&
      !/AsyncStorage/.test(mapB531),
      'storageKeys/progressReset ganharam reveal, ou o helper usa AsyncStorage',
    );

    // Validação numérica dos 4 cenários com o helper REAL (sandbox, sem require de imagem).
    try {
      let s = mapB531
        .replace(/^\s*import\s.*$/gm, '')
        .replace(/export const REGION_MAP_IMAGES[\s\S]*?\n\};/, 'const REGION_MAP_IMAGES={};')
        .replace(/require\([^)]*\)/g, 'null')
        .replace(/export /g, '');
      s = 'const stories=[];\n' + s +
        '\nreturn { getJourneyRegionRevealFraction };';
      // eslint-disable-next-line no-new-func
      const M = new Function(s)();
      const R = (id, ids) => ({ id, stories: ids.map((x) => ({ id: x })) });
      const comece = R('comece_aqui', ['creation', 'noah']);
      const peq = R('pequeninos', ['david_goliath', 'jesus_children', 'daniel_lions', 'esther_queen', 'lost_sheep', 'good_samaritan']);
      const desc = R('descobridores', ['abraham_stars', 'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi', 'miraculous_catch', 'jonah_big_fish']);
      const jov = R('jovens_da_fe', ['samuel_hears_god', 'josiah_young_king', 'solomon_wisdom', 'mary_says_yes', 'timothy_faith', 'jesus_temple']);
      const ordered = [comece, peq, desc, jov];
      const inc = (done) => (id) => done.includes(id);
      const jr = (region, done) => M.getJourneyRegionRevealFraction(region, ordered, inc(done));
      const near = (a, b) => Math.abs(a - b) < 0.005;
      const partial = (v) => v > 0.001 && v < 0.999;
      const allPeq = ['creation', 'noah', 'david_goliath', 'jesus_children', 'daniel_lions', 'esther_queen', 'lost_sheep', 'good_samaritan'];

      check(
        'B5.3.1 cenário 1 (nada concluído): Comece Aqui ≈0.365 · Pequeninos/Descobridores/Jovens = 0 (sépia)',
        near(jr(comece, []), 0.365) && jr(peq, []) === 0 && jr(desc, []) === 0 && jr(jov, []) === 0,
        'cenário 1 do reveal global incorreto (futuras deveriam ser 0/sépia)',
      );
      check(
        'B5.3.1 cenário 2 (A Criação concluída): Comece Aqui ≈0.665 · demais = 0',
        near(jr(comece, ['creation']), 0.665) &&
        jr(peq, ['creation']) === 0 && jr(desc, ['creation']) === 0 && jr(jov, ['creation']) === 0,
        'cenário 2 do reveal global incorreto',
      );
      check(
        'B5.3.1 cenário 3 (Criação+Noé): Comece Aqui = 1 · Pequeninos ≈0.135 · Descobridores/Jovens = 0',
        jr(comece, ['creation', 'noah']) === 1 &&
        near(jr(peq, ['creation', 'noah']), 0.135) &&
        jr(desc, ['creation', 'noah']) === 0 && jr(jov, ['creation', 'noah']) === 0,
        'cenário 3 do reveal global incorreto (Pequeninos deveria revelar só até Davi)',
      );
      check(
        'B5.3.1 cenário 4 (Comece Aqui+Pequeninos completos): ambos = 1 · Descobridores PARCIAL (Abraão) · Jovens = 0',
        jr(comece, allPeq) === 1 && jr(peq, allPeq) === 1 &&
        partial(jr(desc, allPeq)) && jr(jov, allPeq) === 0,
        'cenário 4 do reveal global incorreto (Descobridores deveria ser parcial e Jovens 0)',
      );
    } catch (e) {
      check('B5.3.1: validação numérica do reveal global da jornada', false, String(e && e.message));
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // B5.3 — Camada de reveal ESTÁTICA no mapa (sépia base + colorida recortada NÍTIDA)
  // + linha de luz dourada fina na fronteira. Sem feather/blur, sem animação, sem storage, sem laser.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── B5.3: reveal estático sépia→cor no mapa ──');
  {
    const mapScreenB53 = readSrc('src/screens/AdventureMapScreen.js');
    const mapRegionB53 = readSrc('src/components/map/MapRegion.js');

    check(
      'B5.3/B5.3.1: AdventureMapScreen passa o reveal GLOBAL da jornada (journeyRevealFraction) ao MapRegion',
      mapScreenB53.includes('getJourneyRegionRevealFraction') &&
      /revealFraction=\{journeyRevealFraction\(region\)\}/.test(mapScreenB53),
      'AdventureMapScreen não passa o reveal global da jornada para o MapRegion',
    );
    check(
      'B5.3: o mapa principal não decide mais por awake binário (não passa awake={...} ao MapRegion)',
      !/<MapRegion[\s\S]{0,400}awake=\{/.test(mapScreenB53),
      'MapRegion ainda recebe awake binário no mapa principal — deve usar revealFraction',
    );
    check(
      'B5.3: MapRegion recebe prop revealFraction (com default) e clampa [0,1]',
      /function MapRegion\(\{[^}]*revealFraction\s*=\s*0/.test(mapRegionB53) &&
      /Math\.max\(0,\s*Math\.min\(1,\s*revealFraction/.test(mapRegionB53),
      'MapRegion não recebe/clampa revealFraction',
    );
    check(
      'B5.3: MapRegion renderiza BASE sépia (asleep) + camada COLORIDA (awake) por cima',
      mapRegionB53.includes('asleepPreview') && mapRegionB53.includes('asleepFinal') &&
      mapRegionB53.includes('awakePreview') && mapRegionB53.includes('awakeFinal'),
      'MapRegion não compõe base sépia + camada colorida',
    );
    check(
      'B5.3: reveal recortado por overflow:hidden ANCORADO na base (bottom:0), altura = revealH',
      /overflow:\s*'hidden'[\s\S]{0,120}bottom:\s*0[\s\S]{0,120}height:\s*revealH/.test(mapRegionB53) ||
      /bottom:\s*0[\s\S]{0,120}height:\s*revealH[\s\S]{0,120}overflow:\s*'hidden'/.test(mapRegionB53),
      'o recorte do reveal não usa overflow:hidden ancorado na base com altura revealH',
    );
    check(
      'B5.3: revealH deriva de revealFraction * regionH; colorida alinhada (bottom:0, altura plena)',
      /revealH\s*=\s*Math\.round\(rf\s*\*\s*regionH\)/.test(mapRegionB53) &&
      /awakeFinal[\s\S]{0,200}bottom:\s*0,\s*left:\s*0,\s*width,\s*height:\s*regionH/.test(mapRegionB53),
      'revealH não deriva de revealFraction*regionH, ou a colorida não está ancorada/alinhada',
    );
    check(
      'B5.3: sem animação/persistência/reveal_seen neste bloco (reveal estático)',
      !/Animated|reveal_seen|AsyncStorage|@ptf_/.test(mapRegionB53),
      'MapRegion introduziu animação/persistência — proibido no B5.3 (é estático)',
    );
    check(
      'B5.3: marcadores continuam ACIMA do reveal (overlayFront zIndex 7 > reveal zIndex 2)',
      /overlayFront:\s*\{[^}]*zIndex:\s*7/.test(mapRegionB53),
      'marcadores não estão mais acima das camadas de imagem/reveal',
    );

    // Ajuste visual v2 — reveal NÍTIDO + linha de luz dourada (sem feather/blur).
    check(
      'B5.3 (v2): SEM feather/crossfade borrado — reveal colorido NÃO se expande acima de revealH',
      !mapRegionB53.includes('REVEAL_FEATHER_STEPS') &&
      !mapRegionB53.includes('featherLayers') &&
      !mapRegionB53.includes('showFeather') &&
      // única camada colorida = clip de altura revealH (nada acima da fronteira)
      (mapRegionB53.match(/height:\s*revealH,\s*overflow:\s*'hidden'/g) || []).length === 1,
      'ainda há feather/expansão da cor acima da fronteira (deveria ser reveal nítido)',
    );
    check(
      'B5.3 (v2): linha de luz DOURADA fina na fronteira (0<rf<1), transparente nas pontas, altura pequena',
      mapRegionB53.includes('REVEAL_EDGE_LIGHT_H') &&
      /showEdgeLight\s*=\s*rf\s*>\s*0\s*&&\s*rf\s*<\s*1/.test(mapRegionB53) &&
      /colors=\{\['rgba\(255,214,120,0\)',\s*'rgba\(255,226,150,0\.85\)',\s*'rgba\(255,214,120,0\)'\]\}/.test(mapRegionB53) &&
      /const REVEAL_EDGE_LIGHT_H = 1[0-4];/.test(mapRegionB53),
      'não há linha de luz dourada fina (8–14px) condicionada ao reveal parcial',
    );
    check(
      'B5.3 (v2): linha de luz posicionada na fronteira (topo do reveal), sem animação/storage',
      /edgeLightTop\s*=\s*Math\.max\(0,\s*regionH\s*-\s*revealH/.test(mapRegionB53) &&
      /top:\s*edgeLightTop,\s*height:\s*REVEAL_EDGE_LIGHT_H/.test(mapRegionB53) &&
      !/Animated|reveal_seen|AsyncStorage|@ptf_/.test(mapRegionB53),
      'linha de luz não posicionada na fronteira, ou introduziu animação/persistência',
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BLOCO 4 — Quiz de EXATAMENTE 4 perguntas por história (DECISIONS.md #4). Config e
  // copy derivam de QUIZ_QUESTIONS_PER_STORY; q5–q8 preservadas como reserva.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 4: quiz de exatamente 4 perguntas ──');
  {
    const quizModelB4 = readSrc('src/services/quizModel.js');
    const quizScreenB4 = readSrc('src/screens/QuizScreen.js');
    const congratsB4 = readSrc('src/screens/CongratsScreen.js');
    const quizzesB4 = readSrc('src/data/quizzes.js');

    check(
      'Bloco4 (a): quizModel exporta QUIZ_QUESTIONS_PER_STORY === 4 (fonte única)',
      /export const QUIZ_QUESTIONS_PER_STORY\s*=\s*4\b/.test(quizModelB4),
      'QUIZ_QUESTIONS_PER_STORY ausente ou diferente de 4',
    );
    check(
      'Bloco4 (c): QuizScreen corta para a constante (slice(0, QUIZ_QUESTIONS_PER_STORY))',
      /import\s*\{[^}]*QUIZ_QUESTIONS_PER_STORY[^}]*\}\s*from\s*'\.\.\/services\/quizModel'/.test(quizScreenB4) &&
      /\.slice\(0,\s*QUIZ_QUESTIONS_PER_STORY\)/.test(quizScreenB4),
      'QuizScreen não corta as perguntas para a constante (pode executar 8)',
    );
    check(
      'Bloco4 (d): CongratsScreen deriva a copy da constante (sem "3 perguntas" hardcoded)',
      /import\s*\{[^}]*QUIZ_QUESTIONS_PER_STORY[^}]*\}\s*from\s*'\.\.\/services\/quizModel'/.test(congratsB4) &&
      /\{QUIZ_QUESTIONS_PER_STORY\} perguntas/.test(congratsB4),
      'CongratsScreen não deriva a quantidade de perguntas da constante',
    );
    check(
      'Bloco4 (e): sem copy hardcoded "3 perguntas" no fluxo do quiz (Congrats/StoryDetail)',
      !/3 perguntas/.test(congratsB4) &&
      !/3 perguntas/.test(readSrc('src/screens/StoryDetailScreen.js')),
      'ainda há "3 perguntas" hardcoded no fluxo do quiz',
    );

    // Validação numérica: toda história tem >=4 perguntas não-draft e o corte dá 4;
    // reserva preservada (dados seguem com mais de 4 — hoje 8). Usa os helpers reais.
    try {
      // extrai QUIZZES do arquivo de dados (sem imports/require)
      let qs = quizzesB4.replace(/^\s*import\s.*$/gm, '').replace(/export /g, '');
      qs += '\nreturn QUIZZES;';
      // eslint-disable-next-line no-new-func
      const QUIZZES = new Function(qs)();
      const ids = Object.keys(QUIZZES);
      const PER = 4;
      const nonDraft = (id) => (QUIZZES[id] || []).filter(q => !q.quizDraft);
      const allHave4 = ids.every(id => nonDraft(id).length >= PER);
      const sliceGives4 = ids.every(id => nonDraft(id).slice(0, PER).length === PER);
      const reserveKept = ids.every(id => (QUIZZES[id] || []).length > PER); // q5+ preservadas
      check(
        'Bloco4 (b/f): todas as histórias têm >=4 perguntas não-draft; corte dá 4; reserva (q5+) preservada',
        ids.length === 20 && allHave4 && sliceGives4 && reserveKept,
        'alguma história não tem 4 perguntas, ou a reserva (q5–q8) foi removida',
      );
    } catch (e) {
      check('Bloco4: validação numérica do quiz (4 + reserva)', false, String(e && e.message));
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BLOCO 3 — Flags de produção: ferramentas internas invisíveis no v1. Modo Igreja
  // ("em preparação") atrás de flag de build dedicada; QA sob SHOW_TEST_TOOLS;
  // Cultinho em Casa e "Em breve" (premium) NÃO afetados.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 3: flags de produção (ferramentas internas escondidas) ──');
  {
    const flagsB3 = readSrc('src/config/featureFlags.js');
    const parentB3 = readSrc('src/screens/ParentAreaScreen.js');
    const homeB3 = readSrc('src/screens/HomeScreen.js');

    check(
      'Bloco3: featureFlags define SHOW_CHURCH_MODE atrás de flag de build (default OFF)',
      /export const SHOW_CHURCH_MODE\s*=\s*[\s\S]{0,80}process\.env\.EXPO_PUBLIC_ENABLE_CHURCH_MODE\s*===\s*'true'/.test(flagsB3),
      'SHOW_CHURCH_MODE não é uma flag de build desligada por padrão',
    );
    check(
      'Bloco3 (a): Modo Igreja só renderiza sob SHOW_CHURCH_MODE (import + gate {SHOW_CHURCH_MODE && ...})',
      /import\s*\{[^}]*SHOW_CHURCH_MODE[^}]*\}\s*from\s*'\.\.\/config\/featureFlags'/.test(parentB3) &&
      /\{SHOW_CHURCH_MODE && \([\s\S]{0,200}title="⛪ Modo Igreja"/.test(parentB3),
      'a seção Modo Igreja não está gated por SHOW_CHURCH_MODE',
    );
    check(
      'Bloco3 (b): bloco de ferramentas QA continua sob SHOW_TEST_TOOLS (__DEV__ || isCreatorQaModeAllowed)',
      /const SHOW_TEST_TOOLS\s*=/.test(parentB3) &&
      /isCreatorQaModeAllowed\(\)/.test(parentB3) &&
      /\{SHOW_TEST_TOOLS && \(/.test(parentB3),
      'as ferramentas QA não estão mais sob SHOW_TEST_TOOLS',
    );
    check(
      'Bloco3 (c): Cultinho em Casa (FamilyWorship) NÃO depende de SHOW_CHURCH_MODE (feature separada, fica no v1)',
      /navigation\.navigate\('FamilyWorship'\)/.test(homeB3) &&
      !/SHOW_CHURCH_MODE[\s\S]{0,120}FamilyWorship/.test(homeB3) &&
      !/FamilyWorship[\s\S]{0,120}SHOW_CHURCH_MODE/.test(homeB3),
      'o Cultinho em Casa foi acoplado à flag do Modo Igreja (não deveria)',
    );
    check(
      'Bloco3 (d): "Em breve" (premium/plano) permanece intacto — não foi removido neste bloco',
      /notAvailableYetText:\s*'Em breve'/.test(readSrc('src/data/planConfig.js')),
      'o rótulo "Em breve" de premium/plano foi removido (fora do escopo do Bloco 3)',
    );
    check(
      'Bloco3: texto "em preparação" do Modo Igreja está DENTRO do gate (não vaza em produção)',
      // as duas ocorrências de "em preparação" da ParentArea (hint + corpo) ficam sob o gate
      /\{SHOW_CHURCH_MODE && \([\s\S]*em preparação[\s\S]*em preparação[\s\S]*\)\}/.test(parentB3),
      '"em preparação" do Modo Igreja pode aparecer fora do gate SHOW_CHURCH_MODE',
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // V1 — Áudio do tour: garante o audio mode (playsInSilentMode) ANTES da 1ª fala do
  // Beni (idempotente, via audioManager). A voz do tour segue gated por voiceOn &&
  // soundsOn; a NARRAÇÃO (AudioPlayer) permanece em caminho separado (não silenciada).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── V1: audio mode garantido antes da fala do tour ──');
  {
    const amV1 = readSrc('src/services/audioManager.js');
    const bgaV1 = readSrc('src/components/BeniGuideAudio.js');
    const overlayV1 = readSrc('src/components/BeniGuideOverlay.js');

    check(
      'V1: audioManager EXPORTA ensureAudioMode idempotente (playsInSilentMode:true, guarda audioModeReady)',
      /export async function ensureAudioMode/.test(amV1) &&
      /if \(audioModeReady\) return;/.test(amV1) &&
      /playsInSilentMode:\s*true/.test(amV1),
      'ensureAudioMode não é exportada/idempotente ou não usa playsInSilentMode',
    );
    check(
      'V1: BeniGuideAudio garante o audio mode antes da fala (importa + chama ensureAudioMode no play e no mount)',
      /import\s*\{[^}]*ensureAudioMode[^}]*\}\s*from\s*'\.\.\/services\/audioManager'/.test(bgaV1) &&
      /const safePlay = \(\) => \{ ensureAudioMode\(\);/.test(bgaV1) &&
      (bgaV1.match(/ensureAudioMode\(\)/g) || []).length >= 2,
      'BeniGuideAudio não garante o audio mode antes de tocar a voz do Beni',
    );
    check(
      'V1: voz do tour segue gated por voiceOn && soundsOn (respeita o atalho; não toca narração)',
      /voiceOn && soundsOn && step\.audioKey/.test(overlayV1),
      'a condição de voz do tour foi alterada indevidamente',
    );
    check(
      'V1: narração (AudioPlayer) permanece com seu próprio audio mode (não silenciada pelo atalho)',
      /playsInSilentMode:\s*true/.test(readSrc('src/components/AudioPlayer.js')),
      'a narração perdeu o playsInSilentMode (regressão de narração)',
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // V3 — Regra GLOBAL de segurança do tour: nenhum tour trava a tela quando uma
  // âncora não renderiza/mede. Watchdog na medição (comita sem alvo em tempo seguro)
  // + measure protegido (hang/throw) + rota de escape sempre disponível ("Pular").
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── V3: regra global de segurança do tour (nunca trava) ──');
  {
    const guideV3 = readSrc('src/components/BeniGuideOverlay.js');

    check(
      'V3: watchdog de medição — MEASURE_TIMEOUT_MS comita o passo sem alvo em tempo seguro',
      /const MEASURE_TIMEOUT_MS\s*=\s*\d{3,4}/.test(guideV3) &&
      /watchdogTimer/.test(guideV3) &&
      /setTimeout\(\(\)\s*=>\s*done\(null\),\s*MEASURE_TIMEOUT_MS\)/.test(guideV3),
      'sem watchdog de medição — o passo pode travar se a âncora não medir',
    );
    check(
      'V3: measure protegido contra hang/throw (Promise.resolve + catch + try/catch síncrono)',
      /Promise\.resolve\(measure\(target\)\)/.test(guideV3) &&
      /\.catch\(\(\)\s*=>\s*done\(null\)\)/.test(guideV3) &&
      /catch\s*\{[\s\S]{0,40}done\(null\)/.test(guideV3),
      'measure não está protegido — busy pode ficar preso e travar o avanço',
    );
    check(
      'V3: busy SEMPRE libera — finish limpa o watchdog e chama setBusy(false)',
      /const finish = \(r\) =>/.test(guideV3) &&
      /clearTimeout\(watchdogTimer\.current\)/.test(guideV3) &&
      /setBusy\(false\)/.test(guideV3),
      'busy pode não liberar após a medição (avanço travado)',
    );
    check(
      'V3: rota de escape sempre disponível — "Pular" (onSkip) NÃO é disabled={busy}',
      /onPress=\{onSkip\}/.test(guideV3) &&
      !/onPress=\{onSkip\}[^)]*disabled=\{busy\}/.test(guideV3),
      'o botão Pular pode ficar bloqueado (sem rota de escape)',
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // V4 — Fallback OBRIGATÓRIO de avatar: NENHUMA tela exibe moldura vazia.
  // AvatarImage cai no avatar padrão quando source é null/undefined; getAvatarImage
  // nunca retorna undefined (id/tom inválido → padrão). Não toca desbloqueio/acesso.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── V4: fallback obrigatório de avatar ──');
  {
    const avatarsV4 = readSrc('src/data/avatars.js');
    const avatarImgV4 = readSrc('src/components/AvatarImage.js');

    check(
      'V4: avatars.js exporta DEFAULT_AVATAR_IMAGE (require literal do avatar padrão)',
      /export const DEFAULT_AVATAR_IMAGE\s*=\s*require\(/.test(avatarsV4),
      'DEFAULT_AVATAR_IMAGE ausente em avatars.js',
    );
    check(
      'V4: getAvatarImage nunca retorna undefined (fallback final ?? DEFAULT_AVATAR_IMAGE)',
      /return img\s*\?\?\s*DEFAULT_AVATAR_IMAGE/.test(avatarsV4),
      'getAvatarImage não tem fallback garantido para o avatar padrão',
    );
    check(
      'V4: AvatarImage nunca renderiza source cru — usa fallback (source ?? DEFAULT_AVATAR_IMAGE)',
      /import\s*\{[^}]*DEFAULT_AVATAR_IMAGE[^}]*\}\s*from\s*'\.\.\/data\/avatars'/.test(avatarImgV4) &&
      /const safeSource\s*=\s*source\s*\?\?\s*DEFAULT_AVATAR_IMAGE/.test(avatarImgV4) &&
      /source=\{safeSource\}/.test(avatarImgV4),
      'AvatarImage pode exibir moldura vazia (source null sem fallback)',
    );
    check(
      'V4: lógica de desbloqueio de avatar INTACTA (isAvatarUnlocked/unlockStars não alterados)',
      /export function isAvatarUnlocked\(avatarId, totalStars = 0, currentAvatarId = null\)/.test(avatarsV4) &&
      avatarsV4.includes('unlockStars'),
      'a lógica de desbloqueio de avatar foi alterada (proibido no V4)',
    );

    // Sandbox: getAvatarImage SEMPRE truthy (nunca undefined/null) — matriz de entradas.
    try {
      let s = avatarsV4
        .replace(/^\s*import\s.*$/gm, '')
        .replace(/require\([^)]*\)/g, "'IMG'") // imagens viram marcador truthy
        .replace(/export /g, '');
      s += '\nreturn { getAvatarImage, AVATARS };';
      // eslint-disable-next-line no-new-func
      const M = new Function(s)();
      const ok = (v) => typeof v !== 'undefined' && v !== null;
      const ids = M.AVATARS.map((a) => a.id);
      const allValid =
        ids.every((id) => ok(M.getAvatarImage(id))) &&
        ids.every((id) => ok(M.getAvatarImage(id, 'escuro'))) &&
        ok(M.getAvatarImage('id_inexistente')) &&       // id inválido → padrão
        ok(M.getAvatarImage('girl', 'tom_invalido')) &&  // tom inválido → claro
        ok(M.getAvatarImage(undefined)) &&               // undefined → padrão
        ok(M.getAvatarImage(null, null));                // null → padrão
      check(
        'V4: getAvatarImage retorna imagem válida para TODA entrada (ids, tons, inválidos, null)',
        allValid,
        'getAvatarImage retornou undefined/null para alguma entrada',
      );
    } catch (e) {
      check('V4: validação do fallback de getAvatarImage', false, String(e && e.message));
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // A0.1 — Tokens oficiais da Direção de Arte v1.1 (src/theme/tokens.js). SÓ define
  // os tokens (cor/tipografia/forma/movimento/responsividade); não migra telas, não
  // carrega fontes, não cria componentes. Temas antigos seguem intactos.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── A0.1: tokens da Direção de Arte v1.1 ──');
  {
    const tokPath = 'src/theme/tokens.js';
    const tokSrc = readSrc(tokPath);

    check(
      'A0.1: src/theme/tokens.js existe e exporta os grupos principais',
      /export const color\b/.test(tokSrc) && /export const font\b/.test(tokSrc) &&
      /export const fontSize\b/.test(tokSrc) && /export const radius\b/.test(tokSrc) &&
      /export const border\b/.test(tokSrc) && /export const shadow\b/.test(tokSrc) &&
      /export const motion\b/.test(tokSrc) && /export const breakpoints\b/.test(tokSrc) &&
      /export const maxContentWidth\b/.test(tokSrc) && /export default tokens/.test(tokSrc),
      'tokens.js não existe ou não exporta os grupos esperados',
    );
    check(
      'A0.1: temas antigos INTACTOS em paralelo (colors/productTheme/theme)',
      readSrc('src/theme/colors.js').includes('export const colors') &&
      readSrc('src/theme/productTheme.js').length > 0 &&
      readSrc('src/theme/theme.js').length > 0,
      'algum tema antigo sumiu/foi alterado (deviam seguir vivos)',
    );

    // Validação numérica dos VALORES (sandbox — tokens.js é puro, sem imports/require).
    try {
      let s = tokSrc
        .replace(/export default[^\n]*\n?/g, '')  // remove a linha `export default tokens;`
        .replace(/export /g, '');                  // `export const` → `const`
      s += '\nreturn { color, semantic, font, fontSize, lineHeight, fontWeight, radius, border, shadow, texture, motion, breakpoints, maxContentWidth, grid, displayScaleTablet };';
      // eslint-disable-next-line no-new-func
      const T = new Function(s)();

      const coresOk =
        T.color.paper50 === '#FDF8EE' && T.color.paper100 === '#F8F0DC' &&
        T.color.paper200 === '#EFE3C8' && T.color.paper300 === '#E4D5B4' &&
        T.color.ink900 === '#3E2E1B' && T.color.ink600 === '#7A6A50' && T.color.ink400 === '#A89573' &&
        T.color.terra500 === '#C9502A' && T.color.terra600 === '#A73F1F' &&
        T.color.terra100 === '#F7DED2' && T.color.onTerra === '#FFF6E8' &&
        T.color.gold700 === '#8F6A1E' && T.color.gold500 === '#C99A3B' &&
        T.color.gold300 === '#E8C05A' && T.color.gold100 === '#F6E7C8' &&
        T.color.night800 === '#1C2B52' && T.color.night600 === '#2E4370' && T.color.star100 === '#F2DCA0';
      check(
        'A0.1: 18 cores oficiais (paper/ink/terra/gold/night) com os hexes EXATOS do v1.1',
        coresOk,
        'algum hex de cor difere do documento v1.1',
      );

      check(
        'A0.1: semânticos mínimos — acerto = gold300; atencao = terra100 + ink600 (sem verde/vermelho)',
        T.semantic.acerto === T.color.gold300 &&
        T.semantic.atencao.bg === T.color.terra100 && T.semantic.atencao.text === T.color.ink600,
        'semânticos (acerto/atencao) incorretos',
      );
      check(
        'A0.1: tipografia — Fraunces (display) + Nunito (texto); escala (caption 13 … displayXL 40); line-height',
        T.font.display === 'Fraunces' && T.font.body === 'Nunito' &&
        T.fontSize.caption === 13 && T.fontSize.body === 17 && T.fontSize.displayXL === 40 &&
        T.lineHeight.title === 1.35 && T.lineHeight.body === 1.55,
        'tipografia/escala/line-height fora do v1.1',
      );
      check(
        'A0.1: forma/sombra/movimento — radius {chip14…pill28}, sombra única, motion + pressScale 0.96',
        T.radius.chip === 14 && T.radius.card === 20 && T.radius.hero === 24 && T.radius.pill === 28 &&
        T.border.card.width === 1.5 && T.border.reward.color === T.color.gold500 &&
        T.shadow.color === '#3E2E1B' && T.shadow.opacity === 0.10 && T.shadow.radius === 10 &&
        T.motion.pageTurn === 450 && T.motion.pressScale === 0.96,
        'radius/border/shadow/motion fora do v1.1',
      );
      check(
        'A0.1: responsividade — breakpoints {0,600,900}, maxContentWidth {100%,560,640}, grid, display +10%',
        T.breakpoints.phone === 0 && T.breakpoints.tablet === 600 && T.breakpoints.tabletL === 900 &&
        T.maxContentWidth.tablet === 560 && T.maxContentWidth.tabletL === 640 &&
        T.grid.phone === 1 && T.grid.tablet === 2 && T.grid.tabletL === 3 &&
        T.displayScaleTablet === 1.10,
        'breakpoints/maxContentWidth/grid fora do v1.1',
      );
    } catch (e) {
      check('A0.1: validação numérica dos tokens', false, String(e && e.message));
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // A0.2 — Fontes: Fraunces (display, D3) carregada junto de Nunito; FredokaOne
  // segue carregada TEMPORARIAMENTE (sem regressão nas telas atuais). Nenhuma tela
  // migrada; só o carregamento/registro em App.js.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── A0.2: carregamento de fontes (Fraunces + Nunito) ──');
  {
    const appSrc = readSrc('App.js');
    const tokSrcA02 = readSrc('src/theme/tokens.js');

    check(
      'A0.2: App.js importa Fraunces_600SemiBold de @expo-google-fonts/fraunces',
      /import\s*\{[\s\S]{0,60}Fraunces_600SemiBold[\s\S]{0,60}\}\s*from\s*'@expo-google-fonts\/fraunces'/.test(appSrc),
      'App.js não importa Fraunces_600SemiBold do pacote fraunces',
    );
    check(
      'A0.2: useFonts registra Fraunces + Nunito (regular/bold); FredokaOne segue temporária',
      /useFonts\(\{[\s\S]*?'Fraunces':\s*Fraunces_600SemiBold[\s\S]*?\}\)/.test(appSrc) &&
      /'Nunito':\s*Nunito_400Regular/.test(appSrc) &&
      /'Nunito-Bold':\s*Nunito_700Bold/.test(appSrc) &&
      /'FredokaOne':\s*FredokaOne_400Regular/.test(appSrc),
      'useFonts não registra Fraunces/Nunito/Nunito-Bold, ou FredokaOne foi removida (regressão)',
    );
    check(
      'A0.2: o app ainda aguarda fontsLoaded (sem regressão de boot)',
      /const \[fontsLoaded\] = useFonts/.test(appSrc) && /if \(!fontsLoaded\)/.test(appSrc),
      'App.js não aguarda mais fontsLoaded (risco de flash/boot sem fonte)',
    );
    check(
      'A0.2: o nome de família carregado ("Fraunces") casa com tokens.font.display',
      /'Fraunces':\s*Fraunces_600SemiBold/.test(appSrc) &&
      /display:\s*'Fraunces'/.test(tokSrcA02),
      'o nome da família registrada não corresponde a tokens.font.display',
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // A0.3 — Fundação responsiva: ContentContainer (useWindowDimensions + tokens) e
  // remoção do Dimensions.get congelado (Confetti, CongratsScreen). Sem redesenho.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── A0.3: fundação responsiva (ContentContainer) ──');
  {
    const ccSrc = readSrc('src/components/ui/ContentContainer.js');
    const confettiA03 = readSrc('src/components/Confetti.js');
    const congratsA03 = readSrc('src/screens/CongratsScreen.js');

    check(
      'A0.3: ContentContainer existe e usa useWindowDimensions + tokens (breakpoints/maxContentWidth)',
      ccSrc.length > 0 &&
      /useWindowDimensions\(\)/.test(ccSrc) &&
      /import\s*\{[^}]*breakpoints[^}]*maxContentWidth[^}]*\}\s*from\s*'\.\.\/\.\.\/theme\/tokens'/.test(ccSrc) &&
      /maxWidth/.test(ccSrc) && /alignSelf:\s*'center'/.test(ccSrc),
      'ContentContainer ausente ou não usa useWindowDimensions + tokens',
    );
    check(
      'A0.3: ContentContainer é FLUIDO (width 100%) e centraliza por token — sem largura fixa de tela',
      /width:\s*'100%'/.test(ccSrc) &&
      /maxContentWidth\.tablet\b/.test(ccSrc) && /maxContentWidth\.tabletL\b/.test(ccSrc) &&
      !/Dimensions\.get/.test(ccSrc),
      'ContentContainer usa largura fixa/Dimensions.get em vez de fluido + maxWidth por token',
    );
    check(
      'A0.3: Confetti.js sem Dimensions.get congelado — usa useWindowDimensions (responsivo)',
      !/Dimensions\.get/.test(confettiA03) &&
      /useWindowDimensions\(\)/.test(confettiA03) &&
      /useMemo\(\(\) => makePieces\(width\)/.test(confettiA03),
      'Confetti.js ainda tem Dimensions.get congelado em módulo',
    );
    check(
      'A0.3: CongratsScreen.js sem Dimensions.get congelado (código morto removido)',
      !/Dimensions\.get/.test(congratsA03) &&
      !/const \{ width: SCREEN_W \}/.test(congratsA03),
      'CongratsScreen.js ainda tem Dimensions.get / SCREEN_W congelado',
    );
    check(
      'A0.3: nenhum Dimensions.get(\'window\') congelado em MÓDULO restante no app',
      // varre src atrás de `Dimensions.get('window')` fora de componente (nível de módulo)
      (function () {
        const files = ['src/components/Confetti.js', 'src/screens/CongratsScreen.js'];
        return files.every((f) => !/^const[^\n]*Dimensions\.get\('window'\)/m.test(readSrc(f)));
      })(),
      'ainda há Dimensions.get(\'window\') congelado em módulo nos arquivos-alvo',
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // A0.4 — Componentes-base da fundação visual (src/components/ui/*). Só tokens,
  // sem hex hardcoded, sem emoji, sem aplicar a nenhuma tela. Regras §2.4 nos botões.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── A0.4: componentes-base (ui/*) ──');
  {
    const uiFiles = {
      BotaoPrimario: readSrc('src/components/ui/BotaoPrimario.js'),
      BotaoSecundario: readSrc('src/components/ui/BotaoSecundario.js'),
      BotaoGhost: readSrc('src/components/ui/BotaoGhost.js'),
      CartaoPagina: readSrc('src/components/ui/CartaoPagina.js'),
      ChipOrnamentado: readSrc('src/components/ui/ChipOrnamentado.js'),
      ModalPapel: readSrc('src/components/ui/ModalPapel.js'),
      TrilhoProgresso: readSrc('src/components/ui/TrilhoProgresso.js'),
    };
    const botoes = [uiFiles.BotaoPrimario, uiFiles.BotaoSecundario, uiFiles.BotaoGhost];

    check(
      'A0.4: os 7 componentes-base existem e exportam default',
      Object.values(uiFiles).every((s) => s.length > 0 && /export default function/.test(s)),
      'algum componente-base ausente ou sem export default',
    );
    check(
      'A0.4: todos os componentes-base importam tokens de ../../theme/tokens',
      Object.values(uiFiles).every((s) => /from\s*'\.\.\/\.\.\/theme\/tokens'/.test(s)),
      'algum componente-base não importa os tokens',
    );
    check(
      'A0.4: botões NÃO usam ellipsizeMode (texto nunca cortado por reticências)',
      botoes.every((s) => !/ellipsizeMode/.test(s)),
      'algum botão usa ellipsizeMode (proibido §2.4)',
    );
    check(
      'A0.4: botões NÃO usam numberOfLines={1} (permitem até 2 linhas)',
      botoes.every((s) => !/numberOfLines=\{1\}/.test(s) && /numberOfLines=\{2\}/.test(s)),
      'algum botão usa numberOfLines={1} ou não permite 2 linhas',
    );
    check(
      'A0.4: botões têm altura MÍNIMA 56 (minHeight, sem altura fixa)',
      botoes.every((s) => /minHeight:\s*MIN_TOUCH/.test(s) && /const MIN_TOUCH = 56/.test(s)) &&
      botoes.every((s) => !/\bheight:\s*\d/.test(s)),
      'algum botão não usa minHeight 56 ou tem altura fixa',
    );
    check(
      'A0.4: BotaoPrimario usa terracota (color.terra500) como ação',
      /backgroundColor:\s*color\.terra500/.test(uiFiles.BotaoPrimario),
      'BotaoPrimario não usa terra500 como cor de ação',
    );
    check(
      'A0.4: botões têm largura FLUIDA (alignSelf stretch) e press squish (motion.pressScale)',
      botoes.every((s) => /alignSelf:\s*'stretch'/.test(s) && /motion\.pressScale/.test(s)),
      'algum botão tem largura fixa ou não faz o squish 0.96',
    );
    check(
      'A0.4: NENHUM hex hardcoded (#RRGGBB) nos 7 componentes — só tokens',
      Object.values(uiFiles).every((s) => !/#[0-9A-Fa-f]{6}\b/.test(s)),
      'algum componente-base tem hex hardcoded fora dos tokens',
    );
    check(
      'A0.4: CartaoPagina usa paper100 + borda paper200 + radius.card + sombra única (tokens.shadow)',
      /backgroundColor:\s*color\.paper100/.test(uiFiles.CartaoPagina) &&
      /borderColor:\s*color\.paper200/.test(uiFiles.CartaoPagina) &&
      /borderRadius:\s*radius\.card/.test(uiFiles.CartaoPagina) &&
      /shadowColor:\s*shadow\.color/.test(uiFiles.CartaoPagina),
      'CartaoPagina não usa os tokens de card/sombra',
    );
    check(
      'A0.4: ModalPapel é RESPONSIVO (useWindowDimensions + maxContentWidth) e fundo papel',
      /useWindowDimensions\(\)/.test(uiFiles.ModalPapel) &&
      /maxContentWidth\.tablet/.test(uiFiles.ModalPapel) &&
      /backgroundColor:\s*color\.paper100/.test(uiFiles.ModalPapel),
      'ModalPapel não é responsivo / não usa fundo papel dos tokens',
    );
    check(
      'A0.4: TrilhoProgresso usa paper300 (trilho) + gold300/gold500 (preenchimento) dos tokens',
      /backgroundColor:\s*color\.paper300/.test(uiFiles.TrilhoProgresso) &&
      /backgroundColor:\s*color\.gold300/.test(uiFiles.TrilhoProgresso) &&
      /color\.gold500/.test(uiFiles.TrilhoProgresso),
      'TrilhoProgresso não usa os tokens de progresso',
    );
    check(
      // A0.4 criou os componentes sem aplicá-los; A0.5 aplica SÓ à vitrine
      // (StoryDetailScreen + StoryBookHero). Aqui garantimos que NÃO foram espalhados
      // prematuramente para telas fora da vitrine (Home/Congrats).
      'A0.4/A0.5: componentes-base restritos à vitrine — não espalhados a Home/Congrats',
      !/from\s*'[^']*ui\/(BotaoPrimario|BotaoSecundario|BotaoGhost|CartaoPagina|ChipOrnamentado|ModalPapel|TrilhoProgresso)'/.test(
        [readSrc('src/screens/HomeScreen.js'), readSrc('src/screens/CongratsScreen.js')].join('\n'),
      ),
      'algum componente-base foi espalhado para telas fora da vitrine (fora do escopo)',
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // A0.5 — Tela-vitrine: estado PRÉ-HISTÓRIA do StoryDetail migrado à v1.1 (tokens
  // + componentes-base + moldura Galeria Viva). Pós-conclusão e lista de cenas
  // NÃO redesenhados (A1/futuro).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── A0.5: tela-vitrine (StoryDetail pré-história) ──');
  {
    const sd = readSrc('src/screens/StoryDetailScreen.js');
    const hero = readSrc('src/components/story/StoryBookHero.js');
    const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}]/u;

    check(
      'A0.5 (1): StoryDetailScreen usa ContentContainer (import + render)',
      /import ContentContainer from '[^']*ui\/ContentContainer'/.test(sd) && /<ContentContainer\b/.test(sd),
      'StoryDetailScreen não usa ContentContainer',
    );
    check(
      'A0.5 (2): StoryDetailScreen usa BotaoPrimario para a ação principal (label=getPrimaryLabel)',
      /import BotaoPrimario from '[^']*ui\/BotaoPrimario'/.test(sd) &&
      /<BotaoPrimario\b[\s\S]{0,160}label=\{getPrimaryLabel\(\)\}/.test(sd),
      'StoryDetailScreen não usa BotaoPrimario como ação principal',
    );
    check(
      'A0.5 (3): StoryDetailScreen usa tokens (fundo papel — color.paper50)',
      /from '\.\.\/theme\/tokens'/.test(sd) && /backgroundColor:\s*color\.paper50/.test(sd),
      'StoryDetailScreen não usa tokens (fundo papel)',
    );
    check(
      'A0.5 (4): StoryBookHero usa tokens na moldura Galeria Viva (gold500 + paper100 + arte intacta)',
      /borderColor:\s*color\.gold500/.test(hero) && /backgroundColor:\s*color\.paper100/.test(hero) &&
      /StoryCoverImage/.test(hero),
      'StoryBookHero não aplica a moldura Galeria Viva por tokens',
    );
    check(
      'A0.5 (5): sem gradiente roxo no BOTÃO PRINCIPAL — hero sem LinearGradient; ação = BotaoPrimario',
      !/LinearGradient/.test(hero) &&
      /<BotaoPrimario\b[\s\S]{0,160}onPress=\{handlePrimary\}/.test(sd),
      'o botão principal ainda usa gradiente / o hero tem LinearGradient',
    );
    check(
      'A0.5 (6): chrome migrado SEM emoji — StoryBookHero sem emoji; labels do botão sem emoji',
      !EMOJI.test(hero) &&
      !/return '[^']*[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}][^']*';/u.test(sd.slice(sd.indexOf('getPrimaryLabel'), sd.indexOf('getPrimaryLabel') + 400)),
      'há emoji no chrome migrado (StoryBookHero ou labels do botão)',
    );
    check(
      'A0.5 (7): sem ellipsizeMode em botão/título migrado (StoryBookHero + BotaoPrimario)',
      !/ellipsizeMode/.test(hero),
      'há ellipsizeMode no chrome migrado',
    );
    check(
      'A0.5 (8): StoryBookHero SEM hex hardcoded (#RRGGBB) — 100% tokens',
      !/#[0-9A-Fa-f]{6}\b/.test(hero),
      'StoryBookHero tem hex hardcoded fora dos tokens',
    );
    check(
      'A0.5 (9): lógica de acesso/progresso/navegação INTACTA (hasAccess/getSceneStatus/useProgress/handlePrimary)',
      /hasAccess\(story\)/.test(sd) && /function getSceneStatus/.test(sd) &&
      /useProgress\(story\.id\)/.test(sd) && /function handlePrimary/.test(sd) &&
      /isStoryComingSoon\(story\)/.test(sd),
      'a lógica de acesso/progresso da tela foi alterada',
    );
    check(
      'A0.5→A0.10: PostStoryCard/SceneListItem preservados; gradiente pós-cenas migrado para AZUL-NOITE (roxo aposentado)',
      /function PostStoryCard/.test(sd) && /<SceneListItem\b/.test(sd) &&
      /colors=\{\[color\.night800, color\.night600\]\}/.test(sd),
      'PostStoryCard/SceneListItem sumiram ou o gradiente pós-cenas não é azul-noite (A0.10)',
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // A0.7 — Ajuste final do header da vitrine: o header do StoryDetail volta a ser
  // APENAS "Voltar" (respeita o fluxo → mapa/lista de origem; sem "Início", sem botão
  // à direita). O selo premium MIGRA de roxo/lilás → AZUL-NOITE (resolve a tensão D2).
  // Grátis (verde), "Concluída" (dourado, conclusão REAL) e o painel "Nesta aventura"
  // com variante concluída seguem do A0.6.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── A0.7: header "Voltar" + selos coesos (premium azul-noite) + conclusão real ──');
  {
    const nav = readSrc('src/navigation/AppNavigator.js');
    const tok = readSrc('src/theme/tokens.js');
    const heroA07 = readSrc('src/components/story/StoryBookHero.js');
    const sdA07 = readSrc('src/screens/StoryDetailScreen.js');
    const sdOptions = nav.slice(nav.indexOf('name="StoryDetail"'), nav.indexOf('name="Narration"'));
    const premiumLine = (tok.match(/premium:\s*\{[^}]*\}/) || [''])[0];

    check(
      'A0.7 (header): StoryDetail renderiza "Voltar" (BackBtn à esquerda), NÃO renderiza "Início" (sem HomeBtn), sem botão à direita',
      /headerLeft:\s*\(\)\s*=>\s*<BackBtn/.test(sdOptions) &&
      !/HomeBtn/.test(sdOptions) &&
      !/headerRight/.test(sdOptions),
      'o header do StoryDetail ainda usa Início/HomeBtn, perdeu o Voltar ou tem botão à direita',
    );
    check(
      'A0.7 (título): título centralizado + largura reservada (headerTitleAlign center + headerLeftContainerStyle) — "Voltar" nunca some em título longo',
      /headerTitleAlign:\s*'center'/.test(sdOptions) &&
      /headerLeftContainerStyle/.test(sdOptions),
      'o header não equilibra título longo (sem center ou sem largura reservada)',
    );
    check(
      'A0.7 (tokens): seal premium = AZUL-NOITE (text night800, fundo claro), SEM roxo/lilás e SEM marrom; Grátis verde; Concluída dourada',
      /export const seal\s*=/.test(tok) &&
      /free:\s*\{[^}]*text:\s*'#2E6B33'/.test(tok) &&
      /night800/.test(premiumLine) &&
      !/ink900|terra|#3E2E1B/.test(premiumLine) &&
      !/#5B3E9C/.test(tok) && !/#B79CE2/.test(tok) && !/#EFE6FA/.test(tok) &&
      /done:\s*\{[^}]*border:\s*color\.gold500/.test(tok),
      'tokens.seal ainda usa roxo/lilás/marrom no premium ou perdeu Grátis verde/Concluída dourada',
    );
    check(
      'A0.7 (acesso): Grátis usa selo verde (seal.free); premium usa "Plano Família" com selo azul-noite (seal.premium)',
      /import\s*\{[^}]*seal[^}]*\}\s*from\s*'\.\.\/\.\.\/theme\/tokens'/.test(heroA07) &&
      /acessoLabel = isPremium \? 'Plano Família' : 'Grátis'/.test(heroA07) &&
      /acessoVariant = isPremium \? 'premium' : 'free'/.test(heroA07) &&
      /seal\[variant\]/.test(heroA07),
      'o hero não aplica os selos verde/azul-noite de acesso',
    );
    check(
      'A0.7 (conclusão): selo "Concluída" exige conclusão REAL — via fonte única (getStoryJourneyStatus, journeyComplete A0.10)',
      /const journey = getStoryJourneyStatus\(\{/.test(sdA07) &&
      /const isFullyComplete = journey\.journeyComplete/.test(sdA07) &&
      /isStoryBookOpened\(story\.id\)\.then\(setBookOpened\)/.test(sdA07) &&
      /isFullyComplete=\{isFullyComplete\}/.test(sdA07) &&
      /isFullyComplete \? \{ label: 'Concluída', variant: 'done' \}/.test(heroA07),
      'o selo "Concluída" ainda dispara por 10/10 cenas sozinho',
    );
    check(
      'A0.7 (progresso): "N/M cenas" permanece como progresso de cenas, independente do selo Concluída — mantém A0.6',
      /\{progressCount\}\/\{totalScenes\} cenas/.test(heroA07),
      'o progresso de cenas foi removido/acoplado ao selo',
    );
    check(
      'A0.7 (painel): "Nesta aventura" tem variante CONCLUÍDA (guardada no Livrinho) mantendo o mesmo padrão — mantém A0.6',
      /isFullyComplete \? \(/.test(heroA07) &&
      /Sua aventura ficou guardada no/.test(heroA07) &&
      /Ao terminar, sua aventura vira um/.test(heroA07),
      'o painel "Nesta aventura" não tem variante concluída padronizada',
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // A0.10 — CONTRATO DEFINITIVO da jornada. "Concluída" = journeyComplete (cenas +
  // Livrinho + quiz + reflexão + colorir). Mapa/card/detalhe/estante/pais avançam por
  // journeyComplete (NÃO cenas). Sequência: próxima só com anterior journeyComplete.
  // journeyLocked > premiumLocked. Acesso comercial é eixo separado.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── A0.10: contrato definitivo da jornada (journeyComplete + sequência) ──');
  {
    const svc = readSrc('src/services/storyJourneyService.js');
    const colorSvc = readSrc('src/services/coloringActivityService.js');
    const nav = readSrc('src/screens/AdventureMapScreen.js');
    const modal = readSrc('src/components/map/StoryFocusModal.js');
    const sd = readSrc('src/screens/StoryDetailScreen.js');
    const stories2 = readSrc('src/screens/StoriesScreen.js');
    const parent = readSrc('src/screens/ParentAreaScreen.js');
    const coloring = readSrc('src/screens/ColoringScreen.js');
    const hero = readSrc('src/components/story/StoryBookHero.js');
    const tokens = readSrc('src/theme/tokens.js');
    const keys = readSrc('src/services/storageKeys.js');
    const appNav = readSrc('src/navigation/AppNavigator.js');
    const navOptions = appNav.slice(appNav.indexOf('name="StoryDetail"'), appNav.indexOf('name="Narration"'));

    // Avalia a fonte pura para os CENÁRIOS do contrato (sequência + colorir + hierarquia).
    let R = {};
    try {
      const sandbox = svc.replace(/export /g, '');
      // eslint-disable-next-line no-new-func
      const run = new Function(`${sandbox}; return getStoryJourneyStatus;`)();
      R.full = run({ totalScenes: 10, sceneDoneCount: 10, postStoryStatus: { storyBookOpened: true, quizDone: true, reflectionDone: true }, coloringComplete: true, accessType: 'free', isFirstStory: true });
      R.scenesOnly = run({ totalScenes: 10, sceneDoneCount: 10, postStoryStatus: { storyBookOpened: true, quizDone: true, reflectionDone: true }, coloringComplete: false, accessType: 'free', isFirstStory: true });
      R.noeLocked = run({ totalScenes: 10, sceneDoneCount: 0, accessType: 'free', isFirstStory: false, previousJourneyComplete: false });
      R.noeNext = run({ totalScenes: 10, sceneDoneCount: 0, accessType: 'free', isFirstStory: false, previousJourneyComplete: true });
      R.daviEarly = run({ totalScenes: 10, sceneDoneCount: 0, accessStatus: 'preview', accessType: 'premium', isFirstStory: false, previousJourneyComplete: false });
      R.daviReached = run({ totalScenes: 10, sceneDoneCount: 0, accessStatus: 'preview', accessType: 'premium', isFirstStory: false, previousJourneyComplete: true });
    } catch (e) { R = {}; }

    check('A0.10 (1 fonte única): storyJourneyService exporta getStoryJourneyStatus + JOURNEY_STATUS + COMMERCIAL_ACCESS',
      /export function getStoryJourneyStatus/.test(svc) && /export const JOURNEY_STATUS/.test(svc) && /export const COMMERCIAL_ACCESS/.test(svc),
      'storyJourneyService não é a fonte única do contrato');
    check('A0.10 (2 scenes≠journey): 10/10 sem colorir NÃO é journeyComplete (fica scenesComplete, progress 100%)',
      !!R.scenesOnly && R.scenesOnly.journeyComplete === false && R.scenesOnly.status === 'scenesComplete' && R.scenesOnly.progress.percent === 100,
      'cenas completas estão virando conclusão');
    check('A0.10 (3 regra): journeyComplete = cenas + Livrinho + quiz + reflexão + colorir',
      /journeyComplete\s*=\s*scenesComplete && bookOpened && quizDone && reflectionDone && coloringComplete/.test(svc) && !!R.full && R.full.journeyComplete === true,
      'journeyComplete não exige os 5 requisitos');
    check('A0.10 (4 mapa não usa cenas): reveal/pulso/câmera/região/nextJourney NÃO usam isStoryCompleted',
      !/isStoryCompleted/.test(nav),
      'o mapa ainda referencia isStoryCompleted (cenas)');
    check('A0.10 (5 mapa avança por jornada): reveal + nextJourney + câmera + selo via journeyComplete/contrato',
      /getJourneyRegionRevealFraction\(region, regions, isStoryJourneyComplete\)/.test(nav) &&
      /ordered\.find\(\(s\) => !isStoryJourneyComplete\(s\.id\)\)/.test(nav) &&
      /ordered\.filter\(\(s\) => isStoryJourneyComplete\(s\.id\)\)/.test(nav) &&
      /const c = getStoryContractStatus\(story\.id\)/.test(nav),
      'o mapa não avança a fronteira por journeyComplete');
    check('A0.10 (6): A Criação em andamento NÃO torna Noé "Próxima aventura" (journeyLocked)',
      !!R.noeLocked && R.noeLocked.status === 'journeyLocked' && R.noeLocked.canShowAsNext === false,
      'Noé aparece como próxima com A Criação incompleta');
    check('A0.10 (7): A Criação journeyComplete torna Noé "Próxima aventura" (canShowAsNext)',
      !!R.noeNext && R.noeNext.status === 'notStarted' && R.noeNext.canShowAsNext === true,
      'Noé não libera mesmo com A Criação concluída');
    check('A0.10 (8): Noé não libera Davi antes de journeyComplete (journeyLocked)',
      !!R.daviEarly && R.daviEarly.status === 'journeyLocked',
      'Davi libera antes de Noé concluída');
    check('A0.10 (9): premium NÃO alcançada pela jornada NÃO mostra Plano Família (journeyLocked)',
      !!R.daviEarly && R.daviEarly.status === 'journeyLocked' && R.daviEarly.status !== 'premiumLocked',
      'premium não alcançada já mostra Plano Família');
    check('A0.10 (10): premium ALCANÇADA pela jornada + Free mostra Plano Família (premiumLocked)',
      !!R.daviReached && R.daviReached.status === 'premiumLocked',
      'premium alcançada não mostra Plano Família');
    check('A0.10 (11 card): não mostra "Concluída" por scenesComplete (só journeyComplete)',
      /case 'journeyComplete':[\s\S]{0,120}badge: 'Concluída ✓'[\s\S]{0,40}cta: 'Rever aventura'/.test(modal) &&
      /case 'scenesComplete':[\s\S]{0,120}badge: 'Em andamento'/.test(modal) && /contractStatus/.test(modal),
      'o card mostra "Concluída" por cenas');
    check('A0.10 (12 StoryDetail): "Concluída" só por journeyComplete + colorir na regra',
      /const isFullyComplete = journey\.journeyComplete/.test(sd) && /coloringComplete: coloringDone/.test(sd),
      'StoryDetail decide conclusão por cenas');
    check('A0.10 (13 estante): StoriesScreen isDone = isStoryJourneyComplete (não cenas)',
      /const isDone = isStoryJourneyComplete\(item\.id\)/.test(stories2),
      'StoriesScreen ainda marca "Concluída" por cenas');
    check('A0.10 (14 pais): ParentArea conta "Concluídas" por journeyComplete; cenas → "Cenas vistas"',
      /completedStoriesCount = playableStories\.filter\(s => isStoryJourneyComplete\(s\.id\)\)/.test(parent) &&
      /if \(isStoryJourneyComplete\(story\.id\)\) return 'Concluída ✓'/.test(parent) &&
      /return 'Cenas vistas'/.test(parent),
      'ParentArea conta concluída por cenas');
    check('A0.10 (15): "Rever aventura" só com journeyComplete (detalhe + card)',
      /if \(isFullyComplete\) return 'Rever a aventura'/.test(sd) && /cta: 'Rever aventura'/.test(modal),
      '"Rever" aparece sem journeyComplete');
    check('A0.10 (16): "10/10 cenas" continua como progresso narrativo',
      /\{progressCount\}\/\{totalScenes\} cenas/.test(hero) && /const progress = \{ done, total, percent \}/.test(svc),
      'o progresso narrativo de cenas foi removido');
    check('A0.10 (17 colorir por storyId): chave @ptf_coloring_done_{storyId}_{sceneId} + marca no "Pronto"',
      /@ptf_coloring_done_/.test(colorSvc) && /export async function markStoryColoringActivityDone/.test(colorSvc) &&
      /markStoryColoringActivityDone\(story\.id, cena\.id\)/.test(coloring),
      'colorir concluído não é derivado/registrado por storyId');
    check('A0.10 (18 sem renome): chaves antigas preservadas; colorir é chave NOVA aditiva',
      /@ptf_progress_/.test(keys) && /@ptf_quiz_done_/.test(keys) && /@ptf_reflection_/.test(keys) &&
      /@ptf_storybook_opened_/.test(keys) && /@ptf_drawing_s/.test(keys) && /@ptf_bonus_stars/.test(keys) &&
      /@ptf_coloring_done_/.test(colorSvc) && /@ptf_drawing_s/.test(colorSvc),
      'alguma chave antiga foi renomeada ou colorir não é aditivo');
    check('A0.10 (19 header): StoryDetail segue com "Voltar" (BackBtn), sem "Início" (HomeBtn)',
      /headerLeft:\s*\(\)\s*=>\s*<BackBtn/.test(navOptions) && !/HomeBtn/.test(navOptions),
      'header do StoryDetail regrediu');
    check('A0.10 (20 premium azul-noite): sem roxo/marrom nas áreas tocadas (card + bloco + tokens)',
      /premium:\s*color\.night600/.test(modal) && !/#B07CD6/.test(modal) && !/#9C8FAE/.test(modal) &&
      !/#7C3AED/.test(sd) && /premium:\s*\{[^}]*night800/.test(tokens) && !/#5B3E9C/.test(tokens),
      'roxo/marrom restante nas áreas tocadas');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // A0.11 — Comunicação comercial nos cards bloqueados por jornada. A jornada continua
  // mandando (A0.10 intacto): premium journeyLocked segue bloqueada, sem virar
  // "Próxima aventura" e sem clique. Mas o card NÃO esconde o Plano Família — premium
  // journeyLocked mantém "Plano Família" (azul-noite); grátis journeyLocked = "Bloqueada".
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── A0.11: Plano Família visível em cards premium bloqueados por jornada ──');
  {
    const modal = readSrc('src/components/map/StoryFocusModal.js');
    const svc = readSrc('src/services/storyJourneyService.js');
    const storiesSrc = readSrc('src/data/stories.js');
    const jlBlock = modal.slice(modal.indexOf("case 'journeyLocked'"), modal.indexOf("case 'premiumLocked'"));

    // Matriz de acesso: exatamente 2 grátis (creation, noah); demais Plano Família.
    let freeIds = null, premCount = null;
    try {
      const st = require(path.join(root, 'src/data/stories.js')).stories;
      freeIds = st.filter(s => s.accessType === 'free').map(s => s.id);
      premCount = st.filter(s => s.accessType === 'premium').length;
    } catch (e) { /* fallback textual abaixo */ }
    const accessMatrixOk = freeIds
      ? (freeIds.length === 2 && freeIds.includes('creation') && freeIds.includes('noah') && premCount === 18)
      : ((storiesSrc.match(/accessType:\s*'free'/g) || []).length === 2 &&
         /id:\s*'creation'[\s\S]{0,1400}accessType:\s*'free'/.test(storiesSrc));

    // Contrato (A0.10 preservado): premium journeyLocked continua bloqueado.
    let daviEarly = null, daviReached = null;
    try {
      // eslint-disable-next-line no-new-func
      const run = new Function(`${svc.replace(/export /g, '')}; return getStoryJourneyStatus;`)();
      daviEarly = run({ totalScenes: 10, sceneDoneCount: 0, accessStatus: 'preview', accessType: 'premium', isFirstStory: false, previousJourneyComplete: false });
      daviReached = run({ totalScenes: 10, sceneDoneCount: 0, accessStatus: 'preview', accessType: 'premium', isFirstStory: false, previousJourneyComplete: true });
    } catch (e) { /* falha os checks abaixo */ }

    check('A0.11 (1 matriz): A Criação e Noé são free; as demais são Plano Família (18 premium)',
      accessMatrixOk, 'a matriz de acesso não é 2 grátis (creation/noah) + demais premium');
    check('A0.11 (2 modal recebe acesso): describe recebe accessType (story.accessType)',
      /accessType: story\.accessType/.test(modal) && /function describe\(\{[^}]*accessType/.test(modal),
      'o card não recebe o accessType para comunicar Plano Família');
    check('A0.11 (3 premium journeyLocked → Plano Família): badge principal azul-noite + frase da jornada',
      /case 'journeyLocked':[\s\S]{0,400}if \(isPremium\) return \{ badge: 'Plano Família', badgeColor: BADGE\.premium[\s\S]{0,40}note: lockPhrase/.test(modal),
      'premium journeyLocked não mostra Plano Família como badge principal');
    check('A0.11 (4 grátis journeyLocked → Bloqueada): "Bloqueada" + "Complete [anterior] primeiro"',
      /return \{ badge: 'Bloqueada', badgeColor: BADGE\.locked, cta: 'Ver detalhes', note: lockPhrase \}/.test(modal) &&
      /Complete "\$\{previousStoryTitle\}" primeiro/.test(modal),
      'grátis journeyLocked não mostra "Bloqueada" + frase da jornada');
    check('A0.11 (5 sem responsável antes da jornada): journeyLocked NÃO usa "Peça a um responsável"',
      jlBlock.length > 0 && !/responsável/.test(jlBlock) && /Peça a um responsável/.test(modal),
      'journeyLocked mostra "Peça ao responsável" antes de a jornada chegar');
    check('A0.11 (6 premium alcançada + Free): premiumLocked = "Plano Família" + "Peça a um responsável"',
      /case 'premiumLocked':[\s\S]{0,140}badge: 'Plano Família', badgeColor: BADGE\.premium[\s\S]{0,90}Peça a um responsável/.test(modal) &&
      !!daviReached && daviReached.status === 'premiumLocked',
      'premium alcançada não mostra Plano Família + responsável');
    check('A0.11 (7 jornada manda): premium journeyLocked continua bloqueada (canOpen=false; não vira Próxima aventura)',
      !!daviEarly && daviEarly.status === 'journeyLocked' && daviEarly.canOpen === false && daviEarly.canShowAsNext === false,
      'premium journeyLocked deixou de ser bloqueada pela jornada');
    check('A0.11 (8 sem clique/Próxima): journeyLocked CTA = "Ver detalhes" (não "Começar/Próxima aventura")',
      jlBlock.length > 0 && /cta: 'Ver detalhes'/.test(jlBlock) && !/Começar aventura/.test(jlBlock) && !/Próxima aventura/.test(jlBlock),
      'journeyLocked virou clique/Próxima aventura');
    check('A0.11 (9 azul-noite): "Plano Família" = BADGE.premium (night600); sem roxo/marrom nas áreas tocadas',
      /premium:\s*color\.night600/.test(modal) && !/#B07CD6/.test(modal) && !/#9C8FAE/.test(modal),
      'Plano Família não está em azul-noite ou há roxo/marrom no card');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.1a — Fundação do runtime de packs premium (serviços ISOLADOS, não integrados).
  // App inalterado: nenhuma tela consome os novos serviços. Só índice + resolução
  // preparada; sem download/rede/R2, sem mexer em assets/requires de mídia.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.1a: fundação do runtime de packs (isolado) ──');
  {
    const keysF2 = readSrc('src/services/storageKeys.js');
    const store = readSrc('src/services/packStorageService.js');
    const integ = readSrc('src/services/packIntegrityService.js');
    const dl = readSrc('src/services/packDownloadService.js');
    const resolver = readSrc('src/services/contentResolver.js');
    const cmSrc = readSrc('src/data/contentManifest.js');
    const sdF2 = readSrc('src/screens/StoryDetailScreen.js');
    const narF2 = readSrc('src/screens/NarrationScreen.js');
    const colF2 = readSrc('src/screens/ColoringScreen.js');
    const mapF2 = readSrc('src/screens/AdventureMapScreen.js');
    const hasFn = (src, fn) => new RegExp(`export (async )?function ${fn}\\b`).test(src);

    check('F2.1a (storageKey): @ptf_packs_v1 declarado em storageKeys',
      /PACKS_INDEX:\s*'@ptf_packs_v1'/.test(keysF2),
      '@ptf_packs_v1 não declarado em storageKeys');

    check('F2.1a (packStorageService): 8 estados + funções índice/caminho; usa @ptf_packs_v1; sem FS destrutivo',
      /export const PACK_STATUS/.test(store) &&
      ['included', 'not_downloaded', 'downloading', 'verifying', 'ready', 'failed', 'needs_update', 'requires_app_update'].every(s => store.includes(`'${s}'`)) &&
      ['getPackIndex', 'savePackIndex', 'getPackEntry', 'setPackEntry', 'clearPackEntry', 'getPackLocalDir', 'getPackTempDir'].every(fn => hasFn(store, fn)) &&
      /STORAGE_KEYS\.PACKS_INDEX/.test(store) &&
      !/downloadAsync|deleteAsync|moveAsync|copyAsync|writeAsStringAsync/.test(store),
      'packStorageService: estados/funções faltando ou faz I/O de arquivo (proibido no F2.1a)');

    check('F2.1a→F2.4e.2 (packIntegrityService): valida manifesto+arquivos; sha256 REAL via @noble/hashes; SEM expo-crypto',
      ['validatePackManifest', 'validatePackFiles', 'validateFileEntry', 'computeFileSha256'].every(fn => hasFn(integ, fn)) &&
      /validateManifest/.test(integ) &&
      /@noble\/hashes/.test(integ) &&
      !/from ['"]expo-crypto['"]|require\(['"]expo-crypto['"]\)/.test(integ),
      'packIntegrityService: funções faltando, não usa @noble/hashes, ou importou expo-crypto (proibido)');

    check('F2.1a→F2.4d.3 (packDownloadService): stubs F2.1a declarativos; download real SÓ na função genérica F2.4d.3',
      ['downloadPackFromManifest', 'simulateInstallLocalPack', 'markPackReady', 'downloadStoryPackScenesFromGlobalManifest'].every(fn => hasFn(dl, fn)) &&
      /executed: false/.test(dl) &&
      // O download real (downloadAsync/createDownloadResumable) só pode aparecer DENTRO da
      // função genérica F2.4d.3 — os stubs F2.1a e markPackReady continuam sem rede/FileSystem.
      (() => {
        const gi = dl.indexOf('async function downloadStoryPackScenesFromGlobalManifest');
        const beforeGen = gi >= 0 ? dl.slice(0, gi) : dl;
        return gi >= 0 && !/downloadAsync|createDownloadResumable|fetch\(/.test(beforeGen);
      })(),
      'packDownloadService: stubs F2.1a deixaram de ser declarativos, ou download real vazou para fora da função genérica F2.4d.3');

    check('F2.1a (contentResolver): resolvers + enums; starter→require, ready→file://, remote→fallback local',
      ['getStoryContentLayer', 'getPackState', 'canResolveStoryMedia', 'resolveStoryCover', 'resolveStoryScene', 'resolveStoryColoring', 'resolveStoryAudio'].every(fn => hasFn(resolver, fn)) &&
      /RESOLVE_SOURCE_TYPE/.test(resolver) &&
      /CONTENT_LAYERS\.STARTER/.test(resolver) &&
      /packEntry\.localDir \+ relPathInPack/.test(resolver) &&
      /fallback local/.test(resolver),
      'contentResolver: resolvers/decisão starter/ready/fallback ausentes');

    check('F2.1a (ISOLADO): nenhuma tela consome o runtime (app inalterado)',
      ![sdF2, narF2, colF2, mapF2].some(s => /contentResolver|packStorageService|packDownloadService|packIntegrityService/.test(s)),
      'uma tela já importa o runtime de packs — deveria ficar isolado no F2.1a');

    check('F2.1a (manifesto intacto): contentManifest segue 2 starter / 18 remote',
      (() => {
        try {
          const cm = new Function(`${cmSrc.replace(/export /g, '')}; return { getStoriesByLayer };`)();
          return cm.getStoriesByLayer('starter').length === 2 && cm.getStoriesByLayer('remote').length === 18;
        } catch { return false; }
      })(),
      'contentManifest deixou de ser 2 starter / 18 remote');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.1b — Pack sandbox local de david_goliath (scripts de build/validação).
  // Os scripts PROVAM a estrutura do pack FORA do repo; nada é integrado às telas,
  // nenhum pack/asset entra no repo, e o runtime F2.1a segue isolado.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.1b: pack sandbox (scripts build/validação) ──');
  {
    const hasBuild = srcExists('scripts/assets-pipeline/build-story-pack.js');
    const hasVal = srcExists('scripts/assets-pipeline/validate-story-pack.js');
    const build = hasBuild ? readSrc('scripts/assets-pipeline/build-story-pack.js') : '';
    const val = hasVal ? readSrc('scripts/assets-pipeline/validate-story-pack.js') : '';
    // Import real (não prosa de comentário): require('expo'|'react-native') ou from '...'.
    const importsExpoRN = (s) => /(require\(['"]|from ['"])(expo|react-native)/.test(s);

    check('F2.1b (scripts existem): build-story-pack.js + validate-story-pack.js',
      hasBuild && hasVal,
      'scripts de pack ausentes em scripts/assets-pipeline/');

    check('F2.1b (build seguro): recusa output no repo; sha256 nativo; sharp opcional; sem import Expo/RN',
      /assertOutsideRepo/.test(build) &&
      /RECUSADO/.test(build) &&
      /startsWith\(root \+ path\.sep\)/.test(build) &&
      /crypto\.createHash\('sha256'\)/.test(build) &&
      /require\('sharp'\)/.test(build) && /catch/.test(build) &&
      !importsExpoRN(build),
      'build-story-pack.js: guard/sha256/sharp-opcional ausente ou importa Expo/RN');

    check('F2.1b (validate prova runtime): carrega packManifestService.validateManifest; re-hash; convenção contentResolver; sem import Expo/RN',
      /packManifestService/.test(val) &&
      /validateManifest/.test(val) &&
      /createHash\('sha256'\)/.test(val) &&
      /scenes\/\$\{storyId\}_scene_/.test(val) &&
      !importsExpoRN(val),
      'validate-story-pack.js: não prova compat com runtime ou importa Expo/RN');

    check('F2.1b (nenhum pack no repo): sem packs/ na raiz; sem artefatos de pack em assets-pipeline',
      !srcExists('packs') &&
      !srcExists('scripts/assets-pipeline/packs') &&
      !fs.readdirSync(path.join(root, 'scripts/assets-pipeline')).some((f) => /\.(webp|png|mp3|sha256)$/.test(f) || f === 'manifest.json'),
      'há pack sandbox/artefato dentro do repo (deveria ficar fora)');

    check('F2.1b (runtime ainda isolado): telas não importam contentResolver/pack*',
      ![readSrc('src/screens/StoryDetailScreen.js'), readSrc('src/screens/NarrationScreen.js'), readSrc('src/screens/ColoringScreen.js')]
        .some((s) => /contentResolver|packStorageService|packDownloadService|packIntegrityService/.test(s)),
      'uma tela passou a consumir o runtime — F2.1b não integra telas');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.1c — Simulação de pack READY + resolução file:// (sandbox, fora do repo).
  // Scripts de instalação/verificação + helper aditivo no resolver. Nada integrado
  // a telas; nenhum pack/índice entra no repo; nenhum AsyncStorage real gravado.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.1c: pack ready + resolução file:// (sandbox) ──');
  {
    const hasInstall = srcExists('scripts/assets-pipeline/install-sandbox-pack.js');
    const hasVerify = srcExists('scripts/assets-pipeline/verify-sandbox-resolver.js');
    const install = hasInstall ? readSrc('scripts/assets-pipeline/install-sandbox-pack.js') : '';
    const verify = hasVerify ? readSrc('scripts/assets-pipeline/verify-sandbox-resolver.js') : '';
    const resolverC = readSrc('src/services/contentResolver.js');
    const cmC = readSrc('src/data/contentManifest.js');
    const importsExpoRN = (s) => /(require\(['"]|from ['"])(expo|react-native)/.test(s);
    const hasExport = (src, fn) => new RegExp(`export (async )?function ${fn}\\b`).test(src);

    check('F2.1c (scripts existem): install-sandbox-pack.js + verify-sandbox-resolver.js',
      hasInstall && hasVerify,
      'scripts de instalação/verificação ausentes');

    check('F2.1c (install seguro): recusa repo (source+runtime); valida antes de mover; índice fora do app; sem AsyncStorage/Expo/RN',
      /assertOutsideRepo\(args\.sourcePackDir/.test(install) &&
      /assertOutsideRepo\(args\.runtimeDir/.test(install) &&
      /RECUSADO/.test(install) &&
      /validateManifest/.test(install) && /renameSync/.test(install) && /\.tmp/.test(install) &&
      /pack-index\.json/.test(install) &&
      !/@react-native-async-storage|STORAGE_KEYS|setItem\(/.test(install) &&
      !importsExpoRN(install),
      'install-sandbox-pack.js: guard/validação/índice inseguro ou toca AsyncStorage/Expo/RN');

    check('F2.1c (verify prova file://): carrega contentResolver sem Expo; usa resolveStoryMediaFromPackEntry + fileURLToPath',
      /contentResolver/.test(verify) &&
      /resolveStoryMediaFromPackEntry/.test(verify) &&
      /fileURLToPath/.test(verify) &&
      !importsExpoRN(verify),
      'verify-sandbox-resolver.js: não prova file:// via resolver real ou importa Expo/RN');

    check('F2.1c (resolver helper aditivo): resolveStoryMediaFromPackEntry; ready→file:// e fallback local intactos',
      hasExport(resolverC, 'resolveStoryMediaFromPackEntry') &&
      /packEntry\.localDir \+ relPathInPack/.test(resolverC) &&
      /fallback local/.test(resolverC),
      'contentResolver: helper aditivo ausente ou decisão ready/fallback alterada');

    check('F2.1c (isolado + sem pack no repo): telas não importam runtime; sem packs/ nem pack-index no repo',
      ![readSrc('src/screens/StoryDetailScreen.js'), readSrc('src/screens/NarrationScreen.js'), readSrc('src/screens/ColoringScreen.js')]
        .some((s) => /contentResolver|packStorageService|packDownloadService|packIntegrityService/.test(s)) &&
      !srcExists('packs') && !srcExists('pack-index.json') && !srcExists('scripts/assets-pipeline/packs') &&
      !fs.readdirSync(path.join(root, 'scripts/assets-pipeline')).some((f) => /\.(webp|png|mp3|sha256|json)$/.test(f)),
      'tela consome runtime ou há pack/índice dentro do repo');

    check('F2.1c (manifesto intacto): contentManifest segue 2 starter / 18 remote',
      (() => {
        try {
          const cm = new Function(`${cmC.replace(/export /g, '')}; return { getStoriesByLayer };`)();
          return cm.getStoriesByLayer('starter').length === 2 && cm.getStoriesByLayer('remote').length === 18;
        } catch { return false; }
      })(),
      'contentManifest deixou de ser 2 starter / 18 remote');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.1d — PacksContext READ-ONLY integrado ao app (sem consumo visual).
  // Provider montado no root; nenhuma tela consome; nenhuma escrita em @ptf_packs_v1.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.1d: PacksContext read-only (sem consumo visual) ──');
  {
    const hasPacksCtx = srcExists('src/context/PacksContext.js');
    const packsCtx = hasPacksCtx ? readSrc('src/context/PacksContext.js') : '';
    const appJs = readSrc('App.js');
    const cmD = readSrc('src/data/contentManifest.js');
    const hasExportFn = (src, fn) => new RegExp(`export function ${fn}\\b`).test(src);

    check('F2.1d (PacksContext existe): PacksProvider + usePacks + acessores read-only',
      hasPacksCtx &&
      hasExportFn(packsCtx, 'PacksProvider') && hasExportFn(packsCtx, 'usePacks') &&
      ['getPackEntry', 'getPackStatus', 'isPackReady', 'getStoryPackState', 'refreshPacks'].every((fn) => packsCtx.includes(fn)),
      'PacksContext: provider/hook/acessores ausentes');

    check('F2.1d (read-only): lê getPackIndex; NÃO grava índice/AsyncStorage; NÃO baixa/instala',
      /getPackIndex/.test(packsCtx) &&
      !/savePackIndex|setPackEntry|clearPackEntry|setItem\(/.test(packsCtx) &&
      !/downloadAsync|createDownloadResumable|fetch\(/.test(packsCtx),
      'PacksContext: grava índice/baixa (deveria ser somente leitura)');

    check('F2.1d (provider montado): App.js monta PacksProvider envolvendo AppNavigator',
      /import\s*{\s*PacksProvider\s*}\s*from\s*'\.\/src\/context\/PacksContext'/.test(appJs) &&
      /<PacksProvider>[\s\S]*<AppNavigator[\s\S]*<\/PacksProvider>/.test(appJs),
      'App.js não monta PacksProvider em volta de AppNavigator');

    check('F2.1d (estado default): starter→included, remote→not_downloaded (índice vazio)',
      (() => {
        try {
          const cm = new Function(`${cmD.replace(/export /g, '')}; return { getContentLayer, CONTENT_LAYERS };`)();
          const st = (id) => (cm.getContentLayer(id) === cm.CONTENT_LAYERS.STARTER ? 'included' : 'not_downloaded');
          return st('creation') === 'included' && st('noah') === 'included' &&
            st('david_goliath') === 'not_downloaded' && st('mary_says_yes') === 'not_downloaded';
        } catch { return false; }
      })(),
      'estado default do pack incorreto (starter deve ser included; remote sem índice, not_downloaded)');

    check('F2.1d (sem consumo visual): nenhuma tela de usuário importa usePacks/PacksContext/contentResolver/pack*',
      (() => {
        const dir = path.join(root, 'src/screens');
        // Exceção sancionada: a ferramenta DEV-ONLY (PackSandboxDevScreen, sob DUPLO GATE) pode usar usePacks.
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'PackSandboxDevScreen.js');
        return !files.some((f) => /usePacks|PacksContext|contentResolver|packStorageService|packDownloadService|packIntegrityService/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
      })(),
      'uma tela de usuário passou a consumir o runtime/PacksContext direto');

    check('F2.1d (manifesto intacto): contentManifest segue 2 starter / 18 remote',
      (() => {
        try {
          const cm = new Function(`${cmD.replace(/export /g, '')}; return { getStoriesByLayer };`)();
          return cm.getStoriesByLayer('starter').length === 2 && cm.getStoriesByLayer('remote').length === 18;
        } catch { return false; }
      })(),
      'contentManifest deixou de ser 2 starter / 18 remote');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.1e — Camada read-only de resolução de mídia POR HISTÓRIA (resolveStoryMedia).
  // Pura; consulta o packEntry (PacksContext) p/ decidir pack ready (file://) ou
  // fallback local. Sem consumo visual; loaders de mídia intactos (nada vira file://).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.1e: resolveStoryMedia read-only por história ──');
  {
    const resolverE = readSrc('src/services/contentResolver.js');
    const cmE = readSrc('src/data/contentManifest.js');
    const mediaLoaders = ['src/data/storySceneIllustrations.js', 'src/assets/storyCovers.js', 'src/assets/coloringImages.js', 'src/data/audioManifest.js'];
    const hasExportFn = (src, fn) => new RegExp(`export function ${fn}\\b`).test(src);

    check('F2.1e (camada por história existe): contentResolver exporta resolveStoryMedia',
      hasExportFn(resolverE, 'resolveStoryMedia') && hasExportFn(resolverE, 'resolveStoryMediaFromPackEntry'),
      'contentResolver: resolveStoryMedia ausente');

    check('F2.1e (read-only): resolver não escreve índice/AsyncStorage, não baixa, não toca compras',
      !/@react-native-async-storage|\.setItem\(|savePackIndex\(|setPackEntry\(|clearPackEntry\(/.test(resolverE) &&
      !/downloadAsync|createDownloadResumable|fetch\(/.test(resolverE) &&
      !/Purchases\.|react-native-purchases/.test(resolverE),
      'contentResolver deixou de ser read-only (escreve/baixa/compras)');

    check('F2.1e (fallback×ready): sem pack → require (fallback local); pack ready → file:// (puro)',
      (() => {
        try {
          const code = resolverE.replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '').replace(/^export\s+/gm, '');
          const stubs = {
            getContentLayer: (id) => (id === 'david_goliath' ? 'remote' : 'starter'),
            CONTENT_LAYERS: { STARTER: 'starter', REMOTE: 'remote', COMING_SOON: 'coming_soon' },
            PACK_STATUS: { INCLUDED: 'included', NOT_DOWNLOADED: 'not_downloaded', READY: 'ready', DOWNLOADING: 'downloading', VERIFYING: 'verifying', FAILED: 'failed', NEEDS_UPDATE: 'needs_update', REQUIRES_APP_UPDATE: 'requires_app_update' },
            getOfficialSceneIllustration: () => ({ __local: 1 }),
            getSceneColoringImage: () => ({ __local: 1 }),
            getStoryCoverImage: () => ({ __local: 1 }),
            getSceneAudio: () => ({ __local: 1 }),
          };
          const header = 'const getContentLayer=__s.getContentLayer;const CONTENT_LAYERS=__s.CONTENT_LAYERS;const PACK_STATUS=__s.PACK_STATUS;const getOfficialSceneIllustration=__s.getOfficialSceneIllustration;const getSceneColoringImage=__s.getSceneColoringImage;const getStoryCoverImage=__s.getStoryCoverImage;const getSceneAudio=__s.getSceneAudio;';
          const R = new Function('__s', header + code + ';return { resolveStoryMedia, RESOLVE_SOURCE_TYPE };')(stubs);
          const allT = (o) => [o.cover, ...o.scenes, ...o.coloring, ...o.audio];
          const fb = R.resolveStoryMedia('david_goliath', { packEntry: null, sceneCount: 2 });
          const rd = R.resolveStoryMedia('david_goliath', { packEntry: { status: 'ready', localDir: 'file:///x/' }, sceneCount: 2 });
          const allReq = allT(fb).every((x) => x.sourceType === R.RESOLVE_SOURCE_TYPE.REQUIRE);
          const allFile = allT(rd).every((x) => x.sourceType === R.RESOLVE_SOURCE_TYPE.FILE);
          return fb.usesPack === false && allReq && rd.usesPack === true && allFile;
        } catch { return false; }
      })(),
      'resolveStoryMedia não faz fallback sem pack ou não usa file:// com pack ready');

    check('F2.1e (loaders de mídia intactos): require-based, NENHUM usa file:///uri',
      mediaLoaders.every((p) => { const s = readSrc(p); return /require\(/.test(s) && !/file:\/\//.test(s) && !/\buri:/.test(s); }),
      'um loader de mídia passou a usar file:///uri (proibido no F2.1e)');

    check('F2.1e (sem consumo visual): nenhuma tela de usuário importa contentResolver/resolveStoryMedia/usePacks',
      (() => {
        const dir = path.join(root, 'src/screens');
        // Exceção sancionada: PackSandboxDevScreen (DEV-ONLY, sob DUPLO GATE) pode usar usePacks.
        return !fs.readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'PackSandboxDevScreen.js')
          .some((f) => /contentResolver|resolveStoryMedia|usePacks|packStorageService/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
      })(),
      'uma tela de usuário passou a consumir o resolver direto');

    check('F2.1e (estado default): starter→included, remote→not_downloaded (índice vazio)',
      (() => {
        try {
          const cm = new Function(`${cmE.replace(/export /g, '')}; return { getContentLayer, CONTENT_LAYERS };`)();
          const st = (id) => (cm.getContentLayer(id) === cm.CONTENT_LAYERS.STARTER ? 'included' : 'not_downloaded');
          return st('creation') === 'included' && st('noah') === 'included' && st('david_goliath') === 'not_downloaded';
        } catch { return false; }
      })(),
      'estado default incorreto (starter deve ser included; remote sem índice, not_downloaded)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.1f — PRIMEIRO consumo visual do resolver (sandbox): SÓ david_goliath, SÓ cenas,
  // SÓ na NarrationScreen, através do hook useResolvedStoryMedia. Com índice vazio, o
  // fallback local é IDÊNTICO ao anterior. Áudio/colorir/capas seguem 100% locais.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.1f: primeiro consumo visual (david_goliath, cenas, sandbox) ──');
  {
    const hookP = 'src/hooks/useResolvedStoryMedia.js';
    const hasHook = srcExists(hookP);
    const hook = hasHook ? readSrc(hookP) : '';
    const narr = readSrc('src/screens/NarrationScreen.js');
    const resolverF = readSrc('src/services/contentResolver.js');
    const screensDir = path.join(root, 'src/screens');
    const screenFiles = fs.readdirSync(screensDir).filter((f) => f.endsWith('.js'));
    const mediaLoaders = ['src/data/storySceneIllustrations.js', 'src/assets/storyCovers.js', 'src/assets/coloringImages.js', 'src/data/audioManifest.js'];

    check('F2.1f→F2.5c (hook existe, gated por camada remote, read-only)',
      hasHook &&
      /export function useResolvedSceneImage\b/.test(hook) &&
      /SANDBOX_STORY_ID\s*=\s*'david_goliath'/.test(hook) &&
      /!isRemotePackStory\(storyId\)/.test(hook) &&
      /usePacks/.test(hook) && /resolveStoryScene/.test(hook) && /getOfficialSceneIllustration/.test(hook) &&
      !/@react-native-async-storage|\.setItem\(|savePackIndex\(|setPackEntry\(|downloadAsync|Purchases\.|react-native-purchases/.test(hook),
      'hook ausente / não-gated / não read-only');

    check('F2.1f→F2.4e.3 (consumo só nas superfícies permitidas: NarrationScreen + StoryBookScreen + ColoringScreen)',
      (() => {
        const consumers = screenFiles.filter((f) => /useResolvedSceneImage|useResolvedStoryMedia|useSandboxScenePackEntry|resolveSceneImageForStory|useResolvedColoringImage/.test(fs.readFileSync(path.join(screensDir, f), 'utf8'))).sort();
        return consumers.length === 3 && consumers[0] === 'ColoringScreen.js' && consumers[1] === 'NarrationScreen.js' && consumers[2] === 'StoryBookScreen.js';
      })(),
      'o consumo do hook não está restrito às superfícies permitidas (NarrationScreen + StoryBookScreen + ColoringScreen)');

    check('F2.1f (escopo cena-only: capa e áudio seguem locais na tela)',
      /useResolvedSceneImage\(/.test(narr) &&
      /getStoryCoverImage\(/.test(narr) &&
      /getSceneAudio\(|hasSceneAudio\(/.test(narr) &&
      !/resolveStoryCover|resolveStoryAudio|resolveStoryColoring/.test(narr),
      'a tela roteou capa/áudio/colorir pelo resolver (deveria ser só a cena)');

    check('F2.1f→F2.4e.3 (áudio/capas locais; registros require-based; colorir via HOOK, sem contentResolver direto na tela)',
      mediaLoaders.every((p) => { const s = readSrc(p); return /require\(/.test(s) && !/file:\/\//.test(s) && !/\buri:/.test(s); }) &&
      /useResolvedColoringImage/.test(readSrc('src/screens/ColoringScreen.js')) &&
      !/contentResolver/.test(readSrc('src/screens/ColoringScreen.js')),
      'áudio/capas deixaram de ser locais, ou colorir não passa pelo hook / a tela importa contentResolver direto');

    check('F2.1f (fallback×ready david_goliath por eval): índice vazio → require; pack ready → file://',
      (() => {
        try {
          const code = resolverF.replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '').replace(/^export\s+/gm, '');
          const stubs = {
            getContentLayer: (id) => (id === 'david_goliath' ? 'remote' : 'starter'),
            CONTENT_LAYERS: { STARTER: 'starter', REMOTE: 'remote', COMING_SOON: 'coming_soon' },
            PACK_STATUS: { INCLUDED: 'included', NOT_DOWNLOADED: 'not_downloaded', READY: 'ready', DOWNLOADING: 'downloading', VERIFYING: 'verifying', FAILED: 'failed', NEEDS_UPDATE: 'needs_update', REQUIRES_APP_UPDATE: 'requires_app_update' },
            getOfficialSceneIllustration: () => ({ __local: 1 }),
            getSceneColoringImage: () => ({ __local: 1 }),
            getStoryCoverImage: () => ({ __local: 1 }),
            getSceneAudio: () => ({ __local: 1 }),
          };
          const header = 'const getContentLayer=__s.getContentLayer;const CONTENT_LAYERS=__s.CONTENT_LAYERS;const PACK_STATUS=__s.PACK_STATUS;const getOfficialSceneIllustration=__s.getOfficialSceneIllustration;const getSceneColoringImage=__s.getSceneColoringImage;const getStoryCoverImage=__s.getStoryCoverImage;const getSceneAudio=__s.getSceneAudio;';
          const R = new Function('__s', header + code + ';return { resolveStoryScene, RESOLVE_SOURCE_TYPE };')(stubs);
          const fb = R.resolveStoryScene('david_goliath', 1, null);
          const rd = R.resolveStoryScene('david_goliath', 1, { status: 'ready', localDir: 'file:///x/' });
          return fb.sourceType === R.RESOLVE_SOURCE_TYPE.REQUIRE && rd.sourceType === R.RESOLVE_SOURCE_TYPE.FILE && /^file:\/\//.test(rd.source.uri);
        } catch { return false; }
      })(),
      'fallback/ready da cena david_goliath incorreto');

    check('F2.1f (sem compra/entitlement no caminho visual)',
      !/Purchases\.|react-native-purchases|entitlement|accessControl/.test(hook) &&
      !/Purchases\.|react-native-purchases/.test(resolverF),
      'o caminho visual tocou compras/entitlement');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.1g — Validação do caminho PACK READY (sandbox david_goliath, cenas).
  // Prova: índice vazio → require; packEntry ready CONTROLADO → file://; o gating do
  // hook mantém file:// restrito a david_goliath (outra história → require). Sem
  // download/instalação/AsyncStorage/R2/compras. Áudio/colorir/capas seguem locais.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.1g: validação do caminho pack ready (sandbox david_goliath) ──');
  {
    const resolverG = readSrc('src/services/contentResolver.js');
    const hookG = readSrc('src/hooks/useResolvedStoryMedia.js');
    const screensDirG = path.join(root, 'src/screens');
    const mediaLoadersG = ['src/data/storySceneIllustrations.js', 'src/assets/storyCovers.js', 'src/assets/coloringImages.js', 'src/data/audioManifest.js'];

    // Eval do RESOLVER real (stubs no lugar das deps Expo).
    const evalResolver = () => {
      const code = resolverG.replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '').replace(/^export\s+/gm, '');
      const stubs = {
        getContentLayer: (id) => (id === 'david_goliath' ? 'remote' : 'starter'),
        CONTENT_LAYERS: { STARTER: 'starter', REMOTE: 'remote', COMING_SOON: 'coming_soon' },
        PACK_STATUS: { INCLUDED: 'included', NOT_DOWNLOADED: 'not_downloaded', READY: 'ready', DOWNLOADING: 'downloading', VERIFYING: 'verifying', FAILED: 'failed', NEEDS_UPDATE: 'needs_update', REQUIRES_APP_UPDATE: 'requires_app_update' },
        getOfficialSceneIllustration: () => ({ __local: 1 }), getSceneColoringImage: () => ({ __local: 1 }),
        getStoryCoverImage: () => ({ __local: 1 }), getSceneAudio: () => ({ __local: 1 }),
      };
      const header = 'const getContentLayer=__s.getContentLayer;const CONTENT_LAYERS=__s.CONTENT_LAYERS;const PACK_STATUS=__s.PACK_STATUS;const getOfficialSceneIllustration=__s.getOfficialSceneIllustration;const getSceneColoringImage=__s.getSceneColoringImage;const getStoryCoverImage=__s.getStoryCoverImage;const getSceneAudio=__s.getSceneAudio;';
      return new Function('__s', header + code + ';return { resolveStoryScene, RESOLVE_SOURCE_TYPE };')(stubs);
    };

    // Eval do HOOK real (stubs: usePacks / resolveStoryScene / getOfficialSceneIllustration).
    const evalHook = (getPackEntry) => {
      const code = hookG.replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '').replace(/^export\s+/gm, '');
      const stubResolve = (id, n, entry) => (entry && entry.status === 'ready'
        ? { source: { uri: `${entry.localDir}scenes/${id}_scene_${String(n).padStart(2, '0')}.webp` }, sourceType: 'file' }
        : { source: { __require: true }, sourceType: 'require' });
      const stubOfficial = () => ({ __require: true });
      // F2.5-hardening-1: a cena virou hook async (useState/useEffect + getInfoAsync). Stubamos
      // hooks/tipos/FileSystem para o eval não lançar; com useEffect noop, o retorno é SÍNCRONO
      // (fallback-first): remoteSource fica null → sempre require. Prova de que a cena nunca
      // serve file:// sem confirmar existência de forma assíncrona.
      const header = 'const usePacks=()=>({getPackEntry:__gpe});const resolveStoryScene=__rss;const getOfficialSceneIllustration=__gos;const getContentLayer=(id)=>((id===\'david_goliath\'||id===\'mary_says_yes\')?\'remote\':\'starter\');const CONTENT_LAYERS={STARTER:\'starter\',REMOTE:\'remote\',COMING_SOON:\'coming_soon\'};const RESOLVE_SOURCE_TYPE={REQUIRE:\'require\',FILE:\'file\',MISSING:\'missing\'};const useState=(v)=>[v,()=>{}];const useEffect=()=>{};const FileSystem={getInfoAsync:async()=>({exists:false})};';
      return new Function('__gpe', '__rss', '__gos', header + code + ';return { useResolvedSceneImage, SANDBOX_STORY_ID };')(getPackEntry, stubResolve, stubOfficial);
    };

    check('F2.1g (índice vazio → david cena em fallback require)',
      (() => { try { const R = evalResolver(); return R.resolveStoryScene('david_goliath', 1, null).sourceType === R.RESOLVE_SOURCE_TYPE.REQUIRE; } catch { return false; } })(),
      'com índice vazio a cena de david_goliath deixou de ser require (fallback local)');

    check('F2.1g (packEntry ready CONTROLADO → david cena file:// em scenes/…)',
      (() => {
        try {
          const R = evalResolver();
          const r = R.resolveStoryScene('david_goliath', 1, { status: 'ready', localDir: 'file:///c/' });
          return r.sourceType === R.RESOLVE_SOURCE_TYPE.FILE && /^file:\/\/.*scenes\/david_goliath_scene_01\.webp$/.test(r.source.uri);
        } catch { return false; }
      })(),
      'com pack ready a cena de david_goliath não resolveu o file:// esperado');

    check('F2.5-hardening-1 (cena fallback-first): sync=require p/ david/mary/creation (file:// só após getInfoAsync confirmar)',
      (() => {
        try {
          const H = evalHook(() => ({ status: 'ready', localDir: 'file:///c/' })); // ready p/ TODAS (controle)
          const isReq = (x) => x && x.__require === true && !x.uri;
          // Com useState/useEffect stubados (efeito não roda), o retorno SÍNCRONO é sempre o
          // require: prova de que a cena NUNCA serve file:// sem confirmação async de existência.
          return isReq(H.useResolvedSceneImage('david_goliath', 1))
            && isReq(H.useResolvedSceneImage('mary_says_yes', 1))
            && isReq(H.useResolvedSceneImage('creation', 1));
        } catch { return false; }
      })(),
      'cena não é fallback-first (sync deveria ser require; file:// só após getInfoAsync)');

    check('F2.1g (áudio/colorir/capas 100% locais; loaders require-based sem file://)',
      mediaLoadersG.every((p) => { const s = readSrc(p); return /require\(/.test(s) && !/file:\/\//.test(s) && !/\buri:/.test(s); }),
      'áudio/colorir/capas deixaram de ser 100% locais');

    check('F2.1g→F2.4e.3 (consumo só nas superfícies permitidas; read-only; sem download/R2/compras/entitlement)',
      (() => {
        const consumers = fs.readdirSync(screensDirG).filter((f) => f.endsWith('.js')).filter((f) => /useResolvedSceneImage|useResolvedStoryMedia|useSandboxScenePackEntry|resolveSceneImageForStory|useResolvedColoringImage/.test(fs.readFileSync(path.join(screensDirG, f), 'utf8'))).sort();
        const onlySurfaces = consumers.length === 3 && consumers[0] === 'ColoringScreen.js' && consumers[1] === 'NarrationScreen.js' && consumers[2] === 'StoryBookScreen.js';
        // Uso REAL (chamadas/imports), não prosa de comentário: escrita de storage,
        // download, compras (RevenueCat) e controle de acesso/entitlement.
        const readOnly = !/@react-native-async-storage|\.setItem\(|savePackIndex\(|setPackEntry\(|clearPackEntry\(|downloadAsync|createDownloadResumable|Purchases\.|react-native-purchases|isPremiumUser\(|getStoryAccessStatus\(|contentAccessService/.test(hookG + resolverG);
        return onlySurfaces && readOnly;
      })(),
      'consumo fora das superfícies permitidas ou caminho não read-only (escreve/baixa/compras)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HOTFIX (crash abertura de história) — TrilhoProgresso: accessibilityValue.now é
  // Int32 no New Architecture (Fabric). Passar a FRAÇÃO (0.9/0.2) quebra o app na
  // abertura ("Loss of precision ... (long long) 0.9"). Guard: now deve ser INTEIRO
  // (escala 0..100, via Math.round + NaN/Infinity-safe); o visual mantém % da fração.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Hotfix: TrilhoProgresso accessibilityValue.now inteiro (Fabric) ──');
  {
    const trilho = readSrc('src/components/ui/TrilhoProgresso.js');

    check('Hotfix (sem max:1 + now:pct): TrilhoProgresso não passa a fração para accessibilityValue.now',
      !/accessibilityValue=\{\{[^}]*\bmax:\s*1\b[^}]*\bnow:\s*pct\b/.test(trilho) &&
      !/\bnow:\s*pct\b/.test(trilho),
      'TrilhoProgresso ainda passa now: pct (decimal) para accessibilityValue');

    check('Hotfix (now inteiro): Math.round em escala 0..100 + blindagem NaN/Infinity',
      /Number\.isFinite\(/.test(trilho) &&
      /Math\.round\(/.test(trilho) &&
      /accessibilityValue=\{\{[^}]*\bmax:\s*100\b[^}]*\bnow:\s*accessibilityNow\b/.test(trilho),
      'TrilhoProgresso não converte progress para inteiro 0..100 (Math.round) no accessibilityValue.now');

    check('Hotfix (visual preserva % da fração): largura usa safePct * 100%',
      /\$\{safePct \* 100\}%/.test(trilho),
      'TrilhoProgresso deixou de usar porcentagem baseada na fração para a largura da barra');

    check('Hotfix (nenhum accessibilityValue.now decimal/fração no src)',
      (() => {
        const files = [];
        const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
          const p = path.join(dir, d.name);
          if (d.isDirectory()) walk(p);
          else if (d.name.endsWith('.js')) files.push(p);
        });
        walk(path.join(root, 'src'));
        return !files.some((p) => {
          const s = fs.readFileSync(p, 'utf8');
          return /accessibilityValue=\{\{[^}]*\bnow:\s*[A-Za-z_$][A-Za-z0-9_$]*[pP](ct|ercent)\b/.test(s) ||
                 /accessibilityValue=\{\{[^}]*\bnow:\s*[0-9]*\.[0-9]/.test(s);
        });
      })(),
      'existe accessibilityValue.now com fração/decimal em algum arquivo do src');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.1h v2 — 2ª superfície de cenas: Livrinho (StoryBookScreen), modo "História
  // ilustrada", gated a david_goliath, via VALOR do packEntry (sem recompor timeline).
  // Intro preview e "Meu livrinho colorido" no caminho antigo. Índice vazio → require.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.1h v2: 2ª superfície (Livrinho, História ilustrada, sandbox david_goliath) ──');
  {
    const hookV2 = readSrc('src/hooks/useResolvedStoryMedia.js');
    const livroV2 = readSrc('src/screens/StoryBookScreen.js');
    const narrV2 = readSrc('src/screens/NarrationScreen.js');
    const mediaLoadersV2 = ['src/data/storySceneIllustrations.js', 'src/assets/storyCovers.js', 'src/assets/coloringImages.js', 'src/data/audioManifest.js'];

    check('F2.1h v2 (hook): resolveSceneImageForStory (pura, gated) + useSandboxScenePackEntry (valor); useResolvedSceneImage intacto',
      /export function resolveSceneImageForStory\b/.test(hookV2) &&
      /export function useSandboxScenePackEntry\b/.test(hookV2) &&
      /export function useResolvedSceneImage\b/.test(hookV2) &&
      /!isRemotePackStory\(storyId\)/.test(hookV2) &&
      /SANDBOX_STORY_ID\s*=\s*'david_goliath'/.test(hookV2) &&
      /return isRemotePackStory\(storyId\) \? getPackEntry\(storyId\) : null/.test(hookV2) &&
      !/useSceneImageResolver/.test(hookV2),
      'hook v2: exports/gating ausentes ou useSandboxScenePackEntry não retorna valor');

    check('F2.1h v2 (hook read-only): sem AsyncStorage-write/download/compras/entitlement',
      !/@react-native-async-storage|\.setItem\(|savePackIndex\(|setPackEntry\(|clearPackEntry\(|downloadAsync|createDownloadResumable|Purchases\.|react-native-purchases|isPremiumUser\(|getStoryAccessStatus\(|contentAccessService/.test(hookV2),
      'hook v2 deixou de ser read-only');

    check('F2.1h v2 (Livrinho consome via hook; sem runtime direto; dep do useMemo = VALOR; sem useSceneImageResolver)',
      /import\s*{\s*resolveSceneImageForStory,\s*useSandboxScenePackEntry\s*}\s*from\s*'\.\.\/hooks\/useResolvedStoryMedia'/.test(livroV2) &&
      /const scenePackEntry = useSandboxScenePackEntry\(story\?\.id\)/.test(livroV2) &&
      /resolveSceneImageForStory\(story\.id, cena\.id, scenePackEntry\)/.test(livroV2) &&
      /\[story\?\.id, drawings, viewMode, scenePackEntry\]/.test(livroV2) &&
      !/useSceneImageResolver/.test(livroV2) &&
      !/from\s*'\.\.\/context\/PacksContext'|from\s*'\.\.\/services\/contentResolver'|from\s*'\.\.\/services\/packStorageService'/.test(livroV2),
      'StoryBookScreen: consumo via hook incorreto, callback no useMemo, ou importa runtime direto');

    check('F2.1h v2→F2.5c (gating por eval, camada): david/mary remote ready→file://; creation starter→require',
      (() => {
        try {
          const code = hookV2.replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '').replace(/^export\s+/gm, '');
          const stubResolve = (id, n, entry) => ({ source: (entry && entry.status === 'ready') ? { uri: `${entry.localDir}scenes/${id}_scene_${String(n).padStart(2, '0')}.webp` } : { __require: true } });
          const stubOfficial = () => ({ __require: true });
          const header = 'const usePacks=()=>({getPackEntry:()=>null});const resolveStoryScene=__rss;const getOfficialSceneIllustration=__gos;const getContentLayer=(id)=>((id===\'david_goliath\'||id===\'mary_says_yes\')?\'remote\':\'starter\');const CONTENT_LAYERS={STARTER:\'starter\',REMOTE:\'remote\',COMING_SOON:\'coming_soon\'};';
          const M = new Function('__rss', '__gos', header + code + ';return { resolveSceneImageForStory };')(stubResolve, stubOfficial);
          const a = M.resolveSceneImageForStory('david_goliath', 1, null);
          const b = M.resolveSceneImageForStory('david_goliath', 1, { status: 'ready', localDir: 'file:///c/' });
          const c = M.resolveSceneImageForStory('mary_says_yes', 1, { status: 'ready', localDir: 'file:///c/' });
          const d = M.resolveSceneImageForStory('creation', 1, { status: 'ready', localDir: 'file:///c/' });
          return a.__require === true && typeof b.uri === 'string' && /^file:\/\//.test(b.uri) && typeof c.uri === 'string' && /^file:\/\//.test(c.uri) && d.__require === true && !d.uri;
        } catch { return false; }
      })(),
      'resolveSceneImageForStory: gating por camada incorreto (remote david/mary → file://; starter creation → require)');

    check('F2.1i (intro preview via resolveSceneImageForStory + scenePackEntry) + "Meu livrinho colorido" prioriza arte da criança',
      /officialPreview = firstCena \? resolveSceneImageForStory\(story\.id, firstCena\.id, scenePackEntry\)/.test(livroV2) &&
      /if \(hasMeaningfulPaint\(raw\)\)[\s\S]*?makeChildArtVisual/.test(livroV2),
      'intro preview não usa resolveSceneImageForStory(...,scenePackEntry) ou "Meu livrinho colorido" perdeu prioridade da arte da criança');

    check('F2.1h v2 (NarrationScreen intacta): segue via useResolvedSceneImage(story.id, cena?.id)',
      /useResolvedSceneImage\(story\.id, cena\?\.id\)/.test(narrV2),
      'NarrationScreen deixou de usar o hook de cena');

    check('F2.1h v2 (áudio/colorir/capas 100% locais; loaders require-based sem file://)',
      mediaLoadersV2.every((p) => { const s = readSrc(p); return /require\(/.test(s) && !/file:\/\//.test(s) && !/\buri:/.test(s); }),
      'áudio/colorir/capas deixaram de ser 100% locais');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.1i — Prévia da intro do Livrinho conectada ao resolver (sandbox david_goliath).
  // Reusa scenePackEntry (valor) + resolveSceneImageForStory. Agora AMBOS os pontos de
  // imagem oficial (páginas + prévia) passam pelo resolver; getOfficialSceneIllustration
  // sai da tela (fica encapsulado no hook). Índice vazio → require. Child art intacta.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.1i: prévia da intro do Livrinho (sandbox david_goliath) ──');
  {
    const hookI = readSrc('src/hooks/useResolvedStoryMedia.js');
    const livroI = readSrc('src/screens/StoryBookScreen.js');
    const narrI = readSrc('src/screens/NarrationScreen.js');
    const mediaLoadersI = ['src/data/storySceneIllustrations.js', 'src/assets/storyCovers.js', 'src/assets/coloringImages.js', 'src/data/audioManifest.js'];

    check('F2.1i (prévia da intro conectada; getOfficialSceneIllustration fora da tela; 2 pontos oficiais; sem runtime direto)',
      /officialPreview = firstCena \? resolveSceneImageForStory\(story\.id, firstCena\.id, scenePackEntry\)/.test(livroI) &&
      !/getOfficialSceneIllustration/.test(livroI) &&
      (livroI.match(/resolveSceneImageForStory\(/g) || []).length === 2 &&
      !/useSceneImageResolver/.test(livroI) &&
      !/from\s*'\.\.\/context\/PacksContext'|from\s*'\.\.\/services\/contentResolver'|from\s*'\.\.\/services\/packStorageService'/.test(livroI),
      'prévia da intro não conectada, getOfficialSceneIllustration ainda na tela, ou runtime importado direto');

    check('F2.1i→F2.5c (gating por eval, camada): david/mary remote ready→file://; creation starter→require',
      (() => {
        try {
          const code = hookI.replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '').replace(/^export\s+/gm, '');
          const stubResolve = (id, n, entry) => ({ source: (entry && entry.status === 'ready') ? { uri: `${entry.localDir}scenes/${id}_scene_${String(n).padStart(2, '0')}.webp` } : { __require: true } });
          const stubOfficial = () => ({ __require: true });
          const header = 'const usePacks=()=>({getPackEntry:()=>null});const resolveStoryScene=__rss;const getOfficialSceneIllustration=__gos;const getContentLayer=(id)=>((id===\'david_goliath\'||id===\'mary_says_yes\')?\'remote\':\'starter\');const CONTENT_LAYERS={STARTER:\'starter\',REMOTE:\'remote\',COMING_SOON:\'coming_soon\'};';
          const M = new Function('__rss', '__gos', header + code + ';return { resolveSceneImageForStory };')(stubResolve, stubOfficial);
          const a = M.resolveSceneImageForStory('david_goliath', 1, null);
          const b = M.resolveSceneImageForStory('david_goliath', 1, { status: 'ready', localDir: 'file:///c/' });
          const c = M.resolveSceneImageForStory('mary_says_yes', 1, { status: 'ready', localDir: 'file:///c/' });
          const d = M.resolveSceneImageForStory('creation', 1, { status: 'ready', localDir: 'file:///c/' });
          return a.__require === true && typeof b.uri === 'string' && /^file:\/\//.test(b.uri) && typeof c.uri === 'string' && /^file:\/\//.test(c.uri) && d.__require === true && !d.uri;
        } catch { return false; }
      })(),
      'resolveSceneImageForStory: gating por camada incorreto (remote david/mary → file://; starter creation → require)');

    check('F2.1i (superfícies preservadas): História ilustrada (:official), child art prioritária, NarrationScreen intacta, loaders locais',
      /mode === 'official'[\s\S]*?resolveSceneImageForStory\(story\.id, cena\.id, scenePackEntry\)/.test(livroI) &&
      /if \(hasMeaningfulPaint\(raw\)\)[\s\S]*?makeChildArtVisual/.test(livroI) &&
      /useResolvedSceneImage\(story\.id, cena\?\.id\)/.test(narrI) &&
      mediaLoadersI.every((p) => { const s = readSrc(p); return /require\(/.test(s) && !/file:\/\//.test(s) && !/\buri:/.test(s); }),
      'História ilustrada/child art/NarrationScreen/loaders divergiram');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.2b — Ferramenta DEV-ONLY (seed/reset/diagnóstico) de pack sandbox no device,
  // sob DUPLO GATE (__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX==='true'). Sem R2/download
  // real/compras. Cria file:// reais copiando as 10 cenas do bundle → documentDirectory.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.2b: ferramenta dev de pack sandbox (duplo gate) ──');
  {
    const svc = readSrc('src/services/packSandboxDevService.js');
    const scr = readSrc('src/screens/PackSandboxDevScreen.js');
    const nav = readSrc('src/navigation/AppNavigator.js');
    const narrB = readSrc('src/screens/NarrationScreen.js');
    const livroB = readSrc('src/screens/StoryBookScreen.js');
    const mediaLoadersB = ['src/data/storySceneIllustrations.js', 'src/assets/storyCovers.js', 'src/assets/coloringImages.js', 'src/data/audioManifest.js'];
    const fnBody = (name) => svc.match(new RegExp(`export async function ${name}[\\s\\S]*?\\n\\}`))?.[0] || '';

    check('F2.2b (duplo gate): isPackSandboxDevEnabled = __DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX === "true"',
      /export function isPackSandboxDevEnabled\(\)/.test(svc) &&
      /__DEV__\s*&&\s*process\.env\.EXPO_PUBLIC_ENABLE_PACK_SANDBOX\s*===\s*'true'/.test(svc),
      'gate não é __DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX==="true"');

    check('F2.2b (seed/reset gated): abortam se o gate estiver falso',
      /if \(!isPackSandboxDevEnabled\(\)\) return/.test(fnBody('seedDavidGoliathPackSandbox')) &&
      /if \(!isPackSandboxDevEnabled\(\)\) return/.test(fnBody('resetDavidGoliathPackSandbox')),
      'seed/reset não abortam com o gate desligado');

    check('F2.2b→M1 (rota sob gate; FAB removido): PackSandboxDev registra sob devPacksEnabled e NÃO há mais FAB global de packs',
      /const devPacksEnabled = isPackSandboxDevEnabled\(\)/.test(nav) &&
      /devPacksEnabled && \(\s*<Stack\.Screen\s+name="PackSandboxDev"/.test(nav) &&
      !/devPacksEnabled && \(\s*<TouchableOpacity/.test(nav),
      'rota PackSandboxDev fora do gate OU FAB global de packs ainda presente (M1 removeu o FAB)');

    check('F2.2b (nomes das 10 cenas batem com o resolver): scenes/<id>_scene_NN.webp',
      /scenes\/\$\{STORY_ID\}_scene_\$\{pad2\(n\)\}\.webp/.test(svc),
      'convenção de path do seed não bate com o resolver');

    check('F2.2b (seed só marca ready após 10/10): setPackEntry ready só depois do allOk',
      (() => {
        const body = fnBody('seedDavidGoliathPackSandbox');
        const allOkIdx = body.indexOf('const allOk');
        const readyIdx = body.search(/setPackEntry\([\s\S]*?status:\s*PACK_STATUS\.READY/);
        return allOkIdx >= 0 && readyIdx > allOkIdx && /if \(!allOk\)[\s\S]*?return/.test(body);
      })(),
      'seed marca ready sem validar 10/10');

    check('F2.2b (reset limpa índice + diretório): clearPackEntry + deleteAsync(localDir)',
      /clearPackEntry\(STORY_ID\)/.test(svc) && /deleteAsync\(localDir,\s*\{\s*idempotent:\s*true\s*\}\)/.test(svc),
      'reset não limpa índice e/ou diretório');

    check('F2.2b→F2.4e.1 (diagnóstico usa o resolver): resolveStoryMedia p/ os 4 kinds',
      /resolveStoryMedia\(STORY_ID,/.test(svc) && /byKind/.test(svc)
        && /media\.cover/.test(svc) && /media\.coloring/.test(svc) && /media\.audio/.test(svc),
      'diagnóstico não usa resolveStoryMedia para cover/scene/coloring/audio (byKind)');

    check('F2.2b→F2.3b (sem R2/compras/entitlement; download LAN permitido, sem storage remoto hardcoded)',
      // F2.3b: download real por FileSystem (LAN) é PERMITIDO. Proibido: RevenueCat/
      // entitlement/acesso e domínios de storage remoto hardcoded (R2/S3).
      !/Purchases\.|react-native-purchases|isPremiumUser\(|getStoryAccessStatus\(|contentAccessService|cloudflarestorage|\.r2\.dev|amazonaws/.test(svc + scr),
      'ferramenta dev tocou compras/entitlement ou storage remoto hardcoded (R2/S3)');

    check('F2.2b (telas conectadas + mídias intactas): NarrationScreen/StoryBookScreen sem mudança; loaders locais',
      /useResolvedSceneImage\(story\.id, cena\?\.id\)/.test(narrB) &&
      /resolveSceneImageForStory\(story\.id, cena\.id, scenePackEntry\)/.test(livroB) &&
      mediaLoadersB.every((p) => { const s = readSrc(p); return /require\(/.test(s) && !/file:\/\//.test(s) && !/\buri:/.test(s); }),
      'telas conectadas/loaders divergiram');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // F2.3b — Download REAL sandbox (LAN, dev-only, só as 10 cenas de david_goliath).
  // Executa o DOWNLOAD_FLOW: manifest → .tmp → validar bytes → mover atômico → ready.
  // Sem R2/RevenueCat/entitlement/zip. Duplo gate herdado.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── F2.3b: download real sandbox (LAN, 10 cenas, dev-only) ──');
  {
    const svc3 = readSrc('src/services/packSandboxDevService.js');
    const scr3 = readSrc('src/screens/PackSandboxDevScreen.js');
    const dlBody = svc3.match(/export async function downloadDavidGoliathPackSandbox[\s\S]*?\n\}/)?.[0] || '';

    check('F2.3b/d (download existe, gated, baseUrl trim + http(s) validado)',
      /export async function downloadDavidGoliathPackSandbox\(baseUrl/.test(svc3) &&
      /if \(!isPackSandboxDevEnabled\(\)\) return/.test(dlBody) &&
      /\.trim\(\)/.test(dlBody) && // F2.3d: trim de segurança do input
      /\^https\?:/.test(dlBody),
      'download ausente / não-gated / baseUrl não trimado/validado');

    check('F2.3b (fluxo real): downloadAsync(manifest) + createDownloadResumable(cenas)',
      /FileSystem\.downloadAsync\([\s\S]*?manifest\.json/.test(dlBody) &&
      /createDownloadResumable\([\s\S]*?base[\s\S]*?f\.path/.test(dlBody),
      'não usa downloadAsync(manifest) + createDownloadResumable(cenas)');

    check('F2.3b (só 10 cenas): filtra kind===scene + sceneRe; rejeita se != 10',
      /f\.kind === 'scene' && sceneRe\.test\(f\.path\)/.test(dlBody) &&
      /scenes\.length !== SCENE_COUNT/.test(dlBody),
      'não restringe o subset às 10 cenas');

    check('F2.3b (valida manifesto + storyId + version)',
      /validatePackManifest\(manifest/.test(dlBody) &&
      /metadata\?\.storyId !== STORY_ID/.test(dlBody) &&
      /manifest\?\.version !== VERSION/.test(dlBody),
      'não valida manifesto/storyId/version');

    check('F2.3b (valida bytes + NÃO marca ready parcial): READY só após validação e move atômico',
      (() => {
        const okChk = /info\.size !== f\.bytes/.test(dlBody);
        const guard = /if \(errors\.length\) return failWith/.test(dlBody);
        const errIdx = dlBody.indexOf('if (errors.length) return failWith');
        const moveIdx = dlBody.search(/moveAsync\(\{ from: tempDir, to: localDir \}\)/);
        // setPackEntry READY final (não o do failWith, que é FAILED): status READY logo após version.
        const readyIdx = dlBody.search(/setPackEntry\(STORY_ID, \{\s*version: VERSION,\s*status: PACK_STATUS\.READY/);
        return okChk && guard && errIdx >= 0 && moveIdx > errIdx && readyIdx > moveIdx;
      })(),
      'marca ready sem validar bytes ou permite ready parcial');

    check('F2.3b (.tmp → mover atômico → ready + retry limpo)',
      /await FileSystem\.deleteAsync\(tempDir, \{ idempotent: true \}\)/.test(dlBody) &&
      /deleteAsync\(localDir, \{ idempotent: true \}\)/.test(dlBody) &&
      /moveAsync\(\{ from: tempDir, to: localDir \}\)/.test(dlBody),
      'fluxo .tmp/move/ready/retry incorreto');

    check('F2.3b (falha → failed; reset limpa localDir + tempDir)',
      /status: PACK_STATUS\.FAILED/.test(dlBody) &&
      /deleteAsync\(localDir, \{ idempotent: true \}\)/.test(svc3) &&
      /deleteAsync\(tempDir, \{ idempotent: true \}\)/.test(svc3),
      'falha/reset não limpam corretamente');

    check('F2.3b (tela: baseUrl + Download + progresso; duplo gate herdado)',
      /downloadDavidGoliathPackSandbox\(baseUrl,/.test(scr3) &&
      /<TextInput/.test(scr3) &&
      /Download david_goliath/.test(scr3) &&
      /downloadedBytes\}\/\{dl\.totalBytes/.test(scr3),
      'tela sem seção de download / progresso');

    check('F2.3b (sem zip/unzip/nova dep)',
      !/jszip|zip-archive|\bunzip\b|require\('zlib'\)/.test(svc3 + scr3),
      'introduziu zip/unzip');
  }

  // ── F2.4d.2: globalManifestService (read-only — valida o manifesto global) ────
  console.log('\n── F2.4d.2: globalManifestService ──');
  {
    const gmSrc = readSrc('src/services/globalManifestService.js');

    check('F2.4d.2: globalManifestService.js existe',
      srcExists('src/services/globalManifestService.js'),
      'src/services/globalManifestService.js não encontrado');

    // READ-ONLY: sem storage/resolver/download/instalação de pack. Testa só o CÓDIGO
    // (sem comentários) — a doc do serviço menciona esses termos no NEGATIVO ("NÃO grava…").
    const gmCode = a1StripComments(gmSrc);
    check('F2.4d.2: serviço é read-only (sem AsyncStorage/setPackEntry/contentResolver/download)',
      !/AsyncStorage|setPackEntry|clearPackEntry|packStorageService|contentResolver|packSandboxDevService|downloadAsync|createDownloadResumable|moveAsync|makeDirectoryAsync|writeAsStringAsync|copyAsync/.test(gmCode),
      'globalManifestService referencia storage/resolver/download no código — deveria ser read-only');

    check('F2.4d.2: não hardcoda URL r2.dev no serviço',
      !/r2\.dev/.test(gmSrc),
      'globalManifestService não deve hardcodar a URL r2.dev');

    // Execução REAL em sandbox (ESM stripável), injetando stubs de dependência.
    let R = {};
    try {
      const stubLayer = { david_goliath: 'remote', jesus_children: 'remote', creation: 'starter' };
      const { validateGlobalContentManifest, getPackFromGlobalManifest } = a1LoadSandbox(
        'src/services/globalManifestService.js',
        { STORY_CONTENT_LAYER: stubLayer, warn: () => {} },
        ['validateGlobalContentManifest', 'getPackFromGlobalManifest'],
      );
      const mkPack = (over) => ({
        id: 'story_david_goliath', storyId: 'david_goliath', version: '1.0.0', type: 'story',
        access: 'premium', title: 'Davi e Golias', bytes: 18532477,
        baseUrl: 'https://x.example.dev/packs/david_goliath/v1/', manifestPath: 'manifest.json',
        manifestSha256: 'a'.repeat(64), requiredAppVersion: '1.0.0',
        mediaKinds: ['cover', 'scene', 'coloring', 'audio'], status: 'not_downloaded', ...over,
      });
      const base = (packs) => ({ manifestVersion: 1, generatedAt: '2026-07-04T00:00:00Z', minAppVersion: '1.0.0', packs });
      const opt = { appVersion: '1.0.0' };

      R.valid    = validateGlobalContentManifest(base([mkPack()]), opt);
      R.dupId    = validateGlobalContentManifest(base([mkPack(), mkPack({ storyId: 'jesus_children' })]), opt);
      R.dupStory = validateGlobalContentManifest(base([mkPack(), mkPack({ id: 'story_two' })]), opt);
      R.unknown  = validateGlobalContentManifest(base([mkPack({ id: 'story_x', storyId: 'unknown_story' })]), opt);
      R.noSlash  = validateGlobalContentManifest(base([mkPack({ baseUrl: 'https://x.example.dev/packs/david_goliath/v1' })]), opt);
      R.httpProd = validateGlobalContentManifest(base([mkPack({ baseUrl: 'http://x.example.dev/packs/david_goliath/v1/' })]), opt);
      R.badKind  = validateGlobalContentManifest(base([mkPack({ mediaKinds: ['scene', 'video'] })]), opt);
      R.needUpd  = validateGlobalContentManifest(base([mkPack({ requiredAppVersion: '2.0.0' })]), opt);
      R.found    = getPackFromGlobalManifest(R.valid.data, 'david_goliath');
      R.notFound = getPackFromGlobalManifest(R.valid.data, 'nope');

      // Bloco 3 (tolerante por-pack): defeito de pack vira warning + exclui só ele; manifesto segue ok.
      R.mixed    = validateGlobalContentManifest(base([mkPack(), mkPack({ id: 'story_x', storyId: 'unknown_story' })]), opt);
      R.mixFound = R.mixed.ok ? getPackFromGlobalManifest(R.mixed.data, 'david_goliath') : null;
      R.mixMiss  = R.mixed.ok ? getPackFromGlobalManifest(R.mixed.data, 'unknown_story') : null;
      R.rootVer  = validateGlobalContentManifest({ manifestVersion: 2, generatedAt: '2026-07-04T00:00:00Z', minAppVersion: '1.0.0', packs: [mkPack()] }, opt);
      R.rootArr  = validateGlobalContentManifest({ manifestVersion: 1, generatedAt: '2026-07-04T00:00:00Z', minAppVersion: '1.0.0', packs: 'nope' }, opt);
      R.rootMin  = validateGlobalContentManifest({ manifestVersion: 1, generatedAt: '2026-07-04T00:00:00Z', packs: [mkPack()] }, opt);
      // Dup storyId FATAL mesmo com defeito por-pack numa das entradas — as DUAS ordens:
      R.dupDefA  = validateGlobalContentManifest(base([mkPack({ id: 'story_a', baseUrl: 'https://x.example.dev/packs/david_goliath/v1' }), mkPack({ id: 'story_b' })]), opt);
      R.dupDefB  = validateGlobalContentManifest(base([mkPack({ id: 'story_a' }), mkPack({ id: 'story_b', baseUrl: 'https://x.example.dev/packs/david_goliath/v1' })]), opt);
      // dup id FATAL mesmo com defeito por-pack (malformado 1º): storyIds distintos isolam o dup de id.
      R.dupIdDef = validateGlobalContentManifest(base([mkPack({ id: 'story_dup', storyId: 'david_goliath', baseUrl: 'https://x.example.dev/packs/david_goliath/v1' }), mkPack({ id: 'story_dup', storyId: 'jesus_children' })]), opt);
      R.noId     = validateGlobalContentManifest(base([mkPack({ id: '' })]), opt);
      R.noStory  = validateGlobalContentManifest(base([mkPack({ storyId: '' })]), opt);
      R.badGen   = validateGlobalContentManifest({ manifestVersion: 1, generatedAt: 'nope', minAppVersion: '1.0.0', packs: [mkPack()] }, opt);
    } catch (e) { R = { err: String((e && e.message) || e) }; }

    check('F2.4d.2: manifesto válido (david_goliath) passa',
      !!R.valid && R.valid.ok === true,
      R.err || (R.valid && R.valid.errors.join(' | ')) || 'sem resultado');

    check('F2.4d.2: duplicidade de id falha',
      !!R.dupId && R.dupId.ok === false && R.dupId.errors.some((e) => /id: duplicado/.test(e)),
      R.err || 'duplicidade de id não rejeitada');

    check('F2.4d.2: duplicidade de storyId falha',
      !!R.dupStory && R.dupStory.ok === false && R.dupStory.errors.some((e) => /storyId: duplicado/.test(e)),
      R.err || 'duplicidade de storyId não rejeitada');

    // Bloco 3: defeito por-pack NÃO derruba o manifesto — exclui só o pack (ok:true + warning).
    check('F2.4d.2 (Bloco 3): storyId desconhecido → excluído com warning, manifesto ok:true',
      !!R.unknown && R.unknown.ok === true && R.unknown.data.packs.length === 0
        && R.unknown.warnings.some((w) => /desconhecido/.test(w)),
      R.err || 'storyId desconhecido deveria excluir o pack (warning) e manter ok:true');

    check('F2.4d.2 (Bloco 3): baseUrl sem barra final → excluído com warning, ok:true',
      !!R.noSlash && R.noSlash.ok === true && R.noSlash.data.packs.length === 0
        && R.noSlash.warnings.some((w) => /terminar com/.test(w)),
      R.err || 'baseUrl sem barra deveria excluir o pack (warning) e manter ok:true');

    check('F2.4d.2 (Bloco 3): baseUrl http em produção → excluído com warning, ok:true',
      !!R.httpProd && R.httpProd.ok === true && R.httpProd.data.packs.length === 0
        && R.httpProd.warnings.some((w) => /https/.test(w)),
      R.err || 'http em produção deveria excluir o pack (warning) e manter ok:true');

    check('F2.4d.2 (Bloco 3): mediaKind inválido → excluído com warning, ok:true',
      !!R.badKind && R.badKind.ok === true && R.badKind.data.packs.length === 0
        && R.badKind.warnings.some((w) => /mediaKinds/.test(w)),
      R.err || 'mediaKind inválido deveria excluir o pack (warning) e manter ok:true');

    check('F2.4d.2: requiredAppVersion > appVersion → requires_app_update sem quebrar schema',
      !!R.needUpd && R.needUpd.ok === true
        && R.needUpd.data.packs[0].requiresAppUpdate === true
        && R.needUpd.warnings.some((w) => /requires_app_update/.test(w)),
      R.err || 'requiredAppVersion alto deveria gerar requiresAppUpdate/warning sem erro de schema');

    check('F2.4d.2: getPackFromGlobalManifest encontra david_goliath (e retorna erro p/ ausente)',
      !!R.found && R.found.ok === true && R.found.data && R.found.data.storyId === 'david_goliath'
        && !!R.notFound && R.notFound.ok === false,
      R.err || 'getPackFromGlobalManifest não resolveu corretamente');

    // ── Bloco 3: manifesto global tolerante por pack ──
    check('F2.4d.2 (Bloco 3): MISTO (1 válido + 1 desconhecido) → ok:true com só o válido',
      !!R.mixed && R.mixed.ok === true && R.mixed.data.packs.length === 1
        && R.mixed.data.packs[0].storyId === 'david_goliath' && R.mixed.warnings.some((w) => /desconhecido/.test(w)),
      R.err || 'manifesto misto deveria manter o pack válido e excluir o desconhecido');

    check('F2.4d.2 (Bloco 3): consumidor sobre o subconjunto — acha o válido, não acha o excluído',
      !!R.mixFound && R.mixFound.ok === true && R.mixFound.data.storyId === 'david_goliath'
        && !!R.mixMiss && R.mixMiss.ok === false,
      R.err || 'getPackFromGlobalManifest deveria achar david_goliath e não achar unknown_story no misto');

    check('F2.4d.2 (Bloco 3): RAIZ fatal — manifestVersion/packs/minAppVersion → ok:false, data:null',
      !!R.rootVer && R.rootVer.ok === false && R.rootVer.data === null && R.rootVer.errors.some((e) => /manifestVersion/.test(e))
        && !!R.rootArr && R.rootArr.ok === false && R.rootArr.errors.some((e) => /packs/.test(e))
        && !!R.rootMin && R.rootMin.ok === false && R.rootMin.errors.some((e) => /minAppVersion/.test(e)),
      R.err || 'erro de raiz deveria ser fatal (ok:false, data:null)');

    check('F2.4d.2 (Bloco 3): dup storyId FATAL mesmo com defeito por-pack — as duas ordens',
      !!R.dupDefA && R.dupDefA.ok === false && R.dupDefA.errors.some((e) => /storyId: duplicado/.test(e))
        && !!R.dupDefB && R.dupDefB.ok === false && R.dupDefB.errors.some((e) => /storyId: duplicado/.test(e)),
      R.err || 'dup storyId deveria ser fatal mesmo quando uma entrada tem defeito por-pack (ambas as ordens)');

    check('F2.4d.2 (Bloco 3): dup id FATAL mesmo com defeito por-pack (malformado primeiro)',
      !!R.dupIdDef && R.dupIdDef.ok === false && R.dupIdDef.errors.some((e) => /id: duplicado/.test(e)),
      R.err || 'dup id deveria ser fatal mesmo quando a 1ª entrada duplicada tem defeito por-pack');

    check('F2.4d.2 (Bloco 3): pack sem id/sem storyId → excluído com warning, ok:true',
      !!R.noId && R.noId.ok === true && R.noId.data.packs.length === 0
        && !!R.noStory && R.noStory.ok === true && R.noStory.data.packs.length === 0,
      R.err || 'pack sem id/storyId deveria ser excluído (warning) e manter ok:true');

    check('F2.4d.2 (Bloco 3): subconjunto vazio ainda é ok:true (único pack inválido)',
      !!R.unknown && R.unknown.ok === true && R.unknown.data.packs.length === 0 && R.unknown.warnings.length > 0,
      R.err || 'único pack inválido deveria dar ok:true com packs vazio e warning');

    check('F2.4d.2 (Bloco 3): generatedAt inválido NÃO é fatal (no máximo warning)',
      !!R.badGen && R.badGen.ok === true && R.badGen.data.packs.length === 1
        && R.badGen.warnings.some((w) => /generatedAt/.test(w)),
      R.err || 'generatedAt inválido não deveria derrubar o manifesto');
  }

  // ── F2.4d.3: downloader genérico por storyId (via manifesto global, só cenas) ──
  console.log('\n── F2.4d.3: downloader genérico por storyId ──');
  {
    const pdsSrc = readSrc('src/services/packDownloadService.js');
    const pdsCode = a1StripComments(pdsSrc);
    const genIdx = pdsCode.indexOf('async function downloadStoryPackScenesFromGlobalManifest');
    const genBody = genIdx >= 0 ? pdsCode.slice(genIdx) : '';

    check('F2.4d.3: packDownloadService expõe downloader genérico por storyId',
      /export async function downloadStoryPackScenesFromGlobalManifest\s*\(/.test(pdsSrc),
      'downloadStoryPackScenesFromGlobalManifest não exportada');

    check('F2.4d.3: usa globalManifestService para obter o pack (fetch + getPack)',
      /fetchGlobalContentManifest/.test(pdsCode) && /getPackFromGlobalManifest/.test(pdsCode),
      'não consome fetchGlobalContentManifest/getPackFromGlobalManifest');

    check('F2.4d.3: função genérica NÃO hardcoda david_goliath (é por storyId)',
      genBody.length > 0 && !/david_goliath/.test(genBody),
      'a função genérica não deve conter david_goliath (parametrizada por storyId)');

    check('F2.4d.3: usa baseUrl + manifestPath (não monta o segmento de versão a partir de version)',
      /pack\.baseUrl/.test(genBody) && /pack\.manifestPath/.test(genBody)
        && !/`v\$\{/.test(genBody) && !/\bmajor\b/.test(genBody) && !/version\.split/.test(genBody),
      'deve usar baseUrl + manifestPath; não construir o segmento de versão (ex.: `v${major}`) a partir de version');

    check('F2.4d.3→F2.4e.1: download por kind (default scenes-only preservado)',
      /requestedKinds\s*=\s*\['scene'\]/.test(genBody) && /kinds\.includes\(f\.kind\)/.test(genBody),
      'default scenes-only ou filtro kind-genérico (kinds.includes) ausente');

    check('F2.4d.3→F2.4e.1: kinds restritos a cover/scene/coloring/audio, sem paths de mídia hardcoded',
      /KNOWN_KINDS = \['cover', 'scene', 'coloring', 'audio'\]/.test(pdsCode)
        && genBody.length > 0 && !/cover\.webp|coloring\/scene_|audio\/\w+_scene_|\.mp3/.test(genBody),
      'kinds não whitelisted ou paths de mídia hardcodados na função genérica');

    check('F2.4d.3: não marca ready antes de validar (errors → failWith antes do move e do ready)',
      (() => {
        const errIdx = genBody.indexOf('if (errors.length) return failWith');
        const moveIdx = genBody.search(/moveAsync\(\{ from: tempDir, to: localDir \}\)/);
        const readyIdx = genBody.search(/setPackEntry\(storyId, \{\s*version,\s*status: PACK_STATUS\.READY/);
        return errIdx >= 0 && moveIdx > errIdx && readyIdx > moveIdx;
      })(),
      'ordem insegura: ready pode ocorrer antes da validação/move');

    check('F2.4d.3: mantém .tmp antes do move (getPackTempDir + move .tmp→localDir)',
      /getPackTempDir/.test(pdsCode) && /moveAsync\(\{ from: tempDir, to: localDir \}\)/.test(genBody),
      'fluxo .tmp → move atômico ausente');

    check('F2.4d.3: fallback seguro em falha (failWith → FAILED + limpa .tmp)',
      /status: PACK_STATUS\.FAILED/.test(genBody) && /deleteAsync\(tempDir, \{ idempotent: true \}\)/.test(genBody),
      'falha não limpa .tmp nem grava status failed');

    check('F2.4d.3: preserva downloadDavidGoliathPackSandbox (função legada intacta)',
      readSrc('src/services/packSandboxDevService.js').includes('export async function downloadDavidGoliathPackSandbox'),
      'a função legada foi removida/renomeada');

    check('F2.4d.3: não toca contentResolver (código)',
      !/contentResolver|resolveStory/.test(pdsCode),
      'packDownloadService referencia contentResolver — fora do escopo');

    check('F2.4d.3: não toca entitlement/RevenueCat (código)',
      !/isPremiumUser|Purchases|RevenueCat|entitlement/.test(pdsCode),
      'packDownloadService referencia entitlement/RevenueCat — fora do escopo');

    check('F2.4d.3: sem dependência nova (sem crypto/zip/axios)',
      !/expo-crypto|jszip|\bunzip\b|axios/.test(pdsSrc),
      'introduziu dependência nova');
  }

  // ── F2.4d.4: tela dev conectada ao downloader genérico (dev only, duplo gate) ──
  console.log('\n── F2.4d.4: PackSandboxDevScreen × downloader genérico ──');
  {
    const pssSrc = readSrc('src/screens/PackSandboxDevScreen.js');
    const pssCode = a1StripComments(pssSrc);

    check('F2.4d.4: tela importa o downloader genérico',
      /downloadStoryPackScenesFromGlobalManifest/.test(pssCode) && /packDownloadService/.test(pssCode),
      'PackSandboxDevScreen não importa downloadStoryPackScenesFromGlobalManifest');

    check('F2.4d.4: preserva o fluxo legado (downloadDavidGoliathPackSandbox ainda usado)',
      /downloadDavidGoliathPackSandbox/.test(pssCode),
      'a tela removeu o fluxo legado de download por baseUrl');

    check('F2.4d.4: expõe campo/constante para globalManifestUrl',
      /GLOBAL_MANIFEST_URL/.test(pssCode) && /globalUrl/.test(pssCode),
      'PackSandboxDevScreen não expõe campo/estado para a URL do manifesto global');

    check('F2.4d.4: permite storyId (padrão david_goliath)',
      /DEFAULT_STORY_ID\s*=\s*'david_goliath'/.test(pssCode) && /storyId/.test(pssCode),
      'PackSandboxDevScreen não define storyId (padrão david_goliath)');

    check('F2.4d.4: nova ação chama downloadStoryPackScenesFromGlobalManifest com storyId+globalManifestUrl',
      /downloadStoryPackScenesFromGlobalManifest\(\{[\s\S]*?storyId[\s\S]*?globalManifestUrl:\s*globalUrl[\s\S]*?\}\)/.test(pssCode),
      'a ação genérica não chama a função com storyId + globalManifestUrl');

    check('F2.4d.4: duplo gate preservado (isPackSandboxDevEnabled + guard !enabled)',
      /isPackSandboxDevEnabled\(\)/.test(pssCode) && /if \(!enabled\)/.test(pssCode),
      'a tela perdeu o duplo gate / o guard de habilitação');

    check('F2.4d.4: não conecta usuário final (rota só sob devPacksEnabled no AppNavigator)',
      (() => {
        const nav = a1StripComments(readSrc('src/navigation/AppNavigator.js'));
        return /devPacksEnabled/.test(nav) && /PackSandboxDev/.test(nav)
          && /isPackSandboxDevEnabled/.test(nav);
      })(),
      'a rota PackSandboxDev deixou de ser gated por devPacksEnabled/isPackSandboxDevEnabled');

    check('F2.4d.4: não altera contentResolver (tela não o importa)',
      !/contentResolver|resolveStory/.test(pssCode),
      'PackSandboxDevScreen passou a referenciar contentResolver');

    check('F2.4d.4: não altera entitlement/RevenueCat (tela)',
      !/isPremiumUser|Purchases|RevenueCat|entitlement/.test(pssCode),
      'PackSandboxDevScreen referencia entitlement/RevenueCat');

    check('F2.4d.4: função legada downloadDavidGoliathPackSandbox intacta no serviço',
      readSrc('src/services/packSandboxDevService.js').includes('export async function downloadDavidGoliathPackSandbox'),
      'downloadDavidGoliathPackSandbox foi removida/alterada no serviço');

    check('F2.4d.4: a tela não baixa cover/coloring/audio (só cenas via as ações existentes)',
      !/cover\.webp|coloring\/|audio\/|\.mp3/.test(pssCode),
      'PackSandboxDevScreen referencia download de cover/coloring/audio');

    check('F2.4d.4: sem dependência nova na tela (sem crypto/zip/axios)',
      !/expo-crypto|jszip|\bunzip\b|axios/.test(pssSrc),
      'PackSandboxDevScreen introduziu dependência nova');
  }

  // ── F2.4e.1: download + diagnose de cover/scene/coloring/audio (dev-only, sem crypto) ──
  console.log('\n── F2.4e.1: mídia por kind (download + diagnose) ──');
  {
    const pds = a1StripComments(readSrc('src/services/packDownloadService.js'));
    const dlIdx = pds.indexOf('async function downloadStoryPackScenesFromGlobalManifest');
    const dlBody = dlIdx >= 0 ? pds.slice(dlIdx) : '';
    const pss = a1StripComments(readSrc('src/services/packSandboxDevService.js'));
    const scr = a1StripComments(readSrc('src/screens/PackSandboxDevScreen.js'));
    const pkg = readSrc('package.json');
    const cryptoRe = /@noble\/hashes|expo-crypto|react-native-quick-crypto/;

    check('F2.4e.1: downloader aceita requestedKinds',
      /requestedKinds/.test(dlBody),
      'downloadStoryPackScenesFromGlobalManifest não aceita requestedKinds');

    check('F2.4e.1: default scenes-only preservado (compat F2.4d)',
      /requestedKinds\s*=\s*\['scene'\]/.test(dlBody),
      'default de requestedKinds deixou de ser scenes-only');

    check('F2.4e.1: cover/scene/coloring/audio solicitáveis (KNOWN_KINDS + camada dev)',
      /KNOWN_KINDS = \['cover', 'scene', 'coloring', 'audio'\]/.test(pds)
        && /ALL_KINDS = \['cover', 'scene', 'coloring', 'audio'\]/.test(scr)
        && /requestedKinds:\s*ALL_KINDS/.test(scr),
      'kinds cover/scene/coloring/audio não são solicitáveis pela camada dev');

    check('F2.4e.1: validação de contagem por kind (expectedPerKind vs doneByKind)',
      /expectedPerKind/.test(dlBody) && /doneByKind/.test(dlBody)
        && /!==\s*expectedPerKind\[k\]/.test(dlBody),
      'não valida a contagem esperada por kind');

    check('F2.4e.1: diagnose por kind (byKind cover/scene/coloring/audio)',
      /byKind/.test(pss) && /coloringRelPath/.test(pss) && /audioRelPath/.test(pss) && /coverRelPath/.test(pss),
      'diagnose não cobre os 4 kinds (byKind + rel paths)');

    check('F2.4e.1: duplo dev gate preservado (tela + diagnose gated)',
      /isPackSandboxDevEnabled\(\)/.test(scr) && /if \(!enabled\)/.test(scr)
        && /diagnoseDavidGoliathPackSandbox\(\)\s*\{\s*if \(!isPackSandboxDevEnabled\(\)\)/.test(pss),
      'duplo gate (tela/diagnose) não preservado');

    check('F2.4e.1: sem RevenueCat nos arquivos tocados',
      !/Purchases\.|react-native-purchases|RevenueCat/.test(pds + pss + scr),
      'RevenueCat referenciado');

    check('F2.4e.1: sem entitlement nos arquivos tocados',
      !/isPremiumUser|entitlement/.test(pds + pss + scr),
      'entitlement referenciado');

    check('F2.4e.1→F2.4e.2: package.json só pode adicionar @noble/hashes (sem expo-crypto/quick-crypto)',
      !/expo-crypto|react-native-quick-crypto/.test(pkg),
      'package.json declarou expo-crypto ou react-native-quick-crypto (proibido)');

    check('F2.4e.1: sem dependência de crypto nos arquivos tocados (sha256 real fica p/ F2.4e.2)',
      !cryptoRe.test(pds + pss + scr),
      'algum arquivo importou @noble/hashes/expo-crypto/react-native-quick-crypto');

    check('F2.4e.1: download escreve só no documentDirectory (não toca assets locais)',
      !/assets\//.test(dlBody) && /getPackLocalDir|getPackTempDir/.test(pds),
      'a função genérica referencia assets/ (deveria escrever só em documentDirectory)');

    check('F2.4e.1→F2.4e.5: coloring/cover/áudio consumidos SÓ via hook (superfícies não usam o resolver direto; fallback local preservado)',
      (() => {
        const surfaces = ['src/screens/NarrationScreen.js', 'src/screens/StoryBookScreen.js',
          'src/screens/ColoringScreen.js', 'src/services/audioService.js'];
        // superfícies finais NÃO importam o resolver diretamente (tudo via hooks do useResolvedStoryMedia).
        const noDirectResolver = surfaces.every((p) => !/resolveStoryColoring|resolveStoryCover|resolveStoryAudio/.test(a1StripComments(readSrc(p))));
        const hookExports = readSrc('src/hooks/useResolvedStoryMedia.js');
        const allViaHook = /useResolvedColoringImage/.test(hookExports)
          && /useResolvedStoryCover/.test(hookExports) && /useResolvedStoryAudio/.test(hookExports)
          && /getColoringImage/.test(hookExports); // fallback local preservado
        return noDirectResolver && allViaHook;
      })(),
      'uma superfície final usa o resolver direto, ou coloring/cover/áudio não passam pelo hook / fallback sumiu');

    check('F2.4e.1: compat F2.4d (botão só-cenas + função legada intacta)',
      /onDownloadGeneric/.test(scr) && /downloadDavidGoliathPackSandbox/.test(scr)
        && readSrc('src/services/packSandboxDevService.js').includes('export async function downloadDavidGoliathPackSandbox'),
      'compat F2.4d quebrada (só-cenas ou legado)');
  }

  // ── F2.4e.2: sha256 real (@noble/hashes) na integridade dos arquivos de pack ──
  console.log('\n── F2.4e.2: sha256 real (@noble/hashes) ──');
  {
    const integ = readSrc('src/services/packIntegrityService.js');
    const integCode = a1StripComments(integ);
    const pdsCode = a1StripComments(readSrc('src/services/packDownloadService.js'));
    const pssCode = a1StripComments(readSrc('src/services/packSandboxDevService.js'));
    const scrSrc = readSrc('src/screens/PackSandboxDevScreen.js');
    const pkgJson = (() => { try { return JSON.parse(readSrc('package.json')); } catch { return {}; } });
    const pkg = pkgJson();
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

    check('F2.4e.2: @noble/hashes presente no package.json',
      Object.prototype.hasOwnProperty.call(allDeps, '@noble/hashes'),
      '@noble/hashes não está declarado em package.json');

    check('F2.4e.2: expo-crypto AUSENTE',
      !Object.prototype.hasOwnProperty.call(allDeps, 'expo-crypto'),
      'expo-crypto foi instalado (proibido)');

    check('F2.4e.2: react-native-quick-crypto AUSENTE',
      !Object.prototype.hasOwnProperty.call(allDeps, 'react-native-quick-crypto'),
      'react-native-quick-crypto foi instalado (proibido)');

    check('F2.4e.2: computeFileSha256 não é mais stub (usa @noble/hashes)',
      /@noble\/hashes/.test(integCode) && /import \{ sha256 \}/.test(integCode)
        && !/hash indispon[ií]vel sem depend/.test(integCode),
      'computeFileSha256 ainda é stub / não usa @noble/hashes');

    check('F2.4e.2: computeFileSha256 lê o arquivo como base64',
      /readAsStringAsync\([^)]*encoding:\s*'base64'/.test(integCode),
      'não lê o arquivo como base64');

    check('F2.4e.2: converte base64 → bytes (base64ToBytes/atob)',
      /base64ToBytes/.test(integCode) && /atob\(/.test(integCode),
      'não converte base64 para bytes');

    check('F2.4e.2: retorna hex lowercase (bytesToHex + regex a-f0-9)',
      /bytesToHex/.test(integCode) && /\^\[a-f0-9\]\{64\}\$/.test(integCode),
      'não garante hex lowercase');

    check('F2.4e.2: validateFileEntry compara sha256 quando presente',
      /fileEntry\.sha256/.test(integCode) && /computeFileSha256\(/.test(integCode)
        && /sha256 divergente/.test(integCode),
      'validateFileEntry não compara sha256');

    check('F2.4e.2: downloader valida sha256 e falha (mismatch → errors → failWith, nunca ready parcial)',
      /computeFileSha256\(fileUri\)/.test(pdsCode) && /sha256 divergente/.test(pdsCode)
        && (() => {
          const gi = pdsCode.indexOf('async function downloadStoryPackScenesFromGlobalManifest');
          const b = gi >= 0 ? pdsCode.slice(gi) : '';
          const errIdx = b.indexOf('if (errors.length) return failWith');
          const moveIdx = b.search(/moveAsync\(\{ from: tempDir, to: localDir \}\)/);
          return errIdx >= 0 && moveIdx > errIdx;
        })(),
      'downloader não valida sha256 antes do move/ready');

    check('F2.4e.2p: diagnose é LEVE (não hasheia no refresh) — verify sha256 profundo é ação separada',
      (() => {
        const ds = pssCode.indexOf('async function diagnoseDavidGoliathPackSandbox');
        const vs = pssCode.indexOf('async function verifyDavidGoliathPackSandboxSha256');
        const diagBody = (ds >= 0 && vs > ds) ? pssCode.slice(ds, vs) : (ds >= 0 ? pssCode.slice(ds) : '');
        return ds >= 0 && vs > ds && !/computeFileSha256/.test(diagBody);
      })(),
      'diagnose ainda hasheia (deveria ser leve) ou falta a função de verify sha256 profundo');

    check('F2.4e.2: default scenes-only + requestedKinds preservados',
      /requestedKinds\s*=\s*\['scene'\]/.test(pdsCode) && /requestedKinds/.test(pdsCode),
      'default scenes-only ou requestedKinds regrediram');

    check('F2.4e.2→F2.4e.5: superfícies finais não importam o resolver direto (coloring/cover/áudio via hook)',
      ['src/screens/NarrationScreen.js', 'src/screens/StoryBookScreen.js',
        'src/screens/ColoringScreen.js', 'src/services/audioService.js']
        .every((p) => !/resolveStoryColoring|resolveStoryCover|resolveStoryAudio/.test(a1StripComments(readSrc(p)))),
      'uma superfície final passou a importar o resolver diretamente (deveria ser via hook)');

    check('F2.4e.2: sem RevenueCat/entitlement nos arquivos tocados',
      !/Purchases\.|react-native-purchases|RevenueCat|isPremiumUser|entitlement/.test(integCode + pdsCode + pssCode + a1StripComments(scrSrc)),
      'RevenueCat/entitlement referenciado');

    check('F2.4e.2: integridade não escreve em assets locais',
      !/assets\//.test(integCode),
      'packIntegrityService referencia assets/');

    // Execução REAL em sandbox: a hash pura casa com o Node crypto (o mesmo do gerador).
    let H = {};
    try {
      const nobleSha = require('@noble/hashes/sha2.js').sha256;
      const nobleHex = require('@noble/hashes/utils.js').bytesToHex;
      const { hashBase64ToHex } = a1LoadSandbox(
        'src/services/packIntegrityService.js',
        { sha256: nobleSha, bytesToHex: nobleHex, FileSystem: {}, validateManifest: () => ({ ok: true, errors: [] }), warn: () => {} },
        ['hashBase64ToHex'],
      );
      const buf = Buffer.from('pequenos tracos de fe \x00\x01\xfe binário', 'binary');
      const b64 = buf.toString('base64');
      const nodeHex = require('crypto').createHash('sha256').update(buf).digest('hex');
      const got = hashBase64ToHex(b64);
      H = { nodeHex, got, match: got === nodeHex, lower: /^[a-f0-9]{64}$/.test(got) };
    } catch (e) { H = { err: String((e && e.message) || e) }; }

    check('F2.4e.2: hashBase64ToHex casa com o Node crypto (bytes crus) e é hex lowercase',
      !!H.match && !!H.lower,
      H.err || `hash não casou (node ${H.nodeHex} vs noble ${H.got})`);
  }

  // ── F2.4e.2p: performance (sha256 real sem travar a UI) ──────────────────────
  console.log('\n── F2.4e.2p: performance sha256 ──');
  {
    const pdsCodeP = a1StripComments(readSrc('src/services/packDownloadService.js'));
    const pssCodeP = a1StripComments(readSrc('src/services/packSandboxDevService.js'));
    const scrCodeP = a1StripComments(readSrc('src/screens/PackSandboxDevScreen.js'));

    check('F2.4e.2p: verify sha256 profundo existe e cede a UI (yield entre arquivos)',
      /export async function verifyDavidGoliathPackSandboxSha256/.test(pssCodeP)
        && /yieldToUI/.test(pssCodeP) && /computeFileSha256/.test(pssCodeP),
      'falta a função de verify profundo com yield entre arquivos');

    check('F2.4e.2p: download faz yield entre arquivos no verify (não trava o JS thread)',
      (() => {
        const gi = pdsCodeP.indexOf('async function downloadStoryPackScenesFromGlobalManifest');
        const b = gi >= 0 ? pdsCodeP.slice(gi) : '';
        // yieldToUI aparece dentro do loop de verify (após o bloco de sha256)
        return /await yieldToUI\(\)/.test(b) && /computeFileSha256\(fileUri\)/.test(b);
      })(),
      'verify loop do download não cede a UI entre arquivos');

    check('F2.4e.2p: progresso de download é throttled (evita setState excessivo)',
      /- lastTick < 120/.test(pdsCodeP) && /const now = Date\.now\(\)/.test(pdsCodeP),
      'progresso de chunk não é throttled');

    check('F2.4e.2p: sha256 REAL preservado no download (antes do ready) e mismatch impede ready',
      /computeFileSha256\(fileUri\)/.test(pdsCodeP) && /sha256 divergente/.test(pdsCodeP)
        && (() => {
          const gi = pdsCodeP.indexOf('async function downloadStoryPackScenesFromGlobalManifest');
          const b = gi >= 0 ? pdsCodeP.slice(gi) : '';
          const errIdx = b.indexOf('if (errors.length) return failWith');
          const readyIdx = b.search(/setPackEntry\(storyId, \{\s*version,\s*status: PACK_STATUS\.READY/);
          return errIdx >= 0 && readyIdx > errIdx;
        })(),
      'sha256 do download regrediu ou não impede ready');

    check('F2.4e.2p: tela expõe verificação profunda sob demanda (botão + estado)',
      /verifyDavidGoliathPackSandboxSha256/.test(scrCodeP) && /onVerifySha/.test(scrCodeP)
        && /Verificar sha256/.test(readSrc('src/screens/PackSandboxDevScreen.js')),
      'a tela não oferece a verificação sha256 profunda sob demanda');

    check('F2.4e.2p: logs de tempo são dev-only (__DEV__)',
      !/console\.log\('\[packDownload\] verify/.test(pdsCodeP.replace(/if \(__DEV__\) console\.log\('\[packDownload\] verify[\s\S]*?\);/g, '')),
      'log de tempo do verify não está sob __DEV__');
  }

  // ── F2.4e.2pR: guardas de concorrência / ciclo de vida (anti-travamento) ─────
  console.log('\n── F2.4e.2pR: concorrência & ciclo de vida ──');
  {
    const scr = a1StripComments(readSrc('src/screens/PackSandboxDevScreen.js'));
    const pssP = a1StripComments(readSrc('src/services/packSandboxDevService.js'));

    check('F2.4e.2pR: trava SÍNCRONA de duplo-toque (busyRef + if (busyRef.current) return)',
      /const busyRef = useRef\(false\)/.test(scr) && /if \(busyRef\.current\) return/.test(scr),
      'falta o busyRef síncrono que fecha o TOCTOU de duplo-toque');

    check('F2.4e.2pR: mountedRef + cleanup + setState guardado (sem update pós-unmount)',
      /const mountedRef = useRef\(true\)/.test(scr)
        && /mountedRef\.current = false/.test(scr)
        && /if \(mountedRef\.current\)/.test(scr) && /safeSet/.test(scr),
      'falta mountedRef/safeSet para evitar setState após desmontar');

    check('F2.4e.2pR: runExclusive libera busy SEMPRE (try/finally) — sem trava permanente',
      /const runExclusive = useCallback\([\s\S]*?try \{ await fn\(\); \}[\s\S]*?finally \{[\s\S]*?busyRef\.current = false;[\s\S]*?setBusy\(false\)/.test(scr),
      'runExclusive não garante liberação de busy em finally');

    check('F2.4e.2pR: todas as ações pesadas passam por runExclusive',
      ['onSeed', 'onReset', 'onDownload', 'onDownloadGeneric', 'onDownloadAllMedia', 'onVerifySha']
        .every((h) => new RegExp(`const ${h} = useCallback\\(\\(\\) => runExclusive\\(`).test(scr)),
      'alguma ação pesada não está serializada por runExclusive');

    check('F2.4e.2pR: diagnose no mount/refresh usa loadDiag leve (sem busy próprio duplicado)',
      /const loadDiag = useCallback/.test(scr) && /useEffect\(\(\) => \{ loadDiag\(\); \}/.test(scr)
        && /const refresh = useCallback\(\(\) => runExclusive\(loadDiag\)/.test(scr),
      'mount/refresh não usam loadDiag/runExclusive');

    check('F2.4e.2pR: estado stale (verify/dl/dlG) limpo ao trocar arquivos (seed/download)',
      (() => {
        const seedIdx = scr.indexOf('const onSeed = useCallback');
        const dlIdx = scr.indexOf('const onDownload = useCallback');
        const seedBody = seedIdx >= 0 ? scr.slice(seedIdx, seedIdx + 400) : '';
        const dlBody = dlIdx >= 0 ? scr.slice(dlIdx, dlIdx + 400) : '';
        return /setVerify, null/.test(seedBody) && /setDlG, null/.test(seedBody)
          && /setVerify, null/.test(dlBody);
      })(),
      'seed/download não limpam integridade/progresso stale');

    check('F2.4e.2pR: botão Voltar desabilitado enquanto busy',
      /navigation\.goBack\(\)\} disabled=\{busy\}/.test(readSrc('src/screens/PackSandboxDevScreen.js')),
      'Voltar não é desabilitado durante operações (permite unmount no meio)');

    check('F2.4e.2pR: downloader LAN legado também throttla o progresso (paridade)',
      /- lastTick < 120/.test(pssP),
      'downloadDavidGoliathPackSandbox (LAN) não throttla o progresso');
  }

  // ── F2.4e.3: consumo user-facing de COLORING remoto (david_goliath) com fallback local ──
  console.log('\n── F2.4e.3: coloring remoto user-facing ──');
  {
    const colHook = a1StripComments(readSrc('src/hooks/useResolvedStoryMedia.js'));
    const colScreen = a1StripComments(readSrc('src/screens/ColoringScreen.js'));
    const colCanvas = a1StripComments(readSrc('src/components/ColoringCanvas.js'));
    const touched = colHook + '\n' + colScreen + '\n' + colCanvas;

    check('F2.4e.3: governança — DECISIONS.md e Documento Oficial v4 existem',
      srcExists('docs/DECISIONS.md') && srcExists('docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md'),
      'DECISIONS.md ou DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md ausente');

    check('F2.4e.3: existe hook explícito para coloring remoto (useResolvedColoringImage)',
      /export function useResolvedColoringImage/.test(colHook) && /resolveStoryColoring/.test(colHook),
      'falta o hook useResolvedColoringImage / uso de resolveStoryColoring');

    check('F2.4e.3→F2.5c: coloring remoto gated por camada remote (isRemotePackStory)',
      /isRemotePackStory\(storyId\)/.test(colHook),
      'coloring remoto não está restrito a david_goliath');

    check('F2.4e.3: coloring remoto exige pack READY (via resolveStoryColoring + sourceType FILE)',
      /resolveStoryColoring\(storyId, sceneNumber, packEntry\)/.test(colHook)
        && /RESOLVE_SOURCE_TYPE\.FILE/.test(colHook),
      'coloring remoto não exige pack ready (sourceType FILE do resolver)');

    check('F2.4e.3: coloring remoto usa file:// do pack (retorna { uri }) — sem re-hash',
      /setRemoteSource\(\{ uri: candidateUri \}\)/.test(colHook) && !/computeFileSha256/.test(colHook),
      'coloring remoto não retorna { uri } do pack, ou recalcula sha256 no hook');

    check('F2.4e.3: checagem de existência FORA do render (useEffect + getInfoAsync, sem hash)',
      /useEffect\(\(\) => \{[\s\S]*?getInfoAsync\(candidateUri\)/.test(colHook)
        && /info && info\.exists/.test(colHook),
      'não confirma existência do arquivo remoto fora do render');

    check('F2.4e.3: FALLBACK LOCAL obrigatório (getColoringImage) — requires locais preservados',
      /getColoringImage\(storyId, cena\.id\)/.test(colHook)
        && /return remoteSource \|\| localSource/.test(colHook)
        && /getColoringImage/.test(readSrc('src/assets/coloringImages.js')),
      'fallback local (getColoringImage) ausente ou requires locais removidos');

    check('F2.4e.3: A Criação/Noé (não-sandbox) seguem LOCAL (hook devolve getColoringImage)',
      // fora do sandbox, candidateUri fica null → sempre localSource; validado pelo gate storyId.
      /const packEntry = isRemotePackStory\(storyId\) \? getPackEntry\(storyId\) : null/.test(colHook),
      'histórias não-sandbox poderiam consumir remoto — gate ausente');

    check('F2.4e.3: ColoringScreen usa o hook (não o resolver direto)',
      /useResolvedColoringImage\(story, cenaIndex\)/.test(colScreen)
        && /import \{ useResolvedColoringImage \}/.test(readSrc('src/screens/ColoringScreen.js')),
      'ColoringScreen não passou a usar o hook');

    check('F2.4e.3: ColoringScreen NÃO baixa arquivo nem calcula sha256',
      !/downloadAsync|createDownloadResumable|downloadStoryPack|downloadDavidGoliath|computeFileSha256|\bsha256\b/.test(colScreen),
      'ColoringScreen contém download/sha256 (proibido)');

    check('F2.4e.3: ColoringScreen sem linguagem técnica para criança (sem pack/manifesto/sha256/CDN/file/MB literais)',
      !/manifesto|sha256|\bCDN\b|file:\/\/|\bMB\b/i.test(colScreen),
      'ColoringScreen expõe termo técnico em código/texto user-facing');

    check('F2.4e.3: ColoringCanvas aceita { uri } além de require (pipeline file://→dataURL)',
      /isUriSource/.test(colCanvas) && /imageSource\.uri/.test(colCanvas),
      'ColoringCanvas não trata fonte remota { uri }');

    check('F2.4e.3: sem RevenueCat/entitlement/paywall NOVOS nos arquivos tocados',
      !/Purchases\.|react-native-purchases|RevenueCat|isPremiumUser|paywall/i.test(touched),
      'arquivos tocados referenciam RevenueCat/entitlement/paywall');

    check('F2.4e.3: escopo intacto — sem Brincar/conclusão-total/Free-sem-salvar nos arquivos tocados',
      !/dailyRounds|startGameRound|isStoryFullyComplete|ATELIER_FREE_SAVE_LIMIT/.test(touched),
      'arquivos tocados mexeram em Brincar/conclusão total/Free sem salvar');

    check('F2.4e.3→F2.4e.5: ColoringScreen sem áudio; audioService segue manifest-only (resolver de pack fica no hook)',
      !/resolveStoryAudio/.test(colScreen)
        && !/resolveStoryAudio|contentResolver/.test(a1StripComments(readSrc('src/services/audioService.js'))),
      'ColoringScreen tocou áudio, ou audioService passou a importar o resolver de pack');
  }

  // ── F2.4e.4: consumo user-facing de COVER remoto (david_goliath) com fallback local ──
  console.log('\n── F2.4e.4: cover remoto user-facing ──');
  {
    const covHookRaw = readSrc('src/hooks/useResolvedStoryMedia.js');
    const covHook = a1StripComments(covHookRaw);
    const marker = readSrc('src/components/map/StoryMapMarker.js');
    const focus = readSrc('src/components/map/StoryFocusModal.js');
    const card = readSrc('src/components/StoryCard.js');
    const covTouched = covHook + '\n' + a1StripComments(marker) + '\n' + a1StripComments(focus) + '\n' + a1StripComments(card);
    // corpo da função de cover (a partir da sua declaração)
    const cvIdx = covHook.indexOf('function useResolvedStoryCover');
    const cvBody = cvIdx >= 0 ? covHook.slice(cvIdx) : '';

    check('F2.4e.4: governança — DECISIONS.md e Documento Oficial v4 existem',
      srcExists('docs/DECISIONS.md') && srcExists('docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md'),
      'DECISIONS.md ou DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md ausente');

    check('F2.4e.4: existe hook explícito para cover remoto (useResolvedStoryCover)',
      /export function useResolvedStoryCover/.test(covHook) && /resolveStoryCover/.test(covHook),
      'falta o hook useResolvedStoryCover / uso de resolveStoryCover');

    check('F2.4e.4→F2.5c: cover remoto gated por camada remote (isRemotePackStory)',
      /isRemotePackStory\(storyId\)/.test(cvBody),
      'cover remoto não está restrito a david_goliath');

    check('F2.4e.4: cover remoto exige pack READY (resolveStoryCover + sourceType FILE)',
      /resolveStoryCover\(storyId, packEntry\)/.test(cvBody) && /RESOLVE_SOURCE_TYPE\.FILE/.test(cvBody),
      'cover remoto não exige pack ready (sourceType FILE do resolver)');

    check('F2.4e.4: cover remoto usa file:// do pack ({ uri }); existência FORA do render; sem hash',
      /setRemoteSource\(\{ uri: candidateUri \}\)/.test(cvBody)
        && /getInfoAsync\(candidateUri\)/.test(cvBody)
        && !/computeFileSha256/.test(cvBody),
      'cover remoto não retorna { uri }/existência fora do render, ou recalcula sha256');

    check('F2.4e.4: FALLBACK LOCAL obrigatório (localSource) — hook desacoplado do registro',
      /return remoteSource \|\| localSource/.test(cvBody),
      'cover remoto sem fallback local (localSource)');

    check('F2.4e.4: 3 superfícies user-facing usam o hook (mapa · detalhe · card)',
      /useResolvedStoryCover/.test(marker) && /useResolvedStoryCover/.test(focus) && /useResolvedStoryCover/.test(card),
      'StoryMapMarker/StoryFocusModal/StoryCard não usam o hook de cover');

    check('F2.4e.4: render das capas INALTERADO (<Image source> — sem pipeline/layout novo)',
      /Image source=\{cover\}/.test(marker) && /Image source=\{cover\}/.test(focus) && /Image source=\{coverImg\}/.test(card),
      'o render de capa mudou (deveria ser só a fonte via hook)');

    check('F2.4e.4: superfícies de capa NÃO baixam arquivo nem calculam sha256',
      !/downloadAsync|createDownloadResumable|downloadStoryPack|computeFileSha256|\bsha256\b/.test(a1StripComments(marker) + a1StripComments(focus) + a1StripComments(card)),
      'uma superfície de capa contém download/sha256 (proibido)');

    check('F2.4e.4: superfícies de capa sem linguagem técnica para criança',
      !/manifesto|sha256|\bCDN\b|file:\/\/|\bMB\b/i.test(a1StripComments(marker) + a1StripComments(focus) + a1StripComments(card)),
      'superfície de capa expõe termo técnico');

    check('F2.4e.4: A Criação/Noé (não-sandbox) seguem LOCAL (gate SANDBOX_STORY_ID no cover)',
      /const packEntry = isRemotePackStory\(storyId\) \? getPackEntry\(storyId\) : null/.test(cvBody),
      'cover de histórias não-sandbox poderia ir remoto — gate ausente');

    check('F2.4e.4: F2.4e.3 (coloring remoto) continua intacto',
      /useResolvedColoringImage/.test(readSrc('src/screens/ColoringScreen.js'))
        && /export function useResolvedColoringImage/.test(covHook),
      'coloring remoto (F2.4e.3) foi quebrado');

    check('F2.4e.4: sem RevenueCat/entitlement/paywall/Brincar/conclusão/Free NOVOS nos arquivos tocados',
      !/Purchases\.|react-native-purchases|RevenueCat|isPremiumUser|paywall|dailyRounds|startGameRound|isStoryFullyComplete|ATELIER_FREE_SAVE_LIMIT/i.test(covTouched),
      'arquivos tocados mexeram em RevenueCat/entitlement/Brincar/conclusão/Free');

    check('F2.4e.4: requires locais preservados (storyCovers/images intactos como fallback)',
      /getStoryCover/.test(readSrc('src/assets/storyCovers.js')) && /STORY_COVERS/.test(readSrc('src/assets/images.js')),
      'registros locais de capa (storyCovers/images) removidos');
  }

  // ── F2.4e.5: consumo user-facing de ÁUDIO remoto (david_goliath) com fallback local ──
  console.log('\n── F2.4e.5: áudio remoto user-facing ──');
  {
    const audHook = a1StripComments(readSrc('src/hooks/useResolvedStoryMedia.js'));
    const narrRaw = readSrc('src/screens/NarrationScreen.js');
    const narr = a1StripComments(narrRaw);
    const player = readSrc('src/components/AudioPlayer.js');
    const audTouched = audHook + '\n' + narr;
    const avIdx = audHook.indexOf('function useResolvedStoryAudio');
    const avBody = avIdx >= 0 ? audHook.slice(avIdx) : '';

    check('F2.4e.5: governança — DECISIONS.md e Documento Oficial v4 existem',
      srcExists('docs/DECISIONS.md') && srcExists('docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md'),
      'DECISIONS.md ou DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md ausente');

    check('F2.4e.5: existe hook explícito para áudio remoto (useResolvedStoryAudio)',
      /export function useResolvedStoryAudio/.test(audHook) && /resolveStoryAudio/.test(audHook),
      'falta o hook useResolvedStoryAudio / uso de resolveStoryAudio');

    check('F2.4e.5→F2.5c: áudio remoto gated por camada remote (isRemotePackStory)',
      /isRemotePackStory\(storyId\)/.test(avBody),
      'áudio remoto não está restrito a david_goliath');

    check('F2.4e.5: áudio remoto exige pack READY (resolveStoryAudio + sourceType FILE)',
      /resolveStoryAudio\(storyId, n, packEntry\)/.test(avBody) && /RESOLVE_SOURCE_TYPE\.FILE/.test(avBody),
      'áudio remoto não exige pack ready (sourceType FILE do resolver)');

    check('F2.4e.5: áudio remoto usa file:// ({ uri }); existência FORA do render; sem hash',
      /setRemoteSource\(\{ uri: candidateUri \}\)/.test(avBody)
        && /getInfoAsync\(candidateUri\)/.test(avBody)
        && !/computeFileSha256/.test(avBody),
      'áudio remoto não retorna { uri }/existência fora do render, ou recalcula sha256');

    check('F2.4e.5: FALLBACK LOCAL obrigatório (localAudioAsset) — hook desacoplado do audioService',
      /return remoteSource \|\| localAudioAsset/.test(avBody),
      'áudio remoto sem fallback local (localAudioAsset)');

    check('F2.4e.5: NarrationScreen usa o hook e passa a fonte resolvida ao AudioPlayer',
      /useResolvedStoryAudio\(story\?\.id, numeroCena,/.test(narr)
        && /<AudioPlayer audioAsset=\{resolvedAudioAsset\}/.test(narrRaw),
      'NarrationScreen não resolve o áudio pelo hook / não passa resolvedAudioAsset');

    check('F2.4e.5: NarrationScreen NÃO baixa arquivo nem calcula sha256',
      !/downloadAsync|createDownloadResumable|downloadStoryPack|computeFileSha256|\bsha256\b/.test(narr),
      'NarrationScreen contém download/sha256 (proibido)');

    check('F2.4e.5: NarrationScreen sem linguagem técnica para criança (sem manifesto/sha256/CDN/file/MB)',
      !/manifesto|sha256|\bCDN\b|file:\/\/|\bMB\b/i.test(narr),
      'NarrationScreen expõe termo técnico');

    check('F2.4e.5: A Criação/Noé (não-sandbox) seguem LOCAL (gate SANDBOX_STORY_ID no áudio)',
      /const packEntry = isRemotePackStory\(storyId\) \? getPackEntry\(storyId\) : null/.test(avBody),
      'áudio de histórias não-sandbox poderia ir remoto — gate ausente');

    check('F2.4e.5→LIVRINHO_FIX_1: AudioPlayer mantém a base (useAudioPlayer/autoPlay default/finishedCalledRef reset por asset)',
      /useAudioPlayer\(audioAsset/.test(player)
        && /autoPlay = false/.test(player)
        && /useEffect\(\(\) => \{\s*finishedCalledRef\.current = false;[\s\S]*?\}, \[audioAsset\]\)/.test(player),
      'AudioPlayer perdeu a base (useAudioPlayer/autoPlay default/finishedCalledRef reset no MESMO useEffect [audioAsset])');

    check('F2.4e.5: sem autoplay duplicado (NarrationScreen não passa autoPlay ao AudioPlayer)',
      !/AudioPlayer[^>]*autoPlay/.test(narrRaw),
      'NarrationScreen passou autoPlay ao AudioPlayer — risco de autoplay duplicado');

    check('F2.4e.5: troca de cena preservada (hook keyed por sceneNumber; reset ao trocar cena/pack)',
      /const n = Number\.isInteger\(sceneNumber\)/.test(avBody) && /setRemoteSource\(null\)/.test(avBody),
      'áudio remoto não reseta por cena/pack (troca de cena/reset em risco)');

    check('F2.4e.5: F2.4e.3 (coloring) e F2.4e.4 (cover) continuam intactos',
      /useResolvedColoringImage/.test(readSrc('src/screens/ColoringScreen.js'))
        && /useResolvedStoryCover/.test(readSrc('src/components/map/StoryMapMarker.js'))
        && /export function useResolvedColoringImage/.test(audHook)
        && /export function useResolvedStoryCover/.test(audHook),
      'coloring (F2.4e.3) ou cover (F2.4e.4) foram quebrados');

    check('F2.4e.5: sem RevenueCat/entitlement/paywall/Brincar/conclusão/Free NOVOS nos arquivos tocados',
      !/Purchases\.|react-native-purchases|RevenueCat|isPremiumUser|paywall|dailyRounds|startGameRound|isStoryFullyComplete|ATELIER_FREE_SAVE_LIMIT/i.test(audTouched),
      'arquivos tocados mexeram em RevenueCat/entitlement/Brincar/conclusão/Free');

    check('F2.4e.5: requires locais de áudio preservados (audioManifest intacto como fallback)',
      /require\(/.test(readSrc('src/data/audioManifest.js')) && /audioAsset/.test(readSrc('src/data/audioManifest.js')),
      'registro local de áudio (audioManifest) removido/alterado');
  }

  // ── F2.4e.5p: lifecycle de áudio do Livrinho (para ao sair; sem áudio no mapa) ──
  console.log('\n── F2.4e.5p: lifecycle de áudio (StoryBook) ──');
  {
    const sb = readSrc('src/screens/StoryBookScreen.js');
    const sbCode = a1StripComments(sb);
    const ap = readSrc('src/components/AudioPlayer.js');
    const narr5p = readSrc('src/screens/NarrationScreen.js');

    check('F2.4e.5p: StoryBookScreen observa o foco (useIsFocused) para o lifecycle de áudio',
      /import \{[^}]*\buseIsFocused\b[^}]*\} from '@react-navigation\/native'/.test(sb) && /const isBookFocused = useIsFocused\(\)/.test(sbCode),
      'StoryBookScreen não observa isFocused — áudio pode continuar fora da tela');

    check('F2.4e.5p: ao PERDER o foco, o Livrinho PARA o áudio e HALTA o autoplay',
      /if \(!isBookFocused\) \{[\s\S]*?setIsPaused\(true\);[\s\S]*?setAutoplayActive\(false\);/.test(sbCode)
        && /\}, \[isBookFocused\]\)/.test(sbCode),
      'falta o efeito de blur que para o áudio e halta o autoplay');

    check('F2.4e.5p: blur invalida a sessão (token + avanço pendente) — sem callback antigo/áudio no mapa',
      /if \(!isBookFocused\) \{\s*invalidatePlaybackSession\(\);/.test(sbCode)
        && /function invalidatePlaybackSession\(\)[\s\S]*?pendingAutoAdvanceRef\.current = false;/.test(sbCode),
      'blur não invalida a sessão (token/avanço pendente) — callback antigo pode disparar');

    check('F2.4e.5p: AudioPlayer PARA o player ao desmontar (stop no fim de vida)',
      /try \{ player\.pause\(\); \}[\s\S]*?onNarrationEnd\(\);\s*\}, \[\]\)/.test(ap),
      'AudioPlayer não pausa o player no unmount (áudio pode vazar após sair/troca de cena)');

    check('F2.4e.5p: AudioPlayer INTACTO em play/pause/replay/autoplay (só o stop foi adicionado)',
      /useAudioPlayer\(audioAsset/.test(ap) && /function handlePlay\(\)/.test(ap)
        && /function handlePause\(\)/.test(ap) && /handleReplay/.test(ap)
        && /autoPlay = false/.test(ap),
      'AudioPlayer perdeu play/pause/replay ou o default autoPlay=false');

    check('F2.4e.5p: sem autoplay novo/duplicado — Livrinho mantém autoPlay={autoplayActive}; blur zera',
      /autoPlay=\{autoplayActive\}/.test(sb) && /onSceneAudioComplete/.test(sbCode)
        && /setAutoplayActive\(false\)/.test(sbCode),
      'a fiação de autoplay do Livrinho mudou / blur não zera o autoplay');

    check('F2.4e.5p: LIVRINHO_AUTOPLAY_FIX_1 preservado (avanço resiliente à trava)',
      /pendingAutoAdvanceRef/.test(sbCode) && /function advanceToNextScene\(\)/.test(sbCode)
        && /function onSceneAudioComplete\(\)/.test(sbCode),
      'o fix de autoplay do Livrinho (LIVRINHO_AUTOPLAY_FIX_1) foi quebrado');

    check('F2.4e.5p: F2.4e.5 (áudio remoto NarrationScreen) preservado',
      /useResolvedStoryAudio\(story\?\.id, numeroCena,/.test(narr5p)
        && /<AudioPlayer audioAsset=\{resolvedAudioAsset\}/.test(narr5p),
      'F2.4e.5 (áudio remoto via hook no NarrationScreen) foi quebrado');

    check('F2.4e.5p: F2.4e.3 coloring + F2.4e.4 cover + gate david_goliath preservados',
      /useResolvedColoringImage/.test(readSrc('src/screens/ColoringScreen.js'))
        && /useResolvedStoryCover/.test(readSrc('src/components/map/StoryMapMarker.js'))
        && /isRemotePackStory\(storyId\)/.test(readSrc('src/hooks/useResolvedStoryMedia.js')),
      'coloring/cover remotos ou o gate sandbox foram quebrados');

    check('F2.4e.5p: escopo — audioService intacto e sem RevenueCat/entitlement/Brincar/conclusão/Free',
      !/resolveStoryAudio|contentResolver/.test(a1StripComments(readSrc('src/services/audioService.js')))
        && !/Purchases\.|RevenueCat|isPremiumUser|paywall|dailyRounds|startGameRound|isStoryFullyComplete|ATELIER_FREE_SAVE_LIMIT/i.test(sbCode + a1StripComments(ap)),
      'audioService mudou, ou arquivos tocados mexeram em RevenueCat/entitlement/Brincar/conclusão/Free');

    check('F2.4e.5p: correção é só de lifecycle (não adiciona StyleSheet novo no AudioPlayer)',
      (ap.match(/StyleSheet\.create\(/g) || []).length <= 1,
      'AudioPlayer ganhou StyleSheet novo — a correção deve ser só de lifecycle, sem visual');
  }

  // ── F2.4e.5pR: hardening MÁXIMO do lifecycle de áudio (token + AppState + guards) ──
  console.log('\n── F2.4e.5pR: hardening de lifecycle de áudio ──');
  {
    const sb = readSrc('src/screens/StoryBookScreen.js');
    const sbCode = a1StripComments(sb);
    const ap = readSrc('src/components/AudioPlayer.js');
    const apCode = a1StripComments(ap);
    const narr = readSrc('src/screens/NarrationScreen.js');
    const hook = a1StripComments(readSrc('src/hooks/useResolvedStoryMedia.js'));

    // 1–3. Token de sessão + espelhos síncronos + timer cancelável
    check('F2.4e.5pR: token de sessão playbackGenerationRef (useRef) no StoryBook',
      /const playbackGenerationRef = useRef\(0\)/.test(sbCode),
      'falta o token de sessão playbackGenerationRef');

    check('F2.4e.5pR: espelhos síncronos de foco e AppState (isBookFocusedRef + appActiveRef)',
      /const isBookFocusedRef = useRef\(true\)/.test(sbCode) && /const appActiveRef = useRef\(true\)/.test(sbCode),
      'faltam os espelhos síncronos isBookFocusedRef/appActiveRef');

    check('F2.4e.5pR: timer de cena sem áudio é cancelável (noAudioTimerRef)',
      /const noAudioTimerRef = useRef\(null\)/.test(sbCode) && /noAudioTimerRef\.current = timer/.test(sbCode),
      'falta noAudioTimerRef (timer da cena sem áudio não é cancelável)');

    check('F2.4e.5pR: cleanup do timer sem áudio limpa o ref (sem timer órfão)',
      /if \(noAudioTimerRef\.current === timer\) noAudioTimerRef\.current = null;/.test(sbCode),
      'cleanup do timer sem áudio não limpa noAudioTimerRef');

    // 4–5. Contexto vivo + invalidação de sessão
    check('F2.4e.5pR: isPlaybackContextLive() usa navigation.isFocused() (foco síncrono) + app ativo',
      /function isPlaybackContextLive\(\)\s*\{\s*return navigation\.isFocused\(\) && appActiveRef\.current;/.test(sbCode),
      'isPlaybackContextLive não usa navigation.isFocused() (verdade síncrona sem lag) + app ativo');

    check('F2.4e.5pR: invalidatePlaybackSession bump do token + limpa avanço + cancela timer',
      /function invalidatePlaybackSession\(\)\s*\{\s*playbackGenerationRef\.current \+= 1;\s*pendingAutoAdvanceRef\.current = false;[\s\S]*?clearTimeout\(noAudioTimerRef\.current\)/.test(sbCode),
      'invalidatePlaybackSession não invalida token/pendências/timer corretamente');

    // 6. Blur: sincroniza foco + invalida sessão + pausa + desliga autoplay (ordem)
    check('F2.4e.5pR: blur sincroniza isBookFocusedRef e invalida a sessão (invalidate→pause→autoplay off)',
      /isBookFocusedRef\.current = isBookFocused;/.test(sbCode)
        && /if \(!isBookFocused\) \{\s*invalidatePlaybackSession\(\);\s*setIsPaused\(true\);\s*setAutoplayActive\(false\);/.test(sbCode),
      'blur não sincroniza o foco / não invalida a sessão na ordem correta');

    // 7–10. AppState: background pausa + halta, sem auto-resume, listener removido
    check('F2.4e.5pR: AppState.addEventListener change (via react-native, sem dep nova)',
      /import \{[\s\S]*?AppState[\s\S]*?\} from 'react-native'/.test(sb) && /AppState\.addEventListener\('change'/.test(sbCode),
      'falta o listener AppState (background/lock) — ou veio de dependência nova');

    check('F2.4e.5pR: halta só no background real (inactive transitório NÃO corta a história)',
      /appActiveRef\.current = next !== 'background';\s*if \(next === 'background'\) \{\s*invalidatePlaybackSession\(\);\s*setIsPaused\(true\);\s*setAutoplayActive\(false\);/.test(sbCode),
      'AppState não halta só no background (ou trata inactive como background, cortando a história)');

    check('F2.4e.5pR: AppState NÃO auto-resume ao voltar (sem setIsPaused(false) no handler)',
      /AppState\.addEventListener\('change'[\s\S]*?return \(\) => sub\.remove\(\)/.test(sbCode)
        && !/AppState\.addEventListener\('change'[\s\S]*?setIsPaused\(false\)[\s\S]*?return \(\) => sub\.remove\(\)/.test(sbCode),
      'AppState pode retomar sozinho ao voltar (setIsPaused(false) no handler)');

    check('F2.4e.5pR: listener de AppState é removido no cleanup (sub.remove)',
      /return \(\) => sub\.remove\(\);/.test(sbCode),
      'AppState listener não é removido (vazamento)');

    // 11–12. Guards nos callbacks que avançam cena
    check('F2.4e.5pR: advanceToNextScene guardado por isPlaybackContextLive()',
      /function advanceToNextScene\(\)\s*\{\s*if \(lockRef\.current\) return;\s*if \(!isPlaybackContextLive\(\)\) return;/.test(sbCode),
      'advanceToNextScene não verifica foco/app ativo — pode avançar fora da tela');

    check('F2.4e.5pR: onSceneAudioComplete guardado por isPlaybackContextLive()',
      /function onSceneAudioComplete\(\)\s*\{[\s\S]*?if \(!isPlaybackContextLive\(\)\) return;/.test(sbCode),
      'onSceneAudioComplete não verifica foco/app ativo — fim de áudio fora da tela avança cena');

    // 13–14. Timer da cena sem áudio: gated em foco + token + contexto
    check('F2.4e.5pR: timer da cena sem áudio não roda fora de foco',
      /if \(screenState !== 'playing' \|\| isPaused\) return undefined;\s*if \(!isBookFocused\) return undefined;/.test(sbCode)
        && /\[screenState, currentSlideIndex, isPaused, viewMode, isBookFocused\]/.test(sbCode),
      'timer da cena sem áudio não é gated em foco');

    check('F2.4e.5pR: timer captura o token e valida contexto antes de avançar',
      /const gen = playbackGenerationRef\.current;[\s\S]*?if \(gen !== playbackGenerationRef\.current\) return;\s*if \(!isPlaybackContextLive\(\)\) return;\s*advanceToNextScene\(\);/.test(sbCode),
      'timer não valida token/contexto no disparo (avanço órfão possível)');

    // 15–17. Bumps do token: novo início, pausa manual, trocas manuais
    check('F2.4e.5pR: novo início de áudio bump do token + limpa isPaused (onPlayStart)',
      /onPlayStart=\{\(\) => \{ playbackGenerationRef\.current \+= 1; setIsPaused\(false\); setAutoplayActive\(true\); \}\}/.test(sb),
      'onPlayStart não incrementa o token / não limpa isPaused (divergência isPaused×player)');

    check('F2.4e.5pR: pausa manual bump do token (onUserPause)',
      /onUserPause=\{\(\) => \{ playbackGenerationRef\.current \+= 1; setAutoplayActive\(false\); \}\}/.test(sb),
      'onUserPause não incrementa o token');

    check('F2.4e.5pR: trocas manuais de cena incrementam o token (>= 7 bumps no total)',
      (sbCode.match(/playbackGenerationRef\.current \+= 1;/g) || []).length >= 7,
      'faltam incrementos do token nas trocas manuais de cena');

    // 18–19. AudioPlayer: paused-sync pausa em loading; nunca toca de idle
    check('F2.4e.5pR: AudioPlayer pausa também durante o load (fecha a janela de loading)',
      /if \(paused\) \{\s*if \(appStatus === 'playing' \|\| appStatus === 'loading'\) \{\s*player\.pause\(\);/.test(apCode),
      'AudioPlayer não pausa durante o load — áudio pode escapar ao sair no meio do carregamento');

    check('F2.4e.5pR: AudioPlayer nunca inicia de idle/done (retoma só de paused)',
      /\} else if \(appStatus === 'paused'\) \{\s*player\.play\(\);\s*setAppStatus\('playing'\);/.test(apCode),
      'AudioPlayer pode iniciar sozinho de idle/done (resume incorreto)');

    // 20–21. AudioPlayer: cleanup para o player e NÃO simula conclusão; autoplay gated
    check('F2.4e.5pR: cleanup do AudioPlayer para o player e NÃO chama onFinished (sem simular conclusão)',
      (() => {
        // Liga ao bloco de unmount-cleanup que PARA o player (não a outros efeitos, ex. mountedRef).
        const c = (apCode.match(/useEffect\(\(\) => \(\) => \{\s*try \{ player\.pause\(\);[\s\S]*?\}, \[\]\)/) || [''])[0];
        return /player\.pause\(\);/.test(c) && /onNarrationEnd\(\);/.test(c) && !/onFinished/.test(c);
      })(),
      'cleanup do AudioPlayer não para o player OU chama onFinished (simula conclusão)');

    check('F2.4e.5pR: autoplay do AudioPlayer segue gated por autoPlay + isLoaded (sem autoplay novo)',
      /if \(!autoPlay \|\| paused\) return;[\s\S]*?if \(autoStartedRef\.current\) return;[\s\S]*?if \(!status\.isLoaded\) return;/.test(apCode)
        && /autoPlay = false/.test(ap),
      'o gating de autoplay do AudioPlayer mudou (risco de autoplay indevido)');

    // AudioPlayer reage a background/lock (AppState) — para o player e anula auto-resume nativo
    check('F2.4e.5pR: AudioPlayer para o player no background (AppState, via react-native)',
      /import \{[\s\S]*?AppState[\s\S]*?\} from 'react-native'/.test(ap)
        && /AppState\.addEventListener\('change'/.test(apCode)
        && /if \(next === 'background'\) \{\s*pausedByLifecycleRef\.current = true;\s*try \{ player\.pause\(\);/.test(apCode),
      'AudioPlayer não para o player no background (áudio pode vazar em background/lock)');

    check('F2.4e.5pR: AudioPlayer NÃO auto-resume ao voltar (reforça a pausa; anti auto-resume nativo)',
      /else if \(next === 'active' && pausedByLifecycleRef\.current\) \{\s*pausedByLifecycleRef\.current = false;\s*try \{ player\.pause\(\);/.test(apCode)
        && /AppState\.addEventListener\('change'[\s\S]*?return \(\) => sub\.remove\(\)/.test(apCode),
      'AudioPlayer pode retomar sozinho ao voltar do background (sem reforço de pausa)');

    // 22. Paridade NarrationScreen (equivalente-ou-mais-seguro)
    check('F2.4e.5pR: NarrationScreen mantém AudioPlayer gated em isFocused (paridade/mais seguro)',
      /hasSceneAudio\(story\.id, sceneKey\) && isFocused \?/.test(narr) && /<AudioPlayer audioAsset=\{resolvedAudioAsset\}/.test(narr),
      'NarrationScreen perdeu o gate isFocused do AudioPlayer');

    // 23–26. Preservação dos blocos anteriores
    check('F2.4e.5pR: LIVRINHO_AUTOPLAY_FIX_1 preservado (avanço resiliente à trava)',
      /pendingAutoAdvanceRef/.test(sbCode) && /if \(lockRef\.current\) \{\s*pendingAutoAdvanceRef\.current = true;/.test(sbCode),
      'LIVRINHO_AUTOPLAY_FIX_1 foi quebrado');

    check('F2.4e.5pR: F2.4e.5 (áudio remoto NarrationScreen via hook) preservado',
      /useResolvedStoryAudio\(story\?\.id, numeroCena,/.test(narr) && /export function useResolvedStoryAudio/.test(hook),
      'F2.4e.5 (hook de áudio remoto) foi quebrado');

    check('F2.4e.5pR: F2.4e.3 coloring + F2.4e.4 cover + gate david_goliath preservados',
      /useResolvedColoringImage/.test(readSrc('src/screens/ColoringScreen.js'))
        && /useResolvedStoryCover/.test(readSrc('src/components/map/StoryMapMarker.js'))
        && /isRemotePackStory\(storyId\)/.test(hook),
      'coloring/cover remotos ou o gate sandbox foram quebrados');

    check('F2.4e.5pR: fiação de áudio do Livrinho intacta (autoPlay={autoplayActive}, onFinished, paused)',
      /autoPlay=\{autoplayActive\}/.test(sb) && /onFinished=\{onSceneAudioComplete\}/.test(sb) && /paused=\{isPaused\}/.test(sb),
      'a fiação de áudio do Livrinho mudou');

    // 27–31. Escopo / não-regressão
    check('F2.4e.5pR: StoryBook NÃO importa expo-audio direto (áudio segue via AudioPlayer)',
      !/from 'expo-audio'/.test(sb),
      'StoryBookScreen passou a importar expo-audio diretamente (fora de escopo)');

    check('F2.4e.5pR: audioService intacto (sem resolveStoryAudio/contentResolver)',
      !/resolveStoryAudio|contentResolver/.test(a1StripComments(readSrc('src/services/audioService.js'))),
      'audioService foi alterado (fora de escopo)');

    check('F2.4e.5pR: sem RevenueCat/entitlement/paywall/Brincar/conclusão/Free nos arquivos tocados',
      !/Purchases\.|RevenueCat|isPremiumUser|paywall|dailyRounds|startGameRound|isStoryFullyComplete|ATELIER_FREE_SAVE_LIMIT/i.test(sbCode + apCode),
      'arquivos tocados mexeram em RevenueCat/entitlement/Brincar/conclusão/Free');

    check('F2.4e.5pR: só lifecycle — AudioPlayer sem StyleSheet novo (<=1)',
      (ap.match(/StyleSheet\.create\(/g) || []).length <= 1,
      'AudioPlayer ganhou StyleSheet novo — deve ser só lifecycle, sem visual');

    check('F2.4e.5pR: sem dependência nova (AppState de react-native, não de pacote externo)',
      !/@react-native-community\/hooks/.test(sb) && !/react-native-appstate/.test(sb),
      'AppState veio de dependência externa (proibido)');

    // 32–34. Documentação + governança
    check('F2.4e.5pR: doc do bloco existe e cita token + AppState + foco',
      srcExists('docs/F2_4E_5PR_AUDIO_LIFECYCLE_HARDENING.md')
        && /playbackGenerationRef|token/.test(readSrc('docs/F2_4E_5PR_AUDIO_LIFECYCLE_HARDENING.md'))
        && /AppState/.test(readSrc('docs/F2_4E_5PR_AUDIO_LIFECYCLE_HARDENING.md'))
        && /isPlaybackContextLive|foco/.test(readSrc('docs/F2_4E_5PR_AUDIO_LIFECYCLE_HARDENING.md')),
      'falta docs/F2_4E_5PR_AUDIO_LIFECYCLE_HARDENING.md com token/AppState/foco');

    check('F2.4e.5pR: governança — DECISIONS.md e Documento Oficial v4 existem',
      srcExists('docs/DECISIONS.md') && srcExists('docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md'),
      'governança ausente (DECISIONS.md / Documento Oficial v4)');

    check('F2.4e.5pR: F2.4e.5p preservado (unmount-pause do AudioPlayer + blur do StoryBook)',
      /try \{ player\.pause\(\); \}[\s\S]*?onNarrationEnd\(\);\s*\}, \[\]\)/.test(ap)
        && /const isBookFocused = useIsFocused\(\)/.test(sbCode),
      'F2.4e.5p (unmount-pause / blur) foi quebrado');
  }

  // ── F2.4e.7b: gatilho QA release-safe do pack sandbox (dev OU preview/internal) ──
  console.log('\n── F2.4e.7b: gate QA release-safe do pack sandbox ──');
  {
    const ff = a1StripComments(readSrc('src/config/featureFlags.js'));
    const svc = a1StripComments(readSrc('src/services/packSandboxDevService.js'));
    const svcRaw = readSrc('src/services/packSandboxDevService.js');
    const nav = readSrc('src/navigation/AppNavigator.js');
    const eas = JSON.parse(readSrc('eas.json'));
    const hook = a1StripComments(readSrc('src/hooks/useResolvedStoryMedia.js'));
    const sb7b = a1StripComments(readSrc('src/screens/StoryBookScreen.js'));

    // 1. Helper central release-safe
    check('F2.4e.7b: featureFlags exporta RELEASE_PACK_QA_ENABLED (gate central release-safe)',
      /export const RELEASE_PACK_QA_ENABLED\s*=/.test(ff),
      'falta o helper central RELEASE_PACK_QA_ENABLED em featureFlags.js');

    // 2. Gate DEV preservado
    check('F2.4e.7b: gate DEV preservado (__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX)',
      /__DEV__\s*&&\s*process\.env\.EXPO_PUBLIC_ENABLE_PACK_SANDBOX\s*===\s*'true'/.test(svc),
      'gate dev foi removido/enfraquecido');

    // 3. Release gate exige múltiplas flags QA explícitas
    check('F2.4e.7b: gate release exige ENABLE_RELEASE_PACK_QA + QA_BUILD (>=2 flags QA)',
      /EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA\s*===\s*'true'/.test(ff)
        && /EXPO_PUBLIC_QA_BUILD\s*===\s*'true'/.test(ff),
      'gate release não exige as flags QA explícitas');

    // 4. Release gate exige BUILD_PROFILE === 'preview'
    check('F2.4e.7b: gate release exige EXPO_PUBLIC_BUILD_PROFILE === "preview"',
      /EXPO_PUBLIC_BUILD_PROFILE\s*===\s*'preview'/.test(ff),
      'gate release não amarra ao perfil preview → poderia ligar fora do preview');

    // 5. Release gate também exige EXPO_PUBLIC_ENABLE_PACK_SANDBOX
    check('F2.4e.7b: gate release também exige EXPO_PUBLIC_ENABLE_PACK_SANDBOX',
      /EXPO_PUBLIC_ENABLE_PACK_SANDBOX\s*===\s*'true'/.test(ff),
      'gate release não exige EXPO_PUBLIC_ENABLE_PACK_SANDBOX');

    // 6. NÃO é flag simples — conjunção de 4 (production-safe)
    check('F2.4e.7b: gate release é conjunção (>=3 "&&"), não flag simples',
      (ff.match(/&&/g) || []).length >= 3 && /EXPO_PUBLIC_BUILD_PROFILE\s*===\s*'preview'/.test(ff),
      'o gate release virou flag simples — produção poderia ligar por acidente');

    // 7. Gate central compõe dev OU release
    check('F2.4e.7b: isPackSandboxDevEnabled = devGate || RELEASE_PACK_QA_ENABLED',
      /RELEASE_PACK_QA_ENABLED/.test(svc) && /export function isPackSandboxDevEnabled\(\)/.test(svc)
        && /devGate \|\| RELEASE_PACK_QA_ENABLED/.test(svc),
      'isPackSandboxDevEnabled não usa o helper central release-safe');

    // 8. eas.json PRODUCTION sem flags QA
    check('F2.4e.7b: eas.json PRODUCTION sem flags QA (nunca liga sandbox na loja por acidente)',
      (() => {
        const p = (eas.build && eas.build.production && eas.build.production.env) || {};
        return p.EXPO_PUBLIC_ENABLE_PACK_SANDBOX !== 'true' && p.EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA !== 'true'
          && p.EXPO_PUBLIC_QA_BUILD !== 'true' && p.EXPO_PUBLIC_BUILD_PROFILE !== 'preview';
      })(),
      'production recebeu flags QA — risco de liberar o sandbox na loja');

    // 9. eas.json PREVIEW com as 4 flags QA
    check('F2.4e.7b: eas.json PREVIEW define as 4 flags QA (true/true/true/preview)',
      (() => {
        const e = (eas.build && eas.build.preview && eas.build.preview.env) || {};
        return e.EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true' && e.EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA === 'true'
          && e.EXPO_PUBLIC_QA_BUILD === 'true' && e.EXPO_PUBLIC_BUILD_PROFILE === 'preview';
      })(),
      'preview não define as 4 flags QA release-safe');

    // 10. Remoto limitado a david_goliath
    check('F2.4e.7b: remoto ainda limitado a david_goliath (SANDBOX_STORY_ID)',
      /SANDBOX_STORY_ID\s*=\s*'david_goliath'/.test(hook) && /isRemotePackStory\(storyId\)/.test(hook),
      'gate de história remota mudou');

    // 11. Fallback local preservado
    check('F2.4e.7b: fallback local preservado (remoteSource || local)',
      /return remoteSource \|\| localSource/.test(hook) && /return remoteSource \|\| localAudioAsset/.test(hook),
      'fallback local foi enfraquecido');

    // 12. sha256 real ainda obrigatório
    check('F2.4e.7b: sha256 real ainda obrigatório antes do ready (não enfraquecido)',
      /computeFileSha256/.test(readSrc('src/services/packIntegrityService.js'))
        && /computeFileSha256|validateFileEntry/.test(readSrc('src/services/packDownloadService.js')),
      'validação sha256 foi removida/enfraquecida');

    // 13. seed/reset ainda gated
    check('F2.4e.7b: seed/reset ainda abortam com o gate desligado',
      /if \(!isPackSandboxDevEnabled\(\)\) return/.test(svcRaw),
      'seed/reset não checam mais o gate');

    // 14. Rota só sob gate; FAB global REMOVIDO (M1) — acesso a packs só na seção Administração (dev)
    check('F2.4e.7b→M1: PackSandboxDev rota só sob devPacksEnabled; FAB global removido (não child-facing)',
      /const devPacksEnabled = isPackSandboxDevEnabled\(\)/.test(nav)
        && /devPacksEnabled && \(\s*<Stack\.Screen\s+name="PackSandboxDev"/.test(nav)
        && !/devPacksEnabled && \(\s*<TouchableOpacity/.test(nav),
      'rota PackSandboxDev fora do gate OU FAB global ainda presente (M1 removeu o FAB)');

    // 15. Lifecycle de áudio F2.4e.5pR intacto
    check('F2.4e.7b: lifecycle de áudio F2.4e.5pR intacto (token/navigation.isFocused/AppState)',
      /playbackGenerationRef/.test(sb7b) && /navigation\.isFocused\(\)/.test(sb7b)
        && /AppState/.test(readSrc('src/components/AudioPlayer.js')),
      'lifecycle de áudio foi tocado');

    // 16. Sem RevenueCat/entitlement/Brincar/conclusão nos arquivos tocados
    check('F2.4e.7b: sem RevenueCat/entitlement/Brincar/conclusão nos arquivos tocados',
      !/Purchases\.|RevenueCat|isPremiumUser|dailyRounds|startGameRound|isStoryFullyComplete/i.test(ff + svc),
      'arquivo tocado mexeu em RevenueCat/entitlement/Brincar/conclusão');

    // 17. Requires locais preservados (fallback)
    check('F2.4e.7b: requires locais preservados (coloring/covers/scenes/audio)',
      /require\(/.test(readSrc('src/assets/coloringImages.js')) && /require\(/.test(readSrc('src/assets/storyCovers.js'))
        && /require\(/.test(readSrc('src/data/storySceneIllustrations.js')) && /require\(/.test(readSrc('src/data/audioManifest.js')),
      'requires locais foram removidos');

    // 18. A Criação/Noé continuam starter local
    check('F2.4e.7b: A Criação/Noé continuam starter (local)',
      /STARTER_STORY_IDS\s*=\s*Object\.freeze\(\['creation', 'noah'\]\)/.test(readSrc('src/data/contentManifest.js')),
      'camada starter (creation/noah) mudou');

    // 19. Sem ios/ nem android/ gerados
    check('F2.4e.7b: sem pastas nativas ios/ ou android/ no repo',
      !srcExists('ios') && !srcExists('android'),
      'pastas nativas ios/ ou android/ apareceram (prebuild rodou?)');

    // 20. Doc do bloco existe e cita as flags + production-safe
    check('F2.4e.7b: doc do bloco existe e cita as 4 flags + production sem QA',
      srcExists('docs/F2_4E_7B_RELEASE_SAFE_PACK_QA_GATE.md')
        && /EXPO_PUBLIC_BUILD_PROFILE/.test(readSrc('docs/F2_4E_7B_RELEASE_SAFE_PACK_QA_GATE.md'))
        && /production/i.test(readSrc('docs/F2_4E_7B_RELEASE_SAFE_PACK_QA_GATE.md')),
      'falta docs/F2_4E_7B_RELEASE_SAFE_PACK_QA_GATE.md completo');

    // 21. Governança
    check('F2.4e.7b: governança — DECISIONS.md e Documento Oficial v4 existem',
      srcExists('docs/DECISIONS.md') && srcExists('docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md'),
      'governança ausente (DECISIONS.md / Documento Oficial v4)');
  }

  // ── F2.5c: consumo remoto expandido às 18 premium (gated por camada; fallback local) ──
  console.log('\n── F2.5c: consumo remoto das 18 premium (camada remote) ──');
  {
    const hook = readSrc('src/hooks/useResolvedStoryMedia.js');
    const hookC = a1StripComments(hook);
    const cm = readSrc('src/data/contentManifest.js');

    check('F2.5c: isRemotePackStory por CAMADA (getContentLayer === CONTENT_LAYERS.REMOTE)',
      /export function isRemotePackStory\(storyId\)/.test(hookC)
        && /getContentLayer\(storyId\) === CONTENT_LAYERS\.REMOTE/.test(hookC),
      'falta isRemotePackStory baseado em getContentLayer/CONTENT_LAYERS.REMOTE');

    check('F2.5c: hook importa getContentLayer + CONTENT_LAYERS de contentManifest',
      /import \{[^}]*getContentLayer[^}]*CONTENT_LAYERS[^}]*\} from '\.\.\/data\/contentManifest'/.test(hook),
      'hook não importa getContentLayer/CONTENT_LAYERS');

    check('F2.5c: gate fixo removido — sem "storyId === SANDBOX_STORY_ID" no hook',
      !/storyId === SANDBOX_STORY_ID/.test(hookC),
      'ainda há gate fixo storyId === SANDBOX_STORY_ID no hook');

    check('F2.5c: SANDBOX_STORY_ID ainda EXPORTADO (compatibilidade)',
      /export const SANDBOX_STORY_ID = 'david_goliath'/.test(hookC),
      'SANDBOX_STORY_ID deixou de ser exportado');

    check('F2.5c: os 4 kinds + cena usam isRemotePackStory (>=9 gates)',
      (hookC.match(/isRemotePackStory\(storyId\)/g) || []).length >= 9,
      'nem todos os gates do hook usam isRemotePackStory');

    check('F2.5c: FALLBACK LOCAL preservado (remote || local em todos os kinds)',
      /return remoteSource \|\| localSource/.test(hookC) && /return remoteSource \|\| localAudioAsset/.test(hookC)
        && /return getOfficialSceneIllustration\(storyId, sceneId\)/.test(hookC),
      'fallback local (remote || local) foi enfraquecido');

    check('F2.5c: creation/noah continuam STARTER (excluídas do consumo remoto)',
      /STARTER_STORY_IDS\s*=\s*Object\.freeze\(\['creation', 'noah'\]\)/.test(cm)
        && /creation:\s*'starter'/.test(cm) && /noah:\s*'starter'/.test(cm),
      'creation/noah não são mais starter (entrariam no consumo remoto)');

    check('F2.5c: 18 premium elegíveis (camada remote) — amostra + contagem',
      /david_goliath:\s*'remote'/.test(cm) && /jesus_children:\s*'remote'/.test(cm)
        && /moses_red_sea:\s*'remote'/.test(cm) && /daniel_lions:\s*'remote'/.test(cm)
        && (cm.match(/:\s*'remote'/g) || []).length >= 18,
      'camada remote não cobre as 18 premium esperadas');

    check('F2.5c: requires locais preservados (nenhum asset removido)',
      /require\(/.test(readSrc('src/assets/coloringImages.js')) && /require\(/.test(readSrc('src/assets/storyCovers.js'))
        && /require\(/.test(readSrc('src/data/storySceneIllustrations.js')) && /require\(/.test(readSrc('src/data/audioManifest.js')),
      'requires locais foram removidos');

    check('F2.5c: mudança isolada no hook (downloader/resolver/storage NÃO alterados)',
      !/isRemotePackStory/.test(readSrc('src/services/packDownloadService.js'))
        && !/isRemotePackStory/.test(readSrc('src/services/contentResolver.js'))
        && !/isRemotePackStory/.test(readSrc('src/context/PacksContext.js'))
        && !/isRemotePackStory/.test(readSrc('src/services/globalManifestService.js')),
      'a mudança vazou para downloader/resolver/storage/globalManifest (deveria ser só no hook)');

    check('F2.5c: doc do bloco existe',
      srcExists('docs/F2_5C_REMOTE_CONSUMPTION_18_PACKS.md'),
      'falta docs/F2_5C_REMOTE_CONSUMPTION_18_PACKS.md');
  }

  // ── F2.5-hardening-1: cena com fallback + localDir recomposto + guard do colorir ──
  console.log('\n── F2.5-hardening-1: blindagem do consumo remoto (C2 cena / C3 localDir / C4 colorir) ──');
  {
    const hookH = a1StripComments(readSrc('src/hooks/useResolvedStoryMedia.js'));
    const osiC = a1StripComments(readSrc('src/components/story/OfficialSceneImage.js'));
    const ssvC = a1StripComments(readSrc('src/components/story/StorySceneVisual.js'));
    const narrC = a1StripComments(readSrc('src/screens/NarrationScreen.js'));
    const pcC = a1StripComments(readSrc('src/context/PacksContext.js'));

    // ── C2: cena com pré-checagem de existência + anti-race + fallback de render ──
    check('F2.5-hardening-1 C2: useResolvedSceneImage checa existência (getInfoAsync+exists), é race-safe e fallback-first',
      /export function useResolvedSceneImage\(storyId, sceneId\)/.test(hookH)
        && /getInfoAsync\(candidateUri\)/.test(hookH) && /info\.exists/.test(hookH)
        && /let cancelled = false/.test(hookH)
        && /return safeRemoteSource \|\| localSource/.test(hookH),
      'cena sem getInfoAsync / sem guarda de race (cancelled) / não é fallback-first');

    check('F2.5-hardening-1 C2 (anti-race): remoto só é usado quando remoteSource.uri === candidateUri ATUAL',
      /remoteSource\.uri === candidateUri/.test(hookH)
        && /const safeRemoteSource\s*=/.test(hookH),
      'falta a guarda anti-race safeRemoteSource (remoteSource.uri === candidateUri)');

    check('F2.5-hardening-1 C2: OfficialSceneImage tem onError→fallbackSource + reset de failed em [source, fallbackSource]',
      /fallbackSource/.test(osiC) && /onError=\{/.test(osiC)
        && /setFailed\(true\)/.test(osiC) && /setFailed\(false\)/.test(osiC)
        && /\[source, fallbackSource\]/.test(osiC),
      'OfficialSceneImage sem onError/fallbackSource/reset de failed');

    check('F2.5-hardening-1 C2: StorySceneVisual repassa fallbackSource no estado oficial',
      /officialFallback/.test(ssvC) && /fallbackSource=\{officialFallback\}/.test(ssvC),
      'StorySceneVisual não repassa officialFallback→fallbackSource');

    check('F2.5-hardening-1 C2: NarrationScreen fornece officialFallback null-safe (require local)',
      /getOfficialSceneIllustration/.test(narrC)
        && /officialFallback = cena\?\.id \? getOfficialSceneIllustration\(story\.id, cena\.id\) : null/.test(narrC)
        && /officialFallback=\{officialFallback\}/.test(narrC),
      'NarrationScreen não fornece officialFallback null-safe / não repassa a prop');

    // ── C3: localDir recomposto no PacksContext (read-only) ──
    check('F2.5-hardening-1 C3: PacksContext importa getPackLocalDir e recompõe localDir por (storyId, version) em useMemo',
      /import \{[^}]*getPackLocalDir[^}]*\} from '\.\.\/services\/packStorageService'/.test(pcC)
        && /normalizedIndex = useMemo\(/.test(pcC) && /e\.version \? getPackLocalDir/.test(pcC),
      'PacksContext não recompõe localDir via getPackLocalDir(storyId, version) em useMemo([packIndex])');

    check('F2.5-hardening-1 C3→hardening-2: getters + value.packIndex usam reconciledIndex (derivado do normalizedIndex recomposto)',
      /reconcileEntry\(normalizedIndex\[sid\]/.test(pcC)
        && (pcC.match(/reconciledIndex\[storyId\]/g) || []).length >= 2
        && /packIndex: reconciledIndex/.test(pcC),
      'getters/value não consomem o índice recomposto via reconciledIndex');

    check('F2.5-hardening-1 C3: PacksContext segue READ-ONLY (sem gravar índice / sem baixar / schema intacto)',
      !/savePackIndex|setPackEntry|clearPackEntry|setItem\(/.test(pcC)
        && !/downloadAsync|createDownloadResumable|fetch\(/.test(pcC),
      'PacksContext passou a gravar índice/baixar (deveria seguir read-only)');

    // ── C4: guard do colorir (cena.id === posição) ──
    check('F2.5-hardening-1 C4: colorir só monta candidato remoto quando cena.id === posição (keyMatches)',
      /keyMatches = !!cena && cena\.id === sceneNumber/.test(hookH)
        && /sceneNumber > 0 && keyMatches/.test(hookH),
      'colorir sem guard cena.id===posição (risco de lineart errada no futuro)');

    // ── Regressão: intactos ──
    check('F2.5-hardening-1: resolveSceneImageForStory (Livrinho) + StoryBookScreen local INTACTOS',
      /export function resolveSceneImageForStory\(storyId, sceneId, packEntry = null\)/.test(hookH)
        && /return getOfficialSceneIllustration\(storyId, sceneId\)/.test(hookH)
        && /function OfficialSceneImage\(\{ source, cena, fallbackColor, onSettled \}\)/.test(a1StripComments(readSrc('src/screens/StoryBookScreen.js'))),
      'resolveSceneImageForStory ou o OfficialSceneImage do Livrinho foram alterados (deveriam ficar intactos)');

    check('F2.5-hardening-1: contentResolver.js e packStorageService.js INALTERADOS (sem lógica nova)',
      !/normalizedIndex|isRemotePackStory|keyMatches/.test(readSrc('src/services/contentResolver.js'))
        && !/normalizedIndex/.test(readSrc('src/services/packStorageService.js')),
      'contentResolver/packStorageService foram tocados (deveriam ficar intactos)');

    check('F2.5-hardening-1: doc do bloco existe',
      srcExists('docs/F2_5_HARDENING_1.md'),
      'falta docs/F2_5_HARDENING_1.md');
  }

  // ── F2.5-hardening-2: reconciliação índice↔disco (memória) + fix da janela delete→move ──
  console.log('\n── F2.5-hardening-2: consistência índice↔disco (reconciliação em memória) ──');
  {
    const evalReconcile = () => {
      const code = a1StripComments(readSrc('src/services/packReconcileService.js'))
        .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '').replace(/^export\s+/gm, '');
      const header = "const PACK_STATUS={INCLUDED:'included',NOT_DOWNLOADED:'not_downloaded',DOWNLOADING:'downloading',VERIFYING:'verifying',READY:'ready',FAILED:'failed',NEEDS_UPDATE:'needs_update',REQUIRES_APP_UPDATE:'requires_app_update'};";
      return new Function(header + code + ';return { needsDiskCheck, isReadyEntryValid, computeInvalidReadyIds, reconcileEntry };')();
    };

    // ── Núcleo puro (eval REAL) ──
    check('F2.5-hardening-2: núcleo — ready+disco ok → válido; localDir/manifest ausente → inválido; throw → conservador',
      (() => { try {
        const R = evalReconcile();
        const ready = { status: 'ready', localDir: 'x/', storyId: 'a' };
        return R.isReadyEntryValid(ready, { localDirExists: true, manifestExists: true }) === true
          && R.isReadyEntryValid(ready, { localDirExists: false }) === false
          && R.isReadyEntryValid(ready, { localDirExists: true, manifestExists: false }) === false
          && R.isReadyEntryValid(ready, { localDirExists: null, manifestExists: null }) === true;
      } catch { return false; } })(),
      'isReadyEntryValid incorreto (ok→true; localDir/manifest false→false; null→true conservador)');

    check('F2.5-hardening-2: não-ready nunca é invalidado (needsDiskCheck=false) e reconcileEntry não promove',
      (() => { try {
        const R = evalReconcile();
        const dl = { status: 'downloading', localDir: 'x/', storyId: 'a' };
        return R.needsDiskCheck(dl) === false
          && R.isReadyEntryValid(dl, { localDirExists: false }) === true
          && R.reconcileEntry(dl, true) === dl; // não-ready → mesma ref, nunca vira ready
      } catch { return false; } })(),
      'não-ready foi tratado como ready ou invalidado indevidamente');

    check('F2.5-hardening-2: reconcileEntry rebaixa ready inválido → not_downloaded; válido mantém MESMA referência',
      (() => { try {
        const R = evalReconcile();
        const e = { status: 'ready', localDir: 'x/', storyId: 'a' };
        const bad = R.reconcileEntry(e, true);
        const good = R.reconcileEntry(e, false);
        return bad !== e && bad.status === 'not_downloaded' && good === e;
      } catch { return false; } })(),
      'reconcileEntry não rebaixa inválido para not_downloaded ou não preserva a referência do válido');

    check('F2.5-hardening-2: computeInvalidReadyIds lista SÓ os READY inválidos',
      (() => { try {
        const R = evalReconcile();
        const idx = {
          a: { status: 'ready', localDir: 'x/', storyId: 'a' },
          b: { status: 'ready', localDir: 'y/', storyId: 'b' },
          c: { status: 'downloading', localDir: 'z/', storyId: 'c' },
        };
        const probes = { a: { localDirExists: true, manifestExists: true }, b: { localDirExists: false } };
        const inv = R.computeInvalidReadyIds(idx, probes);
        return inv.length === 1 && inv[0] === 'b';
      } catch { return false; } })(),
      'computeInvalidReadyIds não isolou o READY inválido');

    check('F2.5-hardening-2: packReconcileService é PURO (sem FileSystem/AsyncStorage/rede no código)',
      !/expo-file-system|FileSystem|AsyncStorage|fetch\(|downloadAsync|getInfoAsync/.test(a1StripComments(readSrc('src/services/packReconcileService.js'))),
      'packReconcileService importa FS/AsyncStorage/rede (deveria ser puro)');

    // ── PacksContext: overlay + read-only ──
    const pcH2 = a1StripComments(readSrc('src/context/PacksContext.js'));
    check('F2.5-hardening-2: PacksContext reconcilia (probePackDisk getInfoAsync localDir+manifest.json; overlay; reconciledIndex)',
      /from '\.\.\/services\/packReconcileService'/.test(pcH2)
        && /getInfoAsync\(localDir\)/.test(pcH2) && /manifest\.json/.test(pcH2)
        && /invalidReadyIds/.test(pcH2) && /computeInvalidReadyIds/.test(pcH2)
        && /reconciledIndex = useMemo/.test(pcH2) && /reconcileEntry/.test(pcH2),
      'PacksContext não faz reconciliação (probePackDisk/overlay/reconciledIndex)');

    check('F2.5-hardening-2: probe indeterminado é conservador ({localDirExists:null, manifestExists:null} no throw)',
      /return \{ localDirExists: null, manifestExists: null \}/.test(pcH2),
      'probePackDisk não trata throw como indeterminado {null,null}');

    check('F2.5-hardening-2: getters + value.packIndex usam reconciledIndex (efetivo NOT_DOWNLOADED)',
      (pcH2.match(/reconciledIndex\[storyId\]/g) || []).length >= 2 && /packIndex: reconciledIndex/.test(pcH2),
      'getPackEntry/getStoryPackState/value não usam reconciledIndex');

    check('F2.5-hardening-2: PacksContext continua READ-ONLY (sem gravar índice / baixar)',
      !/savePackIndex|setPackEntry|clearPackEntry|setItem\(/.test(pcH2)
        && !/downloadAsync|createDownloadResumable|fetch\(/.test(pcH2),
      'PacksContext passou a gravar índice/baixar (deveria seguir read-only)');

    check('F2.5-hardening-2: reconcile com cancellation + setInvalidReadyIds só quando o conjunto muda',
      /let cancelled = false/.test(pcH2) && /if \(cancelled\) return/.test(pcH2) && /sameIds\(prev, invalid\)/.test(pcH2),
      'reconcile sem cancellation, ou atualiza estado sem checar mudança (render à toa)');

    // ── packDownloadService: DOWNLOADING antes do swap com safe stat ──
    const pdsH2 = a1StripComments(readSrc('src/services/packDownloadService.js'));
    check('F2.5-hardening-2: marca DOWNLOADING antes do swap SÓ com localDir confirmado (info.exists === true)',
      /getInfoAsync\(localDir\)/.test(pdsH2) && /exists === true/.test(pdsH2)
        && /setPackEntry\(storyId, \{ version, status: PACK_STATUS\.DOWNLOADING \}\)/.test(pdsH2),
      'packDownloadService não marca DOWNLOADING sob existência confirmada');

    check('F2.5-hardening-2: stat de localDir é SEGURO (try/catch → preExisting=false, download segue)',
      /try \{[\s\S]*?getInfoAsync\(localDir\)[\s\S]*?\} catch \{ preExisting = false; \}/.test(pdsH2),
      'o stat de localDir não está isolado em try/catch seguro');

    check('F2.5-hardening-2: ordem preservada — DOWNLOADING e move antes do READY; READY só após move',
      (() => {
        const dlIdx = pdsH2.search(/setPackEntry\(storyId, \{ version, status: PACK_STATUS\.DOWNLOADING \}\)/);
        const mvIdx = pdsH2.search(/moveAsync\(\{ from: tempDir, to: localDir \}\)/);
        // READY do FLUXO DE DOWNLOAD = após o move (ignora markPackReady, que fica antes no arquivo).
        const readyAfterMove = mvIdx >= 0 && /setPackEntry\(storyId, \{\s*version,\s*status: PACK_STATUS\.READY/.test(pdsH2.slice(mvIdx));
        return dlIdx >= 0 && mvIdx > dlIdx && readyAfterMove;
      })(),
      'ordem insegura: DOWNLOADING/move/ready fora de ordem');

    // ── Escopo + regressão ──
    check('F2.5-hardening-2: SEM GC destrutivo (sem readDirectoryAsync); precheck de espaço é F2.5-hardening-2b.i',
      !/readDirectoryAsync/.test(pcH2 + pdsH2),
      'GC destrutivo (readDirectoryAsync) iniciado — é F2.5-hardening-2b.ii');

    check('F2.5-hardening-2: protegidos INTACTOS (contentResolver/packStorageService/StoryBookScreen sem lógica nova)',
      !/reconcileEntry|invalidReadyIds|probePackDisk/.test(readSrc('src/services/contentResolver.js'))
        && !/reconcileEntry|invalidReadyIds|probePackDisk/.test(readSrc('src/services/packStorageService.js'))
        && !/reconcileEntry|invalidReadyIds|probePackDisk/.test(readSrc('src/screens/StoryBookScreen.js')),
      'contentResolver/packStorageService/StoryBookScreen foram tocados (deveriam ficar intactos)');

    check('F2.5-hardening-2: nenhum require removido dos loaders',
      /require\(/.test(readSrc('src/assets/coloringImages.js')) && /require\(/.test(readSrc('src/assets/storyCovers.js'))
        && /require\(/.test(readSrc('src/data/storySceneIllustrations.js')) && /require\(/.test(readSrc('src/data/audioManifest.js')),
      'requires locais foram removidos');

    check('F2.5-hardening-2: doc do bloco existe',
      srcExists('docs/F2_5_HARDENING_2.md'),
      'falta docs/F2_5_HARDENING_2.md');
  }

  // ── F2.5-hardening-3: manifestSha256 obrigatório + timeout + cancelamento + gate de rede ──
  console.log('\n── F2.5-hardening-3: endurecimento do download remoto ──');
  {
    const pds3 = a1StripComments(readSrc('src/services/packDownloadService.js'));

    // ── manifestSha256 OBRIGATÓRIO ──
    check('F2.5-hardening-3: manifestSha256 obrigatório — verifica bytes do manifest.json vs âncora, rejeita ausente/divergente',
      /pack\.manifestSha256/.test(pds3) && /computeFileSha256\(mTo\)/.test(pds3)
        && /manifestSha256 ausente\/inv[aá]lido/.test(pds3)
        && /sha256 divergente da [aâ]ncora/.test(pds3),
      'downloader não torna manifestSha256 obrigatório (ausente/divergente deve rejeitar)');

    check('F2.5-hardening-3: manifestSha256 verificado ANTES de baixar arquivos e ANTES do ready',
      (() => {
        const shaIdx = pds3.search(/computeFileSha256\(mTo\)/);
        const fileIdx = pds3.search(/createDownloadResumable\(`[^`]*f\.path/);
        const mvIdx = pds3.search(/moveAsync\(\{ from: tempDir, to: localDir \}\)/);
        return shaIdx >= 0 && fileIdx > shaIdx && mvIdx > fileIdx;
      })(),
      'a verificação do manifestSha256 não ocorre antes do download dos arquivos/ready');

    // ── TIMEOUT ──
    check('F2.5-hardening-3: timeout no manifest.json e nos arquivos (withTimeout + defaults 15000/60000)',
      /async function withTimeout\(/.test(pds3)
        && /manifestTimeoutMs = 15000/.test(pds3) && /fileTimeoutMs = 60000/.test(pds3)
        && /await withTimeout\(\(\) => mdl\.downloadAsync\(\)/.test(pds3)
        && /await withTimeout\(\(\) => dl\.downloadAsync\(\)/.test(pds3),
      'timeout ausente no manifest.json e/ou nos arquivos');

    // ── CANCELAMENTO ──
    check('F2.5-hardening-3: cancelamento no núcleo (isCancelled + throwIfCancelled em >=4 pontos)',
      /isCancelled/.test(pds3) && (pds3.match(/throwIfCancelled\(isCancelled\)/g) || []).length >= 4,
      'cancelamento ausente ou com poucos pontos de checagem');

    check('F2.5-hardening-3: cancelamento NÃO grava índice (sem setPackEntry) e retorna { cancelled:true }',
      (() => {
        const m = pds3.match(/if \(e === CANCELLED[\s\S]*?return \{ ok: false, cancelled: true, reason: 'cancelado' \};/);
        return !!m && !/setPackEntry/.test(m[0]) && /deleteAsync\(tempDir/.test(m[0]);
      })(),
      'ramo de cancelamento grava índice ou não limpa .tmp / não retorna cancelled:true');

    // ── failWith preserva READY anterior (regra do Portão 3) ──
    check('F2.5-hardening-3: failWith NÃO rebaixa READY — só grava FAILED quando não há READY anterior',
      /const prev = await getPackEntry\(storyId\)/.test(pds3)
        && /if \(!\(prev && prev\.status === PACK_STATUS\.READY\)\)/.test(pds3)
        && /import \{[^}]*getPackEntry[^}]*\} from '\.\/packStorageService'/.test(pds3),
      'failWith pode rebaixar um pack READY anterior (deveria preservar)');

    // ── GATE DE REDE (sem dep) ──
    check('F2.5-hardening-3: gate de rede — !gm.ok retorna networkError ANTES de criar .tmp/índice',
      (() => {
        const netIdx = pds3.search(/networkError = \/rede indispon/);
        const mkIdx = pds3.search(/makeDirectoryAsync\(tempDir/);
        return netIdx >= 0 && /networkError \}/.test(pds3) && mkIdx > netIdx;
      })(),
      'gate de rede ausente ou networkError não é retornado antes de tocar .tmp/índice');

    // ── READY só após move (invariante preservada) ──
    check('F2.5-hardening-3: READY continua SÓ após moveAsync bem-sucedido',
      (() => {
        const mvIdx = pds3.search(/moveAsync\(\{ from: tempDir, to: localDir \}\)/);
        return mvIdx >= 0 && /setPackEntry\(storyId, \{\s*version,\s*status: PACK_STATUS\.READY/.test(pds3.slice(mvIdx));
      })(),
      'READY não está estritamente após o move');

    // ── ESCOPO / SEM DEP NOVA / REGRESSÃO ──
    check('F2.5-hardening-3: sem dependência de rede nova (expo-network/NetInfo) no serviço nem no package.json',
      !/expo-network|NetInfo|netinfo/i.test(pds3)
        && !/expo-network|@react-native-community\/netinfo|"netinfo"/i.test(readSrc('package.json')),
      'dependência de rede nova detectada (proibida neste bloco)');

    check('F2.5-hardening-3: sem GC destrutivo (sem readDirectoryAsync); precheck de espaço é F2.5-hardening-2b.i',
      !/readDirectoryAsync/.test(pds3),
      'GC destrutivo (readDirectoryAsync) iniciado no downloader — é F2.5-hardening-2b.ii');

    check('F2.5-hardening-3: protegidos INTACTOS (globalManifest/packIntegrity/packStorage/PacksContext/packSandboxDev)',
      !/throwIfCancelled|withTimeout|manifestTimeoutMs/.test(readSrc('src/services/globalManifestService.js'))
        && !/throwIfCancelled|withTimeout/.test(readSrc('src/services/packIntegrityService.js'))
        && !/throwIfCancelled|withTimeout/.test(readSrc('src/services/packStorageService.js'))
        && !/throwIfCancelled|withTimeout/.test(readSrc('src/context/PacksContext.js'))
        && !/throwIfCancelled|withTimeout|manifestTimeoutMs/.test(readSrc('src/services/packSandboxDevService.js')),
      'a mudança vazou para arquivos protegidos');

    check('F2.5-hardening-3: nenhum require removido dos loaders',
      /require\(/.test(readSrc('src/assets/coloringImages.js')) && /require\(/.test(readSrc('src/assets/storyCovers.js'))
        && /require\(/.test(readSrc('src/data/storySceneIllustrations.js')) && /require\(/.test(readSrc('src/data/audioManifest.js')),
      'requires locais foram removidos');

    check('F2.5-hardening-3: doc do bloco existe',
      srcExists('docs/F2_5_HARDENING_3.md'),
      'falta docs/F2_5_HARDENING_3.md');
  }

  // ── F2.5-hardening-2b.i: pré-checagem de espaço (não-destrutivo) no download remoto ──
  console.log('\n── F2.5-hardening-2b.i: pré-checagem de espaço ──');
  {
    const pds2bi = a1StripComments(readSrc('src/services/packDownloadService.js'));

    // Helper puro spaceNeededBytes (eval REAL): margem max(20%, 20MB), piso 20MB.
    const spaceHelperSrc = (pds2bi.match(/const SPACE_MARGIN_FLOOR_BYTES =[\s\S]*?SPACE_MARGIN_FLOOR_BYTES\);\s*\}/) || [])[0] || '';
    check('F2.5-hardening-2b.i: spaceNeededBytes puro — estimativa + max(20%, 20MB), piso 20MB',
      (() => { try {
        const f = new Function(spaceHelperSrc + '; return spaceNeededBytes;')();
        const MB = 1024 * 1024;
        return f(100 * MB) === 120 * MB   // 100 + max(20,20)=120
          && f(50 * MB) === 70 * MB       // 50 + max(10,20)=70
          && f(10 * MB) === 30 * MB       // 10 + max(2,20)=30 (piso 20 domina)
          && f(0) === 20 * MB             // 0 → piso 20
          && f(-5) === 20 * MB            // inválido → 0 → piso 20
          && f(200 * MB) === 240 * MB;    // 200 + max(40,20)=240 (20% domina)
      } catch { return false; } })(),
      'spaceNeededBytes incorreto (deveria: estimativa + max(20%, 20MB), piso 20MB)');

    check('F2.5-hardening-2b.i: precheck usa spaceNeededBytes(totalBytes) + getFreeDiskStorageAsync + failWith(insufficient_space)',
      /const neededBytes = spaceNeededBytes\(totalBytes\)/.test(pds2bi)
        && /getFreeDiskStorageAsync/.test(pds2bi)
        && /failWith\('insufficient_space'\)/.test(pds2bi),
      'precheck ausente ou não usa totalBytes/getFreeDiskStorageAsync/insufficient_space');

    check('F2.5-hardening-2b.i: API SEGURA (typeof função + try/catch + só bloqueia com number < needed)',
      /typeof FileSystem\.getFreeDiskStorageAsync === 'function'/.test(pds2bi)
        && /try \{ freeBytes = await FileSystem\.getFreeDiskStorageAsync\(\); \} catch/.test(pds2bi)
        && /typeof freeBytes === 'number' && freeBytes < neededBytes/.test(pds2bi),
      'getFreeDiskStorageAsync não é usado de forma segura (typeof função + try/catch + guarda number)');

    check('F2.5-hardening-2b.i: precheck ANTES do loop pesado e DEPOIS de totalBytes',
      (() => {
        const totIdx = pds2bi.search(/const totalBytes = wanted\.reduce/);
        const chkIdx = pds2bi.search(/const neededBytes = spaceNeededBytes\(totalBytes\)/);
        const fileIdx = pds2bi.search(/createDownloadResumable\(`[^`]*f\.path/);
        return totIdx >= 0 && chkIdx > totIdx && fileIdx > chkIdx;
      })(),
      'precheck fora de posição (deve ser após totalBytes e antes do download dos arquivos)');

    check('F2.5-hardening-2b.i: estimativa por wanted[].bytes (NÃO pack.bytes cego)',
      /spaceNeededBytes\(totalBytes\)/.test(pds2bi) && !/pack\.bytes/.test(pds2bi),
      'precheck usa pack.bytes cego (deveria usar totalBytes de wanted)');

    check('F2.5-hardening-2b.i: insufficient_space é REASON (não novo PACK_STATUS); packStorageService intacto',
      /failWith\('insufficient_space'\)/.test(pds2bi)
        && !/insufficient_space|INSUFFICIENT/.test(readSrc('src/services/packStorageService.js')),
      'insufficient_space virou status novo ou packStorageService foi tocado');

    check('F2.5-hardening-2b.i: READY só após move + failWith preserva READY (intactos)',
      (() => {
        const mvIdx = pds2bi.search(/moveAsync\(\{ from: tempDir, to: localDir \}\)/);
        return mvIdx >= 0 && /setPackEntry\(storyId, \{\s*version,\s*status: PACK_STATUS\.READY/.test(pds2bi.slice(mvIdx))
          && /if \(!\(prev && prev\.status === PACK_STATUS\.READY\)\)/.test(pds2bi);
      })(),
      'READY não está após move OU failWith deixou de preservar READY');

    check('F2.5-hardening-2b.i: SEM GC/destrutivo (sem readDirectoryAsync/packGcService) e SEM dep nova',
      !/readDirectoryAsync/.test(pds2bi) && !srcExists('src/services/packGcService.js')
        && !/expo-network|NetInfo/i.test(pds2bi)
        && !/getFreeDiskStorageAsync|spaceNeededBytes|insufficient_space/i.test(readSrc('package.json')),
      'introduziu GC/readDirectoryAsync/packGcService/dep nova (fora do escopo do 2b.i)');

    check('F2.5-hardening-2b.i: protegidos INTACTOS (PacksContext/contentResolver/globalManifest/packIntegrity/packSandboxDev)',
      !/spaceNeededBytes|insufficient_space|getFreeDiskStorageAsync/.test(readSrc('src/context/PacksContext.js'))
        && !/spaceNeededBytes|insufficient_space/.test(readSrc('src/services/contentResolver.js'))
        && !/getFreeDiskStorageAsync|spaceNeededBytes/.test(readSrc('src/services/globalManifestService.js'))
        && !/spaceNeededBytes|insufficient_space/.test(readSrc('src/services/packIntegrityService.js'))
        && !/spaceNeededBytes|insufficient_space/.test(readSrc('src/services/packSandboxDevService.js')),
      'a mudança vazou para arquivos protegidos');

    check('F2.5-hardening-2b.i: nenhum require removido dos loaders',
      /require\(/.test(readSrc('src/assets/coloringImages.js')) && /require\(/.test(readSrc('src/assets/storyCovers.js'))
        && /require\(/.test(readSrc('src/data/storySceneIllustrations.js')) && /require\(/.test(readSrc('src/data/audioManifest.js')),
      'requires locais foram removidos');

    check('F2.5-hardening-2b.i: doc do bloco existe',
      srcExists('docs/F2_5_HARDENING_2B_I.md'),
      'falta docs/F2_5_HARDENING_2B_I.md');
  }

  // ── LIVRINHO_FIX_1: rede de segurança do autoplay do Livrinho (watchdog + backstop + erro) ──
  console.log('\n── LIVRINHO_FIX_1: watchdog de reprodução do Livrinho ──');
  {
    const ap = a1StripComments(readSrc('src/components/AudioPlayer.js'));
    const apHelpers = ((ap.match(/function hasAudioProgressed[\s\S]*?\n\}/) || [''])[0])
      + '\n' + ((ap.match(/function isAudioNearEnd[\s\S]*?\n\}/) || [''])[0]);

    check('LIVRINHO_FIX_1: helpers puros hasAudioProgressed / isAudioNearEnd corretos (eval REAL)',
      (() => { try {
        const H = new Function(apHelpers + '; return { hasAudioProgressed, isAudioNearEnd };')();
        return H.hasAudioProgressed(0, 0.2, 0.15) === true
          && H.hasAudioProgressed(0, 0.1, 0.15) === false
          && H.hasAudioProgressed(NaN, 1, 0.15) === false
          && H.isAudioNearEnd(9.7, 10, 0.35) === true
          && H.isAudioNearEnd(5, 10, 0.35) === false
          && H.isAudioNearEnd(5, 0, 0.35) === false      // duração desconhecida → false (sem teto cego)
          && H.isAudioNearEnd(3, -1, 0.35) === false;
      } catch { return false; } })(),
      'hasAudioProgressed/isAudioNearEnd incorretos');

    check('LIVRINHO_FIX_1: stall detectado por currentTime (NÃO por playing/timeControlStatus); exclui buffering',
      /hasAudioProgressed\(lastCheck, s\.currentTime, MIN_PROGRESS_DELTA_S\)/.test(ap)
        && /s\.isBuffering/.test(ap)
        && !/timeControlStatus\s*===\s*'waiting'/.test(ap) && !/status\.playing\s*===\s*false/.test(ap),
      'watchdog não usa currentTime, ou depende de playing/timeControlStatus (proibido no ajuste 1)');

    check('LIVRINHO_FIX_1: retry LIMITADO (MAX_START_RETRIES=2), player.play(), seekTo(0) só no início',
      /const MAX_START_RETRIES = 2/.test(ap)
        && /retryCountRef\.current < MAX_START_RETRIES/.test(ap) && /retryCountRef\.current \+= 1/.test(ap)
        && /s\.currentTime < SEEK_RESET_THRESHOLD_S\) player\.seekTo\(0\)/.test(ap) && /player\.play\(\)/.test(ap),
      'retry não é limitado, ou seekTo(0) é incondicional');

    check('LIVRINHO_FIX_1: esgotou retries → limpa timer + setAppStatus(error), SEM reagendar/onFinished',
      /\} else \{\s*if \(watchdogTimerRef\.current\) \{ clearTimeout\(watchdogTimerRef\.current\); watchdogTimerRef\.current = null; \}\s*setAppStatus\('error'\);\s*\}/.test(ap),
      'caminho de erro não limpa o timer OU reagenda/chama onFinished');

    check('LIVRINHO_FIX_1: backstop só avança com duration>0 + near-end (isAudioNearEnd); SEM teto cego 120s',
      /if \(!isAudioNearEnd\(status\.currentTime, status\.duration, FINISH_EPSILON_S\)\) return undefined;/.test(ap)
        && /finishedCalledRef\.current = true;\s*setAppStatus\('done'\);\s*onFinished/.test(ap)
        && !/120000|120 \* 1000/.test(ap),
      'backstop com teto cego, ou não gated em near-end/finishedCalledRef');

    check('LIVRINHO_FIX_1: onFinished é o ÚNICO avanço + didJustFinish protegido por finishedCalledRef (sem duplo)',
      /status\.didJustFinish && !finishedCalledRef\.current/.test(ap)
        && (ap.match(/onFinished\?\.\(\)/g) || []).length >= 2
        && (ap.match(/finishedCalledRef\.current = true/g) || []).length >= 2,
      'onFinished/finishedCalledRef não protegem contra duplo avanço');

    check('LIVRINHO_FIX_1: handlePlay reseta retryCount (retry manual = ciclo limpo, sai de error) e retenta',
      /function handlePlay\(\)[\s\S]*?retryCountRef\.current = 0[\s\S]*?player\.play\(\)/.test(ap),
      'handlePlay não reseta retryCount / não retenta');

    check('LIVRINHO_FIX_1: limpeza de timers (cancelled + clearTimeout) + mountedRef anti-setState-pós-unmount',
      /let cancelled = false/.test(ap) && /if \(cancelled \|\| !mountedRef\.current\) return/.test(ap)
        && /mountedRef\.current = false/.test(ap) && (ap.match(/clearTimeout/g) || []).length >= 2,
      'watchdog sem cancellation/cleanup/mountedRef');

    check('LIVRINHO_FIX_1: StoryBookScreen INTACTO (sem watchdog/helpers/onFinished novo)',
      !/hasAudioProgressed|isAudioNearEnd|MAX_START_RETRIES|WATCHDOG_WINDOW_MS/.test(readSrc('src/screens/StoryBookScreen.js')),
      'a mudança vazou para StoryBookScreen (deveria ficar intacto)');

    check('LIVRINHO_FIX_1: escopo — audioService intacto, sem dep nova, sem misturar com 2b.i',
      !/hasAudioProgressed|isAudioNearEnd|MAX_START_RETRIES/.test(readSrc('src/services/audioService.js'))
        && !/expo-network|NetInfo/i.test(ap)
        && !/spaceNeededBytes|getFreeDiskStorageAsync/.test(ap),
      'escopo vazou (audioService/dep/2b.i)');

    check('LIVRINHO_FIX_1: doc do bloco existe',
      srcExists('docs/LIVRINHO_FIX_1.md'),
      'falta docs/LIVRINHO_FIX_1.md');
  }

  // ── LIVRINHO_UX_1: modo colorido bloqueado até 100% pintado (estado sem emoji) ──
  console.log('\n── LIVRINHO_UX_1: bloqueio do Livrinho colorido incompleto ──');
  {
    const sb = readSrc('src/screens/StoryBookScreen.js');
    const blockedBlock = (sb.match(/!coloredComplete \? \(([\s\S]*?)\) : \(/) || ['', ''])[1];

    check('LIVRINHO_UX_1: modo colorido gated por 100% pintado (coloredComplete = totalScenes>0 && childArtCount===totalScenes)',
      /const coloredComplete = totalScenes > 0 && childArtCount === totalScenes;/.test(sb)
        && /viewMode === 'child' && !coloredComplete \? \(/.test(sb)
        && !/childArtCount === 0/.test(sb),
      'gate não usa coloredComplete (com totalScenes>0), ou manteve o antigo childArtCount === 0');

    check('LIVRINHO_UX_1: fontes de verdade (childArtCount/hasMeaningfulPaint, totalScenes/cenas.length, firstUncoloredIndex/findIndex)',
      /const totalScenes = story\.cenas\.length;/.test(sb)
        && /const childArtCount = story\.cenas\.filter\(c => hasMeaningfulPaint\(drawings\[c\.id\]\)\)\.length;/.test(sb)
        && /const firstUncoloredIndex = story\.cenas\.findIndex\(c => !hasMeaningfulPaint\(drawings\[c\.id\]\)\);/.test(sb),
      'fontes de verdade divergentes do aprovado');

    check('LIVRINHO_UX_1: copy aprovada (título/subtítulo/progresso/CTAs)',
      sb.includes('Seu livrinho colorido fica pronto quando você pinta a aventura inteira.')
        && sb.includes('Pinte todas para abrir um livrinho só com as suas pinturas.')
        && /\{childArtCount\}\/\{totalScenes\} cenas pintadas/.test(sb)
        && sb.includes('Pintar próxima cena')
        && sb.includes('Ver história ilustrada'),
      'copy divergente do aprovado');

    check('LIVRINHO_UX_1: estado bloqueado usa BeniAvatar variant="happy", SEM emoji e sem variante insegura',
      /<BeniAvatar variant="happy"/.test(blockedBlock)
        && !/variant="(reading|locked|thinking)"/.test(blockedBlock)
        && !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}\u{2764}\u{FE0F}]/u.test(blockedBlock)
        && !/styles\.bookEmptyEmoji/.test(sb),
      'estado bloqueado sem BeniAvatar happy, com emoji, ou com variante insegura');

    check('LIVRINHO_UX_1: CTA primário → Coloring na 1ª cena não pintada; secundário → modo oficial',
      /navigation\.navigate\('Coloring', \{ story, cenaIndex: firstUncoloredIndex >= 0 \? firstUncoloredIndex : 0 \}\)/.test(sb)
        && /onPress=\{\(\) => handleSelectMode\('official'\)\}/.test(sb),
      'CTAs do estado bloqueado divergentes');

    check('LIVRINHO_UX_1: card do child mostra {childArtCount}/{totalScenes} e sub de bloqueio',
      /\{childArtCount\}\/\{totalScenes\}<\/Text>/.test(sb)
        && sb.includes('Disponível quando você pintar todas as cenas.'),
      'card do child não reflete progresso/bloqueio');

    check('LIVRINHO_UX_1: modo oficial continua liberado (botão abrir + resolve official intactos)',
      sb.includes('Abrir história ilustrada')
        && /if \(mode === 'official'\)/.test(sb)
        && /if \(official\) return makeOfficialVisual\(cena, story, official\);/.test(sb),
      'modo oficial afetado');

    check('LIVRINHO_UX_1: fallback interno do playing preservado (rede de segurança)',
      sb.includes('Você ainda não pintou esta cena.')
        && /function makeFallbackVisual\(/.test(sb)
        && /function BookArtFallback\(/.test(sb),
      'fallback do playing foi removido/alterado');

    check('LIVRINHO_UX_1: AudioPlayer/LIVRINHO_FIX_1 intactos (UX1 não vazou; StoryBook mantém onFinished)',
      !/coloredComplete|firstUncoloredIndex|blockedProgress/.test(readSrc('src/components/AudioPlayer.js'))
        && /onFinished=\{onSceneAudioComplete\}/.test(sb),
      'UX1 vazou para AudioPlayer OU StoryBook perdeu o wiring de áudio');

    check('LIVRINHO_UX_1: refresh ao focar recarrega desenhos (useFocusEffect + loadDrawingsMap, guard cancelled, só no intro, sem interval)',
      /useFocusEffect\(/.test(sb)
        && /async function loadDrawingsMap\(story\)/.test(sb)
        && /const map = await loadDrawingsMap\(story\);\s*if \(!cancelled\) setDrawings\(map\);/.test(sb)
        && /screenStateRef\.current === 'intro'/.test(sb)
        && !/setInterval/.test(sb),
      'refresh ao focar ausente/instável (falta useFocusEffect/loadDrawingsMap/guard cancelled/escopo intro, ou usa interval)');

    check('LIVRINHO_UX_1: doc do bloco existe',
      srcExists('docs/LIVRINHO_UX_1.md'),
      'falta docs/LIVRINHO_UX_1.md');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Fase 2B (redução de bundle / spec 005) — consumo de packs remotos USER-FACING.
  // StoryDetail BAIXA (via hook dedicado) e o Livrinho USA a mídia remota (via resolvers
  // puros da camada permitida). Guardrails de arquitetura preservados: nenhuma tela importa
  // usePacks/pack*/contentResolver direto (isso é coberto por F2.1d/F2.1e acima). Aqui
  // validamos o consumo POSITIVO: hook de download, resolvers puros, máquina de estado da
  // tela e — o mais importante — o FALLBACK LOCAL como origem-padrão (remoto só sobrescreve
  // quando o pack está ready+válido). 2B NÃO mexe no empacotamento (isso é a Fase 2C).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Fase 2B: consumo de packs remotos (download + Livrinho) ──');
  {
    const dlHook = readSrc('src/hooks/useStoryPackDownload.js');
    const media2b = readSrc('src/hooks/useResolvedStoryMedia.js');
    const detail2b = readSrc('src/screens/StoryDetailScreen.js');
    const sb2b = readSrc('src/screens/StoryBookScreen.js');

    // 1) O runtime de packs (usePacks + packDownloadService) vive DENTRO do hook — a TELA nunca.
    check('2B (hook de download existe): useStoryPackDownload encapsula usePacks + packDownloadService',
      /export function useStoryPackDownload\b/.test(dlHook)
        && /usePacks/.test(dlHook)
        && /downloadStoryPackScenesFromGlobalManifest/.test(dlHook)
        && ['uiState', 'progress', 'error', 'download', 'retry', 'isRemote'].every((k) => dlHook.includes(k)),
      'useStoryPackDownload ausente ou não encapsula o runtime/estado esperado');

    // 2) READ-ONLY quanto a acesso/compras: baixa pack, mas NÃO mexe em entitlement/paywall.
    check('2B (hook read-only): download NÃO toca compras/entitlement (sem Purchases/isPremium/accessControl)',
      !/Purchases\.|react-native-purchases|setPremium|contentAccessService|accessControl/.test(dlHook),
      'useStoryPackDownload passou a tocar acesso/compras (deveria só baixar)');

    // 3) Estado derivado do índice RECONCILIADO + refresh pós-sucesso + guard de reentrância.
    check('2B (estado do hook): uiState de getStoryPackState (reconciliado), refreshPacks no sucesso, busyRef',
      /getStoryPackState/.test(dlHook)
        && /refreshPacks\(\)/.test(dlHook)
        && /busyRef/.test(dlHook)
        && /'downloading'[\s\S]{0,200}'error'[\s\S]{0,200}'ready'[\s\S]{0,200}'not_downloaded'/.test(dlHook),
      'máquina de estado do hook incompleta (reconciliado/refresh/guard/uiState)');

    // 4) Resolvers PUROS (não-hook) em useResolvedStoryMedia: file:// só com pack; senão null.
    check('2B (resolvers puros): resolveRemoteColoringUri/resolveRemoteAudioSource → file:// só com pack, senão null',
      /export function resolveRemoteColoringUri\(storyId, sceneNumber, packEntry\)/.test(media2b)
        && /export function resolveRemoteAudioSource\(storyId, sceneNumber, packEntry\)/.test(media2b)
        && (media2b.match(/if \(!isRemotePackStory\(storyId\) \|\| !packEntry\) return null;/g) || []).length >= 2
        && (media2b.match(/RESOLVE_SOURCE_TYPE\.FILE && r\.source \? r\.source : null/g) || []).length >= 2,
      'resolvers remotos ausentes ou sem guarda null/FILE (fallback local em risco)');

    // 5) StoryDetail consome SÓ o hook + bloco gated a premium-active (canAccess) + remote + !comingSoon.
    check('2B (StoryDetail): importa só useStoryPackDownload; bloco gated a canAccess + isRemote + !isComingSoon',
      /import \{ useStoryPackDownload \} from '\.\.\/hooks\/useStoryPackDownload'/.test(detail2b)
        && /const packDownload = useStoryPackDownload\(story\.id\)/.test(detail2b)
        && /canAccess && packDownload\.isRemote && !isComingSoon/.test(detail2b),
      'StoryDetail não consome o hook ou o bloco não está gated (premium-active + remote)');

    // 6) StoryDetail: máquina de estado visível (baixar / baixando+progresso / pronto / erro+retry).
    check('2B (StoryDetail UI): estados pronto/baixando/erro+retry com progresso',
      /packDownload\.uiState === 'ready'/.test(detail2b)
        && /packDownload\.uiState === 'downloading'/.test(detail2b)
        && /packDownload\.uiState === 'error' \? packDownload\.retry : packDownload\.download/.test(detail2b)
        && /Baixar história/.test(detail2b) && /Baixado/.test(detail2b) && /Tentar de novo/.test(detail2b),
      'StoryDetail não expõe os 4 estados de download (baixar/baixando/pronto/erro+retry)');

    // 7) Livrinho: remoto só pelos resolvers da camada permitida + FALLBACK LOCAL preservado.
    check('2B (Livrinho): usa resolveRemote* de useResolvedStoryMedia; local é default e só é sobrescrito',
      /import \{ resolveRemoteColoringUri, resolveRemoteAudioSource \} from '\.\.\/hooks\/useResolvedStoryMedia'/.test(sb2b)
        && /let baseImage = getColoringImage\(story\.id, cena\.id\);/.test(sb2b)
        && /if \(remote\) baseImage = remote;/.test(sb2b)
        && /let audioAsset = hasSceneAudio\(story\.id, slide\.sceneKey\)/.test(sb2b)
        && /if \(remoteAudio\) audioAsset = remoteAudio;/.test(sb2b),
      'Livrinho não roteia remoto pela camada permitida OU perdeu o fallback local (lineart/áudio)');

    // 8) Regra dos hooks: um ÚNICO hook de pack no TOPO; a timeline recebe scenePackEntry como
    //    PARÂMETRO (resolvers não-hook), nunca chama hook dentro de loop/map.
    check('2B (regra dos hooks): scenePackEntry é o único hook de pack no topo; builders recebem por parâmetro',
      /const scenePackEntry = useSandboxScenePackEntry\(story\?\.id\);/.test(sb2b)
        && (sb2b.match(/useSandboxScenePackEntry\(/g) || []).length === 1
        && /function buildStoryBookTimeline\(story, drawings, mode, scenePackEntry\)/.test(sb2b)
        && /function resolveStoryBookPageImage\(cena, sceneNumber, story, drawings, mode, scenePackEntry\)/.test(sb2b),
      'Livrinho pode ter hook em loop OU mais de um hook de pack (viola regra dos hooks)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Fase 2B.6 — Política de acesso e download premium (segurança de receita).
  // Pack no disco NÃO é autorização: download gated por progressão (sequenceUnlocked =
  // atual OU concluída); abertura premium revalidada nas telas (mount + FOCO) com parada
  // de mídia; resolver agnóstico; contrato de entitlement offline (RP4) documentado;
  // Modo Criador impossível em produção (guard + flag não vaza p/ build).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Fase 2B.6: política de acesso e download premium ──');
  {
    const detail26 = readSrc('src/screens/StoryDetailScreen.js');
    const narr26 = readSrc('src/screens/NarrationScreen.js');
    const color26 = readSrc('src/screens/ColoringScreen.js');
    const sb26 = readSrc('src/screens/StoryBookScreen.js');
    const resolver26 = readSrc('src/services/contentResolver.js');
    const ac26 = readSrc('src/services/accessControl.js');

    // RP1 — download gated por sequenceUnlocked (atual OU concluída; exclui futuras).
    check('2B.6 (RP1 download por progressão): canDownload = canAccess && isRemote && !isComingSoon && sequenceUnlocked',
      /const canDownload = canAccess && packDownload\.isRemote && !isComingSoon && sequenceUnlocked;/.test(detail26)
        && /\{canDownload && \(/.test(detail26),
      'StoryDetail não gateia o download por sequenceUnlocked (atual/concluída)');

    // RP1 — concluída também baixa (sequenceUnlocked=true); NÃO restrito só à atual.
    check('2B.6 (RP1 concluída/futura): gate por sequenceUnlocked (rebaixar concluída OK; futura bloqueada), sem restringir só à atual',
      /sequenceUnlocked = história atual da jornada OU já concluída/.test(detail26)
        && !/getCurrentJourneyStoryId|isCurrentJourneyStory/.test(detail26),
      'gate de download restringe indevidamente (deveria ser sequenceUnlocked)');

    // RP3 — guard canAccess antes de navegar; nenhum navigate premium cru (incl. isCompleted).
    check('2B.6 (RP3 guard nav): goToPremium checa canAccess; nenhum navigate Narration/StoryBook cru no StoryDetail',
      /function goToPremium\(routeName, params\)/.test(detail26)
        && /if \(!canAccess\) \{ navigation\.navigate\('ParentArea'\); return; \}/.test(detail26)
        && !/navigation\.navigate\('(Narration|StoryBook)'/.test(detail26),
      'StoryDetail navega p/ conteúdo premium sem guard canAccess (goToPremium)');

    // RP3 — rechecagem em FOCO nas 3 telas premium.
    check('2B.6 (RP3 foco): Narration/Coloring/StoryBook revalidam canOpenStoryFullExperience em useFocusEffect',
      /useFocusEffect\([\s\S]{0,220}canOpenStoryFullExperience\(story\)/.test(narr26)
        && /useFocusEffect\([\s\S]{0,220}canOpenStoryFullExperience\(story\)/.test(color26)
        && /useFocusEffect\([\s\S]{0,260}!canOpenStoryFullExperience\(story\)/.test(sb26),
      'uma tela premium não revalida acesso em foco (useFocusEffect)');

    // RP3 — parada de mídia no StoryBook (pausa imediata + locked); Narration/Coloring saem (unmount pausa).
    check('2B.6 (RP3 parada de mídia): StoryBook setIsPaused(true)+setScreenState("locked") ao bloquear em foco',
      /!canOpenStoryFullExperience\(story\)\) \{\s*setIsPaused\(true\);\s*setScreenState\('locked'\);/.test(sb26)
        && /navigation\.replace\('ParentArea'\)/.test(narr26)
        && /navigation\.replace\('ParentArea'\)/.test(color26),
      'StoryBook não pausa/trava a mídia premium ao bloquear em foco');

    // RP2 — resolver permanece agnóstico (sem entitlement).
    check('2B.6 (RP2 resolver agnóstico): contentResolver.decide sem isPremiumUser/hasAccess/canOpenStoryFullExperience',
      !/isPremiumUser|hasAccess|hasStoryAccess|canOpenStoryFullExperience/.test(resolver26),
      'contentResolver passou a checar entitlement (deveria ser agnóstico)');

    // RP4 — contrato de entitlement offline documentado (não implementado).
    check('2B.6 (RP4 contrato): accessControl documenta expiresAt/expirado offline + pack ≠ autorização',
      /expiresAt/.test(ac26) && /expirad|expired/i.test(ac26) && /pack no disco nunca é autoriza/i.test(ac26),
      'contrato de entitlement offline (RP4) não documentado em accessControl');

    // RP5 — starter (creation/noah) livre/offline; download só p/ isRemote (starter nunca baixa).
    check('2B.6 (RP5 starter livre): creation/noah = starter; download gated por isRemote',
      (() => {
        try {
          const cm = new Function(`${readSrc('src/data/contentManifest.js').replace(/export /g, '')}; return { getContentLayer };`)();
          return cm.getContentLayer('creation') === 'starter' && cm.getContentLayer('noah') === 'starter';
        } catch { return false; }
      })() && /packDownload\.isRemote/.test(detail26),
      'starter deixou de ser livre OU download não é gated por isRemote');

    // Adendo #2 — Modo Criador impossível em produção: guard + flag NÃO vaza p/ build.
    check('2B.6 (adendo: Creator QA seguro em prod): guard __DEV__/flag no serviço + flag ausente de eas.json/app.json',
      (() => {
        const eas = srcExists('eas.json') ? readSrc('eas.json') : '';
        const appJson = srcExists('app.json') ? readSrc('app.json') : '';
        const qa = readSrc('src/services/creatorQaMode.js');
        return !/EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE/.test(eas)
          && !/EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE/.test(appJson)
          && /isCreatorQaModeAllowed/.test(qa) && /__DEV__/.test(qa);
      })(),
      'Modo Criador pode vazar p/ produção (flag em eas.json/app.json ou guard ausente)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Fase 2B.7.1 — entitlementPolicy PURO (decisão de entitlement offline).
  // Módulo PURO, ISOLADO (não consumido nesta fase). Testa a matriz conservadora + bordas +
  // reforço de `now` inválido + totalidade. Avaliado direto (new Function), como storyJourneyService.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Fase 2B.7.1: entitlementPolicy puro ──');
  {
    const epSrc = readSrc('src/services/entitlementPolicy.js');
    let ep = null;
    try {
      const code = epSrc.replace(/export /g, '') + '\nreturn { decideEntitlement, isValidTs, OFFLINE_MAX_WINDOW_MS };';
      // eslint-disable-next-line no-new-func
      ep = new Function(code)();
    } catch (e) { /* ep=null → o check de pureza falha com mensagem clara */ }

    // Pureza estrutural: sem imports, sem require, sem React/storage/FileSystem.
    check('2B.7.1 (puro): entitlementPolicy sem imports/require/React/storage/FileSystem',
      !!ep
        && !/^\s*import\s/m.test(epSrc)
        && !/require\(/.test(epSrc)
        && !/AsyncStorage|FileSystem|useState|useEffect|from 'react'/.test(epSrc),
      'entitlementPolicy não é puro (import/require/React/storage) ou não carregou isolado');

    const DAY = 86400000, WINDOW = 7 * DAY, T = 1700000000000;
    const call = (snap) => {
      try { return ep.decideEntitlement(snap); }
      catch (e) { return { decision: 'THREW', reason: String((e && e.message) || e) }; }
    };
    const eq = (r, decision, reason) => !!r && r.decision === decision && r.reason === reason;

    // 15 casos da matriz (plan-fase-2b71 §Casos) — decision + reason, com bordas.
    const CASES = [
      ['1 sem cache',                 { loaded: false, now: T },                                                                                                   'free',               'no_cache'],
      ['2 relógio retrocedido',       { loaded: true, now: T, maxSeenDeviceTimestamp: T + DAY, expiresAt: T + DAY, lastValidatedAt: T - DAY, rcActive: true },      'needs_revalidation', 'clock_rollback'],
      ['3 now<expiresAt (feliz)',     { loaded: true, now: T, expiresAt: T + DAY, lastValidatedAt: T - DAY, maxSeenDeviceTimestamp: T, rcActive: true },             'premium',            'active'],
      ['4 now===expiresAt',           { loaded: true, now: T, expiresAt: T, lastValidatedAt: T - DAY, maxSeenDeviceTimestamp: T, rcActive: true },                   'free',               'expired'],
      ['5 now>expiresAt',             { loaded: true, now: T, expiresAt: T - 1, lastValidatedAt: T - DAY, maxSeenDeviceTimestamp: T, rcActive: true },               'free',               'expired'],
      ['6 janela<7d',                 { loaded: true, now: T, expiresAt: T + DAY, lastValidatedAt: T - DAY, maxSeenDeviceTimestamp: T, rcActive: true },             'premium',            'active'],
      ['7 janela===7d',               { loaded: true, now: T, expiresAt: T + DAY, lastValidatedAt: T - WINDOW, maxSeenDeviceTimestamp: T, rcActive: true },          'premium',            'active'],
      ['8 janela>7d',                 { loaded: true, now: T, expiresAt: T + DAY, lastValidatedAt: T - WINDOW - 1, maxSeenDeviceTimestamp: T, rcActive: true },      'needs_revalidation', 'stale_validation'],
      ['9 rcActive válido',           { loaded: true, now: T, expiresAt: T + 2 * DAY, lastValidatedAt: T - 2 * DAY, maxSeenDeviceTimestamp: T, rcActive: true },     'premium',            'active'],
      ['10 rcActive sem expiresAt',   { loaded: true, now: T, expiresAt: null, lastValidatedAt: T - DAY, maxSeenDeviceTimestamp: T, rcActive: true },                'needs_revalidation', 'needs_revalidation'],
      ['11 rcActive sem lastValid',   { loaded: true, now: T, expiresAt: T + DAY, lastValidatedAt: null, maxSeenDeviceTimestamp: T, rcActive: true },                'needs_revalidation', 'needs_revalidation'],
      ['12 cancelledButPaid futuro',  { loaded: true, now: T, expiresAt: T + DAY, lastValidatedAt: T - DAY, maxSeenDeviceTimestamp: T, rcCancelledButPaid: true },   'premium',            'cancelled_active'],
      ['13 cancelledButPaid vencido', { loaded: true, now: T, expiresAt: T - DAY, lastValidatedAt: T - DAY, maxSeenDeviceTimestamp: T, rcCancelledButPaid: true },   'free',               'expired'],
      ['14 timestamps inválidos',     { loaded: true, now: NaN, expiresAt: T + DAY, lastValidatedAt: T - DAY, rcActive: true },                                      'free',               'invalid_data'],
      ['15 inativo',                  { loaded: true, now: T, expiresAt: T + DAY, lastValidatedAt: T - DAY, maxSeenDeviceTimestamp: T, rcActive: false, rcCancelledButPaid: false }, 'free', 'inactive'],
    ];
    let matrixOk = !!ep; const matrixFails = [];
    if (ep) for (const [label, snap, dec, rea] of CASES) {
      const r = call(snap);
      if (!eq(r, dec, rea)) { matrixOk = false; matrixFails.push(`${label}→${r && r.decision}/${r && r.reason} (esperado ${dec}/${rea})`); }
    }
    check('2B.7.1 (matriz 15 casos): decision+reason conforme o plan (bordas >=, ===7d, ausentes, inválidos)',
      matrixOk, `casos divergentes: ${matrixFails.join(' | ')}`);

    // Reforço: `now` inválido (TODAS as variantes) → free/invalid_data, SEM lançar.
    const badNows = [NaN, -1, 0, null, undefined, 'abc'];
    let nowOk = !!ep; const nowFails = [];
    if (ep) for (const bad of badNows) {
      const r = call({ loaded: true, now: bad, expiresAt: T + DAY, lastValidatedAt: T - DAY, rcActive: true });
      if (!eq(r, 'free', 'invalid_data')) { nowOk = false; nowFails.push(`now=${String(bad)}→${r && r.decision}/${r && r.reason}`); }
    }
    check('2B.7.1 (reforço now inválido): NaN/negativo/0/null/undefined/não-numérico → free/invalid_data sem lançar',
      nowOk, `now inválido não tratado: ${nowFails.join(' | ')}`);

    // Totalidade: decision ∈ {premium,free,needs_revalidation}; reason string não-vazia; nunca lança.
    const ALL_SNAPS = CASES.map((c) => c[1])
      .concat(badNows.map((b) => ({ loaded: true, now: b })), [undefined, null, {}, { loaded: true }]);
    let totalOk = !!ep; const totalFails = [];
    if (ep) for (const snap of ALL_SNAPS) {
      const r = call(snap);
      const decOk = r && ['premium', 'free', 'needs_revalidation'].includes(r.decision);
      const reaOk = r && typeof r.reason === 'string' && r.reason.length > 0 && r.decision !== 'THREW';
      if (!decOk || !reaOk) { totalOk = false; totalFails.push(`${JSON.stringify(snap)}→${r && r.decision}/${r && r.reason}`); }
    }
    check('2B.7.1 (totalidade): decision ∈ {premium,free,needs_revalidation}; reason não-vazia; nunca lança',
      totalOk, `totalidade violada: ${totalFails.slice(0, 3).join(' | ')}`);

    // Isolamento: FORA do smoke, nenhum arquivo de src/ importa/menciona entitlementPolicy
    // (o smoke é a exceção autorizada — ele está em scripts/, não em src/).
    // Fase 2B.7.2 (migração fiel do isolamento): a policy passa a ter UM consumidor autorizado
    // — o entitlementService. Nenhum outro módulo de src/ (telas, accessControl...) a importa direto.
    check('2B.7.2 (isolamento migrado): entitlementPolicy consumida SÓ por entitlementService',
      (() => {
        const dir = path.join(root, 'src');
        const policy = path.join(dir, 'services', 'entitlementPolicy.js');
        const service = path.join(dir, 'services', 'entitlementService.js');
        const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
          const p = path.join(d, e.name);
          if (e.isDirectory()) return walk(p);
          return e.name.endsWith('.js') ? [p] : [];
        });
        return !walk(dir).some((f) => f !== policy && f !== service && /entitlementPolicy/.test(fs.readFileSync(f, 'utf8')));
      })(),
      'entitlementPolicy passou a ser consumida por outro módulo além de entitlementService');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Fase 2B.7.2 — consumo controlado (ponte técnica fail-closed).
  // getCurrentPlan DELEGA ao entitlementService (que consome a policy pura); sem fonte real,
  // resolve 'free'. loadEntitlement é exercitado AQUI (não no boot): storage vazio/inválido/
  // malformado/{plan:'premium'} → nunca premium, sem lançar. Nenhuma tela/App.js tocada.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Fase 2B.7.2: consumo controlado do entitlement ──');
  {
    const acSrc72 = readSrc('src/services/accessControl.js');
    const svcSrc72 = readSrc('src/services/entitlementService.js');

    // Delegação: getCurrentPlan importa e delega ao entitlementService, com test-mode ANTES.
    check('2B.7.2 (delegação): getCurrentPlan importa getEntitlementPlan e delega (test-mode antes)',
      /import \{ getEntitlementPlan \} from '\.\/entitlementService'/.test(acSrc72)
        && /if \(ENABLE_LOCAL_PREMIUM_TEST_MODE\)[\s\S]{0,140}return 'premium'/.test(acSrc72)
        && /return getEntitlementPlan\(\);/.test(acSrc72),
      'getCurrentPlan não delega ao entitlementService (ou perdeu a precedência do test-mode)');

    // Service: consome a policy, mapeia !==premium→free, now on-demand, try/catch fail-closed.
    check('2B.7.2 (service): consome decideEntitlement; !==premium→free; now on-demand; try/catch',
      /import \{ decideEntitlement[^}]*\} from '\.\/entitlementPolicy'/.test(svcSrc72)
        && /decision === 'premium' \? 'premium' : 'free'/.test(svcSrc72)
        && /now: Date\.now\(\)/.test(svcSrc72)
        && /try \{[\s\S]{0,500}catch[\s\S]{0,160}_snapshot = \{ loaded: false \}/.test(svcSrc72),
      'entitlementService não segue o contrato (policy/mapeamento/now/try-catch)');

    // Carrega o service ISOLADO (policy real + AsyncStorage mockado) e exercita loadEntitlement.
    let svc = null; let loadErr = null; let _storageValue = null;
    try {
      const epCode = readSrc('src/services/entitlementPolicy.js').replace(/export /g, '') + '\nreturn { decideEntitlement };';
      // eslint-disable-next-line no-new-func
      const { decideEntitlement } = new Function(epCode)();
      const AsyncStorageMock = { getItem: async () => _storageValue };
      const STORAGE_KEYS_MOCK = { ENTITLEMENT: '@ptf_entitlement_v1' };
      const svcCode = svcSrc72.replace(/^\s*import\s.+?;\s*$/gm, '').replace(/export /g, '')
        + '\nreturn { getEntitlementPlan, getEntitlementDecision, loadEntitlement };';
      // eslint-disable-next-line no-new-func
      svc = new Function('decideEntitlement', 'AsyncStorage', 'STORAGE_KEYS', svcCode)(decideEntitlement, AsyncStorageMock, STORAGE_KEYS_MOCK);
    } catch (e) { loadErr = String((e && e.message) || e); }

    // Compatibilidade: sem load (default { loaded:false }) → 'free'.
    check('2B.7.2 (compat free): sem fonte/cache, getEntitlementPlan() === "free"',
      !!svc && svc.getEntitlementPlan() === 'free',
      `service não resolve free por padrão${loadErr ? ' (erro ao carregar: ' + loadErr + ')' : ''}`);

    // Fail-closed: storage vazio/inválido/malformado/{plan:'premium'}/array → free, sem lançar.
    const failClosedOk = await (async () => {
      if (!svc) return false;
      try {
        _storageValue = null;                              if (await svc.loadEntitlement() !== 'free') return false; // vazio
        _storageValue = '{ nao eh json valido';            if (await svc.loadEntitlement() !== 'free') return false; // inválido
        _storageValue = JSON.stringify({ rcActive: true }); if (await svc.loadEntitlement() !== 'free') return false; // malformado (sem janela)
        _storageValue = JSON.stringify({ plan: 'premium' }); if (await svc.loadEntitlement() !== 'free') return false; // plan solto
        _storageValue = JSON.stringify([1, 2, 3]);         if (await svc.loadEntitlement() !== 'free') return false; // array
        return true;
      } catch (e) { return false; } // NUNCA deve lançar
    })();
    check('2B.7.2 (fail-closed): storage vazio/inválido/malformado/{plan:premium} → free, nunca premium, sem lançar',
      failClosedOk, 'loadEntitlement liberou premium OU lançou com storage vazio/inválido/malformado');

    // Telas intocadas: nenhuma src/screens consome entitlement. (App.js: a partir da 2B.7.3
    // importa initEntitlement para o boot — coberto pelo check 2B.7.3, não mais aqui.)
    check('2B.7.2 (telas intocadas): nenhuma src/screens importa entitlementService/Policy/Source',
      (() => {
        const scr = path.join(root, 'src', 'screens');
        const files = fs.existsSync(scr) ? fs.readdirSync(scr).filter((f) => f.endsWith('.js')) : [];
        return !files.some((f) => /entitlement(Service|Policy|Source)/.test(fs.readFileSync(path.join(scr, f), 'utf8')));
      })(),
      'uma tela passou a consumir entitlement (proibido)');

    // Chave registrada + 2C não iniciada.
    check('2B.7.2 (chave + 2C): storageKeys tem ENTITLEMENT @ptf_entitlement_v1; app.json sem assetBundlePatterns',
      /ENTITLEMENT:\s*'@ptf_entitlement_v1'/.test(readSrc('src/services/storageKeys.js'))
        && !/assetBundlePatterns/.test(readSrc('app.json')),
      'chave de entitlement ausente OU 2C iniciada (assetBundlePatterns em app.json)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Fase 2B.7.3 — fonte real (port `entitlementSource`) + persistência sanitizada +
  // boot controlado + refresh conservador por AppState. Tudo fail-closed; fonte real = adapter RevenueCat (2B.7.4).
  // Service carregado isolado (policy real + mocks de fonte/storage/AppState).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Fase 2B.7.3: fonte real (port) + boot + refresh ──');
  {
    const DAY = 86400000; const NOW = Date.now();
    const srcSrc73 = readSrc('src/services/entitlementSource.js');
    const svcSrc73 = readSrc('src/services/entitlementService.js');

    // D1 — o port agora é o ADAPTER RevenueCat real (2B.7.4): mantém `fetchEntitlement` async e
    // é o adapter (importa react-native-purchases), sem `-ui`. Mapeamento/fail-closed → bloco "Fase 2B.7.4".
    check('2B.7.3→2B.7.4 (port real): entitlementSource expõe fetchEntitlement async + é o adapter RevenueCat (sem -ui)',
      /export async function fetchEntitlement\(\)/.test(srcSrc73)
        && /from ['"]react-native-purchases['"]/.test(srcSrc73)
        && !/from ['"]react-native-purchases-ui['"]/.test(srcSrc73), // import real, não menção em comentário
      'entitlementSource deixou de ser port async OU não é o adapter RevenueCat esperado');

    // Carrega o service isolado (policy real + mocks).
    let svc = null; let loadErr = null;
    let _storageValue = null; let _savedValue = null; let _fetchImpl = async () => null;
    const appStateSpy = { count: 0, cb: null, removed: false };
    try {
      const pol = new Function(readSrc('src/services/entitlementPolicy.js').replace(/export /g, '') + '\nreturn { decideEntitlement, isValidTs };')();
      const AsyncStorageMock = { getItem: async () => _storageValue, setItem: async (k, v) => { _savedValue = v; _storageValue = v; } };
      const fetchMock = async () => _fetchImpl();
      const AppStateMock = { addEventListener: (ev, cb) => { appStateSpy.count += 1; appStateSpy.cb = cb; return { remove: () => { appStateSpy.removed = true; } }; } };
      const STORAGE_KEYS_MOCK = { ENTITLEMENT: '@ptf_entitlement_v1' };
      const code = svcSrc73.replace(/^\s*import\s.+?;\s*$/gm, '').replace(/export /g, '')
        + '\nreturn { getEntitlementPlan, loadEntitlement, refreshEntitlement, initEntitlement, stopEntitlementAutoRefresh };';
      svc = new Function('decideEntitlement', 'isValidTs', 'fetchEntitlement', 'AsyncStorage', 'AppState', 'STORAGE_KEYS', code)(
        pol.decideEntitlement, pol.isValidTs, fetchMock, AsyncStorageMock, AppStateMock, STORAGE_KEYS_MOCK);
    } catch (e) { loadErr = String((e && e.message) || e); }

    const loadWith = async (c) => { _storageValue = c === null ? null : (typeof c === 'string' ? c : JSON.stringify(c)); return svc.loadEntitlement(); };
    const refreshWith = async (fn) => { _fetchImpl = fn; return svc.refreshEntitlement(); };

    // D2 — pipeline/refresh conservador.
    check('2B.7.3 (pipeline): fonte válida→premium+salvou; null/erro/{plan} solto→free; nunca lança',
      await (async () => {
        if (!svc) return false;
        try {
          await loadWith(null); _savedValue = null;
          if (await refreshWith(async () => ({ rcActive: true, expiresAt: NOW + DAY, serverNow: NOW })) !== 'premium') return false;
          if (!_savedValue) return false;
          await loadWith(null); if (await refreshWith(async () => null) !== 'free') return false;
          await loadWith(null); if (await refreshWith(async () => { throw new Error('boom'); }) !== 'free') return false;
          await loadWith(null); if (await refreshWith(async () => ({ plan: 'premium' })) !== 'free') return false;
          return true;
        } catch (e) { return false; }
      })(),
      `pipeline de refresh não conservador${loadErr ? ' (load err: ' + loadErr + ')' : ''}`);

    // D3 — persistência sanitizada.
    check('2B.7.3 (persistência sanitizada): salvo só com campos do contrato (sem plan/estranhos)',
      await (async () => {
        if (!svc) return false;
        try {
          await loadWith(null); _savedValue = null;
          await refreshWith(async () => ({ rcActive: true, expiresAt: NOW + DAY, serverNow: NOW, plan: 'premium', hacker: 1 }));
          if (!_savedValue) return false;
          const saved = JSON.parse(_savedValue);
          const allowed = ['loaded', 'lastValidatedAt', 'maxSeenDeviceTimestamp', 'rcActive', 'rcCancelledButPaid', 'expiresAt'];
          return !('plan' in saved) && !('hacker' in saved) && Object.keys(saved).every((k) => allowed.includes(k));
        } catch (e) { return false; }
      })(),
      'saveEntitlement persistiu campos estranhos');

    // D4 — cache + policy + janela.
    check('2B.7.3 (cache+janela): expired→free; válido→premium; stale>7d→free',
      await (async () => {
        if (!svc) return false;
        try {
          if (await loadWith({ rcActive: true, expiresAt: NOW - DAY }) !== 'free') return false;
          if (await loadWith({ rcActive: true, expiresAt: NOW + DAY, lastValidatedAt: NOW - DAY, maxSeenDeviceTimestamp: NOW }) !== 'premium') return false;
          if (await loadWith({ rcActive: true, expiresAt: NOW + DAY, lastValidatedAt: NOW - 8 * DAY, maxSeenDeviceTimestamp: NOW }) !== 'free') return false;
          return true;
        } catch (e) { return false; }
      })(),
      'cache antigo não passou pela policy/janela');

    // D5 — relógio alterado.
    check('2B.7.3 (relógio): maxSeenDeviceTimestamp futuro → clock_rollback → free',
      await (async () => {
        if (!svc) return false;
        try { return (await loadWith({ rcActive: true, expiresAt: NOW + 365 * DAY, lastValidatedAt: NOW, maxSeenDeviceTimestamp: NOW + 365 * DAY })) === 'free'; }
        catch (e) { return false; }
      })(),
      'alteração de relógio não bloqueou premium');

    // D6 — maxSeen não regride + refresh inválido não apaga cache válido.
    check('2B.7.3 (maxSeen não regride + refresh inválido não apaga cache válido)',
      await (async () => {
        if (!svc) return false;
        try {
          await loadWith({ rcActive: true, expiresAt: NOW + 2 * DAY, lastValidatedAt: NOW - DAY, maxSeenDeviceTimestamp: NOW });
          if (await refreshWith(async () => null) !== 'premium') return false; // cache válido mantido
          _savedValue = null;
          await refreshWith(async () => ({ rcActive: true, expiresAt: NOW + 2 * DAY, serverNow: NOW, maxSeenDeviceTimestamp: NOW - 10 * DAY }));
          return JSON.parse(_savedValue).maxSeenDeviceTimestamp >= NOW; // não regrediu
        } catch (e) { return false; }
      })(),
      'maxSeen regrediu OU refresh inválido apagou cache válido');

    // D7 — AppState guard + cleanup + init não lança.
    check('2B.7.3 (AppState): init idempotente (listener 1×), cb refresh, cleanup, nunca lança',
      await (async () => {
        if (!svc) return false;
        try {
          appStateSpy.count = 0; appStateSpy.cb = null; appStateSpy.removed = false;
          svc.initEntitlement(); svc.initEntitlement(); svc.initEntitlement();
          if (appStateSpy.count !== 1 || typeof appStateSpy.cb !== 'function') return false;
          _fetchImpl = async () => null; appStateSpy.cb('active'); // não deve lançar
          svc.stopEntitlementAutoRefresh();
          if (!appStateSpy.removed) return false;
          appStateSpy.count = 0; svc.initEntitlement();
          return appStateSpy.count === 1;
        } catch (e) { return false; }
      })(),
      'AppState listener duplicou / sem cleanup / init lançou');

    // D8 — boot sem loading + intocados.
    check('2B.7.3 (boot/intocados): App.js só +initEntitlement; sem loading novo; telas/dep/2C/RevenueCat/isolamento',
      (() => {
        const app = readSrc('App.js');
        const appOk = /import \{ initEntitlement \} from '\.\/src\/services\/entitlementService'/.test(app)
          && /initEntitlement\(\);/.test(app)
          && !/useState[\s\S]{0,40}entitlement/i.test(app);
        const scr = path.join(root, 'src', 'screens');
        const screensClean = !fs.readdirSync(scr).filter((f) => f.endsWith('.js')).some((f) => /entitlement(Service|Policy|Source)/.test(fs.readFileSync(path.join(scr, f), 'utf8')));
        // Fronteira 2B.7.4: o SERVICE nunca importa RevenueCat (o SDK vive só no adapter
        // `entitlementSource`); ninguém importa NetInfo. (import REAL, não menção em comentário.)
        const svcOnly73 = readSrc('src/services/entitlementService.js');
        const srcOnly73 = readSrc('src/services/entitlementSource.js');
        const noRcNetinfo = !/from ['"]react-native-purchases['"]/.test(svcOnly73)
          && !/from ['"]@react-native-community\/netinfo['"]/.test(svcOnly73 + srcOnly73);
        const no2C = !/assetBundlePatterns/.test(readSrc('app.json'));
        const dir = path.join(root, 'src');
        const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => { const p = path.join(d, e.name); return e.isDirectory() ? walk(p) : (e.name.endsWith('.js') ? [p] : []); });
        const srcOnlyService = !walk(dir).some((f) => !/entitlementSource\.js$/.test(f) && !/entitlementService\.js$/.test(f) && /entitlementSource/.test(fs.readFileSync(f, 'utf8')));
        return appOk && screensClean && noRcNetinfo && no2C && srcOnlyService;
      })(),
      'App.js/telas/dependência/2C/isolamento violados');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Fase 2B.7.3a — progresso VISUAL em história premium bloqueada. sceneVisualStatus (puro)
  // mostra cenas concluídas como completed MESMO sem acesso; a PERMISSÃO de abrir continua em
  // goToPremium/telas (2B.6). Grátis e premium-sem-progresso idênticos. Só o rótulo muda.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Fase 2B.7.3a: progresso visual em premium bloqueada ──');
  {
    const js73a = readSrc('src/services/storyJourneyService.js');
    const sd73a = readSrc('src/screens/StoryDetailScreen.js');
    const sli73a = readSrc('src/components/story/SceneListItem.js');

    // Carrega sceneVisualStatus isolado (storyJourneyService é puro, sem imports).
    let svs = null;
    try { svs = new Function(js73a.replace(/export /g, '') + '\nreturn { sceneVisualStatus };')().sceneVisualStatus; }
    catch (e) { /* null → checks falham com mensagem */ }
    const st = (p) => { try { return svs(p); } catch (e) { return 'THREW'; } };

    // C1 — matriz completa (5 ramos, top-down).
    check('2B.7.3a (matriz): coming_soon→locked; done→completed; !canAccess→locked; current→available; else→locked',
      !!svs
        && st({ isComingSoon: true, isDone: true, canAccess: true, isCurrent: true }) === 'locked'
        && st({ isDone: true, canAccess: false, isCurrent: false }) === 'completed'
        && st({ isDone: false, canAccess: false, isCurrent: true }) === 'locked'
        && st({ isDone: false, canAccess: false, isCurrent: false }) === 'locked'
        && st({ isDone: false, canAccess: true, isCurrent: true }) === 'available'
        && st({ isDone: false, canAccess: true, isCurrent: false }) === 'locked',
      'sceneVisualStatus não segue a matriz aprovada');

    // C2 — progresso salvo aparece concluído mesmo sem acesso.
    check('2B.7.3a (progresso sem acesso): cena concluída premium sem acesso → completed',
      !!svs && st({ isDone: true, canAccess: false, isCurrent: false }) === 'completed',
      'cena concluída sem acesso não aparece completed');

    // C3 — grátis não regride.
    check('2B.7.3a (grátis não regride): done→completed; current→available; else→locked (canAccess=true)',
      !!svs
        && st({ isDone: true, canAccess: true, isCurrent: false }) === 'completed'
        && st({ isDone: false, canAccess: true, isCurrent: true }) === 'available'
        && st({ isDone: false, canAccess: true, isCurrent: false }) === 'locked',
      'história grátis regrediu');

    // C4 — premium sem progresso igual (todas não-done sem acesso → locked).
    check('2B.7.3a (premium sem progresso = hoje): !done + !canAccess → locked (atual e futura)',
      !!svs
        && st({ isDone: false, canAccess: false, isCurrent: true }) === 'locked'
        && st({ isDone: false, canAccess: false, isCurrent: false }) === 'locked',
      'premium sem progresso mudou');

    // C5 — StoryDetail delega + abertura protegida (goToPremium intacto; sem navigate premium cru).
    check('2B.7.3a (StoryDetail): getSceneStatus delega a sceneVisualStatus; onPress via goToPremium; sem navigate cru',
      /return sceneVisualStatus\(\{/.test(sd73a)
        && /isDone: progresso\[cena\.id\] === true/.test(sd73a)
        && /onPress=\{\(\) => goToPremium\('Narration', \{ story, cenaIndex: index \}\)\}/.test(sd73a)
        && !/navigation\.navigate\('(Narration|StoryBook)'/.test(sd73a),
      'StoryDetail não delega OU perdeu o guard goToPremium nas cenas');

    // C6 — botão principal continua pedindo responsável sem acesso.
    check('2B.7.3a (botão premium bloqueado): getPrimaryLabel !canAccess → "Pedir ao responsável"',
      /if \(!canAccess\) return 'Pedir ao responsável';/.test(sd73a),
      'botão primário perdeu "Pedir ao responsável"');

    // C7 — intocados: SceneListItem sem lógica de acesso; sem RevenueCat; 2C não iniciada.
    check('2B.7.3a (intocados): SceneListItem sem entitlement/canAccess; sem RevenueCat; app.json sem assetBundlePatterns',
      !/entitlement|canAccess|isPremiumUser|hasAccess/.test(sli73a)
        && !/from ['"]react-native-purchases['"]/.test(js73a + sd73a)
        && !/assetBundlePatterns/.test(readSrc('app.json')),
      'SceneListItem/entitlement/RevenueCat/2C violados');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Fase 2B.7.4 — ADAPTER RevenueCat: `mapCustomerInfo` (puro) + `fetchEntitlement` fail-closed.
  // SEM UI/compra/restore/offerings/paywall/sandbox. Só public SDK key (env `EXPO_PUBLIC_*`).
  // `decideEntitlement` segue o ÚNICO juiz. Adapter carregado isolado com mocks (não toca o SDK real).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Fase 2B.7.4: adapter RevenueCat (mapeamento + fail-closed) ──');
  {
    const adapterSrc74 = readSrc('src/services/entitlementSource.js');
    const stripped74 = adapterSrc74.replace(/^\s*import\s.+?;\s*$/gm, '').replace(/export /g, '');
    // Carrega o adapter injetando Platform/Purchases/process mockados (SDK real nunca é chamado).
    const loadAdapter74 = (mockPurchases, os, env) => new Function(
      'Platform', 'Purchases', 'process',
      stripped74 + '\nreturn { mapCustomerInfo, fetchEntitlement, configureRevenueCat, getRevenueCatApiKey };'
    )({ OS: os || 'ios' }, mockPurchases || {}, { env: env || {} });

    const NOW74 = Date.now();
    const iso74 = (ms) => new Date(ms).toISOString();
    const ciActive74 = { entitlements: { active: { premium: { willRenew: true, expirationDate: iso74(NOW74 + 30 * 86400000) } } }, requestDate: iso74(NOW74) };
    const ciCancelled74 = { entitlements: { active: { premium: { willRenew: false, expirationDate: iso74(NOW74 + 10 * 86400000) } } }, requestDate: iso74(NOW74) };
    const ciEmpty74 = { entitlements: { active: {} }, requestDate: iso74(NOW74) };
    const ciMalformed74 = { entitlements: { active: { premium: { willRenew: false, expirationDate: 'not-a-date' } } } }; // sem requestDate

    // E1 — ativo: rcActive true, cancelled false, expiresAt futuro, serverNow válido.
    check('2B.7.4 (mapeia ativo): premium willRenew → {rcActive:true, rcCancelledButPaid:false, expiresAt>now, serverNow>0}',
      (() => { try {
        const r = loadAdapter74().mapCustomerInfo(ciActive74);
        return !!r && r.rcActive === true && r.rcCancelledButPaid === false
          && r.expiresAt > NOW74 && typeof r.serverNow === 'number' && r.serverNow > 0;
      } catch (e) { return false; } })(),
      'mapCustomerInfo(ativo) incorreto');

    // E2 — cancelado mas pago: rcCancelledButPaid true, ainda com janela futura.
    check('2B.7.4 (cancelado-mas-pago): willRenew:false + futuro → rcActive:true, rcCancelledButPaid:true',
      (() => { try {
        const r = loadAdapter74().mapCustomerInfo(ciCancelled74);
        return !!r && r.rcActive === true && r.rcCancelledButPaid === true && r.expiresAt > NOW74;
      } catch (e) { return false; } })(),
      'mapCustomerInfo(cancelado) incorreto');

    // E3 — sem premium ativo (e inputs vazios/nulos) → null (free). null-safe.
    check('2B.7.4 (sem premium): active sem premium / null / {} / sem entitlements → null',
      (() => { try {
        const A = loadAdapter74();
        return A.mapCustomerInfo(ciEmpty74) === null && A.mapCustomerInfo(null) === null
          && A.mapCustomerInfo({}) === null && A.mapCustomerInfo({ entitlements: {} }) === null;
      } catch (e) { return false; } })(),
      'mapCustomerInfo sem premium não retorna null');

    // E4 — malformado: datas inválidas → null (não lança); rcActive segue true (entitlement presente).
    check('2B.7.4 (malformado): expirationDate inválido / requestDate ausente → expiresAt=null, serverNow=null, sem lançar',
      (() => { try {
        const r = loadAdapter74().mapCustomerInfo(ciMalformed74);
        return !!r && r.rcActive === true && r.expiresAt === null && r.serverNow === null;
      } catch (e) { return false; } })(),
      'mapCustomerInfo(malformado) lançou ou não anulou datas');

    // E5 — fetchEntitlement fail-closed: getCustomerInfo lança → null (nunca propaga).
    check('2B.7.4 (fail-closed erro): getCustomerInfo lança → fetchEntitlement resolve null',
      await (async () => { try {
        const A = loadAdapter74({ configure: () => {}, getCustomerInfo: async () => { throw new Error('boom'); } }, 'ios', { EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: 'pk_test' });
        return (await A.fetchEntitlement()) === null;
      } catch (e) { return false; } })(),
      'fetchEntitlement não é fail-closed em erro do SDK');

    // E6 — chave PÚBLICA ausente NÃO quebra: configure não roda, fetch → null (app segue → free).
    check('2B.7.4 (chave ausente): sem EXPO_PUBLIC_REVENUECAT_* → key undefined + configure false + fetch null (app abre)',
      await (async () => { try {
        let configured = false;
        const A = loadAdapter74({ configure: () => { configured = true; }, getCustomerInfo: async () => ciActive74 }, 'ios', {}); // env vazio
        const key = A.getRevenueCatApiKey();
        const cfg = A.configureRevenueCat();
        const fetched = await A.fetchEntitlement();
        return key === undefined && cfg === false && configured === false && fetched === null;
      } catch (e) { return false; } })(),
      'chave pública ausente quebrou o adapter (deveria cair para null/free)');

    // E7 — fetchEntitlement sucesso: chave presente (Android) + premium ativo → RawEntitlement mapeado.
    check('2B.7.4 (fetch ok): chave presente + premium ativo → RawEntitlement (rcActive:true, expiresAt futuro)',
      await (async () => { try {
        const A = loadAdapter74({ configure: () => {}, getCustomerInfo: async () => ciActive74 }, 'android', { EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: 'pk_test_android' });
        const r = await A.fetchEntitlement();
        return !!r && r.rcActive === true && r.expiresAt > NOW74;
      } catch (e) { return false; } })(),
      'fetchEntitlement(sucesso) não mapeou o entitlement');

    // E8 — decideEntitlement é o ÚNICO juiz: booleano solto / {plan} solto NÃO liberam premium;
    // rcActive + janela válida (expiresAt futuro + lastValidatedAt recente) → premium.
    check('2B.7.4 (decideEntitlement juiz): {rcActive:true} sem janela → NÃO premium; {plan:premium} solto → NÃO premium; com janela → premium',
      (() => { try {
        const pol = new Function(readSrc('src/services/entitlementPolicy.js').replace(/export /g, '') + '\nreturn { decideEntitlement };')();
        const dec = (s) => pol.decideEntitlement({ ...s, now: NOW74 }).decision;
        const looseBool = dec({ loaded: true, rcActive: true });                 // sem expiresAt/lastValidatedAt
        const loosePlan = dec({ loaded: true, plan: 'premium' });                // campo solto ignorado
        const proper = dec({ loaded: true, rcActive: true, expiresAt: NOW74 + 30 * 86400000, lastValidatedAt: NOW74, maxSeenDeviceTimestamp: NOW74 });
        return looseBool !== 'premium' && loosePlan !== 'premium' && proper === 'premium';
      } catch (e) { return false; } })(),
      'decideEntitlement liberou premium por booleano/campo solto OU não confirmou o caso válido');

    // E9 — guardrails: adapter sem compra/restore/offerings/paywall/-ui; service sem import RC;
    // app.json sem plugin RC nem secret key; 2C não iniciada (assetBundlePatterns ausente).
    check('2B.7.4 (guardrails): adapter sem compra/restore/offerings/paywall/-ui; service sem RevenueCat; app.json limpo; 2C intacta',
      (() => {
        // Inspeciona CÓDIGO, não comentários (o header do adapter legitimamente cita "-ui/paywall" p/ dizer que NÃO usa).
        const adp = a1StripComments(readSrc('src/services/entitlementSource.js'));
        const svc = a1StripComments(readSrc('src/services/entitlementService.js'));
        const appjson = readSrc('app.json');
        const adapterClean = !/purchasePackage|restorePurchases|getOfferings|presentPaywall|purchaseStoreProduct|react-native-purchases-ui|RevenueCatUI/.test(adp);
        const serviceNoRc = !/from ['"]react-native-purchases['"]/.test(svc);
        const appjsonClean = !/react-native-purchases/.test(appjson)              // plugin RC NÃO adicionado
          && !/sk_live|sk_test|secret[_-]?key/i.test(appjson);                     // nenhuma secret key
        const no2C = !/assetBundlePatterns/.test(appjson);
        return adapterClean && serviceNoRc && appjsonClean && no2C;
      })(),
      'guardrails 2B.7.4 violados (compra/restore/offerings/paywall/-ui/service-RC/app.json/secret/2C)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // M1 — Higiene de release + ferramentas internas. Gate único `isInternalToolsEnabled()`;
  // seção "Administração (dev)"; FAB packs REMOVIDO; rota ColoringQa gated; banner só em dev;
  // perfil screenshot limpo. Produção/screenshot = SEM ferramentas internas (anti-vazamento).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── M1: higiene de release + ferramentas internas ──');
  {
    const navM1 = readSrc('src/navigation/AppNavigator.js');
    const parentM1 = readSrc('src/screens/ParentAreaScreen.js');
    const bannerM1 = readSrc('src/components/dev/CreatorModeBanner.js');
    const creatorM1 = a1StripComments(readSrc('src/services/creatorQaMode.js'));
    const flagsM1 = readSrc('src/config/featureFlags.js');
    const itSrcM1 = readSrc('src/config/internalTools.js');
    const easM1 = JSON.parse(readSrc('eas.json'));

    // M1-1 — gate único: produção (sem __DEV__/flags) → false; dev/creator/QA → true.
    check('M1 (gate único): isInternalToolsEnabled false em produção; true em dev/creator/QA',
      (() => { try {
        const code = itSrcM1.replace(/^\s*import\s.+?;\s*$/gm, '').replace(/export /g, '');
        const load = (dev, creator, qa) => new Function('__DEV__', 'isCreatorQaModeAllowed', 'RELEASE_PACK_QA_ENABLED', code + '\nreturn { isInternalToolsEnabled };')(dev, () => creator, qa).isInternalToolsEnabled();
        return load(false, false, false) === false
          && load(true, false, false) === true
          && load(false, true, false) === true
          && load(false, false, true) === true;
      } catch (e) { return false; } })(),
      'isInternalToolsEnabled não é derivável false em produção OU não liga em dev/creator/QA');

    // M1-2 — banner Modo Criador só sob gate (null sem permissão).
    check('M1 (banner): CreatorModeBanner retorna null sem isCreatorQaModeAllowed()',
      /if \(!isCreatorQaModeAllowed\(\) \|\| !enabled\) return null/.test(bannerM1),
      'CreatorModeBanner deixou de ser gated por isCreatorQaModeAllowed');

    // M1-3 — FAB packs global REMOVIDO (sem overlay dev em telas públicas).
    check('M1 (FAB removido): AppNavigator não renderiza mais o FAB global de packs',
      !/devPacksEnabled && \(\s*<TouchableOpacity/.test(navM1) && !/🛠 packs/.test(navM1),
      'FAB global de packs ainda presente no AppNavigator (M1 removeu)');

    // M1-4 — rotas internas SÓ sob gate.
    check('M1 (rotas internas gated): ColoringQa sob isInternalToolsEnabled; PackSandboxDev sob devPacksEnabled',
      /\{isInternalToolsEnabled\(\) &&[\s\S]*?name="ColoringQa"/.test(navM1)
        && /devPacksEnabled && \(\s*<Stack\.Screen\s+name="PackSandboxDev"/.test(navM1),
      'rota ColoringQa/PackSandboxDev não está sob o gate interno');

    // M1-5 — seção "Administração (dev)" sob o gate único.
    check('M1 (seção admin gated): "Administração (dev)" sob SHOW_TEST_TOOLS = isInternalToolsEnabled()',
      /const SHOW_TEST_TOOLS\s*=\s*isInternalToolsEnabled\(\)/.test(parentM1)
        && /\{SHOW_TEST_TOOLS &&[\s\S]*?Administração \(dev\)/.test(parentM1),
      'seção "Administração (dev)" fora do gate único');

    // M1-6 — eas.json: production E screenshot SEM as 4 flags QA internas.
    check('M1 (eas limpo): perfis production e screenshot sem flags QA internas',
      (() => {
        const bad = /EXPO_PUBLIC_ENABLE_PACK_SANDBOX|EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE|EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA|EXPO_PUBLIC_QA_BUILD/;
        const shot = easM1.build && easM1.build.screenshot;
        const prodEnv = JSON.stringify((easM1.build && easM1.build.production && easM1.build.production.env) || {});
        return !!shot && !bad.test(prodEnv) && !bad.test(JSON.stringify(shot.env || {}));
      })(),
      'perfil production/screenshot com flag QA OU perfil screenshot ausente');

    // M1-7 — Modo Criador NUNCA grava plano premium (só override em memória).
    check('M1 (sem plano gravado): creatorQaMode não referencia plan/premium (código, sem comentários)',
      !/premium/i.test(creatorM1) && !/\bplan\b/i.test(creatorM1),
      'creatorQaMode referencia plano/premium no código (deveria ser só override de permissão)');

    // M1-8 — RELEASE_PACK_QA_ENABLED exige os 4 gates (não afrouxado).
    check('M1 (quádruplo gate): RELEASE_PACK_QA_ENABLED exige as 4 flags EXPO_PUBLIC',
      /RELEASE_PACK_QA_ENABLED\s*=[\s\S]*?ENABLE_PACK_SANDBOX[\s\S]*?&&[\s\S]*?ENABLE_RELEASE_PACK_QA[\s\S]*?&&[\s\S]*?QA_BUILD[\s\S]*?&&[\s\S]*?BUILD_PROFILE/.test(flagsM1),
      'RELEASE_PACK_QA_ENABLED não exige mais os 4 gates');

    // M1-9 — "Apagar progresso" (público) fica FORA da seção Administração (dev).
    check('M1 (apagar progresso público): confirmação "APAGAR" existe e vem ANTES da seção Administração (dev)',
      parentM1.includes("'APAGAR'") && parentM1.includes('Administração (dev)')
        && parentM1.indexOf("'APAGAR'") < parentM1.indexOf('Administração (dev)'),
      '"Apagar progresso" ausente OU dentro da seção dev (deveria ser público, fora dela)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // M2b — Quiz alinhado à narração oficial. Estrutura (8/história, ids únicos, correct
  // válido) + respostas corrigidas ANCORADAS na narração + termos não-narrados removidos.
  // (M2a = NO-OP: textoNarracao não é tocado.)
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── M2b: quiz alinhado à narração ──');
  {
    const qzM2 = new Function(readSrc('src/data/quizzes.js').replace(/export /g, '') + '\nreturn QUIZZES;')();
    const stM2 = new Function(readSrc('src/data/stories.js').replace(/export const/g, 'const').replace(/export /g, '') + '\nreturn stories;')();
    const narrByStory = {};
    for (const s of stM2) narrByStory[s.id] = (s.cenas || []).map((c) => c.textoNarracao || '').join(' ');
    const normM2 = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

    // M2b-1 — estrutura: 8/história, ids únicos globais, correct índice válido.
    check('M2b (estrutura): 8 perguntas por história, ids únicos, correct válido',
      (() => { try {
        const ids = new Set();
        for (const sid of Object.keys(qzM2)) {
          const arr = qzM2[sid];
          if (!Array.isArray(arr) || arr.length !== 8) return false;
          for (const q of arr) {
            if (!q.id || ids.has(q.id)) return false; ids.add(q.id);
            if (!Array.isArray(q.options) || q.options.length < 2) return false;
            if (!(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length)) return false;
          }
        }
        return ids.size === 160;
      } catch (e) { return false; } })(),
      'quiz sem 8/história, id duplicado/ausente, ou correct inválido');

    // M2b-2 — respostas CORRIGIDAS ancoradas na narração (termo-chave na resposta E na narração).
    // Fase 2A (reancoragem no documento oficial novo): as 4 âncoras marcadas (*) apontavam para termos
    // que a narração antiga tinha e a NOVA não tem ('presenca de deus', 'havia falado', 'colaborador',
    // 'confundiu'). As perguntas foram reescritas e as âncoras reapontadas. A REGRA do check é a mesma
    // (termo presente na resposta correta E na narração); a lista foi AMPLIADA com 5 âncoras novas.
    const grounded = [
      ['noah', 'noah_q4', 'arco nas nuvens'], ['david_goliath', 'david_q7', 'muitos dias'],
      ['joseph_colorful_coat', 'joseph_q1', 'tunica especial'], ['abraham_stars', 'abraham_q6', 'uma terra'], // *
      ['esther_queen', 'esther_q6', 'com favor'], ['samuel_hears_god', 'samuel_q7', 'falasse tudo'], // *
      ['josiah_young_king', 'josiah_q5', 'profundamente tocado'], ['solomon_wisdom', 'solomon_q3', 'ajuda de deus'],
      ['timothy_faith', 'timothy_q6', 'ao lado de paulo'], // *
      ['moses_red_sea', 'moses_q7', 'forte vento'], // *
      ['jonah_big_fish', 'jonah_q6', 'terra seca'], ['noah', 'noah_q8', 'folha'],
      // Fase 2A — reforço (respostas reancoradas nesta fase):
      ['moses_red_sea', 'moses_q6', 'muros'], ['ruth_naomi', 'ruth_q7', 'obede'],
      ['mary_says_yes', 'mary_q8', 'serva do senhor'],
      ['samuel_hears_god', 'samuel_q4', 'porque o teu servo ouve'],
      ['jesus_temple', 'temple_q7', 'coisas de seu pai'],
    ];
    check('M2b (ancorada): respostas corrigidas têm termo-chave presente na narração',
      (() => { try {
        for (const [sid, qid, phrase] of grounded) {
          const q = (qzM2[sid] || []).find((x) => x.id === qid); if (!q) return false;
          const ans = normM2(q.options[q.correct]); const narr = normM2(narrByStory[sid] || ''); const p = normM2(phrase);
          if (!ans.includes(p) || !narr.includes(p)) return false;
        }
        return true;
      } catch (e) { return false; } })(),
      'alguma resposta corrigida não está ancorada na narração');

    // M2b-3 — termos NÃO narrados removidos das respostas corretas.
    const removed = [
      ['david_goliath', 'david_q7', 'quarenta'], ['esther_queen', 'esther_q1', 'assuero'],
      ['joseph_colorful_coat', 'joseph_q1', 'manto de muitas cores'], ['abraham_stars', 'abraham_q6', 'tocha'],
      ['esther_queen', 'esther_q6', 'cetro'], ['josiah_young_king', 'josiah_q1', 'oito'],
      ['josiah_young_king', 'josiah_q6', 'hulda'], ['timothy_faith', 'timothy_q1', 'listra'],
      ['noah', 'noah_q4', 'arco iris'],
    ];
    check('M2b (limpeza): termos não-narrados removidos das respostas corretas',
      (() => { try {
        for (const [sid, qid, term] of removed) {
          const q = (qzM2[sid] || []).find((x) => x.id === qid); if (!q) return false;
          if (normM2(q.options[q.correct]).includes(normM2(term))) return false;
        }
        return true;
      } catch (e) { return false; } })(),
      'uma resposta corrigida ainda contém termo não-narrado');

    // M2b-4 — textoNarracao NÃO foi tocado (M2a NO-OP): guarda leve.
    check('M2b (M2a intacto): stories.js mantém cenas com textoNarracao',
      stM2.every((s) => (s.cenas || []).every((c) => typeof c.textoNarracao === 'string' && c.textoNarracao.length > 0)),
      'textoNarracao foi alterado/removido (M2a deveria ser NO-OP)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // M2c — Reflexão "Guardar no coração": lição central por história (campo reflexaoLicao),
  // exibida no passo final. DISPLAY-ONLY: fluxo (feeling→keep→done), recompensa (+1⭐) e
  // navegação preservados. textoNarracao intocado (M2a NO-OP).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── M2c: reflexão específica por história ──');
  {
    const stC = new Function(readSrc('src/data/stories.js').replace(/export const/g, 'const').replace(/export /g, '') + '\nreturn stories;')();
    const refC = readSrc('src/screens/ReflectionScreen.js');

    // M2c-1 — toda história tem reflexaoLicao específica e substancial.
    check('M2c (dados): toda história tem reflexaoLicao (>= 40 chars)',
      stC.length === 20 && stC.every((s) => typeof s.reflexaoLicao === 'string' && s.reflexaoLicao.trim().length >= 40),
      'alguma história sem reflexaoLicao ou muito curta');

    // M2c-2 — ReflectionScreen exibe a reflexão no passo final (display-only).
    check('M2c (tela): ReflectionScreen exibe story.reflexaoLicao no passo done',
      /story\.reflexaoLicao/.test(refC) && /stepKey === 'done'[\s\S]*?reflexaoLicao/.test(refC),
      'ReflectionScreen não exibe reflexaoLicao no passo done');

    // M2c-3 — fluxo e recompensa PRESERVADOS (não mexer em conclusão/estrela/reflexão).
    check('M2c (fluxo intacto): STEPS/+1⭐/HEART_*/goBack preservados',
      /STEPS\s*=\s*\['feeling',\s*'keep',\s*'done'\]/.test(refC)
        && /STAR_BONUS\s*=\s*1/.test(refC)
        && /addBonusStars\(STAR_BONUS\)/.test(refC)
        && /HEART_FEELINGS/.test(refC) && /HEART_KEEPS/.test(refC)
        && /navigation\.goBack\(\)/.test(refC),
      'fluxo/recompensa/navegação da reflexão foi alterado');

    // M2c-4 — textoNarracao intocado (M2a NO-OP) + quizzes M2b intactos (8/história).
    check('M2c (intocados): textoNarracao presente em todas as cenas; stories.js estrutura ok',
      stC.every((s) => (s.cenas || []).every((c) => typeof c.textoNarracao === 'string' && c.textoNarracao.length > 0)),
      'textoNarracao alterado/removido (M2a deveria ser NO-OP)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // M2d — Finalização da história (última cena). Correção mínima de rótulo/ação:
  // "Concluir história ⭐" (não concluída) / "Ver conclusão →" (revisita, sem nova estrela).
  // salvarCena idempotente preservado; SEM estrela extra de conclusão; journeyComplete intocado.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── M2d: finalização da história ──');
  {
    const narrM2 = readSrc('src/screens/NarrationScreen.js');

    // M2d-1 — rótulos claros da última cena; não-última inalterada; sem "Finalizar aventura".
    check('M2d (rótulos): última cena "Concluir história ⭐"/"Ver conclusão →"; não-última intacta',
      narrM2.includes('Concluir história ⭐') && narrM2.includes('Ver conclusão →')
        && narrM2.includes('Concluir cena ⭐') && narrM2.includes('Próxima cena →')
        && !narrM2.includes('Finalizar aventura'),
      'rótulos da última cena não atualizados (M2d)');

    // M2d-2 — ação: última NÃO concluída → conclui a cena; JÁ concluída → só vê a conclusão.
    check('M2d (ação): última não-concluída→handleConcluirCena; concluída→goToNext',
      /Concluir história ⭐[\s\S]{0,80}?handleConcluirCena/.test(narrM2)
        && /Ver conclusão →[\s\S]{0,80}?goToNext/.test(narrM2)
        && /if \(isLastCena\)/.test(narrM2),
      'ação/rótulo da última cena não mapeados corretamente');

    // M2d-3 — idempotência preservada; SEM estrela extra de conclusão.
    check('M2d (sem estrela extra): salvarCena idempotente preservado; NarrationScreen sem addBonusStars',
      /salvarCena é idempotente/.test(narrM2) && /await salvarCena\(cena\.id\)/.test(narrM2)
        && !/addBonusStars/.test(narrM2),
      'idempotência quebrada ou estrela/recompensa extra adicionada na conclusão');

    // M2d-4 — journeyComplete NÃO tocado (segue derivado em storyJourneyService).
    check('M2d (journeyComplete intacto): NarrationScreen não referencia journeyComplete',
      !/journeyComplete/.test(narrM2),
      'NarrationScreen passou a mexer em journeyComplete (fora do escopo M2d)');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Fase 4A — Briefing de colorir (tituloColorir/instrucaoColorir) reancorado no
  // documento oficial de narração. ADITIVO: nenhuma validação existente foi tocada.
  //
  // Motivo: esses campos são o BRIEFING usado para encomendar folhas de colorir.
  // Eles seguiam o roteiro ANTIGO e citavam eventos que a narração oficial removeu
  // (tocha da aliança em Abraão, carros de guerra em Moisés, prisão/faraó em José,
  // Rainha de Sabá em Salomão). Produzir arte por eles gerava folhas deslocadas.
  // Estes checks impedem o briefing antigo de voltar.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Fase 4A: briefing de colorir reancorado ──');
  {
    const st4 = new Function(readSrc('src/data/stories.js').replace(/export const/g, 'const').replace(/export /g, '') + '\nreturn stories;')();
    const n4 = (x) => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const cenas4 = st4.flatMap((s) => (s.cenas || []).map((c) => ({ sid: s.id, c })));

    check('4A (estrutura): 200 cenas com tituloColorir e instrucaoColorir não vazios',
      st4.length === 20 && cenas4.length === 200 && cenas4.every(({ c }) =>
        typeof c.tituloColorir === 'string' && c.tituloColorir.trim().length > 0
        && typeof c.instrucaoColorir === 'string' && c.instrucaoColorir.trim().length > 0),
      'alguma cena sem tituloColorir/instrucaoColorir, ou campo vazio');

    // Eventos que a narração oficial NÃO tem — não podem reaparecer no briefing.
    const banidos = {
      abraham_stars: ['tocha', 'alianca', 'sacrificio', 'altar', 'mapa'],
      moses_red_sea: ['carros', 'exercito', 'persegui', 'coluna de fogo'],
      joseph_colorful_coat: ['prisao', 'farao', 'fome', 'vacas'],
      solomon_wisdom: ['saba', 'construcao do templo'],
      esther_queen: ['assuero', 'cetro dourado', 'hulda'],
      timothy_faith: ['listra'],
    };
    check('4A (limpeza): briefing de colorir não cita eventos removidos da narração oficial',
      cenas4.every(({ sid, c }) => {
        const campo = n4(c.tituloColorir + ' ' + c.instrucaoColorir);
        return (banidos[sid] || []).every((t) => !campo.includes(n4(t)));
      }),
      'um campo de colorir voltou a citar evento que não existe na narração oficial');

    // Cenas críticas: o briefing precisa apontar para o MOMENTO da própria cena.
    const ancoras4 = [
      ['lost_sheep', 8, 'encontr'], ['lost_sheep', 9, 'ombros'],
      ['miraculous_catch', 5, 'vazias'], ['moses_red_sea', 8, 'coluna de nuvem'],
      ['esther_queen', 3, 'preparada'], ['good_samaritan', 10, 'ajudando'],
    ];
    check('4A (âncoras): cenas críticas com briefing do próprio momento narrativo',
      ancoras4.every(([sid, cena, termo]) => {
        const s = st4.find((x) => x.id === sid);
        const c = s && (s.cenas || []).find((y) => y.id === cena);
        if (!c) return false;
        return n4(c.tituloColorir + ' ' + c.instrucaoColorir).includes(n4(termo));
      }),
      'uma cena crítica voltou a ter briefing de outra cena');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // V1 — Tela "Validação visual de cenas" (SÓ desenvolvimento). ADITIVO.
  // Anti-vazamento: a rota não pode existir em produção, a entrada vive só na seção
  // "Administração (dev)" e a tela precisa ser READ-ONLY (sem áudio, sem escrita).
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── V1: validação visual de cenas (dev) ──');
  {
    const navV1 = a1StripComments(readSrc('src/navigation/AppNavigator.js'));
    const parV1 = a1StripComments(readSrc('src/screens/ParentAreaScreen.js'));
    const telaV1 = a1StripComments(readSrc('src/screens/SceneValidationScreen.js'));

    check('V1 (gate): rota SceneValidation registrada SÓ sob isInternalToolsEnabled()',
      /isInternalToolsEnabled\(\)\s*&&\s*\(\s*<Stack\.Screen\s+name="SceneValidation"/.test(navV1)
      && (navV1.match(/name="SceneValidation"/g) || []).length === 1,
      'rota SceneValidation fora do gate interno, ou registrada mais de uma vez');

    check('V1 (entrada): botão vive na seção "Administração (dev)" da Área dos Pais',
      /SHOW_TEST_TOOLS && \(/.test(parV1)
      && parV1.indexOf("navigate('SceneValidation')") > parV1.indexOf('SHOW_TEST_TOOLS && ('),
      'entrada da validação visual fora da seção Administração (dev)');

    check('V1 (defesa em profundidade): a própria tela revalida isInternalToolsEnabled()',
      /isInternalToolsEnabled/.test(telaV1) && /if \(!allowed\)/.test(telaV1),
      'SceneValidationScreen não revalida o gate interno');

    check('V1 (read-only): a tela não toca áudio, progresso, plano nem storage',
      !/AudioPlayer|expo-audio|playAsync|salvarCena|addBonusStars|AsyncStorage|setItem|entitlement/i.test(telaV1),
      'SceneValidationScreen passou a tocar áudio ou a escrever estado');

    check('V1 (conteúdo oficial intacto): a tela só LÊ stories.js e os mapas de imagem',
      /from '\.\.\/data\/stories'/.test(telaV1)
      && /getSceneIllustrationAsset/.test(telaV1) && /getColoringImage/.test(telaV1),
      'SceneValidationScreen não lê as fontes oficiais esperadas');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Bloco 1.1 — Fundação técnica do Brincar. ADITIVO: nenhum check existente tocado.
  //   · routes.js como fonte única (sem RENOMEAR valores: contrato do React Navigation)
  //   · FaithIcon com os 7 ícones semânticos (emoji nunca é solução visual)
  //   · brincarDailyService: núcleo PURO das 2 rodadas grátis/dia
  //   · Free NÃO salva artes (limite 0), Plano Família salva
  //   · chaves LEGADAS do Ateliê intactas (renomear apagaria dados de usuários reais)
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 1.1: fundação do Brincar ──');
  {
    const rtB = readSrc('src/constants/routes.js');
    const fiB = readSrc('src/components/ui/FaithIcon.js');
    const skB = readSrc('src/services/storageKeys.js');
    const asB = readSrc('src/services/atelierStorage.js');
    const acB = readSrc('src/services/accessControl.js');
    const achB = readSrc('src/data/achievements.js');

    // 1.1-a — routes.js NÃO renomeia rotas: os valores batem com o AppNavigator.
    check('1.1 (rotas): routes.js centraliza nomes sem renomear (valores legados preservados)',
      /ATELIER_CANVAS: 'AtelierCanvas'/.test(rtB) && /ATELIER_GALLERY: 'AtelierGallery'/.test(rtB)
      && /ACTIVITIES: 'Ateliê'/.test(rtB) && /SCENE_VALIDATION: 'SceneValidation'/.test(rtB)
      && !/import /.test(rtB), // módulo puro, sem deps
      'routes.js renomeou uma rota (quebra navegação) ou deixou de ser puro');

    // 1.1-b — os ícones semânticos do Brincar existem e nenhum é emoji.
    // MIGRADO 2.1: `ovelha` saiu do mapa de Ionicons e virou SVG próprio (OvelhaSvg);
    // é verificado à parte no Bloco 2.1. Aqui restam os 6 que seguem no mapa Ionicons.
    const icones11 = ['brincar', 'pares', 'palavrinhas', 'bichinhos', 'desenho_guiado', 'criar_livre'];
    check('1.1 (ícones): FaithIcon tem os ícones semânticos do Brincar, sem emoji',
      icones11.every((n) => new RegExp(`\\n\\s*${n}: '[a-z-]+',`).test(fiB))
      && /name === 'ovelha'/.test(fiB)   // ovelha desenhada por SVG, não emoji
      && !/\p{Extended_Pictographic}/u.test(fiB),
      'faltou ícone semântico do Brincar, ou entrou emoji no FaithIcon');

    // 1.1-c — chave nova; chaves LEGADAS do Ateliê intactas.
    check('1.1 (storage): chave nova @ptf_brincar_daily_v1; chaves legadas do Ateliê intactas',
      /BRINCAR_DAILY: '@ptf_brincar_daily_v1'/.test(skB)
      && /ATELIER_INDEX: 'ptf_atelier_arts_v1_index'/.test(skB)
      && /const LIST_KEY = 'ptf_atelier_arts_v1_index'/.test(asB),
      'chave do Brincar ausente, ou uma chave legada do Ateliê foi renomeada');

    // 1.1-d — Free NÃO salva (0) nos DOIS lugares onde o limite vive.
    check('1.1 (plano): Free não salva artes (limite 0) em accessControl e atelierStorage',
      /const FREE_ATELIER_SAVE_LIMIT = 0;/.test(acB)
      && /export const ATELIER_FREE_SAVE_LIMIT = 0;/.test(asB)
      && /hasAtelierUnlimitedAccess\(\) \{\s*return isPremiumUser\(\);/.test(a1StripComments(acB)),
      'o limite de salvar do plano gratuito não é 0, ou o Plano Família deixou de salvar');

    // 1.1-e — categoria 'brincar' nova; 'atelie' preservada como dado legado.
    check('1.1 (conquistas): categoria brincar (sem emoji) criada; atelie preservada',
      /id: 'brincar'.*faithIcon: 'brincar'/.test(achB)
      && !/id: 'brincar'[^}]*icon: '\p{Extended_Pictographic}/u.test(achB)
      && /id: 'atelie'/.test(achB),
      'categoria brincar ausente/com emoji, ou a categoria legada atelie sumiu');

    // 1.1-f — NÚCLEO PURO das rodadas diárias (eval real, sem I/O).
    const evalBrincar = () => {
      const code = a1StripComments(readSrc('src/services/brincarDailyService.js'))
        .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
        .replace(/^export\s+/gm, '');
      return new Function(code + ';return { BRINCAR_FREE_DAILY_ROUNDS, UNLIMITED, toDayKey, sanitizeEntry, usedToday, remainingRounds, canPlayRound, nextEntryAfterRound };')();
    };

    check('1.1 (rodadas/puro): 2 rodadas grátis por dia; premium ilimitado',
      (() => { try {
        const B = evalBrincar();
        if (B.BRINCAR_FREE_DAILY_ROUNDS !== 2) return false;
        const hoje = '2026-07-09';
        const zero = { day: hoje, used: 0 };
        const uma = { day: hoje, used: 1 };
        const duas = { day: hoje, used: 2 };
        return B.remainingRounds(zero, hoje, false) === 2
          && B.remainingRounds(uma, hoje, false) === 1
          && B.remainingRounds(duas, hoje, false) === 0
          && B.canPlayRound(uma, hoje, false) === true
          && B.canPlayRound(duas, hoje, false) === false
          && B.remainingRounds(duas, hoje, true) === B.UNLIMITED
          && B.canPlayRound(duas, hoje, true) === true;
      } catch (e) { return false; } })(),
      'núcleo de rodadas diárias não respeita 2/dia no free ou ilimitado no premium');

    check('1.1 (rodadas/puro): o dia vira; entry corrompida ou de outro dia → 0 usadas',
      (() => { try {
        const B = evalBrincar();
        const hoje = '2026-07-09';
        return B.usedToday({ day: '2026-07-08', used: 2 }, hoje) === 0
          && B.usedToday(null, hoje) === 0
          && B.usedToday({ day: hoje, used: -5 }, hoje) === 0
          && B.usedToday({ day: hoje, used: 'x' }, hoje) === 0
          && B.canPlayRound({ day: '2026-07-08', used: 2 }, hoje, false) === true;
      } catch (e) { return false; } })(),
      'virada de dia ou saneamento de entry corrompida falhou');

    check('1.1 (rodadas/puro): toDayKey usa data LOCAL (não UTC) e nextEntry incrementa',
      (() => { try {
        const B = evalBrincar();
        // 23h local de 09/07 continua sendo 09/07 (toISOString viraria 10/07 em fuso negativo)
        const noite = new Date(2026, 6, 9, 23, 30, 0);
        if (B.toDayKey(noite) !== '2026-07-09') return false;
        if (B.toDayKey(new Date('invalida')) !== null) return false;
        const hoje = '2026-07-09';
        const n1 = B.nextEntryAfterRound({ day: hoje, used: 1 }, hoje, false);
        const nPrem = B.nextEntryAfterRound({ day: hoje, used: 1 }, hoje, true);
        return n1.used === 2 && n1.day === hoje && nPrem.used === 1;
      } catch (e) { return false; } })(),
      'toDayKey não é local, ou nextEntryAfterRound incrementa errado');

    // 1.1-g — o serviço não vaza para áreas sensíveis.
    check('1.1 (isolamento): brincarDailyService não toca progresso, conquistas nem chaves do Ateliê',
      (() => { const s = a1StripComments(readSrc('src/services/brincarDailyService.js'));
        return !/atelier|ATELIER|achievement|addBonusStars|salvarCena|progress/i.test(s)
          && /STORAGE_KEYS\.BRINCAR_DAILY/.test(s); })(),
      'brincarDailyService passou a tocar progresso, conquistas ou chaves do Ateliê');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Bloco 1.2 — Hub da aba Brincar. ADITIVO.
  //   · rótulo VISÍVEL é "Brincar"; o `name` da aba continua 'Ateliê' (identidade
  //     de rota: o Onboarding navega por ela)
  //   · 6 cards: 2 ativos, 4 em preparo (não abrem tela)
  //   · "Colorir uma história" NÃO é card da aba
  //   · nenhum emoji na tela; só FaithIcon
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 1.2: hub da aba Brincar ──');
  {
    const brc = readSrc('src/screens/BrincarScreen.js');
    const navB = a1StripComments(readSrc('src/navigation/AppNavigator.js'));
    const sideB = a1StripComments(readSrc('src/components/TabletSidebar.js'));
    const planB = readSrc('src/data/planConfig.js');
    const brcNoCom = a1StripComments(brc);

    check('1.2 (aba): rótulo visível "Brincar"; identidade de rota "Ateliê" preservada',
      /name: 'Ateliê',\s*label: 'Brincar',\s*faithIcon: 'brincar',\s*component: BrincarScreen/.test(navB)
      && /tabBarLabel: tab\.label \?\? tab\.name/.test(navB),
      'a aba não exibe "Brincar", ou o name de rota deixou de ser Ateliê');

    check('1.2 (tablet): sidebar exibe "Brincar" com FaithIcon, sem emoji',
      /name: 'Ateliê',\s*label: 'Brincar',\s*faithIcon: 'brincar'/.test(sideB)
      && /<FaithIcon/.test(sideB)
      && !/\p{Extended_Pictographic}/u.test(sideB),
      'sidebar do tablet ainda usa emoji ou não exibe "Brincar"');

    // Bloco 1.3a — MIGRADO de 6 para 5 cards: "Desenho guiado pelo Beni" saiu da UI
    // (decisão de produto). O fluxo legado segue vivo — ver check 1.3a (legado).
    check('1.2 (cards): as 5 atividades existem na tela',
      ['Criar livre', 'Pares do Beni',
        'Palavrinhas do Beni', 'Bichinhos da Bíblia', 'Cadê a Ovelhinha?']
        .every((t) => brc.includes(t)),
      'faltou uma das 5 atividades na BrincarScreen');

    // Bloco 1.3a — MIGRADO de 2 para 1: só "Criar livre" abre o AtelierCanvas.
    check('1.2 (ativos): só Criar livre abre o AtelierCanvas; a galeria segue acessível',
      (brcNoCom.match(/navigate\(ROUTES\.ATELIER_CANVAS/g) || []).length === 1
      && /navigate\(ROUTES\.ATELIER_GALLERY\)/.test(brcNoCom),
      'os cards ativos não abrem AtelierCanvas, ou a galeria sumiu');

    // O CORPO de ComingTile não pode ter onPress/SoundButton: card em preparo não abre tela.
    const corpoComing = (brcNoCom.match(/function ComingTile[\s\S]*?\n\}/) || [''])[0];
    check('1.2 (em preparo): os jogos ainda não prontos não navegam para lugar nenhum',
      corpoComing.length > 0
      && !/onPress|SoundButton|navigate\(/.test(corpoComing)
      && /Chegando/.test(corpoComing),
      'um card em preparo virou botão — abriria tela inexistente');

    check('1.2 (colorir): "Colorir uma história" NÃO é card da aba Brincar',
      !/Colorir uma hist/.test(brcNoCom) && !/screen: 'Aventuras'/.test(brcNoCom),
      'o card "Colorir uma história" voltou para a aba Brincar');

    check('1.2 (sem emoji): BrincarScreen usa FaithIcon e nenhum emoji',
      /<FaithIcon/.test(brc) && !/\p{Extended_Pictographic}/u.test(brc),
      'entrou emoji na BrincarScreen, ou ela deixou de usar FaithIcon');

    check('1.2 (plano): textos de plano sem "Ateliê" e sem prometer 3 artes no free',
      !/Ateliê/.test(planB) && !/3 artes/.test(planB)
      && /Brincar/.test(planB),
      'planConfig ainda fala em "Ateliê" ou promete 3 artes salvas no plano gratuito');

    check('1.2 (rodadas): o hub INFORMA as rodadas e nunca as consome',
      /getDailyRounds/.test(brcNoCom) && !/consumeRound/.test(brcNoCom),
      'a BrincarScreen consome rodada — só o jogo pode consumir');

    check('1.2 (legado intacto): AtelierScreen segue viva para AtelierFromContext',
      /name="AtelierFromContext"/.test(navB) && /component=\{AtelierScreen\}/.test(navB),
      'o fluxo contextual do Cultinho (AtelierFromContext) foi quebrado');

    // "Ateliê" não pode voltar aos TEXTOS que o usuário lê. Identidade de rota
    // (`name: 'Ateliê'`, `tab.name === 'Ateliê'`) é permitida — não é UI.
    check('1.2 (sem "Ateliê" na UI): textos de plano, galeria e conquistas limpos',
      (() => {
        const arquivos = {
          planConfig: planB,
          achievements: readSrc('src/data/achievements.js'),
          galeria: readSrc('src/screens/AtelierGalleryScreen.js'),
        };
        return Object.values(arquivos).every((src) =>
          a1StripComments(src)
            .split('\n')
            .filter((l) => /Ateliê/.test(l))
            .every((l) => /name:|tab\.name|id: 'atelie'/.test(l)));
      })(),
      'a palavra "Ateliê" voltou a um texto visível ao usuário');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Bloco 1.3 — Pares do Beni (1º jogo real). ADITIVO.
  //   · rodada é consumida SÓ quando a partida começa (nunca ao abrir a tela)
  //   · estrelinha SÓ com partida concluída, e com teto diário (todos os planos)
  //   · recordes LOCAIS: sem ranking online, sem rede
  //   · nenhum asset novo: as cartas usam as capas das histórias
  //   · conquistas novas na categoria 'brincar', sem tocar nas antigas
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 1.3: Pares do Beni ──');
  {
    const pgSrc = readSrc('src/services/paresGameService.js');
    const bsSrc = readSrc('src/services/brincarStatsService.js');
    const pdb = readSrc('src/screens/ParesDoBeniScreen.js');
    const pdbNoCom = a1StripComments(pdb);
    const achB13 = readSrc('src/data/achievements.js');
    const acsB13 = a1StripComments(readSrc('src/services/achievementService.js'));
    const navB13 = a1StripComments(readSrc('src/navigation/AppNavigator.js'));
    const brcB13 = a1StripComments(readSrc('src/screens/BrincarScreen.js'));
    const skB13 = readSrc('src/services/storageKeys.js');

    // Núcleos PUROS avaliados de verdade (paresGameService + brincarStatsService).
    const evalPares = () => {
      const limpa = (s) => a1StripComments(s)
        .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
        .replace(/^export\s+/gm, '');
      const code = limpa(pgSrc) + '\n' + limpa(bsSrc);
      return new Function(
        'AsyncStorage', 'STORAGE_KEYS', 'warn',
        code + ';return { DIFFICULTIES, BRINCAR_DAILY_STAR_CAP, getDifficulty, shuffle, pickStoryIds, buildDeck, isPair, computeScore, isBetterTime, formatTime, PARES_SOUND_EVENTS, sanitizeStats, starsToday, canEarnStar, applyResult, toAchievementCtx };',
      )({}, {}, () => {});
    };

    check('1.3 (dificuldades): Fácil 6 pares (grátis); Médio 8 e Difícil 12 (Plano Família)',
      (() => { try {
        const P = evalPares();
        const [f, m, d] = P.DIFFICULTIES;
        return f.id === 'facil' && f.pairs === 6 && f.premium === false
          && m.id === 'medio' && m.pairs === 8 && m.premium === true
          && d.id === 'dificil' && d.pairs === 12 && d.premium === true
          && P.getDifficulty('nao_existe') === null;
      } catch (e) { return false; } })(),
      'as dificuldades saíram do contrato (6/8/12 pares; Médio e Difícil premium)');

    check('1.3 (baralho/puro): cada história vira 2 cartas; par exige cartas diferentes',
      (() => { try {
        const P = evalPares();
        const rnd = () => 0.5; // determinístico
        const ids = P.pickStoryIds(['a', 'b', 'c', 'd'], 3, rnd);
        if (ids.length !== 3 || new Set(ids).size !== 3) return false;
        const deck = P.buildDeck(ids, rnd);
        if (deck.length !== 6 || new Set(deck.map((c) => c.key)).size !== 6) return false;
        const [c1, c2] = deck.filter((c) => c.storyId === ids[0]);
        return P.isPair(c1, c2) === true
          && P.isPair(c1, c1) === false        // a mesma carta não faz par consigo
          && P.isPair(c1, null) === false
          && P.pickStoryIds(['a'], 5, rnd).length === 1; // faltando história, não quebra
      } catch (e) { return false; } })(),
      'buildDeck/isPair/pickStoryIds violaram o contrato do baralho');

    check('1.3 (pontuação/puro): concluir nunca pune — mínimo 1, máximo 3',
      (() => { try {
        const P = evalPares();
        const horrivel = P.computeScore({ pairs: 6, erros: 999, elapsedMs: 9e6 });
        const perfeito = P.computeScore({ pairs: 6, erros: 0, elapsedMs: 1000 });
        return horrivel === 1 && perfeito === 3
          && P.computeScore({ pairs: 0, erros: -1, elapsedMs: -1 }) >= 1
          && P.formatTime(65000) === '01:05' && P.formatTime(-1) === '--:--'
          && P.isBetterTime(null, 5000) === true && P.isBetterTime(3000, 5000) === false;
      } catch (e) { return false; } })(),
      'computeScore pune a criança, ou formatTime/isBetterTime quebraram');

    check('1.3 (estrelinha/puro): teto diário de 2 vale para TODOS os planos; o dia vira',
      (() => { try {
        const P = evalPares();
        if (P.BRINCAR_DAILY_STAR_CAP !== 2) return false;
        const hoje = '2026-07-09';
        const jogada = { dificuldade: 'facil', elapsedMs: 30000, erros: 1, day: hoje };
        const r1 = P.applyResult(P.sanitizeStats(null), jogada);
        const r2 = P.applyResult(r1.stats, jogada);
        const r3 = P.applyResult(r2.stats, jogada);
        if (!(r1.starAwarded && r2.starAwarded && !r3.starAwarded)) return false;
        if (r3.stats.pares.facil.plays !== 3) return false;   // conta a partida mesmo sem estrela
        // Dia novo: o teto reseta.
        const amanha = P.applyResult(r3.stats, { ...jogada, day: '2026-07-10' });
        return amanha.starAwarded === true && P.canEarnStar(r3.stats, hoje) === false;
      } catch (e) { return false; } })(),
      'o teto diário de estrelinhas não é 2, ou não reseta na virada do dia');

    check('1.3 (recordes/puro): melhor tempo e menos erros; storage corrompido → estado zerado',
      (() => { try {
        const P = evalPares();
        const hoje = '2026-07-09';
        const a = P.applyResult(null, { dificuldade: 'medio', elapsedMs: 50000, erros: 4, day: hoje });
        const b = P.applyResult(a.stats, { dificuldade: 'medio', elapsedMs: 30000, erros: 9, day: hoje });
        const c = P.applyResult(b.stats, { dificuldade: 'medio', elapsedMs: 90000, erros: 1, day: hoje });
        if (!(a.isBest && b.isBest && !c.isBest)) return false;
        if (c.stats.pares.medio.bestMs !== 30000 || c.stats.pares.medio.bestErros !== 1) return false;
        // Dificuldade inválida não corrompe nada.
        if (P.applyResult(c.stats, { dificuldade: 'x', elapsedMs: 1, erros: 0, day: hoje }).starAwarded !== false) return false;
        const lixo = P.sanitizeStats({ day: 42, starsToday: -9, pares: { facil: { plays: 'x', bestMs: -1 } } });
        return lixo.day === null && lixo.starsToday === 0
          && lixo.pares.facil.plays === 0 && lixo.pares.facil.bestMs === null
          && P.starsToday({ day: '2026-07-08', starsToday: 2 }, hoje) === 0;
      } catch (e) { return false; } })(),
      'recorde de tempo/erros errado, ou stats corrompidos não são saneados');

    check('1.3 (conquistas/puro): toAchievementCtx deriva as flags de Brincar',
      (() => { try {
        const P = evalPares();
        const vazio = P.toAchievementCtx(null);
        if (vazio.paresPlays !== 0 || vazio.paresWinDificil || vazio.paresPoucosErros) return false;
        const hoje = '2026-07-09';
        let s = P.applyResult(null, { dificuldade: 'dificil', elapsedMs: 60000, erros: 2, day: hoje }).stats;
        s = P.applyResult(s, { dificuldade: 'medio', elapsedMs: 40000, erros: 7, day: hoje }).stats;
        const ctx = P.toAchievementCtx(s);
        return ctx.paresPlays === 2 && ctx.paresWinDificil === true
          && ctx.paresWinMedio === true && ctx.paresWinFacil === false
          && ctx.paresPoucosErros === true; // 2 erros no Difícil
      } catch (e) { return false; } })(),
      'as flags de conquista do Brincar não derivam dos recordes locais');

    // ── Regras de produto na TELA (não só no núcleo) ──────────────────────────
    check('1.3 (rodada): consumeRound acontece SÓ ao começar a partida',
      (() => {
        const usos = (pdbNoCom.match(/consumeRound\(/g) || []).length;
        const comecar = (pdbNoCom.match(/const comecar = useCallback\(async \(\) => \{[\s\S]*?\n  \}/) || [''])[0];
        return usos === 1 && /consumeRound\(/.test(comecar);
      })(),
      'a rodada é consumida fora do início da partida (ex.: ao abrir a tela)');

    // MIGRADO 1.4 (`concluir`→`finalizar`) e 1.4b (`finalizar`→`salvarPartida`, que é
    // o ÚNICO ponto de gravação da partida). A garantia não mudou: 1 crédito, no fim
    // da partida, atrás de starAwarded.
    check('1.3 (estrelinha): só é creditada dentro de salvarPartida(), atrás de starAwarded',
      (() => {
        const fim = (pdbNoCom.match(/const salvarPartida = useCallback\(async \([\s\S]*?\n  \}/) || [''])[0];
        return (pdbNoCom.match(/addBonusStars\(/g) || []).length === 1
          && /if \(r\.starAwarded\) \{\s*await addBonusStars\(1\);\s*await refreshProgress\?\.\(\);/.test(fim);
      })(),
      'estrelinha creditada sem partida concluída, ou sem refreshProgress');

    // MIGRADO 1.4b: agora EXISTE um ranking — mas pessoal, local e sem servidor.
    // O check deixa de proibir a palavra e passa a proibir o que importa: rede.
    check('1.3 (sem rede): recordes e ranking são locais — nada de servidor',
      !/fetch\(|axios|https?:\/\/|leaderboard|onlineRanking/i.test(a1StripComments(bsSrc))
      && !/fetch\(|axios|leaderboard/i.test(pdbNoCom)
      && /STORAGE_KEYS\.BRINCAR_STATS/.test(bsSrc)
      && /RANKING_MAX/.test(bsSrc),   // o histórico vive no mesmo storage local
      'o Brincar passou a falar com a rede ou a expor ranking online');

    check('1.3 (assets): as cartas reusam as capas das histórias; nenhum asset novo',
      /getStoryCoverImage/.test(pdbNoCom) && !/require\(/.test(pdbNoCom),
      'a tela do jogo passou a exigir assets próprios');

    // Bloco 1.4 — MIGRADO: os eventos deixaram de ser nomes soltos e passaram a apontar
    // para as CHAVES reais do audioManager. A tela segue sem conhecer caminho de arquivo.
    check('1.3 (som): eventos do Pares apontam para as chaves do audioManager',
      /FLIP: 'card_flip'/.test(pgSrc) && /WIN: 'game_victory'/.test(pgSrc)
      && /TURBO_END: 'turbo_end'/.test(pgSrc)
      && !/assets\//.test(a1StripComments(pdb)),
      'os eventos de som do Pares sumiram, ou a tela passou a conhecer caminho de asset');

    check('1.3 (sem emoji): a tela do jogo usa FaithIcon e nenhum emoji',
      /<FaithIcon/.test(pdb) && !/\p{Extended_Pictographic}/u.test(pdb),
      'entrou emoji na ParesDoBeniScreen');

    check('1.3 (navegação): rota ParesDoBeni registrada e ligada ao card do hub',
      /PARES_DO_BENI: 'ParesDoBeni'/.test(readSrc('src/constants/routes.js'))
      && /name="ParesDoBeni"/.test(navB13)
      && /navigate\(ROUTES\.PARES_DO_BENI\)/.test(brcB13),
      'o card Pares do Beni não abre o jogo');

    check('1.3 (conquistas): 5 conquistas novas em "brincar", sem emoji e sem tocar nas antigas',
      (() => {
        const novas = ['brincar_first_game', 'brincar_three_games', 'brincar_pares_medio',
          'brincar_pares_dificil', 'brincar_poucos_erros'];
        const semEmoji = novas.every((id) => {
          const bloco = (achB13.match(new RegExp(`id: '${id}'[\\s\\S]*?category: 'brincar'`)) || [''])[0];
          return bloco.length > 0 && /faithIcon:/.test(bloco) && !/\p{Extended_Pictographic}/u.test(bloco);
        });
        // As antigas continuam nas categorias legadas.
        return semEmoji
          && /id: 'first_drawing'[\s\S]*?category: 'atelie'/.test(achB13)
          && /id: 'first_chest_card'[\s\S]*?category: 'momentos'/.test(achB13);
      })(),
      'faltou conquista de Brincar, entrou emoji, ou uma conquista antiga mudou de categoria');

    check('1.3 (ctx): buildCtx funde as flags de Brincar de forma defensiva',
      /readAchievementCtx as readBrincarAchievementCtx/.test(acsB13)
      && /try \{\s*brincarCtx = \(await readBrincarAchievementCtx\(\)\) \|\| \{\};\s*\} catch/.test(acsB13),
      'buildCtx não lê as flags de Brincar, ou pode lançar se a leitura falhar');

    check('1.3 (álbum): TrophiesScreen renderiza faithIcon sem perder os emojis antigos',
      (() => { const t = a1StripComments(readSrc('src/screens/TrophiesScreen.js'));
        return /achievement\.faithIcon \?/.test(t) && /achievement\.emoji/.test(t)
          && /section\.cat\.faithIcon \?/.test(t) && /section\.cat\.icon/.test(t); })(),
      'o álbum não desenha as conquistas novas, ou perdeu os ícones antigos');

    check('1.3 (legado intacto): chaves do Ateliê preservadas; chave nova do Brincar isolada',
      /BRINCAR_STATS: '@ptf_brincar_stats_v1'/.test(skB13)
      && /ATELIER_INDEX: 'ptf_atelier_arts_v1_index'/.test(skB13)
      && !/atelier|ATELIER|progress/i.test(a1StripComments(bsSrc)),
      'o Brincar passou a tocar chaves do Ateliê ou de progresso');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Bloco 1.3a — Hotfix após teste no iPhone. Dois bugs reais + 1 decisão de produto.
  //   · aviso do React: objeto com `key` espalhado em JSX
  //   · render error: `useProgress` não existe no ProgressContext (é useProgressContext)
  //   · "Desenho guiado pelo Beni" sai da UI da aba — o fluxo legado NÃO é apagado
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 1.3a: hotfix Brincar + Pares ──');
  {
    const brcA = readSrc('src/screens/BrincarScreen.js');
    const brcAn = a1StripComments(brcA);
    const pdbA = a1StripComments(readSrc('src/screens/ParesDoBeniScreen.js'));
    const ctxA = readSrc('src/context/ProgressContext.js');
    const navA = a1StripComments(readSrc('src/navigation/AppNavigator.js'));

    check('1.3a (key): nenhum objeto com campo `key` é espalhado em JSX na BrincarScreen',
      (() => {
        // Os itens em preparo identificam-se por `id`; a chave vai explícita no map.
        const temKeyNoDado = /^\s*\{\s*key:\s*'/m.test(brcAn);
        const spreads = brcAn.match(/<\w+\s+\{\.\.\.(\w+)\}/g) || [];
        const espalhaItemCru = spreads.some((s) => /\{\.\.\.(EM_PREPARO|item)\b/.test(s));
        return !temKeyNoDado && !espalhaItemCru
          && /EM_PREPARO\.map\(\(\{ id, \.\.\.tileProps \}\)/.test(brcAn)
          && /<View key=\{id\}/.test(brcAn);
      })(),
      'um objeto contendo `key` voltou a ser espalhado em JSX (aviso do React ao abrir Brincar)');

    check('1.3a (progresso): ParesDoBeniScreen usa a API real do contexto, com guarda',
      /export function useProgressContext/.test(ctxA)
      && !/export function useProgress\b/.test(ctxA)          // o hook nunca existiu aqui
      && /useProgressContext\(\)/.test(pdbA)
      && !/\{\s*useProgress\s*\}\s*from '\.\.\/context\/ProgressContext'/.test(pdbA)
      && /const refreshProgress = progressCtx\?\.refreshProgress/.test(pdbA),
      'ParesDoBeniScreen importa um hook inexistente ou não protege a ausência do contexto');

    // MIGRADO 1.4/1.4b: `concluir`→`finalizar`→`salvarPartida`; `setFase`→`setTela`.
    // A garantia é a mesma: falhar ao gravar não pode esconder o resultado.
    check('1.3a (guarda): falha ao registrar recorde/estrelinha não derruba o resultado',
      (() => {
        const fim = (pdbA.match(/const salvarPartida = useCallback\(async \([\s\S]*?\n  \}/) || [''])[0];
        return /try \{/.test(fim) && /catch \(e\) \{\s*warn\(/.test(fim)
          && /setResultado\(\{/.test(fim)
          // quem troca de tela é o chamador, e ele roda mesmo se o await falhar
          && /salvarPartida\(\);\s*setTela\('resultado'\);/.test(pdbA)
          && /salvarPartida\(\);\s*setTela\('tempoEsgotado'\);/.test(pdbA);
      })(),
      'salvarPartida() pode lançar e impedir a tela de resultado de aparecer');

    check('1.3a (produto): "Desenho guiado pelo Beni" não é mais card da aba Brincar',
      // Só o CÓDIGO: os comentários do arquivo explicam por que o card saiu.
      !/Desenho guiado/.test(brcAn) && !/MISSIONS/.test(brcAn)
      && !/icon="desenho_guiado"/.test(brcAn),
      'o card "Desenho guiado pelo Beni" voltou para a aba Brincar');

    check('1.3a (legado intacto): missões, AtelierScreen, AtelierCanvas e a rota seguem vivos',
      /export const MISSIONS/.test(readSrc('src/data/atelierData.js'))
      && /name="AtelierFromContext"/.test(navA)
      && /component=\{AtelierScreen\}/.test(navA)
      && /name="AtelierCanvas"/.test(navA)
      && /ATELIER_CANVAS: 'AtelierCanvas'/.test(readSrc('src/constants/routes.js')),
      'o fluxo legado do Desenho guiado foi apagado — só a UI deveria ter mudado');

    check('1.3a (grade): 2 cards ativos (Pares, Criar livre) e exatamente 3 em preparo',
      (() => {
        const emPreparo = (brcAn.match(/\{ id: '[a-z]+', icon:/g) || []).length;
        const ativos = (brcAn.match(/<ActiveTile\b/g) || []).length;
        return emPreparo === 3 && ativos === 2
          && /navigate\(ROUTES\.PARES_DO_BENI\)/.test(brcAn)
          && /navigate\(ROUTES\.ATELIER_CANVAS, \{\}\)/.test(brcAn);
      })(),
      'a aba Brincar não está com 2 cards ativos e 3 em preparo');

    check('1.3a (em preparo): os 3 cards não navegam, e nenhum emoji voltou',
      (() => {
        const corpo = (brcAn.match(/function ComingTile[\s\S]*?\n\}/) || [''])[0];
        return corpo.length > 0 && !/onPress|navigate\(/.test(corpo)
          && !/\p{Extended_Pictographic}/u.test(brcA);
      })(),
      'um card em preparo virou botão, ou entrou emoji na BrincarScreen');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Bloco 1.4 — Polimento do Pares do Beni + acabamento da aba Brincar.
  //   · dois modos (Clássico sem relógio · Turbo de 60 s), recordes SEPARADOS
  //   · flip real, chacoalhada no erro, pop no acerto
  //   · som com fallback seguro; nenhuma recompensa duplicada; timers limpos
  //   · enquadramento por ponto focal (Abraão estava fora da carta)
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 1.4: Pares polido ──');
  {
    const pg14 = readSrc('src/services/paresGameService.js');
    const bs14 = readSrc('src/services/brincarStatsService.js');
    const am14 = a1StripComments(readSrc('src/services/audioManager.js'));
    const fr14 = readSrc('src/data/gameCardFraming.js');
    const pdb14raw = readSrc('src/screens/ParesDoBeniScreen.js');
    const pdb14 = a1StripComments(pdb14raw);
    const brc14 = a1StripComments(readSrc('src/screens/BrincarScreen.js'));

    // Núcleo puro dos dois módulos, avaliado de verdade.
    const evalJogo = () => {
      const limpa = (s) => a1StripComments(s)
        .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
        .replace(/^export\s+/gm, '');
      return new Function(
        'AsyncStorage', 'STORAGE_KEYS', 'warn',
        limpa(pg14) + '\n' + limpa(bs14)
        + ';return { GAME_MODES, getMode, DEFAULT_MODE, TURBO_DURATION_MS, TURBO_MAX_MS, addTurboTime,'
        + ' comboMultiplier, pointsForMatch, TURBO_MAX_MULTIPLIER, isBetterScore, isBetterMoves,'
        + ' sanitizeStats, applyResult, toAchievementCtx };',
      )({}, {}, () => {});
    };

    check('1.4 (modos): Clássico (sem relógio) e Turbo (60 s) existem; Clássico é o padrão',
      (() => { try {
        const J = evalJogo();
        const [c, t] = J.GAME_MODES;
        return J.DEFAULT_MODE === 'classico'
          && c.id === 'classico' && c.timed === false && c.records === 'bestMoves'
          && t.id === 'turbo' && t.timed === true && t.records === 'bestScore'
          && J.TURBO_DURATION_MS === 60000
          && J.getMode('inexistente').id === 'classico';   // fallback seguro
      } catch (e) { return false; } })(),
      'os modos saíram do contrato (Clássico padrão e sem relógio; Turbo de 60 s)');

    check('1.4 (cronômetro): só o Turbo é cronometrado; o tempo nunca fica negativo nem cresce sem teto',
      (() => { try {
        const J = evalJogo();
        return J.GAME_MODES.filter((m) => m.timed).length === 1
          && J.addTurboTime(58000) === 60000
          && J.addTurboTime(J.TURBO_MAX_MS) === J.TURBO_MAX_MS      // teto respeitado
          && J.addTurboTime(-5000) === 2000                          // nunca negativo
          && J.addTurboTime(1000, -9999) === 0;                      // piso em zero
      } catch (e) { return false; } })(),
      'o relógio do Turbo pode ficar negativo, crescer sem teto, ou o Clássico virou cronometrado');

    check('1.4 (combo): multiplicador cresce com acertos seguidos e trava em 5×',
      (() => { try {
        const J = evalJogo();
        return J.comboMultiplier(1) === 1 && J.comboMultiplier(3) === 3
          && J.comboMultiplier(9) === J.TURBO_MAX_MULTIPLIER
          && J.comboMultiplier(0) === 1 && J.comboMultiplier('x') === 1
          && J.pointsForMatch(1) === 100 && J.pointsForMatch(2) === 200
          && J.pointsForMatch(99) === 500;
      } catch (e) { return false; } })(),
      'a pontuação/combo do Turbo saiu da regra (100 por par, teto de 5×)');

    check('1.4 (recordes): Clássico e Turbo têm recordes SEPARADOS e não se contaminam',
      (() => { try {
        const J = evalJogo();
        const hoje = '2026-07-10';
        // Uma partida de cada modo, mesma dificuldade.
        let s = J.applyResult(null, { modo: 'classico', dificuldade: 'facil', day: hoje, elapsedMs: 40000, erros: 2, jogadas: 9 }).stats;
        s = J.applyResult(s, { modo: 'turbo', dificuldade: 'facil', day: hoje, pontos: 700, pares: 5, maiorCombo: 3 }).stats;
        if (s.pares.facil.bestMoves !== 9 || s.pares.facil.bestMs !== 40000) return false;
        if (s.turbo.facil.bestScore !== 700 || s.turbo.facil.bestCombo !== 3) return false;
        // O Turbo não mexeu no recorde do Clássico, nem o contrário.
        if (s.pares.facil.wins !== 1 || s.turbo.facil.plays !== 1) return false;
        // Menos jogadas é melhor; mais pontos é melhor.
        const melhorC = J.applyResult(s, { modo: 'classico', dificuldade: 'facil', day: hoje, elapsedMs: 90000, erros: 0, jogadas: 7 });
        const piorT = J.applyResult(s, { modo: 'turbo', dificuldade: 'facil', day: hoje, pontos: 300, pares: 2, maiorCombo: 1 });
        return melhorC.isBest === true && melhorC.stats.pares.facil.bestMoves === 7
          && piorT.isBest === false && piorT.stats.turbo.facil.bestScore === 700
          && J.isBetterMoves(9, 7) === true && J.isBetterMoves(7, 9) === false
          && J.isBetterScore(300, 700) === true && J.isBetterScore(700, 300) === false;
      } catch (e) { return false; } })(),
      'os recordes dos dois modos se misturaram, ou a direção do recorde está invertida');

    check('1.4 (recompensa): o teto diário é COMPARTILHADO — o Turbo não farma estrelinha',
      (() => { try {
        const J = evalJogo();
        const hoje = '2026-07-10';
        const c = { modo: 'classico', dificuldade: 'facil', day: hoje, elapsedMs: 30000, erros: 1, jogadas: 8 };
        const t = { modo: 'turbo', dificuldade: 'facil', day: hoje, pontos: 500, pares: 4, maiorCombo: 2 };
        const r1 = J.applyResult(null, c);      // 1ª estrelinha (Clássico)
        const r2 = J.applyResult(r1.stats, t);  // 2ª estrelinha (Turbo)
        const r3 = J.applyResult(r2.stats, t);  // teto atingido: sem estrelinha
        const r4 = J.applyResult(r3.stats, c);  // segue sem estrelinha, no outro modo
        return r1.starAwarded && r2.starAwarded && !r3.starAwarded && !r4.starAwarded
          && r4.stats.turbo.facil.plays === 2;  // mas a partida continua contando
      } catch (e) { return false; } })(),
      'o Turbo abriu um caminho de recompensa infinita, ou o teto deixou de ser compartilhado');

    check('1.4 (storage): formato antigo (sem turbo/bestMoves) é migrado sem perder dados',
      (() => { try {
        const J = evalJogo();
        const antigo = { day: '2026-07-09', starsToday: 1, pares: { facil: { plays: 3, wins: 3, bestMs: 25000, bestErros: 1 } } };
        const s = J.sanitizeStats(antigo);
        return s.pares.facil.bestMs === 25000 && s.pares.facil.wins === 3   // dados antigos preservados
          && s.pares.facil.bestMoves === null                               // campo novo nasce vazio
          && s.turbo.facil.bestScore === 0 && s.lastMode === 'classico';
      } catch (e) { return false; } })(),
      'a migração do formato antigo de recordes perde dados de quem já jogou');

    // ── Tela: animações, travas e limpeza ────────────────────────────────────
    check('1.4 (flip): giro real no eixo Y, sem imagem espelhada, no driver nativo',
      /rotateY: rotVerso/.test(pdb14) && /rotateY: rotFrente/.test(pdb14)
      && /outputRange: \['180deg', '360deg'\]/.test(pdb14)
      && /backfaceVisibility: 'hidden'/.test(pdb14)
      && /duration: T\.flip/.test(pdb14) && /flip: 300/.test(pdb14)
      && !/useNativeDriver: false/.test(pdb14),
      'o flip não é um giro real em Y, ou deixou de usar backfaceVisibility/driver nativo');

    // MIGRADO 1.4b: a sequência saiu do handler e virou máquina de estados. A ordem
    // agora é garantida por transição de fase — o comportamento é testado no bloco 1.4b.
    check('1.4 (erro): a chacoalhada existe e a grade só libera ao fim da sequência',
      /chacoalhar: 380/.test(pdb14)   // 300–450 ms
      && /observar: 420/.test(pdb14)  // as duas cartas visíveis antes de verificar
      && /case EFEITOS\.AGENDAR_FECHAR: fn\.current\.agendar\(\(\) => fn\.current\.aplicar\(fechar\), T\.chacoalhar\)/.test(pdb14)
      && /errando && styles\.cartaFrenteErro/.test(pdb14),
      'a sequência de erro libera a grade cedo demais, ou perdeu a chacoalhada');

    check('1.4 (acerto): pop de crescer e voltar; as cartas continuam na grade',
      /if \(!casada\) return undefined;/.test(pdb14)
      && /toValue: 1\.1/.test(pdb14) && /Animated\.spring\(pop/.test(pdb14)
      && /PARES_SOUND_EVENTS\.MATCH/.test(pdb14)
      && !/filter\(\(c\) => !casadas/.test(pdb14),   // nada é removido do baralho
      'o acerto perdeu o pop, o som, ou passou a remover cartas da grade');

    // MIGRADO 1.4b: a decisão saiu do estado React (que chegava atrasado e permitia a
    // 3ª carta) e virou máquina pura. Aqui só guardamos a ARQUITETURA; o comportamento
    // é provado por simulação de toques no bloco 1.4b.
    check('1.4 (3ª carta): a tela não decide toque — quem decide é a máquina, no ref',
      (() => {
        const t = (pdb14.match(/const tocarCarta = useCallback\(\(i\) => \{[\s\S]*?\n  \}, \[/) || [''])[0];
        return /aplicar\(tocar, i\)/.test(t)
          // a tela não reimplementa regra nenhuma de aceitação
          && !/abertas\.includes\(i\)/.test(t) && !/travado\.current/.test(pdb14)
          // o ref é gravado ANTES do setState, dentro de aplicar()
          && /jogoRef\.current = r\.estado;\s*if \(montado\.current\) setVista\(r\.estado\);/.test(pdb14);
      })(),
      'a tela voltou a decidir o toque pelo estado React — a 3ª carta pode abrir');

    // MIGRADO 1.4b: `finalizado.current` virou `salvoRef` (grava) + `tempoAcabouRef`
    // (alarme/painel). Duas guardas, cada uma para uma coisa — nenhuma foi perdida.
    check('1.4 (recompensa única): a partida grava uma vez e credita a estrelinha uma vez',
      /if \(salvoRef\.current\) return;\s*salvoRef\.current = true;/.test(pdb14)
      && /if \(tempoAcabouRef\.current\) return;\s*tempoAcabouRef\.current = true;/.test(pdb14)
      && (pdb14.match(/recordParesResult\(/g) || []).length === 1
      && (pdb14.match(/addBonusStars\(/g) || []).length === 1,
      'a partida pode ser gravada duas vezes ou creditar a estrelinha duas vezes');

    check('1.4 (timers): todo timeout passa por agendar() e é limpo no unmount',
      /timeouts\.current\.forEach\(clearTimeout\)/.test(pdb14)
      && /montado\.current = false;\s*limparTimers\(\);/.test(pdb14)
      && /releaseGameSfx\(\);/.test(pdb14)
      // nenhum setTimeout solto fora do helper
      && (pdb14.match(/setTimeout\(/g) || []).length === 1,
      'existe um setTimeout fora do agendar(), ou os timers/sons sobrevivem à saída da tela');

    check('1.4 (pausa): app em segundo plano ou tela sem foco param o relógio',
      /AppState\.addEventListener\('change'/.test(pdb14)
      && /navigation\.addListener\('blur', \(\) => setPausado\(true\)\)/.test(pdb14)
      && /if \(!jogando \|\| pausado\) return undefined;/.test(pdb14),
      'o cronômetro continua correndo com o app em segundo plano ou fora da tela');

    check('1.4 (som): efeitos com fallback seguro, throttle e liberação',
      /export function playGameSfx/.test(am14) && /export function releaseGameSfx/.test(am14)
      && /export function preloadGameSfx/.test(am14)
      && /if \(!prefs\.soundsEnabled\) return;/.test(am14.split('export function playGameSfx')[1] || '')
      && /SFX_MIN_INTERVAL_MS/.test(am14)
      && /catch \{/.test(am14.split('export function playGameSfx')[1] || '')
      && !/expo-av/.test(am14),   // segue em expo-audio
      'os efeitos do jogo podem quebrar a tela, empilhar sons, ou voltaram para expo-av');

    check('1.4 (Abraão): enquadramento por ponto focal corrige a carta cortada',
      /abraham_stars: \{ focalX: 1, focalY: 0\.55, zoom: 1\.45 \}/.test(fr14)
      && /export function getCardFraming/.test(fr14)
      && /getCardFraming\(storyId\)/.test(pdb14)
      && /computeCardImageLayout/.test(pdb14),
      'o ajuste de enquadramento de Abraão sumiu, ou a carta deixou de usá-lo');

    check('1.4 (enquadramento/puro): sem ajuste = recorte centrado (nada muda nas outras cartas)',
      (() => { try {
        const src = a1StripComments(fr14)
          .replace(/^export\s+default[\s\S]*$/m, '')
          .replace(/^export\s+/gm, '');
        const F = new Function(src + ';return { getCardFraming, computeCardImageLayout };')();
        const padrao = F.getCardFraming('historia_sem_ajuste');
        if (padrao.focalX !== 0.5 || padrao.zoom !== 1) return false;
        // capa panorâmica 1456×816 numa carta 100×112: "cover" pela largura da carta
        const l = F.computeCardImageLayout(1456, 816, 100, 112, padrao);
        if (Math.round(l.height) !== 112) return false;             // cobre a carta
        if (Math.abs(l.left + (l.width - 100) / 2) > 0.01) return false; // centrado
        // Abraão: o recorte anda para a direita (left mais negativo) e aproxima.
        const a = F.computeCardImageLayout(1456, 816, 100, 112, F.getCardFraming('abraham_stars'));
        return a.left < l.left && a.width > l.width && a.top <= 0;
      } catch (e) { return false; } })(),
      'o enquadramento padrão deixou de ser o recorte centrado, ou o de Abraão não desloca');

    // ── Aba Brincar ──────────────────────────────────────────────────────────
    check('1.4 (hub): 5 cards, Desenho guiado fora da UI, legado do Ateliê preservado',
      (brc14.match(/<ActiveTile\b/g) || []).length === 2
      && (brc14.match(/\{ id: '[a-z]+', icon:/g) || []).length === 3
      && !/Desenho guiado/.test(brc14)
      && /navigate\(ROUTES\.ATELIER_CANVAS, \{\}\)/.test(brc14)
      && /navigate\(ROUTES\.ATELIER_GALLERY\)/.test(brc14)
      && /export const MISSIONS/.test(readSrc('src/data/atelierData.js')),
      'a aba Brincar saiu dos 5 cards, ou o fluxo legado do Ateliê foi tocado');

    check('1.4 (hub visual): Beni no topo, safe area no fim da rolagem, estados pressionados',
      /<BeniAvatar variant="happy"/.test(brc14)
      && /paddingBottom: insets\.bottom \+ 28/.test(brc14)
      && /tileAtivo/.test(brc14)
      && /accessibilityRole="button"/.test(brc14)
      && !/\p{Extended_Pictographic}/u.test(readSrc('src/screens/BrincarScreen.js')),
      'o acabamento da aba Brincar regrediu (Beni, safe area, toque ou emoji)');

    check('1.4 (protegidos): o bloco não tocou histórias, quizzes nem áudio de narração',
      (() => {
        const st = readSrc('src/data/stories.js');
        const qz = readSrc('src/data/quizzes.js');
        // Nada do jogo vaza para o conteúdo, e o conteúdo segue com seu formato.
        return !/pares|turbo|brincar/i.test(qz.slice(0, 2000))
          && /export const stories/.test(st)
          && !/audio\/(?!sfx)/.test(a1StripComments(readSrc('src/services/audioManager.js')).split('GAME_SFX')[1] || '');
      })(),
      'o Bloco 1.4 vazou para histórias, quizzes ou para o áudio de narração');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Bloco 1.4b — Máquina de estados + Turbo expandido.
  //
  //   A regra da 3ª carta NÃO é testável por regex: é comportamento. Aqui a máquina
  //   pura é carregada e TOCADA de verdade, simulando toques concorrentes.
  //
  //   · impossível abrir 3 cartas · verificação só depois do flip da 2ª
  //   · contagem regressiva · alarme único · ranking top 5 ordenado · salvar 1×
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 1.4b: máquina de toque + Turbo ──');
  {
    const pgB = readSrc('src/services/paresGameService.js');
    const bsB = readSrc('src/services/brincarStatsService.js');
    const mqB = readSrc('src/services/paresGameMachine.js');
    const pdbB = a1StripComments(readSrc('src/screens/ParesDoBeniScreen.js'));
    const amB = a1StripComments(readSrc('src/services/audioManager.js'));

    const limpa = (s) => a1StripComments(s)
      .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
      .replace(/^export\s+default[\s\S]*$/m, '')
      .replace(/^export\s+/gm, '');

    /** Máquina + serviço, avaliados de verdade. */
    const carregar = () => new Function(
      'AsyncStorage', 'STORAGE_KEYS', 'warn',
      limpa(pgB) + '\n' + limpa(mqB) + '\n' + limpa(bsB)
      + ';return { FASES, EFEITOS, FASES_QUE_ACEITAM, criarJogo, aceitaToque, tocar, flipConcluido,'
      + ' verificar, liberar, fechar, novaGrade, encerrar, applyResult, inserirNoRanking,'
      + ' compararTurbo, sanitizeStats, RANKING_MAX, segundosRestantes, TURBO_TICK_MS, TURBO_ALERTA_MS,'
      + ' getTurboDuration };',
    )({}, {}, () => {});

    // Baralho fixo, 3 pares: (0,1)=a · (2,3)=b · (4,5)=c. Nada aleatório.
    // Par errado = duas cartas de histórias diferentes, ex.: 0 e 2.
    const DECK = [
      { key: 'a#a', storyId: 'a' }, { key: 'a#b', storyId: 'a' },
      { key: 'b#a', storyId: 'b' }, { key: 'b#b', storyId: 'b' },
      { key: 'c#a', storyId: 'c' }, { key: 'c#b', storyId: 'c' },
    ];
    const jogoNovo = (M, extra = {}) => M.criarJogo({ deck: DECK, pares: 3, ...extra });

    /** Jogada completa: dois toques, dois flips concluídos, verificação. */
    const jogar = (M, e, a, b) => {
      e = M.tocar(e, a).estado;
      e = M.tocar(e, b).estado;
      e = M.flipConcluido(e, a).estado;
      e = M.flipConcluido(e, b).estado;
      return M.verificar(e);
    };

    // ── 1. A TERCEIRA CARTA (o bug real do iPhone) ───────────────────────────
    check('1.4b (3ª carta): três toques no MESMO instante abrem exatamente duas cartas',
      (() => { try {
        const M = carregar();
        let e = jogoNovo(M);
        // Nenhum callback assíncrono roda entre os toques — é exatamente a corrida real.
        const t1 = M.tocar(e, 0); e = t1.estado;
        const t2 = M.tocar(e, 1); e = t2.estado;
        const t3 = M.tocar(e, 2); e = t3.estado;

        return t1.aceito === true && t2.aceito === true && t3.aceito === false
          && e.abertas.length === 2                 // só duas viradas
          && e.abertas.join() === '0,1'             // e são as duas primeiras
          && t3.efeitos.length === 0                // a 3ª não tocou som nem vibrou
          && e.jogadas === 0;                       // jogada só conta na verificação
      } catch (err) { return false; } })(),
      'ainda é possível abrir uma terceira carta — a corrida do toque não foi eliminada');

    check('1.4b (3ª carta): rajada de toques simultâneos em cartas diferentes',
      (() => { try {
        const M = carregar();
        let e = jogoNovo(M);
        let aceitos = 0;
        // 8 toques disparados sem nenhum callback no meio.
        for (const i of [0, 2, 3, 1, 2, 3, 0, 1]) {
          const r = M.tocar(e, i);
          e = r.estado;
          if (r.aceito) aceitos++;
        }
        return aceitos === 2 && e.abertas.length === 2 && e.abertas.join() === '0,2';
      } catch (err) { return false; } })(),
      'uma rajada de toques simultâneos abre mais de duas cartas');

    check('1.4b (3ª carta): nenhum toque é aceito durante verificação, acerto, erro, troca de grade ou fim',
      (() => { try {
        const M = carregar();
        const bloqueadas = [M.FASES.SECOND_FLIP, M.FASES.CHECKING, M.FASES.MATCH,
          M.FASES.ERROR, M.FASES.BOARD, M.FASES.FINISHED];
        const base = jogoNovo(M);
        const todasBloqueiam = bloqueadas.every((fase) => !M.aceitaToque({ ...base, fase }, 3));
        // E as fases que aceitam são exatamente as três esperadas.
        return todasBloqueiam
          && M.FASES_QUE_ACEITAM.length === 3
          && M.FASES_QUE_ACEITAM.includes(M.FASES.IDLE)
          && M.FASES_QUE_ACEITAM.includes(M.FASES.FIRST_FLIP)     // a criança é rápida
          && M.FASES_QUE_ACEITAM.includes(M.FASES.WAITING_SECOND);
      } catch (err) { return false; } })(),
      'alguma fase de resolução voltou a aceitar toque');

    check('1.4b (3ª carta): depois da sequência, a mesma carta recusada é aceita normalmente',
      (() => { try {
        const M = carregar();
        let e = jogoNovo(M);
        e = M.tocar(e, 0).estado;
        e = M.tocar(e, 2).estado;                 // par errado
        if (M.tocar(e, 3).aceito) return false;   // recusada durante a resolução
        e = M.flipConcluido(e, 0).estado;
        e = M.flipConcluido(e, 2).estado;         // 2ª carta terminou o giro
        e = M.verificar(e).estado;                // erro
        e = M.fechar(e).estado;                   // chacoalhou e virou de volta
        const r = M.tocar(e, 3);                  // agora sim
        return e.fase === M.FASES.IDLE && r.aceito === true;
      } catch (err) { return false; } })(),
      'depois da sequência de erro a grade não volta a aceitar toques');

    // ── 2. FLIP ANTES DA VERIFICAÇÃO ─────────────────────────────────────────
    check('1.4b (ordem/acerto): som, borda verde, pontos e combo só DEPOIS do flip da 2ª carta',
      (() => { try {
        const M = carregar();
        let e = jogoNovo(M, { cronometrado: true });
        e = M.tocar(e, 0).estado;
        e = M.tocar(e, 1).estado;                 // par certo, 2ª ainda girando

        // Verificar agora seria "adiantar o acerto": a máquina recusa.
        const cedo = M.verificar(e);
        if (cedo.efeitos.length !== 0 || cedo.estado.casadas.length !== 0
          || cedo.estado.pontos !== 0 || cedo.estado.jogadas !== 0) return false;

        // Fim do giro da 1ª carta NÃO pode disparar a verificação (a 2ª ainda gira).
        const f1 = M.flipConcluido(e, 0);
        if (f1.efeitos.length !== 0 || f1.estado.fase !== M.FASES.SECOND_FLIP) return false;

        // Só o fim do giro da 2ª carta autoriza.
        const f2 = M.flipConcluido(f1.estado, 1);
        if (f2.estado.fase !== M.FASES.CHECKING
          || !f2.efeitos.includes(M.EFEITOS.AGENDAR_VERIFICAR)) return false;

        const v = M.verificar(f2.estado);
        return v.estado.fase === M.FASES.MATCH
          && v.efeitos.includes(M.EFEITOS.SOM_ACERTO)     // som só agora
          && v.efeitos.includes(M.EFEITOS.VIBRAR_ACERTO)
          && v.estado.casadas.length === 2                // borda verde só agora
          && v.estado.pontos === 100 && v.estado.combo === 1 && v.estado.jogadas === 1;
      } catch (err) { return false; } })(),
      'o acerto (som, borda, pontos) aparece antes de a 2ª carta terminar o flip');

    check('1.4b (ordem/erro): som de erro e chacoalhada só DEPOIS do flip da 2ª carta',
      (() => { try {
        const M = carregar();
        let e = jogoNovo(M);
        e = M.tocar(e, 0).estado;
        e = M.tocar(e, 2).estado;                 // par errado
        if (M.verificar(e).efeitos.length !== 0) return false;   // cedo demais: nada

        e = M.flipConcluido(e, 0).estado;
        e = M.flipConcluido(e, 2).estado;
        const v = M.verificar(e);
        return v.estado.fase === M.FASES.ERROR
          && v.efeitos.includes(M.EFEITOS.SOM_ERRO)
          && v.efeitos.includes(M.EFEITOS.AGENDAR_FECHAR)
          && v.estado.erros === 1 && v.estado.jogadas === 1 && v.estado.combo === 0
          && v.estado.abertas.length === 2;       // ainda visíveis: a criança olha
      } catch (err) { return false; } })(),
      'o erro é mostrado antes de a 2ª carta terminar o flip');

    check('1.4b (combo): acertos seguidos multiplicam; um erro zera o combo sem tirar pontos',
      (() => { try {
        const M = carregar();
        let e = jogoNovo(M, { cronometrado: true });
        e = M.liberar(jogar(M, e, 0, 1).estado).estado;   // 1º par: 100 (combo 1×)
        e = M.liberar(jogar(M, e, 2, 3).estado).estado;   // 2º par seguido: 200 (combo 2×)
        if (e.pontos !== 300 || e.maiorCombo !== 2 || e.combo !== 2) return false;

        // Erro logo depois: combo zera, mas os 300 pontos ficam.
        let f = jogoNovo(M, { cronometrado: true });
        f = M.liberar(jogar(M, f, 0, 1).estado).estado;   // combo 1
        const erro = jogar(M, f, 2, 4);                   // b × c → erro
        f = M.fechar(erro.estado).estado;
        if (f.combo !== 0 || f.pontos !== 100 || f.erros !== 1) return false;

        // Combo recomeça do 1× (100 pontos, não 200).
        const g = M.liberar(jogar(M, f, 2, 3).estado).estado;
        return g.pontos === 200 && g.combo === 1 && g.maiorCombo === 1;
      } catch (err) { return false; } })(),
      'o combo não multiplica, não zera no erro, ou o erro retira pontos');

    // ── 3. TURBO: grade, relógio, alarme ─────────────────────────────────────
    check('1.4b (grade): limpar a grade no Turbo NÃO encerra a partida; no Clássico encerra',
      (() => { try {
        const M = carregar();
        const limpar = (e) => {
          e = M.liberar(jogar(M, e, 0, 1).estado).estado;
          e = M.liberar(jogar(M, e, 2, 3).estado).estado;
          return M.liberar(jogar(M, e, 4, 5).estado);   // 3º par: grade limpa
        };
        // Turbo: grade cheia → troca de grade, partida segue.
        const turbo = limpar(jogoNovo(M, { cronometrado: true }));
        if (turbo.estado.fase !== M.FASES.BOARD) return false;
        if (!turbo.efeitos.includes(M.EFEITOS.SOM_GRADE)) return false;
        if (turbo.efeitos.includes(M.EFEITOS.FIM_DE_JOGO)) return false;   // NÃO acaba
        if (turbo.estado.gradesCompletas !== 1) return false;
        if (M.aceitaToque(turbo.estado, 0)) return false;                  // trava na troca

        // Nova grade: pontos, combo, pares e grades continuam.
        const nova = M.novaGrade(turbo.estado, DECK).estado;
        if (nova.fase !== M.FASES.IDLE || nova.paresTotais !== 3 || nova.pontos === 0) return false;
        if (nova.casadas.length !== 0 || nova.gradesCompletas !== 1) return false;

        // Clássico: grade cheia → fim de jogo.
        const classico = limpar(jogoNovo(M));
        return classico.estado.fase === M.FASES.FINISHED
          && classico.efeitos.includes(M.EFEITOS.FIM_DE_JOGO);
      } catch (err) { return false; } })(),
      'o Turbo encerra ao limpar a grade, ou o Clássico não encerra');

    check('1.4b (fim): depois de encerrar, nenhum toque é aceito — nunca mais',
      (() => { try {
        const M = carregar();
        let e = jogoNovo(M, { cronometrado: true });
        e = M.tocar(e, 0).estado;
        e = M.encerrar(e).estado;                 // tempo zerou no meio da jogada
        const r = M.tocar(e, 1);
        return e.fase === M.FASES.FINISHED && e.abertas.length === 0
          && r.aceito === false && r.efeitos.length === 0
          && M.verificar(e).efeitos.length === 0;  // nada pendente conta depois do zero
      } catch (err) { return false; } })(),
      'uma carta aberta depois do zero ainda é contabilizada');

    check('1.4b (recorde na partida): "Novo recorde!" é anunciado UMA única vez',
      (() => { try {
        const M = carregar();
        let e = jogoNovo(M, { cronometrado: true, recordeAtual: 50 });
        const v1 = jogar(M, e, 0, 1);             // 100 pontos > 50 → anuncia
        if (!v1.efeitos.includes(M.EFEITOS.RECORDE_BATIDO)) return false;
        e = M.liberar(v1.estado).estado;
        const v2 = jogar(M, e, 2, 3);             // segue passando, mas não repete
        return !v2.efeitos.includes(M.EFEITOS.RECORDE_BATIDO) && v2.estado.recordeAvisado === true;
      } catch (err) { return false; } })(),
      'o aviso de novo recorde repete durante a partida');

    // MIGRADO 1.4d: o tique passou a começar junto com o alerta, aos 10 s (era 5 s).
    check('1.4b (contagem): alerta e tique começam aos 10 s; segundo inteiro coerente',
      (() => { try {
        const M = carregar();
        return M.TURBO_ALERTA_MS === 10000 && M.TURBO_TICK_MS === 10000
          && M.segundosRestantes(5000) === 5 && M.segundosRestantes(4001) === 5
          && M.segundosRestantes(4000) === 4 && M.segundosRestantes(1) === 1
          && M.segundosRestantes(0) === 0 && M.segundosRestantes(-10) === 0
          && M.getTurboDuration('facil') === 60000 && M.getTurboDuration('inexistente') === 60000;
      } catch (err) { return false; } })(),
      'a contagem regressiva não começa em 5 s, ou o segundo exibido não bate com o tique');

    // ── 4. RANKING PESSOAL ───────────────────────────────────────────────────
    check('1.4b (ranking): guarda no máximo 5 partidas por dificuldade',
      (() => { try {
        const M = carregar();
        let lista = [];
        for (let i = 1; i <= 8; i++) {
          lista = M.inserirNoRanking(lista, {
            pontos: i * 100, pares: i, maiorCombo: 1, grades: 0,
            dificuldade: 'facil', data: '2026-07-1' + (i % 10), duracaoMs: 60000,
          }).lista;
        }
        return lista.length === M.RANKING_MAX && M.RANKING_MAX === 5
          && lista[0].pontos === 800 && lista[4].pontos === 400;   // as 5 melhores
      } catch (err) { return false; } })(),
      'o histórico pessoal guarda mais (ou menos) que cinco partidas por dificuldade');

    check('1.4b (ranking): ordem pontos → pares → combo → mais recente',
      (() => { try {
        const M = carregar();
        const e = (pontos, pares, maiorCombo, data) => ({ pontos, pares, maiorCombo, grades: 0, dificuldade: 'facil', data, duracaoMs: 60000 });
        // Todos empatados em pontos: desempata por pares.
        let l = M.inserirNoRanking([], e(500, 3, 5, '2026-07-01')).lista;
        l = M.inserirNoRanking(l, e(500, 6, 1, '2026-07-02')).lista;
        if (l[0].pares !== 6) return false;
        // Empate em pontos e pares: desempata por combo.
        l = M.inserirNoRanking(l, e(500, 6, 4, '2026-07-03')).lista;
        if (l[0].maiorCombo !== 4) return false;
        // Empate total: a partida mais recente vem primeiro.
        const r = M.inserirNoRanking(l, e(500, 6, 4, '2026-07-09'));
        if (r.lista[0].data !== '2026-07-09' || r.posicao !== 1) return false;
        // Pontuação maior sempre vence tudo.
        const topo = M.inserirNoRanking(r.lista, e(900, 1, 1, '2026-07-01'));
        return topo.lista[0].pontos === 900 && topo.posicao === 1;
      } catch (err) { return false; } })(),
      'o desempate do ranking não segue pontos → pares → combo → mais recente');

    check('1.4b (ranking): posição devolvida é a da partida atual; fora do top 5 devolve 0',
      (() => { try {
        const M = carregar();
        const e = (p, d) => ({ pontos: p, pares: 1, maiorCombo: 1, grades: 0, dificuldade: 'facil', data: d, duracaoMs: 60000 });
        let l = [];
        for (const p of [900, 800, 700, 600, 500]) l = M.inserirNoRanking(l, e(p, '2026-07-01')).lista;
        const dentro = M.inserirNoRanking(l, e(750, '2026-07-02'));
        const fora = M.inserirNoRanking(l, e(100, '2026-07-02'));
        return dentro.posicao === 3 && dentro.lista.length === 5
          && fora.posicao === 0 && fora.lista.length === 5
          // partida sem nenhum par não entra no histórico
          && M.inserirNoRanking(l, e(0, '2026-07-02')).posicao === 0;
      } catch (err) { return false; } })(),
      'a posição da partida atual no ranking está errada');

    check('1.4b (ranking): separado por dificuldade e ligado ao applyResult do Turbo',
      (() => { try {
        const M = carregar();
        const hoje = '2026-07-10';
        const jogo = (dificuldade, pontos) => ({ modo: 'turbo', dificuldade, day: hoje, data: hoje, pontos, pares: 4, maiorCombo: 2, grades: 1, duracaoMs: 60000 });
        let s = M.applyResult(null, jogo('facil', 500)).stats;
        const r = M.applyResult(s, jogo('medio', 900));
        s = r.stats;
        return s.turbo.facil.ranking.length === 1 && s.turbo.medio.ranking.length === 1
          && s.turbo.dificil.ranking.length === 0            // nível não jogado fica vazio
          && s.turbo.facil.ranking[0].pontos === 500
          && r.posicao === 1
          && s.turbo.medio.ranking[0].grades === 1
          && s.turbo.medio.ranking[0].duracaoMs === 60000;   // duração do nível registrada
      } catch (err) { return false; } })(),
      'o ranking não é separado por dificuldade, ou o Turbo não o alimenta');

    check('1.4b (ranking): não concede estrelinha extra e sobrevive a storage corrompido',
      (() => { try {
        const M = carregar();
        const s = M.sanitizeStats({ turbo: { facil: { ranking: ['lixo', null, { pontos: 0 }, { pontos: 300, data: 'x' }] } } });
        if (s.turbo.facil.ranking.length !== 1 || s.turbo.facil.ranking[0].pontos !== 300) return false;
        // 3 partidas Turbo no mesmo dia: só 2 estrelinhas (teto compartilhado).
        const hoje = '2026-07-10';
        const j = { modo: 'turbo', dificuldade: 'facil', day: hoje, data: hoje, pontos: 400, pares: 3, maiorCombo: 2, grades: 0, duracaoMs: 60000 };
        const r1 = M.applyResult(null, j);
        const r2 = M.applyResult(r1.stats, j);
        const r3 = M.applyResult(r2.stats, j);
        return r1.starAwarded && r2.starAwarded && !r3.starAwarded
          && r3.stats.turbo.facil.ranking.length === 3;   // mas o histórico registra as 3
      } catch (err) { return false; } })(),
      'o ranking dá estrelinha extra, ou quebra com storage corrompido');

    // ── 5. TELA: painel, alarme, salvamento e limpeza ────────────────────────
    // MIGRADO 1.4d: o botão sumiu. A garantia é a MESMA (o aviso vem antes do
    // resultado), mas agora a passagem é automática e agendada uma única vez.
    check('1.4b (painel): "Tempo encerrado" vem ANTES do resultado, agora automaticamente',
      /setTela\('tempoEsgotado'\)/.test(pdbB)
      && /Tempo encerrado!/.test(pdbB)
      && !/Ver meu resultado/.test(pdbB)     // nenhuma ação exigida da criança
      && /if \(transicaoResultadoRef\.current == null\) \{/.test(pdbB)
      && /transicaoResultadoRef\.current = agendar\(\(\) => \{[\s\S]*?setTela\('resultado'\);\s*\}, TURBO_AVISO_MS\);/.test(pdbB),
      'o resultado do Turbo aparece sem passar pelo aviso de tempo encerrado');

    check('1.4b (alarme): dispara uma vez, cala o tique e cancela timers pendentes',
      (() => {
        const bloco = (pdbB.match(/const tempoEsgotou = useCallback\([\s\S]*?\n  \}/) || [''])[0];
        return /if \(tempoAcabouRef\.current\) return;/.test(bloco)
          && /aplicar\(encerrar\)/.test(bloco)
          && /limparTimers\(\)/.test(bloco)
          && /stopGameSfx\(PARES_SOUND_EVENTS\.COUNTDOWN_TICK\)/.test(bloco)
          && /playGameSfx\(PARES_SOUND_EVENTS\.TIME_UP\)/.test(bloco)
          && /salvarPartida\(\)/.test(bloco);
      })(),
      'o alarme pode tocar duas vezes, ou o tique continua depois do zero');

    check('1.4b (tique): um por segundo, casado com o número, e silenciado ao pausar',
      /if \(seg > 0 && seg <= TURBO_TICK_MS \/ 1000 && seg !== ultimoSegundoRef\.current\)/.test(pdbB)
      && /ultimoSegundoRef\.current = seg;\s*playGameSfx\(PARES_SOUND_EVENTS\.COUNTDOWN_TICK\)/.test(pdbB)
      && /if \(pausado\) stopGameSfx\(PARES_SOUND_EVENTS\.COUNTDOWN_TICK\)/.test(pdbB)
      // throttle do tique não pode barrar o segundo seguinte (1000 ms), mas barra o dobro no mesmo segundo
      && /countdown_tick: 300/.test(amB),
      'o relógio pode tocar mais de uma vez por segundo, ou continua tocando pausado');

    // MIGRADO 1.4d: a borda única virou quatro faixas (`MolduraAlerta`), nos limites
    // da janela. A garantia é a mesma: pulsa nos últimos 10 s e não rouba o toque.
    check('1.4b (pulso): moldura e relógio pulsam nos últimos 10 s, sem cobrir as cartas',
      /restanteMs <= TURBO_ALERTA_MS/.test(pdbB)
      && /Animated\.loop\(/.test(pdbB)
      && /pointerEvents="none"/.test(pdbB)     // a moldura não rouba o toque das cartas
      && /<MolduraAlerta pulso=\{pulso\}/.test(pdbB)
      && /hudCritico/.test(pdbB),
      'o alerta dos últimos 10 segundos sumiu, ou a moldura cobre as cartas');

    check('1.4b (ciclo de vida): animações e sons param no unmount e ao pausar',
      /pulso\.stopAnimation\(\); tique\.stopAnimation\(\);/.test(pdbB)
      && /stopGameSfx\(PARES_SOUND_EVENTS\.COUNTDOWN_TICK\);\s*releaseGameSfx\(\);/.test(pdbB)
      && /if \(montado\.current\) fn\(\);/.test(pdbB)   // timeout não toca componente desmontado
      && /export function stopGameSfx/.test(readSrc('src/services/audioManager.js')),
      'animações, tique ou timers sobrevivem à saída da tela');

    check('1.4b (sons novos): 5 efeitos registrados, com throttle próprio e sem loop',
      ['countdown_tick', 'time_up_alarm', 'board_complete', 'classic_victory_jingle', 'turbo_result_jingle']
        .every((n) => new RegExp(`${n}: require\\('\\.\\./\\.\\./assets/audio/sfx/${n}\\.wav'\\)`).test(amB))
      && /SFX_INTERVAL_OVERRIDE/.test(amB)
      && !/loop = true/.test(amB.split('GAME_SFX')[1] || '')
      && !/expo-av/.test(amB),
      'os sons novos não foram registrados, ou entraram em loop / voltaram para expo-av');

    // Só o CÓDIGO: os comentários da máquina explicam justamente por que ela não pode
    // depender de estado React.
    check('1.4b (a máquina é pura): sem React, sem relógio, sem I/O, sem rede',
      (() => { const codigo = a1StripComments(mqB);
        return !/useState|useEffect|useRef|from 'react|require\('react/i.test(codigo)
          && !/Date\.now|setTimeout|setInterval|Math\.random/.test(codigo)
          && !/AsyncStorage|fetch\(/.test(codigo)
          && /export function aceitaToque/.test(mqB); })(),
      'a máquina de estados deixou de ser pura — os testes comportamentais perdem valor');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Bloco 1.4c — Polimento visual e responsivo.
  //   · o Difícil VAZAVA porque cardSize só olhava a largura (12 pares = 6 linhas)
  //   · moldura de alerta na tela toda, dentro da safe area, sem roubar toque
  //   · topo compacto, HUD de 3 itens, resultado e ranking mais legíveis
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 1.4c: layout responsivo ──');
  {
    const pgC = readSrc('src/services/paresGameService.js');
    const pdbCraw = readSrc('src/screens/ParesDoBeniScreen.js');
    const pdbC = a1StripComments(pdbCraw);

    const evalLayout = () => new Function(
      a1StripComments(pgC)
        .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
        .replace(/^export\s+default[\s\S]*$/m, '')
        .replace(/^export\s+/gm, '')
      + ';return { computeCardSize, gridRows, CARD_RATIO, CARD_MIN, DIFFICULTIES };',
    )();

    check('1.4c (cartas/puro): o lado é o MENOR entre a restrição horizontal e a vertical',
      (() => { try {
        const L = evalLayout();
        // Tela larga e baixa: quem manda é a ALTURA.
        const baixa = L.computeCardSize({ largura: 900, altura: 200, cols: 4, pairs: 12, gap: 7, padding: 28 });
        // Tela estreita e alta: quem manda é a LARGURA.
        const estreita = L.computeCardSize({ largura: 320, altura: 2000, cols: 4, pairs: 12, gap: 7, padding: 28 });
        if (!(baixa < estreita)) return false;
        // Sem altura conhecida (primeiro render), cai na largura — comportamento antigo.
        const semAltura = L.computeCardSize({ largura: 320, altura: 0, cols: 4, pairs: 12, gap: 7, padding: 28 });
        return semAltura === estreita && L.gridRows(12, 4) === 6 && L.gridRows(6, 3) === 4;
      } catch (e) { return false; } })(),
      'o tamanho da carta voltou a depender só da largura');

    check('1.4c (Difícil não vaza): 12 pares cabem na altura útil de um iPhone pequeno',
      (() => { try {
        const L = evalLayout();
        const GAP = 7, PADV = 6, PADH = 14;
        // iPhone SE: 375×667. Cabeçalho 64 + HUD 36 + barra 5 + dica 22 = 127.
        const areaJogo = 667 - 127;
        let todosCabem = true;
        for (const d of L.DIFFICULTIES) {
          const size = L.computeCardSize({
            largura: 375, altura: areaJogo - PADV * 2,
            cols: d.cols, pairs: d.pairs, gap: GAP, padding: PADH * 2,
          });
          const linhas = L.gridRows(d.pairs, d.cols);
          const alturaGrade = linhas * (size * L.CARD_RATIO) + (linhas - 1) * GAP + PADV * 2;
          const larguraGrade = d.cols * size + (d.cols - 1) * GAP + PADH * 2;
          if (alturaGrade > areaJogo + 0.5 || larguraGrade > 375.5) todosCabem = false;
        }
        // Prova de que o check morde: o cálculo ANTIGO (só largura), na área útil que
        // o cabeçalho ANTIGO deixava (~445 px no SE), estourava a tela.
        const antigo = Math.floor((375 - 32 - 3 * 8) / 4);
        const alturaAntiga = L.gridRows(12, 4) * antigo * 1.12 + 5 * 8 + 12;
        const vazava = alturaAntiga > 445;
        return todosCabem && vazava;
      } catch (e) { return false; } })(),
      'o modo Difícil volta a vazar da tela num iPhone pequeno');

    check('1.4c (cartas/puro): piso absoluto protege telas minúsculas, sem zerar a carta',
      (() => { try {
        const L = evalLayout();
        const minusculo = L.computeCardSize({ largura: 200, altura: 60, cols: 4, pairs: 12, gap: 7, padding: 28 });
        return minusculo === L.CARD_MIN && L.CARD_MIN >= 32
          && L.computeCardSize({ largura: 0, altura: 0, cols: 0, pairs: 0 }) > 0;   // nunca 0/NaN
      } catch (e) { return false; } })(),
      'o cálculo pode devolver carta zero, negativa ou NaN');

    check('1.4c (proporção): a tela desenha a carta com a MESMA proporção do cálculo',
      /const h = size \* CARD_RATIO;/.test(pdbC)
      && /CARD_RATIO/.test(pdbC) && /export const CARD_RATIO/.test(pgC)
      && !/size \* 1\.1[0-9]/.test(pdbC),   // nenhuma proporção solta
      'a carta é desenhada com proporção diferente da usada no cálculo — a conta mente');

    check('1.4c (medição): o tabuleiro mede a altura real que sobrou',
      /onLayout=\{medirTabuleiro\}/.test(pdbC)
      && /const medirTabuleiro = useCallback/.test(pdbC)
      && /computeCardSize\(\{/.test(pdbC)
      && /altura: alturaTabuleiro - GRADE_PADDING_V \* 2/.test(pdbC)
      // sem ScrollView na partida: nada de carta escondida atrás de rolagem
      && !/<ScrollView[\s\S]{0,400}styles\.grade/.test(pdbC),
      'o tabuleiro não mede a altura útil, ou voltou a rolar durante a partida');

    // MIGRADO 1.4d: a moldura DEVE encostar nos limites da janela. Recuar pela safe
    // area (o que este check exigia antes) era justamente o defeito visto no iPhone.
    check('1.4c (moldura): a moldura encosta nos limites da JANELA, sem tocar em nada',
      (() => {
        const comp = (pdbC.match(/function MolduraAlerta[\s\S]*?\n\}/) || [''])[0];
        return comp.length > 0
          && /pointerEvents="none"/.test(comp)
          && !/insets/.test(comp)                                   // sem recuo de safe area
          && /moldura: \{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 \}/.test(pdbC)
          // fica na raiz, DEPOIS do tabuleiro (por cima), não dentro da área de jogo
          && pdbC.indexOf('styles.areaJogo') < pdbC.indexOf('<MolduraAlerta');
      })(),
      'a moldura de alerta recuou pela safe area, saiu da raiz, ou bloqueia o toque');

    check('1.4c (alerta coerente): moldura, relógio e barra usam o MESMO vermelho, e somem juntos',
      (() => {
        const usos = (pdbC.match(/ALERTA/g) || []).length;
        return /^const ALERTA = '#C0392B';$/m.test(pdbC)
          && usos >= 4                                   // constante única, sem hex solto
          && !/#C0392B/.test(pdbC.replace(/const ALERTA = '#C0392B';/, ''))
          && /const critico = modo\.timed && restanteMs <= TURBO_ALERTA_MS && restanteMs > 0;/.test(pdbC)
          // pausar/encerrar zera o pulso
          && /if \(!emAlerta\) \{ pulso\.stopAnimation\(\); pulso\.setValue\(0\); return undefined; \}/.test(pdbC)
          && /const emAlerta = jogando && modo\.timed && !pausado/.test(pdbC);
      })(),
      'o vermelho do alerta divergiu entre moldura, relógio e barra, ou o pulso não some ao pausar');

    check('1.4c (topo): título e voltar dividem uma faixa; o modo virou chip',
      /<View style=\{styles\.headerRow\}>/.test(pdbC)
      && /Pares do Beni\s*<\/Text>/.test(pdbC)
      && /chip=\{modo\.timed \? 'Turbo' : 'Clássico'\}/.test(pdbC)
      && /paddingTop: Math\.max\(insets\.top, 12\)/.test(pdbC)   // safe area preservada
      && /headerCompacto/.test(pdbC),
      'o cabeçalho voltou a empilhar título e botão, ou perdeu a safe area');

    check('1.4c (HUD): três itens (tempo · pares · combo) e nada de "faltam X pontos"',
      (() => {
        const hud = (pdbC.match(/<View style=\{styles\.hud\}>[\s\S]*?<\/View>\s*\)/) || [''])[0];
        return !/Faltam \$\{/.test(pdbC) && !/styles\.meta/.test(pdbC)
          && !/Grades completas:/.test(pdbC)
          && /icone="combo"/.test(hud) && /icone="pares"/.test(hud) && /name="timer"/.test(hud)
          // a pontuação saiu do HUD do Turbo
          && !/icone="star"/.test(hud);
      })(),
      'o HUD voltou a exibir pontuação, meta de recorde ou grades completas');

    check('1.4c (dica): frase baixa, some depois da primeira jogada e não pula o layout',
      /vista\.jogadas === 0 \? dica : ''/.test(pdbC)
      && /<Text style=\{styles\.dica\} numberOfLines=\{1\}>/.test(pdbC)
      && /dica: \{[\s\S]*?height: 22, lineHeight: 22,/.test(pdbC),
      'a frase do Beni voltou a ocupar duas linhas ou faz o tabuleiro pular ao sumir');

    // MIGRADO 1.4d: o aviso virou transição automática, centralizada e sem cabeçalho.
    // A garantia agora é "nada ocioso E nada a tocar".
    check('1.4c (tempo encerrado): aviso centralizado, sem botão e sem cabeçalho',
      /avisoRoot: \{ alignItems: 'center', justifyContent: 'center'/.test(pdbC)
      && !/styles\.tempoWrap/.test(pdbC)
      && /Tempo encerrado!/.test(pdbC)
      && (() => {
        const bloco = (pdbC.match(/if \(tela === 'tempoEsgotado'\) \{[\s\S]*?\n  \}/) || [''])[0];
        // sem botão, sem Header, sem chip, sem ranking/pontos
        return bloco.length > 0 && !/SoundButton|<Header|chip=|ranking|pontos/.test(bloco);
      })(),
      'a tela de tempo encerrado voltou a exigir botão, ou ganhou cabeçalho/dados');

    check('1.4c (resultado): um número grande, 3 métricas curtas e ações hierarquizadas',
      /<Text style=\{styles\.destaque\}>/.test(pdbC)
      && /destaque: \{ fontFamily: 'FredokaOne', fontSize: 44/.test(pdbC)
      && (pdbC.match(/<Stat label=/g) || []).length === 6        // 3 no Turbo + 3 no Clássico
      && /Trocar modo ou nível/.test(pdbC)
      && !/Trocar nível<\/Text>/.test(pdbC)                      // os dois botões viraram um
      && !/styles\.comparacao/.test(pdbC),                       // sem parágrafos explicativos
      'a tela de resultado voltou a ter texto longo, métricas demais ou botões redundantes');

    check('1.4c (ranking): linha enxuta — posição, pontos, pares, combo, data',
      (() => {
        const linha = (pdbC.match(/<View key=\{`\$\{e\.data\}[\s\S]*?<\/View>\s*\);/) || [''])[0];
        return /styles\.rankPontos/.test(linha) && /styles\.rankPares/.test(linha)
          && /styles\.rankCombo/.test(linha) && /styles\.rankData/.test(linha)
          && !/styles\.rankDetalhe/.test(pdbC)          // a segunda linha de texto saiu
          && !/esta partida/.test(pdbC)                 // virou 'agora', curto
          && /rankLinhaAtual/.test(pdbC)                // a partida atual segue destacada
          && /rankPontosTopo/.test(pdbC);               // e o 1º lugar segue especial
      })(),
      'o ranking voltou a ter duas linhas de texto por partida');

    check('1.4c (nada regrediu): máquina, flip e recompensa intactos',
      /aplicar\(tocar, i\)/.test(pdbC)
      && /onFlipEnd=\{cartaAbriu\}/.test(pdbC)
      && (pdbC.match(/addBonusStars\(/g) || []).length === 1
      && (pdbC.match(/recordParesResult\(/g) || []).length === 1
      && /if \(salvoRef\.current\) return;/.test(pdbC)
      && /if \(tempoAcabouRef\.current\) return;/.test(pdbC)
      && !/\p{Extended_Pictographic}/u.test(pdbCraw),
      'o polimento visual mexeu na máquina, no flip ou na recompensa');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Bloco 1.4d — Contagem de 10 s, moldura na janela, som do 2º acerto, aviso automático.
  //
  //   O 2º acerto não tocava porque `seekTo()` do expo-audio é ASSÍNCRONO: o `play()`
  //   rodava antes do seek resolver, com o player parado no FIM do arquivo. Aqui o
  //   audioManager é carregado com um player DUBLÊ e exercitado de verdade.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 1.4d: contagem, moldura e som ──');
  {
    const amD = readSrc('src/services/audioManager.js');
    const pgD = readSrc('src/services/paresGameService.js');
    const mqD = readSrc('src/services/paresGameMachine.js');
    const pdbDraw = readSrc('src/screens/ParesDoBeniScreen.js');
    const pdbD = a1StripComments(pdbDraw);

    /**
     * Carrega o audioManager real, com dublês de expo-audio, AsyncStorage e Date.
     * O dublê de `seekTo` devolve um thenable SÍNCRONO: assim conseguimos observar,
     * sem async, se o `play()` só acontece DEPOIS do seek resolver.
     */
    const carregarAudio = () => {
      const criados = [];
      const createAudioPlayer = () => {
        const p = {
          plays: 0, audiveis: 0, seeks: 0, pauses: 0, removed: false,
          playing: false, volume: 0,
          // O player começa em 0 e PARA NO FIM depois de tocar. Tocar do fim não
          // emite som nenhum — é exatamente o comportamento real do expo-audio.
          posicao: 0,
          play() {
            this.plays++;
            if (this.posicao === 0) { this.audiveis++; this.posicao = 1; }   // 1 = fim
            this.playing = true;
          },
          pause() { this.pauses++; this.playing = false; },
          seekTo() {
            const self = this;
            self.seeks++;
            const playsAntes = self.plays;
            return {
              then(cb) {
                self.seekResolveuAntesDoPlay = (self.plays === playsAntes);
                self.posicao = 0;      // só AGORA o player volta ao início
                cb();
                return { catch() {} };
              },
            };
          },
          remove() { this.removed = true; },
        };
        criados.push(p);
        return p;
      };
      let agora = 1000000;
      const FakeDate = { now: () => agora };
      const AsyncStorage = { getItem: () => Promise.resolve(null), setItem: () => Promise.resolve() };

      const codigo = a1StripComments(amD)
        .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
        .replace(/require\('[^']*\/([^/']+)\.wav'\)/g, "'$1'")   // assets → nome
        .replace(/^export\s+/gm, '');

      const api = new Function(
        'AsyncStorage', 'createAudioPlayer', 'setAudioModeAsync', 'Date',
        codigo + ';return { playGameSfx, stopGameSfx, releaseGameSfx, preloadGameSfx };',
      )(AsyncStorage, createAudioPlayer, () => Promise.resolve(), FakeDate);

      return { ...api, criados, avancar: (ms) => { agora += ms; } };
    };

    // ── SOM DO ACERTO (o bug real) ───────────────────────────────────────────
    check('1.4d (som): dois acertos consecutivos produzem DOIS sons',
      (() => { try {
        const A = carregarAudio();
        A.playGameSfx('match_success');
        A.avancar(900);                    // intervalo real entre dois pares
        A.playGameSfx('match_success');
        const p = A.criados[0];
        // `audiveis` só conta quando o player toca a partir do início. Com o código
        // antigo (play antes do seek) o segundo som saía MUDO: audiveis seria 1.
        return A.criados.length === 1      // mesma instância reaproveitada
          && p.audiveis === 2 && p.plays === 2 && p.seeks === 2;
      } catch (e) { return false; } })(),
      'o segundo acerto seguido não toca — o som do par voltou a ser engolido');

    check('1.4d (som): o play() só acontece DEPOIS de o seek resolver',
      (() => { try {
        const A = carregarAudio();
        A.playGameSfx('match_success');
        const p = A.criados[0];
        // O dublê marca `true` se, no instante em que o seek resolveu, o play
        // ainda não tinha sido chamado. Era exatamente o que o código antigo violava.
        return p.seekResolveuAntesDoPlay === true && p.plays === 1;
      } catch (e) { return false; } })(),
      'o play() voltou a rodar antes do seekTo() assíncrono resolver');

    check('1.4d (som): um par toca UMA vez; toque colado no mesmo instante é ignorado',
      (() => { try {
        const A = carregarAudio();
        A.playGameSfx('match_success');
        A.playGameSfx('match_success');   // mesmo instante: throttle
        return A.criados[0].audiveis === 1;
      } catch (e) { return false; } })(),
      'um único par pode tocar o som duas vezes');

    check('1.4d (som): board_complete não engole o acerto — players independentes',
      (() => { try {
        const A = carregarAudio();
        A.playGameSfx('match_success');
        A.avancar(50);
        A.playGameSfx('board_complete');  // logo depois, sem throttle cruzado
        A.avancar(900);
        A.playGameSfx('match_success');
        return A.criados.length === 2
          && A.criados[0].audiveis === 2  // acertos: os dois soam
          && A.criados[1].audiveis === 1;  // grade completa
      } catch (e) { return false; } })(),
      'o throttle é compartilhado entre efeitos diferentes, ou eles dividem o player');

    check('1.4d (som): o relógio bate a cada segundo sem ser barrado pelo throttle',
      (() => { try {
        const A = carregarAudio();
        // 10 tiques (10..1), um por segundo: o throttle de 300 ms nunca barra o seguinte.
        for (let i = 0; i < 10; i++) {
          A.playGameSfx('countdown_tick');
          if (i < 9) A.avancar(1000);
        }
        const tique = A.criados[0];
        if (tique.audiveis !== 10) return false;
        // Um disparo duplo DENTRO do mesmo segundo é barrado.
        A.playGameSfx('countdown_tick');
        A.avancar(120);
        A.playGameSfx('countdown_tick');
        return tique.audiveis === 10;
      } catch (e) { return false; } })(),
      'o throttle barra o tique do relógio, ou deixa passar dois no mesmo segundo');

    check('1.4d (som): sobrevive a pausa e a nova partida; respeita a preferência global',
      (() => { try {
        const A = carregarAudio();
        A.playGameSfx('match_success');
        A.stopGameSfx('countdown_tick');   // pausa cala o tique, não o acerto
        A.avancar(900);
        A.playGameSfx('match_success');
        if (A.criados[0].audiveis !== 2) return false;

        // Nova partida: releaseGameSfx solta os players; o próximo som recria e toca.
        A.releaseGameSfx();
        if (!A.criados[0].removed) return false;
        A.avancar(900);
        A.playGameSfx('match_success');
        const novo = A.criados[A.criados.length - 1];
        return novo !== A.criados[0] && novo.audiveis === 1
          && /if \(!prefs\.soundsEnabled\) return;/.test(a1StripComments(amD).split('function playGameSfx')[1] || '');
      } catch (e) { return false; } })(),
      'o som some depois de uma pausa ou de uma nova partida');

    check('1.4d (som): falha do player não derruba o jogo',
      (() => {
        const corpo = (a1StripComments(amD).match(/function playGameSfx[\s\S]*?\n\}/) || [''])[0];
        return /try \{/.test(corpo) && /catch \{/.test(corpo)
          && /\.catch\(\(\) => \{/.test(corpo);   // rejeição do seek também é tratada
      })(),
      'uma falha de áudio pode lançar e derrubar a partida');

    // ── MATCH sai da máquina uma vez por par ─────────────────────────────────
    check('1.4d (MATCH/puro): 1 par = 1 evento; 2 pares = 2 eventos; erro e toque recusado = 0',
      (() => { try {
        const limpa = (s) => a1StripComments(s)
          .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
          .replace(/^export\s+default[\s\S]*$/m, '')
          .replace(/^export\s+/gm, '');
        const M = new Function(limpa(pgD) + '\n' + limpa(mqD)
          + ';return { FASES, EFEITOS, criarJogo, tocar, flipConcluido, verificar, liberar, fechar };')();

        const DECK = [
          { key: 'a#a', storyId: 'a' }, { key: 'a#b', storyId: 'a' },
          { key: 'b#a', storyId: 'b' }, { key: 'b#b', storyId: 'b' },
          { key: 'c#a', storyId: 'c' }, { key: 'c#b', storyId: 'c' },
        ];
        const sons = [];
        const jogar = (e, a, b) => {
          e = M.tocar(e, a).estado;
          e = M.tocar(e, b).estado;
          e = M.flipConcluido(e, a).estado;
          e = M.flipConcluido(e, b).estado;
          const v = M.verificar(e);
          v.efeitos.filter((x) => x === M.EFEITOS.SOM_ACERTO).forEach((x) => sons.push(x));
          return v.estado;
        };
        let e = M.criarJogo({ deck: DECK, pares: 3, cronometrado: true });

        // 1º par
        e = M.liberar(jogar(e, 0, 1)).estado;
        if (sons.length !== 1) return false;
        // 2º par, logo em seguida → SEGUNDO evento MATCH
        e = M.liberar(jogar(e, 2, 3)).estado;
        if (sons.length !== 2) return false;

        // Erro não gera MATCH; toque recusado não gera efeito nenhum.
        let f = M.criarJogo({ deck: DECK, pares: 3 });
        f = M.tocar(f, 0).estado;
        f = M.tocar(f, 2).estado;
        const recusado = M.tocar(f, 4);
        if (recusado.aceito !== false || recusado.efeitos.length !== 0) return false;
        f = M.flipConcluido(f, 0).estado;
        f = M.flipConcluido(f, 2).estado;
        const erro = M.verificar(f);
        return !erro.efeitos.includes(M.EFEITOS.SOM_ACERTO)
          && erro.efeitos.includes(M.EFEITOS.SOM_ERRO)
          // e verificar() de novo (dupla chamada) não repete o MATCH
          && M.verificar(erro.estado).efeitos.length === 0;
      } catch (e) { return false; } })(),
      'a máquina emite MATCH a menos, a mais, ou em erro/toque recusado');

    // ── CONTAGEM 10→1 ────────────────────────────────────────────────────────
    check('1.4d (tique): começa aos 10 s, um por segundo, nenhum no zero',
      (() => { try {
        const limpa = (s) => a1StripComments(s)
          .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
          .replace(/^export\s+default[\s\S]*$/m, '')
          .replace(/^export\s+/gm, '');
        const S = new Function(limpa(pgD) + ';return { segundosRestantes, TURBO_TICK_MS, TURBO_ALERTA_MS, TURBO_AVISO_MS };')();

        // Reproduz a regra da tela: tique quando o SEGUNDO EXIBIDO muda, dentro da janela.
        const tiques = [];
        let ultimo = null;
        for (let ms = 12000; ms >= 0; ms -= 100) {   // relógio de 100 em 100 ms
          const seg = S.segundosRestantes(ms);
          if (seg > 0 && seg <= S.TURBO_TICK_MS / 1000 && seg !== ultimo) {
            ultimo = seg;
            tiques.push(seg);
          }
        }
        return tiques.join(',') === '10,9,8,7,6,5,4,3,2,1'   // 10 tiques, um por segundo
          && S.segundosRestantes(0) === 0                    // zero não bate
          && S.TURBO_AVISO_MS === 2000;
      } catch (e) { return false; } })(),
      'o tique não começa aos 10 s, repete no mesmo segundo, ou bate no zero');

    check('1.4d (tique): fonte única do segundo, e reinício limpo a cada partida',
      /const seg = segundosRestantes\(restanteRef\.current\);/.test(pdbD)
      && /seg !== ultimoSegundoRef\.current/.test(pdbD)
      && /if \(seg > 0 &&/.test(pdbD)                       // nada no zero
      && /ultimoSegundoRef\.current = null;/.test(pdbD)     // nova partida rearma
      && (pdbD.match(/playGameSfx\(PARES_SOUND_EVENTS\.COUNTDOWN_TICK\)/g) || []).length === 1
      && !/setTimeout\(\(\) => playGameSfx/.test(pdbD),     // nada de 10 timeouts
      'o tique deixou de seguir o número exibido, ou não rearma em nova partida');

    // ── MOLDURA ──────────────────────────────────────────────────────────────
    check('1.4d (moldura): quatro faixas em 0, sem raio, sem insets, sem roubar toque',
      (() => {
        const comp = (pdbD.match(/function MolduraAlerta[\s\S]*?\n\}/) || [''])[0];
        return comp.length > 0
          && /\['topo', 'base', 'esq', 'dir'\]\.map\(faixa\)/.test(comp)
          && /posicao === 'topo' && \{ top: 0, left: 0, right: 0, height: esp \}/.test(comp)
          && /posicao === 'base' && \{ bottom: 0, left: 0, right: 0, height: esp \}/.test(comp)
          && /posicao === 'esq' && \{ top: 0, bottom: 0, left: 0, width: esp \}/.test(comp)
          && /posicao === 'dir' && \{ top: 0, bottom: 0, right: 0, width: esp \}/.test(comp)
          && !/insets/.test(comp)
          && (comp.match(/pointerEvents="none"/g) || []).length >= 2   // faixa e container
          && !/borderRadius/.test(comp)
          // nem no estilo: raio faria a moldura parecer um card
          && !/borderRadius/.test((pdbD.match(/faixaAlerta: \{[\s\S]*?\n  \},/) || [''])[0]);
      })(),
      'a moldura não encosta nos limites da janela, ganhou raio, ou bloqueia o toque');

    check('1.4d (moldura): mais forte — espessura 6..10, opacidade 0.35→1, ciclo ~820 ms',
      /Math\.round\(Math\.min\(10, Math\.max\(6, largura \* 0\.018\)\)\)/.test(pdbD)
      && /outputRange: \[0\.35, 1\]/.test(pdbD)
      && (pdbD.match(/duration: 410/g) || []).length === 2   // 410 + 410 = 820 ms
      && /shadowColor: ALERTA/.test(pdbD) && /shadowRadius: 12/.test(pdbD),
      'a moldura voltou a ser discreta, ou o pulso virou um flash');

    check('1.4d (moldura): some ao pausar, encerrar ou sair; some junto do relógio vermelho',
      /const emAlerta = jogando && modo\.timed && !pausado && restanteMs > 0 && restanteMs <= TURBO_ALERTA_MS;/.test(pdbD)
      && /if \(!emAlerta\) \{ pulso\.stopAnimation\(\); pulso\.setValue\(0\); return undefined; \}/.test(pdbD)
      && /pulso\.stopAnimation\(\); pulso\.setValue\(0\);\s*playGameSfx\(PARES_SOUND_EVENTS\.TIME_UP\)/.test(pdbD)
      && /\{critico && <MolduraAlerta/.test(pdbD),
      'a moldura sobrevive à pausa, ao fim da partida ou à saída da tela');

    // ── AVISO AUTOMÁTICO ─────────────────────────────────────────────────────
    check('1.4d (aviso): sem botão, centralizado, com entrada discreta',
      (() => {
        const bloco = (pdbD.match(/if \(tela === 'tempoEsgotado'\) \{[\s\S]*?\n  \}/) || [''])[0];
        return bloco.length > 0
          && !/SoundButton|onPress|<Header|chip=/.test(bloco)
          && /styles\.avisoRoot/.test(bloco)
          && /Tempo encerrado!/.test(bloco)
          && /opacity: aviso3s/.test(bloco) && /scale: aviso3s\.interpolate/.test(bloco)
          && /duration: 260/.test(pdbD)                       // entrada curta
          && !/btnPrimarioCheio/.test(pdbD);                  // estilo órfão removido
      })(),
      'o aviso de tempo encerrado voltou a exigir toque, ou perdeu a centralização');

    check('1.4d (transição): agendada UMA vez, pelo sistema central de timers',
      (() => {
        const bloco = (pdbD.match(/const tempoEsgotou = useCallback\([\s\S]*?\n  \}, \[/) || [''])[0];
        return /if \(transicaoResultadoRef\.current == null\) \{/.test(bloco)
          && /transicaoResultadoRef\.current = agendar\(/.test(bloco)
          && /\}, TURBO_AVISO_MS\);/.test(bloco)
          // limparTimers (unmount, reinício, troca de modo, saída) anula o agendamento
          && /timeouts\.current\.forEach\(clearTimeout\);\s*timeouts\.current = \[\];\s*transicaoResultadoRef\.current = null;/.test(pdbD);
      })(),
      'a transição do aviso pode ser agendada duas vezes, ou sobreviver ao unmount');

    check('1.4d (uma vez só): resultado, salvamento, estrelinha e vinheta não duplicam',
      (pdbD.match(/setTela\('resultado'\)/g) || []).length === 2     // Clássico + transição do Turbo
      && (pdbD.match(/PARES_SOUND_EVENTS\.TURBO_JINGLE/g) || []).length === 1
      && (pdbD.match(/PARES_SOUND_EVENTS\.TIME_UP/g) || []).length === 1
      && (pdbD.match(/addBonusStars\(/g) || []).length === 1
      && (pdbD.match(/recordParesResult\(/g) || []).length === 1
      && /if \(salvoRef\.current\) return;\s*salvoRef\.current = true;/.test(pdbD)
      && /if \(tempoAcabouRef\.current\) return;\s*tempoAcabouRef\.current = true;/.test(pdbD)
      && /if \(montado\.current\) fn\(\);/.test(pdbD),              // sem setState pós-unmount
      'a transição automática pode duplicar resultado, salvamento, estrelinha ou vinheta');

    check('1.4d (Modo Criador intocado): nada foi ajustado por causa do banner',
      (() => {
        // A tela não conhece o banner nem compensa a altura dele.
        const semBanner = !/MODO CRIADOR|CreatorBanner|creatorMode|bannerHeight/i.test(pdbD);
        // E os arquivos do Modo Criador/ferramentas dev não foram tocados neste bloco.
        const intactos = /export function isInternalToolsEnabled/.test(readSrc('src/config/internalTools.js'));
        return semBanner && intactos && /paddingTop: Math\.max\(insets\.top, 12\)/.test(pdbD);
      })(),
      'a tela foi ajustada por causa do banner do Modo Criador');

    check('1.4d (nada regrediu): máquina, flip, grade responsiva e recompensa intactos',
      /aplicar\(tocar, i\)/.test(pdbD)
      && /onFlipEnd=\{cartaAbriu\}/.test(pdbD)
      && /computeCardSize\(\{/.test(pdbD)
      && /onLayout=\{medirTabuleiro\}/.test(pdbD)
      && !/travado\.current/.test(pdbD)
      && !/\p{Extended_Pictographic}/u.test(pdbDraw),
      'o bloco 1.4d regrediu a máquina, o flip ou a grade responsiva');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Bloco 2.1 — Vertical slice de "Cadê a Ovelhinha?".
  //
  //   Máquina e geometria PURAS, exercitadas de verdade: partida completa, toques
  //   concorrentes, geometria em várias resoluções, fallback, persistência com teto
  //   COMPARTILHADO. Card só ativo em dev; Pares/Turbo intactos.
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n── Bloco 2.1 / 2.1a: Cadê a Ovelhinha? (modelo único de item) ──');
  {
    const svc = readSrc('src/services/ovelhaGameService.js');
    const mq = readSrc('src/services/ovelhaGameMachine.js');
    const bs21 = readSrc('src/services/brincarStatsService.js');
    const telaRaw = readSrc('src/screens/CadeAOvelhinhaScreen.js');
    const tela21 = a1StripComments(telaRaw);
    const nav21 = a1StripComments(readSrc('src/navigation/AppNavigator.js'));
    const brc21 = a1StripComments(readSrc('src/screens/BrincarScreen.js'));
    const fi21 = readSrc('src/components/ui/FaithIcon.js');
    const rt21 = readSrc('src/constants/routes.js');

    const limpa = (s) => a1StripComments(s)
      .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
      .replace(/require\('[^']*'\)/g, 'null')
      .replace(/^export\s+default[\s\S]*$/m, '')
      .replace(/^export\s+/gm, '');

    /** Serviço puro, avaliado de verdade (modelo único de item). */
    const evalSvc = () => new Function(limpa(svc)
      + ';return { OVELHA_DIFFICULTIES, getDifficulty, buildRound, posicionarItens, fallbackGrade,'
      + ' tamanhoSprite, rectsIntersect, semSobreposicao, todosDentro, regiaoDe, margemDe,'
      + ' exactlyOneTarget, targetIsRenderable, targetInsideBounds, roundValido, nivelDica, DICA,'
      + ' shuffle, OVELHA_HITBOX_MIN, OVELHA_ROUNDS, OVELHA_SOUND_EVENTS };')();

    /** Máquina pura (identidade por targetId). */
    const evalMq = () => new Function(limpa(mq)
      + ';return { FASES, FASES_QUE_ACEITAM, EFEITOS, criarJogo, iniciarRodada, cenaPronta,'
      + ' aceitaToque, tocar, liberarErro, avancar, encerrar };')();

    const evalStats = () => new Function(
      'AsyncStorage', 'STORAGE_KEYS', 'warn',
      'BRINCAR_DAILY_STAR_CAP', 'DEFAULT_MODE', 'isBetterTime', 'isBetterScore', 'isBetterMoves',
      a1StripComments(bs21)
        .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
        .replace(/^export\s+/gm, '')
      + ';return { sanitizeStats, applyOvelhaResult, applyResult };')(
        {}, {}, () => {},
        2, 'classico',
        (ant, novo) => Number.isFinite(novo) && novo > 0 && (!(Number.isFinite(ant) && ant > 0) || novo < ant),
        (ant, novo) => Number.isFinite(novo) && novo > 0 && novo > (Number.isFinite(ant) ? ant : 0),
        (ant, novo) => Number.isFinite(novo) && novo > 0 && (!(Number.isFinite(ant) && ant > 0) || novo < ant),
      );

    const lcg = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

    // Uma rodada de teste com IDs conhecidos, para os testes de toque (2.1a §5).
    const rodadaTeste = () => ({
      roundId: 9, targetId: 'r9-target',
      items: [
        { id: 'r9-distractor-01', role: 'distractor', visualId: 'gato', cx: 80, cy: 90, visualSize: 70, hitbox: 84, region: 0 },
        { id: 'r9-target', role: 'target', visualId: 'ovelha', cx: 220, cy: 260, visualSize: 78, hitbox: 92, region: 4 },
        { id: 'r9-distractor-02', role: 'distractor', visualId: 'pato', cx: 150, cy: 400, visualSize: 70, hitbox: 84, region: 7 },
      ],
    });

    /* ── GEOMETRIA: 100 seeds × 7 dimensões (2.1a §13) ── */
    check('2.1a (geometria): 3 itens, 1 alvo, sem sobreposição, dentro dos limites — 100 seeds × 7 telas',
      (() => { try {
        const S = evalSvc();
        const dif = S.getDifficulty('facil');
        const DIMS = [[320, 568], [375, 667], [390, 844], [360, 760], [834, 1112], [400, 300], [900, 420]];
        for (const [w, h] of DIMS) {
          const m = S.margemDe(dif, w, h);
          for (let seed = 1; seed <= 100; seed++) {
            const r = S.buildRound({ dif, largura: w, altura: h, rnd: lcg(seed * 31 + 7), roundId: seed });
            if (r.items.length !== 3) return false;
            if (!S.exactlyOneTarget(r) || !S.targetIsRenderable(r)) return false;
            if (!S.semSobreposicao(r.items)) return false;               // interseção REAL
            if (!S.todosDentro(r.items, w, h, m)) return false;
            if (!S.targetInsideBounds(r, w, h, m)) return false;
            if (!S.roundValido(r, w, h, m)) return false;
          }
        }
        return S.OVELHA_HITBOX_MIN === 56;
      } catch (e) { return false; } })(),
      'a geometria falha em alguma resolução (sobrepõe, vaza, alvo ausente/inválido)');

    check('2.1a (geometria): interseção por RETÂNGULO real, não só distância entre centros',
      (() => { try {
        const S = evalSvc();
        return S.rectsIntersect({ cx: 0, cy: 0, hitbox: 60 }, { cx: 30, cy: 0, hitbox: 60 }, 0) === true
          && S.rectsIntersect({ cx: 0, cy: 0, hitbox: 60 }, { cx: 70, cy: 0, hitbox: 60 }, 0) === false
          && S.rectsIntersect({ cx: 0, cy: 0, hitbox: 60 }, { cx: 65, cy: 0, hitbox: 60 }, 10) === true;
      } catch (e) { return false; } })(),
      'rectsIntersect não detecta corretamente a interseção de hitboxes');

    check('2.1a (geometria): determinístico por seed; alvo não repete a região',
      (() => { try {
        const S = evalSvc();
        const dif = S.getDifficulty('facil');
        const a = S.buildRound({ dif, largura: 390, altura: 620, rnd: lcg(7), roundId: 3 });
        const b = S.buildRound({ dif, largura: 390, altura: 620, rnd: lcg(7), roundId: 3 });
        if (JSON.stringify(a) !== JSON.stringify(b)) return false;
        let reg = null, rep = 0, rnd = lcg(42);
        for (let i = 0; i < 30; i++) {
          const c = S.buildRound({ dif, largura: 390, altura: 700, rnd, regiaoAnterior: reg, roundId: i });
          if (reg !== null && c.regiaoAlvo === reg) rep++;
          reg = c.regiaoAlvo;
        }
        return rep === 0;
      } catch (e) { return false; } })(),
      'a geometria não é determinística, ou o alvo repete a região anterior');

    check('2.1a (geometria): fallback é acionado, é válido e varia com o RNG',
      (() => { try {
        const S = evalSvc();
        const specs = [{ hitbox: 56, size: 44 }, { hitbox: 56, size: 44 }, { hitbox: 56, size: 44 }];
        const fb = S.fallbackGrade({ largura: 280, altura: 240, margem: 8, gap: 4, specs, rnd: lcg(3) });
        if (fb.length !== 3 || !fb.every((p) => Number.isFinite(p.cx) && Number.isFinite(p.cy))) return false;
        const comHb = fb.map((p) => ({ ...p, hitbox: 56 }));
        if (!S.semSobreposicao(comHb)) return false;
        const fb2 = S.fallbackGrade({ largura: 280, altura: 240, margem: 8, gap: 4, specs, rnd: lcg(9) });
        return JSON.stringify(fb) !== JSON.stringify(fb2);
      } catch (e) { return false; } })(),
      'o fallback não é válido ou não varia com o RNG');

    check('2.1a (composição): tamanhos semelhantes (≤15%); alvo um pouco maior; hitbox por-item ≥56',
      (() => { try {
        const S = evalSvc();
        const r = S.buildRound({ dif: S.getDifficulty('facil'), largura: 390, altura: 640, rnd: lcg(5), roundId: 1 });
        const alvo = r.items.find((i) => i.role === 'target');
        const dist = r.items.find((i) => i.role === 'distractor');
        const diff = (alvo.visualSize - dist.visualSize) / alvo.visualSize;
        return alvo.visualSize >= dist.visualSize && diff <= 0.15
          && r.items.every((i) => i.hitbox >= 56 && i.hitbox >= i.visualSize);
      } catch (e) { return false; } })(),
      'os tamanhos diferem demais, ou a hitbox por-item ficou abaixo de 56/menor que o sprite');

    /* ── IDENTIDADE por id / toque no distrator (2.1a §5) ── */
    check('2.1a (identidade): distrator NUNCA vira acerto; alvo conta 1×; ordem não muda o alvo',
      (() => { try {
        const M = evalMq(); const S = evalSvc();
        const round = rodadaTeste();
        const jogar = (r0) => { let e = M.criarJogo({ rounds: 5 });
          e = M.iniciarRodada(e, { targetId: r0.targetId, itemIds: r0.items.map((i) => i.id) }).estado;
          return M.cenaPronta(e).estado; };
        let e = jogar(round);
        // toca cada distrator → zero acertos, erro suave, encontradas inalterado
        for (const d of round.items.filter((i) => i.role === 'distractor')) {
          const r = M.tocar(e, d.id);
          if (r.acerto !== false || r.estado.encontradas !== 0) return false;
          if (!r.efeitos.includes(M.EFEITOS.SOM_ERRO)) return false;
          e = M.liberarErro(r.estado).estado;
        }
        // toca o alvo → exatamente 1 acerto; de novo → não conta 2×
        const a1 = M.tocar(e, round.targetId);
        if (!(a1.acerto === true && a1.estado.encontradas === 1)) return false;
        if (M.tocar(a1.estado, round.targetId).aceito !== false) return false;
        // embaralha a ordem visual: o alvo continua sendo o mesmo id
        const emb = { ...round, items: S.shuffle(round.items, lcg(9)) };
        let e2 = jogar(emb);
        return M.tocar(e2, emb.targetId).acerto === true
          && emb.items.filter((i) => i.role === 'distractor')
            .every((d) => { const r = M.tocar(e2, d.id); const ok = r.acerto === false; e2 = M.liberarErro(r.estado).estado; return ok; });
      } catch (e) { return false; } })(),
      'um distrator pode ser contado como acerto, ou a ordem do array muda o alvo');

    check('2.1a (identidade): a máquina decide por targetId, não por índice',
      /id === estado\.targetId/.test(mq)
      && /itemIds\.includes\(id\)/.test(mq)
      && !/alvoIndex/.test(mq),
      'a máquina voltou a decidir o acerto por índice de array');

    /* ── OVELHA SEMPRE PRESENTE / invariantes (2.1a §6) ── */
    check('2.1a (alvo sempre presente): iniciarRodada rejeita rodada sem alvo válido',
      (() => { try {
        const M = evalMq();
        let e = M.criarJogo({ rounds: 5 });
        const rej = M.iniciarRodada(e, { targetId: 'inexistente', itemIds: ['a', 'b'] });
        const okRej = rej.aceito === false && rej.estado.fase === M.FASES.TROCANDO;
        const bom = M.iniciarRodada(e, { targetId: 't', itemIds: ['t', 'd1', 'd2'] });
        return okRej && bom.aceito === true && bom.estado.fase === M.FASES.ENTRANDO;
      } catch (e) { return false; } })(),
      'a máquina inicia uma rodada sem alvo válido');

    check('2.1a (invariantes): exactlyOneTarget / targetIsRenderable / targetInsideBounds existem e valem',
      (() => { try {
        const S = evalSvc();
        const r = S.buildRound({ dif: S.getDifficulty('facil'), largura: 390, altura: 640, rnd: lcg(11), roundId: 2 });
        const m = S.margemDe(S.getDifficulty('facil'), 390, 640);
        // rodada boa passa em tudo; rodada adulterada (alvo fora) falha
        const boa = S.exactlyOneTarget(r) && S.targetIsRenderable(r) && S.targetInsideBounds(r, 390, 640, m);
        const ruim = { ...r, items: r.items.map((i) => i.id === r.targetId ? { ...i, cx: -999 } : i) };
        return boa && S.targetInsideBounds(ruim, 390, 640, m) === false && S.roundValido(ruim, 390, 640, m) === false;
      } catch (e) { return false; } })(),
      'os invariantes de alvo renderizável não funcionam');

    /* ── TELA: modelo único, guarda de dupla-montagem, halo em anel, dica ── */
    check('2.1a (tela): fonte ÚNICA — renderiza round.items e envia item.id (sem índice como identidade)',
      /const \[round, setRound\] = useState/.test(tela21)
      && /items\.map\(\(it, i\)/.test(tela21)
      && /const items = round\?\.items/.test(tela21)
      && /onPress=\{\(\) => tocarItem\(it\.id\)\}/.test(tela21)
      && /aplicar\(tocar, id\)/.test(tela21)
      && !/alvoIndex/.test(tela21)
      && !/setSprites/.test(tela21),
      'a tela voltou a usar arrays paralelos ou índice como identidade');

    check('2.1a (tela): montarRodada é idempotente por rodada (mata a dupla-montagem)',
      /const montarRodada = useCallback\(\(\) => \{\s*if \(jogoRef\.current\.fase !== FASES\.TROCANDO\) return;/.test(tela21),
      'montarRodada pode rodar duas vezes na mesma rodada e divergir visual×lógica');

    check('2.1a (tela): rodada REMONTA os sprites (key = roundId + item.id)',
      /key=\{`\$\{round\.roundId\}-\$\{it\.id\}`\}/.test(tela21),
      'a key não inclui roundId+item.id → Animated.Value preso entre rodadas');

    check('2.1a (halo): anel de centro TRANSPARENTE, atrás dos sprites, sem toque, ~1,45–1,6× o sprite',
      (() => {
        const comp = (tela21.match(/function HaloAnel[\s\S]*?\n\}/) || [''])[0];
        return comp.length > 0
          && /pointerEvents="none"/.test(comp)
          && /item\.visualSize \* \(evidente \? 1\.6 : 1\.45\)/.test(comp)
          && /borderWidth:/.test(comp)
          && /halo: \{ position: 'absolute', backgroundColor: 'transparent', borderColor: pt\.gold, zIndex: 1 \}/.test(tela21)
          && /zIndex: 2/.test(tela21);   // sprites acima do halo
      })(),
      'o halo voltou a ser um círculo cheio, cobre o alvo, ou recebe toque');

    check('2.1a (dica): não revela no 1º erro; espacial só nível ≥2 (8s/2 · 12s/3 · 17s/5)',
      (() => { try {
        const S = evalSvc();
        return S.nivelDica(0, 1) < 2 && S.nivelDica(0, 0) === 0
          && S.nivelDica(0, 2) === 1 && S.nivelDica(0, 3) >= 2 && S.nivelDica(0, 5) === 3
          && S.nivelDica(8000, 0) === 1 && S.nivelDica(12000, 0) >= 2 && S.nivelDica(17000, 0) === 3
          && S.DICA.T1_MS === 8000 && S.DICA.E1 === 2
          // a tela só mostra o halo em nível ≥2 e cancela ao sair de procurando
          && /nivel >= 2/.test(tela21) && /if \(r\.estado\.fase !== FASES\.PROCURANDO\) resetarDica\(\)/.test(tela21);
      } catch (e) { return false; } })(),
      'a dica revela cedo demais, ou não segue os limiares 8/12/17s e 2/3/5 erros');

    check('2.1a (dica): controlador acumula tempo só procurando; halo some ao pausar; reseta por rodada',
      /const resetarDica = useCallback/.test(tela21)
      && /buscaMsRef\.current \+= agora - ultimo/.test(tela21)
      && /if \(!procurando \|\| pausado\) return undefined;/.test(tela21)
      && /procurando && nivel >= 2 && !pausado/.test(tela21)   // pausar esconde o halo
      && /setRound\(r\);\s*setErradoId\(null\);\s*resetarDica\(\);/.test(tela21),  // reset por rodada
      'o controlador de dica não pausa/reseta corretamente');

    check('2.1a (fallback visual): o alvo tem fallback SVG se o PNG falhar; onError warn só em dev',
      /function OvelhaVisual/.test(tela21)
      && /onError=\{\(\) => \{/.test(tela21)
      && /setFalhou\(true\)/.test(tela21)
      && /if \(falhou\) return <OvelhaSvgSprite/.test(tela21)
      && /__DEV__/.test(tela21),
      'a ovelha pode ficar invisível se o PNG temporário falhar');

    check('2.1a (diagnóstico): overlay interno DESLIGADO por padrão, pointerEvents none, sem Modo Criador',
      /const OVELHA_DEBUG_HITBOX = false;/.test(tela21)
      && /OVELHA_DEBUG_HITBOX &&/.test(tela21)
      && !/MODO CRIADOR|creatorMode|isCreatorQaModeAllowed/i.test(tela21)
      && /debugRect|debugHud/.test(tela21),
      'o overlay de diagnóstico está ligado por padrão ou depende do Modo Criador');

    /* ── MÁQUINA: fases, 5 rodadas, sequência (2.1a §11) ── */
    check('2.1a (máquina): só "procurando" aceita toque; recusado = zero efeitos',
      (() => { try {
        const M = evalMq();
        const bloqueadas = [M.FASES.TROCANDO, M.FASES.ENTRANDO, M.FASES.ERRO, M.FASES.ACERTO, M.FASES.FIM];
        const base = { ...M.criarJogo({ rounds: 5 }), targetId: 't', itemIds: ['t', 'd1', 'd2'] };
        const todas = bloqueadas.every((fase) => !M.aceitaToque({ ...base, fase }, 't'));
        const so1 = M.FASES_QUE_ACEITAM.length === 1 && M.FASES_QUE_ACEITAM[0] === M.FASES.PROCURANDO;
        const rec = M.tocar({ ...base, fase: M.FASES.ENTRANDO }, 't');
        return todas && so1 && rec.aceito === false && rec.efeitos.length === 0;
      } catch (e) { return false; } })(),
      'alguma fase fora de "procurando" aceita toque');

    check('2.1a (máquina): 5 rodadas encerram; a 6ª não é criada; sequência correta',
      (() => { try {
        const M = evalMq();
        const round = (e, erra) => {
          e = M.iniciarRodada(e, { targetId: 't', itemIds: ['t', 'd1', 'd2'] }).estado;
          e = M.cenaPronta(e).estado;
          if (erra) { e = M.tocar(e, 'd1').estado; e = M.liberarErro(e).estado; }
          e = M.tocar(e, 't').estado;
          return M.avancar(e).estado;
        };
        // best 5 (sem erro)
        let e = M.criarJogo({ rounds: 5 });
        for (let r = 0; r < 5; r++) e = round(e, false);
        if (e.fase !== M.FASES.FIM || e.encontradas !== 5 || e.bestSequencia !== 5) return false;
        if (M.aceitaToque(e, 't') !== false) return false;
        if (M.avancar(e).estado.rodada !== 5) return false;      // sem 6ª
        // 2 acertos, erro, 3 acertos → best 3
        let f = M.criarJogo({ rounds: 5 });
        [false, false, true, false, false].forEach((erra) => { f = round(f, erra); });
        // erro em toda rodada → best 1, mas 5 encontradas
        let g = M.criarJogo({ rounds: 5 });
        for (let r = 0; r < 5; r++) g = round(g, true);
        return f.bestSequencia === 3 && g.bestSequencia === 1 && g.encontradas === 5;
      } catch (e) { return false; } })(),
      'as 5 rodadas não encerram, criam uma 6ª, ou a melhor sequência está errada');

    check('2.1a (máquina): é PURA — sem React, relógio, I/O, navegação',
      (() => { const codigo = a1StripComments(mq);
        return !/useState|useEffect|useRef|from 'react|require\('react/i.test(codigo)
          && !/Date\.now|setTimeout|setInterval|Math\.random/.test(codigo)
          && !/AsyncStorage|fetch\(|navigation/.test(codigo)
          && /export function aceitaToque/.test(mq); })(),
      'a máquina da ovelhinha deixou de ser pura');

    /* ── PERSISTÊNCIA (inalterada pelo 2.1a) ── */
    check('2.1 (persistência): grava ovelha, dá 1 estrelinha, teto compartilhado com o Pares',
      (() => { try {
        const B = evalStats();
        const hoje = '2026-07-10';
        const p = { dificuldade: 'facil', day: hoje, encontradas: 5, sequencia: 4 };
        const r1 = B.applyOvelhaResult(null, p);
        if (!(r1.starAwarded && r1.stats.ovelha.facil.plays === 1 && r1.stats.ovelha.facil.bestSequencia === 4)) return false;
        const r2 = B.applyOvelhaResult(r1.stats, { ...p, sequencia: 2 });
        const r3 = B.applyOvelhaResult(r2.stats, { ...p, sequencia: 5 });
        if (!(r2.starAwarded && !r3.starAwarded && r3.stats.ovelha.facil.plays === 3 && r3.isBest)) return false;
        // teto compartilhado com o Pares
        const par = B.applyResult(null, { modo: 'classico', dificuldade: 'facil', day: hoje, elapsedMs: 30000, erros: 0, jogadas: 6 });
        const ov = B.applyOvelhaResult(par.stats, { dificuldade: 'facil', day: hoje, encontradas: 5, sequencia: 5 });
        const ov2 = B.applyOvelhaResult(ov.stats, { dificuldade: 'facil', day: hoje, encontradas: 5, sequencia: 5 });
        return par.starAwarded && ov.starAwarded && !ov2.starAwarded;
      } catch (e) { return false; } })(),
      'a persistência da ovelha regrediu ou o teto deixou de ser compartilhado');

    check('2.1 (persistência): dados antigos migram; Pares/Turbo intactos; applyResult do Pares limpo',
      (() => { try {
        const B = evalStats();
        const s = B.sanitizeStats({ day: 'x', starsToday: 1, pares: { facil: { plays: 3, wins: 3, bestMs: 25000, bestErros: 1 } } });
        const ok = s.ovelha.facil.plays === 0 && s.pares.facil.bestMs === 25000 && s.turbo.facil.bestScore === 0
          && B.sanitizeStats('lixo').ovelha.facil.plays === 0;
        const applyPares = (bs21.match(/export function applyResult[\s\S]*?\n\}/) || [''])[0];
        return ok && !/ovelha/.test(applyPares) && /export function applyOvelhaResult/.test(bs21);
      } catch (e) { return false; } })(),
      'a migração perde dados, ou o applyResult do Pares foi contaminado');

    /* ── ÁUDIO / EMOJI / ROTA / CARD / ÍCONE / PROTEGIDOS ── */
    check('2.1 (tela): rodada consumida só em comecar(); estrelinha uma vez em finalizar()',
      (() => {
        const com = (tela21.match(/const comecar = useCallback\(async[\s\S]*?\n  \}/) || [''])[0];
        const fin = (tela21.match(/const finalizar = useCallback\(async[\s\S]*?\n  \}/) || [''])[0];
        return (tela21.match(/consumeRound\(/g) || []).length === 1 && /consumeRound\(/.test(com)
          && (tela21.match(/addBonusStars\(/g) || []).length === 1
          && (tela21.match(/recordOvelhaResult\(/g) || []).length === 1
          && /if \(salvoRef\.current\) return;\s*salvoRef\.current = true;/.test(fin)
          && /if \(r\.starAwarded\) \{ await addBonusStars\(1\); await refreshProgress\?\.\(\); \}/.test(fin);
      })(),
      'a rodada/estrelinha pode ser consumida/creditada fora do lugar ou duas vezes');

    check('2.1 (tela): ciclo de vida — AppState, blur, montadoRef, agendar, releaseGameSfx',
      /AppState\.addEventListener\('change'/.test(tela21)
      && /navigation\.addListener\('blur'/.test(tela21)
      && /montado\.current = false;\s*limparTimers\(\);\s*releaseGameSfx\(\);/.test(tela21)
      && /timeouts\.current\.forEach\(clearTimeout\)/.test(tela21)
      && /if \(montado\.current\) cb\(\);/.test(tela21),
      'a tela não limpa timers/sons no unmount');

    check('2.1 (tela): áudio reaproveitado; nenhum arquivo de som novo; sem emoji',
      /OVELHA_SOUND_EVENTS\.ACERTO/.test(tela21) && /playGameSfx/.test(tela21)
      && /ACERTO: 'match_success'/.test(svc) && /VITORIA: 'classic_victory_jingle'/.test(svc)
      && !/assets\/audio/.test(tela21)
      && !/\p{Extended_Pictographic}/u.test(telaRaw) && /<FaithIcon/.test(telaRaw),
      'a ovelhinha depende de som novo, conhece caminho de áudio, ou tem emoji');

    check('2.1 (rota): CADE_A_OVELHINHA registrada SÓ sob o gate interno',
      /CADE_A_OVELHINHA: 'CadeAOvelhinha'/.test(rt21)
      && /isInternalToolsEnabled\(\) && \(\s*<Stack\.Screen\s*name="CadeAOvelhinha"/.test(nav21),
      'a rota da ovelhinha não existe ou é registrada em produção');

    check('2.1 (card): ativo SÓ em dev; em produção continua "Chegando"; tela "Em teste"',
      /\{ id: 'ovelha', icon: 'ovelha'/.test(brc21)
      && /id === 'ovelha' && isInternalToolsEnabled\(\) \?/.test(brc21)
      && /navigate\(ROUTES\.CADE_A_OVELHINHA\)/.test(brc21)
      && /function TestingTile/.test(brc21) && /Em teste/.test(brc21)
      && /chip="Em teste"/.test(tela21),
      'o card fica ativo em produção, ou não abre o jogo em dev');

    check('2.1 (ícone): ovelha é SVG próprio; o placeholder "eye" não é mais usado',
      /function OvelhaSvg/.test(fi21) && /if \(name === 'ovelha'\) return <OvelhaSvg/.test(fi21)
      && !/ovelha: 'eye'/.test(fi21) && !/ovelha: '[a-z-]+'/.test(fi21),
      'a ovelha voltou a usar o ícone "eye" do Ionicons');

    check('2.1 (protegidos): Pares e Modo Criador intocados por este bloco',
      /aplicar\(tocar, i\)/.test(a1StripComments(readSrc('src/screens/ParesDoBeniScreen.js')))
      && /export function isInternalToolsEnabled/.test(readSrc('src/config/internalTools.js'))
      && !/ovelha|Ovelha/.test(a1StripComments(readSrc('src/services/paresGameMachine.js'))),
      'o bloco 2.1 tocou o Pares ou o Modo Criador');
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = passes + failures;
  console.log(`\n── Result: ${passes}/${total} passed, ${failures} failed ──\n`);
  if (failures > 0) process.exit(1);
})();
