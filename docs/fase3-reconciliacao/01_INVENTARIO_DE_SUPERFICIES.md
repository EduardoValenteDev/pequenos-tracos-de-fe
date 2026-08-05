# 01 · Inventário de Superfícies

> **Artefato 1 de 11 — E015 · Fase 3G · Reconciliação**

| Campo | Valor |
|---|---|
| **Estado** | **PRELIMINAR PARA PRODUCT LOCK** |
| **Base auditada** | E009 a E014 |
| **Branch** | `integrate/colorir-canonical-runtime` |
| **HEAD** | `015c438106538595b592981fbe1b80b1d5d65e55` |
| **Data** | 5 de agosto de 2026 |

---

## 0 · Declaração de natureza

**Este artefato não implementa funcionalidade.** É um inventário documental derivado de leitura
estática do HEAD canônico. Não cria rota, não altera navegação, não corrige defeito e não congela
decisão de Product Lock.

---

## 1 · Fontes técnicas principais

| Fonte | Papel |
|---|---|
| `src/navigation/AppNavigator.js` (547 linhas) | Registro real de abas e rotas — **autoridade** sobre qualquer comentário |
| `src/constants/routes.js` | Mapa `ROUTES` congelado (identidades de rota) |
| `src/screens/**` | Implementação de cada superfície |
| `src/config/internalTools.js`, `src/config/featureFlags.js` | Gates de registro condicional |
| `src/services/accessControl.js` | Autorização de plano |
| Auditorias E009 a E014 | Achados de superfície, guias, overlays e gates |

---

## 2 · Classificação de evidência

Toda linha deste inventário carrega uma das classificações abaixo. **Nenhuma foi convertida em outra.**

`COMPROVADO PELO CÓDIGO` · `COMPROVADO PELO ARQUIVO` · `COMPROVADO PELO DOCUMENTO` ·
`COMPROVADO FISICAMENTE` · `INFERÊNCIA` · `NÃO DETERMINADO` · `PLANEJADO, MAS NÃO IMPLEMENTADO` ·
`IMPLEMENTADO, MAS SEM CONSUMIDOR` · `LEGADO` · `PROVISÓRIO` · `INTERNO`

### Estados de superfície

| Estado | Significado |
|---|---|
| **ATIVA** | Registrada sem gate, alcançável por entrada de usuário, com implementação completa |
| **PARCIAL** | Registrada e alcançável, mas com escopo restrito (piloto, subconjunto de conteúdo) |
| **PROVISÓRIA** | Registrada e funcional, declarada explicitamente como transitória/fallback |
| **INTERNA** | Registrada **somente** sob gate de ferramentas internas — não existe em produção |
| **LEGADA** | Mantida por compatibilidade; não é o caminho canônico |
| **SEM CONSUMIDOR** | Existe no código e nenhuma entrada navega até ela |
| **PLANEJADA** | Especificada em documento, sem implementação |

---

## 3 · Correções metodológicas herdadas de E014

Este artefato incorpora as correções obrigatórias de formulação:

1. **Rede.** Não se afirma que "todas as chamadas de rede são GET". A formulação correta é:
   *existem três pontos explícitos de `fetch` para manifestos e mídia e uma integração externa com o
   SDK RevenueCat; o método HTTP interno do SDK não é determinado pelo código do aplicativo.*
2. **Dados infantis.** Não se afirma que "nenhum dado da criança sai do aparelho". A formulação
   correta é: *não existe upload explícito de conteúdo infantil no código do aplicativo; a integração
   RevenueCat existe e seu envelope técnico de dados precisa de auditoria jurídica e técnica nas
   Fases 5, 18 e 19.*
3. **Offline premium.** Nenhuma superfície de história premium é declarada "acessível offline" sem
   qualificar entitlement. Mídia local, autorização, cache válido e pack instalado são **quatro
   eixos distintos** e aparecem separados nas colunas `Offline (mídia)` e `Offline (autorizado)`.

---

## 4 · Correção de leitura registrada nesta rodada

`src/constants/routes.js` declara, em comentário, que `CADE_A_OVELHINHA` está *"registrada SÓ sob o
gate interno … em produção ela não existe"* e que `PALAVRINHAS_DO_BENI` está *"registrada SÓ sob o
gate interno"*. **Ambos os comentários estão desatualizados.**
`src/navigation/AppNavigator.js:417-425` e `:435-442` registram as duas rotas **incondicionalmente**
e afirmam o contrário (*"rota SEMPRE registrada"*, citando `D-OVELHINHA-UF1` e `D-PALAVRINHAS-UF1`).
**O registro real do navegador é a autoridade.** — `COMPROVADO PELO CÓDIGO`
Divergência documental encaminhada à matriz de riscos (artefato 09): levantada por E015 como
`E015-N02` e reconciliada como **`DUPLICADO DE P-73`** — o código canônico é **`P-73`** (E013,
`LEGADA`), que registra exatamente estes comentários. **Nenhum código novo foi criado.**

---

## 5 · Abas (5)

O `name` da aba é **identidade de rota**; o rótulo visível pode divergir. — `COMPROVADO PELO CÓDIGO`
(`AppNavigator.js:126-136`)

| Identidade técnica | Nome visível | Componente | Observação |
|---|---|---|---|
| `Início` | Início | `HomeScreen` | — |
| `Aventuras` | Aventuras | `AdventureMapScreen` | Mapa vertical (M1); `StoriesScreen` virou fallback de stack |
| **`Ateliê`** | **Brincar** | `BrincarScreen` | `name` mantido de propósito: o Onboarding navega por ele e renomear quebraria a navegação (`:130-132`) |
| `Estrelinhas` | Estrelinhas | `TrophiesScreen` | Mesmo componente também atende a rota de stack `EstrelinhasCena` |
| `Perfil` | Perfil | `ProfileScreen` | — |

---

## 6 · Inventário — Tabela A (identidade, rota, fluxo, público)

Campos 1 a 8 dos dezoito exigidos.

| # | Identidade técnica | Nome visível | Arquivo principal | Rota | Entradas | Saídas | Público | Plano |
|--:|---|---|---|---|---|---|---|---|
| 1 | `Splash` | — | `SplashScreen.js` | `Splash` | boot do app | Onboarding ou Home | criança/adulto | livre |
| 2 | `Onboarding` | Onboarding | `OnboardingScreen.js` | `Onboarding` | 1º boot | Home / aba `Ateliê` | adulto+criança | livre |
| 3 | `Home` | Início | `HomeScreen.js` | aba `Início` | boot, 24 `navigate('Home')` | StoryDetail, abas | criança | livre |
| 4 | `Aventuras` | Aventuras | `AdventureMapScreen.js` | aba `Aventuras` | tab bar, deep-link de Cultinho e Livrinho | StoryDetail, Visão Geral | criança | livre |
| 5 | Visão Geral do Mapa | Ver a região | `AdventureMapScreen.js` + `StoryFocusModal.js` | overlay em `Aventuras` | card do tour, botão da região | fecha para o mapa | criança | livre |
| 6 | `Stories` | Histórias | `StoriesScreen.js` | `Stories` (stack) | **nenhuma entrada localizada** | StoryDetail | criança | livre |
| 7 | `StoryDetail` | Detalhe da História | `StoryDetailScreen.js` | `StoryDetail` | 13 `navigate` | Narração, Livrinho, Quiz, Reflexão, download | criança+adulto | free/premium |
| 8 | `Narration` | Narração | `NarrationScreen.js` | `Narration` | StoryDetail (portão de conteúdo) | Congrats | criança | **portão real** |
| 9 | `Congrats` | Parabéns | `CongratsScreen.js` | `Congrats` | fim da narração | PostStoryHub, Home | criança | segue a história |
| 10 | `PostStoryHub` | Depois da história | `PostStoryHubScreen.js` | `PostStoryHub` | Congrats | Quiz, Reflexão, Colorir, Livrinho | criança | segue a história |
| 11 | `Quiz` | Quiz | `QuizScreen.js` | `Quiz` | 3 `navigate` | Reflexão, Hub | criança | consulta liberada |
| 12 | `Reflection` | Reflexão | `ReflectionScreen.js` | `Reflection` | 3 `navigate` | Hub, Home | criança+adulto | consulta liberada |
| 13 | `StoryBook` | Meu Livro | `StoryBookScreen.js` | `StoryBook` | 2 `navigate` | Aventuras | criança | consulta liberada |
| 14 | `Coloring` | Colorir com o Beni | `ColoringScreen.js` | `Coloring` | 4 `navigate` | Coleção, Prévia | criança | revalida por dentro |
| 15 | `Coloring60Collection` | Coleção | `Coloring60CollectionScreen.js` | `Coloring60Collection` | Colorir, conclusão | Prévia, Colorir | criança | revalida por dentro |
| 16 | `Coloring60ArtPreview` | Prévia da obra | `Coloring60ArtPreviewScreen.js` | `Coloring60ArtPreview` | Coleção | Colorir (reedição) | criança | revalida por dentro |
| 17 | `FamilyWorship` | Cultinho em Casa | `CultinhoEmCasaScreen.js` | `FamilyWorship` | 1 `navigate` | Criar Livre, Estrelinhas, Aventuras | família | livre |
| 18 | `LumiMoment` | Meu Momento | `LumiMomentScreen.js` | `LumiMoment` | 1 `navigate` | Home | criança | livre |
| 19 | `Ateliê` | **Brincar** | `BrincarScreen.js` | aba `Ateliê` | tab bar, Onboarding | 5 jogos, Criar Livre, Minhas Artes | criança | livre |
| 20 | `ParesDoBeni` | Pares do Beni | `ParesDoBeniScreen.js` | `ParesDoBeni` | grade do Brincar | Brincar | criança | livre |
| 21 | `PalavrinhasDoBeni` | Palavrinhas do Beni | `PalavrinhasDoBeniScreen.js` | `PalavrinhasDoBeni` | grade do Brincar (`:166-172`) | Brincar | criança | livre |
| 22 | `CadeAOvelhinha` | Cadê a Ovelhinha? | `CadeAOvelhinhaScreen.js` | `CadeAOvelhinha` | grade do Brincar | Brincar | criança | livre |
| 23 | `MonteACenaHome` | Monte a Cena | `MonteACenaHomeScreen.js` | `MonteACenaHome` | grade do Brincar | Story | criança | livre |
| 24 | `MonteACenaStory` | Escolher história | `MonteACenaStoryScreen.js` | `MonteACenaStory` | MonteACenaHome | Difficulty | criança | livre |
| 25 | `MonteACenaDifficulty` | Dificuldade | `MonteACenaDifficultyScreen.js` | `MonteACenaDifficulty` | MonteACenaStory | TableGame | criança | livre |
| 26 | `MonteACenaTableGame` | Rodada | `MonteACenaTableGameScreen.js` | `MonteACenaTableGame` | Difficulty | Gallery | criança | livre |
| 27 | `MonteACenaGallery` | Meus Quadros | `MonteACenaGalleryScreen.js` | `MonteACenaGallery` | TableGame, Home | Brincar | criança | **gate gentil por dentro** |
| 28 | `AtelierCanvas` | Criar Livre | `AtelierCanvasScreen.js` | `AtelierCanvas` | 5 `navigate` (Brincar, Cultinho) | Minhas Artes | criança | livre |
| 29 | `AtelierGallery` | Minhas Artes | `AtelierGalleryScreen.js` | `AtelierGallery` | Brincar (`:318`) | Criar Livre | criança | livre |
| 30 | `Estrelinhas` | Estrelinhas | `TrophiesScreen.js` | aba `Estrelinhas` | tab bar, Cultinho | Baú | criança | livre |
| 31 | `EstrelinhasCena` | Estrelinhas (cena) | `TrophiesScreen.js` | `EstrelinhasCena` (stack) | 1 `navigate` | volta | criança | livre |
| 32 | `BeniChest` | Baú do Beni | `BeniChestScreen.js` | `BeniChest` | 2 `navigate` | volta | criança | livre |
| 33 | `Perfil` | Perfil | `ProfileScreen.js` | aba `Perfil` | tab bar | Área dos Pais | criança+adulto | livre |
| 34 | `ParentArea` | Área dos Pais | `ParentAreaScreen.js` | `ParentArea` | 10 `navigate` | Modo Igreja, ferramentas | **adulto** | portão parental |
| 35 | Modo Igreja | Modo Igreja | `ParentAreaScreen.js:1273-1404` | bloco interno, **sem rota** | Área dos Pais + `SHOW_CHURCH_MODE` | volta | adulto | independe de plano |
| 36 | Download de pack | Baixar história | `useStoryPackDownload.js` + `PacksContext.js` | fluxo, **sem rota** | StoryDetail | StoryDetail | criança+adulto | exige entitlement |
| 37 | Recovery de pack | — | `packDownloadService.js` | fluxo, **sem rota** | falha de download/verify | retry, best-effort | sistema | — |
| 38 | `Coloring60Lab` | Bancada C60 | `Coloring60LabScreen.js` | `Coloring60Lab` | Administração (dev) | volta | **interno** | — |
| 39 | `SceneValidation` | Validação de cenas | `SceneValidationScreen.js` | `SceneValidation` | Administração (dev) | volta | **interno** | — |
| 40 | `OvelhaAssetGallery` | Asset Gallery | `OvelhaAssetGalleryScreen.js` | `OvelhaAssetGallery` | dentro da Ovelhinha | volta | **interno** | — |
| 41 | `PackSandboxDev` | Sandbox de packs | `PackSandboxDevScreen.js` | `PackSandboxDev` | Administração (dev) | volta | **interno** | — |
| 42 | `MonteACenaSpike` | Spike M1A | `MonteACenaSpikeScreen.js` | `MonteACenaSpike` | **nenhuma** | — | **interno** | — |
| 43 | `MonteACenaPrototype` | Protótipo M1R1 | `MonteACenaPrototypeScreen.js` | `MonteACenaPrototype` | **nenhuma** | — | **interno** | — |
| 44 | `MonteACenaLevels` | Seleção de níveis | `MonteACenaLevelSelectScreen.js` | `MonteACenaLevels` | **nenhuma** | MonteACenaGame | **interno** | — |
| 45 | `MonteACenaGame` | Rodada M1R2 | `MonteACenaGameScreen.js` | `MonteACenaGame` | MonteACenaLevels | — | **interno** | — |
| 46 | `MonteACenaGameV2` | Rodada V2 | `MonteACenaGameV2Screen.js` | `MonteACenaGameV2` | **nenhuma** | — | **interno** | — |
| 47 | `PuzzleGestureLab` | Lab de gestos | `PuzzleGestureLabScreen.js` | `PuzzleGestureLab` | **nenhuma** | — | **interno** | — |

---

## 7 · Inventário — Tabela B (dispositivo, offline, storage, mídia, guia, overlay, estado, fase, evidência)

Campos 9 a 18 dos dezoito exigidos. **`Offline (mídia)` e `Offline (aut.)` são eixos separados por
determinação de E014**: mídia presente no aparelho nunca é, por si, autorização de acesso.

| # | Superfície | Telefone | Tablet | Offline (mídia) | Offline (aut.) | Storage | Mídia | Guia | Overlay | Estado | Fase proprietária | Evidência |
|--:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Splash | sim | `NÃO DETERMINADO` | total | n/a | — | mascote | — | — | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 2 | Onboarding | sim | `NÃO DETERMINADO` | total | n/a | perfil, flags | mascote, avatares | próprio | onboarding | **ATIVA** | 7 | `COMPROVADO PELO CÓDIGO` |
| 3 | Home | sim | `NÃO DETERMINADO` | total | n/a | progresso | capas, mascote | `HOME_GUIDE` | guia | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 4 | Aventuras | sim | `NÃO DETERMINADO` | total | n/a | progresso | mapas, capas | `ADVENTURES_GUIDE`¹ | guia + tour | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 5 | Visão Geral do Mapa | sim | `NÃO DETERMINADO` | total | n/a | — | mapas | — | **Modal sobre o card** | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 6 | Stories (fallback) | sim | `NÃO DETERMINADO` | total | n/a | progresso | capas | — | — | **PROVISÓRIA / SEM CONSUMIDOR** | 3 | `COMPROVADO PELO CÓDIGO` |
| 7 | StoryDetail | sim | `NÃO DETERMINADO` | total | depende | progresso, packs | capa | — | gate comercial, download | **ATIVA** | 3/4 | `COMPROVADO PELO CÓDIGO` |
| 8 | Narração | sim | `NÃO DETERMINADO` | mídia local presente | **exige entitlement** | progresso | cenas + áudio | — | — | **ATIVA** | 3/4 | `COMPROVADO PELO CÓDIGO` |
| 9 | Congrats | sim | `NÃO DETERMINADO` | total | segue a história | progresso, conquistas | mascote | — | conquista, presente | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 10 | PostStoryHub | sim | `NÃO DETERMINADO` | total | segue a história | progresso | mascote | — | — | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 11 | Quiz | sim | `NÃO DETERMINADO` | total | consulta liberada | progresso | cenas | — | — | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 12 | Reflexão | sim | `NÃO DETERMINADO` | total | consulta liberada | progresso | cenas | — | — | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 13 | Meu Livro | sim | `NÃO DETERMINADO` | mídia local presente | consulta liberada | progresso | cenas + áudio | — | — | **ATIVA** | 3/4 | `COMPROVADO PELO CÓDIGO` |
| 14 | Colorir com o Beni | sim | `NÃO DETERMINADO` | total | piloto | `@ptf_c60_*` | 3 linearts | — | conclusão, nome | **PARCIAL** (só `creation`) | 3/4 | `COMPROVADO PELO CÓDIGO` |
| 15 | Coleção | sim | `NÃO DETERMINADO` | total | piloto | `@ptf_c60_*` | linearts, mascote | — | — | **PARCIAL** | 3/4 | `COMPROVADO PELO CÓDIGO` |
| 16 | Prévia da obra | sim | `NÃO DETERMINADO` | total | piloto | `@ptf_c60_*` | blob local | — | — | **PARCIAL** | 3/4 | `COMPROVADO PELO CÓDIGO` |
| 17 | Cultinho | sim | `NÃO DETERMINADO` | total | livre | progresso | mascote | — | — | **ATIVA** | 3/5 | `COMPROVADO PELO CÓDIGO` |
| 18 | Meu Momento | sim | `NÃO DETERMINADO` | total | livre | progresso | mascote | — | — | **ATIVA** | 3/4 | `COMPROVADO PELO CÓDIGO` |
| 19 | Brincar | sim | `NÃO DETERMINADO` | total | livre | stats | mascote | **ausente**² | — | **ATIVA** | 7/12A | `COMPROVADO PELO CÓDIGO` |
| 20 | Pares do Beni | sim | `NÃO DETERMINADO` | total | livre | stats | **reusa 20 capas** | — | pausa | **ATIVA** | 12A | `COMPROVADO PELO CÓDIGO` |
| 21 | Palavrinhas | sim | `NÃO DETERMINADO` | total | livre | stats | 33 poses próprias | — | pausa, conclusão | **ATIVA** | 12A | `COMPROVADO PELO CÓDIGO` |
| 22 | Cadê a Ovelhinha | sim | `NÃO DETERMINADO` | total | livre | stats | 8 assets próprios | — | pausa | **ATIVA** | 12A | `COMPROVADO PELO CÓDIGO` |
| 23-26 | Monte a Cena (fluxo oficial) | sim | `NÃO DETERMINADO` | total | livre | stats, galeria | **reusa 200 cenas** | — | pausa, conclusão | **ATIVA** | 12A | `COMPROVADO PELO CÓDIGO` |
| 27 | Meus Quadros | sim | `NÃO DETERMINADO` | total | **gate gentil por dentro** | galeria | cenas | — | gate comercial | **ATIVA** | 12A | `COMPROVADO PELO CÓDIGO` |
| 28 | Criar Livre | sim | `NÃO DETERMINADO` | total | livre | blob `/legacy` | mascote | `ATELIER_GUIDE`³ | nome da arte, saída sem salvar | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 29 | Minhas Artes | sim | `NÃO DETERMINADO` | total | livre | blob `/legacy` | miniaturas | — | erro de storage | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 30-31 | Estrelinhas | sim | `NÃO DETERMINADO` | total | livre | conquistas | mascote | `STARS_GUIDE` | conquista | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 32 | Baú do Beni | sim | `NÃO DETERMINADO` | total | livre | presentes | mascote | — | presente | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 33 | Perfil | sim | `NÃO DETERMINADO` | total | livre | perfil | avatares | `PROFILE_GUIDE` | guia | **ATIVA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 34 | Área dos Pais | sim | `NÃO DETERMINADO` | total | livre | várias | — | `PARENT_GUIDE_*`⁴ | portão parental | **ATIVA** | 3/5 | `COMPROVADO PELO CÓDIGO` |
| 35 | Modo Igreja | sim | `NÃO DETERMINADO` | total | independe de plano | `@ptf_church_groups_v1` | **nenhuma** | — | — | **PARCIAL** | 5 | `COMPROVADO PELO CÓDIGO` |
| 36 | Download de pack | sim | `NÃO DETERMINADO` | **exige rede** | exige entitlement | índice de packs | pack remoto | — | progresso | **ATIVA** | 4 | `COMPROVADO PELO CÓDIGO` |
| 37 | Recovery de pack | sim | `NÃO DETERMINADO` | parcial | — | índice de packs | pack remoto | — | erro | **ATIVA** | 4 | `COMPROVADO PELO CÓDIGO` |
| 38-41 | Labs alcançáveis (C60 Lab, SceneValidation, OvelhaAssetGallery, PackSandbox) | sim | `NÃO DETERMINADO` | total | — | varia | varia | — | modais internos | **INTERNA** | 3 | `COMPROVADO PELO CÓDIGO` |
| 42-47 | Labs sem entrada (Spike, Prototype, Levels, Game, GameV2, PuzzleGestureLab) | sim | `NÃO DETERMINADO` | total | — | varia | varia | — | — | **INTERNA + SEM CONSUMIDOR** | 12A | `COMPROVADO PELO CÓDIGO` |

**Notas**
¹ `ADVENTURES_GUIDE` está definido e **não é consumido** — o tour do mapa usa caminho próprio.
`IMPLEMENTADO, MAS SEM CONSUMIDOR`.
² A aba Brincar **não tem guia**: as cinco chaves `guide.brincar.*` não existem no código
(`grep` = 0 ocorrências). `PLANEJADO, MAS NÃO IMPLEMENTADO` (ONB BRI 01).
³ `ATELIER_GUIDE` e os cinco áudios `guide.atelier.*` existem e **nenhuma tela os dispara**.
`LEGADO` + `IMPLEMENTADO, MAS SEM CONSUMIDOR`. Resíduo mantido de propósito
(`docs/DECISIONS.md:600`) porque removê-lo alteraria manifesto de áudio — área protegida.
⁴ `PARENT_GUIDE_BASE` e `PARENT_GUIDE_CREATOR_STEP` estão montados, mas o gate está desligado
(`useScreenGuide('parentArea', false)`).

---

## 8 · Contagens consolidadas

| Contagem | Valor | Evidência |
|---|--:|---|
| Abas | 5 | `COMPROVADO PELO CÓDIGO` |
| Rotas de stack registradas | 39 | `COMPROVADO PELO CÓDIGO` |
| Rotas registradas **sem** gate | 29 | `COMPROVADO PELO CÓDIGO` |
| Rotas registradas **sob** gate interno | 10 | `COMPROVADO PELO CÓDIGO` |
| Superfícies inventariadas (incl. fluxos e blocos sem rota) | 47 | `COMPROVADO PELO CÓDIGO` |
| Superfícies **ATIVAS** | 31 | `COMPROVADO PELO CÓDIGO` |
| Superfícies **PARCIAIS** | 4 | `COMPROVADO PELO CÓDIGO` |
| Superfícies **PROVISÓRIAS** | 1 | `COMPROVADO PELO CÓDIGO` |
| Superfícies **INTERNAS** | 10 | `COMPROVADO PELO CÓDIGO` |
| Superfícies **SEM CONSUMIDOR** | 7 | `COMPROVADO PELO CÓDIGO` |
| Guias com superfície viva | 4 de 7 | `COMPROVADO PELO CÓDIGO` |

---

## 9 · Decisões já aprovadas que não podem ser reabertas

1. **Aposentadoria do Colorir legado (P3J).** 199 arquivos retirados; zero atividades legadas do
   Colorir permanecem ativas ou referenciadas no runtime. — `COMPROVADO PELO DOCUMENTO` +
   `COMPROVADO PELO CÓDIGO`
2. **`AtelierScreen` removida (P3J-R.1 FIX1).** O Cultinho abre o Criar Livre canônico direto.
   Nenhuma tela intermediária deve existir entre origem e canvas. — `COMPROVADO PELO DOCUMENTO`
3. **Resíduo declarado do `ATELIER_GUIDE`.** Mantido de propósito; higiene exige bloco próprio.
4. **`name: 'Ateliê'` da aba Brincar.** Identidade de rota congelada; renomear quebra o Onboarding.
5. **Proibido restaurar a palavra "Ateliê" na experiência infantil.** — `COMPROVADO PELO DOCUMENTO`
6. **Monte a Cena — fluxo oficial** Home → Story → Difficulty → TableGame + Gallery, aprovado no
   aparelho. Spike/Prototype/Levels/Game/GameV2 são legado técnico. — `COMPROVADO PELO DOCUMENTO`
7. **Ovelhinha e Palavrinhas são user-facing no v1** (`D-OVELHINHA-UF1`, `D-PALAVRINHAS-UF1`).

---

## 10 · Itens não determinados

1. Comportamento real de **todas** as superfícies em tablet — nenhuma foi declarada aprovada.
2. Entradas de `Stories` (rota de stack): nenhuma navegação localizada; pode ser alcançada por
   caminho não coberto pela varredura de padrões.
3. Ordem-Z real entre overlays concorrentes em aparelho físico.
4. Alcance efetivo de cada superfície em build de produção (exige build).

---

## 11 · Fases proprietárias

| Fase | Superfícies |
|---|---|
| **3** | Home, Mapa, StoryDetail, Congrats, Hub, Quiz, Reflexão, Livrinho, Criar Livre, Minhas Artes, Estrelinhas, Baú, Perfil, Splash |
| **3/4** | Narração, Colorir 60, Meu Momento, download, recovery |
| **4** | Packs, manifesto, entitlement |
| **5** | Modo Igreja, Cultinho (conteúdo), privacidade |
| **7** | Onboarding, `BRINCAR_GUIDE` |
| **12A** | Brincar e os cinco jogos |

---

*Fim do artefato 1 de 11.*
