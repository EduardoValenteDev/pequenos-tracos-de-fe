# F2.2b — Ferramenta DEV-ONLY de pack sandbox no device (`david_goliath`)

> **Bloco:** F2.2b (Fase 2 §19). **Ferramenta somente de desenvolvimento.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD inicial `c1f6411`.
> **Regra central:** cria `file://` REAIS no device (copiando as 10 cenas de `david_goliath`
> do bundle → `documentDirectory`) e marca o pack `ready` em `@ptf_packs_v1` — **tudo sob
> DUPLO GATE** (`__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true'`). **Sem R2, sem
> download real, sem RevenueCat/entitlement.** **Não commitado, não pushado, sem `git add`.**

---

## 1. Resumo executivo

Implementei uma ferramenta **dev-only** (serviço + tela + acesso) para **semear**, **resetar**
e **diagnosticar** um pack sandbox `ready` de `david_goliath` no iPhone, criando `file://`
reais a partir dos assets do bundle (via `expo-asset` + `expo-file-system`). É a **primeira
escrita real** em `@ptf_packs_v1` — mas **só sob o duplo gate**. Com o gate desligado: nenhuma
rota/tela/FAB, nenhum seed/reset, nenhuma escrita em AsyncStorage/FileSystem. Gates: **smoke
1511/1511 · doctor 18/18 · audio 200/200**.

---

## 2. Escopo

**Criados:** `src/services/packSandboxDevService.js`, `src/screens/PackSandboxDevScreen.js`, `docs/F2_2B_PACK_SANDBOX_DEVICE_DEV_TOOL.md`.
**Alterados:** `src/navigation/AppNavigator.js` (rota `PackSandboxDev` + FAB, **só sob o gate**); `scripts/smoke.js` (+9 guards F2.2b; `[1470]`/`[1476]` atualizados para excluir a tela dev sancionada).
**Intocado:** as 3 telas conectadas (NarrationScreen/StoryBookScreen), contentResolver, PacksContext, packStorageService, storyImageService, BeniChest, TrilhoProgresso, StoryDetail, assets, loaders de mídia, áudio, colorir, capas, R2, RevenueCat.

---

## 3. Onde ficou o acesso (dev)

- **Rota** `PackSandboxDev` (Stack) — registrada **só** com `devPacksEnabled` no `AppNavigator`.
- **FAB flutuante "🛠 packs"** (canto inferior direito) — renderizado **só** com `devPacksEnabled`; abre a tela via `navigationRef.navigate('PackSandboxDev')`.
- Ambos tocam **apenas** o `AppNavigator`. Sem o gate, **não existem**.

---

## 4. Contratos

### `isPackSandboxDevEnabled()` (duplo gate)
`return __DEV__ && process.env.EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true';`

### `seedDavidGoliathPackSandbox()`
1. Aborta se o gate estiver falso.
2. `makeDirectoryAsync(localDir + 'scenes/', {intermediates:true})`.
3. Para cada cena 1..10: `Asset.fromModule(getSceneIllustrationAsset('david_goliath', n)).downloadAsync()` → `copyAsync({ from: asset.localUri, to: localDir + 'scenes/david_goliath_scene_NN.webp' })` → `getInfoAsync` (existência + bytes).
4. **Só se 10/10 válidas** → `setPackEntry('david_goliath', { version:'1.0.0', status:'ready', localDir, totalBytes })`. **Nunca marca ready com arquivo faltando.**

### `resetDavidGoliathPackSandbox()`
Aborta sem gate · `clearPackEntry('david_goliath')` · `deleteAsync(localDir, {idempotent:true})` · idempotente.

### `diagnoseDavidGoliathPackSandbox()`
Read-only: `status`, `localDir`, `version`, `filesFound (N/10)`, `totalBytes`, `usesPack`, e por cena `{ exists, size, sourceType, uri }` — usando **`resolveStoryScene`** (require|file) e **`resolveStoryMedia`** (usesPack).

---

## 5. Passo a passo (validação no iPhone)

### Ligar a flag
No `.env`/ambiente do Expo (dev): **`EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true`**.

### Rodar o Expo (bundle limpo)
```
EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true npx expo start -c
```
(ou exporte a variável antes; `-c` garante bundle novo). Abra no iPhone (Expo Go).

### Acessar a tela dev
Toque no **FAB "🛠 packs"** (canto inferior direito). Só aparece sob o duplo gate.

### Seed
Toque **Seed**. Esperado: `status = ready`, `arquivos 10/10`, `usesPack = true`, `sourceType = file` em todas as cenas, `uri` começando com `file:///…/packs/david_goliath@1.0.0/scenes/…`.

### Validar `file://` no diagnóstico
Confira na tela: **usesPack true**, **sourceType file** (verde) e as **uri file://** por cena.

### Testar as 3 superfícies conectadas (Davi e Golias)
1. **NarrationScreen** (abrir a história): as cenas devem renderizar (agora por `file://`).
2. **Livrinho — "História ilustrada"**: páginas renderizam por `file://`.
3. **Livrinho — prévia da intro**: thumbnail renderiza por `file://`.
(Confirme sem tela branca / imagem quebrada / flicker.)

### Reset
Toque **Reset**. Esperado: `sourceType = require`, `usesPack = false`, arquivos apagados; as 3 superfícies voltam ao **fallback local (`require`)**.

### Desligar a flag
Remova/zere `EXPO_PUBLIC_ENABLE_PACK_SANDBOX` e rode `npx expo start -c`. O FAB e a rota **somem**; nada dev roda.

---

## 6. Riscos · Mitigações
- **`file://` inexistente:** o seed valida **10/10 antes** de marcar ready (o resolver não checa existência).
- **Índice persistente:** use **Reset**; tudo sob o duplo gate.
- **Prod:** `__DEV__` falso → rota/FAB/seed inexistentes.
- **Expo Go vs build:** validar no mesmo ambiente das validações anteriores (Expo Go no iPhone).

---

## 7. Gates
**smoke 1511/1511 ✓** (`[1503]`–`[1511]`; `[1470]`/`[1476]` atualizados) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**. Serviço/tela/navegador compilam no babel ✓.

---

## 8. Confirmações
- ✅ Duplo gate em tudo. ✅ Sem gate → nada aparece/roda/escreve.
- ✅ **F2.1j não iniciado** · **BeniChest não tocado** · **TrilhoProgresso não tocado** · **StoryDetail não tocado**.
- ✅ **R2, download real, RevenueCat, entitlement, compras não tocados.**
- ✅ **Assets, manifests, áudio, colorir, capas não tocados.** ✅ **As 3 telas conectadas intactas.**
- ✅ **Sem commit, push ou `git add`.**
