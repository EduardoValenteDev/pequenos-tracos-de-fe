# F2.0 — Auditoria técnica da arquitetura híbrida (packs premium)

> **Bloco:** F2.0 (Fase 2 §19 — infraestrutura híbrida piloto). **Documental.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD `d79b33d`.
> **Natureza:** auditoria read-only + plano. **Nenhum código/asset/require alterado;
> nada movido/apagado; nenhum pack/R2 criado.** Único arquivo: este doc.

---

## 1. Resumo executivo

A arquitetura híbrida **já está desenhada e aprovada** numa spec SDD existente —
**`specs/001-asset-architecture-budget/`** (spec/plan/tasks/data-model/contracts) — e
**parcialmente bootstrapada**: `packManifestService.js` (validador de manifesto),
`contentManifest.js` (camadas starter/remote/coming_soon) e `mediaReadyService.js` já
existem. F2.0 **reconcilia** essa spec com o estado pós-F1.2 (cenas/capas em WebP) e
propõe a **execução do piloto F2.1**. O que falta é o **runtime** de packs: resolvedor
de mídia, download, integridade, índice local e a UI de gestão na Área dos Pais.

- **Local (binário):** `creation` + `noah` completas + Beni/UI/avatares/mapas/paywall/
  Área dos Pais/acesso/Brincar. Footprint ~**75–85 MB** (dentro do teto 200; ideal
  40–80 quando o colorir refinado do F1.3 encolher os ~40 MB PNG das 2 grátis).
- **Remoto (R2):** **18 histórias premium** (cenas WebP + colorir PNG + áudio + capa),
  **um pack por história** (~17.5 MB/pack, ~315 MB no total).
- **Não implementar agora.** F2.1 = piloto em **`david_goliath`**, em **sandbox local**
  (sem R2 real, sem RevenueCat), atrás de um **resolvedor abstrato** com fallback.

---

## 2. Status inicial e gates de entrada

- Branch `content-integrate-coloring-3` · HEAD `d79b33d` · sincronizado · working tree limpo.
- **smoke 1447/1447 ✓ · expo-doctor 18/18 ✓ · audio 200/200 ✓** (entrada e saída — nada mudou).

---

## 3. Achado central — a spec 001 já define a arquitetura

`specs/001-asset-architecture-budget/` (aprovada, SDD) define **tudo** conceitualmente
(`data-model.md`, `contracts/pack-manifest.schema.json`, `tasks.md` T001–T028+):

| Entidade (data-model) | O que é |
|---|---|
| **ContentLayer** | `starter` (binário) · `remote` (pack baixável) · `coming_soon` (0 bytes) |
| **Pack** | id, version(semver), type, layer, **status** (`not_downloaded→downloading→verifying→ready`/`failed`), manifestUrl, installedVersion, totalBytes, installedAt, **localDir** `documentDirectory/packs/<id>@<version>/` |
| **PackManifest** | schemaVersion, id/version/type, minAppVersion, totalBytes, files[], metadata(title/storyId/language/coverPath) |
| **FileEntry** | path (sem `..`), bytes, sha256, **kind** (scene/coloring/audio/cover/other), width/height/ratio (4:5) |
| **CacheEntry** | índice AsyncStorage **`@ptf_packs_v1`**: {id, installedVersion, status, totalBytes, installedAt, **lastUsedAt** (LRU)} |
| **contentResolver** (conceitual) | `starter → require` · `pack ready → file://localDir` · `else → fallback seguro` |

**Já implementado:** `packManifestService.js` (T007, validador puro), `contentManifest.js`
(T008, camadas), `mediaReadyService.js`. **Pendente (todo o runtime):** `contentResolver`
(T018), `packStorageService` (T020/22), `packDownloadService` (T017/24),
`packIntegrityService` (T023), índice `@ptf_packs_v1` (T021), UI Área dos Pais (T026-28),
`build-manifest.js`/pilot pack (T016/19).

> **Discrepância a corrigir:** `contentManifest.js` marca `solomon_wisdom`, `mary_says_yes`,
> `timothy_faith`, `jesus_temple` como `coming_soon` — mas essas 4 **já têm conteúdo
> completo** (cenas/colorir/áudio integrados). Hoje são **remote** de fato. Atualizar a
> declaração (bloco pequeno, junto do F2.1 ou antes).

---

## 4. Mapa dos loaders atuais de mídia

Todos usam **`require()` estático** (Metro exige literal) → hoje **tudo entra no binário**.

| Loader | Conteúdo | Requires | Resolvedor de tela |
|---|---|---:|---|
| `src/data/storySceneIllustrations.js` | cenas (WebP) | 200 | `storyImageService.getOfficialSceneIllustration` |
| `src/assets/coloringImages.js` | colorir (PNG) | 200 | `storyImageService.getSceneColoringImage` / `drawingStorage` |
| `src/assets/storyCovers.js` (+ `images.js` deriva) | capas (WebP) | 20 | `storyImageService.getStoryCoverImage` / `getStoryCover` |
| `src/data/audioManifest.js` | narração (MP3) | 200 | `audioService` / `AudioPlayer` |
| `src/data/adventureMap.js` | mapas (JPG) | 16 | `AdventureMapScreen` |
| `src/assets/mascot/beniImages.js` | Beni | 8 | telas Beni |
| `src/data/avatars.js` | avatares | 15 | `ProfileScreen` |

**Telas consumidoras:** `StoryDetailScreen` (hero/capa via `StoryBookHero`+`StoryCoverImage`),
`NarrationScreen` (cena + áudio), `ColoringScreen` (colorir), `StoryBookScreen` (Livrinho),
`AdventureMapScreen` (capas no card/mapa). Todas passam por **`storyImageService`** (fonte
única, "sem require dinâmico, sem caminho por string, sem URL") — é o ponto natural de
extensão para o `contentResolver`.

---

## 5. Mapa dos requires por categoria

| Categoria | Requires | Destino |
|---|---:|---|
| Cenas premium (18) | 180 | **→ pack remoto** (WebP) |
| Colorir premium (18) | 180 | **→ pack remoto** (PNG por ora; ver §11) |
| Áudio premium (18) | ~190 | **→ pack remoto** (MP3) |
| Capas premium (18) | 18 | **→ pack remoto** (WebP) — ou local (leve); ver §6 |
| Cenas/colorir/áudio/capa **grátis** (creation+noah) | ~44 | **binário base** (starter) |
| Mapas (16), Beni (8), avatares (15) | 39 | **binário base** (não mexer agora) |

---

## 6. O que fica no binário base (starter)

Conforme **doc mestre §5.2** e `contentManifest.STARTER_STORY_IDS`:

1. **A Criação e Noé completas** — cenas (WebP), colorir (PNG), áudio (MP3), capa (WebP).
2. Beni essencial (`beniImages.js` ~13.6 MB), avatares (~0.9 MB).
3. **Mapas** (`R*.jpg` shipped ~3.7 MB) — navegar sem baixar premium.
4. UI/navegação/paywall/Área dos Pais/lógica de acesso/telas de download.
5. Brincar completo em código (assets leves).
6. Manifesto local fallback + assets de fallback.

**Footprint starter medido:** creation+noah stories ~**44.1 MB** (colorir PNG ~40 + cenas
WebP ~4) + áudio ~**7.0 MB** + capas ~0.3 MB. Com Beni/mapas/avatares → **~75–85 MB** de
base. Dentro do teto (200) e da atenção (120). O **colorir refinado (F1.3)** derruba os
~40 MB PNG das grátis e aproxima do ideal 40–80.

---

## 7. O que vira pack premium (remoto)

Cada uma das **18 premium** = **um pack** (`packs/<storyId>/v<n>/`):

- `scenes/` (10 WebP), `coloring/` (10 PNG — final refinado depois), `audio/` (10 MP3),
  `cover.webp`, `manifest.json`, `pack.sha256`.
- **Footprint remoto medido:** stories ~**267.5 MB** (colorir PNG ~238 + cenas WebP ~29) +
  áudio ~**47.9 MB** = ~**315 MB** / 18 = **~17.5 MB/pack**.
- O **colorir PNG (238 MB)** domina o peso dos packs — encolhe muito quando o F1.3
  entregar as páginas finais + otimização.

**Não mover nada agora** — apenas proposta.

---

## 8. Proposta de manifesto (já existe — schema spec 001)

**Manifesto POR PACK** (`manifest.json`, validado por `packManifestService`):
```json
{ "schemaVersion": 1, "id": "story_david_goliath", "version": "1.0.0", "type": "story",
  "minAppVersion": "1.0.0", "totalBytes": 12300000,
  "files": [ { "path": "scenes/david_goliath_scene_01.webp", "bytes": 237000,
              "sha256": "…64hex…", "kind": "scene", "width": 941, "height": 1176, "ratio": "4:5" } ],
  "metadata": { "title": "Davi e Golias", "storyId": "david_goliath", "language": "pt-BR",
                "coverPath": "cover.webp" } }
```
**Manifesto GLOBAL** (doc mestre §6): `{ manifestVersion, minAppVersion, generatedAt, packs:[{id,version,type,access,title,bytes,sha256,baseUrl,files}] }` — lista todos os packs, pequeno e cacheável.

**Estados do pack** (data-model + doc mestre §7): `not_available` · `included` (starter) ·
`not_downloaded` · `downloading` · `verifying` · `ready` · `error/failed` · `needs_update`
(`update_available`) · `requires_app_update` · `blocked_premium`.

**Índice local** `@ptf_packs_v1` (CacheEntry) = estado persistido por pack + `lastUsedAt` (LRU).

---

## 9. Fluxo de download proposto (doc mestre §7 + data-model)

1. Usuário toca história premium → checa **Plano Família** (RevenueCat/estado) e **jornada**.
2. Checa camada: `starter` → abre direto; `remote` → checa índice local (`@ptf_packs_v1`).
3. Se `ready` → resolve `file://localDir` → abre (offline-safe).
4. Se `not_downloaded` → **CTA de download** (só por ação do responsável; Wi-Fi padrão).
5. Baixa manifesto → valida (`packManifestService`) → baixa arquivos para **`.tmp/`**.
6. **Valida bytes + sha256 por arquivo e agregado** (`packIntegrityService`).
7. `verifying → ready` **só com todos os hashes OK**; move `.tmp/ → documentDirectory/packs/<id>@<version>/` (troca atômica); grava índice `ready`.
8. Abre a história. **Pack corrompido nunca vira `ready`** (fica `failed` + retry).
9. **Offline sem pack** → mensagem amigável (Beni) + retry. **Offline com pack `ready`** → abre normal.
10. Nova `version` → baixa lado a lado, troca atômica; LRU/remoção pelo responsável.

---

## 10. Compatibilidade com a jornada (contrato A0.10 + packState)

O **acesso comercial** e a **jornada** já são eixos separados (contrato). O **pack** é um
**terceiro eixo (disponibilidade física)**. Ordem de decisão recomendada para o status:

1. **comingSoon** (catálogo/mídia não pronta).
2. **journeyLocked** (sequência não chegou) → "Complete [anterior]". *(antes de premium)*
3. **premiumLocked** (alcançada, usuário Free) → "Plano Família".
4. **(premium OK + jornada OK) → packState:**
   - `included` (starter) → abre.
   - `not_downloaded` → **"Baixar aventura"** (CTA controlado).
   - `downloading/verifying` → progresso.
   - `ready` → abre (aplica estados de progresso: notStarted/inProgress/scenesComplete/journeyComplete).
   - `failed` → retry.

**Extensão proposta (F2.x):** `storyJourneyService.getStoryJourneyStatus` ganha um campo
**`packState`** (só para `remote`), e `canOpen = sequenceUnlocked && commercialAllowed &&
mediaReady && (layer==='starter' || packState==='ready')`. Vitrine/mapa/StoryDetail leem o
mesmo contrato — **journeyLocked continua antes de premiumLocked**, e o download é o passo
**após** liberar acesso comercial. `mediaReadyService`/`contentAccessService` permanecem a
fonte de "Em breve"/premium; o packState é aditivo, sem reescrever o contrato.

---

## 11. Compatibilidade com colorir

- **Colorir premium continua LOCAL/PNG** enquanto as páginas estiverem em refinamento
  manual (F1.3). Quando o colorir final (PNG, mesmos nomes) chegar e passar no **flood
  fill em aparelho**, ele **entra no pack como PNG final** (ou otimizado, se aprovado).
- **F1.3 (colorir final) é bloco separado.** **Não** aplicar WebP lossy no colorir. A
  otimização só depois das páginas finais + teste de flood fill.
- Enquanto isso, o piloto F2.1 pode **incluir o colorir atual (PNG) no pack** de teste
  (só validar o pipeline) OU manter o colorir do piloto local temporariamente — decisão
  do F2.1 (recomendo incluir no pack como PNG para testar o fluxo real).

---

## 12. Compatibilidade com áudio

- Hoje: `audioManifest.js` faz **`require()` estático** dos 200 MP3; `audioService`/
  `AudioPlayer` resolvem por `require`. **Áudio premium (18)** deve sair para os packs
  (MP3, `kind: 'audio'`).
- **A Criação e Noé (áudio) ficam locais** (starter).
- O `contentResolver` (T018) deve cobrir **também áudio**: `starter → require`;
  `pack ready → file://` (o `AudioPlayer`/`expo-audio` toca por URI de arquivo local).
- **Riscos de áudio:** preload/latência (áudio remoto exige o pack `ready` antes de tocar —
  offline sem pack não toca), cache (o pack persistente resolve), fallback (mensagem se
  ausente). **Não mexer em áudio agora** — só mapear.

---

## 13. Riscos técnicos e mitigação

| Risco | Mitigação |
|---|---|
| **`require()` não aceita caminho dinâmico** | Resolver central (`contentResolver`): `starter` segue `require`; `remote ready` usa **`Image source={{uri:'file://…'}}`** / áudio por URI. Padrão já usado em `drawingStorage` (v3 file://). |
| `Image require` vs `uri` | Componentes de cena/capa aceitam ambos (source pode ser módulo OU `{uri}`). Fallback seguro se não `ready`. |
| Áudio local vs uri | `expo-audio` toca arquivo local por URI; premium exige pack `ready`. |
| Expo asset bundling | `expo-file-system` (persistente `documentDirectory`), **não** cache volátil; `.tmp` só p/ download. |
| Download parcial / pack corrompido | Gate de integridade (sha256+bytes) antes de `ready`; adulterado → `failed`, nunca `ready`. |
| Usuário offline | `ready` abre offline; sem pack → mensagem amigável + retry; grátis sempre offline. |
| Storage do aparelho | LRU por `lastUsedAt` + remoção pelo responsável (Área dos Pais); Wi-Fi padrão. |
| Rollback | Piloto em **sandbox local** (sem R2/RevenueCat); resolver com **fallback ao require local temporário**; nada destrutivo. |
| Android antigo | `expo-file-system` OK; validar em device real; WebP nativo (Android sempre). |
| Migração do progresso | Progresso é por `storyId` (chaves `@ptf_*` intactas) — **independe** da camada de mídia; nada muda. |
| Loja / tamanho | Só a saída das 18 premium do binário resolve o teto (WebP sozinho não basta — §3.3). |

---

## 14. Plano recomendado para F2.1 (piloto — não implementar)

**História piloto: `david_goliath`** (1ª premium da jornada, já validada em WebP no F1.1,
não afeta as grátis). **Sandbox local** (sem R2 real, sem RevenueCat, sem migrar as outras).

F2.1 deve:
1. **`contentResolver`** (T018): `starter → require` · `pack ready → file://` · `else →
   fallback local temporário` — SÓ para david_goliath, atrás de flag.
2. **`packStorageService`** (T020): convenção `documentDirectory/packs/<id>@<version>/`
   (persistente) + `.tmp/`; índice `@ptf_packs_v1` (T021).
3. **`packDownloadService`** (T017): baixar de um **pack sandbox** (arquivo local/servidor
   de teste, não R2) → `.tmp` → validar → mover.
4. **`packIntegrityService`** (T023): sha256+bytes; `verifying → ready` só com tudo OK.
5. **`build-manifest.js`** (T016, fora do repo): gera o `manifest.json` do pack david_goliath.
6. **Integração mínima StoryDetail/Narration:** ler `packState` e resolver via `contentResolver`
   (com fallback ao require local — david_goliath ainda estaria no binário no piloto, para
   não quebrar nada; o resolver **prefere** o pack quando `ready`).
7. **Sem** migrar as 18, **sem** tirar david do binário ainda (só provar o resolver+download+
   integridade+offline em sandbox), **sem** colorir final, **sem** RevenueCat.

Critério de saída F2.1 (doc mestre §19 Fase 2): pack piloto baixa, valida, abre, toca áudio,
abre colorir/Livrinho, funciona offline após download — **em sandbox**, sem tocar as grátis.

---

## 15. Arquivos prováveis do F2.1 (apenas lista — não criar agora)

| Arquivo | Papel | Spec |
|---|---|---|
| `src/services/contentResolver.js` (novo) | resolver central starter/pack/fallback | T018 |
| `src/services/packStorageService.js` (novo) | install persistente + LRU + remoção | T020/22 |
| `src/services/packDownloadService.js` (novo) | download `.tmp` + fallback | T017/24 |
| `src/services/packIntegrityService.js` (novo) | sha256/bytes → gate `ready` | T023 |
| índice `@ptf_packs_v1` (novo em `storageKeys.js`/serviço) | CacheEntry | T021 |
| `src/data/contentManifest.js` (editar) | corrigir 4 `coming_soon`→`remote` + declarar packs | T008 |
| `src/services/storyJourneyService.js` (editar) | campo `packState` + `canOpen` | contrato A0.10 |
| `src/screens/StoryDetailScreen.js` / `NarrationScreen.js` (editar mínimo) | ler packState / resolver | — |
| `scripts/assets-pipeline/build-manifest.js` (novo, fora do app) | gerar manifest do pack | T016 |
| `docs/F2_1_*.md` | relatório do piloto | — |

**Fora do escopo (não tocar) no F2.1:** RevenueCat, R2 real, Brincar, A1, B5.4, vozes,
colorir final, as 18 histórias além de david_goliath, áudio das grátis.

---

## 16. Critérios de aceite (respostas)

- **O que fica local:** creation+noah completas, Beni/UI/avatares/mapas/paywall/Área dos
  Pais/acesso/Brincar/telas de download (~75–85 MB).
- **O que vira remoto:** 18 premium (cenas WebP + colorir PNG + áudio + capa), 1 pack/história.
- **Como o app resolve mídia:** `contentResolver` — `starter → require`, `pack ready →
  file://localDir`, senão fallback. Extensão de `storyImageService` (fonte única).
- **Como o mapa sabe se baixada:** índice `@ptf_packs_v1` (packState) exposto via
  `getStoryContractStatus`; card mostra "Baixar"/progresso/"pronto".
- **Como o StoryDetail se comporta:** journeyLocked > premiumLocked > packState
  (not_downloaded → CTA baixar; ready → abre; downloading → progresso).
- **Áudio/colorir:** áudio premium no pack (grátis local); colorir premium no pack como
  **PNG final** (após F1.3 + flood fill), local por ora.
- **Offline:** `ready` abre offline; sem pack → mensagem amigável; grátis sempre offline.
- **Piloto F2.1:** `david_goliath` em sandbox local.
- **Riscos:** §13. **Arquivos F2.1:** §15.

---

## 17. Confirmações

- **Nenhum código alterado.** **Nenhum asset alterado/movido/apagado.** **Nenhum require/
  manifesto existente alterado.** Nenhum pack/R2 criado.
- **F2.1 não iniciado.** RevenueCat, Brincar, Beni, rotas, contrato da jornada, áudio,
  colorir não tocados.
- **Sem commit, sem push, sem `git add`.** Scripts de medição rodaram fora do repo (scratchpad).
- Único arquivo criado: **`docs/F2_0_AUDITORIA_ARQUITETURA_HIBRIDA.md`**.
