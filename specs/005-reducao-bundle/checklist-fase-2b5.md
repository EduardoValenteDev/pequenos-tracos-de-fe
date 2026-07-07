# Checklist de requisitos — Fase 2B.5 (R2 pack readiness gate)

> **Etapa SDD 3.** Valida a QUALIDADE dos requisitos da `spec-fase-2b5.md` antes do Plan. Todos os itens devem estar ✅ para avançar.

| # | Item de qualidade | Status | Evidência |
|---|---|---|---|
| CHK1 | Escopo in/out claro, sem sobreposição com 2C (esta trilha só prova/relata) | ✅ | spec §2, §9 |
| CHK2 | Os 18 storyIds derivam de fonte única (`getStoriesByLayer('remote')`), não hardcode-como-verdade | ✅ | spec §3; `contentManifest.js` |
| CHK3 | Cada nível N1–N4 tem prova objetiva e verificável | ✅ | spec §5 (tabela) |
| CHK4 | Critério de "pronto" inequívoco: **N3 obrigatório; N2 insuficiente** | ✅ | spec §5 (decisão do Portão) |
| CHK5 | Falhas cobrem ausente / incompleto / hash divergente, sem ação destrutiva | ✅ | spec §6 |
| CHK6 | Regras read-only explícitas: não escreve `src/` nem `assets/`; temp fora do repo; sem upload | ✅ | spec §7, §9 |
| CHK7 | Cobertura N4 definida: referência + 2–3 agora + plano de lote | ✅ | spec §5 (RF5) |
| CHK8 | Gate da 2C definido: 18/18 N3 verde + N4 acordada documentada; qualquer N3 falho → bloqueado | ✅ | spec §5 |
| CHK9 | Sem dependência nova: só builtins (`fs/path/crypto/os/child_process/https`); compatível com o **Node 20 do CI** (sem `fetch` global) | ✅ | `ci.yml` node 20; `validate-story-pack` já usa `crypto`/`fs` nativos |
| CHK10 | Rastreabilidade spec↔plan↔tasks preservada | ✅ | specs/005-reducao-bundle/ |
| CHK11 | Nenhum `[NEEDS CLARIFICATION]` em aberto (3 resolvidos no Portão 1) | ✅ | mensagem de aprovação (2026-07-07) |
| CHK12 | Reuso do validador de runtime (prova de compatibilidade, sem importar Expo) | ✅ | `globalManifestService.validateGlobalContentManifest` + `packManifestService.validateManifest` |

**Resultado:** 12/12 ✅ — requisitos prontos para o Plan.
