# F2.5b.2b — Upload dos 18 packs premium ao R2 + publicação do content-manifest.json

> **Bloco:** F2.5b.2b (upload R2 + publicação do manifesto global). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `7cdbaf6`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** SUPERSEDED não usados como fonte.
>
> **⚠️ STATUS: BLOQUEADO no portão de credenciais — UPLOAD NÃO FEITO.** Este ambiente **não possui credenciais nem ferramentas R2**. Pela **regra 2 do bloco** ("se as credenciais R2 não estiverem disponíveis, parar e relatar, sem tentar upload"), **nenhum upload foi tentado**. O upload é conduzido **manualmente/externamente** por Eduardo (como o piloto) — plano no §7.

## 1. Objetivo
Publicar no R2 os **18 packs premium** em `packs/<storyId>/v1/` e o **`content-manifest.json`** global consolidado, depois validar remotamente (bytes+sha256). **Escopo QA:** usar `r2.dev` (temporário), como no piloto.

## 2. Estado inicial da branch
`content-integrate-coloring-3` · HEAD **`7cdbaf6`** (`docs: record f2.5b.2a premium manifest preflight`) · **local == origin** · working tree **limpo** (confirmado limpo ao fim). **Nenhum runtime/asset/config do app tocado.**

### Preflight local (tudo pronto para upload)
- **18/18 packs presentes e revalidados** (`validate-story-pack.js` → todos `VÁLIDO ✓`) em `C:\tmp\ptf_f2_5b1_packs`.
- **Manifesto global local existe** (`C:\tmp\ptf_f2_5b2_preflight\content-manifest.premium.json`, 18 entradas, validado pelo validador real).
- **`david_goliath` = cena 02 nova** (sha256 do pack == asset publicado). ✓

## 3. Decisão: r2.dev apenas para QA
`r2.dev` (URL pública temporária) é usado **só para QA/piloto**, seguindo o padrão já validado. **Domínio próprio NÃO é configurado agora** — fica como pendência para **F2.5f / produção / build instalado** (§10).

## 4. Bucket e baseUrl (sem secrets)
- **Bucket:** `ptf-packs`.
- **baseUrl (QA):** `https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/packs/<storyId>/v1/` (público, read-only; **não é credencial**).
- **Manifesto global:** `https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/content-manifest.json`.
- **Nenhum secret** (access key / token) aparece neste documento nem foi impresso em terminal.

## 5. Diretórios locais usados
- Packs: `C:\tmp\ptf_f2_5b1_packs\packs\<storyId>\v1\` (fora do repo).
- Manifesto: `C:\tmp\ptf_f2_5b2_preflight\content-manifest.premium.json` (fora do repo).

## 6. Bloqueio de credenciais (evidência, sem secrets)
Verificação (só presença, **nenhum valor impresso**):
- **Ferramentas:** `wrangler` **ausente** · `rclone` **ausente** · `aws` **ausente**.
- **Variáveis:** `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `S3_ENDPOINT` — **todas `unset`**.
- **rclone remotes:** nenhum. **`.env.local`:** sem chaves R2.
⇒ **Sem meio de upload autenticado neste ambiente.** Consistente com o piloto (subido manualmente). **Parado por regra; nenhum upload tentado.**

## 7. Tabela dos 18 packs (a enviar) — status: PENDENTE de upload
Path remoto = `packs/<storyId>/v1/` (contendo `cover.webp`, `scenes/`, `coloring/`, `audio/`, `manifest.json`, `pack.sha256`).

| storyId | path remoto | bytes | manifestSha256 (12) | upload | validação remota |
|---|---|---|---|---|---|
| david_goliath | packs/david_goliath/v1/ | 18.604.321 | `7f8c123e4ced…` | PENDENTE (reenviar) | PENDENTE |
| jesus_children | packs/jesus_children/v1/ | 20.062.852 | `f4014c3428f0…` | PENDENTE | PENDENTE |
| daniel_lions | packs/daniel_lions/v1/ | 17.942.524 | `565b5ae9a296…` | PENDENTE | PENDENTE |
| esther_queen | packs/esther_queen/v1/ | 19.085.497 | `5b6e9540326d…` | PENDENTE | PENDENTE |
| lost_sheep | packs/lost_sheep/v1/ | 18.172.387 | `76c8432fb58b…` | PENDENTE | PENDENTE |
| good_samaritan | packs/good_samaritan/v1/ | 19.262.558 | `2a7b574b1d56…` | PENDENTE | PENDENTE |
| abraham_stars | packs/abraham_stars/v1/ | 17.310.883 | `dffc9c09edd7…` | PENDENTE | PENDENTE |
| joseph_colorful_coat | packs/joseph_colorful_coat/v1/ | 20.498.590 | `a5c5c63449f5…` | PENDENTE | PENDENTE |
| moses_red_sea | packs/moses_red_sea/v1/ | 20.775.406 | `d31c843c1daa…` | PENDENTE | PENDENTE |
| ruth_naomi | packs/ruth_naomi/v1/ | 18.745.192 | `765a62a9e6a6…` | PENDENTE | PENDENTE |
| miraculous_catch | packs/miraculous_catch/v1/ | 19.036.614 | `ebaa5b22fa52…` | PENDENTE | PENDENTE |
| jonah_big_fish | packs/jonah_big_fish/v1/ | 18.460.884 | `b8fe0c455a0d…` | PENDENTE | PENDENTE |
| samuel_hears_god | packs/samuel_hears_god/v1/ | 14.693.861 | `5e8c7db24894…` | PENDENTE | PENDENTE |
| josiah_young_king | packs/josiah_young_king/v1/ | 17.289.268 | `2e1b85630278…` | PENDENTE | PENDENTE |
| solomon_wisdom | packs/solomon_wisdom/v1/ | 17.234.559 | `fc15528a9319…` | PENDENTE | PENDENTE |
| mary_says_yes | packs/mary_says_yes/v1/ | 19.679.196 | `dc0af5bdfa7b…` | PENDENTE | PENDENTE |
| timothy_faith | packs/timothy_faith/v1/ | 17.395.430 | `d7455e94990b…` | PENDENTE | PENDENTE |
| jesus_temple | packs/jesus_temple/v1/ | 19.259.328 | `1e53fa92d086…` | PENDENTE | PENDENTE |

**Total a enviar: 333.509.350 bytes (318,1 MB).**

## 8. Status do content-manifest.json remoto
- **Atual (verificado read-only, HTTP 200):** **1 entrada** — `david_goliath` com `bytes 18.532.477` / `sha 23ee6c27…` (**arte antiga**).
- **Amostra de packs remotos:** `david_goliath/v1/manifest.json` → **HTTP 200** (arte antiga); `daniel_lions/v1/manifest.json` → **HTTP 404**; `jesus_temple/v1/manifest.json` → **HTTP 404** (não enviados).
- **Alvo (após upload):** **18 entradas**, com `david_goliath` atualizado (`18.604.321` / `7f8c123e…`).

## 9. david_goliath com a cena 02 nova
- **Local:** pronto (`18.604.321` / `7f8c123e…`). ✓
- **Remoto:** **ainda antigo** (`18.532.477` / `23ee6c27…`) → o upload **deve substituir** o pack `david_goliath` e a entrada no manifesto para não deixar a arte antiga.

## 10. Plano de upload (Eduardo — com credenciais próprias; NÃO expor secrets)
> Rodar na máquina do Eduardo, com credenciais R2 (nunca em log/doc). Uma das opções:
> **A) Painel Cloudflare R2** (bucket `ptf-packs`): subir cada pasta `C:\tmp\ptf_f2_5b1_packs\packs\<id>\v1\` → `packs/<id>/v1/` (preservando subpastas); subir `content-manifest.premium.json` como `content-manifest.json` na raiz.
> **B) rclone/wrangler** (após `rclone config`/`wrangler login` com credenciais):
> ```
> # cada pack (preserva scenes/coloring/audio/manifest.json/pack.sha256/cover.webp)
> rclone copy C:/tmp/ptf_f2_5b1_packs/packs r2:ptf-packs/packs --checksum
> # manifesto global (renomeia p/ content-manifest.json na raiz)
> rclone copyto C:/tmp/ptf_f2_5b2_preflight/content-manifest.premium.json r2:ptf-packs/content-manifest.json
> ```
> **Idempotente / não-destrutivo:** apenas **cria/atualiza** os objetos-alvo (os 18 packs + o manifesto). **Não apagar** outros objetos.

## 11. Plano de validação remota (após o upload — read-only, sem credenciais)
1. `GET …/content-manifest.json` → **18 entradas**; `david_goliath` = `18.604.321` / `7f8c123e…`.
2. Para cada storyId: `GET …/packs/<id>/v1/manifest.json` (HTTP 200) e `…/pack.sha256` (HTTP 200).
3. Conferir `bytes` (Content-Length/soma) e `sha256` do `manifest.json` remoto == o `manifestSha256` local.
4. (Opcional) baixar 1–2 arquivos por pack e re-hashear vs o `manifest.json`.
> Este relatório pode ser reaberto para preencher as colunas "upload"/"validação remota" da §7 quando o upload for concluído.

## 12. Pendências para produção
- **a) Domínio próprio:** substituir `r2.dev` (temporário) por domínio próprio (regenerar o manifesto com o baseUrl final) — F2.5f.
- **b) Build instalado:** medição/offline real do remoto depende do build preview (F2.4e.7c, bloqueado por conta Apple em verificação).
- **c) Remoção dos requires premium:** só **depois** da UX de download premium (F2.5d) — para não quebrar o fallback local.

## 13. O que NÃO foi feito neste bloco
**Nenhum upload R2** (bloqueado por credenciais); **nenhum objeto remoto apagado/sobrescrito**; **nenhum secret exposto**; **nenhum** runtime/asset/imagem/áudio/import/config do app alterado; sem adicionar script ao repo (verificações via curl/node em `C:\tmp`); sem BR0.1; sem commit/push. Único arquivo no repo = **este documento**.
