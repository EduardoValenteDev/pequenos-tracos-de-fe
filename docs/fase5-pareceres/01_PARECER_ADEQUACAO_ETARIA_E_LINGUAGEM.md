# Fase 5 · Bloco 1 — Parecer de adequação etária e linguagem

**Fase:** 5 — Infância, privacidade, teologia e medição
**Bloco:** 1 — Adequação etária e linguagem
**Data:** 2026-08-06
**Natureza:** documental
**Fase anterior deste bloco:** [`00_ABERTURA_E_RASTREABILIDADE.md`](00_ABERTURA_E_RASTREABILIDADE.md)

---

## 0. O que este bloco é e o que ele não é

**É:**

- o parecer da Fase 5 sobre adequação etária e linguagem, exigido pelo critério de saída da
  Fase 5 registrado em `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` linha 249
  (*"parecer registrado em cada eixo"*);
- a execução documental da arbitragem 2 do fundador: *"Documentos que ainda dizem '3 a 8 anos'
  devem ser reconciliados documentalmente nesta fase"*;
- o registro auditável, linha a linha, de **tudo** que foi reconciliado e de **tudo** que foi
  deliberadamente preservado.

**Não é:**

- uma alteração de runtime. A arbitragem 2 é explícita: *"Não modificar runtime por causa desta
  decisão."* Nenhum arquivo de `src/`, `scripts/`, `assets/`, `App.js`, `app.json`, `eas.json`,
  `package.json`, `package-lock.json` ou `plugins/` foi tocado neste bloco;
- uma reabertura da faixa etária. A faixa está **congelada em 4 a 8 anos** por decisão do
  fundador registrada em `PF5-FAIXA-ETARIA` (`docs/DECISIONS.md`);
- uma revisão de conteúdo história a história. Isso pertence ao **Bloco 4** (parecer teológico e
  de conteúdo) e ao processo de revisão bíblica por história.

---

## 1. A decisão vigente

### 1.1 Faixa oficial

> **Faixa oficial do produto: 4 a 8 anos.**

Fonte: decisão do fundador de **2026-08-06**, registrada em `docs/DECISIONS.md`, bloco `PF5`,
sub-decisão **`PF5-FAIXA-ETARIA`**.

### 1.2 Referência de linguagem (eixo distinto da faixa)

> **Referência de linguagem:** texto simples e compreensível, idealmente acessível a uma criança
> de aproximadamente **5 anos**, **quando a natureza do conteúdo permitir**.

A referência de ~5 anos é de **linguagem**, **não** de faixa. Os dois eixos não se confundem:
a faixa define para quem o produto é; a referência de linguagem define o teto de complexidade
textual dentro dessa faixa.

**Corroboração pré-existente encontrada no repositório:** `CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md`
já dizia, desde a Sprint 19.0 e sem qualquer intervenção desta fase:

> *"O conteúdo principal deve ser compreensível para crianças de **5 anos**."*

Ou seja, a referência de linguagem arbitrada pelo fundador **já era** a prática editorial
documentada do projeto. A Fase 5 não a inventou: apenas a elevou a critério explícito e a separou
do eixo de faixa.

### 1.3 Ratificação pendente

Permanece pendente a ratificação registrada em
[`00_ABERTURA_E_RASTREABILIDADE.md` §2.3](00_ABERTURA_E_RASTREABILIDADE.md): a arbitragem de
4 a 8 foi emitida sob a premissa de que o conflito era apenas entre *"3 a 8"* e *"4-8"*, quando
existia também a `PL01A-04` (2026-07-21), que fixava **6 a 8 (acessível ~5–10)**. A supersessão
foi aplicada por precedência temporal e de mecanismo, com marcação explícita
**⚠️ RATIFICAÇÃO PENDENTE DO FUNDADOR**, a ser levantada na parada obrigatória do Bloco 5.

**Este bloco não remove essa marcação.**

---

## 2. Estado do runtime — verificado por leitura, não alterado

Verificação feita por inspeção somente-leitura em 2026-08-06.

| # | Fato verificado | Evidência | Veredito |
|---|---|---|---|
| 1 | As 20 histórias declaram `ageBand: '4-8'` | `src/data/stories.js` — 20 ocorrências, todas `'4-8'`, nenhum outro valor | **JÁ ALINHADO** — nada a fazer |
| 2 | `ageBand` **não tem nenhum consumidor** fora de `src/data/` | busca por `ageBand` em todo `src/`: 20 resultados, todos em `src/data/stories.js` | metadado editorial, **não** alcança a UI |
| 3 | `src/data/storyConstants.js` declara `LEVELS` com faixas `3–6`, `6–9`, `9–12` e `LEVEL_AGE_RANGE = { '3 a 6', '6 a 9', '9 a 12' }` | `src/data/storyConstants.js:7-22` | **DIVERGENTE** da faixa oficial — ver §6 |
| 4 | `src/data/storyConstants.js` **não é importado por nenhum arquivo** de `src/` nem por `App.js` | busca por `storyConstants` em `src/` e `App.js`: **zero** importadores | divergência **não alcançável em produção** |
| 5 | `src/screens/ParentAreaScreen.js:1369` exibe o placeholder `"Faixa ou grupo (ex.: 4 a 6 anos)"` | leitura direta do arquivo | **COMPATÍVEL** — é exemplo de preenchimento de campo livre de turma (Modo Igreja), dentro de 4–8; **não** é declaração de faixa do produto |

**Conclusão de runtime:** a faixa oficial 4 a 8 **não exige nenhuma alteração de código**. O único
ponto divergente (item 3) está em um módulo comprovadamente sem importadores e é registrado como
encaminhamento, não como correção desta fase.

---

## 3. Reconciliação documental aplicada

**24 substituições em 12 arquivos.** Todas são substituições em linha, sem inserção nem remoção de
linhas — o `git diff --stat` do bloco fecha em **24 inserções / 24 remoções**, o que confirma que
nenhum conteúdo foi acrescentado ou suprimido além do texto reconciliado.

| # | Arquivo | Texto anterior | Texto reconciliado |
|---|---|---|---|
| 1 | `PRODUCT_BLUEPRINT.md` | `faixa etária **3–8** (revogada)` | `faixa etária **3–8** (revogada; a faixa oficial vigente é **4 a 8 anos**, fixada por **PF5-FAIXA-ETARIA** em 2026-08-06, que supersede a **PL01A-04**: público 6–8, acessível ~5–10)` |
| 2 | `docs/legal/PRIVACY_POLICY_DRAFT.md` | `destinado a crianças de **3 a 8 anos**` | `destinado a crianças de **4 a 8 anos**` |
| 3 | `docs/legal/TERMS_OF_USE_DRAFT.md` | `destinado a crianças de **3 a 8 anos**, sob supervisão` | `destinado a crianças de **4 a 8 anos**, sob supervisão` |
| 4 | `docs/legal/TERMS_OF_USE_DRAFT.md` | `faixa etária indicada (3–8 anos)` | `faixa etária indicada (4–8 anos)` |
| 5 | `docs/biblical-review/BIBLICAL_CONTENT_STANDARD.md` | `O app se destina a crianças de 3 a 8 anos. … para que uma criança de 3 anos compreenda o essencial.` | `O app se destina a crianças de 4 a 8 anos. … para que uma criança de aproximadamente 5 anos compreenda o essencial, quando a natureza do conteúdo permitir.` |
| 6 | `docs/biblical-review/BIBLICAL_CONTENT_STANDARD.md` | `Ser acessível a crianças de 3 a 8 anos` | `Ser acessível a crianças de 4 a 8 anos` |
| 7 | `docs/biblical-review/BIBLICAL_CONTENT_STANDARD.md` | `Linguagem de 3–8 anos.` | `Linguagem de 4–8 anos.` |
| 8 | `docs/biblical-review/BIBLICAL_REVIEW_REPORT_TEMPLATE.md` | `\| Faixa etária principal \| 3–8 anos \|` | `\| Faixa etária principal \| 4–8 anos \|` |
| 9 | `docs/biblical-review/BIBLICAL_REVIEW_CHECKLIST.md` | `A lição é expressa em linguagem de 3–8 anos?` | `A lição é expressa em linguagem de 4–8 anos?` |
| 10 | `docs/biblical-review/BIBLICAL_REVIEW_CHECKLIST.md` | `A mensagem é adequada para 3–8 anos?` | `A mensagem é adequada para 4–8 anos?` |
| 11 | `docs/biblical-review/BIBLICAL_REVIEW_RISK_LEVELS.md` | `adequado para a faixa etária 3–8 anos` | `adequado para a faixa etária 4–8 anos` |
| 12 | `docs/biblical-review/BIBLICAL_REVIEW_RISK_LEVELS.md` | `A linguagem é adequada para crianças de 3–8 anos.` | `A linguagem é adequada para crianças de 4–8 anos.` |
| 13 | `docs/biblical-review/BIBLICAL_REVIEW_RISK_LEVELS.md` | `em histórias voltadas para faixa de 3–4 anos.` | `em histórias voltadas para a faixa mais nova do público (4 anos).` |
| 14 | `docs/biblical-review/CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md` | `histórias bíblicas para crianças de 3 a 8 anos de forma segura` | `histórias bíblicas para crianças de 4 a 8 anos de forma segura` |
| 15 | `docs/biblical-review/CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md` | `\| 3–4 anos \| Pensamento mágico, …` | `\| 4 anos (limite inferior da faixa oficial) \| Pensamento mágico, …` |
| 16 | `docs/biblical-review/CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md` | `Crianças de 3 a 8 anos pensam concretamente.` | `Crianças de 4 a 8 anos pensam concretamente.` |
| 17 | `docs/biblical-review/CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md` | `Evitar quando possível em idades 3–4` | `Evitar quando possível com os mais novos da faixa (4 anos)` |
| 18 | `docs/biblical-review/CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md` | `acessível para a faixa 3–8?` | `acessível para a faixa 4–8?` |
| 19 | `docs/biblical-review/TRANSLATION_REFERENCE_POLICY.md` | `produzida especificamente para crianças de 3 a 8 anos.` | `produzida especificamente para crianças de 4 a 8 anos.` |
| 20 | `docs/biblical-review/TRANSLATION_REFERENCE_POLICY.md` | `Clareza para criança de 3–8 anos` | `Clareza para criança de 4–8 anos` |
| 21 | `docs/NARRATOR_PACKAGE/README_NARRADOR.md` | `contada para crianças de **3 a 8 anos**.` | `contada para crianças de **4 a 8 anos**.` |
| 22 | `docs/NARRATOR_PACKAGE/README_NARRADOR.md` | `adequado para crianças de 3 a 8 anos` | `adequado para crianças de 4 a 8 anos` |
| 23 | `docs/NARRATOR_PACKAGE_FINAL_REVISED/DIRECAO_DE_VOZ_E_SONOPLASTIA.md` | `Crianças de 3 a 8 anos. O tom deve ser:` | `Crianças de 4 a 8 anos. O tom deve ser:` |
| 24 | `docs/STORE_RELEASE_READINESS_CHECKLIST.md` | `Classificação etária: 4+ (recomendado para 3-8 anos)` | `Classificação etária: 4+ (recomendado para 4-8 anos)` |

### 3.1 Nota sobre a edição nº 1

`PRODUCT_BLUEPRINT.md` é um documento **superseded** desde 2026-07-21. Seu corpo **não** foi
reescrito. A única alteração é no **banner de supersessão do topo** (linha 5), que já enumerava
definições obsoletas — a Fase 5 apenas acrescentou ali qual é a faixa vigente e por qual decisão.
Isso é anotação de banner, não reescrita de conteúdo histórico. Ver §4.

### 3.2 Nota sobre as edições nº 13, 15 e 17 — subfaixas de desenvolvimento

As três não são declarações da faixa do produto, e sim **subfaixas de desenvolvimento infantil**
herdadas da faixa antiga (`3–4`). Com a faixa oficial em 4 a 8, uma subfaixa `3–4` passa a
descrever, em metade de sua extensão, crianças fora do público.

O tratamento aplicado foi **conservador e não inventivo**: a descrição de desenvolvimento
associada a essas subfaixas (*"pensamento mágico, vocabulário em expansão, atenção curta"*) foi
**preservada integralmente** e apenas o rótulo foi reancorado no limite inferior real da faixa
(4 anos). Com isso a tabela de perfil do público de `CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md` passa a
cobrir exatamente **4 · 5–6 · 7–8**, sem lacuna e sem sobreposição.

Nenhuma descrição de desenvolvimento infantil foi reescrita, reclassificada ou inventada.

### 3.3 Subfaixas que **não** foram alteradas por serem compatíveis

| Ocorrência | Texto | Por que não muda |
|---|---|---|
| `BIBLICAL_REVIEW_CHECKLIST.md:26` | *"compreensível para crianças de 5–8 anos"* | subfaixa **interna** a 4–8; critério de título, compatível com a referência de linguagem de ~5 anos |
| `BIBLICAL_REVIEW_CHECKLIST.md:66` | *"adequadas para crianças de 5 anos"* | é exatamente a referência de linguagem arbitrada |
| `BIBLICAL_REVIEW_CHECKLIST.md:77` | *"memorizável por uma criança de 6–7 anos"* | subfaixa interna a 4–8 |
| `BIBLICAL_REVIEW_RISK_LEVELS.md:42` | *"muito difícil para uma criança de 5 anos"* | é a referência de linguagem arbitrada |
| `BIBLICAL_REVIEW_REPORT_TEMPLATE.md:173` | *"Vocabulário adequado para 5 anos?"* | é a referência de linguagem arbitrada |
| `CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md:20-21` | `5–6 anos`, `7–8 anos` | subfaixas internas a 4–8 |
| `CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md:23` | *"compreensível para crianças de **5 anos**"* | é a referência de linguagem arbitrada, já pré-existente |
| `CHILD_SAFE_BIBLE_LANGUAGE_GUIDE.md:120` | *"Uma criança de 5 anos entenderia…"* | é a referência de linguagem arbitrada |
| `TERMS_OF_USE_DRAFT.md:122` | *"crianças menores de 6 anos nas primeiras sessões"* | regra de supervisão parental, subfaixa interna a 4–8 |

---

## 4. Documentos deliberadamente **NÃO** reescritos

Aplica-se aqui o mesmo princípio já usado no Bloco 0 ao não reescrever a `PL01A-04`: **registro
histórico não se reescreve para caber na decisão nova.** A decisão nova supersede; o registro
permanece legível como foi.

| Arquivo | Ocorrência | Motivo da preservação | Classificação |
|---|---|---|---|
| `PRODUCT_BLUEPRINT.md:17` e `:31` | *"crianças de 3 a 8 anos"*, *"faixa 3–8"* | **corpo** de documento explicitamente marcado `SUPERSEDED — DOCUMENTO HISTÓRICO (não normativo)` desde 2026-07-21, cujo próprio banner declara *"O conteúdo abaixo é preservado apenas como histórico e não foi reescrito"* | histórico preservado |
| `docs/DOCUMENTATION_INDEX.md:104` | *"(mascote "Lumi", faixa 3–8, "3 artes grátis")"* | é uma **citação descritiva** do que o blueprint obsoleto contém, usada para justificar sua obsolescência. Corrigi-la destruiria a própria descrição | citação de obsolescência |
| `docs/biblical-review/SPRINT_19_0_BIBLICAL_GOVERNANCE_REPORT.md:29` | *"Linguagem bíblica segura para 3–8 anos"* | **relatório de sprint concluída** (19.0). Relatórios registram o que foi feito na data, não o que vale hoje | relatório histórico |
| `docs/biblical-review/final-5-revisoes/RELATORIO_FINAL_5_REVISOES_BIBLICAS.md:61` | *"A linguagem foi revisada para crianças de 3 a 8 anos"* | **relato de revisão já executada**; descreve o critério vigente no momento da execução | relatório histórico |
| `docs/APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md:966` | *"Você é um amigo cristão de crianças de 3 a 8 anos…"* | é o **texto de um prompt de IA citado** dentro de uma auditoria, não uma declaração de faixa do produto | citação literal |
| `specs/001-asset-architecture-budget/spec.md:27` | *"crianças de 3 a 8 anos, Brasil-first"* | **artefato SDD de feature já especificada**; specs aprovadas não são reescritas retroativamente | artefato SDD histórico |
| `docs/DECISIONS.md:115` e `:127-133` | `PL01A-04` — *"público 6–8, acessível ~5–10"* | já tratado no Bloco 0: recebeu **banner de supersessão** no eixo etário, com o histórico **integralmente preservado** e as demais determinações da decisão mantidas válidas | supersessão registrada |
| `docs/ACCESSIBILITY_CHILD_UX_AUDIT.md:49`, `docs/APP_360_…:882`, `PRODUCT_BLUEPRINT.md:116` | *"6–8 anos (Descobridores / Jovens da Fé)"* | referem-se a **trilhas do mapa** (`descobridores`, `jovens_da_fe`), não à faixa do produto — ver §6 | eixo distinto |

---

## 5. Divergência de artefato **gerado** — encaminhamento obrigatório

`docs/NARRATOR_PACKAGE/README_NARRADOR.md` (edições 21 e 22) **não é um documento escrito à mão**:
é **gerado** por `scripts/generate-narrator-package.js`, que emite as duas frases nas linhas 93 e 103.

Consequência declarada, sem eufemismo:

> **Enquanto `scripts/generate-narrator-package.js` não for corrigido, qualquer nova execução do
> gerador reverterá silenciosamente as edições 21 e 22 de volta para "3 a 8 anos".**

Por que a Fase 5 **não** corrigiu o gerador: a arbitragem 9 do fundador é explícita —
*"NÃO alterar: src/ scripts/ assets/ App.js app.json eas.json package.json package-lock.json
plugins/."* `scripts/` está na lista de proibição. A Fase 5 não tem autorização para tocar o
gerador, e a existência desta divergência **não** autoriza alteração incidental.

**Verificação complementar:** `docs/NARRATOR_PACKAGE_FINAL_REVISED/DIRECAO_DE_VOZ_E_SONOPLASTIA.md`
(edição 23) **não** é gerado — `scripts/generate-narrator-package-final.js` grava apenas
`ROTEIRO_NARRACAO_FINAL_REVISADO.md`, `ROTEIRO_NARRACAO_FINAL_REVISADO.csv`,
`AUDIO_FILE_MAP_APP_FINAL_REVISED.md` e `VALIDACAO_PACOTE_NARRADOR_FINAL.md`. A edição 23 é,
portanto, estável.

**Encaminhamento E5.1** — ver §9.

---

## 6. Divergência de runtime registrada e encaminhada

`src/data/storyConstants.js:7-22` declara:

```
LEVELS.PEQUENINOS      // comentário: 3–6 anos
LEVELS.DESCOBRIDORES   // comentário: 6–9 anos
LEVELS.JOVENS_DA_FE    // comentário: 9–12 anos

LEVEL_AGE_RANGE = { pequeninos: '3 a 6', descobridores: '6 a 9', jovens_da_fe: '9 a 12' }
```

Três fatos verificados, nesta ordem:

1. As faixas `3–6 / 6–9 / 9–12` cobrem de **3 a 12 anos** e **divergem** da faixa oficial 4 a 8.
2. `LEVEL_AGE_RANGE`, `LEVEL_TITLES` e `LEVELS` **não têm nenhum consumidor** em todo o
   repositório fora do próprio `storyConstants.js`.
3. O módulo `storyConstants.js` **não é importado por nenhum arquivo** de `src/` nem por `App.js`.

Portanto a divergência é real no código e **inalcançável na interface**. Isso corresponde
exatamente ao valor de vocabulário `IMPLEMENTADO SEM CONSUMIDOR` da matriz de riscos.

Distinção que este parecer faz questão de manter: os **identificadores** de trilha
(`pequeninos`, `descobridores`, `jovens_da_fe`) **são** usados — em `adventureMap.js`,
`catalog.js`, `achievements.js` e `stories.js`. O que não é usado são os **rótulos etários**
associados a eles. As trilhas são um eixo de **progressão narrativa**, não de idade; nomear uma
trilha "Jovens da Fé" não afirma que o app é para crianças de 9 a 12 anos.

**Encaminhamento E5.2** — ver §9.

---

## 7. Item deferido ao Bloco 3

`docs/STORE_RELEASE_READINESS_CHECKLIST.md:122` diz:

> `- [ ] Target age group configurado: "Ages 5–8" ou "Ages 6–8" (verificar com equipe)`

Esta linha **não** foi alterada neste bloco, deliberadamente. Motivo: *target age group* é um
campo **de ficha de loja**, cujos valores possíveis são os **buckets oferecidos pela própria
plataforma** — não são texto livre e não são necessariamente iguais à faixa de produto. A
`PL01A-04` já fixou, e a `PF5-FAIXA-ETARIA` manteve, que **classificação de loja ≠ faixa de
produto**.

Resolver este campo exige olhar simultaneamente: os buckets reais de Apple e Google, a decisão de
**4+ fora da Kids Category**, e a contradição já inventariada em
`docs/legal/STORE_COMPLIANCE_CHECKLIST.md:24` (*"Categoria Kids selecionada"*). Isso é matéria do
**Bloco 3 — SDKs e conformidade de lojas**, e lá será resolvido.

**Encaminhamento E5.3** — ver §9.

---

## 8. Parecer por superfície

| # | Superfície | Faixa/linguagem declarada após este bloco | Veredito |
|---|---|---|---|
| 1 | Metadado das 20 histórias (`ageBand`) | `4-8` | **CONFORME** — já estava alinhado antes da Fase 5 |
| 2 | Padrão editorial bíblico | 4 a 8; linguagem ~5 anos | **CONFORME** — reconciliado |
| 3 | Guia de linguagem bíblica segura | 4 a 8; perfil 4 · 5–6 · 7–8; linguagem ~5 anos | **CONFORME** — reconciliado |
| 4 | Checklist e níveis de risco de revisão bíblica | 4 a 8 | **CONFORME** — reconciliado |
| 5 | Modelo de relatório de revisão bíblica | 4–8 anos | **CONFORME** — reconciliado |
| 6 | Política de referência de tradução | 4 a 8 | **CONFORME** — reconciliado |
| 7 | Pacote do narrador (direção de voz) | 4 a 8 | **CONFORME** — reconciliado e estável |
| 8 | Pacote do narrador (README gerado) | 4 a 8 no arquivo; **3 a 8 no gerador** | **CONFORME COM RISCO DE REGRESSÃO** — E5.1 |
| 9 | Política de Privacidade (rascunho) | 4 a 8 | **CONFORME no eixo etário** — os demais eixos são matéria do Bloco 2 |
| 10 | Termos de Uso (rascunho) | 4 a 8 | **CONFORME no eixo etário** — os demais eixos são matéria do Bloco 2 |
| 11 | Checklist de prontidão de loja — classificação | 4+ recomendado para 4-8 | **CONFORME** — reconciliado |
| 12 | Checklist de prontidão de loja — *target age group* | não decidido | **PENDENTE POR DESIGN** — E5.3, Bloco 3 |
| 13 | Constantes de nível por idade no runtime | `3 a 6 / 6 a 9 / 9 a 12` | **DIVERGENTE, SEM CONSUMIDOR** — E5.2 |
| 14 | Campo de turma na Área dos Pais | placeholder `ex.: 4 a 6 anos` | **CONFORME** — campo livre, exemplo dentro da faixa |
| 15 | Blueprint de produto (histórico) | 3–8 no corpo, banner corrigido | **HISTÓRICO PRESERVADO** — por design |

---

## 9. Encaminhamentos deste bloco

Conforme a arbitragem 7 do fundador, cada encaminhamento recebe **um** dos quatro estados
obrigatórios. Nenhum fica sem destino.

| ID | Item | Destino | Estado |
|---|---|---|---|
| **E5.1** | `scripts/generate-narrator-package.js:93,103` ainda emite *"3 a 8 anos"* e reverterá o README do narrador na próxima geração | fase autorizada a alterar `scripts/` — a correção é de **duas strings**, sem mudança de lógica | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.2** | `src/data/storyConstants.js:7-22` declara faixas `3–6 / 6–9 / 9–12`, divergentes de 4 a 8, em módulo **sem nenhum importador** | fase autorizada a alterar `src/`; decidir entre corrigir os rótulos ou remover o módulo morto | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.3** | *Target age group* de loja indefinido (`"Ages 5–8" ou "Ages 6–8"`) e contradição com `STORE_COMPLIANCE_CHECKLIST.md:24` (*"Categoria Kids selecionada"*) | **Bloco 3 desta mesma Fase 5** | **RESOLVIDO NESTA FASE** (no Bloco 3) |
| **E5.4** | Ratificação da supersessão da `PL01A-04` (6–8, acessível ~5–10) pela `PF5-FAIXA-ETARIA` (4 a 8) | fundador, na parada obrigatória do Bloco 5 | **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** |
| **E5.5** | Verificação de que os textos das 20 histórias efetivamente atendem à referência de linguagem de ~5 anos, história a história | processo de revisão bíblica por história (`BIBLICAL_REVIEW_REPORT_TEMPLATE.md`), tratado no **Bloco 4** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.6** | Confirmação de que a faixa 4 a 8 na Política de Privacidade e nos Termos de Uso sobrevive à revisão jurídica | advogado especializado, conforme a nota legal dos próprios rascunhos | **DEPENDENTE DE TERCEIRO EXTERNO** |

---

## 10. O que este bloco **não** fez

1. **Não alterou runtime.** Zero arquivos em `src/`, `scripts/`, `assets/`, `App.js`, `app.json`,
   `eas.json`, `package.json`, `package-lock.json`, `plugins/`.
2. **Não corrigiu** `src/data/storyConstants.js`, mesmo tendo encontrado divergência real ali.
3. **Não corrigiu** `scripts/generate-narrator-package.js`, mesmo sabendo que ele reverterá duas
   das 24 edições.
4. **Não reescreveu** nenhum relatório histórico, spec aprovada, auditoria ou o corpo do
   `PRODUCT_BLUEPRINT.md`.
5. **Não decidiu** o *target age group* de loja — isso é do Bloco 3.
6. **Não declarou ratificada** a supersessão da `PL01A-04`; a marcação de ratificação pendente
   continua ativa.
7. **Não revisou** o conteúdo das 20 histórias quanto à legibilidade real — isso é do Bloco 4.
8. **Não afirmou conformidade jurídica.** Nenhuma frase deste documento diz "legalmente aprovado",
   "100% conforme", "nenhum risco" ou equivalente.

---

**Bloco 1 concluído.** Próximo: **Bloco 2 — Parecer de privacidade e dados**.
