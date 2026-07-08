# Checklist de requisitos — Fase 2B.7.3a (Progresso visual em premium bloqueada)

> **Etapa SDD 3.** Valida a qualidade dos requisitos (`spec-fase-2b73a.md` + `clarify-fase-2b73a.md`) antes do Plan.

| # | Item | Status | Evidência |
|---|---|---|---|
| CHK1 | Bug localizado com precisão (`getSceneStatus:181`) | ✅ | spec "Diagnóstico" |
| CHK2 | Fonte de progresso identificada (`useProgress.progresso`) | ✅ | spec ponto 2 |
| CHK3 | Fonte de acesso identificada (`canAccess`/`isPremiumUser`) | ✅ | spec ponto 3 |
| CHK4 | Correção clara (progresso antes do bloqueio; tabela por caso) | ✅ | spec "Correção proposta" |
| CHK5 | Separação visual × permissão explícita | ✅ | spec ponto 5; Clarify C1 |
| CHK6 | Concluídas mostradas sem abrir conteúdo (goToPremium→ParentArea) | ✅ | spec ponto 6; Clarify C1 |
| CHK7 | Cena atual/futura sem acesso segue bloqueada (não continua) | ✅ | spec ponto 7; tabela |
| CHK8 | Grátis + premium-sem-progresso idênticos (prova por caso) | ✅ | spec pontos 8/9; Clarify C6 |
| CHK9 | Prova de premium não liberado (só visual; abertura bloqueada) | ✅ | spec ponto 10; gate 4 |
| CHK10 | Prova de entitlement intacto | ✅ | spec ponto 11; Clarify C4 |
| CHK11 | Prova de 2B.7.4/2C não iniciadas | ✅ | spec ponto 12; gate 6 |
| CHK12 | Função pura testável para a matriz (recomendada) | ✅ | Clarify C2/C3 |
| CHK13 | Arquivos permitidos/proibidos explícitos | ✅ | spec "Arquivos" |
| CHK14 | `accessControl`/entitlement*/packs/`App.js`/`app.json` fora | ✅ | spec "Arquivos"/"Fora de escopo" |
| CHK15 | Sem dependência nova | ✅ | correção em telas/serviço JS existente |
| CHK16 | Gates definidos (smoke matriz + doctor + device visual) | ✅ | spec "Gates" |
| CHK17 | Validação visual device (é mudança de tela) | ✅ | spec gate 8 |

**Resultado:** 17/17 ✅ — requisitos prontos para o Plan.
