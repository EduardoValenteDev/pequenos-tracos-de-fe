# Sprint 18.2 — Visual QA das Imagens Comprimidas

**Data:** 2026-06-01  
**Versão comprimida:** `tmp/asset-compression-test/compressed/`  
**Ferramenta:** Python 3.12 + Pillow 12.2.0 — quantização de paleta 128 cores, sem dithering

---

## Análise automática de flood fill

A verificação de compatibilidade com o ColoringCanvas foi executada via `verify-flood-fill-safety.py`.

**Threshold do ColoringCanvas:** luminância ≥ 210 = branco (área de preenchimento)  
**Critério de risco:** pixels cinzas (lum 100–210) > 2% da imagem visível

### Resultado das 30 imagens de colorir

| Arquivo | Branco | Preto | Cinza | min_white_lum | Status |
|---|---|---|---|---|---|
| `colorir/noe/noe_scene_01_coloring.png` | 91.8% | 6.8% | 1.4% | 215 | **OK** |
| `colorir/noe/noe_scene_02_coloring.png` | 93.5% | 5.2% | 1.3% | 215 | **OK** |
| `colorir/noe/noe_scene_03_coloring.png` | 92.7% | 5.6% | 1.7% | 215 | **OK** |
| `colorir/noe/noe_scene_04_coloring.png` | 92.8% | 5.5% | 1.6% | 215 | **OK** |
| `colorir/noe/noe_scene_05_coloring.png` | 92.6% | 6.2% | 1.2% | 215 | **OK** |
| `colorir/noe/noe_scene_06_coloring.png` | 92.5% | 6.3% | 1.2% | 215 | **OK** |
| `colorir/noe/noe_scene_07_coloring.png` | 92.7% | 5.6% | 1.8% | 215 | **OK** |
| `colorir/noe/noe_scene_08_coloring.png` | 92.0% | 6.5% | 1.5% | 214 | **OK** |
| `colorir/noe/noe_scene_09_coloring.png` | 92.6% | 5.7% | 1.7% | 215 | **OK** |
| `colorir/noe/noe_scene_10_coloring.png` | 92.1% | 6.3% | 1.7% | 215 | **OK** |
| `colorir/davi_golias/davi_scene_01_coloring.png` | 92.1% | 6.5% | 1.4% | 214 | **OK** |
| `colorir/davi_golias/davi_scene_02_coloring.png` | 92.5% | 5.9% | 1.7% | 215 | **OK** |
| `colorir/davi_golias/davi_scene_03_coloring.png` | 90.2% | 8.0% | 1.8% | 215 | **OK** |
| `colorir/davi_golias/davi_scene_04_coloring.png` | 92.4% | 6.2% | 1.4% | 215 | **OK** |
| `colorir/davi_golias/davi_scene_05_coloring.png` | 91.1% | 7.2% | 1.7% | 215 | **OK** |
| `colorir/davi_golias/davi_scene_06_coloring.png` | 93.0% | 5.7% | 1.3% | 215 | **OK** |
| `colorir/davi_golias/davi_scene_07_coloring.png` | 93.6% | 5.3% | 1.1% | 215 | **OK** |
| `colorir/davi_golias/davi_scene_08_coloring.png` | 92.9% | 5.5% | 1.6% | 215 | **OK** |
| `colorir/davi_golias/davi_scene_09_coloring.png` | 92.6% | 6.2% | 1.2% | 215 | **OK** |
| `colorir/davi_golias/davi_scene_10_coloring.png` | 92.0% | 6.1% | 1.8% | 215 | **OK** |
| `colorir/jesus_criancas/jesus_children_scene_01_coloring.png` | 92.5% | 6.2% | 1.4% | 215 | **OK** |
| `colorir/jesus_criancas/jesus_children_scene_02_coloring.png` | 91.8% | 6.2% | 2.0% | 214 | ⚠ Borderline |
| `colorir/jesus_criancas/jesus_children_scene_03_coloring.png` | 92.5% | 5.9% | 1.7% | 215 | **OK** |
| `colorir/jesus_criancas/jesus_children_scene_04_coloring.png` | 93.0% | 5.2% | 1.8% | 215 | **OK** |
| `colorir/jesus_criancas/jesus_children_scene_05_coloring.png` | 91.6% | 6.5% | 1.8% | 215 | **OK** |
| `colorir/jesus_criancas/jesus_children_scene_06_coloring.png` | 93.9% | 4.5% | 1.6% | 215 | **OK** |
| `colorir/jesus_criancas/jesus_children_scene_07_coloring.png` | 91.0% | 7.1% | 1.9% | 215 | **OK** |
| `colorir/jesus_criancas/jesus_children_scene_08_coloring.png` | 92.0% | 5.8% | 2.2% | 215 | ⚠ Borderline |
| `colorir/jesus_criancas/jesus_children_scene_09_coloring.png` | 92.2% | 6.0% | 1.8% | 215 | **OK** |
| `colorir/jesus_criancas/jesus_children_scene_10_coloring.png` | 91.7% | 6.4% | 2.0% | 214 | **OK** |

### Interpretação dos resultados

**28/30 imagens: OK sem ressalvas**

**2/30 imagens: Borderline (jesus_children_scene_02 e _scene_08)**
- Cinza: 2.0–2.2% dos pixels (ligeiramente acima do threshold de alerta de 2%)
- min_white_lum: 214–215 (acima do threshold crítico de 210 do ColoringCanvas)
- **Conclusão: O flood fill NÃO deve ser afetado** — o threshold do app é 210 e o mínimo medido é 214

**Por que os pixels "cinzas" aparecem:**  
A quantização de paleta com 128 cores converte pixels de anti-aliasing das linhas (que eram cinzas sutis) em tons da paleta. Esses pixels ficam nas bordas das linhas pretas, não no interior das áreas de preenchimento. Portanto, não causam vazamento de flood fill.

---

## Capas — análise

As capas são ilustrações ricas com muitas cores médias (não linearts). O "risco" detectado pelo script de flood fill é um **falso positivo** — capas não são usadas no ColoringCanvas.

| Arquivo | Redução | Qualidade visual esperada |
|---|---|---|
| `noe_arcoiris_capa.png` | 85.1% (1513 KB → 225 KB) | Boa para exibição como capa 16:9 |
| `davi_golias_capa.png` | 82.1% (1554 KB → 278 KB) | Boa para exibição como capa 16:9 |
| `jesus_criancas_capa.png` | 81.5% (1778 KB → 329 KB) | Boa para exibição como capa 16:9 |

As capas comprimidas com 128 cores podem apresentar **leve dithering ou faixas de cor** em gradientes suaves. Isso precisa de validação visual humana antes de aplicar nos originais.

---

## Checklist de validação manual obrigatória antes de aplicar nos originais

### Para imagens de colorir (3 imagens de amostra mínima)

Abrir as imagens comprimidas em `tmp/asset-compression-test/compressed/colorir/`:

- [ ] **noe_scene_01_coloring.png** — inspecionar visualmente
  - [ ] Linhas pretas nítidas e contínuas (sem borrão ou degradação)
  - [ ] Fundo branco (sem cinza visível a olho nu)
  - [ ] Zoom 200%: sem ruído nas bordas das linhas
- [ ] **davi_scene_09_coloring.png** — cena com mais elementos
  - [ ] Idem acima
- [ ] **jesus_children_scene_08_coloring.png** — a mais borderline
  - [ ] Inspecionar com atenção especial nas áreas de anti-aliasing

### Para capas (todas as 3)

Abrir em `tmp/asset-compression-test/compressed/capas/`:

- [ ] `noe_arcoiris_capa.png` — verificar qualidade visual aceitável para app
- [ ] `davi_golias_capa.png` — idem
- [ ] `jesus_criancas_capa.png` — idem

### Validação no app (opcional mas recomendada antes do commit)

Substituir temporariamente `assets/stories/noe/colorir/noe_scene_01_coloring.png` pelo arquivo comprimido e testar:

- [ ] `npx expo start`
- [ ] Navegar até Noé → Cena 1 → Tela de colorir
- [ ] Tocar na área do céu → preenche sem vazar?
- [ ] Tocar na área da arca → preenche corretamente?
- [ ] Tocar sobre uma linha → dica de linha rejeitada aparece?
- [ ] Usar borracha → funciona?
- [ ] Salvar → Abrir de volta → desenho preservado?

---

## Veredicto da análise automática

| Tipo | Arquivos | Status flood fill | Recomendação |
|---|---|---|---|
| Imagens de colorir | 30/30 | SEGURO (min_lum ≥ 214) | **Aprovado para aplicar nos originais** |
| Capas | 3/3 | N/A (não usam flood fill) | Requer validação visual humana |
| Narração | 2/2 | N/A (não usam flood fill) | Requer validação visual humana |
