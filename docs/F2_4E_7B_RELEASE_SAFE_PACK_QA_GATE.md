# F2.4e.7b — Gatilho QA release-safe do pack sandbox (build preview/internal)

> **Bloco:** F2.4e.7b (código mínimo do gate + config + doc; **sem build, sem EAS, sem prebuild**). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · **HEAD:** `b27cd1d`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** Li também `docs/F2_4E_6_...` e `docs/F2_4E_7A_...`. SUPERSEDED não usados como fonte — só histórico.
>
> **Objetivo:** permitir baixar/diagnosticar o pack sandbox `david_goliath` num **build `preview`/internal (release)** — onde `__DEV__` é `false` — **sem** liberar isso em produção por acidente e **sem** expor ferramenta técnica para a criança. Habilita o **próximo bloco (F2.4e.7c)** a gerar um build instalável e provar o **offline real do REMOTO** (`file://`).

## 1. Problema (do F2.4e.7a)
`packSandboxDevService.js` liberava a ferramenta só sob `__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true'`. Em build `preview`/`production` (release), **`__DEV__` é `false`** ⇒ a ferramenta ficava desligada ⇒ o build instalado **não** conseguia baixar o pack remoto ⇒ o **offline real do remoto** não podia ser provado.

## 2. Mapeamento (auditoria)
- **Gate central:** `src/services/packSandboxDevService.js` → `isPackSandboxDevEnabled()`.
- **Acesso à tela:** `src/navigation/AppNavigator.js` — `const devPacksEnabled = isPackSandboxDevEnabled()`; a **rota** `PackSandboxDev` (linha ~412) e o **FAB `🛠 packs`** (linha ~421) renderizam **só** `{devPacksEnabled && (...)}`. **Não child-facing:** em produção (gate false) a rota e o FAB **não existem**; o FAB é técnico (`accessibilityLabel="Dev: Pack Sandbox"`, fundo escuro) e só aparece em dev/QA.
- **Padrão existente:** `src/services/creatorQaMode.js` já usa `__DEV__ || EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE` (dev-OU-flag) e `src/config/featureFlags.js` centraliza flags de build (`SHOW_CHURCH_MODE`). Reaproveitei esse padrão/lar.
- **Flags EXPO_PUBLIC hoje:** `ENABLE_CHURCH_MODE`, `ENABLE_CREATOR_QA_MODE`, `ENABLE_PACK_SANDBOX`, `PACK_SANDBOX_BASE_URL`, `GLOBAL_MANIFEST_URL`. `.env.local` é **gitignored** (não sobe pro EAS).

## 3. Solução aplicada (mínima, centralizada, release-safe)
Helper central em **`src/config/featureFlags.js`** — `RELEASE_PACK_QA_ENABLED` (QUÁDRUPLO gate, conjunção):
```js
export const RELEASE_PACK_QA_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_PACK_SANDBOX     === 'true' &&
  process.env.EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA  === 'true' &&
  process.env.EXPO_PUBLIC_QA_BUILD                === 'true' &&
  process.env.EXPO_PUBLIC_BUILD_PROFILE           === 'preview';
```
Gate central em **`src/services/packSandboxDevService.js`** (não removi o gate dev; **acrescentei** o QA):
```js
export function isPackSandboxDevEnabled() {
  const devGate = __DEV__ && process.env.EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true';
  return devGate || RELEASE_PACK_QA_ENABLED;
}
```
Como a **rota + o FAB** já dependem de `isPackSandboxDevEnabled()`, **nenhuma** mudança no `AppNavigator` foi necessária — em `preview` QA a ferramenta aparece; em produção, não.

## 4. Flags finais
- **DEV (Expo Go / dev client):** `__DEV__` true **+** `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true` (via `.env.local`, como hoje). Inalterado.
- **PREVIEW (build de QA):** as **4 flags** abaixo, definidas **só no perfil `preview` do `eas.json`** (`env`), não secretas:
  | Flag | Valor |
  |---|---|
  | `EXPO_PUBLIC_ENABLE_PACK_SANDBOX` | `"true"` |
  | `EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA` | `"true"` |
  | `EXPO_PUBLIC_QA_BUILD` | `"true"` |
  | `EXPO_PUBLIC_BUILD_PROFILE` | `"preview"` |
- **PRODUCTION:** **NENHUMA** flag QA (o perfil `production` do `eas.json` não tem `env`).

## 5. Por que é release-safe (produção nunca liga)
- O gate release é **conjunção de 4** — precisa de todas. O perfil `production` **não define nenhuma**.
- **Blindagem extra:** mesmo que `EXPO_PUBLIC_ENABLE_PACK_SANDBOX` "vazasse" sozinho para produção, ainda faltariam **`ENABLE_RELEASE_PACK_QA`**, **`QA_BUILD`** e sobretudo **`BUILD_PROFILE === 'preview'`** — que produção nunca terá. Portanto **produção continua sem QA** por padrão e por acidente.
- A ferramenta permanece **técnica e restrita** (FAB/rota dev), **NUNCA child-facing**: em produção não existe; em preview é uma ferramenta de QA para o testador, não uma tela de usuário final. A **criança nunca vê** pack/manifesto/sha256/file/CDN/MB/diagnóstico.

## 6. Confirmações de invariantes (auditoria)
- **Remoto ainda limitado a `david_goliath`** (gate `SANDBOX_STORY_ID` no hook) ✓ · **fallback local obrigatório** (`remote || local`) ✓ · **reset** intacto (`clearPackEntry`) ✓.
- **Download/sha256 não enfraquecidos** — `packDownloadService`/`packIntegrityService` seguem validando **sha256 real antes do ready** (não toquei neles). ✓
- **Lifecycle de áudio F2.4e.5pR intacto** (token/`navigation.isFocused()`/`AppState`) — não tocado. ✓
- **seed/reset seguem abortando com o gate desligado** ✓ · **A Criação/Noé starter local** ✓ · **requires locais preservados** ✓.
- **Sem** RevenueCat/entitlement/paywall/Brincar/conclusão · **F2.4f não iniciado** · **18 premium não migradas** · **sem** `ios/`/`android/` · **sem** dependência nova/`package.json`/assets/design system.

## 7. Arquivos alterados (4 código/config + 1 doc)
- `src/config/featureFlags.js` — helper `RELEASE_PACK_QA_ENABLED`.
- `src/services/packSandboxDevService.js` — `isPackSandboxDevEnabled = devGate || RELEASE_PACK_QA_ENABLED` (+ import + docstring).
- `eas.json` — `env` (4 flags QA) **só no perfil `preview`**.
- `scripts/smoke.js` — +21 checks de segurança F2.4e.7b.
- `docs/F2_4E_7B_RELEASE_SAFE_PACK_QA_GATE.md` — este documento.

## 8. Validação em Expo Go/dev (regressão — comportamento inalterado)
Rodar `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true ... npx expo start -c` → o FAB `🛠 packs` continua aparecendo (via `devGate`, `__DEV__` true) → Download/Reset/Diagnose funcionam como antes. **Nada muda em dev** (o gate release só acrescenta um caminho para builds preview).

## 9. Próximo bloco (F2.4e.7c) — build preview de medição
1. `eas login` (conta `eduardocriacao`) → *(iOS)* `eas device:create` (registrar UDID do iPhone).
2. `eas build --profile preview --platform ios` (ou `--platform android` como proxy sem Apple Developer — ver F2.4e.7a §7).
3. Instalar o build → abrir online → **FAB 🛠 packs aparece** (via as 4 flags QA do preview) → **Download TODAS** (cover 1/1 · scene 10/10 · coloring 10/10 · audio 10/10 · usesPack true · file://).
4. **Fechar app + modo avião + reabrir** (sem Metro) → **offline real do REMOTO**: capa/cenas/colorir/áudio/Livrinho via `file://` → lifecycle (sair/mapa/30s/background) → reset → fallback local.
5. **Medir tamanho instalado** (Ajustes → Armazenamento) + tamanho do artefato EAS. Registrar em doc do F2.4e.7c.
> Este bloco **não** roda nada disso — só prepara o gate/config.

## 10. Confirmações de escopo
Sem `git add`/commit/push · sem `eas build`/`eas submit`/`prebuild` · **sem `ios/`/`android/`** · sem dependência nova · sem `package.json`/`package-lock.json` · sem assets · sem RevenueCat/entitlement/paywall · sem Brincar · sem regra de conclusão total · sem F2.4f · sem migração das 18 premium · sem remover requires locais · sem alteração de design system/tokens/paleta/fontes/layout · sem tornar o sandbox child-facing.
