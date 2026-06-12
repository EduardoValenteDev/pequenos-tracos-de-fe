/**
 * planConfig.js — Configuração oficial dos planos Gratuito e Premium.
 * Fonte de verdade para textos de UI, listas de features e CTAs de plano.
 */

export const FREE_PLAN = {
  id: 'free',
  name: 'Gratuito',
  items: [
    { emoji: '✨', label: 'Trilha Comece Aqui' },
    { emoji: '📖', label: '2 histórias gratuitas' },
    { emoji: '🧩', label: 'Quiz das histórias gratuitas' },
    { emoji: '🎨', label: 'Ateliê com 3 artes salvas' },
    // A6: grátis no MVP — NÃO são exclusivos do Plano Família.
    { emoji: '💛', label: 'Guardar no coração' },
    { emoji: '🌙', label: 'Momento com Beni' },
  ],
};

export const PREMIUM_PLAN = {
  id: 'premium',
  name: 'Premium',
  items: [
    { emoji: '🌟', label: 'Trilha Pequeninos (6 histórias)' },
    { emoji: '🔍', label: 'Trilha Descobridores (6 histórias)' },
    { emoji: '📖', label: 'Trilha Jovens da Fé (6 histórias)' },
    { emoji: '🧩', label: 'Quiz de todas as histórias' },
    // A6: as reflexões guiadas saíram daqui — são grátis no MVP (ficam na lista
    // do plano Gratuito), não são benefícios exclusivos do Plano Família.
    { emoji: '🎨', label: 'Ateliê com artes ilimitadas' },
  ],
  comingSoonItems: [
    { emoji: '🙏', label: 'Devocional infantil' },
    { emoji: '👨‍👩‍👧', label: 'Plano multi-perfil' },
    { emoji: '🚀', label: 'Novas trilhas e histórias' },
  ],
};

export const PLAN_PRICING = {
  monthly: {
    id: 'monthly',
    label: 'Mensal',
    status: 'comingSoon',
    isPurchaseEnabled: false,
    productIdPlaceholder: '',
  },
  annual: {
    id: 'annual',
    label: 'Anual',
    status: 'comingSoon',
    isPurchaseEnabled: false,
    productIdPlaceholder: '',
  },
};

export const PLAN_TEXTS = {
  freeShortText: 'Comece com histórias grátis, quiz e 3 artes no Ateliê.',
  premiumShortText: 'Desbloqueie todas as trilhas, Beni e artes ilimitadas.',
  premiumCtaText: 'Conhecer Premium',
  notAvailableYetText: 'Em breve',
};

/* ──────────────────────────────────────────────────────────────────────────
   REGRA DE PLANO POR HISTÓRIA — fonte única (Bloco 1).
   Home, Aventuras, onboarding, Área dos Pais e accessControl consultam AQUI.
   NÃO cria pagamento/login/backend; o acesso efetivo sai de accessControl.
─────────────────────────────────────────────────────────────────────────── */
export const PLAN = { FREE: 'free', PREMIUM: 'premium', COMING_SOON: 'coming_soon' };

/** Rótulos OFICIAIS. Nunca usar "Conteúdo familiar"/"Especial da Família"/"Família". */
export const PLAN_LABELS = {
  free: 'Grátis',
  premium: 'Plano Família',
  coming_soon: 'Em breve',
};

/**
 * Histórias explicitamente GRATUITAS e jogáveis em conta limpa (trilha Comece
 * Aqui). Garante A Criação e Noé sempre liberadas. Davi e Golias NÃO está aqui
 * → premium (Plano Família).
 */
export const FREE_STORY_IDS = ['creation', 'noah'];

/** Plano de uma história ('free' | 'premium' | 'coming_soon'). */
export function getStoryPlan(story) {
  if (!story) return PLAN.PREMIUM;
  if (story.status === 'coming_soon') return PLAN.COMING_SOON;
  if (FREE_STORY_IDS.includes(story.id)) return PLAN.FREE;
  if (story.accessType === PLAN.FREE) return PLAN.FREE;
  return PLAN.PREMIUM;
}

export function isFreeStory(story) { return getStoryPlan(story) === PLAN.FREE; }
export function isPremiumStory(story) { return getStoryPlan(story) === PLAN.PREMIUM; }

/** Rótulo de plano a partir do enum (ou de uma história). */
export function getPlanLabel(planOrStory) {
  if (typeof planOrStory === 'string') return PLAN_LABELS[planOrStory] ?? PLAN_LABELS.premium;
  return PLAN_LABELS[getStoryPlan(planOrStory)] ?? PLAN_LABELS.premium;
}
