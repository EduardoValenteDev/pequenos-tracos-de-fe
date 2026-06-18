/**
 * adventureMap.js — Dados das 4 regiões do Mapa Pergaminho (M1).
 *
 * As regiões REAPROVEITAM a classificação oficial do catálogo (`trackId` em
 * stories.js) — não inventam agrupamento. Cada região lista suas histórias na
 * ordem de `order`. Isto é só leitura/derivação de dados existentes: nenhuma
 * regra de negócio, paywall, mídia ou progresso é alterada aqui.
 *
 * Mapa (de cima para baixo) = 4 regiões = encaixe futuro de R1..R4 (M2):
 *   comece_aqui → pequeninos → descobridores → jovens_da_fe
 */
import { stories } from './stories';

// Imagens REAIS de cada região (assets/maps/). Convenção OFICIAL (confirmada pelo
// Eduardo): A = DESPERTA/COLORIDA (awake), B = ADORMECIDA/SEM COR (asleep).
// Mapeamento de regiões → R1..R4. Ambas importadas (sem quebrar).
//
// Cada região tem 4 fontes:
//   awake/asleep               = arte FINAL (941×1672, JPG q85, ~400 KB) — nítida.
//   awakePreview/asleepPreview = PREVIEW leve (405×720, JPG q60, ~60 KB) — decodifica
//                                quase instantâneo e aparece de imediato; a final
//                                entra por cima quando terminar (sem fundo bege).
export const REGION_MAP_IMAGES = {
  comece_aqui: {
    awake: require('../../assets/maps/R1A.jpg'),
    asleep: require('../../assets/maps/R1B.jpg'),
    awakePreview: require('../../assets/maps/R1A_preview.jpg'),
    asleepPreview: require('../../assets/maps/R1B_preview.jpg'),
  },
  pequeninos: {
    awake: require('../../assets/maps/R2A.jpg'),
    asleep: require('../../assets/maps/R2B.jpg'),
    awakePreview: require('../../assets/maps/R2A_preview.jpg'),
    asleepPreview: require('../../assets/maps/R2B_preview.jpg'),
  },
  descobridores: {
    awake: require('../../assets/maps/R3A.jpg'),
    asleep: require('../../assets/maps/R3B.jpg'),
    awakePreview: require('../../assets/maps/R3A_preview.jpg'),
    asleepPreview: require('../../assets/maps/R3B_preview.jpg'),
  },
  jovens_da_fe: {
    awake: require('../../assets/maps/R4A.jpg'),
    asleep: require('../../assets/maps/R4B.jpg'),
    awakePreview: require('../../assets/maps/R4A_preview.jpg'),
    asleepPreview: require('../../assets/maps/R4B_preview.jpg'),
  },
};

// Metadados visuais por região. `tint` = cor de borda/realce suave (fallback de
// fundo enquanto a imagem carrega); `accent` = cor do caminho/realces.
// `completedColor`/`currentColor` (B3.6) = cores dos PINS no mapa por região —
// substituem o verde fixo de concluído (que destoava da arte). completed = borda +
// badge ✓; current = borda + brilho pulsante da história atual.
export const ADVENTURE_REGION_META = [
  { id: 'comece_aqui',   title: 'Comece Aqui',   subtitle: 'Os primeiros passos',      tint: '#EAF6FF', accent: '#4FC3F7', completedColor: '#8E5CF7', currentColor: '#B48CFF' },
  { id: 'pequeninos',    title: 'Pequeninos',    subtitle: 'Histórias para crescer',   tint: '#EAF7EE', accent: '#66BB6A', completedColor: '#D59A2E', currentColor: '#F2C66D' },
  { id: 'descobridores', title: 'Descobridores', subtitle: 'Grandes aventuras',        tint: '#FFF4E3', accent: '#F0A93B', completedColor: '#2F9E9E', currentColor: '#65D6D6' },
  { id: 'jovens_da_fe',  title: 'Jovens da Fé',  subtitle: 'Coragem e sabedoria',      tint: '#F6ECFA', accent: '#BA68C8', completedColor: '#B56AD8', currentColor: '#E0A7FF' },
];

/**
 * Constrói as 4 regiões a partir do trackId oficial. Cada região recebe suas
 * histórias reais (ordenadas por `order`). Histórias sem região conhecida ficam
 * de fora do mapa (não inventa).
 */
export function getAdventureRegions() {
  return ADVENTURE_REGION_META.map(meta => {
    const regionStories = stories
      .filter(s => s.trackId === meta.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const images = REGION_MAP_IMAGES[meta.id] || null;
    return { ...meta, stories: regionStories, images };
  });
}

/**
 * Lista achatada das histórias na ordem das regiões (a "trilha" da jornada).
 * Usada para descobrir a próxima aventura (marco atual).
 */
export function getOrderedAdventureStories() {
  return getAdventureRegions().flatMap(r => r.stories);
}

// ── Geometria compartilhada da região (a tela e MapRegion usam a MESMA fórmula) ──
// Zona segura do TÍTULO no topo (nenhum marco entra) e BANDA dos marcos abaixo
// dela, impedindo colisão com o título. Fundo NEUTRO de pergaminho enquanto a arte
// carrega — nunca azul cru.
export const REGION_TITLE_SAFE = 0.16;          // topo reservado ao título da região
export const REGION_PARCHMENT_BG = '#E7D6B0';   // placeholder neutro (sem azul)

/** Banda vertical (frações) onde os marcos vivem, por nº de histórias. */
export function regionMarkerBand(storyCount) {
  return storyCount <= 3 ? { top: 0.36, bottom: 0.82 } : { top: 0.17, bottom: 0.87 };
}

// Proporção OFICIAL da arte do mapa (M5: reexportada em 9:16). FONTE ÚNICA — mudar
// AQUI muda marcador, caminho (path), câmera e "Ver mapa" (tudo é normalizado).
export const MAP_ASPECT = 9 / 16; // 0.5625

/**
 * Altura de uma região no MODO PRINCIPAL (Caminhada Cinematográfica): largura total
 * na proporção real da arte. A criança rola/sobe por ela. NÃO cresce por marcos.
 */
export function computeRegionHeight(width) {
  return Math.round(width / MAP_ASPECT); // = width*16/9
}

// imageRect em "contain" — usado pelo MODO 2 (Visão Geral / "Ver mapa"), que mostra
// a região INTEIRA num modal de orientação. Usa MAP_ASPECT (adapta-se sozinho).
export function computeImageRect(containerW, containerH) {
  let imageW;
  let imageH;
  if (containerW / containerH > MAP_ASPECT) {
    imageH = containerH;
    imageW = Math.round(containerH * MAP_ASPECT);
  } else {
    imageW = containerW;
    imageH = Math.round(containerW / MAP_ASPECT);
  }
  return {
    left: Math.round((containerW - imageW) / 2),
    top: Math.round((containerH - imageH) / 2),
    width: imageW,
    height: imageH,
  };
}

/** Fração vertical (0..1) do marco i — FALLBACK quando não há coordenada explícita. */
export function markerFraction(index, storyCount) {
  if (storyCount <= 1) return 0.62;
  const b = regionMarkerBand(storyCount);
  return b.bottom - ((b.bottom - b.top) / (storyCount - 1)) * index;
}

// ── M3: COORDENADAS NORMALIZADAS por história (FONTE ÚNICA DE VERDADE) ──────────
// x,y em 0..1 dentro da ARTE da região (y: 0 = topo, 1 = base). `label` = lado em
// que o título do marco aparece ('below' | 'left' | 'right'), para nunca cortar.
// Marcador, label, caminho (path) e câmera derivam TODOS daqui. Composição feita à
// mão por região (não por fórmula de índice), de baixo para cima (1ª história mais
// embaixo). Histórias sem coordenada caem no fallback (markerFraction + zigue-zague).
// B3.5 (microajuste final de pins e posições): ajuste fino sobre a TRILHA principal
// de cada arte, conforme feedback manual do Eduardo. Os títulos não aparecem mais no
// mapa (showLabel={false}); `label` segue definindo o lado seguro caso volte a exibir.
// `markerScale` (opcional) aumenta/diminui SÓ aquele pin (clamp 0.85–1.25).
export const STORY_MAP_COORDS = {
  // comece_aqui (2 histórias) — pins um pouco maiores (markerScale)
  creation:             { x: 0.73, y: 0.67, label: 'below', markerScale: 1.22 },
  noah:                 { x: 0.61, y: 0.29, label: 'left', markerScale: 1.10 },
  // pequeninos (baixo → cima)
  david_goliath:        { x: 0.69, y: 0.90, label: 'below' },
  jesus_children:       { x: 0.64, y: 0.71, label: 'right' },
  daniel_lions:         { x: 0.38, y: 0.61, label: 'left' },
  esther_queen:         { x: 0.68, y: 0.47, label: 'right' },
  lost_sheep:           { x: 0.47, y: 0.34, label: 'left' },
  good_samaritan:       { x: 0.72, y: 0.23, label: 'right' },
  // descobridores (baixo → cima)
  abraham_stars:        { x: 0.82, y: 0.90, label: 'below' },
  joseph_colorful_coat: { x: 0.64, y: 0.74, label: 'right' },
  moses_red_sea:        { x: 0.48, y: 0.61, label: 'left' },
  ruth_naomi:           { x: 0.76, y: 0.49, label: 'right' },
  miraculous_catch:     { x: 0.39, y: 0.35, label: 'left' },
  jonah_big_fish:       { x: 0.78, y: 0.22, label: 'right' },
  // jovens_da_fe (baixo → cima)
  samuel_hears_god:     { x: 0.68, y: 0.93, label: 'below' },
  josiah_young_king:    { x: 0.54, y: 0.75, label: 'right' },
  solomon_wisdom:       { x: 0.61, y: 0.60, label: 'right' },
  mary_says_yes:        { x: 0.70, y: 0.46, label: 'right' },
  timothy_faith:        { x: 0.45, y: 0.37, label: 'left' },
  jesus_temple:         { x: 0.78, y: 0.23, label: 'right' },
};

/**
 * Coordenada normalizada de uma história. Usa a coordenada explícita (fonte única);
 * só cai no fallback (markerFraction + zigue-zague) se a história não estiver no mapa.
 */
export function getStoryMapCoord(storyId, index = 0, storyCount = 1) {
  const c = STORY_MAP_COORDS[storyId];
  if (c) return c;
  return { x: index % 2 === 0 ? 0.30 : 0.70, y: markerFraction(index, storyCount), label: 'below' };
}
