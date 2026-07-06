# F2.4e.7a — Preflight do build instalado de medição (sem disparar EAS)

> **Bloco:** F2.4e.7a (preflight/auditoria read-only + doc; **sem código, sem build, sem prebuild**). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `dffb293`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** Li também `docs/F2_4E_6_PILOT_OFFLINE_BUILD_MEASUREMENT.md`. Documentos SUPERSEDED não usados como fonte — só histórico.
>
> **Objetivo:** preparar (não executar) o **build instalado de medição** que fecha o que o F2.4e.6 deixou pendente: **offline real pós-restart** e **tamanho real de build instalado**. Este bloco **não roda EAS**; entrega o perfil, o comando exato, os riscos/bloqueios e o plano.

---

## 1. Preflight (confirmado)
- **Branch:** `content-integrate-coloring-3` · **HEAD:** `dffb293` · **local == origin** ✓ · working tree **limpo**.
- **Sem `ios/` nem `android/`** no repo (nenhum prebuild rodado). `eas-cli 19.1.0` disponível. `npx expo config --type public` resolve o `projectId ccf727af…` **sem gerar arquivos**.

## 2. Auditoria de `eas.json` (3 perfis)
| Perfil | `developmentClient` | `distribution` | iOS | Android | JS embutido? | Offline real? |
|---|---|---|---|---|---|---|
| **development** | **true** | internal | `simulator:false` | `apk` | Não (espera Metro/dev server) | **Não** (depende de dev server) |
| **preview** | — (release) | **internal** | `m-medium` | `apk` | **Sim (release)** | **Sim** (standalone) |
| **production** | — (release) | store | `m-medium` | **`app-bundle`** | Sim | Sim, mas p/ **loja** (aab não instala direto) |
- `cli.appVersionSource: local` ✓ · **sem bloco `submit`** (sem auto-submit/OTA).

## 3. Auditoria de `app.json`
- `name: Beni` · `slug: pequenos-tracos-de-fe` · `version: 1.0.0` · `newArchEnabled: true` · `scheme: pequenostracosdefe`.
- **iOS `bundleIdentifier: com.valentedev.pequenostracosdefe`**, `buildNumber: 1`, `supportsTablet: true`, `privacyManifests` (CA92.1), `usesNonExemptEncryption: false`.
- **Android `package: com.valentedev.pequenostracosdefe`**, `versionCode: 1`, permissão `MODIFY_AUDIO_SETTINGS`.
- `plugins`: `expo-font`, `expo-audio` (sem microfone/gravação), `expo-asset`. **Sem RevenueCat** (não necessário para esta medição).
- **`extra.eas.projectId: ccf727af-fd51-4722-bf88-787cd48553c8`**, `owner: eduardocriacao` → projeto EAS **já vinculado**.
- **Bundle identifier configurado** (iOS+Android) ✓ · **`appVersionSource: local`** ✓.

## 4. Perfil recomendado: **`preview`**
Para o objetivo (offline real pós-restart + tamanho instalado real em **dispositivo físico**), **`preview`** é o certo:
- **Standalone/release → JS embutido (Hermes)** ⇒ o app abre **sem Metro** ⇒ permite **offline real pós-restart**.
- **`distribution: internal`** ⇒ instala em dispositivo **sem loja** (iOS ad hoc por UDID; Android APK direto). **Não exige TestFlight** (TestFlight é só para `production`/loja).
- **Config de release ⇒ tamanho instalado realista** (o que queremos medir).
- **Por que não `development`:** é dev client (`__DEV__` true) e **depende de Metro/dev server** ⇒ não serve para offline real. **Por que não `production`:** Android gera `app-bundle` (não instala direto) e distribuição de loja é overkill para medição interna.

## 5. Comando exato recomendado (⚠️ NÃO executado neste bloco)
Pré-requisito único de login: `eas login` (conta **`eduardocriacao`**).
- **iOS (dispositivo-alvo iPhone):**
  ```
  eas device:create          # registra o UDID do iPhone (ad hoc) — uma vez
  eas build --profile preview --platform ios
  ```
- **Android (alternativa de menor atrito, ver §7):**
  ```
  eas build --profile preview --platform android
  ```
Ambos rodam **na nuvem EAS** (prebuild acontece no servidor, **não** gera `ios/`/`android/` locais). Instalação: EAS devolve **URL/QR** do artefato.

## 6. Variáveis de ambiente para o build sandbox
- O runtime lê `process.env.EXPO_PUBLIC_ENABLE_PACK_SANDBOX` e `process.env.EXPO_PUBLIC_GLOBAL_MANIFEST_URL` (`EXPO_PUBLIC_*` ⇒ **inlinadas no build**).
- Hoje elas vivem em **`.env.local`** (gitignored) — usado pelo `expo start`. **`.env.local` NÃO sobe para a nuvem EAS** (está no `.gitignore`) ⇒ para um build teriam de ir para **`eas.json` (`env` do perfil)** ou **variáveis/segredos do EAS**.
- **PORÉM (ver §7, Bloqueio 1):** por causa do gate `__DEV__`, **definir essas vars em build release não habilita a ferramenta** — elas só têm efeito em dev. Portanto, para o build de medição **release**, essas vars são **inócuas** enquanto o gate não mudar.

## 7. Riscos e BLOQUEIOS encontrados (o coração deste preflight)

### 🔴 Bloqueio 1 — a ferramenta de download do pack é `__DEV__`-only (crítico p/ testar o remoto)
`src/services/packSandboxDevService.js:44` → **`return __DEV__ && process.env.EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true'`**. Em build **`preview`/`production` (release), `__DEV__ === false`** ⇒ a tela dev (FAB 🛠 / `PackSandboxDevScreen`) fica **desligada**. Consequência direta:
- Um build **release de medição** **NÃO consegue baixar o pack** de `david_goliath` ⇒ **não** alcança `ready`/`file://` ⇒ **não** dá para testar o **offline real do caminho REMOTO** nesse build.
- O que o build **preview** **consegue** medir mesmo assim: **(a) tamanho instalado real**, **(b) o app abrindo offline pós-restart**, **(c) offline real do conteúdo LOCAL** (starter + fallback local de `david_goliath`, que ainda está no bundle).
- **O que fica pendente:** offline real do **remoto** (`file://` do pack) em build instalado.

**Resoluções possíveis (bloco FUTURO, exige autorização — NÃO agora):**
1. **Gatilho de medição gated por flag de build** (release-safe), espelhando o padrão já existente em `src/services/creatorQaMode.js` (`__DEV__` **OU** flag de build). Permitiria disparar **só** o download do pack piloto num build `preview`, sem expor a tela dev inteira. É **mudança de código** ⇒ spec própria + aprovação.
2. **Build `development` (dev client)** mantém `__DEV__` true ⇒ a ferramenta funciona ⇒ baixa o pack; mas dev client **depende de dev server** para o JS ⇒ offline real fica **turvo** (não é o "sem Metro" limpo do release). Serve para reproduzir o **Modo 1** num app instalado, não o **Modo 2** puro.

> **Recomendação:** para medir **tamanho instalado** e **offline real do app/local**, **`preview` já basta agora**. Para o **offline real do REMOTO** em build instalado, priorizar a **Opção 1** (gatilho por flag de build) num bloco próprio.

### 🟠 Bloqueio 2 — credenciais/Apple Developer (iOS)
- **iOS `preview` (ad hoc/internal)** exige **Apple Developer Program** (enrolamento pago) para **assinatura** + **registro do UDID** do iPhone (`eas device:create`). O EAS gerencia as credenciais, **mas precisa do login Apple**. **Se a conta Apple Developer ainda não estiver enrolada, isto BLOQUEIA o build iOS.**
- **No Windows não há build iOS local** (precisa macOS/Xcode) ⇒ o único caminho iOS é **EAS nuvem**. Não há alternativa local segura para iOS aqui.

### 🟢 Menor atrito — Android
- **Android `preview` (apk)**: EAS **gera keystore automaticamente**, **sem** conta Apple/Google para o build; instala por **APK direto** (sideload). Bom para **tamanho instalado (Android)** + **offline real** num aparelho Android — proxy válido de comportamento (o tamanho iOS difere, mas valida a arquitetura offline num build instalado real, **sem** depender de Apple Developer).

### Riscos operacionais
- **Gerar `ios/`/`android/`:** só ocorre com `expo prebuild`/`expo run:*` (proibidos aqui). **`eas build` faz prebuild na nuvem** ⇒ **não** cria pastas nativas locais. `.gitignore` já ignora `/ios` e `/android` (rede de segurança). ✓
- **Arquivos alterados por `eas build`:** com `appVersionSource: local` e credenciais **remotas** (default EAS), o build **não** modifica arquivos versionados. `expo prebuild` **modificaria** `app.json` + geraria nativos ⇒ **não usar**.

## 8. O que a medição valida (após o build instalado)
1. **Tamanho instalado real** (release) — objetivo primário.
2. **App abre offline pós-restart** (JS embutido, sem Metro).
3. **Piloto `david_goliath` pack ready → file://** — **somente** se resolvido o Bloqueio 1 (gatilho por flag) ou via dev client (Modo 1).
4. **Fallback/reset** — testável (local sempre embutido).
5. **Lifecycle de áudio** — testável (sai do mapa/background sem vazar).

## 9. Plano de instalação no iPhone (após o build)
1. `eas login` (conta `eduardocriacao`) → `eas device:create` (registrar UDID do iPhone).
2. `eas build --profile preview --platform ios` → aguardar artefato na nuvem.
3. Abrir a **URL/QR** do EAS no iPhone → instalar o perfil ad hoc → instalar o app.
4. (Sem TestFlight, sem loja.)

## 10. Plano de validação offline real pós-restart (honesto)
1. Abrir o app instalado **online**.
2. *(Se Bloqueio 1 resolvido)* garantir/gatilhar o **manifesto sandbox** e baixar TODAS as mídias de `david_goliath`; confirmar **cover 1/1 · scene 10/10 · coloring 10/10 · audio 10/10 · usesPack true · file://**.
3. **Fechar o app por completo**; ligar **modo avião**.
4. **Reabrir o app instalado** (sem Metro/Expo Go) → abrir **Davi e Golias**.
5. Confirmar **offline real pós-restart**: capa · cenas · colorir · áudio · Livrinho.
6. **Lifecycle:** sair para o mapa → 30 s → background/lock → voltar → **sem áudio vazando/retomando**.
7. **Reset** pack → confirmar **fallback local** (sem `file://` preso).
> **Honestidade:** sem o Bloqueio 1 resolvido, os passos 2 e 5-remoto ficam **parcialmente** cobertos (só o **local** offline). O **remoto offline real** exige a Opção 1/2 do §7.

## 11. Plano de medição de tamanho instalado (iPhone)
- **iPhone:** Ajustes → **Geral** → **Armazenamento do iPhone** → **Beni** → anotar **Tamanho do app** e **Documentos e dados** (o pack baixado conta como dados, não como tamanho do app).
- **EAS:** a página do build mostra o **tamanho do artefato** (`.ipa`/`.apk`) — registrar também.
- **Android (se usado):** Ajustes → Apps → Beni → Armazenamento (tamanho do app + dados).
- Registrar os números num doc posterior (F2.4e.7b) e comparar com export (400 MB) e alvo v4 (teto 200 MB).

## 12. Gates e estado
- `npm run smoke` **1697/1697** · `npx expo-doctor` **18/18** · `npm run audio:audit` **launch-ready (200/200)** · `git diff --check` **limpo** · `git status` limpo antes do doc.
- **Arquivos alterados por este bloco:** apenas **1 novo (untracked):** `docs/F2_4E_7A_BUILD_MEASUREMENT_PREFLIGHT.md`. **Nenhum** `src/`/config/asset tocado.

## 13. Resumo executivo / decisões para o Eduardo
1. **Perfil = `preview`** (standalone, internal). Comando iOS: `eas build --profile preview --platform ios` (após `eas device:create`).
2. **Decisão A — Apple Developer:** há enrolamento ativo? **Sim** ⇒ segue iOS. **Não** ⇒ usar **Android `preview`** como proxy de medição (sem Apple), ou enrolar antes.
3. **Decisão B — offline real do REMOTO em build instalado:** exige a **Opção 1 do §7** (gatilho por flag de build, release-safe) — **bloco de código próprio, com autorização**. Sem isso, o build de medição cobre **tamanho instalado + offline real LOCAL**, não o remoto.
4. **Nenhum EAS/prebuild rodado aqui.** Próximo passo é **autorizar** um dos caminhos acima.

## 14. Confirmações de escopo
Sem `git add`/commit/push · sem `eas build`/`eas submit`/`prebuild` · **sem `ios/`/`android/`** · sem dependência nova · sem `package.json`/`package-lock.json` · sem `app.json`/`eas.json` alterados · sem assets · sem `src` · sem RevenueCat/entitlement/paywall · sem Brincar · sem regra de conclusão total · sem F2.4f · sem migração das 18 premium · sem remover requires locais · sem alteração de design system · **sem artefato de build/export no repo**.
