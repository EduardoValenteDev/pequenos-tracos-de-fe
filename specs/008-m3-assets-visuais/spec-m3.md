# M3 · Correção de assets visuais (correspondência narrativa)

> **Feature:** `008-m3-assets-visuais` · **Etapa SDD:** 1 (Specify) · **Portão 1: pendente.**
> **Base:** M2 publicado (`7d89abb`). Roadmap M0–M10 — este é o **M3**.
> **Natureza:** conteúdo visual (assets de imagem) + republicação de packs R2. **Não** toca código de telas, texto de cena, quiz, reflexão, entitlement, EAS.
> **Status da produção de arte:** dependência EXTERNA (designer). O M3 entrega inventário, gabarito, tabela de produção, integração e republicação — **não produz arte**.

## 1. Critério oficial do M3 (decidido no Portão 0, Eduardo)

O único critério de inclusão é **correspondência com a narração oficial e com o gabarito da cena**:

- **Gabarito de cena:** `cenas[].textoNarracao` de `src/data/stories.js` (árbitro máximo).
- **Gabarito de folha de colorir:** complementado por `tituloColorir` e `instrucaoColorir`.

**Qualidade visual geral NÃO amplia o escopo.** Um asset que corresponde à cena mas desagrada esteticamente vai para a **lista de pendências visuais opcionais** (§6), fora do M3.

Consequência: os dois eixos de falha ficam separados por decisão explícita —
(A) **correspondência narrativa** → M3;
(B) **qualidade/adequação de traço** → pendência opcional, bloco futuro.

## 2. Origem do inventário

Inspeção visual **read-only, imagem a imagem** (55 imagens), cada uma julgada contra o gabarito acima. Nenhuma inclusão por relato indireto: itens relatados que se mostraram **corretos por conteúdo** foram REMOVIDOS do escopo; itens não relatados que se mostraram **errados** foram ACRESCENTADOS.

Três hipóteses foram levantadas e **refutadas** durante o M3.0:
1. José = deslocamento de índice → **falso** (é compressão: 10 folhas cobrem 4 beats, com duplicatas).
2. Bom Samaritano = lista de corretas/erradas do relato → **invertida nas pontas**.
3. "Texto de cena diverge da narração em todas as histórias" → **refutado** (200/200 batem; ver M2a). Não pertence ao M3.

## 3. Escopo PRINCIPAL — correspondência narrativa (37 artes)

Todas as 7 histórias são de camada **`remote`** (packs no R2). Nenhuma é `starter`.

### 3.1 lost_sheep — 3 ilustradas
| Cena | Gabarito | Estado atual | Ação |
|---|---|---|---|
| 08 | Pastor carrega a ovelha nos ombros | Pastor agachado tocando a ovelha (reencontro) | Refazer |
| 09 | Festa com amigos e vizinhos | Abraço íntimo pastor+ovelha (= cena 07) | Refazer |
| 10 | Coração dourado, "você é essa ovelhinha" | Ovelha nos ombros no rebanho (= cena 08) | Refazer |

Padrão: deslocamento de ~2 cenas para trás. As cenas finais (festa, coração) **não têm arte**.

### 3.2 esther_queen — 5 colorir + 7 ilustradas = 12
Colorir e ilustrada divergem entre si; **ambos** os lados quebram, em cenas diferentes.

| Cena | Colorir | Ilustrada |
|---|---|---|
| 03 | ❌ coroação (= cena 1) | ❌ preparação no harém (= cena 1/2) |
| 04 | ❌ Mardoqueu no portão | ❌ coroação (= cena 1) |
| 05 | ❌ orgulho de Hamã | ❌ Mardoqueu no portão |
| 06 | ❌ entrega da carta (= cena 3) | ❌ Hamã desfilando |
| 07 | ❌ jejum/oração (= cena 5) | ❌ Mardoqueu aconselha Ester (= cena 4) |
| 08 | ✅ cetro estendido | ❌ jejum/oração (= cena 5) |
| 09 | ✅ banquete | ❌ cetro (= cena 8) |
| 10 | ✅ povo celebrando | ✅ celebração final |

A refazer: **colorir 03–07** (5) · **ilustradas 03–09** (7). Cenas 04, 06 e 07 não têm arte correspondente em nenhum dos dois conjuntos.

### 3.3 good_samaritan — 5 colorir + 3 ilustradas = 8
| Cena | Colorir | Ilustrada |
|---|---|---|
| 01 | ❌ viajante ileso (= cena 2) | ✅ |
| 02 | ✅ | ✅ (mantida por decisão; ver §7) |
| 03–06 | ✅ | ✅ |
| 07 | ❌ repete o curativo (= cena 6) | ✅ |
| 08 | ❌ transporte à estalagem (= cena 7) | ❌ falta o pagamento |
| 09 | ❌ pagamento (= cena 8) | ❌ pagamento (= cena 8) |
| 10 | ❌ pagamento de novo (duplica a 09) | ❌ Jesus questiona (= cena 9) |

A refazer: **colorir 01, 07, 08, 09, 10** (5) · **ilustradas 08, 09, 10** (3). O desfecho "Vai e faz o mesmo" **não existe** em nenhum dos dois conjuntos.

### 3.4 abraham_stars — 2 colorir
| Cena | Gabarito | Estado atual | Ação |
|---|---|---|---|
| 04 | Abraão crê: coração aberto + luz dourada | Abraão e Sara junto à tenda; símbolo ausente | Refazer (falta elemento simbólico do gabarito) |
| 09 | Mapa da terra prometida (rios, montanhas, campos) | Abraão caminhando sob a lua; sem mapa | Refazer |

### 3.5 joseph_colorful_coat — 10 colorir (conjunto inteiro)
**0 de 10 folhas corretas.** Não é deslocamento: é **compressão**. As 10 folhas reencenam apenas os 4 primeiros beats, com duplicatas:

- cena 01 (a túnica) → folhas 02, 03, 04
- cena 02 (os sonhos) → folhas 05, 06, 07
- cena 03 (o poço) → folha 08
- cena 04 (a caravana) → folhas 09, 10

**Seis cenas sem arte alguma:** 05 (Potifar), 06 (prisão), 07 (uvas e pão), 08 (sonho do faraó), 09 (José governador), 10 (reconciliação).

**Decisão (Eduardo):** refazer as **10 folhas**, mantendo **os mesmos nomes de arquivo** (`scene_01.png` … `scene_10.png`). **Não remapear índices. Não alterar código.** As ilustradas de José estão corretas e não são tocadas.

### 3.6 miraculous_catch — 1 colorir
| Cena | Gabarito | Estado atual | Ação |
|---|---|---|---|
| 05 | Pedro e as redes se enchendo de peixes | Jesus apontando, rede vazia (= cena 4) | Refazer |

### 3.7 samuel_hears_god — 1 ilustrada
| Cena | Gabarito | Estado atual | Ação |
|---|---|---|---|
| 10 | Samuel adulto, o profeta de Israel | Samuel menino no templo com Eli (= cena 1) | Refazer |

## 4. Consolidado do escopo principal

| História | Camada | Colorir | Ilustradas | Total |
|---|---|---|---|---|
| miraculous_catch | remote | 1 | 0 | 1 |
| samuel_hears_god | remote | 0 | 1 | 1 |
| abraham_stars | remote | 2 | 0 | 2 |
| lost_sheep | remote | 0 | 3 | 3 |
| good_samaritan | remote | 5 | 3 | 8 |
| esther_queen | remote | 5 | 7 | 12 |
| joseph_colorful_coat | remote | 10 | 0 | 10 |
| **TOTAL** | — | **23** | **14** | **37** |

**7 histórias, todas `remote` → 7 packs a republicar no R2.**

## 5. Impacto em código: NENHUM esperado

Os assets são referenciados por **dois pontos únicos**, com `require()` estático e convenção 1:1 (`scene_NN` → cena N):

- `src/assets/coloringImages.js` (202 requires) → `assets/stories/<id>/coloring/scene_NN.png`
- `src/data/storySceneIllustrations.js` (204 requires) → `assets/stories/<id>/scenes/<id>_scene_NN.webp`

Como toda arte nova **mantém o nome do arquivo**, nenhum `require` muda. O M3 é uma faixa de **assets pura**, separada de código e de governança. Se em algum momento surgir necessidade de remapear índice, isso vira mudança de **código** e exige spec própria — está **fora** do M3 por decisão explícita.

## 6. Pendências visuais opcionais (FORA do M3)

Assets **corretos por conteúdo**, retirados do escopo principal por decisão do Portão 0. Não bloqueiam o M3 nem o lançamento; ficam registrados para um bloco futuro de qualidade visual.

| História | Asset | Motivo da retirada |
|---|---|---|
| noah | colorir 04 | Cena correta (arca, rampa, animais em fila, Noé, pombas) |
| lost_sheep | colorir 05 | Cena correta (pastor buscando pelo campo) |
| abraham_stars | colorir 01 | Cena correta (Abraão sob o céu estrelado) |

## 7. Itens julgados e mantidos (registro de decisão)

- **good_samaritan ilustrada 02** — a inspeção marcou DUVIDOSA (mostra o viajante **antes** do ataque, sem ferimento). **Decisão: considerar correta por enquanto.** Registrado para reavaliação futura, não é retrabalho do M3.

## 8. Riscos

### 8.1 🔴 RISCO PRINCIPAL — pack remoto já baixado (BLOQUEANTE)
`contentResolver.js` (linha ~78) dá **precedência ao pack baixado**: pack `ready` + `localDir` → serve `file://` do R2; só sem pack cai no `require` do binário.

**Consequência:** substituir o PNG/WebP no repositório **não conserta o que o usuário vê** se ele já baixou a história. Como **todas as 7 histórias do M3 são `remote`**, isso vale para 100% do escopo.

**Pergunta em aberto, a responder ANTES do primeiro lote:** um pack já instalado no aparelho **detecta que ficou obsoleto e rebaixa**? O `content-manifest.json` global carrega `sha256`; falta provar se o downloader/índice compara o sha do disco com o do manifesto e invalida. Se **não** invalidar, nenhuma correção do M3 chega a quem já baixou, e será preciso uma estratégia de invalidação (versão de pack, sha do manifesto, ou reset dirigido) — **área sensível**, com spec própria.

> ⚠️ Ao remover Noé (única `starter`) do escopo principal, **desapareceu o lote-piloto sem R2**. Não há mais como validar o rito de troca de asset isoladamente. Por isso a investigação de rebaixa deixa de ser recomendável e passa a ser **pré-requisito bloqueante do M3.1**.

### 8.2 Demais riscos
| Risco | Mitigação |
|---|---|
| Arte nova com nome/dimensão/formato divergentes | Gabarito de nomes fixo (§5); `validate-image-assets.js` antes do commit |
| Commit de assets misturado a código/governança | Um lote = uma história = um commit de assets atômico; `git add` seletivo |
| Peso do bundle crescer | Medir por lote (`measure-size.js`); WebP/otimização é **2C**, não M3 |
| Pack R2 dessincronizado do repo | Rebuild + upload + `content-manifest.json` novo + `verify-r2-pack-readiness.js` por lote |
| Escopo migrar para qualidade visual | §1 e §6 travam o critério |

## 9. Plano em sub-blocos, com Portão Humano entre eles

- **M3.0 — Inventário verificado** ✅ CONCLUÍDO (este documento). Read-only, 55 imagens. **🚦 Portão 1 = aprovação desta spec.**
- **M3.1 — Investigação de rebaixa de pack (read-only, BLOQUEANTE).** Provar se um pack instalado detecta obsolescência e rebaixa. Saída: relatório + decisão sobre estratégia de invalidação. **Nenhum asset trocado antes disso. 🚦 Portão.**
- **M3.2 — Entrega da arte (externa).** Designer produz conforme `producao-m3.md`. Validação de nome/dimensão/formato na chegada de cada lote.
- **M3.3 — Integração por lote.** Ordem por risco crescente:
  `miraculous_catch (1)` → `samuel_hears_god (1)` → `abraham_stars (2)` → `lost_sheep (3)` → `good_samaritan (8)` → `esther_queen (12)` → `joseph_colorful_coat (10)`.
  Cada lote: auditoria (inventário, peso, dimensões) → `git add` seletivo → commit de assets atômico → smoke → **validação visual no device (Eduardo)**. **🚦 Portão a cada lote** (ou a cada dois, a critério).
- **M3.4 — Republicação R2 por lote.** Rebuild (`build-story-pack.js`) → upload → `content-manifest.json` com sha256 novo → `verify-r2-pack-readiness.js` → validação no device. **🚦 Portão.**
- **M3.5 — Fechamento.** `npm run smoke` + `npx expo-doctor` + validação visual final + commit de governança dos docs SDD.

**M3 precede o 2C.** Converter para WebP assets que serão substituídos seria retrabalho garantido.

## 10. Fora do escopo (explícito)
- ❌ Quiz (`quizzes.js`) — tratado e fechado no M2; nenhuma interseção de arquivos.
- ❌ Texto de cena / narração / reflexão / finalização — M2, concluído.
- ❌ Áudio (MP3) — se o áudio divergir da legenda, é **auditoria de áudio**, bloco próprio.
- ❌ Qualidade visual/traço — §6, bloco futuro.
- ❌ Remapeamento de índices / mudanças em `coloringImages.js` ou `storySceneIllustrations.js`.
- ❌ **2C** (WebP, bundle, premium→R2) e **Camada de Alma** — não iniciados.
- ❌ Entitlement, RevenueCat, EAS, `app.json`.

## 11. Critérios de aceite
- Toda arte nova corresponde ao `textoNarracao` (+ `tituloColorir`/`instrucaoColorir`) da sua cena.
- Nomes de arquivo, dimensões e formato preservados; **zero mudança de código**.
- Cada lote = commit de assets atômico, sem código nem governança junto.
- Pack R2 republicado e verificado para cada história `remote`; comportamento correto em aparelho **que já tinha o pack baixado**.
- `npm run smoke` e `npx expo-doctor` verdes; validação visual aprovada por Eduardo em device.
