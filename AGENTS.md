# AGENTS.md — Regras compartilhadas para agentes

Este arquivo concentra as regras que **todo** agente de codificação deve seguir neste
repositório (**Claude Code**, **Codex** e outros). O `CLAUDE.md` importa este arquivo
(`@AGENTS.md`); o Codex lê este arquivo diretamente.

## Precedência documental (quem manda)

Em caso de conflito, vale esta ordem:

1. `docs/PROJECT_SOURCE_OF_TRUTH.md` (Roteiro Mestre — verdade máxima)
2. Constituição do projeto (`.specify/memory/constitution.md`)
3. **`AGENTS.md`** (este arquivo — regras compartilhadas)
4. Regras específicas do agente (ex.: `CLAUDE.md`) e instruções da sessão

Nenhuma regra abaixo substitui ou reorganiza o Roteiro Mestre ou a Constituição.

## Stack (Expo HAS CHANGED)

App infantil em **React Native + Expo SDK 54** (RN 0.81.5, React 19.1.0, New
Architecture). Projeto **100% JavaScript** — TypeScript é evolução futura, não a
baseline atual; não migrar `.js` nem criar `tsconfig.json` fora de uma feature dedicada.

> **Antes de escrever qualquer código, leia os docs versionados do Expo 54:**
> https://docs.expo.dev/versions/v54.0.0/

- Use **`npx expo install`** para libs gerenciadas/compatíveis com o catálogo Expo.
- **Nenhuma dependência nova sem aprovação prévia** (verificar compatibilidade com
  SDK 54 / RN 0.81.5 / React 19.1 / New Architecture). Nenhuma lib só para substituir
  solução simples já existente.

## Fluxo SDD e Portões Humanos (nada de código antes dos portões)

Toda tarefa de desenvolvimento segue o fluxo Spec-Driven com **3 portões humanos**:

Specify → Clarify → Checklist → **🚦 Portão 1 (spec)** → Plan → **🚦 Portão 2 (plano)**
→ Tasks → Analyze → **🚦 Portão 3 (tasks/análise)** → Implement → Testes/validação →
Commit → Push.

- `clarify`, `checklist` e `analyze` são **parte do fluxo**, não opcionais.
- Mudanças descobertas na implementação **voltam** aos artefatos (spec/plan/tasks).
- **Rigor proporcional ao risco:** o tamanho dos artefatos acompanha o risco (bug isolado
  = spec curta; mudança em persistência/pagamento/progresso/segurança = fluxo completo +
  revisão independente).

## Git (regras invioláveis)

- **`git add` SEMPRE seletivo, caminho a caminho.** **Proibido `git add .` e `git add -A`.**
- **Um bloco lógico = um commit atômico.** Não misturar **código, assets e governança**
  no mesmo commit.
- **Sem push sem aprovação explícita** do responsável.
- Antes de cada commit, exibir **`git diff --cached --name-only`** e conferir que só os
  arquivos pretendidos estão staged.
- **Não versionar arquivos pessoais** (ex.: `.claude/settings.local.json`).
- Mensagens de commit em PT-BR no padrão `tipo: resumo`; quando aplicável, encerrar com a
  linha `Co-Authored-By:` do agente.

## Portões de qualidade (obrigatórios)

- **`npm run verify:runtime`** verde — é `bundle:check` **seguido de** `smoke`, na ordem
  (ver a regra de bundleabilidade abaixo).
- **`npx expo-doctor`** verde antes de concluir.
- Testes focados proporcionais ao risco; **teste de regressão** para bugs.
- **Validação visual** (print/vídeo) sempre que houver **UI** perceptível (mapa, tour,
  Livrinho, Ateliê, imagens, telas). **Validação em dispositivo físico** quando envolver
  toque, gestos, canvas, áudio, persistência, performance ou layout real.
- Smoke e expo-doctor **não substituem** a validação visual.

### Bundleabilidade — regra global e inegociável

**Toda alteração capaz de afetar o grafo executável exige, ANTES de qualquer outra coisa:**

```
npm run verify:runtime        # equivale a: npm run bundle:check && npm run smoke
```

Rodar os dois separadamente também vale — o que **não** vale é rodar só um deles.
`bundle:check` e `smoke` provam propriedades **disjuntas** e nenhum substitui o outro:

- **`npm run bundle:check`** prova **bundleabilidade**: o grafo executável a partir de
  `index.js` transforma e serializa sem erro. Pega **erro de sintaxe** e **falha de
  resolução de módulo/asset** em qualquer arquivo alcançável. **Não** executa nada.
- **`npm run smoke`** prova **regras de produto** com altíssima densidade — mas lê a
  maioria de `src/` **como texto**, e leitura textual **não parseia**.

**O gate de bundleabilidade é obrigatório antes de:**

1. declarar uma implementação **concluída**;
2. gerar **qualquer** EAS build;
3. **pedir validação física** ao responsável;
4. **encerrar um bloco de runtime**;
5. produzir o **commit final de implementação**.

**Superfícies que disparam a obrigação** (lista não exaustiva — na dúvida, rode):
`App.js` · `index.js` · `src/**` · `babel.config.js` · `metro.config.js` ·
`app.json`/`app.config.*` e qualquer configuração Expo capaz de afetar o bundle ·
`package.json` e `package-lock.json` quando mexem em dependências, `main` ou nos scripts
de gate · **imports, exports e assets alcançáveis** pelo grafo.

**Documentação pura não dispara a obrigação.** Alterar apenas `docs/**`, `specs/**`,
`README`, `AGENTS.md`/`CLAUDE.md` ou comentário de arquivo **não executável** não exige
`bundle:check`. Mas atenção: **comentário dentro de arquivo `.js` alcançável É código para
o parser** — foi exatamente assim que a Fase 6 perdeu meio dia (ver abaixo).

**Por que esta regra existe.** Incidente `BOOT/BUNDLE BLOCKED` de `F6-R3`: um bloco de
comentário mal fechado em `src/screens/AtelierCanvasScreen.js` deixou a árvore **incapaz
de gerar bundle por 10 commits**, enquanto `npm run smoke` reportava **4854/4854 verde**.
O defeito só apareceu na primeira inicialização física, num Samsung, depois de um build
nativo. Registro completo:
`specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/09_BOOT_BUNDLE_BLOCKED_ANDROID_E_GATE_DE_BUNDLEABILIDADE.md`.

**Premissa Android-only, com lacre automático.** `bundle:check` roda só para Android
porque o código próprio tem grafo idêntico entre Android e iOS. Essa premissa **não é
documental**: `npm run gate:platform-scope` (embutido em `bundle:check`) falha se surgir
qualquer arquivo próprio com sufixo `.ios.*`, `.android.*` ou `.native.*`, exigindo revisão
da cobertura para multiplataforma. **Não desative esse lacre para "fazer o gate passar".**

## Áreas protegidas (só com instrução direta)

Não alterar sem aprovação explícita: paywall, progresso, conquistas, `accessControl`,
manifestos de áudio/cenas, histórias, design system e **assets**.

- **`assets/stories/*` e demais assets:** **proibido `git add` amplo**; cada lote exige
  **auditoria própria** (inventário, validação, peso) e `git add` seletivo. Assets **não**
  se misturam a commits de código ou governança. Git LFS não é adotado automaticamente.
- Base64 é aceitável apenas de forma **transitória** no pipeline do canvas (Ateliê/Colorir);
  não persistir blobs grandes quando há caminho de arquivo (`file://`).

## Relatórios

Relatórios ao responsável em **PT-BR**, distinguindo corretamente o estado de cada arquivo:
**salvo no disco · untracked · modificado · staged/indexado · commitado · enviado ao
remoto**. Nunca usar "indexado" se nenhum `git add` ocorreu.

## Papel esperado de cada agente

- **Claude Code:** conduz o fluxo SDD (skills em `.claude/skills/`), interage nos portões
  humanos, faz diagnóstico/spec/plan/tasks, implementa, valida (smoke + expo-doctor +
  validação visual) e prepara commits seletivos. Lê `CLAUDE.md` (que importa este arquivo).
- **Codex:** segue **as mesmas regras deste arquivo**. Respeita os portões humanos, o
  `git add` seletivo, a proibição de push sem aprovação e os gates de qualidade. Não
  introduz dependências nem toca áreas protegidas sem aprovação.
- **CI (rede de segurança):** o workflow `.github/workflows/ci.yml` executa, no job `smoke`,
  **`npm run bundle:check` e depois `npm run smoke` — ambos gates DUROS** — e, em job
  separado, `npx expo-doctor` (informativo). Os dois gates duros ficam no mesmo job de
  propósito: esse é o nome do *required status check* já configurado. O CI é rede de
  segurança, **não** substituto do gate local: ele só roda em PR e nos pushes para as
  branches configuradas.
