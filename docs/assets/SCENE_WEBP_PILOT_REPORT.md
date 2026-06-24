# Relatório — Piloto de WebP em Cenas Coloridas (Feature 001, Bloco 001.8)

**Data:** 2026-06-23 · **Ferramenta:** `scripts/assets-pipeline/optimize-scene.js` (sharp 0.35.2 / libvips 8.18.3)
**Encoder:** WebP **lossy**, `quality=80`, `effort=4` · **Dimensões preservadas** (sem resize/crop).

> **Medição apenas.** Os arquivos `.webp` foram gerados em `tmp/assets-pipeline/scene-webp-pilot/`
> (**fora de `assets/`, gitignored**). **Nenhum asset real foi alterado, movido ou convertido.**
> As imagens convertidas **não** são versionadas. **Colorir NÃO entra** neste piloto (sensível a flood-fill).

## Resultados (números reais)

| # | Cena (história diferente) | Dimensão | Antes (PNG) | Depois (WebP q80) | Redução |
|---|---|---|---|---|---|
| 1 | `jonah_big_fish/scenes/jonah_big_fish_scene_02.png` | 1122×1402 (4:5) | 2.890.402 B (2.76 MB) | 305.458 B (0.29 MB) | **−89.4%** |
| 2 | `creation/scenes/creation_scene_10.png` | 1122×1402 (4:5) | 2.875.667 B (2.74 MB) | 319.682 B (0.30 MB) | **−88.9%** |
| 3 | `david_goliath/scenes/david_goliath_scene_08.png` | 1122×1402 (4:5) | 2.739.651 B (2.61 MB) | 253.812 B (0.24 MB) | **−90.7%** |
| 4 | `ruth_naomi/scenes/ruth_naomi_scene_05.png` | 1122×1402 (4:5) | 2.726.908 B (2.60 MB) | 278.448 B (0.27 MB) | **−89.8%** |
| 5 | `moses_red_sea/scenes/moses_red_sea_scene_09.png` | 1122×1402 (4:5) | 2.704.738 B (2.58 MB) | 256.634 B (0.24 MB) | **−90.5%** |
| | **TOTAL (5 cenas)** | — | **13.937.366 B (13.29 MB)** | **1.414.034 B (1.35 MB)** | **−89.9%** |

- **Qualidade usada:** WebP lossy `quality=80`, `effort=4`.
- **Redução média:** ~**89.9%** (≈ **10×** menor). As 5 cenas têm proporção **4:5** (ratio 0.8003) — dentro do contrato visual.

## Observações de risco visual

- **Não houve validação visual lado a lado** neste bloco — o piloto mede **economia de peso**, não qualidade percebida. Antes de adotar a conversão nos assets reais, é **obrigatório** um **diff visual** (original × WebP) em dispositivo, especialmente em gradientes/céus (onde lossy pode bandar) e bordas finas.
- **Cenas coloridas toleram lossy** (são ilustrações cheias) — o ganho (~90%) justifica calibrar a qualidade por amostra (testar q75–q85).
- **Colorir é caso à parte:** anti-aliasing + lossy → risco de **vazamento de flood-fill** (limiar de luminância 210). Páginas de colorir **devem** usar **WebP lossless / PNG otimizado** com **teste de flood-fill obrigatório** — **fora do escopo** deste bloco (bloco T014 próprio).

## Recomendação (próximo passo)

1. **Validação visual** das 5 cenas convertidas (e mais algumas com céu/gradiente) em device, comparando original × WebP q80; calibrar `quality` se necessário.
2. **Projeção de economia:** ~90% nas cenas reduziria drasticamente o peso de assets (hoje ~625 MB tracked) — alinhado à meta de ~150 MB e à estratégia starter+remoto.
3. **T014 (bloco próprio):** `optimize-coloring.js` em **lossless** + **teste de flood-fill** antes de qualquer adoção.
4. **Adoção real** (substituir PNG por WebP nos assets) é uma mudança **sensível** (toca assets + requires) → exige **spec própria**, auditoria por lote e validação visual; **não** faz parte deste piloto.

## Reprodutibilidade

```
npm run assets:optimize-scene -- --in <cena.png> --out tmp/assets-pipeline/scene-webp-pilot --quality 80
```
(Saída sempre fora de `assets/`; o comando recusa colorir e recusa saída dentro de `assets/`.)
