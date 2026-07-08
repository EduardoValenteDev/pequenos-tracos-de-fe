# Tasks — Bloco 2 · Fase 2B.7.3 · Fonte real de entitlement

> **Etapa SDD 5.** Micro-tasks atômicas. Implementação **só após o Portão 3**.
> **Arquivos:** `entitlementSource.js` (novo), `entitlementService.js`, `App.js` (1 linha), `scripts/smoke.js`. **Nenhuma tela/dependência/RevenueCat.**

## Grupo A — `entitlementSource` (port + stub)
- **A1** — Criar `src/services/entitlementSource.js`: `export async function fetchEntitlement()` → `Promise<{rcActive,rcCancelledButPaid,expiresAt,serverNow?}|null>`. **Stub desta fase: `return null`** (sem entitlement → free). **NUNCA lança** (erro interno futuro → `null`). Documenta o contrato p/ o adapter RevenueCat (2B.7.4). Sem imports de dependência.

## Grupo B — `entitlementService` (fonte + persistência + boot + refresh)
- **B1** — `import { decideEntitlement, isValidTs } from './entitlementPolicy'` (segue o único consumidor da policy) + `import { fetchEntitlement } from './entitlementSource'` + `import { AppState } from 'react-native'`.
- **B2** — `sanitize(raw, now)` (**pontos 6/7**): retorna `null` se `raw` não-objeto; senão `{ loaded:true, lastValidatedAt:(isValidTs(raw.serverNow)?raw.serverNow:now), maxSeenDeviceTimestamp:max(prev,now) }` **+** só copia `rcActive`/`rcCancelledButPaid` se `boolean` e `expiresAt` se `isValidTs`. **Descarta** qualquer outro campo (ex.: `plan`).
- **B3** — `saveEntitlement(snap)` async, try/catch (nunca lança): `AsyncStorage.setItem(ENTITLEMENT, JSON.stringify(snap))`. **Só é chamado com `snap` sanitizado** (B4).
- **B4** — `refreshEntitlement()` async, **try/catch — NUNCA lança** (**ponto 13**): `now=Date.now()`; `clean=sanitize(await fetchEntitlement(), now)`; se `clean` → `_snapshot=clean` + `saveEntitlement(clean)`; se `null`/erro → **mantém `_snapshot`** (não promove). Retorna `getEntitlementPlan()`.
- **B5** — `initEntitlement()` (**ponto 2/12**): try/catch — nunca lança; `loadEntitlement().catch(()=>{})` (fire-and-forget); **guard** `if (!_appStateSub)` antes de `AppState.addEventListener('change', s => { if (s==='active') refreshEntitlement().catch(()=>{}); })` (**ponto 14: registra 1×**).
- **B6** — `stopEntitlementAutoRefresh()` (**ponto 15**): try/catch; `_appStateSub?.remove?.()`; `_appStateSub=null`. Cleanup seguro disponível (não requerido no root, que vive com o app).

## Grupo C — `App.js` (1 linha)
- **C1** — Adicionar `import { initEntitlement } from './src/services/entitlementService'` + a chamada **`initEntitlement();`** dentro do `useEffect([])` de boot existente (junto de `loadCreatorQaMode()`). **Só isso.** Sem `useState`, sem `ActivityIndicator`, sem navegação/render/loading novo (**pontos 3-8 do bloco App.js**).

## Grupo D — smoke (pipeline + 20 pontos)
Carregar `entitlementService` isolado injetando `decideEntitlement`+`isValidTs` (policy real), `fetchEntitlement` (mock variável), `AsyncStorage` (mock get/set capturando o salvo), `AppState` (mock com spy addEventListener/remove). `NOW=Date.now()`, `DAY`.
- **D1 (port):** `fetchEntitlement()` stub → `null`, async, não lança.
- **D2 (pipeline/refresh):** fonte `{rcActive:true,expiresAt:NOW+DAY,serverNow:NOW}` → `refreshEntitlement()`→`premium` + salvou; fonte `null`→`free`; fonte que **lança**→`free`; fonte `{plan:'premium'}` solto→`free` (**pontos 8,9,13**).
- **D3 (persistência sanitizada):** após refresh válido, o objeto salvo (capturado no setItem mock) **não** tem `plan`/estranhos; só campos do contrato (**pontos 5,6,7**).
- **D4 (cache antigo + policy + janela):** `load` `{rcActive:true,expiresAt:NOW-DAY}`→`free` (expired); `{rcActive:true,expiresAt:NOW+DAY,lastValidatedAt:NOW-DAY,maxSeen:NOW}`→`premium`; `{rcActive:true,expiresAt:NOW+DAY,lastValidatedAt:NOW-8*DAY,...}`→`free` (stale) (**ponto 10**).
- **D5 (relógio):** `load` `{rcActive:true,expiresAt:NOW+365*DAY,lastValidatedAt:NOW,maxSeenDeviceTimestamp:NOW+365*DAY}`→`free` (clock_rollback) (**ponto 11**).
- **D6 (AppState guard+cleanup+não lança):** `initEntitlement()` 2× → `spy.count===1` (**14**); `spy.cb('active')` → refresh disparado; `stopEntitlementAutoRefresh()` → `spy.removed===true` (**15**); `init`/`refresh` nunca lançam (**12,13**).
- **D7 (boot sem loading + App.js 1 linha):** `App.js` contém `initEntitlement()` + import; **não** adiciona `useState`/`ActivityIndicator` ligado a entitlement (**16**).
- **D8 (intocados):** `accessControl`/`entitlementPolicy` sem diff de comportamento; nenhuma `src/screens` consome entitlement (**17**); `package.json`/lock sem dep nova (**20**); nenhum `react-native-purchases`/`Purchases`/`NetInfo` no repo runtime (**19**); `app.json` sem `assetBundlePatterns` (**18**); `entitlementPolicy` só por `entitlementService`; `entitlementSource` só por `entitlementService`.

## Grupo E — gates + device + relatório
- **E1** — `npm run smoke` verde + `npx expo-doctor` 18/18.
- **E2** — grep: isolamento (policy/source só por service); telas/App.js sem consumo indevido; sem dep; `app.json` intacto.
- **E3** — Device fumaça: app abre (boot fire-and-forget); Modo Criador on/off idêntico; background→active não muda nada (stub→free); sem loading/tela nova.
- **E4** — Relatório PT-BR (arquivos, diff App.js, fluxos boot/refresh/persist, casos smoke, provas). Sem `git add`/commit/push.

## Rastreabilidade (ponto obrigatório → task)
1→A1 · 2→B5 · 3→B4 · 4→B5/loadEntitlement(boot) · 5→B3/B4 · 6→B2 · 7→B2 · 8→B2/D2 · 9→B4/D2/D4 · 10→D4 · 11→D5 · 12→B5/D6 · 13→B4/D6 · 14→B5/D6 · 15→B6/D6 · 16→C1/D7 · 17→D8 · 18→D8 · 19→D8 · 20→D8.
