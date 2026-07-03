# F2.1a — Fundação do runtime de packs premium (sandbox/base)

> **Bloco:** F2.1a (Fase 2 §19 — infraestrutura híbrida). **Fundação de código.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD `caffefb`.
> **Regra central:** o app funciona **exatamente como antes** — nada consome os novos
> serviços. Sem download real, sem R2, sem mover/apagar assets, sem tocar telas/loaders.
> **Não commitado, não pushado.**

---

## 1. Resumo executivo

Criei a **fundação isolada** do runtime híbrido de packs: 4 serviços novos +
`@ptf_packs_v1` (índice local) + estados de pack + resolver de mídia — **tudo
desacoplado das telas**. O app segue idêntico (nenhum arquivo fora de `src/services`
importa o runtime). Executa a spec `001-asset-architecture-budget` (T017–T024) em
modo *base*, deixando o **piloto sandbox** (`david_goliath`) pronto para o **F2.1b**.
Gates: **smoke 1454/1454 · doctor 18/18 · audio 200/200**.

---

## 2. Escopo

**Criados:** `src/services/{contentResolver,packStorageService,packIntegrityService,packDownloadService}.js`.
**Editado (aditivo):** `src/services/storageKeys.js` (+`PACKS_INDEX: '@ptf_packs_v1'`),
`scripts/smoke.js` (+7 checks F2.1a).
**Intocado:** `mediaReadyService.js` (não precisou — status de pack vive nos novos
serviços), assets, `storySceneIllustrations`/`storyCovers`/`coloringImages`/`audioManifest`,
telas, rotas, jornada, RevenueCat, Brincar, Beni, colorir, áudio.

---

## 3. Serviços criados e funções exportadas

### `packStorageService.js` — índice local + caminhos
`PACK_STATUS`, `isValidPackStatus`, `getPackLocalDir`, `getPackTempDir`, `getPackIndex`,
`savePackIndex`, `getPackEntry`, `setPackEntry`, `clearPackEntry`, `getPackStatus`.
*Só AsyncStorage (`@ptf_packs_v1`) + construção de caminho (`documentDirectory/packs/<id>@<version>/`). Sem I/O de arquivo destrutivo.*

### `packIntegrityService.js` — validação
`validatePackManifest` (delega a `packManifestService`), `validateFileEntry`,
`validatePackFiles`, `computeFileSha256`.
*Integridade por bytes + existência (expo-file-system). **sha256 preparado com fallback** — `expo-crypto` não instalado (nenhuma dep nova).*

### `packDownloadService.js` — download (preparado)
`DOWNLOAD_FLOW`, `downloadPackFromManifest`, `simulateInstallLocalPack`, `markPackReady`.
*NÃO baixa da rede, NÃO cria pack real. `markPackReady` só atualiza o índice.*

### `contentResolver.js` — resolução de mídia
`RESOLVE_STATUS`, `RESOLVE_SOURCE_TYPE`, `getStoryContentLayer`, `getPackState`,
`canResolveStoryMedia`, `resolveStoryCover`, `resolveStoryScene`, `resolveStoryColoring`,
`resolveStoryAudio`.
*Resolvers **síncronos e puros** (recebem o `packEntry` pré-carregado). **Não consumido por telas.***

---

## 4. Estados de pack (PACK_STATUS)

`included` (starter, no binário) · `not_downloaded` · `downloading` · `verifying` ·
`ready` · `failed` · `needs_update` · `requires_app_update`.

---

## 5. Modelo de CacheEntry (`@ptf_packs_v1`, por storyId)

```js
{
  storyId, version, status,        // status ∈ PACK_STATUS
  localDir,                        // documentDirectory/packs/<id>@<version>/ (ou null)
  manifestPath,                    // localDir + 'manifest.json' (ou null)
  totalBytes, downloadedBytes,     // progresso
  updatedAt,                       // Date.now()
  errorMessage,                    // opcional
}
```
O índice é `{ storyId → CacheEntry }`. `getPackIndex` retorna `{}` quando vazio (nunca lança).

---

## 6. Como o resolver decide (included × remote)

`resolveStoryX(storyId, sceneNumber, packEntry)` → `{ status, sourceType, source, reason }`:

| Camada / estado | status | sourceType | source |
|---|---|---|---|
| **starter** | `included` | `require` | módulo require local |
| **remote + pack ready** | `ready` | `file` | `{ uri: localDir + relPathInPack }` |
| **remote sem pack** (F2.1a) | `not_downloaded` | `require` | **fallback local** (asset ainda bundlado) |
| sem asset local | `error`/`not_downloaded` | `missing` | `null` |

**Chave da não-regressão:** `david_goliath` (remote, sem pack) **cai no fallback local**
→ continua funcionando pelo require atual. Quando um pack ficar `ready`, o resolver
passa a apontar para `file://`. Caminhos no pack seguem a convenção §5.2:
`scenes/<id>_scene_NN.webp`, `coloring/scene_NN.png`, `audio/<id>_scene_NN.mp3`, `cover.webp`.

---

## 7. O que ainda NÃO foi integrado (de propósito)

- **Nenhuma tela** usa o resolver (StoryDetail/Narration/Coloring/Mapa intactos).
- **Nenhum download real** (sem rede/R2). `download*`/`simulateInstall*` são preparados.
- **sha256 real** pendente de dep de crypto aprovada (fallback bytes+existência).
- `david_goliath` **continua no binário** (não extraído).
- Jornada/`getStoryContractStatus` **não** ganhou `packState` ainda (F2.1b).

---

## 8. Riscos

| Risco | Mitigação |
|---|---|
| Resolver síncrono vs índice async | resolvers recebem `packEntry` pré-carregado; F2.1b carrega o índice 1× (contexto) → resolução sync no render. |
| `require` dinâmico impossível | resolvido: starter/fallback = require estático (via `storyImageService`); remote ready = `{uri}`. |
| sha256 sem dep | fallback bytes+existência (suficiente p/ sandbox); hash real só com dep aprovada. |
| Regressão visual | **nenhuma** — runtime isolado (check [F2.1a ISOLADO] garante). |
| Storage/limpeza | índice leve; LRU/remoção reais no F2.1b (packStorageService já tem `clearPackEntry`). |

---

## 9. Plano F2.1b (piloto sandbox — não iniciar agora)

1. `build-manifest.js` (fora do repo): gera `manifest.json` do pack `david_goliath` a partir dos assets atuais.
2. **Sandbox local** (sem R2): `simulateInstallLocalPack` copia de um dir de teste → `documentDirectory/packs/david_goliath@1.0.0/`; `packIntegrityService.validatePackFiles` (bytes+existência); `markPackReady`.
3. Carregar o índice num **PacksContext** (async 1×) e resolver via `contentResolver` (sync).
4. Integração **mínima** de leitura em StoryDetail/Narration (preferir pack quando `ready`, fallback local senão) — **atrás de flag**, sem tirar david do binário ainda.
5. Estender `getStoryContractStatus` com `packState` (contrato A0.10 + eixo pack).
6. **Sem** RevenueCat, **sem** R2 real, **sem** migrar as outras 17, **sem** colorir final.

---

## 10. Rollback

Nada commitado. Reverter = `git checkout -- src/services/storageKeys.js scripts/smoke.js` +
`rm src/services/{contentResolver,packStorageService,packIntegrityService,packDownloadService}.js` +
`rm docs/F2_1A_RUNTIME_PACKS_BASE.md`. Como nada consome os serviços, remover é inócuo.

---

## 11. Gates

**smoke 1454/1454 ✓** (7 checks F2.1a) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**.

---

## 12. Confirmações

- **Nenhum asset alterado.** **Nenhum require de mídia alterado.** **Nenhuma tela alterada.**
- **Comportamento visual do app não mudou** (runtime 100% isolado — auditado).
- **F2.1b não iniciado** (sem download real, sem pack real, sem R2, sem integração de tela).
- **Sem commit, sem push, sem `git add`.**
