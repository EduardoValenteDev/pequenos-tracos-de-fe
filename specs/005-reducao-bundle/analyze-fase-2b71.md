# Analyze — Bloco 2 · Fase 2B.7.1 · Entitlement policy puro

> **Etapa SDD 6.** Consistência spec↔clarify↔plan↔tasks. Entrada: [spec](./spec-fase-2b71.md) · [clarify](./clarify-fase-2b71.md) · [plan](./plan-fase-2b71.md) · [tasks](./tasks-fase-2b71.md) · [checklist](./checklist-fase-2b71.md).

## 1. Reforço obrigatório do Portão 2 — validação de `now` (CONFIRMADO)
**Pergunta:** o `now` injetado é validado como timestamp? Se inválido (NaN/negativo/null/não-numérico), retorna `invalid_data` sem lançar?

**Resposta — SIM, garantido por design:**
- `now` é validado na **linha 2** da matriz (`!isValidTs(now)` → `{ free, invalid_data }`), **antes de qualquer uso aritmético** de `now` (linhas 3-10 usam `now < maxSeen`, `now >= expiresAt`, `now - lastValidatedAt`).
- `isValidTs(t) = typeof t === 'number' && Number.isFinite(t) && t > 0` rejeita **NaN** (`Number.isFinite(NaN)=false`), **negativos** e **0** (`t>0`), **null/undefined/string/objeto** (`typeof !== 'number'`).
- **Por que a ordem importa:** sem a linha 2, `now:NaN` faria toda comparação (`NaN < x`, `NaN >= x`) retornar `false` silenciosamente → cairia em fluxos incorretos (ex.: escapar do bloqueio de expiração). A linha 2 curta-circuita antes disso. A função **não lança** (sem acesso a propriedade que quebre; snapshot ausente já é tratado na linha 1).
- **Ação:** o caso #14 foi **expandido** (task B3) para varrer `now ∈ {NaN, -1, 0, null, undefined, 'abc'}` — todas → `{ free, invalid_data }` sem lançar (envolto em try/catch que falha o check se lançar). **Reforço atendido com caso de smoke dedicado + justificativa.**

## 2. Cobertura (RF → Plan/Task → caso de smoke)
| Requisito | Onde | Caso(s) |
|---|---|---|
| RF1 módulo puro | A1 | (isolamento C2) |
| `isValidTs` (RF1/RF5) | A2 | #14 + B3 |
| `hasValidWindow` (RF4) | A3 | #6,#7,#10,#11,#12 |
| Matriz RF4 (10 linhas) | A4 | #1–#15 |
| `>=` expiração (RF5/C3) | A4.4 | **#4** (`now===expiresAt`) |
| `>` janela (RF5/C4) | A4.5 | **#7** (janela===7d) |
| dados ausentes conservador (RF5/C5) | A4.6-9 | **#10, #11** |
| números inválidos (RF5/C6) | A2+A4.2 | **#14 + B3** |
| `rcCancelledButPaid` (C7) | A4.8-9 | #12, #13 |
| `rcActive` (C8) | A4.6-7 | #9, #10, #11 |
| isolamento (RF6) | C2 | grep + git status |

**Cada linha da matriz tem ≥1 caso; as 4 bordas críticas têm caso dedicado.**

## 3. Ordem conservadora (bloqueios antes de liberações)
Sequência top-down: `no_cache → invalid_data → clock_rollback → expired → stale_validation → (premium)active → needs_revalidation → (premium)cancelled_active → needs_revalidation → inactive`. Prova de precedência: caso **#13** (`rcCancelledButPaid` + `expiresAt` vencido) retorna `expired` (linha 4) **antes** da liberação (linha 8) — o bloqueio ganha. ✅

## 4. Regras invioláveis → guarda
| Regra | Onde |
|---|---|
| 1 arquivo puro novo, nada mais (+smoke) | tasks A/B |
| Sem imports / efeitos / lançar | A1/A4; B3 (try/catch) |
| Não consumido (isolamento) | C2 (grep + git status) |
| Sem dependência nova | A1 |
| accessControl/App.js/telas/resolver/ProgressContext/app.json/assets/requires intocados | C2 |
| 2C não iniciada | escopo |
| Sem git | C3 |

## 5. Riscos
- **Baixo:** função pura determinística, sem I/O; a única complexidade é a ordem da matriz — coberta caso a caso. Sem consumo → zero impacto em runtime/2B.6/2B.7.
- **Nenhum risco de dependência/RevenueCat** (fora de escopo).

## 6. Veredito
**CONSISTENTE.** Reforço do `now` atendido (validação na linha 2 + caso #14 expandido). Cobertura completa da matriz e das bordas; ordem conservadora provada; módulo isolado e puro; consumidores intocados. Pronto para o **Portão 3**.
