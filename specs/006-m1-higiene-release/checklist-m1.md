# Checklist de requisitos — M1 · Higiene de release e ferramentas internas

> **Etapa SDD 3.** Valida a qualidade dos requisitos (`spec-m1.md` + `clarify-m1.md`) antes do Plan. Marcado ✅ quando o requisito está claro e verificável; ⏳ quando depende de decisão do Portão 1.

| # | Item | Status | Evidência |
|---|---|---|---|
| CHK1 | Problema descrito com precisão (não é vazamento de produção, e sim consolidação/governança/smoke) | ✅ | spec §1; auditoria M1 |
| CHK2 | Objetivo mensurável (release limpo + ferramentas preservadas + smoke + docs) | ✅ | spec §2, §15 |
| CHK3 | **Nenhuma exclusão** de ferramenta sem política de acesso | ✅ | spec §4, §6 |
| CHK4 | Matriz de visibilidade dev/preview/production explícita | ✅ | spec §5 |
| CHK5 | Lista completa das ferramentas a preservar + gate de cada | ✅ | spec §6 |
| CHK6 | Regra de produto (usuário nunca vê interno) | ✅ | spec §7 |
| CHK7 | Regra de segurança (sem auth admin; proteção build-time) | ✅ | spec §8 |
| CHK8 | Estratégia de consolidação na Área dos Pais | ⏳ | spec §9; depende Q2/Q5/Q7 |
| CHK9 | Estratégia de remoção de overlays em produção/screenshot | ⏳ | spec §10; depende Q4 |
| CHK10 | Estratégia de teste premium sem liberar produção | ✅ | spec §11 (Modo Criador preservado) |
| CHK11 | Smoke checks anti-vazamento definidos | ✅ | spec §12 |
| CHK12 | Testes manuais (Dev Client + production-like) | ✅ | spec §13 |
| CHK13 | Critério de entrada/saída | ✅ | spec §14, §15 |
| CHK14 | Riscos de não fazer | ✅ | spec §16 |
| CHK15 | "Reset de progresso" classificado (público vs dev) | ⏳ | spec §6 nota; depende Q3 |
| CHK16 | Preview simula premium? | ⏳ | clarify Q1 |
| CHK17 | Fonte única de gate (`isInternalToolsEnabled`) | ⏳ | clarify Q5 |
| CHK18 | Destino do Modo Igreja | ⏳ | clarify Q6 |
| CHK19 | M1 não altera acesso/entitlement (só UI/smoke/docs) | ✅ | spec §3, §4; clarify Q8 |
| CHK20 | Commits atômicos separados (governança/código; sem assets) | ✅ | spec §15 |

**Resultado:** requisitos **claros nos fundamentos (✅)**; **6 itens (⏳)** dependem das decisões do **Portão 1** (Q1–Q7). Nenhum código/plan avança até essas decisões.
