import { colors } from '../theme/colors';

/**
 * Helpers defensivos — `check`, `progress` e `progressLabel` podem ser chamados
 * com ctx null/undefined ou incompleto (ex.: TrophiesScreen renderiza antes de
 * buildCtx resolver). Nunca devem lançar exceção.
 */
const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
// Leitura segura de um campo numérico do ctx (ex.: totalScenes).
const cnt = (ctx, key) => num((ctx || {})[key]);
// Flag booleana segura do ctx (ex.: creationComplete).
const flag = (ctx, key) => !!(ctx || {})[key];
// Monta um objeto de progresso seguro { current, target } (ratio nunca quebra).
const mk = (ctx, key, target) => ({ current: Math.min(cnt(ctx, key), target), target });

/**
 * Categorias do Álbum de Estrelinhas. Cada conquista tem um `category`.
 * Mapeamento puramente visual — não altera a lógica de desbloqueio.
 */
export const ACHIEVEMENT_CATEGORIES = [
  { id: 'jornada',   label: 'Jornada',   icon: '⭐', color: '#F9C74F' },
  { id: 'historias', label: 'Histórias', icon: '📖', color: '#2B5BA1' },
  { id: 'arte',      label: 'Arte',      icon: '🎨', color: '#EC407A' },
  { id: 'quiz',      label: 'Quiz',      icon: '🧩', color: '#2ECC71' },
  { id: 'livrinho',  label: 'Livrinho',  icon: '📕', color: '#7C3AED' },
  { id: 'coracao',   label: 'Coração',   icon: '💛', color: '#F4B400' },
];

export const ACHIEVEMENTS = [
  // ── Jornada (estrelas/cenas) ──
  {
    id: 'first_scene',
    emoji: '⭐',
    title: 'Primeira cena',
    desc: 'Complete sua primeira cena de qualquer história.',
    color: '#FFD166',
    category: 'jornada',
    check: ctx => cnt(ctx, 'totalScenes') >= 1,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 1)} de 1 cena`,
    progress: ctx => mk(ctx, 'totalScenes', 1),
  },
  {
    id: 'five_stars',
    emoji: '🌟',
    title: 'Cinco estrelas',
    desc: 'Complete 5 cenas ao todo. Você está voando!',
    color: colors.success,
    category: 'jornada',
    check: ctx => cnt(ctx, 'totalScenes') >= 5,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 5)} de 5 cenas`,
    progress: ctx => mk(ctx, 'totalScenes', 5),
  },
  {
    id: 'ten_stars',
    emoji: '💛',
    title: 'Dez estrelas',
    desc: 'Complete 10 cenas. Que jornada incrível!',
    color: colors.primaryDark,
    category: 'jornada',
    check: ctx => cnt(ctx, 'totalScenes') >= 10,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 10)} de 10 cenas`,
    progress: ctx => mk(ctx, 'totalScenes', 10),
  },
  {
    id: 'fifteen_stars',
    emoji: '🔥',
    title: 'Quinze estrelas',
    desc: 'Incrível! 15 cenas concluídas na sua jornada.',
    color: '#E87722',
    category: 'jornada',
    check: ctx => cnt(ctx, 'totalScenes') >= 15,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 15)} de 15 cenas`,
    progress: ctx => mk(ctx, 'totalScenes', 15),
  },
  {
    id: 'thirty_stars',
    emoji: '🌠',
    title: 'Trinta estrelas',
    desc: 'Complete 30 cenas. Você é dedicado!',
    color: '#5C6BC0',
    category: 'jornada',
    check: ctx => cnt(ctx, 'totalScenes') >= 30,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 30)} de 30 cenas`,
    progress: ctx => mk(ctx, 'totalScenes', 30),
  },
  {
    id: 'fifty_stars',
    emoji: '🎖️',
    title: 'Cinquenta estrelas',
    desc: '50 cenas! Você está construindo algo lindo.',
    color: '#EC407A',
    category: 'jornada',
    check: ctx => cnt(ctx, 'totalScenes') >= 50,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 50)} de 50 cenas`,
    progress: ctx => mk(ctx, 'totalScenes', 50),
  },

  // ── Histórias ──
  {
    id: 'first_story',
    emoji: '🏆',
    title: 'Primeira aventura',
    desc: 'Termine todas as cenas de uma história.',
    color: colors.action,
    category: 'historias',
    check: ctx => cnt(ctx, 'completedStories') >= 1,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'completedStories'), 1)} de 1 história`,
    progress: ctx => mk(ctx, 'completedStories', 1),
  },
  {
    id: 'creation_complete',
    emoji: '🌍',
    title: 'Guardião da Criação',
    desc: 'Completou a história da Criação do início ao fim.',
    color: '#2E9E5B',
    category: 'historias',
    check: ctx => flag(ctx, 'creationComplete'),
  },
  {
    id: 'noah_done',
    emoji: '🌈',
    title: 'Noé e o Sinal da Aliança',
    desc: 'Completou a história de Noé do início ao fim.',
    color: '#4FC3F7',
    category: 'historias',
    check: ctx => flag(ctx, 'noahComplete'),
  },
  {
    id: 'three_stories',
    emoji: '📚',
    title: 'Três aventuras',
    desc: 'Complete 3 histórias diferentes, pequeno aventureiro!',
    color: '#8E44AD',
    category: 'historias',
    check: ctx => cnt(ctx, 'completedStories') >= 3,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'completedStories'), 3)} de 3 histórias`,
    progress: ctx => mk(ctx, 'completedStories', 3),
  },
  {
    id: 'david_start',
    emoji: '🏹',
    title: 'Na arena com Davi',
    desc: 'Começou a história de Davi e Golias.',
    color: '#E67E22',
    category: 'historias',
    check: ctx => flag(ctx, 'davidAnyScene'),
  },
  {
    id: 'jesus_start',
    emoji: '💛',
    title: 'Com Jesus',
    desc: 'Completou a primeira cena de Jesus e as Crianças.',
    color: '#F4B400',
    category: 'historias',
    check: ctx => flag(ctx, 'jesusScene1Done'),
  },
  {
    id: 'david_scene1',
    emoji: '⚔️',
    title: 'Corajoso como Davi',
    desc: 'Completou a cena 1 da história de Davi.',
    color: '#C0392B',
    category: 'historias',
    check: ctx => flag(ctx, 'davidScene1Done'),
  },
  {
    id: 'first_free_story_done',
    emoji: '🌈',
    title: 'Primeira história grátis',
    desc: 'Completou uma história da trilha gratuita Comece Aqui.',
    color: '#4FC3F7',
    category: 'historias',
    check: ctx => flag(ctx, 'noahComplete') || flag(ctx, 'creationComplete'),
  },
  {
    id: 'comece_aqui_complete',
    emoji: '✨',
    title: 'Comece Aqui, completa!',
    desc: 'Completou a trilha Comece Aqui.',
    color: '#F4B400',
    category: 'historias',
    check: ctx => flag(ctx, 'noahComplete') && flag(ctx, 'creationComplete'),
  },
  {
    id: 'first_premium_story_done',
    emoji: '💎',
    title: 'Primeira aventura especial',
    desc: 'Completou sua primeira história da trilha Plano Família.',
    color: '#AB47BC',
    category: 'historias',
    check: ctx => flag(ctx, 'davidComplete') || flag(ctx, 'jesusComplete'),
  },
  {
    id: 'descobridores_complete',
    emoji: '🔍',
    title: 'Trilha Descobridores!',
    desc: 'Completou todas as 6 histórias da Trilha Descobridores.',
    color: '#26A69A',
    category: 'historias',
    check: ctx => flag(ctx, 'descobridoresComplete'),
  },
  {
    id: 'jovens_da_fe_complete',
    emoji: '📖',
    title: 'Trilha Jovens da Fé!',
    desc: 'Completou todas as 6 histórias da Trilha Jovens da Fé.',
    color: '#7E57C2',
    category: 'historias',
    check: ctx => flag(ctx, 'jovensDaFeComplete'),
  },
  {
    id: 'all_stories_complete',
    emoji: '🏅',
    title: 'Caminhante da Fé!',
    desc: 'Completou todas as 20 histórias do app. Incrível!',
    color: '#F4B400',
    category: 'historias',
    check: ctx => flag(ctx, 'allStoriesComplete'),
  },

  // ── Arte ──
  {
    id: 'first_drawing',
    emoji: '🎨',
    title: 'Primeiro traço',
    desc: 'Salve seu primeiro desenho colorido.',
    color: colors.secondary,
    category: 'arte',
    check: ctx => flag(ctx, 'hasAnyDrawing'),
  },
  {
    id: 'artist_ark',
    emoji: '⛵',
    title: 'Artista da arca',
    desc: 'Salvou o desenho da cena de Noé.',
    color: colors.primary,
    category: 'arte',
    check: ctx => flag(ctx, 'hasArkDrawing'),
  },
  {
    id: 'gallery_started',
    emoji: '🖼️',
    title: 'Galeria crescendo',
    desc: 'Salvou 2 ou mais desenhos no ateliê.',
    color: '#9B59B6',
    category: 'arte',
    check: ctx => cnt(ctx, 'savedDrawingCount') >= 2,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'savedDrawingCount'), 2)} de 2 desenhos`,
    progress: ctx => mk(ctx, 'savedDrawingCount', 2),
  },
  {
    id: 'little_artist_faith',
    emoji: '🖌️',
    title: 'Pequeno artista da fé',
    desc: 'Guardou 3 artes no seu ateliê. Que talento!',
    color: '#EC407A',
    category: 'arte',
    check: ctx => cnt(ctx, 'savedDrawingCount') >= 3,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'savedDrawingCount'), 3)} de 3 artes`,
    progress: ctx => mk(ctx, 'savedDrawingCount', 3),
  },

  // ── Quiz ──
  {
    id: 'first_quiz',
    emoji: '🧩',
    title: 'Quiz respondido',
    desc: 'Respondeu ao quiz de uma história pela primeira vez.',
    color: '#2ECC71',
    category: 'quiz',
    check: ctx => flag(ctx, 'anyQuizDone'),
  },

  // ── Livrinho ──
  {
    id: 'first_book_opened',
    emoji: '📖',
    title: 'Primeiro Livrinho',
    desc: 'Abriu o seu Livrinho da Fé pela primeira vez.',
    color: '#7C3AED',
    category: 'livrinho',
    check: ctx => flag(ctx, 'anyBookOpened'),
  },

  // ── Coração ──
  {
    id: 'first_reflection',
    emoji: '🐑',
    title: 'Conversei com Beni',
    desc: 'Completou uma reflexão guiada com Beni.',
    color: '#7C3AED',
    category: 'coracao',
    check: ctx => flag(ctx, 'anyReflectionDone'),
  },
  {
    id: 'noah_reflection',
    emoji: '🕊️',
    title: 'Coração de Noé',
    desc: 'Refletiu sobre a história de Noé com Beni.',
    color: '#48CAE4',
    category: 'coracao',
    check: ctx => flag(ctx, 'noahReflectionDone'),
  },
  {
    id: 'jesus_reflection',
    emoji: '✨',
    title: 'Coração aberto',
    desc: 'Refletiu sobre Jesus e as Crianças com Beni.',
    color: '#F4B400',
    category: 'coracao',
    check: ctx => flag(ctx, 'jesusReflectionDone'),
  },
  {
    id: 'lumi_moment',
    emoji: '🌙',
    title: 'Primeiro momento',
    desc: 'Completou o Momento com Beni pela primeira vez.',
    color: '#A78BFA',
    category: 'coracao',
    check: ctx => flag(ctx, 'lumiMomentEverDone'),
  },
  {
    id: 'first_family_worship',
    emoji: '🏡',
    title: 'Primeiro cultinho',
    desc: 'Concluiu um Cultinho em Casa com Beni.',
    color: '#7C3AED',
    category: 'coracao',
    check: ctx => flag(ctx, 'familyWorshipDone'),
  },
  {
    id: 'first_chest_card',
    emoji: '🗝️',
    title: 'Primeira cartinha',
    desc: 'Encontrou sua primeira cartinha no Baú do Beni.',
    color: '#F4B400',
    category: 'jornada',
    // Desbloqueia ao encontrar uma cartinha real (qualquer ação que gere uma),
    // não a cartinha inicial do Beni. Defensivo com ctx hostil.
    check: ctx =>
      cnt(ctx, 'totalScenes') >= 1 ||
      cnt(ctx, 'savedDrawingCount') >= 1 ||
      flag(ctx, 'familyWorshipDone') ||
      flag(ctx, 'anyBookOpened') ||
      flag(ctx, 'anyReflectionDone') ||
      flag(ctx, 'lumiMomentEverDone'),
  },
];
