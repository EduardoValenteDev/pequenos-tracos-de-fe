# Bloco 2 · Fase 2B.5 · R2 pack readiness gate

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.5 · **Etapa SDD:** 1 (Specify) · **Portão Humano 1: APROVADO por Eduardo (2026-07-07).**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `77be545`.
> **Natureza:** comprovação/evidência **read-only**. NÃO altera runtime, NÃO remove bundle, NÃO mexe em `app.json`, NÃO inicia 2C.

## 1. Contexto e objetivo
A Fase 2C (retirar os `require` premium do bundle) só é segura se **todos os 18 packs premium** puderem ser baixados do R2 pelo app. Esta trilha **prova**, sem mudar comportamento, que os 18 estão **completos, publicados, presentes no `content-manifest.json` vivo e aptos a download real**, produzindo um **relatório de prontidão** que funciona como *gate* explícito para liberar (ou manter bloqueada) a discussão da 2C.

## 2. Escopo
**Dentro (autorizado):** ler/validar o manifesto vivo; validar cada pack por schema, url, bytes, sha256 e kinds; conferir cover/scene/coloring/audio; compor as ferramentas de integridade já existentes; baixar manifests e arquivos para diretório **temporário fora do repo**; download real no device de ≥1 história de referência + amostra + plano; produzir o relatório de prontidão.
**Fora (proibido):** iniciar 2C; strip de `require`; `assetBundlePatterns`; remover/mover/renomear/`git rm` assets; RevenueCat/compra/entitlement; compressão; **qualquer** mudança em `app.json`; **upload destrutivo** no R2; `git add`/`commit`/`push` sem aprovação.

## 3. Os 18 storyIds premium esperados
`david_goliath`, `jesus_children`, `daniel_lions`, `jonah_big_fish`, `lost_sheep`, `good_samaritan`, `abraham_stars`, `joseph_colorful_coat`, `moses_red_sea`, `ruth_naomi`, `esther_queen`, `miraculous_catch`, `samuel_hears_god`, `josiah_young_king`, `solomon_wisdom`, `mary_says_yes`, `timothy_faith`, `jesus_temple`.
Fonte de verdade: `getStoriesByLayer('remote')` em `src/data/contentManifest.js`. **RF:** a lista comprovada deve ter **exatamente esses 18**.

## 4. Requisitos funcionais
- **RF1 — Manifesto vivo:** buscar `content-manifest.json` (URL de `EXPO_PUBLIC_GLOBAL_MANIFEST_URL`) e validar pelo MESMO validador do runtime (`globalManifestService.validateGlobalContentManifest`). Registrar `ok/errors/warnings`, quais dos 18 aparecem e se há pack extra/desconhecido.
- **RF2 — Por pack (url/tamanho/sha256/kinds):** `access==='premium'`; `baseUrl` https terminando em `/`; `bytes` inteiro > 0; `requiredAppVersion ≤ appVersion`; `manifestSha256` hex-64 presente; `mediaKinds ⊇ {cover, scene, coloring, audio}`; `manifestPath==='manifest.json'`.
- **RF3 — Conteúdo completo:** buscar o `manifest.json` **por-pack**; conferir a âncora `sha256(manifest.json) === manifestSha256`; do manifesto por-pack: **1 cover + N scene + N coloring + N audio**, com **N == nº de cenas do app** para o `storyId`.
- **RF4 — Integridade por ferramenta existente:** validar cada pack com `scripts/assets-pipeline/validate-story-pack.js` (10 verificações, incl. **sha256 por arquivo** + compat. com `packManifestService.validateManifest`), sobre os arquivos baixados para o temporário.
- **RF5 — Device (N4):** `david_goliath` conta como referência (validada na 2B). Nesta 2B.5, validar em device **+2–3** histórias premium (packs diferentes, ainda não exercitadas). As 15–16 restantes ficam com **N3 automático obrigatório** + **plano de validação por lote** antes da 2C final.

## 5. Critério de prontidão por pack (Clarify resolvido — N3 obrigatório)
Níveis cumulativos:

| Nível | Prova |
|---|---|
| **N1 — Publicado no índice** | presente + válido no manifesto vivo + RF2 verdes |
| **N2 — Manifesto por-pack íntegro** | âncora `manifestSha256` confere + contagem + N==cenas + convenção de path |
| **N3 — Arquivos íntegros** | cada arquivo baixável (HTTP 200), bytes e **sha256 por arquivo** conferem (`validate-story-pack`) |
| **N4 — Prova em device** | app baixa e roda **offline** (cover/scene/coloring/audio via `file://`) |

**Decisão do Portão:** **N2 NÃO é suficiente.** Um pack só é "pronto para 2C" com **N3 verde**. **A 2C só poderá começar quando os 18 tiverem N3 verde E a cobertura N4 acordada estiver documentada** (referência `david_goliath` + as 2–3 desta fase + plano de lote para o restante). **Se qualquer pack falhar N3, a 2C continua bloqueada.**

## 6. Tratamento de falhas
- **Ausente/desconhecido/schema inválido no manifesto vivo →** pack **N0**, "não pronto"; 2C bloqueada. (Manifesto vivo é tolerante: pack defeituoso é excluído com *warning* — o relatório destaca cada exclusão.)
- **Incompleto** (falta kind, N≠cenas, contagem) → **N1 no máximo**, "não pronto"; anota o que falta.
- **Hash divergente** (`manifestSha256` ou sha256 de arquivo) → "não pronto"; anota arquivo/pack; indica **publicação inconsistente** → exige **rebuild+republish** (tarefa de conteúdo/asset **fora desta trilha**).
- **Nenhuma ação destrutiva:** esta trilha só **relata**; correção de pack é bloco próprio.

## 7. Tooling (script novo read-only) — regras aprovadas
`scripts/assets-pipeline/verify-r2-pack-readiness.js`, **compondo** as ferramentas existentes. Regras: não alterar runtime/assets/R2; sem upload; sem remover/mover/renomear; **não escrever dentro de `assets/` nem de `src/`**; pode usar **diretório temporário fora do repo** (ou dir explicitamente ignorado) só para validação; pode gerar **JSON/relatório em stdout**. O relatório final (`RELATORIO_2B5_R2_READINESS.md`) só é persistido **após o Plan aprovado**.

## 8. Entregável
Relatório de prontidão em `specs/005-reducao-bundle/RELATORIO_2B5_R2_READINESS.md` (após Plan) com a **tabela dos 18 × N1–N4**, *warnings* do manifesto vivo, divergências e o **veredito do gate** (2C liberada ⇔ 18/18 N3 verde + N4 acordada documentada). Sem merge de runtime; tooling novo é read-only.

## 9. Regras mantidas (invioláveis)
Não iniciar 2C · não alterar `app.json` · não alterar `assetBundlePatterns` · não remover `require` premium · não mover/apagar/renomear/`git rm` assets · não tocar RevenueCat · não tocar compressão · não fazer upload destrutivo no R2 · não `git add`/`commit`/`push` sem aprovação · esta trilha PARA no Plan antes de implementar.
