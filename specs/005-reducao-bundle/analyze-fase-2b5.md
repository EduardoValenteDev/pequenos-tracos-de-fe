# Analyze — Bloco 2 · Fase 2B.5 · R2 pack readiness gate

> **Etapa SDD 6.** Consistência spec↔plan↔tasks **antes** de implementar. Entrada: [spec](./spec-fase-2b5.md) · [plan](./plan-fase-2b5.md) · [tasks](./tasks-fase-2b5.md) · [checklist](./checklist-fase-2b5.md).

## 1. Cobertura (RF → Plan → Task)
| Requisito (spec) | Plan | Task(s) | OK |
|---|---|---|---|
| RF1 — manifesto vivo | §2 | C1, C2 | ✅ |
| RF2 — url/bytes/sha256/kinds por pack | §3 (N1-pack) | D1 | ✅ |
| RF3 — cover/scene/coloring/audio + âncora | §3 (N2) | D2, D3 | ✅ |
| RF4 — integridade `validate-story-pack` | §5 | E1, E2 | ✅ |
| RF5 — device N4 (ref + 2–3 + lote) | §8, §5 | F1, G3 | ✅ |
| Descoberta dos 18 (fonte única) | §1 | A3 | ✅ |
| Cross-check N (cenas do app) | §6 | D3 | ✅ |
| Tabela N1–N4 + `--json` | §7 | F1, F2 | ✅ |
| Veredito do gate 2C | §9 | F2, G2 | ✅ |

**Sem RF órfão; sem task sem RF.**

## 2. Consistência entre artefatos
- **Ajuste Node 20 propagado:** Plan (Abordagem + seção "Compatibilidade") e Tasks (B1/B2 `node:https`) usam builtins; **checklist CHK9 corrigido** (removida a menção a `fetch` global). Sem resíduo de "Node 24"/"fetch/AbortController" nos passos de implementação. ✅
- **N3 obrigatório** aparece igual em spec §5, plan §9 e tasks F2 (exit) — coerente. ✅
- **N4** (device) tratado como **declarado** (não auto-verificável) em plan §7 e task F1; execução real em G3 — sem promessa de automação indevida. ✅
- **Reuso de validadores do runtime** (globalManifestService, packManifestService) consistente em plan §2/§3 e tasks C2/D2 (via `loadIsolated`), como o `validate-story-pack` já faz. ✅

## 3. Regras invioláveis → guarda concreta
| Regra | Onde é garantida |
|---|---|
| Não escrever em `src/`/`assets/` | Task **A1** (guard de escrita que aborta) + temp em `os.tmpdir()` |
| Não alterar runtime | script novo **não** importado pelo app; H1 confirma `smoke` intocado |
| Não tocar R2 / sem upload | só `httpGetBuffer`/`httpGetToFile` (GET) — B1/B2 |
| Não `app.json`/`assetBundlePatterns`/requires | fora do escopo; H1 verifica por `git status`/grep |
| Não alterar `validate-story-pack.js` | E2 invoca por subprocesso |
| Sem dependência nova | só builtins (CHK9); Node 20 |
| Sem `git add`/commit/push | H2 |
| Parar se validador exigir editar `src/` | plan "Compatibilidade" + prevê PARADA antes |

## 4. Ambiguidades / clarifications
Nenhum `[NEEDS CLARIFICATION]` aberto — os 3 do Portão 1 foram resolvidos e o ajuste Node 20 do Portão 2 foi incorporado. ✅

## 5. Riscos
- **Baixo (runtime):** nada no app muda; pior caso do script = relatório apontando packs "não prontos" (resultado legítimo → 2C segue bloqueada).
- **Operacional:** depende de rede + URL do manifesto vivo; tratado com erro estruturado (C1/B1).
- **Compat. de carga isolada:** se algum validador não carregar sem editar `src/`, a task **PARA antes** (não edita `src/`) e reporta — risco endereçado no Plan.

## 6. Veredito
**CONSISTENTE.** Spec, Plan, Tasks e Checklist estão alinhados, sem lacuna de cobertura, sem contradição e sem violação de escopo. Pronto para o **Portão 3**.
