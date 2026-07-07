# Plan — Bloco 3: Manifesto global tolerante por pack

> **Feature:** `003-manifesto-global-tolerante` · **Etapa SDD:** 4 (Plan). **Portão Humano 2 (plano): APROVADO por Eduardo (2026-07-07)** com ajuste de precisão sobre dup storyId.
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `8d6b650` · Spec: [spec.md](./spec.md).

## Decisões aprovadas (Portão 2)
1. Erros de **raiz** continuam fatais.
2. Duplicidade de `id` **ou** `storyId` continua **fatal**.
3. Defeitos internos de pack viram **warning** e excluem **apenas** aquele pack.
4. Manifesto continua `ok:true` quando houver subconjunto válido.
5. Subconjunto **vazio** continua `ok:true` se não houver erro fatal.
6. Assinatura pública `{ ok, data, errors, warnings }` **preservada**.
7. `schemaVersion` **fora** deste bloco.
8. Não tocar download user-facing, assets, persistência, colorir, paywall, RevenueCat ou Blocos 1/2/4/5.

### Ajuste de precisão (Eduardo) — precedência dup > defeito de pack
A duplicidade de `storyId` (e de `id`) é **integridade cruzada** e deve ser **fatal mesmo quando uma das entradas duplicadas também tiver defeito por-pack**.
Exemplo: pack A com `storyId` conhecido **e** `baseUrl` inválido, e pack B com o **mesmo** `storyId` → **fatal por duplicidade de `storyId`** (não apenas warning de exclusão de A).
**Implicação técnica:** o registro de dedup (`seenIds`/`seenStoryIds` + detecção de duplicado) deve ocorrer para **todo** pack com `id`/`storyId` **presente e válido**, **independente** de o pack vir a ser excluído por outros defeitos. Ou seja, o `storyId` de um pack excluído por `baseUrl` inválido **ainda entra** em `seenStoryIds`, de modo que uma segunda ocorrência do mesmo `storyId` seja capturada como **fatal**.

## Abordagem técnica (localizada em `validateGlobalContentManifest`)
Separar **erros de raiz** (fatais, no array `errors` compartilhado) dos **defeitos de pack** (acumulados por pack; se houver → `warnings` + **excluir** o pack de `outPacks`), mantendo `id`/`storyId` duplicados como fatais **com precedência** sobre a exclusão por defeito.

### Pseudofluxo (não é código final)
```
errors = []            // FATAL: raiz + integridade cruzada (dup id/storyId)
warnings = []          // soft já existentes + por-pack excluídos
outPacks = []
seenIds = Set(); seenStoryIds = Set()

// RAIZ (inalterado, fatal): manifestVersion, minAppVersion, packs-array (early-return se não-array)

packs.forEach((p, i):
   packDefects = []                      // defeitos por-pack (local, NÃO vão para errors)

   // --- IDENTIFICAÇÃO + DEDUP (precede a decisão de exclusão) ---
   if (id ausente/vazio/inválido) packDefects.push('id...')       // sem id → não deduplica
   else if (seenIds.has(id)) errors.push(`packs[${i}].id duplicado`)   // FATAL
        else seenIds.add(id)                                        // registra SEMPRE (mesmo se excluído por outro defeito)

   if (storyId ausente/vazio/inválido) packDefects.push('storyId...')  // sem storyId → não deduplica
   else if (seenStoryIds.has(storyId)) errors.push(`packs[${i}].storyId duplicado`)  // FATAL
        else {
           seenStoryIds.add(storyId)      // registra SEMPRE (chave do ajuste de precisão)
           if (!knownStoryIds.has(storyId)) packDefects.push('storyId desconhecido')  // warning-exclui
        }

   // --- MALFORMAÇÕES (warning-exclui): version, type, access, title, bytes, baseUrl,
   //     manifestPath, manifestSha256, requiredAppVersion, mediaKinds, status → packDefects.push(...)
   // --- generatedAt (se houver): no máximo warning, nunca packDefects fatal
   // --- SOFT já existente: requiredAppVersion > appVersion → warnings + requiresAppUpdate=true

   if (packDefects.length) warnings.push(`packs[${i}] excluído: ${packDefects.join('; ')}`)  // EXCLUI o pack
   else outPacks.push({ ...p, requiresAppUpdate })
)

ok = errors.length === 0        // errors só contém raiz + dup id/storyId
return { ok, data: ok ? { ...rawManifest, packs: outPacks } : null, errors, warnings }
```
**Mapa da migração vs. código atual:**
- Raiz `:80-86` (minAppVersion, packs-array) → **inalterado** (fatal).
- Dup id `:103` e dup storyId `:109` → **permanecem em `errors`** (fatal), agora registrando `seen*` mesmo para packs que serão excluídos.
- `id`/`storyId` ausente `:102`/`:106-107`, `storyId` desconhecido `:111`, e malformações `:114-148` → migram de `errors` para `packDefects` (→ warning + exclui).
- `requiresAppUpdate` `:150-156` → **inalterado**.
- Retorno `:161-162` → `ok` passa a depender só de `errors` (raiz + dup); `data.packs = outPacks` (só válidos).

## Arquivos a alterar (Implement — etapa futura, NÃO agora)
- `src/services/globalManifestService.js` — função `validateGlobalContentManifest`.
- `scripts/smoke.js` — bloco **F2.4d.2**: checks que hoje esperam `ok:false` nos casos por-pack passam a esperar `ok:true` + warning + pack excluído; **adicionar** caso MISTO, raiz-fatal, dup-fatal (incl. **dup+defeito**), subconjunto-vazio, sem-id. Preservar guards "INTACTOS"; re-ancorar por **conteúdo**, não por linha.
- Docs `docs/F2_4D_1_GLOBAL_MANIFEST_CONTRACT.md` §5 e `docs/F2_4D_2_GLOBAL_MANIFEST_SERVICE.md` §6.
- **Verificar (só alterar se necessário):** `src/services/packDownloadService.js` (`:155-169`) — lê `gm.errors` só em `!ok` e `pack.requiresAppUpdate`; provável nenhuma mudança.

## Constitution Check
- Local-first, 100% JS, **sem dependência nova**, **sem mudança de arquitetura nem de assinatura pública**.
- Área sensível (manifesto remoto defensivo) → **fluxo SDD completo** (3 portões).
- Aditivo e reversível (`git revert` de 1 commit); consumo **dev-only** hoje (único caller `PackSandboxDevScreen`).

## Testes planejados (smoke F2.4d.2)
- **Misto** (1 conhecido válido + 1 desconhecido) → `ok:true`, `packs=[válido]`, `warnings≠[]`.
- **Raiz fatal** (`manifestVersion`/`minAppVersion`/`packs`) → `ok:false`, `data:null`.
- **Dup id** e **dup storyId** → `ok:false`.
- **Dup storyId + defeito por-pack** (A: storyId conhecido + baseUrl inválido; B: mesmo storyId) → `ok:false` (fatal por dup, não só warning) — **cobre o ajuste de precisão**.
- **Sem `id`/`storyId`** → excluído com warning, resto `ok:true`.
- **Único inválido** → `ok:true`, `packs=[]`.
- `generatedAt` inválido → não afeta `ok`.
- Reasseverar checks "flipados" (unknown/noSlash/httpProd/badKind) para `ok:true`+warning.
- `npm run smoke` + `npx expo-doctor` verdes; sem regressão de contagem; guards "INTACTOS" preservados.

## Riscos e rollback
Médio-baixo (consumidor dev-only). Atenção: re-ancorar o F2.4d.2 por conteúdo; não enfraquecer guards de outros blocos. `scripts/smoke.js` é ponto de serialização com Blocos 1/4/5 — este é o **primeiro** a tocá-lo pós-`8d6b650` (base limpa). Rollback: `git revert` (aditivo, sem mudança de assinatura).

## O que NÃO tocar
Motor de download/packs; assinatura pública; `fetchGlobalContentManifest` (rede/timeout/JSON); `requiresAppUpdate`; `r2.dev`; `schemaVersion` (adiado); assets/persistência/colorir/LIVRINHO/paywall/RevenueCat; Blocos 1/2/4/5.
