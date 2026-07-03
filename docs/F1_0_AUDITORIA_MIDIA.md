# F1.0 — Auditoria de Mídia e Plano do Piloto WebP

> **Bloco:** F1.0 (Fase 1 do roadmap oficial §19 — otimização de mídia).
> **Natureza:** diagnóstico e documental. **Nenhum asset convertido, nenhum código alterado.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `5619b01`.
> **Medição:** varredura read-only de `assets/` via Node (`fs.statSync`) + `du`/`git ls-files`.
> Script de medição rodou fora do repo (scratchpad da sessão); não foi versionado.

---

## 1. Resumo executivo

- **`assets/` = 908 MB.** O peso é esmagadoramente **PNG (465 arquivos, 838 MB)**: **cenas ilustradas 451 MB** + **páginas de colorir 278 MB** + **capas 37 MB** + mascote/mapas.
- **Cada cena ilustrada ~2,3 MB** e **cada página de colorir ~1,4 MB** (PNG). São **≈ 12× a 15× acima** do budget do documento mestre (§13.1: cenas 150–400 KB; colorir 200–500 KB; capas 80–200 KB).
- **O bloqueador de loja se confirma** (§3.3): mesmo com WebP, as **18 histórias premium (~641 MB) precisam sair do binário** (arquitetura híbrida, Fase 2/3). Mas o WebP é **groundwork obrigatório**: derruba o peso das **2 grátis locais** (A Criação + Noé ≈ 87 MB) para dentro da meta e otimiza os assets que irão para os packs.
- **Potencial do WebP (medido no piloto pausado):** `creation_scene_01` foi de **2026 KB → 103 KB (~95%)** em WebP lossy. As cenas (lossy q80) reduzem ~90–95%; o colorir (lossless, obrigatório para flood fill) reduz menos (~20–40%) e é o item delicado.
- **Ferramenta já disponível:** **`sharp` está no `node_modules`** (não precisa instalar nada). `cwebp`/`imagemagick` ausentes.
- **Piloto pausado reaproveitável:** `C:\tmp\ptf_webp_pilot_paused` já tem **A Criação + Davi e Golias** (cenas + capas) em WebP (22 arquivos, 4.7 MB). **Falta o colorir** (o item mais sensível).
- **Higiene já resolvida em parte:** os **65 MB de `assets/maps/source_*` e `backup_*` já são excluídos pelo `.easignore`** (não sobem no build). Ficam só no git (contribuem para `.git` = 2.1 GB).

---

## 2. Baseline de peso (agora)

| Escopo | Peso |
|---|---|
| Projeto (sem `node_modules`/`.git`) | ~1.1 GB |
| **`assets/` (total)** | **908 MB** |
| `.git` | 2.1 GB (histórico binário) |
| APK preview medido no A0 (EAS) | ~869 MB |

**Metas do documento mestre (§16):** binário base **ideal 40–80 MB**, **atenção 120 MB**, **limite técnico 200 MB comprimido**.

**Diagnóstico do gap:** o binário atual embarca **as 20 histórias** (838 MB de PNG) via `require()` estático. Só as **2 grátis locais** já somam ~87 MB (acima do ideal). **Conclusão dupla:** (a) WebP nas 2 grátis + capas + mapas leva o **base** para ~50–70 MB (dentro da meta); (b) as **18 premium só saem do binário via híbrida** (Fase 2/3) — WebP sozinho não basta, exatamente como o §3.3 afirma.

---

## 3. Tabela por categoria (`assets/`)

| Categoria | Peso | Notas |
|---|---:|---|
| `assets/stories` | **730 MB** | cenas 451 MB + colorir 278 MB (PNG) — **o núcleo do problema** |
| `assets/maps` | 68 MB | **shipped só 3.7 MB** (`R*.jpg` + previews); **~65 MB** são `source_*`/`backup_*` **já excluídos pelo `.easignore`** |
| `assets/audio` | 59 MB | 224 MP3 (~257 KB/cena) — já comprimido; **fora do escopo WebP** |
| `assets/images` | 38 MB | **20 capas PNG** (37.3 MB, ~1.9 MB cada) — forte candidato a WebP |
| `assets/mascot` | 14 MB | Beni (imagens do mascote) |
| `assets/avatar` | 0.9 MB | avatares |
| ícones/splash/fonts | <0.1 MB | — |

### Formatos atuais (contagem × volume)

| Formato | Arquivos | Volume | Onde aparece |
|---|---:|---:|---|
| **PNG** | **465** | **838 MB** | cenas, colorir, capas, mascote, mapas source/backup |
| MP3 | 224 | 57.5 MB | `assets/audio/<story>/<story>_scene_NN.mp3` |
| JPG | 40 | 9.8 MB | `assets/maps/R*.jpg` (shipped) + previews |
| wav | 1 | ~0 | resíduo |
| `.gitkeep` | 26 | 0 | placeholders de pasta |

---

## 4. Tabela por história (MB) — 20 histórias

Ordenado por peso total. Todas têm **10 cenas + 10 páginas de colorir** (PNG). `noah` inclui áudio interno na pasta (subpastas `audio/`/`narracao/`).

| Story | Total | Scenes | Coloring | nSc | nCol |
|---|---:|---:|---:|---:|---:|
| **creation** ⚠️ | **51.3** | 24.1 | **27.3** | 10 | 10 |
| moses_red_sea | 39.3 | 24.5 | 14.8 | 10 | 10 |
| joseph_colorful_coat | 38.4 | 23.9 | 14.5 | 10 | 10 |
| jesus_children | 38.2 | 24.1 | 14.1 | 10 | 10 |
| mary_says_yes | 37.9 | 23.3 | 14.6 | 10 | 10 |
| jonah_big_fish | 37.2 | 24.9 | 12.3 | 10 | 10 |
| david_goliath | 37.1 | 25.1 | 12.0 | 10 | 10 |
| miraculous_catch | 37.1 | 23.7 | 13.4 | 10 | 10 |
| good_samaritan | 36.5 | 22.7 | 13.8 | 10 | 10 |
| esther_queen | 36.5 | 22.9 | 13.6 | 10 | 10 |
| noah | 35.7 | 22.8 | 12.9 | 10 | 10 |
| jesus_temple | 35.6 | 21.7 | 13.9 | 10 | 10 |
| ruth_naomi | 35.5 | 21.8 | 13.7 | 10 | 10 |
| abraham_stars | 34.7 | 22.5 | 12.2 | 10 | 10 |
| daniel_lions | 34.6 | 22.1 | 12.5 | 10 | 10 |
| lost_sheep | 33.9 | 20.7 | 13.3 | 10 | 10 |
| josiah_young_king | 33.9 | 21.1 | 12.7 | 10 | 10 |
| timothy_faith | 33.3 | 20.5 | 12.8 | 10 | 10 |
| solomon_wisdom | 32.5 | 19.7 | 12.8 | 10 | 10 |
| samuel_hears_god | 29.5 | 18.8 | 10.7 | 10 | 10 |
| **TOTAL** | **728.8** | **450.9** | **278.0** | 200 | 200 |

- **Médias:** cena ilustrada **~2.308 KB**; página de colorir **~1.423 KB**.
- **⚠️ Anomalia:** `creation/coloring` = **27.3 MB** (2× a média). As páginas de colorir de A Criação chegam a **4.7 MB** cada (vs ~1.2–1.5 MB nas outras). Provável export em resolução/qualidade acima do padrão — vale investigar na conversão (F1.1) para não carregar peso indevido no piloto grátis.
- **Grátis locais (creation + noah) = ~87 MB** hoje → alvo da Fase 1.

---

## 5. Top arquivos mais pesados

### Top imagens (KB)
| KB | Arquivo | Tipo |
|---:|---|---|
| 4706 | `assets/stories/creation/coloring/scene_08.png` | colorir |
| 4274 | `assets/stories/creation/coloring/scene_04.png` | colorir |
| 3479 | `assets/stories/creation/coloring/scene_07.png` | colorir |
| 3477 | `assets/stories/creation/coloring/scene_06.png` | colorir |
| 3360 | `assets/maps/source_new_6circles/R3B_source.png` | **map source (não shipped)** |
| 3241 | `assets/maps/source_png_backup/R4B.png` | **map backup (não shipped)** |
| 3126 | `assets/stories/creation/coloring/scene_02.png` | colorir |
| ~1910 (méd.) | `assets/images/*_cover.png` (20 capas) | capa |

> Vários dos "maiores" são **map source/backup já excluídos do build** pelo `.easignore` — inflam o git, não o binário.

### Top áudios (KB) — informativo (fora do escopo F1)
| KB | Arquivo |
|---:|---|
| 463 | `assets/audio/creation/creation_scene_01.mp3` |
| 446 | `assets/audio/noah/noah_scene_10.mp3` |
| 385 | `assets/audio/noah/noah_scene_05.mp3` |
| … | ~257 KB média por cena; teto ~460 KB |

Áudio (57.5 MB) já está comprimido; **não** entra no piloto WebP. Otimização de áudio, se necessária, é decisão à parte (§14, "não re-encodar sem decisão deliberada").

---

## 6. Mapa dos `require()` estáticos de mídia

Metro exige `require()` **literal/estático** → toda mídia listada aqui entra no binário base hoje.

| Loader | Requires | Conteúdo | Ação futura |
|---|---:|---|---|
| `src/data/storySceneIllustrations.js` | ~200 | **cenas** `assets/stories/<id>/scenes/<id>_scene_NN.png` | **WebP lossy** (F1.1 grátis; packs p/ premium) |
| `src/assets/coloringImages.js` | 202 | **colorir** `assets/stories/<id>/coloring/scene_NN.png` | **WebP lossless** (F1.1 grátis; packs p/ premium) |
| `src/assets/storyCovers.js` | 20 | **capas** `assets/images/*_cover.png` | **WebP** (todas — leves, ficam locais) |
| `src/data/adventureMap.js` | 16 | **mapas** `assets/maps/R*.jpg` (+previews) | já JPG (~3.7 MB); WebP opcional/baixa prioridade |
| `src/assets/mascot/beniImages.js` | — | mascote Beni (14 MB) | WebP opcional (bloco futuro) |
| `src/data/avatars.js` | — | avatares (0.9 MB) | baixa prioridade |

**Quais exigem mudança futura para WebP:** `storySceneIllustrations.js`, `coloringImages.js`, `storyCovers.js` (e, opcional, mapas/mascote/avatares).
**Quais exigem saída para packs remotos (híbrida, Fase 2/3):** cenas + colorir + capas das **18 premium** (`storySceneIllustrations`/`coloringImages`/`storyCovers` deixam de `require()` os premium e passam a resolver por `file://` do pack).
**Risco para o binário base:** os `require()` de cenas (451 MB) e colorir (278 MB) das 18 premium — precisam sair; as 2 grátis ficam, mas **em WebP**.

---

## 7. Riscos principais

1. **Colorir × flood fill (risco ALTO):** o preenchimento (flood fill) depende de **fundo branco puro + contornos pretos nítidos**. WebP **lossy** pode introduzir cinza/artefato em bordas e **vazar/quebrar o preenchimento**. → colorir **só em WebP lossless** (ou q≥95 near-lossless) e **validação em aparelho real** obrigatória. É o item que pode reprovar o piloto.
2. **Perda visual nas cenas (risco MÉDIO):** q80 lossy pode suavizar detalhe. Validar visualmente no aparelho (sem corte, sem mudança de proporção).
3. **`.git` = 2.1 GB (risco de fluxo):** converter no lugar troca 400 PNGs tracked por WebP → novo peso no histórico. Mitigação: git é o backup (rollback fácil); avaliar `git gc`/estratégia de histórico só na Fase 2+ (fora do F1.1).
4. **Anomalia de `creation/coloring` (27 MB):** páginas de A Criação exportadas pesadas demais; a conversão precisa medir caso a caso para não normalizar "para cima".
5. **WebP não resolve o binário sozinho:** confirmado (§3.3). Sem a híbrida, as 18 premium continuam pesando. F1 é pré-requisito, não solução final.

---

## 8. Plano do piloto F1.1

### História grátis piloto — **A Criação** (`creation`)
Motivo: é a 1ª história local grátis; tem a maior anomalia de colorir (bom estresse); já parcialmente convertida no piloto pausado (cenas + capa).

### História premium piloto — **Davi e Golias** (`david_goliath`)
Motivo: 1ª premium da jornada após Noé (representativa do fluxo premium), peso típico (37 MB), **e já parcialmente convertida no piloto pausado** (cenas + capa) → reaproveitável. Alternativa considerada e descartada: `moses_red_sea` (mais pesada) — mas Davi é mais representativa da sequência da jornada e já tem material de piloto.

### Budgets por tipo (§13.1)
| Tipo | Formato F1.1 | Qualidade sugerida | Budget/arquivo |
|---|---|---|---:|
| Cena ilustrada | **WebP lossy** | **q80** (ajustar 78–82 no aparelho) | **150–400 KB** |
| Página de colorir | **WebP lossless** | lossless (ou q≥95 near-lossless se aprovado) | **200–500 KB** |
| Capa | **WebP lossy** | q80 | **80–200 KB** |
| Thumbnail (se necessário) | WebP | q70 | 10–40 KB |

Escopo do piloto: **2 histórias** (creation + david_goliath) → 20 cenas + 20 colorir + 2 capas = **42 arquivos**, medindo peso antes/depois por arquivo.

### Reaproveitamento do piloto pausado
`C:\tmp\ptf_webp_pilot_paused` já tem **cenas + capas** de creation e david_goliath em WebP (referência de qualidade/peso). **Não copiar para o repo neste F1.0.** No F1.1: **regenerar com `sharp`** (reprodutível, parâmetros versionados) e **adicionar o colorir** (que falta e é o item crítico).

---

## 9. Ferramenta recomendada

| Ferramenta | Disponível? | Prós | Contras |
|---|---|---|---|
| **`sharp`** ✅ | **SIM (node_modules)** | libvips (rápido, alta qualidade), lossy **e lossless**, script Node reprodutível, cross-platform (Win/Mac), controle fino por arquivo | precisa de um script de conversão (trivial) |
| `cwebp` | não | referência oficial WebP, ótimo lossless | instalar binário; CLI por arquivo |
| ImageMagick | não | versátil | instalar; qualidade WebP inferior ao cwebp/sharp |
| Squoosh CLI | não | bom p/ ajuste fino manual | descontinuado/instalação Node extra |

**Recomendação: `sharp`.** Justificativa: **já instalado** (zero instalação nova — respeita "não instalar biblioteca"), suporta **lossless para colorir** (crítico p/ flood fill) e **lossy q80 para cenas/capas**, é **scriptável e reprodutível** (parâmetros no script, medível antes/depois), e roda igual em Windows e Mac. O script de conversão do F1.1 fica **fora do repo** (scratchpad) ou como script de tooling explicitamente aprovado.

---

## 10. Checklist de validação (F1.1)

### 10.1 Cenas ilustradas (visual)
- [ ] Visual no **aparelho real** (não só no editor).
- [ ] Sem perda perceptível de nitidez/detalhe.
- [ ] Sem corte nas bordas.
- [ ] Proporção preservada (mesmo W×H).
- [ ] Peso dentro de 150–400 KB.

### 10.2 Colorir — **flood fill (crítico)**
- [ ] **Fundo branco puro** preservado (sem cinza/off-white introduzido).
- [ ] **Contornos pretos** preservados (sem serrilhado/artefato de compressão).
- [ ] **Flood fill funciona** em cada uma das 10 páginas (preenche a região certa).
- [ ] **Sem vazamento** para fora do contorno.
- [ ] **Sem cinza/halo** nas bordas que quebre o preenchimento.
- [ ] Teste em **aparelho real** (o canvas WebView é o juiz final).
- [ ] Peso dentro de 200–500 KB.

### 10.3 Capas
- [ ] 16:9 preservado.
- [ ] Peso 80–200 KB.
- [ ] Legível no card do mapa e na vitrine (StoryDetail).

---

## 11. Estratégia de substituição e rollback (F1.1)

**Substituição:**
- Manter o **basename**, trocar **extensão** `.png` → `.webp` (ex.: `creation_scene_01.png` → `creation_scene_01.webp`).
- Ajustar os `require()` **apenas das 2 histórias-piloto** em `storySceneIllustrations.js`, `coloringImages.js`, `storyCovers.js` (extensão `.webp`). Metro/RN suportam WebP nativamente.
- **Não** renomear pastas; **não** mexer nas outras 18 histórias no F1.1.

**Comparação antes/depois:** medir KB por arquivo (script `sharp`) + tabela por história; validar visual/flood fill no aparelho.

**Backup:** os PNGs originais **já estão tracked no git** (400 arquivos em `assets/stories`, 20 capas) → **git é o backup**. Opcional: copiar os originais das 2 histórias-piloto para a scratchpad antes de converter.

**Rollback (se a validação reprovar):**
- `git checkout -- <arquivos png>` restaura os PNGs originais.
- Reverter as edições de extensão nos 3 loaders (git).
- Nenhuma chave de storage, rota ou lógica é tocada → rollback é só de asset + require.

**Critérios de rollback (reprovar o piloto):** qualquer flood fill quebrado, vazamento, fundo não-branco, perda visual perceptível nas cenas, ou peso acima do budget sem ganho de qualidade. Nesse caso, ajustar qualidade (q maior / lossless) e repetir; se persistir no colorir, manter colorir em **PNG** e converter só cenas/capas.

---

## 12. Riscos que NÃO entram no F1.1 (ficam para fases próprias)

- **Híbrida/R2/packs** (Fase 2/3) — saída das 18 premium do binário.
- **Áudio** (§14) — re-encode só com decisão deliberada.
- **`.git` gc / limpeza de histórico** — Fase de higiene dedicada.
- **Mapas/mascote/avatares em WebP** — bloco posterior (ganho pequeno).
- **Escalar para as 20 histórias** — só depois do piloto (creation+david) aprovado visualmente.

---

## 13. Próximo prompt sugerido (F1.1)

> **F1.1 — Piloto WebP (A Criação + Davi e Golias).**
> Escopo: converter com `sharp` (já instalado) **cenas** (WebP lossy q80, 150–400 KB) e **colorir** (WebP lossless, 200–500 KB) e **capas** (WebP q80, 80–200 KB) **apenas** de `creation` e `david_goliath`. Ajustar `require()` dessas 2 histórias em `storySceneIllustrations.js`, `coloringImages.js`, `storyCovers.js`. Medir peso antes/depois por arquivo. Backup via git. **Validação obrigatória em aparelho real:** cenas (visual) + **colorir (flood fill)** + capas.
> Regras: não escalar para outras 18; não tocar híbrida/áudio/rotas/storage; script de conversão fora do repo (ou tooling aprovado); `npm run smoke` + `expo-doctor` + `audio:audit` verdes; **sem commit/push sem validação visual do Eduardo**.
> Critério de saída (§19 Fase 1): visual aprovado, flood fill aprovado, peso reduzido, nenhum fluxo quebrado, gates verdes.

---

## 14. Confirmações do F1.0

- **Nenhum asset convertido/movido/renomeado/apagado.**
- **Nenhum código, rota, storage, `.easignore` ou manifesto alterado.**
- **Nenhuma biblioteca instalada** (sharp já existia).
- **Único arquivo criado:** este `docs/F1_0_AUDITORIA_MIDIA.md`.
- Script de medição rodou na **scratchpad da sessão (fora do repo)** — não versionado.
