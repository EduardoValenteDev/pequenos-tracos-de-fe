// Avatares temporários baseados em emoji.
// Estrutura preparada para substituição futura por imagens reais:
// basta adicionar um campo `image: require('../assets/...')` e
// renderizar <Image> em vez de <Text> quando o campo existir.
export const AVATARS = [
  { id: 'boy',  emoji: '👦', label: 'Menino' },
  { id: 'girl', emoji: '👧', label: 'Menina' },
  { id: 'lamb', emoji: '🐑', label: 'Cordeiro' },
  { id: 'lion', emoji: '🦁', label: 'Leãozinho' },
  { id: 'dove', emoji: '🕊️', label: 'Pombinha' },
  { id: 'ark',  emoji: '⛵', label: 'Arca' },
  { id: 'star', emoji: '⭐', label: 'Estrela' },
  { id: 'fish', emoji: '🐟', label: 'Peixinho' },
];

export const DEFAULT_AVATAR_ID = 'star';
