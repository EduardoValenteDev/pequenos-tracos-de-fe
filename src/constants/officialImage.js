/**
 * officialImage.js — Padrão visual definitivo das imagens oficiais de cena (IA).
 *
 * As imagens oficiais agora são produzidas em RETRATO 4:5 (largura:altura).
 * Devem aparecer MAIORES e mais imersivas, porém SEM ocupar a tela inteira —
 * sempre sobra espaço confortável para texto, áudio, botões e Safe Area.
 *
 * O tamanho é RESPONSIVO: calculado a partir da altura útil da tela, mantendo
 * 4:5 real. Há dois perfis: "scene" (NarrationScreen) e "book" (Livrinho, um
 * pouco maior, mais protagonista).
 */

/** Proporção largura/altura das imagens de cena: 4:5 (retrato). */
export const OFFICIAL_IMAGE_ASPECT_RATIO = 4 / 5;

/** resizeMode da imagem oficial. Como o arquivo já é 4:5 num quadro 4:5, não corta. */
export const OFFICIAL_IMAGE_RESIZE_MODE = 'cover';

/**
 * Tamanho responsivo da imagem na NARRATIVA (cena comum).
 * ~46% da altura útil, largura derivada para manter 4:5, limites em telas
 * pequenas e tablets.
 */
export function computeSceneImageSize(screenW, screenH) {
  const ratio = OFFICIAL_IMAGE_ASPECT_RATIO; // w/h
  const maxH = screenH * 0.46;
  const maxW = Math.min(screenW * 0.92, 430);
  const width = Math.min(maxW, maxH * ratio);
  const height = width / ratio;
  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Tamanho responsivo da imagem no LIVRINHO (um pouco maior, mais protagonista).
 * ~56% da altura útil, mesma proporção 4:5.
 */
export function computeBookImageSize(screenW, screenH) {
  const ratio = OFFICIAL_IMAGE_ASPECT_RATIO;
  const maxH = screenH * 0.56;
  const maxW = Math.min(screenW * 0.94, 470);
  const width = Math.min(maxW, maxH * ratio);
  const height = width / ratio;
  return { width: Math.round(width), height: Math.round(height) };
}
