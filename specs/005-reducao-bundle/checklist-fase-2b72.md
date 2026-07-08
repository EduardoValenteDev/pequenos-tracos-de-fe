# Checklist de requisitos — Fase 2B.7.2 (Consumo controlado do entitlement)

> **Etapa SDD 3.** Valida a qualidade dos requisitos (`spec-fase-2b72.md` + `clarify-fase-2b72.md`) antes do Plan. Natureza: ligação controlada.

| # | Item | Status | Evidência |
|---|---|---|---|
| CHK1 | Papel do `entitlementService` claro (casca; snapshot em memória; sem RevenueCat) | ✅ | spec RP1; Clarify C1 |
| CHK2 | `getCurrentPlan` delega a `decideEntitlement`; `decision!=='premium'`→`'free'` | ✅ | spec RP2; RP5 |
| CHK3 | Snapshot mínimo definido (7 campos; `now` injetado pelo service) | ✅ | spec RP3; Clarify C5/C6 |
| CHK4 | Compatibilidade total: sem fonte → `getCurrentPlan()==='free'` (idêntico ao mock) | ✅ | spec RP4 |
| CHK5 | `ENABLE_LOCAL_PREMIUM_TEST_MODE` + Modo Criador preservados | ✅ | spec RP2/RP5; Clarify C2 |
| CHK6 | Semântica premium/free/needs_revalidation mapeada | ✅ | spec RP5 |
| CHK7 | Consumidores tocados/intocados explícitos (telas NÃO) | ✅ | spec RP6 |
| CHK8 | Nenhuma tela/paywall/navegação/UI tocada nesta fase | ✅ | spec RP6; Clarify C7 |
| CHK9 | Chave nova `@ptf_entitlement_v1` (sem reuso de `@ptf_plan_state_v1`) | ✅ | spec RP3; aceite 5 |
| CHK10 | Migração fiel do isolamento [1840] (só `entitlementService` consome) | ✅ | spec RP7; Clarify C4 |
| CHK11 | `entitlementPolicy.js` intocado; pureza preservada | ✅ | Clarify C6 |
| CHK12 | Prova de "2C não iniciada" (app.json/requires/bundle) | ✅ | spec §Prova 7 |
| CHK13 | Prova de "sem mudança visual" (smoke + git + device fumaça) | ✅ | spec §Prova 8 |
| CHK14 | Gates que bloqueiam (smoke/doctor/grep/device/sem dep) | ✅ | spec §Gates 9 |
| CHK15 | Sem dependência nova | ✅ | spec RP1; Fora de escopo |
| CHK16 | Fora de escopo claro (RevenueCat/refresh/persist/2C/telas) | ✅ | spec "Fora de escopo" |
| CHK17 | "Ligação, não expansão" — para no portão se exigir tela | ✅ | spec RP6; Clarify C7 |

**Resultado:** 17/17 ✅ — requisitos prontos para o Plan.
