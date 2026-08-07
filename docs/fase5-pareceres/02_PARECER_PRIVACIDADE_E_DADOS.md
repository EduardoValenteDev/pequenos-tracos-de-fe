# Fase 5 · Bloco 2 — Parecer de privacidade e dados

**Fase:** 5 — Infância, privacidade, teologia e medição
**Bloco:** 2 — Privacidade e dados
**Data:** 2026-08-06
**Natureza:** documental
**Blocos anteriores:** [`00_ABERTURA_E_RASTREABILIDADE.md`](00_ABERTURA_E_RASTREABILIDADE.md) ·
[`01_PARECER_ADEQUACAO_ETARIA_E_LINGUAGEM.md`](01_PARECER_ADEQUACAO_ETARIA_E_LINGUAGEM.md)

---

## 0. O que este bloco é e o que ele não é

**É** o parecer de privacidade exigido pelo critério de saída da Fase 5
(`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:249`), construído a partir de **leitura direta do
código**, não de documentação herdada.

**Não é:**

- **parecer jurídico.** Nenhuma frase aqui diz "legalmente aprovado", "100% conforme", "nenhum
  risco" ou "anonimização garantida" — vocabulário proibido pelo §22 do Product Lock 4E;
- **alteração de runtime.** Zero arquivos em `src/`, `scripts/`, `assets/`, `App.js`, `app.json`,
  `eas.json`, `package.json`, `package-lock.json`, `plugins/`;
- **o tratamento do E.1.** A divergência entre o texto da Área dos Pais e o comportamento real de
  rede é **estabelecida factualmente aqui** (§4) e **tratada formalmente no Bloco 6**, conforme a
  arbitragem 3 do fundador.

---

## 1. Método e qualidade da evidência

| Item | Como foi obtido | Confiabilidade |
|---|---|---|
| Inventário de chaves de armazenamento | varredura exaustiva de `src/` e `App.js` por agente de investigação | **alta** — cada chave com arquivo:linha |
| Superfície de rede | varredura por agente **+ releitura direta minha** dos trechos críticos | **alta, com uma correção** — ver §1.1 |
| Strings da Área dos Pais | **lidas literalmente por mim**, linha a linha | **máxima** |
| `app.json` / `eas.json` / `package.json` | **lidos integralmente por mim** | **máxima** |
| Presença da chave de API de assinatura no build | **não recuperável neste repositório** | **NÃO RECUPERADO** — ver §4.3 |

### 1.1 Correção aplicada ao relatório de investigação

O agente afirmou que a chamada de rede da RevenueCat *"roda em todo boot do app"*. **Isso está
incorreto** e a correção importa para o parecer.

Releitura direta:

- `App.js:85` chama `initEntitlement()`;
- `initEntitlement()` (`entitlementService.js:126-135`) faz duas coisas: `loadEntitlement()` e o
  registro de um listener de `AppState`;
- `loadEntitlement()` (`entitlementService.js:55-70`) lê **apenas `AsyncStorage.getItem`** —
  **não há rede**;
- a rede só ocorre em `refreshEntitlement()` → `fetchEntitlement()` → `Purchases.getCustomerInfo()`,
  e `refreshEntitlement()` é disparado pelo listener **quando o app volta a `'active'`**.

**Conclusão corrigida:** no **boot frio não há chamada de rede**; ela ocorre **a cada retorno do app
ao primeiro plano**. Continua sendo tráfego **automático**, sem ação do adulto — o que preserva
integralmente a conclusão do E.1 —, mas o momento é outro, e um parecer de privacidade que erre o
momento do tráfego não serve para nada.

---

## 2. O que o app guarda

Mapa completo, por chave, em
[`docs/legal/CHILD_DATA_MATRIX.md`](../legal/CHILD_DATA_MATRIX.md), **integralmente reescrito neste
bloco**. Resumo:

- **mais de 50 chaves** de `AsyncStorage`, contra as **8 linhas** da matriz de Sprint 17.0;
- **três diretórios de arquivo** sob `ptf_blobs/` (desenhos legado, Colorir com o Beni, Criar Livre);
- **sete categorias** de dado pessoal da criança: nome, avatar/tom de pele, desenhos legado,
  pinturas do Colorir com o Beni, artes do Criar Livre, título da arte, reflexão pós-história;
- **quatro campos de texto livre** do responsável no Modo Igreja.

### 2.1 Minimização — veredito favorável

O app **não coleta** e-mail, telefone, endereço, geolocalização, foto, voz, biometria, **idade**,
identificador de publicidade nem histórico de navegação. Não há login, não há cadastro, não há
backend próprio, não há chat e não há conteúdo gerado por terceiros.

Dois serviços declaram a garantia no próprio código-fonte — o Baú do Beni (*"nunca salva texto
livre, nome, imagem"*) e o Cultinho em Casa (*"NUNCA salva texto livre, foto, áudio, localização"*).
Isso é a prática de minimização aparecendo como contrato explícito de módulo, e é um ponto forte.

**Ausência de coleta de idade** é coerente com a `PL01A-04` e com a `PF5-FAIXA-ETARIA`: a faixa
4 a 8 é **posicionamento de produto**, não um dado que o app pergunte à criança.

### 2.2 Nomeação de arquivos — veredito favorável

Nenhum nome de arquivo é derivado do nome da criança; todos vêm de identificadores internos
sanitizados. A exclusão de arquivo passa por validação de contenção contra *path traversal*, e não
existe remoção por prefixo aberto. Nenhum fluxo usa `AsyncStorage.clear()`.

### 2.3 Ponto de atenção — tom de pele

`@ptf_profile` guarda `skinTone` e `avatarSkinTones`. É uma preferência de avatar, fica no aparelho e
não é transmitida — mas **não deve ser tratada como dado neutro**: é proxy de característica pessoal.
O parecer registra que ela **nunca** pode ser transmitida nem usada para segmentação de qualquer
natureza, inclusive na medição anônima do Bloco 5.

### 2.4 Campo preparado e não conectado

`createParentProfile` (`src/data/appDataModel.js`) prevê um campo `email` do responsável. **Nenhuma
tela o utiliza** e nenhuma chamada à função foi encontrada em `src/`. Deve permanecer desconectado
enquanto não houver decisão de produto e base legal. Registrado, não corrigido.

---

## 3. O que o app **não** faz — verificado

**NÃO EXISTE:** SDK de analytics · publicidade · *crash reporting* · rastreamento/ATT ·
notificações push · `expo-updates` · câmera · microfone em runtime · biblioteca de mídia ·
geolocalização · login · backend próprio.

Evidências literais:

- `app.json` → `NSPrivacyTracking: false`, `NSPrivacyTrackingDomains: []`,
  `NSPrivacyCollectedDataTypes: []`;
- permissão Android única: `android.permission.MODIFY_AUDIO_SETTINGS`;
- `expo-audio` configurado com `microphonePermission: false`, `recordAudioAndroid: false`,
  `enableBackgroundRecording: false`;
- `infoPlist` **não** declara câmera, microfone, fotos, localização nem rastreamento;
- há **teste automatizado** em `scripts/smoke.js` travando a ausência de
  `NSUserTrackingUsageDescription`.

### 3.1 `performanceTrace.js` — sem coleta

Mede tempos de boot **em memória**, com *allowlist* de chaves de metadados e regex que rejeita
e-mail e frase livre. A única saída é `console.log` local. Fora de `__DEV__`, só liga com
`EXPO_PUBLIC_PTF_PERF_TRACE=1`, **que não está declarado em nenhum perfil do `eas.json`**.

Isto sustenta diretamente a arbitragem 6 do fundador: **não há telemetria habilitada em build**, e a
Fase 5 **não** alterou `performanceTrace.js` nem `eas.json`.

---

## 4. Superfície de rede — o fato

| # | Tráfego | Disparo | Carrega dado da criança? |
|---|---|---|---|
| 1 | **`Purchases.getCustomerInfo()`** (RevenueCat) | **automático**, a cada retorno ao primeiro plano | **Não** |
| 2 | `fetch` do manifesto de conteúdo | **só por toque** em "Baixar história (usar offline)" | Não |
| 3 | Download de pacote de história (R2) | idem | Não |
| 4 | `Linking.openURL('mailto:…')` | **só por toque de adulto**, após portão parental | o que o adulto escrever |
| 5 | `Share.share` (Modo Igreja) | **só por toque de adulto** | pode levar nomes de turma e de líder |
| 6 | Link de avaliação na loja | **inoperante** — as duas URLs valem `null` | — |

### 4.1 O tráfego automático

O item 1 é o único tráfego **não iniciado por uma pessoa**. Ele é *fail-closed*: sem chave de API
configurada, o SDK não é configurado e **nenhuma requisição ocorre**.

### 4.2 O tráfego por ação explícita

Os perfis `preview`, `preview-criador` e **`production`** do `eas.json` declaram
`EXPO_PUBLIC_GLOBAL_MANIFEST_URL` apontando para um bucket público Cloudflare R2. Portanto **o
download de histórias funciona em produção** — é um recurso real, não hipotético. É *download*: o
aparelho recebe conteúdo, não envia dados.

### 4.3 O que **não** foi possível recuperar

`EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` e `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` **não aparecem** em
`eas.json`, `app.json`, `.env.example` nem `package.json`. Podem estar em EAS Secrets, fora deste
repositório.

> **Classificação: NÃO RECUPERADO.** Este parecer **não afirma** que a chamada de rede ocorre em
> produção, e **não afirma** que não ocorre. Ausência de evidência não é prova de ausência.

Consequência prática, e ela é dura: **enquanto essa chave não for verificada diretamente na
configuração de build, o projeto não sabe, com evidência, se o app publicado faz uma chamada
automática a um servidor de terceiro.** Isso precisa ser resolvido antes de qualquer submissão às
lojas — ver E5.9.

---

## 5. A divergência E.1 — estabelecida aqui, tratada no Bloco 6

Seis textos da Área dos Pais foram lidos **literalmente**:

| Linha | Texto |
|---|---|
| `ParentAreaScreen.js:890` | *"Este app salva apenas dados locais neste aparelho. **Nada é enviado automaticamente para a internet.**"* |
| `:896` | *"…os dados ficam neste aparelho e **nada é enviado automaticamente para a internet**…"* |
| `:911` | *"🔒 O app não pede e não armazena email, telefone, idade, localização ou senha da criança. Todos os dados ficam apenas neste aparelho. **Nenhuma informação é transmitida para servidores externos.**"* |
| `:952` | *"Quando houver recursos de compartilhamento ou envio externo, o responsável será avisado antes. Por enquanto, tudo funciona só com dados locais neste aparelho."* |
| `:1104` | *"Sem login, sem cadastro e sem coleta de dados pessoais da criança. Tudo fica apenas neste aparelho."* |
| `:1280` | *"…Tudo fica salvo apenas neste aparelho — sem internet obrigatória, sem login."* |

Confrontados com §4, o veredito é o seguinte, e ele **distingue duas afirmações que não são a mesma
coisa**:

| Afirmação | Verdadeira? |
|---|---|
| *"não pede e não armazena email, telefone, idade, localização ou senha da criança"* | **VERDADEIRA** — verificado |
| *"sem login, sem cadastro"* | **VERDADEIRA** |
| *"sem coleta de dados pessoais da criança"* pelo desenvolvedor, para fora do aparelho | **VERDADEIRA** |
| *"os dados ficam neste aparelho"* | **VERDADEIRA** para todo dado pessoal da criança |
| *"nada é enviado automaticamente para a internet"* | **NÃO SUSTENTÁVEL** — há tráfego automático de validação de assinatura no retorno ao primeiro plano |
| *"nenhuma informação é transmitida para servidores externos"* | **NÃO SUSTENTÁVEL** como escrita — identificadores técnicos de compra são transmitidos |
| *"sem internet obrigatória"* (Modo Igreja) | **VERDADEIRA** — o Modo Igreja funciona offline |

**O erro não é sobre privacidade da criança; é sobre tráfego de rede.** O app faz o que promete no
que importa — os dados da criança não saem do aparelho. O que ele não pode dizer é que **nada**
trafega.

**Encaminhamento:** o tratamento formal — redação substituta, indicação exata das strings, envio da
implementação à Fase 7, validação visual futura e runtime intocado — é **dever do Bloco 6**,
conforme a arbitragem 3. Este bloco **não** propõe a redação nem toca no código.

---

## 6. A mesma divergência nos documentos legais — **corrigida aqui**

O que a Fase 5 **não** pode fazer no runtime, ela **pode e deve** fazer nos documentos.

`docs/legal/PRIVACY_POLICY_DRAFT.md` continha as mesmas afirmações não sustentáveis. Foram
**reescritas para serem verdadeiras e verificáveis**:

| Seção | Antes | Depois |
|---|---|---|
| §3.1 | *"O aplicativo **não envia dados para servidores externos** em sua versão atual."* | *"**Nenhum dado pessoal da criança é enviado para servidores externos.**"* + declaração das duas situações de tráfego, remetendo à nova §6.1 |
| §4 | *"Nunca são transmitidos para servidores externos na versão atual"* | mantida a garantia **sobre dado pessoal da criança**; acrescentado o armazenamento em arquivo, a **ausência de expiração automática** e a garantia de que nomes de arquivo não derivam do nome da criança |
| §6 | lista de "não utilizamos" | ampliada (crash reporting, push, IDFA/GAID) e acrescida da **nova §6.1 — tabela completa das conexões de rede**, com o que trafega e se envolve dado da criança |
| §8 | *"Use 'Limpar progresso'"* | as **três** funções reais de exclusão, o fato de que a exclusão total **está em preparação**, e um **prazo de conservação** explícito |
| §9 | Google Fonts + Expo | acrescentados **RevenueCat** (com placeholder de país de hospedagem, retenção e acordo de tratamento) e **Cloudflare R2**; declaração explícita de ausência de analytics/ads/tracking/crash |

`docs/legal/CHILD_DATA_MATRIX.md` foi **reescrito integralmente**, com declaração aberta de por que a
versão de Sprint 17.0 ficou defasada (8 tipos de dado e `Transmitido? Não` em todas as linhas, contra
mais de 50 chaves e tráfego real). **Não houve ajuste silencioso:** a divergência está declarada no
topo do próprio documento.

---

## 7. Lacunas de direitos do titular

| # | Direito | Estado | Gravidade |
|---|---|---|---|
| 1 | **Eliminação** | Existem **três** exclusões parciais (progresso, pinturas do Colorir com o Beni, criações do Criar Livre). **NÃO EXISTE** exclusão total: o bloco "Apagar todos os dados locais" mostra texto e o selo *"Em preparação"*, **sem ação associada**. Não há caminho no app para apagar o **nome** da criança | **ALTA** |
| 2 | **Exclusão de perfil** | `deleteChildProfile` remove só a entrada da lista; **não apaga** progresso, desenhos nem o perfil legado. O próprio código declara isso | **ALTA** — pode ser lido como exclusão sem sê-lo |
| 3 | **Portabilidade** | **NÃO EXISTE**. Nenhum export, nenhum PDF/JSON/CSV, nenhuma gravação na galeria. Os desenhos da criança **não podem ser extraídos** por nenhum caminho oferecido | **MÉDIA** |
| 4 | **Retenção** | **NÃO EXISTE** política, TTL ou expurgo. `@ptf_lumi_moment_${data}` acumula **uma chave por dia de uso**, sem limpeza por idade | **MÉDIA** |
| 5 | **Consentimento verificável** | A chave `@ptf_parental_consent_v1` existe e é gravável, mas o fluxo está **atrás de flag**. Não há mecanismo de consentimento parental verificável no sentido do COPPA | **ALTA** |
| 6 | **Aviso no momento da coleta** | O aviso de que os dados ficam no aparelho está na **Área dos Pais**; o nome é digitado no **onboarding**, sem aviso vinculado ao ato | **MÉDIA** |

> **Atenuante real, registrado:** todas essas lacunas ocorrem num app **sem backend, sem login e sem
> transmissão de dado pessoal**. O risco concreto é substancialmente menor do que os mesmos itens
> seriam num app com servidor. Isso **atenua**, não **elimina** — e nenhuma dessas lacunas é
> declarada resolvida aqui.

---

## 8. Documentos que continuam **não existindo**

Confirmado por varredura: **NÃO EXISTE** no repositório —

- **RIPD** (Relatório de Impacto à Proteção de Dados Pessoais);
- análise de **ECA / ECA Digital**;
- mecanismo ou documento de **consentimento parental verificável**;
- **política de retenção** com prazos;
- inventário de licenças (nenhum `LICENSES.md`, `ATTRIBUTIONS.md` ou `THIRD_PARTY.md`);
- parecer de **direitos de exibição coletiva**.

Nenhum destes é criado por este bloco. Todos recebem destino em §9.

---

## 9. Encaminhamentos deste bloco

Cada item recebe **um** dos quatro estados obrigatórios da arbitragem 7.

| ID | Item | Destino | Estado |
|---|---|---|---|
| **E5.7** | Não existe exclusão total de dados no app; o bloco correspondente é inerte ("Em preparação"). Não há caminho para apagar o nome da criança | **Fase 7** (Onboarding, Home e Área dos Pais) — mesma proprietária do E.1 | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.8** | Nenhum texto ao usuário menciona a validação automática de assinatura | **Bloco 6** desta fase especifica a redação; **Fase 7** implementa | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.9** | Presença da chave de API de assinatura no build de produção — **NÃO RECUPERADO** | verificação direta na configuração de build (EAS Secrets), por quem tem acesso à conta | **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** |
| **E5.10** | Natureza da reflexão pós-história (`@ptf_reflection_${storyId}`): confirmar se admite texto livre digitado pela criança | leitura da tela de reflexão; **Bloco 4** ao tratar conteúdo, ou fase proprietária da tela | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.11** | `deleteChildProfile` não apaga os dados associados ao perfil removido | **Fase 7** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.12** | Ausência de portabilidade/exportação dos desenhos e do progresso | decisão de produto futura; **não** é bloqueio desta fase | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.13** | Ausência de política de retenção com prazos e de expurgo de `@ptf_lumi_moment_*` | especificação nesta fase (feita: `CHILD_DATA_MATRIX.md` §7 declara a ausência); implementação em fase de runtime | **RESOLVIDO NESTA FASE** (no eixo documental) |
| **E5.14** | Consentimento parental verificável (LGPD Art. 14 · COPPA) inexistente | exige definição jurídica antes de definição técnica | **DEPENDENTE DE TERCEIRO EXTERNO** |
| **E5.15** | **RIPD** inexistente | advogado/DPO | **DEPENDENTE DE TERCEIRO EXTERNO** |
| **E5.16** | Análise de **ECA / ECA Digital** inexistente | advogado | **DEPENDENTE DE TERCEIRO EXTERNO** |
| **E5.17** | Inventário de licenças de assets e ferramentas de IA inexistente | **Bloco 4** inicia o inventário; validação de licença comercial é externa | **DEPENDENTE DE TERCEIRO EXTERNO** |
| **E5.18** | País de hospedagem, prazo de retenção e acordo de tratamento do provedor de assinatura | provedor + advogado | **DEPENDENTE DE TERCEIRO EXTERNO** |
| **E5.19** | `NSPrivacyCollectedDataTypes: []` no `app.json` precisa ser reconferido à luz do SDK de assinatura | **Fase 20**, proprietária da implementação do manifesto de privacidade (P-92), **sem deslocamento** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.20** | Campo `email` do responsável preparado e não conectado a nenhuma UI | manter desconectado; reavaliar se e quando houver decisão de produto | **RESOLVIDO NESTA FASE** (registrado; nada a fazer hoje) |

---

## 10. Parecer

1. **No eixo que mais importa para uma criança — dado pessoal não sai do aparelho — o app cumpre o
   que promete.** Não há login, backend próprio, analytics, publicidade, rastreamento, câmera,
   microfone, localização nem coleta de idade. A minimização é real e, em dois módulos, contratual.
2. **O app não é, porém, "sem internet".** Há tráfego automático de validação de assinatura e
   download de conteúdo sob demanda. Descrever isso corretamente é obrigação, e os textos ao usuário
   ainda não fazem isso — divergência **E.1**, tratada no Bloco 6.
3. **As lacunas de direitos do titular são reais** — exclusão total, exclusão de perfil, retenção,
   portabilidade e consentimento verificável. Nenhuma é declarada resolvida.
4. **A dependência de terceiro externo é decisiva e não pode ser convertida em aprovação.** Seis dos
   catorze encaminhamentos dependem de advogado, DPO ou do provedor. Nenhum é declarado aprovado.
5. **Um item permanece NÃO RECUPERADO** (E5.9) e deve ser resolvido antes de qualquer submissão às
   lojas.

**Este parecer não declara conformidade legal.**

---

## 11. O que este bloco **não** fez

1. Não alterou runtime. Nenhum arquivo protegido foi tocado.
2. Não escreveu código de analytics, não criou identificador remoto, não alterou
   `performanceTrace.js` nem `eas.json`, não habilitou telemetria em build.
3. Não propôs a redação substituta da Área dos Pais — isso é do Bloco 6.
4. Não criou RIPD, análise de ECA, mecanismo de consentimento verificável nem inventário de
   licenças.
5. Não afirmou que a chamada de rede de assinatura ocorre em produção, nem que não ocorre.
6. Não declarou nenhum item legal aprovado, conforme ou sem risco.

---

**Bloco 2 concluído.** Próximo: **Bloco 3 — SDKs e conformidade de lojas**.
