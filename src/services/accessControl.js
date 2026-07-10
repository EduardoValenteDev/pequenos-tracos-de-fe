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

import { isCreatorQaModeEnabled } from './creatorQaMode';
import { getStoryPlan, PLAN } from '../data/planConfig';
import { getEntitlementPlan } from './entitlementService';

// DEV TOOL ONLY — set true locally to test premium flows. Never ship as true.
const ENABLE_LOCAL_PREMIUM_TEST_MODE = false;

export const ACCESS_TYPE = {
  FREE: 'free',
  PREMIUM: 'premium',
};

const ALLOW_COMING_SOON_PREVIEW = false;
/**
 * Bloco 1.1 — decisão oficial do Eduardo: o plano GRATUITO **não salva artes** (0).
 * A criança cria e brinca à vontade; salvar e a Galeria são do Plano Família.
 * O bloqueio é amigável (convite, nunca punição) e vive na tela, não aqui.
 */
const FREE_ATELIER_SAVE_LIMIT = 0;

/**
 * Retorna o plano atual do usuário. Fase 2B.7.2: DELEGA ao entitlementService (política pura).
 * Sem fonte real (RevenueCat = 2B.7.3), o snapshot é vazio → 'free' (idêntico ao mock anterior).
 *
 * CONTRATO FUTURO DE ENTITLEMENT (Fase 2B.6 · RP4 — registrado, NÃO implementado aqui):
 *   - Quando RevenueCat entrar, getCurrentPlan() deve refletir entitlement ATIVO,
 *     EXPIRADO ou CANCELADO (não um booleano perpétuo em memória).
 *   - OFFLINE: premium offline só é permitido até um `expiresAt` LOCAL conhecido. Se a
 *     validade local passou, BLOQUEAR conteúdo premium mesmo offline e pedir revalidação
 *     online. Uma assinatura curta NÃO pode virar acesso vitalício offline.
 *   - Pack no disco NUNCA é autorização (Fase 2B.6 · RP2): a abertura premium depende de
 *     isPremiumUser()/entitlement ativo, não do arquivo existir. O gate de abertura é a
 *     fonte da proteção de receita.
 *   - Fora do escopo desta fase: RevenueCat, backend, criptografia de pack, R2 privado.
 */
export function getCurrentPlan() {
  if (ENABLE_LOCAL_PREMIUM_TEST_MODE) {
    console.warn('[accessControl] ENABLE_LOCAL_PREMIUM_TEST_MODE is TRUE — never ship this');
    return 'premium'; // test-mode: precedência explícita (Fase 2B.7.2)
  }
  // Fase 2B.7.2: fonte de verdade passa a ser a policy pura via entitlementService.
  // decision === 'premium' ? 'premium' : 'free' (needs_revalidation → free). Sem fonte → 'free'.
  return getEntitlementPlan();
}

/**
 * True se o usuário pode acessar conteúdo Premium.
 *
 * Camada central: TODAS as travas Premium passam por aqui. Libera quando:
 *   1. o plano real é Premium; ou
 *   2. o Modo Criador / QA está ativo (apenas em ambiente permitido).
 *
 * O Modo Criador é só um OVERRIDE de permissão local: NÃO altera o plano real
 * (getCurrentPlan continua 'free'), NÃO marca compra, NÃO afeta usuários reais
 * em produção. Estrutura pronta para no futuro combinar com RevenueCat / Apple
 * Sandbox / Google License Testers.
 */
export function isPremiumUser() {
  if (getCurrentPlan() === 'premium') return true;
  if (isCreatorQaModeEnabled()) return true; // override local de QA (dev/permitido)
  return false;
}

/** Alias semântico — pronto para a futura integração de compra real. */
export function hasPremiumAccess() {
  return isPremiumUser();
}

/**
 * True se o usuário pode acessar uma história específica.
 * - free stories: acessíveis para todos se status !== 'coming_soon'
 * - premium stories: acessíveis apenas para premium (ou test mode)
 * - coming_soon: nunca acessíveis, salvo ALLOW_COMING_SOON_PREVIEW
 */
export function hasStoryAccess(story) {
  if (!story) return false;
  const plan = getStoryPlan(story); // fonte única (planConfig)
  if (plan === PLAN.COMING_SOON) return ALLOW_COMING_SOON_PREVIEW;
  if (plan === PLAN.FREE) return true;
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
  if (getStoryPlan(story) === PLAN.FREE) return true;
  return isPremiumUser();
}

/** Converse com Lumi exige Premium. */
export function hasLumiAccess() {
  return isPremiumUser();
}

/**
 * "Guardar no coração" (reflexão curta pós-história) — GRÁTIS no MVP (decisão A6).
 * NÃO é exclusivo do Plano Família e não deve ser gateado para conta gratuita.
 * Mantém o parâmetro `story` para compatibilidade de assinatura e flexibilidade
 * futura; a estrutura de plano (isPremiumUser) segue disponível para conteúdo
 * realmente premium (histórias/quiz premium, Ateliê ilimitado).
 */
export function hasLumiAccessForStory(story) {
  return true;
}

/** "Momento com Beni" — GRÁTIS no MVP (decisão A6). Não exige Premium. */
export function hasMomentoLumiAccess() {
  return true;
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
