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

## 9. Validação manual no iPhone (executada — 2026-07-06)
Validação em **dispositivo físico (iPhone)**, build de desenvolvimento, pelo **Pack Sandbox DevScreen** (gate `EXPO_PUBLIC_ENABLE_PACK_SANDBOX`), após a publicação do F2.5c (commit `e71fadf`).

- **Manifesto global usado:** `https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/content-manifest.json` (baseUrl QA `r2.dev` do F2.5b.2bR).
- **Histórias testadas (camada `remote`):** `jesus_children`, `daniel_lions`, `moses_red_sea`.

**Resultado — idêntico nas 3 histórias:**

| Item | jesus_children | daniel_lions | moses_red_sea |
|---|---|---|---|
| Download TODAS (cover+cenas+colorir+áudio) | OK | OK | OK |
| Contagem por kind | cover 1 · cenas 10 · colorir 10 · áudio 10 | idem | idem |
| sha256 | validado | validado | validado |
| Status pós-download | `ready` | `ready` | `ready` |
| História abre | ✔ | ✔ | ✔ |
| Narração + cenas renderizam | ✔ | ✔ | ✔ |
| Colorir (lineart) abre | ✔ | ✔ | ✔ |
| Livrinho abre | ✔ | ✔ | ✔ |
| Áudio toca | ✔ | ✔ | ✔ |

- **Sem regressão:** sem moldura preta, sem tela quebrada, **sem lineart errada**, sem regressão visual aparente. O "sem lineart errada" confirma **empiricamente** o resultado da auditoria da chave de colorir (Bloco 2): as 18 premium têm `cena.id == posição (1..10)`, então o `file://` de colorir (`coloring/scene_<posição>.png`) aponta para o índice correto.

**Metodologia / observação de escopo da ferramenta dev:** o painel inferior do Pack Sandbox (**diag** e **"Verificar sha256 profundo"**) é **fixo em `david_goliath`** e **não** reflete histórias genéricas. Para as 3 histórias acima, a prova válida foi a **mensagem do bloco de download genérico** (`Download TODAS OK` + `sha256 validado`) somada à **validação visual/manual** nas superfícies (capa/cena/colorir/Livrinho/áudio). Um reset/diagnóstico **genérico por `storyId`** na tela dev fica como candidato a micro-bloco dev-only futuro (fora do escopo do F2.5c).

**Conclusão:** o consumo remoto por camada (`isRemotePackStory`) está **confirmado em device** para as 3 histórias; o **fallback local** permanece intacto (sem pack `ready` → `require`), e o download segue **dev/QA-gated** — em produção nada muda até a UX de download (F2.5d) e o entitlement (F2.4f).
