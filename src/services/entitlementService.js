/**
 * entitlementService.js — Casca de ENTITLEMENT (Bloco 2 · Fase 2B.7.2).
 *
 * PONTE TÉCNICA fail-closed entre a política pura (`entitlementPolicy`) e o gate central
 * (`accessControl.getCurrentPlan`). Mantém o SNAPSHOT de entitlement em memória e expõe a
 * decisão de forma SÍNCRONA. É o ÚNICO módulo que consome `entitlementPolicy`.
 *
 * ⚠️ NESTA FASE NÃO HÁ FONTE REAL (RevenueCat = 2B.7.3): o snapshot fica no default
 * `{ loaded:false }` → decisão `free` (idêntico ao mock anterior de getCurrentPlan).
 * `loadEntitlement()` existe (pronto p/ a 2B.7.3) mas NÃO é chamado no boot; é exercitado
 * apenas pelo smoke. NÃO grava entitlement, NÃO faz compra, NÃO libera premium sem passar
 * por `decideEntitlement` — nenhum campo salvo (ex.: `plan`) autoriza por conta própria.
 */
import { decideEntitlement } from './entitlementPolicy';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
 * ⚠️ NÃO é chamado no boot nesta fase (App.js intocado). A leitura real de runtime entra na
 * 2B.7.3, junto da fonte (RevenueCat). Aqui fica pronto e é exercitado pelo smoke.
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
