/**
 * entitlementService.js — Casca de ENTITLEMENT (Bloco 2 · Fase 2B.7.2 → 2B.7.3).
 *
 * PONTE TÉCNICA fail-closed entre a política pura (`entitlementPolicy`) e o gate central
 * (`accessControl.getCurrentPlan`). Mantém o SNAPSHOT de entitlement em memória e expõe a
 * decisão de forma SÍNCRONA. É o ÚNICO módulo que consome `entitlementPolicy` e `entitlementSource`.
 *
 * ⚠️ FONTE REAL AINDA STUB (2B.7.3): `entitlementSource.fetchEntitlement()` resolve `null` →
 * `free`. A 2B.7.3 conecta o ENCANAMENTO (boot `loadEntitlement` + refresh por `AppState` +
 * persistência sanitizada), mantendo fail-closed. RevenueCat (adapter da fonte) = 2B.7.4.
 * NÃO grava entitlement sem sanitizar, NÃO faz compra, NÃO libera premium sem passar por
 * `decideEntitlement` — nenhum campo salvo (ex.: `plan`) autoriza por conta própria.
 */
import { decideEntitlement, isValidTs } from './entitlementPolicy';
import { fetchEntitlement } from './entitlementSource';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { STORAGE_KEYS } from './storageKeys';

// Estado em memória. Default SEGURO (fail-closed): sem cache → `free`.
let _snapshot = { loaded: false };

/**
 * Snapshot passado à policy: estado em memória + `now` gerado NO MOMENTO (nunca congelado).
 * A policy segue pura (recebe `now` injetado); quem lê o relógio é esta casca.
 */
export function getEntitlementSnapshot() {
  return { ..._snapshot, now: Date.now() };
}

/** Decisão da policy — ÚNICO ponto do app que consome `entitlementPolicy`. */
export function getEntitlementDecision() {
  return decideEntitlement(getEntitlementSnapshot());
}

/**
 * Plano derivado da decisão: só `premium` libera premium; `free`/`needs_revalidation` → `free`
 * (nesta fase `needs_revalidation` bloqueia premium). SEMPRE via `decideEntitlement`.
 */
export function getEntitlementPlan() {
  return getEntitlementDecision().decision === 'premium' ? 'premium' : 'free';
}

/**
 * Carrega o snapshot de `@ptf_entitlement_v1` para a memória. ASSÍNCRONO, protegido por
 * try/catch — NUNCA lança para fora. Storage vazio/`null`/JSON inválido/não-objeto → default
 * seguro `{ loaded:false }`. Objeto JSON válido → `{ ...parsed, loaded:true }` (a policy decide;
 * nunca premium sem janela válida — fail-closed).
 *
 * Chamado UMA vez no boot via `initEntitlement()` (fire-and-forget). Não bloqueia a abertura:
 * `getEntitlementSnapshot()` é síncrono e retorna `{ loaded:false }` → `free` até carregar.
 * @returns {Promise<'premium'|'free'>} o plano após carregar (nunca rejeita).
 */
export async function loadEntitlement() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ENTITLEMENT);
    if (!raw) {
      _snapshot = { loaded: false };
    } else {
      const parsed = JSON.parse(raw);
      _snapshot = (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
        ? { ...parsed, loaded: true }
        : { loaded: false };
    }
  } catch (e) {
    _snapshot = { loaded: false }; // fail-closed: qualquer erro → sem cache → free
  }
  return getEntitlementPlan();
}

// ─────────────────────────────────────────────────────────────────────────────
// Fase 2B.7.3 — fonte real (via port `entitlementSource`), persistência sanitizada,
// boot controlado e refresh conservador por `AppState`. Tudo fail-closed.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sanitiza um objeto CRU da fonte para um snapshot confiável. Copia SÓ os campos do contrato
 * com TIPOS válidos; DESCARTA qualquer outro (ex.: `plan` solto). `maxSeenDeviceTimestamp`
 * NUNCA regride: max(anterior conhecido, recebido válido, `now`). Sem `raw` objeto → `null`
 * (nada a persistir/promover).
 * @returns {object|null}
 */
function sanitizeEntitlement(raw, now) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const prevMax = (_snapshot && isValidTs(_snapshot.maxSeenDeviceTimestamp)) ? _snapshot.maxSeenDeviceTimestamp : 0;
  const rawMax = isValidTs(raw.maxSeenDeviceTimestamp) ? raw.maxSeenDeviceTimestamp : 0;
  const out = {
    loaded: true,
    lastValidatedAt: isValidTs(raw.serverNow) ? raw.serverNow : now, // relógio do servidor preferível
    maxSeenDeviceTimestamp: Math.max(prevMax, rawMax, now),          // nunca regride (anti-relógio)
  };
  if (typeof raw.rcActive === 'boolean') out.rcActive = raw.rcActive;
  if (typeof raw.rcCancelledButPaid === 'boolean') out.rcCancelledButPaid = raw.rcCancelledButPaid;
  if (isValidTs(raw.expiresAt)) out.expiresAt = raw.expiresAt;
  return out;
}

/** Persiste APENAS um snapshot já sanitizado em `@ptf_entitlement_v1`. Nunca lança. */
async function saveEntitlement(snap) {
  try { await AsyncStorage.setItem(STORAGE_KEYS.ENTITLEMENT, JSON.stringify(snap)); } catch (e) { /* mantém memória */ }
}

/**
 * Revalida o entitlement na fonte (port). CONSERVADOR e NUNCA lança para fora. Sucesso
 * (snapshot sanitizado) → atualiza memória + persiste. `null`/erro/dados inválidos → MANTÉM
 * o snapshot atual (NÃO promove premium, NÃO apaga um cache válido existente).
 * @returns {Promise<'premium'|'free'>}
 */
export async function refreshEntitlement() {
  try {
    const now = Date.now();
    const clean = sanitizeEntitlement(await fetchEntitlement(), now);
    if (clean) { _snapshot = clean; await saveEntitlement(clean); }
  } catch (e) { /* conservador: mantém _snapshot */ }
  return getEntitlementPlan();
}

let _appStateSub = null;

/**
 * Boot controlado do entitlement. FIRE-AND-FORGET, NUNCA lança, NÃO bloqueia a abertura.
 * IDEMPOTENTE (seguro se o `useEffect` rodar mais de uma vez em dev): o listener de `AppState`
 * é registrado NO MÁXIMO uma vez (guard). Revalida quando o app volta a `active`.
 */
export function initEntitlement() {
  try {
    loadEntitlement().catch(() => {}); // carrega cache 1× (nunca propaga)
    if (!_appStateSub) {
      _appStateSub = AppState.addEventListener('change', (s) => {
        if (s === 'active') refreshEntitlement().catch(() => {});
      });
    }
  } catch (e) { /* nunca lança: o app abre mesmo se AppState falhar */ }
}

/** Cleanup seguro do listener de `AppState` (não requerido no root, que vive com o app). */
export function stopEntitlementAutoRefresh() {
  try { if (_appStateSub && _appStateSub.remove) _appStateSub.remove(); } catch (e) { /* noop */ }
  _appStateSub = null;
}
