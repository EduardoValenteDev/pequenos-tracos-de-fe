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
 * Categorias do Álbum de Estrelinhas (UX 1.0 — Bloco 4D). Quatro grupos claros:
 *   Histórias · Cenas · Ateliê · Momentos com Beni.
 * Estrelinhas = progresso (não é o Baú, que guarda lembranças).
 * Mapeamento puramente visual — não altera a lógica de desbloqueio.
 */
export const ACHIEVEMENT_CATEGORIES = [
  { id: 'historias', label: 'Histórias',          icon: '📖', color: '#2B5BA1' },
  { id: 'cenas',     label: 'Cenas',              icon: '⭐', color: '#F9C74F' },
  // ⚠️ id 'atelie' é DADO LEGADO (conquistas já desbloqueadas apontam para ele).
  // NÃO renomear o id. Bloco 1.2: só o RÓTULO visível mudou — "Ateliê" sumiu da UI.
  // Não virou "Brincar" para não colidir com a categoria nova abaixo.
  { id: 'atelie',    label: 'Minhas artes',       icon: '🎨', color: '#EC407A' },
  { id: 'momentos',  label: 'Momentos com Beni',  icon: '💛', color: '#7C3AED' },
  // Bloco 1.1 — categoria NOVA do Brincar. Nasce sem conquistas: `TrophiesScreen`
  // pula categorias vazias, então ela é invisível até os jogos existirem.
  // Sem emoji por decisão de produto: usa `faithIcon` (ver src/components/ui/FaithIcon.js).
  { id: 'brincar',   label: 'Brincar',            faithIcon: 'brincar', color: '#0E9F6E' },
];

/**
 * Cada conquista mede UMA unidade só (cenas, histórias, artes ou um momento).
 * `how`    — como conquistar (mostrado quando bloqueada/em progresso).
 * `earned` — como conquistou (mostrado quando concluída).
 * Título e progresso usam SEMPRE a mesma unidade (sem misturar estrelas/cenas).
 */
export const ACHIEVEMENTS = [
  // ── Cenas (mede totalScenes) ──
  {
    id: 'first_scene',
    emoji: '⭐',
    title: 'Primeira cena',
    desc: 'Complete sua primeira cena de qualquer história.',
    how: 'Complete sua primeira cena para ganhar.',
    earned: 'Você ganhou ao completar sua primeira cena.',
    color: '#FFD166',
    category: 'cenas',
    check: ctx => cnt(ctx, 'totalScenes') >= 1,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 1)} de 1 cena`,
    progress: ctx => mk(ctx, 'totalScenes', 1),
  },
  {
    id: 'five_stars',
    emoji: '🌟',
    title: 'Cinco cenas',
    desc: 'Complete 5 cenas ao todo. Você está voando!',
    how: 'Complete 5 cenas para ganhar.',
    earned: 'Você ganhou ao completar 5 cenas.',
    color: colors.success,
    category: 'cenas',
    check: ctx => cnt(ctx, 'totalScenes') >= 5,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 5)} de 5 cenas`,
    progress: ctx => mk(ctx, 'totalScenes', 5),
  },
  {
    id: 'ten_stars',
    emoji: '💛',
    title: 'Dez cenas',
    desc: 'Complete 10 cenas. Que jornada incrível!',
    how: 'Complete 10 cenas para ganhar.',
    earned: 'Você ganhou ao completar 10 cenas.',
    color: colors.primaryDark,
    category: 'cenas',
    check: ctx => cnt(ctx, 'totalScenes') >= 10,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 10)} de 10 cenas`,
    progress: ctx => mk(ctx, 'totalScenes', 10),
  },
  {
    id: 'fifteen_stars',
    emoji: '🔥',
    title: 'Quinze cenas',
    desc: 'Incrível! 15 cenas concluídas na sua jornada.',
    how: 'Complete 15 cenas para ganhar.',
    earned: 'Você ganhou ao completar 15 cenas.',
    color: '#E87722',
    category: 'cenas',
    check: ctx => cnt(ctx, 'totalScenes') >= 15,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 15)} de 15 cenas`,
    progress: ctx => mk(ctx, 'totalScenes', 15),
  },
  {
    id: 'thirty_stars',
    emoji: '🌠',
    title: 'Trinta cenas',
    desc: 'Complete 30 cenas. Você é dedicado!',
    how: 'Complete 30 cenas para ganhar.',
    earned: 'Você ganhou ao completar 30 cenas.',
    color: '#5C6BC0',
    category: 'cenas',
    check: ctx => cnt(ctx, 'totalScenes') >= 30,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 30)} de 30 cenas`,
    progress: ctx => mk(ctx, 'totalScenes', 30),
  },
  {
    id: 'fifty_stars',
    emoji: '🎖️',
    title: 'Cinquenta cenas',
    desc: '50 cenas! Você está construindo algo lindo.',
    how: 'Complete 50 cenas para ganhar.',
    earned: 'Você ganhou ao completar 50 cenas.',
    color: '#EC407A',
    category: 'cenas',
    check: ctx => cnt(ctx, 'totalScenes') >= 50,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'totalScenes'), 50)} de 50 cenas`,
    progress: ctx => mk(ctx, 'totalScenes', 50),
  },

  // ── Histórias (mede completedStories / flags de história) ──
  {
    id: 'first_story',
    emoji: '🏆',
    title: 'Primeira aventura',
    desc: 'Termine todas as cenas de uma história.',
    how: 'Termine todas as cenas de uma história para ganhar.',
    earned: 'Você ganhou ao completar sua primeira história.',
    color: colors.action,
    category: 'historias',
    // A6: acende quando QUALQUER história foi concluída de ponta a ponta — via
    // contagem (completedStories) OU por qualquer flag de história específica
    // (anyStoryComplete). Garante que "Guardião da Criação" nunca acenda sozinho.
    check: ctx => cnt(ctx, 'completedStories') >= 1 || flag(ctx, 'anyStoryComplete'),
    progressLabel: ctx => `${Math.min(cnt(ctx, 'completedStories'), 1)} de 1 história`,
    progress: ctx => mk(ctx, 'completedStories', 1),
  },
  {
    id: 'creation_complete',
    emoji: '🌍',
    title: 'Guardião da Criação',
    desc: 'Completou a história da Criação do início ao fim.',
    how: 'Complete a história da Criação para ganhar.',
    earned: 'Você ganhou ao completar a história da Criação.',
    color: '#2E9E5B',
    category: 'historias',
    check: ctx => flag(ctx, 'creationComplete'),
  },
  {
    id: 'noah_done',
    emoji: '🌈',
    title: 'Noé e o Sinal da Aliança',
    desc: 'Completou a história de Noé do início ao fim.',
    how: 'Complete a história de Noé para ganhar.',
    earned: 'Você ganhou ao completar a história de Noé.',
    color: '#4FC3F7',
    category: 'historias',
    check: ctx => flag(ctx, 'noahComplete'),
  },
  {
    id: 'three_stories',
    emoji: '📚',
    title: 'Três aventuras',
    desc: 'Complete 3 histórias diferentes, pequeno aventureiro!',
    how: 'Complete 3 histórias para ganhar.',
    earned: 'Você ganhou ao completar 3 histórias.',
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
    how: 'Comece a história de Davi e Golias para ganhar.',
    earned: 'Você ganhou ao começar a história de Davi.',
    color: '#E67E22',
    category: 'historias',
    check: ctx => flag(ctx, 'davidAnyScene'),
  },
  {
    id: 'jesus_start',
    emoji: '💛',
    title: 'Com Jesus',
    desc: 'Completou a primeira cena de Jesus e as Crianças.',
    how: 'Complete a 1ª cena de Jesus e as Crianças para ganhar.',
    earned: 'Você ganhou ao completar a 1ª cena de Jesus e as Crianças.',
    color: '#F4B400',
    category: 'historias',
    check: ctx => flag(ctx, 'jesusScene1Done'),
  },
  {
    id: 'david_scene1',
    emoji: '⚔️',
    title: 'Corajoso como Davi',
    desc: 'Completou a cena 1 da história de Davi.',
    how: 'Complete a cena 1 de Davi para ganhar.',
    earned: 'Você ganhou ao completar a cena 1 de Davi.',
    color: '#C0392B',
    category: 'historias',
    check: ctx => flag(ctx, 'davidScene1Done'),
  },
  {
    id: 'first_free_story_done',
    emoji: '🌈',
    title: 'Primeira história grátis',
    desc: 'Completou uma história da trilha gratuita Comece Aqui.',
    how: 'Complete uma história da trilha Comece Aqui para ganhar.',
    earned: 'Você ganhou ao completar uma história gratuita.',
    color: '#4FC3F7',
    category: 'historias',
    check: ctx => flag(ctx, 'noahComplete') || flag(ctx, 'creationComplete'),
  },
  {
    id: 'comece_aqui_complete',
    emoji: '✨',
    title: 'Comece Aqui, completa!',
    desc: 'Completou a trilha Comece Aqui.',
    how: 'Complete a trilha Comece Aqui para ganhar.',
    earned: 'Você ganhou ao completar a trilha Comece Aqui.',
    color: '#F4B400',
    category: 'historias',
    check: ctx => flag(ctx, 'noahComplete') && flag(ctx, 'creationComplete'),
  },
  {
    id: 'first_premium_story_done',
    emoji: '💎',
    title: 'Primeira aventura especial',
    desc: 'Completou sua primeira história da trilha Plano Família.',
    how: 'Complete uma história da trilha Plano Família para ganhar.',
    earned: 'Você ganhou ao completar uma história do Plano Família.',
    color: '#AB47BC',
    category: 'historias',
    check: ctx => flag(ctx, 'davidComplete') || flag(ctx, 'jesusComplete'),
  },
  {
    id: 'descobridores_complete',
    emoji: '🔍',
    title: 'Trilha Descobridores!',
    desc: 'Completou todas as 6 histórias da Trilha Descobridores.',
    how: 'Complete as 6 histórias da Trilha Descobridores para ganhar.',
    earned: 'Você ganhou ao completar a Trilha Descobridores.',
    color: '#26A69A',
    category: 'historias',
    check: ctx => flag(ctx, 'descobridoresComplete'),
  },
  {
    id: 'jovens_da_fe_complete',
    emoji: '📖',
    title: 'Trilha Jovens da Fé!',
    desc: 'Completou todas as 6 histórias da Trilha Jovens da Fé.',
    how: 'Complete as 6 histórias da Trilha Jovens da Fé para ganhar.',
    earned: 'Você ganhou ao completar a Trilha Jovens da Fé.',
    color: '#7E57C2',
    category: 'historias',
    check: ctx => flag(ctx, 'jovensDaFeComplete'),
  },
  {
    id: 'all_stories_complete',
    emoji: '🏅',
    title: 'Caminhante da Fé!',
    desc: 'Completou todas as 20 histórias do app. Incrível!',
    how: 'Complete todas as 20 histórias para ganhar.',
    earned: 'Você ganhou ao completar todas as 20 histórias.',
    color: '#F4B400',
    category: 'historias',
    check: ctx => flag(ctx, 'allStoriesComplete'),
  },

  // ── Ateliê (mede artes salvas) ──
  {
    id: 'first_drawing',
    emoji: '🎨',
    title: 'Primeiro traço',
    desc: 'Salve seu primeiro desenho colorido.',
    how: 'Salve uma arte em Brincar para desbloquear.',
    earned: 'Você ganhou ao salvar sua primeira arte.',
    color: colors.secondary,
    category: 'atelie',
    // [P3J] CONTINUA VIVA e continua sendo objetivo. `hasAnyDrawing` passou a reconhecer TAMBÉM
    // obra concluída do Colorir com o Beni (ver achievementService), além dos desenhos legados já
    // registrados — quem já tinha, mantém; quem chegar agora, conquista pintando no C60.
    // NÃO é aposentada: o caminho existe, só depende do portão do C60 abrir (Achado 4).
    check: ctx => flag(ctx, 'hasAnyDrawing'),
  },
  {
    id: 'artist_ark',
    emoji: '⛵',
    title: 'Artista da arca',
    desc: 'Salvou o desenho da cena de Noé.',
    how: 'Salve o desenho da cena de Noé para ganhar.',
    earned: 'Você ganhou ao salvar o desenho da arca.',
    color: colors.primary,
    category: 'atelie',
    // [P3J] CONQUISTA LEGADA APOSENTADA. Dependia do lineart de colorir da cena 1 de Noé, que a
    // aposentadoria do Colorir legado removeu do app — não há mais como pintá-lo. Decisão do
    // fundador, ponto a ponto: o `id` é preservado (é dado gravado no aparelho de quem já ganhou),
    // o `check` é preservado (quem tem `hasArkDrawing` continua tendo — nada é revogado), o
    // significado NÃO é reciclado para outra coisa, e ela deixa de ser oferecida como objetivo a
    // quem ainda não a tem. Nenhuma substituta é criada aqui.
    //
    // `retired` NÃO altera o desbloqueio: é só visibilidade (ver `isAchievementVisible`). Quem
    // conquistou continua vendo a estrelinha exatamente como antes; quem não conquistou nunca vê
    // um card trancado e impossível — nem no álbum, nem no contador, nem como "próxima conquista".
    retired: true,
    retiredReason: 'O desenho da arca fazia parte do Colorir legado, aposentado no P3J.',
    check: ctx => flag(ctx, 'hasArkDrawing'),
  },
  {
    id: 'gallery_started',
    emoji: '🖼️',
    title: 'Galeria crescendo',
    desc: 'Salvou 2 ou mais desenhos no ateliê.',
    how: 'Salve 2 artes em Brincar para ganhar.',
    earned: 'Você ganhou ao salvar 2 artes.',
    color: '#9B59B6',
    category: 'atelie',
    check: ctx => cnt(ctx, 'savedDrawingCount') >= 2,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'savedDrawingCount'), 2)} de 2 artes`,
    progress: ctx => mk(ctx, 'savedDrawingCount', 2),
  },
  {
    id: 'little_artist_faith',
    emoji: '🖌️',
    title: 'Pequeno artista da fé',
    desc: 'Guardou 3 artes no seu ateliê. Que talento!',
    how: 'Salve 3 artes em Brincar para ganhar.',
    earned: 'Você ganhou ao salvar 3 artes.',
    color: '#EC407A',
    category: 'atelie',
    check: ctx => cnt(ctx, 'savedDrawingCount') >= 3,
    progressLabel: ctx => `${Math.min(cnt(ctx, 'savedDrawingCount'), 3)} de 3 artes`,
    progress: ctx => mk(ctx, 'savedDrawingCount', 3),
  },

  // ── Momentos com Beni (quiz, livrinho, reflexão, cultinho, momento) ──
  {
    id: 'first_quiz',
    emoji: '🧩',
    title: 'Quiz respondido',
    desc: 'Respondeu ao quiz de uma história pela primeira vez.',
    how: 'Responda o quiz de uma história para ganhar.',
    earned: 'Você ganhou ao responder seu primeiro quiz.',
    color: '#2ECC71',
    category: 'momentos',
    check: ctx => flag(ctx, 'anyQuizDone'),
  },
  {
    id: 'first_book_opened',
    emoji: '📖',
    title: 'Primeiro Livrinho',
    desc: 'Abriu o seu Livrinho da Fé pela primeira vez.',
    how: 'Abra o seu Livrinho da Fé para ganhar.',
    earned: 'Você ganhou ao abrir o Livrinho da Fé.',
    color: '#7C3AED',
    category: 'momentos',
    check: ctx => flag(ctx, 'anyBookOpened'),
  },
  {
    id: 'first_reflection',
    emoji: '🐑',
    title: 'Conversei com Beni',
    desc: 'Completou uma reflexão guiada com Beni.',
    how: 'Faça uma reflexão com Beni para ganhar.',
    earned: 'Você ganhou ao guardar no coração com Beni.',
    color: '#7C3AED',
    category: 'momentos',
    check: ctx => flag(ctx, 'anyReflectionDone'),
  },
  {
    id: 'noah_reflection',
    emoji: '🕊️',
    title: 'Coração de Noé',
    desc: 'Refletiu sobre a história de Noé com Beni.',
    how: 'Reflita sobre a história de Noé para ganhar.',
    earned: 'Você ganhou ao refletir sobre Noé.',
    color: '#48CAE4',
    category: 'momentos',
    check: ctx => flag(ctx, 'noahReflectionDone'),
  },
  {
    id: 'jesus_reflection',
    emoji: '✨',
    title: 'Coração aberto',
    desc: 'Refletiu sobre Jesus e as Crianças com Beni.',
    how: 'Reflita sobre Jesus e as Crianças para ganhar.',
    earned: 'Você ganhou ao refletir sobre Jesus.',
    color: '#F4B400',
    category: 'momentos',
    check: ctx => flag(ctx, 'jesusReflectionDone'),
  },
  {
    id: 'lumi_moment',
    emoji: '🌙',
    title: 'Primeiro momento',
    desc: 'Completou o Momento com Beni pela primeira vez.',
    how: 'Abra um Momento com Beni para ganhar.',
    earned: 'Você ganhou ao viver um Momento com Beni.',
    color: '#A78BFA',
    category: 'momentos',
    check: ctx => flag(ctx, 'lumiMomentEverDone'),
  },
  {
    id: 'first_family_worship',
    emoji: '🏡',
    title: 'Primeiro cultinho',
    desc: 'Concluiu um Cultinho em Casa com Beni.',
    how: 'Faça um Cultinho em Casa para ganhar.',
    earned: 'Você ganhou ao fazer um Cultinho em Casa.',
    color: '#7C3AED',
    category: 'momentos',
    check: ctx => flag(ctx, 'familyWorshipDone'),
  },
  {
    id: 'first_chest_card',
    emoji: '✨',
    title: 'Primeira conquista',
    desc: 'Deu o primeiro passo na sua jornada com Beni.',
    how: 'Viva qualquer momento da jornada para ganhar.',
    earned: 'Você ganhou ao começar sua jornada com Beni.',
    color: '#F4B400',
    category: 'momentos',
    // Desbloqueia ao viver qualquer primeiro momento real. Defensivo com ctx hostil.
    check: ctx =>
      cnt(ctx, 'totalScenes') >= 1 ||
      cnt(ctx, 'savedDrawingCount') >= 1 ||
      flag(ctx, 'familyWorshipDone') ||
      flag(ctx, 'anyBookOpened') ||
      flag(ctx, 'anyReflectionDone') ||
      flag(ctx, 'lumiMomentEverDone'),
  },

  // ── Brincar (Bloco 1.3) ────────────────────────────────────────────────────
  // Categoria NOVA: nenhuma conquista antiga muda de id, categoria ou texto.
  // Estas usam `faithIcon` (sem emoji). O ctx vem de brincarStatsService.
  {
    id: 'brincar_first_game',
    faithIcon: 'brincar',
    title: 'Primeira brincadeira',
    desc: 'Terminou um jogo do Beni pela primeira vez.',
    how: 'Termine uma partida em Brincar para ganhar.',
    earned: 'Você ganhou ao terminar sua primeira partida.',
    color: '#0E9F6E',
    category: 'brincar',
    check: ctx => cnt(ctx, 'paresPlays') >= 1,
  },
  {
    id: 'brincar_three_games',
    faithIcon: 'pares',
    title: 'Já pegou o jeito',
    desc: 'Terminou três partidas de Pares do Beni.',
    how: 'Termine 3 partidas de Pares do Beni.',
    earned: 'Você ganhou ao terminar 3 partidas.',
    color: '#2B5BA1',
    category: 'brincar',
    progress: ctx => mk(ctx, 'paresPlays', 3),
    progressLabel: ctx => `${Math.min(cnt(ctx, 'paresPlays'), 3)} de 3 partidas`,
    check: ctx => cnt(ctx, 'paresPlays') >= 3,
  },
  {
    id: 'brincar_pares_medio',
    faithIcon: 'pares',
    title: 'Memória afiada',
    desc: 'Venceu Pares do Beni no nível Médio.',
    how: 'Termine uma partida no nível Médio.',
    earned: 'Você ganhou ao vencer no nível Médio.',
    color: '#F4B23C',
    category: 'brincar',
    check: ctx => flag(ctx, 'paresWinMedio'),
  },
  {
    id: 'brincar_pares_dificil',
    faithIcon: 'pares',
    title: 'Memória de campeão',
    desc: 'Venceu Pares do Beni no nível Difícil.',
    how: 'Termine uma partida no nível Difícil.',
    earned: 'Você ganhou ao vencer no nível Difícil.',
    color: '#7C3AED',
    category: 'brincar',
    check: ctx => flag(ctx, 'paresWinDificil'),
  },
  {
    id: 'brincar_poucos_erros',
    faithIcon: 'brincar',
    title: 'Olhar atento',
    desc: 'Terminou uma partida com pouquíssimos erros.',
    how: 'Termine uma partida errando poucas vezes.',
    earned: 'Você ganhou ao terminar quase sem errar.',
    color: '#EC407A',
    category: 'brincar',
    check: ctx => flag(ctx, 'paresPoucosErros'),
  },
];

/**
 * [P3J] Uma conquista LEGADA APOSENTADA (`retired: true`) é aquela cujo caminho de conquista
 * deixou de existir no app. Ela não é apagada — o id continua válido, o `check` continua sendo
 * avaliado e quem já a conquistou continua vendo a estrelinha exatamente como antes. O que muda é
 * só isto: ela para de ser OFERECIDA a quem não a tem, porque um objetivo impossível exibido como
 * "bloqueado" é uma promessa que o app não pode cumprir — e, para uma criança, um card trancado
 * para sempre é frustração pura, além de deixar o álbum eternamente incompleto.
 *
 * PURA e defensiva: sem ctx, sem I/O, sem React — o smoke avalia direto. `unlocked` é o resultado
 * do `check` que o chamador já apurou; só `true` (estrito) revela uma aposentada.
 *
 * @param {{ retired?: boolean }} achievement
 * @param {boolean} unlocked — a conquista está desbloqueada para ESTE usuário?
 * @returns {boolean} deve aparecer no álbum, no contador e como próxima conquista?
 */
export function isAchievementVisible(achievement, unlocked) {
  if (!achievement || achievement.retired !== true) return true;
  return unlocked === true;
}
