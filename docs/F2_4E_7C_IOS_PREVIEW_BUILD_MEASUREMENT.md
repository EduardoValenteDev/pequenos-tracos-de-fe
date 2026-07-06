# F2.4e.7c — Build iOS preview instalado de medição (offline real do remoto)

> **Bloco:** F2.4e.7c (build de medição na nuvem EAS; **sem código, sem prebuild, sem submit**). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `b4cb28f`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** Li também `F2_4E_6`, `F2_4E_7A`, `F2_4E_7B`. SUPERSEDED não usados como fonte.
>
> **Objetivo:** gerar um build **iOS preview/internal** instalável no iPhone para medir/validar: offline real pós-restart, pack remoto `david_goliath` baixado em build instalado, `file://` persistente após fechar o app, lifecycle de áudio, tamanho real instalado e tamanho do artefato EAS.

## 1. Contexto e estado inicial
- **HEAD usado:** `b4cb28f` (`feat: enable release-safe pack qa gate for preview`). **local == origin** ✓ · working tree **limpo**.
- **Decisão do fundador:** Eduardo tem Apple Developer + Google Play Console; usar **iOS preview** primeiro.
- F2.4e.7b habilitou o **QA pack gate** em build preview via 4 flags no `eas.json` (perfil `preview`).

## 2. Gates pré-build (todos verdes)
| Gate | Resultado |
|---|---|
| `git status --short` | limpo (só este doc, criado depois) |
| `git rev-parse --short HEAD` | `b4cb28f` |
| local == origin | ✓ (`b4cb28feaba3702d4a1d8af9a84fdeceae17f5b9`) |
| `npm run smoke` | **1718/1718** |
| `npx expo-doctor` | **18/18** |
| `npm run audio:audit` | launch-ready (200/200) |
| `git diff --check` | limpo |
| `eas.json` preview flags QA | ✓ (`ENABLE_PACK_SANDBOX`/`ENABLE_RELEASE_PACK_QA`/`QA_BUILD`=`true`, `BUILD_PROFILE`=`preview`) |
| `eas.json` production sem QA | ✓ (`env` vazio) |

## 3. Comandos executados (read-only + tentativa de build)
- `eas whoami` → **logado** (contas `eduardocriacao` Owner, `projetosedu` Owner).
- `eas device:list --non-interactive` → **"No Apple teams found for account eduardocriacao."**
- `eas build:list --platform ios` → **vazio** (nenhum build iOS prévio → sem credenciais existentes).
- `eas build --profile preview --platform ios --non-interactive` → **tentado; parou nas credenciais** (ver §4).

## 4. Resultado do build — BLOQUEADO em credenciais (build NÃO gerado)
A tentativa confirmou **duas coisas**:

**✅ (Positivo) As flags QA do F2.4e.7b chegam ao build.** Saída do EAS:
> *Environment variables loaded from the "preview" build profile "env" configuration: **EXPO_PUBLIC_ENABLE_PACK_SANDBOX, EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA, EXPO_PUBLIC_QA_BUILD, EXPO_PUBLIC_BUILD_PROFILE**.*

Ou seja: quando o build for gerado, o **QA Pack Sandbox aparecerá** e o **Download TODAS** funcionará (as 4 flags → `RELEASE_PACK_QA_ENABLED` → `isPackSandboxDevEnabled()` true em release).

**🔴 (Bloqueio) Credenciais iOS exigem modo interativo.** Saída do EAS:
> *✔ Using remote iOS credentials (Expo server)* … *Failed to set up credentials. **You're in non-interactive mode. EAS CLI couldn't find any credentials suitable for internal distribution. Run this command again in interactive mode.***

**Causa:** é o **1º build iOS** desta conta e **nenhum time Apple está conectado** (`No Apple teams found`). Para distribuição **internal/ad-hoc** o EAS precisa criar, **interativamente**: (a) login na conta **Apple Developer** (com 2FA), (b) **Apple Distribution Certificate**, (c) **Ad-hoc Provisioning Profile** com o **UDID do iPhone** registrado. Este shell é **não-interativo** ⇒ o build **não pode ser concluído aqui**.

- **Build ID / URL / status / tamanho do artefato:** **N/A** — o build **não foi enfileirado** (parou antes do upload, na etapa de credenciais). Nenhum crédito de build consumido.
- **Repo intacto após a tentativa:** `git status` limpo; **sem** `ios/`/`android/`; EAS **não alterou** `app.json`/`eas.json`.

### Nota de config (não bloqueia; requer autorização p/ corrigir)
O EAS avisou: *"app.json is missing `ios.infoPlist.ITSAppUsesNonExemptEncryption` boolean. Manual configuration is required in App Store Connect before the app can be tested."* O `app.json` atual tem `ios.infoPlist.usesNonExemptEncryption: false` — a chave reconhecida pelo EAS é **`ios.config.usesNonExemptEncryption`** (ou `ios.infoPlist.ITSAppUsesNonExemptEncryption`). É relevante para **App Store Connect/TestFlight**, **não** para o **ad-hoc internal** (só um aviso). **Não corrigi** (mexer em `app.json` exige autorização — regras 6/27). Recomendação para um bloco próprio.

## 5. O que Eduardo precisa rodar INTERATIVAMENTE (na máquina dele)
> Estes passos exigem **login Apple (2FA)** e o **iPhone em mãos** — por isso **não** podem rodar neste ambiente headless (regra 28: Eduardo digita as credenciais localmente). Não coloque senhas/códigos em nenhum relatório.

```
cd C:\Projetos\pequenos-tracos-de-fe
eas whoami                                   # confirmar conta eduardocriacao
eas device:create                            # registrar o UDID do iPhone (abre URL/QR → instalar perfil no iPhone)
eas build --profile preview --platform ios   # MODO INTERATIVO: logar Apple (2FA) → gerar cert + provisioning ad-hoc
```
Durante o `eas build` interativo, o EAS perguntará por login Apple e por gerar as credenciais → **aceitar** (é o esperado). **Se pedir para alterar `app.json`/`eas.json`/`projectId`/`bundleId` → parar e conferir antes** (não deve pedir; o projeto já tem bundleId `com.valentedev.pequenostracosdefe` e projectId `ccf727af…`).

Ao terminar, o EAS mostra **Build ID + URL**; anotar aqui (§7) e no fim medir o tamanho do artefato (`.ipa`) na página do build.

## 6. Instalação no iPhone (após o build concluir)
1. Abrir a **URL/QR** do build EAS no iPhone (Safari) → instalar o **perfil ad-hoc** → instalar o app **Beni**.
2. (Sem TestFlight, sem loja — é internal/ad-hoc no device registrado.)

## 7. Matriz de validação manual pós-instalação (offline real do remoto)
1. Abrir o app **online**.
2. Confirmar que o **acesso QA ao Pack Sandbox** aparece (FAB `🛠 packs`).
3. Abrir Pack Sandbox → colar a URL do manifesto: `https://pub-f990153eeeb9460ab963038904f3ac96.r2.dev/content-manifest.json`.
4. **Download TODAS as mídias** → confirmar **cover 1/1 · scene 10/10 · coloring 10/10 · audio 10/10 · usesPack true · file://**.
5. Abrir **Davi e Golias** → capa remota · cenas remotas · colorir remoto · áudio remoto · **Livrinho** (cenas+áudio).
6. **Fechar completamente o app** → **modo avião** → **reabrir** (sem Metro/Expo Go).
7. **Offline real pós-restart:** Davi e Golias abre · capa · cenas · colorir · áudio · Livrinho — tudo via `file://`.
8. **Lifecycle:** tocar áudio no Livrinho → sair para o mapa → **30 s** (nenhum áudio continua) → **background/lock** (não retoma sozinho).
9. Voltar online (se preciso) → **Reset pack** → confirmar **fallback local** (nenhum `file://` preso).
10. **Medir tamanho instalado:** Ajustes → Geral → **Armazenamento do iPhone** → **Beni**.

### Tabela para Eduardo preencher
| Item | Resultado |
|---|---|
| Build ID (EAS) | ____________ |
| Build URL (EAS) | ____________ |
| Tamanho do artefato `.ipa` (EAS) | ____________ |
| Pack ready (cover/scene/coloring/audio 1/10/10/10, usesPack true) | ☐ sim ☐ não |
| Offline real pós-restart aprovado (abre + 5 mídias via file://) | ☐ sim ☐ não |
| Lifecycle de áudio ok (sem vazar no mapa/background) | ☐ sim ☐ não |
| Reset → fallback local ok | ☐ sim ☐ não |
| **Tamanho do app** (Armazenamento do iPhone) | ____________ |
| **Documentos e dados** (se exibido) | ____________ |
| **Tamanho total** (se exibido) | ____________ |
| Observações | ____________ |

## 8. Limitações honestas
- **O build NÃO foi gerado neste bloco.** Ele **parou nas credenciais iOS** (1º build + sem time Apple conectado + sessão não-interativa). Isso **não** é falha do app nem do gate QA — as flags QA carregaram corretamente. É o passo **interativo** de credenciais Apple, que **Eduardo** roda (§5).
- Enquanto o build não for gerado e instalado, o **offline real pós-restart do remoto** e o **tamanho instalado real** permanecem **pendentes** (não prometidos como validados). O que já está provado (F2.4e.6) é o **offline operacional em sessão aberta**.

## 9. Confirmação de não-alteração
- **Nenhum código/config alterado.** `git status` após todos os comandos: só este doc (untracked). `app.json`/`eas.json`/`src/`/`assets`/`package.json`/`package-lock.json` **intactos**. **Sem** `ios/`/`android/`. **Sem** `eas submit`/`prebuild`. **Sem** commit/add/push. Nenhum dado sensível registrado.
