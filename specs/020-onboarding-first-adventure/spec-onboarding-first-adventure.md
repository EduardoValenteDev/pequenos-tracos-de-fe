# Spec — A primeira aventura: o onboarding termina no Mapa

> **Feature:** `020-onboarding-first-adventure` · **Etapa SDD:** 1–3 (Specify · Clarify · Checklist)
> **Data:** 2026-08-04 · **Base exata:** `c0e9fbf5053ce8e7fb8e22b2fb0d5ff623b86cf6` (HEAD canônico de `integrate/colorir-canonical-runtime`, publicado)
> **Branch de trabalho:** `fix/onboarding-first-adventure-map` (nascida da base acima)
> **Identificador:** `020` (próximo livre — `019` = c60-persistence-all-plans)
> **Natureza:** **correção de contrato de navegação da primeira sessão.** Não é área protegida (não toca paywall, progresso, conquistas, `accessControl`, manifestos, histórias nem assets), mas é **caminho de primeiro uso** — exige teste comportamental, controles negativos e validação física.
>
> **Precedência:** SoT ([`docs/PROJECT_SOURCE_OF_TRUTH.md`](../../docs/PROJECT_SOURCE_OF_TRUTH.md)) → constituição → `AGENTS.md`/`CLAUDE.md` → esta spec.
> **Não reabre** as decisões do onboarding O2.2/O2.3/O2F, do tour UX 2.0/2.1/2.4.2, do TABLET1.0, nem qualquer decisão da Fase 2.5.
>
> **Autorização do fundador (2026-08-04):** *"Autorizo o início do primeiro bloco de implementação após o encerramento da Fase 2.5 — BLOCO 1 · A PRIMEIRA AVENTURA"*, com **escopo funcional congelado** em 10 itens (§3) e lista explícita do que **não entra** (§4).

---

## 1. Contexto

O relatório somente leitura da Fase 3 apurou que o onboarding **termina no destino errado**. A criança nova conclui as quatro páginas do Livro Vivo, toca no CTA e cai **direto na tela de detalhe de A Criação** — o Mapa de Aventuras existe apenas por baixo, na pilha, e o tour do Beni abre escondido atrás da história.

O ponto importante: **o contrato desejado já está implementado**. O `INITIAL_TOUR` apresenta o mapa, destaca o próximo pin e rola o mapa até ele. Nada disso precisa ser criado — apenas **deixado aparecer**.

## 2. Estado atual (causa comprovada)

Em [`src/screens/OnboardingScreen.js`](../../src/screens/OnboardingScreen.js), `finish(dest)`:

```js
await markOnboardingCompleted();
requestInitialTour();

const tabsState = { index: 1, routes: [ { name: 'Início' }, { name: 'Aventuras', params: { startBeniTour: true } }, … ] };
const routes = [{ name: 'Home', state: tabsState }];
if (dest === 'creation' && CREATION_STORY) routes.push({ name: 'StoryDetail', params: { story: CREATION_STORY } });
navigation.dispatch(CommonActions.reset({ index: routes.length - 1, routes }));
```

e o CTA da última página:

```js
if (moment === 'creation') { finish(creationDone ? 'adventures' : 'creation'); return; }
```

Ou seja: **criança nova ⇒ `dest === 'creation'` ⇒ `StoryDetail` empilhado sobre o Mapa.**

Consequências verificadas:

| Efeito | Prova |
|---|---|
| O Mapa não é a tela visível | o `reset` termina em `index = 1`, com `StoryDetail` no topo |
| O tour abre escondido | `AdventureMapScreen` monta junto (aba 1 do `tabsState`), arma `showBeniTour` e fica coberto |
| A trava de aba é armada fora do mapa | `setAdventureTourActive(true)` roda com a criança no `StoryDetail` |
| A Criação abre **sem** escolha da criança | a história é empilhada pelo `reset`, não por toque |
| O rótulo promete a história, não o mapa | `labelForMoment` devolve `Começar A Criação` |

**O que já existe e está correto** (e por isso não será reescrito): `INITIAL_TOUR` com os cinco passos — incluindo `{ title: 'Siga o brilho', target: 'adventures.nextPin' }` —, o registro do alvo (`guideTargets.register('adventures.nextPin')`), o `scrollPinIntoView()` no foco do pin, o `BeniGuideOverlay`, a trava temporária de troca de aba e a gravação da flag `@ptf_beni_app_tour_seen_v1` **somente no fechamento** do tour.

## 3. Comportamento desejado (escopo congelado pelo fundador)

1. O texto do CTA principal da última página é exatamente **`Iniciar primeira aventura`**.
2. A navegação termina com o **Mapa de Aventuras como tela visível**.
3. A aba **Aventuras** está selecionada.
4. O **tour inicial do Beni começa no mapa**.
5. O Beni apresenta o mapa **usando o sistema existente**.
6. A Criação recebe o destaque já existente em **`adventures.nextPin`**.
7. O mapa **rola até o pin** quando necessário.
8. A história A Criação **só abre por toque da criança** no pin ou no destino explicitamente apresentado.
9. O onboarding é marcado como concluído **sem** marcar o tour como visto antes de ele terminar.
10. O tour **não reaparece** indevidamente depois de concluído.

## 4. Fora de escopo (congelado)

Imagens do Beni no onboarding · crop/transparência/assets · aba Brincar · saída do Criar Livre · migração para `AppScreen` · safe area ampla · conteúdo/ordem/áudio do `INITIAL_TOUR` · Colorir com o Beni, Cultinho e Criar Livre · qualquer alteração de monetização.

## 5. Contrato de navegação da primeira sessão

**Contrato único, sem ramo de destino:**

> Ao concluir o onboarding — por CTA principal **ou** por *Pular* —, o app faz `reset` para **uma única rota**: `Home`, com o estado de abas em `index: 1` (`Aventuras`) e `params: { startBeniTour: true }`. **Nenhuma outra rota é empilhada.** A história é sempre alcançada por **escolha da criança**.

Consequência de projeto: com o empilhamento removido, `finish('creation')` e `finish('adventures')` passariam a ser **literalmente o mesmo código**. O parâmetro `dest` deixa de existir — um destino, uma função. Isso é deliberado: impede que um ramo de destino seja reintroduzido por descuido e torna o controle negativo (§9) trivial de escrever.

## 6. Persistência

| O quê | Onde | Quando grava | Muda neste bloco? |
|---|---|---|---|
| Onboarding concluído | `onboardingService.markOnboardingCompleted()` | ao fim do `finish()`, **antes** do `reset` | **não** |
| Perfil da criança | `saveProfile` + `createChildProfile` | antes do `markOnboardingCompleted` | **não** |
| Tour inicial visto | `@ptf_beni_app_tour_seen_v1`, via `markBeniAppTourSeen()` | **somente** em `closeBeniTour()` no mapa | **não** |
| Guia de Aventuras visto | `@ptf_beni_guide_adventures_v1`, via `markGuideSeen('adventures')` | idem | **não** |
| Pedido de tour pendente | `requestInitialTour()` — **memória**, não storage | no `finish()` | **não** |

O onboarding **não grava** nenhuma flag de tour. O item 9 do escopo já é verdade no código atual e passa a ser **protegido por teste**.

## 7. Comportamento por perfil

**Criança nova** (`creationDone === false`): CTA `Iniciar primeira aventura` → Mapa + tour → destaque em A Criação → a criança toca o pin.

**Usuário com A Criação já concluída** (`creationDone === true`, modo revisão pelo Perfil): CTA permanece **`Explorar Aventuras`** — rótulo verdadeiro para quem já concluiu — e o destino é o mesmo Mapa. O rótulo `Iniciar primeira aventura` seria falso nesse perfil; o item 1 do escopo trata do CTA da **primeira sessão**, e o item 5 da implementação manda preservar o comportamento correto quando A Criação já estiver concluída.

**Botão secundário.** Hoje a última página mostra, abaixo do CTA, um `Explorar Aventuras` secundário que chama `finish('adventures')`. Com o contrato único (§5) ele passa a ser **byte a byte o mesmo comportamento do CTA principal** — duas chamadas idênticas para a ação idêntica, na mesma tela, para uma criança pré-leitora. O botão é **removido**; o espaço reservado (`secondarySlot`) é **mantido**, para que a geometria do rodapé não mude em nenhuma das quatro páginas. Registro honesto: **este é o único ponto do bloco que não está literalmente escrito no escopo congelado** — é consequência direta dele, e sua reversão é um único trecho.

## 8. Telefone × tablet — verificado por leitura, sem duplicar regra

São **dois transportes para um mesmo pedido**, e ambos já existem:

| Layout | Como o pedido chega | Por quê |
|---|---|---|
| Telefone | `route.params.startBeniTour`, pelo `state` aninhado do `reset` | o `TabsNavigator` propaga o estado aninhado |
| Tablet | sinal em memória `requestInitialTour()` | `TabletLayout` é **layout custom** e ignora o estado aninhado; ele lê `isInitialTourPending()` no mount para já abrir em `Aventuras` e assina `subscribeInitialTourRequest` |

`AdventureMapScreen` trata os dois como **um só**: `if (route?.params?.startBeniTour || consumeInitialTourRequest()) maybeShow();`.

**Conclusão:** os sinais são genuinamente necessários e **não** são regra duplicada — são a mesma regra em dois transportes. O `finish()` continua emitindo **os dois**. Nada a unificar.

## 9. Critérios de entrada e de saída

**Entrada:** base `c0e9fbf`, árvore limpa, branch própria. ✔

**Saída — todos obrigatórios:**

1. `npm run smoke` verde, com os testes novos deste bloco incluídos.
2. `npx expo-doctor` verde.
3. Parse Babel dos arquivos tocados.
4. `git diff --check` limpo e árvore limpa após o commit.
5. **Controle negativo 1:** reintroduzir o empilhamento de `StoryDetail` **quebra** o smoke.
6. **Controle negativo 2:** remover o disparo do tour **quebra** o smoke.
7. Roteiro físico (§11) executado no próximo build, **fora deste bloco**.

## 10. Matriz de testes (comportamentais, em `scripts/smoke.js`)

Implementada no bloco `── B1: a primeira aventura (onboarding termina no Mapa) ──`. As provas **executam** o
sistema em vez de descrevê-lo, por três decisões:

1. o `finish` **real** é extraído do fonte pela **AST** (`@babel/parser`) e **executado** com as
   fronteiras dubladas — sem render, sem reimplementação, sem regex descrevendo o que ele "deveria" despachar;
2. a ação despachada é aplicada pelos **roteadores reais** do React Navigation
   (`@react-navigation/routers`: `StackRouter` + `TabRouter`). Quem responde *"qual tela ficou visível"*
   e *"qual aba está selecionada"* é o roteador de produção, não o arquivo de teste;
3. a ordem das abas é **lida de `TAB_DEFS`** no `AppNavigator`. Reordenar as abas sem corrigir o
   `index` deixa as provas vermelhas sozinhas.

O bloco é assíncrono (`globalThis.__B1_PRIMEIRA_AVENTURA`) e a própria conclusão dele é um check —
senão um estouro no meio faria as provas **sumirem** em vez de falhar.

| # | ID no smoke | Prova | Como é provado |
|---|---|---|---|
| 1 | `B1-01` | O fim do onboarding produz o Mapa como tela visível | roteador real: `telaVisivel === 'Home'` e aba `Aventuras` |
| 2 | `B1-02` | A pilha não contém `StoryDetail` automaticamente | pilha resultante é exatamente `["Home"]` |
| 3 | `B1-03` | A aba Aventuras está selecionada | índice focado === `TAB_DEFS.indexOf('Aventuras')`, lido do AppNavigator |
| 4 | `B1-04` | O sinal de início do tour está presente | `params.startBeniTour === true` **e** `isInitialTourPending()` no serviço **real** |
| 5 | `B1-05` | O CTA usa `Iniciar primeira aventura` | `labelForMoment` extraída da AST e **executada** |
| 6 | `B1-06` | O alvo `adventures.nextPin` continua registrado | `INITIAL_TOUR` carregado de verdade + `register(...)` + `scrollPinIntoView` no mapa |
| 7 | `B1-07` | O tour não é marcado como visto antes de terminar | após rodar o `finish` real, `hasSeenGuide('initial') === false` no serviço real; quem marca é `closeBeniTour` |
| 8 | `B1-08` | Concluído, o tour não reaparece | flag persiste após `markGuideSeen`; e `consumeInitialTourRequest()` é **one-shot** (`true` → `false`) |
| 9 | `B1-09` | Com A Criação concluída, nenhuma história abre sozinha | mesmo `finish` real com `creationDone` → mesmo destino único; rótulo `Explorar Aventuras` |
| 10 | `B1-10` | O tablet pede o mesmo tour sem duplicação | `TabletLayout` consome o sinal; o mapa une os dois transportes num único `\|\|` |
| 11 | `B1-11` | **Mutante:** voltar a empilhar `StoryDetail` morre | o mutante reexecuta os **mesmos predicados** de B1-01/B1-02 e exige `false` |
| 12 | `B1-12` | **Mutante:** remover o início do tour morre | idem para o predicado de B1-04, exigindo que B1-01/B1-02 **continuem** verdes (sem falso positivo) |

Os mutantes 11 e 12 usam a mesma disciplina do harness de packs: **se a âncora da mutação não bater no
fonte, o teste LANÇA**. Um mutante que não se aplicou jamais pode ser contado como mutante morto.

### 10.1 Controles negativos no disco (executados)

Além dos mutantes em memória, os dois defeitos foram reintroduzidos **no arquivo real** e a suíte
completa foi executada. O arquivo foi restaurado e conferido por `sha256` byte a byte nos dois casos.

| Controle | Defeito reintroduzido | Resultado |
|---|---|---|
| A | `StoryDetail` reempilhado no `reset` | **7 checks vermelhos** (`4518/4525`), entre eles `B1-01`, `B1-02`, `B1-03`, `B1-04`, `B1-09` e o `O2` do contrato |
| B | `requestInitialTour()` removido e `params` sem `startBeniTour` | **5 checks vermelhos** (`4519/4524`), entre eles `B1-04`, `B1-10` e o `TABLET1.0` |

No controle B o total cai para `4524`: a âncora do mutante 12 deixou de existir, o bloco **lançou** e o
check de harness acusou a ausência — exatamente o comportamento desejado (um check que some não pode
passar despercebido).

## 11. Roteiro físico (para o próximo build — não executado neste bloco)

1. Perfil zerado (*Resetar onboarding* na Área dos Pais) → percorrer as quatro páginas.
2. Conferir o rótulo do CTA: **`Iniciar primeira aventura`**, e que **não** há segundo botão com a mesma ação.
3. Tocar o CTA → a tela visível deve ser o **Mapa**, com a aba **Aventuras** ativa.
4. O tour deve rodar do card 1 ao 5; no card 5 o mapa rola até **A Criação**, que brilha.
5. Fechar o tour → tocar no pin → só então a história abre.
6. Trocar de aba e voltar para Aventuras → **o tour não reaparece**.
7. Repetir com *Pular* na primeira página.
8. Repetir em perfil com A Criação já concluída (CTA `Explorar Aventuras`, sem abrir história).
9. Repetir **em tablet** (a aba Aventuras deve abrir focada pelo sinal).
10. Reabrir o app após concluir o tour → nada reaparece.

## 12. Riscos

| Risco | Mitigação |
|---|---|
| A criança fica sem caminho óbvio até A Criação | o próprio `INITIAL_TOUR` termina em "Siga o brilho" apontando o pin, com rolagem automática |
| Regressão no modo revisão (perfil já existente) | rótulo `Explorar Aventuras` preservado e coberto por teste |
| Regressão no tablet | os dois transportes preservados; testes 4 e 10 |
| Flag `_pendingInitialTour` em memória fica pendente no telefone (o `||` em curto-circuito não a consome) | **risco residual pré-existente, não introduzido aqui**: a reabertura é barrada por `hasSeenBeniAppTour()`; a flag é só memória e morre no fim do processo |
| Remoção do botão secundário não estar no escopo literal | registrada em §7, reversível em um único trecho |

## 12.1 Descobertas da implementação (voltaram para esta spec)

Três coisas apareceram só ao implementar e ficam registradas aqui, como manda o fluxo SDD:

1. **Três asserções do smoke — não duas — codificavam o contrato antigo.** Além das duas previstas
   (`O2 OnboardingScreen…` e o conjunto `O2.3 §29-34`), o bloco `O2.2 §28-32` também exigia
   `name: 'StoryDetail'` como prova de *"rotas intactas"*. As três foram reescritas para afirmar o
   contrato novo — o empilhamento era o **defeito**, nunca a rota preservada.
2. **A guarda de privacidade do onboarding proíbe a palavra "telefone" no fonte.** O check
   *"OnboardingScreen não pede email, telefone, idade ou senha"* lê o arquivo **cru**, comentários
   inclusive. O comentário novo sobre os dois transportes passou a dizer **"celular"** — que é o termo
   já usado no `AppNavigator`. A guarda **não** foi enfraquecida para acomodar o comentário.
3. **Código morto gerado pela remoção do botão secundário.** Os estilos `secondary` e `secondaryText`
   ficaram sem uso e foram removidos; o `secondarySlot` **fica**, de propósito, para não encurtar o
   rodapé das quatro páginas (mudança visual fora deste bloco). O bloco `O2F` proíbe explicitamente
   deixar resíduo de código morto no onboarding.

## 13. Rastreabilidade

Problema 1 do relatório somente leitura da Fase 3 → esta spec → `fix/onboarding-first-adventure-map`.
**Fase proprietária:** Fase 7 — *Onboarding, Home e Área dos Pais* (critério de saída: *"primeira sessão de uma criança nova percorrida ponta a ponta em dispositivo"*).
