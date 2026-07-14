/**
 * monteACenaStories.js — FONTE ÚNICA ORIENTADA A HISTÓRIAS de "Monte a Cena" (M1R6 · expandido M1R8B).
 *
 * A criança escolhe uma HISTÓRIA e depois um QUADRO. Aqui AGRUPAMOS as cenas já `approved` do catálogo
 * (`monteACenaCatalog.js`, fonte única de aprovação) por história — ATÉ 10 quadros cada (sem limite
 * artificial de 4). Nenhuma cena bloqueada aparece. Acesso via `isFreePuzzleStory` (A Criação e Noé
 * grátis; as outras 18 no Plano Família). Uma cena aparece UMA vez; a dificuldade vem depois.
 *
 * Conclusão de uma coleção (M1R8B §6): `approvedScenes.length > 0 && completed === approvedScenes.length`
 * (NÃO exige exatamente 4 quadros).
 */

import {
  MONTE_A_CENA_CATALOG,
  MONTE_A_CENA_STORY_ORDER,
  MONTE_A_CENA_TOTALS,
  MONTE_A_CENA_BLOCKED,
  isFreePuzzleStory,
  getCatalogSceneSource,
} from './monteACenaCatalog';

/** Alvo por história: até 10 quadros (uma ilustração oficial = um quadro). */
export const MAX_SCENES_PER_STORY = 10;
export { isFreePuzzleStory, MONTE_A_CENA_TOTALS, MONTE_A_CENA_BLOCKED };

/** Frase curta por coleção (opcional; fallback genérico). */
const STORY_PHRASE = {
  creation: 'Sete dias e um mundo inteiro feito com amor.',
  noah: 'Deus cuidou de cada família e de cada bichinho na arca.',
  david_goliath: 'O menino corajoso que confiou em Deus.',
  jesus_children: 'Jesus abre os braços para cada criança.',
  daniel_lions: 'A fé de Daniel fechou a boca dos leões.',
  esther_queen: 'Uma rainha corajosa para uma hora importante.',
  lost_sheep: 'O pastor que não desiste de nenhuma ovelhinha.',
  good_samaritan: 'O amor que para para cuidar de quem precisa.',
  abraham_stars: 'Uma promessa tão grande quanto o céu estrelado.',
  joseph_colorful_coat: 'De sonhos e perdão nasce um final feliz.',
  moses_red_sea: 'Deus abriu um caminho no meio do mar.',
  ruth_naomi: 'Um amor fiel que ficou junto até o fim.',
  miraculous_catch: 'As redes cheias de uma pesca milagrosa.',
  jonah_big_fish: 'Uma segunda chance dentro do grande peixe.',
  samuel_hears_god: 'O menino que aprendeu a ouvir a voz de Deus.',
  josiah_young_king: 'Um rei bem jovem que amou a Palavra de Deus.',
  solomon_wisdom: 'O rei que pediu sabedoria para cuidar do povo.',
  mary_says_yes: 'Maria disse sim à boa notícia do céu.',
  timothy_faith: 'Uma fé passada com carinho, de geração em geração.',
  jesus_temple: 'O menino Jesus na casa do seu Pai.',
};

/** Agrupa as cenas APROVADAS por história (até 10, na ordem da cena) e monta as 20 histórias. */
function buildStories() {
  const byStory = {};
  for (const scene of MONTE_A_CENA_CATALOG) {
    if (!byStory[scene.storyId]) byStory[scene.storyId] = [];
    byStory[scene.storyId].push(scene);
  }
  const stories = [];
  for (const { storyId, storyTitle, sortOrder } of MONTE_A_CENA_STORY_ORDER) {
    const scenes = (byStory[storyId] || [])
      .slice()
      .sort((a, b) => a.sceneNumber - b.sceneNumber) // até 10; SEM corte artificial
      .map((s, idx) => Object.freeze({
        puzzleSceneId: s.puzzleSceneId,
        storyId: s.storyId,
        sceneNumber: s.sceneNumber,
        title: s.title,
        premium: !!s.premium,
        crop: s.crop,
        artWidth: s.artWidth,
        artHeight: s.artHeight,
        allowedPieceCounts: s.allowedPieceCounts || [4, 6, 9],
        contentStatus: s.contentStatus,
        sortOrder: idx + 1,
      }));
    const premium = !isFreePuzzleStory(storyId);
    stories.push(Object.freeze({
      storyId,
      storyTitle,
      sortOrder,
      premium,
      accessType: premium ? 'premium' : 'free',
      collectionPhrase: STORY_PHRASE[storyId] || 'Escolha um quadro e monte este momento.',
      coverSceneId: scenes[0] ? scenes[0].puzzleSceneId : null,
      quadrosTotal: scenes.length,
      quadrosTarget: MAX_SCENES_PER_STORY,
      puzzleScenes: scenes,
    }));
  }
  return stories.sort((a, b) => a.sortOrder - b.sortOrder);
}

export const MONTE_A_CENA_STORIES = Object.freeze(buildStories());

export function getStory(storyId) {
  return MONTE_A_CENA_STORIES.find((s) => s.storyId === storyId) || null;
}

/** Cenas (quadros) APROVADAS de uma história. */
export function getStoryScenes(story) {
  return story ? story.puzzleScenes : [];
}

/** Procura um quadro (cena) por id em todas as histórias. */
export function getPuzzleScene(puzzleSceneId) {
  for (const st of MONTE_A_CENA_STORIES) {
    const found = st.puzzleScenes.find((p) => p.puzzleSceneId === puzzleSceneId);
    if (found) return found;
  }
  return null;
}

/** História à qual um quadro pertence. */
export function getStoryForScene(puzzleSceneId) {
  return MONTE_A_CENA_STORIES.find((st) => st.puzzleScenes.some((p) => p.puzzleSceneId === puzzleSceneId)) || null;
}

/** Próximo quadro dentro da MESMA história; null se for o último. */
export function getNextSceneInStory(puzzleSceneId) {
  const story = getStoryForScene(puzzleSceneId);
  if (!story) return null;
  const i = story.puzzleScenes.findIndex((p) => p.puzzleSceneId === puzzleSceneId);
  return i >= 0 && i < story.puzzleScenes.length - 1 ? story.puzzleScenes[i + 1] : null;
}

/** Fonte (imagem) da capa da história = ilustração do 1º quadro aprovado. Sem asset novo. */
export function getStoryCoverSource(story) {
  if (!story) return null;
  const cover = story.puzzleScenes.find((p) => p.puzzleSceneId === story.coverSceneId) || story.puzzleScenes[0];
  return cover ? getCatalogSceneSource(cover) : null;
}

/** Fonte (imagem) de um quadro. */
export function getStorySceneSource(scene) {
  return scene ? getCatalogSceneSource(scene) : null;
}

export default MONTE_A_CENA_STORIES;
