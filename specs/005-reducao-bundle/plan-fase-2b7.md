# Plan — Bloco 2 · Fase 2B.7 · Entitlement real e validade offline

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7 · **Etapa SDD:** 4 (Plan) · **Portão Humano 2: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `0d2cee8` · Spec: [spec-fase-2b7.md](./spec-fase-2b7.md) · Clarify: [clarify-fase-2b7.md](./clarify-fase-2b7.md).
> **APENAS arquitetura futura e contratos. NENHUM código nesta fase.** Sem RevenueCat, sem 2C, sem `git`.

## Princípio arquitetural
Separar **decisão pura** (política, testável) de **casca com I/O** (persistência + rede + RevenueCat), espelhando padrões já aprovados no projeto: **`packReconcileService`** (núcleo puro) + **`creatorQaMode`** (estado em memória, `load` no boot, `subscribe`). `getCurrentPlan()` continua **síncrono**, lendo o estado em memória.

## Componentes futuros (a criar na implementação — NÃO agora)
1. **`entitlementPolicy.js` (PURO):** decisão sem I/O — recebe o estado + `now` e retorna `{ plan, status }`. Testável direto pelo smoke (como `storyJourneyService`/`packReconcileService`).
2. **`entitlementService.js` (casca):** estado em memória; `loadEntitlement()` no boot; `getEntitlementPlan()` síncrono; `subscribe()`; `refresh()` (consulta RevenueCat, atualiza + persiste); ganchos de `AppState`/rede/compra. Padrão `creatorQaMode`.
3. **`accessControl.getCurrentPlan()`:** passa a delegar a `entitlementService.getEntitlementPlan()` (em memória) — **em vez** de retornar `'free'`. Único ponto que muda; consumidores intactos.
4. **`App.js` (boot):** `loadEntitlement()` **antes** de liberar navegação premium (molde do `loadCreatorQaMode` atual, [App.js:38-40](../../App.js#L38)).
5. **RevenueCat** (`react-native-purchases`) + possivelmente NetInfo: **dependências novas** (aprovação própria; **config plugin + Dev Client/EAS**, não Expo Go). Futuro.

## Contrato 1 — Persistência (`@ptf_entitlement_v1`)
```
{
  plan:                   'premium' | 'free',
  status:                 'active' | 'cancelled_active' | 'expired' | 'needs_revalidation' | 'unknown',
  expiresAt:              number | null,   // do servidor (CustomerInfo)
  lastValidatedAt:        number | null,   // última validação online confiável
  maxSeenDeviceTimestamp: number           // atualizado a cada leitura: max(prev, now)
}
```
Chave **nova, versionada** — sem reuso de `@ptf_plan_state_v1`. Constante `OFFLINE_MAX_WINDOW_DAYS = 7`.

## Contrato 2 — Decisão pura (`entitlementPolicy`)
```
decideEntitlement({
  loaded, now, expiresAt, lastValidatedAt, maxSeenDeviceTimestamp, rcActive, rcCancelledButPaid
}) → { plan, status }
```
**Ordem de decisão (conservadora — bloqueio ganha do acesso):**
1. `!loaded` → `{ free, 'unknown' }` (default seguro; sem cache nunca é premium — RP4).
2. `now < maxSeenDeviceTimestamp` (relógio retrocedeu) → `{ free, 'needs_revalidation' }` (RP6).
3. `expiresAt != null && now > expiresAt` → `{ free, 'expired' }` (RP5, mesmo offline).
4. `lastValidatedAt != null && (now - lastValidatedAt) > 7 dias` → `{ free, 'needs_revalidation' }` (RP6, janela).
5. `rcActive` → `{ premium, 'active' }`; `rcCancelledButPaid && expiresAt futuro` → `{ premium, 'cancelled_active' }` (RP3).
6. senão → `{ free, 'expired' }`.
Pura, determinística, sem I/O — o smoke exercita todos os ramos.

## Contrato 3 — Revalidação (RP8)
| Gatilho | Ação |
|---|---|
| **Boot** (`App.js`) | `loadEntitlement()` (cache → decisão provisória, se RP4 permitir) → `refresh()` se houver rede |
| **Foco do app** (`AppState 'active'`) | `refresh()` |
| **Retorno da internet** (NetInfo online) | `refresh()` |
| **Compra / restore** | callback RevenueCat → atualiza `expiresAt`/`lastValidatedAt`/`maxSeen` + persiste |
`refresh()` bem-sucedido grava `lastValidatedAt = now (confiável)` e `maxSeenDeviceTimestamp = max(prev, now)`. Timestamp preferencialmente do servidor/resposta de compra; sem fonte confiável → **limitação declarada + bloqueio conservador** (RP6).

## Contrato 4 — Consumo (INALTERADO)
`getCurrentPlan()` → `entitlementService.getEntitlementPlan()` (síncrono). `isPremiumUser = getCurrentPlan()==='premium' || isCreatorQaModeEnabled()`. `hasStoryAccess`/`canOpenStoryFullExperience` e **toda a 2B.6** (gate/foco/parada de mídia) seguem lendo `isPremiumUser` → **zero mudança de consumidor**.

## Invariantes preservados
Resolver **agnóstico**; `ProgressContext`; telas da 2B.6; `app.json`; `assetBundlePatterns`; requires premium; assets — **todos intocados**. Modo Criador só dev (RP7). Pack no disco nunca autoriza (RP9).

## Faseamento futuro sugerido (cada um = ciclo SDD próprio, com aprovação)
- **2B.7-impl.1:** `entitlementPolicy` puro + smoke (todos os ramos) — **sem** RevenueCat (fonte local/mock injetada).
- **2B.7-impl.2:** `entitlementService` (persistência `@ptf_entitlement_v1` + AppState/NetInfo + boot em `App.js`) + `getCurrentPlan` delega.
- **2B.7-impl.3:** integração `react-native-purchases` (SDK, compra/restore, config plugin, Dev Client/EAS) — dependência com aprovação própria.

## Portões de qualidade (da futura implementação)
`npm run smoke` (ramos da `entitlementPolicy` + guard Modo Criador); `expo-doctor`; device (assinar → cancelar → expirar → offline → adiantar/atrasar relógio → janela 7d → bloqueio). Relatórios PT-BR.

## Paradas obrigatórias (esta fase)
Não implementar RevenueCat/backend/cripto; não alterar runtime/`app.json`/`assetBundlePatterns`/requires/assets; não iniciar 2C; não `git`. **PARAR no Plan.**

## Analyze (consistência spec↔plan)
Cada RP tem contrato correspondente (RP2→Contrato 4; RP3/5/6→Contrato 2; RP4→ordem 1; RP8→Contrato 3; RP7/9→invariantes). Janela 7d e chave `@ptf_entitlement_v1` fixadas. Decisão pura testável; consumidores intactos → 2B.6 preservada; 2C segue bloqueada. **CONSISTENTE.**
