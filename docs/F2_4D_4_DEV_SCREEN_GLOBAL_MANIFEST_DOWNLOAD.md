# F2.4d.4 — Tela dev conectada ao downloader genérico (via manifesto global)

> **Bloco:** F2.4d.4 (Opção B, passo 4). **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `ca7eb1d`.
> Conecta a `PackSandboxDevScreen` (dev-only) ao downloader genérico
> `downloadStoryPackScenesFromGlobalManifest` (F2.4d.3), para validar no iPhone o download de
> `david_goliath` a partir do `content-manifest.json` global publicado no R2.
> Relacionado: [contrato F2.4d.1](F2_4D_1_GLOBAL_MANIFEST_CONTRACT.md) · [serviço F2.4d.2](F2_4D_2_GLOBAL_MANIFEST_SERVICE.md) · [downloader F2.4d.3](F2_4D_3_GENERIC_STORY_SCENE_DOWNLOADER.md).

## 1. Objetivo

Dar um caminho **visual/manual** (dev-only) para exercitar o downloader genérico por storyId
usando o manifesto global — sem perder o fluxo legado por baseUrl direta, sem tocar o usuário
final.

## 2. Arquivos alterados

- **`src/screens/PackSandboxDevScreen.js`** — nova seção "Download genérico via manifesto global" (campos `globalManifestUrl` + `storyId`, botão, progresso). Import do downloader genérico. Seção legada preservada.
- **`scripts/smoke.js`** — +12 checks F2.4d.4.
- **`docs/F2_4D_4_DEV_SCREEN_GLOBAL_MANIFEST_DOWNLOAD.md`** — este documento.

**Não** tocados: `packDownloadService.js`, `packSandboxDevService.js` (função legada intacta), `contentResolver.js`, `packStorageService.js`, `StoryBookScreen.js`, `stories.js`, entitlement, assets, deps, AppNavigator.

## 3. Como a tela dev usa o manifesto global

Nova ação `onDownloadGeneric` chama:

```
downloadStoryPackScenesFromGlobalManifest({
  storyId,                 // editável; padrão 'david_goliath'
  globalManifestUrl: globalUrl, // editável; colar a URL do content-manifest.json
  appVersion: '1.0.0',
  onProgress: (p) => setDlG(p),
})
```

O downloader busca o manifesto global, resolve o pack por `storyId`, descobre
`baseUrl`/`version`/`manifestPath`, e baixa **só as cenas** — reusando o fluxo seguro
`.tmp → validar bytes → move atômico → ready`. Depois a tela faz `refreshPacks()` + `refresh()`
(diagnóstico), e o resolver passa a servir por `file://`.

### Decisão sobre a URL padrão
Para **preservar o invariante de segurança** "sem storage remoto hardcoded na ferramenta dev",
a `DEFAULT_GLOBAL_MANIFEST_URL` **não** hardcoda o domínio R2: usa `EXPO_PUBLIC_GLOBAL_MANIFEST_URL`
(env) ou um **placeholder** (`https://SEU-DOMINIO/content-manifest.json`). A URL real
(`https://pub-…r2.dev/content-manifest.json`) é **colada manualmente** no campo — mesmo padrão
do campo LAN legado.

## 4. Como o fluxo legado foi preservado

- O botão **"Download david_goliath (10 cenas)"** (baseUrl LAN direta) continua na tela.
- `downloadDavidGoliathPackSandbox` **não** foi alterada nem virou wrapper.
- As duas seções coexistem para **comparar** o fluxo novo (via manifesto global) e o antigo.

## 5. Duplo gate e escopo de mídia

- Tudo continua sob `__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX` (a rota nem é registrada sem o gate; a tela tem `if (!enabled)`), então **nada aparece em produção**.
- O fluxo genérico baixa **somente cenas** (a função `downloadStoryPackScenesFromGlobalManifest` filtra `kind === 'scene'`); cover/colorir/áudio seguem do bundle.

## 6. Como validar no iPhone

1. Rode com o gate: `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true npx expo start -c` → iPhone → FAB **🛠 packs**.
2. **Reset** → confirmar `not_downloaded`, `0/10`, `usesPack=false`, source `require`.
3. Na seção **"Download genérico via manifesto global"**:
   - Colar em `globalManifestUrl`: `https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/content-manifest.json`
   - Confirmar `storyId` = `david_goliath`.
   - Tocar **"Download genérico (david_goliath) — só cenas"**.
4. Aguardar `downloading → verifying → ready`; confirmar `10/10`, `usesPack=true`, source `file`, uris `file://`.
5. Abrir **Davi e Golias**: NarrationScreen e Livrinho renderizam por `file://` (sem imagem quebrada / placeholder permanente / tela vermelha).
6. **Reset** → volta a `require`; Davi e Golias segue pelo bundle.

## 7. O que ainda NÃO faz

- Não baixa cover/colorir/áudio (só cenas — F2.4e).
- Não tem sha256 real (só bytes+existência — F2.4e).
- Não é tela de usuário final; sem entitlement/RevenueCat.

## 8. Limitações

- `r2.dev` é temporário (produção exige domínio próprio).
- Só há pack publicado para `david_goliath` (a função é genérica; o índice tem 1 pack).

## 9. Próximos passos

- **F2.4d.5:** validação no iPhone (este bloco entrega a tela; a validação visual é sua).
- **F2.4e:** cover/colorir/áudio + sha256 real (dep de crypto aprovada).
- **F2.4f:** entitlement/RevenueCat (só planejamento).
