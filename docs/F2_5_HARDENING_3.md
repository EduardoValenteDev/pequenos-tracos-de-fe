# F2.5-hardening-3 — Endurecimento do download remoto (manifestSha256 obrigatório · timeout · cancelamento · gate de rede)

> **Bloco:** F2.5-hardening-3 (área sensível: caminho de sucesso do download + integridade + rede; fluxo SDD com 3 portões). **Data:** 2026-07-06 · **Branch:** `content-integrate-coloring-3` · **HEAD anterior:** `201ba60`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** SUPERSEDED não usados como fonte.

## 1. Contexto e objetivo
Endurecer o fluxo de download remoto de packs **antes de qualquer limpeza destrutiva de disco (2b) e antes da remoção de bundle (F2.5e)**. Escopo **cirúrgico**, tudo em `packDownloadService.js` (+ smoke + doc). **Sem dependência nova.**

## 2. Verificação de compatibilidade (GET público read-only)
`content-manifest.json` vivo (`https://pub-…r2.dev/content-manifest.json`, HTTP 200): **18 packs premium, TODAS com `manifestSha256` (hex 64)**. Nenhuma sem a âncora → tornar `manifestSha256` obrigatório é **seguro** (não bloqueia nenhum pack vivo). *(Leitura pública apenas; R2 não tocado de forma mutável.)*

## 3. Mapa do fluxo (antes)
- `fetchGlobalContentManifest` (globalManifestService) **já** tem timeout 10s + AbortController + erro estruturado.
- `manifestSha256` **já existe** no schema do manifesto global (**opcional**); `getPackFromGlobalManifest` expõe `pack.manifestSha256`.
- `computeFileSha256` (packIntegrityService, `@noble/hashes`) hasheia um arquivo local — **reutilizável** para o `manifest.json`.
- Gaps (todos no downloader): (a) o `manifest.json` baixado **não** era verificado contra a âncora; (b) download do manifesto e dos arquivos **sem** timeout/cancel; (c) **sem** gate de rede explícito.

## 4. O que foi implementado (`downloadStoryPackScenesFromGlobalManifest`)
### `manifestSha256` obrigatório
Após baixar `manifest.json` para `.tmp` e **ANTES** de confiar no schema e de baixar arquivos: exige `pack.manifestSha256` presente (hex 64); `computeFileSha256(mTo)` deve bater. **Ausente/inválido/divergente → `failWith` → fallback local intacto, `.tmp` limpo, nunca ready.** (As 18 packs vivas têm a âncora → happy-path inalterado.)

### Timeout
Helper `withTimeout(runFactory, ms, onTimeout)` (Promise.race com timer; timeout → `onTimeout()` + reject `__timeout`). O `manifest.json` passou a usar `createDownloadResumable` (cancelável) sob `withTimeout(…, manifestTimeoutMs=15000, () => mdl.cancelAsync())`; cada arquivo sob `withTimeout(…, fileTimeoutMs=60000, () => dl.cancelAsync())`. Defaults **internos** do serviço (call-site/dev screen não passam nada). Timeout → cancela o download em voo → `catch` → `failWith` (com `networkError:true`) → require. **Starter nunca passa pela rede.**

### Cancelamento seguro (núcleo, sem UI)
Param `isCancelled?: () => boolean`; `throwIfCancelled(isCancelled)` checado no início, após o manifesto, **antes de cada arquivo**, antes do verify e imediatamente **antes do swap** (o swap `delete→move` **não** é cancelável). Em cancelamento: limpa `.tmp` e retorna `{ ok:false, cancelled:true, reason:'cancelado' }` **SEM `setPackEntry`** → **preserva qualquer entry anterior** (índice consistente). Sem botão "Cancelar" (fora deste bloco); a capacidade fica no núcleo.

### Gate de rede (sem dependência)
Formaliza o gate **já existente**: `!gm.ok` (falha/timeout do fetch global, que já tem timeout) retorna `{ ok:false, reason, networkError }` **antes** de criar `.tmp` ou tocar o índice → erro **limpo** para a tela dev. **Sem `expo-network`/`NetInfo`** (respeita "solução simples já existente").

### Regra do Portão 3 — `failWith` NÃO rebaixa READY
Uma tentativa que **falha não pode rebaixar um pack já `READY`** que funcionava no device. `failWith` agora lê `getPackEntry(storyId)` e **só grava `FAILED` quando NÃO há `READY` anterior**; se houver `READY`, **preserva** (só limpa `.tmp` e retorna `ok:false` + `networkError` quando aplicável). Como toda falha **antes do swap** ocorre com o `localDir` antigo **intacto**, a entry `READY` preservada é legítima. **Nenhum pack parcial vira `READY`** (ready só após `moveAsync`). *(Import de `getPackEntry` de `packStorageService` — leitura de export existente; o arquivo não é alterado.)*

## 5. Invariantes preservadas
Starter (creation/noah) nunca passa por este downloader; fallback local intacto em toda rejeição/cancelamento/timeout/sem-rede; `READY` só após move validado; **um `READY` anterior nunca é rebaixado por uma tentativa que falha antes do swap**; cancelamento nunca grava índice; sem dep nova; R2 intocado; nenhum require removido.

## 6. Arquivos alterados
- `src/services/packDownloadService.js` — núcleo (manifestSha256 + timeout + cancelamento + gate de rede + `failWith` preserva READY + import de `getPackEntry`).
- `scripts/smoke.js` — bloco de checks F2.5-hardening-3.
- `docs/F2_5_HARDENING_3.md` — este documento.

**NÃO alterados:** `globalManifestService.js`, `packIntegrityService.js`, `packStorageService.js`, `PacksContext.js`, `contentResolver.js`, `packSandboxDevService.js`, `PackSandboxDevScreen.js`, loaders, assets, `package.json`, R2.

## 7. Testes (smoke)
manifestSha256 obrigatório (rejeita ausente/divergente) + verificado antes dos arquivos/ready; timeout (withTimeout + 15000/60000, manifest + arquivos); cancelamento (isCancelled + ≥4 checagens; ramo sem `setPackEntry`, limpa `.tmp`, retorna `cancelled:true`); `failWith` preserva READY (só FAILED sem READY anterior); gate de rede (`networkError` antes de `.tmp`/índice); READY só após move; sem dep nova (expo-network/NetInfo ausentes no serviço e no package.json); sem GC/precheck; protegidos intactos; nenhum require removido.

## 8. Riscos e rollback
- **Compatibilidade:** ✅ resolvido (18/18 têm `manifestSha256`).
- **Timeout mal calibrado:** defaults conservadores (15s/60s), configuráveis; timeout → require (não quebra, reintenta).
- **Falha durante o swap** (após a marca DOWNLOADING do hardening-2): os arquivos antigos já foram apagados (janela aceita do hardening-2) → `failWith` grava FAILED e a reconciliação de boot também cobre; o caso protegido pela regra do Portão 3 é a **falha antes do swap** (READY preservado).
- **Rollback:** `git revert` do commit; tudo aditivo; **sem mudança de schema** (índice/manifesto inalterados) → downgrade-safe.

## 9. Fora do escopo (registrado)
F2.5-hardening-2b (GC de versões + precheck de espaço + gestão de disco); domínio próprio (F2.5f); UX de download (F2.5d); entitlement (F2.4f); remoção de bundle (F2.5e). Nenhum iniciado.
