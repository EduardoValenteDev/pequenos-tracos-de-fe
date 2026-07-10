/**
 * gameCardFraming.js — enquadramento das CAPAS dentro das cartas dos jogos (Bloco 1.4).
 *
 * As capas das histórias são panorâmicas (≈16:9). A carta é quase quadrada. Um recorte
 * centrado descarta as laterais — e alguns personagens vivem exatamente ali. O caso mais
 * grave era Abraão, encostado na borda direita: a carta mostrava só o céu estrelado.
 *
 * Aqui NÃO se altera nenhuma imagem: só se declara ONDE olhar. Cada ajuste é um ponto
 * focal em coordenadas normalizadas do recorte:
 *
 *   focalX / focalY — 0 = borda esquerda/topo · 0.5 = centro · 1 = borda direita/base
 *   zoom            — >1 aproxima (recorte menor). Só quando o ponto focal sozinho
 *                     não basta, porque o personagem está colado numa borda.
 *
 * O padrão (0.5 / 0.5 / 1) reproduz exatamente o `resizeMode="cover"` de antes, então
 * nenhuma carta muda sem estar listada abaixo.
 *
 * Ajustes decididos olhando o recorte real de cada uma das 20 capas.
 */

const PADRAO = Object.freeze({ focalX: 0.5, focalY: 0.5, zoom: 1 });

const AJUSTES = Object.freeze({
  // Abraão está a ~82% da largura, colado na borda direita: nenhum ponto focal
  // sozinho o centraliza. Aproximar 1.45× reduz o recorte o bastante para ele caber.
  abraham_stars: { focalX: 1, focalY: 0.55, zoom: 1.45 },

  // Moisés está à esquerda, com o cajado erguido; o recorte central o cortava ao meio.
  moses_red_sea: { focalX: 0.3, focalY: 0.5, zoom: 1 },

  // Salomão está à esquerda do trono; o recorte central cortava o rosto na borda.
  solomon_wisdom: { focalX: 0.37, focalY: 0.45, zoom: 1 },
});

/** Enquadramento de uma história. Sem ajuste declarado → recorte centrado (padrão). */
export function getCardFraming(storyId) {
  return AJUSTES[storyId] || PADRAO;
}

/**
 * Traduz o enquadramento para a geometria de uma imagem dentro da carta.
 * Devolve o tamanho da imagem já escalada e o deslocamento (left/top) que coloca
 * o ponto focal no lugar certo. Puro: sem React, sem side effects.
 *
 * @param {number} srcW  largura real do asset
 * @param {number} srcH  altura real do asset
 * @param {number} boxW  largura da carta
 * @param {number} boxH  altura da carta
 */
export function computeCardImageLayout(srcW, srcH, boxW, boxH, framing = PADRAO) {
  const sw = Number(srcW) > 0 ? Number(srcW) : 1;
  const sh = Number(srcH) > 0 ? Number(srcH) : 1;
  const w = Number(boxW) > 0 ? Number(boxW) : 0;
  const h = Number(boxH) > 0 ? Number(boxH) : 0;

  const zoom = Number(framing?.zoom) > 0 ? Number(framing.zoom) : 1;
  const fx = Number.isFinite(Number(framing?.focalX)) ? Math.min(1, Math.max(0, Number(framing.focalX))) : 0.5;
  const fy = Number.isFinite(Number(framing?.focalY)) ? Math.min(1, Math.max(0, Number(framing.focalY))) : 0.5;

  // "cover": a menor escala que ainda cobre a carta inteira. Nunca deixa buraco.
  const escala = Math.max(w / sw, h / sh) * zoom;
  const width = sw * escala;
  const height = sh * escala;

  // O excedente é distribuído segundo o ponto focal (0.5 → centrado).
  const left = -(width - w) * fx;
  const top = -(height - h) * fy;

  return { width, height, left, top };
}

export default getCardFraming;
