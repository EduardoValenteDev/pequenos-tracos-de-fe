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

- **`npm run smoke`** verde **e** **`npx expo-doctor`** verde antes de concluir.
- Testes focados proporcionais ao risco; **teste de regressão** para bugs.
- **Validação visual** (print/vídeo) sempre que houver **UI** perceptível (mapa, tour,
  Livrinho, Ateliê, imagens, telas). **Validação em dispositivo físico** quando envolver
  toque, gestos, canvas, áudio, persistência, performance ou layout real.
- Smoke e expo-doctor **não substituem** a validação visual.

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
- **CI (rede de segurança):** o workflow `.github/workflows/ci.yml` executa `npm run smoke`
  (gate duro) e `npx expo-doctor` (informativo) — independente de qual agente escreveu o
  código.
