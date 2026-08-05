# Product Lock · Fase 4A — Plano Família, compra, restauração e entitlement

**Versão:** 2 — **CONSOLIDADO com as respostas do fundador (2026-08-05)**
**Data:** 2026-08-05
**Branch:** `docs/e015-phase3-artifacts` · **HEAD na abertura:** `dca7863296aed8c3658caaa773e7e6c606435f6c`
**Base executável congelada:** `015c438106538595b592981fbe1b80b1d5d65e55`
**Natureza:** documento **exclusivamente decisório**. Nenhum código, `eas.json`, produto de loja,
configuração de RevenueCat, build ou validação física foi tocado na produção deste artefato.

> **Estado deste documento: DECIDIDO.** A versão 1 era proposta; as **nove perguntas do §12 foram
> respondidas pelo fundador** e as decisões estão registradas no árbitro
> [`docs/DECISIONS.md`](../DECISIONS.md), seção **`PL4A`**. Este artefato **preserva a versão 1
> como histórico não apagado** — as recomendações técnicas continuam legíveis onde estavam, agora
> acompanhadas da decisão real.
>
> **Como ler.** As respostas do fundador aparecem em blocos **`RESPOSTA DO FUNDADOR`** dentro do
> §12; a consolidação, o veredito e as correções de rastreabilidade estão no **§14**, ao final.
>
> **O que NÃO mudou.** Nenhum risco foi marcado como corrigido. `P-55` e `P-56` permanecem riscos
> técnicos abertos. Nenhuma decisão declarada não reabrível foi reaberta.

---

## 1. Escopo da Fase 4A

### 1.1 O que esta fase decide

Transformar em **decisão explícita de produto** as pendências da matriz canônica
(`docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`, 139 códigos `P-01`..`P-139`)
ligadas a: plano pago, plano grátis, compra, assinatura, restauração, entitlement, expiração de
cache, funcionamento offline do acesso premium, produtos e ofertas, paywall, migração de
entitlement, contaminação do Modo Criador sobre validações reais, e falhas de rede ou
armazenamento que **alterem o acesso**.

### 1.2 O que esta fase explicitamente NÃO faz

| Não faz | Onde acontece |
|---|---|
| Escrever código | Fase 18 (e Fase 12A para os limites do Brincar) |
| Alterar `eas.json` ou qualquer perfil de build | Fase 18 |
| Configurar RevenueCat (dashboard, entitlements, offerings) | Preparação externa · Fase 18 |
| Criar produtos na App Store Connect / Google Play Console | Preparação externa · Fase 18 |
| Definir preços, moeda ou período de teste | **Decisão do fundador** — pendência controlada declarada em `docs/DECISIONS.md:70` |
| Gerar build, abrir Metro, validar fisicamente | Fases 18 · 20 · 21 |
| Alterar o status de qualquer código `P-…` | Somente após as respostas do fundador |

### 1.3 Critério de inclusão aplicado

Um código entrou na Fase 4A quando satisfez **pelo menos um** destes testes:

- **T1 — natureza canônica:** o campo *Natureza* da matriz contém `PLANO E ENTITLEMENT` (`PLA`).
- **T2 — contaminação de validação:** o Modo Criador pode **mascarar ou contaminar** a validação
  real do entitlement (eixo 10 do mandato, aplicado restritivamente).
- **T3 — inclusão obrigatória:** `P-24`, `P-93` e `P-129`, por determinação do mandato.

Códigos apenas técnicos, apenas documentais ou pertencentes a outros blocos do Product Lock
foram **excluídos com justificativa nominal** (§2.3). O teste T1 é verificável de forma
independente: reparse do artefato commitado retorna exatamente 12 códigos com natureza `PLA`.

---

## 2. Códigos abrangidos pela Fase 4A

### 2.1 Quadro-síntese (13 códigos)

| Cód | Título | Estado | Sev. hoje | Fase impl. | Trava lançamento | Depende do fundador |
|---|---|---|---|---|---|---|
| `P-24` | Plano Família sem caminho de compra | ABERTO | **CRÍTICA** | 18 | **BLOQUEIA** | **SIM** |
| `P-93` | `EXPO_PUBLIC_REVENUECAT_*` ausente de todos os perfis | ABERTO | **CRÍTICA** | 18 | **BLOQUEIA** | **SIM** |
| `P-129` | Entitlement offline com cache expirado nunca exercitado | EVIDÊNCIA FÍSICA FALTANTE | ALTA | 18 | Parcial | **SIM** |
| `P-56` | `catch` fail-open no consumo de rodada | ABERTO | **CRÍTICA** | 12A | **BLOQUEIA** | NÃO |
| `P-63` | Galeria mostra "N de 0" e divide por zero | ABERTO | **CRÍTICA** | 12A | **BLOQUEIA** | Parcial |
| `P-64` | Área dos Pais promete 3 artes salvas contra limite real 0 | DECISÃO PENDENTE | ALTA | 12A | Parcial | **SIM** |
| `P-65` | Criar Livre promete guardar criações a quem tem limite 0 | DECISÃO PENDENTE | ALTA | 12A | Parcial | **SIM** |
| `P-05` | Home sem filtro de acesso ou sequência | ABERTO | ALTA | 11 | Parcial | Parcial |
| `P-57` | Rodada fabricada na retomada | ABERTO | ALTA | 12A | Parcial | NÃO |
| `P-136` | 18 histórias premium fisicamente embarcadas no binário | DECISÃO PENDENTE | ALTA | 16 | Parcial | **SIM** |
| `P-66` | Mensagem comercial dentro de `accessibilityLabel` | ABERTO | MÉDIA | 12A | Não | Parcial |
| `P-59` | Chip de plano do Brincar corta em 100% dos estados | ABERTO | MÉDIA | 12A | Não | Parcial |
| `P-55` | Monte a Cena V2 grava conclusão real sob cena errada | INTERNO E INALCANÇÁVEL EM PRODUÇÃO | CRÍTICA latente | 12A | Não | NÃO |

Os 12 primeiros entram por **T1** (natureza `PLA`); `P-55` entra **apenas** por **T2**, com escopo
limitado ao trecho em que o Modo Criador torna inócua uma guarda de plano.

### 2.2 Ficha decisória por código (10 campos do mandato)

---

#### `P-24` — Plano Família sem caminho de compra

1. **Descrição factual.** `src/data/planConfig.js:40-55` declara `monthly` e `annual` com
   `status: 'comingSoon'`, `isPurchaseEnabled: false` e `productIdPlaceholder: ''` (vazio nos dois).
   Não existe tela de paywall, checkout, preço ou botão "Assinar" no aplicativo; não existe
   importação de `react-native-purchases-ui`. Dezoito de vinte histórias são do Plano Família.
   A única superfície com apresentação da oferta é a Área dos Pais
   (`src/screens/ParentAreaScreen.js:830-864`), declarada no próprio código como "informativa, sem
   botões acionáveis" (`:849`) e com selo "Disponível em uma próxima atualização" (`:860-862`).
2. **Estado atual.** ABERTO · CRÍTICO · **BLOQUEIA LANÇAMENTO** (critério 3 de lançamento).
3. **Decisão de produto necessária.** (a) modelo comercial já aprovado precisa ser reafirmado como
   travado para o v1; (b) onde vive o paywall e quem pode acioná-lo; (c) o que a criança pode ver;
   (d) presença obrigatória de "Restaurar compras" na mesma superfície; (e) o que muda visualmente
   no instante em que a compra é confirmada. **Preços, moeda e período de teste continuam
   pendência do fundador** e não são decididos aqui.
4. **Evidência disponível.** Leitura direta de `planConfig.js`, `ParentAreaScreen.js`,
   `contentAccessService.js`, `PremiumLockCard.js`; ausência comprovada de qualquer chamada de
   compra em `src/`.
5. **Evidência ainda ausente.** Nenhuma compra real, sandbox ou produção, jamais executada.
   Nenhum `productId` existente em nenhuma loja.
6. **Dependências.** `P-05`, `P-93`. É pré-requisito de `P-129`.
7. **Fase de implementação.** 18.
8. **Gate futuro de validação.** Compra real aprovada em iOS **e** Android, com evidência física
   (critério de saída da Fase 18, `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:411`).
9. **Relação com lançamento.** Bloqueador duro. Sem `P-24` não existe receita.
10. **Depende de resposta do fundador?** **SIM** — nos valores comerciais, nos identificadores de
    produto e no contrato de restauração.

---

#### `P-93` — `EXPO_PUBLIC_REVENUECAT_*` ausente de todos os perfis

1. **Descrição factual.** `src/services/entitlementSource.js:38-42` lê
   `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` (iOS) e `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` (demais
   plataformas). A cadeia `REVENUECAT` **não aparece uma única vez** em `eas.json`, nos cinco
   perfis, nem no `.env.example`. Verificação direta: `grep -c REVENUECAT eas.json` → **0**.
   A dependência `react-native-purchases` **está instalada** (`package.json:63`, `^10.4.1`).
2. **Estado atual.** ABERTO · CRÍTICO · **BLOQUEIA LANÇAMENTO**. Reclassificado de fase `3F` para
   fase **18** na consolidação da matriz.
3. **Decisão de produto necessária.** Quais perfis de build **devem** receber chave, quais devem
   **permanecer sem chave por decisão**, e a declaração de que ausência de chave é
   **comportamento correto e fail-closed**, nunca defeito a ser "consertado" com fallback.
4. **Evidência disponível.** O caminho de ausência já é fail-closed no código:
   `entitlementSource.js:55` `if (!apiKey) return false;` → SDK não configurado →
   `fetchEntitlement()` retorna `null` → plano efetivo `free`. Nenhum ramo concede premium por erro.
5. **Evidência ainda ausente.** Nenhum build jamais rodou **com** chave presente. O caminho
   "SDK configurado" nunca foi exercitado em aparelho.
6. **Dependências.** `P-24`.
7. **Fase de implementação.** 18.
8. **Gate futuro de validação.** Smoke provando ausência de chave nos perfis que devem ficar sem
   ela; evidência física de compra e restauração nos perfis que a recebem.
9. **Relação com lançamento.** Bloqueador duro — sem chave não há compra, assinatura nem restore.
10. **Depende de resposta do fundador?** **SIM** — na definição de quais perfis recebem chave e de
    qual conta/ambiente de sandbox será usada.

---

#### `P-129` — Entitlement offline com cache expirado nunca exercitado

1. **Descrição factual.** O caminho fail-closed crítico — assinatura válida, aparelho sem rede,
   cache local vencido — nunca foi executado fisicamente. Estado da evidência registrado na matriz:
   *"NÃO DETERMINADO NO CORPUS RECUPERADO"*.
2. **Estado atual.** EVIDÊNCIA FÍSICA FALTANTE · ALTA · `EXIGE DECISÃO NO PRODUCT LOCK`
   (reclassificado de `BLOQUEIA PRODUCT LOCK` por bloqueio circular: dependia de `P-24` e `P-93`,
   ambos com decisão na própria Fase 4).
3. **Decisão de produto necessária.** A política de acesso quando a validação expira sem rede
   (§9 deste documento: opções A, B, C) e a duração definitiva da janela offline.
4. **Evidência disponível.** A política **já está implementada e é legível**
   (`src/services/entitlementPolicy.js:65-97`), com ordem de decisão determinística e
   `OFFLINE_MAX_WINDOW_MS = 7 dias` (`:32`). Existe guarda anti-retrocesso de relógio
   (`entitlementService.js:86-91`, consumida em `entitlementPolicy.js:76-78`).
5. **Evidência ainda ausente.** Execução física do caminho; e cobertura automatizada do cenário
   "*snapshot* stale já carregado **+** fonte indisponível **através de** `refreshEntitlement`".
6. **Dependências.** `P-24`, `P-93`.
7. **Fase de implementação.** 18.
8. **Gate futuro de validação.** Harness local (§11.1) **mais** validação física com assinatura
   sandbox real (§11.2), sem alterar o relógio do aparelho pessoal do fundador.
9. **Relação com lançamento.** Parcial — o comportamento existe e é conservador; falta prová-lo.
10. **Depende de resposta do fundador?** **SIM** — a escolha entre A, B e C é decisão de produto.

---

#### `P-56` — `catch` fail-open no consumo de rodada

1. **Descrição factual.** `src/screens/MonteACenaTableGameScreen.js:456` inicializa
   `let r = { ok: true, remaining: Infinity, premium };` e `:467` faz
   `try { r = await consumeRound(); } catch { r = { ok: true, remaining: Infinity, premium: true }; }`.
   Uma falha de leitura de storage libera rodadas ilimitadas e marca `premium: true` localmente.
2. **Estado atual.** ABERTO · CRÍTICO · **BLOQUEIA LANÇAMENTO**.
3. **Decisão de produto necessária.** **Nenhuma decisão nova.** A decisão já existe e é declarada
   **não reabrível**: *"Entitlement é fail-closed"*
   (`09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md:987`, item 1). Este é **defeito de código contra decisão
   aprovada e descumprida** — entra na Fase 4A apenas para ficar registrado que o Lock **não** o
   reabre.
4. **Evidência disponível.** Leitura direta das duas linhas.
5. **Evidência ainda ausente.** Teste de regressão que force a falha de storage e prove bloqueio.
6. **Dependências.** `P-24` (só para o efeito comercial; o defeito independe).
7. **Fase de implementação.** 12A.
8. **Gate futuro de validação.** Regressão automatizada do fail-closed + validação física.
9. **Relação com lançamento.** Bloqueador duro.
10. **Depende de resposta do fundador?** **NÃO.**

> **Precisão registrada e mantida:** o `catch` **não** escreve em `@ptf_entitlement_v1`. A
> segunda metade da decisão não reabrível — *writer* único — permanece **íntegra**. A violação é
> de **fail-closed**, não de *writer* único.

---

#### `P-63` · `P-64` · `P-65` — o limite real de salvamento do plano grátis

Tratados em conjunto porque **a mesma decisão** os resolve.

1. **Descrição factual.**
   - `P-63`: `src/screens/AtelierGalleryScreen.js:113` imprime "N de **0** artes salvas" e `:116`
     calcula `Math.min(n / 0, 1)` — `NaN` quando `n = 0`, `Infinity` quando `n > 0`. O cabeçalho é
     incondicional, sem guarda de plano.
   - `P-64`: `src/screens/ParentAreaScreen.js:840` anuncia ao responsável "**3 artes salvas** no
     Ateliê" enquanto o limite real é **0** (`accessControl.js:33` e `atelierStorage.js:10`).
   - `P-65`: `src/screens/BrincarScreen.js:306` promete à criança "guarde suas criações" e
     `src/screens/AtelierCanvasScreen.js:273` faz `count >= 0` bloquear **todo** salvamento.
2. **Estado atual.** `P-63` ABERTO/CRÍTICO/**BLOQUEIA LANÇAMENTO**; `P-64` e `P-65` DECISÃO DE
   PRODUTO PENDENTE / ALTA.
3. **Decisão de produto necessária.** Confirmar o limite de salvamento do **Criar Livre** no plano
   grátis. **Há conflito documental de status a resolver** (§3.4): `docs/DECISIONS.md:691` declara
   `E1-ARTES-SALVAR` ("Grátis = zero salvamentos") **integralmente vigente**, enquanto a matriz
   canônica classifica `P-64`/`P-65` como *decisão pendente*. A leitura tecnicamente defensável é
   que a **decisão existe (zero)** e o pendente é apenas a **copy divergente** — mas nenhum
   documento afirma isso, e por isso a confirmação é solicitada.
4. **Evidência disponível.** Números verificados no código: `FREE_ATELIER_SAVE_LIMIT = 0`
   (`accessControl.js:33`), `ATELIER_FREE_SAVE_LIMIT = 0` (`atelierStorage.js:10`).
5. **Evidência ainda ausente.** Prova física do `NaN` na barra de progresso da galeria.
6. **Dependências.** `P-63` ↔ `P-64` ↔ `P-65`.
7. **Fase de implementação.** 12A.
8. **Gate futuro de validação.** Validação visual da galeria em conta grátis limpa; conferência de
   toda copy que cite quantidade de artes.
9. **Relação com lançamento.** `P-63` bloqueia por si só — o `NaN` é determinístico para 100% dos
   usuários do plano grátis e **independe** da decisão de limite. `P-64` e `P-65` são promessa
   falsa a responsáveis e a crianças.
10. **Depende de resposta do fundador?** **SIM** para o limite (`P-64`, `P-65`); **NÃO** para a
    guarda de divisão por zero (`P-63` deve ser corrigido em qualquer cenário).

---

#### `P-05` — Home sem filtro de acesso ou sequência

1. **Descrição factual.** Fechadas as duas histórias grátis, a Home recomenda `david_goliath`, que
   é do Plano Família. Dezoito de vinte histórias são premium.
2. **Estado atual.** ABERTO · ALTA.
3. **Decisão de produto necessária.** O que a Home oferece a quem está no plano grátis e já
   concluiu as duas histórias: recomendar conteúdo bloqueado (convite) ou apenas conteúdo
   acessível. Toca diretamente o item 16 do contrato (ausência de pressão comercial sobre a
   criança).
4. **Evidência disponível.** `contentManifest.js:21-49` — `STARTER_STORY_IDS = ['creation','noah']`
   e exatamente 18 entradas `'remote'`. Convite comercial já existe em superfícies infantis
   (`BrincarScreen.js:337`, `:349`; `AtelierCanvasScreen.js:727-734`; `QuizScreen.js:62-64`).
5. **Evidência ainda ausente.** Validação física em conta grátis com as duas histórias concluídas.
6. **Dependências.** `P-01`, `P-24`.
7. **Fase de implementação.** 11.
8. **Gate futuro de validação.** Validação visual da Home + tour, em conta grátis esgotada.
9. **Relação com lançamento.** Parcial.
10. **Depende de resposta do fundador?** **Parcial** — a regra "a criança pode receber convite ao
    conteúdo bloqueado?" é decisão de produto; a correção do filtro de sequência não é.

---

#### `P-57` — Rodada fabricada na retomada

1. **Descrição factual.** `MonteACenaTableGameScreen.js:451` monta
   `remaining: premium ? Infinity : 1` **sem ler storage**, e `:497` oferece "Montar novamente"
   com zero rodadas reais disponíveis.
2. **Estado atual.** ABERTO · ALTA.
3. **Decisão de produto necessária.** Nenhuma nova — a regra de rodadas já está aprovada
   (`docs/DECISIONS.md:61`: 2 rodadas/dia; Família ilimitado). É defeito de implementação contra
   decisão vigente.
4. **Evidência disponível.** `brincarDailyService.js:28` `BRINCAR_FREE_DAILY_ROUNDS = 2`;
   `:31` `UNLIMITED = Infinity`.
5. **Evidência ainda ausente.** Regressão do caminho de retomada.
6. **Dependências.** `P-56`.
7. **Fase de implementação.** 12A.
8. **Gate futuro de validação.** Física, com o limite do grátis esgotado.
9. **Relação com lançamento.** Parcial.
10. **Depende de resposta do fundador?** **NÃO.**

> **Divergência já reconhecida e não reaberta aqui:** a decisão diz "2 rodadas por dia **por
> criança**"; o código conta **por dispositivo/dia, compartilhado entre os jogos**
> (`docs/DECISIONS.md:61`). A migração dispositivo→criança está declarada como pendência do bloco
> de Acesso/RevenueCat e é **consequência** do contrato do Plano Família (item 8, §5).

---

#### `P-136` — 18 histórias premium fisicamente embarcadas no binário

1. **Descrição factual.** As 18 histórias declaradas `remote` em `contentManifest.js:28-49`
   continuam com `require()` estático de cenas, áudio e capa — **378 arquivos e 84.183.401 bytes
   (80,3 MB)** — e viajam íntegras no aparelho de quem não comprou.
2. **Estado atual.** DECISÃO DE PRODUTO PENDENTE · ALTA.
3. **Decisão de produto necessária.** Confirmar que o binário público **não** embarca conteúdo do
   Plano Família e em que fase a remoção ocorre. É a única pendência da Fase 4A em que mídia
   premium fica fisicamente disponível offline a quem não pagou.
4. **Evidência disponível.** Números auditados e registrados; `docs/DECISIONS.md:457`.
5. **Evidência ainda ausente.** Build sem os `require()` estáticos; medição do binário resultante.
6. **Dependências.** `P-130`, `P-135`, `P-26`.
7. **Fase de implementação.** 16.
8. **Gate futuro de validação.** Medição do binário + prova de que nenhuma cena premium é
   alcançável sem download.
9. **Relação com lançamento.** Parcial — o **acesso** já é bloqueado por entitlement
   (`accessControl.js:45-47`: *"Pack no disco NUNCA é autorização"*); o problema é **peso e
   exposição de mídia**, não autorização.
10. **Depende de resposta do fundador?** **SIM** — quanto ao momento da remoção e ao seu efeito
    sobre a data de lançamento.

---

#### `P-66` — Mensagem comercial dentro de `accessibilityLabel`

1. **Descrição factual.** `src/screens/BrincarScreen.js:324` coloca oferta comercial no rótulo de
   acessibilidade — ou seja, o leitor de tela **narra a oferta à criança**.
2. **Estado atual.** ABERTO · MÉDIA · não bloqueia lançamento.
3. **Decisão de produto necessária.** Aplicação direta do item 16 do contrato (§5): o que pode e o
   que não pode ser dito à criança, **inclusive por voz assistiva**.
4. **Evidência disponível.** Regra vigente: *"Nenhuma oferta comercial interrompe automaticamente a
   celebração infantil"* (`docs/DECISIONS.md:505`); *"Não inserir pressão comercial infantil"*
   (`:707`); critério de saída da Fase 18: *"nenhuma oferta comercial exibida à criança"* (`v5:412`).
5. **Evidência ainda ausente.** Auditoria completa de `accessibilityLabel` em superfícies infantis.
6. **Dependências.** —
7. **Fase de implementação.** 12A.
8. **Gate futuro de validação.** Leitura com VoiceOver/TalkBack ativo.
9. **Relação com lançamento.** Não bloqueia, mas é risco de conformidade infantil.
10. **Depende de resposta do fundador?** **Parcial** — depende de o contrato definir se "convite"
    é permitido à criança e em que forma.

---

#### `P-59` — Chip de plano do Brincar corta em 100% dos estados

1. **Descrição factual.** O rótulo do plano é truncado em todos os estados; evidência registrada
   como "COMPROVADO PELO CÓDIGO E FISICAMENTE".
2. **Estado atual.** ABERTO · MÉDIA · `NÃO BLOQUEIA` o Product Lock.
3. **Decisão de produto necessária.** Apenas **consequente**: depende do item 1 do contrato (nome
   público do plano e rótulo curto autorizado).
4. **Evidência disponível.** Física, já obtida. **Divergência de nomenclatura dentro do próprio
   `planConfig.js`:** `PREMIUM_PLAN.name = 'Premium'` (`:22`) contra `PLAN_LABELS.premium =
   'Plano Família'` (`:74`), sendo que o comentário de `:71` declara `PLAN_LABELS` como os
   **rótulos OFICIAIS**. Idem no grátis: `FREE_PLAN.name = 'Gratuito'` contra
   `PLAN_LABELS.free = 'Grátis'`.
5. **Evidência ainda ausente.** —
6. **Dependências.** —
7. **Fase de implementação.** 12A.
8. **Gate futuro de validação.** Validação visual em fonte grande (acessibilidade).
9. **Relação com lançamento.** Não bloqueia.
10. **Depende de resposta do fundador?** **Parcial** — só quanto ao nome público (§12, pergunta 4).

---

#### `P-55` — Monte a Cena V2 grava conclusão real sob cena errada *(entra apenas por T2)*

1. **Descrição factual.** `usePuzzleController.js:307-308` chama `saveCompletion` real e
   `MonteACenaGameV2Screen.js:40` cai em `MONTE_A_CENA_CATALOG[0]`, sempre `creation_scene_01`.
   **A guarda `isPremium` é inócua sob Modo Criador** e a rota não é navegada em produção.
2. **Estado atual.** INTERNO E INALCANÇÁVEL EM PRODUÇÃO · CRÍTICO **latente**.
3. **Decisão de produto necessária.** Somente a regra transversal: **o Modo Criador não pode ser
   aceito como evidência de comportamento premium**. Nenhuma decisão comercial.
4. **Evidência disponível.** `accessControl.js:72-76` — `isPremiumUser()` retorna `true` sob Modo
   Criador, mas `getCurrentPlan()` **continua `'free'`**; o Modo Criador é *override* lateral, fora
   do caminho do entitlement. Seu portão exige `EXPO_PUBLIC_BUILD_PROFILE === 'preview-criador'`
   (`featureFlags.js:85-88`), perfil que **não** declara chave de RevenueCat.
5. **Evidência ainda ausente.** —
6. **Dependências.** —
7. **Fase de implementação.** 12A.
8. **Gate futuro de validação.** Item 13 do harness (§11.2): **nenhuma** evidência de entitlement
   pode ser colhida com Modo Criador ativo.
9. **Relação com lançamento.** Não bloqueia — inalcançável em produção.
10. **Depende de resposta do fundador?** **NÃO.**

### 2.3 Códigos deliberadamente EXCLUÍDOS da Fase 4A (com justificativa)

| Cód | Título | Por que fica de fora |
|---|---|---|
| `P-52` | Política antiga de "não persistir" ainda afirmada | **Documental puro.** A decisão já foi tomada (Spec 019 / `D-C60-PERSISTENCIA-TODOS-PLANOS`); restam comentários desatualizados em quatro arquivos. Nenhuma decisão nova é necessária — é limpeza de texto. |
| `P-67` | Quatro textos "Ateliê" visíveis à criança | **Nomenclatura**, não plano. Pertence ao bloco de linguagem/UI. |
| `P-102` | Guia não para ao trocar de aba | **Técnico puro** (ciclo de vida de áudio). Nenhuma relação com acesso. |
| `P-126` | Sem caminho de migração de versão de schema | Refere-se aos **validadores de pack** (natureza `PAC`), não ao schema de entitlement. Pertence ao bloco de packs do Product Lock. ✅ Confirmado na §2.4: **não cobre** a lacuna de entitlement, que passou a ser **`P-140`**. |
| `P-135` | Peso agregado do binário por `require()` estático | Natureza `ASS+DEP`, sem `PLA`. É decisão do **bloco de assets/packs**, não de plano. `P-136`, que tem `PLA`, cobre a parte de conteúdo premium. |
| `P-46`, `P-71`, `P-114` | Falhas de escrita silenciosas, escrita não aguardada, chaves fora do `storageKeys.js` | **Técnicos de persistência**, sem efeito sobre autorização. Nenhum toca `@ptf_entitlement_v1`. |

### 2.4 Lacuna de inventário detectada nesta fase — **RESOLVIDA: `P-140` criado**

> **Correção determinada pelo fundador em 2026-08-05.** A versão 1 deixou a lacuna como
> **observação condicionada a aprovação**. O fundador determinou que a ausência de caminho de
> migração **não pode permanecer apenas como observação**, mandou refazer a busca por `P`
> equivalente e autorizou a criação de `P-140` caso nenhum código cobrisse o mesmo fato,
> superfície, consequência e correção necessária.

**Busca refeita**, agora sobre os **22 campos dos 139 códigos**, com os termos
`schema`, `versão`, `versao`, `migra`, `snapshot`, `entitlement`, `@ptf_`, `storageKeys` e
`grandfather`. Dezesseis códigos deram resultado; dois eram plausíveis e foram inspecionados campo
a campo:

| Candidato | Fato que enuncia | Superfície | Consequência | Cobre a lacuna? |
|---|---|---|---|---|
| `P-126` | "Ambos os validadores exigem versão 1, então um *bump* quebra todos os clientes instalados" | `manifesto` | *Download* de pack para de funcionar | ❌ **Não.** É o `schemaVersion` do **manifesto de pack** |
| `P-114` | "O módulo se declara fonte única de chaves e cerca de 20 chaves vivem fora dele" | `Storage` | Chaves dispersas | ❌ **Não.** É **localização** de chave, não versionamento |

**Nenhum código existente cobre.** → **`P-140` foi criado**, com o número imediatamente seguinte ao
maior código da matriz, **sem renumerar nenhum código anterior**, exclusivamente pelo gerador
determinístico. Título: **"Entitlement sem caminho de migração de schema"**. Status `ABERTO`,
classificação transversal **MÉDIO**, fase de decisão 4, fase de implementação 18, `INFORMA O
PRODUCT LOCK`, `NÃO BLOQUEIA LANÇAMENTO`. A política de produto está decidida
(`D-4A-MIGRACAO-ENTITLEMENT`); a **implementação e o teste permanecem pendentes**.

---

## 3. Decisões já aprovadas (auditoria dos documentos árbitros)

Fontes auditadas integralmente: `docs/DECISIONS.md` (863 linhas),
`docs/PROJECT_SOURCE_OF_TRUTH.md` (212), `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` (844),
`docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` (1195), mais `docs/launch/`.
Precedência aplicada conforme declarada nos próprios documentos: `DECISIONS.md` é o **árbitro das
decisões de produto**; a `v5` governa o **roadmap**; a matriz 09 governa o **inventário de
pendências**.

| # | Ponto | Classificação |
|---|---|---|
| 1 | Existência do Plano Família | **APROVADA** (existência e modelo) + **PARCIAL** (valores) + **CONFLITO** residual |
| 2 | Conteúdo no plano grátis | **APROVADA** |
| 3 | Conteúdo premium | **APROVADA** |
| 4 | Salvamento de arte por experiência | **APROVADA** (dois regimes) + **CONFLITO** de status |
| 5 | Histórias locais e remotas | **APROVADA** |
| 6 | Fail closed | **APROVADA — não reabrível** (violada em código) |
| 7 | Writer único de entitlement | **APROVADA — não reabrível** (íntegra) |
| 8 | Compra e restauração | **PARCIAL** + **AUSENTE** na mecânica do restore |
| 9 | Funcionamento offline | **PARCIAL** |
| 10 | Modo Criador | **APROVADA** |
| 11 | Produtos previstos | **PARCIAL** (modelo) + **AUSENTE** (identificadores, preços) |
| 12 | Plataformas de lançamento | **PARCIAL** (escopo) + **AUSENTE** (ordem) |

### 3.1 Existência do Plano Família — **DECISÃO APROVADA** / **PARCIAL** nos valores

- `docs/DECISIONS.md:58` — `E1-PLANO-FAMILIA` ✅: "Família libera: 20 histórias; download das 18
  premium; uso offline após download; jogos ilimitados; salvar artes; Minhas artes; avatares
  premium; benefícios futuros aprovados."
- `docs/DECISIONS.md:70` — `E1-MONETIZACAO-V1` ✅ modelo / 🟡 valores: "v1 = **mensal + anual**;
  **sem trimestral; sem vitalício**; **RevenueCat** como entitlement; paywall só atrás da Área dos
  Pais + gate parental; compra e restore obrigatórios antes da loja; **sem compra direcionada à
  criança**." E: "**Valores = pendência controlada** (não inventar)."
- `docs/DECISIONS.md:216` — `PL01A-15`: "Sem trimestral, vitalício ou avulso no lançamento. …
  **Preços permanecem pendentes.**"
- `docs/PROJECT_SOURCE_OF_TRUTH.md:121` — "Ofertas do v1: **mensal + anual**."

> **CONFLITO DOCUMENTAL (residual).** `docs/launch/MATRIZ_DE_ACESSO.md:34` ainda afirma:
> "**Planos comerciais**: mensal, **trimestral**, anual (sem vitalício nesta fase)" — contra
> `DECISIONS.md:70`. O conflito está formalmente resolvido pela tabela de decisões superadas
> (`DECISIONS.md:287`), mas o texto contraditório **permanece vivo e sem aviso** num documento de
> Fase 0. Correção documental proposta na pergunta 9 (§12).

### 3.2 Conteúdo no plano grátis — **DECISÃO APROVADA**

- `docs/DECISIONS.md:53` — `E1-STORIES-GRATIS` ✅: gratuitas = **A Criação** e **Noé**; locais,
  instantâneas, offline. Confirmado no código: `planConfig.js:83`
  `FREE_STORY_IDS = ['creation','noah']`.
- `docs/DECISIONS.md:57` — `E1-PLANO-FREE` ✅: as duas histórias completas (Livrinho, quiz, Momento
  com Beni), **2 rodadas/dia por criança**, **Criar Livre sem salvar**, sem avatares premium.
- `docs/DECISIONS.md:625` — no piloto do Colorir, a criança do plano grátis "**abre, pinta e
  conclui**, com celebração e conclusão normais"; `:502` — "a criança do **Grátis recebe a mesma
  celebração** que a criança do Plano Família".

### 3.3 Conteúdo premium — **DECISÃO APROVADA**

- `docs/DECISIONS.md:54` — `E1-STORIES-PREMIUM` ✅: as outras **18**; 2 grátis no binário; 18 por
  download; cache persistente; offline após download completo; manifesto versionado; validação de
  integridade; **sem backend tradicional no v1**.
- Além das histórias, são do plano pago (`:58`): jogos ilimitados, salvar artes do Criar Livre,
  "Minhas artes", avatares premium.
- `docs/DECISIONS.md:677-679` — após a Spec 019, "o Plano Família continua diferenciado
  principalmente pelo **acesso às histórias e experiências premium**, e **não** pela retenção das
  pinturas das histórias gratuitas".
- Correção metodológica já registrada na matriz (`:946`): a mídia premium **existe localmente**,
  mas o **acesso depende do entitlement** — não se pode dizer que "as 18 funcionam offline".

### 3.4 Salvamento de arte por experiência — **APROVADA**, com conflito de *status*

Dois regimes distintos, ambos vigentes:

| Experiência | Regra vigente | Fonte |
|---|---|---|
| **Colorir com o Beni** (coleção narrativa) | **Salva em todos os planos**, quando o usuário tem **acesso à história**. O critério passou a ser a **acessibilidade da história**, não o plano. | `DECISIONS.md:343`, `:661-665`, `:497-498` |
| **Criar Livre** (autoria) | **Continua sem salvar no grátis** — `ATELIER_FREE_SAVE_LIMIT` em **zero**. | `DECISIONS.md:344`, `:690-692` |

- `docs/DECISIONS.md:497-498` — "A autoridade de escrita **permanece** como o único ponto de
  decisão e **permanece fail closed**… **O mecanismo não é enfraquecido; o critério é substituído.**"
- Status físico: `docs/DECISIONS.md:767` — "✅ **IMPLEMENTADA E VALIDADA FISICAMENTE**".

> **CONFLITO DOCUMENTAL (aberto).** `DECISIONS.md:691` marca `E1-ARTES-SALVAR` ("Grátis = zero
> salvamentos") como **integralmente vigente**; a matriz canônica classifica `P-64` e `P-65` como
> **DECISÃO DE PRODUTO PENDENTE**. O árbitro trata como decidido; o inventário trata como pendente.
> Resolução proposta: pergunta 1 (§12).

### 3.5 Histórias locais e remotas — **DECISÃO APROVADA**

- `docs/PROJECT_SOURCE_OF_TRUTH.md:15` — "**arquitetura híbrida obrigatória** (2 histórias grátis
  locais no binário, 18 premium por packs remotos no Cloudflare R2)".
- `docs/DECISIONS.md:73` — `E1-REMOTO` ✅: bucket estático + manifesto versionado + validação
  sha256 + cache offline; sem backend tradicional.
- `docs/DECISIONS.md:563-566` — A Criação e Noé permanecem locais; as premium recebem as atividades
  **dentro do pack**; download seletivo fica para avaliação na Fase 17.
- Estado real divergente e reconhecido: premium **ainda embarcado** (`DECISIONS.md:457` → `P-136`).

### 3.6 Fail closed — **DECISÃO APROVADA E NÃO REABRÍVEL**

- `09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md:987`, seção "Decisões já aprovadas que não podem ser
  reabertas", item 1: "**Entitlement é fail-closed** e `saveEntitlement` é o único *writer* de
  `@ptf_entitlement_v1`."
- Item 2 da mesma seção: "**Pack no disco nunca é autorização**."
- `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:137-139` — "autoridade de **ESCRITA** única e
  fail closed… A **camada** e o **fail closed** não mudam; muda o **critério**."
- **Violação viva em código:** `P-56` (§2.2). Não é decisão pendente — é defeito.

### 3.7 Writer único — **DECISÃO APROVADA E ÍNTEGRA**

Reverificado por leitura direta: a chave `STORAGE_KEYS.ENTITLEMENT` (`storageKeys.js:85` →
`'@ptf_entitlement_v1'`) tem **exatamente um** `setItem`, em
`src/services/entitlementService.js:99-102` (`saveEntitlement`), chamado de um único ponto
(`:114`, dentro de `refreshEntitlement`) e apenas quando a sanitização devolveu objeto não-nulo.
Nenhuma tela, nenhuma ferramenta de QA grava essa chave. A leitura também é única (`:57`).

### 3.8 Compra e restauração — **APROVADA** na existência, **AUSENTE** na mecânica

- Aprovado: RevenueCat como entitlement; paywall **só** atrás da Área dos Pais **com gate
  parental**; **compra e restore obrigatórios antes da loja**; **sem compra direcionada à criança**
  (`DECISIONS.md:70`; `PSOT:122`; `docs/launch/MATRIZ_DE_ACESSO.md:33`).
- Critério de saída da Fase 18 (`v5:411-412`): "compra e restore reais aprovados em **ambos os
  sistemas operacionais**; nenhuma tela decidindo acesso sozinha; **nenhuma oferta comercial
  exibida à criança**."
- Gate parental confirmado em código: `ParentAreaScreen.js:633-636` bloqueia a tela inteira
  enquanto `unlockedForSession === false`.
- **AUSENTE:** nenhum documento define **onde** vive o botão "Restaurar compras", sua **copy**, nem
  o **comportamento em falha**. Em código existe apenas um **stub órfão**:
  `ParentAreaScreen.js:320` (`restoreState`) e `:507-510` (`handleRestorePurchase`, que apenas
  agenda `setRestoreState('unavailable')` após 1200 ms). **Verificação direta:** as duas únicas
  ocorrências no arquivo são a declaração e o próprio handler — **não há JSX que os monte**. É
  código morto. Nenhuma chamada a `Purchases.restorePurchases` existe em `src/`.

### 3.9 Funcionamento offline — **DECISÃO PARCIAL**

**Aprovado** (`docs/DECISIONS.md:568-575`, não revogado) — após a expiração da verificação offline:

1. **nenhum pack é apagado**; 2. **nenhuma arte é apagada**; 3. o **responsável recebe solicitação
de reconexão**; 4. a **criança não recebe culpa nem linguagem comercial**; 5. após confirmar o
entitlement, **o conteúdo volta sem novo download**; 6. a **duração definitiva é revisada na
Fase 18**.

**Ausente:** a **duração** como decisão de produto. Os 7 dias existem apenas como implementação
(`entitlementPolicy.js:32`, comentário "Clarify C1"), e a `v5:410` remete a "definição definitiva
da duração da verificação offline" à Fase 18.

### 3.10 Modo Criador — **DECISÃO APROVADA**

- `docs/DECISIONS.md:82` — `E1-CRIADOR` ✅: permanece no Dev Client; **invisível em produção**;
  **não é regra comercial**.
- `docs/DECISIONS.md:61` — "**Modo Criador não é regra real de produto.**"
- `docs/DECISIONS.md:626` — "**Modo Criador não falsifica entitlement.** … **não deve ser usado**
  para simular premium num build de release."
- Portão de saída (`v5:433-434`, Fase 19): "nenhuma ferramenta interna alcançável em produção".

### 3.11 Produtos previstos — **PARCIAL** + **AUSENTE**

- Modelo aprovado: mensal + anual, sem trimestral/vitalício/avulso.
- `docs/DECISIONS.md:70` — "**Valores = pendência controlada** (não inventar): mensal, anual, %
  desconto anual, período de teste." Tabela de pendências em `:306-309`.
- `docs/DECISIONS.md:317` — os preços do `DECISIONS.md` v3.1 (superado) **não** são tratados como
  congelados no v1.
- **AUSENTE:** identificadores de produto (SKUs). Nenhum documento os define; o código traz
  `productIdPlaceholder: ''` nas duas periodicidades.

### 3.12 Plataformas de lançamento — **PARCIAL** no escopo, **AUSENTE** na ordem

- Ambas exigidas: `v5:411` ("ambos os sistemas operacionais"), `v5:330-331` (evidência física em
  Android como critério da Fase 12A), `v5:454` (matriz de QA com tablet e Android fraco).
- **AUSENTE:** nenhuma frase normativa define ordem (iOS primeiro × Android primeiro × simultâneo).
- Classificação de loja (assunto distinto): `PSOT:111-113` — soft launch em **4+**, **fora da Kids
  Category**.

### 3.13 Conflito documental adicional detectado

`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:405` intitula a fase **"RevenueCat, Stripe e Plano
Família"**, replicado em `docs/DECISIONS.md:794`, `docs/C60_VALIDACAO_FISICA.md:1471` e na matriz
`:308`. **Nenhuma decisão aprova Stripe.** Ao contrário: `docs/DECISIONS.md:850` fecha a lista —
"**Nenhum SDK** além de **Sentry + RevenueCat + analytics anônimo** entra sem decisão nova" — e
`PSOT:124` exige "compra in-app das lojas" para conteúdo digital no app. Classificação:
**CONFLITO DOCUMENTAL de baixa gravidade**, provavelmente resíduo de título. Pergunta 9 (§12).

---

## 4. Decisões — pendentes na versão 1, **todas resolvidas na versão 2**

> **Estado.** As doze pendências abertas na versão 1 foram respondidas pelo fundador em
> 2026-08-05. A coluna **Decisão** aponta o registro nomeado em `docs/DECISIONS.md` §`PL4A`.
> **Decisão resolvida não significa risco corrigido:** a última coluna registra o que continua
> pendente de implementação ou de validação física.

| # | Pendência | Códigos afetados | Decisão registrada | Ainda pendente |
|---|---|---|---|---|
| D1 | Limite de salvamento do Criar Livre no plano grátis | `P-63`, `P-64`, `P-65` | `D-4A-CRIAR-LIVRE-SEM-SALVAR` — **zero**, e a decisão **não alcança** o Colorir com o Beni | Implementação: textos e `NaN` (Fase 12A) |
| D2 | Política de acesso com cache expirado sem rede | `P-129`, `P-24` | `D-4A-CACHE-EXPIRADO` — **opção A** | Validação física (Fase 18) |
| D3 | Duração definitiva da janela offline | `P-129` | `D-4A-JANELA-OFFLINE` — **7 dias, congelados** | Validação técnica na Fase 18, **sem reabrir a duração** |
| D4 | Nome público único do plano pago | `P-59`, `P-24` | `D-4A-NOME-PUBLICO` — **Plano Família** | Implementação: corte do chip (Fase 12A) |
| D5 | Quantidade de dispositivos / perfil familiar | **`P-24`** (principal) e **`P-140`** | `D-4A-DISPOSITIVOS-E-PERFIL` — sem limite próprio; segue a conta da loja; sem sincronização de progresso | Implementação (Fase 18); conta familiar é **pós-lançamento** |
| D6 | Periodicidades, desconto anual e período de teste | `P-24` | `D-4A-PRODUTOS-E-PERIODICIDADE` — mensal + anual, anual ≈ 25%, teste de 7 dias **só no anual** | **Preço nominal** = parâmetro comercial pré-implementação (Amanda) |
| D7 | Identificadores de produto e quem os cria | `P-24`, `P-93` | `D-4A-IDENTIFICADORES` — *entitlement* e *offering* `familia`, dois `productId` fixados | Criação nas lojas e no RevenueCat (Eduardo, Fase 18) |
| D8 | Superfície, copy e falha da restauração | `P-24`, `P-66` | `D-4A-RESTAURACAO-E-COMUNICACAO` — dois pontos de entrada, quatro textos aprovados | Implementação: `handleRestorePurchase` não montado; `accessibilityLabel` comercial |
| D9 | Plataformas: ordem e simultaneidade | `P-24`, `P-93` | `D-4A-PLATAFORMAS` — iOS e Android; **iOS depois Android**; **sem Stripe** | Implementação e validação nas duas lojas (Fases 18 e 21) |
| D10 | O que a Home oferece ao grátis esgotado | `P-05`, `P-66` | `D-4A-HOME-GRATIS-ESGOTADA` — nem vazia nem paywall; prévia carinhosa + orientação neutra | Implementação do filtro de acesso (Fase 11) |
| D11 | Remoção do premium do binário | `P-136` | `D-4A-PAYLOAD-PREMIUM` — produção só com as 2 gratuitas locais | Remoção dos `require()` com UX de baixar antes de ver (Fase 16) |
| D12 | Correção dos conflitos documentais | — | `D-4A-PRODUTOS-E-PERIODICIDADE` e `D-4A-PLATAFORMAS` | **Nada** — as correções já foram executadas |

> **Correção de rastreabilidade (determinada pelo fundador).** A versão 1 listava **`P-57`** entre
> os códigos afetados por D5. **Isso estava errado e foi removido.** `P-57` é a **rodada fabricada
> na retomada** do Monte a Cena; permanece no escopo de plano apenas pela relação **secundária**
> com o consumo de rodadas do plano grátis, e **não** tem relação com quantidade de dispositivos ou
> perfil familiar. A decisão de dispositivos vincula-se principalmente a **`P-24`** e, no que toca
> a estado local persistido por instalação, ao código específico **`P-140`**. A matriz canônica
> **nunca** registrou o vínculo indevido — seus campos *Dependências* e *Aliases* para `P-57`
> apontam somente para `P-56` e `P-58`. O defeito existia apenas neste artefato.

---

## 5. Contrato proposto do Plano Família

> **CONTRATO FECHADO (versão 2).** 🔒 = decisão **já aprovada antes da Fase 4A**, apenas
> reafirmada. ✅ = **decidido pelo fundador em 2026-08-05**, com registro nomeado em
> `docs/DECISIONS.md` §`PL4A`. **Nenhum item permanece marcado ❓.**
>
> **O preço nominal em reais não está neste contrato** — o fundador o classificou como **parâmetro
> comercial pré-implementação**, sob responsabilidade de Amanda, e **não** como razão para manter
> aberto o contrato técnico e de produto da Fase 4A. Nenhum preço foi inventado.

| # | Item | Proposta | Origem |
|---|---|---|---|
| 1 | **Nome público** | ✅ **"Plano Família"** é o **nome único** em toda a interface e em ambas as lojas. **Proibidos** "Premium", "Clube", "Assinatura Beni" e nomes de concorrentes na interface. Identificadores **técnicos internos** podem manter nomes próprios, mas **toda comunicação ao responsável diz Plano Família**. | ✅ `D-4A-NOME-PUBLICO`; 🔒 `PLAN_LABELS` já declarava o rótulo oficial |
| 2 | **Benefícios** | 🔒 20 histórias; download das 18 premium; uso offline após download completo; jogos sem limite de rodadas; salvamento no Criar Livre; "Minhas artes"; avatares premium; benefícios futuros aprovados. | `DECISIONS.md:58` |
| 3 | **Diferenças grátis × Família** | 🔒 Grátis: A Criação + Noé completas (Livrinho, quiz, Momento com Beni), 2 rodadas/dia, Criar Livre **sem salvar**, sem avatares premium. Família: tudo acima sem limite. | `DECISIONS.md:57`, `:58` |
| 4 | **Histórias por plano** | 🔒 Grátis = **2** (`creation`, `noah`, locais e instantâneas). Família = **20** (as 2 locais + 18 por pack). | `DECISIONS.md:53`, `:54`; `planConfig.js:83` |
| 5 | **Salvamento por experiência** | ✅ **Duas políticas distintas, que não se confundem.** **Criar Livre** no plano grátis: **zero salvamentos** — a criança pode desenhar, mas o app **não oferece persistência, galeria nem salvamento**. **Colorir com o Beni**: **salva e permite revisitar a obra real da criança** em **todas as histórias às quais ela tenha acesso, inclusive no plano grátis**. A decisão do Criar Livre **não amplia** nem alcança o Colorir narrativo. | ✅ `D-4A-CRIAR-LIVRE-SEM-SALVAR`; 🔒 `DECISIONS.md:343-344`, `:690-692` |
| 6 | **Jogos e limites** | 🔒 Grátis = **2 rodadas/dia**; Família = ilimitado; entrar na aba Brincar **não** consome; consumo no ponto oficial de início da atividade. ✅ A migração do contador de **dispositivo** para **criança** **fica para depois do lançamento**: a v1 não tem múltiplos perfis infantis sincronizados, e cada instalação mantém dados locais próprios. | 🔒 `DECISIONS.md:61`; ✅ `D-4A-DISPOSITIVOS-E-PERFIL` |
| 7 | **Conteúdo offline** | 🔒 Após download completo, a história premium funciona **sem rede**, respeitada a validade local do entitlement. 🔒 **Pack no disco nunca é autorização.** | `DECISIONS.md:54`; matriz `:988`; `accessControl.js:45-47` |
| 8 | **Dispositivos / perfil familiar** | ✅ **Sem limite próprio de dispositivos.** A restauração segue a **conta da App Store / Google Play** usada na compra. **Nenhuma promessa de sincronização de progresso.** Cada instalação tem **dados locais próprios** (perfil, progresso, pinturas, downloads). **Sem múltiplos perfis infantis sincronizados** na v1. Restaurar em outro aparelho **restaura o acesso, não os dados locais**. Conta familiar e sincronização são **posteriores ao lançamento**. | ✅ `D-4A-DISPOSITIVOS-E-PERFIL` (`P-24`, `P-140`) |
| 9 | **Quem perde a assinatura** | 🔒 O acesso premium cessa; nenhum dado é destruído. | `DECISIONS.md:568-575` |
| 10 | **Conteúdo já baixado** | 🔒 **Nenhum pack é apagado.** Fica no disco, inacessível até a revalidação; volta **sem novo download** quando o entitlement é confirmado. | `DECISIONS.md:568-575` (itens 1 e 5) |
| 11 | **Pinturas e progresso já criados** | 🔒 **Nenhuma arte é apagada**; artes antigas são preservadas; migrações preservam dados locais. As pinturas do Colorir das histórias **gratuitas** continuam salvando normalmente. | `DECISIONS.md:64`, `:568-575`, `:677-679` |
| 12 | **Falhas temporárias** | 🔒 Falha de rede, de SDK ou de storage **nunca concede** premium. Enquanto houver cache local válido, o acesso premium **não é interrompido** por indisponibilidade da fonte. | `entitlementService.js:110-117`; matriz `:987` |
| 13 | **Depois do cache expirado** | ✅ **OPÇÃO A.** Cache válido por **7 dias** contados da **última validação real bem-sucedida**; esgotado o prazo **sem rede**, o plano efetivo é **grátis** até a próxima validação real, **sem tolerância adicional**. **Nada é apagado**: o conteúdo premium baixado permanece no disco e **não concede autorização**. **Atividade já iniciada com entitlement válido não sofre interrupção destrutiva** — a restrição vale na **próxima entrada protegida ou retomada controlada**. Os 7 dias ficam **congelados**: a Fase 18 valida, **não redecide**. | ✅ `D-4A-CACHE-EXPIRADO`, `D-4A-JANELA-OFFLINE`; 🔒 `DECISIONS.md:568-575`; `entitlementPolicy.js:32` |
| 14 | **Restauração de compra** | ✅ "Restaurar compra" aparece na **Área dos Pais** *e* no **paywall exibido depois do gate parental**; **nunca** como oferta direta na superfície infantil. Textos aprovados ao responsável: sucesso — *"Plano Família restaurado neste aparelho."*; nenhuma compra — *"Não encontramos uma compra ativa nesta conta da loja."*; erro temporário — *"Não foi possível verificar sua compra agora. Confira a internet e tente novamente."*; assinatura expirada — *"Sua assinatura não está ativa no momento. Seus dados e criações continuam preservados."* | ✅ `D-4A-RESTAURACAO-E-COMUNICACAO`; 🔒 `DECISIONS.md:70` |
| 15 | **Transparência para responsáveis** | 🔒 Toda informação comercial vive na Área dos Pais, atrás do gate parental. Proposta: exibir o que o plano inclui, a periodicidade, o preço, a renovação automática e como cancelar, **antes** da compra. | `DECISIONS.md:70`; `docs/launch/MATRIZ_DE_ACESSO.md:33`; `ParentAreaScreen.js:633-636` |
| 16 | **Ausência de pressão comercial sobre a criança** | ✅ **Ambiguidade resolvida.** Na superfície infantil é **proibido**: preço, desconto, teste grátis, urgência, contagem regressiva e "Assine agora". É **permitido apenas** orientação neutra equivalente a *"Peça ajuda a um adulto para continuar"*. **Toda oferta ou explicação comercial fica depois do gate parental.** Isso alcança **também** o `accessibilityLabel` (`P-66`). | ✅ `D-4A-RESTAURACAO-E-COMUNICACAO`, `D-4A-HOME-GRATIS-ESGOTADA`; 🔒 `DECISIONS.md:505`, `:707` |

### 5.1 Observação obrigatória sobre o item 16

O aplicativo **hoje** exibe menção comercial em superfícies infantis — verificado em
`BrincarScreen.js:337` e `:349`, `AtelierCanvasScreen.js:727-734`, `QuizScreen.js:62-64`,
`StoryBookScreen.js:541-542`, `ParesDoBeniScreen.js:830`, `PalavrinhasDoBeniScreen.js:1082`. Em
todos os casos a **ação** leva à Área dos Pais (gateada) e não há preço nem botão de compra. Se o
critério de saída da Fase 18 ("nenhuma oferta comercial exibida à criança") for lido de forma
literal, essas seis superfícies precisam de revisão de copy. Se for lido como "nenhuma **compra**
direcionada à criança", elas já estão conformes. **Esta ambiguidade é real e precisa da decisão do
fundador** (pergunta 8, §12).

> **✅ AMBIGUIDADE RESOLVIDA (2026-08-05) — `D-4A-RESTAURACAO-E-COMUNICACAO`.** A leitura correta
> é a **intermediária, e ela é explícita**: na superfície infantil é **proibido** preço, desconto,
> teste grátis, urgência, contagem regressiva e "Assine agora"; é **permitido apenas** orientação
> neutra equivalente a *"Peça ajuda a um adulto para continuar"*; **toda** oferta ou explicação
> comercial fica **depois do gate parental**.
>
> **Consequência prática, e ela é trabalho pendente.** As seis superfícies acima **precisam ser
> reavaliadas contra esse critério** na fase proprietária de cada uma — em especial
> `BrincarScreen.js:324`, que hoje coloca **oferta comercial dentro de `accessibilityLabel`**
> (`P-66`), o que a decisão **proíbe**. **Nenhuma delas foi corrigida nesta fase.**

---

## 6. Matriz de estados do entitlement (15 estados × 8 atributos)

Legenda de origem: **[C]** comportamento comprovado no código hoje · **[D]** decisão já aprovada
antes da Fase 4A · **[4A]** **decidido pelo fundador em 2026-08-05** (registro em `DECISIONS.md`
§`PL4A`) · **[I]** **detalhe de implementação**, não decisão de produto pendente — a regra está
fechada e só o texto ou a forma exata pertencem à fase de implementação.

> **Nenhum atributo permanece marcado `[?]`.** Cada um dos quinze estados tem hoje ou uma decisão
> aprovada, ou uma decisão da Fase 4A, ou um comportamento comprovado em código, ou um detalhe de
> implementação explicitamente classificado como tal.

---

**Estado 1 — Nunca assinou**
- **Plano efetivo:** `free` **[C]** — `decideEntitlement` regra 1 (`loaded !== true` → `free/no_cache`) ou regra 10 (`free/inactive`).
- **Conteúdo acessível:** A Criação e Noé completas; Colorir dessas histórias com salvamento; 2 rodadas/dia; Criar Livre sem salvar. **[D]**
- **Interface:** selo "Plano Família" nas 18 bloqueadas; ação leva à Área dos Pais. **[C]**
- **Gate parental:** obrigatório para chegar à oferta. **[D]**
- **Persistência permitida:** progresso, pinturas do Colorir das grátis, estatísticas. **Não** salva no Criar Livre. **[D]**
- **Mensagem ao responsável:** convite informativo na Área dos Pais. **[D]**
- **Fail closed:** aplicável — default é `free`. **[D]**
- **Evidência futura:** conta limpa, sem rede e com rede.

**Estado 2 — Assinatura ativa e online**
- **Plano efetivo:** `premium` **[C]** — regra 6, exigindo `hasValidWindow` (expiração futura **E** validação ≤ 7 dias).
- **Conteúdo acessível:** tudo; download das 18. **[D]**
- **Interface:** sem selos de bloqueio; rodadas ilimitadas. **[C]**
- **Gate parental:** não para consumir; sim para gerir a assinatura. **[D]**
- **Persistência permitida:** total. **[D]**
- **Mensagem ao responsável:** status ativo e data de renovação, **na Área dos Pais, atrás do gate parental**. **[I]** o texto exato é implementação da Fase 18; a regra de produto está fechada (`D-4A-RESTAURACAO-E-COMUNICACAO`).
- **Fail closed:** não aplicável (caminho feliz).
- **Evidência futura:** compra sandbox real em iOS e Android.

**Estado 3 — Ativa e offline com cache válido**
- **Plano efetivo:** `premium` **[C]** — `refreshEntitlement` com fonte indisponível **mantém** o snapshot, não apaga, não rebaixa (`entitlementService.js:110-117`).
- **Conteúdo acessível:** tudo que já está no disco; **novos downloads impossíveis** por falta de rede (limitação física, não regra).
- **Interface:** idêntica ao estado 2, sem aviso. **[C]**
- **Gate parental:** inalterado.
- **Persistência permitida:** total; o salvamento deve funcionar offline. **[D]** `DECISIONS.md:666`
- **Mensagem ao responsável:** nenhuma. **[D]**
- **Fail closed:** aplicável mas **não disparado** — a janela ainda é válida.
- **Evidência futura:** modo avião com cache recente.

**Estado 4 — Ativa e offline com CACHE EXPIRADO** ⚠️ **decisão D2**
- **Plano efetivo:** hoje `free` **[C]**. Dois sub-caminhos distintos:
  - **4a — `expiresAt` no passado:** regra 4, `free/expired` — bloqueio **mesmo offline**.
  - **4b — validação há mais de 7 dias, `expiresAt` ainda futuro:** regra 5, `needs_revalidation`, mapeado a `free` (`entitlementService.js:42`).
- **Conteúdo acessível:** apenas o do plano grátis. **[4A]** **opção A confirmada**; a opção C foi **descartada** — o conteúdo premium baixado permanece no disco e **não concede autorização**.
- **Interface:** conteúdo premium volta a exibir bloqueio. **[4A]** **sem interrupção destrutiva**: uma atividade iniciada enquanto o entitlement ainda era válido não é cortada no meio; a restrição vale na **próxima entrada protegida ou retomada controlada**. Nenhuma pressão comercial à criança.
- **Gate parental:** obrigatório para a ação de reconexão. **[D]**
- **Persistência permitida:** **nada é apagado** — packs e artes preservados. **[D]** `DECISIONS.md:568-575`
- **Mensagem ao responsável:** solicitação de reconexão, sem culpa e sem linguagem comercial à criança. **[D]**
- **Fail closed:** **aplicável e disparado.** Núcleo de `P-129`.
- **Evidência futura:** o teste físico jamais executado — §11.2.

**Estado 5 — Assinatura expirada**
- **Plano efetivo:** `free` **[C]** — regra 4.
- **Conteúdo acessível:** só o grátis; packs permanecem no disco, inacessíveis. **[D]**
- **Interface:** bloqueio premium restabelecido. **[C]**
- **Gate parental:** obrigatório para renovar. **[D]**
- **Persistência permitida:** nada é apagado; conteúdo volta sem novo download ao renovar. **[D]**
- **Mensagem ao responsável:** **[4A]** texto aprovado — *"Sua assinatura não está ativa no momento. Seus dados e criações continuam preservados."*
- **Fail closed:** aplicável. **[D]**
- **Evidência futura:** expiração real em sandbox.

**Estado 6 — Cancelada, ainda dentro do período pago**
- **Plano efetivo:** `premium` até `expiresAt` **[C]** — regra 7, `rcCancelledButPaid`, também exigindo `hasValidWindow`.
- **Conteúdo acessível:** tudo, até a data. **[C]**
- **Interface:** idêntica ao estado 2. **[4A]** qualquer aviso de não renovação é **ao responsável, na Área dos Pais**; **nada** na superfície infantil. **[I]** a forma exata é implementação.
- **Gate parental:** inalterado.
- **Persistência permitida:** total.
- **Mensagem ao responsável:** informar a data final na Área dos Pais. **[I]** texto exato é implementação.
- **Fail closed:** aplicável na virada da data.
- **Evidência futura:** cancelamento em sandbox seguido de uso.

**Estado 7 — Falha temporária do RevenueCat**
- **Plano efetivo:** **inalterado** **[C]** — `fetchEntitlement` nunca lança (`catch → null`, `entitlementSource.js:102-104`) e `refreshEntitlement` preserva o snapshot.
- **Conteúdo acessível:** o mesmo de antes da falha.
- **Interface:** nenhuma mudança visível. **[C]**
- **Gate parental:** inalterado.
- **Persistência permitida:** inalterada.
- **Mensagem ao responsável:** nenhuma enquanto o cache for válido. **[D]**
- **Fail closed:** aplicável — falha **nunca** promove a premium.
- **Evidência futura:** simulação de indisponibilidade da fonte.

**Estado 8 — Sem chave de API configurada**
- **Plano efetivo:** `free` **[C]** — `entitlementSource.js:55` `if (!apiKey) return false;` → SDK não configurado → `fetchEntitlement()` → `null`.
- **Conteúdo acessível:** só o grátis. **[C]**
- **Interface:** app abre normalmente, sem erro visível. **[C]**
- **Gate parental:** inalterado.
- **Persistência permitida:** a do plano grátis.
- **Mensagem ao responsável:** nenhuma. Este é o estado **correto e intencional** dos perfis internos.
- **Fail closed:** **aplicável — é a própria definição.** Fallback premium é **proibido**.
- **Evidência futura:** smoke provando ausência de chave nos perfis que devem ficar sem ela (`P-93`).

**Estado 9 — Sem produto configurado na loja**
- **Plano efetivo:** `free` (ninguém consegue comprar). **[C]** `productIdPlaceholder: ''`, `isPurchaseEnabled: false`.
- **Conteúdo acessível:** só o grátis.
- **Interface:** hoje a Área dos Pais exibe "Disponível em uma próxima atualização" (`ParentAreaScreen.js:860-862`). **[C]**
- **Gate parental:** inalterado.
- **Persistência permitida:** a do grátis.
- **Mensagem ao responsável:** **[4A]** o app publicado **não pode** chegar a este estado. `P-24` permanece `BLOQUEIA LANÇAMENTO` e `D-4A-IDENTIFICADORES` atribui a Eduardo a criação dos produtos nas lojas antes do lançamento. Continua sendo **critério de bloqueio**.
- **Fail closed:** aplicável.
- **Evidência futura:** listagem de produtos retornando vazio deve degradar sem quebrar a tela.

**Estado 10 — Compra restaurada**
- **Plano efetivo:** `premium` após a restauração devolver entitlement ativo. **[4A]** decidido; **[C] não implementado** — nenhuma chamada a `Purchases.restorePurchases` existe em `src/`, e o handler da Área dos Pais é código morto (§3.8). **Decisão resolvida, implementação pendente na Fase 18.**
- **Conteúdo acessível:** tudo, após revalidação.
- **Interface:** **[4A]** "Restaurar compra" aparece na **Área dos Pais** *e* no **paywall exibido depois do gate parental**; **nunca** como oferta direta na superfície infantil.
- **Gate parental:** **obrigatório** — a ação vive na Área dos Pais. **[D]**
- **Persistência permitida:** total após confirmação; conteúdo volta **sem novo download**. **[D]**
- **Mensagem ao responsável:** **[4A]** textos aprovados — sucesso: *"Plano Família restaurado neste aparelho."*; nenhuma compra: *"Não encontramos uma compra ativa nesta conta da loja."*; erro temporário: *"Não foi possível verificar sua compra agora. Confira a internet e tente novamente."*
- **Fail closed:** falha na restauração **não** pode conceder premium.
- **Evidência futura:** restauração real em aparelho limpo, iOS e Android.

**Estado 11 — Reinstalação**
- **Plano efetivo:** `free` até restaurar **[C]** — `@ptf_entitlement_v1` some com o app; snapshot inicial é `{ loaded: false }` (`entitlementService.js:22`) → regra 1.
- **Conteúdo acessível:** só o grátis, até restaurar.
- **Interface:** estado de "nunca assinou", visualmente.
- **Gate parental:** obrigatório para restaurar.
- **Persistência permitida:** dados locais perdidos com a desinstalação (progresso e artes inclusos) — **fato**, não decisão.
- **Mensagem ao responsável:** **[4A]** o caminho de restauração é visível na **Área dos Pais** e no **paywall pós-gate parental**, disponível já na primeira visita.
- **Fail closed:** aplicável — reinstalação **nunca** herda premium.
- **Evidência futura:** desinstalar/reinstalar e restaurar.

**Estado 12 — Troca de aparelho**
- **Plano efetivo:** `free` no aparelho novo até restaurar. **[C]** (mesma mecânica do estado 11)
- **Conteúdo acessível:** só o grátis, até restaurar.
- **Interface:** igual ao estado 11.
- **Gate parental:** obrigatório.
- **Persistência permitida:** **o progresso e as artes NÃO migram** — não há backend nem sincronização no v1 (`DECISIONS.md:54`, `:73`). **Consequência de produto que precisa ser dita ao responsável.**
- **Mensagem ao responsável:** **[4A]** restaurar em outro aparelho **restaura o acesso, não os dados locais**; **nenhuma promessa de sincronização de progresso**. Isso precisa ser dito ao responsável **antes da compra** (`D-4A-DISPOSITIVOS-E-PERFIL`).
- **Fail closed:** aplicável.
- **Evidência futura:** compra num aparelho, restauração noutro.

**Estado 13 — Usuário migrado (schema de entitlement)**
- **Plano efetivo:** **indefinido — lacuna real** (§2.4). A chave é `@ptf_entitlement_v1`; **não existe caminho de migração** para uma futura `_v2`.
- **Conteúdo acessível:** dependeria da política de migração.
- **Interface:** —
- **Gate parental:** —
- **Persistência permitida:** —
- **Mensagem ao responsável:** —
- **Fail closed:** **proposta:** snapshot de versão desconhecida deve ser tratado como **ausente** → `free` + revalidação online. Isso é o comportamento natural do sanitizador atual (campos fora do contrato são descartados; snapshot inválido vira `{loaded:false}`), mas **não** está declarado como regra.
- **Evidência futura:** teste com snapshot de versão futura injetado.

**Estado 14 — Modo Criador ativo**
- **Plano efetivo:** `getCurrentPlan()` continua **`'free'`**; `isPremiumUser()` retorna `true` por *override* lateral (`accessControl.js:72-76`). **[C]**
- **Conteúdo acessível:** conteúdo premium, **localmente**, sem compra.
- **Interface:** como assinante.
- **Gate parental:** inalterado.
- **Persistência permitida:** escreve normalmente — **é exatamente por isso que contamina** (`P-55`).
- **Mensagem ao responsável:** nenhuma — **invisível em produção**. **[D]**
- **Fail closed:** **NÃO aplicável** — o Modo Criador está **fora** do caminho do entitlement.
- **Evidência futura:** **[D]** `DECISIONS.md:626` — nenhuma evidência de entitlement pode ser colhida com Modo Criador ativo. O portão exige `EXPO_PUBLIC_BUILD_PROFILE === 'preview-criador'`, perfil que não declara chave de RevenueCat.

**Estado 15 — Dados locais corrompidos**
- **Plano efetivo:** `free` **[C]** — `loadEntitlement` (`entitlementService.js:55-70`): storage vazio, JSON inválido, não-objeto, array ou exceção → `{ loaded: false }` → regra 1. Timestamp inválido → regra 2, `free/invalid_data`. Relógio retrocedido → regra 3, `needs_revalidation/clock_rollback`.
- **Conteúdo acessível:** só o grátis, até revalidar online.
- **Interface:** bloqueio premium.
- **Gate parental:** obrigatório para a ação de reconexão.
- **Persistência permitida:** **nada é apagado** — artes e packs preservados. **[D]**
- **Mensagem ao responsável:** mesma mensagem de reconexão do estado 4, sem tecnicidade. **[I]** texto exato é implementação. A **política** deste estado está decidida em `D-4A-MIGRACAO-ENTITLEMENT` e passa a ter código próprio: **`P-140`**.
- **Fail closed:** **aplicável e comprovado por leitura de código.**
- **Evidência futura:** injeção de snapshot corrompido no harness (§11.1, item 5).

---

## 7. Tratamento de `P-24` — as seis camadas

| Camada | Conteúdo | Resolve na 4A? |
|---|---|---|
| **1. Decisão comercial** | Periodicidades (mensal + anual, sem trimestral/vitalício/avulso — 🔒 já aprovado). **Preços, moeda, desconto anual e período de teste = pendência do fundador (D6).** | **SIM — parcialmente.** O modelo é reafirmado; os valores **não** são inventados. |
| **2. Decisão de produto** | Onde vive o paywall (Área dos Pais, atrás do gate parental — 🔒); o que a criança nunca vê; presença obrigatória de "Restaurar compras" (D8); o que muda no instante da confirmação; contrato do §5. | **SIM.** É o coração desta fase. |
| **3. Configuração das lojas** | Criar produtos na App Store Connect e no Google Play Console, acordos fiscais e bancários, teste fechado. | **NÃO.** Preparação externa, autorizada a começar em paralelo (`DECISIONS.md:853`), **sem tocar código**. |
| **4. Configuração do RevenueCat** | Projeto, apps, entitlement `premium`, *offerings*, produtos vinculados, chaves de API. | **NÃO.** Contrato futuro em §8. |
| **5. Implementação no app** | Paywall real, chamada de compra, `restorePurchases`, ligação com `entitlementSource`, correções de `P-56`, `P-57`, `P-63`, `P-64`, `P-65`. | **NÃO.** Fase 18 (e 12A para o Brincar/Ateliê). |
| **6. Validação física** | Compra e restauração reais em iOS e Android, sandbox, offline, reinstalação. | **NÃO.** Fases 18, 20 e 21. |

> **Registro obrigatório do mandato:** a ausência atual de caminho de compra **não** é autorização
> para implementar. `isPurchaseEnabled: false` e `productIdPlaceholder: ''` permanecem exatamente
> como estão até o portão da Fase 18.

---

## 8. Tratamento de `P-93` — contrato de configuração futura

> **Nenhuma chave foi inserida. Nenhum arquivo de configuração foi alterado. Somente NOMES de
> variáveis aparecem abaixo — nunca valores.**

1. **Plataformas.** iOS e Android. São as duas plataformas exigidas pelo critério de saída da
   Fase 18 (`v5:411`).
2. **Perfis que receberão chave.** `production`, obrigatoriamente. **Mais** um perfil de QA de
   compra, a criar na Fase 18, dedicado a sandbox — **[I]** o **nome** desse perfil é detalhe
   operacional da Fase 18, sob responsabilidade de Eduardo (`D-4A-IDENTIFICADORES`), e não uma
   decisão de produto pendente.
3. **Perfis que permanecerão SEM chave, por decisão.** `development`, `screenshot`, `c60-pilot` e
   `preview-criador`. Consequência declarada e desejada: esses perfis operam **permanentemente no
   plano Grátis** — já registrado em `PSOT:71`. Sobre `preview`: **[I]** manter sem chave, salvo
   se for eleito o perfil de sandbox — escolha operacional da Fase 18.
4. **Nomes das variáveis** (sem valores): `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` e
   `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`. São exatamente as lidas hoje em
   `entitlementSource.js:38-42`. **Nenhum outro nome de variável de RevenueCat deve ser
   introduzido** sem decisão nova.
5. **Tratamento obrigatório com chave ausente.** O comportamento atual é o **contrato**:
   `configureRevenueCat()` retorna `false`; o SDK **não** é configurado; `fetchEntitlement()`
   retorna `null`; `refreshEntitlement` **preserva** o snapshot existente e **não** grava; o plano
   efetivo é `free`; **o app abre normalmente, sem erro visível ao usuário**.
6. **Proibição de fallback premium.** **Nenhum** ramo de erro, ausência, *timeout* ou exceção pode
   produzir plano premium. Reafirma a decisão não reabrível de fail-closed (matriz `:987`).
   Qualquer *pull request* que introduza tal ramo deve ser rejeitado por princípio.
7. **Sandbox.** Apple Sandbox e Google License Testers, exercitados **apenas** no perfil de QA de
   compra, **nunca** em `production`. Contas de teste **jamais** aparecem em documentação
   versionada.
8. **Separação dev / preview / produção.** Chave de produção **exclusivamente** no perfil
   `production`. O perfil de QA de compra usa credenciais próprias. Nenhum perfil de
   desenvolvimento recebe chave.
9. **Evidências futuras de compra e restauração.** Para cada plataforma: (a) compra sandbox
   concluída; (b) entitlement refletido no app; (c) reinstalação seguida de restauração
   bem-sucedida; (d) expiração ou cancelamento refletidos; (e) captura de tela com **identificadores
   de aparelho mascarados**.
10. **Regras para logs.** É proibido registrar valores de chave, *tokens*, *receipts*, URLs
    assinadas ou identificadores de conta de loja. Logs podem citar **nomes** de variáveis,
    **estados** (`configurado` / `não configurado`) e **decisões** (`premium` / `free` /
    `needs_revalidation`), nunca conteúdo sensível.

---

## 9. Alternativas para `P-129` — cache expirado sem rede

### 9.0 Enquadramento factual obrigatório

O código **hoje** já implementa uma política determinística
(`src/services/entitlementPolicy.js:65-97`), e ela **não é neutra** entre as opções abaixo:

- Enquanto `expiresAt` for futuro, existe uma **tolerância de 7 dias** desde a última validação
  real (`OFFLINE_MAX_WINDOW_MS`, `:32`). Isto **já é** uma forma limitada da opção B.
- Passado o `expiresAt`, o bloqueio é **imediato, inclusive offline** (regra 4). Isto **é** a
  opção A.
- A opção C **não** está implementada e **conflita** com uma decisão declarada não reabrível
  (§9.4).

Portanto a decisão real do fundador é: **confirmar a política vigente como decisão de produto**,
**alterar a duração da janela**, ou **reabrir a regra de autorização** para adotar C.

### 9.1 As três opções

- **OPÇÃO A — fail closed imediato.** Vencida a validade local, o conteúdo premium bloqueia na hora,
  mesmo sem rede. Nada é apagado; o responsável recebe pedido de reconexão.
- **OPÇÃO B — período de tolerância limitado** após a última validação real. É o que os 7 dias já
  fazem para o caso `stale`; a decisão seria estender essa tolerância também **após** o `expiresAt`,
  e/ou alterar a duração.
- **OPÇÃO C — acesso somente ao conteúdo já baixado**, sem novos downloads e sem novas ações
  premium persistentes, por tempo indeterminado.

### 9.2 Avaliação nos 10 eixos

| Eixo | **A** — fail closed imediato | **B** — tolerância limitada | **C** — só o já baixado |
|---|---|---|---|
| **1. Segurança comercial** | **Máxima.** Assinatura curta nunca vira acesso longo. | **Boa**, proporcional à duração. Risco cresce com a janela. | **Baixa.** Quem baixou tudo mantém acesso indefinido em modo avião. |
| **2. Experiência infantil** | **Pior.** A criança pode perder acesso no meio de uma viagem sem rede. | **Melhor.** Absorve indisponibilidades curtas. | **Melhor** no curto prazo; ambígua no longo (a criança nunca entende por que às vezes funciona). |
| **3. Risco de retirada abrupta** | **Alto** — é o modo de falha característico. | **Médio** — a janela adia a retirada, não a elimina. | **Baixo.** |
| **4. Complexidade técnica** | **Nenhuma** — já implementado e legível. | **Baixa** — alterar uma constante e revalidar o harness. | **Alta.** Exige distinguir "ler o que já existe" de "novas ações premium", com nova superfície de regras. |
| **5. Possibilidade de abuso** | **Mínima.** A guarda anti-retrocesso de relógio já bloqueia o truque do relógio (`entitlementPolicy.js:76-78`). | **Limitada pela janela.** | **Alta.** Assinar um mês, baixar tudo e ficar offline dá acesso perpétuo à mídia. |
| **6. Necessidade de conectividade** | Exige rede a cada `expiresAt`. | Exige rede a cada `expiresAt` + tolerância. | Praticamente dispensa rede após o primeiro download. |
| **7. Clareza para responsáveis** | **Alta** — a regra é dizível em uma frase. | **Média** — exige explicar "até X dias". | **Baixa** — exige explicar quais ações continuam e quais param. |
| **8. Compatibilidade com fail closed** | **Total.** | **Total**, desde que a janela seja finita e ancorada em validação **real**. | ⚠️ **Conflitante.** Ver §9.4. |
| **9. Evidência necessária** | Harness dos 5 cenários + 1 teste físico. | O mesmo, **mais** um teste por duração escolhida. | O mesmo, **mais** prova de que nenhuma ação premium persistente escapa — superfície de teste bem maior. |
| **10. Impacto em `P-24` e `P-93`** | **Nenhum** — independente de preço e de chave. | **Nenhum** — a duração é parâmetro local. | **Alto** — muda o que o cliente comprou de fato e afeta a descrição da oferta nas lojas. |

### 9.3 Recomendação técnica

> **Recomendação:** **confirmar a OPÇÃO A como política de produto**, mantendo os **7 dias já
> vigentes** como parte da própria definição de "cache válido" (isto é, a forma limitada de B que
> já existe), e **reservar a revisão da duração para a Fase 18**, como a `v5:410` já prevê.
>
> Razões: (a) é o comportamento **já implementado**, legível e conservador — adotar A significa
> **zero risco de regressão**; (b) preserva integralmente a decisão não reabrível de fail-closed;
> (c) todas as garantias humanas já aprovadas continuam valendo (nada é apagado, o responsável é
> quem age, a criança não recebe culpa nem linguagem comercial); (d) não cria dependência de `P-24`
> nem de `P-93`.
>
> **Isto é uma recomendação, não uma decisão.** A escolha entre A, B e C é do fundador (D2), assim
> como a duração da janela (D3).

#### 9.3.1 DECISÃO DO FUNDADOR (2026-08-05) — **OPÇÃO A**, com a janela **congelada em 7 dias**

> **`P129_DECISAO_DE_PRODUTO_RESOLVIDA`.**
>
> 1. **Opção A adotada.** O cache de entitlement vale **7 dias** contados da **última validação
>    real bem-sucedida**. Esgotado o prazo **sem rede**, o plano efetivo é **grátis** até a próxima
>    validação real. **Não existe tolerância adicional depois da expiração.**
> 2. **Nada é apagado.** Progresso, pinturas, criações e **conteúdo premium já baixado** permanecem
>    no disco. **A existência física nunca concede autorização** — a decisão não reabrível da matriz
>    §19 foi **reafirmada**, não revista, e a **opção C foi descartada**.
> 3. **Sem interrupção destrutiva.** Uma atividade iniciada **enquanto o entitlement ainda era
>    válido** não é cortada no meio; a restrição vale na **próxima entrada protegida ou retomada
>    controlada**, conforme contrato futuro de implementação.
> 4. **Duração congelada.** A **Fase 18 valida tecnicamente** a regra e **não reabre a duração como
>    decisão de produto**.
>
> **O que isto NÃO encerra.** `P-129` continua `EXIGE VALIDAÇÃO FÍSICA` e `PODE BLOQUEAR
> LANÇAMENTO`: o caminho *fail-closed* offline com cache expirado **nunca foi executado em
> aparelho**, e a precondição continua sendo `P-24` e `P-93`. **Decisão resolvida ≠ risco
> corrigido.** Registro: `D-4A-CACHE-EXPIRADO` e `D-4A-JANELA-OFFLINE`.

### 9.4 Alerta formal sobre a OPÇÃO C

A opção C — "acesso ao conteúdo já baixado" — **entra em conflito direto** com uma decisão listada
como **não reabrível**:

> `09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md:988`, item 2: **"Pack no disco nunca é autorização"**
> (`accessControl.js:45-47`).

Adotar C exigiria **reabrir explicitamente** essa decisão. Este documento **não** o faz e **não**
recomenda que se faça. Se o fundador desejar C, isso deve ser registrado como **revogação
consciente**, com nova análise de risco de receita — não como ajuste de parâmetro.

---

## 10. Plano futuro de implementação (nada executado aqui)

| Ordem | Fase | Trabalho | Códigos |
|---|---|---|---|
| 1 | **Preparação externa** (paralela, sem código) | Contas Apple/Play, produtos, dashboard RevenueCat, teste fechado, acordos fiscais/bancários. Autorizada em `DECISIONS.md:853`. | `P-24`, `P-93` |
| 2 | **12A** | Corrigir o `catch` fail-open (`P-56`); corrigir a rodada fabricada (`P-57`); guarda de divisão por zero e cabeçalho condicional na galeria (`P-63`); alinhar a copy ao limite decidido (`P-64`, `P-65`); tirar a oferta do `accessibilityLabel` (`P-66`); corrigir o truncamento do chip (`P-59`). | 6 códigos |
| 3 | **11** | Filtro de acesso e sequência na Home (`P-05`), conforme a decisão D10. | `P-05` |
| 4 | **16** | Remover os `require()` estáticos das 18 premium; medir o binário (`P-136`). | `P-136` |
| 5 | **18** | Declarar as variáveis nos perfis decididos (`P-93`); paywall real, compra, `restorePurchases`, *offerings* (`P-24`); revisão da duração da janela offline (`P-129`). | `P-24`, `P-93`, `P-129` |
| 6 | **19 / 20 / 21** | Provar que nenhuma ferramenta interna é alcançável em produção (`P-55`); validação física completa; revalidação em Android e tablet. | `P-55` + todos |

**Sequenciamento obrigatório já registrado:** código de RevenueCat só depois do piloto
*user-facing* dos packs (`DECISIONS.md:853`).

---

## 11. Plano futuro de validação (especificação; nada implementado)

### 11.1 Validação **local da política** — harness automatizável (itens 1 a 7)

Testa `decideEntitlement` e `refreshEntitlement` **sem** SDK, **sem** rede e **sem** aparelho.
Todos com `now` **injetado** — nenhum toca o relógio de qualquer dispositivo.

1. **Cache válido.** `rcActive: true`, `expiresAt` futuro, `lastValidatedAt` recente → `premium`.
2. **Cache expirado.** Dois casos distintos e obrigatórios: (a) `expiresAt` no passado →
   `free/expired`; (b) `lastValidatedAt` há mais de 7 dias com `expiresAt` futuro →
   `needs_revalidation/stale_validation`. Incluir a fronteira **exata** de 7 dias, que ainda deve
   passar.
3. **Fonte indisponível.** `fetchEntitlement` retornando `null` **e** lançando: o snapshot anterior
   deve ser **preservado**, sem gravação e sem promoção. ⚠️ **Lacuna conhecida:** o smoke atual
   **não** cobre "snapshot *stale* já carregado **+** fonte indisponível **através de**
   `refreshEntitlement`" — este é o cenário mais próximo do `P-129` que pode ser automatizado.
4. **Ausência de cache.** `{ loaded: false }` → `free/no_cache`. Inclui o *default* de boot
   (`entitlementService.js:22`).
5. **Cache corrompido.** Storage vazio, JSON inválido, array, não-objeto, `now` inválido
   (`NaN`, negativo, zero, string) → sempre `free`, nunca exceção.
6. **Regressão do fail closed.** Bateria que percorre **todos** os ramos de erro e afirma que
   **nenhum** devolve `premium`. Deve incluir uma regressão específica para o `catch` de
   `MonteACenaTableGameScreen.js:467` (`P-56`) e para o retrocesso de relógio
   (`now < maxSeenDeviceTimestamp` → `needs_revalidation/clock_rollback`).
7. **Prova de *writer* único.** Verificação estática de que `@ptf_entitlement_v1` continua com
   **exatamente um** `setItem` em todo `src/`, falhando o gate se aparecer um segundo.

### 11.2 Validação **real do SDK** — física, no aparelho (itens 8 a 13)

Nenhum destes itens é substituível pelo harness. Todos exigem build com chave e produto reais.

8. **Assinatura sandbox real.** Compra concluída em Apple Sandbox e em Google License Testers, com
   o entitlement refletido no app.
9. **Restauração.** Após reinstalação em aparelho limpo, restaurar e recuperar o acesso.
10. **Offline.** Modo avião com cache válido (deve manter premium) e com cache vencido (deve
    bloquear, conforme a decisão D2).
11. **Após reinstalação.** Confirmar que o aparelho **não** herda premium antes de restaurar.
12. **Procedimento seguro quanto ao relógio.** ⚠️ **Nenhum avanço de relógio deve ocorrer no
    aparelho pessoal do fundador.** Ordem de preferência:
    - **(i)** Usar a **expiração natural** do sandbox — assinaturas de teste da Apple e do Google
      expiram em minutos, não em dias. É o caminho recomendado: exercita `expiresAt` real **sem
      tocar em relógio algum**.
    - **(ii)** Para a janela de 7 dias (`stale`), usar o **harness local** com `now` injetado
      (§11.1, item 2b) — a política é pura e não precisa de aparelho.
    - **(iii)** Se ainda assim for necessário avançar relógio, fazê-lo **exclusivamente** num
      **simulador/emulador** ou num **aparelho dedicado de teste**, nunca no aparelho pessoal.
    - **(iv)** É **proibido** alterar data e hora do iPhone pessoal do fundador em qualquer etapa.
13. **Aparelho ou simulador dedicado.** Todo teste de compra deve rodar em ambiente dedicado, com
    a conta de teste da loja, e **nunca** com Modo Criador ativo — evidência colhida sob Modo
    Criador é **inválida** por decisão (`DECISIONS.md:626`), porque `isPremiumUser()` retorna
    `true` por *override* lateral enquanto `getCurrentPlan()` continua `'free'`.

### 11.3 Critérios que devem BLOQUEAR o lançamento (item 14)

1. Qualquer ramo de erro que conceda premium (`P-56` aberto).
2. `@ptf_entitlement_v1` com mais de um *writer*.
3. Ausência de compra funcional em qualquer uma das duas plataformas (`P-24`).
4. Ausência de restauração funcional em qualquer uma das duas plataformas.
5. Variáveis de RevenueCat ausentes no perfil `production` (`P-93`).
6. Chave de RevenueCat presente em perfil que deveria ficar sem ela.
7. `NaN`/`Infinity` visível na galeria do plano grátis (`P-63`).
8. Qualquer texto que prometa ao responsável ou à criança um número de artes diferente do limite
   real (`P-64`, `P-65`).
9. Oferta comercial narrada à criança por leitor de tela (`P-66`), se a decisão D10 a proibir.
10. Qualquer ferramenta interna alcançável em produção (`P-55`, portão da Fase 19).
11. Comportamento de cache expirado divergente da política decidida em D2.

---

## 12. Perguntas ao fundador — **todas respondidas em 2026-08-05**

> Somente perguntas cuja resposta **não** existe nos documentos árbitros. Nenhuma reabre decisão
> aprovada. Nenhuma foi respondida por mim.
>
> **✅ RESPONDIDAS.** O fundador respondeu às nove perguntas em 2026-08-05. O texto de cada
> pergunta **permanece abaixo, sem alteração**, como histórico do que foi perguntado e com que
> base. As respostas estão registradas como **decisões nomeadas** no árbitro
> [`docs/DECISIONS.md`](../DECISIONS.md) §`PL4A` e resumidas na tabela abaixo. Onde a resposta
> corrigiu algo que eu havia escrito, a correção está marcada no próprio ponto.

| Pergunta | Resposta do fundador | Decisão nomeada |
|---|---|---|
| **1** — Limite de salvamento do Criar Livre | **Zero.** A criança pode desenhar; o app **não** oferece persistência, galeria nem salvamento. **Não se aplica ao Colorir com o Beni**, que salva e permite revisitar a obra real em todas as histórias acessíveis, **inclusive no plano grátis** | `D-4A-CRIAR-LIVRE-SEM-SALVAR` |
| **2** — Cache expirado sem rede | **Opção A.** Grátis até a próxima validação real, **sem tolerância adicional**. Nada apagado. Conteúdo baixado **não** autoriza. Atividade em curso **não** sofre corte destrutivo | `D-4A-CACHE-EXPIRADO` |
| **3** — Duração da janela offline | **7 dias, congelados agora.** A Fase 18 **valida**, mas **não reabre a duração** | `D-4A-JANELA-OFFLINE` |
| **4** — Nome público | **Plano Família**, único. Sem "Premium", "Clube", "Assinatura Beni" ou concorrentes na interface | `D-4A-NOME-PUBLICO` |
| **5** — Dispositivos e perfil familiar | Sem limite próprio; restauração pela conta da loja; **sem** promessa de sincronização; dados locais por instalação; conta familiar **pós-lançamento** | `D-4A-DISPOSITIVOS-E-PERFIL` |
| **6** — Produtos, periodicidade e teste | **Mensal + anual**, sem trimestral e sem vitalício; anual ≈ **25%** de economia; **teste de 7 dias só no anual**. **Preço nominal não congelado nesta fase** — é parâmetro comercial pré-implementação | `D-4A-PRODUTOS-E-PERIODICIDADE` |
| **7** — Identificadores e responsabilidades | *Entitlement* e *offering* `familia`; `…family.monthly` e `…family.annual`; Amanda valida comercial, Eduardo executa técnico. **Nada criado ou configurado nesta fase** | `D-4A-IDENTIFICADORES` |
| **8** — Restauração e comunicação | Dois pontos de entrada (Área dos Pais e paywall pós-gate); **quatro textos aprovados**; superfície infantil só com orientação neutra | `D-4A-RESTAURACAO-E-COMUNICACAO` |
| **9** — Plataformas e conflitos documentais | iOS e Android; **iOS depois Android**, mesmo contrato; **Stripe fora do lançamento**; correção de "trimestral" e "Stripe" **autorizada e executada** | `D-4A-PLATAFORMAS` |

> **Duas correções de rastreabilidade determinadas pelo fundador, além das nove respostas:**
> **(1)** desvincular `P-57` da decisão de dispositivos — ver §4 e Pergunta 5;
> **(2)** não deixar a lacuna de migração como observação — ver §2.4, que resultou em **`P-140`**.

> **Decisões que o fundador tomou além das nove perguntas** (itens 10, 11 e 12 da resposta):
> a **Home do plano grátis esgotado** (`D-4A-HOME-GRATIS-ESGOTADA`), o **payload premium no
> binário** (`D-4A-PAYLOAD-PREMIUM`) e a **migração de entitlement** (`D-4A-MIGRACAO-ENTITLEMENT`).

---

### Pergunta 1 — Limite de salvamento do Criar Livre no plano grátis
- **Contexto.** `docs/DECISIONS.md:691` declara `E1-ARTES-SALVAR` ("Grátis = zero salvamentos")
  **integralmente vigente**; a matriz canônica classifica `P-64` e `P-65` como decisão pendente. O
  código aplica **zero** (`accessControl.js:33`, `atelierStorage.js:10`), mas a Área dos Pais
  promete **3 artes** (`ParentAreaScreen.js:840`) e o Brincar promete à criança "guarde suas
  criações" (`BrincarScreen.js:306`).
- **Alternativas.** (a) **Confirmar zero** e corrigir toda a copy; (b) **adotar um limite pequeno
  maior que zero** (ex.: 3) e corrigir o código; (c) liberar salvamento também no grátis.
- **Recomendação técnica.** **(a)** — é a decisão já registrada como vigente, é o comportamento do
  código e exige apenas correção de texto, sem tocar em storage.
- **Consequências.** (a) menor risco, mas mantém a promessa quebrada até a correção de copy;
  (b) altera limite e exige revalidar galeria, contadores e migração de dados existentes;
  (c) enfraquece a diferenciação do plano pago no Criar Livre.
- **Códigos afetados.** `P-63`, `P-64`, `P-65`.

### Pergunta 2 — Política de acesso com cache expirado e sem rede
- **Contexto.** É o núcleo de `P-129`. O código já implementa bloqueio duro após `expiresAt` e
  tolerância de 7 dias após a última validação real.
- **Alternativas.** **A** fail closed imediato · **B** tolerância limitada estendida · **C** acesso
  ao já baixado.
- **Recomendação técnica.** **A**, com os 7 dias vigentes como parte da definição de "cache
  válido" (§9.3). **C não é recomendada** — conflita com a decisão não reabrível "pack no disco
  nunca é autorização" (§9.4).
- **Consequências.** A: nenhuma mudança de código, segurança máxima, risco de retirada abrupta
  numa viagem sem rede. B: adia a retirada, exige revalidar a nova duração. C: exige revogação
  consciente de decisão não reabrível e amplia muito a superfície de teste.
- **Códigos afetados.** `P-129`, `P-24`.

### Pergunta 3 — Duração definitiva da janela offline
- **Contexto.** Os 7 dias existem só como implementação; a `v5:410` remete a definição definitiva
  à Fase 18.
- **Alternativas.** (a) travar 7 dias agora como decisão de produto; (b) manter como parâmetro a
  revisar na Fase 18; (c) definir outro valor agora.
- **Recomendação técnica.** **(b)** — a Fase 18 terá dados reais de sandbox e do comportamento do
  RevenueCat; travar antes é decidir sem evidência.
- **Consequências.** (a) fecha a pendência mas engessa; (b) mantém `P-129` como gate futuro,
  já é o previsto; (c) exige justificar o número novo.
- **Códigos afetados.** `P-129`.

### Pergunta 4 — Nome público único do plano pago
- **Contexto.** `planConfig.js:74` declara `PLAN_LABELS` como os **rótulos oficiais**
  ("Plano Família" / "Grátis"), mas o mesmo arquivo traz `PREMIUM_PLAN.name = 'Premium'` (`:22`) e
  `FREE_PLAN.name = 'Gratuito'` (`:7`). O chip do Brincar trunca em 100% dos estados (`P-59`).
- **Alternativas.** (a) "Plano Família" e "Grátis" como nomes únicos, eliminando "Premium" e
  "Gratuito" da interface; (b) manter os dois pares, cada um em seu contexto.
- **Recomendação técnica.** **(a)** — nome único é o que sustenta a correção do `P-59` e evita
  divergência entre app e lojas.
- **Consequências.** (a) exige varredura de copy; (b) mantém ambiguidade e reaparece nas fichas
  das lojas.
- **Códigos afetados.** `P-59`, `P-24`.

### Pergunta 5 — Dispositivos e perfil familiar
- **Contexto.** **Lacuna real** — nenhum documento define quantos aparelhos o Plano Família cobre
  nem se haverá perfis por criança. Relacionado: a decisão diz "2 rodadas **por criança**" mas o
  código conta **por dispositivo** (`DECISIONS.md:61`).
- **Alternativas.** (a) entitlement segue a conta da loja, com compartilhamento familiar nativo,
  sem contador próprio no v1, e o contador de rodadas permanece por dispositivo até haver perfis;
  (b) implementar perfis por criança já no v1; (c) limitar explicitamente o número de aparelhos.
- **Recomendação técnica.** **(a)** — (b) é escopo grande e toca serviço compartilhado por todos os
  jogos; (c) não é suportado sem backend, que o v1 não tem.
- **Consequências.** (a) a descrição na loja precisa dizer isso com honestidade; (b) atrasa o
  lançamento; (c) inviável sem backend.
- **Códigos afetados.** **`P-24`** (principal) e **`P-140`** (estado local persistido por
  instalação). ⚠️ **A versão 1 listava `P-57` aqui, indevidamente. Removido por determinação do
  fundador** — `P-57` é a rodada fabricada na retomada do Monte a Cena e não trata de dispositivos
  nem de perfil familiar. Ver §4.

### Pergunta 6 — Valores comerciais e período de teste
- **Contexto.** Declarados como **pendência controlada** em `DECISIONS.md:70` e `:306-309`; os
  preços de um documento superado (v3.1) **não** são tratados como congelados (`:317`).
- **Alternativas.** (a) travar agora mensal, anual, % de desconto anual e período de teste;
  (b) manter pendente até a preparação externa nas lojas.
- **Recomendação técnica.** **(b)** para o valor exato, **(a)** apenas para a **existência ou não
  de período de teste** — essa é uma decisão de produto que muda a copy e o fluxo, não um número.
- **Consequências.** Sem período de teste definido, o paywall não pode ser escrito por inteiro na
  Fase 18.
- **Códigos afetados.** `P-24`.

### Pergunta 7 — Identificadores de produto (SKUs)
- **Contexto.** `productIdPlaceholder: ''` nas duas periodicidades; nenhum documento define SKUs.
- **Alternativas.** (a) o fundador define e cria os produtos nas lojas antes da Fase 18;
  (b) delegar a proposta de nomenclatura e submeter à aprovação.
- **Recomendação técnica.** **(b)** para a **nomenclatura**, **(a)** para a **criação** — criar
  produto em loja é ato do titular da conta.
- **Consequências.** Sem SKUs não há *offering* no RevenueCat e a Fase 18 não pode começar.
- **Códigos afetados.** `P-24`, `P-93`.

### Pergunta 8 — Restauração e limite da comunicação comercial à criança
- **Contexto.** Duas lacunas na mesma superfície. (i) Nenhum documento define onde vive
  "Restaurar compras", sua copy ou o comportamento em falha; em código há apenas um **stub morto**
  (`ParentAreaScreen.js:320`, `:507-510`, não montado em JSX). (ii) O critério de saída da Fase 18
  diz "nenhuma **oferta comercial** exibida à criança" (`v5:412`), mas seis superfícies infantis
  hoje mencionam o Plano Família (§5.1) — inclusive dentro de um `accessibilityLabel` (`P-66`).
- **Alternativas.** Para (ii): (a) o **convite** sem preço nem botão de compra é permitido à
  criança, e apenas preço/compra são proibidos; (b) nenhuma menção comercial à criança — todas as
  seis superfícies passam a dizer apenas "peça a um responsável", sem nomear o plano.
- **Recomendação técnica.** Para (i): botão na Área dos Pais, atrás do gate parental, ao lado da
  oferta; falha **não** altera o plano e exibe mensagem neutra ao responsável. Para (ii): **(a)**,
  com a ressalva de **remover a oferta do `accessibilityLabel`** em qualquer cenário — narrar
  oferta à criança por leitor de tela é indefensável.
- **Consequências.** (a) mantém a copy atual com ajuste pontual; (b) exige reescrever seis
  superfícies e reduz a descoberta do plano pelos responsáveis.
- **Códigos afetados.** `P-24`, `P-66`, `P-05`.

### Pergunta 9 — Plataformas de lançamento e correção de dois conflitos documentais
- **Contexto.** (i) Nenhuma frase normativa define ordem de lançamento; ambas as plataformas são
  exigidas no critério de saída da Fase 18. (ii) `docs/launch/MATRIZ_DE_ACESSO.md:34` ainda afirma
  "mensal, **trimestral**, anual", contra `DECISIONS.md:70`. (iii) `v5:405` intitula a fase
  "RevenueCat, **Stripe** e Plano Família" sem nenhuma decisão que aprove Stripe — e
  `DECISIONS.md:850` fecha a lista de SDKs.
- **Alternativas.** Ordem: (a) simultâneo; (b) iOS primeiro; (c) Android primeiro (soft launch).
  Conflitos: (d) autorizar correção documental agora; (e) adiar.
- **Recomendação técnica.** Ordem: **(c)** soft launch em Android é o padrão de menor risco, mas
  esta é decisão de negócio, não técnica. Conflitos: **(d)** — são duas linhas, corrigíveis em
  bloco documental controlado, sem tocar comportamento.
- **Consequências.** Deixar "Stripe" no título sugere pagamento web não aprovado; deixar
  "trimestral" vivo pode gerar produto errado na loja.
- **Códigos afetados.** `P-24`, `P-93`; conflitos documentais sem código próprio.

---

## 13. Critérios de saída da Fase 4A — **verificados na versão 2**

A Fase 4A **só pode ser encerrada** quando **todos** os itens abaixo forem verdadeiros. **A
verificação item a item está na §13.1**, ao final desta lista.

1. As nove perguntas do §12 estiverem respondidas pelo fundador, por escrito.
2. As respostas estiverem registradas em `docs/DECISIONS.md` como decisões nomeadas, com data,
   e referenciadas de volta neste artefato.
3. O contrato do Plano Família (§5) não tiver nenhum item marcado ❓.
4. A matriz de estados (§6) não tiver nenhum atributo marcado **[?]**.
5. A política de `P-129` estiver escolhida explicitamente entre A, B e C, com a duração da janela
   decidida ou formalmente remetida à Fase 18.
6. Os dois conflitos documentais (§3.1 "trimestral" e §3.13 "Stripe") estiverem corrigidos ou
   tiverem correção autorizada.
7. O conflito de *status* de `P-64`/`P-65` (§3.4) estiver resolvido — decisão vigente **ou**
   decisão nova, sem ambiguidade entre árbitro e inventário.
8. Os status dos códigos do §2.1 forem atualizados na matriz canônica **somente então**, com o
   gerador determinístico e reprodução byte a byte verificada.
9. Nenhuma decisão declarada não reabrível (matriz §19) tiver sido reaberta sem revogação
   consciente e registrada.
10. Nenhum arquivo executável tiver sido alterado — o diff contra
    `015c438106538595b592981fbe1b80b1d5d65e55` deve permanecer **vazio** em `src`, `scripts`,
    `assets`, `app.json`, `app.config.js`, `eas.json`, `package.json`, `package-lock.json`,
    `babel.config.js`, `metro.config.js`, `index.js` e `.env.example`.

### 13.1 Verificação item a item (2026-08-05)

| # | Critério | Estado | Prova |
|---|---|---|---|
| 1 | Nove perguntas respondidas por escrito | ✅ | §12, tabela de respostas |
| 2 | Respostas registradas em `DECISIONS.md` como decisões nomeadas, com data, e referenciadas de volta | ✅ | `DECISIONS.md` §`PL4A` — doze decisões `D-4A-*`, data 2026-08-05, referenciadas em §4, §5, §9.3.1 e §12 |
| 3 | Contrato do §5 sem nenhum item ❓ | ✅ | Zero ocorrências de ❓ no §5; itens 1, 5, 6, 8, 13, 14 e 16 passaram a ✅ |
| 4 | Matriz de estados do §6 sem nenhum atributo **[?]** | ✅ | Zero marcadores no §6; legenda passou a `[C]` · `[D]` · `[4A]` · `[I]` |
| 5 | `P-129` com política escolhida entre A/B/C e duração decidida ou remetida | ✅ | §9.3.1 — **opção A**, duração **congelada em 7 dias** (não apenas remetida) |
| 6 | Conflitos documentais "trimestral" e "Stripe" corrigidos ou com correção autorizada | ✅ | **Texto corrigido** nos normativos vigentes: `MATRIZ_DE_ACESSO.md`, `v5` §Fase 18, `DECISIONS.md` e o quadro de fases da matriz canônica. **Anotado, não reescrito**, no histórico `PLANO_OFICIAL_BENI_LANCAMENTO.md` (duas notas de superação). **Intocado** em `C60_VALIDACAO_FISICA.md` — é registro de validação física, ver §14.6 |
| 7 | Conflito de *status* de `P-64`/`P-65` resolvido sem ambiguidade | ✅ | `D-4A-CRIAR-LIVRE-SEM-SALVAR` confirma o zero e **preserva a distinção** do Colorir; na matriz os dois saíram de `DECISÃO DE PRODUTO PENDENTE` para `ABERTO` — **não** para `CORRIGIDO` |
| 8 | Status atualizados na matriz **somente então**, pelo gerador determinístico, com reprodução byte a byte | ✅ | Matriz regerada por `build.py`; reprodução independente por `build_repro.py` + `diff -q` — **idênticas** (1286 linhas, 184.535 caracteres) |
| 9 | Nenhuma decisão não reabrível revista sem revogação consciente | ✅ | §19 da matriz **íntegra**; *fail-closed* + *writer* único e "pack no disco nunca é autorização" foram **reafirmados** (§9.3.1, item 2) |
| 10 | Diff executável vazio contra `015c438106538595b592981fbe1b80b1d5d65e55` | ✅ | Verificado antes do commit — ver relatório final da fase |

---

## 14. Consolidação da Fase 4A — vereditos, correções e o que continua aberto

### 14.1 Vereditos

| Veredito | Resultado |
|---|---|
| Encerramento da fase | **`FASE_4A_ENCERRADA`** |
| Contrato do Plano Família | **`CONTRATO_PLANO_FAMILIA_APROVADO`** |
| Contrato de entitlement | **`CONTRATO_ENTITLEMENT_APROVADO`** |
| Política de `P-129` | **`P129_DECISAO_DE_PRODUTO_RESOLVIDA`** |
| Migração de entitlement | **`P140_CRIADO`** |

O preço nominal em reais **não** impede o encerramento: o fundador o classificou expressamente
como **parâmetro comercial pré-implementação**, e **não** como razão para manter aberto o contrato
técnico e de produto da Fase 4A.

### 14.2 As duas correções de rastreabilidade

**Correção 1 — `P-57`.** A versão 1 associava `P-57` à decisão sobre quantidade de dispositivos e
perfil familiar, em três pontos: a tabela do §4 (linha D5), a ficha do §2.2 e a Pergunta 5 do §12.
**A associação era indevida e foi removida.** `P-57` é a **rodada fabricada na retomada** do Monte
a Cena e permanece no escopo de plano apenas pela relação **secundária** com o consumo de rodadas
do plano grátis. A decisão de dispositivos vincula-se principalmente a **`P-24`** e, no que toca a
estado local persistido por instalação, ao código específico **`P-140`**. **A matriz canônica nunca
carregou o vínculo indevido** — os campos *Dependências* e *Aliases* de `P-57` apontam apenas para
`P-56` e `P-58`, e nenhum campo de `P-57` foi alterado nesta fase.

**Correção 2 — migração de entitlement.** A versão 1 deixou a lacuna como observação condicionada.
Busca refeita nos 22 campos dos 139 códigos; `P-126` e `P-114` inspecionados e descartados com
justificativa (§2.4). **`P-140` criado**, sem renumerar nada.

### 14.3 O que mudou na matriz canônica

Onze códigos tocados — `P-05`, `P-24`, `P-59`, `P-63`, `P-64`, `P-65`, `P-66`, `P-93`, `P-126`,
`P-129`, `P-136` — mais o novo `P-140`. Detalhamento completo na **§24 da matriz canônica**.
Resumo do que **não** aconteceu:

- **Nenhum código passou a `CORRIGIDO`.** Nenhuma severidade foi rebaixada. Nenhuma classificação
  de lançamento foi afrouxada.
- `P-64`, `P-65` e `P-136` saíram de `DECISÃO DE PRODUTO PENDENTE` para **`ABERTO`** — a decisão
  existe, o código não mudou.
- Onze códigos moveram-se de `EXIGE DECISÃO NO PRODUCT LOCK` para `INFORMA O PRODUCT LOCK`: a
  pergunta saiu da fila do Lock, **o risco não saiu da matriz**.

### 14.4 O que continua aberto depois da Fase 4A

| Item | Natureza | Onde se resolve |
|---|---|---|
| Preço nominal em reais, moeda e textos comerciais | Parâmetro comercial | Amanda, antes da Fase 18 |
| Criação dos produtos nas lojas e configuração do RevenueCat | Implementação | Eduardo, Fase 18 |
| Chaves `EXPO_PUBLIC_REVENUECAT_*` nos perfis do `eas.json` | Implementação (`P-93`) | Fase 18 |
| Compra, restauração e *paywall* reais | Implementação (`P-24`) | Fase 18 |
| Teste físico do cache expirado offline | Validação física (`P-129`) | Fase 18, revalidação Fase 21 |
| Política declarada de versionamento do *snapshot* | Implementação (`P-140`) | Fase 18 |
| Textos de `ParentAreaScreen.js:840` e `BrincarScreen.js:306`, `NaN` da Galeria | Implementação (`P-63`, `P-64`, `P-65`) | Fase 12A |
| Oferta comercial em `accessibilityLabel` | Implementação (`P-66`) | Fase 12A / Fase 5 |
| Filtro de acesso da Home | Implementação (`P-05`) | Fase 11 |
| Remoção das 18 premium do binário com UX de baixar antes de ver | Implementação (`P-136`) | Fase 16 |
| **`P-55`** — fallback premium do Modo Criador | **Risco técnico não corrigido** | Fase proprietária, inalterada |
| **`P-56`** — rodada fabricada na retomada | **Risco técnico não corrigido** | Fase proprietária, inalterada |

### 14.5 Preservação explícita de `P-55` e `P-56`

Exigida nominalmente pelo fundador. **Nenhum campo de `P-55` e `P-56` foi tocado.** As decisões
desta fase **não os alcançam**: são defeitos de código, não perguntas de produto. Seguem abertos,
com a mesma severidade, a mesma fase proprietária e a mesma classificação de lançamento que
tinham no commit canônico.

### 14.6 Estatuto documental de cada arquivo tocado (gate de 2026-08-05)

A correção de um conflito documental **não** se aplica do mesmo modo a um normativo vigente, a um
histórico substituído e a um registro de validação física. O gate da Fase 4A separou os três:

| Arquivo | Estatuto | Tratamento | Fato histórico reescrito? |
|---|---|---|---|
| `docs/DECISIONS.md` | **Normativo — árbitro de decisões** | Texto corrigido e seção `PL4A` acrescentada | Não |
| `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` | **Normativo — roadmap vigente**, dono do nome da fase | Título da Fase 18 corrigido, com bloco de correção datado | Não |
| `docs/launch/MATRIZ_DE_ACESSO.md` | **Normativo — matriz de acesso vigente** | Texto corrigido | Não |
| `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` | **Normativo — matriz canônica** | Regerada pelo gerador determinístico | Não |
| `docs/fase4-product-lock/01_…_ENTITLEMENT.md` | **Artefato do Product Lock** | Este documento | Não |
| `docs/PLANO_OFICIAL_BENI_LANCAMENTO.md` | **Histórico substituído** (banner `SUPERSEDED`; `PSOT:19`, `v5:29`, `DECISIONS.md:477`) | **Texto histórico preservado literalmente**; duas **notas de superação** apontando para `D-4A-PRODUTOS-E-PERIODICIDADE` e declarando ausência de autoridade normativa | **Não** — a versão preliminar chegou a substituir o texto, e o gate **restaurou** o original |
| `docs/C60_VALIDACAO_FISICA.md` | **Evidência de validação física** | **Nenhuma alteração** — restaurado ao estado anterior à Fase 4A | **Não** |

**Por que `C60_VALIDACAO_FISICA.md` ficou intocado.** A versão preliminar do commit anotava ali a
correção do título da Fase 18. A citação, porém, vive **dentro do texto de uma decisão do fundador
datada de 2026-08-04**, num arquivo cuja função é registrar **o que o aparelho de fato produziu**.
A autoridade sobre o nome da fase é da `v5`, não do registro de validação; corrigir o nome lá não
acrescentava nada e mexia num registro histórico sem necessidade. A alteração foi **removida**.
Nenhum resultado, data, *build*, dispositivo, aprovação ou reprovação daquele arquivo foi tocado
em momento algum — o único trecho editado e depois revertido era a citação do título de uma fase
futura.

---

## Anexo A — Base factual reverificada pessoalmente

Todas as afirmações de código deste documento foram lidas diretamente na árvore de trabalho em
`dca7863`, não adotadas de terceiros:

| Fato | Local |
|---|---|
| `OFFLINE_MAX_WINDOW_MS = 7 * 24 * 60 * 60 * 1000` | `src/services/entitlementPolicy.js:32` |
| Ordem de decisão em 10 ramos, `hasValidWindow` exigindo expiração futura **e** validação recente | `src/services/entitlementPolicy.js:44-97` |
| `needs_revalidation` → `free` no mapeamento de plano | `src/services/entitlementService.js:42` |
| *Writer* único de `@ptf_entitlement_v1` | `src/services/entitlementService.js:99-102`, chamado só em `:114` |
| Guarda anti-retrocesso `maxSeenDeviceTimestamp` | `src/services/entitlementService.js:86-91` |
| `if (!apiKey) return false;` | `src/services/entitlementSource.js:55` |
| Nomes das variáveis de RevenueCat (valores nunca lidos) | `src/services/entitlementSource.js:38-42` |
| `grep -c REVENUECAT eas.json` → **0** | `eas.json` |
| `ENABLE_LOCAL_PREMIUM_TEST_MODE = false` | `src/services/accessControl.js:20` |
| `FREE_ATELIER_SAVE_LIMIT = 0` | `src/services/accessControl.js:33` |
| `isPremiumUser()` com *override* de Modo Criador | `src/services/accessControl.js:72-76` |
| "Pack no disco NUNCA é autorização" | `src/services/accessControl.js:45-47` |
| `CREATOR_QA_MODE_RELEASE_ENABLED` exige `preview-criador` | `src/config/featureFlags.js:85-88` |
| `PLAN_LABELS` como rótulos oficiais × `PREMIUM_PLAN.name = 'Premium'` | `src/data/planConfig.js:74` × `:22` |
| `productIdPlaceholder: ''`, `isPurchaseEnabled: false` | `src/data/planConfig.js:40-55` |
| `FREE_STORY_IDS = ['creation','noah']` | `src/data/planConfig.js:83` |
| `BRINCAR_FREE_DAILY_ROUNDS = 2`, `UNLIMITED = Infinity` | `src/services/brincarDailyService.js:28`, `:31` |
| `catch` fail-open com `premium: true` | `src/screens/MonteACenaTableGameScreen.js:467` |
| *Stub* de restauração não montado em JSX (2 ocorrências: declaração e handler) | `src/screens/ParentAreaScreen.js:320`, `:507-510` |
| Gate parental bloqueando a Área dos Pais inteira | `src/screens/ParentAreaScreen.js:633-636` |
| Seção "Plano familiar" informativa, sem botões acionáveis | `src/screens/ParentAreaScreen.js:849`, `:860-862` |
| `react-native-purchases` instalado | `package.json:63` |
