# `04` · PLAN do delta da Fase 6 — `F6-R3` → `F6-R2` → `F6-R1` → `F6-SG-D`

**Etapa SDD 4 — Plan + Constitution Check.** Artefato produzido sob a autorização exclusiva
concedida no fechamento do **Portão Humano 1** (aprovado definitivamente em **2026-08-09**).

| Campo | Valor |
|---|---|
| *Worktree* | `C:\tmp\ptf_fase6_shell_splash_wt` |
| *Branch* | `feat/fase6-shell-splash` |
| `HEAD` de entrada | `7cc1562822e02ba7f479474e2217137a8e3182ca` |
| Árvore de entrada | **limpa** |
| Data | 2026-08-09 |
| Etapa | **PLAN + Constitution Check — e nada além disso** |
| Revisão | **r2 — Emenda do Portão Humano 2** (`HEAD` de entrada da emenda: `3e5ae91`) |

> **Emenda do Portão Humano 2 (r2).** Incorpora a decisão **`Q8`** (§41.5), a autorização **`Q9`**
> (§41.6), a **correção obrigatória da colisão de versionamento `v:3`** (§11.5), o contrato de
> *tokens* da barra lateral (§19.1), a **trava de `MAP_ANCHOR_FRAMING`** (§41.4), a **matriz de
> compatibilidade obrigatória** (§28.1) e o Constitution Check atualizado (§4). Ordem executiva,
> conteúdo técnico aprovado, `Q3`–`Q7`, `SD-8`, `P-152`, `P-164` e as fronteiras de escopo da Fase 6
> permanecem **inalterados**.

---

## 1. Objetivo e fronteira deste PLAN

**Objetivo.** Converter a *spec*, o *clarify*, o *checklist*, as decisões do fundador, a matriz de
riscos e a **ordem executiva canônica** já aprovadas em um plano de implementação **executável,
verificável e rastreável**, suficiente para ser submetido ao **Portão Humano 2**.

**Fronteira — o que este PLAN é.** Um documento de planejamento. Ele aponta para arquivos, funções,
*hooks*, componentes, estados e contratos **reais**, verificados por leitura de código nesta rodada
ou na auditoria `00`, e diz **o que** será feito, **em que ordem**, **com que critério de saída**.

**Fronteira — o que este PLAN não é e não faz.**

- **Não reabre decisão congelada.** `Q1`, `Q2`/`PF6D-D-CANVAS`, `D1`, `D2`, `D3`, `D4`, `D10`,
  `D11`, `D12`, `D18`, a ordem executiva, a classificação de `P-152`/`P-164`, `P-141` e o
  diferimento de `P-103` entram aqui como **premissas**, nunca como pauta.
- **Não executa Tasks, Analyze nem Implement.**
- **Não altera runtime, *assets*, `app.json`, `eas.json` nem `package.json`.**
- **Não instala dependência**, não roda Metro para validação física, não gera *build*, não faz
  *push*, não faz *merge*.
- **Não desbloqueia o Bloco `B2`.** `F6-SG-D` permanece portão separado e não concedido.

---

## 2. Precondições

| # | Precondição | Estado |
|---|---|---|
| P1 | Portão Humano 1 aprovado definitivamente | ✅ 2026-08-09 |
| P2 | Ordem executiva canônica única versionada em 5 documentos | ✅ *commit* `7cc1562` |
| P3 | `Q1` e `Q2` resolvidas e congeladas | ✅ `PF6D-Q1`, `PF6D-D-CANVAS` |
| P4 | Matriz `P-01`–`P-167` íntegra (167 linhas, 22 colunas, 0 vazias) | ✅ validada |
| P5 | Exceção estreita de escopo de `F6-R3` autorizada (vigor **após** os demais portões) | ✅ `PF6D-EXC-R3` / `F6-R3.6` |
| P6 | `npm run smoke` e `npx expo-doctor` verdes no `HEAD` de partida | ⏳ **a confirmar na Etapa 7**, não executado nesta rodada (proibido) |
| P7 | Aparelho físico iPad do fundador disponível para as campanhas de `SG-A`/`SG-B`/`SG-C` | ✅ (usado na campanha anterior) |
| P8 | **Tablet Android físico** | ❌ **indisponível** — ver §33 e §36 |
| P9 | Portão Humano 2 (este PLAN) | ⏳ **pendente de aprovação definitiva** |
| P10 | Portão Humano 3 (Tasks + Analyze) | ⏳ pendente |
| P11 | **`Q8`** — política de compatibilidade da obra já salva | ✅ **DECIDIDA** pelo fundador (§41.5) — direção `c + d`, 10 regras normativas |
| P12 | **`Q9`** — autorização para tocar `src/theme/tokens.js` em `F6-R1.4` | ✅ **AUTORIZADA** pelo fundador (§41.6), com 6 restrições |

**P6, P9 e P10 são bloqueadores de execução.** Nenhuma linha de código é escrita antes de P9 e P10.
**P11 e P12 deixaram de ser questões abertas de produto**: viraram **contratos normativos** cujo
cumprimento é verificado por portões de implementação (§26).

---

## 3. Documentos árbitros consultados

| Documento | Papel | Uso nesta rodada |
|---|---|---|
| `docs/PROJECT_SOURCE_OF_TRUTH.md` | **Verdade máxima** — Roteiro Mestre | Ordem executiva canônica; fronteira da Fase 6 |
| `.specify/memory/constitution.md` (v1.1.0) | Constituição | Base integral do Constitution Check (§4) |
| `AGENTS.md` · `CLAUDE.md` | Regras operacionais compartilhadas | Git seletivo, portões de qualidade, áreas protegidas |
| `docs/DECISIONS.md` | Árbitro de decisões de produto | `PF6D-Q1`, `PF6D-D-CANVAS`, `PF6D-EXC-R3`, `PF6D-D1`, `PF6D-D18` |
| `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` | Inventário de pendências | `P-150`–`P-157`, `P-164`, `P-82`, `P-148`, `P-30`, `P-103` |
| `delta-v4.1/00_AUDITORIA_SOMENTE_LEITURA.md` | Evidência de código | §1.2–§1.5, §2, §3, §4, §5 |
| `delta-v4.1/01_SPEC_DELTA_F6_R1_R2_R3.md` | **Requisitos** | §2, §3, §4, §5, §6, §7, §8, §9, §10 |
| `delta-v4.1/02_CLARIFY_E_CHECKLIST.md` | Perguntas e *checklist* (32/32 `OK`) | `Q3`–`Q7`, `CKD-01`–`CKD-32`, `CN-*`, `MT-*`, `FD-*` |
| `delta-v4.1/03_ROADMAP_v4.1_DELTA.md` | Subportões e *crosswalk* `E`↔`P` | §2.1, §3, §3.1, §3.2 |
| `.specify/templates/plan-template.md` | Molde do Constitution Check | Estrutura do §4 |

### 3.1 Código lido nesta rodada — confirmação dirigida, sem nova auditoria ampla

`src/theme/tokens.js` (§2.2 tipografia, §2.4 responsividade) · `src/screens/AdventureMapScreen.js`
(:36, :123-127, :173, :201, :280-311, :362-395, :398-438, :481-484) ·
`src/components/map/MapRegion.js` (:36-59) · `src/services/guideTargetRegistry.js` (íntegro) ·
`src/components/layout/AppScreen.js` (íntegro) · `src/components/ColoringCanvas.js`
(:472-556, :584, :769-925) · `src/components/AtelierCanvas.js` (:390-460, :468-527) ·
`src/screens/AtelierCanvasScreen.js` (:77, :165, :217-232, :330-334) ·
`src/screens/ColoringScreen.js` (mapa de símbolos e importações) ·
`src/screens/ParesDoBeniScreen.js` (:316-332) · `scripts/smoke.js` (:30-69, :296-325) ·
`package.json` (*scripts*) · `node_modules/@expo/config-plugins/build/android/Orientation.js`
(íntegro).

**Achado novo desta rodada — registrado, sem reclassificar nada:** ver §15.1. Ele **reforça**
`P-152` e `P-164`; não os rebaixa, não os funde e não altera a matriz.

---

## 4. Constituição aplicável e **Constitution Check**

*Portão: precisa passar antes de qualquer projeto de implementação; re-checado ao fim das Tasks.*

### 4.1 Princípios

| # | Princípio | Como o PLAN o respeita | Tensão identificada | Mitigação | Veredito |
|---|---|---|---|---|---|
| **I** | **Stack Tecnológico Soberano** — nada de dependência nova sem aprovação prévia; `npx expo install`; compatibilidade SDK 54 / RN 0.81.5 / React 19.1 / New Architecture | Todo o plano de `F6-R3` e `F6-R2` é **zero dependência**: usa `AppState`, `useWindowDimensions`, `react-native-webview` e `expo-file-system` já presentes. Nenhuma biblioteca de *layout* é introduzida (`F6-R1.2`) | **Sim, em `F6-R1.1`:** a via **(B)** de orientação seria `expo-screen-orientation` — **dependência nova** | **Nenhuma instalação nesta rodada.** §20 elimina a via (A) com prova de leitura de código e ordena as demais; a escolha só ocorre após **prova de mecanismo** no início de `F6-R1`, e uma dependência só entra com **aprovação prévia explícita** e via `npx expo install` | ✅ **PASSA**, com a tensão declarada e contida |
| **II** | **Arquitetura Local-First e Separação de Responsabilidades** — UI em `src/screens`/`src/components`, lógica em `src/services`, estado compartilhado em `src/context`; áreas protegidas; nenhuma alteração destrutiva sem aprovação | Geometria pura vai para `src/services/mapAnchor.js`; ciclo de vida para `src/hooks/`; arquétipos para `src/components/layout/`. `src/data/adventureMap.js` continua a fonte de coordenadas. Nada sai do local-first | **Duas áreas protegidas são tocadas:** (a) `F6-R3.5` toca o **formato persistido** da obra da criança; (b) `F6-R1.4` toca o **design system** (`tokens.js`) | **Ambas têm instrução direta do fundador.** (a) **`Q8` DECIDIDA** (§41.5): abertura é estritamente leitura, proibida migração silenciosa, gravação *write-forward* com validação de releitura antes da promoção, formato anterior nunca destruído, *lineart* histórico protegido. (b) **`Q9` AUTORIZADA** (§41.6): `tokens.js` pode ser alterado em `F6-R1.4` sob 6 restrições. **O que restou de ambas são condições de implementação verificáveis** — portões `G-CMP-1`..`G-CMP-5` e `G-SID-2`/`G-SID-3` (§26), não questões de produto | ✅ **PASSA** — sem condição de produto pendente |
| **III** | **Qualidade e Clean Code** — identificadores em inglês, documentação/comentários/relatórios em PT-BR, tolerância zero a *God Objects*, TypeScript **não** é a *baseline* | Todos os módulos novos em **JavaScript**; nenhum `tsconfig.json`; nenhuma conversão de `.js`. A extração da aritmética do mapa **reduz** `AdventureMapScreen.js`, hoje o maior concentrador de geometria | **Sim:** `AdventureMapScreen.js` e `ColoringCanvas.js` já são arquivos grandes e as mudanças caem dentro deles | Extração para `src/services/mapAnchor.js` e `src/hooks/useSurfaceLifecycle.js` **remove** responsabilidade das telas em vez de acrescentar. No canvas, a mudança substitui aritmética existente — não acrescenta camada | ✅ **PASSA** |
| **IV** | **Performance e UI/UX Mobile** — memoização situacional e justificada, chaves estáveis, listas virtualizadas, base64 transitório no canvas **não** é violação, medir antes de refatorar amplo | A âncora canônica é função **pura** e barata; o `resize` do canvas passa a recalcular **apenas uma transformação de apresentação** (O(1)) em vez de realocar *buffers* (hoje O(W·H) e destrutivo). O *pipeline* base64 de exportação **não muda** | **Sim:** o mapa é caminho quente de *scroll*; introduzir chamada nova no `onScroll` pode custar | O `onScroll` só passa a **gravar** uma fração (duas operações aritméticas), sem alocação nem `setState` adicional. Nenhuma memoização preventiva. **Medição antes** de qualquer refatoração ampla (§23) | ✅ **PASSA** |
| **V** | **Regra de Ouro — SDD com 3 Portões Humanos** — pular, inverter ou comprimir etapas é violação constitucional | Este artefato é **exclusivamente** a Etapa SDD 4. Etapas 1–3 estão concluídas e aprovadas; Tasks (5), Analyze (6) e Implement (7) **não** foram iniciadas e não serão antes dos Portões 2 e 3 | Nenhuma | — | ✅ **PASSA** |

### 4.2 Seções normativas complementares da Constituição

| Seção | Como o PLAN a respeita | Tensão | Mitigação | Veredito |
|---|---|---|---|---|
| **Precedência Documental** | O PLAN se situa **abaixo** da *spec* aprovada e acima de Tasks. Nenhum ponto deste documento contraria o Roteiro Mestre, a Constituição ou a *spec* | Nenhuma | — | ✅ |
| **Nomenclatura sem Ambiguidade** | "Fase 6" = fase do Roteiro; "Etapa SDD 4" = Plan; `F6-SG-A..D` = subportões; `R1/R2/R3` = **taxonomia**, nunca ordem | Nenhuma | — | ✅ |
| **Rigor Proporcional ao Risco** | A mudança toca **persistência de dados da criança** e **ciclo de vida** ⇒ faixa de rigor máximo: fluxo completo + pesquisa técnica + revisão independente + aprovação explícita | Nenhuma — o PLAN adota a faixa máxima voluntariamente | Revisão independente prevista na Etapa 8 (§27) | ✅ |
| **Áreas Protegidas** | *Paywall*, progresso, conquistas, `accessControl`, manifestos de áudio/cenas, histórias e **assets**: **zero toque** (§10) | *Design system* (`tokens.js`) e formato persistido da obra da criança são tocados | **Instrução direta existe para os dois casos**: `Q9` autoriza `tokens.js` dentro de `F6-R1.4`; `Q8` fixa o contrato de compatibilidade da obra. Nenhuma outra área protegida é tocada | ✅ **PASSA** |
| **Restrições de Stack e Segurança** | Sem `Dimensions.get` novo (`SD-11`); sem *breakpoint* novo; sem `Platform.isPad`; sem `expo-device` para decidir *layout* (`D2`) | Nenhuma | Portão de *smoke* estático (§26) | ✅ |
| **Portões de Qualidade** | `npm run smoke` verde + `npx expo-doctor` verde + **validação visual** + **validação em aparelho físico** — todos exigidos por subportão (§27–§32) | Nenhuma | — | ✅ |
| **Governance** — "todo Plano DEVE passar pelo Constitution Check" | Este §4 é esse Check | Nenhuma | — | ✅ |

### 4.3 Veredito consolidado do Constitution Check

> **Nenhuma violação constitucional não resolvida. Nenhuma questão de produto em aberto.**
>
> As duas tensões que estavam registradas como pendentes (Princípio II e Áreas Protegidas) foram
> **decididas pelo fundador** na emenda do Portão Humano 2: **`Q8`** (compatibilidade da obra já
> salva) e **`Q9`** (autorização de `tokens.js`). O que subsiste delas **não é questão** — são
> **condições de implementação verificáveis**, expressas como portões que falham automaticamente:
> `G-CMP-1`..`G-CMP-5`, `G-SID-2`, `G-SID-3` e `G-VER-1`..`G-VER-3` (§26), mais a matriz de
> compatibilidade obrigatória do §28.1.
>
> A tensão do Princípio I (dependência de orientação) **não bloqueia**: nada é instalado, a via (A)
> está provada insuficiente e a via vencedora exige prova de mecanismo + aprovação prévia.
>
> **Bloqueadores remanescentes são apenas de processo:** Portão Humano 2 (aprovação definitiva) e
> Portão Humano 3 (Tasks + Analyze).

**Complexidade a justificar (molde do `plan-template.md`):**

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|---|---|---|
| Módulo novo `src/services/mapAnchor.js` | A âncora canônica precisa ser **pura e testável fora do React** para ter teste automatizado sem dependência nova | Manter a aritmética dentro de `AdventureMapScreen.js` perpetua as cinco derivações (`P-154`) e é intestável em Node |
| *Hook* novo `src/hooks/useSurfaceLifecycle.js` | Colorir e Ateliê são as **únicas** superfícies interativas sem escuta de `AppState`; o contrato precisa ser único para não nascer uma sexta variação | Copiar o bloco dos quatro jogos para mais duas telas cria a mesma duplicação que `F6-R2` está corrigindo no mapa |

---

## 5. Ordem executiva e dependências

**Ordem canônica, verdade única** (`PF6D-D18`, *commit* `7cc1562`):

```
F6-SG-A = F6-R3  Lifecycle & Resize Stability
        ↓
F6-SG-B = F6-R2  Map Geometry Foundation
        ↓
F6-SG-C = F6-R1  Adaptive Surface System
        ↓
F6-SG-D          somente então avaliar/desbloquear o Bloco B2
```

**A numeração `R1`/`R2`/`R3` é taxonomia dos pacotes de trabalho e não representa ordem temporal.**

### 5.1 Por que a ordem é tecnicamente obrigatória — e como o PLAN a honra

| Dependência | Natureza | Como o PLAN garante |
|---|---|---|
| `F6-R2` **não pode** pressupor fundação de ciclo de vida inexistente | A unificação da âncora mexe justamente no `scroll` que hoje é descartado no `resize` | `F6-R3.1` é entregue **antes**, e a preservação de `R3` é expressa em **fração de conteúdo** (§14.2) — portanto **não depende** da âncora de história que `R2` vai criar. A dependência é de mão única |
| `F6-R1` **não pode** pressupor fundação de ciclo de vida inexistente | Liberar paisagem sobre o canvas atual destrói desenho (auditoria §5.2, `RD-1`) | `F6-R1.1` tem **precondição inegociável** na *spec*: só após `F6-R3` implementada **e validada** e a política `PF6D-D-CANVAS` em vigor |
| `F6-R1` consome a geometria de `F6-R2` | Arquétipos e barra lateral mudam a largura do conteúdo do mapa; sem âncora única, cada mudança de largura reintroduz erro de mira | `F6-SG-B` é critério de entrada de `F6-SG-C` (§27) |
| `F7`/`P-157` depende de `F6-R2` | O holofote do *onboarding* mira a mesma entidade espacial | `F6-R2` expõe **API de infraestrutura** de âncora; a **semântica do alvo** fica em F7 (§40) |
| `B2` depende de tudo | `D18` | `F6-SG-D` é portão separado; §37 lista as condições **para sequer apresentá-lo** |

**Urgência independente, registrada:** como o **iPad já gira hoje** (`UISupportedInterfaceOrientations~ipad`
escrita por `withRequiresFullScreen`), `F6-R3` é necessária **mesmo que `F6-R1.1` não altere nada`.
A exposição é presente, não futura (`RD-5`).

---

## 6. Arquitetura alvo de `F6-R3` — *Lifecycle & Resize Stability* (primeiro)

**Requisitos cobertos:** `F6-R3.1` a `F6-R3.6`. **Pendências:** `P-152` (dona), `P-164` (tocada só
na porção que `F6-R3.6` autoriza). **Subportão:** `F6-SG-A`.

### 6.1 Princípio único do pacote

> A **janela é viewport**. Todo estado que a criança produziu — posição, sessão, passo, e sobretudo
> **a obra** — vive num **espaço lógico próprio**, e mudança de *viewport* só recalcula
> **projeção**, nunca conteúdo.

### 6.2 Peças

| Peça | Caminho | Natureza | Responsabilidade |
|---|---|---|---|
| `useSurfaceLifecycle` | `src/hooks/useSurfaceLifecycle.js` (**novo**) | *Hook* | Contrato único de `AppState` + foco de navegação: `{ appState, isActive, isFocused, onBackground, onForeground }`. Extrai o padrão que os quatro jogos já implementam **inline** (`ParesDoBeniScreen.js:322-327`) |
| `useViewportProjection` | `src/hooks/useViewportProjection.js` (**novo**) | *Hook* | Dado um espaço lógico `{w,h}` e a janela corrente, devolve a transformação de apresentação `{scale, offsetX, offsetY}` com proporção preservada (`R3.5-f`) e as conversões `toCanonical(x,y)` / `toScreen(x,y)` (`R3.5-e`) |
| Preservação de *scroll* do mapa | `src/screens/AdventureMapScreen.js` | Alteração | `R3.1` — §14.2 |
| Contrato de espaço lógico do *raster* | `src/components/ColoringCanvas.js` | Alteração (HTML interno + ponte) | `R3.5-a`..`R3.5-g` — §15.2 |
| Contrato de espaço lógico vetorial | `src/components/AtelierCanvas.js` | Alteração (HTML interno + ponte) | `R3.5-h`..`R3.5-l` — §15.3 |
| Escuta de ciclo de vida nas telas de canvas | `src/screens/ColoringScreen.js`, `src/screens/AtelierCanvasScreen.js` | Alteração | Passam a consumir `useSurfaceLifecycle` — hoje são as **únicas** superfícies interativas sem `AppState` |
| Instrumentação de término do processo de conteúdo | `ColoringCanvas.js`, `AtelierCanvas.js` | Alteração | `onContentProcessDidTerminate` (iOS) e `onRenderProcessGone` (Android) passam de **zero ocorrências** a **instrumentados** — §6.4 |

### 6.3 O que `F6-R3` **não** faz

Não redesenha o Colorir, não conclui visualmente o Colorir, não entrega *Story Home V2*, *Página
Viva*, redesenho final do Criar Livre, política comercial nem `GameShell`. Não refatora os quatro
jogos que **já** tratam `AppState` — mexer neles seria risco de regressão sem requisito. Não
reescreve o motor do canvas (`F6-R3.4`): altera **apenas** as primitivas de coordenada, `resize`,
transformação de *viewport*, ciclo de vida, preservação e recuperação técnica que `F6-R3.6`
autoriza.

### 6.4 `P-164` e `FD-12` — a hipótese causal permanece hipótese

O encerramento do processo da `WKWebView` continua **`HIPÓTESE CAUSAL PRIORITÁRIA / MECANISMO
COMPATÍVEL COM A EVIDÊNCIA ESTÁTICA, AINDA NÃO CONFIRMADO EMPIRICAMENTE`**. O PLAN, portanto:

1. **Não** escreve correção "da causa". Trata a **ausência de defesa**, que está provada.
2. **Instrumenta** `onContentProcessDidTerminate` / `onRenderProcessGone` com registro observável
   (contador + carimbo em `devLog`), para que a campanha física de `F6-SG-A` possa **capturar o
   evento no aparelho** e só então confirmar ou refutar a causa.
3. Mantém o guardrail **`FD-12`**: nenhum artefato pode declarar a causa provada; nenhuma correção
   pode ser declarada "resolvida" com base em inferência estática.
4. **`P-152` e `P-164` permanecem sem rebaixamento**, qualquer que seja o resultado.

**Critério honesto de `SG-A` quanto a isto:** o subportão **não** exige provar a causa. Exige que
(i) a defesa exista, (ii) a instrumentação exista e (iii) o sintoma **não se reproduza** no roteiro
físico. Se o evento for capturado, o registro é anexado; se não for, registra-se "não reproduzido"
— nunca "causa confirmada".

---

## 7. Arquitetura alvo de `F6-R2` — *Map Geometry Foundation* (depois)

**Requisitos:** `F6-R2.1` a `F6-R2.5`. **Pendências:** `P-154` (dona); infraestrutura de `P-157`.
**Subportão:** `F6-SG-B`.

### 7.1 O defeito, em uma frase

Cinco leitores independentes derivam **a mesma entidade espacial** — a posição de uma história no
mapa — e dois deles usam fatores diferentes (`0.58` e `0.5`) enquanto um comentário afirma que usam
"a mesma geometria da câmera".

### 7.2 Alvo — uma âncora, três consumidores de projeção

```
src/data/adventureMap.js          ← FONTE DE DADOS (não muda de papel)
  STORY_MAP_COORDS · MAP_ASPECT · computeRegionHeight · markerFraction
            │  coordenadas NORMALIZADAS
            ▼
src/services/mapAnchor.js         ← ÂNCORA CANÔNICA (novo, puro, sem React)
  computeRegionLayout(regions, width) → [{ top, height }]
  getStoryAnchor(storyId, { regions, regionLayout, width })
        → { regionIndex, xFrac, yFrac, xPx, yPx, contentTop, contentY, contentH }
  computeCameraTarget(anchor, viewport, contentH, { mode })  → y
  MAP_ANCHOR_FRAMING (constante única — §41.4)
            │
   ┌────────┼─────────────────┬──────────────────────┐
   ▼        ▼                 ▼                      ▼
 pino     alvo de toque    câmera / scroll        holofote do tour
MapRegion  MapRegion    AdventureMapScreen   guideTargetRegistry (medição)
```

### 7.3 Correções, uma a uma

| Requisito | Estado atual (linha real) | Alvo |
|---|---|---|
| `R2.1` âncora única | 5 derivações: `MapRegion.js:51-57` · `AdventureMapScreen.js:295-311` · `:369-395` · `:427-438` · registro do tour | Uma: `getStoryAnchor`. As telas passam a **consumir**, não a **calcular** |
| `R2.2` fator único | `0.58` em `:310` e `:385`; `0.5` em `:436`; comentário falso em `:424-426` | Uma geometria canônica com **uma** constante nomeada — §41.4. O comentário passa a descrever o código |
| `R2.3` *viewport* real | `:299` `Math.max(220, height - (insets.top + 56) - (insets.bottom + 56))` — os 56pt inferiores **não existem no tablet** | `onScrollLayout` (`:368`) já mede o *viewport* real em `scrollViewH`. O `initialOffsetY` deixa de estimar: primeira pintura usa o melhor valor disponível e **converge** para a medida real sem pulo — a estimativa fantasma some |
| `R2.4` assinatura única | `getStoryMapCoord(s.id, i, n)` em `MapRegion.js:51` × `getStoryMapCoord(cameraStoryId)` em `:308`, `:383`, `:432` | Assinatura única através de `getStoryAnchor(storyId, ctx)`, que resolve `index`/`count` internamente a partir do contexto de regiões. A divergência **`LATENTE`** morre antes de acordar |
| `R2.5` primeira experiência | `:303-305`, `:376-379` alinham `comece_aqui` no topo | Preservado **sem alteração de comportamento**, agora expresso como `mode: 'regionTop'` da mesma função. `F6-R2` entrega a **capacidade de mirar**; **quem** é o alvo continua sendo F7 |

### 7.4 Restrições de projeto

- `src/data/adventureMap.js` **não é substituído** e **não muda de assinatura pública**.
- A âncora é **normalizada** internamente; devolve píxeis apenas como derivação do contexto
  recebido, nunca guarda píxeis.
- `mapAnchor.js` é **puro**: sem React, sem `useWindowDimensions`, sem medição nativa — é o que o
  torna testável em Node (§23).
- **Não** é criado um terceiro sistema de geometria: `guideTargetRegistry` continua sendo o registro
  de **nós nativos mensuráveis** e não ganha aritmética de mapa (§16).

---

## 8. Arquitetura alvo de `F6-R1` — *Adaptive Surface System* (por último)

**Requisitos:** `F6-R1.1` a `F6-R1.4`. **Pendências:** `P-150`, `P-151`, `P-153`; fecha `P-82`/`P-148`
na porção dos *tokens* inertes. **Subportão:** `F6-SG-C`.

### 8.1 Peças

| Peça | Caminho | Responsabilidade |
|---|---|---|
| `useWindowBand` | `src/hooks/useWindowBand.js` (**novo**) | **Único** tradutor de medida em política: `{ width, height, isLandscape, band: 'compact' \| 'medium' \| 'expanded' }`, derivado de `breakpoints`. Não cria *breakpoint*, não pergunta o modelo do aparelho |
| `HubSurface` | `src/components/layout/HubSurface.js` (**novo**) | Grade que cresce por faixa **e por conteúdo real** (§18) |
| `EditorialSurface` | `src/components/layout/EditorialSurface.js` (**novo**) | Coluna com medida de linha preservada; excedente da faixa expandida vira **painel de apoio**, nunca vazio |
| `ImmersiveSurface` | `src/components/layout/ImmersiveSurface.js` (**novo**) | Ocupa a janela inteira; expõe a *viewport* à arte sem impor coluna |
| `GameSurface` | `src/components/layout/GameSurface.js` (**novo**) | Área jogável com proporção preservada; excedente é **moldura**, nunca distorção |
| `AppScreen` | `src/components/layout/AppScreen.js` | **Inalterado no papel**: continua dono exclusivo da área segura. Não passa a decidir largura |
| `ContentContainer` | `src/components/ui/ContentContainer.js` | Continua dono da **coluna editorial** — deixa de ser o modelo **universal**. Passa a ser consumido **por dentro** de `EditorialSurface` |
| `TabletSidebar` | `src/components/TabletSidebar.js` | §19 |
| Orientação por plataforma | configuração nativa | §20 |

### 8.2 Regras invioláveis do pacote

- **Sem quarto *breakpoint*.** As três faixas já existem em `tokens.js` §2.4 e não são renumeradas,
  renomeadas nem duplicadas.
- **Sem `Dimensions.get`.** Hoje há **zero** ocorrências reais; `SD-11` exige que continue assim.
- **Sem migração de leitura de dimensões.** As ~34 leituras já usam `useWindowDimensions`, que é
  reativo. Falta a **política**, não a **medida**.
- **Sem `Platform.isPad`, sem `expo-device`, sem heurística de identidade de aparelho** (`D2`).
- **É proibido classificar telefone em paisagem como tablet apenas por largura.** Onde a distinção
  for legítima ela vive na **configuração de plataforma** (§20), não em código de tela.
- **Nenhum destino novo** em nenhuma família, em especial na barra lateral (`D4`).
- Os arquétipos **estendem** o que existe; é proibido criar *design system* paralelo ou duplicar
  *tokens* (`RD-3`).

---

## 9. Arquivos e componentes provavelmente afetados — com evidência real

| Arquivo | Pacote | Evidência (linha real) | Natureza da mudança |
|---|---|---|---|
| `src/screens/AdventureMapScreen.js` | `R3`, `R2` | `:36` `SCROLL_BOTTOM_PAD` · `:123-127` `contentW/mapWidth` · `:173` `regionLayout` · `:201` `userScrolledRef` · `:295-311` `initialOffsetY` · `:362-395` câmera · `:427-438` `scrollPinIntoView` | `R3.1` preservação; `R2.1`–`R2.5` consumo da âncora |
| `src/components/map/MapRegion.js` | `R2` | `:47` `computeRegionHeight` · `:50-59` derivação do pino | Passa a consumir `getStoryAnchor` |
| `src/data/adventureMap.js` | `R2` | `MAP_ASPECT`, `STORY_MAP_COORDS`, `getStoryMapCoord`, `markerFraction`, `PIN_TOP_FRACTION_OFFSET` | **Fonte preservada.** Só ganha, se necessário, uma assinatura única compatível para trás |
| `src/services/mapAnchor.js` | `R2` | — (**novo**) | Âncora canônica pura |
| `src/services/guideTargetRegistry.js` | `R2` | íntegro, 47 linhas | **Inalterado em responsabilidade** (§16) |
| `src/components/ColoringCanvas.js` | `R3` | `:472-492` `exportPaint` · `:500-525` `validatePaint` · `:527-556` `loadPaint` (portão de dimensão) · `:551` `resize()` · `:584` `allocBufs` · `:614/:616/:622` `initCanvas` · `:769-925` ponte React | `R3.5-a`..`g` — espaço lógico canônico + projeção |
| `src/components/AtelierCanvas.js` | `R3` | `:220`, `:232`, `:265`, `:292` coordenadas absolutas · `:390-412` `exportState` (`{v:2,...}`) · `:420-450` `loadState` · `:452-458` `resize()` | `R3.5-h`..`l` — coordenadas lógicas + reprojeção |
| `src/screens/ColoringScreen.js` | `R3` | nenhum `AppState`, nenhum `useFocusEffect` | Passa a consumir `useSurfaceLifecycle` |
| `src/screens/AtelierCanvasScreen.js` | `R3` | `:6` docblock "NUNCA redimensionam o canvas" · `:165` `loadState` · `:232` `exportState` | Idem + atualização do docblock, que hoje documenta a fragilidade como garantia |
| `src/hooks/useSurfaceLifecycle.js` | `R3` | — (**novo**) | Contrato único de ciclo de vida |
| `src/hooks/useViewportProjection.js` | `R3` | — (**novo**) | Transformação de apresentação |
| `src/hooks/useWindowBand.js` | `R1` | — (**novo**) | Faixa a partir de `breakpoints` |
| `src/components/layout/HubSurface.js` · `EditorialSurface.js` · `ImmersiveSurface.js` · `GameSurface.js` | `R1` | — (**novos**) | Arquétipos das quatro famílias |
| `src/components/ui/ContentContainer.js` | `R1` | `:25-27` único consumidor de `breakpoints.tabletL` | Passa a ser interno ao arquétipo Editorial |
| `src/components/layout/CenteredContent.js` | `R1` | delegação pura para `ContentContainer` | Acompanha, sem mudar de contrato |
| `src/components/TabletSidebar.js` | `R1` | `:4` importa `theme/colors` legado · `:125` `width: 200` · `:196` `navButtons` sem `flex:1` | `R1.4` (§19) |
| `src/navigation/AppNavigator.js` | `R1` | `:232` corte de tablet · geometria do *callout* condicionada a `!isTablet` | Consome `useWindowBand`; geometria do *callout* ganha equivalente lateral |
| `src/theme/tokens.js` | `R1` | `:134-137` §2.4 | `grid` e `displayScaleTablet` ganham consumidor (§17.2); *token* de largura estrutural da barra lateral com semântica adaptativa — **`Q9` AUTORIZADA**, contrato em §19.1 |
| `app.json` | `R1` | única fonte de orientação do projeto | **Só** se a via vencedora de §20 exigir — e só após aprovação |
| `scripts/smoke.js` | todos | `:48` `check(...)`, `:68` `codeOf(...)` | Portões estáticos novos (§26) |

**Total previsto:** 11 arquivos alterados, 7 criados, 1 de configuração condicional.

---

## 10. Arquivos que **não** devem ser afetados

| Alvo | Razão |
|---|---|
| `src/services/accessControl.js` e tudo de *paywall*/*entitlement* | Área protegida; sem instrução direta |
| Progresso e conquistas (`src/context/ProgressContext.js`, serviços de jornada) | Área protegida |
| Manifestos de áudio e de cenas; `src/data/stories*`; conteúdo das histórias | Área protegida |
| `assets/**` — qualquer *asset* | Área protegida; nenhum lote auditado nesta rodada |
| `src/services/drawingStorage.js` — o **envelope** de armazenamento (`POINTER_VERSION`/`v`) e `APP_STORAGE_SCHEMA_VERSION` | **Intocados** (§11.5, `G-VER-2`). `Q8` decidiu o contrato: abrir é **leitura pura**; o registro antigo nunca é reescrito no lugar; nenhum degrau novo entra na escada de `storageMigrationService.js`. Qualquer gravação no formato novo é *write-forward* isolado (`Q8`, regras 7–9), sobre os eixos `paintSchemaVersion`/`layoutVersion` — **nunca** sobre `v` |
| Os quatro jogos (`MonteACena*`, `ParesDoBeni`, `Palavrinhas`, `CadeAOvelhinha`) e `QuizScreen` | Já tratam `AppState`; refatorá-los é risco sem requisito. `GameSurface` é **oferecido**, não imposto, e sua adoção por tela é `F12A` |
| `StoryBookScreen.js` além do necessário | *Story Home V2* / *Página Viva* são **F9** |
| `src/theme/colors.js` (tema legado) | Não é apagado neste delta; só deixa de ser consumido pela barra lateral |
| `eas.json`, `package.json`, `package-lock.json` | Sem dependência nova nesta fase de planejamento |
| `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` | Árbitro da sequência de fases; nada nele muda |
| `.claude/settings.local.json` e qualquer arquivo pessoal | Nunca versionado |

---

## 11. APIs e contratos — novos e alterados

### 11.1 `src/services/mapAnchor.js` — **novo**

```js
export const MAP_ANCHOR_FRAMING;                 // geometria canônica única (§41.4)
export function computeRegionLayout(regions, width);
export function getStoryAnchor(storyId, ctx);    // ctx = { regions, regionLayout, width }
export function computeCameraTarget(anchor, viewport, contentH, opts);
export function resolveActiveRegion(scrollY, regionLayout, probeOffset);
```

| Item | Definição |
|---|---|
| **Responsabilidade** | Ser a **fonte exclusiva** da posição de uma história no mapa e do enquadramento dessa posição numa *viewport* |
| **Localização** | `src/services/` — lógica, conforme o Princípio II |
| **Entradas** | Regiões visuais, largura do conteúdo, altura real do *viewport*, altura total do conteúdo, `storyId` |
| **Saídas** | Frações normalizadas **e** a projeção em píxeis derivada do contexto recebido |
| **Consumidores** | `MapRegion` (pino e alvo de toque), `AdventureMapScreen` (câmera, `scroll`, `scrollPinIntoView`), o *overlay* de guia (alvo do holofote) |
| ***Ownership*** | O módulo possui a **aritmética**. A **medição** do *viewport* pertence a `AdventureMapScreen` (`onScrollLayout`). A **medição de nós nativos** pertence a `guideTargetRegistry` |
| **Momento de medição** | Nenhum — o módulo é puro. Ele **recebe** medidas já feitas |
| **Reação a `resize`** | Nenhuma interna. Recalcula quando o chamador passa largura/altura novas — é função, não estado |
| **Reação a orientação** | Idem: orientação é apenas outra largura/altura |
| **Integração futura com F7** | F7 chama `getStoryAnchor(alvoEscolhidoPorF7, ctx)` e `computeCameraTarget` para o holofote e o ponto de partida do *onboarding*. **F7 não é implementada agora**; apenas a assinatura fica estável |

### 11.2 `src/hooks/useSurfaceLifecycle.js` — **novo**

`useSurfaceLifecycle({ onBackground, onForeground, pauseOnBlur })` →
`{ appState, isActive, isFocused }`. Espelha o padrão já usado nos jogos, sem alterá-los.

### 11.3 `src/hooks/useViewportProjection.js` — **novo**

`useViewportProjection(logicalSize, windowSize)` → `{ scale, offsetX, offsetY, toCanonical, toScreen }`,
com proporção preservada e *letterbox*/*pillarbox* (`R3.5-f`).

### 11.4 `src/hooks/useWindowBand.js` — **novo**

`useWindowBand()` → `{ width, height, isLandscape, band }`. **Único** ponto autorizado a traduzir
largura em faixa. Os 13 consumidores atuais do predicado `width >= breakpoints.tablet` migram para
ele de forma **incremental** (§12).

### 11.5 ⚠️ Eixos de versionamento — **quatro eixos, quatro nomes, zero colisão**

**Correção obrigatória do Portão Humano 2.** A versão anterior deste PLAN propunha chamar a nova
representação de `v:3`. **Isso está proibido.** A revisão do fundador identificou a colisão, e a
leitura dirigida desta rodada confirmou que ela é **mais grave do que parecia**: o número `3` já
tem **dois** significados distintos no sistema, e o campo `v` **já é lido como discriminador de
ponteiro** — a proposta anterior seria silenciosamente descartada pelo próprio código.

#### 11.5.1 O que já existe — verificado por leitura de código

| Eixo | Nome canônico existente | Onde vive | Valor hoje | Evidência |
|---|---|---|---|---|
| **1. Schema do AsyncStorage do app** | `APP_STORAGE_SCHEMA_VERSION` | `src/services/storageKeys.js:19`; escada de migração em `storageMigrationService.js:156` (`{ version: 3, run: migrateToV3 }`) | **`3`** | `export const APP_STORAGE_SCHEMA_VERSION = 3;` |
| **2. Envelope de ponteiro de blob** | `POINTER_VERSION`, serializado como o campo **`v`** | `src/services/drawingStorage.js:30, :47, :83`; reusado por `coloring60DrawingStorage.js:119` | **`3`** | `const POINTER_VERSION = 3;` · `p.v === POINTER_VERSION && typeof p.uri === 'string'` |
| **3. Formato do payload visual transportado** | campo **`fmt`** do ponteiro | `drawingStorage.js:59-77` (escrita), `:94-102` (leitura) | **`1`** = data URL crua · **`2`** = JSON com bloco de *layout* | `fmt = 1` / `fmt = 2`; `if (p.fmt === 2) {...}` |
| **4. Geometria lógica da obra** | **não existe hoje** | os campos `W/H/imgX/imgY/imgW/imgH` viajam **sem** versão própria | — | `layout = { W, H, imgX, imgY, imgW, imgH }` em `buildPointer` |

#### 11.5.2 Prova de que `v:3` no payload do canvas seria destrutivo

`src/screens/ColoringScreen.js:224`:

```js
if (obj.v === 3 || typeof obj.uri === 'string') return false; // ponteiro v3 nunca vem do canvas
```

Um payload emitido por `exportPaint` com `v:3` seria **classificado como ponteiro**, reprovado pela
guarda do *writer* e **descartado** — perda de obra por colisão de nomenclatura. A proibição do
fundador não é estilística: é a evitação de um defeito real.

#### 11.5.3 Separação normativa adotada

| Eixo | Nome | Estado nesta fase |
|---|---|---|
| Schema do AsyncStorage do app | `APP_STORAGE_SCHEMA_VERSION` | **PRESERVADO E INTOCADO.** A Fase 6 **não** incrementa este número e **não** acrescenta degrau à escada de migração |
| Envelope de ponteiro de blob | `POINTER_VERSION` / campo `v` do ponteiro | **PRESERVADO, CONGELADO EM `3`.** O significado existente é mantido integralmente |
| **Formato do payload visual** | **`paintSchemaVersion`** (novo campo nomeado) | **NOVO EIXO.** O campo `v` **interno do payload do canvas permanece `2` para sempre** e passa a ser tratado como marca legada, nunca como discriminador de evolução |
| **Geometria lógica da obra** | **`layoutVersion`** (novo campo nomeado) | **NOVO EIXO.** Versiona a **semântica** dos campos de geometria (`W/H/imgX/imgY/imgW/imgH` no *raster*; `logicalW/logicalH` no vetor) — isto é, *como esses números devem ser interpretados* |

**Justificativa técnica dos nomes — escolhidos após confirmar a estrutura existente, não por
conveniência:** `paintSchemaVersion` nomeia exatamente o que `exportPaint`/`exportState` produzem
(o payload de pintura). `layoutVersion` nomeia exatamente o bloco que o ponteiro **já** chama de
`layout` em `drawingStorage.js:72-77` — o vocabulário é herdado do código, não inventado. Nenhum
dos dois é `v`, nenhum dos dois é `POINTER_VERSION`, nenhum dos dois é `schemaVersion` (nome já
ocupado por manifestos de *pack* em `packManifestService.js:67` e `packPublishMarker.js:39`).

**Regras invioláveis de leitura e escrita:**

1. `POINTER_VERSION` responde **"onde está o blob"** — nunca "como a pintura é interpretada".
2. `paintSchemaVersion` responde **"que campos o payload tem"** — nunca "onde ele está guardado".
3. `layoutVersion` responde **"o que as coordenadas significam"** — nunca "que campos existem".
4. `APP_STORAGE_SCHEMA_VERSION` responde **"que chaves o AsyncStorage tem"** — e não muda nesta fase.
5. **Nenhum** *reader*, *writer*, *validator*, migração ou teste pode inferir um eixo a partir de
   outro. Ausência de `paintSchemaVersion` ⇒ payload legado; ausência de `layoutVersion` ⇒
   geometria legada; e as duas ausências são **independentes**.
6. `G-VER-1`, `G-VER-2` e `G-VER-3` (§26) lacram estas regras.

### 11.6 Contrato do canvas *raster* (Colorir) — **alterado, aditivo**

| Ponte | Hoje | Alvo |
|---|---|---|
| `exportPaint` | `{v:2, W, H, imgX, imgY, imgW, imgH, rev, paintedPx, paintablePx, data}` — `W`/`H` são **píxeis da *viewport*** | `{v:2, paintSchemaVersion, layoutVersion, W, H, imgX, imgY, imgW, imgH, ...}` — os campos de geometria passam a expressar o **espaço lógico da obra**, e `layoutVersion` declara essa interpretação. **`v` permanece `2`** (§11.5.2). Todos os campos existentes continuam presentes |
| `validatePaint` / `loadPaint` | Portão de dimensão contra `W`/`H` **da janela** (`:548-553`) — rejeita com `LOAD_PAINT_INCOMPATIBLE` | O portão **deixa de reprovar por diferença de *viewport***. Passa a validar **integridade** (o payload é legível e coerente) e a **enquadrar** o espaço lógico na janela atual (§15.2). `LOAD_PAINT_INCOMPATIBLE` fica reservado a payload **ilegível**, e mesmo então **nunca** autoriza apagar (§41.5, regra 3) |
| `resize()` | Realoca `C`, `off`, `tmp` e **não** recalcula `baseD`, `paintD`, `imgX/Y/W/H`, `qBuf`/`visBuf` | Recalcula **apenas** a transformação de apresentação e redesenha. *Buffers* canônicos **nunca** são realocados por mudança de janela (`R3.5-c`) |

### 11.7 Contrato do canvas vetorial (Ateliê) — **alterado, aditivo**

`exportState` passa de `{v:2, strokes, stamps, bgColor}` para
`{v:2, paintSchemaVersion, layoutVersion, logicalW, logicalH, strokes, stamps, bgColor}`, com
traços e carimbos em coordenadas **lógicas canônicas**. **O campo `v` permanece `2`.**
`loadState` passa a ramificar por `paintSchemaVersion`/`layoutVersion` **antes** de cair no ramo
`d.v===2` existente, que é **preservado intacto** — exatamente como o ramo legado `d.ops`
(`AtelierCanvas.js:420-442`) já é preservado hoje.

**Obras `v:2` sem `logicalW`/`logicalH`** (todas as existentes) são tratadas pelo leitor de
compatibilidade determinístico da regra 6 de `Q8` (§41.5): a geometria é reconstruída a partir dos
metadados e dimensões intrínsecas realmente disponíveis, **nunca** assumindo a *viewport* atual como
se fosse a de criação.

---

## 12. Migração sem *big bang*

**Regra:** cada pacote é composto de passos que deixam o aplicativo **funcional e verde** ao fim de
cada um. Nenhum passo exige que o seguinte exista.

| Pacote | Passos incrementais |
|---|---|
| `F6-R3` | (1) `useSurfaceLifecycle` criado e consumido **só** por Colorir e Ateliê. (2) Instrumentação de término do processo — **observabilidade pura**, sem mudança de comportamento. (3) `R3.1` no mapa — preservação de posição, isolada. (4) **Leitor de compatibilidade** — somente leitura, sem gravar nada, regido pelas regras 1–6 de `Q8`; é o passo que já elimina a perda descrita em §15.1. (5) Espaço lógico do **vetor** (o dado já sobrevive). (6) Espaço lógico do ***raster***. (7) ***Writer* de gravação nova** — *write-forward* completo das regras 7–9 de `Q8`, **último** e isoladamente reversível |
| `F6-R2` | (1) `mapAnchor.js` criado e coberto por testes **sem nenhum consumidor** — mudança de zero risco. (2) `MapRegion` migra (pino). (3) Câmera inicial migra. (4) `onContentSize` migra. (5) `scrollPinIntoView` migra e o comentário falso morre. (6) Assinatura única. Entre (2) e (5), âncora antiga e nova coexistem **provadamente iguais** por comparação de captura |
| `F6-R1` | (1) `useWindowBand` criado sem consumidor. (2) Arquétipos criados sem consumidor. (3) Adoção **família a família**, uma superfície de cada vez, começando pela Editorial (menor risco, já tem coluna). (4) Barra lateral. (5) Orientação — **último passo do último pacote**, porque é o único que exige *build* nativo |

**Coexistência controlada:** durante `F6-R2`, é permitido que o valor antigo e o novo sejam
calculados lado a lado para comparação — desde que **um só** governe o comportamento e a duplicação
morra no passo (6). Ao fim de `F6-SG-B`, **nenhuma** derivação paralela sobrevive.

---

## 13. Preservação de compatibilidade

| Frente | Garantia |
|---|---|
| **Obra da criança já salva** | `SD-8` é bloqueador absoluto. `R3.5-k` está **satisfeito**: a compatibilidade foi definida **antes** de qualquer migração pela decisão `Q8` (§41.5). `R3.5-l`: **nenhuma migração destrutiva**; abrir é **estritamente leitura**; o arquivo antigo nunca é reescrito no lugar; a gravação é *write-forward* com validação de releitura antes da promoção |
| **Formato persistido** | Versionamento aditivo por **campo nomeado** (`paintSchemaVersion`, `layoutVersion`) nos dois motores, com o campo `v` **congelado** e o ramo antigo **preservado** — o mesmo padrão que `loadState` já usa para o formato `d.ops`. Quatro eixos de versão, quatro nomes distintos (§11.5) |
| **Envelope de armazenamento** | `POINTER_VERSION`/`v:3` de `drawingStorage.js` e `coloring60DrawingStorage.js` **preservado e intocado**; `APP_STORAGE_SCHEMA_VERSION` **não é incrementado** e nenhum degrau é acrescentado à escada de `storageMigrationService.js` |
| ***Lineart* histórico** | Nenhum *lineart* necessário para recompor uma obra anterior é removido, sobrescrito visualmente ou tornado inacessível enquanto houver obra que dependa dele (`Q8`, regra 10) |
| ***Rollback*** | O caminho de reversão continua capaz de **consumir** o formato anterior enquanto existir obra nesse formato (`Q8`, regra 9) |
| **Progresso, conquistas, *entitlements*** | Intocados |
| **Rota e navegação** | `Tab.Navigator` único; travessia de faixa **já é** *re-render*, não remontagem (auditoria §3.1). `R3.3` existe para **impedir regressão**, não para reconstruir |
| **Alvos de guia** | `adventures.sidebarTab`, `home.sidebarTab`, `atelier.sidebarTab`, `stars.sidebarTab`, `profile.sidebarTab` **permanecem registrados e mensuráveis** após `R1.4` |
| **Unificação de *breakpoint* do B1** | `P-30` e o portão `G-BP-1` não são reabertos: zero literais `768`, `productTheme.layout.tabletBreakpoint` continua derivando de `breakpoints.tablet` |
| **API pública de `adventureMap.js`** | Preservada; a assinatura única é introduzida com compatibilidade para trás |
| **Comportamento em telefone** | Faixa compacta é o caminho já validado. Todo passo tem controle negativo em telefone (§24) |

---

## 14. Ciclo de vida e preservação de estado — o contrato transversal (`F6-R3.2`)

### 14.1 O que precisa sobreviver, e a quê

| Estado | Rotação | *Resize* / Split View | Mudança de *viewport* | Centro de Controle | `AppState` → *background* | Retorno ao *foreground* | Término do processo de conteúdo |
|---|---|---|---|---|---|---|---|
| **Rota e pilha** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (é RN, não WebView) |
| ***Scroll*** do mapa | 🔧 `R3.1` | 🔧 `R3.1` | 🔧 `R3.1` | ✅ | ✅ | ✅ | — |
| *Scroll* de listas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| **Atividade / sessão de jogo** | ✅ | ⚠️ verificar | ⚠️ verificar | ✅ | ✅ | ✅ | — |
| **Passo do tour** | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ | 🔧 re-medir | — |
| **Áudio** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| **Desenho — Colorir** | ❌ **hoje corrompe** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | → 🔧 `R3.5-a..g` + `Q8` |
| **Desenho — Ateliê** | ❌ **hoje desloca** | ❌ | ❌ | ⚠️ | ⚠️ | ⚠️ | ❌ | → 🔧 `R3.5-h..l` |
| **Estado intermediário** (traço em curso, balde em curso, carimbo selecionado) | ❌ | ❌ | ❌ | ⚠️ | ⚠️ | ⚠️ | ❌ | → 🔧 §14.3 |

Legenda: ✅ já sobrevive · 🔧 alvo de `F6-R3` · ⚠️ a verificar na campanha física · ❌ hoje se perde.

### 14.2 `R3.1` — o mapa deixa de descartar a posição da criança

**Hoje:** `AdventureMapScreen.js:367` — `useEffect(() => { didInitScroll.current = false; }, [mapWidth])`.
Qualquer mudança de largura trata o *resize* como **primeira montagem**: `onContentSize` volta a
disparar e `scrollTo` puxa o mapa de volta para a âncora da câmera, descartando onde a criança
estava. `userScrolledRef` (`:201`) não é reposto, e `activeIdx` fica dessincronizado.

**Alvo:**

1. `onScroll` (`:398`) passa a gravar a posição corrente como **par lógico**
   `{ regionIndex, fracWithinRegion }` — derivado do `regionLayout` já existente (`:173`).
2. A troca de largura deixa de ser "primeira montagem". Em vez de repor `didInitScroll`, o `resize`
   agenda uma **reprojeção**: quando o novo `contentSize` chega, o *scroll* é restaurado para o
   **mesmo par lógico**, não para a câmera.
3. `userScrolledRef` é **preservado**; `activeIdx` é **reconciliado** a partir da posição
   restaurada, com a mesma sonda de `:403`.
4. Primeira montagem real (sem posição anterior) mantém **exatamente** o comportamento atual.

**Por que isto não depende de `F6-R2`:** a preservação é expressa em **fração de conteúdo**, que
precisa apenas do `regionLayout` — já calculado hoje. Ela **não** consulta a âncora de história.
Quando `F6-R2` chegar, ela troca o **alvo da câmera**, não o mecanismo de preservação.

### 14.3 Estado intermediário

Traço em curso, preenchimento em andamento e carimbo selecionado são estados **do motor**, não do
armazenamento. A regra: ao receber `onBackground` ou uma mudança de *viewport*, o motor **finaliza
o gesto em curso de forma atômica** (comita o traço no modelo) antes de reprojetar. Nunca há um
gesto "meio aplicado" atravessando uma mudança de janela.

---

## 15. Espaço lógico da obra × *viewport* — o núcleo de `SD-8`

> **Política congelada (`PF6D-D-CANVAS`, literal do fundador):** *"A obra da criança possui um
> espaço lógico próprio e imutável. A janela é apenas uma viewport desse espaço. Rotação, resize,
> multitarefa, AppState, Control Center, background/foreground ou qualquer mudança de viewport NÃO
> podem alterar, reinicializar ou corromper as coordenadas/dimensões lógicas da obra."*

**Congelar as telas criativas em retrato não é solução autorizada.** O caminho é o espaço lógico.

### 15.1 ⚠️ Achado desta rodada — a exposição do *raster* é maior do que a auditoria registrou

`COMPROVADO PELO CÓDIGO` · `src/components/ColoringCanvas.js`:

- `exportPaint` (`:485-487`) grava `W` e `H` que são **píxeis da *viewport*** (`W = cssW * DPR`).
- `loadPaint` (`:548-553`) aplica um **portão de dimensão**: se `savedW !== W || savedH !== H`,
  posta `LOAD_PAINT_INCOMPATIBLE` e **descarta a pintura**.
- `validatePaint` (`:513-521`) aplica o mesmo critério antes de oferecer "continuar".

**Consequência direta:** um desenho salvo em uma largura e reaberto em **outra** — e o iPad **já
gira hoje** — é classificado como incompatível e a tela abre **sem a pintura**. Isto não é
degradação estética nem hipótese: é leitura direta do portão de dimensão.

**Efeito no PLAN, sem reclassificar nada:** o achado **reforça** `P-152` e `P-164` e foi a razão
técnica da decisão **`Q8`** (§41.5). A resposta do fundador ataca este ponto de forma direta: o
portão de dimensão **deixa de reprovar por diferença de *viewport***, e incompatibilidade **nunca**
autoriza `clear`, `removeItem`, exclusão de blob ou substituição por canvas limpo. O passo (4) de
`F6-R3` (§12) — o leitor de compatibilidade, **somente leitura** — é o que fecha esta exposição, e
por isso vem **antes** de qualquer mudança de gravação. Nenhuma linha da matriz é alterada; nenhum
código é tocado nesta rodada.

### 15.2 Colorir — *raster* (`R3.5-a` a `R3.5-g`)

| Regra | Estado hoje | Alvo |
|---|---|---|
| `a` espaço lógico atrelado à **dimensão canônica da arte** | `baseD`, `paintD`, `off`, `tmp`, `qBuf`, `visBuf` alocados em píxeis da **janela** | Alocados nas dimensões **do traço** (`imgW`×`imgH`), fixas pela vida do desenho |
| `b` sem redimensionamento destrutivo do conteúdo | `C.width = W` limpa o *bitmap*; `resize()` não recompõe | `C` (canvas de **apresentação**) pode ser redimensionado à vontade — ele não guarda estado. Os *buffers* canônicos não são tocados |
| `c` sem recriar `paint`/*buffers* por mudança de tela | `allocBufs()` só roda em `initCanvas` (`:622`); a guarda de `:233` testa `!qBuf`, **nunca o tamanho** → escritas fora do limite silenciosamente descartadas | *Buffers* passam a ter tamanho **invariante**; a guarda por tamanho deixa de ser necessária, e a checagem passa a ser asserção defensiva |
| `d` *viewport* recalcula **só** a apresentação | `resize()` recalcula estruturas de dado | `resize()` recalcula `{scale, offsetX, offsetY}` e chama `renderAll()`. O `putImageData(paintD,0,0)` num `tmp` redimensionado — hoje a causa aritmética do desalinhamento — desaparece: a pintura é composta em espaço canônico e **projetada** com `drawImage` |
| `e` toque converte tela → canônico | Coordenadas de toque em píxeis da janela | `toCanonical(x,y)` do `useViewportProjection`; o *flood fill* passa a operar sempre em espaço canônico |
| `f` proporção preservada | Não há noção de proporção | *Letterbox*/*pillarbox* conforme a janela |
| `g` sem perda silenciosa, sem corrupção de balde, sem pintura desalinhada | As três ocorrem | Alvo verificável de `SD-8` — §26 e §28 |

### 15.3 Ateliê — vetor (`R3.5-h` a `R3.5-l`)

| Regra | Estado hoje | Alvo |
|---|---|---|
| `h` sem dependência permanente de píxeis da *viewport* | `:220`, `:232`, `:265`, `:292` gravam píxeis absolutos | Traços e carimbos gravados em coordenadas **lógicas canônicas** |
| `i` coordenadas canônicas ou normalizadas | ausente | Espaço lógico fixo por obra, registrado em `logicalW`/`logicalH` |
| `j` `resize` só reprojeta | `resize()` (`:452-456`) faz `C.width=W; C.height=H; render()` — o dado sobrevive (o modelo é vetorial), mas a **composição** é recortada e deslocada | `render()` aplica a projeção lógico→tela; a composição **se conserva** |
| `k` compatibilidade definida **antes** da migração | `exportState` grava `{v:2, strokes, stamps, bgColor}` — **sem nenhuma dimensão de canvas registrada** | ✅ **SATISFEITO** por `Q8` (§41.5). Sem dimensão de autoria, vale a regra 6: reconstrução **determinística** a partir dos metadados e dimensões intrínsecas realmente disponíveis; **nunca** usar a *viewport* atual como se fosse a original; ausência de evidência favorece **preservação** |
| `l` nenhuma migração destrutiva | — | O `stateJson` antigo **nunca** é reescrito no lugar. Abrir é leitura pura. O formato novo (`paintSchemaVersion`/`layoutVersion`) só é produzido na **próxima gravação explícita da criança**, por *write-forward* validado (`Q8`, regras 7–9) |

### 15.4 Regra absoluta

**`SD-8` é bloqueador.** Se qualquer passo de `F6-R3` não conseguir demonstrar **zero** perda,
desalinhamento, substituição indevida ou desaparecimento de obra infantil no roteiro físico, o
subportão `F6-SG-A` **não** é concedido e nada avança — nem `F6-R2`, nem `F6-R1`, nem `B2`.

---

## 16. `Q5` resolvida — onde vive a âncora canônica

**Decisão do PLAN:** **duas responsabilidades, dois módulos, uma geometria.**

| Responsabilidade | Módulo | Situação |
|---|---|---|
| **Derivação** da posição de uma história e do enquadramento | `src/services/mapAnchor.js` | **Novo**, puro, sem React |
| **Registro e medição de nós nativos** (`measureInWindow`) | `src/services/guideTargetRegistry.js` | **Existente, inalterado em responsabilidade** |
| **Fonte de coordenadas normalizadas** | `src/data/adventureMap.js` | **Existente, preservado** |

**Por que não estender `guideTargetRegistry` com a aritmética do mapa** — refinamento, não
reabertura, da recomendação `(a)` do *clarify* (que já mandava manter a derivação fora do registro):
o registro é, hoje, um mapa de **nós nativos** com `measureInWindow`; enxertar nele aritmética de
regiões e frações criaria um módulo de duas naturezas — exatamente o que o Princípio III proíbe — e
tornaria a geometria **intestável fora do React**. O que a governança pede ("estender o que existe
antes de criar paralelo") é honrado onde importa: **não** nasce um terceiro sistema de geometria; a
aritmética que já existe espalhada em cinco lugares é **consolidada**, e o registro continua fazendo
exatamente o que faz.

**Ficha do contrato** (responsabilidade · localização · API · entradas · saídas · consumidores ·
*ownership* · momento de medição · reação a *resize* · reação a orientação · integração futura com
F7): **§11.1**, tabela completa.

**F7 não é implementada agora.** O PLAN apenas garante que a assinatura exposta atende `P-157` sem
que F7 precise reabrir `F6-R2`.

---

## 17. As três faixas — `<600` · `600–899` · `>=900`

### 17.1 Contrato

| Faixa | Largura da **janela** | *Token* | Hoje | Alvo |
|---|---|---|---|---|
| **Compacta** | `< 600dp` | `breakpoints.phone` | Viva, 13 consumidores | Preservada como está |
| **Média** | `600 – 899dp` | `breakpoints.tablet` | Viva, mas **indistinguível** da expandida | Ganha composição própria por família |
| **Expandida** | `>= 900dp` | `breakpoints.tabletL` | **1 consumidor** (`ContentContainer.js:25`) | Ganha comportamento próprio em cada família (`R1.3`) |

**Nenhum quarto *breakpoint*. Nenhuma renomeação. Nenhuma duplicação.** A fonte da decisão é o
**tamanho da janela**, nunca o nome do aparelho (`D2`).

### 17.2 `Q4` resolvida — *token* a *token*

| *Token* | Consumidores hoje | Veredito do PLAN | Consumidor legítimo na nova arquitetura |
|---|---|---|---|
| `grid = { phone: 1, tablet: 2, tabletL: 3 }` | **0** | ✅ **PERTENCE — ganha consumidor real** | `HubSurface` usa `grid[band]` como **teto** de colunas; o valor efetivo é `min(grid[band], floor(larguraDisponível / larguraMínimaDeCartão))`. A faixa decide o teto; o **conteúdo real** decide o resto (§18) |
| `displayScaleTablet = 1.10` | **0** | ✅ **PERTENCE — ganha consumidor real** | Escala do tipo de exibição (`fontSize.display: 34`, `fontSize.displayXL: 40`, família `Fraunces`) nas faixas **média e expandida**, aplicada por um único auxiliar dos arquétipos Hub e Editorial |

**Sobre a forma de dois estados do `displayScaleTablet` num sistema de três faixas:** é
**intencional e mantido**. A faixa expandida ganha **composição** (mais colunas, painel de apoio),
não heróis maiores — um terceiro degrau tipográfico não tem justificativa de conteúdo. O *token*
permanece com o nome e o valor atuais.

**Nenhum dos dois é aposentado.** A direção congelada foi respeitada: nada foi removido
preventivamente, e nada permanece por inércia — cada um recebeu um consumidor **nomeado**. O portão
estático de §26 impede que voltem a ser "declarados e inertes" (natureza de `P-82`/`P-148`).

---

## 18. `Q3` resolvida — as quatro famílias e a faixa expandida

**Critério canônico, e não "tablet = duas colunas":**

> A composição deriva da **família** e do **conteúdo real**. O painel de apoio só aparece onde
> existe uma **hierarquia lista→detalhe real e persistente**. A grade só cresce enquanto os
> cartões mantiverem largura mínima legível.

| Família | Compacta `<600` | Média `600–899` | Expandida `>=900` | Fundamento |
|---|---|---|---|---|
| **Hub** — `HomeScreen`, `BrincarScreen`, `TrophiesScreen`, `AtelierGalleryScreen` | 1 coluna | Grade: `min(grid.tablet, cabimento real)` | Grade mais larga: `min(grid.tabletL, cabimento real)`. **Nunca** coluna estreita centralizada com vazio lateral | `D3` + `SD-3` |
| **Hub com hierarquia** — `AtelierGalleryScreen` (galeria → obra) | 1 coluna | Grade | **Painel de apoio** (lista + detalhe), coerente com `D10` | É a **única** superfície Hub com detalhe persistente por item |
| **Editorial** — `StoryDetailScreen`, `ReflectionScreen`, `PostStoryHubScreen`, `ParentAreaScreen` | Coluna única | Coluna com medida de linha preservada | Coluna **+ painel de apoio** com o excedente — nunca vazio | `D3`: medida de linha é o que manda |
| **Imersiva** — `StoryBookScreen`, Leitor, Colorir, Ateliê | Arte dominante + camada legível | Janela inteira | Janela inteira; a **capacidade** de livro aberto/painel de apoio (`D10`) fica pronta, mas a **composição** é entrega de **F9** | `D3` + §8 da *spec* |
| **Jogo** — `MonteACena*`, `ParesDoBeni`, `Palavrinhas`, `CadeAOvelhinha`, `QuizScreen` | Área jogável proporcional | Idem | Idem; excedente é **moldura**, nunca distorção do tabuleiro | `D3`. A adoção por tela e o `GameShell` são **F12A** |

**Proibição explícita mantida (`D4`):** nenhuma família — em especial a barra lateral — recebe
destinos, ícones, atalhos ou seções **inventados para preencher vazio**. Vazio se resolve por
**composição**.

**Fronteira de escopo, para não invadir fase alheia:** `F6-R1` entrega os **arquétipos** e prova
cada família com o conjunto mínimo de superfícies. A composição **final** do Brincar é `F12A`; a do
Leitor e da *Story Home* é `F9`; a conclusão visual do Colorir é `F9`.

**O que ainda é julgamento do fundador:** a **maquete** da faixa expandida das superfícies Hub e do
painel de apoio da Galeria — confirmação **visual** em `F6-SG-C`, com captura, exatamente como `Q3`
já previa. Isso **não** é pergunta nova: é o julgamento visual que `Q3` sempre reservou ao Portão.

---

## 19. Barra lateral (`F6-R1.4`)

| # | Defeito verificado | Linha | Alvo | Dono |
|---|---|---|---|---|
| 1 | `styles.sidebar: { width: 200 }` fixo — idêntico a 600dp e a 1366dp | `:125` | A largura estrutural sai do componente e passa à fonte canônica do *design system*, com semântica adaptativa — **`Q9` AUTORIZADA**, contrato em §19.1 | `F6-R1.4` |
| 2 | `navButtons: { gap: 2 }` sem `flex: 1` e sem ancoragem inferior ⇒ **~700pt de vazio vertical** em iPad retrato | `:196` | Distribuição vertical com `flex` e ancoragem; **zero destino novo** | `F6-R1.4` |
| 3 | `import { colors } from '../theme/colors'` — tema legado concorrente | `:4` | Passa a consumir `src/theme/tokens.js` | `F6-R1.4` |
| 4 | `navButton: paddingVertical 13` + ícone 26 ⇒ ≈52pt — **abaixo** do mínimo 56×56 de `RF-A7` | `:200`, `:209` | **NÃO tocado aqui** | **Bloco `B2`** (`AD-3`) |
| 5 | `progressLabel` 10px, `stars` 11px — **abaixo** do piso de 13px de `RF-C12` | `:192`, `:173` | **NÃO tocado aqui** | **Bloco `B2`** (`AD-3`) |

### 19.1 Contrato do *token* de barra lateral (`Q9` — autorizada, com restrições)

**A autorização não é para mover o número.** Transformar `width: 200` em `sidebarWidth: 200` e
declarar o problema resolvido **não cumpre `F6-R1.4`**: continuaria sendo uma largura única para
600dp e para 1366dp, e o vazio vertical de retrato permaneceria.

**A semântica precisa refletir o contrato adaptativo.** Os *tokens* devem expressar o cruzamento de
**papel de navegação** × **faixa**, e não uma constante única:

| Eixo | Valores |
|---|---|
| **Papel de navegação** | *rail* / barra lateral compacta (só ícone e rótulo curto) × barra lateral completa |
| **Faixa** | média `600–899dp` × expandida `>=900dp` |

**Forma final decidida tecnicamente em Tasks**, desde que **todas** as seis restrições sejam
cumpridas — e cada uma tem portão correspondente:

| # | Restrição | Verificação |
|---|---|---|
| 1 | Existe **uma única fonte canônica** (`src/theme/tokens.js`) | `G-SID-2` |
| 2 | **Nenhum novo *hardcode* distribuído** — nem em `TabletSidebar.js`, nem em `AppNavigator.js`, nem em arquétipo | `G-SID-2` |
| 3 | **Nenhum *design system* paralelo** criado; nada duplicado de `tokens.js` | `G-RSP-4` |
| 4 | A largura **não** é usada como substituto de medição real da *viewport*: quem precisa saber o espaço disponível **mede**; o *token* declara apenas a largura **estrutural** da navegação | `G-SID-3` + §41.4 |
| 5 | A solução funciona em **600–899** e em **>=900**, com composição distinta | `SD-4` + captura em `SG-C` |
| 6 | **Telefone compacto não sofre regressão** — a faixa compacta não consome estes *tokens* | `CN-1` |

**Fato verificado que motiva a restrição 5:** hoje `TabletSidebar.js:125` entrega a mesma largura
nas duas faixas; é exatamente essa indistinção que `R1.3` e `R1.4` existem para corrigir.

**Invariantes:** os cinco alvos de guia (`adventures.sidebarTab`, `home.sidebarTab`,
`atelier.sidebarTab`, `stars.sidebarTab`, `profile.sidebarTab`) **permanecem registrados e
mensuráveis** — a barra lateral é parte da geometria do tour, não decoração. A travessia do corte
continua sendo ***re-render*, não remontagem** (auditoria §3.1): `R3.3` protege isso contra
regressão.

**Geometria do *callout* do tour:** hoje a posição deriva de `width / TAB_DEFS.length + insets.bottom`
e é **condicionada a `!isTablet`**; no tablet a barra está à esquerda e essa aritmética não tem
equivalente. `F6-R1` fornece o equivalente lateral. **Qual história o tour aponta continua sendo F7.**

---

## 20. Relação com a infraestrutura nativa de orientação

### 20.1 Onde a orientação é decidida hoje — fatos

| Fato | Evidência |
|---|---|
| `app.json` é a **única** fonte de orientação | Não existem `app.config.js`/`.ts` nem diretório `plugins/`; `git diff 7c12987..HEAD -- app.json` é **vazio** |
| iOS base = retrato | `@expo/config-plugins/build/ios/Orientation.js:15-39` |
| **iPad já gira** | `ios/RequiresFullScreen.js:21-22, :55-67` escreve `UISupportedInterfaceOrientations~ipad` com as **quatro** orientações sempre que `supportsTablet` é verdadeiro e `requireFullScreen` é falso (o comentário cita a rejeição `ITMS-90474`) |
| Android tem **uma chave global** | `android/Orientation.js:24-35` — lido **nesta rodada, íntegro**: `getOrientation` consulta **apenas** `config.orientation` e escreve `android:screenOrientation` na `MainActivity`. **Não há variante por *idiom*, por qualificador de recurso ou por `android.orientation`** |

### 20.2 Situação de `D1` — quatro casos

| # | *Idiom* | Exigência | `HEAD` |
|---|---|---|---|
| 1 | iPhone | retrato | ✅ cumprido |
| 2 | Telefone Android | retrato | ✅ cumprido |
| 3 | iPad | retrato **e** paisagem | ✅ **já cumprido** |
| 4 | **Tablet Android** | retrato **e** paisagem | ❌ **VIOLADO** — vão único e real |

### 20.3 Comparação objetiva das vias (exigida por `RD-7`)

| Via | Mecanismo | Veredito do PLAN | Fundamento |
|---|---|---|---|
| **(A)** configuração CNG/nativa por plataforma e *idiom* | `expo.orientation` no `app.json` | ❌ **PROVADAMENTE INSUFICIENTE para o caso 4** | A chave é **global e única**. `portrait` viola o caso 4; `default` → `unspecified` liberaria **também o telefone Android**, violando o caso 2. Não existe terceiro valor que separe os dois. **iOS continua resolvido por (A) — lá nada precisa mudar** |
| **(B)** `expo-screen-orientation` | Trava/destrava em tempo de execução | ⚠️ **Candidata — com dois custos** | **Dependência nova** (aprovação prévia obrigatória) e necessidade de um sinal de *idiom* confiável; usar a largura corrente arrisca classificar telefone em paisagem como tablet, **proibido** por `F6-R1.1` |
| **(C)** *config plugin* próprio | Escreve qualificador de recurso Android (`values/` × `values-sw600dp/`) e faz `android:screenOrientation` referenciar esse recurso | ⭐ **Candidata preferida** | Usa a **noção de idioma do próprio sistema** (`smallestWidthDp`), sem código de tela, sem dependência de runtime e sem perguntar "sou um tablet?" — `D2` permanece verdadeira. Custo: cria `plugins/`, hoje inexistente, e depende de *build* nativo |
| **(D)** alternativa já compatível | Qualquer outra do runtime atual | ⚠️ mantida em aberto | Só entra se a prova de mecanismo revelar caminho mais simples |

**Regra de decisão, e ela não é agora.** A via vencedora deve, **cumulativamente**: cumprir `D1`
nos quatro casos · preservar multitarefa e redimensionamento no iPad · **evitar dependência nova se
não for necessária** · **nunca** classificar telefone em paisagem como tablet por largura · exigir
***build* nativo** quando a configuração nativa mudar.

**Sequência obrigatória:** a escolha ocorre **no início de `F6-R1`**, depois de `F6-SG-A` e
`F6-SG-B` concedidos, mediante **prova de mecanismo** em *build* controlado. **Nenhuma dependência
é instalada até lá**, e se a via vencedora exigir uma, ela passa por **aprovação prévia explícita**
e por `npx expo install`.

**`RD-4` — custo de ciclo:** mudança de configuração nativa exige *build* novo. Mitigação: agrupar
**todas** as mudanças de configuração da Fase 6 em **um único** *build*, no fim de `F6-R1`.

---

## 21. Riscos de regressão

| # | Risco | Onde nasce | Probabilidade | Impacto | Contenção |
|---|---|---|---|---|---|
| RG-1 | **Perda de obra já salva** ao introduzir espaço canônico | `loadPaint` portão de dimensão (§15.1) | **Reduzida de "alta" para "média"** — a política deixou de ser incógnita | **Máximo — `SD-8`, inalterado** | **`Q8` DECIDIDA** (§41.5): abrir é leitura pura; incompatibilidade nunca autoriza apagar; gravação só por *write-forward* validado; formato anterior nunca destruído; *lineart* histórico protegido. Verificação: portões `G-CMP-1`..`G-CMP-5`, matriz de compatibilidade obrigatória (§28.1) com acervo real, e passos (4) e (7) de §12 isolados e reversíveis. **O risco permanece aberto e com impacto máximo** — o que caiu foi a incerteza de decisão, não a exigência de prova |
| RG-2 | Deslocamento visível dos pinos ao unificar a âncora | `F6-R2` | Média | Médio | `RD-2`: comparação de captura **antes/depois** nas 20 histórias, nas três faixas; coexistência provada em §12 |
| RG-3 | Arquétipos viram *design system* paralelo | `F6-R1.2` | Média | Alto | `RD-3`: estender `AppScreen`/`ContentContainer`; proibido duplicar *tokens*; portão estático em §26 |
| RG-4 | Remontagem incidental na travessia de faixa | `F6-R1` | Baixa | Alto | `R3.3`; o *shell* já está correto e o portão protege contra regressão |
| RG-5 | Regressão em telefone (faixa compacta), hoje validada sem anomalia | `F6-R1` | Média | Alto | Controle negativo em telefone a cada passo (§24) |
| RG-6 | Perda de mensurabilidade dos alvos de guia ao mexer na barra lateral | `F6-R1.4` | Média | Médio | Portão estático que exige os cinco `registerGuideTarget`; vídeo do tour em `SG-C` |
| RG-7 | Custo de *scroll* no mapa (caminho quente) | `R3.1` | Baixa | Médio | Duas operações aritméticas, sem alocação nem `setState` extra; medir antes de qualquer refatoração ampla |
| RG-8 | Declarar causa provada sem prova | `P-164` | Média | **Alto — de credibilidade** | `FD-12`; §6.4; nenhum artefato pode escrever causalidade confirmada |
| RG-9 | Liberar orientação antes de `SG-A` | ordem executiva | Baixa | **Máximo** | `RD-1`; a orientação é o **último passo do último pacote** (§12) |
| RG-10 | *Build* nativo consumir o ciclo | `F6-R1.1` | Alta | Baixo | `RD-4`: um único *build* agrupando todas as mudanças de configuração |
| **RG-11** | **Colisão de versionamento** — dois significados concorrentes para o mesmo discriminador | `drawingStorage.js` (`POINTER_VERSION`=3), `storageKeys.js` (`APP_STORAGE_SCHEMA_VERSION`=3), payload do canvas (`v`=2) e `ColoringScreen.js:224` | **Era alta** — a proposta anterior do PLAN a materializava | **Máximo** — payload seria descartado pela guarda do *writer* (§11.5.2) | **Eliminada por projeto:** quatro eixos, quatro nomes (`APP_STORAGE_SCHEMA_VERSION` · `POINTER_VERSION`/`v` · `paintSchemaVersion` · `layoutVersion`); `v` do canvas congelado em `2`; portões `G-VER-1`..`G-VER-3` |
| **RG-12** | ***Token* de largura usado como substituto de medição real** da *viewport* | `F6-R1.4` | Média | Alto — reintroduz geometria estimada, o mesmo defeito que `R2.3` corrige | Restrição 4 de §19.1; portão `G-SID-3`; a regra geral de "medir o que pode ser medido" do §41.4 |
| **RG-13** | ***Write-forward* incompleto** — promoção antes da validação de releitura | passo (7) de §12 | Média | **Máximo — `SD-8`** | `Q8` regra 8: criar → persistir → validar integridade → **provar releitura** → só então promover. Falha em qualquer etapa mantém a representação anterior como fonte válida. Casos 12 e 13 da matriz (§28.1) e portão `G-CMP-4` |

---

## 22. Matriz de dependências

| Item | Depende de | É pré-requisito de | Bloqueante? |
|---|---|---|---|
| `useSurfaceLifecycle` | — | Colorir/Ateliê com ciclo de vida | Não |
| Instrumentação de término do processo | `useSurfaceLifecycle` | Confirmação/refutação de `P-164` em `SG-A` | Não (é observabilidade) |
| `R3.1` preservação do mapa | `regionLayout` (já existe) | `SD-7` | Não |
| `R3.5` espaço lógico vetorial | `useViewportProjection` | `SD-8` | **Sim** |
| **Leitor de compatibilidade** (somente leitura) | contrato `Q8` regras 1–6 | espaço lógico *raster* e vetorial; fecha §15.1 | **Sim** |
| `R3.5` espaço lógico *raster* | `useViewportProjection` + leitor de compatibilidade | `SD-8` | **Sim** |
| ***Writer* write-forward** | espaço lógico dos dois motores + contrato `Q8` regras 7–9 | gravação no formato novo | **Sim** |
| **Eixos de versionamento separados** (§11.5) | — | leitor, *writer*, *validator*, migração e testes | **Sim** |
| **`F6-SG-A`** | tudo de `F6-R3` + roteiro físico + **matriz de compatibilidade (§28.1)** | `F6-R2` | **Sim** |
| `mapAnchor.js` | — | `R2.1`–`R2.5` | Não |
| `R2.1`–`R2.5` | `mapAnchor.js` | `SD-5`, `SD-6`; infraestrutura de `P-157` | **Sim** |
| **`F6-SG-B`** | tudo de `F6-R2` + captura comparativa | `F6-R1` | **Sim** |
| `useWindowBand` | — | arquétipos | Não |
| Arquétipos | `useWindowBand` | `R1.3`, `SD-2`, `SD-3` | Não |
| `R1.4` barra lateral | arquétipos + *tokens* semânticos de §19.1 | `SD-4` | **Sim** |
| `R1.1` orientação | **`F6-SG-A` concedido** + prova de mecanismo + *build* | `SD-1` | **Sim** |
| **`F6-SG-C`** | tudo de `F6-R1` + campanha física | apresentação de `F6-SG-D` | **Sim** |
| **`F6-SG-D`** | `SG-A` + `SG-B` + `SG-C` + §37 | Bloco `B2` | **Sim — e não concedido** |
| `F7` / `P-157` | `F6-R2` (API de âncora) | — | Fora deste delta |
| `F9` / `P-164` (porção de produto) | `F6-R3` (fundação) | — | Fora deste delta |

---

## 23. Testes automatizados

**Restrição real do repositório, verificada:** não existe Jest nem *runner* de testes. Os *scripts*
disponíveis são `npm run smoke` (`scripts/smoke.js` — asserções estáticas sobre o texto do código,
com `check(label, condition, detail)` e `codeOf()` para asserções de ausência) e utilitários Node
avulsos (`scripts/audio-audit-self-test.js`, `scripts/testing/packInstallHarness.js`).
**Introduzir um *runner* seria dependência nova e não está autorizado.** O plano de testes usa,
portanto, os dois mecanismos que já existem — e é justamente por isso que `mapAnchor.js` nasce
**puro**.

| ID | Tipo | Alvo | Mecanismo | Pacote |
|---|---|---|---|---|
| `TA-1` | Arnês Node puro | `mapAnchor.getStoryAnchor` — mesma entrada ⇒ mesma saída para pino, câmera e `scrollPinIntoView` | `scripts/testing/mapAnchorHarness.js` (**novo**, padrão de `packInstallHarness.js`) | `R2` |
| `TA-2` | Arnês Node puro | `computeCameraTarget` — *clamp* em `[0, contentH - vp]`; nunca produz vazio no rodapé | idem | `R2` |
| `TA-3` | Arnês Node puro | Assinatura única: história **sem** coordenada explícita produz a **mesma** fração para pino e para *scroll* (mata a divergência `LATENTE`) | idem | `R2` |
| `TA-4` | Arnês Node puro | Projeção de *viewport*: `toScreen(toCanonical(p)) == p` dentro da tolerância, em retrato, paisagem e Split View | `scripts/testing/viewportProjectionHarness.js` (**novo**) | `R3` |
| `TA-5` | Arnês Node puro | Ida e volta do formato: payload com `paintSchemaVersion`/`layoutVersion` → serializa → desserializa ⇒ coordenadas lógicas idênticas; payload legado (sem esses campos) continua carregável | idem | `R3` |
| `TA-11` | Arnês Node puro | **Ortogonalidade dos eixos de versão**: variar `POINTER_VERSION`, `paintSchemaVersion` e `layoutVersion` de forma independente não confunde *reader*, *writer* nem *validator*; nenhum eixo é inferido de outro (§11.5, regra 5) | `scripts/testing/artworkVersionHarness.js` (**novo**) | `R3` |
| `TA-12` | Arnês Node puro | **Leitor de compatibilidade determinístico**: mesma obra legada + mesmos metadados ⇒ **mesma** geometria reconstruída, em qualquer *viewport*; a *viewport* atual **nunca** entra na reconstrução (`Q8`, regra 6) | idem | `R3` |
| `TA-13` | Arnês Node puro | ***Write-forward***: falha injetada em cada etapa (criar · persistir · validar · reler) deixa a representação **anterior** como fonte válida e **não destrói nada** (`Q8`, regras 8 e 9) | idem | `R3` |
| `TA-6` | Portão estático | Ausência de `Dimensions.get` em `src/` (`SD-11`) | `scripts/smoke.js` | todos |
| `TA-7` | Portão estático | Nenhum *breakpoint* novo; `breakpoints` continua fonte única; `G-BP-1` preservado | `scripts/smoke.js` | `R1` |
| `TA-8` | Portão estático | `grid` e `displayScaleTablet` têm **pelo menos um** consumidor real | `scripts/smoke.js` | `R1` |
| `TA-9` | Portão estático | Os cinco `registerGuideTarget` da barra lateral continuam presentes | `scripts/smoke.js` | `R1` |
| `TA-10` | Portão estático | `TabletSidebar` **não** importa mais `theme/colors` | `scripts/smoke.js` | `R1` |

---

## 24. Controles negativos

Controle negativo = prova de que a mudança **não** afetou o que não devia.

| ID | Controle | Como se verifica |
|---|---|---|
| `CN-1` | **Telefone em retrato não muda em nada** em nenhum dos três pacotes | Captura antes/depois de Início, Mapa, Livrinho, Colorir, Ateliê e um jogo, na faixa compacta |
| `CN-2` | Primeira montagem do mapa mantém o comportamento atual (`comece_aqui` no topo) | `TA-2` + captura de abertura |
| `CN-3` | Desenho **sem** mudança de janela continua carregando exatamente como hoje | Abrir e continuar um desenho salvo, sem girar |
| `CN-4` | Rota, áudio e sessão de jogo **não** são afetados por `R3.1` | Roteiro físico §28 |
| `CN-5` | Nenhum destino novo aparece na barra lateral (`D4`) | Inspeção visual + contagem de itens |
| `CN-6` | Nenhuma tela remonta na travessia de 600dp | *Log* de montagem em desenvolvimento + `R3.3` |
| `CN-7` | `P-30`/`G-BP-1` continuam verdes — zero literais `768` | `npm run smoke` |
| `CN-8` | Nenhum *asset*, manifesto, história, conquista ou regra de acesso foi tocado | `git diff --cached --name-only` em cada *commit* |

---

## 25. Testes mutantes

Mutante = introduzir deliberadamente o defeito antigo e **exigir que algum portão falhe**. Se
nenhum portão falhar, o portão é decorativo.

| ID | Mutação injetada | Portão que **tem** de falhar |
|---|---|---|
| `MT-1` | Recolocar `useEffect(() => { didInitScroll.current = false; }, [mapWidth])` | Roteiro físico de rotação com posição preservada (§28) |
| `MT-2` | Voltar `scrollPinIntoView` a usar um fator próprio diferente do canônico | `TA-1` |
| `MT-3` | Voltar `getStoryMapCoord` a ter duas assinaturas | `TA-3` |
| `MT-4` | Voltar `initialOffsetY` à estimativa com os `56` fantasma | `TA-2` + captura em iPad (`SD-6`) |
| `MT-5` | Realocar `paintD`/`qBuf` dentro de `resize()` | `TA-4`/`TA-5` + roteiro de rotação com desenho em curso |
| `MT-6` | Voltar a gravar coordenadas absolutas de *viewport* no Ateliê | `TA-5` |
| `MT-7` | Reintroduzir `Dimensions.get` | `TA-6` |
| `MT-8` | Remover o consumidor de `grid` | `TA-8` |
| `MT-9` | Reimportar `theme/colors` na barra lateral | `TA-10` |
| `MT-10` | Remover um `registerGuideTarget` da barra lateral | `TA-9` |
| `MT-11` | Reintroduzir literal `768` | `CN-7` / `G-BP-1` |
| `MT-12` | Emitir o payload do canvas com `v:3` (a colisão proibida) | `G-VER-1` + `TA-11` |
| `MT-13` | Fazer o leitor apagar, limpar ou substituir por canvas branco ao encontrar incompatibilidade de dimensão | `G-CMP-1` + caso 14 da matriz (§28.1) |
| `MT-14` | Promover a nova representação **antes** de validar a releitura | `G-CMP-4` + `TA-13` + casos 12 e 13 da matriz |
| `MT-15` | Reintroduzir largura estrutural de barra lateral fora de `tokens.js` | `G-SID-2` |
| `MT-16` | Derivar largura disponível a partir do *token* de barra lateral em vez de medir | `G-SID-3` |

**Regra:** cada mutante é injetado, o portão é observado falhando, o mutante é **revertido** e o
resultado é registrado. Nenhum mutante é *commitado*.

---

## 26. Portões que falham se um defeito conhecido reaparecer

Todos entram em `scripts/smoke.js`, seguindo o padrão existente (`check` + `codeOf` para asserções
de ausência, que ignoram comentários).

| Portão | Asserção | Defeito que lacra |
|---|---|---|
| `G-LFC-1` | `AdventureMapScreen.js` **não** contém `didInitScroll.current = false` em efeito disparado por largura | `F6-LFC-01` / `P-152` |
| `G-LFC-2` | `ColoringScreen.js` e `AtelierCanvasScreen.js` consomem `useSurfaceLifecycle` | ausência de `AppState` nas telas de canvas |
| `G-LFC-3` | `ColoringCanvas.js` e `AtelierCanvas.js` declaram `onContentProcessDidTerminate` **e** `onRenderProcessGone` | ausência de defesa (`P-164`) |
| `G-CVS-1` | `ColoringCanvas.js` **não** realoca `qBuf`/`visBuf`/`paintD` dentro de `resize()` | corrupção do balde e desalinhamento |
| `G-CVS-2` | O `stateJson` exportado pelo Ateliê declara `logicalW`/`logicalH` | composição deslocada |
| `G-MAP-1` | Existe **exatamente uma** constante de enquadramento, em `mapAnchor.js`; `AdventureMapScreen.js` **não** contém literais `0.58` nem `0.5` de enquadramento | `F6-MAP-ANCHOR-01` / `P-154` |
| `G-MAP-2` | `AdventureMapScreen.js` e `MapRegion.js` **não** chamam `getStoryMapCoord` diretamente — só `mapAnchor` | cinco derivações |
| `G-MAP-3` | `initialOffsetY` **não** contém a subtração literal `56` | mira errada no tablet |
| `G-RSP-1` | Zero `Dimensions.get` em `src/` | `SD-11` |
| `G-RSP-2` | `grid` e `displayScaleTablet` têm consumidor | `P-82`/`P-148` |
| `G-RSP-3` | Zero `Platform.isPad` e zero `expo-device` decidindo *layout* | `D2` |
| `G-SID-1` | `TabletSidebar.js` importa `theme/tokens` e **não** `theme/colors`; mantém os cinco alvos de guia | `F6-SID-01` / `P-153` |
| **`G-SID-2`** | `TabletSidebar.js`, `AppNavigator.js` e os arquétipos **não** contêm literal de largura estrutural de navegação; a largura vem de `tokens.js` | `Q9` restrições 1 e 2 |
| **`G-SID-3`** | Nenhum consumidor deriva "espaço disponível" subtraindo o *token* de largura — quem precisa do espaço **mede** | `Q9` restrição 4 · `RG-12` |
| **`G-RSP-4`** | Nenhum módulo de *layout* redeclara valores já presentes em `tokens.js` (sem *design system* paralelo) | `Q9` restrição 3 · `RD-3` |
| **`G-VER-1`** | O payload emitido por `exportPaint`/`exportState` **nunca** contém `v: 3`; o campo `v` permanece `2` | **`RG-11`** · `ColoringScreen.js:224` |
| **`G-VER-2`** | `POINTER_VERSION` continua `3` em `drawingStorage.js` e `coloring60DrawingStorage.js`; `APP_STORAGE_SCHEMA_VERSION` continua `3` e a escada de `storageMigrationService.js` não ganha degrau | preservação do envelope existente |
| **`G-VER-3`** | *Reader*, *writer*, *validator* e testes referenciam `paintSchemaVersion` e `layoutVersion` por **nome**, nunca inferindo um eixo do outro | §11.5 regra 5 |
| **`G-CMP-1`** | O caminho de **abertura** de obra não contém `clear`, `removeItem`, exclusão de blob nem substituição por canvas limpo | **`Q8` regras 2 e 3** |
| **`G-CMP-2`** | Abrir uma obra **não** grava: nenhuma escrita de AsyncStorage nem de arquivo no caminho de leitura | **`Q8` regras 2 e 7** |
| **`G-CMP-3`** | A projeção de compatibilidade é do tipo `contain` com *letterbox*; ausência de esticamento, de recorte silencioso e de transformação por camada divergente | **`Q8` regra 5** |
| **`G-CMP-4`** | A gravação nova promove a representação **somente após** validar integridade e provar releitura; falha em qualquer etapa preserva a anterior | **`Q8` regras 8 e 9** · `RG-13` |
| **`G-CMP-5`** | O caminho de limpeza/reset **não** remove *lineart* histórico enquanto houver obra que dependa dele | **`Q8` regra 10** |
| **`G-MAP-4`** | Toda geometria mensurável (barra lateral, área segura, sobreposições) é **medida**; o *framing* residual é único, nomeado e justificado no próprio código | §41.4 · trava do Portão 2 |
| `G-BP-1` | **preservado como está** | `P-30` |

---

## 27. Critérios de entrada e de saída de cada subportão

| Subportão | Entrada | Saída (todos os itens, sem exceção) |
|---|---|---|
| **`F6-SG-A`** (`F6-R3`) | Portões Humanos 2 e 3 concedidos; `HEAD` limpo; *smoke* e *doctor* verdes | `R3.1`–`R3.6` implementados · `TA-4`, `TA-5`, `TA-11`, `TA-12`, `TA-13` verdes · `G-LFC-*`, `G-CVS-*`, **`G-VER-1..3`** e **`G-CMP-1..5`** verdes · `MT-1`, `MT-5`, `MT-6`, **`MT-12`, `MT-13`, `MT-14`** observados falhando e revertidos · roteiro físico §28 completo em iPad · **matriz de compatibilidade do §28.1 integralmente executada com o acervo real, com os quatro invariantes ZERO satisfeitos** · **`SD-8` demonstrado: zero perda, zero desalinhamento, zero substituição indevida, zero desaparecimento** · `SD-7` demonstrado · instrumentação de término do processo ativa e com registro anexado (evento capturado **ou** "não reproduzido") · `CN-1`, `CN-3`, `CN-4` verdes · *smoke* e *doctor* verdes · revisão independente · **aprovação explícita do fundador** |
| **`F6-SG-B`** (`F6-R2`) | **`SG-A` concedido** | `R2.1`–`R2.5` implementados · `TA-1`, `TA-2`, `TA-3` verdes · `G-MAP-*` verdes · `MT-2`, `MT-3`, `MT-4` observados falhando e revertidos · comparação de captura das **20** histórias, nas **três** faixas, antes/depois (`RD-2`) · **`SD-5`** (pino, alvo de toque, brilho, *scroll* e holofote na mesma âncora) · **`SD-6`** (câmera acerta a mira no iPad) · **`G-MAP-4`: toda geometria mensurável medida** (barra lateral, área segura, sobreposições) e **no máximo uma** constante de enquadramento residual, nomeada, justificada no código e validada nas três faixas — confirmada visualmente pelo fundador · `CN-2` verde · *smoke* e *doctor* verdes · **aprovação explícita** |
| **`F6-SG-C`** (`F6-R1`) | **`SG-B` concedido**; via de orientação escolhida com prova de mecanismo; dependência, se houver, **aprovada previamente** | `R1.1`–`R1.4` implementados · `G-RSP-1..4`, `G-SID-1`, **`G-SID-2`, `G-SID-3`** verdes · as **6 restrições de §19.1** cumpridas · `MT-7`–`MT-11`, **`MT-15`, `MT-16`** observados falhando e revertidos · **`SD-1`** nos quatro casos (ver §33 para a rota condicional do caso 4) · **`SD-2`**, **`SD-3`**, **`SD-4`** com captura · **`SD-9`** (Split View e Slide Over) · vídeo do tour em telefone **e** iPad com os alvos da barra lateral medidos · `CN-1`, `CN-5`, `CN-6` verdes · *build* nativo único gerado e validado · *smoke* e *doctor* verdes · **aprovação explícita** |
| **`F6-SG-D`** | §37 | **Não é objeto deste PLAN.** Portão separado, não concedido |

---

## 28. Sequência de validação física

**Cada passo é executado com desenho em andamento no Colorir e no Ateliê, e com o acervo real de
desenhos já salvos do aparelho.** Registro em vídeo, não só em captura.

| # | Ação | Observar | Subportão |
|---|---|---|---|
| 1 | Abrir o mapa, rolar até um ponto arbitrário, **girar** | A posição **permanece**; a região ativa acompanha; "Ver mapa" abre a região certa | `SG-A` |
| 2 | Girar de volta | Idem, sem salto | `SG-A` |
| 3 | Colorir: pintar, **girar**, continuar pintando | Traço e pintura **alinhados**; balde funciona; **nada** desaparece | `SG-A` |
| 4 | Colorir: pintar, **Centro de Controle**, voltar | Pintura intacta; nenhum recarregamento silencioso; registro de instrumentação | `SG-A` |
| 5 | Colorir: pintar, ir a segundo plano, esperar, voltar | Idem — e se o processo de conteúdo terminar, a recuperação preserva a obra | `SG-A` |
| 6 | Colorir: **Split View**, arrastar o divisor, sair | Idem sob larguras variáveis contínuas | `SG-A` / `SD-9` |
| 7 | **Abrir um desenho salvo antes da mudança** e continuar | **Carrega**, alinhado — a regressão de `Q8` é aqui | `SG-A` |
| 8 | Ateliê: desenhar, carimbar, **girar** | Composição **conservada** (não recortada nem deslocada) | `SG-A` |
| 9 | Ateliê: abrir obra `v:2` antiga, girar, salvar, reabrir | Nenhuma perda; gravação *write-forward* | `SG-A` |
| 10 | Jogo em andamento: girar e multitarefa | Sessão sobrevive | `SG-A` / `SD-7` |
| 11 | Áudio tocando: girar, segundo plano, voltar | Sem interrupção anômala | `SG-A` |
| 12 | Mapa: abertura em iPad, retrato e paisagem | Câmera **acerta a mira**; sem os 56pt fantasma | `SG-B` |
| 13 | Tour completo, telefone e iPad | Pino, brilho e holofote **coincidem**; barra lateral medida | `SG-B` / `SG-C` |
| 14 | As 20 histórias, três faixas, antes/depois | Nenhum deslocamento inaceitável | `SG-B` |
| 15 | Percorrer as quatro famílias nas três faixas | Composições **distintas**; sem coluna estreita com vazio | `SG-C` |
| 16 | Barra lateral em retrato e paisagem | Sem vazio acumulado; sem destino novo | `SG-C` |
| 17 | Regressão completa em **telefone** | Nada mudou | `SG-A`, `SG-B`, `SG-C` |

---

## 28.1 Matriz de compatibilidade obrigatória (`Q8`)

**Obrigação futura de teste, normativa.** Nenhum item é opcional. Toda a matriz é executada com o
**acervo real** de desenhos do aparelho, e sua conclusão integral é **critério de saída de
`F6-SG-A`** (§27).

| # | Caso | O que se executa | O que se verifica | Verificação automática |
|---|---|---|---|---|
| 1 | **Obra antiga em retrato** | Abrir obra criada antes da mudança, em retrato | Abre com a pintura **presente** e alinhada ao *lineart* | `TA-12`, `G-CMP-1` |
| 2 | **Mesma obra em paisagem** | Girar com a obra aberta | Proporção preservada, `contain` + *letterbox*; tinta e *lineart* seguem juntos | `TA-4`, `G-CMP-3` |
| 3 | **Retorno a retrato** | Girar de volta | Estado idêntico ao caso 1; nenhuma deriva acumulada | `TA-4` |
| 4 | ***Viewport* menor** | Split View estreito / Slide Over | Nada some; nada é recortado silenciosamente | `G-CMP-3` |
| 5 | ***Viewport* maior** | Tela cheia em paisagem | Nada é esticado; moldura em vez de distorção | `G-CMP-3` |
| 6 | **Reabertura após fechar o app** | Encerrar o app, reabrir, abrir a obra | Obra íntegra; nenhuma gravação ocorreu no ciclo anterior | `G-CMP-2` |
| 7 | ***Background* e *foreground*** | Sair e voltar com a obra aberta | Obra íntegra; nenhum recarregamento destrutivo | `G-LFC-2` |
| 8 | **Centro de Controle** | Abrir e fechar o Centro de Controle | Idem | `G-LFC-2` |
| 9 | **Término do processo de conteúdo** | Quando reproduzível no aparelho | Recuperação preserva a obra; evento **instrumentado** e registrado (`FD-12`: sem declarar causa provada) | `G-LFC-3` |
| 10 | **Obra sem modificação** | Abrir e fechar sem desenhar | **Bytes persistidos idênticos** antes e depois — abrir não migra, não promove, não reescreve | `G-CMP-2` |
| 11 | **Obra modificada e salva no formato novo** | Desenhar e salvar | Nova representação criada, validada, relida e **só então** promovida | `G-CMP-4`, `TA-13` |
| 12 | **Falha durante a gravação nova** | Falha injetada em criar · persistir · validar · reler | Representação **anterior** continua sendo a fonte válida; nada destruído | `TA-13`, `G-CMP-4` |
| 13 | ***Rollback*** | Reverter para a versão anterior do código com obras já gravadas no formato novo e no antigo | O caminho revertido **consome** o formato anterior; nenhuma obra fica órfã | `TA-13` |
| 14 | **Formato legado** | Obra `v1`/`v2` sem geometria completa | Reconstrução **determinística** a partir dos metadados e dimensões intrínsecas disponíveis; **jamais** usando a *viewport* atual como se fosse a original; ausência de evidência favorece preservação | `TA-12` |
| 15 | **Payload visual atual** | Obra no formato de pintura vigente | Lida e enquadrada corretamente; `paintSchemaVersion` ausente ⇒ tratada como legada, sem erro | `TA-11` |
| 16 | **Envelope de armazenamento atual** | Obra guardada como ponteiro `v:3` de blob | Resolvida normalmente; `POINTER_VERSION` **intocado**; blob nunca excluído por incompatibilidade visual | `G-VER-2`, `G-CMP-1` |
| 17 | **Novo schema lógico** | Obra gravada com `paintSchemaVersion` + `layoutVersion` | Lida, reprojetada e regravada sem perda; eixos de versão nunca confundidos | `TA-11`, `G-VER-3` |

### Invariantes — válidos em **todos** os casos aplicáveis

| Invariante | Significado operacional |
|---|---|
| **ZERO perda de píxeis da criança** | Nenhum píxel pintado desaparece em nenhuma transição da matriz |
| **ZERO associação da tinta ao *lineart* errado** | Tinta e contorno são transformados pela **mesma** geometria; é proibido transformar camadas com geometrias diferentes |
| **ZERO promoção destrutiva** | Nenhuma representação nova substitui a anterior antes de validada e relida; falha nunca destrói o que existia |
| **ZERO abertura silenciosa como canvas branco quando existe obra recuperável** | Se há obra recuperável, ela é recuperada; canvas branco só quando **de fato** não há obra |

**Violação de qualquer invariante em qualquer caso ⇒ `F6-SG-A` NÃO é concedido**, e nada avança —
nem `F6-R2`, nem `F6-R1`, nem `B2`.

---

## 29. Critérios de aceitação — **iPhone**

| # | Critério |
|---|---|
| 1 | Continua em **retrato** — `D1` caso 1 preservado, sem mudança de configuração |
| 2 | Faixa **compacta** com composição idêntica à de hoje em todas as superfícies (`CN-1`) |
| 3 | Mapa preserva a posição em Split-Screen-equivalente? **N/A** — mas preserva na travessia de largura por teclado/acessibilidade |
| 4 | Colorir e Ateliê sobrevivem a Centro de Controle, segundo plano e retorno |
| 5 | Tour e holofote coincidem com o pino |
| 6 | Nenhum telefone em paisagem é tratado como tablet |

## 30. Critérios de aceitação — **iPad em retrato**

| # | Critério |
|---|---|
| 1 | Faixa **média** ou **expandida** conforme a largura real da janela, nunca conforme o modelo |
| 2 | Barra lateral **sem vazio vertical acumulado** e **sem destino novo** (`SD-4`) |
| 3 | Nenhuma superfície com coluna estreita centralizada e vazio lateral (`SD-3`) |
| 4 | Mapa abre com a mira correta — **sem** os 56pt fantasma (`SD-6`) |
| 5 | Desenho em andamento sobrevive a Centro de Controle e a segundo plano (`SD-8`) |
| 6 | Desenho **já salvo** carrega corretamente (`Q8`) |

## 31. Critérios de aceitação — **iPad em paisagem**

| # | Critério |
|---|---|
| 1 | Faixa **expandida** com composição **própria** por família (`SD-2`) |
| 2 | Editorial: coluna + **painel de apoio**, nunca vazio (`SD-3`) |
| 3 | Hub: grade que cresce por faixa **e** por conteúdo real; Galeria com painel de apoio (§18) |
| 4 | Imersiva ocupa a janela inteira; Jogo preserva proporção com moldura |
| 5 | **Rotação retrato↔paisagem preserva** rota, *scroll* do mapa, áudio, sessão de jogo, passo de tour e **a obra da criança** (`SD-7`, `SD-8`) |
| 6 | Pino, alvo de toque, brilho, *scroll* e holofote coincidem (`SD-5`) |

## 32. Critérios de aceitação — ***resize*** e multitarefa

| # | Critério |
|---|---|
| 1 | Split View e Slide Over não quebram *layout* nem estado (`SD-9`) |
| 2 | Arrastar o divisor produz larguras **contínuas**: nenhuma trava, nenhum salto, nenhuma remontagem (`R3.3`) |
| 3 | Travessia de `600dp` e de `900dp` durante o arrasto muda **composição**, nunca **estado** |
| 4 | Canvas em uso durante o arrasto: **zero** perda, **zero** desalinhamento (`SD-8`) |
| 5 | Mapa restaura a mesma posição lógica após cada mudança de largura (`R3.1`) |
| 6 | Gesto em curso é comitado atomicamente antes da reprojeção (§14.3) |

## 33. Critérios futuros — **tablet Android físico**

**Estado:** nenhum tablet Android físico está disponível (P8). O caso 4 de `D1` é o **único vão real**.

| # | Critério, para quando houver aparelho |
|---|---|
| 1 | Retrato **e** paisagem liberados no tablet, com o **telefone Android permanecendo em retrato** |
| 2 | A distinção provém da **configuração de plataforma** (qualificador de recurso do sistema), nunca de código de tela |
| 3 | Nenhum telefone Android em paisagem é classificado como tablet |
| 4 | Rotação preserva rota, *scroll*, áudio, sessão, tour e **a obra** — mesmo roteiro do §28 |
| 5 | `onRenderProcessGone` instrumentado e observado |
| 6 | Multi-janela do Android equiparado ao Split View |

**Rota condicional de `F6-SG-C`, a decidir pelo fundador no próprio subportão** — registrada aqui
para que não surja como surpresa: **(i)** conceder `SG-C` somente após validação em tablet Android
físico; **ou** **(ii)** conceder `SG-C` com o caso 4 **implementado e provado por *build*, porém
não validado fisicamente**, com o vão **explicitamente registrado** e revalidação obrigatória
quando houver aparelho. **Este PLAN não escolhe** — e não trata isso como pergunta nova, porque a
indisponibilidade do aparelho é um fato operacional, não uma decisão de produto.

---

## 34. Critérios objetivos de `F6-SG-A`

Ver §27, linha `F6-SG-A`. **Condição dominante:** `SD-8` demonstrado no roteiro físico completo do
§28, passos 3 a 9, **e a matriz de compatibilidade do §28.1 executada integralmente** — 17 casos,
quatro invariantes ZERO — com o **acervo real** de desenhos do aparelho. Sem isso, o subportão não
é concedido, **independentemente** de tudo o mais estar verde.

## 35. Critérios objetivos de `F6-SG-B`

Ver §27, linha `F6-SG-B`. **Condição dominante:** **uma única** derivação de âncora e **uma única**
constante de enquadramento no código, provadas por `G-MAP-1`/`G-MAP-2` e pela comparação de captura
das 20 histórias nas três faixas.

## 36. Critérios objetivos de `F6-SG-C`

Ver §27, linha `F6-SG-C`. **Condição dominante:** `SD-1` nos **quatro** casos de `D1` — com a rota
condicional do §33 para o caso 4 — mais `SD-2`, `SD-3`, `SD-4` e `SD-9` com evidência visual.

---

## 37. Condições para **sequer apresentar** `F6-SG-D`

`F6-SG-D` é o portão que **avalia** o desbloqueio do Bloco `B2`. Ele **não** é objeto deste PLAN e
**não está concedido**. Para ser **apresentado** ao fundador, é preciso que **todas** as condições
abaixo estejam satisfeitas e documentadas:

1. `F6-SG-A` concedido, com `SD-8` demonstrado e registro anexado.
2. `F6-SG-B` concedido, com âncora e fator únicos provados.
3. `F6-SG-C` concedido, incluindo a resolução explícita do caso 4 de `D1` (validação física **ou**
   dispensa registrada conforme §33).
4. `npm run smoke` verde e `npx expo-doctor` verde no `HEAD` do momento.
5. Todos os portões `G-*` de §26 ativos e verdes.
6. Todos os mutantes de §25 observados falhando e revertidos.
7. Campanha física do §28 completa, com vídeo, em iPad.
8. Regressão em telefone sem anomalia relevante.
9. Revisão independente concluída.
10. `P-150`, `P-151`, `P-152`, `P-153`, `P-154` com estado atualizado na matriz e evidência anexada.
11. `Q8` e `Q9` — **decididas** no Portão Humano 2 — **implementadas conforme decidido**, com
    `G-CMP-1`..`G-CMP-5`, `G-VER-1`..`G-VER-3`, `G-SID-2`, `G-SID-3`, `G-RSP-4` e `G-MAP-4` verdes
    e a matriz de compatibilidade do §28.1 integralmente executada.
12. Nenhuma decisão congelada reaberta; `P-103` **continua diferida à Fase 7**.

> **Este PLAN não declara `B2` desbloqueado.** `D18` permanece em vigor.

---

## 38. Plano de *rollback* e contenção

| Cenário | Contenção imediata | *Rollback* |
|---|---|---|
| Perda ou corrupção de obra detectada em `SG-A` | **Parar o subportão.** Nenhum avanço para `R2` | Reverter o *commit* dos passos (7)/(6)/(5) de `F6-R3`; o formato anterior continua íntegro em disco porque abrir é leitura pura e a gravação é *write-forward* validado |
| Obra gravada no formato novo e código revertido | Nenhuma — o caminho revertido **consome** o formato anterior enquanto houver obra nele (`Q8`, regra 9) | Caso 13 da matriz (§28.1) prova esta reversibilidade **antes** de `SG-A` ser concedido |
| Falha na promoção da nova representação | A representação anterior **permanece ativa**; nada é destruído (`Q8`, regra 8) | Nenhuma reversão de código necessária — é o comportamento projetado, coberto por `TA-13` e `G-CMP-4` |
| Deslocamento de pino inaceitável em `SG-B` | Manter a âncora canônica e ajustar **a constante**, nunca reintroduzir a segunda derivação | Reverter o *commit* do passo de migração específico; os passos são atômicos por consumidor |
| Regressão em telefone | Parar a adoção do arquétipo da família afetada | Reverter o *commit* daquela família; os arquétipos são adotados **família a família** |
| Via de orientação falha na prova de mecanismo | **Não** adotar; reavaliar entre (B), (C) e (D) | Nenhuma reversão de código — a prova ocorre **antes** da adoção |
| *Build* nativo quebra | Voltar ao perfil de *build* anterior | `app.json` é o único ponto de configuração e sua reversão é de uma linha |

**Invariantes de contenção:** cada passo de §12 é um ***commit* atômico** próprio; nenhum passo
mistura código, *assets* e governança; **nenhuma gravação destrutiva ocorre em cenário algum** —
abrir é leitura pura e promover exige validação de releitura; o acervo de desenhos é preservado por
*write-forward* em qualquer cenário; e o *lineart* histórico permanece acessível enquanto houver
obra que dependa dele.

---

## 39. Rastreabilidade

### 39.1 `F6-R3` → requisitos → riscos → arquivos → testes → `F6-SG-A`

| Requisito | `E` mestre | Risco `P` | Decisão | Arquivos prováveis | Testes/portões | Gate |
|---|---|---|---|---|---|---|
| `F6-R3.1` | `E034-R1` | `P-152` | `D18` | `AdventureMapScreen.js` | `MT-1`, `G-LFC-1`, §28 #1-2 | `SG-A` |
| `F6-R3.2` | `E034-R2` | `P-152` | — | telas de canvas, mapa, jogos (só leitura) | §28 #10-11, `CN-4` | `SG-A` |
| `F6-R3.3` | `E034-R2` | `P-152` | — | `AppNavigator.js` | `CN-6`, §32 #2 | `SG-A` |
| `F6-R3.4` | — | `P-164` | `PF6D-EXC-R3` | fronteira documental | revisão | `SG-A` |
| `F6-R3.5` | — (novo do Portão 1) | `P-152`, `P-164` | **`PF6D-D-CANVAS`** | `ColoringCanvas.js`, `AtelierCanvas.js`, `useViewportProjection` | `TA-4`, `TA-5`, `G-CVS-1/2`, `MT-5`, `MT-6`, §28 #3-9 | `SG-A` · **`SD-8`** |
| `F6-R3.5-k` · `-l` (compatibilidade e não destrutividade) | — (novo do Portão 1) | `P-152` | **`Q8`** (Portão 2) | leitor de compatibilidade, *writer* *write-forward*, `drawingStorage.js` (leitura), `atelierStorage.js` (leitura) | `TA-12`, `TA-13`, `G-CMP-1`..`G-CMP-5`, `MT-13`, `MT-14`, **§28.1 completa** | `SG-A` · **`SD-8`** |
| Separação de eixos de versionamento | — (novo do Portão 2) | `P-152` | **`Q8` — correção de nomenclatura** | `ColoringCanvas.js`, `AtelierCanvas.js`, `ColoringScreen.js` (guarda `:224`), leitores/escritores | `TA-11`, `G-VER-1`..`G-VER-3`, `MT-12` | `SG-A` |
| `F6-R3.6` | — (novo do Portão 1) | — | `PF6D-EXC-R3` | fronteira documental | revisão | `SG-A` |

### 39.2 `F6-R2` → … → `F6-SG-B`

| Requisito | `E` mestre | Risco `P` | Decisão | Arquivos prováveis | Testes/portões | Gate |
|---|---|---|---|---|---|---|
| `F6-R2.1` | `E032-R1` | `P-154` (infra de `P-157`) | `D11` | `mapAnchor.js`, `MapRegion.js`, `AdventureMapScreen.js` | `TA-1`, `G-MAP-2`, `MT-2` | `SG-B` · `SD-5` |
| `F6-R2.2` | `E032-R2` | `P-154` | `D11` | `mapAnchor.js` | `TA-1`, `G-MAP-1`, `MT-2` | `SG-B` |
| `F6-R2.3` | `E032-R3` | `P-154` | `D11` | `AdventureMapScreen.js:295-311` | `TA-2`, `G-MAP-3`, `MT-4` | `SG-B` · `SD-6` |
| `F6-R2.4` | `E032-R4` | `P-154` | `D11` | `adventureMap.js`, `mapAnchor.js` | `TA-3`, `MT-3` | `SG-B` |
| `F6-R2.5` | `E032-R1` | `P-154` | `D12` | `AdventureMapScreen.js` | `CN-2`, §28 #12 | `SG-B` |

### 39.3 `F6-R1` → … → `F6-SG-C`

| Requisito | `E` mestre | Risco `P` | Decisão | Arquivos prováveis | Testes/portões | Gate |
|---|---|---|---|---|---|---|
| `F6-R1.1` | `E028-R1`..`R3` | `P-150` | `D1`, `PF6D-D1`, `D2` | configuração nativa (§20) | `SD-1`, prova de mecanismo, *build* | `SG-C` |
| `F6-R1.2` | `E028-R4`..`R6` | `P-151` | `D3` | arquétipos, `ContentContainer`, `AppScreen` | `SD-2`, `SD-3`, `G-RSP-3`, `CN-1` | `SG-C` |
| `F6-R1.3` | `E028-R7` | `P-151`, `P-82`, `P-148` | `D2` | `tokens.js`, `HubSurface` | `TA-8`, `G-RSP-2`, `MT-8` | `SG-C` |
| `F6-R1.4` | `E028-R8`, `R9` | `P-153` | `D4` + **`Q9`** (Portão 2) | `TabletSidebar.js`, `AppNavigator.js`, **`src/theme/tokens.js`** | `TA-9`, `TA-10`, `G-SID-1`, **`G-SID-2`, `G-SID-3`, `G-RSP-4`**, `MT-9`, `MT-10`, **`MT-15`, `MT-16`**, as 6 restrições de §19.1, `SD-4` | `SG-C` |

### 39.4 Elegibilidade de `F6-SG-D`

```
F6-SG-A concedido  ∧  F6-SG-B concedido  ∧  F6-SG-C concedido
        ∧  as 12 condições do §37
        ⇒  ELEGÍVEL PARA SER APRESENTADO como F6-SG-D
        ⇏  B2 desbloqueado
```

**`F6-SG-D` é portão separado. `B2` continua bloqueado por `D18`.**

---

## 40. Fora de escopo deste PLAN

| Item | Dono |
|---|---|
| Textos e coreografia do *onboarding*; qual história o tour aponta | **F7** |
| Propósito do Cantinho do Beni (`D13`) | **F7** · Portão de Produto |
| Reclassificação de `P-103` — **`Q7` permanece DIFERIDA** (§41.7) | **F7** |
| *Story Home V2* (`D5`–`D8`) | **F9** |
| *Página Viva* / Leitor V2 (`D9`, `D10`) — F6 entrega só a **capacidade** | **F9** |
| Conclusão visual do Colorir (`D16`) | **F9** |
| Motor de transição de cena (`D17`) | **F9** |
| Porção de **produto** de `P-164` (recuperação e revalidação além do que `F6-R3.6` autoriza) | **F9** |
| `JourneyOrchestrator` definitivo e semântica de "Ver mapa" | **F11** |
| Portão do Monte a Cena (`D14`) · `GameShell` (`D15`) · composição final do Brincar | **F12A** |
| Alvo de toque 56×56 e piso tipográfico de 13px na barra lateral (`RF-A7`, `RF-C12`) | **F6 · Bloco `B2`** |
| Migração para TypeScript | *Feature* própria, futura |
| Adoção de Git LFS | Decisão própria, não automática |

---

## 41. Resolução das questões

### 41.1 Quadro-resumo

| Questão | Estado ao entrar | Estado ao sair deste PLAN | Onde |
|---|---|---|---|
| `Q1` | ✅ resolvida (Portão 1) | preservada, não reaberta | premissa |
| `Q2` | ✅ resolvida (`PF6D-D-CANVAS`) | preservada, é a base do §15 | §15 |
| `Q3` | 🟡 aberta, não bloqueante | ✅ **RESOLVIDA** — critério família + conteúdo real | §18 |
| `Q4` | 🟡 aberta, direção congelada | ✅ **RESOLVIDA** — os dois *tokens* **pertencem** e ganham consumidor | §17.2 |
| `Q5` | 🟡 resolvível no PLAN | ✅ **RESOLVIDA** — `mapAnchor.js` + registro existente inalterado | §16, §11.1 |
| `Q6` | 🟡 aberta, direção congelada | ✅ **RESOLVIDA quanto à unicidade**; valor confirmado visualmente em `SG-B` | §41.4 |
| `Q7` | ⏸️ diferida à Fase 7 | ⏸️ **CONTINUA DIFERIDA** — não reclassificada | §41.7 |
| **`Q8`** | 🆕 levantada pelo PLAN | ✅ **DECIDIDA E CONGELADA** pelo fundador — direção `c + d`, 10 regras normativas + correção de nomenclatura de versionamento | §41.5, §11.5, §28.1 |
| **`Q9`** | 🆕 levantada pelo PLAN | ✅ **AUTORIZADA E CONGELADA** pelo fundador — `tokens.js` liberado em `F6-R1.4` sob 6 restrições | §41.6, §19.1 |

> **Nenhuma questão de produto permanece aberta neste PLAN.** O que resta de `Q8` e `Q9` são
> **condições de implementação verificáveis**, com portão automático correspondente.

### 41.2 `Q3` — resolvida

**Resposta:** opção **(c) aplicada com critério**, e o critério é explícito: *painel de apoio* onde
existe **hierarquia lista→detalhe real e persistente**; *grade que cresce* onde há coleção de
destinos, limitada pela largura mínima legível do cartão. **Não existe regra universal de "tablet =
duas colunas".** Detalhamento por família em **§18**. A confirmação **visual** da maquete ocorre em
`F6-SG-C`, como `Q3` sempre previu.

### 41.3 `Q4` — resolvida

**Resposta:** **`grid` PERTENCE** à nova arquitetura (teto de colunas do `HubSurface`) e
**`displayScaleTablet` PERTENCE** (escala do tipo de exibição nas faixas média e expandida).
**Nenhum é aposentado; nenhum permanece por inércia.** Detalhamento e portão em **§17.2** e §26.

### 41.4 `Q6` — resolvida quanto à unicidade

**Não é uma escolha entre duas constantes.** A geometria canônica é uma só:

> **A âncora da história é enquadrada no centro óptico da *viewport* livre** — a altura visível
> descontada da sobreposição de cabeçalho e da sobreposição inferior **realmente medidas**
> (`R2.3`), nunca estimadas.

Consequências, e é isso que mata a duplicação:

1. Sobrevive **uma** constante nomeada, `MAP_ANCHOR_FRAMING`, expressa como fração da ***viewport*
   livre*** — não da *viewport* bruta.
2. `0.58` e `0.5` **desaparecem** como constantes independentes. O `0.58` era, muito plausivelmente,
   um `0.5` compensando a sobreposição de cabeçalho que a fórmula bruta ignorava — o que explica por
   que os dois números coexistiam sem que ninguém notasse. **Esta explicação é hipótese
   aritmética, não fato provado**, e é irrelevante para o requisito: qualquer que seja a origem, só
   uma constante sobrevive.
3. O valor final é **confirmado visualmente** pelo fundador em `F6-SG-B`, com captura comparativa
   nas três faixas — o julgamento visual que `Q6` sempre reservou.
4. `G-MAP-1` impede o retorno da duplicação.

#### Trava adicional do Portão Humano 2 — `MAP_ANCHOR_FRAMING` não pode virar o novo número mágico

A resolução de `Q6` está aprovada **com esta trava**, que é parte do contrato e não comentário:

| # | Regra |
|---|---|
| 1 | **Tudo o que puder ser medido, será medido.** Barra lateral, área segura, cabeçalho, barra inferior e quaisquer sobreposições que ocupem espaço têm medida real disponível — e é a medida que entra na conta, nunca uma estimativa |
| 2 | **`MAP_ANCHOR_FRAMING` só pode existir se ainda restar decisão de enquadramento genuinamente estética** — a posição do alvo dentro do espaço **livre já medido** |
| 3 | **É proibido que ele compense geometria derivável.** Se um valor está lá para "corrigir" um cabeçalho, uma barra lateral ou uma área segura não subtraída, ele **não é enquadramento**: é estimativa disfarçada, e o defeito de `R2.3` voltou com outro nome |
| 4 | **Semântica única, justificativa explícita no código**, e validação nas três faixas |
| 5 | Se a medição tornar o resíduo desnecessário, **a constante não nasce** — o desenho preferido é o sem constante alguma |
| 6 | `G-MAP-4` (§26) verifica as regras 1, 3 e 4; a 5 é confirmada visualmente em `F6-SG-B` |

**Consequência de projeto:** `computeCameraTarget` recebe a ***viewport* livre já medida** como
entrada. Ele **não** conhece cabeçalho, barra lateral nem área segura — e é justamente por não
conhecer que não tem como compensá-los com um número.

### 41.5 ✅ `Q8` — **DECIDIDA E CONGELADA** pelo fundador (Portão Humano 2)

**Direção aprovada: combinação conceitual das opções `c + d`**, com as dez regras normativas abaixo.
**Texto congelado — não reinterpretar, não resumir, não flexibilizar em Tasks.**

| # | Regra normativa |
|---|---|
| **1** | Uma obra já existente possui um **espaço lógico próprio** e **não pode depender das dimensões da *viewport* atual**. |
| **2** | Ao abrir uma obra antiga, a operação é **estritamente de leitura**. Abrir **NÃO pode**: migrar silenciosamente · reescrever · apagar · limpar · substituir · promover formato · alterar bytes persistidos · marcar uma obra incompatível como vazia. |
| **3** | Incompatibilidade entre dimensões antigas e *viewport* atual **nunca** autoriza `clear`, `removeItem`, exclusão de *blob* ou substituição por canvas limpo. |
| **4** | Para *payloads* que já possuem `W/H` e geometria de *lineart*, esses valores representam o **espaço lógico histórico da obra**. A *viewport* atual apenas **enquadra** esse espaço. |
| **5** | A representação visual deve **preservar proporção**. Usar projeção equivalente a **`contain`**; quando as razões forem diferentes, usar ***letterbox***. É **proibido**: esticar · recortar silenciosamente · reposicionar tinta independentemente do *lineart* · transformar cada camada com geometria diferente. |
| **6** | Para formatos legados sem toda a geometria explícita, o **leitor de compatibilidade** deve reconstruir a melhor representação **determinística** a partir dos metadados e dimensões intrínsecas **realmente disponíveis** e da geometria histórica compatível. **Nunca** usar a *viewport* atual como se fosse a *viewport* original da criação. **Ausência de evidência deve favorecer preservação.** |
| **7** | **Nenhuma migração acontece apenas porque a criança abriu a obra.** O formato novo somente pode ser produzido na **próxima gravação explícita da criança**. |
| **8** | A gravação nova deve ser ***write-forward***. Primeiro: criar nova representação → persistir → validar integridade → **provar que pode ser relida**. Somente depois: **promover** a nova representação como ativa. Se qualquer etapa falhar, a representação anterior continua sendo a **fonte válida**. **Nenhuma falha pode destruir a versão anterior.** |
| **9** | O ***rollback*** deve continuar **capaz de consumir o formato anterior** enquanto houver uma obra existente nesse formato. |
| **10** | Os ***linearts* históricos** continuam **protegidos** enquanto alguma obra puder depender deles. **Não remover, sobrescrever visualmente ou tornar inacessível** um *lineart* necessário para recompor uma obra anterior. |

**Correção obrigatória de nomenclatura que acompanha `Q8`:** a expressão genérica `v:3` **não está
aprovada** para a nova representação. `v:3` já significa o **envelope/ponteiro de persistência de
desenhos no *filesystem***, e esse significado é **preservado**. A evolução da representação lógica
da pintura usa **discriminadores separados e inequívocos** — `paintSchemaVersion` (payload visual) e
`layoutVersion` (geometria lógica) — de modo que **versão do envelope de storage**, **versão do
payload visual** e **versão da geometria lógica** **não possam ser confundidas por *reader*,
*writer*, *validator*, migração ou testes**. Especificação completa e prova da colisão em **§11.5**.

**Onde a decisão vira verificação:** leitor de compatibilidade = passo (4) de §12 · *writer* = passo
(7) · testes `TA-12`, `TA-13` · portões `G-CMP-1`..`G-CMP-5` e `G-VER-1`..`G-VER-3` · mutantes
`MT-12`, `MT-13`, `MT-14` · **matriz de compatibilidade obrigatória do §28.1** (17 casos, quatro
invariantes ZERO) · critério de saída de `F6-SG-A` (§27, §34).

**Isto não reabriu `PF6D-D-CANVAS`.** Aquela decisão fixou o **espaço lógico canônico**; `Q8`
resolve o **acervo legado**, que a própria decisão remeteu a `R3.5-k`.

### 41.6 ✅ `Q9` — **AUTORIZADA E CONGELADA** pelo fundador (Portão Humano 2)

**Está AUTORIZADA a alteração de `src/theme/tokens.js` dentro de `F6-R1.4`** para remover a largura
estrutural *hardcoded* da barra lateral e colocá-la sob a fonte canônica do *design system*.

**A autorização NÃO é para mover o número.** Transformar `width: 200` (`TabletSidebar.js:125`) em
`sidebarWidth: 200` e declarar o problema resolvido **não cumpre o requisito**. A semântica precisa
refletir o **contrato adaptativo**: o sistema distingue **faixa média** × **faixa expandida** e
***rail*/barra lateral compacta** × **barra lateral completa**. O PLAN, portanto, permite ***tokens*
semânticos adequados às faixas e ao papel de navegação**.

**A forma final pode ser decidida tecnicamente em Tasks**, desde que — e estas seis condições são o
que sobrou de `Q9`, todas verificáveis:

1. exista **uma única fonte canônica**;
2. **não haja novo *hardcode* distribuído**;
3. **não seja criado *design system* paralelo**;
4. **a largura não seja usada como substituto de medição real da *viewport***;
5. a solução **funcione em `600–899` e em `>=900`**;
6. **telefone compacto não sofra regressão**.

**Onde a decisão vira verificação:** contrato detalhado em **§19.1** · portões `G-SID-2`, `G-SID-3`,
`G-RSP-4` · mutantes `MT-15`, `MT-16` · `CN-1` · `SD-4` com captura em `F6-SG-C`.

### 41.7 `Q7` — confirmada **DIFERIDA**

**`P-103` continua classificada como `IMPLEMENTADO SEM CONSUMIDOR` e continua encaminhada à Fase 7.**
Este PLAN **não** reclassifica, **não** corrige e **não** amplia o escopo da Fase 6 para resolvê-la.
Nenhum trabalho de `F6-R1`, `F6-R2` ou `F6-R3` depende dela.

---

## 42. O que este PLAN **não** fez

Não executou Tasks, Analyze nem Implement. Não escreveu uma linha de código de runtime. Não tocou
*assets*, `app.json`, `eas.json`, `package.json` nem `package-lock.json`. Não instalou dependência.
Não rodou Metro, não gerou *build*, não rodou *smoke* nem `expo-doctor` (proibido nesta rodada).
Não fez *push* nem *merge*. **Não desbloqueou o `B2`.** Não reabriu nenhuma decisão congelada, não
renumerou `F6-R1`/`R2`/`R3`, não alterou `Q1`, `Q2`, `P-01`–`P-167`, `E000`–`E089`, `SD-8`, a
classificação de `P-152`/`P-164` nem a linha `P-141`. Não reclassificou `P-103`. Não alterou a
matriz de riscos, a *spec*, o *clarify* nem o roteiro do delta.

---

## 43. Cobertura da estrutura mínima exigida (40 itens)

| # | Item exigido | Seção |
|---|---|---|
| 1 | Objetivo e fronteira | §1 |
| 2 | Precondições | §2 |
| 3 | Documentos árbitros | §3 |
| 4 | Constituição aplicável e Constitution Check | §4 |
| 5 | Ordem executiva e dependências | §5 |
| 6 | Arquitetura alvo de `F6-R3` | §6 |
| 7 | Arquitetura alvo de `F6-R2` | §7 |
| 8 | Arquitetura alvo de `F6-R1` | §8 |
| 9 | Arquivos/componentes afetados com evidência real | §9 |
| 10 | Arquivos que **não** devem ser afetados | §10 |
| 11 | APIs e contratos novos/alterados | §11 · **§11.5 (eixos de versionamento)** |
| 12 | Migração sem *big bang* | §12 |
| 13 | Preservação de compatibilidade | §13 · **§28.1 (matriz)** |
| 14 | Ciclo de vida e *state preservation* | §14 |
| 15 | Canvas lógico × *viewport* | §15 · §41.5 |
| 16 | Âncora canônica do mapa | §16 + §11.1 |
| 17 | Três faixas | §17 |
| 18 | Quatro famílias | §18 |
| 19 | Barra lateral | §19 · **§19.1 (contrato de *tokens*, `Q9`)** |
| 20 | Infraestrutura nativa de orientação | §20 |
| 21 | Riscos de regressão | §21 |
| 22 | Matriz de dependências | §22 |
| 23 | Testes automatizados | §23 |
| 24 | Controles negativos | §24 |
| 25 | Testes mutantes | §25 |
| 26 | Portões que falham se defeito reaparecer | §26 |
| 27 | Entrada/saída de cada subportão | §27 |
| 28 | Sequência de validação física | §28 · **§28.1 (matriz de compatibilidade `Q8`)** |
| 29 | Critérios iPhone | §29 |
| 30 | Critérios iPad retrato | §30 |
| 31 | Critérios iPad paisagem | §31 |
| 32 | Critérios *resize*/multitarefa | §32 |
| 33 | Critérios futuros tablet Android físico | §33 |
| 34 | Critérios objetivos `F6-SG-A` | §34 + §27 |
| 35 | Critérios objetivos `F6-SG-B` | §35 + §27 |
| 36 | Critérios objetivos `F6-SG-C` | §36 + §27 |
| 37 | Condições para apresentar `F6-SG-D` | §37 |
| 38 | *Rollback* e contenção | §38 |
| 39 | Rastreabilidade requisitos↔riscos↔decisões↔etapas | §39 |
| 40 | Fora de escopo | §40 |

---

**Fim do PLAN (r2 — emenda do Portão Humano 2 incorporada).** Etapa SDD 4 concluída.
**Nenhuma questão de produto em aberto. Nenhuma violação constitucional não resolvida.**
Tasks, Analyze e Implement **não** foram iniciados e não serão antes da **aprovação definitiva do
fundador** no Portão Humano 2 e da concessão do Portão Humano 3. **`B2` continua bloqueado.**
