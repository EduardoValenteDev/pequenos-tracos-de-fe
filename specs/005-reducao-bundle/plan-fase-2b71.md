# Plan — Bloco 2 · Fase 2B.7.1 · Entitlement policy puro

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7.1 · **Etapa SDD:** 4 (Plan) · **Portão Humano 2: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `964ad52` · Spec: [spec-fase-2b71.md](./spec-fase-2b71.md) · Clarify: [clarify-fase-2b71.md](./clarify-fase-2b71.md).
> **PARA no Plan.** Nenhum código antes do Portão 3. Sem RevenueCat, sem dependência, sem consumo, sem 2C, sem `git`.

## Escopo da implementação futura (após Portão 3)
Um único arquivo novo `src/services/entitlementPolicy.js` (**puro**) + um bloco de smoke. **Nada mais.** Não consumido por ninguém (como `contentManifest` foi introduzido).

## Contrato do módulo (futuro)
```
// sem imports; nunca lança; now injetado
const OFFLINE_MAX_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
function isValidTs(t) { return typeof t === 'number' && Number.isFinite(t) && t > 0; }
function hasValidWindow(s) {
  return isValidTs(s.expiresAt) && s.now < s.expiresAt
      && isValidTs(s.lastValidatedAt) && (s.now - s.lastValidatedAt) <= OFFLINE_MAX_WINDOW_MS;
}
export function decideEntitlement(snapshot) → { decision, reason }  // avaliação top-down da matriz RF4
```
Ordem (conservadora): `!loaded`→free/no_cache · `!isValidTs(now)`→free/invalid_data · retrocesso→needs_revalidation/clock_rollback · `now>=expiresAt`→free/expired · janela>7d→needs_revalidation/stale_validation · `rcActive && hasValidWindow`→premium/active · `rcActive`→needs_revalidation · `rcCancelledButPaid && hasValidWindow`→premium/cancelled_active · `rcCancelledButPaid`→needs_revalidation · senão→free/inactive.

## Casos de smoke da matriz (15 — bordas incluídas)
Constantes: `DAY = 86_400_000`, `WINDOW = 7*DAY`, `T` = base `now`. Snapshot omite campos irrelevantes (default seguro).

| # | Caso | Snapshot (relativo a `T`) | decision | reason | Linha |
|---|---|---|---|---|---|
| 1 | sem cache | `{loaded:false, now:T}` | free | no_cache | L1 |
| 2 | relógio retrocedido | `{loaded, now:T, maxSeen:T+DAY, expiresAt:T+DAY, lastValidatedAt:T-DAY, rcActive:true}` | needs_revalidation | clock_rollback | L3 |
| 3 | `now < expiresAt` (feliz) | `{loaded, now:T, expiresAt:T+DAY, lastValidatedAt:T-DAY, maxSeen:T, rcActive:true}` | premium | active | L6 |
| 4 | `now === expiresAt` | `{loaded, now:T, expiresAt:T, lastValidatedAt:T-DAY, maxSeen:T, rcActive:true}` | free | expired | L4 (`>=`) |
| 5 | `now > expiresAt` | `{loaded, now:T, expiresAt:T-1, lastValidatedAt:T-DAY, maxSeen:T, rcActive:true}` | free | expired | L4 |
| 6 | janela < 7d | `{loaded, now:T, expiresAt:T+DAY, lastValidatedAt:T-DAY, maxSeen:T, rcActive:true}` | premium | active | L6 |
| 7 | janela === 7d | `{loaded, now:T, expiresAt:T+DAY, lastValidatedAt:T-WINDOW, maxSeen:T, rcActive:true}` | premium | active | L6 (`>`; `<=` no window) |
| 8 | janela > 7d | `{loaded, now:T, expiresAt:T+DAY, lastValidatedAt:T-WINDOW-1, maxSeen:T, rcActive:true}` | needs_revalidation | stale_validation | L5 |
| 9 | `rcActive` válido | `{loaded, now:T, expiresAt:T+2*DAY, lastValidatedAt:T-2*DAY, maxSeen:T, rcActive:true}` | premium | active | L6 |
| 10 | `rcActive` sem `expiresAt` | `{loaded, now:T, expiresAt:null, lastValidatedAt:T-DAY, maxSeen:T, rcActive:true}` | needs_revalidation | needs_revalidation | L7 |
| 11 | `rcActive` sem `lastValidatedAt` | `{loaded, now:T, expiresAt:T+DAY, lastValidatedAt:null, maxSeen:T, rcActive:true}` | needs_revalidation | needs_revalidation | L7 |
| 12 | `rcCancelledButPaid` futuro | `{loaded, now:T, expiresAt:T+DAY, lastValidatedAt:T-DAY, maxSeen:T, rcCancelledButPaid:true}` | premium | cancelled_active | L8 |
| 13 | `rcCancelledButPaid` vencido | `{loaded, now:T, expiresAt:T-DAY, lastValidatedAt:T-DAY, maxSeen:T, rcCancelledButPaid:true}` | free | expired | L4 (bloqueio antes) |
| 14 | timestamps inválidos | `{loaded, now:NaN, expiresAt:T+DAY, lastValidatedAt:T-DAY, rcActive:true}` (+ variante `now:-1`) | free | invalid_data | L2 |
| 15 | inativo | `{loaded, now:T, expiresAt:T+DAY, lastValidatedAt:T-DAY, maxSeen:T, rcActive:false, rcCancelledButPaid:false}` | free | inactive | L10 |

Notas de borda: caso **4** prova `>=` (instante exato bloqueia); caso **7** prova `>` na janela (limite exato passa); casos **10/11** provam "premium exige validade completa" (booleano solto → needs_revalidation); caso **13** prova que o bloqueio de expiração vem **antes** da liberação por cancelamento; caso **14** prova robustez a dado inválido sem lançar.

## Como o smoke testará (futuro)
Avaliar `entitlementPolicy.js` **isolado** via `new Function` (mesma técnica de `storyJourneyService`/`packReconcileService` no smoke): strip de `export`, retornar `{ decideEntitlement }`, e um `check()` por caso da tabela (decision + reason). Sem mock de storage/rede (função pura).

## Tasks (após Portão 3)
- **T1** — `src/services/entitlementPolicy.js`: `OFFLINE_MAX_WINDOW_MS`, `isValidTs`, `hasValidWindow`, `decideEntitlement` (matriz RF4, top-down). Puro, sem imports, nunca lança.
- **T2** — smoke: bloco "Fase 2B.7.1" avaliando a policy isolada + os 15 casos.
- **T3** — gates (`smoke`/`doctor`) + confirmar **isolamento** (nenhum arquivo importa `entitlementPolicy`; `accessControl`/`App.js`/telas intocados) + relatório PT-BR.

## Invariantes
`accessControl`, `App.js`, telas, resolver, `ProgressContext`, `app.json`, `assetBundlePatterns`, requires premium, assets — **intocados**. **Nenhuma dependência nova.** Policy **não consumida** nesta fase. 2C **não** iniciada.

## Portões de qualidade (da futura implementação)
`npm run smoke` (15 casos + demais 1835) verde; `npx expo-doctor` verde; grep provando que nada importa `entitlementPolicy`; relatório PT-BR.

## Analyze (consistência spec↔plan)
Cada linha da matriz RF4 tem ≥1 caso de smoke; as 4 bordas críticas (`>=` expiração, `>` janela, dados ausentes, inválidos) têm caso dedicado (4, 7, 10/11, 14). Ordem conservadora (bloqueios antes de liberações) refletida na sequência top-down. Módulo puro e isolado → consumidores intocados → 2B.6/2B.7 preservadas. **CONSISTENTE.**
