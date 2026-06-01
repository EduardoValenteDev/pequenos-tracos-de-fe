/**
 * accessControl.js — Fonte única de regras de plano e acesso.
 *
 * NÃO espalhar lógica de plano em telas. Todas as telas chamam este arquivo.
 * NÃO criar pagamento real. NÃO criar login.
 * NÃO usar __DEV__ como regra de produto.
 *
 * Plano padrão: gratuito.
 * Premium em produção: quando esta lógica for conectada a uma compra real.
 *
 * Para testar fluxos premium localmente durante desenvolvimento, ative a
 * constante abaixo. NUNCA deve ser true em builds de produção.
 */

// DEV TOOL ONLY — set true locally to test premium flows. Never ship as true.
const ENABLE_LOCAL_PREMIUM_TEST_MODE = false;

export const ACCESS_TYPE = {
  FREE: 'free',
  PREMIUM: 'premium',
};

const ALLOW_COMING_SOON_PREVIEW = false;
const FREE_ATELIER_SAVE_LIMIT = 3;

/** Retorna o plano atual do usuário. Sempre 'free' até integração de compra real. */
export function getCurrentPlan() {
  if (ENABLE_LOCAL_PREMIUM_TEST_MODE) {
    console.warn('[accessControl] ENABLE_LOCAL_PREMIUM_TEST_MODE is TRUE — never ship this');
    return 'premium';
  }
  return 'free';
}

/** True se o usuário é Premium. */
export function isPremiumUser() {
  return getCurrentPlan() === 'premium';
}

/**
 * True se o usuário pode acessar uma história específica.
 * - free stories: acessíveis para todos se status !== 'coming_soon'
 * - premium stories: acessíveis apenas para premium (ou test mode)
 * - coming_soon: nunca acessíveis, salvo ALLOW_COMING_SOON_PREVIEW
 */
export function hasStoryAccess(story) {
  if (!story) return false;
  if (story.status === 'coming_soon') return ALLOW_COMING_SOON_PREVIEW;
  if (story.accessType === ACCESS_TYPE.FREE) return true;
  return isPremiumUser();
}

/** Alias mantido para compatibilidade com código existente. */
export function hasAccess(story) {
  return hasStoryAccess(story);
}

/**
 * True se o usuário pode abrir o quiz de uma história.
 * - Quiz de histórias gratuitas: liberado para todos.
 * - Quiz de histórias premium: exige Premium.
 */
export function hasQuizAccess(story) {
  if (!story) return false;
  if (story.accessType === ACCESS_TYPE.FREE) return true;
  return isPremiumUser();
}

/** Converse com Lumi exige Premium. */
export function hasLumiAccess() {
  return isPremiumUser();
}

/** Converse com Lumi (reflexão pós-história) — story-aware. Gratuito em histórias free. */
export function hasLumiAccessForStory(story) {
  if (!story) return isPremiumUser();
  if (story.accessType === ACCESS_TYPE.FREE) return true;
  return isPremiumUser();
}

/** Momento com Lumi exige Premium. */
export function hasMomentoLumiAccess() {
  return isPremiumUser();
}

/** Devocional exige Premium. */
export function hasDevotionalAccess() {
  return isPremiumUser();
}

/** Ateliê ilimitado exige Premium. */
export function hasAtelierUnlimitedAccess() {
  return isPremiumUser();
}

/** Limite de salvamentos do Ateliê no plano gratuito. */
export function getFreeAtelierSaveLimit() {
  return FREE_ATELIER_SAVE_LIMIT;
}

/**
 * True se o usuário pode abrir uma história agora.
 * Considera status (coming_soon bloqueia) e plano.
 */
export function canOpenStory(story) {
  return hasStoryAccess(story);
}

/**
 * True se o usuário pode abrir o quiz de uma história.
 * Idêntico a hasQuizAccess — mantido para semântica explícita.
 */
export function canOpenQuiz(story) {
  return hasQuizAccess(story);
}

/** True se o usuário pode abrir Converse com Lumi para esta história. */
export function canOpenLumi(story) {
  return hasLumiAccessForStory(story);
}

/** True se o usuário pode abrir Momento com Lumi. */
export function canOpenMomentoLumi() {
  return hasMomentoLumiAccess();
}

/** True se o usuário pode abrir Devocional. */
export function canOpenDevotional() {
  return hasDevotionalAccess();
}
