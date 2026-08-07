# Tasks + Analyze — 021 · Fase 6 — Shell, splash e sistema visual

> **Etapa SDD 5 (Tasks)** e **Etapa SDD 6 (Analyze)** da feature 021.
> Artefatos-pai: `spec-fase6-shell-splash-sistema-visual.md` (Etapas 1–3) e `plan.md` (Etapa 4).
> Produzido sob a autorização **"FASE 6 — PORTÃO HUMANO 2 APROVADO COM EMENDAS VINCULANTES"**.
>
> **Este documento não implementa nada.** Nenhuma task abaixo foi executada. Nenhum caminho de runtime
> foi tocado na produção deste arquivo. `npm ci`, `npm run smoke`, `expo-doctor`, Metro, build,
> instalação e validação física estão **descritos** aqui e **não executados**.

---

## 0. Estado de entrada e rastreabilidade

| Item | Valor |
|---|---|
| Worktree | `C:\tmp\ptf_fase6_shell_splash_wt` |
| Branch | `feat/fase6-shell-splash` |
| HEAD na abertura da Etapa 5 | `5ed814e` (commit documental da Emenda 1) |
| Base de runtime | `HEAD:src` ≡ `015c438:src` — árvore `3d7c07db8e001fdbe0c84b84e65f20cd806a6b17` |
| Ordem macro (imposta pelo fundador, §9 da autorização) | **PRE-0 · B1 · B3 · B2 · B2′ · B5 · B4 · B6 · B7** |
| Parada obrigatória | **Portão Humano 3** — nada além de Tasks + Analyze nesta rodada |

**Nota de ferramenta (declarada, não silenciada):** `.specify/scripts/powershell/setup-tasks.ps1 -Json`
falha com `ERROR: spec.md not found`. É a mesma limitação já registrada para `setup-plan.ps1`: o script
assume o nome `spec.md`, enquanto a convenção real deste repositório (specs/016, specs/018, specs/021)
pareia `spec-<slug>.md` com `plan.md`. O `tasks.md` foi produzido manualmente seguindo a convenção real
de `specs/018-c60-pilot-activation/tasks.md`. `.specify/extensions.yml` registra apenas
`after_specify` e `after_plan` — **não há** `before_tasks` nem `after_tasks`, logo nenhum hook se aplica.

---

## 1. Inventário nominal fechado das telas (exigido pelo Plan §15.4)

Plan §15.4: *"A lista nominal fechada é produzida na Etapa 5 (Tasks), aplicando I1–I4 e E1–E3 às 42 telas,
uma a uma, com o árbitro citado por linha… Uma tela sem veredito explícito — nem incluída nem excluída —
invalida a varredura."*

**Universo:** 42 arquivos em `src/screens/` (contagem verificada por listagem, não estimada).
**Árbitro único de inclusão/exclusão:** `src/navigation/AppNavigator.js` — não `routes.js`, conforme a
correção registrada no Plan §15.2.

### 1.1 Excluídas por E1 — rota **dev-gated**, inalcançável em build de produção (10 telas)

| # | Tela | Rota | Árbitro (linha) | Portão |
|---|---|---|---|---|
| E-01 | `Coloring60LabScreen.js` | `Coloring60Lab` | `AppNavigator.js:382-390` | `isInternalToolsEnabled()` |
| E-02 | `SceneValidationScreen.js` | `SceneValidation` | `AppNavigator.js:391-397` | `isInternalToolsEnabled()` |
| E-03 | `OvelhaAssetGalleryScreen.js` | `OvelhaAssetGallery` | `AppNavigator.js:428-434` | `isInternalToolsEnabled()` |
| E-04 | `MonteACenaSpikeScreen.js` | `MonteACenaSpike` | `AppNavigator.js:446-452` | `isInternalToolsEnabled()` |
| E-05 | `MonteACenaPrototypeScreen.js` | `MonteACenaPrototype` | `AppNavigator.js:453-460` | `isInternalToolsEnabled()` |
| E-06 | `MonteACenaLevelSelectScreen.js` | `MonteACenaLevels` | `AppNavigator.js:461-467` | `isInternalToolsEnabled()` |
| E-07 | `MonteACenaGameScreen.js` | `MonteACenaGame` | `AppNavigator.js:468-474` | `isInternalToolsEnabled()` |
| E-08 | `MonteACenaGameV2Screen.js` | `MonteACenaGameV2` | `AppNavigator.js:475-481` | `isInternalToolsEnabled()` |
| E-09 | `PuzzleGestureLabScreen.js` | `PuzzleGestureLab` | `AppNavigator.js:491-493` | `isInternalToolsEnabled()` |
| E-10 | `PackSandboxDevScreen.js` | `PackSandboxDev` | `AppNavigator.js:554-560` | `isPackSandboxDevEnabled()` |

Contagem de portões conferida no arquivo: **9** ocorrências de `isInternalToolsEnabled()`
(linhas 382, 391, 428, 446, 453, 461, 468, 475, 491) **+ 1** `devPacksEnabled`
(linha 554, definido em `:290`) = **10 rotas gated**. Nenhuma outra.

> A lista E1 original do Plan §15.2 afirmava **17** rotas dev-gated. Estava **errada** e já foi corrigida
> no Plan: **7** daquelas 17 são user-facing e voltaram ao inventário (linhas I-18 a I-24 abaixo).

### 1.2 Incluídas (32 telas)

**Critérios de inclusão:** I1 alcançável em build de produção · I2 renderiza UI perceptível ao usuário ·
I3 pertence a fluxo publicado · I4 participa da abertura.

| # | Tela | Alcance | Árbitro (linha) |
|---|---|---|---|
| I-01 | `HomeScreen.js` | aba `Início` | `AppNavigator.js:125-136` (TAB_DEFS) |
| I-02 | `AdventureMapScreen.js` | aba `Aventuras` | `AppNavigator.js:125-136` |
| I-03 | `BrincarScreen.js` | aba `Ateliê` (rótulo *Brincar*) | `AppNavigator.js:125-136` |
| I-04 | `TrophiesScreen.js` | aba `Estrelinhas` **+** rota `EstrelinhasCena` | `AppNavigator.js:125-136` e `:545-552` |
| I-05 | `ProfileScreen.js` | aba `Perfil` | `AppNavigator.js:125-136` |
| I-06 | `SplashScreen.js` | rota `Splash` — **I4, abertura** | `AppNavigator.js:295-301` |
| I-07 | `OnboardingScreen.js` | rota `Onboarding` | `AppNavigator.js:302-308` |
| I-08 | `StoriesScreen.js` | rota `Stories` | `AppNavigator.js` (stack raiz) |
| I-09 | `StoryDetailScreen.js` | rota `StoryDetail` | `AppNavigator.js` (stack raiz) |
| I-10 | `NarrationScreen.js` | rota `Narration` | `AppNavigator.js` (stack raiz) |
| I-11 | `ColoringScreen.js` | rota `Coloring` | `AppNavigator.js` (stack raiz) |
| I-12 | `Coloring60CollectionScreen.js` | rota `Coloring60Collection` | `AppNavigator.js` (stack raiz) |
| I-13 | `Coloring60ArtPreviewScreen.js` | rota `Coloring60ArtPreview` | `AppNavigator.js` (stack raiz) |
| I-14 | `CongratsScreen.js` | rota `Congrats` | `AppNavigator.js` (stack raiz) |
| I-15 | `AtelierCanvasScreen.js` | rota `AtelierCanvas` | `AppNavigator.js` (stack raiz) |
| I-16 | `AtelierGalleryScreen.js` | rota `AtelierGallery` | `AppNavigator.js` (stack raiz) |
| I-17 | `ParesDoBeniScreen.js` | rota `ParesDoBeni` | `AppNavigator.js` (stack raiz) |
| I-18 | `CadeAOvelhinhaScreen.js` | rota **SEMPRE registrada** (aba Brincar) | `AppNavigator.js:417-425` · D-OVELHINHA-UF1 |
| I-19 | `PalavrinhasDoBeniScreen.js` | rota **SEMPRE registrada** | `AppNavigator.js:435-442` · D-PALAVRINHAS-UF1 |
| I-20 | `MonteACenaHomeScreen.js` | fluxo **oficial user-facing** | `AppNavigator.js:482-486` |
| I-21 | `MonteACenaStoryScreen.js` | fluxo oficial user-facing | `AppNavigator.js:487` |
| I-22 | `MonteACenaDifficultyScreen.js` | fluxo oficial user-facing | `AppNavigator.js:488` |
| I-23 | `MonteACenaGalleryScreen.js` | fluxo oficial user-facing | `AppNavigator.js:489` |
| I-24 | `MonteACenaTableGameScreen.js` | fluxo oficial user-facing | `AppNavigator.js:490` |
| I-25 | `PostStoryHubScreen.js` | rota `PostStoryHub` | `AppNavigator.js:494-560` |
| I-26 | `QuizScreen.js` | rota `Quiz` | `AppNavigator.js:494-560` |
| I-27 | `ReflectionScreen.js` | rota `Reflection` | `AppNavigator.js:494-560` |
| I-28 | `LumiMomentScreen.js` | rota `LumiMoment` | `AppNavigator.js:494-560` |
| I-29 | `ParentAreaScreen.js` | rota `ParentArea` (única com header) | `AppNavigator.js:494-560` |
| I-30 | `StoryBookScreen.js` | rota `StoryBook` | `AppNavigator.js:494-560` |
| I-31 | `CultinhoEmCasaScreen.js` | rota `FamilyWorship` | `AppNavigator.js:494-560` |
| I-32 | `BeniChestScreen.js` | rota `BeniChest` | `AppNavigator.js:494-560` |

> `AppNavigator.js:482-485` (verbatim): *"Monte a Cena — fluxo **OFICIAL user-facing** (publicado,
> aprovado no aparelho / `fca92f5`) … Rotas **SEMPRE registradas**."* É este comentário, e não `routes.js`,
> que decide I-20 a I-24.

### 1.3 Fechamento aritmético

**32 incluídas + 10 excluídas = 42.** Nenhuma tela ficou sem veredito explícito.
As três telas de cobertura zerada citadas em §6.3.2 do Plan **estão** entre as 32 incluídas — E2 e E3
excluem **parcelas** de verificação, nunca telas inteiras.

---

## 2. Tasks (Etapa SDD 5)

Legenda das colunas: **Dep.** = tasks que precisam estar concluídas antes ·
**Evidência esperada** = artefato verificável produzido pela task (o que se anexa ao relatório) ·
**Rollback** = como desfazer só esta task.

---

### 2.1 Bloco **PRE-0** — preparação segura do ambiente e verificação V0

Objetivo: saber, **por evidência e não por dedução**, o que já existe antes de tocar em qualquer arquivo.

| # | Task | Arquivos candidatos | Dep. | Teste / validação / evidência esperada | Rollback |
|---|---|---|---|---|---|
| T001 | Confirmar estado de entrada: branch `feat/fase6-shell-splash`, HEAD, `git status --short` vazio, índice vazio, `src/` idêntico a `015c438` | — (leitura) | — | Saída literal de `git rev-parse HEAD`, `git status --short` e `git diff --stat 015c438 -- src` | N/A (leitura) |
| T002 | Instalar dependências com **`npm ci`** a partir do `package-lock.json` existente. **Proibido** `npm install` como substituto silencioso | `package-lock.json` (não modificar) | T001 | Log do `npm ci`; `git status --short` continua sem alterar `package.json`/lockfile | `rm -rf node_modules` e reinstalar |
| T003 | Baseline **`npm run smoke`** ANTES de qualquer edição | — | T002 | Saída completa; contagem de checks verdes registrada como linha-base | N/A |
| T004 | Baseline **`npx expo-doctor`** antes de qualquer edição | — | T002 | Saída completa; achados pré-existentes registrados para não serem atribuídos à Fase 6 | N/A |
| T005 | **V0.1** — consultar o **histórico remoto do EAS** (`eas build:list`) e recuperar os builds existentes. Se a consulta não ocorrer, classificar build como **NÃO RECUPERADO** — nunca deduzir ausência de build pela ausência de alteração nas configurações | — | T002 | Tabela dos builds retornados (id, plataforma, perfil, data, status) **ou** a declaração explícita "NÃO RECUPERADO" | N/A |
| T006 | **V0.2** — para cada build recuperado, identificar o **commit de origem** | — | T005 | Mapa build → commit | N/A |
| T007 | **V0.3** — para cada build, identificar o **perfil** (`development`/`preview`/outro) | `eas.json` (leitura) | T005 | Mapa build → perfil | N/A |
| T008 | **V0.4** — comparar o **fingerprint nativo** de cada build com o fingerprint do estado atual | `app.json`, `eas.json` (leitura) | T005 | Fingerprints lado a lado; veredito "compatível / incompatível" | N/A |
| T009 | **V0.5** — verificar **expiração/validade** dos artefatos e do provisioning iOS | — | T005 | Datas de expiração; veredito por plataforma | N/A |
| T010 | **V0.6** — provar que **nenhuma** mudança prevista na Fase 6 exige código nativo novo (as alterações de `app.json` de B4 exigem **rebuild**, não código nativo novo) | `app.json`, `eas.json` (leitura) | T005 | Lista das mudanças por bloco × "exige nativo? S/N" | N/A |
| T011 | **V0.7** — provar que existe **Dev Client instalável no telefone** (iOS **e** Android) | — | T006–T010 | Print/registro da instalação ou a declaração "NÃO DETERMINADO SEM EXECUÇÃO FÍSICA" | N/A |
| T012 | **V0.7-b** — provar que existe **Dev Client instalável no tablet** | — | T006–T010 | Igual a T011, para o tablet | N/A |
| T013 | Confirmar **disponibilidade física** dos telefones iOS e Android para a campanha B7 | — | — | Declaração de disponibilidade com data | N/A |
| T014 | Confirmar **disponibilidade física do tablet**. **Go/no-go de B3:** sem tablet, B3 **não fecha**; não marcar o risco como aprovado; não usar simulador como equivalente físico | — | — | Declaração de disponibilidade com data, ou o bloqueio explícito de B3 | N/A |
| T015 | **Veredito V0:** um **novo development build** é necessário? Responder só com base em T005–T012 | — | T005–T012 | Veredito "SIM/NÃO" + prova; se SIM, agendar o build **antes** de B1 | N/A |
| T016 | Revalidar o **inventário nominal §1** contra `AppNavigator.js` no HEAD de implementação (recontagem manual auditada, não presumida). Qualquer divergência volta ao §1 **antes** de B7 | `src/navigation/AppNavigator.js` (leitura) | T001 | Recontagem 32+10=42 confirmada, ou o delta declarado | N/A |

**Testes do bloco:** T003, T004. **Validação física:** T011–T014. **Rollback do bloco:** nenhum arquivo é
modificado em PRE-0 — o bloco é integralmente de leitura e verificação.

---

### 2.2 Bloco **B1** — fundação responsiva unificada (P-30, P-29)

Gates que fecham o bloco: **G-BP-1, G-BP-2, G-SAFE** · Controle negativo: **CN-1**.

| # | Task | Arquivos candidatos | Dep. | Teste / validação / evidência esperada | Rollback |
|---|---|---|---|---|---|
| T017 | Produzir a **lista nominal fechada das telas que B1 migra**, pela interseção dos 3 critérios do Plan §6.1.2 corrigido (incluída no §1 · consome `useSafeAreaInsets` diretamente para *padding* de topo/base · adoção não obriga tocar `productTheme` em cascata). Excedente é **declarado e adiado**, não migrado em silêncio | — (produz lista neste arquivo) | T016 | Lista nominal com o motivo por tela; é ela que **G-SAFE** passa a verificar | N/A |
| T018 | Eleger **`tokens.breakpoints`** como fonte única de breakpoint e marcar `productTheme.tabletBreakpoint: 768` como derivado/legado — sem migrar os 75 consumidores de `productTheme` | `src/theme/tokens.js:128`, `src/theme/productTheme.js:107` | T017 | Diff mostrando fonte única; nenhum novo token criado | `git checkout --` nos 2 arquivos |
| T019 | Substituir as **10 comparações literais a 768** pelo breakpoint único **600** | `BeniGuideOverlay.js:79`, `CenteredContent.js:8`, `AppNavigator.js:283`, `ParentAreaScreen.js:286`, `PostStoryHubScreen.js:51`, `QuizScreen.js:28`, `ReflectionScreen.js:51`, `StoryBookScreen.js:195`, `StoryDetailScreen.js:112`, `TrophiesScreen.js:196` | T018 | `git grep -n 768 -- src` sem ocorrência de breakpoint remanescente; **G-BP-1** verde | reversão por arquivo |
| T020 | Remover **`productTheme` de `AppScreen.js`**; passar a consumir `tokens.js`. Condição inegociável do Plan §6.1.2 | `src/components/AppScreen.js` | T018 | `AppScreen.js` sem `import productTheme`; **G-BP-2** verde | reversão do arquivo |
| T021 | Migrar as telas da lista **T017** para consumir `AppScreen` (uma tela por commit lógico interno, para manter rollback baixo) | telas da lista T017 | T020 | Diff por tela; **G-SAFE** verde sobre a lista fechada | reversão por tela |
| T022 | Resolver o `CenteredContent` concorrente: **delegar** a `AppScreen`/`maxContentWidth` ou **aposentar**. Decidir por evidência de consumo, não por preferência | `src/components/CenteredContent.js` + consumidores | T019, T020 | Decisão registrada + diff; nenhum consumidor órfão | reversão do arquivo |
| T023 | Unificar o tratamento de **área segura** dentro de `AppScreen` para as telas migradas | `src/components/AppScreen.js`, telas de T021 | T021 | Comparação visual topo/base antes×depois em 2 telas-amostra | reversão de T021/T023 |
| T024 | Criar os gates **G-BP-1** (fonte única de breakpoint, valor 600) e **G-BP-2** (`AppScreen` não importa `productTheme`) no smoke | `scripts/smoke.js` | T019, T020 | `npm run smoke` verde com os 2 checks novos | remover os checks |
| T025 | Criar o gate **G-SAFE** com o escopo corrigido: nenhuma tela **da lista T017** chama `useSafeAreaInsets` diretamente | `scripts/smoke.js` | T021, T024 | `npm run smoke` verde | remover o check |
| T026 | Executar **CN-1** e a **validação intermediária na banda 600–767** (a faixa que muda de comportamento ao migrar 768 → 600) | — | T019–T025 | Prints na banda 600–767 em telefone grande/tablet pequeno; CN-1 registrado | N/A |

**Rollback do bloco:** alto — a migração é por tela e por arquivo, revertível individualmente sem tocar
persistência, progresso ou assets.

---

### 2.3 Bloco **B3** — shell de navegação e hierarquia de rotas (P-31, P-47, P-27)

Gates: **G-NAV-1, G-NAV-2** · Físico: **F-TAB-600, F-TAB-NAV, F-TAB-BACK, F-TAB-SIDE, F-TAB-C60**.
**B3 não fecha sem tablet físico (T014).**

| # | Task | Arquivos candidatos | Dep. | Teste / validação / evidência esperada | Rollback |
|---|---|---|---|---|---|
| T027 | Substituir o `TabletLayout` que **fabrica** um shell por um **`Tab.Navigator` real** também no tablet. Não é troca de nome de rota | `src/navigation/AppNavigator.js:152-201` | T019, T026 | Diff; `route` deixa de ser objeto literal | reversão do arquivo |
| T028 | Reposicionar a **sidebar como apresentação** (tabBar customizado do mesmo navegador), não como navegador paralelo | `src/components/TabletSidebar.js`, `AppNavigator.js` | T027 | Sidebar renderiza a partir do estado real do Tab.Navigator | reversão dos 2 arquivos |
| T029 | Eliminar o **`route` fabricado** (`{ params, key, name }` montado à mão) e entregar o contrato real do React Navigation às telas de aba | `AppNavigator.js:181-185` | T027 | `git grep` sem o objeto fabricado; telas recebem `route` do navegador | reversão do arquivo |
| T030 | Corrigir as **11 navegações inefetivas** de §6.2.2 (8 com payload aninhado + 3 por nome de aba) para que troquem de aba acima do breakpoint | `src/navigation/monteACenaExit.js:38`, `CadeAOvelhinhaScreen.js:1074`, `CultinhoEmCasaScreen.js:56` e `:183`, `PalavrinhasDoBeniScreen.js:894`, `ParentAreaScreen.js:493`, `ParesDoBeniScreen.js:971`, `StoryBookScreen.js:740` | T027, T029 | Critério **ZERO navegações inefetivas no escopo** — verificado uma a uma, com print por caminho | reversão por arquivo |
| T031 | Normalizar para `ROUTES` as **4 chamadas com string literal** (`CultinhoEmCasaScreen.js:56`, `:183`, `ParentAreaScreen.js:493`, `StoryBookScreen.js:740`) | os 3 arquivos acima | T030 | `git grep -n "navigate('Home'"` sem ocorrência | reversão por arquivo |
| T032 | Preservar o **estado de aba** ao voltar de uma rota empilhada | `AppNavigator.js` | T027 | Roteiro físico: entrar em rota empilhada → voltar → a aba de origem continua ativa | reversão |
| T033 | Garantir **histórico e botão voltar** no tablet. **Não** adicionar `BackHandler` manual se o React Navigation já resolver — provar antes de codar | `AppNavigator.js` | T027, T032 | Evidência de que o voltar do Android funciona sem handler manual, **ou** justificativa do handler | reversão |
| T034 | Verificar **LumiMoment** sob o shell novo (rota empilhada sobre aba) | `src/screens/LumiMomentScreen.js` | T027 | Print tablet + telefone | reversão |
| T035 | Verificar **StoryBook** sob o shell novo | `src/screens/StoryBookScreen.js` | T027, T031 | Print tablet + telefone | reversão |
| T036 | Aplicar **`maxContentWidth`** no tablet, sem esticar conteúdo infantil em telas largas | `src/components/AppScreen.js` / `CenteredContent` | T022, T027 | Print tablet mostrando a coluna limitada | reversão |
| T037 | Criar **G-NAV-1** (nenhum `route` fabricado no shell) e **G-NAV-2** (nenhuma navegação de aba por payload aninhado fora do contrato) no smoke | `scripts/smoke.js` | T029, T030 | `npm run smoke` verde com os 2 checks | remover os checks |
| T038 | **Validação física em tablet — fecha B3.** F-TAB-600, F-TAB-NAV, F-TAB-BACK, F-TAB-SIDE, F-TAB-C60 | — | T014, T027–T037 | 5 roteiros com print/vídeo. Sem tablet: **B3 não fecha** | N/A |

**Rollback do bloco:** médio — concentrado em `AppNavigator.js` e `TabletSidebar.js`; as correções de
navegação são pontuais e revertíveis por arquivo.

---

### 2.4 Bloco **B2** — acessibilidade semântica e tipografia (P-28, P-20)

Gates: **G-A11Y-1, G-A11Y-2** · Físico: **F-A11Y-TB, F-A11Y-VO, F-A11Y-FS, F-A11Y-TG**.

| # | Task | Arquivos candidatos | Dep. | Teste / validação / evidência esperada | Rollback |
|---|---|---|---|---|---|
| T039 | Levantar o comportamento sob **`fontScale` 1.3** nas 32 telas do §1 e listar as que quebram (corte, sobreposição, botão inacessível) | telas do §1 (leitura) | T026, T038 | Lista nominal de telas quebradas com print | N/A |
| T040 | Aplicar `accessibilityRole` correto nos **componentes-base** (botões, cards, chips, cabeçalhos) — corrigindo na primitiva, não tela a tela | `src/components/*` | T039 | Diff nos componentes-base; propagação verificada em 3 telas-amostra | reversão por componente |
| T041 | Definir **`accessibilityLabel`** nos elementos interativos sem rótulo textual | `src/components/*`, telas de T039 | T040 | Varredura: nenhum `Pressable`/`TouchableOpacity` sem rótulo no escopo | reversão |
| T042 | Definir **`accessibilityHint`** onde a ação não é óbvia pelo rótulo | idem | T041 | Lista dos hints adicionados com justificativa | reversão |
| T043 | Definir **`accessibilityState`** (selected/disabled/checked) em abas, chips e selos | `src/components/*`, `AppNavigator.js` | T040 | Estado anunciado corretamente em TalkBack/VoiceOver | reversão |
| T044 | Corrigir a **ordem de leitura** onde o leitor de tela percorre fora da ordem visual | telas de T039 | T041 | Roteiro de leitura antes×depois | reversão |
| T045 | Tratar **modais**: `accessibilityViewIsModal` e foco inicial | modais do escopo | T044 | Leitor não escapa para o fundo do modal | reversão |
| T046 | Usar **`announceForAccessibility`** para mudanças de estado não visíveis ao leitor | telas com estado assíncrono | T045 | Anúncio verificado fisicamente | reversão |
| T047 | Corrigir **targets de toque** abaixo do mínimo (44pt iOS / 48dp Android) | componentes-base + telas | T040 | Medição por elemento corrigido | reversão |
| T048 | Criar **G-A11Y-1** e **G-A11Y-2** no smoke **e** registrar explicitamente que o **P-28 global permanece com resíduo nas Fases 10 e 12B** — não marcar P-28 como totalmente resolvido na matriz se o árbitro não permitir | `scripts/smoke.js`; registro no relatório | T040–T047 | Smoke verde + a ressalva escrita, verbatim, no relatório | remover os checks |

**Rollback do bloco:** alto — atributos de acessibilidade são aditivos e não alteram lógica de negócio.

---

### 2.5 Bloco **B2′** — reduce motion e hápticos (P-104)

Escopo apurado por evidência no Plan §6.4.1: **9 arquivos** (Grupo A = 3, Grupo B = 6), não 5.
Gate: **G-MOTION** · Controle negativo: **CN-5** · Físico: **F-MOTION-ON, F-MOTION-OFF**.

| # | Task | Arquivos candidatos | Dep. | Teste / validação / evidência esperada | Rollback |
|---|---|---|---|---|---|
| T049 | Criar **`src/hooks/useReduceMotion.js`** usando **apenas APIs já existentes** (`AccessibilityInfo.isReduceMotionEnabled` + listener), preservando o tratamento assíncrono de `ready` já praticado no código | `src/hooks/useReduceMotion.js` (novo) | T048 | Arquivo novo, **zero dependência nova**; teste focado do hook | apagar o arquivo |
| T050 | **Grupo A — 3 telas que vibram sem sequer consultar a preferência:** `CadeAOvelhinhaScreen` (1 chamada), `MonteACenaDifficultyScreen` (1), `PuzzleGestureLabScreen` (4) | os 3 arquivos | T049 | Cada chamada de `Haptics` passa a ser condicionada; diff por arquivo | reversão por arquivo |
| T051 | **Grupo B — 6 arquivos que leem a preferência mas não a aplicam ao háptico:** `usePuzzleController` (3), `AtelierCanvasScreen` (2), `MonteACenaGameScreen` (1), `MonteACenaSpikeScreen` (1), `MonteACenaTableGameScreen` (3), `ParesDoBeniScreen` (3) | os 6 arquivos | T049 | Idem; total do escopo = **9 arquivos / 15 chamadas** condicionadas | reversão por arquivo |
| T052 | Confirmar que o **Grupo C já conforme** permanece intocado: `OnboardingScreen.js:180`, `Coloring60CompletionOverlay.js:963` e `:980` | os 2 arquivos (leitura) | T051 | `git diff` vazio nesses arquivos | N/A |
| T053 | Criar **G-MOTION** (nenhuma chamada de `expo-haptics` no escopo fora de guarda de reduce motion) e executar **CN-5**: provar que o háptico **continua ativo** para quem **não** pediu movimento reduzido | `scripts/smoke.js` | T050–T052 | Smoke verde + CN-5 registrado | remover o check |
| T054 | **Validação física** F-MOTION-ON e F-MOTION-OFF, nas 5 telas do escopo alcançáveis em produção (`CadeAOvelhinha`, `MonteACenaDifficulty`, `AtelierCanvas`, `MonteACenaTableGame`, `ParesDoBeni`) | — | T053 | Vídeo com a preferência ligada e desligada | N/A |

> Os outros 4 arquivos do escopo (`PuzzleGestureLab`, `MonteACenaSpike`, `MonteACenaGame` e o
> `usePuzzleController`, cujo **único consumidor é `MonteACenaGameV2Screen`**) são **dev-gated**: são
> corrigidos no código, mas **não** têm validação física em build de produção. Isso é declarado, não omitido.

---

### 2.6 Bloco **B5** — estados de card e sistema de selos (D-SELOS-ESTADO-V2)

Gate: **G-SEAL** (substitui A0.7) · Físico: **F-SEAL** (inclui a validação física do azul).

| # | Task | Arquivos candidatos | Dep. | Teste / validação / evidência esperada | Rollback |
|---|---|---|---|---|---|
| T055 | **Classificar cada cor antes de substituir**: status · recompensa · conteúdo infantil · decoração · debug · funcional-não-status. Só a classe **status** entra em B5 | `src/theme/tokens.js`, componentes de card | T054 | Tabela cor → classe → "entra em B5? S/N" | N/A |
| T056 | Selo **Grátis** = verde suave (manter `free.text '#2E6B33'`) | `src/theme/tokens.js:57-58` | T055 | Diff + print do selo | reversão |
| T057 | Selo **Plano Família** = **`night400` `#3E5C96`** (candidato aprovado no Portão 2; validação física de "acolhedor e infantil" fica em F-SEAL) | `src/theme/tokens.js:39-59` | T055 | Token criado/ajustado + `premium` apontando para ele | reversão |
| T058 | Selo **Concluída** = dourado (manter `done.border: color.gold500`) | `src/theme/tokens.js:60` | T055 | Diff + print | reversão |
| T059 | **Cor nunca isolada**: cada estado carrega chip/ícone/rótulo além da cor | componentes de card/selo | T056–T058 | Print em escala de cinza mostrando os 3 estados distinguíveis sem cor | reversão |
| T060 | **Roxo proibido como status** e **nenhuma paleta paralela** criada | `src/theme/tokens.js` | T056–T058 | `git grep` sem `#5B3E9C`/`#B79CE2`/`#EFE6FA` em `seal` | reversão |
| T061 | Substituir a asserção **A0.7** (`scripts/smoke.js:23597-23606`, que exige `night800` no premium) pelo gate **G-SEAL** — **preservando os testes negativos de roxo/lilás/marrom** e as asserções de Grátis verde e Concluída dourada | `scripts/smoke.js:23597-23606` | T057 | Smoke verde; diff mostrando que os testes negativos **não** foram removidos | restaurar A0.7 |
| T062 | Executar **CN-4/CN-6**: provar que recompensa, conteúdo infantil, decoração, debug e cores funcionais não-status **não** foram alteradas | — | T055–T061 | `git diff` restrito aos arquivos de status; controles registrados | N/A |

---

### 2.7 Bloco **B4** — splash, abertura e correção restrita do adaptive icon (E5.52, Emenda 1)

Alternativa **C + correção de cor de A** (Plan §8). Gates: **G-SPLASH, G-STATUS, G-ICON** ·
Controles: **CN-3, CN-8** · Físico: **F-OPEN-1/2/3, F-ICON**.

| # | Task | Arquivos candidatos | Dep. | Teste / validação / evidência esperada | Rollback |
|---|---|---|---|---|---|
| T063 | **Inspeção factual** do foreground `assets/adaptive-icon.png` (cores dominantes, área ocupada, margem de segurança) — sem editar o arquivo | `assets/adaptive-icon.png` (leitura) | T062 | Descrição factual do foreground | N/A |
| T064 | **Escolher o HEX** do `adaptiveIcon.backgroundColor` contra os 8 critérios do Portão 2 §3: não roxo · compatível com "O Livro Vivo" · **não criar token novo só para o ícone** · harmonizar com o foreground · contraste no lançador · coerente com o novo splash · dourado **não** como background principal · não confundir com o azul premium `#3E5C96`. **Não perguntar nova cor ao fundador** | — (decisão registrada) | T063 | Tabela critério × verificação, com o HEX final e sua origem no `tokens.js` existente | N/A |
| T065 | Aplicar o HEX em **`app.json:48`** (`android.adaptiveIcon.backgroundColor`), substituindo `#7C3AED` | `app.json:48` | T064 | Diff de 1 linha | reversão da linha |
| T066 | Corrigir **`app.json:14`** (`splash.backgroundColor`), substituindo `#7C3AED` | `app.json:14` | T064 | Diff de 1 linha | reversão da linha |
| T067 | Corrigir **`app.json:41`** (`androidStatusBar.backgroundColor`), substituindo `#7C3AED` | `app.json:41` | T064 | Diff de 1 linha | reversão da linha |
| T068 | **Alternativa C:** remover o portão de fonte como **estado visual independente**. Durante a espera de fonte, renderizar **fundo + mascote sem texto dependente de fonte**; após o portão, título e subtítulo entram no **fade já existente** | **`App.js:109-115`** (onde vive o estado visual do portão) **+** `src/screens/SplashScreen.js` | T064 | Diff; nenhuma tela intermediária nova; o `#FFF8F0`/`ActivityIndicator` deixa de ser uma tela distinta da splash | **reversão de `App.js` E de `SplashScreen.js`** |
| T069 | **Preservar integralmente** e provar por diff: `FONT_TIMEOUT_MS` · `isWaitingForFonts` · `fontGateDoneRef` · as marcas do portão (`font_gate_start`, `font_gate_loaded`, `font_gate_error`, `font_gate_timeout`, `providers_mounted`) · `DECISION_CEILING_MS` · `resolveBootRoute` · `canNavigate` · tolerância a erro de fonte · saída por prontidão | **`App.js`** (contratos de fonte) · `src/screens/SplashScreen.js` (contratos de rota) · **`src/services/bootRoute.js` — NÃO deve ser alterado** | T068 | `git diff` mostrando que nenhum desses símbolos foi removido nem teve semântica alterada; `git diff 015c438 -- src/services/bootRoute.js` **vazio** | reversão de `App.js` e `SplashScreen.js` |
| T070 | Criar **G-SPLASH** (nenhum `#7C3AED` em `app.json`), **G-STATUS** e **G-ICON** no smoke | `scripts/smoke.js`, `app.json` | T065–T068 | `git grep -n "7C3AED"` sem ocorrência; smoke verde | remover os checks |
| T071 | **CN-3 (reescrito pelo Portão 2 §4):** provar que a correção do background **não** alterou `assets/icon.png` nem `assets/adaptive-icon.png` (bytes idênticos a `015c438`) e **não** criou redesign de marca nem token exclusivo do ícone. Executar também **CN-8** | `assets/icon.png`, `assets/adaptive-icon.png` (leitura) | T065 | `git diff 015c438 -- assets/icon.png assets/adaptive-icon.png` **vazio** | N/A |
| T072 | **Validação física** F-OPEN-1/2/3 (abertura fria, morna, com fonte lenta) e **F-ICON** (ícone no lançador Android) | — | T070, T078 | Vídeo da abertura + print do lançador | N/A |

> **Proibições explícitas de B4, verificadas por CN-3/CN-8:** não redesenhar `assets/icon.png` · não trocar
> a marca · não adicionar `expo-splash-screen` · não criar dependência nova · não reabrir loading/performance.

> 🔴 **Verificação técnica exigida antes do runtime (Portão 3 §3) — executada, com achado.**
>
> O portão de fontes **não** vive em `SplashScreen.js`: o estado visual independente que a Alternativa C
> elimina está em **`App.js:109-115`** — um `<View backgroundColor:'#FFF8F0'>` com
> `<ActivityIndicator color='#FF8C42'/>`, renderizado enquanto `isWaitingForFonts(...)` é verdadeiro.
> `SplashScreen.js` só é montado **depois** desse portão.
>
> Os contratos congelados também se dividem entre arquivos:
> `FONT_TIMEOUT_MS` e `isWaitingForFonts` são **definidos** em `src/services/bootRoute.js:17,36` e
> **consumidos** em `App.js:29,101`; `fontGateDoneRef` e as cinco marcas do portão vivem em
> `App.js:93-106`; `DECISION_CEILING_MS` está em `SplashScreen.js:15`; `resolveBootRoute` e `canNavigate`
> são definidos em `bootRoute.js:25,56` e consumidos em `SplashScreen.js:7`.
>
> **Correção aplicada:** `App.js` passa a constar nos arquivos candidatos **e** no rollback de T068/T069.
> O rollback documental deixa de ser menor que o diff real. `src/services/bootRoute.js` é declarado
> **intocável** em B4 e isso passa a ser verificável por diff.

**Rollback do bloco B4:** alto — `App.js`, `src/screens/SplashScreen.js`, 3 linhas de `app.json` e os
checks de `scripts/smoke.js`. Nenhum asset e nenhum arquivo de contrato de boot (`bootRoute.js`) é tocado.

---

### 2.8 Bloco **B6** — P-139 / E5.52 (traço de performance)

Gate: **G-PERF** · Controles: **CN-2, CN-7** · Físico: **F-PERF**.

| # | Task | Arquivos candidatos | Dep. | Teste / validação / evidência esperada | Rollback |
|---|---|---|---|---|---|
| T073 | Adicionar **`EXPO_PUBLIC_PTF_PERF_TRACE=1`** ao bloco `env` do perfil **`preview`** | `eas.json` (perfil `preview`) | T072 | Diff de 1 linha; `preview-criador` herda por `extends` | reversão da linha |
| T074 | Confirmar que **`production` permanece sem a variável** (hoje seu `env` só tem `GLOBAL_MANIFEST_URL`) | `eas.json` (leitura) | T073 | `git diff` sem alteração no perfil `production` | N/A |
| T075 | Adicionar o script **`perf:report`** apontando para o agregador **já existente** `scripts/perf-baseline-report.js` (CLI, lê `process.argv[2]`, parseia `[PTF_PERF_SAMPLE]`). Nenhum script atual reivindica esse nome | `package.json` (scripts) | T073 | Diff de 1 linha + execução do script contra um log de exemplo | reversão da linha |
| T076 | Criar **G-PERF** no smoke; executar **CN-2** (production sem a variável) e **CN-7** (nenhuma métrica nova, nenhuma tela nova instrumentada) | `scripts/smoke.js` | T073–T075 | Smoke verde; controles registrados | remover o check |
| T077 | **Controle de escopo:** não alterar `src/services/performanceTrace.js` a menos que T073–T076 provem ser necessário; **não** coletar baseline oficial nesta fase | `src/services/performanceTrace.js` (leitura) | T076 | `git diff 015c438 -- src/services/performanceTrace.js` **vazio**, **ou** a justificativa escrita da exceção | reversão |

---

### 2.9 Bloco **B7** — varredura visual e campanha de validação física

**17 cenários físicos** do Plan §14, cobrindo **100 %** das 32 telas do inventário §1.

| # | Task | Arquivos candidatos | Dep. | Teste / validação / evidência esperada | Rollback |
|---|---|---|---|---|---|
| T078 | **Build `preview` obrigatório**, iOS **e** Android, contendo B4 + B6 + o JS final. Único ciclo obrigatório; sem build separado para P-139; sem build separado só para tablet | `eas.json` (leitura) | T077 | IDs dos 2 builds + commit de origem | N/A |
| T079 | Varredura visual das **32 telas** — **iOS telefone** | — | T078 | 32 prints, um por tela do §1 | N/A |
| T080 | Varredura visual das **32 telas** — **Android telefone** | — | T078 | 32 prints | N/A |
| T081 | Varredura visual das **32 telas** — **tablet** | — | T014, T078 | 32 prints | N/A |
| T082 | **F-A11Y-FS** — `fontScale` 1.3 nas telas listadas em T039 | — | T079–T081 | Prints com a fonte ampliada | N/A |
| T083 | **F-A11Y-TB** — TalkBack (Android) | — | T079–T081 | Vídeo do percurso | N/A |
| T084 | **F-A11Y-VO** — VoiceOver (iOS) | — | T079–T081 | Vídeo do percurso | N/A |
| T085 | **F-A11Y-TG** — targets de toque | — | T079–T081 | Medições dos elementos corrigidos em T047 | N/A |
| T086 | **F-MOTION-ON / F-MOTION-OFF** (consolida T054 no build `preview`) | — | T079–T081 | Vídeo nas 2 condições | N/A |
| T087 | **F-TAB-600, F-TAB-NAV, F-TAB-BACK, F-TAB-SIDE, F-TAB-C60** (consolida T038 no build `preview`) | — | T081 | 5 roteiros com evidência | N/A |
| T088 | **F-SEAL** — três estados de selo + **validação física do azul `#3E5C96`** ("acolhedor e infantil"), diferida do Portão 2 para cá | — | T079–T081 | Prints dos 3 estados + veredito do fundador sobre o azul | reverter T057 se reprovado |
| T089 | **F-OPEN-1/2/3 + F-ICON** — abertura e ícone no lançador | — | T078 | Vídeo + print do lançador | N/A |
| T090 | **F-PERF** — P-139/E5.52. **UMA execução real** num binário **`preview` não-DEV** (uma plataforma basta — ver correção §2 do Portão 3), provando: `isPerformanceTraceEnabled()` ativo · coletor alcançável · artefato/log local produzido · `production` sem a flag. **Mais** a verificação de que loading e performance **não regrediram** (sem reabrir o assunto) | — | T078 | Amostras `[PTF_PERF_SAMPLE]` + relatório do `perf:report` + a plataforma usada, declarada | N/A |
| T091 | Fechamento: **`npm run smoke` verde** e **`npx expo-doctor` verde**; conferir 100 % de cobertura do inventário §1; relatório final em PT-BR | — | T079–T090 | Saídas completas + matriz tela × plataforma sem lacuna | N/A |

---

## 3. Dependências, ordem e caminho crítico

### 3.1 Grafo macro (imposto pelo fundador — não reordenado)

```
PRE-0 ──> B1 ──> B3 ──> B2 ──> B2′ ──> B5 ──> B4 ──> B6 ──> B7
```

- **PRE-0 → B1:** B1 não começa antes do veredito V0 (T015). Se V0 exigir novo development build, ele
  é gerado **antes** de B1.
- **B1 → B3:** B3 depende do breakpoint único (T019) — corrigir navegação antes de unificar o breakpoint
  reintroduziria o defeito na banda 600–767.
- **B3 → B2:** a acessibilidade semântica é medida sobre o shell final; medi-la antes obrigaria refazê-la.
- **B2 → B2′:** o hook de reduce motion consome as primitivas já corrigidas em B2.
- **B5 → B4:** o HEX do adaptive icon (T064) precisa **não confundir com o azul premium** já fixado em T057.
- **B4 → B6:** ambos entram no mesmo e único build `preview`.
- **B6 → B7:** B7 valida o binário que contém B4 + B6.

### 3.2 Caminho crítico

`T001 → T002 → T005 → T015 → T017 → T019 → T027 → T030 → T038 → T049 → T057 → T064 → T068 → T073 → T078 → T091`

O gargalo **não** é código: é **T014 (tablet disponível)**, que trava T038 e T081, e **T078 (build preview)**,
que trava toda a campanha física.

### 3.3 Gates automáticos por bloco

| Bloco | Gates |
|---|---|
| PRE-0 | — (baseline de smoke/expo-doctor em T003/T004) |
| B1 | G-BP-1, G-BP-2, G-SAFE |
| B3 | G-NAV-1, G-NAV-2 |
| B2 | G-A11Y-1, G-A11Y-2 |
| B2′ | G-MOTION |
| B5 | G-SEAL (substitui A0.7) |
| B4 | G-SPLASH, G-STATUS, G-ICON |
| B6 | G-PERF |
| B7 | smoke integral + expo-doctor (T091) |

### 3.4 Controles negativos por bloco

| Bloco | Controle | O que prova |
|---|---|---|
| B1 | **CN-1** | O breakpoint 600 não quebrou telefones grandes na banda 600–767 |
| B2′ | **CN-5** | O háptico **continua ativo** para quem não pediu movimento reduzido |
| B5 | **CN-4, CN-6** | Recompensa, conteúdo infantil, decoração, debug e cores funcionais não-status ficaram intactos |
| B4 | **CN-3** (reescrito) | A correção do background **não** alterou `assets/icon.png` nem criou redesign de marca |
| B4 | **CN-8** | Nenhuma dependência nova; `expo-splash-screen` não foi adicionado |
| B6 | **CN-2** | `production` **não** recebeu `EXPO_PUBLIC_PTF_PERF_TRACE` |
| B6 | **CN-7** | Nenhuma métrica nova; nenhuma tela nova instrumentada |

### 3.5 Validações físicas por bloco

| Bloco | Cenários | Dispositivo |
|---|---|---|
| B1 | CN-1, banda 600–767 | telefone grande / tablet pequeno |
| B3 | F-TAB-600, F-TAB-NAV, F-TAB-BACK, F-TAB-SIDE, F-TAB-C60 | **tablet obrigatório** |
| B2 | F-A11Y-TB, F-A11Y-VO, F-A11Y-FS, F-A11Y-TG | iOS + Android |
| B2′ | F-MOTION-ON, F-MOTION-OFF | iOS + Android |
| B5 | F-SEAL (inclui o veredito do azul) | iOS + Android + tablet |
| B4 | F-OPEN-1, F-OPEN-2, F-OPEN-3, F-ICON | iOS + Android |
| B6 | F-PERF | **um binário `preview` não-DEV — uma plataforma basta** |
| B7 | consolidação dos 17 + varredura das 32 telas | os três |

**Total: 17 cenários** — exatamente os do Plan §14, sem acréscimo nem supressão.

> 🔵 **Correção operacional aplicada antes do runtime (Portão 3 §2) — P-139 não duplica plataforma.**
>
> P-139 é classificado **NEF** e o Plan elegeu `preview` como fonte primária de evidência. A matriz física
> anterior pedia F-PERF em **iOS e Android**, o que era **redundância**, não cobertura: a flag
> `EXPO_PUBLIC_PTF_PERF_TRACE=1` e o caminho do coletor são **JavaScript**, idênticos nas duas plataformas.
>
> **iOS e Android continuam obrigatórios para a Fase 6** — por splash (F-OPEN-*), acessibilidade
> (F-A11Y-*) e pela campanha B7 (T079/T080). O que deixa de existir é **apenas** a execução duplicada
> *especificamente para provar P-139*. O total de cenários permanece **17**.

---

## 4. Analyze (Etapa SDD 6) — consistência spec ↔ plan ↔ tasks

### 4.1 Cobertura dos requisitos

| Origem | Item | Onde é atendido | Situação |
|---|---|---|---|
| Matriz §14 | **P-20** tipografia/fontScale | T039, T082 | ✅ coberto |
| Matriz §14 | **P-27** hierarquia de rotas | T027–T035 | ✅ coberto |
| Matriz §14 | **P-28** acessibilidade semântica | T040–T048 | ⚠️ coberto **na parcela da Fase 6**; resíduo das Fases 10/12B declarado em T048 |
| Matriz §14 | **P-29** `AppScreen` sem consumidor | T017, T020–T023 | ✅ coberto (resolvido **por consumo**, não por remoção) |
| Matriz §14 | **P-30** breakpoint duplicado | T018, T019 | ✅ coberto |
| Matriz §14 | **P-31** navegações inefetivas | T030, T031 | ✅ coberto — **11**, resolvido por evidência |
| Matriz §14 | **P-47** `route` fabricado | T029 | ✅ coberto |
| Matriz §14 | **P-104** háptico × reduce motion | T049–T054 | ✅ coberto — escopo **9 arquivos** |
| Matriz §14 | **P-139** traço de performance | T073–T076, T090 | ✅ coberto |
| Spec | **E5.52** (herança) | T073–T077, T090 | ✅ coberto |
| Spec | **R21** (parcela da Fase 6) | T055–T062 (sistema visual de status) | ✅ coberto na parcela; o resto de R21 **não** é da Fase 6 |
| Spec | **D-SELOS-ESTADO-V2** | T055–T062 | ✅ coberto |
| Portão 2 §2 | **Adaptive icon** (Emenda 1) | T063–T065, T071, T072 | ✅ coberto, com escopo restrito preservado |
| Portão 2 §5 | **Divergência P-31 10×11** (Emenda 2) | Plan §6.2.3 + T030 | ✅ **resolvida por evidência** — ver §4.3 |
| Portão 2 §6 | **Azul premium `#3E5C96`** | T057 (implementação) + T088 (validação física) | ✅ coberto |

**Requisito sem task:** nenhum. **Task sem requisito:** nenhuma — todas as 91 tasks apontam para um P,
para E5.52/R21/D-SELOS-ESTADO-V2, para um gate/controle, ou para uma exigência literal do Portão 2.

### 4.2 Conflitos verificados

| # | Verificação | Resultado |
|---|---|---|
| A1 | Ordem dos blocos = a imposta no Portão 2 §9 | ✅ PRE-0·B1·B3·B2·B2′·B5·B4·B6·B7, sem reordenação |
| A2 | Alguma task antecipa **P-127**? | ✅ Não. Nenhuma task toca P-127 |
| A3 | Alguma task **reabre loading/performance**? | ✅ Não. T077 e T090 delimitam explicitamente: B6 liga uma variável e adiciona um script; **não** coleta baseline nem instrumenta telas novas |
| A4 | Alguma task implementa código nesta rodada? | ✅ Não. Nenhuma foi executada |
| A5 | Dependência circular | ✅ Nenhuma — o grafo §3.1 é linear entre blocos e acíclico dentro deles |
| A6 | Arquivo fora do escopo declarado no Plan | ✅ Nenhum. `assets/` só aparece em **leitura** (T063) e em **controle negativo** (T071) |
| A7 | Área protegida tocada sem instrução direta | ✅ Nenhuma. Paywall, progresso, conquistas, `accessControl`, manifestos e histórias não aparecem em nenhuma task |
| A8 | Dependência nova | ✅ Nenhuma. T049 usa só APIs existentes; CN-8 prova a ausência de `expo-splash-screen` |
| A9 | Build redundante | ✅ Um único ciclo `preview` obrigatório (T078); o `development` é **condicional** ao veredito V0 (T015) |
| A10 | Validação física esquecida | ✅ Os 17 cenários do Plan §14 aparecem em §3.5, um a um |
| A11 | Rollback ausente | ✅ Toda task que **escreve** tem rollback; tasks de leitura/verificação declaram `N/A` |
| A12 | Critério não verificável | ✅ Todo critério fecha em diff, `git grep`, saída de smoke, print ou vídeo |
| A13 | Duplicação entre tasks | ⚠️ T038↔T087 e T054↔T086 são **intencionalmente** repetidas: a primeira fecha o bloco no Dev Client; a segunda revalida no binário `preview`. Declarado, não acidental |
| A14 | Contagem de telas fecha | ✅ 32 + 10 = 42, com árbitro por linha |
| A15 | Gate A0.7 substituído sem perder cobertura | ✅ T061 exige preservar os testes negativos de roxo/lilás/marrom e as asserções de Grátis/Concluída |

### 4.3 Investigação documental exigida pela Emenda 2 (divergência 10 × 11)

Exigida pelo Portão 2 §5 e §12 como **tarefa de Analyze**, não como remendo de implementação.
Executada e registrada integralmente no **Plan §6.2.3**. Síntese:

| Fonte | Contagem |
|---|---|
| Matriz §14, linha P-31 | 8 aninhadas + 3 nomes de aba = **11** |
| Recontagem da Etapa 4 (Plan) | 7 + 3 = **10** |
| **Veredito por evidência** | **11 — a matriz está correta; a auditoria da Fase 6 subcontou** |

- A ocorrência faltante é **`src/navigation/monteACenaExit.js:38`**.
- Ela **existia** no commit em que a linha P-31 nasceu (`c293cea`, 2026-08-05, E015) e **continua existindo**
  no HEAD: `git grep -nE "\{ *screen:" -- src` retorna as **mesmas 8** ocorrências nos dois pontos.
- **Nenhuma oitava chamada desapareceu** em commit algum. `HEAD:src` ≡ `015c438:src` (árvore `3d7c07d`).
- **Causa declarada da divergência:** a varredura da Etapa 4 procurou o literal `navigation.navigate(` e não
  alcançou o despacho **indireto** via `navigation.dispatch` + `StackActions.popTo`/`CommonActions.navigate`
  usado por `monteACenaExit.js`.
- **Nenhuma ocorrência foi inventada** para fechar a conta. **Nenhuma correção é necessária na matriz.**
- O critério funcional **não** foi reduzido a "10" nem a "11": permanece **ZERO NAVEGAÇÕES INEFETIVAS
  NO ESCOPO**, verificado uma a uma em T030.

### 4.4 Inconsistências encontradas neste Analyze e para onde voltaram

Conforme o Portão 2 §22 — defeito na Spec volta à Spec, no Plan volta ao Plan, nas Tasks corrige as Tasks.

| # | Defeito | Artefato | Correção aplicada |
|---|---|---|---|
| D1 | Plan contava **7** navegações com payload aninhado | **Plan** §6.2.2, §6.2.4, §7, §14, §17.1, §19 | Corrigido para **8** (total 11); ocorrência faltante nomeada |
| D2 | Plan afirmava **12** consumidores de `expo-haptics` | **Plan** §6.4 | Corrigido para **11**: `BotaoPrimario.js` casava apenas com um **comentário na linha 14**, não com um import |
| D3 | Plan afirmava **1** consumidor de `isReduceMotionEnabled` | **Plan** §6.4 | Corrigido para **10** — a varredura partira do conjunto de hápticos |
| D4 | Plan dava a identificação nominal 3+2 do P-104 como "não recuperável" | **Plan** §6.4.1 (nova) | **Recuperada**: Grupo A=3, B=6, C=2, D=2; escopo de B2′ = **9 arquivos**, não 5. O "três" da matriz confere; o "duas" era subcontagem |
| D5 | Spec repetia a subcontagem "duas leem sem aplicar" | **Spec** linha 59 | Reescrita com a recontagem auditada e a divergência declarada |
| D6 | Plan §15.2 listava **17** rotas dev-gated, com árbitro errado (`routes.js`) | **Plan** §15.2 | Corrigido: árbitro é `AppNavigator.js`; **10** rotas gated; **7** telas user-facing devolvidas ao inventário. Sem essa correção, S3 ("100 % de cobertura") ficaria falsamente satisfeita |
| D7 | Plan tratava E2/E3 como exclusões de **tela** | **Plan** §15.2 | Redefinidas como exclusões de **parcela** — E1 é a única que exclui tela. Contradizia §6.3.2 |
| D8 | Plan dizia "5 telas **nominadas pela matriz**" para P-29 | **Plan** §6.1.2 | A matriz diz "5 telas" e **não nomeia nenhuma**. Substituído por critério verificável de 3 condições; a lista fechada é produzida em **T017** |
| D9 | **G-SAFE** exigia que *nenhuma tela do inventário* chamasse `useSafeAreaInsets` — 41 telas o fazem | **Plan** §10.2 e §6.1.2 | Escopo corrigido para a **lista fechada de T017**. Como estava, o gate contradizia §9 (não migrar os 75 consumidores de `productTheme`) e o "Rollback: Baixo" de §11 |

Todas as correções são **documentais**. **Nenhum arquivo de runtime foi alterado** para acomodá-las.

### 4.5 Segunda passagem do Analyze (exigida pelo §22)

Rodada após D1–D9, sobre os artefatos já corrigidos:

| Verificação | Resultado |
|---|---|
| Spec ↔ Plan: contagem de navegações | ✅ ambos dizem **11** |
| Spec ↔ Plan: escopo do P-104 | ✅ ambos dizem **9 arquivos** (3+6), com o "três" da matriz confirmado |
| Plan ↔ Tasks: inventário de telas | ✅ Plan §15.2 diz 10 excluídas; Tasks §1 lista as 10 nominalmente e fecha em 42 |
| Plan ↔ Tasks: G-SAFE | ✅ Plan §10.2 aponta para T017; T025 verifica exatamente essa lista |
| Plan ↔ Tasks: 17 cenários físicos | ✅ §3.5 reproduz os 17, sem acréscimo nem supressão |
| Plan ↔ Tasks: gates e controles negativos | ✅ 13 gates e 8 controles do Plan §10.2/§10.3 aparecem em §3.3/§3.4 |
| Plan ↔ Tasks: estratégia de builds | ✅ 1 `preview` obrigatório + `development` condicional a V0 |
| Emenda 1 (adaptive icon) | ✅ escopo restrito preservado: só o background configurável; CN-3 protege o asset |
| Emenda 2 (P-31) | ✅ resolvida por evidência, com a causa da divergência declarada |
| Resíduo P-28 | ✅ declarado em T048; **não** marcado como totalmente resolvido |
| P-127 | ✅ não antecipado |
| Loading/performance | ✅ não reaberto |
| Runtime | ✅ intocado |

**Nenhuma inconsistência material sobreviveu à segunda passagem.**

### 4.6 Risco residual aceito

| # | Risco | Por que é aceitável |
|---|---|---|
| RR-1 | 4 dos 9 arquivos de B2′ são **dev-gated** e não terão validação física em build de produção | São corrigidos no código; a ausência de validação física é **declarada**, não convertida em prova de conformidade |
| RR-2 | O azul `#3E5C96` só é validado como "acolhedor e infantil" em **T088**, depois de implementado | Decisão explícita do Portão 2 §6; o rollback de T057 é de uma linha |
| RR-3 | O HEX do background do adaptive icon só se fecha em **T064**, durante a implementação | Autorizado literalmente pelo Portão 2 §3 ("a escolha exata pode ser concluída durante implementação B4 após inspeção factual do foreground") |
| RR-4 | **T014 (tablet)** é dependência operacional externa e pode travar B3 | Tratada como bloqueio explícito, não como risco silenciosamente aprovado |
| RR-5 | Estado dos builds existentes é **NÃO RECUPERADO** até T005 consultar o histórico remoto do EAS | Nenhuma decisão desta rodada depende dessa informação; ela é pré-requisito de T015, não de Tasks/Analyze |

### 4.7 Pontos não determináveis estaticamente

Declarados como tais, sem serem convertidos em afirmação:

- Quantas das 32 telas quebram sob `fontScale` 1.3 — **NÃO DETERMINADO SEM EXECUÇÃO FÍSICA** (T039).
- Se o React Navigation resolve o botão voltar do Android no tablet sem handler manual — **NÃO
  DETERMINADO SEM EXECUÇÃO FÍSICA** (T033).
- Se `#3E5C96` é percebido como acolhedor e infantil — **NÃO DETERMINADO SEM EXECUÇÃO FÍSICA** (T088).
- Quais builds existem no EAS e se ainda são instaláveis — **NÃO RECUPERADO** até T005/T011/T012.

---

**Veredito da análise:** Spec, Plan e Tasks estão **consistentes entre si** após as correções D1–D9. A
cobertura dos nove P, de E5.52, da parcela de R21 e de D-SELOS-ESTADO-V2 é integral; as duas emendas
vinculantes do Portão Humano 2 estão aplicadas e rastreáveis; a ordem macro dos blocos é a imposta pelo
fundador; nenhuma task antecipa P-127, reabre loading/performance, toca área protegida ou introduz
dependência. **Nenhuma inconsistência material remanescente.** Recomenda-se levar a feature ao
**🚦 Portão Humano 3**.
