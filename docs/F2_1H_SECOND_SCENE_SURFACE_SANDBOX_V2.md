# F2.1h v2 — Segunda superfície de cenas (Livrinho · História ilustrada · sandbox `david_goliath`)

> **Bloco:** F2.1h v2 (Fase 2 §19). **Reimplementação segura da 2ª superfície.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD inicial `8ebef45`.
> **Regra central:** conectar o resolver de cenas ao Livrinho **só** no modo "História
> ilustrada", **só** para `david_goliath`, mantendo **fallback local (`require`) idêntico**
> com índice vazio. Intro preview e "Meu livrinho colorido" **no caminho antigo**. **Não
> commitado, não pushado, sem `git add`.**

---

## 1. Resumo executivo

Reconectei a resolução de imagem de cena ao **Livrinho (`StoryBookScreen`)** — apenas no modo
`official` — corrigindo a **falha de projeto do v1**. O v1 passava um **`useCallback`
(identidade instável)** às deps do `useMemo`, recompondo a timeline no load de packs. O **v2
passa o VALOR do `packEntry`** (`null` com índice vazio, estável) → **a timeline não recompõe**
ao carregar packs (`null === null`). Consumo via **hook** (`useSandboxScenePackEntry`) + função
**pura** (`resolveSceneImageForStory`) — a tela **não** importa o runtime direto. Gates:
**smoke 1499/1499 · doctor 18/18 · audio 200/200**.

> **Nota:** o crash que reprovou o v1 era o **TrilhoProgresso** (`accessibilityValue.now`
> decimal), já corrigido no commit `8ebef45` — **não** era o Livrinho. Mesmo assim, o v2
> elimina o risco de recomposição que eu havia levantado.

---

## 2. Escopo

**Criados:** `docs/F2_1H_SECOND_SCENE_SURFACE_SANDBOX_V2.md`.
**Alterados:**
- `src/hooks/useResolvedStoryMedia.js` — **+2 exports aditivos** (`resolveSceneImageForStory`, `useSandboxScenePackEntry`); `useResolvedSceneImage` **intacto**.
- `src/screens/StoryBookScreen.js` — modo `official` (linha 165) via `resolveSceneImageForStory` + `scenePackEntry` (valor).
- `scripts/smoke.js` — **+7 guards** (`[1493]`–`[1499]`) e **atualização** de `[679]`/`[1479]`/`[1488]`.

**Intocado:** NarrationScreen, StoryDetail, StoryBookHero, **TrilhoProgresso**, contentResolver,
PacksContext, storyImageService, storyBookPagesService, assets, loaders de mídia, áudio, colorir,
capas, RevenueCat, R2. Nada movido/renomeado.

---

## 3. O que muda no código (diff conceitual)

**`useResolvedStoryMedia.js` (aditivo):**
```js
// PURA (não-hook): gated a david_goliath; retorna SEMPRE .source (require OU {uri}), nunca o envelope.
export function resolveSceneImageForStory(storyId, sceneId, packEntry = null) {
  if (storyId !== SANDBOX_STORY_ID) return getOfficialSceneIllustration(storyId, sceneId);
  return resolveStoryScene(storyId, sceneId, packEntry).source;
}
// HOOK: VALOR do packEntry do sandbox (null p/ outra história / índice vazio). Valor estável.
export function useSandboxScenePackEntry(storyId) {
  const { getPackEntry } = usePacks();
  return storyId === SANDBOX_STORY_ID ? getPackEntry(storyId) : null;
}
```

**`StoryBookScreen.js`:**
```js
import { resolveSceneImageForStory, useSandboxScenePackEntry } from '../hooks/useResolvedStoryMedia';
// no componente:
const scenePackEntry = useSandboxScenePackEntry(story?.id);           // null (estável) c/ índice vazio
// resolveStoryBookPageImage(cena, story, drawings, mode, scenePackEntry):
const official = resolveSceneImageForStory(story.id, cena.id, scenePackEntry);   // só modo 'official'
// buildStoryBookTimeline(story, drawings, mode, scenePackEntry)
const timeline = useMemo(() => buildStoryBookTimeline(story, drawings, viewMode, scenePackEntry),
  [story?.id, drawings, viewMode, scenePackEntry]);                   // dep = VALOR, não callback
// intro preview (linha 772) permanece getOfficialSceneIllustration
```

---

## 4. Diferença crítica vs v1 (por que é seguro agora)

| | v1 (revertido) | **v2 (agora)** |
|---|---|---|
| Ponto de acesso a packs | `useSceneImageResolver()` → **`useCallback`** | `useSandboxScenePackEntry()` → **VALOR** (`null` estável) |
| Dep do `useMemo` | o callback (identidade muda no load de packs) | **`scenePackEntry`** (valor; `null === null`) |
| Timeline no load de packs | **recompõe** (pager perturbado) | **não recompõe** |
| Superfícies conectadas | páginas + intro preview | **só páginas** (intro no caminho antigo) |

---

## 5. Garantias

- **Só `david_goliath`:** gating em `resolveSceneImageForStory` (`storyId !== SANDBOX → getOfficialSceneIllustration`). Provado por eval (`[1496]`).
- **Índice vazio → require local:** `getPackEntry('david_goliath')=null` → `resolveStoryScene(...,null).source` = `getOfficialSceneIllustration` (idêntico ao antigo). `cena.id` inalterado.
- **Outras histórias → caminho antigo** (getOfficialSceneIllustration).
- **Nunca envelope no `Image source`:** `resolveSceneImageForStory` retorna `.source` (require/`{uri}`).
- **Sem recomposição:** dep = valor `scenePackEntry` (`null` estável) → timeline não reconstrói no load de packs.
- **Tela sem runtime direto:** consome o **hook** — `[1470]`/`[1476]` seguem verdes.
- **Só a "História ilustrada":** intro preview e "Meu livrinho colorido" (arte da criança) **inalterados** (`[1497]`).

---

## 6. Checks — atualizados e novos

**Atualizados (mesma garantia):**
- `[679]` — modo `official` resolve via `resolveSceneImageForStory` (call única no ramo official).
- `[1479]`/`[1488]` — consumo **só nas superfícies permitidas: NarrationScreen + StoryBookScreen**.
- `[667]` **não** mudou (getOfficialSceneIllustration segue no arquivo, na intro).

**Novos `[1493]`–`[1499]`:** hook (exports/gating/valor); Livrinho consome via hook + **dep = valor** + **sem `useSceneImageResolver`** + sem runtime direto; gating por eval; intro antiga + child art prioritária; NarrationScreen intacta; áudio/colorir/capas locais.

---

## 7. Riscos · Rollback

| Risco | Mitigação |
|---|---|
| Recompor timeline no load de packs (falha do v1) | dep = **valor** `scenePackEntry` (null estável) — `[1495]` |
| Envelope no `Image source` | `resolveSceneImageForStory` retorna `.source` — `[1496]` |
| Vazar p/ outra história | gating em `resolveSceneImageForStory` — `[1496]` |
| Mexer em intro/child/progresso | fora do escopo (só linha 165) — `[1497]` |
| Mudança visual com índice vazio | `require` idêntico (prova estrutural + `[1496]`) |

**Rollback:** `git checkout -- src/hooks/useResolvedStoryMedia.js src/screens/StoryBookScreen.js scripts/smoke.js` + `rm docs/F2_1H_SECOND_SCENE_SURFACE_SANDBOX_V2.md`.

---

## 8. Gates

**smoke 1499/1499 ✓** (`[679]`/`[1479]`/`[1488]` atualizados + `[1493]`–`[1499]`) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**. Hook + StoryBookScreen compilam no babel ✓.

---

## 9. Confirmações

- ✅ **Só `david_goliath`** no escopo. ✅ **Só "História ilustrada"** conectada.
- ✅ **"Meu livrinho colorido" não alterado.** ✅ **Prévia da intro no caminho antigo.**
- ✅ **NarrationScreen intacta.** ✅ **TrilhoProgresso não tocado.**
- ✅ **Packs, assets, manifests, áudio, colorir e capas não tocados.** ✅ **Nenhum pack baixado/instalado.**
- ✅ **Sem commit, sem push, sem `git add`.**
