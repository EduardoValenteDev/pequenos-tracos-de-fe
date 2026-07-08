# Bloco 2 · Fase 2B.7.2 · Consumo controlado do entitlement (ligação)

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7.2 (= `impl.2` do faseamento da 2B.7) · **Etapa SDD:** 1 (Specify) · **Portão 1: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `0745932`.
> **Natureza:** LIGAÇÃO controlada (encanamento), **não** expansão de produto. **Sem** RevenueCat; **sem** dependência; **sem** mudança de tela/UI/paywall/navegação; **sem** 2C.

## Objetivo
Preparar o **consumo controlado** da política pura `entitlementPolicy` (2B.7.1), conectando-a ao fluxo real por meio de um novo `entitlementService` e da delegação de `getCurrentPlan`. **Sem alterar acesso visual nem comportamento de telas** — porque, sem uma fonte de compra real (RevenueCat = 2B.7.3), a decisão continua resolvendo `free`, idêntico ao mock atual.

## Diagnóstico (base)
- `getCurrentPlan()` (accessControl:43-48) é **mock**: `'premium'` só sob `ENABLE_LOCAL_PREMIUM_TEST_MODE` (false), senão `'free'`. É o **único ponto de ligação**.
- `isPremiumUser() = getCurrentPlan()==='premium' || isCreatorQaModeEnabled()` — telas consomem via `isPremiumUser`/`hasStoryAccess`/`canOpenStoryFullExperience` (síncronos).
- `entitlementPolicy.decideEntitlement(snapshot)` já existe, puro/testado/isolado. `@ptf_entitlement_v1` **ainda não existe** em `storageKeys`.
- Boot já carrega estado async via `loadCreatorQaMode()` ([App.js:38-40](../../App.js#L38)) — **molde** para `loadEntitlement()`.

## Requisitos

**RP1 — Papel de `entitlementService` (ponto 1).** Novo `src/services/entitlementService.js` — **casca** que mantém o **snapshot de entitlement em memória** (padrão `creatorQaMode`): `getEntitlementSnapshot()` **síncrono**; `loadEntitlement()` no boot (lê `@ptf_entitlement_v1`). **NÃO** integra RevenueCat, **NÃO** faz compra, **NÃO** grava plano premium. Nesta fase **não há fonte de compra** → o snapshot é sempre "sem cache" (`loaded:false`) ou inativo → decisão `free`. Persistência plena, `refresh()`, `subscribe()`, `AppState`/rede e RevenueCat são **2B.7.3**.

**RP2 — `getCurrentPlan` delega (ponto 2).** `getCurrentPlan()` passa a:
```
if (ENABLE_LOCAL_PREMIUM_TEST_MODE) return 'premium';   // override dev, preservado
const { decision } = decideEntitlement(entitlementService.getEntitlementSnapshot());
return decision === 'premium' ? 'premium' : 'free';     // needs_revalidation/free → 'free'
```
`isPremiumUser`/`hasStoryAccess`/`canOpenStoryFullExperience` **inalterados** (só a fonte de `getCurrentPlan` muda).

**RP3 — Snapshot mínimo (ponto 3).** O que `entitlementService.getEntitlementSnapshot()` entrega ao `decideEntitlement` (contrato da 2B.7.1):
```
{ loaded, now, expiresAt, lastValidatedAt, maxSeenDeviceTimestamp, rcActive, rcCancelledButPaid }
```
Nesta fase, sem fonte: `{ loaded:false, now:<Date.now()> }` (demais campos ausentes) → `decideEntitlement` → `free/no_cache`. `now` é lido pelo **service** (casca) e injetado na policy pura.

**RP4 — Compatibilidade durante a transição (ponto 4).** Sem RevenueCat, nada grava `@ptf_entitlement_v1` → snapshot `loaded:false` → `getCurrentPlan()==='free'` — **idêntico ao mock atual**. `ENABLE_LOCAL_PREMIUM_TEST_MODE` (dev) e Modo Criador (via `isPremiumUser` OR) **preservados**. **Zero mudança de comportamento/visual.**

**RP5 — Semântica de `premium`/`free`/`needs_revalidation` (ponto 5).** `getCurrentPlan` mapeia: `premium` → `'premium'`; `free` → `'free'`; **`needs_revalidation` → `'free'`** (bloqueia premium; a UX de "revalidar" fica para 2B.7.3). `isPremiumUser` só é `true` com `getCurrentPlan()==='premium'` (real) **ou** Modo Criador (dev).

**RP6 — Consumidores tocados / intocados (ponto 6).**
| Pode tocar (impl. futura, após portões) | NÃO pode tocar nesta fase |
|---|---|
| `src/services/entitlementService.js` (novo) | telas (mapa, histórias, perfil, progresso, downloads premium) |
| `src/services/accessControl.js` (`getCurrentPlan` delega) | navegação, UI, **paywall visual** |
| `App.js` (boot `loadEntitlement`) | `contentResolver`, `ProgressContext` |
| `src/services/storageKeys.js` (+`ENTITLEMENT`) | `app.json`, `assetBundlePatterns`, requires, assets |
| `scripts/smoke.js` (checks + migração [1840]) | `entitlementPolicy.js` (usado como está) |

**Atenção:** se a implementação futura descobrir que **alguma tela precisa mudar**, a fase **PARA e volta ao portão** — esta é ligação, não expansão. Nenhum premium novo, nenhum paywall visual novo.

**RP7 — Migração do isolamento (necessária).** O check [1840] da 2B.7.1 ("nenhum módulo de `src/` consome `entitlementPolicy`") passa a ser **falso por design** (o `entitlementService` consome). Migração fiel: **"apenas `entitlementService` consome `entitlementPolicy`"** — nenhuma tela/consumidor visual o importa direto.

## Prova de que a 2C não foi iniciada (ponto 7)
`app.json` sem `assetBundlePatterns` (0 ocorrências); requires premium (loaders) intactos; nenhum strip de bundle. Smoke/grep confirmam. Esta fase **não toca** empacotamento.

## Prova de que não houve mudança visual acidental (ponto 8)
- **Smoke:** com snapshot vazio/sem fonte real, `getCurrentPlan()==='free'` (comportamento preservado); `getCurrentPlan` delega a `decideEntitlement` (não retorna `'free'` literal).
- **Telas intocadas:** `git status` não mostra nenhuma tela/navegação/UI; grep confirma que nenhuma tela importa `entitlementService`/`entitlementPolicy`.
- **`isPremiumUser` inalterado** (mesma expressão) → paywall/telas idênticos.
- **Device de fumaça:** app abre normal; Modo Criador on/off funciona igual; nenhuma história premium nova liberada.

## Gates que bloqueiam a fase (ponto 9)
`npm run smoke` verde (delegação + compatibilidade `free` + isolamento migrado + telas intocadas + policy intacta); `npx expo-doctor` verde; grep (telas/UI intocadas; só `entitlementService` consome a policy; `app.json`/requires intactos); **sem dependência nova**; device de fumaça (comportamento idêntico). Relatório PT-BR.

## Fora de escopo
RevenueCat; persistência/gravação de `@ptf_entitlement_v1` por uma fonte real; `refresh()`/`subscribe()`/`AppState`/NetInfo; liberar premium novo; mudar paywall visual; tocar mapa/histórias/perfil/progresso/downloads; 2C; dependência.

## Critérios de aceite
1. `entitlementService` (casca) com `getEntitlementSnapshot()` síncrono + `loadEntitlement()` no boot; sem RevenueCat/compra.
2. `getCurrentPlan` **delega** a `decideEntitlement(snapshot)`; `decision !== 'premium'` → `'free'`.
3. Sem fonte real → `getCurrentPlan()==='free'` (compatibilidade total; Modo Criador/test-mode preservados).
4. `isPremiumUser`/`hasStoryAccess`/`canOpenStoryFullExperience` e todas as telas **inalterados**.
5. `@ptf_entitlement_v1` adicionado a `storageKeys` (chave nova; sem reuso de `@ptf_plan_state_v1`).
6. Isolamento migrado: **só `entitlementService`** consome `entitlementPolicy`; nenhuma tela.
7. `app.json`/`assetBundlePatterns`/requires/assets/resolver/`ProgressContext` intocados; **2C não iniciada**.
8. Smoke verde (+ checks 2B.7.2); `expo-doctor` verde; device de fumaça idêntico; sem dependência.
