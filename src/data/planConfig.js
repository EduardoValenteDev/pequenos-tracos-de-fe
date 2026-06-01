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
    { emoji: '🐑', label: 'Converse com Lumi' },
    { emoji: '🌙', label: 'Momento com Lumi' },
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
  premiumShortText: 'Desbloqueie todas as trilhas, Lumi, devocionais e artes ilimitadas.',
  premiumCtaText: 'Conhecer Premium',
  notAvailableYetText: 'Em breve',
};
