# Estratégia de Compressão de Imagens — Pequenos Traços de Fé

**Sprint 18.0 · 2026-06-01**  
Este documento define quando, como e com qual qualidade comprimir imagens.

---

## Situação atual

| Tipo | Qtde | Tamanho médio atual | Meta | Ação |
|---|---|---|---|---|
| PNG colorir (coloring) | 30 | ~1,1 MB | ≤ 120 KB | **Comprimir obrigatório** |
| PNG capas/personagens | 8 | ~700 KB–1,7 MB | ≤ 100 KB | **Comprimir obrigatório** |
| PNG sistema (icon/splash) | 4 | Padrão | Não comprimido | Manter como está |

**Impacto atual sem compressão:** ~65 MB para 3 histórias → **~437 MB para 20 histórias** (inaceitável).  
**Meta com compressão:** ~2 MB para 3 histórias → **~14 MB para 20 histórias**.

---

## Quando usar cada formato

### PNG — usar quando:
- A imagem tem transparência (canal alfa)
- É uma lineart de colorir (fundo branco, linhas pretas)
- É um ícone ou elemento de UI com bordas nítidas
- Tem poucas cores e áreas sólidas (comprime bem com pngquant)

### JPEG — usar quando:
- É uma fotografia ou ilustração fotorrealista
- **Não tem transparência**
- É uma capa de história (fondos gradientes, cenas ricas)
- Economiza mais que PNG para imagens com muitas cores

### WebP — usar quando:
- Máximo de compressão com qualidade visual equivalente
- React Native suporta WebP nativamente (Android API 14+, iOS 14+)
- Cuidado: `require()` estático do Metro Bundler exige que a extensão seja conhecida em build time

**Regra para este projeto:** Manter PNG para imagens de colorir (requerem canal alfa para o canvas). Avaliar WebP para capas se trocar `.png` por `.webp` for viável.

---

## Quando NÃO comprimir

1. **Ícone do app** (`assets/icon.png`, `assets/adaptive-icon.png`): as lojas têm requisitos específicos de tamanho e qualidade — não comprimir.
2. **Splash screen** (`assets/splash-icon.png`): processado pelo Expo — não comprimir.
3. **Imagens menores que 50 KB**: ganho marginal; risco de artefatos não vale.
4. **Após o primeiro commit** de uma imagem aprovada: não recomprimir sem necessidade — cada ciclo de compressão degrada levemente.

---

## Qualidade recomendada por tipo

| Tipo | Ferramenta | Parâmetro | Qualidade resultante |
|---|---|---|---|
| PNG lineart (colorir) | pngquant | `--quality 70-85` | Excelente — linearts têm poucas cores |
| PNG capa/personagem | pngquant | `--quality 65-80` | Boa — pode haver leve dithering |
| JPEG capa | ImageMagick ou cwebp | `-quality 80-85` | Boa |
| WebP qualquer | cwebp | `-q 80` | Boa |

---

## Processo de compressão seguro

### Passo 1: Verificar o estado atual
```bash
node scripts/report-image-sizes.js
node scripts/report-image-sizes.js --critical-only
```

### Passo 2: Criar backup antes de compressão
```bash
# Windows (PowerShell)
Copy-Item -Recurse assets\stories assets\stories_BACKUP_$(Get-Date -Format 'yyyyMMdd')
Copy-Item -Recurse assets\images assets\images_BACKUP_$(Get-Date -Format 'yyyyMMdd')

# macOS / Linux
cp -r assets/stories assets/stories_backup_$(date +%Y%m%d)
cp -r assets/images assets/images_backup_$(date +%Y%m%d)
```

### Passo 3: Comprimir os arquivos
```bash
# Instalar pngquant: https://pngquant.org
# Windows: https://pngquant.org/install.html (ou via chocolatey: choco install pngquant)
# macOS: brew install pngquant
# Linux: apt install pngquant

# Comprimir PNG de colorir (sobrescreve com versão otimizada)
pngquant --quality 70-85 --ext .png --force \
  assets/stories/noe/colorir/*.png \
  assets/stories/davi_golias/colorir/*.png \
  assets/stories/jesus_criancas/colorir/*.png

# Comprimir capas e personagens
pngquant --quality 65-80 --ext .png --force \
  assets/images/noe_arcoiris_capa.png \
  assets/images/davi_golias_capa.png \
  assets/images/jesus_criancas_capa.png \
  assets/images/noe_sorrindo.png \
  assets/images/noe_apontando.png
```

### Passo 4: Verificar o resultado
```bash
node scripts/report-image-sizes.js --critical-only
# Objetivo: nenhum arquivo acima de 150 KB
```

### Passo 5: Testar visualmente no app
```bash
npx expo start
# Navegar até cada história com imagens comprimidas
# Verificar:
# - Linhas das imagens de colorir ainda estão nítidas?
# - Cores das capas e personagens ainda estão corretas?
# - Nenhuma imagem com artefatos visíveis?
```

### Passo 6: Validar smoke e scripts
```bash
npm run smoke
node scripts/audit-assets.js
node scripts/validate-image-assets.js
```

### Passo 7: Commit se tudo OK
```bash
git add assets/
git commit -m "chore(assets): compress coloring PNGs — 70-85% size reduction"
```

### Passo 8: Remover backup
```bash
# Somente após confirmar que o app funciona corretamente
Remove-Item -Recurse assets\stories_BACKUP_*
Remove-Item -Recurse assets\images_BACKUP_*
```

---

## Como evitar perda visual em desenhos infantis

1. **Testar qualidade mínima 70** para linearts. Qualidade abaixo disso pode criar manchas cinzas nas linhas pretas.
2. **Verificar em dispositivo real** (não apenas simulador) — displays OLED mostram artefatos mais claramente.
3. **Zoom in durante o colorir** no app — linhas de corte entre regiões de cor devem permanecer nítidas.
4. **Não usar JPEG para linearts** — JPEG é lossy e cria artefatos nas bordas de linhas pretas sobre branco.
5. **Manter fundo branco puro** (#FFFFFF) — pngquant preserva pixels sólidos, mas pode comprimir áreas de gradiente.

---

## Como evitar quebrar imagens de colorir no canvas

O ColoringCanvas usa BFS (flood fill) baseado em luminância dos pixels. Se a compressão introduzir pixels acinzentados onde eram brancos puros:
- O fill pode considerar o cinza como uma "barreira" e não preencher corretamente
- O threshold de luminância no canvas é 210/255 — pixels acima desse valor são brancos

**Regra:** Verificar que os pixels de fundo das imagens comprimidas tenham luminância ≥ 210.  
**Como verificar:** Abrir no GIMP/Photoshop → Color Picker em área de fundo → valor R/G/B deve ser ≥ 210.  
**Se houver problema:** Aumentar a qualidade de compressão para 80-90 ou usar `--quality 80-90`.

---

## Comparação antes e depois (preencher após compressão)

| Arquivo | Tamanho original | Tamanho pós | Redução | Data | Artefatos? |
|---|---|---|---|---|---|
| noe_scene_01_coloring.png | ~1,1 MB | — | — | — | — |
| ... | ... | ... | ... | ... | ... |

---

## Decisão de CDN vs local

| Cenário | Decisão |
|---|---|
| ≤ 20 áudios, bundle < 50 MB | Manter local |
| > 80 áudios OU bundle > 130 MB | Avaliar CDN para áudios |
| > 200 áudios | CDN obrigatório |
| Imagens de colorir sempre | Local — usadas offline no canvas |
| Capas | Local — peso < 2 MB total |

Ver `docs/MEDIA_BUDGET_GUIDE.md` para estimativas de bundle size completo.
