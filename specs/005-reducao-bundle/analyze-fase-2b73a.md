# Analyze — Bloco 2 · Fase 2B.7.3a · Progresso visual em premium bloqueada

> **Etapa SDD 6.** Consistência spec↔clarify↔plan↔tasks. Entrada: [spec](./spec-fase-2b73a.md) · [clarify](./clarify-fase-2b73a.md) · [plan](./plan-fase-2b73a.md) · [tasks](./tasks-fase-2b73a.md) · [checklist](./checklist-fase-2b73a.md).

## 1. Os 10 pontos obrigatórios → como são garantidos
| # | Ponto | Garantia | Onde |
|---|---|---|---|
| 1 | `isDone` sem depender de `canAccess` | `isDone = progresso[cena.id] === true` (useProgress, progresso REAL salvo); passado à função pura como **campo separado**; a matriz checa `isDone` **antes** de `canAccess` | B1/A1 |
| 2 | `canAccess` continua bloqueando abertura | `canAccess` é campo distinto na matriz (bloqueia não-concluídas) **e** segue no `goToPremium`/`getSceneStatus`→onPress/telas (2B.6) | B1/C5 |
| 3 | Mudança é visual, não muda entitlement | só `sceneVisualStatus` (rótulo) e a delegação; `accessControl`/`entitlement*` intocados | A1/B1/C7 |
| 4 | `goToPremium` continua protegendo | onPress das cenas inalterado (`goToPremium`); nenhum navigate premium cru | C5 |
| 5 | Concluída sem acesso não abre premium | `completed` clicável → `goToPremium` → `!canAccess` → ParentArea (não Narração/Colorir/Livrinho/Quiz) | C2/C5 |
| 6 | Futura sem acesso segue bloqueada | `{isDone:false, canAccess:false}` → `locked` (matriz linha 3) | C1/C4 |
| 7 | Grátis não regride | `canAccess=true` → fluxo idêntico (matriz = comportamento atual) | C3 |
| 8 | Premium sem progresso igual | nenhuma `isDone` → todas caem em `!canAccess` → `locked` | C4 |
| 9 | `SceneListItem` não alterado | não está nas tasks; grep confirma sem diff | D2/C7 |
| 10 | entitlement*/accessControl/App.js/RevenueCat/packs/downloads/assets/app.json/2C intocados | fora das tasks; `git status`/grep | D2/C7 |

## 2. Prova da equivalência (por que só concluída-sem-acesso muda)
Comparando `getSceneStatus` atual × `sceneVisualStatus`, para cada combinação de (`isComingSoon`,`isDone`,`canAccess`,`isCurrent`), **a única diferença** é o caso `isDone:true, canAccess:false`: hoje `locked` (bug — `!canAccess` vem antes), corrigido `completed`. Todos os outros casos são idênticos (tabela na spec). Logo grátis (`canAccess:true`) e premium-sem-progresso (`isDone:false`) **não mudam**.

## 3. Cobertura (RP/regra → Task → smoke)
regra 1-2 (progresso visual/não libera)→A1/B1+C2/C5 · regra 3-5 (concluída visível/não-concluída bloqueada/próxima bloqueada)→A1+C1/C4 · regra 6 (clique→ParentArea)→C5 · regra 7 (botão responsável)→C6 · regra 8-9 (grátis/premium-sem-progresso)→C3/C4.

## 4. Consistência entre artefatos
- Matriz idêntica em spec/clarify/plan/tasks (5 linhas, top-down). ✅
- `sceneVisualStatus` em `storyJourneyService` (puro) — coerente em plan/tasks; opção inline/`SceneListItem` **descartadas** (Portão 2). Sem resíduo. ✅
- `isDone` como campo separado de `canAccess` — enfatizado (ponto 1). ✅

## 5. Riscos
- **Baixo:** mudança de **ordem** numa função pura; abertura continua bloqueada por `goToPremium`/telas (2B.6, intactas). O único efeito é o rótulo de cenas já concluídas em premium sem acesso.
- **Validação visual device obrigatória** (mudança de tela) — executada por Eduardo (o agente não tem device).

## 6. Veredito
**CONSISTENTE.** 10 pontos com garantia; matriz aprovada; só o rótulo visual muda; acesso/entitlement intactos; `SceneListItem`/proibidos fora; 2B.7.4/2C não iniciadas. Pronto para o **Portão 3**.
