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
 * Proporção da JANELA da carta (R2A · §3/§6). A carta é quase quadrada (≈1:1.1) e a capa
 * é 16:9. Em vez de encher a carta (recorte de ~49% da largura, corta personagens) ou de
 * mostrar o 16:9 inteiro (faixa fina, pequena demais num tabuleiro de 24), a capa vive numa
 * JANELA ~4:3 centralizada, com marfim em cima e embaixo. Recorte cai para ~25% e o ponto
 * focal ainda decide o que fica visível.
 */
export const CARD_WINDOW_ASPECT = 4 / 3;

/**
 * Janela proporcional da carta + imagem dentro dela (R2A · §3). PURO.
 *
 * A janela (largura da carta × aspecto ~4:3) é centralizada — o excedente vertical vira
 * marfim. A capa preenche a janela por "cover" com o ponto focal, então nada é esticado e
 * rostos colados na borda continuam protegidos pelo `focal`/`zoom` de cada história.
 *
 * @param {number} srcW  largura real do asset
 * @param {number} srcH  altura real do asset
 * @param {number} cardW largura útil da carta (dentro da moldura)
 * @param {number} cardH altura útil da carta (dentro da moldura)
 * @param {object} [framing]
 * @param {number} [windowAspect=CARD_WINDOW_ASPECT]
 * @returns {{
 *   window: {x:number,y:number,width:number,height:number},
 *   image:  {width:number,height:number,left:number,top:number},
 * }}
 */
export function computeProportionalWindow(srcW, srcH, cardW, cardH, framing = PADRAO, windowAspect = CARD_WINDOW_ASPECT) {
  const cw = Number(cardW) > 0 ? Number(cardW) : 0;
  const ch = Number(cardH) > 0 ? Number(cardH) : 0;
  const aspect = Number(windowAspect) > 0 ? Number(windowAspect) : CARD_WINDOW_ASPECT;

  // Janela limitada pela LARGURA (card mais alto que largo + janela mais larga que alta
  // ⇒ a altura da janela sempre cabe). Se algo vier zerado, a janela é a carta inteira.
  let winW = cw;
  let winH = cw > 0 ? cw / aspect : 0;
  if (winH > ch && ch > 0) { winH = ch; winW = ch * aspect; }
  if (!(winW > 0) || !(winH > 0)) { winW = cw; winH = ch; }

  const window = {
    x: (cw - winW) / 2,
    y: (ch - winH) / 2,
    width: winW,
    height: winH,
  };

  return {
    window,
    image: computeCardImageLayout(srcW, srcH, winW, winH, framing),
  };
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
