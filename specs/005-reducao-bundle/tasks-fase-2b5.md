# Tasks — Bloco 2 · Fase 2B.5 · R2 pack readiness gate

> **Etapa SDD 5.** Micro-tasks atômicas e cronológicas. Implementação só **após o Portão 3**.
> **Único arquivo de código:** `scripts/assets-pipeline/verify-r2-pack-readiness.js` (novo). **Único de doc (pós-execução):** `specs/005-reducao-bundle/RELATORIO_2B5_R2_READINESS.md`.
> **Guardas em toda task:** não escrever em `src/`/`assets/`; temp fora do repo; sem upload; sem dep nova; sem `git add`/commit/push.

## Grupo A — Esqueleto read-only + descoberta
- **A1** — Criar o arquivo: shebang, `'use strict'`, `parseArgs` (contrato CLI: `--manifest-url/--app-version/--stories/--out/--json/--keep`), constantes (18 esperados como *sanity set*), helper `tmpRoot()` = `<os.tmpdir()>/ptf_r2_readiness`, e um **guard de escrita** que resolve qualquer caminho de escrita e **aborta** se cair dentro de `REPO_ROOT/src` ou `REPO_ROOT/assets`. *Aceite:* `--help`/sem args não escreve nada no repo.
- **A2** — `loadIsolated(srcRelPath, wanted, injected)`: lê o fonte, remove `export`, injeta deps por nome, `new Function` (técnica do `validate-story-pack`/`smoke`). *Aceite:* carrega `packManifestService` sem Expo (igual à ferramenta existente).
- **A3** — Descoberta dos 18: `loadIsolated('src/data/contentManifest.js', ['getStoriesByLayer'])` → `getStoriesByLayer('remote')`; assert **length 18** e igualdade com o *sanity set* (aborta com mensagem se a camada mudou). Aplica `--stories` (subconjunto). *Aceite:* imprime os 18 (ou o subconjunto).

## Grupo B — Camada HTTP builtin (Node 20)
- **B1** — `httpGetBuffer(url)` com `node:https`: segue redirect (301/302/307/308 via `Location`, teto de saltos), timeout, checa `statusCode`, retorna `{ ok, status, buffer }`. *Aceite:* baixa um JSON https e detecta 404/timeout como erro estruturado.
- **B2** — `httpGetToFile(url, dest)` com `node:https` (stream p/ arquivo, cria subpastas). *Aceite:* grava um binário no temp e o tamanho confere.

## Grupo C — Manifesto vivo (RF1 / N1-índice)
- **C1** — Resolver URL (`--manifest-url` → `EXPO_PUBLIC_GLOBAL_MANIFEST_URL`; ausente → erro claro); `httpGetBuffer` + `JSON.parse` tolerante (JSON inválido → erro estruturado).
- **C2** — `loadIsolated('src/services/globalManifestService.js', ['validateGlobalContentManifest','getPackFromGlobalManifest'], { STORY_CONTENT_LAYER, warn:()=>{} })`; chamar `validateGlobalContentManifest(raw,{appVersion, allowHttp:false})`; registrar `ok/errors/warnings`, presença dos 18 e packs extras/desconhecidos. *Aceite:* usa o MESMO validador do app; *warnings* de exclusão por-pack aparecem por storyId.

## Grupo D — Por pack: N1-pack + N2 (RF2+RF3, cross-check N)
- **D1** — Por storyId: `getPackFromGlobalManifest(data, id)`; checar `access==='premium'`, `baseUrl` https+`/`, `bytes>0`, `manifestPath==='manifest.json'`, `manifestSha256` hex-64, `mediaKinds ⊇ {cover,scene,coloring,audio}`, `requiredAppVersion ≤ appVersion` → **n1**.
- **D2** — `httpGetBuffer(baseUrl+'manifest.json')` → salvar no temp; **âncora**: `sha256(manifest.json)==manifestSha256`; `loadIsolated('src/services/packManifestService.js', ['validateManifest'])` e validar; contagem **1 cover + N scene + N coloring + N audio**.
- **D3** — Cross-check N: `loadIsolated('src/data/stories.js', ['stories'])` → `cenas.length` por id (assert `===totalCenas`); conferir `N_pack(scene)==N_app` e `coloring==audio==scene==N` → **n2**. *Aceite:* divergência de N anota o número exato.

## Grupo E — N3 (RF4, integridade forte)
- **E1** — Baixar todos os `files[]` (B2) p/ `<out>/packs/<id>/v<major>/<path>`; escrever `pack.sha256`=`manifestSha256`.
- **E2** — `child_process.spawnSync('node', ['scripts/assets-pipeline/validate-story-pack.js','--dir', packDir])`; **exit 0 → n3**; capturar resumo de stdout/stderr; **não alterar** `validate-story-pack.js`. *Aceite:* bytes+sha256 por arquivo conferem via a ferramenta existente.

## Grupo F — Tabela N1–N4 + veredito
- **F1** — Objeto por id `{ n1, n2, n3, n4, notes[] }`; `n4` do mapa de cobertura: `david_goliath='done'`; `moses_red_sea|jesus_children|mary_says_yes='to-validate'`; demais `='batch-plan'`.
- **F2** — Tabela humana (18 linhas × N1 N2 N3 N4 + notas) + resumo `X/18 N3` + `--json`. **exit 0** se todos do escopo em N3, senão **1**.
- **F3** — Cleanup do temp (salvo `--keep`). *Aceite:* nada permanece no repo; temp fora do repo é removido.

## Grupo G — Execução + relatório (pós-implementação)
- **G1** — Rodar contra o R2 real (URL do env); capturar tabela/JSON.
- **G2** — Persistir `RELATORIO_2B5_R2_READINESS.md` (tabela + *warnings* + divergências + **veredito**).
- **G3** — Device: baixar/validar `moses_red_sea`, `jesus_children`, `mary_says_yes` no iPhone; atualizar N4 no relatório.

## Grupo H — Gates + entrega
- **H1** — `npm run smoke` verde (runtime intocado; o script não é importado pelo app) + `npx expo-doctor` 18/18; confirmar `app.json`/assets/requires premium intocados (`git status` + greps).
- **H2** — Relatório PT-BR ao Eduardo com o veredito do gate. **Sem** `git add`/commit/push sem aprovação.

## Rastreabilidade (RF → Task)
RF1→C1,C2 · RF2→D1 · RF3→D2,D3 · RF4→E1,E2 · RF5(N4)→F1,G3 · Tabela/veredito→F1,F2,G2 · Gate 2C→F2,G2,H.
