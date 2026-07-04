# F2.1i — Prévia da intro do Livrinho conectada ao resolver (sandbox `david_goliath`)

> **Bloco:** F2.1i (Fase 2 §19). **Menor bloco até aqui — 1 linha efetiva.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD inicial `28c2b4c`.
> **Regra central:** conectar **só a prévia da intro** do Livrinho ao resolver, **só** para
> `david_goliath`, reusando toda a infraestrutura do F2.1h v2. Índice vazio → `require`
> local idêntico. Nada mais muda. **Não commitado, não pushado, sem `git add`.**

---

## 1. Resumo executivo

Conectei a **prévia da intro** do Livrinho (o thumbnail do modo "História ilustrada" no seletor
de modos) ao resolver de cenas — **1 linha efetiva** + limpeza de import. Reusa o
`scenePackEntry` (valor, já computado no F2.1h v2) e `resolveSceneImageForStory` (já importado).
Agora **ambos** os pontos de imagem oficial do Livrinho (páginas + prévia) passam pelo resolver,
e `getOfficialSceneIllustration` **sai da tela** (fica encapsulado no hook). Com índice vazio,
a prévia continua em `require` local idêntico. Gates: **smoke 1502/1502 · doctor 18/18 · audio 200/200**.

---

## 2. Escopo

**Criados:** `docs/F2_1I_INTRO_PREVIEW_SANDBOX.md`.
**Alterados:**
- `src/screens/StoryBookScreen.js` — prévia da intro via `resolveSceneImageForStory`; **`getOfficialSceneIllustration` removido do import** (não é mais usado direto na tela).
- `scripts/smoke.js` — **+3 guards F2.1i** (`[1500]`–`[1502]`) + **atualização** de `[667]`/`[1497]`.

**Intocado:** `useResolvedStoryMedia.js` (**nenhuma** mudança — já tinha tudo), NarrationScreen,
StoryDetail, StoryBookHero, TrilhoProgresso, contentResolver, PacksContext, storyImageService,
storyBookPagesService, assets, loaders de mídia, áudio, colorir, capas, RevenueCat, R2.

---

## 3. O diff (mínimo)

```diff
- import { getOfficialSceneIllustration, preloadStorySceneIllustrations } from '../services/storyImageService';
+ import { preloadStorySceneIllustrations } from '../services/storyImageService';

  // prévia da intro (reusa scenePackEntry e resolveSceneImageForStory já existentes):
- const officialPreview = firstCena ? getOfficialSceneIllustration(story.id, firstCena.id) : null;
+ const officialPreview = firstCena ? resolveSceneImageForStory(story.id, firstCena.id, scenePackEntry) : null;
```
Renderizada por `<Image source={officialPreview} …>` (Image puro; aceita `require` E `{ uri }`;
fallback para capa se `null`).

---

## 4. Garantias

- **Só `david_goliath`:** gating em `resolveSceneImageForStory` (`storyId !== SANDBOX → getOfficialSceneIllustration`). Provado por eval (`[1501]`).
- **Índice vazio → require local:** `scenePackEntry=null` → `resolveStoryScene(...,null).source` = `getOfficialSceneIllustration` (idêntico ao antigo).
- **Outras histórias → `getOfficialSceneIllustration`** (ramo não-david do resolver).
- **Image source só require/`{uri}`:** `resolveSceneImageForStory` retorna `.source`, nunca o envelope.
- **História ilustrada inalterada** (páginas via resolver — F2.1h v2). **"Meu livrinho colorido" inalterado** (arte da criança prioritária). **NarrationScreen inalterada.** **TrilhoProgresso não tocado.**
- **Tela sem runtime direto:** consome só o hook — `[1470]`/`[1476]` verdes.
- Sem `useMemo` novo (a prévia é inline, não memoizada) → **sem risco de recomposição**.

---

## 5. Checks — atualizados e novos

**Atualizados (mesma garantia):**
- `[667]` — a imagem oficial (páginas E prévia) agora é resolvida via `resolveSceneImageForStory` (antes `getOfficialSceneIllustration`); prioridade child > oficial > fallback + 3 selos preservados.
- `[1497]` — a **prévia da intro** agora usa `resolveSceneImageForStory(story.id, firstCena.id, scenePackEntry)`; child art segue prioritária.

**Novos `[1500]`–`[1502]`:** prévia conectada + `getOfficialSceneIllustration` fora da tela + **2 pontos oficiais** via resolver + sem runtime direto; gating por eval (david null→`require`, david ready→`file://`, outra história ready→`require`); superfícies preservadas (História ilustrada `official`, child art, NarrationScreen, loaders locais).

---

## 6. Riscos · Rollback

| Risco | Mitigação |
|---|---|
| Envelope no `Image source` | `resolveSceneImageForStory` retorna `.source` — `[1501]` |
| Vazar p/ outra história | gating no resolver — `[1501]` |
| Mudança visual com índice vazio | `require` idêntico (prova estrutural) |
| Mexer em child/História ilustrada/NarrationScreen | inalterados — `[1502]` |
| Recomposição | N/A — prévia é inline, não memoizada |

**Rollback:** `git checkout -- src/screens/StoryBookScreen.js scripts/smoke.js` + `rm docs/F2_1I_INTRO_PREVIEW_SANDBOX.md`.

---

## 7. Gates

**smoke 1502/1502 ✓** (`[667]`/`[1497]` atualizados + `[1500]`–`[1502]`) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**. StoryBookScreen compila no babel ✓.

---

## 8. Confirmações

- ✅ **Só a prévia da intro** foi conectada. ✅ **Só `david_goliath`** no escopo.
- ✅ **História ilustrada como no F2.1h v2.** ✅ **"Meu livrinho colorido" não alterado.**
- ✅ **NarrationScreen não alterada.** ✅ **TrilhoProgresso não tocado.**
- ✅ **Packs, assets, manifests, áudio, colorir e capas não tocados.** ✅ **Nenhum pack baixado/instalado.**
- ✅ **Sem AsyncStorage real, R2, RevenueCat ou entitlement.** ✅ **Sem commit, push ou `git add`.**
