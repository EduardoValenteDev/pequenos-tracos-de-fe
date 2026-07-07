# Spec — Bloco 3: Manifesto global tolerante por pack

> **Feature:** `003-manifesto-global-tolerante` · **Bloco:** 3 (plano de correção pré-loja) · **Data:** 2026-07-07
> **Branch:** `content-integrate-coloring-3` · **HEAD na criação:** `8d6b650`
> **Etapa SDD:** 1 (Specify) + 2 (Clarify — RESOLVIDO). **Portão Humano 1 (spec): APROVADO por Eduardo (2026-07-07).**
> **Precedência:** `docs/DECISIONS.md` + `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`. Rigor proporcional: área sensível (manifesto remoto defensivo), consumo **DEV-only hoje** (único caller: `PackSandboxDevScreen`).

## 1. O quê e por quê
Tornar `validateGlobalContentManifest` **tolerante por pack**: um pack inválido/desconhecido é **excluído com warning** e o manifesto continua `ok:true` com o subconjunto válido. Erros **fatais** ficam reservados à **raiz** e à **integridade cruzada**.

**Motivo (risco):** forward-compat com o R2 **append-only** (decisões 7/8/9). Hoje um único pack novo/desconhecido derruba o manifesto inteiro (`ok:false`, `data:null`). Assim que o manifesto mestre ganhar uma 19ª história, **um app antigo trava o download de TODAS as histórias, inclusive as que já suporta** — contradizendo o modelo append-only.

## 2. Comportamento atual (evidência — `src/services/globalManifestService.js`)
- Retorno já é `{ ok, data, errors, warnings }` (`:162` / assinatura `:171`) — **`warnings` já existe** (sem mudança de assinatura pública).
- **Todos** os erros por-pack vão para o **mesmo** array `errors` (`:102-148`); `ok = errors.length === 0` (`:161`) → `data = ok ? {…} : null` (`:162`). Qualquer defeito de **um** pack ⇒ `ok:false`, `data:null`.
- **Raiz (cedo):** `minAppVersion` semver (`:80-82`); `packs` array com early-return (`:83-86`).
- **Integridade cruzada:** `id` duplicado (`:103`), `storyId` duplicado (`:109`), `storyId` desconhecido (`:111`).
- **Já são warnings (soft):** `minAppVersion > appVersion` (`:89-92`); `requiredAppVersion > appVersion` → `requiresAppUpdate` (`:150-156`).
- `outPacks` já é montado no loop (`:158`) mas só retorna se `ok`.

## 3. Comportamento desejado (taxonomia — Clarify resolvido)

### 3.1 FATAL → `ok:false`, `data:null`, `errors` não-vazio (raiz e integridade cruzada)
- `manifestVersion` **ausente, inválido ou não suportado**.
- `minAppVersion` **ausente ou semver inválido**.
- `packs` **ausente ou não-array**.
- `id` **duplicado** entre packs identificáveis (integridade cruzada).
- `storyId` **duplicado** entre packs identificáveis (integridade cruzada — no v1 há **apenas um pack ativo por `storyId`**; correção de conteúdo publica **nova versão** e o manifesto aponta para a versão atual, nunca duas entradas ativas da mesma história).

### 3.2 WARNING → EXCLUI o pack, mantém `ok:true` com subconjunto válido (defeito de pack)
- `id` **ausente, vazio ou inválido** → warning + exclui (defeito de pack, não da raiz).
- `storyId` **ausente, vazio ou inválido** → warning + exclui.
- `storyId` **desconhecido** pelo app → warning + exclui.
- Malformações do pack: `baseUrl` sem `/` final, `http://` em produção, `version`/`requiredAppVersion` semver inválido, `type` ∉ conhecidos, `access` ∉ conhecidos, `title` vazio, `bytes` não inteiro-positivo, `manifestPath` ≠ `"manifest.json"`, `manifestSha256` presente porém não-hex64, `mediaKinds` vazio/valores inválidos, `status` inesperado → warning + exclui.
- `generatedAt` ausente/inválido → **no máximo warning** (nunca fatal).

### 3.3 Resultado
`{ ok:true, data:{…raw, packs:[só válidos]}, errors:[fatais], warnings:[por-pack excluídos + soft já existentes] }`.
- **Subconjunto vazio ainda é `ok:true`** (`data.packs.length===0`, `warnings` não-vazio).
- App antigo **ignora** o pack desconhecido sem quebrar os conhecidos.

### 3.4 Regra de dedup (esclarecimento operacional)
Dedup de `id`/`storyId` aplica-se **apenas a packs identificáveis** (com `id`/`storyId` presentes e válidos). Um pack sem `id`/`storyId` é **excluído com warning** (não participa da dedup). Dois packs identificáveis com o mesmo `id` **ou** o mesmo `storyId` → **fatal**.

## 4. Escopo
- **Alterar:** `validateGlobalContentManifest` — separar **erros de raiz** (fatais) dos **defeitos de pack** (acumular por pack; se houver → `warnings.push` + **não** adicionar a `outPacks`); `id`/`storyId` duplicados entre identificáveis continuam fatais; `ok = errosRaiz.length === 0`.
- **Testes:** `scripts/smoke.js` (bloco F2.4d.2) — atualizar os checks que hoje esperam `ok:false` nos casos **por-pack**; adicionar **caso MISTO**, raiz-fatal, dup-fatal e subconjunto-vazio.
- **Docs:** `docs/F2_4D_1_GLOBAL_MANIFEST_CONTRACT.md` §5 (fixar a decisão de isolamento) e `docs/F2_4D_2_GLOBAL_MANIFEST_SERVICE.md` §6.
- **Verificar (só alterar se necessário):** `src/services/packDownloadService.js` (`:155-169`) — consumidor curto-circuita em `!gm.ok`; com a mudança, `gm.ok` fica `true` e ele segue com o subconjunto válido.

## 5. Fora de escopo (não tocar)
- Motor de download/packs (`packDownloadService` além da verificação, `packStorageService`, `contentResolver`).
- Assinatura pública `{ok,data,errors,warnings}` e a semântica de rede/timeout/JSON de `fetchGlobalContentManifest`.
- `requiresAppUpdate` (`:150-156`); não hardcodar `r2.dev`.
- **`schemaVersion` defensivo NÃO entra neste bloco** (o contrato usa `manifestVersion` como versão do schema); se necessário, vai em bloco próprio ou no Bloco 2.
- **Assets, persistência, colorir, LIVRINHO_UX_1, paywall/accessControl/progresso/conquistas/histórias.**
- Consumo user-facing de download (Bloco 2) **não entra aqui**.

## 6. Critérios de aceite (observáveis)
1. **Misto** (1 conhecido válido + 1 desconhecido) → `ok:true`, `data.packs = [o válido]`, `warnings` não-vazio.
2. `getPackFromGlobalManifest(data,'david_goliath')` → encontrado; `('unknown_story')` → não encontrado (manifesto seguiu válido).
3. **Raiz inválida** (`manifestVersion` não suportado / `packs` não-array / `minAppVersion` ausente) → `ok:false`, `data:null`, `errors` não-vazio.
4. `id` **ou** `storyId` **duplicado** (identificáveis) → `ok:false` (fatal).
5. Pack **sem `id`/`storyId`** → excluído com warning; manifesto `ok:true` com o resto válido.
6. **Único pack inválido** → `ok:true`, `data.packs=[]`, `warnings` não-vazio.
7. `generatedAt` ausente/inválido → não afeta `ok` (no máximo warning).
8. `npm run smoke` + `npx expo-doctor` verdes; guards "INTACTOS" do smoke preservados; sem regressão de contagem.

## 7. Riscos e rollback
Médio-baixo (consumidor **dev-only** hoje → regressão a usuário final ~nula agora). Risco de **afrouxar demais** (aceitar malformado como válido) → **mitigado**: malformado é **excluído**, nunca aceito. Rollback: `git revert` de 1 commit (aditivo, sem mudança de assinatura).

## 8. Clarify — RESOLVIDO (Eduardo, 2026-07-07)
1. **Pack sem `id`/`storyId`:** excluir com warning (defeito de pack, não da raiz). Dup entre identificáveis = fatal (integridade cruzada). ✔
2. **Um pack ativo por `storyId` no v1:** confirmado → `storyId` duplicado continua **fatal**; correção de conteúdo = nova versão + atualizar manifesto. ✔
3. **Campos globais fatais:** `manifestVersion`, `minAppVersion`, `packs`. `generatedAt` no máximo warning. **Não** adicionar `schemaVersion` neste bloco. ✔

**Nenhum `[NEEDS CLARIFICATION]` em aberto.** Próximas etapas SDD: Checklist (3) → Plan (4, Portão 2) → Tasks (5) → Analyze (6, Portão 3) → Implement (7).
