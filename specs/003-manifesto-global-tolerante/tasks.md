# Tasks — Bloco 3: Manifesto global tolerante por pack

> **Feature:** `003-manifesto-global-tolerante` · **Etapa SDD:** 5 (Tasks) + 6 (Analyze). **Portão Humano 3: APROVADO por Eduardo (2026-07-07).**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `8d6b650` · Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md).
> Ordem de execução autorizada: **T1 → T2 → T3 → T4 → T5 → T6**.

## T1 — Refatorar `validateGlobalContentManifest` (núcleo raiz-vs-pack) · `src/services/globalManifestService.js`
- Introduzir `packDefects` local por pack no `forEach`.
- **Raiz (FATAL, inalterado):** `manifest` não-objeto, `manifestVersion` ≠ 1, `minAppVersion` semver, `packs` não-array (early-return).
- **`generatedAt`:** mudar de `errors.push` (`:79`) para **`warnings.push`** (no máximo warning — decisão Eduardo).
- **Identificação + dedup (precede a exclusão):** `id`/`storyId` ausente/inválido → `packDefects` (warning-exclui); dup `id`/`storyId` entre identificáveis → `errors` (**FATAL**); `seenIds.add`/`seenStoryIds.add` para **todo** id/storyId válido **antes** de decidir exclusão (ajuste de precisão: dup fatal mesmo com outro defeito no pack).
- **Malformações → `packDefects` (warning-exclui):** `version`, `type`, `access`, `title`, `bytes`, `baseUrl`, `manifestPath`, `manifestSha256`, `requiredAppVersion`, `mediaKinds`, `status`; `storyId` desconhecido.
- **Soft (inalterado):** `requiredAppVersion > appVersion` → `requiresAppUpdate` (warning só para pack que sobrevive).
- Fim do loop: `if (packDefects.length)` → `warnings.push(resumo)` + `return` (exclui); senão `outPacks.push({...p, requiresAppUpdate})`.
- `ok = errors.length === 0`; `data = ok ? {...raw, packs: outPacks} : null`. **Assinatura `{ok,data,errors,warnings}` preservada.**

## T2 — Flipar os 4 checks existentes · `scripts/smoke.js` (bloco F2.4d.2)
- `unknown` (storyId desconhecido), `noSlash` (baseUrl sem `/`), `httpProd` (http em produção), `badKind` (mediaKinds inválido): de `ok:false` para **`ok:true` + pack excluído** (`packs` sem ele) + `warnings.some(motivo)`. Re-ancorar por **conteúdo**.

## T3 — Adicionar novos checks · `scripts/smoke.js`
- **Misto** (conhecido válido + desconhecido) → `ok:true`, `packs=[válido]`, `warnings≠[]`.
- Consumidor: `getPackFromGlobalManifest(data,'david_goliath')` ok; `('unknown_story')` não encontrado.
- **Raiz-fatal** (`manifestVersion` não suportado / `packs` não-array / `minAppVersion` ausente) → `ok:false`, `data:null`.
- **Dup `id`** fatal; **dup `storyId`** fatal.
- **Dup `storyId` + defeito por-pack** — testar **as duas ordens**: (1) malformado primeiro + duplicado depois; (2) válido primeiro + malformado duplicado depois → ambos `ok:false`.
- **Sem `id`/sem `storyId`** → excluído com warning; resto `ok:true`.
- **Subconjunto vazio** (único inválido) → `ok:true`, `packs=[]`, `warnings≠[]`.
- **`generatedAt` inválido** → não afeta `ok` (warning).

## T4 — Verificar consumidor · `src/services/packDownloadService.js` (`:155-169`)
- Confirmar que com `gm.ok===true` + subconjunto ele segue normal (lê `gm.errors` só em `!ok`; lê `pack.requiresAppUpdate`). **Só alterar se realmente necessário.** Se precisar alterar → **PARAR e reportar antes de editar** (expande escopo → volta ao plano).

## T5 — Docs · `docs/F2_4D_1_GLOBAL_MANIFEST_CONTRACT.md` §5 + `docs/F2_4D_2_GLOBAL_MANIFEST_SERVICE.md` §6
- Fixar a decisão de isolamento tolerante; descrever os checks que mudam de comportamento.

## T6 — Gates + verificação
- `git diff --check`; `npm run smoke` verde; `npx expo-doctor` verde; `git status`; resumo dos arquivos alterados; comportamento antes/depois; lista dos smoke checks novos/alterados; confirmação de que nada fora do escopo foi tocado.
- **Validação device: N/A** (serviço puro) — revalidar quando o consumo user-facing entrar no Bloco 2.

## Dependências
T1 → T2/T3 → T4 → T6. T5 em paralelo. **Commit/push só com autorização explícita.**

## Analyze (Etapa 6) — resumo
Rastreabilidade aceite↔task completa (spec §6 → T3; gates → T6). Consistência spec↔plan↔tasks sem contradição. Assinatura preservada; `schemaVersion` fora do escopo. Confirmado no código: `generatedAt` é fatal hoje (`:79`) → T1 o torna warning. Pontos de atenção no Implement: order-independence do dup (T3, duas ordens); consumidor sem mudança (T4, senão parar); `smoke.js` re-ancorar por conteúdo. **Sem `[NEEDS CLARIFICATION]`. Pronto para Implement.**
