@AGENTS.md

# Pequenos Traços de Fé — Instruções de Projeto

App infantil de histórias bíblicas em **React Native + Expo SDK 54** (mascote oficial: **Beni**; "Lumi" é legado). Local-first (sem backend): progresso, desenhos e galeria vivem em **AsyncStorage** + **expo-file-system** (`/legacy`). Áudio via **expo-audio**; canvas (Ateliê/Colorir) via **react-native-webview**.

> Antes de escrever qualquer código, leia os docs versionados do Expo 54 (ver `AGENTS.md`).

## Precedência documental (quem manda)

`docs/PROJECT_SOURCE_OF_TRUTH.md` é a **fonte de verdade máxima** do projeto. O Spec Kit **organiza a execução** do Roteiro Mestre, mas **não** substitui, reorganiza nem redefine o roadmap, a arquitetura ou decisões já registradas na fonte de verdade. Em caso de conflito, a ordem de precedência é:

1. `docs/PROJECT_SOURCE_OF_TRUTH.md` (Roteiro Mestre)
2. Constituição do projeto (`.specify/memory/constitution.md`)
3. `CLAUDE.md` (este guia operacional)
4. Spec aprovada da feature
5. Plan
6. Tasks
7. Instruções operacionais da sessão

## Nomenclatura (sem ambiguidade)

- **"Fases do Roteiro"** = as **Fases 0 a 8** do roadmap de produto (`PROJECT_SOURCE_OF_TRUTH.md`).
- **"Etapas SDD"** = o processo do Spec Kit (Specify → … → Implement).
- **Nunca** chamar uma Etapa SDD apenas de "Fase 1/2/…": são eixos distintos.

## Diretrizes de Desenvolvimento (GitHub Spec Kit — Fluxo SDD de alta confiança)

Integração nativa: **Claude Code** (skills em `.claude/skills/`). Toda tarefa de desenvolvimento segue o fluxo abaixo, com **3 portões humanos** obrigatórios:

- **Etapa SDD 1 — Specify** (`/speckit.specify` → `specs/<###-feature>/spec.md`): o quê e por quê.
- **Etapa SDD 2 — Clarify** (`/speckit.clarify`): resolver toda ambiguidade. **Nenhuma spec avança com `[NEEDS CLARIFICATION]` em aberto.**
- **Etapa SDD 3 — Checklist de requisitos** (`/speckit.checklist`): valida a qualidade dos requisitos antes do plano.
- **🚦 Portão Humano 1** — aprovação da especificação.
- **Etapa SDD 4 — Plan + Constitution Check** (`/speckit.plan` → `plan.md`): abordagem técnica/arquitetural, conforme a Constituição.
- **🚦 Portão Humano 2** — aprovação do plano.
- **Etapa SDD 5 — Tasks** (`/speckit.tasks` → `tasks.md`): micro-tasks cronológicas e atômicas.
- **Etapa SDD 6 — Analyze** (`/speckit.analyze`): consistência spec↔plan↔tasks **antes** de implementar.
- **🚦 Portão Humano 3** — aprovação das tarefas e da análise.
- **Etapa SDD 7 — Implement** (`/speckit.implement`): só agora o código é escrito.
- **Etapa SDD 8 — Testes, validação visual, revisão e relatório** (revisão independente pode ocorrer após a implementação).
- **Etapa SDD 9 — Commit seletivo** (atômico, por bloco lógico).
- **Etapa SDD 10 — Push** somente com aprovação explícita.

**Regras invioláveis:** (1) nenhum código antes dos três portões humanos; (2) `clarify`, `checklist` e `analyze` são parte do fluxo, não opcionais; (3) mudanças descobertas na implementação **voltam** aos artefatos correspondentes (spec/plan/tasks); (4) spec, plan, tasks e código permanecem **rastreáveis entre si**.

### Rigor proporcional ao risco

A Regra de Ouro (nada de código antes dos portões) é sempre obrigatória, mas o **tamanho dos artefatos acompanha o risco**:

- **Correção isolada (bug):** spec curta com reprodução, comportamento esperado, causa provável, solução, risco e teste de regressão.
- **Conteúdo e assets:** inventário, critérios de qualidade, destinos, referências, peso, dimensões, validação de manifests e checklist de integração.
- **Feature comum:** fluxo SDD completo.
- **Mudança arquitetural, persistência, pagamento, progresso, segurança ou acesso:** fluxo completo + pesquisa técnica + revisão independente + aprovação explícita.
- **Documentação pura:** bloco documental controlado, desde que **não** altere comportamento do app.

## Governança da Arquitetura

1. **Respeitar a arquitetura atual** (pastas, `src/services` para dados, `src/context` como fonte única, design system). Estender o que existe antes de criar paralelo.
2. **Nunca alterações destrutivas sem aprovação prévia** — não apagar/sobrescrever/mover arquivos, dados ou schemas de storage sem confirmação; inspecionar o alvo antes.
3. **Áreas sensíveis** (paywall, progresso, conquistas, `accessControl`, manifestos de áudio/cenas, histórias, assets) só mudam com instrução direta.

### Assets e diretórios untracked

Os diretórios untracked de histórias e assets (`assets/stories/...`) **não podem entrar no Git por comandos amplos nem sem auditoria**. A adição individual e deliberada é permitida **quando houver inventário, validação, aprovação explícita e `git add` seletivo**. Além disso:

- `git add .` / `git add -A` são **proibidos** enquanto houver arquivos untracked não auditados.
- Cada lote de assets exige **auditoria própria**; assets **não** se misturam a commits de governança ou código.
- Arquivos pesados são **avaliados antes** do versionamento.
- **Git LFS não é adotado automaticamente:** a escolha entre Git comum, Git LFS ou armazenamento externo exige análise de tamanho, crescimento, custo e compatibilidade com EAS Build.

### Base64 e Ateliê

Base64 é **aceitável e esperado de forma transitória** no pipeline de captura/exportação do canvas (WebView→JavaScript, `postMessage`, fallback controlado). O que se evita é **manter ou persistir blobs grandes** em memória/storage quando a arquitetura já oferece caminho de arquivo (`file://`). O uso transitório atual **não** é violação arquitetural; qualquer migração desse pipeline exige spec própria, testes de regressão e validação dos desenhos existentes.

### Performance React Native

Evitar re-renders desnecessários é **obrigatório**. `memo`, `useMemo` e `useCallback` são **ferramentas situacionais, não mandatos**: aplicar quando houver justificativa técnica (caminho quente, cálculo relevante, lista sensível, ganho mensurável). **Memoização prematura, dependências incorretas e complexidade sem benefício são proibidas.** Ainda: (1) chaves de lista estáveis; (2) listas extensas virtualizadas; (3) não recriar objetos/estilos/handlers em caminhos críticos sem necessidade; (4) otimização preserva legibilidade e comportamento; (5) **medir antes** de refatorar amplo.

### TypeScript

TypeScript Strict é o **estado técnico desejado**, mas **ainda não é a baseline executável** do projeto (hoje 100% JavaScript). A adoção plena depende de uma **feature própria aprovada pelo ciclo SDD**. Até lá, novos módulos isolados **podem** preferir TypeScript apenas quando isso **não** exigir migração colateral, configuração improvisada ou aumento de risco. Não migrar `.js` automaticamente; não criar `tsconfig.json` fora da feature dedicada; não converter arquivos só por terem sido tocados. A migração futura é incremental (incluirá `expo/tsconfig.base`, `strict`, script de typecheck, compatibilidade com Metro e estratégia para o legado) e **não** atropela as prioridades do Roteiro Mestre.

## Portões de Qualidade (Etapa SDD 8)

- **`npm run verify:runtime`** verde (= `bundle:check` **e depois** `smoke`) e **`npx expo-doctor`** verde. Ver a regra de bundleabilidade abaixo — ela é global e não depende de lembrança humana.
- Testes focados proporcionais ao risco; **testes de regressão** para bugs.
- **Validação visual por print/vídeo** para mapa, tour, Livrinho, Ateliê, imagens e interfaces.
- **Validação em dispositivo físico** quando a mudança depender de toque, gestos, canvas, áudio, persistência, performance ou layout real.
- **Smoke e expo-doctor NÃO substituem validação visual.** Critérios de aceite devem ser observáveis e verificáveis. Relatórios ao usuário em **PT-BR**.

### Bundleabilidade (obrigatório — `AGENTS.md` traz a regra completa)

Qualquer alteração capaz de afetar o **grafo executável** exige `npm run verify:runtime` verde **antes** de: (1) declarar implementação concluída; (2) gerar qualquer EAS build; (3) pedir validação física; (4) encerrar um bloco de runtime; (5) produzir o commit final de implementação.

Superfícies que disparam: `App.js`, `index.js`, `src/**`, `babel.config.js`, `metro.config.js`, configuração Expo capaz de afetar o bundle, `package.json`/`package-lock.json` quando pertinente, e imports/exports/assets alcançáveis. **Documentação pura não dispara** — mas **comentário dentro de `.js` alcançável é código para o parser**.

`bundle:check` e `smoke` provam propriedades **disjuntas**: o primeiro prova que o Metro consegue empacotar; o segundo prova regras de produto lendo a maior parte de `src/` **como texto**. Nenhum substitui o outro, e nenhum substitui a validação visual/física. Motivo histórico: incidente `BOOT/BUNDLE BLOCKED` de `F6-R3` — 10 commits com a árvore inbundlável e o smoke **4854/4854 verde** o tempo todo.

## Dependências

1. Dependência nova exige **aprovação prévia**.
2. Verificar compatibilidade com **Expo SDK 54, RN 0.81.5, React 19.1.0 e New Architecture**.
3. Usar **`npx expo install`** para o que for gerenciado/compatível com o catálogo Expo.
4. Pacotes JS não gerenciados pelo Expo podem usar npm **após** verificação de compatibilidade.
5. Nenhuma lib só para substituir solução simples já existente.

## Git e Relatórios

- **`git add` sempre seletivo**; **nunca `git add .`/`-A`**. Um bloco lógico = **um commit atômico**.
- **Sem push sem autorização explícita.** Antes do commit, mostrar `git diff --cached --name-only`.
- Não misturar **código, assets e governança** no mesmo commit. Não incluir arquivos pessoais (ex.: `.claude/settings.local.json`).
- Relatórios devem distinguir corretamente: **salvo no disco · untracked · modificado · staged/indexado · commitado · enviado ao remoto**. **Nunca usar "indexado" se nenhum `git add` ocorreu.**
- Mensagens de commit encerram com a linha `Co-Authored-By:` do agente que **de fato** escreveu o
  commit. A regra é de **veracidade, não de versão**: o trailer **nunca** declara um modelo diferente
  do que foi realmente usado, e a política **não** fica presa a uma versão específica. Valem duas
  formas:
  - **nome real do modelo** — ex.: `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`;
  - **forma genérica durável** — `Co-Authored-By: Claude <noreply@anthropic.com>`, preferível quando
    a versão exata não for relevante.

  Commits já criados **não** são reescritos (nem têm hashes alterados) só para adequar o trailer a
  outra versão de modelo.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
