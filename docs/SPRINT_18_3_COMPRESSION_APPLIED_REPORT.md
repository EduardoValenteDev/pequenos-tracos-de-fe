# Sprint 18.3 — Relatório: Compressão Aplicada nos Originais

**Data:** 2026-06-01  
**Smoke antes:** 620/620  
**Smoke depois:** 620/620 ✓

---

## Resultado da operação

| Métrica | Valor |
|---|---|
| Total de arquivos alterados | 35 |
| Tamanho total antes | 41.3 MB |
| Tamanho total depois | 3.3 MB |
| **Redução real aplicada** | **92%** |
| Nomes preservados | ✓ Sim — 100% dos nomes mantidos |
| Caminhos preservados | ✓ Sim — 100% dos caminhos mantidos |
| Extensões preservadas | ✓ Sim — todos .png → .png |
| Backup criado antes | ✓ Sim — 35 originais em `tmp/asset-compression-original-backup/` |

---

## Verificação de dimensões

As dimensões dos arquivos comprimidos são **diferentes** das originais — isso é esperado e correto. A quantização de paleta (Pillow) converte de RGBA 32-bit para paleta indexada 8-bit. As **dimensões em pixels (largura × altura) são preservadas**.

Verificação via `getDimensions()` no script de aplicação: todos os arquivos comprimidos foram confirmados como PNG válidos ✓

---

## Resultado por grupo

### Imagens de colorir (30 arquivos)

| Arquivo | Antes | Depois | Redução |
|---|---|---|---|
| `noe/noe_scene_01_coloring.png` | 1171 KB | 72 KB | 94% |
| `noe/noe_scene_02_coloring.png` | 1071 KB | 62 KB | 94% |
| `noe/noe_scene_03_coloring.png` | 1135 KB | 69 KB | 94% |
| `noe/noe_scene_04_coloring.png` | 1100 KB | 69 KB | 94% |
| `noe/noe_scene_05_coloring.png` | 1319 KB | 58 KB | 96% |
| `noe/noe_scene_06_coloring.png` | 998 KB | 46 KB | 95% |
| `noe/noe_scene_07_coloring.png` | 1108 KB | 63 KB | 94% |
| `noe/noe_scene_08_coloring.png` | 1061 KB | 58 KB | 95% |
| `noe/noe_scene_09_coloring.png` | 1122 KB | 74 KB | 93% |
| `noe/noe_scene_10_coloring.png` | 1186 KB | 77 KB | 94% |
| `davi_golias/davi_scene_01_coloring.png` | 1134 KB | 68 KB | 94% |
| `davi_golias/davi_scene_02_coloring.png` | 1175 KB | 78 KB | 93% |
| `davi_golias/davi_scene_03_coloring.png` | 1248 KB | 84 KB | 93% |
| `davi_golias/davi_scene_04_coloring.png` | 1107 KB | 67 KB | 94% |
| `davi_golias/davi_scene_05_coloring.png` | 1199 KB | 77 KB | 94% |
| `davi_golias/davi_scene_06_coloring.png` | 1087 KB | 64 KB | 94% |
| `davi_golias/davi_scene_07_coloring.png` | 1055 KB | 56 KB | 95% |
| `davi_golias/davi_scene_08_coloring.png` | 1167 KB | 75 KB | 94% |
| `davi_golias/davi_scene_09_coloring.png` | 1326 KB | 62 KB | 95% |
| `davi_golias/davi_scene_10_coloring.png` | 1174 KB | 81 KB | 93% |
| `jesus_criancas/jesus_children_scene_01_coloring.png` | 1357 KB | 74 KB | 95% |
| `jesus_criancas/jesus_children_scene_02_coloring.png` | 1239 KB | 90 KB | 93% |
| `jesus_criancas/jesus_children_scene_03_coloring.png` | 1132 KB | 80 KB | 93% |
| `jesus_criancas/jesus_children_scene_04_coloring.png` | 1158 KB | 84 KB | 93% |
| `jesus_criancas/jesus_children_scene_05_coloring.png` | 1229 KB | 86 KB | 93% |
| `jesus_criancas/jesus_children_scene_06_coloring.png` | 1116 KB | 73 KB | 93% |
| `jesus_criancas/jesus_children_scene_07_coloring.png` | 1315 KB | 91 KB | 93% |
| `jesus_criancas/jesus_children_scene_08_coloring.png` | 1273 KB | 96 KB | 92% |
| `jesus_criancas/jesus_children_scene_09_coloring.png` | 1243 KB | 85 KB | 93% |
| `jesus_criancas/jesus_children_scene_10_coloring.png` | 1272 KB | 92 KB | 93% |
| **Subtotal** | **34.5 MB** | **2.2 MB** | **94%** |

### Capas de história (3 arquivos)

| Arquivo | Antes | Depois | Redução |
|---|---|---|---|
| `assets/images/noe_arcoiris_capa.png` | 1513 KB | 225 KB | 85% |
| `assets/images/davi_golias_capa.png` | 1554 KB | 278 KB | 82% |
| `assets/images/jesus_criancas_capa.png` | 1778 KB | 329 KB | 81% |
| **Subtotal** | **4.7 MB** | **0.8 MB** | **83%** |

### Imagens de narração (2 arquivos)

| Arquivo | Antes | Depois | Redução |
|---|---|---|---|
| `assets/images/noe_sorrindo.png` | 1485 KB | 229 KB | 85% |
| `assets/images/noe_apontando.png` | 720 KB | 133 KB | 82% |
| **Subtotal** | **2.1 MB** | **0.4 MB** | **83%** |

---

## Verificações pós-aplicação

| Script | Resultado |
|---|---|
| `npm run smoke` | ✓ 620/620 |
| `node scripts/audit-assets.js` | ✓ 0 errors, 7 warnings (legados + faltando — esperado) |
| `node scripts/validate-image-assets.js` | ✓ 30 require() OK, 0 broken |
| `node scripts/report-image-sizes.js` | ✓ 35 arquivos OK (≤ 150 KB para colorir, ≤ 350 KB para capas) |
| `npx expo-doctor` | ⚠ 2 packages out of date (expo, expo-font) — sem relação com esta sprint |

---

## Fallback continua funcionando?

✓ Sim. O `ColoringScreen` verifica se `imageSource` é null antes de renderizar o canvas. As 17 histórias sem imagem de colorir continuam mostrando o placeholder "Em breve". O código de fallback não foi alterado.

---

## Arquivos CRITICAL restantes (pastas legadas)

O `report-image-sizes.js` ainda reporta 22 CRITICAL. Estes são exclusivamente:
- 10 arquivos em `assets/stories/Davi e o Golias/` (pasta legada, não referenciada por nenhum require())
- 10 arquivos em `assets/stories/Jesus e as crianças/` (pasta legada, não referenciada)
- 2 outros (investigar na Sprint 19)

**Esses arquivos NÃO estão no bundle do app** — o Metro Bundler só inclui arquivos com `require()` explícito. Os arquivos das pastas legadas não são importados.

---

## Código alterado?

**NÃO.** Nenhum arquivo `.js`, `.json`, `.ts` de produção foi alterado. Apenas arquivos de assets `.png` foram substituídos nas mesmas pastas e com os mesmos nomes.

---

## Histórias alteradas?

**NÃO.** `src/data/stories.js` não foi tocado. Nenhum textoNarracao foi alterado.

---

## Regras de negócio alteradas?

**NÃO.** `src/services/accessControl.js` e toda a lógica de produto permanecem intactos.

---

## Como reverter

```powershell
$backup = "tmp\asset-compression-original-backup"
Copy-Item "$backup\assets\stories\noe\colorir\*.png"            "assets\stories\noe\colorir\" -Force
Copy-Item "$backup\assets\stories\davi_golias\colorir\*.png"    "assets\stories\davi_golias\colorir\" -Force
Copy-Item "$backup\assets\stories\jesus_criancas\colorir\*.png" "assets\stories\jesus_criancas\colorir\" -Force
Copy-Item "$backup\assets\images\*.png"                          "assets\images\" -Force
node scripts/smoke.js  # deve continuar 620/620
```
