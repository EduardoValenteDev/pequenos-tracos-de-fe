# F1.1 — Piloto WebP (A Criação + Davi e Golias) — escopo revisado (F1.1b)

> **Bloco:** F1.1 (Fase 1 §19), corrigido no F1.1b **antes de qualquer push**.
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD de trabalho `f42d17b`.
> **Escopo FINAL do piloto:** WebP **apenas em cenas ilustradas e capas** de `creation`
> e `david_goliath`. **Colorir NÃO foi convertido** (ver §6). Ferramenta: `sharp`.
> **Status:** working tree corrigido, **não commitado, não pushado**. Aguardando decisão.

---

## 1. Resumo executivo

Piloto WebP **controlado e conservador** em 2 histórias, convertendo **somente o que já é final**: **cenas ilustradas** e **capas** de `creation` e `david_goliath` (22 arquivos). O **colorir ficou de fora de propósito**: as páginas atuais **ainda estão em refinamento manual** e serão substituídas por versões finais (PNG, mesmos nomes). Resultado:

| História | Antes | Depois (revisado) | Redução |
|---|---:|---:|---:|
| creation | 52.95 MB | **29.58 MB** | **−44%** |
| david_goliath | 39.00 MB | **14.39 MB** | **−63%** |
| **Piloto (2)** | **91.95 MB** | **43.97 MB** | **−52%** |
| `assets/` total | 908 MB | **860 MB** | −48 MB |

- **Cenas (lossy q80):** −89% a −95%, todas no budget (103–312 KB). **Aprovadas visualmente no aparelho.**
- **Capas (q82):** 136 KB e 169 KB, no budget. **Aprovadas visualmente.**
- **Colorir:** **inalterado (PNG)** — adiado para bloco próprio (§6). `expo-doctor` e `audio:audit` verdes; `smoke` verde (extensão-agnóstico, F1.1a).

---

## 2. Escopo do piloto (final)

**Convertido para WebP:**
- `assets/stories/creation/scenes` (10) · `assets/stories/david_goliath/scenes` (10) — cenas ilustradas.
- `assets/images/criacao_cover.png` · `assets/images/david_goliath_cover.png` — capas.

**NÃO convertido (mantido em PNG):**
- `assets/stories/creation/coloring` (10) · `assets/stories/david_goliath/coloring` (10) — colorir.

**Não tocado:** as outras 18 histórias, arquitetura híbrida, R2, RevenueCat, Brincar, A1, B5.4, áudio, vozes, rotas, storage, contrato da jornada.

---

## 3. Baseline (antes) × resultado (depois, revisado)

### A Criação (`creation`)
| Grupo | Antes | Depois | Formato depois |
|---|---:|---:|---|
| scenes (10) | 24.07 MB | **2.17 MB** | WebP lossy q80 |
| coloring (10) | 27.27 MB | **27.27 MB** | **PNG (inalterado)** |
| cover | 1645 KB | **136 KB** | WebP q82 |
| **total** | **52.95 MB** | **29.58 MB** | **−44%** |

### Davi e Golias (`david_goliath`)
| Grupo | Antes | Depois | Formato depois |
|---|---:|---:|---|
| scenes (10) | 25.10 MB | **2.18 MB** | WebP lossy q80 |
| coloring (10) | 12.04 MB | **12.04 MB** | **PNG (inalterado)** |
| cover | 1899 KB | **169 KB** | WebP q82 |
| **total** | **39.00 MB** | **14.39 MB** | **−63%** |

> O colorir domina o peso restante (27.27 + 12.04 = 39.31 MB dos 43.97 MB do piloto). Por isso a otimização real do colorir (após as páginas finais) é o próximo grande ganho — em bloco próprio.

---

## 4. Arquivos convertidos (22)

| Tipo | Qtd | Formato | Qualidade | Faixa depois | Budget (§13.1) | Dentro? |
|---|---:|---|---|---|---|---|
| Cenas ilustradas | 20 | WebP lossy | q80, effort 4 | 103–312 KB | 150–400 KB | ✅ 20/20 |
| Capas | 2 | WebP lossy | q82, effort 4 | 136–169 KB | 80–200 KB | ✅ 2/2 |

Dimensão/proporção **preservadas** (sem resize/crop). Metadados removidos. **Colorir não entra nesta tabela** (não convertido).

---

## 5. Decisões de qualidade

- **Cenas → lossy q80:** ganho ~90–95% com detalhe preservado; **validação visual no aparelho aprovada**.
- **Capas → q82:** legibilidade alta no card/vitrine; 16:9 preservado; **aprovada**.
- **Colorir → mantido em PNG:** ver §6.

---

## 6. Colorir — por que ficou de fora (decisão F1.1b)

As **páginas de colorir atuais NÃO são finais** — estão passando por **refinamento manual** e serão substituídas por versões finais (PNG, **mesmos caminhos e nomes**). Converter o colorir agora seria otimizar um asset transitório.

**Fluxo correto (bloco próprio, futuro):**
1. Substituir os PNGs de colorir antigos pelos **novos PNGs refinados** (mesmos nomes).
2. **Validar visualmente** e **testar flood fill** em aparelho.
3. **Só então** decidir a otimização (WebP lossless ou re-export limpo) do colorir final.

> **Nota honesta:** este piloto **não** afirma que colorir em WebP foi aprovado no flood fill. Um teste exploratório de WebP no colorir chegou a ser feito, mas foi **revertido** — o colorir permanece **PNG inalterado**. A otimização do colorir é **bloco próprio**, depois das páginas refinadas, **nunca com lossy sem teste específico**.

---

## 7. Mudanças em requires

Só entradas de `creation` e `david_goliath`; demais 18 histórias intactas.

| Loader | Alteração |
|---|---|
| `src/data/storySceneIllustrations.js` | creation ×10 + david ×10 (cenas) → `.webp` |
| `src/assets/storyCovers.js` | creation + david (capas) → `.webp` |
| `src/assets/coloringImages.js` | **inalterado** (colorir segue `.png`) |

`src/assets/images.js` herda o `.webp` das capas via `STORY_COVERS` (sem edição). Nenhuma referência aos assets do piloto fora desses loaders.

---

## 8. Validação técnica (feita)

- ✅ 22 WebP existem (20 cenas + 2 capas); scenes/covers PNG removidos das 2 piloto.
- ✅ Colorir das 2 piloto **de volta a PNG** (10 + 10), **0 WebP** de colorir.
- ✅ `coloringImages.js` aponta para PNG nas 2 histórias; `storySceneIllustrations.js`/`storyCovers.js` para WebP.
- ✅ Requires resolvem para arquivos existentes; 0 quebrado. Outras 18 histórias intactas.
- ✅ `smoke` (extensão-agnóstico, F1.1a) · `expo-doctor` · `audio:audit` verdes.

---

## 9. Validação visual (aprovada pelo Eduardo)

**Cenas e capas WebP** de A Criação e Davi e Golias: aprovadas no aparelho (sem corte/borrão, proporção ok, capas legíveis). **Colorir:** segue o PNG atual (não faz parte deste piloto).

---

## 10. Rollback

Nada commitado; **git é o backup**.
- Reverter cenas/capas para PNG: `git checkout -- src/data/storySceneIllustrations.js src/assets/storyCovers.js` + `git checkout -- assets/stories/{creation,david_goliath}/scenes assets/images/{criacao_cover,david_goliath_cover}.png` + `rm` dos `.webp` de cenas/capas.
- Colorir já está restaurado ao PNG do `f42d17b`.

---

## 11. Riscos restantes e recomendação para F1.2

**Riscos:**
- **Colorir ainda é o maior peso** do piloto (39.3 MB dos 43.97). Só cai quando as páginas finais chegarem + otimização própria.
- Cenas/capas WebP validadas — sem risco pendente nessas.

**Recomendação (ordem):**
1. **F1.2 (colorir final):** integrar os **PNGs refinados** (mesmos nomes), validar visual + flood fill, e **só então** otimizar (WebP lossless / re-export limpo). **Sem lossy sem teste específico.**
2. **Escalar cenas/capas WebP** para as outras histórias (ganho garantido, sem tocar colorir).
3. Manter o premium (18) rumo aos **packs (Fase 2/3)**.

---

## 12. Confirmações

- **Só `creation` e `david_goliath` foram tocadas** (cenas + capas WebP; colorir revertido a PNG). 0 assets fora do piloto.
- **Colorir pendente para bloco próprio**, após o refinamento manual das páginas.
- **F1.2 não iniciado.** R2, híbrida, RevenueCat, Brincar, A1, B5.4, áudio, vozes não iniciados.
- **Sem commit, sem push, sem `git add`.** Scripts de conversão/medição rodaram fora do repo (scratchpad).
