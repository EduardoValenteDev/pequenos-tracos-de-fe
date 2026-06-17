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
// dela, impedindo colisão com o título. Fundo NEUTRO de pergaminho enquanto a arte
// carrega — nunca azul cru.
export const REGION_TITLE_SAFE = 0.16;          // topo reservado ao título da região
export const REGION_PARCHMENT_BG = '#E7D6B0';   // placeholder neutro (sem azul)

/** Banda vertical (frações) onde os marcos vivem, por nº de histórias. */
export function regionMarkerBand(storyCount) {
  return storyCount <= 3 ? { top: 0.36, bottom: 0.82 } : { top: 0.17, bottom: 0.87 };
}

// Proporção REAL dos mapas (768×2048). Usada para exibir a região INTEIRA com
// "contain" dentro do painel da tela (sem zoom, sem corte).
export const MAP_ASPECT = 768 / 2048;

/**
 * Retângulo REAL da imagem (modo contain) dentro de um container W×H. TODOS os
 * elementos do mapa (caminho e pins) se posicionam dentro deste imageRect, então
 * nunca saem da arte. Fórmula oficial do bloco Full Map Region View.
 */
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
  const left = Math.round((containerW - imageW) / 2);
  const top = Math.round((containerH - imageH) / 2);
  return { left, top, width: imageW, height: imageH };
}

/** Fração vertical (0..1) do marco i (1ª história embaixo → jornada sobe). */
export function markerFraction(index, storyCount) {
  if (storyCount <= 1) return 0.62;
  const b = regionMarkerBand(storyCount);
  return b.bottom - ((b.bottom - b.top) / (storyCount - 1)) * index;
}
