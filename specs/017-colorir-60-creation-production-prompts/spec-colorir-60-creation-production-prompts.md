# Spec — Colorir 60: Pacote de Produção de A Criação (Prompts `living_world` e `people_and_care`)

> **Feature:** `017-colorir-60-creation-production-prompts` · **Bloco:** PTF PRODUCT LOCK 01F (+ QA/ratificação 01F-QA) · **Etapa SDD:** 1 (Specify) · **Portão 1: decisões D1–D5 ratificadas pelo fundador em 2026-07-21.**
> **Data:** 2026-07-21 · **Base (commit documental):** `78c3c71b3ad71f82b4b83da2709cd24adb972f91` (01E) · cadeia `3cd7e3f`→`00d1a52`→`dab57ed`→`42a6991`→`78c3c71` · **Worktree:** `docs/product-lock-01f-creation-production-prompts`.
> **Identificador ratificado:** `017`.
> **Natureza:** documento de produção, **read-only sobre código/assets**. **Nenhuma** geração de imagem, alteração/cópia/movimentação/sobrescrita de asset, código, storage, entitlement, pack, manifesto, build, commit, push ou merge. **Não** cria prompts para outras histórias.
>
> **Precedência:** SoT → constituição → `AGENTS.md`/`CLAUDE.md`; decisões por `docs/DECISIONS.md` (PL01A). Respeita 013/014/015/016. **Não reabre decisão de 01A–01E.**
>
> **Escopo:** pacote final de produção das **duas novas páginas** do piloto Colorir 60 de A Criação — **`living_world`** e **`people_and_care`** (016: `light`=reutilizar `scene_02`; estas duas = nova arte). Prompts **específicos o suficiente para evitar decisões criativas importantes** na geração.

---

## 1. Fontes lidas e método

Autoridades: SoT · `DECISIONS.md` · specs `013`/`014`/`015`/`016` · roteiro oficial de A Criação (`stories.js`, gabarito `textoNarracao`). **As nove referências foram reinspecionadas em pixels no contexto deste bloco 01F** (previews em `C:\tmp\ptf_product_lock_01f_evidence\`): as 4 páginas de colorir `scene_02/04/07/10` no turno de escrita do 01F; `scene_06` e as ilustrações narrativas `creation_scene_04/06/07/08` no turno **01F-QA**. As ilustrações narrativas são **referência de conteúdo** (pintura), **não** convertidas em lineart.

---

## 2. Matriz das nove referências (inspeção em pixels — 01F)

| Ref | Path | Dim | Papel | Espessura de linha | Detalhe | Áreas coloríveis | Tratamento | Repetir (conceito) | NÃO repetir | Inspec. 01F |
|---|---|---|---|---|---|---|---|---|---|---|
| scene_02 | `coloring/scene_02.png` | 1122×1402 | contrato lineart (`light`) | **outline grosso** + raios finos | baixo | grandes (nuvens, cunhas, água) | nuvens em lobos; **tem moldura** | outline grosso, moldura, áreas grandes | raios excessivos | ✔ (spec) |
| scene_04 | `scene_04.png` | 1122×1402 | contrato flora | grosso + finos internos | moderado | grandes (copa, flores, água) | árvores em lobos; flores de pétalas grandes; **full-bleed** | flores grandes, árvore, colinas | rio dominante | ✔ (spec) |
| scene_06 | `scene_06.png` | 1122×1402 | contrato fauna (aves/peixes) | grosso + penas/barbatanas finas | moderado | grandes (corpos) | **aves fofas, olho-ponto, outline grosso** | **estilo de ave** p/ `living_world` | peixes/aquático (não usar) | ✔ (QA) |
| scene_07 | `scene_07.png` | 1122×1402 | contrato fauna terrestre | grosso + finos | moderado | grandes (corpos, copa) | animais fofos; **tem moldura** | **girafa/elefante/coelho**, moldura, áreas grandes | leão/ovelha; 5+ animais | ✔ (spec) |
| scene_10 | `scene_10.png` | 1024×1280 | contrato paisagem | grosso + finos (rio/raios) | moderado | grandes (árvore, colinas) | árvore, coelho/ovelha/ave; **full-bleed** | árvore, colinas, ave | ovelha dormindo (tema descanso) | ✔ (spec) |
| creation_scene_04 | `scenes/…04.png` | 1122×1402 | conteúdo flora | n/a (pintura) | alto | n/a | painterly; árvore/flores/rio/colinas | conceito: árvore, flores, colinas | render painterly; água dominante | ✔ (QA) |
| creation_scene_06 | `…06.png` | 1122×1402 | conteúdo aves/peixes | n/a | alto | n/a | painterly; aves+peixes | conceito: aves | aquático dominante; render | ✔ (QA) |
| creation_scene_07 | `…07.png` | 1122×1402 | conteúdo animais terrestres | n/a | alto | n/a | painterly; leão/elefante/girafa/cervo/coelho/ave | conceito: **girafa/elefante/coelho/ave** | leão/cervo (limitar a 4); render | ✔ (QA) |
| creation_scene_08 | `…08.png` | 1122×1402 | conteúdo pessoas+cuidado | n/a | alto | n/a | painterly; casal (**com folhas/peito nu**); jardim; animais | conceito: casal, jardim, cuidado, 1 animal | **vestes de folhas / peito nu**; cronologia pós-queda; render | ✔ (QA) |

> **Confirmação:** a arte narrativa oficial `creation_scene_08` **usa vestes de folhas** — o que **reforça** (não contradiz) a correção bíblica do 016: no **colorir** `people_and_care`, a modéstia vem de **pose/enquadramento/vegetação de paisagem**, **nunca** de folhas. **Nenhuma nova contradição visual/bíblica** encontrada.

---

## 3. Contrato de lineart derivado

**Outline principal GROSSO e uniforme** + **linhas internas MÉDIAS/FINAS** (hierarquia clara, ex.: `scene_07`/`scene_06`); regiões **grandes e fechadas**; animais **fofos, arredondados**, olho-ponto; plantas em **lobos** + tronco; flores de **pétalas grandes**; densidade **6–8** adequada. **Moldura:** o conjunto aprovado é misto (`scene_02`/`scene_07` emolduradas; `scene_04`/`scene_10` full-bleed) — a decisão foi **ratificada em D3 (moldura obrigatória, fina)**.

---

## 4. Contrato visual comum (com D3 e D4)

1. Vertical **4:5**. 2. **1122×1402**. 3. Fundo **branco puro**. 4. Lineart **preto**. 5–10. Sem cor/cinza/sombra/hachura/degradê/preto extenso. 11. Linhas principais nítidas. 12. **Contornos fechados** (flood-fill). 13. Áreas **grandes/médias**. 14. Poucos detalhes pequenos. 15. **6–8**. 16. Amigável. 17. Anatomia correta. 18. Mãos/patas/asas/rostos sem deformação. 19–25. **Sem** texto/letras/números/marca/assinatura/logo/símbolos. 26. **Nada cortado pelas bordas.** 27. Sem flutuantes. 28. Sem duplicações. 29. Sem bebê. 30. Sem realismo. 31. Sem anime. 32. Sem sombrio/assustador. 33. Coerência com `scene_02`/`scene_07`.
- **D3 — MOLDURA (obrigatória):** as duas páginas têm **moldura externa preta fina, simples e contínua**, coerente com `scene_02`, **não decorativa**, com **margem de segurança**; **nenhum personagem/animal/planta/árvore encosta na moldura**; **moldura equivalente nas duas páginas**.
- **D4 — HIERARQUIA DE LINHAS:** contornos externos principais **mais grossos**; detalhes internos **médios/finos**; hierarquia consistente; **nenhuma linha fina demais** para tela; **nenhuma linha grossa demais** que destrua áreas coloríveis; contornos importantes **contínuos e fechados**; espessura **proporcional à resolução** (sem valor fixo prematuro em px); **validação obrigatória em resolução completa**.

---

## 5. Prompt final — `living_world` (D1 + D3 + D4)

**Path futuro:** `assets/stories/creation/coloring/activities/living_world.png` (novo asset; **nunca** sobrescrever `scene_NN`).

```text
Children's coloring-book LINE ART, black outlines on a PURE WHITE background, vertical 4:5 portrait, target 1122x1402 px.
ASSET: creation / living_world. AUDIENCE: children 6-8.
STYLE: friendly rounded cartoon; consistent with the approved "A Criacao" coloring style (scene_02 / scene_07). LINE HIERARCHY: thicker main outer contours, medium/thin internal detail lines; every important contour CONTINUOUS and CLOSED; no line too thin to read on screen, no line so thick it destroys colorable areas. NO color, NO grayscale, NO shading, NO hatching, NO gradients, NO large solid black fills.
SCENE: the created world FULL OF LIFE, an open cheerful nature scene celebrating the abundance of plants and animals. NO people.
ANIMALS: EXACTLY FOUR main animals, naturally INTEGRATED into the environment (NOT lined up like a catalog): a GIRAFFE and a YOUNG ELEPHANT as the LARGER animals; a RABBIT in a wide, recognizable LOWER region; and one SMALL BIRD clearly visible (flying), simple and NOT hidden. All cute, rounded, smiling, CORRECT anatomy, no duplicated or fused limbs. Do NOT add any other animals in the background.
FORBIDDEN ANIMALS/PEOPLE: no lamb (the lamb belongs to the people_and_care page), no people, no man, no woman, no lion, no deer, and never more than these four animals.
COMPOSITION: open, balanced, uncluttered CENTER. FOREGROUND (bottom): large colorable flowers and leafy plants, and the rabbit. MIDGROUND: giraffe and young elephant on grass, well spaced. LEFT SIDE: one healthy tree with a rounded lobed crown and simple trunk. BACKGROUND: gentle simple hills and a couple of small bushes; a simple sky with one or two plain clouds; the bird flying.
BIBLICAL RULE: a thematic synthesis of the days of land, plants, birds and land animals; NOT an extra narrative scene; does NOT change the order of events; NO people because the focus is the non-human abundance of creation.
FRAME: a THIN, simple, continuous black rectangular BORDER around the page (matching scene_02), with a safety margin; NOTHING (no animal, plant, tree) touches the border; the border must be EQUIVALENT to the people_and_care page.
STRICTLY AVOID (do NOT draw any of these): people, snake/serpent, ark, rainbow, dinosaurs, aggressive animals, predation, fighting, duplicated anatomy, half-hidden confusing animals, a mostly-underwater scene, lots of fish, ANY text/letters/numbers/watermark/signature/logo, a composition similar to the people_and_care page, tiny details too small to color, an over-detailed background, floating disconnected objects, a baby-book look, realism, anime, any dark/scary mood, and any element cut off by the page edges or touching the border.
RESULT: a clean, joyful, easy-to-color 4:5 black-and-white line-art coloring page of the living world — giraffe, young elephant, rabbit and a small flying bird, a tree, big flowers and simple hills, inside a thin black frame — clearly DISTINCT from the people_and_care page.
```

---

## 6. Prompt final — `people_and_care` (D2 + D3 + D4 + D5)

**Path futuro:** `assets/stories/creation/coloring/activities/people_and_care.png` (novo asset).

```text
Children's coloring-book LINE ART, black outlines on a PURE WHITE background, vertical 4:5 portrait, target 1122x1402 px.
ASSET: creation / people_and_care. AUDIENCE: children 6-8.
STYLE: friendly rounded cartoon; consistent with the approved "A Criacao" coloring style (scene_02). LINE HIERARCHY: thicker main outer contours, medium/thin internal detail; every important contour CONTINUOUS and CLOSED; no line too thin for screen, none so thick it destroys colorable areas. NO color, NO grayscale, NO shading, NO hatching, NO gradients, NO large solid black fills.
SCENE: the FIRST MAN and the FIRST WOMAN created by God, BEFORE THE FALL, in a simple garden, in a gentle gesture of caring for creation. Serene, dignified, welcoming.
FRAMING (fixed): MEDIUM three-quarter view. The MAN on the LEFT, slightly leaning or kneeling next to a YOUNG PLANT, tending/supporting the plant WITH HIS HANDS (NO watering can, NO tool, NO extra object). The WOMAN on the RIGHT, in three-quarter view, gently petting the HEAD or BACK of a small LAMB (she does NOT hold the lamb in her lap). Faces visible, serene and welcoming; both hand gestures clearly visible and immediately understandable; no exaggerated sentimental pose.
ANIMAL: exactly ONE main animal, a LAMB. Do NOT include a giraffe, an elephant or a rabbit (those belong to the living_world page); no other animals.
MODESTY (mandatory): fully child-appropriate bodies; do NOT draw or show intimate anatomy, breasts, buttocks or genital area. Achieve modesty ONLY through POSE, ANGLE, HAIR, ARMS, and NATURAL FOREGROUND GARDEN VEGETATION that is part of the landscape. The vegetation must NOT wrap the body and must NOT look like clothing. NO leaves as clothing, NO leaf skirts/belts/coverings, NO post-fall clothing. No shame, no hiding. No romantic, sensual or embracing couple pose.
COMPOSITION: intimate and CENTERED on the two people, more intimate and centered than the living_world page. FOREGROUND: the young plant (man) and the lamb (woman), plus a few garden plants. BACKGROUND: a simple garden with a young tree, gentle hills, simple sky.
BIBLICAL RULE: the dignity of the human being created by God and the responsibility to care for creation, BEFORE the fall; do NOT import any Genesis-3 iconography.
FRAME: a THIN, simple, continuous black rectangular BORDER (matching scene_02 and equivalent to the living_world page), with a safety margin; NOTHING touches the border.
STRICTLY AVOID: leaf clothing, post-fall clothing, serpent, identifiable tree of knowledge, highlighted forbidden fruit, temptation, shame, hiding from God, explicit anatomy, sexualization, romantic/sensual/embracing pose, kiss, children, angels, ANY text/watermark, many animals, a composition similar to living_world, plants covering the whole scene, vegetation acting as a skirt/clothing, and any element cut off by the edges or touching the border.
RESULT: a clean, dignified, easy-to-color 4:5 line-art coloring page — man on the left tending a young plant, woman on the right petting a lamb, modest by pose/framing/foreground vegetation, before the fall, inside a thin black frame — clearly DISTINCT from the living_world page.
```

---

## 7. Estrutura de cada prompt (checagem §11)

Ambos contêm, no bloco único: nome do asset · path · formato · dimensão · estilo · público · conteúdo principal · personagens/animais · composição · primeiro plano · plano intermediário · fundo · lineart · regiões coloríveis · anatomia · regras bíblicas · **elementos proibidos incorporados ao texto** · regras de borda/corte · consistência · resultado esperado. **Nenhuma proibição essencial depende de lista à parte.**

---

## 8. Separação visual entre as páginas (comprovada)

| Eixo | `living_world` | `people_and_care` |
|---|---|---|
| Pessoas | nenhuma | **dois (foco)** |
| Animais | **4** (girafa, elefante jovem, coelho, ave) | **1** (cordeiro) |
| Densidade | vários seres, **aberta** | poucos elementos, **íntima/centrada** |
| Enquadramento | panorâmico | três quartos, homem esq. / mulher dir. |
| Distribuição | árvore lateral + animais espalhados + flores base | casal central + cordeiro + planta jovem |
| Moldura | fina equivalente | fina equivalente |

**Sem repetir animais principais** (girafa/elefante/coelho ≠ cordeiro). **Enquadramento e distribuição distintos.**

---

## 9. Checklist binário de QA (por imagem gerada)

Base: 1. Path correto. 2. 4:5. 3. Resolução (~1122×1402). 4. Fundo branco. 5. Lineart preto. 6. Sem cor/cinza/sombra. 7. Linhas contínuas. 8. Regiões fechadas. 9. Áreas grandes. 10. Sem texto/marca. 11. Sem cortes. 12. Anatomia correta. 13. Coerência bíblica (antes da queda; sem folhas/serpente/Gn3). 14. Adequação 6–8. 15. Conceito reconhecível. 16. Distinção da outra página. 17. Sem defeito impeditivo. 18. **Inspeção full-resolution.** 19. Aprovação do fundador.
Gates específicos (D1–D5): 20. **Exatamente 4 animais em `living_world`.** 21. **Exatamente 1 cordeiro em `people_and_care`.** 22. **Nenhum cordeiro em `living_world`.** 23. **Nenhuma girafa/elefante/coelho em `people_and_care`.** 24. **Moldura fina equivalente nas duas.** 25. **Homem à esquerda.** 26. **Mulher à direita.** 27. **Gestos corretos** (homem→planta, mulher→acaricia cordeiro). 28. **Vegetação não parecendo roupa.** 29. **Hierarquia de linhas aprovada em full resolution (D4).** 30. **Nada encosta na moldura.**
**Falha em qualquer gate eliminatório → regeneração.**

---

## 10. Critérios de regeneração obrigatória

Regenerar quando houver: (1) anatomia incorreta; (2) dedo/mão/pata/asa duplicada; (3) linhas abertas relevantes; (4) elemento cortado ou encostando na moldura; (5) texto/marca; (6) sombra/cor; (7) excesso de detalhes; (8) elementos pequenos demais; (9) composição cheia; (10) contradição bíblica; (11) vestes de folhas; (12) vegetação parecendo roupa; (13) anatomia explícita; (14) **animais repetidos entre as páginas**; (15) conceito irreconhecível; (16) estilo ≠ `scene_02`; (17) fundo/proporção incorretos; (18) **nº de animais errado** (living_world≠4 / people_and_care≠1); (19) **homem/mulher trocados de lado**; (20) **moldura ausente/desigual**; (21) **hierarquia de linhas reprovada**. Não aceitar imagem bonita com defeito eliminatório.

---

## 11. Protocolo de geração futura (sem executar)

1. Gerar **`living_world` primeiro**. 2. Inspecionar em **resolução completa**. 3. Aprovar ou regenerar. 4. Gerar **`people_and_care` só depois**. 5. Comparar as duas **lado a lado**. 6. Validar **molduras equivalentes**. 7. Validar **hierarquia de linhas**. 8. Validar **ausência de animais repetidos**. 9. Salvar **somente no path novo** (`activities/<activityId>.png`). 10. **Nunca sobrescrever** assets legados. 11. Registrar **dimensão e hash**. 12. **Não integrar antes dos gates do 015** (entitlement na escrita + dependência do lineart).

---

## 12. Decisões ratificadas pelo fundador (2026-07-21)

> **D1–D5 DECIDIDOS** — deixam de ser questões abertas.

| ID | Decisão | Motivo | Impacto | Dependência | Bloco futuro |
|---|---|---|---|---|---|
| **D1** animais `living_world` | **Exatamente 4:** girafa, elefante jovem, coelho, ave pequena; sem cordeiro/pessoas; integrados (não catálogo); girafa/elefante maiores; coelho em região inferior ampla; ave visível não escondida; sem animais no fundo | conceito reconhecível e distinto de `people_and_care` | prompt `living_world` | ref. §2 | produção |
| **D2** gestos de cuidado | homem apoia/cuida de **planta jovem** com as mãos (sem regador/ferramenta salvo aprovação); mulher acaricia **cabeça/dorso do cordeiro** (não no colo); gestos imediatos; sem pieguice | clareza do conceito de cuidado | prompt `people_and_care` | — | produção |
| **D3** moldura | **moldura preta fina, simples, contínua, com margem; nada encosta; equivalente nas duas** | coerência com `scene_02` e trio | contrato + 2 prompts | §2 (misto→padroniza) | produção |
| **D4** espessura | **outline principal grosso + detalhes médios/finos**; hierarquia consistente; sem fina/grossa demais; contínuos/fechados; proporcional à resolução; **validação full-res** | facilidade de colorir + legibilidade | contrato + prompts + QA | inspeção full-res | produção |
| **D5** enquadramento `people_and_care` | **três quartos médio; homem à esquerda (inclinado/ajoelhado junto à planta); mulher à direita (acaricia cordeiro)**; rostos serenos; mãos visíveis; **modéstia por pose/ângulo/cabelos/braços/vegetação (não vestida)**; sem anatomia íntima; sem vergonha/pose romântica; mais íntima que `living_world` | modéstia + legibilidade + distinção | prompt `people_and_care` | §016 (correção bíblica) | produção |

**Nova contradição visual/bíblica na reinspeção:** **nenhuma.** (A arte narrativa `creation_scene_08` usa folhas, mas isso **reforça** a correção do 016 para o colorir; nada foi resolvido silenciosamente.)

---

## 13. Fora de escopo

❌ geração de imagens · ❌ alteração de assets · ❌ código · ❌ storage · ❌ entitlement · ❌ packs · ❌ manifestos · ❌ implementação do catálogo · ❌ teste de flood-fill real · ❌ build · ❌ Noé · ❌ outras histórias · ❌ commit · ❌ push · ❌ merge.

---

## 14. Critérios de aceite

(1) **9 referências reinspecionadas neste ciclo 01F**; (2) **matriz de evidência das 9** (§2); (3) dois prompts finais completos (§5/§6); (4) **D1–D5 ratificados** (§12); (5) **4 animais exatos** em `living_world` (§5); (6) **gestos exatos** em `people_and_care` (§6); (7) **moldura obrigatória** nas duas (§4/§5/§6); (8) **hierarquia de linhas** fechada (§4); (9) **enquadramento de `people_and_care`** fechado (§6/D5); (10) **correção bíblica preservada** (antes da queda); (11) **modéstia sem folhas/roupas pós-queda** (§6); (12) proibições **incorporadas** (§5/§6); (13) checklist atualizado (§9); (14) critérios de regeneração atualizados (§10); (15) protocolo futuro (§11); (16) **nenhuma decisão aberta não registrada** (§12); (17) **zero asset alterado**; (18) **zero código alterado**; (19) **nenhuma imagem gerada**.

---

## Artefatos de evidência (externos, fora do Git)

`C:\tmp\ptf_product_lock_01f_evidence\` — `coloring/scene_02/04/06/07/10.png` (previews 760px) e `scenes/creation_scene_04/06/07/08.png` (previews 640px), usados na reinspeção das nove referências. **Não entram no Git · não substituem assets · evidência visual apenas.** Assets originais intocados.

---

## 15. Resultado final da produção artística do piloto A Criação (fechamento PL01G · 2026-07-22)

> **Seção aditiva de fechamento.** Registra o **resultado** da produção definida pelo contrato acima (§§1–14). **Não** reescreve prompts, decisões (D1–D5) ou critérios já ratificados. As aprovações visuais do fundador são **finais** e não se reabrem.

### Estado geral

A produção artística do piloto **A Criação** está **CONCLUÍDA**. As **três páginas** do trio (`light`, `living_world`, `people_and_care`) têm **identidade técnica final** registrada abaixo. Os PNGs definitivos de `living_world` e `people_and_care` vivem **fora do Git** (pasta externa de produção); `light` é **reutilização por referência** do lineart legado `scene_02.png` (nada gerado, nada copiado). A **integração** ao app depende de **plan + tasks** próprios do Colorir 60 (arquitetura "Opção C", specs 014/015); a **expansão** para Noé e demais histórias depende da **validação do piloto em dispositivo**.

### Página 1 — `light` (reutilização por referência)

| Campo | Valor |
|---|---|
| Origem | **Legado reutilizado** — `scene_02.png` (não gerado, não copiado, não movido) |
| Arquivo | `assets/stories/creation/coloring/scene_02.png` (working dir principal, untracked) |
| Formato | PNG |
| Dimensões | 1122×1402 |
| Proporção | 4:5 (0.800285) |
| Modo | RGBA |
| SHA-256 | `35d6f50c72e978e44a9d2727a970a4ace3635ef3184a36729a5e4a13faffaddb` (também registrado na spec 016 §2) |
| Path futuro no catálogo | `assets/stories/creation/coloring/activities/light.png` (referência; **não** copiar/mover neste bloco) |
| Aprovação | Inspeção full-res aprovada pelo fundador (016 §3/§13-E2) |

### Página 2 — `living_world` (nova arte aprovada e normalizada)

| Campo | Valor |
|---|---|
| Arquivo aprovado (externo) | `C:\tmp\ptf_colorir60_creation_production\living_world_approved.png` |
| Formato | PNG (magic `89 50 4e 47`) |
| Dimensões | 1122×1402 |
| Proporção | 4:5 (0.800285) |
| Modo | RGB 8-bit, sem alpha |
| Tamanho | 973 618 bytes |
| SHA-256 (aprovado) | `818cd917c7493f4a3e04512a7120a6eaff5a03fdd16277b7d4fdfd1ee33b6ac5` |
| Fonte preservada | `C:\tmp\ptf_colorir60_creation_production\living_world_source_original.jpg` |
| SHA-256 (fonte) | `76a521b6678ab8d8b72e8660335200c8810edadc92a45ae9ad48584a98e72657` |
| Fidelidade | Pixel maxdiff = **0** vs. fonte decodificada (normalização técnica sem alteração de aparência) |
| Path futuro no catálogo | `assets/stories/creation/coloring/activities/living_world.png` |
| Conformidade | D1 (4 animais), D3 (moldura), D4 (hierarquia de linhas) — aprovado pelo fundador |

### Página 3 — `people_and_care` (nova arte aprovada e normalizada)

| Campo | Valor |
|---|---|
| Arquivo aprovado (externo) | `C:\tmp\ptf_colorir60_creation_production\people_and_care_approved.png` |
| Formato | PNG (magic `89 50 4e 47`) |
| Dimensões | 1122×1402 |
| Proporção | 4:5 (0.800285) |
| Modo | RGB 8-bit, sem alpha |
| Tamanho | 1 195 149 bytes |
| SHA-256 (aprovado) | `59988d9a58082a8173a328857fccb6a3716815660f4434c0df4491d6bf30d4e9` |
| Fonte preservada | `C:\tmp\ptf_colorir60_creation_production\people_and_care_source_original.jpg` |
| SHA-256 (fonte) | `a54617d386f0daa164ad99db7c44ca949c46d6444d551410016f116e4886839f` |
| Fidelidade | Pixel maxdiff = **0** vs. fonte decodificada (normalização técnica sem alteração de aparência) |
| Path futuro no catálogo | `assets/stories/creation/coloring/activities/people_and_care.png` |
| Composição real (aprovada) | **Mulher à esquerda** derramando água de um jarro sobre a **muda** (planta jovem, centro da cena); **homem à direita** cuidando da **terra** ao redor da muda com as mãos. Animais secundários: **ave** (pousada na árvore, topo-esq.), **cervo/corça** pequeno (dir., ao fundo), **coelho** (base-esq.). **Sem cordeiro.** |
| Conformidade | **D3 (moldura)** cumprida. **D2 e D5 NÃO correspondem** à imagem final aprovada (lados invertidos; sem cordeiro) — registrado como exceção visual final ratificada (ver abaixo). |

### Anomalia operacional registrada

O candidato entregue para `people_and_care` chegou nomeado como **`people_and_care_candidate_01.png.jpeg`**, mas seu **conteúdo real era JPEG** (magic `ff d8 ff e0` / JFIF; 233 032 bytes; SHA `a54617d386f0daa164ad99db7c44ca949c46d6444d551410016f116e4886839f`, idêntico à fonte preservada). **Esse arquivo não é canônico** (não é PNG e a extensão dupla contradiz o conteúdo). Tratamento aplicado, **sem alterar a aparência**: (1) o candidato foi **preservado** como `people_and_care_source_original.jpg` (bytes idênticos, mesmo SHA); (2) foi **re-encodado para PNG verdadeiro** (`people_and_care_approved.png`), com verificação de magic bytes, dimensões, proporção, modo e **pixel maxdiff = 0**. O candidato original **não** foi renomeado nem sobrescrito. Nenhuma decisão visual foi reaberta.

### Narrativa final do trio

As três páginas formam um conjunto **coeso e distinto**, na mesma família de estilo de `scene_02`, com **molduras equivalentes**:

1. **`light`** — a luz rompendo a escuridão (raios entre nuvens sobre a água): áreas grandes, esperança, fidelidade à cena 2.
2. **`living_world`** — o mundo vivo criado (exatamente **4 animais** integrados: girafa, elefante jovem, coelho, ave pequena) e a vida vegetal.
3. **`people_and_care`** — o cuidado humano em torno de uma **muda** (planta jovem, centro da cena): **mulher à esquerda** derramando água de um jarro sobre a muda; **homem à direita** cuidando da terra ao redor com as mãos. Cena serena, **antes da queda** (modéstia por pose/ângulo/vegetação, sem vestes de folhas). Animais secundários: **ave**, **cervo/corça** pequeno e **coelho**. **Não há cordeiro.**

**Correção factual (PL01G-FIX1 · 2026-07-22):** a redação anterior desta seção descrevia `people_and_care` como "homem à esquerda amparando a planta; mulher à direita acariciando o cordeiro" — isso corresponde ao **prompt original** (D2/D5), **não** à imagem final aprovada. A **composição real** acima **prevalece**.

**Espécies compartilhadas entre páginas:** `living_world` e `people_and_care` **compartilham ave e coelho**. Portanto a afirmação de "sem animais repetidos entre páginas" **não** se aplica à arte final; a distinção entre as páginas é por **cena/conceito** (animais selvagens em paisagem × casal cuidando de uma muda), **não** por conjuntos de animais mutuamente exclusivos.

### Exceção visual final ratificada pelo fundador (PL01G-FIX1)

A imagem final de `people_and_care` aprovada pelo fundador **difere** da composição prescrita no prompt original e nas decisões **D2** (mulher acaricia a cabeça/dorso do cordeiro; homem cuida da planta) e **D5** (homem à esquerda, ajoelhado junto à planta; mulher à direita, com o cordeiro). Na arte congelada, **os papéis/lados estão invertidos e não há cordeiro**: a **mulher rega a muda (à esquerda)** e o **homem cuida da terra (à direita)**, com ave, cervo/corça e coelho como animais secundários.

Conforme as regras deste bloco: (1) a **aprovação visual do fundador é final** e **prevalece** sobre as restrições composicionais anteriores do prompt para **este asset específico**; (2) essa diferença é registrada como **exceção visual final ratificada**, **não** como defeito; (3) **D1–D5 permanecem preservadas** como o **contrato de produção original** (§§4, 8, 10 e 12) — não são apagadas nem reescritas; (4) esta exceção vale **somente** para os PNGs congelados de A Criação e **não** vira regra para Noé ou futuras histórias, que seguem o contrato/prompt vigente até nova aprovação do fundador.

`living_world` **corresponde** ao contrato (D1: exatamente 4 animais — girafa, elefante, coelho, ave; D3: moldura), **sem exceção a registrar**.
