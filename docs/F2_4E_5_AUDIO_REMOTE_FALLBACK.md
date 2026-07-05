# F2.4e.5 — Áudio remoto user-facing com fallback local

> **Bloco:** F2.4e.5 (Fase 2 — piloto híbrido; **último bloco do piloto user-facing**). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · HEAD base `b2a735a`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.**
> A **narração** de `david_goliath` usa o **áudio remoto** do pack (`file://`) com **fallback local obrigatório**.

## 1. Objetivo
A narração de `david_goliath` toca o áudio remoto **quando** (1) `storyId === david_goliath`, (2) pack
`ready`, (3) o arquivo remoto de áudio da cena existir e (4) for válido segundo o índice local (pack
ready = validado por bytes+sha256 no download). Caso contrário → **fallback local**, sem quebrar.

## 2. Como o áudio funcionava antes
- **audioService** (`getSceneAudio(storyId, sceneKey)`) devolve a entrada do `AUDIO_MANIFEST`: `{ storyId, sceneKey, audioAsset: require('…/scene_NN.mp3'), status }`. `audioAsset` = **require module** do bundle.
- **NarrationScreen**: `sceneAudioEntry = getSceneAudio(story.id, sceneKey)`; renderiza `<AudioPlayer audioAsset={sceneAudioEntry.audioAsset} />` **sem `autoPlay`** (play manual).
- **AudioPlayer** (`expo-audio`): `useAudioPlayer(audioAsset, { updateInterval: 100 })`. Gerencia play/pause/replay/cleanup; `[audioAsset]` só reseta o guard `finishedCalledRef`; autoplay é gated por `autoPlay` (default `false`).

## 3. Registros locais de áudio
`src/data/audioManifest.js` (`AUDIO_MANIFEST`, `require(...)` por cena) → consultado por `audioService`
(`getSceneAudio`/`hasSceneAudio`/`getStoryAudioSequence`). Preservados intactos (fallback).

## 4. Verificação de segurança do player (ponto de atenção do bloco)
`useAudioPlayer` (expo-audio) aceita **nativamente** `AudioSource = number | string | { uri }`. Portanto
`{ uri: 'file://…' }` é fonte válida — **sem gambiarra, sem pipeline novo**. O AudioPlayer **não foi
alterado**: só a **fonte** passada muda; play/pause/replay/cleanup/autoplay permanecem idênticos.

## 5. Arquivos alterados (3 código + 1 doc)
- **`src/hooks/useResolvedStoryMedia.js`** — novo hook `useResolvedStoryAudio(storyId, sceneNumber, localAudioAsset)`.
- **`src/screens/NarrationScreen.js`** — resolve o áudio pelo hook e passa `resolvedAudioAsset` ao `AudioPlayer` (import + 2 linhas).
- **`scripts/smoke.js`** — +16 checks F2.4e.5; 3 checks atualizados (áudio agora consumido → todos os 4 kinds via hook).
- **`docs/F2_4E_5_AUDIO_REMOTE_FALLBACK.md`** — este documento.

**Não** tocados: **`AudioPlayer.js`**, **`audioService.js`**, `audioManifest.js`, package.json/lock, assets, **theme/tokens/paleta/fontes/design system**, RevenueCat, entitlement/paywall, Brincar, conclusão, Free-sem-salvar, contentResolver.

## 6. Solução aplicada
`useResolvedStoryAudio(storyId, sceneNumber, localAudioAsset)` (mesmo padrão de coloring/cover):
**fallback local sempre** (`localAudioAsset` = o require que a superfície já usa); só `david_goliath`
(gate `SANDBOX_STORY_ID`) + pack `ready` (via `resolveStoryAudio` → `sourceType FILE`) + arquivo
**existente** (`getInfoAsync` **fora do render**) → `{ uri: file://…/audio/david_goliath_scene_NN.mp3 }`.
Retorno é **referência estável** (state) → o player **não reinicializa à toa**; reseta ao trocar
cena/pack. Como o NarrationScreen é **play manual** (`autoPlay=false`), o swap local→remoto ocorre no
**load** (antes do play) — sem blip, sem autoplay duplicado.

## 7–15. Confirmações
- **7. Fallback local:** ✅ `return remoteSource || localAudioAsset`; existência checada antes de trocar (Cenários A/C seguros).
- **8. Limite david_goliath:** ✅ gate `SANDBOX_STORY_ID`.
- **9. Sem download em tela user-facing:** ✅. **10. Sem sha256 em tela user-facing:** ✅ (só `getInfoAsync`).
- **11. Sem linguagem técnica para criança:** ✅.
- **12. A Criação/Noé:** ✅ intactas (starter local; hook devolve `localAudioAsset`).
- **13/14. F2.4e.3 coloring + F2.4e.4 cover:** ✅ intactos (checks dedicados).
- **15. play/pause/replay/troca de cena/voltar:** ✅ seguros — **AudioPlayer não alterado**; o hook keyed por `sceneNumber` (troca de cena carrega a fonte certa) e reseta por cena/pack; cleanup/unload do player inalterados; sem `autoPlay` novo (sem autoplay duplicado).

## 16. Validação manual no iPhone
**Ambiente:** `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true EXPO_PUBLIC_GLOBAL_MANIFEST_URL=https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/content-manifest.json npx expo start -c`.

- **Cenário A (pack não baixado):** FAB 🛠 packs → **Reset**. Abrir **Davi e Golias → narração** → tocar áudio de uma cena → **fallback local**; play/pause/replay ok; trocar cena ok; **Voltar para a áudio**; sem erro técnico.
- **Cenário B (pack ready):** FAB packs → **Download TODAS** → confirmar cover 1/1, scene 10/10, coloring 10/10, audio 10/10, `usesPack=true`. Abrir narração → tocar áudio → vem do **`file://` remoto**; play/pause/replay ok; **trocar cena carrega o áudio correto**; **Voltar para o áudio**; sem travar; **sem áudio duplicado**; **sem ficar mudo**; sem linguagem técnica.
- **Cenário C (reset após download):** Reset → abrir narração de novo → tocar → volta ao **fallback local**; não aponta para `file://` antigo.
- **Cenário D (outras histórias):** A Criação/Noé locais; nenhuma outra consome remoto.
- **Cenário E (regressão):** coloring remoto (F2.4e.3) e cover remoto (F2.4e.4) continuam ok; Reset volta tudo ao local.

## 17. Confirmações de não-escopo
Sem `git add`/commit/push · sem dependência nova · sem package.json/lock · sem assets · **sem alterar
design system/tokens/paleta/fontes** · sem RevenueCat/entitlement/paywall · sem Brincar · sem regra de
conclusão total · sem Free-sem-salvar · sem F2.4f · sem migração das 18 premium · sem remover requires
locais · **sem alterar AudioPlayer/audioService** (só a fonte).

## 18. Próximo passo
Validação manual no iPhone (cenários A–E). Com F2.4e.3/e.4/e.5 concluídos, **o piloto user-facing dos
packs (cover+scene+coloring+audio de david_goliath) fica completo** — próximos marcos do v4:
offline completo do piloto + **build real de medição**, depois migração dos 18 packs e **F2.4f** (RevenueCat, código só após o piloto).
