<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Bump rationale (MINOR): expansão material da governança — introdução do Fluxo SDD de
  alta confiança (10 etapas + 3 portões humanos), novos portões de validação (incl.
  validação visual/dispositivo), precedência documental explícita, desambiguação de
  nomenclatura (Etapas SDD × Fases do Roteiro) e correção de políticas absolutas
  (untracked, base64, memoização, TypeScript).

Princípios (5) — revisados:
  I.   Stack Tecnológico Soberano (TypeScript reposicionado como evolução futura)
  II.  Arquitetura Local-First e Separação de Responsabilidades (untracked condicional)
  III. Qualidade e Clean Code
  IV.  Performance e UI/UX Mobile (memoização situacional; base64 transitório protegido)
  V.   Regra de Ouro — Spec-Driven com Fluxo SDD de Alta Confiança

Seções modificadas/adicionadas:
  + "Precedência Documental" (nova) — PROJECT_SOURCE_OF_TRUTH.md é a fonte máxima
  + "Nomenclatura sem Ambiguidade" (nova) — Etapas SDD × Fases do Roteiro
  + "Rigor Proporcional ao Risco" (nova)
  ~ "Restrições de Stack, Segurança e Áreas Protegidas" — untracked sem contagem fixa
  ~ "Fluxo de Desenvolvimento e Portões de Qualidade" — validação visual/dispositivo
  ~ "Governance" — versão 1.1.0

Templates dependentes:
  ✅ .specify/templates/plan-template.md — "Constitution Check" genérico, alinhado; sem edição
  ✅ .specify/templates/spec-template.md — compatível; sem edição
  ✅ .specify/templates/tasks-template.md — compatível; sem edição
  ✅ CLAUDE.md — reescrito para refletir esta v1.1.0 (precedência, fluxo SDD, correções)

Pendências deliberadamente adiadas (deferred):
  - TODO(TYPESCRIPT_BASELINE): repo 100% JavaScript (0 .ts, sem tsconfig.json). TS Strict
    é evolução futura sob feature SDD própria — NÃO migrar nesta tarefa.
  - TODO(ASSET_AUDIT): diretórios untracked em assets/stories/ auditados em modo leitura
    (Bloco 4); decisão Git comum × otimização × Git LFS permanece aberta, exige análise de
    tamanho/crescimento/custo/compatibilidade com EAS Build.
  - NOTE(VSCODE_REMOVED): o `.vscode/` (untracked, não versionado) foi removido como efeito
    colateral de `specify integration switch claude`; conteúdo de editor, regenerável.
-->

# Constituição do Projeto "Pequenos Traços de Fé"

Este documento define as regras **inegociáveis** de engenharia do projeto. Seu tom é
diretivo e absoluto: **DEVE/OBRIGATÓRIO** (MUST), **NÃO DEVE** (MUST NOT) e **DEVERIA**
(SHOULD) têm peso normativo. Em conflito entre qualquer prática e esta Constituição, **a
Constituição prevalece** — exceto onde a Precedência Documental abaixo determinar o
contrário.

## Precedência Documental

`docs/PROJECT_SOURCE_OF_TRUTH.md` (o **Roteiro Mestre**) é a **fonte de verdade máxima**
do projeto. O Spec Kit **organiza a execução** do Roteiro, mas **NÃO DEVE** substituir,
reorganizar ou redefinir silenciosamente o roadmap, a arquitetura ou decisões já
registradas. Ordem de precedência em caso de conflito:

1. `docs/PROJECT_SOURCE_OF_TRUTH.md`
2. Esta Constituição
3. `CLAUDE.md`
4. Spec aprovada da feature
5. Plan
6. Tasks
7. Instruções operacionais da sessão

## Nomenclatura sem Ambiguidade

- **"Fases do Roteiro"** referem-se **exclusivamente** às **Fases 0 a 8** do roadmap de
  produto no Roteiro Mestre.
- **"Etapas SDD"** referem-se ao processo do Spec Kit.
- Uma Etapa SDD **NÃO DEVE** ser chamada apenas de "Fase 1/2/…": são eixos distintos.

## Core Principles

### I. Stack Tecnológico Soberano

Stack fixa e protegida: **Expo SDK 54**, **React Native 0.81.5**, **React 19.1.0**,
respeitando as APIs versionadas do Expo 54 (ler os docs versionados antes de codar — ver
`AGENTS.md`) e a New Architecture (`newArchEnabled: true`).

- **Proibido adicionar bibliotecas de terceiros sem aprovação prévia explícita.** Toda
  dependência nova **DEVE** ser compatível com Expo SDK 54 + RN 0.81.5 + React 19.1.0 +
  New Architecture, justificada no Plano (Etapa SDD 4) e instalada via `npx expo install`
  quando gerenciada/compatível; pacotes JS não gerenciados só após verificação. Nenhuma
  lib é adicionada apenas para substituir uma solução simples já existente.
- **TypeScript é evolução futura, não baseline atual.** Ver Princípio III.
- **Rationale:** previsibilidade de build (EAS) e estabilidade nativa dependem de uma
  stack pequena, versionada e auditável.

### II. Arquitetura Local-First e Separação de Responsabilidades

O app é **local-first** (sem backend). Estado de usuário (progresso, desenhos, galeria,
conquistas) **DEVE** persistir localmente via **AsyncStorage** e **expo-file-system**
(`/legacy`), de forma defensiva (falha de storage nunca quebra a UI).

- **Separação de responsabilidades OBRIGATÓRIA:** UI (`src/screens`, `src/components`) ↔
  lógica/dados (`src/services`, única camada que toca storage/manifests/arquivos) ↔ estado
  compartilhado (`src/context`, fonte única de verdade). Telas consomem o contexto; não
  recalculam o que já é centralizado.
- **Áreas sensíveis** (paywall, progresso, conquistas, `accessControl`, manifestos de
  áudio/cenas, histórias, assets) **NÃO DEVEM** ser alteradas sem instrução direta.
- **Sem alterações destrutivas sem aprovação prévia:** não apagar/sobrescrever/mover
  arquivos, dados ou schemas de storage sem confirmação; inspecionar o alvo antes e
  sinalizar divergências em vez de prosseguir.
- **Rationale:** isolar dados de UI mantém o app offline robusto, testável e seguro.

### III. Qualidade e Clean Code

Excelência de código é condição de aceite.

- **Nomenclatura clara e descritiva em INGLÊS** para variáveis, funções, tipos e arquivos.
  **Documentação, comentários para o time e relatórios de bloco ao responsável DEVEM ser
  em Português (PT-BR).**
- **Tolerância ZERO a funções gigantes e "God Objects":** responsabilidade única;
  componentes/serviços que acumulam responsabilidades **DEVEM** ser decompostos. Código
  novo lê como o vizinho (idiomática, nomes, densidade de comentários).
- **Defensividade:** caminhos de erro tratados, sem código morto e sem duplicação divergente.
- **TypeScript Strict é o estado técnico desejado, mas NÃO é a baseline executável atual**
  (o repositório é hoje 100% JavaScript, sem `tsconfig.json`). A adoção plena depende de
  uma **feature própria aprovada pelo ciclo SDD**. Até essa baseline existir: novos módulos
  isolados **DEVERIAM** preferir TypeScript **somente** quando isso não exigir migração
  colateral, configuração improvisada ou aumento de risco; **NÃO** migrar `.js`
  automaticamente; **NÃO** criar `tsconfig.json` fora da feature dedicada; **NÃO** converter
  arquivos só por terem sido tocados. A migração futura é incremental (incluirá
  `expo/tsconfig.base`, `strict`, script de typecheck, compatibilidade com Metro e
  estratégia para o legado) e **NÃO** atropela as prioridades do Roteiro Mestre.

### IV. Performance e UI/UX Mobile

Fluidez no dispositivo físico (iOS e Android, inclusive low-end) é requisito.

- **Evitar re-renders desnecessários é OBRIGATÓRIO; `memo`/`useMemo`/`useCallback` são
  ferramentas situacionais, NÃO mandatos.** Aplicá-los apenas com justificativa técnica
  (caminho quente, cálculo relevante, lista sensível, ganho mensurável). **Memoização
  prematura, dependências incorretas e complexidade sem benefício são proibidas.**
- **Chaves de lista estáveis; listas extensas DEVEM ser virtualizadas** (`FlatList` com
  `windowSize`/`initialNumToRender`/`removeClippedSubviews`). Não recriar objetos, estilos
  ou handlers em caminhos críticos sem necessidade. **Medir antes** de refatorações amplas;
  otimização preserva legibilidade e comportamento.
- **Mídia pesada com cuidado de memória:** preferir arquivo (`file://`) a blobs grandes
  persistidos. **base64 é aceitável e esperado de forma transitória** no pipeline de
  captura/exportação do canvas (WebView→JavaScript, `postMessage`, fallback controlado) — o
  uso transitório atual **NÃO** é violação arquitetural. O que se evita é **manter/persistir
  blobs grandes** quando há caminho de arquivo. Qualquer migração desse pipeline exige spec
  própria, testes de regressão e validação dos desenhos existentes.
- **Código visual modularizado** em componentes pequenos e reutilizáveis; UI limpa, fluida
  e consistente com o design system.
- **Rationale:** o público são crianças; jank ou telas presas quebram a experiência.

### V. Regra de Ouro — Spec-Driven com Fluxo SDD de Alta Confiança

**NENHUMA linha de código de produção DEVE ser escrita antes dos TRÊS portões humanos** do
Fluxo SDD:

- **Etapa SDD 1 — Specify** (`/speckit.specify` → `specs/<###-feature>/spec.md`)
- **Etapa SDD 2 — Clarify** (`/speckit.clarify`) — **nenhuma spec avança com
  `[NEEDS CLARIFICATION]` em aberto**
- **Etapa SDD 3 — Checklist de requisitos** (`/speckit.checklist`)
- **Portão Humano 1** — aprovação da especificação
- **Etapa SDD 4 — Plan + Constitution Check** (`/speckit.plan` → `plan.md`)
- **Portão Humano 2** — aprovação do plano
- **Etapa SDD 5 — Tasks** (`/speckit.tasks` → `tasks.md`)
- **Etapa SDD 6 — Analyze** (`/speckit.analyze`) — consistência spec↔plan↔tasks
- **Portão Humano 3** — aprovação das tarefas e da análise
- **Etapa SDD 7 — Implement** (`/speckit.implement`)
- **Etapa SDD 8 — Testes, validação visual, revisão e relatório** (revisão independente
  pode ocorrer após a implementação)
- **Etapa SDD 9 — Commit seletivo**
- **Etapa SDD 10 — Push** somente com aprovação explícita

Regras: (1) `clarify`, `checklist` e `analyze` fazem parte do fluxo, não são opcionais;
(2) mudanças descobertas na implementação **DEVEM** voltar aos artefatos correspondentes;
(3) spec, plan, tasks e código permanecem **rastreáveis entre si**. Pular, inverter ou
comprimir essas etapas é **violação constitucional**.

## Rigor Proporcional ao Risco

A Regra de Ouro é sempre obrigatória, mas o **tamanho dos artefatos acompanha o risco**:

- **Correção isolada (bug):** spec curta com reprodução, comportamento esperado, causa
  provável, solução, risco e teste de regressão.
- **Conteúdo e assets:** inventário, critérios de qualidade, destinos, referências, peso,
  dimensões, validação de manifests e checklist de integração.
- **Feature comum:** fluxo SDD completo.
- **Mudança arquitetural, persistência, pagamento, progresso, segurança ou acesso:** fluxo
  completo + pesquisa técnica + revisão independente + aprovação explícita.
- **Documentação pura:** bloco documental controlado, desde que **não** altere o
  comportamento do app.

## Restrições de Stack, Segurança e Áreas Protegidas

- **Build & distribuição:** apenas via EAS (`development`/`preview`/`production`). Sem
  OTA/expo-updates e sem submit automático sem aprovação.
- **Privacidade:** sem SDKs de tracking/analytics; `privacyManifests` (iOS) e permissões
  Android mínimas e justificadas.
- **Diretórios untracked (histórias e assets):** **NÃO DEVEM** entrar no Git por comandos
  amplos nem sem auditoria. A adição **individual e deliberada** é permitida **quando
  houver inventário, validação, aprovação explícita e `git add` seletivo**. Ainda:
  - `git add .` / `git add -A` são **proibidos** enquanto houver untracked não auditado.
  - Cada lote de assets exige auditoria própria; assets **NÃO** se misturam a commits de
    governança ou código.
  - Arquivos pesados são avaliados antes do versionamento.
  - **Git LFS NÃO é adotado automaticamente:** Git comum × Git LFS × armazenamento externo
    exige análise de tamanho, crescimento, custo e compatibilidade com EAS Build.

## Fluxo de Desenvolvimento e Portões de Qualidade

Disciplina **OBRIGATÓRIA** na Etapa SDD 8 e no fechamento de cada bloco:

- **`npm run smoke`** verde e **`npx expo-doctor`** verde (portões mínimos).
- Testes focados proporcionais ao risco; **testes de regressão** para bugs.
- **Validação visual por print/vídeo** para mapa, tour, Livrinho, Ateliê, imagens e
  interfaces; **validação em dispositivo físico** quando a mudança depender de toque,
  gestos, canvas, áudio, persistência, performance ou layout real.
- **Smoke e expo-doctor NÃO substituem validação visual.** Critérios de aceite observáveis
  e verificáveis. Relatórios ao responsável em **PT-BR**.
- **Git:** `git add` sempre **seletivo** (nunca `git add .`/`-A`); um bloco lógico = **um
  commit atômico**; **sem push sem aprovação explícita**; antes do commit, exibir
  `git diff --cached --name-only`. **Não misturar** código, assets e governança no mesmo
  commit; não incluir arquivos pessoais (ex.: `.claude/settings.local.json`). Relatórios
  distinguem **salvo no disco · untracked · modificado · staged/indexado · commitado ·
  enviado**; **nunca** dizer "indexado" sem `git add`. Mensagens encerram com a linha
  `Co-Authored-By:` do agente que **de fato** escreveu o commit — regra de **veracidade, não de
  versão**: o trailer nunca declara um modelo diferente do que foi usado. Valem duas formas: o
  **nome real do modelo** (ex.: `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`) ou a
  forma **genérica durável** `Co-Authored-By: Claude <noreply@anthropic.com>`. Commits já
  criados **não** são reescritos para adequar o trailer a outra versão.

## Governance

Esta Constituição **supera todas as outras práticas**, ressalvada a Precedência Documental
(o Roteiro Mestre prevalece sobre ela).

- **Conformidade:** todo Plano (Etapa SDD 4) **DEVE** passar pelo "Constitution Check" do
  `plan-template.md`; violações **DEVEM** ser justificadas explicitamente ou o desenho
  **DEVE** ser simplificado.
- **Emendas:** propostas por escrito, aprovadas pelo responsável, com plano de migração
  quando afetarem código/templates. Toda emenda atualiza "Last Amended" e propaga aos
  templates dependentes.
- **Versionamento (SemVer da Constituição):** **MAJOR** = remoção/redefinição incompatível;
  **MINOR** = novo princípio/seção ou expansão material; **PATCH** = esclarecimentos.
- **Orientação em runtime:** `CLAUDE.md` é o guia operacional vivo e **DEVE** permanecer
  consistente com esta Constituição.

**Version**: 1.1.0 | **Ratified**: 2026-06-22 | **Last Amended**: 2026-06-22
