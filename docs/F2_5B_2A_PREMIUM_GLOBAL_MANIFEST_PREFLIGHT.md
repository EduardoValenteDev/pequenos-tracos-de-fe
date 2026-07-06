# F2.5b.2a — Preflight do manifesto global consolidado dos 18 packs premium

> **Bloco:** F2.5b.2a (preparação local + validação + doc; **sem upload R2, sem commit/push, sem tocar runtime/assets/config do app**). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `9943c4c`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** SUPERSEDED não usados como fonte.

## 1. Objetivo
Gerar e **validar localmente** o `content-manifest.json` global consolidando os **18 packs premium** (bytes, sha256, storyId, versão, paths remotos, baseUrl planejado), **compatível com o downloader/validador já validados no F2.4**, preparando o upload R2 do próximo bloco (F2.5b.2b). **Não** faz upload; **não** toca o app.

## 2. Estado inicial da branch
`content-integrate-coloring-3` · HEAD **`9943c4c`** (`chore: support story cover registry in pack builder`) · **local == origin** · working tree **limpo** (confirmado limpo também ao fim).

## 3. Relação com F2.5a e F2.5b.1a
- **F2.5a** definiu o plano e os riscos (R-2 capas PT, R-4 URL R2 temporária).
- **F2.5b.1a** corrigiu o builder (capa via `storyCovers.js`) e construiu **18/18 packs válidos** (318,1 MB) em `C:\tmp\ptf_f2_5b1_packs`.
- **F2.5b.2a (este):** consolida esses 18 packs num manifesto global e valida contra o schema/validador reais do app.

## 4. Diretórios usados
- **Entrada (18 packs, F2.5b.1a):** `C:\tmp\ptf_f2_5b1_packs\packs\<id>\v1\` — confirmados **18/18 presentes** (cada um com `manifest.json` + `pack.sha256`).
- **Saída (este preflight):** `C:\tmp\ptf_f2_5b2_preflight\` — `content-manifest.premium.json` (11.306 bytes) + `gen.cjs` (gerador) + `_validator.cjs` (validador transformado). **Tudo FORA do repo.**

## 5. Como o manifesto global foi gerado
Script local `gen.cjs` (em `C:\tmp`, **não** no repo): para cada storyId, lê o **`manifest.json` do pack** (→ `bytes` = `totalBytes`, `title` = `metadata.title`, contagem de kinds) e o **`pack.sha256`** (→ `manifestSha256` = sha256 do `manifest.json` do pack). Monta cada entrada no **mesmo schema do piloto** e a raiz `{ manifestVersion:1, generatedAt, minAppVersion:'1.0.0', packs:[…18…] }`. **Validado pelo validador REAL do app** (`src/services/globalManifestService.js` → `validateGlobalContentManifest`, carregado por avaliação isolada com `knownStoryIds` explícito) → **OK, 18 packs, 0 erros, 0 warnings.**

## 6. Tabela dos 18 packs
Raiz: `manifestVersion: 1` · `minAppVersion: 1.0.0` · `packs: 18` · todos `version 1.0.0`, `type story`, `access premium`, `manifestPath manifest.json`, `mediaKinds [cover,scene,coloring,audio]`, `status not_downloaded`, contagem **cover 1 / scene 10 / coloring 10 / audio 10**.

| storyId | versão | bytes | manifestSha256 (12) | validação |
|---|---|---|---|---|
| david_goliath | 1.0.0 | 18.604.321 | `7f8c123e4ced…` | ✓ |
| jesus_children | 1.0.0 | 20.062.852 | `f4014c3428f0…` | ✓ |
| daniel_lions | 1.0.0 | 17.942.524 | `565b5ae9a296…` | ✓ |
| esther_queen | 1.0.0 | 19.085.497 | `5b6e9540326d…` | ✓ |
| lost_sheep | 1.0.0 | 18.172.387 | `76c8432fb58b…` | ✓ |
| good_samaritan | 1.0.0 | 19.262.558 | `2a7b574b1d56…` | ✓ |
| abraham_stars | 1.0.0 | 17.310.883 | `dffc9c09edd7…` | ✓ |
| joseph_colorful_coat | 1.0.0 | 20.498.590 | `a5c5c63449f5…` | ✓ |
| moses_red_sea | 1.0.0 | 20.775.406 | `d31c843c1daa…` | ✓ |
| ruth_naomi | 1.0.0 | 18.745.192 | `765a62a9e6a6…` | ✓ |
| miraculous_catch | 1.0.0 | 19.036.614 | `ebaa5b22fa52…` | ✓ |
| jonah_big_fish | 1.0.0 | 18.460.884 | `b8fe0c455a0d…` | ✓ |
| samuel_hears_god | 1.0.0 | 14.693.861 | `5e8c7db24894…` | ✓ |
| josiah_young_king | 1.0.0 | 17.289.268 | `2e1b85630278…` | ✓ |
| solomon_wisdom | 1.0.0 | 17.234.559 | `fc15528a9319…` | ✓ |
| mary_says_yes | 1.0.0 | 19.679.196 | `dc0af5bdfa7b…` | ✓ |
| timothy_faith | 1.0.0 | 17.395.430 | `d7455e94990b…` | ✓ |
| jesus_temple | 1.0.0 | 19.259.328 | `1e53fa92d086…` | ✓ |

**Total planejado para upload: 333.509.350 bytes (318,1 MB)** em 18 packs. **`david_goliath` = 18.604.321 bytes → o pack RECONSTRUÍDO com a cena 02 nova** (vs 18.532.477 no R2 atual, arte antiga).

## 7. BaseUrl planejado e origem
`baseUrl` de cada pack = **`https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/packs/<storyId>/v1/`** (termina com `/`, `https://`).
- **Origem:** é o **mesmo padrão do piloto** — do `content-manifest.json` publicado no F2.4d.2b e do runbook `docs/F2_4B_R2_CDN_RUNBOOK.md` (bucket `ptf-packs`). **Nenhuma URL nova foi inventada.**
- ⚠️ **`r2.dev` é TEMPORÁRIO** (R-4 do F2.5a): produção exige **domínio próprio**. Para o upload de QA/piloto o `r2.dev` é aceitável (como no piloto), mas o manifesto de produção precisará do domínio final.

## 8. Comparação com o piloto david_goliath
- **Mesma estrutura de campos** (13 campos por pack: id, storyId, version, type, access, title, bytes, baseUrl, manifestPath, manifestSha256, requiredAppVersion, mediaKinds, status). ✓
- `access/type/version/manifestPath/baseUrl` idênticos ao piloto. ✓
- **Diferença esperada e correta:** `david_goliath.bytes` e `manifestSha256` **mudaram** (18.604.321 / `7f8c123e…` vs 18.532.477 / `23ee6c27…`) porque o pack foi reconstruído com a **cena 02 nova**. ✓

## 9. Compatibilidade com o downloader genérico
- Validado pelo **`validateGlobalContentManifest`** (o MESMO validador que o app usa em `globalManifestService` / `fetchGlobalContentManifest`) → **OK**. O downloader genérico (`packDownloadService.downloadStoryPackScenesFromGlobalManifest`) consome exatamente este schema: `getPackFromGlobalManifest(storyId)` → `baseUrl` + `manifestPath` → busca o `manifest.json` do pack → baixa/valida por bytes+sha256. Como o schema é **idêntico ao piloto** (que já roda ponta a ponta no device), é compatível.

## 10. Pendências antes do upload R2 (F2.5b.2b)
1. **Domínio R2 de produção** (R-4): `r2.dev` é temporário. Para QA/piloto, ok; para loja, definir domínio próprio e regenerar o manifesto com o baseUrl final.
2. **Upload dos 18 packs ao R2** (bucket `ptf-packs`): os 17 não-piloto **ainda não estão no R2** (baseUrls apontam para objetos que ainda não existem). Requer **credenciais R2** (externas/manuais — como no upload do piloto). Este bloco **não** faz upload nem sobrescreve objetos.
3. **Reenviar `david_goliath`**: o objeto no R2 está com a arte antiga (cena 02) → substituir pelo pack novo (bytes 18.604.321 / sha `7f8c123e…`).
4. **Publicar o `content-manifest.json` global** com as 18 entradas (hoje o R2 só tem 1 entrada — david_goliath antigo).
5. **Confirmar bucket/credenciais** antes de qualquer upload; se algo estiver indefinido, **parar e registrar** (nenhum upload especulativo).

## 11. Critérios de aceite para abrir F2.5b.2b
1. 18/18 packs presentes e válidos localmente ✓ (este bloco).
2. Manifesto global local gerado e **validado pelo validador real** ✓ (este bloco).
3. Bucket R2 + credenciais confirmados (externo).
4. Domínio/baseUrl definido para o upload (r2.dev p/ QA; próprio p/ produção).
5. Plano de upload **idempotente** (não apagar/sobrescrever sem intenção); `david_goliath` reenviado com a arte nova.
6. Gates verdes; app intocado.

## 12. O que NÃO foi feito
Sem upload R2; sem apagar/sobrescrever objetos no R2; **sem tocar runtime/assets/imagens/áudio/imports/config do app**; sem copiar o manifesto para `assets/` do app; **sem adicionar script ao repo** (gerador/validador ficam em `C:\tmp`); sem BR0.1; sem commit/push. Único arquivo que aparece no repo = **este documento**.
