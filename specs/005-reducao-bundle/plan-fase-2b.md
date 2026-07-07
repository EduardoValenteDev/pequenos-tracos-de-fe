# Plan — Bloco 2 · Fase 2B: Consumo R2 user-facing (sem remover bundle)

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B. **Etapa SDD:** 4 (Plan). **Portão Humano 2: APROVADO por Eduardo (2026-07-07).**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `e4d2a8a` · Spec: [spec-fase-2b.md](./spec-fase-2b.md).

## ⚠️ Correção de abordagem (2026-07-07) — preservar os guardrails de arquitetura

A primeira tentativa importou `usePacks`/`packDownloadService` (StoryDetail) e `resolveStoryColoring`/`resolveStoryAudio` de `contentResolver` (StoryBookScreen) **direto na tela**. Isso **quebrou 8 checks** de smoke (F2.1d [1481], F2.1e [1487], F2.1h/i [1506/1511], F2.4e [1588/1601]) porque esses guardrails são **por import/camada**: nenhuma `src/screens/*.js` pode importar `usePacks`/`PacksContext`/`contentResolver`/`packStorageService`/`packDownloadService`/`packIntegrityService`. Revertido e corrigido. **Decisão de Eduardo (aprovada):**

1. **Preservar os 6 guardrails.** Telas nunca importam o runtime de packs nem o `contentResolver` diretamente.
2. **StoryBookScreen** consome remoto **somente** pela camada permitida `src/hooks/useResolvedStoryMedia` — via **2 resolvers puros novos** (`resolveRemoteColoringUri`, `resolveRemoteAudioSource`) que retornam a fonte remota (`file://`) **só** com pack `ready`+válido; senão `null` (mantendo a fonte **local** atual como fallback).
3. **StoryDetail** consome **somente** um hook novo `useStoryPackDownload(storyId)` em `src/hooks/`, que encapsula `usePacks` + `packDownloadService` (progresso/erro/retry/ready). A tela **não** importa `pack*`/`usePacks`.
4. **Migração fiel** apenas dos **2 checks de shape** da assinatura de `makeChildArtVisual` — mínima, documentada, **sem** relaxar nenhum guardrail. Os 8 guardrails seguem verdes.

## Recorte aprovado
Download user-facing no StoryDetail p/ `remote` quando premium-active (`isPremiumUser()`; validação via Modo Criador, sem RevenueCat); pedir todos os kinds (cover/scene/coloring/audio); fechar os 2 gaps do StoryBookScreen (áudio+lineart child) via resolvers da camada permitida + fallback local; sem remover require premium; sem tocar app.json/assetBundlePatterns; sem mover/apagar/renomear/`git rm` assets; sem R2 upload/build, RevenueCat, compressão, motor de pintura, 2C.

## Nota production-safe (StoryBookScreen)
`useSandboxScenePackEntry(storyId)` = `usePacks().getPackEntry(storyId)` p/ remote (senão null) — **sem gate `__DEV__`/sandbox**; production-safe. Reusar o `scenePackEntry` já existente (`:446`) para os novos resolvers (nenhum hook novo; nenhum hook em loop). Os 2 resolvers remotos são **puros/não-hook** → seguros dentro do builder/timeline.

## 1. Download no StoryDetail (via hook `useStoryPackDownload`)
`const packDownload = useStoryPackDownload(story.id)` no topo. Bloco gated a `canAccess && packDownload.isRemote && !isComingSoon`: `not_downloaded`→"Baixar história (usar offline)"; `downloading`→barra de progresso %; `ready`→"Baixado ✓ · funciona offline"; `error`→"Não foi possível baixar. Tentar de novo" (retry). Free → sem botão (convite Plano Família inalterado). A tela **não** importa `usePacks`/`packDownloadService`.

## 2. Hook `useStoryPackDownload` (encapsula o runtime)
Novo arquivo `src/hooks/useStoryPackDownload.js`. Dentro dele (não na tela): `const { getStoryPackState, refreshPacks } = usePacks();` + `downloadStoryPackScenesFromGlobalManifest({ storyId, globalManifestUrl: EXPO_PUBLIC_GLOBAL_MANIFEST_URL, appVersion, requestedKinds:['cover','scene','coloring','audio'], onProgress })`. Expõe `{ uiState, progress, error, download, retry, isRemote, isReady, configMissing }`. `uiState` derivado do índice **reconciliado** (`getStoryPackState`): downloading→'downloading'; error→'error'; ready→'ready'; else 'not_downloaded'. `busyRef` (1 por vez); `ok`→`refreshPacks()`. Mapeia `requiresAppUpdate`/`networkError`/`insufficient_space`. **Read-only** quanto a acesso/compras (não toca entitlement).

## 3. Progresso/erro/retry/pronto
Barra %; erro amigável (rede/espaço/app-update) + retry; ready = pack offline (device-validado F2.5).

## 4. StoryBookScreen (2 gaps, via camada permitida + resolvers puros)
Único hook `scenePackEntry = useSandboxScenePackEntry(story?.id)` (`:446`). **Lineart child** (`resolveStoryBookPageImage`/`makeChildArtVisual`): fonte **local** por padrão (`getColoringImage(story.id, cena.id)`); remoto `file://` só quando `cena.id===sceneNumber` **e** `resolveRemoteColoringUri(story.id, sceneNumber, scenePackEntry)` retorna truthy. **Áudio** (`:1128`): fonte **local** por padrão (`getSceneAudio`); `resolveRemoteAudioSource(story.id, slide.sceneNumber, scenePackEntry)` sobrescreve só quando truthy. `makeChildArtVisual(cena, story, p, baseImage)` recebe o `baseImage` já resolvido (assinatura estendida — **os 2 checks de shape migram fielmente**). Resolvers são **PUROS (não-hook)** → ok em loop/helper. Fallback local mantido; motor/LIVRINHO_FIX/UX intocados (só muda a FONTE).

## 5. creation/noah byte-idênticos
starter → `isRemotePackStory()===false` → resolvers retornam `null` → fonte **local** (mesma de sempre). Nada de remoto p/ starter.

## 6. Smoke (8 checks 2B — `── Fase 2B ──`)
1. hook `useStoryPackDownload` encapsula `usePacks`+`packDownloadService` e expõe uiState/progress/error/download/retry/isRemote; 2. hook read-only (sem Purchases/entitlement/accessControl); 3. uiState via `getStoryPackState` (reconciliado) + `refreshPacks` + `busyRef` + ordem dos 4 estados; 4. resolvers puros `resolveRemote*` → `file://` só com pack, senão `null` (guarda `!isRemotePackStory||!packEntry` ×2 + `FILE&&r.source?r.source:null` ×2); 5. StoryDetail importa só o hook + bloco gated a `canAccess&&isRemote&&!isComingSoon`; 6. StoryDetail UI (ready/downloading/error+retry + labels); 7. Livrinho usa `resolveRemote*` de `useResolvedStoryMedia` + local é default e só é sobrescrito; 8. regra dos hooks (scenePackEntry único no topo; builders recebem por parâmetro). **Guardrails F2.1d/e/h/i + F2.4e permanecem verdes.**

## 7. Device (Modo Criador + pack R2 real)
Modo Criador on → StoryDetail remote → Baixar→progresso→pronto → avião → Narration/Coloring/Livrinho file:// → erro de rede→retry → creation/noah idênticos → Modo Criador off → free sem botão.

## Tasks
- T1 `src/hooks/useResolvedStoryMedia.js`: +2 resolvers puros `resolveRemoteColoringUri`/`resolveRemoteAudioSource` (file:// só com pack ready+válido; senão null).
- T2 `src/hooks/useStoryPackDownload.js` (novo): encapsula `usePacks`+`packDownloadService`; expõe uiState/progress/error/download/retry/isRemote/isReady/configMissing.
- T3 StoryDetail: consome só `useStoryPackDownload`; bloco de estado (premium+remote) + 8 estilos.
- T4 StoryBookScreen áudio: local default + `resolveRemoteAudioSource` sobrescreve (non-hook).
- T5 StoryBookScreen lineart child: local default + `resolveRemoteColoringUri` com guarda de chave (`makeChildArtVisual` recebe `baseImage`).
- T6 smoke: 8 checks 2B + **migração fiel** dos 2 checks de shape de `makeChildArtVisual`.
- T7 gates + evidências (10 checks do Portão) + relatório; atualizar este plano.

## Paradas obrigatórias
Importar `usePacks`/`PacksContext`/`contentResolver`/`packStorageService`/`packDownloadService`/`packIntegrityService` em `src/screens/*`; hook em loop/callback/condicional/helper; tocar app.json/patterns; remover require premium; motor de pintura; RevenueCat/compra/entitlement; R2 upload/build; relaxar guardrail (só os 2 shape checks migram); risco de regressão em LIVRINHO_FIX/UX.

## Analyze
Rastreabilidade aceite→task completa; guardrails preservados (telas só via `src/hooks`); resolvers não-hook respeitam regras de hooks; starter inalterado; fallback preservado; bundle intocado. Sensível (StoryBookScreen) → device obrigatório. CONSISTENTE.
