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
export const REGION_MAP_IMAGES = {
  comece_aqui:   { awake: require('../../assets/maps/R1A.png'), asleep: require('../../assets/maps/R1B.png') },
  pequeninos:    { awake: require('../../assets/maps/R2A.png'), asleep: require('../../assets/maps/R2B.png') },
  descobridores: { awake: require('../../assets/maps/R3A.png'), asleep: require('../../assets/maps/R3B.png') },
  jovens_da_fe:  { awake: require('../../assets/maps/R4A.png'), asleep: require('../../assets/maps/R4B.png') },
};

// Metadados visuais por região. `tint` = cor de borda/realce suave (fallback de
// fundo enquanto a imagem carrega); `accent` = cor do caminho/realces.
export const ADVENTURE_REGION_META = [
  { id: 'comece_aqui',   title: 'Comece Aqui',   subtitle: 'Os primeiros passos',      tint: '#EAF6FF', accent: '#4FC3F7' },
  { id: 'pequeninos',    title: 'Pequeninos',    subtitle: 'Histórias para crescer',   tint: '#EAF7EE', accent: '#66BB6A' },
  { id: 'descobridores', title: 'Descobridores', subtitle: 'Grandes aventuras',        tint: '#FFF4E3', accent: '#F0A93B' },
  { id: 'jovens_da_fe',  title: 'Jovens da Fé',  subtitle: 'Coragem e sabedoria',      tint: '#F6ECFA', accent: '#BA68C8' },
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
// dela. Isso impede histórias colidirem com o título da região.
export const REGION_TITLE_SAFE = 0.30;   // topo reservado ao título da região
export const MARKER_BAND_TOP = 0.34;     // marcos só começam abaixo do título
export const MARKER_BAND_BOTTOM = 0.82;  // e terminam acima do seam inferior
const MARKER_MIN_GAP = 158;              // distância vertical mínima entre marcos

/**
 * Altura de uma região: respeita a proporção real da arte (768×2048) e cresce o
 * suficiente para os marcos caberem na banda segura sem se sobrepor.
 */
export function computeRegionHeight(width, storyCount) {
  const proportional = Math.round((width * 2048) / 768);
  const span = MARKER_BAND_BOTTOM - MARKER_BAND_TOP;
  const need = storyCount > 1 ? Math.ceil((MARKER_MIN_GAP * (storyCount - 1)) / span) : 0;
  return Math.max(proportional, need);
}

/** Fração vertical (0..1) do marco i (1ª história embaixo → jornada sobe). */
export function markerFraction(index, storyCount) {
  if (storyCount <= 1) return 0.60;
  return MARKER_BAND_BOTTOM - ((MARKER_BAND_BOTTOM - MARKER_BAND_TOP) / (storyCount - 1)) * index;
}
