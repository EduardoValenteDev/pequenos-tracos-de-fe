# Fase 5 · Bloco 3 — Parecer de SDKs e conformidade de lojas

**Fase:** 5 — Infância, privacidade, teologia e medição
**Bloco:** 3 — SDKs e conformidade de lojas
**Data:** 2026-08-07
**Natureza:** documental
**Blocos anteriores:** [`00_ABERTURA_E_RASTREABILIDADE.md`](00_ABERTURA_E_RASTREABILIDADE.md) ·
[`01_PARECER_ADEQUACAO_ETARIA_E_LINGUAGEM.md`](01_PARECER_ADEQUACAO_ETARIA_E_LINGUAGEM.md) ·
[`02_PARECER_PRIVACIDADE_E_DADOS.md`](02_PARECER_PRIVACIDADE_E_DADOS.md)

---

## 0. O que este bloco é e o que ele não é

**É** o parecer sobre **quais bibliotecas de terceiros o app carrega**, o que elas implicam para
Apple Kids Category e Google Play Families, e **quais afirmações dos checklists de loja não se
sustentam** contra a configuração real.

**Não é:**

- **aprovação de submissão.** Nenhuma frase aqui diz "pronto para submeter", "conforme" ou
  "aprovado pelas lojas";
- **transcrição das regras das lojas.** Este parecer **não cita a redação vigente** das App Review
  Guidelines nem da Families Policy. Regras de loja mudam; a redação em vigor deve ser lida na fonte
  no momento da submissão. Onde o parecer depende dessa redação, ele **diz que depende**;
- **alteração de runtime.** `app.json`, `eas.json`, `package.json` e `plugins/` foram **lidos**, não
  alterados.

---

## 1. Método e qualidade da evidência

| Item | Como foi obtido | Confiabilidade |
|---|---|---|
| Inventário de dependências | leitura integral de `package.json` | **máxima** |
| Configuração nativa | leitura integral de `app.json` e `eas.json` | **máxima** |
| Manifestos de privacidade dos módulos | leitura dos `PrivacyInfo.xcprivacy` em `node_modules` | **alta** |
| Dimensões e alfa dos ícones | leitura do cabeçalho IHDR dos PNG | **máxima** |
| Peso dos assets | medição do diretório `assets/` | **alta** — é o diretório-fonte, **não** o bundle |
| Manifesto de privacidade do SDK de assinatura no app compilado | pod nativo resolvido em tempo de build | **NÃO RECUPERADO** — §3.3 |
| Tamanho real do bundle publicado | exigiria build | **NÃO RECUPERADO** — §7.2 |

---

## 2. Inventário completo de dependências

**31 dependências de runtime + 1 de desenvolvimento.** Nenhuma outra.

### 2.1 Classificação por implicação de privacidade

| Classe | Pacotes | Rede? | Dado pessoal? |
|---|---|---|---|
| **Núcleo React Native / Expo** | `expo`, `react`, `react-native`, `babel-preset-expo`, `expo-status-bar`, `expo-asset`, `expo-font` | não | não |
| **Navegação** | `@react-navigation/native`, `/stack`, `/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler` | não | não |
| **Renderização e animação** | `react-native-reanimated`, `react-native-worklets`, `react-native-svg`, `expo-image`, `expo-linear-gradient`, `lottie-react-native`, `@expo/vector-icons` | não | não |
| **Canvas (Ateliê/Colorir)** | `react-native-webview` | **não** — o WebView carrega HTML **local**, não URL remota | conteúdo do desenho, **sem sair do aparelho** |
| **Armazenamento** | `@react-native-async-storage/async-storage`, `expo-file-system` | não | **guarda** dado local (Bloco 2) |
| **Áudio e tato** | `expo-audio`, `expo-haptics` | não | não — microfone desligado por configuração |
| **Tipografia** | `@expo-google-fonts/fraunces`, `/fredoka-one`, `/nunito` | **não** — fontes empacotadas no bundle | não |
| **Criptografia** | `@noble/hashes` | não | não — hash puro, sem rede |
| **Ferramenta de desenvolvimento** | `expo-dev-client` | — | ver §2.2 |
| **Assinatura (terceiro real)** | **`react-native-purchases` 10.4.1** | **SIM** | ver §3 |
| **Build-time apenas** | `sharp` (devDependency) | — | não embarca no app |

### 2.2 O que **não** está instalado — verificado por ausência em `package.json`

Nenhum SDK de **analytics** · **publicidade** · **atribuição** · **crash reporting** ·
**A/B testing** · **push** · **mapa** · **login social** · **`expo-updates`** ·
**`expo-tracking-transparency`** · **`expo-location`** · **`expo-camera`** ·
**`expo-media-library`** · **`expo-notifications`**.

Isto **corrobora por evidência independente** a conclusão do Bloco 2 (§3) obtida por leitura de
`app.json`: o app não tem superfície de rastreamento.

### 2.3 `expo-dev-client` — ponto de atenção declarado

`expo-dev-client` está em **`dependencies`**, não em `devDependencies`. Em `eas.json` apenas o perfil
`development` liga `developmentClient: true`; `production` **não liga**. A expectativa é que o
cliente de desenvolvimento não fique ativo no build de produção.

> **Isto não foi verificado no artefato compilado** — verificar exigiria build, o que esta fase não
> pode fazer. Classificado como item de verificação em build (E5.24), **não** como defeito.

---

## 3. O único SDK de terceiro com implicação de dados

### 3.1 O fato

`react-native-purchases` **10.4.1** (RevenueCat) é a **única** biblioteca de terceiro que faz rede e
troca identificadores. Conforme o Bloco 2 (§4.1), a chamada é **automática no retorno do app ao
primeiro plano** — não no boot frio, e não por ação de uma pessoa. Ela é *fail-closed*: sem chave de
API, o SDK não é configurado e nenhuma requisição ocorre.

### 3.2 A tensão com a Kids Category

Se o app for publicado na **Kids Category da Apple**, entra em vigor um regime mais restritivo do que
o das demais categorias quanto ao envio de informação a terceiros. O app carrega um SDK de terceiro
que, por natureza, **envia identificadores técnicos a um servidor de terceiro, automaticamente**.

Este parecer **não declara** que isso viola a regra, e **não declara** que está permitido. O que ele
declara é:

1. **existe uma tensão real** entre "entrar na Kids Category" e "embarcar um SDK de terceiro que faz
   chamada automática";
2. a resolução **depende da redação vigente** das App Review Guidelines e, possivelmente, da própria
   revisão da Apple;
3. **não é aceitável submeter sem resolver isso antes** — é o tipo de item que reprova na revisão e
   consome ciclos de submissão.

**Três caminhos possíveis**, para decisão futura e **não** decididos aqui:

| Caminho | Consequência |
|---|---|
| Kids Category **com** o SDK, após confirmação de que a configuração usada é aceitável | exige confirmação documentada junto à Apple/provedor |
| Kids Category **sem** o SDK (validação de compra apenas pela API nativa da loja) | remove o terceiro; custa reescrita da camada de assinatura |
| **Fora** da Kids Category, com classificação 4+ e categoria Education | mantém o SDK; perde o selo Kids e a vitrine infantil |

Encaminhado como **E5.21**.

### 3.3 Manifesto de privacidade do SDK — **NÃO RECUPERADO**

Varredura de `node_modules` encontrou `PrivacyInfo.xcprivacy` em: `expo-file-system`,
`@react-native-async-storage/async-storage`, `expo-constants`, `lottie-react-native` e no próprio
`react-native`.

**Não há** `PrivacyInfo.xcprivacy` dentro do pacote npm `react-native-purchases` — nem em seu
diretório `ios/`.

Isso **não** significa que o app compilado fique sem esse manifesto: o `RNPurchases.podspec` declara
`spec.dependency "PurchasesHybridCommon", '18.18.0'`, e o pod nativo — onde o manifesto do SDK
residiria — é **resolvido em tempo de build**, fora deste repositório.

> **Classificação: NÃO RECUPERADO.** Este parecer **não afirma** que o SDK de assinatura embarca
> manifesto de privacidade, e **não afirma** que não embarca. Verificável apenas inspecionando o
> artefato compilado ou a documentação do provedor. Encaminhado como **E5.22**.

---

## 4. Manifesto de privacidade do app — parecer (P-92)

### 4.1 O que existe

`app.json` → `expo.ios.privacyManifests` declara `NSPrivacyAccessedAPICategoryUserDefaults` com razão
`CA92.1`, `NSPrivacyCollectedDataTypes: []`, `NSPrivacyTracking: false`,
`NSPrivacyTrackingDomains: []`.

### 4.2 Uma hipótese de defeito que **foi verificada e descartada**

O app chama intensamente `FileSystem.getInfoAsync` (dezenas de pontos em `src/services`,
`src/hooks`, `src/context`) e chama `FileSystem.getFreeDiskStorageAsync`
(`src/services/packDownloadService.js:592-593`). Ambas são APIs de razão exigida pela Apple —
*FileTimestamp* e *DiskSpace* — e **nenhuma das duas está declarada** no manifesto do app.

Isso parecia um defeito. **Não é.** Leitura direta de
`node_modules/expo-file-system/ios/PrivacyInfo.xcprivacy` mostra que o próprio módulo **já declara**:

- `NSPrivacyAccessedAPICategoryFileTimestamp` — razões `0A2A.1`, `3B52.1`;
- `NSPrivacyAccessedAPICategoryDiskSpace` — razões `E174.1`, `85F4.1`.

E `async-storage` declara `FileTimestamp` com razão `C617.1`. Como as chamadas ocorrem **dentro**
desses módulos, e a Apple agrega os manifestos de cada framework, a declaração está coberta na
camada correta.

**Registro explícito:** este parecer levantou uma suspeita, foi verificar, e a suspeita **não se
confirmou**. Fica registrada para que não seja levantada de novo.

### 4.3 O que continua **em aberto**

`NSPrivacyCollectedDataTypes: []` afirma que **o app não coleta dado algum**. Isso é verdadeiro para
o **código do próprio app**. Mas a *Nutrition Label* preenchida no App Store Connect **não é o mesmo
campo**: ela é declarada pelo desenvolvedor e deve refletir também o que os SDKs embarcados coletam.

`docs/STORE_RELEASE_READINESS_CHECKLIST.md:68` instruía declarar **"Data Not Collected (nenhum dado
enviado a servidores)"**. Com um SDK de assinatura embarcado, **essa declaração precisa ser
reexaminada** antes de ser feita — declarar "nada coletado" e embarcar um SDK que transmite
identificadores de compra é o tipo de inconsistência que a Apple detecta.

**Não é uma correção de `app.json`.** Conforme a arbitragem 5 do fundador, **a coluna canônica
`Fase implementação = 20` continua sendo a proprietária da correção técnica do P-92**. Este bloco dá
o **parecer**; a Fase 20 implementa. Encaminhado como **E5.23** — **sem deslocar a Fase 20**.

---

## 5. Faixa etária nas consoles — resolução do E5.3

### 5.1 A contradição encontrada

| Documento | Texto | Problema |
|---|---|---|
| `STORE_COMPLIANCE_CHECKLIST.md:24` | *"Classificação etária correta (**4+ ou 9+**)"* | "9+" é incompatível com um produto de **4 a 8 anos** |
| `STORE_COMPLIANCE_CHECKLIST.md:74` | *"Target age group configurado (**5-8 ou 6-8**)"* | "5-8" **não é** uma faixa oferecida pelo Google Play |
| `STORE_RELEASE_READINESS_CHECKLIST.md:122` | *"Target age group configurado: **'Ages 5–8' ou 'Ages 6–8'** (verificar com equipe)"* | idem, e o "verificar com equipe" nunca foi resolvido |

### 5.2 O fato estrutural

A faixa oficial do produto é **4 a 8 anos** (arbitragem 2, `PF5-FAIXA-ETARIA`, Bloco 1). **Nenhuma
das duas lojas oferece uma faixa "4 a 8"**: ambas trabalham com faixas fixas cujo corte fica **entre
5 e 6 anos**. A faixa do produto, portanto, **atravessa duas faixas de console**.

Isso não é erro do produto nem das lojas. É uma consequência que precisa ser decidida **uma vez** e
registrada.

### 5.3 Consequência por loja

| Loja | Natureza do campo | Consequência para 4–8 |
|---|---|---|
| **Google Play** — grupo etário-alvo | admite **múltipla seleção** | a faixa 4–8 pode ser coberta **selecionando as duas** faixas que a contêm. **Não é preciso escolher.** |
| **Apple** — faixa da Kids Category | admite **uma única** faixa | é **obrigatório escolher**, e a escolha exclui parte do público declarado |
| **Apple** — classificação indicativa de conteúdo | independente da faixa Kids | **4+** é o valor coerente com o conteúdo. **"9+" está descartado** |

### 5.4 Resolução aplicada nos documentos

1. **"4+ ou 9+" → "4+"**, sem alternativa. Um app de histórias bíblicas para 4 a 8 anos, sem
   violência gráfica, sem linguagem adulta e sem conteúdo gerado por usuários, não tem por que ser
   9+. A dúvida era herdada e **não tinha fundamento no conteúdo real**.
2. **"5-8" eliminado** dos dois checklists — não existe.
3. **Google Play:** instrução de selecionar **as duas** faixas que cobrem 4 a 8, em vez de escolher.
4. **Apple Kids Category:** a escolha da faixa única **não é decidida aqui**. Ela depende de o app
   entrar ou não na Kids Category (§3.2), e é decisão de posicionamento do fundador nas consoles.
   Encaminhada como **E5.21** junto com a decisão da categoria — são a mesma decisão.

---

## 6. Correções aplicadas aos checklists de loja

Os dois checklists continham marcações **`✓`** que **não correspondem à configuração real**. Um
checklist que mente é pior do que nenhum: ele faz com que o item nunca mais seja olhado.

| # | Onde | Afirmação anterior | Fato verificado |
|---|---|---|---|
| 1 | `COMPLIANCE:50` e `READINESS:88`, `:141` | Nome do app "Pequenos Traços de Fé" **✓** | **`app.json:3` → `"name": "Beni"`.** O nome que aparece sob o ícone é **Beni**. O `✓` era falso |
| 2 | `READINESS:56` | *"`npm run smoke` → **600/600** ✓"* | a suíte atual tem **4525** testes. O número estava defasado |
| 3 | `READINESS:58` | *"⚠ PNG ainda não comprimido — **~65 MB** apenas de imagens"* | **110,2 MB** em 98 arquivos PNG; **218 MB** no diretório `assets/` inteiro |
| 4 | `READINESS:148` | *"Ícone 512×512 ✓ (verificar `assets/icon.png`)"* | `assets/icon.png` é **1024×1024**. Não existe arquivo 512×512 no repositório |
| 5 | `COMPLIANCE:67` | *"dados criptografados em trânsito (**N/A offline**)"* | **existe** tráfego de rede (Bloco 2 §4). "N/A offline" é falso |
| 6 | `COMPLIANCE:68` e `READINESS:118` | *"Solicitação de exclusão: disponível (desinstalação ou **limpar progresso**)"* | não existe exclusão total no app (Bloco 2 §7). "Limpar progresso" apaga **progresso**, não tudo |
| 7 | `READINESS:68` | *"Data Not Collected (**nenhum dado enviado a servidores**)"* | precisa ser reexaminado à luz do SDK de assinatura — §4.3 |
| 8 | `COMPLIANCE:24`, `:74`, `READINESS:122` | "4+ ou 9+"; "5-8 ou 6-8" | resolvido em §5 |

Todas foram corrigidas nos dois documentos **neste bloco**. Nenhuma foi corrigida em silêncio: cada
correção está listada acima com o fato que a motivou.

---

## 7. Medições diretas

### 7.1 Ícones — leitura de cabeçalho PNG

| Arquivo | Dimensão | Alfa | Peso |
|---|---|---|---|
| `assets/icon.png` | **1024×1024** | **não** (colorType 3, paleta) | 21,9 KB |
| `assets/adaptive-icon.png` | 1024×1024 | não | 17,1 KB |
| `assets/splash-icon.png` | 1024×1024 | não | 17,1 KB |
| `assets/favicon.png` | 48×48 | sim | 1,4 KB (uso web apenas) |

**Veredito parcial favorável:** o ícone da Apple cumpre **1024×1024 sem canal alfa**. Restam
verificações que **exigem olho humano** e não podem ser feitas por leitura de cabeçalho: ausência de
texto, ausência de cantos arredondados pré-aplicados e legibilidade em tamanho pequeno.
Encaminhado como **E5.25**.

### 7.2 Peso — o bloqueador de bundle

| Medida | Valor |
|---|---|
| Diretório `assets/` | **218 MB** |
| Só PNG (98 arquivos) | **110,2 MB** |
| `assets/maps` | 68 MB |
| `assets/audio` | 59 MB |
| `assets/stories` | 38 MB |
| `assets/mascot` | 29 MB |
| `assets/games` | 23 MB |
| `assets/images` | 3,0 MB |

> **O tamanho do bundle publicado NÃO FOI MEDIDO.** Diretório-fonte **não é** bundle: o empacotador
> exclui o que não é referenciado, o AAB do Android é comprimido e distribuído por *splits*, e o IPA
> tem regras próprias. Medir exigiria build — proibido nesta fase.

O que se pode afirmar com evidência: **o material de origem é 218 MB contra um limite de referência
de 150 MB**, e o número de 65 MB que os checklists usavam há meses **está errado por um fator de
quase dois**. O bloqueador de compressão é real e maior do que estava documentado.
Encaminhado como **E5.26**.

---

## 8. Exportação e criptografia

`app.json` declara `usesNonExemptEncryption: false`. O app embarca `@noble/hashes` (funções de hash)
e faz HTTPS. Hash e HTTPS são, em regra, isentos — mas a declaração de conformidade de exportação é
**declaração legal do desenvolvedor**, não conclusão técnica de um parecer de engenharia.

Este parecer **não valida** a declaração. Encaminhado como **E5.27**.

---

## 9. Encaminhamentos deste bloco

| ID | Item | Destino | Estado |
|---|---|---|---|
| **E5.21** | Kids Category × SDK de assinatura, **e** a escolha da faixa única da Apple — são a mesma decisão | decisão de posicionamento do fundador nas consoles + confirmação da regra vigente | **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** |
| **E5.22** | Manifesto de privacidade do SDK de assinatura no artefato compilado — **NÃO RECUPERADO** | inspeção do build ou documentação do provedor | **DEPENDENTE DE TERCEIRO EXTERNO** |
| **E5.23** | *Nutrition Label* e `NSPrivacyCollectedDataTypes` reexaminados à luz do SDK embarcado (**P-92**) | **Fase 20**, proprietária da implementação — **sem deslocamento** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.24** | Confirmar que `expo-dev-client` não fica ativo no build de produção | verificação no artefato compilado | **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** |
| **E5.25** | Ícone: ausência de texto, de cantos arredondados e legibilidade em tamanho pequeno | inspeção visual humana | **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** |
| **E5.26** | Compressão de assets — 218 MB de origem, 110 MB só em PNG; bundle real não medido | fase técnica proprietária do pipeline de assets | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.27** | Declaração de conformidade de exportação (`usesNonExemptEncryption`) | responsável legal | **DEPENDENTE DE TERCEIRO EXTERNO** |
| **E5.28** | Divergência entre `app.json` (`name: "Beni"`) e o nome usado nos documentos de loja | decisão de nome comercial do fundador; **implementação** em fase de runtime | **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** |
| **E5.29** | Não existe ícone 512×512 para o Google Play | designer / fase de assets | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.30** | Oito marcações falsas ou defasadas nos checklists de loja | **corrigidas neste bloco** (§6) | **RESOLVIDO NESTA FASE** |
| **E5.31** | Contradição de faixa etária nas consoles ("4+ ou 9+", "5-8") | **resolvida documentalmente neste bloco** (§5); a escolha da faixa única da Apple segue em E5.21 | **RESOLVIDO NESTA FASE** (parcial — a parte Apple está em E5.21) |
| **E5.32** | Suspeita de manifesto de privacidade incompleto (FileTimestamp / DiskSpace) | **verificada e descartada** (§4.2) — coberta pelos módulos | **RESOLVIDO NESTA FASE** |

---

## 10. Parecer

1. **A superfície de terceiros é excepcionalmente pequena para um app comercial.** De 31
   dependências, **uma** faz rede e troca identificadores. Não há analytics, publicidade,
   atribuição, crash reporting nem push. Isso é uma posição forte, e é resultado de escolha
   deliberada, não de acaso.
2. **Essa única dependência é, ao mesmo tempo, o item mais delicado da submissão.** A tensão entre
   Kids Category e um SDK de terceiro com chamada automática é real e precisa ser resolvida
   **antes** de submeter, não durante a revisão.
3. **Os checklists de loja continham oito afirmações que não se sustentavam**, três delas marcadas
   com `✓`. Foram corrigidas. A mais grave é o nome: os documentos diziam "Pequenos Traços de Fé"
   com `✓` enquanto `app.json` diz `"Beni"`.
4. **O bloqueador de peso é maior do que estava documentado** — 110 MB só em PNG contra os 65 MB
   registrados. O bundle real não foi medido e continua **NÃO RECUPERADO**.
5. **O manifesto de privacidade do app está tecnicamente correto** no que declara; o que precisa de
   revisão é a *Nutrition Label*, que é campo de console e pertence à **Fase 20**.
6. **Nenhum item de loja é declarado conforme por este parecer.**

---

## 11. O que este bloco **não** fez

1. Não alterou runtime. `app.json`, `eas.json`, `package.json`, `plugins/` e `assets/` foram
   **lidos**, não modificados.
2. Não instalou, removeu nem atualizou dependência.
3. Não gerou build, não mediu bundle, não abriu Metro, não instalou app.
4. Não decidiu se o app entra na Kids Category nem qual faixa única selecionar na Apple.
5. Não marcou nenhum item de checklist como concluído — apenas **corrigiu marcações falsas** e
   tornou verificáveis as que estavam vagas.
6. Não transcreveu a redação vigente das regras de Apple ou Google, e não declarou conformidade.

---

**Bloco 3 concluído.** Próximo: **Bloco 4 — Teologia e conteúdo**.
