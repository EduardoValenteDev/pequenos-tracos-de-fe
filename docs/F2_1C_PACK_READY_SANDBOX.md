# F2.1c — Simulação de pack `ready` e resolução `file://` (`david_goliath`)

> **Bloco:** F2.1c (Fase 2 §19 — piloto de packs premium). **Prova de resolução.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD `243922f`.
> **Regra central:** a simulação roda **FORA das telas e FORA do repo**. Nenhuma tela
> consome o runtime; nenhum AsyncStorage real é gravado; `david_goliath` continua no
> binário como fallback; o comportamento visual do app **não muda**. **Não commitado,
> não pushado, sem `git add`.**

---

## 1. Resumo executivo

Provei, ponta a ponta e sem tocar o app, o fluxo **pack `ready` → resolução `file://`**:
instalei o pack sandbox de `david_goliath` num "runtime" local (fora do repo), registrei-o
como `ready` num índice JSON sandbox, e chamei o **`contentResolver` real** (carregado por
avaliação isolada, com stubs no lugar das dependências Expo) — que resolveu **as 31 mídias
como `file://` apontando para arquivos existentes**. O **fallback local** (remote sem pack →
`require`) continua funcionando e **nenhuma tela** importa o runtime. Dois scripts novos
(`install-sandbox-pack.js`, `verify-sandbox-resolver.js`) + um helper aditivo no resolver
(`resolveStoryMediaFromPackEntry`). Gates: **smoke 1465/1465 · doctor 18/18 · audio 200/200**.

---

## 2. Escopo

**Criados (versionáveis):**
- `scripts/assets-pipeline/install-sandbox-pack.js` — instala o pack num runtime sandbox (copia → `.tmp` → valida → move → índice `ready`).
- `scripts/assets-pipeline/verify-sandbox-resolver.js` — carrega o resolver real e prova as 31 resoluções `file://`.
- `docs/F2_1C_PACK_READY_SANDBOX.md` — este documento.

**Alterados (aditivos):**
- `src/services/contentResolver.js` — **+1 função aditiva** `resolveStoryMediaFromPackEntry` (delega aos resolvers existentes; não usada por telas; não muda comportamento).
- `scripts/smoke.js` — **+6 checks F2.1c**.

**Gerado FORA do repo (NÃO versionado):** o runtime sandbox e o índice em `C:\tmp\ptf_pack_runtime\`.

**Intocado:** `assets/`, loaders de mídia, telas, rotas, jornada, `ProgressContext`,
`storyJourneyService`, RevenueCat, Brincar, Beni, colorir, áudio; e `packStorageService`/
`packDownloadService`/`packIntegrityService` (nenhum bug encontrado → nenhuma alteração).

---

## 3. Local do pack fonte

`C:\tmp\ptf_pack_sandbox\packs\david_goliath\v1\` (gerado no F2.1b — 31 arquivos, 17.67 MB,
`manifest.json` + `pack.sha256`). Revalidado no início do bloco: **VÁLIDO ✓**.

## 4. Local da instalação sandbox

`C:\tmp\ptf_pack_runtime\packs\david_goliath@1.0.0\` (diretório de instalação, espelhando a
convenção do runtime real `documentDirectory/packs/<id>@<version>/`).
Índice: `C:\tmp\ptf_pack_runtime\pack-index.json`. **Ambos fora do repo.**

> **Nota de convenção:** staging/R2 usa `packs/<id>/v<n>/` (F2.1b); a **instalação** usa
> `packs/<id>@<version>/`. O conteúdo relativo é idêntico — é isso que o resolver consome.

---

## 5. Formato do índice sandbox (`pack-index.json`)

Espelha o **CacheEntry** de `packStorageService` (mesma forma que o app gravaria em
`@ptf_packs_v1`), mas aqui é **um arquivo JSON local** — **não** AsyncStorage, **não** o app:

```json
{
  "david_goliath": {
    "storyId": "david_goliath",
    "version": "1.0.0",
    "status": "ready",
    "localDir": "file:///C:/tmp/ptf_pack_runtime/packs/david_goliath@1.0.0/",
    "manifestPath": "file:///C:/tmp/ptf_pack_runtime/packs/david_goliath@1.0.0/manifest.json",
    "totalBytes": 18532477,
    "downloadedBytes": 18532477,
    "updatedAt": 1751560432497,
    "errorMessage": null
  }
}
```

`localDir` é um **URI `file://` com barra final** — o resolver monta a mídia como
`localDir + <path relativo do pack>`.

---

## 6. Como o pack foi validado (antes de virar `ready`)

O `install-sandbox-pack.js` segue o fluxo do doc oficial §5–7 (**pack corrompido nunca vira
`ready`**):

1. Copia o pack fonte para **`.tmp/`** (nunca direto no destino).
2. Valida no `.tmp`, **antes de mover**:
   - `manifest.json` passa em **`packManifestService.validateManifest`** (validador do runtime).
   - `pack.sha256` == sha256 do `manifest.json`.
   - **bytes + sha256 de cada um dos 31 arquivos** conferem (crypto nativo do Node).
   - `totalBytes` == soma.
3. Só então **move atômico** (`.tmp → packs/<id>@<version>/`) e **registra `ready`** no índice.
4. Se qualquer validação falhar → apaga o `.tmp`, **não move, não registra** (exit 1).

Resultado: **INSTALADO ✓**.

---

## 7. Como o resolver montou `file://`

O `verify-sandbox-resolver.js` carrega o **`contentResolver.js` real** por avaliação isolada
(remove os `import` de Expo/RN e injeta stubs puros para
`contentManifest`/`packStorageService`/`storyImageService`/`audioService`). Depois lê o índice,
pega a entrada `ready` e chama, para as 31 mídias:

```
resolveStoryMediaFromPackEntry('david_goliath', kind, sceneNumber, packEntry)
  → decide(): layer remote + packEntry.status === 'ready' + localDir + relPathInPack
  → { status: 'ready', sourceType: 'file', source: { uri: localDir + relPathInPack } }
```

Exemplo real:
`file:///C:/tmp/ptf_pack_runtime/packs/david_goliath@1.0.0/scenes/david_goliath_scene_01.webp`.

Cada `uri` foi convertido de volta (`fileURLToPath`) e confirmado **existente no disco**, e o
path relativo foi cruzado com o **manifesto**. O resolver **é o código de produção** — só as
dependências de Expo foram substituídas por stubs para rodar em Node.

---

## 8. Tabela de resoluções

| kind | itens | sourceType | file:// existe | path (exemplo) |
|---|:--:|:--:|:--:|---|
| cover | 1 | `file` | ✓ | `cover.webp` |
| scene | 10 | `file` | ✓ | `scenes/david_goliath_scene_01..10.webp` |
| coloring | 10 | `file` | ✓ | `coloring/scene_01..10.png` |
| audio | 10 | `file` | ✓ | `audio/david_goliath_scene_01..10.mp3` |
| **total** | **31** | **31× `file`** | **31/31 ✓** | — |

- **fallback local** (`packEntry = null`) → `sourceType: require`, `status: not_downloaded` → **OK ✓** (remote sem pack continua abrindo pelo binário).
- **telas sem import do runtime** → **OK ✓**.

---

## 9. Limitações

- **sha256 do runtime no app ainda pendente:** a prova de hash aqui é em Node (crypto nativo).
  `packIntegrityService.computeFileSha256` segue em fallback (sem `expo-crypto`); hash real no
  app exige dep de crypto aprovada (bloco próprio).
- **`packStorageService`/`packIntegrityService` dependem de Expo** → não rodam em Node puro; por
  isso o índice e a validação de arquivos foram feitos em **Node** no sandbox. O `contentResolver`
  (código de produção) **foi executado de verdade** via stubs — só as dependências foram isoladas.
- **`localDir` sandbox** aponta para `C:\tmp` (via `file://`). No app real, `localDir` virá de
  `getPackLocalDir` (`documentDirectory/...`), mas a **montagem `localDir + relPath` é a mesma**.

---

## 10. O que NÃO foi integrado (de propósito)

- Nenhuma tela consome o resolver (StoryDetail/Narration/Coloring intactas).
- **Nenhuma gravação em AsyncStorage real. Nenhum `@ptf_packs_v1` no app.**
- Nenhum `documentDirectory` real tocado; nenhum download real; nenhum R2; nenhum RevenueCat.
- `david_goliath` **continua no binário** como fallback.
- Jornada/`storyJourneyService` **não** ganhou `packState`. F2.1d **não** iniciado.

---

## 11. Riscos

| Risco | Mitigação |
|---|---|
| Pack/índice gerado no repo por engano | `assertOutsideRepo` recusa **source e runtime** no repo; smoke `[1464]` (sem `packs/`/`pack-index.json` no repo) |
| `file://` inválido no RN | `localDir` é URI `file://` com barra final; `verify` confirma existência via `fileURLToPath` (31/31) |
| Regressão no resolver | mudança **só aditiva** (`resolveStoryMediaFromPackEntry` delega); decisão `ready`/fallback intacta; smoke `[1463]`; telas isoladas `[1464]` |
| Pack corrompido vira `ready` | validação no `.tmp` **antes** de mover; falha → não move/não registra (exit 1) |
| sha256 fraco no app | Node prova o pipeline; hash real no app aguarda dep de crypto (bloco próprio) |

---

## 12. Rollback

Nada commitado. Reverter =
`git checkout -- src/services/contentResolver.js scripts/smoke.js` +
`rm scripts/assets-pipeline/install-sandbox-pack.js scripts/assets-pipeline/verify-sandbox-resolver.js` +
`rm docs/F2_1C_PACK_READY_SANDBOX.md`.
Runtime/índice sandbox estão **fora do repo** (`C:\tmp\ptf_pack_runtime`) — apagar é inócuo ao app.

---

## 13. Plano F2.1d (não iniciar agora)

1. **PacksContext** no app: carrega o índice `@ptf_packs_v1` 1× (async) e expõe o `packEntry` para resolução **síncrona** no render.
2. **Integração mínima de leitura** em StoryDetail/Narration **atrás de flag**: prefere pack `ready` (via `resolveStoryMediaFromPackEntry`), fallback local senão — **sem** tirar `david_goliath` do binário.
3. **`getStoryContractStatus` + `packState`** (contrato A0.10 + eixo de disponibilidade física).
4. **Instalação real no app** (sandbox no device, ainda sem R2): `simulateInstallLocalPack` + `markPackReady` gravando `@ptf_packs_v1` de verdade.
5. **Dep de crypto aprovada** → sha256 real no app.
6. **Sem** R2 real, **sem** migrar as outras 17, **sem** colorir final, **sem** RevenueCat.

---

## 14. Gates

**smoke 1465/1465 ✓** (6 checks F2.1c: `[1460]`–`[1465]`) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**.

---

## 15. Confirmações

- ✅ **Não houve gravação em AsyncStorage real.** ✅ **Não houve `@ptf_packs_v1` no app.**
- ✅ **Não houve integração em tela.** ✅ **Não houve R2.** ✅ **Não houve download real.**
- ✅ **`david_goliath` continua no binário como fallback.**
- ✅ Pack fonte, runtime sandbox e `pack-index.json` **fora do repo**; nenhum asset alterado.
- ✅ **F2.1d não iniciado.** ✅ **Sem commit, sem push, sem `git add`.**
