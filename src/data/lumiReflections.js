export const LUMI_FEELINGS = [
  { emoji: '😊', label: 'Feliz' },
  { emoji: '😌', label: 'Calmo' },
  { emoji: '💛', label: 'Amado' },
  { emoji: '🙏', label: 'Grato' },
  { emoji: '🦁', label: 'Corajoso' },
  { emoji: '😟', label: 'Com medo' },
  { emoji: '🤔', label: 'Curioso' },
  { emoji: '😢', label: 'Tristinho' },
];

// ── Guardar no coração (UX 1.0 — Bloco 4C) ──────────────────────────────────
// Listas ENXUTAS usadas no fluxo simples (máx. 4 cada). As listas longas acima
// ficam para rotação futura, mas NÃO aparecem mais no fluxo principal.
export const HEART_FEELINGS = [
  { emoji: '😊', label: 'Feliz' },
  { emoji: '😌', label: 'Calmo' },
  { emoji: '🦁', label: 'Corajoso' },
  { emoji: '💛', label: 'Amado' },
];

export const HEART_KEEPS = [
  'Deus cuida de mim',
  'Posso confiar em Deus',
  'Deus me ama',
  'Quero fazer o bem',
];

export const LUMI_LEARNED = [
  'Deus cuida de mim',
  'Jesus me ama',
  'Posso confiar em Deus',
  'Posso ser corajoso',
  'Posso agradecer',
  'Posso obedecer',
  'Posso cuidar dos outros',
  'Posso falar com Deus',
];

export const LUMI_PRAYERS = [
  'Obrigado, Deus',
  'Me ajuda a ter coragem',
  'Me ajuda a obedecer',
  'Cuida da minha família',
  'Quero ficar pertinho de Jesus',
  'Me ajuda quando eu sentir medo',
  'Quero aprender mais',
  'Quero ser bondoso',
];

export const LEARNING_VERSES = {
  'Deus cuida de mim': {
    text: 'O Senhor é o meu pastor; nada me faltará.',
    ref: 'Salmo 23:1',
  },
  'Jesus me ama': {
    text: 'Deixem vir a mim as crianças.',
    ref: 'Marcos 10:14',
  },
  'Posso confiar em Deus': {
    text: 'Quando estou com medo, confio em ti.',
    ref: 'Salmo 56:3',
  },
  'Posso ser corajoso': {
    text: 'Seja forte e corajoso.',
    ref: 'Josué 1:9',
  },
  'Posso agradecer': {
    text: 'Deem graças ao Senhor, porque ele é bom.',
    ref: 'Salmo 107:1',
  },
  'Posso obedecer': {
    text: 'Ensina-me a fazer a tua vontade.',
    ref: 'Salmo 143:10',
  },
  'Posso cuidar dos outros': {
    text: 'Amem uns aos outros.',
    ref: 'João 13:34',
  },
  'Posso falar com Deus': {
    text: 'Orem continuamente.',
    ref: '1 Tessalonicenses 5:17',
  },
};

// Legacy per-story reflections kept for backward compatibility (quiz-done check uses storyId)
export const LUMI_REFLECTIONS = {
  noah: {},
  david_goliath: {},
  jesus_children: {},
};

export const LUMI_MOMENT_MESSAGES = [
  { emoji: '🌈', text: 'Deus cuida de você hoje e sempre!', verse: 'O Senhor é bom para todos.', verseRef: 'Salmos 145:9' },
  { emoji: '💛', text: 'Você é especial para Deus!', verse: 'Deus amou o mundo de tal maneira…', verseRef: 'João 3:16' },
  { emoji: '⭐', text: 'Seja forte e corajoso!', verse: 'Posso fazer tudo por meio de Cristo.', verseRef: 'Fp 4:13' },
  { emoji: '🕊️', text: 'Confie em Deus com todo o seu coração.', verse: 'Confia no Senhor de todo o teu coração.', verseRef: 'Provérbios 3:5' },
  { emoji: '🐑', text: 'O Senhor é seu pastor!', verse: 'O Senhor é meu pastor, nada me faltará.', verseRef: 'Salmos 23:1' },
  { emoji: '🙏', text: 'Uma oração pequena vale muito para Deus!', verse: 'Orai sem cessar.', verseRef: '1 Tessalonicenses 5:17' },
  { emoji: '✨', text: 'Sua fé move montanhas!', verse: 'Se tiverdes fé do tamanho de um grão de mostarda…', verseRef: 'Mateus 17:20' },
];
