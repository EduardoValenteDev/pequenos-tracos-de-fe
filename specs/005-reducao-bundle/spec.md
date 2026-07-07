# Spec — Bloco 2: Redução do bundle pré-loja

> **Feature:** `005-reducao-bundle` · **Bloco:** 2 (plano de correção pré-loja) · **Data:** 2026-07-07
> **Branch:** `content-integrate-coloring-3` · **HEAD na criação:** `e4d2a8a`
> **Etapa SDD:** 1 (Specify) + 2 (Clarify — RESOLVIDO). **Portão Humano 1 (spec): APROVADO por Eduardo (2026-07-07).**
> **Precedência:** `docs/DECISIONS.md` + `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`. **Risco S1 (bloqueador de loja).**

## 1. Problema
O binário empacota os assets das **20 histórias** (~**456 MB**: colorir 279 MB + cenas 35 MB + áudio 59 MB + mapas 68 MB + mascote 14 MB + images 3 MB), acima do **teto prático da Google Play (~200 MB de download)**. Dois vetores prendem tudo ao binário: **(a)** ~**626 `require()` estáticos**; **(b)** `app.json` **sem `assetBundlePatterns`** → default `**/*` empacota `assets/` **inteiro**, mesmo sem require. Reduzir o binário mantendo **creation+noah 100% offline** e **sem quebrar o premium remoto** — sem cortar as 20 histórias.

## 2. Evidência no código
- `app.json` **sem `assetBundlePatterns`** → default empacota `assets/` inteiro.
- Requires: `coloringImages.js` **202** · `storySceneIllustrations.js` **204** · `audioManifest.js` **204** · `storyCovers.js` **20** · `adventureMap.js` **16**.
- Classificação já declarada (`contentManifest.js:22-51`): `STARTER_STORY_IDS=['creation','noah']`; 18 `remote`; **"NADA consome este módulo ainda"**.
- Resolver central existe mas **NÃO é consumido por telas** (`contentResolver.js:5-9,68-86`): starter→require · remote+pack ready→`file://` · **remote sem pack → FALLBACK ao require local (ainda no binário)**.
- Consumo remoto ainda **gated a `david_goliath`** (`useResolvedStoryMedia.js:96,132,189,231`); as outras 17 remote caem no require local.
- Download só por dev (`PackSandboxDevScreen.js`); **nenhuma tela de produção baixa pack**.
- Superfícies: `StoryBookScreen` (Livrinho), `NarrationScreen` (cenas+áudio), `ColoringScreen` (colorir), via `storyImageService`/`audioService` + `useResolvedStoryMedia`.
- Tooling: `scripts/assets-pipeline/` (`inventory.js`, `measure-size.js`, `budget-report.js`, `traceability.js`, `growth-projection.js`, `check-untracked-guard.js`, `build-story-pack.js`, `validate-story-pack.js`).
- Backups em `assets/maps`: `source_new_6circles/*_source.png` = 4 arquivos / 12,3 MB (inventário completo = Fase 2A).

## 3. Comportamento desejado
- **creation+noah** permanecem `starter` (require) → 100% offline, byte-idênticos.
- **18 premium** viram consumo **R2/pack**: aparecem no catálogo/mapa/cards; sem pack → estado **baixar/baixando/erro** amigável + offline após baixado; **saem do binário** só depois que o consumo remoto estiver seguro **e os packs existirem no R2**.
- O fallback do resolver deixa de ser "require local" e passa a ser "estado de download" quando o require premium for removido (Fase 2C).

## 4. Escopo (por subfase; nesta etapa NADA é alterado)
Registries (`coloringImages`/`storySceneIllustrations`/`audioManifest`/`storyCovers` — strip 2C); `contentResolver`/`useResolvedStoryMedia`/`PacksContext` (wiring 2B); telas de consumo (UX de download 2B); `app.json assetBundlePatterns` (2C); `scripts/assets-pipeline/*` + `scripts/smoke.js`.

## 5. Fora de escopo
RevenueCat; compra real; backend/login; **cortar histórias**; alterar narrativa/conteúdo; **regerar imagens/áudio**; motor de pintura; TypeScript; trocar arquitetura local-first; **compressão destrutiva**; **remoção cega de assets**; **upload R2 destrutivo**; **pipeline de pack build/upload** (não tocar); Bloco 1 e Bloco 3.

## 6. Subfases (cada uma = ciclo SDD próprio, commit próprio)
- **Fase 2A — Inventário e mapa de consumo (READ-ONLY, zero alteração):** rodar os scripts de `assets-pipeline`; mapa require→asset→superfície; medir pesos; inventário dos backups em `assets/maps` (quais/peso/prova de não-consumo/plano de preservação). **Entrega: relatório.**
- **Fase 2B — Consumo R2 user-facing (sem remover require):** ligar `contentResolver`/`PacksContext` genérico em TODAS as superfícies premium (remover gate `david_goliath`); UX baixar/baixando/erro/offline no StoryDetail; fallback seguro; catálogo/mapa/cards inalterados. Validado em device com pack real.
- **Fase 2C — Remover premium do binário (GATED):** só **depois** que os 18 packs R2 estiverem **buildados + publicados + no content-manifest vivo + validados**. Strip dos 18 requires premium nos 4 registries + `assetBundlePatterns` restrito a creation+noah+compartilhados. Assets premium **preservados no git** (não mover/apagar/`git rm`); saída do bundle só por patterns+strip, rollback simples. Provar por AAB.
- **Fase 2D — Medir e avaliar compressão:** AAB antes/depois; só então compressão **lossless** (colorir pixel-safe).
- **Fase 2E — Validação device + regressão visual.**

## 7. Critérios de aceite (do bloco)
1. creation+noah 100% offline. 2. 18 premium fora do bundle final. 3. Premium em catálogo/mapa/cards. 4. Premium sem download → estado amigável, sem crash/tela branca. 5. Premium baixado (R2) abre cenas/colorir/áudio/Livrinho offline. 6. Nenhum require premium nas superfícies do bundle final. 7. Nenhum asset premium removido sem plano de preservação. 8. Smoke starter×remote. 9. Smoke ausência de require premium no caminho final. 10. Medição bundle antes/depois documentada. 11. Doctor 18/18. 12. Fluxo normal iPhone verde p/ creation/noah. 13. Sem mudança em compra/entitlement (salvo se a análise provar dependência → **parar antes**).

## 8. Riscos
- Ordem invertida = premium quebrado (fallback é o require local, `contentResolver.js:83-85`) → mitigado por 2B→2C.
- `assetBundlePatterns` sozinho não basta e strip de require sozinho não basta → **os dois**; provar por AAB.
- Colorir lossless → compressão só na 2D, pixel-safe, validação visual.
- Backups: só remover com inventário + prova + preservação.
- `scripts/smoke.js` = ponto de serialização.

## 9. Rollback
Cada subfase = commit próprio reversível. 2C: assets premium **preservados** (git-tracked, fora do bundle via patterns — não `git rm`) até o R2 comprovado, para rollback trivial.

## 10. Clarify — RESOLVIDO (Eduardo, 2026-07-07)
1. **Bloco 2 entrega agora 2A + 2B.** Fase 2C **bloqueada** até os 18 packs premium estarem **buildados, publicados no R2, presentes no content-manifest vivo e validados**. Ordem: 2A → 2B → (2C só após R2 completo+validado) → 2D → 2E. ✔
2. **2C:** assets premium **preservados e rastreados pelo git** — **não mover, não apagar, não `git rm`**. Saída do bundle por **`assetBundlePatterns` + strip seguro dos requires** nos registries, com rollback simples. ✔

**Nenhum `[NEEDS CLARIFICATION]` em aberto.**
