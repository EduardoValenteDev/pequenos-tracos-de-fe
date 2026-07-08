# Clarify — Bloco 2 · Fase 2B.7.3 · Fonte real de entitlement

> **Etapa SDD 2.** Resolve ambiguidades da `spec-fase-2b73.md` antes do Plan. Sem `[NEEDS CLARIFICATION]` em aberto.

| # | Ponto | Resolução |
|---|---|---|
| C1 | RevenueCat entra agora? | **Não.** Cria-se a **interface adaptadora (port) `entitlementSource` PRIMEIRO**; a implementação RevenueCat real é **2B.7.4** (com aprovação de dependência). Nesta fase, **stub fail-closed** (`fetchEntitlement()` → `null` → `free`). |
| C2 | Dependência nova? | **Nenhuma nesta fase.** `AppState` é nativo do RN (já usado). **NetInfo NÃO entra** (evita dependência); offline é tratado por refresh conservador. `react-native-purchases`/NetInfo = sub-fases próprias, justificadas. |
| C3 | `App.js`? | **Recomendado:** 1 linha `initEntitlement()` no `useEffect` de boot existente (fire-and-forget, sem render/loading). **Alternativa (Plan):** auto-init lazy no service (evita `App.js`, mas mistura I/O na leitura). Decisão final no Plan/Portão 2, com prova de ausência de mudança visual. |
| C4 | Refresh que falha (offline/erro) | **Conservador:** mantém o último cache **se dentro da janela** (a policy decide por `expiresAt`/7 dias); **nunca promove** premium sem validade; **nunca lança**. Fora da janela → `needs_revalidation` → `free`. |
| C5 | O que a fonte stub retorna | `null` (sem entitlement) → `free`. O pipeline (refresh→sanitize→validate→persist→load) é **exercitado pelo smoke** com uma fonte mockada (válida → premium persistido; inválida/erro → free), provando o encanamento sem RevenueCat. |
| C6 | Quando persiste em `@ptf_entitlement_v1` | **Só** após um `refresh` que produza um snapshot **válido e sanitizado**. Com o stub, nada premium é gravado. `saveEntitlement` grava **apenas** campos do contrato sanitizados (descarta `plan` solto/estranho). |
| C7 | `accessControl`/`entitlementPolicy` mudam? | **Não.** `getCurrentPlan` já delega (2B.7.2); `entitlementPolicy` é usada como está (pura). A 2B.7.3 mexe só em `entitlementService` + `entitlementSource` (novo) + `App.js` (1 linha) + smoke. |

**Sem ambiguidades pendentes.** Requisitos prontos para o Checklist.
