# Spec — Bloco 1: Persistência `file://` absoluto de desenhos e artes

> **Feature:** `004-persistencia-file-uri` · **Bloco:** 1 (plano de correção pré-loja) · **Data:** 2026-07-07
> **Branch:** `content-integrate-coloring-3` · **HEAD na criação:** `b1b82e8`
> **Etapa SDD:** 1 (Specify) + 2 (Clarify — RESOLVIDO). **Portão Humano 1 (spec): APROVADO por Eduardo (2026-07-07).**
> **Precedência:** `docs/DECISIONS.md` + `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`. **Risco S1** (perda de dado da criança).

## 1. Problema
Desenhos (Colorir) e artes (Ateliê) persistem a **URI `file://` ABSOLUTA** do blob, que embute o `documentDirectory` (UUID do container no iOS). Após **restore de backup / update / reinstalação restaurada**, o iOS troca o UUID do container → as URIs persistidas ficam **inválidas** → `getInfoAsync` `exists:false` → **Livrinho, Galeria e Baú renderizam em branco** (perda percebida das criações). O **ponteiro não é apagado** — recuperável no **boundary de leitura**, recompondo o caminho com o `documentDirectory` atual. O projeto já faz isso para **packs** (`PacksContext.normalizedIndex`), mas **não** para desenhos/artes.

## 2. Evidência no código
- **Gravação (embute o container atual):** `fileBlobStore.writeBlob` → `uri = blobsRoot() + subdir/filename`, `blobsRoot() = documentDirectory + 'ptf_blobs/'` (`fileBlobStore.js:30-34,112,119`). `drawingStorage.buildPointer` grava `ptr.uri` (subdir `drawings`, `:74-79`); `atelierStorage.saveArt` grava `previewUri`/`thumbnailUri` (subdir `atelier`, `:87-93`).
- **`blobsRoot()` já é dinâmico** (`:30-34`) — recomputa o `documentDirectory` a cada chamada; **só a URI PERSISTIDA é estática** (container velho).
- **Boundary A (via `readBlobAsDataUrl`):** `drawingStorage.resolvePointer` → `readBlobAsDataUrl(p.uri, ...)` (`:86`); `getSavedDrawing` (`:105-116`) → **desenhos + Livrinho** (StoryBookScreen). `readBlobAsDataUrl` (`fileBlobStore.js:127-140`) faz `getInfoAsync(uri)`; `exists:false` → `null`.
- **Boundary B (via `.uri` direto a `<Image>`, SÍNCRONO):** `atelierStorage.resolveArtPreviewUri`/`resolveArtThumbUri` (`:30-42`) → **Galeria**; `beniChestService` (`:71`, `:150` `a.thumbnailUri`) → **Baú**; `storyImageService` (`:76-80` `previewUri`/`thumbnailUri`) → **childArt**.
- **Referência (não tocar):** `PacksContext.normalizedIndex` (`:102-114`) — recompõe `localDir` do `documentDirectory` atual, **idempotente**, ignorando o path persistido no boundary de leitura.

## 3. Comportamento desejado

### 3.1 Helper puro compartilhado (param-based) — `recomposeBlobUri(oldUri, currentBlobsRoot)` em `fileBlobStore.js`
Requisitos (aprovados):
1. `oldUri` data URL → retorna **inalterado**.
2. `oldUri` não-string → retorna **inalterado**.
3. `oldUri` `file://` **fora** de `ptf_blobs/` → retorna **inalterado**.
4. `oldUri` contendo `ptf_blobs/` → extrai o **sufixo após `ptf_blobs/`** e prefixa `currentBlobsRoot`.
5. **Idempotente** (recompor o já-recomposto ≡ mesmo resultado; no-op quando o container não mudou).
6. **Puro** — sem `setItem`/`removeItem`/`deleteBlob`/`getInfoAsync`.
7. **Não** altera o formato do ponteiro v3.
8. **Não** apaga arquivo antigo.
9. **Não** migra dados na leitura.

### 3.2 Boundary A — `readBlobAsDataUrl` (regra LITERAL, gated por `getInfoAsync`)
1. tentar `getInfoAsync` no URI **antigo**;
2. se existir → **ler o antigo** (no-op);
3. se não existir → **recompor** com `documentDirectory` atual (`recomposeBlobUri(old, blobsRoot())`);
4. testar `getInfoAsync` no **recomposto**;
5. se existir → **ler o recomposto**;
6. se não existir → retornar **`null`**.
Cobre **desenhos + Livrinho** de forma transparente (`resolvePointer`/`getSavedDrawing`/StoryBookScreen **inalterados**).

### 3.3 Boundary B — `atelierStorage`/`beniChestService`/`storyImageService` (eager, SÍNCRONO, idempotente)
- Aplicar `recomposeBlobUri(uri, blobsRoot())` ao `previewUri`/`thumbnailUri` **antes de retornar** a URI para `<Image>`.
- **Manter os resolves SÍNCRONOS** (não virar async); **sem ripple nas telas**; **sem alterar chamadas de UI**; **sem regravar ponteiro**.
- Preserva `previewBase64`/`thumbnailBase64` (data URL) intactos (req 1 do helper).
- **No-op** quando o container não mudou (recomposta ≡ original) — nunca quebra um caminho válido.

## 4. Escopo (Implement — etapa futura)
- **`src/services/fileBlobStore.js`** — helper puro `recomposeBlobUri`; `readBlobAsDataUrl` recompõe-on-failure (§3.2).
- **`src/services/atelierStorage.js`** — `resolveArtPreviewUri`/`resolveArtThumbUri` aplicam o helper (eager).
- **`src/services/beniChestService.js`** — aplicar o helper onde retorna `.uri` de arte (`:71`/`:150`).
- **`src/services/storyImageService.js`** — aplicar o helper em `childArt.previewUri`/`thumbnailUri` (`:76-77,:80`).
- **`src/services/drawingStorage.js`** — **provável SEM mudança** (Boundary A cobre via `readBlobAsDataUrl`); confirmar no Plan.
- **`scripts/smoke.js`** — testes com `currentBlobsRoot`/`documentDirectory` mockado.
- `PacksContext` — **só referência, não alterar**.

## 5. Fora de escopo
Migrar/alterar o **formato do ponteiro v3**; **pipeline de gravação** (salvo se a análise provar necessidade → **parar antes**); **motor de pintura**; **StoryBookScreen** (recém-commitado); **assets**; **R2**; **Bloco 2**; **RevenueCat**; **multi-perfil**; **qualquer limpeza/remoção de desenhos**. Sem dependência nova; sem migração para TS.

## 6. Critérios de aceite (observáveis)
1. Ponteiro antigo `file://` absoluto quebrado é **resolvido** com o `documentDirectory` atual.
2. **Livrinho** lê desenho salvo **antes** da troca de container.
3. **Galeria** lê arte salva **antes** da troca de container.
4. **Baú** lê `childArt` salvo **antes** da troca de container.
5. **data URL** (v1/v2, `previewBase64`/`thumbnailBase64`) continua funcionando **sem alteração**.
6. `file://` **fora** de `ptf_blobs` **não** é alterado indevidamente.
7. **Nenhuma** leitura apaga ponteiro.
8. **Nenhuma** leitura faz `setItem`/`removeItem`.
9. Smoke cobre **recomposição** com `documentDirectory`/`currentBlobsRoot` mockado.
10. Smoke cobre **no-op** quando o `documentDirectory` não mudou.
- Não-regressão: A5.1/A5.2/A5.3 verdes; smoke ≥ baseline; expo-doctor 18/18.

## 7. Riscos
Dado da criança (leitura) — **mitigado:** helper puro, no-op quando inalterado, **nunca apaga/regrava**, ponteiro v3 intacto, degradação segura (retorna original/`null`, nunca lança). Boundary B eager recompõe sempre, mas é **no-op** quando o container não mudou → nunca quebra caminho válido. `scripts/smoke.js` é ponto de serialização com Blocos 4/5 (re-ancorar por conteúdo).

## 8. Rollback
`git revert` de 1 commit. Mudança **aditiva** e localizada (helper isolado + 4 pontos de leitura); **sem** mudança de formato do ponteiro, do pipeline de gravação ou de assinatura persistida.

## 9. Clarify — RESOLVIDO (Eduardo, 2026-07-07)
1. **Boundary B** = **recomposição eager, síncrona e idempotente** (opção a); **não** tornar os resolves async; **sem** ripple de UI. ✔
2. **Boundary A** = regra **literal** gated por `getInfoAsync` (§3.2). ✔
3. **Helper** = **param-based** `recomposeBlobUri(oldUri, currentBlobsRoot)` com os 9 requisitos (§3.1). ✔
**Nenhum `[NEEDS CLARIFICATION]` em aberto.** Próximas etapas: Checklist (3) → Plan (4, Portão 2) → Tasks (5) → Analyze (6, Portão 3) → Implement (7).

## Respostas às 10 perguntas da spec
1. **Onde grava file://:** `fileBlobStore.writeBlob`; `drawingStorage.buildPointer` (`drawings`); `atelierStorage.saveArt` (`atelier`) — absolutos (container do write).
2. **Onde lê:** `drawingStorage.resolvePointer`→`readBlobAsDataUrl` (desenhos/Livrinho); `atelierStorage.resolveArtPreviewUri/Thumb` (Galeria); `beniChestService` (Baú); `storyImageService` (childArt).
3. **Via `readBlobAsDataUrl` (Boundary A):** só `drawingStorage.resolvePointer`.
4. **Via `.uri` direto (Boundary B):** `atelierStorage.resolveArtPreviewUri/Thumb`, `beniChestService`, `storyImageService`.
5. **Menor ponto seguro:** (A) dentro de `readBlobAsDataUrl` + (B) dentro dos 3 resolves de `.uri`, via **um helper puro compartilhado**.
6. **Evitar regravar na leitura:** helper 100% string; **zero** `setItem`/`removeItem`/`deleteBlob` no caminho de leitura.
7. **Compat com antigos:** v1/v2 são data URLs (não-file) → inalterados; ponteiro v3 intacto; A5.1/A5.2/A5.3 verdes.
8. **Testar com `documentDirectory` mockado:** sandbox com root **mutável** — grava blob p/ `/A/`, troca p/ `/B/`, verifica recomposição p/ `/B/ptf_blobs/...` e no-op quando igual.
9. **Validar Livrinho/Galeria/Baú:** device (Dev Build iOS) — pintar + salvar arte → forçar troca de container → Livrinho/Galeria/Baú leem.
10. **Fora de escopo:** §5.
