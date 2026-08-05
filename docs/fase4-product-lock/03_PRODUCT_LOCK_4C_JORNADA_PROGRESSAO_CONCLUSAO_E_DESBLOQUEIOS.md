# Product Lock — Fase 4C

## Jornada, progressão, conclusão e desbloqueios

**Data:** 2026-08-05
**Worktree:** `C:\tmp\ptf_colorir_canonical_runtime_wt`
**Branch:** `docs/e015-phase3-artifacts`
**HEAD na abertura:** `2100e718e272393e311d838010e90b596eb3c9a7`
**Base executável congelada:** `015c438106538595b592981fbe1b80b1d5d65e55`
**Natureza:** documental e decisória. Nenhum código, asset, pack ou manifesto foi alterado.
**Estado:** ✅ **CONSOLIDADO — respostas do fundador registradas em 2026-08-05. FASE 4C ENCERRADA.**

> **Atualização de consolidação (2026-08-05).** O fundador respondeu às **14 perguntas** da §15,
> emitiu **14 ratificações globais**, **10 correções de rastreabilidade** e **10 determinações de
> consolidação. Este artefato deixa de ser preliminar.** As perguntas da §15 permanecem no texto
> como **registro histórico da deliberação**, agora **respondidas** — cada uma recebeu o bloco
> **"✅ RESPOSTA DO FUNDADOR"** com a decisão vinculante. O registro normativo consolidado vive em
> [`docs/DECISIONS.md` §PL4C](../DECISIONS.md#pl4c--product-lock-fase-4c--jornada-progressão-conclusão-e-desbloqueios)
> e o contrato corrigido em [`docs/DECISAO_CONTRATO_JORNADA.md`](../DECISAO_CONTRATO_JORNADA.md).
> Nada aqui substitui `docs/PROJECT_SOURCE_OF_TRUTH.md` nem a Constituição.
>
> **Regra de leitura em três estados** — toda decisão abaixo distingue **decisão resolvida** ·
> **implementação pendente** · **validação futura**. Decisão de produto tomada **não** corrige
> risco técnico e **não** autoriza escrever código.

---

## 1. Escopo da Fase 4C

**Entra:** fonte canônica do progresso · estado da história · estado das cenas · critério de
conclusão · próxima história · próxima atividade · desbloqueio no Mapa · progresso exibido na
Home, no Story Detail e no Colorir com o Beni · progresso de quiz e reflexão · conclusão
padronizada de histórias e de jogos · revisitação de história concluída · edição de pintura
concluída · recompensas e estrelinhas · retomada de atividade interrompida · estados
inconsistentes entre superfícies · usuário migrado com progresso antigo · comportamento após
reinstalação.

**Não entra:** preço, Plano Família, entitlement, janela offline de sete dias, degustação,
paywall e gate parental (**encerrados na Fase 4A**); recorte gratuito × premium, prévia
editorial infantil, filtro de recomendação, escala do Colorir 60 e contrato de salvamento
(**encerrados na Fase 4B**). Nenhuma dessas decisões é reaberta aqui.

**Também não entra:** arquitetura técnica final, nomes de módulos, algoritmo de reconciliação,
esquema de storage novo, rotação de conteúdo, telemetria e produção de imagens.

---

## 2. Códigos abrangidos

### 2.1 Incluídos — 37 códigos (**38 após a consolidação**, ver Grupo G)

Cada código foi incluído por ter relação **real** com jornada ou progressão, não por mencionar
Home ou Mapa. Campos: **descrição factual · decisão de produto necessária · evidência atual ·
decisões aprovadas relacionadas · dependências · fase de implementação · validação futura ·
impacto no lançamento · precisa do fundador**.

#### Grupo A — Árbitro canônico e sequência (9)

| Código | Descrição factual | Decisão de produto necessária | Evidência atual | Decisões aprovadas relacionadas | Dependências | Fase impl. | Validação futura | Lançamento | Fundador? |
|---|---|---|---|---|---|---|---|---|---|
| **P-01** | Não existe motor canônico de jornada. Cinco produtores independentes de "próxima história" e dois de "estado da história" convivem sem árbitro | Nomear **um** árbitro e declarar todas as demais superfícies como consumidoras | `homeService.js:9` · `showcaseStory.js:15` · `nextAdventureService.js:51` · `AdventureMapScreen.js:262` · `ProgressContext.js:120` | Contrato A0.10 (`DECISAO_CONTRATO_JORNADA.md`) | P-04, P-05, P-17, P-19, P-22 | 11 | Física: Home, Mapa, Estante, Detalhe e Congrats apontando para a mesma história | **PODE BLOQUEAR** | Não — ratificação |
| **P-04** | Quatro algoritmos distintos de "próxima história", com ordens diferentes | Declarar qual ordem é canônica e que os demais deixam de existir | `nextAdventureService.js:23-34` (trilhas hardcoded) × `adventureMap.js:81-83` | A0.10 §"Ordem oficial" | P-01, P-10 | 11 | Física: fim de história leva à mesma história que o Mapa aponta | NÃO BLOQUEIA | Não — ratificação |
| **P-05** | Home recomenda sem consultar acesso **nem sequência** | Nesta fase, só a dimensão **sequência** (a dimensão *acesso* foi resolvida na 4B) | `homeService.js:19,35-38,77`; zero ocorrências de `isStorySequenceUnlocked` em `HomeScreen.js` | `D-4B-FILTRO-RECOMENDACAO`; A0.10 §4 | P-01, P-22 | 11 | Física: Home nunca oferece história que o Mapa desenha com cadeado | **PODE BLOQUEAR** | Não — ratificação |
| **P-06** | Contiguidade presumida: a **contagem** de cenas concluídas é usada como **índice** da próxima | Declarar se o progresso de cena é contíguo por contrato ou esparso por contrato | `StoryDetailScreen.js:319` e `:367`; progresso é mapa esparso (`useProgress.js:28`) | — | P-01 | 11 | **Física obrigatória**: concluir cenas 1, 2 e 5 e verificar qual cena fica "Disponível" | **PODE BLOQUEAR** | **SIM** |
| **P-10** | Namespace duplo de trilha: `comece` × `comece_aqui` | Declarar o identificador canônico da primeira trilha | `nextAdventureService.js:23` × `adventureMap.js` | A0.10 §"Ordem oficial" | P-04 | 11 | Smoke + física | NÃO BLOQUEIA | Não |
| **P-17** | `isFirstStory: true` fixo em um dos caminhos: a sequência é neutralizada ali | Declarar que **nenhuma** superfície pode neutralizar a sequência | `ProgressContext.js:250` | A0.10 §4 | P-01 | 11 | Física | NÃO BLOQUEIA | Não — ratificação |
| **P-19** | O ramo A da Home decide por `totalStars === 0`, não por estado de jornada | Declarar que a ação principal da Home deriva do árbitro | `homeService.js:23-31` | A0.10 | P-01, P-05 | 11 | Física | NÃO BLOQUEIA | Não — ratificação |
| **P-118** | `chronologicalOrder` existe em 3 de 20 histórias | Declarar se a ordem cronológica bíblica é produto de lançamento ou não | `stories.js` — só `noah`, `david_goliath`, `jesus_children` | A0.10 usa a ordem do Mapa, não a cronológica | P-119 | 16 | Documental | NÃO BLOQUEIA | **SIM** |
| **P-119** | `getStoriesInChronologicalOrder()` ordena por campo ausente em 17 de 20 | Consequência direta de P-118 | `src/data/stories.js` | — | P-118 | 16 | Smoke | NÃO BLOQUEIA | Não |

#### Grupo B — Estado e conclusão da história (6)

| Código | Descrição factual | Decisão necessária | Evidência atual | Decisões relacionadas | Dep. | Fase | Validação | Lanç. | Fundador? |
|---|---|---|---|---|---|---|---|---|---|
| **P-03** | "Aventura concluída" existe com 3 textos e 2 regras — **incondicional** em duas telas | Declarar que a frase de conclusão só aparece com a conclusão verdadeira | `CongratsScreen.js:241` e `PostStoryHubScreen.js:91` (incondicionais) × `StoryDetailScreen.js:522` (condicionada) | A0.10 §1; `D-CONCLUSAO-TOTAL-B` | P-01, P-15 | 11 | Física: chegar ao Congrats com quiz pendente | NÃO BLOQUEIA | Não — ratificação |
| **P-15** | 20 encerramentos bespoke sem padrão | Congelar o **sistema padronizado de conclusão** (slots e modos) | `CongratsScreen.js` monolítico | `D-CONCLUSAO-GLOBAL-SISTEMA` (Decisão B, ✅ aprovada, contrato **não** congelado) | P-03, P-49 | 11 | Física em 2 histórias distintas | NÃO BLOQUEIA | **SIM** (slots e destinos) |
| **P-22** | O CTA do Story Detail usa dois predicados de conclusão ao mesmo tempo | Declarar predicado único | `StoryDetailScreen.js:132` (só cenas) × `:297` (contrato) | A0.10 §1 | P-01, P-03 | 11 | Física | NÃO BLOQUEIA | Não — ratificação |
| **P-23** | CTA habilitado é inerte durante a hidratação | Declarar o estado **"aguardando persistência"** como estado de produto visível | `StoryDetailScreen.js` | — | P-01, P-46 | 11 | Física: abrir o Detalhe e tocar imediatamente | NÃO BLOQUEIA | Não |
| **P-38** | O Livrinho não distingue **abrir**, **ler** e **terminar**: a marca é gravada ao iniciar | Declarar o que, no Livrinho, conta para a conclusão | `StoryBookScreen.js:401` grava em `handleStartLivrinho`; `PROGRESS_GUIDE.md` confirma "ao iniciar" | A0.10 (`bookOpened` compõe `journeyComplete`) | P-03 | 10 | Física | NÃO BLOQUEIA | **SIM** |
| **P-49** | A arte da criança no Livrinho está viva no código e morta no runtime | Declarar se a obra da criança compõe a conclusão exibida | `StoryBookScreen` / `drawingStorage` | `D-4B-SALVAMENTO-DUAS-EXPERIENCIAS`; `D-C60-PERSISTENCIA-TODOS-PLANOS` | P-36, P-50 | 10 | Física | NÃO BLOQUEIA | Não |

#### Grupo C — Progresso do Colorir com o Beni (7)

| Código | Descrição factual | Decisão necessária | Evidência atual | Decisões relacionadas | Dep. | Fase | Validação | Lanç. | Fundador? |
|---|---|---|---|---|---|---|---|---|---|
| **P-08** | `hasPendingRewards` exclui o Colorir | Declarar se o Colorir entra na pendência que a Home comunica | `homeService.js:52` | `D-C60-INTEGRACAO-PRODUTO` | P-36, P-50 | 11 | Física | NÃO BLOQUEIA | Não |
| **P-13** | `setItem` sem `await` no convite do C60 | Correção técnica, informa o contrato de persistência | código do piloto | — | P-46 | 9 | Smoke | NÃO BLOQUEIA | Não |
| **P-14** | `IN_PROGRESS` do Colorir é inalcançável | Declarar se a atividade de Colorir tem estado intermediário de produto | serviço do C60 | — | P-36 | 9 | Física | NÃO BLOQUEIA | Não |
| **P-18** | `unlocked={isCompleted}` no Colorir usa o predicado só-cenas | Alinhar ao predicado canônico | JRN C60 01 | A0.10 §1 | P-22 | 9 | Física | **PODE BLOQUEAR** | Não |
| **P-36** | Assimetria entre oferta e exigência do Colorir | Declarar como a exigência acompanha a oferta durante a escala | 3 atividades de 60 existem hoje; `coloringRequired = coloringAvailable === true` (`storyJourneyService.js:94`) | `D-4B-COLORIR-60-ESCALA`; A0.10 §5; emenda **[P3J]** | P-50, P-130 | 8A | Física | **PODE BLOQUEAR** | **SIM** |
| **P-50** | `markStoryColoringActivityDone` não tem chamador | O escritor da conclusão do Colorir legado está ausente | `coloringActivityService.js:30` sem chamador | `D-4B-COLORIR-60-ESCALA` | P-36 | 9 | Física | **PODE BLOQUEAR** | Não |
| **P-51** | A ordem canônica das 3 atividades está replicada | Declarar fonte única da ordem das atividades | duplicação no C60 | `D-C60-INTEGRACAO-PRODUTO` | P-36 | 11 | Smoke | NÃO BLOQUEIA | Não |

#### Grupo D — Estrelinhas e recompensas (4)

| Código | Descrição factual | Decisão necessária | Evidência atual | Decisões relacionadas | Dep. | Fase | Validação | Lanç. | Fundador? |
|---|---|---|---|---|---|---|---|---|---|
| **P-39** | `totalBonusStars` não tem consumidor de interface | Declarar se o acumulador `@ptf_bonus_stars` vira progresso visível ou é aposentado | `ProgressContext.js:140` sem leitor; `rewardService.js:26` soma só cena+especial | `REWARDS_GUIDE.md`; `E1-RODADAS` | P-70, P-82 | 11 | Física | NÃO BLOQUEIA | **SIM** |
| **P-70** | Só Pares gera conquistas | Declarar se os outros três jogos entregam conquista no lançamento | `achievements.js:442-496`; `brincarStatsService.js:422-436` | — | P-82 | 11 | Física | NÃO BLOQUEIA | **SIM** |
| **P-82** | Certificado, share card e relatório semanal não têm consumidor de runtime | Declarar quais fazem parte do produto de lançamento | `certificateService.js`, `shareCardService.js`, `weeklyReportService.js` — só lidos por `scripts/smoke.js` | — | P-15 | 11 | Documental + física | NÃO BLOQUEIA | **SIM** |
| **P-83** | O Baú não calcula `hiddenLocked` na aba "todas" | Correção de exibição de coleção | `BeniChestScreen.js` | — | — | 12A | Física | NÃO BLOQUEIA | Não |

#### Grupo E — Encerramento dos jogos e Criar Livre (9)

| Código | Descrição factual | Decisão necessária | Evidência atual | Decisões relacionadas | Dep. | Fase | Validação | Lanç. | Fundador? |
|---|---|---|---|---|---|---|---|---|---|
| **P-55** | Monte a Cena V2 grava conclusão real sob cena errada | Integridade do registro de conclusão | interno, inalcançável em produção | — | — | 12A | Física interna | **PODE BLOQUEAR** | Não |
| **P-56** | `catch` fail-open no consumo de rodada | Declarar o comportamento canônico quando a contagem falha | `MonteACenaTableGameScreen.js:456` e `:467` | `E1-RODADAS` | P-46 | 12A | Física | **BLOQUEIA** | Não |
| **P-57** | Rodada fabricada na retomada (`remaining: 1` inventado) | Idem P-56 | `MonteACenaTableGameScreen.js:451` | `E1-RODADAS` | P-56 | 12A | Física | **PODE BLOQUEAR** | Não |
| **P-58** | Recusa silenciosa no `handleReplay` | Nenhum toque sem resposta | `MonteACenaTableGameScreen.js` | `D-ENCERRAMENTO-GLOBAL-ATIVIDADES` | P-56 | 12A | Física | NÃO BLOQUEIA | Não |
| **P-63** | Galeria mostra "N de 0" e divide por zero | Como a Galeria comunica o limite 0 | `AtelierGalleryScreen.js:113` e `:116` | `D-4B-SALVAMENTO-DUAS-EXPERIENCIAS` (`ATELIER_FREE_SAVE_LIMIT = 0`) | P-64, P-65 | 12A | **Física obrigatória** | **BLOQUEIA** | **SIM** |
| **P-68** | O fluxo com `mission` nunca pergunta o nome da arte | Declarar quando o nome é perguntado | `AtelierCanvasScreen.js:276` | — | P-63 | 12A | Física | NÃO BLOQUEIA | Não |
| **P-69** | Palavrinhas não persiste resultado algum | Declarar o que um jogo precisa persistir ao encerrar | `brincarStatsService.js:414-419` | `D-ENCERRAMENTO-GLOBAL-ATIVIDADES` | P-71 | 12A | Física | NÃO BLOQUEIA | Não |
| **P-71** | Escrita de resultado não aguardada em Pares e Palavrinhas | Integridade do encerramento | telas dos jogos | P-46 | P-46 | 12A | Física | **PODE BLOQUEAR** | Não |
| **P-86** | Nenhum dos quatro jogos retoma partida (só Monte a Cena) | Declarar se retomada de partida é contrato de produto | `MonteACenaTableGameScreen.js:133-139` é o único | — | P-57 | 12A | Física | NÃO BLOQUEIA | **SIM** |

#### Grupo F — Persistência, migração e inconsistência (2)

| Código | Descrição factual | Decisão necessária | Evidência atual | Decisões relacionadas | Dep. | Fase | Validação | Lanç. | Fundador? |
|---|---|---|---|---|---|---|---|---|---|
| **P-21** | Revisão com A Criação já concluída não foi validada | Contrato de revisitação | pendente de validação física | `D-C60-PILOT-ATIVACAO` | P-18, P-36 | 7 | **Física obrigatória** | NÃO BLOQUEIA | **SIM** (regra), depois física |
| **P-46** | Falha de escrita silenciosa em 3 domínios | Declarar o que a criança vê quando a gravação falha | 3 domínios de escrita sem tratamento | — | P-23, P-56, P-71 | 19 | Física com storage induzido a falhar | **PODE BLOQUEAR** | **SIM** |

#### Grupo G — Rastreabilidade documental (1) — **acrescentado na consolidação**

| Código | Descrição factual | Decisão necessária | Evidência atual | Decisões relacionadas | Dep. | Fase | Validação | Lanç. | Fundador? |
|---|---|---|---|---|---|---|---|---|---|
| **P-11** | `DECISAO_CONTRATO_JORNADA.md:33` afirma um contrato de jornada que o código não implementa | Corrigir a linha para a fórmula canônica aprovada | linha `:33` do documento normativo | A0.10 | P-01 | 4 | Documental | NÃO BLOQUEIA | Não — execução |

> **⚠️ Correção de escopo registrada na consolidação (2026-08-05).** A versão preliminar deste
> artefato listava **37 códigos** na §2.1, mas citava `P-11` nas §13 e §16 sem incluí-lo na lista —
> uma **inconsistência interna do próprio artefato**. Como o fundador determinou expressamente
> *"corrigir `docs/DECISAO_CONTRATO_JORNADA.md:33`"*, que é exatamente o enunciado de `P-11`, o
> código foi **acrescentado ao escopo** como Grupo G. **O total abrangido pela Fase 4C é 38**, e não
> 37. A divergência está registrada aqui de forma explícita, em vez de silenciosamente ajustada.
> `P-11` é o **único** código que passa a `CORRIGIDO` nesta fase, por ser defeito **documental**
> efetivamente sanado neste mesmo bloco — **nenhum risco técnico** foi marcado como corrigido.

### 2.2 Excluídos deliberadamente — com justificativa

| Código | Por que **não** entra na 4C |
|---|---|
| `P-02`, `P-44` | Rotação de conteúdo e "Meu Momento" — eixo de **rotação**, não de progressão. `P-44` já foi tratado na 4B |
| `P-09` | Troca `jonah`/`esther` entre catálogo e `stories` — dado de catálogo, Fase 16 |
| `P-16` | Fila global de overlays — dependência declarada de várias fases, não é decisão de jornada |
| `P-24`, `P-93`, `P-129`, `P-137`, `P-140` | Compra, RevenueCat, entitlement e migração de schema comercial — **encerrados ou alocados na 4A** |
| `P-26`, `P-37`, `P-52`, `P-54`, `P-64`, `P-65`, `P-66`, `P-130`, `P-135`, `P-136` | **Encerrados na 4B** (acesso, prévia, filtro, escala, peso do binário). `P-64`/`P-65` aparecem aqui apenas como *dependência* de `P-63` |
| `P-35` | Onboarding — fase própria |
| `P-42`, `P-45`, `P-43` | Ramo morto do Cantinho, nomenclatura do Livro e "Repita com Beni" — copy/estrutura, não progressão |
| `P-61`, `P-72`, `P-75`, `P-76`, `P-77`, `P-80`, `P-81`, `P-100`, `P-108` | Gameplay, áudio, voz e Modo Igreja — não decidem estado de jornada |
| `P-62`, `P-85` | Perfil por criança e telemetria do Brincar — **o conflito "rodadas por criança × por dispositivo" é preservado**, conforme mandato |
| `P-120`…`P-134` | Schemas de pack e índice remoto — Fases 17/18 |

**Nota de precisão:** a pendência `P-42` é *"Ramo `ParentArea` do Cantinho do Beni é morto"*.
Ela **não** trata do fluxo de revisão de história concluída; a citação em contrário encontrada em
material de apoio foi descartada.

---

## 3. Decisões existentes — auditoria dos 23 itens

Legenda: **APROVADA** · **PARCIAL** · **AUSENTE** · **CONFLITO**.

| # | Item | Classificação | Fonte |
|---|---|---|---|
| 1 | Próxima história exige conclusão total | **APROVADA** | `DECISAO_CONTRATO_JORNADA.md:18` · `DECISIONS.md:358` (`D-CONCLUSAO-TOTAL-B`, Opção B) |
| 2 | A Criação é a primeira | **APROVADA** | `DECISAO_CONTRATO_JORNADA.md:53` · `DECISIONS.md:200` |
| 3 | Noé é a segunda | **APROVADA** | `DECISIONS.md:1157` |
| 4 | Sequência depois de Noé | **PARCIAL** — a 3ª é nomeada; da 4ª à 20ª a ordem é **delegada ao código** (`adventureMap`/`trackId+order`) | `DECISAO_CONTRATO_JORNADA.md:52-53` |
| 5 | Critério mínimo de "concluída" | **CONFLITO C-1** | `DECISAO_CONTRATO_JORNADA.md:33` × `DECISIONS.md:357` |
| 6 | Todas as cenas obrigatórias | **APROVADA** — as duas fórmulas concordam | `DECISAO_CONTRATO_JORNADA.md:32-33` |
| 7 | Quiz obrigatório | **APROVADA** | ambas as fórmulas |
| 8 | Reflexão obrigatória | **APROVADA** | ambas as fórmulas |
| 9 | Três atividades de Colorir obrigatórias | **APROVADA** — decidido que **não**: "**Uma de três** já satisfaz o marco obrigatório Criar"; "**Três de três não bloqueia** o desbloqueio" | `DECISIONS.md:534`, `:537` |
| 10 | Atividade opcional × conclusão | **PARCIAL** — regra existe só para o Colorir; não há regra geral | `DECISIONS.md:535-537` |
| 11 | Estrelinhas como progresso e celebração | **PARCIAL** — reconhecido, mas registrado como entrega da Fase 11 | `DECISIONS.md:67` · v5 `:311-314` |
| 12 | Estrelinhas como moeda | **PARCIAL / CONFLITO C-3** | 4B `:1187` · `DECISIONS.md:431` × `:67` |
| 13 | Desbloqueio de recompensas | **PARCIAL** — decidido por caso (avatares, 1 estrelinha/partida com teto); contrato geral remetido à Fase 11 | `DECISIONS.md:67`, `:422` |
| 14 | Estado "em andamento" | **PARCIAL** — o estado existe na hierarquia aprovada, mas **nenhum documento define seu critério de entrada e saída** | `DECISAO_CONTRATO_JORNADA.md:42-43` · `DECISIONS.md:389` |
| 15 | Retomada do ponto interrompido | **AUSENTE** | só existe como *critério de validação*, v5 `:303` |
| 16 | Revisitação de história concluída | **PARCIAL** — aprovada no princípio, aberta no fluxo, migrada para a Fase 7 | 4B `:699` · `PROJECT_SOURCE_OF_TRUTH.md:59` |
| 17 | Edição de pintura concluída | **APROVADA** — "rever e editar a obra real" | `DECISIONS.md:685` · 4B `:1288` |
| 18 | Repetição da celebração final | **PARCIAL** — decidido que a **tela** reabre; nada decide se a **celebração** se repete | `DECISIONS.md:823`, `:826` |
| 19 | Padrão de conclusão reutilizável | **APROVADA** — ⚠️ contrato técnico **não congelado** | `DECISIONS.md:810-812`, `:820-821` |
| 20 | Padrão de encerramento dos jogos | **APROVADA** — ⚠️ contrato técnico **não congelado** | `DECISIONS.md:838-841` |
| 21 | Destinos após conclusão | **PARCIAL** — os destinos estão **enumerados**, as regras **não estão escritas** | `DECISIONS.md:837`, `:852` |
| 22 | Progresso premium após perda e retorno do entitlement | **APROVADA** — preservado, conclusão não é revogada | 4B `:1186` · `DECISIONS.md:717`, `:1056` |
| 23 | Migração de progresso existente | **AUSENTE** — o único texto é declaradamente **não normativo** ("hipótese observável, não regra pública") | `DECISIONS.md:638-639`, `:1050-1051` |

### 3.1 Conflitos encontrados

> **✅ Desfecho na consolidação (2026-08-05).** Todos os conflitos abaixo receberam decisão do
> fundador. Resumo: **C-1 resolvido** em favor da fórmula **sem `bookOpened`** e por **todas as
> cenas declaradas** · **C-2 resolvido**: a conclusão é reabrível **para leitura, em modo sóbrio**,
> e a **conclusão registrada nunca é revogada** · **C-3 resolvido**: estrelas são **marcos
> cosméticos não consumíveis** e **avatares adicionais exigem Plano Família** · **C-4, C-5, C-6 e
> C-7 permanecem descompassos decisão × implementação**: a decisão de produto está tomada (árbitro
> canônico como autoridade única, nenhuma superfície recalculando conclusão), mas o **risco técnico
> continua aberto** e **não foi corrigido**.

#### C-1 — O Livrinho entra ou não na fórmula de conclusão? (item 5)

- **Lado A — contrato A0.10, aprovado pelo fundador** (`DECISAO_CONTRATO_JORNADA.md:33`):
  `journeyComplete = scenesComplete && bookOpened && quizDone && reflectionDone && coloringComplete`
- **Lado B — `D-CONCLUSAO-TOTAL-B`, ✅ confirmada pelo fundador** (`DECISIONS.md:357`):
  `isStoryFullyComplete = (10 cenas narradas) AND (quiz respondido) AND (colorir concluído) AND (Momento da história)`

As quatro condições comuns coincidem. **A divergência é `bookOpened`**: obrigatório no Lado A,
ausente no Lado B. Como ambas são decisões aprovadas e ambas se apresentam como *o* critério,
uma história que cumpra literalmente o Lado B pode ser marcada concluída sem satisfazer o Lado A.
**O código implementa o Lado A** (`storyJourneyService.js:95-97`).

Divergência secundária: o Lado B fixa "**10** cenas narradas"; o Lado A diz "**todas** as cenas".

#### C-2 — "A conclusão é reabrível" × "não é reabrível" (itens 18 e 19)

`DECISIONS.md:823` (decisão) diz reabrível; `DECISIONS.md:850` diz que não é. **Não é conflito
entre duas decisões:** o segundo texto pertence a `D-CONCLUSAO-ESTADO-ATUAL`, que é **registro do
estado do código**. É um descompasso decisão × implementação, e fica registrado como tal.

#### C-3 — "Estrelinhas não são moeda" × estrelinhas desbloqueando avatares (item 12)

4B `:1187` — "Não são moeda de acesso" · `DECISIONS.md:67` — "dentro do Família, estrelinhas/marcos
podem desbloquear/celebrar". Conciliáveis se "moeda de acesso" for lido como acesso a **conteúdo**
e o avatar como **marco cosmético** — mas **nenhum documento faz essa distinção**. O código
desbloqueia avatar por `totalStars` **sem consultar o plano** (`avatars.js:120-124`), o que a
própria decisão registra como contradição.

#### C-4 — Descompasso decisão × implementação sobre a conclusão

Duas telas afirmam "Aventura concluída!" **sem condição nenhuma** (`CongratsScreen.js:241`,
`PostStoryHubScreen.js:91`), enquanto o Story Detail condiciona a mesma frase a `journeyComplete`
(`StoryDetailScreen.js:522`). **Duas telas do mesmo app contradizem uma à outra na mesma sessão.**

#### C-5 — Nove superfícies decidem "concluída" só por cenas

`ProgressContext.js:241` · `StoryDetailScreen.js:132` · `homeService.js:52`, `:67` ·
`HomeScreen.js:654` · `nextAdventureService.js:59` · `StoryCard.js:24` · `beniChestService.js:109` ·
`achievementService.js:29-57`. Consequência: **as conquistas de "história completa" disparam com
a jornada incompleta** e o Baú entrega carta shiny antes da conclusão real.

#### C-6 — A Estante usa uma quinta regra de bloqueio, própria

`StoriesScreen.js:252` libera a próxima com **uma única cena** da anterior, enquanto Mapa e
Detalhe exigem jornada completa.

#### C-7 — Nada persiste "quando a história foi concluída"

`certificateService.js:40,55` não tem chamador; o "Certificado" do Congrats é um `Modal` visual.
Não existe `completedAt` por história. O item 5 de ETAPA 9 ("altera a data de conclusão?") não
tem sobre o que incidir hoje.

---

## 4. Contrato do árbitro canônico de jornada

> **Contrato de produto e autoridade de estados. Não é arquitetura técnica final.**

### 4.1 Princípio

**Existe um e apenas um árbitro de jornada.** Ele é a única autoridade sobre estado de história,
estado de cena, próxima atividade, próxima história e critério de conclusão. Toda superfície do
app **consome** o árbitro; nenhuma **recalcula**.

O candidato natural, já aprovado e já implementado, é o **contrato A0.10**
(`docs/DECISAO_CONTRATO_JORNADA.md` + `src/services/storyJourneyService.js`), exposto pelo
`ProgressContext`. A 4C **ratifica A0.10 como o árbitro canônico** e transforma em obrigação de
produto aquilo que hoje é opcional na prática.

### 4.2 As 15 informações que o árbitro fornece

| # | Informação | Status hoje | Observação |
|---|---|---|---|
| 1 | **Estado da história** | Fornecido (`getStoryJourneyStatus`) | Concorre com `isStoryCompleted`, que deve ser aposentado como fonte pública |
| 2 | **Estado de cada cena** | Fornecido (`sceneVisualStatus`) | Só 3 saídas: `completed`/`available`/`locked` |
| 3 | **Atividade atual** | **NÃO fornecido** | Derivado localmente por cada tela |
| 4 | **Próxima atividade** | **NÃO fornecido** | ✅ **Resolvido na Decisão 6 (2026-08-05):** a história **retoma por cena**, sem posição exata de áudio/rolagem/palavra. Implementação pendente |
| 5 | **História atual** | Fornecido indiretamente | Via `canShowAsNext` |
| 6 | **Próxima história** | **NÃO fornecido** — cinco produtores concorrentes | `P-01`, `P-04` |
| 7 | **Progresso (representação)** | Parcial | `getStoryCompletionPercent` conta **só cenas** |
| 8 | **Critério de conclusão** | Fornecido, em conflito documental | `C-1` |
| 9 | **Estado de revisitação** | **NÃO fornecido** | Nenhum estado distingue "concluída" de "concluída e sendo revisitada" |
| 10 | **Estado de conteúdo protegido** | Fornecido | `COMMERCIAL_ACCESS`, com `journeyLocked` **antes** de `premiumLocked` |
| 11 | **Estado offline** | Parcial | Entra via `mediaReady`; a janela de 7 dias é decisão 4A |
| 12 | **Recompensas conquistadas** | Fornecido em paralelo | `rewardService` (derivado) **e** `@ptf_bonus_stars` (acumulador invisível) |
| 13 | **Pinturas concluídas** | Fornecido em duplicidade | `ProgressContext.js:194-206` × `StoryDetailScreen.js:221-227`, com gates diferentes |
| 14 | **Origem dos dados** | AsyncStorage, chaves de A0.10 | Duas leituras vivas do mesmo fato (`useProgress` × `ProgressContext`) |
| 15 | **Tratamento de dados inconsistentes** | **NÃO fornecido** | Ver §13 |

### 4.3 As 10 superfícies que apenas consomem

| Superfície | Hoje consome? | O que precisa mudar |
|---|---|---|
| **Home** | **Não** | `getHomePrimaryAction` e `getShowcaseStory` passam a derivar do árbitro |
| **Mapa** | **Sim** | Único consumidor pleno hoje |
| **Story Detail** | Parcial | Recalcula o contrato com entradas próprias; passa a consumir |
| **Narrativa** | Sim, para a guarda de entrada | Mantém |
| **Quiz** | Escreve, não consome estado | Passa a consumir para exibir estado |
| **Reflexão** | Idem | Idem |
| **Colorir com o Beni** | Parcial | `unlocked={isCompleted}` passa a usar o predicado canônico (`P-18`) |
| **Tela de conclusão** | **Não** | Hoje afirma conclusão sem calcular (`P-03`) |
| **Conquistas** | **Não** | Hoje usa só cenas (`C-5`) |
| **Recomendações** (Cultinho, Meu Momento, vitrine) | **Não** | Filtro de acesso já decidido na 4B; falta o de **sequência** |

### 4.4 Regras de autoridade

1. Nenhuma superfície declara conclusão que o árbitro não declarou.
2. Nenhuma superfície pode neutralizar a sequência (encerra `P-17`).
3. A ordem canônica da jornada é **uma só**, a do Mapa (encerra `P-04` e `P-10`).
4. Divergência entre superfície e árbitro é **defeito**, não variação de design.
5. Composição visual pode variar entre superfícies; **regra, não**.

---

## 5. Estados canônicos da história

10 estados × 9 dimensões. `X` = não se aplica.

| Estado | Home | Mapa | Story Detail | Ação principal | Recompensa | Revisitável | Desbloqueia a próxima | Offline | Após perda do entitlement |
|---|---|---|---|---|---|---|---|---|---|
| **1. Protegida** | Prévia editorial, sem CTA de compra | Selo neutro do Plano Família | Prévia + orientação para chamar um adulto | Pedir ajuda a um adulto (gate parental antes de qualquer preço) | Não | Não | Não | Prévia funciona offline | Volta a este estado |
| **2. Disponível** | Pode ser oferecida | Desenhada aberta | CTA ativo | Começar | Não ainda | X | Não | Depende de mídia pronta | Se premium, volta a Protegida |
| **3. Não iniciada** | Pode ser a chamada principal | Aberta, sem preenchimento | "Começar aventura" | Começar | Não | X | Não | Idem | Progresso (zero) preservado |
| **4. Em andamento** | Chamada preferencial | Aberta, parcialmente preenchida | "Continuar aventura" | Continuar do ponto definido em §7 | Estrelinhas já obtidas mantidas | X | **Não** | Idem | **Progresso preservado** |
| **5. Atividade pendente** | Chamada aponta a atividade que falta | Aberta, **sem** selo de concluída | Lista o que falta, nominalmente | Ir à atividade pendente | Parciais mantidas | X | **Não** | Idem | Preservado |
| **6. Concluída** | Sai da chamada principal | Selo de concluída | "Aventura concluída!" | Revisitar / próxima | Todas concedidas, **uma vez** | Sim | **Sim** | Idem | **Conclusão nunca é revogada** |
| **7. Concluída e em revisitação** | Igual a 6 | Igual a 6 — **o selo não regride** | Igual a 6 + indicação de releitura | Continuar a revisita | **Nenhuma nova** | Sim | Já desbloqueou | Idem | Igual a 6 |
| **8. Aguardando sincronização ou persistência** | Não pode ser oferecida como pronta | Neutro, sem regressão de selo | CTA **desabilitado com motivo visível** | Aguardar — nunca toque sem resposta | Congeladas | X | Não decide ainda | É o estado normal de partida | Neutro |
| **9. Dados inconsistentes** | Não pode ser oferecida | **Nunca** regride selo já conquistado | Mostra o maior estado defensável | Continuar pelo caminho seguro | **Nunca revogada** | Sim | Ver §13 | Idem | Idem |
| **10. Conteúdo indisponível por falta de pack** | Não oferecida | Selo "em breve"/indisponível, **sem** cadeado comercial | Explica ausência de conteúdo, não de plano | Nenhuma que leve a beco | Preservadas | Não | **Não** | É a causa típica | Independente do plano |

**Regras transversais:**

- `journeyLocked` **precede** `premiumLocked` (A0.10). Uma história premium ainda não alcançada
  pela jornada mostra "Complete a aventura anterior", **nunca** "Plano Família".
- **Nenhum estado pode reduzir progresso já conquistado.** Estados 8, 9 e 10 são estados de
  *exibição*, nunca de *revogação*.
- Estado 8 é **obrigatoriamente visível**: hoje o CTA fica habilitado e inerte (`P-23`).

---

## 6. Critério de conclusão

### 6.1 Separação obrigatório × opcional (estado documental)

| Elemento | A0.10 (`:33`) | `D-CONCLUSAO-TOTAL-B` (`:357`) | Código (`storyJourneyService.js:95-97`) |
|---|---|---|---|
| Todas as cenas | **Obrigatório** | Obrigatório ("10 cenas") | Obrigatório |
| Quiz | **Obrigatório** | Obrigatório | Obrigatório |
| Reflexão | **Obrigatório** | Obrigatório | Obrigatório |
| **Livrinho aberto** | **Obrigatório** | **Ausente** | **Obrigatório** |
| Colorir | Obrigatório (≥ 1 página) | Obrigatório | **Condicional** — só onde existe (emenda **[P3J]**) |
| 3 de 3 atividades de Colorir | **Não** exigido | — | Não exigido |
| Ações de conclusão (ver a tela) | Não exigido | Não exigido | Não exigido |
| Persistência bem-sucedida | Não declarado | Não declarado | Implícito |

### 6.2 As 7 hipóteses de exigência

| # | Hipótese | Determinação da 4C (preliminar) | ✅ Decisão do fundador (2026-08-05) |
|---|---|---|---|
| 1 | Todas as cenas | **EXIGIDA** — aprovada nas duas fontes | **EXIGIDA** — **todas as cenas declaradas**, nunca um número fixo |
| 2 | Quiz | **EXIGIDO** — aprovado nas duas fontes | **EXIGIDO** |
| 3 | Reflexão | **EXIGIDA** — aprovada nas duas fontes | **EXIGIDA** |
| 4 | Livrinho | *(era pendente — conflito C-1)* | **NÃO EXIGIDO.** Sai da fórmula obrigatória; A0.10 anotada como **superada** nessa parcela. Dois estados próprios: **aberto** e **concluído** |
| 5 | Colorir — pelo menos uma atividade | *(era ratificação pendente)* | **EXIGIDA de forma CONDICIONAL PERMANENTE** — só quando o Colorir estiver **disponível** para a história. Emenda **`P3J` ratificada** |
| 6 | Colorir — três de três | **NÃO EXIGIDA** — decisão aprovada e **não reaberta** | **NÃO EXIGIDA** — conclusão de **coleção**, nunca requisito de desbloqueio |
| 7 | Persistência confirmada da conclusão | *(era pendente)* | **EXIGIDA** — nenhuma conclusão, desbloqueio ou recompensa é anunciada antes da confirmação |

*(As duas primeiras colunas preservam o texto preliminar; a quarta registra a decisão vinculante.)*

**Restrições respeitadas:** nenhuma atividade hoje declarada opcional foi transformada em
obrigatória por iniciativa deste artefato — a única mudança de exigência veio **do fundador**, e é
**afrouxamento** (o Livrinho deixou de ser obrigatório), nunca aperto.

**Estado de fato registrado, não decidido:** hoje, em qualquer build que não seja o perfil do
piloto, `coloringAvailable` é falso para as 20 histórias, portanto **o Colorir não é exigido em
nenhuma história em produção**. Isso não é uma decisão de produto — é uma consequência do portão
de feature flag (`featureFlags.js:122-124` → `coloring60Pilot.js:32-36` →
`storyColoringAvailability.js:49,69-74`).

---

## 7. Desbloqueio da próxima história

> **Decisão preservada e não reaberta:** o desbloqueio da próxima história **exige conclusão
> total** da anterior (`D-CONCLUSAO-TOTAL-B`, Opção B; A0.10 §4).

| # | Ponto | Contrato de produto |
|---|---|---|
| 1 | **Qual evento efetiva o desbloqueio** | A **última** das condições de conclusão a ser satisfeita e **persistida**. Hoje não existe evento nem chave de desbloqueio: `isStorySequenceUnlocked` é 100% derivado (`ProgressContext.js:265-272`) e recalculado a cada render |
| 2 | **Quando o Mapa atualiza** | Na primeira leitura do árbitro após a persistência confirmada |
| 3 | **Quando a Home atualiza** | **Na mesma leitura.** Home e Mapa nunca podem atualizar em momentos diferentes |
| 4 | **Quando aparece a próxima chamada** | Junto com o item 3. Nunca antes da conclusão persistida |
| 5 | **Offline** | O desbloqueio é **local** e não depende de rede. Falta de pack (estado 10) impede **abrir**, não **desbloquear** |
| 6 | **Se a escrita falhar** | A história **não** é declarada concluída, a criança recebe estado 8 com motivo visível, e o app **nunca** exibe "Aventura concluída!" sobre escrita não confirmada. **Nunca falhar em silêncio** (`P-46`) |
| 7 | **Como evitar Home e Mapa divergentes** | Fonte única (§4). Toda superfície lê o mesmo árbitro na mesma hidratação. Divergência é defeito |
| 8 | **História concluída antes de migração** | Ver §13. **Princípio: a conclusão registrada nunca é revogada** |
| 9 | **Se a próxima também for premium** | `journeyLocked` **precede** `premiumLocked`. Alcançada pela jornada e sem plano, a história vira **estado 1 (Protegida)** com prévia editorial — nunca oferta comercial dirigida à criança |
| 10 | **Final da última história** | A jornada não tem "próxima". A conclusão da coleção tem **modo próprio** (§9, modo 4) e o destino principal deixa de ser "próxima aventura" |

---

## 8. Sistema padronizado de conclusão

> `D-CONCLUSAO-GLOBAL-SISTEMA` (Decisão B) está **aprovada**; o contrato técnico **não está
> congelado**. Esta seção congela o **contrato de produto**.

### 8.1 Os 13 slots

| # | Slot | Obrigatório? | Existe hoje | Evidência |
|---|---|---|---|---|
| 1 | Identidade da história | Sim | Sim (`story.emoji` + hero) | `CongratsScreen.js:239-246` |
| 2 | Arte ou conteúdo principal | Sim | Parcial | hero com gradiente |
| 3 | **Presença emocional do Beni** | Sim | Sim | `BeniAvatar variant="celebrating"` + `getBeniGuideMessage('storyCompleted')` |
| 4 | Mensagem | Sim | Sim | "Lição do Coração" |
| 5 | Progresso | Sim | Parcial | `CongratsScreen.js:264-277` — mostra `totalStars`, que não inclui o Brincar |
| 6 | Recompensas | Sim | Sim | Baú, Estrelinhas |
| 7 | **Obras criadas pela criança** | Sim | **Não no runtime** | `P-49` |
| 8 | Próxima ação | Sim | Sim, com ordem errada | `handleNextAdventure` usa `nextAdventureService` (`P-04`) |
| 9 | Revisitar | Sim | Sim | "▶ Rever aventura" `:348-351` |
| 10 | Voltar ao Mapa | Sim | **Não** | Não existe saída para o Mapa hoje |
| 11 | Voltar ao Início | Sim | Sim | "🏠 Voltar ao início" `:399-405` |
| 12 | Ir ao Brincar | Sim | **Não** | Não existe |
| 13 | Próxima história | Sim (exceto no modo 4) | Sim | "Próxima aventura" `:318-321` |

**Slots 10 e 12 não existem hoje** — o Congrats oferece Início, mas não Mapa nem Brincar.

> ✅ **Resolvido na Decisão 8 (2026-08-05) — ordem canônica dos destinos:** 1. próxima aventura
> (quando existir e estiver autorizada) · 2. Mapa de Aventuras · 3. revisitar esta história ·
> 4. ir ao Brincar · 5. ir ao Início. Baú, Estrelinhas, obras e demais recompensas são **elementos
> secundários**. Sem próxima história — e em revisitação — o **Mapa** assume a ação principal.
> **Implementação pendente (Fase 11); validação futura.**

### 8.2 Os 5 modos

| Modo | Quando | Celebração | Recompensa | Slots suprimidos |
|---|---|---|---|---|
| **1. Primeira conclusão** | Todas as condições satisfeitas pela primeira vez | **Grande celebração completa** | Concedidas, uma única vez | Nenhum |
| **2. Revisitação** | Reabertura de história já concluída | **Reconhecimento sóbrio**, não a grande celebração | **Nenhuma nova** | Slot 5 não regride; slot 13 já cumprido |
| **3. Atualização de atividade já concluída** | Ex.: reeditar uma pintura já concluída | **Confirmação discreta.** Proibido reproduzir a grande celebração | Nenhuma nova | Slots 1–6 reduzidos ao mínimo |
| **4. Conclusão da coleção** | Última atividade da coleção de uma história (ex.: 3 de 3 no Colorir) | Celebração **própria** da coleção | Conforme `D-C60-INTEGRACAO-PRODUTO` | Slot 13 não muda: não desbloqueia nada |
| **5. Final da última história** | Última história da jornada concluída | Celebração maior, de fechamento | Conforme contrato de recompensa | **Slot 13 suprimido** — não há próxima |

**Regra dura, do mandato:** a grande celebração **não** se reproduz a cada edição de pintura já
concluída (modo 3).

**Hoje, o app está em desacordo:** `CongratsScreen.js:224-226` renderiza `Confetti` de forma
incondicional, o hero "Aventura concluída!" é incondicional (`:241`), e as quatro animações de
entrada rodam a cada montagem (`:187-193`) — inclusive na revisita, alcançada por "Ver conclusão →"
(`NarrationScreen.js:272-278`).

---

## 9. Revisitação

### 9.1 Os 10 contratos, separados

| # | Objeto revisitado | Contrato |
|---|---|---|
| 1 | **Cena narrada** | Reabrível a qualquer momento. Não altera progresso nem recompensa |
| 2 | **História inteira** | Reabrível. Estado 7. O selo de concluída **nunca regride** |
| 3 | **Quiz** | Reabrível. **Não** reconcede estrela (guarda `alreadyDone`, `QuizScreen.js:103-110`) |
| 4 | **Reflexão** | Reabrível. Não reconcede estrela — **mas hoje regrava a data** (`ReflectionScreen.js:61-76`), o que é defeito |
| 5 | **Livrinho** | Reabrível. Não reconcede estrela |
| 6 | **Pintura do Colorir com o Beni** | **Editável — decisão aprovada** (`DECISIONS.md:685`). Modo 3 de conclusão |
| 7 | **Coleção do Colorir (3 de 3)** | Reabrível. A celebração da coleção **não** se repete |
| 8 | **Tela de conclusão** | Reabrível (`DECISIONS.md:823`). Modo 2 |
| 9 | **Arte do Criar Livre** | Fora do eixo de jornada; segue o contrato de salvamento da 4B |
| 10 | **Partida de jogo** | Fora do eixo de jornada; ver §11 |

### 9.2 As 7 determinações

| # | Determinação | Resposta |
|---|---|---|
| 1 | Altera o progresso? | **Não.** Todo o progresso de jornada é derivado de estado booleano idempotente |
| 2 | Gera recompensa? | **Não.** Nenhuma revisita concede estrelinha nova. Guardas de idempotência já existem e **não podem ser removidas** |
| 3 | Repete a celebração? | ✅ **Resolvido na Decisão 7 (2026-08-05): modo sóbrio** — sem confete completo, sem animação principal, **sem nova recompensa**, com confirmação afetiva discreta. A grande celebração acontece **só na primeira conclusão**. Implementação pendente |
| 4 | Altera a data de conclusão? | **Não deve.** Hoje o app **não persiste data de conclusão de história** (`C-7`); a reflexão regrava sua própria data (defeito). ✅ A Decisão 11 (2026-08-05) fixa o contrato *fail closed* de escrita; o defeito da data **permanece não corrigido** |
| 5 | Preserva a primeira conclusão? | **Sim, sempre.** Regra dura |
| 6 | Preserva a retomada? | Hoje a revisita **descarta** a retomada e força cena 0 (`StoryDetailScreen.js:349-351`). ✅ **Decisão 6 (2026-08-05):** retomada **por cena**; na revisitação voluntária o fluxo futuro poderá permitir começar novamente ou selecionar uma cena. **Validação física ainda exigida (`P-06`)** |
| 7 | Muda o estado exibido? | Só de **6** para **7**. **Nunca** volta a 3, 4 ou 5 |

---

## 10. Estrelinhas e recompensas

### 10.1 Invariantes preservados (não reabertos)

1. **Estrelinhas nunca são gastas.**
2. **Estrelinhas não são moeda.**
3. **Conteúdo premium não é autorizado por estrelinhas.**
4. **Repetição não gera recompensa infinita.**
5. **A criança não perde recompensas já obtidas.**

Todos os cinco estão **respeitados no código** quanto ao gasto: nenhuma busca por
`spendStars`/`removeStars`/`starCost`/`comprar` retorna resultado, e `accessControl` não recebe
`totalStars` em nenhuma função.

### 10.2 Os 10 pontos de auditoria

| # | Ponto | Achado |
|---|---|---|
| 1 | **Fonte da contagem visível** | `rewardService.js:11-19,26` — derivada: cena = 1, quiz = +1, reflexão = +1, Livrinho = +1. Teto por história = cenas + 3 |
| 2 | **Fonte paralela** | `@ptf_bonus_stars` (`postStoryStorage.js:58-72`) — acumulador persistido: quiz **+2**, reflexão +1, Momento com Beni +1, Pares +1, Palavrinhas +1, Ovelhinha +1 |
| 3 | **A fonte paralela é exibida?** | **Não.** `totalBonusStars` existe em `ProgressContext.js:140` e **nenhuma tela o lê** (`P-39`). Tudo que os jogos gravam nunca aparece |
| 4 | **Jogos entram na contagem visível?** | **Não.** Brincar a semana inteira não move o contador da Home |
| 5 | **Colorir entra?** | **Não.** Zero `addBonusStars` (comentário explícito em `ColoringScreen.js:512-513`) |
| 6 | **Monte a Cena entra?** | **Não** — único jogo sem estrelinha nenhuma |
| 7 | **Idempotência** | **Existe por atividade** (quiz, reflexão, Momento, cenas). **Não existe** no acumulador: `current + amount` sem clamp, sem ledger e sem leitura-modificação-escrita atômica |
| 8 | **Teto** | Existe teto diário compartilhado do Brincar (`BRINCAR_DAILY_STAR_CAP = 2`). **Não existe teto global** |
| 9 | **Estrelinhas desbloqueiam algo?** | Sim — **avatares**, por marco (`avatars.js:120-124`), **sem consultar o plano**, o que contradiz `E1-AVATARES` (conflito C-3) |
| 10 | **Conquistas desbloqueiam algo?** | **Não.** São decorativas. E só Pares as gera (`P-70`); nenhuma tela de jogo as celebra |

**Decisões desta seção pendentes do fundador:** Perguntas 9 (visibilidade do acumulador),
10 (conquistas nos demais jogos) — a quantidade por atividade **já está aprovada** e não é
reperguntada.

---

## 11. Encerramento dos jogos e atividades fora das histórias

> `D-ENCERRAMENTO-GLOBAL-ATIVIDADES` (Decisão C) está **aprovada**: "Nenhum jogo poderá ficar
> sem saída", "Nenhum jogo deverá inventar uma origem". O contrato técnico **não está congelado**.
> **O conflito "rodadas por criança × por dispositivo" é preservado e não é resolvido aqui.**

**Nota de inventário:** não existe jogo "Adivinhar o Animal". O quarto jogo da grade é
**"Cadê a Ovelhinha?"** (`BrincarScreen.js:67-72`).

### 11.1 Estado atual — quatro arquiteturas distintas

| Dimensão | Pares | Palavrinhas | Ovelhinha | Monte a Cena |
|---|---|---|---|---|
| Forma do encerramento | tela cheia | overlay | tela cheia, 2 layouts | gaveta sobre o tabuleiro |
| Nº de saídas | 3 | **4** (único com "Início") | 3 | 3 |
| Rótulo do repetir | "Jogar novamente" | "Jogar de novo" | "Jogar novamente" | "Montar novamente" |
| Persiste resultado | sim | **não** | sim | só conclusão, **só premium** |
| Dá estrelinha | sim | sim | sim | **não** |
| Retoma partida | não | não | não | **sim** |

### 11.2 As 8 determinações

| # | Determinação | Contrato de produto |
|---|---|---|
| 1 | **O que é concluir uma rodada** | Um encerramento explícito, único por partida, protegido por guarda anti-duplo, **com escrita aguardada** antes de exibir o resultado (encerra `P-71`) |
| 2 | **Recompensa** | Regra já aprovada: 1 estrelinha por partida válida, com teto diário compartilhado. ✅ **Decisão 9 (2026-08-05):** as estrelinhas do Brincar são **reais e visíveis**, e o **Monte a Cena também concede**, dentro da mesma regra. Implementação e reconciliação **pendentes** |
| 3 | **Tela de encerramento** | **Padrão único** para os quatro jogos: mesma forma, mesmos slots, mesmos rótulos |
| 4 | **Opções de saída** | Conjunto canônico: **repetir · trocar modo · voltar ao Brincar · voltar ao Início**. Hoje só Palavrinhas oferece Início. ✅ A ordem canônica de destinos da **conclusão de história** foi fixada na Decisão 8; a tela de encerramento de jogo mantém o conjunto acima |
| 5 | **Voltar ao Brincar** | Sempre presente e sempre com a **mesma** origem real, nunca inventada |
| 6 | **Repetir** | Só é oferecido quando **há rodada disponível de verdade**. Encerra `P-57` (rodada fabricada) e `P-58` (recusa silenciosa) |
| 7 | **Impedir recompensa infinita** | Teto diário mantido; falha de leitura do contador **nunca** libera rodada ilimitada. Encerra `P-56` (fail-open) — hoje um `catch` transforma a criança em premium ilimitado |
| 8 | **Zero rodadas** | Uma **única** mensagem canônica e um **único** comportamento. Hoje são cinco textos diferentes e, em Pares, o botão principal simplesmente desaparece |

### 11.3 Criar Livre e Galeria

`ATELIER_FREE_SAVE_LIMIT = 0` é decisão **aprovada na 4B** e não é reaberta. O que a 4C precisa
determinar é **como isso é comunicado**: hoje a Galeria escreve literalmente "0 de 0 artes
salvas" e a barra divide por zero, produzindo `width: "NaN%"` ou barra cheia mentindo
(`AtelierGalleryScreen.js:113`, `:116`). É `P-63`, marcado **BLOQUEIA LANÇAMENTO**.

> ✅ **Resolvido na Decisão 12 (2026-08-05).** **Grátis:** remover contador, remover barra, **não
> mostrar "0 de 0"**, estado vazio afetivo, explicação comercial **somente após o gate parental**.
> **Plano Família:** "N artes salvas", sem denominador fixo, sem barra quando o salvamento for
> ilimitado. **A regra de zero salvamentos no Criar Livre grátis não é reaberta.**
> **`P-63` continua BLOQUEIA LANÇAMENTO: a decisão está tomada, o defeito de divisão por zero NÃO
> está corrigido.**

---

## 12. Migração e estados inconsistentes

### 12.1 Princípio de reconciliação

> **A reconciliação sempre resolve a favor da criança.**
>
> 1. **Nada é apagado.** Nenhum progresso, nenhuma pintura, nenhuma criação, em nenhuma hipótese.
> 2. **Conclusão registrada não é revogada** — nem por mudança de regra, nem por perda de plano,
>    nem por dado faltante.
> 3. Diante de dado ambíguo, vale o **maior estado defensável** com base no que existe.
> 4. Regra nova **não retroage para trancar** o que já estava aberto.
> 5. A reconciliação é **silenciosa**: não celebra de novo, não notifica, não interrompe.
> 6. Se a reconciliação não puder ser confiável, o app mostra o estado 8 ou 9 — **nunca** um
>    estado inferior ao que a criança já tinha.
>
> **Precedente já existente e aprovado:** na primeira execução das conquistas, um usuário com
> conquistas já merecidas é silenciosamente marcado como visto, sem modal
> (`ACHIEVEMENT_CELEBRATION_GUIDE.md` §3). É exatamente esta forma de reconciliação.

**Nenhum algoritmo técnico é definido aqui.**

### 12.2 Os 10 cenários

| # | Cenário | Contrato |
|---|---|---|
| 1 | Progresso antigo só com cenas, sem quiz/reflexão | A história **não** é declarada concluída; entra em **estado 5** com o que falta nomeado. **Nada é apagado** |
| 2 | História concluída pelo critério antigo, agora insuficiente | **Permanece concluída.** Regra nova não retroage para trancar (princípio 4) |
| 3 | Colorir adicionado a história já concluída | **Não reabre a conclusão.** A nova atividade aparece como conteúdo novo disponível, não como pendência. ✅ **Confirmado na Decisão 5 (2026-08-05):** não retranca, não retira recompensa e não repete a grande celebração |
| 4 | Chave presente mas ilegível | Estado 9. Trata-se como "não sei", nunca como "não fez" |
| 5 | Chave ausente e progresso derivado positivo | Vale o derivado positivo (princípio 3) |
| 6 | Duas fontes discordam sobre o mesmo fato | Vale a que afirma **mais** progresso. Hoje há três duplicidades vivas: leitura de cena, `coloringComplete` e "concluída" |
| 7 | Escrita falhou no meio de uma conclusão | Estado 8 com motivo visível. Nunca "Aventura concluída!" sobre escrita não confirmada (`P-46`) |
| 8 | Perda e retorno do entitlement | **Decidido na 4A/4B:** progresso, conclusões e obras preservados; obra volta a ser editável |
| 9 | Reinstalação do app | Local-first e sem backend: o storage **não sobrevive** à desinstalação. Isso é **fato**, não decisão. ✅ A Decisão 5 (2026-08-05) confirma que **história concluída permanece concluída** enquanto houver dado; a perda por desinstalação **continua sendo fato do local-first**, não pendência retroativa |
| 10 | Progresso de outro perfil de criança | **Fora do escopo:** o conflito rodadas/perfil é preservado por instrução do mandato |

---

## 13. Implementação futura

| Fase | O que entra | Códigos |
|---|---|---|
| **7** | Fluxo de revisão de história concluída | `P-21` |
| **8A** | Escala do Colorir 60 e a exigência que a acompanha | `P-36` |
| **9** | Escritor da conclusão do Colorir, estado intermediário, `unlocked` canônico | `P-13`, `P-14`, `P-18`, `P-50` |
| **10** | Livrinho: abrir × ler × terminar; obra da criança no livro | `P-38`, `P-49` |
| **11** | **Árbitro canônico** e todas as superfícies consumidoras; sistema padronizado de conclusão; contrato de recompensa | `P-01`, `P-03`, `P-04`, `P-05`, `P-08`, `P-10`, `P-15`, `P-17`, `P-19`, `P-22`, `P-23`, `P-39`, `P-51`, `P-70`, `P-82` |
| **12A** | Encerramento padronizado dos jogos, rodadas e Galeria | `P-55`, `P-56`, `P-57`, `P-58`, `P-63`, `P-68`, `P-69`, `P-71`, `P-83`, `P-86` |
| **16** | Ordem cronológica bíblica | `P-118`, `P-119` |
| **19** | Falha de escrita visível | `P-46` |
| **Documental** | Atualização de `DECISAO_CONTRATO_JORNADA.md:33` | `P-11` |

---

## 14. Validação futura

Nenhuma validação física foi executada nesta fase.

| # | Validação obrigatória em aparelho |
|---|---|
| 1 | Home, Mapa, Estante, Story Detail e Congrats apontando para **a mesma** próxima história |
| 2 | Nenhuma superfície oferecendo história que outra desenha com cadeado |
| 3 | Concluir cenas 1, 2 e 5 e verificar qual cena fica "Disponível" (`P-06`) |
| 4 | Chegar ao Congrats com quiz pendente e verificar que **não** diz "Aventura concluída!" |
| 5 | Revisitar história concluída e verificar o modo 2 (sem grande celebração) |
| 6 | Reeditar pintura concluída e verificar o modo 3 (confirmação discreta) |
| 7 | Verificar que nenhuma revisita concede estrelinha nova |
| 8 | Encerrar os quatro jogos e conferir o mesmo padrão de slots e saídas |
| 9 | Chegar a zero rodadas nos quatro jogos e conferir a mesma mensagem e o mesmo comportamento |
| 10 | Induzir falha de storage e conferir que a criança vê o estado 8, e não conclusão falsa |
| 11 | Abrir a Galeria com zero artes e conferir texto e barra (`P-63`) |
| 12 | Story Detail: tocar o CTA durante a hidratação (`P-23`) |

---

## 15. Perguntas ao fundador

> Nenhuma pergunta abaixo reabre decisão formalmente aprovada. **Não** são perguntadas:
> conclusão total para desbloqueio · A Criação primeira · Noé segunda · quiz e reflexão
> obrigatórios · todas as cenas obrigatórias · três de três **não** obrigatórias · edição de
> pintura concluída permitida · progresso premium preservado · estrelinhas nunca gastas ·
> escala do Colorir 60 · limite 0 do Criar Livre · recorte gratuito × premium.

---

### Pergunta 1 — O Livrinho entra na fórmula de conclusão?

**Contexto.** Duas decisões suas, ambas aprovadas, divergem. A0.10 (`:33`) inclui `bookOpened`;
`D-CONCLUSAO-TOTAL-B` (`:357`) não o menciona. O código implementa a versão **com** Livrinho.

**Alternativas.**
- **(A)** Livrinho **é** obrigatório — A0.10 prevalece, `D-CONCLUSAO-TOTAL-B` recebe anotação.
- **(B)** Livrinho **não** é obrigatório — o código passa a excluí-lo.

**Recomendação técnica: (A).** É o que já roda, é a fórmula mais recente e mais completa, e não
retira nada de ninguém.

**Consequências.** Em (B), histórias hoje trancadas passariam a desbloquear — mudança que
**afrouxa** o critério e altera o estado de crianças reais.

**Códigos afetados:** `P-03`, `P-11`, `P-22`, `P-38`. **Altera decisão anterior:** sim — uma das
duas será anotada como superada.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — alternativa (B), contra a recomendação técnica.**

O Livrinho **não** será requisito para concluir a história nem para desbloquear a próxima. Fica
anotada formalmente como **superada** a parcela de **A0.10** que inclui `bookOpened` na fórmula de
`journeyComplete`. O Livrinho é **preservado como experiência própria, revisável e recompensável**,
porém **opcional** para o avanço da jornada.

**Fórmula canônica aprovada:** todas as cenas declaradas · quiz concluído · reflexão concluída ·
pelo menos uma atividade do Colorir com o Beni **quando disponível** · **persistência confirmada**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 11) · validação **futura**.
`P-11` **corrigido** (documental). `P-03`, `P-22`, `P-38` **abertos**.

---

### Pergunta 2 — "10 cenas" ou "todas as cenas"?

**Contexto.** `D-CONCLUSAO-TOTAL-B` fixa literalmente "10 cenas narradas". A0.10 diz "todas as
cenas". Nem todas as 20 histórias têm 10 cenas.

**Alternativas.** **(A)** "todas as cenas da história", generalizado. **(B)** manter o literal 10.

**Recomendação técnica: (A).** O literal 10 quebraria histórias com contagem diferente.

**Consequências.** (B) tornaria impossível concluir história com mais de 10 cenas e trivial
concluir história com menos.

**Códigos afetados:** `P-03`, `P-22`. **Altera decisão anterior:** sim, por precisão de redação.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — alternativa (A).**

Qualquer contrato global que diga "**10 cenas**" é substituído por "**todas as cenas declaradas da
história**". **Nenhuma regra canônica depende de uma quantidade fixa igual a dez.**

**Estado:** decisão **resolvida** · correção documental **aplicada** em
`DECISAO_CONTRATO_JORNADA.md` (normativo, corrigido) e **anotada** em `D-CONCLUSAO-TOTAL-B`
(histórico, preservado) · implementação **pendente**.

---

### Pergunta 3 — Abrir o Livrinho é o mesmo que terminar o Livrinho?

**Contexto.** Hoje a marca é gravada **ao iniciar** (`StoryBookScreen.js:401`, em
`handleStartLivrinho`; confirmado por `PROGRESS_GUIDE.md`). Um toque conclui o requisito.

**Alternativas.** **(A)** abrir basta (estado atual). **(B)** exige chegar à última página.

**Recomendação técnica: (A) para o lançamento**, com a distinção registrada para depois. (B) é
mais honesto, mas muda o significado de conclusões já registradas de crianças reais.

**Consequências.** (B) faria histórias hoje concluídas voltarem a "atividade pendente" — o que o
princípio de reconciliação (§12.1, item 2) proíbe sem sua autorização expressa.

**Códigos afetados:** `P-38`. **Altera decisão anterior:** não — preenche uma lacuna.

**✅ RESPOSTA DO FUNDADOR (2026-08-05).**

**Abrir o Livrinho não equivale a concluí-lo.** Passam a existir **dois estados distintos**:
(1) Livrinho **iniciado ou aberto**; (2) Livrinho **concluído** ao alcançar a última página.

A conclusão do Livrinho **poderá conceder recompensa própria uma única vez**, mas **não compõe a
conclusão obrigatória** da história. **Registros antigos de `bookOpened` não devem ser apagados nem
causar regressão de progresso.**

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 10) · validação **futura**.

---

### Pergunta 4 — O Colorir é obrigatório para concluir, agora que serão 60 atividades?

**Contexto.** A0.10 §5 diz "pelo menos UMA página de colorir concluída por história", de forma
**incondicional**. O código tornou a exigência **condicional** à existência da atividade (emenda
[P3J]: "19 das 20 histórias não têm mais atividade de colorir — exigir o que não existe trancaria
a jornada inteira"). A 4B decidiu levar o Colorir a **60 atividades nas 20 histórias**, mas a
implementação é da Fase 8A. Hoje, em produção, o portão de feature flag mantém
`coloringAvailable = false` em todas as 20.

**Alternativas.**
- **(A)** Exigência **condicional permanente**: o Colorir conta onde existe. Conforme a escala
  avança, a exigência avança sozinha, história a história.
- **(B)** Exigência **incondicional a partir de uma data ou versão**: todas as 20 passam a exigir
  simultaneamente, quando as 60 existirem.
- **(C)** Colorir **nunca** compõe a conclusão; vira atividade celebrada mas opcional.

**Recomendação técnica: (A).** É o único caminho que nunca tranca uma criança atrás de conteúdo
inexistente, e converge naturalmente para (B) quando a escala terminar.

**Consequências.** (B) exige coordenação perfeita entre release e packs, sob pena de trancar a
jornada inteira. (C) contraria A0.10 §5 e `D-C60-INTEGRACAO-PRODUTO`.

**Códigos afetados:** `P-11`, `P-18`, `P-36`, `P-50`. **Altera decisão anterior:** sim — ratifica
ou revoga formalmente a emenda [P3J], hoje viva só no código.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — exigência CONDICIONAL PERMANENTE.**

Quando **houver** atividades disponíveis para a história, concluir **pelo menos uma das três** é
requisito de conclusão. Quando **não** estiver disponível, a ausência **não pode bloquear a
jornada**. Com a escala completa das **60 atividades**, o resultado natural é **uma atividade
obrigatória em cada uma das 20 histórias**. **Três de três** continua sendo **conclusão da coleção**
e **não** requisito de desbloqueio.

**A emenda `P3J` fica formalmente ratificada.**

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 9 e fases de produção) ·
**risco técnico NÃO corrigido** · validação **futura**.

---

### Pergunta 5 — O que acontece com histórias concluídas antes da escala do Colorir?

**Contexto.** Quando o Colorir chegar a uma história já concluída pela criança, a atividade nova
aparece dentro de uma história que já está com selo de concluída.

**Alternativas.**
- **(A)** A conclusão **permanece**; a atividade nova aparece como conteúdo novo a explorar,
  nunca como pendência, e não reabre a celebração.
- **(B)** A história volta a "atividade pendente" até a criança colorir.

**Recomendação técnica: (A).** (B) tira da criança algo que ela já tinha, e usa o precedente
oposto ao que o app já adota nas conquistas.

**Consequências.** Em (B), uma atualização do app poderia **retrancar** histórias seguintes — o
efeito mais grave possível neste eixo.

**Códigos afetados:** `P-36`, `P-21`. **Altera decisão anterior:** não — é o item 23, hoje
**AUSENTE**.

**✅ RESPOSTA DO FUNDADOR (2026-08-05).**

**História já concluída permanece concluída.** Conteúdo novo entra como **conteúdo a explorar**,
**nunca como pendência retroativa**. Portanto: **não** retrancar a próxima história · **não**
retirar recompensa · **não** repetir automaticamente a grande celebração.

**Estado:** decisão **resolvida** · reconciliação **pendente** (Fase 7) · **validação física ainda
exigida**.

---

### Pergunta 6 — A história retoma no ponto interrompido?

**Contexto.** Nenhum documento decide isso (item 15, **AUSENTE**). Hoje existe retomada **por
cena** (`StoryDetailScreen.js:319`), não existe retomada **dentro** da cena (áudio e rolagem
recomeçam), e a revisita força cena 0. A Home nunca retoma cena — sempre leva ao Detalhe.

**Alternativas.**
- **(A)** Retomada **por cena** apenas — o contrato é "você volta para a cena em que parou".
- **(B)** Retomada **dentro da cena**, incluindo posição do áudio.
- **(C)** Sem retomada: sempre recomeça a história.

**Recomendação técnica: (A) para o lançamento.** É o que já existe, é previsível para uma
criança pequena e não exige persistir posição de mídia.

**Consequências.** (B) é trabalho novo relevante e cria estado a mais para reconciliar. (C)
seria uma regressão perceptível.

**Códigos afetados:** `P-06`, `P-23`. **Altera decisão anterior:** não — preenche lacuna.

**✅ RESPOSTA DO FUNDADOR (2026-08-05).**

**A história retoma por cena.** O lançamento **não** persiste posição exata de áudio, rolagem ou
palavra. Na **revisitação voluntária**, o fluxo futuro poderá permitir **começar novamente** ou
**selecionar uma cena**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 11) · **validação física ainda
exigida** (`P-06`).

---

### Pergunta 7 — A celebração se repete na revisitação?

**Contexto.** Está decidido que a **tela** de conclusão é reabrível (`DECISIONS.md:823`); não
está decidido se a **celebração** se repete. Hoje ela se repete integralmente — confete e
animações incondicionais.

**Alternativas.**
- **(A)** Modo 2: reconhecimento sóbrio, sem confete e sem animação de entrada completa.
- **(B)** Celebração completa toda vez.

**Recomendação técnica: (A).** Celebração que se repete deixa de significar conquista, e a
instrução desta fase já proíbe reproduzir a grande celebração a cada edição de pintura.

**Consequências.** (B) mantém o comportamento atual e enfraquece o valor do modo 1.

**Códigos afetados:** `P-03`, `P-15`, `P-21`. **Altera decisão anterior:** não — completa o
item 18.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — modo sóbrio.**

A **primeira conclusão** recebe a **celebração completa**. Revisitação, reabertura da conclusão,
edição de pintura e atualização de atividade já concluída usam **modo sóbrio**: (1) sem confete
completo · (2) sem animação principal de conquista · (3) **sem nova recompensa** · (4) com
confirmação afetiva e discreta · (5) **preservando a primeira conclusão**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 11) · validação **futura**.

---

### Pergunta 8 — Qual a ordem canônica dos destinos após a conclusão?

**Contexto.** Os destinos estão enumerados em `DECISIONS.md:837`, mas **as regras não estão
escritas**, e "existem múltiplas fontes de verdade para o retorno" (`:852`). Hoje o Congrats
oferece Próxima aventura, Rever, Baú, Estrelinhas, Guardar no coração e Início — **não oferece
Mapa nem Brincar**.

**Alternativas.**
- **(A)** Ordem: **1º Próxima aventura · 2º Rever · 3º Mapa · 4º Início · 5º Brincar** — a
  jornada puxa para a frente.
- **(B)** Ordem: **1º Mapa · 2º Próxima aventura · …** — o Mapa é o lar da jornada.

**Recomendação técnica: (A)**, com o Mapa promovido a primeiro no **modo 5** (final da coleção),
quando não há próxima.

**Consequências.** A escolha define o slot 8 do sistema padronizado e vale para as 20 histórias.

**Códigos afetados:** `P-15`, `P-04`. **Altera decisão anterior:** não — escreve a regra que a
decisão aprovada previu.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — ordem canônica.**

1. **Próxima aventura**, quando existir e estiver autorizada.
2. **Mapa de Aventuras.**
3. **Revisitar esta história.**
4. **Ir ao Brincar.**
5. **Ir ao Início.**

**Baú, Estrelinhas, obras e demais recompensas são elementos secundários**, não ações concorrentes
da ação principal. **Sem próxima história disponível**, o **Mapa** torna-se a ação principal; **em
modo de revisitação**, o Mapa também assume prioridade.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 11) · validação **futura**.

---

### Pergunta 9 — As estrelinhas dos jogos existem para a criança?

**Contexto.** Os jogos gravam estrelinhas em `@ptf_bonus_stars` e **nenhuma tela lê esse valor**.
O "+1 estrelinha!" que a criança vê ao terminar uma partida vem de um booleano local. O contador
visível da Home só cresce com cena, quiz, reflexão e Livrinho. Monte a Cena não concede nada.

**Alternativas.**
- **(A)** O contador visível passa a incluir as estrelinhas do Brincar, e Monte a Cena passa a
  conceder como os outros três.
- **(B)** O Brincar **não** entrega estrelinhas: a mensagem "+1 estrelinha!" é removida dos
  quatro jogos e o acumulador é aposentado.

**Recomendação técnica: (A).** Hoje o app promete e não entrega — o pior dos dois mundos.

**Consequências.** (A) muda o número exibido na Home e **avança marcos de avatar** de crianças
reais (nunca regride, o que é seguro). (B) remove uma recompensa já visível.

**Códigos afetados:** `P-39`, `P-70`, `P-82`. **Altera decisão anterior:** não — `E1-RODADAS`
já fixou "1 estrelinha por partida válida"; o que falta é decidir **onde ela aparece**.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — as estrelinhas do Brincar são reais.**

Elas **devem entrar no contador visível**. Regras: (1) **uma estrelinha por partida válida
concluída** · (2) **teto diário compartilhado de duas** no Brincar · (3) **Monte a Cena também
concede** uma, dentro da mesma regra · (4) a recompensa só é anunciada **depois da persistência
confirmada** · (5) depois do teto, **nenhuma tela promete nova estrelinha** · (6) o acumulador
invisível e o contador visível são **reconciliados em uma fonte canônica** · (7) **nenhuma estrela
será perdida durante a migração**.

**Conflito C-3 resolvido:** estrelinhas **nunca são gastas** e **não autorizam conteúdo premium**;
são **marcos de progresso** e podem liberar **cosméticos sem consumo**. **Avatares adicionais
continuam exclusivos do Plano Família**; dentro do Plano Família, o marco de estrelinhas **pode**
liberar o avatar.

**Estado:** decisão **resolvida** · reconciliação **pendente** (Fase 11) · **risco técnico NÃO
corrigido**.

---

### Pergunta 10 — Os outros três jogos entregam conquista no lançamento?

**Contexto.** Só Pares gera conquistas (5 delas). Palavrinhas, Ovelhinha e Monte a Cena não
alimentam campo algum. Além disso, **nenhuma tela de jogo celebra conquista** — a criança só
descobre se abrir a aba Estrelinhas.

**Alternativas.**
- **(A)** Os quatro jogos entregam conquistas, e a celebração passa a acontecer no jogo.
- **(B)** Só Pares entrega, e isso é assumido e comunicado como tal.

**Recomendação técnica: (A) para a celebração** (barato e corrige promessa quebrada) e **(B) para
o conjunto de conquistas no lançamento**, com os demais jogos na fila.

**Consequências.** (A) integral é trabalho de conteúdo novo (definir conquistas para 3 jogos).

**Códigos afetados:** `P-70`, `P-82`. **Altera decisão anterior:** não.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — os quatro jogos.**

**Pares do Beni**, **Palavrinhas do Beni**, **Cadê a Ovelhinha** e **Monte a Cena** devem possuir
conquistas no lançamento. Elas deverão: (1) ser **idempotentes** · (2) ser celebradas **no próprio
jogo** quando obtidas · (3) aparecer na aba **Estrelinhas** · (4) **não autorizar conteúdo
premium** · (5) **não gerar recompensa infinita** · (6) possuir **critérios próprios de cada jogo**.

**A quantidade e os textos exatos serão produzidos na Fase 11**, mas a **cobertura dos quatro jogos
fica aprovada agora**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 11) · validação **futura**.

---

### Pergunta 11 — O que acontece quando a gravação falha?

**Contexto.** Existe falha de escrita silenciosa em três domínios (`P-46`), o CTA fica habilitado
e inerte durante a hidratação (`P-23`), e há um `catch` que, ao falhar, transforma a criança em
premium ilimitado no Monte a Cena (`P-56`).

**Alternativas.**
- **(A)** A criança vê estado visível ("Estou guardando…" / "Não consegui guardar agora"), o app
  nunca declara conclusão sobre escrita não confirmada, e falha de contagem **fecha**, nunca abre.
- **(B)** Continua silencioso.

**Recomendação técnica: (A).** É a única alternativa compatível com "nenhum toque sem resposta",
já aprovado.

**Consequências.** (A) exige texto novo em várias telas. (B) mantém um caminho em que o limite
diário simplesmente deixa de existir.

**Códigos afetados:** `P-23`, `P-46`, `P-56`, `P-57`, `P-58`, `P-71`. **Altera decisão anterior:**
não.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — visível e *fail closed*.**

(1) Exibir estado **"Guardando…"** durante a escrita · (2) **não declarar conclusão** antes da
confirmação · (3) **não conceder recompensa** antes da confirmação · (4) em falha, informar de forma
**afetiva e objetiva** · (5) oferecer **nova tentativa** · (6) **preservar o trabalho em memória**
quando possível · (7) **nunca** conceder *premium*, rodada, recompensa ou desbloqueio como
alternativa · (8) **nunca** deixar CTA **habilitado e inerte**.

**Copy infantil de referência:** *"Não consegui guardar agora. Vamos tentar mais uma vez?"*

**Estado:** decisão **resolvida** · implementação **pendente** (Fases 9, 12A e 19) · **risco técnico
NÃO corrigido** · **validação física ainda exigida**.

---

### Pergunta 12 — Como a Galeria comunica o limite 0 do Criar Livre?

**Contexto.** O limite 0 é decisão sua, aprovada na 4B, e não está em questão. Em questão está a
comunicação: a Galeria escreve **"0 de 0 artes salvas"** e a barra divide por zero
(`AtelierGalleryScreen.js:113`, `:116`). É marcado **BLOQUEIA LANÇAMENTO**.

**Alternativas.**
- **(A)** No plano grátis, some o contador e a barra; fica apenas o convite editorial do Plano
  Família. No Família, aparece a contagem real sem denominador fixo.
- **(B)** Mantém contador e barra, com denominador corrigido.

**Recomendação técnica: (A).** Contador que só pode dizer "0 de 0" não informa nada.

**Consequências.** Escolha puramente de interface; não altera regra de salvamento.

**Códigos afetados:** `P-63`, `P-64`, `P-65`, `P-68`. **Altera decisão anterior:** não.

**✅ RESPOSTA DO FUNDADOR (2026-08-05).**

**No plano grátis:** (1) remover contador · (2) remover barra · (3) **não mostrar "0 de 0"** ·
(4) mostrar **estado vazio afetivo** · (5) manter explicação comercial **somente depois do gate
parental**.

**No Plano Família:** (1) mostrar **"N artes salvas"** · (2) **não** usar denominador fixo ·
(3) **não** mostrar barra de limite quando o salvamento for ilimitado.

**A regra de zero salvamentos no Criar Livre grátis não é reaberta.**

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 12A) · **risco técnico NÃO
corrigido** (divisão por zero em `P-63`).

---

### Pergunta 13 — A ordem cronológica bíblica é produto de lançamento?

**Contexto.** `chronologicalOrder` existe em 3 de 20 histórias, e
`getStoriesInChronologicalOrder()` ordena por um campo ausente em 17 (`P-118`, `P-119`). A jornada
usa a ordem do Mapa, não a cronológica.

**Alternativas.** **(A)** Não é produto de lançamento: o campo e a função são recolhidos.
**(B)** É produto: as 20 recebem o campo, na Fase 16.

**Recomendação técnica: (A) para o lançamento**, mantendo (B) como possibilidade posterior.

**Consequências.** Nenhuma sobre a jornada — a ordem oficial é e continua sendo a do Mapa.

**Códigos afetados:** `P-118`, `P-119`. **Altera decisão anterior:** não.

**✅ RESPOSTA DO FUNDADOR (2026-08-05).**

A **ordem cronológica bíblica não faz parte do produto de lançamento**. A **única ordem oficial da
jornada é a ordem do Mapa de Aventuras**. `chronologicalOrder` e `getStoriesInChronologicalOrder()`
**não devem orientar qualquer superfície no lançamento**. Uma futura **trilha cronológica** poderá
ser avaliada **depois** do lançamento.

**Estado:** decisão **resolvida** · destino do campo e da função **pendente** (Fase 16).

---

### Pergunta 14 — Retomada de partida nos jogos é contrato de produto?

**Contexto.** Só Monte a Cena retoma partida. Nos outros três, fechar o app no meio perde a
partida **e** a rodada já consumida — a criança gasta uma das duas rodadas do dia e não joga.

**Alternativas.**
- **(A)** Os quatro jogos retomam.
- **(B)** Nenhum retoma, mas a rodada só é consumida ao **concluir**, não ao iniciar.
- **(C)** Mantém como está.

**Recomendação técnica: (B) para o lançamento.** Resolve o dano real (perder a rodada) com muito
menos trabalho que (A), e não depende do conflito preservado de rodadas por criança × dispositivo.

**Consequências.** (B) muda o momento do consumo em quatro telas. (C) mantém uma perda visível
para a criança.

**Códigos afetados:** `P-56`, `P-57`, `P-86`. **Altera decisão anterior:** não — `E1-RODADAS`
fixa a quantidade, não o momento do consumo.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — contrato diferente por duração.**

**Pares do Beni, Palavrinhas do Beni e Cadê a Ovelhinha:** (1) **não** precisam persistir partida
incompleta no lançamento · (2) **a rodada só é consumida quando houver resultado terminal válido** ·
(3) **sair antes do resultado não consome rodada** · (4) vitória, derrota, tempo encerrado ou
conclusão válida **consomem uma rodada** · (5) **nenhuma estrelinha é concedida sem conclusão
válida**.

**Monte a Cena:** (1) mantém **retomada de sessão** · (2) a rodada é consumida **uma única vez** ·
(3) retomar a mesma sessão **não** consome nova rodada · (4) a possibilidade de repetir deve
**consultar o contador real** · (5) **nunca fabricar rodada restante** · (6) **nunca liberar rodada
ilimitada quando o storage falhar**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 12A) · **risco técnico NÃO
corrigido** · **validação física ainda exigida**.

---

## 16. Critérios de saída da Fase 4C

A Fase 4C **só pode ser encerrada** quando:

| # | Critério | Estado em 2026-08-05 |
|---|---|---|
| 1 | As 14 perguntas da §15 tiverem resposta do fundador | ✅ **CUMPRIDO** — 14 de 14 respondidas |
| 2 | O conflito **C-1** resolvido, com um dos lados anotado como superado | ✅ **CUMPRIDO** — fórmula **sem** `bookOpened`; a parcela de A0.10 foi anotada como **superada** |
| 3 | O conflito **C-3** resolvido — avatar por estrelinha é ou não é "moeda" | ✅ **CUMPRIDO** — estrelas são **marcos cosméticos não consumíveis**; **avatares adicionais exigem Plano Família** |
| 4 | Contrato do árbitro canônico (§4) ratificado, com as 10 superfícies consumidoras | ✅ **CUMPRIDO** — ratificação global 1, 2 e 14 |
| 5 | Os 10 estados da história (§5) aprovados sem célula pendente | ✅ **CUMPRIDO** — ratificação global 3 |
| 6 | O critério de conclusão (§6.2) sem hipótese em **PENDENTE** | ✅ **CUMPRIDO** — fórmula canônica aprovada na Decisão 1 |
| 7 | Sistema padronizado (§8) com os 13 *slots* e os 5 modos aprovados | ✅ **CUMPRIDO** — ratificação global 6 |
| 8 | Contratos de revisitação (§9) fechados, especialmente a repetição da celebração | ✅ **CUMPRIDO** — **modo sóbrio** aprovado na Decisão 7 |
| 9 | Padrão de encerramento dos jogos (§11.2) aprovado nas 8 determinações | ✅ **CUMPRIDO** — ratificação global 7 |
| 10 | Princípio de reconciliação (§12.1) ratificado | ✅ **CUMPRIDO** — ratificações globais 8 a 13 |
| 11 | `docs/DECISIONS.md` com os códigos `D-4C-*` | ✅ **CUMPRIDO** — bloco `## PL4C` com 14 códigos `D-4C-*` |
| 12 | Matriz canônica com o registro das decisões nos códigos abrangidos | ✅ **CUMPRIDO** — **38** códigos atualizados **pelo gerador determinístico**, §26 da matriz |
| 13 | `DECISAO_CONTRATO_JORNADA.md:33` conciliado com o contrato (`P-11`) | ✅ **CUMPRIDO** — linha corrigida; `P-11` passa a **`CORRIGIDO`** |

**✅ Todos os 13 critérios de saída estão cumpridos. A Fase 4C está encerrada.**

### 16.1 Itens que permanecem deliberadamente abertos

1. **Rodadas por criança × por dispositivo** — preservado por instrução do mandato (como em PL4B).
2. **Arquitetura técnica do árbitro** — a 4C congela contrato de produto, **não** implementação.
3. **Algoritmo de reconciliação** — só o **princípio** foi definido.
4. **Perfis de criança** — fora do escopo.
5. **Quantidade e textos exatos das conquistas** dos quatro jogos — produção na **Fase 11**.
6. **Toda a implementação** das decisões desta fase — Fases **7, 9, 10, 11, 12A, 16 e 19**.
7. **Toda a validação física** — nenhuma foi executada nesta fase.

### 16.2 O que a Fase 4C **não** fez

Não reabriu nenhuma decisão das Fases **4A** e **4B**. Não marcou nenhum **risco técnico** como
corrigido — a única linha que passou a `CORRIGIDO` é `P-11`, defeito **documental** sanado neste
mesmo bloco. Não rebaixou severidade. Não afrouxou classificação de lançamento. Não criou código
`P` novo — a cobertura foi verificada dentro de `P-01` a `P-140`. Não alterou **código, *assets*,
*packs*, manifestos ou configurações**. Não gerou *build*, não abriu Metro e não executou validação
física. Documentos históricos foram **anotados**, nunca reescritos; apenas o documento **normativo
vigente** (`DECISAO_CONTRATO_JORNADA.md`) foi **corrigido**.

---

**Fim do artefato consolidado da Fase 4C — respostas do fundador registradas em 2026-08-05.**
