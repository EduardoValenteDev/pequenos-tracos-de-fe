# Auditoria de Tamanho de Assets — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**

---

## Resumo executivo

| Tipo | Qtde | Tamanho médio | Total atual | Total projetado (20 hist.) | Status |
|---|---|---|---|---|---|
| PNG colorir (3 histórias) | 50 | ~2,0 MB | ~100 MB | ~667 MB | ✗ Crítico |
| PNG capas / personagens | 10 | ~0,5–1,0 MB | ~7,6 MB | ~7,6 MB (fixo) | ⚠ Atenção |
| PNG sistema (icon, splash) | 4 | — | ~1,0 MB | ~1,0 MB | ✓ OK |
| WAV (pop.wav) | 1 | ~20 KB | ~20 KB | ~20 KB | ✓ OK |
| MP3 narração | 0 | — | 0 | ~280 MB (200 áudios) | — |
| **Total atual** | — | — | **~109 MB** | **~956 MB completo** | ✗ |

---

## Detalhamento por pasta

### assets/stories/noe/colorir/ (Noé — 10 cenas)

| Arquivo | Tamanho aprox. | Uso | Risco | Recomendação |
|---|---|---|---|---|
| noe_scene_01_coloring.png | ~2 MB | ColoringScreen `noah` cena 1 | Alto | Comprimir para ≤ 120 KB |
| noe_scene_02_coloring.png | ~2 MB | ColoringScreen `noah` cena 2 | Alto | Comprimir |
| noe_scene_03_coloring.png | ~2 MB | ColoringScreen `noah` cena 3 | Alto | Comprimir |
| noe_scene_04_coloring.png | ~2 MB | ColoringScreen `noah` cena 4 | Alto | Comprimir |
| noe_scene_05_coloring.png | ~2 MB | ColoringScreen `noah` cena 5 | Alto | Comprimir |
| noe_scene_06_coloring.png | ~2 MB | ColoringScreen `noah` cena 6 | Alto | Comprimir |
| noe_scene_07_coloring.png | ~2 MB | ColoringScreen `noah` cena 7 | Alto | Comprimir |
| noe_scene_08_coloring.png | ~2 MB | ColoringScreen `noah` cena 8 | Alto | Comprimir |
| noe_scene_09_coloring.png | ~2 MB | ColoringScreen `noah` cena 9 | Alto | Comprimir |
| noe_scene_10_coloring.png | ~2 MB | ColoringScreen `noah` cena 10 | Alto | Comprimir |
| **Subtotal** | **~20 MB** | — | — | — |

### assets/stories/davi_golias/colorir/ (Davi — 10 cenas) ~20 MB total
### assets/stories/jesus_criancas/colorir/ (Jesus e as crianças — 10 cenas) ~26 MB total

---

### assets/stories/ — PASTAS LEGADAS (duplicatas)

| Pasta | Status | Arquivos | Pode remover? |
|---|---|---|---|
| `assets/stories/Davi e o Golias/` | Legada (espaços) | 10 PNG + subpastas | Após confirmar que nenhum require() aponta para ela |
| `assets/stories/Jesus e as crianças/` | Legada (espaços/acento) | 10 PNG + subpastas | Após confirmar que nenhum require() aponta para ela |
| `assets/stories/noe/` | Normalizada ✓ | — | Manter |
| `assets/stories/davi_golias/` | Normalizada ✓ | — | Manter |
| `assets/stories/jesus_criancas/` | Normalizada ✓ | — | Manter |

---

## Análise de risco por volume

| Cenário | PNG colorir | Total bundle estimado | Status |
|---|---|---|---|
| Estado atual (3 histórias) | ~100 MB | ~109 MB | ⚠ Próximo do limite |
| 5 histórias | ~167 MB | ~176 MB | ✗ Acima de 150 MB |
| 10 histórias | ~333 MB | ~342 MB | ✗ Bloqueador |
| 20 histórias | ~667 MB | ~676 MB | ✗ Impossível sem CDN |

**Conclusão:** A compressão dos PNG é obrigatória antes de adicionar a 4ª história.

---

## Recomendações de compressão

### Opção A — pngquant (sem perda visual significativa)
```bash
# Instalar: https://pngquant.org
# Comprime PNG com paleta otimizada — excelente para linearts com poucas cores
pngquant --quality 70-90 --ext .png --force assets/stories/**/*_coloring.png

# Meta: 2 MB → 100-200 KB (redução de 90-95%)
# Ideal para linearts de colorir (poucas cores, sem gradiente)
```

### Opção B — WebP (melhor compressão geral)
```bash
# Instalar cwebp: https://developers.google.com/speed/webp
# React Native suporta WebP nativamente
for f in assets/stories/**/*_coloring.png; do
  cwebp -q 85 "$f" -o "${f%.png}.webp"
done

# ATENÇÃO: se converter para WebP, atualizar require() em coloringImages.js
# Meta: 2 MB → 80-120 KB
```

### Recomendação
- **Usar pngquant** primeiro (mantém .png, não exige mudança em coloringImages.js)
- **Testar visualmente** em dispositivo antes de commitar (linearts perdem qualidade em qualidade < 70)
- **Meta por arquivo:** ≤ 150 KB
- **Registrar resultados** nesta tabela após compressão

---

## Tabela de registro pós-compressão

| Arquivo | Tamanho original | Tamanho pós-compressão | Redução | Data | Responsável |
|---|---|---|---|---|---|
| noe_scene_01_coloring.png | ~2 MB | — | — | — | — |
| (preencher após comprimir) | — | — | — | — | — |

---

## Notas para imagens de capa e personagem

| Arquivo | Tamanho | Recomendação |
|---|---|---|
| noe_arcoiris_capa.png | ~0,5–1 MB | Comprimir para ≤ 100 KB; avaliar JPEG se sem transparência |
| noe_apontando.png | ~0,5 MB | Comprimir para ≤ 80 KB |
| noe_sorrindo.png | ~0,5 MB | Comprimir para ≤ 80 KB |
| davi_golias_capa.png | ~0,5–1 MB | Comprimir para ≤ 100 KB |
| jesus_criancas_capa.png | ~0,5–1 MB | Comprimir para ≤ 100 KB |

---

## Guia de formato por tipo de asset

| Tipo de imagem | Formato recomendado | Motivo |
|---|---|---|
| Lineart de colorir (fundo branco, poucas cores) | PNG otimizado (pngquant) ou WebP | Preserva linhas nítidas; suporte a transparência |
| Capa histórica (sem transparência, fotográfica) | JPEG qualidade 85 ou WebP | Menor tamanho; sem necessidade de alfa |
| Personagem guia (com transparência) | PNG otimizado | Canal alfa necessário |
| Ícone do app | PNG (obrigatório pelas lojas) | Requisito das lojas |
| Splash screen | PNG (obrigatório pelo Expo) | Requisito Expo |
