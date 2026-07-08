# Analyze — Bloco 2 · Fase 2B.7.2 · Consumo controlado do entitlement

> **Etapa SDD 6.** Consistência spec↔clarify↔plan↔tasks. Entrada: [spec](./spec-fase-2b72.md) · [clarify](./clarify-fase-2b72.md) · [plan](./plan-fase-2b72.md) · [tasks](./tasks-fase-2b72.md) · [checklist](./checklist-fase-2b72.md).

## 1. Decisões do Portão 2 (justificativas obrigatórias)

**Decisão A — `App.js` EVITADO nesta fase.** O Plan original previa `loadEntitlement()` no boot; a instrução do Portão 2 ("prefira evitar `App.js` se a fase puder ficar mais isolada") é atendida **evitando-o**, com justificativa técnica: o `_snapshot` **default `{ loaded:false }`** já faz `getEntitlementSnapshot()` → `decideEntitlement` → `free/no_cache`. Sem uma fonte que **grave** `@ptf_entitlement_v1` (só existe em 2B.7.3), carregar o cache no boot seria **redundante** (sempre carrega vazio → `loaded:false`, igual ao default). Logo, `App.js` fica **intocado**; o boot `loadEntitlement()` entra na 2B.7.3, junto da fonte real. Isso também torna o **ponto obrigatório 1** (não bloquear o boot) trivialmente verdadeiro.

**Decisão B — `@ptf_entitlement_v1`: registrada, sem leitura de runtime nesta fase.** A chave é **adicionada a `storageKeys`** (registro para 2B.7.3). Como `loadEntitlement()` **não é chamado no boot** (Decisão A), **não há leitura de `@ptf_entitlement_v1` em runtime** nesta fase — `getCurrentPlan` usa o `_snapshot` default. A função `loadEntitlement()` **existe** (pronta para 2B.7.3) e é **exercitada apenas pelo smoke** (D3), que prova robustez: storage **vazio / inválido / malformado** → `free`, **nunca premium**. Portanto: leitura real de runtime = **não** nesta fase; leitura de teste = **sim** (smoke).

## 2. Pontos obrigatórios (1-9) → guarda
| # | Ponto | Onde |
|---|---|---|
| 1 | `loadEntitlement` não bloqueia o boot | não chamado no boot (Decisão A); async quando usado |
| 2 | `loadEntitlement` não lança para fora | try/catch → `{ loaded:false }` (B5, D3) |
| 3 | storage falho/ausente/inválido/malformado → free/needs_revalidation, nunca premium | B5 + D3 (4 sub-casos) |
| 4 | `needs_revalidation` → `free` em `getCurrentPlan` | B4 |
| 5 | nada salvo libera premium sem `decideEntitlement` | B3/B4 (só a policy decide; `plan` salvo é ignorado) — D3 |
| 6 | `now` no momento da decisão, não congelado | B2 (`Date.now()` on-demand) |
| 7 | test-mode com precedência explícita | C1 (checado antes da delegação) — D4 |
| 8 | nenhuma tela/UI/paywall/resolver/ProgressContext/assets/requires/app.json/navegação | invariantes + D6/E2 |
| 9 | se exigir tocar tela → parar e voltar ao portão | escopo (nenhuma tela é necessária) |

## 3. Cobertura (RP → Task → smoke)
RP1(service)→B1-B5 · RP2(getCurrentPlan delega)→C1/D2 · RP3(snapshot)→B2 · RP4(compat free)→B4/D3 · RP5(semântica)→B4 · RP6(consumidores)→invariantes/D6/E2 · RP7(isolamento migrado)→D1. Todos os 8 critérios de aceite têm task/checagem.

## 4. Consistência entre artefatos
- `App.js` **removido** do Plan (Arquivos/Tasks/Invariantes) e das Tasks; Clarify C3/C5 já apontava o load como não-bloqueante — coerente. Sem resíduo de "T4 App.js". ✅
- Migração do [1840] refletida em spec RP7, Clarify C4, plan Smoke.3, tasks D1. ✅
- Chave `@ptf_entitlement_v1` (registrada) em spec/plan/tasks; leitura só no smoke — coerente com Decisão B. ✅

## 5. Prova de compatibilidade (comportamento atual preservado)
Sem fonte → `_snapshot { loaded:false }` → `decideEntitlement` → `free/no_cache` → `getEntitlementPlan()==='free'` → `getCurrentPlan()==='free'` (idêntico ao mock). `ENABLE_LOCAL_PREMIUM_TEST_MODE` e Modo Criador (via `isPremiumUser` OR) preservados. Nenhum premium novo. Smoke D2/D3 + device fumaça E3 provam.

## 6. Isolamento da policy
`entitlementPolicy` importado **só** por `entitlementService` (D1). `accessControl` importa o **service**, não a policy. Nenhuma tela importa nenhum dos dois (D6). `entitlementPolicy.js` **intocado** (D5).

## 7. Riscos
- **Baixo:** delegação que resolve `free` sem fonte → sem impacto visual/comportamental. A única mudança de runtime é `getCurrentPlan` passar por `decideEntitlement` (que retorna `free`). `App.js` evitado reduz ainda mais a superfície.
- **Fora de escopo (registrado):** forja de AsyncStorage por usuário técnico (root) — a policy confia no snapshot; defesa é trilha futura (2B.7/2B.7.3 + segurança de packs), não desta fase.

## 8. Veredito
**CONSISTENTE.** Decisões A/B justificadas; pontos obrigatórios 1-9 com guarda; cobertura completa; App.js evitado sem perda; compatibilidade e isolamento provados; 2C não iniciada. Pronto para o **Portão 3**.
