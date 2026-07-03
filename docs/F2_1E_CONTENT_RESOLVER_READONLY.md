# F2.1e — Camada read-only de resolução de mídia por história

> **Bloco:** F2.1e (Fase 2 §19). **Escopo mínimo, sem consumo visual.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD `5d68764`.
> **Regra central:** nenhuma tela consome o resolver; nenhuma mídia real do app usa
> `file://`; o **fallback local continua sendo o comportamento visual real**;
> `david_goliath` segue no binário. **Não commitado, não pushado, sem `git add`.**

---

## 1. Resumo executivo

O `contentResolver.js` **já existia** (F2.1a/c) como camada pura de resolução por item.
F2.1e **estende** (não duplica) essa camada com **`resolveStoryMedia(storyId, options)`** —
a resolução **por história** (capa + N cenas + N colorir + N áudios de uma vez), consultando
o `packEntry` (vindo do `PacksContext`, F2.1d) para decidir **pack `ready` → `file://`** ou
**fallback local → `require`**. É **pura e read-only**: não baixa, não instala, não escreve
índice/AsyncStorage, não toca progresso/acesso/compras. **Nenhuma tela** a consome ainda.
Gates: **smoke 1477/1477 · doctor 18/18 · audio 200/200**.

---

## 2. Escopo

**Criados:** `docs/F2_1E_CONTENT_RESOLVER_READONLY.md` (este).
**Alterados (aditivos):** `src/services/contentResolver.js` (**+`resolveStoryMedia`**),
`scripts/smoke.js` (**+6 checks F2.1e**).
**Intocado:** telas, `AppNavigator`, `PacksContext`, assets, loaders de mídia
(`storySceneIllustrations`/`storyCovers`/`coloringImages`/`audioManifest`), progresso,
entitlement, RevenueCat, Brincar, Beni, colorir, áudio, rotas. Nada movido/renomeado.

---

## 3. Contrato de `resolveStoryMedia(storyId, options)`

```js
resolveStoryMedia('david_goliath', { packEntry, sceneCount })
// →
{
  storyId, layer,          // 'remote' | 'starter' | 'coming_soon'
  packStatus,              // getPackState(storyId, packEntry)
  usesPack,                // true se ALGUMA resolução veio do pack (file://)
  cover,                   // { status, sourceType, source, reason }
  scenes:   [ ...sceneCount ],
  coloring: [ ...sceneCount ],
  audio:    [ ...sceneCount ],
}
```

- `packEntry` vem do `PacksContext` (`getPackEntry(storyId)`); resolver permanece **puro/sync** (render-safe).
- `sceneCount` é fornecido pelo chamador (ex.: `story.totalCenas`); ausente → só resolve a capa.
- Construída sobre `resolveStoryCover/Scene/Coloring/Audio` (per-item) — **não os substitui**.

---

## 4. Fallback × ready (provado por eval no smoke `[1474]`)

| Entrada | `usesPack` | `packStatus` | `sourceType` de todas as mídias |
|---|:--:|---|---|
| `david_goliath`, `packEntry = null` | **false** | `not_downloaded` | **`require`** (fallback local) |
| `david_goliath`, `packEntry.status = ready` | **true** | `ready` | **`file`** (`file:///…/cover.webp`, …) |
| `creation` (starter) | false | `included` | `require` (binário) |

O caminho **sem pack** (estado real do app hoje, índice vazio) é **100% `require`** — ou seja,
o **fallback local é o comportamento visual real**, idêntico ao de antes deste bloco.

---

## 5. Checks adicionados no smoke (6)

- `[1472]` camada por história existe (`resolveStoryMedia` exportada).
- `[1473]` read-only (não escreve índice/AsyncStorage, não baixa, não toca compras).
- `[1474]` fallback×ready por eval (sem pack → `require`; pack ready → `file://`).
- `[1475]` loaders de mídia **intactos** (require-based; **nenhum** usa `file://`/`uri:`).
- `[1476]` **sem consumo visual** (nenhuma tela importa `contentResolver`/`resolveStoryMedia`/`usePacks`).
- `[1477]` estado default (starter→`included`, remote→`not_downloaded` com índice vazio).

---

## 6. O que NÃO foi integrado (de propósito)

- Nenhuma tela consome `resolveStoryMedia` (StoryDetail/Narration/Coloring/Home/Aventuras/AppNavigator intactos).
- Nenhuma mídia real usa `file://`; os loaders seguem `require`-based.
- Sem instalação/download/R2/RevenueCat; sem escrita em `@ptf_packs_v1`/AsyncStorage; sem `ready` no app.
- `david_goliath` continua no binário; jornada/`storyJourneyService` sem `packState`. F2.1f não iniciado.

---

## 7. Riscos · Rollback

| Risco | Mitigação |
|---|---|
| Resolver deixar de ser puro | smoke `[1473]` (sem escrita/baixa/compras) |
| Loader virar `file://` sem querer | smoke `[1475]` (loaders require-based, sem `file://`/`uri:`) |
| Consumo visual precoce | smoke `[1476]` (nenhuma tela importa o resolver) |
| Regressão fallback/ready | smoke `[1474]` (eval direto das duas ramificações) |

**Rollback:** `git checkout -- src/services/contentResolver.js scripts/smoke.js` + `rm docs/F2_1E_CONTENT_RESOLVER_READONLY.md`. Como nenhuma tela consome, remover é inócuo.

---

## 8. Plano F2.1f (não iniciar agora)

1. **Leitura por tela atrás de flag** (StoryDetail/Narration): `resolveStoryMedia(storyId, { packEntry: getPackEntry(storyId), sceneCount: story.totalCenas })`; usa pack `ready`, **fallback local** senão — **sem** tirar `david_goliath` do binário.
2. **Instalação real no device (sandbox, sem R2)** + gravar `@ptf_packs_v1` de verdade; `refreshPacks()` reflete `ready`.
3. **`getStoryContractStatus` + `packState`** (contrato A0.10 + disponibilidade física).
4. **Dep de crypto aprovada** → sha256 real no app. Sem R2/RevenueCat/colorir final ainda.

---

## 9. Gates

**smoke 1477/1477 ✓** (`[1472]`–`[1477]`) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**.

---

## 10. Confirmações

- ✅ **Nenhuma tela consome o resolver.** ✅ **Nenhuma mídia real usa `file://` no app.**
- ✅ **Fallback local continua sendo o comportamento visual real.**
- ✅ **Nenhuma escrita em AsyncStorage.** ✅ **Nenhum asset/loader de mídia alterado.**
- ✅ **`david_goliath` continua no binário.** ✅ **F2.1f não iniciado.**
- ✅ **Sem commit, sem push, sem `git add`.**
