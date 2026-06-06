/**
 * nextAdventureService.js — Regra centralizada da próxima recomendação após
 * concluir uma história.
 *
 * Pura (sem I/O, sem navegação). Não altera progresso, estrelas nem storage.
 *
 * Estados:
 *   A — existe próxima história LIBERADA e NÃO concluída → recomendar.
 *   B — não há liberada incompleta, mas existe história/trilha BLOQUEADA →
 *       sugerir chamar responsável.
 *   C — todas as histórias acessíveis já foram concluídas → rever a jornada.
 *
 * Regras importantes:
 *   - Nunca recomendar uma história já concluída como "Próxima aventura".
 *   - Nunca recomendar a própria história recém-concluída.
 *   - Preferir a próxima história da MESMA trilha; senão, seguir a ordem oficial.
 */
import { CATALOG } from '../data/catalog';
import { hasAccess } from './accessControl';

// Ordem oficial das trilhas (igual à navegação/Home/Aventuras).
const TRAIL_ORDER = ['comece', 'pequeninos', 'descobridores', 'jovens_da_fe'];

function buildOrderedList() {
  const list = [];
  for (const trail of TRAIL_ORDER) {
    const entries = CATALOG[trail] ?? [];
    for (const entry of entries) {
      if (entry.type === 'story') list.push({ id: entry.storyId, trail });
    }
  }
  return list;
}

function trailOfStory(storyId) {
  for (const trail of TRAIL_ORDER) {
    const entries = CATALOG[trail] ?? [];
    if (entries.some(e => e.type === 'story' && e.storyId === storyId)) return trail;
  }
  return null;
}

/**
 * @param {object} params
 * @param {string} params.currentStoryId  — história recém-concluída
 * @param {Array}  params.stories         — lista de stories (stories.js)
 * @param {object} params.progressByStory — progresso por história (ProgressContext)
 * @returns {{ state:'A'|'B'|'C', story?:object, inProgress?:boolean }}
 */
export function getNextAdventureRecommendation({ currentStoryId, stories, progressByStory }) {
  const storyMap = Object.fromEntries((stories ?? []).map(s => [s.id, s]));
  const getCount = (id) => {
    const p = progressByStory?.[id] || {};
    return Object.values(p).filter(Boolean).length;
  };
  const isPlayable = (s) => !!s && (s.totalCenas ?? 0) > 0 && s.status !== 'coming_soon';
  const isCompleted = (s) => isPlayable(s) && getCount(s.id) >= s.totalCenas;
  const isAccessible = (s) => isPlayable(s) && hasAccess(s);

  const ordered = buildOrderedList()
    .map(o => ({ ...o, story: storyMap[o.id] }))
    .filter(o => isPlayable(o.story));

  const currentTrail = trailOfStory(currentStoryId);

  // Estado A — próxima história liberada e não concluída (nunca a atual).
  const accessibleIncomplete = ordered.filter(o =>
    o.id !== currentStoryId && isAccessible(o.story) && !isCompleted(o.story),
  );
  if (accessibleIncomplete.length > 0) {
    const sameTrail = accessibleIncomplete.filter(o => o.trail === currentTrail);
    const pick = (sameTrail[0] ?? accessibleIncomplete[0]).story;
    return { state: 'A', story: pick, inProgress: getCount(pick.id) > 0 };
  }

  // Estado B — não há liberada incompleta, mas existe história bloqueada.
  const blocked = ordered.filter(o => o.id !== currentStoryId && !isAccessible(o.story));
  if (blocked.length > 0) {
    return { state: 'B', story: blocked[0].story };
  }

  // Estado C — todas as acessíveis concluídas.
  return { state: 'C' };
}
