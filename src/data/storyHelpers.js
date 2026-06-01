/**
 * Helpers de consulta às histórias.
 * Centralizam toda a lógica de filtragem — nenhuma tela precisa re-implementar.
 *
 * Uso:
 *   import { getStarterStories, getStoriesByLevel } from '../data/storyHelpers';
 */

import { stories } from './stories';

/** Histórias marcadas como ponto de entrada (isStarter: true e status: available). */
export function getStarterStories() {
  return stories.filter(s => s.isStarter === true && s.status === 'available');
}

/** Histórias disponíveis de um nível de experiência. */
export function getStoriesByLevel(level) {
  return stories.filter(s => s.level === level);
}

/** Histórias com status 'available'. */
export function getAvailableStories() {
  return stories.filter(s => s.status === 'available');
}

/** Histórias ainda não disponíveis (coming_soon ou premium). */
export function getLockedStories() {
  return stories.filter(s => s.status !== 'available');
}

/** Histórias de uma coleção bíblica específica. */
export function getStoriesByBiblicalCollection(collectionId) {
  return stories.filter(s => s.biblicalCollection === collectionId);
}

/** Histórias filtradas por testamento ('antigo' | 'novo'). */
export function getStoriesByTestament(testament) {
  return stories.filter(s => s.testament === testament);
}

/**
 * Todas as histórias em ordem cronológica bíblica.
 * Útil para a futura tela de Jornada Bíblica.
 */
export function getStoriesInChronologicalOrder() {
  return [...stories].sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
}

/**
 * Histórias de um nível agrupadas por coleção bíblica.
 * Retorna: [{ collectionId, collectionTitle, stories: [...] }, ...]
 * Útil para uma futura vista de trilha bíblica dentro de um nível.
 */
export function getStoriesByLevelGroupedByCollection(level) {
  const filtered = getStoriesByLevel(level);
  const groups = {};
  for (const s of filtered) {
    const key = s.biblicalCollection ?? 'outros';
    if (!groups[key]) {
      groups[key] = {
        collectionId: key,
        collectionTitle: s.biblicalCollectionTitle ?? key,
        stories: [],
      };
    }
    groups[key].stories.push(s);
  }
  return Object.values(groups).sort(
    (a, b) =>
      (a.stories[0]?.chronologicalOrder ?? 999) - (b.stories[0]?.chronologicalOrder ?? 999),
  );
}
