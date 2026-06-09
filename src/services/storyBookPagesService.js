/**
 * storyBookPagesService — monta lista segura de páginas para o Livrinho da Fé.
 *
 * Prioridade de imagem por página:
 *   1. Desenho da criança (hasMeaningfulPaint)
 *   2. Ilustração oficial da cena
 *   3. null — tela trata como fallback
 *
 * Nunca lança: retorna [] em qualquer falha.
 */
import { getSavedDrawing, hasMeaningfulPaint } from './drawingStorage';
import { getOfficialSceneIllustration } from './storyImageService';

/**
 * Retorna array de páginas. Cada item tem:
 *   id, sceneNumber, title, text, image, imageSourceLabel, isCompleted, hasChildDrawing
 */
export async function buildLivrinhoPages(story, progressByStory = {}) {
  if (!story?.cenas?.length) return [];
  const progresso = progressByStory?.[story.id] ?? {};
  try {
    return await Promise.all(
      story.cenas.map(async (cena, i) => {
        let image = null;
        let imageSourceLabel = 'Página preparada';
        let hasChildDrawing = false;
        try {
          const raw = await getSavedDrawing(story.id, cena.id);
          if (hasMeaningfulPaint(raw)) {
            image = raw;
            imageSourceLabel = 'Desenho da criança';
            hasChildDrawing = true;
          } else {
            const official = getOfficialSceneIllustration(story.id, cena.id);
            if (official) {
              image = official;
              imageSourceLabel = 'Ilustração da história';
            }
          }
        } catch {
          /* fallback: image fica null */
        }
        return {
          id: cena.id,
          sceneNumber: i + 1,
          title: cena.titulo ?? `Cena ${i + 1}`,
          text: cena.textoNarracao ?? cena.narracao ?? '',
          image,
          imageSourceLabel,
          isCompleted: !!progresso[cena.id],
          hasChildDrawing,
        };
      }),
    );
  } catch {
    return [];
  }
}
