# F2.1f — Primeiro consumo visual do resolver (sandbox: `david_goliath`, cenas)

> **Bloco:** F2.1f (Fase 2 §19). **Primeira conexão visual, sandbox controlado.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD `e757210`.
> **Regra central:** com AsyncStorage **vazio** (estado real), `david_goliath` continua
> renderizando **pelo binário via fallback local** — comportamento visual **idêntico**.
> Só a imagem de **cena**, só `david_goliath`, só na **NarrationScreen**, através de um
> hook. Sem download, sem instalação, sem escrita em `@ptf_packs_v1`. **Não commitado.**

---

## 1. Resumo executivo

Pela primeira vez uma tela consome o runtime de packs — de forma **mínima e encapsulada**.
Criei o hook `useResolvedSceneImage` (`src/hooks/useResolvedStoryMedia.js`) que une
`usePacks` (estado do pack) + `resolveStoryScene` (decisão de origem) e o liguei **apenas**
à imagem de cena da **NarrationScreen**, **gated** a `david_goliath`. Com índice vazio, o
hook devolve **exatamente** o mesmo `require` de antes (`getOfficialSceneIllustration(story.id,
cena.id)`); se um pack estivesse `ready`, devolveria `{ uri: 'file://…' }`. Áudio, colorir e
capas seguem **100% locais**. Gates: **smoke 1483/1483 · doctor 18/18 · audio 200/200**.

---

## 2. Arquivo visual escolhido e motivo

**`src/screens/NarrationScreen.js`.** É a tela da **experiência de história** que renderiza a
**imagem da cena**: calcula `officialIllustration` (linha 47) e passa para
`StorySceneVisual` → `OfficialSceneImage`, que faz `<Image source={…}>`. StoryDetail usa
**capa** (fora do escopo); StoryBook é o Livrinho (fora do escopo). Logo, a superfície de
**cena** da narração é o ponto correto e mínimo para o primeiro consumo.

Confirmado que `OfficialSceneImage` faz `<Image source={source}>` puro → aceita **tanto o
`require`** (fallback) **quanto `{ uri }`** (pack ready), sem alteração no componente.

---

## 3. Escopo

**Criados:** `src/hooks/useResolvedStoryMedia.js`, `docs/F2_1F_FIRST_VISUAL_CONSUMPTION_SANDBOX.md`.
**Alterados:** `src/screens/NarrationScreen.js` (imagem de cena via hook), `scripts/smoke.js`
(+6 checks F2.1f; **atualização do [691]** — ver §7).
**Intocado:** áudio (`audioManifest`, `getSceneAudio`), colorir (`coloringImages`, ColoringScreen),
capas (`storyCovers`, `getStoryCoverImage`), StoryDetail, ProgressContext, storyJourneyService,
RevenueCat, rotas, assets. Nada movido/renomeado.

---

## 4. Contrato do hook

```js
// src/hooks/useResolvedStoryMedia.js
export const SANDBOX_STORY_ID = 'david_goliath';
export function useResolvedSceneImage(storyId, sceneId) → source de <Image>
```
- `storyId ≠ david_goliath` → `getOfficialSceneIllustration(storyId, sceneId)` (**caminho antigo, intacto**).
- `david_goliath` → `resolveStoryScene(storyId, sceneId, getPackEntry(storyId)).source`:
  - sem pack `ready` → `require` local (fallback) **idêntico** ao antigo;
  - pack `ready` → `{ uri: 'file://…/scenes/david_goliath_scene_0N.webp' }`.
- READ-ONLY: encapsula `usePacks` + resolver; **nenhuma tela importa o runtime direto**
  (invariante `[1470]`/`[1476]` preservada — telas só tocam o hook).

Uso na tela (substitui a linha 47):
```js
const officialIllustration = useResolvedSceneImage(story.id, cena?.id);
```

---

## 5. Não-regressão (fallback idêntico com índice vazio)

Prova estrutural: `resolveStoryScene(storyId, sceneId, null).source` é, **por construção**,
`getOfficialSceneIllustration(storyId, sceneId)` (o `decide()` devolve o `localSource` quando
não há pack). O hook passa `cena.id` (1..N) — a **mesma chave** usada pela tela hoje. Logo,
com índice vazio, `useResolvedSceneImage('david_goliath', cena.id)` ≡ linha 47 anterior →
`StorySceneVisual` recebe o valor idêntico → **render idêntico, sem flicker**.

| david_goliath | `sourceType` | render |
|---|---|---|
| índice vazio (estado real) | `require` | binário local (**igual ao anterior**) |
| pack `ready` (sandbox) | `file` | `file://` do pack |

Provado por eval no smoke `[1482]`.

Observação: a NarrationScreen passa a ser consumidora do `PacksContext` (via hook), então
re-renderiza **uma vez** quando o índice termina de carregar. Como o índice fica vazio e o
`source` resolvido é o **mesmo `require`** antes e depois, **não há mudança visual**.

---

## 6. Áudio, colorir e capas — 100% locais (inalterados)

- **Áudio:** `NarrationScreen` segue usando `getSceneAudio`/`hasSceneAudio`; `audioManifest` require-based, sem `file://`.
- **Capas:** `getStoryCoverImage` intacto (ambientação Estado B).
- **Colorir:** `coloringImages`/`ColoringScreen` intactos; ColoringScreen não importa o hook/resolver.
- Smoke `[1480]`/`[1481]` provam que a tela só roteou a **cena** pelo resolver (não capa/áudio/colorir) e que os 4 loaders seguem require-based sem `file://`.

---

## 7. Ajuste do check pré-existente `[691]` (transparência)

O check `[691]` (“NarrationScreen consome imagem oficial automaticamente”) verificava o
literal `getOfficialSceneIllustration(story.id, cena.id)` na tela. Como a F2.1f **moveu essa
chamada para dentro do hook**, o literal saiu da tela e o check quebrou. **Atualizei** o
`[691]` para verificar o consumo via `useResolvedSceneImage(story.id, cena?.id)` — **mesma
garantia** (a tela consome a ilustração oficial da cena), agora pelo hook (que resolve a
mesma ilustração + o pack, coberto por `[1478]`). **Não é enfraquecimento**: a cobertura fica
igual ou maior (passa a cobrir o caminho do pack). Registro aqui para total visibilidade.

---

## 8. Checks adicionados/alterados no smoke

- `[691]` **atualizado** (consumo via hook `useResolvedSceneImage`).
- `[1478]` hook existe, **gated a david_goliath**, read-only.
- `[1479]` consumo visual **SÓ na NarrationScreen** (exatamente 1 tela).
- `[1480]` escopo **cena-only**: capa e áudio seguem locais na tela.
- `[1481]` **áudio/colorir/capas 100% locais** (loaders require-based, sem `file://`; Coloring sem hook).
- `[1482]` **fallback×ready por eval**: índice vazio → `require`; pack ready → `file://`.
- `[1483]` **sem compra/entitlement** no caminho visual.

---

## 9. Riscos · Rollback

| Risco | Mitigação |
|---|---|
| Mudança visual com índice vazio | fallback === `require` antigo (prova estrutural + `[1482]`); render idêntico |
| Consumo vazar p/ outras histórias | hook **gated** por `SANDBOX_STORY_ID` (`[1478]`) |
| Consumo vazar p/ outras telas | só NarrationScreen importa o hook (`[1479]`) |
| Áudio/colorir/capa mudarem | inalterados (`[1480]`/`[1481]`) |
| Tela acoplar ao runtime direto | encapsulado no hook; `[1470]`/`[1476]` seguem verdes |

**Rollback:** `git checkout -- src/screens/NarrationScreen.js scripts/smoke.js` +
`rm src/hooks/useResolvedStoryMedia.js docs/F2_1F_FIRST_VISUAL_CONSUMPTION_SANDBOX.md`.

---

## 10. Plano F2.1g (não iniciar agora)

1. **Instalação real no device (sandbox, sem R2):** gravar `@ptf_packs_v1` de verdade
   (`markPackReady`) → `refreshPacks()` reflete `ready` → a cena de `david_goliath` passa a
   render por `file://` **no aparelho** (validação visual real do caminho pack).
2. Estender o consumo (ainda gated) para **capa/áudio** de `david_goliath` quando `ready`.
3. `getStoryContractStatus` + `packState`. Depois: 2ª história, dep de crypto, R2. Sem RevenueCat ainda.

---

## 11. Gates

**smoke 1483/1483 ✓** (`[691]` + `[1478]`–`[1483]`) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**.
`useResolvedStoryMedia.js` e `NarrationScreen.js` compilam no babel ✓.

---

## 12. Confirmações

- ✅ **Só `david_goliath` foi conectado** (hook gated; só cenas; só NarrationScreen).
- ✅ **Áudio, colorir e capas não foram tocados** (100% locais).
- ✅ **Com índice vazio, o fallback local continua sendo o comportamento real** (render idêntico).
- ✅ **Nenhum pack foi baixado ou instalado**; nenhuma escrita em `@ptf_packs_v1`/AsyncStorage; sem R2; sem compras/entitlement.
- ✅ **Sem commit, sem push, sem `git add`.**
