# F2.4e.3 — Coloring remoto user-facing com fallback local

> **Bloco:** F2.4e.3 (Fase 2 — piloto híbrido). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · HEAD base `701f551`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.**
> Primeiro **consumo user-facing** de mídia remota do pack: a página de **colorir** de `david_goliath`
> vem do arquivo remoto (`file://` do pack persistente) quando disponível, com **fallback local obrigatório**.

## 1. Objetivo
Conectar a tela de colorir ao arquivo remoto de coloring do piloto `david_goliath` **quando** (1)
`storyId === david_goliath`, (2) o pack estiver `ready`, (3) o arquivo remoto da cena **existir** e
(4) for válido segundo o índice local (pack ready = validado por bytes+sha256 no download). Se
qualquer condição falhar → **fallback local** (comportamento atual), sem quebrar.

## 2. Como o ColoringScreen funcionava antes
- `ColoringScreen` obtinha a lineart por `const imageSource = getColoringImage(story.id, cena.id)` (require do bundle, `../assets/coloringImages`).
- `ColoringCanvas` recebia `imageSource` (um **require module**) e fazia `Asset.fromModule(imageSource)` → `localUri` (file:// do bundle) → `readAsStringAsync(base64)` → **data URL** → WebView (flood fill).

## 3. Arquivos alterados
- **`src/hooks/useResolvedStoryMedia.js`** — novo hook `useResolvedColoringImage(story, cenaIndex)`.
- **`src/components/ColoringCanvas.js`** — passa a aceitar `{ uri }` além de require (chave de cache + resolução do `localUri`); pipeline `file://→base64→dataURL` **inalterado**.
- **`src/screens/ColoringScreen.js`** — usa o hook no lugar de `getColoringImage` direto (1 linha + import).
- **`scripts/smoke.js`** — +15 checks F2.4e.3; 5 checks atualizados (superfícies permitidas agora incluem ColoringScreen; cache por `cacheKey`).
- **`docs/F2_4E_3_COLORING_REMOTE_FALLBACK.md`** — este documento.

**Não** tocados: package.json/lock, assets, RevenueCat, entitlement/paywall, Brincar, regra de conclusão, Free-sem-salvar, contentResolver, `coloringImages.js` (requires locais preservados), demais telas.

## 4. Solução aplicada
`useResolvedColoringImage(story, cenaIndex)` (reaproveita o padrão das cenas remotas):
1. **Fallback local sempre:** calcula `localSource = getColoringImage(story.id, cena.id)`.
2. **Candidato remoto** só para `david_goliath` (gate `SANDBOX_STORY_ID`): usa `resolveStoryColoring(storyId, sceneNumber, packEntry)`; se `sourceType === FILE` (pack ready) → `candidateUri` (`file://…/coloring/scene_NN.png`, mesma convenção de path das cenas). `sceneNumber = cenaIndex + 1`.
3. **Existência confirmada FORA do render** (`useEffect` + `getInfoAsync`, sem hash): se o arquivo existe → `setRemoteSource({ uri })`; senão mantém local. Reseta a cada troca de cena/pack.
4. Retorna `remoteSource || localSource`.
No canvas, `imageSource` object com `.uri` → usa a uri direta (sem `Asset.fromModule`); o resto do pipeline é idêntico.

## 5. Fallback local — confirmação
O hook devolve `getColoringImage(...)` em **todos** os casos que não sejam "david_goliath + pack ready +
arquivo existente": outras histórias (A Criação/Noé/etc.), david_goliath sem pack, ou arquivo remoto
ausente (ex.: download só de cenas). Nunca aponta para arquivo inexistente (existência checada antes
de trocar). `coloringImages.js` (requires locais) permanece intacto.

## 6. Limite apenas para david_goliath
Gate `storyId === SANDBOX_STORY_ID` no hook: para qualquer outra história, `candidateUri` é sempre
`null` → sempre `localSource`. Nenhuma outra história passa a consumir remoto neste bloco.

## 7. Sem download / sem sha256 no ColoringScreen
- ColoringScreen **não** baixa arquivo (nenhum `downloadAsync`/`createDownloadResumable`/downloader).
- ColoringScreen **não** calcula sha256 (o hash real acontece no **download**, F2.4e.2, antes do ready).
- O hook só faz `getInfoAsync` (metadados, leve, fora do render). Sem leitura pesada em render, sem bloquear o JS thread.

## 8. Sem linguagem técnica para criança
Nenhum texto user-facing menciona pack/manifesto/sha256/file/require/CDN/MB. As mudanças são de
resolução de fonte (invisíveis para a criança): a página de colorir aparece igual.

## 9. A Criação e Noé
Intactas — são `starter` (local, fora do gate sandbox); o hook devolve o require local idêntico ao
anterior. Verificado por smoke (superfícies permitidas + fallback local).

## 10. Validação manual no iPhone
**Ambiente:** `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true EXPO_PUBLIC_GLOBAL_MANIFEST_URL=https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/content-manifest.json npx expo start -c`.

- **Cenário A (pack não baixado):** FAB 🛠 packs → **Reset**. Abrir **Davi e Golias** → **Colorir** → deve usar **fallback local**; não quebra; sem erro técnico.
- **Cenário B (pack ready):** FAB packs → **Download TODAS as mídias** → confirmar cover 1/1, scene 10/10, coloring 10/10, audio 10/10, `usesPack=true`. Abrir Davi e Golias → **Colorir** → a lineart vem do **`file://` remoto**; **experiência visual igual**; **flood fill** ok; **zoom/pan** ok; **Pronto** ok; **Voltar** ok; sem travar.
- **Cenário C (reset após download):** FAB packs → **Reset**. Abrir Colorir de Davi e Golias de novo → volta ao **fallback local**; não aponta para `file://` antigo; não quebra.
- **Cenário D (outras histórias):** A Criação e Noé continuam locais; nenhuma outra história consome remoto.

## 11. Confirmações de não-escopo
Sem `git add`/commit/push · sem dependência nova · sem package.json/lock · sem assets · sem
RevenueCat/entitlement/paywall · sem Brincar · sem regra de conclusão total · sem Free-sem-salvar ·
sem F2.4e.4/e.5/f · sem migração das 18 premium · sem remover requires locais.

## 12. Próximo passo
Validação manual no iPhone (cenários A–D). Depois: **F2.4e.4** (cover user-facing) → **F2.4e.5** (áudio).
