# F2.4d.1 — Contrato oficial do `content-manifest.json` global

> **Bloco:** F2.4d.1 (contrato — Opção B, passo 1). **Somente documentação.**
> **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `68fcb5d`.
> Define o **schema oficial** do manifesto global de packs, que será hospedado na raiz do R2
> e consumido pelo app numa etapa posterior (F2.4d.2+). **Este bloco não implementa código,
> não cria o arquivo real e não sobe nada no R2.**
>
> **Precedência:** subordinado a `docs/PROJECT_SOURCE_OF_TRUTH.md` e
> `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md` v2.0. Relacionado:
> [F2.4a](F2_4A_STORAGE_PLAN.md) · [F2.4b](F2_4B_R2_CDN_RUNBOOK.md) ·
> [F2.4c](F2_4C_R2_HTTPS_DEVICE_VALIDATION.md) · [F2.4d.0](F2_4D_0_REMOTE_DOWNLOADER_PLAN.md).

---

## 1. Objetivo do manifesto global

O `content-manifest.json` é o **índice remoto de packs disponíveis**. Ele:

- **aponta** para os packs (id, storyId, versão, `baseUrl`, acesso, metadados);
- **não substitui** o `manifest.json` **por pack**;
- é a porta de entrada: o app lê o índice global, escolhe um pack e então busca o `manifest.json` **daquele** pack.

O **manifesto por-pack** continua sendo a **fonte de verdade dos arquivos internos** (path, bytes, sha256 e kind por mídia). O manifesto global **não** lista arquivos individuais — só descreve **quais packs existem** e **onde**.

```
content-manifest.json (índice)  ──aponta──▶  <baseUrl>/manifest.json (fonte de verdade dos arquivos)
```

---

## 2. Local esperado no R2

```
https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/content-manifest.json
```

> ⚠️ `r2.dev` é **temporário**, para validação técnica. A **produção final exige domínio
> próprio/CDN** (ex.: `https://cdn.pequenostracosdefe.app/content-manifest.json`). Este bloco
> **não** cria nem sobe o arquivo — apenas registra o local planejado.

---

## 3. Estrutura JSON proposta (exemplo completo — david_goliath)

```json
{
  "manifestVersion": 1,
  "generatedAt": "2026-07-04T00:00:00Z",
  "minAppVersion": "1.0.0",
  "packs": [
    {
      "id": "story_david_goliath",
      "storyId": "david_goliath",
      "version": "1.0.0",
      "type": "story",
      "access": "premium",
      "title": "Davi e Golias",
      "bytes": 18532477,
      "baseUrl": "https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/packs/david_goliath/v1/",
      "manifestPath": "manifest.json",
      "manifestSha256": "<sha256 do manifest.json ou pack.sha256>",
      "requiredAppVersion": "1.0.0",
      "mediaKinds": ["cover", "scene", "coloring", "audio"],
      "status": "not_downloaded"
    }
  ]
}
```

---

## 4. Semântica campo a campo

### Nível raiz
| Campo | Tipo | Descrição |
|---|---|---|
| `manifestVersion` | inteiro | Versão do **schema do índice global**. Hoje **`1`**. Muda só se o formato do índice mudar. |
| `generatedAt` | string ISO 8601 | Quando o índice foi gerado (UTC). Usado para diagnóstico/cache. |
| `minAppVersion` | semver | Versão mínima do app para **entender este índice**. Se o app for mais antigo, tratar como incompatível. |
| `packs` | array | Lista de packs disponíveis. Pode ser vazia. |

### Cada item de `packs[]`
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | slug | Id do **pack** (ex.: `story_david_goliath`) — **bate** com `id` do manifesto por-pack. Único no índice. |
| `storyId` | slug | Id da **história** no app (ex.: `david_goliath`) — deve ser **conhecido pelo app**. Único no índice. |
| `version` | semver | Versão **semântica** do pack (`1.0.0`). Usada no **gate** e no `localDir` (`<storyId>@<version>`). |
| `type` | enum | Tipo do pack. Hoje `story` (futuros: `coloring`, `audio`, `bundle`). |
| `access` | enum | `free` \| `premium`. Decide se o app **oferece** download (gate de entitlement adiante). |
| `title` | string | Título legível (ex.: "Davi e Golias"). |
| `bytes` | inteiro > 0 | Tamanho **total** do pack (soma de todas as mídias). Informativo/UX (progresso, aviso de peso). |
| `baseUrl` | url https + `/` final | **Autoritativo** para o path remoto do pack (encapsula `vN`). O manifesto por-pack e as mídias resolvem a partir daqui. |
| `manifestPath` | string | Caminho **relativo** do manifesto por-pack sob `baseUrl`. Hoje sempre `manifest.json`. |
| `manifestSha256` | hex64 | sha256 do `manifest.json` (= âncora `pack.sha256`). Verificação real só com dep de crypto (F2.4e). |
| `requiredAppVersion` | semver | Versão mínima do app para **usar este pack**. Acima da versão instalada → `requires_app_update`, sem baixar. |
| `mediaKinds` | array enum | Mídias contidas no pack (`cover`/`scene`/`coloring`/`audio`). Declara o conteúdo; no F2.4d ainda se baixa só `scene`. |
| `status` | enum | Estado **esperado inicial** (`not_downloaded`). O estado **real** vive em `@ptf_packs_v1` (packStorageService). |

---

## 5. Regras de validação (para o futuro `globalManifestService`)

O serviço leitor (F2.4d.2) deverá aplicar estas regras — **nunca lançando exception**,
retornando sempre um resultado estruturado `{ ok: boolean, errors: string[], data: object|null }`:

**Raiz**
1. `manifestVersion` **deve ser `1`**.
2. `generatedAt` deve ser **string ISO válida**.
3. `minAppVersion` deve **existir** (semver).
4. `packs` deve ser **array** (vazio é válido).

**Por pack**
5. `storyId` deve ser **conhecido pelo app** (existir em `stories.js`/`contentManifest`).
6. `version` deve ser **semver** (`x.y.z`).
7. `baseUrl` deve começar com **`https://`** (em produção) e **terminar com `/`**.
8. `manifestPath` deve ser **`manifest.json`** neste momento.
9. `bytes` deve ser **número positivo**.
10. `mediaKinds` deve conter **somente valores conhecidos** (`cover`/`scene`/`coloring`/`audio`).
11. `access` deve ser **`free`** ou **`premium`**.
12. `requiredAppVersion` **acima da versão do app** → **bloquear download** e indicar **`requires_app_update`** (não é erro de schema; é decisão de disponibilidade).
13. **duplicidade de `storyId`** deve ser **rejeitada**.
14. **duplicidade de `id`** deve ser **rejeitada**.

> Observação: um pack inválido **não** deve derrubar o índice inteiro — o serviço deve
> **isolar** o pack com erro (reportar em `errors`) e ainda permitir usar os packs válidos,
> a decidir na implementação (F2.4d.2). O contrato exige apenas que erros sejam **estruturados
> e não lançados**.

---

## 6. Relação com o `manifest.json` por-pack

- O **`content-manifest.json`** aponta para o pack (via `baseUrl` + `manifestPath`).
- O **`manifest.json` do pack** valida o **conteúdo interno**.
- `baseUrl` + `manifestPath` → resolve a **URL do manifesto por-pack**
  (ex.: `…/packs/david_goliath/v1/` + `manifest.json`).
- Os **`files[]`** do manifesto por-pack continuam definindo **`path`, `bytes`, `sha256` e `kind`** de cada mídia.
- O app **não** monta `/v1/` a partir de `version` — **`baseUrl` é autoritativo** para o path.

```
índice global ─(baseUrl + manifestPath)─▶ manifest.json do pack ─(files[])─▶ mídias (path/bytes/sha256/kind)
```

---

## 7. Relação `version` (1.0.0) versus path (`v1`)

Decisão registrada:

- **`version`** é **semver** e será usada no **gate do app** e no **`localDir`** (`david_goliath@1.0.0`).
- **`v1`** é parte do **path remoto** e fica **encapsulado em `baseUrl`**.
- O app **não deriva `v1` de `1.0.0`** neste momento — `baseUrl` já traz o path pronto.

Isso elimina qualquer ambiguidade entre a versão semântica (gate/local) e o segmento de path remoto (major).

---

## 8. Acesso e entitlement

- `access: "premium"` **não libera download por si só**.
- No **F2.4d.2 e F2.4d.3** o consumo será **dev-gated** (`__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX`).
- **Entitlement real** fica para **etapa futura com RevenueCat** (F2.4f) — não neste bloco.
- **Não oferecer download premium para usuário Free** no app final.
- **Não prometer DRM** — R2 não é DRM; a proteção é por entitlement + domínio próprio + paths não triviais.

---

## 9. Cache e atualização

- **Manifesto global** = **cache curto + `ETag`** (revalidação). É o único arquivo que muda ao publicar packs novos.
- **Packs versionados** = **cache longo e imutável** (`/v1/` nunca muda; nova versão = novo path).
- **Rollback** = reapontar o manifesto global para a **versão anterior** do pack.
- **Nunca apagar a versão antiga antes de a nova estar `ready`** (troca segura).

---

## 10. Limitações deste contrato

Este bloco **não**:

- cria o arquivo `content-manifest.json` real;
- sobe nada no R2;
- implementa `globalManifestService`;
- implementa downloader genérico;
- altera o app / entitlement;
- remove assets do bundle.

É **apenas o schema oficial** e suas regras, para orientar a implementação seguinte.

---

## 11. Próximos passos

- **F2.4d.2:** criar `globalManifestService` **read-only** para **buscar e validar** este contrato — **ainda sem baixar packs**.
- **F2.4d.3:** baixador **genérico por storyId**, ainda **dev-gated**.
- **F2.4d.4:** `PackSandboxDevScreen` usando o manifesto global para obter a `baseUrl` de `david_goliath` (em vez de digitar).

---

## 12. Git status (contrato)
- Working tree **limpo** (só este documento novo); **nenhum código alterado**.
- **Sem commit, push ou `git add`** neste bloco (aguarda autorização).
