# Fonte de Verdade v1 — Pequenos Traços de Fé

*Documento oficial de alinhamento estratégico e operacional do projeto.*

---

## 1. Status deste documento

Este documento é a **fonte de verdade operacional** do projeto Pequenos Traços de Fé.

Quando houver conflito entre documentos antigos e este arquivo, **este arquivo prevalece**.

Documentos antigos permanecem como histórico, mas **não devem orientar decisões futuras sem validação contra este arquivo**. Veja o mapa de documentos em [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

**Linha de lançamento (execução, otimização, beta e lançamento):** a [`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) (**v5, vigente desde 2026-07-30**) é a **fonte única de verdade da linha de lançamento**, subordinada a este arquivo e às decisões. É lá que vivem o **roadmap integral (Fase 0 à Fase 22)**, o **baseline técnico carimbado** e a **fase atual**. O árbitro único das **decisões de produto/lançamento** é [`docs/DECISIONS.md`](DECISIONS.md). Em conflito entre um documento e o `docs/DECISIONS.md`, **vence o `docs/DECISIONS.md`**. Decisão de escopo travada: **a aba Brincar completa entra no lançamento**, com **arquitetura híbrida obrigatória** (2 histórias grátis locais no binário, 18 premium por packs remotos no Cloudflare R2).

> **Fonte de verdade v5 (2026-07-30):** a [`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md) foi **superada pela v5** — passa a ser histórica, com banner no topo e conteúdo preservado. Antes disso, a **Reconciliação E1 (2026-07-15)** já havia superado o `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md` (v2.0); detalhes em [`docs/launch/RECONCILIACAO_E1.md`](launch/RECONCILIACAO_E1.md).

O [`PLANO_OFICIAL_BENI_LANCAMENTO.md`](PLANO_OFICIAL_BENI_LANCAMENTO.md), o `DOCUMENTO_OFICIAL_PROJETO_FINAL.md` (v2.0) e a `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md` foram **substituídos** e permanecem **apenas como histórico**. Os conflitos registrados na Fase 0 estão em [`docs/launch/DECISOES_E_CONFLITOS.md`](launch/DECISOES_E_CONFLITOS.md); a matriz de acesso em [`docs/launch/MATRIZ_DE_ACESSO.md`](launch/MATRIZ_DE_ACESSO.md).

**Precedência documental consolidada:**
- **Governança técnica:** `docs/PROJECT_SOURCE_OF_TRUTH.md` → `.specify/memory/constitution.md` → `AGENTS.md` → `CLAUDE.md` → spec → plan → tasks → sessão.
- **Decisões de produto/lançamento:** `docs/DECISIONS.md` (**árbitro único**) → `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` (**vigente**) → Direção de Arte v1.1 + docs narrativos/bíblicos vigentes → documentos antigos (**histórico, não normativo**: v4, v2.0, plano antigo).
- **Inventário de pendências e riscos:** [`docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`](fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md) (**matriz canônica única**, códigos `P-01` a `P-139`, adotada em 2026-08-05).

> **Divisão de competências (E018 · 2026-08-05).** Os quatro eixos não competem entre si:
> **este arquivo** governa precedência e governança técnica; **`docs/DECISIONS.md`** arbitra as
> decisões de produto e lançamento; a **`v5`** governa o roadmap e a sequência de fases; a
> **matriz 09** governa o inventário, a identidade, o status, a fase e a rastreabilidade das
> pendências. Onde um documento cita um risco, ele cita o **código `P`** e deixa a definição na
> matriz — **nenhum outro documento replica a matriz nem mantém tabela normativa de riscos
> concorrente**. As listas antigas (lista `R` no `docs/DECISIONS.md` e na `v5` §4, achados
> físicos da `v5` §4.1, listas `E015-N`) permanecem legíveis **apenas como origem histórica e
> alias**.

**Anexo de direção visual:** a [`docs/DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md`](DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md) é o **anexo oficial de direção de arte** (governa visual, tokens, responsividade, componentes e critérios de aceite visuais), subordinado à v5 e ao `docs/DECISIONS.md`. As decisões visuais congeladas (D1–D4) estão registradas em `docs/DECISIONS.md` (D-DESIGN-LIVRO-VIVO).

---

## 1.1 Fase atual

**Fase 6 — Shell, splash e sistema visual: EM EXECUÇÃO desde 2026-08-07.** Abertura canônica
auditada e **aprovada pelo fundador** em 2026-08-07; o ciclo SDD foi formalmente iniciado.
**Fase 5 — infância, privacidade, teologia e medição: DOCUMENTALMENTE ENCERRADA em 2026-08-07.**
**Sequência confirmada pelo [`v5`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) §3 — único árbitro de sequência.**

> **Correção declarada, não silenciosa (2026-08-07, abertura da Fase 6).** Este campo dizia
> *"Fase 5 … DOCUMENTALMENTE ENCERRADA"* + *"Próxima fase canônica … **Fase 6 — shell e splash**"*.
> Duas imprecisões foram corrigidas, **sem apagar nada**: (a) o campo apontava a Fase 6 como
> *próxima* quando ela já está **em execução**; (b) o título estava reduzido a *"shell e splash"* e
> **omitia o terceiro eixo — o sistema visual** —, enquanto o título canônico no `v5` §3 é
> **"Fase 6 — Shell, splash e sistema visual"**. A substância do registro anterior permanece: a
> Fase 5 segue documentalmente encerrada e a Fase 6 herda `E5.52` e o risco `P-139`.
>
> **Estado executável da Fase 6 nesta data:** *worktree* `C:\tmp\ptf_fase6_shell_splash_wt` ·
> *branch* `feat/fase6-shell-splash` · baseline documental `7de7085` · base executável preservada
> `015c438` · **nenhum arquivo de runtime alterado** · nenhum *build*, nenhuma validação física e
> **nenhum push**.

> **Correção declarada, não silenciosa (2026-08-07, Fase 5 Bloco 7).** Este campo dizia *"Fase 3 —
> reconciliação completa (somente leitura)"*. Estava correto quando escrito e ficou desatualizado
> porque as Fases 3H, 4 (blocos 4A a 4E) e 5 foram registradas **como parágrafos** desta seção **sem
> que o campo fosse atualizado**. Nenhum registro foi apagado: a tabela abaixo e os parágrafos
> seguintes continuam sendo a memória de cada fase, na ordem em que ocorreram. A tabela abaixo
> descreve especificamente a **Fase 3**.

| Item | Valor |
|---|---|
| Fase anterior | **Fase 2.5 — integração do Colorir com o Beni sobre a fundação: ENCERRADA em 2026-08-04** |
| Linha canônica | **`integrate/colorir-canonical-runtime`** |
| HEAD canônico | **`7f96ee9`** — Spec 020 · Bloco 1 (o onboarding termina no Mapa) integrado por *fast-forward* sobre `ea54a90`; histórico linear, sem commit de merge |
| Baseline técnico | `fix/loading-performance-foundation` @ **`aeda9c2`** · tag **`lp-foundation-closed-2026-07-30`** → `bc79edb` · smoke **3314/3314** |
| Portões no HEAD canônico | `npm run smoke` **4525/4525** · `npx expo-doctor` **18/18** |
| Método | **Somente leitura.** A Fase 3 audita e reconcilia; nenhuma implementação sem novo ciclo SDD e sem os portões humanos. |

Objetivo, entregas, critério de saída, riscos e as fases seguintes (até a **Fase 22**) estão na [`v5`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) §3. As decisões de produto da Fase 2.5 estão em [`docs/DECISIONS.md`](DECISIONS.md), registros `D-C60-INTEGRACAO-PRODUTO` e `D-C60-PERSISTENCIA-TODOS-PLANOS`.

**Achados físicos registrados nesta fase.** A sessão física no build interno iOS **`98e2b422-0025-4d40-a772-073ef3dba553`** (commit executável `7f96ee9`, perfil `c60-pilot`) produziu quatro pendências: **QA REP 01**, **STR ONB 01**, **JRN C60 01** e **ONB BRI 01**. Elas foram reconciliadas na matriz canônica como **`P-32`**, **`P-35`**, **`P-18`** e **`P-34`** — é lá que status e fase proprietária são lidos. A tabela da [`v5`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) §4.1 permanece como **origem histórica e alias**. Nenhuma foi corrigida — o registro é documental.

**Fase 3H — reconciliação documental (E009 a E018), encerrada em 2026-08-05.** O bloco produziu os onze artefatos de `docs/fase3-reconciliacao/` e, na E018, a **adoção da matriz canônica** pelos documentos árbitros. A matriz fechou com **139 códigos**, `P-01` a `P-139`, sem lacunas e sem renumeração: os sete riscos `R` residuais foram absorvidos (`P-135` a `P-139` e alias), a precisão do `P-56` foi corrigida sem rebaixar severidade, e o `P-129` foi reclassificado de `BLOQUEIA PRODUCT LOCK` para `EXIGE DECISÃO NO PRODUCT LOCK` por bloqueio circular demonstrado. **Nenhum item bloqueia o Product Lock**, que fica **apto a iniciar**. Todo o bloco alterou **somente documentação**: `src`, `scripts`, `assets` e configurações de build seguem bit a bit idênticos ao commit executável congelado **`015c438`**.

**Fase 4 — Product Lock final: blocos 4A, 4B, 4C e 4D encerrados em 2026-08-05; bloco 4E encerrado em 2026-08-06.** O Product Lock **iniciou** e já congelou cinco blocos de escopo, todos com as respostas do fundador registradas em [`docs/DECISIONS.md`](DECISIONS.md): **`PL4A`** (Plano Família, compra, restauração e entitlement), **`PL4B`** (acesso grátis, conteúdo do Plano Família, histórias e superfícies infantis), **`PL4C`** (jornada, progressão, conclusão e desbloqueios), **`PL4D`** (dados, persistência, migração, recuperação e integridade) e **`PL4E`** (privacidade, Área dos Pais, analytics e Modo Igreja). Os artefatos vivem em `docs/fase4-product-lock/`. A matriz canônica cresceu de **139** para **148 códigos** (`P-01` a `P-148`) **sem nenhuma renumeração**: a Fase 4A criou `P-140` e a Fase 4D criou `P-141` a `P-148`; a **Fase 4E não criou nenhum código novo** e apenas moveu a classificação de `P-85`, `P-100` e `P-108` (§28 da matriz). *Registro de veracidade acrescentado em 2026-08-06: o **gerador determinístico** citado nas mensagens de commit das Fases 4A a 4D **não existe neste repositório**; a recontagem dos blocos derivados da Fase 4E foi feita **manualmente e auditada**.* **Nenhum risco técnico foi marcado como corrigido por causa de decisão de produto** — decisão resolvida, implementação pendente e validação futura permanecem estados distintos, e a implementação segue para as Fases 5, 6, 7, 8A, 9, 10, 11, 12A, **12B**, 16, 17, 18 e 19. A Fase 4E deu **destino de produto ao Modo Igreja** (segunda linha comercial dentro do mesmo aplicativo, implementação na **Fase 12B**), **sem** definir preço, e **não** declarou conformidade jurídica. Os cinco blocos alteraram **somente documentação**: `src`, `scripts`, `assets` e configurações de build seguem bit a bit idênticos ao commit executável congelado **`015c438`**. **Nenhum *build* foi gerado e nenhuma validação física foi executada** nestes blocos.

**Fase 5 — infância, privacidade, teologia e medição: DOCUMENTALMENTE ENCERRADA em 2026-08-07.** Sete blocos documentais produziram os artefatos de `docs/fase5-pareceres/` (`00` a `07`) e o diretório declaradamente vazio `docs/biblical-review/reports/`. A fase **não é subdividida** — não existem `Fase 5A`, `5B` ou `5C`; a designação "Fase 5C" herdada de [`DECISIONS.md`](DECISIONS.md) foi corrigida de forma declarada em **duas** ocorrências. A matriz canônica cresceu de **148** para **149 códigos** (`P-01` a `P-149`) **sem renumeração**: o Bloco 0 criou **`P-149`** após auditoria de deduplicação contra `P-01`..`P-148`. Os **setenta e um** encaminhamentos `E5.1` a `E5.71` têm destino declarado em um dos quatro estados obrigatórios — **RESOLVIDO NESTA FASE** (14), **ENCAMINHADO À FASE PROPRIETÁRIA** (38), **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** (8) e **DEPENDENTE DE TERCEIRO EXTERNO** (11). O fundador **ratificou** a faixa **4 a 8 anos**, **aprovou** o plano de medição não identificada **no eixo documental**, **decidiu** a política de oração pelo **Caminho B** e **determinou** que *"Ateliê"* **não** é nome canônico (os nomes são `Criar Livre` e `Colorir com o Beni`). ⚠️ **Encerramento documental não é aprovação para lançamento:** **nenhum risco técnico foi corrigido** — `P-85`, `P-92`, `P-100`, `P-127`, `P-139`, `P-141` e `P-149` permanecem `ABERTO` —, **nenhuma validação física ocorreu** e **dezenove dependências externas seguem vivas** (nove jurídicas ou contratuais, duas teológicas e oito de validação humana), incluindo o **portão de revisão bíblica violado por 20 histórias de 20**, sem revisor humano identificado. *Registro de veracidade: a recontagem das dez contagens derivadas da matriz foi feita **manualmente e auditada** no Bloco 7 — o "gerador determinístico" citado nas mensagens de commit das Fases 4A a 4D **continua não existindo neste repositório** —, confirmou todos os dez valores de §29.5 e declarou duas imprecisões de **rótulo de coluna**, sem alterar nenhum número.* A fase alterou **somente documentação**: `src`, `scripts`, `assets`, `App.js`, `app.json`, `eas.json`, `package.json`, `package-lock.json` e `plugins/` seguem **bit a bit idênticos** ao commit executável congelado **`015c438`**, com `npm run smoke` **4525/4525**. **Nenhum *build* foi gerado, nenhuma dependência foi instalada e nenhum *push* foi executado.** Consolidação completa em [`docs/fase5-pareceres/07_CONSOLIDACAO_FASE_5.md`](fase5-pareceres/07_CONSOLIDACAO_FASE_5.md); decisões de produto em [`DECISIONS.md`](DECISIONS.md) §`PF5`.

**Spec 020 — aprovada e encerrada (2026-08-04).** No mesmo build, e por **declaração direta do fundador**, a Spec 020 foi **fisicamente aprovada** no caminho principal de **telefone** e no caminho **`Pular`**: o onboarding termina no **Mapa de Aventuras**, *A Criação* não abre sozinha, o tour do Beni percorre os cinco passos, o mapa rola até o pin, o pin recebe destaque, a história abre somente pelo toque e o tour não reaparece. O veredito e as evidências vivem **exclusivamente** em `specs/020-onboarding-first-adventure/spec-onboarding-first-adventure.md` §14 — este parágrafo é ponteiro, não duplicata. **E003 a E008 estão CONCLUÍDAS.** Permanecem **abertas e não bloqueantes**, migradas para a **Fase 7**, a validação em **tablet** e o **fluxo de revisão** com *A Criação* já concluída. O fechamento alterou **somente documentação** — `src`, `scripts`, `assets` e configurações de build seguem bit a bit idênticos a `7f96ee9`, e **nenhum build novo foi necessário**.

### 1.1.1 Encerramento da Fase 2.5 (2026-08-04)

**Linha canônica.** A Fase 2.5 começou em **`integrate/colorir-with-loading`** e, a partir da canonicalização de runtime, passou a viver em **`integrate/colorir-canonical-runtime`** — esta é a **linha canônica vigente**. A branch anterior permanece como **registro histórico**, não como branch de trabalho. Contexto histórico preservado da fase: branch de origem do piloto `feat/colorir-60-pilot-creation` @ **`795760a`**, merge base **`6cf799c`**, método de integração **reconstruída por blocos, sem merge bruto da branch antiga**.

**Estado técnico integrado.** O HEAD canônico **no momento deste encerramento** era **`ea54a90`**, alcançado por *fast-forward* a partir de **`e07e8bc`** (16 commits: Spec 018 + Spec 019 + fechamento documental). Nenhum commit de merge; histórico linear preservado. A publicação da linha canônica em `origin` faz parte deste encerramento.

**Aprovação física.** A Spec 019 foi **validada fisicamente pelo fundador em iPhone real**, no build interno iOS **`bafb8e3f-4fd5-43b6-873b-aca69a4a8a6a`** (commit executável **`b24c868`**, perfil `c60-pilot`, fingerprint `c8b6c521500558fde471e47202d41d5e9dda79aa`). Foram declarados **aprovados** os cinco itens visuais A1–A5 e os dez testes de persistência e exclusão P1–P10. Evidências em [`docs/C60_VALIDACAO_FISICA.md`](C60_VALIDACAO_FISICA.md) (Parte D) e veredito em `specs/019-c60-persistence-all-plans/spec-c60-persistence-all-plans.md` §21. O commit `ea54a90` é **puramente documental** sobre `b24c868`: `src`, `scripts`, `assets`, dependências e configurações de build são **bit a bit idênticos** ao binário validado.

**Escopo aprovado.** O veredito vale no **eixo local e do Plano Grátis**: persistência das pinturas em armazenamento local, separação entre progresso e criações, exclusões parentais e comportamento sem rede. É esse eixo que está encerrado.

**Pendência controlada — Plano Família e premium.** O perfil `c60-pilot` não declara chave `EXPO_PUBLIC_REVENUECAT_*` e opera **permanentemente no plano Grátis** (`configureRevenueCat()` é *fail-closed*). Os cenários de **entitlement Família real, compra, restauração, pack premium e downgrade** **não foram validados fisicamente** e **não estão registrados nem como aprovados nem como reprovados**. Tornam-se **obrigatórios na Fase 18 (monetização)**, com **revalidação na Fase 21 (beta do candidato a lançamento)**.

**Próxima fase oficial.** **Fase 3 — reconciliação completa, somente leitura.**

---

## 2. Produto

- **Nome do projeto/app:** Pequenos Traços de Fé.
- **Mascote oficial:** **Beni**.
- **"Lumi"** é nome **histórico/antigo** — não é o nome ativo do mascote. (Ainda aparece em algumas rotas/strings legadas no código, mas não deve ser usado como nome do mascote.)
- **Público inicial:** famílias cristãs no Brasil, com crianças pequenas.
- **Posicionamento:** app cristão infantil com histórias bíblicas, mapa de aventuras, narração, colorir, Livrinho da Fé, Estrelinhas, Baú do Beni, Cultinho em Casa, Perfil, Área dos Pais e Modo Igreja.
- **Maturidade:** não é protótipo. O app já tem **core loop funcional** (mapa → história → narração/quiz → colorir → Livrinho → conquistas).

---

## 3. Stack e base técnica

Apenas fatos verificados no código (`app.json`, `package.json`, `eas.json`):

- **React Native / Expo SDK 54** (`expo: ~54.0.35`).
- **Áudio com `expo-audio`** (`~1.1.1`). **`expo-av` NÃO está presente.**
- **EAS Build configurado** com perfis `development`, `preview` e `production` (`eas.json`). `appVersionSource: local`. **Sem `submit` configurado.**
- **Sem `expo-updates` / OTA** (dependência ausente; nenhuma referência em código).
- **Sem SDK de tracking/analytics** (nenhuma dependência de analytics/firebase/sentry/segment/etc. em `package.json`).
- **Privacidade atual: local-first** — dados em `AsyncStorage`, **sem backend próprio**, sem coleta de dados pessoais sensíveis. `app.json` declara `NSPrivacyTracking: false` e `NSPrivacyCollectedDataTypes: []`.

> Se algum roadmap/doc antigo divergir destas versões, vale o que está no `package.json`/`app.json`/`eas.json`.

---

## 4. Decisões estratégicas travadas

Decisões **fechadas** (não reabrir sem nova decisão estratégica explícita):

**Mascote**
- Beni é o mascote oficial.

**Categoria de loja**
- Soft launch recomendado em classificação **4+**, **fora da Kids Category**.
- Fora da Kids Category: **evitar metadados de loja em inglês** que afirmem "For Kids", "For Children" ou equivalente.
- Em português: manter linguagem **familiar/educacional segura**, sem prometer categoria infantil específica de forma indevida.

**Backend**
- **Não** construir backend próprio agora. Manter app **local-first**.
- Ao monetizar, usar **RevenueCat** como backend gerenciado de compras/entitlements.
- Servidor próprio só após tração real (ex.: sync entre aparelhos ou licenciamento institucional avançado).

**Modelo de receita** *(atualizado na Reconciliação E1 — ver `docs/DECISIONS.md` D-MONETIZACAO-V1)*
- Ofertas do v1: **mensal + anual**. **Sem plano trimestral e sem plano vitalício no v1.**
- **RevenueCat** como fonte de entitlement; paywall só atrás da Área dos Pais + gate parental.
- **Valores numéricos = pendência controlada** (não inventar; ver decisões pendentes em `docs/DECISIONS.md`).
- Conteúdo digital no app deve respeitar **compra in-app das lojas**.

**Assets e peso**
- Regra daqui para frente: **shell + histórias gratuitas no binário base**.
- Conteúdo premium/adicional deve caminhar para **sob demanda**.
- **Não adicionar mais assets pesados ao binário público.** *(A regra permanece; o tratamento definitivo do peso e do `require()` estático é das **Fases 16 e 17** da [v5](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) — riscos R5/R6/R7, hoje canônicos como `P-135`, `P-136` e `P-131`. A menção original a "antes da Fase 2" usava a numeração superada.)*
- Avaliar **WebP lossy** para cenas coloridas.
- Avaliar **WebP lossless / PNG otimizado** para páginas de colorir, **com teste de flood-fill**.
- As pastas **untracked** de histórias **não** devem entrar com `git add .` sem auditoria.

**Conteúdo de lançamento**
- As histórias **grátis precisam ser impecáveis**.
- **A Criação** e **Noé** são a vitrine inicial.
- **Noé precisa de narração completa** antes do soft launch (hoje só "creation" tem narração no manifesto — ver Fase 4).

**Modo Igreja**
- É **diferencial estratégico real**, não ideia distante.
- Deve ser polido e ativado **depois** dos bloqueadores de core loop, peso e conteúdo grátis.

---

## 5. O que NÃO reabrir como pendência

Não tratar como **P1 ativo** (confirmados resolvidos na auditoria de código atual):

- **Clipping do canvas do Ateliê** — corrigido (painel de altura fixa reservada + canvas `flex:1`).
- **Livro Mágico Misto** — removido (Livrinho tem só 2 modos: `official` / `child`).
- **Quiz sempre na posição A** — não ocorre na UI (os dados têm `correct:0`, mas o `quizModel` embaralha com Fisher–Yates e a `QuizScreen` valida por **id**, não por posição).

> Esses pontos só devem ser reabertos se houver **bug novo reproduzível em device**.

---

## 6. Bloqueadores atuais reais

**P1 — Bug do tour no mapa (core loop)**
- O mapa parece travado durante o tour porque o overlay captura toques enquanto o usuário espera arrastar/tocar.
- **Decisão esperada — escolher contrato explícito** *(destino na [v5](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md): **Fase 11**, horizonte final do Mapa de Aventuras)*:
  - **Opção A:** tour modal, interação claramente bloqueada e guiada por botões.
  - **Opção B:** tour interativo, toque passa para alvos reais.
  - **Recomendação inicial: Opção A para v1** (mais simples, segura, elimina a sensação de travamento).

**P1 — Peso/arquitetura de assets (estrutural)**
- O peso de imagens referenciadas (~502 MB de PNG referenciado; ~732 MB de PNG no total do working dir) exige arquitetura de **bundle + conteúdo sob demanda**. Não é otimização cosmética.

**P1 — Histórias grátis impecáveis (conteúdo)**
- **Noé** precisa estar no mesmo nível de **A Criação** (incl. narração completa) para o gratuito gerar confiança.

---

## 7. Ordem oficial de execução

**A ordem oficial vive na [`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) §3** — roadmap integral da **Fase 0** à **Fase 22**, com objetivo, entregas centrais, critério de saída e riscos atribuídos por fase. **A fase atual é a 3 — reconciliação completa, somente leitura**; a **Fase 2.5 está encerrada desde 2026-08-04** (ver §1.1 e §1.1.1 acima).

> **Sequência antiga (Fases 0–8) — histórico, não ativa.** A lista de oito fases que este arquivo publicava (Fonte de Verdade → tour do mapa → peso/bundle → robustez de mídia → conteúdo → RevenueCat → loja → soft launch → escala) **não é mais a sequência de execução**. Ela foi absorvida e reordenada pelo roadmap da v5. Quando um texto antigo deste repositório citar "Fase 1", "Fase 2" etc. **sem** referenciar a v5, trate como numeração superada e reancore na v5.

---

## 8. Regras permanentes de execução

- **Um bloco por vez. Um commit por bloco.**
- **Sem push sem aprovação.**
- Antes de editar, **inspecionar os arquivos relevantes**.
- **Não mexer fora do escopo.** Sempre relatar os arquivos alterados.
- Rodar `npm run smoke` e `npx expo-doctor` quando aplicável.
- Quando for visual, **smoke não basta**: validar por print/vídeo. Para **mapa, tour, Livrinho, Ateliê e imagens**, exigir validação visual.
- **Não usar `git add .`** enquanto houver assets pesados/untracked não auditados.
- **Não instalar pacote novo** sem justificar e pedir aprovação.
- **Não adicionar backend próprio** sem nova decisão estratégica.
- **Não adicionar novas abas principais** antes do lançamento.
- **Não adicionar conteúdo pesado ao binário público** (ver §4).

---

## 9. Critério de saída da Fase 0 *(histórico — já atendido)*

> Registro do critério original de conclusão da Fase 0 de governança. **Já foi atendido.** Os
> critérios de saída de todas as fases ativas estão na
> [`v5`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) §3.

A Fase 0 só está concluída quando:

- `docs/PROJECT_SOURCE_OF_TRUTH.md` existe;
- as decisões centrais estão claras;
- documentos antigos conflitantes foram marcados como históricos ou referenciados em índice (`docs/DOCUMENTATION_INDEX.md`);
- o projeto tem uma ordem oficial de próximas fases;
- `smoke` e `expo-doctor` passam (se rodados);
- commit local foi criado;
- sem push.
