# F6-DELTA0 · Especificação do delta da Fase 6 — `F6-R1`, `F6-R2`, `F6-R3`

> **Estado:** 🟡 **PORTÃO HUMANO 1 APROVADO CONDICIONALMENTE em 2026-08-08** — a base documental
> foi aceita, **mas NÃO há autorização para Plan, Tasks, Analyze ou Implement**. Nenhuma linha de
> código de `F6-R1`, `F6-R2` ou `F6-R3` foi escrita. Não existe `plan.md` nem `tasks.md` deste
> delta. O Bloco `B2` continua **BLOQUEADO**.
>
> **🔁 Emendas do Portão 1 incorporadas neste documento:** `F6-R1.1` reformulada — `D1` cobre os
> **quatro** *idioms*, incluindo **tablet Android**, e `O1` foi **rebaixada** · `F6-R3.5` novo —
> **contrato canônico de espaço lógico da obra** (`Q2` RESOLVIDA) · `F6-R3.6` novo — **exceção
> formal e estreita** de escopo · §7 **retificada** — travar as telas criativas em retrato está
> **vedado** · `SD-1` e `SD-8` reescritos · `RD-6` **superado**, `RD-7` e `RD-8` acrescentados.
>
> **Relação com a *spec* vigente.** Este documento é um **delta aditivo** de
> [`spec-fase6-shell-splash-sistema-visual.md`](../spec-fase6-shell-splash-sistema-visual.md).
> **Não** revoga, **não** reescreve e **não** renumera nada dela: os eixos A/B/C, os requisitos
> `RF-A1..A7`, `RF-B1..B8`, `RF-C1..C16`, `RF-M1..M5`, os critérios de saída `S1..S11`, os testes
> `T1..T14`, o *script* físico `F1..F12`, a banda de aceite `B1..B7` e o *checklist*
> `CHK001..CHK040` permanecem **integralmente válidos**. Os Portões Humanos 1 e 2 já aprovados
> para aquela *spec* **continuam aprovados**; este delta abre um **novo** Portão 1, só para si.
>
> **Base:** [`00_AUDITORIA_SOMENTE_LEITURA.md`](00_AUDITORIA_SOMENTE_LEITURA.md), HEAD `f10370e`.
>
> **Decisões vinculantes:** `D1`–`D18` do fundador, registradas em
> [`DECISIONS.md`](../../../docs/DECISIONS.md) §`PF6D`. Este documento **executa** essas decisões;
> não as reabre.

---

## 1. Por que existe um delta

A *spec* da 021, §8 ("Telefone × tablet"), diz sobre orientação, **na íntegra**:

> *"Orientação: `portrait` declarado hoje | comportamento a verificar em aparelho real"*

E nada mais. Não há, em nenhum ponto dos 554 parágrafos da *spec* aprovada, requisito sobre
**paisagem**, **redimensionamento**, **preservação de estado**, **famílias de superfície** ou
**ancoragem do mapa**.

Isso estabelece um fato de governança que importa: **`F6-R1`, `F6-R2` e `F6-R3` são escopo
genuinamente novo — não são relitígio de decisão tomada, nem correção de requisito mal escrito.**
A validação física em iPad revelou uma lacuna que a *spec* nunca cobriu. O caminho correto é
**emendar por delta**, com portão humano próprio, e não implementar por dentro dos blocos já
aprovados.

**Consequência de sequenciamento (D18):** o Bloco **B2** (acessibilidade e tipografia) permanece
**BLOQUEADO** até que este delta seja corrigido e revalidado. B2 mede alvo de toque e tamanho de
fonte; medir isso sobre uma fundação que ainda vai mudar de faixa e de orientação produziria
resultado descartável.

> ### ⚠️ A numeração dos requisitos **não é ordem de execução**
>
> Os §§ **4**, **5** e **6** apresentam `F6-R1`, `F6-R2` e `F6-R3` em **ordem numérica de catálogo**,
> para leitura. **Isso é taxonomia, não cronologia.** Os nomes são fixos e **não foram renumerados**:
> `F6-R1` = *Adaptive Surface System* · `F6-R2` = *Map Geometry Foundation* · `F6-R3` = *Lifecycle &
> Resize Stability*.
>
> **A ordem executiva canônica da Fase 6 — verdade única, ratificada no fechamento do Portão Humano
> 1 (2026-08-09) — é:**
> **`F6-SG-A` = `F6-R3` → `F6-SG-B` = `F6-R2` → `F6-SG-C` = `F6-R1` → `F6-SG-D` = avaliar/desbloquear
> o Bloco `B2`.**
>
> **Razão:** a proteção de ciclo de vida, `resize`, orientação, continuidade de estado e integridade
> da obra infantil precisa existir **antes** de mudanças estruturais de geometria e adaptatividade.
> **`SD-8` (§9) é bloqueador absoluto.** Registro canônico em
> [`docs/DECISIONS.md`](../../../docs/DECISIONS.md) §`PF6D-D18`; detalhamento em
> [`03_ROADMAP_v4.1_DELTA.md`](03_ROADMAP_v4.1_DELTA.md) §3.1.

---

## 2. Contrato de faixas de janela — normativo

**Fonte da decisão de *layout*: o tamanho da janela, nunca o nome do aparelho (`D2`).**
É proibido, em todo o escopo deste delta, decidir *layout* por modelo, por `Platform.isPad`, por
`expo-device` ou por qualquer heurística de identidade de aparelho.

| Faixa | Largura da janela | Token | Estado atual |
|---|---|---|---|
| **Compacta** | `< 600dp` | `breakpoints.phone` | Viva. 13 consumidores. |
| **Média** | `600dp – 899dp` | `breakpoints.tablet` | Viva, porém **indistinguível** da expandida em quase todo lugar. |
| **Expandida** | `>= 900dp` | `breakpoints.tabletL` | **Praticamente inexistente** — 1 consumidor (`ContentContainer.js:25`). |

Os três limiares **já existem** em `src/theme/tokens.js` §2.4 e **não** serão renumerados,
renomeados nem duplicados. O delta **não cria** um quarto *breakpoint*.

> **Nota de escopo, derivada da auditoria §2.1:** a leitura reativa de dimensões **já está
> correta** em todo o aplicativo (`useWindowDimensions` em ~34 pontos; **zero** `Dimensions.get`).
> `F6-R1` **não** inclui migração de leitura de dimensões. O que falta é a **política**, não a
> **medida**.

---

## 3. As quatro famílias de superfície — normativo (`D3`)

Toda superfície do aplicativo pertence a **exatamente uma** família. A família — e não a tela —
determina como a janela é ocupada em cada faixa.

| Família | Natureza | Exemplos verificados no código | Regra de ocupação |
|---|---|---|---|
| **Hub** | Escolha entre destinos; densidade e grade | `HomeScreen`, `BrincarScreen`, `TrophiesScreen`, `AtelierGalleryScreen` | Compacta: 1 coluna. Média: grade. Expandida: grade mais larga. **Nunca** uma coluna estreita centralizada com vazio nas laterais. |
| **Editorial** | Texto para leitura; medida de linha é o que manda | `StoryDetailScreen`, `ReflectionScreen`, `PostStoryHubScreen`, `ParentAreaScreen` | Largura máxima de coluna é **correta** aqui. Na expandida, o excedente vira **painel de apoio**, não vazio. |
| **Imersiva** | Arte domina; a interface serve a arte | `StoryBookScreen`, Leitor, Colorir, Ateliê | Ocupa a janela inteira. Compacta: arte dominante + camada legível. Tablet em paisagem: composição de **livro aberto / painel de apoio** (`D10`). |
| **Jogo** | Área jogável com geometria própria e invariante | `MonteACena*`, `ParesDoBeni`, `Palavrinhas`, `CadeAOvelhinha`, `QuizScreen` | Área jogável preserva proporção e legibilidade; o excedente é moldura, **nunca** distorção do tabuleiro. |

**Proibição explícita (`D4`):** nenhuma família — em particular a barra lateral — recebe destinos,
ícones, atalhos ou seções **inventados para preencher vazio**. Vazio se resolve por **composição**,
não por invenção de conteúdo.

---

## 4. `F6-R1` — *Adaptive Surface System*

**Problema que resolve:** `F6-RSP-01` e `F6-RSP-02` (matriz §32 · `P-150`, `P-151`), `F6-SID-01`
(`P-153`).

### `F6-R1.1` — Política de orientação por plataforma (`D1`) · **EMENDADA no Portão 1**

**`D1` cobre QUATRO casos, não dois.** O requisito só está cumprido quando os quatro estiverem:

| # | *Idiom* | Exigência de `D1` | Situação no HEAD `93571c6` |
|---|---|---|---|
| 1 | iPhone | retrato | ✅ já cumprido |
| 2 | Telefone Android | retrato | ✅ já cumprido |
| 3 | iPad | retrato **e** paisagem | ✅ **já cumprido** — `UISupportedInterfaceOrientations~ipad` com as quatro orientações |
| 4 | **Tablet Android** | retrato **e** paisagem | ❌ **VIOLADO** — `android:screenOrientation="portrait"`, chave única, sem variante por *idiom* |

- **`O1` foi REBAIXADA e deixou de ser a recomendação.** Ela pressupunha que o iPad estivesse
  travado em retrato — **não está** — e que *"Android permanece retrato"* satisfaria `D1` — **não
  satisfaz**. `O1` permanece candidata **apenas para a parte iOS**, onde hoje **nada precisa mudar**.
- **É proibido congelar** *"iPad rotaciona / Android permanece retrato"* **como solução final.**
- A distinção continua vivendo na **configuração de plataforma**, não em código de tela — de modo
  que `D2` permaneça verdadeira: o código nunca pergunta *"sou um tablet?"*, só *"que largura eu
  tenho?"*. **É proibido classificar um telefone em paisagem como tablet apenas por largura.**
- **Vias a comparar objetivamente na etapa PLAN** — nenhuma escolhida agora, **nenhuma dependência
  instalada**:
  **(A)** configuração CNG/nativa por plataforma e *idiom*;
  **(B)** `expo-screen-orientation`;
  **(C)** *config plugin* próprio ou runtime específico de Android;
  **(D)** qualquer alternativa já compatível com o runtime atual.
- **A solução vencedora deverá, cumulativamente:** cumprir `D1` **integralmente** nos quatro casos ·
  preservar multitarefa e redimensionamento no iPad · **evitar dependência nova se não for
  necessária** · **nunca** classificar telefone em paisagem como tablet por largura · exigir
  ***build* nativo** quando a configuração nativa mudar.
- **Precondição inegociável:** `F6-R1.1` **não pode ser aplicada antes** de `F6-R3` estar
  implementada e validada, e antes de a política de canvas (`PF6D-D-CANVAS`, §7) estar em vigor.
  Liberar a paisagem sobre a fundação atual **destrói desenho** (auditoria §5.2).
- **Urgência independente:** como o **iPad já gira hoje**, `F6-R3` é necessária **mesmo que
  `F6-R1.1` não altere nada**. A proteção não pode esperar a liberação de orientação — a exposição
  já existe.

### `F6-R1.2` — Arquétipos de superfície

Criar *wrappers* de superfície por família (§3), estendendo o que existe:

- `AppScreen` continua dono da **área segura** — não passa a decidir largura.
- `ContentContainer` continua dono da **coluna editorial** — deixa de ser o modelo **universal**.
- Os arquétipos novos ficam sob `src/components/layout/`, respeitando a arquitetura vigente.

**Proibido:** criar um sistema paralelo ao *design system*; duplicar `breakpoints`; introduzir
biblioteca de *layout*.

### `F6-R1.3` — Faixa expandida real

`>=900dp` passa a ter comportamento próprio em cada família — hoje só altera a largura de uma
coluna. Os *tokens* `grid` e `displayScaleTablet`, **hoje sem nenhum consumidor**, ou passam a ter
consumidor ou são declarados mortos com registro. **Não podem permanecer declarados e inertes.**

### `F6-R1.4` — Barra lateral responsiva (`D4`)

- Largura deixa de ser o literal `200` fixo e passa a responder à faixa.
- A distribuição vertical deixa de acumular ~700pt de vazio (auditoria §3.2).
- Passa a consumir `src/theme/tokens.js` em vez do tema legado `src/theme/colors.js`.
- **Nenhum destino novo é criado.**
- Os alvos de guia registrados (`adventures.sidebarTab`, `home.sidebarTab`, `atelier.sidebarTab`,
  `stars.sidebarTab`, `profile.sidebarTab`) **permanecem registrados e mensuráveis**.

> Os defeitos de **alvo de toque (<56pt)** e de **tipografia (<13px)** da barra lateral são
> violações de `RF-A7` e `RF-C12` **já aprovados** e pertencem ao Bloco **B2** — **não** a este
> delta. Registrados como `AD-3` na auditoria.

---

## 5. `F6-R2` — *Map Geometry Foundation*

**Problema que resolve:** `F6-MAP-ANCHOR-01` (`P-154`); é **infraestrutura** de `F7-ONB-SPOT-01`
(`P-157`).

### `F6-R2.1` — Âncora canônica única (`D11`)

Uma única função canônica passa a ser a **fonte exclusiva** da posição de uma história no mapa.
**Pino, alvo de toque, brilho, *scroll* e holofote consomem essa mesma âncora.** As **cinco**
derivações independentes da auditoria §4.2 passam a **uma**.

- `src/data/adventureMap.js` continua a **fonte de coordenadas normalizadas** — não é substituído.
- A âncora é **normalizada** (frações), nunca pixel absoluto.
- O `guideTargetRegistry` existente (`src/services/guideTargetRegistry.js`) é a **semente natural**
  do registro de âncoras: hoje serve só ao tour; passa a servir à geometria do mapa. **Estender o
  que existe antes de criar paralelo.**

### `F6-R2.2` — Um único fator de enquadramento

O fator **0.58** (câmera) e o fator **0.5** (`scrollPinIntoView`) passam a ser **um só**, nomeado e
declarado. O comentário que hoje afirma *"mesma geometria da câmera"* e mente sobre o código
(auditoria §4.2, defeito 1) deixa de ser falso.

### `F6-R2.3` — Viewport real, nunca estimado

A estimativa `height - (insets.top + 56) - (insets.bottom + 56)` de `initialOffsetY` é substituída
por medida real. Os `56` subtraídos a título de barra inferior **não existem no tablet** — é a
causa estrutural da câmera errar a mira em iPad.

### `F6-R2.4` — Assinatura única de `getStoryMapCoord`

Todos os chamadores passam a usar a **mesma** assinatura. A divergência `LATENTE` — pino em
`(id, i, n)` × *scroll* em `(id)` — é eliminada **antes** de se manifestar. Hoje ela dorme apenas
porque as 20 histórias têm coordenada explícita.

### `F6-R2.5` — Primeira experiência centra "Comece Aqui" (`D12`)

O mapa e o *onboarding* sempre abrem centrados em **"Comece Aqui" / "A Criação"**.
**Verificado no código:** as regiões existem em `adventureMap.js:56` (`comece_aqui`) e `:59`
(`jovens_da_fe`). `F6-R2` entrega a **capacidade de mirar corretamente**; **quem decide qual
história é o alvo pertence à Fase 7** (`F7-ONB-START-01` · `P-156`).

---

## 6. `F6-R3` — *Lifecycle & Resize Stability*

**Problema que resolve:** `F6-LFC-01` (`P-152`). É **precondição** de `F6-R1.1`.

### `F6-R3.1` — `resize` deixa de descartar estado

`AdventureMapScreen.js:367` — `useEffect(() => { didInitScroll.current = false; }, [mapWidth])` —
deixa de tratar mudança de largura como primeira montagem. A posição do mapa da criança
**sobrevive** a rotação, a Split View e à travessia de 600dp. `userScrolledRef` e `activeIdx`
passam a ser reconciliados em vez de ficarem dessincronizados.

### `F6-R3.2` — Contrato transversal de preservação de estado

Sob mudança de largura ou de orientação, **sobrevivem**: rota e pilha de navegação; posição de
*scroll* de listas e do mapa; reprodução de áudio; sessão de jogo em andamento; passo de tour;
**arte da criança** (Colorir e Ateliê).

### `F6-R3.3` — Nenhuma remontagem incidental

Nenhuma superfície pode remontar por travessia de faixa. O *shell* **já está correto** (auditoria
§3.1: `Tab.Navigator` único, travessia é *re-render*) — o contrato existe para **impedir
regressão**, não para reconstruir o que funciona.

### `F6-R3.4` — Fronteira explícita do canvas

`F6-R3` estabelece a **política global** de `resize` e o **contrato** que o canvas deve honrar.
`F6-R3` **não** reescreve o motor do canvas. Ver §7 e `F6-R3.5`.

### `F6-R3.5` — Contrato canônico de espaço lógico da obra · **NORMATIVO, decidido no Portão 1**

Decisão `PF6D-D-CANVAS`, congelada literalmente pelo fundador:

> *"A obra da criança possui um espaço lógico próprio e imutável. A janela é apenas uma viewport
> desse espaço. Rotação, resize, multitarefa, AppState, Control Center, background/foreground ou
> qualquer mudança de viewport NÃO podem alterar, reinicializar ou corromper as
> coordenadas/dimensões lógicas da obra."*

**Colorir / *raster* — normativo:**

| # | Regra |
|---|---|
| `R3.5-a` | O *canvas* lógico/*backing* fica atrelado à **dimensão canônica da arte** |
| `R3.5-b` | **Não** redimensionar destrutivamente o conteúdo quando a *viewport* mudar |
| `R3.5-c` | **Não** recriar `paint`/*buffers* apenas porque a tela mudou |
| `R3.5-d` | A *viewport* recalcula **somente a transformação de apresentação** |
| `R3.5-e` | Toque e *hit testing* convertem coordenadas **tela → canônicas** |
| `R3.5-f` | Preservar proporção; *letterbox*/*pillarbox* quando necessário |
| `R3.5-g` | **Sem perda silenciosa**, **sem corrupção de preenchimento** (balde), **sem pintura desalinhada do traço** |

**Criar Livre / vetor — normativo:**

| # | Regra |
|---|---|
| `R3.5-h` | Traços e carimbos **não** podem depender permanentemente de pixels da *viewport* corrente |
| `R3.5-i` | Usar coordenadas lógicas **canônicas ou normalizadas** |
| `R3.5-j` | `resize` e orientação apenas **reprojetam a apresentação** |
| `R3.5-k` | A **compatibilidade com os dados existentes** deve ser definida **antes** de qualquer migração |
| `R3.5-l` | **Nenhuma migração destrutiva** |

**Regra absoluta:** **`SD-8` continua bloqueador — ZERO perda ou corrupção de obra infantil.**

### `F6-R3.6` — Exceção formal e estreita de escopo · **autorizada, futura**

Autorizada pelo fundador no Portão Humano 1, para vigorar **somente após** os demais portões do
fluxo SDD (`PF6D-EXC-R3`):

- **`F6-R3` PODE alterar** — e **apenas** o estritamente necessário — as primitivas técnicas de
  **sistema de coordenadas**, ***resize***, **transformação de *viewport***, **ciclo de vida**,
  **preservação de estado** e **recuperação técnica** indispensáveis à rotação segura.
- **`F6-R3` NÃO PODE antecipar:** redesenho do Colorir · conclusão visual do Colorir · *Story Home
  V2* · *Página Viva* · redesenho final do Criar Livre · política comercial · `GameShell` · qualquer
  escopo de produto de **F9** ou **F12A**.

A §8 permanece integralmente em vigor; esta exceção **não** a revoga — apenas reconhece que a
fundação técnica mínima da rotação segura pertence à **Fase 6**, sem a qual `D1` não pode ser
entregue sem violar `SD-8`.

---

## 7. Colorir e Ateliê — fronteira entre `F6` e `F9`

A auditoria §5 classificou **duas camadas reais e distintas**:

| Camada | Fato | Dono | Código |
|---|---|---|---|
| **GLOBAL** | Não existe política de `resize` em lugar nenhum. O canvas é destrutível sob rotação e sob multitarefa — **e o iPad já gira hoje** (`F6-R1.1` emendada), logo a exposição é **presente**. `AtelierCanvasScreen.js:6` documenta textualmente que redimensionar **reinicia o desenho**. | **Fase 6** — `F6-R3` | `P-152` |
| **CANVAS-SPECIFIC** | `ColoringScreen` e `AtelierCanvasScreen` são as **únicas** superfícies interativas **sem** escuta de `AppState` (os quatro jogos têm). **Zero** `onContentProcessDidTerminate` / `onRenderProcessGone` em todo o `src/`. `ColoringCanvas.resize()` não recalcula `baseD`, `paintD`, `imgX/Y/W/H` nem `qBuf`/`visBuf`. | **Fase 9** — `F9-C60-LFC-01` | `P-164` |

> ### ⚠️ **RETIFICAÇÃO — Portão Humano 1, item 2**
>
> O texto anterior desta seção admitia entregar `F6-R3` *"congelando a orientação nas superfícies de
> canvas até a Fase 9"* e chamava isso de *"aceitável e provavelmente correto"*. **O fundador
> rejeitou essa saída**, textualmente: *"não é aceitável resolver `D1` simplesmente bloqueando as
> telas criativas em portrait"*. O caminho fica **vedado** e o texto abaixo o substitui.

**O que `F6-R3` entrega:** o **contrato canônico de espaço lógico** de `F6-R3.5` — a obra da
criança tem espaço lógico próprio e imutável, e a janela é apenas uma *viewport* dele. A garantia é
de que **nenhuma mudança de *viewport* altera, reinicializa ou corrompe as coordenadas e dimensões
lógicas da obra**, com **zero perda ou corrupção** (`SD-8`, bloqueador absoluto). As primitivas
técnicas indispensáveis a isso estão autorizadas pela exceção estreita de `F6-R3.6`.

**O que `F6-R3` NÃO entrega:** redesenho do Colorir, conclusão visual do Colorir, redesenho final do
Criar Livre, *Story Home V2*, *Página Viva*, `GameShell`, política comercial — nem qualquer outro
escopo de **produto** de F9 ou F12A. A recuperação de término do processo da `WebView` e a
revalidação por `AppState` permanecem de **Fase 9** (`P-164`), **exceto** na porção que a exceção
de `F6-R3.6` qualifica como *recuperação técnica indispensável à rotação segura*.

**Sobre a causa do sintoma observado:** o encerramento do processo da `WKWebView` é
**`HIPÓTESE CAUSAL PRIORITÁRIA / MECANISMO COMPATÍVEL COM A EVIDÊNCIA ESTÁTICA, AINDA NÃO
CONFIRMADO EMPIRICAMENTE`** — não é fato confirmado. O que está provado é a **ausência de defesa**.
A confirmação exige instrumentação e reprodução em `F6-SG-A`. **`P-152` e `P-164` permanecem sem
rebaixamento.**

---

## 8. Fronteira de escopo — o que **não** pertence a este delta

| Item | Dono | Nunca em F6 porque |
|---|---|---|
| Textos e coreografia do *onboarding*; qual história o tour aponta | **F7** | É conteúdo e roteiro, não geometria. F6 entrega a capacidade de mirar; F7 escolhe o alvo. |
| Propósito do Cantinho do Beni | **F7** · Portão de Produto | Congelado por `D13`; sem propósito exclusivo aprovado, não se ensina no *onboarding*. |
| *Story Home V2* — capa herói, identidade, frase central, CTA único, progresso resumido (`D5`, `D6`, `D7`, `D8`) | **F9** | É arquitetura de conteúdo editorial. |
| *Página Viva* / Leitor V2 (`D9`, `D10`) | **F9** | Substituição do Leitor atual é entrega de F9. F6 só garante que a composição de paisagem é **possível**. |
| Conclusão visual do Colorir (`D16`) | **F9** | Composição e protagonismo da obra da criança. |
| Motor de transição de cena — pré-carga, proteção de toque duplo, troca atômica (`D17`) | **F9** | É motor de mídia, não fundação de janela. |
| `JourneyOrchestrator` definitivo e semântica de "Ver mapa" | **F11** | F6 pode expor **API de infraestrutura** de âncora; a **semântica de destino** é de F11. |
| Portão do Monte a Cena — `Historia ouvida = true` (`D14`) | **F12A** | Regra de progressão, não de *layout*. |
| `GameShell` integral (`D15`) | **F12A** | É arquitetura de jogo. F6 entrega apenas a **geometria base** da família Jogo. |
| Composição final do Brincar (`D18` de escopo) | **F12A** | F6 entrega a geometria base; a composição é de F12A. |
| Alvo de toque 56×56 e piso tipográfico de 13px na barra lateral | **F6 · Bloco B2** | Já são `RF-A7` e `RF-C12` **aprovados**. Pertencem a B2, hoje **BLOQUEADO** por `D18`. |

**O que `F6` **pode** implementar depois de aprovado:** adaptatividade e dimensionamento por
janela · orientação e a infraestrutura nativa necessária · barra lateral responsiva · *wrappers* e
arquétipos de superfície · registro/fundação de geometria do mapa · fundação de ciclo de vida e
`resize` · `ONB IMG 01` e `BRI UI 01` **apenas na porção de propriedade da F6**.

---

## 9. Critérios de aceite do delta — observáveis

| ID | Critério | Como se verifica |
|---|---|---|
| `SD-1` | **Os quatro casos de `D1`**: iPhone retrato · telefone Android retrato · **iPad** retrato+paisagem · **tablet Android** retrato+paisagem. Nenhum telefone em paisagem pode ser tratado como tablet | Aparelho real: iOS **e** Android, **telefone e tablet** — quatro combinações, não duas |
| `SD-2` | As três faixas produzem composição **distinta** em pelo menos uma superfície de cada família | Captura em `<600`, `600–899`, `>=900` |
| `SD-3` | Nenhuma superfície apresenta coluna estreita centralizada com vazio lateral em `>=900` | Captura em iPad em paisagem |
| `SD-4` | Barra lateral sem vazio vertical acumulado e sem destino novo | Captura em iPad em retrato e em paisagem |
| `SD-5` | Pino, alvo de toque, brilho, *scroll* e holofote coincidem **na mesma âncora**, nas três faixas | Vídeo do tour em telefone e em iPad |
| `SD-6` | Câmera inicial acerta a mira **no tablet** (sem os 56pt fantasma) | Captura de abertura do mapa em iPad |
| `SD-7` | Rotação preserva rota, *scroll* do mapa, áudio, sessão de jogo e passo de tour | Roteiro físico de rotação |
| `SD-8` | **ZERO perda ou corrupção de obra infantil.** Nenhum desenho é perdido, desalinhado ou corrompido por rotação, `resize`, multitarefa, `AppState`, Centro de Controle ou segundo plano. As **coordenadas e dimensões lógicas** da obra permanecem intactas (`F6-R3.5`) | Roteiro físico com desenho em andamento no Colorir **e** no Ateliê, cobrindo rotação, Split View, segundo plano e Centro de Controle |
| `SD-9` | Split View e Slide Over não quebram *layout* nem estado | iPad com multitarefa real |
| `SD-10` | `npm run smoke` verde e `npx expo-doctor` verde | Portão automático |
| `SD-11` | Nenhum `Dimensions.get` introduzido; nenhum *breakpoint* novo; nenhuma dependência nova sem aprovação | Portão de *smoke* + revisão |

**`SD-8` é bloqueador absoluto** — reafirmado pelo fundador no Portão Humano 1. Se rotação,
`resize` ou multitarefa puderem perder ou corromper desenho, `F6-R1.1` **não** é liberada, qualquer
que seja o estado do resto. **E o bloqueio não pode ser contornado travando as telas criativas em
retrato** — essa saída está vedada (§7).

---

## 10. Riscos deste delta

| # | Risco | Mitigação proposta |
|---|---|---|
| `RD-1` | Liberar paisagem antes de `F6-R3` destrói arte da criança | Ordem obrigatória `F6-SG-A` (`F6-R3`) → `F6-SG-B` (`F6-R2`) → `F6-SG-C` (`F6-R1`) → `F6-SG-D` (`B2`). `SD-8` é bloqueador. |
| `RD-2` | Unificar a âncora do mapa desloca pinos hoje aceitos visualmente | Comparação de captura antes/depois nas 20 histórias, nas três faixas |
| `RD-3` | Arquétipos de superfície viram um *design system* paralelo | Estender `AppScreen`/`ContentContainer`; proibido duplicar *tokens* |
| `RD-4` | `orientation` por plataforma exige *build* novo, alongando o ciclo | Agrupar com outras mudanças de configuração da F6 num único *build* |
| `RD-5` | O Split View **já** entrega larguras variáveis hoje — o risco não é futuro. **Agravado:** o **iPad também já gira** (`F6-R1.1` emendada), logo há **dois** caminhos de `resize` abertos agora | `F6-R3` cobre rotação **e** Split View, e é necessária **mesmo que `F6-R1.1` não altere nada** |
| ~~`RD-6`~~ | ~~Congelar orientação no canvas cria incoerência percebida ("tudo gira menos o Colorir")~~ | **SUPERADO no Portão 1:** congelar as telas criativas em retrato está **vedado** (`PF6D-D-CANVAS`). O risco deixa de existir porque a saída que o produzia foi rejeitada. Mantido tachado — risco registrado não se apaga |
| `RD-7` | *(novo, emenda do Portão 1)* **Tablet Android é o único vão real de `D1` e não tem solução de configuração conhecida e provada** — `android:screenOrientation` é chave única, sem variante por *idiom* | Comparação objetiva das vias **A/B/C/D** na etapa PLAN, com prova de mecanismo antes de escolher. **Nenhuma dependência instalada até lá** |
| `RD-8` | *(novo, emenda do Portão 1)* Tratar a hipótese causal do término da `WKWebView` como fato levaria a "corrigir" a causa errada e declarar resolvido o que não foi | Causa registrada como **hipótese não confirmada**; confirmação exige instrumentação e reprodução em `F6-SG-A`, antes de qualquer declaração de correção |
