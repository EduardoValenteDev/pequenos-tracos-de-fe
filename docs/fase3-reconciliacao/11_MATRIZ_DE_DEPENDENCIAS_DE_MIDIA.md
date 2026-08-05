# 11 · Matriz de dependências de mídia

> **Artefato 11 de 11 — E015 · Fase 3G · Reconciliação**

| Campo | Valor |
|---|---|
| **Estado** | **PRELIMINAR PARA PRODUCT LOCK** |
| **Base auditada** | E009 a E014 |
| **Branch** | `integrate/colorir-canonical-runtime` |
| **HEAD** | `015c438106538595b592981fbe1b80b1d5d65e55` |
| **Data** | 5 de agosto de 2026 |

---

## 0 · Declaração de natureza

**Este artefato não implementa funcionalidade.** Não move, não copia, não converte, não remove e
não versiona nenhum arquivo de mídia. Descreve **de onde cada superfície tira o que exibe**.

---

## 1 · Fontes técnicas principais

| Fonte | Papel |
|---|---|
| `src/services/contentResolver.js:69-87` | **`decide()`** — a arbitragem central de origem |
| `src/data/contentManifest.js` | `STORY_CONTENT_LAYER` · `REMOTE_PACKS` |
| `src/services/storyImageService.js` | capa, cena, página do livrinho |
| `src/services/audioService.js` · `src/data/audioManifest.js` | 200 áudios de cena |
| `src/services/packDownloadService.js:520,611` | download de manifesto e de arquivos do pack |
| `src/services/globalManifestService.js:211` | `fetch` do índice global |
| `src/services/accessControl.js:47-49` | autorização — **eixo separado da mídia** |
| `src/services/assetPreloadService.js` · `beniAssetWarmup.js` | pré-carregamento |
| `src/services/mediaReadyService.js` | completude de mídia por história |
| `src/assets/coloring60LocalAssets.js` | registro estático do piloto C60 |

---

## 2 · Correções metodológicas herdadas de E014 — vinculantes neste artefato

Este artefato é o que mais depende de linguagem precisa sobre mídia. As cinco correções de E014
são aplicadas aqui **literalmente**:

| # | Formulação **incorreta**, proibida | Formulação **correta**, adotada |
|--:|---|---|
| 1 | ~~"Todas as chamadas de rede são GET."~~ | Existem **três pontos explícitos de fetch** para manifestos e mídia e **uma integração externa com o SDK RevenueCat**. O método HTTP interno do SDK **não é determinado** pelo código do aplicativo. |
| 2 | ~~"Nenhum dado da criança sai do aparelho."~~ | **Não existe upload explícito de conteúdo infantil** no código do aplicativo. A integração RevenueCat existe e seu envelope técnico de dados **precisa de auditoria jurídica e técnica nas Fases 5, 18 e 19**. |
| 3 | ~~"As dezoito histórias premium funcionam integralmente offline."~~ | **A mídia local existe, mas o acesso depende do entitlement.** Separar **mídia**, **autorização**, **cache válido** e **pack instalado**. |
| 4 | ~~"Asset entregue por pack = zero."~~ | **Zero payloads de pack ficam versionados no repositório.** O estado de packs **instalados no aparelho** é independente e **não foi levantado** nesta auditoria. |
| 5 | ~~"Zero mídia validada fisicamente."~~ | **Zero auditorias físicas individuais dos 200 arquivos.** Preservar as validações físicas históricas dos fluxos que consumiram mídia, packs, áudio e recovery. |

### 2.1 · Os três pontos de rede, nomeados

| # | Local | O que busca |
|--:|---|---|
| 1 | `globalManifestService.js:211` — `await fetch(trimmed, …)` | índice global (`content-manifest.json`) |
| 2 | `packDownloadService.js:520-521` — `createDownloadResumable(manifestUrl, …)` | `manifest.json` do pack |
| 3 | `packDownloadService.js:611-618` — `createDownloadResumable(\`${base}${f.path}\`, …)` | os arquivos do pack |

> `ColoringCanvas.js:732` também chama `fetch(localUri)` — mas sobre um **URI local**, não é rede.
> Registrado para que E016 não o conte como quarto ponto. — `COMPROVADO PELO CÓDIGO`

---

## 3 · Classificação de origem — o vocabulário obrigatório

| Classificação | Significado exato |
|---|---|
| **`LOCAL NO BUNDLE`** | `require()` estático; viaja dentro do binário |
| **`REMOTO POR PACK`** | declarado para vir por pack; **payload não versionado no repositório** |
| **`INSTALADO NO APARELHO`** | `file://` sob o diretório do pack, **após** instalação — **estado não levantado** |
| **`DERIVADO`** | produzido em runtime (desenho da criança, retrato, certificado) |
| **`AUSENTE`** | não existe em lugar nenhum |
| **`PLANEJADO`** | previsto, ainda não existe |
| **`NÃO DETERMINADO`** | esta auditoria não estabeleceu |

> **Regra de disciplina:** `REMOTO POR PACK` e `INSTALADO NO APARELHO` são **estados distintos**.
> Declarar um pelo outro é exatamente o erro que a correção 4 proíbe.

---

## 4 · A arbitragem real — `decide()`

`contentResolver.js:69-87` é a **única** função que escolhe a origem de uma mídia de história:

| Condição | Resultado | Classificação |
|---|---|---|
| camada `starter` **e** asset local existe | `INCLUDED` / `require` | `LOCAL NO BUNDLE` |
| camada `starter` **e** asset local ausente | `ERROR` / `missing` | `AUSENTE` |
| `remote` **e** pack `ready` **e** `localDir` | `READY` / `{ uri: file://… }` | `INSTALADO NO APARELHO` |
| `remote` **sem** pack, **com** asset local | `NOT_DOWNLOADED` / `require` | `LOCAL NO BUNDLE` *(fallback F2.1a)* |
| `remote` **sem** pack, **sem** asset local | `NOT_DOWNLOADED` / `missing` | `AUSENTE` |

### 4.1 · O fato mais importante deste artefato

`:83-85`, comentário verbatim no código:
> *"remote sem pack → FALLBACK ao require local (ainda no binário no F2.1a) → app não quebra"*

**As dezoito histórias `remote` ainda estão fisicamente no binário.** O caminho por pack existe e
está implementado, mas **hoje não é o caminho efetivo** para nenhuma delas.
— `COMPROVADO PELO CÓDIGO`

### 4.2 · A separação que a correção 3 exige

**`decide()` não consulta entitlement.** Não importa `accessControl`, não recebe estado de compra,
não tem ramo de autorização. Os quatro eixos são independentes:

| Eixo | Quem decide | Estado hoje |
|---|---|---|
| **Mídia existe?** | `contentResolver.decide()` · `mediaReadyService` | sim, no bundle, para as 20 |
| **Está autorizado?** | `accessControl.js:47-49` — **fail-closed** | 2 livres · 18 sob entitlement |
| **Cache é válido?** | `entitlementService` · `entitlementSource` | `NÃO DETERMINADO` neste artefato |
| **Pack está instalado?** | `PacksContext` · `packStorageService` | **estado no aparelho não levantado** |

> `accessControl.js:47-49`, verbatim: **"Pack no disco NUNCA é autorização."** A recíproca também
> vale — **autorização nunca é mídia presente**. Nunca colapsar os quatro eixos em um.

---

## 5 · Matriz por superfície — 22 superfícies × 16 eixos

### 5.1 · Tabela A — identidade e origem (eixos 1 a 6)

| # | 1 Superfície | 2 Mídia consumida | 3 Origem | 4 Resolvedor | 5 Raiz local | 6 Caminho no pack |
|--:|---|---|---|---|---|---|
| 1 | Splash e boot | ícone, splash | `LOCAL NO BUNDLE` | Expo | `assets/splash-icon.png` | — |
| 2 | Início (Home) | capas, Beni | `LOCAL NO BUNDLE` | `storyImageService.getStoryCoverImage` | `assets/stories/*/cover` · `assets/mascot` | `cover.webp` |
| 3 | Mapa das Aventuras | mapa, marcadores, capas | `LOCAL NO BUNDLE` | `adventureMap.js` · `storyImageService` | `assets/maps` | `cover.webp` |
| 4 | Lista de Histórias | capas | `LOCAL NO BUNDLE` | `storyImageService` | `assets/stories/*/cover` | `cover.webp` |
| 5 | Detalhe da História | capa, prévia | `LOCAL NO BUNDLE` | `storyImageService` | `assets/stories/*/cover` | `cover.webp` |
| 6 | Livrinho — cena | 10 cenas por história | `LOCAL NO BUNDLE` | `getBestStoryBookVisual` | `assets/stories/*/scenes` | `scene_NN.webp` |
| 7 | Livrinho — narração | 200 áudios | `LOCAL NO BUNDLE` | `audioService.getSceneAudio` | `assets/stories/*/audio` | `audio_NN.*` |
| 8 | Parabéns | Beni, confete | `LOCAL NO BUNDLE` | `beniAssetWarmup` | `assets/mascot` | — |
| 9 | Colorir (legado) | 200 PNG | `LOCAL NO BUNDLE` | `coloringImages.js` | `assets/stories/*/coloring` | `coloring_NN.png` |
| 10 | Colorir 60 (piloto) | 3 fontes de `creation` | `LOCAL NO BUNDLE` | `coloring60LocalAssets.js` | `assets/stories/creation/…` | — |
| 11 | Ateliê / Criar Livre | desenho da criança | **`DERIVADO`** | `drawingStorage` · `fileBlobStore` | `file://` documentDirectory | — |
| 12 | Galeria do Ateliê | desenhos salvos | **`DERIVADO`** | `atelierStorage` | `file://` documentDirectory | — |
| 13 | Monte a Cena | peças de cena | `LOCAL NO BUNDLE` | `monteACenaGallery` · `monteACenaSpikeData` | `assets/games` | — |
| 14 | Palavrinhas do Beni | Beni, efeitos, som | `LOCAL NO BUNDLE` | registro local | `assets/games` · `assets/mascot` | — |
| 15 | Jogo dos Pares | cartas | `LOCAL NO BUNDLE` | registro local | `assets/games` | — |
| 16 | Cultinho em Casa | capas, áudio | `LOCAL NO BUNDLE` | `familyWorshipService` | `assets/stories` | — |
| 17 | Baú do Beni | itens, Beni | `LOCAL NO BUNDLE` | `beniChestService` | `assets/mascot` | — |
| 18 | Estrelinhas e Conquistas | selos | `LOCAL NO BUNDLE` | `achievementService` | `assets/images` | — |
| 19 | Momento do Beni | capa do dia | `LOCAL NO BUNDLE` | `LumiMomentScreen.js:18` | `assets/stories/*/cover` | `cover.webp` |
| 20 | Perfil e Área dos Pais | avatares | `LOCAL NO BUNDLE` | `childProfileService` | `assets/avatar` | — |
| 21 | Premium e paywall | arte de oferta | `LOCAL NO BUNDLE` | componentes `premium/` | `assets/images` | — |
| 22 | Certificado | retrato composto | **`DERIVADO`** | `certificateService` · `coloring60PortraitMerge` | `file://` | — |

### 5.2 · Tabela B — forma e condição (eixos 7 a 11)

| # | 7 Formato | 8 Peso aprox. | 9 Depende de entitlement | 10 Depende de pack | 11 Fallback |
|--:|---|---|---|---|---|
| 1 | PNG | pequeno | não | não | — |
| 2 | WebP | ~146 KB/capa | **sim** para 18 | **não hoje** (F2.1a) | require local |
| 3 | PNG · WebP | `NÃO DETERMINADO` | **sim** para 18 | **não hoje** | require local |
| 4 | WebP | ~146 KB/capa | **sim** para 18 | **não hoje** | require local |
| 5 | WebP | ~146 KB/capa | **sim** para 18 | **não hoje** | require local |
| 6 | WebP | ~167 KB/cena | **sim** para 18 | **não hoje** | require local |
| 7 | áudio | `NÃO DETERMINADO` | **sim** para 18 | **não hoje** | require local |
| 8 | PNG | pequeno | não | não | pose canônica |
| 9 | **PNG** (0 WebP) | **278 MB total** | **sim** para 18 | **não hoje** | — |
| 10 | PNG | herda do legado | não (`creation` é livre) | não | — |
| 11 | PNG base64 → `file://` | variável | não | não | base64 transitório |
| 12 | `file://` | variável | não | não | — |
| 13 | PNG · WebP | `NÃO DETERMINADO` | não | não | — |
| 14 | PNG · áudio | `NÃO DETERMINADO` | não | não | — |
| 15 | PNG | `NÃO DETERMINADO` | não | não | — |
| 16 | WebP · áudio | herda | **sim** para 18 | **não hoje** | require local |
| 17 | PNG | `NÃO DETERMINADO` | não | não | — |
| 18 | PNG | `NÃO DETERMINADO` | não | não | — |
| 19 | WebP | ~146 KB | **sim** para 18 | **não hoje** | require local |
| 20 | PNG | pequeno | não | não | — |
| 21 | PNG | `NÃO DETERMINADO` | n/a | não | — |
| 22 | derivado | variável | não | não | — |

### 5.3 · Tabela C — comportamento e prova (eixos 12 a 16)

| # | 12 Sem mídia | 13 Pré-carregamento | 14 Cache · persistência | 15 Auditoria física individual | 16 Evidência |
|--:|---|---|---|---|---|
| 1 | app não abre | Expo | — | histórica (boot) | `COMPROVADO PELO ARQUIVO` |
| 2 | `coming_soon` por mídia | `preloadStoryCoverAssets` | Metro | **não** | `COMPROVADO PELO CÓDIGO` |
| 3 | marcador sem arte | `preloadCriticalAssets` | Metro | histórica (mapa) | `COMPROVADO PELO CÓDIGO` |
| 4 | `coming_soon` por mídia | `preloadStoryCoverAssets` | Metro | **não** | `COMPROVADO PELO CÓDIGO` |
| 5 | bloqueio de abertura | — | Metro | **não** | `COMPROVADO PELO CÓDIGO` |
| 6 | `canOpenStoryMedia` nega | `preloadStorySceneIllustrations` | Metro | histórica (Livrinho) | `COMPROVADO PELO CÓDIGO` |
| 7 | cena sem narração | — | `audioManager` | histórica (áudio) | `COMPROVADO PELO CÓDIGO` |
| 8 | sem celebração | `beniAssetWarmup` (`CONCORRENCIA_WARMUP = 3`) | memória | histórica | `COMPROVADO PELO CÓDIGO` |
| 9 | atividade indisponível | — | Metro | **não** (200 arquivos) | `COMPROVADO PELO DOCUMENTO` |
| 10 | atividade indisponível | — | Metro | histórica (C60) | `COMPROVADO PELO CÓDIGO` |
| 11 | tela vazia | — | `documentDirectory` | histórica (Ateliê) | `COMPROVADO PELO CÓDIGO` |
| 12 | galeria vazia | — | `documentDirectory` | histórica (galeria) | `COMPROVADO PELO CÓDIGO` |
| 13 | jogo indisponível | — | Metro | histórica | `COMPROVADO PELO CÓDIGO` |
| 14 | jogo indisponível | — | Metro | histórica (Palavrinhas) | `COMPROVADO PELO CÓDIGO` |
| 15 | jogo indisponível | — | Metro | `NÃO DETERMINADO` | `COMPROVADO PELO CÓDIGO` |
| 16 | roteiro sem mídia | — | Metro | histórica (Cultinho) | `COMPROVADO PELO CÓDIGO` |
| 17 | baú sem arte | — | Metro | histórica (Baú) | `COMPROVADO PELO CÓDIGO` |
| 18 | selo sem arte | — | Metro | histórica (conquistas) | `COMPROVADO PELO CÓDIGO` |
| 19 | vitrine sem capa | — | Metro | **não** | `COMPROVADO PELO CÓDIGO` |
| 20 | avatar padrão | — | Metro | histórica (perfil) | `COMPROVADO PELO CÓDIGO` |
| 21 | oferta sem arte | — | Metro | histórica (paywall) | `COMPROVADO PELO CÓDIGO` |
| 22 | certificado não gera | — | `file://` | histórica (certificado) | `COMPROVADO PELO CÓDIGO` |

---

## 6 · Leitura consolidada

| Constatação | Valor |
|---|---:|
| Superfícies que consomem mídia | **22** |
| Superfícies `LOCAL NO BUNDLE` | **19** |
| Superfícies `DERIVADO` | **3** (Ateliê, galeria, certificado) |
| Superfícies servidas **hoje** por `INSTALADO NO APARELHO` | **0** — F2.1a mantém o fallback local |
| Superfícies cuja **autorização** depende de entitlement | **8** |
| Packs declarados em `REMOTE_PACKS` | **1** (`story_ruth_naomi`, `not_downloaded`) |
| Payloads de pack **versionados no repositório** | **0** |
| Estado de packs **instalados no aparelho** | **não levantado** |
| Peso de `assets/` após conversão WebP | **456 MB** (era 860 MB) |
| Colorir legado ainda em PNG | **278 MB · 200 PNG · 0 WebP** |

### 6.1 · A tensão central que o Product Lock precisa resolver

O aplicativo tem **duas entregas de mídia simultâneas**:

1. **A que funciona hoje** — tudo no binário, incluindo as 18 `remote`.
2. **A que está implementada mas inativa** — download por pack, com manifesto, verificação e recovery.

O fallback F2.1a mantém as duas vivas ao mesmo tempo. **Nada nesta auditoria diz qual das duas é a
definitiva**, nem quando o fallback deve ser retirado. — `DECISÃO A CONGELAR NA FASE 4`

---

## 7 · Decisões já aprovadas que não podem ser reabertas

1. **Fail-closed** — "Pack no disco NUNCA é autorização" (`accessControl.js:47-49`).
2. **`require()` de asset é sempre literal e relativo** (regra de Metro, `coloring60LocalAssets.js`).
3. **`light` reusa `scene_02.png` diretamente** — sem cópia, sem renomear, sem duplicar arquivo.
4. **`QA_ALLOW_INCOMPLETE_STORIES = false`** (`mediaReadyService.js:35`).
5. **Conversão WebP de cenas e capas** já executada — 435,5 MB → 31,9 MB (−93%).
6. **Base64 é transitório** no pipeline do canvas; não se persiste blob quando há `file://`.

## 8 · Itens não determinados

1. Estado de packs instalados em aparelhos reais — **não levantado**.
2. Quando o fallback F2.1a será retirado.
3. Se o Colorir legado (278 MB PNG) será convertido para WebP.
4. Peso individual dos áudios e formato final.
5. Envelope técnico de dados do SDK RevenueCat — **Fases 5, 18 e 19**.
6. Política de expiração de cache de entitlement.
7. Se packs futuros cobrirão áudio e colorir, ou só cena e capa.

## 9 · Fases proprietárias

| Assunto | Fase |
|---|---|
| Schema definitivo do manifesto e retirada do fallback | **4** |
| Estratégia de entrega de mídia e peso do binário | **4** e **9** |
| Auditoria jurídica do envelope RevenueCat | **5** · **18** · **19** |
| Auditoria física individual de mídia | **11** |
| Conversão do Colorir legado | **não decidida** |

---

*Fim do artefato 11 de 11. Nenhum arquivo de mídia foi movido, copiado, convertido ou versionado.*
