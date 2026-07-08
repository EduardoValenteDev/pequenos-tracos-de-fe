# Tasks — Bloco 2 · Fase 2B.7.1 · Entitlement policy puro

> **Etapa SDD 5.** Micro-tasks atômicas. Implementação **só após o Portão 3**.
> **Único arquivo novo:** `src/services/entitlementPolicy.js` (puro). **Único arquivo tocado além dele:** `scripts/smoke.js` (bloco de teste). **Nenhum consumidor.**
> **Guardas:** sem dependência; sem consumo (App.js/telas/accessControl/ProgressContext/resolver/app.json intocados); sem 2C; sem `git`.

## Grupo A — Módulo puro
- **A1** — Criar `src/services/entitlementPolicy.js`: cabeçalho declarando **PURO** (sem I/O, React, storage, imports; nunca lança; `now` injetado). Constante `OFFLINE_MAX_WINDOW_MS = 7 * 24 * 60 * 60 * 1000`.
- **A2** — Helper `isValidTs(t)` = `typeof t === 'number' && Number.isFinite(t) && t > 0` (trata NaN, negativos, `0`, `null`, `undefined`, não-numéricos).
- **A3** — Helper `hasValidWindow(s)` = `isValidTs(s.expiresAt) && s.now < s.expiresAt && isValidTs(s.lastValidatedAt) && (s.now - s.lastValidatedAt) <= OFFLINE_MAX_WINDOW_MS`.
- **A4** — `export function decideEntitlement(snapshot) → { decision, reason }`, avaliação **top-down** (RF4), com `snapshot` possivelmente ausente/parcial → tratado com defaults seguros (`!loaded` e `!isValidTs(now)` cobrem entrada malformada). **Ordem (bloqueios antes de liberações):**
  1. `!snapshot || snapshot.loaded !== true` → `{ free, no_cache }`
  2. `!isValidTs(now)` → `{ free, invalid_data }`  ← **`now` validado ANTES de qualquer aritmética**
  3. `isValidTs(maxSeenDeviceTimestamp) && now < maxSeenDeviceTimestamp` → `{ needs_revalidation, clock_rollback }`
  4. `isValidTs(expiresAt) && now >= expiresAt` → `{ free, expired }`
  5. `isValidTs(lastValidatedAt) && (now - lastValidatedAt) > OFFLINE_MAX_WINDOW_MS` → `{ needs_revalidation, stale_validation }`
  6. `rcActive === true && hasValidWindow` → `{ premium, active }`
  7. `rcActive === true` → `{ needs_revalidation, needs_revalidation }`
  8. `rcCancelledButPaid === true && hasValidWindow` → `{ premium, cancelled_active }`
  9. `rcCancelledButPaid === true` → `{ needs_revalidation, needs_revalidation }`
  10. senão → `{ free, inactive }`

## Grupo B — Smoke (15 casos + reforço do `now`)
- **B1** — Bloco "── Fase 2B.7.1 ──": carregar `entitlementPolicy.js` isolado via `new Function` (strip de `export`, retornar `{ decideEntitlement }`) — como `storyJourneyService`. Constantes locais `DAY`/`WINDOW`/`T`.
- **B2** — Um `check()` por caso da matriz (1–15 do plan), asserindo **decision + reason**.
- **B3** — **Reforço `now` inválido (expande o caso #14):** um `check()` que varre **todas** as variantes de `now` inválido — `NaN`, `-1` (negativo), `0`, `null`, `undefined`, `'abc'` (não-numérico) — cada uma com `{ loaded:true, now:<inválido>, expiresAt:T+DAY, lastValidatedAt:T-DAY, rcActive:true }` → **todas** devem retornar `{ free, invalid_data }` **sem lançar** (envolver em `try/catch` que falha o check se lançar).
- **B4** — Check de **totalidade**: `decision` sempre ∈ {`premium`,`free`,`needs_revalidation`} e `reason` sempre string não-vazia para os 15+ snapshots.

## Grupo C — Gates + isolamento + relatório
- **C1** — `npm run smoke` verde (1835 + novos) + `npx expo-doctor` verde.
- **C2** — **Isolamento:** grep provando que **nenhum** arquivo importa `entitlementPolicy` (`grep -rn "entitlementPolicy" src/` só acha o próprio arquivo); confirmar `accessControl`/`App.js`/telas/`ProgressContext`/resolver/`app.json`/assets/requires **intocados** (`git status`).
- **C3** — Relatório PT-BR (arquivos, matriz, 15+ casos, isolamento). **Sem** `git add`/commit/push sem aprovação.

## Rastreabilidade (RF → Task → caso)
RF1→A1; `isValidTs`→A2 (+B3); `hasValidWindow`→A3; matriz RF4→A4 (casos 1-15/B2); regras duras RF5→casos 4/7/10/11/13/14; `now` validado→A4.2+B3; isolamento RF6→C2.
