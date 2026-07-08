# Bloco 2 · Fase 2B.7.1 · Entitlement policy puro

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7.1 (= `impl.1` do faseamento da 2B.7) · **Etapa SDD:** 1 (Specify) · **Portão Humano 1: APROVADO com ajustes por Eduardo (2026-07-07).**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `964ad52`.
> **Natureza:** função **pura** de decisão. **Sem** implementar; **sem** RevenueCat; **sem** dependência; **sem** consumo (accessControl intocado); **sem** 2C.

## Objetivo
Transformar a política da 2B.7 em uma **função pura, testável e sem dependências** — a matriz de decisão de entitlement isolada — antes de qualquer service, RevenueCat ou consumo. É a menor unidade: só a **decisão conservadora**.

## Diagnóstico (padrão do projeto)
Precedentes de função pura de decisão consumida como fonte única e testada direto pelo smoke: `packReconcileService` ("PURO: SEM FileSystem, SEM AsyncStorage, SEM I/O … só DECISÃO") e `storyJourneyService` ("Puro, sem I/O, sem React, sem storage, sem imports"). Precedente de **módulo puro introduzido antes de ser consumido**: `contentManifest` ("NADA consome este módulo ainda"). A 2B.7.1 segue esse molde.

## Requisitos

**RF1 — Módulo puro (futuro `src/services/entitlementPolicy.js`).** Sem I/O, sem React, sem storage, **sem imports**, **nunca lança**. Determinístico: `now` é sempre **injetado**. Constante do módulo `OFFLINE_MAX_WINDOW_MS = 7 * 24 * 60 * 60 * 1000`. Helper interno `isValidTs(t)` = `typeof t === 'number' && Number.isFinite(t) && t > 0` (trata `NaN`, negativos, não-numéricos, `null`/`undefined`).

**RF2 — Contrato.**
```
decideEntitlement(snapshot) → { decision, reason }
  decision: 'premium' | 'free' | 'needs_revalidation'
  reason:   'no_cache' | 'invalid_data' | 'clock_rollback' | 'expired'
          | 'stale_validation' | 'active' | 'cancelled_active' | 'needs_revalidation' | 'inactive'
```
`reason` **mantido** (útil p/ smoke, diagnóstico e UX futura). `needs_revalidation` é distinto de `free` (permite oferecer "revalidar online"), mas **bloqueia premium** (o `getCurrentPlan()` futuro mapeará `decision !== 'premium'` → `'free'`). **`online` NÃO entra no snapshot** — a policy decide só com o snapshot; revalidação é decisão do service futuro.

**RF3 — Snapshot de entrada.**
```
{
  loaded: boolean,
  now: number,                          // injetado
  expiresAt: number | null,
  lastValidatedAt: number | null,
  maxSeenDeviceTimestamp: number | null,
  rcActive: boolean,                    // CustomerInfo indica entitlement ativo (inclui grace do RevenueCat)
  rcCancelledButPaid: boolean
}
```

**RF4 — Matriz de decisão (CONSERVADORA — bloqueios ANTES de liberações).**
| # | Condição | decision | reason |
|---|---|---|---|
| 1 | `!loaded` (sem cache) | **free** | `no_cache` |
| 2 | `!isValidTs(now)` (relógio/dado inválido) | **free** | `invalid_data` |
| 3 | `isValidTs(maxSeenDeviceTimestamp) && now < maxSeenDeviceTimestamp` (retrocesso) | **needs_revalidation** | `clock_rollback` |
| 4 | `isValidTs(expiresAt) && now >= expiresAt` (expirado, **`>=`**) | **free** | `expired` |
| 5 | `isValidTs(lastValidatedAt) && (now - lastValidatedAt) > OFFLINE_MAX_WINDOW_MS` (janela vencida, **`>`**) | **needs_revalidation** | `stale_validation` |
| 6 | `rcActive === true` **e** `hasValidWindow` | **premium** | `active` |
| 7 | `rcActive === true` **e** `!hasValidWindow` | **needs_revalidation** | `needs_revalidation` |
| 8 | `rcCancelledButPaid === true` **e** `hasValidWindow` | **premium** | `cancelled_active` |
| 9 | `rcCancelledButPaid === true` **e** `!hasValidWindow` | **needs_revalidation** | `needs_revalidation` |
| 10 | senão | **free** | `inactive` |

Onde **`hasValidWindow`** = `isValidTs(expiresAt) && now < expiresAt && isValidTs(lastValidatedAt) && (now - lastValidatedAt) <= OFFLINE_MAX_WINDOW_MS`. A avaliação é **sequencial de cima para baixo** (o primeiro match decide).

**RF5 — Regras duras / conservadoras (ajustes do Portão 1).**
- **Expiração conservadora:** `now >= expiresAt` → `free`/`expired` (no **instante exato** de expiração já bloqueia).
- **Janela offline:** `now - lastValidatedAt > 7 dias` → `needs_revalidation` (no limite **exato** de 7 dias ainda passa; depois bloqueia).
- **Dados ausentes = seguro:** um estado que tenta liberar premium (`rcActive`/`rcCancelledButPaid`) **exige** `expiresAt` válido+futuro **e** `lastValidatedAt` válido+recente (`hasValidWindow`). Sem isso → `needs_revalidation` (nunca premium só por booleano solto sem validade).
- **Números inválidos:** `NaN`/negativos/não-numéricos/`null` tratados por `isValidTs` → decisão conservadora, **sem lançar**.
- **`rcActive`/`rcCancelledButPaid`** só viram premium se **não houver bloqueio anterior** (linhas 2-5) **e** `hasValidWindow`.

**RF6 — Isolamento total.** O módulo **NÃO é consumido por ninguém** nesta fase (como `contentManifest`). **`accessControl`, `App.js`, telas, RevenueCat, `app.json`, `assets`, requires, 2C — intocados.** Nenhuma dependência nova.

**RF7 — Smoke (futuro).** Testa a **matriz completa + bordas** avaliando a função pura direto (via `new Function`, como `storyJourneyService`). Ver os 15 casos no [plan-fase-2b71.md](./plan-fase-2b71.md).

## Fora de escopo
RevenueCat; `entitlementService` (persistência/boot/AppState/rede); consumo em `accessControl`/`getCurrentPlan`; dependência nova; alteração em `App.js`/telas/`app.json`/`assets`/requires; 2C.

## Critérios de aceite (futura implementação)
1. `entitlementPolicy.js` **puro** (sem I/O/React/storage/imports; nunca lança; `now` injetado).
2. `decideEntitlement` cobre as 10 linhas da matriz (RF4) — bloqueios antes de liberações.
3. Regras duras (RF5): `>=` na expiração, `>` na janela, dados ausentes→conservador, números inválidos→sem lançar.
4. `decision` ∈ {`premium`,`free`,`needs_revalidation`}; `needs_revalidation` bloqueia premium.
5. **Nenhum consumidor atual tocado** (módulo isolado, não importado).
6. Sem dependência nova; smoke cobre os 15 casos; `expo-doctor` verde.
