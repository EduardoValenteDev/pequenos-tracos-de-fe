# Clarify — Bloco 2 · Fase 2B.7.2 · Consumo controlado do entitlement

> **Etapa SDD 2.** Resolve ambiguidades da `spec-fase-2b72.md` antes do Plan. Sem `[NEEDS CLARIFICATION]` em aberto.

| # | Ponto | Resolução |
|---|---|---|
| C1 | O `entitlementService` tem fonte de dados nesta fase? | **Não.** RevenueCat/compra é **2B.7.3**. Nesta fase o service é a **casca + a ligação**; sem fonte, o snapshot é `{ loaded:false }` → `decideEntitlement` → `free/no_cache`. |
| C2 | `getCurrentPlan` mantém `ENABLE_LOCAL_PREMIUM_TEST_MODE`? | **Sim** — override **dev** preservado, checado **antes** da delegação (`if (test_mode) return 'premium'`). Modo Criador segue via `isPremiumUser` (OR), inalterado. |
| C3 | `loadEntitlement()` bloqueia navegação premium no boot? | **Não nesta fase.** `getEntitlementSnapshot()` é **síncrono** e retorna o estado atual (`loaded:false` até carregar → `free`, seguro). O load é async (molde `loadCreatorQaMode`), não bloqueia. O "carregar antes de premium" da 2B.7 vira relevante em **2B.7.3** (com fonte real). |
| C4 | Migração do check [1840] (isolamento) | **Necessária e fiel:** de "nenhum módulo de `src/` consome `entitlementPolicy`" → **"apenas `entitlementService` consome `entitlementPolicy`"**. Nenhuma tela/consumidor visual o importa direto. |
| C5 | `maxSeenDeviceTimestamp` / gravação em `@ptf_entitlement_v1` | **Mínimo nesta fase:** o service **lê** `@ptf_entitlement_v1` (vazio) e injeta `now = Date.now()`. **Não grava** entitlement (sem fonte). Persistência/atualização plena de `maxSeen`/`lastValidatedAt` = **2B.7.3**. |
| C6 | Pureza da `entitlementPolicy` preservada? | **Sim.** A policy continua **pura** (`now` injetado). Quem lê o relógio (`Date.now()`) e o AsyncStorage é o **service** (casca). `entitlementPolicy.js` **não é alterado**. |
| C7 | Alguma tela precisa mudar? | **Não.** A ligação é só `entitlementService` + `getCurrentPlan` + `App.js` boot + `storageKeys`. Se a implementação revelar necessidade de tocar tela → **PARA e volta ao portão** (ligação, não expansão). |

**Sem ambiguidades pendentes.** Requisitos prontos para o Checklist.
