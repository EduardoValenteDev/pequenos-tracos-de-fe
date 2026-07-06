# F2.5a — Auditoria e plano de migração dos 18 packs premium

> **Bloco:** F2.5a (auditoria + plano; **sem migração, sem mover/converter assets, sem código de runtime**). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `b665139`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** SUPERSEDED não usados como fonte.

## 1. Objetivo
Mapear como as **18 histórias premium** devem ser preparadas para o **modelo remoto** (packs no R2, baixados sob demanda, validados por sha256, consumidos por `file://` com fallback), usando o padrão **já validado no piloto `david_goliath`** e no downloader genérico — **sem executar a migração real** (isso é F2.5b+). Este bloco entrega inventário, tabela por história, riscos, critérios de aceite e ordem segura de execução.

## 2. Estado da branch
`content-integrate-coloring-3` · HEAD **`b665139`** (`chore: update david goliath scene 02 art`) · **local == origin** · working tree **limpo**. Nada alterado neste bloco (só leitura).

## 3. O que já foi validado no F2.4 (base desta migração)
- **Resolver** (`contentResolver`): starter→require; pack ready→`file://`; remote sem pack→fallback require. Convenção de path por kind (§8).
- **Downloader genérico por storyId** (`packDownloadService.downloadStoryPackScenesFromGlobalManifest`, `requestedKinds`), **sha256 real** (`@noble/hashes`), nunca ready parcial.
- **Manifesto global** (`globalManifestService`, read-only) + `content-manifest.json` publicado/validado no R2 (**só `david_goliath` até agora**).
- **Consumo user-facing** de cover/scene/coloring/áudio (F2.4e.3–e.5) **com fallback local obrigatório**, **gated a `SANDBOX_STORY_ID = 'david_goliath'`**; lifecycle de áudio endurecido (F2.4e.5pR).
- **Ferramentas de pack** já existem: `scripts/assets-pipeline/build-story-pack.js` (assembla + sha256 + `manifest.json`), `validate-story-pack.js`, `install-sandbox-pack.js`, `verify-sandbox-resolver.js`, `validate-pack-manifest.js`.
- **Piloto `david_goliath` provado ponta a ponta** (download→ready→file://→offline em sessão aberta; pack ≈ 18,5 MB). Gate QA release-safe (F2.4e.7b) permite testar em build preview. Build instalado (F2.4e.7c) pendente de credenciais Apple.

## 4. As 18 histórias premium
`david_goliath` (piloto) · `jesus_children` · `daniel_lions` · `esther_queen` · `lost_sheep` · `good_samaritan` · `abraham_stars` · `joseph_colorful_coat` · `moses_red_sea` · `ruth_naomi` · `miraculous_catch` · `jonah_big_fish` · `samuel_hears_god` · `josiah_young_king` · `solomon_wisdom` · `mary_says_yes` · `timothy_faith` · `jesus_temple`.

## 5. As 2 grátis (FORA deste bloco — permanecem STARTER local)
`creation` (A Criação) · `noah` (Noé). Camada `starter` em `contentManifest.js` — **nunca** viram pack remoto; ficam no binário, offline desde a instalação.

## 6. Tabela de auditoria por história (inventário FS × registries)
**Resultado uniforme:** todas as 18 premium têm **cenas 10/10, colorir 10/10, áudio 10/10, capa ✓** e **0 arquivos fora do padrão** de nome do pack. A única variável é o **nome local da capa** (ver coluna). Contagem dos registries do app = exatamente 10/10/10 × 20 (os "extras" 202/201 do grep são **exemplos em comentário JSDoc** de `creation/noah`, não registros).

| storyId | cenas esp/enc | colorir esp/enc | áudio esp/enc | capa (arquivo local) | peso local | status | obs |
|---|---|---|---|---|---|---|---|
| david_goliath | 10/10 | 10/10 | 10/10 | `david_goliath_cover.webp` (EN) | 17,7 MB | ✅ pronto (piloto) | já no R2 |
| jesus_children | 10/10 | 10/10 | 10/10 | `jesus_children_cover.webp` (EN) | 19,1 MB | ✅ pronto | — |
| daniel_lions | 10/10 | 10/10 | 10/10 | `daniel_leoes_cover.webp` (PT) | 17,1 MB | ✅ pronto | capa PT |
| esther_queen | 10/10 | 10/10 | 10/10 | `ester_rainha_cover.webp` (PT) | 18,2 MB | ✅ pronto | capa PT |
| lost_sheep | 10/10 | 10/10 | 10/10 | `ovelha_perdida_cover.webp` (PT) | 17,3 MB | ✅ pronto | capa PT |
| good_samaritan | 10/10 | 10/10 | 10/10 | `bom_samaritano_cover.webp` (PT) | 18,4 MB | ✅ pronto | capa PT |
| abraham_stars | 10/10 | 10/10 | 10/10 | `abraao_estrelas_cover.webp` (PT) | 16,5 MB | ✅ pronto | capa PT |
| joseph_colorful_coat | 10/10 | 10/10 | 10/10 | `jose_tunica_cover.webp` (PT) | 19,5 MB | ✅ pronto | capa PT |
| moses_red_sea | 10/10 | 10/10 | 10/10 | `moises_mar_vermelho_cover.webp` (PT) | 19,8 MB | ✅ pronto | capa PT |
| ruth_naomi | 10/10 | 10/10 | 10/10 | `rute_noemi_cover.webp` (PT) | 17,9 MB | ✅ pronto | capa PT |
| miraculous_catch | 10/10 | 10/10 | 10/10 | `pesca_milagrosa_cover.webp` (PT) | 18,2 MB | ✅ pronto | capa PT |
| jonah_big_fish | 10/10 | 10/10 | 10/10 | `jonas_peixe_cover.webp` (PT) | 17,6 MB | ✅ pronto | capa PT |
| samuel_hears_god | 10/10 | 10/10 | 10/10 | `samuel_ouve_cover.webp` (PT) | 14,0 MB | ✅ pronto | capa PT |
| josiah_young_king | 10/10 | 10/10 | 10/10 | `josias_rei_jovem_cover.webp` (PT) | 16,5 MB | ✅ pronto | capa PT |
| solomon_wisdom | 10/10 | 10/10 | 10/10 | `salomao_sabedoria_cover.webp` (PT) | 16,4 MB | ✅ pronto | capa PT |
| mary_says_yes | 10/10 | 10/10 | 10/10 | `maria_boa_noticia_cover.webp` (PT) | 18,8 MB | ✅ pronto | capa PT |
| timothy_faith | 10/10 | 10/10 | 10/10 | `timoteo_fe_cover.webp` (PT) | 16,6 MB | ✅ pronto | capa PT |
| jesus_temple | 10/10 | 10/10 | 10/10 | `jesus_templo_cover.webp` (PT) | 18,4 MB | ✅ pronto | capa PT |

**TOTAL 18 premium (local) = 318 MB** (média **17,7 MB**/história). **Composição:** colorir (PNG lossless) ≈ **13 MB/história ≈ 235 MB (74%)**; cenas WebP ~1–2 MB; áudio ~2,5–3 MB; capa <300 KB. **Todos os assets estão rastreados no Git** (scenes+coloring 400/400, áudio 224/224, capas 20/20) → **backup garantido** antes de qualquer remoção.

## 7. Caminhos LOCAIS atuais (no bundle hoje)
- **Cenas:** `assets/stories/<id>/scenes/<id>_scene_NN.webp` — registry `src/data/storySceneIllustrations.js` (10/história).
- **Colorir:** `assets/stories/<id>/coloring/scene_NN.png` — registry `src/assets/coloringImages.js` (10/história).
- **Áudio:** `assets/audio/<id>/<id>_scene_NN.mp3` — registry `src/data/audioManifest.js` (10/história).
- **Capa:** `assets/images/<nome_local>_cover.webp` — registry `src/assets/storyCovers.js` (**nome PT/EN por história**, 20/20).

## 8. Caminhos REMOTOS esperados (dentro do pack — convenção do resolver)
- `cover.webp` · `scenes/<id>_scene_NN.webp` · `coloring/scene_NN.png` · `audio/<id>_scene_NN.mp3` · `manifest.json` (lista + sha256 por arquivo).
- Pack em `documentDirectory/packs/<id>@<version>/…` no device; no R2: `packs/<id>/v1/…` (baseUrl autoritativo no manifesto global).
- **Cenas/colorir/áudio já batem 1:1** com essa convenção (prefixo `<id>` em inglês nas cenas/áudio; `scene_NN.png` no colorir). **A capa** local (nome PT) é **normalizada para `cover.webp`** no pack — o builder deve mapear via `storyCovers.js`, **não** por convenção de nome.

## 9. Riscos técnicos
- **R-1 (ALTO) — remover o fallback local quebra premium não-baixado.** Hoje o modelo é "remoto **com** fallback local" (os requires premium ficam no bundle). A economia de ~318 MB **só existe se removermos os requires premium** — e aí **não há mais fallback**: uma história premium sem pack baixado ficaria **sem imagem**. ⇒ A remoção só pode vir **depois** de uma UX de "baixar antes de ver" (estados baixado/baixando/erro/não-baixado). **A invariante "fallback local obrigatório" (F2.4e.3–5) deixa de valer para premium** — passa a valer só para `creation/noah`.
- **R-2 (MÉDIO) — nomes PT das capas.** O builder de pack deve resolver a capa por `storyCovers.js` (mapa storyId→arquivo), não por `<id>_cover.webp`. Se assumir o nome inglês, falha em 16 das 18.
- **R-3 (MÉDIO) — peso do colorir (PNG lossless).** 74% do peso do pack é colorir (~235 MB no total). Colorir **precisa continuar lossless** (flood-fill) → **não** comprimir com perda. Mitigação: **download por kind** (baixar colorir só ao entrar no Colorir) reduz o download inicial; já há suporte a `requestedKinds` no downloader.
- **R-4 (MÉDIO) — URL R2 temporária.** O baseUrl atual é `pub-…r2.dev` (temporário). Produção exige **domínio próprio** (ver `F2_4B_R2_CDN_RUNBOOK.md`) antes do lançamento.
- **R-5 (BAIXO) — gate de consumo single-story.** O consumo remoto é gated a `SANDBOX_STORY_ID='david_goliath'`. Expandir para as 18 deve ser dirigido por `contentManifest.STORY_CONTENT_LAYER === 'remote'` (não hardcode), preservando `creation/noah` locais.
- **R-6 (BAIXO) — manifesto global incompleto.** `content-manifest.json` no R2 só tem `david_goliath`; precisa das outras 17 entradas (bytes, sha256 do manifesto, baseUrl).
- **R-7 (BAIXO) — progresso/conquistas por storyId.** A migração **não** deve tocar chaves `@ptf_*` nem lógica de progresso; assets ≠ progresso.

## 10. Critérios de aceite para iniciar F2.5b
1. Cada pack construído por `build-story-pack.js` passa em `validate-story-pack.js` (10 cenas + 10 colorir + 10 áudio + cover + `manifest.json` com sha256 por arquivo).
2. `content-manifest.json` global inclui as 18 (bytes + sha256 + baseUrl) e valida por `globalManifestService`.
3. sha256 de cada arquivo confere (build local == device).
4. Consumo remoto expandido **mantém fallback local** enquanto os requires premium existirem (etapa intermediária segura).
5. `creation/noah` permanecem starter/local, intactos.
6. Gates verdes (`smoke`/`expo-doctor`/`audio:audit`) + validação no device do piloto ampliado.
7. **Backup confirmado** (assets rastreados no Git) antes de qualquer remoção de require.

## 11. Plano recomendado de migração por etapas
- **F2.5b — Construir os 18 packs + manifestos (sem tocar runtime).** Rodar `build-story-pack.js` para as 17 restantes (david_goliath já feito), mapeando a capa via `storyCovers.js`. Gerar `manifest.json` (sha256) por pack e o `content-manifest.json` global com as 18. Validar com `validate-story-pack.js`. **Upload ao R2** (fora do repo; não hardcodar URL). Ainda **sem** consumo ampliado.
- **F2.5c — Expandir o consumo remoto (COM fallback local ainda).** Trocar o gate `SANDBOX_STORY_ID` por "história é `remote` no `contentManifest`" nos hooks, preservando fallback local. Validar no device (baixar 2–3 packs → file://; sem pack → fallback local). Baixo risco (nada removido do bundle).
- **F2.5d — UX de download premium (estados).** Estados baixado/baixando/erro/não-baixado por história (chip/selo/ícone — D-STATUS-CARDS, sem paleta paralela) + download sob demanda + download por kind (colorir tardio). Sem remover requires ainda.
- **F2.5e — Remover os requires premium do bundle (SHRINK — passo destrutivo/reversível).** Só depois de b/c/d provados: remover as 18 premium de `storySceneIllustrations`/`coloringImages`/`audioManifest`/`storyCovers`/`images.js`; premium passa a depender do pack (sem fallback local; `creation/noah` intactos). **Medir bundle real** (deve cair ~318 MB → rumo a 40–80 MB). Backup via Git.
- **F2.5f — Domínio R2 de produção + verificação final** (substituir `r2.dev`), auditoria de bundle, e retomar o **build instalado** (F2.4e.7c) quando Apple/Google liberarem.

## 12. O que NÃO foi feito neste bloco
Nenhuma migração; nenhum pack construído/enviado; nenhum asset movido/convertido/removido; nenhum import/runtime alterado; nenhum gate expandido; sem tocar `david_goliath` (história já concluída); sem commit/push; sem EAS/build. Apenas leitura + este documento.

## 13. Próximo bloco recomendado
**F2.5b** — construir os 18 packs + manifestos + upload ao R2 (sem tocar runtime), conforme §11. Depois BR0.1 (naming/def do Brincar) pode correr em paralelo por ser eixo separado.
