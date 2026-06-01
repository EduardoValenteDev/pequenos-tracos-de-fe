# Plano de Compressão Real de Assets — Pequenos Traços de Fé

**Sprint 18.1 · 2026-06-01**  
**Status:** Aguardando instalação de pngquant. Nenhum original foi comprimido.

---

## Resumo da situação atual

| Asset | Qtde | Tamanho total | Meta pós-compressão | Redução esperada |
|---|---|---|---|---|
| PNG colorir (lineart) | 30 | ~34.6 MB | ~3.5 MB | ~90% |
| PNG capas | 3 | ~4.7 MB | ~0.7 MB | ~86% |
| PNG narração (personagens) | 2 | ~2.1 MB | ~0.4 MB | ~82% |
| **Total** | **35** | **~41.3 MB** | **~4.5 MB** | **~89%** |

---

## Quais arquivos podem ser comprimidos agora

### Grupo A — Podem ser comprimidos (risco baixo, reversível via git)

| Arquivo | Caminho | Tamanho | Observação |
|---|---|---|---|
| noe_scene_01..10_coloring.png | `assets/stories/noe/colorir/` | 10× ~1.1 MB | Lineart, pouquíssimas cores |
| davi_scene_01..10_coloring.png | `assets/stories/davi_golias/colorir/` | 10× ~1.1 MB | Lineart |
| jesus_children_scene_01..10_coloring.png | `assets/stories/jesus_criancas/colorir/` | 10× ~1.2 MB | Lineart |
| noe_arcoiris_capa.png | `assets/images/` | ~1.5 MB | Capa 16:9 |
| davi_golias_capa.png | `assets/images/` | ~1.5 MB | Capa 16:9 |
| jesus_criancas_capa.png | `assets/images/` | ~1.7 MB | Capa 16:9 |

### Grupo B — Precisam validação manual extra antes

| Arquivo | Caminho | Tamanho | Motivo de atenção |
|---|---|---|---|
| noe_sorrindo.png | `assets/images/` | ~1.5 MB | Imagem de narração com rosto — verificar anti-aliasing |
| noe_apontando.png | `assets/images/` | ~720 KB | Personagem guia — verificar qualidade do traço |

### Grupo C — NÃO comprimir

| Arquivo | Motivo |
|---|---|
| `assets/icon.png` | Requisito das lojas — não compressão automática |
| `assets/adaptive-icon.png` | Idem |
| `assets/splash-icon.png` | Processado pelo Expo — não alterar |
| `assets/favicon.png` | Muito pequeno (1 KB) — sem ganho |
| `noe_apontandoBackup.png` | Arquivo órfão — não comprimir, planejar remoção |

---

## Pré-requisitos antes de comprimir

1. **Instalar pngquant:**
   - macOS: `brew install pngquant`
   - Linux: `apt install pngquant` ou `yum install pngquant`
   - Windows: https://pngquant.org/install.html ou `choco install pngquant`
   - Verificar: `pngquant --version`

2. **Confirmar git limpo:**
   ```bash
   git status
   # Deve mostrar "nothing to commit" nos assets
   ```

3. **Criar tag de backup (opcional mas recomendado):**
   ```bash
   git tag backup-assets-pre-compression
   ```

---

## Comando exato de compressão — Grupo A

```bash
# ────────────────────────────────────────────────────────────
# PASSO 1: Testar na pasta temporária PRIMEIRO
# ────────────────────────────────────────────────────────────

# Imagens de colorir — pasta de teste
pngquant --quality 75-85 --nofs --strip --ext .png --force \
  tmp/asset-compression-test/colorir/noe/*.png \
  tmp/asset-compression-test/colorir/davi_golias/*.png \
  tmp/asset-compression-test/colorir/jesus_criancas/*.png

# Capas — pasta de teste
pngquant --quality 78-88 --strip --ext .png --force \
  tmp/asset-compression-test/capas/noe_arcoiris_capa.png \
  tmp/asset-compression-test/capas/davi_golias_capa.png \
  tmp/asset-compression-test/capas/jesus_criancas_capa.png

# Relatório pós-compressão na pasta de teste
# (Manual — medir com du ou ls)

# ────────────────────────────────────────────────────────────
# PASSO 2: Validar visualmente (ver COLORING_IMAGE_QA_CHECKLIST.md)
# ────────────────────────────────────────────────────────────
# Testar flood fill no app com 1 imagem comprimida da pasta de teste

# ────────────────────────────────────────────────────────────
# PASSO 3: Se OK → aplicar nos originais
# ────────────────────────────────────────────────────────────

# Colorir (--nofs OBRIGATÓRIO para linearts — sem dithering)
pngquant --quality 75-85 --nofs --strip --ext .png --force \
  assets/stories/noe/colorir/*.png \
  assets/stories/davi_golias/colorir/*.png \
  assets/stories/jesus_criancas/colorir/*.png

# Capas (dithering OK para ilustrações ricas)
pngquant --quality 78-88 --strip --ext .png --force \
  assets/images/noe_arcoiris_capa.png \
  assets/images/davi_golias_capa.png \
  assets/images/jesus_criancas_capa.png
```

### Explicação dos parâmetros

| Parâmetro | Significado | Por que usar |
|---|---|---|
| `--quality 75-85` | Qualidade mínima 75, máxima 85 | Equilibra compressão e qualidade visual |
| `--nofs` | No Floyd-Steinberg dithering | CRÍTICO para linearts — evita ruído cinza |
| `--strip` | Remove metadados EXIF | Reduz ~1-5 KB por arquivo |
| `--ext .png` | Salva com mesma extensão | Mantém compatibilidade com require() |
| `--force` | Sobrescreve arquivo existente | Necessário para --ext .png |

---

## Como reverter

### Reverter via git (mais seguro)
```bash
git checkout -- assets/stories/noe/colorir/
git checkout -- assets/stories/davi_golias/colorir/
git checkout -- assets/stories/jesus_criancas/colorir/
git checkout -- assets/images/noe_arcoiris_capa.png
git checkout -- assets/images/davi_golias_capa.png
git checkout -- assets/images/jesus_criancas_capa.png
```

### Verificar git diff após compressão (antes de commitar)
```bash
git diff --stat assets/
# Deve mostrar apenas os arquivos comprimidos, nada mais
```

---

## Verificação pós-compressão

```bash
# 1. Tamanhos
node scripts/report-image-sizes.js
# Meta: nenhum arquivo de colorir > 150 KB

# 2. Consistência
node scripts/validate-image-assets.js

# 3. Smoke completo
npm run smoke
# Meta: 620/620

# 4. Teste no app
npx expo start
# Navegar até ColoringScreen e testar flood fill
```

---

## Commit após compressão aprovada

```bash
git add assets/stories/ assets/images/
git status  # verificar que apenas imagens mudaram
git commit -m "chore(assets): compress coloring PNGs ~90% size reduction

Reduces coloring images from ~34 MB to ~3.5 MB.
Capas from ~4.7 MB to ~0.7 MB.
Total reduction: ~36 MB → ~4 MB.
Used: pngquant --quality 75-85 --nofs --strip

Tested: ColoringScreen flood fill, StoryBook, smoke 620/620"
```

---

## Teste no iPhone e Android

### iPhone
- Dispositivo: qualquer iPhone com iOS 14+
- Instalar build de preview: `npm run build:preview:ios`
- Testar: navegar até as 3 histórias e testar flood fill em pelo menos 3 cenas cada

### Android
- Dispositivo: preferencialmente entry-level (3 GB RAM)
- Instalar APK de preview: `npm run build:preview:android`
- Testar: idem iPhone

---

## Quando aplicar

1. Instalação de pngquant confirmada
2. Teste em pasta tmp validado visualmente
3. Teste de flood fill no app aprovado
4. Smoke 620/620 passando
5. git status limpo nos assets originais
