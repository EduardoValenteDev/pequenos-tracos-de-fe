# Fase 5 · Bloco 0 — Abertura, nomenclatura e rastreabilidade

> **Data:** 2026-08-06 · **Branch:** `docs/e015-phase3-artifacts` · **HEAD de entrada:** `1d657a860796baec2727525109a0318999e5020e`
> **Base executável congelada:** `015c438106538595b592981fbe1b80b1d5d65e55`
> **Natureza:** exclusivamente documental. Nenhum arquivo de `src/`, `scripts/`, `assets/`, `App.js`,
> `app.json`, `eas.json`, `package.json`, `package-lock.json` ou `plugins/` foi lido para ser alterado.

## 0. O que este bloco é e o que ele não é

Este é o bloco de **abertura** da Fase 5 do Roteiro Mestre (`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`
§3, linha 241 — *"Infância, privacidade, teologia e medição"*). Ele **não** emite nenhum dos quatro
pareceres da fase. Ele executa apenas as **correções de rastreabilidade** que precisam existir antes
de qualquer parecer, para que os pareceres não herdem erro de nomenclatura, de faixa etária ou de
atribuição de fase.

Este bloco **não** corrige nenhum risco técnico, **não** move nenhuma implementação para a Fase 5 e
**não** declara conformidade jurídica de espécie alguma.

## 1. Subdivisão da Fase 5 — decisão do fundador

**A Fase 5 NÃO é subdividida.** Não existem, não passam a existir e não serão criadas as designações
`Fase 5A`, `Fase 5B` ou `Fase 5C`. A fase é executada em **blocos documentais internos** (Bloco 0 a
Bloco 7), que são unidades de trabalho deste artefato e **não** um eixo de nomenclatura do roadmap.

O árbitro de sequência (`v5` §3) contém exatamente **duas** ocorrências de "Fase 5" — linha 234 e
linha 241 — e **nenhuma** ocorrência de `5A`, `5B`, `5C`, `5.1`, `5.2` ou `5.3`. A subdivisão nunca
existiu no árbitro.

### 1.1 Correção da nomenclatura herdada — declarada, não silenciosa

A auditoria de entrada da Fase 5 relatou ao fundador **uma** ocorrência de "Fase 5C" no corpus. A
varredura executada neste bloco, imediatamente antes da escrita, encontrou **duas**.

| # | Arquivo e linha | Texto original | Texto corrigido | Situação na auditoria de entrada |
|---|---|---|---|---|
| 1 | `docs/DECISIONS.md:1585` | *"…têm aprofundamento na **Fase 5C**."* | *"…têm aprofundamento na **Fase 5**."* | **relatada** ao fundador |
| 2 | `docs/fase4-product-lock/05_PRODUCT_LOCK_4E_…md:2155` | *"Aprofundamento na **Fase 5C**."* | *"Aprofundamento na **Fase 5**."* | **NÃO relatada** — omissão da auditoria de entrada |

**Declaração de divergência de contagem, sem ajuste silencioso.** A contagem que estava errada é a da
auditoria de entrada da Fase 5, que declarou uma única ocorrência. A contagem correta é **duas**. A
divergência ocorreu porque a auditoria de entrada procurou a expressão apenas no árbitro de decisões
(`DECISIONS.md`) e no árbitro de sequência (`v5`), e **não** varreu o artefato consolidado da Fase 4E,
que é a origem real do erro — a linha 1585 do `DECISIONS.md` é o **reflexo** da linha 2155 do artefato
4E, e não a fonte. Ambas foram corrigidas neste bloco.

**O que a correção não faz:** não altera a `v5`; não cria subfases retroativas; não introduz eixo novo
de nomenclatura; não altera o conteúdo material da decisão (política de oração e neutralidade
denominacional continuam com aprofundamento devido nesta fase — Bloco 4).

## 2. Faixa etária — congelamento em 4 a 8 anos e conflito canônico declarado

### 2.1 A decisão vigente

**Faixa oficial do produto: 4 a 8 anos.** Congelada por decisão do fundador em **2026-08-06**, na
abertura da Fase 5.

**Referência de linguagem** (que **não** é faixa etária): texto simples e compreensível, idealmente
acessível a uma criança de aproximadamente **5 anos**, quando a natureza do conteúdo permitir.

O campo `ageBand: '4-8'` presente nas **20** histórias de `src/data/stories.js` está **alinhado** com a
decisão e **não deve ser alterado**. Nenhuma alteração de runtime decorre desta decisão.

### 2.2 O conflito canônico encontrado — declarado, não resolvido silenciosamente

A auditoria de entrada apresentou ao fundador a divergência como sendo entre **"3 a 8"** (maioria dos
documentos) e **"4-8"** (código). O fundador arbitrou **4 a 8** com base nesse enquadramento.

**Durante a execução deste bloco foi encontrado um terceiro valor, registrado no próprio árbitro de
decisões de produto e marcado como reversão estratégica**, que a auditoria de entrada não havia
surfaceado:

> `docs/DECISIONS.md:127-133` — **`PL01A-04 · Público 6–8 (acessível ~5–10) — 🔄 REVERSÃO ESTRATÉGICA (público)`**, de **2026-07-21**:
> *"**Decisão:** público **principal oficial = crianças de 6 a 8 anos**; experiência **acessível ~5 a 10**."*
> *"**Substitui/revoga:** **reverte** a orientação **3–8** (primário 3–6) do `PRODUCT_BLUEPRINT.md` (agora SUPERSEDED). Loja segue **4+ / fora da Kids Category** (E1) — classificação de loja ≠ faixa de produto."*

Coexistem, portanto, **quatro** faixas no corpus:

| Faixa | Onde | Natureza |
|---|---|---|
| **4 a 8** | `src/data/stories.js` (20 histórias, `ageBand: '4-8'`) · `docs/UX_POLISH_GUIDE.md:125` | código + doc |
| **3 a 8** | maioria dos documentos de produto | doc |
| **6 a 8** (acessível ~5–10) | `docs/DECISIONS.md:127-133` (`PL01A-04`, 2026-07-21) | **árbitro de decisões de produto** |
| 3-6 / 6-9 / 9-12 | `src/data/storyConstants.js:8-23` (`pequeninos`, `descobridores`, `jovens_da_fe`) | código, taxonomia interna |

Essa inconsistência **não possui código `P` na matriz canônica** — nenhuma linha de `P-01` a `P-148`
registra divergência de faixa etária.

### 2.3 Como o conflito é tratado neste bloco

**Resolução por precedência, aplicada e declarada.** A decisão do fundador de **2026-08-06** é
posterior à `PL01A-04` (2026-07-21) e provém da mesma autoridade que registrou a `PL01A-04`. Ela
supersede a `PL01A-04` pelo **mesmo mecanismo** com que a `PL01A-04` superseou a orientação 3–8 do
`PRODUCT_BLUEPRINT.md`. A faixa **4 a 8** passa a valer, e a `PL01A-04` fica **superseded no eixo de
faixa etária**.

**O registro histórico da `PL01A-04` NÃO é reescrito.** Ela permanece no `DECISIONS.md` com seu texto
original; recebe apenas uma **marca de supersessão** apontando para a decisão da Fase 5. As demais
determinações da `PL01A-04` — *sem coleta de idade*, *sem perfis etários*, *loja 4+ fora da Kids
Category*, *classificação de loja ≠ faixa de produto* — **continuam integralmente válidas** e não são
tocadas.

> ⚠️ **RATIFICAÇÃO PENDENTE DO FUNDADOR.** O fundador arbitrou "4 a 8" **sem ter sido informado** da
> existência da `PL01A-04`, porque a auditoria de entrada não a encontrou. A supersessão é aplicada
> aqui por precedência temporal e de autoridade, mas **fica formalmente sujeita a ratificação
> explícita**, que será apresentada junto com o plano de medição (ponto de parada obrigatório da
> Fase 5). Se o fundador não ratificar, a reconciliação documental do Bloco 1 deverá ser refeita.
> Esta pendência é **declarada**, não presumida resolvida.

## 3. `P-92` — reconciliação de redação sem deslocar a implementação

**A coluna canônica `Fase implementação = 20` continua sendo a proprietária da correção técnica do
manifesto de privacidade.** Ela **não** é alterada por este bloco.

A célula de Observação de `P-92` terminava com a frase herdada da Fase 4E *"implementação pendente nas
Fases 5 e 19"*. Essa frase descreve o **pacote de decisões da Fase 4E** como um todo — o mesmo texto
aparece em `P-85` —, e **não** a fase proprietária deste risco. Lida sobre `P-92`, ela contradizia a
própria coluna canônica da linha.

**Reconciliação aplicada, sem apagar o histórico:** o texto herdado permanece na célula e recebe uma
cláusula de correção explícita que distingue os dois papéis:

- **Fase 5:** emite **parecer e especificação** sobre o manifesto de privacidade — o que o app declara
  coletar, o que de fato coleta, e qual `NSPrivacyAccessedAPITypes`/reason é verdadeiro.
- **Fase 20:** permanece proprietária da **implementação técnica e da validação**.
- **Fase 19:** **não** é proprietária deste risco.

**O que a Fase 5 explicitamente NÃO faz em `P-92`:** não registra plugin em `app.json`; não move a
implementação para a Fase 5; não move a implementação para a Fase 19; não marca o risco como
corrigido; não altera `plugins/withPrivacyManifest.js`.

Fatos preservados para a fase proprietária: o plugin `plugins/withPrivacyManifest.js` **não** consta do
array de plugins de `app.json:60-71` (que lista apenas `expo-font`, `expo-audio`, `expo-asset`); o
plugin escreveria a reason `1C8F.1` enquanto `app.json:26-38` já declara `CA92.1`.

## 4. `P-85` — distinção de fases registrada, sem reclassificação silenciosa

A coluna `Fase implementação = 5` de `P-85` **não** é alterada, e a tensão com a implementação de
runtime na Fase 19 **não** é resolvida por reclassificação. Ela é **registrada**:

- **Fase 5 (esta fase) entrega:** especificação do plano de medição anônima, taxonomia de eventos,
  campos permitidos, política de retenção, mecanismo de desligamento e critérios de privacidade. É
  isso que a coluna `Fase implementação = 5` representa — a entrega da Fase 5 é **documento**, porque
  o critério de saída da Fase 5 na `v5:249` é *"plano de medição anônima aprovado"*.
- **Fase 19 implementa** o runtime correspondente.

Nenhuma linha de código de analytics é escrita nesta fase. Nenhum identificador remoto é criado.
`src/services/performanceTrace.js`, `eas.json` e `app.json` permanecem intocados. Nenhuma telemetria é
habilitada em build.

## 5. `P-149` — criação autorizada, com auditoria de deduplicação prévia

### 5.1 Auditoria de deduplicação contra `P-01` a `P-148`

Antes de criar qualquer código novo, as **25 subtabelas por natureza** da §14 da matriz canônica foram
varridas integralmente. **Nenhuma linha de `P-01` a `P-148` cobre materialmente** o fato descrito
abaixo. Candidatos próximos foram examinados e **rejeitados** com motivo:

| Candidato | Por que **não** cobre |
|---|---|
| `P-92` | trata do **artefato de build** (plugin órfão, manifesto não aplicado). Não trata de **texto exibido à família** |
| `P-64` · `P-65` | tratam de promessas de **armazenamento** divergentes do limite real, não de tráfego de rede |
| `P-144` · `P-145` | tratam de **capacidade ausente** e de **aviso ausente**, não de afirmação falsa presente |
| `P-85` | trata da **ausência** de telemetria, que é o oposto do fato aqui |
| `P-120` a `P-134`, `P-137`, `P-138` | tratam de **schema e integridade** de manifesto, não do texto da Área dos Pais |

Nenhuma linha da §14 cita `globalManifestService.js:211`, a variável
`EXPO_PUBLIC_GLOBAL_MANIFEST_URL`, ou as linhas 890, 896, 911 e 1104 de `ParentAreaScreen.js`.

**Veredito: não existe cobertura material. `P-149` está justificado.**

### 5.2 O fato

`src/screens/ParentAreaScreen.js` afirma à família, nas linhas **890**, **896**, **911** e **1104**,
que o aplicativo não envia dados e funciona sem internet. `src/services/globalManifestService.js:211`
executa `const res = await fetch(trimmed, …)` sobre a URL de
`EXPO_PUBLIC_GLOBAL_MANIFEST_URL`, que está declarada **no perfil `production` do `eas.json`** e em
`.env:29`.

**Distinção que o risco preserva** (e que o texto substituto do Bloco 6 deve respeitar): *"não enviar
dados pessoais da criança"* é **verdadeiro e verificável**; *"não realizar tráfego de rede"* é
**falso**. A requisição é um `GET` sem corpo e sem identificador de usuário na carga de saída — ou
seja, o produto **não** envia dados pessoais da criança, mas **realiza** tráfego de rede.

### 5.3 Contratos da linha, conforme arbitrados pelo fundador

| Campo | Valor |
|---|---|
| Natureza primária | **PRIVACIDADE** |
| Natureza secundária | UI E RESPONSIVIDADE |
| Status | `ABERTO` |
| Fase decisão | `-` — nenhuma. O contrato de veracidade já foi fechado na Fase 4E |
| Fase implementação | **7** (Onboarding, Home e Área dos Pais — `v5:267`) |
| Revalidação | 21 |
| Validação física | `VFP` · `TEL` — futura, visual, em aparelho |
| Product Lock | `INFORMA O PRODUCT LOCK` — **não** volta a exigir decisão de produto |
| Lançamento | `PODE BLOQUEAR LANÇAMENTO`, pelo critério **2** (privacidade ou obrigação legal) da §11, **com a evidência faltante registrada na Observação**, conforme a regra da §11 e a prova `S1` |

**Sobre a classificação de lançamento, sem inventar certeza jurídica.** A classificação
`PODE BLOQUEAR LANÇAMENTO` é a única compatível com os critérios existentes: o critério 2 se aplica ao
fato, e a regra da §11 exige que todo `PODE BLOQUEAR` registre a **evidência que falta**. A evidência
que falta é precisamente a análise jurídica e de política de loja — que esta fase está **proibida** de
declarar concluída. Classificar como `BLOQUEIA LANÇAMENTO` afirmaria certeza jurídica inexistente;
classificar como `NÃO BLOQUEIA` afirmaria ausência de risco igualmente inexistente.

### 5.4 O que a criação de `P-149` não faz

Não renumera nenhum código. Não funde nada. Não altera nenhum campo de `P-01` a `P-148` além das
anotações declaradas nas §3 e §4 deste bloco. **Não corrige o risco técnico** — a implementação é da
Fase 7. Não autoriza alteração incidental de `ParentAreaScreen.js` nesta fase.

## 6. Recontagem manual e auditada dos blocos derivados da matriz

**A recontagem foi feita manualmente, linha a linha, sobre a tabela da §14.** O *"gerador
determinístico"* citado nos commits das Fases 4A a 4D **não existe neste repositório** e **não** foi
executado.

### 6.1 Totais alterados — todos por consequência direta da criação de `P-149`

| Bloco derivado | Antes | Depois |
|---|--:|--:|
| Cabeçalho de metadados — Total de riscos | 148 | **149** |
| §14 — `### PRIVACIDADE` | 1 risco | **2 riscos** |
| §15 item 1 — Total bruto de códigos | 148 | **149** |
| §15 item 2 — Riscos distintos após deduplicação | 148 | **149** |
| §15 item 6 — `ABERTO` | 102 | **103** |
| §15 item 12 — `PODE BLOQUEAR LANÇAMENTO` | 44 | **45** |
| §15 totais por fase proprietária — Fase 7 | 6 | **7** |
| §15 totais por natureza primária — PRIVACIDADE | 1 | **2** |
| §15 totais por classificação transversal — ALTO | 42 | **43** |
| §15 totais por status — `ABERTO` | 102 | **103** |
| §15 totais por Product Lock — `INFORMA O PRODUCT LOCK` | 92 | **93** |
| §15 validações físicas — `EXIGE VALIDAÇÃO FÍSICA NA FASE PROPRIETÁRIA` | 113 | **114** |
| §15 validações físicas — `EXIGE VALIDAÇÃO EM TELEFONE` | 101 | **102** |
| §16 prova 1 — sequência sem lacunas | até `P-148` | até **`P-149`** |
| §16 prova 2 — uma linha por código | 148 / 148 | **149 / 149** |
| §16 prova 6 — riscos não encerrados com fase proprietária | 138 | **139** |
| §16 provas 7, 8, 9 e 10 | 148/148 | **149/149** |
| §16 prova `S1` — `PODE BLOQUEAR` com evidência faltante | 44/44 | **45/45** |
| §17 lista `PODE BLOQUEAR LANÇAMENTO` | 44 códigos | **45** (entra `P-149`) |

**Conferência da soma por natureza primária:** 8+14+4+4+6+5+11+6+16+15+2+5+4+2+4+2+3+6+**2**+3+5+1+7+9+4+1 = **149**. ✔

**Conferência da soma por fase proprietária:** os 17 valores da tabela somam 148 antes e **149**
depois, com a Fase 7 subindo de 6 para 7. ✔

### 6.2 Blocos derivados conferidos e **inalterados**, com o motivo

| Bloco | Motivo de não mudar |
|---|---|
| Cabeçalho — Fusões realizadas: **0** | `P-149` é acréscimo puro |
| Cabeçalho — Renumerações: **0** | nenhum código foi renumerado |
| §11.2 — os cinco bloqueadores de lançamento | `P-149` é `PODE BLOQUEAR`, não `BLOQUEIA` |
| §11.3 — rebaixamentos | nenhum rebaixamento ocorreu |
| §12 — reconferência individual | `P-149` não pertence ao conjunto da ETAPA 12 |
| §15 itens 3, 4, 5, 7, 8, 9, 10, 11, 13, 14 | `P-149` não é fundido, `CORRIGIDO`, `REFUTADO`, `DOCUMENTAL`, `INTERNO`, `Fase decisão = 4`, `BLOQUEIA PRODUCT LOCK`, `POSTERIOR` nem `NÃO DETERMINADO` |
| §15 demais tokens de validação física | `P-149` recebe apenas `VFP` e `TEL` |
| §16 prova 3 | os 131 herdados continuam presentes |
| §16 prova 12 | enumera as divergências **de schema**; `P-149` não é divergência de schema, por isso **não** entra na lista |
| §16 prova `S2` — 124 códigos referenciados, 0 órfãos | `P-149` referencia `P-92` e `P-64`, **ambos já referenciados** antes; o conjunto de códigos referenciados não muda |
| §17 lista `NÃO EXIGE VALIDAÇÃO FÍSICA` (35) | `P-149` exige validação física |
| §17 demais listas | `P-149` não pertence a nenhuma delas |
| §18 a §28 | registros históricos das fases anteriores, que esta fase não reescreve |

## 7. Divergência herdada — status declarado, não corrigido

A §11.2 da matriz cita `planConfig.js:40-56` para `P-24`; a releitura do arquivo mostra que o bloco
`PLAN_PRICING` termina em **`:55`**. A referência já foi corrigida no artefato da Fase 4E e
**permanece não corrigida na matriz**, por tocar o registro de um bloqueador de lançamento fora do
escopo desta fase — exatamente como a §28.4 registrou.

**Status na Fase 5: continua NÃO CORRIGIDA, deliberadamente.** A Fase 5 confirma o registro e não o
altera. Destino: fase proprietária de `P-24` (Fase 18).

## 8. Alterações efetivamente aplicadas por este bloco

| Arquivo | Alteração |
|---|---|
| `docs/fase5-pareceres/00_ABERTURA_E_RASTREABILIDADE.md` | criado (este documento) |
| `docs/DECISIONS.md` | linha 1585: "Fase 5C" → "Fase 5" · marca de supersessão em `PL01A-04` · atualização da faixa de códigos `P-01` a `P-149` · bloco `PF5` de abertura |
| `docs/fase4-product-lock/05_PRODUCT_LOCK_4E_…md` | linha 2155: "Fase 5C" → "Fase 5" |
| `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` | criação de `P-149` · anotação em `P-92` · anotação em `P-85` · recontagem dos blocos derivados · §29 |

**Nenhum arquivo executável foi alterado.** `src/`, `scripts/`, `assets/`, `App.js`, `app.json`,
`eas.json`, `package.json`, `package-lock.json` e `plugins/` permanecem byte a byte idênticos ao
commit canônico `015c438106538595b592981fbe1b80b1d5d65e55`.

## 9. O que este bloco explicitamente NÃO fez

Não criou subfases. Não alterou a `v5`. Não alterou `ageBand` em nenhuma história. Não moveu a
implementação de `P-92` da Fase 20. Não moveu a implementação de `P-85` para fora do par
Fase 5 (especificação) / Fase 19 (runtime). Não marcou nenhum risco como `CORRIGIDO`. Não renumerou.
Não declarou conformidade jurídica. Não declarou *"legalmente aprovado"*, *"100% conforme"*,
*"nenhum risco"* nem *"anonimização garantida"*. Não instalou dependência, não executou Metro, não
gerou build, não instalou aplicativo, não executou validação física, não fez push e não fez merge.
