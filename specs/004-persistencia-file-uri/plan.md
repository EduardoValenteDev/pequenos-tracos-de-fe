# Plan — Bloco 1: Persistência `file://` absoluto de desenhos e artes

> **Feature:** `004-persistencia-file-uri` · **Etapa SDD:** 4 (Plan). **Portão Humano 2: APROVADO por Eduardo (2026-07-07).**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `b1b82e8` · Spec: [spec.md](./spec.md).

## Decisões aprovadas (Portão 2)
1. Helper puro param-based `recomposeBlobUri(oldUri, currentBlobsRoot)`.
2. Wrapper fino `currentBlobsRoot()` = wrapper de `blobsRoot()`, sem lógica extra.
3. Boundary A (`readBlobAsDataUrl`): antigo → se existe lê antigo; senão recompõe → se recomposto existe lê recomposto; senão `null`. Sem `setItem`/`removeItem`/`deleteBlob`.
4. Boundary B (eager, síncrono, idempotente): `atelierStorage.resolveArtPreviewUri`, `atelierStorage.resolveArtThumbUri`, `beniChestService.resolveCardImageSource`, `storyImageService.getBookPageImageSource`.
5. `drawingStorage.js`: **não tocar** (salvo se a análise provar que a delegação por `readBlobAsDataUrl` não cobre → **parar e reportar antes de editar**).
6. Não alterar: formato do ponteiro v3, pipeline de gravação, motor de pintura, StoryBookScreen, PacksContext, assets, R2, Bloco 2, RevenueCat, multi-perfil.

## Abordagem técnica

### Helper (pseudocódigo — não é código final)
```
export function recomposeBlobUri(oldUri, currentBlobsRoot) {
  if (typeof oldUri !== 'string') return oldUri;          // req 2
  if (oldUri.startsWith('data:')) return oldUri;          // req 1
  const marker = 'ptf_blobs/';
  const i = oldUri.indexOf(marker);
  if (i < 0) return oldUri;                               // req 3 (file:// fora de ptf_blobs)
  if (!currentBlobsRoot) return oldUri;                   // FS indisponível → degradação
  const suffix = oldUri.slice(i + marker.length);         // req 4: sufixo após ptf_blobs/
  return currentBlobsRoot + suffix;                       // idempotente/no-op se já sob o root atual (req 5)
}
export function currentBlobsRoot() { return blobsRoot(); } // documentDirectory + 'ptf_blobs/' | null
```

### Boundary A — `readBlobAsDataUrl` (gated por getInfoAsync)
`getInfoAsync(old)`: existe → lê old (no-op). Senão → `recomposeBlobUri(old, currentBlobsRoot())` → `getInfoAsync(new)`: existe → lê new; senão `null`. Sem mutação.

### Boundary B — 4 resolves (eager, síncrono)
`recomposeBlobUri(uri, currentBlobsRoot())` aplicado à `previewUri`/`thumbnailUri`/`card.uri`/`childArt.*Uri` **antes de retornar a string** a `<Image>`. No-op para data URL e `file://` fora de `ptf_blobs`. Sem `await`, sem mudança de assinatura.

## Arquivos (Implement — futuro)
- `src/services/fileBlobStore.js` — `recomposeBlobUri` + `currentBlobsRoot` exportados; `readBlobAsDataUrl` recompõe-on-failure.
- `src/services/atelierStorage.js` — `resolveArtPreviewUri` (`:30-33`), `resolveArtThumbUri` (`:39-42`).
- `src/services/beniChestService.js` — `resolveCardImageSource` (`:69-71`).
- `src/services/storyImageService.js` — `getBookPageImageSource` (`:72-81`, devoluções de childArt em `:76-77,:80`).
- `scripts/smoke.js` — bloco de testes (helper puro + Boundary A FS-mock + Boundary B síncrono + spies de não-mutação + delegação drawingStorage).
- **NÃO tocar:** `drawingStorage.js`, `PacksContext.js`, StoryBookScreen, motor, assets, R2, ponteiro v3.

## Testes planejados (mapeados aos 8 itens do Portão 2)
1. **Helper com `currentBlobsRoot` mockado:** param-based/puro → strings literais, sem FS mock. Casos: data URL/não-string/`file://` fora de `ptf_blobs` → inalterado; `ptf_blobs` → recompõe; idempotência; no-op quando já sob o root atual.
2. **`readBlobAsDataUrl` recompõe só em falha:** fileBlobStore REAL + `expo-file-system/legacy` mockado (`documentDirectory` mutável + `files` Map). (a) antigo existe → lê antigo, sem recompor; (b) antigo ausente + recomposto presente → lê recomposto (ordem antigo→recompor→recomposto); (c) ambos ausentes → `null`.
3. **Boundary B síncrono:** assere retorno **string** (não thenable), recomposição de `previewUri` obsoleta, `previewBase64` preservado.
4. **Funções tocadas (item 4):** conforme lista de arquivos.
5. **Não-mutação:** spies em `AsyncStorage.setItem`/`removeItem` + `deleteBlob`; caminhos de leitura → contadores === 0.
6. **Preserva data URL v1/v2:** helper req 1 + `resolveArtPreviewUri` retorna `previewBase64` intacto.
7. **Preserva `file://` externo:** helper req 3 (`indexOf('ptf_blobs/') < 0` → inalterado).
8. **`drawingStorage` sem mudança:** (a) check estrutural de que `resolvePointer` ainda chama `readBlobAsDataUrl`; (b) `drawingStorage.js` fora do diff no gate; (c) [opcional] integração drawingStorage REAL + fileBlobStore REAL (FS mock) → `getSavedDrawing` resolve após “troca de container”.
- A5.1–A5.4 verdes; smoke ≥ baseline; expo-doctor 18/18.
- **Device (gate de aceite):** pintar+salvar → forçar troca de container (restore iOS) → Livrinho/Galeria/Baú leem.

## Pontos de PARADA OBRIGATÓRIA (parar e reportar ANTES de editar)
- Se qualquer resolve do **Boundary B** precisar virar **async** → PARAR.
- Se precisar tocar o **pipeline de gravação** (writeBlob/buildPointer/saveArt) → PARAR.
- Se precisar tocar **StoryBookScreen** → PARAR.
- Se a análise provar que **`drawingStorage`** precisa mudar (Boundary A não cobre) → PARAR.

## Constitution Check
Local-first, 100% JS, sem dependência nova, sem mudança de arquitetura/assinatura persistida/formato v3. Área sensível (persistência de dado da criança) → SDD completo (3 portões) + validação device iOS obrigatória. Aditivo/reversível.

## Riscos e rollback
Dado da criança (leitura) — helper puro, no-op quando inalterado, nunca apaga/regrava, ponteiro v3 intacto, degradação segura. `scripts/smoke.js` ponto de serialização com Blocos 4/5 (re-ancorar por conteúdo). Rollback: `git revert` de 1 commit (aditivo).
