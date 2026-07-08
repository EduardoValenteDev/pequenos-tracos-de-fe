/**
 * entitlementSource.js — PORT (interface adaptadora) da fonte de entitlement (Fase 2B.7.3).
 *
 * Contrato único da FONTE real de entitlement. O `entitlementService` consome esta interface
 * para revalidar entitlement; a implementação concreta (RevenueCat) é fase futura (2B.7.4).
 *
 * ⚠️ NESTA FASE: implementação STUB fail-closed — `fetchEntitlement()` resolve `null` (sem
 * entitlement) → o app resolve `free`. NUNCA lança (erro interno futuro deve virar `null`).
 * NÃO importa dependência nova, NÃO acessa rede, NÃO toca RevenueCat/NetInfo.
 *
 * Contrato:
 *   fetchEntitlement() → Promise<RawEntitlement | null>
 *     RawEntitlement: {
 *       rcActive: boolean,               // entitlement ativo (inclui grace do provedor)
 *       rcCancelledButPaid: boolean,     // cancelado, mas dentro do período pago
 *       expiresAt: number | null,        // expiração (ms epoch) do servidor
 *       serverNow?: number               // relógio confiável do servidor (preferido a Date.now())
 *     }
 *     null = sem entitlement conhecido → decisão `free`.
 */

/**
 * Busca o entitlement atual da fonte real. STUB desta fase: retorna `null` (sem entitlement).
 * A implementação RevenueCat (2B.7.4) substituirá o corpo, mantendo o contrato e o fail-closed
 * (qualquer erro → `null`, nunca lança).
 * @returns {Promise<null>}
 */
export async function fetchEntitlement() {
  // 2B.7.3: sem fonte real conectada ainda → sem entitlement → free.
  return null;
}
