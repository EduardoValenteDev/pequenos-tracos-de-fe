# F2.5c — Consumo remoto das 18 histórias premium (gated por camada, com fallback local)

> **Bloco:** F2.5c (expansão do consumo remoto; mudança mínima). **Data:** 2026-07-06 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `b5660f2`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** SUPERSEDED não usados como fonte.

## 1. Objetivo
Habilitar o consumo remoto (cover/scene/coloring/audio via `file://`) para **as 18 histórias premium** — não mais só `david_goliath` — usando o manifesto global e os packs já no R2 (F2.5b.2bR), **mantendo fallback local obrigatório**. `creation`/`noah` (starter) seguem **sempre locais**.

## 2. Arquivos alterados (2 código + 1 doc)
- **`src/hooks/useResolvedStoryMedia.js`** — troca do gate fixo `storyId === SANDBOX_STORY_ID` por um **predicado por camada** `isRemotePackStory(storyId)`.
- **`scripts/smoke.js`** — checks antigos ("LIMITADO a david_goliath") migrados para "gated por camada remote"; +11 checks F2.5c.
- **`docs/F2_5C_REMOTE_CONSUMPTION_18_PACKS.md`** — este documento.

**NÃO alterados:** downloader (`packDownloadService`), resolver (`contentResolver`), `packStorageService`, `PacksContext`, `globalManifestService`, telas, dev screen. **Nenhum require/asset local removido.** Sem RevenueCat, sem domínio próprio, sem tocar o R2.

## 3. O predicado por camada (mudança-núcleo)
```js
import { getContentLayer, CONTENT_LAYERS } from '../data/contentManifest';

export function isRemotePackStory(storyId) {
  return getContentLayer(storyId) === CONTENT_LAYERS.REMOTE;
}
```
- **Fonte única:** `contentManifest.STORY_CONTENT_LAYER` (18 `remote` + `creation`/`noah` `starter`). **Sem hardcode** de lista.
- Os **9 gates** dos hooks (`useResolvedSceneImage`, `resolveSceneImageForStory`, `useSandboxScenePackEntry`, `useResolvedColoringImage`, `useResolvedStoryCover`, `useResolvedStoryAudio`) passaram de `storyId === SANDBOX_STORY_ID` para `isRemotePackStory(storyId)`.
- **`SANDBOX_STORY_ID` continua exportado** (compatibilidade com referências/piloto/QA).

## 4. Fallback local (preservado, obrigatório)
Nada mudou no caminho de fallback:
- Cada hook retorna **`remoteSource || localSource`** (coloring/cover) / **`remoteSource || localAudioAsset`** (audio); cena via `resolveStoryScene(...).source` com fallback `getOfficialSceneIllustration`.
- **Remoto só é usado quando o pack está `ready`** (baixado + validado por bytes+sha256) **E** o arquivo existe (`getInfoAsync` fora do render). Sem pack, inválido ou ausente → **require local** (idêntico ao comportamento anterior).
- Como o **download** continua atrás do gate dev/QA (F2.4e.7b), em produção nenhum pack é baixado → **tudo local**. Em dev/QA, qualquer uma das 18 pode ser baixada e consumida por `file://`.

## 5. Histórias testadas (device/dev screen)
Com o R2 populado (18 packs), pelo Pack Sandbox (dev): baixar e marcar `ready` — **`jesus_children`, `daniel_lions`, `moses_red_sea`** (além de `david_goliath`) — e confirmar, para cada uma:
- **cover** via `file://` (mapa/detalhe/card), **scenes** via `file://` (narração/Livrinho), **coloring** via `file://` (Colorir), **audio** via `file://` (narração/Livrinho).
- **Fallback local** após **Reset** do pack (ou sem `ready`): volta ao require local; nenhum `file://` preso.

## 6. Validação automática (gates)
`npm run smoke` (+11 checks F2.5c; checks antigos migrados) · `npx expo-doctor` · `npm run audio:audit`.

## 7. Limitações (fim do escopo do bloco)
- **Sem UX final de download premium** (estados baixado/baixando/erro) — isso é **F2.5d**; hoje o download é só pela ferramenta dev/QA.
- **Sem RevenueCat/entitlement** — o acesso premium real vem depois (F2.4f).
- **Sem remoção dos requires locais** — o bundle **não** encolheu; a remoção só vem **depois** da UX de download (F2.5d/F2.5e), para não quebrar o fallback.
- **baseUrl ainda `r2.dev` (QA)** — domínio próprio é F2.5f.

## 8. O que NÃO foi feito
Sem remover requires/assets; sem alterar downloader/resolver/storage/telas/dev screen; sem RevenueCat; sem domínio próprio; sem tocar o R2 (nada apagado/sync); sem git add/commit/push (aguarda aprovação).
