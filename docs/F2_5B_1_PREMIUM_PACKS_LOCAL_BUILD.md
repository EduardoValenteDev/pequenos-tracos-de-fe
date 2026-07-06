# F2.5b.1 — Construção local e validação dos packs premium

> **Bloco:** F2.5b.1 (construção local + validação + relatório; **sem upload R2, sem runtime, sem alterar assets/código, sem commit/push**). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `2b552b1`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** SUPERSEDED não usados como fonte.

> **ATUALIZAÇÃO F2.5b.1a (2026-07-05):** o blocker de capa (§7) foi resolvido com um **patch mínimo no build script** (resolver a capa via `src/assets/storyCovers.js`). **Resultado: 18/18 packs construídos e 18/18 válidos**, todas as capas normalizadas para `cover.webp`. Detalhes no §7 e §11.

## 1. Objetivo
Construir **localmente** (fora do repo) os 18 packs premium com o builder existente, **validar** cada um e preparar o relatório para a etapa de upload (F2.5b.2). **Não** faz upload, **não** toca runtime/assets/código.

## 2. Estado inicial da branch
`content-integrate-coloring-3` · HEAD **`2b552b1`** (`docs: record f2.5a premium packs audit plan`) · **local == origin** · working tree **limpo**. Confirmado **limpo também ao fim** (o builder só lê/copia).

## 3. Relação com F2.5a
Executa a etapa **F2.5b** do plano do F2.5a (`docs/F2_5A_...`). Confirma na prática o **risco R-2** (nomes PT das capas) — ver §7.

## 4. Scripts usados (existentes, inalterados)
- `scripts/assets-pipeline/build-story-pack.js` — `--story <id> --out <dir> [--version 1.0.0]`; **recusa gravar dentro do repo**; só **copia** (origem intacta); gera `manifest.json` + `pack.sha256` + `cover.webp` + `scenes/` + `coloring/` + `audio/`; sha256 (crypto nativo) por arquivo + self-check.
- `scripts/assets-pipeline/validate-story-pack.js` — `--story <id> --out <dir>`; 10 checagens (manifest válido pelo **mesmo validador do runtime**, contagem 1+N+N+N, extensões, convenção de path do `contentResolver`, bytes+sha256 por arquivo, `totalBytes`, `pack.sha256` = sha256 do manifest).

## 5. Diretório de saída
**`C:\tmp\ptf_f2_5b1_packs`** — **fora do repositório** (o próprio builder aborta se o destino estiver dentro do repo). Não mistura com `assets/` oficiais. Layout: `<out>/packs/<storyId>/v1/{manifest.json, pack.sha256, cover.webp, scenes/, coloring/, audio/}`.

## 6. Tabela dos 18 packs
Resultado **após F2.5b.1a** (capa via `storyCovers.js`). Todas as capas foram **normalizadas para `cover.webp`** dentro do pack (verificado por sha256: `cover.webp` == arquivo-fonte PT/EN).

| storyId | cenas | colorir | áudio | capa (fonte local → pack) | tamanho | validação |
|---|---|---|---|---|---|---|
| david_goliath | 10 | 10 | 10 | `david_goliath_cover.webp` (EN) → `cover.webp` | 17,74 MB | **VÁLIDO ✓** |
| jesus_children | 10 | 10 | 10 | `jesus_children_cover.webp` (EN) → `cover.webp` | 19,13 MB | **VÁLIDO ✓** |
| daniel_lions | 10 | 10 | 10 | `daniel_leoes_cover.webp` (PT) → `cover.webp` | 17,11 MB | **VÁLIDO ✓** |
| esther_queen | 10 | 10 | 10 | `ester_rainha_cover.webp` (PT) → `cover.webp` | 18,20 MB | **VÁLIDO ✓** |
| lost_sheep | 10 | 10 | 10 | `ovelha_perdida_cover.webp` (PT) → `cover.webp` | 17,33 MB | **VÁLIDO ✓** |
| good_samaritan | 10 | 10 | 10 | `bom_samaritano_cover.webp` (PT) → `cover.webp` | 18,37 MB | **VÁLIDO ✓** |
| abraham_stars | 10 | 10 | 10 | `abraao_estrelas_cover.webp` (PT) → `cover.webp` | 16,51 MB | **VÁLIDO ✓** |
| joseph_colorful_coat | 10 | 10 | 10 | `jose_tunica_cover.webp` (PT) → `cover.webp` | 19,55 MB | **VÁLIDO ✓** |
| moses_red_sea | 10 | 10 | 10 | `moises_mar_vermelho_cover.webp` (PT) → `cover.webp` | 19,81 MB | **VÁLIDO ✓** |
| ruth_naomi | 10 | 10 | 10 | `rute_noemi_cover.webp` (PT) → `cover.webp` | 17,88 MB | **VÁLIDO ✓** |
| miraculous_catch | 10 | 10 | 10 | `pesca_milagrosa_cover.webp` (PT) → `cover.webp` | 18,15 MB | **VÁLIDO ✓** |
| jonah_big_fish | 10 | 10 | 10 | `jonas_peixe_cover.webp` (PT) → `cover.webp` | 17,61 MB | **VÁLIDO ✓** |
| samuel_hears_god | 10 | 10 | 10 | `samuel_ouve_cover.webp` (PT) → `cover.webp` | 14,01 MB | **VÁLIDO ✓** |
| josiah_young_king | 10 | 10 | 10 | `josias_rei_jovem_cover.webp` (PT) → `cover.webp` | 16,49 MB | **VÁLIDO ✓** |
| solomon_wisdom | 10 | 10 | 10 | `salomao_sabedoria_cover.webp` (PT) → `cover.webp` | 16,44 MB | **VÁLIDO ✓** |
| mary_says_yes | 10 | 10 | 10 | `maria_boa_noticia_cover.webp` (PT) → `cover.webp` | 18,77 MB | **VÁLIDO ✓** |
| timothy_faith | 10 | 10 | 10 | `timoteo_fe_cover.webp` (PT) → `cover.webp` | 16,59 MB | **VÁLIDO ✓** |
| jesus_temple | 10 | 10 | 10 | `jesus_templo_cover.webp` (PT) → `cover.webp` | 18,37 MB | **VÁLIDO ✓** |

**Construídos e validados: 18/18.** Cada pack = 31 arquivos (1 cover + 10 scenes + 10 coloring + 10 audio) + `manifest.json` + `pack.sha256`; `validate-story-pack.js` → `runtime validateManifest: ACEITO` + `RESULTADO: VÁLIDO ✓`. **Total gerado: 318,1 MB** (bate com a projeção do F2.5a).

## 7. Problemas encontrados — BLOCKER (R-2 confirmado)
- **Causa exata:** `build-story-pack.js` (linha 72) monta a fonte da capa como `assets/images/${storyId}_cover.webp` (nome **inglês** do storyId) e aborta se o arquivo não existir (linha 161–162, "Assets de origem ausentes"). Prova (daniel_lions): `ERRO: Assets de origem ausentes: …\assets\images\daniel_lions_cover.webp`.
- **Realidade:** apenas `david_goliath` e `jesus_children` têm capa com nome inglês. As outras **16 têm nome PT** (ex.: `daniel_leoes_cover.webp`) — mapeadas em `src/assets/storyCovers.js`. O builder **não consulta** esse registry.
- **Impacto:** com o builder atual, só 2 dos 18 packs podem ser construídos. **Nenhum dado de origem está errado** — cenas/colorir/áudio seguem o padrão do pack perfeitamente (F2.5a) e a capa **existe** (só com nome PT).
- **✅ RESOLVIDO no F2.5b.1a — patch mínimo no build script** (`scripts/assets-pipeline/build-story-pack.js`, **dev tooling, NÃO runtime**): nova função `resolveCoverSource(storyId)` que lê `src/assets/storyCovers.js` **como TEXTO** (sem importar RN/Expo — mesma técnica de `readStoryTitle`), extrai por regex o `require('../../assets/images/<arquivo>')` do storyId e devolve o caminho local (nome PT/EN). **Fallback compatível:** se o registry não tiver ou o arquivo não existir, cai no `assets/images/<id>_cover.webp` (comportamento antigo). `sourcePaths().cover` passou a usar essa função. O `rel` continua **`cover.webp`** → a **normalização no pack não mudou**. **Nada** de asset foi renomeado/alterado; **nenhum** import do app foi tocado (o registry é só **lido**).

## 8. O que foi gerado localmente (após F2.5b.1a)
- **18/18 packs** em `C:\tmp\ptf_f2_5b1_packs\packs\<id>\v1\` — cada um: `cover.webp` + `scenes/` (10) + `coloring/` (10) + `audio/` (10) + `manifest.json` + `pack.sha256` (31 arquivos). Todos **validados** (`RESULTADO: VÁLIDO ✓`).
- **Total gerado: 318,1 MB** (média 17,7 MB/pack) — bate com a projeção do F2.5a.
- **Capas normalizadas:** verificado por sha256 que `cover.webp` de cada pack == arquivo-fonte (ex.: `daniel_lions/v1/cover.webp` == `daniel_leoes_cover.webp`).
- **`david_goliath` com a cena 02 NOVA:** sha256 de `packs/david_goliath/v1/scenes/david_goliath_scene_02.webp` == o asset publicado (306.948 bytes); `totalBytes 18.604.321` vs o pack no R2 `18.532.477` (arte antiga) ⇒ na **F2.5b.2** o `david_goliath` deve ser **reenviado** e o manifesto global atualizado (bytes+sha256).

## 9. O que NÃO foi feito
Sem upload R2; **sem alterar runtime/imports/código do app**; sem alterar/renomear/mover/converter assets originais (só cópia para fora do repo); sem tocar áudio/manifests do repo; sem BR0.1; sem commit/push. Único arquivo de código alterado = **o build script** (`build-story-pack.js`, ferramenta dev) — escopo explicitamente autorizado neste bloco.

## 10. Critérios de aceite para seguir ao F2.5b.2 (upload R2)
1. **F2.5b.1a aprovado e aplicado:** builder resolve a capa via `storyCovers.js` → **18/18** construídos.
2. **18/18 validados** por `validate-story-pack.js` (integridade + convenção + compatibilidade com runtime).
3. `manifest.json` + `pack.sha256` corretos por pack; `content-manifest.json` global consolidando os 18 (bytes+sha256+baseUrl).
4. `david_goliath` reconstruído com a **cena 02 nova** (para não subir arte antiga).
5. Gates verdes; nenhum asset original/runtime alterado.
6. Destino continua **fora do repo**; nada de pack entra no Git.
