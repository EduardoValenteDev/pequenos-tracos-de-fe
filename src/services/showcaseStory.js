/**
 * showcaseStory.js — escolhe a história VITRINE da jornada (Mundo Vivo do Beni).
 *
 * Critério (do mais forte ao menos):
 *   1. história gratuita e jogável (totalCenas > 0, não coming_soon);
 *   2. trilha "comece_aqui" (Comece Aqui) tem prioridade;
 *   3. mais conteúdo disponível (maior totalCenas);
 *   4. menor order (ordem oficial da trilha).
 *
 * Helper puro e seguro — nunca lança; retorna null se não houver história jogável.
 */
import { stories } from '../data/stories';

export function getShowcaseStory() {
  const playable = stories.filter(s => (s.totalCenas ?? 0) > 0 && s.status !== 'coming_soon');
  const free = playable.filter(s => s.accessType === 'free');
  const pool = free.length ? free : playable;

  const scored = [...pool].sort((a, b) => {
    const aTrack = a.trackId === 'comece_aqui' ? 1 : 0;
    const bTrack = b.trackId === 'comece_aqui' ? 1 : 0;
    if (aTrack !== bTrack) return bTrack - aTrack;
    const aCenas = a.totalCenas ?? 0;
    const bCenas = b.totalCenas ?? 0;
    if (aCenas !== bCenas) return bCenas - aCenas;
    return (a.order ?? 99) - (b.order ?? 99);
  });

  return scored[0] ?? null;
}
