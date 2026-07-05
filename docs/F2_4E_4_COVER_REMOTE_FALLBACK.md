# F2.4e.4 — Cover remoto user-facing com fallback local

> **Bloco:** F2.4e.4 (Fase 2 — piloto híbrido). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · HEAD base `997abca`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.**
> Consumo **user-facing** da **capa** remota do piloto `david_goliath` (`file://` do pack) com **fallback local obrigatório**.

## 1. Objetivo
As superfícies que exibem a capa de `david_goliath` passam a usar o arquivo remoto de cover **quando**
(1) `storyId === david_goliath`, (2) pack `ready`, (3) o arquivo remoto existir e (4) for válido
segundo o índice local (pack ready = validado por bytes+sha256 no download). Caso contrário →
**fallback local**, sem quebrar.

## 2. Mapeamento — consumidores de capa encontrados
| Superfície | Registro local usado | Render |
|---|---|---|
| **StoryMapMarker** (mapa) | `getStoryCover(id)` | `<Image source={cover}>` |
| **StoryFocusModal** (detalhe no mapa) | `getStoryCover(id)` | `<Image source={cover}>` |
| **StoryCard** (Estante) | `images[story.imagemCapa]` | `<Image source={coverImg}>` |
| StoryCoverImage (Hero/Congrats/NextAdventure) | `images[imagemCapa]` ou prop `source` | `<Image>` |
| NarrationScreen | `getStoryCoverImage(id)` | `<Image>` |
| beniChestService | `getStoryCoverImage(id)` | serviço (não-React) |

Registro local central: `src/assets/storyCovers.js` (`getStoryCover` / `STORY_COVERS`) → também via
`getStoryCoverImage` (storyImageService) e `images[]` (assets/images.js).

## 3. Superfícies integradas neste bloco
As **3 superfícies user-facing "mapa · detalhe · card"**: **StoryMapMarker**, **StoryFocusModal**,
**StoryCard**. São onde a criança **navega** a capa de uma história premium (antes/sem abrir).

## 4. Superfícies deixadas para depois (justificativa)
- **StoryCoverImage** (Hero/Congrats/NextAdventure): componente compartilhado por várias telas (maior raio de alteração) — melhor migrar junto com a **migração dos 18 packs** (Fase 3), quando todas as capas vão remoto.
- **NarrationScreen (capa)**: só visível **após abrir** a história (premium/QA); prioridade menor.
- **beniChestService**: **serviço não-React** (não pode usar hook); exige o padrão `resolveStoryMediaFromPackEntry` (async) — bloco próprio.
Nada disso quebra: todas seguem no fallback local até serem migradas.

## 5. Arquivos alterados
- **`src/hooks/useResolvedStoryMedia.js`** — novo hook `useResolvedStoryCover(storyId, localSource)`.
- **`src/components/map/StoryMapMarker.js`** — usa o hook (1 linha).
- **`src/components/map/StoryFocusModal.js`** — usa o hook (antes do `if (!story) return null`, ordem de hooks preservada).
- **`src/components/StoryCard.js`** — usa o hook (1 linha).
- **`scripts/smoke.js`** — +14 checks F2.4e.4; 3 checks atualizados (cover agora consumido; áudio ainda não).
- **`docs/F2_4E_4_COVER_REMOTE_FALLBACK.md`** — este documento.

**Não** tocados: package.json/lock, assets, **theme/tokens/paleta/fontes/design system**, RevenueCat, entitlement/paywall, Brincar, regra de conclusão, Free-sem-salvar, contentResolver, `storyCovers.js`/`images.js` (requires locais preservados).

## 6. Solução aplicada
`useResolvedStoryCover(storyId, localSource)` (mesmo padrão do coloring, F2.4e.3): **fallback local
sempre** (o `localSource` que a superfície já usa — o hook não se acopla a nenhum registro); só
`david_goliath` (gate `SANDBOX_STORY_ID`) + pack `ready` (via `resolveStoryCover` → `sourceType FILE`)
+ arquivo **existente** (`getInfoAsync` **fora do render**) → `{ uri: file://…/cover.webp }`. Reseta ao
trocar história/pack. As capas usam **`<Image source={…}>` nativo** (aceita `{uri}` sem pipeline novo);
o **render/layout permanece idêntico** (só a fonte muda).

## 7–12. Confirmações
- **Fallback local:** ✅ obrigatório — `return remoteSource || localSource`; existência checada antes de trocar (nunca aponta p/ arquivo ausente → **Cenário A/C seguros**).
- **Limite david_goliath:** ✅ gate `SANDBOX_STORY_ID`; outras histórias sempre locais.
- **Sem download em tela user-facing:** ✅ (nenhum downloader nas superfícies).
- **Sem sha256 em tela user-facing:** ✅ (o hash real é no download F2.4e.2; o hook só faz `getInfoAsync`).
- **Sem linguagem técnica para criança:** ✅ nenhuma superfície expõe pack/manifesto/sha256/file/CDN/MB; a capa aparece igual.
- **A Criação/Noé:** ✅ intactas (starter local; hook devolve `localSource` idêntico).
- **F2.4e.3 (coloring):** ✅ intacto (`useResolvedColoringImage` preservado — check dedicado).

## 13. Validação manual no iPhone
**Ambiente:** `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true EXPO_PUBLIC_GLOBAL_MANIFEST_URL=https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/content-manifest.json npx expo start -c`.

- **Cenário A (pack não baixado):** FAB 🛠 packs → **Reset**. Abrir **Mapa** (marcador de Davi e Golias), tocar para o **detalhe** (StoryFocusModal), e a **Estante** (card) → capa vem do **fallback local**; não quebra; sem erro técnico.
- **Cenário B (pack ready):** FAB packs → **Download TODAS** → confirmar cover 1/1, scene 10/10, coloring 10/10, audio 10/10, `usesPack=true`. Abrir mapa/detalhe/card de Davi e Golias → capa vem do **`file://` remoto**; **experiência visual igual**; **sem travar**; **sem piscar excessivamente**; sem linguagem técnica.
- **Cenário C (reset após download):** Reset → abrir mapa/detalhe/card de novo → volta ao **fallback local**; não aponta para `file://` antigo.
- **Cenário D (outras histórias):** A Criação/Noé locais; nenhuma outra consome remoto.

## 14. Confirmações de não-escopo
Sem `git add`/commit/push · sem dependência nova · sem package.json/lock · sem assets · **sem alterar
design system/tokens/paleta/fontes/layout** · sem RevenueCat/entitlement/paywall · sem Brincar · sem
regra de conclusão total · sem Free-sem-salvar · sem F2.4e.5/f · sem migração das 18 premium · sem
remover requires locais.

## 15. Próximo passo
Validação manual no iPhone (cenários A–D). Depois: **F2.4e.5** (áudio remoto user-facing).
