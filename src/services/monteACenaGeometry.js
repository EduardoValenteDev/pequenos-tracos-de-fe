/**
 * monteACenaGeometry.js — MOTOR GEOMÉTRICO PURO do Architecture Spike M1A de "Monte a Cena".
 *
 * ⚠️ Spike técnico interno (M1A). NÃO é o jogo. Gera SOMENTE um layout 2×2 (4 peças) para
 * provar o baseline C-SVG (recorte por `react-native-svg` `<ClipPath>` de UMA imagem).
 * Não implementa 6/9 peças, dificuldades, mural, estrelas nem rodadas.
 *
 * PUREZA OBRIGATÓRIA: este módulo **não importa nada** e não tem efeitos colaterais. Isso o
 * torna testável no `scripts/smoke.js` (que o avalia via `new Function` após remover `export`)
 * e determinístico em qualquer aparelho. Coordenadas em espaço NORMALIZADO da arte (0..1);
 * o `path` (`d`) é emitido em PIXELS da arte (0..artWidth × 0..artHeight) p/ o `viewBox` do SVG.
 *
 * Contrato geométrico (ver specs/010-monte-a-cena/architecture-decision.md §3):
 *   - cada borda INTERNA é definida UMA vez; a peça vizinha usa o COMPLEMENTO EXATO (path revertido);
 *   - bordas EXTERNAS retas; bordas internas curvas (Bézier suave, sem pontas);
 *   - determinístico por (sceneId, seed, versão); as abas (tabs) ULTRAPASSAM a célula-base;
 *   - a costura não pode atravessar uma `protectedRegion` (rosto/foco de Noé).
 */

export const MONTE_A_CENA_GEOMETRY_VERSION = 'm1r1-2x2-jigsaw-v1';

/* ──────────────────────────────────────────────────────────────────────────
 * Perfil "neck+bulb" (knob de quebra-cabeça tradicional) em coordenadas LOCAIS do knob:
 *   u ∈ [-1, 1] ao longo do knob · p ∈ [0, ~1] perpendicular (pico ≈ 1.04).
 * O bulbo (|u| ≈ 0.80) é mais LARGO que o pescoço (|u| ≈ 0.56) → overhang clássico.
 * Curvas Bézier suaves, sem pontas. O MESMO knob é usado por todas as bordas internas —
 * só muda a transformação — garantindo encaixes idênticos. O knob tem TAMANHO ABSOLUTO
 * (KNOB_HALF_PX / DEPTH_PX), centrado na borda, com ombros retos preenchendo o resto:
 * assim o knob não "estica" em bordas longas.
 * ────────────────────────────────────────────────────────────────────────── */
const KNOB_SEGS = [
  { c1: [-0.80, 0.00], c2: [-0.62, 0.10], end: [-0.56, 0.30] }, // pescoço esq. sobe
  { c1: [-0.50, 0.52], c2: [-0.80, 0.52], end: [-0.80, 0.68] }, // bulbo esq. (overhang)
  { c1: [-0.80, 0.90], c2: [-0.40, 1.04], end: [0.00, 1.04] },  // topo esq. → centro
  { c1: [0.40, 1.04], c2: [0.80, 0.90], end: [0.80, 0.68] },    // centro → topo dir.
  { c1: [0.80, 0.52], c2: [0.50, 0.52], end: [0.56, 0.30] },    // bulbo dir. → pescoço
  { c1: [0.62, 0.10], c2: [0.80, 0.00], end: [1.00, 0.00] },    // pescoço dir. desce
];
const DEPTH_PX_DEFAULT = 120;    // profundidade da aba (px da arte)
const KNOB_HALF_PX_DEFAULT = 128; // meia-largura do knob (px, tamanho absoluto)

/** Hash determinístico simples (string → uint32). Sem Math.random (proíbe não-determinismo). */
function hashSeed(str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deriva os 4 sinais de aba (±1) a partir da seed — determinístico e estável. */
function seamSigns(seed) {
  const h = hashSeed(seed);
  return [
    (h & 1) ? 1 : -1,
    (h & 2) ? 1 : -1,
    (h & 4) ? 1 : -1,
    (h & 8) ? 1 : -1,
  ];
}

/**
 * Constrói uma borda interna curva como lista de segmentos cúbicos em coords NORMALIZADas:
 *   ombro reto → knob (neck+bulb, tamanho ABSOLUTO centrado) → ombro reto.
 * axis: 'v' (vertical, x fixo, varia y) | 'h' (horizontal, y fixo, varia x).
 * cfg: { artW, artH, depthPx, knobHalfPx }. Retorna { start:[x,y], segs:[{c1,c2,end}] }.
 */
function buildEdge(axis, fixed, from, to, dir, cfg) {
  const { artW, artH, depthPx, knobHalfPx } = cfg;
  const lenPx = Math.abs(to - from) * (axis === 'v' ? artH : artW);
  const aHalf = Math.min(0.42, knobHalfPx / lenPx); // meia-largura do knob (fração da borda)
  const tab = depthPx / (axis === 'v' ? artW : artH);
  const sgn = to >= from ? 1 : -1;
  const mapAP = (a, p) => (axis === 'v'
    ? [fixed + dir * p * tab, from + a * (to - from)]
    : [from + a * (to - from), fixed + dir * p * tab]);
  const mapU = (u, p) => mapAP(0.5 + sgn * u * aHalf, p);
  const kStart = 0.5 - aHalf;
  const kEnd = 0.5 + aHalf;
  const segs = [];
  // ombro reto até o início do knob
  segs.push({ c1: mapAP(kStart * 0.34, 0), c2: mapAP(kStart * 0.7, 0), end: mapAP(kStart, 0) });
  // knob (neck+bulb)
  for (const s of KNOB_SEGS) {
    segs.push({ c1: mapU(s.c1[0], s.c1[1]), c2: mapU(s.c2[0], s.c2[1]), end: mapU(s.end[0], s.end[1]) });
  }
  // ombro reto até o fim
  segs.push({
    c1: mapAP(kEnd + (1 - kEnd) * 0.3, 0),
    c2: mapAP(kEnd + (1 - kEnd) * 0.66, 0),
    end: mapAP(1, 0),
  });
  return { start: mapAP(0, 0), segs };
}

/** Reversão EXATA de uma borda cúbica: mesma curva, sentido invertido (complemento perfeito). */
export function reverseEdge(edge) {
  const pts = [edge.start, ...edge.segs.map((s) => s.end)];
  const ctrl = edge.segs.map((s) => [s.c1, s.c2]);
  const n = edge.segs.length;
  const start = pts[n];
  const segs = [];
  for (let i = n - 1; i >= 0; i--) {
    segs.push({ c1: ctrl[i][1], c2: ctrl[i][0], end: pts[i] });
  }
  return { start, segs };
}

/** Converte um ponto normalizado → pixel da arte. */
function toPx(pt, W, H) {
  return [round4(pt[0] * W), round4(pt[1] * H)];
}
function round4(n) {
  return Math.round(n * 10000) / 10000;
}

/** Emite os segmentos cúbicos de uma borda como string `C ...` em pixels da arte. */
function edgeToPathPx(edge, W, H) {
  return edge.segs
    .map((s) => {
      const c1 = toPx(s.c1, W, H);
      const c2 = toPx(s.c2, W, H);
      const e = toPx(s.end, W, H);
      return `C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${e[0]} ${e[1]}`;
    })
    .join(' ');
}

/** Todos os pontos (start + controles + ends) de uma borda, em NORMALIZADO — p/ bbox. */
function edgePointsNorm(edge) {
  const pts = [edge.start];
  for (const s of edge.segs) {
    pts.push(s.c1, s.c2, s.end);
  }
  return pts;
}

function bboxOfPoints(points) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: round4(minX), y: round4(minY), w: round4(maxX - minX), h: round4(maxY - minY) };
}

/** Interseção de dois retângulos normalizados {x,y,w,h}. */
export function rectsIntersect(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function expandRect(r, dx, dy) {
  return {
    x: round4(r.x - dx),
    y: round4(r.y - dy),
    w: round4(r.w + 2 * dx),
    h: round4(r.h + 2 * dy),
  };
}

function centerOf(r) {
  return [round4(r.x + r.w / 2), round4(r.y + r.h / 2)];
}

/**
 * Verifica se uma linha de costura reta atravessa alguma protectedRegion.
 * seam vertical x=vx cruza se vx ∈ (region.x, region.x+w) e há sobreposição no eixo y do segmento.
 */
function seamCrossesAnyProtected(vx, hy, regions) {
  for (const r of regions || []) {
    const crossV = vx > r.x && vx < r.x + r.w && hy > r.y - 1 && r.y < 1; // linha vertical percorre todo y
    const insideV = vx > r.x && vx < r.x + r.w; // vertical percorre y inteiro (0..1) → cruza se x dentro
    const insideH = hy > r.y && hy < r.y + r.h; // horizontal percorre x inteiro → cruza se y dentro
    if (insideV || insideH) return true;
    void crossV;
  }
  return false;
}

/**
 * Gera o layout 2×2 do spike.
 * params: {
 *   sceneId, artWidth, artHeight, seed,
 *   seams: { vx, hy },            // linhas de corte deslocadas (normalizado 0..1)
 *   tabDepthPx,                   // profundidade da aba, em px da arte (proporcional)
 *   protectedRegions,             // [{x,y,w,h}] normalizado
 *   minTouchNorm,                 // touch target mínimo (fração da arte)
 *   overscanPx,                   // dilatação sub-pixel anti-seam (px da arte)
 * }
 */
export function buildSpikeGeometry(params) {
  const {
    sceneId = 'unknown',
    artWidth,
    artHeight,
    seed = 'seed',
    seams = { vx: 0.5, hy: 0.5 },
    tabDepthPx = DEPTH_PX_DEFAULT,
    knobHalfPx = KNOB_HALF_PX_DEFAULT,
    protectedRegions = [],
    minTouchNorm = 0.10,
    overscanPx = 0.75,
  } = params || {};

  if (!(artWidth > 0) || !(artHeight > 0)) {
    throw new Error('buildSpikeGeometry: artWidth/artHeight inválidos');
  }

  const vx = seams.vx;
  const hy = seams.hy;
  const cfg = { artW: artWidth, artH: artHeight, depthPx: tabDepthPx, knobHalfPx };
  const [sV1, sV2, sH1, sH2] = seamSigns(seed);

  // Bordas internas — cada uma definida UMA vez (fonte única do path).
  const eV_top = buildEdge('v', vx, 0, hy, sV1, cfg); // (vx,0) → (vx,hy)
  const eV_bot = buildEdge('v', vx, hy, 1, sV2, cfg); // (vx,hy) → (vx,1)
  const eH_left = buildEdge('h', hy, 0, vx, sH1, cfg); // (0,hy) → (vx,hy)
  const eH_right = buildEdge('h', hy, vx, 1, sH2, cfg); // (vx,hy) → (1,hy)

  const W = artWidth;
  const H = artHeight;
  const L = (p) => `L ${round4(p[0] * W)} ${round4(p[1] * H)}`;
  const M = (p) => `M ${round4(p[0] * W)} ${round4(p[1] * H)}`;

  // Cantos normalizados.
  const TL = [0, 0];
  const TR = [1, 0];
  const BR = [1, 1];
  const BL = [0, 1];

  // ── Peça P0 (TL): topo reto → eV_top(fwd) → eH_left(rev) → esquerda reta ──
  const p0Path = [
    M(TL),
    L([vx, 0]),
    edgeToPathPx(eV_top, W, H),
    edgeToPathPx(reverseEdge(eH_left), W, H),
    L(TL),
    'Z',
  ].join(' ');
  const p0Pts = [TL, [vx, 0], ...edgePointsNorm(eV_top), ...edgePointsNorm(reverseEdge(eH_left)), TL];

  // ── Peça P1 (TR): topo reto → direita reta → eH_right(rev) → eV_top(rev) ──
  const p1Path = [
    M([vx, 0]),
    L(TR),
    L([1, hy]),
    edgeToPathPx(reverseEdge(eH_right), W, H),
    edgeToPathPx(reverseEdge(eV_top), W, H),
    'Z',
  ].join(' ');
  const p1Pts = [[vx, 0], TR, [1, hy], ...edgePointsNorm(reverseEdge(eH_right)), ...edgePointsNorm(reverseEdge(eV_top))];

  // ── Peça P2 (BL): eH_left(fwd) → eV_bot(fwd) → base reta → esquerda reta ──
  const p2Path = [
    M([0, hy]),
    edgeToPathPx(eH_left, W, H),
    edgeToPathPx(eV_bot, W, H),
    L(BL),
    L([0, hy]),
    'Z',
  ].join(' ');
  const p2Pts = [[0, hy], ...edgePointsNorm(eH_left), ...edgePointsNorm(eV_bot), BL, [0, hy]];

  // ── Peça P3 (BR): eH_right(fwd) → direita reta → base reta → eV_bot(rev) ──
  const p3Path = [
    M([vx, hy]),
    edgeToPathPx(eH_right, W, H),
    L(BR),
    L([vx, 1]),
    edgeToPathPx(reverseEdge(eV_bot), W, H),
    'Z',
  ].join(' ');
  const p3Pts = [[vx, hy], ...edgePointsNorm(eH_right), BR, [vx, 1], ...edgePointsNorm(reverseEdge(eV_bot))];

  const cells = [
    { id: 'p0', row: 0, column: 0, cellRect: { x: 0, y: 0, w: vx, h: hy }, path: p0Path, pts: p0Pts },
    { id: 'p1', row: 0, column: 1, cellRect: { x: vx, y: 0, w: round4(1 - vx), h: hy }, path: p1Path, pts: p1Pts },
    { id: 'p2', row: 1, column: 0, cellRect: { x: 0, y: hy, w: vx, h: round4(1 - hy) }, path: p2Path, pts: p2Pts },
    { id: 'p3', row: 1, column: 1, cellRect: { x: vx, y: hy, w: round4(1 - vx), h: round4(1 - hy) }, path: p3Path, pts: p3Pts },
  ];

  const pieces = cells.map((c) => {
    const clipBounds = bboxOfPoints(c.pts);
    const visualBounds = clipBounds; // o path já inclui as abas → a bandeja usa isto
    const overscanBounds = expandRect(clipBounds, overscanPx / W, overscanPx / H);
    let hitBounds = clipBounds;
    if (hitBounds.w < minTouchNorm || hitBounds.h < minTouchNorm) {
      const dx = Math.max(0, (minTouchNorm - hitBounds.w) / 2);
      const dy = Math.max(0, (minTouchNorm - hitBounds.h) / 2);
      hitBounds = expandRect(clipBounds, dx, dy);
    }
    return {
      id: c.id,
      row: c.row,
      column: c.column,
      cellRect: c.cellRect,
      visualBounds,
      clipBounds,
      overscanBounds,
      hitBounds,
      dragAnchor: centerOf(clipBounds),
      snapPoint: centerOf(c.cellRect),
      targetRect: clipBounds,
      path: c.path,
    };
  });

  return {
    version: MONTE_A_CENA_GEOMETRY_VERSION,
    sceneId,
    seed,
    grid: { cols: 2, rows: 2 },
    seams: { vx, hy },
    tabDepthPx,
    artWidth,
    artHeight,
    pieces,
    protectedRegions,
    seamCrossesProtected: seamCrossesAnyProtected(vx, hy, protectedRegions),
  };
}

/** Sinal determinístico (±1) por (seed, chave da borda). */
function signFor(seed, key) {
  return (hashSeed(String(seed) + '|' + key) & 1) ? 1 : -1;
}

/** True se a linha de costura `base` (eixo) atravessa o intervalo [start, start+len]. */
function crossesInterval(base, start, len) {
  return base > start + 1e-6 && base < start + len - 1e-6;
}

/**
 * Desloca uma costura reta para FORA de protectedRegions, dentro de um limite pequeno (maxJitter).
 * Retorna { pos, ok }: ok=false se não for possível limpar a região sem exceder o limite
 * (o chamador então REJEITA o layout — não deforma a grade "a qualquer custo").
 */
function displaceSeam(base, axis, regions, maxJitter) {
  const dim = axis === 'x' ? 'w' : 'h';
  const key = axis;
  const crossing = (x) => (regions || []).filter((r) => crossesInterval(x, r[key], r[dim]));
  if (crossing(base).length === 0) return { pos: round4(base), ok: true };
  const eps = 0.015;
  const cands = [];
  for (const r of crossing(base)) cands.push(r[key] - eps, r[key] + r[dim] + eps);
  let best = null;
  for (const c of cands) {
    if (c <= 0.1 || c >= 0.9) continue;
    if (Math.abs(c - base) > maxJitter) continue;
    if (crossing(c).length > 0) continue;
    if (best === null || Math.abs(c - base) < Math.abs(best - base)) best = c;
  }
  if (best !== null) return { pos: round4(best), ok: true };
  return { pos: round4(base), ok: false };
}

const EDGE_TAB_MODE = 'grid'; // marcador de origem (documentação)

/**
 * MOTOR GEOMÉTRICO GERAL R×C (M1R2). Gera um layout de quebra-cabeça para qualquer grade
 * (2×2, 3×2, 3×3, …) com: células regulares + deslocamento LIMITADO de costura para não cortar
 * protectedRegions + validação de EQUILÍBRIO visual (razão de áreas, sem faixas estreitas).
 *
 * params: {
 *   sceneId, artWidth, artHeight, rows, cols, seed,
 *   protectedRegions, maxSeamJitter, tabDepthPx, knobHalfPx,
 *   minTouchNorm, overscanPx, areaRatioMax, minCellFrac,
 * }
 * Retorna, além das peças, { valid, balance, seamCrossesProtected } para o chamador decidir.
 */
export function buildGridGeometry(params) {
  const {
    sceneId = 'unknown',
    artWidth,
    artHeight,
    rows,
    cols,
    seed = 'seed',
    protectedRegions = [],
    maxSeamJitter = 0.12,
    tabDepthPx = DEPTH_PX_DEFAULT,
    knobHalfPx = KNOB_HALF_PX_DEFAULT,
    minTouchNorm = 0.10,
    overscanPx = 0.75,
    areaRatioMax = 2.2,
    minCellFrac = 0.12,
    presetSeams = null, // { x:[...internal], y:[...internal] } — preset MANUAL (não desloca)
    crop = { x: 0, y: 0, w: 1, h: 1 }, // sub-retângulo VISÍVEL da arte (normalizado) — protege rostos
  } = params || {};

  if (!(artWidth > 0) || !(artHeight > 0)) throw new Error('buildGridGeometry: art inválida');
  if (!(rows >= 1) || !(cols >= 1)) throw new Error('buildGridGeometry: rows/cols inválidos');

  // Espaço de trabalho = a REGIÃO DE CROP. Geometria em [0,1] sobre o crop; paths em px da arte.
  const cx0 = crop.x * artWidth;
  const cy0 = crop.y * artHeight;
  const artWc = crop.w * artWidth;   // largura em px da região visível
  const artHc = crop.h * artHeight;  // altura em px da região visível
  const W = artWc;
  const H = artHc;
  const cfg = { artW: W, artH: H, depthPx: tabDepthPx, knobHalfPx };

  // ── Costuras: preset manual (se dado) OU deslocamento automático dentro do limite ──
  let protectedOk = true;
  const seamX = [0];
  const seamY = [0];
  const anyCross = (v, axis) => (protectedRegions || []).some((r) => crossesInterval(v, axis === 'x' ? r.x : r.y, axis === 'x' ? r.w : r.h));
  if (presetSeams && Array.isArray(presetSeams.x) && Array.isArray(presetSeams.y)) {
    for (const x of presetSeams.x) { seamX.push(round4(x)); if (anyCross(x, 'x')) protectedOk = false; }
    for (const y of presetSeams.y) { seamY.push(round4(y)); if (anyCross(y, 'y')) protectedOk = false; }
  } else {
    for (let ci = 1; ci < cols; ci++) {
      const d = displaceSeam(ci / cols, 'x', protectedRegions, maxSeamJitter);
      protectedOk = protectedOk && d.ok;
      seamX.push(d.pos);
    }
    for (let ri = 1; ri < rows; ri++) {
      const d = displaceSeam(ri / rows, 'y', protectedRegions, maxSeamJitter);
      protectedOk = protectedOk && d.ok;
      seamY.push(d.pos);
    }
  }
  seamX.push(1);
  seamY.push(1);

  // ── Bordas internas (definidas UMA vez; a peça vizinha usa o complemento exato) ──
  const vEdge = {}; // vEdge[ci][r]: vertical em x=seamX[ci], de seamY[r] a seamY[r+1]
  for (let ci = 1; ci < cols; ci++) {
    vEdge[ci] = {};
    for (let r = 0; r < rows; r++) {
      const dir = signFor(seed, `v${ci}-${r}`);
      vEdge[ci][r] = buildEdge('v', seamX[ci], seamY[r], seamY[r + 1], dir, cfg);
    }
  }
  const hEdge = {}; // hEdge[ri][c]: horizontal em y=seamY[ri], de seamX[c] a seamX[c+1]
  for (let ri = 1; ri < rows; ri++) {
    hEdge[ri] = {};
    for (let c = 0; c < cols; c++) {
      const dir = signFor(seed, `h${ri}-${c}`);
      hEdge[ri][c] = buildEdge('h', seamY[ri], seamX[c], seamX[c + 1], dir, cfg);
    }
  }

  // Emissão em px da ARTE, deslocada pela origem do crop (cx0, cy0).
  const px = (p) => [round4(cx0 + p[0] * W), round4(cy0 + p[1] * H)];
  const L = (p) => { const q = px(p); return `L ${q[0]} ${q[1]}`; };
  const M = (p) => { const q = px(p); return `M ${q[0]} ${q[1]}`; };
  const edgeC = (edge) => edge.segs.map((s) => {
    const c1 = px(s.c1); const c2 = px(s.c2); const e = px(s.end);
    return `C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${e[0]} ${e[1]}`;
  }).join(' ');

  const pieces = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const xc = seamX[c];
      const xc1 = seamX[c + 1];
      const yr = seamY[r];
      const yr1 = seamY[r + 1];
      const parts = [M([xc, yr])];
      const pts = [[xc, yr]];
      const addEdge = (edge) => { parts.push(edgeC(edge)); pts.push(...edgePointsNorm(edge)); };
      const addLine = (p) => { parts.push(L(p)); pts.push(p); };

      // TOP (esq→dir)
      if (r === 0) addLine([xc1, yr]);
      else addEdge(hEdge[r][c]);
      // RIGHT (cima→baixo)
      if (c === cols - 1) addLine([xc1, yr1]);
      else addEdge(vEdge[c + 1][r]);
      // BOTTOM (dir→esq)
      if (r === rows - 1) addLine([xc, yr1]);
      else addEdge(reverseEdge(hEdge[r + 1][c]));
      // LEFT (baixo→cima)
      if (c === 0) addLine([xc, yr]);
      else addEdge(reverseEdge(vEdge[c][r]));
      parts.push('Z');

      const cellRect = { x: round4(xc), y: round4(yr), w: round4(xc1 - xc), h: round4(yr1 - yr) };
      const clipBounds = bboxOfPoints(pts);
      const visualBounds = clipBounds;
      const overscanBounds = expandRect(clipBounds, overscanPx / W, overscanPx / H);
      let hitBounds = clipBounds;
      if (hitBounds.w < minTouchNorm || hitBounds.h < minTouchNorm) {
        const dx = Math.max(0, (minTouchNorm - hitBounds.w) / 2);
        const dy = Math.max(0, (minTouchNorm - hitBounds.h) / 2);
        hitBounds = expandRect(clipBounds, dx, dy);
      }
      const ob = overscanBounds;
      pieces.push({
        id: `p${r}${c}`,
        row: r,
        column: c,
        cellRect,
        visualBounds,
        clipBounds,
        overscanBounds,
        hitBounds,
        dragAnchor: centerOf(clipBounds),
        snapPoint: centerOf(cellRect),
        targetRect: clipBounds,
        path: parts.join(' '),
        // viewBox (px da arte, incl. crop) — o sprite recorta a MESMA imagem full-art por este path.
        viewBox: `${round4(cx0 + ob.x * artWc)} ${round4(cy0 + ob.y * artHc)} ${round4(ob.w * artWc)} ${round4(ob.h * artHc)}`,
      });
    }
  }

  // ── Validação de EQUILÍBRIO (razão de áreas + sem faixa estreita) ──
  const areas = pieces.map((p) => p.cellRect.w * p.cellRect.h);
  const minArea = Math.min(...areas);
  const maxArea = Math.max(...areas);
  const areaRatio = round4(maxArea / minArea);
  let minSide = 1;
  for (const p of pieces) minSide = Math.min(minSide, p.cellRect.w, p.cellRect.h);
  const balanceOk = areaRatio <= areaRatioMax && minSide >= minCellFrac;

  return {
    version: MONTE_A_CENA_GEOMETRY_VERSION,
    mode: EDGE_TAB_MODE,
    sceneId,
    seed,
    grid: { rows, cols },
    seamX,
    seamY,
    pieces,
    protectedRegions,
    crop,
    cropPx: { x0: round4(cx0), y0: round4(cy0), w: round4(artWc), h: round4(artHc) },
    boardRatio: round4(artHc / artWc), // altura/largura da região visível
    seamCrossesProtected: !protectedOk,
    balance: { areaRatio, minSide: round4(minSide), ok: balanceOk },
    valid: protectedOk && balanceOk,
  };
}

/** Tolerância de encaixe derivada do menor lado real da peça (fração). Calibrável em DEV. */
export function snapToleranceFor(piece, factor = 0.42) {
  const minSide = Math.min(piece.clipBounds.w, piece.clipBounds.h);
  return round4(minSide * factor);
}
