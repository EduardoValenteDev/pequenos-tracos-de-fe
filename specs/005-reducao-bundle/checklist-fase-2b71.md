# Checklist de requisitos — Fase 2B.7.1 (Entitlement policy puro)

> **Etapa SDD 3.** Valida a qualidade dos requisitos (`spec-fase-2b71.md` + `clarify-fase-2b71.md`) antes do Plan. Natureza: função pura, sem implementação.

| # | Item | Status | Evidência |
|---|---|---|---|
| CHK1 | Módulo puro (sem I/O/React/storage/imports; nunca lança; `now` injetado) | ✅ | spec RF1 |
| CHK2 | Contrato claro `decideEntitlement(snapshot) → {decision, reason}` | ✅ | spec RF2; Clarify C1 |
| CHK3 | `reason` mantido; sem `online` no snapshot | ✅ | Clarify C1/C2 |
| CHK4 | Snapshot explícito (7 campos) | ✅ | spec RF3 |
| CHK5 | Matriz conservadora (bloqueios antes de liberações, top-down) | ✅ | spec RF4; Clarify C9 |
| CHK6 | Expiração `>=` (instante exato bloqueia) | ✅ | spec RF5; Clarify C3 |
| CHK7 | Janela `>` 7 dias (limite exato passa) | ✅ | spec RF5; Clarify C4 |
| CHK8 | Dados ausentes → conservador (`hasValidWindow` exigido p/ premium) | ✅ | spec RF5; Clarify C5 |
| CHK9 | Números inválidos → `isValidTs`, sem lançar | ✅ | spec RF1/RF5; Clarify C6 |
| CHK10 | `rcCancelledButPaid` só premium com `expiresAt` futuro + janela válida | ✅ | spec RF4.8; Clarify C7 |
| CHK11 | `rcActive` só premium sem bloqueio anterior + `hasValidWindow` | ✅ | spec RF4.6; Clarify C8 |
| CHK12 | `needs_revalidation` distinto de `free`, mas bloqueia premium | ✅ | spec RF2 |
| CHK13 | Isolamento total (não consumido; accessControl/App.js/telas intocados) | ✅ | spec RF6 |
| CHK14 | Sem dependência nova | ✅ | spec RF6 |
| CHK15 | Smoke cobre matriz + 15 bordas | ✅ | spec RF7; plan |
| CHK16 | Critérios de aceite objetivos | ✅ | spec "Critérios de aceite" |
| CHK17 | Fora de escopo claro (sem RevenueCat/service/consumo/2C) | ✅ | spec "Fora de escopo" |

**Resultado:** 17/17 ✅ — requisitos prontos para o Plan.
