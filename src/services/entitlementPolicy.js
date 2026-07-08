/**
 * entitlementPolicy.js — Decisão PURA de entitlement (Bloco 2 · Fase 2B.7.1).
 *
 * ⚠️ PURA: SEM imports, SEM I/O, SEM React, SEM storage, SEM dependências novas, SEM efeitos
 * colaterais. NUNCA lança. `now` é sempre INJETADO (a função não lê o relógio) → determinística.
 *
 * NÃO é consumida por ninguém nesta fase (introduzida ANTES do consumo, como contentManifest).
 * O consumo real (getCurrentPlan/entitlementService/RevenueCat) é fase futura (2B.7.2+).
 *
 * Contrato:  decideEntitlement(snapshot) → { decision, reason }
 *   decision: 'premium' | 'free' | 'needs_revalidation'
 *   reason:   'no_cache' | 'invalid_data' | 'clock_rollback' | 'expired'
 *           | 'stale_validation' | 'active' | 'cancelled_active' | 'needs_revalidation' | 'inactive'
 *
 * `needs_revalidation` bloqueia premium (o consumidor futuro mapeará decision !== 'premium' → free),
 * mas é distinto de `free` para permitir UX de "revalidar online".
 *
 * Matriz CONSERVADORA — bloqueios ANTES de liberações; avaliação top-down (1º match decide):
 *   1  !loaded ................................................. free / no_cache
 *   2  !isValidTs(now) ......................................... free / invalid_data   (antes de QUALQUER aritmética)
 *   3  now < maxSeenDeviceTimestamp (relógio retrocedeu) ....... needs_revalidation / clock_rollback
 *   4  now >= expiresAt (expiração dura, offline inclusive) .... free / expired
 *   5  (now - lastValidatedAt) > 7 dias (janela vencida) ....... needs_revalidation / stale_validation
 *   6  rcActive && hasValidWindow .............................. premium / active
 *   7  rcActive (sem janela válida) ............................ needs_revalidation / needs_revalidation
 *   8  rcCancelledButPaid && hasValidWindow .................... premium / cancelled_active
 *   9  rcCancelledButPaid (sem janela válida) .................. needs_revalidation / needs_revalidation
 *   10 senão .................................................. free / inactive
 */

/** Janela offline máxima confiável sem revalidação online: 7 dias (Clarify C1). */
export const OFFLINE_MAX_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * True se `t` é um timestamp POSITIVO finito. Rejeita NaN, negativos, 0, null, undefined,
 * strings e não-numéricos → base da decisão conservadora sobre dados inválidos.
 */
export function isValidTs(t) {
  return typeof t === 'number' && Number.isFinite(t) && t > 0;
}

/**
 * True se há janela de validade COMPLETA para liberar premium offline: `expiresAt` válido e
 * futuro E `lastValidatedAt` válido e dentro dos 7 dias. Nunca libera premium por booleano solto.
 */
function hasValidWindow(s) {
  return (
    isValidTs(s.expiresAt) && s.now < s.expiresAt
    && isValidTs(s.lastValidatedAt) && (s.now - s.lastValidatedAt) <= OFFLINE_MAX_WINDOW_MS
  );
}

const decide = (decision, reason) => ({ decision, reason });

/**
 * Decisão pura de entitlement a partir de um snapshot. NUNCA lança: snapshot ausente/parcial e
 * timestamps inválidos caem nos ramos conservadores (no_cache / invalid_data).
 *
 * @param {{
 *   loaded?: boolean, now?: number, expiresAt?: number|null, lastValidatedAt?: number|null,
 *   maxSeenDeviceTimestamp?: number|null, rcActive?: boolean, rcCancelledButPaid?: boolean
 * }} snapshot
 * @returns {{ decision: 'premium'|'free'|'needs_revalidation', reason: string }}
 */
export function decideEntitlement(snapshot) {
  const s = snapshot || {};

  // 1) Sem cache/estado carregado → default seguro (nunca premium sem cache).
  if (s.loaded !== true) return decide('free', 'no_cache');

  const now = s.now;
  // 2) `now` validado ANTES de qualquer aritmética (NaN/negativo/0/null/undefined/não-numérico).
  if (!isValidTs(now)) return decide('free', 'invalid_data');

  // 3) Relógio retrocedeu de forma suspeita → bloqueia + exige revalidação.
  if (isValidTs(s.maxSeenDeviceTimestamp) && now < s.maxSeenDeviceTimestamp) {
    return decide('needs_revalidation', 'clock_rollback');
  }

  // 4) Expiração dura (>=): no instante exato de expiração já bloqueia, mesmo offline.
  if (isValidTs(s.expiresAt) && now >= s.expiresAt) return decide('free', 'expired');

  // 5) Janela offline vencida (> 7 dias; o limite EXATO de 7 dias ainda passa).
  if (isValidTs(s.lastValidatedAt) && (now - s.lastValidatedAt) > OFFLINE_MAX_WINDOW_MS) {
    return decide('needs_revalidation', 'stale_validation');
  }

  // 6-9) Liberações — só com janela COMPLETA válida (expiresAt futuro + validação recente).
  if (s.rcActive === true) {
    return hasValidWindow(s) ? decide('premium', 'active') : decide('needs_revalidation', 'needs_revalidation');
  }
  if (s.rcCancelledButPaid === true) {
    return hasValidWindow(s) ? decide('premium', 'cancelled_active') : decide('needs_revalidation', 'needs_revalidation');
  }

  // 10) Inativo.
  return decide('free', 'inactive');
}
