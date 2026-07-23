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
> **Resultado ratificado:** **1 reutilizada** (`light`=`scene_02`) · **2 novas artes** (`living_world`, `people_and_care`) · **10 linearts legados de A Criação preservados nos mesmos paths**.
>
> ⚠️ **REANCORADO EM 2026-07-22 — ver §16.** O **conteúdo** de `assets/stories/creation/coloring/scene_02.png` foi **substituído** por decisão explícita do fundador (commit `cc63e19`), porque o asset anterior continha erros. As formulações originais desta spec — "0 sobrescritas" e "após inspeção full-res" — descrevem o estado de **2026-07-21** e **não** descrevem o estado atual. Contrato vigente de `scene_02.png`: `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1`. As decisões de curadoria (E1–E5, §4, §9, briefs §12) **permanecem válidas e não são reabertas**.

---

## 1. Objetivo e método de inspeção visual

**§7 cumprido:** as 10 páginas de colorir e as 10 ilustrações narrativas foram **efetivamente visualizadas** (pixels), não inferidas de nome/título/`instrucaoColorir`/metadados/relatórios. Como `assets/stories/` é **untracked**, a inspeção leu os arquivos reais do working dir principal (`C:\Projetos\...`), **read-only**. Previews (768px colorir / 640px cenas) e **crops 1:1 de `scene_02`** foram gerados na pasta externa `C:\tmp\ptf_product_lock_01e_evidence\` (fora do Git; não substituem assets) e visualizados. **Gabarito máximo = `textoNarracao`** (M3 §1). Inspeção **confiável** — não houve bloqueio.

---

## 2. Fotografia factual das 10 páginas

| Página | Path (legado) | Dim | Proporção | Formato | sha256 (12) |
|---|---|---|---|---|---|
| scene_01 | `…/coloring/scene_01.png` | 1024×1280 | 4:5 | PNG RGBA | `8eb2a066973d` |
| scene_02 | `…/coloring/scene_02.png` | 1122×1402 | 4:5 | **PNG RGB** | **`c960f1bb1c34`** |
| scene_03 | `…/scene_03.png` | 1122×1402 | 4:5 | RGBA | `41482a5d8908` |
| scene_04 | `…/scene_04.png` | 1122×1402 | 4:5 | RGBA | `764809dcc2aa` |
| scene_05 | `…/scene_05.png` | 1122×1402 | 4:5 | RGBA | `a48d82462498` |
| scene_06 | `…/scene_06.png` | 1122×1402 | 4:5 | RGBA | `e661fd351a12` |
| scene_07 | `…/scene_07.png` | 1122×1402 | 4:5 | RGBA | `91be61a89554` |
| scene_08 | `…/scene_08.png` | 1122×1402 | 4:5 | RGBA | `96fea3482192` |
| scene_09 | `…/scene_09.png` | 1122×1402 | 4:5 | PNG RGB | `30d4eee23d8e` |
| scene_10 | `…/scene_10.png` | 1024×1280 | 4:5 | RGBA | `ba7cc35afa89` |

Todas 4:5, PNG legível, sem texto/marca d'água observados.

> **Nota técnica — `scene_02` reancorada em 2026-07-22 (§16).** A linha de `scene_02` acima registra o **contrato vigente**, não o arquivo inspecionado em 2026-07-21. Contrato atual completo de `assets/stories/creation/coloring/scene_02.png`:
>
> | Atributo | Valor |
> |---|---|
> | SHA-256 (completo) | `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1` |
> | SHA-256 (prefixo documental, 12) | `c960f1bb1c34` |
> | Tamanho | 861767 bytes |
> | Dimensões | 1122 × 1402 (proporção 4:5) |
> | Bit depth | 8 |
> | Color type | 2 |
> | Modo | RGB |
> | Transparência | **nenhuma** — sem canal alpha, sem chunk `tRNS` |
> | Formato | **PNG verdadeiro** — magic `89 50 4E 47 0D 0A 1A 0A`, IHDR de 13 bytes |
>
> As **nove demais linhas** da tabela permanecem conforme a baseline de 2026-07-21. O prefixo anterior de `scene_02`, `35d6f50c72e9` (modo RGBA, 3201048 bytes), é **histórico: substituído, não canônico, não usar como baseline** (§16).

---

## 3. Inspeção FULL-RESOLUTION de `scene_02` — registro **HISTÓRICO** do asset `35d6f50c…` (superado em 2026-07-22)

> ⚠️ **Esta seção descreve o asset ANTERIOR** (`35d6f50c72e978e44a9d2727a970a4ace3635ef3184a36729a5e4a13faffaddb`, RGBA, 3201048 bytes), **substituído** em 2026-07-22. É preservada como registro de auditoria e **não descreve** o arquivo hoje em `assets/stories/creation/coloring/scene_02.png`. O estado vigente está em **§3-bis** e **§16**.

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

**Veredito da inspeção full-res (2026-07-21 — HISTÓRICO, superado):** naquela data a inspeção concluiu **"sem defeito impeditivo → reutilização aprovada"** (E2). Esse veredito **foi superado em 2026-07-22**: ver §3-bis. A ressalva registrada então — de que uma eventual correção exigiria "nova arte em novo path, nunca sobrescrita" — **não vigora** para este caso, substituída pela exceção ratificada de §10/§16.

---

## 3-bis. Estado VIGENTE de `scene_02` (reancorado em 2026-07-22)

1. A inspeção de §3 correspondia ao asset cujo SHA-256 inicia por **`35d6f50c`**.
2. Esse asset foi **posteriormente considerado incorreto pelo fundador**.
3. A decisão anterior de reutilização visual (§3/E2, 2026-07-21) está, portanto, **superada**.
4. O fundador **aprovou uma nova composição** — visual, teológica e logicamente.
5. A nova imagem foi **integrada no mesmo path**: `assets/stories/creation/coloring/scene_02.png`.
6. O **contrato vigente** é `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1` (861767 bytes · 1122×1402 · bit depth 8 · color type 2 · RGB · sem transparência), registrado na nota técnica de §2.
7. A substituição **no mesmo caminho foi intencional** e está registrada no commit `cc63e19`.
8. Por ser o mesmo arquivo físico, ela atualiza **simultaneamente** o Colorir legado (`coloringImages.js`, `creation`/cena 2) e a atividade **`light`** do Colorir 60 (`coloring60LocalAssets.js`) — um único `require()` literal, uma única fonte.
9. **Não existe** `assets/stories/creation/coloring/activities/light.png`, e sua criação segue **proibida** (§11 e §16).
10. A **aprovação visual do fundador é final** e não é reaberta por este documento.

### Pendência operacional (não reabre estética nem teologia)

**Não** foi executada, até esta data, uma inspeção técnica full-resolution do novo PNG equivalente à de §3 — este registro é honesto quanto a isso. Fica pendente, como validação de **comportamento no canvas**:

1. validação em dispositivo físico;
2. teste de flood-fill nas regiões de **nuvens**;
3. teste de flood-fill nas **ondas**;
4. verificação de **vazamentos** entre regiões adjacentes;
5. **legibilidade** em tela de celular;
6. **contorno preservado** durante a pintura.

Esta pendência é **operacional**: valida apenas se a página se comporta corretamente no canvas. Ela **não** reabre a decisão estética ou teológica, já ratificada pelo fundador.

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

> **Nota de reancoragem (2026-07-22 — §16).** Na linha `02` desta matriz, bem como no ranking de §7 e na rubrica de §8, a **descrição visual** ("explosão de raios entre nuvens sobre água", "raios, áreas grandes"), a marca "passa (full-res)" e as pontuações referem-se ao asset **anterior** (`35d6f50c…`). O que permanece vigente é a **decisão**: a cena 2 continua sendo a base da atividade **`light`**, com papel **REUTILIZAR COMO ATIVA**. O conteúdo visual atual é o aprovado pelo fundador em 2026-07-22 e **não foi reinspecionado** por esta spec (§3-bis, pendência operacional).

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
| **`light`** | **REUTILIZAR `scene_02.png`** | aprovação do fundador em 2026-07-22 (§3-bis/§16); antes: inspeção full-res de §3 | luz da cena 2, áreas grandes, fiel à cena 2 |
| **`living_world`** | **NOVA ARTE NECESSÁRIA** | E1 | nenhuma página entrega terra+plantas+animais equilibrados |
| **`people_and_care`** | **NOVA ARTE NECESSÁRIA** | E3 + §4 | 08/09 têm vestes de folhas (pós-queda) — cronologicamente incorretas |

**Resultado:** 1 reutilizada · 2 novas · 10 legados de A Criação preservados nos mesmos paths. *(A contagem original "0 sobrescritas" foi reancorada em 2026-07-22: `creation/scene_02.png` teve o conteúdo substituído por decisão explícita do fundador — §10/§16.)*

**Diversidade (E4 planejada):** as duas novas artes são planejadas **em conjunto**: `living_world` = abundância da natureza **sem pessoas**; `people_and_care` = pessoas + gesto de cuidado; **sem repetir os mesmos animais principais**. Conjunto final: **(1) luz e céu · (2) flora e fauna · (3) pessoas e cuidado** — três composições distintas.

---

## 10. Preservação do legado (explícito)

### 10.1 REGRA GERAL (vigente, não enfraquecida)

Assets legados **não podem ser sobrescritos silenciosamente** — nem por automação, nem por conveniência técnica, nem por remapeamento não autorizado. Toda substituição de um lineart legado exige **decisão explícita e rastreável do fundador**. Além disso:

1. Os dez `scene_NN.png` de A Criação **continuam existindo nos mesmos paths**; nenhum foi removido.
2. **Nenhum** foi movido, renomeado ou copiado.
3. **Nenhum** foi removido do bundle/pack.
4. As novas artes vão a **paths novos por atividade**.
5. Obras antigas seguem no **leitor legado por `storyId + sceneId`** (015 D1).
6. Esta curadoria **não autoriza limpeza de assets** (015 §6/D1).

### 10.2 EXCEÇÃO RATIFICADA — `creation/coloring/scene_02.png` (2026-07-22)

`assets/stories/creation/coloring/scene_02.png` foi **intencionalmente substituída por decisão explícita do fundador**, porque o asset anterior continha erros. A exceção:

1. aplica-se **exclusivamente** a `creation/coloring/scene_02.png`;
2. **não** autoriza substituição automática de nenhum outro asset;
3. **não cria precedente geral** — a regra de §10.1 permanece integralmente em vigor;
4. está registrada pelo commit **`cc63e19`**;
5. **mantém o mesmo path** porque o arquivo é consumido **tanto** pelo Colorir legado **quanto** pela atividade `light` do Colorir 60 — um path novo duplicaria o asset e quebraria a fonte única;
6. **não cria** `activities/light.png`.

### 10.3 Estado factual da baseline após a exceção

1. **Nove** dos dez PNGs legados de A Criação permanecem **byte-idênticos** à baseline anterior.
2. `creation/coloring/scene_02.png` é a **única exceção**.
3. A substituição foi **autorizada e aprovada pelo fundador**.
4. O novo contrato de `scene_02` é `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1`.
5. **Nenhuma outra cena** foi sobrescrita.
6. A invariante de preservação **continua válida** para as outras nove cenas de A Criação e para os demais linearts legados.
7. A baseline de inventário deve reconhecer **a nova `scene_02` como estado canônico atual**.

**Formulação canônica para o inventário dos 200 linearts legados de colorir** (20 histórias × 10 cenas): **199 permanecem conforme a baseline anterior, enquanto `creation/coloring/scene_02.png` constitui uma substituição autorizada e passa a integrar a nova baseline canônica.** *(Conferido em 2026-07-22: 200 páginas no inventário; desde o commit documental base `42a6991`, o único commit que alterou qualquer `assets/stories/*/coloring/*.png` foi `cc63e19`, exclusivamente em `creation/scene_02.png`.)*

---

## 11. Contrato entregue à implementação (catálogo)

| storyId | activityId | order | Título | Instrução | Asset | Path legado | Path futuro | Disponibilidade |
|---|---|---|---|---|---|---|---|---|
| creation | `light` | 1 | "Haja luz" | "Pinte a luz rompendo a escuridão." | **legado reutilizado** | `…/coloring/scene_02.png` | **— (reuso direto; sem path novo — ver nota)** | **PRONTA PARA REUTILIZAÇÃO** |
| creation | `living_world` | 2 | "O mundo cheio de vida" | "Pinte a terra, as plantas e os animais." | **nova arte** | — | `…/coloring/activities/living_world.png` | **REQUER NOVA ARTE** |
| creation | `people_and_care` | 3 | "Na criação de Deus" | "Pinte as pessoas cuidando da criação." | **nova arte** | — | `…/coloring/activities/people_and_care.png` | **REQUER NOVA ARTE** |

> Identidade = par `(storyId, activityId)` **sem `#`** (014/015). A curadoria não escolhe funções/schemas/código.

> **Nota de reancoragem — `activities/light.png` (2026-07-22).** A menção original a um "path futuro" `…/coloring/activities/light.png` para a atividade `light` era **intenção antiga, hoje superada e não materializável**. **Contrato vigente e inequívoco:** `light` **reutiliza diretamente** `assets/stories/creation/coloring/scene_02.png` por `require()` literal; **nenhum** `activities/light.png` deve ser criado — sua existência é **falha dura** no gate `scripts/verify-coloring60-assets.js` (`forbiddenPath`). As linhas de **`living_world`** e **`people_and_care`** desta tabela permanecem **inalteradas**: seus paths em `…/coloring/activities/` seguem sendo os destinos canônicos das duas novas artes.

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
| **E2** `light` | **Reutilizar `scene_02`** (decisão mantida) | luz da cena 2, áreas grandes, fiel à cena 2 | 1 página pronta | §3-bis/§16 (base original: inspeção §3, superada em 2026-07-22) | impl |
| **E3** `people_and_care` | **Nova arte** (não usar `scene_08`/`scene_09`) | vestes de folhas = pós-queda (cronologia) | produção de 1 arte nova | §4 + brief §12 | produção/impl |
| **E4** diversidade | Planejar as 2 novas artes **em conjunto**; sem repetir animais; 3 composições distintas | evitar conjunto repetitivo/flora incompleta | briefs coordenados | E1+E3 | produção/impl |
| **E5** lua com rosto | `scene_05` **fora do ativo**; preservada como legado | lua antropomorfizada não usada no piloto | nenhuma ação de asset | — | — |
| **QA-BIBLIA** correção | 08/09 **não ativas** (folhas pós-queda); preservadas legado; `people_and_care` = nova arte | fidelidade cronológica > modéstia por elemento incorreto | reforça E3 | §4 | produção/impl |

**Pendência registrada em 2026-07-21 (histórico):** **nenhuma.** A inspeção full-res do asset `35d6f50c…` não encontrou defeito impeditivo naquela data.

**Reancoragem de 2026-07-22 (§3-bis/§16):** o fundador **revisou** esse julgamento e considerou o asset anterior **incorreto**, aprovando uma nova composição, integrada no mesmo path (`cc63e19`). A decisão **E2 — reutilizar `scene_02` para `light`** permanece; o que mudou foi o **conteúdo** do arquivo. Passa a existir **uma pendência operacional** (validação em dispositivo e comportamento de flood-fill — §3-bis), que **não** reabre estética nem teologia. Nada foi resolvido silenciosamente.

---

## 14. Fora de escopo

❌ código · ❌ assets novos · ❌ edição/cópia/movimentação/sobrescrita de imagens · ❌ storage · ❌ entitlement · ❌ packs · ❌ manifestos · ❌ migração · ❌ geração de imagens · ❌ **prompts finais de geração** · ❌ geração de prompts de todas as histórias · ❌ **Noé** · ❌ outras 19 histórias · ❌ implementação do catálogo · ❌ build · ❌ commit · ❌ push · ❌ merge.

---

## 15. Critérios de aceite

(1) 10 páginas inspecionadas visualmente; (2) 10 ilustrações de referência; (3) **inspeção full-res de `scene_02`** (§3); (4) **correção bíblica de `scene_08`/`scene_09`** (§4); (5) `light` **reutilizada**; (6) `living_world` **nova arte**; (7) `people_and_care` **nova arte**; (8) **uma** reutilizada; (9) **duas** novas; (10) diversidade **planejada** (§9); (11) matriz das 10 atualizada (§5); (12) classificação de legado **corrigida** (preservação-de-todos × principal-SOMENTE-LEGADO só 08/09); (13) **E1–E5 ratificados** (§13); (14) paths futuros registrados (§11); (15) **zero asset alterado**; (16) **zero código alterado**; (17) **todos os linearts preservados** (§10); (18) **nenhuma decisão aberta não registrada** (§13 — nenhuma nova).

> **Alcance temporal (reancoragem 2026-07-22).** Os critérios (15) "zero asset alterado" e (17) "todos os linearts preservados" descrevem o que o **bloco de curadoria 01E entregou em 2026-07-21** — bloco read-only que, de fato, não alterou nenhum arquivo. Eles **não** são invariantes perpétuas: a substituição autorizada de `creation/scene_02.png` ocorreu **depois**, em bloco próprio (`cc63e19`), sob a exceção ratificada de §10.2. O aceite de 01E **não é reaberto**.

---

## 16. Reancoragem de `creation/scene_02.png` (2026-07-22)

Registro consolidado da substituição autorizada. **Não reabre** nenhuma decisão de curadoria (E1–E5, §4, §9, §12), que permanecem válidas.

### 16.1 Contrato vigente

| Atributo | Valor canônico |
|---|---|
| Path runtime | `assets/stories/creation/coloring/scene_02.png` |
| SHA-256 | `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1` |
| Prefixo documental (12) | `c960f1bb1c34` |
| Tamanho | 861767 bytes |
| Dimensões | 1122 × 1402 (4:5) |
| Bit depth · Color type · Modo | 8 · 2 · RGB |
| Transparência | nenhuma |
| Commit | `cc63e19` |
| Aprovação | fundador, 2026-07-22 — visual, teológica e lógica; **final** |

### 16.2 Baseline canônica para P5.T7

1. **P5.T7 deve usar `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1` como baseline canônica** de `creation/coloring/scene_02.png`.
2. O hash anterior `35d6f50c72e978e44a9d2727a970a4ace3635ef3184a36729a5e4a13faffaddb` é **somente histórico**.
3. Divergência de `scene_02` **contra o hash antigo não é regressão** — é o resultado esperado da substituição autorizada.
4. Qualquer **nova** divergência contra `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1` **é falha** e deve parar o bloco.
5. Os **demais assets** continuam sujeitos às suas baselines vigentes, sem alteração.
6. `living_world` e `people_and_care` **ainda não foram integrados** — seus destinos em `…/coloring/activities/` permanecem **ausentes**, e o gate `--mode=post` corretamente sinaliza vermelho por essa causa.
7. **P5.T4, P5.T6 e P5.T7 continuam NÃO EXECUTADOS** neste bloco.

### 16.3 Consistência com `activities/light.png`

`light` **reutiliza diretamente** `scene_02.png`; **nenhum** `activities/light.png` deve ser criado (§11). Menções anteriores a esse "path futuro" são **intenção antiga superada**, não materializável. O gate `scripts/verify-coloring60-assets.js` trata sua presença como **falha dura** (`forbiddenPath`).

### 16.4 Escopo deste registro

Bloco **documental**: altera **apenas esta spec**. Não toca PNG, catálogo, verificador, smoke, plan, tasks, spec 017, runtime, flags, packs ou dependências. A feature flag `COLORIR_60_CREATION_PILOT_ENABLED` permanece **`false`**.

---

## Artefatos de evidência (externos, fora do Git)

Pasta `C:\tmp\ptf_product_lock_01e_evidence\`:
- `coloring/scene_01…10.png` — previews 768px das 10 páginas de colorir.
- `scenes/creation_scene_01…10.png` — previews 640px das 10 ilustrações narrativas.
- `scene02_crops/` — **crops 1:1** de `scene_02` (center_rays, cloud_left, cloud_right, waves_bottom, corner_TL/TR/BL/BR) para inspeção full-resolution.

**Não entram no Git · não substituem assets · evidência visual apenas.** A geração dessas evidências foi **read-only**: nenhum asset foi tocado **durante a curadoria 01E (2026-07-21)**. Os crops de `scene02_crops/` correspondem ao asset **anterior** (`35d6f50c…`) e são material **histórico** (§3/§16).
