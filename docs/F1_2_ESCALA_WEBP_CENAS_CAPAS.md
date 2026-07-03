# F1.2 — Escala WebP para cenas e capas (histórias restantes)

> **Bloco:** F1.2 (Fase 1 §19). Escala o piloto WebP a **todas as histórias restantes**.
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD de trabalho `ed8d5e8`.
> **Escopo:** WebP **apenas em cenas ilustradas e capas** das 18 histórias que ainda
> estavam em PNG. **Colorir NÃO tocado** (segue 100% PNG). Ferramenta: `sharp`.
> **Status:** convertido e medido. **Não commitado, não pushado.** Aguardando validação.

---

## 1. Resumo executivo

Converti para WebP as **cenas (180) e capas (18)** das **18 histórias restantes** (todas menos `creation` e `david_goliath`, já feitas no F1.1). Resultado do lote: **435.5 MB → 31.9 MB (−93%)**. Com isso, **`assets/` caiu de 860 MB → 456 MB** (−404 MB neste bloco; **−452 MB / −50%** acumulado desde o início). **Colorir intocado (200 PNG, 0 WebP).** Gates verdes.

- **Cenas (lossy q80):** −93%, média **167 KB**, **todas dentro do budget** (150–400 KB).
- **Capas (q82):** −92%, média **146 KB**; **4 capas** levemente acima de 200 KB (§7).
- **Colorir:** PNG (adiado — páginas em refinamento manual; bloco próprio).

---

## 2. Escopo

**Convertido (WebP):** `assets/stories/<id>/scenes` das 18 restantes (180 cenas) + as 18 capas em `assets/images/*_cover.png`.
**Requires atualizados:** `src/data/storySceneIllustrations.js` (cenas) e `src/assets/storyCovers.js` (capas).
**Smoke:** 1 check B2 (50/50) ajustado para extensão-agnóstico (autorizado no escopo).
**NÃO tocado:** `assets/stories/*/coloring`, `src/assets/coloringImages.js`, áudio, mapas, R2, packs, RevenueCat, Brincar, Beni, A1, B5.4, rotas, storage, contrato da jornada.

---

## 3. Baseline (antes) × resultado (depois)

| Categoria | Antes (F1.2) | Depois | Redução |
|---|---:|---:|---:|
| **Cenas (18 histórias)** | 401.7 MB | **29.4 MB** | **−93%** |
| **Capas (18)** | 33.9 MB | **2.6 MB** | **−92%** |
| **Lote F1.2 (total)** | **435.5 MB** | **31.9 MB** | **−93%** |
| `assets/` total | 860 MB | **456 MB** | −404 MB |

Médias depois: **cena ~167 KB** · **capa ~146 KB**.

---

## 4. Tabela por história (cenas MB · capa KB)

| Story | Cenas antes | Cenas depois | Capa antes | Capa depois |
|---|---:|---:|---:|---:|
| noah | 22.80 | **1.82** | 2171 | **170** |
| jesus_children | 24.10 | **2.04** | 2607 | **264** ⚠️ |
| daniel_lions | 22.12 | **1.47** | 2327 | **157** |
| jonah_big_fish | 24.92 | **2.17** | 2710 | **308** ⚠️ |
| lost_sheep | 20.66 | **1.35** | 1998 | **121** |
| good_samaritan | 22.73 | **1.77** | 2262 | **188** |
| abraham_stars | 22.49 | **1.69** | 1481 | **125** |
| joseph_colorful_coat | 23.93 | **2.07** | 2594 | **243** ⚠️ |
| moses_red_sea | 24.46 | **2.11** | 2507 | **225** ⚠️ |
| ruth_naomi | 21.75 | **1.38** | 1998 | **127** |
| esther_queen | 22.88 | **1.86** | 1239 | **72** |
| miraculous_catch | 23.70 | **1.88** | 2255 | **169** |
| samuel_hears_god | 18.78 | **0.78** | 1220 | **45** |
| josiah_young_king | 21.14 | **1.27** | 1372 | **69** |
| solomon_wisdom | 19.70 | **1.13** | 1148 | **47** |
| mary_says_yes | 23.32 | **1.68** | 1566 | **103** |
| timothy_faith | 20.49 | **1.30** | 1193 | **56** |
| jesus_temple | 21.70 | **1.60** | 2017 | **140** |

*(creation e david_goliath já estavam em WebP desde o F1.1 — não reconvertidas.)*

---

## 5. Total convertido

**198 arquivos** (180 cenas + 18 capas). Dimensão/proporção **preservadas** (sem resize/crop). Metadados removidos.

---

## 6. Requires alterados

| Loader | Alteração |
|---|---|
| `src/data/storySceneIllustrations.js` | 180 cenas das 18 restantes → `.webp` (as 200 do manifesto agora são WebP) |
| `src/assets/storyCovers.js` | 18 capas → `.webp` (as 20 do manifesto agora são WebP) |
| `src/assets/coloringImages.js` | **INTOCADO** (colorir segue `.png`) |

`src/assets/images.js` herda o `.webp` das capas via `STORY_COVERS`. **0 requires quebrados** (todo require de cena/capa resolve para arquivo existente — verificado programaticamente).

---

## 7. Exceções de budget

**Cenas:** nenhuma (todas 150–400 KB).
**Capas:** **4 acima de 200 KB** (leve): `jonas_peixe` 308 KB, `jesus_children` 264 KB, `jose_tunica` 243 KB, `moises_mar_vermelho` 225 KB. Ainda são **~90% menores** que os PNGs originais (1.5–2.7 MB). Aceitável; se quiser afinar, um q80→q78 nessas 4 resolve — **sem urgência**.

---

## 8. Confirmação — colorir ficou PNG

✅ `assets/stories/*/coloring` = **200 PNG, 0 WebP** (todas as 20 histórias). `coloringImages.js` **não modificado**. O colorir final (PNGs refinados, mesmos nomes) e sua otimização são **bloco próprio** (F1.3), depois do refinamento manual.

---

## 9. Riscos restantes

1. **Colorir é agora o maior peso local:** **278 MB PNG** dentro de `assets/stories` (313 MB). É o próximo grande ganho — depende das páginas finais.
2. **4 capas levemente acima do budget** (§7) — cosmético, sem risco.
3. **Binário ainda acima do teto:** mesmo com cenas/capas em WebP, as **18 premium precisam sair do binário** (packs, Fase 2/3). WebP é groundwork, não solução final (§3.3 do doc mestre).

---

## 10. Checklist de validação visual (aparelho)

Amostragem recomendada (não precisa as 18 inteiras):
- [ ] 3–4 histórias variadas (ex.: `jonah_big_fish`, `moses_red_sea`, `samuel_hears_god`, `esther_queen`): abrir cenas narradas — **10 cenas** sem corte/borrão, proporção ok.
- [ ] **Capas** dessas no card do mapa e na vitrine — legíveis, 16:9 ok (conferir as 4 acima do budget: `jonas_peixe`, `jesus_children`, `jose_tunica`, `moises_mar_vermelho`).
- [ ] **Colorir** de 1–2 dessas continua abrindo normalmente (segue PNG — não deve mudar nada).
- [ ] Sem tela branca, sem falha de require, sem travamento.

---

## 11. Rollback

Nada commitado; **git é o backup** (os 198 PNGs estão no `ed8d5e8`/histórico).
1. `git checkout -- src/data/storySceneIllustrations.js src/assets/storyCovers.js scripts/smoke.js` → reverte requires + smoke.
2. `git checkout -- assets/stories assets/images` → restaura os PNGs de cenas/capas (colorir não foi tocado).
3. `find assets/stories -path '*/scenes/*.webp' -newer <marcador> -delete` / remover os `.webp` novos de cenas+capas das 18.
Colorir não precisa de rollback (intocado).

---

## 12. Recomendação para F1.3

1. **F1.3 (colorir final):** quando as páginas refinadas chegarem, substituir os PNGs de colorir (mesmos nomes), **validar flood fill em aparelho**, e **só então** otimizar (WebP lossless / re-export limpo). **Sem lossy sem teste específico.** É o maior ganho local restante (278 MB).
2. **Fase 2/3 (híbrida):** tirar as 18 premium do binário (packs R2) — requisito de loja. WebP já reduziu o peso dos packs.
3. (Opcional) afinar as 4 capas acima do budget.

---

## 13. Confirmações

- **Só cenas e capas convertidas** (18 histórias restantes); creation/david já estavam WebP.
- **Colorir 100% PNG** (200 PNG, 0 WebP); `coloringImages.js` intocado.
- **0 assets fora de scenes/capas** alterados; **0 requires quebrados**.
- **F1.3 não iniciado.** R2, híbrida, RevenueCat, Brincar, A1, B5.4, áudio, vozes não iniciados.
- **Sem commit, sem push, sem `git add`.** Scripts de conversão/medição rodaram fora do repo (scratchpad).
