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
| Autoridade | `04_PLAN_DELTA_F6.md` (r2), aprovado no Portão Humano 2 |

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
- **Precondições:** `TK-A-006` — **Depende de:** `TK-A-003`, `TK-A-005`
- **Mudança esperada:** três asserções novas: payload nunca contém `v: 3`; `POINTER_VERSION`/`APP_STORAGE_SCHEMA_VERSION` inalterados e escada sem degrau novo; eixos referenciados por nome.
- **Prova:** `MT-12` — **Gate:** `G-VER-1`, `G-VER-2`, `G-VER-3`
- **Conclusão:** `npm run smoke` verde no estado correto e **vermelho** sob `MT-12`.
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
- **Precondições:** `TK-A-010`, `TK-A-011`, `TK-A-013` — **Depende de:** `TK-A-011`, `TK-A-013`
- **Mudança esperada:** asserção de que as duas telas de canvas consomem `useSurfaceLifecycle` e de que os dois componentes declaram **ambas** as props de término de processo.
- **Prova:** remoção temporária de uma das props deixa o portão vermelho — **Gate:** `G-LFC-2`, `G-LFC-3`
- **Conclusão:** `npm run smoke` verde no estado correto e vermelho sob remoção.
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

#### `TK-A-021` · Portão `G-LFC-1` e mutante `MT-1`
- **Pacote · Subportão:** `F6-R3.1` · `F6-SG-A` — **Objetivo:** lacrar `F6-LFC-01`/`P-152` contra retorno.
- **Arquivos:** `scripts/smoke.js`; mutação temporária em `src/screens/AdventureMapScreen.js` (**nunca commitada**) — **Símbolos/contratos:** `codeOf`, `didInitScroll.current = false`.
- **Precondições:** `TK-A-019` — **Depende de:** `TK-A-019`
- **Mudança esperada:** asserção de que o efeito disparado por largura **não** repõe `didInitScroll`. `MT-1` reintroduz o efeito e o portão precisa ficar **vermelho**.
- **Prova:** observação do portão vermelho sob `MT-1` — **Gate:** `G-LFC-1` (**tem de falhar** sob `MT-1`)
- **Conclusão:** mutante observado falhando, revertido e registrado; `git status` limpo.
- **Risco · decisão:** `P-152` — **Auto:** sim · **Física futura:** não · **Commit:** portão em `C-A12`; **mutante não é *commitado*** · **Rollback:** `git checkout --` do arquivo mutado.

#### `TK-A-022` · `R3.3` — provar que a travessia de faixa é *re-render*, não remontagem
- **Pacote · Subportão:** `F6-R3.3` · `F6-SG-A` — **Objetivo:** **impedir regressão** de algo que já está correto (auditoria §3.1) — não reconstruir nada.
- **Arquivos:** `src/navigation/AppNavigator.js` (**verificação**) — **Símbolos/contratos:** `Tab.Navigator` único; corte de tablet (`:232`).
- **Precondições:** `TK-A-009` — **Depende de:** —
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
- **Precondições:** `TK-A-010`, `TK-A-011` — **Depende de:** `TK-A-010`
- **Mudança esperada:** **nenhuma** — a adoção de `useSurfaceLifecycle` nas telas de canvas **não** pode alterar a política de áudio existente.
- **Prova:** §28 #11 — **Gate:** — (`CN-4`)
- **Conclusão:** áudio tocando atravessa rotação, segundo plano e retorno sem corte anômalo.
- **Risco · decisão:** `SD-7` · área sensível: **manifestos de áudio não são tocados** — **Auto:** não · **Física futura:** **sim** (§28 #11) · **Commit:** `C-A6` · **Rollback:** não aplicável (verificação).

#### `TK-A-026` · Preservação do **passo do tour** e re-medição no retorno ao *foreground*
- **Pacote · Subportão:** `F6-R3.2` · `F6-SG-A` — **Objetivo:** o passo sobrevive; a **geometria** é remedida, não reiniciada.
- **Arquivos:** `src/services/beniTourService.js`, `src/hooks/useScreenGuide.js`, `src/hooks/useGuideTargets.js`, `src/services/guideTargetRegistry.js` (**verificação e re-medição**) — **Símbolos/contratos:** `registerGuideTarget`, `measureInWindow`.
- **Precondições:** `TK-A-010`, `TK-A-011` — **Depende de:** `TK-A-010`
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
- **Prova:** `TA-4` + §28.1 casos 1–6 — **Gate:** `G-CVS-1`
- **Conclusão:** em toda janela testada, a obra aparece inteira, sem esticar e sem cortar.
- **Risco · decisão:** **`RG-1`** · `SD-8` — **Auto:** sim · **Física futura:** **sim** (§28 #2, #6, #7) · **Commit:** `C-A7` · **Rollback:** reverter `C-A7`.

#### `TK-A-033` · `letterbox` — a sobra é moldura inerte, nunca área pintável
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** impedir que a criança pinte fora do espaço lógico e "perca" o traço na próxima janela.
- **Arquivos:** `src/hooks/useViewportProjection.js`, `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js` — **Símbolos/contratos:** `offsetX`, `offsetY`; recorte do alvo de toque ao retângulo lógico.
- **Precondições:** `TK-A-032` — **Depende de:** `TK-A-032`
- **Mudança esperada:** a faixa de sobra é desenhada como moldura e **não recebe traço**; toque na moldura é ignorado ou fixado à borda lógica, de forma determinística e idêntica nos dois motores.
- **Prova:** `TA-4`; §28.1 casos 3, 6 — **Gate:** `G-CVS-1`
- **Conclusão:** tocar na faixa de sobra não cria traço órfão; girar não revela traço "escondido" fora da obra.
- **Risco · decisão:** **`RG-1`** · `SD-8` — **Auto:** parcial · **Física futura:** **sim** (§28 #6, #7) · **Commit:** `C-A8`/`C-A9` · **Rollback:** reverter o *commit* do motor afetado.

#### `TK-A-034` · Espaço lógico **vetorial** (Ateliê) — traços e carimbos em coordenadas lógicas
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** o modelo do Ateliê deixa de depender do tamanho da janela.
- **Arquivos:** `src/components/AtelierCanvas.js` — **Símbolos/contratos:** `strokes`, `stamps`, `bgColor`, `logicalW`, `logicalH`, `exportState`, `loadState`.
- **Precondições:** `TK-A-030`, `TK-A-003` — **Depende de:** `TK-A-030`, `TK-A-003`
- **Mudança esperada:** todo traço e carimbo é armazenado em coordenadas lógicas; a tela é obtida por `toScreen`; nenhum ponto do modelo carrega píxel de dispositivo.
- **Prova:** `TA-5`, §28.1 casos 1, 4, 5 — **Gate:** `G-CVS-1`
- **Conclusão:** compor, girar e voltar reproduz a mesma composição, sem deriva acumulada.
- **Risco · decisão:** **`RG-1` (impacto máximo)** · `SD-8` · `Q2`/`PF6D-D-CANVAS` — **Auto:** parcial · **Física futura:** **sim** (§28 #7, #8) · **Commit:** `C-A8` · **Rollback:** reverter `C-A8`; obras existentes não são regravadas.

#### `TK-A-035` · Espaço lógico ***raster*** (Colorir) — pintura associada ao retângulo do *lineart*
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** a tinta acompanha o desenho, não a janela.
- **Arquivos:** `src/components/ColoringCanvas.js` — **Símbolos/contratos:** `W`, `H`, `imgX`, `imgY`, `imgW`, `imgH`, `exportPaint`, `loadPaint`, `validatePaint`.
- **Precondições:** `TK-A-030`, `TK-A-003` — **Depende de:** `TK-A-030`, `TK-A-003`
- **Mudança esperada:** o *buffer* de pintura é definido no retângulo lógico do *lineart*; a projeção acontece na exibição, nunca no armazenamento.
- **Prova:** `TA-5`, §28.1 casos 1, 2, 3 — **Gate:** `G-CVS-1`
- **Conclusão:** pintar, girar e voltar mantém a tinta **exatamente** sobre as mesmas regiões do desenho.
- **Risco · decisão:** **`RG-1` (impacto máximo)** · `SD-8` — **Auto:** parcial · **Física futura:** **sim** (§28 #6, #7) · **Commit:** `C-A9` · **Rollback:** reverter `C-A9`.

#### `TK-A-036` · Reamostragem determinística do *raster* na mudança de janela
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** eliminar deriva de píxel em rotações repetidas.
- **Arquivos:** `src/components/ColoringCanvas.js` — **Símbolos/contratos:** reamostragem a partir do **modelo lógico**, nunca do *buffer* de tela anterior.
- **Precondições:** `TK-A-035` — **Depende de:** `TK-A-035`
- **Mudança esperada:** cada reprojeção parte do estado lógico canônico; **nenhuma** cadeia de reamostragens sucessivas acumula erro.
- **Prova:** §28.1 caso 5 (rotação repetida) — **Gate:** `G-CVS-1`
- **Conclusão:** dez rotações consecutivas não degradam a pintura de forma perceptível.
- **Risco · decisão:** **`RG-1`** · `RG-3` (desempenho) — **Auto:** parcial · **Física futura:** **sim** (§28.1 caso 5) · **Commit:** `C-A9` · **Rollback:** reverter `C-A9`.

#### `TK-A-037` · Custo de reprojeção dentro do orçamento de interação
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** a defesa da obra não pode custar fluidez.
- **Arquivos:** `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js` — **Símbolos/contratos:** caminho de reprojeção; medição **antes** de qualquer otimização (regra de performance do `CLAUDE.md`).
- **Precondições:** `TK-A-034`, `TK-A-036` — **Depende de:** `TK-A-034`, `TK-A-036`
- **Mudança esperada:** medir; otimizar **apenas** se houver ganho demonstrado. **Memoização preventiva é proibida.**
- **Prova:** §28 #6, #7 com observação de fluidez — **Gate:** —
- **Conclusão:** rotação com obra complexa não produz travamento perceptível em aparelho real.
- **Risco · decisão:** **`RG-3`** · regra de performance do projeto — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-A8`/`C-A9` · **Rollback:** reverter o *commit* do motor afetado.

#### `TK-A-038` · Portões `G-CVS-1` e `G-CVS-2` em `scripts/smoke.js`
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** lacrar espaço lógico e ausência de perda silenciosa.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `check`, `codeOf`.
- **Precondições:** `TK-A-034`, `TK-A-035` — **Depende de:** `TK-A-034`, `TK-A-035`
- **Mudança esperada:** asserção de que os dois motores exportam dimensão lógica e de que nenhum caminho de carga descarta obra sem registro.
- **Prova:** `MT-4`, `MT-5` — **Gate:** `G-CVS-1`, `G-CVS-2`
- **Conclusão:** portões verdes no estado correto; vermelhos sob `MT-4`/`MT-5`.
- **Risco · decisão:** `RG-1` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A12` · **Rollback:** reverter `C-A12`.

#### `TK-A-039` · Mutante `MT-4` — motor volta a guardar coordenadas em píxel de tela
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CVS-1` detecta o retrocesso mais perigoso.
- **Arquivos:** mutação temporária em `src/components/AtelierCanvas.js` (**nunca commitada**) — **Símbolos/contratos:** `exportState`.
- **Precondições:** `TK-A-038` — **Depende de:** `TK-A-038`
- **Mudança esperada:** **defeito deliberado** — coordenadas voltam a ser de tela. Esperado: `G-CVS-1` **vermelho** e `TA-5` falhando.
- **Prova:** portão vermelho — **Gate:** `G-CVS-1` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, `git status` limpo, registro anexado.
- **Risco · decisão:** `RG-1` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-040` · Mutante `MT-5` — carga incompatível volta a abrir como tela branca em silêncio
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CVS-2` protege a quarta invariante ZERO.
- **Arquivos:** mutação temporária em `src/components/ColoringCanvas.js` (**nunca commitada**) — **Símbolos/contratos:** `loadPaint`, `LOAD_PAINT_INCOMPATIBLE`.
- **Precondições:** `TK-A-038` — **Depende de:** `TK-A-038`
- **Mudança esperada:** **defeito deliberado** — o caminho incompatível volta a cair em canvas branco silencioso. Esperado: `G-CVS-2` **vermelho**.
- **Prova:** portão vermelho — **Gate:** `G-CVS-2` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
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
- **Prova:** `CN-8`; `G-VER-2` — **Gate:** `G-CMP-2`, `G-VER-2`
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
- **Prova:** §28.1 caso 15; validação visual — **Gate:** `G-CVS-2`, `G-CMP-1`
- **Conclusão:** captura mostra o estado explícito; o arquivo continua no disco.
- **Risco · decisão:** **`RG-1`** · **invariante ZERO #4** · linguagem infantil (Princípio I) — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-A10` · **Rollback:** reverter `C-A10`.

#### `TK-A-046` · Arnês de compatibilidade `TA-12` — corpus de payloads legados
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** exercitar o leitor contra todas as formas conhecidas, sem depender de aparelho.
- **Arquivos:** `scripts/testing/artworkVersionHarness.js` (estendido por `TK-A-006`) — **Símbolos/contratos:** `TA-12`; corpus sintético cobrindo `fmt:1`, `fmt:2`, `v:2`, `ops[]`, ausência de eixos, payload truncado.
- **Precondições:** `TK-A-041`..`TK-A-045` — **Depende de:** `TK-A-045`
- **Mudança esperada:** corpus versionado no arnês; cada entrada declara o ramo esperado.
- **Prova:** ele mesmo — **Gate:** `G-CMP-1`
- **Conclusão:** arnês sai com código `0` e cobre cada forma legada listada em §28.1.
- **Risco · decisão:** `RG-12` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A10` · **Rollback:** reverter `C-A10`.

#### `TK-A-047` · Mutante `MT-13` — leitor volta a converter e regravar ao abrir
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CMP-2` impede a migração silenciosa.
- **Arquivos:** mutação temporária no caminho de abertura (**nunca commitada**) — **Símbolos/contratos:** `loadPaint` + escrita.
- **Precondições:** `TK-A-046` — **Depende de:** `TK-A-046`
- **Mudança esperada:** **defeito deliberado** — abrir passa a regravar em formato novo. Esperado: `G-CMP-2` **vermelho** e `TA-12` falhando.
- **Prova:** portão vermelho — **Gate:** `G-CMP-2` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `RG-1` · `Q8` r.1–2 — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

### 3.6 *Write-forward* e proteção do *lineart* (`Q8`, regras 7–10)

#### `TK-A-048` · Gravação em formato novo é **write-forward** isolado
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** só grava quem a criança mandou gravar, e o formato antigo nunca é destruído.
- **Arquivos:** `src/components/ColoringCanvas.js` (`exportPaint`), `src/components/AtelierCanvas.js` (`exportState`), `src/services/drawingStorage.js` (**apenas como consumidor existente**) — **Símbolos/contratos:** `paintSchemaVersion`, `layoutVersion`, `v: 2` congelado.
- **Precondições:** `TK-A-003`, `TK-A-042` — **Depende de:** `TK-A-003`, `TK-A-042`
- **Mudança esperada:** a gravação nova acontece **somente** por ação deliberada de salvar; o registro anterior não é sobrescrito no lugar como efeito colateral da leitura.
- **Prova:** `TA-13`; §28.1 casos 11, 12, 13 — **Gate:** `G-CMP-3`
- **Conclusão:** abrir obra legada, pintar e salvar produz registro novo **sem destruir** o anterior.
- **Risco · decisão:** **`RG-1` (impacto máximo)** · `Q8` r.7 · **invariante ZERO #3** — **Auto:** sim · **Física futura:** **sim** (§28.1 casos 12, 13) · **Commit:** `C-A11` · **Rollback:** reverter `C-A11`; nada previamente gravado é afetado.

#### `TK-A-049` · Releitura de validação **antes** da promoção
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** nunca promover um registro que não se prova legível.
- **Arquivos:** `src/services/drawingStorage.js` (**consumidor**), `src/components/ColoringCanvas.js`, `src/components/AtelierCanvas.js` — ⚠️ **INCERTEZA LOCALIZADA** quanto ao ponto exato de promoção no fluxo de gravação atual — **Símbolos/contratos:** gravar → **reler** → validar → **só então** promover.
- **Precondições:** `TK-A-048` — **Depende de:** `TK-A-048`
- **Mudança esperada:** a promoção do registro novo é condicionada a uma releitura bem-sucedida e validada; falha na releitura ⇒ **o antigo permanece vigente**.
- **Prova:** `TA-13` — **Gate:** `G-CMP-3`
- **Conclusão:** simular falha de releitura no arnês mantém o registro antigo como vigente.
- **Risco · decisão:** **`RG-1`** · `Q8` r.8 — **Auto:** sim · **Física futura:** **sim** (§28.1 caso 13) · **Commit:** `C-A11` · **Rollback:** reverter `C-A11`.

#### `TK-A-050` · Rollback determinístico de gravação interrompida
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** interrupção (fechar o app, bateria, término de processo) nunca deixa obra meio gravada vigente.
- **Arquivos:** `src/services/drawingStorage.js` (**consumidor**), `src/services/fileBlobStore.js` (**verificação**) — **Símbolos/contratos:** gravação em destino temporário + promoção atômica.
- **Precondições:** `TK-A-049` — **Depende de:** `TK-A-049`
- **Mudança esperada:** o caminho de gravação nova é reversível de forma determinística; um registro parcialmente escrito **nunca** é o vigente.
- **Prova:** `TA-13`; §28.1 caso 13 — **Gate:** `G-CMP-3`
- **Conclusão:** interromper a gravação no arnês deixa exatamente o registro anterior vigente.
- **Risco · decisão:** **`RG-1`** · `Q8` r.9 — **Auto:** sim · **Física futura:** **sim** (§28.1 caso 13) · **Commit:** `C-A11` · **Rollback:** reverter `C-A11`.

#### `TK-A-051` · Proteção dos ***linearts*** históricos — identidade estável do desenho
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** garantir a segunda invariante ZERO — a tinta **nunca** é associada ao *lineart* errado.
- **Arquivos:** `src/components/ColoringCanvas.js`, `src/screens/ColoringScreen.js`, `src/services/drawingStorage.js` (**verificação da chave**) — **Símbolos/contratos:** identificador do *lineart* gravado junto do payload; `imgX/imgY/imgW/imgH`.
- **Precondições:** `TK-A-035`, `TK-A-048` — **Depende de:** `TK-A-035`, `TK-A-048`
- **Mudança esperada:** o payload carrega e verifica a identidade do *lineart* na abertura; divergência ⇒ ramo explícito de incompatibilidade, **nunca** exibição de tinta sobre desenho errado.
- **Prova:** `TA-12`; §28.1 caso 10 — **Gate:** `G-CMP-4`
- **Conclusão:** associar propositalmente payload a outro *lineart* no arnês produz recusa explícita.
- **Risco · decisão:** **`RG-1`** · `Q8` r.10 · **invariante ZERO #2** · **área protegida:** `assets` **não** são tocados — **Auto:** sim · **Física futura:** **sim** (§28.1 caso 10) · **Commit:** `C-A11` · **Rollback:** reverter `C-A11`.

#### `TK-A-052` · *Lineart* histórico **não é reprocessado, redimensionado nem substituído**
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** a compatibilidade não pode alterar o acervo.
- **Arquivos:** `assets/` (**somente verificação — proibido alterar**) — **Símbolos/contratos:** manifestos de cenas; `git diff` vazio em `assets/`.
- **Precondições:** `TK-A-051` — **Depende de:** `TK-A-051`
- **Mudança esperada:** **nenhuma** — asserção de ausência de alteração em `assets/`, conforme área protegida do `AGENTS.md`.
- **Prova:** `git diff --name-only` sem nenhum caminho em `assets/` — **Gate:** `G-CMP-4`
- **Conclusão:** nenhum *asset* aparece em nenhum *commit* de `F6-R3`.
- **Risco · decisão:** **área protegida (`assets`)** · `Q8` r.10 — **Auto:** sim · **Física futura:** não · **Commit:** nenhum (verificação) · **Rollback:** não aplicável.

#### `TK-A-053` · Arnês `TA-13` — *write-forward*, releitura e rollback
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar as regras 7–9 de `Q8` sem aparelho.
- **Arquivos:** `scripts/testing/artworkVersionHarness.js` (estendido) — **Símbolos/contratos:** `TA-13`.
- **Precondições:** `TK-A-050` — **Depende de:** `TK-A-050`
- **Mudança esperada:** cenários de gravação bem-sucedida, releitura falha e interrupção, cada um com o vigente esperado declarado.
- **Prova:** ele mesmo — **Gate:** `G-CMP-3`
- **Conclusão:** arnês sai com código `0`; cada cenário termina com o registro vigente correto.
- **Risco · decisão:** `RG-12` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A11` · **Rollback:** reverter `C-A11`.

#### `TK-A-054` · Mutante `MT-14` — promoção **sem** releitura de validação
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CMP-3` protege a promoção.
- **Arquivos:** mutação temporária no caminho de gravação (**nunca commitada**) — **Símbolos/contratos:** promoção direta.
- **Precondições:** `TK-A-053` — **Depende de:** `TK-A-053`
- **Mudança esperada:** **defeito deliberado** — promover sem reler. Esperado: `G-CMP-3` **vermelho**, `TA-13` falhando.
- **Prova:** portão vermelho — **Gate:** `G-CMP-3` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `RG-1` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-055` · Mutante `MT-15` — payload aceito sem verificar a identidade do *lineart*
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** provar que `G-CMP-4` protege a invariante ZERO #2.
- **Arquivos:** mutação temporária em `src/components/ColoringCanvas.js` (**nunca commitada**) — **Símbolos/contratos:** verificação de identidade removida.
- **Precondições:** `TK-A-053` — **Depende de:** `TK-A-053`
- **Mudança esperada:** **defeito deliberado** — aceitar qualquer payload. Esperado: `G-CMP-4` **vermelho**.
- **Prova:** portão vermelho — **Gate:** `G-CMP-4` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `RG-1` · **invariante ZERO #2** — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-A-056` · Portão `G-CMP-5` — nenhuma escrita nova fora do caminho *write-forward*
- **Pacote · Subportão:** `F6-R3.5` · `F6-SG-A` — **Objetivo:** lacrar a superfície de escrita.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `check`, `codeOf`; inventário de chamadas de escrita nos dois motores.
- **Precondições:** `TK-A-048`..`TK-A-052` — **Depende de:** `TK-A-052`
- **Mudança esperada:** asserção de que a escrita de obra ocorre por **um** caminho e de que abrir não escreve.
- **Prova:** `MT-13` — **Gate:** `G-CMP-5`
- **Conclusão:** `npm run smoke` verde; vermelho sob `MT-13`.
- **Risco · decisão:** `RG-1` — **Auto:** sim · **Física futura:** não · **Commit:** `C-A12` · **Rollback:** reverter `C-A12`.

### 3.7 Fronteira documental de `F6-R3.6`

#### `TK-A-057` · `F6-R3.6` — só a porção de `P-164` que a Fase 6 autoriza
- **Pacote · Subportão:** `F6-R3.6` · `F6-SG-A` — **Objetivo:** impedir que a instrumentação vire investigação aberta de `P-164`.
- **Arquivos:** artefatos documentais da Fase 6 (**nenhum arquivo de *runtime***) — **Símbolos/contratos:** fronteira `F6-R3.6`; `FD-12`.
- **Precondições:** `TK-A-014` — **Depende de:** `TK-A-014`
- **Mudança esperada:** registro explícito de que `P-164` **permanece aberta** e **não é rebaixada** pela Fase 6; a Fase 6 entrega **defesa + instrumentação**, não diagnóstico fechado.
- **Prova:** revisão documental — **Gate:** —
- **Conclusão:** nenhum artefato afirma que `P-164` foi resolvida; `P-152` e `P-164` continuam registradas.
- **Risco · decisão:** `RG-8` · `FD-12` · decisão do fundador (`P-152`/`P-164` não são apagadas nem rebaixadas) — **Auto:** não · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** reverter `C-GOV1`.

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
- **Arquivos:** `scripts/smoke.js`; `git diff` do pacote — **Símbolos/contratos:** `CN-2` (abertura idêntica), `CN-4` (sessão sobrevive), `CN-6` (sem remontagem), `CN-8` (sem migração em massa).
- **Precondições:** `TK-A-059` — **Depende de:** `TK-A-020`, `TK-A-028`, `TK-A-022`, `TK-A-043`
- **Mudança esperada:** nenhuma; produção de evidência de **não-regressão**.
- **Prova:** os próprios controles — **Gate:** — (controles negativos)
- **Conclusão:** os quatro controles passam com evidência anexada.
- **Risco · decisão:** `RG-5` — **Auto:** parcial · **Física futura:** **sim** (`CN-2`, `CN-4`, `CN-6`) · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-A-061` · Executar e registrar os **mutantes** de `F6-SG-A`
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** provar que cada portão de `R3` tem dentes.
- **Arquivos:** mutações temporárias (**nenhuma commitada**) — **Símbolos/contratos:** `MT-1`, `MT-4`, `MT-5`, `MT-12`, `MT-13`, `MT-14`, `MT-15`.
- **Precondições:** `TK-A-060` — **Depende de:** `TK-A-008`, `TK-A-021`, `TK-A-039`, `TK-A-040`, `TK-A-047`, `TK-A-054`, `TK-A-055`
- **Mudança esperada:** cada mutante é injetado, o portão correspondente é observado **vermelho**, o mutante é revertido e `git status` volta a limpo.
- **Prova:** tabela mutante → portão vermelho — **Gate:** os sete portões correspondentes
- **Conclusão:** sete mutantes, sete falhas observadas, sete reversões, árvore limpa ao fim.
- **Risco · decisão:** **`RG-13`** (portão sem dentes) — **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` (só o registro) · **Rollback:** `git checkout --` por mutante.

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

**Campos comuns a `TK-A-063`..`TK-A-079`:** *Pacote · Subportão:* `F6-R3.5` · `F6-SG-A` — *Precondições:* pacote `F6-R3` implementado e `TK-A-062` concluída — *Gate:* `G-CVS-1`, `G-CVS-2`, `G-CMP-1`..`G-CMP-5` conforme o caso — *Validação automatizada:* parcial (arnês cobre a lógica; o aparelho cobre a percepção) — *Validação física futura:* **sim** — *Commit:* `C-GOV1` (evidência; correções voltam ao *commit* do motor afetado) — *Rollback:* reverter o *commit* do motor afetado.

#### `TK-A-063` · **Caso 1** — obra nova, criada e reaberta na mesma janela
- **Objetivo:** linha de base do formato novo. **Arquivos:** `ColoringCanvas.js`, `AtelierCanvas.js`. **Depende de:** `TK-A-062`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TA-5`, `TA-12` + aparelho.
- **Conclusão:** obra reabre **idêntica**, píxel a píxel na percepção; nenhuma invariante violada. **Risco:** `RG-1`.

#### `TK-A-064` · **Caso 2** — obra nova, criada em *portrait* e reaberta em *landscape*
- **Objetivo:** provar a projeção entre orientações. **Arquivos:** `useViewportProjection.js`, os dois motores. **Depende de:** `TK-A-063`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TA-4` + §28 #6/#7.
- **Conclusão:** a obra aparece inteira, sem corte, sem distorção e sem deslocamento da tinta. **Risco:** `RG-1`.

#### `TK-A-065` · **Caso 3** — obra nova em janela estreita, reaberta em janela larga
- **Objetivo:** provar `letterbox` no eixo oposto. **Arquivos:** `useViewportProjection.js`. **Depende de:** `TK-A-063`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TA-4`.
- **Conclusão:** a sobra é moldura inerte; nenhum traço aparece ou some. **Risco:** `RG-1`.

#### `TK-A-066` · **Caso 4** — obra do Ateliê (vetor) atravessando mudança de janela
- **Objetivo:** provar o espaço lógico vetorial. **Arquivos:** `AtelierCanvas.js`. **Depende de:** `TK-A-063`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TA-5`, §28 #7/#8.
- **Conclusão:** traços e carimbos mantêm posição relativa e proporção. **Risco:** `RG-1`.

#### `TK-A-067` · **Caso 5** — rotação repetida (dez ciclos) sem deriva acumulada
- **Objetivo:** provar a reamostragem determinística. **Arquivos:** `ColoringCanvas.js`. **Depende de:** `TK-A-066`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TK-A-036` + captura no ciclo 1 e no ciclo 10.
- **Conclusão:** nenhuma degradação perceptível entre o primeiro e o décimo ciclo. **Risco:** `RG-1`, `RG-3`.

#### `TK-A-068` · **Caso 6** — traço em andamento no instante da mudança de janela
- **Objetivo:** provar o comite atômico de gesto. **Arquivos:** os dois motores. **Depende de:** `TK-A-016`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** §28 #3/#6.
- **Conclusão:** o traço é preservado inteiro **ou** não existe; nunca meio aplicado. **Risco:** `RG-1`.

#### `TK-A-069` · **Caso 7** — ida ao segundo plano com obra não salva, e retorno
- **Objetivo:** provar `useSurfaceLifecycle` no caminho mais sensível. **Arquivos:** `ColoringScreen.js`, `AtelierCanvasScreen.js`. **Depende de:** `TK-A-011`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** §28 #4/#8.
- **Conclusão:** ao retornar, a obra em edição está intacta. **Risco:** `RG-1`, `RG-8`.

#### `TK-A-070` · **Caso 8** — Centro de Controle / notificação sobre o canvas
- **Objetivo:** cobrir a interrupção parcial, distinta do segundo plano pleno. **Arquivos:** `ColoringScreen.js`, `AtelierCanvasScreen.js`. **Depende de:** `TK-A-069`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** §28 #5.
- **Conclusão:** nenhum recarregamento silencioso; obra intacta. **Risco:** `RG-8`.

#### `TK-A-071` · **Caso 9** — término do processo de conteúdo do WebView
- **Objetivo:** observar a defesa instrumentada **sem** declarar causa provada (`FD-12`). **Arquivos:** `ColoringCanvas.js`, `AtelierCanvas.js`. **Depende de:** `TK-A-014`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** registro do evento, se ele ocorrer.
- **Conclusão:** ou o evento é capturado e tratado sem perda, ou o sintoma **não é reproduzido** — e o relatório diz exatamente isso, nunca "causa confirmada". **Risco:** **`RG-8`**, `P-164`.

#### `TK-A-072` · **Caso 10** — payload associado a *lineart* divergente
- **Objetivo:** provar a invariante ZERO #2. **Arquivos:** `ColoringCanvas.js`. **Depende de:** `TK-A-051`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TA-12` + aparelho.
- **Conclusão:** recusa explícita; **jamais** tinta exibida sobre desenho errado. **Risco:** `RG-1`.

#### `TK-A-073` · **Caso 11** — obra legada aberta e fechada **sem** edição
- **Objetivo:** provar leitura pura (`Q8` r.1). **Arquivos:** `ColoringScreen.js`, `AtelierCanvasScreen.js`. **Depende de:** `TK-A-042`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** registro **byte-idêntico** antes/depois.
- **Conclusão:** nenhuma escrita ocorreu. **Risco:** `RG-1`, **invariante ZERO #3**.

#### `TK-A-074` · **Caso 12** — obra legada aberta, editada e salva (*write-forward*)
- **Objetivo:** provar `Q8` r.7. **Arquivos:** os dois motores + `drawingStorage.js` (consumidor). **Depende de:** `TK-A-048`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TA-13` + inspeção de armazenamento.
- **Conclusão:** registro novo criado; **o anterior não foi destruído**. **Risco:** `RG-1`.

#### `TK-A-075` · **Caso 13** — gravação interrompida no meio
- **Objetivo:** provar releitura + rollback (`Q8` r.8–9). **Arquivos:** caminho de gravação. **Depende de:** `TK-A-050`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TA-13`.
- **Conclusão:** o vigente ao fim é **exatamente** o registro anterior íntegro. **Risco:** `RG-1`, **invariante ZERO #3**.

#### `TK-A-076` · **Caso 14** — payload legado de formato conhecido porém antigo
- **Objetivo:** provar a classificação determinística. **Arquivos:** `loadPaint`, `loadState`. **Depende de:** `TK-A-041`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TA-12`.
- **Conclusão:** abre corretamente pelo ramo legado, sem conversão. **Risco:** `RG-12`.

#### `TK-A-077` · **Caso 15** — payload corrompido ou truncado
- **Objetivo:** provar a invariante ZERO #4 e a preservação do registro. **Arquivos:** `loadPaint`, `ColoringScreen.js`. **Depende de:** `TK-A-045`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TA-12` + captura do estado explícito.
- **Conclusão:** estado explícito exibido; arquivo preservado; **nenhum canvas branco silencioso**. **Risco:** `RG-1`.

#### `TK-A-078` · **Caso 16** — galeria com acervo misto (legado + novo) após atualização do app
- **Objetivo:** provar a ausência de migração em massa. **Arquivos:** `AtelierGalleryScreen.js` (**verificação**), `storageMigrationService.js` (**intocado**). **Depende de:** `TK-A-043`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** inventário antes/depois de abrir a galeria.
- **Conclusão:** abrir a galeria **não** converte nada; miniaturas de ambos os formatos aparecem. **Risco:** `RG-1`, **invariante ZERO #3**.

#### `TK-A-079` · **Caso 17** — obra salva no formato novo, lida por caminho que espera o envelope antigo
- **Objetivo:** provar que a correção de nomenclatura eliminou a colisão de `v:3` (§11.5.2). **Arquivos:** `src/screens/ColoringScreen.js:224`, `drawingStorage.js` (`isDrawingPointer`). **Depende de:** `TK-A-003`.
- **Mudança esperada:** nenhuma — verificação. **Prova:** `TA-11` + aparelho.
- **Conclusão:** a guarda **aceita** o payload novo e continua **rejeitando** ponteiro; nada é descartado em silêncio. **Risco:** **`RG-11`**.

#### `TK-A-080` · Consolidar a matriz dos 17 casos com veredito `PASS`/`FAIL` por caso
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** produzir a evidência única que o fundador lê para decidir sobre `F6-SG-A`.
- **Arquivos:** artefato de evidência da Fase 6 (documental) — **Símbolos/contratos:** §28.1; quatro invariantes ZERO.
- **Precondições:** `TK-A-063`..`TK-A-079` — **Depende de:** `TK-A-079`
- **Mudança esperada:** tabela com 17 linhas, cada uma com veredito, aparelho, janela, captura e invariantes verificadas.
- **Prova:** a própria tabela — **Gate:** `G-CMP-1`..`G-CMP-5`
- **Conclusão:** **17 de 17 `PASS`.** Um único `FAIL` **impede** a apresentação de `F6-SG-A`.
- **Risco · decisão:** **`RG-1`** · `SD-8` bloqueador absoluto — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

### 4.3 Instrumentação, validação física futura e relatório

#### `TK-A-081` · Preparar a campanha física de `F6-SG-A` (roteiros #1–#13 de §28)
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** deixar a campanha executável sem reinterpretação.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** §28 roteiros #1–#13; aparelhos disponíveis.
- **Precondições:** `TK-A-080` — **Depende de:** `TK-A-080`
- **Mudança esperada:** roteiro por aparelho, por janela e por superfície, com captura obrigatória em cada passo.
- **Prova:** o próprio roteiro — **Gate:** —
- **Conclusão:** cada roteiro tem passo, expectativa e evidência definidos antes da execução.
- **Risco · decisão:** `RG-10` (evidência insuficiente) — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-A-082` · Registrar o vão conhecido de tablet Android (`P8`, §33)
- **Pacote · Subportão:** — · `F6-SG-A` — **Objetivo:** declarar honestamente o que **não** foi validado.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** `P8`; §33 rotas (i)/(ii).
- **Precondições:** `TK-A-081` — **Depende de:** `TK-A-081`
- **Mudança esperada:** o vão é nomeado; **este artefato não escolhe** a rota condicional de §33 — a escolha é do fundador.
- **Prova:** revisão documental — **Gate:** —
- **Conclusão:** nenhum relatório declara cobertura Android que não existe.
- **Risco · decisão:** `RG-10` · `P8` — **Auto:** não · **Física futura:** — · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

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
- **Pacote · Subportão:** `F6-R2.2` · `F6-SG-B` — **Objetivo:** consequência de projeto da trava de §41.4 — o que é mensurável é **medido**, não compensado por constante.
- **Arquivos:** `src/services/mapAnchor.js` — **Símbolos/contratos:** `computeCameraTarget`; `viewport` = espaço **livre** já descontado de cabeçalho, aba e barra.
- **Precondições:** `TK-B-002`, `TK-B-004` — **Depende de:** `TK-B-002`, `TK-B-004`
- **Mudança esperada:** a função **não** recebe nem inventa número de compensação; recebe a *viewport* livre medida pelo chamador e aplica `MAP_ANCHOR_FRAMING`.
- **Prova:** `TA-2` — **Gate:** **`G-MAP-4`**
- **Conclusão:** a assinatura torna impossível passar "altura de barra" como parâmetro de ajuste.
- **Risco · decisão:** decisão do fundador (§41.4) · `RG-5` — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B1` · **Rollback:** reverter `C-B1`.

#### `TK-B-006` · `resolveActiveRegion(scrollY, regionLayout, probeOffset)`
- **Pacote · Subportão:** `F6-R2.4` · `F6-SG-B` — **Objetivo:** unificar a sonda de região ativa hoje embutida em `AdventureMapScreen.js:403`.
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
- **Arquivos:** `src/components/MapRegion.js` — ⚠️ **INCERTEZA LOCALIZADA** quanto ao nome exato do componente de região citado pela auditoria — **Símbolos/contratos:** posicionamento do pino.
- **Precondições:** `TK-B-008` — **Depende de:** `TK-B-008`
- **Mudança esperada:** o cálculo local desaparece; o pino usa a âncora única.
- **Prova:** `TA-1` + captura comparativa — **Gate:** `G-MAP-1`
- **Conclusão:** o pino cai exatamente na posição de referência nas três faixas.
- **Risco · decisão:** `SD-5` — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B3` · **Rollback:** reverter `C-B3`.

#### `TK-B-010` · Alvo de toque passa a derivar da **mesma** âncora
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** o dedo da criança e o olho da criança concordam.
- **Arquivos:** `src/components/MapRegion.js` — **Símbolos/contratos:** área tocável da história.
- **Precondições:** `TK-B-009` — **Depende de:** `TK-B-009`
- **Mudança esperada:** o retângulo de toque deriva da âncora única, não de um cálculo próprio.
- **Prova:** `TA-1` + teste de toque em aparelho — **Gate:** `G-MAP-1`
- **Conclusão:** tocar no pino abre a história; não há deslocamento entre alvo e desenho. **`SD-5`.**
- **Risco · decisão:** `SD-5` — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B3` · **Rollback:** reverter `C-B3`.

#### `TK-B-011` · Brilho/destaque da história passa a derivar da **mesma** âncora
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** terceira derivação eliminada.
- **Arquivos:** `src/components/MapRegion.js` — **Símbolos/contratos:** efeito de destaque.
- **Precondições:** `TK-B-010` — **Depende de:** `TK-B-010`
- **Mudança esperada:** o brilho passa a usar a âncora única.
- **Prova:** captura comparativa — **Gate:** `G-MAP-1`
- **Conclusão:** brilho concêntrico ao pino nas três faixas. **`SD-5`.**
- **Risco · decisão:** `SD-5` — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-B3` · **Rollback:** reverter `C-B3`.

#### `TK-B-012` · Câmera inicial (`initialOffsetY`) passa a consumir `computeCameraTarget`
- **Pacote · Subportão:** `F6-R2.2` · `F6-SG-B` — **Objetivo:** quarta derivação eliminada e fim do fator `0.58` em `:310`.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `initialOffsetY` (`:295-311`), fator `0.58` (`:310`).
- **Precondições:** `TK-B-011` — **Depende de:** `TK-B-011`
- **Mudança esperada:** o cálculo local some; a abertura passa pela função única, com a *viewport* livre **medida**.
- **Prova:** `TA-2`, `CN-2` — **Gate:** `G-MAP-3`
- **Conclusão:** a abertura na faixa compacta permanece equivalente; no tablet, a mira passa a acertar. **`SD-6`.**
- **Risco · decisão:** **`RG-5`** · `SD-6` — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B4` · **Rollback:** reverter `C-B4`.

#### `TK-B-013` · Eliminar a compensação fantasma de barra inferior de 56pt
- **Pacote · Subportão:** `F6-R2.2` · `F6-SG-B` — **Objetivo:** remover uma compensação que já não corresponde a elemento real na composição lateral.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** constante de 56pt em `initialOffsetY` (`:299`).
- **Precondições:** `TK-B-012` — **Depende de:** `TK-B-012`
- **Mudança esperada:** a compensação fantasma desaparece; o espaço ocupado por navegação passa a ser **medido** e descontado antes de chamar `computeCameraTarget`.
- **Prova:** `TA-2` + §28 #12 — **Gate:** **`G-MAP-4`**
- **Conclusão:** nenhum número de compensação de barra sobrevive no cálculo de câmera.
- **Risco · decisão:** §41.4 (o mensurável é medido) — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-B4` · **Rollback:** reverter `C-B4`.

#### `TK-B-014` · `onContentSize` passa a consumir `computeCameraTarget`
- **Pacote · Subportão:** `F6-R2.2` · `F6-SG-B` — **Objetivo:** o segundo momento de posicionamento usa a mesma função do primeiro.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `onContentSize`, fator `0.58` (`:385`).
- **Precondições:** `TK-B-013` — **Depende de:** `TK-B-013`
- **Mudança esperada:** o segundo `0.58` desaparece; a chegada do `contentSize` recalcula pela função única.
- **Prova:** `TA-2` — **Gate:** `G-MAP-3`
- **Conclusão:** abertura e chegada de conteúdo produzem a **mesma** mira.
- **Risco · decisão:** `RG-5` — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-B5` · **Rollback:** reverter `C-B5`.

#### `TK-B-015` · `scrollPinIntoView` passa a consumir `computeCameraTarget`
- **Pacote · Subportão:** `F6-R2.3` · `F6-SG-B` — **Objetivo:** quinta derivação eliminada e fim do fator `0.5`.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `scrollPinIntoView`, fator `0.5` (`:436`).
- **Precondições:** `TK-B-014` — **Depende de:** `TK-B-014`
- **Mudança esperada:** o `0.5` desaparece; trazer o pino para a vista usa a mesma mira da abertura.
- **Prova:** `TA-2`, `MT-2` — **Gate:** `G-MAP-3`
- **Conclusão:** "Ver mapa" e a abertura enquadram a história **na mesma posição**.
- **Risco · decisão:** `SD-5` · `SD-6` — **Auto:** sim · **Física futura:** **sim** (§28 #12) · **Commit:** `C-B6` · **Rollback:** reverter `C-B6`.

#### `TK-B-016` · Remover o comentário falso de `:424-426`
- **Pacote · Subportão:** `F6-R2.3` · `F6-SG-B` — **Objetivo:** eliminar documentação de código que descreve comportamento inexistente.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** comentário que afirma alinhamento inexistente entre `0.5` e `0.58`.
- **Precondições:** `TK-B-015` — **Depende de:** `TK-B-015`
- **Mudança esperada:** o comentário some junto com a duplicação que ele descrevia erroneamente; nenhum comentário novo afirma equivalência não verificada.
- **Prova:** revisão — **Gate:** `G-MAP-3`
- **Conclusão:** nenhum comentário do mapa descreve um contrato que o código não cumpre.
- **Risco · decisão:** Princípio de rastreabilidade — **Auto:** sim · **Física futura:** não · **Commit:** `C-B6` · **Rollback:** reverter `C-B6`.

#### `TK-B-017` · A duplicação `0.58` × `0.5` **morre** — asserção de ausência
- **Pacote · Subportão:** `F6-R2.3` · `F6-SG-B` — **Objetivo:** cumprir a decisão do fundador — "a duplicação atual não pode sobreviver".
- **Arquivos:** `scripts/smoke.js`, `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `codeOf` (asserção que ignora comentários).
- **Precondições:** `TK-B-016` — **Depende de:** `TK-B-016`
- **Mudança esperada:** asserção de que nenhum fator de enquadramento literal sobrevive no arquivo do mapa.
- **Prova:** `MT-2` — **Gate:** **`G-MAP-3`**
- **Conclusão:** `npm run smoke` verde; vermelho se qualquer fator literal voltar.
- **Risco · decisão:** decisão do fundador — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** reverter `C-B7`.

#### `TK-B-018` · Sonda de região ativa passa a consumir `resolveActiveRegion`
- **Pacote · Subportão:** `F6-R2.4` · `F6-SG-B` — **Objetivo:** a região ativa deixa de ter aritmética própria na tela.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** sonda de `:403`, `activeIdx`.
- **Precondições:** `TK-B-017` — **Depende de:** `TK-B-017`
- **Mudança esperada:** a tela chama o módulo; o comportamento observável permanece o mesmo.
- **Prova:** `TA-3` — **Gate:** `G-MAP-1`
- **Conclusão:** a região ativa acompanha o *scroll* exatamente como hoje, agora por caminho único.
- **Risco · decisão:** `RG-5` — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-B6` · **Rollback:** reverter `C-B6`.

#### `TK-B-019` · Holofote do tour sobre o mapa usa a **mesma** âncora
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** fechar `SD-5` incluindo o guia.
- **Arquivos:** `src/services/guideTargetRegistry.js`, `src/hooks/useGuideTargets.js` — **Símbolos/contratos:** alvo registrado do mapa; **o registro não ganha aritmética de mapa** — ele consome `mapAnchor`.
- **Precondições:** `TK-B-018` — **Depende de:** `TK-B-018`
- **Mudança esperada:** o alvo do tour no mapa deriva da âncora única, mantendo a medição de tela existente.
- **Prova:** §28 #13 (vídeo do tour) — **Gate:** `G-MAP-1`
- **Conclusão:** pino, alvo, brilho, *scroll* e holofote coincidem. **`SD-5` fechado.**
- **Risco · decisão:** `RG-6` · fronteira com **F7** — **Auto:** parcial · **Física futura:** **sim** (§28 #13) · **Commit:** `C-B6` · **Rollback:** reverter `C-B6`.

#### `TK-B-020` · Unificar a assinatura — `getStoryMapCoord` deixa de existir
- **Pacote · Subportão:** `F6-R2.5` · `F6-SG-B` — **Objetivo:** matar o defeito **LATENTE** antes que ele acorde.
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
- **Prova:** asserção estática — **Gate:** `G-MAP-1`
- **Conclusão:** `mapAnchor.js` não importa nada de `F6-R1`; a geometria é utilizável sem o pacote adaptativo.
- **Risco · decisão:** `OR-3` · §5.1 do PLAN — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** não aplicável.

### 5.3 Portões, mutantes e controles negativos de `F6-R2`

#### `TK-B-022` · Portão `G-MAP-1` — âncora única
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** lacrar a existência de cinco derivações.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `check`, `readSrc`, `codeOf`.
- **Precondições:** `TK-B-021` — **Depende de:** `TK-B-021`
- **Mudança esperada:** asserção de que pino, alvo, brilho e holofote derivam de `mapAnchor`.
- **Prova:** `MT-3` — **Gate:** `G-MAP-1`
- **Conclusão:** verde no estado correto, vermelho sob `MT-3`.
- **Risco · decisão:** `SD-5` — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** reverter `C-B7`.

#### `TK-B-023` · Portão `G-MAP-2` — assinatura única
- **Pacote · Subportão:** `F6-R2.5` · `F6-SG-B` — **Objetivo:** impedir o retorno da divergência de assinatura.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** ausência de `getStoryMapCoord`.
- **Precondições:** `TK-B-020` — **Depende de:** `TK-B-020`
- **Mudança esperada:** asserção de ausência total do símbolo antigo.
- **Prova:** reintrodução temporária deixa o portão vermelho — **Gate:** `G-MAP-2`
- **Conclusão:** verde no estado correto, vermelho sob reintrodução.
- **Risco · decisão:** defeito LATENTE — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** reverter `C-B7`.

#### `TK-B-024` · Portões `G-MAP-3` e `G-MAP-4`
- **Pacote · Subportão:** `F6-R2.2`/`R2.3` · `F6-SG-B` — **Objetivo:** lacrar a morte dos fatores literais **e** a trava de `MAP_ANCHOR_FRAMING`.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** ausência de fator literal de enquadramento no mapa; `computeCameraTarget` sem parâmetro de compensação.
- **Precondições:** `TK-B-017`, `TK-B-013` — **Depende de:** `TK-B-017`
- **Mudança esperada:** duas asserções novas.
- **Prova:** `MT-2` + reintrodução de compensação — **Gate:** `G-MAP-3`, `G-MAP-4`
- **Conclusão:** ambos verdes no estado correto e vermelhos sob reintrodução.
- **Risco · decisão:** §41.4 — **Auto:** sim · **Física futura:** não · **Commit:** `C-B7` · **Rollback:** reverter `C-B7`.

#### `TK-B-025` · Mutante `MT-2` — reintroduzir um segundo fator de enquadramento
- **Pacote · Subportão:** `F6-R2.3` · `F6-SG-B` — **Objetivo:** provar que `G-MAP-3` detecta o retorno da duplicação.
- **Arquivos:** mutação temporária em `src/screens/AdventureMapScreen.js` (**nunca commitada**) — **Símbolos/contratos:** fator literal em `scrollPinIntoView`.
- **Precondições:** `TK-B-024` — **Depende de:** `TK-B-024`
- **Mudança esperada:** **defeito deliberado** — `scrollPinIntoView` volta a usar fator próprio. Esperado: `G-MAP-3` **vermelho** e `TA-2` falhando.
- **Prova:** portão vermelho — **Gate:** `G-MAP-3` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-B-026` · Mutante `MT-3` — pino e alvo de toque voltam a derivar separadamente
- **Pacote · Subportão:** `F6-R2.1` · `F6-SG-B` — **Objetivo:** provar que `G-MAP-1` protege `SD-5`.
- **Arquivos:** mutação temporária no componente de região (**nunca commitada**) — **Símbolos/contratos:** cálculo local do alvo.
- **Precondições:** `TK-B-024` — **Depende de:** `TK-B-024`
- **Mudança esperada:** **defeito deliberado** — alvo de toque com cálculo próprio. Esperado: `G-MAP-1` **vermelho** e `TA-1` falhando.
- **Prova:** portão vermelho — **Gate:** `G-MAP-1` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** `RG-13` · `SD-5` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

#### `TK-B-027` · Controle negativo `CN-1` — o mapa **não** ganha faixa nem arquétipo
- **Pacote · Subportão:** `F6-R2.*` · `F6-SG-B` — **Objetivo:** provar que `F6-R2` não invadiu `F6-R1`.
- **Arquivos:** `git diff` do pacote — **Símbolos/contratos:** `CN-1`.
- **Precondições:** `TK-B-021` — **Depende de:** `TK-B-021`
- **Mudança esperada:** **nenhuma** — evidência de que nenhum arquivo de `F6-R1` foi tocado neste pacote.
- **Prova:** `git diff --name-only` do intervalo de `commits` de `R2` — **Gate:** — (`CN-1`)
- **Conclusão:** o *diff* de `R2` contém apenas mapa, `mapAnchor`, arnês e portões.
- **Risco · decisão:** `OR-3` — **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-028` · Controle negativo `CN-2`/`CN-3` — abertura e desempenho do mapa preservados
- **Pacote · Subportão:** `F6-R2.*` · `F6-SG-B` — **Objetivo:** provar que a correção da geometria não regrediu a experiência atual do telefone.
- **Arquivos:** `src/screens/AdventureMapScreen.js` — **Símbolos/contratos:** `CN-2` (abertura equivalente na faixa compacta), `CN-3` (custo de *scroll* preservado).
- **Precondições:** `TK-B-018` — **Depende de:** `TK-B-018`
- **Mudança esperada:** **nenhuma** — evidência comparativa antes/depois.
- **Prova:** captura de abertura + observação de fluidez — **Gate:** — (`CN-2`, `CN-3`)
- **Conclusão:** abertura indistinguível no telefone; *scroll* sem travamento novo.
- **Risco · decisão:** **`RG-5`**, **`RG-7`** — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

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

#### `TK-B-030` · Executar e registrar os mutantes de `F6-SG-B`
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** provar que os quatro portões do mapa têm dentes.
- **Arquivos:** mutações temporárias (**nenhuma commitada**) — **Símbolos/contratos:** `MT-2`, `MT-3` + reintroduções de `G-MAP-2`/`G-MAP-4`.
- **Precondições:** `TK-B-029` — **Depende de:** `TK-B-025`, `TK-B-026`
- **Mudança esperada:** cada mutante injetado, portão observado vermelho, mutante revertido.
- **Prova:** tabela mutante → portão — **Gate:** `G-MAP-1`..`G-MAP-4`
- **Conclusão:** todas as falhas observadas; `git status` limpo ao fim. — **Risco:** `RG-13` · **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** `git checkout --` por mutante.

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
- **Prova:** capturas + §28 #12 — **Gate:** `G-MAP-3`
- **Conclusão:** a câmera enquadra a história pretendida; **`SD-6` observado**. — **Risco:** `SD-6` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-033` · Validação visual na faixa **expandida** (`>=900dp`)
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** cobrir a terceira faixa normativa.
- **Arquivos:** — (tablet *landscape*) — **Símbolos/contratos:** `breakpoints.tabletL`.
- **Precondições:** `TK-B-032` — **Depende de:** `TK-B-032`
- **Mudança esperada:** nenhuma; capturas.
- **Prova:** capturas + §28 #12 — **Gate:** `G-MAP-3`
- **Conclusão:** enquadramento correto e âncora exposta coerente na faixa expandida. — **Risco:** `SD-6` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-B-034` · Comparação objetiva: pino · alvo de toque · brilho · câmera · âncora exposta
- **Pacote · Subportão:** — · `F6-SG-B` — **Objetivo:** transformar "parece certo" em critério objetivo.
- **Arquivos:** artefato de evidência (documental) — **Símbolos/contratos:** cinco itens × três faixas = 15 observações.
- **Precondições:** `TK-B-033` — **Depende de:** `TK-B-033`
- **Mudança esperada:** tabela 5×3 com posição observada e posição esperada, cada célula com captura.
- **Prova:** a própria tabela — **Gate:** `G-MAP-1`, `G-MAP-3`
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
- **Precondições:** `TK-B-035` — **Depende de:** `TK-B-035`
- **Mudança esperada:** relatório em PT-BR com a distinção correta de estado de arquivo.
- **Prova:** revisão do fundador — **Gate:** todos os de `R2`
- **Conclusão:** relatório entregue; **`F6-SG-B` permanece não concedido** até decisão humana. Sem ele, `OR-2` mantém `F6-R1` bloqueado. — **Risco:** `RG-10` · **Auto:** não · **Física futura:** — · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

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
- **Prova:** `TA-6` — **Gate:** **`G-BP-1`**
- **Conclusão:** o *hook* existe, deriva as três faixas dos *breakpoints* existentes, e ninguém o consome ainda.
- **Risco · decisão:** `SD-11` · `D2` (três faixas) — **Auto:** sim · **Física futura:** não · **Commit:** `C-C1` · **Rollback:** reverter `C-C1`.

#### `TK-C-002` · Portão `G-BP-1` — nenhum *breakpoint* novo, nenhum `Dimensions.get`
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** lacrar duas proibições de `SD-11` de uma vez.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** ausência de `Dimensions.get`; conjunto de *breakpoints* congelado em três.
- **Precondições:** `TK-C-001` — **Depende de:** `TK-C-001`
- **Mudança esperada:** duas asserções; hoje o repositório já tem **zero** `Dimensions.get` — o portão impede a regressão.
- **Prova:** introdução temporária de `Dimensions.get` deixa o portão vermelho — **Gate:** `G-BP-1`
- **Conclusão:** verde no estado atual; vermelho sob introdução de qualquer um dos dois.
- **Risco · decisão:** `SD-11` — **Auto:** sim · **Física futura:** não · **Commit:** `C-C1` · **Rollback:** reverter `C-C1`.

#### `TK-C-003` · Migrar as comparações de largura existentes para `useWindowBand`
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** eliminar a política implícita espalhada, **sem** mudar a política.
- **Arquivos:** os ~34 pontos que hoje leem `useWindowDimensions` — ⚠️ **INCERTEZA LOCALIZADA** quanto ao subconjunto que decide **composição** (alvo) versus o que decide **medida pontual** (fora do alvo); resolver por leitura dirigida na implementação — **Símbolos/contratos:** `breakpoints.phone` (13 consumidores), `breakpoints.tabletL` (`ContentContainer.js:25`).
- **Precondições:** `TK-C-002` — **Depende de:** `TK-C-002`
- **Mudança esperada:** migração **comportamentalmente neutra**: os mesmos limiares, agora lidos de um lugar só. "O que falta é a política, não a medida."
- **Prova:** `TA-6`, `CN-5` — **Gate:** `G-RSP-1`
- **Conclusão:** o comportamento na faixa compacta é idêntico ao anterior em captura.
- **Risco · decisão:** **`RG-5`** — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C2` · **Rollback:** reverter `C-C2`.

### 7.2 Arquétipos por família de superfície (`D3`, `Q3`)

#### `TK-C-004` · Definir os quatro arquétipos **sem** adoção
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** oferecer composição derivada de família + conteúdo, jamais uma regra universal de colunas.
- **Arquivos:** `src/components/layout/HubSurface.js`, `EditorialSurface.js`, `ImmersiveSurface.js`, `GameSurface.js` (**novos**, ao lado de `AppScreen.js`, `CenteredContent.js`, `SafeScreenHeader.js`) — **Símbolos/contratos:** contrato de composição por família.
- **Precondições:** `TK-C-003` — **Depende de:** `TK-C-003`
- **Mudança esperada:** quatro componentes novos, **nenhum consumidor**; cada um documenta **qual característica do conteúdo** governa sua composição.
- **Prova:** `TA-7` — **Gate:** `G-RSP-1`
- **Conclusão:** os quatro existem, e nenhum contém a expressão "duas colunas" como regra de faixa.
- **Risco · decisão:** **`Q3`** · `D3` · Princípio III — **Auto:** sim · **Física futura:** não · **Commit:** `C-C2` · **Rollback:** reverter `C-C2`.

#### `TK-C-005` · `EditorialSurface` — largura de leitura governada pelo texto
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** a família editorial adapta por **legibilidade**, não por contagem de colunas.
- **Arquivos:** `src/components/layout/EditorialSurface.js`, `src/components/layout/ContentContainer.js` (**consumidor existente de `tabletL`**) — **Símbolos/contratos:** largura máxima de leitura; centralização.
- **Precondições:** `TK-C-004` — **Depende de:** `TK-C-004`
- **Mudança esperada:** a medida de linha é limitada por legibilidade; na faixa expandida **não** surge coluna estreita cercada de vazio (`SD-3`).
- **Prova:** captura nas três faixas — **Gate:** `G-RSP-2`
- **Conclusão:** o texto tem medida confortável em `>=900dp`, sem vazio dominante.
- **Risco · decisão:** `SD-3` · `Q3` — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C3` · **Rollback:** reverter `C-C3`.

#### `TK-C-006` · Adoção da família **Editorial** nas quatro telas
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** primeira adoção real, na família de menor risco.
- **Arquivos:** `src/screens/StoryDetailScreen.js`, `ReflectionScreen.js`, `PostStoryHubScreen.js`, `ParentAreaScreen.js` — **Símbolos/contratos:** `EditorialSurface`.
- **Precondições:** `TK-C-005` — **Depende de:** `TK-C-005`
- **Mudança esperada:** as quatro telas passam a compor pelo arquétipo; conteúdo e hierarquia preservados.
- **Prova:** capturas nas três faixas por tela — **Gate:** `G-RSP-2`
- **Conclusão:** 4 telas × 3 faixas = **12 capturas** sem vazio dominante e sem perda de conteúdo.
- **Risco · decisão:** `SD-2`, `SD-3` — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C3` · **Rollback:** reverter `C-C3`.

#### `TK-C-007` · `HubSurface` — densidade governada pela quantidade real de itens
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** a família Hub adapta por **inventário**, não por faixa.
- **Arquivos:** `src/components/layout/HubSurface.js` — **Símbolos/contratos:** composição derivada da contagem e do tamanho natural do item.
- **Precondições:** `TK-C-004` — **Depende de:** `TK-C-004`
- **Mudança esperada:** a composição responde ao conteúdo real; a faixa é **insumo**, não regra.
- **Prova:** `TA-7` — **Gate:** `G-RSP-2`
- **Conclusão:** com o mesmo conteúdo, faixas diferentes produzem composição distinta e coerente (`SD-2`).
- **Risco · decisão:** **`Q3`** — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C4` · **Rollback:** reverter `C-C4`.

#### `TK-C-008` · Adoção da família **Hub** nas quatro telas
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** segunda adoção real.
- **Arquivos:** `src/screens/HomeScreen.js`, `BrincarScreen.js`, `TrophiesScreen.js`, `AtelierGalleryScreen.js` — **Símbolos/contratos:** `HubSurface`; listas virtualizadas e chaves estáveis preservadas.
- **Precondições:** `TK-C-007` — **Depende de:** `TK-C-007`
- **Mudança esperada:** adoção sem alterar progresso, conquistas nem `accessControl` (**áreas protegidas**).
- **Prova:** capturas nas três faixas por tela — **Gate:** `G-RSP-2`
- **Conclusão:** **12 capturas** coerentes; nenhuma área protegida tocada no *diff*.
- **Risco · decisão:** **áreas protegidas** (progresso, conquistas, `accessControl`) — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C4` · **Rollback:** reverter `C-C4`.

#### `TK-C-009` · Painel de apoio da Galeria do Ateliê na faixa expandida
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** aproveitar a largura com **conteúdo já existente**, sem inventar destino novo.
- **Arquivos:** `src/screens/AtelierGalleryScreen.js` — **Símbolos/contratos:** painel derivado de informação que a tela já possui.
- **Precondições:** `TK-C-008` — **Depende de:** `TK-C-008`
- **Mudança esperada:** o espaço extra recebe conteúdo existente; **nenhuma funcionalidade nova** entra pela porta dos fundos.
- **Prova:** captura em `>=900dp` — **Gate:** `G-RSP-2`
- **Conclusão:** a faixa expandida mostra mais do que já existia, e nada que não existia.
- **Risco · decisão:** `SD-3` · fronteira de escopo (sem funcionalidade nova) — **Auto:** não · **Física futura:** **sim** · **Commit:** `C-C4` · **Rollback:** reverter `C-C4`.

#### `TK-C-010` · `ImmersiveSurface` — a obra e a cena mandam na composição
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** integrar a família imersiva **respeitando** o espaço lógico já entregue por `F6-R3`.
- **Arquivos:** `src/components/layout/ImmersiveSurface.js` — **Símbolos/contratos:** consome `useViewportProjection`; **não** reimplementa projeção.
- **Precondições:** `TK-C-004`, `TK-A-030` — **Depende de:** `TK-C-004`
- **Mudança esperada:** o arquétipo delega a projeção ao *hook* de `R3`; **nenhuma arquitetura paralela de canvas nasce aqui**.
- **Prova:** `TA-7` + `G-CVS-1` continua verde — **Gate:** `G-RSP-2`, `G-CVS-1`
- **Conclusão:** o arquétipo não contém aritmética de projeção própria.
- **Risco · decisão:** **`RG-2`** (arquitetura paralela) — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-C5` · **Rollback:** reverter `C-C5`.

#### `TK-C-011` · Adoção da família **Imersiva** — com `SD-8` revalidado
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** adotar sem colocar a obra infantil em risco de novo.
- **Arquivos:** `src/screens/StoryBookScreen.js`, `src/screens/ColoringScreen.js`, `src/screens/AtelierCanvasScreen.js` — **Símbolos/contratos:** `ImmersiveSurface`; `StoryBookScreen` tocado **apenas** no necessário (**F9** fora de escopo).
- **Precondições:** `TK-C-010` — **Depende de:** `TK-C-010`
- **Mudança esperada:** adoção mínima; a matriz de 17 casos é **reexecutada** para provar que nada regrediu.
- **Prova:** reexecução de §28.1 — **Gate:** `G-CVS-1`, `G-CVS-2`, `G-CMP-1`..`G-CMP-5`
- **Conclusão:** **17 de 17 `PASS`** novamente. Um `FAIL` reabre `SD-8` e **bloqueia** `F6-SG-C`.
- **Risco · decisão:** **`RG-1`** · `SD-8` (**continua bloqueador absoluto**) — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C5` · **Rollback:** reverter `C-C5`.

#### `TK-C-012` · `GameSurface` é **oferecido**, nunca imposto
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** cumprir §6.3 — refatorar os cinco jogos seria risco sem requisito.
- **Arquivos:** `src/components/layout/GameSurface.js` — **Símbolos/contratos:** arquétipo disponível, adoção diferida a **F12A**.
- **Precondições:** `TK-C-010` — **Depende de:** `TK-C-010`
- **Mudança esperada:** o arquétipo existe e é documentado; **nenhuma** tela de jogo é migrada nesta fase.
- **Prova:** `git diff` sem telas de jogo — **Gate:** `G-RSP-1`
- **Conclusão:** `MonteACena*`, `ParesDoBeni`, `Palavrinhas`, `CadeAOvelhinha` e `QuizScreen` permanecem intocados.
- **Risco · decisão:** fronteira com **F12A** — **Auto:** sim · **Física futura:** não · **Commit:** `C-C6` · **Rollback:** reverter `C-C6`.

#### `TK-C-013` · Nenhuma arquitetura paralela — os arquétipos **estendem** o que existe
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** cumprir a Governança da Arquitetura: estender antes de criar paralelo.
- **Arquivos:** `src/components/layout/` — **Símbolos/contratos:** relação dos arquétipos com `AppScreen.js`, `CenteredContent.js`, `SafeScreenHeader.js`, `ContentContainer.js`.
- **Precondições:** `TK-C-012` — **Depende de:** `TK-C-012`
- **Mudança esperada:** os arquétipos compõem com os componentes existentes; nenhum deles duplica responsabilidade já existente.
- **Prova:** revisão + `G-RSP-1` — **Gate:** `G-RSP-1`
- **Conclusão:** nenhum componente de *layout* existente ficou órfão ou duplicado.
- **Risco · decisão:** Governança da Arquitetura · Princípio III — **Auto:** parcial · **Física futura:** não · **Commit:** `C-C6` · **Rollback:** reverter `C-C6`.

#### `TK-C-014` · Portões `G-RSP-1` e `G-RSP-2`
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** lacrar a política única de faixa e a ausência de vazio na faixa expandida.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** `check`, `codeOf`.
- **Precondições:** `TK-C-013` — **Depende de:** `TK-C-013`
- **Mudança esperada:** asserção de que a decisão de composição passa por `useWindowBand`/arquétipo, e não por comparação literal de largura espalhada.
- **Prova:** `MT-6`, `MT-7` — **Gate:** `G-RSP-1`, `G-RSP-2`
- **Conclusão:** verdes no estado correto; vermelhos sob os mutantes.
- **Risco · decisão:** `SD-2`, `SD-3` — **Auto:** sim · **Física futura:** não · **Commit:** `C-C9` · **Rollback:** reverter `C-C9`.

### 7.3 *Tokens* — `Q4` e `Q9`

#### `TK-C-015` · `grid` e `displayScaleTablet` — consumidor legítimo **ou** obsolescência demonstrada
- **Pacote · Subportão:** `F6-R1.3` · `F6-SG-C` — **Objetivo:** cumprir `Q4` sem remover *token* preventivamente e sem manter *token* morto por inércia.
- **Arquivos:** `src/theme/tokens.js` — **Símbolos/contratos:** `grid`, `displayScaleTablet`.
- **Precondições:** `TK-C-014` — **Depende de:** `TK-C-014`
- **Mudança esperada:** **uma** de duas saídas, explicitamente registrada: (a) os arquétipos passam a consumi-los com semântica declarada; **ou** (b) a obsolescência é demonstrada — quem os substituiu, por quê, e a remoção acontece de forma controlada e verificável.
- **Prova:** `TA-8` — **Gate:** `G-RSP-3`
- **Conclusão:** nenhum dos dois permanece sem consumidor **e** sem parecer de obsolescência.
- **Risco · decisão:** **`Q4`** · decisão do fundador ("não remova tokens preventivamente") — **Auto:** sim · **Física futura:** não · **Commit:** `C-C7` · **Rollback:** reverter `C-C7`.

#### `TK-C-016` · *Tokens* de navegação com semântica **adaptativa** declarada
- **Pacote · Subportão:** `F6-R1.3`/`R1.4` · `F6-SG-C` — **Objetivo:** cumprir a autorização `Q9` do fundador de tocar `src/theme/tokens.js`.
- **Arquivos:** `src/theme/tokens.js` — **Símbolos/contratos:** *token* de largura estrutural da barra lateral (§19.1).
- **Precondições:** `TK-C-015` — **Depende de:** `TK-C-015`
- **Mudança esperada:** o *token* declara **semântica** (largura estrutural de navegação lateral, que responde à faixa e ao conteúdo), não um número herdado. **Mover `width: 200` para `sidebarWidth: 200` NÃO cumpre o requisito** (§19.1).
- **Prova:** `TA-9` — **Gate:** **`G-SID-2`**
- **Conclusão:** o *token* tem semântica declarada e nenhum consumidor o trata como constante fixa de 200.
- **Risco · decisão:** **`Q9`** — **Auto:** sim · **Física futura:** **sim** · **Commit:** `C-C7` · **Rollback:** reverter `C-C7`.

#### `TK-C-017` · Restrições verificáveis de `Q9` — as seis, uma a uma
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** transformar as seis restrições de §19.1 em asserções, não em promessas.
- **Arquivos:** `scripts/smoke.js`, `src/theme/tokens.js` — **Símbolos/contratos:** as seis restrições de §19.1.
- **Precondições:** `TK-C-016` — **Depende de:** `TK-C-016`
- **Mudança esperada:** cada restrição ganha uma verificação — estática quando possível, documental quando não.
- **Prova:** `TA-9`, `MT-16` — **Gate:** `G-SID-2`, `G-SID-3`
- **Conclusão:** as **seis** restrições verificadas, com o método de verificação nomeado para cada uma.
- **Risco · decisão:** **`Q9`** — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C7` · **Rollback:** reverter `C-C7`.

#### `TK-C-018` · Nenhum *token* removido sem substituto identificado
- **Pacote · Subportão:** `F6-R1.3` · `F6-SG-C` — **Objetivo:** cumprir literalmente "não remova tokens preventivamente".
- **Arquivos:** `src/theme/tokens.js` — **Símbolos/contratos:** inventário antes/depois.
- **Precondições:** `TK-C-017` — **Depende de:** `TK-C-017`
- **Mudança esperada:** qualquer remoção declara o substituto e o consumidor migrado; **design system** não é alterado além do autorizado por `Q9` (**área protegida**).
- **Prova:** `git diff` de `tokens.js` revisado item a item — **Gate:** `G-RSP-3`
- **Conclusão:** o *diff* de `tokens.js` é integralmente justificado por `Q4` ou `Q9`.
- **Risco · decisão:** **área protegida (design system)** · `Q4` · `Q9` — **Auto:** não · **Física futura:** não · **Commit:** `C-C7` · **Rollback:** reverter `C-C7`.

### 7.4 Barra lateral (`F6-R1.4`) — defeitos 1 a 3

#### `TK-C-019` · Defeito 1 da barra lateral
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** corrigir o primeiro dos três defeitos que **pertencem à Fase 6** (§19).
- **Arquivos:** `src/components/TabletSidebar.js`, `src/navigation/AppNavigator.js` — **Símbolos/contratos:** `width: 200` fixo; consumo do *token* de `TK-C-016`.
- **Precondições:** `TK-C-018` — **Depende de:** `TK-C-018`
- **Mudança esperada:** a largura estrutural passa a responder à faixa e ao conteúdo, via *token* semântico.
- **Prova:** captura em `600–899dp` e `>=900dp` — **Gate:** `G-SID-1`
- **Conclusão:** a barra tem largura coerente nas duas faixas onde aparece.
- **Risco · decisão:** `SD-4` · `Q9` — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C8` · **Rollback:** reverter `C-C8`.

#### `TK-C-020` · Defeito 2 da barra lateral
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** corrigir o segundo defeito de §19.
- **Arquivos:** `src/components/TabletSidebar.js` — **Símbolos/contratos:** conforme §19 (defeito 2).
- **Precondições:** `TK-C-019` — **Depende de:** `TK-C-019`
- **Mudança esperada:** correção **estritamente** dentro do escopo de §19; **defeitos 4 e 5 pertencem ao Bloco `B2` e não são tocados**.
- **Prova:** captura comparativa — **Gate:** `G-SID-1`
- **Conclusão:** o defeito 2 não é mais observável; 4 e 5 permanecem registrados e **abertos**.
- **Risco · decisão:** fronteira com **`B2`** (**bloqueado**) — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C8` · **Rollback:** reverter `C-C8`.

#### `TK-C-021` · Defeito 3 da barra lateral
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** corrigir o terceiro defeito de §19.
- **Arquivos:** `src/components/TabletSidebar.js` — **Símbolos/contratos:** conforme §19 (defeito 3).
- **Precondições:** `TK-C-020` — **Depende de:** `TK-C-020`
- **Mudança esperada:** correção dentro do escopo; **nenhum destino de navegação novo** (`SD-4`).
- **Prova:** captura comparativa — **Gate:** `G-SID-1`
- **Conclusão:** barra sem vazio desproporcional e **sem destino novo**.
- **Risco · decisão:** `SD-4` · **áreas protegidas** (`accessControl` intocado) — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C8` · **Rollback:** reverter `C-C8`.

#### `TK-C-022` · Defeitos 4 e 5 permanecem em `B2` — asserção de não-invasão
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** provar que a Fase 6 **não** começou `B2` por dentro.
- **Arquivos:** artefato de evidência + `git diff` de `C-C8` — **Símbolos/contratos:** defeitos 4 e 5 de §19.
- **Precondições:** `TK-C-021` — **Depende de:** `TK-C-021`
- **Mudança esperada:** **nenhuma** — registro de que 4 e 5 continuam abertos e fora de escopo.
- **Prova:** revisão do *diff* — **Gate:** `G-SID-3`
- **Conclusão:** nenhuma linha do *diff* endereça os defeitos 4 ou 5. **`B2` continua bloqueado.**
- **Risco · decisão:** **`B2` bloqueado** — **Auto:** parcial · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-023` · Portões `G-SID-1`, `G-SID-2` e `G-SID-3`
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** lacrar largura semântica, contrato de `Q9` e fronteira de `B2`.
- **Arquivos:** `scripts/smoke.js` — **Símbolos/contratos:** ausência de largura literal na barra; *token* semântico consumido; ausência de destino novo.
- **Precondições:** `TK-C-022` — **Depende de:** `TK-C-022`
- **Mudança esperada:** três asserções novas.
- **Prova:** `MT-16` — **Gate:** `G-SID-1`, `G-SID-2`, `G-SID-3`
- **Conclusão:** verdes no estado correto; vermelhos sob `MT-16`.
- **Risco · decisão:** `Q9` — **Auto:** sim · **Física futura:** não · **Commit:** `C-C9` · **Rollback:** reverter `C-C9`.

#### `TK-C-024` · Mutante `MT-16` — *token* semântico volta a ser constante fixa
- **Pacote · Subportão:** `F6-R1.4` · `F6-SG-C` — **Objetivo:** provar que `G-SID-2` reconhece o "renomear e declarar resolvido".
- **Arquivos:** mutação temporária em `src/theme/tokens.js` / `TabletSidebar.js` (**nunca commitada**) — **Símbolos/contratos:** largura fixa restaurada.
- **Precondições:** `TK-C-023` — **Depende de:** `TK-C-023`
- **Mudança esperada:** **defeito deliberado** — o *token* volta a ser um `200` fixo consumido sem semântica. Esperado: `G-SID-2` **vermelho**.
- **Prova:** portão vermelho — **Gate:** `G-SID-2` (**tem de falhar**)
- **Conclusão:** falha observada, mutante revertido, registro anexado.
- **Risco · decisão:** **`Q9`** · `RG-13` — **Auto:** sim · **Física futura:** não · **Commit:** **nenhum** · **Rollback:** `git checkout --`.

### 7.5 Fronteiras preservadas

#### `TK-C-025` · `P-103` **não** é tocada pela Fase 6
- **Pacote · Subportão:** `F6-R1.*` · `F6-SG-C` — **Objetivo:** cumprir `Q7` literalmente.
- **Arquivos:** `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` (**somente verificação**) — **Símbolos/contratos:** `P-103`.
- **Precondições:** `TK-C-024` — **Depende de:** —
- **Mudança esperada:** **nenhuma** — asserção de que `P-103` continua com a mesma classificação e diferida à **Fase 7**.
- **Prova:** revisão documental — **Gate:** —
- **Conclusão:** nenhuma task da Fase 6 corrigiu, reclassificou ou reabriu `P-103`.
- **Risco · decisão:** **`Q7`** (congelada) — **Auto:** sim · **Física futura:** não · **Commit:** nenhum (verificação) · **Rollback:** não aplicável.

#### `TK-C-026` · Equivalente lateral da geometria do *callout* do guia
- **Pacote · Subportão:** `F6-R1.2` · `F6-SG-C` — **Objetivo:** fechar a condicional `!isTablet` que hoje deixa a composição lateral sem geometria de *callout*.
- **Arquivos:** `src/navigation/AppNavigator.js`, camada de *overlay* do guia — ⚠️ **INCERTEZA LOCALIZADA** quanto ao arquivo exato do *callout* — **Símbolos/contratos:** condicional `!isTablet`.
- **Precondições:** `TK-C-021` — **Depende de:** `TK-C-021`
- **Mudança esperada:** a composição lateral ganha geometria equivalente; o comportamento na faixa compacta é **preservado**.
- **Prova:** vídeo do tour nas três faixas — **Gate:** `G-RSP-4`
- **Conclusão:** o *callout* aponta corretamente em todas as faixas.
- **Risco · decisão:** `RG-6` · fronteira com **F7** — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C6` · **Rollback:** reverter `C-C6`.

#### `TK-C-027` · Portão `G-RSP-4` e controles negativos `CN-5`/`CN-7`
- **Pacote · Subportão:** `F6-R1.*` · `F6-SG-C` — **Objetivo:** provar não-regressão da faixa compacta e ausência de funcionalidade nova.
- **Arquivos:** `scripts/smoke.js`; `git diff` do pacote — **Símbolos/contratos:** `CN-5` (faixa compacta inalterada), `CN-7` (nenhum destino/funcionalidade novo).
- **Precondições:** `TK-C-026` — **Depende de:** `TK-C-026`
- **Mudança esperada:** portão + evidência comparativa.
- **Prova:** capturas antes/depois na faixa compacta — **Gate:** `G-RSP-4`
- **Conclusão:** telefone indistinguível do estado anterior; nenhum destino novo no app.
- **Risco · decisão:** **`RG-5`** — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C9` · **Rollback:** reverter `C-C9`.

### 7.6 Orientação — **último** passo do **último** pacote (`F6-R1.1`)

> **Regra do fundador:** a rota técnica **permanece não escolhida** neste artefato.
> **Não instale `expo-screen-orientation`. Não presuma que uma dependência será necessária.**

#### `TK-C-028` · Provar o mecanismo real de orientação sob **CNG**
- **Pacote · Subportão:** `F6-R1.1` · `F6-SG-C` — **Objetivo:** partir de prova, não de suposição.
- **Arquivos:** `app.json` (**leitura**), `node_modules/@expo/config-plugins` (**leitura**) — **Símbolos/contratos:** `android/Orientation.js:24-35` (lê **apenas** `config.orientation` de topo; escreve `android:screenOrientation`); `ios/RequiresFullScreen.js:21-22, :55-67` (escreve `UISupportedInterfaceOrientations~ipad` com as quatro orientações quando `supportsTablet` && !`requireFullScreen`).
- **Precondições:** `TK-C-027` — **Depende de:** `TK-C-027`
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
- **Risco · decisão:** **`RG-9`** · `SD-9` — **Auto:** não · **Física futura:** **sim** (§28 #14, #15) · **Commit:** `C-C10` · **Rollback:** não aplicável.

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
- **Prova:** §28 #14, #15, #16, #17 — **Gate:** `G-RSP-4`
- **Conclusão:** os **quatro casos de `D1`** se comportam conforme a decisão, com `SD-9` preservado.
- **Risco · decisão:** **`RG-9`** · `OR-6` · `RD-1` — **Auto:** parcial · **Física futura:** **sim** · **Commit:** `C-C10` (isolado, o último de `R1`) · **Rollback:** reverter `C-C10` — e **somente** `C-C10`, sem tocar no restante do pacote.

---

## 8. `BLOCO 6` · Fechamento formal de `F6-SG-C`

> **`F6-SG-C` não é concedido aqui.**

#### `TK-C-036` · Executar o conjunto automatizado de `F6-SG-C`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** veredito de `TA-6`..`TA-10` + `npm run smoke` + `npx expo-doctor`.
- **Arquivos:** `scripts/smoke.js`, arneses — **Símbolos/contratos:** `SD-10`. **Depende de:** `TK-C-035`
- **Mudança esperada:** nenhuma; evidência. **Prova:** saídas anexadas — **Gate:** `G-RSP-1`..`G-RSP-4`, `G-SID-1`..`G-SID-3`, `G-BP-1`
- **Conclusão:** tudo verde. **Risco:** — · **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-037` · Executar e registrar as **mutações negativas** de `F6-SG-C`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** provar que os portões de `R1` têm dentes.
- **Arquivos:** mutações temporárias (**nenhuma commitada**) — **Símbolos/contratos:** `MT-6` (regra universal de duas colunas), `MT-7` (coluna estreita com vazio em `>=900`), `MT-8` (`Dimensions.get` reintroduzido), `MT-9` (*breakpoint* novo), `MT-10` (comparação literal de largura fora do *hook*), `MT-11` (destino novo na barra lateral), `MT-16` (*token* vira constante fixa).
- **Precondições:** `TK-C-036` — **Depende de:** `TK-C-036`
- **Mudança esperada:** cada mutante injetado, portão observado **vermelho**, mutante revertido, resultado registrado.
- **Prova:** tabela mutante → portão — **Gate:** os portões correspondentes
- **Conclusão:** todas as falhas observadas; árvore limpa ao fim. **Risco:** `RG-13` · **Auto:** sim · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** `git checkout --` por mutante.

#### `TK-C-038` · Regressão completa em **telefone** (faixa compacta)
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** o aparelho onde o app já funciona **não pode** piorar.
- **Arquivos:** — (aparelho) — **Símbolos/contratos:** `CN-5`. **Depende de:** `TK-C-037`
- **Mudança esperada:** nenhuma; capturas comparativas por família. **Prova:** capturas + roteiros §28
- **Conclusão:** as quatro famílias indistinguíveis do estado anterior no telefone. **Risco:** **`RG-5`** · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-039` · Validação em **tablet *portrait***
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** cobrir a faixa média com composição real.
- **Arquivos:** — (aparelho) — **Símbolos/contratos:** `SD-2`, `SD-3`, `SD-4`. **Depende de:** `TK-C-038`
- **Mudança esperada:** nenhuma; capturas por família. **Prova:** capturas
- **Conclusão:** composição coerente, sem vazio dominante, barra lateral correta. **Risco:** `SD-3` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-040` · Validação em **tablet *landscape***
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** cobrir a faixa expandida.
- **Arquivos:** — (aparelho) — **Símbolos/contratos:** `breakpoints.tabletL`. **Depende de:** `TK-C-039`
- **Mudança esperada:** nenhuma; capturas por família. **Prova:** capturas
- **Conclusão:** nenhuma coluna estreita cercada de vazio em `>=900dp` (`SD-3`). **Risco:** `SD-3` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-041` · Validação de ***resize*** quando suportado (Split View, Slide Over)
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** cobrir a mudança contínua de janela, não só a rotação.
- **Arquivos:** — (iPad) — **Símbolos/contratos:** `SD-9`; travessia de `600dp` arrastando o divisor. **Depende de:** `TK-C-040`
- **Mudança esperada:** nenhuma; vídeo da travessia. **Prova:** §28 #14, #15 + `CN-6`
- **Conclusão:** travessia sem remontagem, sem perda de estado e sem quebra de composição. **Risco:** `RG-4` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-042` · Consistência das **quatro famílias** entre si
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** provar `SD-2` de forma comparativa, não isolada.
- **Arquivos:** artefato de evidência — **Símbolos/contratos:** 4 famílias × 3 faixas = **12 células**. **Depende de:** `TK-C-041`
- **Mudança esperada:** matriz com captura por célula e veredito de coerência. **Prova:** a própria matriz
- **Conclusão:** as 12 células coerentes entre si; nenhuma família contradiz a política das outras. **Risco:** `SD-2` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-043` · Verificação final da **barra lateral**
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** fechar `SD-4` com evidência.
- **Arquivos:** — (aparelho) — **Símbolos/contratos:** `SD-4`; defeitos 1–3 corrigidos, 4–5 abertos. **Depende de:** `TK-C-042`
- **Mudança esperada:** nenhuma; capturas nas duas faixas onde a barra existe. **Prova:** capturas
- **Conclusão:** sem vazio, sem destino novo, defeitos 4–5 ainda registrados como **abertos** em `B2`. **Risco:** `SD-4` · **Auto:** não · **Física futura:** **sim** · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-044` · Verificação final dos ***tokens***
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** fechar `Q4` e `Q9` com evidência, não com promessa.
- **Arquivos:** `src/theme/tokens.js` (**revisão do *diff***) — **Símbolos/contratos:** `grid`, `displayScaleTablet`, *token* da barra lateral. **Depende de:** `TK-C-043`
- **Mudança esperada:** nenhuma; parecer item a item sobre o *diff*. **Prova:** `TA-8`, `TA-9` — **Gate:** `G-RSP-3`, `G-SID-2`
- **Conclusão:** nenhum *token* morto por inércia; nenhuma remoção preventiva; `Q9` cumprida além da renomeação. **Risco:** `Q4`, `Q9` · **Auto:** parcial · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-045` · Ausência de **arquitetura paralela**
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** provar a Governança da Arquitetura ao fim do delta.
- **Arquivos:** `src/components/layout/`, `src/hooks/`, `src/services/` — **Símbolos/contratos:** um *hook* de faixa, um de projeção, um de *lifecycle*, um serviço de âncora. **Depende de:** `TK-C-044`
- **Mudança esperada:** nenhuma; inventário provando que não há dois caminhos para a mesma responsabilidade. **Prova:** inventário + `G-RSP-1`
- **Conclusão:** nenhuma responsabilidade da Fase 6 tem duas implementações concorrentes. **Risco:** **`RG-2`** · **Auto:** parcial · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

#### `TK-C-046` · Relatório e critérios `PASS`/`FAIL` de `F6-SG-C`
- **Pacote · Subportão:** — · `F6-SG-C` — **Objetivo:** entregar a base de decisão **sem conceder o subportão**.
- **Arquivos:** artefato de evidência — **Símbolos/contratos:** critérios de saída de `F6-SG-C` (§27). **Depende de:** `TK-C-045`
- **Mudança esperada:** relatório em PT-BR com a distinção correta de estado de arquivo. **Prova:** revisão do fundador
- **Conclusão:** relatório entregue; **`F6-SG-C` permanece não concedido**. **Risco:** `RG-10` · **Auto:** não · **Física futura:** — · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

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
- **Precondições:** `TK-D-001`..`TK-D-004` — **Depende de:** `TK-D-004`
- **Mudança esperada:** **nenhuma** — parecer em PT-BR com as 12 condições, as três concessões, o veredito de `SD-8` e o estado das pendências.
- **Prova:** revisão do fundador — **Gate:** —
- **Conclusão:** o parecer diz **exatamente** "`B2` elegível para ser apresentado ao fundador" **ou** "`B2` continua bloqueado". **Em nenhuma hipótese o parecer desbloqueia `B2`.**
- **Risco · decisão:** **`B2` bloqueado** · `OR-5` — **Auto:** não · **Física futura:** não · **Commit:** `C-GOV1` · **Rollback:** não aplicável.

---

## 10. Contagem e estrutura

### 10.1 Totais

| Recorte | Quantidade |
|---|---|
| **Total de tasks** | **171** |
| `BLOCO 1` — `F6-R3` (`TK-A-001`..`TK-A-057`) | 57 |
| `BLOCO 2` — fechamento de `F6-SG-A` (`TK-A-058`..`TK-A-084`) | 27 |
| `BLOCO 3` — `F6-R2` (`TK-B-001`..`TK-B-028`) | 28 |
| `BLOCO 4` — fechamento de `F6-SG-B` (`TK-B-029`..`TK-B-036`) | 8 |
| `BLOCO 5` — `F6-R1` (`TK-C-001`..`TK-C-035`) | 35 |
| `BLOCO 6` — fechamento de `F6-SG-C` (`TK-C-036`..`TK-C-046`) | 11 |
| `BLOCO 7` — `F6-SG-D` (`TK-D-001`..`TK-D-005`) | 5 |

| Por **pacote** | Tasks |
|---|---|
| `F6-R3` | 57 |
| `F6-R2` | 28 |
| `F6-R1` | 35 |
| Tasks de fechamento de subportão (não pertencem a pacote) | 51 |

| Por **subportão** | Tasks |
|---|---|
| `F6-SG-A` | **84** (57 de `R3` + 27 de fechamento) |
| `F6-SG-B` | **36** (28 de `R2` + 8 de fechamento) |
| `F6-SG-C` | **46** (35 de `R1` + 11 de fechamento) |
| `F6-SG-D` | **5** |

| Por **fronteira de *commit*** | Tasks |
|---|---|
| Vinculadas a um *commit* de código (`C-A*`, `C-B*`, `C-C*`) | 104 |
| Evidência e governança (`C-GOV1`) — inclui os 17 casos da matriz | 55 |
| **Injeção de mutante — nunca *commitadas*** | 10 |
| Verificação pura, sem *commit* | 2 |
| **Total** | **171** |

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
        TK-A-058 → TK-A-059 → TK-A-060 → TK-A-061 → TK-A-062 → TK-A-063..079 → TK-A-080
                                                     (matriz de 17 casos)         │
                                            TK-A-081 → TK-A-082 → TK-A-083 → TK-A-084
                                            ↓
                            🚦 F6-SG-A — CONCESSÃO HUMANA (OR-1)
                                            ↓
        TK-B-001 → TK-B-002/003/004 → TK-B-005 → TK-B-006 → TK-B-007 → TK-B-008
                → TK-B-009 → TK-B-010 → TK-B-011 → TK-B-012 → TK-B-013 → TK-B-014
                → TK-B-015 → TK-B-016 → TK-B-017 → TK-B-018 → TK-B-019 → TK-B-020 → TK-B-021
                → TK-B-022/023/024 → TK-B-025/026 → TK-B-027/028
                → TK-B-029 → TK-B-030 → TK-B-031 → TK-B-032 → TK-B-033 → TK-B-034 → TK-B-035 → TK-B-036
                                            ↓
                            🚦 F6-SG-B — CONCESSÃO HUMANA (OR-2)
                                            ↓
        TK-C-001 → TK-C-002 → TK-C-003 → TK-C-004 → TK-C-005 → TK-C-006
                → TK-C-007 → TK-C-008 → TK-C-009 → TK-C-010 → TK-C-011 → TK-C-012 → TK-C-013 → TK-C-014
                → TK-C-015 → TK-C-016 → TK-C-017 → TK-C-018
                → TK-C-019 → TK-C-020 → TK-C-021 → TK-C-022 → TK-C-023 → TK-C-024
                → TK-C-025 · TK-C-026 → TK-C-027
                → TK-C-028 → TK-C-029 → TK-C-030 → TK-C-031 → TK-C-032 → TK-C-033 → TK-C-034
                → 🚦 aprovação de rota/dependência (se necessária) → TK-C-035   ← ÚLTIMO (OR-6)
                → TK-C-036 .. TK-C-046
                                            ↓
                            🚦 F6-SG-C — CONCESSÃO HUMANA
                                            ↓
                        TK-D-001 → TK-D-002 → TK-D-003 → TK-D-004 → TK-D-005
                                            ↓
                        PARECER — B2 elegível  ·OU·  B2 continua bloqueado
                        (a decisão permanece humana; nenhum desbloqueio automático)
```

**Verificações estruturais desta árvore:**

| Verificação | Resultado |
|---|---|
| Alguma task de `R2` depende de `R1`? | **Não.** `TK-B-021` prova isso no código. |
| Alguma task de `R1` é executável antes de `F6-SG-B`? | **Não.** `TK-C-001` tem a concessão como precondição. |
| Alguma task de `R2` é executável antes de `F6-SG-A`? | **Não.** `TK-B-001` tem a concessão como precondição. |
| `B2` aparece como automaticamente desbloqueado? | **Não.** `TK-D-005` só emite parecer; `TK-C-022` prova a não-invasão. |
| A orientação é o último passo? | **Sim.** `TK-C-035`, precedida de 7 tasks de estudo e da aprovação de rota. |
| Alguma task de proteção da obra foi deslocada para depois de `R2`/`R1`? | **Não.** `TK-A-030`..`TK-A-056` estão integralmente em `F6-R3`. |

---

## 11. Análise documental de cobertura

> Auditoria **puramente documental**, interna a esta rodada. **`/speckit.analyze` não foi executado**
> e permanece dependente de autorização separada do fundador.

### 11.1 Requisito → task

| Requisito | Tasks |
|---|---|
| `F6-R3.1` — posição do mapa sobrevive | `TK-A-017`..`TK-A-021` |
| `F6-R3.2` — estado de superfície sobrevive | `TK-A-009`..`TK-A-011`, `TK-A-016`, `TK-A-023`..`TK-A-029` |
| `F6-R3.3` — travessia de faixa não remonta | `TK-A-022` |
| `F6-R3.4` — instrumentação de término de processo | `TK-A-012`..`TK-A-015` |
| `F6-R3.5` — espaço lógico, eixos, leitor, *writer* | `TK-A-001`..`TK-A-008`, `TK-A-030`..`TK-A-056` |
| `F6-R3.6` — porção autorizada de `P-164` | `TK-A-057` |
| `F6-R2.1` — âncora única | `TK-B-001`..`TK-B-004`, `TK-B-009`..`TK-B-011`, `TK-B-019`, `TK-B-022` |
| `F6-R2.2` — câmera única | `TK-B-005`, `TK-B-012`..`TK-B-014`, `TK-B-024` |
| `F6-R2.3` — duplicação de fatores morre | `TK-B-015`..`TK-B-017` |
| `F6-R2.4` — região ativa unificada | `TK-B-006`, `TK-B-018` |
| `F6-R2.5` — assinatura única | `TK-B-004`, `TK-B-020`, `TK-B-023` |
| `F6-R1.1` — orientação | `TK-C-028`..`TK-C-035` |
| `F6-R1.2` — superfícies adaptativas | `TK-C-001`..`TK-C-014`, `TK-C-026` |
| `F6-R1.3` — *tokens* | `TK-C-015`, `TK-C-018`, `TK-C-044` |
| `F6-R1.4` — barra lateral | `TK-C-016`, `TK-C-017`, `TK-C-019`..`TK-C-024`, `TK-C-043` |

### 11.2 Critério de sucesso (`SD-*`) → task

| `SD` | Tasks |
|---|---|
| `SD-1` — quatro casos de `D1` | `TK-C-028`..`TK-C-035` |
| `SD-2` — três faixas, composição distinta | `TK-C-007`, `TK-C-039`..`TK-C-042` |
| `SD-3` — nenhuma coluna estreita com vazio em `>=900` | `TK-C-005`, `TK-C-006`, `TK-C-009`, `TK-C-040` |
| `SD-4` — barra lateral sem vazio e sem destino novo | `TK-C-019`..`TK-C-023`, `TK-C-043` |
| `SD-5` — pino/alvo/brilho/*scroll*/holofote na mesma âncora | `TK-B-009`..`TK-B-011`, `TK-B-015`, `TK-B-019`, `TK-B-034` |
| `SD-6` — câmera acerta a mira no tablet | `TK-B-012`..`TK-B-015`, `TK-B-032`, `TK-B-033` |
| `SD-7` — rotação preserva rota/*scroll*/áudio/sessão/tour | `TK-A-018`, `TK-A-023`..`TK-A-028` |
| **`SD-8` — ZERO perda ou corrupção de obra** | `TK-A-030`..`TK-A-056`, `TK-A-062`..`TK-A-080`, `TK-A-084`, `TK-B-035`, `TK-C-011`, `TK-D-003` |
| `SD-9` — Split View e Slide Over | `TK-C-031`, `TK-C-041` |
| `SD-10` — smoke + expo-doctor verdes | `TK-A-059`, `TK-B-029`, `TK-C-036` |
| `SD-11` — sem `Dimensions.get`, sem *breakpoint* novo, sem dependência nova | `TK-C-001`, `TK-C-002`, `TK-C-034` |

### 11.3 Risco → task

| Risco | Tasks que o fecham |
|---|---|
| **`RG-1`** obra perdida ou corrompida | `TK-A-032`..`TK-A-056`, `TK-A-062`..`TK-A-080`, `TK-C-011`, `TK-D-003` |
| `RG-2` arquitetura paralela | `TK-A-030`, `TK-C-010`, `TK-C-013`, `TK-C-045` |
| `RG-3` custo de reprojeção | `TK-A-037`, `TK-A-067` |
| `RG-4` remontagem na travessia de faixa | `TK-A-022`, `TK-A-023`, `TK-C-041` |
| `RG-5` regressão na faixa compacta | `TK-A-020`, `TK-B-008`, `TK-B-028`, `TK-B-031`, `TK-C-003`, `TK-C-027`, `TK-C-038` |
| `RG-6` tour/*overlay* desalinhado | `TK-A-026`, `TK-A-027`, `TK-B-019`, `TK-C-026` |
| `RG-7` custo no caminho quente de *scroll* | `TK-A-017`, `TK-B-028` |
| `RG-8` causalidade não provada de `FD-12` | `TK-A-012`..`TK-A-014`, `TK-A-057`, `TK-A-071` |
| `RG-9` orientação e loja | `TK-C-028`..`TK-C-035` |
| `RG-10` evidência insuficiente | `TK-A-081`..`TK-A-083`, `TK-B-036`, `TK-C-046` |
| **`RG-11`** colisão de `v:3` | `TK-A-001`..`TK-A-008`, `TK-A-079` |
| `RG-12` payload legado mal classificado | `TK-A-041`, `TK-A-046`, `TK-A-053`, `TK-A-076` |
| `RG-13` portão sem dentes | `TK-A-061`, `TK-B-030`, `TK-C-037` |
| `P-152` | `TK-A-017`..`TK-A-021`, `TK-D-004` |
| `P-164` | `TK-A-012`..`TK-A-015`, `TK-A-057`, `TK-D-004` |
| `P-103` | **nenhuma** — `TK-C-025` registra a não-geração, por `Q7` |

### 11.4 Gate → task que o cria · task que o prova vermelho

| Gate | Criado por | Provado por mutante |
|---|---|---|
| `G-LFC-1` | `TK-A-021` | `TK-A-021` (`MT-1`) |
| `G-LFC-2` | `TK-A-015` | `TK-A-015` (remoção temporária) |
| `G-LFC-3` | `TK-A-015` | `TK-A-015` (remoção temporária) |
| `G-CVS-1` | `TK-A-038` | `TK-A-039` (`MT-4`) |
| `G-CVS-2` | `TK-A-038` | `TK-A-040` (`MT-5`) |
| `G-VER-1` | `TK-A-007` | `TK-A-008` (`MT-12`) |
| `G-VER-2` | `TK-A-007` | `TK-A-008` (`MT-12`) |
| `G-VER-3` | `TK-A-007` | `TK-A-008` (`MT-12`) |
| `G-CMP-1` | `TK-A-046` | `TK-A-047` (`MT-13`) |
| `G-CMP-2` | `TK-A-042`/`TK-A-043` | `TK-A-047` (`MT-13`) |
| `G-CMP-3` | `TK-A-053` | `TK-A-054` (`MT-14`) |
| `G-CMP-4` | `TK-A-051` | `TK-A-055` (`MT-15`) |
| `G-CMP-5` | `TK-A-056` | `TK-A-047` (`MT-13`) |
| `G-MAP-1` | `TK-B-022` | `TK-B-026` (`MT-3`) |
| `G-MAP-2` | `TK-B-023` | `TK-B-023` (reintrodução) |
| `G-MAP-3` | `TK-B-024` | `TK-B-025` (`MT-2`) |
| `G-MAP-4` | `TK-B-024` | `TK-B-024` (reintrodução de compensação) |
| `G-BP-1` | `TK-C-002` | `TK-C-037` (`MT-8`, `MT-9`) |
| `G-RSP-1` | `TK-C-014` | `TK-C-037` (`MT-6`, `MT-10`) |
| `G-RSP-2` | `TK-C-014` | `TK-C-037` (`MT-7`) |
| `G-RSP-3` | `TK-C-015`/`TK-C-044` | `TK-C-037` (`MT-10`) |
| `G-RSP-4` | `TK-C-027` | `TK-C-037` (`MT-6`) |
| `G-SID-1` | `TK-C-023` | `TK-C-037` (`MT-11`) |
| `G-SID-2` | `TK-C-023` | `TK-C-024` (`MT-16`) |
| `G-SID-3` | `TK-C-023` | `TK-C-037` (`MT-11`) |

**25 portões · 25 com criador · 25 com prova de vermelho.** Nenhum portão órfão.

### 11.5 Mutante → defeito reintroduzido → gate que precisa ficar vermelho

| Mutante | Defeito deliberado | Gate vermelho | Task |
|---|---|---|---|
| `MT-1` | Largura repõe `didInitScroll` (descarte de posição volta) | `G-LFC-1` | `TK-A-021` |
| `MT-2` | Segundo fator de enquadramento em `scrollPinIntoView` | `G-MAP-3` | `TK-B-025` |
| `MT-3` | Alvo de toque volta a derivar separadamente do pino | `G-MAP-1` | `TK-B-026` |
| `MT-4` | Motor volta a guardar coordenadas em píxel de tela | `G-CVS-1` | `TK-A-039` |
| `MT-5` | Carga incompatível volta a abrir canvas branco em silêncio | `G-CVS-2` | `TK-A-040` |
| `MT-6` | Regra universal "tablet = duas colunas" reintroduzida | `G-RSP-1`/`G-RSP-4` | `TK-C-037` |
| `MT-7` | Coluna estreita cercada de vazio em `>=900dp` | `G-RSP-2` | `TK-C-037` |
| `MT-8` | `Dimensions.get` reintroduzido | `G-BP-1` | `TK-C-037` |
| `MT-9` | Quarto *breakpoint* criado | `G-BP-1` | `TK-C-037` |
| `MT-10` | Comparação literal de largura fora do *hook* de faixa | `G-RSP-1`/`G-RSP-3` | `TK-C-037` |
| `MT-11` | Destino de navegação novo na barra lateral | `G-SID-1`/`G-SID-3` | `TK-C-037` |
| `MT-12` | Payload do canvas emitido com `v: 3` | `G-VER-1` | `TK-A-008` |
| `MT-13` | Abrir obra volta a converter e regravar | `G-CMP-2`/`G-CMP-5` | `TK-A-047` |
| `MT-14` | Promoção sem releitura de validação | `G-CMP-3` | `TK-A-054` |
| `MT-15` | Payload aceito sem verificar identidade do *lineart* | `G-CMP-4` | `TK-A-055` |
| `MT-16` | *Token* semântico da barra volta a ser constante fixa | `G-SID-2` | `TK-C-024` |

**16 mutantes · 16 defeitos nomeados · 16 portões alvo.** Nenhum mutante decorativo: cada um
reintroduz um defeito **real e auditado**, não uma variação estética.

### 11.6 Teste → task

| Teste | Task que o cria |
|---|---|
| `TA-1` âncora única | `TK-B-007` |
| `TA-2` câmera acerta a mira | `TK-B-007` |
| `TA-3` região ativa | `TK-B-007` |
| `TA-4` projeção idempotente | `TK-A-031` |
| `TA-5` obra sobrevive à mudança de janela | `TK-A-034`, `TK-A-035` |
| `TA-6` faixa única | `TK-C-001` |
| `TA-7` arquétipos por família | `TK-C-004` |
| `TA-8` *tokens* com consumidor | `TK-C-015` |
| `TA-9` contrato da barra lateral | `TK-C-016` |
| `TA-10` geometria do guia em todas as faixas | `TK-C-026` |
| `TA-11` ortogonalidade dos eixos | `TK-A-006` |
| `TA-12` classificação de payload legado | `TK-A-046` |
| `TA-13` *write-forward*, releitura e rollback | `TK-A-053` |

### 11.7 Controle negativo → task

| `CN` | Enunciado | Task |
|---|---|---|
| `CN-1` | `R2` não ganha faixa nem arquétipo | `TK-B-027` |
| `CN-2` | Abertura do mapa equivalente na faixa compacta | `TK-A-020`, `TK-B-028` |
| `CN-3` | Custo de *scroll* preservado | `TK-B-028` |
| `CN-4` | Sessão em andamento sobrevive | `TK-A-028` |
| `CN-5` | Faixa compacta inalterada por `R1` | `TK-C-027`, `TK-C-038` |
| `CN-6` | Travessia de faixa não remonta | `TK-A-022` |
| `CN-7` | Nenhum destino ou funcionalidade novo | `TK-C-027` |
| `CN-8` | Nenhuma migração silenciosa em massa | `TK-A-043` |

### 11.8 Cenário físico → task

| §28 | Cenário | Task |
|---|---|---|
| #1 | Mapa: rolar, girar, voltar | `TK-A-017`..`TK-A-019`, `TK-A-023` |
| #2 | Mapa: *resize* contínuo | `TK-A-018` |
| #3 | Gesto em andamento na mudança de janela | `TK-A-016`, `TK-A-068` |
| #4 | Colorir: segundo plano e retorno | `TK-A-010`, `TK-A-069` |
| #5 | Colorir: Centro de Controle / notificação | `TK-A-010`, `TK-A-012`, `TK-A-070` |
| #6 | Colorir: rotação com pintura | `TK-A-033`, `TK-A-035`, `TK-A-065` |
| #7 | Ateliê: rotação com composição | `TK-A-034`, `TK-A-066` |
| #8 | Ateliê: segundo plano | `TK-A-011`, `TK-A-069` |
| #9 | Ateliê: retorno com obra não salva | `TK-A-011`, `TK-A-069` |
| #10 | Jogo em andamento + multitarefa | `TK-A-028`, `TK-A-029` |
| #11 | Áudio atravessando rotação | `TK-A-025` |
| #12 | Mapa no tablet: pino, alvo, câmera | `TK-B-031`..`TK-B-034` |
| #13 | Tour com holofote | `TK-A-026`, `TK-A-027`, `TK-B-019`, `TK-C-026` |
| #14 | Split View | `TK-C-031`, `TK-C-041` |
| #15 | Slide Over | `TK-C-031`, `TK-C-041` |
| #16 | Tablet *portrait* — quatro famílias | `TK-C-039` |
| #17 | Tablet *landscape* — quatro famílias | `TK-C-040` |

**17 cenários físicos · 17 com task.**

### 11.9 Matriz de compatibilidade §28.1 → task (**um para um**)

| Caso | Task | Caso | Task | Caso | Task |
|---|---|---|---|---|---|
| 1 | `TK-A-063` | 7 | `TK-A-069` | 13 | `TK-A-075` |
| 2 | `TK-A-064` | 8 | `TK-A-070` | 14 | `TK-A-076` |
| 3 | `TK-A-065` | 9 | `TK-A-071` | 15 | `TK-A-077` |
| 4 | `TK-A-066` | 10 | `TK-A-072` | 16 | `TK-A-078` |
| 5 | `TK-A-067` | 11 | `TK-A-073` | 17 | `TK-A-079` |
| 6 | `TK-A-068` | 12 | `TK-A-074` | — | consolidação: `TK-A-080` |

**17 casos · 17 tasks individuais · nenhuma diluição em task genérica de "testar canvas".**
As quatro invariantes ZERO valem em **todos** os 17 e são reverificadas em `TK-C-011` após `F6-R1`.

### 11.10 Decisão do fundador (`Q3`–`Q9`) → task

| Questão | Como aparece nas Tasks |
|---|---|
| `Q3` composição deriva de família + conteúdo | `TK-C-004`, `TK-C-005`, `TK-C-007`; **nenhuma** task cria "tablet = duas colunas" (`MT-6` prova) |
| `Q4` `grid`/`displayScaleTablet` | `TK-C-015`, `TK-C-018`, `TK-C-044` — consumidor legítimo **ou** obsolescência demonstrada; sem remoção preventiva |
| `Q5` (duplicação do mapa não sobrevive) | `TK-B-015`..`TK-B-017`, `TK-B-024` |
| `Q6`/§41.4 trava de `MAP_ANCHOR_FRAMING` | `TK-B-002`, `TK-B-005`, `TK-B-013`, `TK-B-024` — o mensurável é **medido** |
| `Q7` `P-103` diferida à Fase 7 | `TK-C-025` — **não gera task de correção**, por decisão |
| `Q8` compatibilidade da obra legada (10 regras) | `TK-A-041`..`TK-A-056`; regras 1–6 no leitor, 7–9 no *writer*, 10 no *lineart* |
| `Q9` autorização sobre `src/theme/tokens.js` | `TK-C-016`, `TK-C-017`, `TK-C-018`; `MT-16` prova que renomear não basta |

### 11.11 Arquivo provável → task

| Arquivo | Tasks | Estado |
|---|---|---|
| `src/hooks/useSurfaceLifecycle.js` | `TK-A-009` | **novo** |
| `src/hooks/useViewportProjection.js` | `TK-A-030` | **novo** |
| `src/hooks/useWindowBand.js` | `TK-C-001` | **novo** |
| `src/services/mapAnchor.js` | `TK-B-001`..`TK-B-006` | **novo** |
| `src/components/layout/HubSurface.js` · `EditorialSurface.js` · `ImmersiveSurface.js` · `GameSurface.js` | `TK-C-004`, `TK-C-005`, `TK-C-007`, `TK-C-010`, `TK-C-012` | **novos** |
| `scripts/testing/mapAnchorHarness.js` | `TK-B-007` | **novo** |
| `scripts/testing/viewportProjectionHarness.js` | `TK-A-031` | **novo** |
| `scripts/testing/artworkVersionHarness.js` | `TK-A-006`, `TK-A-046`, `TK-A-053` | **novo** |
| `src/components/ColoringCanvas.js` | `TK-A-001`..`TK-A-004`, `TK-A-012`..`TK-A-014`, `TK-A-016`, `TK-A-033`, `TK-A-035`, `TK-A-036`, `TK-A-041`, `TK-A-044`, `TK-A-048`..`TK-A-051` | existente |
| `src/components/AtelierCanvas.js` | idem + `TK-A-034` | existente |
| `src/screens/ColoringScreen.js` | `TK-A-010`, `TK-A-042`, `TK-A-045`, `TK-C-011` | existente |
| `src/screens/AtelierCanvasScreen.js` | `TK-A-011`, `TK-A-042`, `TK-A-045`, `TK-C-011` | existente |
| `src/screens/AdventureMapScreen.js` | `TK-A-017`..`TK-A-021`, `TK-B-012`..`TK-B-018`, `TK-B-020` | existente |
| `src/components/MapRegion.js` ⚠️ | `TK-B-009`..`TK-B-011` | existente — nome a confirmar |
| `src/navigation/AppNavigator.js` | `TK-A-022`, `TK-A-023`, `TK-C-019`, `TK-C-026` | existente |
| `src/components/TabletSidebar.js` | `TK-C-019`..`TK-C-021` | existente |
| `src/theme/tokens.js` | `TK-C-015`..`TK-C-018` (**`Q9`**) | existente — **área protegida, autorizada** |
| `src/services/guideTargetRegistry.js` · `src/hooks/useGuideTargets.js` | `TK-A-026`, `TK-B-019` | existente |
| `scripts/smoke.js` | `TK-A-007`, `TK-A-015`, `TK-A-021`, `TK-A-038`, `TK-A-056`, `TK-B-017`, `TK-B-022`..`TK-B-024`, `TK-C-002`, `TK-C-014`, `TK-C-017`, `TK-C-023`, `TK-C-027` | existente |
| `src/services/drawingStorage.js` · `storageKeys.js` · `storageMigrationService.js` · `coloring60DrawingStorage.js` | `TK-A-005`, `TK-A-043` | **INTOCADOS — verificação de não-alteração** |
| `assets/**` | `TK-A-052` | **INTOCADOS — área protegida** |
| `package.json` · `package-lock.json` · `eas.json` | `TK-C-034` | **INTOCADOS sem aprovação prévia** |
| `app.json` e/ou *config plugin* próprio ⚠️ | `TK-C-028`..`TK-C-035` | **rota deliberadamente não escolhida** |

### 11.12 Itens sem task — justificativa explícita

| Item do PLAN | Por que **não** gera task |
|---|---|
| **`P-103`** | `Q7` congelada: diferida à **Fase 7**. Nenhuma task da Fase 6 corrige ou reclassifica. Registro em `TK-C-025`. |
| **Defeitos 4 e 5 da barra lateral** (§19) | Pertencem ao Bloco **`B2`**, que **continua bloqueado**. Registro de não-invasão em `TK-C-022`. |
| **Refatoração dos cinco jogos para `GameSurface`** | §6.3: risco de regressão **sem requisito**. Adoção diferida a **F12A**. Registro em `TK-C-012`, `TK-A-029`. |
| **`StoryBookScreen` além do mínimo** | Escopo de **F9**. Tocado apenas no necessário (`TK-C-011`, `TK-A-024`). |
| **Escolha da rota condicional de §33** (tablet Android ausente) | O PLAN **não escolhe**; a decisão é do fundador. `TK-A-082` declara o vão; nenhuma task o resolve unilateralmente. |
| **Escolha da rota técnica de orientação** | Regra do fundador: a rota **permanece não escolhida**. `TK-C-028`..`TK-C-034` produzem a base; `TK-C-035` só executa **após aprovação**. |
| **Itens de §40 (fora de escopo)** | Declarados fora do delta da Fase 6 pelo PLAN aprovado. |
| **Migração para TypeScript** | Depende de feature própria aprovada pelo ciclo SDD. Fora deste delta. |
| **Adoção de `useSurfaceLifecycle` pelos quatro jogos** | Mesma justificativa de §6.3; o *hook* é oferecido, não imposto. |

**Nenhum requisito, risco, portão, mutante, teste, controle negativo, cenário físico ou caso da
matriz ficou órfão.** Os nove itens acima são **não-geração deliberada e justificada**, não omissão.

---

## 12. Decisões do fundador ainda necessárias

**Antes de `Analyze`: nenhuma.** Todas as questões `Q1`–`Q9` estão congeladas, o Constitution Check
não tem violação em aberto, e a ordem executiva é canônica.

Duas decisões tornam-se necessárias **depois**, e estão explicitamente representadas como precondições:

| Decisão | Quando | Task que a exige |
|---|---|---|
| **Rota técnica de orientação** e, se aplicável, **aprovação prévia de dependência** | Dentro de `F6-R1`, antes do último passo | `TK-C-034` → `TK-C-035` |
| **Rota condicional de §33** para a ausência de tablet Android (`P8`) | Antes de conceder `F6-SG-C` | `TK-A-082`, `TK-C-046` |

Além dessas, as **três concessões humanas de subportão** (`F6-SG-A`, `F6-SG-B`, `F6-SG-C`) e a
**decisão sobre `B2`** permanecem, por construção, fora do alcance de qualquer task.

---

## 13. Fronteira desta rodada

| Ação | Estado |
|---|---|
| Tasks geradas e auditadas documentalmente | ✅ |
| `Analyze` (Etapa SDD 6) | ❌ **não executado** — exige autorização separada |
| `Implement` (Etapa SDD 7) | ❌ **não executado** |
| Alteração de *runtime* | ❌ **nenhuma** |
| Alteração de *assets* | ❌ **nenhuma** |
| Dependência instalada | ❌ **nenhuma** |
| *Build* / Metro | ❌ **não executados** |
| `push` / `merge` | ❌ **não executados** |
| `B2` | 🔒 **continua bloqueado** |
| `SD-8` | 🔴 **continua bloqueador absoluto** |
| `P-152` · `P-164` | 📌 **mantidas, sem rebaixamento** |
| `P-103` | ⏭️ **diferida à Fase 7** |
| PLAN aprovado | ✅ **não alterado** — nenhuma inconsistência mecânica impeditiva foi encontrada |

**Fim do artefato `05_TASKS_DELTA_F6.md`.**

