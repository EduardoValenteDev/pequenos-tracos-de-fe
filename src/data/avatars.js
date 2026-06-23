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
    id: 'boy', emoji: '👦', label: 'Menino',
    image: require('../../assets/avatar/avatar_white_boy.png'),
    variants: {
      claro: require('../../assets/avatar/avatar_white_boy.png'),
      escuro: require('../../assets/avatar/avatar_black_boy.png'),
    },
  },
  {
    id: 'girl', emoji: '👧', label: 'Menina',
    image: require('../../assets/avatar/avatar_white_girl.png'),
    variants: {
      claro: require('../../assets/avatar/avatar_white_girl.png'),
      escuro: require('../../assets/avatar/avatar_black_girl.png'),
    },
  },
  { id: 'lamb', emoji: '🐑', label: 'Cordeiro',  image: require('../../assets/avatar/avatar_sheep.png') },
  { id: 'lion', emoji: '🦁', label: 'Leãozinho', image: require('../../assets/avatar/avatar_lion.png') },
  { id: 'dove', emoji: '🕊️', label: 'Pombinha',  image: require('../../assets/avatar/avatar_dove.png') },
  { id: 'ark',  emoji: '⛵', label: 'Arca',      image: require('../../assets/avatar/avatar_ark.png') },
  { id: 'star', emoji: '⭐', label: 'Estrela',   image: require('../../assets/avatar/avatar_star.png') },
  { id: 'fish', emoji: '🐟', label: 'Peixinho',  image: require('../../assets/avatar/avatar_fish.png') },
];

// Ids exibidos no onboarding (os 8 acima, na ordem do grid).
export const ONBOARDING_AVATAR_IDS = ['boy', 'girl', 'lamb', 'lion', 'dove', 'ark', 'star', 'fish'];

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
