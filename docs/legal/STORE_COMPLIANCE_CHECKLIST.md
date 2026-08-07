# Checklist de Compliance para Lojas — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01** · **revisado na Fase 5 (Bloco 3) · 2026-08-07**  
Preencher antes de cada submissão às lojas. Revisado pela auditoria 360.

> **Revisão da Fase 5 — divergência declarada.** Este checklist continha marcações `✓` que **não
> correspondiam à configuração real** do projeto. A revisão do Bloco 3 corrigiu cinco itens aqui e
> três no `STORE_RELEASE_READINESS_CHECKLIST.md`. Cada correção está enumerada, com o fato que a
> motivou, em [`docs/fase5-pareceres/03_PARECER_SDKS_E_CONFORMIDADE_DE_LOJAS.md`](../fase5-pareceres/03_PARECER_SDKS_E_CONFORMIDADE_DE_LOJAS.md) §6.
> **Não houve ajuste silencioso.**
>
> Um item novo e delicado foi levantado e **não** está resolvido: a tensão entre publicar na Kids
> Category e embarcar `react-native-purchases`, o único SDK de terceiro que faz chamada de rede
> automática. Ver §3.2 do parecer.

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
- [ ] Sem SDK de analytics invasivo ✓ (verificado na Fase 5: nenhum em `package.json`)
- [ ] Sem SDK de publicidade ✓ (verificado na Fase 5: nenhum em `package.json`)
- [ ] **SDK de terceiro com rede:** `react-native-purchases` (assinatura) — **único** do projeto.
  ⚠ **Verificar a compatibilidade com as regras da Kids Category antes de submeter.** Ver parecer
  do Bloco 3 §3.2 — decisão em aberto (E5.21)
- [ ] Manifesto de privacidade do SDK de assinatura no artefato compilado — ⚠ **NÃO RECUPERADO**
  (o pod nativo é resolvido em tempo de build; E5.22)

### Conteúdo infantil
- [ ] Categoria Kids selecionada no App Store Connect
  ⚠ **Decisão em aberto** — entrar na Kids Category tem consequência sobre o SDK de assinatura (E5.21)
- [ ] Classificação indicativa de conteúdo: **4+**
  (a alternativa "9+" que constava aqui foi **descartada** na Fase 5: o conteúdo não a justifica)
- [ ] **Faixa da Kids Category (campo separado da classificação):** a Apple admite **uma única**
  faixa, e as faixas de console têm corte entre 5 e 6 anos — a faixa oficial do produto (**4 a 8
  anos**) atravessa duas. A escolha **não** está decidida; ver E5.21
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
- [ ] Nome do app (máx 30 chars)
  ⚠ **Divergência aberta:** `app.json` declara `"name": "Beni"` — este é o nome que aparece sob o
  ícone no aparelho. Os documentos de loja vinham dizendo "Pequenos Traços de Fé". Os dois campos
  são distintos (nome no aparelho × nome na listagem), mas a divergência precisa ser decidida e
  registrada. Ver E5.28
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
  - [ ] Coleta de dados: **nenhum dado pessoal da criança** é compartilhado com terceiros
  - [ ] Dados coletados: nenhum pelo app. ⚠ **Verificar o enquadramento do SDK de assinatura** —
    ele transmite identificadores técnicos de dispositivo e de compra ao provedor (E5.23)
  - [ ] Práticas de segurança: **o app não é offline.** Há tráfego real (validação de assinatura e
    download de histórias). A antiga marcação "N/A offline" era **falsa** e foi removida na Fase 5.
    Responder conforme o tráfego que de fato existe
  - [ ] Solicitação de exclusão: ⚠ **atenção — o app NÃO possui exclusão total.** Existem três
    exclusões parciais (progresso, pinturas do Colorir com o Beni, criações do Criar Livre). Para
    apagar tudo, incluindo nome e avatar, só a desinstalação. Não responder "disponível" sem essa
    ressalva (E5.7)
- [ ] Termos de serviço [PLACEHOLDER]

### Conteúdo infantil
- [ ] Programa Families selecionado (se aplicável à política atual)
- [ ] Classificação de conteúdo preenchida no Play Console
- [ ] Target age group configurado — **selecionar AS DUAS faixas** que cobrem 4 a 8 anos
  (o Google Play admite **múltipla seleção**, então a faixa oficial do produto pode ser coberta sem
  escolher). A opção "5-8" que constava aqui **não existe** no console e foi removida na Fase 5
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
| PNG comprimidos — **110,2 MB só em PNG; 218 MB no diretório `assets/`**. O tamanho do bundle publicado **não foi medido** (exigiria build) | ✗ Pendente | Técnico |
| **Decidir se o app entra na Kids Category**, dada a presença do SDK de assinatura (E5.21) | ✗ Em aberto | Fundador + regra vigente da Apple |
| **Decidir o nome do app** — `app.json` diz `"Beni"`; os documentos diziam "Pequenos Traços de Fé" (E5.28) | ✗ Em aberto | Fundador |
| Ícone 512×512 para o Google Play — **não existe no repositório** (o `icon.png` é 1024×1024) (E5.29) | ✗ Pendente | Designer |
| Restore Purchase funcional (Apple obrigatório) | ✗ Placeholder | Técnico |
| Screenshots de todos os devices | ✗ Pendente | Designer |
| Metadata completa (título, desc, palavras-chave) | ✗ Pendente | Marketing |
| Classificação etária preenchida | ✗ Pendente | [PLACEHOLDER] |
| Data Safety form (Google) | ✗ Pendente | [PLACEHOLDER] |
| Privacy Nutrition Labels (Apple) | ✗ Pendente | [PLACEHOLDER] |
