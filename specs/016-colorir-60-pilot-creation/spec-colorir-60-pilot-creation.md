# Spec — Colorir 60: Curadoria Visual do Piloto A Criação

> **Feature:** `016-colorir-60-pilot-creation` · **Bloco:** PTF PRODUCT LOCK 01E (+ QA/ratificação 01E-QA) · **Etapa SDD:** 1 (Specify) · **Portão 1: decisões E1–E5 ratificadas pelo fundador em 2026-07-21.**
> **Data:** 2026-07-21 · **Base (commit documental):** `42a69910e8935ba2d41f1faf53bf61a4504f00dc` (01D) · cadeia `3cd7e3f`→`00d1a52`→`dab57ed`→`42a6991` · **Worktree:** `docs/product-lock-01e-creation-curation`.
> **Identificador ratificado:** `016` (`013`=camada-de-alma, `014`=colorir-60, `015`=rollout-gates).
> **Natureza:** curadoria/inspeção visual, **read-only**. **Nenhum** código, asset novo, edição/sobrescrita/cópia/movimentação/renome de imagem, pack, manifesto, storage, entitlement, migração, geração de imagem, prompt final de geração, build, commit, push ou merge.
>
> **Precedência:** SoT → constituição → `AGENTS.md`/`CLAUDE.md`; decisões por `docs/DECISIONS.md` (PL01A). Respeita 013/014/015. **Não reabre decisão de 01A–01D.**
>
> **Objetivo:** selecionar as **três atividades** de colorir do piloto **A Criação** — `light`, `living_world`, `people_and_care` — com inspeção visual efetiva, decidindo por atividade entre **reutilizar / nova arte**, **sem apagar, sobrescrever, copiar ou mover** nenhum lineart legado.
>
> **Resultado ratificado:** **1 reutilizada** (`light`=scene_02, após inspeção full-res) · **2 novas artes** (`living_world`, `people_and_care`) · **0 sobrescritas** · **10 linearts legados preservados**.

---

## 1. Objetivo e método de inspeção visual

**§7 cumprido:** as 10 páginas de colorir e as 10 ilustrações narrativas foram **efetivamente visualizadas** (pixels), não inferidas de nome/título/`instrucaoColorir`/metadados/relatórios. Como `assets/stories/` é **untracked**, a inspeção leu os arquivos reais do working dir principal (`C:\Projetos\...`), **read-only**. Previews (768px colorir / 640px cenas) e **crops 1:1 de `scene_02`** foram gerados na pasta externa `C:\tmp\ptf_product_lock_01e_evidence\` (fora do Git; não substituem assets) e visualizados. **Gabarito máximo = `textoNarracao`** (M3 §1). Inspeção **confiável** — não houve bloqueio.

---

## 2. Fotografia factual das 10 páginas

| Página | Path (legado) | Dim | Proporção | Formato | sha256 (12) |
|---|---|---|---|---|---|
| scene_01 | `…/coloring/scene_01.png` | 1024×1280 | 4:5 | PNG RGBA | `8eb2a066973d` |
| scene_02 | `…/scene_02.png` | 1122×1402 | 4:5 | RGBA | `35d6f50c72e9` |
| scene_03 | `…/scene_03.png` | 1122×1402 | 4:5 | RGBA | `41482a5d8908` |
| scene_04 | `…/scene_04.png` | 1122×1402 | 4:5 | RGBA | `764809dcc2aa` |
| scene_05 | `…/scene_05.png` | 1122×1402 | 4:5 | RGBA | `a48d82462498` |
| scene_06 | `…/scene_06.png` | 1122×1402 | 4:5 | RGBA | `e661fd351a12` |
| scene_07 | `…/scene_07.png` | 1122×1402 | 4:5 | RGBA | `91be61a89554` |
| scene_08 | `…/scene_08.png` | 1122×1402 | 4:5 | RGBA | `96fea3482192` |
| scene_09 | `…/scene_09.png` | 1122×1402 | 4:5 | PNG RGB | `30d4eee23d8e` |
| scene_10 | `…/scene_10.png` | 1024×1280 | 4:5 | RGBA | `ba7cc35afa89` |

Todas 4:5, PNG legível, sem texto/marca d'água observados.

---

## 3. Inspeção FULL-RESOLUTION de `scene_02` (pré-requisito da reutilização — §01E-QA §3)

Crops 1:1 do original 1122×1402 (`scene02_crops/`: center_rays, cloud_left, cloud_right, waves_bottom, 4 cantos) inspecionados:
1. **Centro dos raios:** convergência limpa; raios contínuos, retos, espessura fina consistente. ✔
2. **Bordas/encontro das nuvens:** contornos **grossos e consistentes**, lobos fechados. ✔
3. **Linhas das ondas:** faixas contínuas e **fechadas** (coloríveis), sem quebras. ✔
4. **Cantos (TL/TR/BL/BR):** moldura preta intacta; sem elementos importantes cortados. ✔
5. **Áreas pequenas fechadas:** lobos de nuvem e faixas de onda fecham (flood-fill não vaza). ✔
6. **Continuidade das linhas:** íntegra em raios, nuvens e ondas. ✔
7. **Espessura dos contornos:** nuvens grossas × raios/ondas finos — **coerente por tipo** (estilístico). ✔
8. **Texto/marca d'água/elementos indevidos:** **nenhum**. ✔

**Artefatos observados:** 1–2 **pontinhos isolados minúsculos** em áreas brancas (ex.: perto do centro dos raios e num canto) — cosméticos, isolados, **fora de linhas e de regiões relevantes**; **não impeditivos** (não afetam o flood-fill nem a leitura infantil).

**Veredito da inspeção full-res:** **SEM defeito impeditivo → reutilização de `scene_02` APROVADA** (E2 ratificada). *(Registrado como observação menor; caso o fundador queira remover os pontinhos, isso seria uma NOVA ARTE em novo path — nunca sobrescrita.)*

---

## 4. Correção bíblica — vestes de folhas em `scene_08`/`scene_09` (ratificada — 01E-QA §4)

A curadoria anterior concluiu (incorretamente) que as **vestes de folhas** de `scene_08`/`scene_09` eram "adequadas/modestas". **Correção ratificada:**
1. As atividades representam a **criação do ser humano ANTES da queda**.
2. **Vestes/coberturas de folhas pertencem à iconografia POSTERIOR à desobediência** (Gn 3:7).
3. Usá-las aqui **mistura etapas distintas** da narrativa bíblica.
4. **Modéstia visual NÃO justifica** inserir um elemento cronologicamente incorreto.
5. **`scene_08` e `scene_09` NÃO serão páginas ativas** do Colorir 60 para `people_and_care`.
6. Ambas **permanecem preservadas como legado**.
7. **`people_and_care` exige NOVA ARTE** em path novo (§9/§12).

Não altera o roteiro oficial nem os arquivos atuais.

---

## 5. Matriz das 10 páginas (atualizada)

| # | Cena | O que aparece (visto) | Gates ativos | Rubrica | Papel/Conceito | Classificação principal |
|---|---|---|---|---|---|---|
| 01 | 1 | Nuvens + raios + água | passa | ~4.1 | `light` (alt) | **CANDIDATA SECUNDÁRIA** |
| 02 | 2 | **Explosão de raios** entre nuvens sobre água | passa (full-res) | ~5.0 | **`light`** | **REUTILIZAR COMO ATIVA** |
| 03 | 3 | Nuvens, grande céu vazio, água | passa (centro vazio) | ~3.4 | céu/águas | **ARQUIVAR DO CATÁLOGO ATIVO FUTURO** |
| 04 | 4 | Árvores/flores/rio — **flora, sem animais** | passa | ~4.4 | flora (ref.) | **CANDIDATA SECUNDÁRIA** |
| 05 | 5 | Sol + **lua com rosto** + estrelas | passa (lua antropomórfica) | ~4.3 | luzeiros | **ARQUIVAR DO CATÁLOGO ATIVO FUTURO** |
| 06 | 6 | 3 aves + 3 peixes | passa | ~4.6 | fauna aérea/aquática (ref.) | **CANDIDATA SECUNDÁRIA** |
| 07 | 7 | Leão/elefante/girafa/coelho/ovelha + árvore | passa | ~4.9 | fauna terrestre (ref.) | **CANDIDATA SECUNDÁRIA** |
| 08 | 8 | Casal **com vestes de folhas** + jardim | **FALHA (cronologia — §4)** p/ ativo | fidelidade↓ | — | **SOMENTE LEGADO** |
| 09 | 9 | Casal (folhas) + muitos animais — cheia | **FALHA (cronologia — §4)** + cheia | fidelidade↓ | — | **SOMENTE LEGADO** |
| 10 | 10 | Descanso (árvore, rio, ovelha dormindo) | passa | ~4.2 | descanso | **ARQUIVAR DO CATÁLOGO ATIVO FUTURO** |

**Preservação × classificação (correção 01E-QA §10):**
- **Preservação compatível com legado:** aplica-se aos **DEZ** (todos permanecem fisicamente preservados, §11).
- **Classificação principal `SOMENTE LEGADO`:** aplica-se **apenas** a `scene_08` e `scene_09` (sem papel ativo nem secundário, por inconsistência cronológica). **Não** se usa a frase "SOMENTE LEGADO aplica-se a todas".

---

## 6. Gates eliminatórios — resultado

Aplicados às 10. **Falha eliminatória para papel ATIVO:** `scene_08` e `scene_09` — **vestes de folhas = elemento pós-queda numa cena pré-queda** (mistura etapas da narrativa; §4). As demais passam os gates; classificações refletem alinhamento de conceito (não reprovação). Sem texto/marca d'água/anatomia quebrada em nenhuma. Observações menores não-eliminatórias: `scene_03` (centro vazio), `scene_05` (lua com rosto), `scene_09` (cheia). Média alta não compensa gate — respeitado.

---

## 7. Ranking por conceito

- **`light`:** **02** (raios, áreas grandes, esperança) ≫ 01 > 03. → reutilizar 02.
- **`living_world`:** nenhuma entrega **terra+plantas+animais** equilibrados: 07 (fauna terrestre, flora discreta) ≥ 06 (aves+peixes) > 04 (flora, sem animais). → **nova arte**.
- **`people_and_care`:** 08/09 **eliminadas** (folhas pós-queda). → **nova arte**.

---

## 8. Rubrica (0–5) das candidatas de referência

| Critério | 02 (light) | 07 | 04 | 06 |
|---|---|---|---|---|
| Fidelidade bíblica/narrativa | 5 | 5 | 4 | 5 |
| Clareza da composição | 5 | 5 | 5 | 5 |
| Facilidade de colorir | 5 | 5 | 5 | 5 |
| Adequação 6–8 | 5 | 5 | 5 | 5 |
| Qualidade do lineart | 5 | 5 | 5 | 5 |
| Valor emocional | 5 | 5 | 4 | 4 |
| Diversidade do conjunto | 5 | 4 | 4 | 4 |
| Potencial Livro/Cartão | 5 | 5 | 4 | 4 |
| Potencial de reutilização | 5 | 5 (secundária) | 4 | 4 |

*(scene_08/09 não pontuadas para papel ativo — reprovadas por gate cronológico.)*

---

## 9. Seleção final das três atividades (ratificada)

| activityId | Decisão | Base | Motivo |
|---|---|---|---|
| **`light`** | **REUTILIZAR `scene_02.png`** | inspeção full-res aprovada (§3) | raios de luz, áreas grandes, fiel à cena 2 |
| **`living_world`** | **NOVA ARTE NECESSÁRIA** | E1 | nenhuma página entrega terra+plantas+animais equilibrados |
| **`people_and_care`** | **NOVA ARTE NECESSÁRIA** | E3 + §4 | 08/09 têm vestes de folhas (pós-queda) — cronologicamente incorretas |

**Resultado:** 1 reutilizada · 2 novas · 0 sobrescritas · 10 legados preservados.

**Diversidade (E4 planejada):** as duas novas artes são planejadas **em conjunto**: `living_world` = abundância da natureza **sem pessoas**; `people_and_care` = pessoas + gesto de cuidado; **sem repetir os mesmos animais principais**. Conjunto final: **(1) luz e céu · (2) flora e fauna · (3) pessoas e cuidado** — três composições distintas.

---

## 10. Preservação do legado (explícito)

1. Os **dez `scene_NN.png` continuam preservados**. 2. **Nenhum** sobrescrito. 3. **Nenhum** movido/renomeado/copiado. 4. **Nenhum** removido do bundle/pack. 5. A reutilizada (`scene_02`) poderá ser **referenciada** pelo catálogo na transição **sem alterar conteúdo** (não copiar/mover neste bloco). 6. As novas artes vão a **paths novos por atividade**. 7. Obras antigas seguem no **leitor legado por `storyId + sceneId`** (015 D1). 8. Esta curadoria **não autoriza limpeza de assets** (015 §6/D1).

---

## 11. Contrato entregue à implementação (catálogo)

| storyId | activityId | order | Título | Instrução | Asset | Path legado | Path futuro | Disponibilidade |
|---|---|---|---|---|---|---|---|---|
| creation | `light` | 1 | "Haja luz" | "Pinte a luz rompendo a escuridão." | **legado reutilizado** | `…/coloring/scene_02.png` | `…/coloring/activities/light.png` | **PRONTA PARA REUTILIZAÇÃO** |
| creation | `living_world` | 2 | "O mundo cheio de vida" | "Pinte a terra, as plantas e os animais." | **nova arte** | — | `…/coloring/activities/living_world.png` | **REQUER NOVA ARTE** |
| creation | `people_and_care` | 3 | "Na criação de Deus" | "Pinte as pessoas cuidando da criação." | **nova arte** | — | `…/coloring/activities/people_and_care.png` | **REQUER NOVA ARTE** |

> Identidade = par `(storyId, activityId)` **sem `#`** (014/015). A curadoria não escolhe funções/schemas/código.

---

## 12. Briefs de produção documental (sem imagem, sem prompt final)

### Brief `living_world`
1. **Objetivo:** o mundo criado **cheio de vida** — terra + plantas + animais juntos, equilibrados.
2. **Elementos obrigatórios:** solo/gramado; **árvore**; **plantas e flores**; **3–5 animais amigáveis**; **≥1 ave**; áreas grandes.
3. **Elementos proibidos:** **pessoas**; texto; marca d'água; cena só aquática; composição excessivamente cheia; detalhes minúsculos.
4. **Composição:** animais em primeiro plano sobre grama; árvore lateral; flores; colinas e céu simples ao fundo.
5. **Complexidade:** 6–8 — regiões grandes, no máx. ~6 animais, linhas grossas e fechadas.
6. **Relação bíblica:** síntese das cenas 4/6/7 ("mundo cheio de vida"), sem contradizer nenhuma.
7. **Modéstia:** n/a (sem pessoas).
8. **Path futuro:** `…/coloring/activities/living_world.png` (novo asset; nunca sobrescrever `scene_NN`).
9. **Critérios de aceite:** coerência bíblica; áreas coloríveis grandes; linhas fechadas/nítidas; sem texto/marca; 6–8; **distinta de `people_and_care`** (sem repetir os mesmos animais principais).

### Brief `people_and_care`
1. **Objetivo:** pessoas na criação de Deus + gesto de cuidado (cena 8).
2. **Elementos obrigatórios:** **homem e mulher ANTES da queda**; **gesto simples de cuidado** com uma planta ou animal; dignidade e serenidade; áreas grandes; poucos elementos principais.
3. **Elementos proibidos:** **vestes de folhas**; **roupas pós-queda**; anatomia explícita; sexualização; texto; marca d'água; composição cheia.
4. **Composição:** casal em primeiro plano; **modéstia obtida por enquadramento, pose, cabelo, plantas em primeiro plano ou composição** (não por vestes); um animal/planta recebendo o cuidado; jardim simples ao fundo.
5. **Complexidade:** 6–8 — regiões grandes, linhas grossas e fechadas.
6. **Relação bíblica:** coerente com a cena 8 oficial (o ser humano criado; cuidar da criação; antes da queda).
7. **Modéstia (regra):** enquadramento/pose/vegetação em primeiro plano; **sem** folhas e **sem** roupas pós-queda; sem anatomia explícita.
8. **Path futuro:** `…/coloring/activities/people_and_care.png` (novo asset).
9. **Critérios de aceite:** coerência bíblica + cronológica (sem folhas/roupas pós-queda); dignidade; áreas grandes; sem texto/marca; 6–8; **distinta de `living_world`**.

**Não gerar imagens nem prompts finais neste bloco.**

---

## 13. Decisões ratificadas pelo fundador (2026-07-21)

> **E1–E5 DECIDIDOS** — deixam de ser questões abertas.

| ID | Decisão | Motivo | Impacto | Dependência | Próximo bloco |
|---|---|---|---|---|---|
| **E1** `living_world` | **Nova arte** (não reutilizar `scene_07`) | nenhuma página entrega terra+plantas+animais equilibrados | produção de 1 arte nova | brief §12 | produção/impl |
| **E2** `light` | **Reutilizar `scene_02`** (full-res aprovada) | raios de luz, áreas grandes, fiel à cena 2; sem defeito impeditivo | 1 página pronta | inspeção §3 | impl |
| **E3** `people_and_care` | **Nova arte** (não usar `scene_08`/`scene_09`) | vestes de folhas = pós-queda (cronologia) | produção de 1 arte nova | §4 + brief §12 | produção/impl |
| **E4** diversidade | Planejar as 2 novas artes **em conjunto**; sem repetir animais; 3 composições distintas | evitar conjunto repetitivo/flora incompleta | briefs coordenados | E1+E3 | produção/impl |
| **E5** lua com rosto | `scene_05` **fora do ativo**; preservada como legado | lua antropomorfizada não usada no piloto | nenhuma ação de asset | — | — |
| **QA-BIBLIA** correção | 08/09 **não ativas** (folhas pós-queda); preservadas legado; `people_and_care` = nova arte | fidelidade cronológica > modéstia por elemento incorreto | reforça E3 | §4 | produção/impl |

**Nova pendência do fundador nesta auditoria:** **nenhuma.** A inspeção full-res de `scene_02` **não** encontrou defeito impeditivo (apenas pontinhos cosméticos), então **não** há bloqueio; nada foi resolvido silenciosamente.

---

## 14. Fora de escopo

❌ código · ❌ assets novos · ❌ edição/cópia/movimentação/sobrescrita de imagens · ❌ storage · ❌ entitlement · ❌ packs · ❌ manifestos · ❌ migração · ❌ geração de imagens · ❌ **prompts finais de geração** · ❌ geração de prompts de todas as histórias · ❌ **Noé** · ❌ outras 19 histórias · ❌ implementação do catálogo · ❌ build · ❌ commit · ❌ push · ❌ merge.

---

## 15. Critérios de aceite

(1) 10 páginas inspecionadas visualmente; (2) 10 ilustrações de referência; (3) **inspeção full-res de `scene_02`** (§3); (4) **correção bíblica de `scene_08`/`scene_09`** (§4); (5) `light` **reutilizada**; (6) `living_world` **nova arte**; (7) `people_and_care` **nova arte**; (8) **uma** reutilizada; (9) **duas** novas; (10) diversidade **planejada** (§9); (11) matriz das 10 atualizada (§5); (12) classificação de legado **corrigida** (preservação-de-todos × principal-SOMENTE-LEGADO só 08/09); (13) **E1–E5 ratificados** (§13); (14) paths futuros registrados (§11); (15) **zero asset alterado**; (16) **zero código alterado**; (17) **todos os linearts preservados** (§10); (18) **nenhuma decisão aberta não registrada** (§13 — nenhuma nova).

---

## Artefatos de evidência (externos, fora do Git)

Pasta `C:\tmp\ptf_product_lock_01e_evidence\`:
- `coloring/scene_01…10.png` — previews 768px das 10 páginas de colorir.
- `scenes/creation_scene_01…10.png` — previews 640px das 10 ilustrações narrativas.
- `scene02_crops/` — **crops 1:1** de `scene_02` (center_rays, cloud_left, cloud_right, waves_bottom, corner_TL/TR/BL/BR) para inspeção full-resolution.

**Não entram no Git · não substituem assets · evidência visual apenas.** Os assets originais permanecem intocados.
