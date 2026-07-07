# Tasks — Bloco 1: Persistência `file://` absoluto de desenhos e artes

> **Feature:** `004-persistencia-file-uri` · **Etapa SDD:** 5 (Tasks) + 6 (Analyze). **Portão Humano 3: APROVADO por Eduardo (2026-07-07).**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `b1b82e8` · Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md).
> Ordem: **T1 → T2 → T3 → T4 → T5 → T6 → T7**. Commit/push só com autorização.

## T1 — Helper puro + wrapper · `src/services/fileBlobStore.js`
- `recomposeBlobUri(oldUri, currentBlobsRoot)` puro/param-based (9 reqs): não-string → inalterado; data URL → inalterado; `file://` fora de `ptf_blobs/` → inalterado; `ptf_blobs/` → sufixo + `currentBlobsRoot`; `!currentBlobsRoot` → inalterado; idempotente/no-op; sem `getInfoAsync`/`setItem`/`removeItem`/`deleteBlob`; não muda v3; não apaga; não migra.
- `currentBlobsRoot()` = wrapper fino de `blobsRoot()` (sem lógica extra).

## T2 — Boundary A · `src/services/fileBlobStore.js`
- `readBlobAsDataUrl`: `getInfoAsync(old)` existe → lê old; senão `recomposeBlobUri(old, currentBlobsRoot())` → `getInfoAsync(new)` existe → lê new; senão `null`. Sem mutação.

## T3 — Boundary B / Ateliê · `src/services/atelierStorage.js`
- `resolveArtPreviewUri`/`resolveArtThumbUri`: `recomposeBlobUri(previewUri|thumbnailUri, currentBlobsRoot())` eager, **síncrono**. `*Base64` intactos.

## T4 — Boundary B / Baú · `src/services/beniChestService.js`
- `resolveCardImageSource`: `return { uri: recomposeBlobUri(card.uri, currentBlobsRoot()) }`.

## T5 — Boundary B / childArt · `src/services/storyImageService.js`
- `getBookPageImageSource`: aplicar `recomposeBlobUri(...)` nas devoluções de `childArt.previewUri`/`thumbnailUri`/`uri`; `*Base64` → no-op.

## T6 — Testes · `scripts/smoke.js`
- Helper puro (strings): não-string/data URL/externo inalterados; `ptf_blobs` recompõe; idempotência; no-op.
- Boundary A: fileBlobStore REAL + `expo-file-system/legacy` mockado → 3 casos + ordem antigo→recompor→recomposto.
- Boundary B: retorno **string** (não thenable) + recomposição + `previewBase64` preservado.
- Não-mutação: spies `setItem`/`removeItem`/`deleteBlob` → 0 nos caminhos de leitura.
- Delegação: `drawingStorage.resolvePointer` ainda chama `readBlobAsDataUrl`.

## T7 — Gates + verificação
- `git diff --check`; `npm run smoke`; `npx expo-doctor`; `git status`; resumo; comportamento antes/depois; checks novos; `drawingStorage.js`/`StoryBookScreen.js` fora do diff. **Device (aceite):** troca de container iOS → Livrinho/Galeria/Baú leem.

## T8 — Commit atômico seletivo (só com autorização)
`fileBlobStore.js` + `atelierStorage.js` + `beniChestService.js` + `storyImageService.js` + `scripts/smoke.js` (+ specs/004). Sem push sem autorização.

## Paradas obrigatórias (parar e reportar ANTES de editar)
1. Qualquer função precisar virar **async**.
2. Precisar tocar **`drawingStorage.js`**.
3. Precisar tocar **pipeline de gravação** (`writeBlob`/`buildPointer`/`saveArt`).
4. Precisar tocar **`StoryBookScreen.js`**.
5. Surgir **import cycle** real.

## Analyze — rastreabilidade e confirmações
Aceite→task: 1→T1/T2/T3-5; 2→T2; 3→T3; 4→T4; 5→T1/T6; 6→T1/T6; 7→T2-5/T6; 8→T6; 9→T6; 10→T1/T6. Confirmações: drawingStorage fora do diff (nenhuma task o toca; T6 assere delegação + ausência no diff); Boundary B síncrono (T6 assere retorno string); não-mutação (T6 spies===0); helper preserva data URL/externo (T1 req1/3 + T6). Sem import cycle (`fileBlobStore` é folha). CONSISTENTE, sem `[NEEDS CLARIFICATION]`.
