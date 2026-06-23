<!--
Checklist de governança deste repositório. As REGRAS completas vivem em AGENTS.md
(fonte compartilhada para Claude Code, Codex e outros agentes). Este template é só um
lembrete operacional — em caso de dúvida ou conflito, vale o AGENTS.md e a Constituição.
-->

## O que este PR faz

<!-- Descreva objetivamente a mudança e o porquê. -->

## Tipo de mudança

- [ ] Correção (bug)
- [ ] Conteúdo / assets (auditados separadamente)
- [ ] Feature
- [ ] Governança / CI / documentação

## Checklist de governança (obrigatório)

- [ ] **Portões humanos** do fluxo SDD respeitados (spec → plano → tasks/análise aprovados antes do código).
- [ ] **`npm run smoke`** verde.
- [ ] **`npx expo-doctor`** verde.
- [ ] **Validação visual** feita quando há UI (print/vídeo; device físico se envolver toque/canvas/áudio/persistência/layout).
- [ ] **`git add` seletivo** (caminho a caminho) — **sem `git add .` / `git add -A`**.
- [ ] **Assets e `assets/stories/*`** não entraram por comando amplo; cada lote tem auditoria própria e não se mistura a commits de código/governança.
- [ ] **Áreas protegidas** (paywall, progresso, conquistas, `accessControl`, manifestos de áudio/cenas, histórias, design system) só foram tocadas com instrução direta.
- [ ] **Sem dependência nova** sem aprovação prévia; **sem secrets** adicionados.
- [ ] **Sem push** sem aprovação explícita do responsável.

## Validação

<!-- Cole o resultado do smoke/expo-doctor e, se houver UI, anexe print/vídeo. -->

---

> Regras completas: ver [`AGENTS.md`](../AGENTS.md). Proteção de branch: ver [`docs/BRANCH_PROTECTION_GUIDE.md`](../docs/BRANCH_PROTECTION_GUIDE.md).
