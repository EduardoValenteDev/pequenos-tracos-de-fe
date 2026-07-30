# Auditoria de Build de Produção — Pequenos Traços de Fé

**Sprint 18.0 · 2026-06-01**  
Baseado em `app.json`, `eas.json`, `package.json`. Nenhum arquivo alterado.

---

## app.json — auditoria completa

### Identificadores
| Campo | Valor atual | Status | Observação |
|---|---|---|---|
| `name` | "Pequenos Traços de Fé" | ✓ | OK |
| `slug` | "pequenos-tracos-de-fe" | ✓ | OK |
| `version` | "1.0.0" | ✓ | Incrementar a cada release |
| `ios.bundleIdentifier` | `com.valentedev.pequenostracosdefe` | ✓ | Não alterar após publicação |
| `ios.buildNumber` | "1" | ⚠ | Incrementar a cada build de produção |
| `android.package` | `com.valentedev.pequenostracosdefe` | ✓ | Não alterar após publicação |
| `android.versionCode` | 1 | ⚠ | Incrementar a cada release |
| `owner` | "eduardocriacao" | ✓ | Username EAS |
| `extra.eas.projectId` | `ccf727af-...` | ✓ | EAS project ID |

### Aparência e layout
| Campo | Valor | Status |
|---|---|---|
| `orientation` | "portrait" | ✓ Correto para app infantil |
| `userInterfaceStyle` | "light" | ✓ Sem dark mode (simplifica UI) |
| `newArchEnabled` | true | ✓ Nova Arquitetura RN |
| `ios.supportsTablet` | true | ✓ Suporte a iPad |
| `androidStatusBar.translucent` | true | ✓ |
| `android.edgeToEdgeEnabled` | true | ✓ |

### Privacidade e segurança
| Campo | Valor | Status |
|---|---|---|
| `ios.config.usesNonExemptEncryption` | false | ✓ Obrigatório para App Store — chave corrigida em `945400b` (antes estava sob `ios.infoPlist`, onde o EAS não a lê) |
| `ios.privacyManifests.NSPrivacyTracking` | false | ✓ |
| `ios.privacyManifests.NSPrivacyCollectedDataTypes` | [] | ✓ |
| `ios.privacyManifests.NSPrivacyAccessedAPITypeReasons` | CA92.1 | ✓ |
| expo-audio.microphonePermission | false | ✓ |
| expo-audio.recordAudioAndroid | false | ✓ |
| `android.permissions` | ["MODIFY_AUDIO_SETTINGS"] | ✓ Mínimo necessário |
| `scheme` (deep link) | "pequenostracosdefe" | ⚠ Sem handlers implementados |

### Campos ausentes que devem ser adicionados
| Campo | Onde adicionar | Quando |
|---|---|---|
| `ios.privacyPolicyUrl` | `app.json` → `expo.ios` | Antes de submeter à Apple |
| `android.privacyPolicyUrl` | `app.json` → `expo.android` | Antes de submeter ao Google |

**Exemplo:**
```json
{
  "expo": {
    "ios": {
      "privacyPolicyUrl": "https://pequenostracosdefe.com/privacidade"
    },
    "android": {
      "privacyPolicyUrl": "https://pequenostracosdefe.com/privacidade"
    }
  }
}
```

---

## eas.json — auditoria completa

| Profile | Distribution | Build type | Uso correto? |
|---|---|---|---|
| `development` | internal | apk (Android) | ✓ Dev client local |
| `preview` | internal | apk | ✓ Testes internos |
| `production` | (store, implícito) | app-bundle (Android) | ✓ Submissão às lojas |

**Nota sobre iOS production:** `resourceClass: m-medium` está configurado. Suficiente para builds de produção.

**Ação necessária:** Confirmar que o profile `production` usa `distribution: "store"` explicitamente ao submeter:
```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

---

## package.json — scripts de build

| Script | Comando | Usa para |
|---|---|---|
| `build:preview:ios` | `eas build --platform ios --profile preview` | Testes internos iOS |
| `build:preview:android` | `eas build --platform android --profile preview` | Testes internos Android |
| `build:production:ios` | `eas build --platform ios --profile production` | App Store |
| `build:production:android` | `eas build --platform android --profile production` | Google Play |
| `build:preview` | `eas build --platform all --profile preview` | Ambos simultâneo |
| `build:production` | `eas build --platform all --profile production` | **Submissão final** |

---

## Versionamento — regras

### Android `versionCode`
- Inteiro positivo crescente
- Nunca pode diminuir após publicação
- Incrementar a **cada APK/AAB** submetido ao Google Play
- Regra: `versionCode = (versão semântica major * 100 + minor * 10 + patch) * 10 + build_number`
- Exemplo simples: 1.0.0 build 1 → versionCode: 1001

### iOS `buildNumber`
- String, pode ser "1.0.0.1" ou simplesmente "1", "2", "3"
- Incrementar a cada build enviado ao App Store Connect (incluindo TestFlight)
- Nunca pode reutilizar um buildNumber para a mesma versão

### Regra prática para este projeto
- `version` (semântico): Incrementar em releases públicas
- `versionCode`: Incrementar em todo build de produção/preview submetido
- `buildNumber`: Idem

---

## Flags de produção — estado atual

| Flag | Arquivo | Valor | Correto? |
|---|---|---|---|
| `ENABLE_LOCAL_PREMIUM_TEST_MODE` | `src/services/accessControl.js` | `false` | ✓ |
| `ALLOW_COMING_SOON_PREVIEW` | `src/services/accessControl.js` | `false` | ✓ |
| `__DEV__` | Runtime RN | `false` em produção | ✓ Automático |
| Logs de produção | `src/utils/logger.js` | Guarda `__DEV__` | ✓ (Sprint 17) |

---

## Runtime version e OTA

**Status:** Nenhuma configuração de `expo-updates` ou `runtimeVersion` encontrada.  
**Conclusão:** OTA (Over-The-Air updates) **não está configurado**. Correto para a fase atual.

Quando OTA for necessário (pós-lançamento, para hotfixes JS sem resubmeter):
```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "sdkVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/[project-id]"
    }
  }
}
```
**Não ativar agora** — adiciona complexidade sem benefício no MVP.

---

## Checklist pré-build de produção

```bash
# 1. Verificar flags de produção
grep "ENABLE_LOCAL_PREMIUM_TEST_MODE" src/services/accessControl.js
# → false ✓

# 2. Verificar versões
grep '"version"\|"versionCode"\|"buildNumber"' app.json
# → Incrementar se necessário

# 3. Smoke completo
npm run smoke
# → 600/600 ✓

# 4. expo-doctor
npx expo-doctor
# → Verificar se algum check falhou

# 5. Bundle size (após build)
# Ver EAS dashboard ou:
# eas build:list --platform android --limit 1

# 6. Build
eas build --platform android --profile production
```

---

## Alertas de segurança pré-submissão

| Item | Como verificar |
|---|---|
| Sem secrets no bundle | `grep -rn "API_KEY\|token\|secret\|password" src/` |
| Sem log de dados pessoais | `grep -rn "console\." src/ | grep -v "__DEV__\|logger"` |
| `ENABLE_LOCAL_PREMIUM_TEST_MODE = false` | `npm run smoke` |
| Bundle size aceitável | Verificar no EAS dashboard após build |
