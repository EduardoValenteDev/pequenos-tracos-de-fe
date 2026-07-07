# Bloco 2 · Fase 2B — SPEC · Consumo R2 user-facing (sem remover bundle)

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B. **Etapa SDD:** 1 (Specify) + 2 (Clarify — RESOLVIDO). **Portão Humano 1: APROVADO por Eduardo (2026-07-07).**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `e4d2a8a`. **2B NÃO altera o bundle** — só prepara o consumo remoto real e seguro, mantendo o fallback local.

## 1. Problema
As 18 premium (`remote`) só ficam disponíveis via pack R2 se alguém baixá-las, e hoje **só `PackSandboxDevScreen` (dev)** dispara download. Em produção nenhuma superfície user-facing baixa pack → nada fica `ready` → tudo cai no fallback local (require no binário). Antes de a 2C remover esse fallback, é preciso **download user-facing seguro** + **todas as superfícies consumindo remoto** (incl. 2 gaps do Livrinho).

## 2. Evidência (estado atual — mais avançado que o esperado)
- **Gate JÁ é por camada:** `isRemotePackStory = getContentLayer===REMOTE` (`useResolvedStoryMedia.js:33-35`); `SANDBOX_STORY_ID='david_goliath'` é só compat; comentários "gated a david_goliath" desatualizados.
- **Superfícies já genéricas:** NarrationScreen (`useResolvedSceneImage`+`useResolvedStoryAudio`), StoryCard (`useResolvedStoryCover`), ColoringScreen (`useResolvedColoringImage`).
- **Gaps no Livrinho:** StoryBookScreen usa `getSceneAudio` direto (`:1119`) e `getColoringImage` direto (lineart child) → local-only.
- **Sem download user-facing:** único caller `PackSandboxDevScreen`; StoryDetail → `ParentArea` (`:160`).
- **Infra pronta e device-validada:** `contentResolver.decide` (genérico), `PacksContext` (`@ptf_packs_v1`, `getPackEntry`, `refreshPacks`), `packDownloadService` (genérico, sha256+timeout+cancel+precheck), `globalManifestService` (tolerante, Bloco 3).

## 3. Comportamento desejado
- **Download user-facing** no StoryDetail: **baixar → baixando (progresso) → pronto (offline) → erro amigável (retry)**, via `PacksContext` + `packDownloadService`.
- Todas as superfícies (incl. Livrinho áudio+lineart) resolvem remoto por camada, **fallback local intacto**.
- **Sem remover require premium; sem tocar app.json/assetBundlePatterns** — bundle igual.
- Download só p/ **premium-active** (`isPremiumUser()`); free vê convite Plano Família (sem regressão).

## 4. Escopo (implementação futura)
1. **StoryDetail (download UX):** estado de download p/ história `remote` quando `isPremiumUser()`; ligar `packDownloadService`+`PacksContext`; offline após baixado.
2. **StoryBookScreen (2 gaps, com REGRA DE HOOKS):** substituir `getSceneAudio`/`getColoringImage` diretos por **resolvers NÃO-hook** (`resolveStoryAudio`/`resolveStoryColoring` do contentResolver), passando o `packEntry` do **único hook top-level** `useSandboxScenePackEntry` (já em `:438`). NUNCA chamar hooks em loop/callback/condicional/helper. Fallback local mantido.
3. **Higiene:** atualizar comentários "gated a david_goliath" → "gated por camada remote".
4. **Smoke:** starter×remote; estados de download; fallback preservado; Livrinho remoto resolvido.

## 5. Garantias (o que NÃO acontece na 2B)
Nenhum require premium removido; `app.json`/`assetBundlePatterns` não alterados; fallback local intacto (zero regressão); sem `git rm`/mover/apagar assets; sem upload/build R2; sem RevenueCat; sem motor de pintura; sem compressão; sem 2C.

## 6. Critérios de aceite (device, Modo Criador + pack R2 real)
1. creation/noah: fluxo normal 100% offline, byte-idêntico. 2. Premium remote com premium-active (Modo Criador): baixar→baixando→pronto; offline abre cenas+colorir+áudio+Livrinho via file://. 3. Premium sem pack: estado baixar (sem crash/tela branca); catálogo/mapa/cards mostram. 4. Erro de rede → erro amigável+retry. 5. Free: premium atrás do convite Plano Família (sem download exposto). 6. smoke verde. 7. doctor 18/18. 8. Bundle inalterado.

## 7. Riscos
Regressão em creation/noah e no Livrinho (área sensível LIVRINHO_FIX_1/UX_1) → fallback local obrigatório + device antes do merge. `scripts/smoke.js` = serialização. Resolvers não-hook em `ready` pack são seguros (arquivos validados por bytes+sha256 no download; ChildArtWithLineart/AudioPlayer já têm fallback/erro).

## 8. Rollback
2B é 100% aditivo (novo download + trocar 2 loaders diretos por resolvers com fallback). `git revert` sem afetar o bundle.

## 9. Fora de escopo (bloqueado)
2C (strip + assetBundlePatterns); remoção/`git rm`/mover assets; upload/pack build R2; RevenueCat/compra/entitlement; motor de pintura; compressão (2D); backups de mapas; Bloco 1/3; medição AAB.

## 10. Clarify — RESOLVIDO (Eduardo, 2026-07-07)
1. Recorte corrigido: gate já genérico; 2B foca nos 2 gaps do Livrinho + download user-facing + higiene de comentários. ✔
2. Validação pré-RevenueCat via **Modo Criador** (premium-active simulado por `isPremiumUser()`); download R2 real; **sem** adicionar RevenueCat. ✔

## 11. Atenção técnica obrigatória (Plan)
Ao ajustar o StoryBookScreen: **não** chamar hooks em loop/callback/condicional/helper. Se `useResolvedStoryAudio`/`useResolvedColoringImage` não puderem ser usados no topo do componente, usar **resolver NÃO-hook equivalente** (`resolveStoryAudio`/`resolveStoryColoring`) com o `packEntry` do hook top-level único, mantendo fallback local. Prioridade: não violar regras de hooks e não quebrar o Livrinho.
