# Plan — Bloco 2 · Fase 2B.7.2 · Consumo controlado do entitlement

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7.2 · **Etapa SDD:** 4 (Plan) · **Portão Humano 2: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `0745932` · Spec: [spec-fase-2b72.md](./spec-fase-2b72.md) · Clarify: [clarify-fase-2b72.md](./clarify-fase-2b72.md).
> **PARA no Plan.** Nenhum código antes do Portão 3. Sem RevenueCat, sem dependência, sem tela/UI, sem 2C, sem `git`.

## Topologia (isolamento limpo)
```
entitlementPolicy (puro)  ←importado só por→  entitlementService (casca)  ←importado por→  accessControl.getCurrentPlan
                                                                                                     ↑
telas / hasStoryAccess / canOpenStoryFullExperience  →  isPremiumUser  →  getCurrentPlan   (inalterado)
```
**Só o `entitlementService` consome a policy** (RP7). `accessControl` consome o **service**, não a policy. Telas consomem `isPremiumUser` — **inalteradas**.

## Arquivos tocados (na implementação, após Portão 3)
1. `src/services/storageKeys.js` — **+** `ENTITLEMENT: '@ptf_entitlement_v1'` (registro; leitura real de runtime só em 2B.7.3).
2. `src/services/entitlementService.js` — **novo** (casca).
3. `src/services/accessControl.js` — `getCurrentPlan` delega.
4. `scripts/smoke.js` — checks 2B.7.2 + **migração do [1840]**.

**`App.js` NÃO é tocado nesta fase** (decisão do Portão 2 — "prefira evitar"): o `_snapshot` default `{ loaded:false }` já garante `free`, então o boot `loadEntitlement()` é **redundante sem fonte real** → adiado para 2B.7.3. Justificado no Analyze.

## Contrato 1 — `entitlementService` (casca)
```
import { decideEntitlement } from './entitlementPolicy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

let _snapshot = { loaded: false };   // em memória; default seguro

// Snapshot p/ a policy: estado em memória + `now` do relógio (a policy segue pura).
export function getEntitlementSnapshot() { return { ..._snapshot, now: Date.now() }; }

// Decisão + plano (o único ponto que consome a policy).
export function getEntitlementDecision() { return decideEntitlement(getEntitlementSnapshot()); }
export function getEntitlementPlan() {
  return getEntitlementDecision().decision === 'premium' ? 'premium' : 'free';
}

// Boot (molde loadCreatorQaMode): lê @ptf_entitlement_v1 (vazio nesta fase → loaded:false). NÃO grava.
export async function loadEntitlement() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ENTITLEMENT);
    _snapshot = raw ? { ...JSON.parse(raw), loaded: true } : { loaded: false };
  } catch { _snapshot = { loaded: false }; }
  return getEntitlementPlan();
}
```
Sem RevenueCat, sem `refresh`/`subscribe`/`AppState` (= 2B.7.3). `getEntitlementSnapshot` síncrono e gera `now` **on-demand** (nunca congelado). `loadEntitlement()` existe (try/catch, nunca lança) mas **NÃO é chamado no boot** nesta fase (App.js intocado) — o `_snapshot` default `{ loaded:false }` já resolve `free`; o boot load entra na 2B.7.3. A leitura de `@ptf_entitlement_v1` em runtime, portanto, **não ocorre** nesta fase (só no smoke, como teste de robustez).

## Contrato 2 — `getCurrentPlan` delega
```
export function getCurrentPlan() {
  if (ENABLE_LOCAL_PREMIUM_TEST_MODE) { console.warn(...); return 'premium'; }  // override dev preservado
  return entitlementServiceGetEntitlementPlan();   // decision==='premium' ? 'premium' : 'free'
}
```
`isPremiumUser = getCurrentPlan()==='premium' || isCreatorQaModeEnabled()` — **inalterado**.

## Compatibilidade (RP4)
Sem fonte real, `@ptf_entitlement_v1` está vazio → `{ loaded:false }` → `decideEntitlement` → `free/no_cache` → **`getCurrentPlan()==='free'`**, idêntico ao mock atual. Modo Criador/test-mode preservados. **Zero mudança de comportamento/visual.**

## Smoke (checks 2B.7.2)
1. **Delegação:** `getCurrentPlan` chama o `entitlementService` (não retorna `'free'` literal solto); o service consome `decideEntitlement`.
2. **Compatibilidade `free`:** `entitlementService` carregado isolado (AsyncStorage vazio + policy real) → `getEntitlementPlan()==='free'`; e com `rcActive` **sem** janela válida → `free`/`needs_revalidation` (nunca premium sem fonte válida).
3. **Isolamento migrado (ex-[1840]):** **só** `entitlementService` importa `entitlementPolicy`; **nenhuma tela** importa `entitlementService`/`entitlementPolicy`.
4. **Telas intocadas:** nenhum arquivo de `src/screens` modificado (shape) importa entitlement.
5. **Preservado:** `accessControl` mantém `ENABLE_LOCAL_PREMIUM_TEST_MODE` + `isPremiumUser = ... || isCreatorQaModeEnabled()`.
6. **Policy intacta:** `entitlementPolicy.js` segue puro (sem imports) e passa os 15 casos (bloco 2B.7.1 permanece verde).
7. **Chave:** `storageKeys` tem `ENTITLEMENT='@ptf_entitlement_v1'`.
8. **2C:** `app.json` sem `assetBundlePatterns`; requires premium intactos.

## Device (fumaça — não é validação de produto)
App abre normal; Modo Criador **on** libera premium igual; **off** bloqueia igual; nenhuma história premium nova liberada; mapa/histórias/perfil/downloads visualmente idênticos.

## Tasks (após Portão 3) — ver [tasks-fase-2b72.md](./tasks-fase-2b72.md)
- **T1** — `storageKeys`: `+ ENTITLEMENT: '@ptf_entitlement_v1'`.
- **T2** — `entitlementService.js` (Contrato 1): snapshot em memória, `getEntitlementSnapshot`/`getEntitlementDecision`/`getEntitlementPlan`/`loadEntitlement` (não chamado no boot). Único consumidor da policy.
- **T3** — `accessControl.getCurrentPlan` delega (Contrato 2; test-mode preservado).
- **T4** — `smoke.js`: checks 2B.7.2 + migração fiel do [1840] (incl. `loadEntitlement` com storage vazio/inválido/malformado → nunca premium).
- **T5** — gates (`smoke`/`doctor`/grep telas) + device fumaça + relatório PT-BR.
- **`App.js` NÃO é task** (evitado — ver acima).

## Invariantes
Telas, navegação, UI, paywall visual, **`App.js`**, `contentResolver`, `ProgressContext`, `app.json`, `assetBundlePatterns`, requires, assets — **intocados**. `entitlementPolicy.js` intocado. Sem dependência nova (AsyncStorage/storageKeys já existem). **2C não iniciada.** Se alguma tela precisar mudar → PARA e volta ao portão.

## Analyze (consistência spec↔plan) — ver [analyze-fase-2b72.md](./analyze-fase-2b72.md)
RP1→T2; RP2→T3; RP3/RP4→Contrato 1+2 (compat `free`, `App.js` evitado); RP5→T3; RP6→invariantes+T4(grep); RP7→T4(migração [1840]). Todos os aceites têm task/checagem. Ligação sem tela; comportamento preservado (free sem fonte); policy pura intacta; 2C bloqueada. **CONSISTENTE.**
