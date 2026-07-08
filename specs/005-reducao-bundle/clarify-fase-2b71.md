# Clarify — Bloco 2 · Fase 2B.7.1 · Entitlement policy puro

> **Etapa SDD 2.** Ajustes obrigatórios do Portão 1 (Eduardo, 2026-07-07). Sem `[NEEDS CLARIFICATION]` em aberto.

| # | Ponto | Decisão |
|---|---|---|
| C1 | Contrato de retorno | **Manter `{ decision, reason }`.** Não simplificar para só `decision` — `reason` serve smoke, diagnóstico e UX futura. |
| C2 | `online` no snapshot | **NÃO incluir** nesta fase. A policy decide só com o snapshot; "sem internet" é decisão do **service** futuro (quando tentar revalidar), não da policy. |
| C3 | Expiração conservadora | `isValidTs(expiresAt) && now >= expiresAt` → `free`/`expired`. **No instante exato de expiração, premium já bloqueia** (`>=`, não `>`). |
| C4 | Janela offline 7 dias | `isValidTs(lastValidatedAt) && (now - lastValidatedAt) > OFFLINE_MAX_WINDOW_MS` → `needs_revalidation`/`stale_validation`. **No limite exato de 7 dias ainda passa** (`>`); depois bloqueia. |
| C5 | Dados ausentes = seguro | Se `loaded === true` mas `expiresAt`/`lastValidatedAt` ausentes para um estado que tenta liberar premium → **conservador**. `rcActive === true` sem `expiresAt` válido **ou** sem `lastValidatedAt` válido → **não** libera premium offline → `needs_revalidation`. Nunca premium por booleano solto sem validade. |
| C6 | Números inválidos | Timestamps inválidos/negativos/`NaN`/não-numéricos tratados por `isValidTs(t)` = `typeof t==='number' && Number.isFinite(t) && t>0` → decisão **conservadora, sem lançar**. `now` inválido → `free`/`invalid_data`. |
| C7 | `rcCancelledButPaid` | Só vira premium se `expiresAt` **válido e futuro** **e** janela offline **não** vencida (`hasValidWindow`). Senão `needs_revalidation`. |
| C8 | `rcActive` | Só vira premium se **não houver bloqueio anterior** (relógio/expirado/janela) **e** `expiresAt` válido+futuro **e** `lastValidatedAt` válido+dentro de 7 dias **e** sem suspeita de relógio (`hasValidWindow`). Senão `needs_revalidation`. |
| C9 | Ordem da matriz | **Conservadora: bloqueios ANTES de liberações.** Avaliação sequencial top-down; primeiro match decide. Ordem: no_cache → invalid_data → clock_rollback → expired → stale_validation → (premium) active/cancelled_active → needs_revalidation → inactive. |

**Sem ambiguidades pendentes.** Requisitos prontos para o Checklist.
