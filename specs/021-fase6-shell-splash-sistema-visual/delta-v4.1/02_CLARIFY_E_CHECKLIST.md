# F6-DELTA0 · Clarify e *Checklist* de requisitos

> **Etapas SDD 2 e 3** aplicadas ao delta
> [`01_SPEC_DELTA_F6_R1_R2_R3.md`](01_SPEC_DELTA_F6_R1_R2_R3.md).
>
> **🔁 EMENDADO em 2026-08-08 pelo Portão Humano 1.** `Q1` e `Q2` — as duas **bloqueantes** — foram
> **RESOLVIDAS** pelo fundador e estão registradas abaixo com o **texto congelado**. `Q3` a `Q7`
> permanecem expostas na íntegra, cada uma com **pergunta · opções · recomendação · natureza
> (decisão do fundador × resolvível no PLAN) · relação com `D`/`P`/`E`**, e com as **direções
> congeladas** que o fundador impôs a `Q4`, `Q6` e `Q7`. **Nenhuma autorização de Plan, Tasks,
> Analyze ou Implement foi concedida.**
>
> **Regra de disciplina aplicada:** as decisões `D1`–`D18` do fundador **não** são reabertas. Uma
> pergunta só entra neste Clarify se for **genuinamente aberta** ou se houver **conflito técnico
> comprovado por código** com uma decisão — e nesse caso o conflito é apresentado com a prova, não
> com opinião. Nenhuma pergunta abaixo pede ao fundador que reconsidere algo que ele já decidiu.

---

## 1. Perguntas — situação após o Portão Humano 1 (2026-08-08)

| Questão | Situação | Onde vive a decisão |
|---|---|---|
| `Q1` — identidade `E` × `P` | ✅ **RESOLVIDA** | `DECISIONS.md` §`PF6D-Q1` |
| `Q2` — canvas e rotação | ✅ **RESOLVIDA** | `DECISIONS.md` §`PF6D-D-CANVAS`; *spec* `F6-R3.5` |
| `Q3` — faixa expandida | 🟡 **ABERTA** — decisão do fundador, com maquete | Portão 2 |
| `Q4` — `grid` / `displayScaleTablet` | 🟡 **ABERTA** — **direção congelada** abaixo | Portão 2 |
| `Q5` — onde vive a âncora | ⚙️ **RESOLVÍVEL TECNICAMENTE no PLAN** | Etapa PLAN |
| `Q6` — `0.58` × `0.5` | 🟡 **ABERTA** — **direção congelada** abaixo | Portão 2, com captura |
| `Q7` — `P-103` | ⏸️ **DIFERIDA à Fase 7** — **não reclassificar agora** | Fase 7 |

### `Q1` · Identidade dos códigos novos — a série `E` × a matriz `P` · ✅ **RESOLVIDA**

> **Decisão do fundador, congelada em 2026-08-08 (Portão Humano 1, item 1):**
>
> - **`E000–E089` = eixo EXECUTIVO** do roteiro mestre.
> - **`P-01–P-167` = eixo de RISCOS E PENDÊNCIAS.**
>
> São **taxonomias paralelas** e **não possuem relação obrigatoriamente 1:1**. Um `E` pode depender
> de **vários** `P`. Um `P` pode aparecer ou revalidar-se em **vários** `E`. **Os `P` NÃO
> substituem, NÃO renumeram e NÃO absorvem os `E`.**
>
> A **ausência material** de `E000–E089` neste repositório **NÃO autoriza**: inventar entradas
> faltantes · recriar a série · migrar `E` para `P` · substituir o *checklist* mestre.
>
> **A ponte declarada adotada no `F6-DELTA0` está APROVADA.** *Crosswalks* como `E028-R3 → P-152`
> podem ser registrados **sem alterar a identidade de nenhum dos dois eixos**.
> `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` permanece o **árbitro da sequência de fases**.

**Efeito sobre a opção que eu havia proposto:** a saída **(a)** (*"os rótulos `F6-*` são apelidos,
os números `P` mandam"*) fica **parcialmente corrigida** — os `P` mandam **dentro do eixo de
riscos**, e **não** sobre o eixo executivo `E`, que não lhes é subordinado. As opções **(b)** e
**(c)** não foram adotadas: a série `E` **não** é importada nem declarada inexistente; ela vive no
*checklist* mestre e é **ponteada**, não absorvida.

**Registro histórico da pergunta, preservado:**

### ~~`Q1` — enunciado original~~ **[era BLOQUEANTE]**

**O fato.** O prompt determina *"preservar as 22 fases e os códigos `E000–E089`"*. A varredura
exaustiva de `docs/` e `specs/` neste HEAD devolve apenas `E003–E018`, `E022`, `E023`, `E039`,
`E042`, `E075`, `E076`, `E077`. **`E028`, `E032`, `E034`, `E035`, `E036`, `E049`, `E050`, `E052`,
`E053`, `E055`, `E066`–`E072` e `E078`–`E089` não existem neste repositório.** O próprio
`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:282` afirma textualmente que `E039` e `E042` *"**não**
possuem representação versionada neste repositório"*.

A identidade canônica de pendência aqui é a matriz **`P-01..P-149`**, adotada em `E018` como
**única** fonte de riscos, precisamente para acabar com esquemas concorrentes (matriz §22).

**O que fiz, provisoriamente.** Registrei os 18 achados como **`P-150` a `P-167`** na matriz
canônica, **preservando os rótulos `F6-*` / `F7-*` / `F9-*` / `F12A-*` do fundador como aliases
canônicos** na coluna "Aliases e relações" — o mesmo mecanismo já usado para absorver a série `R`
em `E018` §22. Nenhum código foi renumerado; nenhum esquema concorrente foi criado.

**O que preciso do fundador.** Confirmar **uma** das três:
- **(a)** A solução acima é a canônica — os rótulos `F6-*` são apelidos, os números `P` mandam.
- **(b)** A série `E` deve ser **importada** para o repositório como eixo versionado próprio, com
  mapeamento declarado para os códigos `P`.
- **(c)** A série `E` permanece **exclusivamente** no *checklist* mestre externo do fundador e este
  repositório nunca a versiona.

**Por que bloqueia.** Sem essa definição, o *checklist* do delta (`E028-R1..R9` etc., §5 abaixo)
não tem onde viver de forma rastreável, e o item 4 do escopo — *"atualizar a matriz oficial"* —
fica sem contrato de identidade.

---

### `Q2` · Orientação nas superfícies de canvas · ✅ **RESOLVIDA — política canônica congelada**

> **Decisão do fundador, texto literal, congelado em 2026-08-08 (Portão Humano 1, item 2):**
>
> *"A obra da criança possui um espaço lógico próprio e imutável. A janela é apenas uma viewport
> desse espaço. Rotação, resize, multitarefa, AppState, Control Center, background/foreground ou
> qualquer mudança de viewport NÃO podem alterar, reinicializar ou corromper as
> coordenadas/dimensões lógicas da obra."*

**Colorir / raster:** *backing*/canvas lógico atrelado à **dimensão canônica da arte** · **não**
redimensionar destrutivamente o conteúdo na mudança de *viewport* · **não** recriar `paint`/buffers
só porque a tela mudou · a *viewport* recalcula **apenas a transformação de apresentação** · toque e
*hit testing* convertem **tela → coordenadas canônicas** · preservar proporção ·
*letterbox*/*pillarbox* quando necessário · **sem perda silenciosa, sem corrupção de balde, sem
pintura desalinhada do traço**.

**Criar Livre / vetor:** traços e carimbos **não** dependem permanentemente de pixels da *viewport*
corrente · coordenadas lógicas **canônicas ou normalizadas** · `resize`/orientação apenas
**reprojetam a apresentação** · **compatibilidade com os dados existentes definida ANTES** de
qualquer migração · **nenhuma migração destrutiva**.

**REGRA ABSOLUTA: `SD-8` continua bloqueador — ZERO perda ou corrupção de obra infantil.**

**Efeito sobre as opções que eu havia proposto — todas as três ficam superadas:**

| Opção original | Situação |
|---|---|
| **(a)** congelar Colorir e Ateliê em retrato até a Fase 9 — *era minha recomendação* | ❌ **REJEITADA.** *"Não é aceitável resolver `D1` simplesmente bloqueando as telas criativas em portrait."* |
| **(b)** rotacionar descartando a arte com aviso | ❌ **REJEITADA** — viola `SD-8` frontalmente |
| **(c)** preservação de arte sob `resize` dentro da F6 | ✅ **É o caminho** — e o receio de *"puxar escopo da Fase 9"* foi endereçado pela **exceção formal e estreita** do item 3 (`PF6D-EXC-R3`), que autoriza **apenas** as primitivas técnicas indispensáveis e **proíbe** antecipar qualquer escopo de produto de F9/F12A |

**O fato de código que motivou a pergunta, preservado.** `src/screens/AtelierCanvasScreen.js:6`
declara textualmente: *"NUNCA redimensionam o canvas (o motor é uma WebView; mudar o tamanho
reinicia o desenho)."* A auditoria §5.2 confirma que `ColoringCanvas.resize()` **não** recalcula
`baseD`, `paintD`, `imgX/imgY/imgW/imgH` nem `qBuf`/`visBuf`. **É exatamente o contrato acima que o
código de hoje viola.**

---

### `Q3` · Faixa expandida — painel de apoio × grade **[ABERTA · NÃO BLOQUEANTE]**

- **Pergunta.** `D3` fixa as quatro famílias e `D10` fixa a composição do Leitor em paisagem. O que
  **não** está decidido é o comportamento da família **Hub** em `>=900dp`: **grade mais larga**
  (mais colunas) ou **painel de apoio** (lista + detalhe, o *layout* canônico de *supporting pane*
  do Material 3)? Afeta **Início, Brincar, Estrelinhas e Galeria**.
- **Opções.** **(a)** grade mais larga — mais simples, reaproveita a composição de retrato;
  **(b)** painel de apoio — usa melhor a largura do iPad e é coerente com `D10`, que já escolheu
  painel de apoio para o Leitor em paisagem; **(c)** misto, por superfície.
- **Recomendação.** **(b)** para superfícies com hierarquia lista→detalhe e **(a)** para as
  puramente de grade — ou seja, **(c)** aplicado com critério, não uniformemente. Justificativa:
  `D10` já estabeleceu o precedente do painel de apoio no tablet em paisagem; repetir o padrão
  reduz vocabulário visual novo.
- **Natureza.** **Exige decisão do fundador** — é escolha de **produto e composição visual**, não
  técnica. **Decidir no Portão 2, com maquete.**
- **Relação.** `D3` (quatro famílias) · `D10` (Leitor em paisagem) · `P-151` (`F6-RSP-02`, ausência
  do modelo de três faixas) · `F6-R1.2` e `F6-R1.3` da *spec*.

---

### `Q4` · `grid` e `displayScaleTablet` — consumir ou aposentar **[ABERTA · direção congelada]**

- **Pergunta.** Ambos existem em `src/theme/tokens.js` §2.4 com **zero consumidores**. `F6-R1.3`
  exige que deixem de ser *"declarados e inertes"*. Ganham consumidor real ou são aposentados?
- **Opções.** **(a)** dar consumidor real em `F6-R1`; **(b)** declarar aposentados, com registro;
  **(c)** manter como estão — **inadmissível**, é exatamente a natureza de `P-82`/`P-148`, código
  declarado e morto.
- **Recomendação.** **(a)**, condicionada: se o *Adaptive Surface System* de `F6-R1` **usar** esses
  *tokens*, eles passam a ter consumidor e a pendência fecha naturalmente.
- **⛔ DIREÇÃO CONGELADA PELO FUNDADOR (Portão 1, item 10):** **não remover os *tokens* apenas por
  não terem consumidor antes de determinar se o novo *Adaptive Surface System* vai usá-los.** A
  opção **(b)** fica, portanto, **subordinada** — só pode ser considerada **depois** que `F6-R1`
  definir o sistema, nunca antes.
- **Natureza.** **Resolvível tecnicamente no PLAN**, na ordem imposta acima: primeiro decidir o
  sistema, depois julgar os *tokens*.
- **Relação.** `AD-4` da auditoria · `P-82` e `P-148` (mesma natureza) · `F6-R1.3` · `D2`.

---

### `Q5` · Onde vive a âncora canônica do mapa **[RESOLVÍVEL NO PLAN]**

- **Pergunta.** `D11` fixa que a âncora **existe e é única** — *"uma âncora canônica controla pino,
  alvo de toque, brilho, *scroll* e holofote"* — mas **não** fixa **onde** ela vive.
- **Opções.** **(a)** estender `src/services/guideTargetRegistry.js`, que já é registro global de
  alvos mensuráveis, já serve ao tour e já tem `measureGuideTarget`; **(b)** criar
  `src/services/mapAnchorRegistry.js`, separando geometria de mapa de alvos de guia.
- **Recomendação.** **(a)** para registro e medição, mantendo a **derivação** de coordenada em
  `src/data/adventureMap.js`. Evita um **terceiro** sistema de geometria e obedece à regra de
  governança *"estender o que existe antes de criar paralelo"*.
- **Natureza.** **Resolvível tecnicamente na etapa PLAN.** **Não exige decisão do fundador** — é
  escolha de arquitetura interna, sem efeito observável no produto.
- **Relação.** `D11` · `P-154` (`F6-MAP-01`) · `P-157` (Fase 7, depende de `F6-R2`) · `F6-R2.1` e
  `F6-R2.4`.

---

### `Q6` · Fator único de enquadramento — `0.58` ou `0.5` **[ABERTA · direção congelada]**

- **Pergunta.** `F6-R2.2` exige **um** fator de enquadramento. Hoje há **dois**: `0.58` (câmera,
  majoritário) e `0.5`. Qual sobrevive?
- **Opções.** **(a)** `0.58` — põe o pino ligeiramente acima do centro, é o comportamento hoje
  dominante; **(b)** `0.5` — centra exatamente; **(c)** um terceiro valor, escolhido por captura.
- **Recomendação.** Decidir por **captura comparativa em aparelho real**, nas três faixas — a
  diferença é **perceptual**, e nenhum argumento estático a resolve honestamente.
- **⛔ DIREÇÃO CONGELADA PELO FUNDADOR (Portão 1, item 10):** **a duplicação `0.58`/`0.5` não pode
  sobreviver como duas verdades.** `F6-R2` **tem** de chegar a **uma geometria canônica**. Qual das
  duas vence é aberto; **que reste apenas uma, não é**.
- **Natureza.** **Exige decisão do fundador** — é julgamento **visual**. Mas o **requisito de
  unicidade** já está decidido e não se rediscute.
- **Relação.** `D11` (âncora única) · `D12` (primeira experiência centra "Comece Aqui") ·
  `P-154` · `F6-R2.2` · `SD-5` e `SD-6`.

---

### `Q7` · Divergência `P-103` × comportamento observado **[DIFERIDA À FASE 7]**

- **Pergunta.** A matriz classifica `P-103` como `IMPLEMENTADO SEM CONSUMIDOR` (*"`ADVENTURES_GUIDE`
  sem consumidor e `BeniAppTour` órfão"*). Porém o tour de Aventuras **executa em aparelho**, e
  `isAdventureTourActive()` é consumido por `AppNavigator.js:291` e pela `TabletSidebar`. A
  classificação ainda descreve a realidade?
- **Opções.** **(a)** manter `IMPLEMENTADO SEM CONSUMIDOR` e resolver na Fase 7; **(b)**
  reclassificar agora, com base no comportamento observado; **(c)** desdobrar em dois códigos,
  separando `ADVENTURES_GUIDE` de `BeniAppTour`.
- **Recomendação.** **(a)**. Reclassificar exigiria evidência que esta auditoria **não produziu** —
  e a regra do projeto é **não reclassificar pendência sem prova**.
- **✅ DECISÃO DO FUNDADOR (Portão 1, item 8), congelada:** *"Sua decisão foi correta. NÃO
  reclassifique `P-103` agora. Permanece encaminhado para a Fase 7."* **`Q7` fica DIFERIDA, sem
  reclassificação.**
- **Natureza.** **Já decidida** — não exige nova decisão do fundador nem trabalho no PLAN. Volta a
  ser questão viva **na Fase 7**.
- **Relação.** `AD-2` da auditoria · `P-103` · `P-155` (`F7-ONB-01`) · `D12` · `D13`.

---

## 2. Perguntas que **NÃO** faço — e por quê

| Não pergunto | Porque |
|---|---|
| Se telefones devem girar | `D1` decidiu. Sem conflito técnico. |
| Se o *layout* pode olhar o modelo do aparelho | `D2` decidiu. A auditoria §2.1 mostra que a mecânica reativa **já existe** — não há obstáculo técnico. |
| Quantas famílias de superfície existem | `D3` decidiu: quatro. |
| Se a barra lateral ganha destinos novos | `D4` decidiu: não. |
| Como fica a *Story Home*, o Leitor, a conclusão do Colorir, a transição de cena | `D5`–`D10`, `D16`, `D17` decidiram — e são **Fase 9**, não Fase 6. |
| Se o mapa tem âncora única | `D11` decidiu. A auditoria §4.2 **confirma** a necessidade com cinco derivações. |
| Se a primeira experiência centra "Comece Aqui" | `D12` decidiu. |
| O que fazer com o Cantinho do Beni | `D13` congelou. |
| Quando o Monte a Cena desbloqueia | `D14` decidiu — e é **F12A**. |
| Se existe `GameShell` | `D15` decidiu — e é **F12A**. |
| Se B2 pode andar antes do delta | `D18` decidiu: não. |

---

## 3. *Checklist* de requisitos — Etapa SDD 3

Verificação da **qualidade dos requisitos** do delta, **antes** de qualquer plano. Cada item é
respondido com evidência ou com `FALHA`.

### 3.1 Completude

| ID | Verificação | Resultado |
|---|---|---|
| `CKD-01` | Todo achado de propriedade da F6 tem requisito correspondente | **OK** — `P-150`→`F6-R1.1`; `P-151`→`F6-R1.2/1.3`; `P-152`→`F6-R3`; `P-153`→`F6-R1.4`; `P-154`→`F6-R2` |
| `CKD-02` | Todo requisito tem critério de aceite observável | **OK** — `SD-1`..`SD-11` |
| `CKD-03` | Todo achado **não** pertencente à F6 tem dono declarado | **OK** — §8 da *spec* do delta |
| `CKD-04` | O contrato de faixas está numericamente definido | **OK** — `<600` / `600–899` / `>=900`, ligado a `tokens.js` §2.4 |
| `CKD-05` | As quatro famílias têm exemplos verificados no código | **OK** — §3 da *spec* do delta |
| `CKD-06` | A fronteira canvas F6 × F9 está declarada com prova | **OK** — §7 da *spec*, auditoria §5 |
| `CKD-07` | Existe ordem obrigatória entre os requisitos | **OK** — `F6-R3` → `F6-R2` → `F6-R1.1` (`RD-1`) |
| `CKD-32` | *(novo, fechamento do Portão 1)* **Existe UMA ÚNICA ordem executiva versionada** — nenhum artefato declara, rotula ou permite interpretar `R1` → `R2` → `R3` como ordem de execução | **OK** — ordem canônica `F6-SG-A`/`F6-R3` → `F6-SG-B`/`F6-R2` → `F6-SG-C`/`F6-R1` → `F6-SG-D`/`B2` em `PROJECT_SOURCE_OF_TRUTH.md`, `DECISIONS.md` §`PF6D-D18`, roteiro §3/§3.1 e *spec* §1; as ocorrências remanescentes de `R1` → `R2` → `R3` estão **rotuladas como taxonomia ou memória histórica sem valor executivo** |

### 3.2 Ausência de ambiguidade

| ID | Verificação | Resultado |
|---|---|---|
| `CKD-08` | Nenhum `[NEEDS CLARIFICATION]` em aberto no corpo da *spec* do delta | **OK** — as questões vivem aqui, numeradas |
| `CKD-09` | Nenhum requisito diz "responsivo" sem definir a faixa | **OK** |
| `CKD-10` | Nenhum requisito diz "tablet" como identidade de aparelho | **OK** — sempre largura de janela (`D2`) |
| `CKD-11` | "Âncora canônica" está definida operacionalmente | **OK** — `F6-R2.1`: fonte exclusiva de pino, alvo, brilho, *scroll* e holofote |
| `CKD-12` | "Preservação de estado" está enumerada, não adjetivada | **OK** — `F6-R3.2`, sete itens |

### 3.3 Testabilidade

| ID | Verificação | Resultado |
|---|---|---|
| `CKD-13` | Cada critério de aceite tem método de verificação declarado | **OK** — `SD-1`..`SD-11` |
| `CKD-14` | Existem critérios que **só** validação física resolve, e estão marcados | **OK** — `SD-1`, `SD-5`..`SD-9` |
| `CKD-15` | Existe critério **bloqueador absoluto** | **OK** — `SD-8` (perda de arte) |
| `CKD-16` | Existem testes **negativos** propostos | **OK** — §4 |
| `CKD-17` | Existem testes **mutantes** propostos | **OK** — §4 |

### 3.4 Rastreabilidade

| ID | Verificação | Resultado |
|---|---|---|
| `CKD-18` | Cada requisito aponta o código de risco que resolve | **OK** |
| `CKD-19` | Cada decisão `D1`–`D18` aparece onde é executada | **OK** — `DECISIONS.md` §`PF6D` traz o mapa completo |
| `CKD-20` | Nenhuma pendência existente foi apagada ou reclassificada | **OK** — matriz §32.5; `P-103` preservado com divergência declarada (`Q7`) |
| `CKD-21` | As sete pendências antigas seguem vivas com dono | **OK** — matriz §32.4 |
| `CKD-22` | A *spec* vigente da 021 não foi reescrita | **OK** — delta é aditivo; `CHK001..CHK040` intactos |

### 3.5 Limites

| ID | Verificação | Resultado |
|---|---|---|
| `CKD-23` | O delta não implementa nada de F7, F9, F11 ou F12A | **OK** — §8 da *spec* |
| `CKD-24` | O delta não introduz dependência nova | **OK** — **nenhuma dependência instalada.** `expo-screen-orientation` permanece **não instalada** e é apenas a via **(B)** a comparar no PLAN, entre quatro |
| `CKD-25` | O delta não toca área protegida sem instrução | **OK** — não toca *paywall*, progresso, conquistas, `accessControl`, manifestos, histórias, *assets* |
| `CKD-26` | O delta não cria *breakpoint* novo | **OK** — reusa `tokens.js` §2.4 |
| `CKD-27` | O delta não migra `.js` para TypeScript | **OK** |
| `CKD-28` | O delta não altera o motor do canvas | **REVISTO na emenda** — `Q2` resolvida e a **exceção formal `F6-R3.6`** autoriza `F6-R3` a alterar **apenas** as primitivas técnicas de coordenada, `resize`, *viewport*, ciclo de vida, preservação de estado e recuperação técnica indispensáveis à rotação segura. **Continua proibido** antecipar redesenho do Colorir, conclusão visual, redesenho do Criar Livre, *Story Home V2*, *Página Viva*, `GameShell`, política comercial ou qualquer escopo de produto de F9/F12A |
| `CKD-29` | *(novo)* `D1` está especificada nos **quatro** *idioms*, incluindo tablet Android | **OK** — `F6-R1.1` emendada, `SD-1`, `G-ORIENT-1`, `FD-11` |
| `CKD-30` | *(novo)* Nenhuma causa é declarada confirmada sem evidência empírica | **OK** — §5.3 da auditoria rebaixada a hipótese; `FD-12` é o passo de confirmação |
| `CKD-31` | *(novo)* A obra da criança tem contrato de **espaço lógico canônico** normativo | **OK** — `F6-R3.5`, `SD-8`, `MT-D6`/`MT-D7`/`MT-D8` |

**Resultado: 32 de 32 itens `OK`** — `CKD-32` acrescentado no fechamento do Portão Humano 1
(2026-08-09). `Q1` e `Q2` deixaram de ser bloqueantes — foram **resolvidas** no Portão Humano 1.
`Q3`–`Q7` permanecem registradas com natureza e direção declaradas; nenhuma delas bloqueia a
**qualidade dos requisitos** nem o fechamento do Portão 1.

---

## 4. Testes negativos e mutantes — a escrever na Etapa SDD 7

Nenhum destes existe hoje. Todos são **propostas** para o *plan*/*tasks*, e nenhum será escrito
antes do Portão 3.

### 4.1 Portões automáticos propostos para `scripts/smoke.js`

| ID | Portão | O que prova |
|---|---|---|
| `G-ORIENT-1` | A configuração de orientação distingue **telefone × tablet** em **cada** plataforma — os **quatro** casos de `D1`, incluindo **tablet Android** | Telefone não gira; tablet gira, nas duas plataformas |
| `G-ORIENT-2` | Se `UIRequiresFullScreen` for `false`, a lista de orientações de iPad é **completa** | Coerência com a regra de multitarefa da Apple (`ITMS-90474`) |
| `G-ORIENT-3` | *(novo, emenda do Portão 1)* Nenhum ponto de `src/` decide *"sou tablet"* por **largura em paisagem** | `D2` preservada: telefone deitado **não** vira tablet |
| `G-BP-3` | **Nenhuma** comparação de largura literal (`600`, `768`, `900`, `1024`) fora de `tokens.js` | O corte permanece único |
| `G-BP-4` | A faixa `>=900` tem **mais de um** consumidor | A faixa expandida existe de fato |
| `G-ANCHOR-1` | `getStoryMapCoord` é chamada com a **mesma aridade** em todos os pontos | Mata a divergência `LATENTE` |
| `G-ANCHOR-2` | Existe **exatamente um** fator de enquadramento de câmera em `src/` | `0.58` × `0.5` não voltam |
| `G-ANCHOR-3` | `AdventureMapScreen` não contém constante literal de altura de barra (`56`) | O viewport estimado não volta |
| `G-DIM-1` | **Zero** `Dimensions.get` em `src/` | A leitura reativa não regride |
| `G-LFC-1` | Nenhum `useEffect` reposiciona *scroll* tendo **apenas** largura como dependência | `F6-LFC-01` não volta |
| `G-SIDEBAR-1` | `TabletSidebar` **não** importa `src/theme/colors.js` | Tema legado sai |

### 4.2 Testes **negativos** (falham se o defeito for reintroduzido)

| ID | Cenário | Esperado |
|---|---|---|
| `CN-D1` | Reintroduzir `orientation: "portrait"` global sem variante por *idiom* | `G-ORIENT-1` **falha** |
| `CN-D6` | *(novo)* Introduzir `largura >= 900 ⇒ tablet` como identidade de aparelho | `G-ORIENT-3` **falha** |
| `CN-D2` | Reintroduzir literal `768` numa comparação de largura | `G-BP-3` **falha** |
| `CN-D3` | Adicionar segundo fator de enquadramento | `G-ANCHOR-2` **falha** |
| `CN-D4` | Chamar `getStoryMapCoord(id)` com um argumento num ponto de *scroll* | `G-ANCHOR-1` **falha** |
| `CN-D5` | Reintroduzir `Dimensions.get('window')` | `G-DIM-1` **falha** |

### 4.3 Testes **mutantes** (o teste tem que morrer quando o código é sabotado)

| ID | Mutação deliberada | O teste que **deve** morrer |
|---|---|---|
| `MT-D1` | Trocar `breakpoints.tablet` de `600` para `599` | Teste de faixa da família Hub |
| `MT-D2` | Inverter a ordem dos ramos de faixa em `ContentContainer` | Teste de largura máxima por faixa |
| `MT-D3` | Zerar o fator de enquadramento | Teste de âncora da câmera |
| `MT-D4` | Devolver coordenada fixa em `getStoryMapCoord` | Teste de coincidência pino × holofote |
| `MT-D5` | Reintroduzir o reset de `didInitScroll` por largura | `SD-7` (preservação de *scroll* sob rotação) |
| `MT-D6` | **Reescrito na emenda** — `Q2` foi resolvida e o congelamento de orientação no canvas está **vedado**. A mutação passa a ser: **atrelar o *canvas* lógico à dimensão da *viewport*** em vez da dimensão canônica da arte | `SD-8` — o teste **deve** acusar perda/corrupção da obra |
| `MT-D7` | *(novo)* Fazer o *hit testing* usar coordenadas de tela sem converter para canônicas | `SD-8` — pintura desalinhada do traço |
| `MT-D8` | *(novo)* Recriar `paint`/*buffers* na mudança de *viewport* | `SD-8` — perda silenciosa da pintura |

### 4.4 Roteiro físico proposto — só em aparelho real

| ID | Passo | Aparelho |
|---|---|---|
| `FD-1` | Abrir o app em iPad em **retrato**; confirmar que a barra lateral não tem vazio acumulado | iPad |
| `FD-2` | Girar para **paisagem**; confirmar que rota, *scroll* e áudio sobrevivem | iPad |
| `FD-3` | Rolar o mapa até o fim, girar, confirmar que a posição **não** volta para a câmera | iPad |
| `FD-4` | Iniciar um desenho no Colorir, **girar**, verificar que traço, pintura e preenchimento permanecem **alinhados e íntegros** — congelar em retrato **não** é resposta aceitável | iPad |
| `FD-5` | Idem no Ateliê / Criar Livre — traços e carimbos **reprojetados**, nunca perdidos nem deslocados | iPad |
| `FD-6` | Abrir Split View com outro aplicativo; variar a largura do painel nas três faixas | iPad |
| `FD-7` | Puxar o Centro de Controle sobre o Colorir, voltar, verificar o canvas | iPad |
| `FD-8` | Rodar o tour de Aventuras nas três faixas; conferir pino, holofote e "Ver mapa" | iPad + telefone |
| `FD-9` | Confirmar que o telefone **não** gira, em iOS **e** Android | iPhone + telefone Android |
| `FD-10` | Regressão completa do roteiro `F1`–`F12` da *spec* vigente da 021 | Telefone |
| `FD-11` | *(novo, emenda do Portão 1)* Confirmar que o **tablet Android gira** — o único vão real de `D1` | **Tablet Android** |
| `FD-12` | *(novo)* Instrumentar `FD-7` para **capturar** se `onContentProcessDidTerminate` de fato dispara ao abrir/fechar o Centro de Controle | iPad |

> `FD-7` é o passo que reproduz o sintoma original relatado pelo fundador. Ele valida a camada
> **canvas-specific** (`P-164`), que é **Fase 9** — está aqui para que o roteiro da F6 **detecte**
> o defeito, não para que a F6 o corrija.
>
> **`FD-11` é indispensável:** sem um **tablet Android** físico, `SD-1` **não** pode ser declarado
> cumprido, porque é exatamente ali que `D1` está violada hoje. Um iPad **não** substitui esse
> aparelho.
>
> **`FD-12` é o que converte hipótese em fato.** Enquanto ele não rodar, a explicação do sintoma
> permanece **`HIPÓTESE CAUSAL PRIORITÁRIA / MECANISMO COMPATÍVEL COM A EVIDÊNCIA ESTÁTICA, AINDA
> NÃO CONFIRMADO EMPIRICAMENTE`** — e **nenhum** artefato pode declarar a causa como confirmada.
