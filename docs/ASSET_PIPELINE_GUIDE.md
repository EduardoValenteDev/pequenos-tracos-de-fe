# Guia do Pipeline de Assets — Pequenos Traços de Fé

**Sprint 18.0 · 2026-06-01**  
Este guia explica como adicionar áudios e imagens ao app sem quebrar nada.

---

## Regra de ouro

> Nunca adicione um `require()` para um arquivo que não existe no disco.  
> O Metro Bundler falha no build se o arquivo estiver ausente.  
> O smoke test verifica isso automaticamente.

---

## 1. Onde colocar cada tipo de asset

### Áudios de narração

```
assets/audio/{storyId}/{storyId}_scene_{NN}.mp3

Exemplos:
  assets/audio/creation/creation_scene_01.mp3
  assets/audio/creation/creation_scene_02.mp3
  assets/audio/noah/noah_scene_01.mp3
  assets/audio/david_goliath/david_goliath_scene_05.mp3
```

**Pastas já criadas** (com .gitkeep):
- Todas as 20 pastas de storyId existem em `assets/audio/`

### Imagens de colorir

```
assets/stories/{folder}/colorir/{prefix}_scene_{NN}_coloring.png

Histórias existentes:
  noah:           assets/stories/noe/colorir/noe_scene_{NN}_coloring.png
  david_goliath:  assets/stories/davi_golias/colorir/davi_scene_{NN}_coloring.png
  jesus_children: assets/stories/jesus_criancas/colorir/jesus_children_scene_{NN}_coloring.png

Novas histórias (padrão preferido):
  {storyId}:      assets/stories/{storyId}/colorir/{storyId}_scene_{NN}_coloring.png
  Exemplo:
  daniel_lions:   assets/stories/daniel_lions/colorir/daniel_lions_scene_01_coloring.png
```

**Importante:** Após adicionar os arquivos no disco, é necessário registrar o `require()` em `src/assets/coloringImages.js`.

### Capas de história (16:9)

```
assets/images/{storyId}_capa.png
Exemplos:
  assets/images/creation_capa.png
  assets/images/daniel_lions_capa.png
```

Após adicionar: declarar `imagemCapa: '{storyId}_capa'` em `src/data/stories.js`.

### Imagens de narração (personagens guia e cenas)

```
assets/images/{identificador}.png
Exemplos:
  assets/images/daniel_orando.png
  assets/images/daniel_leoes_cena.png
```

Após adicionar: declarar `imagemNarracao: '{identificador}'` na cena correspondente em `src/data/stories.js`.

---

## 2. Formato esperado

### Áudio

| Propriedade | Valor |
|---|---|
| Formato | MP3 |
| Canais | Mono |
| Taxa de bits | 128 kbps CBR |
| Taxa de amostragem | 44.1 kHz ou 48 kHz |
| Tamanho ideal | 500 KB a 1,5 MB (~90 s a 128 kbps) |
| Tamanho máximo recomendado | 2 MB |
| Tamanho alerta | > 3 MB → verificar se não está stereo ou lossless |

### Imagem de colorir

| Propriedade | Valor |
|---|---|
| Formato | PNG (com transparência se necessário) |
| Dimensões | 390×600 px (recomendado, proporção retrato) |
| Tamanho após compressão | ≤ 150 KB |
| Fundo | Branco puro (sem transparência se possível) |
| Linhas | Pretas grossas, contínuas, fechadas |
| Sem | Texto, logo, degradê, sombra, hachura |

### Capa de história (16:9)

| Propriedade | Valor |
|---|---|
| Formato | PNG ou JPEG |
| Dimensões | 1280×720 px ou 1920×1080 px |
| Proporção | 16:9 obrigatório |
| Tamanho após compressão | ≤ 100 KB |
| Área segura | Conteúdo importante nos 80% centrais |

---

## 3. Nome esperado dos arquivos

### Regras absolutas

1. **Sem espaços** — usar underscores: `daniel_lions_scene_01.mp3` ✓, `daniel lions scene 01.mp3` ✗
2. **Sem acentos** — usar equivalentes sem acento: `_cena` ✗, `_scene` ✓
3. **Extensão em minúsculas** — `.mp3` ✓, `.MP3` ✗, `.Mp3` ✗
4. **Zero-padding** — cenas de 01 a 10, nunca 1 a 10: `scene_01` ✓, `scene_1` ✗
5. **Padrão exato** — `{storyId}_scene_{NN}.mp3` para áudio; `{prefix}_scene_{NN}_coloring.png` para colorir

### Validação rápida antes de adicionar

```bash
# Verificar nome do arquivo (PowerShell no Windows)
$file = "creation_scene_01.mp3"
if ($file -match '^[a-z0-9_]+_scene_\d{2}\.mp3$') { "OK" } else { "NOME ERRADO" }
```

---

## 4. Workflow de adição de áudio

```
1. Gravar → Audacity (normalizar -3 dBFS, aparar silêncio) → Exportar MP3
2. Nomear: {storyId}_scene_{NN}.mp3
3. Verificar tamanho: entre 100 KB e 2 MB
4. Mover para: assets/audio/{storyId}/
5. Abrir src/data/audioManifest.js
6. Adicionar entrada em _readyEntries:
   {
     storyId: '{storyId}',
     sceneKey: 'scene_{NN}',
     audioAsset: require('../../assets/audio/{storyId}/{storyId}_scene_{NN}.mp3'),
   }
7. Executar: npm run audio:audit    → verificar +1 ready
8. Executar: npm run smoke          → deve passar
9. Executar: node scripts/validate-audio-assets.js --story {storyId}
10. Testar no app: npx expo start → navegar para a cena
11. Commit: feat(audio): add narration for {storyId} scene {NN}
```

---

## 5. Workflow de adição de imagem de colorir

```
1. Receber PNG do designer
2. Verificar tamanho: deve ser ≤ 150 KB
3. Se > 150 KB: comprimir com pngquant --quality 70-85 --ext .png --force arquivo.png
4. Nomear: {prefix}_scene_{NN}_coloring.png
5. Criar pasta se não existir: assets/stories/{folder}/colorir/
6. Mover para: assets/stories/{folder}/colorir/
7. Abrir src/assets/coloringImages.js
8. Adicionar o storyId com os require():
   {storyId}: {
     1: require('../../assets/stories/{folder}/colorir/{prefix}_scene_01_coloring.png'),
     ...
     10: require('../../assets/stories/{folder}/colorir/{prefix}_scene_10_coloring.png'),
   }
9. Executar: node scripts/validate-image-assets.js --story {storyId}
10. Executar: npm run smoke
11. Testar no app: ColoringScreen deve mostrar a imagem
12. Commit: feat(assets): add coloring images for {storyId}
```

---

## 6. Como validar antes de rodar o app

```bash
# Auditoria completa
node scripts/audit-assets.js

# Só áudios
node scripts/validate-audio-assets.js

# Só imagens (incluindo tamanhos)
node scripts/validate-image-assets.js --check-sizes

# Relatório de tamanho de imagens
node scripts/report-image-sizes.js

# Relatório de imagens grandes
node scripts/report-image-sizes.js --critical-only

# Smoke tests
npm run smoke

# Audio audit específico
npm run audio:audit
npm run audio:audit:self-test
```

---

## 7. Erros comuns e como corrigir

| Erro | Causa | Correção |
|---|---|---|
| `BROKEN require() in audioManifest.js` | Adicionou require() sem arquivo no disco | Mover arquivo para a pasta correta |
| `BROKEN require() in coloringImages.js` | Require() sem arquivo | Verificar nome e pasta |
| `WRONG_NAME audio` | Nome não segue padrão | Renomear para `{storyId}_scene_{NN}.mp3` |
| `WRONG_EXT` | Arquivo .wav ou .m4a na pasta de áudio | Converter para .mp3 antes de adicionar |
| `LARGE colorir` | PNG > 300 KB | Comprimir com pngquant |
| `ORPHAN image` | Arquivo em assets/images/ não declarado | Declarar em stories.js ou mover para pasta correta |
| Tela de colorir em branco | Story ID não mapeado em coloringImages.js | Adicionar entrada no mapa |
| Áudio não toca | Não está em _readyEntries | Adicionar em audioManifest.js |

---

## 8. Scripts disponíveis

| Script | Uso |
|---|---|
| `node scripts/audit-assets.js` | Auditoria completa |
| `node scripts/audit-assets.js --verbose` | Auditoria com detalhes de missing |
| `node scripts/validate-audio-assets.js` | Validar só áudios |
| `node scripts/validate-audio-assets.js --story {id}` | Validar 1 história |
| `node scripts/validate-image-assets.js` | Validar só imagens |
| `node scripts/validate-image-assets.js --check-sizes` | Incluir tamanhos |
| `node scripts/report-image-sizes.js` | Relatório de tamanho |
| `node scripts/report-image-sizes.js --critical-only` | Só críticos (> 300 KB) |
| `node scripts/generate-expected-assets-manifest.js` | Regenerar manifest |
| `npm run audio:audit` | Verificar manifest de áudio |
| `npm run smoke` | Todos os testes |
