# `05` · TASKS do delta da Fase 6 — `F6-R3` → `F6-R2` → `F6-R1` → `F6-SG-D`

**Etapa SDD 5 — Tasks.** Artefato produzido sob a autorização exclusiva concedida no fechamento do
**Portão Humano 2** (aprovado definitivamente em **2026-08-09**).

| Campo | Valor |
|---|---|
| *Worktree* | `C:\tmp\ptf_fase6_shell_splash_wt` |
| *Branch* | `feat/fase6-shell-splash` |
| `HEAD` de entrada | `cfba77b0bb388ef411d24d44f1e29d98f6b1fef3` |
| Árvore de entrada | **limpa** |
| Publicação remota | **nenhuma** — a *branch* não tem *upstream* |
| Data | 2026-08-09 |
| Etapa | **Tasks — e nada além disso** |
| Autoridade | `04_PLAN_DELTA_F6.md` (**r3**), aprovado no Portão Humano 2 e emendado pós-`Analyze` |
| Revisão | **r2 — Emenda pós-`Analyze` do Portão Humano 3** (`HEAD` de entrada da emenda: `db76ac4`) |

> **Emenda pós-`Analyze` (r2 deste artefato).** O `Analyze` (Etapa SDD 6) foi **aprovado como
> diagnóstico** e o **Portão Humano 3 permanece RETIDO**. `Implement` continua **PROIBIDO**. Esta
> revisão corrige documentalmente os achados **`A-01`..`A-25`** e registra corretamente `A-26` e
> `A-27`, conforme as decisões do fundador. **Prioridade de autoridade aplicada:**
> `SPEC` aprovada → `PLAN` aprovado → `TASKS`. As `TASKS` **não** redefinem identificadores do PLAN.
>
> **Correção estrutural central (`A-01`):** o PLAN é a **fonte canônica** de `G-*`, `MT-*`, `TA-*`,
> `CN-*`, dos casos de §28.1 e dos cenários de §28. A revisão r1 deste artefato havia reutilizado
> vários desses identificadores com **significados diferentes**. Isso foi desfeito: todo ID canônico
> voltou ao significado do PLAN, e **toda proteção nova e útil criada pelas `TASKS` foi preservada
> com um identificador NOVO e inédito**. O dicionário completo da reconciliação está em **§2.4.1**.

> **Fronteira deste artefato.** Ele **converte** o PLAN aprovado em unidades de trabalho executáveis.
> Ele **não** executa Analyze, **não** implementa, **não** altera *runtime*, **não** altera *assets*,
> **não** instala dependência, **não** gera *build*, **não** roda Metro, **não** faz *push*, **não**
> faz *merge* e **não** desbloqueia o Bloco `B2`.
>
> **Nenhuma decisão congelada é reaberta.** `Q1`, `Q2`/`PF6D-D-CANVAS`, `Q3`–`Q9`, `D1`–`D18`,
> `PF6D-EXC-R3`, a ordem executiva canônica, `P-152`, `P-164` e o diferimento de `P-103` entram aqui
> como **premissas**. Nenhum contrato normativo do PLAN é simplificado, e nenhuma obrigação do PLAN
> vira sugestão de implementação.

---

## 1. Documentos árbitros consumidos

| Documento | Papel nesta rodada |
|---|---|
| `docs/PROJECT_SOURCE_OF_TRUTH.md` | Verdade máxima — fronteira da Fase 6 e ordem executiva |
| `.specify/memory/constitution.md` (v1.1.0) | Princípios I–V; áreas protegidas; Regra de Ouro |
| `AGENTS.md` · `CLAUDE.md` | Git seletivo, *commits* atômicos, portões de qualidade |
| `docs/DECISIONS.md` | `PF6D-Q1`, `PF6D-D-CANVAS`, `PF6D-EXC-R3`, `PF6D-D1`, `PF6D-D18` |
| **`Analyze` da Etapa SDD 6 (achados `A-01`..`A-27`)** | **Diagnóstico aprovado pelo fundador; base normativa da emenda r2 deste artefato** |
| `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` | `P-150`–`P-157`, `P-164`, `P-82`, `P-148`, `P-30`, `P-103` |
| `delta-v4.1/00_AUDITORIA_SOMENTE_LEITURA.md` | Evidência de código citada pelo PLAN |
| `delta-v4.1/01_SPEC_DELTA_F6_R1_R2_R3.md` | Requisitos `F6-R1.*`, `F6-R2.*`, `F6-R3.*`; `SD-1`–`SD-11`; `RD-1`–`RD-8` |
| `delta-v4.1/02_CLARIFY_E_CHECKLIST.md` | `CKD-01`–`CKD-32`, `CN-*`, `MT-*`, `FD-12` |
| `delta-v4.1/03_ROADMAP_v4.1_DELTA.md` | Subportões `F6-SG-A..D`; *crosswalk* `E`↔`P` |
| **`delta-v4.1/04_PLAN_DELTA_F6.md` (r2)** | **Fonte direta de toda task deste artefato** |
| `.specify/templates/tasks-template.md` | Convenção de formato (`- [ ] ID`, blocos, dependências) |

**Nenhuma auditoria nova de repositório foi feita.** As únicas leituras desta rodada foram
confirmações pontuais de existência de diretório e de arquivo já citados pelo PLAN:
`src/services/` (confirmado `atelierStorage.js`, `drawingStorage.js`, `fileBlobStore.js`,
`atelierResetService.js`, `coloring60ResetService.js`, `guideTargetRegistry.js`), `src/hooks/`
(existe), `src/components/layout/` (existe: `AppScreen.js`, `CenteredContent.js`,
`SafeScreenHeader.js`), `scripts/testing/` (existe: `packInstallHarness.js`) e `src/utils/logger.js`.

---

## 2. Convenções deste artefato

### 2.1 Identificadores

| Prefixo | Significado |
|---|---|
| `TK-A-###` | Task do pacote **`F6-R3`** — subportão **`F6-SG-A`** |
| `TK-B-###` | Task do pacote **`F6-R2`** — subportão **`F6-SG-B`** |
| `TK-C-###` | Task do pacote **`F6-R1`** — subportão **`F6-SG-C`** |
| `TK-D-###` | Task de **verificação de elegibilidade** do subportão **`F6-SG-D`** |

O prefixo `TK-` existe para **não colidir** com os identificadores de teste `TA-1`..`TA-13` do PLAN.

### 2.2 Ficha de cada task

Cada task declara, nesta ordem, os dezesseis campos exigidos: **ID** (cabeçalho) · **pacote e
subportão** · **objetivo** · **arquivos prováveis** · **símbolos/contratos** · **precondições** ·
**depende de** · **mudança esperada** · **prova** · **gate** · **critério objetivo de conclusão** ·
**risco/decisão** · **validação automatizada** · **validação física futura** · **fronteira de
commit** · **rollback**.

### 2.3 Marcação de incerteza

**⚠️ INCERTEZA LOCALIZADA** marca o caso em que o PLAN aponta a responsabilidade mas **não** fixa o
caminho de arquivo. A resolução ocorre **durante a implementação**, por leitura dirigida do módulo
citado — nunca por auditoria ampla, nunca inventando arquivo novo sem necessidade arquitetural
demonstrada pelo PLAN.

### 2.4 Fronteiras de *commit*

Um bloco lógico = um *commit* atômico. Nenhum *commit* mistura código, *assets* e governança.

| *Commit* | Conteúdo | Pacote |
|---|---|---|
| `C-A1` | Eixos de versionamento — contrato, *reader*, *writer*, *validator*, fronteiras de migração | `R3` |
| `C-A2` | Arnês e portões de versionamento (`TA-11`, `G-VER-1..3`) | `R3` |
| `C-A3` | `useSurfaceLifecycle` + adoção nas duas telas de canvas | `R3` |
| `C-A4` | Instrumentação de término do processo de conteúdo | `R3` |
| `C-A5` | `R3.1` — preservação de posição do mapa | `R3` |
| `C-A6` | Preservações transversais verificadas (aba, cena, áudio, tour, *overlays*, sessão) | `R3` |
| `C-A7` | `useViewportProjection` + arnês `TA-4` | `R3` |
| `C-A8` | Espaço lógico **vetorial** (Ateliê) | `R3` |
| `C-A9` | Espaço lógico ***raster*** (Colorir) | `R3` |
| `C-A10` | **Leitor de compatibilidade — somente leitura** | `R3` |
| `C-A11` | ***Writer* write-forward** + proteção de *lineart* | `R3` |
| `C-A12` | Portões `G-LFC-*`, `G-CVS-*`, `G-CMP-*` em `scripts/smoke.js` | `R3` |
| `C-B1` | `mapAnchor.js` puro, **sem consumidor** | `R2` |
| `C-B2` | Arnês `mapAnchorHarness.js` (`TA-1`, `TA-2`, `TA-3`) | `R2` |
| `C-B3` | `MapRegion` migra (pino, alvo de toque, brilho) | `R2` |
| `C-B4` | Câmera inicial migra | `R2` |
| `C-B5` | `onContentSize` migra | `R2` |
| `C-B6` | `scrollPinIntoView` migra e a duplicação morre | `R2` |
| `C-B7` | Assinatura única e portões `G-MAP-*` | `R2` |
| `C-C1` | `useWindowBand` **sem consumidor** | `R1` |
| `C-C2` | Arquétipos **sem consumidor** | `R1` |
| `C-C3` | Adoção da família **Editorial** | `R1` |
| `C-C4` | Adoção da família **Hub** (+ painel de apoio da Galeria) | `R1` |
| `C-C5` | Adoção da família **Imersiva** | `R1` |
| `C-C6` | `GameSurface` oferecido, sem adoção imposta | `R1` |
| `C-C7` | *Tokens* semânticos de navegação em `src/theme/tokens.js` | `R1` |
| `C-C8` | Barra lateral (`R1.4`) | `R1` |
| `C-C9` | Portões `G-RSP-*`, `G-SID-*` | `R1` |
| `C-C10` | **Orientação** — configuração nativa, último passo do último pacote | `R1` |
| `C-GOV1` | Relatórios de subportão e evidências (governança, **nunca** junto de código) | — |

**Regra:** mutantes (`MT-*`) **nunca** são *commitados*. São injetados, observados falhando,
revertidos e registrados.

### 2.4.1 Dicionário canônico de identificadores (emenda `A-01`)

> **Regra absoluta desta revisão:** **é proibido que o mesmo ID tenha dois significados.** O PLAN é a
> fonte canônica de `G-*`, `MT-*`, `TA-*`, `CN-*`, dos casos de §28.1 e dos cenários de §28. Toda
> proteção nova e útil criada pelas `TASKS` foi **preservada** com **identificador novo e inédito**.
> O PLAN **não** foi emendado para acomodar renumeração das `TASKS`.

#### (a) Mutantes canônicos do PLAN (§25) — significado restaurado

| ID | Mutação injetada (texto canônico do PLAN) | Portão que **tem** de ficar vermelho | Task de prova |
|---|---|---|---|
| `MT-1` | Recolocar `useEffect(() => { didInitScroll.current = false; }, [mapWidth])` | `G-LFC-1` | `TK-A-093` |
| `MT-2` | Voltar `scrollPinIntoView` a usar um fator próprio diferente do canônico | `G-MAP-1` (+ `TA-1`) | `TK-B-025` |
| `MT-3` | Voltar `getStoryMapCoord` a ter **duas assinaturas** | `G-MAP-2` (+ `TA-3`) | `TK-B-037` |
| `MT-4` | Voltar `initialOffsetY` à estimativa com os `56` fantasma | `G-MAP-3` (+ `TA-2`) | `TK-B-038` |
| `MT-5` | **Realocar `paintD`/`qBuf`/`visBuf` dentro de `resize()`** | `G-CVS-1` (+ `TA-4`/`TA-5`) | `TK-A-086` |
| `MT-6` | Voltar a gravar **coordenadas absolutas de *viewport*** no Ateliê | `G-CVS-2` (+ `TA-5`) | `TK-A-039` |
| `MT-7` | Reintroduzir `Dimensions.get` | `G-RSP-1` (+ `TA-6`) | `TK-A-095` (imediata, `SG-A`) · `TK-C-047` (formal, `SG-C`) |
| `MT-8` | **Remover o consumidor de `grid`** | `G-RSP-2` (+ `TA-8`) | `TK-C-048` |
| `MT-9` | **Reimportar `theme/colors`** na barra lateral | `G-SID-1` (+ `TA-10`) | `TK-C-049` |
| `MT-10` | **Remover um `registerGuideTarget`** da barra lateral | `G-SID-1` (+ `TA-9`) | `TK-C-050` |
| `MT-11` | **Reintroduzir literal `768`** | `G-BP-1` (+ `CN-7`) | `TK-C-051` |
| `MT-12` | Emitir o payload do canvas com `v:3` | `G-VER-1` (+ `TA-11`) | `TK-A-008` |
| `MT-13` | Fazer o leitor **apagar, limpar ou substituir por canvas branco** ao encontrar incompatibilidade de dimensão | `G-CMP-1` (+ `G-CVS-3`, §28.1 caso 14) | `TK-A-040` |
| `MT-14` | Promover a nova representação **antes** de validar a releitura | `G-CMP-4` (+ `TA-13`, casos 12 e 13) | `TK-A-054` |
| `MT-15` | Reintroduzir largura estrutural de barra lateral **fora de `tokens.js`** | `G-SID-2` | `TK-C-024` |
| `MT-16` | **Derivar largura disponível a partir do *token*** em vez de medir | `G-SID-3` | `TK-C-052` |

#### (b) Mutantes NOVOS criados por estas `TASKS` — IDs inéditos, após o conjunto canônico

| ID | Mutação injetada | Portão que **tem** de ficar vermelho | Task de prova |
|---|---|---|---|
| `MT-17` | Abrir obra volta a **converter e regravar** | `G-CMP-2` | `TK-A-047` |
| `MT-18` | Payload aceito **sem verificar a identidade do *lineart*** | `G-CMP-6` | `TK-A-055` |
| `MT-19` | Reintroduzir a regra universal **"tablet = duas colunas"** | `G-RSP-5` | `TK-C-053` |
| `MT-20` | Coluna estreita cercada de vazio em `>=900dp` | `G-RSP-6` | `TK-C-054` |
| `MT-21` | Criar um **quarto *breakpoint*** | `G-RSP-7` | `TK-C-055` |
| `MT-22` | Comparação literal de largura **fora do *hook*** de faixa | `G-RSP-5` | `TK-C-056` |
| `MT-23` | **Destino de navegação novo** na barra lateral | `G-SID-4` | `TK-C-057` |
| `MT-24` | Alvo de toque de `MapRegion.js` volta a derivar **separadamente do pino**, por chamada direta a `getStoryMapCoord` | `G-MAP-2` | `TK-B-026` |
| `MT-25` | Reintroduzir **compensação de geometria mensurável** em `computeCameraTarget` | `G-MAP-4` | `TK-B-039` |
| `MT-26` | Remover `useSurfaceLifecycle` de `ColoringScreen.js` | `G-LFC-2` | `TK-A-087` |
| `MT-27` | Remover `onRenderProcessGone` de `ColoringCanvas.js` | `G-LFC-3` | `TK-A-088` |
| `MT-28` | Alterar `POINTER_VERSION` para `4` / acrescentar degrau na escada de migração | `G-VER-2` | `TK-A-089` |
| `MT-29` | Inferir `layoutVersion` a partir de `paintSchemaVersion` | `G-VER-3` | `TK-A-090` |
| `MT-30` | Primeira montagem do mapa deixa de mirar `comece_aqui` (cálculo próprio de posição inicial) | `G-MAP-5` | `TK-B-042` |
| `MT-31` | Reintroduzir `Platform.isPad` decidindo *layout* | `G-RSP-3` | `TK-C-058` |
| `MT-32` | Módulo de *layout* **redeclara** valor já presente em `tokens.js` | `G-RSP-4` | `TK-C-059` |
| `MT-33` | Projeção de compatibilidade volta a **esticar** (`cover`) ou a transformar camadas com geometrias divergentes | `G-CMP-3` | `TK-A-091` |
| `MT-34` | Caminho de limpeza/*reset* remove ***lineart*** histórico ainda referenciado | `G-CMP-5` | `TK-A-092` |

#### (c) Testes `TA-*` — significado canônico restaurado (PLAN §23)

| ID | Significado **canônico** (PLAN) | Significado indevido usado na r1 | Task |
|---|---|---|---|
| `TA-1` | Arnês: `mapAnchor.getStoryAnchor` — mesma entrada ⇒ mesma saída para pino, câmera e `scrollPinIntoView` | *(igual — preservado)* | `TK-B-007` |
| `TA-2` | Arnês: `computeCameraTarget` — *clamp* em `[0, contentH - vp]` | *(igual — preservado)* | `TK-B-007` |
| `TA-3` | Arnês: **assinatura única** — história sem coordenada explícita produz a mesma fração para pino e *scroll* | "região ativa" | `TK-B-007` |
| `TA-4` | Arnês: projeção `toScreen(toCanonical(p)) == p` em retrato, paisagem e Split View | *(igual — preservado)* | `TK-A-031` |
| `TA-5` | Arnês: **ida e volta do formato** — payload com `paintSchemaVersion`/`layoutVersion` → serializa → desserializa ⇒ coordenadas lógicas idênticas; legado continua carregável | "obra sobrevive à mudança de janela" | `TK-A-034`, `TK-A-035` |
| `TA-6` | **Portão estático**: ausência de `Dimensions.get` em `src/` (`SD-11`) | *(igual — preservado)* | `TK-A-094` |
| `TA-7` | **Portão estático**: nenhum *breakpoint* novo; `breakpoints` continua fonte única; `G-BP-1` preservado | "arquétipos por família" | `TK-A-094`, `TK-C-002` |
| `TA-8` | **Portão estático**: `grid` e `displayScaleTablet` têm **pelo menos um** consumidor real | *(igual — preservado)* | `TK-C-015`, `TK-C-061` |
| `TA-9` | **Portão estático**: os **cinco** `registerGuideTarget` da barra lateral continuam presentes | "contrato da barra lateral" | `TK-C-063` |
| `TA-10` | **Portão estático**: `TabletSidebar` **não** importa mais `theme/colors` | "geometria do guia" | `TK-C-021` |
| `TA-11` | Arnês: ortogonalidade dos eixos de versão | *(igual — preservado)* | `TK-A-006` |
| `TA-12` | Arnês: leitor de compatibilidade determinístico | *(igual — preservado)* | `TK-A-046` |
| `TA-13` | Arnês: ***write-forward*** com falha injetada em cada etapa | *(igual — preservado)* | `TK-A-053` |

> **`TA-14` (novo, criado por estas `TASKS`):** arnês de **arquétipos por família** — a mesma família
> com o mesmo conteúdo produz composições distintas e coerentes por faixa, e **nenhum** arquétipo
> contém regra universal de colunas. Task: `TK-C-004`. *(Era o significado indevidamente atribuído a
> `TA-7` na r1.)*
>
> **`TA-15` (novo):** arnês/verificação de **geometria do alvo de guia** nas três faixas —
> a parte estruturalmente automatizável; a parte de geometria real exige aparelho (§11.11).
> Task: `TK-C-026`. *(Era o significado indevidamente atribuído a `TA-10` na r1.)*

#### (d) Controles negativos `CN-*` — significado canônico restaurado (PLAN §24)

| ID | Significado **canônico** (PLAN) | Significado indevido usado na r1 | Task |
|---|---|---|---|
| `CN-1` | **Telefone em retrato não muda em nada** — nos três pacotes | "`R2` não ganha faixa nem arquétipo" | `TK-A-098`, `TK-B-045`, `TK-C-038` |
| `CN-2` | Primeira montagem do mapa mantém o comportamento atual (`comece_aqui` no topo) | *(igual — preservado)* | `TK-A-020`, `TK-B-028`, `TK-B-041` |
| `CN-3` | **Desenho sem mudança de janela continua carregando exatamente como hoje** | "custo de *scroll* preservado" | `TK-A-097` |
| `CN-4` | Rota, áudio e sessão de jogo não são afetados por `R3.1` | *(igual — preservado)* | `TK-A-028` |
| `CN-5` | **Nenhum destino novo aparece na barra lateral (`D4`)** | "faixa compacta inalterada" | `TK-C-027`, `TK-C-043` |
| `CN-6` | Nenhuma tela remonta na travessia de 600dp | *(igual — preservado)* | `TK-A-022` |
| `CN-7` | **`P-30`/`G-BP-1` continuam verdes — zero literais `768`** | "nenhum destino ou funcionalidade novo" | `TK-A-094`, `TK-C-051` |
| `CN-8` | **Nenhum *asset*, manifesto, história, conquista ou regra de acesso foi tocado** — `git diff --cached --name-only` **em cada *commit*** | "nenhuma migração silenciosa em massa" | `TK-A-099`, `TK-B-046`, `TK-C-064` |

> **`CN-9` (novo):** `R2` não ganha faixa nem arquétipo — `F6-R2` não invade `F6-R1`. Task:
> `TK-B-027`. **`CN-10` (novo):** custo de *scroll* do mapa preservado. Task: `TK-B-028`.
> **`CN-11` (novo):** faixa compacta inalterada por `R1`. Task: `TK-C-038`.
> **`CN-12` (novo):** nenhuma funcionalidade nova entra pela porta dos fundos em `R1`. Task:
> `TK-C-027`. **`CN-13` (novo):** nenhuma migração silenciosa em massa da galeria. Task:
> `TK-A-043`. *(Os cinco eram significados indevidamente atribuídos a `CN-1`, `CN-3`, `CN-5`, `CN-7`
> e `CN-8` na r1; foram preservados como controles legítimos, com IDs inéditos.)*

#### (e) Portões — canônicos do PLAN §26 e novos destas `TASKS`

**Canônicos (significado do PLAN, restaurado):** `G-LFC-1`, `G-LFC-2`, `G-LFC-3`, `G-CVS-1`,
`G-CVS-2`, `G-MAP-1`, `G-MAP-2`, `G-MAP-3`, `G-MAP-4`, **`G-MAP-5`** (acrescentado ao PLAN r3 por
`A-07`), `G-RSP-1`, `G-RSP-2`, `G-RSP-3`, `G-RSP-4`, `G-SID-1`, `G-SID-2`, `G-SID-3`, `G-VER-1`,
`G-VER-2`, `G-VER-3`, `G-CMP-1`, `G-CMP-2`, `G-CMP-3`, `G-CMP-4`, `G-CMP-5`, `G-BP-1` — **26**.

**Novos, criados por estas `TASKS` (IDs inéditos):**

| Portão novo | Asserção | Origem |
|---|---|---|
| `G-CVS-3` | **Nenhum caminho de carga abre canvas branco silencioso quando existe obra recuperável**; o estado de incompatibilidade é explícito e preserva o arquivo | Invariante ZERO #4 · decisão `A-24` do fundador ("se existir necessidade de gate para 'não abrir canvas branco', ele recebe outro ID") |
| `G-CMP-6` | O caminho de abertura **verifica a identidade do *lineart*** antes de compor a tinta; divergência ⇒ ramo explícito de incompatibilidade | Invariante ZERO #2 · `Q8` r.10 |
| `G-RSP-5` | A decisão de composição passa por `useWindowBand`/arquétipo; **nenhuma regra universal "tablet = duas colunas"**; nenhuma comparação literal de largura fora do *hook* | `Q3` · `D3` |
| `G-RSP-6` | **Nenhuma família produz coluna estreita cercada de vazio** em `>=900dp` | `SD-3` |
| `G-RSP-7` | O conjunto de *breakpoints* permanece com exatamente **três** valores; nenhum quarto *breakpoint* | `TA-7` · `SD-11` |
| `G-SID-4` | A barra lateral **não ganha destino de navegação novo** | `D4` · `CN-5` |

**Total de portões: 32** (26 canônicos + 6 novos).

### 2.4.2 Aviso de nomenclatura local (emenda `A-27`)

Os artefatos deste delta usam a nomenclatura local `00_`..`05_` dentro de
`specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/`, e **não** os nomes padrão do Spec Kit
(`spec.md`, `plan.md`, `tasks.md`) na raiz da *feature*. **Isso é deliberado e permitido.**

> ⚠️ **Aviso para ferramentas e agentes:** a ausência de `spec.md`, `plan.md` e `tasks.md` na raiz de
> `specs/021-fase6-shell-splash-sistema-visual/` **não** significa que os artefatos estejam ausentes.
> O mapeamento é: `01_SPEC_DELTA_F6_R1_R2_R3.md` = *spec*; `04_PLAN_DELTA_F6.md` = *plan*;
> `05_TASKS_DELTA_F6.md` = *tasks*. Nenhuma ferramenta deve concluir que a *feature* está
> incompleta a partir do nome dos arquivos.

### 2.5 Ordem executiva e regras de bloqueio

```
TK-A-*  (F6-R3)  →  F6-SG-A concedido  →  TK-B-*  (F6-R2)
                                       →  F6-SG-B concedido  →  TK-C-*  (F6-R1)
                                                             →  F6-SG-C concedido  →  TK-D-*
```

| Regra | Enunciado |
|---|---|
| **OR-1** | **Nenhuma task `TK-B-*` é executável antes da concessão de `F6-SG-A`.** |
| **OR-2** | **Nenhuma task `TK-C-*` é executável antes da concessão de `F6-SG-B`.** |
| **OR-3** | **Nenhuma task de `F6-R2` depende de `F6-R1`.** A dependência é de mão única (§5.1 do PLAN). |
| **OR-4** | `TK-A-*` de proteção da obra **não** pode ser deslocada para depois de `R2` ou `R1`. |
| **OR-5** | `TK-D-*` produz **parecer**, nunca desbloqueio. `B2` **não** aparece como automaticamente desbloqueado. |
| **OR-6** | A orientação nativa (`R1.1`) é o **último** passo do **último** pacote (`RG-9`, `RD-1`). |

### 2.6 Regra especial de `RG-1` — prioridade não cai

O PLAN registra probabilidade residual **menor** para `RG-1` porque a política deixou de ser
incógnita. **Isso não reduz prioridade de implementação.** Até a proteção estar implementada,
testada e `F6-SG-A` concedido:

- a exposição real continua **NÃO MITIGADA**;
- o impacto continua **MÁXIMO**;
- **`SD-8` continua bloqueador absoluto**;
- **nenhuma** task de proteção da obra (`TK-A-030`..`TK-A-056`) é deslocada para depois de `R2` ou
  `R1`;
- a matriz de compatibilidade (`TK-A-063`..`TK-A-080`) é **critério de saída**, não formalidade.

---

## 3. `BLOCO 1` · `F6-R3` — *Lifecycle & Resize Stability* · `F6-SG-A`

**Pendências:** `P-152` (dona) · `P-164` (só a porção que `F6-R3.6` autoriza).
**Bloqueador dominante:** `SD-8`.

### 3.1 Fundação — eixos de versionamento (§11.5) · **bloqueante de tudo o mais**

> Esta sub-seção vem **primeiro** porque §22 do PLAN a declara pré-requisito de *reader*, *writer*,
> *validator*, migração **e** testes. Sem ela, qualquer trabalho de compatibilidade nasce ambíguo.

#### `TK-A-001` · Congelar os quatro eixos de versionamento como contrato de código
- **Pacote · Subportão:** `F6-R3.5` (separação de eixos) · `F6-SG-A` — **Objetivo:** tornar impossível confundir versão de *envelope*, de *payload* visual e de geometria lógica, em qualquer leitor, escritor, validador, migração ou teste.
- **Arquivos:** `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js`, `src/services/drawingStorage.js` (**leitura**), `src/services/storageKeys.js` (**leitura**) — **Símbolos/contratos:** `APP_STORAGE_SCHEMA_VERSION` · `POINTER_VERSION`/campo `v` · **`paintSchemaVersion`** (novo) · **`layoutVersion`** (novo); §11.5.3 regras 1–6.
- **Precondições:** Portões Humanos 2 e 3 concedidos; `HEAD` limpo — **Depende de:** —
- **Mudança esperada:** as duas constantes novas passam a existir com nome próprio e comentário normativo declarando o que cada eixo responde; `v` do payload do canvas é declarado **congelado em `2` para sempre**; nenhum eixo é inferido de outro.
- **Prova:** `TA-11` — **Gate:** `G-VER-1`, `G-VER-3`
- **Conclusão:** os quatro nomes existem, cada um com um único significado documentado no próprio código, e nenhum trecho novo usa `v` como discriminador de evolução.
- **Risco · decisão:** `RG-11` · `Q8` (correção de nomenclatura) — **Auto:** sim · **Física futura:** não · **Commit:** `C-A1` · **Rollback:** reverter `C-A1`; nada persistido muda nesta task.

#### `TK-A-002` · *Reader* — ler os eixos por nome, tratar ausência como legado
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** o leitor identifica a representação **pelo nome do eixo**, nunca por dedução.
- **Arquivos:** `src/components/ColoringCanvas.js` (`loadPaint`), `src/components/AtelierCanvas.js` (`loadState`) — **Símbolos/contratos:** `loadPaint`, `loadState`, ramo legado `d.v===2`, ramo legado `Array.isArray(d.ops)`.
- **Precondições:** `TK-A-001` concluída — **Depende de:** `TK-A-001`
- **Mudança esperada:** ramificação por `paintSchemaVersion`/`layoutVersion` **antes** dos ramos legados, que são **preservados intactos**; ausência de `paintSchemaVersion` ⇒ payload legado; ausência de `layoutVersion` ⇒ geometria legada; as duas ausências são **independentes**.
- **Prova:** `TA-11`, `TA-5` — **Gate:** `G-VER-3`
- **Conclusão:** obra legada continua carregando sem erro; obra nova carrega pelo ramo novo; nenhum ramo antigo foi removido.
- **Risco · decisão:** `RG-11` · `Q8` r.1–6 — **Auto:** sim · **Física futura:** sim (§28.1 casos 14, 15, 17) · **Commit:** `C-A1` · **Rollback:** reverter `C-A1`.

#### `TK-A-003` · *Writer* — emitir os eixos nomeados com `v` congelado em `2`
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** impedir na origem a colisão provada em §11.5.2.
- **Arquivos:** `src/components/ColoringCanvas.js` (`exportPaint`), `src/components/AtelierCanvas.js` (`exportState`) — **Símbolos/contratos:** `exportPaint`, `exportState`, guarda de `src/screens/ColoringScreen.js:224` (`obj.v === 3 || typeof obj.uri === 'string'`).
- **Precondições:** `TK-A-001` concluída — **Depende de:** `TK-A-001`
- **Mudança esperada:** o payload passa a conter `paintSchemaVersion` e `layoutVersion`; **`v` permanece `2`**; todos os campos existentes continuam presentes; a guarda de `ColoringScreen.js:224` continua rejeitando ponteiro e **passa a aceitar** o payload novo.
- **Prova:** `TA-11`, `TA-5` — **Gate:** `G-VER-1`
- **Conclusão:** nenhum payload emitido contém `v: 3`; a guarda do *writer* aceita o payload novo em teste.
- **Risco · decisão:** **`RG-11` (impacto máximo)** · `Q8` — **Auto:** sim · **Física futura:** sim (§28.1 caso 17) · **Commit:** `C-A1` · **Rollback:** reverter `C-A1`; obras antigas não são afetadas porque nada foi regravado.

#### `TK-A-004` · *Validator* — validar por eixo, sem inferência cruzada
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** a validação de integridade não pode deduzir um eixo a partir de outro (§11.5.3 regra 5).
- **Arquivos:** `src/components/ColoringCanvas.js` (`validatePaint`) — **Símbolos/contratos:** `validatePaint`, `LOAD_PAINT_INCOMPATIBLE`.
- **Precondições:** `TK-A-002`, `TK-A-003` — **Depende de:** `TK-A-002`, `TK-A-003`
- **Mudança esperada:** `validatePaint` valida presença/coerência **por eixo**; a ausência de um eixo não invalida o outro; a validação **não** consulta o envelope de armazenamento.
- **Prova:** `TA-11` — **Gate:** `G-VER-3`
- **Conclusão:** variar cada eixo isoladamente no arnês produz o veredito correto sem contaminar os demais.
- **Risco · decisão:** `RG-11` · `Q8` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A1` · **Rollback:** reverter `C-A1`.

#### `TK-A-005` · Fronteiras de migração — envelope e schema do app permanecem intocados
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** garantir que a Fase 6 **não** encoste nos dois eixos preexistentes.
- **Arquivos:** `src/services/drawingStorage.js`, `src/services/coloring60DrawingStorage.js`, `src/services/storageKeys.js`, `src/services/storageMigrationService.js` — **todos em modo de verificação** — **Símbolos/contratos:** `POINTER_VERSION = 3`, `APP_STORAGE_SCHEMA_VERSION = 3`, escada `{ version: 3, run: migrateToV3 }`.
- **Precondições:** `TK-A-001` — **Depende de:** `TK-A-001`
- **Mudança esperada:** **nenhuma alteração funcional** — a task existe para provar e lacrar a ausência de alteração: `POINTER_VERSION` continua `3`, `APP_STORAGE_SCHEMA_VERSION` continua `3`, e nenhum degrau novo entra na escada de migração.
- **Prova:** `TA-11` — **Gate:** `G-VER-2`
- **Conclusão:** `git diff` desses quatro arquivos é **vazio** ao fim de `F6-R3`, ou contém apenas leitura sem mudança de contrato.
- **Risco · decisão:** `RG-11` · `Q8` — **Auto:** sim · **Física futura:** sim (§28.1 caso 16) · **Commit:** `C-A1` · **Rollback:** não aplicável — a task é de não-alteração.

#### `TK-A-006` · Arnês `artworkVersionHarness.js` — ortogonalidade dos eixos (`TA-11`)
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar em Node puro que os quatro eixos são independentes.
- **Arquivos:** `scripts/testing/artworkVersionHarness.js` (**novo**, padrão de `scripts/testing/packInstallHarness.js`) — **Símbolos/contratos:** `TA-11`.
- **Precondições:** `TK-A-002`..`TK-A-004` — **Depende de:** `TK-A-002`, `TK-A-003`, `TK-A-004`
- **Mudança esperada:** o arnês varia `POINTER_VERSION`, `paintSchemaVersion` e `layoutVersion` de forma independente e verifica que *reader*, *writer* e *validator* não se confundem.
- **Prova:** ela mesma (`TA-11`) — **Gate:** — (alimenta `G-VER-3`)
- **Conclusão:** arnês executa sem dependência nova, sai com código `0` e cobre as combinações de presença/ausência dos dois eixos novos.
- **Risco · decisão:** `RG-11` · Restrição de repositório: **sem Jest, sem *runner* novo** (§23 do PLAN) — **Auto:** sim · **Física futura:** não · **Commit:** `C-A2` · **Rollback:** reverter `C-A2`.

#### `TK-A-007` · Portões `G-VER-1`, `G-VER-2` e `G-VER-3` em `scripts/smoke.js`
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** transformar as regras de §11.5 em asserção estática que falha sozinha.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `check(label, condition, failDetail)`, `readSrc`, `codeOf` (asserção de ausência que ignora comentários).
- **Precondições:** `TK-A-006` — **Depende de:** `TK-A-003`, `TK-A-005`, `TK-A-006`
- **Mudança esperada:** três asserções novas: payload nunca contém `v: 3`; `POINTER_VERSION`/`APP_STORAGE_SCHEMA_VERSION` inalterados e escada sem degrau novo; eixos referenciados por nome. **Esta task cria os três portões** — ela **não** os prova.
- **Prova:** **prova independente, um mutante por portão** — `G-VER-1` fica vermelho sob `MT-12` (`TK-A-008`); `G-VER-2` sob `MT-28` (`TK-A-089`); `G-VER-3` sob `MT-29` (`TK-A-090`) — **Gate:** `G-VER-1`, `G-VER-2`, `G-VER-3`
- **Conclusão:** `npm run smoke` verde no estado correto e **vermelho** sob cada um dos três mutantes independentes.
- **Risco · decisão:** `RG-11` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A2` · **Rollback:** reverter `C-A2`.

#### `TK-A-008` · Mutante `MT-12` — emitir o payload do canvas com `v:3`
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-VER-1` tem dentes.
- **Arquivos:** `src/components/ColoringCanvas.js` (mutação temporária, **nunca commitada**) — **Símbolos/contratos:** `exportPaint`.
- **Precondições:** `TK-A-007` — **Depende de:** `TK-A-007`
- **Mudança esperada:** **defeito deliberado** — `exportPaint` emite `v: 3`. Esperado: `G-VER-1` fica **vermelho** e `TA-11` falha. Mutante revertido, resultado registrado.
- **Prova:** observação do portão vermelho — **Gate:** `G-VER-1` (**tem de falhar**)
- **Conclusão:** portão observado falhando, mutante revertido, `git status` limpo, registro anexado.
- **Risco · decisão:** `RG-11` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum — mutante não é *commitado*** · **Rollback:** `git checkout --` do arquivo mutado.

### 3.2 Ciclo de vida e instrumentação (`F6-R3.2`, `F6-R3.4`, `P-164`)

#### `TK-A-009` · Criar `src/hooks/useSurfaceLifecycle.js`
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** contrato **único** de `AppState` + foco de navegação, para não nascer uma sexta variação do padrão.
- **Arquivos:** `src/hooks/useSurfaceLifecycle.js` (**novo**) — **Símbolos/contratos:** `useSurfaceLifecycle({ onBackground, onForeground, pauseOnBlur }) → { appState, isActive, isFocused }`; espelha `src/screens/ParesDoBeniScreen.js:316-332`.
- **Precondições:** Portão 3 concedido — **Depende de:** —
- **Mudança esperada:** *hook* novo, **sem consumidor** neste passo (mudança de risco zero); os quatro jogos **não** são refatorados (§6.3).
- **Prova:** revisão + `G-LFC-2` (após adoção) — **Gate:** — (prepara `G-LFC-2`)
- **Conclusão:** o *hook* existe, é importável, e `npm run smoke` continua verde sem nenhum consumidor.
- **Risco · decisão:** `RG-4` · Princípio III (remove responsabilidade das telas) — **Auto:** sim · **Física futura:** não · **Commit:** `C-A3` · **Rollback:** reverter `C-A3`.

#### `TK-A-010` · `ColoringScreen.js` passa a consumir `useSurfaceLifecycle`
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** fechar a ausência de escuta de `AppState` numa das duas únicas superfícies interativas sem ela.
- **Arquivos:** `src/screens/ColoringScreen.js` — **Símbolos/contratos:** `useSurfaceLifecycle`; hoje **nenhum** `AppState` e **nenhum** `useFocusEffect`.
- **Precondições:** `TK-A-009` — **Depende de:** `TK-A-009`
- **Mudança esperada:** a tela reage a `onBackground`/`onForeground` sem alterar o fluxo de pintura; nenhum recarregamento destrutivo é introduzido.
- **Prova:** §28 #4, #5 — **Gate:** `G-LFC-2`
- **Conclusão:** Centro de Controle e segundo plano não produzem recarregamento silencioso; pintura intacta ao voltar.
- **Risco · decisão:** `RG-1` (impacto máximo) · `SD-8` — **Auto:** parcial (portão estático) · **Física futura:** **sim** (§28 #4, #5; §28.1 casos 7, 8) · **Commit:** `C-A3` · **Rollback:** reverter `C-A3`.

#### `TK-A-011` · `AtelierCanvasScreen.js` passa a consumir `useSurfaceLifecycle`
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** idem para o Ateliê.
- **Arquivos:** `src/screens/AtelierCanvasScreen.js` — **Símbolos/contratos:** `useSurfaceLifecycle`; `loadState` (`:165`), `exportState` (`:232`).
- **Precondições:** `TK-A-009` — **Depende de:** `TK-A-009`
- **Mudança esperada:** idem `TK-A-010`, preservando o fluxo de carga/gravação atual.
- **Prova:** §28 #8, #9 — **Gate:** `G-LFC-2`
- **Conclusão:** composição do Ateliê intacta após Centro de Controle e segundo plano.
- **Risco · decisão:** `RG-1` · `SD-8` — **Auto:** parcial · **Física futura:** **sim** (§28.1 casos 7, 8) · **Commit:** `C-A3` · **Rollback:** reverter `C-A3`.

#### `TK-A-012` · Instrumentar `onContentProcessDidTerminate` (iOS) nos dois canvas
- **Pacote · Subportão:** `F6-R3.4` · `F6-SG-A` — **Objetivo:** sair de **zero ocorrências** em `src/` para defesa instrumentada, **sem** declarar causa provada.
- **Arquivos:** `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js` — **Símbolos/contratos:** prop `onContentProcessDidTerminate` de `react-native-webview`.
- **Precondições:** `TK-A-009` — **Depende de:** `TK-A-009`
- **Mudança esperada:** a prop passa a existir e a registrar o evento; **observabilidade pura**, sem mudança de comportamento visível (§12, passo 2).
- **Prova:** §28 #5; registro anexado — **Gate:** `G-LFC-3`
- **Conclusão:** a prop está declarada nos dois componentes e o registro é observável em desenvolvimento.
- **Risco · decisão:** **`RG-8`** · `P-164` · **`FD-12`** — **Auto:** sim (portão estático) · **Física futura:** **sim** (§28.1 caso 9, quando reproduzível) · **Commit:** `C-A4` · **Rollback:** reverter `C-A4`.

#### `TK-A-013` · Instrumentar `onRenderProcessGone` (Android) nos dois canvas
- **Pacote · Subportão:** `F6-R3.4` · `F6-SG-A` — **Objetivo:** paridade Android da defesa instrumentada.
- **Arquivos:** `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js` — **Símbolos/contratos:** prop `onRenderProcessGone`.
- **Precondições:** `TK-A-012` — **Depende de:** `TK-A-012`
- **Mudança esperada:** idem `TK-A-012` para Android.
- **Prova:** §33 #5 (quando houver aparelho) — **Gate:** `G-LFC-3`
- **Conclusão:** a prop está declarada nos dois componentes; a validação em tablet Android fica registrada como vão conhecido (`P8`).
- **Risco · decisão:** `RG-8` · `P-164` · `FD-12` — **Auto:** sim · **Física futura:** **sim — bloqueada por indisponibilidade de aparelho (§33)** · **Commit:** `C-A4` · **Rollback:** reverter `C-A4`.

#### `TK-A-014` · Registro observável do término de processo, com guardrail `FD-12` no próprio texto
- **Pacote · Subportão:** `F6-R3.4` · `F6-SG-A` — **Objetivo:** permitir que a campanha física **capture** o evento sem que nenhum artefato declare causalidade provada.
- **Arquivos:** `src/components/ColoringCanvas.js` (`devLog` da ponte), `src/components/AtelierCanvas.js`; ⚠️ **INCERTEZA LOCALIZADA** quanto ao destino final do registro (`src/utils/logger.js` × `devLog` interno) — **Símbolos/contratos:** contador + carimbo de tempo.
- **Precondições:** `TK-A-012`, `TK-A-013` — **Depende de:** `TK-A-012`, `TK-A-013`
- **Mudança esperada:** contador e carimbo registrados; o texto do registro descreve **o evento**, nunca a causa; nenhuma correção é rotulada de "resolvida" por inferência estática.
- **Prova:** revisão independente + inspeção do texto — **Gate:** `G-LFC-3`
- **Conclusão:** o registro existe, é legível no aparelho, e nenhum artefato afirma causa confirmada.
- **Risco · decisão:** **`RG-8` (impacto alto — credibilidade)** · `FD-12` · `P-164` **sem rebaixamento** — **Auto:** parcial · **Física futura:** **sim** (§28 #5) · **Commit:** `C-A4` · **Rollback:** reverter `C-A4`.

#### `TK-A-015` · Portões `G-LFC-2` e `G-LFC-3` em `scripts/smoke.js`
- **Pacote · Subportão:** `F6-R3.2`/`R3.4` · `F6-SG-A` — **Objetivo:** lacrar a ausência de defesa para que ela não volte.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `check`, `readSrc`.
- **Precondições:** `TK-A-010`, `TK-A-011`, `TK-A-013` — **Depende de:** `TK-A-010`, `TK-A-011`, `TK-A-013`
- **Mudança esperada:** asserção de que as duas telas de canvas consomem `useSurfaceLifecycle` e de que os dois componentes declaram **ambas** as props de término de processo. **Esta task cria os dois portões** — ela **não** os prova.
- **Prova:** **prova independente** — `G-LFC-2` fica vermelho sob `MT-26` (`TK-A-087`); `G-LFC-3` fica vermelho sob `MT-27` (`TK-A-088`). Nenhum portão prova a si próprio. — **Gate:** `G-LFC-2`, `G-LFC-3`
- **Conclusão:** `npm run smoke` verde no estado correto e vermelho sob cada mutante independente.
- **Risco · decisão:** `P-164` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A12` · **Rollback:** reverter `C-A12`.

#### `TK-A-016` · Gesto em curso comitado atomicamente antes de qualquer reprojeção
- **Pacote · Subportão:** `F6-R3.2` (§14.3) · `F6-SG-A` — **Objetivo:** nunca existir gesto "meio aplicado" atravessando mudança de janela ou `onBackground`.
- **Arquivos:** `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js` — **Símbolos/contratos:** traço em curso, preenchimento em andamento, carimbo selecionado; `onBackground` de `useSurfaceLifecycle`.
- **Precondições:** `TK-A-010`, `TK-A-011` — **Depende de:** `TK-A-010`, `TK-A-011`
- **Mudança esperada:** ao receber `onBackground` **ou** mudança de *viewport*, o motor **finaliza o gesto de forma atômica** (comita no modelo) e só então reprojeta.
- **Prova:** §28 #3, #6; §32 #6 — **Gate:** — (verificado no roteiro físico)
- **Conclusão:** girar ou sair do app com traço em andamento não deixa traço parcial nem perde o traço.
- **Risco · decisão:** `RG-1` · `SD-8` — **Auto:** não · **Física futura:** **sim** (§28 #3, #6) · **Commit:** `C-A8`/`C-A9` (por motor) · **Rollback:** reverter o *commit* do motor afetado.

### 3.3 Preservação de estado (`F6-R3.1`, `F6-R3.2`, `F6-R3.3`)

#### `TK-A-017` · `R3.1` — gravar a posição corrente do mapa como par lógico
- **Pacote · Subportão:** `F6-R3.1` · `F6-SG-A` — **Objetivo:** ter o que restaurar depois de uma mudança de largura.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `onScroll` (`:398`), `regionLayout` (`:173`), par `{ regionIndex, fracWithinRegion }`.
- **Precondições:** Portão 3 concedido — **Depende de:** —
- **Mudança esperada:** `onScroll` passa a gravar o par lógico derivado do `regionLayout` **já existente**; duas operações aritméticas, **sem alocação e sem `setState` adicional**.
- **Prova:** §28 #1, #2 — **Gate:** — (prepara `G-LFC-1`)
- **Conclusão:** o par lógico é atualizado durante o *scroll* sem custo perceptível no caminho quente.
- **Risco · decisão:** **`RG-7`** (custo de *scroll*) · `P-152` — **Auto:** não · **Física futura:** **sim** (§28 #1) · **Commit:** `C-A5` · **Rollback:** reverter `C-A5`.

#### `TK-A-018` · `R3.1` — mudança de largura deixa de ser tratada como primeira montagem
- **Pacote · Subportão:** `F6-R3.1` · `F6-SG-A` — **Objetivo:** matar o descarte da posição da criança.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `useEffect(() => { didInitScroll.current = false; }, [mapWidth])` (`:367`), `onContentSize`, `scrollTo`.
- **Precondições:** `TK-A-017` — **Depende de:** `TK-A-017`
- **Mudança esperada:** a reposição de `didInitScroll` por `mapWidth` **desaparece**; a troca de largura agenda uma **reprojeção** que restaura o **mesmo par lógico** quando o novo `contentSize` chega — não a câmera.
- **Prova:** `MT-1` + §28 #1, #2 — **Gate:** `G-LFC-1`
- **Conclusão:** rolar até um ponto arbitrário, girar e voltar mantém a posição, sem salto.
- **Risco · decisão:** **`P-152`** · `SD-7` — **Auto:** sim (portão estático) · **Física futura:** **sim** (§28 #1, #2) · **Commit:** `C-A5` · **Rollback:** reverter `C-A5`.

#### `TK-A-019` · `R3.1` — preservar `userScrolledRef` e reconciliar `activeIdx`
- **Pacote · Subportão:** `F6-R3.1` · `F6-SG-A` — **Objetivo:** eliminar a dessincronização que acompanha o descarte de posição.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `userScrolledRef` (`:201`), `activeIdx`, sonda de `:403`.
- **Precondições:** `TK-A-018` — **Depende de:** `TK-A-018`
- **Mudança esperada:** `userScrolledRef` **não** é reposto pela troca de largura; `activeIdx` é reconciliado a partir da posição restaurada, usando a mesma sonda de hoje.
- **Prova:** §28 #1 ("a região ativa acompanha") — **Gate:** `G-LFC-1`
- **Conclusão:** após girar, a região ativa corresponde à posição real e "Ver mapa" abre a região certa.
- **Risco · decisão:** `P-152` — **Auto:** não · **Física futura:** **sim** (§28 #1) · **Commit:** `C-A5` · **Rollback:** reverter `C-A5`.

#### `TK-A-020` · `R3.1` — primeira montagem real preserva exatamente o comportamento atual
- **Pacote · Subportão:** `F6-R3.1` · `F6-SG-A` — **Objetivo:** não regredir a abertura do mapa ao consertar o *resize*.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `initialOffsetY` (`:295-311`), alinhamento de `comece_aqui` (`:303-305`).
- **Precondições:** `TK-A-018` — **Depende de:** `TK-A-018`
- **Mudança esperada:** sem posição anterior gravada, o comportamento de abertura é **idêntico** ao de hoje. **Nenhuma mudança de âncora nesta task** — isso é `F6-R2`.
- **Prova:** `CN-2` — **Gate:** — (`CN-2`)
- **Conclusão:** captura de abertura antes/depois indistinguível na faixa compacta.
- **Risco · decisão:** `RG-5` · `CN-2` — **Auto:** parcial · **Física futura:** **sim** (captura de abertura) · **Commit:** `C-A5` · **Rollback:** reverter `C-A5`.

#### `TK-A-021` · Portão `G-LFC-1` (**criação apenas** — a prova vermelha é de `TK-A-093`)
- **Pacote · Subportão:** `F6-R3.1` · `F6-SG-A` — **Objetivo:** lacrar `F6-LFC-01`/`P-152` contra retorno.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `codeOf`, `didInitScroll.current = false`.
- **Precondições:** `TK-A-019` — **Depende de:** `TK-A-019`
- **Mudança esperada:** asserção de que o efeito disparado por largura **não** repõe `didInitScroll`. **Nenhuma mutação é injetada aqui** (emenda `A-09`/`A-10`: nenhum portão prova a si próprio).
- **Prova:** **prova independente** — `G-LFC-1` fica vermelho sob `MT-1` (`TK-A-093`) — **Gate:** `G-LFC-1`
- **Conclusão:** portão verde no estado correto; `npm run smoke` verde.
- **Risco · decisão:** `P-152` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A12` · **Rollback:** reverter `C-A12`.

#### `TK-A-022` · `R3.3` — provar que a travessia de faixa é *re-render*, não remontagem
- **Pacote · Subportão:** `F6-R3.3` · `F6-SG-A` — **Objetivo:** **impedir regressão** de algo que já está correto (auditoria §3.1) — não reconstruir nada.
- **Arquivos:** `src/navigation/AppNavigator.js` (**verificação**) — **Símbolos/contratos:** `Tab.Navigator` único; corte de tablet (`:232`).
- **Precondições:** `TK-A-009` — **Depende de:** `TK-A-009`
- **Mudança esperada:** **nenhuma mudança estrutural**; instrumentação de montagem em desenvolvimento suficiente para evidenciar ausência de remontagem na travessia de `600dp`.
- **Prova:** `CN-6` — **Gate:** — (`CN-6`)
- **Conclusão:** *log* de montagem não registra remontagem ao atravessar `600dp` arrastando o divisor.
- **Risco · decisão:** **`RG-4`** — **Auto:** parcial · **Física futura:** **sim** (§32 #2) · **Commit:** `C-A6` · **Rollback:** reverter `C-A6`.

#### `TK-A-023` · Preservação de **rota, pilha e aba** através de rotação e *resize*
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** confirmar por evidência o que a tabela §14.1 marca como já sobrevivente, para que a Fase 6 não o quebre.
- **Arquivos:** `src/navigation/AppNavigator.js` (**verificação**) — **Símbolos/contratos:** `Tab.Navigator`, pilha de navegação.
- **Precondições:** `TK-A-022` — **Depende de:** `TK-A-022`
- **Mudança esperada:** **nenhuma** — task de verificação com evidência anexada; se surgir regressão, ela vira defeito e volta ao PLAN (regra de retroalimentação do fluxo SDD).
- **Prova:** §28 #1, #10 — **Gate:** — (`CN-4`, `CN-6`)
- **Conclusão:** rota, pilha e aba idênticas antes/depois de girar e de arrastar o divisor.
- **Risco · decisão:** `RG-4` · `SD-7` — **Auto:** não · **Física futura:** **sim** (§28 #1, #10) · **Commit:** `C-A6` · **Rollback:** não aplicável (verificação).

#### `TK-A-024` · Preservação da **cena atual** das superfícies imersivas
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** garantir que a cena corrente sobreviva à mudança de *viewport*.
- **Arquivos:** ⚠️ **INCERTEZA LOCALIZADA** — o PLAN aponta a responsabilidade ("cena atual" em §14.1) sem fixar caminho; candidatos citados pelo próprio repositório: `src/services/immersiveMoment.js`, `src/screens/StoryBookScreen.js`. Resolver por leitura dirigida **na implementação** — **Símbolos/contratos:** índice de cena corrente.
- **Precondições:** `TK-A-023` — **Depende de:** `TK-A-023`
- **Mudança esperada:** verificação; alteração **apenas** se a cena não sobreviver — e, nesse caso, com o mesmo padrão de espaço lógico do pacote, **sem** invadir `F9` (`StoryBookScreen` além do necessário está fora de escopo).
- **Prova:** roteiro físico de rotação com cena aberta — **Gate:** —
- **Conclusão:** girar durante uma cena preserva a cena e o ponto de leitura.
- **Risco · decisão:** `SD-7` · fronteira de escopo com **F9** — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-A6` · **Rollback:** reverter `C-A6`.

#### `TK-A-025` · Preservação de **áudio** através de rotação, segundo plano e retorno
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** confirmar ausência de interrupção anômala; **não** alterar o gerenciador de áudio.
- **Arquivos:** `src/services/audioManager.js`, `src/services/audioService.js` (**verificação**) — **Símbolos/contratos:** sessão de reprodução `expo-audio`.
- **Precondições:** `TK-A-010`, `TK-A-011` — **Depende de:** `TK-A-010`, `TK-A-011`
- **Mudança esperada:** **nenhuma** — a adoção de `useSurfaceLifecycle` nas telas de canvas **não** pode alterar a política de áudio existente.
- **Prova:** §28 #11 — **Gate:** — (`CN-4`)
- **Conclusão:** áudio tocando atravessa rotação, segundo plano e retorno sem corte anômalo.
- **Risco · decisão:** `SD-7` · área sensível: **manifestos de áudio não são tocados** — **Auto:** não · **Física futura:** **sim** (§28 #11) · **Commit:** `C-A6` · **Rollback:** não aplicável (verificação).

#### `TK-A-026` · Preservação do **passo do tour** e re-medição no retorno ao *foreground*
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** o passo sobrevive; a **geometria** é remedida, não reiniciada.
- **Arquivos:** `src/services/beniTourService.js`, `src/hooks/useScreenGuide.js`, `src/hooks/useGuideTargets.js`, `src/services/guideTargetRegistry.js` (**verificação e re-medição**) — **Símbolos/contratos:** `registerGuideTarget`, `measureInWindow`.
- **Precondições:** `TK-A-010`, `TK-A-011` — **Depende de:** `TK-A-010`, `TK-A-011`
- **Mudança esperada:** ao voltar ao *foreground* ou mudar a *viewport*, os alvos são **re-medidos**; o passo corrente **não** é reiniciado. `guideTargetRegistry` **não** ganha aritmética de mapa (isso é `F6-R2`/§16).
- **Prova:** §28 #13 (vídeo do tour) — **Gate:** — (prepara `SD-5`)
- **Conclusão:** girar no meio do tour mantém o passo e reposiciona o holofote corretamente.
- **Risco · decisão:** `RG-6` · fronteira com **F7** (qual história o tour aponta) — **Auto:** não · **Física futura:** **sim** (§28 #13) · **Commit:** `C-A6` · **Rollback:** reverter `C-A6`.

#### `TK-A-027` · Preservação de ***overlays* compatíveis** (holofote, *callout*, celebração)
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** *overlay* reprojeta, não reinicia nem desaparece.
- **Arquivos:** ⚠️ **INCERTEZA LOCALIZADA** — camada de *overlay* do guia e da celebração (`src/hooks/useScreenGuide.js`, `src/hooks/useAchievementCelebration.js` como candidatos citados pelo repositório) — **Símbolos/contratos:** geometria do *callout* condicionada a `!isTablet` em `AppNavigator.js`.
- **Precondições:** `TK-A-026` — **Depende de:** `TK-A-026`
- **Mudança esperada:** verificação; o equivalente lateral da geometria do *callout* **não** é criado aqui — é `TK-C-026`, em `F6-R1`.
- **Prova:** §28 #13 — **Gate:** —
- **Conclusão:** nenhum *overlay* compatível é perdido ou duplicado na mudança de *viewport*.
- **Risco · decisão:** `RG-6` — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-A6` · **Rollback:** reverter `C-A6`.

#### `TK-A-028` · Preservação de **atividade em andamento** (sessão)
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** a sessão em curso sobrevive à rotação e à multitarefa.
- **Arquivos:** `src/services/monteACenaSession.js` e serviços de sessão equivalentes (**verificação**) — **Símbolos/contratos:** estado de sessão em `src/context`.
- **Precondições:** `TK-A-023` — **Depende de:** `TK-A-023`
- **Mudança esperada:** **nenhuma alteração de comportamento**; a task existe para produzir a evidência de `CN-4` e `SD-7`.
- **Prova:** `CN-4`, §28 #10 — **Gate:** — (`CN-4`)
- **Conclusão:** jogo em andamento sobrevive a girar e a multitarefa, sem reinício de sessão.
- **Risco · decisão:** `SD-7` · **área protegida:** progresso e conquistas **não** são tocados — **Auto:** não · **Física futura:** **sim** (§28 #10) · **Commit:** `C-A6` · **Rollback:** não aplicável (verificação).

#### `TK-A-029` · Estados dos **quatro jogos** — verificação apenas, sem refatoração
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** confirmar que o que já trata `AppState` continua correto — e **não** mexer nele.
- **Arquivos:** `src/screens/ParesDoBeniScreen.js`, `MonteACena*`, `PalavrinhasScreen`, `CadeAOvelhinhaScreen`, `QuizScreen` (**somente leitura**) — **Símbolos/contratos:** padrão `AppState` + `blur`/`focus` de `ParesDoBeniScreen.js:316-332`.
- **Precondições:** `TK-A-028` — **Depende de:** `TK-A-028`
- **Mudança esperada:** **nenhuma.** §6.3 do PLAN é explícito: refatorar os quatro jogos seria risco de regressão **sem requisito**. `GameSurface` é **oferecido**, nunca imposto — e a adoção por tela é `F12A`.
- **Prova:** §28 #10 — **Gate:** — (`CN-4`)
- **Conclusão:** os jogos permanecem intocados no `git diff` e sobrevivem ao roteiro físico.
- **Risco · decisão:** fronteira de escopo com **F12A** — **Auto:** sim (`git diff` vazio) · **Física futura:** **sim** (§28 #10) · **Commit:** `C-A6` (só a evidência) · **Rollback:** não aplicável.

### 3.4 Espaço lógico independente da *viewport* (`F6-R3.5`)

#### `TK-A-030` · Criar `src/hooks/useViewportProjection.js`
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** ter **uma** projeção `contain` canônica, em vez de cada superfície inventar a sua.
- **Arquivos:** `src/hooks/useViewportProjection.js` (**novo**) — **Símbolos/contratos:** `useViewportProjection(logicalSize, windowSize) → { scale, offsetX, offsetY, toCanonical, toScreen }`; `scale = min(w/W, h/H)`; `toCanonical(toScreen(p)) === p` dentro da tolerância.
- **Precondições:** Portão 3 — **Depende de:** —
- **Mudança esperada:** *hook* novo **sem consumidor**; nenhuma superfície muda neste passo.
- **Prova:** `TA-4` — **Gate:** — (prepara `G-CVS-1`)
- **Conclusão:** o *hook* existe, é puro, e a ida-e-volta é idempotente no arnês.
- **Risco · decisão:** `RG-2` · Princípio III — **Auto:** sim · **Física futura:** não · **Commit:** `C-A7` · **Rollback:** reverter `C-A7`.

#### `TK-A-031` · Arnês `viewportProjectionHarness.js` (`TA-4`)
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar a projeção em Node puro, incluindo os extremos.
- **Arquivos:** `scripts/testing/viewportProjectionHarness.js` (**novo**) — **Símbolos/contratos:** `TA-4`; casos de janela extrema (Slide Over estreito, tablet *landscape*).
- **Precondições:** `TK-A-030` — **Depende de:** `TK-A-030`
- **Mudança esperada:** arnês cobre ida-e-volta, `letterbox` e limites; **sem dependência nova**.
- **Prova:** ele mesmo — **Gate:** — (alimenta `G-CVS-1`)
- **Conclusão:** arnês sai com código `0`; nenhuma combinação testada quebra a idempotência.
- **Risco · decisão:** `RG-2` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A7` · **Rollback:** reverter `C-A7`.

#### `TK-A-032` · Projeção `contain` — a obra nunca é recortada nem distorcida
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** fixar `contain` como **a** política de projeção (§11.3): a razão de aspecto lógica é preservada em qualquer janela.
- **Arquivos:** `src/hooks/useViewportProjection.js` — **Símbolos/contratos:** `scale = Math.min(w/W, h/H)`; proibição de `scaleX ≠ scaleY`.
- **Precondições:** `TK-A-030` — **Depende de:** `TK-A-030`
- **Mudança esperada:** um único fator de escala isotrópico; nenhum caminho permite escala anisotrópica ou `cover`.
- **Prova:** `TA-4` + §28.1 casos 2, 4, 5 — **Gate:** **`G-CMP-3`** (canônico: projeção `contain` com *letterbox*, sem esticamento, sem recorte silencioso, sem transformação por camada divergente)
- **Conclusão:** em toda janela testada, a obra aparece inteira, sem esticar e sem cortar.
- **Risco · decisão:** **`RG-1`** · `SD-8` — **Auto:** sim · **Física futura:** **sim** (§28 #2, #6, #7) · **Commit:** `C-A7` · **Rollback:** reverter `C-A7`.

#### `TK-A-033` · `letterbox` — a sobra é moldura inerte, nunca área pintável
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** impedir que a criança pinte fora do espaço lógico e "perca" o traço na próxima janela.
- **Arquivos:** `src/hooks/useViewportProjection.js`, `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js` — **Símbolos/contratos:** `offsetX`, `offsetY`; recorte do alvo de toque ao retângulo lógico.
- **Precondições:** `TK-A-032` — **Depende de:** `TK-A-032`
- **Mudança esperada:** a faixa de sobra é desenhada como moldura e **não recebe traço**; toque na moldura é ignorado ou fixado à borda lógica, de forma determinística e idêntica nos dois motores.
- **Prova:** `TA-4`; §28.1 casos 4 e 5 — **Gate:** **`G-CMP-3`**
- **Conclusão:** tocar na faixa de sobra não cria traço órfão; girar não revela traço "escondido" fora da obra.
- **Risco · decisão:** **`RG-1`** · `SD-8` — **Auto:** parcial · **Física futura:** **sim** (§28 #6, #7) · **Commit:** `C-A8`/`C-A9` · **Rollback:** reverter o *commit* do motor afetado.

#### `TK-A-034` · Espaço lógico **vetorial** (Ateliê) — traços e carimbos em coordenadas lógicas
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** o modelo do Ateliê deixa de depender do tamanho da janela.
- **Arquivos:** `src/components/AtelierCanvas.js` — **Símbolos/contratos:** `strokes`, `stamps`, `bgColor`, `logicalW`, `logicalH`, `exportState`, `loadState`.
- **Precondições:** `TK-A-030`, `TK-A-003` — **Depende de:** `TK-A-030`, `TK-A-003`
- **Mudança esperada:** todo traço e carimbo é armazenado em coordenadas lógicas; a tela é obtida por `toScreen`; nenhum ponto do modelo carrega píxel de dispositivo.
- **Prova:** `TA-5`, §28.1 casos 2 e 3 e adicionais `E2`/`E3` — **Gate:** **`G-CVS-2`** (canônico: o `stateJson` do Ateliê declara `logicalW`/`logicalH`)
- **Conclusão:** compor, girar e voltar reproduz a mesma composição, sem deriva acumulada.
- **Risco · decisão:** **`RG-1` (impacto máximo)** · `SD-8` · `Q2`/`PF6D-D-CANVAS` — **Auto:** parcial · **Física futura:** **sim** (§28 #7, #8) · **Commit:** `C-A8` · **Rollback:** reverter `C-A8`; obras existentes não são regravadas.

#### `TK-A-035` · Espaço lógico ***raster*** (Colorir) — pintura associada ao retângulo do *lineart*
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** a tinta acompanha o desenho, não a janela.
- **Arquivos:** `src/components/ColoringCanvas.js` — **Símbolos/contratos:** `W`, `H`, `imgX`, `imgY`, `imgW`, `imgH`, `exportPaint`, `loadPaint`, `validatePaint`.
- **Precondições:** `TK-A-030`, `TK-A-003` — **Depende de:** `TK-A-030`, `TK-A-003`
- **Mudança esperada:** o *buffer* de pintura é definido no retângulo lógico do *lineart*; a projeção acontece na exibição, nunca no armazenamento.
- **Prova:** `TA-5`, §28.1 casos 1, 2, 3 — **Gate:** `G-CVS-1` (o *buffer* de pintura vive no retângulo lógico e **não** é realocado por `resize()`)
- **Conclusão:** pintar, girar e voltar mantém a tinta **exatamente** sobre as mesmas regiões do desenho.
- **Risco · decisão:** **`RG-1` (impacto máximo)** · `SD-8` — **Auto:** parcial · **Física futura:** **sim** (§28 #6, #7) · **Commit:** `C-A9` · **Rollback:** reverter `C-A9`.

#### `TK-A-036` · Reamostragem determinística do *raster* na mudança de janela
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** eliminar deriva de píxel em rotações repetidas.
- **Arquivos:** `src/components/ColoringCanvas.js` — **Símbolos/contratos:** reamostragem a partir do **modelo lógico**, nunca do *buffer* de tela anterior.
- **Precondições:** `TK-A-035` — **Depende de:** `TK-A-035`
- **Mudança esperada:** cada reprojeção parte do estado lógico canônico; **nenhuma** cadeia de reamostragens sucessivas acumula erro.
- **Prova:** §28.1 caso adicional `E3` (rotação repetida, dez ciclos) — **Gate:** `G-CVS-1`
- **Conclusão:** dez rotações consecutivas não degradam a pintura de forma perceptível.
- **Risco · decisão:** **`RG-1`** · `RG-3` (desempenho) — **Auto:** parcial · **Física futura:** **sim** (§28.1 caso adicional `E3`) · **Commit:** `C-A9` · **Rollback:** reverter `C-A9`.

#### `TK-A-037` · Custo de reprojeção dentro do orçamento de interação
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** a defesa da obra não pode custar fluidez.
- **Arquivos:** `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js` — **Símbolos/contratos:** caminho de reprojeção; medição **antes** de qualquer otimização (regra de performance do `CLAUDE.md`).
- **Precondições:** `TK-A-034`, `TK-A-036` — **Depende de:** `TK-A-034`, `TK-A-036`
- **Mudança esperada:** medir; otimizar **apenas** se houver ganho demonstrado. **Memoização preventiva é proibida.**
- **Prova:** §28 #6, #7 com observação de fluidez — **Gate:** —
- **Conclusão:** rotação com obra complexa não produz travamento perceptível em aparelho real.
- **Risco · decisão:** **`RG-3`** · regra de performance do projeto — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-A8`/`C-A9` · **Rollback:** reverter o *commit* do motor afetado.

#### `TK-A-038` · Portões `G-CVS-1`, `G-CVS-2` e `G-CVS-3` em `scripts/smoke.js`
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** lacrar espaço lógico e ausência de perda silenciosa, na semântica canônica do PLAN §26.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `check`, `codeOf`.
- **Precondições:** `TK-A-034`, `TK-A-035`, `TK-A-085` — **Depende de:** `TK-A-034`, `TK-A-035`, `TK-A-085`
- **Mudança esperada:** três asserções distintas, **uma por portão**: (a) **`G-CVS-1`** — `src/components/ColoringCanvas.js` **não** realoca `qBuf`, `visBuf` nem `paintD` dentro de `resize()`; (b) **`G-CVS-2`** — o `stateJson` do Ateliê declara `logicalW` e `logicalH`; (c) **`G-CVS-3`** (novo, §2.4.1-e) — nenhum caminho de carga abre canvas branco silencioso quando existe obra recuperável.
- **Prova:** `MT-5` (`TK-A-086`), `MT-6` (`TK-A-039`), `MT-13` (`TK-A-040`) — **Gate:** `G-CVS-1`, `G-CVS-2`, `G-CVS-3`
- **Conclusão:** três portões verdes no estado correto; cada um fica vermelho sob o seu mutante **injetado por outra task**.
- **Risco · decisão:** `RG-1` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A12` · **Rollback:** reverter `C-A12`.

#### `TK-A-039` · Mutante `MT-6` — Ateliê volta a gravar coordenadas absolutas de *viewport*
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CVS-2` detecta o retrocesso mais perigoso do motor vetorial.
- **Arquivos:** mutação temporária em `src/components/AtelierCanvas.js` (**nunca commitada**) — **Símbolos/contratos:** `exportState`.
- **Precondições:** `TK-A-038` — **Depende de:** `TK-A-038`
- **Mudança esperada:** **defeito deliberado, único** — `exportState` volta a gravar coordenadas absolutas de *viewport* (píxel de tela) e deixa de declarar `logicalW`/`logicalH`. Esperado: `G-CVS-2` **vermelho** e `TA-5` falhando.
- **Prova:** portão vermelho — **Gate:** `G-CVS-2` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo, registro anexado.
- **Risco · decisão:** `RG-1` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-040` · Mutante `MT-13` — leitor apaga/limpa/substitui por canvas branco
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CMP-1` e `G-CVS-3` protegem a quarta invariante ZERO.
- **Arquivos:** mutação temporária em `src/components/ColoringCanvas.js` (**nunca commitada**) — **Símbolos/contratos:** `loadPaint`, `LOAD_PAINT_INCOMPATIBLE`.
- **Precondições:** `TK-A-038`, `TK-A-046` — **Depende de:** `TK-A-038`, `TK-A-046`
- **Mudança esperada:** **defeito deliberado, único** — ao encontrar incompatibilidade de dimensão o leitor volta a apagar/limpar/substituir por canvas branco silencioso. Esperado: `G-CMP-1` **vermelho** e `G-CVS-3` **vermelho**.
- **Prova:** portão vermelho — **Gate:** `G-CMP-1`, `G-CVS-3` (**têm de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado. Prova independente de `G-CMP-1` (criado por `TK-A-046`, não por esta task).
- **Risco · decisão:** `RG-1` · **invariante ZERO #4** — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

### 3.5 Leitor de compatibilidade — **somente leitura** (`Q8`, regras 1–6)

> **Contrato congelado (`Q8`):** abrir uma obra é **estritamente leitura**. O registro antigo **nunca**
> é reescrito no lugar. Migração silenciosa é **proibida**.

#### `TK-A-041` · Classificar deterministicamente todo *payload* legado conhecido
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** nenhuma obra existente cai em ramo indefinido.
- **Arquivos:** `src/components/ColoringCanvas.js` (`loadPaint`), `src/components/AtelierCanvas.js` (`loadState`) — **Símbolos/contratos:** ramos `d.v===2`, `Array.isArray(d.ops)`, `fmt: 1|2` do ponteiro, ausência de `paintSchemaVersion`/`layoutVersion`.
- **Precondições:** `TK-A-002` — **Depende de:** `TK-A-002`
- **Mudança esperada:** classificação **exaustiva e determinística**: cada combinação conhecida mapeia para exatamente um ramo; o desconhecido cai em ramo explícito de incompatibilidade **com registro**, nunca em canvas branco silencioso.
- **Prova:** `TA-12`; §28.1 casos 10–15 — **Gate:** `G-CMP-1`
- **Conclusão:** o arnês percorre todas as formas legadas conhecidas e nenhuma cai em ramo indefinido.
- **Risco · decisão:** **`RG-1`** · **`RG-12`** · `Q8` r.1–3 — **Auto:** sim · **Física futura:** **sim** (§28.1 casos 14, 15) · **Commit:** `C-A10` · **Rollback:** reverter `C-A10`.

#### `TK-A-042` · Abrir obra **não grava nada** — leitura pura verificável
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** materializar a regra 1 de `Q8` como propriedade observável.
- **Arquivos:** `src/screens/ColoringScreen.js`, `src/screens/AtelierCanvasScreen.js` — **Símbolos/contratos:** caminho de abertura; ausência de escrita em `drawingStorage`/`atelierStorage` durante a carga.
- **Precondições:** `TK-A-041` — **Depende de:** `TK-A-041`
- **Mudança esperada:** nenhuma escrita é disparada pela abertura — nem "normalização", nem "reparo", nem carimbo de versão.
- **Prova:** `TA-12`, `CN-8` — **Gate:** `G-CMP-2`
- **Conclusão:** abrir uma obra legada e sair sem tocar deixa o registro **byte-idêntico**.
- **Risco · decisão:** **`RG-1`** · `Q8` r.1 · **invariante ZERO #3** — **Auto:** sim · **Física futura:** **sim** (§28.1 caso 11) · **Commit:** `C-A10` · **Rollback:** reverter `C-A10`.

#### `TK-A-043` · Proibir migração silenciosa em massa
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** impedir que a Fase 6 varra a galeria reescrevendo obras.
- **Arquivos:** `src/services/storageMigrationService.js` (**verificação — intocado**), `src/services/drawingStorage.js` (**verificação**) — **Símbolos/contratos:** escada de migração; ausência de degrau novo.
- **Precondições:** `TK-A-005`, `TK-A-042` — **Depende de:** `TK-A-005`, `TK-A-042`
- **Mudança esperada:** **nenhuma** — asserção de ausência: nenhum caminho novo itera a galeria para converter obras.
- **Prova:** **`CN-13`** (novo · §2.4.1-d — "nenhuma migração silenciosa em massa"); `G-VER-2` — **Gate:** `G-CMP-2`, `G-VER-2`
- **Conclusão:** o `git diff` da migração é vazio e nenhum código novo percorre a galeria gravando.
- **Risco · decisão:** **`RG-1`** · `Q8` r.2 · **invariante ZERO #3** — **Auto:** sim · **Física futura:** **sim** (§28.1 caso 16) · **Commit:** `C-A10` · **Rollback:** não aplicável (não-alteração).

#### `TK-A-044` · Falha de leitura **preserva** o registro original
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** erro de leitura nunca vira dano.
- **Arquivos:** `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js`, `src/screens/ColoringScreen.js` — **Símbolos/contratos:** ramo de erro de `loadPaint`/`loadState`.
- **Precondições:** `TK-A-041` — **Depende de:** `TK-A-041`
- **Mudança esperada:** no ramo de falha, o registro original permanece intacto e o estado é reportado; **nada é apagado, truncado ou substituído**.
- **Prova:** `TA-12`; §28.1 caso 15 — **Gate:** `G-CMP-2`
- **Conclusão:** injetar payload corrompido no arnês não produz nenhuma escrita destrutiva.
- **Risco · decisão:** **`RG-1`** · `Q8` r.4 — **Auto:** sim · **Física futura:** **sim** (§28.1 caso 15) · **Commit:** `C-A10` · **Rollback:** reverter `C-A10`.

#### `TK-A-045` · Obra irrecuperável é comunicada, nunca apresentada como tela em branco
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** fechar a quarta invariante ZERO no comportamento visível à criança.
- **Arquivos:** `src/screens/ColoringScreen.js`, `src/screens/AtelierCanvasScreen.js` — **Símbolos/contratos:** estado de incompatibilidade; mensagem adequada ao público infantil.
- **Precondições:** `TK-A-044` — **Depende de:** `TK-A-044`
- **Mudança esperada:** a superfície entra num estado explícito de "não consegui abrir esta obra" **preservando o arquivo**, em vez de abrir canvas branco como se a obra não existisse.
- **Prova:** §28.1 caso 15 (adicional `E5`); validação visual — **Gate:** **`G-CVS-3`** (novo · §2.4.1-e), `G-CMP-1`
- **Conclusão:** captura mostra o estado explícito; o arquivo continua no disco.
- **Risco · decisão:** **`RG-1`** · **invariante ZERO #4** · linguagem infantil (Princípio I) — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-A10` · **Rollback:** reverter `C-A10`.

#### `TK-A-046` · Arnês de compatibilidade `TA-12` — corpus de payloads legados
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** exercitar o leitor contra todas as formas conhecidas, sem depender de aparelho.
- **Arquivos:** `scripts/testing/artworkVersionHarness.js` (estendido por `TK-A-006`) — **Símbolos/contratos:** `TA-12`; corpus sintético cobrindo `fmt:1`, `fmt:2`, `v:2`, `ops[]`, ausência de eixos, payload truncado.
- **Precondições:** `TK-A-041`..`TK-A-045` — **Depende de:** `TK-A-041`..`TK-A-045`
- **Mudança esperada:** corpus versionado no arnês; cada entrada declara o ramo esperado. **Esta task cria `G-CMP-1` e `G-CMP-2`** — ela **não** os prova.
- **Prova:** **prova independente** — `G-CMP-1` fica vermelho sob `MT-13` (`TK-A-040`); `G-CMP-2` fica vermelho sob `MT-17` (`TK-A-047`). Nenhum portão prova a si próprio. — **Gate:** `G-CMP-1`, `G-CMP-2`
- **Conclusão:** arnês sai com código `0` e cobre cada forma legada listada em §28.1.
- **Risco · decisão:** `RG-12` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A10` · **Rollback:** reverter `C-A10`.

#### `TK-A-047` · Mutante `MT-17` — abrir obra volta a converter e regravar
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CMP-2` impede a migração silenciosa.
- **Arquivos:** mutação temporária no caminho de abertura (**nunca commitada**) — **Símbolos/contratos:** `loadPaint` + escrita.
- **Precondições:** `TK-A-046` — **Depende de:** `TK-A-046`
- **Mudança esperada:** **defeito deliberado, único** — abrir passa a regravar em formato novo. Esperado: `G-CMP-2` **vermelho** e `TA-12` falhando.
- **Prova:** portão vermelho — **Gate:** `G-CMP-2` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `RG-1` · `Q8` r.1–2 — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

### 3.6 *Write-forward* e proteção do *lineart* (`Q8`, regras 7–10)

#### `TK-A-048` · Gravação em formato novo é **write-forward** isolado
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** só grava quem a criança mandou gravar, e o formato antigo nunca é destruído.
- **Arquivos:** `src/components/ColoringCanvas.js` (`exportPaint`), `src/components/AtelierCanvas.js` (`exportState`), `src/services/drawingStorage.js` (**apenas como consumidor existente**) — **Símbolos/contratos:** `paintSchemaVersion`, `layoutVersion`, `v: 2` congelado.
- **Precondições:** `TK-A-003`, `TK-A-042` — **Depende de:** `TK-A-003`, `TK-A-042`
- **Mudança esperada:** a gravação nova acontece **somente** por ação deliberada de salvar; o registro anterior não é sobrescrito no lugar como efeito colateral da leitura.
- **Prova:** `TA-13`; §28.1 casos 11 e 12 — **Gate:** **`G-CMP-4`** (canônico: promoção só após validar integridade e provar releitura)
- **Conclusão:** abrir obra legada, pintar e salvar produz registro novo **sem destruir** o anterior.
- **Risco · decisão:** **`RG-1` (impacto máximo)** · `Q8` r.7 · **invariante ZERO #3** — **Auto:** sim · **Física futura:** **sim** (§28.1 casos 12, 13) · **Commit:** `C-A11` · **Rollback:** reverter `C-A11`; nada previamente gravado é afetado.

#### `TK-A-049` · Releitura de validação **antes** da promoção — **REESCRITA** após `TK-A-096`

> **Reescrita documental autorizada pelo fundador** na sessão de execução de `C-A11`/`C-GOV1`, depois
> que `TK-A-096` provou **falsa a premissa** sobre a qual a redação anterior fora escrita. A correção
> é de **verdade documental e de escopo** — **não** é mudança oportunista de requisito. `Q8` regra 8
> permanece **intacta e igualmente exigente**; nenhuma garantia foi afrouxada. O que muda é **onde** a
> regra incide, porque a arquitetura real do repositório não é a que a redação anterior supunha.
>
> **Redação anterior — preservada como registro histórico, não como contrato vigente:**
>
> > *"**Arquivos:** `src/services/drawingStorage.js` (**consumidor**), `src/components/ColoringCanvas.js`,
> > `src/components/AtelierCanvas.js` — **ponto de promoção já congelado documentalmente por `TK-A-096`**
> > (emenda `A-22`; a incerteza anterior deixa de existir). **Mudança esperada:** a promoção do registro
> > novo é condicionada a uma releitura bem-sucedida e validada; falha na releitura ⇒ o antigo permanece
> > vigente. **A alteração incide exatamente no ponto de promoção congelado por `TK-A-096`.**"*
>
> **Por que essa redação estava incorreta.** Ela pressupunha **um** ponto de promoção, no singular, e
> mandava alterá-lo. `TK-A-096` (registro completo em §11.16) leu a cadeia com `arquivo:linha` e
> encontrou o oposto da premissa: **três cadeias de salvamento e quatro pontos de promoção**, que
> **divergem entre si**. E, decisivamente: o escritor que a redação anterior nomeia —
> `drawingStorage.saveDrawingState` — **não tem chamador de *runtime*** (`TA-13`, caso 13.7), enquanto
> o caminho que a criança de fato percorre no Colorir — `coloring60DrawingStorage.js` — **já implementa
> a cadeia inteira** de `Q8` r.7–9. Cumprir a redação anterior ao pé da letra significaria escrever
> cerimônia de *write-forward* dentro de um **escritor morto**, apenas para que o código coubesse no
> texto da task — exatamente a inversão que o `CLAUDE.md` proíbe (*"não alterar runtime apenas para
> satisfazer teste ou documentação incorretos"*). A descoberta **voltou aos artefatos**, como a própria
> `TK-A-096` já previa em sua **Conclusão**: *"se a leitura revelar que não existe ponto único de
> promoção, isso é registrado e `TK-A-049` é reescrita antes de ser executada"*.

- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** nunca promover um registro que não se prova legível. Como o **único** ponto de promoção **vivo** já satisfaz `Q8` r.7–9, o objetivo executável desta task passa a ser **verificar** essa propriedade com evidência e **congelá-la contra regressão** — e **não** reescrever escritores que ninguém executa.
- **Arquivos:** **verificação, sem alteração de *runtime*** — `src/services/coloring60DrawingStorage.js` (**cadeia viva do Colorir**, `INTOCADO`), `src/services/drawingStorage.js` (**escritor sem chamador; o LEITOR do mesmo módulo segue vivo no Livrinho**, `INTOCADO`), `src/services/atelierStorage.js` (**terceira cadeia — pendência registrada em §11.16-c, destino `F12A`**, `INTOCADO`) — **Símbolos/contratos:** gravar no slot inativo → **reler** → **confirmar identidade/URI/revisão** → promover → **só então** descartar o anterior; *rollback* na divergência.
- **Precondições:** `TK-A-048`, **`TK-A-096`** — **Depende de:** `TK-A-048`, **`TK-A-096`**
- **Mudança esperada:** **nenhuma alteração de *runtime* nos três armazenamentos.** A task se resolve como **verificação** da cadeia real: `coloring60DrawingStorage.js:581` (promoção), `:591` (releitura), `:596` (`confirmPromotion` — identidade, URI e revisão), `:599` (`rollbackFailedPromotion` na divergência), `:613` (descarte do blob anterior, com `protect`). Falha ou divergência em qualquer etapa ⇒ **o antigo permanece vigente**.
- **Prova:** `TA-13` (11 casos — a metade **estática** fixa a **SEQUÊNCIA**, que nenhum teste comportamental fixa) **+** os **30 cenários `S3`** do `smoke`, que executam o **writer real** contra `AsyncStorage` e disco duplos — **Gate:** **`G-CMP-4`**
- **Prova vermelha independente:** `MT-14` (`TK-A-054`) — promover **antes** de validar a releitura ⇒ **11 vermelhos**, derrubando as **duas** metades (`G-CMP-4` estático **e** `S3 [04/30]` comportamental).
- **Conclusão:** simular falha de releitura no arnês mantém o registro antigo como vigente, **no caminho que a criança realmente percorre** — e a sequência está lacrada contra reordenação.
- **Risco · decisão:** **`RG-1`** · `Q8` r.8 — **Auto:** sim · **Física futura:** **sim** (§28.1 caso 13) · **Commit:** `C-A11` (verificação) **+** `C-GOV1` (esta reescrita) · **Rollback:** **não aplicável a *runtime*** — nenhum dos três armazenamentos foi alterado.

#### `TK-A-050` · Rollback determinístico de gravação interrompida
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** interrupção (fechar o app, bateria, término de processo) nunca deixa obra meio gravada vigente.
- **Arquivos:** `src/services/drawingStorage.js` (**consumidor**), `src/services/fileBlobStore.js` (**verificação**) — **Símbolos/contratos:** gravação em destino temporário + promoção atômica.
- **Precondições:** `TK-A-049` — **Depende de:** `TK-A-049`
- **Mudança esperada:** o caminho de gravação nova é reversível de forma determinística; um registro parcialmente escrito **nunca** é o vigente.
- **Prova:** `TA-13`; §28.1 caso 13 — **Gate:** **`G-CMP-4`**
- **Conclusão:** interromper a gravação no arnês deixa exatamente o registro anterior vigente.
- **Risco · decisão:** **`RG-1`** · `Q8` r.9 — **Auto:** sim · **Física futura:** **sim** (§28.1 caso 13) · **Commit:** `C-A11` · **Rollback:** reverter `C-A11`.

#### `TK-A-051` · Proteção dos ***linearts*** históricos — identidade estável do desenho
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** garantir a segunda invariante ZERO — a tinta **nunca** é associada ao *lineart* errado.
- **Arquivos:** `src/components/ColoringCanvas.js`, `src/screens/ColoringScreen.js`, `src/services/drawingStorage.js` (**verificação da chave**) — **Símbolos/contratos:** identificador do *lineart* gravado junto do payload; `imgX/imgY/imgW/imgH`.
- **Precondições:** `TK-A-035`, `TK-A-048` — **Depende de:** `TK-A-035`, `TK-A-048`
- **Mudança esperada:** o payload carrega e verifica a identidade do *lineart* na abertura; divergência ⇒ ramo explícito de incompatibilidade, **nunca** exibição de tinta sobre desenho errado.
- **Prova:** `TA-12`; §28.1 caso adicional `E4` — **Gate:** **`G-CMP-6`** (novo · §2.4.1-e — identidade do *lineart* verificada na abertura)
- **Conclusão:** associar propositalmente payload a outro *lineart* no arnês produz recusa explícita.
- **Risco · decisão:** **`RG-1`** · `Q8` r.10 · **invariante ZERO #2** · **área protegida:** `assets` **não** são tocados — **Auto:** sim · **Física futura:** **sim** (§28.1 caso 10) · **Commit:** `C-A11` · **Rollback:** reverter `C-A11`.

#### `TK-A-052` · *Lineart* histórico **não é reprocessado, redimensionado nem substituído**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** a compatibilidade não pode alterar o acervo.
- **Arquivos:** `assets/` (**somente verificação — proibido alterar**) — **Símbolos/contratos:** manifestos de cenas; `git diff` vazio em `assets/`.
- **Precondições:** `TK-A-051` — **Depende de:** `TK-A-051`
- **Mudança esperada:** **nenhuma** — asserção de ausência de alteração em `assets/`, conforme área protegida do `AGENTS.md`.
- **Prova:** **`CN-8`** (canônico — áreas protegidas por *commit*, ver `TK-A-099`); `git diff --name-only` sem nenhum caminho em `assets/` — **Gate:** **`G-CMP-5`**
- **Conclusão:** nenhum *asset* aparece em nenhum *commit* de `F6-R3`.
- **Risco · decisão:** **área protegida (`assets`)** · `Q8` r.10 — **Auto:** sim · **Física futura:** não · **Commit:** nenhum (verificação) · **Rollback:** não aplicável.

#### `TK-A-053` · Arnês `TA-13` — *write-forward*, releitura e rollback
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar as regras 7–9 de `Q8` sem aparelho.
- **Arquivos:** `scripts/testing/artworkVersionHarness.js` (estendido) — **Símbolos/contratos:** `TA-13`.
- **Precondições:** `TK-A-050` — **Depende de:** `TK-A-050`
- **Mudança esperada:** cenários de gravação bem-sucedida, releitura falha e interrupção, cada um com o vigente esperado declarado. **Esta task cria `G-CMP-4`** — ela **não** o prova.
- **Prova:** **prova independente** — `G-CMP-4` fica vermelho sob `MT-14` (`TK-A-054`) — **Gate:** **`G-CMP-4`**
- **Conclusão:** arnês sai com código `0`; cada cenário termina com o registro vigente correto.
- **Risco · decisão:** `RG-12` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A11` · **Rollback:** reverter `C-A11`.

#### `TK-A-054` · Mutante `MT-14` — promoção **sem** releitura de validação
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CMP-4` protege a promoção.
- **Arquivos:** mutação temporária no caminho de gravação (**nunca commitada**) — **Símbolos/contratos:** promoção direta.
- **Precondições:** `TK-A-053` — **Depende de:** `TK-A-053`
- **Mudança esperada:** **defeito deliberado, único** — promover a nova representação **antes** de validar a releitura. Esperado: `G-CMP-4` **vermelho**, `TA-13` falhando, casos 12 e 13 da matriz `FAIL`.
- **Prova:** portão vermelho — **Gate:** `G-CMP-4` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `RG-1` · `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-055` · Mutante `MT-18` — payload aceito sem verificar a identidade do *lineart*
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CMP-6` protege a invariante ZERO #2.
- **Arquivos:** mutação temporária em `src/components/ColoringCanvas.js` (**nunca commitada**) — **Símbolos/contratos:** verificação de identidade removida.
- **Precondições:** `TK-A-056` — **Depende de:** `TK-A-056`
- **Mudança esperada:** **defeito deliberado, único** — aceitar qualquer payload sem conferir o identificador do *lineart*. Esperado: `G-CMP-6` **vermelho**.
- **Prova:** portão vermelho — **Gate:** `G-CMP-6` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `RG-1` · **invariante ZERO #2** — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-056` · Portões `G-CMP-5` e `G-CMP-6` em `scripts/smoke.js`
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** lacrar a proteção do *lineart* histórico na semântica canônica do PLAN §26.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `check`, `codeOf`; inventário de chamadas de escrita e de limpeza nos dois motores.
- **Precondições:** `TK-A-048`..`TK-A-052` — **Depende de:** `TK-A-048`..`TK-A-052`
- **Mudança esperada:** duas asserções distintas: (a) **`G-CMP-5`** (canônico) — o caminho de limpeza/*reset* **não** remove *lineart* histórico enquanto houver obra que dependa dele; (b) **`G-CMP-6`** (novo) — o caminho de abertura verifica a identidade do *lineart* antes de compor a tinta.
- **Prova:** **prova independente** — `G-CMP-5` fica vermelho sob `MT-34` (`TK-A-092`); `G-CMP-6` fica vermelho sob `MT-18` (`TK-A-055`) — **Gate:** `G-CMP-5`, `G-CMP-6`
- **Conclusão:** `npm run smoke` verde no estado correto; cada portão vermelho sob o seu mutante, injetado por outra task.
- **Risco · decisão:** `RG-1` · `Q8` r.10 — **Auto:** sim · **Física futura:** não · **Commit:** `C-A12` · **Rollback:** reverter `C-A12`.

### 3.7 Fronteira documental de `F6-R3.6`

#### `TK-A-057` · `F6-R3.6` — só a porção de `P-164` que a Fase 6 autoriza
- **Pacote · Subportão:** `F6-R3.6` · `F6-SG-A` — **Objetivo:** impedir que a instrumentação vire investigação aberta de `P-164`.
- **Arquivos:** artefatos documentais da Fase 6 (**nenhum arquivo de *runtime***) — **Símbolos/contratos:** fronteira `F6-R3.6`; `FD-12`.
- **Precondições:** `TK-A-014` — **Depende de:** `TK-A-014`
- **Mudança esperada:** registro explícito de que `P-164` **permanece aberta** e **não é rebaixada** pela Fase 6; a Fase 6 entrega **defesa + instrumentação**, não diagnóstico fechado.
- **Prova:** revisão documental — **Gate:** —
- **Conclusão:** nenhum artefato afirma que `P-164` foi resolvida; `P-152` e `P-164` continuam registradas.
- **Risco · decisão:** `RG-8` · `FD-12` · decisão do fundador (`P-152`/`P-164` não são apagadas nem rebaixadas) — **Auto:** não · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** reverter `C-GOV1`.

### 3.8 Emenda pós-`Analyze` — tasks acrescentadas ao `BLOCO 1`

> **Aviso de ordenação:** o **número** da task **não** é a ordem de execução. A ordem executável é a do
> grafo `Depende de` (§10.2). Várias tasks desta subseção são **precondições** de tasks de numeração
> menor — em particular `TK-A-085` precede `TK-A-038`, `TK-A-096` precede `TK-A-049` e `TK-A-094`
> precede tudo o mais de `F6-R3`.

#### `TK-A-085` · `resize()` de `ColoringCanvas.js` **não** realoca `qBuf`, `visBuf` nem `paintD` (`SD-8`)
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** eliminar a realocação de *buffers* dentro de `resize()`, que hoje é o caminho mais curto para corromper o balde e desalinhar a tinta já feita pela criança.
- **Arquivos:** `src/components/ColoringCanvas.js` — **Símbolos/contratos:** `resize()`, `qBuf`, `visBuf`, `paintD`, `W`, `H`.
- **Precondições:** `TK-A-030`, `TK-A-035` — **Depende de:** `TK-A-030`, `TK-A-035`
- **Mudança esperada:** `resize()` passa a **apenas reprojetar a exibição**. Os *buffers* de estado (`qBuf` fila de preenchimento, `visBuf` visitados, `paintD` dados de pintura) são dimensionados pelo **retângulo lógico** e **não** são realocados, zerados nem substituídos quando a janela muda. Se o retângulo lógico realmente mudar, a transição é explícita e reamostra a partir do modelo lógico (`TK-A-036`) — nunca uma realocação silenciosa dentro de `resize()`.
- **Prova:** `TA-4`, `TA-5`; §28.1 casos 2, 3, 4, 5 — **Gate:** `G-CVS-1` (criado por `TK-A-038`)
- **Conclusão:** girar, dividir a tela e voltar preserva a pintura **bit a bit** no espaço lógico; nenhuma chamada de alocação dos três *buffers* permanece dentro de `resize()`.
- **Risco · decisão:** **`RG-1` (impacto máximo)** · **`SD-8`** · **invariante ZERO #1** — **Auto:** parcial · **Física futura:** **sim** (§28 #6, #7) · **Commit:** `C-A9` · **Rollback:** reverter `C-A9`.

#### `TK-A-086` · Mutante `MT-5` — realocar `paintD`/`qBuf`/`visBuf` dentro de `resize()`
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CVS-1` detecta a corrupção canônica descrita no PLAN §25.
- **Arquivos:** mutação temporária em `src/components/ColoringCanvas.js` (**nunca commitada**) — **Símbolos/contratos:** `resize()`.
- **Precondições:** `TK-A-038` — **Depende de:** `TK-A-038`
- **Mudança esperada:** **defeito deliberado, único** — reintroduzir a realocação dos três *buffers* dentro de `resize()`. Esperado: `G-CVS-1` **vermelho**, `TA-4`/`TA-5` falhando.
- **Prova:** portão vermelho — **Gate:** `G-CVS-1` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo, registro anexado.
- **Risco · decisão:** `RG-1` · `SD-8` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-087` · Mutante `MT-26` — remover `useSurfaceLifecycle` de `ColoringScreen.js`
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** prova **independente** de `G-LFC-2` (criado por `TK-A-015`).
- **Arquivos:** mutação temporária em `src/screens/ColoringScreen.js` (**nunca commitada**) — **Símbolos/contratos:** `useSurfaceLifecycle`.
- **Precondições:** `TK-A-015` — **Depende de:** `TK-A-015`
- **Mudança esperada:** **defeito deliberado, único** — a tela de colorir deixa de consumir o *hook* de ciclo de vida. Esperado: `G-LFC-2` **vermelho**.
- **Prova:** portão vermelho — **Gate:** `G-LFC-2` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo, registro anexado.
- **Risco · decisão:** `P-164` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-088` · Mutante `MT-27` — remover `onRenderProcessGone` de `ColoringCanvas.js`
- **Pacote · Subportão:** `F6-R3.4` · `F6-SG-A` — **Objetivo:** prova **independente** de `G-LFC-3` (criado por `TK-A-015`).
- **Arquivos:** mutação temporária em `src/components/ColoringCanvas.js` (**nunca commitada**) — **Símbolos/contratos:** `onRenderProcessGone`.
- **Precondições:** `TK-A-015` — **Depende de:** `TK-A-015`
- **Mudança esperada:** **defeito deliberado, único** — remover a prop de término de processo de Android. Esperado: `G-LFC-3` **vermelho**.
- **Prova:** portão vermelho — **Gate:** `G-LFC-3` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `P-164` · `FD-12` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-089` · Mutante `MT-28` — alterar `POINTER_VERSION` / acrescentar degrau na escada
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** prova **independente** de `G-VER-2` (criado por `TK-A-007`).
- **Arquivos:** mutação temporária em `src/services/drawingStorage.js` **ou** `src/services/storageMigrationService.js` (**nunca commitada**) — **Símbolos/contratos:** `POINTER_VERSION`, escada de migração.
- **Precondições:** `TK-A-007` — **Depende de:** `TK-A-007`
- **Mudança esperada:** **defeito deliberado, único** — `POINTER_VERSION` passa a `4` **ou** a escada de migração ganha um degrau. Esperado: `G-VER-2` **vermelho**.
- **Prova:** portão vermelho — **Gate:** `G-VER-2` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado. **O envelope de armazenamento nunca é alterado em *commit* algum.**
- **Risco · decisão:** `RG-11` · **área protegida (persistência)** — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-090` · Mutante `MT-29` — inferir `layoutVersion` a partir de `paintSchemaVersion`
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** prova **independente** de `G-VER-3` (criado por `TK-A-007`).
- **Arquivos:** mutação temporária no *reader*/*validator* (**nunca commitada**) — **Símbolos/contratos:** `paintSchemaVersion`, `layoutVersion`.
- **Precondições:** `TK-A-007` — **Depende de:** `TK-A-007`
- **Mudança esperada:** **defeito deliberado, único** — um eixo passa a ser inferido do outro, violando a regra 5 de §11.5. Esperado: `G-VER-3` **vermelho** e `TA-11` falhando.
- **Prova:** portão vermelho — **Gate:** `G-VER-3` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `RG-11` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-091` · Mutante `MT-33` — projeção volta a esticar (`cover`) ou a transformar camadas divergentes
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** prova **independente** de `G-CMP-3` (criado por `TK-A-032`/`TK-A-033`).
- **Arquivos:** mutação temporária em `src/hooks/useViewportProjection.js` (**nunca commitada**) — **Símbolos/contratos:** `scale`, `scaleX`/`scaleY`.
- **Precondições:** `TK-A-033` — **Depende de:** `TK-A-033`
- **Mudança esperada:** **defeito deliberado, único** — `scale` deixa de ser isotrópico (`Math.max` em vez de `Math.min`, ou `scaleX ≠ scaleY`). Esperado: `G-CMP-3` **vermelho** e `TA-4` falhando.
- **Prova:** portão vermelho — **Gate:** `G-CMP-3` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `RG-1` · `Q8` r.5 — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-092` · Mutante `MT-34` — limpeza remove *lineart* histórico ainda referenciado
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** prova **independente** de `G-CMP-5` (criado por `TK-A-056`).
- **Arquivos:** mutação temporária no caminho de limpeza/*reset* (**nunca commitada**) — **Símbolos/contratos:** remoção de *lineart* sem verificar dependência.
- **Precondições:** `TK-A-056` — **Depende de:** `TK-A-056`
- **Mudança esperada:** **defeito deliberado, único** — o caminho de limpeza passa a remover *lineart* histórico mesmo havendo obra que dependa dele. Esperado: `G-CMP-5` **vermelho**.
- **Prova:** portão vermelho — **Gate:** `G-CMP-5` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado. **Nenhum *asset* real é tocado** — a mutação incide no código, não no acervo.
- **Risco · decisão:** `RG-1` · `Q8` r.10 · **área protegida (`assets`)** — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-093` · Mutante `MT-1` — recolocar o efeito de largura que repõe `didInitScroll`
- **Pacote · Subportão:** `F6-R3.1` · `F6-SG-A` — **Objetivo:** prova **independente** de `G-LFC-1` (criado por `TK-A-021`).
- **Arquivos:** mutação temporária em `src/screens/AdventureMapScreen.js` (**nunca commitada**) — **Símbolos/contratos:** `useEffect(() => { didInitScroll.current = false; }, [mapWidth])`.
- **Precondições:** `TK-A-021` — **Depende de:** `TK-A-021`
- **Mudança esperada:** **defeito deliberado, único** — reintroduzir literalmente o efeito de `:367`. Esperado: `G-LFC-1` **vermelho** e o cenário físico §28 #1-2 regredindo.
- **Prova:** portão vermelho — **Gate:** `G-LFC-1` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo, registro anexado.
- **Risco · decisão:** `P-152` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-094` · Portão estático **antecipado** de `SD-11` — ativo já em `F6-R3` (emenda `A-14`)
- **Pacote · Subportão:** `F6-R3` (transversal) · `F6-SG-A` — **Objetivo:** proteger **desde o primeiro pacote** contra a reintrodução dos quatro retrocessos estruturais, em vez de esperar `F6-R1`.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `check`, `codeOf`, `readSrc`.
- **Precondições:** Portão 3 concedido — **Depende de:** — (**primeira task executável de `F6-R3`, junto de `TK-A-001`**)
- **Mudança esperada:** quatro asserções estáticas ativadas já em `F6-R3` e mantidas verdes em **todos** os pacotes: (a) **`G-RSP-1`** — zero `Dimensions.get` em `src/` (`SD-11`, hoje já zero: a asserção **congela** o estado atual); (b) **`G-RSP-3`** — zero `Platform.isPad` e zero `expo-device` decidindo *layout* (`D2`); (c) **`G-RSP-7`** (novo · §2.4.1-e) — nenhum *breakpoint* paralelo: o conjunto permanece com exatamente **três** valores derivados de `src/theme/breakpoints.js`; (d) **`G-BP-1`** — **preservado como está**: zero literais `768` (`P-30`, herdado do B1 — **proibido regredir**).
- **Prova:** `TA-6`, `TA-7`, `CN-7`; **prova independente** — `G-RSP-1` fica vermelho sob `MT-7` (`TK-A-095` em `SG-A`; reconfirmado por `TK-C-047` em `SG-C`); `G-RSP-3` sob `MT-31` (`TK-C-058`); `G-RSP-7` sob `MT-21` (`TK-C-055`); `G-BP-1` sob `MT-11` (`TK-C-051`) — **Gate:** `G-RSP-1`, `G-RSP-3`, `G-RSP-7`, `G-BP-1`
- **Conclusão:** `npm run smoke` verde com os quatro portões ativos **antes** de qualquer alteração de `F6-R3`; `TK-C-002` e `TK-C-060` apenas **confirmam e estendem**, não criam do zero.
- **Risco · decisão:** **`SD-11`** · `D2` · `P-30` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A1` · **Rollback:** reverter `C-A1`.

#### `TK-A-095` · Mutante `MT-7` — verificação **imediata** do portão antecipado
- **Pacote · Subportão:** `F6-R3` (transversal) · `F6-SG-A` — **Objetivo:** provar que o portão antecipado de `TK-A-094` **tem dentes desde `F6-R3`**, e não apenas em `F6-SG-C`.
- **Arquivos:** mutação temporária em qualquer módulo de `src/` (**nunca commitada**) — **Símbolos/contratos:** `Dimensions.get`.
- **Precondições:** `TK-A-094` — **Depende de:** `TK-A-094`
- **Mudança esperada:** **defeito deliberado, único** — reintroduzir uma chamada a `Dimensions.get`. Esperado: `G-RSP-1` **vermelho** e `TA-6` falhando.
- **Prova:** portão vermelho — **Gate:** `G-RSP-1` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo, registro anexado. **`MT-7` é reinjetado formalmente em `F6-SG-C` por `TK-C-047`, com o mesmo significado** — o ID não muda de sentido.
- **Risco · decisão:** `SD-11` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-096` · Leitura dirigida — localizar e **congelar** o ponto exato de promoção (emenda `A-22`)
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** eliminar a incerteza que `TK-A-049` carregava, **antes** de escrever qualquer linha de promoção. Substitui suposição por leitura provada.
- **Arquivos:** **leitura apenas** — `src/services/drawingStorage.js`, `src/services/fileBlobStore.js`, `src/services/atelierStorage.js`, `src/screens/ColoringScreen.js`, `src/screens/AtelierCanvasScreen.js`, `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js` — **Símbolos/contratos:** cadeia real `salvar → escrever blob → gravar ponteiro → tornar vigente`.
- **Precondições:** `TK-A-005` — **Depende de:** `TK-A-005`
- **Mudança esperada:** **nenhuma alteração de *runtime***. A task produz um registro documental que congela, com `arquivo:linha`: (1) onde o blob é escrito; (2) onde o ponteiro é gravado; (3) **qual instrução exata** torna a nova representação vigente (o "ponto de promoção"); (4) o que hoje acontece se essa instrução falhar; (5) se há mais de um ponto de promoção (Colorir × Ateliê) e se eles divergem.
- **Prova:** revisão documental com citação de `arquivo:linha` verificável — **Gate:** — (habilita `G-CMP-4`)
- **Conclusão:** o ponto de promoção está identificado sem ambiguidade e `TK-A-049` deixa de conter incerteza. **Se a leitura revelar que não existe ponto único de promoção, isso é registrado e `TK-A-049` é reescrita antes de ser executada** — a descoberta volta aos artefatos, conforme a regra do `CLAUDE.md`.
- **Risco · decisão:** **`RG-13`** · `Q8` r.8 — **Auto:** não (leitura) · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável (não altera *runtime*).

#### `TK-A-097` · Cenário físico §28 **#7** — abrir desenho salvo **antes** da mudança e continuar
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** executar o cenário físico canônico onde a regressão de `Q8` aparece primeiro, com **acervo real**, não sintético.
- **Arquivos:** nenhum (**validação física**) — **Símbolos/contratos:** obra criada em *build* anterior à Fase 6.
- **Precondições:** `TK-A-056`, `TK-A-085` — **Depende de:** `TK-A-056`, `TK-A-085`
- **Mudança esperada:** **nenhuma** — execução do roteiro: abrir uma obra salva **antes** da mudança, continuar pintando, salvar, reabrir. Registro com captura antes/depois.
- **Prova:** **`CN-3`** (canônico — desenho sem mudança de janela continua carregando exatamente como hoje); §28 #7 — **Gate:** `G-CMP-1`, `G-CMP-2`, `G-CMP-4`
- **Conclusão:** a obra abre com a pintura presente e alinhada; continuar e salvar não destrói o registro anterior; as quatro invariantes ZERO satisfeitas neste cenário.
- **Risco · decisão:** **`RG-1` (impacto máximo)** · **`SD-8`** — **Auto:** não · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-098` · Cenário físico §28 **#17** — regressão completa em **telefone** (parcela de `F6-SG-A`)
- **Pacote · Subportão:** `F6-R3` · `F6-SG-A` — **Objetivo:** cumprir a parcela de `SG-A` do cenário #17, que é declarado no PLAN como pertencente a `SG-A`, `SG-B` **e** `SG-C`.
- **Arquivos:** nenhum (**validação física**) — **Símbolos/contratos:** telefone em retrato, faixa compacta.
- **Precondições:** `TK-A-058`..`TK-A-062` — **Depende de:** `TK-A-058`..`TK-A-062`
- **Mudança esperada:** **nenhuma** — percorrer mapa, história, Colorir, Ateliê, galeria e jogos em telefone, comparando com o comportamento anterior a `F6-R3`.
- **Prova:** **`CN-1`** (canônico — telefone em retrato **não muda em nada**); §28 #17 — **Gate:** —
- **Conclusão:** nenhuma diferença perceptível em telefone atribuível a `F6-R3`; capturas anexadas.
- **Risco · decisão:** `RG-5` · `CN-1` — **Auto:** não · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-099` · `CN-8` em `F6-R3` — áreas protegidas verificadas **em cada *commit***
- **Pacote · Subportão:** `F6-R3` (transversal) · `F6-SG-A` — **Objetivo:** restaurar o controle negativo canônico do PLAN §24 na sua forma verificável: **nenhum *asset*, manifesto, história, conquista ou regra de acesso foi tocado**.
- **Arquivos:** nenhum de *runtime* — **verificação de índice** — **Símbolos/contratos:** `git diff --cached --name-only` antes de **cada** *commit* `C-A1`..`C-A12`.
- **Precondições:** — — **Depende de:** — (**executada antes de cada *commit* do bloco**)
- **Mudança esperada:** **nenhuma** — para cada *commit* do `BLOCO 1`, registrar a saída de `git diff --cached --name-only` e conferir que **nenhum** caminho pertence a: `assets/**`, manifestos de áudio/cenas, `src/data/stories*`, dados de conquistas, `accessControl`. Qualquer caminho fora da lista autorizada **anula o *commit***.
- **Prova:** inventário de arquivos por *commit*, anexado ao relatório — **Gate:** — (`CN-8`)
- **Conclusão:** doze inventários registrados, todos limpos; nenhuma área protegida aparece em nenhum *commit* de `F6-R3`.
- **Risco · decisão:** **áreas protegidas (`AGENTS.md`)** · `CN-8` — **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-100` · Caso adicional **`E1`** — obra nova, criada e reaberta na **mesma** janela
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** caso-controle: sem mudança de janela, nada pode mudar.
- **Arquivos:** nenhum (**execução da matriz**) — **Símbolos/contratos:** §28.1 adicional `E1`.
- **Precondições:** `TK-A-063`..`TK-A-079` — **Depende de:** `TK-A-063`..`TK-A-079`
- **Mudança esperada:** **nenhuma** — executar e registrar `PASS`/`FAIL` com as quatro invariantes ZERO.
- **Prova:** `TA-12`; verificação automática por `artworkVersionHarness.js` + confirmação em aparelho — **Gate:** `G-CMP-2`
- **Conclusão:** bytes persistidos idênticos; nenhuma reprojeção ocorre.
- **Risco · decisão:** `RG-1` — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-101` · Caso adicional **`E2`** — obra **vetorial** do Ateliê atravessando mudança de janela
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** o motor vetorial tem falha diferente do *raster*; precisa de caso próprio.
- **Arquivos:** nenhum (**execução da matriz**) — **Símbolos/contratos:** §28.1 adicional `E2`; `strokes`, `stamps`, `logicalW`/`logicalH`.
- **Precondições:** `TK-A-063`..`TK-A-079` — **Depende de:** `TK-A-063`..`TK-A-079`
- **Mudança esperada:** **nenhuma** — executar e registrar `PASS`/`FAIL`.
- **Prova:** `TA-5`; `viewportProjectionHarness.js` + aparelho — **Gate:** `G-CVS-2`, `G-CMP-3`
- **Conclusão:** traços e carimbos reaparecem nas mesmas posições lógicas.
- **Risco · decisão:** `RG-1` · `SD-8` — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-102` · Caso adicional **`E3`** — rotação repetida (**dez ciclos**) sem deriva acumulada
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** deriva de reamostragem só aparece na repetição; um ciclo não revela.
- **Arquivos:** nenhum (**execução da matriz**) — **Símbolos/contratos:** §28.1 adicional `E3`.
- **Precondições:** `TK-A-036`, `TK-A-063`..`TK-A-079` — **Depende de:** `TK-A-036`, `TK-A-063`..`TK-A-079`
- **Mudança esperada:** **nenhuma** — dez rotações consecutivas com obra complexa; comparação da primeira com a décima.
- **Prova:** comparação de captura; reamostragem sempre a partir do modelo lógico — **Gate:** `G-CVS-1`
- **Conclusão:** nenhuma degradação perceptível acumulada; a décima é equivalente à primeira.
- **Risco · decisão:** `RG-1` · `RG-3` — **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-103` · Caso adicional **`E4`** — payload associado a *lineart* **divergente**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** fechar a **invariante ZERO #2** com caso próprio da matriz.
- **Arquivos:** nenhum (**execução da matriz**) — **Símbolos/contratos:** §28.1 adicional `E4`; identificador do *lineart*.
- **Precondições:** `TK-A-051`, `TK-A-063`..`TK-A-079` — **Depende de:** `TK-A-051`, `TK-A-063`..`TK-A-079`
- **Mudança esperada:** **nenhuma** — associar deliberadamente um payload a outro *lineart* no corpus e observar o ramo de recusa.
- **Prova:** `TA-12` — **Gate:** `G-CMP-6`
- **Conclusão:** recusa explícita; **nunca** exibição de tinta sobre desenho errado; arquivo preservado.
- **Risco · decisão:** **`RG-1`** · **invariante ZERO #2** — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-104` · Caso adicional **`E5`** — payload **corrompido ou truncado**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** erro de leitura nunca pode virar dano nem canvas branco silencioso.
- **Arquivos:** nenhum (**execução da matriz**) — **Símbolos/contratos:** §28.1 adicional `E5`.
- **Precondições:** `TK-A-044`, `TK-A-045`, `TK-A-063`..`TK-A-079` — **Depende de:** `TK-A-044`, `TK-A-045`, `TK-A-063`..`TK-A-079`
- **Mudança esperada:** **nenhuma** — injetar payload truncado no corpus e observar o estado explícito de incompatibilidade.
- **Prova:** `TA-12` — **Gate:** `G-CMP-1`, `G-CVS-3`
- **Conclusão:** o registro original permanece intacto; a superfície comunica em linguagem infantil; nada é apagado.
- **Risco · decisão:** **`RG-1`** · **invariante ZERO #4** — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-105` · Caso adicional **`E6`** — galeria com **acervo misto** após atualização do app
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** o estado real do aparelho de uma criança que já usava o app: obras antigas e novas lado a lado.
- **Arquivos:** nenhum (**execução da matriz**) — **Símbolos/contratos:** §28.1 adicional `E6`.
- **Precondições:** `TK-A-043`, `TK-A-063`..`TK-A-079` — **Depende de:** `TK-A-043`, `TK-A-063`..`TK-A-079`
- **Mudança esperada:** **nenhuma** — abrir a galeria com acervo misto, verificar miniaturas, abrir uma de cada formato, confirmar que **nenhuma migração em massa** ocorreu.
- **Prova:** **`CN-13`**; `TA-12` — **Gate:** `G-CMP-2`, `G-VER-2`
- **Conclusão:** a galeria exibe os dois formatos; nenhum registro foi reescrito pela simples abertura.
- **Risco · decisão:** **`RG-1`** · **invariante ZERO #3** — **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

---

## 4. `BLOCO 2` · Fechamento formal de `F6-SG-A`

> **`F6-SG-A` não é concedido aqui.** Este bloco descreve **como ele será provado**. A concessão é
> ato humano, posterior, baseado nas evidências que estas tasks produzem.

### 4.1 Execução das provas automatizadas

#### `TK-A-058` · Executar o conjunto automatizado de `F6-SG-A`
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** reunir num único relatório o veredito de `TA-4`, `TA-5`, `TA-11`, `TA-12`, `TA-13`.
- **Arquivos:** `scripts/testing/viewportProjectionHarness.js`, `scripts/testing/artworkVersionHarness.js` — **Símbolos/contratos:** códigos de saída.
- **Precondições:** `TK-A-053` — **Depende de:** `TK-A-031`, `TK-A-046`, `TK-A-053`
- **Mudança esperada:** nenhuma mudança de código; produção de evidência.
- **Prova:** os próprios arneses — **Gate:** `G-CVS-1`, `G-VER-3`, `G-CMP-1`, `G-CMP-3`
- **Conclusão:** todos os arneses saem com código `0`, com saída anexada ao relatório.
- **Risco · decisão:** — — **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-A-059` · Executar `npm run smoke` e `npx expo-doctor`
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** cumprir os portões de qualidade obrigatórios do projeto.
- **Arquivos:** `scripts/smoke.js`, `package.json` (**somente execução**) — **Símbolos/contratos:** `SD-10`.
- **Precondições:** `TK-A-058` — **Depende de:** `TK-A-058`
- **Mudança esperada:** nenhuma; execução e captura de saída.
- **Prova:** saída anexada — **Gate:** todos os `G-*` de `R3`
- **Conclusão:** ambos verdes. Smoke e `expo-doctor` **não substituem** a validação visual.
- **Risco · decisão:** `SD-10` · `P6` — **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-A-060` · Executar os **controles negativos** de `F6-SG-A`
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** provar que a Fase 6 **não** fez o que prometeu não fazer.
- **Arquivos:** `scripts/smoke.js`; `git diff` do pacote — **Símbolos/contratos:** `CN-2` (abertura idêntica), `CN-4` (sessão sobrevive), `CN-6` (sem remontagem), **`CN-13`** (nenhuma migração silenciosa em massa), **`CN-8`** (áreas protegidas intactas no pacote `F6-R3` — executado por `TK-A-099`).
- **Precondições:** `TK-A-059` — **Depende de:** `TK-A-059`, `TK-A-020`, `TK-A-028`, `TK-A-022`, `TK-A-043`, `TK-A-099`
- **Mudança esperada:** nenhuma; produção de evidência de **não-regressão**.
- **Prova:** os próprios controles — **Gate:** — (controles negativos)
- **Conclusão:** os **cinco** controles passam com evidência anexada.
- **Risco · decisão:** `RG-5` — **Auto:** parcial · **Física futura:** **sim** (`CN-2`, `CN-4`, `CN-6`) · **Commit:** `C-GOV1` · **Rollback:** não aplicável.
- **Nota de emenda (`A-01`, `A-15`):** na r1 este item chamava de `CN-8` o que o PLAN chama de `CN-13`. O `CN-8` **canônico** (áreas protegidas por pacote, com `git diff`/inventário como prova) foi restaurado e recebeu task própria — `TK-A-099`.

#### `TK-A-061` · **Registro consolidado** dos mutantes de `F6-SG-A`
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** reunir, num único quadro, o veredito de **cada** prova vermelha de `R3` — provar que cada portão de `R3` tem dentes.
- **Arquivos:** artefato de evidência (documental). **Esta task não injeta mutação alguma.** Cada mutante é injetado, observado e revertido **isoladamente**, na sua própria task de prova (`A-08`).
- **Símbolos/contratos — os 14 mutantes de domínio `R3`:** `MT-1` (`TK-A-093`), `MT-5` (`TK-A-086`), `MT-6` (`TK-A-039`), `MT-12` (`TK-A-008`), `MT-13` (`TK-A-040`), `MT-14` (`TK-A-054`), `MT-17` (`TK-A-047`), `MT-18` (`TK-A-055`), `MT-26` (`TK-A-087`), `MT-27` (`TK-A-088`), `MT-28` (`TK-A-089`), `MT-29` (`TK-A-090`), `MT-33` (`TK-A-091`), `MT-34` (`TK-A-092`). **Mais** o registro da verificação imediata de `MT-7` antecipada a `R3` (`TK-A-095`, `A-14`/`A-16`) — cuja prova **formal** permanece em `F6-SG-C` (`TK-C-047`).
- **Precondições:** `TK-A-060` e **todas** as tasks de prova acima concluídas — **Depende de:** `TK-A-060`, `TK-A-008`, `TK-A-039`, `TK-A-040`, `TK-A-047`, `TK-A-054`, `TK-A-055`, `TK-A-086`, `TK-A-087`, `TK-A-088`, `TK-A-089`, `TK-A-090`, `TK-A-091`, `TK-A-092`, `TK-A-093`, `TK-A-095`
- **Mudança esperada:** nenhuma. Tabela `mutante → defeito nomeado → portão → vermelho observado → revertido → árvore limpa`.
- **Prova:** a própria tabela — **Gate:** os 14 portões correspondentes (`G-LFC-1`, `G-LFC-2`, `G-LFC-3`, `G-CVS-1`, `G-CVS-2`, `G-CVS-3`, `G-VER-1`, `G-VER-2`, `G-VER-3`, `G-CMP-1`..`G-CMP-6`)
- **Conclusão:** **14 mutantes, 14 vermelhos observados, 14 reversões, `git status` limpo ao fim** — e **nenhuma** mutação simultânea em nenhum momento.
- **Risco · decisão:** **`RG-13`** (portão sem dentes) — **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` (só o registro) · **Rollback:** não aplicável (esta task não altera código).

#### `TK-A-062` · Verificações de armazenamento antes e depois do pacote
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** provar em aparelho que nenhum registro foi perdido, truncado ou reescrito sem ordem.
- **Arquivos:** — (inspeção de armazenamento em aparelho) — **Símbolos/contratos:** contagem de obras, tamanhos, ponteiros `v:3` do envelope, chaves de `storageKeys.js`.
- **Precondições:** `TK-A-061` — **Depende de:** `TK-A-061`
- **Mudança esperada:** nenhuma; comparação **antes × depois** com o mesmo aparelho e o mesmo acervo.
- **Prova:** inventário comparado — **Gate:** `G-VER-2`, `G-CMP-2`
- **Conclusão:** contagem e integridade idênticas, salvo as obras que a própria sessão de teste salvou deliberadamente.
- **Risco · decisão:** **`RG-1`** · **invariantes ZERO #1 e #3** — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

### 4.2 Matriz obrigatória de compatibilidade — **os 17 casos de §28.1**

> **Regra do fundador:** estes 17 cenários **não** podem ser diluídos numa task genérica de "testar
> canvas". Cada um é uma task com critério objetivo próprio. As quatro invariantes valem em **todos**:
> **ZERO** perda de píxel da criança · **ZERO** associação da tinta ao *lineart* errado · **ZERO**
> promoção destrutiva · **ZERO** abertura silenciosa como canvas branco quando existe obra recuperável.

> **Emenda `A-03` — restauração da baseline.** A revisão r1 destas `TASKS` havia **substituído** o
> conjunto semântico do PLAN por outros 17 cenários. Isso está **desfeito**. Os **17 casos do PLAN
> §28.1 são a baseline obrigatória** e voltam **literalmente**, com a mesma numeração e o mesmo
> significado. Os bons cenários adicionais criados pela r1 foram **preservados** como **casos
> adicionais** com IDs novos (`E1`..`E6`, tasks `TK-A-100`..`TK-A-105`). **A matriz final tem 23
> casos; os 17 originais continuam claramente identificáveis e são todos obrigatórios para
> `F6-SG-A`. Um único `FAIL` nos 17 obrigatórios impede `F6-SG-A`.**

**Campos comuns a `TK-A-063`..`TK-A-079`:** *Pacote · Subportão:* `F6-R3.5` · `F6-SG-A` — *Precondições:* pacote `F6-R3` implementado e `TK-A-062` concluída — *Validação automatizada:* parcial (arnês cobre a lógica; o aparelho cobre a percepção) — *Validação física futura:* **sim, com o acervo real do aparelho** — *Commit:* `C-GOV1` (evidência; correções voltam ao *commit* do motor afetado) — *Rollback:* reverter o *commit* do motor afetado. **As quatro invariantes ZERO valem em todos os casos aplicáveis.**

#### `TK-A-063` · **Caso 1** — obra **antiga** em retrato
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** o caso zero de `Q8`: obra criada **antes** da mudança abre com a pintura presente. **Arquivos:** `ColoringCanvas.js` (`loadPaint`), `ColoringScreen.js`. **Precondições:** `TK-A-062` — **Depende de:** `TK-A-062`. **Símbolos/contratos:** caso obrigatório **#1** da matriz §28.1 do PLAN.
- **O que se executa:** abrir obra criada antes da mudança, em retrato. **O que se verifica:** abre com a pintura **presente** e alinhada ao *lineart*. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-12` + aparelho — **Gate:** `G-CMP-1`. **Risco:** **`RG-1`** · invariantes ZERO #1, #2, #4. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-064` · **Caso 2** — **mesma obra em paisagem**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar a projeção entre orientações **com a obra aberta**. **Arquivos:** `useViewportProjection.js`, os dois motores. **Precondições:** `TK-A-063` — **Depende de:** `TK-A-063`. **Símbolos/contratos:** caso obrigatório **#2** da matriz §28.1 do PLAN.
- **O que se executa:** girar com a obra aberta. **O que se verifica:** proporção preservada, `contain` + *letterbox*; tinta e *lineart* seguem **juntos**. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-4` + §28 #6/#7 — **Gate:** `G-CMP-3`. **Risco:** **`RG-1`** · invariantes ZERO #1, #2. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-065` · **Caso 3** — **retorno a retrato**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar ausência de deriva no ciclo de ida e volta. **Arquivos:** `useViewportProjection.js`, `ColoringCanvas.js`. **Precondições:** `TK-A-064` — **Depende de:** `TK-A-064`. **Símbolos/contratos:** caso obrigatório **#3** da matriz §28.1 do PLAN.
- **O que se executa:** girar de volta. **O que se verifica:** estado **idêntico ao caso 1**; nenhuma deriva acumulada. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-4` — **Gate:** `G-CVS-1`. **Risco:** **`RG-1`**. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-066` · **Caso 4** — ***viewport* menor**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que reduzir a janela não recorta obra. **Arquivos:** `useViewportProjection.js`. **Precondições:** `TK-A-063` — **Depende de:** `TK-A-063`. **Símbolos/contratos:** caso obrigatório **#4** da matriz §28.1 do PLAN.
- **O que se executa:** Split View estreito / Slide Over. **O que se verifica:** **nada some**; nada é recortado silenciosamente. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-4` + aparelho (`SD-9`) — **Gate:** `G-CMP-3`. **Risco:** **`RG-1`** · invariante ZERO #1. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-067` · **Caso 5** — ***viewport* maior**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que ampliar a janela não estica a obra. **Arquivos:** `useViewportProjection.js`. **Precondições:** `TK-A-063` — **Depende de:** `TK-A-063`. **Símbolos/contratos:** caso obrigatório **#5** da matriz §28.1 do PLAN.
- **O que se executa:** tela cheia em paisagem. **O que se verifica:** **nada é esticado**; moldura em vez de distorção. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-4` + aparelho — **Gate:** `G-CMP-3`. **Risco:** **`RG-1`**. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-068` · **Caso 6** — **reabertura após fechar o app**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que o ciclo anterior **não gravou nada**. **Arquivos:** `drawingStorage.js` (**leitura**), `ColoringScreen.js`. **Precondições:** `TK-A-042` — **Depende de:** `TK-A-042`. **Símbolos/contratos:** caso obrigatório **#6** da matriz §28.1 do PLAN.
- **O que se executa:** encerrar o app, reabrir, abrir a obra. **O que se verifica:** obra íntegra; **nenhuma gravação ocorreu no ciclo anterior**. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** inventário de armazenamento antes/depois — **Gate:** `G-CMP-2`. **Risco:** **`RG-1`** · invariante ZERO #3. **Auto:** não · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-069` · **Caso 7** — ***background* e *foreground***
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar `useSurfaceLifecycle` no caminho mais sensível. **Arquivos:** `ColoringScreen.js`, `AtelierCanvasScreen.js`. **Precondições:** `TK-A-011` — **Depende de:** `TK-A-011`. **Símbolos/contratos:** caso obrigatório **#7** da matriz §28.1 do PLAN.
- **O que se executa:** sair e voltar com a obra aberta. **O que se verifica:** obra íntegra; **nenhum recarregamento destrutivo**. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** §28 #4/#8 + aparelho — **Gate:** `G-LFC-2`. **Risco:** **`RG-1`**, `RG-8`. **Auto:** não · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-070` · **Caso 8** — **Centro de Controle**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** cobrir a interrupção **parcial**, distinta do segundo plano pleno. **Arquivos:** `ColoringScreen.js`, `AtelierCanvasScreen.js`. **Precondições:** `TK-A-069` — **Depende de:** `TK-A-069`. **Símbolos/contratos:** caso obrigatório **#8** da matriz §28.1 do PLAN.
- **O que se executa:** abrir e fechar o Centro de Controle sobre o canvas. **O que se verifica:** idem ao caso 7 — obra íntegra, sem recarregamento. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** §28 #5 + aparelho — **Gate:** `G-LFC-2`. **Risco:** `RG-8`. **Auto:** não · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-071` · **Caso 9** — **término do processo de conteúdo** (quando reproduzível)
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** observar a defesa instrumentada **sem** declarar causa provada (`FD-12`). **Arquivos:** `ColoringCanvas.js`, `AtelierCanvas.js`. **Precondições:** `TK-A-014` — **Depende de:** `TK-A-014`. **Símbolos/contratos:** caso obrigatório **#9** da matriz §28.1 do PLAN.
- **O que se executa:** provocar/aguardar o término do processo de conteúdo, **quando reproduzível no aparelho**. **O que se verifica:** a recuperação **preserva a obra**; o evento é **instrumentado e registrado**. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** registro do evento **ou** declaração explícita de "não reproduzido" — **Gate:** `G-LFC-3`. **Risco:** **`RG-8`**, `P-164`. **Proibido** escrever "causa confirmada". **Auto:** não · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-072` · **Caso 10** — **obra sem modificação**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar leitura pura (`Q8` r.1): abrir **não** migra, **não** promove, **não** reescreve. **Arquivos:** `ColoringScreen.js`, `AtelierCanvasScreen.js`, `drawingStorage.js` (**leitura**). **Precondições:** `TK-A-042` — **Depende de:** `TK-A-042`. **Símbolos/contratos:** caso obrigatório **#10** da matriz §28.1 do PLAN.
- **O que se executa:** abrir e fechar **sem desenhar**. **O que se verifica:** **bytes persistidos idênticos** antes e depois. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** comparação byte a byte do registro — **Gate:** `G-CMP-2`. **Risco:** **`RG-1`** · invariante ZERO #3. **Auto:** não · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-073` · **Caso 11** — **obra modificada e salva no formato novo**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar a cadeia *write-forward* completa (`Q8` r.7–8). **Arquivos:** os dois motores + `drawingStorage.js` (**consumidor**). **Precondições:** `TK-A-049` — **Depende de:** `TK-A-049`. **Símbolos/contratos:** caso obrigatório **#11** da matriz §28.1 do PLAN.
- **O que se executa:** desenhar e salvar. **O que se verifica:** nova representação **criada, validada, relida e só então promovida**. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-13` + inspeção de armazenamento — **Gate:** `G-CMP-4`. **Risco:** **`RG-1`**, `RG-13`. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-074` · **Caso 12** — **falha durante a gravação nova**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que a falha **em qualquer etapa** preserva o anterior. **Arquivos:** caminho de gravação. **Precondições:** `TK-A-050` — **Depende de:** `TK-A-050`. **Símbolos/contratos:** caso obrigatório **#12** da matriz §28.1 do PLAN.
- **O que se executa:** falha injetada em **criar · persistir · validar · reler** — as quatro, uma a uma. **O que se verifica:** a representação **anterior** continua sendo a fonte válida; **nada destruído**. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-13` — **Gate:** `G-CMP-4`. **Risco:** **`RG-1`**, **`RG-13`** · invariante ZERO #3. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-075` · **Caso 13** — ***rollback*** do código com acervo já misto
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que reverter o código **não deixa obra órfã** — o caso que só aparece quando a Fase 6 já rodou em campo. **Arquivos:** versão anterior do código + acervo com obras nos **dois** formatos. **Precondições:** `TK-A-050` — **Depende de:** `TK-A-050`. **Símbolos/contratos:** caso obrigatório **#13** da matriz §28.1 do PLAN.
- **O que se executa:** reverter para a versão anterior do código **com obras já gravadas no formato novo e no antigo**. **O que se verifica:** o caminho revertido **consome o formato anterior**; **nenhuma obra fica órfã**. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-13` + inventário do acervo após a reversão — **Gate:** `G-CMP-4`. **Risco:** **`RG-1`** · invariante ZERO #3. **Este caso exige aparelho com acervo real e um *build* anterior instalável.** **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-076` · **Caso 14** — **formato legado** (`v1`/`v2` sem geometria completa)
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar reconstrução determinística **sem** usar a janela atual como se fosse a original (`Q8` r.6). **Arquivos:** leitor de compatibilidade. **Precondições:** `TK-A-041` — **Depende de:** `TK-A-041`. **Símbolos/contratos:** caso obrigatório **#14** da matriz §28.1 do PLAN.
- **O que se executa:** abrir obra `v1`/`v2` **sem geometria completa**. **O que se verifica:** reconstrução **determinística** a partir dos metadados e dimensões intrínsecas disponíveis; **jamais** usando a *viewport* atual como se fosse a original; **ausência de evidência favorece preservação**. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-12` — **Gate:** `G-CMP-1`. **Risco:** `RG-12` · invariante ZERO #4. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-077` · **Caso 15** — **payload visual atual**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que a ausência de `paintSchemaVersion` é tratada como legado **sem erro**. **Arquivos:** *reader*/*validator*. **Precondições:** `TK-A-002` — **Depende de:** `TK-A-002`. **Símbolos/contratos:** caso obrigatório **#15** da matriz §28.1 do PLAN.
- **O que se executa:** abrir obra no formato de pintura **vigente**. **O que se verifica:** lida e enquadrada corretamente; **`paintSchemaVersion` ausente ⇒ tratada como legada, sem erro**. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-11` — **Gate:** `G-VER-3`. **Risco:** `RG-11`. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-078` · **Caso 16** — **envelope de armazenamento atual** (ponteiro `v:3`)
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que o envelope permanece intocado e que o blob nunca é excluído por incompatibilidade **visual**. **Arquivos:** `drawingStorage.js` (`isDrawingPointer`, `POINTER_VERSION`), `fileBlobStore.js`. **Precondições:** `TK-A-005` — **Depende de:** `TK-A-005`. **Símbolos/contratos:** caso obrigatório **#16** da matriz §28.1 do PLAN.
- **O que se executa:** abrir obra guardada como **ponteiro `v:3` de blob**. **O que se verifica:** resolvida normalmente; `POINTER_VERSION` **intocado**; **blob nunca excluído por incompatibilidade visual**. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-11` + inventário de blobs antes/depois — **Gate:** `G-VER-2`, `G-CMP-1`. **Risco:** **`RG-11`** · invariante ZERO #3. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-079` · **Caso 17** — **novo schema lógico** (`paintSchemaVersion` + `layoutVersion`)
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que os quatro eixos nunca se confundem no ciclo completo. **Arquivos:** *reader*, *writer*, *validator*, `ColoringScreen.js:224`. **Precondições:** `TK-A-003` — **Depende de:** `TK-A-003`. **Símbolos/contratos:** caso obrigatório **#17** da matriz §28.1 do PLAN.
- **O que se executa:** abrir obra gravada com `paintSchemaVersion` **e** `layoutVersion`. **O que se verifica:** **lida, reprojetada e regravada sem perda**; eixos de versão **nunca confundidos**; a guarda de `:224` aceita o payload novo e continua rejeitando ponteiro. **Mudança esperada:** nenhuma — task de **verificação**, não de alteração de runtime.
- **Prova:** `TA-11` + aparelho — **Gate:** `G-VER-3`. **Risco:** **`RG-11`**. **Auto:** parcial · **Física futura:** **sim (obrigatória)** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-A-080` · Consolidar a matriz — **17 obrigatórios + 6 adicionais**, veredito por caso
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** produzir a evidência única que o fundador lê para decidir sobre `F6-SG-A`.
- **Arquivos:** artefato de evidência da Fase 6 (documental) — **Símbolos/contratos:** §28.1; quatro invariantes ZERO.
- **Precondições:** `TK-A-063`..`TK-A-079` e `TK-A-100`..`TK-A-105` — **Depende de:** `TK-A-063`..`TK-A-079`, `TK-A-100`..`TK-A-105`
- **Mudança esperada:** tabela com **23 linhas** — **17 obrigatórias (casos 1–17 do PLAN §28.1)** e **6 adicionais (`E1`..`E6`)** —, cada uma com veredito, aparelho, janela, captura e invariantes verificadas. As duas famílias são **visualmente separadas** na tabela; o veredito de `F6-SG-A` lê primeiro os 17.
- **Prova:** a própria tabela — **Gate:** `G-CVS-1`..`G-CVS-3`, `G-CMP-1`..`G-CMP-6`, `G-VER-2`, `G-VER-3`, `G-LFC-2`, `G-LFC-3`
- **Conclusão:** **17 de 17 obrigatórios `PASS`.** **Um único `FAIL` nos 17 obrigatórios impede `F6-SG-A`.** Um `FAIL` num caso adicional é registrado, analisado e submetido ao fundador — não é automaticamente bloqueante, mas **não pode ser omitido**.
- **Risco · decisão:** **`RG-1`** · `SD-8` bloqueador absoluto — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

### 4.3 Instrumentação, validação física futura e relatório

> **Emenda `A-12` — o roteiro físico é UNIÃO, nunca substituição.** Os **17 cenários do PLAN §28**
> são a baseline e permanecem **integralmente**. A parcela de `F6-SG-A` é composta pelos cenários
> **#1 a #11** e pela **parcela `SG-A` do #17** (regressão completa em telefone). Os cenários **#12,
> #13, #14, #15 e #16** pertencem a `F6-SG-B` e `F6-SG-C` e estão cobertos por `TK-B-034`,
> `TK-B-044`, `TK-B-045`, `TK-C-039`..`TK-C-045` e `TK-C-062`. **Nenhum cenário do PLAN foi
> substituído por cenário criado nestas `TASKS`;** os cenários adicionais destas `TASKS` são
> **acréscimos** e estão sempre marcados como tais.

#### `TK-A-081` · Preparar a campanha física de `F6-SG-A` (§28 **#1–#11** + parcela `SG-A` do **#17**)
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** deixar a campanha executável sem reinterpretação.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** §28 cenários **#1, #2, #3, #4, #5, #6, #7, #8, #9, #10, #11** e **#17 (parcela `SG-A`)**; aparelhos disponíveis.
- **Precondições:** `TK-A-080` — **Depende de:** `TK-A-080`, `TK-A-097` (#7), `TK-A-098` (#17 parcela `SG-A`)
- **Mudança esperada:** roteiro por aparelho, por janela e por superfície, com captura obrigatória em cada passo. **O roteiro nomeia os cenários pelo número do PLAN §28** — é proibido renumerá-los.
- **Prova:** o próprio roteiro — **Gate:** —
- **Conclusão:** cada cenário do PLAN atribuído a `SG-A` tem passo, expectativa e evidência definidos antes da execução; **nenhum cenário do PLAN fica sem dono**.
- **Risco · decisão:** `RG-10` (evidência insuficiente) — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-A-082` · Registrar o vão conhecido de tablet Android (`P8`, §33) e travar `SD-1`
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** declarar honestamente o que **não** foi validado **e** impedir que `SD-1` seja concedido sobre esse vão.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** `P8`; §33 rotas (i)/(ii); **`SD-1`**.
- **Precondições:** `TK-A-081` — **Depende de:** `TK-A-081`
- **Mudança esperada:** o vão é nomeado; **este artefato não escolhe** a rota condicional de §33 — a escolha é do fundador. Registra-se, além disso, a declaração normativa: **`SD-1` fica explicitamente NÃO CONCEDÍVEL enquanto o cenário físico de tablet Android (retrato e paisagem) não tiver sido executado** — cenário cuja task própria é **`TK-C-062`**.
- **Prova:** revisão documental — **Gate:** —
- **Conclusão:** nenhum relatório declara cobertura Android que não existe; e nenhum subportão concede `SD-1` por omissão.
- **Risco · decisão:** `RG-10` · `P8` · **`SD-1` travado** — **Auto:** não · **Física futura:** — · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-A-083` · Critérios `PASS`/`FAIL` e relatório de `F6-SG-A`
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** entregar ao fundador a base de decisão, **sem conceder o subportão**.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** critérios de saída de `F6-SG-A` (§27): lifecycle provado, espaço lógico provado, eixos separados, leitor puro, *writer* reversível, 17 casos `PASS`, portões verdes, mutantes vermelhos quando injetados, campanha física executada.
- **Precondições:** `TK-A-082` — **Depende de:** `TK-A-082`
- **Mudança esperada:** relatório em PT-BR distinguindo **salvo no disco · untracked · modificado · staged · commitado · enviado ao remoto**.
- **Prova:** revisão do fundador — **Gate:** todos os de `R3`
- **Conclusão:** relatório entregue e **`F6-SG-A` permanece não concedido** até decisão humana explícita.
- **Risco · decisão:** `RG-10` — **Auto:** não · **Física futura:** — · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-A-084` · Verificar que `SD-8` foi honrado antes de sequer apresentar `F6-SG-A`
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** tornar explícito que o bloqueador absoluto governa a apresentação.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** `SD-8`; quatro invariantes ZERO.
- **Precondições:** `TK-A-083` — **Depende de:** `TK-A-083`
- **Mudança esperada:** declaração verificável de que **nenhuma** obra infantil foi perdida ou corrompida em nenhum cenário testado.
- **Prova:** `TK-A-062` + `TK-A-080` — **Gate:** —
- **Conclusão:** se qualquer invariante ZERO falhou, **`F6-SG-A` não é apresentado** e `F6-R2` permanece bloqueado (`OR-1`).
- **Risco · decisão:** **`RG-1`** · `SD-8` — **Auto:** não · **Física futura:** — · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

---

## 5. `BLOCO 3` · `F6-R2` — Geometria do mapa · `F6-SG-B`

> **`OR-1` — precondição formal e inegociável de TODO este bloco:**
> **nenhuma task `TK-B-*` é executável antes da concessão de `F6-SG-A` pelo fundador.**
> Nenhuma task deste bloco depende de `F6-R1` (`OR-3`).
>
> **Trava de `MAP_ANCHOR_FRAMING` (§41.4):** a constante define **enquadramento**, não compensação.
> **`computeCameraTarget` não recebe números destinados a compensar elementos que poderiam ser
> medidos.** Nenhuma task pode recriar um `0.58` com outro nome.

### 5.1 Módulo puro, sem consumidor

#### `TK-B-001` · Criar `src/services/mapAnchor.js` como módulo puro
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** existir **uma** origem de geometria do mapa, testável em Node, antes de qualquer migração.
- **Arquivos:** `src/services/mapAnchor.js` (**novo**) — **Símbolos/contratos:** `MAP_ANCHOR_FRAMING`, `computeRegionLayout`, `getStoryAnchor`, `computeCameraTarget`, `resolveActiveRegion`.
- **Precondições:** **`F6-SG-A` concedido** — **Depende de:** `TK-A-084` + concessão humana
- **Mudança esperada:** módulo puro, **sem nenhum consumidor**, sem importar React nem `react-native`.
- **Prova:** `TA-1` — **Gate:** — (prepara `G-MAP-1`)
- **Conclusão:** o módulo existe, é importável em Node puro, e `AdventureMapScreen.js` ainda não o usa.
- **Risco · decisão:** `RG-5` · Princípio III — **Auto:** sim · **Física futura:** não · **Commit:** `C-B1` · **Rollback:** reverter `C-B1`.

#### `TK-B-002` · `MAP_ANCHOR_FRAMING` — enquadramento declarado, com justificativa no código
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** impedir que a constante vire o novo número mágico que substitui `0.58` e `0.5`.
- **Arquivos:** `src/services/mapAnchor.js` — **Símbolos/contratos:** `MAP_ANCHOR_FRAMING`; seis regras de §41.4.
- **Precondições:** `TK-B-001` — **Depende de:** `TK-B-001`
- **Mudança esperada:** a constante expressa **onde a âncora deve repousar no espaço livre**, com comentário normativo declarando o que ela **não** é: não é compensação de barra, de cabeçalho, de aba nem de qualquer elemento mensurável.
- **Prova:** `TA-2` — **Gate:** **`G-MAP-4`**
- **Conclusão:** a constante tem justificativa declarada e nenhum consumidor a usa para compensar elemento mensurável.
- **Risco · decisão:** decisão do fundador (`Q6`/§41.4) — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B1` · **Rollback:** reverter `C-B1`.

#### `TK-B-003` · `computeRegionLayout(regions, width)`
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** derivar o *layout* de regiões de forma pura e determinística.
- **Arquivos:** `src/services/mapAnchor.js` — **Símbolos/contratos:** `computeRegionLayout`; espelha a derivação hoje embutida em `AdventureMapScreen.js:173`.
- **Precondições:** `TK-B-001` — **Depende de:** `TK-B-001`
- **Mudança esperada:** função pura; mesma entrada ⇒ mesma saída; nenhum estado de componente.
- **Prova:** `TA-1` — **Gate:** `G-MAP-1`
- **Conclusão:** o arnês reproduz o *layout* atual para as larguras das três faixas.
- **Risco · decisão:** `RG-5` — **Auto:** sim · **Física futura:** não · **Commit:** `C-B1` · **Rollback:** reverter `C-B1`.

#### `TK-B-004` · `getStoryAnchor(storyId, ctx)` — **assinatura única**
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** matar a divergência latente de assinatura `(id, i, n)` × `(id)`.
- **Arquivos:** `src/services/mapAnchor.js` — **Símbolos/contratos:** `getStoryAnchor(storyId, ctx)` com `ctx = { regions, regionLayout, width }`; substitui `getStoryMapCoord`.
- **Precondições:** `TK-B-003` — **Depende de:** `TK-B-003`
- **Mudança esperada:** **uma** assinatura; o contexto é explícito; nenhum chamador precisa saber índice nem total para obter a âncora correta.
- **Prova:** `TA-1` — **Gate:** **`G-MAP-2`**
- **Conclusão:** todos os futuros chamadores usam a mesma assinatura; nenhuma sobrecarga sobrevive.
- **Risco · decisão:** defeito **LATENTE** da auditoria (divergência de assinatura) — **Auto:** sim · **Física futura:** não · **Commit:** `C-B1` · **Rollback:** reverter `C-B1`.

#### `TK-B-005` · `computeCameraTarget(anchor, viewport, contentH, opts)` — recebe *viewport* **já medida**
- **Pacote · Subportão:** **`F6-R2.3`** · `F6-SG-B` — **Objetivo:** consequência de projeto da trava de §41.4 — o que é mensurável é **medido**, não compensado por constante.
- **Arquivos:** `src/services/mapAnchor.js` — **Símbolos/contratos:** `computeCameraTarget`; `viewport` = espaço **livre** já descontado de cabeçalho, aba e barra.
- **Precondições:** `TK-B-002`, `TK-B-004` — **Depende de:** `TK-B-002`, `TK-B-004`
- **Mudança esperada:** a função **não** recebe nem inventa número de compensação; recebe a *viewport* livre medida pelo chamador e aplica `MAP_ANCHOR_FRAMING`.
- **Prova:** `TA-2` — **Gate:** **`G-MAP-4`**
- **Conclusão:** a assinatura torna impossível passar "altura de barra" como parâmetro de ajuste.
- **Risco · decisão:** decisão do fundador (§41.4) · `RG-5` — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B1` · **Rollback:** reverter `C-B1`.

#### `TK-B-006` · `resolveActiveRegion(scrollY, regionLayout, probeOffset)`
- **Pacote · Subportão:** **`F6-R2.1`** · `F6-SG-B` — **Objetivo:** unificar a sonda de região ativa hoje embutida em `AdventureMapScreen.js:403`.
- **Arquivos:** `src/services/mapAnchor.js` — **Símbolos/contratos:** `resolveActiveRegion`.
- **Precondições:** `TK-B-003` — **Depende de:** `TK-B-003`
- **Mudança esperada:** função pura equivalente à sonda atual, com o deslocamento como parâmetro explícito.
- **Prova:** `TA-3` — **Gate:** `G-MAP-1`
- **Conclusão:** o arnês reproduz a região ativa atual para uma varredura de posições.
- **Risco · decisão:** `RG-5` — **Auto:** sim · **Física futura:** não · **Commit:** `C-B1` · **Rollback:** reverter `C-B1`.

#### `TK-B-007` · Arnês `mapAnchorHarness.js` (`TA-1`, `TA-2`, `TA-3`)
- **Pacote · Subportão:** `F6-R2.*` · `F6-SG-B` — **Objetivo:** provar a geometria **antes** de tocar a tela.
- **Arquivos:** `scripts/testing/mapAnchorHarness.js` (**novo**) — **Símbolos/contratos:** `TA-1` (âncora única), `TA-2` (câmera acerta a mira), `TA-3` (região ativa).
- **Precondições:** `TK-B-006` — **Depende de:** `TK-B-003`, `TK-B-005`, `TK-B-006`
- **Mudança esperada:** arnês cobre as três faixas de largura e casos de conteúdo curto/longo; **sem dependência nova**.
- **Prova:** ele mesmo — **Gate:** `G-MAP-1`
- **Conclusão:** arnês sai com código `0` para todas as combinações declaradas.
- **Risco · decisão:** `RG-5` — **Auto:** sim · **Física futura:** não · **Commit:** `C-B2` · **Rollback:** reverter `C-B2`.

#### `TK-B-008` · Congelar a equivalência com o comportamento atual antes de migrar
- **Pacote · Subportão:** `F6-R2.*` · `F6-SG-B` — **Objetivo:** garantir que o módulo puro reproduz o **estado atual** onde ele já está correto, para que a migração isole apenas os defeitos.
- **Arquivos:** `scripts/testing/mapAnchorHarness.js` — **Símbolos/contratos:** vetores de referência derivados dos cinco pontos auditados.
- **Precondições:** `TK-B-007` — **Depende de:** `TK-B-007`
- **Mudança esperada:** vetores de referência versionados; divergências esperadas explicitamente marcadas como **correção**, não como regressão.
- **Prova:** `TA-1`, `TA-2` — **Gate:** `G-MAP-1`
- **Conclusão:** cada divergência entre módulo e código atual está classificada como "igual" ou "correção deliberada".
- **Risco · decisão:** **`RG-5`** (regressão silenciosa na abertura) · `CN-2` — **Auto:** sim · **Física futura:** não · **Commit:** `C-B2` · **Rollback:** reverter `C-B2`.

### 5.2 Migração das cinco derivações independentes

#### `TK-B-009` · Pino da história (`MapRegion`) passa a consumir `getStoryAnchor`
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** primeira das cinco derivações a morrer.
- **Arquivos:** **`src/components/map/MapRegion.js`** (`:36-59`; derivação do pino em `:50-59`) — caminho **já provado pelo PLAN** (§ mapa de arquivos, linha `src/components/map/MapRegion.js`); a incerteza registrada na r1 destas `TASKS` está **resolvida** (emenda `A-23`) — **Símbolos/contratos:** posicionamento do pino; `computeRegionHeight` (`:47`).
- **Precondições:** `TK-B-008` — **Depende de:** `TK-B-008`
- **Mudança esperada:** o cálculo local desaparece; o pino usa a âncora única.
- **Prova:** `TA-1` + captura comparativa — **Gate:** **`G-MAP-2`** (`MapRegion.js` deixa de chamar `getStoryMapCoord` diretamente)
- **Conclusão:** o pino cai exatamente na posição de referência nas três faixas.
- **Risco · decisão:** `SD-5` — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B3` · **Rollback:** reverter `C-B3`.

#### `TK-B-010` · Alvo de toque passa a derivar da **mesma** âncora
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** o dedo da criança e o olho da criança concordam.
- **Arquivos:** **`src/components/map/MapRegion.js`** — **Símbolos/contratos:** área tocável da história.
- **Precondições:** `TK-B-009` — **Depende de:** `TK-B-009`
- **Mudança esperada:** o retângulo de toque deriva da âncora única, não de um cálculo próprio.
- **Prova:** `TA-1` + teste de toque em aparelho; a prova vermelha é `MT-24` em `TK-B-026` — **Gate:** **`G-MAP-2`**
- **Conclusão:** tocar no pino abre a história; não há deslocamento entre alvo e desenho. **`SD-5`.**
- **Risco · decisão:** `SD-5` — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B3` · **Rollback:** reverter `C-B3`.

#### `TK-B-011` · Brilho/destaque da história passa a derivar da **mesma** âncora
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** terceira derivação eliminada.
- **Arquivos:** **`src/components/map/MapRegion.js`** — **Símbolos/contratos:** efeito de destaque.
- **Precondições:** `TK-B-010` — **Depende de:** `TK-B-010`
- **Mudança esperada:** o brilho passa a usar a âncora única.
- **Prova:** captura comparativa — **Gate:** **`G-MAP-2`**
- **Conclusão:** brilho concêntrico ao pino nas três faixas. **`SD-5`.**
- **Risco · decisão:** `SD-5` — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-B3` · **Rollback:** reverter `C-B3`.

#### `TK-B-012` · Câmera inicial (`initialOffsetY`) passa a consumir `computeCameraTarget`
- **Pacote · Subportão:** `F6-R2.2` · `F6-SG-B` — **Objetivo:** quarta derivação eliminada e fim do fator `0.58` em `:310`.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `initialOffsetY` (`:295-311`), fator `0.58` (`:310`).
- **Precondições:** `TK-B-011` — **Depende de:** `TK-B-011`
- **Mudança esperada:** o cálculo local some; a abertura passa pela função única, com a *viewport* livre **medida**.
- **Prova:** `TA-2`, `CN-2` — **Gate:** **`G-MAP-1`** (nenhum literal `0.58`/`0.5` sobrevive em `AdventureMapScreen.js`)
- **Conclusão:** a abertura na faixa compacta permanece equivalente; no tablet, a mira passa a acertar. **`SD-6`.**
- **Risco · decisão:** **`RG-5`** · `SD-6` — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B4` · **Rollback:** reverter `C-B4`.

#### `TK-B-013` · Eliminar a compensação fantasma de barra inferior de 56pt
- **Pacote · Subportão:** **`F6-R2.3`** · `F6-SG-B` — **Objetivo:** remover uma compensação que já não corresponde a elemento real na composição lateral.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** constante de 56pt em `initialOffsetY` (`:299`).
- **Precondições:** `TK-B-012` — **Depende de:** `TK-B-012`
- **Mudança esperada:** a compensação fantasma desaparece; o espaço ocupado por navegação passa a ser **medido** e descontado antes de chamar `computeCameraTarget`.
- **Prova:** `TA-2` + §28 #12 — **Gate:** **`G-MAP-3`** (`initialOffsetY` não contém a subtração literal `56`) **e** **`G-MAP-4`** (o mensurável é medido)
- **Conclusão:** nenhum número de compensação de barra sobrevive no cálculo de câmera.
- **Risco · decisão:** §41.4 (o mensurável é medido) — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-B4` · **Rollback:** reverter `C-B4`.

#### `TK-B-014` · `onContentSize` passa a consumir `computeCameraTarget`
- **Pacote · Subportão:** `F6-R2.2` · `F6-SG-B` — **Objetivo:** o segundo momento de posicionamento usa a mesma função do primeiro.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `onContentSize`, fator `0.58` (`:385`).
- **Precondições:** `TK-B-013` — **Depende de:** `TK-B-013`
- **Mudança esperada:** o segundo `0.58` desaparece; a chegada do `contentSize` recalcula pela função única.
- **Prova:** `TA-2` — **Gate:** **`G-MAP-1`**
- **Conclusão:** abertura e chegada de conteúdo produzem a **mesma** mira.
- **Risco · decisão:** `RG-5` — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-B5` · **Rollback:** reverter `C-B5`.

#### `TK-B-015` · `scrollPinIntoView` passa a consumir `computeCameraTarget`
- **Pacote · Subportão:** `F6-R2.3` · `F6-SG-B` — **Objetivo:** quinta derivação eliminada e fim do fator `0.5`.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `scrollPinIntoView`, fator `0.5` (`:436`).
- **Precondições:** `TK-B-014` — **Depende de:** `TK-B-014`
- **Mudança esperada:** o `0.5` desaparece; trazer o pino para a vista usa a mesma mira da abertura.
- **Prova:** `TA-2`; a prova vermelha é `MT-2` em `TK-B-025` — **Gate:** **`G-MAP-1`**
- **Conclusão:** "Ver mapa" e a abertura enquadram a história **na mesma posição**.
- **Risco · decisão:** `SD-5` · `SD-6` — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B6` · **Rollback:** reverter `C-B6`.

#### `TK-B-016` · Remover o comentário falso de `:424-426`
- **Pacote · Subportão:** `F6-R2.3` · `F6-SG-B` — **Objetivo:** eliminar documentação de código que descreve comportamento inexistente.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** comentário que afirma alinhamento inexistente entre `0.5` e `0.58`.
- **Precondições:** `TK-B-015` — **Depende de:** `TK-B-015`
- **Mudança esperada:** o comentário some junto com a duplicação que ele descrevia erroneamente; nenhum comentário novo afirma equivalência não verificada.
- **Prova:** revisão — **Gate:** **`G-MAP-1`**
- **Conclusão:** nenhum comentário do mapa descreve um contrato que o código não cumpre.
- **Risco · decisão:** Princípio de rastreabilidade — **Auto:** sim · **Física futura:** não · **Commit:** `C-B6` · **Rollback:** reverter `C-B6`.

#### `TK-B-017` · A duplicação `0.58` × `0.5` **morre** — asserção de ausência
- **Pacote · Subportão:** `F6-R2.3` · `F6-SG-B` — **Objetivo:** cumprir a decisão do fundador — "a duplicação atual não pode sobreviver".
- **Arquivos:** `scripts/smoke.js`, `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `codeOf` (asserção que ignora comentários).
- **Precondições:** `TK-B-016` — **Depende de:** `TK-B-016`
- **Mudança esperada:** asserção de que nenhum fator de enquadramento literal (`0.58`, `0.5`) sobrevive em `AdventureMapScreen.js`, e de que existe **exatamente uma** constante de enquadramento, em `mapAnchor.js`.
- **Prova:** a prova vermelha é `MT-2`, executada isoladamente em `TK-B-025` — **Gate:** **`G-MAP-1`**
- **Conclusão:** `npm run smoke` verde; vermelho se qualquer fator literal voltar.
- **Risco · decisão:** decisão do fundador — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** reverter `C-B7`.

#### `TK-B-018` · Sonda de região ativa passa a consumir `resolveActiveRegion`
- **Pacote · Subportão:** **`F6-R2.1`** · `F6-SG-B` — **Objetivo:** a região ativa deixa de ter aritmética própria na tela.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** sonda de `:403`, `activeIdx`.
- **Precondições:** `TK-B-017` — **Depende de:** `TK-B-017`
- **Mudança esperada:** a tela chama o módulo; o comportamento observável permanece o mesmo.
- **Prova:** `TA-3` — **Gate:** — (propriedade coberta por `TA-3`; nenhum portão estático a reivindica)
- **Conclusão:** a região ativa acompanha o *scroll* exatamente como hoje, agora por caminho único.
- **Risco · decisão:** `RG-5` — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-B6` · **Rollback:** reverter `C-B6`.

#### `TK-B-019` · Holofote do tour sobre o mapa usa a **mesma** âncora
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** fechar `SD-5` incluindo o guia.
- **Arquivos:** `src/services/guideTargetRegistry.js`, `src/hooks/useGuideTargets.js` — **Símbolos/contratos:** alvo registrado do mapa; **o registro não ganha aritmética de mapa** — ele consome `mapAnchor`.
- **Precondições:** `TK-B-018` — **Depende de:** `TK-B-018`
- **Mudança esperada:** o alvo do tour no mapa deriva da âncora única, mantendo a medição de tela existente.
- **Prova:** §28 #13 (vídeo do tour) — **Gate:** **`G-MAP-2`**
- **Conclusão:** pino, alvo, brilho, *scroll* e holofote coincidem. **`SD-5` fechado.**
- **Risco · decisão:** `RG-6` · fronteira com **F7** — **Auto:** parcial · **Física futura:** **sim** (§28 #13) · **Commit:** `C-B6` · **Rollback:** reverter `C-B6`.

#### `TK-B-020` · Unificar a assinatura — `getStoryMapCoord` deixa de existir
- **Pacote · Subportão:** **`F6-R2.4`** · `F6-SG-B` — **Objetivo:** matar o defeito **LATENTE** antes que ele acorde.
- **Arquivos:** `src/screens/AdventureMapScreen.js`, demais chamadores de `getStoryMapCoord` — ⚠️ **INCERTEZA LOCALIZADA** quanto ao inventário completo de chamadores, a resolver por busca dirigida na implementação — **Símbolos/contratos:** `getStoryMapCoord(id, i, n)` × `getStoryMapCoord(id)`.
- **Precondições:** `TK-B-019` — **Depende de:** `TK-B-019`
- **Mudança esperada:** todos os chamadores migram para `getStoryAnchor(storyId, ctx)`; a função antiga é removida.
- **Prova:** `TA-1`, `MT-3` — **Gate:** **`G-MAP-2`**
- **Conclusão:** nenhuma ocorrência de `getStoryMapCoord` sobrevive em `src/`.
- **Risco · decisão:** defeito **LATENTE** — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** reverter `C-B7`.

#### `TK-B-021` · Verificar que `F6-R2` **não** depende de `F6-R1`
- **Pacote · Subportão:** `F6-R2.*` · `F6-SG-B` — **Objetivo:** provar `OR-3` no código, não só no texto.
- **Arquivos:** `src/services/mapAnchor.js`, `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** ausência de importação de `useWindowBand` e de arquétipos de superfície.
- **Precondições:** `TK-B-020` — **Depende de:** `TK-B-020`
- **Mudança esperada:** **nenhuma** — asserção de ausência: `mapAnchor` não conhece faixas nem famílias de superfície; recebe largura como número.
- **Prova:** asserção estática — **Gate:** — (propriedade de ordem `OR-3`; provada por `CN-9` em `TK-B-027`)
- **Conclusão:** `mapAnchor.js` não importa nada de `F6-R1`; a geometria é utilizável sem o pacote adaptativo.
- **Risco · decisão:** `OR-3` · §5.1 do PLAN — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** não aplicável.

### 5.3 Portões, mutantes e controles negativos de `F6-R2`

> **Emenda `A-09`/`A-10` — nenhum portão prova a si próprio.** Nesta seção as tasks que **criam**
> portão **não** declaram a própria criação como prova. Cada portão do mapa tem **prova vermelha
> independente**, em task separada, com **uma única mutação por vez** (`A-08`).

#### `TK-B-022` · Portão **`G-MAP-1`** — **criação apenas** — constante de enquadramento única
- **Pacote · Subportão:** `F6-R2.3` · `F6-SG-B` — **Objetivo:** lacrar a morte dos fatores literais de enquadramento.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `check`, `readSrc`, `codeOf`; semântica canônica do PLAN §26 — "existe **exatamente uma** constante de enquadramento, em `mapAnchor.js`; `AdventureMapScreen.js` **não** contém os literais `0.58` nem `0.5`".
- **Precondições:** `TK-B-017` — **Depende de:** `TK-B-017`
- **Mudança esperada:** uma asserção nova em `scripts/smoke.js`.
- **Prova:** **prova independente** — `G-MAP-1` fica **vermelho** sob `MT-2`, em `TK-B-025`. **Esta task não é a prova de si mesma.** — **Gate:** `G-MAP-1` (**criação**)
- **Conclusão:** `npm run smoke` verde no estado correto.
- **Risco · decisão:** `SD-6` · §41.4 — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** reverter `C-B7`.

#### `TK-B-023` · Portão **`G-MAP-2`** — **criação apenas** — assinatura única
- **Pacote · Subportão:** **`F6-R2.4`** · `F6-SG-B` — **Objetivo:** impedir o retorno da divergência de assinatura.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** semântica canônica — "`AdventureMapScreen.js` e `MapRegion.js` **não** chamam `getStoryMapCoord` diretamente; só `mapAnchor`".
- **Precondições:** `TK-B-020` — **Depende de:** `TK-B-020`
- **Mudança esperada:** asserção de ausência do símbolo antigo nos dois arquivos nomeados.
- **Prova:** **prova independente** — `G-MAP-2` fica **vermelho** sob `MT-3` (`TK-B-037`) e sob `MT-24` (`TK-B-026`). — **Gate:** `G-MAP-2` (**criação**)
- **Conclusão:** verde no estado correto.
- **Risco · decisão:** defeito **LATENTE** — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** reverter `C-B7`.

#### `TK-B-024` · Portões **`G-MAP-3`** e **`G-MAP-4`** — **criação apenas**
- **Pacote · Subportão:** `F6-R2.2`/`R2.3` · `F6-SG-B` — **Objetivo:** lacrar a morte do `56` fantasma **e** a trava de `MAP_ANCHOR_FRAMING`.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `G-MAP-3` = "`initialOffsetY` **não** contém a subtração literal `56`"; `G-MAP-4` = "toda geometria mensurável é **medida**; o resíduo de enquadramento é único, nomeado e justificado" — verifica as **regras 1, 3 e 4** de §41.4.
- **Precondições:** `TK-B-013`, `TK-B-017` — **Depende de:** `TK-B-013`, `TK-B-017`
- **Mudança esperada:** duas asserções novas, distintas entre si.
- **Prova:** **provas independentes** — `G-MAP-3` fica **vermelho** sob `MT-4` (`TK-B-038`); `G-MAP-4` fica **vermelho** sob `MT-25` (`TK-B-039`). — **Gate:** `G-MAP-3`, `G-MAP-4` (**criação**)
- **Conclusão:** ambos verdes no estado correto.
- **Risco · decisão:** §41.4 — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** reverter `C-B7`.

#### `TK-B-025` · Mutante **`MT-2`** — `scrollPinIntoView` volta a usar fator próprio → **`G-MAP-1`**
- **Pacote · Subportão:** `F6-R2.3` · `F6-SG-B` — **Objetivo:** provar que `G-MAP-1` detecta o retorno da duplicação de fator.
- **Arquivos:** mutação temporária em `src/screens/AdventureMapScreen.js` (**nunca commitada**) — **Símbolos/contratos:** fator literal em `scrollPinIntoView`.
- **Precondições:** `TK-B-022` — **Depende de:** `TK-B-022`
- **Mudança esperada:** **defeito deliberado, um só** — `scrollPinIntoView` volta a usar um fator próprio diferente do canônico. **Nenhuma outra mutação simultânea.** Esperado: `G-MAP-1` **vermelho** e `TA-1` falhando.
- **Prova:** portão vermelho observado e registrado — **Gate:** `G-MAP-1` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo, registro anexado.
- **Risco · decisão:** `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-B-026` · Mutante **`MT-24`** — alvo de toque volta a derivar separadamente → **`G-MAP-2`**
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** provar que `G-MAP-2` protege `SD-5` no componente de região.
- **Arquivos:** mutação temporária em `src/components/map/MapRegion.js` (**nunca commitada**) — **Símbolos/contratos:** alvo de toque derivado por chamada direta a `getStoryMapCoord`, separada de `getStoryAnchor`.
- **Precondições:** `TK-B-023` — **Depende de:** `TK-B-023`
- **Mudança esperada:** **defeito deliberado, um só.** Esperado: `G-MAP-2` **vermelho** e `TA-1` acusando divergência entre pino e alvo.
- **Prova:** portão vermelho observado e registrado — **Gate:** `G-MAP-2` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo, registro anexado.
- **Risco · decisão:** `RG-13` · `SD-5` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.
- **Nota de emenda (`A-01`):** na r1 esta task injetava `MT-3` com o significado errado. O `MT-3` canônico ("`getStoryMapCoord` volta a ter duas assinaturas") foi restaurado e tem task própria: **`TK-B-037`**.

#### `TK-B-027` · Controle negativo **`CN-9`** — o mapa **não** ganha faixa nem arquétipo
- **Pacote · Subportão:** `F6-R2.*` · `F6-SG-B` — **Objetivo:** provar que `F6-R2` não invadiu `F6-R1`.
- **Arquivos:** `git diff` do pacote — **Símbolos/contratos:** **`CN-9`** (controle **novo** desta revisão; o `CN-1` canônico é "telefone em retrato não muda em nada", provado em `TK-C-038` e `TK-A-098`).
- **Precondições:** `TK-B-021` — **Depende de:** `TK-B-021`
- **Mudança esperada:** **nenhuma** — evidência de que nenhum arquivo de `F6-R1` foi tocado neste pacote.
- **Prova:** `git diff --name-only` do intervalo de *commits* de `R2` — **Gate:** — (controle negativo `CN-9`)
- **Conclusão:** o *diff* de `R2` contém apenas mapa, `mapAnchor`, arnês e portões; **zero** importação de `useWindowBand` ou de arquétipo de superfície.
- **Risco · decisão:** `OR-3` — **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.
- **Nota de emenda (`A-01`):** na r1 este item chamava de `CN-1` uma propriedade que o PLAN não atribui a `CN-1`. O `CN-1` canônico foi restaurado e este controle recebeu **ID novo e inédito**.

#### `TK-B-028` · Controles negativos **`CN-2`** e **`CN-10`** — abertura e custo de *scroll* preservados
- **Pacote · Subportão:** `F6-R2.*` · `F6-SG-B` — **Objetivo:** provar que a correção da geometria não regrediu a experiência atual do telefone.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** **`CN-2`** (canônico: a primeira montagem do mapa mantém o comportamento atual — `comece_aqui` no topo), **`CN-10`** (**novo**: custo de *scroll* preservado, sem travamento novo).
- **Precondições:** `TK-B-018` — **Depende de:** `TK-B-018`
- **Mudança esperada:** **nenhuma** — evidência comparativa antes/depois.
- **Prova:** `TA-2` + captura de abertura (`CN-2`) e observação de fluidez (`CN-10`) — **Gate:** — (controles negativos)
- **Conclusão:** abertura indistinguível no telefone, com `comece_aqui` no topo; *scroll* sem travamento novo.
- **Risco · decisão:** **`RG-5`**, **`RG-7`** — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.
- **Nota de emenda (`A-01`):** na r1 o segundo controle era chamado de `CN-3`; o `CN-3` canônico ("desenho sem mudança de janela carrega exatamente como hoje") foi restaurado e é provado em `TK-A-097`.

---

## 6. `BLOCO 4` · Fechamento formal de `F6-SG-B`

> **`F6-SG-B` não é concedido aqui.** Este bloco descreve como ele será provado. A concessão é ato
> humano — e é ela que libera `F6-R1` (`OR-2`).

#### `TK-B-029` · Executar o conjunto automatizado de `F6-SG-B`
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** veredito de `TA-1`, `TA-2`, `TA-3` + `npm run smoke` + `npx expo-doctor`.
- **Arquivos:** `scripts/testing/mapAnchorHarness.js`, `scripts/smoke.js` — **Símbolos/contratos:** `SD-10`.
- **Precondições:** `TK-B-028` — **Depende de:** `TK-B-028`
- **Mudança esperada:** nenhuma; produção de evidência. — **Prova:** saídas anexadas — **Gate:** `G-MAP-1`..`G-MAP-4`
- **Conclusão:** tudo verde, com saída anexada. — **Risco:** — · **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-030` · **Registro consolidado** dos mutantes de `F6-SG-B`
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** provar que os **cinco** portões do mapa têm dentes.
- **Arquivos:** artefato de evidência (documental). **Esta task não injeta mutação alguma** — cada mutante é injetado, observado e revertido **isoladamente**, na sua própria task (`A-08`).
- **Símbolos/contratos — os cinco mutantes de domínio `R2`:** `MT-2` → `G-MAP-1` (`TK-B-025`) · `MT-24` → `G-MAP-2` (`TK-B-026`) · `MT-3` → `G-MAP-2` (`TK-B-037`) · `MT-4` → `G-MAP-3` (`TK-B-038`) · `MT-25` → `G-MAP-4` (`TK-B-039`) · `MT-30` → `G-MAP-5` (`TK-B-042`).
- **Precondições:** `TK-B-029` — **Depende de:** `TK-B-029`, `TK-B-025`, `TK-B-026`, `TK-B-037`, `TK-B-038`, `TK-B-039`, `TK-B-042`
- **Mudança esperada:** nenhuma. Tabela `mutante → defeito nomeado → portão → vermelho observado → revertido → árvore limpa`.
- **Prova:** a própria tabela — **Gate:** `G-MAP-1`..`G-MAP-5`
- **Conclusão:** **seis mutantes, seis vermelhos observados, seis reversões**, `git status` limpo ao fim, **nenhuma** mutação simultânea. — **Risco:** `RG-13` · **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável (esta task não altera código).

#### `TK-B-031` · Validação visual na faixa **compacta** (`<600dp`)
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** provar não-regressão onde o app já funciona hoje.
- **Arquivos:** — (aparelho) — **Símbolos/contratos:** `breakpoints.phone`.
- **Precondições:** `TK-B-030` — **Depende de:** `TK-B-030`
- **Mudança esperada:** nenhuma; capturas comparativas antes/depois.
- **Prova:** capturas + §28 #12 — **Gate:** —
- **Conclusão:** abertura, pino, alvo, brilho e câmera **indistinguíveis** do estado anterior. — **Risco:** `RG-5` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-032` · Validação visual na faixa **média** (`600–899dp`)
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** provar a correção onde a mira erra hoje.
- **Arquivos:** — (aparelho / Split View) — **Símbolos/contratos:** `breakpoints.tablet`.
- **Precondições:** `TK-B-031` — **Depende de:** `TK-B-031`
- **Mudança esperada:** nenhuma; capturas.
- **Prova:** capturas + §28 #12 — **Gate:** **`G-MAP-1`**, **`G-MAP-4`**
- **Conclusão:** a câmera enquadra a história pretendida; **`SD-6` observado**. — **Risco:** `SD-6` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-033` · Validação visual na faixa **expandida** (`>=900dp`)
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** cobrir a terceira faixa normativa.
- **Arquivos:** — (tablet *landscape*) — **Símbolos/contratos:** `breakpoints.tabletL`.
- **Precondições:** `TK-B-032` — **Depende de:** `TK-B-032`
- **Mudança esperada:** nenhuma; capturas.
- **Prova:** capturas + §28 #12 — **Gate:** **`G-MAP-1`**, **`G-MAP-4`**
- **Conclusão:** enquadramento correto e âncora exposta coerente na faixa expandida. — **Risco:** `SD-6` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-034` · Comparação objetiva: pino · alvo de toque · brilho · câmera · âncora exposta
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** transformar "parece certo" em critério objetivo.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** cinco itens × três faixas = 15 observações.
- **Precondições:** `TK-B-033` — **Depende de:** `TK-B-033`
- **Mudança esperada:** tabela 5×3 com posição observada e posição esperada, cada célula com captura.
- **Prova:** a própria tabela — **Gate:** `G-MAP-1`, `G-MAP-2`, `G-MAP-4`, `G-MAP-5`
- **Conclusão:** as **15** células concordam; qualquer discordância impede a apresentação de `F6-SG-B`. — **Risco:** `SD-5`, `SD-6` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-035` · Verificar que nenhuma obra foi afetada por `F6-R2`
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** `SD-8` continua vigente **depois** de `F6-SG-A`, não apenas durante.
- **Arquivos:** — (inspeção de armazenamento) — **Símbolos/contratos:** inventário de obras antes/depois de `R2`.
- **Precondições:** `TK-B-034` — **Depende de:** `TK-B-034`
- **Mudança esperada:** nenhuma; a geometria do mapa não pode encostar em obra alguma.
- **Prova:** inventário comparado — **Gate:** `G-CMP-2`
- **Conclusão:** acervo idêntico antes e depois de `R2`. — **Risco:** `RG-1` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-036` · Relatório e critérios `PASS`/`FAIL` de `F6-SG-B`
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** entregar a base de decisão **sem conceder o subportão**.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** critérios de saída de `F6-SG-B` (§27): âncora única, assinatura única, fatores literais mortos, câmera correta nas três faixas, `SD-5` e `SD-6` observados, portões verdes, mutantes vermelhos quando injetados, `CN-1`..`CN-3` passando.
- **Precondições:** `TK-B-035` e **todas** as tasks de §6.1 — **Depende de:** `TK-B-035`, `TK-B-046`
- **Mudança esperada:** relatório em PT-BR com a distinção correta de estado de arquivo.
- **Prova:** revisão do fundador — **Gate:** todos os de `R2` (`G-MAP-1`..`G-MAP-5`)
- **Conclusão:** relatório entregue; **`F6-SG-B` permanece não concedido** até decisão humana. Sem ele, `OR-2` mantém `F6-R1` bloqueado. — **Risco:** `RG-10` · **Auto:** não · **Física futura:** — · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

### 6.1 Emenda pós-`Analyze` — tasks acrescentadas ao `BLOCO 3` e ao `BLOCO 4`

> **Aviso de ordem.** Como em §3.8, o **número** da task **não** é a ordem de execução. Cada task
> abaixo declara suas próprias precondições, e todas respeitam `OR-1` (nenhuma `TK-B-*` antes da
> concessão de `F6-SG-A`) e `OR-3` (nenhuma dependência de `F6-R1`).

#### `TK-B-037` · Mutante **`MT-3`** — `getStoryMapCoord` volta a ter duas assinaturas → **`G-MAP-2`**
- **Pacote · Subportão:** **`F6-R2.4`** · `F6-SG-B` — **Objetivo:** prova vermelha **independente** de `G-MAP-2`, restaurando o mutante canônico do PLAN (`A-17`).
- **Arquivos:** mutação temporária em `src/screens/AdventureMapScreen.js` e no chamador de `MapRegion.js` (**nunca commitada**) — **Símbolos/contratos:** `getStoryMapCoord(id, i, n)` × `getStoryMapCoord(id)`.
- **Precondições:** `TK-B-023` — **Depende de:** `TK-B-023`
- **Mudança esperada:** **defeito deliberado, um só** — o símbolo antigo é reintroduzido com **duas** assinaturas e chamado diretamente pela tela. Esperado: `G-MAP-2` **vermelho** e `TA-3` falhando.
- **Prova:** portão vermelho observado — **Gate:** `G-MAP-2` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo. — **Risco:** `RG-13` · defeito **LATENTE** — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-B-038` · Mutante **`MT-4`** — `initialOffsetY` volta à estimativa com os `56` fantasma → **`G-MAP-3`**
- **Pacote · Subportão:** `F6-R2.2` · `F6-SG-B` — **Objetivo:** prova vermelha **independente** de `G-MAP-3`, restaurando o mutante canônico do PLAN.
- **Arquivos:** mutação temporária em `src/screens/AdventureMapScreen.js` (**nunca commitada**) — **Símbolos/contratos:** subtração literal `56` em `initialOffsetY` (`:299`).
- **Precondições:** `TK-B-024` — **Depende de:** `TK-B-024`
- **Mudança esperada:** **defeito deliberado, um só.** Esperado: `G-MAP-3` **vermelho** e `TA-2` divergindo; captura em iPad evidencia o erro de mira (`SD-6`).
- **Prova:** portão vermelho observado — **Gate:** `G-MAP-3` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo. — **Risco:** `RG-13` · `SD-6` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-B-039` · Mutante **`MT-25`** — compensação de geometria mensurável em `computeCameraTarget` → **`G-MAP-4`**
- **Pacote · Subportão:** `F6-R2.2` · `F6-SG-B` — **Objetivo:** prova vermelha **independente** de `G-MAP-4` — o portão que impede `MAP_ANCHOR_FRAMING` de virar o novo número mágico.
- **Arquivos:** mutação temporária em `src/services/mapAnchor.js` (**nunca commitada**) — **Símbolos/contratos:** parâmetro/constante de compensação de elemento **mensurável** (barra, cabeçalho, aba) reintroduzido em `computeCameraTarget`.
- **Precondições:** `TK-B-024` — **Depende de:** `TK-B-024`
- **Mudança esperada:** **defeito deliberado, um só.** Esperado: `G-MAP-4` **vermelho** (viola as regras **1**, **3** e **4** de §41.4).
- **Prova:** portão vermelho observado — **Gate:** `G-MAP-4` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo. — **Risco:** `RG-13` · §41.4 — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-B-040` · **`F6-R2.5` · `D12`** — "Comece Aqui": geometria, posição inicial e câmera inicial
- **Pacote · Subportão:** `F6-R2.5` · `F6-SG-B` — **Objetivo:** cumprir o requisito `F6-R2.5`/`D12` **preservado na SPEC** e reforçado no PLAN §7.3.1 — a primeira montagem do mapa **mira `comece_aqui`** por derivação canônica, e não por cálculo próprio.
- **Arquivos:** `src/screens/AdventureMapScreen.js`, `src/services/mapAnchor.js` — **Símbolos/contratos:** `getStoryAnchor`, `computeCameraTarget`; identificador de conteúdo **`comece_aqui`**.
- **Escopo estrito (PLAN §7.3.1) — o que **entra**:** (1) **geometria** da primeira mira, saída da mesma função canônica, sem derivação paralela; (2) **posição inicial** de *scroll* do mapa na primeira montagem; (3) **câmera inicial** (`computeCameraTarget`) alimentada pela *viewport* livre **medida**; (4) uso da **fonte canônica de âncora já definida em `R2.1`** como única origem do alvo.
- **O que **NÃO** entra (proibido nesta task):** texto de *onboarding*; *spotlight* de F7; coreografia de F7; tour novo; semântica futura da jornada (**qual** história é o alvo em cada momento). **`D12` não é remetida à Fase 7** — permanece em `F6-R2.5`.
- **Precondições:** `TK-B-012`, `TK-B-014` — **Depende de:** `TK-B-012`, `TK-B-014`
- **Mudança esperada:** a primeira montagem passa a derivar o alvo de `mapAnchor` mirando `comece_aqui`; **nenhum** cálculo próprio de posição inicial sobrevive.
- **Prova:** `TA-2` + `CN-2` (abertura mantém `comece_aqui` no topo) + §28 #12 — **Gate:** **`G-MAP-5`** (criado em `TK-B-041`), `G-MAP-1`
- **Conclusão:** em telefone a abertura é indistinguível da atual; em tablet a mira passa a acertar `comece_aqui` nas duas orientações.
- **Risco · decisão:** `RG-5` · `SD-6` · `D12` — **Auto:** parcial · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B5` · **Rollback:** reverter `C-B5`.

#### `TK-B-041` · Portão **`G-MAP-5`** — **criação apenas**
- **Pacote · Subportão:** `F6-R2.5` · `F6-SG-B` — **Objetivo:** dar dentes a `F6-R2.5`/`D12`, que na r1 destas `TASKS` não tinha portão algum.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** semântica canônica (PLAN §26) — "a câmera inicial da primeira montagem **deriva de `mapAnchor`** e **mira `comece_aqui`**".
- **Precondições:** `TK-B-040` — **Depende de:** `TK-B-040`
- **Mudança esperada:** uma asserção nova: `AdventureMapScreen.js` não contém aritmética própria de posição inicial, e o alvo da primeira montagem referencia `comece_aqui` por meio de `mapAnchor`.
- **Prova:** **prova independente** — `G-MAP-5` fica **vermelho** sob `MT-30`, em `TK-B-042`. — **Gate:** `G-MAP-5` (**criação**)
- **Conclusão:** `npm run smoke` verde no estado correto. — **Risco:** `RG-13` · `D12` — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** reverter `C-B7`.

#### `TK-B-042` · Mutante **`MT-30`** — primeira montagem deixa de mirar `comece_aqui` → **`G-MAP-5`**
- **Pacote · Subportão:** `F6-R2.5` · `F6-SG-B` — **Objetivo:** prova vermelha **independente** de `G-MAP-5`.
- **Arquivos:** mutação temporária em `src/screens/AdventureMapScreen.js` (**nunca commitada**) — **Símbolos/contratos:** cálculo próprio de posição inicial substituindo a derivação canônica.
- **Precondições:** `TK-B-041` — **Depende de:** `TK-B-041`
- **Mudança esperada:** **defeito deliberado, um só.** Esperado: `G-MAP-5` **vermelho** e `CN-2` acusando abertura divergente.
- **Prova:** portão vermelho observado — **Gate:** `G-MAP-5` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo. — **Risco:** `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-B-043` · **`Q6`** — apresentação **condicional** do resíduo estético ao fundador
- **Pacote · Subportão:** `F6-R2.2` · `F6-SG-B` — **Objetivo:** cumprir literalmente a decisão do fundador (`A-18`) sem antecipar pergunta que pode não existir.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** `MAP_ANCHOR_FRAMING`; as **seis regras** de §41.4, em especial a **regra 5** — "se a medição tornar o resíduo desnecessário, **a constante não nasce**".
- **Precondições:** `TK-B-013` (o mensurável já medido), `TK-B-024` (`G-MAP-4` existindo) — **Depende de:** `TK-B-013`, `TK-B-024`
- **Sequência obrigatória:**
  1. **Medir primeiro.** Concluída a medição de toda a geometria mensurável, verificar se **ainda resta** um resíduo puramente estético de enquadramento.
  2. **Se não restar:** `MAP_ANCHOR_FRAMING` **não nasce**. Registrar a não-geração como decisão deliberada e **não** apresentar pergunta alguma ao fundador. Fim da task.
  3. **Se restar:** apresentar ao fundador **o resíduo já isolado e medido**, com captura nas três faixas, e pedir a decisão estética. **Nenhum agente pode escolher silenciosamente `0.58`, `0.5` ou um terceiro valor.**
- **Mudança esperada:** nenhuma mudança de código nesta task — ela **determina** e **registra**.
- **Prova:** o próprio registro + `G-MAP-4` — **Gate:** `G-MAP-4`
- **Conclusão:** ou a constante não existe e isso está provado, ou ela existe **com valor escolhido pelo fundador** e justificativa no código.
- **Risco · decisão:** **`Q6` permanece decisão humana** · §41.4 regra 5 — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável.

#### `TK-B-044` · Cenário físico **§28 #14** — as 20 histórias, três faixas, antes/depois
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** reincorporar o cenário do PLAN que a r1 destas `TASKS` havia deixado sem dono (`A-12`).
- **Arquivos:** artefato de evidência (documental) + aparelho — **Símbolos/contratos:** §28 **#14**; as 20 histórias; faixas compacta, média e expandida.
- **Precondições:** `TK-B-034` — **Depende de:** `TK-B-034`
- **Mudança esperada:** nenhuma; campanha de captura das **20** histórias nas **três** faixas, antes e depois.
- **Prova:** as próprias capturas — **Gate:** `G-MAP-1`, `G-MAP-2`
- **Conclusão:** **nenhum deslocamento inaceitável** em nenhuma das 20 histórias, em nenhuma das três faixas.
- **Risco · decisão:** `SD-5`, `SD-6` — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-045` · Cenário físico **§28 #17** — parcela `SG-B` da regressão completa em telefone
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** reincorporar a parcela `SG-B` do cenário #17 (`A-12`).
- **Arquivos:** aparelho (telefone, faixa compacta) — **Símbolos/contratos:** §28 **#17**; `CN-1` (telefone em retrato não muda em nada).
- **Precondições:** `TK-B-044` — **Depende de:** `TK-B-044`
- **Mudança esperada:** nenhuma; capturas antes/depois de Mapa e do tour no telefone.
- **Prova:** capturas comparativas — **Gate:** — (controle negativo `CN-1`)
- **Conclusão:** **nada mudou** no telefone após `F6-R2`.
- **Risco · decisão:** **`RG-5`** · `CN-1` — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-046` · Controle negativo **`CN-8`** em `F6-R2` — áreas protegidas intactas
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** restaurar o `CN-8` canônico do PLAN, verificado **por pacote** (`A-15`).
- **Arquivos:** `git diff --cached --name-only` de **cada** *commit* `C-B1`..`C-B7`; inventário de arquivos — **Símbolos/contratos:** **`CN-8`** — "nenhum *asset*, manifesto, história, conquista ou regra de acesso foi tocado".
- **Precondições:** `TK-B-045` — **Depende de:** `TK-B-045`
- **Mudança esperada:** **nenhuma** — evidência documental por *commit*.
- **Prova:** a saída de `git diff --cached --name-only` anexada **antes** de cada *commit* do pacote, mais o inventário comparado de `assets/`, manifestos de áudio/cenas, histórias, conquistas e `accessControl` — **Gate:** — (controle negativo `CN-8`)
- **Conclusão:** **zero** arquivos de área protegida no *diff* de `F6-R2`; nenhum `git add .` nem `git add -A` foi usado em nenhum *commit* do pacote.
- **Risco · decisão:** Áreas Protegidas (`AGENTS.md`) · Princípio de governança — **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

---

## 7. `BLOCO 5` · `F6-R1` — Superfícies adaptativas, *tokens*, barra lateral e orientação · `F6-SG-C`

> **`OR-2` — precondição formal e inegociável de TODO este bloco:**
> **nenhuma task `TK-C-*` é executável antes da concessão de `F6-SG-B` pelo fundador.**
>
> **`Q3` (congelada):** a composição deriva da **família de superfície** e do **conteúdo real**.
> **Nenhuma task deste bloco cria a regra "tablet = duas colunas".**
> **`Q4` (congelada):** `grid` e `displayScaleTablet` **ganham consumidor legítimo** ou têm a
> obsolescência **demonstrada de forma controlada**. *Token* morto não sobrevive por inércia — e
> também não é removido preventivamente.
> **`Q7` (congelada):** **`P-103` continua diferida à Fase 7.** Nenhuma task deste bloco corrige,
> reclassifica ou reabre `P-103`.
> **`OR-6`:** a orientação é o **último** passo do **último** pacote.

### 7.1 Faixas — leitura única

#### `TK-C-001` · Criar `src/hooks/useWindowBand.js`
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** ter **uma** leitura de faixa, em vez de comparações espalhadas.
- **Arquivos:** `src/hooks/useWindowBand.js` (**novo**) — **Símbolos/contratos:** `useWindowBand() → { width, height, isLandscape, band }`; `band ∈ { compacta, média, expandida }` derivada de `breakpoints.phone`, `breakpoints.tablet`, `breakpoints.tabletL`.
- **Precondições:** **`F6-SG-B` concedido** — **Depende de:** `TK-B-036` + concessão humana
- **Mudança esperada:** *hook* novo **sem consumidor**; usa `useWindowDimensions`; **nenhum breakpoint novo é criado** (`SD-11`).
- **Prova:** `TA-6` — **Gate:** **`G-RSP-7`** (nenhum quarto *breakpoint*), **`G-RSP-1`** (zero `Dimensions.get`)
- **Conclusão:** o *hook* existe, deriva as três faixas dos *breakpoints* existentes, e ninguém o consome ainda.
- **Risco · decisão:** `SD-11` · `D2` (três faixas) — **Auto:** sim · **Física futura:** não · **Commit:** `C-C1` · **Rollback:** reverter `C-C1`.

#### `TK-C-002` · Portões **`G-RSP-1`** e **`G-RSP-7`** — **criação apenas** — e confirmação de **`G-BP-1`**
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** lacrar duas proibições de `SD-11` de uma vez, **sem** reutilizar o ID de um portão herdado com outro significado.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** **`G-RSP-1`** (canônico: **zero `Dimensions.get` em `src/`**); **`G-RSP-7`** (**novo**: o conjunto de *breakpoints* permanece com **três** faixas — nenhum quarto *breakpoint* nasce); **`G-BP-1`** (**herdado, `P-30`**: zero literais `768`) permanece **como está e não é reescrito**.
- **Precondições:** `TK-C-001` — **Depende de:** `TK-C-001`
- **Mudança esperada:** duas asserções novas (`G-RSP-1`, `G-RSP-7`); hoje o repositório já tem **zero** `Dimensions.get` — o portão impede a regressão. **`G-BP-1` não é alterado.**
- **Prova:** **provas independentes** — `G-RSP-1` fica vermelho sob `MT-7` (`TK-C-047`, com verificação antecipada em `TK-A-095`); `G-RSP-7` fica vermelho sob `MT-21` (`TK-C-055`); `G-BP-1` fica vermelho sob `MT-11` (`TK-C-051`). — **Gate:** `G-RSP-1`, `G-RSP-7` (**criação**); `G-BP-1` (**confirmação**)
- **Conclusão:** verdes no estado atual; vermelhos sob os respectivos mutantes.
- **Risco · decisão:** `SD-11` · `P-30` — **Auto:** sim · **Física futura:** não · **Commit:** `C-C1` · **Rollback:** reverter `C-C1`.

#### `TK-C-003` · Migrar as comparações de largura existentes para `useWindowBand`
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** eliminar a política implícita espalhada, **sem** mudar a política.
- **Arquivos:** os ~34 pontos que hoje leem `useWindowDimensions` — ⚠️ **INCERTEZA LOCALIZADA** quanto ao subconjunto que decide **composição** (alvo) versus o que decide **medida pontual** (fora do alvo); resolver por leitura dirigida na implementação — **Símbolos/contratos:** `breakpoints.phone` (13 consumidores), `breakpoints.tabletL` (`ContentContainer.js:25`).
- **Precondições:** `TK-C-002` — **Depende de:** `TK-C-002`
- **Mudança esperada:** migração **comportamentalmente neutra**: os mesmos limiares, agora lidos de um lugar só. "O que falta é a política, não a medida."
- **Prova:** `TA-6`, `CN-5` — **Gate:** **`G-RSP-5`** (nenhuma comparação literal de largura decidindo composição fora do *hook*)
- **Conclusão:** o comportamento na faixa compacta é idêntico ao anterior em captura.
- **Risco · decisão:** **`RG-5`** — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C2` · **Rollback:** reverter `C-C2`.

### 7.2 Arquétipos por família de superfície (`D3`, `Q3`)

#### `TK-C-004` · Definir os quatro arquétipos **sem** adoção
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** oferecer composição derivada de família + conteúdo, jamais uma regra universal de colunas.
- **Arquivos:** `src/components/layout/HubSurface.js`, `EditorialSurface.js`, `ImmersiveSurface.js`, `GameSurface.js` (**novos**, ao lado de `AppScreen.js`, `CenteredContent.js`, `SafeScreenHeader.js`) — **Símbolos/contratos:** contrato de composição por família.
- **Precondições:** `TK-C-003` — **Depende de:** `TK-C-003`
- **Mudança esperada:** quatro componentes novos, **nenhum consumidor**; cada um documenta **qual característica do conteúdo** governa sua composição.
- **Prova:** **`TA-14`** (arquétipos por família — propriedade demonstrável em Node: mesma família, faixas diferentes ⇒ composições distintas) — **Gate:** **`G-RSP-5`**
- **Conclusão:** os quatro existem, e nenhum contém a expressão "duas colunas" como regra de faixa.
- **Risco · decisão:** **`Q3`** · `D3` · Princípio III — **Auto:** sim · **Física futura:** não · **Commit:** `C-C2` · **Rollback:** reverter `C-C2`.

#### `TK-C-005` · `EditorialSurface` — largura de leitura governada pelo texto
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** a família editorial adapta por **legibilidade**, não por contagem de colunas.
- **Arquivos:** `src/components/layout/EditorialSurface.js`, `src/components/layout/ContentContainer.js` (**consumidor existente de `tabletL`**) — **Símbolos/contratos:** largura máxima de leitura; centralização.
- **Precondições:** `TK-C-004` — **Depende de:** `TK-C-004`
- **Mudança esperada:** a medida de linha é limitada por legibilidade; na faixa expandida **não** surge coluna estreita cercada de vazio (`SD-3`).
- **Prova:** captura nas três faixas — **Gate:** **`G-RSP-6`**
- **Conclusão:** o texto tem medida confortável em `>=900dp`, sem vazio dominante.
- **Risco · decisão:** `SD-3` · `Q3` — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C3` · **Rollback:** reverter `C-C3`.

#### `TK-C-006` · Adoção da família **Editorial** nas quatro telas
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** primeira adoção real, na família de menor risco.
- **Arquivos:** `src/screens/StoryDetailScreen.js`, `ReflectionScreen.js`, `PostStoryHubScreen.js`, `ParentAreaScreen.js` — **Símbolos/contratos:** `EditorialSurface`.
- **Precondições:** `TK-C-005` — **Depende de:** `TK-C-005`
- **Mudança esperada:** as quatro telas passam a compor pelo arquétipo; conteúdo e hierarquia preservados.
- **Prova:** capturas nas três faixas por tela — **Gate:** **`G-RSP-6`**
- **Conclusão:** 4 telas × 3 faixas = **12 capturas** sem vazio dominante e sem perda de conteúdo.
- **Risco · decisão:** `SD-2`, `SD-3` — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C3` · **Rollback:** reverter `C-C3`.

#### `TK-C-007` · `HubSurface` — densidade governada pela quantidade real de itens
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** a família Hub adapta por **inventário**, não por faixa.
- **Arquivos:** `src/components/layout/HubSurface.js` — **Símbolos/contratos:** composição derivada da contagem e do tamanho natural do item.
- **Precondições:** `TK-C-004` — **Depende de:** `TK-C-004`
- **Mudança esperada:** a composição responde ao conteúdo real; a faixa é **insumo**, não regra.
- **Prova:** `TA-7`, **`TA-14`** — **Gate:** **`G-RSP-5`**
- **Conclusão:** com o mesmo conteúdo, faixas diferentes produzem composição distinta e coerente (`SD-2`).
- **Risco · decisão:** **`Q3`** — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C4` · **Rollback:** reverter `C-C4`.

#### `TK-C-008` · Adoção da família **Hub** nas quatro telas
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** segunda adoção real.
- **Arquivos:** `src/screens/HomeScreen.js`, `BrincarScreen.js`, `TrophiesScreen.js`, `AtelierGalleryScreen.js` — **Símbolos/contratos:** `HubSurface`; listas virtualizadas e chaves estáveis preservadas.
- **Precondições:** `TK-C-007` — **Depende de:** `TK-C-007`
- **Mudança esperada:** adoção sem alterar progresso, conquistas nem `accessControl` (**áreas protegidas**).
- **Prova:** capturas nas três faixas por tela; **`CN-8`** verificado no *commit* `C-C4` (`TK-C-064`) — **Gate:** **`G-RSP-5`**
- **Conclusão:** **12 capturas** coerentes; nenhuma área protegida tocada no *diff*.
- **Risco · decisão:** **áreas protegidas** (progresso, conquistas, `accessControl`) — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C4` · **Rollback:** reverter `C-C4`.

#### `TK-C-009` · Painel de apoio da Galeria do Ateliê na faixa expandida
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** aproveitar a largura com **conteúdo já existente**, sem inventar destino novo.
- **Arquivos:** `src/screens/AtelierGalleryScreen.js` — **Símbolos/contratos:** painel derivado de informação que a tela já possui.
- **Precondições:** `TK-C-008` — **Depende de:** `TK-C-008`
- **Mudança esperada:** o espaço extra recebe conteúdo existente; **nenhuma funcionalidade nova** entra pela porta dos fundos.
- **Prova:** captura em `>=900dp`; **`CN-12`** (nenhuma funcionalidade nova em `R1`, `TK-C-027`) — **Gate:** **`G-RSP-6`**
- **Conclusão:** a faixa expandida mostra mais do que já existia, e nada que não existia.
- **Risco · decisão:** `SD-3` · fronteira de escopo (sem funcionalidade nova) — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-C4` · **Rollback:** reverter `C-C4`.

#### `TK-C-010` · `ImmersiveSurface` — a obra e a cena mandam na composição
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** integrar a família imersiva **respeitando** o espaço lógico já entregue por `F6-R3`.
- **Arquivos:** `src/components/layout/ImmersiveSurface.js` — **Símbolos/contratos:** consome `useViewportProjection`; **não** reimplementa projeção.
- **Precondições:** `TK-C-004`, `TK-A-030` — **Depende de:** `TK-C-004`, `TK-A-030`
- **Mudança esperada:** o arquétipo delega a projeção ao *hook* de `R3`; **nenhuma arquitetura paralela de canvas nasce aqui**.
- **Prova:** `TA-7` + `G-CVS-1` continua verde — **Gate:** **`G-RSP-4`** (nenhum módulo de *layout* redeclara valores já presentes em `tokens.js` nem reimplementa projeção), `G-CVS-1`
- **Conclusão:** o arquétipo não contém aritmética de projeção própria.
- **Risco · decisão:** **`RG-2`** (arquitetura paralela) — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-C5` · **Rollback:** reverter `C-C5`.

#### `TK-C-011` · Adoção da família **Imersiva** — com `SD-8` revalidado
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** adotar sem colocar a obra infantil em risco de novo.
- **Arquivos:** `src/screens/StoryBookScreen.js`, `src/screens/ColoringScreen.js`, `src/screens/AtelierCanvasScreen.js` — **Símbolos/contratos:** `ImmersiveSurface`; `StoryBookScreen` tocado **apenas** no necessário (**F9** fora de escopo).
- **Precondições:** `TK-C-010` — **Depende de:** `TK-C-010`
- **Mudança esperada:** adoção mínima; a **matriz obrigatória de 17 casos** (§28.1, `TK-A-063`..`TK-A-079`) é **reexecutada integralmente** para provar que nada regrediu. Os 6 casos adicionais `E1`..`E6` são reexecutados **quando o acervo do aparelho permitir** e o resultado é registrado.
- **Prova:** reexecução de §28.1 — **Gate:** `G-CVS-1`, `G-CVS-2`, **`G-CVS-3`**, `G-CMP-1`..**`G-CMP-6`**
- **Conclusão:** **17 de 17 obrigatórios `PASS`** novamente. Um único `FAIL` nos 17 reabre `SD-8` e **bloqueia** `F6-SG-C`.
- **Risco · decisão:** **`RG-1`** · `SD-8` (**continua bloqueador absoluto**) — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C5` · **Rollback:** reverter `C-C5`.

#### `TK-C-012` · `GameSurface` é **oferecido**, nunca imposto
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** cumprir §6.3 — refatorar os cinco jogos seria risco sem requisito.
- **Arquivos:** `src/components/layout/GameSurface.js` — **Símbolos/contratos:** arquétipo disponível, adoção diferida a **F12A**.
- **Precondições:** `TK-C-010` — **Depende de:** `TK-C-010`
- **Mudança esperada:** o arquétipo existe e é documentado; **nenhuma** tela de jogo é migrada nesta fase.
- **Prova:** `git diff` sem telas de jogo — **Gate:** — (fronteira de escopo; controle negativo **`CN-12`**)
- **Conclusão:** `MonteACena*`, `ParesDoBeni`, `Palavrinhas`, `CadeAOvelhinha` e `QuizScreen` permanecem intocados.
- **Risco · decisão:** fronteira com **F12A** — **Auto:** sim · **Física futura:** não · **Commit:** `C-C6` · **Rollback:** reverter `C-C6`.

#### `TK-C-013` · Nenhuma arquitetura paralela — os arquétipos **estendem** o que existe
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** cumprir a Governança da Arquitetura: estender antes de criar paralelo.
- **Arquivos:** `src/components/layout/` — **Símbolos/contratos:** relação dos arquétipos com `AppScreen.js`, `CenteredContent.js`, `SafeScreenHeader.js`, `ContentContainer.js`.
- **Precondições:** `TK-C-012` — **Depende de:** `TK-C-012`
- **Mudança esperada:** os arquétipos compõem com os componentes existentes; nenhum deles duplica responsabilidade já existente.
- **Prova:** revisão + `G-RSP-4` verde — **Gate:** **`G-RSP-4`**
- **Conclusão:** nenhum componente de *layout* existente ficou órfão ou duplicado.
- **Risco · decisão:** Governança da Arquitetura · Princípio III — **Auto:** parcial · **Física futura:** não · **Commit:** `C-C6` · **Rollback:** reverter `C-C6`.

#### `TK-C-014` · Portões **`G-RSP-5`** e **`G-RSP-6`** — **criação apenas**
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** lacrar a política única de faixa e a ausência de vazio na faixa expandida, **com IDs novos e inéditos** — os IDs `G-RSP-1` e `G-RSP-2` já têm significado canônico distinto no PLAN.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** **`G-RSP-5`** (**novo**: nenhuma regra universal de colunas; nenhuma comparação literal de largura decidindo composição fora de `useWindowBand`/arquétipo); **`G-RSP-6`** (**novo**: nenhuma composição produz coluna estreita cercada de vazio em `>=900dp`).
- **Precondições:** `TK-C-013` — **Depende de:** `TK-C-013`
- **Mudança esperada:** duas asserções novas.
- **Prova:** **provas independentes** — `G-RSP-5` fica vermelho sob `MT-19` (`TK-C-053`) e sob `MT-22` (`TK-C-056`); `G-RSP-6` fica vermelho sob `MT-20` (`TK-C-054`). — **Gate:** `G-RSP-5`, `G-RSP-6` (**criação**)
- **Conclusão:** verdes no estado correto; vermelhos sob os mutantes.
- **Risco · decisão:** `SD-2`, `SD-3` · **`Q3`** — **Auto:** sim · **Física futura:** não · **Commit:** `C-C9` · **Rollback:** reverter `C-C9`.
- **Nota de emenda (`A-01`):** na r1 esta task reivindicava `G-RSP-1` e `G-RSP-2` com significados que o PLAN não lhes atribui. Os canônicos foram restaurados (`G-RSP-1` = zero `Dimensions.get`, criado em `TK-C-002`; `G-RSP-2` = `grid`/`displayScaleTablet` com consumidor, criado em `TK-C-015`).

### 7.3 *Tokens* — `Q4` e `Q9`

#### `TK-C-015` · **`Q4` · passo 1 — determinação**: `grid` e `displayScaleTablet` têm ou não consumidor legítimo?
- **Pacote · Subportão:** `F6-R1.3` · `F6-SG-C` — **Objetivo:** cumprir `Q4` **em sequência**, não por critério disjuntivo resolvido ao gosto de quem implementa (emenda `A-19`).
- **Arquivos:** `src/theme/tokens.js` (**somente leitura nesta task**), `src/components/layout/*` — **Símbolos/contratos:** `grid`, `displayScaleTablet`; `P-82`/`P-148`.
- **Precondições:** `TK-C-014` — **Depende de:** `TK-C-014`
- **Sequência obrigatória (esta task executa apenas o passo 1):**
  1. **Determinar**, por leitura dirigida dos quatro arquétipos já escritos (`TK-C-004`..`TK-C-013`), se existe **consumidor legítimo** para cada um dos dois *tokens* — isto é, um consumidor que precise do valor **pela sua semântica**, não um consumidor criado para justificar a existência do *token*.
  2. O passo 2 (integrar o consumidor **ou** declarar obsolescência controlada) é executado em **`TK-C-061`**, e só depois desta determinação.
- **Regras invioláveis (decisão do fundador):** **é proibido criar consumidor artificial apenas para salvar o *token***; **é proibido remover o *token* antes da determinação**. Um dos dois *tokens* pode ter desfecho diferente do outro — a determinação é **por *token***.
- **Mudança esperada nesta task:** **nenhuma mudança em `tokens.js`.** Produz-se um registro escrito, por *token*, com o veredito e a evidência (`arquivo:linha` do consumidor candidato, ou a demonstração de que não existe).
- **Prova:** `TA-8` — **Gate:** — (esta task **determina**; o portão é criado em `TK-C-061`)
- **Conclusão:** cada um dos dois *tokens* tem veredito escrito: **"consumidor legítimo identificado em `arquivo:linha`"** ou **"sem consumidor legítimo — candidato a obsolescência controlada"**.
- **Risco · decisão:** **`Q4`** · decisão do fundador ("não remova *tokens* preventivamente") — **Auto:** parcial · **Física futura:** não · **Commit:** `C-GOV1` (registro) · **Rollback:** não aplicável (nada muda no código).

#### `TK-C-016` · *Tokens* de navegação com semântica **adaptativa** declarada
- **Pacote · Subportão:** `F6-R1.3`/`R1.4` · `F6-SG-C` — **Objetivo:** cumprir a autorização `Q9` do fundador de tocar `src/theme/tokens.js`.
- **Arquivos:** `src/theme/tokens.js` — **Símbolos/contratos:** *token* de largura estrutural da barra lateral (§19.1).
- **Precondições:** `TK-C-061` (`Q4` resolvida) — **Depende de:** `TK-C-061`
- **Mudança esperada:** o *token* declara **semântica** (largura estrutural de navegação lateral, que responde à faixa e ao conteúdo), não um número herdado. **Mover `width: 200` para `sidebarWidth: 200` NÃO cumpre o requisito** (§19.1).
- **Prova:** `TA-9` — **Gate:** **`G-SID-2`**
- **Conclusão:** o *token* tem semântica declarada e nenhum consumidor o trata como constante fixa de 200.
- **Risco · decisão:** **`Q9`** — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-C7` · **Rollback:** reverter `C-C7`.

#### `TK-C-017` · Restrições verificáveis de `Q9` — as seis, uma a uma
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** transformar as seis restrições de §19.1 em asserções, não em promessas.
- **Arquivos:** `scripts/smoke.js`, `src/theme/tokens.js` — **Símbolos/contratos:** as seis restrições de §19.1.
- **Precondições:** `TK-C-016` — **Depende de:** `TK-C-016`
- **Mudança esperada:** cada restrição ganha uma verificação — estática quando possível, documental quando não.
- **Prova:** `TA-9`; as provas vermelhas correspondentes são `MT-15` (`TK-C-024` → `G-SID-2`) e `MT-16` (`TK-C-052` → `G-SID-3`) — **Gate:** `G-SID-2`, `G-SID-3`, `G-RSP-4`, `CN-1`, `SD-4`
- **Conclusão:** as **seis** restrições verificadas, com o método de verificação nomeado para cada uma: (1) `G-SID-2` · (2) `G-SID-2` · (3) `G-RSP-4` · (4) `G-SID-3` + §41.4 · (5) `SD-4` + captura em `SG-C` · (6) `CN-1`.
- **Risco · decisão:** **`Q9`** — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C7` · **Rollback:** reverter `C-C7`.

#### `TK-C-018` · Nenhum *token* removido sem substituto identificado
- **Pacote · Subportão:** `F6-R1.3` · `F6-SG-C` — **Objetivo:** cumprir literalmente "não remova tokens preventivamente".
- **Arquivos:** `src/theme/tokens.js` — **Símbolos/contratos:** inventário antes/depois.
- **Precondições:** `TK-C-017` — **Depende de:** `TK-C-017`
- **Mudança esperada:** qualquer remoção declara o substituto e o consumidor migrado; **design system** não é alterado além do autorizado por `Q9` (**área protegida**).
- **Prova:** `git diff` de `tokens.js` revisado item a item — **Gate:** **`G-RSP-2`** (`grid` e `displayScaleTablet` têm consumidor **ou** obsolescência registrada)
- **Conclusão:** o *diff* de `tokens.js` é integralmente justificado por `Q4` ou `Q9`.
- **Risco · decisão:** **área protegida (design system)** · `Q4` · `Q9` — **Auto:** não · **Física futura:** não · **Commit:** `C-C7` · **Rollback:** reverter `C-C7`.

### 7.4 Barra lateral (`F6-R1.4`) — defeitos 1 a 3

> **Emenda `A-04`/`A-20` — tasks autocontidas.** Na r1 destas `TASKS` os defeitos apareciam apenas
> como "Defeito 1 / 2 / 3", obrigando quem executasse a abrir o PLAN para saber o que corrigir. Cada
> task abaixo passa a **transcrever literalmente** a linha correspondente da tabela do **PLAN §19**
> (defeito, linha do arquivo e alvo), de modo que a task seja **executável e verificável sem consulta
> externa**. Também estão restaurados `G-SID-1` na semântica canônica do PLAN §26
> (`TabletSidebar.js` importa `theme/tokens` e **não** `theme/colors`, mantendo os cinco alvos de
> guia), o teste `TA-10` e os mutantes `MT-9`, `MT-10`, `MT-15` e `MT-16`.
>
> **Invariante que atravessa as três tasks (PLAN §19.1):** os **cinco** `registerGuideTarget` da
> barra lateral — `adventures.sidebarTab`, `home.sidebarTab`, `atelier.sidebarTab`,
> `stars.sidebarTab`, `profile.sidebarTab` — **permanecem registrados e mensuráveis**. Nenhuma das
> três correções pode removê-los, renomeá-los ou torná-los condicionais. Verificação estática
> dedicada: `TA-9` em **`TK-C-063`**; prova vermelha: `MT-10` em **`TK-C-050`**.
>
> **Fronteira com `B2` (PLAN §19, defeitos 4 e 5):** `navButton: paddingVertical 13` + ícone 26 ⇒
> ≈52pt, **abaixo** do mínimo 56×56 de `RF-A7` (`TabletSidebar.js:200`, `:209`), e `progressLabel`
> 10px / `stars` 11px, **abaixo** do piso de 13px de `RF-C12` (`:192`, `:173`). Ambos são
> **NÃO tocados aqui** — pertencem ao Bloco **`B2`** (`AD-3`), que **continua bloqueado**.

#### `TK-C-019` · Defeito 1 de §19 — `styles.sidebar: { width: 200 }` fixo (`TabletSidebar.js:125`)
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** corrigir, com texto literal do PLAN §19, o defeito 1: **"`styles.sidebar: { width: 200 }` fixo — idêntico a 600dp e a 1366dp"**, linha **`:125`**. Alvo declarado pelo PLAN: **"A largura estrutural sai do componente e passa à fonte canônica do *design system*, com semântica adaptativa — `Q9` AUTORIZADA, contrato em §19.1"**.
- **Arquivos:** `src/components/TabletSidebar.js` (`:125`), `src/theme/tokens.js`, `src/navigation/AppNavigator.js` — **Símbolos/contratos:** `styles.sidebar.width`; *token* semântico definido em `TK-C-016`, cruzando **papel de navegação** (*rail*/compacta × completa) × **faixa** (`600–899dp` × `>=900dp`).
- **Precondições:** `TK-C-018` — **Depende de:** `TK-C-016`, `TK-C-018`
- **Mudança esperada:** o literal `200` desaparece de `TabletSidebar.js`; a largura estrutural passa a vir **exclusivamente** de `src/theme/tokens.js` e **difere** entre a faixa média e a expandida (restrição 5 de §19.1 — "mover `width: 200` para `sidebarWidth: 200` **não** cumpre o requisito"). **Nenhum novo *hardcode*** em `TabletSidebar.js`, `AppNavigator.js` ou arquétipo (restrição 2).
- **Prova:** portão estático de ausência de literal de largura estrutural + captura em `600–899dp` e em `>=900dp` mostrando larguras **distintas** — **Gate:** **`G-SID-2`**
- **Conclusão:** `TabletSidebar.js` não contém literal de largura estrutural; a largura vem de `tokens.js`; as duas faixas exibem composições de largura distintas.
- **Risco · decisão:** `SD-4` · **`Q9`** · `RG-13` · **área protegida (design system), autorizada** — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C8` · **Rollback:** reverter `C-C8`.

#### `TK-C-020` · Defeito 2 de §19 — `navButtons: { gap: 2 }` sem `flex: 1` ⇒ ~700pt de vazio (`TabletSidebar.js:196`)
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** corrigir, com texto literal do PLAN §19, o defeito 2: **"`navButtons: { gap: 2 }` sem `flex: 1` e sem ancoragem inferior ⇒ ~700pt de vazio vertical em iPad retrato"**, linha **`:196`**. Alvo declarado pelo PLAN: **"Distribuição vertical com `flex` e ancoragem; zero destino novo"**.
- **Arquivos:** `src/components/TabletSidebar.js` (`:196`) — **Símbolos/contratos:** `styles.navButtons` (`gap`, `flex`, ancoragem inferior); os cinco `registerGuideTarget` **inalterados**.
- **Precondições:** `TK-C-019` — **Depende de:** `TK-C-019`
- **Mudança esperada:** a coluna de navegação passa a distribuir-se verticalmente (`flex`) com ancoragem inferior, eliminando o vazio de ~700pt em iPad retrato. **Zero destino de navegação novo** — a correção é de distribuição, não de conteúdo. **Defeitos 4 e 5 continuam intocados** (`B2`).
- **Prova:** **não há portão estático capaz de medir vazio vertical** — a prova é **captura física comparativa em iPad retrato** (antes/depois), com o vazio medido em pontos, dentro de `SD-4`; complementarmente, `G-SID-4` (`TK-C-023`) garante que a redistribuição não introduziu destino novo — **Gate:** **`G-SID-4`** (não-invasão) · a correção em si é verificada por **captura física** (`SD-4`, cenário §28 #16)
- **Conclusão:** o vazio vertical de ~700pt não é mais observável em iPad retrato; a contagem de destinos da barra é idêntica à anterior; nenhum `registerGuideTarget` foi perdido.
- **Risco · decisão:** `SD-4` · fronteira com **`B2`** (**bloqueado**) — **Auto:** não (**não automatizável**: layout nativo + aparelho físico, §11.11) · **Física futura:** **sim (obrigatória)** · **Commit:** `C-C8` · **Rollback:** reverter `C-C8`.

#### `TK-C-021` · Defeito 3 de §19 — `import { colors } from '../theme/colors'` (`TabletSidebar.js:4`)
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** corrigir, com texto literal do PLAN §19, o defeito 3: **"`import { colors } from '../theme/colors'` — tema legado concorrente"**, linha **`:4`**. Alvo declarado pelo PLAN: **"Passa a consumir `src/theme/tokens.js`"**.
- **Arquivos:** `src/components/TabletSidebar.js` (`:4` e todos os pontos de uso de `colors`) — **Símbolos/contratos:** `import { colors } from '../theme/colors'` → consumo de **`src/theme/tokens.js`**; os cinco `registerGuideTarget` **inalterados**.
- **Precondições:** `TK-C-020` — **Depende de:** `TK-C-020`
- **Mudança esperada:** `TabletSidebar.js` deixa de importar `theme/colors` e passa a consumir `src/theme/tokens.js`. A troca é **de origem, não de valor**: nenhuma cor da barra muda de aparência sem registro explícito. **Nenhum destino de navegação novo** (`D4`).
- **Prova:** **`TA-10`** — portão estático: `TabletSidebar` **não** importa mais `theme/colors`; prova vermelha correspondente: **`MT-9`** (`TK-C-049`) — **Gate:** **`G-SID-1`**
- **Conclusão:** zero importações de `theme/colors` em `TabletSidebar.js`; `theme/tokens.js` é a origem única; os cinco alvos de guia continuam registrados (verificação dedicada em `TK-C-063`).
- **Risco · decisão:** `SD-4` · **área protegida (design system), autorizada por `Q9`** · `accessControl` **intocado** — **Auto:** **sim** (portão estático) · **Física futura:** **sim** (conferência visual de cor) · **Commit:** `C-C8` · **Rollback:** reverter `C-C8`.

#### `TK-C-022` · Defeitos 4 e 5 permanecem em `B2` — asserção de não-invasão
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** provar que a Fase 6 **não** começou `B2` por dentro.
- **Arquivos:** artefato de evidência + `git diff` de `C-C8` — **Símbolos/contratos:** defeito 4 de §19 (`navButton: paddingVertical 13` + ícone 26 ⇒ ≈52pt vs mínimo 56×56 de `RF-A7`, `:200`/`:209`) e defeito 5 (`progressLabel` 10px / `stars` 11px vs piso de 13px de `RF-C12`, `:192`/`:173`).
- **Precondições:** `TK-C-021` — **Depende de:** `TK-C-021`
- **Mudança esperada:** **nenhuma** — registro de que 4 e 5 continuam abertos e fora de escopo.
- **Prova:** revisão linha a linha do *diff* de `C-C8`, verificando que **nenhuma** linha altera `paddingVertical`, o tamanho do ícone de `navButton`, `progressLabel` ou `stars` — **Gate:** — (verificação documental; o portão de destino novo é `G-SID-4`, criado em `TK-C-023`)
- **Conclusão:** nenhuma linha do *diff* endereça os defeitos 4 ou 5. **`B2` continua bloqueado.**
- **Risco · decisão:** **`B2` bloqueado** · `AD-3` — **Auto:** parcial · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-023` · Portões `G-SID-1`, `G-SID-2`, `G-SID-3` e `G-SID-4` — **criação apenas**
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** criar os quatro portões da barra lateral. **Esta task não prova nenhum deles** — a prova vermelha de cada um é independente e está em task própria (emenda `A-09`/`A-10`).
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:**
  - **`G-SID-1`** — `TabletSidebar.js` importa `theme/tokens` e **não** `theme/colors`; mantém os **cinco** alvos de guia;
  - **`G-SID-2`** — `TabletSidebar.js`, `AppNavigator.js` e os arquétipos **não** contêm literal de largura estrutural de navegação; a largura vem de `tokens.js`;
  - **`G-SID-3`** — nenhum consumidor deriva "espaço disponível" subtraindo o *token* de largura: quem precisa do espaço **mede**;
  - **`G-SID-4`** — a barra lateral **não ganha destino de navegação novo** (`D4` · `CN-5`).
- **Precondições:** `TK-C-022` — **Depende de:** `TK-C-022`
- **Mudança esperada:** **quatro** asserções novas em `scripts/smoke.js`. **Nenhuma mutação é injetada aqui.**
- **Prova:** os quatro portões **verdes** no estado correto do código — **Gate:** `G-SID-1`, `G-SID-2`, `G-SID-3`, `G-SID-4` (criação)
- **Conclusão:** os quatro portões existem e estão verdes. As provas vermelhas **independentes** são: `G-SID-1` ← `MT-9` (**`TK-C-049`**) **e** `MT-10` (**`TK-C-050`**) · `G-SID-2` ← `MT-15` (**`TK-C-024`**) · `G-SID-3` ← `MT-16` (**`TK-C-052`**) · `G-SID-4` ← `MT-23` (**`TK-C-057`**).
- **Risco · decisão:** `Q9` · `RG-12` — **Auto:** sim · **Física futura:** não · **Commit:** `C-C9` · **Rollback:** reverter `C-C9`.

#### `TK-C-024` · Mutante `MT-15` — largura estrutural da barra reintroduzida **fora de `tokens.js`**
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** provar que **`G-SID-2`** fica **vermelho** quando a largura estrutural volta a ser literal no componente — inclusive no caso "renomear e declarar resolvido" (§19.1: `sidebarWidth: 200` sozinho **não** cumpre `F6-R1.4`).
- **Arquivos:** mutação temporária em `src/components/TabletSidebar.js` (**nunca commitada**) — **Símbolos/contratos:** literal de largura estrutural reintroduzido no componente.
- **Precondições:** `TK-C-023` — **Depende de:** `TK-C-023`
- **Mudança esperada:** **defeito deliberado, uma única mutação** — `MT-15`, texto canônico do PLAN §25: **"Reintroduzir largura estrutural de barra lateral fora de `tokens.js`"**. Esperado: `G-SID-2` **vermelho**.
- **Prova:** portão vermelho observado e registrado — **Gate:** **`G-SID-2`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado. *(`MT-16` — derivar largura disponível a partir do *token* em vez de medir — é mutação **distinta**, provada isoladamente em **`TK-C-052`** contra `G-SID-3`.)*
- **Risco · decisão:** **`Q9`** · `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

### 7.5 Fronteiras preservadas

#### `TK-C-025` · `P-103` **não** é tocada pela Fase 6
- **Pacote · Subportão:** `F6-R1.*` · `F6-SG-C` — **Objetivo:** cumprir `Q7` literalmente.
- **Arquivos:** `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` (**somente verificação**) — **Símbolos/contratos:** `P-103`.
- **Precondições:** **nenhuma** — **Depende de:** — *(emenda `A-21`: a r1 declarava `Precondições: TK-C-024` e `Depende de: —`, o que era contraditório. Esta é uma verificação documental **independente**, executável a qualquer momento dentro de `F6-SG-C`; para efeito de ordenação, é executada junto ao fechamento de `F6-R1.4`, sem que isso constitua dependência técnica.)*
- **Mudança esperada:** **nenhuma** — asserção de que `P-103` continua com a mesma classificação e diferida à **Fase 7**.
- **Prova:** revisão documental — **Gate:** —
- **Conclusão:** nenhuma task da Fase 6 corrigiu, reclassificou ou reabriu `P-103`.
- **Risco · decisão:** **`Q7`** (congelada) — **Auto:** sim · **Física futura:** não · **Commit:** nenhum (verificação) · **Rollback:** não aplicável.

#### `TK-C-026` · Equivalente lateral da geometria do *callout* do guia
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** fechar a condicional `!isTablet` que hoje deixa a composição lateral sem geometria de *callout*.
- **Arquivos:** `src/navigation/AppNavigator.js` e a camada de *overlay* do guia — ⚠️ **INCERTEZA LOCALIZADA** quanto ao arquivo exato que renderiza o *callout*. **A incerteza é resolvida por leitura dirigida dentro desta própria task, antes de qualquer edição**: localizar a expressão `width / TAB_DEFS.length + insets.bottom` e a condicional `!isTablet` que a governa (PLAN §19.1), e **congelar documentalmente** o arquivo e a linha antes de alterar runtime — **Símbolos/contratos:** condicional `!isTablet`; aritmética `width / TAB_DEFS.length + insets.bottom`.
- **Precondições:** `TK-C-021` — **Depende de:** `TK-C-021`
- **Mudança esperada:** a composição lateral ganha geometria de *callout* equivalente à da barra inferior; o comportamento na faixa compacta é **preservado bit a bit** (`CN-1`). **Qual história o tour aponta continua sendo F7** — esta task fornece apenas a geometria.
- **Prova:** **`TA-15`** — verificação estrutural da geometria do alvo de guia nas três faixas (a parcela automatizável); a parcela de geometria real **exige aparelho** (§11.11) e é coberta por vídeo do tour em telefone **e** iPad — **Gate:** **`G-RSP-4`**
- **Conclusão:** o *callout* aponta corretamente nas três faixas; o arquivo do *callout* está nomeado e congelado no registro da task; a faixa compacta permanece idêntica.
- **Risco · decisão:** `RG-6` · fronteira com **F7** — **Auto:** parcial (`TA-15`) · **Física futura:** **sim (obrigatória)** · **Commit:** `C-C6` · **Rollback:** reverter `C-C6`.

#### `TK-C-027` · Portões `G-RSP-4` e `G-SID-4` — controles negativos `CN-5` e `CN-12`
- **Pacote · Subportão:** `F6-R1.*` · `F6-SG-C` — **Objetivo:** provar que `F6-R1` não criou *design system* paralelo, não acrescentou destino de navegação e não introduziu funcionalidade nova.
- **Arquivos:** `scripts/smoke.js`; `git diff` do pacote — **Símbolos/contratos:** **`CN-5`** (significado canônico do PLAN §24: **nenhum destino novo aparece na barra lateral**, `D4`) e **`CN-12`** (novo: **nenhuma funcionalidade nova entra pela porta dos fundos em `R1`**).
- **Precondições:** `TK-C-026` — **Depende de:** `TK-C-026`
- **Mudança esperada:** portão + evidência comparativa. **Nenhuma mutação injetada aqui** — a prova vermelha de `G-RSP-4` é `MT-32` (**`TK-C-059`**) e a de `G-SID-4` é `MT-23` (**`TK-C-057`**).
- **Prova:** inventário de destinos da barra antes/depois + revisão do `git diff` do pacote — **Gate:** **`G-RSP-4`**, **`G-SID-4`**
- **Conclusão:** nenhum módulo de *layout* redeclara valor já presente em `tokens.js`; a barra lateral tem exatamente os mesmos destinos de antes; nenhuma funcionalidade nova no app.
- **Risco · decisão:** `RD-3` · `Q9` restrição 3 — **Auto:** sim · **Física futura:** não · **Commit:** `C-C9` · **Rollback:** reverter `C-C9`.
- **Nota de emenda `A-01`:** a r1 desta task invocava `CN-5` como "faixa compacta inalterada" e `CN-7` como "nenhum destino/funcionalidade novo" — **ambos fora do significado canônico**. Os significados úteis foram preservados com IDs inéditos: **`CN-11`** (faixa compacta inalterada por `R1`) em **`TK-C-038`** e **`CN-12`** aqui. O `CN-7` canônico (**`P-30`/`G-BP-1` verdes — zero literais `768`**) é executado por **`TK-A-094`** e **`TK-C-051`**.

### 7.6 Orientação — **último** passo do **último** pacote (`F6-R1.1`)

> **Regra do fundador:** a rota técnica **permanece não escolhida** neste artefato.
> **Não instale `expo-screen-orientation`. Não presuma que uma dependência será necessária.**
>
> **Emenda `A-05` — portão de idioma de dispositivo antes da orientação.** `D2` proíbe decidir
> *layout* por modelo de aparelho. O portão canônico **`G-RSP-3`** (PLAN §26: **zero `Platform.isPad`
> e zero `expo-device` decidindo *layout*** em `src/`) tem task própria — **`TK-C-060`** — e ela é
> **precondição de ordem de toda esta subseção**: nenhuma task de `7.6` é iniciada antes de
> `TK-C-060` estar concluída e `G-RSP-3` verde. A prova vermelha independente de `G-RSP-3` é
> **`MT-31`** (**`TK-C-058`**). *(Regra de ordem, não de dependência de dados: `TK-C-060` não produz
> insumo consumido por `TK-C-028`; ela impede que a discussão de orientação reintroduza decisão por
> idioma de dispositivo.)*

#### `TK-C-028` · Provar o mecanismo real de orientação sob **CNG**
- **Pacote · Subportão:** `F6-R1.1` · `F6-SG-C` — **Objetivo:** partir de prova, não de suposição.
- **Arquivos:** `app.json` (**leitura**), `node_modules/@expo/config-plugins` (**leitura**) — **Símbolos/contratos:** `android/Orientation.js:24-35` (lê **apenas** `config.orientation` de topo; escreve `android:screenOrientation`); `ios/RequiresFullScreen.js:21-22, :55-67` (escreve `UISupportedInterfaceOrientations~ipad` com as quatro orientações quando `supportsTablet` && !`requireFullScreen`).
- **Precondições:** `TK-C-027` **e `TK-C-060` concluída com `G-RSP-3` verde** (emenda `A-05`) — **Depende de:** `TK-C-027`, `TK-C-060`
- **Mudança esperada:** **nenhuma** — relatório do mecanismo, confirmando que **o iPad já gira hoje** e que a rota (A) é **provadamente insuficiente** para o caso 4 de `D1`.
- **Prova:** citação de linha do plugin versionado — **Gate:** —
- **Conclusão:** relatório entregue com evidência de linha; nenhuma rota escolhida ainda.
- **Risco · decisão:** `D1` caso 4 · `RD-1` — **Auto:** não · **Física futura:** não · **Commit:** `C-C10` · **Rollback:** não aplicável.

#### `TK-C-029` · Identificar a **menor intervenção possível**
- **Pacote · Subportão:** `F6-R1.1` · `F6-SG-C` — **Objetivo:** não escolher a rota mais poderosa, e sim a mais barata que resolva os quatro casos de `D1`.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** rotas (A) configuração pura · (B) `expo-screen-orientation` · (C) *config plugin* próprio · (D) aberta.
- **Precondições:** `TK-C-028` — **Depende de:** `TK-C-028`
- **Mudança esperada:** **nenhuma** — comparação das rotas contra os quatro casos, com custo e reversibilidade.
- **Prova:** matriz rota × caso de `D1` — **Gate:** —
- **Conclusão:** a menor intervenção suficiente está identificada e justificada.
- **Risco · decisão:** **`RG-9`** — **Auto:** não · **Física futura:** não · **Commit:** `C-C10` · **Rollback:** não aplicável.

#### `TK-C-030` · Distinguir **configuração existente** de **necessidade real de API de *runtime***
- **Pacote · Subportão:** `F6-R1.1` · `F6-SG-C` — **Objetivo:** evitar dependência para resolver o que a configuração já resolve.
- **Arquivos:** `app.json`; artefato de evidência — **Símbolos/contratos:** o que exige decisão **em tempo de execução** versus o que é estático.
- **Precondições:** `TK-C-029` — **Depende de:** `TK-C-029`
- **Mudança esperada:** **nenhuma** — separação explícita dos casos.
- **Prova:** tabela caso → estático/runtime — **Gate:** —
- **Conclusão:** fica demonstrado se **existe** algum caso que só uma API de *runtime* resolve.
- **Risco · decisão:** política de dependências (**aprovação prévia obrigatória**) — **Auto:** não · **Física futura:** não · **Commit:** `C-C10` · **Rollback:** não aplicável.

#### `TK-C-031` · Registrar as implicações **iOS**
- **Pacote · Subportão:** `F6-R1.1` · `F6-SG-C` — **Objetivo:** documentar consequência de loja e de multitarefa.
- **Arquivos:** artefato de evidência — **Símbolos/contratos:** `UISupportedInterfaceOrientations~ipad`, `requireFullScreen`, **ITMS-90474**, Split View e Slide Over (`SD-9`).
- **Precondições:** `TK-C-030` — **Depende de:** `TK-C-030`
- **Mudança esperada:** **nenhuma** — registro de que restringir orientação no iPad conflita com multitarefa e com a regra de submissão.
- **Prova:** documentação versionada do Expo 54 + plugin — **Gate:** —
- **Conclusão:** implicações iOS registradas, incluindo o efeito sobre `SD-9`.
- **Risco · decisão:** **`RG-9`** · `SD-9` — **Auto:** não · **Física futura:** **sim** (§28 **#6** — Split View, arrastar o divisor, sair; numeração canônica do PLAN, emenda `A-12`) · **Commit:** `C-C10` · **Rollback:** não aplicável.

#### `TK-C-032` · Registrar as implicações **Android**
- **Pacote · Subportão:** `F6-R1.1` · `F6-SG-C` — **Objetivo:** documentar o limite do plugin em Android.
- **Arquivos:** artefato de evidência — **Símbolos/contratos:** `android:screenOrientation` único em `MainActivity`; ausência de variante por idioma de dispositivo.
- **Precondições:** `TK-C-031` — **Depende de:** `TK-C-031`
- **Mudança esperada:** **nenhuma** — registro do limite e do vão de validação (`P8`, sem tablet Android).
- **Prova:** `android/Orientation.js:24-35` — **Gate:** —
- **Conclusão:** implicações Android registradas, com o vão de aparelho declarado.
- **Risco · decisão:** `RG-9` · `P8` — **Auto:** não · **Física futura:** **bloqueada por indisponibilidade de aparelho** · **Commit:** `C-C10` · **Rollback:** não aplicável.

#### `TK-C-033` · Registrar a necessidade (ou não) de **novo *build* nativo**
- **Pacote · Subportão:** `F6-R1.1` · `F6-SG-C` — **Objetivo:** tornar explícito o custo operacional da rota escolhida.
- **Arquivos:** artefato de evidência — **Símbolos/contratos:** CNG; `eas.json` (**não alterado**).
- **Precondições:** `TK-C-032` — **Depende de:** `TK-C-032`
- **Mudança esperada:** **nenhuma** — registro de que rotas (B) e (C) exigem novo *build* nativo, e do que isso implica para a validação física.
- **Prova:** documentação Expo 54 — **Gate:** —
- **Conclusão:** o custo de *build* de cada rota está declarado antes da escolha.
- **Risco · decisão:** `RG-9` — **Auto:** não · **Física futura:** — · **Commit:** `C-C10` · **Rollback:** não aplicável.

#### `TK-C-034` · **Obter aprovação prévia** antes de qualquer dependência nova
- **Pacote · Subportão:** `F6-R1.1` · `F6-SG-C` — **Objetivo:** cumprir a regra inviolável de dependências.
- **Arquivos:** `package.json`, `package-lock.json` (**não alterados sem aprovação**) — **Símbolos/contratos:** compatibilidade com SDK 54 / RN 0.81.5 / React 19.1 / New Architecture; `npx expo install`.
- **Precondições:** `TK-C-033` — **Depende de:** `TK-C-033`
- **Mudança esperada:** **nenhuma** até a aprovação. Se a rota escolhida exigir dependência, a implementação **para** e apresenta a proposta ao fundador.
- **Prova:** decisão registrada — **Gate:** —
- **Conclusão:** **nenhuma dependência instalada** sem aprovação explícita e prévia. `SD-11` preservado.
- **Risco · decisão:** **regra inviolável de dependências** — **Auto:** sim (`git diff` de `package.json` vazio) · **Física futura:** não · **Commit:** `C-C10` · **Rollback:** não aplicável.

#### `TK-C-035` · Implementar a rota aprovada — **último passo**
- **Pacote · Subportão:** `F6-R1.1` · `F6-SG-C` — **Objetivo:** aplicar a orientação **depois** que todo o resto está estável e provado.
- **Arquivos:** conforme a rota aprovada (`app.json` e/ou *config plugin* próprio) — ⚠️ **INCERTEZA LOCALIZADA** deliberada: **a rota permanece não escolhida neste artefato** — **Símbolos/contratos:** os quatro casos de `D1`.
- **Precondições:** `TK-C-034` **e aprovação explícita do fundador sobre a rota** — **Depende de:** `TK-C-034`
- **Mudança esperada:** a menor intervenção aprovada, aplicada por último, isoladamente reversível.
- **Prova:** cenários físicos §28 **#6**, **#15**, **#16** e **#17** (numeração canônica do PLAN — emenda `A-12`) — **Gate:** **`G-RSP-3`** (a rota aplicada **não** pode introduzir `Platform.isPad` nem `expo-device` decidindo *layout*) · **`G-RSP-1`** (nenhum `Dimensions.get`)
- **Conclusão:** os **quatro casos de `D1`** se comportam conforme a decisão, com `SD-9` preservado. **`SD-1` permanece NÃO CONCEDÍVEL enquanto o cenário físico de tablet Android (retrato e paisagem) não tiver sido executado** — `TK-C-062`.
- **Risco · decisão:** **`RG-9`** · `OR-6` · `RD-1` — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C10` (isolado, o último de `R1`) · **Rollback:** reverter `C-C10` — e **somente** `C-C10`, sem tocar no restante do pacote.

---

## 8. `BLOCO 6` · Fechamento formal de `F6-SG-C`

> **`F6-SG-C` não é concedido aqui.**

#### `TK-C-036` · Executar o conjunto automatizado de `F6-SG-C`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** veredito de `TA-6`..`TA-10`, `TA-14`, `TA-15` + `npm run smoke` + `npx expo-doctor`.
- **Arquivos:** `scripts/smoke.js`, arneses — **Símbolos/contratos:** `SD-10`. **Precondições:** `TK-C-035` — **Depende de:** `TK-C-035`
- **Mudança esperada:** nenhuma; evidência. **Prova:** saídas anexadas — **Gate:** `G-RSP-1`, `G-RSP-2`, `G-RSP-3`, `G-RSP-4`, `G-RSP-5`, `G-RSP-6`, `G-RSP-7`, `G-SID-1`, `G-SID-2`, `G-SID-3`, `G-SID-4`, `G-BP-1`
- **Conclusão:** tudo verde. **Risco:** — · **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-037` · **Registro consolidado** das provas vermelhas de `F6-SG-C`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** consolidar, em uma única tabela, o resultado das mutações de `R1` já executadas **isoladamente** em tasks próprias. **Esta task não injeta nenhuma mutação.**
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** tabela mutante → portão vermelho → task de execução.
- **Precondições:** `TK-C-036` **e** todas as tasks de mutação de `R1` concluídas — **Depende de:** `TK-C-036`, `TK-C-024`, `TK-C-047`..`TK-C-059`
- **Mudança esperada:** **nenhuma** — apenas consolidação. Cobertura obrigatória, **uma mutação por task**: `MT-7` → `G-RSP-1` (`TK-C-047`) · `MT-8` → `G-RSP-2` (`TK-C-048`) · `MT-9` → `G-SID-1` (`TK-C-049`) · `MT-10` → `G-SID-1` (`TK-C-050`) · `MT-11` → `G-BP-1` (`TK-C-051`) · `MT-15` → `G-SID-2` (`TK-C-024`) · `MT-16` → `G-SID-3` (`TK-C-052`) · `MT-19` → `G-RSP-5` (`TK-C-053`) · `MT-20` → `G-RSP-6` (`TK-C-054`) · `MT-21` → `G-RSP-7` (`TK-C-055`) · `MT-22` → `G-RSP-5` (`TK-C-056`) · `MT-23` → `G-SID-4` (`TK-C-057`) · `MT-31` → `G-RSP-3` (`TK-C-058`) · `MT-32` → `G-RSP-4` (`TK-C-059`).
- **Prova:** a tabela consolidada, com o registro de cada portão observado **vermelho** e revertido — **Gate:** — (consolidação)
- **Conclusão:** as **14** mutações de `R1` foram observadas falhando, **uma a uma**, cada uma em sua própria task; árvore limpa ao fim.
- **Risco:** `RG-13` · **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.
- **Nota de emenda `A-08`:** a r1 desta task injetava **sete** mutações simultaneamente e, além disso, usava a numeração `MT-6`..`MT-11`/`MT-16` **fora do significado canônico do PLAN §25**. Ambos os defeitos estão desfeitos: as mutações foram **desmembradas em tasks individuais** (`TK-C-047`..`TK-C-059`, mais `TK-C-024`) — **nunca mais de uma mutação viva por vez** — e cada uma usa o ID canônico correto.

#### `TK-C-038` · Regressão completa em **telefone** (faixa compacta)
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** o aparelho onde o app já funciona **não pode** piorar.
- **Arquivos:** — (aparelho) — **Símbolos/contratos:** **`CN-11`** (novo: faixa compacta inalterada por `R1`) e **`CN-1`** (canônico: **telefone em retrato não muda em nada**). **Precondições:** `TK-C-037` — **Depende de:** `TK-C-037`
- **Mudança esperada:** nenhuma; capturas comparativas por família. **Prova:** **parcela `SG-C` do cenário físico §28 #17** ("regressão completa em **telefone** — nada mudou"), somada à reexecução pontual dos cenários §28 **#1**, **#4** e **#7** no telefone. *(Emenda `A-12`: a numeração usada aqui é a do PLAN §28, nunca uma renumeração destas `TASKS`. As parcelas `SG-A` e `SG-B` do mesmo #17 são `TK-A-098` e `TK-B-045`.)* — **Gate:** — (cenário físico; validação perceptual, não asserção estática)
- **Conclusão:** as quatro famílias indistinguíveis do estado anterior no telefone. **Risco:** **`RG-5`** · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-039` · Validação em **tablet *portrait***
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** cobrir a faixa média com composição real.
- **Arquivos:** — (aparelho) — **Símbolos/contratos:** `SD-2`, `SD-3`, `SD-4`. **Precondições:** `TK-C-038` — **Depende de:** `TK-C-038`
- **Mudança esperada:** nenhuma; capturas por família. **Prova:** **parcela *portrait* do cenário físico §28 #15** ("percorrer as quatro famílias nas três faixas — composições distintas, sem coluna estreita com vazio") + capturas por família — **Gate:** — (cenário físico; validação perceptual, não asserção estática)
- **Conclusão:** composição coerente, sem vazio dominante, barra lateral correta. **Risco:** `SD-3` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-040` · Validação em **tablet *landscape***
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** cobrir a faixa expandida.
- **Arquivos:** — (aparelho) — **Símbolos/contratos:** `breakpoints.tabletL`. **Precondições:** `TK-C-039` — **Depende de:** `TK-C-039`
- **Mudança esperada:** nenhuma; capturas por família. **Prova:** **parcela *landscape* do cenário físico §28 #15** + capturas por família — **Gate:** — (cenário físico; validação perceptual, não asserção estática)
- **Conclusão:** nenhuma coluna estreita cercada de vazio em `>=900dp` (`SD-3`). **Risco:** `SD-3` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-041` · Validação de ***resize*** quando suportado (Split View, Slide Over)
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** cobrir a mudança contínua de janela, não só a rotação.
- **Arquivos:** — (iPad) — **Símbolos/contratos:** `SD-9`; travessia de `600dp` arrastando o divisor. **Precondições:** `TK-C-040` — **Depende de:** `TK-C-040`
- **Mudança esperada:** nenhuma; vídeo da travessia. **Prova:** **cenário físico §28 #6** ("Split View, arrastar o divisor, sair" — `SD-9`), **reexecutado sob a ótica de `R1`** (composição das quatro famílias sob larguras contínuas), + `CN-6`. *(Emenda `A-12`: a r1 citava aqui "§28 #14, #15", números que no PLAN pertencem a **outros** cenários — "as 20 histórias, três faixas" (`TK-B-044`) e "percorrer as quatro famílias nas três faixas" (`TK-C-039`/`TK-C-040`). A renumeração está desfeita.)* — **Gate:** — (cenário físico; validação perceptual, não asserção estática)
- **Conclusão:** travessia sem remontagem, sem perda de estado e sem quebra de composição. **Risco:** `RG-4` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-042` · Consistência das **quatro famílias** entre si
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** provar `SD-2` de forma comparativa, não isolada.
- **Arquivos:** artefato de evidência — **Símbolos/contratos:** 4 famílias × 3 faixas = **12 células**. **Precondições:** `TK-C-041` — **Depende de:** `TK-C-041`
- **Mudança esperada:** matriz com captura por célula e veredito de coerência. **Prova:** a própria matriz — **Gate:** — (cenário físico; validação perceptual, não asserção estática)
- **Conclusão:** as 12 células coerentes entre si; nenhuma família contradiz a política das outras. **Risco:** `SD-2` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-043` · Verificação final da **barra lateral**
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** fechar `SD-4` com evidência.
- **Arquivos:** — (aparelho) — **Símbolos/contratos:** `SD-4`; **`CN-5`** (nenhum destino novo na barra lateral); defeitos 1–3 corrigidos, 4–5 abertos; os **cinco** `registerGuideTarget` medidos no aparelho. **Precondições:** `TK-C-042` — **Depende de:** `TK-C-042`
- **Mudança esperada:** nenhuma; capturas nas duas faixas onde a barra existe. **Prova:** cenário físico **§28 #16** (barra lateral em iPad retrato e paisagem, com o vazio vertical medido em pontos e os cinco alvos de guia medidos) + capturas comparativas — **Gate:** — (cenário físico; validação perceptual, não asserção estática)
- **Conclusão:** sem vazio desproporcional, sem destino novo, cinco alvos de guia medidos, defeitos 4–5 ainda registrados como **abertos** em `B2`. **Risco:** `SD-4` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-044` · Verificação final dos ***tokens***
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** fechar `Q4` e `Q9` com evidência, não com promessa.
- **Arquivos:** `src/theme/tokens.js` (**revisão do *diff***) — **Símbolos/contratos:** `grid`, `displayScaleTablet`, *token* da barra lateral. **Precondições:** `TK-C-043` — **Depende de:** `TK-C-043`
- **Mudança esperada:** nenhuma; parecer item a item sobre o *diff*. **Prova:** **`TA-8`** (`grid` e `displayScaleTablet` têm consumidor real) — **Gate:** **`G-RSP-2`**, **`G-SID-2`**
- **Conclusão:** nenhum *token* morto por inércia; nenhuma remoção preventiva; `Q9` cumprida além da renomeação. **Risco:** `Q4`, `Q9` · **Auto:** parcial · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-045` · Ausência de **arquitetura paralela**
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** provar a Governança da Arquitetura ao fim do delta.
- **Arquivos:** `src/components/layout/`, `src/hooks/`, `src/services/` — **Símbolos/contratos:** um *hook* de faixa, um de projeção, um de *lifecycle*, um serviço de âncora. **Precondições:** `TK-C-044` — **Depende de:** `TK-C-044`
- **Mudança esperada:** nenhuma; inventário provando que não há dois caminhos para a mesma responsabilidade. **Prova:** inventário + **`G-RSP-4`** (nenhum módulo de *layout* redeclara valor já presente em `tokens.js`) — **Gate:** **`G-RSP-4`**
- **Conclusão:** nenhuma responsabilidade da Fase 6 tem duas implementações concorrentes. **Risco:** **`RG-2`** · **Auto:** parcial · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-046` · Relatório e critérios `PASS`/`FAIL` de `F6-SG-C`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** entregar a base de decisão **sem conceder o subportão**.
- **Arquivos:** artefato de evidência — **Símbolos/contratos:** critérios de saída de `F6-SG-C` (§27). **Precondições:** `TK-C-045` — **Depende de:** `TK-C-045`
- **Mudança esperada:** relatório em PT-BR com a distinção correta de estado de arquivo. **Prova:** revisão do fundador — **Gate:** — (relatório de subportão)
- **Conclusão:** relatório entregue; **`F6-SG-C` permanece não concedido**. O relatório declara explicitamente, como limitação: **`SD-1` NÃO CONCEDÍVEL** enquanto `TK-C-062` (tablet Android, retrato e paisagem) permanecer `PENDENTE — SEM APARELHO`; e que **a rota condicional de §33 do PLAN continua NÃO ESCOLHIDA**, cabendo ao fundador. **Risco:** `RG-10` · `P8` · **Auto:** não · **Física futura:** — · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

### 8.1 Emenda pós-`Analyze` — tasks acrescentadas ao `BLOCO 5` e ao `BLOCO 6`

> **Numeração e ordem.** As tasks abaixo recebem IDs **inéditos** (`TK-C-047`..`TK-C-064`) e são
> escritas nesta subseção por conveniência de leitura do *diff* documental. **A ordem de execução
> não é a ordem textual**: cada task declara explicitamente onde entra na sequência de `F6-SG-C`.
> Nenhuma delas cria dependência de `F6-SG-A` ou `F6-SG-B` em relação a `F6-SG-C` — todas pertencem
> a `F6-SG-C` (emenda `A-06`).
>
> **Regra de isolamento (emenda `A-08`):** cada task de mutação abaixo injeta **exatamente uma**
> mutação, observa **um** portão vermelho, reverte e registra. **Nunca há duas mutações vivas ao
> mesmo tempo.** Ao fim de cada uma, `git status` limpo é critério de conclusão.
>
> **Regra de independência (emenda `A-09`/`A-10`):** nenhuma destas tasks cria o portão que ela
> mesma prova. Os portões de `R1` são criados em `TK-C-002` (`G-RSP-1`, `G-RSP-7`), `TK-C-014`
> (`G-RSP-5`, `G-RSP-6`), `TK-C-023` (`G-SID-1`..`G-SID-4`), `TK-C-027` (`G-RSP-4`) e `TK-C-060`
> (`G-RSP-3`).

#### `TK-C-047` · Mutante `MT-7` — reintroduzir `Dimensions.get`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-RSP-1`, cujo criador é `TK-C-002`. **Ordem:** após `TK-C-002`.
- **Arquivos:** mutação temporária em um módulo de `src/` (**nunca commitada**) — **Símbolos/contratos:** `Dimensions.get`.
- **Precondições:** `TK-C-002` concluída — **Depende de:** `TK-C-002`
- **Mudança esperada:** **uma única** mutação — texto canônico do PLAN §25: **"Reintroduzir `Dimensions.get`"**. Esperado: `G-RSP-1` **vermelho** (`TA-6`).
- **Prova:** portão vermelho registrado — **Gate:** **`G-RSP-1`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo. *(A execução antecipada equivalente em `F6-SG-A` é `TK-A-095`, que protege `SD-11` desde o primeiro subportão; esta é a execução formal do pacote `R1`.)*
- **Risco · decisão:** `SD-11` · `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-048` · Mutante `MT-8` — remover o consumidor de `grid`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-RSP-2`, cujo criador é `TK-C-061`. **Ordem:** após `TK-C-061`.
- **Arquivos:** mutação temporária no consumidor de `grid` (**nunca commitada**) — **Símbolos/contratos:** `grid` em `src/theme/tokens.js`.
- **Precondições:** `TK-C-061` concluída — **Depende de:** `TK-C-061`
- **Mudança esperada:** **uma única** mutação — texto canônico do PLAN §25: **"Remover o consumidor de `grid`"**. Esperado: `G-RSP-2` **vermelho** (`TA-8`).
- **Prova:** portão vermelho registrado — **Gate:** **`G-RSP-2`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo.
- **Risco · decisão:** `Q4` · `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-049` · Mutante `MT-9` — reimportar `theme/colors` na barra lateral
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de **`G-SID-1`**, cujo criador é `TK-C-023`. **Ordem:** após `TK-C-023`.
- **Arquivos:** mutação temporária em `src/components/TabletSidebar.js` (**nunca commitada**) — **Símbolos/contratos:** `import { colors } from '../theme/colors'`.
- **Precondições:** `TK-C-023` concluída — **Depende de:** `TK-C-023`
- **Mudança esperada:** **uma única** mutação — texto canônico do PLAN §25: **"Reimportar `theme/colors` na barra lateral"**. Esperado: `G-SID-1` **vermelho** (`TA-10`).
- **Prova:** portão vermelho registrado — **Gate:** **`G-SID-1`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo.
- **Risco · decisão:** `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-050` · Mutante `MT-10` — remover um `registerGuideTarget` da barra lateral
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-SID-1` pelo **segundo** eixo da sua asserção (os cinco alvos de guia). **Ordem:** após `TK-C-063`.
- **Arquivos:** mutação temporária em `src/components/TabletSidebar.js` (**nunca commitada**) — **Símbolos/contratos:** um dentre `adventures.sidebarTab`, `home.sidebarTab`, `atelier.sidebarTab`, `stars.sidebarTab`, `profile.sidebarTab`.
- **Precondições:** `TK-C-063` concluída — **Depende de:** `TK-C-023`, `TK-C-063`
- **Mudança esperada:** **uma única** mutação — texto canônico do PLAN §25: **"Remover um `registerGuideTarget` da barra lateral"**. Esperado: `G-SID-1` **vermelho** (`TA-9`).
- **Prova:** portão vermelho registrado — **Gate:** **`G-SID-1`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo. **`G-SID-1` está provado vermelho por dois defeitos distintos** (`MT-9` e `MT-10`), cobrindo as duas metades da sua asserção.
- **Risco · decisão:** `RG-6` · `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-051` · Mutante `MT-11` — reintroduzir literal `768`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-BP-1`, que **não é criado por este delta** — é portão **herdado** de `P-30`, confirmado em `TK-C-002`. **Ordem:** após `TK-C-002`.
- **Arquivos:** mutação temporária em um módulo de `src/` (**nunca commitada**) — **Símbolos/contratos:** literal `768`.
- **Precondições:** `TK-C-002` concluída — **Depende de:** `TK-C-002`
- **Mudança esperada:** **uma única** mutação — texto canônico do PLAN §25: **"Reintroduzir literal `768`"**. Esperado: `G-BP-1` **vermelho**.
- **Prova:** portão vermelho registrado — **Gate:** **`G-BP-1`** (**tem de falhar**) · controle negativo **`CN-7`** (**`P-30`/`G-BP-1` continuam verdes — zero literais `768`**) reexecutado após a reversão
- **Conclusão:** falha observada, mutante revertido, `CN-7` verde de novo. **A proteção herdada de `P-30` não sofreu regressão** (emenda `A-16`).
- **Risco · decisão:** **regressão de `P-30`** · `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-052` · Mutante `MT-16` — derivar largura disponível a partir do *token* em vez de medir
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-SID-3`, cujo criador é `TK-C-023`. **Ordem:** após `TK-C-023`.
- **Arquivos:** mutação temporária em um consumidor de *layout* (**nunca commitada**) — **Símbolos/contratos:** subtração do *token* de largura para inferir "espaço disponível".
- **Precondições:** `TK-C-023` concluída — **Depende de:** `TK-C-023`
- **Mudança esperada:** **uma única** mutação — texto canônico do PLAN §25: **"Derivar largura disponível a partir do *token* de barra lateral em vez de medir"**. Esperado: `G-SID-3` **vermelho**.
- **Prova:** portão vermelho registrado — **Gate:** **`G-SID-3`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo. Restrição 4 de §19.1 tem dentes.
- **Risco · decisão:** **`RG-12`** · `Q9` restrição 4 — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-053` · Mutante `MT-19` — regra universal "tablet = duas colunas"
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-RSP-5`, cujo criador é `TK-C-014`. **Ordem:** após `TK-C-014`.
- **Arquivos:** mutação temporária em um arquétipo (**nunca commitada**) — **Símbolos/contratos:** regra de duas colunas aplicada a toda a faixa `>=600dp`.
- **Precondições:** `TK-C-014` concluída — **Depende de:** `TK-C-014`
- **Mudança esperada:** **uma única** mutação — reintroduzir a regra universal que `Q3` proíbe. Esperado: `G-RSP-5` **vermelho**.
- **Prova:** portão vermelho registrado — **Gate:** **`G-RSP-5`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo.
- **Risco · decisão:** **`Q3`** · `D3` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-054` · Mutante `MT-20` — coluna estreita cercada de vazio em `>=900dp`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-RSP-6`, cujo criador é `TK-C-014`. **Ordem:** após `TK-C-014`.
- **Arquivos:** mutação temporária em um arquétipo (**nunca commitada**) — **Símbolos/contratos:** largura máxima de conteúdo fixada abaixo do limiar de coerência na faixa expandida.
- **Precondições:** `TK-C-014` concluída — **Depende de:** `TK-C-014`
- **Mudança esperada:** **uma única** mutação. Esperado: `G-RSP-6` **vermelho**.
- **Prova:** portão vermelho registrado — **Gate:** **`G-RSP-6`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo.
- **Risco · decisão:** **`SD-3`** — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-055` · Mutante `MT-21` — criar um quarto *breakpoint*
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-RSP-7`, cujo criador é `TK-C-002`. **Ordem:** após `TK-C-002`.
- **Arquivos:** mutação temporária em `src/theme/tokens.js` (**nunca commitada**) — **Símbolos/contratos:** `breakpoints` com quatro valores.
- **Precondições:** `TK-C-002` concluída — **Depende de:** `TK-C-002`
- **Mudança esperada:** **uma única** mutação. Esperado: `G-RSP-7` **vermelho** (`TA-7`).
- **Prova:** portão vermelho registrado — **Gate:** **`G-RSP-7`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo. As **três** faixas normativas permanecem as únicas.
- **Risco · decisão:** `TA-7` · `SD-11` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-056` · Mutante `MT-22` — comparação literal de largura fora do *hook* de faixa
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-RSP-5` pelo **segundo** eixo da sua asserção. **Ordem:** após `TK-C-014`.
- **Arquivos:** mutação temporária em uma tela (**nunca commitada**) — **Símbolos/contratos:** comparação `width > N` fora de `useWindowBand`.
- **Precondições:** `TK-C-014` concluída — **Depende de:** `TK-C-014`, `TK-C-053`
- **Mudança esperada:** **uma única** mutação. Esperado: `G-RSP-5` **vermelho**.
- **Prova:** portão vermelho registrado — **Gate:** **`G-RSP-5`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido. **`G-RSP-5` está provado vermelho por dois defeitos distintos** (`MT-19` e `MT-22`).
- **Risco · decisão:** `D3` · `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-057` · Mutante `MT-23` — destino de navegação novo na barra lateral
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-SID-4`, cujo criador é `TK-C-023`. **Ordem:** após `TK-C-023`.
- **Arquivos:** mutação temporária em `src/components/TabletSidebar.js` (**nunca commitada**) — **Símbolos/contratos:** um sexto destino acrescentado à barra.
- **Precondições:** `TK-C-023` concluída — **Depende de:** `TK-C-023`
- **Mudança esperada:** **uma única** mutação. Esperado: `G-SID-4` **vermelho**.
- **Prova:** portão vermelho registrado — **Gate:** **`G-SID-4`** (**tem de falhar**) · controle negativo **`CN-5`** reexecutado após a reversão
- **Conclusão:** falha observada, mutante revertido, `CN-5` verde. **`D4` tem dentes.**
- **Risco · decisão:** **`D4`** · `SD-4` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-058` · Mutante `MT-31` — reintroduzir `Platform.isPad` decidindo *layout*
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-RSP-3`, cujo criador é `TK-C-060`. **Ordem:** após `TK-C-060` e **antes** de qualquer task de `7.6`.
- **Arquivos:** mutação temporária em um módulo de `src/` (**nunca commitada**) — **Símbolos/contratos:** `Platform.isPad` (ou `expo-device`) governando composição.
- **Precondições:** `TK-C-060` concluída — **Depende de:** `TK-C-060`
- **Mudança esperada:** **uma única** mutação. Esperado: `G-RSP-3` **vermelho**.
- **Prova:** portão vermelho registrado — **Gate:** **`G-RSP-3`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo. **`D2` tem dentes antes de a orientação ser discutida.**
- **Risco · decisão:** **`D2`** · `RD-1` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-059` · Mutante `MT-32` — módulo de *layout* redeclara valor já presente em `tokens.js`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** prova vermelha **independente** de `G-RSP-4`, cujo criador é `TK-C-027`. **Ordem:** após `TK-C-027`.
- **Arquivos:** mutação temporária em `src/components/layout/` (**nunca commitada**) — **Símbolos/contratos:** constante duplicada de `tokens.js`.
- **Precondições:** `TK-C-027` concluída — **Depende de:** `TK-C-027`
- **Mudança esperada:** **uma única** mutação. Esperado: `G-RSP-4` **vermelho**.
- **Prova:** portão vermelho registrado — **Gate:** **`G-RSP-4`** (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo. **Nenhum *design system* paralelo** (restrição 3 de §19.1).
- **Risco · decisão:** `RD-3` · `Q9` restrição 3 — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-C-060` · Portão `G-RSP-3` — idioma de dispositivo **não** decide *layout* (emenda `A-05`)
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** criar o portão canônico do PLAN §26 que lacra `D2`. **Esta task cria; não prova** — a prova vermelha é `MT-31` (`TK-C-058`).
- **Ordem:** **antes** de toda a subseção `7.6` (orientação). Executável assim que os arquétipos existirem.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** asserção de **zero `Platform.isPad`** em `src/`; asserção de **zero importações de `expo-device`** em `src/`; asserção de que nenhuma decisão de composição consulta modelo de aparelho. As três asserções ignoram comentários (padrão `codeOf()` do arnês existente).
- **Precondições:** `TK-C-014` — **Depende de:** `TK-C-014`
- **Mudança esperada:** uma asserção nova (tripla) em `scripts/smoke.js`. **`expo-device` não é instalado nem removido por esta task** — a asserção é de ausência de uso em `src/`.
- **Prova:** portão **verde** no estado correto — **Gate:** **`G-RSP-3`** (criação)
- **Conclusão:** `G-RSP-3` existe, está verde, e é **precondição de ordem** de `TK-C-028`..`TK-C-035`. `D2` deixa de depender de disciplina e passa a depender de portão.
- **Risco · decisão:** **`D2`** · `RD-1` — **Auto:** sim · **Física futura:** não · **Commit:** `C-C4` · **Rollback:** reverter `C-C4`.

#### `TK-C-061` · `Q4` · passo 2 — **ação determinada**, com portão `G-RSP-2` (emenda `A-19`)
- **Pacote · Subportão:** `F6-R1.3` · `F6-SG-C` — **Objetivo:** executar a **consequência** do passo 1 (`TK-C-015`), agora que a determinação existe. **O critério deixou de ser disjuntivo e virou sequência.**
- **Arquivos:** `src/theme/tokens.js`, consumidor(es) identificado(s) no passo 1, `scripts/smoke.js` — **Símbolos/contratos:** `grid`, `displayScaleTablet`.
- **Precondições:** **`TK-C-015` concluída, com a determinação registrada por escrito** — **Depende de:** `TK-C-015`
- **Mudança esperada:** exatamente **um** dos dois ramos, conforme o resultado do passo 1:
  - **Ramo (a) — consumidor legítimo existe ou é criado por necessidade real:** o *token* permanece e passa a ter consumidor real. **É proibido criar consumidor artificial apenas para salvar o *token*** — o consumidor precisa ser exigido por um requisito de `F6-R1`.
  - **Ramo (b) — obsolescência demonstrada no passo 1:** o *token* é removido **com o registro da demonstração**. **É proibido remover o *token* antes da determinação** — se o passo 1 não concluiu, esta task **não** executa.
  - Em ambos os ramos, `G-RSP-2` é criado em `scripts/smoke.js` com a asserção correspondente ao ramo escolhido (**consumidor presente** ou **símbolo ausente e obsolescência registrada**).
- **Prova:** **`TA-8`** — **Gate:** **`G-RSP-2`** (criação). Prova vermelha independente: **`MT-8`** (`TK-C-048`).
- **Conclusão:** `grid` e `displayScaleTablet` têm destino determinado, justificado e lacrado por portão. **Nenhum ramo foi escolhido por conveniência.**
- **Risco · decisão:** **`Q4`** · `P-82`/`P-148` · **área protegida (design system), autorizada** — **Auto:** sim · **Física futura:** não · **Commit:** `C-C7` · **Rollback:** reverter `C-C7`.

#### `TK-C-062` · Cenário físico **tablet Android** (retrato e paisagem) — `SD-1` **não concedível** sem ele (emenda `A-13`)
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** registrar o cenário físico que hoje **não tem aparelho disponível** (`P8`) e travar `SD-1` até que ele seja executado. **A rota condicional de §33 do PLAN NÃO é escolhida aqui.**
- **Ordem:** junto ao fechamento físico de `F6-SG-C`, após `TK-C-040`.
- **Arquivos:** — (aparelho) + artefato de evidência — **Símbolos/contratos:** `SD-1` (quatro casos de `D1`); `android:screenOrientation` único em `MainActivity`; faixas `600–899dp` e `>=900dp` em tablet Android.
- **Precondições:** `TK-C-040` — **Depende de:** `TK-C-035`, `TK-C-040`
- **Mudança esperada:** **nenhuma** — o cenário é declarado, com roteiro completo (retrato e paisagem, as quatro famílias de superfície, a barra lateral, a travessia de faixa), e o seu estado registrado como **`PENDENTE — SEM APARELHO`** enquanto o aparelho não existir.
- **Prova:** execução do roteiro em tablet Android físico — **Gate:** — (validação física; não automatizável)
- **Conclusão:** **`SD-1` fica explicitamente NÃO CONCEDÍVEL enquanto este cenário não tiver sido executado.** Um `PENDENTE` aqui **impede** a concessão de `SD-1` e, por consequência, é apresentado ao fundador como limitação declarada de `F6-SG-C`. **A escolha entre as rotas de §33 permanece do fundador e não é feita por nenhuma task deste artefato.**
- **Risco · decisão:** **`RG-9`** · **`P8`** (vão de aparelho) · §33 **não decidida** — **Auto:** não (**exige aparelho físico**) · **Física futura:** **sim (bloqueada por indisponibilidade de aparelho)** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-063` · Os **cinco** `registerGuideTarget` da barra lateral permanecem registrados e mensuráveis
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** executar **`TA-9`** no seu significado canônico (PLAN §23), separado de `G-SID-1` como asserção verificável própria.
- **Ordem:** após `TK-C-021` e antes de `TK-C-023` fechar os portões.
- **Arquivos:** `scripts/smoke.js`, `src/components/TabletSidebar.js` (**leitura**) — **Símbolos/contratos:** `adventures.sidebarTab`, `home.sidebarTab`, `atelier.sidebarTab`, `stars.sidebarTab`, `profile.sidebarTab`.
- **Precondições:** `TK-C-021` — **Depende de:** `TK-C-021`
- **Mudança esperada:** asserção estática de **presença dos cinco** identificadores, contados nominalmente (não por quantidade agregada). A parte **mensurável** — geometria real de cada alvo — é validada em aparelho (`TK-C-043`, §28 #16).
- **Prova:** **`TA-9`** verde — **Gate:** **`G-SID-1`** (eixo dos alvos de guia). Prova vermelha independente: **`MT-10`** (`TK-C-050`).
- **Conclusão:** os cinco alvos continuam registrados; a barra lateral permanece parte da geometria do tour, não decoração (PLAN §19.1).
- **Risco · decisão:** `RG-6` · fronteira com **F7** — **Auto:** sim · **Física futura:** **sim** (medição em aparelho) · **Commit:** `C-C9` · **Rollback:** reverter `C-C9`.

#### `TK-C-064` · Controle negativo `CN-8` em `F6-R1` — nenhuma área protegida por pacote tocada
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** executar o **`CN-8` canônico** (PLAN §24) no pacote `F6-R1`: **nenhum *asset*, manifesto, história, conquista ou regra de acesso foi tocado**.
- **Ordem:** a cada *commit* de `R1` e, consolidado, ao fim de `F6-SG-C`.
- **Arquivos:** saída de `git diff --cached --name-only` de **cada** *commit* `C-C1`..`C-C10` e `C-GOV1`; inventário de arquivos do pacote — **Símbolos/contratos:** `assets/**`, manifestos de áudio/cenas, `src/data/stories/**`, conquistas, `accessControl`.
- **Precondições:** cada *commit* de `R1` — **Depende de:** `TK-C-035`
- **Mudança esperada:** **nenhuma** — evidência. Para **cada** *commit* do pacote, a lista de arquivos indexados é anexada e conferida contra a lista de áreas protegidas; qualquer ocorrência é **bloqueadora** e interrompe o pacote.
- **Prova:** as **onze** saídas de `git diff --cached --name-only` anexadas, mais o inventário consolidado — **Gate:** — (controle negativo documental, com evidência mecânica)
- **Conclusão:** `CN-8` **verde** em `F6-R1`. *(Execuções irmãs: `TK-A-099` em `F6-R3` e `TK-B-046` em `F6-R2`. `src/theme/tokens.js` é área protegida **autorizada** por `Q9` e por isso aparece legitimamente no *diff*; nenhuma outra área protegida aparece.)*
- **Risco · decisão:** **áreas protegidas** · regra de `git add` seletivo — **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

---

## 9. `BLOCO 7` · `F6-SG-D` — **verificação de elegibilidade**, nunca desbloqueio

> **Este bloco não desbloqueia `B2`.** A única saída possível é um parecer com **duas** redações
> admissíveis:
> **(i)** "`B2` **elegível** para ser apresentado ao fundador"; **(ii)** "`B2` **continua bloqueado**".
> **A decisão permanece humana.** Não existe task "desbloquear `B2`".

#### `TK-D-001` · Verificar as **12 condições** de §37, uma a uma
- **Pacote · Subportão:** — · `F6-SG-D` — **Objetivo:** checar elegibilidade contra a lista fechada do PLAN, sem interpretação criativa.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** as 12 condições de §37.
- **Precondições:** **`F6-SG-C` concedido pelo fundador** — **Depende de:** `TK-C-046` + concessão humana
- **Mudança esperada:** **nenhuma** — tabela de 12 linhas com `ATENDIDA`/`NÃO ATENDIDA` e a evidência de cada uma.
- **Prova:** a própria tabela — **Gate:** —
- **Conclusão:** as 12 condições avaliadas com evidência nomeada. **Uma única `NÃO ATENDIDA` ⇒ parecer (ii).**
- **Risco · decisão:** **`B2` bloqueado** — **Auto:** não · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-D-002` · Verificar que os três subportões foram concedidos **por ato humano**
- **Pacote · Subportão:** — · `F6-SG-D` — **Objetivo:** impedir concessão inferida a partir de portões verdes.
- **Arquivos:** artefato de evidência — **Símbolos/contratos:** `F6-SG-A`, `F6-SG-B`, `F6-SG-C`.
- **Precondições:** `TK-D-001` — **Depende de:** `TK-D-001`
- **Mudança esperada:** **nenhuma** — registro da data e da forma de cada concessão humana.
- **Prova:** registro documental — **Gate:** —
- **Conclusão:** três concessões humanas explícitas registradas, ou a ausência delas declarada.
- **Risco · decisão:** `OR-1`, `OR-2`, `OR-5` — **Auto:** não · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-D-003` · Verificar que `SD-8` foi honrado do início ao fim do delta
- **Pacote · Subportão:** — · `F6-SG-D` — **Objetivo:** o bloqueador absoluto governa também a elegibilidade final.
- **Arquivos:** artefato de evidência — **Símbolos/contratos:** quatro invariantes ZERO; matriz de 17 casos executada **duas** vezes (`TK-A-080` e `TK-C-011`).
- **Precondições:** `TK-D-002` — **Depende de:** `TK-D-002`
- **Mudança esperada:** **nenhuma** — declaração verificável, ancorada nos dois inventários de armazenamento.
- **Prova:** `TK-A-062`, `TK-A-080`, `TK-B-035`, `TK-C-011` — **Gate:** —
- **Conclusão:** nenhuma obra infantil perdida ou corrompida em nenhum momento do delta.
- **Risco · decisão:** **`RG-1`** · `SD-8` — **Auto:** não · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-D-004` · Verificar que `P-152` e `P-164` **não** foram apagadas nem rebaixadas
- **Pacote · Subportão:** — · `F6-SG-D` — **Objetivo:** cumprir a decisão do fundador sobre as duas pendências.
- **Arquivos:** `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` (**verificação**) — **Símbolos/contratos:** `P-152`, `P-164`, `P-103`.
- **Precondições:** `TK-D-003` — **Depende de:** `TK-D-003`
- **Mudança esperada:** **nenhuma** — `P-152` pode ser marcada como endereçada **com evidência**; `P-164` permanece **aberta** (`FD-12`); `P-103` permanece diferida à Fase 7.
- **Prova:** revisão documental — **Gate:** —
- **Conclusão:** nenhuma pendência foi apagada, e nenhum risco foi rebaixado sem prova.
- **Risco · decisão:** decisão do fundador · `FD-12` · `Q7` — **Auto:** não · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-D-005` · Emitir o **parecer** de elegibilidade de `B2`
- **Pacote · Subportão:** — · `F6-SG-D` — **Objetivo:** produzir a única saída admissível deste bloco.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** parecer (i) ou (ii); **nunca** "`B2` desbloqueado".
- **Precondições:** `TK-D-001`..`TK-D-004` — **Depende de:** `TK-D-001`..`TK-D-004`
- **Mudança esperada:** **nenhuma** — parecer em PT-BR com as 12 condições, as três concessões, o veredito de `SD-8` e o estado das pendências.
- **Prova:** revisão do fundador — **Gate:** —
- **Conclusão:** o parecer diz **exatamente** "`B2` elegível para ser apresentado ao fundador" **ou** "`B2` continua bloqueado". **Em nenhuma hipótese o parecer desbloqueia `B2`.**
- **Risco · decisão:** **`B2` bloqueado** · `OR-5` — **Auto:** não · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

---

## 10. Contagem e estrutura

### 10.1 Totais

> **Emenda pós-`Analyze` — recontagem mecânica.** A r1 destas `TASKS` declarava **171** tasks. Com as
> **49** tasks acrescentadas pela emenda (`21` no `BLOCO 1`, `10` nos `BLOCOS 3/4`, `18` nos
> `BLOCOS 5/6`), o total passa a **220**. Todos os números abaixo foram **contados mecanicamente**
> sobre o próprio artefato (cabeçalhos `#### \`TK-*\`` e o campo `Pacote · Subportão` de cada ficha),
> não estimados. **Zero IDs duplicados; zero lacunas** nas quatro faixas
> (`TK-A-001`..`TK-A-105`, `TK-B-001`..`TK-B-046`, `TK-C-001`..`TK-C-064`, `TK-D-001`..`TK-D-005`).

| Recorte | Quantidade |
|---|---|
| **Total de tasks** | **220** |
| `BLOCO 1` — `F6-R3` (`TK-A-001`..`TK-A-057` + `TK-A-085`..`TK-A-105`) | **78** |
| `BLOCO 2` — fechamento de `F6-SG-A` (`TK-A-058`..`TK-A-084`) | **27** |
| `BLOCO 3` — `F6-R2` (`TK-B-001`..`TK-B-028` + `TK-B-037`..`TK-B-043`) | **35** |
| `BLOCO 4` — fechamento de `F6-SG-B` (`TK-B-029`..`TK-B-036` + `TK-B-044`..`TK-B-046`) | **11** |
| `BLOCO 5` — `F6-R1` (`TK-C-001`..`TK-C-035` + `TK-C-060`, `TK-C-061`, `TK-C-063`) | **38** |
| `BLOCO 6` — fechamento de `F6-SG-C` (`TK-C-036`..`TK-C-046` + `TK-C-047`..`TK-C-059`, `TK-C-062`, `TK-C-064`) | **26** |
| `BLOCO 7` — `F6-SG-D` (`TK-D-001`..`TK-D-005`) | **5** |

| Por **pacote** | Tasks |
|---|---|
| `F6-R3` | **78** |
| `F6-R2` | **35** |
| `F6-R1` | **38** |
| Tasks de fechamento de subportão (não pertencem a pacote) | **69** |

| Por **subportão** | Tasks |
|---|---|
| `F6-SG-A` | **105** (78 de `R3` + 27 de fechamento) |
| `F6-SG-B` | **46** (35 de `R2` + 11 de fechamento) |
| `F6-SG-C` | **64** (38 de `R1` + 26 de fechamento) |
| `F6-SG-D` | **5** |

| Por **fronteira de *commit*** | Tasks |
|---|---|
| Vinculadas a um *commit* de código (`C-A*`, `C-B*`, `C-C*`) | **111** |
| Evidência e governança (`C-GOV1`) — inclui os **17** casos da matriz de §28.1, de ficha compacta | **72** |
| **Injeção de mutante — nunca *commitadas*** (uma mutação por task) | **35** |
| Verificação pura, sem *commit* | **2** |
| **Total** | **220** |

| Por **acréscimo da emenda** | Tasks |
|---|---|
| Tasks da r1 preservadas | 171 |
| Tasks novas (`A-02`, `A-04`, `A-05`, `A-07`, `A-08`, `A-09`/`A-10`, `A-12`, `A-13`, `A-15`, `A-16`, `A-17`, `A-18`, `A-19`) | **49** |
| **Total** | **220** |

### 10.2 Estrutura de dependências

```
                       ┌─ TK-A-001 ─ TK-A-002/003/004/005 ─ TK-A-006 ─ TK-A-007 ─ TK-A-008
                       │      (eixos de versionamento — bloqueia leitor, writer, testes)
                       │
   [Portão Humano 3] ──┼─ TK-A-009 ─ TK-A-010/011 ─ TK-A-012 ─ TK-A-013 ─ TK-A-014 ─ TK-A-015
                       │      (lifecycle e instrumentação)                     └─ TK-A-016
                       │
                       ├─ TK-A-017 ─ TK-A-018 ─ TK-A-019 ─ TK-A-020 ─ TK-A-021
                       │      (R3.1 — posição do mapa)
                       │
                       ├─ TK-A-022 ─ TK-A-023 ─ TK-A-024/025/026/027/028/029
                       │      (preservações transversais)
                       │
                       └─ TK-A-030 ─ TK-A-031/032/033 ─ TK-A-034 ─ TK-A-035 ─ TK-A-036 ─ TK-A-037
                                 (espaço lógico)                  └─ TK-A-038 ─ TK-A-039/040
                                        │
                                        └─ TK-A-041 ─ TK-A-042 ─ TK-A-043/044/045 ─ TK-A-046 ─ TK-A-047
                                                 (leitor — somente leitura)
                                                        │
                                                        └─ TK-A-048 ─ TK-A-049 ─ TK-A-050 ─ TK-A-051
                                                                 (write-forward)   └─ TK-A-052/053/054/055/056
                                                                                            │
                                                                                            └─ TK-A-057
                                            ↓
                    TK-A-085..TK-A-105  (emenda §3.8 — portões, provas vermelhas
                                         isoladas, CN canônicos; TODAS dentro de F6-R3,
                                         nenhuma depende de F6-SG-B ou F6-SG-C)
                                            ↓
        TK-A-058 → TK-A-059 → TK-A-060 → TK-A-061 → TK-A-062 → TK-A-063..079 → TK-A-080
                                                     (matriz obrigatória: 17 casos)   │
                                            TK-A-081 → TK-A-082 → TK-A-083 → TK-A-084
                                            ↓
                            🚦 F6-SG-A — CONCESSÃO HUMANA (OR-1)
                                            ↓
        TK-B-001 → TK-B-002/003/004 → TK-B-005 → TK-B-006 → TK-B-007 → TK-B-008
                → TK-B-009 → TK-B-010 → TK-B-011 → TK-B-012 → TK-B-013 → TK-B-014
                → TK-B-015 → TK-B-016 → TK-B-017 → TK-B-018 → TK-B-019 → TK-B-020 → TK-B-021
                → TK-B-022/023/024 (criação apenas) → TK-B-025/026 → TK-B-027/028
                → TK-B-037/038/039        (provas vermelhas isoladas — MT-3, MT-4, MT-25)
                → TK-B-040 → TK-B-041 → TK-B-042  (F6-R2.5 / D12 — implementação, G-MAP-5, MT-30)
                → TK-B-043                 (Q6 — apresentação condicional; nada é escolhido aqui)
                → TK-B-029 → TK-B-030 → TK-B-031 → TK-B-032 → TK-B-033 → TK-B-034 → TK-B-035
                → TK-B-044/045/046         (§28 #14, parcela SG-B do #17, CN-8 por commit)
                → TK-B-036
                                            ↓
                            🚦 F6-SG-B — CONCESSÃO HUMANA (OR-2)
                                            ↓
        TK-C-001 → TK-C-002 (cria G-RSP-1, G-RSP-7) → TK-C-047 · TK-C-051 · TK-C-055
                → TK-C-003 → TK-C-004 → TK-C-005 → TK-C-006
                → TK-C-007 → TK-C-008 → TK-C-009 → TK-C-010 → TK-C-011 → TK-C-012 → TK-C-013
                → TK-C-014 (cria G-RSP-5, G-RSP-6) → TK-C-053 · TK-C-054 · TK-C-056
                → TK-C-060 (cria G-RSP-3) → TK-C-058          ← precede TODA a subseção 7.6
                → TK-C-015 (Q4 passo 1) → TK-C-061 (Q4 passo 2, cria G-RSP-2) → TK-C-048
                → TK-C-016 → TK-C-017 → TK-C-018
                → TK-C-019 → TK-C-020 → TK-C-021 → TK-C-063 → TK-C-022
                → TK-C-023 (cria G-SID-1..G-SID-4) → TK-C-024 · TK-C-049 · TK-C-050
                                                   · TK-C-052 · TK-C-057
                → TK-C-026 → TK-C-027 (cria G-RSP-4) → TK-C-059
                · TK-C-025 (verificação independente, sem dependência técnica)
                → TK-C-028 → TK-C-029 → TK-C-030 → TK-C-031 → TK-C-032 → TK-C-033 → TK-C-034
                → 🚦 aprovação de rota/dependência (se necessária) → TK-C-035   ← ÚLTIMO (OR-6)
                → TK-C-036 → TK-C-037 (consolidação) → TK-C-038 .. TK-C-046
                → TK-C-040 → TK-C-062 (tablet Android — SD-1 NÃO CONCEDÍVEL sem ele)
                → TK-C-064 (CN-8 por commit de R1)
                                            ↓
                            🚦 F6-SG-C — CONCESSÃO HUMANA
                                            ↓
                        TK-D-001 → TK-D-002 → TK-D-003 → TK-D-004 → TK-D-005
                                            ↓
                        PARECER — B2 elegível  ·OU·  B2 continua bloqueado
                        (a decisão permanece humana; nenhum desbloqueio automático)
```

**Verificações estruturais desta árvore (emenda `A-06` — DAG executável):**

| Verificação | Resultado |
|---|---|
| Alguma task de `R2` depende de `R1`? | **Não.** `TK-B-021` prova isso no código; `CN-9` (`TK-B-027`) é o controle negativo. |
| Alguma task de `R1` é executável antes de `F6-SG-B`? | **Não.** `TK-C-001` tem a concessão como precondição. |
| Alguma task de `R2` é executável antes de `F6-SG-A`? | **Não.** `TK-B-001` tem a concessão como precondição. |
| **Algum requisito de `F6-SG-A` depende de task posterior a `F6-SG-A`?** | **Não** — verificação **transitiva** refeita nesta emenda. As 21 tasks novas do `BLOCO 1` (`TK-A-085`..`TK-A-105`) dependem **apenas** de tasks `TK-A-*` anteriores; nenhuma referencia `TK-B-*` ou `TK-C-*`. Em particular, `MT-7`/`SD-11` é provado **dentro** de `F6-SG-A` por `TK-A-095`, e não empurrado para `TK-C-047`. |
| **Algum requisito de `F6-SG-B` depende de task de `F6-SG-C`?** | **Não.** `TK-B-037`..`TK-B-046` dependem apenas de `TK-B-*`. |
| Existe ciclo em alguma cadeia? | **Não.** As cadeias novas são estritamente lineares: *cria portão* → *prova vermelha isolada*; nenhuma task de prova é precondição do seu próprio criador. |
| `B2` aparece como automaticamente desbloqueado? | **Não.** `TK-D-005` só emite parecer; `TK-C-022` prova a não-invasão dos defeitos 4 e 5. |
| A orientação é o último passo? | **Sim.** `TK-C-035`, precedida de 7 tasks de estudo, do portão `G-RSP-3` (`TK-C-060`) e da aprovação de rota. |
| Alguma task de proteção da obra foi deslocada para depois de `R2`/`R1`? | **Não.** `TK-A-030`..`TK-A-056` e as provas vermelhas de `TK-A-085`..`TK-A-105` estão integralmente em `F6-R3`. |
| **Algum portão prova a si próprio?** | **Não** (emenda `A-09`/`A-10`). Todo portão tem **task criadora** e **task de prova vermelha distinta** — ver §11.4. |

---

## 11. Análise documental de cobertura

> Auditoria **puramente documental**. Esta seção foi **integralmente reconstruída** na emenda
> pós-`Analyze` (decisão `A-01` do fundador: *"Reconstrua integralmente as matrizes de
> rastreabilidade depois da correção"*). Todas as matrizes abaixo usam **os identificadores
> canônicos do PLAN** com **os significados canônicos do PLAN** (§2.4.1). Onde estas `TASKS`
> criaram proteção nova e útil, ela recebeu **identificador inédito**, nunca um ID já ocupado.
>
> **Regra de leitura (decisão `A-01`):** *"Cobertura por simples presença textual não vale."* Cada
> linha destas matrizes aponta para uma task que **executa algo verificável** — cria um portão,
> injeta uma mutação, executa um cenário, produz uma evidência. Menções de passagem no texto de
> outra task **não** contam como cobertura.

### 11.1 Requisito → task

| Requisito | Tasks |
|---|---|
| `F6-R3.1` — posição do mapa sobrevive | `TK-A-017`..`TK-A-021`, `TK-A-093` |
| `F6-R3.2` — estado de superfície sobrevive | `TK-A-009`..`TK-A-011`, `TK-A-016`, `TK-A-023`..`TK-A-029`, `TK-A-087` |
| `F6-R3.3` — travessia de faixa não remonta | `TK-A-022` |
| `F6-R3.4` — instrumentação de término de processo | `TK-A-012`..`TK-A-015`, `TK-A-088` |
| `F6-R3.5` — espaço lógico, eixos, leitor, *writer* | `TK-A-001`..`TK-A-008`, `TK-A-030`..`TK-A-056`, `TK-A-085`, `TK-A-086`, `TK-A-089`..`TK-A-092`, `TK-A-096`, `TK-A-097`, `TK-A-100`..`TK-A-105` |
| `F6-R3.6` — porção autorizada de `P-164` | `TK-A-057` |
| `F6-R2.1` — âncora única | `TK-B-001`..`TK-B-004`, `TK-B-009`..`TK-B-011`, `TK-B-019`, `TK-B-022`, `TK-B-025` |
| `F6-R2.2` — câmera única | `TK-B-005`, `TK-B-012`..`TK-B-014`, `TK-B-024`, `TK-B-038`, `TK-B-039` |
| `F6-R2.3` — duplicação de fatores morre | `TK-B-015`..`TK-B-017` |
| `F6-R2.4` — região ativa unificada | `TK-B-006`, `TK-B-018` |
| **`F6-R2.5`** — assinatura única **e `D12` "Comece Aqui"** | `TK-B-004`, `TK-B-020`, `TK-B-023`, `TK-B-037`, **`TK-B-040`** (`D12`), **`TK-B-041`** (`G-MAP-5`), **`TK-B-042`** (`MT-30`) |
| `F6-R1.1` — orientação | `TK-C-028`..`TK-C-035`, `TK-C-062` |
| `F6-R1.2` — superfícies adaptativas | `TK-C-001`..`TK-C-014`, `TK-C-026`, `TK-C-053`..`TK-C-056`, `TK-C-058`, `TK-C-060` |
| `F6-R1.3` — *tokens* | `TK-C-015`, `TK-C-018`, `TK-C-044`, `TK-C-048`, `TK-C-059`, `TK-C-061` |
| `F6-R1.4` — barra lateral | `TK-C-016`, `TK-C-017`, `TK-C-019`..`TK-C-024`, `TK-C-043`, `TK-C-049`, `TK-C-050`, `TK-C-052`, `TK-C-057`, `TK-C-063` |

> **Emenda `A-07` — `F6-R2.5` / `D12`.** O requisito `F6-R2.5` da SPEC aprovada abrange a âncora
> canônica **e** o tratamento de `D12` ("Comece Aqui"). Decisão do fundador: ***"`D12` NÃO é remetida
> à Fase 7. Ela permanece em `F6-R2.5`, conforme a SPEC aprovada."*** O escopo é **estrito** —
> geometria, posição inicial, câmera inicial e fonte canônica de âncora de `R2` (`TK-B-040`). **Não**
> são implementados aqui: texto de onboarding, *spotlight* de F7, coreografia de F7, tour novo, nem
> qualquer semântica futura da jornada.

### 11.2 Critério de sucesso (`SD-*`) → task

| `SD` | Tasks | Observação |
|---|---|---|
| **`SD-1`** — quatro casos de `D1` | `TK-C-028`..`TK-C-035`, **`TK-C-062`**, `TK-A-082` | **NÃO CONCEDÍVEL** enquanto `TK-C-062` (tablet **Android**, retrato e paisagem) estiver `PENDENTE — SEM APARELHO` (emenda `A-13`) |
| `SD-2` — três faixas, composição distinta | `TK-C-007`, `TK-C-039`..`TK-C-042` | — |
| `SD-3` — nenhuma coluna estreita com vazio em `>=900` | `TK-C-005`, `TK-C-006`, `TK-C-009`, `TK-C-014`, `TK-C-040`, `TK-C-054` | portão `G-RSP-6` |
| `SD-4` — barra lateral sem vazio e sem destino novo | `TK-C-019`..`TK-C-023`, `TK-C-043`, `TK-C-057`, `TK-C-063` | vazio vertical **medido em pontos** no aparelho |
| `SD-5` — pino/alvo/brilho/*scroll*/holofote na mesma âncora | `TK-B-009`..`TK-B-011`, `TK-B-015`, `TK-B-019`, `TK-B-034` | — |
| `SD-6` — câmera acerta a mira no tablet | `TK-B-012`..`TK-B-015`, `TK-B-032`, `TK-B-033`, `TK-B-039` | — |
| `SD-7` — rotação preserva rota/*scroll*/áudio/sessão/tour | `TK-A-018`, `TK-A-023`..`TK-A-028` | — |
| **`SD-8` — ZERO perda ou corrupção de obra** | `TK-A-030`..`TK-A-056`, `TK-A-062`..`TK-A-080`, `TK-A-084`..`TK-A-086`, `TK-A-089`..`TK-A-092`, `TK-A-100`..`TK-A-105`, `TK-B-035`, `TK-C-011`, `TK-D-003` | **bloqueador absoluto** |
| `SD-9` — Split View e Slide Over | `TK-A-066`, `TK-C-031`, `TK-C-041` | §28 **#6** |
| `SD-10` — smoke + expo-doctor verdes | `TK-A-059`, `TK-B-029`, `TK-C-036` | — |
| **`SD-11`** — sem `Dimensions.get`, sem *breakpoint* novo, sem dependência nova | **`TK-A-094`** (portão **antecipado** a `F6-R3`), `TK-A-095`, `TK-C-001`, `TK-C-002`, `TK-C-034`, `TK-C-047`, `TK-C-055` | emenda `A-14`: o portão estático deixa de esperar `F6-R1` |

### 11.3 Risco → task

| Risco | Tasks que o fecham |
|---|---|
| **`RG-1`** obra perdida ou corrompida | `TK-A-032`..`TK-A-056`, `TK-A-062`..`TK-A-080`, `TK-A-085`, `TK-A-086`, `TK-A-091`, `TK-A-092`, `TK-A-100`..`TK-A-105`, `TK-C-011`, `TK-D-003` |
| `RG-2` arquitetura paralela | `TK-A-030`, `TK-C-010`, `TK-C-013`, `TK-C-045`, `TK-C-059` |
| `RG-3` custo de reprojeção | `TK-A-037`, `TK-A-067` |
| `RG-4` remontagem na travessia de faixa | `TK-A-022`, `TK-A-023`, `TK-C-041` |
| `RG-5` regressão na faixa compacta | `TK-A-020`, `TK-B-008`, `TK-B-028`, `TK-B-031`, `TK-C-003`, `TK-C-027`, `TK-C-038` |
| `RG-6` tour/*overlay* desalinhado | `TK-A-026`, `TK-A-027`, `TK-B-019`, `TK-C-026`, `TK-C-063` |
| `RG-7` custo no caminho quente de *scroll* | `TK-A-017`, `TK-B-028` |
| `RG-8` causalidade não provada de `FD-12` | `TK-A-012`..`TK-A-014`, `TK-A-057`, `TK-A-071`, `TK-A-088` |
| `RG-9` orientação e loja | `TK-C-028`..`TK-C-035`, `TK-C-062` |
| `RG-10` evidência insuficiente | `TK-A-081`..`TK-A-083`, `TK-B-036`, `TK-C-046`, `TK-C-062` |
| **`RG-11`** colisão de `v:3` | `TK-A-001`..`TK-A-008`, `TK-A-079`, `TK-A-089`, `TK-A-090` |
| `RG-12` payload legado mal classificado | `TK-A-041`, `TK-A-046`, `TK-A-053`, `TK-A-076`, `TK-A-103` |
| `RG-13` portão sem dentes | `TK-A-061`, `TK-B-030`, `TK-C-037` — **e as 34 tasks de mutação individuais** (§11.5), que são a prova real |
| `P-152` | `TK-A-017`..`TK-A-021`, `TK-A-093`, `TK-D-004` |
| `P-164` | `TK-A-012`..`TK-A-015`, `TK-A-057`, `TK-A-088`, `TK-D-004` |
| `P-30` | `TK-A-094` (`CN-7`), `TK-C-002`, `TK-C-051` — **proibido regredir** (emenda `A-16`) |
| `P-103` | **nenhuma** — `TK-C-025` registra a não-geração, por `Q7` |

### 11.4 Gate → task que o cria · task que o prova vermelho

> **Emendas `A-09` e `A-10` — nenhum portão prova a si próprio.** A task que **cria** o portão e a
> task que o observa **vermelho** são sempre **distintas**. As sete provas nomeadas explicitamente
> pelo fundador (`G-MAP-2`, `G-MAP-4`, `G-LFC-2`, `G-LFC-3`, `G-VER-2`, `G-VER-3`, `G-CMP-1`) estão
> destacadas com **⭑**.

| # | Gate | Asserção (resumo canônico) | Criado por | Provado **vermelho** por |
|---|---|---|---|---|
| 1 | `G-LFC-1` | Mudança de largura não repõe `didInitScroll` | `TK-A-021` | `TK-A-093` (`MT-1`) |
| 2 | ⭑ `G-LFC-2` | `ColoringScreen.js`/`AtelierCanvasScreen.js` consomem `useSurfaceLifecycle` | `TK-A-015` | `TK-A-087` (`MT-26`) |
| 3 | ⭑ `G-LFC-3` | `onRenderProcessGone`/`onContentProcessDidTerminate` instrumentados nos dois canvas | `TK-A-015` | `TK-A-088` (`MT-27`) |
| 4 | `G-CVS-1` | **`resize()` não realoca `qBuf`, `visBuf` nem `paintD`** (semântica canônica do PLAN, restaurada por `A-02`) | `TK-A-038` | `TK-A-086` (`MT-5`) |
| 5 | `G-CVS-2` | **O `stateJson` do Ateliê declara `logicalW` e `logicalH`** (semântica canônica do PLAN, restaurada por `A-24`) | `TK-A-038` | `TK-A-039` (`MT-6`) |
| 6 | `G-CVS-3` *(novo)* | Nenhum caminho de carga abre canvas branco silencioso quando existe obra recuperável | `TK-A-038` | `TK-A-040` (`MT-13`) |
| 7 | `G-VER-1` | O payload do canvas nunca é emitido com `v:3` | `TK-A-007` | `TK-A-008` (`MT-12`) |
| 8 | ⭑ `G-VER-2` | `POINTER_VERSION` intocado; nenhum degrau novo na escada de migração | `TK-A-007` | `TK-A-089` (`MT-28`) |
| 9 | ⭑ `G-VER-3` | `layoutVersion` nunca é inferido de `paintSchemaVersion` | `TK-A-007` | `TK-A-090` (`MT-29`) |
| 10 | ⭑ `G-CMP-1` | Incompatibilidade **nunca** apaga, limpa ou substitui por canvas branco | `TK-A-046` | `TK-A-040` (`MT-13`) |
| 11 | `G-CMP-2` | Abrir obra **não grava nada** | `TK-A-046` | `TK-A-047` (`MT-17`) |
| 12 | `G-CMP-3` | Projeção `contain` + *letterbox*; sem esticar, sem recortar, sem transformar camadas divergentes | `TK-A-032`/`TK-A-033` | `TK-A-091` (`MT-33`) |
| 13 | `G-CMP-4` | Promoção só **depois** de validar e reler | `TK-A-053` | `TK-A-054` (`MT-14`) |
| 14 | `G-CMP-5` | *Lineart* histórico nunca é removido por caminho de limpeza/*reset* | `TK-A-056` | `TK-A-092` (`MT-34`) |
| 15 | `G-CMP-6` *(novo)* | A abertura verifica a **identidade do *lineart*** antes de compor a tinta | `TK-A-056` | `TK-A-055` (`MT-18`) |
| 16 | `G-MAP-1` | Constante de enquadramento **única** | `TK-B-022` | `TK-B-025` (`MT-2`) |
| 17 | ⭑ `G-MAP-2` | `getStoryMapCoord` tem **assinatura única** | `TK-B-023` | `TK-B-037` (`MT-3`) **e** `TK-B-026` (`MT-24`) |
| 18 | `G-MAP-3` | `initialOffsetY` sem a subtração literal `56` | `TK-B-024` | `TK-B-038` (`MT-4`) |
| 19 | ⭑ `G-MAP-4` | O que é mensurável é **medido**, não compensado por constante | `TK-B-024` | `TK-B-039` (`MT-25`) |
| 20 | `G-MAP-5` *(canônico, acrescentado ao PLAN r3 por `A-07`)* | A primeira montagem mira `comece_aqui` pela âncora canônica | `TK-B-041` | `TK-B-042` (`MT-30`) |
| 21 | `G-BP-1` | **Zero literais `768`** (`P-30`, **herdado do B1 — proibido regredir**) | *herdado de `P-30`*; **confirmado e reativado** em `TK-A-094`, reconfirmado em `TK-C-002` | `TK-C-051` (`MT-11`) |
| 22 | `G-RSP-1` | Zero `Dimensions.get` em `src/` (`SD-11`) | **`TK-A-094`** (antecipado a `F6-R3`, `A-14`); estendido por `TK-C-002` | `TK-A-095` (`MT-7`, imediata em `SG-A`) **e** `TK-C-047` (`MT-7`, formal em `SG-C`) |
| 23 | `G-RSP-2` | `grid` e `displayScaleTablet` têm consumidor **ou** obsolescência registrada | `TK-C-061` (`Q4` passo 2) | `TK-C-048` (`MT-8`) |
| 24 | `G-RSP-3` | **Zero `Platform.isPad` e zero `expo-device` decidindo *layout*** (`D2`) | **`TK-A-094`** (antecipado); **task própria** `TK-C-060` (`A-05`) | `TK-C-058` (`MT-31`) |
| 25 | `G-RSP-4` | Nenhum módulo de *layout* redeclara valor já presente em `tokens.js` | `TK-C-027` | `TK-C-059` (`MT-32`) |
| 26 | `G-RSP-5` *(novo)* | Nenhuma regra universal "tablet = duas colunas"; nenhuma comparação literal de largura fora do *hook* | `TK-C-014` | `TK-C-053` (`MT-19`) **e** `TK-C-056` (`MT-22`) |
| 27 | `G-RSP-6` *(novo)* | Nenhuma família produz coluna estreita cercada de vazio em `>=900dp` | `TK-C-014` | `TK-C-054` (`MT-20`) |
| 28 | `G-RSP-7` *(novo)* | Exatamente **três** *breakpoints*; nenhum quarto | **`TK-A-094`** (antecipado); estendido por `TK-C-002` | `TK-C-055` (`MT-21`) |
| 29 | `G-SID-1` | `TabletSidebar.js` importa `theme/tokens` e **não** `theme/colors`; mantém os **cinco** alvos de guia | `TK-C-023` | `TK-C-049` (`MT-9`) **e** `TK-C-050` (`MT-10`) |
| 30 | `G-SID-2` | Sem literal de largura estrutural em `TabletSidebar.js`, `AppNavigator.js` e arquétipos | `TK-C-023` | `TK-C-024` (`MT-15`) |
| 31 | `G-SID-3` | Nenhum consumidor deriva "espaço disponível" subtraindo o *token* | `TK-C-023` | `TK-C-052` (`MT-16`) |
| 32 | `G-SID-4` *(novo)* | A barra lateral **não ganha destino de navegação novo** | `TK-C-023` | `TK-C-057` (`MT-23`) |

**32 portões · 32 com criador · 32 com prova vermelha independente · 0 portões que provam a si
próprios.** Nenhum portão órfão. `G-BP-1` é o único **herdado** (não nasce nesta fase): ele é
**confirmado** e passa a ser **reafirmado desde `F6-R3`** por `TK-A-094`, e continua com prova
vermelha própria (`TK-C-051`).

### 11.5 Mutante → defeito reintroduzido → gate que precisa ficar vermelho

> **Emenda `A-17`** — todos os mutantes canônicos do PLAN §25 foram restaurados com o texto de
> mutação do PLAN. **Emenda `A-08`** — **uma mutação por task**: nunca há duas mutações vivas ao
> mesmo tempo, e nenhuma task injeta um lote.

**(a) Mutantes canônicos do PLAN §25 — `MT-1`..`MT-16`**

| Mutante | Defeito deliberado (texto canônico do PLAN) | Gate vermelho | Task |
|---|---|---|---|
| `MT-1` | Recolocar `useEffect(() => { didInitScroll.current = false; }, [mapWidth])` | `G-LFC-1` | `TK-A-093` |
| `MT-2` | `scrollPinIntoView` volta a usar um fator próprio diferente do canônico | `G-MAP-1` | `TK-B-025` |
| `MT-3` | `getStoryMapCoord` volta a ter **duas assinaturas** | `G-MAP-2` | `TK-B-037` |
| `MT-4` | `initialOffsetY` volta à estimativa com os `56` fantasma | `G-MAP-3` | `TK-B-038` |
| `MT-5` | **Realocar `paintD`/`qBuf`/`visBuf` dentro de `resize()`** | `G-CVS-1` | `TK-A-086` |
| `MT-6` | Ateliê volta a gravar **coordenadas absolutas de *viewport*** | `G-CVS-2` | `TK-A-039` |
| `MT-7` | Reintroduzir `Dimensions.get` | `G-RSP-1` | `TK-A-095` (imediata, `SG-A`) · `TK-C-047` (formal, `SG-C`) |
| `MT-8` | **Remover o consumidor de `grid`** | `G-RSP-2` | `TK-C-048` |
| `MT-9` | **Reimportar `theme/colors`** na barra lateral | `G-SID-1` | `TK-C-049` |
| `MT-10` | **Remover um `registerGuideTarget`** da barra lateral | `G-SID-1` | `TK-C-050` |
| `MT-11` | **Reintroduzir literal `768`** | `G-BP-1` | `TK-C-051` |
| `MT-12` | Emitir o payload do canvas com `v:3` | `G-VER-1` | `TK-A-008` |
| `MT-13` | Leitor **apaga, limpa ou substitui por canvas branco** ao encontrar incompatibilidade | `G-CMP-1` + `G-CVS-3` | `TK-A-040` |
| `MT-14` | Promover a nova representação **antes** de validar a releitura | `G-CMP-4` | `TK-A-054` |
| `MT-15` | Reintroduzir largura estrutural de barra lateral **fora de `tokens.js`** | `G-SID-2` | `TK-C-024` |
| `MT-16` | **Derivar largura disponível a partir do *token*** em vez de medir | `G-SID-3` | `TK-C-052` |

**(b) Mutantes novos destas `TASKS` — `MT-17`..`MT-34` (IDs inéditos)**

| Mutante | Defeito deliberado | Gate vermelho | Task |
|---|---|---|---|
| `MT-17` | Abrir obra volta a **converter e regravar** | `G-CMP-2` | `TK-A-047` |
| `MT-18` | Payload aceito **sem verificar a identidade do *lineart*** | `G-CMP-6` | `TK-A-055` |
| `MT-19` | Regra universal **"tablet = duas colunas"** reintroduzida | `G-RSP-5` | `TK-C-053` |
| `MT-20` | Coluna estreita cercada de vazio em `>=900dp` | `G-RSP-6` | `TK-C-054` |
| `MT-21` | **Quarto *breakpoint*** criado | `G-RSP-7` | `TK-C-055` |
| `MT-22` | Comparação literal de largura **fora do *hook*** de faixa | `G-RSP-5` | `TK-C-056` |
| `MT-23` | **Destino de navegação novo** na barra lateral | `G-SID-4` | `TK-C-057` |
| `MT-24` | Alvo de toque de `MapRegion.js` volta a derivar separadamente do pino | `G-MAP-2` | `TK-B-026` |
| `MT-25` | Compensação de geometria **mensurável** em `computeCameraTarget` | `G-MAP-4` | `TK-B-039` |
| `MT-26` | Remover `useSurfaceLifecycle` de `ColoringScreen.js` | `G-LFC-2` | `TK-A-087` |
| `MT-27` | Remover `onRenderProcessGone` de `ColoringCanvas.js` | `G-LFC-3` | `TK-A-088` |
| `MT-28` | Alterar `POINTER_VERSION` / acrescentar degrau na escada | `G-VER-2` | `TK-A-089` |
| `MT-29` | Inferir `layoutVersion` a partir de `paintSchemaVersion` | `G-VER-3` | `TK-A-090` |
| `MT-30` | Primeira montagem deixa de mirar `comece_aqui` | `G-MAP-5` | `TK-B-042` |
| `MT-31` | Reintroduzir `Platform.isPad` decidindo *layout* | `G-RSP-3` | `TK-C-058` |
| `MT-32` | Módulo de *layout* **redeclara** valor já presente em `tokens.js` | `G-RSP-4` | `TK-C-059` |
| `MT-33` | Projeção volta a **esticar** (`cover`) ou a transformar camadas divergentes | `G-CMP-3` | `TK-A-091` |
| `MT-34` | Caminho de limpeza/*reset* remove ***lineart*** histórico ainda referenciado | `G-CMP-5` | `TK-A-092` |

**34 mutantes · 34 defeitos nomeados · 34 tasks de injeção isolada · 32 portões alvo cobertos.**
Nenhum mutante decorativo e **nenhum lote**: cada task injeta **exatamente uma** mutação, observa o
portão vermelho, reverte e deixa a árvore limpa. As consolidações (`TK-A-061`, `TK-B-030`,
`TK-C-037`) **não injetam nada** — apenas tabulam o que já foi observado.

### 11.6 Teste `TA-*` → task

| Teste | Significado **canônico** (PLAN §23) | Task que o cria |
|---|---|---|
| `TA-1` | Arnês: `getStoryAnchor` — mesma entrada ⇒ mesma saída para pino, câmera e `scrollPinIntoView` | `TK-B-007` |
| `TA-2` | Arnês: `computeCameraTarget` — *clamp* em `[0, contentH - vp]` | `TK-B-007` |
| `TA-3` | Arnês: **assinatura única** — história sem coordenada explícita produz a mesma fração para pino e *scroll* | `TK-B-007` |
| `TA-4` | Arnês: `toScreen(toCanonical(p)) == p` em retrato, paisagem e Split View | `TK-A-031` |
| `TA-5` | Arnês: **ida e volta do formato** — coordenadas lógicas idênticas; legado continua carregável | `TK-A-034`, `TK-A-035` |
| `TA-6` | **Portão estático**: ausência de `Dimensions.get` em `src/` (`SD-11`) | `TK-A-094` |
| `TA-7` | **Portão estático**: nenhum *breakpoint* novo; `breakpoints` continua fonte única | `TK-A-094`, `TK-C-002` |
| `TA-8` | **Portão estático**: `grid` e `displayScaleTablet` têm **pelo menos um** consumidor real | `TK-C-015`, `TK-C-061` |
| `TA-9` | **Portão estático**: os **cinco** `registerGuideTarget` da barra lateral continuam presentes | `TK-C-063` |
| `TA-10` | **Portão estático**: `TabletSidebar` **não** importa mais `theme/colors` | `TK-C-021` |
| `TA-11` | Arnês: ortogonalidade dos quatro eixos de versão | `TK-A-006` |
| `TA-12` | Arnês: leitor de compatibilidade determinístico | `TK-A-046` |
| `TA-13` | Arnês: ***write-forward*** com falha injetada em cada etapa | `TK-A-053` |
| **`TA-14`** *(novo)* | Arnês de **arquétipos por família** — nenhuma regra universal de colunas | `TK-C-004` |
| **`TA-15`** *(novo)* | Geometria do **alvo de guia** nas três faixas (parcela automatizável; a geometria real exige aparelho) | `TK-C-026` |

**15 testes · 15 com task criadora.** `TA-1`..`TA-13` usam **exclusivamente** o significado do PLAN
(emenda `A-01`); os dois significados que a r1 havia atribuído indevidamente a `TA-7` e `TA-10`
foram **preservados** como `TA-14` e `TA-15`.

### 11.7 Controle negativo `CN-*` → task

| `CN` | Enunciado **canônico** (PLAN §24) | Task |
|---|---|---|
| `CN-1` | **Telefone em retrato não muda em nada** — nos três pacotes | `TK-A-098` (`SG-A`), `TK-B-045` (`SG-B`), `TK-C-038` (`SG-C`) |
| `CN-2` | Primeira montagem do mapa mantém o comportamento atual (`comece_aqui` no topo) | `TK-A-020`, `TK-B-028`, `TK-B-041` |
| `CN-3` | **Desenho sem mudança de janela continua carregando exatamente como hoje** | `TK-A-097` |
| `CN-4` | Rota, áudio e sessão de jogo não são afetados por `R3.1` | `TK-A-028` |
| `CN-5` | **Nenhum destino novo aparece na barra lateral (`D4`)** | `TK-C-027`, `TK-C-043` |
| `CN-6` | Nenhuma tela remonta na travessia de `600dp` | `TK-A-022` |
| `CN-7` | **`P-30`/`G-BP-1` continuam verdes — zero literais `768`** | `TK-A-094`, `TK-C-051` |
| `CN-8` | **Nenhum *asset*, manifesto, história, conquista ou regra de acesso foi tocado** — `git diff --cached --name-only` **em cada *commit*** | `TK-A-099` (**12** *commits* — `C-A1`..`C-A12`), `TK-B-046` (**7** — `C-B1`..`C-B7`), `TK-C-064` (**11** — `C-C1`..`C-C10` + `C-GOV1`) |
| **`CN-9`** *(novo)* | `R2` não ganha faixa nem arquétipo | `TK-B-027` |
| **`CN-10`** *(novo)* | Custo de *scroll* do mapa preservado | `TK-B-028` |
| **`CN-11`** *(novo)* | Faixa compacta inalterada por `R1` | `TK-C-038` |
| **`CN-12`** *(novo)* | Nenhuma funcionalidade nova entra pela porta dos fundos em `R1` | `TK-C-027` |
| **`CN-13`** *(novo)* | Nenhuma migração silenciosa em massa da galeria | `TK-A-043` |

**13 controles negativos · 13 com task.** Emenda `A-15`: `CN-8` voltou à semântica canônica —
**verificação de áreas protegidas por *commit***, com `git diff --cached --name-only` e inventário
de arquivos como **parte da prova**, e não "nenhuma migração silenciosa em massa" (que passou a ser
`CN-13`, com ID inédito).

### 11.8 Cenário físico §28 → task

> **Emenda `A-12` — o roteiro físico final é a UNIÃO, nunca a substituição.** Os **17 cenários do
> PLAN §28 permanecem integralmente, com a numeração do PLAN**. Os cenários #7, #14, #16 e #17,
> que a r1 havia perdido ou renumerado, estão **reincorporados explicitamente** e destacados com
> **↺**. Cenários criados por estas `TASKS` são **acréscimos** e estão marcados como tais.

| §28 | Cenário (texto do PLAN) | Subportão | Task |
|---|---|---|---|
| #1 | Abrir o mapa, rolar até um ponto arbitrário, **girar** | `SG-A` | `TK-A-017`..`TK-A-019`, `TK-A-023`, `TK-A-081` |
| #2 | Girar de volta | `SG-A` | `TK-A-018`, `TK-A-081` |
| #3 | Colorir: pintar, **girar**, continuar pintando | `SG-A` | `TK-A-035`, `TK-A-065` |
| #4 | Colorir: pintar, **Centro de Controle**, voltar | `SG-A` | `TK-A-012`, `TK-A-070` |
| #5 | Colorir: pintar, segundo plano, esperar, voltar | `SG-A` | `TK-A-010`, `TK-A-069`, `TK-A-071` |
| #6 | Colorir: **Split View**, arrastar o divisor, sair | `SG-A` / `SD-9` | `TK-A-066`, `TK-A-067`, `TK-C-031`, `TK-C-041` |
| **↺ #7** | **Abrir um desenho salvo antes da mudança** e continuar | `SG-A` | **`TK-A-097`** *(task própria — restaurada)* |
| #8 | Ateliê: desenhar, carimbar, **girar** | `SG-A` | `TK-A-034`, `TK-A-066`, `TK-A-101` (`E2`) |
| #9 | Ateliê: abrir obra `v:2` antiga, girar, salvar, reabrir | `SG-A` | `TK-A-048`..`TK-A-050`, `TK-A-073` |
| #10 | Jogo em andamento: girar e multitarefa | `SG-A` / `SD-7` | `TK-A-028`, `TK-A-029` |
| #11 | Áudio tocando: girar, segundo plano, voltar | `SG-A` | `TK-A-025` |
| #12 | Mapa: abertura em iPad, retrato e paisagem | `SG-B` | `TK-B-031`..`TK-B-034` |
| #13 | Tour completo, telefone e iPad | `SG-B` / `SG-C` | `TK-A-026`, `TK-A-027`, `TK-B-019`, `TK-C-026`, `TK-C-063` |
| **↺ #14** | As **20 histórias**, três faixas, antes/depois | `SG-B` | **`TK-B-044`** *(task própria — restaurada)* |
| #15 | Percorrer as **quatro famílias** nas três faixas | `SG-C` | `TK-C-039` (*portrait*), `TK-C-040` (*landscape*), `TK-C-042` |
| **↺ #16** | **Barra lateral** em retrato e paisagem | `SG-C` | **`TK-C-020`** (vazio vertical medido em pontos), **`TK-C-043`** |
| **↺ #17** | **Regressão completa em telefone** | `SG-A`, `SG-B`, `SG-C` | **`TK-A-098`** (parcela `SG-A`), **`TK-B-045`** (parcela `SG-B`), **`TK-C-038`** (parcela `SG-C`) |

**17 cenários do PLAN · 17 com task · nenhum substituído.** Cenário **adicional** desta rodada, com
identificação própria e **sem ocupar número do PLAN**: **cenário físico de tablet Android (retrato e
paisagem)** — `TK-C-062` —, criado pela emenda `A-13` para tornar `SD-1` **NÃO CONCEDÍVEL** enquanto
não for executado.

> **Nota normativa `N-02` — §11.8 e §11.9 são EIXOS ORTOGONAIS.** §11.8 descreve o **contexto ou
> cenário físico de execução**. §11.9 descreve o **caso de compatibilidade da matriz §28.1 que está
> sendo validado**. Um caso §28.1 **pode** ser executado dentro de um cenário físico §28. Entretanto:
>
> - nenhum ID de §11.8 substitui ID de §11.9;
> - nenhum cenário físico substitui caso obrigatório da matriz;
> - nenhum caso da matriz substitui cenário físico obrigatório;
> - a cobertura dos dois eixos permanece **independente** — cada eixo é contado, exigido e concedido
>   por si mesmo;
> - a *cross-reference* entre os dois eixos é **permitida e desejável** quando uma mesma execução
>   produz evidência para ambos.
>
> Esta nota **não** reintroduz a contradição corrigida pela emenda `A-25`: aparecer nos dois eixos
> **não** atribui dois significados diferentes à mesma task. A task continua com um único significado;
> o que muda é apenas **qual eixo** está sendo contado — o cenário em que ela roda (§11.8) ou o caso
> de compatibilidade que ela prova (§11.9).

### 11.9 Matriz de compatibilidade §28.1 → task

> **Emenda `A-03` — os 17 casos do PLAN §28.1 são a baseline obrigatória e não podem ser
> substituídos.** Eles voltam com **a numeração e o significado do PLAN**. Os bons cenários
> adicionais criados pela r1 foram **preservados** com IDs novos (`E1`..`E6`). **A matriz final tem
> 23 casos. Um único `FAIL` nos 17 obrigatórios impede `F6-SG-A`.**

**(a) Os 17 casos obrigatórios do PLAN §28.1 — um para um**

| Caso | Enunciado do PLAN | Task | Caso | Enunciado do PLAN | Task |
|---|---|---|---|---|---|
| 1 | Obra antiga em retrato | `TK-A-063` | 10 | Obra sem modificação | `TK-A-072` |
| 2 | Mesma obra em paisagem | `TK-A-064` | 11 | Obra modificada e salva no formato novo | `TK-A-073` |
| 3 | Retorno a retrato | `TK-A-065` | 12 | Falha durante a gravação nova | `TK-A-074` |
| 4 | *Viewport* menor | `TK-A-066` | 13 | *Rollback* | `TK-A-075` |
| 5 | *Viewport* maior | `TK-A-067` | 14 | Formato legado (`v1`/`v2`) | `TK-A-076` |
| 6 | Reabertura após fechar o app | `TK-A-068` | 15 | Payload visual atual | `TK-A-077` |
| 7 | *Background* e *foreground* | `TK-A-069` | 16 | Envelope de armazenamento atual (`v:3`) | `TK-A-078` |
| 8 | Centro de Controle | `TK-A-070` | 17 | Novo schema lógico | `TK-A-079` |
| 9 | Término do processo de conteúdo | `TK-A-071` | — | **consolidação das 23 linhas** | `TK-A-080` |

**(b) Os 6 casos adicionais desta rodada — IDs inéditos, nunca ocupando número do PLAN**

| Caso adicional | Enunciado | Task |
|---|---|---|
| `E1` | Obra nova, criada e reaberta na **mesma** janela | `TK-A-100` |
| `E2` | Obra **vetorial** do Ateliê atravessando mudança de janela | `TK-A-101` |
| `E3` | Rotação repetida (**dez ciclos**) sem deriva acumulada | `TK-A-102` |
| `E4` | Payload associado a *lineart* **divergente** | `TK-A-103` |
| `E5` | Payload **corrompido ou truncado** | `TK-A-104` |
| `E6` | Galeria com **acervo misto** após atualização do app | `TK-A-105` |

**23 casos · 23 tasks individuais · nenhuma diluição em task genérica de "testar canvas".** As
quatro invariantes **ZERO** valem em todos os casos aplicáveis e são reverificadas em `TK-C-011`
após `F6-R1`. **Critério de saída:** 17 de 17 obrigatórios `PASS`; `FAIL` em caso adicional é
registrado, analisado e submetido ao fundador — não bloqueia automaticamente, mas **não pode ser
omitido**.

### 11.10 Decisão do fundador (`Q3`–`Q9`) → task

| Questão | Como aparece nas Tasks |
|---|---|
| `Q3` composição deriva de família + conteúdo | `TK-C-004`, `TK-C-005`, `TK-C-007`, `TK-C-014`; **nenhuma** task cria "tablet = duas colunas" — `MT-19` (`TK-C-053`) prova o portão |
| **`Q4`** `grid`/`displayScaleTablet` | **Sequência de dois passos (emenda `A-19`)**: `TK-C-015` = **passo 1, determinação**; `TK-C-061` = **passo 2**, com ramo (a) consumidor legítimo **já existente** ⇒ `G-RSP-2` exige consumidor, ou ramo (b) obsolescência **demonstrada** ⇒ registro e remoção. **Proibido criar consumidor artificial só para salvar o *token*; proibido remover antes da determinação.** Fechamento em `TK-C-044`, prova vermelha em `TK-C-048` |
| `Q5` duplicação do mapa não sobrevive | `TK-B-015`..`TK-B-017`, `TK-B-024`, `TK-B-038` |
| **`Q6`** / §41.4 trava de `MAP_ANCHOR_FRAMING` | `TK-B-002`, `TK-B-005`, `TK-B-013`, `TK-B-024`, `TK-B-039` — **o mensurável é medido**. **`TK-B-043` é condicional (emenda `A-18`):** só apresenta o resíduo estético ao fundador **se** algum resíduo sobreviver depois de medido tudo o que é mensurável. **Se nenhuma decisão estética residual restar, `MAP_ANCHOR_FRAMING` NÃO nasce.** **Nenhum agente pode escolher silenciosamente `0.58`, `0.5` ou terceiro valor** |
| `Q7` `P-103` diferida à Fase 7 | `TK-C-025` — **não gera task de correção**, por decisão |
| `Q8` compatibilidade da obra legada (10 regras) | `TK-A-041`..`TK-A-056`, `TK-A-085`, `TK-A-086`, `TK-A-089`..`TK-A-092`, `TK-A-096`, `TK-A-100`..`TK-A-105`; regras 1–6 no leitor, 7–9 no *writer*, 10 no *lineart* |
| `Q9` autorização sobre `src/theme/tokens.js` | `TK-C-016`, `TK-C-017`, `TK-C-018`, `TK-C-019`..`TK-C-023`; as **seis restrições** verificadas uma a uma em `TK-C-017`; `MT-15` (`TK-C-024`) prova que **renomear `width: 200` para `sidebarWidth: 200` não cumpre o requisito** |

### 11.11 Arquivo provável → task

| Arquivo | Tasks | Estado |
|---|---|---|
| `src/hooks/useSurfaceLifecycle.js` | `TK-A-009`, `TK-A-087` | **novo** |
| `src/hooks/useViewportProjection.js` | `TK-A-030`, `TK-A-091` | **novo** |
| `src/hooks/useWindowBand.js` | `TK-C-001`, `TK-C-053`, `TK-C-056` | **novo** |
| `src/services/mapAnchor.js` | `TK-B-001`..`TK-B-006`, `TK-B-037`..`TK-B-039`, `TK-B-040` | **novo** |
| `src/components/layout/HubSurface.js` · `EditorialSurface.js` · `ImmersiveSurface.js` · `GameSurface.js` | `TK-C-004`, `TK-C-005`, `TK-C-007`, `TK-C-010`, `TK-C-012`, `TK-C-054`, `TK-C-059` | **novos** |
| `scripts/testing/mapAnchorHarness.js` | `TK-B-007` | **novo** |
| `scripts/testing/viewportProjectionHarness.js` | `TK-A-031` | **novo** |
| `scripts/testing/artworkVersionHarness.js` | `TK-A-006`, `TK-A-046`, `TK-A-053` | **novo** |
| `src/components/ColoringCanvas.js` | `TK-A-001`..`TK-A-004`, `TK-A-012`..`TK-A-014`, `TK-A-016`, `TK-A-033`, `TK-A-035`, `TK-A-036`, `TK-A-041`, `TK-A-044`, `TK-A-048`..`TK-A-051`, **`TK-A-085`**, `TK-A-086`, `TK-A-088` | existente |
| `src/components/AtelierCanvas.js` | idem + `TK-A-034`, `TK-A-039` | existente |
| `src/screens/ColoringScreen.js` | `TK-A-010`, `TK-A-042`, `TK-A-045`, `TK-A-087`, `TK-C-011` | existente |
| `src/screens/AtelierCanvasScreen.js` | `TK-A-011`, `TK-A-042`, `TK-A-045`, `TK-C-011` | existente |
| `src/screens/AdventureMapScreen.js` | `TK-A-017`..`TK-A-021`, `TK-A-093`, `TK-B-012`..`TK-B-018`, `TK-B-020`, `TK-B-040`, `TK-B-042` | existente |
| **`src/components/map/MapRegion.js`** | `TK-B-009`..`TK-B-011`, `TK-B-026` | existente — **caminho corrigido pela emenda `A-23`**, conforme já provado pelo PLAN (a r1 escrevia `src/components/MapRegion.js`, que não existe) |
| `src/navigation/AppNavigator.js` | `TK-A-022`, `TK-A-023`, `TK-C-019`, `TK-C-026`, `TK-C-052`, `TK-C-057` | existente |
| `src/components/TabletSidebar.js` | `TK-C-019`..`TK-C-021`, `TK-C-024`, `TK-C-049`, `TK-C-050`, `TK-C-063` | existente |
| `src/theme/tokens.js` | `TK-C-015`..`TK-C-018`, `TK-C-061` (**`Q4`**, **`Q9`**) | existente — **área protegida, autorizada** |
| `src/theme/breakpoints.js` | `TK-C-001`, `TK-C-002`, `TK-C-055` | existente |
| `src/services/guideTargetRegistry.js` · `src/hooks/useGuideTargets.js` | `TK-A-026`, `TK-B-019`, `TK-C-026`, `TK-C-063` | existente |
| `scripts/smoke.js` | `TK-A-007`, `TK-A-015`, `TK-A-021`, `TK-A-038`, `TK-A-046`, `TK-A-053`, `TK-A-056`, **`TK-A-094`**, `TK-B-017`, `TK-B-022`..`TK-B-024`, `TK-B-041`, `TK-C-002`, `TK-C-014`, `TK-C-017`, `TK-C-023`, `TK-C-027`, `TK-C-060`, `TK-C-061`, `TK-C-063` | existente |
| `src/services/drawingStorage.js` · `storageKeys.js` · `storageMigrationService.js` · `coloring60DrawingStorage.js` | `TK-A-005`, `TK-A-043`, `TK-A-096` | **INTOCADOS salvo o ponto de promoção congelado em `TK-A-096`** |
| `assets/**`, manifestos, histórias, conquistas, `accessControl` | `TK-A-099`, `TK-B-046`, `TK-C-064` (`CN-8`) | **INTOCADOS — área protegida, verificada em cada *commit*** |
| `package.json` · `package-lock.json` · `eas.json` | `TK-C-034` | **INTOCADOS sem aprovação prévia** |
| `app.json` e/ou *config plugin* próprio ⚠️ | `TK-C-028`..`TK-C-035` | **rota deliberadamente não escolhida** |

#### 11.11-b Natureza da verificação (emenda `A-11`) — **Node não substitui aparelho**

> Decisão do fundador: *"Node não substitui aparelho."* Toda task classificada como `Auto: sim`
> declara **o que exatamente** o Node prova. Nenhuma célula abaixo autoriza declarar um requisito
> "verificado" por asserção estática quando a propriedade é perceptual, geométrica ou de plataforma.

| Natureza | O que é provado neste plano | Tasks representativas |
|---|---|---|
| **(1) Automatizável em Node** — asserção estática de código | Ausência/presença de símbolo, literal, `import`, contagem de *breakpoints*, contagem nominal dos cinco `registerGuideTarget` | `TK-A-007`, `TK-A-015`, `TK-A-021`, `TK-A-038`, `TK-A-056`, `TK-A-094`, `TK-B-022`..`TK-B-024`, `TK-B-041`, `TK-C-002`, `TK-C-014`, `TK-C-023`, `TK-C-027`, `TK-C-060`, `TK-C-061`, `TK-C-063` |
| **(2) Automatizável em Node** — arnês de lógica pura | Idempotência de projeção, *clamp* de câmera, ortogonalidade de eixos, classificação de payload, *write-forward* com falha injetada | `TK-A-006`, `TK-A-031`, `TK-A-046`, `TK-A-053`, `TK-B-007` |
| **(3) Estrutural, não perceptual** | O código **passa** a consumir o *hook*/serviço certo — mas o **resultado visual** não é provado aqui | `TK-A-010`, `TK-A-011`, `TK-C-003`, `TK-C-006`, `TK-C-008`, `TK-C-011` |
| **(4) Exige WebView real** | Pintura, balde, reamostragem do *raster*, término do processo de conteúdo, `onRenderProcessGone` | `TK-A-012`..`TK-A-014`, `TK-A-035`..`TK-A-037`, `TK-A-063`..`TK-A-080`, `TK-A-100`..`TK-A-105` |
| **(5) Exige *layout* nativo medido** | Vazio vertical em pontos na barra lateral, coluna estreita cercada de vazio, composição por família e faixa | **`TK-C-020`**, `TK-C-039`..`TK-C-043`, `TK-C-062` |
| **(6) Exige React Navigation real** | Preservação de rota, pilha e aba; ausência de remontagem na travessia de `600dp` | `TK-A-022`, `TK-A-023`, `TK-C-041` |
| **(7) Exige *safe area* / plataforma real** | *Callout* do guia, Split View, Slide Over, `requireFullScreen`, `ITMS-90474`, orientação efetiva | `TK-C-026`, `TK-C-031`..`TK-C-033`, `TK-C-035`, `TK-C-041` |
| **(8) Exige aparelho físico com acervo real** | Toda a matriz §28.1, os 17 cenários de §28, o acervo misto e o *rollback* com *build* anterior instalável | `TK-A-063`..`TK-A-084`, `TK-A-097`, `TK-A-098`, `TK-A-100`..`TK-A-105`, `TK-B-031`..`TK-B-036`, `TK-B-044`, `TK-B-045`, `TK-C-038`..`TK-C-046`, `TK-C-062` |

**Consequência normativa:** `npm run smoke` verde prova **(1)** e **(2)**, e **nada além disso**.
Nenhum subportão pode ser apresentado ao fundador alegando cobertura de **(3)** a **(8)** com base em
saída de Node.

### 11.12 Itens sem task — justificativa explícita

| Item do PLAN | Por que **não** gera task |
|---|---|
| **`P-103`** | `Q7` congelada: diferida à **Fase 7**. Nenhuma task da Fase 6 corrige ou reclassifica. Registro em `TK-C-025`. |
| **Defeitos 4 e 5 da barra lateral** (§19) | Pertencem ao Bloco **`B2`**, que **continua bloqueado**. Literalmente: defeito 4 = `navButton` com `paddingVertical: 13` + ícone 26 ⇒ ≈52pt contra o mínimo 56×56 de `RF-A7` (`:200`, `:209`); defeito 5 = `progressLabel` 10px e `stars` 11px contra o piso de 13px de `RF-C12` (`:192`, `:173`). Registro de não-invasão em `TK-C-022`. |
| **Refatoração dos cinco jogos para `GameSurface`** | §6.3: risco de regressão **sem requisito**. Adoção diferida a **F12A**. Registro em `TK-C-012`, `TK-A-029`. |
| **`StoryBookScreen` além do mínimo** | Escopo de **F9**. Tocado apenas no necessário (`TK-C-011`, `TK-A-024`). |
| **Escolha da rota condicional de §33** (tablet Android ausente) | Emenda `A-13`: a rota **não é escolhida agora**. O que **passa a existir** é o **cenário físico** (`TK-C-062`) e a trava normativa: **`SD-1` fica explicitamente NÃO CONCEDÍVEL** sem essa validação (`TK-A-082`, `TK-C-046`). |
| **Escolha da rota técnica de orientação** | Regra do fundador: a rota **permanece não escolhida**. `TK-C-028`..`TK-C-034` produzem a base; `TK-C-035` só executa **após aprovação**. |
| **`MAP_ANCHOR_FRAMING` como constante nova** | Emenda `A-18`: **se nenhuma decisão estética residual restar depois de medido tudo o que é mensurável, o *token* NÃO nasce.** `TK-B-043` é **condicional** e nenhum agente escolhe `0.58`, `0.5` ou terceiro valor por conta própria. |
| **Itens de §40 (fora de escopo)** | Declarados fora do delta da Fase 6 pelo PLAN aprovado. |
| **Migração para TypeScript** | Depende de feature própria aprovada pelo ciclo SDD. Fora deste delta. |
| **Adoção de `useSurfaceLifecycle` pelos quatro jogos** | Mesma justificativa de §6.3; o *hook* é oferecido, não imposto. |
| ***Write-forward* em `atelierStorage.saveArt`** | **Descoberto por `TK-A-096`**, não por esta emenda. `atelierStorage.js` **não consta da lista de arquivos de nenhuma task de `F6-R3`**; corrigi-lo aqui ampliaria o pacote sobre **área protegida (persistência)** sem requisito. Severidade **MÉDIA**, explicitamente **não `SD-8`** (caso `13.9`). Registro completo e destino **`F12A`** em **§11.16-c**. **Não é bloqueador de `F6-SG-A`.** |

### 11.13 Subportão → critério de saída → task

> Matriz exigida pela emenda (*"subportão → critérios de saída"*). Cada critério aponta para a task
> que **produz a evidência**. Nenhuma linha é satisfeita por menção textual em outra task.

| Subportão | Critério de saída | Tasks que produzem a evidência |
|---|---|---|
| **`F6-SG-A`** | Conjunto automatizado verde (`TA-4`, `TA-5`, `TA-11`..`TA-13`) | **`TK-A-058`** |
| | `npm run smoke` + `npx expo-doctor` verdes (`SD-10`) | `TK-A-059` |
| | Controles negativos do pacote (`CN-2`, `CN-4`, `CN-6`, `CN-13` + `CN-8` por `TK-A-099`) | **`TK-A-060`** |
| | Mutantes do pacote com **vermelho registrado** | `TK-A-061` |
| | Inventário de armazenamento **antes e depois** do pacote | `TK-A-062` |
| | **Matriz §28.1 — 17 de 17 obrigatórios `PASS`** (+ `E1`..`E6` registrados) | `TK-A-063`..`TK-A-080`, `TK-A-100`..`TK-A-105` |
| | Cenários físicos §28 **#1–#11** + **#7** + parcela `SG-A` do **#17** | `TK-A-081`, `TK-A-097`, `TK-A-098` |
| | `CN-8` verificado em **cada um dos 12 *commits*** de `F6-R3` | `TK-A-099` |
| | **`SD-8` honrado antes de sequer apresentar o subportão** | `TK-A-084` |
| | Vão de tablet Android registrado e **`SD-1` travado** | `TK-A-082` |
| | Relatório `PASS`/`FAIL` submetido ao fundador | `TK-A-083` |
| **`F6-SG-B`** | Conjunto automatizado verde | `TK-B-029` |
| | Mutantes do pacote com vermelho registrado | `TK-B-030` |
| | Cenários físicos §28 **#12**, **#13**, **#14** + parcela `SG-B` do **#17** | `TK-B-031`..`TK-B-035`, `TK-B-044`, `TK-B-045` |
| | `CN-8` nos **7 *commits*** de `F6-R2` | `TK-B-046` |
| | Relatório `PASS`/`FAIL` submetido ao fundador | `TK-B-036` |
| **`F6-SG-C`** | Conjunto automatizado verde | `TK-C-036` |
| | Provas vermelhas consolidadas — **uma injeção por vez** (emenda `A-08`) | `TK-C-037`, `TK-C-047`..`TK-C-059` |
| | *Tokens* verificados e `Q4` **determinada**, não escolhida | `TK-C-044`, `TK-C-061` |
| | Ausência de arquitetura paralela | `TK-C-045` |
| | Cenários físicos §28 **#6**, **#15**, **#16** + parcela `SG-C` do **#17** | `TK-C-038`..`TK-C-043` |
| | **Cenário adicional de tablet Android** — sem ele **`SD-1` é NÃO CONCEDÍVEL** | **`TK-C-062`** |
| | `CN-8` nas **11 saídas** de `F6-R1` (`C-C1`..`C-C10` + `C-GOV1`) | `TK-C-064` |
| | Relatório `PASS`/`FAIL` submetido ao fundador | `TK-C-046` |
| **`F6-SG-D`** | As **12 condições de §37**, uma a uma, com evidência nomeada | **`TK-D-001`** |
| | As **três concessões humanas** registradas como ato humano, nunca inferido | **`TK-D-002`** |
| | `SD-8` honrado **do início ao fim** do delta | `TK-D-003` |
| | `P-152`, `P-164` e `P-103` **não apagadas nem rebaixadas** | `TK-D-004` |
| | **Parecer** (i) ou (ii) — **nunca "`B2` desbloqueado"** | **`TK-D-005`** |

**4 subportões · 29 critérios de saída · 29 com task produtora de evidência.** As três concessões de
`F6-SG-A`, `F6-SG-B` e `F6-SG-C` e a decisão sobre `B2` permanecem, por construção, **fora do alcance
de qualquer task**.

### 11.14 Regra de ordem `OR-*` → task que a torna verificável

| Regra | Enunciado | Task que a prova (não apenas declara) |
|---|---|---|
| `OR-1` | Nenhuma `TK-B-*` antes da concessão de `F6-SG-A` | `TK-A-084` (não apresentar sem `SD-8`), `TK-A-083`, `TK-D-002` |
| `OR-2` | Nenhuma `TK-C-*` antes da concessão de `F6-SG-B` | `TK-B-036`, `TK-D-002` |
| `OR-3` | Nenhuma task de `F6-R2` depende de `F6-R1` | **`TK-B-021`** (asserção estática de **ausência** de `import` de `useWindowBand`/arquétipos em `mapAnchor.js`) + `TK-B-027` (`CN-9`) |
| `OR-4` | Proteção da obra **não** é deslocada para depois de `R2`/`R1` | `TK-A-030`..`TK-A-056` permanecem em `F6-R3`; `TK-A-084`; `TK-C-011` **reverifica**, não substitui |
| `OR-5` | `TK-D-*` produz **parecer**, nunca desbloqueio | **`TK-D-005`** |
| `OR-6` | Orientação nativa é o **último** passo do **último** pacote | `TK-C-034` (rota não escolhida) → `TK-C-035` (**`C-C10` isolado**, o último de `R1`) |

**6 regras de ordem · 6 com task verificadora.** `OR-3` era, na r1, a única sustentada apenas por
texto de preâmbulo; passa a ter **asserção de ausência** com task nomeada.

### 11.15 Autoavaliação de cobertura (emenda `A-26`)

> **Declaração histórica corrigida.** A r1 destas `TASKS` afirmava: *"Nenhum requisito, risco,
> portão, mutante, teste, controle negativo, cenário físico ou caso da matriz ficou órfão."*
> **Essa afirmação era falsa na r1** e não pode permanecer como se sempre tivesse sido verdadeira.
> O `Analyze` de 2026-08-09 demonstrou o contrário: a r1 tinha portões sem prova independente,
> mutantes canônicos desaparecidos, `CN-8` fora da semântica canônica, cenários físicos do PLAN
> substituídos, a matriz §28.1 trocada, `D12` sem task, `MapRegion.js` com caminho inexistente e
> sete mutações injetadas de uma vez em `TK-C-037`.

**Estado após esta emenda — números apurados mecanicamente, não estimados:**

| Dimensão | Total | Com task | Órfãos |
|---|---|---|---|
| Requisitos (`F6-R*`) | 15 | 15 | **0** |
| Critérios de sucesso (`SD-*`) | 11 | 11 | **0** — `SD-1` coberto **e explicitamente travado** |
| Riscos (`RG-*` + `P-*` rastreados) | 16 | 15 | **1 deliberado** — `P-103`, por `Q7` |
| Portões | **32** | 32 criados · 32 provados vermelhos | **0** · **0 autoprovas** |
| Mutantes | **34** | 34 tasks de injeção **isolada** | **0** |
| Testes (`TA-*`) | **15** | 15 | **0** |
| Controles negativos (`CN-*`) | **13** | 13 | **0** |
| Cenários físicos §28 | **17** | 17 | **0** — nenhum substituído |
| Casos da matriz §28.1 | **17 obrigatórios + 6 adicionais = 23** | 23 | **0** |
| Decisões do fundador (`Q3`–`Q9`) | 7 | 7 | **0** |
| Critérios de saída de subportão (§11.13) | **29** (4 subportões) | 29 | **0** |
| Regras de ordem (`OR-1`..`OR-6`) | **6** | 6 | **0** — `OR-3` deixou de ser só texto |
| Tasks definidas **citadas** por alguma matriz do §11 | **220** | 220 | **0** — verificado por extração mecânica dos IDs |

**Itens de não-geração deliberada: 11** (§11.12) — declarados, justificados e rastreáveis. **Não são
omissão**, e **não** são contabilizados como cobertura. O décimo primeiro (***write-forward* em
`atelierStorage.saveArt`**) **não** existia quando esta tabela foi apurada: ele foi **descoberto pela
leitura `TK-A-096`** durante a execução de `C-A11` e está registrado em **§11.16-c**, com destino
**`F12A`**.

### 11.16 Registro de `TK-A-096` — a cadeia **real** de promoção (leitura congelada)

> `TK-A-096` é **leitura dirigida**, `Auto: não`, **sem alteração de *runtime***. Ela existe para
> substituir suposição por leitura provada **antes** de qualquer linha de promoção ser escrita. Este é
> o registro documental que a task produz, e é ele que sustenta a reescrita de `TK-A-049` (§3.6).
>
> **A premissa da emenda `A-22` era falsa.** `A-22` falava em *"o ponto de promoção"*, no singular.
> Não existe ponto único: existem **três cadeias de salvamento** e **quatro pontos de promoção**, e
> eles **divergem** entre si.

**(a) As cinco perguntas de `TK-A-096`, respondidas com `arquivo:linha` verificável**

| Cadeia | Onde o blob é escrito | Onde o ponteiro é gravado | Instrução que **promove** | O que acontece se falhar | Estado |
|---|---|---|---|---|---|
| **Colorir 60 — *único caminho vivo*** | slot **inativo** do *double-buffer* A/B | mesma chave, após confirmação | `coloring60DrawingStorage.js:581` | **relê** (`:591`), **confirma** identidade/URI/revisão (`:596`), faz ***rollback*** na divergência (`:599`) e só então descarta o blob anterior (`:613`, com `protect`) | ✅ **`Q8` r.7–9 SATISFEITAS** |
| **Colorir legado** | `drawingStorage.js` | `drawingStorage.js` | `drawingStorage.js:140` | — | ⚠️ **escritor sem chamador de *runtime*** (`TA-13` caso 13.7). O **LEITOR** do mesmo módulo continua vivo no **Livrinho** (caso 13.8, `Q8` r.11) — por isso o módulo permanece `INTOCADO` |
| **Ateliê** | `atelierStorage.js:138` | `atelierStorage.js:146` | dois `setItem` **não atômicos entre si** | *preview* sobrescrito em caminho determinístico **antes** da promoção; **sem** releitura, **sem** confirmação, **sem** *rollback* | ⚠️ **pendência (c)** |

**(b) Consequência normativa para `TK-A-048` · `TK-A-049` · `TK-A-050`**

As três se resolvem como **VERIFICAÇÃO**, não como reescrita. A mudança que pediam **já é o
comportamento vigente** do único escritor que a criança alcança; escrevê-la de novo no escritor
**morto** seria cerimônia sobre código que ninguém executa — e forçar o código a caber na task.
**Nenhum dos três arquivos de armazenamento foi tocado em `C-A11`.** A reescrita de `TK-A-049` está
registrada na própria task (§3.6), com a redação anterior preservada e o motivo do erro explicitado.

**(c) Pendência registrada — `atelierStorage.saveArt` **sem** *write-forward* → destino **`F12A`****

- **O que é.** `atelierStorage.saveArt` grava por **dois `setItem` não atômicos entre si**
  (`atelierStorage.js:138` e `:146`) e sobrescreve o *preview* em caminho determinístico **antes** da
  promoção, sem releitura, confirmação ou *rollback*. Não satisfaz `Q8` r.7–9.
- **Severidade avaliada: MÉDIA — explicitamente NÃO `SD-8`.** O caso **13.9** de `TA-13` prova que a
  obra da criança (`stateJson`) viaja num **único `setItem` por chave**, e `setItem` é **atômico por
  chave**: uma falha ou interrupção deixa a **obra anterior vigente e válida**. O que se perde numa
  interrupção é **coerência de *preview*/índice** — derivada e recuperável, não píxel de criança.
- **Por que NÃO é corrigida na Fase 6.** `atelierStorage.js` **não consta da lista de arquivos de
  NENHUMA task de `F6-R3`**. Corrigi-la aqui seria ampliar o pacote por conta própria, sobre **área
  protegida (persistência)**, sem requisito e sem *spec*.
- **Destino.** **`F12A`**, junto da **eliminação do Ateliê legado** já decidida em produto — o mesmo
  destino, e não um item avulso que sobreviveria ao módulo que o hospeda.
- **Decisão do fundador (fechada nesta sessão):** *não* implementar *write-forward* no Ateliê agora;
  *não* ampliar `F6-R3` para consertá-lo; registrar formalmente a pendência; vinculá-la a `F12A`; **não
  deixar o aviso parecer bloqueador de `F6-R3`**; **não apagar nem silenciar evidência existente apenas
  para tornar os *gates* verdes**.
- **Evidência viva, deliberadamente não silenciada.** O arnês emite `⚠ DÍVIDA (TK-A-049)` **em toda
  execução** do `smoke`. O aviso **permanece**: ele é um aviso (`⚠`), não uma falha (`✗`) — não
  reprova nenhum portão, não bloqueia `F6-SG-A`, e existe para que a dívida **não apodreça em
  silêncio** até `F12A`.

### 11.17 Registro de `TK-A-057` — fronteira de `F6-R3.6`: `P-164` permanece **ABERTA**

> `TK-A-057` é **documental**, `Auto: não`, **nenhum arquivo de *runtime***. Ela existe para impedir
> que a instrumentação de `F6-R3.2`/`F6-R3.4` seja lida como investigação concluída.

**O que a Fase 6 entrega sobre `P-164`, e apenas isto:**

| Entregue | **Não** entregue |
|---|---|
| **Defesa** — `onContentProcessDidTerminate` (iOS) e `onRenderProcessGone` (Android) declaradas nos **dois** motores de canvas, cada uma **registrando** o evento com a plataforma nomeada (`G-LFC-3`, `C-A4`) | **Diagnóstico fechado.** Nenhum artefato afirma qual é a causa do término do processo de conteúdo |
| **Instrumentação** — o evento passa a ser **observável** quando ocorrer (`recordWebViewProcessTermination`) | **Reprodução provada.** O evento **não** foi reproduzido em aparelho nesta rodada |
| **Ciclo de vida** — `useSurfaceLifecycle` consumido pelas duas telas de canvas (`G-LFC-2`) | **Causalidade.** `FD-12` **proíbe** que qualquer artefato declare "causa confirmada" |

**Estado verificado na fonte (leitura, sem alteração):** em
`docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`, **`P-152` (linha 543)** e **`P-164`
(linha 648)** continuam com estado **`ABERTO`** e severidade **alta**. **Nenhuma das duas foi apagada,
rebaixada ou marcada como resolvida pela Fase 6.** A verificação formal desse não-rebaixamento é de
`TK-D-004` (`BLOCO 7`), e **não** é antecipada aqui.

**Observação registrada, não corrigida (fora do escopo de `F6-R3`):** a célula de evidência de `P-164`
cita, entre suas provas, *"prova negativa: zero `onContentProcessDidTerminate`/`onRenderProcessGone`
em `src/`"*. Essa frase descreve o estado **anterior** à Fase 6 e deixou de valer com `C-A4` — o que
**não** altera o estado da pendência (que segue `ABERTO`), mas torna aquela linha de evidência
**histórica**. A atualização da matriz da Fase 3 pertence a `TK-D-004`; alterá-la a partir de `F6-R3`
seria mexer em artefato de outra fase sem requisito.

---

### 11.18 Registro consolidado de `TK-A-061` — os 14 mutantes de domínio `R3`

> Este quadro é o **artefato** de `TK-A-061`. Ele **não injeta mutação alguma**: cada mutante foi
> injetado, observado vermelho e revertido **isoladamente**, na sua própria task de prova, **um por
> vez**, com `git diff --stat` vazio conferido antes do seguinte. **Nenhum mutante foi *commitado*.**
> O quadro existe porque um portão que nunca foi visto vermelho é indistinguível de um portão sem
> dentes — e é essa distinção, não o número verde do relatório, que `RG-13` cobra.

**(a) Os 14 mutantes obrigatórios**

| # | Mutante · task | Defeito deliberado (injeção exata) | Portão que devia detectar | Vermelho observado | Revertido |
|---|---|---|---|---|---|
| 1 | `MT-1` · `TK-A-093` | recolocar `useEffect(() => { didInitScroll.current = false; }, [mapWidth])` em `AdventureMapScreen.js` | `G-LFC-1` | **1** — `G-LFC-1 [1/2]`. `[2/2]` seguiu **verde**: as duas metades medem coisas diferentes e o defeito é dirigido | ✅ |
| 2 | `MT-5` · `TK-A-086` | realocar `qBuf`/`visBuf`/`paintD` dentro de `resize()` no motor do Colorir | `G-CVS-1` | **5** — `G-CVS-1` estático + **4 casos comportamentais** de `TA-5R`, entre eles a deriva acumulada em dez rotações e a obra anterior perdida | ✅ |
| 3 | `MT-6` · `TK-A-039` | `stateJson` do Ateliê deixa de declarar `logicalW`/`logicalH` (volta a gravar coordenada de *viewport*) | `G-CVS-2` | **5** — `G-CVS-2 [1/2]` + 4 casos de `TA-5`. `[2/2]` verde: o leitor não foi tocado | ✅ |
| 4 | `MT-12` · `TK-A-008` | `exportPaint` emite `v:3`: `JSON.stringify({v:CANVAS_PAYLOAD_V,` → `JSON.stringify({v:3,` | `G-VER-1` | **6** — `G-VER-1 [2/3]` e `[3/3]`, `TA-11 1.3` (`v` congelado em 2), `TA-11 1.8` (guarda REAL do C60 aceita o payload), `TA-11 7.13` (ida-e-volta) e `TA-5R 11.4`. `G-VER-1 [1/3]` verde: a constante não foi tocada — o defeito é dirigido ao ponto de emissão | ✅ |
| 5 | `MT-13` · `TK-A-040` | leitor **apaga/limpa/substitui por canvas branco** ao encontrar incompatibilidade | `G-CMP-1` + `G-CVS-3` | **5** contra `G-CMP-1` (`C-A10`) e **3** contra `G-CVS-3 [1/3]` (`C-A12`), estes incluindo `TA-12 12.30` (`SD-8`: obra viva apagada) e `TA-11 4.2` | ✅ (nas duas ocasiões) |
| 6 | `MT-14` · `TK-A-054` | promover a nova representação **antes** de validar a releitura | `G-CMP-4` | **11** — derrubou **as duas metades**: `G-CMP-4` estático (`13.3`, `13.5`) e o comportamental (`S3 [04/30]` + controles negativos do `S3`). **Também expôs que o caso `13.4` passava VACUAMENTE** com a âncora ausente (`iConf = -1`); o caso foi endurecido com `iConf > 0` | ✅ |
| 7 | `MT-17` · `TK-A-047` | abrir obra volta a converter e regravar em formato novo | `G-CMP-2` | **5** | ✅ |
| 8 | `MT-18` · `TK-A-055` | remover a verificação de identidade do *lineart* | `G-CMP-6` | **4**, entre eles `12.30` — a obra viva **sobrescrita pela tinta de outro desenho**, que é o dano concreto da invariante **ZERO #2**. Os casos de aceitação seguiram verdes: defeito único e dirigido | ✅ |
| 9 | `MT-26` · `TK-A-087` | `ColoringScreen` deixa de consumir `useSurfaceLifecycle` | `G-LFC-2` | **2** — `G-LFC-2` + o selo byte-idêntico preexistente `[3714]` | ✅ |
| 10 | `MT-27` · `TK-A-088` | remover `onRenderProcessGone` do motor | `G-LFC-3` | **2** — `G-LFC-3 [1/2]` e `[2/2]` | ✅ |
| 11 | `MT-28` · `TK-A-089` | **duas metades, uma por vez** — (a) `POINTER_VERSION` 3 → 4; (b) a escada de migração ganha o degrau `{ version: 4, run: migrateToV3 }` | `G-VER-2` | (a) **8** — `G-VER-2 [1/2]`, `TA-11 7.1`, `TA-11 7.5`, `A1`, `A5` (2 selos) e os **2 selos byte-idênticos** do `drawingStorage`; (b) **2** — `G-VER-2 [2/2]` e `CN-13 [1/3]` | ✅ (as duas, separadamente) |
| 12 | `MT-29` · `TK-A-090` | `classifyAxes` passa a **inferir um eixo a partir do outro** (`layout: axisOf(obj.layoutVersion !== undefined ? obj.layoutVersion : obj.paintSchemaVersion)`) | `G-VER-3` | **4** — `G-VER-3 [1/3]`, `G-VER-3 [3/3]`, `TA-11 3.2a` e `TA-11 4.1` | ✅ |
| 13 | `MT-33` · `TK-A-091` | `Math.min` → `Math.max` em `computeViewportProjection` (`contain` vira `cover`) | `G-CMP-3` | **8 casos de `TA-4`** — `1.1`, `2.4`, `3.1`, `3.2`, `3.3`, `7.1`, `7.2`, `8.1`. Ver a nuance registrada em **(c)** | ✅ |
| 14 | `MT-34` · `TK-A-092` | limpeza volta a **enumerar diretório** | `G-CMP-5` | **4** — `G-CMP-5 [1/2]` + os **2 selos byte-idênticos** do `drawingStorage` + o comportamental `S4 [07/26]` | ✅ |

**14 mutantes · 14 vermelhos observados · 14 reversões · nenhuma mutação simultânea em momento
algum · nenhum mutante *commitado*.**

**(b) Registro de `MT-7` (`TK-A-095`) — verificação antecipada, prova formal em `F6-SG-C`**

`MT-7` (reintroduzir `Dimensions.get`) tem prova **formal** em `TK-C-047` (`F6-SG-C`); aqui vale
apenas o registro da **verificação imediata** exigida por `TK-A-095`. Ele foi executado em duas
variantes, porque a primeira revelou um efeito colateral que merece registro:

| Variante | Injeção | Resultado |
|---|---|---|
| `MT-7` | `Dimensions.get('window')` dentro de `useViewportProjection.js` | `G-RSP-1` (≡ `TA-6`) **vermelho** em `[4543]`, **seguido de queda dura** do smoke: `TA-4` **executa a fonte real** do hook e lançou `ReferenceError: Dimensions is not defined`, abortando a contagem final |
| `MT-7b` | `useWindowDimensions()` → `Dimensions.get('window')` em `AdventureMapScreen.js:91` — módulo que **nenhum arnês executa** | **1** vermelho — `[4543]` `G-RSP-1`, com **tally completo** (`4853/4854`). Defeito dirigido, red contável |

A queda dura de `MT-7` **não** é defeito: é consequência de o arnês executar a fonte real em vez de
uma cópia. A variante `MT-7b` existe só para obter um vermelho **contável e isolado** sobre o mesmo
portão. Ambas revertidas.

**(c) Nuance registrada — `G-CMP-3` não tem asserção estática nomeada**

`MT-33` deveria "deixar `G-CMP-3` vermelho". A string `G-CMP-3` **não existe** em
`scripts/smoke.js`. Isso **não** é um portão faltando: por `TK-A-032`/`TK-A-033`, a **Prova** de
`G-CMP-3` é o arnês **`TA-4`**, que executa o **código-fonte real** de `useViewportProjection.js` —
prova **comportamental**, não asserção de texto. Entre os 8 vermelhos de `MT-33` está o caso
`2.4 · é contain e NÃO cover · a escala é o min, jamais o max`, que é o **enunciado literal** de
`G-CMP-3`. Registrado como nuance de leitura dos artefatos; **não** gera trabalho novo em `R3`.

**(d) Nuance registrada — `TA-6` ≡ `G-RSP-1`**

O PLAN (linha 941) define `TA-6` como *"Portão estático · Ausência de `Dimensions.get` em `src/` ·
`scripts/smoke.js`"*. `TA-6` e `G-RSP-1` são **o mesmo artefato**: "`G-RSP-1` vermelho e `TA-6`
falhando" descrevem **um único** vermelho, não dois.

---

## 12. Decisões do fundador ainda necessárias

**Para conceder o Portão Humano 3: nenhuma decisão de produto está pendente.** As questões `Q1`–`Q9`
continuam congeladas; as decisões `A-01`..`A-27` da emenda pós-`Analyze` estão incorporadas.

Quatro decisões tornam-se necessárias **depois** do Portão 3, e estão explicitamente representadas
como precondições de task — **nenhuma delas pode ser tomada por um agente**:

| Decisão | Quando | Task que a exige | Trava |
|---|---|---|---|
| **Rota técnica de orientação** e, se aplicável, **aprovação prévia de dependência** | Dentro de `F6-R1`, antes do último passo | `TK-C-034` → `TK-C-035` | `TK-C-035` não executa sem aprovação explícita |
| **Rota condicional de §33** para a ausência de tablet Android (`P8`) | Antes de conceder `F6-SG-C` | `TK-A-082`, `TK-C-046`, `TK-C-062` | Emenda `A-13`: a rota **não é escolhida agora**; **`SD-1` fica NÃO CONCEDÍVEL** enquanto `TK-C-062` estiver `PENDENTE — SEM APARELHO` |
| **Resíduo estético de `MAP_ANCHOR_FRAMING`** (`Q6`) — **condicional** | Só **se** sobrar resíduo depois de medido tudo o que é mensurável | `TK-B-043` | Emenda `A-18`: se nenhum resíduo restar, **o *token* NÃO nasce**. **Nenhum agente escolhe `0.58`, `0.5` ou terceiro valor** |
| **Destino de `grid` / `displayScaleTablet`** (`Q4`) — **determinado, não escolhido** | `F6-R1.3`, depois do passo 1 | `TK-C-015` → `TK-C-061` | Emenda `A-19`: **proibido criar consumidor artificial** só para salvar o *token*; **proibido remover antes da determinação** |

Além dessas, as **três concessões humanas de subportão** (`F6-SG-A`, `F6-SG-B`, `F6-SG-C`) e a
**decisão sobre `B2`** permanecem, por construção, fora do alcance de qualquer task.

---

## 13. Fronteira desta rodada

| Ação | Estado |
|---|---|
| Tasks geradas | ✅ — **220 tasks** (171 da r1 preservadas + 49 acrescentadas pela emenda) |
| `Analyze` (Etapa SDD 6) — **1ª execução** | ✅ **executado** e entregue como diagnóstico; **aprovado como diagnóstico** pelo fundador |
| **Emenda documental pós-`Analyze`** (`A-01`..`A-27`) | ✅ **executada nesta revisão** |
| `Analyze` — **2ª execução**, *read-only* sobre os artefatos corrigidos | 🔄 **prevista imediatamente após o *commit* desta emenda** |
| **Portão Humano 3** | 🚦 **RETIDO** — não concedido |
| `Implement` (Etapa SDD 7) | ❌ **não executado** — **permanece proibido** |
| Alteração de *runtime* | ❌ **nenhuma** |
| Alteração de *assets* | ❌ **nenhuma** |
| Alteração de `app.json` · `eas.json` · `package.json` · `package-lock.json` · `scripts/` | ❌ **nenhuma** |
| Dependência instalada | ❌ **nenhuma** |
| *Build* / Metro | ❌ **não executados** |
| `push` / `merge` | ❌ **não executados** |
| `B2` | 🔒 **continua bloqueado** |
| `SD-8` | 🔴 **continua bloqueador absoluto** |
| **`SD-1`** | ⛔ **NÃO CONCEDÍVEL** sem o cenário físico de tablet Android (`TK-C-062`) |
| `P-152` · `P-164` | 📌 **mantidas, sem rebaixamento** |
| `P-103` | ⏭️ **diferida à Fase 7** |
| **`F6-R2.5` / `D12`** | ✅ **preservada na Fase 6**, escopo estrito (`TK-B-040`..`TK-B-042`) — **não remetida à Fase 7** |
| PLAN aprovado | ✏️ **emendado apenas onde a análise provou omissão real perante a SPEC ou onde uma decisão desta mensagem precisou ser congelada** (`G-MAP-5`, `D12`); **nenhum ID canônico foi renumerado** |
| SPEC aprovada | ✅ **não alterada** — nenhuma contradição objetiva foi encontrada |

---

## 14. Reexecução do **Constitution Check** ao fim das Tasks

> O PLAN §4 determina: *"Portão: precisa passar antes de qualquer projeto de implementação;
> **re-checado ao fim das Tasks**."* Esta seção é esse re-check, **reexecutado após a emenda
> pós-`Analyze`**. Decisão do fundador: ***"O Princípio II somente pode voltar a PASSA se todos os
> gates que sustentavam o PLAN estiverem novamente presentes e semanticamente íntegros. Não declare
> PASSA por intenção."***

### 14.1 Verificação item a item dos portões que sustentam o Princípio II

O PLAN §4.3 sustenta o Princípio II e as Áreas Protegidas em **onze portões nominados** mais a
matriz §28.1. Cada linha abaixo é verificada por **presença com semântica canônica, criador e prova
vermelha independente** — não por menção textual.

| Portão exigido pelo PLAN §4.3 | Presente? | Semântica canônica? | Criador | Prova vermelha **independente** | Veredito |
|---|---|---|---|---|---|
| `G-CMP-1` | sim | sim | `TK-A-046` | `TK-A-040` (`MT-13`) | ✅ |
| `G-CMP-2` | sim | sim | `TK-A-046` | `TK-A-047` (`MT-17`) | ✅ |
| `G-CMP-3` | sim | sim | `TK-A-032`/`TK-A-033` | `TK-A-091` (`MT-33`) | ✅ |
| `G-CMP-4` | sim | sim | `TK-A-053` | `TK-A-054` (`MT-14`) | ✅ |
| `G-CMP-5` | sim | sim | `TK-A-056` | `TK-A-092` (`MT-34`) | ✅ |
| `G-SID-2` | sim | **restaurada** (`A-01`) | `TK-C-023` | `TK-C-024` (`MT-15`) | ✅ |
| `G-SID-3` | sim | **restaurada** (`A-01`) | `TK-C-023` | `TK-C-052` (`MT-16`) | ✅ |
| `G-VER-1` | sim | sim | `TK-A-007` | `TK-A-008` (`MT-12`) | ✅ |
| `G-VER-2` | sim | sim | `TK-A-007` | `TK-A-089` (`MT-28`) | ✅ |
| `G-VER-3` | sim | sim | `TK-A-007` | `TK-A-090` (`MT-29`) | ✅ |
| `G-CVS-1` | sim | **restaurada** (`A-02`: `resize()` não realoca `qBuf`/`visBuf`/`paintD`) | `TK-A-038` | `TK-A-086` (`MT-5`) | ✅ |
| `G-CVS-2` | sim | **restaurada** (`A-24`: `stateJson` declara `logicalW`/`logicalH`) | `TK-A-038` | `TK-A-039` (`MT-6`) | ✅ |
| **Matriz §28.1** | sim | **restaurada** (`A-03`: os 17 casos do PLAN são a baseline) | `TK-A-063`..`TK-A-079` | consolidação em `TK-A-080` | ✅ |

### 14.2 Princípios

| # | Princípio | Estado após a emenda | Veredito |
|---|---|---|---|
| **I** | **Stack Tecnológico Soberano** | Nenhuma dependência instalada. `TK-C-034` continua exigindo **aprovação prévia explícita** antes de qualquer instalação; `TK-C-035` só executa depois. `SD-11` ganhou portão **antecipado** a `F6-R3` (`TK-A-094`, emenda `A-14`) | ✅ **PASSA**, com a tensão declarada e contida |
| **II** | **Arquitetura Local-First e Separação de Responsabilidades** | Os **treze** itens de §14.1 estão presentes, com **semântica canônica do PLAN**, criador nomeado e **prova vermelha independente**. As duas semânticas que a r1 havia trocado (`G-CVS-1`, `G-CVS-2`) foram **restauradas**; a proteção nova que ocupara indevidamente `G-CVS-2` foi preservada como **`G-CVS-3`**, ID inédito | ✅ **PASSA** — **verificado item a item, não por intenção** |
| **III** | **Qualidade e Clean Code** | 100% JavaScript; nenhum `tsconfig.json`; nenhuma conversão de `.js`. Nenhuma task desta emenda altera código | ✅ **PASSA** |
| **IV** | **Performance e UI/UX Mobile** | Inalterado: nenhuma memoização preventiva; medir antes de refatorar amplo. A emenda **acrescentou** a classificação de §11.11-b, que **impede** declarar propriedade perceptual como provada por Node | ✅ **PASSA** |
| **V** | **Regra de Ouro — SDD com 3 Portões Humanos** | O `Analyze` foi executado **antes** de qualquer código; o Portão Humano 3 **não foi concedido**; `Implement` **não** foi iniciado. Esta emenda é **exclusivamente documental** e devolve aos artefatos o que a implementação ainda nem começou a descobrir | ✅ **PASSA** |

### 14.3 Seções normativas complementares

| Seção | Estado após a emenda | Veredito |
|---|---|---|
| **Precedência Documental** | Restaurada explicitamente: **SPEC aprovada → PLAN aprovado → TASKS**. As `TASKS` deixaram de redefinir silenciosamente identificadores do PLAN (`A-01`) | ✅ |
| **Nomenclatura sem Ambiguidade** | "Fase 6" = fase do Roteiro; "Etapa SDD 6" = `Analyze`; `F6-SG-A..D` = subportões. Acrescentado o aviso de nomenclatura local `00_`..`05_` (§2.4.2, emenda `A-27`) | ✅ |
| **Rigor Proporcional ao Risco** | Faixa máxima mantida: persistência da obra da criança + ciclo de vida ⇒ fluxo completo, revisão independente e aprovação explícita | ✅ |
| **Áreas Protegidas** | `CN-8` voltou à semântica canônica — **verificação por *commit*** de *assets*, manifestos, histórias, conquistas e `accessControl`, com `git diff --cached --name-only` como parte da prova, em **30 fronteiras de *commit*** (12 + 7 + 11 — `TK-A-099`, `TK-B-046`, `TK-C-064`, emenda `A-15`) | ✅ **PASSA** |
| **Restrições de Stack e Segurança** | `G-RSP-1` (zero `Dimensions.get`), `G-RSP-3` (zero `Platform.isPad` / `expo-device`) e `G-RSP-7` (três *breakpoints*) **ativos desde `F6-R3`**; `G-BP-1` (zero literais `768`) **preservado sem regressão** (`A-16`) | ✅ |
| **Portões de Qualidade** | `npm run smoke` + `npx expo-doctor` + **validação visual** + **aparelho físico**, agora com a fronteira explícita de §11.11-b: *smoke* verde prova apenas asserção estática e lógica pura | ✅ |
| **Governance** | O Constitution Check foi **reexecutado**, como esta seção comprova | ✅ |

### 14.4 Veredito consolidado

> **Nenhuma violação constitucional em aberto.** O Princípio II volta a **PASSA** com verificação
> item a item (§14.1), e **não por intenção**: os treze itens que o sustentam estão presentes, com
> a semântica do PLAN, com criador nomeado e com prova vermelha **independente da task criadora**.
>
> **Bloqueador remanescente: apenas de processo.** O **Portão Humano 3 continua RETIDO** e
> `Implement` continua **proibido** até decisão humana explícita em mensagem posterior.

**Fim do artefato `05_TASKS_DELTA_F6.md`.**

