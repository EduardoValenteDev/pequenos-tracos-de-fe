# F2.4e.2 — sha256 real na integridade de pack remoto (@noble/hashes)

> **Bloco:** F2.4e.2. **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `b3fdb96`.
> Implementa **sha256 real** dos arquivos baixados, comparando com `files[].sha256` do
> `manifest.json` do pack. **Dev-only, sem consumo user-facing.** Relacionado:
> [F2.4e.1 mídia por kind](F2_4E_1_REMOTE_MEDIA_DOWNLOAD_DIAGNOSE.md) · [integridade F2.1a].

## 1. Objetivo
Validar cada arquivo do pack por **sha256 real** (bytes crus), garantindo que o conteúdo
baixado é idêntico ao publicado. Substitui o `computeFileSha256` stub por implementação real.

## 2. Dependência aprovada
**`@noble/hashes` `^2.2.0`** (única instalada). **Não** foram instaladas `expo-crypto` nem
`react-native-quick-crypto`.

## 3. Motivo técnico da escolha
- RN/Hermes não oferece sha256 nativo confiável para **bytes crus** de mídia.
- `@noble/hashes` é **JS puro** (sem módulo nativo → sem impacto de build/EAS/New Arch), auditado e pequeno.
- Hashea `Uint8Array` cru → **bate exatamente** com o sha256 gerado pelo `build-story-pack.js` (Node `crypto` sobre bytes crus). Provado no smoke (sandbox) e contra os arquivos reais do pack.

## 4. Arquivos alterados
- **`src/services/packIntegrityService.js`** — `computeFileSha256` real + helpers `base64ToBytes`/`hashBase64ToHex`; `validateFileEntry` compara sha256.
- **`src/services/packDownloadService.js`** — verify loop chama `computeFileSha256` (falha em mismatch, antes do move/ready).
- **`src/services/packSandboxDevService.js`** — diagnose expõe `sha256Ok` por kind (lê `manifest.json` do disco).
- **`src/screens/PackSandboxDevScreen.js`** — diagnose mostra `sha256:X/Y` por kind.
- **`scripts/smoke.js`** — +15 checks F2.4e.2 (inclui teste real em sandbox); 2 checks atualizados.
- **`package.json` / `package-lock.json`** — só `@noble/hashes`.
- **`docs/F2_4E_2_REAL_SHA256_PACK_INTEGRITY.md`** — este documento.

**Não** tocados: contentResolver, NarrationScreen, StoryBookScreen, ColoringScreen, audioService, telas de capa/Home/Estante/StoryCard, entitlement, RevenueCat, assets locais, manifesto, R2.

## 5. Como o hash é calculado
1. `FileSystem.readAsStringAsync(uri, { encoding: 'base64' })` → base64 do arquivo.
2. `base64ToBytes` (via `atob`) → `Uint8Array` de bytes crus.
3. `sha256(bytes)` (@noble/hashes) → `bytesToHex` → **hex lowercase** (validado por regex `^[a-f0-9]{64}$`).
4. Resultado bate com o `files[].sha256` do manifesto (mesmo algoritmo/entrada do gerador Node).

## 6. Como a validação falha com segurança
- `validateFileEntry`: existência → bytes → **sha256** (quando `files[].sha256` presente). Mismatch → `{ ok:false, reason:'sha256 divergente ...' }`. Se `computeFileSha256` falhar (leitura/hash) → `{ ok:false, reason:'sha256 indisponível ...' }`. Se o manifesto não declarar sha256 (contrato futuro) → não bloqueia.
- Nunca lança (retorno seguro).

## 7. Impacto no download
No verify loop, para cada arquivo solicitado: existência + bytes + **sha256**. Qualquer
divergência entra em `errors[]` → `failWith` (limpa `.tmp`, grava `failed`, mantém require).
`ready` **só** com todos válidos (existência+bytes+sha256) e move atômico → **nunca ready parcial**.
Fluxo `.tmp → validar → mover → ready`, `requestedKinds` e default scenes-only **inalterados**.

## 8. Impacto no diagnose dev
`diagnoseDavidGoliathPackSandbox` lê `manifest.json` do `localDir` e, por item, verifica o
hash real, expondo `byKind[k].sha256Ok` (contagem OK). A tela dev mostra `sha256:X/Y` por kind.
Sem manifesto no disco (não-ready) → `sha256Ok = null` (desconhecido). Sem dependência de tela final.

## 9. Riscos
- **Custo de leitura:** hashear 31 arquivos (~18 MB) lê tudo como base64 (memória transitória); aceitável para ferramenta dev.
- **`atob`:** disponível no Hermes/RN 0.81 e no Node; base64 do FileSystem não tem espaços.
- **Compat gerador:** garantida por teste real (noble == Node crypto) e contra os arquivos do pack.

## 10. Plano de validação manual no iPhone
1. `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true npx expo start -c` → iPhone → FAB **🛠 packs**.
2. **Reset** → tudo 0, `usesPack=false`, `require`.
3. Colar a URL do content-manifest global; `storyId = david_goliath`.
4. **Download TODAS as mídias** → `downloading → verifying → ready`.
5. Diagnose: **cover 1/1**, **scene 10/10**, **coloring 10/10**, **audio 10/10**, cada um com **sha256 X/X** (todos OK), bytes válidos, `file://`, `usesPack=true`.
6. Abrir **NarrationScreen** e **Livrinho** só para confirmar que **cenas** seguem como no F2.4d.
7. **Reset final** → volta a `require`/fallback local.

**Teste negativo (opcional em dev):** apontar para um manifesto/arquivo com sha256 divergente →
resultado esperado: `failed`, erro `sha256 divergente`, pack **não** fica ready, fallback local
seguro, nenhum estado parcial. (Provado em CI/sandbox contra os arquivos reais: 7/7.)

## 11. Confirmações de não-escopo
Somente `@noble/hashes` instalada · sem expo-crypto · sem react-native-quick-crypto · sem
RevenueCat · sem entitlement · sem assets locais alterados · sem manifesto novo · sem R2 · **sem
alteração no usuário final** · sem iniciar F2.4e.3/e.4/e.5/F2.4f.

## 12. Performance (F2.4e.2p) — sha256 real sem travar a UI

A 1ª versão travava o iPhone porque o **diagnose hasheava os 31 arquivos a cada `refresh()`**
(mount da tela + após toda ação), e o **verify do download** hasheava sem ceder a UI. Correção:

1. **Diagnose LEVE:** não hasheia mais — só existência/bytes/`sourceType`/uri. Refresh/entrada da tela ficam rápidos.
2. **Verificação sha256 PROFUNDA = ação dev explícita** (`verifyDavidGoliathPackSandboxSha256`, botão "Verificar sha256 (profundo)"), com **yield entre arquivos**.
3. **Status sha256 sem re-hash:** após o download (que **já** valida sha256 antes do ready), a tela mostra "sha256 validado no download ✓" a partir do resultado — sem recalcular.
4. **Download verify com yield** entre arquivos (`await yieldToUI()`), evitando congelar durante o `verifying`.
5. **Progresso throttled** (~120ms) no callback de chunk → menos `setState`.
6. **Logs de tempo dev-only** (`__DEV__`) para medir o verify.

Invariantes preservados: sha256 real continua ativo; validação **antes** do ready; mismatch **impede** ready; nenhuma mudança no usuário final; sem dependência nova.

### 12.1 F2.4e.2pR — hardening de concorrência / ciclo de vida (auditoria reforçada)

Uma auditoria adversarial reforçada (4 lentes independentes) confirmou os invariantes anti-freeze
(diagnose leve, verify só por botão, sha256 real+bloqueante, nunca ready parcial, yields, throttle,
logs dev-only), mas encontrou lacunas **residuais de concorrência** — corrigidas:

1. **Trava síncrona de duplo-toque (`busyRef`):** o gate `disabled={busy}` usa estado React (assíncrono); um duplo-toque no mesmo frame podia iniciar **duas ações pesadas** (ex.: Download + Reset concorrentes → `moveAsync` vs `deleteAsync` corrompendo índice/disco). Agora um `busyRef` (ref, síncrono) serializa: a 2ª chamada retorna imediatamente. Todas as ações passam por `runExclusive`.
2. **`runExclusive` com `try/finally`:** `busy` é **sempre** liberado (mesmo em erro) — elimina o risco latente de "busy travado" que congelaria toda a tela.
3. **`mountedRef` + `safeSet`:** `setState` só ocorre se a tela estiver montada; "Voltar" fica **desabilitado enquanto busy**, evitando desmontar no meio de uma operação e trabalho/estado stale.
4. **Limpeza de estado stale:** Seed e Download (LAN) limpam `verify`/`dl`/`dlG` na entrada (como o Reset), para o painel sha256 nunca mostrar um veredito de um conjunto de arquivos antigo.
5. **Throttle no downloader LAN legado:** paridade com o genérico (~120ms), evitando tempestade de `setState` na tela.

**Residuais aceitos (documentados, não corrigidos):** (a) o hash de **um** arquivo grande é síncrono (~100–300ms por arquivo no Hermes) — bounded por arquivo, atrás de spinner e ação explícita, não é o freeze de 31 arquivos; (b) o promote é `delete localDir → move` (não atômico puro) — em falha rara de move, o `localDir` some mas o status vira `failed` e o app cai no **fallback require** (sem quebra visível).

## 13. Próximos passos
- **F2.4e.3–e.5:** consumo user-facing coloring → cover → audio (cada bloco com validação no device).
- **F2.4f:** entitlement/RevenueCat (planejamento).
