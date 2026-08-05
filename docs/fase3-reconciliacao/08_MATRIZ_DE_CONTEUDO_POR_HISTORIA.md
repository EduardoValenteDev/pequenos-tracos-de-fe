# 08 · Matriz de conteúdo por história

> **Artefato 8 de 11 — E015 · Fase 3G · Reconciliação**

| Campo | Valor |
|---|---|
| **Estado** | **PRELIMINAR PARA PRODUCT LOCK** |
| **Base auditada** | E009 a E014 |
| **Branch** | `integrate/colorir-canonical-runtime` |
| **HEAD** | `015c438106538595b592981fbe1b80b1d5d65e55` |
| **Data** | 5 de agosto de 2026 |

---

## 0 · Declaração de natureza

**Este artefato não implementa funcionalidade.**

As **vinte** histórias aparecem em **vinte linhas individuais**. As dezoito premium **não** são
condensadas numa classe única: cada uma tem trilha, ordem, mídia e estado próprios, e a
condensação esconderia justamente as divergências de ordenação editorial que este artefato existe
para registrar.

---

## 1 · Fontes técnicas principais

| Fonte | Papel |
|---|---|
| `src/data/stories.js` | Catálogo canônico das 20 histórias |
| `src/data/catalog.js` | `CATALOG` por trilha |
| `src/data/contentManifest.js` | Camada de distribuição (`starter` / `remote`) |
| `src/data/audioManifest.js` | 200 áudios reais, 10 por história |
| `src/data/quizzes.js` | 8 perguntas por história, todas as 20 |
| `src/data/storySceneIllustrations.js` | Ilustrações de cena |
| `src/data/coloring60Catalog.js` · `coloring60StoryMilestones.js` | Piloto C60 |
| `src/services/accessControl.js` | Política de acesso *fail-closed* |
| `docs/F1_2_ESCALA_WEBP_CENAS_CAPAS.md` | Pesos de mídia |

---

## 2 · Correções metodológicas herdadas de E014

| # | Formulação incorreta | Formulação correta adotada |
|--:|---|---|
| 3 | ~~"As dezoito histórias premium funcionam integralmente offline."~~ | A **mídia local existe**, mas o **acesso depende do entitlement**. Separar **mídia**, **autorização**, **cache válido** e **pack instalado**. |
| 4 | ~~"Asset entregue por pack = zero."~~ | **Zero payloads de pack versionados no repositório.** O estado de packs **instalados no aparelho** é independente e não foi levantado. |
| 5 | ~~"Zero mídia validada fisicamente."~~ | **Zero auditorias físicas individuais** dos 200 arquivos. **Preservar** as validações físicas históricas de fluxo. |

> ## ⚠️ Regra central deste artefato
> **Mídia local NÃO significa entitlement premium.**
> As colunas de mídia (campos 14 a 24) e a coluna de acesso (campo 28) são **eixos
> independentes**. `accessControl.js:47-49` é explícito: **"Pack no disco NUNCA é autorização."**

---

## 3 · Os quatro estados que não podem ser confundidos

| Estado | Pergunta que responde | Onde vive |
|---|---|---|
| **Mídia** | O arquivo existe e é alcançável? | bundle · `assets/` · pack instalado |
| **Autorização** | O plano permite abrir? | `accessControl.js` + `@ptf_entitlement_v1` |
| **Cache válido** | A autorização ainda vale offline? | `entitlementPolicy.js` |
| **Pack instalado** | O pack foi baixado neste aparelho? | `packStorageService` — **`NÃO DETERMINADO`** |

Uma história pode ter **mídia completa no bundle** e **permanecer fechada** por ausência de
entitlement. É exatamente o caso das 18 premium.

---

## 4 · Tabela A — identidade e posição editorial (campos 1 a 10)

| # | 2 storyId | 3 slug | 4 Título visível | 5 Referência | 6 Trilha | 7 Ordem | 8 CATALOG | 9 Cronológica | 10 Coleção |
|--:|---|---|---|---|---|--:|--:|--:|---|
| 1 | `creation` | creation | A Criação | Gênesis 1 | `comece_aqui` | 1 | comece · 1 | — | — |
| 2 | `noah` | noah | Noé e o Sinal da Aliança | Gênesis 6–9 | `comece_aqui` | 2 | comece · 2 | **3** | `criacao_e_comecos` |
| 3 | `david_goliath` | david-goliath | Davi e Golias | 1 Samuel 17 | `pequeninos` | 1 | pequeninos · 1 | **17** | `reis_de_israel` |
| 4 | `jesus_children` | jesus-children | Jesus e as Crianças | Marcos 10 | `pequeninos` | 2 | pequeninos · 2 | **46** | `vida_de_jesus` |
| 5 | `daniel_lions` | daniel-lions | Daniel e os Leões | Daniel 6 | `pequeninos` | 3 | pequeninos · 3 | — | — |
| 6 | `jonah_big_fish` | jonah-big-fish | Jonas e o Grande Peixe | Jonas 1–3 | **`descobridores`** | **6** | descobridores · 6 | — | — |
| 7 | `lost_sheep` | lost-sheep | A Ovelha Perdida | Lucas 15 | `pequeninos` | 5 | pequeninos · 5 | — | — |
| 8 | `good_samaritan` | good-samaritan | O Bom Samaritano | Lucas 10 | `pequeninos` | 6 | pequeninos · 6 | — | — |
| 9 | `abraham_stars` | abraham-stars | Abraão e as Estrelas | Gênesis 15 | `descobridores` | 1 | descobridores · 1 | — | — |
| 10 | `joseph_colorful_coat` | joseph-colorful-coat | José e a Túnica Especial | Gênesis 37 | `descobridores` | 2 | descobridores · 2 | — | — |
| 11 | `moses_red_sea` | moses-red-sea | Moisés e o Mar Vermelho | Êxodo 14 | `descobridores` | 3 | descobridores · 3 | — | — |
| 12 | `ruth_naomi` | ruth-naomi | Rute e Noemi | Rute 1–4 | `descobridores` | 4 | descobridores · 4 | — | — |
| 13 | `esther_queen` | esther-queen | Ester, a Rainha Corajosa | Ester 4 | **`pequeninos`** | **4** | pequeninos · 4 | — | — |
| 14 | `miraculous_catch` | miraculous-catch | A Pesca Milagrosa | Lucas 5 | `descobridores` | 5 | descobridores · 5 | — | — |
| 15 | `samuel_hears_god` | samuel-hears-god | Samuel Ouve a Voz de Deus | 1 Samuel 3 | `jovens_da_fe` | 1 | jovens_da_fe · 1 | — | — |
| 16 | `josiah_young_king` | josiah-young-king | Josias, o Rei Jovem | 2 Reis 22 | `jovens_da_fe` | 2 | jovens_da_fe · 2 | — | — |
| 17 | `solomon_wisdom` | solomon-wisdom | Salomão e a Sabedoria | 1 Reis 3 | `jovens_da_fe` | 3 | jovens_da_fe · 3 | — | — |
| 18 | `mary_says_yes` | mary-says-yes | Maria Recebe a Boa Notícia | Lucas 1 | `jovens_da_fe` | 4 | jovens_da_fe · 4 | — | — |
| 19 | `timothy_faith` | timothy-faith | Timóteo e a Fé | 2 Timóteo 1 | `jovens_da_fe` | 5 | jovens_da_fe · 5 | — | — |
| 20 | `jesus_temple` | jesus-temple | Jesus no Templo | Lucas 2 | `jovens_da_fe` | 6 | jovens_da_fe · 6 | — | — |

> **Campo 1** é a posição no array de `stories.js` — que **não** coincide com a ordem de trilha.
> As duas linhas em negrito (6 e 13) são as que mais divergem: `jonah_big_fish` ocupa a **6ª
> posição do array** mas é a **6ª de `descobridores`**; `esther_queen` ocupa a **13ª posição do
> array** mas é a **4ª de `pequeninos`**. — `COMPROVADO PELO CÓDIGO`

---

## 5 · Tabela B — conteúdo e mídia (campos 11 a 24)

| # | storyId | 11 Plano | 12 Camada | 13 Status | 14 Cenas | 15 Ilustr. | 16 Capa | 17 Proporção | 18 Áudio | 19 Obrig. | 20 Quiz | 21 Colorir | 22 Formato | 23 C60 ativ. | 24 C60 marcos |
|--:|---|---|---|---|--:|--:|---|---|--:|---|--:|--:|---|--:|---|
| 1 | `creation` | **free** | **starter** | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | **3** | **2 · 7 · 9** |
| 2 | `noah` | **free** | **starter** | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 3 | `david_goliath` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 4 | `jesus_children` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 5 | `daniel_lions` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 6 | `jonah_big_fish` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 7 | `lost_sheep` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 8 | `good_samaritan` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 9 | `abraham_stars` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 10 | `joseph_colorful_coat` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 11 | `moses_red_sea` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 12 | `ruth_naomi` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 13 | `esther_queen` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 14 | `miraculous_catch` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 15 | `samuel_hears_god` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 16 | `josiah_young_king` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 17 | `solomon_wisdom` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 18 | `mary_says_yes` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 19 | `timothy_faith` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |
| 20 | `jesus_temple` | premium | remote | available | 10 | 10 | sim | 16/9 | 10 | sim | 8 | 10 | PNG | 0 | — |

**Totais:** 200 cenas · 200 ilustrações · 20 capas · **200 áudios reais** · 160 perguntas ·
**200 páginas de colorir em PNG** · **3 atividades C60, todas em `creation`**.

### 5.1 · Nota de precisão sobre a contagem de áudio
`AUDIO_MANIFEST` é o **produto cartesiano** de 20 `storyId` × 10 `sceneKey` (`audioManifest.js:273`),
com `status` derivado da presença em `_readyEntries`. Uma contagem textual ingênua de
`audioAsset: require` retorna **201** — a 201ª ocorrência é o **exemplo dentro do comentário de
cabeçalho** (`:19`), não uma entrada real. O número correto é **200**, dez por história, todas
`READY` e todas `requiredForLaunch: true`. — `COMPROVADO PELO CÓDIGO`

### 5.2 · C60 — o piloto vive só em "A Criação"

`COLORING60_CATALOG = Object.freeze({ creation: CREATION_ACTIVITIES })`
(`coloring60Catalog.js:64-66`), com o comentário verbatim: *"No piloto, SOMENTE `creation` possui
atividades."* Os marcos (`coloring60StoryMilestones.js:42-48`):

| Atividade | Desbloqueia após a cena | Retoma na cena |
|---|--:|--:|
| `light` | 2 | 3 |
| `living_world` | 7 | 8 |
| `people_and_care` | 9 | 10 |

**As outras 19 histórias têm zero atividades C60.** — `COMPROVADO PELO CÓDIGO`

---

## 6 · Tabela C — entrega, acesso e evidência (campos 25 a 29)

| # | storyId | 25 Pack declarado | 26 Payload no repositório | 27 Mídia local no bundle | 28 Entitlement exigido | 29 Evidência |
|--:|---|---|---|---|---|---|
| 1 | `creation` | não | **zero** | **sim, completa** | **não** | `COMPROVADO PELO CÓDIGO` |
| 2 | `noah` | não | **zero** | **sim, completa** | **não** | `COMPROVADO PELO CÓDIGO` |
| 3 | `david_goliath` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 4 | `jesus_children` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 5 | `daniel_lions` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 6 | `jonah_big_fish` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 7 | `lost_sheep` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 8 | `good_samaritan` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 9 | `abraham_stars` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 10 | `joseph_colorful_coat` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 11 | `moses_red_sea` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 12 | `ruth_naomi` | **sim** — `story_ruth_naomi` | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 13 | `esther_queen` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 14 | `miraculous_catch` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 15 | `samuel_hears_god` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 16 | `josiah_young_king` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 17 | `solomon_wisdom` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 18 | `mary_says_yes` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 19 | `timothy_faith` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |
| 20 | `jesus_temple` | não | **zero** | sim, completa | **sim** | `COMPROVADO PELO CÓDIGO` |

### 6.1 · Leitura correta das colunas 26 a 28

- **Coluna 26** diz apenas: **zero payloads de pack versionados no repositório**. Não diz nada
  sobre packs instalados em aparelhos — isso é **`NÃO DETERMINADO`**.
- **Coluna 27** diz: a mídia está no bundle do aplicativo. **Isso é fallback local existente**, e
  é o que permite que uma premium seja aberta **assim que houver entitlement**, sem download.
- **Coluna 28** é independente das anteriores. **Mídia local não significa entitlement premium.**

### 6.2 · Packs não entregam colorir

`packDownloadService.js:136,243` usa `requestedKinds = ['scene']` como padrão. O único pack
declarado (`story_ruth_naomi`) tem `status: 'not_downloaded'`. **Nenhum caminho de pack entrega
páginas de colorir hoje** — colorir vem sempre do bundle local (200 PNG). — `COMPROVADO PELO CÓDIGO`

---

## 7 · As ordens editoriais divergentes

Seis eixos de ordenação **coexistem** e **não coincidem**:

| # | Eixo | Onde | Cobertura |
|--:|---|---|---|
| 1 | Posição no array | `stories.js` | 20 de 20 |
| 2 | `(trackId, order)` | `stories.js` | 20 de 20 |
| 3 | Ordem do `CATALOG` | `catalog.js` | 20 de 20 |
| 4 | `sort` por `order` no mapa | `adventureMap.js:71` | 20 de 20 |
| 5 | `chronologicalOrder` | `stories.js` | **3 de 20** |
| 6 | `(a.order ?? 99)` como desempate | `showcaseStory.js:28` | 20 de 20 |

**Consequência comprovada:** `getStoriesInChronologicalOrder()` (`storyHelpers.js:45-72`) ordena
por um campo presente em **apenas 3 histórias**; as outras 17 comparam contra `undefined`.
A função tem **zero consumidores** hoje — o defeito é latente, não ativo.
— `COMPROVADO PELO CÓDIGO`

**Dois vocabulários de trilha:** `catalog.js` usa a chave `comece`; `stories.js` usa
`trackId: 'comece_aqui'`. `nextAdventureService.js:23` (`TRAIL_ORDER`) lê do `CATALOG` e **casa**
corretamente — não há defeito ativo, mas a duplicidade de vocabulário é real e permanece.

---

## 8 · Contagens de fechamento

| Métrica | Valor |
|---|---:|
| Histórias | **20** |
| Gratuitas (`free` + `starter`) | **2** |
| Premium (`premium` + `remote`) | **18** |
| Em `coming_soon` | **0** |
| Histórias com C60 | **1** |
| Packs declarados em `REMOTE_PACKS` | **1** |
| Payloads de pack versionados | **0** |
| Histórias com mídia local completa | **20** |
| Histórias que exigem entitlement | **18** |

---

## 9 · Decisões já aprovadas que não podem ser reabertas

1. **Duas gratuitas fixas** — `creation` e `noah`, camada `starter` (`contentManifest.js:22`).
2. **`coming_soon` reservado para conteúdo realmente futuro; nenhum hoje** (`:43-50`).
3. **Pack no disco nunca é autorização** (`accessControl.js:47-49`).
4. **C60 é piloto restrito a "A Criação"** (`coloring60Catalog.js:63`).
5. **Colorir não recebe lossy sem teste de flood fill em aparelho** (`F1_2:131`).
6. **Todas as 20 têm 10 cenas, 10 áudios e 8 perguntas** — uniformidade confirmada.

## 10 · Itens não determinados

1. Estado de packs instalados em aparelhos reais.
2. Qual dos seis eixos de ordenação é o **canônico** — decisão de Product Lock.
3. Se `chronologicalOrder` será completado para as 20 ou removido.
4. Se o piloto C60 se estende às outras 19 histórias.
5. Se packs passarão a entregar colorir e áudio além de cenas.

## 11 · Fases proprietárias

| Assunto | Fase |
|---|---|
| Escolha da ordenação canônica | **4** |
| Expansão de C60 e do acervo | **4** e **5** |
| Publicação real de packs | **5** |
| Otimização de colorir (F1.3) | **5** |
| Implementação de motor de jornada | **9** e **11** |

---

*Fim do artefato 8 de 11. Nenhuma história foi alterada. Nenhum manifesto foi tocado.*
