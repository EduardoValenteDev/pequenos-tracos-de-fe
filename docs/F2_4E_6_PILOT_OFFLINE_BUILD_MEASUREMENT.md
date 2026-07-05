# F2.4e.6 — Offline completo do piloto + matriz de QA + medição de build/export

> **Bloco:** F2.4e.6 (auditoria + documentação + medição; **sem código de app**). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `28149be`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** Documentos SUPERSEDED (v2.0, visual antigo) **não** usados como fonte de decisão — só histórico.
>
> **Objetivo:** provar que o piloto remoto **`david_goliath`** está **completo e seguro** (todos os kinds via `file://` com fallback local, lifecycle de áudio protegido, offline honesto) **antes** de migrar as 18 premium ou iniciar RevenueCat (F2.4f). Este bloco é a etapa "offline do piloto → build real de medição" da Semana 1 do roadmap v4 (§17).

---

## 1. Preflight (confirmado)
- **Branch:** `content-integrate-coloring-3` · **HEAD:** `28149be` · **local == origin** ✓ · working tree limpo.
- **Publicados (git log):** e.1 `b3fdb96` · e.2 `424972b` · D0.1 `701f551` · e.3 `997abca` · e.4 `b2a735a` · **e.5+e.5p+e.5pR `28149be`**. ✓ Todos no `origin`.

## 2. Auditoria de remoto/fallback por kind (com evidência de código)

**Fonte única de consumo:** `src/hooks/useResolvedStoryMedia.js` (a TELA nunca importa o resolver/`usePacks` direto). Resolver central: `src/services/contentResolver.js` `decide()`.

| Garantia | Evidência |
|---|---|
| **Remoto limitado a `david_goliath`** | Gate `storyId === SANDBOX_STORY_ID` (`SANDBOX_STORY_ID = 'david_goliath'`) em **todos** os hooks — `useResolvedStoryMedia.js:20,39,65,81,115,117,159,161,205,207`. Outras histórias → `packEntry = null` → sempre fallback local. |
| **Consumo exige pack `ready`** | `contentResolver.js:78` — `file://` só quando `packEntry && packEntry.status === PACK_STATUS.READY && packEntry.localDir && relPathInPack`. Caso contrário → require local (`:83-85`). O hook só aceita remoto quando `sourceType === FILE` (`:119,163,209`). |
| **`file://` persistente por kind** | `resolveStoryCover`→`cover.webp` (`:90`); `resolveStoryScene`→`scenes/<id>_scene_NN.webp` (`:95`); `resolveStoryColoring`→`coloring/scene_NN.png` (`:100`); `resolveStoryAudio`→`audio/<id>_scene_NN.mp3` (`:105-106`). Todos = `{ uri: packEntry.localDir + relPath }` (persistido por `expo-file-system`). |
| **Fallback local OBRIGATÓRIO** | Hooks retornam `remoteSource \|\| localSource/localAudioAsset` (`:137,179,225`); cena via `resolveSceneImageForStory` (`:64-69`, fallback `getOfficialSceneIllustration`). Requires locais intactos (`coloringImages.js`, `storyCovers.js`, `storySceneIllustrations.js`, `audioManifest.js`). |
| **Reset volta ao local** | `packStorageService.clearPackEntry` (`:121-126`) `delete index[storyId]` → `getPackEntry` retorna vazio → resolver cai no fallback local; e o hook faz `setRemoteSource(null)` quando `candidateUri` muda (`:126,168,214`) — **nunca segura `file://` antigo**. |
| **Sem download em tela user-facing** | `ColoringScreen`/`NarrationScreen`/`StoryBookScreen`/`StoryCard`/`StoryMapMarker`/`StoryFocusModal`: grep de `downloadStoryPack\|createDownloadResumable\|globalManifest` → **0**. Download vive só em `packDownloadService`/dev tool. |
| **Sem sha256 em tela user-facing** | Grep de `sha256\|computeFileSha256\|packIntegrityService` nessas telas → **0**. sha256 só no downloader/verify (dev). |
| **Sem leitura pesada no render** | `getInfoAsync` (metadata leve, sem hash) roda **dentro de `useEffect`** (`:124,166,212`), nunca no corpo do render; `resolveStory*` é função **pura síncrona** (monta string, sem I/O). Nenhum `fetch` no caminho user-facing. |
| **Sem linguagem técnica para criança** | Termos `pack/sha256/CDN/manifesto/file/MB` aparecem só em **comentários** (removidos por `a1StripComments` no smoke); checks "sem linguagem técnica" (F2.4e.3/e.4/e.5) verdes. |
| **A Criação e Noé locais** | `contentManifest.js:22` `STARTER_STORY_IDS = ['creation','noah']` → `getContentLayer` = `starter` → resolver `:71-74` sempre require local. |
| **Outras histórias não consomem remoto** | 18 premium marcadas `remote` no `contentManifest`, mas o **consumo** é gated a `david_goliath` (SANDBOX). As 17 restantes → `packEntry=null` → fallback local (requires ainda no bundle). |

## 3. Auditoria de lifecycle de áudio (F2.4e.5p/pR — intacto)
39 ocorrências dos tokens de proteção nos 3 arquivos (`StoryBookScreen` 31 · `AudioPlayer` 6 · `NarrationScreen` 2):
- **StoryBook:** `playbackGenerationRef` (token de sessão) · `isPlaybackContextLive()` = `navigation.isFocused() && appActiveRef` · `invalidatePlaybackSession()` · `AppState` (halta só no `'background'`) · guards em `advanceToNextScene`/`onSceneAudioComplete`/timer · `onPlayStart` limpa `isPaused`.
- **AudioPlayer:** `AppState` (pausa no `'background'` + reforça pausa no `'active'` = anti auto-resume) · paused-sync pausa também em `'loading'` · unmount-pause · autoplay gated por `autoPlay`.
- **Narração:** `AudioPlayer` montado só com `isFocused` (desmonta → pausa); play manual; herda AppState do `AudioPlayer`.
- **Background/lock:** sem áudio (StoryBook + AudioPlayer param no `'background'`; sem auto-resume). **Autoplay não duplica** (Narração não passa `autoPlay`; Livrinho `autoPlay={autoplayActive}` único). **Play/pause/replay coerentes** (handlers intactos; `onPlayStart` reconcilia `isPaused`). Validado no iPhone no bloco anterior (cenários A–G).

## 4. Auditoria offline — HONESTA (dois modos distintos)

Quando o pack está `ready`, **todo** o caminho user-facing é **local**, sem rede:
`getPackEntry` (estado em memória, carregado do `@ptf_packs_v1` no start) → `resolveStory*` (puro) → `getInfoAsync('file://…')` (FS local) → `<Image source={{uri}}>` / `useAudioPlayer({uri})` (lê arquivo local). **Nenhuma tela user-facing baixa nada.**

- **Modo 1 — Offline OPERACIONAL em sessão aberta (validável AGORA no device):** com o pack já baixado, ligar **modo avião** e, **sem recarregar** o Expo Go, navegar por capa/cenas/colorir/áudio/Livrinho → tudo continua pelo `file://`. Prova que o consumo **não depende de rede** e que nada tenta baixar. **É útil, porém NÃO prova offline pós-restart.**
- **Modo 2 — Offline REAL pós-restart (NÃO validável em Expo Go):** app **fechado** + device **offline** + **reaberto**. Em **Expo Go**, o **bundle JS** é servido pelo **Metro** pela rede → reabrir offline **falha** (não é limitação do pack, e sim do Expo Go). **Só é definitivo em BUILD INSTALADO** (dev build / preview / production), onde o JS está **embarcado (Hermes)** no binário. **Este bloco NÃO faz esse build** → o offline pós-restart fica **documentado como pendente de build instalado**, **não** prometido como validado.

> **Honestidade:** afirmamos apenas o Modo 1 (sessão aberta). O Modo 2 exige build instalado + medição — próxima etapa (sob autorização para EAS/prebuild).

## 5. Matriz de QA manual do piloto (iPhone) — a executar
Ambiente: `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true EXPO_PUBLIC_GLOBAL_MANIFEST_URL=https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/content-manifest.json npx expo start -c`

- **A — online, pack resetado:** Reset → Davi e Golias → capa/cenas/colorir/áudio/Livrinho **locais**, sem erro.
- **B — online, pack ready:** Download TODAS → confirmar **cover 1/1 · scene 10/10 · coloring 10/10 · audio 10/10 · usesPack true · file://** → mapa/detalhe/card (capa remota), narração (cenas+áudio remotos), colorir (remoto), Livrinho (cenas+áudio) → sem travar, sem áudio vazando, sem linguagem técnica.
- **C — offline em sessão aberta (Modo 1):** com pack ready, **modo avião**, **sem recarregar** → abrir Davi e Golias → capa/cenas/colorir/áudio/Livrinho pelo `file://`; **não** tenta baixar; **sem** erro técnico para a criança.
- **D — offline + lifecycle de áudio:** ainda offline → Livrinho → tocar áudio → sair para o mapa → **30s**: nenhum áudio continua/volta → background/lock: áudio **para** e **não** retoma sozinho.
- **E — reset após pack:** (online se preciso) Reset → **usesPack false** → Davi e Golias volta ao **fallback local**; nenhum `file://` antigo preso.
- **F — outras histórias:** A Criação local · Noé local · demais como antes.

### 5.1 Validação manual iPhone A–F — APROVADA (2026-07-05)
Matriz A–F **executada e aprovada** no iPhone:
- **A — online, pack resetado:** Davi e Golias abriu com **fallback local** (capa/cenas/colorir/áudio/Livrinho), sem erro técnico. ✓
- **B — online, pack ready:** Download TODAS → diagnose **cover 1/1 · scene 10/10 · coloring 10/10 · audio 10/10 · usesPack true · file://** → capa/cenas/colorir/áudio/Livrinho **remotos**; sem travamento, sem áudio vazando, sem linguagem técnica. ✓
- **C — offline em sessão aberta:** modo avião + sem recarregar o Expo Go → capa/cenas/colorir/áudio/Livrinho via **`file://`**; **nenhum download** em tela user-facing; **nenhum** erro técnico para a criança. ✓
- **D — offline + lifecycle de áudio:** Livrinho → tocar → sair para o mapa → **30s: nenhum áudio continuou nem voltou sozinho**; background/lock **não retomou** áudio. ✓
- **E — reset após pack:** `usesPack` voltou a **false** → fallback local; **nenhum `file://` antigo preso**. ✓
- **F — outras histórias:** A Criação e Noé **locais e funcionando**; demais como antes. ✓

**Conclusão:** **Modo 1 (offline operacional em sessão aberta)** confirmado no device. **Modo 2 (offline real pós-restart)** segue **pendente de build instalado** (§4/§9) — não prometido como validado. O piloto remoto `david_goliath` está **provado** (4 kinds via `file://` + fallback local + lifecycle de áudio protegido).

## 6. Medição de tamanho / assets / export / build (comandos + honestidade)

**Comandos usados:** `du -sh …` (assets, `.git`); `npx expo export --platform ios --output-dir C:/tmp/ptf_f2_4e6_export` (export **fora do repo**, medido e **removido** ao fim); leitura do manifesto R2 (`bytes`).

| Métrica | Valor | O que É (e o que NÃO é) |
|---|---|---|
| **Assets no disco (`assets/`)** | **456 MB** (stories 313 · audio 59 · images 3.0) | Assets versionados no working tree (superset; inclui não-referenciados/backup). |
| **`david_goliath` LOCAL no bundle** | **~18,6 MB** (stories 15 · audio 3,4 · cover 0,17) | Fallback local do piloto — **ainda** no binário (não removido; migração é bloco futuro). |
| **Pack remoto `david_goliath` (R2)** | **18.532.477 bytes (~18,5 MB)** | `content-manifest.json` R2 (`bytes`); kinds cover/scene/coloring/audio; `manifestSha256 23ee6c27…64cdd1`. Espelha o local (mesma mídia). |
| **Export local (`expo export`, iOS)** | **400 MB** = assets **396 MB** + JS **4,5 MB** + metadata 48 KB | Payload de **JS+assets referenciados** (OTA/hosting). **NÃO** é o tamanho instalado. |
| **Bundle JS (Hermes `.hbc`, iOS)** | **4,5 MB** | Código do app compilado (pequeno; o peso é asset, não código). |
| **`.git`** | **2,1 GB** | Bloat de histórico (git gc pendente — fora de escopo; ver auditoria mestre). |

**Distinção honesta dos "tamanhos":**
1. **Repo (working tree)** — dominado por `node_modules` + `.git` 2,1 GB; **não** representa o app.
2. **Assets** — 456 MB no disco; **396 MB efetivamente referenciados** (o que o export inclui).
3. **Export** — 400 MB (JS 4,5 MB + assets 396 MB): payload de assets/OTA, **não** o instalado.
4. **Build instalado REAL** — depende de **build nativo** (Hermes + libs por arquitetura + App Thinning/compressão iOS/Android; `.ipa`/`.aab`). **NÃO medido aqui** (sem EAS/prebuild sem autorização). Só um build EAS/prebuild dá o número real.

**Leitura vs. alvo (v4 §5/§9):** teto do binário base **200 MB** (alvo 40–80). Hoje ~**396–456 MB de assets** → **acima do teto**. O gap fecha com a **migração das 18 premium** (remover requires locais → assets saem do binário → viram packs remotos) **+ compressão** (WebP/áudio). **Este bloco NÃO migra nada**; prova que o caminho remoto do piloto funciona para **habilitar** a migração com segurança.

## 7. Perfis EAS encontrados (`eas.json`) — apenas mapeados, sem build
- **development** — `developmentClient: true`, `distribution: internal`, iOS `simulator: false`, Android `buildType: apk`.
- **preview** — `distribution: internal`, iOS `m-medium`, Android `apk` (medium).
- **production** — iOS `m-medium`, Android `app-bundle` (medium).
- `cli.appVersionSource: local`; **sem** bloco `submit` (sem auto-submit/OTA). **Nenhum build remoto disparado.**

## 8. Confirmações de escopo (este bloco)
Sem `git add`/commit/push · sem dependência nova · sem `package.json`/`package-lock.json` · sem assets · sem RevenueCat/entitlement/paywall · sem Brincar · sem regra de conclusão total · sem Free-sem-salvar · **F2.4f não iniciado** · **18 premium não migradas** (só `david_goliath` consumido) · **requires locais preservados** · sem alteração de design system/tokens/paleta/fontes/layout · **sem EAS build remoto/cloud** · export feito **fora do repo** (`C:/tmp`) e **removido**; `dist/` do repo é **pré-existente (20/05), vazio, gitignorado** — **não** gerado por este bloco. `src/` **intacto** (só auditado).

## 9. Próximo passo
Executar a matriz A–F no iPhone (com foco em C/D para o Modo 1 offline). Para o **offline real pós-restart** e o **tamanho de build instalado**, é preciso um **build instalado de medição** (dev build/preview) — **sob autorização explícita** do Eduardo para rodar EAS/prebuild. Depois: **migração dos 18 packs** (remover requires premium + auditoria de bundle) e **F2.4f (RevenueCat)**.
