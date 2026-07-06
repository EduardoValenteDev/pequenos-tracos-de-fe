# F2.5-hardening-2b.i — Pré-checagem de espaço no download remoto (não-destrutivo)

> **Bloco:** F2.5-hardening-2b.i (parte NÃO-destrutiva do 2b; GC fica para o 2b.ii). Fluxo SDD com 3 portões. **Data:** 2026-07-06 · **Branch:** `content-integrate-coloring-3` · **HEAD anterior:** `624d259`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** SUPERSEDED não usados como fonte.

## 1. Contexto e objetivo
Adicionar uma **pré-checagem de espaço** no downloader remoto **antes do download pesado de arquivos**, com early-abort limpo quando o disco não comporta o pack. **Não-destrutivo** — não apaga nada além do `.tmp` da própria tentativa (que o `failWith` já limpava). **Sem dependência nova.** GC, `.tmp` sweep e version-GC ficam para o **F2.5-hardening-2b.ii** (destrutivo, aprovação própria).

## 2. Escopo dividido (Portão 1)
- **2b.i (este):** precheck de espaço, não-destrutivo.
- **2b.ii (futuro):** GC (começando por `.tmp` órfão), destrutivo, aprovação própria.

## 3. O que foi implementado (`downloadStoryPackScenesFromGlobalManifest`)
### Helper puro `spaceNeededBytes`
```js
const SPACE_MARGIN_FLOOR_BYTES = 20 * 1024 * 1024; // 20 MB
function spaceNeededBytes(estimateBytes) {
  const e = Number.isFinite(estimateBytes) && estimateBytes > 0 ? estimateBytes : 0;
  return e + Math.max(Math.ceil(e * 0.2), SPACE_MARGIN_FLOOR_BYTES);
}
```
**Margem aprovada:** `max(⌈20% da estimativa⌉, 20 MB)`; **necessário = estimativa + margem**. PURO/testável (eval no smoke): 100MB→120MB · 50MB→70MB · 10MB→30MB (piso 20MB) · 0/inválido→20MB · 200MB→240MB.

### Precheck (após `totalBytes`, antes do loop pesado)
```js
const neededBytes = spaceNeededBytes(totalBytes);
let freeBytes = null;
if (typeof FileSystem.getFreeDiskStorageAsync === 'function') {
  try { freeBytes = await FileSystem.getFreeDiskStorageAsync(); } catch (_) { freeBytes = null; }
}
if (typeof freeBytes === 'number' && freeBytes < neededBytes) {
  return failWith('insufficient_space');
}
```

## 4. Estratégia da estimativa (full × parcial)
- **Estimativa = `totalBytes = Σ wanted[].bytes`** — só os arquivos selecionados por `requestedKinds`, lidos do `manifest.json` **validado** (após download leve + `manifestSha256` do hardening-3). Precisa para **full E parcial**.
- **`pack.bytes` (manifesto global) NÃO é usado** (evita falso bloqueio ao tratar parcial como pack inteiro). Um download parcial (ex.: só `scene`) é checado contra os bytes das cenas.

## 5. Robustez da API (`getFreeDiskStorageAsync`)
- **Guarda de existência (ajuste do Portão 3):** só chama se `typeof FileSystem.getFreeDiskStorageAsync === 'function'`.
- **`try/catch`:** lançar/retornar `null`/`undefined`/não-número → **prossegue** (não bloqueia).
- **Só bloqueia** com `typeof freeBytes === 'number' && freeBytes < neededBytes`.
- É melhoria de **UX/early-abort** — **não** substitui o fail-safe de ENOSPC (que já cai em `failWith`→require). Reusa o namespace `expo-file-system/legacy` já importado → **sem dep nova**.

## 6. Espaço insuficiente — comportamento
Abort = `failWith('insufficient_space')` (do hardening-3): **limpa o `.tmp`** da tentativa; lê `getPackEntry(storyId)` e **só grava FAILED quando NÃO há READY anterior** (com READY → preserva, não toca índice); retorna `{ ok:false, reason:'insufficient_space' }`. **Não baixa arquivos pesados**, **não cria READY**, **não rebaixa READY anterior**, **sem novo `PACK_STATUS`**, **fallback local preservado**.

## 7. Invariantes preservadas
Starter nunca passa por este downloader; fallback local intacto; READY só após `moveAsync`; READY anterior nunca rebaixado (reusa a regra do hardening-3); nenhum parcial vira READY; sem dep nova; **nada destrutivo** (só o `.tmp` da própria tentativa via `failWith`); R2 intocado.

## 8. Arquivos alterados
- `src/services/packDownloadService.js` — helper `spaceNeededBytes` + precheck.
- `scripts/smoke.js` — bloco de checks F2.5-hardening-2b.i.
- `docs/F2_5_HARDENING_2B_I.md` — este documento.

**NÃO alterados:** `packStorageService`, `PacksContext`, `contentResolver`, `globalManifestService`, `packIntegrityService`, `packSandboxDevService`, `PackSandboxDevScreen`, loaders, assets, `package.json`, R2. **Sem** `packGcService.js`.

## 9. Testes
Smoke: `spaceNeededBytes` (eval real, margem/piso); precheck usa `spaceNeededBytes(totalBytes)`+`getFreeDiskStorageAsync`+`failWith('insufficient_space')`; API-safe (typeof função + try/catch + guarda number); posicionamento (após `totalBytes`, antes do loop); estimativa por `wanted[].bytes` (sem `pack.bytes`); `insufficient_space` é reason (sem novo status); READY só após move + failWith preserva READY; sem GC/`readDirectoryAsync`/`packGcService`/dep nova; protegidos intactos; nenhum require removido. + `expo-doctor` + `git diff --check` + verificação adversarial + validação device.

## 10. Riscos e rollback
- **Falso bloqueio:** eliminado (estimativa por `wanted` + API-safe + guarda de existência).
- **`getFreeDiskStorageAsync` heurístico / margem:** precheck é UX/early-abort; ENOSPC ainda cai em `failWith`.
- **Disponibilidade da API:** a guarda `typeof === 'function'` cobre ausência no surface legacy (não bloqueia).
- **Rollback:** `git revert` do commit; aditivo; sem mudança de schema/índice → downgrade-safe.

## 11. Fora deste bloco (registrado)
GC · `.tmp` sweep órfão · version-GC · `packGcService.js` · `readDirectoryAsync` · limpeza no boot · deleção de versões antigas → **F2.5-hardening-2b.ii** (Portão próprio). Também fora: domínio (F2.5f) · UX download (F2.5d) · entitlement (F2.4f) · remoção de bundle (F2.5e).
