/**
 * coloring60ArtComposition.js — MATEMÁTICA da composição "cor + contorno" do Colorir 60.
 *
 * Uma arte guardada é a CAMADA DE TINTA sozinha (transparente onde a criança não pintou). Para
 * mostrá-la de novo é preciso recompô-la com o contorno oficial: tinta por baixo, contorno por cima
 * em `multiply`. As duas imagens precisam ser posicionadas com a MESMA razão usada quando a pintura
 * foi feita — é isso que estas funções calculam, a partir do layout que o próprio payload carrega.
 *
 * PURO e SEM DEPENDÊNCIAS: nada de React, storage, navegação ou I/O. Existe como módulo próprio para
 * que a camada de celebração e a TELA DE COLEÇÃO (C60 · Parte 7) usem exatamente a mesma matemática —
 * a coleção precisa ficar IDÊNTICA venha de onde vier, e duas cópias da conta divergiriam.
 */

/**
 * parseDrawingPayload(raw) — lê o payload salvo (v1 data-URL puro, ou v2 JSON com layout).
 * Devolve `{ uri, W, H, imgX, imgY, imgW, imgH }` ou `null` quando não há arte legível.
 * v1 não tem layout: os campos vêm nulos e o chamador cai no enquadramento simples (`contain`).
 */
export function parseDrawingPayload(raw) {
  if (!raw) return null;
  try {
    if (raw.startsWith('data:')) {
      return { uri: raw, W: null, H: null, imgX: null, imgY: null, imgW: null, imgH: null };
    }
    const p = JSON.parse(raw);
    if (!p?.data) return null;
    return {
      uri: p.data,
      W: p.W ?? null, H: p.H ?? null,
      imgX: p.imgX ?? null, imgY: p.imgY ?? null,
      imgW: p.imgW ?? null, imgH: p.imgH ?? null,
    };
  } catch {
    return null;
  }
}

/** True quando o payload traz layout completo (permite posicionar com precisão). */
export function isPositionedPayload(parsed) {
  return !!(
    parsed && parsed.W && parsed.H
    && parsed.imgX !== null && parsed.imgY !== null && parsed.imgW && parsed.imgH
  );
}

/** Converte o payload lido no formato de "visual" consumido pelas duas funções de estilo. */
export function toArtVisual(parsed, lineart) {
  if (!parsed) return null;
  return {
    paintUri: parsed.uri,
    baseImage: lineart,
    canvasW: parsed.W,
    canvasH: parsed.H,
    lineartImgX: parsed.imgX,
    lineartImgY: parsed.imgY,
    lineartImgW: parsed.imgW,
    lineartImgH: parsed.imgH,
  };
}

/** Medida VÁLIDA para conta de layout: número finito e maior que zero (texto, NaN, ∞ e negativo saem). */
function isPositiveNumber(n) {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}
/** Deslocamento VÁLIDO: número finito (zero e negativo são legítimos; texto, NaN e ∞ não). */
function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

/**
 * Escala do RETÂNGULO DA ARTE dentro do contêiner (mesma matemática do Livrinho).
 *
 * PORTÃO ADVERSARIAL DE COLEÇÃO: um payload corrompido pode trazer `"x"`, `NaN`, `Infinity` ou
 * medida negativa no lugar das dimensões — e uma divisão por texto devolvia `NaN` silencioso, que
 * seguia até `left`/`width` do estilo (layout impossível, comportamento indefinido no aparelho).
 * Aqui a exigência é explícita: dimensões positivas finitas, deslocamentos finitos. Fora disso a
 * conta se RECUSA (`null`) e o chamador cai no enquadramento simples — o mesmo caminho já usado
 * pela arte legada sem layout. Recusar é o comportamento honesto; adivinhar posição foi o que
 * produziu a evidência de composição variável.
 */
export function computeArtworkScale(containerW, containerH, v) {
  if (!isPositiveNumber(containerW) || !isPositiveNumber(containerH) || !v) return null;
  if (!isPositiveNumber(v.canvasW) || !isPositiveNumber(v.canvasH)) return null;
  if (!isPositiveNumber(v.lineartImgW) || !isPositiveNumber(v.lineartImgH)) return null;
  if (!isFiniteNumber(v.lineartImgX) || !isFiniteNumber(v.lineartImgY)) return null;
  const scale = Math.min(containerW / v.lineartImgW, containerH / v.lineartImgH);
  const rectW = v.lineartImgW * scale;
  const rectH = v.lineartImgH * scale;
  const rectLeft = (containerW - rectW) / 2;
  const rectTop = (containerH - rectH) / 2;
  return { scale, rectW, rectH, rectLeft, rectTop };
}

/** Estilo absoluto do CONTORNO dentro do contêiner. */
export function computeLineartStyle(containerW, containerH, v) {
  const a = computeArtworkScale(containerW, containerH, v);
  if (!a) return { position: 'absolute', opacity: 0 };
  return { position: 'absolute', left: a.rectLeft, top: a.rectTop, width: a.rectW, height: a.rectH };
}

/** Estilo absoluto da CAMADA DE TINTA (o canvas inteiro, deslocado para casar com o contorno). */
export function computePaintStyle(containerW, containerH, v) {
  const a = computeArtworkScale(containerW, containerH, v);
  if (!a) return null;
  return {
    position: 'absolute',
    left: a.rectLeft - v.lineartImgX * a.scale,
    top: a.rectTop - v.lineartImgY * a.scale,
    width: v.canvasW * a.scale,
    height: v.canvasH * a.scale,
  };
}
