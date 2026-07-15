/**
 * paresGridLayout.js — Geometria PURA do tabuleiro do Pares do Beni (R2A · §4).
 *
 * ── Por que existe ────────────────────────────────────────────────────────────
 * Antes, a grade era só um `flexWrap` com `justifyContent:'center'`. Funcionava
 * HOJE porque as três dificuldades caem em linhas cheias (12→4×3, 16→4×4, 24→6×4).
 * Mas é frágil: qualquer contagem que deixe uma linha incompleta centraliza a última
 * fila e ela deixa de alinhar com as colunas de cima. E o cálculo do tamanho da carta
 * vivia separado do desenho — duas fontes de verdade que podiam divergir.
 *
 * Aqui há UMA fonte: dado o espaço real (tela − safe area − cabeçalho − rodapé) e a
 * grade desejada (colunas × linhas), devolve o tamanho da carta E a posição absoluta
 * de cada uma. Todas as cartas têm o MESMO tamanho; todos os espaçamentos são IGUAIS;
 * a grade é centralizada como um bloco (sem `space-between`, sem margem por fila).
 *
 * ── Pureza e arredondamento ───────────────────────────────────────────────────
 * Sem React, sem I/O, nunca lança — é o que o smoke exercita. O arredondamento ao
 * pixel do device é INJETADO (`round`): a tela passa `PixelRatio.roundToNearestPixel`;
 * o núcleo puro usa `Math.round` por padrão. Assim o serviço fica testável e o device
 * ainda arredonda ao seu DPR, sem meia-borda embaçada.
 */

/** Piso absoluto da carta (abaixo disto ela deixa de ser tocável). Igual ao legado. */
export const CARD_MIN_WIDTH = 36;

/** Proporção padrão da carta: altura = largura × RATIO. */
export const CARD_ASPECT = 1.1;

const int = (v, fb = 0) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : fb);
const num = (v, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);

/** Insets saneados. Qualquer coisa estranha → 0. */
function safeInsets(insets) {
  const i = insets && typeof insets === 'object' ? insets : {};
  return {
    top: Math.max(0, num(i.top)),
    bottom: Math.max(0, num(i.bottom)),
    left: Math.max(0, num(i.left)),
    right: Math.max(0, num(i.right)),
  };
}

/**
 * Quantas linhas a grade ocupa, dada a contagem e as colunas.
 * @returns {number} >= 1 (uma grade vazia ainda "tem" 1 linha, para não dividir por zero)
 */
export function rowsFor(cardCount, columns) {
  const c = int(columns, 1) || 1;
  const n = Math.max(0, int(cardCount, 0));
  return Math.max(1, Math.ceil(n / c));
}

/**
 * Geometria completa do tabuleiro. PURO.
 *
 * @param {object} p
 * @param {number} p.screenWidth
 * @param {number} p.screenHeight        altura total da tela (0 = ignora restrição vertical)
 * @param {object} [p.safeAreaInsets]    {top,bottom,left,right}
 * @param {number} [p.headerHeight]      altura reservada ao cabeçalho
 * @param {number} [p.footerHeight]      altura reservada ao rodapé/HUD/barra/dica
 * @param {number} p.cardCount           total de cartas (pares × 2)
 * @param {number} p.columns
 * @param {number} [p.rows]              opcional — derivada de cardCount/columns se ausente
 * @param {number} [p.preferredGap]      espaçamento GEOMÉTRICO único (legado; se não vier gap óptico)
 * @param {number} [p.desiredOpticalGapX] R2B — gap VISÍVEL desejado (limpo, já sem a sombra)
 * @param {number} [p.desiredOpticalGapY] R2B — idem vertical (default = X)
 * @param {number} [p.shadowBleed]        R2B — quanto a sombra de UMA carta invade o gap (por lado)
 * @param {number} [p.minimumOpticalGap]  R2B — invariante: opticalGap nunca abaixo disto
 * @param {number} [p.cardAspectRatio]    altura/largura da carta (default 1.1)
 * @param {number} [p.outerPaddingX]      respiro lateral dentro da safe area
 * @param {number} [p.outerPaddingY]      respiro vertical dentro da área útil
 * @param {number} [p.minCardWidth]       piso de toque (default CARD_MIN_WIDTH)
 * @param {(n:number)=>number} [p.round]  arredondador ao pixel do device (default Math.round)
 * @returns {{
 *   cardWidth:number, cardHeight:number, gapX:number, gapY:number,
 *   layoutGapX:number, layoutGapY:number, opticalGapX:number, opticalGapY:number,
 *   shadowBleed:number, minimumOpticalGap:number,
 *   gridWidth:number, gridHeight:number, offsetX:number, offsetY:number,
 *   columns:number, rows:number,
 *   positions: Array<{index:number,row:number,col:number,x:number,y:number}>,
 * }}
 */
export function computeGridLayout(p = {}) {
  const round = typeof p.round === 'function' ? p.round : Math.round;

  const columns = int(p.columns, 1) || 1;
  const cardCount = Math.max(0, int(p.cardCount, 0));
  const rows = p.rows != null ? Math.max(1, int(p.rows, 1)) : rowsFor(cardCount, columns);

  const ratio = num(p.cardAspectRatio, CARD_ASPECT) > 0 ? num(p.cardAspectRatio, CARD_ASPECT) : CARD_ASPECT;
  const minW = Math.max(1, num(p.minCardWidth, CARD_MIN_WIDTH));

  // ── R2B §3 · Gap ÓPTICO vs GEOMÉTRICO ──────────────────────────────────────
  // O olho enxerga o gap ÓPTICO (espaço limpo entre as MOLDURAS). Mas cada carta
  // projeta uma sombra que invade `shadowBleed` de cada lado — se o gap geométrico não
  // compensar, as sombras se encostam e as cartas parecem "coladas" (era o bug do R2A:
  // gap 7 − 2×~4 de sombra ⇒ gap óptico ~negativo). Então o gap de LAYOUT (usado para
  // posicionar) = gap óptico desejado + a sombra das DUAS cartas vizinhas.
  const bleed = Math.max(0, num(p.shadowBleed, 0));
  const minOpt = Math.max(0, num(p.minimumOpticalGap, 0));
  const hasOptical = p.desiredOpticalGapX != null || p.desiredOpticalGapY != null;

  const optXwanted = p.desiredOpticalGapX != null ? Math.max(0, num(p.desiredOpticalGapX, 0)) : null;
  const optYwanted = p.desiredOpticalGapY != null ? Math.max(0, num(p.desiredOpticalGapY, 0))
    : optXwanted;

  let layoutGapX;
  let layoutGapY;
  if (hasOptical) {
    layoutGapX = Math.max(0, (optXwanted != null ? optXwanted : 0)) + bleed * 2;
    layoutGapY = Math.max(0, (optYwanted != null ? optYwanted : 0)) + bleed * 2;
  } else {
    layoutGapX = Math.max(0, num(p.preferredGap, 8));
    layoutGapY = layoutGapX;
  }
  // Gap óptico REAL = layout − sombra dos dois lados. É o que o teste/diagnóstico checa.
  const opticalGapX = Math.max(0, layoutGapX - bleed * 2);
  const opticalGapY = Math.max(0, layoutGapY - bleed * 2);

  const insets = safeInsets(p.safeAreaInsets);
  const padX = Math.max(0, num(p.outerPaddingX, 0));
  const padY = Math.max(0, num(p.outerPaddingY, 0));

  // Área útil: nunca invade safe area, cabeçalho nem rodapé.
  const availW = Math.max(
    0,
    num(p.screenWidth) - insets.left - insets.right - padX * 2,
  );
  const availHraw = num(p.screenHeight) - insets.top - insets.bottom
    - Math.max(0, num(p.headerHeight)) - Math.max(0, num(p.footerHeight)) - padY * 2;
  const availH = num(p.screenHeight) > 0 ? Math.max(0, availHraw) : 0;

  // Lado da carta: o MENOR entre a restrição horizontal e a vertical (a vertical só
  // conta quando há altura conhecida). A carta ENCOLHE alguns pontos para caber o gap
  // maior — nunca abaixo do piso de toque; a grade não rola.
  const byWidth = (availW - (columns - 1) * layoutGapX) / columns;
  const byHeight = availH > 0
    ? ((availH - (rows - 1) * layoutGapY) / rows) / ratio
    : Infinity;

  let cardWidth = Math.min(byWidth, byHeight);
  if (!Number.isFinite(cardWidth) || cardWidth <= 0) cardWidth = byWidth;
  // O TAMANHO da carta é FLOORED (nunca arredonda para cima). Arredondar o lado ao pixel
  // mais próximo estoura a grade por 1–2 px em telas apertadas (320/360): quatro cartas de
  // +0,25 px viram +1 px de largura, e a altura acumula pelas linhas. O piso garante que a
  // grade JAMAIS vaze. Já as POSIÇÕES usam o arredondador ao pixel do device (nitidez).
  cardWidth = Math.max(minW, Math.floor(cardWidth));
  const cardHeight = Math.floor(cardWidth * ratio);

  const gridWidth = columns * cardWidth + (columns - 1) * layoutGapX;
  const gridHeight = rows * cardHeight + (rows - 1) * layoutGapY;

  // Centraliza o BLOCO inteiro na área útil (não distribui espaço entre as cartas).
  const offsetX = round(insets.left + padX + Math.max(0, (availW - gridWidth) / 2));
  const offsetY = round(
    insets.top + Math.max(0, num(p.headerHeight)) + padY
    + (availH > 0 ? Math.max(0, (availH - gridHeight) / 2) : 0),
  );

  const positions = [];
  for (let i = 0; i < cardCount; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    positions.push({
      index: i,
      row,
      col,
      x: round(offsetX + col * (cardWidth + layoutGapX)),
      y: round(offsetY + row * (cardHeight + layoutGapY)),
    });
  }

  return {
    cardWidth,
    cardHeight,
    gapX: layoutGapX,
    gapY: layoutGapY,
    layoutGapX,
    layoutGapY,
    opticalGapX,
    opticalGapY,
    shadowBleed: bleed,
    minimumOpticalGap: minOpt,
    gridWidth: round(gridWidth),
    gridHeight: round(gridHeight),
    offsetX,
    offsetY,
    columns,
    rows,
    positions,
  };
}

export default computeGridLayout;
