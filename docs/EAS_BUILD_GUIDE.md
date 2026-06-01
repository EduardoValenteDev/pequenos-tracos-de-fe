# EAS_BUILD_GUIDE — Pequenos Traços de Fé

**Sprint 15 — Preparação de Build Real com EAS**
**Hotfix Sprint 15.1 — Ajustes finais de Build Readiness**
**Última atualização:** 2026-05-27

---

## 1. Pré-requisitos (uma vez, antes do primeiro build)

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Fazer login na conta Expo (criar conta gratuita em expo.dev se necessário)
eas login

# Vincular este projeto ao EAS (gera projectId em app.json)
eas init
```

Após `eas init`, o `app.json` receberá um campo `"extra": { "eas": { "projectId": "..." } }`.
Fazer commit desse campo.

---

## 2. Perfis de build (`eas.json`)

| Perfil | Distribuição | iOS | Android | Uso |
|---|---|---|---|---|
| `development` | internal | device real | APK | Dev com expo-dev-client |
| `preview` | internal | Ad Hoc IPA | APK | QA interna antes de lançar |
| `production` | store | App Store IPA | AAB (App Bundle) | Submissão final |

---

## 3. Ordem recomendada do primeiro build

**Começar por Android** — não exige conta paga, feedback imediato no device.

```
1. eas login
2. eas init
3. npm run smoke
4. npm run audio:audit
5. npx expo-doctor
6. npx expo install --check
7. npm run build:preview:android    ← PRIMEIRO BUILD
```

Apenas quando a conta Apple Developer estiver ativa e o Bundle ID criado no App Store Connect:

```
8. npm run build:preview:ios
```

---

## 4. Comandos de build

```bash
# Preview Android (APK) — primeiro build recomendado
npm run build:preview:android

# Preview iOS (Ad Hoc IPA) — requer Apple Developer Account
npm run build:preview:ios

# Preview — ambas as plataformas ao mesmo tempo
npm run build:preview

# Produção — separado por plataforma
npm run build:production:ios
npm run build:production:android

# Produção — ambas as plataformas ao mesmo tempo
npm run build:production
```

> **Submissão às lojas** — configurar separadamente quando as contas Apple/Google estiverem ativas.
> Não há scripts de submit nesta versão. Eles serão adicionados quando o app estiver pronto para lançamento.

---

## 5. Checklist antes do primeiro build Android

- [ ] `eas login` executado
- [ ] `eas init` executado (projectId em app.json)
- [ ] `npm run smoke` passando (562+/562 checks)
- [ ] `npm run audio:audit` — passa (0/200 ready enquanto sem áudios reais; o número subirá conforme entregas)
- [ ] `npx expo-doctor` — 18/18 checks
- [ ] Device Android com "Fontes desconhecidas" habilitado (para instalar APK preview)
- [ ] `versionCode` incrementado se este for um rebuild

---

## 6. Checklist antes do primeiro build iOS

- [ ] Conta Apple Developer ativa (USD 99/ano)
- [ ] Bundle ID `com.valentedev.pequenostracosdefe` criado no App Store Connect
- [ ] Certificados e provisioning profile (EAS gerencia automaticamente)
- [ ] `buildNumber` incrementado se este for um rebuild
- [ ] Dispositivos de teste registrados no portal Apple (para Ad Hoc)

---

## 7. Regra de versão — nunca regredir

| Campo | Quando incrementar |
|---|---|
| `version` (semântica) | Nova versão visível ao usuário (1.0.0 → 1.1.0) |
| `buildNumber` (iOS) | **Toda** submissão ao TestFlight ou App Store |
| `versionCode` (Android) | **Toda** submissão ao Play Console |

`buildNumber` e `versionCode` são valores que a loja nunca aceita repetidos.

---

## 8. iOS Privacy Manifest — configuração ativa

Configurado nativamente via `expo.ios.privacyManifests` no `app.json` (suportado desde Expo SDK 50). O Expo gera o `PrivacyInfo.xcprivacy` automaticamente durante o build EAS.

```json
"privacyManifests": {
  "NSPrivacyAccessedAPITypes": [
    {
      "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
      "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
    }
  ],
  "NSPrivacyCollectedDataTypes": [],
  "NSPrivacyTracking": false,
  "NSPrivacyTrackingDomains": []
}
```

**O app não rastreia usuários, não coleta dados pessoais, não usa IDFA, não usa SDKs de anúncios ou analytics.**

Os pacotes `@react-native-async-storage/async-storage` e `expo-audio` incluem seus próprios Privacy Manifests internamente.

---

## 9. Identificadores do app — valores canônicos

| Campo | Valor |
|---|---|
| iOS `bundleIdentifier` | `com.valentedev.pequenostracosdefe` |
| Android `package` | `com.valentedev.pequenostracosdefe` |
| Expo `slug` | `pequenos-tracos-de-fe` |
| Deep link `scheme` | `pequenostracosdefe` |
| App `name` | `Pequenos Traços de Fé` |

Esses valores devem ser iguais em `app.json`, `eas.json` e qualquer documentação de loja.

---

## 10. Ausência intencional de OTA nesta versão

`expo-updates` **não está instalado** neste projeto. OTA (Over-the-Air updates) será configurado em Sprint futuro após a primeira publicação em loja.

Para adicionar OTA no futuro:
```bash
npx expo install expo-updates
eas update --channel production --message "descricao do update"
```

---

## 11. Assets para a loja — status

| Asset | Dimensão | Status |
|---|---|---|
| `assets/icon.png` | 1024×1024 | ✅ correto |
| `assets/adaptive-icon.png` | 1024×1024 | ✅ correto |
| `assets/splash-icon.png` | 1024×1024 | ✅ aceito (resizeMode: contain) |
| `assets/favicon.png` | 48×48 | ✅ correto |
| Screenshots App Store | 6,5" e 5,5" mínimo | ⏳ capturar no simulador |
| Screenshots Play Store | 16:9 mínimo | ⏳ capturar no emulador |
