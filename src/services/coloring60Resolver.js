/**
 * coloring60Resolver.js — Resolvedor LOCAL-FIRST do piloto Colorir 60 por identidade
 * composta (`storyId`, `activityId`). Função PURA: sem side effects, sem storage, sem
 * entitlement, sem conclusão, sem writer, sem rede/remoto e sem qualquer caminho legado.
 *
 * Combina duas camadas ADITIVAS já ratificadas (P1.T5, commit revisado):
 *   - o catálogo semântico (`coloring60Catalog`) — validade e metadados da atividade;
 *   - o registro estático local (`coloring60LocalAssets`) — a FONTE runtime (require Metro).
 *
 * Distingue TRÊS estados HONESTOS e mutuamente exclusivos:
 *   - 'available' → atividade conhecida COM fonte local ativa (ex.: `light` → scene_02.png).
 *                   Retorna { status, activity: <metadados>, source: <fonte runtime> }.
 *   - 'deferred'  → atividade conhecida SEM fonte local ainda (living_world/people_and_care,
 *                   cuja integração de PNG só ocorre em P5). Ausência é HONESTA:
 *                   { status, activity: <metadados>, source: null } — JAMAIS fallback.
 *   - 'unknown'   → story/activityId fora do piloto (ou identidade inválida). Nunca cai em
 *                   cena/legado: { status, activity: null, source: null }.
 *
 * INVARIANTES (nunca violar):
 *   - `activityId` é STRING SEMÂNTICA. Este resolvedor JAMAIS converte para número, JAMAIS
 *     interpreta como sceneId/cenaIndex e JAMAIS resolve por índice. Entrada não-string,
 *     vazia ou numérica ⇒ 'unknown'.
 *   - NÃO importa nem chama `coloringImages`/`getColoringImage`/`useResolvedColoringImage`/
 *     resolvedor legado/`contentResolver`/pack remoto.
 *   - `deferred` NUNCA reaproveita a fonte de `light` (nem scene_*): ausência é `null`.
 *   - Puro e determinístico: a mesma entrada retorna sempre o mesmo estado.
 *
 * Governança: specs 014/015/016/017 · DECISIONS.md PL01A-03/PL01G · tasks.md P2.T1.
 */

import { getColoring60Activity } from '../data/coloring60Catalog';
import { getColoring60LocalSource } from '../assets/coloring60LocalAssets';

// Estados honestos da resolução Colorir 60 (contrato estável e congelado).
export const COLORING60_RESOLUTION_STATUS = Object.freeze({
  AVAILABLE: 'available',
  DEFERRED: 'deferred',
  UNKNOWN: 'unknown',
});

/**
 * resolveColoring60Lineart(storyId, activityId) — resolve a fonte de lineart do piloto
 * Colorir 60 por identidade composta, distinguindo available/deferred/unknown.
 * Retorno SEMPRE no formato { status, activity, source }. Não lança.
 */
export function resolveColoring60Lineart(storyId, activityId) {
  // Identidade é SEMÂNTICA: só strings não-vazias podem resolver. Sem coerção numérica,
  // sem parseInt, sem interpretar índices — um número (ex.: 2) NUNCA vira atividade.
  if (
    typeof storyId !== 'string' ||
    typeof activityId !== 'string' ||
    storyId.length === 0 ||
    activityId.length === 0
  ) {
    return { status: COLORING60_RESOLUTION_STATUS.UNKNOWN, activity: null, source: null };
  }

  const activity = getColoring60Activity(storyId, activityId);
  if (!activity) {
    // Fora do piloto (story ou activityId inexistente). Nunca cai em cena/legado.
    return { status: COLORING60_RESOLUTION_STATUS.UNKNOWN, activity: null, source: null };
  }

  const source = getColoring60LocalSource(storyId, activityId);
  if (source == null) {
    // Conhecida, porém fonte runtime ainda não integrada (P5). Ausência honesta:
    // sem fallback para outro lineart, sem scene_02, sem placeholder.
    return { status: COLORING60_RESOLUTION_STATUS.DEFERRED, activity, source: null };
  }

  return { status: COLORING60_RESOLUTION_STATUS.AVAILABLE, activity, source };
}
