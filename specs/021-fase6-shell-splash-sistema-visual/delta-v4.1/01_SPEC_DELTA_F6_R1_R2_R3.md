# F6-DELTA0 · Especificação do delta da Fase 6 — `F6-R1`, `F6-R2`, `F6-R3`

> **Estado:** **AGUARDANDO PORTÃO HUMANO 1.** Nenhuma linha de código de `F6-R1`, `F6-R2` ou
> `F6-R3` foi escrita. Não existe `plan.md` nem `tasks.md` deste delta.
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

### `F6-R1.1` — Política de orientação por plataforma (`D1`)

- Telefones (Android e iOS) permanecem em **retrato**.
- Tablets e iPads suportam **retrato e paisagem**.
- A distinção vive na **configuração de plataforma**, não em código de tela — de modo que `D2`
  continue verdadeira: o código nunca pergunta *"sou um tablet?"*, só *"que largura eu tenho?"*.
- A opção técnica recomendada pela auditoria é **O1** (`UISupportedInterfaceOrientations~ipad`
  explícito no `ios.infoPlist` + `screenOrientation` de Android mantido em `portrait`), **sem
  dependência nova**. A escolha final é do Portão Humano 2.
- **Precondição inegociável:** `F6-R1.1` **não pode ser aplicada antes** de `F6-R3` estar
  implementada e validada, e antes de a política de canvas da §7 estar decidida. Liberar a paisagem
  sobre a fundação atual **destrói desenho** (auditoria §5.2).

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
`F6-R3` **não** reescreve o motor do canvas. Ver §7.

---

## 7. Colorir e Ateliê — fronteira entre `F6` e `F9`

A auditoria §5 classificou **duas camadas reais e distintas**:

| Camada | Fato | Dono | Código |
|---|---|---|---|
| **GLOBAL** | Não existe política de `resize` em lugar nenhum. Liberar paisagem torna o canvas destrutível. `AtelierCanvasScreen.js:6` documenta textualmente que redimensionar **reinicia o desenho**. | **Fase 6** — `F6-R3` | `P-152` |
| **CANVAS-SPECIFIC** | `ColoringScreen` e `AtelierCanvasScreen` são as **únicas** superfícies interativas **sem** escuta de `AppState` (os quatro jogos têm). **Zero** `onContentProcessDidTerminate` / `onRenderProcessGone` em todo o `src/`. `ColoringCanvas.resize()` não recalcula `baseD`, `paintD`, `imgX/Y/W/H` nem `qBuf`/`visBuf`. | **Fase 9** — `F9-C60-LFC-01` | `P-164` |

**O que `F6-R3` entrega:** a garantia de que a arte da criança **não é destruída por
redimensionamento** — seja congelando a orientação nas superfícies de canvas até a Fase 9, seja
por outro mecanismo aprovado no Portão 2. **Congelar é aceitável e provavelmente correto:** a
paisagem no canvas é valor de produto que pertence à Fase 9, e não vale o risco de perder desenho.

**O que `F6-R3` NÃO entrega:** recuperação de término do processo da `WebView`, revalidação por
`AppState`, reescalonamento de traço vetorial, reamostragem da camada de pintura. **Tudo isso é
Fase 9.**

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
| `SD-1` | Telefone permanece em retrato; tablet aceita retrato e paisagem | Aparelho real, iOS **e** Android |
| `SD-2` | As três faixas produzem composição **distinta** em pelo menos uma superfície de cada família | Captura em `<600`, `600–899`, `>=900` |
| `SD-3` | Nenhuma superfície apresenta coluna estreita centralizada com vazio lateral em `>=900` | Captura em iPad em paisagem |
| `SD-4` | Barra lateral sem vazio vertical acumulado e sem destino novo | Captura em iPad em retrato e em paisagem |
| `SD-5` | Pino, alvo de toque, brilho, *scroll* e holofote coincidem **na mesma âncora**, nas três faixas | Vídeo do tour em telefone e em iPad |
| `SD-6` | Câmera inicial acerta a mira **no tablet** (sem os 56pt fantasma) | Captura de abertura do mapa em iPad |
| `SD-7` | Rotação preserva rota, *scroll* do mapa, áudio, sessão de jogo e passo de tour | Roteiro físico de rotação |
| `SD-8` | **Nenhum desenho da criança é perdido ou desalinhado** por rotação ou Split View | Roteiro físico com desenho em andamento no Colorir e no Ateliê |
| `SD-9` | Split View e Slide Over não quebram *layout* nem estado | iPad com multitarefa real |
| `SD-10` | `npm run smoke` verde e `npx expo-doctor` verde | Portão automático |
| `SD-11` | Nenhum `Dimensions.get` introduzido; nenhum *breakpoint* novo; nenhuma dependência nova sem aprovação | Portão de *smoke* + revisão |

**`SD-8` é bloqueador absoluto.** Se rotação puder perder desenho, `F6-R1.1` **não** é liberada,
qualquer que seja o estado do resto.

---

## 10. Riscos deste delta

| # | Risco | Mitigação proposta |
|---|---|---|
| `RD-1` | Liberar paisagem antes de `F6-R3` destrói arte da criança | Ordem obrigatória `F6-R3` → `F6-R2` → `F6-R1.1`. `SD-8` é bloqueador. |
| `RD-2` | Unificar a âncora do mapa desloca pinos hoje aceitos visualmente | Comparação de captura antes/depois nas 20 histórias, nas três faixas |
| `RD-3` | Arquétipos de superfície viram um *design system* paralelo | Estender `AppScreen`/`ContentContainer`; proibido duplicar *tokens* |
| `RD-4` | `orientation` por plataforma exige *build* novo, alongando o ciclo | Agrupar com outras mudanças de configuração da F6 num único *build* |
| `RD-5` | O Split View **já** entrega larguras variáveis hoje — o risco não é futuro | `F6-R3` cobre Split View mesmo se `F6-R1.1` for adiada |
| `RD-6` | Congelar orientação no canvas cria incoerência percebida ("tudo gira menos o Colorir") | Decisão de produto explícita no Portão 2; comunicada e registrada, nunca silenciosa |
