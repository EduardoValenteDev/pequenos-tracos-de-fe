/**
 * Geometria canônica do mapa de aventuras.
 *
 * Este módulo é deliberadamente puro: não conhece React, faixa responsiva, sidebar,
 * safe area ou header. Largura e viewport chegam já medidas pelos containers reais.
 */
import { computeRegionHeight, getStoryMapCoord } from '../data/adventureMap';

// Q6/A-18: único repouso vertical, aprovado visualmente nas três faixas.
// É uma fração da viewport LIVRE medida, não uma compensação de chrome.
export const MAP_ANCHOR_FRAMING = 0.5;

const finitePositive = (value) => Number.isFinite(value) && value > 0;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

/** Deriva os offsets contíguos usando exatamente a ordem visual recebida. */
export function computeRegionLayout(regions, width) {
  if (!Array.isArray(regions) || !finitePositive(width)) return [];
  let top = 0;
  return regions.map((region) => {
    const height = computeRegionHeight(width);
    const item = {
      id: region.id,
      title: region.title,
      top,
      height,
      count: Array.isArray(region.stories) ? region.stories.length : 0,
    };
    top += height;
    return item;
  });
}

/**
 * Resolve uma história para a única âncora consumida por pino, toque, halo e câmera.
 * `regions` deve ser a mesma coleção VISUAL usada por `computeRegionLayout`.
 */
export function getStoryAnchor(storyId, { regions, regionLayout, width } = {}) {
  if (!storyId || !Array.isArray(regions) || !Array.isArray(regionLayout) || !finitePositive(width)) {
    return null;
  }

  const regionIndex = regions.findIndex((region) =>
    (region.stories || []).some((story) => story.id === storyId));
  if (regionIndex < 0) return null;

  const region = regions[regionIndex];
  const layout = regionLayout[regionIndex];
  if (!layout || layout.id !== region.id || !finitePositive(layout.height)) return null;

  const stories = region.stories || [];
  const storyIndex = stories.findIndex((story) => story.id === storyId);
  if (storyIndex < 0) return null;

  const coord = getStoryMapCoord(storyId, storyIndex, stories.length);
  const xPx = Math.round(coord.x * width);
  const yPx = Math.round(coord.y * layout.height);
  return {
    storyId,
    regionId: region.id,
    regionIndex,
    storyIndex,
    storyCount: stories.length,
    x: coord.x,
    y: coord.y,
    xPx,
    yPx,
    contentTop: layout.top,
    contentY: layout.top + yPx,
    contentH: layout.height,
    label: coord.label,
    markerScale: coord.markerScale || 1,
  };
}

/**
 * Enquadra uma âncora dentro da viewport livre REAL e limita o scroll ao conteúdo.
 * `regionTop` preserva D12: a primeira experiência abre no topo de `comece_aqui`.
 */
export function computeCameraTarget(anchor, viewportH, contentH, { mode = 'anchor' } = {}) {
  if (!finitePositive(viewportH) || !Number.isFinite(contentH) || contentH < 0) return 0;
  const maxY = Math.max(0, contentH - viewportH);
  if (!anchor) return maxY;
  const raw = mode === 'regionTop'
    ? anchor.contentTop
    : anchor.contentY - viewportH * MAP_ANCHOR_FRAMING;
  return clamp(Number.isFinite(raw) ? raw : maxY, 0, maxY);
}

/** Mesma varredura para região ativa, reprojeção e sonda de scroll. */
export function resolveActiveRegion(scrollY, regionLayout, probeOffset = 0) {
  if (!Array.isArray(regionLayout) || regionLayout.length === 0) return -1;
  const probeY = (Number.isFinite(scrollY) ? scrollY : 0)
    + (Number.isFinite(probeOffset) ? probeOffset : 0);
  for (let i = 0; i < regionLayout.length; i += 1) {
    const region = regionLayout[i];
    if (probeY >= region.top && probeY < region.top + region.height) return i;
  }
  return regionLayout.length - 1;
}
