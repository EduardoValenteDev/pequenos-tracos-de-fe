# Spec — Fase 6: Shell, splash e sistema visual

> **Feature:** `021-fase6-shell-splash-sistema-visual` · **Etapa SDD:** 1–3 (Specify · Clarify · Checklist)
> **Data:** 2026-08-07 · **Base exata:** `a7d3568faaa1ed8f4040e05d6b46fe05bbe0e64e` (commit documental da abertura da Fase 6, sobre `7de7085`)
> **Base executável preservada:** `015c438106538595b592981fbe1b80b1d5d65e55` — os nove caminhos protegidos estão **bit a bit idênticos** a ela nesta data
> **Branch de trabalho:** `feat/fase6-shell-splash` · **Worktree:** `C:\tmp\ptf_fase6_shell_splash_wt`
> **Identificador:** `021` (próximo livre — `020` = `onboarding-first-adventure`)
> **Natureza:** **fase de produto completa, com três eixos.** Toca `src/`, `App.js`, configuração nativa de abertura e `eas.json`. Exige **ciclo SDD completo com os três portões humanos**, testes de regressão, validação visual e **validação física em telefone e em tablet**.
>
> **Precedência:** [`docs/PROJECT_SOURCE_OF_TRUTH.md`](../../docs/PROJECT_SOURCE_OF_TRUTH.md) → [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) → [`AGENTS.md`](../../AGENTS.md)/[`CLAUDE.md`](../../CLAUDE.md) → esta spec. Árbitro de **sequência**: [`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](../../docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) §3. Árbitro de **decisões de produto**: [`docs/DECISIONS.md`](../../docs/DECISIONS.md). Árbitro de **inventário de riscos**: [`09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`](../../docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md) §14.
>
> **Não reabre:** a trilha **loading/performance**, encerrada por [`D-LP-FECHAMENTO`](../../docs/DECISIONS.md) — *"Não se reabre investigação sobre ela"*. Aqui ela existe **apenas como regressão a não causar**. Também não reabre `D2` (roxo aposentado), `D3` (Fraunces + Nunito), `D4` ("Galeria Viva"), nem as decisões das Fases 2.5, 3, 4A–4E e 5.
>
> **Autorização do fundador (2026-08-07):** encerramento da rodada de abertura da Fase 6 e **início formal do ciclo SDD**, com execução integral e exclusiva das **Etapas 1 (Specify), 2 (Clarify) e 3 (Checklist)** e **parada obrigatória no Portão Humano 1**. Nenhum Plan pode ser produzido antes da aprovação explícita desta especificação.

---

## 1. Contexto

O `v5` §3 define a fase assim, literalmente:

> ### Fase 6 — Shell, splash e sistema visual
> - **Objetivo:** entregar a primeira impressão do app — abertura, splash, shell de navegação e aplicação do sistema visual "O Livro Vivo".
> - **Entregas centrais:** tokens, tipografia e componentes-base aplicados; splash e abertura reais; estados de card por chip/selo/ícone/tratamento, **não** por paleta paralela; varredura visual de telas.
> - **Critério de saída:** shell e abertura validados visualmente em dispositivo; nenhuma tela usando paleta de status paralela.
> - **Riscos atribuídos:** **R21** — **medição de shell e abertura**.

São **três eixos**, não dois. A redação reduzida *"shell e splash"*, que circulava em três documentos, foi corrigida na abertura desta fase justamente porque **omitia o sistema visual**.

A fase é a **primeira impressão da criança**: o que ela vê antes de qualquer história. Hoje essa primeira impressão é **roxa** — a cor oficialmente aposentada por `D2`.

## 2. Estado atual — fatos auditados (somente leitura, sem alteração de runtime)

### 2.1 A abertura tem três camadas encadeadas, nunca validadas juntas em aparelho

| Camada | Onde | O que faz hoje |
|---|---|---|
| 1 — *splash* nativo | `app.json` (`splash.image`, `splash.backgroundColor`, `androidStatusBar`, `adaptiveIcon`) | tela nativa do sistema operacional, fundo **`#7C3AED` (roxo)** |
| 2 — porta de fontes em JS | `App.js` | enquanto as fontes carregam, renderiza **`ActivityIndicator` laranja `#FF8C42` sobre fundo `#FFF8F0`** — não é o mundo do Beni |
| 3 — `SplashScreen` React | `src/screens/SplashScreen.js` | animação de *fade* de 800 ms com o Beni, decide a rota e navega |

Fatos relevantes já apurados:

- A camada 3 **não é governada por relógio**: navega **por prontidão**, quando a rota está decidida **e** a animação terminou; `DECISION_CEILING_MS = 1500` é **teto de segurança, não piso**.
- A camada 2 **nunca prende**: em erro de fonte **ou** no teto (`FONT_TIMEOUT_MS = 1500`), o app segue.
- A camada 3 consome `src/theme/colors.js` — **um dos sistemas visuais concorrentes**, não os tokens oficiais.
- **A transição visual entre as três camadas nunca foi validada fisicamente nesta fase.** Não há prova de que a passagem roxo → laranja/creme → Beni seja percebida como uma abertura coerente.
- `expo-splash-screen` **não** é dependência do projeto e **não** está declarado como plugin em `app.json`.

### 2.2 Sistemas visuais concorrentes convivem

`src/theme/tokens.js` é a fonte oficial, e o próprio cabeçalho do arquivo declara que os temas antigos (`colors.js`, `productTheme.js`, `theme.js`) **seguem vivos em paralelo**. A `SplashScreen` é um consumidor comprovado do sistema antigo.

### 2.3 Tipografia e acessibilidade sem proteção (`P-27`, `P-28`, `P-104`)

- **Zero** ocorrências de `allowFontScaling` e `maxFontSizeMultiplier` em todo o `src/`.
- Cerca de **34 textos abaixo de 13 px** e **4 contrastes reprovados em AA**.
- **Zero `accessibilityRole`** em **Cultinho**, **Meu Momento** e **Livrinho**.
- Hápticos **sem respeitar reduce motion** em três telas.

### 2.4 Shell de navegação e responsividade (`P-20`, `P-29`, `P-30`, `P-31`, `P-47`)

- **Dois sistemas de breakpoint concorrentes:** `tokens.js:128` define `breakpoints = { phone: 0, tablet: 600, tabletL: 900 }` (consumido por `ContentContainer.js:22`), enquanto **10 pontos do código** comparam contra `>= 768` (por exemplo `StoryBookScreen.js:195`).
- **`LumiMoment` e `StoryBook` são rotas raiz** do navegador (`AppNavigator.js:281-285`, `:514-518`, `:532-536`) em vez de viverem sob o shell de abas.
- **`src/components/layout/AppScreen.js` é código morto:** existe, padroniza *safe area*, e **não tem nenhum consumidor** no `src/`.
- **`11 navegações inefetivas no tablet`** e **tablet nunca validado fisicamente** — ambas exigem aparelho real.

### 2.5 Coletor de desempenho inalcançável (`E5.52`, `P-139`, parcela de `R21`)

`src/services/performanceTrace.js:44-52` só liga em `__DEV__` **ou** com `EXPO_PUBLIC_PTF_PERF_TRACE = '1'`. **Nenhum dos seis perfis do `eas.json`** declara essa variável, **não existe script npm** para `scripts/perf-baseline-report.js` e **nenhuma superfície além do boot** está instrumentada.

## 3. Escopo congelado — os três eixos

### Eixo A — SHELL de navegação
Estrutura de navegação coerente e responsiva: hierarquia de rotas, *safe area*, componentes-base, breakpoint único, comportamento correto em telefone **e em tablet**.

### Eixo B — SPLASH e ABERTURA
Primeira impressão coerente com "O Livro Vivo", resiliente a erro de fonte, sem superfície roxa, com transição visual coerente até a primeira tela útil.

### Eixo C — SISTEMA VISUAL
Tokens como fonte única, tipografia contratada, componentes-base, estados de card pela gramática oficial, acessibilidade funcional, responsividade oficial, eliminação progressiva dos sistemas concorrentes **dentro do escopo desta fase**.

## 4. Fora de escopo (congelado)

1. **Campanha de linha de base de desempenho (`P-127`)** — pertence à **Fase 9**. A Fase 6 **habilita** o coletor (`E5.52`); **não** coleta a linha de base, não publica números e não declara desempenho medido.
2. **Reabertura da trilha loading/performance** — encerrada por `D-LP-FECHAMENTO`. Entra aqui **só** como regressão proibida.
3. **Telas cuja reconstrução pertence a outras fases:** o resíduo de `P-28` nas três telas com zero `accessibilityRole` (**Cultinho**, **Meu Momento**, **Livrinho**) depende das **Fases 10 e 12B**.
4. **Paywall, entitlement, RevenueCat, progresso, conquistas, `accessControl`, manifestos, histórias e assets** — áreas protegidas, fora desta fase.
5. **Itens das Fases 7, 10, 11, 12A, 12B, 17, 19, 20 e 21** — nenhum é puxado para cá silenciosamente.
6. **Escolha do HEX exato do azul premium não é decisão de produto desta spec** — é derivação técnica do Plan, sob `D-SELOS-ESTADO-V2`.
7. **Escolha da solução técnica de splash** (manter arquitetura atual, controle nativo explícito, eliminar camada intermediária) — pertence ao **Plan**, não ao requisito de produto.
8. **Redesenho gráfico do ícone** — `assets/icon.png`, `assets/adaptive-icon.png`, identidade da marca, conceito de ícone, entregas de App Store/Play Store e qualquer trabalho de *branding* **ficam fora desta fase**, atribuídos à fase de identidade/publicação.

   > **⚠️ EMENDA VINCULANTE DO PORTÃO HUMANO 2 (2026-08-07) — supersessão parcial de C18.**
   > O fundador decidiu que o **`android.adaptiveIcon.backgroundColor` = `#7C3AED`** (`app.json:48`)
   > **ENTRA no escopo da Fase 6**, exclusivamente como **correção de cor aposentada em configuração
   > nativa**. Motivação registrada: o roxo foi formalmente aposentado; `app.json` já será alterado
   > em B4; a correção viaja no mesmo ciclo de build já necessário; não há justificativa para manter
   > uma cor explicitamente aposentada numa configuração nativa conhecida.
   > Esta decisão **SUPERA C18** na parte em que ela excluía **integralmente** o ícone adaptativo.
   > **O que entra:** apenas o valor de `backgroundColor` configurável.
   > **O que permanece fora:** o asset gráfico, a identidade, o conceito de marca e as entregas de loja.
   > Ver **`RF-B8`**, **`T14`**, o controle negativo de escopo em §9.1 e **`F12`**.

## 5. Requisitos funcionais

> Cada requisito é **testável** e **não congela solução**. `RF-A*` = shell, `RF-B*` = splash/abertura, `RF-C*` = sistema visual, `RF-M*` = medição.

### 5.1 Eixo A — Shell

| ID | Requisito | Verificação |
|---|---|---|
| **RF-A1** | Existe **um único** sistema de breakpoint em vigor no `src/`, com os valores canônicos dos tokens (`phone 0 · tablet 600 · tabletL 900`). Nenhum ponto do código compara largura contra um limiar próprio. | busca automática por limiares numéricos de largura fora dos tokens: **zero ocorrências** |
| **RF-A2** | A largura da tela é lida de forma **reativa**; nenhuma decisão de layout depende de um valor congelado no primeiro *render*. | teste automático + rotação em aparelho |
| **RF-A3** | Toda tela principal respeita **safe area** por um caminho único e padronizado. | inspeção automática + prints com *notch* |
| **RF-A4** | O wrapper de *safe area* hoje sem consumidor (`AppScreen.js`) tem **destino resolvido e declarado**: adotado como padrão **ou** removido. Não permanece como código morto. | inspeção do repositório após a implementação |
| **RF-A5** | A hierarquia de rotas é **coerente**: as rotas hoje declaradas na raiz (`LumiMoment`, `StoryBook`) têm **posição** resolvida e declarada no shell. Trata-se de **posição na hierarquia, não de renomeação**: os identificadores internos herdados do mascote legado permanecem como estão nesta fase (ver C15). | leitura do navegador + teste de navegação |
| **RF-A6** | **Toda** navegação disponível na interface é **efetiva em tablet** — nenhum toque de navegação fica sem efeito. | **validação física em tablet** (`P-31`) |
| **RF-A7** | O alvo mínimo de toque é **56 × 56** (com `hitSlop` quando necessário) nos controles do shell. | inspeção automática + validação física |

### 5.2 Eixo B — Splash e abertura

| ID | Requisito | Verificação |
|---|---|---|
| **RF-B1** | A **primeira impressão** do app é coerente com "O Livro Vivo" — mundo papel/tinta/dourado/luz quente do mascote **Beni**. | prints e vídeo da abertura |
| **RF-B2** | **Nenhuma superfície de abertura é roxa**, em nenhuma das camadas, em iOS e em Android. **Superfície de abertura**, aqui, é o conjunto delimitado: fundo do *splash* nativo, barra de status na abertura, fundo da porta de fontes e fundo da `SplashScreen`. O **ícone adaptativo é tratado à parte, por `RF-B8`** — a *superfície de abertura* de `RF-B2` continua sendo o conjunto de quatro camadas nomeado acima, e é isso que mantém `RF-B2` binário. | inspeção de configuração + prints |
| **RF-B3** | A **transição entre as camadas de abertura** é percebida como **contínua e coerente** — sem salto de cor, sem *flash* de fundo estranho, sem tela intermediária fora do mundo do Beni. | **validação física em vídeo**, iOS e Android |
| **RF-B4** | A abertura é **resiliente a erro de fonte**: com fonte indisponível ou lenta, o app **abre mesmo assim**, sem travar e sem tela vazia permanente. | teste automático do contrato de boot + prova física |
| **RF-B5** | A saída da abertura **não volta a ser governada simplesmente por relógio**: continua acontecendo **por prontidão**, com teto apenas como segurança. | teste automático do contrato de boot |
| **RF-B6** | A transição até a **primeira tela útil** é visualmente coerente, e a tela útil correta é escolhida (onboarding pendente × mapa). | teste automático + validação física |
| **RF-B7** | A abertura **não regride** o contrato de carregamento já encerrado: nenhum piso artificial, nenhuma espera nova, nenhum aumento de tempo até a primeira revelação. | teste de regressão + comparação de marcos existentes |
| **RF-B8** | **O `android.adaptiveIcon.backgroundColor` não é roxo.** O valor `#7C3AED` é substituído por uma cor **já pertencente à paleta canônica** e coerente com "O Livro Vivo". **Escopo restrito, verificável pela negativa:** `assets/icon.png` e `assets/adaptive-icon.png` permanecem **byte-idênticos**; nenhum token novo é criado apenas para o ícone; nenhuma identidade de marca é alterada. *(Emenda vinculante do Portão Humano 2 — supersede C18 parcialmente.)* | inspeção de configuração + `git diff` dos assets + print do lançador em aparelho físico |

### 5.3 Eixo C — Sistema visual

| ID | Requisito | Verificação |
|---|---|---|
| **RF-C1** | **`src/theme/tokens.js` é a fonte única** de cor, tipografia, espaçamento, raio e sombra para as superfícies no escopo desta fase. Nenhum hex/tamanho/sombra literal em componente tocado pela fase. | inspeção automática |
| **RF-C2** | A tipografia em vigor é a contratada por `D3`: **Fraunces** (display) + **Nunito** (texto/negrito). Nenhuma família concorrente nas superfícies do escopo. | inspeção automática |
| **RF-C3** | Os **sistemas visuais concorrentes** (`colors.js`, `productTheme.js`, `theme.js`) são eliminados **de toda superfície tocada por esta fase** — abertura, shell, componentes-base e selos/chips de estado. O resíduo fora dessas superfícies é **inventariado nominalmente e atribuído** a fase posterior. Não há remoção cega de arquivo ainda consumido (ver C17). | inventário nominal de consumidores antes e depois |
| **RF-C4** | O estado do card é comunicado por **chip + selo + ícone + texto + tratamento visual**. **Nenhuma tela usa paleta de status paralela.** | inspeção automática + varredura visual |
| **RF-C5** | **Cor nunca comunica estado sozinha:** todo estado tem, além da cor, ao menos um portador não-cromático (texto, ícone ou forma). | inspeção + revisão visual dedicada |
| **RF-C6** | Os selos seguem `D-SELOS-ESTADO-V2`: **Grátis = verde suave · Plano Família = azul premium luminoso e acolhedor · Concluída = dourado**. **Roxo não retorna.** O azul premium satisfaz a **banda de aceitação objetiva de §15.1** — que é o que torna "luminoso e acolhedor" verificável sem inventar o HEX aqui. | teste automático contra a banda de §15.1 + aprovação visual |
| **RF-C7** | **Dourado permanece material de recompensa** (Lei 2) — não vira cor de acesso comercial nem cor de UI genérica. | revisão visual |
| **RF-C8** | Estados como *baixando, baixado/offline, em andamento, requer atualização, erro* **não ganham paleta cromática independente**; **erro nunca é vermelho**. | inspeção automática + varredura visual |
| **RF-C9** | Existe um conjunto de **componentes-base** coerente (superfície de papel, chip, selo, botão, cabeçalho) usado pelas telas do escopo, sem duplicação divergente. | inspeção do repositório |

### 5.4 Acessibilidade e responsividade (transversais ao eixo C)

| ID | Requisito | Verificação |
|---|---|---|
| **RF-C10** | A escala de fonte é **protegida e declarada**: corpo acompanha até **1.3**; display e botões limitam com `maxFontSizeMultiplier` **1.2**. Nenhuma superfície do escopo fica sem política declarada. | inspeção automática |
| **RF-C11** | **O app é navegável com `fontScale 1.3` sem corte** de texto nas superfícies do escopo. **`numberOfLines` com reticências continua proibido em botões e títulos.** | **validação física** com escala do sistema aumentada |
| **RF-C12** | **Nenhum texto novo** abaixo de **13 px**; os textos existentes abaixo de 13 px nas superfícies do escopo são corrigidos ou justificados individualmente. | inspeção automática com lista nominal |
| **RF-C13** | **Contraste AA** atendido nas superfícies do escopo; os quatro contrastes hoje reprovados são corrigidos ou têm destino declarado. | verificação de contraste + lista nominal |
| **RF-C14** | Semântica de leitor de tela presente nas superfícies do escopo: papel, rótulo e estado anunciados para todo controle interativo. | inspeção automática + **teste com leitor de tela em iOS e Android** |
| **RF-C15** | **Hápticos respeitam reduce motion**: com a preferência do sistema ativa, o retorno tátil não é disparado. | inspeção automática + validação física |
| **RF-C16** | O comportamento em **tablet** segue o breakpoint canônico e é verificado nas larguras de referência **360×800**, **744×1133** e **820×1180**. | gate automático de layout + validação física |

### 5.5 Medição (`E5.52` · `P-139` · parcela de `R21`)

| ID | Requisito | Verificação |
|---|---|---|
| **RF-M1** | O coletor de desempenho torna-se **alcançável em um perfil interno de build** — deixa de depender exclusivamente de `__DEV__`. | leitura da configuração + execução no binário interno |
| **RF-M2** | O coletor permanece **desligado por padrão** fora do perfil interno; **ausência da variável = desligado**, sem depender de rede. | teste automático + inspeção |
| **RF-M3** | Existe um caminho **executável e documentado** para obter o relatório de desempenho a partir do coletor. | execução real do caminho |
| **RF-M4** | **Nenhuma linha de base é coletada, publicada ou declarada nesta fase.** Nenhuma afirmação de "desempenho medido" é produzida. | revisão do relatório final da fase |
| **RF-M5** | A medição **não** coleta conteúdo infantil, identificador de aparelho, modelo exato do aparelho nem carimbo absoluto — o plano de medição anônima da Fase 5 continua valendo integralmente. | inspeção contra o plano aprovado |

## 6. Critérios de entrada e de saída

### 6.1 Critérios de entrada (satisfeitos nesta data)

| # | Critério | Estado |
|---|---|---|
| E1 | Fase 5 documentalmente encerrada | ✅ `7de7085` |
| E2 | Contradição normativa dos selos resolvida por decisão formal do fundador | ✅ `D-SELOS-ESTADO-V2` |
| E3 | Correções documentais da abertura commitadas | ✅ `a7d3568` |
| E4 | Runtime bit a bit idêntico à base preservada `015c438` | ✅ verificado |
| E5 | Worktree, branch e árvore limpos e reconfirmados | ✅ verificado |

### 6.2 Critérios de saída da **Fase 6** (contrato do `v5` §3, desdobrado)

| # | Critério de saída | Evidência exigida |
|---|---|---|
| S1 | **Shell validado visualmente em dispositivo** | vídeo/prints em **telefone físico** |
| S2 | **Abertura validada visualmente em dispositivo** | vídeo da abertura completa, **iOS e Android** |
| S3 | **Nenhuma tela usando paleta de status paralela** | **inventário nominal de telas** produzido no Plan, com **100 % dele** coberto por print, mais inspeção automática. Sem o inventário nominal, S3 não é binário e **não pode ser declarado atingido** |
| S4 | `P-20` fechado — **tablet validado fisicamente** | prints/vídeo em **tablet físico compatível** |
| S5 | `P-31` fechado — **nenhuma navegação inefetiva no tablet** | roteiro de navegação executado em tablet |
| S6 | `P-27` fechado — app navegável com **fontScale 1.3** sem corte | prova física com escala aumentada |
| S7 | `P-28` fechado **na parcela sistêmica** desta fase | inspeção + leitor de tela; resíduo das 3 telas declarado como Fases 10/12B |
| S8 | `P-29`, `P-30`, `P-47`, `P-104` fechados | inspeção automática + validação física onde exigida |
| S9 | `P-139` implementado (`E5.52`) | coletor alcançável em perfil interno, provado no binário |
| S10 | Portões automáticos verdes | `npm run smoke` verde **e** `npx expo-doctor` verde |
| S11 | Sem regressão da trilha loading/performance | comparação dos marcos existentes |

### 6.3 Separação explícita: critérios de **saída da fase** ≠ critérios de **lançamento**

**Fechar a Fase 6 não aprova nada para lançamento.** Dos nove `P` desta fase, três estão marcados como **`PODE BLOQUEAR LANÇAMENTO`** (`P-20`, `P-27`, `P-28`) e continuam com **revalidação obrigatória na Fase 21**; `P-31` também é `PODE BLOQUEAR LANÇAMENTO`. Fechar a fase significa: **o trabalho proprietário desta fase foi feito e validado**. **Lançamento é decisão de outra etapa**, com seus próprios critérios, e nenhum item desta spec o antecipa.

## 7. Dependência operacional de validação — **tablet**

Registro obrigatório, **não é decisão de produto e não é Product Lock**:

> **SEM TABLET FÍSICO COMPATÍVEL, `P-20` E `P-31` NÃO PODEM SER FECHADOS E A FASE 6 NÃO SATISFAZ TODOS OS SEUS CRITÉRIOS DE SAÍDA.**

- A ausência de tablet **não bloqueia** Specify, Clarify, Checklist, Plan nem Tasks.
- A ausência de tablet **bloqueia** o fechamento físico da fase, se não for resolvida até a **Etapa SDD 8**.
- Nenhum documento normativamente superior autoriza encerrar a Fase 6 com validação física pendente. Não há, portanto, opção válida de "fechar com pendência".
- O que cabe ao fundador é **como obter o aparelho** — compra, empréstimo, laboratório ou aparelho de terceiro. Isso é **logística**.

## 8. Telefone × tablet

| Aspecto | Telefone | Tablet |
|---|---|---|
| Breakpoint | `phone` (< 600) | `tablet` (≥ 600) e `tabletL` (≥ 900), pelos tokens canônicos |
| Larguras de referência | 360×800 | 744×1133 e 820×1180 |
| Navegação | validada nas fases anteriores | **nunca validada fisicamente** (`P-20`); **11 navegações inefetivas** conhecidas (`P-31`) |
| Orientação | `portrait` declarado hoje | comportamento a verificar em aparelho real |
| Suporte declarado | — | `ios.supportsTablet: true` |

## 9. Matriz de testes (automáticos, comportamentais)

| # | O que prova | Tipo | Risco coberto |
|---|---|---|---|
| T1 | existe **um único** conjunto de breakpoints; nenhum limiar de largura fora dos tokens | inspeção | `P-30` |
| T2 | `AppScreen.js` **não** permanece sem consumidor | inspeção | `P-29` |
| T3 | hierarquia de rotas: `LumiMoment`/`StoryBook` na posição declarada | inspeção | `P-47` |
| T4 | política de escala de fonte declarada nas superfícies do escopo | inspeção | `P-27` |
| T5 | inexistência de texto novo abaixo de 13 px | inspeção | `P-27` |
| T6 | semântica de acessibilidade presente nos controles do escopo | inspeção | `P-28` |
| T7 | hápticos condicionados a reduce motion | inspeção | `P-104` |
| T8 | tokens de selo = verde suave / azul premium luminoso / dourado, **sem roxo, lilás, marrom nem azul-noite** | inspeção | `D-SELOS-ESTADO-V2` |
| T9 | ausência de paleta de status paralela | inspeção | `D-STATUS-CARDS` |
| T10 | contrato de boot: fonte OK, fonte com erro, fonte lenta, desmontagem antes da decisão, dupla conclusão | comportamental | `RF-B4`, `RF-B5` |
| T11 | rota de destino do boot (onboarding pendente × concluído × falha de storage) | comportamental | `RF-B6` |
| T12 | coletor desligado por padrão; ligado apenas no perfil interno | comportamental | `P-139` |
| T13 | marcos de carregamento existentes preservados (regressão) | comportamental | `D-LP-FECHAMENTO` |
| T14 | `android.adaptiveIcon.backgroundColor` não é roxo **e** os assets gráficos do ícone permanecem inalterados | inspeção | `RF-B8` |

> ⚠️ O portão de *smoke* hoje **exige** o selo premium azul-noite. Sem ser atualizado, ele **reprovaria** a implementação de `D-SELOS-ESTADO-V2`. A atualização desse portão é item obrigatório do Plan.

### 9.1 Controles negativos exigidos

- Provar que `T8` **falha** se o roxo/lilás voltar ao selo premium.
- Provar que `T9` **falha** se uma paleta cromática por status for introduzida.
- Provar que `T12` **falha** se o coletor ligar fora do perfil interno.
- Provar que `T10` **falha** se a saída da abertura voltar a ser governada por relógio.
- **Provar que `T14` falha se o asset gráfico do ícone for alterado.** *(Emenda do Portão 2.)* Este
  controle protege o **escopo restrito** da decisão: a Fase 6 corrige **apenas o valor de cor
  configurável**; qualquer alteração em `assets/icon.png` ou `assets/adaptive-icon.png` significaria
  que a correção virou redesenho de marca, o que **não** foi autorizado.

## 10. Roteiro de validação física (não executado nesta etapa)

| # | Cenário | Aparelho | Prova |
|---|---|---|---|
| F1 | abertura completa, primeira instalação | telefone Android | vídeo |
| F2 | abertura completa, primeira instalação | iPhone | vídeo |
| F3 | abertura com fonte lenta/indisponível | telefone | vídeo |
| F4 | transição das camadas de abertura até a primeira tela útil | telefone iOS + Android | vídeo |
| F5 | navegação completa do shell | **tablet** | vídeo + prints |
| F6 | as 11 navegações hoje inefetivas | **tablet** | lista com resultado item a item |
| F7 | app inteiro com `fontScale 1.3` | telefone + tablet | prints por tela |
| F8 | leitor de tela nos controles do shell | iOS + Android | vídeo/áudio |
| F9 | reduce motion ativo — hápticos silenciados | telefone | vídeo |
| F10 | varredura visual: nenhuma paleta de status paralela | telefone + tablet | prints por tela |
| F11 | coletor alcançável no binário interno | telefone | evidência de execução |
| F12 | **ícone no lançador Android após a correção de fundo** — sem roxo, com contraste adequado, harmônico com o *foreground* existente e distinguível do azul premium | **telefone Android + tablet Android** | print da tela inicial do lançador |

> **NÃO DETERMINADO SEM EXECUÇÃO FÍSICA:** o resultado de F1 a F11. Nenhum deles pode ser inferido por leitura estática.

## 11. Necessidade de binário — três coisas distintas

| Necessidade | Quando ocorre nesta fase |
|---|---|
| **Aparelho físico** | sempre que houver toque, gesto, leitor de tela, escala de fonte real ou layout real |
| **Binário compatível** | mudanças **só de JS** **não** invalidam um Dev Client existente — podem ser validadas por Metro sobre o binário atual |
| **Binário novo obrigatório** | mudança em configuração nativa de abertura (`app.json`), mudança de `env` de perfil (`eas.json`) ou dependência/plugin novo |

Consequência prática: a validação de tablet **não exige um build exclusivo**. O binário gerado para a parcela nativa desta fase pode servir também ao fechamento de `P-20` e `P-31`, desde que o tablet esteja disponível a tempo. **Nenhum build foi gerado nesta etapa.**

## 12. Riscos da própria fase

| # | Risco | Mitigação |
|---|---|---|
| R-a | mexer no sistema visual e **regredir** a trilha loading/performance encerrada | `T13` + comparação de marcos + `RF-B7` |
| R-b | remover um tema antigo ainda consumido e quebrar tela fora do escopo | `RF-C3` exige inventário de consumidores antes da remoção |
| R-c | o portão de *smoke* atual reprovar a decisão do fundador | atualização do portão é item obrigatório do Plan (declarado em `D-SELOS-ESTADO-V2` §6) |
| R-d | tablet indisponível na Etapa 8 | §7 — dependência operacional registrada e escalada cedo |
| R-e | escolha prematura de solução de splash | §4 item 7 — a escolha é do Plan, com comparação obrigatória (§13.2) |
| R-f | antecipar `P-127` ao habilitar o coletor | `RF-M4` proíbe coletar/publicar linha de base |

## 13. Dependências e itens que **não** pertencem a esta fase

### 13.1 Dependências herdadas e posteriores

| Item | Situação |
|---|---|
| `E5.52` | herdado da Fase 5, **implementado aqui** |
| `P-85` | fase proprietária **5**; dependência de `P-139` **já resolvida** |
| `P-127` | fase proprietária **9** — **não antecipado** |
| `P-28` (resíduo) | três telas zeradas dependem das **Fases 10 e 12B** — o resíduo não impede especificar a parcela sistêmica que é da Fase 6 |
| `P-20` | sem dependência documental; depende de **aparelho físico** |
| `P-47` | depende de `P-30` e `P-31`, ambos desta fase |
| Revalidação | **todos os nove** têm revalidação na **Fase 21**; `P-139` também na **Fase 14** |

### 13.2 Comparação obrigatória no Plan (não decidida aqui)

O Plan deve comparar, **no mínimo**: (a) manter a arquitetura atual com correção visual e de transição; (b) controle nativo explícito do splash; (c) eliminação de uma camada intermediária. Para cada alternativa: risco de regressão da trilha encerrada, necessidade de dependência ou plugin novo, efeito em iOS e Android, necessidade de binário novo.

## 14. Rastreabilidade

### 14.1 Os nove `P` proprietários da Fase 6

| Código | Título | Classificação operacional | Requisitos | Saída |
|---|---|---|---|---|
| `P-20` | Tablet nunca validado fisicamente | **IMPLEMENTAR/VALIDAR NA FASE 6** | RF-A6, RF-C16 | S4 |
| `P-27` | Tipografia sem proteção de escala | **IMPLEMENTAR NA FASE 6** | RF-C10, RF-C11, RF-C12, RF-C13 | S6 |
| `P-28` | Semântica de acessibilidade ausente | **IMPLEMENTAR NA FASE 6 (parcela sistêmica)** | RF-C14 | S7 |
| `P-29` | `AppScreen.js` é código morto | **IMPLEMENTAR NA FASE 6** | RF-A3, RF-A4 | S8 |
| `P-30` | Dois sistemas de breakpoint concorrentes | **IMPLEMENTAR NA FASE 6** | RF-A1, RF-A2 | S8 |
| `P-31` | 11 navegações inefetivas no tablet | **IMPLEMENTAR/VALIDAR NA FASE 6** | RF-A6 | S5 |
| `P-47` | `LumiMoment`/`StoryBook` são rotas raiz | **IMPLEMENTAR NA FASE 6** | RF-A5 | S8 |
| `P-104` | Hápticos sem reduce motion | **IMPLEMENTAR NA FASE 6** | RF-C15 | S8 |
| `P-139` | Coletor de desempenho inalcançável | **IMPLEMENTAR NA FASE 6** | RF-M1…RF-M5 | S9 |

**Categoria "`P` apenas revalidados na Fase 6":**

> **NENHUM `P` POSSUI REVALIDAÇÃO NA FASE 6 COM IMPLEMENTAÇÃO PROPRIETÁRIA EM OUTRA FASE.**

Fato apurado por enumeração completa da coluna [16] da §14: o valor `6` **não ocorre** em nenhuma linha da coluna de revalidação, nas 149 linhas.

### 14.2 Outros vínculos

| Origem | Onde entra |
|---|---|
| `E5.52` | RF-M1, RF-M3, S9 |
| `R21` (parcela da Fase 6 — *"medição de shell e abertura"*) | RF-M1…RF-M5; a parcela `P-127` fica na Fase 9 |
| `D-DESIGN-LIVRO-VIVO` | RF-B1, RF-C1, RF-C2, RF-C9 |
| `D-STATUS-CARDS` | RF-C4, RF-C5, RF-C8 |
| `D-SELOS-ESTADO-V2` | RF-C6, RF-C7, T8 |
| `D-LP-FECHAMENTO` | RF-B7, T13, R-a |
| `v5` §3 — critério de saída | S1, S2, S3 |
| Direção de Arte v1.1 §2.4 | RF-A7, RF-C10, RF-C11, RF-C16 |

---

# ETAPA SDD 2 — CLARIFY

**Método:** varredura de ambiguidade resolvida, **nesta ordem**, por `v5` → `DECISIONS.md` → matriz canônica §14 → Direção de Arte v1.1 → Product Locks → Constituição → decisão do fundador de 2026-08-07 → fatos de runtime auditados. **Nenhuma pergunta é feita ao fundador sobre o que os documentos já resolvem.**

## 15. Ambiguidades levantadas e como foram resolvidas

| # | Ambiguidade | Resolvida por | Resolução |
|---|---|---|---|
| C1 | "Fase 6 = shell e splash" ou "shell, splash e sistema visual"? | `v5` §3 (árbitro de sequência) | **três eixos**; a redação reduzida era erro documental, corrigido em `a7d3568` |
| C2 | Selo do Plano Família é dourado (3 documentos) ou azul-noite (runtime)? | decisão do fundador → `D-SELOS-ESTADO-V2` | **azul premium luminoso e acolhedor**; nem dourado, nem azul-noite, nem roxo |
| C3 | Qual é o HEX exato do azul premium? | decisão do fundador, item 4 | **não é pergunta de produto**; derivação técnica no Plan a partir da Direção de Arte, paleta oficial, contraste e legibilidade |
| C4 | `P-139` é da Fase 3, da 6 ou da 9? | matriz §14 (árbitro único de inventário desde E018) | **Fase 6**; a divergência com `DECISIONS.md`/`v5` está registrada na própria linha e não é reaberta aqui |
| C5 | A Fase 6 deve coletar linha de base de desempenho? | `v5` §3 + matriz (`P-127` = Fase 9) | **não**; habilita o coletor, não coleta |
| C6 | Breakpoint de tablet é 600 ou 768? | Direção de Arte v1.1 §2.4 + `tokens.js` | **600** (canônico); os `>= 768` são o desvio a corrigir |
| C7 | `P-28` cabe na Fase 6 se três telas dependem das Fases 10/12B? | matriz §14, coluna [20] de `P-28` | **cabe a parcela sistêmica**; o resíduo das 3 telas é declarado, não implementado |
| C8 | O splash deve adotar `expo-splash-screen`? | Constituição (solução é do Plan) + regra de dependência nova | **não se decide aqui**; requisito é de produto, escolha técnica é do Plan, dependência nova exige aprovação prévia |
| C9 | Pode-se encerrar a Fase 6 sem tablet físico? | busca no corpus normativo | **não há autorização normativa**; §7 registra o bloqueio literal |
| C10 | Mexer na abertura reabre a trilha loading/performance? | `D-LP-FECHAMENTO` item 7 | **não**; entra apenas como regressão proibida (`RF-B7`, `T13`) |
| C11 | O `workflow.yml` reduzido autoriza pular Clarify/Checklist/Analyze? | Constituição (árbitro operacional) | **não**; fluxo de 10 etapas e 3 portões. Divergência registrada em `D-SDD-WORKFLOW-YML-DIVERGENCIA`, arquivo **não alterado** |
| C12 | O comentário `A0.7` no código valia como aprovação? | `v5` + `DECISIONS.md` | **não**; comentário de código nunca foi registro normativo. Substituído por decisão formal |
| C13 | Onde nasce a spec: `spec.md` (skill) ou `spec-<slug>.md` (projeto)? | convenção real de `specs/001`–`020` + instrução do fundador | **convenção do projeto**: `spec-<slug>.md`, Etapas 1–3 no mesmo arquivo |
| C14 | Validar tablet exige build exclusivo? | leitura de `eas.json` + natureza das mudanças | **não**; §11 separa aparelho, binário compatível e binário novo |
| C15 | O sistema visual da Fase 6 inclui substituir o mascote legado "Lumi" por "Beni"? | busca no corpus + leitura do runtime | **não há ambiguidade de produto**: "Lumi" sobrevive **apenas como identificador interno** (`LumiMoment`, `lumiReflections.js`, `src/components/lumi/*`); a superfície visível já diz **Beni** e **"Meu Momento"**. O resíduo interno é `P-53`, cuja fase proprietária é **12B/16** — **não** é puxado para cá. `RF-A5` trata **posição de rota**, não renomeação |
| C16 | Como verificar objetivamente "azul premium **luminoso e acolhedor**", se o HEX não é decidido aqui? | `D-SELOS-ESTADO-V2` + Direção de Arte v1.1 + critério de contraste AA + `tokens.js` | resolvida **sem perguntar ao fundador**: converte-se o adjetivo em **banda de aceitação objetiva** (§15.1), que restringe o HEX sem escolhê-lo |
| C17 | O que significa "eliminação **progressiva**" dos sistemas visuais concorrentes — qual é a fronteira? | Constituição (escopo de fase) + `v5` §3 (varredura visual de telas) | fronteira objetivada em `RF-C3`: eliminação **completa** nas superfícies tocadas pela fase; resíduo fora delas **inventariado nominalmente e atribuído**. "Progressiva" nunca significa "parcial e não declarada" |
| C18 | O **ícone de lançador**, hoje com fundo roxo `#7C3AED`, é "superfície de abertura"? | `v5` §3 (objetivo = abertura, splash, shell, sistema visual) + natureza do artefato | **não** — *resposta original, hoje **PARCIALMENTE SUPERADA**.* O ícone continua **não sendo** superfície de abertura, e `RF-B2` continua delimitado às quatro camadas renderizadas (é isso que o mantém binário). **PORÉM**, a emenda vinculante do **Portão Humano 2 (2026-08-07)** decidiu que o **valor `adaptiveIcon.backgroundColor`** entra na Fase 6 por um **eixo diferente** — não "abertura", mas **"cor aposentada em configuração nativa"**. Ver §4.8 e **`RF-B8`**. O **asset gráfico** permanece fora, como C18 concluiu. Árbitro da supersessão: **decisão explícita do fundador**, que precede a conclusão do agente |

### 15.1 Banda de aceitação objetiva do azul premium (deriva C16 — **não** escolhe o HEX)

O HEX continua sendo derivação do Plan. Esta spec fixa apenas o **envelope** que o Plan tem de respeitar, todo ele derivado de documento já vigente:

| # | Restrição | Origem | Verificação |
|---|---|---|---|
| B1 | Matiz dentro da faixa **azul** (≈ 200°–255° em HSL) — *"claramente reconhecível como azul"* | `D-SELOS-ESTADO-V2` item 3 | cálculo sobre o token |
| B2 | Matiz **estritamente abaixo** do início do roxo/lilás | `D2` (roxo aposentado) + `D-SELOS-ESTADO-V2` | cálculo sobre o token |
| B3 | Luminância relativa **estritamente maior** que a do azul-noite atual `#1C2B52` — *"mais luminoso"* | `D-SELOS-ESTADO-V2` item 3 | cálculo comparativo |
| B4 | Contraste do texto sobre o fundo do selo **≥ 4.5:1** (AA texto normal) | Direção de Arte v1.1 + `RF-C13` | cálculo de contraste |
| B5 | Distinguível do verde do Grátis e do dourado do Concluída por **matiz**, não só por claridade | `D-STATUS-CARDS` | cálculo sobre os três tokens |
| B6 | Legível sobre fundo claro **e** sobre fundo escuro, onde ambos ocorrerem | `RF-C13` | cálculo nos dois fundos |
| B7 | Nenhum dos três selos usa **vermelho** como sistema de erro | `D-STATUS-CARDS` + `RF-C8` | inspeção |

**A parcela irredutivelmente subjetiva** — *"acolhedor, sem aparência corporativa, pesada ou adulta"* — **não é decidida por cálculo**: é aprovada por **validação visual explícita** na Etapa 8. A banda B1–B7 garante que a proposta chegue a essa aprovação já dentro do que a decisão do fundador permite.

### 15.2 Mapa de cobertura da varredura (taxonomia Speckit)

| Categoria | Status |
|---|---|
| Objetivos e critérios de sucesso | **Clear** — §1, §5, §6 |
| Fora de escopo explícito | **Resolvido** — §4. A fronteira do ícone foi acrescentada por C18 e **reposicionada pela emenda do Portão 2**: o **valor de cor** do ícone adaptativo entra (`RF-B8`); o **asset gráfico e a marca** permanecem fora |
| Papéis / personas | **Clear** — estado de acesso entra só como selo; entitlement é área protegida |
| Modelo de dados / entidades | **Não aplicável** — a fase não cria nem altera entidade persistida |
| Ciclo de vida e transições de estado | **Clear** — camadas de abertura, RF-B3…RF-B6 |
| Volume e escala de dados | **Não aplicável** |
| Jornadas críticas | **Clear** — §10 |
| Estados de erro / vazio / carregamento | **Clear** — RF-B4, RF-C8, T10, T11 |
| Acessibilidade | **Clear** — RF-C10…RF-C15 |
| Localização | **Não aplicável** — app monolíngue PT-BR |
| Desempenho | **Clear** — alvo numérico pertence à Fase 9; aqui é não-regressão (RF-B7, T13) |
| Escalabilidade / disponibilidade | **Não aplicável** — local-first, sem backend |
| Observabilidade | **Resolvido** — RF-M1…RF-M5 |
| Segurança e privacidade | **Clear** — RF-M5 herda o plano de medição anônima da Fase 5 |
| Conformidade | **Clear** — mesma herança |
| Integrações externas | **Não aplicável** — nenhuma dependência nova é decidida aqui (C8) |
| Casos de borda e falha | **Clear** — T10, T11, §9.1 |
| Restrições e tradeoffs | **Resolvido** — §13.2 obriga a comparação no Plan |
| Terminologia | **Resolvido** — C15 |
| Sinais de conclusão | **Clear** — §6.2 binário, §6.3 separa fase de lançamento |
| Placeholders / adjetivos vagos | **Resolvido** — C16 e C17 converteram os três adjetivos remanescentes em critério verificável |

**Nenhuma categoria permanece Outstanding ou Deferred.**

## 16. Perguntas genuinamente pendentes ao fundador

**NENHUMA.** As **18** ambiguidades levantadas (C1–C18) foram resolvidas pelos documentos árbitros, pela decisão do fundador de 2026-08-07 ou pelos fatos de runtime auditados. Não há marcador `[NEEDS CLARIFICATION]` nesta spec.

Nenhuma pergunta foi feita ao fundador nesta etapa, por decisão dele própria — *"Não pergunte ao fundador aquilo que os documentos já resolvem"* e *"Não invente perguntas apenas para cumprir rito"*.

Duas escolhas ficam **explicitamente delegadas ao Plan** e **não** são perguntas de produto: o HEX exato do azul premium (C3) e a arquitetura do splash (C8). Ambas voltam ao fundador **apenas** se a análise técnica encontrar duas alternativas **materialmente diferentes de produto** que os documentos não consigam arbitrar.

---

# ETAPA SDD 3 — CHECKLIST DE REQUISITOS

> *"Testes unitários do texto"* — valida a **qualidade dos requisitos**, não a implementação.

## 17. Checklist

**Localização:** este checklist vive **dentro da spec**, e não em `checklists/`. É a convenção real do projeto — das 21 specs, **apenas a `001`** usa o diretório `checklists/`; de `002` a `020` o checklist mora no próprio `spec-<slug>.md`. Divergência declarada, não silenciada.

**Natureza:** cada item pergunta sobre **o texto**, não sobre o app. "O requisito está escrito de forma completa, clara, consistente, mensurável e coberta?" — nunca "o botão funciona?".

**Legenda:** `[Completude]` `[Clareza]` `[Consistência]` `[Mensurabilidade]` `[Cobertura]` `[Rastreabilidade]` `[Fronteira]` `[Lacuna]`

### 17.1 Clareza e ausência de ambiguidade

| ID | Item | Resultado |
|---|---|---|
| CHK001 | Cada requisito funcional declara **como será verificado**, sem depender de interpretação posterior? `[Mensurabilidade, §5]` | ✅ toda linha `RF-*` tem coluna de verificação própria |
| CHK002 | Os adjetivos herdados da decisão do fundador — *"luminoso"*, *"acolhedor"*, *"sem aparência corporativa"* — foram convertidos em critério objetivo ou explicitamente isolados como julgamento humano? `[Clareza, §15.1]` | ✅ B1–B6 objetivam o que é calculável; a parcela subjetiva é **nomeada como tal** e endereçada à aprovação visual da Etapa 8 |
| CHK003 | O termo *"eliminação progressiva"* tem fronteira definida, em vez de permitir entrega parcial não declarada? `[Clareza, RF-C3, C17]` | ✅ completo nas superfícies tocadas; resíduo **nominal** e atribuído |
| CHK004 | *"Superfície de abertura"* está delimitada nominalmente, de modo que `RF-B2` seja binário? `[Fronteira, RF-B2, C18]` | ✅ **revalidado na iteração 2 (emenda do Portão 2)** — as quatro superfícies renderizadas continuam nomeadas e `RF-B2` continua binário; o ícone adaptativo **saiu da exclusão e ganhou requisito próprio** (`RF-B8`), por um eixo diferente, **sem** contaminar a definição de "superfície de abertura" |
| CHK005 | Cada ambiguidade levantada aponta o **documento árbitro** que a resolveu, e não a opinião do agente? `[Rastreabilidade, §15]` | ✅ as 18 linhas de C1–C18 nomeiam o árbitro |
| CHK006 | Resta algum marcador `[NEEDS CLARIFICATION]`? `[Completude, §16]` | ✅ nenhum |

### 17.2 Testabilidade e critérios de aceite binários

| ID | Item | Resultado |
|---|---|---|
| CHK007 | Cada critério de saída é **binário** — atingido ou não —, sem faixa cinzenta? `[Mensurabilidade, §6.2]` | ✅ S1–S11 |
| CHK008 | O critério "nenhuma tela usando paleta de status paralela" define **qual é o conjunto de telas**, sem o qual não pode ser declarado atingido? `[Mensurabilidade, S3]` | ✅ **corrigido na iteração 1** — exige inventário nominal e cobertura de 100 % dele |
| CHK009 | Os requisitos com número (escala, tamanho, contraste, largura) trazem o número, e não o adjetivo? `[Clareza, RF-C10…RF-C16]` | ✅ 1.3 · 1.2 · 13 px · AA · 360/744/820 · 56×56 |
| CHK010 | A matriz de testes liga cada teste a um risco ou decisão nomeada? `[Rastreabilidade, §9]` | ✅ T1–T13 |
| CHK011 | Existem **controles negativos** — provas de que os testes falham quando devem falhar? `[Cobertura, §9.1]` | ✅ quatro controles declarados |
| CHK012 | Requisitos formulados como disjunção (`RF-A4`: adotar **ou** remover) permanecem objetivamente verificáveis? `[Mensurabilidade, RF-A4]` | ✅ o verificável é o estado final binário: **não permanece código morto** |

### 17.3 Rastreabilidade

| ID | Item | Resultado |
|---|---|---|
| CHK013 | Os **nove** `P` proprietários estão rastreados a requisito **e** a critério de saída — nenhum apenas citado? `[Rastreabilidade, §14.1]` | ✅ tabela completa de nove linhas |
| CHK014 | A categoria "`P` apenas revalidados na Fase 6" foi resolvida por enumeração, e não por silêncio? `[Completude, §14.1]` | ✅ declarada como **vazia**, com o método da apuração |
| CHK015 | `E5.52` está rastreada a requisito e a critério de saída? `[Rastreabilidade, §14.2]` | ✅ RF-M1, RF-M3 → S9 |
| CHK016 | `R21` aparece **apenas** na parcela que pertence à Fase 6? `[Consistência, §14.2]` | ✅ a parcela `P-127` fica declarada na Fase 9 |
| CHK017 | Os três critérios de saída literais do `v5` §3 estão rastreados? `[Rastreabilidade, §6.2]` | ✅ S1, S2, S3 |
| CHK018 | As decisões vinculantes (`D-DESIGN-LIVRO-VIVO`, `D-STATUS-CARDS`, `D-SELOS-ESTADO-V2`, `D-LP-FECHAMENTO`, `D2`, `D3`) estão rastreadas a requisito? `[Rastreabilidade, §14.2]` | ✅ |
| CHK019 | Ao menos 80 % dos itens deste checklist carregam referência de rastreabilidade? `[Rastreabilidade]` | ✅ **38 de 38** carregam |

### 17.4 Não antecipação e não reabertura

| ID | Item | Resultado |
|---|---|---|
| CHK020 | A spec proíbe explicitamente a coleta ou publicação de linha de base, mantendo `P-127` na Fase 9? `[Fronteira, §4.1 + RF-M4]` | ✅ |
| CHK021 | Habilitar o coletor está separado, no texto, de **usar** o coletor? `[Clareza, RF-M1 × RF-M4]` | ✅ requisitos distintos e explicitamente contrastados |
| CHK022 | A trilha loading/performance aparece **somente** como regressão proibida? `[Fronteira, RF-B7, T13]` | ✅ cabeçalho + §4.2 + risco R-a |
| CHK023 | Itens das Fases 7, 10, 11, 12A, 12B, 17, 19, 20 e 21 ficaram fora e **declarados**? `[Fronteira, §4.5, §13.1]` | ✅ |
| CHK024 | O resíduo de `P-28` que depende das Fases 10/12B está nomeado, em vez de diluído? `[Clareza, §4.3, S7]` | ✅ as três telas são nomeadas |
| CHK025 | Alguma dependência futura impediu especificar a parcela que **é** da Fase 6? `[Cobertura, §13.1]` | ✅ nenhuma — o resíduo é declarado sem bloquear a parcela própria |
| CHK026 | Áreas protegidas ficaram intocadas pelo texto? `[Fronteira, §4.4]` | ✅ |

### 17.5 Ausência de solução congelada prematuramente

| ID | Item | Resultado |
|---|---|---|
| CHK027 | A spec evita nomear a solução técnica de splash como requisito? `[Fronteira, §4.7, C8]` | ✅ `expo-splash-screen` aparece só como **fato do estado atual** (§2.1), nunca como obrigação |
| CHK028 | O HEX do azul premium é restringido sem ser escolhido? `[Fronteira, §15.1, C3]` | ✅ envelope B1–B7 sem HEX |
| CHK029 | O Plan é obrigado a **comparar alternativas**, em vez de herdar uma escolha implícita? `[Completude, §13.2]` | ✅ três alternativas mínimas com eixos de comparação |
| CHK030 | Os requisitos descrevem **resultado esperado**, não implementação? `[Clareza, §5]` | ✅ nenhum `RF-*` prescreve API, componente ou biblioteca |

### 17.6 Cobertura por plataforma, aparelho e eixo

| ID | Item | Resultado |
|---|---|---|
| CHK031 | **iOS** recebe tratamento explícito, não implícito? `[Cobertura, RF-B2, RF-B3, RF-C14, F2, F4, F8]` | ✅ |
| CHK032 | **Android** recebe tratamento explícito? `[Cobertura, RF-B2, RF-B3, RF-C14, F1, F4, F8]` | ✅ |
| CHK033 | **Tablet** recebe tratamento explícito, com a consequência de sua ausência declarada? `[Cobertura, §7, §8, RF-A6, RF-C16]` | ✅ inclusive o bloqueio literal do fechamento físico |
| CHK034 | Acessibilidade cobre escala, tamanho mínimo, contraste, semântica e movimento? `[Cobertura, RF-C10…RF-C15]` | ✅ cinco dimensões |
| CHK035 | Responsividade traz larguras de referência, e não "adaptar-se bem"? `[Mensurabilidade, RF-C16, §8]` | ✅ |
| CHK036 | Os **três** eixos têm requisitos próprios — nenhum eixo ficou só no título? `[Completude, §5.1–5.3]` | ✅ 7 + 7 + 9 requisitos |
| CHK037 | Estados de card estão cobertos com a proibição de paleta paralela **e** a regra de que cor não comunica sozinha? `[Cobertura, RF-C4, RF-C5, RF-C8]` | ✅ |
| CHK038 | Validação física futura é roteiro executável com prova nomeada, e não intenção? `[Mensurabilidade, §10]` | ✅ **revalidado na iteração 2** — F1–**F12** com aparelho e artefato de prova |
| CHK039 | A correção do ícone adaptativo tem **fronteira verificável pela negativa**, de modo que não possa escorregar para redesenho de marca? `[Fronteira, RF-B8, §4.8]` | ✅ **acrescentado na iteração 2** — `RF-B8` exige assets **byte-idênticos**; `T14` inspeciona; §9.1 tem o controle negativo de escopo; `F12` prova no lançador |
| CHK040 | A cor de substituição do ícone adaptativo tem **critério de escolha declarado**, em vez de ser arbitrada na implementação? `[Mensurabilidade, RF-B8]` | ✅ **acrescentado na iteração 2** — critérios do fundador: não roxo · da paleta canônica · sem token novo só para o ícone · harmônica com o *foreground* existente · contraste adequado no lançador · coerente com o novo splash · dourado não vira cor estrutural · não confundível com o azul premium. O valor exato é concluído em B4 **após inspeção factual do foreground**, e validado em `F12` |

### 17.7 Iterações de correção

O checklist **não passou de primeira**. Duas lacunas materiais foram encontradas e corrigidas na **iteração 1**:

| # | Lacuna encontrada | Item | Correção aplicada |
|---|---|---|---|
| 1 | *"Nenhuma tela usando paleta de status paralela"* não definia o conjunto de telas — o critério **não era binário** | CHK008 | S3 passou a exigir **inventário nominal de telas** e cobertura de 100 % dele |
| 2 | *"Nenhuma superfície de abertura é roxa"* não definia o que conta como superfície de abertura — o ícone de lançador, hoje `#7C3AED`, ficava em zona cinzenta | CHK004 | `RF-B2` nomeia as quatro superfícies; o ícone sai por **§4.8**, declarado e atribuído; ambiguidade registrada como **C18** |

**Iteração 2 (original):** todos os 38 itens aprovados. Nenhum item permanece não aprovado.

#### Revalidação direcionada — emenda vinculante do Portão Humano 2 (2026-08-07)

A decisão do fundador de trazer o `adaptiveIcon.backgroundColor` para a Fase 6 é **mudança material de requisito após o Portão 1**. Pela Regra de Ouro, o requisito voltou aos artefatos. A revalidação foi **direcionada aos itens afetados**, não integral — os demais 36 itens não foram reabertos porque a emenda não os toca.

| Item | Estado antes | Ação | Estado depois |
|---|---|---|---|
| CHK004 | ✅ (ícone excluído por §4.8) | **revalidado** — a exclusão deixou de valer para o valor de cor; verificado que `RF-B2` **continua binário** porque a definição de "superfície de abertura" não foi alterada | ✅ |
| CHK038 | ✅ (F1–F11) | **revalidado** — roteiro estendido para F1–**F12** | ✅ |
| CHK039 | — | **acrescentado** — fronteira do escopo restrito, verificável pela negativa | ✅ |
| CHK040 | — | **acrescentado** — critério de escolha da cor declarado | ✅ |

**Resultado da revalidação direcionada: 40/40 itens aprovados.** Nenhuma regressão: nenhum item passou de aprovado para não aprovado. Nenhum item fora do alcance da emenda foi tocado.

### 17.8 Ressalva metodológica declarada

> Este checklist valida **a qualidade dos requisitos**, não a realidade física. Nenhum ✅ acima significa que algo foi observado em aparelho. Todo item de §10 permanece **NÃO DETERMINADO SEM EXECUÇÃO FÍSICA**.

---

## 18. Estado deste artefato

| Campo | Valor |
|---|---|
| Etapas concluídas | **1 (Specify) · 2 (Clarify) · 3 (Checklist)** · **emenda vinculante do Portão Humano 2 aplicada em 2026-08-07** |
| Portões vencidos | **🚦 Portão Humano 1** aprovado · **🚦 Portão Humano 2** aprovado **com duas emendas vinculantes** |
| Emenda 1 aplicada a este artefato | `adaptiveIcon.backgroundColor` entra na Fase 6 — §4.8, `RF-B2`, **`RF-B8`**, `T14`, §9.1, **`F12`**, C18 (supersessão parcial), CHK004, CHK038, **CHK039**, **CHK040** |
| Emenda 2 (divergência P-31 10×11) | **não** altera requisito — o critério permanece **zero navegações inefetivas no escopo**; a reconciliação por evidência histórica é tarefa da **Etapa 6 (Analyze)** |
| Etapa seguinte | **Etapa SDD 5 (Tasks)** → **Etapa SDD 6 (Analyze)** → **🚦 Portão Humano 3** |
| Proibido antes do Portão 3 | implementação, alteração de runtime, `npm ci`, Metro, build, instalação, validação física, push |
| Runtime alterado por este artefato | **nenhum** |
| Push | **não realizado** |
