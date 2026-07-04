# F2.4a — Auditoria e plano da distribuição remota definitiva de packs

> **Bloco:** F2.4a (Fase 2 → transição p/ produção). **Somente auditoria e plano.**
> **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `d1087f9`.
> Este documento **registra oficialmente** o plano de storage remoto definitivo dos packs.
> A auditoria que o originou foi **100% read-only** (nenhum código/serviço/asset alterado).
>
> **Precedência:** subordinado a `docs/PROJECT_SOURCE_OF_TRUTH.md` e a
> `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md` (v2.0), que **já travam Cloudflare R2** como
> storage remoto. Este plano **confirma e detalha** essa decisão registrada — não a reabre.

---

## 1. Branch, HEAD e working tree (no momento da auditoria)
- **Branch:** `content-integrate-coloring-3`
- **HEAD:** `d1087f9` (feat: add real sandbox pack download)
- **Working tree inicial:** **limpo** — sincronizado com origin, sem arquivos modified/staged/untracked.

## 2. Arquivos lidos (read-only)
**Serviços/contexto/tela:** `packDownloadService.js`, `packStorageService.js`, `packIntegrityService.js`, `packManifestService.js`, `contentResolver.js`, `packSandboxDevService.js`, `PacksContext.js` (+ `PackSandboxDevScreen.js`, conhecido do bloco anterior).
**Pipeline:** `scripts/assets-pipeline/` (build-story-pack.js na íntegra; inventário: validate-pack-manifest, validate-story-pack, install-sandbox-pack, verify-sandbox-resolver, optimize-scene, PIPELINE.md, NAMING.md).
**Docs:** `DOCUMENTO_OFICIAL_PROJETO_FINAL.md` (seções 5–10 e roadmap Fases 2–5 — **fonte de verdade**), série `F2_0…F2_3D`, `F2_3B`/`F2_3D` (validação real).

---

## 3. Mapa do pipeline atual (o que existe hoje)

**Geração de pack (fora do app, Node/CommonJS):**
- `build-story-pack.js` copia `assets/` → `<tmp>/packs/<id>/v<major>/` gerando `manifest.json` + `pack.sha256` + `cover/scenes/coloring/audio`, com **bytes e sha256 reais por arquivo** (crypto nativo do Node), recusa gravar dentro do repo. **Produz o pack completo (31 mídias), já com sha256.**

**Runtime no app (camada híbrida):**
- `packManifestService` — validador **puro** do manifesto por-pack (schemaVersion 1, id, version semver, type, minAppVersion, totalBytes, `files[]` com sha256, metadata). Nunca lança.
- `packStorageService` — índice `@ptf_packs_v1` (AsyncStorage) + caminhos `documentDirectory/packs/<id>@<version>/` e `.tmp/`. 8 estados (`INCLUDED`, `NOT_DOWNLOADED`, `DOWNLOADING`, `VERIFYING`, `READY`, `FAILED`, `NEEDS_UPDATE`, `REQUIRES_APP_UPDATE`).
- `packIntegrityService` — valida arquivo por **bytes + existência**; `computeFileSha256` é **stub** (sem `expo-crypto`).
- `contentResolver` — decisão pura: starter→require; remote+ready→`{uri: localDir+relPath}` (file://); remote sem pack→**fallback require**. Convenções de path por mídia já fixadas.
- `PacksContext` — leitura **read-only** do índice.
- `packSandboxDevService` + `PackSandboxDevScreen` — **download real via LAN**, **dev-only (duplo gate)**, **hardcoded a david_goliath**, **só as 10 cenas**, fluxo `.tmp → validar bytes → move atômico → ready`, nunca ready parcial. Validado ponta a ponta no iPhone (F2.3c/d).

---

## 4. Diferença: sandbox atual × produção necessária

| Dimensão | Hoje (sandbox F2.3) | Produção necessária |
|---|---|---|
| **Origem** | HTTP LAN local (`http://IP:8787/`) | **HTTPS CDN com domínio próprio** (R2) |
| **Gate** | dev-only `__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX` | serviço **de produção** + gate de **entitlement** |
| **Escopo história** | só `david_goliath` (hardcoded) | **genérico por storyId** (18 premium) |
| **Escopo mídia** | só 10 cenas | **cover + cenas + colorir + áudio** (31 mídias) |
| **Integridade** | bytes + existência (sha256 **stub**) | **sha256 real por arquivo** (dep crypto aprovada) |
| **Manifesto** | só o **per-pack** local | **+ manifesto global de conteúdo** (índice de packs + baseUrls + access) — **não existe no app** |
| **Índice de packs** | semeado por dev-tool | populado a partir do **manifesto global remoto** |
| **Origem dos assets premium** | ainda **no binário** (fallback require) | **removidos do binário**, servidos por pack (Fase 3) |
| **Estados** | 8 no código | doc pede 9 (falta `queued`, `blocked_premium`; renome `validating`↔VERIFYING, `update_available`↔NEEDS_UPDATE) |
| **Acesso** | nenhum | RevenueCat decide `isActive` antes de oferecer download |

**Lacuna estrutural mais importante:** falta o **manifesto GLOBAL de conteúdo** (`content-manifest.json` com `packs[]`, `access`, `baseUrl` por pack). Hoje só existe o manifesto **por-pack**. A produção precisa dos dois níveis.

---

## 5. Comparativo de storage

> ⚠️ **Governança:** o storage **já está travado como Cloudflare R2** na fonte de verdade (`DOCUMENTO_OFICIAL_PROJETO_FINAL.md` v2.0, item 8 "Travada arquitetura híbrida obrigatória, R2"). Este comparativo **confirma e justifica** a decisão registrada — não a reabre.

| Opção | Egress (mídia repetida) | Sem backend | Compat. Expo/EAS | Domínio próprio+CDN | Veredito |
|---|---|---|---|---|---|
| **Cloudflare R2** | **$0 egress** (decisivo p/ mídia pesada) | ✅ HTTPS GET puro | ✅ `expo-file-system` baixa de qualquer HTTPS | ✅ nativo Cloudflare | **✅ RECOMENDADO (travado)** |
| Supabase Storage | egress cobrado após free tier | traz Postgres/backend não usado | ✅ | parcial | ⚠️ escopo maior + custo egress |
| Firebase Storage | egress GCP caro | traz SDK nativo Firebase (dep nova) | requer SDK | via Hosting | ❌ dep nativa + custo |
| AWS S3 | egress ~$0.09/GB | ✅ | ✅ | via CloudFront (custo) | ❌ R2 é S3-compat sem egress |
| GitHub Releases/raw | limites/TOS não-CDN | público, **sem controle de acesso** | ✅ tecnicamente | ❌ | ❌ **viola governança** (premium exposto) — serve só p/ sandbox |

## 6. Recomendação da opção principal — Cloudflare R2
Confirma a decisão travada. Justificativa: **egress zero** é decisivo porque packs de mídia são baixados repetidamente por muitos dispositivos; **S3-compatível** (reaproveita ferramentas/mental model); **domínio próprio + cache Cloudflare** atende diretamente o item de segurança do doc ("usar domínio próprio, não usar `r2.dev` em produção"); **sem servidor** (alinhado a "sem backend tradicional"). As alternativas ou cobram egress caro (S3/Firebase), ou trazem peso/dep desnecessária (Supabase/Firebase), ou violam governança de conteúdo premium (GitHub).

---

## 7. Contrato remoto proposto (dois níveis, reconciliando código ↔ doc)

**Nível A — Manifesto GLOBAL de conteúdo** (novo; hoje inexistente):
```
GET https://cdn.pequenostracosdefe.app/content-manifest.json   (cache curto + ETag)
{
  "manifestVersion": 1,
  "minAppVersion": "1.0.0",
  "generatedAt": "2026-07-XXT..Z",
  "packs": [
    { "id":"david_goliath", "version":1, "type":"story", "access":"premium",
      "title":"Davi e Golias", "bytes":22800000, "sha256":"<hash do índice do pack>",
      "requiredAppVersion":"1.0.0",
      "baseUrl":"https://cdn.pequenostracosdefe.app/packs/david_goliath/v1/" }
  ]
}
```

**Nível B — Manifesto POR-PACK** (já existe em `packManifestService`, reusar):
```
GET <baseUrl>manifest.json  -> { schemaVersion, id, version, type, minAppVersion,
                                 totalBytes, files[{path,bytes,sha256,kind,...}], metadata }
GET <baseUrl>pack.sha256    -> ancora de confianca (sha256 do manifest.json)
GET <baseUrl>scenes|coloring|audio|cover...
```

**Semântica dos campos exigidos pelo escopo F2.4a:**
- **baseUrl** — raiz imutável do pack por versão (`…/packs/<id>/v<major>/`).
- **manifest.json / files[]** — já implementado; cada file com `path/bytes/sha256/kind`.
- **versão** — `v<major>` no path (imutável) + `version` semver no manifesto per-pack; nova versão = **novo diretório**, nunca sobrescreve.
- **totalBytes** — soma validada (já checada por `packManifestService`).
- **sha256** — por arquivo (já no manifesto) + `pack.sha256` (âncora). **Verificação real no device pende de dep de crypto.**
- **minAppVersion/requiredAppVersion** — se > versão instalada → `requires_app_update` (aviso controlado, sem baixar).
- **cache** — índice global: `Cache-Control` curto + `ETag`/revalidação; packs por versão: **imutáveis → cache longo**; app mantém fallback local do índice.
- **rollback** — índice pode reapontar para `v(n-1)`; **nunca apagar a versão anterior antes de a nova estar `ready`**; se a nova falhar repetidamente, o app permanece na anterior.
- **expiração** — packs por versão não expiram (imutáveis); índice global tem `generatedAt` + TTL de revalidação; limpeza de versões antigas só **após** upgrade concluído.
- **proteção contra ready parcial** — **já implementada** (`.tmp → validar bytes(+sha256) → move atômico → ready`); manter e reforçar com sha256 real.

---

## 8. Plano por subetapas (F2.4b em diante)

- **F2.4b — Provisionar R2 + CDN (infra/doc, fora do app):** bucket **privado**, domínio próprio CDN, **política de acesso** (não `r2.dev`), subir o **pack piloto david_goliath** (gerado pelo `build-story-pack.js`), runbook. **Secrets fora do repo**; requer **conta Cloudflare do responsável** (ação externa).
- **F2.4c — Pack remoto de 1 história em ambiente controlado:** servir david_goliath por **HTTPS real (R2/CDN)** trocando a origem LAN; ainda **dev-gated**; validar download por URL remota (device).
- **F2.4d — Download real por URL remota (runtime candidato a produção):** **generalizar** o downloader (sair do dev-tool hardcoded para serviço **por storyId**), consumir o **manifesto global**, popular o índice; entitlement como **stub**.
- **F2.4e — Expandir mídia + sha256 real:** cover + colorir + áudio (31 mídias); **decisão de dependência de crypto** (`expo-crypto` — exige aprovação prévia) p/ sha256 real por arquivo.
- **F2.4f — Entitlement / Plano Família (SÓ planejamento):** integração RevenueCat, `isActive` antes de oferecer download, paywall atrás da Área dos Pais. Sem implementar aqui.

---

## 9. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| **Custo** (egress de mídia pesada) | R2 = **egress $0**; packs imutáveis + cache longo Cloudflare reduzem origin hits. |
| **Vazamento de premium** | R2 privado + domínio próprio + paths não-triviais + oferta de download só com `isActive`; manifesto premium não exposto a Free. **Não prometer DRM.** |
| **Cache** | índice: TTL curto + ETag; packs: imutáveis por versão (cache longo, sem invalidação). |
| **Versionamento** | versão = novo diretório `v<major>`; nunca sobrescrever; upgrade baixa só o pack alterado. |
| **Offline** | pós-download abre offline (persistente); 2 grátis sempre locais; índice tem fallback local. |
| **Limpeza de packs antigos** | remover `v(n-1)` **só após** `v(n)` ready; detectar pack apagado pelo SO → volta a `not_downloaded`. |
| **Migração dos assets do bundle** | Fase 3 (remover requires premium) só **depois** do piloto remoto provado; fallback require some por história, uma a uma. |
| **UX** | progresso real, estado sem-internet amigável, botão download só em premium não-baixada. |
| **Peso do app** | meta binário 40–80 MB (teto 200); nenhum pack premium por `require()` estático. |
| **Falha de rede** | `.tmp` limpo a cada retry; nunca ready parcial; falha → `failed` + fallback; retry manual. |

---

## 10. Lista exata do que NÃO deve ser feito ainda
Não implementar R2 · não criar bucket · não colocar secrets · não implementar RevenueCat · não alterar entitlement · não baixar outras histórias · não remover assets do bundle · não adicionar dependências (incl. `expo-crypto`) · não alterar código/serviços/app · não mexer no app do usuário final.

## 11. Recomendação do próximo bloco executável
**F2.4b — Provisionar R2 + CDN + subir o pack piloto (runbook)**, por ser o **desbloqueador real** sem tocar o app. **Observação:** F2.4b depende de **ação externa** (criar conta/bucket Cloudflare + domínio); a parte executável aqui é **documentação/runbook e verificação**, com **secrets fora do repo**. Alternativa, se preferir permanecer só no código antes da infra: **F2.4c-prep** (adaptar o downloader sandbox para origem HTTPS genérica, ainda dev-gated) — mas o caminho canônico do doc é **infra primeiro (F2.4b)**.

---

## 12. Git status final (auditoria)
- Working tree **limpo**, sincronizado com origin; **nenhum arquivo alterado** durante a auditoria.
- ✅ **Sem commit, push ou `git add`** na fase de auditoria.
- ✅ Nenhuma dependência, bucket, secret, entitlement ou asset tocado.
