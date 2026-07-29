# Checklist de Flags de Produção — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**  
Verificar ANTES de cada build de produção. Uma flag errada pode entregar premium grátis ou expor debug.

---

## Flags críticas

| Flag | Arquivo | Valor em DEV | Valor em PRODUÇÃO | Risco se errar | Verificado pelo smoke? |
|---|---|---|---|---|---|
| `ENABLE_LOCAL_PREMIUM_TEST_MODE` | `src/services/accessControl.js:9` | `false` (nunca deve ser `true`) | **`false`** | Premium grátis para todos os usuários | ✓ Sim — check [143] |
| `ALLOW_COMING_SOON_PREVIEW` | `src/services/accessControl.js:15` | `false` | **`false`** | Histórias incompletas acessíveis | Verificar manualmente |
| `FREE_ATELIER_SAVE_LIMIT` | `src/services/accessControl.js:16` | `3` | **`3`** | Limite incorreto de artes gratuitas | — |
| `__DEV__` (React Native global) | Runtime RN | `true` | **`false`** (automático) | Logs de debug em produção | Automático pelo bundler |
| `newArchEnabled` | `app.json` | `true` | **`true`** | Performance inferior | — |
| `NSPrivacyTracking` | `app.json` privacyManifests | `false` | **`false`** | Rejeição Apple | ✓ Smoke check |
| `microphonePermission` | `app.json` expo-audio plugin | `false` | **`false`** | Permissão desnecessária solicitada | — |
| `recordAudioAndroid` | `app.json` expo-audio plugin | `false` | **`false`** | Permissão desnecessária no Android | — |
| `enableBackgroundRecording` | `app.json` expo-audio plugin | `false` | **`false`** | Bateria drenada em background | — |
| `usesNonExemptEncryption` | `app.json` ios.infoPlist | `false` | **`false`** | Declaração de exportação errada na Apple | — |

---

## Flags de build EAS

| Profile | `distribution` | `buildType` | Uso |
|---|---|---|---|
| `development` | `internal` | `apk` | Desenvolvimento local com dev client |
| `preview` | `internal` | `apk` (Android) / default (iOS) | Testes internos antes de submissão — **laboratório de packs, SEM Modo Criador** |
| `preview-criador` | `internal` | herda `preview` (`extends`) | **B4:** QA interno de conteúdo premium — `preview` + Modo Criador |
| `production` | `store` (implícito) | `app-bundle` (Android) | Submissão às lojas |
| `screenshot` | `internal` | `apk` (Android) | **M1:** screenshots oficiais — production-like, SEM flags internas |

**Regra:** Nunca usar `preview` para submeter às lojas. Sempre usar `production`. **Screenshots oficiais nunca saem de `development` nem `preview`** — usar `production` ou `screenshot` (ambos limpos).

**Regra `preview-criador` (B4):** é um perfil **interno de QA**, de distribuição `internal`, criado só para validar conteúdo premium num build Release. **Nunca usar para distribuição pública**, nunca para loja, nunca para screenshots. Ele é o único perfil que declara `EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE=true` — e essa flag, **sozinha, não autoriza nada**: o Modo Criador exige as 5 condições simultâneas de `CREATOR_QA_MODE_RELEASE_ENABLED` (`src/config/featureFlags.js`), incluindo `EXPO_PUBLIC_BUILD_PROFILE === 'preview-criador'` literal.

---

## Ferramentas internas e visibilidade (M1)

As ferramentas internas do criador (Modo Criador/premium simulado, packs, reset de guias, rever onboarding, testar desenhos, build info) vivem na seção **"Administração (dev)"** da Área dos Pais e nas rotas internas (`ColoringQa`, `PackSandboxDev`). Gate único: **`isInternalToolsEnabled()`** (`src/config/internalTools.js`) = `__DEV__ || Modo Criador permitido || QA release-safe`. Cada ferramenta mantém o gate específico (defesa em profundidade). Proteção **build-time** (sem auth de admin no app final).

### Matriz de visibilidade

| Ambiente | `isInternalToolsEnabled()` | Modo Criador (premium simulado) | FAB packs | Seção "Administração (dev)" |
|---|---|---|---|---|
| `development` (`__DEV__`) | **true** | ON | (sem FAB — só a seção) | ON |
| `preview` (QA packs) | **true** (via `RELEASE_PACK_QA_ENABLED`) | **OFF** (sem `ENABLE_CREATOR_QA_MODE`) — **switch nem é renderizado** | removido | ON (para packs QA) |
| `preview-criador` (QA premium) | **true** (via `RELEASE_PACK_QA_ENABLED`) | **ON** (5 flags simultâneas) — switch visível e funcional | removido | ON (packs + Modo Criador) |
| `production` | **false** | OFF | removido | OFF |
| `screenshot` | **false** | OFF | removido | OFF |

- **FAB packs global REMOVIDO (M1):** sem overlay dev em nenhuma tela; acesso a packs só pela seção "Administração (dev)".
- **Banner "Modo Criador Ativo":** só onde o Modo Criador é permitido (`development` ou `preview-criador`). Nunca em `preview`, `production` ou `screenshot`.
- **Switch do Modo Criador (B4):** renderizado **apenas** quando `isCreatorQaModeAllowed()` é true. Em `preview` a seção "Administração (dev)" continua visível para os packs, mas o switch **não existe** — antes ele aparecia, aceitava o toque e voltava sozinho para `false`, porque a persistência já era (corretamente) recusada pelo gate.
- **Produção é fail-closed por ausência:** os perfis `production` e `screenshot` não declaram **nenhuma** env. Mesmo que um build anterior tenha deixado `true` salvo no AsyncStorage, `isCreatorQaModeEnabled()` retorna `false` e o valor salvo é ignorado.
- **"Apagar progresso":** feature PÚBLICA do responsável (gestão de dados, confirmação "APAGAR") — fora da seção dev.

### Processo de screenshots oficiais

1. **Nunca** tirar screenshots de `development` (mostra banner/ferramentas) nem de `preview` (mostra a seção de packs QA).
2. Usar o perfil **`screenshot`** (`eas build --profile screenshot`) ou **`production`** — ambos sem flags internas → app limpo (sem Modo Criador, FAB, seção dev, premium simulado).
3. Anti-vazamento coberto pelo smoke (bloco `── M1 ──`).

---

## Checklist rápido antes de `npm run build:production`

```bash
# 1. Verificar ENABLE_LOCAL_PREMIUM_TEST_MODE
grep "ENABLE_LOCAL_PREMIUM_TEST_MODE" src/services/accessControl.js
# Esperado: ENABLE_LOCAL_PREMIUM_TEST_MODE = false

# 2. Verificar ALLOW_COMING_SOON_PREVIEW
grep "ALLOW_COMING_SOON_PREVIEW" src/services/accessControl.js
# Esperado: ALLOW_COMING_SOON_PREVIEW = false

# 3. Rodar smoke
npm run smoke
# Esperado: 582/582 (ou mais) passando

# 4. Verificar expo-doctor
npx expo-doctor

# 5. Verificar bundle size (após download do APK do EAS)
# APK deve ser < 150 MB

# 6. Verificar versionCode / buildNumber incrementados
grep "versionCode\|buildNumber" app.json
```

---

## Flags futuras a gerenciar

| Flag | Quando adicionar | Risco |
|---|---|---|
| `ENABLE_IAP` | Sprint de assinatura | Cobrança real em produção |
| `ENABLE_CLOUD_SYNC` | Sprint de backend | Dados transmitidos sem consentimento |
| `ENABLE_AI_LUMI` | Sprint Lumi IA | Chamadas de IA sem rate limit |
| `ENABLE_ANALYTICS` | Sprint de observabilidade | Coleta de dados sem política atualizada |
| `SENTRY_DSN` | Sprint de observabilidade | Não é secret de segurança; pode ser EXPO_PUBLIC |

---

> Este documento deve ser revisado a cada sprint que adicionar uma nova flag de comportamento ou funcionalidade de produção.
