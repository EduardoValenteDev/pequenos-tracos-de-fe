# `F6-SG-C` — Inventário congelado de superfícies e campanha física de responsividade

> **Ordem que este artefato cumpre:** *"F6 SG C · AUDITORIA FÍSICA ABRANGENTE DE RESPONSIVIDADE"*.
> **Este artefato para ANTES de qualquer ação física de teste.** O patch da `HomeScreen`
> continua **NÃO aplicado**. Nenhuma task nova foi criada. Nenhum escopo foi ampliado.

---

## 1. Como o inventário foi construído (§1)

Reconstruído **do código do `HEAD` corrente** (`4a433a0`), não de memória:

| Fonte lida | O que forneceu |
|---|---|
| `src/navigation/AppNavigator.js` (`:142-153`, `:410-690`) | as 5 abas de `MainTabs` e as 29 rotas de *stack* |
| `src/constants/routes.js` | o mapa nome-lógico → nome-de-rota |
| `src/config/internalTools.js` | o portão `isInternalToolsEnabled()` das rotas de ferramenta |
| varredura de `navigate(`/`push(`/`replace(` em `src/**` | o caminho de entrada **real** de cada tela |
| `src/services/coloring60Navigation.js` | as entradas do Colorir 60, que não usam `navigate` literal |
| `RKStorage` do aparelho (leitura, sem escrita) | o **estado inicial**, que decide `REACHABLE_NOW` |

**Fato estrutural que organiza tudo o que vem depois.** A barra lateral existe **apenas dentro
de `MainTabs`** (`AppNavigator.js:325-329`: `tabBar` + `tabBarPosition: 'left'` quando
`band !== COMPACT`). Toda tela de *stack* é **irmã** do navegador de abas, não filha — logo
**não tem barra lateral e recebe a janela inteira**. Consequência direta e verificável:

```
REGIÃO DE CONTEÚDO EM PAISAGEM (SM-X510, 1317dp)
  · 5 telas de ABA .............. 1317 − 240 = 1077dp   ← região reduzida
  · 28 telas de STACK ........... 1317dp                ← janela inteira
```

Isto **confina** o mecanismo do achado da `HomeScreen` (arquétipo caindo no *fallback* da
janela) às **cinco telas de aba**. Nas telas de *stack* o *fallback* coincide com a medida
real — o defeito não pode se manifestar ali pela mesma causa.

---

## 2. Estado inicial do aparelho — lido, não presumido

Leitura não destrutiva de `/data/data/com.valentedev.pequenostracosdefe/databases/RKStorage`
(cópia em *scratchpad*, `md5 e42df3fb723f0f7130dd8f557322003c`). **Nenhuma escrita, nenhum
`pm clear`, nenhum `restore`.**

| Chave | Valor | O que decide |
|---|---|---|
| `@ptf_onboarding_v1` | `{"completed":true,...}` | **Onboarding inalcançável** sem mutação |
| `@ptf_progress_creation` | cenas `1..10` todas `true` | "A Criação" **completa** → `Congrats` alcançável pela última cena |
| `@ptf_storybook_opened_creation` | `true` | Livrinho já aberto |
| `@ptf_quiz_done_creation` | **ausente** | Quiz **não** concluído |
| `@ptf_reflection_creation` | **ausente** | Reflexão **não** salva |
| `@ptf_coloring60_done_creation_light` / `_living_world` | `true` (2 de 3) | Coleção com duas vagas cheias; a terceira abre o editor |
| `@ptf_monte_a_cena_progress_v1:star` | sessão ativa `creation_scene_01\|4\|s0`, 1 peça posta | **Retomada** do Monte a Cena disponível |
| `@ptf_creator_qa_mode` | `true` | painel interno da Área dos Responsáveis visível |
| `@ptf_beni_app_tour_seen_v1` + guias `home`/`adventures`/`profile`/`stars` | `true` | tour **não** vai interromper a gravação |

**Derivação que abre a `PostStoryHub`.** `postStoryStorage.js:53` define
`hasPendingRewards = !storyBookOpened || !quizDone || !reflectionDone`. Com quiz e reflexão
ausentes, o valor é **verdadeiro**; `homeService.js:49-62` (cenário C) faz então o botão
principal da Home virar **"Abrir presentes →"** (rótulo real na tela), que é a **única** entrada da `PostStoryHub`
(`HomeScreen.js:678`).

> ⚠️ **Ordem de execução com consequência real.** Concluir o quiz ou salvar a reflexão apaga
> `hasPendingRewards` e **fecha a porta da `PostStoryHub`**. Por isso o roteiro do §6 entra na
> `PostStoryHub` **antes** e manda **não concluir** nem quiz nem reflexão — observar a composição
> não exige terminar a atividade.

---

## 3. `SCREEN_INVENTORY` — congelado (§1 · §2)

**Unidade = a tela/superfície única** (§2). Não há linha por história, por card, por pergunta,
por cena nem por desenho. Nenhum estado interno foi promovido a unidade: nenhum deles é
**arquétipo de layout distinto já existente no código**.

**Legenda de `RESPONSIVE_FAMILY`:** `Hub` / `Editorial` / `Imersiva` = adota o arquétipo
correspondente de `src/components/layout/`. `nenhuma` = **não adota arquétipo algum** — estado
contratual congelado por `TK-C-011`/`TK-C-012` (artefato 84 §6.2), **não** defeito.
A família `Jogo` tem **zero** consumidores por contrato (`F12A`).

### 3.1 Telas de ABA — as únicas com barra lateral (região útil 643dp / **1077dp**)

| `SCREEN_ID` | `ROUTE` | `RESPONSIVE_FAMILY` | `REACHABLE_NOW` | `ENTRY_PATH` | `ORIENTATION_EXPECTATION` | `EXISTING_OWNER` | `EXISTING_SG_C_CRITERION` |
|---|---|---|---|---|---|---|---|
| `HomeScreen` | `Home > Início` | **Hub** (`minItemWidth 420`) | SIM | abertura do app | retrato 1 coluna · paisagem **2** (hoje 3) | `TK-C-008` | `SD-2`, `SD-3`, §19.1 restr. 4, `G-SID-3`, `RG-12` |
| `AdventureMapScreen` | `Home > Aventuras` | nenhuma (mede `contentW` por `onLayout`) | SIM | aba Aventuras | arte preenche a largura útil nas duas | `SG-B` (âncora 0,50) | `SD-3`; o resto pertence a `SG-B`, já concedido |
| `BrincarScreen` | `Home > Ateliê` (rótulo **Brincar**) | **Hub** (`minItemWidth 420`) | SIM | aba Brincar | retrato 1 · paisagem 2 colunas | `TK-C-008` | `SD-2`, `SD-3` |
| `TrophiesScreen` (aba) | `Home > Estrelinhas` | **Hub** | SIM | aba Estrelinhas | retrato 1 · paisagem 3 colunas | `TK-C-008` | `SD-2`, `SD-3` |
| `ProfileScreen` | `Home > Perfil` | nenhuma | SIM | aba Perfil | sem coluna imposta (fora do inventário de adoção) | `TK-C-011`/`TK-C-012` | sem critério de composição — só `C1`,`C2`,`C3`,`C8`,`C9`,`C15` |

### 3.2 Telas de STACK — sem barra lateral (janela inteira: 823dp / **1317dp**)

| `SCREEN_ID` | `ROUTE` | `RESPONSIVE_FAMILY` | `REACHABLE_NOW` | `ENTRY_PATH` | `ORIENTATION_EXPECTATION` | `EXISTING_OWNER` | `EXISTING_SG_C_CRITERION` |
|---|---|---|---|---|---|---|---|
| `StoryDetailScreen` | `StoryDetail` | **Editorial** + `ContentContainer` | SIM | Aventuras → toque na história | leitura ≤640dp + **região de apoio** aberta em EXPANDIDA | `TK-C-009` | `SD-3`, `SD-4`, `G-RSP-6` |
| `NarrationScreen` | `Narration` | nenhuma | SIM | StoryDetail → cena | imersiva de fato, sem coluna | `TK-C-011` | `C1`–`C4`, `C13`–`C15` |
| `StoryBookScreen` | `StoryBook` | **Imersiva** (mede a seção de arte) | SIM | PostStoryHub → Livrinho | preenche a janela; **acompanhante em EXPANDIDA diferida a `F9`** | `TK-C-004` | `SD-3`; capacidade `D10` **diferida por contrato** |
| `CongratsScreen` | `Congrats` | nenhuma | SIM | Narration (última cena) → Concluir | sem coluna imposta | `TK-C-011` | `C1`–`C4`, `C13`–`C15` |
| `PostStoryHubScreen` | `PostStoryHub` | **Editorial** | SIM | Home → botão "Abrir presentes →" | leitura + apoio | `TK-C-009` | `SD-3`, `SD-4` |
| `QuizScreen` | `Quiz` | nenhuma (usa `useWindowBand`) | SIM | PostStoryHub → Quiz | sem coluna imposta | `TK-C-011` | `C1`–`C4`, `C9`, `C15` |
| `ReflectionScreen` | `Reflection` | **Editorial** | SIM | PostStoryHub → Guardar no coração | leitura + apoio | `TK-C-009` | `SD-3`, `SD-4` |
| `ColoringScreen` | `Coloring` | **Imersiva** | SIM | StoryDetail → "Colorir com o Beni" → um dos 3 cards; ou Congrats → "Colorir a última parte" | canvas preenche; sem corte de arte | `TK-C-004` | `SD-3`, `C2`, `C9` |
| `AtelierCanvasScreen` | `AtelierCanvas` | **Imersiva** | SIM | Brincar → "Abrir folha" | canvas preenche; paleta alcançável | `TK-C-004` | `SD-3`, `C2`, `C9` |
| `AtelierGalleryScreen` | `AtelierGallery` | **Hub** | SIM | Brincar → "Minhas artes" | grade que abre colunas na faixa larga | `TK-C-008` | `SD-2`, `SD-3` |
| `ParentAreaScreen` | `ParentArea` | **Editorial** | SIM | Perfil → cartão "Área dos Pais" | leitura + apoio | `TK-C-009` | `SD-3`, `SD-4` |
| `BeniChestScreen` | `BeniChest` | nenhuma | SIM | Home → card "Baú do Beni" | sem coluna imposta | `TK-C-011` | `C1`–`C4`, `C14` |
| `CultinhoEmCasaScreen` | `FamilyWorship` | nenhuma | SIM | Home → card "Cultinho em Casa" | sem coluna imposta | `TK-C-011` | `C1`–`C4` |
| `LumiMomentScreen` | `LumiMoment` | nenhuma | SIM | Home → Cantinho do Beni → versículo | sem coluna imposta | `TK-C-011` | `C1`–`C4` |
| `TrophiesScreen` (*stack*) | `EstrelinhasCena` | **Hub** | SIM | Congrats → ladrilho "Estrelinhas" | **mesmo componente, contexto distinto: sem barra lateral** | `TK-C-008` | `SD-2`, `SD-3` |
| `ParesDoBeniScreen` | `ParesDoBeni` | nenhuma (`Jogo` → `F12A`) | SIM | Brincar → Pares do Beni | tabuleiro cabe sem estouro | `TK-C-012` | `C1`,`C2`,`C3`,`C9`,`C14` |
| `PalavrinhasDoBeniScreen` | `PalavrinhasDoBeni` | nenhuma (`Jogo` → `F12A`) | SIM | Brincar → Palavrinhas do Beni | idem | `TK-C-012` | idem |
| `CadeAOvelhinhaScreen` | `CadeAOvelhinha` | nenhuma (`Jogo` → `F12A`) | SIM | Brincar → Cadê a Ovelhinha? | idem | `TK-C-012` | idem |
| `MonteACenaHomeScreen` | `MonteACenaHome` | nenhuma | SIM | Brincar → Monte a Cena | idem | `TK-C-012` | idem |
| `MonteACenaStoryScreen` | `MonteACenaStory` | nenhuma | SIM | Monte a Cena → uma história | idem | `TK-C-012` | idem |
| `MonteACenaDifficultyScreen` | `MonteACenaDifficulty` | nenhuma | SIM | Monte a Cena → história → cena | idem | `TK-C-012` | idem |
| `MonteACenaGalleryScreen` | `MonteACenaGallery` | nenhuma | SIM | Monte a Cena → "Meus Quadros" | idem | `TK-C-012` | idem |
| `MonteACenaTableGameScreen` | `MonteACenaTableGame` | nenhuma | SIM | Monte a Cena → cartão **"Continue montando"** (sessão ativa em disco) | tabuleiro + bandeja sem estouro | `TK-C-012` | idem |
| `SplashScreen` | `Splash` | nenhuma | SIM (transitória) | abertura do app | — | `F6-SG-A` | **fora de `SG-C`** por §13 (não reabre `SG-A`) |

### 3.3 `NOT_REACHABLE_IN_CAMPAIGN` — com causa, sem navegação fabricada

| `SCREEN_ID` | `ROUTE` | Causa |
|---|---|---|
| `OnboardingScreen` | `Onboarding` | `@ptf_onboarding_v1.completed = true`. Só se alcança **apagando ou reescrevendo** a chave — mutação destrutiva **proibida** pela ordem. Existe um botão "Rever apresentação do Beni" na Área dos Responsáveis, mas ele **escreve** no estado: usá-lo seria fabricar navegação por mutação |
| `StoriesScreen` | `Stories` | **rota órfã**: a varredura de `src/**` não encontra **nenhum** `navigate('Stories')`. Registrada como *fallback* reversível (`AppNavigator.js:145`), sem entrada de usuário |
| `Coloring60CollectionScreen` | `Coloring60Collection` | a coleção só abre em **3 de 3**: `deriveColoring60StoryBridge` devolve `COLLECTION` apenas com `allComplete`, e a seção "Colorir com o Beni" do `StoryDetail` só mostra "Ver minha coleção" no mesmo estado. Hoje o disco tem **2 de 3** (`light`, `living_world`). A única outra entrada é o retorno automático após **concluir** a terceira parte — o que significaria **produzir um desenho novo**, excluido pela própria ordem. A entrada pela Bancada `Coloring60Lab` é ferramenta interna, fora do escopo, e mexeria no estado |
| `Coloring60ArtPreviewScreen` | `Coloring60ArtPreview` | só se alcança **de dentro da coleção** (`c60OpenPreview`), que está inalcançável pela causa acima |

### 3.4 Rotas de **ferramenta interna** — registradas neste *build*, fora do produto

`isInternalToolsEnabled()` é **verdadeiro** aqui (`__DEV__` e `@ptf_creator_qa_mode = true`),
então estas rotas **existem** no *runtime*. São declaradas por honestidade de inventário e
**excluídas da campanha com causa**: não são superfícies de produto (em produção
`isInternalToolsEnabled()` é `false`), **nenhum critério de `SG-C` as governa**, e por isso
nada observado nelas poderia produzir `PASS` nem `VIOLA_CRITERIO_SG_C` sem inventar critério.

| Rota | Entrada | Situação |
|---|---|---|
| `Coloring60Lab` · `SceneValidation` · `PackSandboxDev` | Área dos Responsáveis (painel QA) | alcançável · **fora do escopo de `SG-C`** |
| `OvelhaAssetGallery` | Cadê a Ovelhinha? → "Ferramentas de teste" | alcançável · **fora do escopo de `SG-C`** |
| `MonteACenaSpike` · `MonteACenaPrototype` · `MonteACenaLevels` · `MonteACenaGame` · `MonteACenaGameV2` · `PuzzleGestureLab` | **nenhuma** | rotas órfãs · `NOT_REACHABLE_IN_CAMPAIGN` |

### 3.5 Contagem

```
ROTAS REGISTRADAS NO NAVEGADOR ......... 43  (42 arquivos de tela; TrophiesScreen em 2 rotas)
  · superficies de PRODUTO ............. 33
  · ferramentas internas ............... 10  (fora do escopo de SG-C)

TOTAL_UNIQUE_SCREENS ................... 33
REACHABLE_SCREENS ...................... 29  (28 filmadas + Splash, transitoria e de SG-A)
NOT_REACHABLE_SCREENS .................. 4   (Onboarding, Stories, Coloring60Collection,
                                             Coloring60ArtPreview)
SUPERFICIES FILMADAS NA CAMPANHA ....... 28
```

### 3.6 `RESPONSIVE_FAMILIES`

| Família | Telas | Faixas alcançáveis nesta campanha |
|---|---|---|
| **Hub** | `HomeScreen`, `BrincarScreen`, `TrophiesScreen` (aba **e** `EstrelinhasCena`), `AtelierGalleryScreen` | MÉDIA + EXPANDIDA |
| **Editorial** | `StoryDetailScreen`, `ReflectionScreen`, `PostStoryHubScreen`, `ParentAreaScreen` | MÉDIA + EXPANDIDA |
| **Imersiva** | `StoryBookScreen`, `ColoringScreen`, `AtelierCanvasScreen` | MÉDIA + EXPANDIDA |
| **Jogo** | **nenhuma** (`GameSurface` sem consumidor — `TK-C-012` → `F12A`) | sem o que capturar |
| **nenhuma** (fora do inventário de adoção, por contrato) | as 13 telas alcançáveis restantes | MÉDIA + EXPANDIDA |

---

## 4. `KNOWN_HOME_FAIL` — congelado, **não** re-descoberto (§5)

Achado já adjudicado no artefato `86`, aqui apenas **transcrito** para que ninguém gaste tempo
reencontrando-o durante a campanha:

```
SCREEN            = HomeScreen (aba Início)
ORIENTAÇÃO        = PAISAGEM (faixa EXPANDIDA). Em retrato NÃO se manifesta.
JANELA            = 1317dp   ·   REGIÃO ÚTIL REAL = 1077dp (1317 − 240 da barra lateral)
COLUNAS HOJE      = floor(1317 / 420) = 3      ← calculadas sobre a janela, não sobre a área útil
COLUNAS CORRETAS  = floor(1077 / 420) = 2
CÉLULA RESULTANTE = 1077 / 3 ≈ 359dp  vs  HUB_MIN_CARD = 420dp   (−14,5 %)
CAUSA             = HubSurface cai em `useWindowBand().width` quando o chamador omite
                    `availableWidth`; HomeScreen.js:805 não mede e não passa a medida
CLASSIFICAÇÃO     = VIOLA_CRITERIO_SG_C
PATCH             = proposto no artefato 86 §7 · **NÃO APLICADO**
```

**Durante a campanha esta tela é filmada como qualquer outra** — não para redescobrir o achado,
mas porque os critérios `C10`/`C11`/`C12` (rotação) e `C8`/`C15` (barra lateral, área segura)
ainda não foram observados nela.

---

## 5. `PHYSICAL_CONTEXT` — campanha preparada (§6)

| Item | Estado verificado agora |
|---|---|
| Aparelho | **SM-X510**, série `RX2XC003LTJ`, `adb devices` → `device` |
| Tela | `1440x2304`, `280dpi` → **retrato 823dp** (MÉDIA) · **paisagem 1317dp** (EXPANDIDA) |
| Rotação automática | **LIGADA** (`accelerometer_rotation = 1`), aparelho em retrato (`user_rotation = 0`) |
| `HEAD` | `4a433a0452358ee26e49796d3377b9923dcb0130` — **nenhum arquivo de `src/` modificado** |
| Árvore | só `docs/DECISIONS.md` modificado e os artefatos `85`/`86`/`87` *untracked* — **nada executável** |
| Metro | **NO AR** em `127.0.0.1:8081`, iniciado no `HEAD` corrente |
| Prova de empacotamento | `GET /index.bundle?platform=android&dev=true` → **HTTP 200**, 17 400 206 bytes |
| `adb reverse` | **`UsbFfs tcp:8081 tcp:8081`** ativo |
| Logcat | **contínuo**, `-T 1 -v threadtime`, gravando em `logcat_sgc_audit.txt` |
| Estado inicial do app | **fechado** por `am force-stop` (permitido; não apaga nada). Progresso, desenhos, perfil e sessão do Monte a Cena **intactos** |
| Custódia | cópia de leitura do `RKStorage` em *scratchpad*, `md5 e42df3fb723f0f7130dd8f557322003c` |
| **Não executado** | `pm clear` · `uninstall` · `restore` · TAR · `adb input` para navegar · novo *build* · qualquer alteração de código |

**Faixas cobertas por esta campanha (§12):** `MÉDIA` (retrato) e `EXPANDIDA` (paisagem).
A faixa `COMPACTA` (<600dp) **não é alcançável** neste aparelho — o Split View já foi tentado
no `B5` e a janela não desceu de 600dp (prova negativa reutilizável, artefato `83` §10.2).
Ela depende de um telefone Android real, e fica para uma avaliação mínima separada, sem
matriz de dezenas de aparelhos e sem promessa de suporte universal.

---

## 6. `NUMBER_OF_REQUIRED_VIDEOS` = **2** (§8)

**Por que não 1.** São **28 superfícies**. O ritual por tela (§7 da ordem: entrar, parar,
enquadrar, rolar, girar, esperar, enquadrar, rolar, voltar, conferir estado) leva de 50 a 60 s.
Uma tomada única passaria de **30 minutos contínuos**, segurando o aparelho com as duas mãos,
sem consultar o computador — exatamente o que a ordem manda **não** presumir: *"longa, propensa
a erro ou impossível de navegar"*.

**Por que não 3 ou mais.** Não existe incompatibilidade causal entre os blocos: mesmo aparelho,
mesmo *runtime*, mesma sessão do Metro, sem reinstalação. Separar mais seria conveniência, e a
ordem proíbe.

**Como os dois foram agrupados — por família de superfície, não por conveniência:**

| Vídeo | Bloco | Superfícies | Por que ficam juntas |
|---|---|---|---|
| **1** | Casca + jornada da história | 14 | As **5 telas de aba** (as únicas com barra lateral) e a cadeia contínua da história, que só existe em sequência: detalhe → cena → parabéns → recompensas → livrinho/quiz/reflexão → colorir. Cortá-la exigiria refazer o caminho |
| **2** | Criar, brincar e apoio | 14 | Ateliê, os quatro jogos, o Monte a Cena e as telas de apoio (Baú, Cultinho, Cantinho, Área dos Responsáveis). Todas partem do **Início** ou do **Brincar** — cada uma é uma ida-e-volta independente, sem cadeia a preservar |

**Comparabilidade retrato × paisagem preservada:** cada superfície é observada nas duas
orientações **dentro do mesmo vídeo e sem sair da tela**, que é a condição de `C10`–`C12`.

```
NUMBER_OF_REQUIRED_VIDEOS = 2
VÍDEO 1 ≈ 15 min · 14 superfícies · abas + jornada da história
VÍDEO 2 ≈ 15 min · 14 superfícies · criar, brincar e apoio
```

---

## 7. Critérios que serão aplicados — `C1`..`C15`, sem acréscimo

Transcritos da ordem, sem uma linha nova. **Nenhum critério estético entra**: "mais bonito",
"poderia aproveitar melhor", "prefiro centralizado" e "ficaria melhor com outro espaçamento"
**não** são critérios, salvo requisito canônico correspondente já existente.

| | Critério |
|---|---|
| `C1` | conteúdo dentro da área útil |
| `C2` | sem corte destrutivo |
| `C3` | sem sobreposição indevida |
| `C4` | texto e controles legíveis funcionalmente |
| `C5` | nenhum componente comprimido abaixo de um mínimo já declarado pelo contrato/código |
| `C6` | sem coluna artificialmente estreita quando há largura útil |
| `C7` | conteúdo usa corretamente a largura após barra lateral e *insets* |
| `C8` | barra lateral não cobre conteúdo |
| `C9` | controles seguem alcançáveis |
| `C10` | rotação não causa retorno ao início |
| `C11` | rotação não perde estado |
| `C12` | rotação não recria a árvore quando o contrato proíbe |
| `C13` | sem salto/deslocamento estrutural incompatível com o arquétipo |
| `C14` | sem estouro horizontal não contratado |
| `C15` | áreas seguras, cabeçalhos e navegação não colidem com o conteúdo |

**Classificação (§4), exatamente uma por observação:** `PASS` · `VIOLA_CRITERIO_SG_C` ·
`RESIDUAL_VISUAL_FORA_DO_GATE` · `KNOWN_DEFERRED_BY_CONTRACT` · `NOT_REACHABLE_IN_CAMPAIGN` ·
`BLOCKED_BY_MISSING_HARDWARE`.

`VIOLA_CRITERIO_SG_C` exige as **quatro** condições juntas: observação física + critério
canônico preexistente + causa técnica identificável + impacto funcional objetivo.
**Nenhum critério novo será inventado para elevar residual a FAIL.**

Dois casos já sabidos que **não** virarão FAIL nesta campanha, por contrato, e são declarados
antes para que ninguém os confunda com defeito:

| Superfície | Observação esperada | Classificação obrigatória |
|---|---|---|
| `StoryBookScreen` em paisagem | vazio lateral ao redor da arte | `KNOWN_DEFERRED_BY_CONTRACT` — a composição acompanhante (`D10`) é entrega de `F9`; `ImmersiveSurface` declara a capacidade e **não** a implementa |
| `ProfileScreen` em paisagem | conteúdo sem coluna de leitura | `RESIDUAL_VISUAL_FORA_DO_GATE` — a tela **não** está no inventário de adoção de arquétipos (`TK-C-011`/`TK-C-012`); impor coluna seria criar requisito |

---

## 8. `READY_FOR_RESPONSIVE_AUDIT`

```
SCREEN_INVENTORY ............. CONGELADO (§3)
TOTAL_UNIQUE_SCREENS ......... 33
REACHABLE_SCREENS ............ 29   (28 filmadas + Splash)
NOT_REACHABLE_SCREENS ........ 4    (Onboarding, Stories, Coloring60Collection,
                                     Coloring60ArtPreview)
RESPONSIVE_FAMILIES .......... Hub 5 · Editorial 4 · Imersiva 3 · Jogo 0 · nenhuma 13
KNOWN_HOME_FAIL .............. CONGELADO — patch NÃO aplicado
PHYSICAL_CONTEXT ............. SM-X510 · RETRATO=MÉDIA(823dp) · PAISAGEM=EXPANDIDA(1317dp)
METRO ........................ NO AR (127.0.0.1:8081, HEAD 4a433a0, bundle HTTP 200)
REVERSE ...................... ATIVO (UsbFfs tcp:8081 tcp:8081)
LOGCAT ....................... CONTÍNUO (logcat_sgc_audit.txt)
APP_INITIAL_STATE ............ FECHADO por force-stop · dados intactos · tour já visto
NUMBER_OF_REQUIRED_VIDEOS .... 2

READY_FOR_RESPONSIVE_AUDIT = SIM
STOP_PHYSICAL_ACTION
```

**Nenhuma ação física de teste foi executada pelo agente.** Nenhuma navegação do roteiro foi
feita por `adb input`. O patch da `HomeScreen` continua **não aplicado**. Nenhuma task nova.
Nenhum escopo ampliado. `F6-SG-C` **não** foi concedido.

---

## 9. INSTRUÇÕES HUMANAS COMPLETAS · AUDITORIA SG C

> **Este §9 é o resumo.** A versão operacional literal — ficha por ficha, com o texto exato de
> cada botão, os tempos, as rolagens e os avisos de "NÃO TOQUE EM" — está nos **§11 a §14**,
> escritos depois. Onde os dois divergirem, **vale o §12/§13**.

> **Para o fundador, executando sozinho, sem consultar o computador durante a gravação.**
> Leia tudo **antes** de apertar REC. Nada aqui pede interpretação de código.

### 9.0 Antes de apertar REC (vale para os dois vídeos)

- Tablet **desbloqueado**, **rotação automática LIGADA**, brilho alto.
- O app está **fechado** — abra-o pelo ícone **Pequenos Traços de Fé** quando o vídeo começar.
- Segure firme, com a tela **inteira** dentro do enquadramento (as bordas precisam aparecer).
- Entre um passo e outro, **conte até três em silêncio**. As pausas é que produzem quadros medíveis.
- **Se algo travar, sumir, piscar, voltar ao início sozinho ou ficar cortado: NÃO refaça o passo.**
  Siga o roteiro até o fim e conte depois o que viu. Um defeito filmado vale mais que um roteiro limpo.

### 9.1 O RITUAL — os mesmos 11 passos em **cada** tela

Decore este bloco. Ele se repete igual em todas as telas; a lista dos §9.3 e §9.4 só diz
**como chegar** em cada uma.

```
A. Entre na tela com o tablet EM PÉ (retrato).
B. Fique parado 4 segundos, sem tocar em nada.
C. Enquadre a TELA INTEIRA — de cima a baixo, com a barra lateral (quando houver).
D. Role o mínimo necessário até o TOPO do conteúdo. Pare 2 segundos.
E. Role o mínimo necessário até o FIM do conteúdo. Pare 2 segundos.
   (Se a tela não rolar, apenas diga em voz alta "não rola" e siga.)
F. SEM SAIR DA TELA e sem tocar em mais nada, gire devagar para DEITADO (paisagem).
G. Fique parado 5 segundos.
H. Enquadre a TELA INTEIRA de novo.
I. Role o mínimo até o topo e até o fim, como em D e E.
J. Gire devagar de volta para EM PÉ (retrato).
K. Confirme em voz alta: "continua na mesma tela" ou "voltou ao início" / "perdeu o lugar".
```

**O que dizer em voz alta (só o que se vê — nunca o porquê):** "cortado à direita",
"texto por cima do botão", "botão não aparece", "coluna estreita com muito vazio",
"a barra lateral tampa o conteúdo", "voltou para o topo sozinho", "perdeu o que eu tinha aberto",
"tudo certo". **Não** é preciso julgar se é defeito — isso é trabalho da adjudicação.

### 9.2 Três proibições durante a gravação

1. **Não conclua o Quiz** (não vá até a última pergunta) — concluir fecha a porta da tela
   "Recompensas" e mata o resto do roteiro.
2. **Não salve a Reflexão** ("Guardar no coração") — mesmo motivo.
3. **Não pinte** na tela de colorir e **não encaixe peças** no Monte a Cena. Entrar, olhar
   e sair é o suficiente.

---

### 9.3 VÍDEO 1 — abas e jornada da história (14 telas, ~15 min)

Comece gravando com o tablet **em pé**, mostrando a tela inicial do Android por 3 s, e abra o app.

| # | Tela | Como chegar |
|---|---|---|
| 1 | **Início** | é a primeira tela depois que o app carrega |
| 2 | **Aventuras** (mapa) | toque em **Aventuras** na barra lateral |
| 3 | **Brincar** | toque em **Brincar** na barra lateral |
| 4 | **Estrelinhas** | toque em **Estrelinhas** na barra lateral |
| 5 | **Perfil** | toque em **Perfil** na barra lateral |
| 6 | **Recompensas** | toque em **Início**; no bloco grande do topo, toque no botão **"Abrir presentes →"** (rótulo real na tela) |
| 7 | **Livrinho** | nessa tela de recompensas, toque no cartão **"📖 Meu Livrinho da Fé"** |
| 8 | **Quiz** | volte (←) para Recompensas e toque no cartão **"⭐ Quiz da História"**. **Não responda até o fim** |
| 9 | **Guardar no coração** | volte (←) para Recompensas e toque em **Guardar no coração**. **Não salve** |
| 10 | **Detalhe da história** | volte até **Início** → **Aventuras** → toque na história **A Criação** |
| 11 | **Cena (narração)** | nessa tela, desça até a **lista de cenas** e toque na **ÚLTIMA** cena, escrita **"O descanso de Deus"** |
| 12 | **Parabéns** | na cena, toque no botão **"Ver conclusão →"**; a tela de parabéns abre sozinha |
| 13 | **Estrelinhas (empilhada)** | na tela de parabéns, toque no ladrilho **⭐ Estrelinhas** |
| 14 | **Colorir** | volte (←) para parabéns e toque no botão do Colorir (**"Colorir a última parte"**). **Não pinte** |

Depois da tela 14: volte até **Início**, gire uma última vez para paisagem e de volta para
retrato, e **pare de gravar**.

---

### 9.4 VÍDEO 2 — criar, brincar e apoio (14 telas, ~15 min)

Comece com o tablet **em pé**, na tela **Início** (abra o app se ele estiver fechado).

| # | Tela | Como chegar |
|---|---|---|
| 1 | **Baú do Beni** | em **Início**, toque no cartão **Baú do Beni** |
| 2 | **Cultinho em Casa** | volte para **Início** e toque no cartão **Cultinho em Casa** |
| 3 | **Cantinho do Beni** (versículo) | volte para **Início**, desça até **Cantinho do Beni** e toque no **versículo** |
| 4 | **Área dos Pais** | volte para **Início** → aba **Perfil** → cartão **"Área dos Pais"** |
| 5 | **Criar livre (folha)** | volte → aba **Brincar** → seção **Crie do seu jeito** → **Abrir folha**. **Não desenhe** |
| 6 | **Minhas artes** | volte para **Brincar** e toque em **Minhas artes** |
| 7 | **Pares do Beni** | volte para **Brincar** → grade **Jogos do Beni** → **Pares do Beni** |
| 8 | **Palavrinhas do Beni** | volte para **Brincar** → **Palavrinhas do Beni** |
| 9 | **Cadê a Ovelhinha?** | volte para **Brincar** → **Cadê a Ovelhinha?** |
| 10 | **Monte a Cena** (início) | volte para **Brincar** → **Monte a Cena** |
| 11 | **Monte a Cena — história** | nessa tela, toque em **uma história** da lista |
| 12 | **Monte a Cena — dificuldade** | na história, toque em **uma cena** |
| 13 | **Monte a Cena — Meus Quadros** | volte até o início do Monte a Cena e toque em **Meus Quadros** |
| 14 | **Monte a Cena — tabuleiro** | volte ao início do Monte a Cena e toque no cartão **"Continue montando"** (o jogo que ficou pela metade). **Não encaixe peças** |

Depois da tela 14: volte até **Início** e **pare de gravar**.

---

### 9.5 Depois dos dois vídeos

Não faça mais nada no tablet. Me avise que terminou e conte, em palavras suas, o que viu de
estranho — tela por tela, se lembrar. Eu consolido **todos** os achados **antes** de qualquer
correção: nenhuma tela é corrigida durante o teste, e o patch da `HomeScreen` continua parado
até a consolidação (§9 e §10 da sua ordem).

---

## 10. Estado de arquivos, com a distinção exigida

| Arquivo | Estado |
|---|---|
| `specs/.../87_F6_SG_C_INVENTARIO_CONGELADO_E_CAMPANHA_DE_RESPONSIVIDADE.md` | **salvo no disco, untracked** |
| `specs/.../86_F6_SG_C_ADENDO_ADJUDICACAO_DE_COMPOSICAO_EM_PAISAGEM.md` | **salvo no disco, untracked** |
| `specs/.../85_F6_SG_C_ADJUDICACAO_FISICA_E_HUMAN_GATE.md` | **salvo no disco, untracked** |
| `docs/DECISIONS.md` | **modificado no disco, não indexado** |
| `src/**`, `scripts/**`, `app.json`, `package.json` | **intocados** |

**Nenhum `git add` foi executado. Nenhum commit. Nenhum push. Nenhum build.**
Como só há documentação alterada, o portão de bundleabilidade não é disparado por estes
arquivos — ainda assim o Metro empacotou o `HEAD` corrente com **HTTP 200**, o que prova a
árvore executável antes de pedir a validação física.

---

## 11. PRÉ-CONDIÇÕES PROVADAS ANTES DA GRAVAÇÃO (§3 da ordem)

Cada tela sensível foi checada contra o **estado real do disco** (cópia de custódia do
`RKStorage`, md5 `e42df3fb723f0f7130dd8f557322003c`) **e** contra o predicado do código que
decide a porta. Nenhum estado foi fabricado.

| Tela | Predicado no código | Estado real hoje | Veredito |
|---|---|---|---|
| **Recompensas** (`PostStoryHub`) | `getHomePrimaryAction` cenário C: história completa **e** `hasPendingRewards` | `@ptf_progress_creation` = 10/10 · `@ptf_quiz_done_creation` **ausente** · `@ptf_reflection_creation` **ausente** ⇒ `hasPendingRewards = true` | **ALCANÇÁVEL** — o botão da Home lê `Abrir presentes →` |
| **Livrinho** (`StoryBook`) | card do `PostStoryHub`, sem *gate* extra (`canOpenStoryFullExperience` já satisfeito) | `@ptf_storybook_opened_creation = true` (já aberto antes) | **ALCANÇÁVEL** — reabrir **não** fecha a porta: `hasPendingRewards` continua verdadeiro pelo quiz |
| **Quiz** | card do `PostStoryHub`; `markQuizDone` só executa **ao terminar todas as perguntas** (`QuizScreen.js:106`) | quiz não feito | **ALCANÇÁVEL** — entrar e olhar **não** grava nada |
| **Reflexão** (`Guardar no coração`) | card do `PostStoryHub`; `saveReflection` só executa no botão final (`ReflectionScreen.js:75`) | reflexão ausente | **ALCANÇÁVEL** — entrar e olhar **não** grava nada |
| **Cena 10** (`Narration`) | lista "Cenas da aventura" do `StoryDetail` | cena 10 **já concluída** | **ALCANÇÁVEL** — e o botão vira `Ver conclusão →`, que **só navega** (`goToNext`), sem `salvarCena`: **zero escrita** |
| **Parabéns** (`Congrats`) | `goToNext()` da última cena | idem acima | **ALCANÇÁVEL sem mutação alguma** |
| **Colorir** (`Coloring`) | ponte do `Congrats`: `deriveColoring60StoryBridge` | `light` ✓ · `living_world` ✓ · `people_and_care` ✗ ⇒ estado `lastOne` | **ALCANÇÁVEL** — botão `Colorir a última parte`, contador `2 de 3` |
| **Meus Quadros** (`MonteACenaGallery`) | `MonteACenaHomeScreen.js:140` navega **independente** do plano | — | **ALCANÇÁVEL** |
| **Retomar** (`MonteACenaTableGame`) | cartão de sessão ativa | `@ptf_monte_a_cena_progress_v1:star` → `creation_scene_01`, 4 peças, 1 colocada | **ALCANÇÁVEL** — cartão **"Continue montando"**, "1 de 4 peças" |
| **Área dos Pais** (`ParentArea`) | `ParentalGate` — desafio de multiplicação | portão sempre exigido na sessão | **ALCANÇÁVEL** — exige que o adulto resolva a conta |

```
PRECONDITIONS = PASS
```

**Nenhuma pré-condição precisou ser criada.** Nenhum quiz concluído, nenhuma reflexão salva,
nenhum desenho produzido, nenhuma peça encaixada, nenhum dado apagado.

**Correção de rótulo em relação ao §9 anterior:** o botão da Home **não** diz "Ver recompensas →"
(esse é o texto interno do serviço, `homeService.js:60`). A `HomeScreen` sobrescreve o rótulo em
`getAdventureButtonLabel()` e o que aparece na tela é **`Abrir presentes →`**
(`HomeScreen.js:689`). O §12 abaixo usa o texto realmente visível.

---

## 12. PROTOCOLO OPERACIONAL · **VÍDEO 1** — 14 superfícies

### 12.0 Estado inicial exato

- App **fechado**. Tablet **desbloqueado**, **rotação automática LIGADA**, **em pé (retrato)**.
- **Primeiro clique:** o ícone **Pequenos Traços de Fé** na tela do Android.
- O Splash passa sozinho. Não toque em nada enquanto ele estiver na tela.
- **Se aparecer um balão do Beni ("Entendi") ou o convite "Agora vamos colorir o que aprendemos?":**
  toque em **"Entendi"** / **"Continuar depois"** e siga. Não é defeito, é o guia.

### 12.1 O ritual (idêntico em todas as 14 fichas)

`RETRATO → parar 4 s → mostrar a tela inteira → rolar ao topo e ao fim → girar SEM SAIR da tela →
parar 5 s em PAISAGEM → mostrar a tela inteira → rolar ao topo e ao fim → girar de volta para
RETRATO → confirmar em voz alta que continua na mesma tela e no mesmo lugar.`

---

#### FICHA V1-01

```
SCREEN_NUMBER                   = 1
SCREEN_NAME                     = Início (aba)
EXPECTED_VISIBLE_TITLE          = "Olá!" com o Beni no topo; selo "🎁 PRESENTES ESPERANDO"
ENTRY_FROM                      = abertura do app
EXACT_USER_ACTION               = abrir o app pelo ícone e esperar o Splash sair sozinho
EXACT_VISIBLE_CONTROL_TO_TOUCH  = nenhum
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer devagar até o último bloco ("Cantinho do Beni") e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso: até o fim e de volta ao topo
OBJECTIVE_OBSERVATIONS          = quantos cartões cabem lado a lado abaixo do bloco grande;
                                  se a barra lateral esquerda cobre algum cartão; se sobra
                                  faixa vazia à direita enquanto o texto fica espremido
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na Início, na mesma altura da rolagem
EXIT_ACTION                     = tocar "Aventuras" na barra lateral esquerda
NEXT_SCREEN                     = 2
DO_NOT_TOUCH                    = o link "🎨 Criar livre →" logo abaixo do botão grande;
                                  o botão "Abrir presentes →" (ele é a tela 6, ainda não)
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V1-02

```
SCREEN_NUMBER                   = 2
SCREEN_NAME                     = Aventuras (mapa)
EXPECTED_VISIBLE_TITLE          = "Mapa das Aventuras" · "Suba o caminho da fé ✨"
ENTRY_FROM                      = Início
EXACT_USER_ACTION               = tocar o item "Aventuras" da barra lateral
EXACT_VISIBLE_CONTROL_TO_TOUCH  = "Aventuras" (ícone + palavra, segundo item da barra lateral)
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = subir o caminho do mapa devagar até onde ele parar, e voltar
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se a arte do mapa é cortada nas laterais; se os marcos ficam
                                  fora da tela; se a barra lateral cobre o caminho
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no mapa, na mesma altura do caminho
EXIT_ACTION                     = tocar "Brincar" na barra lateral
NEXT_SCREEN                     = 3
DO_NOT_TOUCH                    = qualquer marco/história do caminho; o botão "🗺️ Ver mapa"
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V1-03

```
SCREEN_NUMBER                   = 3
SCREEN_NAME                     = Brincar (aba)
EXPECTED_VISIBLE_TITLE          = "Brincar com o Beni" · "Qual brincadeira vamos escolher hoje?"
ENTRY_FROM                      = Aventuras
EXACT_USER_ACTION               = tocar "Brincar" na barra lateral
EXACT_VISIBLE_CONTROL_TO_TOUCH  = "Brincar" (terceiro item da barra lateral)
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até passar de "Crie do seu jeito" e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = quantos jogos cabem lado a lado em "Jogos do Beni";
                                  se os cartões de "Crie do seu jeito" ficam estreitos com
                                  vazio ao redor
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no Brincar, na mesma altura
EXIT_ACTION                     = tocar "Estrelinhas" na barra lateral
NEXT_SCREEN                     = 4
DO_NOT_TOUCH                    = o botão "Jogar" do bloco "Beni sugere hoje"; os quatro jogos
                                  (eles são o VÍDEO 2)
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V1-04

```
SCREEN_NUMBER                   = 4
SCREEN_NAME                     = Estrelinhas (aba)
EXPECTED_VISIBLE_TITLE          = "Álbum de Estrelinhas"
ENTRY_FROM                      = Brincar
EXACT_USER_ACTION               = tocar "Estrelinhas" na barra lateral
EXACT_VISIBLE_CONTROL_TO_TOUCH  = "Estrelinhas" (quarto item da barra lateral)
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até o fim da lista de conquistas e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = quantas conquistas por linha; se a barra de progresso é
                                  cortada; se a barra lateral cobre a primeira coluna
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no Álbum, na mesma altura
EXIT_ACTION                     = tocar "Perfil" na barra lateral
NEXT_SCREEN                     = 5
DO_NOT_TOUCH                    = qualquer conquista/medalha (abre detalhe)
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V1-05

```
SCREEN_NUMBER                   = 5
SCREEN_NAME                     = Perfil (aba)
EXPECTED_VISIBLE_TITLE          = "Meu cantinho"
ENTRY_FROM                      = Estrelinhas
EXACT_USER_ACTION               = tocar "Perfil" na barra lateral
EXACT_VISIBLE_CONTROL_TO_TOUCH  = "Perfil" (quinto e último item da barra lateral)
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até o bloco "🔐 Para responsáveis" e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se o conteúdo vira uma faixa larguíssima de ponta a ponta;
                                  se a grade de avatares fica cortada; se o teclado não é
                                  chamado por engano
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no Perfil, na mesma altura
EXIT_ACTION                     = tocar "Início" na barra lateral
NEXT_SCREEN                     = 6
DO_NOT_TOUCH                    = o campo "Como você se chama?" (abre teclado e altera o nome);
                                  os avatares; os chips de "Cor da pele";
                                  o cartão "Área dos Pais" (ele é o VÍDEO 2)
STATE_MUTATION_RISK             = tocar no nome ou num avatar ALTERA o perfil salvo — não toque
```

#### FICHA V1-06

```
SCREEN_NUMBER                   = 6
SCREEN_NAME                     = Recompensas (PostStoryHub)
EXPECTED_VISIBLE_TITLE          = "🎉 Você completou a aventura!" · "Você desbloqueou:"
ENTRY_FROM                      = Início
EXACT_USER_ACTION               = na Início, no bloco grande do topo, tocar o botão laranja
EXACT_VISIBLE_CONTROL_TO_TOUCH  = botão escrito **"Abrir presentes →"**
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até "🏠 Voltar para o início" e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se os três cartões viram uma coluna estreita no meio com muito
                                  vazio dos dois lados; se o cabeçalho colorido corta o título
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua em Recompensas, na mesma altura
EXIT_ACTION                     = tocar o cartão "Meu Livrinho da Fé"
NEXT_SCREEN                     = 7
DO_NOT_TOUCH                    = "🏠 Voltar para o início" (só no fim do bloco 6–9)
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V1-07

```
SCREEN_NUMBER                   = 7
SCREEN_NAME                     = Livrinho da Fé (StoryBook)
EXPECTED_VISIBLE_TITLE          = "📖 Livrinho da Fé" com o subtítulo "A Criação"
ENTRY_FROM                      = Recompensas
EXACT_USER_ACTION               = tocar o PRIMEIRO cartão da lista
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão "📖 Meu Livrinho da Fé" (etiqueta "Abrir" ou "✓ Feito")
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = passar 2 ou 3 páginas do livrinho e voltar
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se a arte é cortada; se sobra vazio grande dos dois lados da
                                  página (isso É esperado aqui — apenas relate, não julgue)
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no Livrinho, na MESMA página
EXIT_ACTION                     = tocar a seta de voltar no canto superior esquerdo (1 vez)
NEXT_SCREEN                     = 8
DO_NOT_TOUCH                    = nada além de passar páginas
STATE_MUTATION_RISK             = abrir o Livrinho marca "já aberto" — isso JÁ estava marcado e
                                  NÃO fecha a porta das Recompensas
```

#### FICHA V1-08

```
SCREEN_NUMBER                   = 8
SCREEN_NAME                     = Quiz
EXPECTED_VISIBLE_TITLE          = "Quiz" no alto; abaixo "Quiz · A Criação" e "Pergunta 1 de …"
ENTRY_FROM                      = Recompensas
EXACT_USER_ACTION               = voltar 1 vez e tocar o SEGUNDO cartão
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão "⭐ Quiz da História" (etiqueta "+1 ⭐")
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = rolar até ver todas as alternativas e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se a pergunta ou alguma alternativa fica fora da tela;
                                  se o botão "Confirmar" some abaixo da borda
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na MESMA pergunta 1, sem nada selecionado
EXIT_ACTION                     = seta de voltar no canto superior esquerdo (1 vez)
NEXT_SCREEN                     = 9
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = qualquer alternativa · o botão "Confirmar"
STATE_MUTATION_RISK             = terminar o quiz GRAVA "quiz feito" e FECHA a porta da tela 6
                                  para sempre nesta campanha. Só olhar é seguro
```

#### FICHA V1-09

```
SCREEN_NUMBER                   = 9
SCREEN_NAME                     = Guardar no coração (Reflexão)
EXPECTED_VISIBLE_TITLE          = "Guardar no coração" · "Como seu coração ficou com essa história?"
ENTRY_FROM                      = Recompensas
EXACT_USER_ACTION               = voltar 1 vez e tocar o TERCEIRO cartão
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão "✨ Guardar no coração" (etiqueta "+1 ⭐")
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = rolar até ver todas as opções de sentimento e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se as opções ficam espremidas ou saem da tela; se o texto da
                                  lição fica numa coluna estreita cercada de vazio
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no MESMO primeiro passo, sem nada escolhido
EXIT_ACTION                     = seta de voltar (1 vez) → tocar "🏠 Voltar para o início"
NEXT_SCREEN                     = 10
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = as opções de sentimento · "Próximo →" ·
                                  "💛 Guardar no coração"
STATE_MUTATION_RISK             = salvar a reflexão FECHA a porta da tela 6 para sempre
```

#### FICHA V1-10

```
SCREEN_NUMBER                   = 10
SCREEN_NAME                     = Detalhe da história (StoryDetail)
EXPECTED_VISIBLE_TITLE          = "A Criação" (capa da história no alto)
ENTRY_FROM                      = Início → Aventuras
EXACT_USER_ACTION               = na Início, tocar "Aventuras" na barra lateral e depois tocar a
                                  primeira aventura do caminho
EXACT_VISIBLE_CONTROL_TO_TOUCH  = o marco/cartão escrito "A Criação" no mapa
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0 (você já voltou para a Início pelo botão da ficha 9)
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até o fim da lista "Cenas da aventura" e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se aparece uma região de apoio ao lado da lista de cenas ou se
                                  tudo continua numa coluna só; se a capa é cortada
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no detalhe de "A Criação", na mesma altura
EXIT_ACTION                     = tocar o ÚLTIMO item da lista "Cenas da aventura"
NEXT_SCREEN                     = 11
DO_NOT_TOUCH                    = o botão grande "Continuar aventura"; os cartões "Livrinho da Fé",
                                  "Quiz" e "Guardar no coração"; o botão de baixar a história.
                                  Se aparecer o balão "Agora vamos colorir o que aprendemos?",
                                  toque em "Continuar depois"
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V1-11

```
SCREEN_NUMBER                   = 11
SCREEN_NAME                     = Cena (Narração)
EXPECTED_VISIBLE_TITLE          = "Cena 10 de 10" · título "O descanso de Deus"
ENTRY_FROM                      = Detalhe da história
EXACT_USER_ACTION               = tocar a DÉCIMA e última linha da lista "Cenas da aventura"
EXACT_VISIBLE_CONTROL_TO_TOUCH  = linha escrita **"O descanso de Deus"** (a última da lista)
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até ver o botão principal e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se a ilustração é cortada; se o texto da narração fica com
                                  linhas larguíssimas de ponta a ponta; se o botão sai da tela
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na cena 10, mesma posição
EXIT_ACTION                     = tocar o botão principal escrito "Ver conclusão →"
NEXT_SCREEN                     = 12
DO_NOT_TOUCH                    = "‹ Cena anterior"; os controles de áudio
STATE_MUTATION_RISK             = NENHUM — a cena já está concluída, então o botão apenas navega
                                  (não grava estrela nem progresso)
```

#### FICHA V1-12

```
SCREEN_NUMBER                   = 12
SCREEN_NAME                     = Parabéns (Congrats)
EXPECTED_VISIBLE_TITLE          = "Aventura concluída!"
ENTRY_FROM                      = Cena 10
EXACT_USER_ACTION               = tocar o botão principal da cena
EXACT_VISIBLE_CONTROL_TO_TOUCH  = botão **"Ver conclusão →"**
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até "🏠 Voltar ao início" e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se os três ladrilhos de "Você desbloqueou" ficam apertados ou
                                  saem da tela; se o cabeçalho laranja corta o título
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na tela de Parabéns, mesma altura
EXIT_ACTION                     = rolar até "Você desbloqueou" e tocar o ladrilho do meio
NEXT_SCREEN                     = 13
DO_NOT_TOUCH                    = "Abrir Livrinho da Fé" · "Responder Quiz" ·
                                  o ladrilho "✨ Guardar no coração" · "🏅 Ver Certificado da
                                  aventura" · "▶ Rever aventura"
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V1-13

```
SCREEN_NUMBER                   = 13
SCREEN_NAME                     = Estrelinhas (versão empilhada, SEM barra lateral)
EXPECTED_VISIBLE_TITLE          = "Álbum de Estrelinhas" — a mesma tela da ficha 4, mas agora
                                  SEM a barra lateral à esquerda
ENTRY_FROM                      = Parabéns
EXACT_USER_ACTION               = tocar o ladrilho do meio na faixa "Você desbloqueou"
EXACT_VISIBLE_CONTROL_TO_TOUCH  = ladrilho **"⭐ Estrelinhas"** (entre "🎴 Baú" e
                                  "✨ Guardar no coração")
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até o fim das conquistas e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = comparar com a ficha 4: MESMA tela, agora com a largura toda.
                                  Mudou o número de colunas? Ficou melhor, igual ou pior?
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no Álbum, mesma altura
EXIT_ACTION                     = seta de voltar (1 vez) → volta para Parabéns
NEXT_SCREEN                     = 14
DO_NOT_TOUCH                    = qualquer conquista
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V1-14

```
SCREEN_NUMBER                   = 14
SCREEN_NAME                     = Colorir (editor)
EXPECTED_VISIBLE_TITLE          = "Na criação de Deus"
ENTRY_FROM                      = Parabéns
EXACT_USER_ACTION               = voltar 1 vez e tocar o botão do bloco que fica logo ABAIXO do
                                  cabeçalho laranja, onde se lê "Falta só uma criação para
                                  completar sua coleção!"
EXACT_VISIBLE_CONTROL_TO_TOUCH  = botão **"Colorir a última parte"** (abaixo dele aparece "2 de 3")
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = NENHUM (a tela não rola — apenas mostre a folha inteira e a
                                  paleta de cores)
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = NENHUM
OBJECTIVE_OBSERVATIONS          = se o desenho é cortado em cima/embaixo ou nas laterais;
                                  se alguma cor da paleta fica fora da tela; se o botão
                                  "✓ Pronto!" continua alcançável
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no MESMO desenho, sem nenhuma tinta aplicada
EXIT_ACTION                     = tocar "← Voltar" no alto à esquerda
NEXT_SCREEN                     = fim do VÍDEO 1
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = a folha de desenho (qualquer toque pinta) ·
                                  o botão "✓ Pronto!"
STATE_MUTATION_RISK             = pintar e tocar "✓ Pronto!" fecha a terceira parte e muda o
                                  estado da coleção. Só entrar e olhar NÃO grava nada
```

### 12.2 Encerramento do VÍDEO 1

Depois da ficha 14: toque "← Voltar" (volta ao Parabéns), depois a seta de voltar até chegar na
**Início**. Gire uma última vez para paisagem e de volta para retrato. Diga em voz alta
**"fim do vídeo um"** e **pare de gravar**.

**Deixe o tablet:** aberto no app, na aba **Início**, em **retrato**. Não feche o app.

---

## 13. PROTOCOLO OPERACIONAL · **VÍDEO 2** — 14 superfícies

### 13.0 Estado inicial exato

- O app está **aberto**, na aba **Início**, em **retrato** — exatamente como o VÍDEO 1 o deixou.
  (Se o tablet tiver sido bloqueado, apenas desbloqueie: o app continua onde estava.)
- **Rotação automática LIGADA**.
- **Primeiro clique:** o cartão **"Baú do Beni"** na tela Início (desça um pouco se necessário —
  ele fica na grade de cartões, com o subtítulo "Suas cartinhas de fé" e o botão "Abrir").

```
INTER_VIDEO_AGENT_ACTION = NENHUMA
```

Entre o VÍDEO 1 e o VÍDEO 2 **não há preparo técnico algum**: sem reinstalar, sem reiniciar o
app, sem mexer no computador, sem mensagem para o agente. O Metro, o `adb reverse` e o logcat
seguem no ar sozinhos. **Você pode gravar o VÍDEO 2 imediatamente ou horas depois.**

### 13.1 O ritual

Idêntico ao §12.1. Não muda nada.

---

#### FICHA V2-01

```
SCREEN_NUMBER                   = 15
SCREEN_NAME                     = Baú do Beni
EXPECTED_VISIBLE_TITLE          = "Baú do Beni"
ENTRY_FROM                      = Início
EXACT_USER_ACTION               = tocar o botão do cartão do Baú
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão "Baú do Beni" / "Suas cartinhas de fé" — botão "Abrir"
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até o fim das cartinhas e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = quantas cartinhas por linha; se alguma sai da tela; se sobra
                                  faixa vazia enorme à direita
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no Baú, na mesma altura
EXIT_ACTION                     = seta de voltar (1 vez) → volta para Início
NEXT_SCREEN                     = 16
DO_NOT_TOUCH                    = as cartinhas (abrem detalhe e podem marcar como lida)
STATE_MUTATION_RISK             = NENHUM se não abrir cartinha
```

#### FICHA V2-02

```
SCREEN_NUMBER                   = 16
SCREEN_NAME                     = Cultinho em Casa
EXPECTED_VISIBLE_TITLE          = "Cultinho em Casa" · "Um momentinho de fé em família (3–5 min)."
ENTRY_FROM                      = Início
EXACT_USER_ACTION               = na Início, tocar o botão do cartão do Cultinho
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão "Cultinho em Casa" (traz "⏱️ 5 min") — botão "Começar"
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1 (a volta da ficha anterior)
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até o fim do roteiro do cultinho e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se as linhas de texto ficam larguíssimas de ponta a ponta;
                                  se algum passo é cortado
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no Cultinho, mesma altura
EXIT_ACTION                     = seta de voltar (1 vez)
NEXT_SCREEN                     = 17
DO_NOT_TOUCH                    = botões de concluir/marcar passo, se houver
STATE_MUTATION_RISK             = NENHUM se apenas rolar
```

#### FICHA V2-03

```
SCREEN_NUMBER                   = 17
SCREEN_NAME                     = Momento com Beni (Cantinho → versículo)
EXPECTED_VISIBLE_TITLE          = "Momento com Beni"
ENTRY_FROM                      = Início → bloco "Cantinho do Beni"
EXACT_USER_ACTION               = na Início, descer até o bloco roxo "Cantinho do Beni /
                                  Um carinho de fé para hoje 💜" e tocar a LINHA DO MEIO
EXACT_VISIBLE_CONTROL_TO_TOUCH  = a linha **"🕊️ Um versículo para guardar"** (tem um link
                                  "Abrir →" à direita). NÃO é a linha "💡 Uma ideia para hoje"
                                  nem "🙏 Uma oração curtinha"
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = rolar até o fim, se rolar; se não, diga "não rola"
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se o versículo fica numa linha só, larguíssima; se a arte do
                                  Beni é cortada; se o botão de fechar continua alcançável
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no mesmo momento, mesmo texto
EXIT_ACTION                     = seta de voltar (1 vez) → toque "Perfil" na barra lateral
NEXT_SCREEN                     = 18
DO_NOT_TOUCH                    = se aparecer "Pedir ao responsável" no lugar de "Abrir →",
                                  NÃO toque — relate e pule para a ficha 18
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V2-04

```
SCREEN_NUMBER                   = 18
SCREEN_NAME                     = Área dos Pais (ParentArea)
EXPECTED_VISIBLE_TITLE          = primeiro um quadro escrito "Área dos Pais" com a conta
                                  "{número} × {número} = ?"; depois de acertar, a tela com os
                                  blocos "Resumo da criança", "Jornada e progresso",
                                  "Plano familiar", "Sons e música"
ENTRY_FROM                      = Perfil
EXACT_USER_ACTION               = na aba Perfil, descer até o bloco "🔐 Para responsáveis" e
                                  tocar o cartão; depois RESOLVER a conta e tocar "Entrar"
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão **"Área dos Pais"** ("👨‍👩‍👧 Acompanhe o progresso e
                                  gerencie o perfil"); no quadro: o campo do número e o
                                  botão **"Entrar"**
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4  ← só comece a contar DEPOIS que a conta for aceita e o
                                       teclado sumir. O quadro da conta não é a tela auditada
PORTRAIT_SCROLL                 = descer passando por todos os blocos até o fim e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se os blocos viram uma faixa larguíssima; se algum botão
                                  perigoso fica encostado em outro; se algo é cortado
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na Área dos Pais SEM pedir a conta de novo
EXIT_ACTION                     = seta de voltar (1 vez) → toque "Brincar" na barra lateral
NEXT_SCREEN                     = 19
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = "🎨 Apagar pinturas" · "🖍️ Apagar criações" ·
                                  "Rever apresentação do Beni" · "Rever o guia do Beni" ·
                                  qualquer botão que fale em apagar, reiniciar, zerar ou excluir ·
                                  qualquer chave liga/desliga · o painel de testes no fim da tela
STATE_MUTATION_RISK             = ALTÍSSIMO. Esta é a tela mais perigosa da campanha: há botões
                                  que APAGAM progresso, desenhos e o guia. ABRIR os blocos para
                                  ver é seguro; TOCAR nesses botões destrói a campanha inteira
```

#### FICHA V2-05

```
SCREEN_NUMBER                   = 19
SCREEN_NAME                     = Criar livre (folha do Ateliê)
EXPECTED_VISIBLE_TITLE          = "Criar livre"
ENTRY_FROM                      = Brincar
EXACT_USER_ACTION               = no Brincar, descer até a seção "Crie do seu jeito" e tocar o
                                  botão do PRIMEIRO cartão
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão "Criar livre" — botão **"Abrir folha"**
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = NENHUM (não rola — mostre a folha e a paleta inteiras)
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = NENHUM
OBJECTIVE_OBSERVATIONS          = se a folha é cortada; se alguma cor ou ferramenta fica fora da
                                  tela; se a barra de ferramentas cobre a folha
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na folha, ainda em branco
EXIT_ACTION                     = seta/botão de voltar. Se aparecer "Sair sem salvar" ou
                                  "Toque de novo para sair", escolha **"Sair sem salvar"**
NEXT_SCREEN                     = 20
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = a folha (qualquer toque risca) ·
                                  qualquer botão de salvar
STATE_MUTATION_RISK             = a folha em branco NÃO é salva sozinha (não existe salvamento
                                  automático). Só riscar + salvar criaria arte nova
```

#### FICHA V2-06

```
SCREEN_NUMBER                   = 20
SCREEN_NAME                     = Minhas artes (galeria do Ateliê)
EXPECTED_VISIBLE_TITLE          = "Minhas artes"
ENTRY_FROM                      = Brincar
EXACT_USER_ACTION               = de volta ao Brincar, na mesma seção "Crie do seu jeito",
                                  tocar o botão do SEGUNDO cartão
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão "Minhas artes" — botão **"Ver"**
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até o fim da grade e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = quantas obras por linha em cada orientação; se a única obra
                                  existente fica gigante ou perdida no vazio
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na galeria
EXIT_ACTION                     = seta de voltar (1 vez)
NEXT_SCREEN                     = 21
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = qualquer ícone de lixeira/apagar · a obra
                                  (abre a prévia; se abrir por engano, apenas volte)
STATE_MUTATION_RISK             = apagar arte é irreversível
```

#### FICHA V2-07

```
SCREEN_NUMBER                   = 21
SCREEN_NAME                     = Pares do Beni
EXPECTED_VISIBLE_TITLE          = "Pares do Beni" (tela de entrada, antes de jogar)
ENTRY_FROM                      = Brincar
EXACT_USER_ACTION               = no Brincar, na grade "Jogos do Beni", tocar o botão "Jogar" do
                                  cartão do primeiro jogo
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão **"Pares do Beni"** (subtítulo "Memória") — botão "Jogar"
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = rolar se rolar; senão diga "não rola"
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se a arte de abertura é cortada; se o botão de começar
                                  continua visível e alcançável
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na tela de entrada, sem partida iniciada
EXIT_ACTION                     = seta de voltar (1 vez)
NEXT_SCREEN                     = 22
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = o botão **"Começar a jogar"**
STATE_MUTATION_RISK             = NENHUM enquanto a partida não começar
```

#### FICHA V2-08

```
SCREEN_NUMBER                   = 22
SCREEN_NAME                     = Palavrinhas do Beni
EXPECTED_VISIBLE_TITLE          = "Palavrinhas do Beni" (tela de entrada)
ENTRY_FROM                      = Brincar
EXACT_USER_ACTION               = tocar "Jogar" no segundo cartão da grade
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão **"Palavrinhas do Beni"** (subtítulo "Letras")
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = rolar se rolar
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = idem ficha 21
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na entrada, sem partida
EXIT_ACTION                     = seta de voltar (1 vez)
NEXT_SCREEN                     = 23
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = o botão que inicia a partida
STATE_MUTATION_RISK             = NENHUM enquanto a partida não começar
```

#### FICHA V2-09

```
SCREEN_NUMBER                   = 23
SCREEN_NAME                     = Cadê a Ovelhinha?
EXPECTED_VISIBLE_TITLE          = "Cadê a Ovelhinha?" (tela de entrada, com as dificuldades)
ENTRY_FROM                      = Brincar
EXACT_USER_ACTION               = tocar "Jogar" no terceiro cartão da grade
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão **"Cadê a Ovelhinha?"** (subtítulo "Atenção")
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = rolar até ver todas as dificuldades e voltar
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se as opções de dificuldade ficam fora da tela ou espremidas
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na entrada, sem partida
EXIT_ACTION                     = seta de voltar (1 vez)
NEXT_SCREEN                     = 24
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = qualquer botão "Começar no …" ·
                                  o link "Ferramentas de teste", se aparecer
STATE_MUTATION_RISK             = NENHUM enquanto a partida não começar
```

#### FICHA V2-10

```
SCREEN_NUMBER                   = 24
SCREEN_NAME                     = Monte a Cena (início)
EXPECTED_VISIBLE_TITLE          = "Monte a Cena" · "Escolha uma história e monte seus momentos
                                  favoritos."
ENTRY_FROM                      = Brincar
EXACT_USER_ACTION               = tocar "Jogar" no quarto cartão da grade
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão **"Monte a Cena"** (subtítulo "Raciocínio")
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até o fim (passando pelo cartão "Continue montando",
                                  por "Meus Quadros" e por "Escolha uma história") e voltar
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se os cartões viram faixas larguíssimas; se o cartão
                                  "Continue montando" perde a miniatura
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no Monte a Cena, mesma altura
EXIT_ACTION                     = tocar a história "A Criação" em "Escolha uma história"
NEXT_SCREEN                     = 25
DO_NOT_TOUCH                    = por enquanto, "Continue montando" e "Meus Quadros"
                                  (eles são as fichas 27 e 28)
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V2-11

```
SCREEN_NUMBER                   = 25
SCREEN_NAME                     = Monte a Cena — cenas da história
EXPECTED_VISIBLE_TITLE          = "A Criação" com a lista de cenas montáveis
ENTRY_FROM                      = Monte a Cena (início)
EXACT_USER_ACTION               = tocar o cartão da história
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão **"A Criação"** (é a primeira da lista)
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até o fim da lista de cenas e voltar ao topo
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = quantas cenas por linha; se as miniaturas são cortadas
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na lista de cenas, mesma altura
EXIT_ACTION                     = tocar a PRIMEIRA cena da lista
NEXT_SCREEN                     = 26
DO_NOT_TOUCH                    = nada além da primeira cena
STATE_MUTATION_RISK             = NENHUM
```

#### FICHA V2-12

```
SCREEN_NUMBER                   = 26
SCREEN_NAME                     = Monte a Cena — dificuldade
EXPECTED_VISIBLE_TITLE          = "Quantas peças você quer montar?" (com as opções
                                  "4 peças / Para começar", "6 peças / Vamos montar",
                                  "9 peças / Grande desafio")
ENTRY_FROM                      = lista de cenas
EXACT_USER_ACTION               = tocar a primeira cena da lista
EXACT_VISIBLE_CONTROL_TO_TOUCH  = a primeira miniatura de cena
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 0
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = rolar até ver as três opções e o botão do rodapé, e voltar
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se as três plaquinhas ficam apertadas ou saem da tela;
                                  se o botão do rodapé some abaixo da borda
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua na mesma escolha, sem nada selecionado a mais
EXIT_ACTION                     = voltar 2 vezes (cenas → início do Monte a Cena)
NEXT_SCREEN                     = 27
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = o botão **"Começar a montar"** — ele APAGA a
                                  sua sessão pela metade e destrói a ficha 28
STATE_MUTATION_RISK             = ALTO: "Começar a montar" cria uma sessão nova por cima da atual
```

#### FICHA V2-13

```
SCREEN_NUMBER                   = 27
SCREEN_NAME                     = Meus Quadros (galeria do Monte a Cena)
EXPECTED_VISIBLE_TITLE          = "Meus Quadros"
ENTRY_FROM                      = Monte a Cena (início)
EXACT_USER_ACTION               = de volta ao início do Monte a Cena, tocar o cartão da galeria
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão **"Meus Quadros"**
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 2 (as duas voltas da ficha 26)
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = descer até o fim e voltar ao topo (pode estar vazia — se
                                  estiver, diga "está vazia" e siga o ritual assim mesmo)
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = mesmo percurso
OBJECTIVE_OBSERVATIONS          = se o aviso de galeria vazia fica centralizado ou perdido;
                                  quantos quadros por linha, se houver
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua em Meus Quadros
EXIT_ACTION                     = seta de voltar (1 vez)
NEXT_SCREEN                     = 28
DO_NOT_TOUCH                    = qualquer ícone de apagar
STATE_MUTATION_RISK             = NENHUM se não apagar
```

#### FICHA V2-14

```
SCREEN_NUMBER                   = 28
SCREEN_NAME                     = Monte a Cena — tabuleiro (sessão retomada)
EXPECTED_VISIBLE_TITLE          = o tabuleiro com a bandeja de peças; no alto o nome da cena
ENTRY_FROM                      = Monte a Cena (início)
EXACT_USER_ACTION               = no início do Monte a Cena, tocar o cartão de retomada — o que
                                  fica LOGO ABAIXO do cabeçalho
EXACT_VISIBLE_CONTROL_TO_TOUCH  = cartão com a etiqueta **"Continue montando"**, o nome da cena e
                                  o contador **"1 de 4 peças"**. (Este é o "Retomar" — o texto
                                  visível na tela é "Continue montando")
NUMBER_OF_BACK_ACTIONS_IF_NEEDED= 1
ORIENTATION_ON_ENTRY            = RETRATO
WAIT_SECONDS_PORTRAIT           = 4
PORTRAIT_SCROLL                 = NENHUM (não rola — mostre o tabuleiro e a bandeja inteiros)
ROTATE_TO_LANDSCAPE             = SIM
WAIT_SECONDS_LANDSCAPE          = 5
LANDSCAPE_SCROLL                = NENHUM
OBJECTIVE_OBSERVATIONS          = se o tabuleiro é cortado; se a bandeja de peças sai da tela;
                                  se a peça já colocada continua no lugar depois de girar
ROTATE_BACK_TO_PORTRAIT         = SIM
STATE_PRESERVED_EXPECTATION     = continua no MESMO tabuleiro, com a MESMA peça já encaixada e
                                  as demais ainda na bandeja
EXIT_ACTION                     = tocar "‹ Voltar" e, se oferecerem, "Voltar ao Monte a Cena"
NEXT_SCREEN                     = fim do VÍDEO 2
DO_NOT_TOUCH                    = ⚠️ NÃO TOQUE EM = as peças da bandeja · o tabuleiro ·
                                  qualquer botão de reiniciar/embaralhar
STATE_MUTATION_RISK             = encaixar peça altera a sessão salva. Só entrar, olhar e girar
                                  não muda nada
```

### 13.2 Encerramento do VÍDEO 2

Depois da ficha 28: toque "‹ Voltar" até chegar ao **Brincar** e depois **Início**. Gire uma
última vez para paisagem e de volta para retrato. Diga em voz alta **"fim do vídeo dois"** e
**pare de gravar**.

**Deixe o tablet:** aberto no app, na aba **Início**, em **retrato**, **rotação automática ainda
LIGADA**. Não feche o app, não desligue o cabo USB, não mexa em nada no computador. Só me avise
que terminou.

---

## 14. Resumo dos rótulos reais (correções ao §9)

O §9 usou nomes de rota. Onde o texto visível na tela é diferente, **vale esta tabela**:

| §9 dizia | O que está escrito na tela |
|---|---|
| "Ver recompensas →" | **"Abrir presentes →"** |
| "Livrinho" | **"📖 Meu Livrinho da Fé"** (cartão) |
| "Quiz" | **"⭐ Quiz da História"** (cartão) |
| "Guardar no coração" | **"✨ Guardar no coração"** — confere |
| "toque no botão que conclui a cena" | **"Ver conclusão →"** (a cena já está feita) |
| "última cena" | **"O descanso de Deus"** (10ª e última) |
| "ladrilho Estrelinhas" | **"⭐ Estrelinhas"** (o do meio dos três) |
| "Colorir a última parte" | confere — e o desenho aberto se chama **"Na criação de Deus"** |
| "Área dos Responsáveis" | **"Área dos Pais"**, dentro do bloco "🔐 Para responsáveis" |
| "Abrir folha" | confere — cartão "Criar livre" |
| "Minhas artes" | cartão "Minhas artes", botão **"Ver"** |
| "uma história" (Monte a Cena) | **"A Criação"** |
| "uma cena" (Monte a Cena) | a **primeira** miniatura da lista |
| "Retomar" | **"Continue montando"** · "1 de 4 peças" |
| "Baú do Beni" / "Cultinho em Casa" / "Cantinho do Beni" | conferem |
| "Pares do Beni" / "Palavrinhas do Beni" / "Cadê a Ovelhinha?" / "Monte a Cena" | conferem |
| "Meus Quadros" | confere |

**Nenhum texto do produto foi alterado.** Esta tabela apenas diz ao fundador o que estará escrito.
