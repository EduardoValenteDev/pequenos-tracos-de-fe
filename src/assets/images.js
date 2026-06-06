/**
 * images.js — Manifest de imagens resolvidas por chave string.
 *
 * As capas oficiais das histórias (16:9) vêm do manifest central
 * src/assets/storyCovers.js (keyed por ID da história) e são expostas aqui
 * sob a chave `${storyId}_cover`, que é o valor de `imagemCapa` em stories.js.
 *
 * Assim todas as telas continuam resolvendo a capa via images[story.imagemCapa]
 * sem mudança de código nos consumidores.
 *
 * Nota: as antigas imagens de narração (noe_sorrindo, noe_apontando,
 * noe_arcoiris_capa, davi_golias_capa, jesus_criancas_capa) foram removidas do
 * projeto. As cenas que ainda as referenciam caem no fallback de gradiente
 * (NarrationScreen trata cenaImg ausente). Não há require para arquivo inexistente.
 */
import { STORY_COVERS } from './storyCovers';

// Expõe cada capa oficial sob a chave `${storyId}_cover`.
const COVER_IMAGES = Object.fromEntries(
  Object.entries(STORY_COVERS).map(([storyId, source]) => [`${storyId}_cover`, source]),
);

export const images = {
  ...COVER_IMAGES,
};
