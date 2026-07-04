# F2.4d.2 — `globalManifestService` (read-only)

> **Bloco:** F2.4d.2 (Opção B, passo 2 — primeira fatia de código).
> **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `eca6500`.
> Implementa a camada de **leitura e validação** do manifesto global conforme o contrato
> [F2.4d.1](F2_4D_1_GLOBAL_MANIFEST_CONTRACT.md). **Não** conecta ao download ainda.

---

## 1. Objetivo

Criar o serviço que **busca e valida** o `content-manifest.json` global (índice remoto de
packs), **sem baixar packs, sem instalar, sem alterar a experiência do usuário**. É a base
para o downloader genérico (F2.4d.3) e para a tela dev consumir o manifesto (F2.4d.4).

## 2. Arquivos criados/alterados

- **Criado:** `src/services/globalManifestService.js`
- **Alterado:** `scripts/smoke.js` (+12 checks F2.4d.2, execução real em sandbox)
- **Criado:** `docs/F2_4D_2_GLOBAL_MANIFEST_SERVICE.md` (este documento)

Nenhum outro arquivo tocado (sem contentResolver, serviços de packs, PackSandboxDevScreen, stories.js, contentManifest.js, entitlement, assets ou deps).

## 3. Contrato implementado (API)

- `validateGlobalContentManifest(rawManifest, options)` → `{ ok, data, errors, warnings }`
- `fetchGlobalContentManifest(url, options)` → `Promise<{ ok, data, errors, warnings }>`
- `getPackFromGlobalManifest(manifestOrData, storyId)` → `{ ok, data, errors }`
- Constante `GLOBAL_MANIFEST_VERSION = 1`

`options`: `{ appVersion, knownStoryIds, allowHttp, timeoutMs }`. Todas as funções **nunca
lançam** — sempre retorno estruturado.

## 4. O que o serviço valida (conforme F2.4d.1)

**Raiz:** `manifestVersion === 1`; `generatedAt` ISO válida; `minAppVersion` semver presente; `packs` array.
**Por pack:** `id` (obrigatório, **único**); `storyId` (obrigatório, **único**, **conhecido pelo app**); `version` semver; `type === story`; `access` ∈ {free, premium}; `title` não vazio; `bytes` inteiro positivo; `baseUrl` string, **termina com `/`**, **https** (http só se `allowHttp`); `manifestPath === "manifest.json"`; `manifestSha256` hex64 se presente; `requiredAppVersion` semver; `mediaKinds` só {cover, scene, coloring, audio}; `status` só valores esperados.
**Versão:** `requiredAppVersion` (ou `minAppVersion`) **acima** do `appVersion` **não** é erro de schema → gera **`warning`** e marca o pack com **`requiresAppUpdate: true`** (mapeia para `requires_app_update`).

## 5. O que o serviço NÃO faz

- ❌ Não baixa packs · ❌ não baixa cover/cenas/colorir/áudio · ❌ não instala pack.
- ❌ Não grava AsyncStorage · ❌ não chama `setPackEntry`/`clearPackEntry` · ❌ não toca `contentResolver`.
- ❌ Não dispara download · ❌ não hardcoda a URL `r2.dev` · ❌ não altera entitlement/RevenueCat.
- ❌ Não conecta a nenhuma tela de usuário final.

## 6. Verificação (smoke — execução real em sandbox)

12 checks `[1526]–[1537]`, incluindo **round-trip real** do módulo (validador rodado contra
fixtures): manifesto válido passa; duplicidade de `id` falha; duplicidade de `storyId` falha;
`storyId` desconhecido falha; `baseUrl` sem barra falha; `baseUrl` http em produção falha;
`mediaKind` inválido falha; `requiredAppVersion` alto → `requires_app_update`/warning sem
erro de schema; `getPackFromGlobalManifest` encontra `david_goliath` e reporta erro para
ausente; e a garantia **read-only** (código sem storage/resolver/download).

**Gates:** smoke **1537/1537** ✓ · expo-doctor **18/18** ✓ · audio **200/200** ✓.

## 7. Limitações

- `content-manifest.json` real **ainda não existe** no R2 (só o contrato + este serviço).
- `manifestSha256` é validado no **formato** (hex64); verificação real de hash pende de dep de crypto (F2.4e).
- `fetch` não é exercitado pelo smoke (rede/impuro); é coberto por validação estática + validação manual futura.

## 8. Próximo passo

**F2.4d.3** — baixador **genérico por storyId** (reusa `.tmp → validar → move → ready`),
consumindo a `baseUrl`/`version`/paths resolvidos por este serviço; **ainda dev-gated**, ainda
**só cenas**, com **paridade** garantida para `david_goliath`.
