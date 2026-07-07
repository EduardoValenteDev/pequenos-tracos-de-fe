# Plan — Bloco 2 · Fase 2B.5 · R2 pack readiness gate

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.5 · **Etapa SDD:** 4 (Plan) · **Portão Humano 2: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `77be545` · Spec: [spec-fase-2b5.md](./spec-fase-2b5.md) · Checklist: [checklist-fase-2b5.md](./checklist-fase-2b5.md).
> **PARA no Plan.** Nenhum código antes do Portão 2.

## Abordagem geral
Um único script **read-only** `scripts/assets-pipeline/verify-r2-pack-readiness.js` (Node CJS, `'use strict'`, só builtins `fs/path/crypto/os/child_process/https` — **sem dependência nova**). Ele **compõe** o que já existe e **reusa os validadores do runtime** carregados de forma isolada (mesma técnica de `validate-story-pack.js`/`smoke.js`: ler o fonte, trocar `export` por declaração local, avaliar com `new Function`), provando compatibilidade **sem importar Expo/RN**. Escreve **apenas** num diretório temporário **fora do repo**; nunca em `src/` ou `assets/`; nunca toca o R2 (só HTTP GET). Emite tabela humana + `--json` em **stdout**.

## Compatibilidade de ambiente (ajuste obrigatório do Portão 2)
CI roda **Node 20** (`.github/workflows/ci.yml`, sem `engines`/`.nvmrc`). Para **não depender de Node 24** nem do `fetch` global (que no Node 20 existe via undici mas emite `ExperimentalWarning`), o script usa uma camada HTTP **só com builtins**: `node:https` para todo GET (JSON e binário), com **seguimento de redirect** (301/302/307/308 via `Location`, teto de saltos), **timeout** e erro estruturado. `httpGetBuffer(url)` (JSON) e `httpGetToFile(url, dest)` (binário via stream). **Sem `fetch`, sem `AbortController`, sem dependência nova** → compatível Node 18/20/22/24. A validação do manifesto vivo usa `validateGlobalContentManifest` (função **pura**, sem fetch) — **não** a `fetchGlobalContentManifest`. Se, na implementação, algum validador do runtime não puder ser carregado isolado sem ajustar `src/`, **PARAR antes** e reportar (não editar `src/`).

### Contrato de CLI
```
node scripts/assets-pipeline/verify-r2-pack-readiness.js \
  [--manifest-url <url>]     # default: process.env.EXPO_PUBLIC_GLOBAL_MANIFEST_URL
  [--app-version <semver>]   # default: 1.0.0 (para requiredAppVersion/minAppVersion)
  [--stories <csv>]          # default: os 18 remote; subconjunto p/ teste
  [--out <dir>]              # default: <os.tmpdir()>/ptf_r2_readiness (fora do repo)
  [--json] [--keep]          # json em stdout; --keep não apaga o temp
```
Exit code: **0** se os 18 (ou o subconjunto pedido) atingirem **N3 verde**; **1** caso contrário (o veredito é legível na saída e no exit).

---

## 1. Como o script descobre os 18 storyIds remote
Carrega `src/data/contentManifest.js` **isolado** (strip de `export`, `new Function` retornando `{ getStoriesByLayer, STORY_CONTENT_LAYER, CONTENT_LAYERS }`) e chama `getStoriesByLayer('remote')`. **Fonte única** — sem hardcode. Asserção de sanidade: a lista tem **exatamente 18** e bate com o conjunto esperado da spec §3 (se divergir, aborta com erro claro — mudou a camada de conteúdo).

## 2. Como lê e valida o manifesto vivo (RF1 / N1-índice)
1. Resolve a URL (`--manifest-url` → `EXPO_PUBLIC_GLOBAL_MANIFEST_URL`); se ausente, erro amigável.
2. `httpGetBuffer(url)` (node:https, timeout ~15s, redirect), tratando 404/rede/JSON inválido de forma estruturada.
3. Carrega `src/services/globalManifestService.js` **isolado**, injetando suas dependências (`STORY_CONTENT_LAYER` obtido no passo §1; `warn` = noop) e chama **`validateGlobalContentManifest(raw, { appVersion, allowHttp:false })`** — o **mesmo** validador do app.
4. Registra `ok / errors / warnings`, **quais dos 18 aparecem**, e **packs extras/desconhecidos**. *Warnings* de exclusão por-pack (manifesto tolerante) são capturados por pack (viram “não pronto” no relatório).

## 3. Como valida cada manifest por pack (RF2+RF3 / N1-pack + N2)
Para cada storyId dos 18:
- **N1-pack (RF2):** `getPackFromGlobalManifest(data, storyId)`; confere `access==='premium'`, `baseUrl` https com `/` final, `bytes` inteiro > 0, `manifestPath==='manifest.json'`, `manifestSha256` hex-64 presente, `mediaKinds ⊇ {cover,scene,coloring,audio}`, `requiredAppVersion ≤ appVersion`.
- **N2 (RF3):** `httpGetBuffer(baseUrl + 'manifest.json')` → salva em `<out>/packs/<storyId>/v<major>/manifest.json`; calcula `sha256(manifest.json)` e **confere == `manifestSha256`** (âncora de confiança); valida o manifesto por-pack com **`packManifestService.validateManifest`** (isolado); confere contagem **1 cover + N scene + N coloring + N audio**. Falha em qualquer passo → pack para em N1 (ou N0) com nota.

## 4. Como baixa os arquivos para temporário (RF4 / preparação de N3)
Do manifesto por-pack (lista `files[]` com `path/kind/bytes/sha256`), para cada arquivo: `httpGetToFile(baseUrl + file.path, dest)` (node:https, stream) → grava em `<out>/packs/<storyId>/v<major>/<file.path>` (cria subpastas `scenes/`, `coloring/`, `audio/`). Também grava `<...>/pack.sha256` = `manifestSha256` (a âncora), para casar com o contrato que o `validate-story-pack` espera. Tudo em `<out>` **fora do repo**; ao fim, o temp é **apagado** (salvo `--keep`). Downloads são GET puros; **nada é enviado ao R2**.

## 5. Como confere bytes e sha256 (RF4 / N3)
Invoca a ferramenta existente como subprocesso: **`node scripts/assets-pipeline/validate-story-pack.js --dir <out>/packs/<storyId>/v<major>`** (via `child_process.spawnSync`). O `validate-story-pack` já faz, por pack: **bytes por arquivo == manifesto**, **sha256 por arquivo == manifesto**, convenção de path (`cover.webp` · `scenes/<id>_scene_NN.webp` · `coloring/scene_NN.png` · `audio/<id>_scene_NN.mp3`), `totalBytes == soma`, âncora `pack.sha256 == sha256(manifest.json)` e **compatibilidade com o validador de runtime**. **exit 0 = N3 verde**; a saída é capturada e anexada ao relatório. (Sem alterar `validate-story-pack.js`.)

## 6. Como cruza N de cenas do app com o pack (N2 cross-check)
Carrega `src/data/stories.js` **isolado** e mapeia `storyId → cenas.length` (com assert `cenas.length === totalCenas`). Para cada pack, confere **N_pack (scene) == N_app (cenas.length)** e que `coloring == audio == scene == N_app`. Divergência (ex.: app espera 10, pack traz 9) → pack **não pronto**, com o número exato anotado. Isso garante que o pack cobre **todas** as cenas que o app renderiza.

## 7. Como produz a tabela N1–N4
Monta, por storyId, `{ n1, n2, n3, n4, notes[] }`:
- `n1/n2/n3` = boolean do que foi provado automaticamente (§2–§6).
- `n4` = valor de um **mapa de cobertura de device** mantido no script: `'done'` (david_goliath), `'to-validate'` (as 2–3 desta fase), `'batch-plan'` (as demais 14–15). N4 **não** é auto-verificável (é device) — o script apenas **declara o plano**; o valor real é confirmado no relatório após os testes de device.
- Saída: tabela legível (18 linhas + colunas N1 N2 N3 N4 + notas) e, com `--json`, o objeto completo para anexar ao relatório. Resumo final: `X/18 N3 verde`.

## 8. Histórias propostas para validação device adicional (2–3)
Além de `david_goliath` (referência, já validada na 2B), proponho **3** cobrindo perfis distintos e ainda não exercitados:
1. **`moses_red_sea`** — Antigo Testamento, provável pack visualmente pesado (mar/efeitos) → estressa tamanho/decode.
2. **`jesus_children`** — Novo Testamento → cobre um perfil visual/temático diferente do de referência.
3. **`mary_says_yes`** — uma das 4 promovidas de `coming_soon`→`remote` (F2.0a) → prova que um pack “corrigido” baixa e roda igual aos demais.

> A escolha final pode ajustar por **bytes reais** do manifesto vivo (RF1): se um desses vier muito pequeno/grande fora do esperado, troco por outro de perfil equivalente, registrando o motivo. Roteiro por história = o mesmo da 2B (baixar → `file://` → offline em Narração/Colorir/Livrinho).

## 9. Critério final: manter 2C bloqueada ou liberar a discussão
- **2C permanece BLOQUEADA** se **qualquer** um dos 18 não atingir **N3 verde**, ou se a **cobertura N4 acordada** (referência + as 2–3 + plano de lote das demais) não estiver **documentada** no relatório.
- **Liberar a discussão da 2C** (não a execução) exige, cumulativamente: **18/18 N3 verde** + **N4 `done` em david_goliath + nas 2–3 desta fase** + **plano de lote escrito** para as 14–15 restantes. Mesmo então, a **execução** da 2C é outra trilha (spec própria), fora daqui.
- O relatório declara o **veredito** explicitamente (BLOQUEADA / APTA-A-DISCUTIR) com a lista dos que falharam, se houver.

---

## Tasks (após Portão 2)
- **T1** — `verify-r2-pack-readiness.js`: descoberta dos 18 (§1) + contrato CLI + esqueleto read-only (temp fora do repo, cleanup).
- **T2** — RF1/N1-índice (§2): camada `httpGet` (node:https, redirect/timeout) + `validateGlobalContentManifest` isolado + relatório de índice.
- **T3** — RF2+RF3/N2 (§3, §6): por-pack fields + fetch manifest por-pack + âncora `manifestSha256` + `validateManifest` + cross-check N (stories.js).
- **T4** — RF4/N3 (§4, §5): download dos arquivos p/ temp + `validate-story-pack` subprocess + captura.
- **T5** — Tabela N1–N4 (§7) + `--json` + resumo + exit code.
- **T6** — Rodar contra o R2 real; **persistir** `RELATORIO_2B5_R2_READINESS.md` com a tabela + veredito (§9); registrar as 2–3 de device.
- **T7** — Device (§8): baixar/validar as 2–3 no iPhone; atualizar N4 no relatório.
- **T8** — Gates + relatório final (PT-BR) + `git status`. (Sem `git add`/commit/push sem aprovação.)

## Portões de qualidade
- `npm run smoke` verde (o script é novo e **não** é importado pelo app → nada muda no runtime; smoke permanece 1826/1826, salvo se optarmos por asserts opcionais de existência/read-only do script) + `npx expo-doctor` verde.
- Evidência real = **execução do script** contra o R2 (a tabela pode legitimamente apontar packs “não prontos” — isso **é** o resultado; não é falha da trilha).
- Validação device das 2–3 (§8). Relatórios em PT-BR.

## Paradas obrigatórias (invioláveis)
Não iniciar 2C · não alterar `app.json`/`assetBundlePatterns` · não remover `require` premium · não mover/apagar/renomear/`git rm` assets · não escrever em `src/` nem `assets/` · não tocar R2 (sem upload) · não tocar RevenueCat/compressão · não `git add`/commit/push sem aprovação · **PARAR no Plan** (nenhum código antes do Portão 2).

## Analyze (consistência spec↔plan)
Cada RF da spec tem task e prova objetiva; N3 obrigatório reflete o Clarify; reuso dos validadores de runtime garante compatibilidade sem Expo; script é estritamente read-only (temp fora do repo); gate da 2C inequívoco. **Risco baixo** (nenhuma mudança de runtime/bundle/asset). **CONSISTENTE.**
