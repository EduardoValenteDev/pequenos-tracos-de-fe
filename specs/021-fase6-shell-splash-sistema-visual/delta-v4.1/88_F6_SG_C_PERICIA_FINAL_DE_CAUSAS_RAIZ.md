# 88 · F6 · SG-C · ESTABILIZAÇÃO RESPONSIVA — PERÍCIA FINAL DE CAUSAS RAIZ

> **Rodada SOMENTE LEITURA.** Nenhum arquivo de `src/**` foi tocado. Nenhum patch aplicado
> (inclusive o da `HomeScreen`, que continua parado desde o artefato `86`). Nenhum `git add`,
> commit, push ou build. Nenhum vídeo novo pedido. Nenhuma fase criada. Nenhum escopo ampliado.
>
> Este artefato transforma os achados físicos da campanha de `SG-C`, o adendo de observação do
> fundador e a auditoria abrangente do artefato `87` em um mapa técnico:
> **ACHADO → OWNER → CAUSA RAIZ → CORRIGIR AGORA / DEFERIR → MENOR PONTO ARQUITETURAL →
> RAIO DE REGRESSÃO.**

---

## 1. Princípio ratificado (§1)

O app **continua suportando retrato e paisagem**. Nada aqui bloqueia orientação globalmente.
As faixas permanecem as canônicas — **COMPACTO `<600dp` · MÉDIO `600–899dp` · EXPANDIDO `>=900dp`** —
e **nenhuma correção proposta é por modelo de aparelho**: o SM-X510 é uma *amostra* de MÉDIA
(retrato, 823dp) e de EXPANDIDA (paisagem, 1317dp), e é assim que ele é usado abaixo.

## 2. Regra de retrabalho aplicada (§2)

| Classificação | Significado operacional nesta perícia |
|---|---|
| `FIX_NOW_FOUNDATION` | contrato estrutural compartilhado, quebrado, com consumidores múltiplos |
| `FIX_NOW_FUNCTIONAL` | defeito funcional objetivo, independente de gosto visual |
| `FIX_NOW_STABLE_SURFACE` | superfície **estável e entregue pelo próprio `F6-SG-C`** que consome uma causa estrutural |
| `DEFER_TO_EXISTING_OWNER` | tela com fase proprietária futura **provada por documento canônico** |
| `PASS_NO_CHANGE` | contrato já cumprido, ou observação sem critério canônico |

**Nenhuma tela com owner futuro é polida nesta rodada.** Os owners abaixo são provados por
`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` §3 e pelas tasks `TK-C-004`..`TK-C-012` —
nunca por memória.

---

## 3. CAUSA A — área útil, barra lateral e *insets* (§3)

A perícia encontrou **duas falhas distintas** sob o rótulo "CAUSA A". Elas compartilham o
arquivo, mas não o mecanismo, e por isso não podem ser corrigidas com o mesmo patch.

### 3.1 `A1` — o arquétipo cai na JANELA quando o chamador não mede

```
ROOT_CAUSE_A1 = Os três arquétipos aceitam `availableWidth` como prop de primeira classe,
                mas, na ausência dela, caem em `useWindowBand().width` — a JANELA INTEIRA.
                Nas telas de ABA a janela NÃO é a área útil: a barra lateral é a tabBar
                (posicionada à esquerda), logo a região real é `janela − 180dp` (rail) ou
                `janela − 240dp` (full). O contrato §19.1 restrição 4 / `G-SID-3` / `RG-12`
                manda que "quem precisa do espaço MEDE" — e três consumidores não medem.
SHARED_OR_LOCAL = COMPARTILHADA (contrato) + LOCAL (ponto de chamada de cada tela)
```

| `FILES_INVOLVED` | Papel |
|---|---|
| `src/components/layout/HubSurface.js` | `useHubComposition` — `Number.isFinite(availableWidth) ? availableWidth : width` |
| `src/components/layout/EditorialSurface.js:131-132` | mesmo *fallback* |
| `src/components/layout/ImmersiveSurface.js` | mesmo *fallback* |
| `src/hooks/useWindowBand.js` | fornece a janela — **correto**, não é o defeito |
| `src/components/TabletSidebar.js` | dono do *token* de largura (180/240) — **não** deve ser subtraído por ninguém |

**`CONSUMERS_AFFECTED` — com e sem manifestação numérica.** A distinção é decisiva e evita
patch inútil: **só telas de ABA têm barra lateral.** Nas telas de *stack* a janela **é** a área
útil, e o *fallback*, embora contratualmente errado, entrega o número certo.

| Consumidor | Tipo | Mede? | Manifestação |
|---|---|---|---|
| `HomeScreen.js:805` | **ABA** | não | **SIM — `KNOWN_HOME_FAIL`**: `floor(1317/420)=3` colunas onde cabem `floor(1077/420)=2`; célula 359dp contra `HUB_MIN_CARD` 420dp (−14,5 %) |
| `BrincarScreen.js:259` | **ABA** | não | **latente** — `HUB_MIN_BLOCO=420`: 1317 e 1077 dão hoje o mesmo resultado, mas a conta está errada |
| `TrophiesScreen.js:250` (aba) | **ABA** | não | **latente** — a grade de conquistas pode abrir uma coluna a mais do que cabe |
| `TrophiesScreen` (`EstrelinhasCena`) | *stack* | não | sem manifestação (sem barra lateral) |
| `AtelierGalleryScreen.js:76-77` | *stack* | **SIM** (`availableWidth: larguraLista`) | **correto** — é o único que cumpre `G-SID-3` |
| `StoryDetailScreen.js:611`, `PostStoryHubScreen.js:107`, `ReflectionScreen.js:140`, `ParentAreaScreen.js:682` | *stack* | não | sem consequência numérica; **atingidas por `A2`**, abaixo |
| `AtelierCanvasScreen.js:413`, `ColoringScreen.js:1248`, `StoryBookScreen.js:794` | *stack* | não | sem consequência (a superfície preenche a janela por desenho) |

```
CURRENT_CONTRACT = "quem precisa do espaço MEDE" (§19.1 restr. 4 · G-SID-3 · RG-12) +
                   `availableWidth` como prop de primeira classe nos três arquétipos.
                   O contrato EXISTE e está escrito; o que falta é adesão do chamador.
MISSING_CONTRACT = nada no código OBRIGA o chamador de ABA a medir. `G-RSP-2` e `G-RSP-6`
                   exercitam a aritmética do arquétipo com `availableWidth` fornecido pelo
                   arnês (smoke.js:53688-53716 e :53791) e por isso passam mesmo quando
                   nenhum chamador mede. A lacuna é da REDE, não da conta.
MINIMUM_ARCHITECTURAL_FIX_A1 =
  (i)  a TELA DE ABA mede sua própria região com `onLayout` no container do conteúdo e
       passa o resultado como `availableWidth` — exatamente o padrão que
       `AtelierGalleryScreen` já usa (não se inventa mecanismo novo);
  (ii) um gate de smoke que falhe quando um consumidor de ABA de arquétipo NÃO passa
       `availableWidth` — o teste que hoje não existe.
DO_NOT_TOUCH = o token de largura da barra lateral (180/240) e qualquer subtração aritmética
               dele dentro de tela. Reduzir 240 para outro número NÃO é a correção, não há
               prova de necessidade, e subtrair o token viola `G-SID-3` diretamente.
```

### 3.2 `A2` — a faixa EXPANDIDA inverte a hierarquia leitura × apoio

Esta é a origem técnica do que o fundador descreveu como *"posicionamento e composição
inadequados das informações"* em paisagem, e **não** depende de barra lateral.

```
ROOT_CAUSE_A2 = Em EditorialSurface.js:149-163 a coluna de leitura recebe largura FIXA
                (`layout.columnMaxWidth`, 640dp) com `leitura: { flexShrink: 0 }`, e a região
                de apoio recebe `apoio: { flex: 1 }` — TODO o excedente. Numa janela de
                1317dp isso entrega ~677dp ao apoio contra 640dp da leitura: o material
                secundário (o Guia do Beni) fica MAIOR que o conteúdo principal. A intenção
                declarada no próprio arquivo ("o excedente é da região de apoio") é correta
                para uma sobra pequena e torna-se desproporcional na faixa EXPANDIDA real.
SHARED_OR_LOCAL = COMPARTILHADA — quatro consumidores Editorial, todos telas de stack.
FILES_INVOLVED  = src/components/layout/EditorialSurface.js (`editorialLayout` + estilos)
CONSUMERS_AFFECTED = StoryDetailScreen · PostStoryHubScreen · ReflectionScreen · ParentAreaScreen
CURRENT_CONTRACT = `SD-3` proíbe que a sobra vire "vazio dominante"; `SD-4` define a região
                   de apoio. Nenhum dos dois autoriza o apoio a SUPERAR a leitura.
MISSING_CONTRACT = um TETO para a região de apoio (ou um piso de proporção leitura:apoio).
MINIMUM_ARCHITECTURAL_FIX_A2 = limitar a região de apoio dentro de `editorialLayout` — a conta
                   já é pura e já é coberta por `G-RSP-6`; o teto entra na função, não no
                   estilo, e nenhum consumidor muda de código.
DO_NOT_TOUCH = `columnMaxWidth` / `ContentContainer` (a medida de linha de leitura é canônica).
```

---

## 4. CAUSA B — rotação e *resize* em duas etapas (§4)

```
ROOT_CAUSE_B = Padrão comum e reproduzível: a geometria de conteúdo é derivada de
               `onLayout → setState` (ou publicada a um motor dentro de um efeito),
               enquanto `useWindowDimensions()` já entregou a NOVA janela no mesmo quadro.
               Resultado: quadro 1 desenha com a janela nova e a geometria velha; quadro 2
               corrige quando o `onLayout` chega. O "salto em duas etapas" é essa defasagem
               de UM ciclo entre duas fontes de verdade que ninguém sincroniza.
IS_GLOBAL = PARCIALMENTE. É um PADRÃO compartilhado, não um módulo compartilhado: não existe
            hoje nenhum utilitário único de geometria que possa ser corrigido uma só vez.
```

| `AFFECTED_COMPONENTS` | Evidência |
|---|---|
| `MonteACenaTableGameScreen.js` | `useWindowDimensions()` → layout; motor alimentado por `useEffect(pushGeometry)` **e** `onLayout={pushGeometry}` |
| `CadeAOvelhinhaScreen.js` | `medirArea` no `onLayout` do `cenaWrap`; viewport da cena derivada do estado medido |
| `ParesDoBeniScreen.js` | mesmo padrão de tabuleiro medido |
| `AdventureMapScreen.js` | mede `contentW`; ver `C1` — aqui o padrão tem consequência de POSIÇÃO, não só de escala |
| `ProfileScreen.js` | **NÃO tem geometria medida** — só `useWindowDimensions().height` para rolar até alvos do guia; larguras em percentual |

```
STATE_PRESERVATION    = PRESERVADO. Nenhum caso examinado remonta a árvore na rotação; o
                        estado de jogo, de progresso e de sessão sobrevive.
LAYOUT_TIMING         = a defasagem é de UM quadro (commit → layout → segundo commit).
WINDOW_DIMENSION_FLOW = `useWindowDimensions` atualiza SÍNCRONO com o novo tamanho; `onLayout`
                        chega DEPOIS do primeiro commit. As duas fontes coexistem sem árbitro.
REMOUNT_INVOLVED      = NÃO em nenhum caso observado. Isto importa: descarta a hipótese de
                        "recriação de árvore" (`C12`) e mantém o defeito no domínio do TEMPO.
MINIMUM_ARCHITECTURAL_FIX_B =
  eleger UMA fonte de verdade por superfície e derivar a outra, em vez de reconciliá-las:
  a geometria passa a ser calculada a partir do valor de `useWindowDimensions` MENOS as
  medidas conhecidas (insets + região já medida), com o `onLayout` servindo apenas para
  CORRIGIR divergência real — nunca como gatilho inicial. Isso remove o quadro intermediário
  sem introduzir dependência nova e sem tocar a lógica de cada jogo.
```

**Ressalva de honestidade — `ProfileScreen`.** O "duas etapas" observado no Perfil **não tem
fonte na tela**: ela não mede nada. As causas restantes possíveis são a animação de transição
do *shell* de abas ou o próprio `tabBar` lateral. **Nenhuma correção de Perfil é proposta
nesta rodada**: exige observação instrumentada (um `RED TEST` com marcação de quadros) antes
de qualquer patch. Propor patch aqui seria adivinhação.

---

## 5. CAUSA C — o Mapa (§5)

### 5.1 `C1` — posição lógica na rotação

```
MAP_POSITION_ROOT_CAUSE = O invariante lógico que o fundador exige JÁ EXISTE em
  `AdventureMapScreen.js` (`posLogicaRef = { regionIndex, frac, valida }` + `reprojetarRef`,
  entregues por TK-A-017/018/019). O defeito é de GRAVAÇÃO, não de reprojeção: o par lógico
  só é gravado dentro do `onScroll` sob `if (userScrolledRef.current)`, e `userScrolledRef`
  só vira `true` em `onScrollBeginDrag`. Quem entra no mapa, deixa a câmera posicionar e
  gira SEM ARRASTAR chega à rotação com `valida = false`; a reconciliação então cai no
  caminho da câmera e o mapa "volta para a âncora" — que o fundador lê, corretamente,
  como "perdeu o lugar".
CURRENT_STATE_MODEL = par lógico (índice de região + fração dentro da região) — CORRETO —
                      porém condicionado a um gesto humano prévio.
PROPOSED_LOGICAL_INVARIANT = a posição lógica é FUNÇÃO DO ESTADO VISÍVEL, não do histórico
                      de gestos: sempre que houver layout válido, o par lógico correspondente
                      ao topo da viewport é conhecido — venha ele de arrasto, de câmera
                      programática ou da posição inicial.
MINIMUM_FIX_C1 = remover a dependência do gesto na gravação do par (derivá-lo também quando
                 a posição foi definida pela câmera). É a menor mudança possível: o cálculo,
                 o clamp e a reprojeção já estão escritos e já passaram por gate.
NÃO FAZER = preservar `scrollY` bruto. Ele não representa o mesmo ponto lógico entre duas
            larguras, e o código já rejeitou esse caminho — não se volta a ele.
```

### 5.2 `C2` — escala em paisagem

```
MAP_SCALE_ROOT_CAUSE = A altura de cada região é função EXCLUSIVA da largura:
  `computeRegionHeight(width) = round(width / MAP_ASPECT)` com `MAP_ASPECT = 9/16`
  (`src/data/adventureMap.js`), isto é `width * 16/9`. Não existe teto pela altura da
  viewport. Em paisagem a largura cresce e a altura cresce JUNTO: uma região passa a
  ~1915dp de altura para uma viewport de ~560dp — a arte fica ~3,4× mais alta que a
  janela, e o mapa vira um corredor vertical estreito de rolagem.
CAN_ADJUST_WITHOUT_CHANGING_ANCHOR = SIM, sem ambiguidade. `MAP_ANCHOR_FRAMING = 0.50` é uma
  FRAÇÃO DA VIEWPORT dentro de `computeCameraTarget` (`src/services/mapAnchor.js`); mudar a
  REGRA DE ESCALA não toca a fração. **A âncora 0,50 permanece congelada (Q6/A-18) e esta
  perícia NÃO a reabre.**
MINIMUM_FIX_C2 = introduzir um teto de altura de região relativo à viewport dentro de
  `computeRegionHeight` (ou de um `computeRegionLayout` que passe a receber a altura da
  viewport). A regra "contain" necessária JÁ EXISTE e já é usada pelo modal "Ver mapa"
  (`computeImageRect(containerW, containerH)`) — reutiliza-se a regra que o projeto tem,
  não se inventa uma segunda.
FILES = src/data/adventureMap.js · src/services/mapAnchor.js (assinatura) ·
        src/components/map/MapRegion.js (consumidor) · src/screens/AdventureMapScreen.js
NÃO REABRIR = SG-B, âncora 0,50, comparador visual Q6.
```

### 5.3 `C3` — placeholders (letra inicial) nos pinos do mapa

```
PLACEHOLDER_ROOT_CAUSE = NÃO é capa ausente e NÃO é resolver divergente — as duas hipóteses
  foram DESCARTADAS por evidência direta:
    · `src/assets/storyCovers.js` tem 20 capas para 20 histórias — nenhuma história sem capa;
    · `StoryMapMarker.js` e `StoryFocusModal.js:106` usam o MESMO resolver
      (`useResolvedStoryCover`), e o modal exibe a capa corretamente na mesma sessão.
  A letra inicial em `StoryMapMarker.js` só pode aparecer pelo `renderFallback` de
  `RecoverableImage`, que exige um `onError` REAL da decodificação.
AFFECTED_STORIES = variável entre sessões e conforme a rolagem — comportamento típico de
                   PRESSÃO, não de dado faltante.
ASSET_EXISTS = SIM, para todas.
MAP_RESOLVER  = `useResolvedStoryCover(story.id, getStoryCover(story.id))`
CARD_RESOLVER = `src/components/StoryCard.js:21` usa um resolver LOCAL DIFERENTE
                (`images[story.imagemCapa]`) — divergência real de arquitetura, porém ela
                NÃO é a causa dos placeholders do mapa (o mapa não usa `StoryCard`).
SINGLE_CANONICAL_ARTWORK_RESOLVER_POSSIBLE = SIM, tecnicamente — mas é UNIFICAÇÃO, não
                correção de defeito, e não pertence a esta rodada.
MECANISMO MAIS PROVÁVEL (inferido, NÃO provado) = pressão de decodificação: cada região do
  mapa monta até 4 imagens *full-bleed* de ~1915dp de altura em paisagem (mesma raiz de
  `C2`), e cada pino decodifica uma capa 16:9 INTEIRA para exibi-la num círculo de 40–56dp.
  O logcat da campanha não mostra OOM nem erro de `ImagePipeline`, mas registra 100+
  `WrappingUtils … ReactImageDownloadListener$EmptyDrawable` — imagens arredondadas, isto é,
  os pinos.
MINIMUM_FIX_C3 = NÃO DEFINIDO NESTA RODADA. Exige `RED TEST` instrumentado que capture o
  `onError` real antes de qualquer patch. Mitigação candidata sem asset novo: repassar
  `resizeMethod="resize"` por `RecoverableImage`. **Corrigir `C2` primeiro pode fazer o
  sintoma desaparecer sozinho** — e essa é a razão da ordem proposta no §14.
```

---

## 6. CAUSA D — documento lógico do Criar Livre (§6)

**Achado central: o contrato exigido pelo fundador JÁ ESTÁ IMPLEMENTADO** (entrega de
`TK-A-034`) e foi verificado linha a linha em `src/components/AtelierCanvas.js`.

```
CURRENT_CANVAS_COORDINATE_MODEL = DOIS espaços explícitos e separados:
  · `W,H`   = espaço de TELA  — recalculado a cada `resize`, NUNCA persistido;
  · `LW,LH` = espaço LÓGICO   — adotado uma vez (`adotarEspacoLogico`) e TRAVADO por
              `espacoTravado` no primeiro `commit()` (trava de mão única).
VIEWPORT_DEPENDENCE          = apenas a PROJEÇÃO (`pS`,`pX`,`pY` em `reprojetar()`), que é
                               "contain" puro: `pS = min(W/LW, H/LH)`, centralizado.
ROTATION_EFFECT_ON_STROKES   = NENHUM. Os traços vivem em coordenadas lógicas.
ROTATION_EFFECT_ON_DOCUMENT_BOUNDS = NENHUM após o primeiro traço: `resize()` só readota o
                               espaço lógico enquanto `!espacoTravado`.
SAVE_GEOMETRY_DEPENDENCE     = NENHUMA sobre a tela. A exportação REDESENHA o modelo em
                               `LW×LH` (`paintInto(ctx,1,0,0,false,false)`), e o payload
                               grava `logicalW/logicalH` — a arte nunca é reamostrada do
                               buffer de tela.
TEXT_BOX_ACCESS_IN_LANDSCAPE = **O ÚNICO PONTO ABERTO.** Em `AtelierCanvasScreen.js` a caixa
                               de nome é um *sheet* ancorado embaixo (`nameOverlay` com
                               `justifyContent:'flex-end'`, `nameCard` ~190dp) dentro de um
                               `KeyboardAvoidingView` com `behavior='height'` no Android.
                               Em paisagem, altura útil pequena + teclado + 190dp de cartão
                               competem pelo mesmo espaço.

DOCUMENT_LOGICAL_SPACE  = JÁ EXISTE (`LW,LH`, travado)                         → cumprido
VIEW_TRANSFORM          = JÁ EXISTE (`pS,pX,pY`)                               → cumprido
PORTRAIT_PROJECTION     = contain centralizado                                  → cumprido
LANDSCAPE_PROJECTION    = contain centralizado (mesma função)                   → cumprido
SAVE_INVARIANT          = exportação em LW×LH, independente da tela             → cumprido

MINIMUM_ARCHITECTURAL_FIX_D = NENHUM no modelo de coordenadas — `PASS_NO_CHANGE`.
                              Resta apenas `D2` (caixa de texto em paisagem), que é defeito
                              FUNCIONAL de acesso, não do documento lógico.
REUSABLE_BY_OTHER_CANVASES = SIM. O par (espaço lógico travado + projeção contain + export
                              redesenhado) é genérico e serviria a `ColoringScreen` e a
                              qualquer canvas futuro. **Extração não é feita agora**: não há
                              segundo consumidor pedindo, e extrair sem consumidor é escopo.
NÃO FAZER = redesenhar ferramentas nesta etapa.
```

---

## 7. CAUSA E — Cadê a Ovelhinha (§7)

### 7.1 `E1` — inicialização da cena

```
SHEEP_INITIALIZATION_ROOT_CAUSE = A saída do estado "coberto" depende EXCLUSIVAMENTE da
  chegada dos três eventos de exibição (`preview`, `background`, `sceneSheep`) com token
  igual ao da rodada corrente (`src/services/ovelhaTransition.js`, caso `EXIBIDA`).
  **Não existe watchdog temporal**: o único caminho alternativo de recuperação é `temErro`,
  que exige um `onError` explícito. Logo, se qualquer um dos três eventos não chegar — e há
  pelo menos um caminho em que não chega: retângulo de imagem ainda vazio quando o container
  é montado, antes de `medirArea` — a capa técnica permanece e o jogo não inicia, sem
  qualquer sinal de erro para o usuário.
  A hipótese de "corrida de token" foi DESCARTADA: `rodadaRef.current = rodada` é atribuído
  DURANTE o render (linha 210), não em efeito, portanto o token já está correto quando o
  callback dispara.
DEPENDENCE_ON_LAYOUT_EVENT = SIM, indireta e decisiva. As imagens só recebem retângulo
  explícito depois que `medirArea` (o `onLayout` do `cenaWrap`) publica a área. `computeViewport`
  nunca degenera a largura (há guarda contra zero), mas antes da primeira medida o retângulo
  pode ser vazio — e um retângulo vazio não produz exibição.
DEPENDENCE_ON_DIMENSIONS = indireta, pela mesma via (`medirArea` reage ao tamanho do container).
DEPENDENCE_ON_ROTATION    = SIM na sequência: rotação → nova medida → novo retângulo → novo
  ciclo de carga SEM novo token. É aqui que `E1` toca a CAUSA B.
MINIMUM_FIX_E1 = um caminho de recuperação que NÃO dependa de `onError`: uma ação de expiração
  por rodada no reducer (`ovelhaTransition.js`) que, esgotado o prazo, force `RETRY` com novo
  nonce. O reducer é puro e já testado — é o menor ponto arquitetural, e a tela só passa a
  agendar/cancelar o disparo.
FILES = src/services/ovelhaTransition.js (reducer) · src/screens/CadeAOvelhinhaScreen.js (disparo)
NÃO FAZER = mexer no gate de exibição em si, nas chaves `kBg`/`kSheep` ou em `computeViewport`.
```

### 7.2 `E2` — colisão na borda inferior

```
É CAUSA A? = NÃO. A tela JÁ consome os insets: o container medido aplica
             `paddingBottom: Math.max(insets.bottom, 8) + 4`, e não há barra lateral nem
             `availableWidth` envolvido (é tela de stack). O mecanismo é outro: em paisagem
             a altura útil encolhe e a cena (viewport com `maxLargura = 560`) disputa altura
             com os controles do jogo abaixo dela.
CLASSIFICAÇÃO = DEFER_TO_EXISTING_OWNER (Fase 12A, provado por `TK-C-012`) — é composição em
             ALTURA de uma tela cujo layout tem dono futuro.
CONDIÇÃO DE PROMOÇÃO = se a revalidação física de `B` demonstrar CONTROLE INALCANÇÁVEL
             (violação de `C9`), o achado sobe para `FIX_NOW_FUNCTIONAL`. Com a evidência
             disponível hoje, inacessibilidade funcional NÃO está demonstrada.
```

### 7.3 `E3` — salto após rotação

```
É CAUSA B? = SIM, integralmente. Mesma defasagem de um quadro entre `useWindowDimensions`
             e `medirArea`. NÃO gera patch próprio: é absorvido pelo commit da CAUSA B.
CLASSIFICAÇÃO = coberto por `FIX_NOW_FOUNDATION` (CAUSA B).
```

### 7.4 `E4` — distância entre os modos e o CTA

```
CLASSIFICAÇÃO = DEFER_TO_EXISTING_OWNER. Owner provado: Fase 12A — "quatro jogos finais +
                seção criativa + aba Brincar" (v5 §3) e `TK-C-012`, que declara textualmente
                que `MonteACena`, `ParesDoBeni`, `Palavrinhas`, `CadeAOvelhinha` e `QuizScreen`
                "permanecem intocados". É espaçamento, não função.
```

---

## 8. Consumidores estáveis (§8)

| Superfície | `CURRENT_OWNER` | `FUTURE_REDESIGN_EXISTS` | `STRUCTURAL_CAUSE_CONSUMED` | `LOCAL_FIX_STILL_REQUIRED` | `CLASSIFICATION` |
|---|---|---|---|---|---|
| **HomeScreen** | `TK-C-008` (F6-SG-C) | **SIM — Fase 7** ("Home final", v5 §3) | `A1` | **SIM** — medir a região e passar `availableWidth` | **`FIX_NOW_STABLE_SURFACE`** |
| **BrincarScreen** | `TK-C-008` | SIM — Fase 12A (aba Brincar) | `A1` (latente) | **SIM** — mesma linha | **`FIX_NOW_STABLE_SURFACE`** |
| **ParentAreaScreen** | `TK-C-006`/`TK-C-009` | SIM — Fase 7 ("Área dos Pais") | `A2` | **NÃO** — o teto vive no arquétipo | **`FIX_NOW_STABLE_SURFACE`** (sem tocar a tela) |
| **ProfileScreen** | fora do inventário de adoção (`TK-C-011`/`TK-C-012`) | não provado por documento canônico | `B` — **não comprovada na tela** | INDETERMINADO | **`PASS_NO_CHANGE`** nesta rodada (já registrado como `RESIDUAL_VISUAL_FORA_DO_GATE` no artefato 87) |
| **TrophiesScreen / Estrelinhas** | `TK-C-008` | SIM — Fase 11 ("Estrelinhas e horizonte do mapa") | `A1` (latente, sem manifestação hoje) | ver §11 | **`PASS_NO_CHANGE`** — §11 da ordem determina `PASS_NO_CHANGE` para Estrelinhas; a violação latente fica **registrada**, não corrigida |

**A distinção que justifica corrigir Home e Brincar apesar do redesenho futuro:** passar
`availableWidth` **não é polir tela** — é cumprir `G-SID-3`/`RG-12`, contrato que o próprio
`F6-SG-C` entrega (`TK-C-008`). **Nenhum pixel de composição visual de Home é redesenhado
aqui**; isso continua sendo da Fase 7.

---

## 9. Bordas cinzas (§9)

```
GRAY_BORDER_ROOT_CAUSE = DUAS origens distintas, nenhuma acidental:
  (i)  estilo INTENCIONAL de conquista bloqueada — `TrophiesScreen.cardLocked`:
       `borderWidth: 1.5`, `borderColor: '#E7DECF'`, `backgroundColor: '#F7F2EB'`, `opacity: .96`.
       É linguagem de produto ("ainda não conquistado"), não defeito.
  (ii) `productTheme.shadows.card` (`elevation: 4`) e `shadows.soft` (`elevation: 2`)
       combinadas com `overflow: 'hidden'` + `position: 'relative'` nos cartões: no Android a
       sombra de elevação é recortada pelo `overflow` e o halo remanescente é lido como
       uma borda cinza fina.
SHARED_COMPONENT = `src/theme/productTheme.js` (origem ii) — compartilhado por todo o app.
                   A origem (i) é local de `TrophiesScreen`.
AFFECTED_SURFACES = toda superfície que usa `shadows.card`/`shadows.soft` com `overflow:'hidden'`.
FIX_NOW = NÃO. Três razões independentes: a ordem determina "não alterar nesta rodada";
          o design system é ÁREA PROTEGIDA (só com instrução direta); e nenhum critério
          canônico de `SG-C` é violado — é residual visual.
```

---

## 10. Telas com owner futuro (§10) — provadas por documento canônico

Nenhuma fase citada de memória. Fonte: `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` §3 e
as tasks do delta `F6`.

| `OBSERVATION` | `STRUCTURAL_PROBLEM` | `FUNCTIONAL_PROBLEM` | `FUTURE_OWNER` (prova) | `LAYOUT_REDESIGN_ALREADY_EXPECTED` | `FIX_NOW` | `DEFER_REASON` |
|---|---|---|---|---|---|---|
| Livrinho: vazio lateral em paisagem | não — a família Imersiva **declara** a capacidade de acompanhante e não a implementa | não | **Fase 9** — v5 §3 linha 312: "narração, cenas, quiz, Momento/Guardar no coração, **Livrinho**". *(A "Fase 10 — Meu Livro" é superfície DISTINTA; não há conflito de owner.)* | **SIM** — capacidade `D10` explicitamente diferida por `TK-C-004` | **NÃO** | contrato já declara a diferição; corrigir agora seria antecipar entrega de F9 |
| Jogos (Pares, Palavrinhas, Ovelhinha, Monte a Cena × 5 telas): composição em paisagem | não | não demonstrado | **Fase 12A** — v5 §3: "quatro jogos finais + seção criativa + aba Brincar"; `TK-C-012` diz que estas telas "permanecem intocados" | SIM | **NÃO** | `GameSurface` existe e tem ZERO consumidores por contrato |
| `QuizScreen` | não | não | **Fase 12A** (`TK-C-012`, citado nominalmente) | SIM | **NÃO** | §11 da ordem: `PASS_NO_CHANGE` |
| `ProfileScreen`: sem coluna de leitura em paisagem | não — fora do inventário de adoção | não | **não provado** — o roadmap não nomeia o Perfil | não | **NÃO** | impor coluna criaria requisito novo (proibido) |

---

## 11. Quiz e Estrelinhas (§11)

```
QuizScreen   = PASS_NO_CHANGE
Estrelinhas  = PASS_NO_CHANGE
```

Registrado sem correção, para não perder a informação: a **aba** Estrelinhas consome `A1` de
forma **latente** (`TrophiesScreen.js:250` não passa `availableWidth`). Não há manifestação
observada na campanha e a ordem determina `PASS_NO_CHANGE` — portanto **nada é alterado**.
Se, no futuro, o inventário do álbum crescer, essa latência vira defeito visível.

---

## 12. Matriz consolidada (§12) — nenhum achado sem owner e sem classificação

| # | ACHADO | SUPERFÍCIE | CRITÉRIO | CAUSA RAIZ | COMPART.? | OWNER ATUAL | OWNER FUTURO | CLASSIFICAÇÃO | MENOR PONTO ARQUITETURAL | ARQUIVOS | RAIO DE REGRESSÃO | TESTE VERMELHO |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 3 colunas onde cabem 2 em paisagem | HomeScreen | `C6`,`C7`,`SD-2`,`G-SID-3` | `A1` | SIM | `TK-C-008` | Fase 7 | `FIX_NOW_STABLE_SURFACE` | tela mede e passa `availableWidth` | `HomeScreen.js` | Home em MÉDIA e EXPANDIDA | SIM — gate de chamador |
| 2 | apoio (677dp) maior que a leitura (640dp) | StoryDetail, PostStoryHub, Reflection, ParentArea | `C6`,`SD-3`,`SD-4` | `A2` | SIM | `TK-C-006`/`009` | F7 (só ParentArea) | `FIX_NOW_FOUNDATION` | teto do apoio em `editorialLayout` | `EditorialSurface.js` | 4 telas Editorial | SIM — aritmética pura |
| 3 | não mede a região útil | BrincarScreen | `G-SID-3`,`RG-12` | `A1` | SIM | `TK-C-008` | Fase 12A | `FIX_NOW_STABLE_SURFACE` | idem #1 | `BrincarScreen.js` | Brincar | SIM — mesmo gate |
| 4 | não mede a região útil (latente) | Estrelinhas (aba) | `G-SID-3` | `A1` | SIM | `TK-C-008` | Fase 11 | `PASS_NO_CHANGE` (§11) | — | — | — | — |
| 5 | rotação em duas etapas | Monte a Cena (tabuleiro), Pares, Ovelhinha, Mapa | `C13` | `B` | SIM (padrão) | `TK-C-012`/`SG-B` | F12A (layout) | `FIX_NOW_FOUNDATION` | uma fonte de verdade de geometria por superfície | 4 telas | as 4 telas | SIM — quadro intermediário |
| 6 | rotação em duas etapas | ProfileScreen | `C13` | `B` **não comprovada na tela** | — | — | não provado | `PASS_NO_CHANGE` (investigar) | observação instrumentada antes de patch | — | — | SIM — pré-requisito |
| 7 | "perde o lugar" ao girar | AdventureMapScreen | `C10`,`C11` | `C1` | NÃO | `SG-B` | Fase 11 (horizonte) | `FIX_NOW_FUNCTIONAL` | gravar o par lógico sem exigir arrasto prévio | `AdventureMapScreen.js` | mapa, nas 2 orientações | SIM — girar sem arrastar |
| 8 | região ~3,4× mais alta que a viewport | AdventureMapScreen, MapRegion | `C6`,`C13` | `C2` | SIM | `SG-B` | Fase 11 | `FIX_NOW_FOUNDATION` | teto de altura relativo à viewport, reutilizando a regra "contain" já existente | `adventureMap.js`, `mapAnchor.js`, `MapRegion.js` | mapa + modal "Ver mapa" | SIM — altura em 1317dp |
| 9 | pinos exibem a letra inicial | StoryMapMarker | `C4` | `C3` — **inferida** | talvez (mesma raiz de `C2`) | `SG-B` | Fase 11 | `FIX_NOW_FUNCTIONAL` **condicionado a RED TEST** | indefinido até o teste; candidato: `resizeMethod` | `RecoverableImage.js`, `StoryMapMarker.js` | mapa | **OBRIGATÓRIO antes do patch** |
| 10 | documento lógico do canvas | AtelierCanvas | `C11` | — (contrato cumprido) | reutilizável | `TK-A-034` | Fase 12A | `PASS_NO_CHANGE` | nenhum | — | — | — |
| 11 | caixa de texto disputa espaço em paisagem | AtelierCanvasScreen | `C9`,`C15` | `D2` | NÃO | `TK-C-004` | Fase 12A | `FIX_NOW_FUNCTIONAL` | *sheet* que respeita a altura útil com teclado aberto | `AtelierCanvasScreen.js` | Ateliê, com teclado | SIM — paisagem + teclado |
| 12 | jogo não inicia (capa não sai) | CadeAOvelhinhaScreen | `C9` | `E1` | NÃO | `TK-C-012` | Fase 12A | `FIX_NOW_FUNCTIONAL` | expiração por rodada no reducer puro | `ovelhaTransition.js`, `CadeAOvelhinhaScreen.js` | só o jogo | SIM — evento ausente |
| 13 | colisão na borda inferior | CadeAOvelhinhaScreen | `C15` | composição em altura | NÃO | `TK-C-012` | **Fase 12A** | `DEFER_TO_EXISTING_OWNER` | — | — | — | — |
| 14 | salto após rotação | CadeAOvelhinhaScreen | `C13` | `B` | SIM | `TK-C-012` | Fase 12A | absorvido por `FIX_NOW_FOUNDATION` (B) | ver #5 | ver #5 | ver #5 | ver #5 |
| 15 | distância modos ↔ CTA | CadeAOvelhinhaScreen | — | espaçamento | NÃO | `TK-C-012` | **Fase 12A** | `DEFER_TO_EXISTING_OWNER` | — | — | — | — |
| 16 | bordas cinzas nos cartões | Estrelinhas + toda superfície com `shadows.card` | — | `cardLocked` (intencional) + `elevation` × `overflow:hidden` | SIM | design system (**área protegida**) | — | `PASS_NO_CHANGE` | — | — | — | — |
| 17 | vazio lateral em paisagem | StoryBookScreen | `SD-3` | capacidade `D10` não implementada **por contrato** | NÃO | `TK-C-004` | **Fase 9** (v5 §3:312) | `DEFER_TO_EXISTING_OWNER` | — | — | — | — |
| 18 | sem coluna de leitura em paisagem | ProfileScreen | — | fora do inventário de adoção | NÃO | `TK-C-011`/`012` | não provado | `PASS_NO_CHANGE` | — | — | — | — |
| 19 | comportamento observado | QuizScreen | — | — | — | `TK-C-012` | Fase 12A | `PASS_NO_CHANGE` (§11) | — | — | — | — |
| 20 | comportamento observado | Estrelinhas | — | — | — | `TK-C-008` | Fase 11 | `PASS_NO_CHANGE` (§11) | — | — | — | — |

**Revalidação física** (13ª coluna, consolidada para não repetir): ver §15.9 — o raio é
definido por causa, não por achado.

---

## 13. Tetos (§13)

```
NUMBER_OF_ROOT_CAUSES_INVESTIGATED ... 9   (A1, A2, B, C1, C2, C3, D, E1, bordas cinzas)
NUMBER_OF_ROOT_CAUSES_NOW ............ 7   (A1, A2, B, C1, C2, D2, E1)
NUMBER_OF_FOUNDATION_FIXES ........... 4   (A1-contrato, A2, B, C2)
NUMBER_OF_FUNCTIONAL_FIXES ........... 3   (C1, D2, E1)  + 1 condicionado a RED TEST (C3)
NUMBER_OF_STABLE_SURFACE_FIXES ....... 2   (HomeScreen, BrincarScreen — pontos de chamada)
NUMBER_OF_DEFERRED_LAYOUT_FINDINGS ... 4   (E2, E4, Livrinho/D10, jogos em paisagem)
NUMBER_OF_PASS_NO_CHANGE ............. 6   (Quiz, Estrelinhas, D-modelo, Perfil×2, bordas cinzas)

SCOPE_TOO_LARGE_FOR_SG_C = NÃO
```

**Por que não é grande demais.** Todas as 7 correções vivem em contratos e superfícies que o
**próprio `F6-SG-C` entrega** (`TK-C-004`..`TK-C-012`, `TK-A-017`/`018`/`019`/`034`). Nenhuma
exige tela nova, dependência nova, arquétipo novo, migração ou fase nova. Quatro delas são
edições de **função pura já testada** (`editorialLayout`, `computeRegionHeight`, reducer da
Ovelhinha, gravação do par lógico) — o tipo de mudança com maior cobertura e menor raio.

---

## 14. Ordem de implementação (§14) — **validada, não presumida**

A ordem natural `A → B → C → D → E` está **quase** correta. A perícia encontrou **duas
dependências reais** que a alteram, e ambas são de custo, não de gosto:

1. **`C2` precisa vir antes de `C1`** — a reprojeção lógica calcula o alvo de rolagem a partir
   de `regionLayout`, que muda quando a regra de escala muda. Fazer `C1` primeiro obrigaria a
   revalidar o mesmo comportamento duas vezes.
2. **`C3` precisa vir depois de `C2`** — se o mecanismo inferido (pressão de decodificação)
   estiver certo, `C2` reduz a pressão e o sintoma pode desaparecer sem patch algum. Corrigir
   `C3` antes é arriscar um patch para um defeito que não existirá mais.

```
PROPOSED_IMPLEMENTATION_ORDER
  1. A2  — teto do apoio no EditorialSurface        (função pura, 4 consumidores, risco mínimo)
  2. A1  — contrato de medição + gate de chamador   (fundação; Home e Brincar juntas)
  3. B   — fonte única de geometria por superfície  (fundação; absorve E3)
  4. C2  — teto de escala do mapa                   (fundação; âncora 0,50 INTOCADA)
  5. C1  — par lógico sem exigir arrasto            (depende de 4)
  6. C3  — RED TEST primeiro; patch SÓ se sobreviver a 4
  7. D2  — acesso à caixa de texto em paisagem      (isolado)
  8. E1  — expiração de rodada no reducer           (isolado; depende de 3 para revalidar)
```

**Um commit por causa arquitetural.** Nenhum commit "fix responsividade". Nenhum commit
mistura código, assets e governança.

---

## 15. Regras da implementação futura (§15) — por causa

| | `A1` | `A2` | `B` | `C1` | `C2` | `C3` | `D2` | `E1` |
|---|---|---|---|---|---|---|---|---|
| `RED_TEST_REQUIRED` | SIM | SIM | SIM | SIM | SIM | **SIM — bloqueante** | SIM | SIM |
| `SMOKE_REQUIRED` | SIM | SIM | SIM | SIM | SIM | SIM | SIM | SIM |
| `DOCTOR_REQUIRED` | SIM | SIM | SIM | SIM | SIM | SIM | SIM | SIM |
| `MUTANTS_IF_APPLICABLE` | SIM (o mutante do artefato 17 já existe) | SIM | não | SIM | SIM | não | não | SIM |

**`FILES_ALLOWED` / `FILES_FORBIDDEN`, por causa:**

```
A1  ALLOWED  = HubSurface.js (só se o gate exigir), HomeScreen.js, BrincarScreen.js, scripts/smoke.js
    FORBIDDEN= TabletSidebar.js, useWindowBand.js, tokens.js, qualquer subtração do token 180/240
    MINIMUM_PATCH = um `onLayout` no container do conteúdo + a prop `availableWidth` na chamada
    FOCUSED_TESTS = gate que falha se um consumidor de ABA não passar `availableWidth`

A2  ALLOWED  = EditorialSurface.js
    FORBIDDEN= ContentContainer.js, as 4 telas consumidoras
    MINIMUM_PATCH = teto do apoio dentro de `editorialLayout` (função pura)
    FOCUSED_TESTS = extensão de `G-RSP-6` com 1317dp e apoio presente

B   ALLOWED  = MonteACenaTableGameScreen.js, ParesDoBeniScreen.js, CadeAOvelhinhaScreen.js,
               AdventureMapScreen.js
    FORBIDDEN= motores de jogo, regras de partida, ProfileScreen (sem observação instrumentada)
    MINIMUM_PATCH = derivar a geometria da janela + insets; `onLayout` vira correção, não gatilho
    FOCUSED_TESTS = ausência do quadro intermediário na troca de dimensões

C1  ALLOWED  = AdventureMapScreen.js
    FORBIDDEN= mapAnchor.js (`MAP_ANCHOR_FRAMING`), adventureMap.js
    MINIMUM_PATCH = derivar o par lógico do estado visível, não do histórico de gestos

C2  ALLOWED  = adventureMap.js, mapAnchor.js (assinatura), MapRegion.js, AdventureMapScreen.js
    FORBIDDEN= `MAP_ANCHOR_FRAMING = 0.50` (CONGELADO), comparador visual Q6, SG-B
    MINIMUM_PATCH = teto de altura relativo à viewport reutilizando `computeImageRect`

C3  ALLOWED  = nada até o RED TEST concluir
    FORBIDDEN= assets novos, unificação de resolvers, StoryCard.js
    MINIMUM_PATCH = indefinido por decisão consciente

D2  ALLOWED  = AtelierCanvasScreen.js
    FORBIDDEN= AtelierCanvas.js (o documento lógico está PROVADO correto — não tocar)
    MINIMUM_PATCH = o sheet respeita a altura útil com teclado aberto

E1  ALLOWED  = ovelhaTransition.js, CadeAOvelhinhaScreen.js
    FORBIDDEN= ovelhaGameService.js (`computeViewport`/`contentRect` estão corretos), assets
    MINIMUM_PATCH = ação de expiração por rodada no reducer + agendamento na tela
```

**`PHYSICAL_REVALIDATION_RADIUS` (§15.9) — o que volta ao tablet, por causa:**

```
A1 → Home e Brincar, retrato e paisagem, com barra lateral em rail E em full
A2 → StoryDetail, PostStoryHub, Reflection, ParentArea em paisagem, com apoio presente
B  → Monte a Cena (tabuleiro), Pares, Ovelhinha e Mapa: girar e contar os quadros
C1 → Mapa: entrar, NÃO arrastar, girar, voltar — e depois o mesmo COM arrasto
C2 → Mapa em paisagem (altura da região) + modal "Ver mapa" (não pode regredir)
C3 → Mapa: rolar o mapa inteiro nas duas orientações, duas sessões distintas
D2 → Ateliê em paisagem com teclado aberto, salvando um desenho real
E1 → Ovelhinha: abrir, sair, reabrir, girar durante a carga
```

**Nenhuma dessas revalidações é pedida agora.** Elas descrevem o custo de cada correção para
que o fundador decida **quantas** autorizar, e em que ordem.

---

## 16. HARD STOPS

```
STOP_SCOPE_EXPANSION ......... não disparado — nenhuma correção proposta sai de F6-SG-C
STOP_OWNER_CONFLICT .......... não disparado — a ambiguidade "Livrinho (F9)" × "Meu Livro (F10)"
                               foi resolvida por leitura direta do roadmap: são superfícies
                               distintas (v5 §3, linhas 312 e 321-325)
STOP_CANONICAL_AMBIGUITY ..... não disparado
STOP_ARCHITECTURAL_COMPLEXITY  não disparado — nenhuma correção exige arquétipo novo,
                               dependência nova, migração ou fase nova
```

**Uma reserva declarada, não um stop:** `C3` (placeholders) é o único achado cujo mecanismo
permanece **inferido**. A perícia recusa-se a propor patch para ele antes de um teste vermelho
instrumentado — e essa recusa é deliberada, não omissão.

---

## 17. Estado de arquivos

| Arquivo | Estado |
|---|---|
| `specs/.../88_F6_SG_C_PERICIA_FINAL_DE_CAUSAS_RAIZ.md` | **salvo no disco, untracked** |
| `src/**`, `scripts/**`, `app.json`, `package.json` | **intocados** |

**Nenhum `git add` foi executado. Nenhum commit. Nenhum push. Nenhum build. Nenhuma alteração
de código.** Como só há documentação nova, o portão de bundleabilidade **não é disparado**
por este artefato.
