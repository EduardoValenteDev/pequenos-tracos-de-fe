# Store Release Readiness Checklist — Pequenos Traços de Fé

**Sprint 18.0 · 2026-06-01** · **revisado na Fase 5 (Bloco 3) · 2026-08-07**  
Verificar cada item antes de submeter às lojas. Revisado após cada sprint.

> **Revisão da Fase 5 — divergência declarada.** Três marcações deste documento estavam **falsas ou
> defasadas** (contagem do smoke, peso das imagens, nome do app) e duas estavam **incorretas quanto
> ao fato** (exclusão de dados e faixa etária de console). Todas foram corrigidas, cada uma com o
> fato que a motivou enumerado em
> [`docs/fase5-pareceres/03_PARECER_SDKS_E_CONFORMIDADE_DE_LOJAS.md`](fase5-pareceres/03_PARECER_SDKS_E_CONFORMIDADE_DE_LOJAS.md) §6.
> **Não houve ajuste silencioso.**

---

## Status geral

| Loja | Status | Bloqueadores restantes |
|---|---|---|
| Apple App Store | ⚠ Em preparação | URL política, Restore Purchase real, screenshots, metadata, **decisão Kids Category × SDK de assinatura**, **nome do app**, Nutrition Label reexaminada |
| Google Play | ⚠ Em preparação | URL política, PNG comprimidos, Data Safety form, screenshots, metadata, **nome do app**, **ícone 512×512** |

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
- [ ] `npm run smoke` → **4525/4525** ✓ (a marcação anterior dizia "600/600" e estava defasada)
- [ ] `npx expo-doctor` → 0 failed (⚠ 2 packages out of date)
- [ ] Bundle size < 150 MB ⚠ **medição corrigida na Fase 5:** o diretório `assets/` tem **218 MB**,
  sendo **110,2 MB só em PNG** (98 arquivos). A marcação anterior de "~65 MB apenas de imagens"
  estava errada por quase o dobro. **O tamanho do bundle publicado NÃO FOI MEDIDO** — diretório-fonte
  não é bundle, e medir exigiria build (E5.26)
- [ ] Sem crash em qualquer tela principal
- [ ] Sem tela branca por asset ausente ✓ (fallbacks implementados)

---

## Apple App Store

### Privacy Nutrition Labels (App Store Connect)
- [ ] ⚠ **NÃO declarar "Data Not Collected" sem reexame.** A Nutrition Label é campo de console e
  deve refletir também o que os SDKs embarcados coletam — e o app embarca `react-native-purchases`,
  que transmite identificadores técnicos de dispositivo e de compra. Declarar "nada coletado"
  enquanto se embarca esse SDK é inconsistência detectável pela Apple (E5.23 · P-92 · Fase 20)
- [ ] Name (local only) → declarar como "Data Not Linked to You"
- [ ] `NSPrivacyTracking: false` ✓ (`app.json`)
- [ ] `NSPrivacyCollectedDataTypes: []` ✓ (`app.json`)
- [ ] Privacy manifest com CA92.1 ✓ (`app.json`)

### Kids Category
- [ ] Categoria Kids selecionada no App Store Connect
  ⚠ **Decisão em aberto (E5.21).** Entrar na Kids Category tem consequência sobre o SDK de
  assinatura, único terceiro do projeto a fazer chamada de rede automática. Resolver **antes** de
  submeter — ver parecer do Bloco 3 §3.2
- [ ] Classificação indicativa de conteúdo: **4+**
- [ ] Faixa da Kids Category (campo **separado** da classificação): a Apple admite **uma única**
  faixa e o corte das faixas de console fica entre 5 e 6 anos, enquanto a faixa oficial do produto é
  **4 a 8 anos** — ela atravessa duas. A escolha não está decidida (E5.21)
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
- [ ] Nome (30 chars max) ⚠ **divergência aberta:** `app.json` declara `"name": "Beni"` — é esse o
  nome que aparece sob o ícone no aparelho. Este documento vinha marcando "Pequenos Traços de Fé"
  com `✓`, o que **não correspondia à configuração**. Decidir e registrar (E5.28)
- [ ] Subtítulo (30 chars max): `[PLACEHOLDER]`
- [ ] Descrição curta (170 chars): `[PLACEHOLDER]`
- [ ] Descrição longa (4000 chars max): `[PLACEHOLDER]`
- [ ] Palavras-chave (100 chars max): `[PLACEHOLDER]`
- [ ] Categoria primária: Education
- [ ] Categoria secundária: `[PLACEHOLDER]`

### Assets de loja
- [ ] Ícone 1024×1024 (PNG, sem alpha, sem texto, sem bordas)
  ✓ **dimensão e ausência de alfa verificadas** na Fase 5 (`assets/icon.png`, 1024×1024, colorType 3).
  ⚠ ausência de texto, ausência de cantos arredondados pré-aplicados e legibilidade em tamanho
  pequeno **exigem olho humano** e continuam não verificadas (E5.25)
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
- [ ] "Is all of the user data collected encrypted in transit?" → ⚠ **a resposta "N/A (sem
  transmissão)" era falsa.** O app faz tráfego real (validação de assinatura e download de
  histórias). Responder conforme o tráfego que de fato existe
- [ ] "Do you provide a way for users to request that their data is deleted?" → ⚠ **atenção:** o app
  tem **três exclusões parciais**, não exclusão total. Para apagar tudo, incluindo nome e avatar, só
  a desinstalação. A resposta anterior ("Sim — limpar progresso") era imprecisa (E5.7)
- [ ] Formulário revisado e submetido

### Families Policy
- [ ] Target age group configurado — **selecionar AS DUAS faixas** que cobrem 4 a 8 anos. O Google
  Play admite **múltipla seleção**, então aqui não é preciso escolher. A opção "Ages 5–8" que
  constava **não existe** no console; o "verificar com equipe" fica resolvido (E5.31)
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
- [ ] Título (50 chars max) ⚠ mesma divergência de nome do lado Apple — `app.json` diz `"Beni"` (E5.28)
- [ ] Descrição curta (80 chars max): `[PLACEHOLDER]`
- [ ] Descrição longa (4000 chars max): `[PLACEHOLDER]`
- [ ] Categoria: Education (ou Family → Education)
- [ ] Tags: `[PLACEHOLDER]`

### Assets de loja
- [ ] Ícone 512×512 (PNG, sem alpha) ⚠ **não existe no repositório.** `assets/icon.png` é
  **1024×1024**, sem canal alfa (verificado por leitura do cabeçalho PNG). Falta gerar o 512×512 do
  Play Console (E5.29)
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
| 3 | PNG comprimidos — **110,2 MB só em PNG, 218 MB em `assets/`**; bundle publicado **não medido** | Manual (pngquant) |
| 4 | Restore Purchase real (Apple obrigatório) | Sprint 21 |
| 5 | Screenshots de todos os devices | Designer |
| 6 | Metadata completa (descrições, palavras-chave) | Marketing/Produto |
| 7 | Classificação etária preenchida nas consoles | [PLACEHOLDER] |
| 8 | Data Safety Form (Google) | [PLACEHOLDER] |
| 9 | Conta de desenvolvedor Apple ($99/ano) | [PLACEHOLDER] |
| 10 | Conta de desenvolvedor Google ($25 único) | [PLACEHOLDER] |
| 11 | **Decidir se o app entra na Kids Category**, dada a presença do SDK de assinatura — único terceiro com chamada de rede automática (E5.21) | Fundador + regra vigente da Apple |
| 12 | **Decidir o nome do app** — `app.json` declara `"Beni"`, os documentos diziam "Pequenos Traços de Fé" (E5.28) | Fundador |
| 13 | Ícone 512×512 para o Google Play — **não existe** no repositório (E5.29) | Designer |
| 14 | Manifesto de privacidade do SDK de assinatura no artefato compilado — **NÃO RECUPERADO** (E5.22) | Verificação no build / provedor |

> **Itens 11 a 14 acrescentados na revisão da Fase 5 (Bloco 3).** Nenhum deles existia neste
> documento antes, e nenhum é resolvido por ele.
