# Analyze — Bloco 2 · Fase 2B.7.3 · Fonte real de entitlement

> **Etapa SDD 6.** Consistência spec↔clarify↔plan↔tasks. Entrada: [spec](./spec-fase-2b73.md) · [clarify](./clarify-fase-2b73.md) · [plan](./plan-fase-2b73.md) · [tasks](./tasks-fase-2b73.md) · [checklist](./checklist-fase-2b73.md).

## 1. Os 20 pontos obrigatórios → como são garantidos
| # | Ponto | Garantia | Onde |
|---|---|---|---|
| 1 | Contrato de `entitlementSource` | `fetchEntitlement()→{rcActive,rcCancelledButPaid,expiresAt,serverNow?}|null`; stub `null`; nunca lança | A1 |
| 2 | Contrato de `initEntitlement()` | `loadEntitlement().catch()` + registra AppState (guard); nunca lança; sem retorno visual | B5 |
| 3 | Contrato de `refreshEntitlement()` | try/catch; sanitize→se válido persiste, senão mantém; nunca lança; retorna plano | B4 |
| 4 | Quando lê do storage | **só no boot** via `loadEntitlement()` (1×); `getEntitlementSnapshot` é memória (não lê) | B5/2B.7.2 |
| 5 | Quando salva | **só** em `refreshEntitlement` quando `sanitize` produz snapshot válido (`clean!=null`) | B3/B4 |
| 6 | Campos aceitos | `loaded`, `rcActive`/`rcCancelledButPaid` (boolean), `expiresAt` (isValidTs), `lastValidatedAt`, `maxSeenDeviceTimestamp` | B2 |
| 7 | Campos descartados | qualquer outro (ex.: `plan`); flags não-boolean; `expiresAt` inválido | B2 |
| 8 | `{plan:'premium'}` inútil | `sanitize` não copia `plan`; a policy não lê `plan` → `free` | B2/D2/D3 |
| 9 | JSON inválido/vazio/erro-fonte/malformado → não libera premium | load (try/catch→`{loaded:false}`) + refresh (try/catch→mantém) → policy `free` | B4/D2/D4 |
| 10 | Cache antigo só libera via policy+janela | `load` popula snapshot → `decideEntitlement` checa `expiresAt`/7d (expired/stale→free) | D4 |
| 11 | Relógio alterado bloqueado | `maxSeenDeviceTimestamp` (persistido/atualizado) → policy `clock_rollback`→free | D5 |
| 12 | `initEntitlement` nunca lança | try/catch envolvente + `.catch()` no fire-and-forget | B5/D6 |
| 13 | `refreshEntitlement` nunca lança | try/catch envolvente | B4/D6 |
| 14 | Listener não duplicado | guard `if (!_appStateSub)` → `addEventListener` 1× | B5/D6 |
| 15 | Cleanup seguro | `stopEntitlementAutoRefresh()` (`_appStateSub.remove()`), disponível (não requerido no root) | B6/D6 |
| 16 | Boot sem loading novo | `App.js` só ganha `initEntitlement()`; sem `useState`/`ActivityIndicator` de entitlement | C1/D7 |
| 17 | Telas intocadas | nenhuma `src/screens` consome entitlement | D8/E2 |
| 18 | 2C não iniciada | `app.json` sem `assetBundlePatterns`; requires intactos | D8 |
| 19 | RevenueCat fora | nenhum `react-native-purchases`/`Purchases` no runtime | D8 |
| 20 | Sem dependência nova | `package.json`/lock intactos; só `AppState` nativo | D8 |

## 2. Cobertura (RP → Task)
RP1→A1 · RP2→B4 · RP3→B5/C1 · RP4→B2/B3 · RP5→B2/policy · RP6→B5(AppState) · RP7→policy(janela) · RP8→try/catch em A1/B3/B4/B5. Todos os 8 aceites têm task/checagem.

## 3. Decisão `App.js` (limite claro)
**Aprovada:** 1 linha `initEntitlement();` + 1 import no `useEffect([])` de boot existente. **Limite:** nada além disso — sem `useState`, sem `ActivityIndicator`, sem navegação/render. Se a implementação exigir mais (ex.: um provider, um estado de loading) → **PARA e volta ao portão** (regra 9 do bloco App.js). Prova: D7 (smoke) + `git diff App.js` (só import + 1 linha).

## 4. Fluxos (resumo)
- **Boot:** `App.js useEffect` → `initEntitlement()` → `loadEntitlement()` (lê `@ptf_entitlement_v1` 1×, fire-and-forget) + registra AppState. `getCurrentPlan` síncrono → `free` até carregar.
- **Refresh:** AppState `'active'` → `refreshEntitlement()` → `fetchEntitlement()` (stub→null) → `sanitize` → se válido: `_snapshot`+`saveEntitlement`; senão mantém. Nunca lança.
- **Persistência:** só snapshot **sanitizado** vai a `@ptf_entitlement_v1`. Com stub, nada premium é gravado.

## 5. Consistência entre artefatos
- `App.js` = 1 linha em spec/clarify/plan/tasks — coerente. `stopEntitlementAutoRefresh` (cleanup) aparece em plan/tasks (pontos 14/15) — coerente. Sem resíduo de "lazy" (descartada). ✅
- `isValidTs` importado de `entitlementPolicy` mantém "policy consumida só por service". ✅
- `serverNow` preferido a `Date.now()` (limitação declarada até RevenueCat) — spec RP2/plan Contrato 2. ✅

## 6. Riscos
- **Baixo:** stub → `free` (sem mudança de comportamento); `App.js` 1 linha fire-and-forget; pipeline provado por mock. AppState nativo (sem dependência). O único novo efeito de runtime é o listener AppState → `refreshEntitlement` (que com stub resolve `free`, sem persistir).
- **Registrado:** `Date.now()` local até a fonte trazer `serverNow` (RevenueCat 2B.7.4) — mitigado por `maxSeenDeviceTimestamp` + janela 7d.

## 7. Veredito
**CONSISTENTE.** 20 pontos com garantia e prova; `App.js` limitado a 1 linha (provado sem visual); fonte stub preserva `free`; anti-premium-acidental em camadas; app abre mesmo com falhas; 2C/RevenueCat/dependência fora. Pronto para o **Portão 3**.
