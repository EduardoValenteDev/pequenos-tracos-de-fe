# F2.5b.2b / 2bR — Upload dos 18 packs premium ao R2 + publicação do content-manifest.json

> **Bloco:** F2.5b.2b (bloqueio inicial) + **F2.5b.2bR (upload assistido + limpeza — CONCLUÍDO)**. **Data:** 2026-07-06 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `31f3fe2`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** SUPERSEDED não usados como fonte.
>
> **✅ STATUS: CONCLUÍDO.** Os **18 packs** e o **`content-manifest.json` (18 entradas)** estão no R2, **validados por `rclone check` = 0 diferenças / 594 arquivos batendo**. O legado pré-existente (34 arquivos sob `david_goliath/v1/ptf_pack_sandbox/`) foi **removido com aprovação explícita** (purge do prefixo exato). Estado final: **594 arquivos válidos, 18 packs, 0 diferenças**.

## 1. Objetivo
Publicar no R2 os **18 packs premium** em `packs/<storyId>/v1/` e o **`content-manifest.json`** global (18 entradas), validar remotamente (integridade bytes+hash). **Escopo QA:** `r2.dev` (temporário).

## 2. Estado da branch
`content-integrate-coloring-3` · HEAD **`31f3fe2`** · **local == origin** · **Nenhum runtime/asset/config do app tocado** (só este doc muda).

## 3. Decisão: r2.dev apenas para QA
`r2.dev` (temporário) só para QA/piloto. **Domínio próprio** fica para **F2.5f / produção** (§12).

## 4. Bucket, remote e baseUrl (sem secrets)
- **Bucket técnico:** `ptf-packs` (o painel mostra "pacotes ptf"; o técnico é `ptf-packs`). **Remote rclone:** `r2ptf` (`no_check_bucket = true`).
- **baseUrl (QA):** `https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/packs/<storyId>/v1/` · **Manifesto:** `…/content-manifest.json`.
- **Nenhum secret** impresso; **`rclone config show` não foi executado**.

## 5. Diretórios locais
Packs: `C:\tmp\ptf_f2_5b1_packs\packs\<storyId>\v1\` (594 arquivos) · Manifesto: `C:\tmp\ptf_f2_5b2_preflight\content-manifest.premium.json`.

## 6. Histórico do bloqueio (resolvido)
- **F2.5b.2b (05/07):** sem CLI/credenciais no ambiente → parado por regra (nenhum upload).
- **1ª tentativa 2bR:** token **read-only** → `PutObject` 403; bucket verificado intacto.
- **2bR final (06/07):** token reconfigurado com **escrita** (smoke `copyto`+`lsf`+`deletefile` em `tmp/` OK). Upload liberado.

## 7. Comandos executados
```
# smoke de escrita (arquivo local pequeno → copyto → lsf → deletefile → lsf)  [OK]
rclone copyto C:/tmp/_ptf_write_probe.txt r2ptf:ptf-packs/tmp/_ptf_write_probe.txt --s3-no-check-bucket --s3-no-head --s3-no-head-object
rclone deletefile r2ptf:ptf-packs/tmp/_ptf_write_probe.txt
# upload: packs (copy, NUNCA sync) [exit 0] + manifesto por último (copyto) [exit 0]
rclone copy   C:/tmp/ptf_f2_5b1_packs/packs r2ptf:ptf-packs/packs --s3-no-check-bucket --s3-no-head --s3-no-head-object --ignore-times --transfers 8
rclone copyto C:/tmp/ptf_f2_5b2_preflight/content-manifest.premium.json r2ptf:ptf-packs/content-manifest.json --s3-no-check-bucket --s3-no-head --s3-no-head-object
# limpeza do legado (após lsf confirmar exatamente 34 arquivos sob o prefixo) [exit 0]
rclone lsf -R r2ptf:ptf-packs/packs/david_goliath/v1/ptf_pack_sandbox   # → 34 arquivos
rclone purge r2ptf:ptf-packs/packs/david_goliath/v1/ptf_pack_sandbox --s3-no-check-bucket
```

## 8. Resultado por pack (18/18 enviados e validados)
Integridade final: **`rclone check` (local × remoto, `--checksum`) → 0 diferenças, 594 arquivos batendo.** Cada pack = **33 arquivos** (cover + 10 scenes + 10 coloring + 10 audio + manifest.json + pack.sha256).

| storyId | path remoto | bytes | arquivos | upload | validação |
|---|---|---|---|---|---|
| david_goliath | packs/david_goliath/v1/ | 18.604.321 | 33 | ✅ (reenviado) | **✓** |
| jesus_children | packs/jesus_children/v1/ | 20.062.852 | 33 | ✅ | **✓** |
| daniel_lions | packs/daniel_lions/v1/ | 17.942.524 | 33 | ✅ | **✓** |
| esther_queen | packs/esther_queen/v1/ | 19.085.497 | 33 | ✅ | **✓** |
| lost_sheep | packs/lost_sheep/v1/ | 18.172.387 | 33 | ✅ | **✓** |
| good_samaritan | packs/good_samaritan/v1/ | 19.262.558 | 33 | ✅ | **✓** |
| abraham_stars | packs/abraham_stars/v1/ | 17.310.883 | 33 | ✅ | **✓** |
| joseph_colorful_coat | packs/joseph_colorful_coat/v1/ | 20.498.590 | 33 | ✅ | **✓** |
| moses_red_sea | packs/moses_red_sea/v1/ | 20.775.406 | 33 | ✅ | **✓** |
| ruth_naomi | packs/ruth_naomi/v1/ | 18.745.192 | 33 | ✅ | **✓** |
| miraculous_catch | packs/miraculous_catch/v1/ | 19.036.614 | 33 | ✅ | **✓** |
| jonah_big_fish | packs/jonah_big_fish/v1/ | 18.460.884 | 33 | ✅ | **✓** |
| samuel_hears_god | packs/samuel_hears_god/v1/ | 14.693.861 | 33 | ✅ | **✓** |
| josiah_young_king | packs/josiah_young_king/v1/ | 17.289.268 | 33 | ✅ | **✓** |
| solomon_wisdom | packs/solomon_wisdom/v1/ | 17.234.559 | 33 | ✅ | **✓** |
| mary_says_yes | packs/mary_says_yes/v1/ | 19.679.196 | 33 | ✅ | **✓** |
| timothy_faith | packs/timothy_faith/v1/ | 17.395.430 | 33 | ✅ | **✓** |
| jesus_temple | packs/jesus_temple/v1/ | 19.259.328 | 33 | ✅ | **✓** |

**Total: 333.509.350 bytes (318,1 MB) · 594 arquivos · 18 packs.**

## 9. content-manifest.json remoto
- **Antes:** 1 entrada (david_goliath, arte antiga). **Agora (read-only):** **18 entradas**; `david_goliath` = **`18.604.321` / `7f8c123e…`** (atualizado). URL: `…/content-manifest.json`.

## 10. david_goliath com a cena 02 nova (remoto)
`GET …/packs/david_goliath/v1/scenes/david_goliath_scene_02.webp` → **HTTP 200, Content-Length 306.948** (nova; antiga 235.104). ✅

## 11. Limpeza do legado (removido com aprovação explícita)
- **Achado:** 34 arquivos remotos a mais (628 vs 594) — todos sob `packs/david_goliath/v1/ptf_pack_sandbox/…` (staging de um upload antigo, aninhado por engano; não referenciado pelo manifesto).
- **Procedimento controlado (aprovado):** `lsf -R` do prefixo confirmou **exatamente 34** arquivos → `rclone purge` **só** desse prefixo → validação: `packs/david_goliath/v1` ficou com **33 arquivos, 0 referências a ptf_pack_sandbox**.
- **Estado final:** total remoto **594 arquivos** (18×33), `rclone check` **0 diferenças**. **Nenhum outro objeto apagado; nenhum `sync`.**

## 12. Pendências para produção
- **a) Domínio próprio:** substituir `r2.dev` (temporário) — F2.5f.
- **b) Build instalado:** offline real do remoto depende do build preview (F2.4e.7c, bloqueado por conta Apple em verificação).
- **c) Remoção dos requires premium:** só **depois** da UX de download premium (F2.5d).

## 13. Confirmações de escopo
Sem `sync` (só `copy`/`copyto`/`purge` do prefixo exato); **apenas o legado `ptf_pack_sandbox` foi apagado** (34 arquivos, com aprovação); **nenhum secret exposto** (sem `config show`); nenhum outro bucket/prefixo tocado; `content-manifest.json` e os 18 packs preservados; `tmp/` vazio; **nenhum** runtime/asset/import/config do app alterado.
