# Checklist de QA — Imagens de Colorir

**Sprint 18.1 · 2026-06-01**  
Executar após qualquer compressão de imagem antes de commitar nos originais.

---

## Por que este checklist é necessário

O ColoringCanvas usa BFS (flood fill) baseado em luminância de pixels:
- Pixels com luminância ≥ 210/255 são tratados como brancos (área de preenchimento)
- Pixels com luminância < 210/255 são tratados como barreiras (linhas pretas)
- **Se a compressão introduzir pixels cinzas** onde eram brancos puros, o flood fill pode recusar preencher aquela área

O parâmetro `--nofs` (no Floyd-Steinberg dithering) do pngquant é crítico para evitar esse problema.

---

## Antes de testar — verificar parâmetros de compressão

- [ ] pngquant foi chamado com `--nofs` (sem dithering)?
- [ ] Qualidade mínima foi ≥ 75 (`--quality 75-85`)?
- [ ] Extensão permaneceu `.png` (não convertido para JPEG)?
- [ ] As dimensões do arquivo foram preservadas?
- [ ] O arquivo não está corrompido (abre normalmente)?

---

## Checklist automático (via script)

```bash
# Verificar tamanho (deve ser < 200 KB para colorir)
node scripts/report-image-sizes.js --critical-only

# Verificar consistência de require() 
node scripts/validate-image-assets.js

# Smoke completo
npm run smoke
```

---

## Checklist de inspeção visual — Desktop

Para cada imagem comprimida, abrir em visualizador de imagem (Windows Photos, Preview, GIMP):

### Teste 1 — Inspeção de linhas
- [ ] As linhas pretas ainda estão **nítidas e contínuas** (sem degradação)
- [ ] Não há **pixels cinzas espalhados** ao lado das linhas (sinal de dithering)
- [ ] Zoom a 200%: as linhas ainda parecem limpas
- [ ] Bordas dos elementos não têm artefatos de compressão visíveis

### Teste 2 — Fundo
- [ ] O fundo das áreas brancas **não está acinzentado** (deve ser branco puro #FFFFFF ou muito próximo)
- [ ] Se o fundo parecer cinza: verificar RGB com color picker — R, G, B devem ser > 210

### Teste 3 — Áreas de preenchimento
- [ ] As regiões de colorir (internas às linhas) estão **completamente fechadas** visualmente
- [ ] Não há "buracos" nas linhas que criariam vazamentos no flood fill

---

## Checklist de validação no app (OBRIGATÓRIO)

### Preparação
- [ ] Substituir **temporariamente** apenas 1 imagem comprimida no app (ex: `noe_scene_01_coloring.png`)
- [ ] **NÃO commitar** nada ainda — apenas testar localmente

### Teste no ColoringScreen
- [ ] Navegar até A Noé → Cena 1 → Tela de colorir
- [ ] A imagem carregou corretamente (sem tela branca)?
- [ ] O canvas está responsivo ao toque?

### Teste de flood fill — as 3 áreas críticas
- [ ] **Área grande (céu/fundo):** Tocar na área → a cor preenche sem vazar para fora?
- [ ] **Área média (personagem/objeto central):** Tocar → preenche corretamente?
- [ ] **Área pequena (detalhes):** Tocar em área pequena → preenche sem vazar?

### Teste de flood fill — edge cases
- [ ] **Borda da imagem:** Tocar perto da borda → o fill não vazou para fora da imagem?
- [ ] **Área adjacente:** Tocar em duas áreas separadas por uma linha → cada uma preenche independentemente?
- [ ] **Linha rejeitada:** Tocar sobre uma linha preta → o hint "Toque em uma área branca" aparece (ou fill é rejeitado)?

### Teste de pincel e borracha
- [ ] Usar borracha sobre área colorida → apaga corretamente?
- [ ] Usar undo → reverte a última pincelada?
- [ ] Usar reset → limpa todo o desenho?

### Teste de persistência
- [ ] Colorir parcialmente, sair da tela, voltar → o desenho foi salvo?
- [ ] Colorir, clicar em "Pronto" → navega para a próxima cena?

### Teste no StoryBook (Livrinho)
- [ ] Completar a história e abrir o Livrinho
- [ ] A cena colorida aparece corretamente no Livrinho?
- [ ] A imagem não está estranhamente comprimida ou distorcida?

---

## Dispositivos para testar

| Dispositivo | Prioridade | Por que |
|---|---|---|
| iPhone SE (tela pequena) | Alta | Display mais crítico para artefatos |
| iPhone 14 Pro (OLED) | Alta | OLED amplifica artefatos de cor |
| Android entry-level (3 GB RAM) | Alta | Mais lento, revela problemas de memória |
| iPad (se disponível) | Média | Imagem maior = artefatos mais visíveis |

---

## Resultado esperado

| Indicador | Esperado | Status |
|---|---|---|
| Tamanho pós-compressão | ≤ 150 KB por imagem de colorir | — |
| Linhas nítidas | Sim | — |
| Fundo branco preservado | Sim (R,G,B ≥ 210) | — |
| Flood fill sem vazamento | Sim nas 3 áreas críticas | — |
| Bordas limpas | Sim | — |
| Smoke pós-compressão | 620/620 | — |

---

## Se algum teste falhar

1. **NÃO commitar** as imagens comprimidas
2. Aumentar a qualidade de compressão: mudar de `--quality 75-85` para `--quality 80-90`
3. Testar novamente com a qualidade maior
4. Se ainda falhar com `--quality 85-95`: considerar não comprimir esse arquivo específico
5. Documentar o arquivo problemático e seus parâmetros em `docs/ASSET_COMPRESSION_REAL_PLAN.md`
6. Restaurar o arquivo original: `git checkout assets/` (o git tem o original)

---

## Notas sobre o threshold do ColoringCanvas

O flood fill usa luminância calculada como:
```js
lum(r, g, b) = (r * 299 + g * 587 + b * 114) / 1000
// Pixels com lum < 210 são tratados como barreira
```

Para RGB = (210, 210, 210): luminância = ~210 → na fronteira (pode ser tratado como barreira)
Para RGB = (230, 230, 230): luminância = ~230 → tratado como branco (preenchível)

**Objetivo:** após compressão, pixels de fundo devem ter R,G,B ≥ 225 para margem de segurança.
