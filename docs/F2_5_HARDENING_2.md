# F2.5-hardening-2 — Consistência índice↔disco (reconciliação em memória) + fix da janela delete→move

> **Bloco:** F2.5-hardening-2 (área sensível: storage/boot/ready; fluxo SDD com 3 portões). **Data:** 2026-07-06 · **Branch:** `content-integrate-coloring-3` · **HEAD anterior:** `bb92f49`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** SUPERSEDED não usados como fonte.

## 1. Contexto e objetivo
O F2.5-hardening-1 blindou o **render** (cena/colorir/capa/áudio caem no require via `getInfoAsync`) e recompôs o `localDir`. Restava um resíduo de **estado**: o índice `@ptf_packs_v1` pode afirmar `ready` sem que os arquivos existam no disco. Este bloco torna o **estado `ready` verdadeiro** — de forma **não-destrutiva** e **read-only** —, antes de qualquer remoção de bundle (F2.5e). **GC de versões e precheck de espaço ficam para o F2.5-hardening-2b** (destrutivo/disco, aprovação própria).

## 2. Problemas tratados (auditoria F2.5-hardening-2 + red-team `wl6scp02h`)
- **P1 (parcialmente mitigado):** índice diz `READY` mas o `localDir`/arquivos podem não existir — janela concreta: **re-download da MESMA versão** entre `deleteAsync(localDir)` e `moveAsync` (packDownloadService.js). O hardening-1 já evita **moldura preta**; o resíduo é o **estado `ready` FALSO** (perigoso para a futura F2.5e).
- **P2 (confirmado):** o boot **não reconcilia** índice↔disco (`PacksContext.loadPacks` confia no `ready` verbatim).

> Bump de versão **não** tem janela de ready falso (o dir antigo sobrevive até o `ready`). `markPackReady` é o único gravador de ready sem validar disco, mas é **dead code** (nunca chamado) → registrado como cleanup futuro, fora deste bloco.

## 3. Solução implementada
### Núcleo PURO — `src/services/packReconcileService.js` (novo)
Funções puras (sem `FileSystem`/`AsyncStorage`/I/O), testáveis por eval no smoke:
- `needsDiskCheck(entry)` — só `ready` com `localDir` reivindica arquivos.
- `isReadyEntryValid(entry, diskProbe)` — **CONSERVADOR**: rebaixa **só** em `exists:false` definitivo; probe indeterminado (`null`, getInfoAsync lançou) → **mantém**.
- `computeInvalidReadyIds(index, probes)` — storyIds `ready` inválidos.
- `reconcileEntry(entry, isInvalid)` — `ready` inválido → `not_downloaded`; válido → **MESMA referência** (estabilidade).

### Reconciliação EM MEMÓRIA — `src/context/PacksContext.js`
- Casca fina `probePackDisk(localDir)` (fora do render): `getInfoAsync` do `localDir` + `manifest.json`; **throw → `{localDirExists:null, manifestExists:null}`** (indeterminado → não rebaixa).
- `useEffect([normalizedIndex])` (roda **após** o índice cru carregar; **não bloqueia** `loadPacks`/1ª pintura) stat-a só entries `ready`, chama o núcleo puro e atualiza o overlay `invalidReadyIds` — com **cancellation** (não aplica resultado antigo) e **`sameIds`** (setState só quando o conjunto muda → sem render à toa).
- `reconciledIndex = useMemo([normalizedIndex, invalidReadyIds])` aplica `reconcileEntry`; `=== normalizedIndex` quando não há inválidos (mesma referência). `getPackEntry`/`getStoryPackState`/`value.packIndex` leem `reconciledIndex`.
- **READ-ONLY preservado:** só `getInfoAsync`; **zero** `setPackEntry`/`savePackIndex`/`clearPackEntry`/`setItem`/download. **Schema persistido intocado** → downgrade-safe. `creation`/`noah` (starter) seguem o ramo INCLUDED (fora do overlay).

### Fix da janela delete→move — `src/services/packDownloadService.js`
Antes do swap `delete(localDir)`→`move`, um **stat SEGURO** de `localDir`:
```js
let preExisting = false;
try {
  const info = await FileSystem.getInfoAsync(localDir);
  preExisting = !!(info && info.exists === true);
} catch { preExisting = false; }          // stat que lança NÃO derruba o download
if (preExisting) {
  await setPackEntry(storyId, { version, status: PACK_STATUS.DOWNLOADING });
}
```
Assim, no **re-download da mesma versão** um crash na janela deixa `DOWNLOADING` (≠READY → require), **nunca READY falso**. Fresh/bump não têm `localDir` pré-existente → **sem marca** (inalterado; pack antigo do bump preservado). **READY continua só após o `moveAsync` validado** (L intacto); erros reais de delete/move/sha/download seguem para `failWith` (FAILED + `.tmp` limpo + require).

## 4. Invariantes preservadas
creation/noah locais; premium sem ready-**válido**→require; `ready` só com índice **e** disco consistentes; arquivo faltando não gera ready falso **nem** moldura preta; **PacksContext read-only**; falha de download nunca deixa ready; reset dev intacto; R2 intacto; nenhum require removido; estabilidade referencial preservada.

## 5. Arquivos alterados (2 novos + 3 modificados)
- **novo** `src/services/packReconcileService.js` — núcleo puro.
- `src/context/PacksContext.js` — casca FS + reconciliação + overlay + `reconciledIndex`.
- `src/services/packDownloadService.js` — `DOWNLOADING` antes do swap (safe stat).
- `scripts/smoke.js` — bloco de checks F2.5-hardening-2.
- **novo** `docs/F2_5_HARDENING_2.md` — este documento.

**NÃO alterados:** `contentResolver.js`, `packStorageService.js` (só importado), `StoryBookScreen.js`, `packSandboxDevService.js`, loaders, assets, R2.

## 6. Testes
- **Smoke (eval REAL do núcleo puro):** ready+disco-ok→válido; localDir/manifest ausente→inválido; probe `null`→conservador; não-ready não vira ready; `reconcileEntry` preserva referência do válido; `computeInvalidReadyIds` isola o inválido; módulo é puro. + PacksContext (reconcilia, read-only, cancellation, `sameIds`, getters em `reconciledIndex`) + packDownloadService (DOWNLOADING com safe stat + ordem DOWNLOADING/move/ready) + escopo (sem GC/precheck/hardening-3) + protegidos intactos + nenhum require removido.
- **Gates:** `npm run smoke` · `npx expo-doctor` · `npm run audio:audit` · `git diff --check`.
- **Verificação adversarial independente** (padrão do hardening-1) rodada após os gates.

## 7. Validação manual prevista (device)
Baixar pack→`ready`→abrir (`file://`); **reabrir app**→segue ready (reconciliação confirma); reset→require; **re-download**→`DOWNLOADING`→`READY`; regressão creation/noah/Livrinho/áudio. **Nota:** não há afordância dev-only segura para deixar "índice ready + localDir apagado" (o reset apaga índice **e** dir juntos) → a prova do rebaixamento é **smoke (eval puro) + inspeção de comportamento**.

## 8. Fora do escopo (registrado)
- **F2.5-hardening-2b:** GC de versões antigas (destrutivo) + precheck de espaço (`getFreeDiskStorageAsync`) + gestão de disco.
- **F2.5-hardening-3:** `manifestSha256` obrigatório, timeout/cancelamento, gate de rede.
- **Cleanup futuro:** remover `markPackReady` (dead code); unificar a convenção de path (hoje duplicada no resolver).

### Ressalva dev-only — reconciliação × seed (verificação adversarial `wi1jslm15`)
A reconciliação usa **`localDir` + `manifest.json`** como prova de disco. O **seed dev-only** de `david_goliath` (`seedDavidGoliathPackSandbox`, ferramenta "Semear" sob duplo gate) pode marcar `ready` **sem gravar `manifest.json`** (copia só `scenes/`). Consequência: um pack **semeado** pode ser rebaixado para `not_downloaded` no boot pela reconciliação. **Impacto user-facing NULO** — o fallback local (require) continua servindo as mesmas cenas, sem moldura preta. **Produção / download real NÃO é afetado**, pois o downloader real grava `manifest.json` na raiz do pack. **Classificação: limitação dev-only da ferramenta**, follow-up para **F2.5-hardening-2b** ou micro-bloco dev-only (alinhar `probePackDisk` ao seed **ou** o seed gravar `manifest.json`). **Não corrigido neste bloco** (o `packSandboxDevService` é protegido aqui).

## 9. Rollback
`git revert` do commit único. Tudo **aditivo**; `packReconcileService.js` deletável; **sem mudança de schema persistido** (reconciliação em memória) → app antigo lê o índice cru como antes.
