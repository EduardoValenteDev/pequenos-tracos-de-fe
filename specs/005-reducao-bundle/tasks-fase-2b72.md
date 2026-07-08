# Tasks — Bloco 2 · Fase 2B.7.2 · Consumo controlado do entitlement

> **Etapa SDD 5.** Micro-tasks atômicas. Implementação **só após o Portão 3**.
> **Arquivos:** `storageKeys.js`, `entitlementService.js` (novo), `accessControl.js`, `scripts/smoke.js`. **`App.js` NÃO** (evitado). **Nenhuma tela.**
> **Guardas:** sem RevenueCat/compra/revalidação; sem dependência; sem tela/UI/paywall/navegação; sem 2C; sem `git`.

## Grupo A — storageKeys
- **A1** — Adicionar `ENTITLEMENT: '@ptf_entitlement_v1'` a `STORAGE_KEYS`. **Só registro** (chave nova versionada; sem reuso de `@ptf_plan_state_v1`). Nenhuma leitura de runtime nesta fase.

## Grupo B — entitlementService (casca; único consumidor da policy)
- **B1** — `let _snapshot = { loaded: false };` (memória; **default seguro**).
- **B2** — `getEntitlementSnapshot()` síncrono → `{ ..._snapshot, now: Date.now() }` — `now` gerado **on-demand** (ponto 6: nunca congelado perigosamente).
- **B3** — `getEntitlementDecision()` = `decideEntitlement(getEntitlementSnapshot())` — **único ponto que importa `entitlementPolicy`** (RP7).
- **B4** — `getEntitlementPlan()` = `getEntitlementDecision().decision === 'premium' ? 'premium' : 'free'` (ponto 4: `needs_revalidation` → `free`).
- **B5** — `loadEntitlement()` async, **try/catch, NUNCA lança para fora** (ponto 2): storage vazio/`null`/JSON inválido → `_snapshot = { loaded:false }`; JSON válido → `_snapshot = { ...parsed, loaded:true }` (a policy decide; **nunca premium sem `hasValidWindow`** — ponto 3/5). **NÃO chamado no boot** nesta fase (App.js evitado → ponto 1 trivial). Nenhum campo salvo (ex.: `plan`) é lido diretamente: só a policy decide (ponto 5).

## Grupo C — accessControl delega
- **C1** — `getCurrentPlan()`: `if (ENABLE_LOCAL_PREMIUM_TEST_MODE) { console.warn(...); return 'premium'; }` (ponto 7: **test-mode precedência explícita**) → senão `return entitlementService.getEntitlementPlan();`. Importa `entitlementService` (não a policy). `hasPremiumAccess`/`isPremiumUser`/`hasStoryAccess`/`canOpenStoryFullExperience` **inalterados**.

## Grupo D — smoke (delegação + fallback conservador + isolamento)
- **D1 — Migração fiel do [1840]:** de "nenhum módulo de `src/` consome `entitlementPolicy`" → **"apenas `entitlementService` importa `entitlementPolicy`"** (nenhuma tela/`accessControl` importa a policy direto).
- **D2 — Delegação:** `getCurrentPlan` chama `entitlementService.getEntitlementPlan()` (não retorna `'free'` literal solto após o test-mode); o service chama `decideEntitlement`.
- **D3 — Fallback conservador (loadEntitlement isolado, AsyncStorage mockado + policy real):**
  - storage **vazio** (`null`) → `getEntitlementPlan()==='free'`;
  - storage **inválido** (JSON quebrado) → `'free'`, **sem lançar** (try/catch falha o check se lançar);
  - storage **malformado** (`{ rcActive:true }` sem `expiresAt`/`lastValidatedAt`) → decideEntitlement `needs_revalidation` → `'free'`;
  - storage com **`plan:'premium'` solto** (sem `rcActive`/janela) → policy ignora → `'free'` (ponto 5).
- **D4 — Preservado:** `accessControl` mantém `ENABLE_LOCAL_PREMIUM_TEST_MODE` + `isPremiumUser = ... || isCreatorQaModeEnabled()`.
- **D5 — Policy intacta:** `entitlementPolicy.js` inalterado (bloco 2B.7.1 segue verde: 15 casos).
- **D6 — Telas/UI intocadas:** nenhum `src/screens/*.js` importa `entitlementService`/`entitlementPolicy`; `App.js` intocado.
- **D7 — Chave:** `storageKeys` tem `ENTITLEMENT='@ptf_entitlement_v1'`.
- **D8 — 2C:** `app.json` sem `assetBundlePatterns`; requires premium intactos.

## Grupo E — gates + device + relatório
- **E1** — `npm run smoke` verde + `npx expo-doctor` 18/18.
- **E2** — grep: só `entitlementService` consome a policy; nenhuma tela consome service/policy; `App.js`/`app.json`/requires intactos (`git status`).
- **E3** — Device **fumaça** (não é validação de produto): app abre normal; Modo Criador **on** libera premium igual, **off** bloqueia igual; nenhuma história premium nova; mapa/histórias/perfil/downloads idênticos.
- **E4** — Relatório PT-BR (arquivos, fluxo getCurrentPlan, contrato service, casos smoke, provas). Sem `git add`/commit/push sem aprovação.

## Rastreabilidade (ponto obrigatório → task)
1 (não bloqueia boot)→B5/App.js-evitado · 2 (não lança)→B5/D3 · 3 (fallback conservador)→B5/D3 · 4 (needs_revalidation→free)→B4/D3 · 5 (nada salvo libera sem policy)→B3/B5/D3 · 6 (now on-demand)→B2 · 7 (test-mode precedência)→C1/D4 · 8 (nada de tela/UI)→D6/E2 · 9 (parar se exigir tela)→escopo.
