# F2.4e.1 — Download + diagnose de cover, scene, coloring e audio (dev-only, sem crypto)

> **Bloco:** F2.4e.1. **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `b20927d`.
> Expande o downloader genérico e o diagnose para os **4 tipos de mídia** do pack remoto,
> **sem dependência de crypto** e **sem tocar o usuário final**. Relacionado:
> [plano F2.4e.0](F2_4E_0_MEDIA_EXPANSION_PLAN.md) *(se persistido)* · [downloader F2.4d.3](F2_4D_3_GENERIC_STORY_SCENE_DOWNLOADER.md) · [tela F2.4d.4](F2_4D_4_DEV_SCREEN_GLOBAL_MANIFEST_DOWNLOAD.md).

## 1. Objetivo
Permitir baixar e diagnosticar **cover + scenes + coloring + audio** a partir do manifesto
remoto já existente (o pack no R2 já tem as 31 mídias), **em modo dev**, com diagnose técnico
por kind — sem sha256 real e sem consumo nas telas finais.

## 2. Escopo
Só **download + diagnose** (dev-gated). **Não** implementa consumo visual de cover/coloring/audio
(isso é F2.4e.3–e.5), **não** implementa sha256 real (F2.4e.2), **não** adiciona dependência.

## 3. Arquivos alterados
- **`src/services/packDownloadService.js`** — `requestedKinds` (default `['scene']`) + download/validação/contagem por kind.
- **`src/services/packSandboxDevService.js`** — diagnose por kind (`byKind` + rel paths cover/coloring/audio); removido import não usado `resolveStoryScene`.
- **`src/screens/PackSandboxDevScreen.js`** — botão "Download TODAS as mídias" + progresso por kind + diagnose por kind na UI (botão só-cenas preservado).
- **`scripts/smoke.js`** — +13 checks F2.4e.1; 2 checks atualizados (F2.4d.3 [download por kind] e F2.2b [diagnose por resolver]).
- **`docs/F2_4E_1_REMOTE_MEDIA_DOWNLOAD_DIAGNOSE.md`** — este documento.

**Não** tocados: contentResolver, NarrationScreen, StoryBookScreen, ColoringScreen, audioService, telas de capa/Home/Estante/StoryCard, entitlement, RevenueCat, assets locais, package.json/lock, manifesto.

## 4. Contrato `requestedKinds`
`downloadStoryPackScenesFromGlobalManifest({ storyId, globalManifestUrl, appVersion, requestedKinds, onProgress })`:
- `requestedKinds`: subconjunto de `['cover','scene','coloring','audio']`. **Default `['scene']`**.
- Kinds fora da whitelist são ignorados; lista vazia → erro estruturado.
- Retorno agora inclui `kinds`, `counts` (por kind) e `sceneCount` (compat).

## 5. Comportamento scenes-only (padrão)
Sem `requestedKinds`, o fluxo é **idêntico ao F2.4d** (só cenas). O botão "Download genérico (só cenas)" da tela dev usa esse default.

## 6. Comportamento all-media (dev only)
O botão "Download TODAS as mídias" passa `requestedKinds: ['cover','scene','coloring','audio']`.
Baixa os 31 arquivos (1 cover + 10 scenes + 10 coloring + 10 audio) para `documentDirectory`,
com subdiretórios criados por arquivo, progresso por kind + cumulativo.

## 7. Diagnose por kind
`diagnoseDavidGoliathPackSandbox` retorna `byKind = { cover, scene, coloring, audio }` com
`{ found, total, file, bytes }` por grupo, além de listas por item (existência, bytes,
`sourceType` require/file, `uri` file:// quando ready) e `usesPack`. Usa `resolveStoryMedia`.

## 8. Validações
- Existência + bytes de **todos** os arquivos solicitados (sha256 real → F2.4e.2).
- **Contagem por kind**: baixados == declarados no manifesto (`expectedPerKind` vs `doneByKind`); qualquer divergência → falha.
- Kind solicitado ausente no manifesto → falha.
- Fluxo seguro `.tmp → validar → move atômico → ready`; **nunca ready parcial**; falha limpa `.tmp`, grava `failed`, mantém require.

## 9. Riscos
- **Peso/tempo:** all-media ~18 MB (david_goliath); mitigado por progresso e por ser dev-only.
- **Quebrar F2.4d:** default scenes-only + legado intactos (checks de compat).
- **Tocar telas finais:** não há consumo user-facing (check dedicado); só diagnose técnico.
- **sha256 ausente:** integridade por bytes+existência + origem HTTPS + move atômico; sha256 real fica p/ F2.4e.2 (dep a aprovar).

## 10. Plano de validação manual no iPhone
1. `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true npx expo start -c` → iPhone → FAB **🛠 packs**.
2. **Reset** → `not_downloaded`, tudo 0, `usesPack=false`, `require`.
3. Colar a URL do content-manifest global do R2; `storyId = david_goliath`.
4. Tocar **"Download TODAS as mídias"** → aguardar `downloading (por kind) → verifying → ready`.
5. Conferir diagnose: **cover 1/1, scene 10/10, coloring 10/10, audio 10/10**, todos com bytes, `sourceType=file`, uris `file://`, `usesPack=true`.
6. Abrir **NarrationScreen** e **StoryBook/Livrinho** só para garantir que **cenas** continuam como no F2.4d (autoplay ok).
7. **Não** validar coloring/cover/audio visualmente nas telas finais (pertence a F2.4e.3+).
8. **Reset final** → volta a `require`/fallback.

## 11. Confirmações de não-escopo
Sem dependência instalada · sem package.json/lock alterados · sem sha256 real · sem RevenueCat ·
sem entitlement · sem assets locais alterados · sem manifesto novo · sem R2 · **sem alteração no
usuário final** (contentResolver/NarrationScreen/StoryBookScreen/ColoringScreen/audioService/capas
intactos).

## 12. Próximos passos
- **F2.4e.2:** sha256 real (aprovar dep — @noble/hashes JS puro) + verificação por arquivo + falha segura.
- **F2.4e.3–e.5:** consumo user-facing coloring → cover → audio (cada bloco com validação no device).
