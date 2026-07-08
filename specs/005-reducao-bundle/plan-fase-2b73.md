# Plan — Bloco 2 · Fase 2B.7.3 · Fonte real de entitlement + persistência/boot/refresh

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7.3 · **Etapa SDD:** 4 (Plan) · **Portão Humano 2: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `e8f7a88` · Spec: [spec-fase-2b73.md](./spec-fase-2b73.md) · Clarify: [clarify-fase-2b73.md](./clarify-fase-2b73.md).
> **PARA no Plan.** Nenhum código antes do Portão 3. Sem RevenueCat/dependência, sem telas, sem 2C, sem `git`.

## Topologia
```
entitlementSource (port + STUB)  →importado por→  entitlementService  →  getCurrentPlan (já delega)
entitlementPolicy (puro)         →importado só por→  entitlementService
App.js boot  →  initEntitlement()  (loadEntitlement fire-and-forget + AppState refresh)
```
`accessControl`/`entitlementPolicy` **intocados**. Telas seguem em `isPremiumUser` — inalteradas.

## Arquivos tocados (na implementação, após Portão 3)
1. `src/services/entitlementSource.js` — **novo** (port + stub fail-closed).
2. `src/services/entitlementService.js` — **+** `refreshEntitlement`/`saveEntitlement`(sanitize)/`initEntitlement`/AppState.
3. `App.js` — **1 linha** `initEntitlement()` no `useEffect` de boot (decisão abaixo).
4. `scripts/smoke.js` — checks 2B.7.3.
**Proibidos:** telas/packs/`contentResolver`/`ProgressContext`/navegação/`app.json`/requires/assets/`accessControl`/`entitlementPolicy`/RevenueCat/NetInfo.

## Contrato 1 — `entitlementSource.js` (port + stub)
```
// fetchEntitlement() → Promise<RawEntitlement | null>. NUNCA lança (erro → null).
//   RawEntitlement: { rcActive:boolean, rcCancelledButPaid:boolean, expiresAt:number|null, serverNow?:number }
//   null = sem entitlement → free. STUB desta fase resolve null. RevenueCat = 2B.7.4 (impl. da interface).
export async function fetchEntitlement() { return null; }
```

## Contrato 2 — `entitlementService.js` (adições)
```
import { decideEntitlement, isValidTs } from './entitlementPolicy';   // ainda o único consumidor da policy
import { fetchEntitlement } from './entitlementSource';
import { AppState } from 'react-native';   // NATIVO, sem dependência

// Só campos do contrato com tipos válidos; descarta o resto (ex.: `plan` solto). Fail-closed.
function sanitize(raw, now) {
  if (!raw || typeof raw !== 'object') return null;
  const out = { loaded: true, lastValidatedAt: (isValidTs(raw.serverNow) ? raw.serverNow : now),
                maxSeenDeviceTimestamp: Math.max((_snapshot && _snapshot.maxSeenDeviceTimestamp) || 0, now) };
  if (typeof raw.rcActive === 'boolean') out.rcActive = raw.rcActive;
  if (typeof raw.rcCancelledButPaid === 'boolean') out.rcCancelledButPaid = raw.rcCancelledButPaid;
  if (isValidTs(raw.expiresAt)) out.expiresAt = raw.expiresAt;
  return out;
}
async function saveEntitlement(snap) { try { await AsyncStorage.setItem(STORAGE_KEYS.ENTITLEMENT, JSON.stringify(snap)); } catch (e) {} }

export async function refreshEntitlement() {          // conservador; NUNCA lança
  try {
    const now = Date.now();
    const clean = sanitize(await fetchEntitlement(), now);
    if (clean) { _snapshot = clean; await saveEntitlement(clean); }   // null/erro → mantém _snapshot (não promove)
  } catch (e) { /* mantém _snapshot */ }
  return getEntitlementPlan();
}

let _appStateSub = null;
export function initEntitlement() {                   // boot: fire-and-forget
  loadEntitlement();
  try { if (!_appStateSub) _appStateSub = AppState.addEventListener('change', (s) => { if (s === 'active') refreshEntitlement(); }); } catch (e) {}
}
```
`getEntitlementSnapshot`/`getEntitlementDecision`/`getEntitlementPlan`/`loadEntitlement` (2B.7.2) inalterados. `now`/`lastValidatedAt` preferem `serverNow` da fonte; sem ele, `Date.now()` local (limitação declarada — RevenueCat trará timestamp de servidor em 2B.7.4).

## Decisão — `App.js` (ponto de atenção)
**Recomendado: 1 linha `initEntitlement()`** no `useEffect` de boot existente ([App.js:38-44](../../App.js#L38)), junto de `loadCreatorQaMode()`:
```
preloadCriticalAssets(); loadCreatorQaMode(); initEntitlement(); runLocalMigrations().catch(...);
```
Fire-and-forget → **não bloqueia** (o `if (!fontsLoaded)` `ActivityIndicator` é só das fontes, inalterado); **sem render/navegação/loading novo**.
**Por que não a alternativa lazy:** auto-init na 1ª leitura registraria o `AppState` listener num ponto imprevisível e misturaria I/O com a leitura síncrona `getEntitlementSnapshot`. A 1 linha no boot é explícita e controlada. **O smoke prova que `App.js` só ganha `initEntitlement()`** (sem `useState`/spinner de entitlement).

## Smoke (checks 2B.7.3)
1. **Port:** `entitlementSource.fetchEntitlement()` é async, stub → `null`, não lança.
2. **Pipeline (service isolado + fonte mockada):** mock `{ rcActive:true, expiresAt: T+DAY, serverNow: T }` → `refreshEntitlement()` → `getEntitlementPlan()==='premium'` (persistiu snapshot sanitizado); mock `null` → `free`; mock que **lança** → `free` (nunca propaga); mock `{ plan:'premium' }` solto → sanitize descarta → `free`.
3. **saveEntitlement sanitiza:** o objeto persistido contém só campos do contrato (sem `plan`/estranhos).
4. **fail-closed no boot:** `getEntitlementPlan()` default (sem load/refresh) === `free`.
5. **Boot sem loading novo:** `App.js` adiciona só `initEntitlement()`; sem `useState`/`ActivityIndicator` ligado a entitlement.
6. **Isolamento:** `entitlementPolicy` só por `entitlementService`; `entitlementSource` só por `entitlementService`; nenhuma tela consome entitlement.
7. **Intocados:** `accessControl`/`entitlementPolicy` inalterados; sem dependência (`package.json`); `app.json` sem `assetBundlePatterns` (2C).

## Device (fumaça)
App abre normal (boot fire-and-forget); Modo Criador on/off idêntico; nenhuma história premium nova (stub → free); background→active não muda nada (stub); sem loading/tela nova.

## Tasks (após Portão 3)
- **T1** — `entitlementSource.js` (port + stub).
- **T2** — `entitlementService.js`: `sanitize`+`saveEntitlement`+`refreshEntitlement`+`initEntitlement`+AppState (import `isValidTs`).
- **T3** — `App.js`: 1 linha `initEntitlement()` no boot.
- **T4** — `smoke.js`: 7 checks 2B.7.3.
- **T5** — gates (`smoke`/`doctor`/grep telas/`package.json`) + device fumaça + relatório PT-BR.

## Invariantes
Telas, navegação, UI, paywall, packs, `contentResolver`, `ProgressContext`, `accessControl`, `entitlementPolicy`, `app.json`, `assetBundlePatterns`, requires, assets — **intocados**. **Sem dependência nova.** `App.js` só ganha 1 linha fire-and-forget. **2C não iniciada.** Se algo exigir tocar tela/dependência → PARA e volta ao portão.

## Analyze (consistência spec↔plan)
RP1→T1; RP2/RP4/RP5→T2 (sanitize/refresh/persist); RP3→T3 (boot); RP6→T2 (AppState); RP7/RP8→policy+try/catch; provas→T4/T5. `App.js` limitado a 1 linha, provado sem visual. Fonte stub → free (comportamento preservado); pipeline provado por mock. **CONSISTENTE.**
