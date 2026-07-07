# Checklist de requisitos — Fase 2B.7 (Entitlement real e validade offline)

> **Etapa SDD 3.** Valida a qualidade dos requisitos (`spec-fase-2b7.md` + `clarify-fase-2b7.md`) antes do Plan. Natureza: **política/contrato**, sem implementação.

| # | Item | Status | Evidência |
|---|---|---|---|
| CHK1 | `getCurrentPlan()` permanece **síncrono**; só a fonte muda | ✅ | spec RP2; direção 1 |
| CHK2 | Consumidores do gate **inalterados** (`isPremiumUser`/`hasStoryAccess`/`canOpenStoryFullExperience`) | ✅ | spec RP2/RP9; direção 3-4 |
| CHK3 | Modelo de estado explícito (`plan/status/expiresAt/lastValidatedAt/maxSeenDeviceTimestamp`) | ✅ | spec "Modelo de estado" |
| CHK4 | Janela offline **fixada em 7 dias** (verificável) | ✅ | Clarify C1; `OFFLINE_MAX_WINDOW_DAYS=7` |
| CHK5 | Chave **`@ptf_entitlement_v1`** (nova, versionada; sem reuso de `@ptf_plan_state_v1`) | ✅ | Clarify C2 |
| CHK6 | Estado inicial seguro (**sem cache → free**); provisório só sob 3 condições | ✅ | Clarify C3; RP4 |
| CHK7 | Expiração dura offline (`now>expiresAt`→free; 7d→needs_revalidation) | ✅ | Clarify C4; RP5 |
| CHK8 | Cancelamento (dentro do período → premium; vencido → free) | ✅ | Clarify C5; RP3 |
| CHK9 | Grace **só** via `CustomerInfo` (sem grace próprio no client) | ✅ | Clarify C6; RP3 |
| CHK10 | Defesa de relógio firme (`maxSeenDeviceTimestamp`+`lastValidatedAt`; conservador se sem fonte confiável) | ✅ | Clarify C7; RP6 |
| CHK11 | Modo Criador só dev; produção nunca premium; smoke/guard | ✅ | Clarify C8; RP7 |
| CHK12 | Pontos de revalidação (boot/foco/rede/compra) | ✅ | spec RP8 |
| CHK13 | Pack no disco nunca é autorização (mantém 2B.6 RP2) | ✅ | spec RP9; direção 5 |
| CHK14 | Riscos residuais R2/técnico registrados + trilha futura | ✅ | Clarify C9; spec "Riscos" |
| CHK15 | 2C bloqueada com 6 condições formais | ✅ | Clarify C10; spec "2C bloqueada" |
| CHK16 | Fora de escopo claro (sem RevenueCat/backend/2C/cripto/app.json/assets) | ✅ | spec "Fora de escopo" |
| CHK17 | Critérios de aceite objetivos p/ implementação futura | ✅ | spec "Critérios de aceite" |
| CHK18 | Plan detalhará **só arquitetura/contratos** (sem código) | ✅ | escopo do Portão 1 |

**Resultado:** 18/18 ✅ — requisitos prontos para o Plan.
