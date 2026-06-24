# Aprovação Visual — WebP q80 para CENAS COLORIDAS (Feature 001, Bloco 001.10)

**Data:** 2026-06-23 · **Status:** ✅ **q80 aprovado visualmente — apenas para cenas coloridas.**
Complementa o piloto numérico em [`SCENE_WEBP_PILOT_REPORT.md`](./SCENE_WEBP_PILOT_REPORT.md).

> Aprovação **só de documentação** — **nenhum asset foi convertido ou alterado**. A adoção
> real (substituir PNG→WebP nos assets) terá **spec/PR próprio**, por lote, com auditoria.

## a. Cenas avaliadas (5, histórias diferentes)

1. `jonah_big_fish/scenes/jonah_big_fish_scene_02.png`
2. `creation/scenes/creation_scene_10.png`
3. `david_goliath/scenes/david_goliath_scene_08.png`
4. `ruth_naomi/scenes/ruth_naomi_scene_05.png`
5. `moses_red_sea/scenes/moses_red_sea_scene_09.png`

## b/c. Qualidades comparadas e números (q80/q85/q90)

| Cena | Original | q80 | q85 | q90 | −q80 | −q85 | −q90 |
|---|---|---|---|---|---|---|---|
| jonah_big_fish_scene_02 | 2.76 MB | 0.29 MB | 0.37 MB | 0.47 MB | 89.4% | 86.6% | 83.1% |
| creation_scene_10 | 2.74 MB | 0.30 MB | 0.38 MB | 0.48 MB | 88.9% | 86.3% | 82.6% |
| david_goliath_scene_08 | 2.61 MB | 0.24 MB | 0.31 MB | 0.42 MB | 90.7% | 88.1% | 83.9% |
| ruth_naomi_scene_05 | 2.60 MB | 0.27 MB | 0.34 MB | 0.44 MB | 89.8% | 87.0% | 83.1% |
| moses_red_sea_scene_09 | 2.58 MB | 0.24 MB | 0.31 MB | 0.41 MB | 90.5% | 88.1% | 84.2% |
| **TOTAL** | **13.29 MB** | **1.35 MB** | **1.70 MB** | **2.21 MB** | **89.9%** | **87.2%** | **83.4%** |

(WebP lossy, `effort=4`, dimensões preservadas 4:5. Comparações geradas em `tmp/` no Bloco 001.9, não versionadas.)

## d. Aprovação humana

> "Eu não percebi mudança alguma no aplicativo é questão de visual. Todas as cenas,
> desenhos, avatares e Benis seguem bons. Acredito que deu certo."

Interpretação aprovada: **q80 aprovado como qualidade candidata para CENAS COLORIDAS.**

## e. Escopo da aprovação

- **Aplica-se SOMENTE a cenas coloridas** (ilustrações de narração, `*/scenes/*`).
- WebP **lossy q80** é a qualidade candidata/padrão para futuros pilotos/lotes **de cenas**.

## f. Exclusões explícitas (NÃO cobertas por esta aprovação)

- ❌ **Colorir / lineart** — sensível a flood-fill; **bloqueado** até teste **lossless + flood-fill** (bloco próprio).
- ❌ **Mapas** · ❌ **Capas** · ❌ **Avatares** · ❌ **Beni**.
- A aprovação **não** autoriza conversão de nenhuma dessas categorias.

## g. Decisão

- **q80 pode ser usado como padrão candidato** em futuros pilotos/lotes de **cenas coloridas**.
- Há folga de qualidade (q85/q90 também cabem na meta de peso) — se um lote específico
  mostrar artefato em q80, subir para q85/q90 é aceitável **sem** estourar o orçamento.

## h. Próxima etapa

- **Adoção real por lote** (substituir PNG→WebP em cenas + ajustar requires) terá
  **spec/PR próprio**, com auditoria por lote, validação visual e teste de regressão —
  **sem conversão em massa automática**.
- **Colorir/lineart**: bloco separado com `optimize-coloring.js` (lossless/PNG) + **teste de flood-fill obrigatório**.
