# 09 · Matriz de riscos e pendências

> **Artefato 9 de 11 — E015 · Fase 3G · Reconciliação**
> **Versão 2 — corpus `P-01` a `P-117` restaurado integralmente.**

| Campo | Valor |
|---|---|
| **Estado** | **PRELIMINAR PARA PRODUCT LOCK** |
| **Base auditada** | E009 a E014 |
| **Branch auditada** | `integrate/colorir-canonical-runtime` |
| **HEAD canônico** | `015c438106538595b592981fbe1b80b1d5d65e55` |
| **Total de riscos** | **131** — `P-01` a `P-117` (herdados) + `P-118` a `P-131` (novos de E015) |
| **Data** | 5 de agosto de 2026 |

---

## 0 · Declaração de natureza e de escopo

**Este artefato não implementa funcionalidade e NÃO CORRIGE NENHUM DEFEITO.**

> ## ⚠️ ESTA MATRIZ É **PRELIMINAR**
> **E016 produzirá a matriz única e definitiva.** Nenhum bloqueador é fechado aqui.
> Nenhum item é declarado resolvido. Nenhum código foi renumerado.

### 0.1 · Convenção de preenchimento — leitura normativa obrigatória

Onde a informação **não existe** nas entregas E009 a E014, a célula traz o token **`ND`**, que
significa, sem exceção e sem outra leitura possível:

> ### `ND` ⇔ **NÃO DETERMINADO NO CORPUS RECUPERADO**

`ND` **não** significa "não se aplica", "irrelevante", "zero" nem "verificado como ausente".
Significa exclusivamente que **a auditoria de origem não registrou aquele campo para aquele
código** e que **E015 se recusou a preencher por inferência silenciosa**.

### 0.2 · Duas escalas de severidade coexistem — e isso é fiel à origem

As auditorias E009 a E012 classificaram em **alta · média · baixa**. A auditoria E013 classificou
em **P1 · P2 · P3 · P4**. E014 **não** atribuiu severidade, apenas domínio e fase.
**E015 preservou a escala original de cada código e não converteu nenhuma.** Unificar as escalas é
**trabalho de E016** e está registrado em §11 como item não determinado.

---

## 1 · Correção de E015 — restauração do corpus

Esta seção substitui a antiga §1 ("o corpus não está versionado"), que sustentava uma conclusão
**parcialmente errada**. O registro do erro é preservado por dever de rastreabilidade.

### 1.1 · A contradição do `git grep`, resolvida

A entrega anterior de E015 afirmou **duas coisas aparentemente incompatíveis**: que `git grep` não
encontrava nenhum `P-XX` nos artefatos, e que `P-87` permanecia registrado no artefato 09.

**Ambas eram verdadeiras, em momentos distintos.** `git grep` sem argumento de *commit* busca
apenas em **arquivos rastreados**. Quando a varredura foi executada, os onze artefatos ainda eram
*untracked* — logo, invisíveis ao comando. `P-87` já estava escrito no artefato 09 salvo em disco.

Reexecutando contra o *commit*, os códigos aparecem:

```
git grep -n -E "P-[0-9]{2,3}" HEAD -- docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md
→  P-01 · P-87 · P-115 · P-116 · P-117 · P-118 · P-119
```

— `COMPROVADO PELO CÓDIGO`

### 1.2 · O que permanecia verdadeiro, e o que era erro

| Afirmação da entrega anterior | Veredito |
|---|---|
| O corpus `P-01` a `P-117` **não está versionado em nenhum arquivo do repositório** | **verdadeiro** — confirmado por varredura de 481 *commits* em todas as *refs* |
| `git grep` não retornava `P-XX` nos artefatos | **verdadeiro no momento da execução** (arquivos *untracked*) |
| `P-87` constava do artefato 09 | **verdadeiro** — em prosa, na §6 da versão 1 |
| **O corpus era irrecuperável** | **FALSO — este foi o erro** |
| **Criar 27 códigos paralelos `E015-N##` era a única saída** | **FALSO — consequência do erro acima** |

### 1.3 · A causa do erro e a fonte que restaurou o corpus

O erro foi metodológico: E015 procurou o corpus **apenas no repositório** e ignorou a **fonte
autorizada nº 1** do próprio mandato — *"os relatórios entregues de E009 a E014 nesta sessão"*.
Esses relatórios contêm as **tabelas canônicas completas**, com título, evidência, severidade e
fase de cada código.

**Resultado da recuperação:**

| Medida | Valor |
|---|---|
| Códigos `P-` presentes no artefato 09 **antes** da correção | **7** — e todos apenas como *referência em prosa*, nenhum como linha canônica |
| Códigos `P-01` a `P-117` **ausentes** antes da correção | **112** |
| Códigos recuperados com **linha de tabela canônica de origem** | **117 de 117** |
| Códigos recuperáveis apenas por prosa | **0** |
| Códigos **sem nenhuma fonte** | **0** |

> **Conclusão:** o corpus era **recuperável**. A conclusão de irrecuperabilidade era prematura e
> está formalmente retratada aqui.

### 1.4 · Nota sobre `P-118` e `P-119` na versão 1

Na versão 1 deste artefato, `P-118` e `P-119` aparecem **exclusivamente** em texto que determina
**não criá-los** (§7 item 2). **Nunca foram definidos como riscos.** O espaço numérico a partir de
`P-118` estava, portanto, **livre** — e é usado nesta versão para os achados genuinamente novos.

---

## 2 · Correções metodológicas herdadas de E014

As cinco correções são **entradas desta matriz**, não nota de rodapé: cada uma marca um ponto onde
uma formulação anterior **superestimava** o que a evidência sustentava.

| # | Formulação incorreta | Formulação correta obrigatória |
|--:|---|---|
| 1 | ~~"Todas as chamadas de rede são GET."~~ | Existem **três pontos explícitos de fetch** para manifestos e mídia e uma integração externa com o SDK RevenueCat. O **método HTTP interno do SDK não é determinado** pelo código do aplicativo. |
| 2 | ~~"Nenhum dado da criança sai do aparelho."~~ | **Não existe upload explícito** de conteúdo infantil no código. A integração RevenueCat existe e seu **envelope técnico de dados precisa de auditoria** jurídica e técnica nas **Fases 5, 18 e 19**. |
| 3 | ~~"As dezoito histórias premium funcionam integralmente offline."~~ | A **mídia local existe**, mas o **acesso depende do entitlement**. Separar mídia, autorização, cache válido e pack instalado. |
| 4 | ~~"Asset entregue por pack = zero."~~ | **Zero payloads de pack versionados no repositório.** O estado de packs **instalados no aparelho** é independente e não foi levantado. |
| 5 | ~~"Zero mídia validada fisicamente."~~ | **Zero auditorias físicas individuais** dos 200 arquivos. **Preservar** as validações físicas históricas dos fluxos que consumiram mídia, packs, áudio e recovery. |

---

## 3 · Os 14 campos canônicos por risco

| # | Campo | Conteúdo |
|--:|---|---|
| 1 | **Código** | `P-##` — preservado da auditoria de origem, nunca renumerado |
| 2 | **Descrição factual original** | o enunciado tal como a auditoria de origem o registrou |
| 3 | **Evidência** | `arquivo:linha`, documento ou classificação de evidência |
| 4 | **Superfícies afetadas** | tela, serviço, domínio ou eixo |
| 5 | **Impacto infantil** | consequência para a criança usuária |
| 6 | **Impacto técnico** | consequência para o sistema |
| 7 | **Severidade preliminar** | escala da origem (`alta/média/baixa` ou `P1…P4`) |
| 8 | **Fase proprietária** | fase do Roteiro Mestre, ou `E016` |
| 9 | **Dependências** | outro `P-` ou tarefa da qual depende |
| 10 | **Revalidação** | forma de reconferir (física, em tablet, interna…) |
| 11 | **Product Lock preliminar** | **proposta**, não decisão — E016 fecha |
| 12 | **Lançamento preliminar** | **proposta**, não decisão — E016 fecha |
| 13 | **Estado** | aberto · ratificado · rebaixado · parcialmente refutado · corrigido |
| 14 | **Auditoria de origem** | E009…E015 que levantou e que refinou |

---

## 4 · Tabela canônica de riscos — `P-01` a `P-131`

> **Uma linha canônica por código.** Referências cruzadas em outras seções deste artefato citam o
> código, mas **não** criam segunda definição concorrente.
> `ND` ⇔ **NÃO DETERMINADO NO CORPUS RECUPERADO** (§0.1).

| Código | Descrição factual original | Evidência | Superfícies | Impacto infantil | Impacto técnico | Sev. | Fase | Depend. | Revalid. | Lock prelim. | Lanç. prelim. | Estado | Origem |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-01** | Ausência de motor canônico de jornada | `COMPROVADO PELO CÓDIGO` · artefato 02 | jornada | ND | ND | alta | 4 | ND | ND | **sim** | não | aberto | E010; ampliado por `E015-N03` |
| **P-02** | Ausência do `ContentRotationEngine` | `COMPROVADO PELO CÓDIGO` · artefato 03 | descoberta / conteúdo diário | ND | ND | média | futura | ND | ND | não | não | aberto | E010; ampliado por `E015-N10` |
| **P-03** | "Aventura concluída" com 3 textos e 2 regras | `CongratsScreen:241` é **incondicional**; `StoryDetailScreen:522` usa o predicado certo — a contradição é da Congrats | Congrats, Story Detail | ND | ND | alta | 4 | ND | ND | **sim** | não | aberto (refinado) | E010, refinado por E011 |
| **P-04** | 4 algoritmos de próxima história | Home usa ordem de array; Mapa usa `ORDERED_STORY_IDS`; `nextAdventureService` usa `CATALOG` | Home, Mapa, jornada | ND | ND | alta | 4 | ND | ND | **sim** | não | aberto (refinado) | E010, refinado por E011; ampliado por `E015-N04` |
| **P-05** | Home sem filtro de acesso/sequência | Caso reprodutível: fechadas as 2 grátis, a Home recomenda `david_goliath` (**premium**). 18/20 histórias são premium | Home | ND | ND | alta | 4 | ND | ND | **sim** | **a avaliar** | aberto (refinado) | E010, refinado por E011 |
| **P-06** | Contiguidade presumida (`:319`, `:367`) → **beco sem saída** | Em progresso não contíguo a cena pendente fica `locked` e nenhuma fica `available` (`isDone` precede `isCurrent`) | Mapa, jornada | ND | ND | alta | 4 | ND | ND | **sim** | **a avaliar** | aberto — **candidato grave** | E010, refinado por E011; ratificado em E013 |
| **P-07** | Congrats inalcançável após *kill* (caso 3) | **Parcialmente refutado** — a Congrats é reencontrável pela lista de cenas ("Ver conclusão →" → `NarrationScreen:175`); conquistas são derivadas a cada chamada | Congrats | ND | ND | baixa *(era média)* | 4 | ND | ND | não *(era sim)* | não | **parcialmente refutado** | E010, rebaixado por E011 |
| **P-08** | `hasPendingRewards` exclui colorir | `ProgressContext.js:81` (`!storyBookOpened \|\| !quizDone \|\| !reflectionDone`); `postStoryStorage.js:53` — 3 termos por história, exclui Colorir, Cultinho **e** Meu Momento | Story Detail, pós-história | ND | ND | média | 9 | ND | ND | não | não | aberto (ampliado) | E010; E011; ampliado por E012 |
| **P-09** | Troca `jonah`↔`esther` entre `catalog` e `stories` | `COMPROVADO PELO CÓDIGO` | dados / catálogo | ND | ND | média | 4 | ND | ND | **sim** | não | aberto | E010 |
| **P-10** | Namespace duplo `comece` / `comece_aqui` | `COMPROVADO PELO CÓDIGO` · `catalog.js:14` × `stories.js` | dados / trilha | ND | ND | baixa | 4 | ND | ND | não | não | aberto | E010; reconfirmado por `E015-N07` |
| **P-11** | `DECISAO_CONTRATO_JORNADA.md:33` desatualizado | `COMPROVADO PELO DOCUMENTO` | documentação | ND | ND | baixa | 4 | ND | ND | não | não | aberto | E010 |
| **P-12** | 17 comentários dizem `coming_soon` | `COMPROVADO PELO CÓDIGO` | documentação de código | ND | ND | baixa | 4 | ND | ND | não | não | aberto | E010 |
| **P-13** | `setItem` sem `await` | `coloring60MilestoneInviteSeen.js:61`; mitigado pela guarda de sessão `:34`/`:60` | Colorir | ND | ND | baixa | 9 | ND | ND | não | não | aberto (mitigado) | E010; confirmado por E012 |
| **P-14** | `IN_PROGRESS` inalcançável no Colorir | `IN_PROGRESS` sem produtor; `coloring60Journey.js:340-342` declara por escrito; os 2 chamadores não passam o mapa | Colorir | ND | ND | baixa | 9 | ND | ND | não | não | **confirmado** | E010; confirmado por E012 |
| **P-15** | 15 encerramentos *bespoke*, sem padrão | E012 acrescenta **5 encerramentos** *bespoke* entre Livro, Cultinho, Meu Momento e C60 (§13) | múltiplas telas | ND | ND | média | 4 | ND | ND | **sim** | não | aberto (ampliado) | E010; ampliado por E012 |
| **P-16** | 3 pares de colisão de overlay sem fila | **7 pares** (não 3) e **prova negativa**: zero gerenciador central de overlays em todo `src/`; **+1 par novo** em E013 (`esgotarTempo` do Palavrinhas) | overlays (global) | ND | ND | média | 4 | ND | ND | **sim** | não | aberto (ampliado 2×) | E010; ampliado por E011 e E013; reconfirmado por `E015-N27` |
| **P-17** | `isFirstStory: true` *hardcoded* | `StoryDetailScreen.js:287-296`; **35 hardcodes mapeados, 12 impedem escala** | Story Detail | ND | ND | média | 4 | ND | ND | **sim** | não | aberto (ampliado) | E010; ampliado por E011 |
| **P-18** | `unlocked={isCompleted}` no Colorir (JRN C60 01) | `StoryDetailScreen.js:573` → `unlocked !== true → LOCKED` **antes** do `doneMap` → cards concluídos ficam `disabled`; reconfirmada nas 7 conclusões, **correção não implementada** | Story Detail, Colorir | ND | ND | baixa | 9 | ND | ND | não | não | aberto (reconfirmado) | E010; E011; reconfirmado por E012 |
| **P-19** | Ramo A da Home decide por `totalStars`, não por progresso | `COMPROVADO PELO CÓDIGO` | Home | ND | ND | baixa | 4 | ND | ND | não | não | aberto | E010 |
| **P-20** | Tablet não validado (E039) | Nenhum módulo C60 consulta `isTablet`; Livrinho trata tablet em 1 ponto; Meu Momento e Cultinho, em nenhum | aparelhos / layout | ND | ND | média | 7 | ND | ND | não | **a avaliar** | aberto (ampliado) | E010; ampliado por E012; reconfirmado por `E015-N20` |
| **P-21** | Revisão com A Criação concluída (E042) | `COMPROVADO PELO DOCUMENTO` | QA / revisão | ND | ND | baixa | 7 | ND | ND | não | não | aberto | E010 |
| **P-22** | CTA do Story Detail: rótulo por `isFullyComplete`, ação por `isCompleted` → "Continuar aventura" reabre a cena 1 | `COMPROVADO PELO CÓDIGO` | Story Detail, Narration | **alto** — a criança reinicia sem querer | dois predicados para um botão | **alta** | 4 | `P-01` | física | não | **sim** | aberto | E011 |
| **P-23** | CTA habilitado e **inerte** na janela de hidratação (`canEnterStoryContent` false não desabilita) | `ProgressContext.isLoadingProgress` | Story Detail | médio — toque sem resposta | `disabled` incompleto | média | 4 | — | física | não | sim | aberto | E011 |
| **P-24** | Plano Família **sem caminho de compra** (`isPurchaseEnabled: false`, `status: 'comingSoon'`) com 18/20 histórias premium | `planConfig.js:40-56` — `PLAN_PRICING.monthly`/`.annual` ambos `comingSoon`, `productIdPlaceholder:''`; `ENABLE_LOCAL_PREMIUM_TEST_MODE = false` | Story Detail, ParentArea, Home | **alto** — promessa sem cumprimento | monetização inexistente | **alta** | 4 / 18 | `P-05` | **18 e 21** | não | **sim** | **bloqueador confirmado** | E011; reconfirmado por E012; evidência direta em E013 |
| **P-25** | `uiState === 'error'` anula `configMissing` no bloco de download | `useStoryPackDownload` | Story Detail | baixo | causa de falha incorreta | média | 4 / 7 | — | física | não | não | aberto | E011 |
| **P-26** | Mapa cego a pack ausente e a erro de download (`mediaReady` só reage a `coming_soon`) | `storyJourneyService:109` | Mapa | médio | representação incompleta | média | 4 | `P-01` | física | não | sim | aberto | E011 |
| **P-27** | Tipografia sem proteção: zero `allowFontScaling`/`maxFontSizeMultiplier`; ~30 textos <13px; 4 contrastes reprovados AA | +4 textos <13px em E012 (Cultinho 2, Meu Momento 2); **`allowFontScaling` = zero em todo `src/`** (E013) | 5 telas · design system | **alto** — acessibilidade | quebra com fonte grande do SO | **alta** | 7 | E039 | física | não | não | **a avaliar** | aberto (quantificado) | E011; ampliado por E012 e E013 |
| **P-28** | Semântica de acessibilidade ausente: roles/labels/states esparsos, zero `announceForAccessibility`, sem `accessibilityViewIsModal`, sem *reduce-motion* | **0** `accessibilityRole` em Cultinho, Meu Momento e Livrinho; 3 telas com a11y **totalmente zerada** | 5 telas | alto | leitor de tela sem contexto | **alta** | 7 | `P-27` | física | não | **a avaliar** | aberto (quantificado) | E011; ampliado por E012 e E013 |
| **P-29** | `AppScreen.js` é código morto; cada tela improvisa *safe area* | `COMPROVADO PELO CÓDIGO` | 5 telas | médio | duplicação e divergência | média | 7 | — | física | não | não | aberto | E011 |
| **P-30** | Dois **sistemas** de *breakpoint* concorrentes (768 no código × 600 em `tokens.js`) | `>= 768` em 10 pontos × `breakpoints.tablet = 600` (`tokens.js:128`) usado por `ContentContainer.js:22`; Livrinho usa 768 (`StoryBookScreen.js:195`) | todas · `tokens.js` | médio | layout imprevisível em 600–767 px | média | 7 | E039 | **física em tablet** | não | não | aberto (reformulado) | E011; confirmado e reformulado por E013 |
| **P-31** | **11 navegações inefetivas no tablet** (8 `navigate('Home',{screen})` + 3 nomes de aba) e ausência de `BackHandler` no `TabletLayout` | Cultinho: `navigate('Home',{screen:'Aventuras'})` `:56` e `{screen:'Estrelinhas'}` `:183` **não trocam de aba** em ≥768px | navegação global · `AppNavigator` | alto — becos sem saída | *payload* descartado por construção | **alta** | 7 | `P-20` / E039 | **física em tablet** | não | **a avaliar** | aberto (ampliado) | E011; ampliado por E012 |
| **P-32** | `resetOnboardingForQa` **grava** a chave em vez de remover e não cobre tour nem guias (QA REP 01) | `@ptf_onboarding_v1` | Onboarding, ParentArea | nenhum (interno) | QA não reproduz a 1ª experiência | baixa | 7 | — | interna | não | não | aberto | E011 |
| **P-33** | ONB IMG 01 — borda visível do Beni por 3 causas somadas (PNG opaco + `borderWidth` + `beniBg ≠ paper`) | assets + `StorybookBeni` | Onboarding | médio — qualidade percebida | — | média | 7 | não reabre Spec 020 | física | não | não | aberto | E011 |
| **P-34** | ONB BRI 01 — `BRINCAR_GUIDE` só especificado; `ATELIER_GUIDE` sem consumidor; áudios `guide.brincar.*` inexistentes | `beniGuides` | Onboarding, Brincar | médio | guia prometido e ausente | média | 7 | 12A | **após 12A** | não | não | aberto | E011 |
| **P-35** | STR ONB 01 — transporte do estado de guia até a 1ª entrada em Estrelinhas, com risco de camadas simultâneas | `beniTourService` (memória); *whitelist* de `progressResetService.js:34-63` sem chaves de guia e sem `@ptf_brincar_*` | Onboarding, Estrelinhas | médio | overlays sobrepostos | média | **11** | E013 | física | não | não | **sustentado** | E011; sustentado por E013 |
| **P-36** | Assimetria oferta×exigência do C60: `storyColoringAvailability` é agnóstico de história, mas piloto/detalhe/assets estão presos a `creation` — nova história exigiria colorir sem entrada de UI | `storyColoringAvailability.js:69-74` × `coloring60Pilot.js:44-45`, `StoryDetailScreen.js:139-142`, `coloring60LocalAssets.js` | C60 | ND | ND | alta | 9 | ND | ND | ND | ND | aberto | E012; reconfirmado por `E015-N26` |
| **P-37** | Copy do Livro promete pintura da criança removida no P3J | `StoryDetailScreen.js:534`, `PostStoryHubScreen.js:122` | Livrinho | ND | ND | média | 10 | ND | ND | ND | ND | aberto | E012 |
| **P-38** | Livro: abrir = concluir com 1 toque; sem distinção abrir/ler/terminar; sem progresso por página; sem retomada | `StoryBookScreen.js:401`, `:407`, `:500`, `:340` | Livrinho | ND | ND | média | 10 | ND | ND | ND | ND | aberto | E012 |
| **P-39** | `totalBonusStars` sem consumidor de UI: a estrela do Meu Momento é gravada e **nunca exibida** | `ProgressContext.js:140` (único *hit*) × `rewardService.js:26`; `totalBonusStars` separado de `totalStars` ⇒ bônus não destravam avatares | Meu Momento, Estrelinhas | ND | ND | alta | 4 / 7 | ND | ND | ND | ND | **confirmado** | E012; confirmado por E013 |
| **P-40** | Chave diária em **UTC**: em UTC-3 o dia vira às 21h ⇒ duas estrelas no mesmo dia civil | `postStoryStorage.js:6` | Meu Momento | ND | ND | média | 7 | ND | ND | ND | ND | aberto (ampliado) | E012; ampliado por `E015-N08` |
| **P-41** | Cultinho não idempotente (`count++` sem *dedupe* por `lastDate`) | `familyWorshipService.js:55` | Cultinho | ND | ND | média | futura | ND | ND | ND | ND | aberto | E012 |
| **P-42** | Ramo `ParentArea` do Cantinho do Beni é **código morto**; "Pedir ao responsável" nunca renderiza | `accessControl.js:130-132` × `HomeScreen.js:746-749`, `:525` | Home | ND | ND | baixa | 4 | ND | ND | ND | ND | aberto | E012 |
| **P-43** | "Repita com Beni" pede repetição em voz alta sem áudio, TTS, tempo ou confirmação | `LumiMomentScreen.js:96-99` | Meu Momento | ND | ND | média | futura | ND | ND | ND | ND | aberto | E012 |
| **P-44** | Home × Meu Momento divergem em 5 dos 7 dias; *teaser* rotulado "versículo" exibe texto que não é versículo | `HomeScreen.js:39-47` × `lumiReflections.js:93-101` | Home, Meu Momento | ND | ND | média | 4 | ND | ND | ND | ND | aberto | E012 |
| **P-45** | Nomenclatura tríplice visível do Livro + nome futuro planejado ainda não decidido | E012 §10 | Livrinho | ND | ND | média | 10 | ND | ND | ND | ND | aberto | E012 |
| **P-46** | Falha de escrita **silenciosa** em Livro, Cultinho e Meu Momento (contraste com a detecção do Colorir) | `postStoryStorage.js:39,:84,:94`; `familyWorshipService.js:59-63` | Livrinho, Cultinho, Meu Momento | ND | ND | média | 7 | ND | ND | ND | ND | aberto | E012 |
| **P-47** | `LumiMoment` e `StoryBook` são rotas **raiz**, irmãs de `MainTabs`: em tablet a sidebar desaparece e não há `maxWidth` de leitura | `AppNavigator.js:281-285`, `:514-518`, `:532-536` | navegação, tablet | ND | ND | média | 7 | ND | ND | ND | ND | aberto | E012 |
| **P-48** | Documentação desatualizada sobre o Livrinho (5 arquivos) | `AUDIO_PIPELINE_GUIDE.md:198`; `ATELIER_GUIDE.md:268,:501`; `LIVRINHO_UX_1.md:7`; `STORYBOOK_GUIDE.md:304`; `FIRST_AUDIO_PILOT_CHECKLIST.md:93` | documentação | ND | ND | baixa | 10 | ND | ND | ND | ND | aberto | E012 |
| **P-49** | `storyBookPagesService` + `getBestStoryBookVisual`/`getBookPageImageSource`: capacidade "arte da criança no livro" **viva no código, morta no runtime** | verificado pelo integrador | Livrinho | ND | ND | média | 10 | ND | ND | ND | ND | aberto | E012 |
| **P-50** | `markStoryColoringActivityDone` **sem consumidor**; `@ptf_coloring_done_*` nunca é escrita, *readers* vivos | `coloringActivityService.js:28` × `ProgressContext.js:198`, `StoryDetailScreen.js:226` | Colorir | ND | ND | baixa | 9 | ND | ND | ND | ND | aberto | E012 |
| **P-51** | Ordem canônica das 3 atividades replicada em 4 lugares | E012 §16 item 2 | pós-história | ND | ND | baixa | 9 | ND | ND | ND | ND | aberto | E012 |
| **P-52** | Política antiga "Grátis conclui sem persistir" ainda afirmada em presente em **6 pontos** de 4 arquivos | E012 §8 | documentação de código | ND | ND | baixa | 9 | ND | ND | ND | ND | aberto | E012 |
| **P-53** | Órfãos do domínio Meu Momento: `LUMI_REFLECTIONS` (legada, vazia), `LUMI_FEELINGS`, `LUMI_LEARNED`, `LUMI_PRAYERS`, `LEARNING_VERSES`, 5 *wrappers* `components/lumi/` | `lumiReflections.js:1-91`; `src/components/lumi/*`; **ampliado**: `ATELIER_GUIDE` + 5 áudios `guide.atelier.*` órfãos | Meu Momento, guias | ND | ND | baixa | futura | ND | ND | ND | ND | aberto (ampliado) | E012; ampliado por E013 |
| **P-54** | Cultinho sem rotação: `getStoryOfTheWeek` = vitrine ⇒ mostra sempre A Criação; chamado 2× | `familyWorshipService.js:75-77`; `CultinhoEmCasaScreen.js:47-48` | Cultinho | ND | ND | média | futura | ND | ND | ND | ND | aberto | E012; reconfirmado por `E015-N09` |
| **P-55** | Mina armada: `usePuzzleController` grava conclusões **reais** na galeria canônica, **sempre em `creation_scene_01`**; guarda `isPremium` inócua sob Modo Criador. Neutralizada só por inalcançabilidade | `usePuzzleController.js:307-308` grava `saveCompletion` real; `MonteACenaGameV2Screen.js:40` cai em `MONTE_A_CENA_CATALOG[0]` → `creation_scene_01` (`monteACenaCatalog.js:100`); rota `MonteACenaGameV2` **não é navegada por ninguém** | Monte a Cena, Galeria | ND | ND | **P1 latente** | 12A | ND | ND | Não | **Sim** | **RATIFICADA** | E013 |
| **P-56** | `catch` **fail-open** no consumo de rodada: erro de storage libera rodada infinita | `MonteACenaTableGameScreen.js:456` e `:467` — `catch { r = { ok:true, remaining:Infinity, premium:true } }` | Monte a Cena | ND | ND | **P1** | 12A | ND | ND | Não | **Sim** | **RATIFICADA** | E013 |
| **P-57** | Rodada fabricada na retomada: `remaining: premium ? Infinity : 1` sem ler storage; `canReplay` oferece "Montar novamente" com 0 rodadas reais | `:451` e `:497` (`canReplay = premium \|\| state.remaining > 0`) | Monte a Cena | ND | ND | **P2** | 12A | ND | ND | Não | **Sim** | **RATIFICADA** | E013 |
| **P-58** | Recusa **silenciosa** no `handleReplay` — criança toca e nada acontece | `MonteACenaTableGameScreen.js:468` | Monte a Cena | ND | ND | **P2** | 12A | ND | ND | Não | **Sim** | **RATIFICADA** | E013 |
| **P-59** | Chip de plano do Brincar **corta em 100% dos estados** | `BrincarScreen.js:238, 386, 390, 198-204` — `COMPROVADA PELO CÓDIGO + FISICAMENTE` | Brincar | ND | ND | **P2** | 12A | ND | física (já feita) | Não | **Sim** | **RATIFICADA** | E013 |
| **P-60** | `headerTitle` do Brincar sem `numberOfLines`/`lineHeight` em coluna de ~118 dp — ofensor visual dominante do defeito de topo | `BrincarScreen.js:233, 379, 371, 231` — `COMPROVADA PELO CÓDIGO + FISICAMENTE` | Brincar | ND | ND | **P2** | 12A | ND | física (já feita) | Não | **Sim** | **RATIFICADA** | E013 |
| **P-61** | Sugestão diária **não vira à meia-noite** (dependência `[childId]`) | `BrincarScreen.js:190-195` (`dayKey` dentro do `useMemo` de dep. `[childId]`) | Brincar | ND | ND | **P2** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-62** | `DEFAULT_PROFILE` **sem campo `id`** ⇒ sugestão chaveada pelo `avatarId`; trocar avatar troca a sugestão | `ProfileContext.js:9-13` × `BrincarScreen.js:191` | Brincar, Perfil | ND | ND | **P3** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-63** | Galeria: "N de **0** artes salvas" e **divisão por zero** (`NaN` na barra) | `AtelierGalleryScreen.js:113` ("N de 0") e `:116` `Math.min(n/0,1)` — cabeçalho **incondicional** (`ListHeaderComponent`, sem guarda de plano) | Galeria | ND | ND | **P1** | 12A | ND | ND | **Sim** | **Sim** | **RATIFICADA** | E013 |
| **P-64** | Área dos Pais promete "**3 artes salvas**" contra limite real 0 | `ParentAreaScreen.js:840` × `atelierStorage.js:10` = 0 · arquivo alterado, **reauditado** | Área dos Pais | ND | ND | **P1** | 12A | ND | ND | **Sim** | **Sim** | **RATIFICADA** | E013 |
| **P-65** | "Criar livre" promete "guarde suas criações" a quem tem limite 0 | `BrincarScreen.js:306` · `AtelierCanvasScreen.js:273` (`0 >= 0` bloqueia todo salvamento grátis) | Brincar, Canvas | ND | ND | **P1** | 12A | ND | ND | **Sim** | **Sim** | **RATIFICADA** | E013 |
| **P-66** | Mensagem comercial dentro de `accessibilityLabel` | `BrincarScreen.js:324` | Brincar (a11y) | ND | ND | **P2** | 12A | ND | ND | **Sim** | Não | **RATIFICADA** | E013 |
| **P-67** | **Quatro textos "Ateliê" visíveis à criança** sobrevivem no Baú | `beniChestService.js:143,144,145,154`, contra `v5:719` ("Proibido restaurar a palavra 'Ateliê' na experiência infantil") | Baú do Beni | ND | ND | **P1** | 12A | ND | ND | **Sim** | **Sim** | **RATIFICADA** | E013 |
| **P-68** | Fluxo com `mission` **nunca pergunta o nome** da arte | `AtelierCanvasScreen.js:276` | Canvas | ND | ND | **P3** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-69** | Palavrinhas **sem persistência de resultado** — só `day`/`starsToday`; admitido em doc de código | `brincarStatsService.js:408-419` — *docblock* admite "recordes de Palavrinhas ficam para depois do MVP" | Palavrinhas | ND | ND | **P2** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-70** | **Só Pares tem conquistas** (5). Palavrinhas, Ovelhinha e Monte a Cena: nenhuma | `brincarStatsService.js:421-436` (`toAchievementCtx` devolve só *flags* `pares*`) × `achievements.js:442-497` | Brincar, conquistas | ND | ND | **P2** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-71** | Escrita de resultado **não aguardada** em Pares e Palavrinhas (UI precede persistência) | `ParesDoBeniScreen.js:437` e `:463` — `salvarPartida()` sem `await`; `PalavrinhasDoBeniScreen.js:360-371` | Pares, Palavrinhas | ND | ND | **P2** | 12A | ND | ND | Não | **Sim** | **RATIFICADA** | E013 |
| **P-72** | `dicaAuto`/`dicaMs` **sem consumidor** ⇒ a dica automática do Fácil **não existe em runtime** | `ovelhaGameService.js:66-76` — `IMPLEMENTADA, MAS SEM CONSUMIDOR` | Ovelhinha | ND | ND | **P3** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-73** | Comentários de `routes.js` afirmam gate interno inexistente para Ovelhinha e Palavrinhas | `routes.js:54-59` × `AppNavigator.js:421,438` — `LEGADA` | navegação | ND | ND | **P3** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013; reconfirmado por `E015-N02` |
| **P-74** | `CadeAOvelhinhaScreen.js:16` + chip "Em teste" (`:1239`) sinalizam provisoriedade em rota pública | `:16` *stale*; **mas `:1239` gateia o chip por `isInternalToolsEnabled()`** | Ovelhinha | ND | ND | **P3** | 12A | ND | ND | Não | Não | **CORRIGIDA** — só o *docblock* é defeito | E013 |
| **P-75** | `ovelhaGameService.js:57-58` afirma "sem cronômetro punitivo", contradito por `:68` e `:71` | `:58` × `:68` (`tempoLimiteMs: 45000`) e `:71` (`tempoGlobalMs: 150000`, "Zero antes das 10 → DERROTA") | Ovelhinha | ND | ND | **P2** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-76** | `ovelhaAssets.js:6-7,40` declara `underwater_01` desabilitada, mas `ovelhaScenes.js` a mantém **ativa em todos os modos** | `ovelhaAssets.js:6-7,40` × `ovelhaScenes.js:189` (`OVELHA_SCENES` **inclui** `UNDERWATER_01`; `:188` diz "5 jogáveis") | Ovelhinha | ND | ND | **P2** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-77** | Margem de **0.01** entre piso `yN >= 0.42` e menor y autoral `0.43`: um *spot* novo abaixo derruba a **cena inteira** | `ovelhaGameService.js:326` `FRONT_Y_MIN = 0.42`, aplicado em `:333` × `ovelhaScenes.js:82` | Ovelhinha | ND | ND | **P2** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-78** | `OvelhaAssetGalleryScreen`: `SIM_QTD` sem chave `infinito` ⇒ painel vazio ao selecionar Infinito (ferramenta interna, sem *crash*) | `OvelhaAssetGalleryScreen.js:211` → `:217`/`:222` laço com `undefined` | ferramenta interna | ND | ND | **P4** | interno | ND | interna | Não | Não | **RATIFICADA** | E013 |
| **P-79** | Ovelhinha **sem reduce-motion** apesar de ~8 laços de animação | `CadeAOvelhinhaScreen.js` — **zero** ocorrências de `reduceMotion`/`isReduceMotionEnabled` | Ovelhinha (a11y) | ND | ND | **P2** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-80** | Palavrinhas **sem háptico algum**; **nenhum** dos três tem háptico na conclusão | `PalavrinhasDoBeniScreen.js` — **zero** `Haptics`; `Pares:432-441` e Ovelhinha (`vibrar()` só em `'vibrarAcerto'`, `:519`) sem háptico; `vibrarConquista()` dispara em combo (`:575,:693`), não no fim | Brincar (3 jogos) | ND | ND | **P3** | 12A | ND | ND | Não | Não | **RATIFICADA** (evidência precisada) | E013 |
| **P-81** | `esgotarTempo` do Palavrinhas não limpa `pausaModal`/`pausaPedago` (colisão de overlay) | `PalavrinhasDoBeniScreen.js:525-536`; `:548` (encerramento manual) limpa | Palavrinhas, overlays | ND | ND | **P2** | 11 / E015 | `P-16` | ND | Não | Não | **RATIFICADA** | E013 |
| **P-82** | `certificateService`, `shareCardService`, `weeklyReportService` **sem consumidor de runtime**; **zero recompensa imprimível ou compartilhável no app** | grep em `src/`: aparecem **só dentro dos próprios arquivos**; zero import — `IMPLEMENTADA, MAS SEM CONSUMIDOR` | recompensas | ND | ND | **P2** | recompensas | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-83** | Baú, ramo `'todas'` não calcula `hiddenLocked` ⇒ botão "Ver cartinhas escondidas" **nunca renderiza nessa aba** (conteúdo continua alcançável por outra aba) | `BeniChestScreen.js:156-160` × `:247` | Baú do Beni | ND | ND | **P2** | 12A | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-84** | **Nenhum deep link** para os quatro jogos — `NavigationContainer` sem `linking` | `AppNavigator.js:292` — `PLANEJADA, MAS NÃO IMPLEMENTADA` | navegação | ND | ND | **P3** | posterior | ND | ND | Não | Não | **RATIFICADA** | E013 |
| **P-85** | **Zero telemetria** em todo o domínio E013 — o campo "métrica/evento" é impreenchível | Zero analytics em `src/`; `performanceTrace.js:9` declara "SEM analytics" — `NÃO DETERMINADO` | medição | ND | ND | ND | posterior | ND | ND | Não | Não | **RATIFICADA** (`NÃO DETERMINADO`) | E013 |
| **P-86** | **Nenhum dos quatro jogos tem retomada** (só Monte a Cena, e limitada) — *kill* do app perde a partida em 3 de 4 | Pares e Ovelhinha: **zero** ocorrências de sessão/retomada; Palavrinhas: 1 (irrelevante); só Monte a Cena tem `getRawSession` (`:445-451`) | Brincar (4 jogos) | ND | ND | **P2** | 12A | ND | ND | Não | **Sim** | **RATIFICADA** | E013 |
| **P-87** | `PROJECT_SOURCE_OF_TRUTH` registra HEAD canônico desatualizado — `7f96ee9` registrado, enquanto a linha atual publicada está em `015c438` | `COMPROVADO PELO DOCUMENTO` | Documentação | ND | ND | ND | **E016** | ND | ND | ND | ND | **pendência documental — não corrigida; E016 decidirá a classificação final** | E014 |
| **P-88** | `.easignore` tem 3 padrões apontando para alvos inexistentes | `COMPROVADO PELO ARQUIVO` | EAS | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-89** | 17,93 MB de originais órfãos da Ovelhinha **não** são excluídos do *upload* EAS | `COMPROVADO PELO ARQUIVO` | EAS | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-90** | `.easignore` não exclui `scripts/` (`smoke.js` ≈1,8 MB), `docs/` (126 `.md`) nem `specs/` | `COMPROVADO PELO ARQUIVO` | EAS | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-91** | `expo-status-bar` e `lottie-react-native` declaradas sem consumidor; *lottie* carrega código nativo | `COMPROVADO PELO ARQUIVO` | Dependências | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-92** | `plugins/withPrivacyManifest.js` órfão, não registrado em `app.json` | `COMPROVADO PELO ARQUIVO` | Config | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-93** | `EXPO_PUBLIC_REVENUECAT_*` lidas no código, ausentes de todos os perfis e do `.env.example` | `COMPROVADO PELO CÓDIGO` | EAS / Paywall | ND | ND | ND | 3F / 4 | ND | ND | ND | ND | aberto | E014 |
| **P-94** | `app.json` sem `runtimeVersion`, `updates` e `assetBundlePatterns` | `COMPROVADO PELO ARQUIVO` | Config | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-95** | `uiPlayers` e `musicPlayer` nunca liberados; Monte a Cena e Puzzle Lab não chamam `releaseGameSfx` | `COMPROVADO PELO CÓDIGO` | Áudio | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-96** | `ensureAudioMode` marca pronto **antes** do `await`; chamado sem `await` em 2 pontos | `COMPROVADO PELO CÓDIGO` | Áudio | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-97** | `AudioPlayer` sem tratamento de erro de carga com `autoPlay=false` → Narração presa em "Carregando…" | `COMPROVADO PELO CÓDIGO` | Áudio | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-98** | `StoryBookScreen` resolve áudio remoto **sem** `getInfoAsync`, ao contrário da Narração | `COMPROVADO PELO CÓDIGO` | Áudio / Packs | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-99** | `turbo_end.wav` presente + referenciado + **nunca disparado**; `PARES_SOUND_EVENTS.WIN` nunca chamado | `COMPROVADO PELO CÓDIGO` | Áudio | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-100** | Voz do Beni em *autoplay* **sem** card de consentimento em Home, Perfil e Estrelinhas | `COMPROVADO PELO CÓDIGO` | Áudio / UX | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-101** | Voz do guia continua tocando sob o Modal de Visão Geral (STR ONB 01, ampliada) | `COMPROVADO PELO CÓDIGO` | Áudio / UX | ND | ND | ND | 3F | `P-35` | ND | ND | ND | aberto | E014 |
| **P-102** | Guia não para ao trocar de aba e não reage a `AppState` | `COMPROVADO PELO CÓDIGO` | Áudio / UX | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-103** | `ADVENTURES_GUIDE` sem consumidor; `BeniAppTour.js` componente órfão | `COMPROVADO PELO CÓDIGO` | Guias | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-104** | Hápticos sem *reduce motion* em 3 telas; lidos-mas-não-aplicados em 2 | `COMPROVADO PELO CÓDIGO` | Acessibilidade | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-105** | `stories.js:259` referencia `noe_sorrindo`, chave sem `require` | `COMPROVADO PELO CÓDIGO` | Assets | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-106** | 6 *exports* de `audioService.js` sem consumidor | `COMPROVADO PELO CÓDIGO` | Áudio | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-107** | `SHOW_CHURCH_MODE` é a única *flag* interna com cerca **simples** | `COMPROVADO PELO CÓDIGO` | Gates | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-108** | Modo Igreja: `setWeeklyStory`/`getChurchProgressSummary` sem consumidor; `weeklyStory` não persistido; `churchName` gravado no lugar da faixa | `COMPROVADO PELO CÓDIGO` | Modo Igreja | ND | ND | ND | 3F / 5 | ND | ND | ND | ND | aberto | E014 |
| **P-109** | `featureFlags.js:29` cita "DECISIONS.md #5", referência não localizável | `COMPROVADO PELO CÓDIGO` | Documentação | ND | ND | ND | **E016** | ND | ND | ND | ND | aberto | E014 |
| **P-110** | Comentários *stale* em 5 módulos + 4 documentos (item 18) | `COMPROVADO PELO CÓDIGO` | Documentação | ND | ND | ND | 3F | ND | ND | ND | ND | aberto (ampliado) | E014; ampliado por `E015-N18` |
| **P-111** | Capas em 2 famílias de resolução; 9 com *ratio* 1,784 ≠ `16/9` declarado | `COMPROVADO PELO ARQUIVO` | Assets | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-112** | `App.js:88` usa `console.warn` cru em produção, ignorando o *logger* importado | `COMPROVADO PELO CÓDIGO` | Higiene | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-113** | 5 dependências de *tooling* importadas sem declaração | `COMPROVADO PELO ARQUIVO` | Dependências | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-114** | ~20 chaves `@ptf_*` fora do `storageKeys.js` que se declara fonte única | `COMPROVADO PELO CÓDIGO` | Storage | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-115** | 4 rotas internas registradas sem qualquer entrada visível | `COMPROVADO PELO CÓDIGO` | Ferramentas internas | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-116** | Packs sem limpeza de órfãos e sem teto de disco | `COMPROVADO PELO CÓDIGO` | Packs | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-117** | `ProfileScreen` pré-carrega 3 mp3 do guia em todo *mount*, mesmo com guia já visto | `COMPROVADO PELO CÓDIGO` | Performance | ND | ND | ND | 3F | ND | ND | ND | ND | aberto | E014 |
| **P-118** | `chronologicalOrder` presente em só **3 de 20** histórias | `COMPROVADO PELO CÓDIGO` · `stories.js:226,423,620` | conteúdo / dados | ND | ordenação cronológica impossível de aplicar ao catálogo | média | 4 | `P-04` | ND | ND | ND | **novo** | E015 (`E015-N05`), artefato 08 |
| **P-119** | `getStoriesInChronologicalOrder()` ordena por campo ausente em 17 histórias — **zero consumidores** | `COMPROVADO PELO CÓDIGO` · `storyHelpers.js:45-72` | dados | ND | função viva sem consumidor e semanticamente incorreta se adotada | média | 9 | `P-118` | ND | ND | ND | **novo** | E015 (`E015-N06`), artefato 08 |
| **P-120** | `manifestSha256` é **opcional** no índice global | `COMPROVADO PELO CÓDIGO` · `globalManifestService.js:145-147` | integridade / manifesto | ND | pack aceito sem verificação de integridade | **alta** | 4 | ND | ND | ND | ND | **novo** | E015 (`E015-N11`), artefato 04 |
| **P-121** | `type` divergente entre os dois *schemas* (`story` × 4 valores) | `COMPROVADO PELO CÓDIGO` · `globalManifestService.js:25` × `packManifestService.js:16` | manifesto | ND | contratos incompatíveis entre índice e pack | média | 4 | `P-120` | ND | ND | ND | **novo** | E015 (`E015-N12`), artefato 04 |
| **P-122** | *Kind* `other` existe só no manifesto por pack | `COMPROVADO PELO CÓDIGO` · `packManifestService.js:17` | manifesto | ND | categoria não representável no índice global | baixa | 4 | `P-121` | ND | ND | ND | **novo** | E015 (`E015-N13`), artefato 04 |
| **P-123** | `metadata.coverPath` não é verificado contra `files[]` | `COMPROVADO PELO CÓDIGO` · `packManifestService.js:109-111` | manifesto | ND | capa declarada pode não existir no pack | baixa | 4 | `P-120` | ND | ND | ND | **novo** | E015 (`E015-N14`), artefato 04 |
| **P-124** | `metadata.storyId` do pack não é cruzado com o `storyId` do índice global | `COMPROVADO PELO CÓDIGO` · `packManifestService.js:103` | manifesto | ND | pack pode ser instalado sob história errada | média | 4 | `P-120` | ND | ND | ND | **novo** | E015 (`E015-N15`), artefato 04 |
| **P-125** | `status` no índice **remoto** descreve estado que só o aparelho conhece | `COMPROVADO PELO CÓDIGO` · `globalManifestService.js:26-29` | manifesto | ND | campo servidor contradiz estado local | baixa | 4 | ND | ND | ND | ND | **novo** | E015 (`E015-N16`), artefato 04 |
| **P-126** | Sem caminho de migração de versão de *schema* — ambos os validadores exigem versão `1` | `COMPROVADO PELO CÓDIGO` | manifesto | ND | *bump* de versão quebra todos os clientes instalados | média | 4 | `P-120` | ND | ND | ND | **novo** | E015 (`E015-N17`), artefato 04 |
| **P-127** | Boot instrumentado, **nenhuma amostra coletada** registrada | `NÃO DETERMINADO` · `performanceTrace.js` · artefato 06 | desempenho | ND | linha de base de desempenho inexistente | **alta** | 9 | `P-85` | **física** | ND | ND | **novo** | E015 (`E015-N19`), artefato 06 |
| **P-128** | Nenhuma validação física em **Android** de qualquer classe | `COMPROVADO PELO DOCUMENTO` · `SPRINT_18_4_PHYSICAL_QA_REPORT.md:176,191` | aparelhos | ND | metade das plataformas-alvo sem nenhuma evidência física | **alta** | 8 e 9 | `P-20` | **física em Android** | ND | ND | **novo** | E015 (`E015-N21`), artefato 07 |
| **P-129** | *Entitlement* offline com cache expirado nunca exercitado fisicamente | `NÃO DETERMINADO` · artefato 07 linha 13 | entitlement | ND | caminho *fail-closed* crítico sem prova de comportamento | **alta** | 8 | ND | **física** | ND | ND | **novo** | E015 (`E015-N22`), artefato 07 |
| **P-130** | Packs não entregam colorir — `requestedKinds = ['scene']` | `COMPROVADO PELO CÓDIGO` · `packDownloadService.js:136,243` | packs / Colorir | ND | colorir jamais chega por pack; peso fica preso ao binário | média | 4 | `P-131` | ND | ND | ND | **novo** | E015 (`E015-N23`), artefato 08 |
| **P-131** | Colorir é **278 MB** em PNG, o maior peso local | `DOCUMENTADO HISTORICAMENTE` · `F1_2:103,140` | mídia | ND | maior contribuinte isolado do tamanho do binário | média | 5 | ND | ND | ND | ND | **novo** | E015 (`E015-N24`), artefato 06 |

**Total: 131 riscos.** `P-01` a `P-117` preservados sem renumeração; `P-118` a `P-131` criados
apenas após a deduplicação completa da §7, sem lacunas na sequência.

---

## 5 · Itens corrigidos ou refinados sem perda de rastreabilidade

Nenhum destes perdeu código, mudou de número ou trocou de significado. O código **mais antigo** foi
sempre preservado e a evidência nova foi **acrescentada** a ele.

| Código | O que mudou | Quem refinou | Rastro preservado |
|---|---|---|---|
| `P-03` | evidência localizada: a contradição é da **Congrats**, não do Story Detail | E011 | enunciado original mantido |
| `P-04` | os 4 algoritmos foram **nomeados** um a um | E011 | número e título intactos |
| `P-05` | caso reprodutível concreto (`david_goliath`) acrescentado | E011 | severidade inalterada |
| `P-06` | mecanismo do beco sem saída explicado (`isDone` precede `isCurrent`) | E011; ratificado por E013 | segue **candidato grave** |
| `P-07` | **rebaixado** de média para baixa; Lock de sim para não | E011 | rebaixamento registrado na própria linha |
| `P-08` | escopo ampliado: exclui também Cultinho e Meu Momento | E012 | código original preservado |
| `P-13` · `P-14` · `P-18` | confirmados cirurgicamente com `arquivo:linha` | E012 | severidade inalterada |
| `P-15` | +5 encerramentos *bespoke* nos domínios de E012 | E012 | contagem original citada |
| `P-16` | 3 → **7 pares**, + prova negativa, + 1 par novo | E011 e E013 | um único código, três camadas de evidência |
| `P-17` | 35 *hardcodes* mapeados, 12 impeditivos | E011 | título original mantido |
| `P-20` · `P-31` | ampliados com evidência de C60 e Cultinho | E012 | códigos preservados |
| `P-27` · `P-28` | quantificados (`allowFontScaling` = 0 em `src/`; 3 telas com a11y zerada) | E012 e E013 | **decisão metodológica de E012**: achados de a11y e tipografia entram como **evidência adicional a `P-27`/`P-28`**, não como códigos novos |
| `P-30` | **reformulado**: dois *sistemas* de *breakpoint*, não dois limiares | E013 | reformulação registrada, número intacto |
| `P-35` | sustentado contra a *whitelist* de `progressResetService.js:34-63` | E013 | sustentação registrada |
| `P-39` | confirmado: `totalBonusStars` não destrava avatares | E013 | código preservado |
| `P-53` | ampliado com `ATELIER_GUIDE` + 5 áudios órfãos | E013 | código preservado |
| `P-74` | **CORRIGIDA** — `:1239` é gateado; só o *docblock* resta como defeito | E013 | correção parcial registrada **sem apagar o código** |
| `P-110` | ampliado pelo comentário *stale* de `contentManifest.js` | E015 (`E015-N18`) | código de E014 preservado |
| `P-40` | ampliado pela segunda fonte `LumiMomentScreen.js:18` | E015 (`E015-N08`) | código de E012 preservado |
| `P-01` · `P-02` · `P-04` | ampliados por achados de E015 (`N03`, `N10`, `N04`) | E015 | códigos de E010 preservados |

---

## 6 · Candidatos de deduplicação

> Regra aplicada: **preservar o código mais antigo e acrescentar evidência ao item existente.**
> Os quatro candidatos abaixo nascem das correções metodológicas de E014 e atravessam **vários**
> códigos `P-` ao mesmo tempo. E015 **não** os funde: registra o critério de fusão para E016.

### Candidato A — privacidade e RevenueCat

| Campo | Conteúdo |
|---|---|
| **Códigos abrangidos** | qualquer `P-` que afirme "nenhum dado sai do aparelho" — **preservar o mais antigo** |
| **Descrição** | A ausência de *upload* explícito no código do app **não** equivale a ausência de tráfego de dados. O SDK é código de terceiro e seu envelope não foi auditado. |
| **Evidência** | `COMPROVADO PELO ARQUIVO` (presença: `package.json:63`) · **`NÃO DETERMINADO`** (envelope) |
| **Subsistema** | entitlement · privacidade · conformidade |
| **Severidade** | **alta** |
| **Impacto** | declaração de privacidade incorreta perante loja e legislação infantil |
| **Estado** | **candidato a dedupe** — não fundido por E015 |
| **Fase** | **5, 18 e 19** |
| **Origem** | E014 (correção 2), reafirmado em E015 |

### Candidato B — mídia offline × acesso premium offline

| Campo | Conteúdo |
|---|---|
| **Códigos abrangidos** | interseção de `P-05`, `P-24` e itens de *offline* — preservar o mais antigo |
| **Descrição** | As 18 premium têm mídia completa no *bundle*, mas **acesso depende de entitlement**. Afirmar "funcionam integralmente offline" funde quatro estados distintos. |
| **Evidência** | `COMPROVADO PELO CÓDIGO` · `accessControl.js:47-49` · `entitlementPolicy.js` · artefato 08 §3 |
| **Subsistema** | conteúdo · entitlement · offline |
| **Severidade** | **alta** |
| **Impacto** | promessa de produto incorreta; expectativa de *offline* que o *fail-closed* não cumpre |
| **Estado** | **candidato a dedupe** — não fundido por E015 |
| **Fase** | **4** (contrato) · **9** (implementação) |
| **Origem** | E014 (correção 3), detalhado em E015 artefato 08 |

### Candidato C — repositório sem *payload* × aparelho sem pack

| Campo | Conteúdo |
|---|---|
| **Códigos abrangidos** | `P-116`, `P-130` e itens que digam "zero packs" sem qualificar o eixo |
| **Descrição** | O repositório não versiona *payload* de pack. **Isso não informa nada** sobre packs instalados em aparelhos. São eixos distintos. |
| **Evidência** | `COMPROVADO PELO ARQUIVO` (repositório) · **`NÃO DETERMINADO`** (aparelho) · `contentManifest.js:55-63` |
| **Subsistema** | packs · entrega de mídia |
| **Severidade** | **média** |
| **Impacto** | subestimar espaço em disco e caminhos de recuperação de pack no aparelho |
| **Estado** | **candidato a dedupe** — não fundido por E015 |
| **Fase** | **5** (publicação) · **9** (instrumentação) |
| **Origem** | E014 (correção 4) |

### Candidato D — validação física individual × validação de fluxo

| Campo | Conteúdo |
|---|---|
| **Códigos abrangidos** | `P-20`, `P-128`, `P-129` e todo item de validação física |
| **Descrição** | Não houve auditoria física **individual** dos 200 arquivos. Houve, e está documentada, validação física **de fluxo** com mídia, packs, áudio e recuperação. |
| **Evidência** | `COMPROVADO FISICAMENTE` (fluxos) · **`NÃO DETERMINADO`** (arquivo a arquivo) · `C60_VALIDACAO_FISICA.md` · `SPRINT_18_4_PHYSICAL_QA_REPORT.md:186-191` |
| **Subsistema** | qualidade · mídia · validação |
| **Severidade** | **média** |
| **Impacto** | descartar evidência física legítima e repetir trabalho já feito |
| **Estado** | **candidato a dedupe** — não fundido por E015 |
| **Fase** | **8** e **9** |
| **Origem** | E014 (correção 5), aplicado em E015 artefatos 06 e 07 |

---

## 7 · Reconciliação individual de `E015-N01` a `E015-N27`

> Cada achado recebe **exatamente uma** classificação. A origem `E015-N##` é **preservada** em
> todos os casos, inclusive nos que viraram `P-118`+.

| Origem | Descrição do achado | Classificação | Destino e justificativa |
|---|---|---|---|
| **`E015-N01`** | Registro de riscos `P-01`…`P-117` não é versionado | **ACHADO DOCUMENTAL RESOLVIDO NESTA CORREÇÃO** | O corpus foi **restaurado e versionado** na §4 deste artefato. O problema era documental e a própria correção o encerra. **Não** vira risco de produto e **não** recebe código `P-`. |
| **`E015-N02`** | Comentários de `routes.js` desatualizados sobre gate interno | **DUPLICADO DE `P-73`** | Mesma fonte técnica (`routes.js:54-59` × `AppNavigator.js:421,438`) e mesmo defeito. `P-73` é mais antigo e permanece o código canônico. |
| **`E015-N03`** | Quatro decisores de jornada concorrentes, sem árbitro | **AMPLIA `P-01`** | `P-01` já registra a ausência de motor canônico de jornada; `E015-N03` **nomeia os quatro decisores**. Evidência acrescentada a `P-01`. |
| **`E015-N04`** | Seis eixos de ordenação editorial coexistentes | **AMPLIA `P-04`** | `P-04` registra 4 algoritmos de próxima história; `E015-N04` amplia o levantamento para **6 eixos de ordenação**. Código mais antigo preservado. |
| **`E015-N05`** | `chronologicalOrder` presente em só 3 de 20 histórias | **NOVO RISCO REAL** | Nenhum `P-` cobre a cobertura do campo no catálogo. → **`P-118`** |
| **`E015-N06`** | `getStoriesInChronologicalOrder()` ordena por campo ausente em 17 — zero consumidores | **NOVO RISCO REAL** | Distinto de `P-118`: aqui o defeito é a **função**, não o dado. → **`P-119`** |
| **`E015-N07`** | Dois vocabulários de trilha (`comece` × `comece_aqui`) | **DUPLICADO DE `P-10`** | `P-10` é literalmente "Namespace duplo `comece`/`comece_aqui`". Mesmo defeito, código mais antigo preservado. |
| **`E015-N08`** | Rotação diária usa dia de época **UTC** — vira às 21h em Brasília | **AMPLIA `P-40`** | `P-40` já registra a chave diária em UTC (`postStoryStorage.js:6`); `E015-N08` acrescenta a **segunda fonte** `LumiMomentScreen.js:18`. |
| **`E015-N09`** | "História da semana" do Cultinho é fixa — sempre `creation` | **DUPLICADO DE `P-54`** | `P-54` é "Cultinho sem rotação: `getStoryOfTheWeek` ⇒ mostra sempre A Criação". Idêntico. |
| **`E015-N10`** | Vitrine constante em três superfícies simultâneas, sem *dedupe* | **AMPLIA `P-02`** | `P-02` registra a ausência do `ContentRotationEngine`; a vitrine constante é **consequência direta** dessa ausência, agora com as três superfícies nomeadas. |
| **`E015-N11`** | `manifestSha256` é opcional no índice global | **NOVO RISCO REAL** | Integridade de pack não é coberta por nenhum `P-` de E009–E014. → **`P-120`** |
| **`E015-N12`** | `type` divergente entre os dois *schemas* | **NOVO RISCO REAL** | → **`P-121`** |
| **`E015-N13`** | *Kind* `other` existe só no manifesto por pack | **NOVO RISCO REAL** | → **`P-122`** |
| **`E015-N14`** | `metadata.coverPath` não é verificado contra `files[]` | **NOVO RISCO REAL** | → **`P-123`** |
| **`E015-N15`** | `metadata.storyId` do pack não é cruzado com o do índice global | **NOVO RISCO REAL** | → **`P-124`** |
| **`E015-N16`** | `status` no índice remoto descreve estado que só o aparelho conhece | **NOVO RISCO REAL** | → **`P-125`** |
| **`E015-N17`** | Sem caminho de migração de versão de *schema* | **NOVO RISCO REAL** | → **`P-126`** |
| **`E015-N18`** | Comentário de `contentManifest.js` afirma "NADA consome este módulo", mas `globalManifestService.js:14,48` consome | **AMPLIA `P-110`** | `P-110` já é "Comentários *stale* em 5 módulos + 4 documentos". Este é mais um caso da mesma classe. |
| **`E015-N19`** | Boot instrumentado, nenhuma amostra coletada | **NOVO RISCO REAL** | Distinto de `P-85` (zero telemetria/analytics): aqui a instrumentação **existe** e nunca foi amostrada. → **`P-127`**, com dependência declarada de `P-85`. |
| **`E015-N20`** | Nenhuma validação física em **tablet** | **DUPLICADO DE `P-20`** | `P-20` é "Tablet não validado (E039)". Idêntico; código mais antigo preservado. |
| **`E015-N21`** | Nenhuma validação física em **Android** de qualquer classe | **NOVO RISCO REAL** | `P-20` cobre **tablet**, não plataforma. Android de qualquer classe é lacuna distinta. → **`P-128`** |
| **`E015-N22`** | *Entitlement* offline com cache expirado nunca exercitado fisicamente | **NOVO RISCO REAL** | → **`P-129`** |
| **`E015-N23`** | Packs não entregam colorir — `requestedKinds = ['scene']` | **NOVO RISCO REAL** | → **`P-130`** |
| **`E015-N24`** | Colorir é 278 MB em PNG, o maior peso local | **NOVO RISCO REAL** | → **`P-131`** |
| **`E015-N25`** | Zero analytics hoje **não** é decisão de não medir amanhã | **NÃO É RISCO DE PRODUTO** | É **ressalva metodológica** sobre a leitura do artefato 05, não defeito. Preservada como nota; sem código `P-`. |
| **`E015-N26`** | C60 restrito a `creation`; conquista associada depende do portão abrir | **DUPLICADO DE `P-36`** | `P-36` é a assimetria oferta×exigência do C60 preso a `creation`. Mesmo defeito. |
| **`E015-N27`** | Ausência de fila global de overlays | **DUPLICADO DE `P-16`** | `P-16` já carrega a **prova negativa** de E011: "zero gerenciador central de overlays em todo `src/`". Idêntico. |

### 7.1 · Contabilidade da reconciliação

| Classificação | Quantidade | Códigos |
|---|--:|---|
| `DUPLICADO DE P-XX` | **6** | `N02`→`P-73` · `N07`→`P-10` · `N09`→`P-54` · `N20`→`P-20` · `N26`→`P-36` · `N27`→`P-16` |
| `AMPLIA P-XX` | **5** | `N03`→`P-01` · `N04`→`P-04` · `N08`→`P-40` · `N10`→`P-02` · `N18`→`P-110` |
| `NOVO RISCO REAL` | **14** | `N05`·`N06`·`N11`–`N17`·`N19`·`N21`–`N24` → `P-118` a `P-131` |
| `ACHADO DOCUMENTAL RESOLVIDO NESTA CORREÇÃO` | **1** | `N01` |
| `NÃO É RISCO DE PRODUTO` | **1** | `N25` |
| **Total** | **27** | — |

---

## 8 · Achados novos de E015 — códigos definitivos

Os 14 achados classificados como `NOVO RISCO REAL` receberam `P-118` a `P-131`, **em sequência
contínua e sem lacunas**, **somente após** a deduplicação completa da §7. As linhas canônicas
estão na tabela da §4; esta seção registra apenas o mapeamento de origem.

| Novo código | Origem preservada | Assunto |
|---|---|---|
| `P-118` | `E015-N05` | cobertura de `chronologicalOrder` |
| `P-119` | `E015-N06` | `getStoriesInChronologicalOrder()` sem consumidor |
| `P-120` | `E015-N11` | `manifestSha256` opcional |
| `P-121` | `E015-N12` | `type` divergente entre *schemas* |
| `P-122` | `E015-N13` | *kind* `other` só no pack |
| `P-123` | `E015-N14` | `coverPath` não verificado |
| `P-124` | `E015-N15` | `storyId` não cruzado |
| `P-125` | `E015-N16` | `status` remoto descreve estado local |
| `P-126` | `E015-N17` | sem migração de *schema* |
| `P-127` | `E015-N19` | *boot* instrumentado sem amostra |
| `P-128` | `E015-N21` | zero validação física em Android |
| `P-129` | `E015-N22` | *entitlement* offline expirado não exercitado |
| `P-130` | `E015-N23` | packs não entregam colorir |
| `P-131` | `E015-N24` | colorir = 278 MB |

---

## 9 · Itens não determinados

### 9.1 · Campos não determinados dentro dos códigos existentes

| Faixa | Campos ausentes na origem | Consequência |
|---|---|---|
| `P-01` a `P-21` | superfícies detalhadas, impacto infantil, impacto técnico, dependências, revalidação | E010 registrou 7 colunas, não 14 |
| `P-36` a `P-54` | impacto infantil, impacto técnico, dependências, revalidação, Lock, lançamento | E012 registrou 5 colunas |
| `P-55` a `P-86` | impacto infantil, impacto técnico, dependências, revalidação | E013 registrou 7 colunas |
| `P-87` a `P-117` | severidade, impacto infantil, impacto técnico, dependências, revalidação, Lock, lançamento | E014 registrou 4 colunas |

**Nenhum desses campos foi preenchido por inferência.** Completá-los é trabalho de E016 e exige
releitura do HEAD canônico, não do corpus recuperado.

### 9.2 · Itens não determinados de escopo geral

1. **Unificação das duas escalas de severidade** (`alta/média/baixa` × `P1…P4`) — não feita aqui.
2. **Quais itens efetivamente bloqueiam o Product Lock** — as colunas 11 e 12 são **propostas**.
3. **O envelope técnico do SDK RevenueCat** (Candidato A).
4. **Estado de packs instalados em aparelhos reais** (Candidato C).
5. **Classificação final de `P-87`** — mandato explícito: E016 decide.
6. **Linha de base de desempenho** (`P-127`) — nenhuma amostra existe.
7. **Três divergências de *schema* sem código atribuído.** O artefato 04 §5 lista **seis**
   divergências entre o índice global e o manifesto por pack. Três receberam código nesta correção
   (`P-120`, `P-121`, `P-122`, vindas de `E015-N11`/`N12`/`N13`). As outras três — **`bytes`**
   (positivo × `>= 0`), **formato do `id`** (string livre × *slug* `[a-z0-9_]`) e **nome da versão
   mínima** (`minAppVersion` + `requiredAppVersion` × só `minAppVersion`) — **não** estavam entre os
   27 achados `E015-N##` e **não** receberam código aqui, porque o mandato desta correção delimita a
   criação de `P-118`+ à reconciliação daqueles 27. **E016 deve codificá-las.** A lacuna é
   registrada explicitamente para que não seja lida como cobertura completa.

---

## 10 · Critérios preliminares de Product Lock

> **PRELIMINAR. E015 NÃO FECHA NENHUM BLOQUEADOR.** Esta seção propõe **critérios**, não veredito.

### 10.1 · Critérios propostos

Um item é candidato a **bloquear o Product Lock** quando satisfaz **pelo menos um**:

| # | Critério | Fundamento |
|--:|---|---|
| 1 | **Promessa comercial não cumprível** — a interface promete algo que o sistema não entrega | proteção do público infantil e do responsável pagante |
| 2 | **Contradição entre duas superfícies visíveis** sobre o mesmo fato | a criança recebe informação incoerente |
| 3 | **Contrato de dados ainda não decidido** — manifesto, ordenação, jornada | congelar produto sobre contrato aberto gera retrabalho estrutural |
| 4 | **Ausência de árbitro único** onde há decisores concorrentes | escala impossível sem motor canônico |

### 10.2 · Itens que a origem marcou como candidatos a Lock

Estes vêm **marcados nas auditorias de origem**, não de julgamento de E015:

`P-01` · `P-03` · `P-04` · `P-05` · `P-06` · `P-09` · `P-15` · `P-16` · `P-17` · `P-22` · `P-23` ·
`P-24` · `P-26` · `P-63` · `P-64` · `P-65` · `P-66` · `P-67`

> **18 candidatos.** Nenhum está fechado. E016 confirma, rebaixa ou acrescenta.

---

## 11 · Critérios preliminares de lançamento

> **PRELIMINAR. E015 NÃO DECLARA NENHUM BLOQUEADOR DE LANÇAMENTO.**

### 11.1 · Critérios propostos

| # | Critério | Fundamento |
|--:|---|---|
| 1 | **Impede a criança de concluir uma jornada iniciada** | perda funcional direta |
| 2 | **Grava dado incorreto de forma persistente** | corrompe progresso e galeria |
| 3 | **Promessa de compra sem caminho de compra** | risco de rejeição em loja e de reclamação |
| 4 | **Texto proibido visível à criança** | viola decisão de produto já aprovada |
| 5 | **Plataforma-alvo sem nenhuma evidência física** | não se lança o que nunca foi executado |

### 11.2 · Itens que a origem marcou como candidatos a bloquear lançamento

`P-24` · `P-55` · `P-56` · `P-57` · `P-58` · `P-59` · `P-60` · `P-63` · `P-64` · `P-65` · `P-67` ·
`P-71` · `P-86`

**A avaliar** (marcados `a avaliar` na origem): `P-05` · `P-06` · `P-20` · `P-27` · `P-28` · `P-31`

> **13 candidatos + 6 a avaliar.** Nenhum está fechado. E016 decide.

---

## 12 · O que este artefato **não** faz

1. **Não renumera** nada. `P-01` a `P-117` estão nos mesmos números das auditorias de origem.
2. **Não apaga** nenhum código, nem os parcialmente refutados (`P-07`) ou corrigidos (`P-74`).
3. **Não funde** os quatro candidatos de deduplicação — registra o critério para E016.
4. **Não fecha bloqueadores.** As colunas 11 e 12 são **propostas preliminares**.
5. **Não corrige defeito algum.** E015 é documental.
6. **Não preenche por inferência.** Campo ausente na origem = `ND`.
7. **Não altera** documentos árbitros nem cria décimo segundo artefato.

---

## 13 · Decisões já aprovadas que não podem ser reabertas

1. **Entitlement é *fail-closed*** e `saveEntitlement` é o único *writer* de `@ptf_entitlement_v1`.
2. **Pack no disco nunca é autorização** (`accessControl.js:47-49`).
3. **Validação física é do fundador, no aparelho.**
4. **Nenhuma dependência nova sem aprovação prévia.**
5. **As cinco correções de E014 são vinculantes** e não podem ser revertidas para as formulações
   absolutas anteriores.
6. **A decisão metodológica de E012** — achados de a11y e tipografia entram como evidência
   adicional a `P-27`/`P-28`, não como códigos novos.

---

## 14 · Fases proprietárias

| Assunto | Fase |
|---|---|
| Matriz única e definitiva de riscos | **E016** |
| Classificação final de `P-87` e `P-109` | **E016** |
| Decisões de contrato (manifesto, ordenação, jornada) | **4** |
| Conteúdo, packs e otimização de colorir | **5** |
| Campanha de validação física | **8** e **9** |
| Implementação dos motores | **9** e **11** |
| Domínio Brincar (`P-55` a `P-86`) | **12A** |
| Privacidade e conformidade | **18** e **19** |

---

*Fim do artefato 9 de 11. Matriz **preliminar** com **131 riscos**.
Corpus `P-01` a `P-117` restaurado integralmente, sem renumeração e sem perda.
Os 27 achados `E015-N##` foram reconciliados individualmente.
Nenhum bloqueador foi fechado. E016 produzirá a matriz definitiva.*
