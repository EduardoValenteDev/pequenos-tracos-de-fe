# Data Model — Arquitetura de Assets (Fase 1)

> Modelo conceitual (WHAT). Não é código. Schema formal do manifesto: [contracts/pack-manifest.schema.json](./contracts/pack-manifest.schema.json).

## Entidades

### ContentLayer (camada de conteúdo)
Classifica de onde vem o conteúdo de uma história/recurso.
- **values**: `starter` | `remote` | `coming_soon`
- **regras**: `starter` ⇒ no binário, offline desde a instalação; `remote` ⇒ pack baixável; `coming_soon` ⇒ só catálogo (0 bytes no app).

### Pack
Unidade distribuível de conteúdo.
| Campo | Tipo | Regra |
|---|---|---|
| `id` | string (slug) | único; estável; ex.: `story_ruth_naomi` |
| `version` | string (semver) | muda a cada republicação de conteúdo |
| `type` | enum | `story` \| `coloring` \| `audio` \| `bundle` |
| `layer` | ContentLayer | `remote` para packs baixáveis |
| `status` | enum | `not_downloaded` → `downloading` → `verifying` → `ready` / `failed` |
| `manifestUrl` | string (url) | origem do manifesto (R2) |
| `installedVersion` | string \| null | versão instalada no device |
| `totalBytes` | number | soma dos arquivos |
| `installedAt` | iso8601 \| null | quando ficou `ready` |
| `localDir` | string (file://) \| null | `documentDirectory/packs/<id>@<version>/` |

**Relationships**: `Pack 1—N FileEntry` (via manifesto); `Pack N—1 Story` (um pack serve uma ou mais histórias por `metadata.storyId`).

**State transitions**:
```
not_downloaded → downloading → verifying → ready
                      ↓             ↓
                    failed ←——————— (hash/bytes inválidos)
ready → (remoção pelo responsável) → not_downloaded
ready → (nova version publicada) → downloading (instala lado a lado, troca atômica)
```

### PackManifest
Descritor **versionado** de um Pack (baixado antes dos arquivos).
| Campo | Tipo | Regra |
|---|---|---|
| `schemaVersion` | integer | versão do **schema** do manifesto (compat do parser) |
| `id`, `version`, `type` | — | espelham o Pack |
| `minAppVersion` | string (semver) | app abaixo disso recusa o pack |
| `totalBytes` | number | soma de `files[].bytes` |
| `files` | FileEntry[] | lista completa esperada |
| `metadata` | objeto | `title`, `storyId`, `language` (ex.: `pt-BR`), opcional `coverPath` |

**Validation**: `schemaVersion` suportado; `minAppVersion` ≤ versão do app; `sum(files.bytes) == totalBytes`; todo `files[].path` único.

### FileEntry
Arquivo individual dentro de um pack.
| Campo | Tipo | Regra |
|---|---|---|
| `path` | string | relativo ao pack; sem `..`; único |
| `bytes` | number | tamanho esperado |
| `sha256` | string (hex 64) | integridade |
| `kind` | enum | `scene` \| `coloring` \| `audio` \| `cover` \| `other` |
| `width`,`height` | number \| null | dimensões (imagens) |
| `ratio` | string \| null | ex.: `4:5`; usado para validar contrato visual |

**Validation**: imagens de `kind` `scene`/`coloring` SHOULD ter `ratio` `4:5`; divergência ⇒ marcada para **aprovação visual** (não esticar/cortar).

### CacheEntry (índice local — AsyncStorage `@ptf_packs_v1`)
Estado persistido por pack instalado.
- `{ id, installedVersion, status, totalBytes, installedAt, lastUsedAt }`
- `lastUsedAt` alimenta a **limpeza LRU**.

## Regras de negócio derivadas dos requisitos

- **FR-015/016**: `starter` no binário; `remote` distinto e baixável.
- **FR-017/SC-009**: `ready` ⇒ disponível offline até remoção explícita; `lastUsedAt` para LRU.
- **FR-018**: todo `remote` exige `PackManifest` versionado válido antes de baixar arquivos.
- **FR-019/SC-010**: transição `verifying → ready` só com **todos** os `sha256`/`bytes` confirmados.
- **FR-020**: `FileEntry.ratio`/dimensões habilitam a checagem de 4:5 e o gate de flood-fill (no pipeline de otimização).
- **FR-021**: `manifestUrl`/entrega são agnósticas a provedor; entitlement (RevenueCat) e URLs assinadas plugam sem mudar o modelo.

## Resolução de mídia (contentResolver — conceitual)

```
resolve(storyId, sceneKey):
  if story.layer == 'starter'      → require estático (binário)
  elif pack(storyId).status=='ready' → file:// no localDir
  else                              → fallback seguro (placeholder/"em breve")
```
Espelha o padrão atual de `storyImageService`/`drawingStorage` (fonte única, fallback sem travar).
