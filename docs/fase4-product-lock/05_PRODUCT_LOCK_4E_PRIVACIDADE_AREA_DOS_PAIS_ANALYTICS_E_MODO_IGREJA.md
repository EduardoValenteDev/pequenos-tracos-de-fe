# Product Lock — Fase 4E · Privacidade infantil, Área dos Pais, analytics, pesquisa, compartilhamento e Modo Igreja

> **ARTEFATO CONSOLIDADO — FASE 4E ENCERRADA (2026-08-06).**
> ~~**ARTEFATO PRELIMINAR — FASE 4E EM ABERTO.**~~ **Superado em 2026-08-06.** As **onze perguntas**
> da Seção 18 foram **respondidas pelo fundador** e estão transcritas nos blocos
> **✅ RESPOSTA DO FUNDADOR**, ao final de cada pergunta, **sem alteração do texto original da
> pergunta** — inclusive onde o fundador decidiu **diferente** da recomendação técnica, que
> permanece legível onde estava. Documento **exclusivamente documental e decisório**: nenhum código,
> *asset*, *pack*, manifesto, configuração ou permissão foi alterado; nenhuma dependência foi
> instalada; nenhum *build* foi gerado; nenhuma validação física foi executada.

| Item | Valor |
|---|---|
| Fase | 4E — Product Lock de privacidade infantil, Área dos Pais, analytics, pesquisa, compartilhamento e Modo Igreja |
| Data de abertura | 2026-08-05 |
| Data de encerramento | 2026-08-06 |
| Worktree | `C:\tmp\ptf_colorir_canonical_runtime_wt` |
| Branch | `docs/e015-phase3-artifacts` |
| HEAD na abertura | `21ba47d481b3add97fef7e73a89a518524281a9a` |
| Base executável congelada | `015c438106538595b592981fbe1b80b1d5d65e55` |
| Matriz canônica | `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` — `P-01`..`P-148` (a Fase 4E **não** criou código novo e **não** renumerou nenhum) |
| Fases encerradas | 3H · 4A · 4B · 4C · 4D · **4E** |
| Natureza desta fase | **Exclusivamente documental e decisória** |
| Nomenclatura | Este fechamento é registrado no repositório **exclusivamente como Fase 4E**. Identificadores de planejamento externo (`E022`, `E023`, `E075`, `E076`, `E077`) **não** são normativos nem canônicos aqui e **não** foram introduzidos em nenhum documento árbitro |

---

## 0. Correção de contagens e de referências do artefato preliminar

O fundador determinou, **antes de qualquer consolidação**, a correção das inconsistências
encontradas na auditoria de integridade deste artefato, **sem ajuste silencioso**: cada número
errado é reproduzido abaixo entre aspas e corrigido ao lado, com o motivo da divergência. Todas
eram erros do **texto de contagem**; as tabelas e as fichas correspondentes já estavam corretas.

### 0.1 Erro 1 — códigos que dependem do fundador

O texto dizia **"5 dependem de resposta do fundador"**, listando `P-85`, `P-100`, `P-107`, `P-108`
**e "a parte institucional de `P-107`"**. A quinta entrada **não é um código**: é o mesmo `P-107`
contado duas vezes, sob dois recortes.

**Contagem correta: 4 códigos** — `P-85`, `P-100`, `P-107`, `P-108`.

Dois códigos dependem **indiretamente**, por derivação: `P-127` e `P-139`, ambos suspensos na
resposta de `P-85`.

### 0.2 Erro 2 — a aritmética dos 24 códigos

O texto dizia **"19 já têm decisão de produto aprovada"**. Esse 19 foi obtido como `24 − 5`, e
herdou o erro da §0.1. Nenhuma das duas leituras possíveis dá 19:

| Leitura | Valor |
|---|---|
| Códigos **com decisão de produto já aprovada** em 4A/4B/4C/4D | **15** |
| Códigos **não diretamente dependentes** do fundador (`24 − 4`) | **20** |

A decomposição exata, que fecha em 24:

| Classe | Qtd. | Códigos |
|---|---|---|
| Dependem **diretamente** do fundador nesta fase | **4** | `P-85` `P-100` `P-107` `P-108` |
| Já têm **decisão de produto aprovada** em fase anterior | **15** | `P-24` `P-32` `P-39` `P-49` `P-62` `P-64` `P-66` `P-82` `P-93` `P-141` `P-144` `P-145` `P-147` `P-148` `P-92` |
| **Higiene documental** — sem decisão de produto associada | **3** | `P-42` `P-73` `P-112` |
| Suspensos por derivação em `P-85` | **2** | `P-127` `P-139` |
| **Total** | **24** | — |

**4 + 15 + 3 + 2 = 24.** A fórmula *"19 aprovados + 5 fundador"* **não deve ser reproduzida**.

### 0.3 Erro 3 — contagem da §6.2 (as 17 ações e o portão)

O texto dizia **"11 ações com portão já aprovado · 5 pendentes · 1 governada por cerca de build"**.
A tabela tem 10 linhas com portão aprovado (1, 2, 3, 4, 8, 10, 12, 13, 14, 17) e 6 pendentes de
resposta (5, 6, 7, 9, 11, 16 — a ação 7 é **parcial** e a 16 depende da Pergunta 8).

**Contagem correta: 10 · 6 · 1 = 17.**

### 0.4 Erro 4 — contagem da §8.2 (as 12 categorias de analytics)

O texto somava **6 + 2 + 3 + 2 = 13** sobre uma tabela de **12** linhas, porque as categorias com
classificação dupla (`P` local **e** `C` para envio) foram contadas nas duas colunas.

Aplicando **classificação exclusiva**, cada categoria em uma única classe:

| Classe | Qtd. | Categorias |
|---|---|---|
| Permitidas **estritamente locais** | **6** | 2, 3, 4, 5, 8, 9 |
| **Posteriores** ao lançamento | **2** | 1, 6 |
| **Exclusivamente condicionais** a ação ou consentimento do responsável | **2** | 7, 10 |
| **Proibidas** | **2** | 11, 12 |
| **Total** | **12** | — |

**6 + 2 + 2 + 2 = 12.**

### 0.5 Erro 5 — perguntas sem código âncora

O texto listava seis perguntas sem código âncora, mas **incluía a Pergunta 3 e omitia a Pergunta 6**.
A Pergunta 3 **tem** âncora: `P-145`, a operação C do contrato 4D.

**Conjunto correto: {1, 2, 6, 7, 9, 10}** — duração da sessão adulta, portão para link externo,
aparência da obra exportada, destino da exportação, onde vivem política e termos, canal de suporte.

### 0.6 Erro 6 — conflitos sem código de matriz

O artefato não declarava quantos conflitos ficam **sem código `P` correspondente**. São **sete**:
**C-5**, **C-6**, **C-8**, **C-10**, **C-12**, **C-13** e **C-15**. Isso é registro, não defeito:
conflito de contrato não exige código de matriz, e **nenhum código novo foi criado** por essa
constatação (a regra de 4A/4D — *não criar código por simples ampliação de evidência* — permanece).

### 0.7 Erro 7 — quatro referências de código imprecisas, reverificadas no HEAD

Todas reconferidas em `21ba47d`, linha a linha:

| Onde | Citação preliminar | Correção | Fato no HEAD |
|---|---|---|---|
| §9.0 | `appDataModel.js:51` para o gerador `parent_*` | **`:49`** | `:49` é `id: id \|\| generateId('parent'),`; `:51` é o campo `email` |
| §15 | `postStoryStorage.js:72` | **`:71`** | `:71` é `} catch {}`; `:72` é a chave de fechamento da função |
| §2.2 e §12 | `planConfig.js:40-55` | **`:40-55`** | `:40` abre `PLAN_PRICING`, `:55` é o `};` de fechamento, `:56` é linha em branco |
| §14.1 | `storageKeys.js:98-110` | **`:96-110`** | o objeto `storageKey` abre em `:96`; `:98-110` são entradas internas |

**Achado adicional, não previsto na auditoria:** o caminho real dos dois módulos de modelo é
**`src/data/`**, não `src/models/` — `src/models/` **não existe** no repositório. O artefato
preliminar citava `appDataModel.js` e `planConfig.js` sem caminho, o que não é erro, mas fica
registrado para que nenhuma fase futura procure no diretório errado.

### 0.8 Registro de escopo da recuperação de evidência

Para não transformar ausência de evidência em prova de ausência, fica registrado:

- Houve consulta **somente-leitura** ao remoto por `git ls-remote`. **Nenhuma ação de escrita
  externa foi comprovada.**
- ***Build*: NÃO RECUPERADO.** O histórico remoto do EAS **não** foi consultado. A ausência de
  alteração em `eas.json` **não** é prova de ausência de *build*.
- **Execução de instalação: NÃO RECUPERADA.** Registra-se apenas que **nenhuma alteração persistente
  foi detectada** em `package.json` ou `package-lock.json` — o que **não** prova que nenhum comando
  de instalação tenha sido executado.

### 0.9 Efeito das correções

Nenhuma correção desta seção altera decisão de produto, severidade, classificação de lançamento ou
estado de risco técnico. São correções de **contagem e de referência**. As tabelas da §2.1, da §5,
da §6.2 e da §8.2 foram acertadas no corpo do documento, com o texto histórico preservado.

---

## 1. Escopo da Fase 4E

### 1.1 O que esta fase decide

A Fase 4E transforma em contrato de produto as pendências sobre:

1. Separação entre **superfície infantil** e **superfície adulta**.
2. **Portão parental**: o que exige, quanto dura, como termina.
3. Estrutura canônica da **Área dos Pais**.
4. **Analytics, telemetria e pesquisa**: o que pode ser coletado, quando e sob qual autorização.
5. **Identificadores** e minimização de dados.
6. **Logs e diagnósticos**: o que pode e o que nunca pode aparecer.
7. **Exportação e compartilhamento** de criações da criança.
8. **Links externos** e comunicação comercial.
9. **Modo Igreja** e uso institucional.
10. **Aparelhos compartilhados**.
11. **Serviços fora do v1** que tocam privacidade, compartilhamento ou relatório.
12. **Ferramentas internas** e **Modo Criador**, somente onde podem contaminar privacidade, pesquisa
    ou validação.

### 1.2 O que esta fase NÃO faz

- Não altera código, assets, configurações ou permissões.
- Não implementa a Área dos Pais nem o Modo Igreja.
- Não remove nenhum serviço sem consumidor.
- Não conclui conformidade jurídica: a revisão legal (LGPD, COPPA, políticas das lojas, exigência de
  URL de política de privacidade) é encaminhada à fase própria, **não** decidida aqui.
- Não reabre o contrato da Fase 4D sobre dados, persistência, migração e integridade.
- Não escolhe respostas pelo fundador.

### 1.3 Regra de inclusão aplicada na extração

Um risco só entrou no escopo quando existe **decisão real de privacidade, controle adulto, coleta,
comunicação ou compartilhamento**. Mencionar a Área dos Pais **não** foi suficiente. Foram
explicitamente **excluídos**, entre outros: `P-05` e `P-26` (acesso e jornada — 4B/4C), `P-28`
(acessibilidade geral, sem decisão de privacidade), `P-35`, `P-114`, `P-116` e `P-143` (decididos na
4D), `P-36` (a palavra "oferta" ali é oferta de conteúdo, não comercial), `P-63` (defeito de
superfície infantil), `P-74` (já corrigido), `P-84` (deep links, `POS`, sem decisão de privacidade),
`P-94` (configuração de build, não permissão), `P-129` (4A), `P-135` e `P-136` (peso binário / 4B),
`P-138` e `P-146`.

---

## 2. Códigos abrangidos pela Fase 4E

**24 códigos.** Para cada um: descrição factual · superfície afetada · dado envolvido · decisão
necessária · evidência atual · decisão aprovada relacionada · dependências · fase de implementação ·
validação futura · impacto no lançamento · necessidade de resposta do fundador.

### 2.1 Quadro-resumo

| Código | Título curto | Eixo 4E | Lançamento | Depende do fundador? |
|---|---|---|---|---|
| `P-24` | Plano Família sem caminho de compra | Superfície adulta / comercial | `BLA` | **Não** (4A decidiu) |
| `P-32` | `resetOnboardingForQa` grava em vez de remover | Ferramenta interna | `NBL` | **Não** (4D decidiu) |
| `P-39` | `totalBonusStars` sem consumidor | Relatório ao responsável | `NBL` | **Não** (4C/4D decidiram) |
| `P-42` | Ramo `ParentArea` do Cantinho do Beni é morto | Caminho infantil→adulto | `NBL` | **Não** |
| `P-49` | Arte da criança no Livrinho viva no código e morta no runtime | Uso da criação da criança | `NBL` | **Não** |
| `P-62` | `DEFAULT_PROFILE` sem campo `id` | Identificador | `NBL` | **Não** (4D decidiu) |
| `P-64` | Área dos Pais promete 3 artes contra limite real 0 | Texto ao responsável | `PBL` | **Não** (4A decidiu) |
| `P-66` | Mensagem comercial dentro de `accessibilityLabel` | Oferta verbalizada à criança | `NBL` | **Não** (4A/4B decidiram) |
| `P-73` | Comentários de `routes.js` afirmam gate interno inexistente | Portão parental (documentação) | `NBL` | **Não** |
| `P-82` | Três serviços de recompensa sem consumidor | Certificado / share card / relatório | `NBL` | **Não** (4D decidiu) |
| `P-85` | Zero telemetria em todo o domínio do Brincar | Analytics | `NBL` | **SIM** |
| `P-92` | `plugins/withPrivacyManifest.js` órfão | Manifesto de privacidade | `PBL` | **Não** (ver conflito C-1) |
| `P-93` | `EXPO_PUBLIC_REVENUECAT` ausente de todos os perfis | SDK de terceiro | `BLA` | **Não** (4A decidiu) |
| `P-100` | Voz do Beni em autoplay sem card de consentimento | Consentimento / áudio | `NBL` | **SIM** |
| `P-107` | `SHOW_CHURCH_MODE` é a única flag interna com cerca simples | Modo Igreja / cercas | `PBL` | **SIM** (destino do modo) |
| `P-108` | Modo Igreja com escritores sem consumidor e campo trocado | Modo Igreja | `NBL` | **SIM** |
| `P-112` | `App.js:88` usa `console.warn` cru em produção | Logs | `NBL` | **Não** |
| `P-127` | Boot instrumentado sem nenhuma amostra coletada | Diagnóstico | `NBL` | **Não** (deriva de `P-85`) |
| `P-139` | Coletor de desempenho inalcançável em qualquer perfil | Diagnóstico | `NBL` | **Não** (deriva de `P-85`) |
| `P-141` | `avatarId` usado como identidade e endereço de armazenamento | Identificador | `BLA` | **Não** (4D decidiu) |
| `P-144` | Nenhum aviso de perda por desinstalação | Área dos Pais | `PBL` | **Não** (4D decidiu) |
| `P-145` | Apagar todos os dados anunciado e não implementado | Área dos Pais | `PBL` | **Não** (4D decidiu) |
| `P-147` | Suíte de fumaça exige a existência do código sem consumidor | Serviços fora do v1 | `NBL` | **Não** (4D decidiu) |
| `P-148` | Exports órfãos em módulos vivos | Serviços fora do v1 | `NBL` | **Não** (4D decidiu) |

**Contagem — corrigida na §0.1 e na §0.2, sem ajuste silencioso.** ~~24 códigos · **19 já têm
decisão de produto aprovada** nas Fases 4A/4C/4D (falta só implementar) · **5 dependem de resposta
do fundador nesta fase**: `P-85`, `P-100`, `P-107`, `P-108` e — por derivação do destino do Modo
Igreja — a parte institucional de `P-107`.~~

**24 códigos**, decompostos em quatro classes exclusivas: **4** dependem **diretamente** de resposta
do fundador nesta fase (`P-85`, `P-100`, `P-107`, `P-108`) · **15** já têm **decisão de produto
aprovada** em fase anterior e aguardam só implementação · **3** são **higiene documental** sem
decisão de produto associada (`P-42`, `P-73`, `P-112`) · **2** ficam **suspensos na resposta de
`P-85`** (`P-127`, `P-139`), porque sem decidir telemetria não há como decidir coleta de linha de
base. **4 + 15 + 3 + 2 = 24.**

> As perguntas da Seção 18 são **11** e excedem os 4 códigos porque **seis** delas são de nível de
> contrato e **não têm código âncora** na matriz — o conjunto correto é **{1, 2, 6, 7, 9, 10}**:
> duração da sessão adulta, portão para link externo, aparência da obra exportada, destino da
> exportação, onde vivem política e termos, e canal de suporte. ~~portão para apagar criação na
> superfície infantil~~ — a **Pergunta 3 tem âncora**: `P-145`, a operação C do contrato 4D
> (corrigido na §0.5). Isso é registro, não erro de contagem.

### 2.2 Ficha por código

---

#### `P-24` — Plano Família sem caminho de compra

1. **Descrição factual.** `planConfig.js:40-55` traz `monthly` e `annual` em `comingSoon`, com
   `productIdPlaceholder` vazio e `isPurchaseEnabled: false`, contra 18 de 20 histórias premium.
2. **Superfície afetada.** Área dos Pais (cartão informativo `ParentAreaScreen.js:831-864`), Story
   Detail, Home.
3. **Dado envolvido.** Estado de plano local (`@ptf_plan_state_v1`); nenhum dado da criança.
4. **Decisão necessária.** Nenhuma nova — só a relação entre superfície adulta e comercial.
5. **Evidência atual.** `PLAN_PRICING` é importado em `ParentAreaScreen.js:10` e **nunca usado no
   JSX**; o cartão é declaradamente sem botão acionável; `restoreState` (`:320`) e
   `handleRestorePurchase` (`:507-510`) existem sem nenhum consumidor de JSX.
6. **Decisão aprovada relacionada.** 4A: nome público único Plano Família; produtos mensal e anual;
   restauração exposta na Área dos Pais e no paywall **pós-gate parental**, nunca na superfície
   infantil.
7. **Dependências.** `P-05`, `P-93`.
8. **Fase de implementação.** 18.
9. **Validação futura.** Física, em aparelho real, com conta de loja de teste (`VFP+TEL+GRA+FAM`).
10. **Impacto no lançamento.** Bloqueador (`BLA`) — critério 3.
11. **Resposta do fundador.** Não necessária.

---

#### `P-32` — `resetOnboardingForQa` grava em vez de remover

1. **Descrição factual.** A rotina grava `@ptf_onboarding_v1` em vez de removê-la e não cobre tour
   nem guias.
2. **Superfície afetada.** Onboarding e a seção **🛠️ Administração (dev)** da Área dos Pais
   (`ParentAreaScreen.js:1114-1266`).
3. **Dado envolvido.** Estado de onboarding da criança.
4. **Decisão necessária.** Ferramenta interna nunca pode contaminar dado real de criança nem
   produzir direito comercial.
5. **Evidência atual.** Seção gated por `isInternalToolsEnabled()` (`internalTools.js:24-27` =
   `__DEV__ || isCreatorQaModeAllowed() || RELEASE_PACK_QA_ENABLED`), cujo cabeçalho declara que a
   proteção é **build-time, sem autenticação de administrador no app final**.
6. **Decisão aprovada relacionada.** 4D: cada operação usa o mesmo inventário canônico de chaves e
   remove de fato o que promete remover; estado de teste nunca vira direito comercial.
7. **Dependências.** `P-114`.
8. **Fase de implementação.** 7.
9. **Validação futura.** `VFP` — reproduzir a primeira experiência em aparelho real.
10. **Impacto no lançamento.** Não bloqueia (`NBL`).
11. **Resposta do fundador.** Não necessária.

---

#### `P-39` — `totalBonusStars` sem consumidor de interface

1. **Descrição factual.** A cadeia de escrita está viva (8 pontos de chamada em 6 telas, todos com
   `await`), a leitura chega a `ProgressContext.js:140`, e **o consumo final é inexistente**.
2. **Superfície afetada.** Meu Momento, Estrelinhas e o **resumo de progresso mostrado ao
   responsável** na Área dos Pais.
3. **Dado envolvido.** Estrelinhas conquistadas pela criança (`@ptf_bonus_stars`).
4. **Decisão necessária.** O relatório mostrado ao responsável não pode omitir estrelinhas
   realmente conquistadas.
5. **Evidência atual.** `grep totalBonusStars` retorna **exatamente 1 linha** em todo o repositório
   (`ProgressContext.js:140`, que é a escrita do campo). O valor **não** entra em `totalStars`,
   `sceneStars` nem `specialStars`, que vêm de `getRewardsSummary(...)`.
6. **Decisão aprovada relacionada.** 4C: fonte canônica única sem perda de estrela. 4D: a cadeia
   **não é código morto** e **não pode ser removida**, sob pena de destruir estrelinhas conquistadas.
7. **Dependências.** —
8. **Fase de implementação.** 11.
9. **Validação futura.** `VFP+TEL`.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** Não necessária.

---

#### `P-42` — Ramo `ParentArea` do Cantinho do Beni é morto

1. **Descrição factual.** `accessControl.js:130-132` contra `HomeScreen.js:746-749` e `:525`: o
   caminho "Pedir ao responsável" nunca renderiza.
2. **Superfície afetada.** Home infantil → Área dos Pais.
3. **Dado envolvido.** Nenhum; é caminho de navegação.
4. **Decisão necessária.** Qual é o caminho canônico pelo qual a criança entrega o aparelho ao
   adulto.
5. **Evidência atual.** As entradas reais para `ParentArea` são 10 (`ProfileScreen.js:323`,
   `HomeScreen.js:748`, `CongratsScreen.js:209` e `:380`, `QuizScreen.js:64`,
   `StoryDetailScreen.js:341`, `StoryBookScreen.js:541`, `PostStoryHubScreen.js:69`,
   `AtelierCanvasScreen.js:447`, `NarrationScreen.js:122`), **todas passando pelo gate**.
6. **Decisão aprovada relacionada.** 4A/4B: superfície infantil oferece apenas orientação neutra
   equivalente a pedir ajuda a um adulto.
7. **Dependências.** —
8. **Fase de implementação.** 7.
9. **Validação futura.** `VFP`.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** Não necessária.

---

#### `P-49` — Arte da criança no Livrinho viva no código e morta no runtime

1. **Descrição factual.** `storyBookPagesService`, `getBestStoryBookVisual` e
   `getBookPageImageSource` existem sem caminho de execução.
2. **Superfície afetada.** Livrinho da Fé.
3. **Dado envolvido.** **Pintura feita pela criança** reaproveitada como ilustração do livro.
4. **Decisão necessária.** Se a criação da criança pode ser reexibida fora da tela onde foi criada —
   e, em caso afirmativo, sob qual regra.
5. **Evidência atual.** Verificado pelo integrador; sem consumidor de runtime.
6. **Decisão aprovada relacionada.** 4D: nenhum dado infantil é apagado para resolver
   inconsistência; a criação pertence à criança local.
7. **Dependências.** Mesmo bloco de correção de `P-37`.
8. **Fase de implementação.** 10.
9. **Validação futura.** `VFP+TEL`.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** Não necessária **para privacidade** (é reuso interno, sem saída do
    aparelho). A decisão de produto sobre exibir ou não permanece na Fase 10.

---

#### `P-62` — `DEFAULT_PROFILE` sem campo `id`

1. **Descrição factual.** `ProfileContext.js:9-13` não define `id`; `BrincarScreen.js:191` chaveia
   pelo `avatarId`.
2. **Superfície afetada.** Brincar, Perfil infantil.
3. **Dado envolvido.** Identidade da criança local.
4. **Decisão necessária.** Nenhuma nova — 4D já fixou o contrato.
5. **Evidência atual.** Existe uma camada paralela **não adotada**: `childProfileService.js` cria
   `child_<timestamp>_<aleatório>` (`appDataModel.js:14-16, 28-38`) e grava em
   `@ptf_child_profiles_v1` / `@ptf_active_child_id_v1`, mas o próprio cabeçalho declara que
   "`ProfileContext` continua lendo `@ptf_profile` diretamente".
6. **Decisão aprovada relacionada.** 4D: uma única criança local por instalação, com identificador
   local estável criado na primeira execução.
7. **Dependências.** `P-61`, `P-141`.
8. **Fase de implementação.** 12A.
9. **Validação futura.** `VFP+TEL`.
10. **Impacto no lançamento.** Não bloqueia isoladamente (a consequência bloqueante está em `P-141`).
11. **Resposta do fundador.** Não necessária.

---

#### `P-64` — Área dos Pais promete 3 artes salvas contra limite real 0

1. **Descrição factual.** `ParentAreaScreen.js:840` anuncia 3 artes salvas; `atelierStorage.js:10`
   define limite 0.
2. **Superfície afetada.** Área dos Pais.
3. **Dado envolvido.** Nenhum dado pessoal; é **promessa feita ao responsável**.
4. **Decisão necessária.** O texto da superfície adulta não pode prometer o que o produto não
   entrega.
5. **Evidência atual.** Comprovada por leitura cruzada dos dois arquivos.
6. **Decisão aprovada relacionada.** 4A: o limite do plano grátis no Criar Livre é zero salvamento e
   não muda; o texto é que está errado; a política distinta do Colorir com o Beni é preservada.
7. **Dependências.** `P-63`.
8. **Fase de implementação.** 12A.
9. **Validação futura.** `VFP+TEL+GRA`.
10. **Impacto no lançamento.** **Falta para lançamento** (`PBL`).
11. **Resposta do fundador.** Não necessária.

---

#### `P-66` — Mensagem comercial dentro de `accessibilityLabel`

1. **Descrição factual.** `BrincarScreen.js:324` coloca oferta comercial no rótulo de acessibilidade.
2. **Superfície afetada.** Brincar — e, pela auditoria desta fase, **mais quatro pontos**.
3. **Dado envolvido.** Nenhum; é comunicação comercial dirigida à criança por voz sintetizada.
4. **Decisão necessária.** Nenhuma nova — 4A/4B já proibiram.
5. **Evidência atual (ampliada nesta fase).** Rótulos lidos por leitor de tela para a criança:
   `BrincarScreen.js:321-325` (`'Minhas artes, guardar é do Plano Família, ver'`),
   `MonteACenaHomeScreen.js:142` (`'Meus Quadros. Disponível no Plano Família.'`),
   `MonteACenaHomeScreen.js:48` (anexa `'Plano Família.'` ao rótulo de cada história premium),
   `MonteACenaStoryScreen.js:35`, `AtelierCanvasScreen.js:733` (`'Ver Plano Família'`).
   **Nenhum contém preço nem verbo de compra** — o que é verbalizado é a marca do plano e a condição
   de bloqueio.
6. **Decisão aprovada relacionada.** 4A: nenhuma superfície infantil exibe preço, desconto, teste
   grátis, urgência ou convite a assinar. 4B: a proibição alcança explicitamente
   `accessibilityLabel`, leitor de tela, áudio e qualquer mensagem falada.
7. **Dependências.** `P-28`.
8. **Fase de implementação.** 12A.
9. **Validação futura.** Revalidar na Fase 5 e na 21; `VFP+TEL+IOS` com VoiceOver/TalkBack ligado.
10. **Impacto no lançamento.** Não bloqueia formalmente, mas a correção é de **voz comercial dirigida
    a criança** e por isso é prioridade da Fase 5.
11. **Resposta do fundador.** Não necessária. **Registro:** a correção agora alcança **5 pontos**, e
    não apenas o originalmente enunciado — sem criar código novo, por instrução desta fase.

---

#### `P-73` — Comentários de `routes.js` afirmam gate interno inexistente

1. **Descrição factual.** `routes.js:54-59` descreve cerca interna para Ovelhinha e Palavrinhas que
   `AppNavigator.js:421` e `:438` não aplicam.
2. **Superfície afetada.** Navegação; documentação de código.
3. **Dado envolvido.** Nenhum.
4. **Decisão necessária.** A documentação de código não pode declarar portão que não existe — o
   risco é confiar num controle inexistente ao decidir privacidade.
5. **Evidência atual.** Comprovada por leitura cruzada.
6. **Decisão aprovada relacionada.** — (é higiene documental do contrato de portões).
7. **Dependências.** `P-115`.
8. **Fase de implementação.** 16.
9. **Validação futura.** `NEF` — não exige aparelho físico.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** Não necessária.

---

#### `P-82` — Três serviços de recompensa sem consumidor de runtime

1. **Descrição factual.** `certificateService`, `shareCardService` e `weeklyReportService` aparecem
   só dentro dos próprios arquivos.
2. **Superfície afetada.** Recompensas; **relatório ao responsável**; **compartilhamento**.
3. **Dado envolvido.** `childId`, `storyId`, `drawingKey`, `achievementId` (modelos em
   `appDataModel.js:141-201`), além de contagens semanais de progresso.
4. **Decisão necessária.** Nenhuma nova — 4D já os colocou fora do v1.
5. **Evidência atual (remedida nesta fase, sem consultar a medição anterior).**
   `certificateService.js` → 0 importadores em produção, 3 referências textuais em `scripts/smoke.js`
   (`:6459`, `:6532-6538`). `shareCardService.js` → 0 importadores, 5 referências
   (`:6460`, `:6542-6548`, `:6552-6554`). `weeklyReportService.js` → 0 importadores, 3 referências
   (`:6461`, `:6558-6564`). Os checks são `readFileSync` + `includes()` sobre o fonte — **não
   executam o módulo**. O certificado que a criança vê é modal local em `CongratsScreen.js:438-467`,
   que **não** importa o serviço, e a fumaça proíbe `Share`, `shareAsync`, `printAsync`,
   `MediaLibrary` e `Permissions` nessa tela (`smoke.js:18372-18380`, `:18534-18542`).
6. **Decisão aprovada relacionada.** 4D: certificados, cartões de compartilhamento e relatório
   semanal ficam **fora da versão 1**; remove-se do runtime apenas o comprovadamente morto,
   preservando o histórico no Git e registrando as ideias no backlog.
7. **Dependências.** `P-39`, `P-147`, `P-148`.
8. **Fase de implementação.** 11 (contrato) / 16 (remoção).
9. **Validação futura.** `VFP+TEL`.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** Não necessária.

---

#### `P-85` — Zero telemetria em todo o domínio do Brincar

1. **Descrição factual.** Zero analytics em `src/`; `performanceTrace.js:9` declara "SEM analytics".
2. **Superfície afetada.** Todo o produto.
3. **Dado envolvido.** Qualquer evento de uso — potencialmente **dado de comportamento de criança**.
4. **Decisão necessária.** **Se, o que, quando e sob qual autorização o produto coleta.** É a
   decisão central desta fase.
5. **Evidência atual (auditoria independente).** Nenhum SDK de analytics, crash reporting ou
   atribuição está instalado — busca por `sentry|bugsnag|crashlytics|datadog|logrocket|instabug|
   amplitude|posthog|mixpanel|segment|appsflyer|branch|firebase|expo-insights|expo-updates` em
   `package.json`, `app.json`, `eas.json`, `App.js` e `src/` retorna **zero**. Nenhum envio de evento:
   busca por `fetch(|XMLHttpRequest|axios|WebSocket|sendBeacon|uploadAsync` não encontra nenhum POST.
   Rede só para **download de conteúdo** (`globalManifestService.js:211`,
   `packDownloadService.js:520-521, 611-618`). Não há toggle de analytics em nenhuma superfície; as
   preferências persistidas (`appDataModel.js:62-72`) são `notificationsEnabled`,
   `sundayStoryReminderEnabled`, `familyReminderEnabled`, `allowShareCards`,
   `allowProgressReports`, `allowChurchMode` — **nenhum campo de telemetria**. Não há A/B test,
   remote config nem survey. `app.json` declara `NSPrivacyTracking: false`,
   `NSPrivacyCollectedDataTypes: []`, `NSPrivacyTrackingDomains: []`.
6. **Decisão aprovada relacionada.** `docs/fase3-reconciliacao/05_TAXONOMIA_EVENTOS_PESQUISA.md:19-31`
   é **explicitamente não-autorizante**: "ESTE DOCUMENTO NÃO AUTORIZA ANALYTICS DE PRODUÇÃO… não
   integrar SDK".
7. **Dependências.** `P-127`, `P-139`.
8. **Fase de implementação.** 5.
9. **Validação futura.** `NEF` para a decisão; física se algum coletor for ligado.
10. **Impacto no lançamento.** Não bloqueia tecnicamente. **Bloqueia a decisão** de `P-127` e `P-139`.
11. **Resposta do fundador.** **SIM — Pergunta 4.**

---

#### `P-92` — `plugins/withPrivacyManifest.js` órfão

1. **Descrição factual.** O plugin existe e não está registrado em `app.json`.
2. **Superfície afetada.** Configuração de build; manifesto de privacidade da App Store.
3. **Dado envolvido.** Declaração de APIs acessadas e de dados coletados.
4. **Decisão necessária.** Confirmar a fonte canônica do manifesto de privacidade.
5. **Evidência atual — e correção de leitura (ver conflito C-1).** O `app.json` **já declara
   nativamente** `expo.ios.privacyManifests`, com `NSPrivacyAccessedAPICategoryUserDefaults` (razão
   `CA92.1`), `NSPrivacyCollectedDataTypes: []`, `NSPrivacyTracking: false` e
   `NSPrivacyTrackingDomains: []`. O cabeçalho do próprio plugin (`plugins/withPrivacyManifest.js:2-15`)
   declara-se **"PLUGIN SUPERSEDIDO / NÃO está registrado em app.json"**, e
   `scripts/smoke.js:4116-4117` **trava** esse estado. Portanto o plugin é **órfão por decisão**, e
   não uma lacuna aberta de manifesto.
6. **Decisão aprovada relacionada.** —
7. **Dependências.** `P-94`.
8. **Fase de implementação.** 20.
9. **Validação futura.** Verificar o `PrivacyInfo.xcprivacy` gerado pelo prebuild do SDK 54.
10. **Impacto no lançamento.** **Falta para lançamento** (`PBL`) — mas o item que falta é
    **verificar o artefato gerado**, não escrever plugin.
11. **Resposta do fundador.** Não necessária. **A conformidade jurídica da declaração é encaminhada
    à revisão legal, não concluída aqui** — em particular a coerência de `NSPrivacyCollectedDataTypes: []`
    com a presença do SDK da RevenueCat (conflito C-9).

---

#### `P-93` — `EXPO_PUBLIC_REVENUECAT` ausente de todos os perfis

1. **Descrição factual.** As variáveis são lidas no código e não existem em nenhum perfil do
   `eas.json` nem no `.env.example`.
2. **Superfície afetada.** EAS, paywall, Área dos Pais.
3. **Dado envolvido.** Identificador de usuário do RevenueCat e dados de compra.
4. **Decisão necessária.** Nenhuma nova quanto ao nome das chaves; **sim** quanto ao identificador
   enviado (ver Seção 9).
5. **Evidência atual.** `entitlementSource.js` é o **único** módulo que importa o SDK (`:28`).
   `configureRevenueCat()` (`:51-62`) é **fail-closed**: sem chave retorna `false` **antes** de
   qualquer chamada ao SDK (`:55`); `fetchEntitlement()` (`:97-105`) retorna `null` em qualquer erro,
   resolvendo `free`. `Purchases.configure({ apiKey })` (`:56`) **não passa `appUserID`** — busca por
   `Purchases.logIn|setAttributes|collectDeviceIdentifiers|setEmail|appUserID` em todo o repositório
   retorna **apenas** essa linha. Hoje, em qualquer build feito deste repositório, o SDK cai no ramo
   "sem chave".
6. **Decisão aprovada relacionada.** 4A: nomes das variáveis fixados; entitlement e offering
   `familia`; Eduardo executa a integração; Amanda valida preço e textos.
7. **Dependências.** `P-24`.
8. **Fase de implementação.** 18.
9. **Validação futura.** `VFP+TEL+FAM`.
10. **Impacto no lançamento.** Bloqueador (`BLA`).
11. **Resposta do fundador.** Não necessária para as chaves. **Ver Seção 9** quanto a `appUserID`.

---

#### `P-100` — Voz do Beni em autoplay sem card de consentimento

1. **Descrição factual.** Home, Perfil e Estrelinhas tocam a voz automaticamente sem qualquer pedido
   prévio.
2. **Superfície afetada.** Áudio, Home, Perfil infantil, Estrelinhas.
3. **Dado envolvido.** Nenhum dado pessoal; é **experiência não solicitada dirigida a criança**.
4. **Decisão necessária.** Se o produto pede autorização antes do primeiro som, e a quem pede.
5. **Evidência atual.** Comprovado pelo código. O fluxo formal de consentimento parental existe mas
   está desligado por literal: `featureFlags.js:23` (`PARENTAL_CONSENT_FLOW_ENABLED = false`), com
   justificativa escrita "enquanto NÃO houver compartilhamento, conta, envio externo, imagem/áudio da
   criança ou recurso sensível" — premissa hoje **parcialmente falsa** (conflito C-4).
6. **Decisão aprovada relacionada.** 4B: nenhuma oferta comercial verbalizada. Não há decisão
   aprovada sobre **autoplay não comercial**.
7. **Dependências.** `P-102`.
8. **Fase de implementação.** 8A.
9. **Validação futura.** Revalidar na Fase 5 e na 21; `VFP+TEL`.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** **SIM** — está embutida na Pergunta 5 (consentimento e o que o
    responsável autoriza no primeiro uso).

---

#### `P-107` — `SHOW_CHURCH_MODE` é a única flag interna com cerca simples

1. **Descrição factual.** A flag depende de **uma única** variável de ambiente, enquanto
   `RELEASE_PACK_QA_ENABLED` usa cerca quádrupla.
2. **Superfície afetada.** Gates de build; Modo Igreja.
3. **Dado envolvido.** Turmas, nomes de líder, códigos de convite — dados de **terceiros**, não da
   criança do aparelho.
4. **Decisão necessária.** Se o Modo Igreja existe no lançamento e, existindo, sob qual cerca.
5. **Evidência atual (leitura direta do arquivo).**
   `SHOW_CHURCH_MODE = process.env.EXPO_PUBLIC_ENABLE_CHURCH_MODE === 'true'`
   (`featureFlags.js:35-36`) — **uma condição**. Comparar com `RELEASE_PACK_QA_ENABLED` (`:59-64`,
   quatro condições), `CREATOR_QA_MODE_RELEASE_ENABLED` (`:85-88`, cinco condições) e
   `COLORIR_60_CREATION_PILOT_ENABLED` (`:122-124`, cerca dupla com nome de perfil exato).
   O comentário do próprio arquivo (`:28-31`) declara a decisão como **congelada**: "o Modo Igreja
   NÃO aparece no v1 — fica atrás de uma flag de BUILD".
6. **Decisão aprovada relacionada.** `DECISIONS.md` #5 (congelamento). 4D **não** decidiu o destino.
7. **Dependências.** `P-115`, `P-108`.
8. **Fase de implementação.** 19.
9. **Validação futura.** Confirmar que nenhum perfil de produção define
   `EXPO_PUBLIC_ENABLE_CHURCH_MODE`.
10. **Impacto no lançamento.** **Falta para lançamento** (`PBL`) — critério 7 se falhar.
11. **Resposta do fundador.** **SIM — Pergunta 8** (destino do Modo Igreja).

---

#### `P-108` — Modo Igreja com escritores sem consumidor e campo trocado

1. **Descrição factual.** `setWeeklyStory` e `getChurchProgressSummary` não têm chamador,
   `weeklyStory` não é persistido e `churchName` é gravado no lugar da faixa etária.
2. **Superfície afetada.** Modo Igreja (Área dos Pais, atrás de flag).
3. **Dado envolvido.** Nome da turma, **nome do líder**, nome da igreja, faixa etária, código de
   convite, `childrenIds`.
4. **Decisão necessária.** Se o produto guarda dados de turma e de terceiros, e sob qual contrato.
5. **Evidência atual (leitura direta).** `ParentAreaScreen.js:429` grava
   `churchName: churchForm.ageGroup.trim()` com o comentário "faixa/grupo guardado no campo
   existente". `:432` monta `enriched` com `ageGroup` e `weeklyStory` **apenas em estado React** —
   nunca chega ao AsyncStorage; `createChurchGroup` (`appDataModel.js:105-119`) não tem esses campos.
   `getChurchProgressSummary` (`churchModeService.js:101-115`) devolve `childrenIds` e
   `progressByChild` — estrutura preparada para **progresso por criança dentro de um grupo**, jamais
   populada. `inviteCode` é gerado localmente com 6 caracteres de um alfabeto de 32
   (`appDataModel.js:121-128`) e é **exibido na interface**. Persistência única:
   `@ptf_church_groups_v1`. Existe ainda `PLAN_TIER.CHURCH` no modelo de plano
   (`appDataModel.js:76-82`), sem caminho que o atribua.
6. **Decisão aprovada relacionada.** 4D: escritores sem consumidor seguem a regra geral — remoção só
   do comprovadamente morto e só após auditoria de leitores, escritores e histórico; **a 4D NÃO
   decidiu o destino do Modo Igreja**.
7. **Dependências.** `P-107`.
8. **Fase de implementação.** 12B.
9. **Validação futura.** `VFP+TEL`.
10. **Impacto no lançamento.** Não bloqueia (a seção não aparece em produção).
11. **Resposta do fundador.** **SIM — Pergunta 8.**

---

#### `P-112` — `App.js:88` usa `console.warn` cru em produção

1. **Descrição factual.** A chamada ignora o logger já importado no próprio arquivo.
2. **Superfície afetada.** Higiene de logs; console do dispositivo em build de loja.
3. **Dado envolvido.** Objeto de erro da migração de storage — pode conter **nome de chave** citado
   na mensagem do erro.
4. **Decisão necessária.** O que pode aparecer em log de produção.
5. **Evidência atual (auditoria independente).** 64 linhas com `console.*` em `src/`+`App.js`
   (50 `log`, 14 `warn`, 1 `error`). **Cinco permanecem ativas em build de produção**:
   `App.js:88`, `AtelierCanvas.js:487`, `:557`, `:569`, `:596`. **Não existe**
   `babel-plugin-transform-remove-console` — `babel.config.js:1-10` traz apenas
   `presets: ['babel-preset-expo']`. A supressão é **manual**, via `__DEV__`, com wrapper em
   `utils/logger.js:16-26`, cuja regra escrita (`:5-8`) já proíbe logar dados pessoais de crianças,
   tokens, conteúdo de desenhos ou dados de compra. **Nenhum log encontrado imprime nome da criança,
   caminho absoluto, URL completa ou base64 de pintura** — busca específica retorna zero. O único log
   com identificador de perfil é `childProfileService.js:168` (`profile.id`), sob `__DEV__`.
6. **Decisão aprovada relacionada.** —
7. **Dependências.** —
8. **Fase de implementação.** 19.
9. **Validação futura.** `NEF`.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** Não necessária — o contrato da Seção 10 é derivável das decisões já
    aprovadas.

---

#### `P-127` — Boot instrumentado sem nenhuma amostra coletada

1. **Descrição factual.** `performanceTrace.js` instrumenta o boot e não há registro de amostra.
2. **Superfície afetada.** Desempenho / diagnóstico.
3. **Dado envolvido.** Marcas de tempo de boot, com **allowlist anti-PII** já implementada.
4. **Decisão necessária.** Depende inteiramente de `P-85`.
5. **Evidência atual.** Contrato escrito em `performanceTrace.js:9`: "SEM rede, SEM AsyncStorage,
   SEM FileSystem, SEM dependência nova, SEM analytics". Buffer em memória (`:20`), allowlist de
   metadata (`:29`), regex anti-PII (`:32`, `:37`), sanitização (`:64-79`), saída por
   `console.log` de uma linha JSON (`:294`).
6. **Decisão aprovada relacionada.** —
7. **Dependências.** `P-85`.
8. **Fase de implementação.** 9.
9. **Validação futura.** `VFP+TEL+AND+IOS`.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** **Indireta** — resolvida pela resposta de `P-85`.

---

#### `P-139` — Coletor de desempenho inalcançável em qualquer perfil de build

1. **Descrição factual.** `performanceTrace.js:44-52` só liga em `__DEV__` ou com
   `EXPO_PUBLIC_PTF_PERF_TRACE`, que nenhum perfil do `eas.json` declara; não há script npm para
   `scripts/perf-baseline-report.js`; nenhuma superfície além do boot está instrumentada.
2. **Superfície afetada.** Desempenho / diagnóstico.
3. **Dado envolvido.** Idem `P-127`.
4. **Decisão necessária.** Depende de `P-85`.
5. **Evidência atual.** Confirmada nesta fase: o nome da variável não aparece em nenhum perfil.
6. **Decisão aprovada relacionada.** —
7. **Dependências.** `P-127`, `P-85`.
8. **Fase de implementação.** 6.
9. **Validação futura.** `NEF` para a decisão.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** **Indireta.**

---

#### `P-141` — `avatarId` usado como identidade e endereço de armazenamento da criança

1. **Descrição factual.** O padrão `profile.id || profile.avatarId` em sete telas resolve sempre
   para o identificador do avatar.
2. **Superfície afetada.** Perfil, Brincar, Monte a Cena, Ateliê, Storage.
3. **Dado envolvido.** **Todo o progresso, sessões e índice de artes da criança.**
4. **Decisão necessária.** Nenhuma nova — 4D fixou o contrato integral.
5. **Evidência atual.** Sete pontos comprovados (`BrincarScreen.js:191`,
   `MonteACenaHomeScreen.js:81`, `MonteACenaStoryScreen.js:65`, `MonteACenaGameV2Screen.js:38`,
   `MonteACenaTableGameScreen.js:406`, `MonteACenaGalleryScreen.js:49`,
   `AtelierCanvasScreen.js:48`).
6. **Decisão aprovada relacionada.** 4D: identificador local estável na primeira execução; nome e
   avatar são atributos editáveis, nunca identidade; `avatarId` **nunca** como endereço de
   armazenamento; dados legados associados ao perfil criado, nunca abandonados.
7. **Dependências.** `P-62`, `P-114`, `P-55`.
8. **Fase de implementação.** 19.
9. **Validação futura.** `VFP+TEL+MIG` — em estado migrado.
10. **Impacto no lançamento.** Bloqueador (`BLA`).
11. **Resposta do fundador.** Não necessária. **Restrição desta fase:** o `childId` local estável
    aprovado na 4D **não pode ser convertido em identificador remoto** por nenhuma decisão de
    analytics (ver Seção 9).

---

#### `P-144` — Nenhum aviso de perda de dados por desinstalação

1. **Descrição factual.** Nenhuma superfície informa ao responsável que desinstalar pode apagar
   progresso e criações.
2. **Superfície afetada.** Área dos Pais.
3. **Dado envolvido.** Todo o dado local da criança.
4. **Decisão necessária.** Nenhuma nova — 4D aprovou a frase de referência.
5. **Evidência atual.** Ausência verificada em toda a árvore `src/`.
6. **Decisão aprovada relacionada.** 4D: o produto não promete recuperar dados infantis após a
   desinstalação; só o direito comercial é restaurável pela conta da loja; frase aprovada:
   *"Desinstalar o aplicativo pode apagar o progresso e as criações salvas neste aparelho."*
7. **Dependências.** `P-145`, `P-140`.
8. **Fase de implementação.** 19.
9. **Validação futura.** `VFP+TEL+REI` (reinstalação real).
10. **Impacto no lançamento.** **Falta para lançamento** (`PBL`).
11. **Resposta do fundador.** Não necessária.

---

#### `P-145` — Apagar todos os dados locais anunciado ao responsável e não implementado

1. **Descrição factual.** `ParentAreaScreen.js:1055-1063` exibe o cartão com selo "Em preparação" e
   **sem nenhum manipulador de toque**.
2. **Superfície afetada.** Área dos Pais.
3. **Dado envolvido.** Todo o dado local, incluindo perfil, desenhos e configurações.
4. **Decisão necessária.** Nenhuma nova — 4D fixou as quatro operações e seus portões.
5. **Evidência atual (texto exato, confirmado nesta fase).** Selo `:1061` — **"Em preparação"**;
   descrição `:1058` — *"Esta opção apagará também o perfil, os desenhos e as configurações. Estará
   disponível em uma atualização futura, com confirmação adicional de segurança."*
6. **Decisão aprovada relacionada.** 4D: quatro operações distintas (recomeçar a jornada · apagar
   downloads · apagar uma criação · apagar todos os dados locais); a exclusão total exige portão
   parental, confirmação dupla, digitação de palavra e lista explícita do que será perdido; o direito
   comprado não é apagado; o cartão "Em preparação" deve ser removido ou substituído pela operação
   real antes do lançamento.
7. **Dependências.** `P-35`, `P-114`, `P-144`.
8. **Fase de implementação.** 19.
9. **Validação futura.** `VFP+TEL`.
10. **Impacto no lançamento.** **Falta para lançamento** (`PBL`).
11. **Resposta do fundador.** Não necessária. **Lacuna descoberta nesta fase:** a operação **C**
    (apagar **uma** criação) existe hoje **também fora** da Área dos Pais, sem portão nenhum
    (`AtelierGalleryScreen.js:58-73`, botão 🗑️ em `:245`, protegida só por `Alert.alert`) — isso
    **não** foi decidido pela 4D e vira a **Pergunta 3**.

---

#### `P-147` — Suíte de fumaça exige a existência do código sem consumidor

1. **Descrição factual.** `scripts/smoke.js` afirma a existência dos três serviços sem consumidor,
   de um export órfão e de uma chave sem dono.
2. **Superfície afetada.** Portão de qualidade.
3. **Dado envolvido.** Nenhum.
4. **Decisão necessária.** Nenhuma nova.
5. **Evidência atual (remedida).** Confirmado: os checks `:6532-6564` são `includes()` sobre o fonte.
   **Precisão adicional desta fase:** `clearSeenAchievements` **não** é referenciado pela fumaça (0
   ocorrências) — ao contrário de `getStoryRewardBreakdown` (`:1770-1772`). E `totalBonusStars`
   também **não** aparece na fumaça, embora `addBonusStars` seja **executado de fato** em
   `:22017-22030`.
6. **Decisão aprovada relacionada.** 4D: as asserções que fixam o código morto serão ajustadas
   **junto com** a remoção, nunca antes dela.
7. **Dependências.** `P-82`, `P-148`, `P-143`, `P-39`.
8. **Fase de implementação.** 16.
9. **Validação futura.** `NEF`.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** Não necessária.

---

#### `P-148` — Exports órfãos dentro de módulos vivos

1. **Descrição factual.** `rewardService.js:33` (`getStoryRewardBreakdown`) e
   `achievementsStorage.js:35` (`clearSeenAchievements`) não têm consumidor; os módulos permanecem
   vivos por outros exports.
2. **Superfície afetada.** Recompensas, conquistas.
3. **Dado envolvido.** `@ptf_achievements_seen` e cálculo de estrelas.
4. **Decisão necessária.** Nenhuma nova.
5. **Evidência atual (remedida).** `rewardService.js` vive por `getRewardsSummary`, importado em
   `ProgressContext.js:19` e usado em `:91`. `achievementsStorage.js` vive por
   `getSeenAchievements` (`:13`) e `markAchievementSeen` (`:23`), consumidos via
   `achievementSeenService.js:7-10` e `TrophiesScreen.js:36-39`.
6. **Decisão aprovada relacionada.** 4D: remover do runtime apenas o comprovadamente morto.
7. **Dependências.** `P-82`, `P-147`.
8. **Fase de implementação.** 16.
9. **Validação futura.** `NEF`.
10. **Impacto no lançamento.** Não bloqueia.
11. **Resposta do fundador.** Não necessária.

---

## 3. Inventário das superfícies

Quinze superfícies × dez atributos. Legenda de portão: **E** = gate de entrada da Área dos Pais ·
**L** = gate adicional de link · **B** = cerca de build · **—** = nenhum.

### 3.1 Superfícies infantis

| Atributo | **Home infantil** | **Mapa / Aventuras** | **Brincar** | **Estrelinhas** | **Perfil infantil** |
|---|---|---|---|---|---|
| Público esperado | Criança | Criança | Criança | Criança | Criança |
| Exige portão | — | — | — | — | — |
| Dados exibidos | Nome e avatar; card do Beni | Progresso por história; selo de plano | Rodadas do dia; recordes locais | Estrelas, conquistas | Nome, avatar, resumo |
| Dados modificáveis | Nenhum | Nenhum | Contadores de rodada | Marca de conquista vista | **Nome e avatar** |
| Ações externas | Nenhuma | Nenhuma | Nenhuma | Nenhuma | Nenhuma |
| Comunicação comercial possível | Só marca "Plano Família" | **Sim** — badge + "Peça a um responsável para desbloquear" | **Sim** — texto e `accessibilityLabel` (`P-66`) | **Sim** — conquista `first_premium_story_done` cita a trilha | Não |
| Risco de a criança alcançar | É a superfície dela | É a superfície dela | É a superfície dela | É a superfície dela | É a superfície dela |
| Comportamento sem rede | Integral | Integral (packs baixados) | Integral | Integral | Integral |
| Comportamento em produção | Idêntico | Idêntico | Idêntico | Idêntico | Idêntico |
| Evidência futura | Vídeo do primeiro contato com áudio (`P-100`) | Print do badge sem preço | Print + leitor de tela ligado (`P-66`) | Print da lista de conquistas | Print da troca de avatar **após** `P-141` |

### 3.2 Superfícies adultas

| Atributo | **Área dos Pais** | **Paywall** | **Restaurar compra** | **Configurações** | **Exportar obra** |
|---|---|---|---|---|---|
| Público esperado | Responsável | Responsável | Responsável | Responsável | Responsável |
| Exige portão | **E** | **E** (4A/4B) | **E** (4A) | **E** | **E** (4D) |
| Dados exibidos | **Nome da criança** (`:686`), progresso por história (`:786-817`), plano, versão | Itens do plano; hoje **sem preço renderizado** | Estado da restauração | 2 switches (sons, música) | Nome do arquivo da criação |
| Dados modificáveis | Progresso, downloads, criações, preferências | Nenhum hoje | Direito comercial | Preferências de áudio | Nenhum |
| Ações externas | `mailto` (com **L**); loja (**sem gate**, `:1091`) | Compra (futuro) | Loja (futuro) | Nenhuma | Folha de compartilhamento do SO (futuro) |
| Comunicação comercial possível | **Sim, é o lugar dela** | **Sim** | **Sim** | Não | Não |
| Risco de a criança alcançar | **Real** — gate é multiplicação e **nunca expira** | Idem | Idem | Idem | Idem |
| Comportamento sem rede | Integral; `loadParentData()` (`:368-381`) engole erro | Sem preço/compra | Falha | Integral | Depende da resposta 7 |
| Comportamento em produção | Sem a seção dev | Depende da Fase 18 | Hoje **sem botão** (código morto `:507-510`) | Idêntico | **Não existe hoje** |
| Evidência futura | Vídeo do gate + expiração escolhida | Print pós-gate | Print de restauração real | Print | Vídeo da exportação |

### 3.3 Superfícies condicionais e internas

| Atributo | **Diagnósticos** | **Links externos** | **Modo Criador** | **Modo Igreja** | **Ferramentas internas** |
|---|---|---|---|---|---|
| Público esperado | Equipe | Responsável | Equipe | Responsável / líder | Equipe |
| Exige portão | **B** | **E+L** (e-mail) / **E** (loja) | **E+B** | **E+B** | **E+B** |
| Dados exibidos | Tempos de boot; diagnóstico de download sanitizado | Endereço de e-mail; URL da loja | Banner global; estado de QA | Turmas, **nome do líder**, faixa, código de convite | Bancadas, packs, validação de cenas |
| Dados modificáveis | Nenhum persistido | Nenhum | Plano de teste (`PLAN_TIER.CREATOR_QA`) | Turmas locais | Onboarding, guias, packs |
| Ações externas | Nenhuma | **Sim** — `Linking.openURL` | Nenhuma | **Sim** — `Share.share` de texto (`:449`) | Download de pack sandbox |
| Comunicação comercial possível | Não | Sim (loja) | Não | Não | Não |
| Risco de a criança alcançar | Nulo em produção | Baixo (atrás do gate) | Nulo em produção | Nulo em produção | Nulo em produção |
| Comportamento sem rede | Integral | Falha ao abrir | Integral | `Share` local; sem rede obrigatória | Packs falham |
| Comportamento em produção | **Não compila** — `isInternalToolsEnabled()` = `false` | Loja: hoje inalcançável (`storeUrl === null`) | **Não compila** (cerca quíntupla) | **Não aparece** — mas cerca é **simples** (`P-107`) | **Não compila** (cerca quádrupla) |
| Evidência futura | Confirmar ausência no APK de produção | Print do gate antes de cada link | Confirmar ausência do banner | Confirmar que nenhum perfil de produção declara a env | Confirmar ausência da seção |

**Como o Modo Criador é ativado — comprovado.** Por um `Switch` na seção "🛠️ Administração (dev)"
(`ParentAreaScreen.js:1131-1139` → `handleToggleQa` `:474-478`), portanto **dentro** da área já
protegida pelo portão e sob duplo gate (`SHOW_TEST_TOOLS` e `isCreatorQaModeAllowed()`). **Não
existe gesto secreto, toque longo nem sequência de toques**: a busca por
`onLongPress|delayLongPress|tapCount|secretTap|numberOfTaps` em todo `src/` retorna **zero**. O modo
concede acesso premium via `accessControl.js:74`, mas **nunca grava plano, compra ou recibo** — o
que confirma no código a ratificação 4D de que estado de teste não vira direito comercial.

**Fato transversal registrado:** nenhuma superfície faz `fetch` de envio. As três saídas do aparelho
são `Linking.openURL` (`ParentAreaScreen.js:523` e `:1091`), `Share.share` (`:449`) e o tráfego
interno do SDK da RevenueCat, **todas na superfície adulta**.

---

## 4. Decisões já aprovadas que esta fase preserva

### 4.1 Da Fase 4A

1. Nome público único **Plano Família**; produtos mensal e anual; teste grátis de 7 dias só no anual.
2. **Nenhum preço, desconto, urgência, contagem regressiva ou convite a assinar na superfície
   infantil** — apenas orientação neutra equivalente a pedir ajuda a um adulto.
3. Toda explicação comercial fica **atrás do gate parental**.
4. **Restauração exposta na Área dos Pais e no paywall pós-gate**, nunca na superfície infantil.
5. Limite do plano grátis no Criar Livre é **zero salvamento**; o Colorir com o Beni salva em todos
   os planos.

### 4.2 Da Fase 4B

6. A proibição comercial alcança **explicitamente** `accessibilityLabel`, leitor de tela, áudio e
   qualquer mensagem falada — **"oferta que a criança ouve é oferta feita à criança"**.
7. **O gate parental precede qualquer paywall, preço, oferta ou informação comercial.**

### 4.3 Da Fase 4C

8. Fonte canônica única para estrelinhas, sem perda na migração.
9. Estrelinhas nunca são gastas e não autorizam conteúdo premium.

### 4.4 Da Fase 4D (preservadas integralmente, sem reabertura)

10. **Uma única criança local por instalação**, com `childId` local estável criado na primeira
    execução.
11. **`avatarId` nunca é identidade nem endereço de armazenamento.**
12. O produto **não promete** recuperar dados infantis após a desinstalação; só o direito comercial é
    restaurável.
13. **Exportação individual atrás de portão parental**, com cinco garantias: sem nome automático da
    criança · sem identificador interno · sem progresso anexado · **sem chamada infantil para rede
    social** · sem uso automático de share cards antigos.
14. **Quatro operações de reset** distintas; a exclusão total exige portão parental, confirmação
    dupla, palavra de confirmação e lista explícita do que será perdido.
15. **Nenhum dado infantil é apagado** para resolver inconsistência.
16. **Estado de teste nunca vira direito comercial**; o maior estado defensável nunca concede o que
    não foi conquistado.
17. Certificados, cartões de compartilhamento e relatório semanal ficam **fora da versão 1**.
18. Remove-se do runtime **apenas o comprovadamente morto**, preservando o histórico no Git.
19. Toda chave nova nasce em `storageKeys.js`; `ptf_atelier_arts_v1_index` **não** é renomeada.

> Nada nesta fase revoga, afrouxa, reinterpreta ou reabre qualquer item acima.

---

## 5. Conflitos encontrados

**15 conflitos.** **6** são resolvíveis pelo integrador com registro documental, **8** exigem
resposta do fundador e **1** é encaminhado à revisão legal, que **não** é concluída aqui.

> **Registro acrescentado na consolidação (§0.6).** **Sete** destes conflitos **não têm código `P`
> correspondente** na matriz canônica: **C-5**, **C-6**, **C-8**, **C-10**, **C-12**, **C-13** e
> **C-15**. Conflito de contrato não exige código de matriz; **nenhum código novo foi criado** por
> essa constatação, em obediência à regra de 4A/4D de *não criar código por simples ampliação de
> evidência*.

| # | Conflito | Evidência | Resolução |
|---|---|---|---|
| **C-1** | `P-92` sugere que o manifesto de privacidade "pode não ser aplicado" por causa do plugin órfão; mas `app.json` **já declara** `expo.ios.privacyManifests` nativamente, e o plugin declara-se **superseded** | `app.json` (bloco `privacyManifests`) · `plugins/withPrivacyManifest.js:2-15` · `scripts/smoke.js:4116-4117` | **Resolvível** — o enunciado do risco está desatualizado; o que falta é **verificar o `PrivacyInfo.xcprivacy` gerado**, não escrever plugin |
| **C-2** | A própria Área dos Pais afirma *"Quando houver recursos de compartilhamento ou envio externo, o responsável será avisado antes. Por enquanto, tudo funciona só com dados locais neste aparelho."* — enquanto `Share.share` **já existe** no Modo Igreja | `ParentAreaScreen.js:952` × `:449` | **Resolvível** — a contradição só é visível sob `SHOW_CHURCH_MODE`; o texto precisa ser reescrito junto com a decisão da Seção 13 |
| **C-3** | O texto de privacidade afirma "sem coleta de dados" enquanto o SDK da RevenueCat é configurado no boot e fala com servidor de terceiro | `App.js:85` → `entitlementSource.js:56` × textos de `ParentAreaScreen.js:888-914` | **Exige o fundador** — Pergunta 11 |
| **C-4** | `PARENTAL_CONSENT_FLOW_ENABLED = false` é justificado por "enquanto NÃO houver compartilhamento, conta, envio externo…" — premissa hoje **parcialmente falsa** (há `Share.share`, `mailto` e SDK de compra) | `featureFlags.js:14-23` × `ParentAreaScreen.js:449, 1077, 1080` × `entitlementSource.js:56` | **Exige o fundador** — Pergunta 5 |
| **C-5** | A 4D aprovou **exportação individual com portão parental**, mas **nenhuma biblioteca de exportação está instalada** e **nenhuma permissão está declarada** | `package.json` sem `expo-sharing`/`expo-media-library` · `app.json` com uma única permissão Android | **Exige o fundador** — Perguntas 6 e 7 |
| **C-6** | A 4A aprovou restauração exposta na Área dos Pais, mas `handleRestorePurchase` **não tem consumidor de JSX** | `ParentAreaScreen.js:320, 507-510` | **Resolvível** — contrato aprovado, implementação pendente na Fase 18 |
| **C-7** | `SHOW_CHURCH_MODE` tem cerca **simples**, contra quádrupla/quíntupla das demais; e `DECISIONS.md` #5 diz "congelada, não aparece no v1" enquanto `P-108` diz "destino não decidido" | `featureFlags.js:35-36` × `:59-64` × `:85-88` | **Exige o fundador** — Pergunta 8 |
| **C-8** | `PLAN_TIER.CHURCH` e `PLAN_TIER.CREATOR_QA` existem no modelo de plano, contra a decisão 4A de **um único plano público** e a ratificação 4D de que estado de teste nunca vira direito comercial | `appDataModel.js:76-82` | **Resolvível** — nenhum caminho atribui esses valores hoje; registrar a proibição e verificar na Fase 18 |
| **C-9** | `NSPrivacyCollectedDataTypes: []` declarado enquanto o SDK da RevenueCat coleta dados de compra | `app.json` × `entitlementSource.js:28, 56, 100` | **Encaminhado à revisão legal / de loja** — esta fase **não conclui conformidade** |
| **C-10** | A Área dos Pais exibe **nome da criança e progresso detalhado** atrás de um gate que **nunca expira**: nem por tempo, nem por ida ao segundo plano, nem por inatividade | `ParentAreaScreen.js:294` (`useState(false)`), sem `AppState`, sem timer, sem persistência | **Exige o fundador** — Pergunta 1 |
| **C-11** | Exclusão **permanente** de uma criação da criança acontece na **superfície infantil**, protegida só por `Alert.alert` — enquanto a 4D exigiu portão para a exclusão total | `AtelierGalleryScreen.js:58-73`, botão em `:245` | **Exige o fundador** — Pergunta 3 |
| **C-12** | O único canal de contato externo é um e-mail marcado no próprio código como **provisório** | `productConfig.js:20-21` (`// TODO: substituir pelo e-mail oficial…`) | **Exige o fundador** — Pergunta 10 |
| **C-13** | **Nenhuma URL de política de privacidade ou de termos existe no app**, embora as lojas as exijam | busca por `privacidade\|política\|termos` em `src/` retorna só texto informativo | **Exige o fundador** — Pergunta 9 (conteúdo legal encaminhado à fase própria) |
| **C-14** | No Modo Igreja, `weeklyStory` é exibido e **nunca persistido**, e a faixa etária é gravada no campo `churchName` | `ParentAreaScreen.js:429, 432` × `appDataModel.js:105-119` | **Resolvível** — defeito técnico; correção pendente na Fase 12B, subordinada à resposta da Pergunta 8 |
| **C-15** | `ENABLE_LOCAL_PREMIUM_TEST_MODE` é um **literal no fonte**, sem nenhuma cerca de ambiente: se algum dia virar `true`, `getCurrentPlan()` devolve `'premium'` **em produção**, emitindo apenas um `console.warn` | `accessControl.js:20` (literal `false`) × `:51-54` | **Resolvível** — hoje está `false` e o `PARENT_AREA_GUIDE.md:158` já o lista no checklist de integridade; passa a ser **verificação obrigatória de pré-publicação** (Seção 17) |

---

## 6. Contrato do portão parental

### 6.1 Estado atual comprovado

| Aspecto | Fato |
|---|---|
| Onde vive | `src/components/ParentalGate.js` — modal único |
| Desafio | Multiplicação `a × b`, com `a ∈ 6..12` e `b ∈ 4..12` (`:9-13`); campo numérico `maxLength=4` (`:87-99`) |
| Validação | `parseInt(input,10) === challenge.answer` (`:47`) |
| Tentativas | **Sem limite, sem espera crescente, sem bloqueio**; novo desafio 1200 ms após erro (`:54-58`) |
| Estado de desbloqueio | `unlockedForSession = useState(false)` (`ParentAreaScreen.js:294`) — **estado local de componente**, sem contexto, sem storage, sem carimbo de tempo |
| Duração | Enquanto a tela permanecer **montada**. Não expira por tempo, nem por segundo plano, nem por inatividade |
| Sobrevive a navegar para frente e voltar | **Sim** |
| Sobrevive a `goBack` e reentrar | **Não** |
| Sobrevive a reabrir o app | **Não** |
| Pontos de uso | **Dois**, ambos em `ParentAreaScreen.js`: entrada (`:636`) e link `mailto` (`:652`) |
| Caminho sem gate para a área adulta | **Nenhum** — o gate é *early-return*; o `NavigationContainer` (`AppNavigator.js:292`) **não recebe prop `linking`**, então nenhum deep link alcança a rota |

### 6.2 As 17 ações e o portão

| # | Ação | Exige portão? | Origem |
|---|---|---|---|
| 1 | Abrir a Área dos Pais | **SIM** | Já implementado; ratificado |
| 2 | Ver preços | **SIM** | 4A / 4B |
| 3 | Iniciar compra | **SIM** | 4A / 4B |
| 4 | Restaurar compra | **SIM** | 4A |
| 5 | Ver política de privacidade | **PENDENTE** | Pergunta 9 |
| 6 | Ver termos | **PENDENTE** | Pergunta 9 |
| 7 | Abrir link externo | **PARCIAL hoje** — `mailto` sim (`:1077`, `:1080`), **loja não** (`:1091`) | Pergunta 2 |
| 8 | Exportar uma criação | **SIM** | 4D |
| 9 | Salvar fora do app | **PENDENTE** | Pergunta 7 |
| 10 | Compartilhar | **SIM** | 4D — sem chamada infantil para rede social |
| 11 | Apagar uma criação | **PENDENTE fora da Área dos Pais** | Pergunta 3 |
| 12 | Recomeçar a jornada | **SIM** — gate de entrada + confirmação dupla + palavra `APAGAR` | 4D |
| 13 | Apagar downloads | **SIM** — gate de entrada + confirmação | 4D |
| 14 | Apagar todos os dados | **SIM** — gate + confirmação dupla + palavra + lista do que se perde | 4D (explícito) |
| 15 | Ativar ferramentas internas | Hoje **cerca de build**, sem autenticação; o contrato é "nunca em produção" | Ver Seção 16 |
| 16 | Ativar Modo Igreja | **Depende da Pergunta 8** | — |
| 17 | Alterar configuração comercial | **SIM** — está dentro da área gated | 4A |

**Contagem — corrigida na §0.3, sem ajuste silencioso.** ~~11 ações com portão já aprovado · 5
pendentes de resposta · 1 governada por cerca de build.~~ **10** ações com portão já aprovado
(1, 2, 3, 4, 8, 10, 12, 13, 14, 17) · **6** pendentes de resposta (5, 6, 7, 9, 11, 16) · **1**
(ferramentas internas, ação 15) governada por cerca de build, não por portão. **10 + 6 + 1 = 17.**

### 6.3 As 7 perguntas de sessão — todas em aberto

| # | Pergunta | Estado atual | Decisão aprovada? |
|---|---|---|---|
| 1 | Quanto dura a sessão adulta | Indefinida — vive com a tela | **Não** |
| 2 | O portão libera **uma ação** ou uma **sessão adulta** | Sessão, de fato: só o `mailto` pede de novo | **Não** |
| 3 | Como a sessão termina | Só por desmontagem da tela | **Não** |
| 4 | O que acontece em segundo plano | Nada — não há listener de `AppState` no gate nem na tela | **Não** |
| 5 | O que acontece por inatividade | Nada — não há temporizador de expiração | **Não** |
| 6 | Voltar pela navegação encerra? | **Sim**, por efeito colateral do desmonte — não por regra escrita | **Não** |
| 7 | Comportamento em tablet / aparelho compartilhado | Idêntico ao de aparelho individual | **Não** |

> Conforme a instrução desta fase, **nenhuma duração e nenhum método foram escolhidos**. Vão à
> Pergunta 1.

### 6.4 Achados adicionais registrados (sem correção nesta fase)

1. O botão da loja chama `Linking.openURL` **fora** de `openWithGate`; hoje só é neutralizado pelo
   `null` em `storeLinks.js:10-11`. Assim que a URL for preenchida, o link abre **sem desafio**.
2. Se a Área dos Pais for a **raiz** da pilha — caso de `NarrationScreen.js:122`, que usa `replace` —
   o botão "Cancelar" do gate **não tem para onde voltar** (`:527-533`).
3. O gate é **um segundo desafio** para os `mailto`, mesmo já estando dentro da área desbloqueada
   (`handleGatePass`, `:517-525`).
4. **Imprecisão documental.** `docs/PARENT_AREA_GUIDE.md:32` descreve o desafio como "matemático
   4-dígitos (resultado entre 4–12, operandos entre 4–12)". O código faz o **produto** de dois
   fatores, com `a ∈ 6..12` e `b ∈ 4..12` — logo o resultado vai de 24 a 144, não de 4 a 12; o "4"
   citado é o `maxLength` do campo de entrada. O guia **não** foi alterado nesta fase: a correção
   pertence ao bloco que implementar o contrato de sessão.

---

## 7. Área dos Pais — estrutura canônica

### 7.1 Estrutura atual (ordem real de renderização)

| # | Bloco | Linha |
|---|---|---|
| 0 | Cabeçalho "Central da família" + `BeniSpeechCard` | `:667-678` |
| 1 | Resumo da criança (aberto por padrão) — **nome, avatar, 3 métricas** | `:681-724` |
| 2 | Jornada e progresso — **progresso por história** | `:727-828` |
| 3 | Plano familiar — cartão informativo, **sem botão acionável** | `:831-864` |
| 4 | Sons e música — 2 switches | `:867-885` |
| 5 | Segurança e privacidade — textos + bloco de consentimento (desligado) | `:888-956` |
| 6 | Gerenciar dados — 3 ações reais + 1 cartão "Em preparação" | `:959-1065` |
| 7 | Sobre e suporte — `mailto` × 2, loja, versão | `:1068-1112` |
| 8 | 🛠️ Administração (dev) — só sob `SHOW_TEST_TOOLS` | `:1118-1266` |
| 9 | ⛪ Modo Igreja — só sob `SHOW_CHURCH_MODE` | `:1273-1404` |

**Ausência comprovada:** não há **nenhuma galeria de criações** na Área dos Pais — nenhuma
miniatura, nenhuma `Image` de desenho. As criações são referidas apenas **em texto**, nas ações de
apagar.

### 7.2 Estrutura canônica proposta — 16 itens classificados

| # | Item | Classificação | Rede? | Confirmação extra? | Copy específica? |
|---|---|---|---|---|---|
| 1 | Resumo da criança (nome, avatar, métricas) | **Lançamento** — já existe | Não | Não | Não |
| 2 | Progresso por história | **Lançamento** — já existe | Não | Não | Não |
| 3 | Plano Família (informativo + preço) | **Lançamento** (Fase 18) | **Sim** | Não | **Sim** — 4A |
| 4 | Iniciar compra | **Lançamento** (Fase 18) | **Sim** | Sim (loja) | **Sim** |
| 5 | Restaurar compra | **Lançamento** (Fase 18) | **Sim** | Não | **Sim** — 4A |
| 6 | Preferências de áudio | **Lançamento** — já existe | Não | Não | Não |
| 7 | Segurança e privacidade (texto) | **Lançamento** | Não | Não | **Sim** — reescrever (C-3) |
| 8 | Política de privacidade e termos | **Lançamento** — obrigatório de loja | **Depende** | Depende do portão (Pergunta 9) | **Sim** |
| 9 | Aviso de perda por desinstalação | **Lançamento** — 4D (`P-144`) | Não | Não | **Sim** — frase aprovada na 4D |
| 10 | A. Recomeçar a jornada | **Lançamento** — 4D | Não | **Sim** — dupla + palavra | **Sim** |
| 11 | B. Apagar downloads | **Lançamento** — 4D | Não | **Sim** | **Sim** |
| 12 | C. Apagar uma criação | **Lançamento** — 4D | Não | **Sim** | **Sim** |
| 13 | D. Apagar todos os dados locais | **Lançamento** — 4D (`P-145`) | Não | **Sim** — dupla + palavra + lista | **Sim** |
| 14 | Painel de uso de armazenamento | **Lançamento** — 4D | Não | Não | **Sim** |
| 15 | Exportação individual de pinturas e artes | **Lançamento** — 4D, **forma pendente** | Depende (Pergunta 7) | **Sim** — portão | **Sim** |
| 16 | Suporte e feedback | **Lançamento** — canal pendente (Pergunta 10) | **Sim** | **Sim** — portão de link | **Sim** |

**Classificados como POSTERIOR ao lançamento:** relatório semanal para responsáveis, certificados
imprimíveis, cartões de compartilhamento (todos fora do v1 por decisão 4D — `P-82`), e o fluxo formal
de consentimento parental caso a resposta da Pergunta 5 seja "não há coleta nem envio".

**Classificados como NÃO fazendo parte do produto no v1:** seleção de múltiplas crianças, conta de
responsável, sincronização entre aparelhos, ranking entre crianças.

**Classificados como exigindo rede:** itens 3, 4, 5, 16 e — condicionalmente — 8 e 15.

> **Esta fase não implementa a tela.** A ordenação definitiva dos 16 itens é matéria da fase de
> implementação, respeitando o contrato acima.

---

## 8. Analytics, telemetria e pesquisa

### 8.1 Estado atual, em uma frase

**Zero analytics de produto, zero crash reporting, zero envio de evento.** O único SDK de terceiro
com tráfego de rede é o da RevenueCat, hoje inerte por ausência de chave.

### 8.2 Classificação das 12 categorias

Legenda: **P** = permitido no lançamento · **C** = permitido somente com ação ou consentimento do
responsável · **POS** = posterior ao lançamento · **X** = proibido.

| # | Categoria | Classificação proposta | Fundamento |
|---|---|---|---|
| 1 | Navegação (tela aberta/fechada) da criança | **POS** — e **C** se algum dia sair do aparelho | Comportamento de criança; nenhuma decisão aprovada autoriza envio |
| 2 | Progresso de história e cena | **P** apenas **local**; **C** para qualquer envio | Já é local hoje e alimenta a Área dos Pais |
| 3 | Jogos do Brincar (rodadas, acertos, recordes) | **P** apenas **local** (`@ptf_brincar_stats_v1`, sem ranking online) | O próprio serviço declara "sem ranking online, sem rede, sem backend" |
| 4 | Ateliê e Colorir (salvar, apagar, tempo de pintura) | **P** apenas **local** | Criação da criança; 4D protege o dado |
| 5 | Desempenho (boot, latência, FPS) | **P** apenas **local e em build interno** (`P-127`, `P-139`); **C** para envio | `performanceTrace.js` já tem allowlist anti-PII e contrato "sem rede" |
| 6 | Erros e crashes | **POS** — nenhum SDK instalado hoje | Decisão pendente (Pergunta 4) |
| 7 | Eventos comerciais (paywall visto, compra, restauração) | **C** — ocorrem na superfície adulta, iniciados pelo adulto | 4A/4B: comercial só pós-gate |
| 8 | Áudio (autoplay, mudo) | **P** apenas **local** | Ligado a `P-100` |
| 9 | Diagnóstico de download de packs | **P** apenas **local e em DEV**, com sanitização já existente | `packDownloadDiagnostics.js:43, 81-94` oculta URL, host, query e token |
| 10 | Pesquisa com responsáveis (formulário, NPS) | **C** — nunca dirigida à criança, sempre pós-gate, sempre opcional | Pergunta 5 |
| 11 | Testes A/B e configuração remota | **X no lançamento** | Nenhum existe; introduzi-los criaria canal remoto de mudança de comportamento infantil |
| 12 | Identificador de dispositivo, atribuição, publicidade | **X — proibido** | `app.json` já declara `NSPrivacyTracking: false` e nenhum SDK de atribuição existe |

**Resumo — corrigido na §0.4, sem ajuste silencioso.** ~~6 permitidas estritamente locais · 2
posteriores · 3 condicionadas · 2 proibidas~~ — essa soma dava **13** sobre uma tabela de **12**
linhas, porque as categorias de classificação dupla eram contadas duas vezes. Em **classificação
exclusiva**: **0** categorias permitidas **com envio** no lançamento · **6** permitidas
estritamente locais (2, 3, 4, 5, 8, 9) · **2** posteriores (1, 6) · **2** exclusivamente
condicionadas a ação ou consentimento do responsável (7, 10) · **2** proibidas (11, 12).
**6 + 2 + 2 + 2 = 12.**

> **Esta seção não conclui conformidade jurídica.** A adequação a LGPD, COPPA e às políticas das
> lojas — inclusive a coerência de `NSPrivacyCollectedDataTypes: []` com o SDK de compra — é
> encaminhada à revisão legal na fase própria.

### 8.3 As cinco opções de lançamento

| Opção | O que é | Consequência |
|---|---|---|
| **1 — Silêncio total** | Nenhuma telemetria, nenhum envio; estado atual congelado | Zero risco de privacidade; **zero visibilidade** sobre uso, travamentos e abandono. Toda decisão de produto pós-lançamento vira suposição |
| **2 — Telemetria estritamente local** | Contadores locais, sem rede, visíveis ao responsável na Área dos Pais | Zero risco de envio; a equipe só enxerga o que o responsável relatar por e-mail |
| **3 — Agregado anônimo com opt-in do responsável** | Envio de contadores agregados, sem identificador estável, sem evento por criança, ligado por interruptor **desligado por padrão**, atrás do gate | Visibilidade parcial; exige texto de privacidade novo, declaração de coleta nas lojas e implementação de fila e consentimento |
| **4 — SDK externo com consentimento** | Analytics ou crash reporting de terceiro, ativado só após consentimento do responsável | Maior visibilidade; **maior superfície de risco**: dependência nova, contrato de terceiro, declaração de coleta, revisão legal obrigatória |
| **5 — SDK externo sem consentimento** | Coleta padrão ligada | **Incompatível** com as decisões 4A/4B/4D e com `NSPrivacyTracking: false`. Registrada apenas para descarte explícito |

**Recomendação técnica do integrador.** **Opção 2 no lançamento**, com a Opção 3 desenhada como
evolução para a primeira atualização. Fundamento: (a) o app é local-first e nenhuma decisão aprovada
depende hoje de dado remoto; (b) a Opção 2 **não** adiciona dependência, permissão, declaração de
coleta nem revisão legal ao caminho crítico do lançamento; (c) `performanceTrace.js` já entrega a
instrumentação necessária para diagnóstico interno com allowlist anti-PII; (d) crash reporting
(Opção 4 restrita a erros) é o único item que eu recomendaria reavaliar antes da publicação, e ainda
assim como decisão separada. **A escolha é do fundador.**

---

## 9. Identificadores e minimização

Dez identificadores × oito determinações: **existe hoje? · quem gera · onde é gravado · sai do
aparelho? · pode ser usado em evento? · pode ser enviado? · pode virar identificador remoto? ·
retenção**.

| # | Identificador | Existe? | Gerado por | Gravado em | Sai do aparelho? | Uso em evento | Envio | Vira remoto? | Retenção |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `avatarId` (emoji) | **Sim** | Escolha da criança | `@ptf_profile` | Não | **Proibido** | **Proibido** | **Nunca** | Até troca |
| 2 | `childId` local estável | **Não ainda** (4D aprovou; `P-141` implementa) | App, 1ª execução | `@ptf_profile` / chaves migradas | Não | Só **local** | **Proibido** | **Nunca** — restrição explícita da 4D | Vida da instalação |
| 3 | `child_<ts>_<rand>` de `childProfileService` | **Sim, paralelo e não adotado** | `appDataModel.js:14-16` | `@ptf_child_profiles_v1` | Não | Só local | **Proibido** | **Nunca** | Vida da instalação |
| 4 | `@ptf_active_child_id_v1` | **Sim** | App | AsyncStorage | Não | Só local | **Proibido** | **Nunca** | Vida da instalação |
| 5 | Nome da criança (`profile.name`) | **Sim** | Digitado pelo responsável | `@ptf_profile` | Não | **Proibido** | **Proibido** | **Nunca** | Até edição |
| 6 | `appUserID` do RevenueCat | **Sim, anônimo** | **O SDK**, não o app | Interno do SDK | **Sim** (para a RevenueCat) | Fora do controle do app | Já ocorre | **Não pode receber `childId`** | Regida pelo terceiro |
| 7 | `inviteCode` do Modo Igreja | **Sim** | `appDataModel.js:121-128` (6 chars, `Math.random`) | `@ptf_church_groups_v1` | **Sim** — exibido e compartilhável | Depende da Pergunta 8 | Depende | Não | Até apagar a turma |
| 8 | `group.id` (`church_<ts>_<rand>`) | **Sim** | `appDataModel.js:14-16` | `@ptf_church_groups_v1` | Não | Depende da Pergunta 8 | Não | Não | Até apagar |
| 9 | `storyId` / `sceneId` / `activityId` | **Sim** | Catálogo de conteúdo | Chaves de progresso | Não | **Permitido** — é conteúdo, não pessoa | Permitido se agregado | N/A | Vida da instalação |
| 10 | Identificador de dispositivo / publicidade | **Não existe** | — | — | — | **Proibido** | **Proibido** | **Proibido** | — |

### 9.0 Identificadores adicionais mapeados (fora dos dez do escopo)

Registrados para completude, sem alterar as dez linhas exigidas pela fase:

| Identificador | Onde nasce | Sai do aparelho? |
|---|---|---|
| `art_<timestamp>_<aleatório>` — obra do Ateliê | `atelierStorage.js:20-21` | Não |
| Identidade composta do Colorir 60 (`storyId` + `activityId`) | `coloring60DrawingStorage.js:178-179` — semântica, não gerada | Não |
| `sessionId` de Monte a Cena — semente **determinística** `${puzzleSceneId}|${pieceCount}|s0` | `MonteACenaTableGameScreen.js:426-429` | Não |
| `@ptf_creator_qa_mode` — estado do Modo Criador | `creatorQaMode.js:23` | Não — **e é ignorado em produção mesmo se um build anterior o tiver gravado** (`:56-61, 78`) |
| `parent_*`, `cert_*`, `card_*`, `report_*` | `src/data/appDataModel.js:49, 144, 170, 190` (corrigido na §0.7: `:51` é o campo `email`) | Não — **nenhum tem chamador** |

**Confirmado por busca exaustiva:** não existe gerador de identificador de instalação ou de
dispositivo — `installationId`, `deviceId`, `randomUUID` e `uuid` retornam **zero** ocorrências em
`src/`; as únicas menções a UUID são comentários sobre o container do iOS trocar de caminho.

### 9.1 Regras de minimização propostas

1. **O `childId` local estável aprovado na Fase 4D permanece estritamente local.** Nenhuma decisão de
   analytics, pesquisa, diagnóstico ou suporte pode convertê-lo em identificador remoto, nem
   derivá-lo por *hash*, prefixo ou truncamento.
2. **Nenhum identificador de pessoa entra em evento**, em nenhuma das opções da Seção 8.
3. **O app nunca chama `Purchases.logIn`, `setAttributes` nem `collectDeviceIdentifiers`** —
   confirmado hoje por busca exaustiva; passa a ser regra escrita.
4. **Nome e avatar nunca são identidade** (4D) e nunca saem do aparelho automaticamente (4D, garantia
   de exportação).
5. **Nenhum identificador novo é criado** sem passar por `storageKeys.js` (4D).
6. Identificadores de **conteúdo** (`storyId`, `activityId`) são livres — não identificam pessoa.

---

## 10. Logs e diagnósticos

Dez contextos × dez determinações. Legenda: **DEV** = só em build de desenvolvimento · **INT** = só
em build interno · **PROD** = presente em build de loja.

| # | Contexto | Onde | Hoje | Pode conter dado de criança? | Pode conter caminho/URL? | Persistido? | Enviado? | Contrato proposto | Fase | Evidência futura |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Migração de storage no boot | `App.js:88` | **PROD** (`console.warn` cru) | Só nome de chave, via mensagem de erro | Não | Não | Não | Passar pelo `logger`; nunca imprimir valor de chave | 19 | Console do APK de produção |
| 2 | Canvas do Ateliê (WebView) | `AtelierCanvas.js:487, 557, 569, 596` | **PROD** | **Não** — só objeto de erro | Não | Não | Não | Passar pelo `logger`; nunca imprimir payload nem base64 | 19 | Console do APK |
| 3 | Canvas do Colorir | `ColoringCanvas.js:807, 817, 823, 972, 974` | **DEV** | `storyId`, `sceneNumber`, **tamanho** do data URL | Não | Não | Não | Manter em DEV; **proibir** imprimir conteúdo de pintura | 19 | Busca automatizada |
| 4 | Perfil e migração de perfil | `childProfileService.js:168` | **DEV** | **Sim — `profile.id`** | Não | Não | Não | **Proibir imprimir qualquer identificador de criança**, mesmo em DEV | 19 | Busca automatizada |
| 5 | Colorir 60 (coleção, integridade) | `Coloring60CollectionScreen.js:167, 189, 286, 309, 322` · `ColoringScreen.js:954` | **DEV** | `activityId`, contagens de progresso | Não | Não | Não | Manter em DEV | 19 | Busca automatizada |
| 6 | Download de packs | `packDownloadDiagnostics.js:160-162` | **DEV** (único chamador sob `if (!__DEV__) return null`) | Não | **Sanitizado** — URL, host, query e token viram `[oculto]` (`:43, 81-94`) | Não | Não | Manter a sanitização como regra escrita | 19 | Leitura do sanitizador |
| 7 | Desempenho | `performanceTrace.js:294` | **DEV ou INT** | Não — allowlist rejeita espaço, acento, `@`, URL e JSON (`:29, 32, 37, 64-79`) | Não | Não | Não | Manter; qualquer envio depende da Seção 8 | 9 | Amostra de boot |
| 8 | Progresso e recompensas | wrapper `logger` | **DEV** | Contagens | Não | Não | Não | Manter | 19 | — |
| 9 | Áudio e Livrinho | `StoryBookScreen.js:299, 301` | **DEV** | `missingAudioSceneIds` | Não | Não | Não | Manter | 19 | — |
| 10 | Ferramentas internas e Modo Criador | seção dev + `CreatorModeBanner` | **INT** | Estado de QA | Não | Não | Não | Nunca compilar em produção | 19 | Ausência no APK |

### 10.1 O que nunca pode aparecer em log — nenhuma build, nenhum contexto

1. Nome da criança.
2. Qualquer identificador de criança (`childId`, `avatarId`, `profile.id`).
3. Conteúdo de pintura ou desenho, em base64 ou qualquer codificação.
4. Caminho absoluto de arquivo (`documentDirectory`, `file://`).
5. URL completa, host, *query string*, token, assinatura ou chave de API.
6. Dados de compra, conta de loja ou recibo.
7. Nome de turma, de líder ou código de convite do Modo Igreja.

**Estado medido hoje:** os itens 1, 3, 4 e 5 já estão limpos por busca exaustiva. O item 2 tem
**uma** violação sob `__DEV__` (`childProfileService.js:168`). Os itens 6 e 7 não têm ocorrência.

### 10.2 Ausência comprovada

**Não existe** função de exportar diagnóstico, enviar log ou reportar problema com anexo.
`expo-clipboard` não está instalado. Os dois `mailto` (`ParentAreaScreen.js:1077`, `:1080`) levam
apenas `subject` — **nenhum log, versão, identificador ou estado é pré-anexado ao corpo**.

---

## 11. Exportação e compartilhamento — 15 determinações

| # | Determinação | Veredito |
|---|---|---|
| 1 | Existe exportação de imagem hoje? | **Não.** Nenhuma. |
| 2 | Existe compartilhamento hoje? | **Sim, um só, e de texto puro**: `Share.share({ message })` em `ParentAreaScreen.js:449`, no Modo Igreja, atrás de flag de build |
| 3 | Bibliotecas de exportação instaladas? | **Nenhuma** — `expo-sharing`, `expo-media-library`, `expo-image-picker`, `expo-print`, `react-native-view-shot` ausentes de `package.json` **e** de `node_modules` |
| 4 | Onde as criações são gravadas | Sandbox privado: `documentDirectory/ptf_blobs/drawings60/*.png`, `ptf_blobs/atelier/<id>_preview.jpg` e `_thumb.jpg`, `ptf_blobs/drawings/*.png` |
| 5 | Formato gravado | PNG no Colorir (`ColoringCanvas.js:487`), JPEG no Ateliê (`AtelierCanvas.js:409-410`, qualidade 0.6 e 0.85) |
| 6 | Há moldura, marca d'água, logo ou assinatura nos pixels? | **Não.** Os dois exportadores copiam só a arte (`AtelierCanvas.js:390-415`, `ColoringCanvas.js:473-492`); o brilho de sucesso é declaradamente "fora da arte exportada" |
| 7 | Há importação de imagem externa? | **Não** — nenhum seletor, nenhuma câmera |
| 8 | A criança alcança exportar ou compartilhar? | **Não, de lugar nenhum** — auditoria botão a botão de `AtelierGalleryScreen`, `Coloring60ArtPreviewScreen`, `AtelierCanvasScreen`, `CongratsScreen` e `TrophiesScreen` |
| 9 | O certificado sai do app? | **Não** — é modal local (`CongratsScreen.js:438-467`) e a fumaça **proíbe** `Share`, `shareAsync`, `printAsync`, `MediaLibrary` e `Permissions` nessa tela |
| 10 | Nome da criança acompanha a exportação? | **Proibido automaticamente** — garantia 4D |
| 11 | Identificador interno acompanha? | **Proibido** — garantia 4D |
| 12 | Progresso acompanha? | **Proibido** — garantia 4D |
| 13 | Há chamada infantil para rede social? | **Proibida** — garantia 4D; e hoje inexistente |
| 14 | Share cards antigos podem ser reaproveitados? | **Proibido automaticamente** — garantia 4D; `shareCardService` está fora do v1 |
| 15 | Exportação exige portão parental? | **Sim** — decisão 4D, já aprovada |

**Pendências desta seção, ambas de forma e não de princípio:** se a imagem exportada leva **moldura
ou marca do Mundo do Beni** (Pergunta 6) e se o destino é **a folha de compartilhamento do sistema**
ou **a galeria de fotos do aparelho** (Pergunta 7). A segunda resposta determina se o produto passa a
declarar permissão de biblioteca de mídia — hoje **nenhuma** purpose string existe em `app.json`.

---

## 12. Links externos e comunicação comercial

Nove tipos × dez determinações.

| Tipo de link | Existe hoje? | Onde | Exige portão? | Alcançável pela criança? | Abre app externo? | Exibe preço? | Comportamento sem rede | Em produção | Pendência |
|---|---|---|---|---|---|---|---|---|---|
| 1. E-mail de suporte | **Sim** | `ParentAreaScreen.js:1077` | **Sim** (`openWithGate`) | Não | Sim | Não | Falha silenciosa | Ativo | E-mail é **provisório** (`productConfig.js:20`) |
| 2. E-mail de feedback | **Sim** | `:1080` | **Sim** | Não | Sim | Não | Falha | Ativo | Idem |
| 3. Loja (avaliar o app) | **Código sim, URL não** | `:1091` | **NÃO** | Não hoje | Sim | Não | Falha | Botão não renderiza (`storeUrl === null`) | **Pergunta 2** |
| 4. Política de privacidade | **Não existe** | — | — | — | — | — | — | — | **Pergunta 9** |
| 5. Termos de uso | **Não existe** | — | — | — | — | — | — | — | **Pergunta 9** |
| 6. Site institucional | **Não existe** | — | — | — | — | — | — | — | Pergunta 10 |
| 7. Rede social | **Não existe** | — | **Proibida** para a criança (4D) | Não | — | — | — | — | Nenhuma |
| 8. Compra / assinatura | **Não acionável** | `planConfig.js:40-55` | **Sim** (4A/4B) | Não | Sim (loja) | **Sim, pós-gate** | Falha | Inativo | Fase 18 |
| 9. Compartilhamento de texto (Modo Igreja) | **Sim** | `:449` | Gate de entrada, **sem gate próprio** | Não | Sim (folha do SO) | Não | Local | Só sob flag | **Pergunta 8** |

### 12.1 Garantias 4A/4B verificadas nesta fase

| Garantia | Estado medido |
|---|---|
| Nenhum preço para a criança | **CUMPRIDA.** Busca por `R$`, `assine`, `compre`, `/mês`, `anual` em `src/` retorna apenas `planConfig.js:50` (rótulo `'Anual'`), dentro de `PLAN_PRICING`, que é importado e **nunca renderizado** |
| Nenhum "Assine agora" na área infantil | **CUMPRIDA.** Nenhum verbo de compra em superfície infantil |
| Nenhuma oferta verbalizada pelo leitor de tela | **PARCIALMENTE CUMPRIDA.** Nenhum rótulo contém preço ou verbo de compra, mas **cinco** rótulos verbalizam a marca do plano e a condição de bloqueio (`P-66`, ampliado) |
| Paywall só depois do portão | **CUMPRIDA.** Não existe tela de paywall; o cartão comercial vive **dentro** da área gated |

### 12.2 Menções comerciais textuais em superfície infantil (sem preço e sem link)

Registradas para a Fase 5, não corrigidas aqui: `BrincarScreen.js:337, 349` ·
`AtelierCanvasScreen.js:727-728, 734` · `MonteACenaStoryScreen.js:163-164` ·
`MonteACenaGalleryScreen.js:105` · `MonteACenaHomeScreen.js:148` ·
`PalavrinhasDoBeniScreen.js:1082` · `ParesDoBeniScreen.js:790, 817, 830` ·
`StoryFocusModal.js:56, 60-62` · `StoriesScreen.js:139, 384` · `NextAdventureCard.js:29` ·
`StoryBookHero.js:75` · `StatusBadge.js:13` · `PremiumLockCard.js:23` ·
`LockedStoryFallback.js:23` · `BeniLockedState.js:18` · `QuizScreen.js:62-63` ·
`StoryBookScreen.js:542` · `contentAccessService.js:187, 196` · `achievements.js:234-236`.

---

## 13. Modo Igreja — 17 determinações

> As 15 determinações exigidas pela fase estão nas linhas 1–15; as linhas 16 e 17 foram acrescentadas
> pela auditoria e são registro factual, não substituição.

| # | Determinação | Estado |
|---|---|---|
| 1 | Existe código? | **Sim** — `churchModeService.js` completo e uma seção inteira na Área dos Pais (`:1273-1404`) |
| 2 | Aparece em produção? | **Não** — `SHOW_CHURCH_MODE` exige `EXPO_PUBLIC_ENABLE_CHURCH_MODE === 'true'`, não declarada no perfil `production` |
| 3 | A cerca é adequada? | **Não** — é **simples**, contra quádrupla e quíntupla das demais (`P-107`) |
| 4 | Exige rede? | **Não** — o próprio texto declara "sem internet obrigatória, sem login" (`:1280`) |
| 5 | Exige conta? | **Não** |
| 6 | Que dados guarda? | Nome da turma, **nome do líder**, nome da igreja, faixa, código de convite, `childrenIds` — em `@ptf_church_groups_v1` |
| 7 | Guarda dado de terceiros? | **Sim** — nome do líder e, potencialmente, de outras crianças via `childrenIds` |
| 8 | Envia algo para fora? | **Sim** — `Share.share` de texto com o nome da turma (`:449`) |
| 9 | Há defeito de gravação? | **Sim** — faixa etária gravada em `churchName` (`:429`); `weeklyStory` exibido e **nunca persistido** (`:432`) |
| 10 | Há escritor sem consumidor? | **Sim** — `setWeeklyStory` e `getChurchProgressSummary` sem chamador |
| 11 | Há estrutura para progresso por criança? | **Sim, preparada e nunca populada** — `progressByChild` em `churchModeService.js:113` |
| 12 | Há nível de plano institucional? | **Sim, inerte** — `PLAN_TIER.CHURCH` (`appDataModel.js:80`), sem caminho que o atribua |
| 13 | Colide com "uma criança local por instalação"? | **Sim, conceitualmente** — `childrenIds` pressupõe várias crianças, o que a 4D excluiu do v1 |
| 14 | Colide com o Cultinho em Casa? | **Não** — `FamilyWorship` é feature separada e **não** depende desta flag (`featureFlags.js:32-33`) |
| 15 | Exige portão parental próprio? | Hoje **não** — herda só o gate de entrada |
| 16 | Existe rota própria de navegação? | **Não** — nenhum `Stack.Screen` e nenhuma constante em `routes.js`. É um bloco interno da Área dos Pais |
| 17 | Algum perfil de build declara a env? | **Não** — `production`, `preview`, `preview-criador`, `screenshot` e `c60-pilot` foram inspecionados; **nenhum** declara `EXPO_PUBLIC_ENABLE_CHURCH_MODE` |

### 13.1 As três opções

| Opção | Descrição | Viabilidade no lançamento atual |
|---|---|---|
| **A — Fora do lançamento** | O Modo Igreja não existe no v1. A seção permanece atrás de flag, ou o código é preservado no Git e removido do runtime na Fase 16, junto com o ajuste das asserções da fumaça | **Compatível.** É o estado de fato hoje e o que `DECISIONS.md` #5 congelou |
| **B — Sessão local temporária** | Sem conta, sem sincronização e **sem armazenamento infantil permanente**: o líder cria uma turma, vê a história da semana e compartilha a orientação; nenhuma criança adicional é criada no aparelho | **Compatível**, desde que: a cerca vire quádrupla como as demais (`P-107`); o campo trocado e o `weeklyStory` não persistido sejam corrigidos (`P-108`); `childrenIds` **não** seja usado; e o compartilhamento respeite as garantias da Seção 11 |
| **C — Produto institucional completo** | Turmas com múltiplas crianças, progresso por criança, código de convite funcional entre aparelhos, painel do líder | **INCOMPATÍVEL com o lançamento atual** — e **já excluída por decisão documental vigente** (ver 13.2). Depende de contas, backend e sincronização, e colide com a decisão 4D de uma única criança local por instalação |

### 13.2 A Opção C já está excluída por decisão documental vigente

`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md:143-152`, decisão **D3**, já determina:

> "Modo Igreja não entra como backend no lançamento. […] No lançamento, Modo Igreja pode existir
> apenas como promessa controlada, material comercial, página informativa ou canal de contato.
> **Não haverá conta de igreja, painel institucional, múltiplos aparelhos por igreja ou gestão de
> turmas no lançamento.** […] Conta de igreja com vários aparelhos exige backend e entra em fase
> futura."

E `docs/PROJECT_SOURCE_OF_TRUTH.md:141-143` — a fonte de verdade máxima — registra que o Modo Igreja
"é diferencial estratégico real, não ideia distante" e "deve ser polido e ativado **depois** dos
bloqueadores de core loop, peso e conteúdo grátis".

**Consequência para esta fase.** A **Opção C não é uma escolha aberta**: já foi descartada para o
lançamento. A Pergunta 8 fica reduzida a **A ou B**, e a menção de C serve apenas para o descarte
formal. Registra-se ainda que a UI atual — formulário de turma, código de convite exibido e lista de
turmas persistida — **excede** o que D3 autoriza ("promessa controlada, página informativa ou canal
de contato"), o que é mais um motivo para a cerca de `SHOW_CHURCH_MODE` ser elevada.

### 13.3 Promessa documental sem lastro no código

`specs/001-asset-architecture-budget/research.md:142` descreve o Modo Igreja como incluindo
"**pré-download em Wi-Fi** de um conjunto de packs para uso offline em eventos". **Esse pré-download
não existe**: nem `packDownloadService.js` nem `packManifestService.js` têm qualquer referência a
igreja, turma ou lote. Registrado como divergência documento↔código, sem correção nesta fase.

> **Esta fase não escolhe.** A escolha entre A e B vai à **Pergunta 8**.

---

## 14. Aparelhos compartilhados

Cinco contextos × dez determinações.

| Determinação | **Tablet de família com irmãos** | **Aparelho do responsável** | **Tablet de sala / igreja** | **Aparelho emprestado** | **Perfis de usuário do sistema** |
|---|---|---|---|---|---|
| 1. Ocorre na prática? | **Sim, provável** | **Sim, muito provável** | Só se a Opção B/C do Modo Igreja existir | Ocasional | Raro |
| 2. Quantas crianças o v1 suporta? | **Uma** (4D) | Uma | Uma | Uma | Uma por perfil de SO |
| 3. Progresso é compartilhado? | **Sim, inevitavelmente** | Sim | Sim | Sim | Não — o SO isola |
| 4. Criações são compartilhadas? | **Sim** | Sim | Sim | Sim | Não |
| 5. Trocar de avatar troca de criança? | **Não** (4D) | Não | Não | Não | Não |
| 6. Direito comercial é compartilhado? | **Sim** — é da conta de loja | Sim | Sim | Sim | Depende da conta de loja do perfil |
| 7. O gate protege o adulto de quem? | Do irmão mais velho também | Da criança | De qualquer criança da sala | De qualquer pessoa | Do outro perfil, pelo SO |
| 8. Risco específico | Irmão apaga a criação do outro (`AtelierGalleryScreen.js:58-73`, **sem portão**) | Criança vê nome e progresso no gate já aberto | Dado de uma criança visível a outra | Dados ficam no aparelho após a devolução | Nenhum novo |
| 9. O que o produto promete | **Nada ainda** — nenhuma superfície explica o modelo de uma criança por instalação | Idem | Idem | Idem | Idem |
| 10. Evidência futura | Vídeo com duas crianças no mesmo tablet | Vídeo do gate reaberto | Depende da Pergunta 8 | Print do aviso de desinstalação | — |

### 14.1 Como o dado é realmente separado hoje — comprovado

| Domínio | Escopo real da chave |
|---|---|
| Progresso de história, quiz, reflexão, Livrinho, estrelinhas, conquistas | **Global por aparelho** — `storageKeys.js:96-110` (objeto `storageKey`, corrigido na §0.7) não tem componente de perfil |
| Desenhos do Colorir e do Colorir 60 | **Global por aparelho** — `coloring60DrawingStorage.js:179` usa só `storyId` e `activityId` |
| Índice e obras do Ateliê | **Global por aparelho** — `ptf_atelier_arts_v1_*` |
| Monte a Cena (galeria e sessão) | **Por `profileId`** — que resolve para `avatarId` |
| Orientação do Criar Livre | **Por `profileId`** — idem |

Ou seja: **a quase totalidade do dado infantil já é global por aparelho**, e as duas exceções são
endereçadas pelo emoji do avatar. A consequência, registrada na 4D, é que trocar o avatar órfã o
progresso dessas duas exceções e que duas crianças com o mesmo avatar compartilham o mesmo balde em
silêncio. A camada multi-filho existe no modelo (`@ptf_child_profiles_v1`, `@ptf_active_child_id_v1`,
`setActiveChildProfile`), é **escrita** no onboarding (`OnboardingScreen.js:247`, de forma
*fire-and-forget*) e na migração (`storageMigrationService.js:57`), mas **nenhuma tela a lê** e
**não existe nenhuma superfície de "trocar de criança"**.

**Registro obrigatório:** esta fase **não inventa múltiplos perfis familiares no lançamento**. A
decisão 4D de **uma única criança local por instalação** permanece intacta. O que está em aberto é
apenas **o que o produto diz ao responsável** sobre esse modelo e **como a sessão adulta se comporta
num aparelho que passa de mão em mão** — Perguntas 1 e 7.

---

## 15. Serviços fora do v1 — reconfirmação

Medição refeita nesta fase, de forma independente, sem consultar o resultado anterior.

| Símbolo | Consumidores em produção | Referências na fumaça | Classificação |
|---|---|---|---|
| `certificateService.js` | **0** | 3 (`:6459`, `:6532-6538`) | **Módulo morto** — remover no bloco técnico futuro (Fase 16), com o ajuste das asserções **junto** com a remoção |
| `shareCardService.js` | **0** | 5 (`:6460`, `:6542-6548`, `:6552-6554`) | **Módulo morto** — idem; **backlog pós-lançamento** para a ideia |
| `weeklyReportService.js` | **0** | 3 (`:6461`, `:6558-6564`) | **Módulo morto** — idem; **backlog pós-lançamento** |
| `getStoryRewardBreakdown` | **0** | 3 (`:1770-1772`) | **Export órfão em módulo vivo** — o módulo vive por `getRewardsSummary` (`ProgressContext.js:19, 91`). Remoção exige cuidado maior |
| `clearSeenAchievements` | **0** | **0** — nem a fumaça o cita | **Export órfão em módulo vivo** — o módulo vive por `getSeenAchievements` e `markAchievementSeen` |
| `totalBonusStars` / `addBonusStars` | 8 escritas vivas, leitura em `ProgressContext.js:140`, **consumo final zero** | `addBonusStars` **executado** em `:22017-22030`; `totalBonusStars` ausente | **Cadeia ativa sem consumidor final — NÃO PODE SER REMOVIDA:** contém estrelinhas realmente conquistadas. **Migrar** para a fonte canônica na Fase 11 |

**Precisões desta fase, sem alterar a matriz:**
1. `clearSeenAchievements` **não** é referenciado pela suíte de fumaça — ao contrário do que a
   redação de `P-147` poderia sugerir ao agrupar os símbolos.
2. Os checks dos três serviços são `readFileSync` + `includes()` sobre o fonte: **não executam** o
   módulo. Já `addBonusStars` é exercitado de fato.
3. O `try/catch {}` de `postStoryStorage.js:71` (corrigido na §0.7) **engole silenciosamente** falhas de escrita da
   estrela de bônus — o `await` externo resolve mesmo se o `setItem` falhar.

> **Nada é implementado nem removido nesta fase.**

---

## 16. Implementação futura

| Bloco | Fase | Depende de |
|---|---|---|
| Correção dos 5 rótulos de acessibilidade com marca comercial (`P-66`) | 12A | Nada — decisão 4A/4B pronta |
| Correção do texto das 3 artes (`P-64`) | 12A | Nada |
| Identificador local estável e migração de chaves (`P-141`, `P-62`) | 19 | Nada — decisão 4D pronta |
| Aviso de perda por desinstalação (`P-144`) | 19 | Nada — frase aprovada na 4D |
| Quatro operações de reset e remoção do cartão "Em preparação" (`P-145`) | 19 | Pergunta 3 (portão da operação C fora da Área dos Pais) |
| Painel de armazenamento e exportação individual | 19 | Perguntas 6 e 7 |
| Contrato de sessão do portão parental | 19 | **Pergunta 1** |
| Portão para links externos e loja | 19 | **Pergunta 2** |
| Política de privacidade e termos | 19/20 | **Pergunta 9** + revisão legal |
| Canal de suporte definitivo | 19 | **Pergunta 10** |
| Reescrita dos textos de privacidade (C-2, C-3) | 19 | **Pergunta 11** |
| Verificação do `PrivacyInfo.xcprivacy` gerado (`P-92`) | 20 | Nada |
| Cerca quádrupla para `SHOW_CHURCH_MODE` (`P-107`) e correção do campo trocado (`P-108`) | 19 / 12B | **Pergunta 8** |
| Higiene de logs (`P-112`) e proibição de imprimir identificador de criança | 19 | Nada |
| Telemetria / linha de base de desempenho (`P-85`, `P-127`, `P-139`) | 5 / 6 / 9 | **Pergunta 4** |
| Pesquisa com responsáveis | Posterior | **Pergunta 5** |
| Remoção dos módulos mortos e ajuste da fumaça (`P-82`, `P-147`, `P-148`) | 16 | Nada — decisão 4D pronta |
| Reconciliação de `totalBonusStars` (`P-39`) | 11 | Nada |

---

## 17. Validação futura

| O que validar | Como | Físico? |
|---|---|---|
| Gate parental com a duração escolhida | Vídeo: resolver o desafio, sair para o segundo plano, esperar, voltar | **Sim** |
| Gate após `goBack` e reentrada | Vídeo | **Sim** |
| Nenhum preço, oferta ou verbo de compra na superfície infantil | Print de cada tela + **leitor de tela ligado** (VoiceOver e TalkBack) | **Sim** |
| Cinco rótulos de acessibilidade corrigidos | Áudio do leitor de tela | **Sim** |
| Aviso de desinstalação | Print da Área dos Pais + reinstalação real | **Sim** |
| Quatro operações de reset | Vídeo de cada uma, com o estado antes e depois | **Sim** |
| Exportação individual | Vídeo do fluxo completo, do portão ao arquivo resultante | **Sim** |
| Ausência de ferramentas internas em produção | Inspeção do APK/IPA de produção | **Sim** |
| Ausência do Modo Igreja em produção | Confirmar que nenhum perfil declara a env + inspeção do binário | Parcial |
| Manifesto de privacidade | Ler o `PrivacyInfo.xcprivacy` gerado pelo prebuild | Não |
| Logs de produção limpos | Console do aparelho com build de loja | **Sim** |
| Migração de `avatarId` para `childId` | Aparelho com dados legados, antes e depois (`MIG`) | **Sim** |
| Zero envio de dados | Captura de tráfego durante uma sessão completa | **Sim** |
| `ENABLE_LOCAL_PREMIUM_TEST_MODE === false` (C-15) | Leitura de `accessControl.js:20` no commit publicado | Não |
| Ausência do banner "MODO CRIADOR ATIVO" | Print do app de produção | **Sim** |

---

## 18. Perguntas ao fundador

Onze perguntas. Nenhuma repete algo já aprovado nas Fases 4A, 4B, 4C ou 4D.

> **Nenhuma destas perguntas foi escolhida pelo integrador.** As onze foram formuladas no artefato
> preliminar e **respondidas pelo fundador em 2026-08-06**; cada resposta está transcrita ao final
> da respectiva pergunta, no bloco **✅ RESPOSTA DO FUNDADOR**, **sem alterar o texto original da
> pergunta**. As **recomendações técnicas foram preservadas sem reescrita**, inclusive onde o
> fundador decidiu diferente — nas Perguntas **2**, **3**, **4**, **5** e **8** a decisão **não**
> coincide com a recomendação do integrador, e ambas permanecem legíveis para que o registro do que
> foi proposto e do que foi decidido continue auditável. **A decisão do fundador prevalece em todos
> os casos.**

---

### Pergunta 1 — Quanto dura a sessão adulta e como ela termina?

**Contexto.** O desbloqueio é hoje `useState(false)` em `ParentAreaScreen.js:294`: vive enquanto a
tela estiver montada, **não expira por tempo, não expira ao ir para o segundo plano e não expira por
inatividade**. Some apenas quando a tela é desmontada. Num tablet de família, isso significa que o
adulto pode deixar a Área dos Pais aberta — com o nome da criança e o progresso detalhado à vista — e
entregar o aparelho.

**Alternativas.**
- **A.** Uma ação por vez: o portão é reexigido a cada ação sensível.
- **B.** Sessão curta com prazo (por exemplo 2, 5 ou 10 minutos), reiniciada a cada interação.
- **C.** Sessão que termina ao sair da tela **ou** ao app ir para o segundo plano.
- **D.** Manter o comportamento atual (só termina ao sair da tela).

**Recomendação técnica.** **C combinada com B**: encerrar ao ir para o segundo plano **e** expirar
por inatividade. É o comportamento que protege o caso real de aparelho compartilhado sem punir o
adulto que está usando a tela, e é implementável com um listener de `AppState` e um temporizador,
sem dependência nova.

**Consequências.** A alternativa A torna a Área dos Pais desagradável (o adulto resolveria a conta
várias vezes seguidas). A D deixa a superfície adulta aberta indefinidamente. B e C exigem escrever
a regra e validá-la em aparelho físico.

**Códigos afetados.** Nenhum código âncora — é decisão de contrato. Impacta a implementação de
`P-145` e as Perguntas 2 e 3.

**Altera decisão anterior?** **Não.** Complementa 4A/4B ("o gate precede qualquer conteúdo
comercial") definindo **por quanto tempo** o gate vale.

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — CONTRATO COMBINADO, COM EXPIRAÇÃO POR INATIVIDADE DE CINCO
MINUTOS.**

A sessão adulta passa a ter **contrato combinado**, de sete itens:

1. A sessão expira após **5 minutos de inatividade**.
2. Interação adulta válida **reinicia** o contador.
3. **Sair da Área dos Pais encerra** a sessão.
4. **Enviar o app para o segundo plano encerra** a sessão.
5. Ao voltar, é exigido **novo portão parental**.
6. Dentro dos 5 minutos, o desafio **não** é repetido desnecessariamente.
7. A superfície adulta **nunca** permanece aberta indefinidamente.

Este é um **contrato**, não uma implementação: nenhum temporizador, *listener* de `AppState` ou
persistência de sessão foi escrito nesta fase.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 19) · **risco técnico NÃO
corrigido** · validação física ainda exigida. Conflito **C-10 resolvido**. Sem código âncora;
impacta a implementação de `P-145`.

---

### Pergunta 2 — O link da loja e futuros links externos exigem portão próprio?

**Contexto.** Os dois `mailto` passam por um **segundo** desafio (`openWithGate`), mas o botão
"Avaliar o app" chama `Linking.openURL(storeUrl)` **diretamente** (`ParentAreaScreen.js:1091`). Hoje
isso é inofensivo apenas porque `APP_STORE_URL` e `PLAY_STORE_URL` são `null` e o botão nem
renderiza. **No dia em que as URLs forem preenchidas, o link abrirá sem desafio.**

**Alternativas.**
- **A.** Todo link externo passa por portão próprio, sem exceção.
- **B.** Só links que levem a compra, pagamento ou conta passam por portão próprio; loja e e-mail
  bastam o gate de entrada.
- **C.** Manter como está: e-mail com portão, loja sem.

**Recomendação técnica.** **A.** É a regra mais simples de escrever, de testar e de auditar, e
elimina a classe inteira de erro em que um link novo nasce fora do portão. O custo é um desafio a
mais para o adulto que já está na área.

**Consequências.** B e C exigem manter duas categorias de link e revalidar a classificação a cada
link novo.

**Códigos afetados.** Nenhum código âncora; interage com `P-24` e `P-73`.

**Altera decisão anterior?** **Não.**

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — REGRA D REFINADA, QUE NÃO É NENHUMA DAS TRÊS ALTERNATIVAS
LITERAIS.**

O fundador **não escolheu A, B nem C**. Fixou uma quarta regra, de sete itens:

1. **Nenhum link externo** fica diretamente disponível na superfície infantil.
2. Links externos pertencem à **superfície adulta** e exigem **sessão adulta válida**.
3. Uma vez dentro de sessão adulta válida, links **meramente informativos** — política de
   privacidade, termos, suporte, avaliação na loja — **não** exigem novo desafio matemático a cada
   toque.
4. Ações comerciais **genuinamente sensíveis** podem ter confirmação própria, proporcional ao risco.
5. Compra, pagamento e alteração de conta permanecem sob o **contrato comercial adulto** já
   aprovado em 4A/4B.
6. **Não** podem coexistir dois sistemas de classificação contraditórios sem documentação.
7. **Nenhum link novo pode nascer na superfície infantil por omissão.**

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 19) · **risco técnico NÃO
corrigido** · validação física ainda exigida. Sem código âncora; interage com `P-24` e `P-73`.

---

### Pergunta 3 — Apagar **uma** criação na superfície infantil exige portão parental?

**Contexto.** A Fase 4D aprovou quatro operações na Área dos Pais e exigiu portão, confirmação
dupla e palavra de confirmação **para a exclusão total**. Mas hoje a criança pode apagar
**permanentemente** uma arte própria direto da galeria infantil, com um único `Alert.alert`
(`AtelierGalleryScreen.js:58-73`, botão 🗑️ em `:245`). Num tablet com irmãos, um pode apagar a
criação do outro.

**Alternativas.**
- **A.** Apagar criação exige portão parental sempre, inclusive na galeria infantil.
- **B.** A criança pode apagar a **própria** criação com confirmação reforçada, sem portão.
- **C.** A criança não pode apagar; a operação existe apenas na Área dos Pais (operação C da 4D).

**Recomendação técnica.** **C.** É a mais coerente com a decisão 4D de que o responsável tem o
controle sobre os dados e com a ratificação de que nenhum dado infantil desaparece sem intenção
adulta; e é a mais simples de validar. Se a autonomia da criança for valor a preservar, a **A** é o
meio-termo defensável.

**Consequências.** A alternativa B mantém o risco de perda irreversível por toque acidental ou por
irmão. C reduz a autonomia da criança sobre a própria galeria.

**Códigos afetados.** `P-145` (a operação C do contrato 4D). Nenhum código enuncia hoje a exclusão
sem portão na galeria infantil — se a resposta exigir mudança, isso vira código novo na consolidação.

**Altera decisão anterior?** **Não** — completa a operação C da 4D num ponto que a 4D não alcançou.

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — A CRIANÇA PODE INICIAR A INTENÇÃO; SÓ O ADULTO CONCLUI.**

Contrato de cinco itens:

1. A criança **pode iniciar a intenção** de apagar uma criação sua.
2. A exclusão permanente **não pode ser concluída autonomamente pela criança**: exige **portão
   parental e confirmação adulta explícita**.
3. Toque acidental **não pode apagar de forma irreversível**.
4. Em aparelho compartilhado entre irmãos, **não pode haver exclusão silenciosa**.
5. O contrato **mais rigoroso** da exclusão **total** de dados, aprovado na 4D, permanece
   **integralmente preservado** — portão, confirmação dupla, palavra de confirmação e lista do que
   se perde.

**Não** se cria exigência de digitação de palavra para a exclusão de **uma única** arte: essa
exigência pertence apenas à exclusão total.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 19) · **risco técnico NÃO
corrigido** · validação física ainda exigida. Conflito **C-11 resolvido**. `P-145`.

---

### Pergunta 4 — Existe analytics no lançamento?

**Contexto.** O app tem **zero** telemetria, **zero** crash reporting e **zero** envio de evento,
comprovados por busca exaustiva. `P-85` registra que a ausência "pode ser decisão de privacidade
infantil, e não defeito". `P-127` e `P-139` (linha de base de desempenho) **dependem inteiramente
desta resposta**.

**Alternativas.** As cinco opções da Seção 8.3: **1** silêncio total · **2** telemetria estritamente
local · **3** agregado anônimo com opt-in do responsável · **4** SDK externo com consentimento ·
**5** SDK externo sem consentimento.

**Recomendação técnica.** **Opção 2 no lançamento**, com a Opção 3 desenhada para a primeira
atualização. Fundamento na Seção 8.3. A Opção 5 é incompatível com as decisões já aprovadas e com
`NSPrivacyTracking: false`.

**Consequências.** A Opção 1 e a 2 mantêm o caminho crítico do lançamento livre de dependência nova,
permissão nova, declaração de coleta e revisão legal. As Opções 3 e 4 **acrescentam** todos esses
itens ao lançamento e exigem texto de privacidade novo.

**Códigos afetados.** `P-85`, `P-127`, `P-139`.

**Altera decisão anterior?** **Não** — mas escolher 3, 4 ou 5 exigiria reescrever os textos de
privacidade da Área dos Pais e reavaliar `NSPrivacyCollectedDataTypes`.

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — ARQUITETURA DE TRÊS CAMADAS, QUE SUPERA AS CINCO OPÇÕES
SIMPLIFICADAS DA §8.3.**

A resposta **não é** uma das cinco opções. O fundador fixou uma arquitetura de observabilidade em
**três camadas**, que **supera formalmente** a formulação simplificada do artefato preliminar.

**Camada 1 — métricas agregadas de loja.** Aquisição, instalações, ativos, retenção, sessões,
travamentos, ANRs, desempenho e conversão de loja. **Não** recriar identificadores próprios para
duplicar o que a loja já entrega.

**Camada 2 — instrumentação local rica**, para *builds* de pesquisa e pilotos formais. Fluxos,
histórias, progresso, conclusão, atividades, tempo aproximado, *downloads*, falhas, uso *offline*,
Modo Igreja, abandono e erros técnicos. **Local nos pilotos**, combinada com observação humana.
**Analytics não conclui sozinho se uma criança "aprendeu".**

**Camada 3 — telemetria pública mínima, opcional e de primeira parte.** Vinte e uma restrições:
desligada por padrão; exige autorização adulta válida; app plenamente funcional sem ela; **nenhum
SDK de analytics comportamental de terceiro no lançamento**; nenhum identificador persistente de
criança; nenhum identificador persistente de aparelho para analytics; nenhum histórico individual
longitudinal entre sessões; sumarização local preferida antes da transmissão; carimbos de tempo
minimizados; uso de *buckets*; duração em faixas; atributos técnicos minimizados; esquema por
*allowlist*; propriedades não previstas recusadas; códigos de erro sanitizados em log público.

**Terminologia obrigatória.** **NÃO** chamar esses dados de "anônimos" automaticamente. A
designação correta é **"telemetria minimizada e não identificada na origem, agregada e anonimizada
no processamento"**, sujeita a validação na Fase 5.

**Dados proibidos (§18.4 do mandato).** Nome da criança, data de nascimento, idade exata, e-mail,
telefone, foto, voz, desenho, arquivo de criação, nome da arte, texto escrito pela criança,
respostas abertas, conteúdo de oração, localização, geolocalização precisa, *Advertising ID*, IDFA,
AAID, *Android ID*, IMEI, IMSI, MAC, SSID, BSSID, identificadores persistentes equivalentes, perfil
comportamental individual, perfil religioso individual, nível de fé, probabilidade de "conversão"
religiosa, preferência denominacional inferida, nome de igreja por telemetria, denominação por
telemetria, nome ou e-mail do responsável por telemetria, e ID de assinatura correlacionável com
histórico infantil.

**Rede e aparelho.** Sem persistência de IP, sem *User Agent* completo, cabeçalhos desnecessários
descartados, sem *fingerprint*, detalhe mínimo de aparelho — exemplo aprovado:
`platform=ios, os_major=27, device_class=phone, app_version=1.0.0`.

**Bases separadas.** PRODUTO · PESQUISA · COMERCIAL ADULTA · TRANSACIONAL. Proibidos por padrão os
cruzamentos Produto+CRM, Produto+identidade infantil, Produto+religião, Produto+denominação e
Produto+igreja identificada. **Nenhum "superperfil".**

**Microssegmentação.** Proibida quando permitir reidentificação. Referência operacional preliminar,
**a validar na Fase 5**: cerca de **20 sessões** como mínimo para segmentação geral e
preferencialmente **50 ou mais** em contexto de Modo Igreja ou religioso. Isso é **salvaguarda
operacional inicial, NÃO declaração jurídica definitiva**.

**Retenção.** Apenas direção conservadora nesta fase; retenção, exclusão e anonimização definitivas
são congeladas na **Fase 5**.

**Auditoria de SDKs.** A Fase 5 deve auditar **todos** os SDKs capazes de enviar dado — assinatura,
*crash*, notificação, *login*, atribuição, atualização, rede, suporte, RevenueCat e qualquer outro.

**O que a observabilidade mede.** Produto, ativação, engajamento, conclusão, retenção agregada,
confiabilidade, uso *offline*, uso de recurso, Modo Igreja, funil comercial adulto e saúde técnica.
**Nunca** fé, religiosidade, obediência espiritual, valor moral, preferência doutrinária, perfil
psicológico, probabilidade de conversão ou ranking espiritual.

**A Fase 4E congela o contrato. A Fase 5 fará o fechamento jurídico e técnico correspondente.**
Esta fase **não** declara que o produto "já está juridicamente conforme".

**Estado:** decisão **resolvida** · implementação **pendente** (Fases 5, 6 e 9) · **risco técnico
NÃO corrigido** · validação futura exigida. Conflito **C-3 informado** (encerrado na Pergunta 11).
`P-85` `P-127` `P-139`.

---

### Pergunta 5 — Existe pesquisa com responsáveis e consentimento formal no lançamento?

**Contexto.** O fluxo formal de consentimento existe em código e está desligado por
`PARENTAL_CONSENT_FLOW_ENABLED = false`, com a justificativa escrita "enquanto NÃO houver
compartilhamento, conta, envio externo, imagem/áudio da criança ou recurso sensível". Essa premissa
**já é parcialmente falsa hoje**: existe `Share.share`, existem dois `mailto` e existe um SDK de
compra que fala com servidor de terceiro. Ligado a isto está `P-100`: a voz do Beni toca
automaticamente na Home, no Perfil e nas Estrelinhas **sem nenhum pedido prévio**.

**Alternativas.**
- **A.** Sem pesquisa e sem consentimento formal no v1; manter apenas texto informativo e um card de
  primeiro uso que anuncia o som antes de tocá-lo.
- **B.** Sem pesquisa, **com** consentimento formal reativado, cobrindo áudio, compartilhamento e
  compra.
- **C.** Com pesquisa voluntária, sempre pós-gate, sempre opcional, nunca dirigida à criança.

**Recomendação técnica.** **A** para o lançamento, com o card de primeiro contato do som resolvendo
`P-100`, e **B** condicionada à resposta da Pergunta 4: se houver qualquer envio, o consentimento
formal deixa de ser opcional.

**Consequências.** Manter o flag desligado com a justificativa atual mantém uma contradição escrita
no código (conflito C-4). A alternativa C exige superfície nova, armazenamento de respostas e
revisão legal.

**Códigos afetados.** `P-100`; e o texto de `featureFlags.js:14-23` passa a precisar de reescrita em
qualquer alternativa.

**Altera decisão anterior?** **Não.**

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — CONSENTIMENTO DEIXA DE SER OPCIONAL PARA ENVIO PÚBLICO; NÃO
HÁ PESQUISA GERAL COM RESPONSÁVEIS NO v1.**

**Autorização de telemetria.** Deixa de ser opcional para qualquer envio público: desligada por
padrão, autorização **específica** em ambiente adulto, recusa **não** prejudica o app, decisão
**revogável**, **sem** *dark patterns*, com opção de recusa digna. **Nenhuma recompensa infantil**
por consentir: **"o Beni não fica triste se o adulto recusar"**, e nenhuma estrelinha ou benefício
da criança depende disso.

**Pesquisa.** **Não há pesquisa pública geral com responsáveis dentro do app no v1.** Pilotos
formais podem usar pesquisa com responsáveis — separada, voluntária, sempre pós-portão, **nunca**
dirigida à criança, com protocolo e consentimento próprios.

**Áudio do Beni.** **Não** é agrupado ao consentimento de telemetria — *"ouvir áudio local não
equivale a enviar dado"*. `P-100` é resolvido por um **cartão de primeiro contato acolhedor**, que
anuncia que o Beni usa som e voz **antes** do primeiro autoplay. **Não** é um cartão de
consentimento comercial.

**Proibido consentimento omnibus** que misture analytics, áudio, compra, compartilhamento e
pesquisa numa autorização única.

**`featureFlags.js` NÃO foi editado nesta execução.** A necessidade de reescrever a justificativa
de `PARENTAL_CONSENT_FLOW_ENABLED` — hoje factualmente falsa — fica **registrada para a fase
proprietária da implementação**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fases 8A e 19) · **risco técnico NÃO
corrigido** · validação física ainda exigida. Conflito **C-4 resolvido**. `P-100`.

---

### Pergunta 6 — A exportação leva moldura ou marca do Mundo do Beni?

**Contexto.** A Fase 4D aprovou a exportação individual com portão parental e cinco garantias (sem
nome, sem identificador, sem progresso, sem chamada infantil para rede social, sem share cards
antigos). O que ela **não** decidiu foi a **aparência do arquivo exportado**. Hoje os exportadores
gravam **apenas a arte**, sem moldura, marca d'água, logo ou assinatura.

**Alternativas.**
- **A.** Arte pura, exatamente como hoje.
- **B.** Moldura discreta com a marca do Mundo do Beni.
- **C.** Moldura opcional, escolhida pelo responsável no momento da exportação.

**Recomendação técnica.** **A** para o lançamento. É o que o código já produz, não exige composição
nova de canvas e não corre o risco de a marca ser lida como conteúdo comercial anexado à criação da
criança. A **C** é a evolução natural depois.

**Consequências.** B e C exigem uma etapa de composição no canvas, com custo de memória e um novo
ponto de regressão no pipeline de exportação — que a `CLAUDE.md` protege explicitamente.

**Códigos afetados.** Nenhum código âncora — a exportação ainda não existe.

**Altera decisão anterior?** **Não** — completa a decisão 4D.

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — ARTE PURA POR PADRÃO.**

A obra pessoal da criança é exportada como **ARTE PURA**: **sem** moldura obrigatória, **sem** marca
d'água, **sem** logo, **sem** CTA, **sem** QR comercial e **sem** assinatura publicitária.

Um *opt-in* futuro do tipo **"Salvar lembrança com o Beni"** é possível, mas **não** faz parte do
lançamento congelado.

**Não confundir** a obra da criança com os **imprimíveis oficiais do Mundo do Beni**, que seguem
contrato próprio — ver **Seção 20**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 19) · **risco técnico NÃO
corrigido** · validação física ainda exigida. Sem código âncora; completa a decisão 4D registrada
em `P-49`.

---

### Pergunta 7 — A exportação salva na galeria do aparelho ou usa a folha de compartilhamento?

**Contexto.** **Nenhuma biblioteca de exportação está instalada** — nem `expo-sharing`, nem
`expo-media-library`, nem `expo-image-picker`, nem `expo-print`. E **nenhuma purpose string de iOS
existe** em `app.json`: o `infoPlist` tem apenas `UIRequiresFullScreen: false`, e a única permissão
Android é `MODIFY_AUDIO_SETTINGS`. Qualquer das duas respostas exige **dependência nova**, que por
regra do projeto precisa de aprovação prévia.

**Alternativas.**
- **A.** Folha de compartilhamento do sistema (`expo-sharing`): o responsável escolhe o destino.
  **Não** exige permissão nova em nenhuma plataforma.
- **B.** Salvar direto na galeria de fotos (`expo-media-library`): exige
  `NSPhotoLibraryAddUsageDescription` no iOS e permissão de mídia no Android, e passa a declarar
  acesso à biblioteca nas lojas.
- **C.** As duas, com a escolha feita pelo responsável.

**Recomendação técnica.** **A.** Entrega a garantia da 4D com **zero permissão nova**, zero mudança
no manifesto de privacidade e a menor superfície de revisão de loja. O responsável que quiser salvar
na galeria consegue fazê-lo pela própria folha do sistema.

**Consequências.** B acrescenta permissão declarada, texto de justificativa, atualização do
manifesto de privacidade e um ponto novo de recusa de permissão a tratar. C soma os dois custos.

**Códigos afetados.** Nenhum código âncora. Interage com `P-92` (manifesto) e com a Pergunta 9.

**Altera decisão anterior?** **Não** — determina a **forma** da exportação aprovada na 4D.

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — FOLHA DE COMPARTILHAMENTO NATIVA DO SISTEMA.**

O uso futuro é a **folha de compartilhamento nativa do sistema**, com o responsável escolhendo o
destino. Essa forma é **preferida** ao acesso direto à biblioteca de fotos.

**`expo-sharing` fica conceitualmente autorizado** para a fase de implementação, **somente se**, no
momento de implementar: (a) for compatível com a versão real do Expo então vigente; (b) ainda for
necessário; (c) os portões do projeto forem cumpridos.

**`expo-media-library` NÃO está autorizado** neste bloco.

**Nesta execução: nenhuma dependência foi instalada e `package.json` não foi alterado.**

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 19) · **risco técnico NÃO
corrigido** · validação física ainda exigida. Conflito **C-5 resolvido**. Sem código âncora;
interage com `P-92`.

---

### Pergunta 8 — Modo Igreja: Opção A ou Opção B? (a Opção C já está descartada)

**Contexto.** O código existe inteiro e está escondido por uma flag de **cerca simples** — a única
do projeto (`P-107`); todas as demais usam cerca quádrupla ou quíntupla, e **nenhum** perfil do
`eas.json` declara a variável. `DECISIONS.md` #5 congelou "não aparece no v1", mas `P-108` registra
que **o destino não foi decidido**. Duas informações novas, levantadas nesta fase, estreitam a
pergunta:

1. A decisão **D3** de `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md:143-152` **já exclui** conta de
   igreja, painel institucional, múltiplos aparelhos e gestão de turmas no lançamento — ou seja, a
   **Opção C já está descartada por documento vigente**, e esta pergunta não a reabre.
2. A UI atual — formulário de turma, lista persistida e **código de convite exibido** — **excede**
   o que D3 autoriza para o lançamento ("promessa controlada, material comercial, página
   informativa ou canal de contato"). Ou seja: se a flag for ligada como está, o produto entrega
   mais do que a decisão vigente permite.

Somam-se os defeitos conhecidos: faixa etária gravada em `churchName` e história da semana exibida
sem nunca ser persistida.

**Alternativas.**
- **A.** Fora do lançamento: cerca elevada a quádrupla, código preservado no Git, nada exposto.
- **B.** Sessão local temporária, sem conta e sem armazenamento infantil permanente — exigindo,
  antes de qualquer exposição, corrigir `P-107`, `P-108`, o texto contraditório de
  `ParentAreaScreen.js:952` e reduzir a UI ao que D3 autoriza.
- **C.** Produto institucional completo — **já descartada por D3**, listada apenas para descarte
  formal.

**Recomendação técnica.** **A** no lançamento. É o que a decisão D3 já determina, o que o estado de
fato entrega, e o único caminho que não acrescenta correções a um trecho fora do caminho crítico. A
**B** só faria sentido se o fundador quiser expor o Modo Igreja no lançamento — e, nesse caso, ela
exige as quatro correções acima **antes** de a flag ser ligada em qualquer build distribuído.

**Consequências.** Escolher A significa que a próxima decisão sobre o Modo Igreja é da Fase 12B.
Escolher B exige decidir também se o compartilhamento de texto do Modo Igreja precisa de portão
próprio (interage com a Pergunta 2) e se o código de convite pode ser exibido.

**Códigos afetados.** `P-107`, `P-108`; interage com C-2 e C-14.

**Altera decisão anterior?** **Não revoga nada.** **Ratifica e completa** `DECISIONS.md` #5 e a
decisão D3, que congelaram a presença no v1 sem definir o destino do código já escrito.

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — NEM A NEM B: MODO IGREJA VIRA LINHA COMERCIAL REAL, LOCAL E
CERCADA, COM SUPERSESSÃO LIMITADA DA DECISÃO ANTIGA.**

A resposta **supera formalmente** a decisão antiga que dizia que o Modo Igreja **não apareceria no
v1**. A supersessão é **limitada** e seu alcance exato está registrado na **Seção 19.1**.

**Exclusões preservadas** (continuam valendo, não são superadas): conta institucional, painel
institucional, gestão complexa de turmas, sincronização entre múltiplos aparelhos e infraestrutura
de SaaS para igrejas.

**O que passa a valer:** criar um Modo Igreja futuro **local, forte, comercialmente relevante e
cercado**. O contrato completo — identidade, proeminência, descoberta, aula gratuita, as cinco aulas
de lançamento, escopo compensatório, papel do Beni, contrato teológico, oração, estrutura canônica,
presets de duração, escala de grupo, experiência imersiva, Sala Simples, *offline*, verificações de
pré-voo, Modo Ensaio, Portal do Encontro, Momento Uau, Mural do Aprendizado, inclusão, imprimíveis,
continuidade igreja↔família, comercialização, paywall e dados — está integralmente registrado na
**Seção 19**.

**Nesta execução: a flag NÃO foi ligada, a UI antiga NÃO foi exposta e NADA foi implementado.**

**Movimento de matriz.** `P-108` deixa de **exigir** decisão no Product Lock e passa a **informar**;
**permanece `ABERTO`**, porque os defeitos técnicos continuam sem correção. `P-107` **continua sendo
risco técnico independente** e **não** é marcado como corrigido só porque o destino comercial foi
decidido. A implementação da funcionalidade permanece alocada à **Fase 12B**; o endurecimento de
cercas e flags permanece nas suas fases proprietárias.

**Estado:** decisão **resolvida** · implementação **pendente** (Fases 12B, 13, 16, 18 e 19) ·
**risco técnico NÃO corrigido** · validação física ainda exigida. Conflitos **C-2**, **C-7** e
**C-14 resolvidos**. `P-107` `P-108`.

---

### Pergunta 9 — Onde vivem a política de privacidade e os termos de uso?

**Contexto.** **Nenhuma URL de política de privacidade ou de termos existe no aplicativo.** A busca
por `privacidade`, `política` e `termos` em `src/` retorna apenas textos informativos dentro da Área
dos Pais. As lojas exigem uma URL de política de privacidade para publicar.

**Alternativas.**
- **A.** Texto integral dentro do app, na Área dos Pais, **sem link externo**, mais uma URL mínima
  hospedada só para satisfazer a exigência da loja.
- **B.** URL externa como fonte única, aberta por link a partir da Área dos Pais (com ou sem portão,
  conforme a Pergunta 2).
- **C.** Ambos: resumo no app e documento completo na URL.

**Recomendação técnica.** **C.** O resumo in-app já existe e é o que o responsável realmente lê; a
URL é obrigação de loja e precisa existir de qualquer forma. Manter os dois evita que a exigência
legal empurre a criança para um navegador.

**Consequências.** Qualquer alternativa exige hospedagem e um endereço estável antes da publicação.
**O conteúdo jurídico não é decidido aqui** — vai à revisão legal na fase própria.

**Códigos afetados.** Nenhum código âncora; interage com `P-92` e com a Pergunta 2.

**Altera decisão anterior?** **Não.**

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — ARQUITETURA C: RESUMO NO APP E DOCUMENTOS COMPLETOS EM URL
OFICIAL ESTÁVEL.**

Resumo claro e legível **dentro da Área dos Pais**, mais os **documentos completos** numa **URL
oficial estável no domínio oficial**. Direção esperada: `mundobeni.com.br/privacidade` e
`mundobeni.com.br/termos` — **essas URLs não precisam existir ainda**.

**Nenhum conteúdo jurídico definitivo é inventado nesta fase.** **Nenhum link legal fica exposto
diretamente à criança.**

**Estado:** decisão **resolvida** · implementação **pendente** (Fases 19 e 20) · **risco técnico NÃO
corrigido** · revisão jurídica ainda exigida (Fase 5). Conflito **C-13 resolvido**. Sem código
âncora; interage com `P-92`.

---

### Pergunta 10 — Qual é o canal de suporte definitivo?

**Contexto.** O único canal externo é `contato@pequenostracosdefe.com`, marcado no próprio código
como provisório: `productConfig.js:20` traz `// TODO: substituir pelo e-mail oficial do domínio Beni
quando disponível.` Ele aparece em cinco pontos da Área dos Pais.

**Alternativas.**
- **A.** Manter o e-mail atual como definitivo.
- **B.** E-mail novo do domínio oficial do Beni.
- **C.** Formulário em site, com o e-mail como alternativa.

**Recomendação técnica.** **B**, decidido **antes** da publicação: o endereço aparece no binário e
em textos de loja, e trocá-lo depois exige atualização do app.

**Consequências.** C exige site e infraestrutura de formulário — dependência externa nova no caminho
do lançamento.

**Códigos afetados.** Nenhum código âncora; conflito C-12.

**Altera decisão anterior?** **Não.**

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — `contato@mundobeni.com.br`.**

O canal público inicial oficial passa a ser **`contato@mundobeni.com.br`**, substituindo a intenção
anterior de manter `contato@pequenostracosdefe.com`.

O endereço **interno de encaminhamento não é exposto publicamente**. **Não** há formulário de site
nesta fase.

**A troca NÃO foi implementada nesta execução**, porque exigiria tocar em `src/`. Fica **registrada
para a fase proprietária**, obrigatoriamente **antes da publicação** — o endereço aparece no binário
e em textos de loja.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 19, antes da publicação) ·
**risco técnico NÃO corrigido**. Conflito **C-12 resolvido**. Sem código âncora.

---

### Pergunta 11 — Qual é o texto de privacidade correto, dado que existe um SDK de terceiro?

**Contexto.** A Área dos Pais afirma hoje "sem coleta de dados" e "tudo funciona só com dados locais
neste aparelho" (`ParentAreaScreen.js:888-914`, `:952`). Mas o SDK da RevenueCat **é configurado no
boot** (`App.js:85` → `entitlementSource.js:56`) e, quando houver chave, falará com servidores de
terceiro; e o `Share.share` do Modo Igreja **já é** um envio externo. As afirmações são verdadeiras
para dados da criança e imprecisas para o conjunto.

**Alternativas.**
- **A.** Reescrever para "**nenhum dado da criança sai deste aparelho**", declarando separadamente
  que a compra é processada pela loja e pelo provedor de assinaturas.
- **B.** Manter "sem coleta" e adicionar uma nota de rodapé sobre compras.
- **C.** Texto longo e detalhado, enumerando cada fluxo.

**Recomendação técnica.** **A.** É a afirmação que o produto consegue **sustentar tecnicamente** —
comprovada nesta fase: nenhum identificador de criança é passado ao SDK, `Purchases.configure` não
recebe `appUserID` e nenhum envio de evento existe. É também a que um responsável entende.

**Consequências.** Manter o texto atual (B parcial) preserva uma afirmação imprecisa numa superfície
de confiança. **A adequação jurídica do texto final é encaminhada à revisão legal**, não decidida
aqui.

**Códigos afetados.** `P-93` (o SDK), conflitos C-3 e C-9.

**Altera decisão anterior?** **Não** — corrige texto de tela, não contrato.

**✅ RESPOSTA DO FUNDADOR (2026-08-06) — O ABSOLUTO CAI; O TEXTO PASSA A SER CURTO, COMPREENSÍVEL E
VERDADEIRO.**

As afirmações **"sem coleta de dados"** e **"tudo funciona só com dados locais neste aparelho"**
**não podem permanecer absolutas**, por três motivos comprovados: a RevenueCat processa informação
de compra e assinatura quando ativada; pode haver telemetria pública opcional no futuro; e
compartilhamento iniciado pelo adulto envia conteúdo para fora.

A nova comunicação obedece a oito regras:

1. Progresso e criações da criança **permanecem locais**, conforme os contratos aprovados, salvo
   mudança explícita.
2. O Mundo do Beni **não constrói perfil comportamental individual da criança**.
3. Telemetria pública futura de produto será **mínima, opcional, desligada por padrão e dependente
   de autorização adulta**.
4. **Compras são processadas pela loja e pelo provedor de assinaturas.**
5. **Compartilhamento só ocorre por ação adulta**, quando o recurso existir.
6. **Não** afirmar de forma absoluta que "nenhum dado sai do aparelho" se isso for tecnicamente
   inverídico.
7. **Nenhum texto jurídico gigante** como mensagem principal da Área dos Pais.
8. **Detalhamento completo na Política de Privacidade.**

**A Fase 4E não redige a política jurídica final.** O texto legal definitivo é encaminhado à
**Fase 5**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 19) · **risco técnico NÃO
corrigido** · revisão jurídica ainda exigida (Fase 5). Conflitos **C-3 resolvido** e **C-9
encaminhado** — esta fase **não** declara conformidade. `P-93`.

---

## 19. Contrato congelado do Modo Igreja

Esta seção registra, sem reinterpretação, o contrato de produto do Modo Igreja fixado pelo fundador
em 2026-08-06 na resposta à Pergunta 8. **Nada aqui é implementado nesta fase.** A implementação da
funcionalidade permanece alocada à **Fase 12B**, conforme a matriz canônica e a `v5`.

### 19.1 Alcance exato da supersessão

A decisão antiga **"Modo Igreja NÃO aparece no v1. Cultinho em Casa fica. Modo Igreja, 'Criar
turma' e qualquer 'em preparação' ficam atrás de flag de build"** vivia no `DECISIONS.md` da **raiz**
— hoje um *stub* marcado `SUPERSEDED` — e permanece legível no histórico do Git. Ela **nunca foi
reabsorvida** pelo árbitro vigente `docs/DECISIONS.md`, sendo citada de forma viva apenas em
`src/config/featureFlags.js:28`.

| O que **é superado** | O que **permanece intacto** |
|---|---|
| A proposição de que o Modo Igreja **não existe como linha de produto** e se resume a código escondido atrás de flag, sem destino | **Cultinho em Casa**, que **não** é tocado por esta supersessão |
| A ausência de destino comercial e de contrato de produto para o Modo Igreja | A exclusão de **conta institucional**, **painel institucional**, **gestão complexa de turmas**, **sincronização multiaparelho** e **SaaS de igreja** |
| — | A decisão **D3** de `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md:143-152`, na parte que exclui o produto institucional completo |
| — | A cerca de *build*: **a flag continua desligada** e **nenhuma UI foi exposta** |

**Texto histórico preservado, não reescrito.** A supersessão é registrada na estrutura
**`Decisões SUPERADAS`** já existente em `docs/DECISIONS.md` e **não** revoga nenhuma outra decisão.

### 19.2 Identidade

Marca guarda-chuva **Mundo do Beni**; linha comercial **Mundo do Beni para Igrejas**; nome do
recurso no app **Modo Igreja**. **Nenhum segundo app, segundo mascote ou segunda identidade.**

### 19.3 Proeminência, descoberta e unidade mínima

Proeminência de **primeira classe na superfície adulta**; **nunca** comunicação comercial na Home
infantil. Unidade mínima de produto: **um adulto conduzindo um grupo de crianças** — **não** se
exige "igreja registrada". Descoberta aberta pós-portão, aquisição *self-service* possível e
contato comercial separado opcional.

### 19.4 A Criação Igreja é gratuita e completa

**Não** é demonstração artificial: preparar, ensaiar, baixar, usar *offline*, conduzir e concluir
**sem pagar**. **Nunca interromper a aula gratuita no meio com paywall.**

### 19.5 As cinco aulas de lançamento

1. **A Criação** (gratuita) · 2. **Noé e o Sinal da Aliança** · 3. **Davi e Golias** ·
4. **Jesus e as Crianças** · 5. **Daniel e os Leões**.

**O Bom Samaritano não está entre elas** e permanece no catálogo geral.

A sequência técnica é preservada: **A Criação** constrói e prova o motor; os **pilotos reais**
ocorrem na Fase 12B; **Noé** prova a reutilização na Fase 13. As outras três são produzidas depois,
com o **mesmo esquema e o mesmo motor** — **nenhuma** pode exigir arquitetura nova.
**Nenhuma fase futura é marcada como concluída.**

### 19.6 Regra de escopo compensatório — 25 exclusões do lançamento inicial

Conta de igreja · painel web · cadastro de criança · lista de presença · *check-in* · *check-out* ·
etiquetas · código de convite · código de turma em rede · sincronização entre aparelhos · ranking ·
controle remoto separado · segundo app · reconhecimento de voz · IA ao vivo · câmera · microfone
para interpretar a aula · personalização com logo da igreja · criador livre de aulas · currículo
anual de 52 semanas · versões denominacionais paralelas · relatórios individuais por criança ·
gestão de voluntários · administração financeira da igreja · SaaS institucional completo.

**Profundidade da experiência antes de amplitude administrativa.**

### 19.7 Papel do Beni

**Não é**: pastor, pregador, professor autoritário, voz de Deus, árbitro denominacional, avaliador
de fé, interruptor constante nem leitor de corações.

**É**: mascote, companheiro, curioso, afetuoso, atento, encorajador, participante da descoberta,
ajudante de memória e presença emocional. **"O Beni descobre, observa, se encanta e recorda junto da
turma."**

Evitar dar a entender que o Beni "não sabia" verdades bíblicas básicas. Cerca de **quatro aparições
funcionais maiores** numa experiência de ~25 minutos: entrada e missão · reação após um ponto
narrativo-chave · convite à participação · recordação e fechamento. **O adulto permanece a
autoridade pedagógica e espiritual.**

### 19.8 Contrato teológico

O produto **é cristão**. **Não** declarar "neutralidade teológica". Adota-se o **NÚCLEO BÍBLICO
COMPARTILHADO**: referências bíblicas, verdades centrais de amplo consenso cristão, aplicação
adequada à infância e **notas ao líder** em temas denominacionalmente sensíveis.

Sem promessa de compatibilidade doutrinária universal; sem versões denominacionais separadas no
lançamento; **o Beni não arbitra silenciosamente divergência cristã legítima**.

### 19.9 Política de oração

O Beni **pode convidar** o grupo a orar; **o adulto conduz**; o guia **pode sugerir** uma oração.
**Evitar**: forçar repetição, registrar decisões espirituais, pontuar oração, dar estrelinhas por
orar, julgar fé, ou dizer que Deus está mais feliz porque a criança respondeu corretamente.
Aprofundamento na **Fase 5**. *(Correção de nomenclatura aplicada na Fase 5, Bloco 0: o texto original dizia "Fase 5C". A Fase 5 não é subdividida.)*

### 19.10 Estrutura canônica da aula

**PREPARAR · ENTRAR · DESCOBRIR · RECORDAR · PARTICIPAR · PRATICAR · CRIAR · GUARDAR · CONTINUAR**,
alimentando **um único motor declarativo** e conversando com o *loop* oficial
**Descobrir · Viver · Criar · Recontar · Praticar · Guardar**.

### 19.11 Duração, escala e modos

*Presets* de **10 / 25 / 45 minutos** — *Momento com o Beni* · *Encontro com o Beni* · *Encontro
Completo* —, com **25 minutos recomendado**, usando os blocos declarativos da **mesma** aula.

Escala: **Grupo pequeno · Turma · Grupo grande**, **sem** contagem exata de crianças e **sem**
*entitlement* baseado em número de crianças.

Dois modos oficiais: **Experiência Imersiva** (TV ou projetor, 16:9, som, sem necessidade de
aparelho da criança, sem informação pessoal) e **Sala Simples**, sem tela coletiva obrigatória, com
o mesmo núcleo pedagógico e menor espetáculo. **Não criar dois motores.**

### 19.12 Operação do encontro

*Offline* após o *download* completo da aula · verificações de pré-voo · **Modo Ensaio** (pular
etapas, ver as falas, repetir áudio, testar transições, tela e tempo), cujo ensaio **não** registra
encontro real · **Portal do Encontro** de ~30 a 60 segundos, pulável, com a interface adulta
desaparecendo.

**Um líder que nunca falou com o Eduardo nem com um desenvolvedor precisa conseguir preparar e
conduzir sozinho.**

### 19.13 Momento Uau

**A Criação** — direção aprovada: tela escura, silêncio, recordação da frase da história, "Haja
luz", líder aciona, revelação visual; com a cautela teológica de que as crianças estão
**recordando a narrativa**, e **não** criando luz por poder próprio.
**Noé** — preparação, chuva, arco-íris da aliança.
**Davi** — contraste de escala e confiança em Deus, evitando o autoajuda *"você vence qualquer
gigante se acreditar em si mesmo"*.
**Jesus e as Crianças** — acolhimento e o lugar das crianças.
**Daniel** — cova, coragem, fidelidade e confiança em Deus.

### 19.14 Mural do Aprendizado e inclusão

O Mural é **coletivo** e representa a turma inteira. **Proibidos**: vencedor, nota, comparação
individual, nome persistido, perfil de criança e ranking.

Alternativas de inclusão previstas: menos movimento, espaço pequeno, criança que não quer falar,
menor dependência de leitura individual e sensibilidade a estímulo — com experiência calma sem
perder conteúdo essencial.

### 19.15 Continuidade igreja ↔ família

Prevista **nos dois sentidos**, sem exigir cadastro de criança.

### 19.16 Comercialização — contrato congelado

Segunda linha de negócio real **dentro do mesmo app**, sem app separado. Congelado:

- **A Criação Igreja é gratuita.**
- Conteúdo premium de Igreja é **separado** do Plano Família.
- Plano Família **não** desbloqueia automaticamente premium de Igreja.
- Acesso Igreja **não** desbloqueia automaticamente benefícios de Família.
- **Nenhum vazamento de *entitlement*** entre as linhas sem decisão explícita.
- A aula gratuita desbloqueia **apenas** o que pertence ao contrato da aula gratuita.
- Adultos individuais **devem conseguir comprar sem falar com vendedor**; contato comercial
  opcional pode coexistir.
- Produto institucional multiusuário futuro é possível, mas **fora** do lançamento inicial.
- **Sem** cobrança ou bloqueio técnico por número exato de crianças no primeiro modelo.
- Preço por adulto, licença, sessão ou sala simultânea é **hipótese, NÃO preço final congelado**.

**Não** definir preço, nome definitivo de plano pago, mensalidade, desconto anual, limite de líderes
ou limite de dispositivos agora.

> **PORTÃO FUTURO OBRIGATÓRIO.** Depois do piloto físico de **A Criação** e **antes** da
> implementação comercial da **Fase 18**, o fundador deve ser **explicitamente chamado** a decidir:
> preço, mensal/anual, desconto, eventual preço de fundador, limite de líderes, limite de salas,
> dispositivos, teste adicional, nome final do produto pago, modelo institucional, venda
> *self-service* × assistida e regras de compra aplicáveis. **Este portão fica registrado e não é
> antecipado.**

### 19.17 Paywall

Pode-se **pré-visualizar** aula premium: tema, objetivo, passagem, duração, prévia e atividades
gerais. **Exige-se *entitlement*** antes de baixar pacote premium, abrir roteiro premium completo,
iniciar sessão premium ou obter material premium.

> **REGRA DURA: PAYWALL ANTES DO ENCONTRO, NUNCA DURANTE.**

Uma sessão já autorizada e iniciada **deve conseguir terminar**: perda de internet,
indisponibilidade momentânea de servidor ou necessidade de revalidação **não** podem transformar o
meio da aula em paywall. A reconciliação comercial ocorre **depois**.

### 19.18 Dados no lançamento inicial

**Não** se exige nome, foto, voz, e-mail, cadastro, conta, lista de presença, perfil ou resposta
identificada de criança. **Denominação não é campo obrigatório.** **Igreja e denominação nunca
entram na telemetria de produto.**

---

## 20. Contrato dos imprimíveis oficiais e da comunicação comercial

Decisão complementar, surgida após as onze perguntas. Distingue **três objetos** que não podem ser
confundidos:

1. **A obra pessoal da criança** — exportada como **arte pura** (Pergunta 6): sem moldura, marca
   d'água, logo, CTA, QR comercial ou assinatura publicitária.
2. **O imprimível oficial do Mundo do Beni** — **pode e deve** levar o Beni, o logo, a identidade
   visual, o nome do app, a origem editorial, a história e o domínio, com a assinatura
   **"Uma atividade do Mundo do Beni"** e `mundobeni.com.br`.
3. **A área comercial adulta dentro do imprimível** — qualquer QR, link ou convite ao app deve estar
   **visualmente separado**, sob rótulo equivalente a **"Para pais e responsáveis"**.

**A chamada de compra nunca é dirigida à criança.** Na área dirigida à criança são **proibidos**
"Baixe agora", "Peça para seus pais assinarem", "Desbloqueie aventuras", "Compre", "Assine", o Beni
pedindo que a criança convença o responsável, ou qualquer CTA equivalente.

> **Identidade de marca: SIM. Persuasão comercial infantil: NÃO.**

Esta separação fica registrada como **contrato de produto**.

---

## 21. Direitos de exibição coletiva

O Modo Igreja transforma conteúdo de uso doméstico em **possível exibição coletiva**. Fica
registrado um **portão obrigatório antes do lançamento das aulas de Igreja**: auditar se as licenças
permitem exibição coletiva em TV, projetor, sala de igreja e grupo de crianças — em especial
**música, fontes, ilustrações licenciadas, efeitos sonoros, narração, traduções bíblicas e conteúdo
de terceiros**.

**Dono natural: Fase 16 — congelamento de conteúdo e licenças**, salvo indicação de fase anterior
pelo árbitro competente. **Nenhuma licença é resolvida agora.**

---

## 22. O que a Fase 4E NÃO encerra — encaminhamentos jurídicos obrigatórios

A Fase 4E **congela produto**; **não** declara conformidade jurídica final. Ficam registrados como
obrigatórios na **Fase 5** os 24 itens abaixo:

mapa de dados · minimização · base legal · retenção · exclusão · consentimento adulto · revogação ·
ECA · ECA Digital · LGPD · RIPD · enquadramento aplicável de serviço com controle editorial ·
operadores e processadores · subprocessadores · transferências internacionais · SDKs · Apple Kids e
App Privacy · Google Families e Data Safety · comunicação comercial infantil · política de oração ·
neutralidade denominacional · textos jurídicos finais · direitos de exibição coletiva em igrejas ·
licenças de música, fontes, imagens, efeitos, traduções bíblicas e demais conteúdos usados em
apresentação coletiva.

> **Proibido declarar**, nesta fase ou em qualquer artefato dela derivado: *"legalmente aprovado"*,
> *"100% conforme"*, *"nenhum risco"* ou *"anonimização garantida"* sem a fase jurídica
> correspondente.

---

## 23. Critérios de saída da Fase 4E

A Fase 4E só poderá ser encerrada quando **todos** os itens abaixo estiverem satisfeitos.

1. As **11 perguntas** da Seção 18 estiverem respondidas pelo fundador, sem que nenhuma tenha sido
   escolhida pelo integrador.
2. Os **8 conflitos que exigem o fundador** (C-3, C-4, C-5, C-7, C-10, C-11, C-12, C-13) estiverem
   resolvidos, e os **6 resolvíveis** (C-1, C-2, C-6, C-8, C-14, C-15) estiverem registrados como
   tais.
3. O conflito **C-9** estiver formalmente **encaminhado** à revisão legal, sem que esta fase declare
   conformidade.
4. Os **5 códigos que dependem do fundador** (`P-85`, `P-100`, `P-107`, `P-108` e a parte
   institucional de `P-107`) tiverem decisão registrada, e `P-127` e `P-139` tiverem sua dependência
   de `P-85` resolvida.
5. O **contrato do portão parental** estiver escrito: duração, escopo, término, segundo plano,
   inatividade, navegação e aparelho compartilhado.
6. A **classificação das 12 categorias** de analytics estiver ratificada e a **opção de lançamento**
   escolhida entre as cinco.
7. As **regras de minimização de identificadores** estiverem ratificadas, com a proibição explícita
   de converter o `childId` local em identificador remoto.
8. A lista do que **nunca pode aparecer em log** estiver ratificada.
9. O **destino do Modo Igreja** estiver escolhido entre A e B, com C registrada como **já descartada
   pela decisão D3** de `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md:143-152`, e com a constatação de que
   a UI atual excede o que D3 autoriza para o lançamento.
10. As **cinco garantias de exportação da Fase 4D** estiverem preservadas e a **forma** da exportação
    (moldura e destino) estiver decidida.
11. As **quatro garantias comerciais de 4A/4B** estiverem preservadas, com a correção dos cinco
    rótulos de acessibilidade encaminhada à Fase 12A.
12. Nenhuma decisão das Fases 4A, 4B, 4C e 4D tiver sido revogada, afrouxada, reinterpretada ou
    reaberta.
13. Só então: registro em `docs/DECISIONS.md`, atualização da matriz canônica se houver código novo,
    anotação na `v5` e commit documental seletivo.

### 23.1 Verificação de saída (2026-08-06)

A lista acima é **preservada como foi escrita** na versão preliminar. A verificação abaixo declara,
item a item, se o critério foi satisfeito.

| # | Situação | Evidência |
|---|---|---|
| 1 | ✅ Satisfeito | As onze perguntas da Seção 18 têm bloco `✅ RESPOSTA DO FUNDADOR (2026-08-06)`. **Nenhuma** foi escolhida pelo integrador; em **cinco** (Perguntas 2, 3, 4, 5 e 8) o fundador decidiu **diferente** da recomendação técnica. |
| 2 | ✅ Satisfeito | Os oito que exigiam o fundador estão resolvidos: **C-3** (Pergunta 11), **C-4** (Pergunta 4), **C-5** (Pergunta 5), **C-7** (Pergunta 7), **C-10** (Pergunta 2), **C-11** (Pergunta 8), **C-12** (Pergunta 8), **C-13** (Pergunta 8). Os seis resolvíveis (C-1, C-2, C-6, C-8, C-14, C-15) seguem registrados como tais; **C-2** e **C-14** foram adicionalmente ratificados pelas respostas 1 e 6. |
| 3 | ✅ Satisfeito | **C-9** consta como **encaminhado** à revisão legal na resposta da Pergunta 11 e na Seção 22. Esta fase **não** declara conformidade. |
| 4 | ✅ Satisfeito, **com correção de contagem** | São **4** códigos dependentes do fundador — `P-85`, `P-100`, `P-107`, `P-108` —, não 5: o texto preliminar contou `P-107` duas vezes (ver Seção 0.1). Todos os quatro têm decisão registrada. `P-127` e `P-139` tiveram sua dependência de `P-85` resolvida pela Pergunta 4. |
| 5 | ✅ Satisfeito | Contrato do portão parental fixado pela Pergunta 1: duração por **inatividade de 5 minutos**, escopo, término, segundo plano, navegação e aparelho compartilhado. |
| 6 | ✅ Satisfeito | As **12 categorias** foram ratificadas na Pergunta 4 e a opção de lançamento escolhida: **arquitetura de três camadas**, com telemetria pública **desligada por padrão**. |
| 7 | ✅ Satisfeito | Regras de minimização ratificadas, incluindo a proibição explícita de converter o `childId` local em identificador remoto. |
| 8 | ✅ Satisfeito | A lista do que nunca pode aparecer em log foi ratificada sem afrouxamento. |
| 9 | ✅ Satisfeito, **com escolha ampliada** | O fundador **não** escolheu A nem B como formuladas: escolheu manter o Modo Igreja como **segunda linha de produto real dentro do mesmo app**, com contrato congelado na Seção 19 e implementação na **Fase 12B**. **C permanece descartada.** A flag continua **desligada** e nenhuma UI foi exposta. |
| 10 | ✅ Satisfeito | As cinco garantias de exportação da Fase 4D estão preservadas; a forma foi decidida na Pergunta 6 (**arte pura**) e na Pergunta 7 (**folha de compartilhamento nativa**), com o contrato dos imprimíveis oficiais na Seção 20. |
| 11 | ✅ Satisfeito | As quatro garantias comerciais de 4A/4B estão preservadas; a correção dos cinco rótulos de acessibilidade segue encaminhada à **Fase 12A**, sem antecipação. |
| 12 | ✅ Satisfeito | Nenhuma decisão de 4A, 4B, 4C ou 4D foi revogada, afrouxada, reinterpretada ou reaberta. A única supersessão é a do `DECISIONS.md` **da raiz** (*stub* `SUPERSEDED`), com alcance delimitado na Seção 19.1. |
| 13 | ✅ Satisfeito | Registro em `docs/DECISIONS.md` (bloco `PL4E`), atualização da matriz canônica (§28 e coluna Observação), anotação na `v5` §3 e em `docs/PROJECT_SOURCE_OF_TRUTH.md`, e **um** commit documental seletivo. **Nenhum código novo `P-nnn` foi criado.** |

---

## 24. Consolidação da Fase 4E

### 24.1 O que a Fase 4E decidiu

Onze decisões de produto, todas do fundador, todas **resolvidas** no eixo de decisão e todas com
**implementação pendente**: portão parental por inatividade · links externos sob a Regra D refinada ·
exclusão iniciada pela criança e concluída pelo adulto · analytics em três camadas · consentimento e
pesquisa · exportação como arte pura · folha de compartilhamento nativa · Modo Igreja como segunda
linha de produto · Arquitetura C para política e termos · `contato@mundobeni.com.br` · texto de
privacidade curto, compreensível e verdadeiro.

Somam-se três contratos complementares: **imprimíveis oficiais** (Seção 20), **direitos de exibição
coletiva** (Seção 21) e os **24 encaminhamentos jurídicos** (Seção 22).

### 24.2 Movimento de status na matriz canônica

| Código | Status | Product Lock | Observação |
|---|---|---|---|
| `P-85` | `DECISÃO DE PRODUTO PENDENTE` → **`ABERTO`** | `EXIGE DECISÃO NO PRODUCT LOCK` → **`INFORMA O PRODUCT LOCK`** | Decisão de produto tomada; **risco técnico permanece** |
| `P-100` | `DECISÃO DE PRODUTO PENDENTE` → **`ABERTO`** | `EXIGE DECISÃO NO PRODUCT LOCK` → **`INFORMA O PRODUCT LOCK`** | Idem |
| `P-108` | **`ABERTO` → `ABERTO`** | `EXIGE DECISÃO NO PRODUCT LOCK` → **`INFORMA O PRODUCT LOCK`** | **Já estava `ABERTO`**; só o eixo Product Lock se move |

Os demais códigos tocados — `P-49`, `P-92`, `P-107`, `P-127`, `P-139`, `P-145` — recebem
**anotação** na coluna Observação **sem** mudança de Status. `P-42`, `P-73` e `P-112` **não** são
tocados.

### 24.3 O que a Fase 4E **não** transformou em código

**Nada.** Nenhum arquivo fora de `docs/` foi alterado. Não houve implementação de sessão parental,
links, consentimento, Modo Igreja, exportação, compartilhamento, RevenueCat, endpoint de analytics
ou backend. Nenhuma dependência foi instalada; nenhum *build* foi gerado; nenhuma configuração de
loja foi tocada.

### 24.4 O que foi superado

Somente a decisão do `DECISIONS.md` **da raiz** sobre o Modo Igreja, no alcance exato da
**Seção 19.1**. O texto histórico **não** foi apagado nem reescrito.

### 24.5 O que foi preservado

Todas as decisões das Fases **3H, 4A, 4B, 4C e 4D**; o Cultinho em Casa; a exclusão do produto
institucional completo; as cinco garantias de exportação de 4D; as quatro garantias comerciais de
4A/4B; e a base executável congelada `015c438106538595b592981fbe1b80b1d5d65e55`.

### 24.6 O que a Fase 4E **não** fez

Não declarou conformidade jurídica · não definiu preço, plano pago, mensalidade, desconto ou limites
do Modo Igreja · não resolveu licenças de exibição coletiva · não marcou nenhuma fase futura como
concluída · não executou validação física · não recuperou o histórico remoto de *build* do EAS ·
não recuperou evidência de execução de instalação de dependências (ver Seção 0.8).

---

> **FASE 4E ENCERRADA (2026-08-06).**
> As onze perguntas foram respondidas pelo fundador e consolidadas neste artefato. Nenhum arquivo
> executável, *asset*, configuração ou permissão foi alterado; nenhuma dependência foi instalada;
> nenhum *build* foi gerado; nenhuma validação física foi executada.
> As alterações desta fase são **exclusivamente documentais** e alcançam apenas
> `docs/DECISIONS.md`, a matriz canônica `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`,
> `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`, `docs/PROJECT_SOURCE_OF_TRUTH.md` e este
> artefato. **Não houve *push* nem *merge*.**
