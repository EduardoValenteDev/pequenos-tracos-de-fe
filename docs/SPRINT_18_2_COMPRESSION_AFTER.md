# Sprint 18.2 — Compressão DEPOIS (dados reais)

**Data:** 2026-06-01
**Ferramenta:** Python 3.12 + Pillow 12.2.0 (quantizacao de paleta)
**Parâmetros:** `--colors 128 --dither NONE --compress_level 9 --skip-if-larger`
**Pasta testada:** `tmp/asset-compression-test/compressed/`
**Originais:** INTACTOS ✓

---

## Resultado geral

| Métrica | Valor |
|---|---|
| Total antes | 42606.8 KB (41.61 MB) |
| Total depois | 3676.1 KB (3.59 MB) |
| **Redução total** | **91.4%** |
| Arquivos processados | 36 |
| Arquivos comprimidos | 36 |
| Inalterados (eram maiores) | 0 |
| Erros | 0 |

---

## Detalhe por arquivo

| # | Arquivo | Antes | Depois | Redução |
|---|---|---|---|---|
| 1 | `capas\davi_golias_capa.png` | 1553.9 KB | 277.7 KB | **82.1%** |
| 2 | `capas\jesus_criancas_capa.png` | 1778.3 KB | 329.2 KB | **81.5%** |
| 3 | `capas\noe_arcoiris_capa.png` | 1513.3 KB | 225.2 KB | **85.1%** |
| 4 | `colorir\davi_golias\davi_scene_01_coloring.png` | 1134.2 KB | 67.5 KB | **94%** |
| 5 | `colorir\davi_golias\davi_scene_02_coloring.png` | 1174.8 KB | 78.2 KB | **93.3%** |
| 6 | `colorir\davi_golias\davi_scene_03_coloring.png` | 1247.5 KB | 84 KB | **93.3%** |
| 7 | `colorir\davi_golias\davi_scene_04_coloring.png` | 1107.1 KB | 66.8 KB | **94%** |
| 8 | `colorir\davi_golias\davi_scene_05_coloring.png` | 1198.7 KB | 77.5 KB | **93.5%** |
| 9 | `colorir\davi_golias\davi_scene_06_coloring.png` | 1087.2 KB | 63.9 KB | **94.1%** |
| 10 | `colorir\davi_golias\davi_scene_07_coloring.png` | 1054.9 KB | 55.9 KB | **94.7%** |
| 11 | `colorir\davi_golias\davi_scene_08_coloring.png` | 1167.3 KB | 75.2 KB | **93.6%** |
| 12 | `colorir\davi_golias\davi_scene_09_coloring.png` | 1325.8 KB | 62.4 KB | **95.3%** |
| 13 | `colorir\davi_golias\davi_scene_10_coloring.png` | 1174.3 KB | 81.2 KB | **93.1%** |
| 14 | `colorir\jesus_criancas\jesus_children_scene_01_coloring.png` | 1357.2 KB | 74.2 KB | **94.5%** |
| 15 | `colorir\jesus_criancas\jesus_children_scene_02_coloring.png` | 1238.9 KB | 90.5 KB | **92.7%** |
| 16 | `colorir\jesus_criancas\jesus_children_scene_03_coloring.png` | 1131.7 KB | 80 KB | **92.9%** |
| 17 | `colorir\jesus_criancas\jesus_children_scene_04_coloring.png` | 1158.2 KB | 83.8 KB | **92.8%** |
| 18 | `colorir\jesus_criancas\jesus_children_scene_05_coloring.png` | 1229.3 KB | 86.1 KB | **93%** |
| 19 | `colorir\jesus_criancas\jesus_children_scene_06_coloring.png` | 1116.4 KB | 73.4 KB | **93.4%** |
| 20 | `colorir\jesus_criancas\jesus_children_scene_07_coloring.png` | 1314.7 KB | 91.2 KB | **93.1%** |
| 21 | `colorir\jesus_criancas\jesus_children_scene_08_coloring.png` | 1272.8 KB | 95.8 KB | **92.5%** |
| 22 | `colorir\jesus_criancas\jesus_children_scene_09_coloring.png` | 1243.5 KB | 84.7 KB | **93.2%** |
| 23 | `colorir\jesus_criancas\jesus_children_scene_10_coloring.png` | 1272.2 KB | 91.7 KB | **92.8%** |
| 24 | `colorir\noe\noe_scene_01_coloring.png` | 1171.1 KB | 72.2 KB | **93.8%** |
| 25 | `colorir\noe\noe_scene_02_coloring.png` | 1070.7 KB | 61.8 KB | **94.2%** |
| 26 | `colorir\noe\noe_scene_03_coloring.png` | 1135.3 KB | 68.7 KB | **93.9%** |
| 27 | `colorir\noe\noe_scene_04_coloring.png` | 1100.2 KB | 68.6 KB | **93.8%** |
| 28 | `colorir\noe\noe_scene_05_coloring.png` | 1319.2 KB | 58.3 KB | **95.6%** |
| 29 | `colorir\noe\noe_scene_06_coloring.png` | 998.3 KB | 46.3 KB | **95.4%** |
| 30 | `colorir\noe\noe_scene_07_coloring.png` | 1108.4 KB | 63.3 KB | **94.3%** |
| 31 | `colorir\noe\noe_scene_08_coloring.png` | 1060.5 KB | 57.7 KB | **94.6%** |
| 32 | `colorir\noe\noe_scene_09_coloring.png` | 1122 KB | 73.5 KB | **93.4%** |
| 33 | `colorir\noe\noe_scene_10_coloring.png` | 1186.3 KB | 76.8 KB | **93.5%** |
| 34 | `narration\noe_apontando.png` | 719.5 KB | 133.3 KB | **81.5%** |
| 35 | `narration\noe_sorrindo.png` | 1485.2 KB | 228.9 KB | **84.6%** |

---

## Análise de flood fill safety

Verificado via `verify-flood-fill-safety.py` (threshold = luminância ≥ 210).

### Imagens de colorir (30 arquivos) — RESULTADO: SEGURO

| Resultado | Arquivos | Detalhe |
|---|---|---|
| OK (cinza ≤ 2%, min_white_lum ≥ 214) | 28/30 | Flood fill totalmente seguro |
| Borderline (cinza 2.0-2.2%, min_white_lum = 214-215) | 2/30 | `jesus_children_scene_02` e `_scene_08` — ainda acima do threshold 210 |

**Conclusão:** Todos os 30 arquivos de colorir têm min_white_lum ≥ 214, acima do threshold de 210 do ColoringCanvas. **Seguro para aplicar nos originais.**

### Capas e narração — NÃO usam flood fill

As capas e imagens de narração são ilustrações ricas com muitos tons intermediários. A análise de luminância "RISCO" nesses arquivos é **um falso positivo** — essas imagens não são usadas no ColoringCanvas.

---

## Projeção de impacto nos builds

| Cenário | Sem compressão | Com compressão | Diferença |
|---|---|---|---|
| 30 colorir atuais | 34.5 MB | 2.2 MB | -32.3 MB |
| 200 colorir (20 histórias) | ~230 MB | ~14 MB | -215 MB |
| 3 capas | 4.7 MB | 0.8 MB | -3.9 MB |