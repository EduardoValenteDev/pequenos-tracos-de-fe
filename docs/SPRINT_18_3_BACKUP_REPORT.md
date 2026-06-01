# Sprint 18.3 — Relatório de Backup dos Originais

**Data:** 2026-06-01  
**Backup criado em:** `tmp/asset-compression-original-backup/`  
**Arquivos salvos:** 35  
**Manifesto JSON:** `tmp/asset-compression-original-backup/backup-manifest.json`

---

## Como reverter usando o backup

```powershell
# Reverter todos os 35 arquivos para os originais
$backup = "tmp\asset-compression-original-backup"

# Colorir — Noé
Copy-Item "$backup\assets\stories\noe\colorir\*.png" "assets\stories\noe\colorir\" -Force

# Colorir — Davi e Golias
Copy-Item "$backup\assets\stories\davi_golias\colorir\*.png" "assets\stories\davi_golias\colorir\" -Force

# Colorir — Jesus e as Crianças
Copy-Item "$backup\assets\stories\jesus_criancas\colorir\*.png" "assets\stories\jesus_criancas\colorir\" -Force

# Capas e narração
Copy-Item "$backup\assets\images\*.png" "assets\images\" -Force

# Verificar reversão
node scripts/report-image-sizes.js --critical-only
```

---

## Inventário de backup

| # | Arquivo original | Caminho do backup | Tamanho | Tipo |
|---|---|---|---|---|
| 1 | `assets/stories/noe/colorir/noe_scene_01_coloring.png` | `tmp/.../noe/colorir/noe_scene_01_coloring.png` | 1171 KB | colorir |
| 2 | `assets/stories/noe/colorir/noe_scene_02_coloring.png` | `tmp/.../noe/colorir/noe_scene_02_coloring.png` | 1071 KB | colorir |
| 3 | `assets/stories/noe/colorir/noe_scene_03_coloring.png` | `tmp/.../noe/colorir/noe_scene_03_coloring.png` | 1135 KB | colorir |
| 4 | `assets/stories/noe/colorir/noe_scene_04_coloring.png` | `tmp/.../noe/colorir/noe_scene_04_coloring.png` | 1100 KB | colorir |
| 5 | `assets/stories/noe/colorir/noe_scene_05_coloring.png` | `tmp/.../noe/colorir/noe_scene_05_coloring.png` | 1319 KB | colorir |
| 6 | `assets/stories/noe/colorir/noe_scene_06_coloring.png` | `tmp/.../noe/colorir/noe_scene_06_coloring.png` | 998 KB | colorir |
| 7 | `assets/stories/noe/colorir/noe_scene_07_coloring.png` | `tmp/.../noe/colorir/noe_scene_07_coloring.png` | 1108 KB | colorir |
| 8 | `assets/stories/noe/colorir/noe_scene_08_coloring.png` | `tmp/.../noe/colorir/noe_scene_08_coloring.png` | 1061 KB | colorir |
| 9 | `assets/stories/noe/colorir/noe_scene_09_coloring.png` | `tmp/.../noe/colorir/noe_scene_09_coloring.png` | 1122 KB | colorir |
| 10 | `assets/stories/noe/colorir/noe_scene_10_coloring.png` | `tmp/.../noe/colorir/noe_scene_10_coloring.png` | 1186 KB | colorir |
| 11 | `assets/stories/davi_golias/colorir/davi_scene_01_coloring.png` | backup correspondente | 1134 KB | colorir |
| 12 | `assets/stories/davi_golias/colorir/davi_scene_02_coloring.png` | backup correspondente | 1175 KB | colorir |
| 13 | `assets/stories/davi_golias/colorir/davi_scene_03_coloring.png` | backup correspondente | 1248 KB | colorir |
| 14 | `assets/stories/davi_golias/colorir/davi_scene_04_coloring.png` | backup correspondente | 1107 KB | colorir |
| 15 | `assets/stories/davi_golias/colorir/davi_scene_05_coloring.png` | backup correspondente | 1199 KB | colorir |
| 16 | `assets/stories/davi_golias/colorir/davi_scene_06_coloring.png` | backup correspondente | 1087 KB | colorir |
| 17 | `assets/stories/davi_golias/colorir/davi_scene_07_coloring.png` | backup correspondente | 1055 KB | colorir |
| 18 | `assets/stories/davi_golias/colorir/davi_scene_08_coloring.png` | backup correspondente | 1167 KB | colorir |
| 19 | `assets/stories/davi_golias/colorir/davi_scene_09_coloring.png` | backup correspondente | 1326 KB | colorir |
| 20 | `assets/stories/davi_golias/colorir/davi_scene_10_coloring.png` | backup correspondente | 1174 KB | colorir |
| 21 | `assets/stories/jesus_criancas/colorir/jesus_children_scene_01_coloring.png` | backup correspondente | 1357 KB | colorir |
| 22 | `assets/stories/jesus_criancas/colorir/jesus_children_scene_02_coloring.png` | backup correspondente | 1239 KB | colorir |
| 23 | `assets/stories/jesus_criancas/colorir/jesus_children_scene_03_coloring.png` | backup correspondente | 1132 KB | colorir |
| 24 | `assets/stories/jesus_criancas/colorir/jesus_children_scene_04_coloring.png` | backup correspondente | 1158 KB | colorir |
| 25 | `assets/stories/jesus_criancas/colorir/jesus_children_scene_05_coloring.png` | backup correspondente | 1229 KB | colorir |
| 26 | `assets/stories/jesus_criancas/colorir/jesus_children_scene_06_coloring.png` | backup correspondente | 1116 KB | colorir |
| 27 | `assets/stories/jesus_criancas/colorir/jesus_children_scene_07_coloring.png` | backup correspondente | 1315 KB | colorir |
| 28 | `assets/stories/jesus_criancas/colorir/jesus_children_scene_08_coloring.png` | backup correspondente | 1273 KB | colorir |
| 29 | `assets/stories/jesus_criancas/colorir/jesus_children_scene_09_coloring.png` | backup correspondente | 1243 KB | colorir |
| 30 | `assets/stories/jesus_criancas/colorir/jesus_children_scene_10_coloring.png` | backup correspondente | 1272 KB | colorir |
| 31 | `assets/images/davi_golias_capa.png` | backup correspondente | 1554 KB | capa |
| 32 | `assets/images/jesus_criancas_capa.png` | backup correspondente | 1778 KB | capa |
| 33 | `assets/images/noe_arcoiris_capa.png` | backup correspondente | 1513 KB | capa |
| 34 | `assets/images/noe_apontando.png` | backup correspondente | 720 KB | narração |
| 35 | `assets/images/noe_sorrindo.png` | backup correspondente | 1485 KB | narração |

**Total backup:** ~41.3 MB  
**Manifesto completo com checksums implícitos:** `tmp/asset-compression-original-backup/backup-manifest.json`
