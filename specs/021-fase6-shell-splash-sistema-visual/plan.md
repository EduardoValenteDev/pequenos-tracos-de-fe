# Plano de Implementação — Fase 6: Shell, Splash e Sistema Visual

**Etapa SDD 4 — Plan + Constitution Check**
**Feature**: 021 — Shell, splash e sistema visual
**Spec**: [spec-fase6-shell-splash-sistema-visual.md](./spec-fase6-shell-splash-sistema-visual.md)
**Branch**: `feat/fase6-shell-splash`
**Worktree**: `C:\tmp\ptf_fase6_shell_splash_wt`
**Data**: 2026-08-07 · **emendado em 2026-08-07 pelo Portão Humano 2**
**Base documental exata**: `76e502c146767885e342c5d96a4dcdd13c94a1f7`
**Base executável preservada**: `015c438106538595b592981fbe1b80b1d5d65e55` (runtime bit-idêntico)
**Autorização**: Portão Humano 1 aprovado pelo fundador em 2026-08-07
**Estado**: aguardando **Portão Humano 2**. Nenhum código escrito. Nenhum build gerado.

> **Aviso de convenção.** `setup-plan.ps1` resolve `FEATURE_SPEC` para `spec.md`, arquivo que não
> existe neste diretório. A spec canônica é `spec-fase6-shell-splash-sistema-visual.md`, conforme a
> convenção real do projeto (specs 006, 007, 009, 013–019). O nome `plan.md` segue os specs 016 e
> 018, que são os precedentes mais recentes com plano. Divergência **declarada, não silenciada**.

---

## 1. Sumário

A Fase 6 fecha três eixos que hoje competem entre si no runtime: **(A) o shell de navegação**,
**(B) a abertura/splash** e **(C) o sistema visual**. O plano transforma os requisitos aprovados
(RF-A1…A7, RF-B1…B7, RF-C1…C16, RF-M1…M5) em oito blocos executáveis, ordenados para que cada
bloco consuma uma fundação já estabilizada, e concentra **toda a necessidade de binário novo em um
único ciclo de build**.

A abordagem central é **unificação, não criação**: um único sistema de breakpoints (`tokens.breakpoints`),
um único componente-base de tela, um único shell semanticamente correto em telefone e tablet, uma
única superfície de abertura contínua, e um único conjunto de tokens de estado de card. Nenhuma
paleta paralela nova é criada; o azul premium é derivado da rampa `night` já existente.

---

## 2. Contexto Técnico

| Item | Valor |
|---|---|
| **Linguagem** | JavaScript (ES2022), 100 % — sem TypeScript (Constituição, Princípio III) |
| **Runtime** | React Native 0.81.5 · React 19.1.0 · Expo SDK 54 · New Architecture (`newArchEnabled: true`) |
| **Dependências primárias** | `@react-navigation/{native,stack,bottom-tabs}`, `react-native-safe-area-context`, `expo-font`, `@expo-google-fonts/{fraunces,nunito,fredoka-one}`, `expo-haptics` |
| **Persistência** | AsyncStorage + `expo-file-system/legacy` — **não tocada por esta fase** |
| **Testes** | `npm run smoke` (`scripts/smoke.js`, gate duro de CI) + `npx expo-doctor` + validação visual + validação física |
| **Plataformas-alvo** | iOS (tablet suportado: `ios.supportsTablet: true`) e Android (`edgeToEdgeEnabled: true`) |
| **Tipo de projeto** | Aplicativo móvel local-first, sem backend |
| **Escala** | 42 telas em `src/screens`, 5 abas, ~34 arquivos consumindo `useWindowDimensions` |
| **Meta de performance** | **Nenhuma.** A Fase 6 habilita o coletor; **não** declara meta nem baseline (ver §11) |
| **Restrições** | Sem OTA; build só por EAS; sem SDK de tracking; `production` proibido para flags de diagnóstico |

### 2.1 Estado auditado que o plano assume como verdadeiro

Todos os fatos abaixo foram verificados **estaticamente no worktree**, no commit `76e502c`
(runtime idêntico a `015c438`):

| Fato | Evidência |
|---|---|
| Três camadas de abertura com **três cores distintas** | `app.json:14` `#7C3AED` → `App.js:110` `#FFF8F0` → `SplashScreen.js:121` `colors.background` = `#FFF8EF` |
| `expo-splash-screen` **não** é dependência declarada | `package.json` — ausente da lista de `dependencies` |
| `SplashScreen.js` **usa fontes customizadas** | `:132` `fontFamily: 'FredokaOne'`, `:139` `fontFamily: 'Nunito'` |
| Quatro sistemas de tema vivos em paralelo | `productTheme` 75 consumidores · `colors` 23 · `tokens` 12 · `theme.js` **0 (código morto)** |
| `768` em 10 comparações + 1 constante | ver §7.1 (mapa completo) |
| `Dimensions.get` em `src/` | **ZERO ocorrências** — RF-A2 já essencialmente satisfeito |
| `AppScreen.js` **sem nenhum consumidor** | `grep` em `src/` — e ele importa o tema concorrente (`productTheme`) |
| `TabletLayout` **não é um navegador** | `AppNavigator.js:152+` renderiza o componente ativo com um objeto `route` **fabricado** |
| `TabletLayout` **sem `BackHandler`** | `BackHandler` só em `BeniGuideOverlay.js:70` e `AtelierCanvasScreen.js:307` |
| `EXPO_PUBLIC_PTF_PERF_TRACE` ausente dos 6 perfis | `eas.json` — nenhum perfil declara a chave |
| Sem script npm para o agregador | `package.json` — `scripts/perf-baseline-report.js` existe mas não tem entrada |
| Gate duro de selos no smoke | `scripts/smoke.js:23597-23606` exige literal `night800` na linha do premium |

---

## 3. Arquitetura Proposta

### 3.1 Princípio arquitetural

> **Convergir para o que já existe e é canônico; aposentar o paralelo; nunca criar um terceiro.**

Três convergências, uma por eixo:

1. **Eixo A (shell)** — `tokens.breakpoints` passa a ser a **única** fonte de verdade responsiva;
   um único componente-base de tela resolve área segura; o shell de tablet passa a ser um
   navegador de verdade (ou um adaptador que preserva o contrato de navegação), eliminando a
   fabricação de `route`.
2. **Eixo B (abertura)** — as três camadas de abertura passam a compartilhar **uma cor de fundo
   contínua**, e a porta de fontes deixa de ser um terceiro estado visual.
3. **Eixo C (sistema visual)** — os tokens de `tokens.js` passam a ser a fonte dos estados de card;
   o azul premium ganha um degrau **derivado da rampa `night` já existente**, não uma paleta nova.

### 3.2 Camadas afetadas

```text
App.js                       ← porta de fontes (B4)
src/theme/tokens.js          ← breakpoints (B1), azul premium (B5)
src/components/layout/       ← AppScreen (B1), CenteredContent (B1)
src/components/ui/           ← ContentContainer, ModalPapel (B1, B2)
src/navigation/AppNavigator  ← TabletLayout, MainTabs, rotas raiz (B3)
src/screens/*.js             ← consumidores de 768 (B1), navegações inefetivas (B3),
                               semântica a11y (B2), hápticos (B2′), cores de estado (B5)
src/screens/SplashScreen.js  ← abertura (B4)
app.json                     ← splash.backgroundColor, androidStatusBar e
                               android.adaptiveIcon.backgroundColor (B4)
eas.json                     ← EXPO_PUBLIC_PTF_PERF_TRACE (B6)
package.json                 ← script npm do agregador (B6)
scripts/smoke.js             ← gates novos e gate A0.7 atualizado (B1, B3, B5)
```

**Fora da árvore afetada e assim permanece:** `src/services/` (exceto leitura), `src/context/`,
`src/data/`, `accessControl`, manifestos, histórias, `assets/`, `plugins/`.

---

## 4. Sequência de Blocos

### 4.1 B1–B7 como insumo e o refinamento proposto

A Spec entrega B1–B7 como **insumo, não como verdade automática** (autorização §4). O plano propõe
**duas alterações estruturais**, ambas justificadas por redução de risco:

| Alteração | O que muda | Justificativa |
|---|---|---|
| **B1 absorve P-29** | A decisão sobre `AppScreen.js` (componente-base de tela) entra em B1, junto de P-30 | P-29 e P-30 definem **a mesma primitiva de layout** consumida por B2, B3 e B5. Separá-los obrigaria **duas passagens de migração sobre o mesmo conjunto de consumidores**, dobrando a superfície de regressão. Não é agrupamento por arquivo compartilhado: é agrupamento por **primitiva compartilhada**. |
| **B2 se subdivide em B2 e B2′** | B2 = semântica e tipografia (P-27, P-28 sistêmico). B2′ = reduce motion e hápticos (P-104) | São **contratos de natureza diferente**: B2 é semântica estática (papéis, rótulos, estados, ordem de leitura), verificável por inspeção e por leitor de tela; B2′ é **política de comportamento** dependente de uma preferência de sistema, com controles negativos próprios (alternar a preferência) e evidência física própria. Misturá-los faria o critério de aceite de um mascarar a falha do outro. |

**Nenhuma outra alteração estrutural é proposta.** B3, B4, B5, B6 e B7 permanecem com o escopo da
Spec.

### 4.2 Reordenação proposta e sua justificativa

A autorização §5 fixa: **B1 antes de B3**; **B1 antes de B2** quando a estabilização de layout for
necessária; **Y.2 já resolvido não bloqueia B5**; **B4 e B6 exigem materialização em build**;
**B7 depende do estado final dos blocos anteriores**.

O plano acrescenta **uma reordenação**: **B3 antes de B2**.

> **Justificativa.** B2 aplica semântica de acessibilidade ao shell (papéis de aba, estado
> selecionado, ordem de leitura, `accessibilityViewIsModal`). B3 **reconstrói o shell** — o
> `TabletLayout` deixa de fabricar `route` e a hierarquia de rotas muda. Aplicar B2 antes de B3
> significaria **anotar semanticamente uma árvore que está prestes a ser substituída**, e refazer
> o trabalho. B3→B2 elimina retrabalho e garante que a evidência de leitor de tela seja colhida
> sobre o shell final, não sobre um intermediário descartado.

### 4.3 Ordem final

| # | Bloco | Conteúdo | P cobertos | Build? |
|---|---|---|---|---|
| 1 | **B1** | Fundação responsiva e estrutural unificada | P-30, P-29 | Não |
| 2 | **B3** | Shell de navegação e hierarquia de rotas | P-31, P-47, P-20 (parcela do shell) | Não |
| 3 | **B2** | Acessibilidade semântica e tipográfica do shell | P-27, P-28 (parcela sistêmica) | Não |
| 4 | **B2′** | Reduce motion e hápticos | P-104 | Não |
| 5 | **B5** | Estados de card sem paleta paralela + azul premium | D-STATUS-CARDS, D-SELOS-ESTADO-V2 | Não |
| 6 | **B4** | Splash e abertura reais | RF-B1…B7, E5.52 (parcela de abertura) | **Sim** |
| 7 | **B6** | Coletor de desempenho alcançável em perfil interno | P-139, E5.52 | **Sim** |
| 8 | **B7** | Varredura visual e campanha de validação física | S1–S11, F1–F11 | Consome o build |

**B4 e B6 são adjacentes de propósito**: suas alterações nativas/configuracionais entram no
**mesmo ciclo de build** (ver §12).

---

## 5. Dependências entre Blocos

```text
B1 ──┬──► B3 ──► B2 ──► B2′ ──┐
     │                         ├──► B4 ──┐
     └──► B5 ──────────────────┘         ├──► [1 ciclo de build] ──► B7
                                B6 ──────┘
```

| Dependência | Natureza | Por quê |
|---|---|---|
| B1 → B3 | **Dura** | B3 decide o layout de tablet; sem um breakpoint único, o shell testaria contra dois limiares |
| B1 → B5 | **Dura** | Cards respondem a largura; grid e `maxContentWidth` vêm de `tokens` |
| B3 → B2 | **Dura (proposta)** | Semântica aplicada ao shell final, não ao intermediário (ver §4.2) |
| B2 → B2′ | **Fraca** | Independentes tecnicamente; a ordem preserva a coesão do eixo de acessibilidade |
| B1…B5 → B4 | **Fraca** | B4 é isolado; a ordem existe só para concentrar o build no fim |
| B4 ∥ B6 | **Nenhuma** | Independentes; ficam adjacentes apenas para compartilhar o ciclo de build |
| tudo → B7 | **Dura** | B7 exige o estado final |
| **Tablet físico → B3** | **Dura** | Ver §13 |
| **Dev Client válido → B1** | **Dura** | Ver §12.1 |

---

## 6. Estratégia por Bloco

### 6.1 B1 — Fundação responsiva e estrutural unificada

#### 6.1.1 P-30 — sistema único de breakpoints

**Árbitro já aponta para `tokens.breakpoints`** (`tokens.js:128`: `{ phone: 0, tablet: 600, tabletL: 900 }`).

**Mapa completo dos consumidores a migrar** (não limitado ao literal `768`, conforme autorização §15):

| # | Arquivo | Linha | Forma atual | Classe |
|---|---|---|---|---|
| 1 | `src/components/BeniGuideOverlay.js` | 79 | `width >= 768` | comparação literal |
| 2 | `src/components/layout/CenteredContent.js` | 8 | `width >= 768` | comparação literal |
| 3 | `src/navigation/AppNavigator.js` | 283 | `width >= 768` | comparação literal · **decide o shell inteiro** |
| 4 | `src/screens/ParentAreaScreen.js` | 286 | `width >= 768` | comparação literal |
| 5 | `src/screens/PostStoryHubScreen.js` | 51 | `width >= 768` | comparação literal |
| 6 | `src/screens/QuizScreen.js` | 28 | `width >= 768` | comparação literal |
| 7 | `src/screens/ReflectionScreen.js` | 51 | `width >= 768` | comparação literal |
| 8 | `src/screens/StoryBookScreen.js` | 195 | `width >= 768` | comparação literal · **o Livrinho** |
| 9 | `src/screens/StoryDetailScreen.js` | 112 | `width >= 768` | comparação literal |
| 10 | `src/screens/TrophiesScreen.js` | 196 | `width >= 768` | comparação literal |
| 11 | `src/theme/productTheme.js` | 107 | `tabletBreakpoint: 768` | **constante local em tema concorrente** |

**Consumidores já canônicos (não migram, servem de referência):**

| Arquivo | Linha | Uso |
|---|---|---|
| `src/components/ui/ContentContainer.js` | 21-23 | `breakpoints` de `tokens.js` |
| `src/components/ui/ModalPapel.js` | 21, 48 | `maxContentWidth.tablet` **sem comparação de breakpoint** |

**Duplicação estrutural encontrada e a resolver:** existem **dois componentes concorrentes de
centralização** — `src/components/layout/CenteredContent.js` (usa `768`) e
`src/components/ui/ContentContainer.js` (usa tokens). Manter os dois é duplicação divergente
(Constituição, Princípio III). **Decisão do plano:** `ContentContainer` é o canônico;
`CenteredContent` é migrado para delegar a ele ou é aposentado, conforme a contagem de
consumidores levantada na Etapa 5.

**Fato relevante:** `Dimensions.get` tem **zero ocorrências** em `src/`; 34 arquivos usam
`useWindowDimensions`. Portanto **RF-A2 (largura reativa) já está essencialmente satisfeito** e a
migração de P-30 é sobre **o limiar**, não sobre a reatividade. Isso reduz materialmente o risco.

**Ponto de atenção declarado:** migrar de `768` para `tokens.breakpoints.tablet` (**600**) **muda o
comportamento observável** em dispositivos entre 600 dp e 767 dp — que passam a receber layout de
tablet. Isso não é efeito colateral: é o objetivo. Mas **exige validação física nessa faixa**
(ver §14, F-TAB-600).

#### 6.1.2 P-29 — decisão técnica sobre `AppScreen.js`

**Estado auditado:** `AppScreen.js` (69 linhas) existe, usa `useSafeAreaInsets()`, expõe
`children, backgroundColor, scroll, contentContainerStyle, style, noBottomPadding, applyTopInset`
— e **não tem nenhum consumidor em `src/`**. Pior: importa o tema **concorrente**
(`import { colors as pt } from '../../theme/productTheme'`) e usa `pt.background` como padrão.

**Decisão do plano: ADOTAR como componente-base consumido, não remover** — condicionada.

| Critério | Análise |
|---|---|
| **Área segura** | RF-A1 exige tratamento único de área segura. Remover `AppScreen` deixaria o requisito sem primitiva; cada tela continuaria improvisando (exatamente o defeito que P-29 descreve) |
| **Consistência** | Uma primitiva consumida é o que torna S-shell verificável; sem ela, "consistência" não é binária |
| **Duplicação** | A adoção **elimina** a duplicação (5 telas improvisando); a remoção a **perpetua** |
| **Impacto nas telas** | 5 telas nominadas pela matriz migram. Escopo delimitado, não os 42 arquivos |
| **Rollback** | Alto: a migração é por tela, reversível individualmente |
| **Testabilidade** | Gate estrutural no smoke: "nenhuma tela do inventário chama `useSafeAreaInsets` diretamente" |

**Condição inegociável:** ao ser adotado, `AppScreen.js` **deve deixar de importar `productTheme`** e
passar a consumir `tokens.js`. Adotar um componente-base que propaga o tema concorrente
contradiria o Eixo C.

> **Sobre "não manter código morto só para cumprir P-29" (autorização §14):** a decisão acima
> **não** é manutenção de código morto — é a **eliminação** do estado morto por consumo. Se, na
> Etapa 5, o levantamento mostrar que menos de 3 telas se beneficiam, a decisão **inverte** para
> remoção, e isso volta como alteração registrada no plano, não como improviso.

---

### 6.2 B3 — Shell de navegação e hierarquia de rotas (P-31, P-47)

#### 6.2.1 Causa-raiz identificada

`TabletLayout` (`AppNavigator.js:152+`) **não é um navegador**. Ele renderiza o componente da aba
ativa diretamente, com um objeto `route` **fabricado** e a prop `navigation` do **Stack pai**:

```js
<ActiveComponent
  navigation={navigation}
  route={{ params: activeTab.defaultParams ?? {}, key: activeTabName, name: activeTabName }}
/>
```

Consequência: **acima do breakpoint de tablet não existe um Tab.Navigator**. Toda navegação
dirigida a uma aba — seja por nome de aba, seja por payload aninhado — é entregue a um navegador
que não existe, e é **descartada por construção**.

> **Isto é decisivo para a autorização §16: "Não apenas troque nomes de rota."** Nenhuma troca de
> string corrige P-31, porque o destino não existe. A correção é **estrutural**.

#### 6.2.2 Mapa auditado das navegações inefetivas

**Navegações por nome de aba (3):**

| # | Arquivo | Linha | Chamada |
|---|---|---|---|
| 1 | `src/screens/CongratsScreen.js` | 211 | `navigation.navigate('Aventuras')` |
| 2 | `src/screens/HomeScreen.js` | 660 | `navigation.navigate('Aventuras')` |
| 3 | `src/screens/HomeScreen.js` | 717 | `navigation.navigate('Estrelinhas')` |

**Navegações com payload aninhado `navigate(…, { screen: … })` (7 auditadas):**

| # | Arquivo | Linha | Chamada |
|---|---|---|---|
| 1 | `src/screens/CadeAOvelhinhaScreen.js` | 1074 | `navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })` |
| 2 | `src/screens/CultinhoEmCasaScreen.js` | 56 | `navigate('Home', { screen: 'Aventuras' })` |
| 3 | `src/screens/CultinhoEmCasaScreen.js` | 183 | `navigate('Home', { screen: 'Estrelinhas' })` |
| 4 | `src/screens/PalavrinhasDoBeniScreen.js` | 894 | `navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })` |
| 5 | `src/screens/ParentAreaScreen.js` | 493 | `navigate('Home', { screen: 'Aventuras', params: { startBeniTour: true } })` |
| 6 | `src/screens/ParesDoBeniScreen.js` | 971 | `navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })` |
| 7 | `src/screens/StoryBookScreen.js` | 740 | `navigate('Home', { screen: 'Aventuras' })` |

#### 6.2.3 🔴 DIVERGÊNCIA DE CONTAGEM — DECLARADA, NÃO AJUSTADA

> A matriz (`09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md:506`) registra **"8 chamadas `navigate('Home', {screen})` e 3 nomes de aba"** — total **11**.
> A **recontagem manual auditada** do runtime atual (`76e502c`, idêntico a `015c438`) encontra
> **7 chamadas com payload aninhado + 3 nomes de aba = 10**.
>
> - **Contagem divergente:** a das chamadas com payload aninhado — matriz **8**, recontagem **7**.
> - **Contagem que a recontagem confirma exatamente:** a dos 3 nomes de aba (bate 1 a 1 com a
>   evidência da matriz, incluindo as ocorrências em Cultinho `:56` e `:183`).
> - **Por que a divergência pode ter ocorrido:** a linha da matriz é de **E012**; entre E012 e o
>   runtime congelado houve blocos que alteraram telas (notadamente o legado do Colorir em P3J e o
>   fechamento do C60). Uma 8ª chamada pode ter sido removida junto com uma tela ou um fluxo
>   aposentado. **Isto é hipótese, não conclusão:** o histórico entre E012 e `015c438` **não foi
>   reconstruído nesta rodada**, e sem essa reconstrução a origem exata da divergência é
>   **NÃO DETERMINADA**.
> - **O que NÃO foi feito:** a matriz **não** foi editada. A autorização §24 proíbe correção
>   documental paralela não relacionada ao Plan. A reconciliação da linha P-31 é registrada aqui
>   como **pendência documental** e volta ao artefato proprietário (a matriz) por decisão do
>   fundador, conforme a precedência constitucional.
> - **Por que isso não altera o plano:** RF-A6 exige que **toda** navegação disponível seja
>   efetiva — é um requisito **total**, não uma contagem. O critério de aceite é "zero navegações
>   inefetivas", verificado por gate estrutural, e independe de o número ser 10 ou 11.

> ⚠️ **EMENDA VINCULANTE 2 DO PORTÃO HUMANO 2 (2026-08-07) — como esta divergência se resolve.**
> O fundador determinou: *"Isso NÃO é pergunta ao fundador. Resolva por evidência."* A reconstrução
> histórica passa a ser **tarefa obrigatória da Etapa SDD 6 (Analyze)**, com o seguinte mandato:
> reconstruir **apenas o histórico necessário** entre o registro original de E012 e a base atual;
> identificar se existiu uma **8ª** chamada; identificar em qual commit ou bloco ela desapareceu, se
> possível; determinar se a matriz está desatualizada ou se a auditoria atual perdeu uma ocorrência.
> **Proibições explícitas:** *"Não invente uma ocorrência para fazer a contagem fechar. Não reduza o
> critério funcional a '10' ou '11'."* **Se a evidência for conclusiva**, preparar a correção
> documental correspondente na matriz e nos artefatos SDD. **Se não for conclusiva**, manter a
> divergência **explicitamente registrada** e operar pelo critério funcional total.
> **Critério de aceite inalterado: ZERO NAVEGAÇÕES INEFETIVAS NO ESCOPO.**

#### 6.2.4 Arquitetura desejada do shell

| Superfície | Estado atual | Arquitetura desejada |
|---|---|---|
| **`MainTabs` / `TabletLayout`** | Bifurcação em `:281-285`; tablet renderiza componente direto com `route` fabricado | O tablet passa a montar um **Tab.Navigator real** com apresentação lateral, **ou** `TabletLayout` passa a ser um adaptador de *apresentação* sobre o mesmo `Tab.Navigator` (`tabBar` customizado). **Recomendação: a segunda** — preserva integralmente o contrato do React Navigation (payload aninhado, `route` real, histórico, estado de aba) e reduz a mudança a **como a barra é desenhada**, não a **qual navegador existe**. Risco menor, rollback trivial. |
| **`sidebar`** | Desaparece ao entrar em rotas raiz (P-47) | Passa a ser a implementação de `tabBar` do Tab.Navigator em tablet; existe onde o Tab.Navigator existe |
| **`LumiMoment`** (`AppNavigator.js:514-518`) | Rota **raiz** do Stack — em tablet perde a barra lateral e não tem largura máxima de leitura | **Permanece rota raiz** (é uma experiência de foco, e rebaixá-la a filha de aba mudaria o significado de produto), mas passa a **declarar explicitamente** sua ausência de shell e a **consumir `maxContentWidth`**. A ausência de navegação lateral vira **decisão declarada**, não acidente |
| **`StoryBook`** (`AppNavigator.js:532-536`) | Idem | Idem — o Livrinho é leitura imersiva; mantém-se raiz, ganha largura máxima de leitura e saída explícita |
| **`BackHandler`** | Ausente em `TabletLayout`; existe só em `BeniGuideOverlay.js:70` e `AtelierCanvasScreen.js:307` | Com o Tab.Navigator real, o botão físico Android volta a ser tratado **pelo próprio React Navigation**. Nenhum `BackHandler` manual novo é introduzido no shell — **corrigir a estrutura remove a necessidade do remendo** |
| **Navegação aninhada** | Descartada por construção acima de 768 dp | Passa a funcionar por construção, pelo mesmo motivo |

**Consequência de escopo:** com o Tab.Navigator real, **as 10 chamadas mapeadas em §6.2.2 não
precisam ser reescritas** — elas passam a funcionar. O plano prevê **normalizá-las para `ROUTES.*`**
(4 das 10 ainda usam strings literais) como higiene, mas isso é consequência, não a correção.

#### 6.2.5 P-20 — parcela do shell

P-20 ("nenhum módulo C60 consulta `isTablet`; o Livrinho trata tablet em 1 ponto; Meu Momento e
Cultinho em nenhum") é **`PODE BLOQUEAR LANÇAMENTO`** e pertence à Fase 6. B3 cobre a parcela do
**shell** (as três telas passam a receber largura máxima de leitura e comportamento de tablet
definido). A parcela **C60** é tratada em B7 pela varredura visual, dentro do inventário nominal
(§15) — **não** por reestruturação dos módulos C60, que são área congelada.

---

### 6.3 B2 — Acessibilidade semântica e tipográfica (P-27, P-28)

A autorização §17 exige **separar** três coisas que a matriz agrupa. O plano separa:

| Sub-eixo | P | Escopo | Bloco |
|---|---|---|---|
| Tipografia e `fontScale` | **P-27** | Escala de texto do sistema respeitada nos componentes-base e no shell | B2 |
| Semântica | **P-28** | Papéis, rótulos, estados, ordem de leitura, modais, anúncios | B2 |
| Reduce motion e hápticos | **P-104** | Política de movimento e vibração | **B2′** |

> **"Não faça uma correção superficial baseada apenas em grep" (autorização §17).** O plano
> **não** define o trabalho como "adicionar `accessibilityRole` onde falta". Define-o como:
> **(1)** os componentes-base (`AppScreen`, `ContentContainer`, `ModalPapel`, botões, cards)
> passam a **emitir** semântica correta por construção, de modo que a tela que os consome herde
> a correção; **(2)** as superfícies do inventário são percorridas **com leitor de tela ligado**,
> e a evidência é a passagem, não o grep. O grep serve apenas para **encontrar candidatos**, nunca
> para **declarar cobertura**.

#### 6.3.1 Matriz de acessibilidade a definir

| Dimensão | Contrato-alvo | Como se prova |
|---|---|---|
| **TalkBack** (Android) | Toda superfície do inventário navegável e anunciada com contexto utilizável | Vídeo de passagem por superfície |
| **VoiceOver** (iOS) | Idem | Vídeo de passagem por superfície |
| **`fontScale` 1.3** | Nenhum texto truncado, sobreposto ou cortado nos componentes-base e no shell | Print por superfície com a escala ativa |
| **Alvos de toque** | Mínimo 44×44 pt nos controles do shell | Inspeção + print |
| **Ordem de leitura** | Segue a ordem visual; sem saltos | Vídeo de passagem |
| **Rótulos** | Todo controle interativo tem rótulo textual não redundante | Passagem + gate estrutural |
| **Roles** | `button`, `header`, `image`, `tab`, `link` corretos | Passagem + gate estrutural |
| **States** | `selected` nas abas, `disabled` onde aplicável, `busy` em carregamento | Passagem |
| **Modais** | `accessibilityViewIsModal` em todo modal; foco preso; escape anunciado | Passagem |
| **Anúncios** | `announceForAccessibility` em transições que mudam contexto sem mudar tela | Passagem |

#### 6.3.2 🔵 Recorte de P-28 — o que fecha agora e o que fica como resíduo (autorização §13)

A matriz (`:536`) registra: **"0 `accessibilityRole` em Cultinho, Meu Momento e Livrinho"** e
**"Depende de 10 e 12B para as 3 telas zeradas"**.

| | Conteúdo | Fase proprietária |
|---|---|---|
| **CORRIGIDO AGORA (Fase 6)** | Parcela **sistêmica**: componentes-base emitindo semântica; shell (abas, sidebar, cabeçalhos); modais compartilhados; anúncios de transição; `fontScale`; alvos de toque — sobre **todo o inventário nominal de §15** | **Fase 6** |
| **RESÍDUO ATRIBUÍDO** | Passagem completa com leitor de tela nas **3 telas zeradas** — **Cultinho em Casa**, **Meu Momento** e **Livrinho** — na parte que depende do conteúdo e da estrutura dessas telas | **Fases 10 e 12B**, pela própria linha P-28 da matriz |
| **NÃO PUXADO** | `P-66` e `P-79`, citados pela matriz como "mesmo bloco de correção" de P-28/P-104, **não** estão entre os nove P da Fase 6 e **não** entram | fase própria, fora do escopo |

**Qual evidência permite considerar a parcela da Fase 6 encerrada sem mentir que o risco global
desapareceu** (exigência literal da autorização §13):

1. Gate estrutural verde: todo componente-base do inventário emite papel + rótulo + estado.
2. Passagem com TalkBack **e** VoiceOver em 100 % do inventário nominal de §15 — **incluindo** as
   três telas zeradas na parcela que o shell controla (cabeçalho, saída, foco de modal, ordem de
   leitura do casco).
3. Print com `fontScale` 1.3 em 100 % do inventário.
4. **Declaração explícita, no relatório de fechamento da Fase 6**, de que P-28 **permanece
   `ABERTO` na matriz** com escopo reduzido e nominado às três telas, atribuído às Fases 10 e 12B.

> A Fase 6 **não** fecha P-28. Fecha **a parcela sistêmica de P-28**, e o relatório precisa dizer
> isso com essas palavras.

---

### 6.4 B2′ — Reduce motion e hápticos (P-104)

**Estado auditado.** 12 arquivos consomem `expo-haptics`:
`Coloring60CompletionOverlay`, `BotaoPrimario`, `usePuzzleController`, `AtelierCanvasScreen`,
`CadeAOvelhinhaScreen`, `MonteACenaDifficultyScreen`, `MonteACenaGameScreen`,
`MonteACenaSpikeScreen`, `MonteACenaTableGameScreen`, `OnboardingScreen`, `ParesDoBeniScreen`,
`PuzzleGestureLabScreen`.

**Único consumidor de `AccessibilityInfo.isReduceMotionEnabled`:**
`Coloring60CompletionOverlay.js:255-273` — que já implementa o padrão correto, inclusive tratando
a **assincronia** da consulta (o hook expõe `ready` para não animar antes de saber).

A matriz (P-104) registra "três telas vibram sem consultar a preferência e duas leem a preferência
sem aplicar". **A identificação nominal dessas 3+2 telas não é recuperável da linha visível da
matriz** e será extraída na Etapa 5 a partir do conjunto de 12 candidatos acima.
**NÃO DETERMINADO nesta rodada** — e deliberadamente não inventado.

**Arquitetura proposta:** extrair o padrão já validado em `Coloring60CompletionOverlay` para um
hook compartilhado (`useReduceMotion`) e um utilitário de háptico que consulta a preferência antes
de vibrar. **Nenhuma dependência nova** — `expo-haptics` e `AccessibilityInfo` já estão no projeto.
Vários dos 12 consumidores são telas **dev-gated** (Monte a Cena, PuzzleGestureLab); o plano
prioriza os consumidores **alcançáveis pela criança em produção** e declara os dev-gated como
cobertura de segunda ordem.

---

### 6.5 B5 — Estados de card e o azul premium

#### 6.5.1 Decisão de produto (fechada, não reaberta)

Grátis **verde suave** · Plano Família **azul premium mais luminoso e acolhedor** · Concluída
**dourado** · roxo **aposentado** · **cor nunca comunica estado sozinha** (sempre acompanhada de
chip, selo, ícone ou tratamento).

#### 6.5.2 🎨 Token recomendado para o azul premium

**Recomendação: `color.night400 = #3E5C96`**, um **degrau novo da rampa `night` já existente**
(`night800 #1C2B52` · `night600 #2E4370` · **`night400 #3E5C96`** · `night...`).

> ✅ **CONFIRMADO NO PORTÃO HUMANO 2 (2026-08-07).** O fundador declarou `night400 = #3E5C96`
> **aprovado para seguir como candidato de implementação**. A validação física do caráter
> "acolhedor e infantil" (critério **B3** da tabela abaixo) fica **diferida para a etapa física**
> (F-SEAL, em B7) e **não bloqueia Tasks nem Analyze**. Se a implementação revelar problema
> **objetivo** de contraste ou legibilidade, a correção é técnica **dentro da banda aprovada** —
> só se retorna ao fundador diante de mudança material de produto.

> Isto **não** cria paleta paralela (proibição da autorização §6): é derivação coerente **dentro
> da família de cor que os tokens já declaram**, exatamente o que a autorização autoriza
> ("derive tokens relacionados... de forma coerente se necessário").

**Verificação contra a banda de aceitação objetiva §15.1 da Spec:**

| # | Critério da banda | Medição de `#3E5C96` | Veredito |
|---|---|---|---|
| **B1** | Matiz inequivocamente azul (200°–255°) | **H = 219,5°** | ✅ |
| **B2** | Estritamente mais luminoso que `#1C2B52` | L = **0,1065** vs 0,0258 → **4,12× mais luminoso** | ✅ |
| **B3** | Aparência acolhedora e infantil, não corporativa nem neon | Azul médio, saturação moderada (S≈41 %), sem brilho de tela | ⚠️ **qualitativo — exige validação física** |
| **B4** | Contraste ≥ 4,5:1 sobre `seal.premium.bg` `#E5EAF4` | **5,56:1** | ✅ |
| **B5** | Legibilidade de texto e ícone | 5,56:1 sobre o selo · **6,34:1** sobre `paper50 #FDF8EE` | ✅ (AA para texto normal) |
| **B6** | Distinção inequívoca do verde de Grátis `#2E6B33` (H = 124,9°) | **Δ matiz = 94,6°** | ✅ |
| **B7** | Distinção inequívoca do dourado de Concluída `#8F6A1E` (H = 40,4°) | **Δ matiz = 179,1°** (quase complementar) | ✅ |
| — | Compatibilidade com "O Livro Vivo" (papel quente `#FDF8EE`/`#F8F0DC`) | É o contraponto "noite" que a paleta já declara; contraste 6,34:1 sobre papel | ✅ |

**Método:** luminância relativa WCAG 2.1 (sRGB linearizado, coeficientes 0,2126/0,7152/0,0722);
matiz em HSL. Cálculo manual auditado — **nenhum gerador foi executado**.

**Aplicação proposta em `tokens.js`:**

```js
// rampa night — degrau novo, derivado, não paralelo
night800: '#1C2B52',  // inalterado
night600: '#2E4370',  // inalterado
night400: '#3E5C96',  // NOVO — azul premium (Fase 6)

seal.premium: { bg: '#E5EAF4', border: '#A9BAD9', text: color.night400 }  // era color.night800
```

`bg` e `border` **permanecem inalterados**: já foram escolhidos para a família e continuam
harmônicos com o degrau mais claro; alterá-los ampliaria a superfície de regressão sem ganho.

**Alternativa conservadora, se o fundador achar `#3E5C96` claro demais:** `color.night600 #2E4370`
(já existente, H = 220,9°, contraste **8,09:1**, luminância 2,23× a de `night800`). Satisfaz toda a
banda **exceto** que o ganho de "luminoso e acolhedor" é modesto. O plano **recomenda `#3E5C96`**;
`#2E4370` é o fallback de menor risco visual.

**Modo escuro:** o app declara `userInterfaceStyle: "light"` (`app.json:8`). **Não há variante
escura a derivar.** Se isso mudar, é feature própria.

#### 6.5.3 ⚠️ Impacto obrigatório no gate duro de CI

`scripts/smoke.js:23597-23606` contém o gate **A0.7 (tokens)**, que exige literalmente:

```js
/night800/.test(premiumLine) && !/ink900|terra|#3E2E1B/.test(premiumLine)
```

**Trocar `night800` por `night400` na linha do premium FAZ ESTE GATE FALHAR.** Isto não é efeito
colateral imprevisto: é a consequência esperada de `D-SELOS-ESTADO-V2` superseder `A0.7`.

**Ação planejada:** o gate é **atualizado no mesmo bloco B5**, para asseverar o novo contrato —
premium = azul da rampa `night`, mais luminoso que `night800`, sem roxo/lilás/marrom; Grátis verde
`#2E6B33` preservado; Concluída dourada `border: color.gold500` preservada. As asserções negativas
existentes (`!/#5B3E9C/`, `!/#B79CE2/`, `!/#EFE6FA/` — os roxos aposentados) são **mantidas**.
Alterar `scripts/smoke.js` está fora do congelamento de runtime **porque smoke não é runtime**, e
está autorizado como parte do bloco de implementação (não desta rodada de Plan).

#### 6.5.4 D-STATUS-CARDS — mapeamento por natureza, não por HEX

> **"Não faça substituição cega baseada apenas em HEX"** (autorização §20). O plano classifica
> **cada superfície de cor condicional** por natureza antes de decidir qualquer troca:

| Classe | Definição | Tratamento |
|---|---|---|
| **1 · É status** | A cor comunica estado de acesso/progresso (Grátis / Plano Família / Concluída) | **Migra** para `tokens.seal` + chip/selo/ícone. Nunca cor sozinha |
| **2 · É recompensa** | Celebração, conquista, estrelinha | **Preserva.** Recompensa não é status; o dourado aqui é semântica própria |
| **3 · É conteúdo infantil** | Arte, ilustração, mascote, cena | **Intocado.** Área protegida |
| **4 · É decoração** | Gradiente, fundo, textura sem carga semântica | **Preserva**, salvo se for roxo aposentado em superfície de abertura |
| **5 · É cor funcional não-status** | Erro, aviso, seleção, foco, destaque de UI | **Preserva.** Migra para `semantic.*` se já houver token |

**Superfícies roxas `#7C3AED` auditadas** (o roxo é o caso mais denso e o mais sensível):

| Arquivo | Linha(s) | Classe provável | Destino |
|---|---|---|---|
| `app.json` | 14 (`splash.backgroundColor`) | superfície de **abertura** | **B4** — dentro de RF-B2 |
| `app.json` | 41 (`androidStatusBar`) | superfície de **abertura** | **B4** — dentro de RF-B2 |
| `app.json` | 48 (`android.adaptiveIcon.backgroundColor`) | **cor aposentada em configuração nativa** | **B4** — dentro de `RF-B8` (**emenda vinculante do Portão 2** — ver §16) |
| `src/components/premium/LockedStoryFallback.js` | 32, 102, 122, 127 | **1 · status** (bloqueio/premium) | migra em B5 |
| `src/components/story/MagicBookEntrance.js` | 93 | 4 · decoração de transição | avaliar em B5 |
| `src/data/achievements.js` | 29, 360, 371, 415, 483 | **2 · recompensa** | **preserva** |
| `src/screens/BrincarScreen.js` | 76 | 4 · decoração de categoria | avaliar em B5 |
| `src/screens/CadeAOvelhinhaScreen.js` | 1444 | ferramenta de **debug** (hitbox) | **preserva** |
| `src/screens/CadeAOvelhinhaScreen.js` | 1916 | 5 · seleção de UI | preserva/migra a `semantic` |
| `src/screens/CongratsScreen.js` | 608, 618, 630, 637 | **1 · status** (badge de bloqueio) | migra em B5 |

**Gate futuro (exigência da autorização §20):** o gate deve **detectar paleta paralela de status
sem proibir cor legítima em arte e conteúdo**. Desenho proposto: o gate **não** varre HEX no
repositório inteiro. Ele varre **apenas os arquivos do inventário de superfícies de status**
(classe 1) e assevera que **nenhum deles declara HEX literal de estado** — todos consomem
`tokens.seal`. Arte, `achievements.js`, decoração e debug ficam **fora do alcance do gate por
construção**, não por lista de exceções.

---

### 6.6 B4 — Splash e abertura reais

#### 6.6.1 O defeito concreto

A abertura atravessa **três cores distintas** em sequência:

```text
#7C3AED (roxo, splash nativo)  →  #FFF8F0 (creme A, porta de fontes)  →  #FFF8EF (creme B, SplashScreen)
     app.json:14                        App.js:110                         SplashScreen.js:121
```

A segunda transição (`#FFF8F0` → `#FFF8EF`) é imperceptível (1 unidade em azul). **A primeira é
violenta** — roxo saturado para creme. É ela que quebra RF-B1/RF-B2.

#### 6.6.2 🔀 Comparação das três alternativas (15 eixos)

- **A** — manter a arquitetura atual (3 camadas), corrigindo **cor** e **handoff**.
- **B** — controlar explicitamente o splash nativo com `expo-splash-screen`
  (`preventAutoHideAsync` / `hideAsync`).
- **C** — **absorver a porta de fontes dentro da `SplashScreen` React**, eliminando o terceiro
  estado visual (3 camadas → 2), + a correção de cor de A.

| # | Eixo | **A — manter e recolorir** | **B — controlar splash nativo** | **C — absorver a porta de fontes** |
|---|---|---|---|---|
| 1 | **Vantagem** | Mudança mínima; nada estrutural muda | Elimina por completo a incerteza de "quando o splash nativo sai"; handoff determinístico | Elimina a **causa** do terceiro estado, não só a cor; a abertura passa a ter 2 estados |
| 2 | **Desvantagem** | Continua havendo 3 estados visuais; a continuidade depende de 3 valores manterem-se iguais para sempre | **Dependência nova + plugin nativo**; introduz o risco clássico de "splash que nunca esconde" se uma exceção escapar | `SplashScreen.js` **usa `FredokaOne` e `Nunito`** (`:132`, `:139`) — precisa renderizar sem fonte durante a janela de carregamento |
| 3 | **Risco de flicker** | **Médio.** Some a discontinuidade de cor; permanecem 2 remontagens de árvore | **Baixo.** É o que a API existe para resolver | **Baixo.** Uma remontagem a menos e cor única |
| 4 | **Tempo até 1º frame útil** | Inalterado | **Potencialmente maior** — o nativo fica visível até o React pintar | Inalterado ou levemente menor (um commit a menos) |
| 5 | **Resiliência a falha de fonte** | Inalterada (a porta já degrada para o tipo do sistema) | Inalterada | **Exige cuidado**: o texto do splash cairia no tipo do sistema durante a janela — visível ao usuário |
| 6 | **Impacto em `FONT_TIMEOUT_MS = 1500`** | **Nenhum** | **Nenhum** | **Nenhum** — o teto e a lógica de `isWaitingForFonts` permanecem; muda só **o que é renderizado** enquanto se espera |
| 7 | **Risco de regressão de `D-LP-FECHAMENTO`** | **Muito baixo** — nada de lógica muda | **Médio** — insere um passo novo no caminho crítico do boot | **Baixo-médio** — não altera `bootRoute`, `DECISION_CEILING_MS` nem `canNavigate`, mas mexe no ponto de montagem |
| 8 | **Efeito em iOS** | Cor do LaunchScreen recompilada | Requer o plugin no prebuild; comportamento bem suportado | Nenhum efeito nativo além da cor |
| 9 | **Efeito em Android** | Cor + `androidStatusBar` recompilados; atenção a `edgeToEdgeEnabled: true` | Idem A, mais o plugin | Idem A |
| 10 | **Dependência nova** | **Não** | **SIM — `expo-splash-screen` NÃO está em `package.json`** | **Não** |
| 11 | **Plugin nativo** | Não | **Sim** (config plugin) | Não |
| 12 | **Mudança em `app.json`** | Sim — 2 valores de cor | Sim — 2 cores **+ entrada em `plugins`** | Sim — 2 valores de cor |
| 13 | **Necessidade de binário novo** | **Sim** (cor nativa é compilada) | **Sim** | **Sim** |
| 14 | **Complexidade** | **Baixa** | **Alta** | **Média** |
| 15 | **Rollback** | Trivial (reverter 2 cores) | **Caro** — exige desinstalar dependência, remover plugin e **rebuildar** | Simples — reverter o retorno condicional de `App.js` e a cor |

#### 6.6.3 ✅ Alternativa recomendada: **C**, com a correção de cor de **A**

**Justificativa.**

1. **B é eliminada por regra constitucional antes de ser eliminada por técnica.**
   `expo-splash-screen` **não é dependência declarada** (verificado em `package.json`). O Princípio I
   da Constituição proíbe dependência nova sem aprovação prévia explícita, e a autorização §7 diz
   que **escolhas meramente técnicas pertencem ao Plan**. Adotar B exigiria dependência + plugin
   nativo + entrada em `plugins` do `app.json` — e entregaria, sobre a alternativa C, um ganho
   marginal: C já elimina a descontinuidade de cor **e** um dos estados.
2. **A resolve o sintoma; C resolve a causa.** A mantém três estados visuais cuja continuidade
   depende de três valores de cor permanecerem iguais indefinidamente — um contrato frágil que
   nenhum gate atual protege. C **remove um dos estados**, e o que sobra é estruturalmente contínuo.
3. **C preserva integralmente o contrato de carregamento congelado.** `FONT_TIMEOUT_MS`,
   `isWaitingForFonts`, `fontGateDoneRef`, `markOnce('font_gate_*')`, `DECISION_CEILING_MS`,
   `resolveBootRoute`, `canNavigate` e a política de degradação para o tipo do sistema
   **permanecem exatamente como estão**. C muda **o que é pintado** durante a espera, não **quanto
   se espera nem como se decide**.

**A ressalva honesta de C** (eixo 5 da tabela): `SplashScreen.js` usa `FredokaOne` e `Nunito`. Se a
`SplashScreen` for pintada antes das fontes chegarem, seu texto aparece em tipo do sistema e depois
"salta" para a fonte correta — trocando um flicker de **fundo** por um flicker de **tipografia**.
**Mitigação planejada:** durante a janela de espera, a `SplashScreen` renderiza apenas o **fundo e
o mascote** (`BeniAvatar`, que é imagem, não texto); o par título/subtítulo entra com a mesma
animação `FADE_MS = 800` **após** o gate de fontes terminar. Assim não há salto de tipo, o fundo é
único do primeiro ao último frame, e a animação aprovada é preservada.

**Superfícies de abertura tocadas (o conjunto delimitado de RF-B2):**

| Superfície | Origem | Ação |
|---|---|---|
| Fundo do splash nativo | `app.json:14` `#7C3AED` | recolorir para a cor de abertura |
| Barra de status na abertura | `app.json:41` `#7C3AED` | recolorir + revisar `barStyle` |
| Fundo da porta de fontes | `App.js:110` `#FFF8F0` | **deixa de existir como estado próprio** |
| Fundo da `SplashScreen` | `SplashScreen.js:121` `colors.background` | migra para `tokens.js` |

**A cor de abertura** deriva do sistema visual oficial (`tokens.color.paper*`), **não** é inventada
aqui, e é fixada no bloco B5 antes de B4 — motivo adicional para B5 preceder B4 na ordem de §4.3.

#### 6.6.4 ⚠️ Emenda vinculante do Portão Humano 2 — correção restrita do adaptive icon

O fundador decidiu, na aprovação do Portão Humano 2 (2026-08-07), que o `#7C3AED` usado como
`android.adaptiveIcon.backgroundColor` (`app.json:48`) **também é corrigido na Fase 6**. A decisão
**supera parcialmente C18** — não porque o ícone tenha virado "superfície de abertura" (não virou;
RF-B2 continua delimitado às quatro camadas renderizadas da tabela acima), mas porque o ícone entra
por um **eixo diferente**: **cor aposentada em configuração nativa**. O requisito correspondente é
**`RF-B8`**, separado de RF-B2 justamente para preservar o caráter binário deste.

**Motivação registrada pelo fundador:** o roxo foi formalmente aposentado; o `app.json` já será
alterado em B4; a correção pega carona no mesmo ciclo de build que B4 já torna obrigatório; e não
há justificativa para manter uma cor explicitamente aposentada numa configuração nativa conhecida.

**Escopo — o que entra:**

| Entra | Não entra |
|---|---|
| O **valor configurável** `android.adaptiveIcon.backgroundColor` em `app.json:48` | Redesenhar `assets/icon.png` ou `assets/adaptive-icon.png` |
| A escolha da cor substituta dentro da paleta canônica | Alterar a identidade gráfica do ícone |
| A validação visual do lançador (F12 / F-ICON) | Criar novo conceito de marca |
| — | Entregas de App Store / Play Store ou trabalho de *branding* |

**Critérios declarados para a cor substituta** (§3 da autorização — **não** é pergunta ao fundador;
a escolha é técnica e sai da paleta já existente):

1. **não** roxo;
2. compatível com "O Livro Vivo";
3. **não** criar token novo apenas para o ícone;
4. harmonizar com o *foreground* existente do ícone;
5. contraste visual adequado no lançador;
6. coerente com o novo splash;
7. **não** usar dourado como fundo principal — o dourado é recompensa, não cor estrutural;
8. **não** confundir com o azul premium do Plano Família (`night400 #3E5C96`).

**Momento da decisão exata:** a cor é concluída **durante a implementação de B4**, após inspeção
factual do *foreground* de `assets/icon.png` (cujo conteúdo cromático **não foi inspecionado** nesta
rodada). A validação estética ocorre depois, em aparelho físico (F12 / F-ICON, em B7).

**Custo de build:** **zero adicional.** A correção viaja no mesmo ciclo `preview` que B4 já exige
(§12) — cor nativa é compilada, e B4 já obriga binário novo.

**Proteção do escopo restrito:** ver **CN-3** (§10.3), reescrito por esta emenda para provar pela
negativa que os assets gráficos permaneceram byte-idênticos.

---

### 6.7 B6 — P-139 / E5.52: coletor de desempenho alcançável

#### 6.7.1 Estado auditado

`performanceTrace.js:44-52` só liga em `__DEV__` **ou** com `EXPO_PUBLIC_PTF_PERF_TRACE === '1'`.
**Nenhum** dos seis perfis do `eas.json` declara a chave. `scripts/perf-baseline-report.js` existe
(10.543 bytes, lê `[PTF_PERF_SAMPLE]`, reporta mediana e p90, omite a média de propósito) mas
**não tem entrada em `package.json`**.

#### 6.7.2 🎯 Escolha do perfil interno — comparação dos seis

| Perfil | `distribution` | JS | Avaliação | Veredito |
|---|---|---|---|---|
| `development` | internal | **dev** | `__DEV__` **já liga o coletor** — a flag seria redundante; e tempos em modo dev (Metro, bundle de desenvolvimento) **não são representativos** | ❌ redundante e não representativo |
| **`preview`** | **internal** | **release** | Perfil interno principal de QA; JS em release → **tempos representativos**; já carrega env de QA; é o binário da campanha física de B7 | ✅ **ESCOLHIDO** |
| `preview-criador` | internal | release | `extends: preview`; perfil de diagnóstico do Modo Criador. Bom candidato, mas escolhê-lo **separaria** a evidência de P-139 do binário de B7 → **+1 build** | ⭕ segunda opção |
| `production` | store | release | **PROIBIDO pela autorização §9** | ⛔ |
| `screenshot` | internal | release | Destinado a capturas de loja; sem `env`; conflitaria escopos | ❌ |
| `c60-pilot` | internal | release | Escopado ao piloto do Colorir 60; usá-lo para desempenho de boot confundiria escopos | ❌ |

**Perfil escolhido como fonte primária de evidência: `preview`.**

**Justificativa:** (1) é o único perfil interno que combina **JS em release** (tempos
representativos) com **uso já estabelecido para evidência interna**; (2) escolhê-lo faz o coletor
viajar **no mesmo binário** que carrega o splash novo de B4, satisfazendo diretamente a exigência de
minimizar builds da autorização §10; (3) `distribution: internal` mantém o artefato local, sem
qualquer superfície pública; (4) `production` permanece **intocado**; (5) o coletor não tem UI e só
emite linhas `[PTF_PERF_SAMPLE]` em console — **não pode contaminar a evidência visual de B7**.

> **NÃO DETERMINADO SEM EXECUÇÃO:** se a chave declarada em `preview` **propaga** para
> `preview-criador` via `extends` depende da semântica de merge de `env` do EAS, que **não foi
> verificada nesta sessão**. O fato de `preview-criador` **re-declarar explicitamente** todas as
> chaves de `preview` sugere que o autor original não confiou no merge. **Ação planejada:** declarar
> a chave em `preview` e verificar empiricamente na Etapa 7; se não propagar e a propagação for
> desejada, declará-la também em `preview-criador`. A escolha da **fonte primária** não muda.

#### 6.7.3 Escopo de B6 — o que é e o que não é

| A Fase 6 **FAZ** | A Fase 6 **NÃO FAZ** |
|---|---|
| Declara `EXPO_PUBLIC_PTF_PERF_TRACE: "1"` em `preview` | Coleta baseline oficial |
| Prova que o coletor é **alcançável** em build interno | Publica benchmark |
| Mantém o artefato **local** (log no dispositivo/console) | Declara meta de performance aprovada |
| Cria entrada npm para `scripts/perf-baseline-report.js` (ex.: `"perf:report"`) | Transforma o diagnóstico em analytics público |
| — | **Instrumenta superfícies além do boot** |

#### 6.7.4 ✅ Comprovação de que P-127 permanece na Fase 9

A matriz registra que "nenhuma superfície além do boot está instrumentada". **Isso é P-127 e não é
tocado.** A Fase 6 não adiciona **nenhuma** marca `mark()`/`markOnce()` nova, não instrumenta
nenhuma tela, não define métrica nova e não estabelece limiar. O `performanceTrace.js` é alterado
em **zero** linhas. A única mudança de B6 fora de documentação é: **uma chave em `eas.json` e uma
linha em `package.json`**. A distância entre "o coletor liga" (Fase 6) e "o que ele mede e contra
qual meta" (Fase 9 / P-127) é preservada por construção.

**Rastreabilidade E5.52:** a herança E5.52 é satisfeita pela combinação
**B4** (abertura mensurável e contínua, com as marcas de boot já existentes intactas) +
**B6** (o coletor dessas marcas passando a ser alcançável em build interno). Nenhuma das duas
declara meta.

---

### 6.8 B7 — Varredura visual e campanha de validação física

Ver §15 (inventário) e §14 (matriz física).

---

## 7. Arquivos Candidatos

> **"Candidatos" é literal:** a lista final sai da Etapa 5 (Tasks). Nenhum destes arquivos é
> alterado nesta rodada.

| Bloco | Arquivos candidatos |
|---|---|
| **B1** | `src/theme/tokens.js` · `src/theme/productTheme.js:107` · `src/components/layout/AppScreen.js` · `src/components/layout/CenteredContent.js` · `src/components/ui/ContentContainer.js` · `src/components/BeniGuideOverlay.js:79` · `src/navigation/AppNavigator.js:283` · 7 telas de §6.1.1 · `scripts/smoke.js` (gate novo) |
| **B3** | `src/navigation/AppNavigator.js` (`MainTabs`, `TabletLayout`, rotas `LumiMoment`/`StoryBook`) · `src/constants/routes.js` (sem trocar valores) · as 10 chamadas de §6.2.2 (normalização para `ROUTES.*`) · `scripts/smoke.js` (gate novo) |
| **B2** | `src/components/layout/AppScreen.js` · `src/components/ui/ContentContainer.js` · `src/components/ui/ModalPapel.js` · `src/components/ui/BotaoPrimario.js` · shell em `AppNavigator.js` · telas do inventário de §15 |
| **B2′** | novo `src/hooks/useReduceMotion.js` (extraído de `Coloring60CompletionOverlay.js:255-273`) · utilitário de háptico · subconjunto dos 12 consumidores de §6.4 |
| **B5** | `src/theme/tokens.js` (`night400`, `seal.premium`) · `src/components/story/StoryBookHero.js` · `src/components/premium/LockedStoryFallback.js` · `src/screens/CongratsScreen.js` · **`scripts/smoke.js:23597-23606` (gate A0.7 → D-SELOS-ESTADO-V2)** |
| **B4** | `App.js` (retorno condicional da porta de fontes) · `src/screens/SplashScreen.js` · `app.json` (linhas 14, 41 **e 48** — a 48 por `RF-B8`, emenda do Portão 2; **`assets/icon.png` e `assets/adaptive-icon.png` NÃO são tocados**) |
| **B6** | `eas.json` (perfil `preview`) · `package.json` (script `perf:report`) — **`src/services/performanceTrace.js` INTOCADO** |
| **B7** | Nenhum arquivo de código. Produz evidência |

---

## 8. Interfaces Afetadas

| Interface | Contrato atual | Mudança | Compatibilidade |
|---|---|---|---|
| `tokens.breakpoints` | `{ phone: 0, tablet: 600, tabletL: 900 }` | **Nenhuma mudança de valor** — ganha consumidores | ✅ aditiva |
| `tokens.color` | rampa `night` com 2 degraus | **+ `night400`** | ✅ aditiva |
| `tokens.seal.premium` | `text: color.night800` | `text: color.night400` | ⚠️ **quebra o gate A0.7 do smoke** — atualizado em B5 |
| `AppScreen` (props) | 7 props, sem consumidor | Mantidas; `backgroundColor` passa a cair em `tokens`, não `productTheme` | ⚠️ muda o padrão — sem consumidor, impacto zero |
| `navigation` em tablet | `route` **fabricado** por `TabletLayout` | `route` **real** do Tab.Navigator | ⚠️ **mudança de contrato** — é a correção de P-31/P-47 |
| `ROUTES.*` | 40+ constantes | **Nenhum valor alterado** (o arquivo declara que valores são contrato) | ✅ |
| `isPerformanceTraceEnabled()` | `__DEV__ \|\| env === '1'` | **Inalterada** | ✅ |
| Contrato de carregamento | `FONT_TIMEOUT_MS`, `DECISION_CEILING_MS`, `BOOT_FALLBACK_ROUTE`, `MAX_NAV_ATTEMPTS`, `NAV_RETRY_MS` | **Inalterado** | ✅ **congelado de propósito** |
| Persistência | AsyncStorage / file-system | **Não tocada** | ✅ |
| `accessControl`, paywall, progresso, conquistas, manifestos | — | **Não tocados** | ✅ |

---

## 9. Estratégia de Migração

| Princípio | Aplicação |
|---|---|
| **Aditivo antes de subtrativo** | `night400` é adicionado antes de `seal.premium` mudar; `tokens.breakpoints` ganha consumidores antes de `productTheme.tabletBreakpoint` ser aposentado |
| **Um consumidor por vez** | A migração de `768` é feita arquivo a arquivo, cada um verificável isoladamente |
| **Gate que trava o retrocesso** | Cada migração concluída ganha um gate no smoke que impede o padrão antigo de voltar |
| **Estrutura antes de anotação** | B3 (estrutura do shell) antes de B2 (semântica) — ver §4.2 |
| **Tema concorrente aposentado por consumo, não por deleção** | `theme.js` tem **0 consumidores** e é código morto candidato à remoção; `productTheme` (75 consumidores) e `colors` (23) **NÃO são removidos nesta fase** — a Fase 6 apenas para de **acrescentar** consumidores e migra os arquivos que toca |

> **Delimitação explícita:** a Fase 6 **não** migra os 75 consumidores de `productTheme`. Isso seria
> refatoração ampla sobre o design system (área protegida) e violaria o Princípio IV
> ("medir antes de refatorações amplas"). A fase migra **os arquivos que já precisa tocar** pelos
> nove P, e deixa o restante como resíduo **explicitamente atribuído**.

---

## 10. Estratégia de Testes

### 10.1 Pirâmide de validação por bloco

| Bloco | Smoke completo | Testes focados | **Controles negativos** | expo-doctor | Estruturais | Navegação | A11y | Responsividade | Regressão | Física |
|---|---|---|---|---|---|---|---|---|---|---|
| **B1** | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | ✅ (faixa 600–767) |
| **B3** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ (tablet) |
| **B2** | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ (TalkBack + VoiceOver) |
| **B2′** | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | ✅ | ✅ (preferência alternada) |
| **B5** | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ (contraste) | — | ✅ | ✅ |
| **B4** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (boot) | — | — | ✅ **(D-LP-FECHAMENTO)** | ✅ **obrigatória** |
| **B6** | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ (log real) |
| **B7** | ✅ | — | — | ✅ | — | — | — | — | — | ✅ **campanha completa** |

### 10.2 Testes estruturais propostos (gates no smoke)

| Gate | Assevera | Bloco |
|---|---|---|
| **G-BP-1** | Nenhum arquivo de `src/` compara largura contra `768` literal | B1 |
| **G-BP-2** | `productTheme` não declara mais `tabletBreakpoint` | B1 |
| **G-SAFE** | Nenhuma tela do inventário chama `useSafeAreaInsets` diretamente | B1 |
| **G-NAV-1** | `TabletLayout` não fabrica objeto `route` | B3 |
| **G-NAV-2** | Toda `navigate` para nome de aba usa `ROUTES.*` | B3 |
| **G-A11Y-1** | Todo componente-base emite `accessibilityRole` e `accessibilityLabel` | B2 |
| **G-A11Y-2** | Todo modal compartilhado declara `accessibilityViewIsModal` | B2 |
| **G-MOTION** | Todo ponto de háptico alcançável em produção consulta a preferência | B2′ |
| **G-SEAL** (substitui A0.7) | premium = azul da rampa `night` mais luminoso que `night800`; Grátis `#2E6B33`; Concluída `gold500`; roxos aposentados ausentes | B5 |
| **G-STATUS** | Nenhum arquivo do inventário de status declara HEX literal de estado | B5 |
| **G-SPLASH** | As superfícies de abertura de RF-B2 declaram a **mesma** cor | B4 |
| **G-ICON** *(acrescido pela emenda do Portão 2)* | `android.adaptiveIcon.backgroundColor` **não** é `#7C3AED` nem qualquer roxo aposentado, e o valor pertence à paleta canônica | B4 |
| **G-PERF** | `eas.json` declara `EXPO_PUBLIC_PTF_PERF_TRACE` em ao menos um perfil interno e **em nenhum** perfil `production` | B6 |

### 10.3 🔻 Controles negativos

> **"Não invente testes de pouco valor" (autorização §21).** Cada controle abaixo existe para
> provar que uma correção **não** virou um efeito colateral silencioso.

| # | Controle negativo | Prova que |
|---|---|---|
| **CN-1** | Abaixo de `breakpoints.tablet`, o shell **NÃO** apresenta layout de tablet | A migração de 768→600 não vazou para telefone |
| **CN-2** | Com `production` selecionado, `isPerformanceTraceEnabled()` retorna **falso** | O coletor **não** vazou para produção |
| **CN-3** *(reescrito pela emenda do Portão 2)* | `assets/icon.png` e `assets/adaptive-icon.png` permanecem **byte-idênticos** aos de `015c438`, e nenhum token novo foi criado apenas para o ícone | A correção de `adaptiveIcon.backgroundColor` ficou restrita ao **valor de configuração** — não houve redesenho de asset, nem alteração de identidade de marca, nem paleta paralela (`RF-B8`) |
| **CN-4** | Com a fonte falhando deliberadamente, o app **abre mesmo assim** em ≤ `FONT_TIMEOUT_MS` + margem, **sem spinner eterno** | `D-LP-FECHAMENTO` intacto após B4 |
| **CN-5** | Com reduce motion **desligado**, os hápticos **continuam** ocorrendo | B2′ não desativou háptico para todo mundo |
| **CN-6** | As cores de **recompensa** (`achievements.js`) **permanecem** inalteradas | D-STATUS-CARDS não fez substituição cega por HEX |
| **CN-7** | Nenhuma marca de performance nova aparece fora do boot | P-127 **não** foi antecipado |
| **CN-8** | Os valores de `ROUTES.*` são **byte-idênticos** aos de `015c438` | O histórico de navegação não foi quebrado |

### 10.4 Regressões explicitamente protegidas (contrato, não reabertura)

> A autorização §8 é literal: **loading/performance NÃO é reaberto**. A trilha entra aqui
> **exclusivamente como contrato de regressão**. Se um teste revelar regressão real durante a
> implementação, isso é **defeito da Fase 6**, não reabertura da trilha antiga.

| Item congelado | Contrato a preservar | Onde é verificado |
|---|---|---|
| Spinner eterno por falha de fonte | Nunca ocorre; o app abre no teto | CN-4 |
| Saída da splash governada por relógio | A saída é **por prontidão**; `DECISION_CEILING_MS` é **teto de segurança, não piso** | Teste focado de B4 |
| Prewarm indevido das poses C60 | Nenhum prewarm novo é introduzido | Revisão de B4 |
| Runtime de packs | `PacksProvider` intocado | Diff de B4 |
| `D-LP-FECHAMENTO` | Todo o contrato de boot | CN-4 + regressão de B4 |

---

## 11. Rollback

| Bloco | Estratégia | Custo | Requer build? |
|---|---|---|---|
| **B1** | Reverter por arquivo (migração é 1:1 por consumidor) | Baixo | Não |
| **B3** | Reverter o commit do shell; `TabletLayout` volta à forma atual | **Médio** — é o bloco mais estrutural | Não |
| **B2** | Reverter por superfície; anotações são aditivas | Baixo | Não |
| **B2′** | Reverter o hook; hápticos voltam ao comportamento atual | Baixo | Não |
| **B5** | Reverter `seal.premium.text` para `color.night800` e o gate A0.7 | **Trivial — 2 linhas** | Não |
| **B4** | Reverter 2 cores em `app.json` + o retorno condicional de `App.js` | Baixo em código, **alto em ciclo** | **Sim** |
| **B6** | Remover a chave de `eas.json` e o script de `package.json` | **Trivial — 2 linhas** | **Sim** (para o binário) |

**Rollback global:** a base executável `015c438` está preservada e o worktree está isolado.
`git revert` por bloco é viável porque cada bloco é um commit atômico (Etapa SDD 9).
**O ponto de não-retorno barato é B4**: depois dele, qualquer reversão de abertura exige um ciclo
de build novo.

---

## 12. Estratégia de Builds

### 12.1 ⚠️ Estado dos builds existentes — NÃO RECUPERADO

> **Autorização §11, cumprida literalmente.** O histórico remoto do EAS **não foi consultado** nesta
> abertura nem nesta rodada de Plan. Portanto, o estado dos builds existentes é
> **NÃO RECUPERADO** — e ausência de consulta **não** é prova de ausência de build.
>
> **Ausência de alteração em `app.json`/`eas.json` desde `015c438` NÃO é deduzida como "existe um
> build compatível".**

**Verificação V0 — a executar ANTES de B1, na Etapa 7 (não agora):**

| # | O que verificar | Como |
|---|---|---|
| V0.1 | Que builds existem | `eas build:list` |
| V0.2 | Commit de cada build | metadados do EAS |
| V0.3 | Perfil de cada build | metadados do EAS |
| V0.4 | **Fingerprint** de cada build | comparar com o fingerprint do estado nativo atual |
| V0.5 | Compatibilidade com o estado nativo da Fase 6 | fingerprint idêntico ⇒ o Dev Client existente serve para B1–B5 |
| V0.6 | Expiração / disponibilidade do artefato | EAS expira artefatos; o link pode não existir mais |
| V0.7 | **Existe Dev Client instalável em um TABLET** | condição dura para B3 |

**Se V0 concluir que não há Dev Client válido para tablet, um build `development` é necessário
ANTES de B1.** Isso não é presumido aqui: é **condicional e declarado**.

### 12.2 Diferenciação dos quatro tipos de necessidade

| Necessidade | Quando | Perfil |
|---|---|---|
| **Dev Client para desenvolvimento JS** | B1, B3, B2, B2′, B5 — Metro serve o bundle; nenhuma mudança nativa | `development` **já existente**, se V0 validar |
| **Novo build `development`** | Só se V0 falhar, **ou** se for preciso desenvolver contra o estado nativo pós-B4 | `development` |
| **Evidência física final** | Após B4 + B6 | **`preview`** |
| **Build específico de P-139** | **Não necessário** — o coletor viaja no mesmo `preview` (ver §6.7.2) | — |
| **Build específico do adaptive icon (`RF-B8`)** | **Não necessário** — a cor nativa do ícone viaja no **mesmo `preview`** de B4, que já é obrigatório (ver §6.6.4) | — |

### 12.3 📦 Quantidade prevista de novos builds

| # | Build | Perfil | Condição | Conteúdo |
|---|---|---|---|---|
| **1** | **Obrigatório** | `preview` | sempre | **B4 (splash **+ adaptive icon, `RF-B8`**) + B6 (coletor) no MESMO ciclo** + todo o JS de B1–B5 |
| **2** | **Condicional** | `development` | só se **V0.7** falhar | Dev Client para o tablet |
| **3** | **Condicional** | `development` | só se o desenvolvimento pós-B4 exigir o estado nativo novo | Dev Client atualizado |

**Previsão: 1 build obrigatório; 2 possíveis; máximo 3 ciclos.**
Por plataforma, o build 1 deve cobrir **Android e iOS** (a matriz física exige `IOS` e `AND` para
P-27, P-28 e P-104). Total previsto de **binários**: 2 (obrigatórios) a 6 (pior caso).

**Como a minimização foi alcançada (autorização §10):** as alterações nativas/configuracionais de
**B4** (`app.json`) e de **B6** (`eas.json`) foram deliberadamente colocadas **adjacentes e no fim
da sequência**, e o perfil de B6 foi escolhido como `preview` **precisamente para ser o mesmo
binário** da campanha de B7. Se B6 tivesse ido para `preview-criador`, seriam **dois** builds de
evidência em vez de um.

### 12.4 Estratégia de Metro / Dev Client

| Etapa | Ferramenta |
|---|---|
| B1, B3, B2, B2′, B5 | **Metro + Dev Client** (`npm run start:dev`), iteração rápida, telefone **e** tablet |
| B4 | Parte JS via Metro; **a cor nativa só é observável em binário** |
| B6 | A flag **não** existe no Metro (`__DEV__` já liga o coletor); só observável em `preview` |
| B7 | **Exclusivamente binário `preview`.** Evidência de campanha não é colhida sobre Metro |

**Nada disto é executado nesta rodada.** Metro não foi aberto; nenhum build foi gerado.

---

## 13. 📱 Momento em que o Tablet Passa a Ser Obrigatório

**Resposta direta: o tablet físico é obrigatório a partir do FECHAMENTO DE B3** — o segundo bloco
da sequência, não o último.

**Por quê exatamente ali:** B3 corrige P-31 e P-47, defeitos que **só existem acima do breakpoint de
tablet**. `TabletLayout` fabrica `route`; a sidebar some em rotas raiz; não há `BackHandler`.
**Nenhum desses defeitos é observável em telefone.** Fechar B3 sem tablet significaria declarar
corrigido o que não foi visto.

**Por que não deixar para o fim (autorização §12, literal: "Evite deixar a aquisição para depois de
toda a implementação se isso puder descobrir regressões tarde demais"):** B2 anota semanticamente o
shell de B3; B5 aplica estados de card sobre o layout de B1/B3; B7 fotografa tudo. Se o shell de B3
estiver errado e isso só aparecer em B7, **quatro blocos** terão sido construídos sobre uma base
falsa. O custo de descobrir tarde é de quatro blocos; o de descobrir em B3 é de um.

**Portanto o tablet é necessário ANTES, em V0.7** (verificar que existe Dev Client instalável em
tablet) — que roda **antes de B1**. Se o tablet não estiver disponível em V0, **isso é bloqueio de
cronograma declarado**, não uma dívida a descobrir depois.

| Momento | Validação | Escopo |
|---|---|---|
| **V0.7** (antes de B1) | Disponibilidade do aparelho + Dev Client instalável | pré-requisito |
| **Fim de B1** | Intermediária — faixa 600–767 dp | comportamento novo do breakpoint |
| **Fim de B3** | **Intermediária DURA** — abas, sidebar, botão físico, rotas raiz, navegação aninhada | **P-31, P-47, P-20 (shell)** |
| **Fim de B2** | Intermediária — leitor de tela em tablet | P-27, P-28 |
| **Fim de B5** | Intermediária — grid e selos em largura de tablet | D-SELOS-ESTADO-V2 |
| **B7** | **FINAL — cobre P-20 e P-31 obrigatoriamente** | S1–S11, F1–F11 |

---

## 14. Matriz de Validação Física

| ID | Cenário | Aparelho | SO | Bloco | P coberto |
|---|---|---|---|---|---|
| **F-TAB-600** | Faixa 600–767 dp recebe layout de tablet; abaixo de 600 não | Tablet | AND | B1 | P-30 |
| **F-TAB-NAV** | As 10 navegações de §6.2.2 **trocam de aba de fato** | Tablet | AND + IOS | B3 | **P-31** |
| **F-TAB-BACK** | Botão físico de voltar tem comportamento correto no shell | Tablet | **AND** | B3 | P-31 |
| **F-TAB-SIDE** | Sidebar presente/ausente **por decisão declarada** em `LumiMoment` e `StoryBook` | Tablet | AND + IOS | B3 | **P-47** |
| **F-TAB-C60** | Módulos C60, Livrinho, Meu Momento e Cultinho em largura de tablet | Tablet | AND + IOS | B3/B7 | **P-20** |
| **F-A11Y-TB** | TalkBack: passagem completa pelo inventário | Telefone + Tablet | AND | B2 | P-28 |
| **F-A11Y-VO** | VoiceOver: passagem completa pelo inventário | Telefone + Tablet | IOS | B2 | P-28 |
| **F-A11Y-FS** | `fontScale` 1.3 sem truncar/sobrepor | Telefone + Tablet | AND + IOS | B2 | **P-27** |
| **F-A11Y-TG** | Alvos de toque ≥ 44 pt no shell | Telefone + Tablet | AND + IOS | B2 | P-28 |
| **F-MOTION-ON** | Reduce motion ligado ⇒ sem vibração e sem animação supérflua | Telefone | AND + IOS | B2′ | **P-104** |
| **F-MOTION-OFF** | Reduce motion desligado ⇒ háptico **preservado** (CN-5) | Telefone | AND + IOS | B2′ | P-104 |
| **F-SEAL** | Selos Grátis/Plano Família/Concluída distinguíveis; azul legível; **nunca só cor** | Telefone + Tablet | AND + IOS | B5 | D-SELOS-ESTADO-V2 |
| **F-OPEN-1** | Abertura **sem descontinuidade de cor** do 1º ao último frame | Telefone + Tablet | AND + IOS | B4 | RF-B1, RF-B2 |
| **F-OPEN-2** | Sem flicker, sem salto de tipografia, sem spinner eterno | Telefone | AND + IOS | B4 | RF-B3, CN-4 |
| **F-OPEN-3** | Fonte falhando ⇒ abre mesmo assim (`D-LP-FECHAMENTO`) | Telefone | AND | B4 | CN-4 |
| **F-PERF** | `preview` produz linhas `[PTF_PERF_SAMPLE]` agregáveis por `perf:report` | Telefone | AND | B6 | **P-139**, E5.52 |
| **F-ICON** *(invertido pela emenda do Portão 2)* | Ícone no lançador **sem roxo**, com contraste adequado, harmônico com o *foreground* existente e distinguível do azul premium; assets gráficos inalterados (CN-3) | **Telefone + Tablet** | AND | B4 → validado em B7 | **RF-B8** (F12 da Spec), §16 |

**Formato da evidência:** vídeo para navegação, leitor de tela, movimento e abertura; print para
`fontScale`, selos e varredura visual; log textual para F-PERF.

> **NÃO DETERMINADO SEM EXECUÇÃO FÍSICA:** todo veredito desta matriz. Nenhuma linha pode ser
> declarada verde por análise estática.

---

## 15. 🖼️ Inventário da Varredura Visual

> **"Evite transformar 'varredura visual' em reestruturação irrestrita de todas as 42 telas"**
> (autorização §18). O inventário é **delimitado por árbitro**, e o árbitro é declarado por linha.

`src/screens` contém **42 telas** (contagem verificada). A varredura da Fase 6 **não** cobre 42.

### 15.1 Regra de inclusão

Uma tela entra no inventário da Fase 6 se satisfizer **ao menos um**:

| Critério | Árbitro |
|---|---|
| **I1** — está no shell (é uma aba ou rota raiz alcançável do shell) | Eixo A da Spec |
| **I2** — é tocada por um dos nove P (aparece no mapa de §6.1.1, §6.2.2, §6.3.2 ou §6.4) | Matriz §14 |
| **I3** — expõe estado de card/selo (Grátis, Plano Família, Concluída) | D-STATUS-CARDS |
| **I4** — participa da abertura | Eixo B da Spec |

### 15.2 Regra de exclusão

| Critério | Árbitro |
|---|---|
| **E1** — tela **dev-gated** (só registrada sob `isInternalToolsEnabled` / Modo Criador) | `routes.js` — não alcançável pela criança |
| **E2** — tela cuja parcela pendente **depende das Fases 10 ou 12B** | linha **P-28** da matriz |
| **E3** — tela cujo conteúdo é área **congelada** (C60, histórias, manifestos) | Constituição, áreas protegidas |

**Excluídas por E1 (identificadas nominalmente em `routes.js`):** `PackSandboxDev`,
`Coloring60Lab`, `SceneValidation`, `OvelhaAssetGallery`, `MonteACenaSpike`,
`MonteACenaPrototype`, `MonteACenaLevels`, `MonteACenaGame`, `MonteACenaGameV2`,
`MonteACenaHome`, `MonteACenaDifficulty`, `MonteACenaGallery`, `MonteACenaStory`,
`PuzzleGestureLab`, `MonteACenaTableGame`, `CadeAOvelhinha`, `PalavrinhasDoBeni` —
**17 rotas dev-gated**, o que já reduz materialmente o alcance.

### 15.3 Componentes compartilhados que entram

`AppScreen` · `ContentContainer` · `CenteredContent` · `ModalPapel` · `BotaoPrimario` ·
`StoryBookHero` · `LockedStoryFallback` · `BeniGuideOverlay` · a `tabBar`/sidebar do shell.
**Racional:** corrigir o componente compartilhado corrige N telas de uma vez, e o gate estrutural
prova a correção sem depender de N prints.

### 15.4 Como se prova 100 % de cobertura

1. A lista nominal fechada é produzida na **Etapa 5 (Tasks)**, aplicando I1–I4 e E1–E3 às 42 telas,
   **uma a uma, com o árbitro citado por linha**.
2. Cada tela do inventário recebe **um print identificado** (nome da tela + aparelho + orientação).
3. **S3 só é declarado atingido quando a contagem de prints é igual à contagem do inventário** — a
   Spec já exige isso, e sem o inventário nominal S3 **não é binário**.
4. As telas **excluídas** são listadas nominalmente **com o árbitro da exclusão**. Uma tela sem
   veredito explícito — nem incluída nem excluída — **invalida a varredura**.

> **A produção da lista nominal fechada NÃO faz parte desta rodada.** Ela pertence à Etapa 5, e a
> regra acima é o que a torna determinística em vez de discricionária.

---

## 16. 🟣 Tratamento Explícito do Ícone / Adaptive Icon Roxo

> ⚠️ **SEÇÃO REESCRITA PELA EMENDA VINCULANTE 1 DO PORTÃO HUMANO 2 (2026-08-07).**
> A versão original desta seção registrava a superfície como **sem proprietário** e a levava ao
> Portão Humano 2 como pergunta genuína (AC-1). **O fundador respondeu**: a superfície passa a ter
> proprietário — **a própria Fase 6**, com escopo restrito. A pendência AC-1 está **encerrada**.

**A decisão do fundador, na íntegra do que ela decide:** o `#7C3AED` usado como
`android.adaptiveIcon.backgroundColor` **é corrigido na Fase 6**. Motivação registrada: o roxo foi
formalmente aposentado; o `app.json` já será alterado em B4; a correção pega carona no mesmo ciclo
de build já necessário; e não há justificativa para manter uma cor explicitamente aposentada numa
configuração nativa conhecida. **Essa decisão supera C18 na parte em que ela excluía integralmente
o adaptive icon da Fase 6.**

**Registro formal (atualizado):**

| Item | Valor |
|---|---|
| **Onde está** | `app.json:48` — `android.adaptiveIcon.backgroundColor: "#7C3AED"`; e `app.json:7` — `icon: "./assets/icon.png"` (o arquivo de imagem, cujo conteúdo cromático **não foi inspecionado** nesta rodada) |
| **Por qual eixo entra na Fase 6?** | **Não** pelo eixo "abertura" — o ícone continua **não** sendo superfície de abertura, e `RF-B2` permanece delimitado às quatro camadas renderizadas (§6.6.3). Entra pelo eixo **"cor aposentada em configuração nativa"**, com requisito próprio: **`RF-B8`** |
| **Proprietário** | ✅ **FASE 6**, por decisão explícita do fundador no Portão Humano 2. A atribuição **não** foi inferida pelo Plan — foi dada em documento |
| **Escopo autorizado** | **Somente o valor configurável** de `app.json:48`, substituído por cor **já pertencente à paleta canônica** (critérios em §6.6.4) |
| **Fora do escopo (inalterado)** | Redesenhar `assets/icon.png` ou `assets/adaptive-icon.png`; alterar a identidade gráfica; criar novo conceito de marca; entregas de App Store / Play Store; qualquer trabalho de *branding* |
| **Ação de implementação** | **B4** — junto de `app.json:14` e `app.json:41`, no mesmo ciclo de build |
| **Gate automático** | **G-ICON** (§10.2) |
| **Controle negativo** | **CN-3 reescrito** (§10.3) — prova pela negativa que os assets gráficos ficaram **byte-idênticos** e que nenhum token novo foi criado só para o ícone |
| **Validação física** | **F-ICON** (§14) + **F12** da Spec — print do lançador em telefone **e** tablet Android, em B7 |
| **Pendência** | ✅ **ENCERRADA.** A superfície roxa deixou de estar sem proprietário |

> A Fase 6 continua **não alterando o ícone por inferência** — ela o altera por **decisão explícita
> e delimitada do fundador**, e mantém o controle negativo que impede a decisão de crescer para
> redesenho de marca.

---

## 17. Rastreabilidade

### 17.1 Rastreabilidade com os nove P

| P | Descrição (matriz) | Bloco | Critério de aceite | Bloqueia lançamento? |
|---|---|---|---|---|
| **P-20** | C60/Livrinho/Meu Momento/Cultinho não consultam `isTablet` | **B3** + B7 | F-TAB-C60 | **PODE BLOQUEAR** |
| **P-27** | Tipografia e `fontScale` | **B2** | F-A11Y-FS | **PODE BLOQUEAR** |
| **P-28** | Semântica de a11y ausente | **B2** (parcela sistêmica) | F-A11Y-TB + F-A11Y-VO + G-A11Y-1/2 · **resíduo em Fases 10 e 12B** (§6.3.2) | **PODE BLOQUEAR** |
| **P-29** | `AppScreen` sem consumidor | **B1** | G-SAFE | NÃO bloqueia |
| **P-30** | `768` × `breakpoints.tablet = 600` | **B1** | G-BP-1 + G-BP-2 + F-TAB-600 | NÃO bloqueia |
| **P-31** | Navegações inefetivas em tablet | **B3** | G-NAV-1/2 + F-TAB-NAV + F-TAB-BACK · **divergência de contagem em §6.2.3** | **PODE BLOQUEAR** |
| **P-47** | `LumiMoment`/`StoryBook` como rotas raiz | **B3** | F-TAB-SIDE | NÃO bloqueia |
| **P-104** | Hápticos sem reduce motion | **B2′** | G-MOTION + F-MOTION-ON + F-MOTION-OFF | NÃO bloqueia |
| **P-139** | Coletor inalcançável | **B6** | G-PERF + F-PERF | NÃO bloqueia |

### 17.2 Rastreabilidade com E5.52

| Componente de E5.52 | Bloco | Evidência |
|---|---|---|
| Abertura contínua e mensurável | **B4** | F-OPEN-1/2/3 + marcas de boot preservadas |
| Coletor alcançável em perfil interno | **B6** | F-PERF + G-PERF |
| **Não** transformar em baseline/meta/analytics | **B6** | §6.7.3 + **CN-7** |

### 17.3 Rastreabilidade com R21 e com os critérios de saída

| Critério de saída (Spec §6.2) | Bloco que o entrega | Evidência |
|---|---|---|
| S1–S2 (shell e navegação) | B1, B3 | G-NAV-1/2, F-TAB-NAV, F-TAB-SIDE |
| **S3** (nenhuma paleta de status paralela) | B5 + B7 | **Inventário nominal de §15 com 100 % de prints** |
| S4–S6 (abertura) | B4 | F-OPEN-1/2/3, G-SPLASH |
| **`RF-B8`** (adaptive icon não roxo — **emenda do Portão 2**, fora dos critérios S1–S11 originais) | B4 + B7 | **G-ICON, CN-3 reescrito, F-ICON, F12** |
| S7–S9 (acessibilidade e responsividade) | B1, B2, B2′ | F-A11Y-*, F-MOTION-*, F-TAB-600 |
| S10–S11 (medição) | B6 | F-PERF, G-PERF |

**R21** (parcela da Fase 6) é coberta pelo conjunto B1+B3+B7, cuja revalidação a matriz agenda para
a revalidação **21**.

### 17.4 Rastreabilidade com a Spec — conflitos materiais encontrados

> **Autorização §2:** *"Se o Plan descobrir conflito material com a Spec, registre o conflito e
> volte ao artefato correspondente. Não resolva divergência alterando requisito por conta própria."*

**Nenhum conflito material com a Spec 021 foi encontrado.** A Spec **não foi alterada** por este
Plan. O único conflito de contagem encontrado é **com a matriz de riscos**, não com a Spec, e está
registrado em §6.2.3 sem edição do artefato proprietário.

> **Atualização de 2026-08-07 (emenda do Portão Humano 2).** A Spec **foi** alterada depois desta
> conclusão — mas **não** por decisão do Plan: por **emenda vinculante do fundador**, aplicando a
> Regra de Ouro (requisito alterado volta ao artefato). A Spec ganhou `RF-B8`, `T14`, `F12`, um
> controle negativo em §9.1, a supersessão parcial de **C18** e os itens **CHK039**/**CHK040**, com
> revalidação direcionada de **CHK004** e **CHK038** (resultado: 40/40). Este Plan foi então
> reconciliado nos pontos §6.6.4, §6.5.4, §7, §10.2 (**G-ICON**), §10.3 (**CN-3** reescrito), §14
> (**F-ICON** invertido), §16, §17.3, §19 e §22. A direção de causalidade permanece correta:
> **o requisito mudou primeiro na Spec, e o Plan seguiu.**

---

## 18. ✅ Constitution Check

**Constituição:** `.specify/memory/constitution.md`. Verificação **integral**, princípio a princípio
e restrição a restrição.

### 18.1 Core Principles

| Princípio | Exigência | Verificação | Veredito |
|---|---|---|---|
| **I — Stack Soberano** | Stack fixa Expo 54 / RN 0.81.5 / React 19.1.0 / New Arch | Nenhuma mudança de stack. Nenhuma API fora do SDK 54 | ✅ |
| **I — Dependências** | **Nenhuma lib nova sem aprovação prévia** | **ZERO dependências novas propostas.** A alternativa B do splash foi **rejeitada precisamente** por exigir `expo-splash-screen`, ausente de `package.json` | ✅ |
| **I — TypeScript** | Não migrar `.js`; não criar `tsconfig.json` | Nada é migrado; nenhum `tsconfig.json` é criado; nenhum módulo novo em TS | ✅ |
| **II — Local-first** | Persistência local defensiva | **Nenhuma alteração** em AsyncStorage, file-system ou schema | ✅ |
| **II — Separação de responsabilidades** | UI ↔ services ↔ context | Blocos tocam apenas UI/tema/navegação. `src/services/performanceTrace.js` **intocado**; nenhum serviço novo | ✅ |
| **II — Áreas sensíveis** | Paywall, progresso, conquistas, `accessControl`, manifestos, histórias, assets só com instrução direta | Nenhuma tocada. `achievements.js` **explicitamente preservado** (CN-6). `assets/` intocado | ✅ |
| **II — Sem alterações destrutivas** | Inspecionar antes; não apagar sem confirmação | O único candidato a remoção é `theme.js` (**0 consumidores**), e ele **NÃO é removido nesta fase** | ✅ |
| **III — Nomenclatura** | Código em inglês; docs e relatórios em PT-BR | Este Plan em PT-BR; identificadores propostos em inglês (`useReduceMotion`, `night400`) | ✅ |
| **III — Sem God Objects** | Responsabilidade única | B2 subdividido em B2/B2′ **exatamente** para não misturar semântica com política de movimento | ✅ |
| **III — Sem duplicação divergente** | — | §6.1.1 identifica e **resolve** a duplicação `CenteredContent` × `ContentContainer` | ✅ |
| **III — Sem código morto** | — | P-29 resolvido **por consumo**, eliminando o estado morto (§6.1.2) | ✅ |
| **IV — Re-renders** | Memoização **situacional**, não mandato | O Plan **não** propõe memoização preventiva. Nenhum `memo`/`useMemo` novo é planejado sem justificativa | ✅ |
| **IV — Medir antes de refatorar amplo** | — | §9 **recusa explicitamente** migrar os 75 consumidores de `productTheme` | ✅ |
| **IV — Mídia pesada** | file:// sobre base64 | Não aplicável — nenhum bloco toca o pipeline do canvas | ✅ n/a |
| **V — Regra de Ouro** | Nenhum código antes dos 3 portões | **Nenhuma linha de código de produção foi escrita.** Portão 1 aprovado; este artefato é a Etapa 4; para no Portão 2 | ✅ |
| **V — Etapas não opcionais** | clarify, checklist, analyze fazem parte do fluxo | Clarify (§15 da Spec, C1–C18) e Checklist (§17, CHK001–CHK038) executados na rodada anterior. **Analyze NÃO é executado agora** — pertence à Etapa 6, após o Portão 2 | ✅ |
| **V — Rastreabilidade** | spec ↔ plan ↔ tasks ↔ código | §17 rastreia P, E5.52, R21 e S1–S11 | ✅ |

### 18.2 Rigor Proporcional ao Risco

A Fase 6 é **mudança arquitetural** (shell de navegação, contrato de `route` em tablet). A
Constituição exige, para essa classe: **fluxo completo + pesquisa técnica + revisão independente +
aprovação explícita**.

| Exigência | Estado |
|---|---|
| Fluxo completo | ✅ Etapas 1–3 concluídas; Etapa 4 aqui; 5–6 após o Portão 2 |
| Pesquisa técnica | ✅ Comparação de 3 alternativas de splash em 15 eixos; comparação dos 6 perfis de build; cálculo colorimétrico WCAG do azul |
| **Revisão independente** | ⚠️ **NÃO REALIZADA.** Registrada como exigência da Etapa SDD 8, após a implementação — a própria Constituição admite que ocorra depois |
| Aprovação explícita | ⏳ **É exatamente o que o Portão Humano 2 decide** |

### 18.3 Restrições de Stack, Segurança e Áreas Protegidas

| Restrição | Verificação | Veredito |
|---|---|---|
| Build só por EAS (`development`/`preview`/`production`) | §12 usa apenas perfis do `eas.json` | ✅ |
| **Sem OTA / expo-updates** | Nada proposto | ✅ |
| **Sem submit automático** | Nada proposto | ✅ |
| **Sem SDK de tracking/analytics** | §6.7.3 proíbe **explicitamente** transformar o coletor em analytics; CN-7 prova | ✅ |
| `privacyManifests` / permissões mínimas | `app.json` alterado **apenas** nas linhas 14, 41 e 48 (**somente valores de cor**). `privacyManifests` e `permissions` **intocados** | ✅ |
| Untracked de assets | **Nenhum asset novo.** Nenhum `git add` amplo | ✅ |
| `git add .` / `-A` proibidos | Commit desta rodada é seletivo, caminho a caminho (§20) | ✅ |
| Git LFS | Não aplicável | ✅ n/a |

### 18.4 Portões de Qualidade

| Portão | Estado nesta rodada | Plano |
|---|---|---|
| `npm run smoke` verde | ⚠️ **NÃO EXECUTÁVEL** — `node_modules` ausente no worktree (§21) | Preparado antes da Etapa 7 (§21) |
| `npx expo-doctor` verde | ⚠️ idem | idem |
| Testes de regressão | ✅ Planejados (§10.4) | CN-1…CN-8 |
| Validação visual | ✅ Planejada (§15) | Inventário nominal |
| Validação física | ✅ Planejada (§14) | 17 cenários |
| `git diff --cached --name-only` antes do commit | ✅ Executado (§20) | — |
| Commit atômico, sem misturar código/assets/governança | ✅ Este commit contém **apenas** `plan.md` | — |
| **Push só com aprovação** | ✅ **Nenhum push** | — |
| Relatório em PT-BR distinguindo estados | ✅ §22 | — |
| `Co-Authored-By` verdadeiro | ✅ Declara o modelo realmente usado | — |

### 18.5 Não antecipação de fases e não reabertura de decisões congeladas

| Verificação | Estado |
|---|---|
| **P-127 não antecipado** | ✅ §6.7.4 — zero marcas novas; `performanceTrace.js` intocado; CN-7 prova |
| **Loading/performance não reaberto** | ✅ §10.4 — entra **só** como contrato de regressão. Nenhum item congelado é rediscutido |
| **Fases 10 e 12B não puxadas** | ✅ §6.3.2 — as 3 telas zeradas ficam como resíduo **atribuído** |
| **P-66 e P-79 não puxados** | ✅ §6.3.2 — citados pela matriz como mesmo bloco, mas **fora dos nove P** |
| **Ícone não alterado por inferência** | ✅ §16 — o ícone é alterado por **decisão explícita e delimitada do fundador** (emenda do Portão 2), não por inferência do Plan; **CN-3** reescrito impede o crescimento do escopo |
| **Spec não reescrita silenciosamente** | ✅ §17.4 — a alteração da Spec veio de **emenda vinculante do fundador**, foi declarada e revalidada (40/40), não foi silenciosa |
| **Matriz não editada** | ✅ §6.2.3 — divergência **declarada**, artefato **não tocado** |
| **Azul não perguntado de novo ao fundador só pelo HEX** | ✅ §6.5.2 — token **definido tecnicamente** contra a banda §15.1 |

### 18.6 🟢 Veredito do Constitution Check

**TODOS os princípios constitucionais verificados estão SATISFEITOS.**

Duas ressalvas, **nenhuma delas violação**:

1. **Revisão independente** (§18.2) ainda não ocorreu — a Constituição a situa na Etapa SDD 8,
   após a implementação. Não é pré-requisito do Portão 2.
2. **Smoke e expo-doctor não executáveis nesta rodada** (§18.4) — mas esta rodada **não altera
   runtime**, e o runtime é bit-idêntico a `015c438`. §21 define como o ambiente é preparado antes
   da implementação.

**Nenhuma violação a justificar ⇒ a seção "Complexity Tracking" do template permanece VAZIA por
mérito, não por omissão.**

---

## 19. ❓ Perguntas Genuinamente Pendentes ao Fundador

> Só entram aqui questões que **os documentos não arbitram** e que **produzem produtos
> materialmente diferentes**. Escolhas meramente técnicas foram decididas neste Plan, conforme a
> autorização §7.

> ⚠️ **ATUALIZADO EM 2026-08-07 — AS DUAS PERGUNTAS FORAM RESPONDIDAS PELO FUNDADOR
> NO PORTÃO HUMANO 2. NÃO HÁ MAIS PERGUNTA PENDENTE NESTE PLAN.**

| # | Pergunta levada ao Portão 2 | Resposta do fundador | Estado |
|---|---|---|---|
| **AC-1** | **A quem pertence o `#7C3AED` do ícone/adaptive icon (`app.json:48`)?** A Fase 6 o excluía por C18 e nenhuma linha da matriz foi identificada como proprietária | **Emenda vinculante 1:** a superfície pertence à **Fase 6**, com **escopo restrito ao valor configurável**. C18 é parcialmente superada. Vira **`RF-B8`** | ✅ **ENCERRADA** — ver §16 e §6.6.4 |
| **AC-2** | **A divergência de contagem de P-31** (matriz: 8 chamadas aninhadas / 11 total; recontagem auditada: 7 / 10) deve ser reconciliada na matriz — e em qual bloco documental? | **Emenda vinculante 2:** *"Isso NÃO é pergunta ao fundador. Resolva por evidência."* A reconciliação histórica vira **tarefa da Etapa 6 (Analyze)**: reconstruir o histórico entre o registro original de E012 e a base atual; se a evidência for conclusiva, preparar a correção documental; se não for, **manter a divergência registrada** e usar o critério funcional total. Proibido inventar ocorrência ou reduzir o critério a "10"/"11" | ✅ **ENCERRADA como pergunta** — segue como **investigação de Analyze** |

**Critério de aceite de P-31 permanece inalterado por ambas as emendas:**
**ZERO NAVEGAÇÕES INEFETIVAS NO ESCOPO** — não "10", não "11".

**Não são perguntas** (decididas pelo Plan, como manda a autorização):
o HEX do azul premium (§6.5.2), a alternativa de splash (§6.6.3), o perfil de build para o coletor
(§6.7.2), a decisão sobre `AppScreen` (§6.1.2), a arquitetura do shell de tablet (§6.2.4) e a
reordenação B3→B2 (§4.2).

---

## 20. Estrutura do Projeto

### 20.1 Documentação desta feature

```text
specs/021-fase6-shell-splash-sistema-visual/
├── spec-fase6-shell-splash-sistema-visual.md   # Etapas SDD 1–3 (aprovado no Portão 1)
├── plan.md                                     # ESTE ARQUIVO — Etapa SDD 4
└── tasks.md                                    # Etapa SDD 5 — NÃO criado (depende do Portão 2)
```

**`research.md`, `data-model.md`, `contracts/` e `quickstart.md` NÃO são gerados.** Justificativa:
a pesquisa técnica está **incorporada** ao Plan (§6.5.2, §6.6.2, §6.7.2); não há modelo de dados
novo (nenhuma entidade, nenhum schema, persistência intocada); não há interface externa a
contratualizar (app local-first sem backend nem API pública); e a validação executável é a matriz
física de §14 mais os gates de §10, que vivem no Plan e no smoke. Criar os quatro arquivos vazios
seria cerimônia sem conteúdo — contrária ao rigor proporcional ao risco.

### 20.2 Código-fonte (raiz do repositório) — **não alterado nesta rodada**

```text
App.js                        # porta de fontes (B4)
app.json                      # abertura: linhas 14 e 41 (B4) + linha 48 (RF-B8, §16).
                              #   assets/icon.png e assets/adaptive-icon.png NÃO tocados (CN-3)
eas.json                      # perfil `preview` (B6)
package.json                  # script `perf:report` (B6)
scripts/smoke.js              # gates novos + A0.7 → G-SEAL (B1, B3, B5)
src/
├── theme/tokens.js           # breakpoints (B1) · night400 + seal.premium (B5)
├── components/layout/        # AppScreen, CenteredContent (B1)
├── components/ui/            # ContentContainer, ModalPapel, BotaoPrimario (B1, B2)
├── navigation/AppNavigator.js# MainTabs, TabletLayout, rotas raiz (B3)
├── hooks/useReduceMotion.js  # NOVO (B2′)
└── screens/                  # consumidores por bloco
```

**Decisão de estrutura:** aplicativo móvel de projeto único. **Nenhum diretório novo é criado**;
o único arquivo novo previsto é `src/hooks/useReduceMotion.js`, em diretório existente.

---

## 21. Preparação do Ambiente de Execução

> **Autorização §22, literal:** *"O fato de `node_modules` não existir no worktree não deve ser
> transformado em dívida de produto."*

**Fato:** `npm run smoke` **não é executável** neste worktree (`node_modules` ausente;
`Cannot find module '@noble/hashes/sha2.js'`). Isto é uma condição **do worktree**, não um defeito
do produto: o runtime é **bit-idêntico** a `015c438`, e o CI (`.github/workflows/ci.yml`) executa
`npm run smoke` como gate duro independentemente.

**Forma segura e reprodutível de preparar as dependências, quando a etapa autorizada chegar:**

| # | Passo | Por quê |
|---|---|---|
| 1 | `npm ci` a partir do `package-lock.json` **existente** | `npm ci` instala **exatamente** o lockfile e **falha** se `package.json` e lock divergirem — é determinístico, ao contrário de `npm install`, que pode **reescrever o lock** |
| 2 | Confirmar `git status --short` **limpo** após a instalação | Prova que nem `package.json` nem `package-lock.json` foram alterados |
| 3 | `npm run smoke` | Portão duro |
| 4 | `npx expo-doctor` | Portão |

**Restrições:** **nenhuma dependência é adicionada, removida ou atualizada**; `npx expo install`
só entra se uma dependência aprovada existir — e **nenhuma é proposta** (§18.1).
`node_modules/` é ignorado pelo Git e **não entra em commit algum**.

**Nada disto foi executado nesta rodada.** Nenhuma instalação ocorreu.

---

## 22. Estado dos Artefatos

| Artefato | Estado |
|---|---|
| `specs/021-.../plan.md` | **commitado** em `1419abf` (Etapa 4) → **reaberto e emendado em 2026-08-07** pelo Portão Humano 2 (§6.6.4, §6.5.4, §7, §10.2, §10.3, §14, §16, §17.3, §17.4, §18, §19, §20, §22, §23) |
| `specs/021-.../spec-...md` | **commitado** em `76e502c` (Etapas 1–3) → **emendado em 2026-08-07** pela emenda vinculante 1 (§4.8, RF-B2, **RF-B8**, **T14**, §9.1, **F12**, **C18**, §15.2, CHK004, CHK038, **CHK039**, **CHK040**, §17.7, §18) |
| `specs/021-.../tasks.md` | **NÃO criado ainda** — Etapa SDD 5, autorizada pelo Portão 2 |
| `src/`, `scripts/`, `assets/`, `App.js`, `app.json`, `eas.json`, `package.json`, `package-lock.json`, `plugins/` | **INTOCADOS** — nenhum arquivo criado, modificado ou removido, nem por este Plan nem pela emenda |
| `CLAUDE.md` | **não alterado** — o bloco `<!-- SPECKIT -->` (`:117-120`) é genérico ("read the current plan") e já resolve via `.specify/feature.json`, que aponta para 021 |
| `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` | **não alterado** — divergência de P-31 declarada em §6.2.3; sua reconciliação por evidência é **tarefa da Etapa 6 (Analyze)** por decisão da emenda 2 |
| Builds | **NENHUM gerado.** Histórico remoto EAS **NÃO RECUPERADO** |
| Metro | **NÃO aberto** |
| `npm ci` / `npm run smoke` / `expo-doctor` | **NÃO executados** — proibidos antes do Portão Humano 3 |
| Validação física | **NÃO executada** |
| Push | **NÃO realizado** |

---

## 23. Recomendação

O Plan cobre integralmente os itens obrigatórios da autorização, o Constitution Check passa sem
violações, nenhuma dependência nova é proposta, o runtime permanece intocado e as duas únicas
pendências (§19) são de **governança documental**, não bloqueiam a execução técnica e podem ser
decididas no próprio Portão.

**Recomendação original (Etapa 4): APTO PARA PORTÃO HUMANO 2.**

### 23.1 Estado após o Portão Humano 2 (2026-08-07)

**🚦 PORTÃO HUMANO 2 — APROVADO COM DUAS EMENDAS VINCULANTES.**

| Emenda | Conteúdo | Onde foi aplicada |
|---|---|---|
| **1** | Correção **restrita** do `android.adaptiveIcon.backgroundColor` entra na Fase 6; supera C18 na parte que excluía integralmente o adaptive icon | Spec (RF-B8, T14, F12, §4.8, §9.1, C18, CHK039/CHK040) + Plan (§6.6.4, §6.5.4, §7, G-ICON, CN-3, F-ICON, §16) |
| **2** | Divergência de contagem de P-31 (10 × 11) é resolvida **por evidência histórica na Etapa 6 (Analyze)**, não por pergunta ao fundador | Plan §19 (AC-2 encerrada como pergunta) — investigação a executar em Analyze |

**Decisões do fundador confirmadas sem alteração de artefato:**
o azul premium **`night400 = #3E5C96`** segue **aprovado como candidato de implementação** (§6.5.2),
com a validação estética do caráter "acolhedor e infantil" **diferida para a validação física**
(F-SEAL, em B7); isso **não** bloqueia Tasks nem Analyze.

**Próximo passo autorizado:** **Etapa SDD 5 — Tasks** → **Etapa SDD 6 — Analyze** → **parada
obrigatória no Portão Humano 3**.

**Complexity Tracking:** vazio — nenhuma violação constitucional a justificar.
