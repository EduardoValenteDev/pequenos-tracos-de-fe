# Checklist de Compliance para Lojas — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**  
Preencher antes de cada submissão às lojas. Revisado pela auditoria 360.

---

## Apple App Store — Kids Category

### Privacidade e dados
- [ ] Política de privacidade publicada em URL pública e permanente
- [ ] URL da política de privacidade adicionada em `app.json` (`expo.ios.privacyPolicyUrl`)
- [ ] Termos de uso publicados (recomendado)
- [ ] Privacy Nutrition Labels preenchidas no App Store Connect
- [ ] `NSPrivacyTracking: false` em `privacyManifests` ✓ (configurado)
- [ ] `NSPrivacyCollectedDataTypes: []` em `privacyManifests` ✓ (configurado)
- [ ] `usesNonExemptEncryption: false` em `app.json` ✓ (configurado)
- [ ] Privacy manifest com razão `CA92.1` para UserDefaults ✓ (configurado)
- [ ] Sem SDK de analytics invasivo ✓
- [ ] Sem SDK de publicidade ✓

### Conteúdo infantil
- [ ] Categoria Kids selecionada no App Store Connect
- [ ] Classificação etária correta (4+ ou 9+)
- [ ] Sem links externos acessíveis por crianças sem gate parental ✓
- [ ] Sem chat aberto ✓
- [ ] Sem conteúdo gerado por usuários sem moderação ✓
- [ ] Sem publicidade comportamental ✓

### Compras e monetização
- [ ] Todos os produtos IAP registrados no App Store Connect
- [ ] Preços configurados nas lojas
- [ ] Botão "Restaurar compra" implementado e funcional ⚠ (placeholder atual)
- [ ] Compras protegidas por área dos pais ✓ (gated pela ParentalGate)
- [ ] Texto de assinatura com renovação automática claramente descrito (se aplicável)
- [ ] Cancelamento de assinatura documentado nos termos

### Build e técnico
- [ ] `bundleIdentifier` único e definitivo ✓ (`com.valentedev.pequenostracosdefe`)
- [ ] `buildNumber` incrementado para cada build de produção
- [ ] Ícone 1024×1024 sem alpha, sem texto
- [ ] Screenshots para todos os tamanhos obrigatórios (6.7", 6.5", 5.5", iPad Pro)
- [ ] `supportsTablet: true` ✓
- [ ] `orientation: portrait` ✓
- [ ] EAS production profile configurado ✓
- [ ] `newArchEnabled: true` ✓
- [ ] `ENABLE_LOCAL_PREMIUM_TEST_MODE = false` ✓

### Conteúdo da loja
- [ ] Nome do app (máx 30 chars): "Pequenos Traços de Fé"
- [ ] Subtítulo (máx 30 chars): [PLACEHOLDER]
- [ ] Descrição curta [PLACEHOLDER]
- [ ] Descrição completa [PLACEHOLDER]
- [ ] Palavras-chave (máx 100 chars) [PLACEHOLDER]
- [ ] Categoria primária: Education
- [ ] Categoria secundária: [PLACEHOLDER — ex: Entertainment]

---

## Google Play — Families Policy

### Privacidade e dados
- [ ] Política de privacidade publicada e URL adicionada no Play Console
- [ ] Data Safety Form preenchido no Play Console
  - [ ] Coleta de dados: nenhum dado compartilhado com terceiros
  - [ ] Dados coletados: nenhum (ou "Nome" local — verificar enquadramento)
  - [ ] Práticas de segurança: dados criptografados em trânsito (N/A offline)
  - [ ] Solicitação de exclusão: disponível (desinstalação ou limpar progresso)
- [ ] Termos de serviço [PLACEHOLDER]

### Conteúdo infantil
- [ ] Programa Families selecionado (se aplicável à política atual)
- [ ] Classificação de conteúdo preenchida no Play Console
- [ ] Target age group configurado (5-8 ou 6-8)
- [ ] Sem anúncios de interesse baseado em dados ✓
- [ ] Sem coleta de ID persistente para crianças ✓
- [ ] Sem deep link não verificado para conteúdo adulto ✓

### Permissões
- [ ] `android.permission.MODIFY_AUDIO_SETTINGS` — justificada (reprodução de áudio) ✓
- [ ] Sem permissão de câmera ✓
- [ ] Sem permissão de microfone (flag `recordAudioAndroid: false`) ✓
- [ ] Sem permissão de localização ✓
- [ ] Sem permissão de contatos ✓

### Compras
- [ ] Produtos no Google Play Console configurados
- [ ] Billing API integrada
- [ ] Restore Purchase implementado ⚠ (placeholder atual)
- [ ] Botão de compra acessível apenas por adultos ✓

### Build e técnico
- [ ] `package` único: `com.valentedev.pequenostracosdefe` ✓
- [ ] `versionCode` incrementado para cada release
- [ ] AAB gerado (não APK) para produção ✓ (`buildType: app-bundle`)
- [ ] Bundle size < 150 MB ⚠ (PNG precisa ser comprimido)
- [ ] `edgeToEdgeEnabled: true` ✓
- [ ] `adaptiveIcon` configurado ✓

### Conteúdo da loja
- [ ] Título (máx 50 chars) [PLACEHOLDER]
- [ ] Descrição curta (máx 80 chars) [PLACEHOLDER]
- [ ] Descrição completa (máx 4000 chars) [PLACEHOLDER]
- [ ] Screenshots (mín 2, recomendado 8): phone + tablet
- [ ] Ícone 512×512 ✓ (verificar qualidade)
- [ ] Feature graphic 1024×500 [PLACEHOLDER]

---

## Itens bloqueadores antes de qualquer submissão

| Item | Estado | Responsável |
|---|---|---|
| Política de privacidade publicada em URL | ✗ Pendente | [PLACEHOLDER] |
| Termos de uso publicados | ✗ Pendente | [PLACEHOLDER] |
| PNG comprimidos (bundle < 150 MB) | ✗ Pendente | Técnico |
| Restore Purchase funcional (Apple obrigatório) | ✗ Placeholder | Técnico |
| Screenshots de todos os devices | ✗ Pendente | Designer |
| Metadata completa (título, desc, palavras-chave) | ✗ Pendente | Marketing |
| Classificação etária preenchida | ✗ Pendente | [PLACEHOLDER] |
| Data Safety form (Google) | ✗ Pendente | [PLACEHOLDER] |
| Privacy Nutrition Labels (Apple) | ✗ Pendente | [PLACEHOLDER] |
