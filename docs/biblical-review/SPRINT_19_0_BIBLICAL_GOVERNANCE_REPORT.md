# Sprint 19.0 — Relatório Final: Governança Bíblica

**Data:** 2026-06-01  
**Smoke antes:** 620/620  
**Smoke depois:** 620/620 ✓  
**Código alterado:** NÃO  
**Conteúdo alterado:** NÃO  
**Assets alterados:** NÃO  
**Histórias alteradas:** NÃO  
**Regras de negócio alteradas:** NÃO

---

## Resumo executivo

A Sprint 19.0 criou a estrutura oficial de governança bíblica do app Pequenos Traços de Fé. O objetivo foi estabelecer o processo de auditoria bíblica antes do início das revisões de conteúdo por história, garantindo que nenhuma narração final, imagem final ou pacote de narrador seja produzido sem passar por este processo.

**Nenhuma história foi revisada nesta sprint.** A sprint criou apenas a estrutura documental. A revisão história a história será realizada na Sprint 19.1 e seguintes.

---

## Arquivos criados

| Arquivo | Localização | Descrição |
|---|---|---|
| `BIBLICAL_CONTENT_STANDARD.md` | `docs/biblical-review/` | Padrão editorial bíblico geral do app |
| `TRANSLATION_REFERENCE_POLICY.md` | `docs/biblical-review/` | Política de uso de referências bíblicas e traduções |
| `DOCTRINAL_NEUTRALITY_GUIDE.md` | `docs/biblical-review/` | Regras para neutralidade entre denominações |
| `CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md` | `docs/biblical-review/` | Linguagem bíblica segura para 3–8 anos |
| `BIBLICAL_REVIEW_RISK_LEVELS.md` | `docs/biblical-review/` | Cinco níveis de risco editorial (1–5) |
| `BIBLICAL_REVIEW_CHECKLIST.md` | `docs/biblical-review/` | Checklist por elemento de conteúdo |
| `BIBLICAL_REVIEW_REPORT_TEMPLATE.md` | `docs/biblical-review/` | Modelo de relatório por história |
| `SPRINT_19_0_BIBLICAL_GOVERNANCE_REPORT.md` | `docs/biblical-review/` | Este relatório |

**Total de arquivos criados:** 8  
**Total de arquivos alterados:** 0

---

## Arquivos alterados

Nenhum.

---

## Código alterado?

**NÃO.** Nenhum arquivo `.js`, `.ts`, `.json` de produção foi modificado.

---

## Conteúdo alterado?

**NÃO.** Nenhum texto de narração, quiz, lição, mensagem do guia ou qualquer outro conteúdo do app foi modificado.

---

## Assets alterados?

**NÃO.** Nenhuma imagem, áudio ou asset foi modificado.

---

## O que foi definido

### Padrão editorial (BIBLICAL_CONTENT_STANDARD.md)

- Fidelidade ao texto bíblico como princípio central.
- O que pode ser adaptado (linguagem, condensação de eventos) e o que não pode ser alterado (sentido central, caráter dos personagens, desfecho moral).
- Proibição de inventar milagres, diálogos ou revelações não registradas na Bíblia.
- Obrigatoriedade de identificar a passagem bíblica de cada história.

### Política de traduções (TRANSLATION_REFERENCE_POLICY.md)

- O app usa paráfrase infantil fiel, não transcrição de traduções protegidas por direito autoral.
- Citações diretas de versículos são permitidas com moderação e com indicação da tradução.
- Para termos com divergência entre traduções, o app usa linguagem própria de amplo reconhecimento.
- Processo de consulta a pelo menos duas traduções durante a revisão.
- Tabela de referência das principais traduções brasileiras e seus respectivos status de copyright.

### Neutralidade doutrinal (DOCTRINAL_NEUTRALITY_GUIDE.md)

- O app é cristão amplo, não denominacional.
- Lista de temas denominacionais que o app não deve abordar: forma de batismo, glossolalia, predestinação, papel de Maria, escatologia específica, entre outros.
- Regras para tratar eventos que aparecem na narrativa bíblica mas têm interpretações denominacionais distintas.
- Protocolo de sinalização quando um item requer decisão denominacional.

### Linguagem infantil (CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md)

- Perfil de desenvolvimento por faixa etária (3–4, 5–6, 7–8 anos).
- Princípios: Deus como bom, esperança como tom dominante, medo equilibrado com segurança.
- Regras de adaptação de violência, medo, culpa e morte para o contexto infantil.
- Tabela de conceitos teológicos abstratos e suas versões concretas para crianças.
- Vocabulário a evitar com alternativas recomendadas.
- Checklist rápido de 7 itens para validação de linguagem.

### Níveis de risco (BIBLICAL_REVIEW_RISK_LEVELS.md)

- **Nível 1 — Aprovado:** sem necessidade de ação.
- **Nível 2 — Ajuste leve:** não bloqueia produção se comprometido.
- **Nível 3 — Ajuste importante:** bloqueia até reescrita e nova aprovação.
- **Nível 4 — Crítico:** bloqueia toda a história; exige aprovação do dono do produto.
- **Nível 5 — Decisão humana:** pausa o item; exige decisão deliberada e documentada.

### Checklist de revisão (BIBLICAL_REVIEW_CHECKLIST.md)

9 blocos de verificação cobrindo:
- Identidade da história (título, passagem, lição)
- Narração por cena
- Lição curta
- Mensagem do guia
- Quiz completo (pergunta, alternativas, resposta, feedback)
- Instrução de colorir
- Instrução de imagem
- Conteúdo da área dos pais
- Falas de Deus, Jesus, anjos, profetas e personagens bíblicos

### Modelo de relatório (BIBLICAL_REVIEW_REPORT_TEMPLATE.md)

Relatório padronizado por história com 16 seções, incluindo:
- Identificação da história e passagens de referência.
- Resumo bíblico seguro.
- Tabelas de itens por nível de risco.
- Sugestões de reescrita com texto original e texto sugerido.
- Verificações de tradução, neutralidade e linguagem.
- Status final e histórico de revisões.

---

## O que NÃO foi feito (propositalmente)

- Nenhuma história foi revisada com o checklist.
- Nenhum conteúdo foi declarado aprovado ou reprovado teologicamente.
- Nenhuma denominação foi definida como padrão.
- Nenhuma passagem bíblica foi inventada ou transcrita.
- Nenhum código foi alterado.

---

## Riscos do processo identificados

| Risco | Mitigação definida |
|---|---|
| Revisor sem formação bíblica formal | O checklist e os guias permitem que qualquer pessoa com conhecimento bíblico básico realize uma revisão inicial; itens Nível 5 exigem consultor externo |
| Conteúdo passar sem revisão | Processo exige relatório completo antes de narração final — bloqueio processual |
| Erro de interpretação denominacional | Guia de neutralidade + nível 5 (decisão humana) prevê esse cenário |
| Transcrição não intencional de tradução protegida | Política de tradução proíbe explicitamente; revisor deve verificar |
| Histórias com temas adultos difíceis (morte, guerra) | Guia de linguagem infantil estabelece limite de detalhe e obrigatoriedade de elemento de esperança |

---

## Próximo passo recomendado: Sprint 19.1

**Objetivo:** Exportação oficial dos textos para auditoria bíblica.

Ações esperadas na Sprint 19.1:
1. Criar script ou processo de exportação de todos os textos do app (narração, quiz, lição, área dos pais) em formato legível por revisor não-técnico (ex: CSV, Markdown por história).
2. Priorizar as 3 histórias ativas (Noé, Davi e Golias, Jesus e as Crianças) para a primeira rodada de revisão.
3. Aplicar o `BIBLICAL_REVIEW_CHECKLIST.md` a cada uma das 3 histórias prioritárias.
4. Gerar os primeiros 3 relatórios usando o `BIBLICAL_REVIEW_REPORT_TEMPLATE.md`.
5. Documentar os itens por nível de risco e listar os ajustes necessários antes da produção de narração final.

**Por que fazer isso agora:** antes de gravar narração ou gerar pacotes para narrador externo, o processo de revisão bíblica deve estar validado em pelo menos uma história completa. Descobrir um erro de Nível 4 depois da narração gravada tem custo muito maior do que antes.

---

## Smoke final

```
620/620 passed, 0 failed
```
