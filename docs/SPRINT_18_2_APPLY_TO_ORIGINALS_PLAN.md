# Sprint 18.2 — Plano de Aplicação nos Originais

**Status:** Aguardando validação visual humana das capas + confirmação final.  
**Análise de flood fill:** APROVADO automaticamente para as 30 imagens de colorir.

---

## Pré-condições para aplicar

- [ ] Validação visual das imagens comprimidas em `tmp/asset-compression-test/compressed/` (ver `SPRINT_18_2_VISUAL_QA.md`)
- [ ] Capas aprovadas visualmente por humano
- [ ] `git status` limpo nos assets originais
- [ ] `npm run smoke` → 620/620

---

## Criar backup git antes de qualquer alteração

```bash
# Tag de backup (pode sempre voltar com git checkout)
git tag backup-pre-compression-sprint-18-2

# Verificar status limpo
git status
# Deve mostrar: "nothing to commit, working tree clean"
# nos arquivos de assets originais
```

---

## Comando de aplicação — Imagens de colorir

### Grupo A: Noé (aprovado — 30 arquivos OK)
```powershell
# PowerShell — Windows
$PY = "C:\Users\USER\AppData\Local\Programs\Python\Python312\python.exe"

# Aplicar compressão nas 30 imagens de colorir
& $PY -X utf8 scripts/compress-images-pillow.py `
  --input assets/stories `
  --output assets/stories `
  --colors 128 `
  --recursive

# ATENÇÃO: Isso comprimirá e sobrescreverá os originais.
# Verifique git diff depois para confirmar apenas as imagens mudaram.
```

**Alternativa mais segura — copiar da pasta de teste:**
```powershell
# Copiar os já testados da pasta de teste para os originais
$src = "tmp\asset-compression-test\compressed\colorir"
$dsts = @{
  "noe"            = "assets\stories\noe\colorir"
  "davi_golias"    = "assets\stories\davi_golias\colorir"
  "jesus_criancas" = "assets\stories\jesus_criancas\colorir"
}

foreach ($folder in $dsts.Keys) {
  $srcPath = Join-Path $src $folder
  $dstPath = $dsts[$folder]
  Copy-Item -Path "$srcPath\*.png" -Destination $dstPath -Force
  Write-Host "Copiado: $folder"
}

# Verificar depois
Get-ChildItem assets\stories\noe\colorir\*.png | ForEach-Object { 
  "{0:N0} KB  {1}" -f ($_.Length/1KB), $_.Name 
}
```

### Grupo B: Capas (validação visual primeiro)
```powershell
# Somente após aprovação visual das capas
$src = "tmp\asset-compression-test\compressed\capas"
Copy-Item "$src\noe_arcoiris_capa.png"   "assets\images\noe_arcoiris_capa.png" -Force
Copy-Item "$src\davi_golias_capa.png"    "assets\images\davi_golias_capa.png" -Force
Copy-Item "$src\jesus_criancas_capa.png" "assets\images\jesus_criancas_capa.png" -Force
```

### Grupo C: Imagens de narração (opcional — não afetam flood fill)
```powershell
# Somente se aprovação visual for satisfatória
$src = "tmp\asset-compression-test\compressed\narration"
Copy-Item "$src\noe_sorrindo.png"   "assets\images\noe_sorrindo.png" -Force
Copy-Item "$src\noe_apontando.png"  "assets\images\noe_apontando.png" -Force
```

---

## Como reverter

### Opção A — git checkout (mais simples)
```bash
git checkout -- assets/stories/noe/colorir/
git checkout -- assets/stories/davi_golias/colorir/
git checkout -- assets/stories/jesus_criancas/colorir/
git checkout -- assets/images/noe_arcoiris_capa.png
git checkout -- assets/images/davi_golias_capa.png
git checkout -- assets/images/jesus_criancas_capa.png
```

### Opção B — git tag (se já commitou)
```bash
git checkout backup-pre-compression-sprint-18-2 -- assets/
```

---

## Verificação pós-aplicação

```bash
# 1. Verificar tamanhos
node scripts/report-image-sizes.js --critical-only
# Esperado: ZERO arquivos de colorir > 150 KB

# 2. Consistência de require()
node scripts/validate-image-assets.js

# 3. Smoke completo
npm run smoke
# Esperado: 620/620

# 4. Audit geral
node scripts/audit-assets.js
# Esperado: 0 errors, warnings apenas de tamanho OK ou ausentes

# 5. git diff para confirmar apenas imagens mudaram
git diff --stat assets/
# Deve mostrar APENAS os PNGs modificados
# NÃO deve mostrar alterações em .js, .json ou outros arquivos
```

---

## Teste no app

```bash
npx expo start
```

Após iniciar, testar:
1. **Noé → Cena 1 → Colorir:** pintar céu, arca e personagem. Verificar sem vazamento.
2. **Davi → Cena 1 → Colorir:** idem
3. **Jesus e as Crianças → Cena 1 → Colorir:** idem
4. **StoryBook:** completar história e abrir Livrinho. Verificar que imagens aparecem corretamente.
5. **HomeScreen:** verificar que capas aparecem com qualidade visual aceitável.

---

## Commit após validação completa

```bash
git add assets/stories/ assets/images/

# Verificar diff antes de commitar
git diff --stat --cached

git commit -m "chore(assets): compress coloring images 94% size reduction

Compressed 30 coloring images: 34.5 MB -> 2.2 MB (94% reduction)
Compressed 3 cover images: 4.7 MB -> 0.8 MB (83% reduction)

Tool: Python 3.12 + Pillow 12.2.0
Method: palette quantization (128 colors, no dithering)
Flood fill safety: verified (min white luminance >= 214 > threshold 210)
Smoke: 620/620

Projecting: with 200 coloring images compressed, bundle stays under 50 MB"
```

---

## Impacto esperado no bundle

| Antes | Depois | Diferença |
|---|---|---|
| ~35 MB (colorir) | ~2.2 MB | -32.8 MB |
| ~4.7 MB (capas) | ~0.8 MB | -3.9 MB |
| **~74 MB total** | **~40 MB total** | **-34 MB (-46%)** |
| Projeção 200 colorir | ~231 MB colorir | ~15 MB colorir |

---

## Validação no iPhone

Instalar APK/IPA de preview após commit e verificar:

```bash
npm run build:preview:android
# ou
npm run build:preview:ios
```

No device físico:
- Testar ColoringScreen em pelo menos uma cena de cada história
- Verificar que flood fill funciona sem vazamento anormal
- Verificar que as capas aparecem com qualidade visual aceitável
- Verificar Ateliê: salvar e reabrir um desenho
