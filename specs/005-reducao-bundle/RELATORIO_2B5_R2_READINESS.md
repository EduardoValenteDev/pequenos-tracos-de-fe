# Relatório de prontidão — Bloco 2 · Fase 2B.5 · R2 pack readiness gate

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.5 · **Etapa SDD:** 7–8 (Implement → execução/evidência).
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `77be545` · **Data:** 2026-07-07.
> **Natureza:** comprovação read-only. NÃO alterou runtime, `src/`, `assets/`, `app.json`, `assetBundlePatterns` nem `require` premium. NÃO tocou o R2 (só HTTP GET). Sem `git add`/commit/push.

## Como foi comprovado
Script novo read-only `scripts/assets-pipeline/verify-r2-pack-readiness.js` (Node CJS, só builtins + `node:https`, compatível Node 20). Compôs os validadores do runtime carregados **isolados** (sem Expo): `globalManifestService.validateGlobalContentManifest` (índice vivo), `packManifestService.validateManifest` (manifesto por-pack) e a ferramenta `validate-story-pack.js` (bytes + sha256 por arquivo). Arquivos baixados **apenas** para `os.tmpdir()` (fora do repo) e apagados ao fim.

Comando: `node scripts/assets-pipeline/verify-r2-pack-readiness.js --manifest-url <EXPO_PUBLIC_GLOBAL_MANIFEST_URL> --json`
Manifesto vivo: `pub-…r2.dev/content-manifest.json` (endpoint **r2.dev temporário**, via env) → **manifestVersion=1 · 18 packs · válido=true · 0 warnings**.

## Resultado — 18/18 em N3 verde
`N1` índice vivo · `N2` manifesto por-pack (âncora sha256 + validador runtime + 1 cover/10 scene/10 coloring/10 audio + N==cenas do app) · `N3` arquivos (bytes + sha256 por arquivo) · `N4` device.

| # | storyId | N1 | N2 | N3 | N4 | tamanho |
|--:|---|:--:|:--:|:--:|---|--:|
| 1 | david_goliath | ✓ | ✓ | ✓ | **done** (ref. 2B) | 17,74 MiB |
| 2 | jesus_children | ✓ | ✓ | ✓ | **done** (2B.5) | 19,13 MiB |
| 3 | daniel_lions | ✓ | ✓ | ✓ | batch-plan | 17,11 MiB |
| 4 | jonah_big_fish | ✓ | ✓ | ✓ | batch-plan | 17,61 MiB |
| 5 | lost_sheep | ✓ | ✓ | ✓ | batch-plan | 17,33 MiB |
| 6 | good_samaritan | ✓ | ✓ | ✓ | batch-plan | 18,37 MiB |
| 7 | abraham_stars | ✓ | ✓ | ✓ | batch-plan | 16,51 MiB |
| 8 | joseph_colorful_coat | ✓ | ✓ | ✓ | batch-plan | 19,55 MiB |
| 9 | moses_red_sea | ✓ | ✓ | ✓ | **done** (2B.5) | 19,81 MiB |
| 10 | ruth_naomi | ✓ | ✓ | ✓ | batch-plan | 17,88 MiB |
| 11 | esther_queen | ✓ | ✓ | ✓ | batch-plan | 18,20 MiB |
| 12 | miraculous_catch | ✓ | ✓ | ✓ | batch-plan | 18,15 MiB |
| 13 | samuel_hears_god | ✓ | ✓ | ✓ | batch-plan | 14,01 MiB |
| 14 | josiah_young_king | ✓ | ✓ | ✓ | batch-plan | 16,49 MiB |
| 15 | solomon_wisdom | ✓ | ✓ | ✓ | batch-plan | 16,44 MiB |
| 16 | mary_says_yes | ✓ | ✓ | ✓ | **done** (2B.5) | 18,77 MiB |
| 17 | timothy_faith | ✓ | ✓ | ✓ | batch-plan | 16,59 MiB |
| 18 | jesus_temple | ✓ | ✓ | ✓ | batch-plan | 18,37 MiB |

**N1–N3: 18/18 verde. Sem divergências, sem hash quebrado, sem pack ausente/incompleto.** Total ≈ **318,06 MiB** (333,5 MB decimais). Cada pack = 31 arquivos (1 cover + 10 cenas + 10 colorir + 10 áudio).

## Cobertura N4 (device) — acordada
- **`done`:** `david_goliath` (validado na 2B) + `moses_red_sea`, `jesus_children`, `mary_says_yes` (**validados no iPhone em 2026-07-07** — download, estado pronto, modo avião, Narração/Colorir/Livrinho offline OK).
- **`batch-plan`:** as 14 restantes, em lotes antes da 2C final.

## Veredito do gate 2C
- **Bloqueador automático (N1–N3): REMOVIDO** — os 18 estão publicados, íntegros e baixáveis.
- **Cobertura N4 acordada nesta fase: CUMPRIDA** — referência + as 3 histórias validadas em device.
- **⚠️ NOVO bloqueador (segurança de receita): a 2C permanece BLOQUEADA pela Fase 2B.6** — hoje o download é liberado para qualquer premium remote quando premium active é verdadeiro; sem política de acesso/download, um mês de assinatura viraria acesso vitalício offline. A 2C só volta à discussão **após a 2B.6 estar implementada, validada e publicada** (ver `spec-fase-2b6.md`).
- **Regra mantida:** qualquer pack abaixo de N3, cobertura N4 não cumprida, **ou 2B.6 não concluída** → 2C bloqueada.

## Gates e invariantes
- `npm run smoke`: **1826/1826** ✓ · `npx expo-doctor`: **18/18** ✓ (runtime intocado — o script não é importado pelo app).
- `src/`, `assets/`, `app.json`, `assetBundlePatterns`, `require` premium: **intocados**. Sem lixo de temp no repo (baixados em `os.tmpdir()`, apagados).

## Próximos passos (fora desta trilha)
1. ✅ Device N4 das 3 histórias (concluído em 2026-07-07).
2. **Fase 2B.6 · Política de acesso e download premium** (bloqueador de receita, pré-requisito da 2C) — `spec-fase-2b6.md`.
3. Lote N4 das 14 restantes.
4. Só após 2B.6 concluída **e** N4 completa → abrir a discussão da 2C (spec própria: `assetBundlePatterns` + strip de `require` premium).
