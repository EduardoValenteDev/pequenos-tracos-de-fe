# F2.4d.0 — Auditoria técnica + plano executável do downloader remoto genérico

> **Bloco:** F2.4d.0 (planejamento). **Auditoria 100% read-only — nenhum código alterado.**
> **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `b8204a3`.
> Registra oficialmente o plano da menor implementação segura para sair do downloader
> sandbox hardcoded de `david_goliath` rumo a um downloader remoto **genérico por storyId**
> via **manifesto global**, ainda **sem RevenueCat** e **sem remover assets do bundle**.
>
> **Precedência:** subordinado a `docs/PROJECT_SOURCE_OF_TRUTH.md` e
> `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md` v2.0. Relacionado:
> [F2.4a plano](F2_4A_STORAGE_PLAN.md) · [F2.4b runbook](F2_4B_R2_CDN_RUNBOOK.md) ·
> [F2.4c validação](F2_4C_R2_HTTPS_DEVICE_VALIDATION.md).

---

## 1. Branch, HEAD e working tree
- **Branch:** `content-integrate-coloring-3` · **HEAD:** `b8204a3`
- **Working tree (auditoria):** **limpo**, sincronizado com origin.

## 2. Arquivos lidos
- **Serviços:** `packDownloadService.js`, `packSandboxDevService.js`, `packStorageService.js`, `packIntegrityService.js`, `packManifestService.js`, `contentResolver.js`.
- **Contexto/tela/dados:** `PacksContext.js`, `PackSandboxDevScreen.js`, `contentManifest.js`, `stories.js`, `contentAccessService.js`.
- **Docs:** `F2_4A_STORAGE_PLAN.md`, `F2_4B_R2_CDN_RUNBOOK.md`, `F2_4C_R2_HTTPS_DEVICE_VALIDATION.md`.
- **Pipeline:** `scripts/assets-pipeline/build-story-pack.js`.
- **Rede (read-only):** `GET content-manifest.json` na raiz do R2 → **404**; `GET packs/david_goliath/v1/manifest.json` → **200**.

---

## 3. Mapa do estado atual (pós-F2.4c + bugfix do Livrinho)

| Camada | Estado hoje |
|---|---|
| **Índice de packs** (`@ptf_packs_v1`, packStorageService) | ✅ genérico por storyId; 8 estados; caminhos `documentDirectory/packs/<id>@<version>/` + `.tmp/` |
| **Resolver** (contentResolver) | ✅ **já genérico**: starter→require, remote+ready→`file://`, remote sem pack→**fallback require**; convenções de path por mídia fixas |
| **PacksContext** | ✅ read-only genérico (`getStoryPackState`, `isPackReady`) |
| **Validador manifesto por-pack** (packManifestService) | ✅ puro, genérico (schema + sha256 hex + soma bytes) |
| **Integridade** (packIntegrityService) | ⚠️ bytes+existência; **sha256 = stub** (sem expo-crypto) |
| **contentManifest.js** | ✅ camadas: 2 starter (creation/noah) + **18 remote**; `REMOTE_PACKS` só declaração |
| **stories.js** | ✅ 20 histórias, `accessType` (2 free / 18 premium), `cenas[]` → sceneCount |
| **Gate de acesso** (contentAccessService/accessControl) | ✅ `isPremiumUser()` + `canOpenStoryFullExperience` já existem (premium local desligado; sem RevenueCat) |
| **Downloader** (packSandboxDevService) | ⚠️ **hardcoded**: STORY_ID/VERSION/SCENE_COUNT constantes, sceneRe fixa; **só 10 cenas**; **dev-only (duplo gate)** |
| **UI** | ⚠️ `PackSandboxDevScreen` inteiramente sobre as funções `*DavidGoliath*` |
| **packDownloadService** | ⚠️ esqueleto F2.1a (`DOWNLOAD_FLOW` documentado, `markPackReady` real; download real vive no sandbox service) |

**Conclusão:** a base **runtime** (índice, resolver, contexto, validador por-pack) já é **genérica**. Ainda específico de david_goliath: (a) o **downloader** e (b) a **UI dev**. Falta inteiramente a camada de **manifesto GLOBAL** (`content-manifest.json`).

---

## 4. Lacunas para o runtime remoto genérico

| Precisa existir | Existe? | Observação |
|---|---|---|
| `content-manifest.json` global (índice + baseUrl + access) | ❌ | 404 no R2; não existe no app nem no bucket |
| Serviço read-only p/ **buscar + validar** o manifesto global | ❌ | novo (`globalManifestService`) |
| Resolver **baseUrl por storyId** | ❌ (parcial) | hoje o baseUrl é digitado à mão na tela |
| Download **genérico por storyId** | ❌ | hoje `downloadDavidGoliathPackSandbox` hardcoded |
| Reuso `.tmp → validar → move → ready` | ✅ | fluxo já existe; só parametrizar storyId/version/paths |
| Estado de packs por história | ✅ | packStorageService/PacksContext genéricos |
| **Entitlement stub** (sem RevenueCat) | ⚠️ | `isPremiumUser()` existe; usar como stub no offering |
| Fallback require preservado | ✅ | contentResolver garante |
| Dev gate / feature flag | ✅ | `__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX` reutilizável |

---

## 5. Opções de implementação mínima

| Opção | O que é | Prós | Contras |
|---|---|---|---|
| **A** — content-manifest só p/ david_goliath + downloader adaptado na tela dev | Menor mudança | Rápido | **Não constrói** a camada global de verdade |
| **B** — **serviço de manifesto global read-only**, ainda consumindo só david_goliath em dev ✅ | Introduz a camada nova (fetch+validate índice), mantém downloader/UI dev | **Menor fatia que constrói o alvo real**; blast radius mínimo; resolver/índice intactos | Exige o contrato definido antes |
| **C** — generalizar `packDownloadService` sem UI de usuário final | Downloader genérico | Necessário eventualmente | Generalizar o download é a parte **mais arriscada** — melhor isolar (d.3) depois de B |

## 6. Recomendação — Opção B, fatiada
Começar pela **camada de manifesto global read-only** (o verdadeiro alvo do F2.4d), mantendo downloader e UI dev específicos até a fatia seguinte:
1. **F2.4d.1 — contrato do manifesto global (docs-only).**
2. **F2.4d.2 — `globalManifestService` read-only** (fetch + validar índice; **não baixa, não instala**; puro/seguro, nunca lança), consumindo **apenas david_goliath** em dev.

Adiciona a camada nova com risco mínimo (dev-only, sem download novo, sem tocar resolver/índice/telas de usuário) e deixa a **generalização do downloader (d.3)** — a parte arriscada — isolada e testável depois, ainda dev-gated.

---

## 7. Contrato proposto — `content-manifest.json` global

```json
{
  "manifestVersion": 1,
  "generatedAt": "2026-07-04T00:00:00Z",
  "minAppVersion": "1.0.0",
  "packs": [
    {
      "id": "story_david_goliath",
      "storyId": "david_goliath",
      "version": "1.0.0",
      "type": "story",
      "access": "premium",
      "title": "Davi e Golias",
      "bytes": 18532477,
      "baseUrl": "https://cdn.pequenostracosdefe.app/packs/david_goliath/v1/",
      "manifestPath": "manifest.json",
      "manifestSha256": "<sha256 do manifest.json = pack.sha256>",
      "requiredAppVersion": "1.0.0",
      "mediaKinds": ["cover", "scene", "coloring", "audio"],
      "status": "not_downloaded"
    }
  ]
}
```

**Regras/semântica:**
- **`baseUrl` é autoritativo para o path** (encapsula `vN`) → resolve o mismatch `version 1.0.0` (semver, gate por-pack) vs `v1` (path). O app **não** monta o path a partir de `version`; usa `baseUrl` + paths relativos do manifesto por-pack.
- **`version` (semver)** = a que o gate atual compara (`=== '1.0.0'`) e a que nomeia o `localDir` (`<id>@<version>`).
- **`access`** decide se o app **oferece** download (gate de entitlement no F2.4f); no F2.4d.2 é apenas lido/registrado, sem gerar oferta a Free.
- **`mediaKinds`** declara o que o pack contém; no F2.4d ainda se **baixa só `scene`** (o resto fica p/ F2.4e).
- **`status`** no índice global é só o esperado inicial; o **estado real** vive em `@ptf_packs_v1`.
- **`manifestSha256`** = âncora (`pack.sha256`); verificação real só com dep de crypto (F2.4e).

---

## 8. Hospedagem no R2 (verificado, sem subir nada)
`GET …/content-manifest.json` → **404** hoje (não existe). A raiz do bucket **é servível** (o 404 vem do R2, e um irmão `packs/…/manifest.json` responde **200**). **Conclusão:** basta subir `content-manifest.json` na raiz para servi-lo — **não feito neste bloco** (só planejado). Alerta: `r2.dev` é temporário; produção exige domínio próprio.

---

## 9. Plano por subetapas (F2.4d.1 →)

| Sub | Escopo | Toca código? | Gate |
|---|---|---|---|
| **d.1** | Contrato do manifesto global (doc `F2_4D_GLOBAL_MANIFEST_CONTRACT.md`) | ❌ docs | dispensado |
| **d.2** | `globalManifestService` read-only (fetch+validate, nunca baixa/instala), consumindo só david_goliath em dev | ✅ 1 serviço novo + smoke | smoke/doctor/audio |
| **d.3** | Downloader **genérico por storyId** (`downloadStoryPack`) reusando `.tmp→validar→move→ready`; **só cenas**; dev-only; paridade david_goliath | ✅ pack service + smoke | idem |
| **d.4** | Tela dev usa o manifesto global p/ obter baseUrl+sceneCount de david_goliath (em vez de digitar) | ✅ PackSandboxDevScreen + smoke | idem |
| **d.5** | Validação no iPhone (download via manifesto global → file:// → reset) | manual | — |
| **d.6** | Documentação + commit do bloco | docs + commit | — |
| **F2.4e** | (depois) cover/colorir/áudio + **sha256 real** (dep crypto aprovada) | — | — |

---

## 10. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| **Quebrar fallback require** | d.2/d.3 não tocam contentResolver; fallback garantido; validar paridade david_goliath (require↔file://) na d.5 |
| **Ready parcial** | reusar `.tmp→validar bytes→move atômico→ready`; nunca `ready` sem N/N |
| **Baixar premium sem entitlement** | download permanece **dev-gated**; oferta a usuário final só no F2.4f com `isPremiumUser()` |
| **Expor manifesto premium a Free** | manifesto global só lido no fluxo dev; nenhuma tela Free o consome no F2.4d |
| **Cache do manifesto global** | índice = cache curto + `ETag`; revalidação; fallback local se offline |
| **Versão incompatível** | `requiredAppVersion/minAppVersion` > app → `requires_app_update`, sem baixar |
| **version 1.0.0 vs path v1** | **`baseUrl` autoritativo** para o path; `version` só p/ gate/localDir |
| **Limpeza de versões antigas** | não apagar `v(n-1)` antes de `v(n)` ready; não implementar limpeza no F2.4d |
| **Migração futura dos assets do bundle** | Fase 3, **fora** do F2.4d; nada removido agora |
| **Custo/egress** | R2 egress $0; packs imutáveis + cache; sem mudança de custo no F2.4d |
| **r2.dev temporário** | usar p/ validação dev; produção exige domínio próprio (não decidir aqui) |

---

## 11. Lista do que NÃO deve ser feito ainda
Não criar `content-manifest.json` · não subir arquivo no R2 · não implementar `globalManifestService` · não implementar downloader genérico · não RevenueCat · não alterar entitlement real · não remover assets do bundle · não baixar outras histórias · não baixar cover/colorir/áudio · não adicionar dependências · não tocar `StoryBookScreen`/bugfix do Livrinho · não alterar contentResolver/serviços de packs/PackSandboxDevScreen.

## 12. Git status final (auditoria)
- Working tree **limpo**, sincronizado com origin; **nenhum arquivo alterado** durante a auditoria.
- ✅ **Sem commit, push ou `git add`** na fase de auditoria.

---

## 13. Próximo bloco executável
**F2.4d.1** (contrato do manifesto global, docs-only) → **F2.4d.2** (`globalManifestService` read-only). Menor fatia que constrói a camada nova com risco mínimo, deixando a generalização do downloader (d.3) isolada para depois.
