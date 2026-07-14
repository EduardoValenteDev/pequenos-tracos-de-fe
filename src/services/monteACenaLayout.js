/**
 * monteACenaLayout.js — LAYOUT PURO da tela de partida de "Monte a Cena" (M1R6).
 *
 * A tela é dividida em CINCO zonas verticais REAIS (não texto solto por cima do tabuleiro):
 *   [1] cabeçalho · [2] tabuleiro · [3] corredor de orientação (faixa fixa) · [4] bandeja · [5] área segura.
 * As zonas empilham por uma COLUNA FLEX cujas alturas são calculadas AQUI de forma determinística.
 * Como todas as alturas são conhecidas, as coordenadas ANALÍTICAS (top absoluto a partir do topo da
 * raiz) batem exatamente com o layout flex — assim a camada interativa (alvos/poços/peças/overlay),
 * que precisa de posição absoluta root-local para o motor, alinha com a estrutura flex sem medir.
 *
 * PUREZA: sem imports, sem efeitos → testável no smoke (garante corredor reservado, espaçamento
 * mínimo entre tabuleiro e bandeja, e nenhuma sobreposição das zonas).
 */

export const HEADER_H = 48;
export const CORRIDOR_H = 54;   // faixa fixa entre tabuleiro e bandeja (48–56 pt)
export const BOARD_GAP = 10;
export const BOARD_MARGIN = 18;
export const WELL_GAP = 14;
export const DOCK_SIDE = 16;
export const DOCK_HEADER = 10;

const clamp = (v, lo, hi) => (v < lo ? lo : (v > hi ? hi : v));
const r2 = (n) => Math.round(n * 100) / 100;

/**
 * @param {object} p { screenW, screenH, insetTop, insetBottom, pieceCount, ratio, pieces, trayOrder }
 *   ratio = boardH/boardW (≈1.2496 para 4:5). pieces = geometry.pieces (para o trayScale).
 *   trayOrder (M1R8A) = ordem EMBARALHADA dos ids nos poços (poço i recebe trayOrder[i]); ausente →
 *   ordem natural. Só muda a posição VISUAL na bandeja; alvo/id da peça são intocados.
 * @returns zonas + tabuleiro + poços + trayScale + espaçamento (corredor) reservado.
 */
export function computeTableLayout({ screenW, screenH, insetTop = 0, insetBottom = 0, pieceCount = 4, ratio = 1.2496, pieces = [], trayOrder = null }) {
  const dockCols = pieceCount === 4 ? 2 : 3;
  const dockRows = Math.ceil(pieceCount / dockCols);
  const wellSize = clamp(Math.floor((screenW - DOCK_SIDE * 2 - (dockCols - 1) * WELL_GAP) / dockCols), 56, 78);
  const trayInnerH = dockRows * wellSize + (dockRows + 1) * WELL_GAP;
  const trayH = DOCK_HEADER + trayInnerH + 6;

  const headerTop = insetTop;
  const headerH = HEADER_H;
  const safeH = insetBottom;

  const trayTop = screenH - safeH - trayH;
  const corridorH = CORRIDOR_H;
  const corridorTop = trayTop - corridorH;

  const boardZoneTop = headerTop + headerH;
  const boardZoneH = corridorTop - boardZoneTop;

  // O tabuleiro NUNCA pode exceder a própria zona (senão invadiria o corredor/cabeçalho em telas
  // pequenas com 9 peças). Cabe na zona por ALTURA (boardAvailH) e na tela por LARGURA — sem piso
  // fixo de largura que estourasse a zona. Em telas amplas a altura da zona já garante um tabuleiro
  // grande; em telas muito pequenas o tabuleiro encolhe (correto) em vez de sobrepor.
  const boardAvailH = Math.max(0, boardZoneH - BOARD_GAP * 2);
  const boardFit = boardAvailH / ratio;
  const boardW = Math.max(1, Math.min(screenW - BOARD_MARGIN * 2, boardFit));
  const boardH = boardW * ratio;
  const boardLeft = (screenW - boardW) / 2;
  const boardTop = boardZoneTop + (boardZoneH - boardH) / 2;

  // Poços centralizados na bandeja.
  const gridW = dockCols * wellSize + (dockCols - 1) * WELL_GAP;
  const wellLeft0 = (screenW - gridW) / 2;
  const wellTop0 = trayTop + DOCK_HEADER + WELL_GAP;
  const wellsById = {};
  const naturalIds = pieces.map((p) => p.id);
  // poço i recebe trayOrder[i] (embaralhado) se válido; senão a ordem natural.
  const ids = (Array.isArray(trayOrder) && trayOrder.length === naturalIds.length
    && trayOrder.every((id) => naturalIds.includes(id)))
    ? trayOrder
    : naturalIds;
  ids.forEach((id, i) => {
    const col = i % dockCols;
    const row = Math.floor(i / dockCols);
    const left = wellLeft0 + col * (wellSize + WELL_GAP);
    const top = wellTop0 + row * (wellSize + WELL_GAP);
    wellsById[id] = { left, top, cx: left + wellSize / 2, cy: top + wellSize / 2, size: wellSize };
  });

  // Escala das peças na bandeja (mesmo cálculo do motor: cabe no poço com folga).
  const inner = wellSize - 12;
  let mw = 0;
  let mh = 0;
  for (const p of pieces) {
    const vb = p.overscanBounds || p.visualBounds || { w: 0.5, h: 0.5 };
    mw = Math.max(mw, vb.w * boardW);
    mh = Math.max(mh, vb.h * boardH);
  }
  const trayScale = mw > 0 && mh > 0 ? clamp(Math.min(inner / mw, inner / mh), 0.16, 0.6) : 0.3;

  return {
    dockCols,
    dockRows,
    wellSize,
    // zonas (top absoluto a partir do topo da raiz — batem com a coluna flex)
    insetTop,
    headerTop,
    headerH,
    boardZoneTop,
    boardZoneH: r2(boardZoneH),
    corridorTop: r2(corridorTop),
    corridorH,
    trayTop: r2(trayTop),
    trayH,
    safeH,
    // tabuleiro
    boardLeft: r2(boardLeft),
    boardTop: r2(boardTop),
    boardW: r2(boardW),
    boardH: r2(boardH),
    // bandeja
    wellsById,
    trayScale: r2(trayScale),
    // espaçamento reservado entre a base do tabuleiro e o topo da bandeja (≥ corredor)
    boardToTrayGap: r2(trayTop - (boardTop + boardH)),
  };
}

export default computeTableLayout;
