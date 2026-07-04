# F2.4c — Validação do download real via Cloudflare R2 (HTTPS) no iPhone

> **Bloco:** F2.4c (Fase 2 → infraestrutura remota definitiva). **Documentação da validação real em device.**
> **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `94090a8`.
> Consolida a validação, no iPhone, do **download real de `david_goliath` a partir do Cloudflare
> R2 via HTTPS**, substituindo a origem LAN (F2.3) por origem remota — ainda **dev-gated**, ainda
> **somente `david_goliath`**, ainda **somente as 10 cenas**.
>
> **Precedência:** subordinado a `docs/PROJECT_SOURCE_OF_TRUTH.md` e
> `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md` v2.0 (R2 travado). Relacionado:
> [F2.4a plano](F2_4A_STORAGE_PLAN.md) · [F2.4b runbook](F2_4B_R2_CDN_RUNBOOK.md) ·
> [F2.3d validação LAN](F2_3D_REAL_DOWNLOAD_DEVICE_VALIDATION.md).

---

## 1. Contexto

- **F2.3** validou o **download real via LAN** no iPhone (origem `http://IP:8787/`).
- **F2.4b** provisionou o **bucket R2** (`ptf-packs`) e uma **URL pública temporária `r2.dev`**, com o pack piloto `david_goliath/v1` subido e validado por HTTPS (manifest, pack.sha256, 10 cenas, cover, colorir e áudio — bytes conferidos).
- **F2.4c** valida a **origem HTTPS real do R2 no iPhone**, ainda **dev-gated** (`__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX`), ainda **somente `david_goliath`**, ainda **somente as 10 cenas** (áudio/colorir/capa seguem do bundle).

---

## 2. BaseUrl validada

```
https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/packs/david_goliath/v1/
```

> ⚠️ A URL `r2.dev` é **temporária**, para validação técnica. A **produção final exige domínio
> próprio/CDN** (ex.: `https://cdn.pequenostracosdefe.app/...`), conforme F2.4a/F2.4b —
> **não usar `r2.dev` como origem de produção**.

---

## 3. Preflight sem código

Antes do teste, o manifesto real do R2 foi lido (read-only) e confrontado com os gates já
existentes do downloader — **todos aceitaram o manifesto sem qualquer alteração**:

| Item | Valor no R2 | Gate atual | Resultado |
|---|---|---|---|
| schemaVersion | `1` | `=== 1` | ✅ |
| id | `story_david_goliath` | slug válido | ✅ |
| metadata.storyId | `david_goliath` | `=== 'david_goliath'` | ✅ |
| version | `1.0.0` | `=== '1.0.0'` | ✅ |
| minAppVersion | `1.0.0` | `<= appVersion 1.0.0` | ✅ |
| totalBytes | `18532477` (pack completo, 31 arquivos) | `Σ files.bytes == totalBytes` | ✅ |
| cenas `kind:scene` | **10** | filtro `/^scenes\/david_goliath_scene_\d{2}\.webp$/` == 10 | ✅ |
| soma das 10 cenas | **2289598 bytes** | subset baixado | ✅ |
| paths das cenas | `scenes/david_goliath_scene_NN.webp` | compatíveis com o downloader/`contentResolver` | ✅ |
| `PackSandboxDevScreen` | `TextInput` de baseUrl editável | aceita URL manual | ✅ |
| `packSandboxDevService` | regex `^https?://` | aceita **HTTPS** | ✅ |

**Conclusão do preflight: F2.4c foi ZERO CODE.** Nenhum arquivo foi alterado — a única ação foi
operacional (colar a baseUrl R2 no `TextInput` e baixar). O R2 respondeu **HTTP 206 (Range)**,
compatível com `createDownloadResumable`.

---

## 4. Validação manual no iPhone

**Ambiente:** iPhone, Expo Go, mesmo Wi-Fi; flag `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true npx expo start -c`.

### 4.1 Reset inicial — ✅ aprovado
- status `not_downloaded`
- arquivos `0/10`
- `usesPack=false`
- source `require`

### 4.2 Download R2 (HTTPS) — ✅ aprovado
- baseUrl: `https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/packs/david_goliath/v1/`
- status `ready`
- `2289598/2289598` bytes
- arquivos `10/10`
- `usesPack=true`
- source `file`
- uris `file://` confirmadas no iPhone

### 4.3 NarrationScreen (Davi e Golias) — ✅ aprovado
- imagens carregaram normalmente
- sem imagem quebrada
- sem placeholder permanente
- sem tela vermelha

### 4.4 Reset final — ✅ aprovado
- voltou para `require`
- Davi e Golias continuou funcionando pelo bundle local

### 4.5 Demais histórias — ✅ normais
- Jesus e as Crianças, A Criação e Noé permaneceram normais.

---

## 5. Bug observado no Livrinho (FORA do escopo do F2.4c)

Durante o teste, no **Livrinho de Davi e Golias**, **algumas cenas não avançaram automaticamente**
para a próxima (o restante funcionou). A auditoria focada concluiu:

- O problema **não depende de R2, `file://` ou da imagem da cena**.
- O avanço automático do Livrinho depende de **áudio** (`AudioPlayer` → `onFinished` no
  `didJustFinish`) **ou de timer** (cenas sem áudio) — **nunca lê a imagem**.
- O áudio de `david_goliath` continua vindo do **bundle** (10/10 por `require`), idêntico antes e
  depois do download R2.
- **Hipótese provável:** o fim de áudio (`onSceneAudioComplete → advanceToNextScene`) é
  **engolido pela trava de transição** (`lockRef`, ~260ms) **sem retry**, perdendo o avanço de
  forma permanente e intermitente (casa com "algumas cenas").
- **Decisão:** tratar em **bloco separado de bugfix do Livrinho** (área de playback, spec própria +
  validação visual em device). **Não** corrigido neste bloco.

> Evidência de código: avanço em `StoryBookScreen.js` (`advanceToNextScene`/`onSceneAudioComplete`);
> áudio resolvido do bundle via `audioService` (`hasSceneAudio`/`getSceneAudio`), não pelo resolver
> de pack; imagem via `resolveSceneImageForStory` sem acoplamento ao avanço.

---

## 6. Conclusão

**F2.4c aprovado no objetivo de arquitetura remota:**

1. **Download HTTPS real** a partir do **Cloudflare R2**.
2. **Promoção atômica** para **`file://` local** (`.tmp → validar bytes → move → ready`).
3. **Uso no app** (NarrationScreen por `file://`, `usesPack=true`).
4. **Fallback para `require`** após reset (sem quebrar o bundle).

O piloto prova a origem remota definitiva (R2) ponta a ponta em device — o que faltava após a
validação LAN do F2.3.

---

## 7. Limitações e fora do escopo (inalterados)

- **Só cenas:** cover/colorir/áudio seguem do **bundle** (não baixados neste bloco).
- **Só `david_goliath`:** nenhuma outra história migrada.
- **`r2.dev` temporário:** produção exige domínio próprio/CDN.
- **Dev-only:** duplo gate; nenhum fluxo de download em produção; nenhum asset removido do bundle.
- **Não** implementar manifesto global, generalização do downloader, RevenueCat/entitlement aqui.
- **Não** iniciar F2.4d.

---

## 8. Próximos marcos
- **Bugfix do Livrinho** (bloco separado): tornar o avanço por fim de áudio resiliente à trava de transição (spec de bug + regressão + validação visual).
- **F2.4d** (quando autorizado): generalizar o downloader por `storyId` + consumir o manifesto global no runtime; depois expansão de mídia (F2.4e) e entitlement/RevenueCat (F2.4f, planejamento).

## 9. Confirmações
- ✅ F2.4c validado no device com origem **R2 HTTPS**; download→`file://`, uso e reset→`require` aprovados.
- ✅ **Zero code** — nenhum arquivo de código alterado.
- ✅ Bug do Livrinho **registrado como bloco futuro**, fora do escopo do F2.4c.
- ✅ Sem R2/storage/manifest/deps alterados. **Sem commit, push ou `git add`** na fase de validação.
