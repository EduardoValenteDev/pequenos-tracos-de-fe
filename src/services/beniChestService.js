/**
 * beniChestService.js — "Baú do Beni": cartinhas colecionáveis DERIVADAS de
 * dados que já existem (progresso de histórias, cenas concluídas, artes salvas,
 * Cultinho em Casa, Livrinho aberto, momentos com Beni).
 *
 * NÃO cria armazenamento pesado e NÃO coleta dado sensível: as cartinhas são
 * calculadas a partir do contexto recebido. Tudo é puro e defensivo — nunca
 * lança, mesmo com params null/undefined/incompletos.
 *
 * Única dependência: resolvers de imagem já existentes (assets locais).
 */
import { getOfficialSceneIllustration, getStoryCoverImage } from './storyImageService';

const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

function countDone(progressByStory, id) {
  const p = (progressByStory || {})[id] || {};
  try { return Object.values(p).filter(Boolean).length; } catch { return 0; }
}

/* Categorias visuais do baú (ordem de exibição na tela). */
export const CHEST_CATEGORIES = [
  { id: 'historias', label: 'Histórias', icon: '📖', color: '#2B5BA1' },
  { id: 'cenas',     label: 'Cenas',     icon: '🌄', color: '#5E9C3E' },
  { id: 'artes',     label: 'Artes',     icon: '🎨', color: '#EC407A' },
  { id: 'coracao',   label: 'Coração',   icon: '💛', color: '#F4731F' },
  { id: 'livrinho',  label: 'Livrinho',  icon: '📕', color: '#7C3AED' },
  { id: 'beni',      label: 'Beni',      icon: '🐑', color: '#F9C74F' },
];

/* Tipos de cartinha (rótulo visível no selo). */
export const CHEST_CARD_TYPES = {
  historia: 'História',
  cena: 'Cena',
  arte: 'Arte',
  coracao: 'Coração',
  livrinho: 'Livrinho',
  beni: 'Beni',
};

/* Raridades visuais (sem economia/ranking — só brilho). */
export const CHEST_RARITIES = ['common', 'special', 'shiny'];

/* Rótulo amigável de raridade. */
export const RARITY_LABEL = { common: 'Comum', special: 'Especial', shiny: 'Brilhante' };

/**
 * Fallback visual por categoria — usado quando uma cartinha desbloqueada não
 * tem imagem (ou enquanto ela carrega). Evita corpo vazio. Cores suaves do tema.
 */
export const CARD_FALLBACK = {
  historias: { grad: ['#E5ECF7', '#CBDBF1'], label: 'História guardada', icon: '📖' },
  cenas:     { grad: ['#EBF5E0', '#D6EBC4'], label: 'Cena da história', icon: '🌄' },
  artes:     { grad: ['#FCE4EE', '#F8CCDD'], label: 'Arte guardada',    icon: '🎨' },
  coracao:   { grad: ['#FFE9DC', '#FFD6BE'], label: 'Momento de fé',    icon: '💛' },
  livrinho:  { grad: ['#EFE6FB', '#DFCBF6'], label: 'Livrinho da Fé',   icon: '📕' },
  beni:      { grad: ['#FFF3CC', '#FCE6A8'], label: 'Beni',             icon: '🐑' },
};

/**
 * Normaliza a fonte de imagem de uma cartinha para o componente <Image>.
 * Aceita: uri base64 (string), require local (number), source objeto já pronto.
 * Retorna source válido ou null (nunca lança).
 */
export function resolveCardImageSource(card) {
  if (!card) return null;
  if (typeof card.uri === 'string' && card.uri) return { uri: card.uri };
  const img = card.image;
  if (img == null) return null;
  if (typeof img === 'number') return img;            // require do Metro
  if (typeof img === 'object') return img;            // { uri } ou asset já resolvido
  return null;
}

/**
 * Gera todas as cartinhas a partir dos dados disponíveis.
 * @param {object} params
 * @param {object} [params.progressByStory]
 * @param {Array}  [params.stories]
 * @param {Array}  [params.arts]   — meta de artes ({id,title,thumbnailBase64})
 * @param {object} [params.ctx]    — contexto de conquistas (achievementService.buildCtx)
 * @returns {Array} cartinhas
 */
export function buildBeniChestCards(params) {
  const { progressByStory, stories, arts, ctx } = params || {};
  const safeStories = Array.isArray(stories) ? stories : [];
  const safeArts = Array.isArray(arts) ? arts : [];
  const c = ctx || {};
  const cards = [];

  // ── Cartinha inicial do Beni (o baú nunca abre vazio) ──
  cards.push({
    id: 'beni_welcome', category: 'beni', type: CHEST_CARD_TYPES.beni, rarity: 'shiny',
    title: 'Olá, eu sou o Beni!', unlocked: true, beni: true,
    phrase: 'Cada aventura pode guardar uma nova lembrança.',
    origin: 'Sua primeira cartinha do baú.', color: '#F9C74F',
  });

  // ── Histórias (capa) — completa = shiny ──
  for (const s of safeStories) {
    if (!s || num(s.totalCenas) <= 0) continue;
    const done = countDone(progressByStory, s.id);
    const complete = done >= num(s.totalCenas);
    cards.push({
      id: `hist_${s.id}`, category: 'historias', type: CHEST_CARD_TYPES.historia,
      rarity: complete ? 'shiny' : 'common',
      title: s.titulo || 'Aventura', storyTitle: s.titulo || null, unlocked: done > 0,
      image: getStoryCoverImage(s.id), emoji: s.emoji || '📖',
      phrase: s.licaoCoracao || s.shortDescription || 'Uma aventura da fé.',
      origin: `Você encontrou isso em ${s.titulo || 'uma história'}.`,
      color: '#2B5BA1',
    });
  }

  // ── Cenas (uma por história iniciada — só desbloqueadas) ──
  for (const s of safeStories) {
    if (!s || num(s.totalCenas) <= 0) continue;
    if (countDone(progressByStory, s.id) <= 0) continue;
    const cena1 = Array.isArray(s.cenas) ? s.cenas[0] : null;
    cards.push({
      id: `cena_${s.id}`, category: 'cenas', type: CHEST_CARD_TYPES.cena, rarity: 'common',
      title: (cena1 && cena1.titulo) || `Cena de ${s.titulo || 'aventura'}`,
      storyTitle: s.titulo || null, unlocked: true,
      image: getOfficialSceneIllustration(s.id, cena1 && cena1.id) || getStoryCoverImage(s.id),
      emoji: (cena1 && cena1.emojiCena) || '🌄',
      phrase: 'Uma cena que você viveu.',
      origin: `Da história ${s.titulo || ''}.`.trim(),
      color: '#5E9C3E',
    });
  }

  // ── Artes (thumbnail do Ateliê) — special ──
  if (safeArts.length === 0) {
    cards.push({
      id: 'arte_locked', category: 'artes', type: CHEST_CARD_TYPES.arte, rarity: 'special',
      title: 'Sua primeira arte', unlocked: false, emoji: '🎨',
      phrase: 'Pinte e salve no Ateliê para guardar aqui.',
      origin: 'Salve uma arte no Ateliê para encontrar.',
      hint: 'Dica: pinte e salve uma arte no Ateliê.', color: '#EC407A',
    });
  } else {
    safeArts.slice(0, 12).forEach((a, i) => {
      cards.push({
        id: `arte_${(a && a.id) || i}`, category: 'artes', type: CHEST_CARD_TYPES.arte, rarity: 'special',
        title: (a && a.title) || 'Minha arte', unlocked: true,
        uri: (a && a.thumbnailBase64) || null, emoji: '🎨',
        phrase: 'Uma arte sua, guardada com carinho.',
        origin: 'Essa cartinha veio do seu Ateliê.', color: '#EC407A',
      });
    });
  }

  // ── Coração (reflexão, cultinho, momento) — special ──
  cards.push({
    id: 'cor_reflexao', category: 'coracao', type: CHEST_CARD_TYPES.coracao, rarity: 'special',
    title: 'Conversa com Beni', unlocked: !!c.anyReflectionDone, beni: true,
    phrase: 'Você abriu seu coração numa reflexão.',
    origin: 'De uma reflexão com Beni.',
    hint: 'Dica: termine uma história e converse com Beni.', color: '#F4731F',
  });
  cards.push({
    id: 'cor_cultinho', category: 'coracao', type: CHEST_CARD_TYPES.coracao, rarity: 'special',
    title: 'Cultinho em Casa', unlocked: !!c.familyWorshipDone, emoji: '🏡',
    phrase: 'Um momento de fé em família.',
    origin: 'Do Cultinho em Casa.',
    hint: 'Dica: faça um Cultinho em Casa com a família.', color: '#F4731F',
  });
  cards.push({
    id: 'cor_momento', category: 'coracao', type: CHEST_CARD_TYPES.coracao, rarity: 'special',
    title: 'Momento com Beni', unlocked: !!c.lumiMomentEverDone, emoji: '🌙',
    phrase: 'Um versículo guardado no coração.',
    origin: 'Do Momento com Beni.',
    hint: 'Dica: abra um Momento com Beni.', color: '#F4731F',
  });

  // ── Livrinho — shiny ──
  cards.push({
    id: 'livro_primeiro', category: 'livrinho', type: CHEST_CARD_TYPES.livrinho, rarity: 'shiny',
    title: 'Livrinho da Fé', unlocked: !!c.anyBookOpened, emoji: '📕',
    phrase: 'Sua história virou um livrinho.',
    origin: 'De abrir o Livrinho da Fé.',
    hint: 'Dica: termine uma história e abra o Livrinho.', color: '#7C3AED',
  });

  return cards;
}

/** Resumo seguro: { unlocked, total }. */
export function getBeniChestSummary(cards) {
  const list = Array.isArray(cards) ? cards : [];
  const unlocked = list.filter(c => c && c.unlocked).length;
  return { unlocked, total: list.length };
}

/** Próxima cartinha a encontrar (primeira bloqueada) ou null. */
export function getNextChestCard(cards) {
  const list = Array.isArray(cards) ? cards : [];
  return list.find(c => c && !c.unlocked) || null;
}
