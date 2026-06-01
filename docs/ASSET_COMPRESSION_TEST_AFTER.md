# Asset Compression Test — DEPOIS da Compressão (Estimativas)

**Status:** Estimativas baseadas em benchmarks do pngquant para tipos de imagem equivalentes.
**pngquant disponível no ambiente:** NÃO — instalar em macOS/Linux para aplicar.
**Compressão testada em:** `tmp/asset-compression-test/` (cópia dos originais)
**Originais:** INTACTOS em `assets/stories/` e `assets/images/`

### Parâmetro recomendado para teste:
```bash
# --nofs = sem dithering (CRÍTICO para linearts — evita ruído visual)
# --quality 75-85 = qualidade alta conservando detalhes
# --strip = remove metadados EXIF desnecessários
pngquant --quality 75-85 --nofs --strip --ext .png --force tmp/asset-compression-test/colorir/**/*.png
```

---

## Estimativas de resultado

| # | Arquivo | Antes | Depois (est.) | Redução est. | Nota |
|---|---|---|---|---|---|
| 1 | `noe_scene_01_coloring.png` | 1171 KB | ~117 KB | ~90% | Lineart — comprime muito bem |
| 2 | `noe_scene_02_coloring.png` | 1071 KB | ~107 KB | ~90% | Lineart — comprime muito bem |
| 3 | `noe_scene_03_coloring.png` | 1135 KB | ~114 KB | ~90% | Lineart — comprime muito bem |
| 4 | `noe_scene_04_coloring.png` | 1100 KB | ~110 KB | ~90% | Lineart — comprime muito bem |
| 5 | `noe_scene_05_coloring.png` | 1319 KB | ~132 KB | ~90% | Lineart — comprime muito bem |
| 6 | `noe_scene_06_coloring.png` | 998 KB | ~100 KB | ~90% | Lineart — comprime muito bem |
| 7 | `noe_scene_07_coloring.png` | 1108 KB | ~111 KB | ~90% | Lineart — comprime muito bem |
| 8 | `noe_scene_08_coloring.png` | 1061 KB | ~106 KB | ~90% | Lineart — comprime muito bem |
| 9 | `noe_scene_09_coloring.png` | 1122 KB | ~112 KB | ~90% | Lineart — comprime muito bem |
| 10 | `noe_scene_10_coloring.png` | 1186 KB | ~119 KB | ~90% | Lineart — comprime muito bem |
| 11 | `davi_scene_01_coloring.png` | 1134 KB | ~113 KB | ~90% | Lineart — comprime muito bem |
| 12 | `davi_scene_02_coloring.png` | 1175 KB | ~118 KB | ~90% | Lineart — comprime muito bem |
| 13 | `davi_scene_03_coloring.png` | 1248 KB | ~125 KB | ~90% | Lineart — comprime muito bem |
| 14 | `davi_scene_04_coloring.png` | 1107 KB | ~111 KB | ~90% | Lineart — comprime muito bem |
| 15 | `davi_scene_05_coloring.png` | 1199 KB | ~120 KB | ~90% | Lineart — comprime muito bem |
| 16 | `davi_scene_06_coloring.png` | 1087 KB | ~109 KB | ~90% | Lineart — comprime muito bem |
| 17 | `davi_scene_07_coloring.png` | 1055 KB | ~106 KB | ~90% | Lineart — comprime muito bem |
| 18 | `davi_scene_08_coloring.png` | 1167 KB | ~117 KB | ~90% | Lineart — comprime muito bem |
| 19 | `davi_scene_09_coloring.png` | 1326 KB | ~133 KB | ~90% | Lineart — comprime muito bem |
| 20 | `davi_scene_10_coloring.png` | 1174 KB | ~117 KB | ~90% | Lineart — comprime muito bem |
| 21 | `jesus_children_scene_01_coloring.png` | 1357 KB | ~136 KB | ~90% | Lineart — comprime muito bem |
| 22 | `jesus_children_scene_02_coloring.png` | 1239 KB | ~124 KB | ~90% | Lineart — comprime muito bem |
| 23 | `jesus_children_scene_03_coloring.png` | 1132 KB | ~113 KB | ~90% | Lineart — comprime muito bem |
| 24 | `jesus_children_scene_04_coloring.png` | 1158 KB | ~116 KB | ~90% | Lineart — comprime muito bem |
| 25 | `jesus_children_scene_05_coloring.png` | 1229 KB | ~123 KB | ~90% | Lineart — comprime muito bem |
| 26 | `jesus_children_scene_06_coloring.png` | 1116 KB | ~112 KB | ~90% | Lineart — comprime muito bem |
| 27 | `jesus_children_scene_07_coloring.png` | 1315 KB | ~132 KB | ~90% | Lineart — comprime muito bem |
| 28 | `jesus_children_scene_08_coloring.png` | 1273 KB | ~127 KB | ~90% | Lineart — comprime muito bem |
| 29 | `jesus_children_scene_09_coloring.png` | 1243 KB | ~124 KB | ~90% | Lineart — comprime muito bem |
| 30 | `jesus_children_scene_10_coloring.png` | 1272 KB | ~127 KB | ~90% | Lineart — comprime muito bem |
| 31 | `noe_arcoiris_capa.png` | 1513 KB | ~227 KB | ~85% | Ilustração — boa compressão |
| 32 | `davi_golias_capa.png` | 1554 KB | ~233 KB | ~85% | Ilustração — boa compressão |
| 33 | `jesus_criancas_capa.png` | 1778 KB | ~267 KB | ~85% | Ilustração — boa compressão |
| 34 | `noe_sorrindo.png` | 1485 KB | ~252 KB | ~83% | Personagem — boa compressão |
| 35 | `noe_apontando.png` | 720 KB | ~122 KB | ~83% | Personagem — boa compressão |

---

## Impacto estimado

| Métrica | Antes | Depois (est.) | Economia |
|---|---|---|---|
| Total 35 arquivos | 41.3 MB | ~4.5 MB | ~36.8 MB |
| Imagens de colorir (30) | ~34.5 MB | ~3.4 MB | ~31.0 MB |
| Projeção 200 colorir | ~230 MB | ~23 MB | ~207 MB |

---

## Riscos de compressão para imagens de colorir

| Risco | Probabilidade com --nofs --quality 75-85 | Mitigação |
|---|---|---|
| Linhas pretas com ruído | Baixa (--nofs desabilita dithering) | Inspecionar zoom 200% |
| Fundo branco acinzentado | Muito baixa (linearts têm poucas cores) | Testar flood fill |
| Flood fill com vazamento | Baixa se luminância ≥ 210 preservada | Testar manual no app |
| Perda de detalhe em traços finos | Muito baixa com qualidade ≥ 75 | Inspecionar border areas |
| Artefatos em áreas de anti-aliasing | Baixa-média | Aceitar se não visível em device |

---

## Próximo passo

1. Instalar pngquant em macOS/Linux
2. Executar o script de compressão na pasta de TESTE primeiro:
   ```bash
   pngquant --quality 75-85 --nofs --strip --ext .png --force \
     tmp/asset-compression-test/colorir/noe/*.png \
     tmp/asset-compression-test/colorir/davi_golias/*.png \
     tmp/asset-compression-test/colorir/jesus_criancas/*.png
   ```
3. Comparar tamanhos: `node scripts/report-image-sizes.js`
4. Validar visualmente (ver COLORING_IMAGE_QA_CHECKLIST.md)
5. Se OK → aplicar nos originais com backup git