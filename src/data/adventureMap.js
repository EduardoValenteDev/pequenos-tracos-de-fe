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

// Metadados visuais provisórios por região (fundo por CÓDIGO no M1, sem
// importar assets/maps/). `tint` = pergaminho suave da região; `accent` = cor
// do caminho/realces.
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
    return { ...meta, stories: regionStories };
  });
}

/**
 * Lista achatada das histórias na ordem das regiões (a "trilha" da jornada).
 * Usada para descobrir a próxima aventura (marco atual).
 */
export function getOrderedAdventureStories() {
  return getAdventureRegions().flatMap(r => r.stories);
}
