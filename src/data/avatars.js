// Registry de avatares do onboarding/perfil.
//
// Cada avatar tem um `id` estável (chave persistida em @ptf_profile), um `label`
// e uma `image` (PNG real). `emoji` é mantido apenas como METADADO (não é mais
// renderizado em nenhuma tela a partir do Bloco 2).
//
// Tom de pele (Bloco 2): apenas `boy` e `girl` têm `variants` { claro, escuro }.
// Os outros 6 avatares ignoram o tom — usam sempre `image`.
//
// REGRA RN: require() SEMPRE estático/literal por imagem (require dinâmico com
// variável quebra o Metro bundler). Por isso cada variante tem seu próprio require.

export const SKIN_TONES = ['claro', 'escuro'];
export const DEFAULT_SKIN_TONE = 'claro';

export const AVATARS = [
  {
    id: 'boy', emoji: '👦', label: 'Menino', unlockStars: 0,
    image: require('../../assets/avatar/avatar_white_boy.png'),
    variants: {
      claro: require('../../assets/avatar/avatar_white_boy.png'),
      escuro: require('../../assets/avatar/avatar_black_boy.png'),
    },
  },
  {
    id: 'girl', emoji: '👧', label: 'Menina', unlockStars: 0,
    image: require('../../assets/avatar/avatar_white_girl.png'),
    variants: {
      claro: require('../../assets/avatar/avatar_white_girl.png'),
      escuro: require('../../assets/avatar/avatar_black_girl.png'),
    },
  },
  { id: 'lamb', emoji: '🐑', label: 'Cordeiro',  unlockStars: 10, image: require('../../assets/avatar/avatar_sheep.png') },
  { id: 'lion', emoji: '🦁', label: 'Leãozinho', unlockStars: 45, image: require('../../assets/avatar/avatar_lion.png') },
  { id: 'dove', emoji: '🕊️', label: 'Pombinha',  unlockStars: 30, image: require('../../assets/avatar/avatar_dove.png') },
  { id: 'ark',  emoji: '⛵', label: 'Arca',      unlockStars: 60, image: require('../../assets/avatar/avatar_ark.png') },
  { id: 'star', emoji: '⭐', label: 'Estrela',   unlockStars: 0,  image: require('../../assets/avatar/avatar_star.png') },
  { id: 'fish', emoji: '🐟', label: 'Peixinho',  unlockStars: 20, image: require('../../assets/avatar/avatar_fish.png') },
];

// Ids exibidos no ONBOARDING — apenas os iniciais grátis (primeira experiência
// limpa, sem cadeados). Os demais aparecem só no Perfil, conforme a jornada.
export const ONBOARDING_AVATAR_IDS = ['boy', 'girl', 'star'];

// Onboarding: 5 cards FINAIS já com o tom embutido (sem seletor de tom separado).
// Cada card grava avatarId + skinTone de uma vez.
export const ONBOARDING_AVATAR_OPTIONS = [
  // A diferença claro/escuro é VISUAL (pela imagem); o texto do card não cita o tom.
  { key: 'boy_claro',   avatarId: 'boy',  skinTone: 'claro',  label: 'Menino' },
  { key: 'boy_escuro',  avatarId: 'boy',  skinTone: 'escuro', label: 'Menino' },
  { key: 'girl_claro',  avatarId: 'girl', skinTone: 'claro',  label: 'Menina' },
  { key: 'girl_escuro', avatarId: 'girl', skinTone: 'escuro', label: 'Menina' },
  { key: 'star',        avatarId: 'star', skinTone: 'claro',  label: 'Estrela' },
];

// Ordem de exibição no grid do PERFIL — progressão: grátis primeiro, depois por
// marco crescente de estrelinhas (lamb 10 → fish 20 → dove 30 → lion 45 → ark 60).
export const PROFILE_AVATAR_ORDER = ['boy', 'girl', 'star', 'lamb', 'fish', 'dove', 'lion', 'ark'];

// Avatares que suportam seleção de tom de pele.
export const SKIN_TONE_AVATAR_IDS = ['boy', 'girl'];

export const DEFAULT_AVATAR_ID = 'star';

/** Retorna o avatar pelo id, com fallback para o avatar padrão (nunca undefined). */
export function getAvatarById(id) {
  return AVATARS.find(a => a.id === id) ?? AVATARS.find(a => a.id === DEFAULT_AVATAR_ID);
}

/** True se o avatar tem variantes de tom de pele (hoje: boy/girl). */
export function avatarHasSkinTones(id) {
  return !!getAvatarById(id)?.variants;
}

/**
 * Fonte única de verdade da imagem do avatar.
 * - Se o avatar tem `variants` e há um tom válido, usa a variante (claro/escuro).
 * - Tom ausente/desconhecido cai em 'claro' (fallback p/ perfis antigos sem skinTone).
 * - Avatares sem variantes ignoram o tom e usam `image`.
 */
export function getAvatarImage(avatarId, skinTone) {
  const avatar = getAvatarById(avatarId);
  if (avatar?.variants) {
    const tone = skinTone === 'escuro' ? 'escuro' : DEFAULT_SKIN_TONE;
    return avatar.variants[tone] ?? avatar.image;
  }
  return avatar?.image;
}

// ── Desbloqueio por marcos de estrelinhas (Bloco 3) ───────────────────────────
// Regra de produto: estrelas NUNCA são gastas. O desbloqueio é um MARCO derivado
// de `totalStars` (que só cresce com o progresso). Sem cobrança, sem saldo, sem
// storage novo: tudo é função pura do progresso + do avatar atual do perfil.

/** Ids dos avatares grátis (unlockStars === 0): boy, girl, star. */
export const FREE_AVATAR_IDS = AVATARS.filter(a => (a.unlockStars ?? 0) === 0).map(a => a.id);

/** Estrelinhas necessárias para liberar o avatar (0 = grátis). */
export function getAvatarUnlockStars(avatarId) {
  return getAvatarById(avatarId)?.unlockStars ?? 0;
}

/**
 * True se o avatar está liberado para o perfil:
 *  - grátis (unlockStars === 0), OU
 *  - já atingiu o marco (totalStars >= unlockStars), OU
 *  - é o avatar ATUAL do perfil (sempre disponível — não quebra perfis antigos
 *    nem força troca após reset de progresso).
 */
export function isAvatarUnlocked(avatarId, totalStars = 0, currentAvatarId = null) {
  if (avatarId === currentAvatarId) return true;
  const need = getAvatarUnlockStars(avatarId);
  return need === 0 || totalStars >= need;
}

/**
 * Resolve o tom de pele de UM avatar humano para o perfil, de forma independente:
 *  1) profile.avatarSkinTones[avatarId] (novo, por avatar);
 *  2) profile.skinTone (legado global — compatibilidade);
 *  3) 'claro'.
 * boy e girl têm tons independentes; trocar um não afeta o outro.
 */
export function getProfileAvatarSkinTone(profile, avatarId) {
  const perAvatar = profile?.avatarSkinTones?.[avatarId];
  if (perAvatar) return perAvatar;
  if (profile?.skinTone) return profile.skinTone;
  return DEFAULT_SKIN_TONE;
}
