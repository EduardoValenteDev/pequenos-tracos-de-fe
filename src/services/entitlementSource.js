/**
 * entitlementSource.js — ADAPTER RevenueCat (Bloco 2 · Fase 2B.7.4).
 *
 * Implementação concreta do PORT de entitlement. É o ÚNICO módulo do app que conhece
 * RevenueCat: lê o `CustomerInfo` e o mapeia para o `RawEntitlement` do contrato. O
 * `entitlementService` consome só este port (nunca importa RevenueCat).
 *
 * ⚠️ FAIL-CLOSED: `fetchEntitlement()` NUNCA lança. Qualquer falha (SDK indisponível, chave
 * pública ausente, rede, `CustomerInfo` ausente/malformado, sem entitlement `premium` ativo)
 * → `null` → o service resolve `free`. O adapter APENAS monta dados crus; QUEM DECIDE premium
 * é `decideEntitlement` (via service). Nenhum booleano solto libera premium.
 *
 * ESCOPO 2B.7.4 (mínimo): configurar o SDK (idempotente) + ler entitlement. SEM compra,
 * restore, offerings, paywall ou sandbox (fases 2B.7.4b/c/d). NÃO importa
 * `react-native-purchases-ui`. Só usa a PUBLIC SDK key (pública por design); NENHUMA secret key.
 *
 * Contrato:
 *   fetchEntitlement() → Promise<RawEntitlement | null>
 *     RawEntitlement: {
 *       rcActive: boolean,               // entitlement `premium` ativo (só de entitlements.active)
 *       rcCancelledButPaid: boolean,     // cancelado (auto-renovação off) mas dentro do período pago
 *       expiresAt: number | null,        // expirationDate → ms epoch (ou null)
 *       serverNow?: number               // requestDate → ms epoch (relógio do servidor; preferido)
 *     }
 *     null = sem entitlement conhecido → decisão `free`.
 */
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

// Identificador do entitlement "premium" no dashboard RevenueCat (a confirmar em 2B.7.4b).
const PREMIUM_ENTITLEMENT_ID = 'premium';

/**
 * Public SDK key da plataforma atual, lida das envs PÚBLICAS (`EXPO_PUBLIC_*`, embarcadas por
 * design — NÃO são segredo). Ausente → `undefined` (adapter cai em `null` → `free`).
 * @returns {string|undefined}
 */
export function getRevenueCatApiKey() {
  return Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
}

let _configured = false;

/**
 * Configura o SDK RevenueCat UMA vez (IDEMPOTENTE via guard). Sem chave pública → NÃO configura
 * e retorna `false` (o app segue: `fetchEntitlement` cai em `null` → `free`). NUNCA lança.
 * @returns {boolean} true se o SDK está configurado (nesta ou em chamada anterior).
 */
export function configureRevenueCat() {
  try {
    if (_configured) return true;
    const apiKey = getRevenueCatApiKey();
    if (!apiKey) return false; // chave ausente → fail-closed; app abre normal
    Purchases.configure({ apiKey });
    _configured = true;
    return true;
  } catch (e) {
    return false; // qualquer erro de configure → não configurado → free
  }
}

/**
 * Converte string ISO ou número em timestamp válido (finito, > 0) ou `null`. null-safe.
 * @returns {number|null}
 */
function toValidTs(v) {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Date.parse(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Mapeia `CustomerInfo` → `RawEntitlement`. PURO e null-safe. Sem entitlement `premium` ativo
 * (ou input malformado) → `null`. Só monta dados crus; a decisão fica com `decideEntitlement`.
 * @returns {{rcActive: boolean, rcCancelledButPaid: boolean, expiresAt: number|null, serverNow: number|null}|null}
 */
export function mapCustomerInfo(customerInfo) {
  const active = customerInfo && customerInfo.entitlements && customerInfo.entitlements.active;
  const e = active ? active[PREMIUM_ENTITLEMENT_ID] : null;
  if (!e) return null; // sem entitlement premium ativo → free
  return {
    rcActive: true,                                 // SÓ vem de entitlements.active['premium']
    rcCancelledButPaid: e.willRenew === false,      // cancelado, ainda dentro do período pago
    expiresAt: toValidTs(e.expirationDate),         // expirationDate → ts válido ou null
    serverNow: toValidTs(customerInfo.requestDate), // requestDate (relógio servidor) → ts ou null
  };
}

/**
 * Busca o entitlement atual via RevenueCat. FAIL-CLOSED: nunca lança. SDK não configurado /
 * chave ausente / rede / `CustomerInfo` ausente ou malformado → `null` → o service mantém o
 * comportamento atual (`free`). Substitui o stub 2B.7.3 mantendo o contrato do port.
 * @returns {Promise<{rcActive: boolean, rcCancelledButPaid: boolean, expiresAt: number|null, serverNow: number|null}|null>}
 */
export async function fetchEntitlement() {
  try {
    if (!configureRevenueCat()) return null; // sem chave/SDK → free
    const customerInfo = await Purchases.getCustomerInfo();
    return mapCustomerInfo(customerInfo);
  } catch (e) {
    return null; // fail-closed: qualquer erro → free
  }
}
