# F2.1b — Pack sandbox local de `david_goliath`

> **Bloco:** F2.1b (Fase 2 §19 — piloto de packs premium). **Prova de estrutura.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD `f27ae6e`.
> **Regra central:** o pack é gerado **FORA do repositório**, **não é commitado**, **não é
> integrado às telas** e **não muda o comportamento visual** do app. `david_goliath`
> continua no binário como fallback. **Não commitado, não pushado, sem `git add`.**

---

## 1. Resumo executivo

Criei dois scripts versionáveis (`scripts/assets-pipeline/build-story-pack.js` e
`validate-story-pack.js`) e usei-os para **gerar e validar um pack sandbox de
`david_goliath` fora do repo** (`C:\tmp\ptf_pack_sandbox\packs\david_goliath\v1`). O pack
tem **31 arquivos (17.67 MB)**, `manifest.json` + `pack.sha256`, e **passa no mesmo
validador do runtime F2.1a** (`packManifestService.validateManifest` → ACEITO). Isso prova,
ponta a ponta, a estrutura, a integridade (bytes + sha256) e a compatibilidade do formato
com o resolver criado no F2.1a — **sem R2, sem download real, sem tocar telas/assets**.

---

## 2. Escopo

**Criados (versionáveis, no repo):**
- `scripts/assets-pipeline/build-story-pack.js` — monta o pack (copia assets, calcula bytes/sha256, gera manifest + pack.sha256).
- `scripts/assets-pipeline/validate-story-pack.js` — valida um pack já gerado (integridade + convenção + compat com runtime).
- `docs/F2_1B_PACK_SANDBOX_DAVID.md` — este documento.

**Alterado (aditivo):** `scripts/smoke.js` (+5 checks F2.1b).

**Gerado FORA do repo (NÃO versionado):** o pack sandbox em `C:\tmp\ptf_pack_sandbox\`.

**Intocado:** `assets/`, `storySceneIllustrations.js`, `storyCovers.js`, `coloringImages.js`,
`audioManifest.js`, telas, rotas, jornada, RevenueCat, Brincar, Beni, colorir, áudio, e o
runtime F2.1a (`contentResolver`/`packStorageService`/`packIntegrityService`/`packDownloadService`).

---

## 3. Origem dos assets (fonte de verdade = loaders/manifests atuais)

| Tipo | Fonte no repo | Qtd |
|---|---|---:|
| Capa | `assets/images/david_goliath_cover.webp` | 1 |
| Cenas (WebP) | `assets/stories/david_goliath/scenes/david_goliath_scene_NN.webp` | 10 |
| Colorir (PNG) | `assets/stories/david_goliath/coloring/scene_NN.png` | 10 |
| Áudio (MP3) | `assets/audio/david_goliath/david_goliath_scene_NN.mp3` | 10 |

- **storyId:** `david_goliath` · **título:** `Davi e Golias` (lido de `src/data/stories.js`).
- **camada:** `remote` (`src/data/contentManifest.js`) · **accessType:** `premium`.
- Os scripts **apenas leem e copiam** — os assets de origem ficam **intactos**.

---

## 4. Layout do pack (staging/R2) × diretório de instalação (runtime)

**Gerado (staging — o que iria ao R2 em `packs/<id>/v<n>/`):**
```
packs/david_goliath/v1/
  manifest.json
  pack.sha256
  cover.webp
  scenes/   david_goliath_scene_01.webp … _10.webp
  coloring/ scene_01.png … scene_10.png
  audio/    david_goliath_scene_01.mp3 … _10.mp3
```

**No aparelho (F2.1c+):** `getPackLocalDir(storyId, version)` instala em
`documentDirectory/packs/david_goliath@1.0.0/`. Os **caminhos relativos internos são
idênticos** — é isso que o `contentResolver` consome. Ou seja: o layout de staging (`<id>/v1`)
e o diretório de instalação (`<id>@<version>`) diferem só na **pasta-raiz**; o conteúdo casa 1:1.

**Convenção de caminho interna = `contentResolver` (F2.1a), verificada pelo validador:**
`cover.webp` · `scenes/<id>_scene_NN.webp` · `coloring/scene_NN.png` · `audio/<id>_scene_NN.mp3`.

---

## 5. Manifesto gerado (`manifest.json`)

**Topo (todos os campos exigidos pelo schema `pack-manifest.schema.json`):**
```json
{ "schemaVersion": 1, "id": "story_david_goliath", "version": "1.0.0", "type": "story",
  "minAppVersion": "1.0.0", "totalBytes": 18532477, "files": [ … 31 … ],
  "metadata": { "title": "Davi e Golias", "storyId": "david_goliath", "language": "pt-BR",
                "coverPath": "cover.webp", "createdAt": "…ISO…",
                "generator": "build-story-pack.js F2.1b (sandbox — não é asset final de loja)" } }
```

> **Decisão de compatibilidade (schema tem precedência sobre a instrução da sessão):** o
> schema congelado (`contracts/pack-manifest.schema.json`) tem `additionalProperties:false`
> na raiz e coloca `storyId` **dentro de** `metadata`. Por isso **não** dupliquei `storyId`
> no topo e coloquei `createdAt` em **`metadata.createdAt`** (o schema permite
> `additionalProperties` só em `metadata`). Resultado: o manifesto passa **tanto** no schema
> **quanto** no validador executável `packManifestService.validateManifest`.

**`pack.sha256`** = âncora de confiança (formato `sha256sum`), apontando o hash do manifesto:
```
23ee6c274a7431ecf871fd5b95f8ab138591a1dfbd75cdd841ee7e3b1264cdd1  manifest.json
```
Cadeia: valida `pack.sha256` → confia no `manifest.json` → o manifesto valida cada arquivo (bytes + sha256).

---

## 6. Tabela de arquivos do pack (bytes · dimensões · sha256)

| # | kind | path | bytes | dim | ratio | sha256 (12) |
|--:|---|---|--:|---|---|---|
| 1 | cover | `cover.webp` | 172.764 | 1456×816 | 16:9 | `3bf448774bde` |
| 2 | scene | `scenes/david_goliath_scene_01.webp` | 243.156 | 1122×1402 | 4:5 | `2f111f909544` |
| 3 | scene | `scenes/david_goliath_scene_02.webp` | 235.104 | 1122×1402 | 4:5 | `2f3a89abb3e4` |
| 4 | scene | `scenes/david_goliath_scene_03.webp` | 185.186 | 1122×1402 | 4:5 | `4421feeba6ad` |
| 5 | scene | `scenes/david_goliath_scene_04.webp` | 239.022 | 1122×1402 | 4:5 | `6f8b7f889066` |
| 6 | scene | `scenes/david_goliath_scene_05.webp` | 246.894 | 1122×1402 | 4:5 | `22faa7d0b1e2` |
| 7 | scene | `scenes/david_goliath_scene_06.webp` | 209.596 | 1122×1402 | 4:5 | `0f7f7236fb98` |
| 8 | scene | `scenes/david_goliath_scene_07.webp` | 231.616 | 1122×1402 | 4:5 | `d0c445e373c7` |
| 9 | scene | `scenes/david_goliath_scene_08.webp` | 253.812 | 1122×1402 | 4:5 | `975e1b95cf08` |
| 10 | scene | `scenes/david_goliath_scene_09.webp` | 246.492 | 1122×1402 | 4:5 | `402b3d187d51` |
| 11 | scene | `scenes/david_goliath_scene_10.webp` | 198.720 | 1122×1402 | 4:5 | `369c849713d0` |
| 12 | coloring | `coloring/scene_01.png` | 1.262.019 | 1122×1402 | 4:5 | `8daa7c534b1c` |
| 13 | coloring | `coloring/scene_02.png` | 1.179.925 | 1122×1402 | 4:5 | `272bbb06325f` |
| 14 | coloring | `coloring/scene_03.png` | 1.347.423 | 1122×1402 | 4:5 | `34afdbc0ae9f` |
| 15 | coloring | `coloring/scene_04.png` | 1.241.559 | 1122×1402 | 4:5 | `0876c72a81c8` |
| 16 | coloring | `coloring/scene_05.png` | 1.369.603 | 1122×1402 | 4:5 | `74e9941b91ea` |
| 17 | coloring | `coloring/scene_06.png` | 1.246.897 | 1122×1402 | 4:5 | `e1caaef54892` |
| 18 | coloring | `coloring/scene_07.png` | 1.179.264 | 1122×1402 | 4:5 | `7e3692d838f6` |
| 19 | coloring | `coloring/scene_08.png` | 1.204.101 | 1122×1402 | 4:5 | `e93c63d31479` |
| 20 | coloring | `coloring/scene_09.png` | 1.157.535 | 1122×1402 | 4:5 | `82f121b9d00f` |
| 21 | coloring | `coloring/scene_10.png` | 1.440.128 | 1122×1402 | 4:5 | `96373c10b0f0` |
| 22 | audio | `audio/david_goliath_scene_01.mp3` | 339.318 | — | — | `9f1beb77f815` |
| 23 | audio | `audio/david_goliath_scene_02.mp3` | 390.727 | — | — | `12c134507233` |
| 24 | audio | `audio/david_goliath_scene_03.mp3` | 305.045 | — | — | `8b69b19a8254` |
| 25 | audio | `audio/david_goliath_scene_04.mp3` | 356.036 | — | — | `b5803016b2ce` |
| 26 | audio | `audio/david_goliath_scene_05.mp3` | 343.079 | — | — | `06fb99c7cbb5` |
| 27 | audio | `audio/david_goliath_scene_06.mp3` | 325.525 | — | — | `bffad39488c5` |
| 28 | audio | `audio/david_goliath_scene_07.mp3` | 321.346 | — | — | `26decba94c95` |
| 29 | audio | `audio/david_goliath_scene_08.mp3` | 349.767 | — | — | `9c11f9ab31d3` |
| 30 | audio | `audio/david_goliath_scene_09.mp3` | 357.290 | — | — | `2b23911b2933` |
| 31 | audio | `audio/david_goliath_scene_10.mp3` | 353.528 | — | — | `cfce406eb21e` |

**Peso por categoria:** cenas ~2.29 MB · **colorir PNG ~12.6 MB (dominante)** · áudio ~3.44 MB ·
capa ~0.17 MB → **total 18.532.477 bytes (17.67 MB)** = bate com a estimativa da auditoria F2.0
(~17.5 MB/pack). O colorir PNG confirma-se como maior peso — encolhe no F1.3 (páginas finais).

---

## 7. Validação executada

`node scripts/assets-pipeline/validate-story-pack.js --story david_goliath --out C:/tmp/ptf_pack_sandbox` →
**VÁLIDO ✓ (exit 0)**. Cobre:

1. `manifest.json` e `pack.sha256` existem.
2. **`packManifestService.validateManifest` (validador do runtime) → ACEITO ✓** — prova de
   compatibilidade com `packIntegrityService.validatePackManifest` (que delega a ele).
3. `id = story_david_goliath`, `version` major = 1, `metadata.storyId = david_goliath`.
4. Contagem: 1 cover + 10 scenes + 10 coloring + 10 audio = 31.
5. Extensões corretas (cover/scenes `.webp`, coloring `.png`, audio `.mp3`).
6. Convenção de path == `contentResolver` (regex por kind).
7. Paths seguros (sem `/` inicial, sem `..`); nenhum arquivo vazio.
8. **bytes + sha256 de cada arquivo re-conferidos** contra o disco (crypto nativo).
9. `totalBytes` == soma dos `files.bytes`.
10. `pack.sha256` == sha256 do `manifest.json`.

Além disso, o **build** faz self-check imediato (re-hash) e o **guard anti-commit** foi testado:
apontar `--out` para dentro do repo → **RECUSADO (exit 1)**, sem gravar nada no repo.

---

## 8. Compatibilidade com o runtime F2.1a (conceitual, sem app em execução)

| Peça do runtime | Como o pack casa |
|---|---|
| `packManifestService.validateManifest` | **executado** neste bloco → ACEITO ✓ |
| `packIntegrityService.validateFileEntry/validatePackFiles` | mesmo par bytes+existência+path seguro que o validador Node replicou (o serviço real usa `expo-file-system`, roda só no app) |
| `contentResolver.resolveStory{Cover,Scene,Coloring,Audio}` | os paths do manifesto == os que o resolver monta (`localDir + relPathInPack`) → um pack `ready` resolveria `file://…` corretamente |
| `getPackLocalDir(storyId, version)` | destino no aparelho = `documentDirectory/packs/david_goliath@1.0.0/`; conteúdo interno idêntico ao staging |
| `simulateInstallLocalPack` / `markPackReady` | prontos para o F2.1c consumir este pack (copiar → validar → índice `ready`) |

**Não** foi gravado AsyncStorage real, **não** foi simulado estado `ready` no app, **nenhuma
tela** foi tocada — exatamente como pedido.

---

## 9. Limitações

- **sha256 real do runtime ainda pendente:** `packIntegrityService.computeFileSha256` continua
  em fallback (sem `expo-crypto`). A **prova de hash** deste bloco é feita em Node (crypto
  nativo); no app, a integridade por hash exigirá uma dep de crypto aprovada (bloco próprio).
- **`packIntegrityService` depende de Expo** (`expo-file-system`) → não roda em Node puro; por
  isso a validação de arquivos foi **replicada** no `validate-story-pack.js`. O validador de
  **manifesto** (puro) foi reaproveitado de verdade.
- **Dimensões via `sharp`** (já instalado). Se ausente, o build grava `width/height/ratio = null`
  (sem dep nova).

---

## 10. O que NÃO foi integrado (de propósito)

- Nenhuma tela consome o pack (StoryDetail/Narration/Coloring/Mapa intactas).
- Nenhum download real, nenhum R2, nenhum RevenueCat.
- `david_goliath` **continua no binário** (fallback local — app inalterado).
- Índice `@ptf_packs_v1` **não** recebeu entrada `ready` (nada gravado no app).
- F2.1c **não** iniciado.

---

## 11. Colorir (registro explícito)

- O **colorir usado no pack é o PNG atual, apenas para teste técnico do pipeline de pack.**
- As **páginas finais refinadas continuam pendentes** (bloco próprio, F1.3 — refinamento manual
  + flood fill em aparelho). Não se aplicou WebP lossy no colorir.
- **O pack sandbox não é asset final de loja** — é prova de estrutura/integridade.

---

## 12. Riscos

| Risco | Mitigação |
|---|---|
| Pack gerado dentro do repo por engano | **guard `assertOutsideRepo`** recusa `--out` no repo (testado) + smoke `[1458]` (sem packs/artefatos no repo) |
| Divergência de path pack × resolver | validador checa a convenção por regex (== `contentResolver`) + smoke `[1457]` |
| Hash fraco no app | Node prova o pipeline; integridade real por hash no app aguarda dep de crypto (bloco próprio) |
| Colorir não-final vira asset de loja | registrado (§11): sandbox ≠ loja; F1.3 entrega o final |
| Peso do pack (colorir PNG domina) | conhecido (§6); F1.3 reduz; não bloqueia a prova de estrutura |

---

## 13. Rollback

Nada commitado. Reverter =
`git checkout -- scripts/smoke.js` +
`rm scripts/assets-pipeline/build-story-pack.js scripts/assets-pipeline/validate-story-pack.js` +
`rm docs/F2_1B_PACK_SANDBOX_DAVID.md`.
O pack sandbox está **fora do repo** (`C:\tmp\ptf_pack_sandbox`) — apagar a pasta é inócuo ao app.

---

## 14. Plano F2.1c (não iniciar agora)

1. **Instalação sandbox real (sem R2):** `simulateInstallLocalPack` copia o pack de teste →
   `documentDirectory/packs/david_goliath@1.0.0/`; `packIntegrityService.validatePackFiles`
   (bytes+existência) no app; `markPackReady` grava índice `ready`.
2. **PacksContext:** carrega o índice `@ptf_packs_v1` 1× (async) → resolução sync via `contentResolver`.
3. **Integração mínima de leitura** em StoryDetail/Narration **atrás de flag** (prefere pack
   `ready`, fallback local senão) — **sem** tirar `david_goliath` do binário ainda.
4. **`getStoryContractStatus` + `packState`** (contrato A0.10 + eixo de disponibilidade física).
5. **Dep de crypto aprovada** → sha256 real no app; então `verifying → ready` só com hash OK.
6. **Sem** R2 real, **sem** migrar as outras 17, **sem** colorir final, **sem** RevenueCat.

---

## 15. Gates

**smoke 1459/1459 ✓** (5 checks F2.1b: `[1455]`–`[1459]`) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**.

---

## 16. Confirmações

- ✅ Pack gerado **fora do repo**; **nenhum** asset/artefato de pack entrou no repositório.
- ✅ **Nenhum asset de origem alterado** (só leitura/cópia). **Nenhum require de mídia alterado.**
- ✅ **Nenhuma tela alterada**; runtime F2.1a **segue isolado**.
- ✅ **Sem R2, sem download real, sem RevenueCat.** **F2.1c não iniciado.**
- ✅ **Sem commit, sem push, sem `git add`.**
