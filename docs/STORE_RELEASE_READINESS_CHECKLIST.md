# Store Release Readiness Checklist — Pequenos Traços de Fé

**Sprint 18.0 · 2026-06-01**  
Verificar cada item antes de submeter às lojas. Revisado após cada sprint.

---

## Status geral

| Loja | Status | Bloqueadores restantes |
|---|---|---|
| Apple App Store | ⚠ Em preparação | URL política, Restore Purchase real, screenshots, metadata |
| Google Play | ⚠ Em preparação | URL política, PNG comprimidos, Data Safety form, screenshots, metadata |

---

## Itens que se aplicam às DUAS lojas

### Legais e privacidade
- [ ] Política de privacidade publicada em URL pública permanente  
  URL: `[PLACEHOLDER]`
- [ ] URL da política adicionada em `app.json` (`expo.ios.privacyPolicyUrl` + `expo.android.privacyPolicyUrl`)
- [ ] Termos de uso publicados em URL pública  
  URL: `[PLACEHOLDER]`
- [ ] URL dos termos visível na Área dos Pais do app
- [ ] Data de última atualização da política visível
- [ ] Canal de contato para exercício de direitos LGPD funcionando

### Conteúdo infantil
- [ ] Parental gate em TODAS as ações adultas ✓ (implementado)
- [ ] Sem links externos acessíveis diretamente pela criança ✓
- [ ] Sem publicidade comportamental ✓
- [ ] Sem chat aberto ou comunicação entre usuários ✓
- [ ] Sem conteúdo inadequado para faixa etária ✓
- [ ] Sem pressão de compra diretamente na criança ✓

### Monetização
- [ ] Compras protegidas por área dos pais ✓ (parental gate presente)
- [ ] Restore Purchase implementado e funcional  
  ⚠ Atual: placeholder honesto (não conectado a IAP real)
- [ ] Texto de renovação automática descrito claramente (se aplicável)
- [ ] Reembolsos via loja apenas (sem promessa de reembolso direto)

### Dados coletados
- [ ] Sem SDK de analytics invasivo ✓
- [ ] Sem coleta de localização ✓
- [ ] Sem coleta de e-mail de criança ✓
- [ ] Microfone desabilitado ✓
- [ ] Câmera não solicitada ✓
- [ ] Dados ficam no dispositivo local ✓

### Build técnico
- [ ] `ENABLE_LOCAL_PREMIUM_TEST_MODE = false` ✓ (verificado no smoke)
- [ ] `ALLOW_COMING_SOON_PREVIEW = false` ✓
- [ ] Sem segredos hardcoded no bundle ✓
- [ ] `npm run smoke` → 600/600 ✓
- [ ] `npx expo-doctor` → 0 failed (⚠ 2 packages out of date)
- [ ] Bundle size < 150 MB (⚠ PNG ainda não comprimido — ~65 MB apenas de imagens)
- [ ] Sem crash em qualquer tela principal
- [ ] Sem tela branca por asset ausente ✓ (fallbacks implementados)

---

## Apple App Store

### Privacy Nutrition Labels (App Store Connect)
- [ ] Data Not Collected (nenhum dado enviado a servidores) → declarar corretamente
- [ ] Name (local only) → declarar como "Data Not Linked to You"
- [ ] `NSPrivacyTracking: false` ✓ (`app.json`)
- [ ] `NSPrivacyCollectedDataTypes: []` ✓ (`app.json`)
- [ ] Privacy manifest com CA92.1 ✓ (`app.json`)

### Kids Category
- [ ] Categoria Kids selecionada no App Store Connect
- [ ] Classificação etária: 4+ (recomendado para 3-8 anos)
- [ ] Confirmação de que o app se destina a crianças (Kid Apps section preenchida)
- [ ] Nenhum anúncio de terceiros ✓
- [ ] Parental gate implementado ✓

### Build e certificados
- [ ] `bundleIdentifier: com.valentedev.pequenostracosdefe` ✓
- [ ] `buildNumber` incrementado (atual: "1")
- [ ] `usesNonExemptEncryption: false` ✓
- [ ] Perfil de distribuição válido (production, não development)
- [ ] EAS production profile: `eas build --platform ios --profile production`

### Metadata do app
- [ ] Nome: "Pequenos Traços de Fé" (30 chars max) ✓
- [ ] Subtítulo (30 chars max): `[PLACEHOLDER]`
- [ ] Descrição curta (170 chars): `[PLACEHOLDER]`
- [ ] Descrição longa (4000 chars max): `[PLACEHOLDER]`
- [ ] Palavras-chave (100 chars max): `[PLACEHOLDER]`
- [ ] Categoria primária: Education
- [ ] Categoria secundária: `[PLACEHOLDER]`

### Assets de loja
- [ ] Ícone 1024×1024 (PNG, sem alpha, sem texto, sem bordas)
- [ ] Screenshots iPhone 6.7" (1290×2796): mínimo 1, recomendado 5-8
- [ ] Screenshots iPhone 6.5" (1242×2688): mínimo 1
- [ ] Screenshots iPhone 5.5" (1242×2208): mínimo 1
- [ ] Screenshots iPad Pro 12.9" (2048×2732): se `supportsTablet: true` ← obrigatório
- [ ] App Preview video (opcional, mas recomendado para apps infantis)

### TestFlight
- [ ] Build de preview testado internamente ✓ (EAS preview)
- [ ] Build de produção testado via TestFlight antes de submissão
- [ ] Notas de teste para Apple Review escritas em inglês

---

## Google Play

### Data Safety Form (Play Console)
- [ ] "Does your app collect or share any of the required user data types?" → Responder honestamente
  - Name: Sim (local only, não compartilhado) — verificar enquadramento com advogado
  - Outros: Não
- [ ] "Is all of the user data collected encrypted in transit?" → N/A (sem transmissão)
- [ ] "Do you provide a way for users to request that their data is deleted?" → Sim (limpar progresso)
- [ ] Formulário revisado e submetido

### Families Policy
- [ ] Target age group configurado: "Ages 5–8" ou "Ages 6–8" (verificar com equipe)
- [ ] Programa Families selecionado (se aplicável)
- [ ] Sem anúncios de interesse baseado em comportamento ✓
- [ ] Sem coleta de Device ID para crianças ✓
- [ ] Sem link para conteúdo adulto ✓

### Permissões declaradas
- [ ] `android.permission.MODIFY_AUDIO_SETTINGS` — justificativa: reprodução de narração ✓
- [ ] Sem `CAMERA`, `MICROPHONE`, `ACCESS_FINE_LOCATION`, `READ_CONTACTS` ✓
- [ ] `recordAudioAndroid: false` ✓ (`app.json`)

### Build e publicação
- [ ] `package: com.valentedev.pequenostracosdefe` ✓
- [ ] `versionCode` incrementado (atual: 1)
- [ ] Build type: `app-bundle` para produção ✓ (`eas.json`)
- [ ] Bundle size < 150 MB ⚠ (PNG precisa ser comprimido primeiro)
- [ ] EAS production: `eas build --platform android --profile production`

### Metadata do app
- [ ] Título (50 chars max): "Pequenos Traços de Fé" ✓
- [ ] Descrição curta (80 chars max): `[PLACEHOLDER]`
- [ ] Descrição longa (4000 chars max): `[PLACEHOLDER]`
- [ ] Categoria: Education (ou Family → Education)
- [ ] Tags: `[PLACEHOLDER]`

### Assets de loja
- [ ] Ícone 512×512 (PNG, sem alpha) ✓ (verificar `assets/icon.png`)
- [ ] Feature graphic 1024×500 (PNG ou JPEG): `[PLACEHOLDER]`
- [ ] Screenshots phone: mínimo 2, recomendado 8 (1080×1920 ou similar)
- [ ] Screenshots 7" tablet: recomendado
- [ ] Screenshots 10" tablet: recomendado (se `supportsTablet: true`)

### Internal Testing
- [ ] Grupo de testadores internos criado no Play Console
- [ ] Build de preview instalado e testado em device Android real
- [ ] Build AAB de produção testado via Internal Testing antes de produção

---

## Classificação indicativa de conteúdo

| Região | Sistema | Classificação recomendada |
|---|---|---|
| Brasil | DJCTQ (via Play Console/App Store) | Livre (L) — sem violência, sem linguagem adulta |
| EUA | ESRB / iTunes (via Apple) | 4+ ou Everyone |
| Europa | PEGI | 3 |

---

## Itens bloqueadores para lançamento

| # | Item | Sprint |
|---|---|---|
| 1 | Política de privacidade publicada em URL | Decisão humana |
| 2 | Termos de uso publicados em URL | Decisão humana |
| 3 | PNG comprimidos (bundle < 150 MB) | Manual (pngquant) |
| 4 | Restore Purchase real (Apple obrigatório) | Sprint 21 |
| 5 | Screenshots de todos os devices | Designer |
| 6 | Metadata completa (descrições, palavras-chave) | Marketing/Produto |
| 7 | Classificação etária preenchida nas consoles | [PLACEHOLDER] |
| 8 | Data Safety Form (Google) | [PLACEHOLDER] |
| 9 | Conta de desenvolvedor Apple ($99/ano) | [PLACEHOLDER] |
| 10 | Conta de desenvolvedor Google ($25 único) | [PLACEHOLDER] |
