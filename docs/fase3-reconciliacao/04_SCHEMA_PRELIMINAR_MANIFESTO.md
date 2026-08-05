# 04 · Schema preliminar do manifesto

> **Artefato 4 de 11 — E015 · Fase 3G · Reconciliação**

| Campo | Valor |
|---|---|
| **Estado** | **PRELIMINAR PARA PRODUCT LOCK** |
| **Base auditada** | E009 a E014 |
| **Branch** | `integrate/colorir-canonical-runtime` |
| **HEAD** | `015c438106538595b592981fbe1b80b1d5d65e55` |
| **Data** | 5 de agosto de 2026 |

---

## 0 · Declaração de natureza

**Este artefato não implementa funcionalidade e NÃO ALTERA O MANIFESTO REAL.**
Nenhum arquivo de `src/`, nenhum schema executável e nenhum contrato JSON foi modificado.
Este documento **descreve** o que existe e **propõe** o que ainda não existe, mantendo os dois
planos separados por rótulo em **todos** os 34 itens.

### 0.1 · As três marcações usadas em todo o artefato

| Marcação | Significado |
|---|---|
| **`MANIFESTO ATUAL`** | Já existe e é validado por código no HEAD canônico. Não é proposta. |
| **`SCHEMA PRELIMINAR`** | Proposta técnica de E015. Não existe no código. Não vincula ninguém. |
| **`DECISÃO A CONGELAR NA FASE 4`** | Escolha editorial ou de produto que E015 **não** decide. |

---

## 1 · Fontes técnicas principais

| Fonte | Papel |
|---|---|
| `src/services/globalManifestService.js` | Valida o **índice global** (`content-manifest.json`) |
| `src/services/packManifestService.js` | Valida o **manifesto por pack** (`manifest.json`) |
| `specs/001-asset-architecture-budget/contracts/pack-manifest.schema.json` | Contrato espelhado em JS puro |
| `docs/F2_4D_1_GLOBAL_MANIFEST_CONTRACT.md` | Contrato do índice global (F2.4d.1) |
| `src/data/contentManifest.js` | Camada declarativa de distribuição |
| `src/data/audioManifest.js` | Manifesto de áudio derivado (produto cartesiano) |
| `src/services/packIntegrityService.js:34` | Delega a validação de schema ao validador existente |

---

## 2 · Correções metodológicas herdadas de E014

Formulações **incorretas** de E014 que este artefato **não** repete:

| # | Formulação incorreta | Formulação correta adotada aqui |
|--:|---|---|
| 1 | "Todas as chamadas de rede são GET." | Existem **três pontos explícitos de fetch** para manifestos e mídia e uma integração externa com o SDK RevenueCat. O método HTTP interno do SDK **não é determinado** pelo código do aplicativo. |
| 2 | "Nenhum dado da criança sai do aparelho." | Não existe **upload explícito** de conteúdo infantil no código do aplicativo. A integração RevenueCat existe e seu envelope técnico de dados precisa de auditoria jurídica e técnica nas **Fases 5, 18 e 19**. |
| 3 | "As dezoito histórias premium funcionam integralmente offline." | A **mídia local existe**, mas o **acesso depende do entitlement**. Separar mídia, autorização, cache válido e pack instalado. |
| 4 | "Asset entregue por pack = zero." | **Zero payloads de pack ficam versionados no repositório.** O estado de packs **instalados no aparelho** é independente e não foi levantado nesta auditoria. |
| 5 | "Zero mídia validada fisicamente." | **Zero auditorias físicas individuais** dos 200 arquivos. Preservar validações físicas históricas dos fluxos que consumiram mídia, packs, áudio e recovery. |

> Aplicação direta a este artefato: o campo `access` do índice global (item 6) **declara** o plano
> do pack, mas **não concede** entitlement — ver item 32.

---

## 3 · Os quatro manifestos que já existem

| Manifesto | Arquivo | Versão | Validado por | Classificação |
|---|---|---|---|---|
| **Índice global de packs** | `content-manifest.json` (remoto) | `manifestVersion: 1` | `globalManifestService.js` | `COMPROVADO PELO CÓDIGO` |
| **Manifesto por pack** | `manifest.json` (dentro do pack) | `schemaVersion: 1` | `packManifestService.js` | `COMPROVADO PELO CÓDIGO` |
| **Camada de distribuição** | `src/data/contentManifest.js` | sem versão | — (dado estático) | `COMPROVADO PELO CÓDIGO` |
| **Manifesto de áudio** | `src/data/audioManifest.js` | sem versão | — (derivado) | `COMPROVADO PELO CÓDIGO` |

> **Relação entre os dois primeiros** (`globalManifestService.js:5-7`, verbatim): o índice global
> "NÃO substitui o manifest.json por-pack (que continua sendo a fonte de verdade dos arquivos
> internos)". — `COMPROVADO PELO CÓDIGO`

---

## 4 · Os 34 itens do schema

### Bloco I — Identidade e versionamento

#### 1 · Versionamento do schema
- **`MANIFESTO ATUAL`** — dois campos independentes: `manifestVersion` (raiz do índice global, deve ser exatamente `1`, `globalManifestService.js:76-78`) e `schemaVersion` (raiz do manifesto por pack, deve ser exatamente `1`, `packManifestService.js:67`). Divergência é **erro fatal** em ambos.
- **`SCHEMA PRELIMINAR`** — manter os dois eixos separados; **não** unificar num único número.

#### 2 · Identificador do pack (`id`)
- **`MANIFESTO ATUAL`** — índice global: string não vazia, **duplicidade é erro fatal** de integridade cruzada (`:113-115`). Manifesto por pack: slug `^[a-z0-9_]+$` (`packManifestService.js:68`).
- **`SCHEMA PRELIMINAR`** — alinhar o índice global ao mesmo regex de slug; hoje ele aceita qualquer string não vazia.

#### 3 · `storyId`
- **`MANIFESTO ATUAL`** — índice global: string obrigatória; **duplicidade é fatal**; se desconhecido pelo app vira defeito por-pack e **exclui só aquele pack** (`:117-124`). Os conhecidos vêm de `Object.keys(STORY_CONTENT_LAYER)` — os **mesmos 20** de `stories.js`. Manifesto por pack: `metadata.storyId` como slug.
- **`SCHEMA PRELIMINAR`** — exigir que `id` derive de `storyId` por convenção (`story_<storyId>`), como já ocorre em `REMOTE_PACKS` (`contentManifest.js:57`).

#### 4 · Versão do pack (`version`)
- **`MANIFESTO ATUAL`** — semver estrito `^\d+\.\d+\.\d+$` nos dois manifestos.
- **`SCHEMA PRELIMINAR`** — definir a semântica de *major* (quebra de compatibilidade de arquivos) versus *patch* (recompressão sem mudança de conteúdo).
- **`DECISÃO A CONGELAR NA FASE 4`** — política de reedição de conteúdo já publicado.

#### 5 · Tipo do pack (`type`)
- **`MANIFESTO ATUAL`** — **divergência real entre os dois schemas**: índice global aceita **apenas** `story` (`KNOWN_PACK_TYPES = ['story']`, `:25`); manifesto por pack aceita `story`, `coloring`, `audio`, `bundle` (`packManifestService.js:16`). — `COMPROVADO PELO CÓDIGO`
- **`SCHEMA PRELIMINAR`** — reconciliar as duas listas antes de publicar qualquer pack não-`story`.

#### 6 · Nível de acesso (`access`)
- **`MANIFESTO ATUAL`** — índice global: `free` ou `premium` (`:24`). **Campo declarativo do catálogo, não autorização.**
- **`SCHEMA PRELIMINAR`** — documentar explicitamente no contrato que `access` é metadado de vitrine.
- Ver item 32 — **`accessControl.js:47-49`**: "Pack no disco NUNCA é autorização".

#### 7 · Título (`title`)
- **`MANIFESTO ATUAL`** — índice global: string não vazia (`:129`); manifesto por pack: `metadata.title` obrigatório.
- **`SCHEMA PRELIMINAR`** — definir qual dos dois títulos vence quando divergirem.
- **`DECISÃO A CONGELAR NA FASE 4`** — título canônico exibível.

#### 8 · Tamanho declarado (`bytes`)
- **`MANIFESTO ATUAL`** — índice global: inteiro **positivo** obrigatório (`:130`).
- **`SCHEMA PRELIMINAR`** — declarar se `bytes` é o tamanho comprimido do payload ou o descomprimido.
- **`NÃO DETERMINADO`** — a auditoria não estabeleceu essa correspondência.

### Bloco II — Localização e transporte

#### 9 · `baseUrl`
- **`MANIFESTO ATUAL`** — obrigatória; **deve terminar com `/`**; **exige `https://`** em produção, aceitando `http://` só sob `allowHttp` explícito ou `__DEV__` (`:132-141`, `:196`).
- **`SCHEMA PRELIMINAR`** — proibir `allowHttp` em builds de produção por construção, não por convenção.

#### 10 · `manifestPath`
- **`MANIFESTO ATUAL`** — valor **literal obrigatório** `"manifest.json"` (`:143`). Qualquer outro valor exclui o pack.
- **`SCHEMA PRELIMINAR`** — manter fixo; a flexibilidade não traz benefício e amplia superfície de ataque.

#### 11 · `manifestSha256`
- **`MANIFESTO ATUAL`** — **opcional**; se presente, hex de 64 caracteres (`:145-147`).
- **`SCHEMA PRELIMINAR`** — **tornar obrigatório**. Hoje um manifesto de pack pode ser aceito sem verificação de integridade na origem.
- **`DECISÃO A CONGELAR NA FASE 4`** — se a obrigatoriedade vale retroativamente para packs já publicados.

#### 12 · Versão mínima de app (`minAppVersion` / `requiredAppVersion`)
- **`MANIFESTO ATUAL`** — três campos distintos: `minAppVersion` na raiz do índice global (semver, **fatal**), `requiredAppVersion` por pack (semver, **fatal**) e `minAppVersion` no manifesto por pack. Incompatibilidade de versão **não é erro de schema**: gera `warning` e a flag `requiresAppUpdate` (`:162-176`).
- **`SCHEMA PRELIMINAR`** — unificar a nomenclatura; três nomes para o mesmo conceito é fonte de erro.

#### 13 · `mediaKinds`
- **`MANIFESTO ATUAL`** — array **não vazio** com valores em `['cover','scene','coloring','audio']` (`:23`, `:153-158`).
- **`SCHEMA PRELIMINAR`** — declarar se a ausência de um *kind* significa "não existe" ou "não solicitado". Hoje `packDownloadService.js:136` usa `requestedKinds = ['scene']` como padrão — **só cenas por omissão**.

#### 14 · `status`
- **`MANIFESTO ATUAL`** — **opcional**; se presente, um de oito valores: `not_downloaded`, `downloading`, `verifying`, `ready`, `failed`, `needs_update`, `requires_app_update`, `included` (`:26-29`).
- **`SCHEMA PRELIMINAR`** — **remover do índice remoto**. `status` descreve o estado **no aparelho**; um índice de servidor não tem como conhecê-lo. Manter apenas no estado local (`packStorageService`).

#### 15 · `generatedAt`
- **`MANIFESTO ATUAL`** — ISO 8601 validado por regex **e** por `Date.parse`; **ausência ou invalidez NÃO é fatal** — gera apenas warning (decisão explícita do Bloco 3, `:79-80`).
- **`SCHEMA PRELIMINAR`** — manter não-fatal; usar apenas para diagnóstico.

### Bloco III — Arquivos do pack

#### 16 · Lista `files`
- **`MANIFESTO ATUAL`** — array com **pelo menos 1 item** (`packManifestService.js:80`). Um pack vazio é inválido.

#### 17 · `path` por arquivo
- **`MANIFESTO ATUAL`** — string obrigatória; **não pode começar com `/`**; **não pode conter `..`** (`:41-42`); duplicidade dentro do mesmo pack é erro (`:88`). Proteção explícita contra *path traversal*. — `COMPROVADO PELO CÓDIGO`

#### 18 · `bytes` por arquivo
- **`MANIFESTO ATUAL`** — inteiro `>= 0` (`:44`). **Zero é aceito** por arquivo.
- **`CORREÇÃO DE E016`** — a redação anterior comparava este campo com `p.bytes` do índice global. A comparação era **improcedente**: `file.bytes` descreve **um arquivo**, `p.bytes` descreve **o pacote inteiro**. Níveis diferentes podem ter regras diferentes sem contradição. A divergência real é `p.bytes` × `totalBytes` — ver item 22 e `P-132` no artefato 09.

#### 19 · `sha256` por arquivo
- **`MANIFESTO ATUAL`** — **obrigatório**, hex de 64 caracteres (`:45-47`). Diferente do `manifestSha256` do índice global, que é opcional (item 11).

#### 20 · `kind` por arquivo
- **`MANIFESTO ATUAL`** — um de `['scene','coloring','audio','cover','other']` (`:17`). **Inclui `other`**, ausente da lista do índice global (item 13) — segunda divergência entre os dois schemas. — `COMPROVADO PELO CÓDIGO`

#### 21 · Dimensões (`width`, `height`, `ratio`)
- **`MANIFESTO ATUAL`** — todas **opcionais**; se presentes, `width`/`height` inteiros `>= 1` e `ratio` string (`:49-57`).
- **`SCHEMA PRELIMINAR`** — tornar obrigatórias para `kind: 'scene'` e `kind: 'cover'`, onde a proporção 16/9 já é premissa do catálogo (`stories.js`, `coverAspectRatio: 16/9`).

#### 22 · `totalBytes` e conferência de soma
- **`MANIFESTO ATUAL`** — inteiro `>= 0` (`:76-78`) **e** obrigatoriamente igual à soma de `files[].bytes`; divergência é erro explícito (`:93-95`). Validação de consistência interna real. — `COMPROVADO PELO CÓDIGO`
- **`CORREÇÃO DE E016`** — este é o campo que descreve o mesmo fato que `p.bytes` do índice global (`globalManifestService.js:130`, inteiro **positivo**). São dois números de nível de pacote com **regras distintas** e **nunca comparados entre si**: `packDownloadService.js:73` lê apenas `manifest.totalBytes`. Registrado como `P-132`.

#### 23 · `metadata.title`
- **`MANIFESTO ATUAL`** — string não vazia obrigatória (`:102`).

#### 24 · `metadata.storyId`
- **`MANIFESTO ATUAL`** — slug `^[a-z0-9_]+$` obrigatório (`:103-105`).
- **`SCHEMA PRELIMINAR`** — validar cruzamento com o `storyId` do índice global; hoje **nada verifica** que os dois coincidem.

#### 25 · `metadata.language`
- **`MANIFESTO ATUAL`** — string não vazia obrigatória (`:106-108`); **nenhum valor é validado** contra lista.
- **`SCHEMA PRELIMINAR`** — restringir a tags BCP-47.
- **`DECISÃO A CONGELAR NA FASE 4`** — quais idiomas o produto suporta.

#### 26 · `metadata.coverPath`
- **`MANIFESTO ATUAL`** — string **ou ausente** (`:109-111`); quando presente, **não é verificado** contra `files[]`.
- **`SCHEMA PRELIMINAR`** — exigir que aponte para um `path` existente em `files[]` com `kind: 'cover'`.

### Bloco IV — Integridade, falha e política

#### 27 · Unicidade e integridade cruzada
- **`MANIFESTO ATUAL`** — `id` duplicado e `storyId` duplicado são **erros fatais** que derrubam o manifesto inteiro; o registro em `seenIds`/`seenStoryIds` acontece **antes** da decisão de exclusão, justamente para que um duplicado permaneça fatal mesmo se o pack tiver outro defeito (`:107-124`, ajuste de precisão F2.4d.1 §5). — `COMPROVADO PELO CÓDIGO`

#### 28 · Tolerância a defeito por-pack
- **`MANIFESTO ATUAL`** — decisão arquitetural explícita (Bloco 3, `:99-101`): defeito **interno** de um pack vira **warning** e **exclui apenas aquele pack**, mantendo `ok: true` com o subconjunto válido. Só erros de **raiz** e de **integridade cruzada** são fatais.
- **`SCHEMA PRELIMINAR`** — preservar. É o comportamento correto para um catálogo que cresce.

#### 29 · Política de transporte
- **`MANIFESTO ATUAL`** — `https` exigido em produção; `http` só sob flag de desenvolvimento (itens 9 e 12).
- **Correção de E014 aplicada** — existem **três pontos explícitos de fetch** (índice global, manifesto de pack, mídia) mais o SDK RevenueCat, cujo **método HTTP interno não é determinado pelo código do aplicativo**.

#### 30 · Timeout e falha de rede
- **`MANIFESTO ATUAL`** — timeout padrão de **10 000 ms**, configurável (`:203`); `AbortController` é usado **sob `typeof`-guard** porque não é garantido no runtime (`:207`, confirmado em `useStoryPackDownload.js:37`). Falhas retornam `{ ok:false, errors:[…] }` — **a função nunca lança** (`:11`, `:220-227`). Distingue `timeout` de `rede indisponível`. — `COMPROVADO PELO CÓDIGO`
- **`SCHEMA PRELIMINAR`** — política de retentativa e *backoff* ainda **`NÃO DETERMINADA`**.

#### 31 · Camada de conteúdo (`starter` / `remote` / `coming_soon`)
- **`MANIFESTO ATUAL`** — `contentManifest.js` declara 2 `starter` (`creation`, `noah`) e **18 `remote`**; **nenhuma** história está em `coming_soon` hoje (`:43-50`). O módulo declara-se **eixo separado** do gate de runtime e afirma que "NADA consome este módulo ainda" (`:9-11`) — mas `globalManifestService.js:14,48` **importa `STORY_CONTENT_LAYER`** para derivar os `storyIds` conhecidos.
- **Registro de divergência:** o comentário de cabeçalho está **desatualizado**. Levantado por E015 como `E015-N18` e reconciliado no artefato 09 como **`AMPLIA P-110`** — **não** recebeu código novo, porque `P-110` (E014) já é "comentários *stale* em 5 módulos + 4 documentos". — `COMPROVADO PELO CÓDIGO`

#### 32 · Relação com entitlement
- **`MANIFESTO ATUAL`** — o manifesto **descreve** conteúdo; **não concede** acesso. `accessControl.js:47-49` é explícito: **"Pack no disco NUNCA é autorização."** `saveEntitlement` é o único writer de `@ptf_entitlement_v1`, e a política é *fail-closed*.
- **Correção de E014 aplicada** — a mídia local das 18 premium existe, **mas o acesso depende do entitlement**. Mídia, autorização, cache válido e pack instalado são **quatro estados distintos**.
- **`SCHEMA PRELIMINAR`** — nenhum campo de manifesto deve jamais ser lido como concessão.

#### 33 · `REMOTE_PACKS` declarados
- **`MANIFESTO ATUAL`** — **um único** pack declarado: `story_ruth_naomi`, `status: 'not_downloaded'` (`contentManifest.js:55-63`). Declaração sem URL real e sem fetch.
- **Correção de E014 aplicada** — **zero payloads de pack versionados no repositório**; o estado de packs **instalados no aparelho** é independente e **`NÃO DETERMINADO`** por esta auditoria.

#### 34 · Evolução do schema
- **`MANIFESTO ATUAL`** — ambos os schemas exigem versão **exatamente `1`**; não há caminho de migração implementado. Um `manifestVersion: 2` seria rejeitado integralmente.
- **`SCHEMA PRELIMINAR`** — definir política de compatibilidade (aceitar `<= N` com degradação, ou rejeitar) **antes** da primeira publicação real.
- **`DECISÃO A CONGELAR NA FASE 4`** — janela de suporte a versões antigas de app.

---

## 5 · Divergências entre os dois schemas (resumo)

| # | Aspecto | Índice global | Manifesto por pack |
|--:|---|---|---|
| 1 | `type` aceito | apenas `story` | `story`, `coloring`, `audio`, `bundle` |
| 2 | *kinds* aceitos | `cover`, `scene`, `coloring`, `audio` | + `other` |
| 3 | `sha256` | opcional (`manifestSha256`) | **obrigatório** por arquivo |
| 4 | Tamanho **do pacote** | `p.bytes` inteiro **positivo** (`globalManifestService.js:130`) | `totalBytes` inteiro **`>= 0`** (`packManifestService.js:76-78`) |
| 5 | Formato do `id` | qualquer string não vazia | slug `[a-z0-9_]` |
| 6 | Nome da versão mínima | `minAppVersion` + `requiredAppVersion` | `minAppVersion` |

> **Correção de E016 na linha 4.** A redação de E015 comparava `p.bytes` (pacote inteiro, no
> índice) com `file.bytes` (arquivo individual, no pack). Eram **níveis diferentes** — a
> comparação não caracterizava divergência. A divergência real, mantida acima, é `p.bytes` ×
> `totalBytes`: dois números do mesmo nível, com regras distintas e **nunca comparados entre si**
> (`packDownloadService.js:73` lê apenas `manifest.totalBytes`). Ver artefato 09 §2 (D6) e §4.1.

Todas `COMPROVADO PELO CÓDIGO`. Encaminhadas ao artefato 09, onde **as seis** receberam código
canônico — três na reconciliação de E015 e três na ETAPA 4 de E016:

| # desta tabela | Destino no artefato 09 | Atribuído em |
|--:|---|---|
| 3 (`sha256` opcional) | **`P-120`** (origem `E015-N11`) | E015 |
| 1 (`type` divergente) | **`P-121`** (origem `E015-N12`) | E015 |
| 2 (*kind* `other`) | **`P-122`** (origem `E015-N13`) | E015 |
| 4 (tamanho do pacote) | **`P-132`** | E016 · ETAPA 4 |
| 5 (formato do `id`) | **`P-133`** | E016 · ETAPA 4 |
| 6 (nome da versão mínima) | **`P-134`** | E016 · ETAPA 4 |

Nenhum código foi criado automaticamente: cada uma das três foi comparada com `P-01` a `P-131` e
só recebeu código por **não** duplicar nem ampliar risco existente. A lacuna registrada em E015 —
"sem código atribuído, para E016" — está **fechada**.

---

## 6 · Decisões já aprovadas que não podem ser reabertas

1. **Nenhuma dependência nova de validação de schema.** Ambos os validadores são JS puro por decisão constitucional (`packManifestService.js:5-6`).
2. **Validadores nunca lançam** — sempre retornam resultado estruturado.
3. **`https` obrigatório em produção.**
4. **Pack no disco não é autorização** (`accessControl.js:47-49`).
5. **Manifesto por pack é a fonte de verdade dos arquivos internos**; o índice global não o substitui.
6. **Tolerância por-pack** com fatalidade restrita a raiz e integridade cruzada.

## 7 · Itens não determinados

1. Se `bytes` é comprimido ou descomprimido (item 8).
2. Política de retentativa e *backoff* (item 30).
3. Estado de packs instalados em aparelhos reais (item 33).
4. Estratégia de migração de versão de schema (item 34).
5. Se algum `content-manifest.json` real já foi publicado e validado contra este schema — **não observado**.

## 8 · Fases proprietárias

| Assunto | Fase |
|---|---|
| Congelamento do contrato de manifesto | **4** |
| Produção e publicação de packs | **5** |
| Reconciliação dos dois schemas | **4** (decisão) · **9** (implementação) |
| Auditoria do envelope de dados RevenueCat | **5, 18 e 19** |

---

*Fim do artefato 4 de 11. Nenhum schema executável foi criado ou alterado.*
