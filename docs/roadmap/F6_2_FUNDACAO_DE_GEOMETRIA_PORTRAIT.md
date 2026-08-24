# F6.2 — Fundação de geometria portrait · content viewport · sidebar · área útil

> **Bloco:** `F6.2` do Roteiro Mestre v6.0 · **Branch:** `feat/fase6-shell-splash`
> **Baseline de entrada:** `61f065c` (fechada em `F6.1`) · **Commit de implementação:** `2b8f12d`
> **Worktree:** `C:\tmp\ptf_fase6_shell_splash_wt` · **Data:** 2026-08-24
> **Status:** implementação concluída e medida · **prova física PENDENTE** · `F6_2_COMPLETE = NÃO`
> **Continuado por:** [`F6.2R`](F6_2R_FRONTEIRA_NAVEGACAO_CONTEUDO.md) — a prova física de
> `F6.2` revelou que a região certa ainda nascia colada ao trilho. O residual **quita a falha
> de Estrelinhas registrada na §5** e acrescenta a fronteira navegação → conteúdo.

---

## 0. O princípio, e por que ele não é retórico

> **Nenhuma tela deve precisar adivinhar quanto espaço a navegação consome.**

Toda a Fase 6 até aqui corrigiu geometria **tela a tela**. `G-RSP-8` obrigou Início e
Brincar a medirem a própria grade; `G-RSP-9` ensinou quatro superfícies a carimbarem
a medida com a janela. Cada correção foi certa e nenhuma foi a fundação: elas
transformaram um defeito estrutural numa **lista de telas que alguém precisou lembrar
de consertar**. A sexta aba nasceria errada, e ninguém saberia por quê.

`F6.2` não é mais uma tela. É a resposta à pergunta que nenhuma tela deveria fazer.

---

## 1. Contratos recuperados (Etapa 1)

Nenhuma decisão abaixo foi reaberta. A coluna de conformidade descreve o estado
**na entrada** do bloco.

| Contrato | Autoridade | Implementação na entrada | Situação |
| --- | --- | --- | --- |
| Três faixas — `COMPACT <600` · `MEDIUM 600–899` · `EXPANDED ≥900` | `tokens.breakpoints` (fonte única, `G-BP-1` · `G-RSP-7`) | `bandForWidth()` em `useWindowBand.js` é o tradutor único de largura em faixa | **CONFORME** — e permanece intacto |
| A barra lateral **declara quanto ocupa**, jamais quanto sobra | `G-SID-3` · `RG-12` · restrição 4 de §19.1 | `sidebarWidth(band)` em `TabletSidebar.js`; zero subtração manual em todo o `src/` | **CONFORME** |
| O shell **reserva** o espaço da navegação por *flex* | `tabBarPosition: 'left'` → `flexDirection: 'row'` (conferido no fonte de `BottomTabView` instalado) | `[tabBarElement, MaybeScreenContainer]` numa linha | **CONFORME** — o shell nunca foi o defeito |
| Dono único de `safeInsets` | `AppScreen` | Nenhuma tela lê `insets.left/right` (exceto `paresGridLayout.js`, caso próprio e auditado) | **CONFORME** |
| A medida só vale para a janela em que foi tirada (carimbo) | `G-RSP-9` · `F6-SG-C · CAUSA B` | Aplicado em 4 superfícies, **tela a tela** | **CONFORME, mas SEM FUNDAÇÃO** |
| A tela de aba que compõe grade **mede a própria região** | `G-RSP-8` · `F6-SG-C · CAUSA A1` | Aplicado **só** em Início e Brincar | **DIVERGE** — cobertura parcial por construção |
| A largura que o arquétipo usa quando ninguém lhe passa medida | *(nenhuma — nunca existiu)* | `useWindowBand()`, isto é, **a janela** | **DIVERGE** — é a causa |

---

## 2. Perícia (Etapa 2) — `GEOMETRY_CAUSAL_MAP`

Cada elo declara **de onde vem a grandeza** e **quem é o dono**.

| # | Elo | Largura vem de | Altura vem de | Insets | Dono |
| --- | --- | --- | --- | --- | --- |
| 1 | **WINDOW** | `useWindowDimensions()` | idem | — | RN / `useWindowBand.js` |
| 2 | **NAVIGATION SHELL** (`MainTabs`) | janela (elo 1) — **correto**: quem decide o modo de navegação precisa da janela | janela | `SafeAreaProvider` acima | `AppNavigator.js` |
| 3 | **NAV ELEMENT** (`TabletSidebar`) | `sidebarWidth(band)` — **declara o que ocupa** | `flex: 1` | — | `TabletSidebar.js` |
| 4 | **CONTENT REGION** | *(elo inexistente na entrada)* → o que sobra da linha *flex* | idem | — | **ninguém** ⟵ o buraco |
| 5 | **SCREEN CONTAINER** (`AppScreen`) | `flex: 1` do pai | `flex: 1` | **aplica** o inset — dono único | `AppScreen.js` |
| 6 | **ARQUÉTIPO** (Hub/Editorial/Imersiva/Jogo) | `availableWidth` **se a tela passar**; senão **`useWindowBand().width`** | idem | — | os 4 arquétipos |
| 7 | **SCREEN** | própria, quando mede (`G-RSP-8`) | própria | — | cada tela |

**O buraco é o elo 4.** Ele existe visualmente — o *flex* o produz a cada quadro — mas
**não existia como grandeza legível**. Sem ele, o elo 6 não tinha a quem perguntar, e
o único número disponível era o do elo 1. Num telefone os elos 1 e 4 coincidem, e por
isso o defeito atravessou a Fase 6 inteira sem aparecer.

### Respostas que a perícia fixou

- **O shell reserva o espaço?** Sim, sempre reservou — conferido no fonte da
  biblioteca instalada, não presumido pela documentação.
- **Alguém subtrai a barra manualmente?** Não. Zero ocorrências em `src/`.
  `G-SID-3` estava limpo.
- **Existe um segundo dono de inset?** Não. `AppScreen` é único.
- **A faixa é calculada em qual referencial?** Na **janela** — inclusive dentro dos
  arquétipos. Essa é a metade do defeito que nenhum portão via.
- **Existe zona em que os dois referenciais discordam de FAIXA, não só de magnitude?**
  Sim, duas: janela ∈ `[600, 780)` → janela MÉDIA / região **COMPACTA**; janela ∈
  `[900, 1140)` → janela EXPANDIDA / região **MÉDIA**.
- **Quantos consumidores liam a janela direto?** Cinco: `ContentContainer` e os
  quatro arquétipos.

---

## 3. Causa raiz provada (Etapa 3)

**`ROOT_CAUSE = A (+F) → G`** — combinação.

- **A** — telas e arquétipos recebem largura de **JANELA** onde deveriam receber
  largura de **CONTEÚDO**.
- **F** — a **faixa** (`band`) era derivada no referencial da janela, então o defeito
  não era só de magnitude: era de **política**.
- **G** — a combinação. Corrigir só a magnitude deixaria o teto de colunas errado;
  corrigir só a faixa deixaria a largura errada.

**Descartadas com evidência:** **B** (o shell reserva — provado no fonte),
**C** (nenhuma subtração manual), **D/E** (dono único de inset, sem duplicidade).

### Evidência numérica de entrada

SM-X510 em retrato: janela **823 dp**, trilho **180 dp**, região **643 dp**.
Estrelinhas declara piso de cartão **320 dp**, intervalo **10 dp**, recuo lateral
**16 dp × 2**.

| | compôs por | colunas | célula real na grade (611 dp) |
| --- | --- | --- | --- |
| **ANTES** | janela `823` | 2 | **300,5 dp** — abaixo do piso que a própria tela exigiu |
| **DEPOIS** | região `643` | 1 | **611 dp** |

O número 300,5 não parece errado isoladamente. É o produto de **compor por uma
largura e desenhar em outra** — e é por isso que o defeito sobreviveu a uma fase
inteira de correções corretas.

---

## 4. O contrato-alvo (Etapa 4)

A ordem de prioridade foi respeitada e **está registrada porque restringiu o desenho**:

1. **O *flex* do pai resolve.** — Resolve, e continua resolvendo: nenhuma linha de
   *layout* do shell mudou. É por isso que a região pôde ser **medida**.
2. **Os filhos medem o container que receberam.** — É exatamente o mecanismo adotado.
3. **Contexto/hook só quando um consumidor precisa NUMERICAMENTE do viewport.** —
   `hubComposition` precisa de um **número** para decidir cabimento, e `flex` não
   entrega número a JavaScript. Só por isso um contexto nasceu.
4. **Nunca a largura da janela como substituto da largura de conteúdo onde há trilho.**

### O que o contrato publica

`{ width, height, band, isLandscape, measured, source }`

### O que ele NÃO publica, de propósito

| Não publicado | Motivo |
| --- | --- |
| `sidebarWidth` | Nenhum consumidor precisa. Seria *token* declarado e inerte (`P-82`/`P-148`) — e a porta aritmética que `G-SID-3` fechou. |
| `navigationMode` | Idem: o shell já decide, e ninguém abaixo dele pergunta. |
| `safeInsets` | O dono único é `AppScreen`. Um segundo dono é `P-30` outra vez. |

### Onde o provedor é montado, e por quê

No **`screenLayout` do `Tab.Navigator`** — não num `HOC` por aba.

O contrato é do **SHELL**, não de cada destino. É o ponto exato em que o trilho já
consumiu o espaço dele por *flex* e o restante pertence à tela: medir ali é medir o
que a tela **de fato recebeu**. Uma sexta aba nasce dentro do contrato sem que
ninguém precise lembrar — que é a diferença entre uma fundação e uma lista.

E é **só nas abas**: telas de `Stack` e modais ocupam a janela inteira. Fora de um
provedor, `useContentViewport()` cai na janela — e isso é **correto**, não tolerado.

### O carimbo

Entre `onLayout → setState` e `useWindowDimensions` existe a defasagem de **um
quadro**: ao girar, o quadro seguinte tem **janela nova e medida velha**. Cada medida
guarda a janela em que foi tirada e só vale enquanto o carimbo bate. Quando não bate,
a resposta é a **janela** — a única grandeza que pertence, com certeza, ao quadro
atual. **Rotação não é gatilho de correção de estado:** ela apenas invalida um carimbo.

---

## 5. Raio de correção (Etapa 6)

| Tela | Como consome a área útil | ANTES | DEPOIS | Corrigida pela fundação | Ainda falha | Dono da falha |
| --- | --- | --- | --- | --- | --- | --- |
| **Início** | Hub com `availableWidth` medido (`G-RSP-8`) | grade certa, **teto de faixa errado** (3 onde cabiam 2, aos 900/1024) | teto certo | **latente** — o cabimento já mascarava o teto; nenhuma coluna muda | não | — |
| **Aventuras / Mapa** | mede as duas grandezas com carimbo próprio (`G-RSP-9` v2) | correta | inalterada | não se aplica | não | — |
| **Brincar** | Hub com `availableWidth` medido (`G-RSP-8`) | idem Início | idem Início | **latente** | não | — |
| **Estrelinhas** | Hub **sem** `availableWidth` — a única | **célula 300,5 dp** contra piso 320 dp em 823 | **611 dp**, 1 coluna | **SIM** | **sim, em janela ∈ [900, 1140)** | `TrophiesScreen.js` |
| **Perfil** | `CenteredContent` → `ContentContainer` | coluna de **560 dp dentro de região de 420 dp** aos 600 (folga **−70 dp** por lado) | `100%` fluido | **SIM** | não | — |
| **Área dos Responsáveis** | tela de `Stack` — `EditorialSurface` + `useWindowBand()` | janela inteira | **inalterada, e correta**: não há trilho entre ela e a borda | não se aplica | não | — |

### A falha residual, sem maquiagem

Em janela **900** (região 660), Estrelinhas continua entregando **2 colunas com
célula de 309 dp** — abaixo do piso de 320 dp que ela mesma declara.

**Por quê:** a fundação entrega a **região** (660). A grade real é a região **menos o
recuo lateral da própria tela** (`paddingHorizontal: 16` × 2) = **628**. A composição
superestima em 32 dp, e `floor((660+10)/330) = 2` enquanto `floor((628+10)/330) = 1`.

**Dono:** `TrophiesScreen.js`. **Remédio:** o contrato que `G-RSP-8` já impõe a Início
e Brincar — medir a grade com `onLayout` e entregá-la como `availableWidth` —, que
nunca foi estendido a Estrelinhas.

> **Baixa (2026-08-24, `F6.2R`, commit `bb33017`):** corrigida. A varredura dp a dp mostrou
> que a residual não era a faixa contínua `[900, 1140)` afirmada acima, e sim **três faixas
> estreitas** — `[830, 862)` ∪ `[900, 922)` ∪ `[1220, 1252)` —, o que reconcilia "residual em
> 900" com "1024 corrigida". Remédio: `G-RSP-8` estendido a Estrelinhas (grade medida por
> `onLayout`). Detalhe em [`F6.2R` §6](F6_2R_FRONTEIRA_NAVEGACAO_CONTEUDO.md).

**Por que não foi corrigido aqui:** `F6.2` é o bloco da **fundação**, e a ordem prevê
`AINDA_FALHA` / `OWNER_DA_FALHA` como entrega, não como pendência a esconder.
Corrigir uma tela dentro do bloco que existe para acabar com a correção tela a tela
exige decisão do fundador. **No aparelho de prova (823 dp em retrato) a fundação
corrige por completo** — a residual vive numa faixa de janela que o SM-X510 não
alcança em retrato.

---

## 6. Matriz responsiva (Etapa 7) — retrato, sem condição por aparelho

Grade de Estrelinhas: piso **320**, intervalo **10**, recuo **32**, 12 itens.
A região é simulada como *janela − barra declarada*; **no runtime ela é MEDIDA**.

| janela | faixa da janela | barra | região | faixa da região | faixas divergem | col. ANTES | célula ANTES | col. DEPOIS | célula DEPOIS | veredito |
| ---: | --- | ---: | ---: | --- | :---: | :---: | ---: | :---: | ---: | --- |
| 360 | compact | — | 360 | compact | não | 1 | 328 | 1 | 328 | igual |
| 390 | compact | — | 390 | compact | não | 1 | 358 | 1 | 358 | igual |
| 412 | compact | — | 412 | compact | não | 1 | 380 | 1 | 380 | igual |
| **599** | compact | — | 599 | compact | não | 1 | 567 | 1 | 567 | igual |
| **600** | medium | 180 | 420 | **compact** | **SIM** | 1 | 388 | 1 | 388 | igual |
| 768 | medium | 180 | 588 | **compact** | **SIM** | 2 | **273** | 1 | 556 | **CORRIGIDA** |
| **823** | medium | 180 | 643 | medium | não | 2 | **300,5** | 1 | 611 | **CORRIGIDA** |
| **899** | medium | 180 | 719 | medium | não | 2 | 338,5 | 2 | 338,5 | igual |
| **900** | expanded | 240 | 660 | **medium** | **SIM** | 2 | **309** | 2 | **309** | *residual (§5)* |
| 1024 | expanded | 240 | 784 | **medium** | **SIM** | 3 | **244** | 2 | 371 | **CORRIGIDA** |
| 1317 | expanded | 240 | 1077 | expanded | não | 3 | 341,7 | 3 | 341,7 | igual |

### A mesma matriz para Perfil (coluna de leitura)

| janela | região | máx. ANTES | máx. DEPOIS | folga/lado ANTES | folga/lado DEPOIS |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 360–599 | = janela | `100%` | `100%` | — | — |
| **600** | 420 | **560** | `100%` | **−70** ⟵ a coluna era 140 dp mais larga que o espaço | fluido |
| 768 | 588 | 560 | `100%` | 14 | fluido |
| 823 | 643 | 560 | 560 | 42 | 42 |
| 899 | 719 | 560 | 560 | 80 | 80 |
| **900** | 660 | **640** | 560 | **10** | **50** |
| 1024 | 784 | 640 | 560 | 72 | 112 |
| 1317 | 1077 | 640 | 640 | 219 | 219 |

A linha de **600 dp** é a colisão que originou o bloco: uma coluna de leitura de
560 dp montada dentro de 420 dp de espaço real. Nenhum número parecia errado — os
560 vinham do *token* certo, lidos na janela errada.

---

## 7. Portões (Etapa 8)

### Reapontados e **estreitados** — nunca relaxados

- **`A0.3`** — `ContentContainer` decide por faixa da **REGIÃO**. Ganhou dente novo:
  `useWindowBand()` chamado direto ali passa a ser **falha**.
- **`TA-14 [9/21]`** — os quatro arquétipos leem faixa e largura só pelo referencial
  de conteúdo. As três proibições originais (`breakpoints` próprio, literal de
  largura, medida crua) seguem idênticas; nasce a quarta. A sonda é a **chamada**
  `useWindowBand(`, não o caminho de *import*: `BANDS` continua morando em
  `useWindowBand.js` e importá-lo de lá é o idioma correto.
- **`MODULOS_LAYOUT`** — o módulo novo entra na varredura, e com ele `G-RSP-4`
  (nenhum *design system* paralelo) e `CN-12` (nenhuma navegação pela porta dos fundos).

### Novo — `G-CVP-1`, com sete mutantes

Três baterias: **carimbo** (6 quadros de uma rotação), **referenciais** (a faixa é da
região; a tabela exige ao menos duas zonas de divergência real, senão o próprio portão
se declara vazio) e **produto** (reproduz o cartão de 300,5 dp com a composição REAL do
Hub e os números que a própria tela declara, e mostra a cura em 611 dp).

| Mutante | Regressão que ele nomeia | Bateria que precisa cair |
| --- | --- | --- |
| `MT-CVP-1` | a medida volta a valer para qualquer janela (carimbo removido) | carimbo |
| `MT-CVP-2` | a faixa volta a ser a da janela | referenciais |
| `MT-CVP-3` | região degenerada passa a ser aceita como medida boa | carimbo |
| `MT-CVP-4` | o consumidor perde o sinal de procedência | carimbo |
| `MT-CVP-5` | fora do provedor a janela deixa de ser a resposta | carimbo |
| `MT-CVP-6` | a largura entregue volta a ser a da janela inteira | produto |
| `MT-CVP-7` | o shell deixa de montar o provedor | montagem (textual) |

Cláusula anti-fossilização: se a âncora de um mutante sumir do fonte, o portão **falha**
— mutante que não muta nada não prova nada.

### Medidos, não presumidos

| Portão | Resultado |
| --- | --- |
| `npm run bundle:check` | **verde** — `gate:platform-scope` OK em **1482** arquivos; Android empacotou **2384** módulos |
| `npm run smoke` | **4979/4979**, 0 falhas *(baseline de entrada: 4978)* |
| `npm run verify:runtime` | **verde** |
| `npx expo-doctor` | **18/18** |

---

## 8. O que este bloco **não** tocou

Zero condição por aparelho, modelo, plataforma ou resolução física. Zero deslocamento
mágico (`MAGIC_OFFSETS_ADDED = 0`). Zero alteração em: paywall, progresso, conquistas,
`accessControl`, manifestos, histórias, áudio, assets, `tokens.breakpoints`, *layout*
do shell, `AppScreen`, `TabletSidebar`.

Fora de escopo por dono declarado, **registrado e não corrigido**: tour/*spotlight*
(`F7`), performance (`F6.6`), orientação iOS (`F6.7`), Story Home / Página Viva (`F9`),
*landscape* adaptativo (pós-V1).

---

## 9. Roteiro de prova física — SM-X510, **RETRATO**

> Aparelho: `RX2XC003LTJ` (SM-X510) · Metro na worktree `C:\tmp\ptf_fase6_shell_splash_wt`
> **Não instalar. Não desinstalar. Não limpar dados. Não gerar build nativo.**
> O *dev client* histórico serve **só** como arnês de JS — não recebe status de build canônico.

1. **Trave o aparelho em RETRATO** (rotação automática desligada). Abra o *dev client*
   e conecte ao Metro desta worktree. Confirme que o app carregou o *bundle* novo.
2. **Início.** A grade não deve tocar o trilho. Nenhum cartão cortado, nenhuma coluna
   a mais do que cabe. *(Esperado: sem mudança visível — a correção aqui é latente.)*
3. **Aventuras.** O mapa deve abrir como antes, sem salto e sem faixa creme lateral.
   *(Esperado: sem mudança — a tela já media com carimbo.)*
4. **Brincar.** Idem Início: sem mudança visível esperada.
5. **Estrelinhas — a tela da prova.** Antes: **duas** colunas de cartões estreitos,
   apertados contra o trilho. Agora: **uma** coluna larga, com o cartão respirando.
   Se ainda vierem duas colunas estreitas, **a fundação não chegou** — pare e reporte.
6. **Perfil.** A coluna de conteúdo deve ficar **centrada com folga dos dois lados**,
   não colada ao trilho. É a linha de 600/900 dp da matriz.
7. **Área dos Responsáveis** (pelo portão parental). Deve ocupar a **janela inteira**
   — é tela de `Stack`, não tem trilho. Qualquer estreitamento novo aqui é regressão.
8. **Rotação (só como controle negativo).** Gire para paisagem e volte para retrato,
   em Estrelinhas e no Mapa. Não deve haver **salto em duas etapas** nem quadro com a
   geometria da orientação anterior. *Landscape não precisa estar bonito* — precisa
   apenas não quebrar retrato ao voltar.

**Registrar em cada passo:** print ou vídeo, e a frase "confere" / "não confere".

---

## 10. Estado e pendências

- **`F6_2_COMPLETE = NÃO`** até a prova física ser recebida e adjudicada.
- **Sem *push*.** Commit de implementação: `2b8f12d`. Este documento vai em commit
  separado, de governança.
- **Nenhum risco de classe nova.** A falha residual de Estrelinhas (§5) é **defeito
  conhecido com dono nomeado**, não classe de risco inédita — a matriz canônica
  `P-nnn` não é alterada por este bloco.
- **Continuação:** [`F6.2R`](F6_2R_FRONTEIRA_NAVEGACAO_CONTEUDO.md) (commit `bb33017`) —
  fronteira navegação → conteúdo, residual de Estrelinhas quitada, portão `G-GAP-1`.
- **`F6.3` não foi iniciada.**
