# Fase 4B — Product Lock de acesso grátis, conteúdo do Plano Família, histórias e superfícies infantis

> **Estado do documento:** ✅ **CONSOLIDADO — RESPOSTAS DO FUNDADOR INCORPORADAS EM 2026-08-05.**
> As **quatro perguntas da §15 foram respondidas** e viraram decisões nomeadas em
> [`docs/DECISIONS.md`](../DECISIONS.md) §`PL4B`. **Nenhuma célula `[?]` permanece** na matriz da §5.
>
> Onde este documento diz **APROVADA**, há citação `arquivo:linha` de documento árbitro — são
> decisões que **já existiam** antes desta fase. Onde diz **PROPOSTA** ou **recomendação técnica**,
> é redação desta fase e **não vale como decisão** — o que vale é a **RESPOSTA DO FUNDADOR**
> registrada na §15 e em `DECISIONS.md` §`PL4B`. **As recomendações técnicas foram preservadas sem
> reescrita**, inclusive onde o fundador decidiu diferente (Pergunta 4), para que o registro do que
> foi proposto e do que foi decidido permaneça auditável.
>
> **Etapa exclusivamente documental e decisória.** Nenhum arquivo executável, asset, pack,
> manifesto ou `eas.json` foi lido para escrita, alterado ou removido. **Nenhuma imagem foi
> produzida ou alterada.** Nenhuma build foi gerada, nenhum Metro foi aberto, nenhuma validação
> física foi executada. **As decisões da Fase 4A foram integralmente preservadas.**

- **Data:** 2026-08-05
- **Worktree:** `C:/tmp/ptf_colorir_canonical_runtime_wt`
- **Branch:** `docs/e015-phase3-artifacts`
- **HEAD no início da fase:** `c4367cd9eb681583cc76b558e4a9b0d0b71051a8`
- **Base executável congelada:** `015c438106538595b592981fbe1b80b1d5d65e55`
- **Matriz canônica de referência:** `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`
  (140 códigos, `P-01`..`P-140`)
- **Fase anterior:** `docs/fase4-product-lock/01_PRODUCT_LOCK_4A_PLANO_FAMILIA_COMPRA_E_ENTITLEMENT.md`
  (encerrada e aprovada)

---

## 1. Escopo da Fase 4B

### 1.1 O que esta fase decide

Transformar em **contratos explícitos de produto** as pendências relacionadas a:

1. Conteúdo **gratuito** e conteúdo **protegido** por história.
2. Existência ou não de **acesso parcial**, prévia e degustação.
3. **Revisitação** de conteúdo já concluído.
4. **Progresso e recompensas** ligados a conteúdo protegido.
5. **Colorir com o Beni** nas histórias acessíveis, e sua distinção do **Criar Livre**.
6. Comportamento das **superfícies infantis** diante de conteúdo bloqueado.
7. Estado da **Home** e do **Mapa de Aventuras** no plano grátis depois de esgotado o conteúdo livre.
8. Efeito da **perda do entitlement** sobre conteúdo, progresso e criações.
9. Presença de **conteúdo premium no binário** e sua relação com autorização.

### 1.2 O que esta fase explicitamente NÃO faz

- Não altera código, assets, packs, manifestos nem `eas.json`.
- Não configura RevenueCat, não cria produtos nas lojas, não gera build, não abre Metro.
- Não executa validação física.
- Não altera `docs/DECISIONS.md`, a matriz canônica nem o v5.
- Não faz commit, push ou merge.
- **Não escolhe pelo fundador** nenhuma das perguntas da §15.
- **Não inventa liberação parcial para Davi e Golias.**

### 1.3 Critério de inclusão aplicado aos códigos `P`

Um código entrou no escopo **apenas** quando sua resolução exige uma **decisão de produto sobre o
contrato de acesso** — isto é, sobre *quem pode ver, abrir, concluir, salvar, revisitar ou baixar
o quê, em qual plano*.

**Foram deliberadamente excluídos:**

- Riscos **puramente técnicos** sem decisão de produto (dependências não declaradas, instrumentação
  de desempenho, rotas internas, plugins de build, `runtimeVersion`).
- Riscos de **jornada e ordenação editorial** que não decidem acesso (motor de jornada, rotação de
  conteúdo, ordem das trilhas, contiguidade de cenas), **mesmo quando a busca textual os apontou**.
- Riscos de **acessibilidade, tipografia e tablet**, que pertencem à Fase 6.
- Riscos **documentais** cujo texto não descreve regra de acesso.

**A busca textual sobre os 22 campos dos 140 códigos devolveu 53 candidatos.** Esse número foi
tratado como **lista de leitura**, não como escopo: cada ficha foi lida integralmente e julgada.
**32 dos 53 foram recusados** e **5 códigos fora da lista textual foram incluídos por julgamento**
(`P-50`, `P-55`, `P-56`, `P-66`, `P-116`) — prova de que a seleção não foi feita por semelhança de
palavras.

**Escopo final: 26 códigos.**

---

## 2. Códigos `P` abrangidos pela Fase 4B

### 2.1 Quadro-síntese (26 códigos)

| # | Código | Título curto | Bloco | *Status* na matriz | *Product Lock* | Fase impl. | Lançamento |
|---|---|---|---|---|---|---|---|
| 1 | `P-05` | Home sem filtro de acesso ou sequência | Vitrine infantil | `ABERTO` | INFORMA | 11 | PODE BLOQUEAR |
| 2 | `P-26` | Mapa cego a pack ausente e a erro de download | Vitrine infantil | `ABERTO` | INFORMA | 17 | PODE BLOQUEAR |
| 3 | `P-42` | Ramo `ParentArea` do Cantinho do Beni é morto | Vitrine infantil | `IMPLEMENTADO SEM CONSUMIDOR` | NÃO BLOQUEIA | 7 | NÃO BLOQUEIA |
| 4 | `P-54` | Cultinho sem rotação mostra sempre A Criação | Vitrine infantil | `ABERTO` | INFORMA | 12B | NÃO BLOQUEIA |
| 5 | `P-66` | Mensagem comercial dentro de `accessibilityLabel` | Vitrine infantil | `ABERTO` | INFORMA | 12A | NÃO BLOQUEIA |
| 6 | `P-18` | `unlocked={isCompleted}` no Colorir | Revisitação | `ABERTO` | INFORMA | 9 | PODE BLOQUEAR |
| 7 | `P-22` | CTA do Story Detail com dois predicados | Revisitação | `ABERTO` | EXIGE DECISÃO | 11 | NÃO BLOQUEIA |
| 8 | `P-50` | `markStoryColoringActivityDone` sem consumidor | Revisitação | `IMPLEMENTADO SEM CONSUMIDOR` | INFORMA | 9 | PODE BLOQUEAR |
| 9 | `P-08` | `hasPendingRewards` exclui Colorir | Recompensas | `ABERTO` | INFORMA | 11 | NÃO BLOQUEIA |
| 10 | `P-36` | Assimetria oferta e exigência do C60 | Colorir | `DECISÃO DE PRODUTO PENDENTE` | EXIGE DECISÃO | 9 | PODE BLOQUEAR |
| 11 | `P-37` | Copy do Livro promete pintura removida | Colorir | `ABERTO` | EXIGE DECISÃO | 10 | NÃO BLOQUEIA |
| 12 | `P-52` | Política antiga de não persistir ainda afirmada | Colorir | `DOCUMENTAL` | INFORMA | 9 | NÃO BLOQUEIA |
| 13 | `P-63` | Galeria mostra N de 0 e divide por zero | Criar Livre | `ABERTO` | INFORMA | 12A | **BLOQUEIA** |
| 14 | `P-64` | Área dos Pais promete 3 artes salvas | Criar Livre | `ABERTO` | INFORMA | 12A | PODE BLOQUEAR |
| 15 | `P-65` | Criar Livre promete guardar criações | Criar Livre | `ABERTO` | INFORMA | 12A | PODE BLOQUEAR |
| 16 | `P-24` | Plano Família sem caminho de compra | Entitlement | `ABERTO` | INFORMA | 18 | **BLOQUEIA** |
| 17 | `P-56` | `catch` fail-open no consumo de rodada | Entitlement | `ABERTO` | INFORMA | 12A | **BLOQUEIA** |
| 18 | `P-57` | Rodada fabricada na retomada | Entitlement | `ABERTO` | INFORMA | 12A | PODE BLOQUEAR |
| 19 | `P-55` | Monte a Cena V2 grava conclusão sob cena errada | Entitlement | `INTERNO E INALCANÇÁVEL` | INFORMA | 12A | PODE BLOQUEAR |
| 20 | `P-129` | Entitlement offline com cache expirado | Entitlement | `EXIGE VALIDAÇÃO FÍSICA` | INFORMA | 18 | PODE BLOQUEAR |
| 21 | `P-140` | Entitlement sem caminho de migração de schema | Entitlement | `ABERTO` | INFORMA | 18 | NÃO BLOQUEIA |
| 22 | `P-136` | 18 histórias premium fisicamente embarcadas | Binário e packs | `ABERTO` | INFORMA | 16 | PODE BLOQUEAR |
| 23 | `P-135` | Peso agregado do binário por `require()` estático | Binário e packs | `DECISÃO DE PRODUTO PENDENTE` | EXIGE DECISÃO | 16 | NÃO BLOQUEIA |
| 24 | `P-130` | Packs não entregam colorir | Binário e packs | `DECISÃO DE PRODUTO PENDENTE` | EXIGE DECISÃO | 17 | NÃO BLOQUEIA |
| 25 | `P-137` | `appVersion` congelado rebaixa packs instalados | Binário e packs | `ABERTO` | EXIGE DECISÃO | 17 | PODE BLOQUEAR |
| 26 | `P-116` | Packs sem limpeza de órfãos e sem teto de disco | Binário e packs | `ABERTO` | INFORMA | 17 | PODE BLOQUEAR |

### 2.2 Ficha decisória por código (10 campos do mandato)

---

#### `P-05` — Home sem filtro de acesso ou sequência

1. **Título.** Home sem filtro de acesso ou sequência.
2. **Descrição factual.** Fechadas as duas histórias gratuitas, a Home recomenda `david_goliath`,
   que é premium. A Home **não importa** `accessControl` nem `contentAccessService`; a lista
   considerada é `playableStories = stories.filter(s => (s.totalCenas ?? 0) > 0)`
   (`HomeScreen.js:653`), que inclui as 18 premium. O único viés pró-gratuito é uma **preferência**,
   não um filtro: `showcaseStory.js:18-19` prefere `accessType === 'free'` e **cai para qualquer
   jogável** quando não há gratuita disponível. O bloqueio efetivo só ocorre depois, em
   `StoryDetailScreen` / `NarrationScreen`.
3. **Decisão necessária.** Qual é o **grau exato de prévia** que a Home pode exibir de uma história
   protegida, e o que acontece ao toque.
4. **Evidência existente.** `HomeScreen.js:653`, `:668`; `homeService.js:19,23,39,55,66,77`;
   `showcaseStory.js:18-19`; `NarrationScreen.js:114,121,181`.
5. **Decisão já aprovada relacionada.** `D-4A-HOME-GRATIS-ESGOTADA` (`DECISIONS.md:1015-1023`):
   a Home não fica vazia nem vira paywall; conteúdo protegido **pode** aparecer como prévia
   carinhosa; ao toque, **apenas** orientação para chamar um adulto; oferta comercial só depois do
   gate parental.
6. **Dependências.** `P-01` (motor de jornada), `P-24` (caminho de compra), `P-26` (Mapa).
7. **Fase de implementação.** 11.
8. **Validação futura.** Fase 21, aparelho físico: conta grátis com as duas gratuitas concluídas —
   observar o que a Home oferece e o que acontece ao toque.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **SIM** — o *grau* da prévia (§15, Pergunta 2).

---

#### `P-26` — Mapa cego a pack ausente e a erro de download

1. **Título.** Mapa cego a pack ausente e a erro de download.
2. **Descrição factual.** `storyJourneyService.js:109` faz `mediaReady` reagir **apenas** a
   `coming_soon`. O Mapa aplica a hierarquia `comingSoon > journeyLocked > premiumLocked > blocked`
   (`storyJourneyService.js:116-124`; `AdventureMapScreen.js:318-329`) e exibe história premium
   alcançada como `nextLocked` — cadeado com convite sutil. **Nada** no Mapa reage a *pack ausente*
   ou *download com erro*: a história aparece como disponível e não abre.
3. **Decisão necessária.** O Mapa pode continuar exibindo o marco de história protegida como convite
   visível? E qual estado o Mapa deve mostrar quando o entitlement existe mas o **pack não está no
   aparelho** ou falhou?
4. **Evidência existente.** `storyJourneyService.js:109`, `:116-124`; `AdventureMapScreen.js:256`,
   `:270-273`, `:318-329`, `:519`; `contentAccessService.js:64-70`.
5. **Decisão já aprovada relacionada.** `D-4A-HOME-GRATIS-ESGOTADA` (prévia + orientação neutra) —
   escrita para a Home, **não** estendida formalmente ao Mapa.
6. **Dependências.** `P-05`, `P-130`, `P-136`, `P-137`.
7. **Fase de implementação.** 17.
8. **Validação futura.** Fase 21: entitlement válido, pack ausente e pack com falha — observar o
   marco no Mapa.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **SIM** — extensão da prévia ao Mapa (§15, Pergunta 2).

---

#### `P-42` — Ramo `ParentArea` do Cantinho do Beni é morto

1. **Título.** Ramo `ParentArea` do Cantinho do Beni é morto.
2. **Descrição factual.** `accessControl.js:130-132` prevê o desfecho *"Pedir ao responsável"*, mas
   `HomeScreen.js:746-749` e `:525` nunca o renderizam. O caminho neutro previsto **não existe na
   tela**.
3. **Decisão necessária.** Confirmar que *"pedir ajuda a um adulto"* é o **único** desfecho
   permitido ao toque em conteúdo protegido dentro da superfície infantil — e que ele precisa
   existir de fato.
4. **Evidência existente.** `accessControl.js:130-132` × `HomeScreen.js:746-749`, `:525`.
5. **Decisão já aprovada relacionada.** `D-4A-HOME-GRATIS-ESGOTADA` (orientação para chamar um
   adulto); `E1-MONETIZACAO-V1` (`DECISIONS.md:69`): sem compra direcionada à criança.
6. **Dependências.** `P-05`.
7. **Fase de implementação.** 7.
8. **Validação futura.** Fase 21: tocar conteúdo protegido na Home e observar o desfecho.
9. **Impacto no lançamento.** `NÃO BLOQUEIA`.
10. **Precisa de resposta do fundador?** **NÃO** — a regra já está aprovada; falta implementá-la.

---

#### `P-54` — Cultinho sem rotação mostra sempre A Criação

1. **Título.** Cultinho sem rotação mostra sempre A Criação.
2. **Descrição factual.** `familyWorshipService.js:75-77` usa a **vitrine** como história da semana
   e é chamado duas vezes em `CultinhoEmCasaScreen.js:47-48`. Hoje o resultado é sempre uma história
   gratuita, mas **por acidente da vitrine**, não por regra de acesso: não há filtro de plano no
   caminho.
3. **Decisão necessária.** O **Cultinho em Casa** pode recomendar uma história do Plano Família a
   uma família do plano grátis?
4. **Evidência existente.** `familyWorshipService.js:75-77`; `CultinhoEmCasaScreen.js:47-48`;
   `showcaseStory.js:18-19` (preferência, não filtro).
5. **Decisão já aprovada relacionada.** **Nenhuma.** `D-4A-HOME-GRATIS-ESGOTADA` cobre a **Home**,
   não o Cultinho.
6. **Dependências.** `P-02` (rotação), `P-05`.
7. **Fase de implementação.** 12B.
8. **Validação futura.** Fase 21: conta grátis, verificar a história da semana ao longo de semanas.
9. **Impacto no lançamento.** `NÃO BLOQUEIA`.
10. **Precisa de resposta do fundador?** **SIM** (§15, Pergunta 3).

---

#### `P-66` — Mensagem comercial dentro de `accessibilityLabel`

1. **Título.** Mensagem comercial dentro de `accessibilityLabel`.
2. **Descrição factual.** `BrincarScreen.js:324` coloca oferta comercial no rótulo de
   acessibilidade — o leitor de tela lê a oferta **para a criança**.
3. **Decisão necessária.** Confirmar que a proibição de voz comercial na superfície infantil vale
   **também** para rótulos de acessibilidade, textos ocultos e áudio.
4. **Evidência existente.** `BrincarScreen.js:324`.
5. **Decisão já aprovada relacionada.** `D-4A-HOME-GRATIS-ESGOTADA`; `E1-MONETIZACAO-V1`
   (`DECISIONS.md:69`); registro no `obs` de `P-66`: *"a superfície infantil não exibe preço,
   desconto, teste grátis, urgência, contagem regressiva nem convite a assinar"*.
6. **Dependências.** `P-28` (semântica de a11y).
7. **Fase de implementação.** 12A.
8. **Validação futura.** Fase 21: passagem com leitor de tela em iOS e Android.
9. **Impacto no lançamento.** `NÃO BLOQUEIA`.
10. **Precisa de resposta do fundador?** **NÃO** — regra já aprovada na 4A; esta fase apenas a
    estende explicitamente a rótulo, texto oculto e áudio (§8).

---

#### `P-18` — `unlocked={isCompleted}` no Colorir

1. **Título.** JRN C60 01 — `unlocked={isCompleted}` no Colorir.
2. **Descrição factual.** `StoryDetailScreen.js:573` avalia `unlocked !== true` **antes** do
   `doneMap`; o card de uma atividade **já concluída** fica `disabled`. Efeito prático: a criança
   pinta, conclui, e não consegue voltar à própria obra.
3. **Decisão necessária.** **Contrato de revisitação:** atividade concluída em história acessível
   deve permanecer reabrível.
4. **Evidência existente.** `StoryDetailScreen.js:573`.
5. **Decisão já aprovada relacionada.** `D-4A-HOME-GRATIS-ESGOTADA` cita *"obras do Colorir com o
   Beni"* entre o que a criança continua vendo; Spec 019 estabelece que o Colorir narrativo
   **salva** em qualquer plano com acesso legítimo.
6. **Dependências.** `P-22`, `P-50`.
7. **Fase de implementação.** 9.
8. **Validação futura.** Fase 21: concluir a atividade, sair, voltar e tentar reabrir.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **NÃO** — a decisão de revisitação está proposta na §5 e
    §12 e decorre de decisão já aprovada.

---

#### `P-22` — CTA do Story Detail com dois predicados

1. **Título.** CTA do Story Detail com dois predicados.
2. **Descrição factual.** O rótulo do botão é decidido por `isFullyComplete` e a ação por
   `isCompleted`: *"Continuar aventura"* reabre a cena 1.
3. **Decisão necessária.** O que a criança recebe ao voltar a uma história **já concluída** —
   recomeço, retomada ou escolha explícita.
4. **Evidência existente.** `StoryDetailScreen.js:522`; `CongratsScreen:241` (predicado divergente).
5. **Decisão já aprovada relacionada.** `D-4A-HOME-GRATIS-ESGOTADA` (*"histórias gratuitas para
   revisitar"*).
6. **Dependências.** `P-01`, `P-03`, `P-15`, `P-18`.
7. **Fase de implementação.** 11.
8. **Validação futura.** Fase 21: história concluída, observar rótulo e destino.
9. **Impacto no lançamento.** `NÃO BLOQUEIA`.
10. **Precisa de resposta do fundador?** **NÃO** — proposta de contrato na §5; nenhuma alternativa
    conflita com decisão aprovada.

---

#### `P-50` — `markStoryColoringActivityDone` sem consumidor

1. **Título.** `markStoryColoringActivityDone` sem consumidor.
2. **Descrição factual.** `coloringActivityService.js:28` nunca é chamado, então
   `@ptf_coloring_done` jamais é escrita — **mas os leitores estão vivos**
   (`ProgressContext.js:198`). A conclusão do Colorir não é registrada.
3. **Decisão necessária.** Confirmar que concluir o Colorir com o Beni **conta** como conclusão de
   atividade e alimenta progresso, recompensa e revisitação.
4. **Evidência existente.** `coloringActivityService.js:28` × `ProgressContext.js:198`.
5. **Decisão já aprovada relacionada.** Spec 019 (persistência do Colorir em todos os planos);
   `D-4A-HOME-GRATIS-ESGOTADA` (progresso e conquistas continuam visíveis).
6. **Dependências.** `P-08`, `P-14`, `P-18`, `P-51`.
7. **Fase de implementação.** 9.
8. **Validação futura.** Fase 21: concluir o Colorir e verificar progresso, selo e revisitação.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **NÃO**.

---

#### `P-08` — `hasPendingRewards` exclui Colorir

1. **Título.** `hasPendingRewards` exclui Colorir.
2. **Descrição factual.** `ProgressContext.js:81` usa três termos por história e **exclui** Colorir,
   Cultinho e Meu Momento (`postStoryStorage.js:53`). Atividade feita não conta como recompensa
   pendente.
3. **Decisão necessária.** Quais atividades compõem o **contrato de recompensa** de uma história, e
   se esse contrato muda entre conteúdo gratuito e protegido.
4. **Evidência existente.** `ProgressContext.js:81`; `postStoryStorage.js:53`.
5. **Decisão já aprovada relacionada.** `E1-PLANO-FREE` (`DECISIONS.md:57`): grátis =
   *"A Criação + Noé completas (Livrinho/quiz/Momento com Beni das grátis)"*.
6. **Dependências.** `P-50`, `P-51`.
7. **Fase de implementação.** 11.
8. **Validação futura.** Fase 21: concluir cada atividade e observar o indicador de pendência.
9. **Impacto no lançamento.** `NÃO BLOQUEIA`.
10. **Precisa de resposta do fundador?** **NÃO** — decorre da §5 (recompensa segue o acesso, não o
    plano).

---

#### `P-36` — Assimetria oferta e exigência do C60

1. **Título.** Assimetria entre oferta e exigência no Colorir 60.
2. **Descrição factual.** `storyColoringAvailability.js:69-74` é **agnóstico de história**, mas o
   piloto, o detalhe e os assets estão presos a `creation` (`coloring60Pilot.js:44-45`). Auditoria
   física confirma: **`assets/stories/*/coloring/` só existe para `creation`** — 3 PNG
   (`scene_02.png`, `activities/living_world.png`, `activities/people_and_care.png`), registrados em
   `coloring60LocalAssets.js:38,46,47`. O catálogo `coloring60Catalog.js:64-66` traz **apenas
   `creation`**, com 3 atividades. **Noé não tem nenhum lineart.**
3. **Decisão necessária.** **O v1 entrega Colorir com o Beni além de A Criação?** Em especial: a
   história gratuita **Noé** terá Colorir no lançamento?
4. **Evidência existente.** `storyColoringAvailability.js:69-74`; `coloring60Pilot.js:44-45`;
   `coloring60Catalog.js:33-66`; `coloring60LocalAssets.js:38,46,47`; inventário físico de
   `assets/stories/*/coloring/`.
5. **Decisão já aprovada relacionada.** `MATRIZ_DE_ACESSO.md:21` — *"Colorir cenas · grátis: ✅
   (história grátis) · premium: ❌ · Família: ✅"*; `specs/014-colorir-60`: 6 páginas base
   (Criação 3 + Noé 3) + 54 remotas = 60. **A meta declarada exige 3 linearts de Noé que não
   existem no disco.**
6. **Dependências.** `P-17`, `P-37`, `P-130`.
7. **Fase de implementação.** 9 (decisão), 16/17 (assets e packs).
8. **Validação futura.** Fase 21: abrir o Colorir em Noé — hoje não há o que abrir.
9. **Impacto no lançamento.** `PODE BLOQUEAR` — se o contrato prometer Colorir em Noé.
10. **Precisa de resposta do fundador?** **SIM** (§15, Pergunta 4).

---

#### `P-37` — Copy do Livro promete pintura removida

1. **Título.** Copy do Livrinho promete pintura removida.
2. **Descrição factual.** `StoryDetailScreen.js:534` e `PostStoryHubScreen.js:122` prometem uma
   pintura que o macrobloco P3J aposentou. Os 199 linearts legados foram removidos e
   `src/assets/coloringImages.js` deixou de existir (`P-131`, `CORRIGIDO`).
3. **Decisão necessária.** O que o Livrinho promete à criança em cada história — e se a promessa é
   condicionada à existência do lineart.
4. **Evidência existente.** `StoryDetailScreen.js:534`; `PostStoryHubScreen.js:122`;
   `COLORING_LEGACY_RETIREMENT_INVENTORY.md`.
5. **Decisão já aprovada relacionada.** Nenhuma específica; depende de `P-36`.
6. **Dependências.** `P-36`, `P-110`, `P-131`.
7. **Fase de implementação.** 10.
8. **Validação futura.** Fase 21: ler a copy em história com e sem lineart.
9. **Impacto no lançamento.** `NÃO BLOQUEIA`.
10. **Precisa de resposta do fundador?** **NÃO** — decorre da resposta a `P-36`.

---

#### `P-52` — Política antiga de não persistir ainda afirmada

1. **Título.** Política antiga de não persistir ainda afirmada.
2. **Descrição factual.** Seis pontos em quatro arquivos ainda afirmam **em presente** que o plano
   grátis conclui **sem persistir**. A Spec 019 revogou essa restrição; os comentários não
   acompanharam.
3. **Decisão necessária.** Fixar, em texto normativo, que **persistência do Colorir narrativo segue
   o acesso ao conteúdo, não o plano** — e que o Criar Livre continua com autoridade por plano.
4. **Evidência existente.** `E012` seção 8; `coloring60DrawingStorage.js:16-31`.
5. **Decisão já aprovada relacionada.** Spec 019 (implementada);
   `D-4A-CRIAR-LIVRE-SEM-SALVAR`.
6. **Dependências.** `P-11`, `P-12`, `P-48`, `P-110`.
7. **Fase de implementação.** 9.
8. **Validação futura.** Não exige validação física.
9. **Impacto no lançamento.** `NÃO BLOQUEIA`.
10. **Precisa de resposta do fundador?** **NÃO**.

---

#### `P-63` — Galeria mostra N de 0 e divide por zero

1. **Título.** Galeria mostra "N de 0" e divide por zero.
2. **Descrição factual.** `AtelierGalleryScreen.js:113` imprime *"N de 0 artes salvas"* e `:116`
   calcula `Math.min(n/0, 1)` — **`NaN` determinístico** na barra. O cabeçalho é **incondicional**,
   sem guarda de plano.
3. **Decisão necessária.** O que a Galeria mostra ao plano grátis, distinguindo as **duas políticas
   de salvamento**.
4. **Evidência existente.** `AtelierGalleryScreen.js:113`, `:116`; `atelierStorage.js:10`
   (`ATELIER_FREE_SAVE_LIMIT = 0`).
5. **Decisão já aprovada relacionada.** `D-4A-CRIAR-LIVRE-SEM-SALVAR`; `E1-ARTES-SALVAR`
   (`DECISIONS.md:66`): textos *"X de N artes grátis"* estão **superados**.
6. **Dependências.** `P-64`, `P-65`.
7. **Fase de implementação.** 12A.
8. **Validação futura.** Fase 21: abrir a Galeria em conta grátis limpa.
9. **Impacto no lançamento.** **BLOQUEIA** — o `NaN` atinge 100% do plano grátis.
10. **Precisa de resposta do fundador?** **NÃO** — decisão resolvida na 4A; falta corrigir.

---

#### `P-64` — Área dos Pais promete 3 artes salvas

1. **Título.** Área dos Pais promete 3 artes salvas contra limite real 0.
2. **Descrição factual.** `ParentAreaScreen.js:840` anuncia 3 artes salvas; `atelierStorage.js:10`
   define limite **0**.
3. **Decisão necessária.** Nenhuma nova — apenas a redação que preserve a distinção entre Criar
   Livre e Colorir com o Beni.
4. **Evidência existente.** `ParentAreaScreen.js:840` × `atelierStorage.js:10`.
5. **Decisão já aprovada relacionada.** `D-4A-CRIAR-LIVRE-SEM-SALVAR`; `E1-ARTES-SALVAR`.
6. **Dependências.** `P-63`.
7. **Fase de implementação.** 12A.
8. **Validação futura.** Fase 21: ler a Área dos Pais em conta grátis.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **NÃO**.

---

#### `P-65` — Criar Livre promete guardar criações

1. **Título.** Criar Livre promete guardar criações a quem tem limite 0.
2. **Descrição factual.** `BrincarScreen.js:306` promete *"guarde suas criações"*;
   `AtelierCanvasScreen.js:271-274` faz `count >= 0` bloquear todo salvamento no plano grátis e abre
   o overlay `'family'`.
3. **Decisão necessária.** Nenhuma nova — redação e aviso **antes** da folha.
4. **Evidência existente.** `BrincarScreen.js:306`; `AtelierCanvasScreen.js:271-274`;
   `atelierStorage.js:10`.
5. **Decisão já aprovada relacionada.** `D-4A-CRIAR-LIVRE-SEM-SALVAR`; `DECISOES_E_CONFLITOS.md`
   decisão 3 (*"aviso carinhoso antes da folha"*).
6. **Dependências.** `P-63`.
7. **Fase de implementação.** 12A.
8. **Validação futura.** Fase 21: desenhar e tentar salvar em conta grátis.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **NÃO**.

---

#### `P-24` — Plano Família sem caminho de compra

1. **Título.** Plano Família sem caminho de compra.
2. **Descrição factual.** `planConfig.js:40-56` traz `monthly` e `annual` em `comingSoon`, com
   `productIdPlaceholder` vazio e `isPurchaseEnabled: false`, enquanto **18 de 20 histórias** são
   premium.
3. **Decisão necessária.** Nenhuma nova nesta fase — o contrato comercial foi fechado na 4A. Aqui o
   código entra porque **define o outro lado da vitrine infantil**: a criança vê 18 cadeados sem
   caminho existente.
4. **Evidência existente.** `planConfig.js:40-56`; `ENABLE_LOCAL_PREMIUM_TEST_MODE = false`.
5. **Decisão já aprovada relacionada.** `D-4A-NOME-PUBLICO`, `D-4A-PRODUTOS-E-PERIODICIDADE`,
   `D-4A-IDENTIFICADORES`, `D-4A-RESTAURACAO-E-COMUNICACAO`.
6. **Dependências.** `P-05`, `P-93`, `P-129`.
7. **Fase de implementação.** 18.
8. **Validação futura.** Fases 18 e 21, nas duas plataformas.
9. **Impacto no lançamento.** **BLOQUEIA**.
10. **Precisa de resposta do fundador?** **NÃO**.

---

#### `P-56` — `catch` fail-open no consumo de rodada

1. **Título.** `catch` fail-open no consumo de rodada.
2. **Descrição factual.** `MonteACenaTableGameScreen.js:456` e `:467` devolvem
   `{ ok: true, remaining: Infinity, premium: true }` no `catch`: **erro de storage libera rodada
   infinita e estado premium em memória**.
3. **Decisão necessária.** Nenhuma nova — a regra *fail-closed* já é decisão aprovada e não
   reabrível. Entra na 4B porque é o **único ponto do código onde um erro concede acesso**.
4. **Evidência existente.** `MonteACenaTableGameScreen.js:456`, `:467`.
5. **Decisão já aprovada relacionada.** Decisão nº 1 da arquitetura de entitlement (fail-closed),
   reafirmada em `D-4A-CACHE-EXPIRADO` e `D-4A-MIGRACAO-ENTITLEMENT`.
6. **Dependências.** `P-24`, `P-46`, `P-57`.
7. **Fase de implementação.** 12A.
8. **Validação futura.** Fases 18 e 21: provocar falha de storage e observar o limite.
9. **Impacto no lançamento.** **BLOQUEIA**.
10. **Precisa de resposta do fundador?** **NÃO**.

---

#### `P-57` — Rodada fabricada na retomada

1. **Título.** Rodada fabricada na retomada.
2. **Descrição factual.** `MonteACenaTableGameScreen.js:451` monta
   `remaining: premium ? Infinity : 1` **sem ler o storage**, e `:497` oferece *"Montar novamente"*
   com zero rodadas reais.
3. **Decisão necessária.** Nenhuma nova quanto ao número — **2 rodadas/dia por criança** já é
   decisão aprovada. O que a 4B fixa é: **o limite do plano nunca pode ser fabricado em memória**.
4. **Evidência existente.** `MonteACenaTableGameScreen.js:451`, `:497`.
5. **Decisão já aprovada relacionada.** `E1-RODADAS` (`DECISIONS.md:63`): 2 rodadas/dia **por
   criança**; Família ilimitado; entrar na aba não consome; Modo Criador não é regra real de
   produto. `DECISOES_E_CONFLITOS.md` C3. O próprio `E1-RODADAS` já registra que o código conta
   **por dispositivo**, não por criança.
6. **Dependências.** `P-56`.
7. **Fase de implementação.** 12A.
8. **Validação futura.** Fases 18 e 21: retomada com zero rodadas em plano grátis.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **NÃO**.

---

#### `P-55` — Monte a Cena V2 grava conclusão sob cena errada

1. **Título.** Monte a Cena V2 grava conclusão real sob cena errada.
2. **Descrição factual.** `usePuzzleController.js:307-308` chama o `saveCompletion` **real** e
   `MonteACenaGameV2Screen.js:40` cai em `MONTE_A_CENA_CATALOG[0]` — sempre `creation_scene_01`. **A
   guarda `isPremium` é inócua sob Modo Criador** e a rota não é navegada por ninguém.
3. **Decisão necessária.** Confirmar que **nenhum override lateral** (Modo Criador, flag interna,
   rota não navegada) pode gravar progresso ou conceder acesso em build público.
4. **Evidência existente.** `usePuzzleController.js:307-308`; `monteACenaCatalog.js:100`;
   `accessControl.js:72-76` (`isPremiumUser` com *override* lateral); rota não navegada.
5. **Decisão já aprovada relacionada.** `D-4A-MIGRACAO-ENTITLEMENT` item 1 (sem *grandfathering* de
   Modo Criador); `DECISIONS.md:626` (nenhuma evidência de entitlement com Modo Criador ativo);
   `E1-RODADAS` (*"Modo Criador não é regra real de produto"*).
6. **Dependências.** `P-56`, `P-57`, `P-107`, `P-115`.
7. **Fase de implementação.** 12A (correção) / 19 (prova de inalcançabilidade).
8. **Validação futura.** Fase 21: provar que a rota segue inalcançável em build de *release*.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **NÃO**.

---

#### `P-129` — Entitlement offline com cache expirado

1. **Título.** Entitlement offline com cache expirado nunca exercitado.
2. **Descrição factual.** O caminho *fail-closed* crítico nunca foi executado fisicamente, e hoje
   **não é executável**: nenhum dos perfis do `eas.json` declara chave RevenueCat.
3. **Decisão necessária.** Nenhuma nova — `D-4A-CACHE-EXPIRADO` fixou 7 dias e opção A. A 4B usa
   esse contrato como **base da §10** e o estende a **pinturas premium** (§15, Pergunta 2).
4. **Evidência existente.** `entitlementPolicy.js:32` (`OFFLINE_MAX_WINDOW_MS`);
   `entitlementService.js:42`, `:57-70`, `:99-102`; `entitlementSource.js:38-42`, `:55`.
5. **Decisão já aprovada relacionada.** `D-4A-CACHE-EXPIRADO`, `D-4A-JANELA-OFFLINE`.
6. **Dependências.** `P-24`, `P-93`.
7. **Fase de implementação.** 18.
8. **Validação futura.** Fases 18 e 21: caminho offline com cache expirado nos dois planos.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **NÃO** — janela fixada por `D-4A-JANELA-OFFLINE`; efeito
    sobre as pinturas premium fixado por `DECISIONS.md:700-709`.

---

#### `P-140` — Entitlement sem caminho de migração de schema

1. **Título.** Entitlement sem caminho de migração de *schema*.
2. **Descrição factual.** A chave `@ptf_entitlement_v1` carrega a versão no nome e
   `entitlementService.js:57-70` só reconhece o formato atual.
3. **Decisão necessária.** Nenhuma nova — `D-4A-MIGRACAO-ENTITLEMENT` fechou a política. Entra na 4B
   porque a invariante *"nenhum dado infantil apagado"* é parte do contrato da §10.
4. **Evidência existente.** `storageKeys.js`; `entitlementService.js:57-70`, `:99-102`.
5. **Decisão já aprovada relacionada.** `D-4A-MIGRACAO-ENTITLEMENT`.
6. **Dependências.** `P-24`, `P-93`, `P-129`.
7. **Fase de implementação.** 18.
8. **Validação futura.** Fases 18 e 21: *snapshot* antigo, corrompido e de origem não comprovada.
9. **Impacto no lançamento.** `NÃO BLOQUEIA`.
10. **Precisa de resposta do fundador?** **NÃO**.

---

#### `P-136` — 18 histórias premium fisicamente embarcadas no binário

1. **Título.** 18 histórias premium fisicamente embarcadas no binário.
2. **Descrição factual.** As 18 histórias declaradas `remote` em `contentManifest.js:28-49`
   continuam com `require()` estático de cenas, áudio e capa — **378 arquivos, 84.183.401 bytes
   (80,3 MB)**. A auditoria física desta fase confirma e detalha: **180 ilustrações** em
   `storySceneIllustrations.js:73-291`, **180 narrações** em `audioManifest.js:64-260`, **18 capas**
   em `storyCovers.js:17-34`. Além disso — **fato novo, não coberto por nenhum código `P`** — o
   **texto narrado integral** das 20 histórias vive em `src/data/stories.js` (238 KB de JS) e os
   **18 quizzes premium** em `quizzes.js:36-238`; **não passam por `require()` e entram no bundle
   do mesmo jeito**.
3. **Decisão necessária.** Nenhuma nova quanto à remoção dos assets. **Sim** quanto ao **texto e ao
   quiz**: `D-4A-PAYLOAD-PREMIUM` autoriza *"metadados mínimos de vitrine"* — resta declarar se
   texto narrado e quiz premium cabem nessa definição (a leitura desta fase é que **não cabem**).
4. **Evidência existente.** `contentManifest.js:22-50`; `storySceneIllustrations.js:49-291`;
   `audioManifest.js:42-260`; `storyCovers.js:15-34`; `stories.js`; `quizzes.js:12-238`;
   `F2_5A_PREMIUM_PACKS_AUDIT_AND_MIGRATION_PLAN.md:64`.
5. **Decisão já aprovada relacionada.** `D-4A-PAYLOAD-PREMIUM` (`DECISIONS.md:1025-1035`).
6. **Dependências.** `P-130`, `P-135`, `P-26`, `P-137`.
7. **Fase de implementação.** 16.
8. **Validação futura.** Fase 17: medir o binário resultante; provar que história premium sem pack
   não exibe imagem local.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **NÃO** para os assets; a §11 registra o **alcance** do
    payload como determinação desta fase, sem reabrir a decisão.

---

#### `P-135` — Peso agregado do binário por `require()` estático

1. **Título.** Peso agregado do binário por `require()` estático.
2. **Descrição factual.** 519 arquivos de `assets/` amarrados por `require()` literal em `src/`,
   somando **130.976.281 bytes (124,9 MB)**, viajando no binário público independentemente de uso.
   A auditoria física acrescenta que **`assets/maps/backup_*` e `source_*` somam ~65 MB, estão
   rastreados no Git** e são excluídos do upload por `.easignore:74-75` — pesam no repositório, não
   no binário.
3. **Decisão necessária.** Teto de tamanho do binário e o que é **asset genérico compartilhado**
   (Beni: 29 MB; mapas: 16 requires; Ovelhinha: 23 MB; avatares: 956 KB).
4. **Evidência existente.** 519 requires medidos em `015c438`; `.easignore:74-75`.
5. **Decisão já aprovada relacionada.** `D-4A-PAYLOAD-PREMIUM` (assets genéricos podem permanecer).
6. **Dependências.** `P-136`, `P-130`, `P-94`.
7. **Fase de implementação.** 16.
8. **Validação futura.** Fase 17.
9. **Impacto no lançamento.** `NÃO BLOQUEIA`.
10. **Precisa de resposta do fundador?** **NÃO** — teto numérico é decisão de engenharia da Fase 16.

---

#### `P-130` — Packs não entregam colorir

1. **Título.** Packs não entregam colorir.
2. **Descrição factual.** `packDownloadService.js:136` e `:243` pedem
   `requestedKinds = ['scene']` — **colorir jamais chega por pack**. Consequência combinada com o
   inventário físico: **não existe lineart de nenhuma história premium**, nem no disco nem em pack.
3. **Decisão necessária.** O Colorir com o Beni das histórias premium é entregue por pack? E se sim,
   em qual fase?
4. **Evidência existente.** `packDownloadService.js:136`, `:243`; ausência física de
   `assets/stories/<premium>/coloring/`; `coloring60Catalog.js:64-66`.
5. **Decisão já aprovada relacionada.** `specs/014-colorir-60`: 54 páginas remotas previstas.
6. **Dependências.** `P-131`, `P-36`, `P-116`, `P-136`.
7. **Fase de implementação.** 17.
8. **Validação futura.** Fase 17: baixar um pack e verificar se o Colorir aparece.
9. **Impacto no lançamento.** `NÃO BLOQUEIA`.
10. **Precisa de resposta do fundador?** **Condicionalmente** — vinculado à Pergunta 4 (§15).

---

#### `P-137` — `appVersion` congelado rebaixa packs instalados

1. **Título.** `appVersion` congelado no cliente e rebaixamento de packs no primeiro *bump*.
2. **Descrição factual.** `useStoryPackDownload.js:113` e `packDownloadService.js:136`, `:243`,
   `:754` usam o literal `1.0.0`; `expo-constants` não existe no projeto. Como
   `packDownloadService.js:349` compara `marker.appVersion` por **igualdade estrita**, o primeiro
   *bump* invalida **todo** marcador de pack instalado.
3. **Decisão necessária.** Política de marcador: atualizar o app **não pode** custar à criança o
   conteúdo já baixado.
4. **Evidência existente.** `useStoryPackDownload.js:113`; `packDownloadService.js:286`, `:349`,
   `:666`; ausência de `expo-constants`.
5. **Decisão já aprovada relacionada.** `E1-STORIES-PREMIUM` (*"cache persistente; offline após
   download completo"*).
6. **Dependências.** `P-134`, `P-126`.
7. **Fase de implementação.** 17.
8. **Validação futura.** Fases 17 e 20: instalar pack, subir versão, reabrir.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **NÃO** — o princípio está na §5, linha *download do pack*.

---

#### `P-116` — Packs sem limpeza de órfãos e sem teto de disco

1. **Título.** Packs sem limpeza de órfãos e sem teto de disco.
2. **Descrição factual.** Não há rotina de remoção de packs órfãos nem limite de ocupação.
3. **Decisão necessária.** O app pode **remover** conteúdo premium do disco por conta própria? Em
   que condições? Esta é decisão de produto porque toca a invariante *"nada é apagado"*.
4. **Evidência existente.** Ausência comprovada de rotina em `packDownloadService`.
5. **Decisão já aprovada relacionada.** `D-4A-CACHE-EXPIRADO` (*"nada é apagado: progresso,
   pinturas e conteúdo premium já baixado permanecem no disco"*).
6. **Dependências.** `P-130`, `P-137`.
7. **Fase de implementação.** 17.
8. **Validação futura.** Fase 17: vários ciclos de download, medir crescimento de disco.
9. **Impacto no lançamento.** `PODE BLOQUEAR`.
10. **Precisa de resposta do fundador?** **NÃO** — a §10 propõe a regra: remoção **só** por ação do
    responsável, nunca automática por mudança de plano.

---

### 2.3 Códigos deliberadamente EXCLUÍDOS, com justificativa

A busca textual apontou 53 candidatos. **32 foram recusados** após leitura integral da ficha:

| Códigos | Motivo da exclusão |
|---|---|
| `P-01`, `P-02`, `P-04`, `P-06`, `P-15`, `P-17`, `P-19`, `P-23`, `P-51` | **Jornada e ordenação editorial.** Decidem *qual história vem depois* e *como as telas concordam entre si* — não decidem acesso. Permanecem citados como **dependências** de `P-05` e `P-22`. |
| `P-03`, `P-07`, `P-14` | **Predicado de conclusão e estado morto.** `P-03` é divergência de texto de parabéns; `P-07` está `REFUTADO`; `P-14` é estado sem produtor. Nenhum decide acesso. |
| `P-20`, `P-27`, `P-28`, `P-31` | **Fase 6 — tablet, tipografia e acessibilidade.** `P-66` entrou porque o *conteúdo* do rótulo é comercial; a **semântica** de a11y não é matéria de acesso. |
| `P-25`, `P-46`, `P-134` | **Robustez de erro e schema.** Mensagem de falha mascarada, escrita silenciosa e piso de versão com dois nomes são correções técnicas; nenhuma exige decisão de produto sobre acesso. `P-134` fica como dependência de `P-137`. |
| `P-39`, `P-40`, `P-41`, `P-43`, `P-44`, `P-53`, `P-54` (parcela de rotação), `P-86`, `P-100` | **Conteúdo devocional, jogos e rotação.** `P-44` (Home × Meu Momento) diverge em **reflexão diária**, não em recomendação de história protegida — por isso ficou de fora, ao contrário de `P-54`, que recomenda **história**. |
| `P-91`, `P-92`, `P-94`, `P-107`, `P-113`, `P-115`, `P-127`, `P-139` | **Ferramental, build e hardening.** Dependências não declaradas, `runtimeVersion`, rotas internas, cerca de flag e instrumentação de desempenho. `P-55` entrou apenas porque sua guarda `isPremium` é **inócua sob Modo Criador**, o que é matéria de acesso. |
| `P-93` | **Configuração comercial já decidida na 4A.** Permanece como dependência executável de `P-24` e `P-129`. |
| `P-110`, `P-131` | **Resíduo documental.** `P-131` está `CORRIGIDO`. |

### 2.4 Códigos incluídos por julgamento, **fora** da lista textual

| Código | Por que entrou |
|---|---|
| `P-50` | A conclusão do Colorir **nunca é escrita**. Sem isso não existe revisitação nem recompensa da atividade — núcleo do contrato da §12. |
| `P-55` | A guarda `isPremium` é **inócua sob Modo Criador**: é o único ponto onde um *override* lateral grava progresso real. |
| `P-56` | **Único ponto do código em que um erro concede acesso** (`remaining: Infinity, premium: true`). Fere a metade *fail-closed* da decisão nº 1. |
| `P-66` | Oferta comercial **lida em voz alta para a criança** por leitor de tela — o coração do contrato da §8. |
| `P-116` | Ausência de política de remoção toca diretamente a invariante *"nada é apagado"* da §10. |

---

## 3. Decisões já aprovadas — auditoria dos documentos árbitros

Documentos auditados: `docs/DECISIONS.md`, `docs/PROJECT_SOURCE_OF_TRUTH.md`,
`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`, `docs/launch/MATRIZ_DE_ACESSO.md`,
`docs/launch/DECISOES_E_CONFLITOS.md`,
`docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`,
`docs/fase4-product-lock/01_PRODUCT_LOCK_4A_...md`.

Classificação usada: **APROVADA** · **PARCIAL** · **AUSENTE** · **CONFLITO DOCUMENTAL** ·
**HIPÓTESE AINDA NÃO APROVADA**.

| # | Ponto | Classificação | Citação |
|---|---|---|---|
| 1 | Identidade nominal das histórias gratuitas | **APROVADA** | `DECISIONS.md:53` — `E1-STORIES-GRATIS` ✅: *"Histórias gratuitas oficiais = **A Criação** e **Noé**; locais, instantâneas, offline"*. Confirmado por `MATRIZ_DE_ACESSO.md:14`, `08_MATRIZ_DE_CONTEUDO:237` e pelo código `planConfig.js:83`, `contentManifest.js:22`. |
| 2 | Conteúdo do Plano Família | **APROVADA** | `DECISIONS.md:54` — `E1-STORIES-PREMIUM` ✅: *"As outras **18** pertencem ao Plano Família"*; `:58` `E1-PLANO-FAMILIA`. |
| 3 | Existência de acesso parcial / degustação | **AUSENTE** | **Zero ocorrências** de `degusta*` no repositório **e em todo o histórico Git**. Nenhum documento, aprovado ou histórico, propõe liberação parcial. **Não é hipótese registrada: é ausência total.** |
| 4 | Prévia de conteúdo protegido | **PARCIAL** | `DECISIONS.md:1015-1023` — `D-4A-HOME-GRATIS-ESGOTADA`: conteúdo protegido *"**pode** aparecer como **prévia carinhosa**"*. **O grau da prévia não está definido** e a decisão foi escrita para a **Home**, não para o Mapa, o Cultinho ou o Meu Momento. |
| 5 | Cena gratuita dentro de história protegida | **AUSENTE** | O gate é binário: `accessControl.js:89-95` e `contentAccessService.js:49-53` retornam `true`/`false`, sem granularidade por cena. `NarrationScreen.js:114,181` avalia a **história inteira**. |
| 6 | Conteúdo concluído — o que permanece | **APROVADA** | Gratuito: `DECISIONS.md:1016-1018` (*"histórias gratuitas para **revisitar**, obras do Colorir com o Beni, progresso, conquistas e atividades gratuitas"*). Premium: `DECISIONS.md:702-709` — *"uma pintura premium já salva **nunca será apagada** durante o downgrade"*; *"o **arquivo e o ponteiro permanecem localmente preservados**"*; *"a **preservação dos dados não significa liberação do conteúdo premium**"*. |
| 7 | Revisitação | **APROVADA no princípio, PARCIAL no fluxo** | Gratuito e premium autorizado: revisitável. Premium sem autorização: `DECISIONS.md:704` — *"enquanto a história premium **não estiver acessível**, a criança **não poderá iniciar nem editar** aquela atividade"*; `:706` — *"quando o **acesso Família retornar**, a obra **reaparece e volta a ser editável**"*. **Parcial no fluxo:** `PROJECT_SOURCE_OF_TRUTH.md:59` declara o *fluxo de revisão* de história concluída **aberto e migrado para a Fase 7** — falta decidir reinício de cenas, estado do selo e estrelas na segunda passagem. |
| 8 | Progresso e recompensas em conteúdo protegido | **APROVADA** | `DECISIONS.md:702-703`, `:1045` (*"progresso, pinturas e criações locais são preservados independentemente do estado comercial"*), `:715` (*"reiniciar progresso… **não** apaga automaticamente as pinturas salvas"*), `:985`. **Pendência de implementação, não de decisão:** a separação do reset em três ações (`:711-721`) é obrigatória antes do novo build físico da Spec 019. |
| 9 | Colorir com o Beni nas histórias acessíveis | **APROVADA** na regra, **AUSENTE** no alcance | Regra: `DECISIONS.md:661-665` — *"o **plano gratuito salva** as pinturas das histórias gratuitas ou de **qualquer história à qual possua acesso legítimo**"*; *"a autoridade de escrita deverá decidir pela **acessibilidade real da história e da atividade** — não pelo plano"*. Confirmada por `coloring60DrawingStorage.js:16-23`. Alcance: **`coloring60Catalog.js:64-66` só tem `creation`**; Noé não tem lineart no disco. |
| 10 | Criar Livre sem salvar no grátis | **APROVADA**, com **CONFLITO DOCUMENTAL residual** na redação de Fase 0 | Aprovada: `DECISIONS.md:690-692` (*"**NÃO REVOGADO** — `E1-PLANO-FREE` … `E1-ARTES-SALVAR` … limite zero de `ATELIER_FREE_SAVE_LIMIT`"*); `:863-864`; `MATRIZ_DE_ACESSO.md:22`. **Conflito (ver §3.2, C1):** `MATRIZ_DE_ACESSO.md:23` e `DECISOES_E_CONFLITOS.md:18` ainda dizem *"Salvar arte ❌ (0 no grátis)"* em redação **genérica**, sem a anotação da revogação parcial de 2026-08-03 (`DECISIONS.md:334-344`), que **libera o Colorir narrativo**. |
| 11 | Home no grátis depois de esgotar o conteúdo livre | **APROVADA** | `DECISIONS.md:1015-1023`. |
| 12 | Mapa de Aventuras diante de conteúdo protegido | **CONFLITO DOCUMENTAL** | O código exibe o marco premium como `nextLocked` — *"alcançada + premium → convite sutil"* (`AdventureMapScreen.js:324`) — e **nada é ocultado**. Nenhum documento árbitro autoriza ou proíbe esse convite. `D-4A-HOME-GRATIS-ESGOTADA` cobre só a Home. |
| 13 | Story Detail de história protegida | **APROVADA** | `contentAccessService.js:151-154`: `primaryLabel = 'Pedir ao responsável'`, `primaryButtonStyle = 'locked'`, `primaryActionType = 'openParentArea'`. Coerente com `E1-MONETIZACAO-V1`. |
| 14 | Cards, cadeados e chamadas | **APROVADA** | `StoryCard.js:30-35` (`accessBadgeType`), `:57-63` (cadeado + tinta); `QUALITY_CHECKLIST.md:190` exige o selo "Premium" em Davi e Golias. |
| 15 | Gate parental antes da oferta | **APROVADA E NÃO REABRÍVEL** | `DECISIONS.md:69` `E1-MONETIZACAO-V1`: *"paywall só atrás da Área dos Pais + gate parental; **sem compra direcionada à criança**"*; `MATRIZ_DE_ACESSO.md` regras transversais; `D-4A-RESTAURACAO-E-COMUNICACAO`. |
| 16 | Paywall na relação com a superfície infantil | **APROVADA** | `D-4A-HOME-GRATIS-ESGOTADA` + `D-4A-RESTAURACAO-E-COMUNICACAO`: *"Restaurar compra"* aparece na Área dos Pais **e** no paywall pós-gate; **nunca** como oferta direta na superfície infantil. |
| 17 | Cultinho e Meu Momento recomendando protegido | **AUSENTE** | Nenhum documento trata do caso. `familyWorshipService.js:75-77` usa a vitrine sem filtro de plano. |
| 18 | Conteúdo premium no binário | **APROVADA** | `DECISIONS.md:1025-1035` `D-4A-PAYLOAD-PREMIUM`: build de produção com **somente as 2 gratuitas**; *"a existência física de asset ou pack **nunca** concede autorização"*. |
| 19 | Comportamento offline das superfícies de acesso | **PARCIAL** | `D-4A-CACHE-EXPIRADO` fecha a **política** (7 dias, opção A) e `D-4A-JANELA-OFFLINE` congela a duração. **Ausente:** o que a **superfície infantil mostra** durante a revalidação pendente. |
| 20 | Estado grátis após concluir todo o conteúdo livre | **APROVADA** | `DECISIONS.md:1015-1023`. |

### 3.1 Hipóteses que **NÃO** são decisão

- **"Davi e Golias com degustação até a cena 03 ou até o primeiro Colorir"** — **HIPÓTESE AINDA NÃO
  APROVADA**, e mais do que isso: **não existe no corpus**. Busca exaustiva por `degusta`, `cena
  grátis`, `acesso parcial`, `trial de conteúdo`, `amostra`, `isca`, `funil` retornou **zero**
  ocorrências semânticas — no repositório e em todo o histórico Git. Todo registro sobre
  `david_goliath` é de **bloqueio integral**: `stories.js:403` (`accessType: 'premium'`),
  `contentManifest.js:29` (`'remote'`), `planConfig.js:79-83` (*"Davi e Golias NÃO está aqui →
  premium"*), `QUALITY_CHECKLIST.md:190` (badge "Premium"), e **dois guardrails executáveis** no
  `npm run smoke` (`scripts/smoke.js:19379` e `:34695`) que **reprovam** se Davi virar gratuita.
  Pelo rito antibifurcação (`DECISIONS.md:12-14`), *"decisão que só existe em conversa não é oficial
  até entrar lá"*.
- **Davi como "piloto"** — `DECISIONS.md:200` (`PL01A-13`) separa **piloto de produto** (A Criação)
  de **piloto técnico de pack** (Davi e Golias). A coocorrência textual de `david_goliath` com
  `preview` vem do **perfil de build EAS** (`featureFlags.js:40`) e dos relatórios de sandbox
  `F2_*`, **não** de monetização.
- **Estado `'preview'` no código** — existe (`contentAccessService.js:90`), mas significa apenas
  *"pode ver o card"*, produz o CTA *"Pedir ao responsável"*, e **`getStoryUIState` não é consumido
  por nenhuma tela**: é código morto que nunca revelou conteúdo.

### 3.2 Conflitos documentais registrados (sem escolher vencedor por conta própria)

> Estes conflitos são **registrados**, não resolvidos por esta fase. A precedência
> (`AGENTS.md` §*Precedência documental*) já indica o árbitro em cada caso; a **correção textual dos
> documentos subordinados** exige bloco documental próprio e não foi feita aqui.
>
> ✅ **ATUALIZAÇÃO DE 2026-08-05 — o bloco documental foi autorizado pelo fundador e executado.**
> Cada conflito abaixo recebeu **destino declarado**, respeitando o estatuto de cada arquivo:
> **normativo vigente se corrige · histórico se anota · evidência de validação física não se toca.**
>
> | Conflito | Destino | Onde |
> |---|---|---|
> | **C1** | **Corrigido** no normativo vigente e **anotado** no histórico | Linhas de Colorir/Criar Livre/salvamento reescritas em `MATRIZ_DE_ACESSO.md`; decisão 3 e conflito C2 **anotados sem reescrita** em `DECISOES_E_CONFLITOS.md` |
> | **C2** | **Encerrado** | `D-CRIAR-COM-BENI-STATUS` fechada em `DECISIONS.md` com banner; texto histórico preservado; `D-4B-NOMES-OFICIAIS` fixa os dois nomes |
> | **C3** | **Corrigido por anotação** no artefato 4A | Nota "✅ CORRIGIDO EM 2026-08-05" sob o bloco `:481-484`, sem apagar o achado original |
> | **C4** | **Corrigido por anotação** no artefato 4A | Nota "✅ CORRIGIDO EM 2026-08-05" sob o bloco `:438-442`, sem apagar o achado original |
> | **C5** | **PRESERVADO — deliberadamente não resolvido** | Determinação expressa do fundador: pertence ao bloco decisório do Brincar. **Anotado** em `MATRIZ_DE_ACESSO.md` e `DECISOES_E_CONFLITOS.md`; **nenhum texto alterado** |

**C1 — Salvamento no plano grátis: redação genérica de Fase 0 × revogação parcial datada.**
`DECISIONS.md:662` e `:866-869` declaram que o **plano gratuito salva** as pinturas do Colorir
narrativo de qualquer história a que tenha acesso legítimo, **inclusive no plano grátis**.
`MATRIZ_DE_ACESSO.md:23` (*"Salvar arte ❌ (0 no grátis)"*) e `DECISOES_E_CONFLITOS.md:18`
(*"a criança desenha mas não salva… Salvar/Galeria = Plano Família"*) mantêm redação **genérica**,
anterior à revogação parcial datada de **2026-08-03** (`DECISIONS.md:334-344`), que alcança **só a
coleção** (Colorir com o Beni) e **não toca a autoria** (Criar Livre). **Árbitro:** `DECISIONS.md`.
**Pendência:** anotar os dois textos de lançamento com a revogação — **não** substituir o histórico.

**C2 — `D-CRIAR-COM-BENI-STATUS` marcada `[A CONFIRMAR]`.** `DECISIONS.md:392-395` registra o status
de *"Criar com Beni"* como conflitante. A **atualização E1 de 2026-07-15** (`:396`) já resolveu o
essencial: *"o nome oficial da experiência criativa livre é **`Criar Livre`**; 'Criar com Beni'
deixa de existir como nome público de experiência separada"*. **Efeito nesta fase:** a colisão de
nomes é a **raiz de C1** — *"Criar com Beni"* na matriz de Fase 0 designa a **folha de desenho**,
não o Colorir narrativo. Este documento usa exclusivamente **Criar Livre** e **Colorir com o Beni**.

**C3 — `E1-ARTES-SALVAR` no artefato da 4A × status atual da matriz.**
`01_PRODUCT_LOCK_4A…md:481-484` descreve um conflito aberto entre árbitro e matriz para `P-64`/`P-65`.
`DECISIONS.md:876-877` já reclassificou esses códigos de `DECISÃO DE PRODUTO PENDENTE` para
`ABERTO` — **decisão fechada, correção pendente**. O texto da 4A descreve um conflito que **o dado
já não sustenta**. Registrado; não corrigido aqui.

**C4 — Citação obsoleta de periodicidade dentro do artefato da 4A.**
`01_PRODUCT_LOCK_4A…md:438-439` cita `MATRIZ_DE_ACESSO.md:34` afirmando *"mensal, **trimestral**,
anual"*. O arquivo citado **já foi corrigido** e hoje lê *"mensal e anual, e somente esses dois.
Sem trimestral e sem vitalício"*. A citação ficou congelada. Registrado; não corrigido aqui.

**C5 — Rodadas diárias: por criança × por dispositivo.** `DECISIONS.md:61` fixa **2 rodadas por dia,
por criança** e registra que *"o código atual conta por dispositivo/dia (compartilhado)"*.
`MATRIZ_DE_ACESSO.md:25` descreve *"2/dia (compartilhado)"* como se fosse a regra. **Árbitro:**
`DECISIONS.md`. Alcança `P-56` e `P-57`.

---

## 4. Decisões ausentes que a Fase 4B precisa resolver

| # | Lacuna | Consequência de não decidir | Vira pergunta? | ✅ Resolvida em 2026-08-05 |
|---|---|---|---|---|
| 1 | Existência de degustação em história premium | O contrato de acesso fica indefinido para 18 de 20 histórias; `P-05`, `P-26` e `P-136` não podem ser especificados | **Sim — Pergunta 1** | ✅ `D-4B-SEM-DEGUSTACAO` — **opção A, nenhuma degustação** |
| 2 | Grau exato da prévia na Home **e** no Mapa | `P-05` e `P-26` não podem ser implementados; o Mapa hoje faz convite pulsante sem autorização documental | **Sim — Pergunta 2** | ✅ `D-4B-PREVIA-EDITORIAL` — **6 itens permitidos, 12 proibidos**, Home e Mapa sob a mesma regra |
| 3 | Cultinho e Meu Momento podem apontar conteúdo protegido | `P-54` sem contrato; risco de a família grátis receber sempre conteúdo que não pode abrir | **Sim — Pergunta 3** | ✅ `D-4B-FILTRO-RECOMENDACAO` — **filtro estrito (opção A)** |
| 4 | Alcance do Colorir com o Beni no v1 (só A Criação, ou também Noé) | `P-36`, `P-37` e `P-130` sem contrato; a Spec 014 promete 3 linearts de Noé que **não existem no disco** | **Sim — Pergunta 4** | ✅ `D-4B-COLORIR-60-ESCALA` — **escala completa: 20 histórias × 3 atividades = 60** |
| 5 | Texto narrado e quiz premium dentro do bundle JS | `D-4A-PAYLOAD-PREMIUM` fala em *"metadados mínimos de vitrine"*; texto integral e quiz não foram nomeados | **Não** — §11 propõe a determinação; não altera decisão aprovada | ✅ `D-4B-PAYLOAD-PREMIUM-NO-BINARIO` — **evidência de `P-136` ampliada**, sem código `P` novo |
| 6 | O que a superfície infantil mostra durante revalidação pendente | Estado 4 do entitlement sem tradução visual | **Não** — §10 propõe; é implementação da regra já aprovada | Segue como implementação (Fase 11), sob `D-4B-PREVIA-EDITORIAL` |
| 7 | Remoção de packs do disco | Colide com *"nada é apagado"* | **Não** — §10 propõe: remoção só por ação do responsável | Inalterado — reafirmado por `D-4B-SALVAMENTO-DUAS-EXPERIENCIAS` (nada é apagado) |
| 8 | Fluxo de revisão de história concluída | Declarado aberto e migrado à **Fase 7** (`PROJECT_SOURCE_OF_TRUTH.md:59`) | **Não** — o princípio da revisitação está aprovado; o fluxo é matéria da Fase 7 | Permanece na Fase 7 — **não** decidido aqui |

> **Retirada desta lista após a auditoria:** *"acesso às pinturas premium depois de perder o
> entitlement"* **não é lacuna** — está decidido em `DECISIONS.md:700-709`
> (`D-C60-PERSISTENCIA-TODOS-PLANOS` §3). Ver §10.4. **Não vira pergunta.**

---

## 5. Matriz canônica de acesso por conteúdo

> **Leitura obrigatória.** `G` = plano grátis · `F` = Plano Família. **A existência física de asset
> ou pack nunca concede autorização** (`D-4A-PAYLOAD-PREMIUM`).
>
> ✅ **ATUALIZADA EM 2026-08-05 — nenhuma célula `[?]` permanece.** As duas células que dependiam do
> fundador (coluna 3 das linhas 3 e 4) foram preenchidas pela resposta às Perguntas 1 e 2:
> `D-4B-SEM-DEGUSTACAO` e `D-4B-PREVIA-EDITORIAL`.

| # | Conteúdo | 1. Grátis | 2. Família | 3. Prévia? | 4. Gate parental? | 5. Baixável? | 6. Revisitável? | 7. Após perder entitlement | 8. Pack sem autorização | 9. Offline | 10. Decisão faltante |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **A Criação** (história completa) | ✅ | ✅ | n/a | ❌ | Local, não baixa | ✅ sempre | Inalterado | n/a | ✅ sempre | — |
| 2 | **Noé** (história completa) | ✅ | ✅ | n/a | ❌ | Local, não baixa | ✅ sempre | Inalterado | n/a | ✅ sempre | ✅ Resolvido — **3 atividades de Colorir**, primeiro alvo de escala (`D-4B-COLORIR-60-ESCALA`) |
| 3 | **Davi e Golias** | ❌ | ✅ | **Prévia editorial**: capa · título · sinopse curta · região no Mapa · selo neutro · estado protegido. **Nada mais** | ✅ **antes** de qualquer preço ou oferta | ✅ (Família) | ✅ enquanto autorizado | Volta a bloquear | **Não abre** | ✅ após download | ✅ Resolvido — **sem degustação** (`D-4B-SEM-DEGUSTACAO`) |
| 4 | **Demais 17 premium** (grupo) | ❌ | ✅ | **Prévia editorial** idêntica à linha 3 | ✅ **antes** de qualquer preço ou oferta | ✅ (Família) | ✅ enquanto autorizado | Volta a bloquear | **Não abre** | ✅ após download | ✅ Resolvido — idem linha 3 |
| 5 | **Capa e metadados** de qualquer história | ✅ ver | ✅ | ✅ — é a prévia | ❌ para ver | Ficam no binário | ✅ | Permanecem visíveis | Irrelevante | ✅ | Extensão ao Mapa (§15 P2) |
| 6 | **Cena narrativa** (ilustração + texto) | Só nas 2 grátis | ✅ | ❌ nenhuma cena premium | ✅ | ✅ por pack | ✅ se acessível | Bloqueia na próxima entrada | **Não abre** | ✅ se local ou baixado | **§15 P1** |
| 7 | **Narração em áudio** | Só nas 2 grátis | ✅ | ❌ | ✅ | ✅ por pack | ✅ se acessível | Bloqueia | **Não toca** | ✅ | — |
| 8 | **Quiz** | Só nas 2 grátis | ✅ | ❌ | ✅ | Hoje no bundle | ✅ se acessível | Bloqueia | **Não abre** | ✅ | Sai do bundle? (§11) |
| 9 | **Reflexão / Momento com Beni** | Só nas 2 grátis | ✅ | ❌ | ✅ | Hoje no bundle | ✅ se acessível | Bloqueia | **Não abre** | ✅ | — |
| 10 | **Colorir com o Beni** (atividade narrativa) | ✅ **nas histórias acessíveis**, com salvamento | ✅ em todas | ❌ | ✅ para as premium | Deveria vir por pack (`P-130`) | ✅ **sempre**, obra própria | Não pode **iniciar nem editar** a atividade premium; a obra **volta ao retornar o acesso** | **Não abre** | ✅ | ✅ Resolvido — **20 histórias × 3 atividades = 60** (`D-4B-COLORIR-60-ESCALA`) |
| 11 | **Conclusão de história** | ✅ nas 2 grátis | ✅ | ❌ | ❌ | n/a | ✅ reabrível | Conclusão **não se apaga** | n/a | ✅ | — |
| 12 | **Recompensas e estrelinhas** | ✅ pelo que a criança acessou | ✅ | ❌ | ❌ | n/a | ✅ | **Nunca revogadas** | n/a | ✅ | — |
| 13 | **Pinturas salvas** (Colorir narrativo) | ✅ das histórias acessíveis | ✅ de todas | ❌ | ❌ | n/a | ✅ | Arquivo e ponteiro **preservados**; a obra premium **não é destruída** e **reaparece** ao retornar o acesso | n/a | ✅ | — |
| 14 | **Download do pack** | ❌ | ✅ | n/a | ✅ (ação do responsável) | ✅ | n/a — o pack persiste | **Permanece no disco, inerte** | **Não autoriza** | Instalado = offline | Marcador × versão (`P-137`) |
| 15 | **Revisitação de conteúdo concluído** | ✅ do gratuito | ✅ de tudo autorizado | n/a | ❌ | n/a | ✅ **card concluído nunca fica `disabled`** | Gratuito segue integral; premium volta a bloquear sem destruir nada | n/a | ✅ | Fluxo de revisão (Fase 7) — `P-18`, `P-22` |
| 16 | **Estado offline** | ✅ integral nas 2 grátis | ✅ após download | n/a | ❌ | n/a | ✅ | Cache expira em **7 dias** → grátis | **Não autoriza** | ✅ | Texto da revalidação (§10) |

### 5.1 Notas obrigatórias sobre a matriz

1. **Linhas 3 e 4 não foram preenchidas com liberação parcial** — e, depois da resposta do fundador,
   **nunca serão**. A coluna 3 registra **prévia editorial de metadados**, não degustação.
   **Nenhuma cena premium é gratuita**, e **não existe autorização por cena** (`D-4B-SEM-DEGUSTACAO`).
   A prévia **não pode** conter cena narrativa integral, áudio narrado, quiz, reflexão, Colorir,
   recompensa, progresso fabricado, preço, desconto, teste grátis, urgência ou botão de assinar — e a
   proibição comercial alcança `accessibilityLabel`, leitor de tela, áudio e qualquer mensagem falada
   (`D-4B-PREVIA-EDITORIAL`).
2. **Linha 10 é a exceção deliberada do projeto:** o Colorir com o Beni salva **em qualquer plano**,
   desde que haja **acesso legítimo à história e à atividade** — inclusive no grátis, em A Criação.
   Autoridade por **conteúdo**, não por plano.
3. **Linhas 8 e 9 marcam o descompasso do payload:** quiz e reflexão premium hoje viajam no bundle
   JS, fora do alcance dos `require()` medidos em `P-136`.
4. **Coluna 8 é a aplicação literal de `D-4A-PAYLOAD-PREMIUM`:** pack presente sem autorização
   **nunca** abre.
5. **Coluna 7 nunca implica apagamento.** Nenhuma célula autoriza remover dado infantil.

---

## 6. Contrato das histórias gratuitas

> Dez confirmações. As marcadas **APROVADA** citam documento árbitro; as marcadas **PROPOSTA** são
> desta fase e dependem do fundador apenas onde indicado.

1. **Identidade nominal — APROVADA.** As histórias gratuitas são **A Criação** (`creation`) e
   **Noé** (`noah`). `DECISIONS.md:53`; `planConfig.js:83`; `contentManifest.js:22`;
   `MATRIZ_DE_ACESSO.md:14`. **Inequívoco: não vira pergunta.**
2. **Quantidade — APROVADA.** São **exatamente duas**. As outras 18 pertencem ao Plano Família
   (`DECISIONS.md:54`).
3. **Localidade — APROVADA.** São **locais no binário**, instantâneas e offline
   (`DECISIONS.md:53`; `PROJECT_SOURCE_OF_TRUTH.md:15`; `v5:58`).
4. **Integralidade — APROVADA.** São **completas**: narração, cenas, quiz, Livrinho e Momento com o
   Beni (`DECISIONS.md:57` — `E1-PLANO-FREE`).
5. **Colorir — APROVADA na regra, PENDENTE no alcance.** O Colorir com o Beni de uma história
   gratuita é **acessível e salvável no plano grátis** (Spec 019;
   `coloring60DrawingStorage.js:16-23`). **Mas** o catálogo só tem `creation`
   (`coloring60Catalog.js:64-66`) e **Noé não possui lineart no disco**. → **Pergunta 4**.
6. **Conclusão — PROPOSTA.** Concluir uma história gratuita gera conclusão registrada, recompensa e
   celebração, **sem qualquer dependência de plano**.
7. **Revisitação — PROPOSTA.** História gratuita concluída permanece **integralmente reabrível**,
   sem limite de vezes e sem exigir gate parental. Card concluído **nunca** fica `disabled`
   (`P-18`).
8. **Persistência — APROVADA.** Progresso, pinturas do Colorir narrativo e estrelinhas das histórias
   gratuitas persistem localmente (Spec 019; `D-4A-CACHE-EXPIRADO`).
9. **Independência do estado comercial — APROVADA.** As duas gratuitas **nunca** são afetadas por
   entitlement: expirado, ausente, corrompido ou de origem não comprovada, o plano resolve para
   **grátis** e o conteúdo gratuito permanece integral (`D-4A-MIGRACAO-ENTITLEMENT`).
10. **Ausência de compensação comercial — APROVADA.** Esgotado o conteúdo gratuito, a Home **não
    vira paywall** e a criança continua com revisitação, obras, progresso e conquistas
    (`D-4A-HOME-GRATIS-ESGOTADA`).

---

## 7. Degustação de história premium — auditoria e alternativas

### 7.1 Auditoria da hipótese "Davi e Golias libera até a cena 03 ou até o primeiro Colorir"

> **Resultado da auditoria: a hipótese NÃO EXISTE no corpus do projeto.** Não é decisão, não é
> proposta registrada, não é "memória de discussão" documentada. É uma hipótese **nova**, trazida
> por este mandato. **Este documento não a adota nem a rejeita — apenas registra o que existe.**

| # | Determinação | Resultado |
|---|---|---|
| 1 | Existe decisão aprovada de degustação? | **Não.** Nenhuma entrada em `docs/DECISIONS.md`. |
| 2 | Existe proposta escrita de degustação? | **Não.** Nenhuma em `docs/`, `specs/` ou `src/`. |
| 3 | O termo "degustação" aparece no repositório? | **Zero** ocorrências de `degusta*`. |
| 4 | O termo aparece no histórico Git? | **Zero.** `git log --all -S"degusta" -i` não retorna commit algum. |
| 5 | Existem sinônimos ("amostra", "isca", "trial de conteúdo", "cena grátis")? | **Zero** ocorrências semânticas. |
| 6 | Qual o `accessType` de Davi e Golias? | `'premium'` — `stories.js:399`, `:403`. |
| 7 | Davi está na lista de gratuitas? | **Não.** `planConfig.js:83` — `FREE_STORY_IDS = ['creation','noah']`, com comentário *"Davi e Golias NÃO está aqui → premium"* (`:79-83`). |
| 8 | Qual a origem do conteúdo de Davi? | `'remote'` — `contentManifest.js:29`. |
| 9 | Como Davi aparece na UI? | Selo **Premium** exigido por `QUALITY_CHECKLIST.md:190`. |
| 10 | Existe mecanismo de acesso **por cena** no código? | **Não.** O gate é binário e **por história** (`accessControl.js:89-95`, `contentAccessService.js:49-53`, `NarrationScreen.js:114`, `:181`). |
| 11 | Existe guardrail executável contra liberar Davi? | **Sim, dois.** `scripts/smoke.js:19379` e `:34695` reprovam se `CAT.isFreePuzzleStory('david_goliath')` deixar de ser `false`. |
| 12 | Davi é "piloto" de alguma coisa? | Sim, mas **técnico**: `DECISIONS.md:200` (`PL01A-13`) — *"o piloto oficial da nova experiência = A Criação; Noé é o segundo. **Davi e Golias segue como caso técnico de pack, não como piloto oficial de produto**"*. A coocorrência de `david_goliath` com `preview` vem do **perfil de build EAS** (`featureFlags.js:40`) e dos relatórios de sandbox `F2_*` — **não** de monetização. |
| 13 | Existe algum vizinho semântico aprovado? | **Um só:** `D-4A-HOME-GRATIS-ESGOTADA` — *"conteúdo protegido **pode** aparecer como **prévia carinhosa**"*. Isso é **vitrine** (card, capa, título, orientação para chamar um adulto). **Não libera cena, narração, quiz nem atividade.** |

**Consequência formal:** pelo rito antibifurcação (`DECISIONS.md:400`, `D-ANTIBIFURCACAO` item 5 —
*"decisão que só existe em conversa não é decisão oficial até entrar aqui"*), **as Opções B e C
abaixo são propostas novas**, não decisões existentes. A **Opção A é o comportamento hoje aprovado e
implementado**.

### 7.2 OPÇÃO A — Somente as duas gratuitas completas; nenhuma cena grátis em história premium

*É o estado atual: aprovado, implementado e protegido por guardrail executável.*

1. **Efeito na criança.** Fronteira nítida e previsível: o que abre, abre inteiro. Nunca há a
   experiência de ser interrompida no meio de uma narrativa. Reduz frustração ao mínimo.
2. **Efeito na percepção do responsável.** O valor do Plano Família é comunicado pela **quantidade**
   (2 → 20), não pela experiência. Depende inteiramente do texto da Área dos Pais, já que o
   responsável nunca vê o conteúdo premium antes de comprar.
3. **Efeito na conversão.** É o cenário mais conservador. Sem prova de experiência premium, a
   decisão de compra se apoia em vitrine e reputação.
4. **Complexidade de implementação.** **Nenhuma nova.** O gate binário por história já existe.
   Restam apenas as correções já mapeadas (`P-05`, `P-26`, `P-42`).
5. **Impacto no entitlement e no *fail-closed*.** **Nenhum.** Preserva a decisão nº 1 sem exceções:
   sem acesso ⇒ não abre. É a opção com menor superfície de erro de autorização.
6. **Impacto no payload e nos packs.** **Nenhum.** `D-4A-PAYLOAD-PREMIUM` pode ser cumprida
   integralmente: nenhuma cena premium precisa viajar no binário.
7. **Impacto no progresso e na persistência.** **Nenhum.** Não existe progresso parcial de história
   inacessível para conciliar.
8. **Impacto na validação futura.** Menor esforço: valida-se apenas o gate binário e a orientação
   neutra.
9. **Risco de conflito com decisão aprovada.** **Zero.** É a decisão aprovada.

### 7.3 OPÇÃO B — Davi e Golias com degustação fixa até um marco aprovado

*Proposta nova. Não existe no corpus.*

1. **Efeito na criança.** Introduz deliberadamente uma **interrupção narrativa**: a criança entra na
   história, se envolve, e é parada. É o oposto do princípio de fronteira nítida da Opção A e exige
   um desfecho de bloqueio especialmente cuidadoso, dentro dos limites da §8.
2. **Efeito na percepção do responsável.** Mais forte: o responsável vê **a experiência real**, não
   uma promessa. Melhor prova de valor de produção (arte, narração, ritmo).
3. **Efeito na conversão.** Potencialmente o maior das três — mas o gatilho de compra passa a ser
   **a criança interrompida**, o que aproxima perigosamente da pressão comercial infantil vedada por
   `DECISIONS.md:69` e `:987-989`. **Este é o ponto crítico da opção.**
4. **Complexidade de implementação.** **Alta.** Exige criar granularidade **por cena** onde hoje só
   existe granularidade **por história**: `accessControl.js:89-95`, `contentAccessService.js:49-53`,
   `NarrationScreen.js:114`, `:181`, `AdventureMapScreen.js:318-329`, `StoryDetailScreen.js:522`,
   `:573`. **Novo eixo de autorização, não ajuste de parâmetro.**
5. **Impacto no entitlement e no *fail-closed*.** **Significativo.** Cria um terceiro estado
   (*parcialmente autorizado*) entre `free` e `premium`. Cada ponto que hoje decide por booleano
   passa a precisar de resposta ternária — e cada ponto esquecido vira liberação indevida. Aumenta
   a superfície de erro exatamente na área mais sensível do produto.
6. **Impacto no payload e nos packs.** **Direto e contrário a `D-4A-PAYLOAD-PREMIUM`.** As cenas
   degustadas precisam estar disponíveis **antes** da compra: ou voltam ao binário — contradizendo
   *"o build de produção contém somente as 2 histórias gratuitas locais"* — ou exigem download de
   pack parcial **sem entitlement**, o que hoje `packDownloadService` não faz e que colide com
   *"pack no disco nunca é autorização"*. **Requer reabrir uma decisão aprovada.**
7. **Impacto no progresso e na persistência.** Cria progresso parcial numa história que a criança
   **não pode concluir**. Colide com `D-CONCLUSAO-TOTAL-B` (`DECISIONS.md:354-358`), que exige
   conclusão total para o selo e para o desbloqueio. Se a degustação incluir Colorir, cria pintura
   premium salva **sem entitlement** — e a regra do downgrade (`:704`) passa a se aplicar a alguém
   que nunca teve o plano.
8. **Impacto na validação futura.** **Maior das três.** Exige validar o corte em cada superfície,
   em cada ordem de navegação, e provar que nenhuma rota alternativa passa do marco.
9. **Risco de conflito com decisão aprovada.** **Alto.** Toca `D-4A-PAYLOAD-PREMIUM`,
   `D-CONCLUSAO-TOTAL-B`, `E1-STORIES-PREMIUM` e a proibição de pressão comercial infantil. Exige
   **dois guardrails do smoke** serem reescritos (`scripts/smoke.js:19379`, `:34695`).

### 7.4 OPÇÃO C — Todas as premium com prévia narrativa padronizada, sem progresso nem atividade persistente

*Proposta nova. Não existe no corpus.*

1. **Efeito na criança.** Tratamento **uniforme** — 18 histórias se comportam igual, o que é mais
   fácil de entender do que uma exceção. Mas multiplica por 18 o número de interrupções possíveis.
2. **Efeito na percepção do responsável.** Boa amostra de amplitude do catálogo; prova que "as 18"
   existem e têm a mesma qualidade.
3. **Efeito na conversão.** Provavelmente entre A e B. A prévia curta e repetida tende a virar
   ruído após as primeiras.
4. **Complexidade de implementação.** **Média-alta.** Mesma granularidade por cena da Opção B, mas
   **uniforme** — sem caso especial. Em compensação, ao proibir progresso e atividade persistente,
   evita a conciliação de estado parcial.
5. **Impacto no entitlement e no *fail-closed*.** Menor que B: o estado *prévia* pode ser
   **somente leitura por construção** — nada é escrito, nada é concluído. Ainda assim cria o
   terceiro estado.
6. **Impacto no payload e nos packs.** **O pior das três.** Exige a primeira cena (ou o trecho
   padronizado) das **18** histórias disponível sem compra — 18 ilustrações + 18 narrações
   embarcadas ou baixáveis sem entitlement. Contraria `D-4A-PAYLOAD-PREMIUM` em escala.
7. **Impacto no progresso e na persistência.** **Baixo por desenho:** a proposta já exclui progresso
   e atividade persistente. Ainda exige garantir que a prévia não escreva conclusão nem pintura.
8. **Impacto na validação futura.** Alta em amplitude (18 histórias), média em profundidade
   (um único padrão a validar).
9. **Risco de conflito com decisão aprovada.** **Alto** em `D-4A-PAYLOAD-PREMIUM`; **médio** nos
   demais, já que não gera progresso parcial.

### 7.5 Recomendação técnica (não é decisão)

**A Opção A é a única que não reabre nenhuma decisão aprovada.** É também a única compatível com o
lançamento no prazo, porque as Opções B e C exigem um **novo eixo de autorização por cena** que hoje
não existe em nenhum ponto do código, e ambas colidem frontalmente com `D-4A-PAYLOAD-PREMIUM` —
decisão tomada há poucos dias e ainda não implementada.

Se o objetivo por trás da hipótese for **prova de valor ao responsável**, existe um caminho que
**não** toca o contrato de acesso nem a superfície infantil: apresentar a amostra **na Área dos
Pais, depois do gate parental**, onde `DECISIONS.md:69` e `:989` já autorizam conteúdo comercial e
explicativo. Isso entregaria a prova de experiência **sem** interromper a criança e **sem** criar o
terceiro estado de autorização.

**Nada disso é decisão.** Ver §15, Pergunta 1.

### 7.6 ✅ DECISÃO DO FUNDADOR — 2026-08-05 · **OPÇÃO A**

> Registro formal. Prevalece sobre qualquer redação anterior deste documento.

O fundador escolheu a **Opção A**. Determinações literais:

1. **Não haverá degustação gratuita** por cena, atividade ou marco dentro de histórias premium.
2. **A Criação** e **Noé** são as **duas histórias gratuitas completas**.
3. **Davi e Golias** e as outras **dezessete** histórias permanecem **integralmente protegidas pelo
   Plano Família**.
4. **Não liberar** cena 03, primeiro Colorir, quiz, reflexão, áudio ou **qualquer progresso parcial**
   em Davi e Golias.
5. **A antiga hipótese de degustação de Davi e Golias fica REJEITADA para o lançamento.**
6. **Não haverá mecanismo de autorização por cena.**
7. A criança poderá visualizar **apenas prévia editorial**, conforme `D-4B-PREVIA-EDITORIAL` (§7.7).
8. **Pack presente no aparelho nunca é autorização.**

**Consequência operacional.** As Opções B e C ficam **fechadas**. Os dois *guardrails* do
`npm run smoke` que reprovam se `david_goliath` deixar de ser premium **permanecem como estão** e
passam a ter estatuto de proteção da decisão. **Nada há a implementar**: o que existe é o **dever de
não introduzir** o mecanismo. Registrado em `docs/DECISIONS.md` §`PL4B` ·
`D-4B-SEM-DEGUSTACAO`.

### 7.7 ✅ DECISÃO DO FUNDADOR — 2026-08-05 · contrato da prévia editorial

> Resposta à Pergunta 2. **Home e Mapa aplicam a mesma regra de acesso**, embora possam utilizar
> **composições visuais diferentes**.

| **PODE conter (6)** | **NÃO pode conter (12)** |
|---|---|
| 1. Capa | 1. Cena narrativa integral · 2. Áudio narrado · 3. Quiz |
| 2. Título | 4. Reflexão · 5. Colorir · 6. Recompensa |
| 3. Sinopse curta | 7. Progresso fabricado · 8. **Preço** · 9. **Desconto** |
| 4. Região ou posição no Mapa | 10. **Teste grátis** · 11. **Urgência** |
| 5. Selo neutro do Plano Família | 12. **Botão "Assine agora"** |
| 6. Estado visual protegido | |

- **Ao tocar**, a criança recebe **orientação neutra para pedir ajuda a um adulto**.
- **O gate parental ocorre ANTES** de qualquer paywall, preço, oferta ou informação comercial.
- **A proibição comercial vale também para `accessibilityLabel`, leitor de tela, áudio e qualquer
  mensagem falada.**

Isto **resolve a sub-pergunta** da §15/P2: o Mapa segue a mesma **regra de acesso** da Home, com
liberdade de composição visual — e o que ele exibe está limitado aos seis itens acima. Registrado em
`docs/DECISIONS.md` §`PL4B` · `D-4B-PREVIA-EDITORIAL`. **Implementação pendente na Fase 11**; a
correção do `accessibilityLabel` comercial (`P-66`) é da **Fase 12A**.

---

## 8. Contrato das superfícies infantis diante de conteúdo bloqueado

### 8.1 Invariantes comuns — valem para **todas** as 10 superfícies, sem exceção

Estes seis atributos são **idênticos em toda superfície infantil** e derivam de decisão já aprovada
(`DECISIONS.md:69`, `:987-989`, `:1019-1020`; `MATRIZ_DE_ACESSO.md:33`):

| Atributo | Contrato |
|---|---|
| **4. Voz permitida** | Orientação **neutra e carinhosa** equivalente a *"Peça ajuda a um adulto para continuar"*. Sem culpa, sem insistência, sem repetição. |
| **5. Voz proibida** | Preço · desconto · teste grátis · *"Assine agora"* · *"Desbloqueie"* · nome comercial do plano usado como chamada de ação · qualquer texto que peça à criança que convença um adulto. |
| **6. Preço, desconto ou teste grátis** | **Proibidos**, em qualquer forma. |
| **7. Urgência ou contagem** | **Proibidas.** Sem contagem regressiva, sem *"últimos dias"*, sem badge de escassez. |
| **8. Botão de compra** | **Inexistente.** Nenhuma superfície infantil possui ação que leve à loja. |
| **10. Onde a oferta pode aparecer** | **Somente** na Área dos Pais, **depois** do gate parental — incluindo o paywall e *"Restaurar compra"*. |

> **Extensão explícita desta fase (`P-66`):** os atributos 5, 6 e 7 valem também para
> **`accessibilityLabel`, `accessibilityHint`, texto oculto e áudio**. Hoje `BrincarScreen.js:324`
> coloca oferta comercial no rótulo de acessibilidade — **o leitor de tela lê a oferta para a
> criança**. Isso é violação, não detalhe.

### 8.2 Contrato por superfície — atributos diferenciadores

| # | Superfície | 1. O que a criança vê | 2. O que pode tocar | 3. O que acontece ao toque | 9. Caminho para o adulto | 11. Áudio e Beni | 12. Estado |
|---|---|---|---|---|---|---|---|
| 1 | **Home — bloco de história protegida** | Card com capa, título e **selo dourado "Plano Família"** (`DECISIONS.md:390`); arte com tratamento de bloqueio; **nunca** "Em breve" (`:389`) | Sim — o card é tocável | Orientação neutra + convite a chamar um adulto. **Nada abre.** | Menção falada, sem botão de compra | Beni pode falar a orientação; **sem** fala comercial | **Aprovado** no princípio; `P-05` e `P-42` pendentes |
| 2 | **Mapa — marco de história protegida** | Marco visível com cadeado ilustrado; hoje `nextLocked` com pulso de convite (`AdventureMapScreen.js:324`) | Sim | Idem superfície 1 | Idem | Idem | **Grau depende da Pergunta 2**; nada é ocultado hoje |
| 3 | **Story Detail de história protegida** | Capa, título, sinopse e selo; **nenhuma cena** | Sim — CTA único | `primaryLabel = 'Pedir ao responsável'` → `openParentArea` (`contentAccessService.js:151-154`) | **Este é o caminho canônico** | Beni acolhe; sem oferta | **Aprovado e implementado** |
| 4 | **Cena narrativa de história protegida (entrada direta)** | Não deve ser alcançável | Não | Redireciona ao Story Detail; **nunca** renderiza cena | Via superfície 3 | Sem áudio da cena | **Aprovado**; `NarrationScreen.js:114,181` já bloqueia |
| 5 | **Colorir com o Beni de história protegida** | Card da atividade com selo; **sem lineart** | Sim | Orientação neutra. **Não inicia nem edita** (`DECISIONS.md:704`) | Via superfície 3 | Beni acolhe | **Aprovado** |
| 6 | **Livrinho / Momento com Beni de história protegida** | Entrada visível e selada | Sim | Orientação neutra | Via superfície 3 | Beni acolhe | **Aprovado**; copy de `P-37` pendente |
| 7 | **Cultinho em Casa apontando história protegida** | Hoje: sempre a vitrine, sem filtro de plano (`familyWorshipService.js:75-77`) | Sim | **Indefinido** | **Indefinido** | — | **DECISÃO AUSENTE — Pergunta 3** |
| 8 | **Criar Livre no grátis, ao tentar salvar** | Folha de desenho normal; **aviso carinhoso antes da folha** | Sim — desenha livremente | `AtelierCanvasScreen.js:271-274` abre o overlay `'family'`; **desenho não é destruído** | Overlay orienta a chamar um adulto | Beni acolhe | **Aprovado**; `P-65` pendente |
| 9 | **Minhas artes / Galeria no grátis** | **Estado vazio convidativo** — nunca *"N de 0"*, nunca barra `NaN` | Sim | Explicação carinhosa do que a galeria guarda | Menção neutra | Beni acolhe | **Aprovado**; `P-63` **BLOQUEIA LANÇAMENTO** |
| 10 | **Brincar — rodada esgotada no grátis** | Estado de descanso: *"a gente volta a brincar amanhã"* | Sim — os demais conteúdos seguem tocáveis | Convite a outra atividade **gratuita**; nunca beco sem saída | Menção neutra | Beni acolhe | **Aprovado**; `P-56`, `P-57`, `P-66` pendentes |

### 8.3 Regra de fechamento

Nenhuma superfície infantil pode produzir, como resultado de um toque em conteúdo bloqueado, um
**beco sem saída**: o desfecho é sempre **orientação neutra + pelo menos um caminho gratuito
disponível**. Se em algum estado do produto não houver caminho gratuito restante, aplica-se a §9.

---

## 9. Home e Mapa no plano grátis depois de esgotado o conteúdo livre

> Base: `D-4A-HOME-GRATIS-ESGOTADA` (`DECISIONS.md:1014-1023`), **decisão resolvida**.

### 9.1 As seis proibições (decisão de produto)

Esgotado o conteúdo gratuito, a Home e o Mapa **não podem**:

1. **Ficar vazios.**
2. **Virar paywall** — nem em tela cheia, nem em faixa persistente, nem em modal de abertura.
3. **Esconder as histórias gratuitas já concluídas** — conteúdo concluído continua visível e
   reabrível.
4. **Retirar pinturas, obras ou progresso** da vista da criança.
5. **Mostrar apenas cards bloqueados** — sempre há algo que abre.
6. **Criar sensação de punição, dívida ou falta** — nem por texto, nem por arte, nem por som.

### 9.2 O que permanece disponível (decisão de produto)

- Histórias gratuitas para **revisitar**, integralmente.
- **Obras do Colorir com o Beni** já produzidas, reabríveis.
- **Progresso** e **conquistas** acumulados.
- **Atividades gratuitas** — Criar Livre (sem salvar), jogos dentro do limite diário, Cultinho e Meu
  Momento no que for gratuito.

### 9.3 Separação obrigatória entre decisão e implementação

| Camada | Conteúdo |
|---|---|
| **Decisão de produto (esta fase)** | As seis proibições da §9.1 e a lista da §9.2. **Fechadas.** |
| **Decisão pendente do fundador** | O **grau** da prévia de conteúdo protegido nas duas superfícies, e se o Mapa segue a mesma regra da Home (§15, Pergunta 2). |
| **Implementação visual futura (Fases 11 e 17)** | Como o card selado é desenhado, qual o tratamento da arte, onde o Beni aparece, qual a ordem dos blocos, como o Mapa representa o marco selado. **Não é matéria desta fase.** |

### 9.4 Descompasso conhecido entre a decisão e o código

`D-4A-HOME-GRATIS-ESGOTADA` está **resolvida**, mas **não implementada**: a Home hoje **não importa
`accessControl` nem `contentAccessService`**, `playableStories` (`HomeScreen.js:653`) inclui as 18
premium e `showcaseStory.js:18-19` é apenas **preferência** por gratuitas, com queda para qualquer
jogável. O resultado observável é o descrito em `DECISIONS.md:1021-1022`: *"hoje a Home recomenda
`david_goliath`, que é premium, **sem filtro de acesso**"*. `P-05`.

> ✅ **REGISTRO CONFIRMADO EM 2026-08-05 (correção obrigatória nº 11 do fundador).** O descompasso
> está registrado na **matriz canônica**, no `obs` de `P-05`, junto da regra que o corrige:
> `D-4B-FILTRO-RECOMENDACAO` — *"nenhuma recomendação pode resultar em toque sem resposta"*.
> **Decisão de produto resolvida · implementação do filtro PENDENTE (Fase 11) · risco de código
> NÃO corrigido.** `P-05` permanece **não** marcado como `CORRIGIDO`.

---

## 10. Perda do entitlement — efeito sobre conteúdo, progresso e criações

> Base normativa: `D-4A-CACHE-EXPIRADO`, `D-4A-JANELA-OFFLINE`, `D-4A-MIGRACAO-ENTITLEMENT` e
> `D-C60-PERSISTENCIA-TODOS-PLANOS` §3 (`DECISIONS.md:700-709`). Esta seção **aplica** esses
> contratos; não os redecide.

### 10.1 As seis invariantes (nenhuma pode ser violada por implementação)

1. **Nenhum dado infantil é apagado** por decisão de plano — progresso, pinturas, desenhos, galeria
   e conquistas (`DECISIONS.md:702-703`, `:1045`).
2. **Pack ou asset no disco nunca é autorização** (`DECISIONS.md:1031`; matriz §19 item 2 —
   *"decisão que não pode ser reaberta"*).
3. **Cache de entitlement expirado após 7 dias resolve para o plano grátis**, sem tolerância
   adicional (`DECISIONS.md:881-882`, `:895-896`; `OFFLINE_MAX_WINDOW_MS`).
4. **Atividade iniciada com entitlement válido não é interrompida de forma destrutiva** no meio
   (`DECISIONS.md:886-887`).
5. **Nova entrada em conteúdo protegido exige autorização válida** — a tolerância vale para o que
   já estava em curso, não para o próximo acesso.
6. **Revalidação bem-sucedida restaura o acesso sem perda** — a obra premium *"reaparece e volta a
   ser editável"* (`DECISIONS.md:706`).

### 10.2 Efeito item a item

| # | Item | Efeito da perda do entitlement |
|---|---|---|
| 1 | **Histórias premium** | Voltam a **bloquear** na próxima entrada. Card, capa e selo permanecem visíveis. |
| 2 | **Cena narrativa em curso** | **Não é interrompida** no meio (invariante 4). Ao sair, a próxima entrada exige autorização. |
| 3 | **Atividade de Colorir em curso** | Idem: conclui e **salva** o que estava em andamento; não recomeça nem reabre depois. |
| 4 | **Pinturas premium já salvas** | **Nunca apagadas.** Arquivo e ponteiro preservados. A criança **não pode iniciar nem editar** aquela atividade; a obra **reaparece** quando o acesso retorna (`DECISIONS.md:702-706`). |
| 5 | **Progresso e conclusões de histórias premium** | **Preservados.** Conclusão registrada não é revogada. |
| 6 | **Estrelinhas e conquistas** | **Nunca revogadas.** Não são moeda de acesso. |
| 7 | **Criar Livre e Minhas artes** | Voltam à regra do grátis: desenha, **não salva** (`ATELIER_FREE_SAVE_LIMIT = 0`). Artes antigas **não são apagadas** (`E1-ARTES-SALVAR`). |
| 8 | **Rodadas de Brincar** | Voltam ao limite do grátis — **2 por dia, por criança** (`DECISIONS.md:61`). Nunca `Infinity` por erro (`P-56`). |
| 9 | **Avatares premium** | Voltam a bloquear. Avatar premium já **em uso** não deve sumir da criança sem aviso — tratar como estado visual da Fase 12A, nunca como apagamento. |
| 10 | **Packs no disco** | **Permanecem**, inertes. Não abrem, não são apagados automaticamente (`P-116`). Remoção **apenas** por ação do responsável na Área dos Pais. |
| 11 | **Superfície infantil** | Volta ao contrato da §8, sem qualquer mensagem de perda, expiração ou cobrança dirigida à criança. O aviso de estado comercial vai **só ao responsável**, na Área dos Pais (`DECISIONS.md:985`). |

### 10.3 Estado de revalidação pendente (lacuna de implementação, não de decisão)

Durante `needs_revalidation`, a política já resolve para **grátis** (`entitlementPolicy` regra 5).
O que **não** está escrito é a **tradução visual** desse estado. Proposta desta fase, coerente com
as invariantes: **a superfície infantil não distingue** *"nunca teve"* de *"precisa revalidar"* —
comporta-se exatamente como plano grátis. A distinção existe **apenas** na Área dos Pais, para o
responsável. Não vira pergunta.

### 10.4 Registro explícito — pergunta retirada

A pergunta *"a criança pode ver e reabrir a pintura que fez numa história premium depois de perder o
acesso?"* **estava na lista obrigatória do mandato como candidata**, mas **já tem decisão aprovada**
e portanto **não é feita**: `DECISIONS.md:704` (*"não poderá iniciar nem editar"*) e `:706`
(*"quando o acesso Família retornar, a obra reaparece e volta a ser editável"*). A leitura conjunta
é que, sem autorização, a obra premium **não está disponível à criança**, mas **está intacta no
disco**. `DECISIONS.md:709` fecha: *"a preservação dos dados não significa liberação do conteúdo
premium"*.

---

## 11. Conteúdo premium dentro do binário

> **Auditoria somente leitura.** Nenhum arquivo foi removido, movido ou alterado nesta fase.

### 11.1 As dez determinações

| # | Determinação | Resultado |
|---|---|---|
| 1 | Existe conteúdo premium fisicamente no binário? | **Sim.** |
| 2 | Qual o volume medido por `require()` estático? | **378 arquivos, 84.183.401 bytes (80,3 MB)** referentes às 18 premium (`D-4A-PAYLOAD-PREMIUM`; `P-136`). |
| 3 | Onde estão os `require()`? | **180 ilustrações** em `storySceneIllustrations.js:73-291`; **180 narrações** em `audioManifest.js:64-260`; **18 capas** em `storyCovers.js:17-34`. |
| 4 | Qual o total de assets amarrados por `require()` em `src/`? | **519 arquivos, 130.976.281 bytes (124,9 MB)** — inclui os genéricos (`P-135`). |
| 5 | Existe conteúdo premium **fora** do alcance dos `require()`? | **Sim — achado desta fase.** O **texto narrado integral** das 20 histórias vive em `src/data/stories.js` (238 KB) e os **18 quizzes premium** em `quizzes.js:36-238`. **Não passam por `require()` e entram no bundle assim mesmo.** |
| 6 | Existem imagens de colorir premium no disco? | **Não.** `assets/stories/*/coloring/` **só existe para `creation`** (3 PNG). Os campos `imagemColorir` das premium são `null`. |
| 7 | Existem packs remotos materializados no repositório? | **Não.** Nenhum pack está no repositório. |
| 8 | Existem fixtures ou diretórios de teste com conteúdo premium? | **Não.** Nenhum diretório de teste/fixture de conteúdo existe no repositório. |
| 9 | Existem assets pesados rastreados que **não** vão ao binário? | **Sim.** `assets/maps/backup_*` e `source_*` (~65 MB) são rastreados no Git e **excluídos do upload** por `.easignore:74-75`. Pesam no repositório, **não** no binário. |
| 10 | A presença física concede acesso? | **Não, em nenhuma hipótese.** `DECISIONS.md:1031` e matriz §19 item 2: *"pack no disco nunca é autorização"* — decisão **não reabrível**. |

### 11.2 Determinação de alcance proposta por esta fase

`D-4A-PAYLOAD-PREMIUM` autoriza permanecer no binário: *"metadados mínimos de vitrine, assets
genéricos compartilhados e fixtures internas comprovadamente excluídas ou inalcançáveis em
produção"*. A determinação desta fase — **sem reabrir a decisão** — é que:

- **Cabem** em *"metadados mínimos de vitrine"*: `id`, título, sinopse curta, capa, `accessType`,
  ordem na jornada e contagem de cenas. É o necessário para o card selado da §8.
- **Não cabem**: o **texto narrado integral** das cenas premium e o **conteúdo dos quizzes
  premium**. São conteúdo, não vitrine, e devem seguir o mesmo destino das cenas e da narração na
  Fase 16.
- **Consequência prática:** a remoção do premium do binário **não se resolve** eliminando
  `require()`. Exige também extrair conteúdo textual de `stories.js` e `quizzes.js`. **Isto amplia
  o escopo da Fase 16 e precisa constar do seu plano.**

> ✅ **APROVADA E AMPLIADA PELO FUNDADOR EM 2026-08-05 (correções obrigatórias nº 9 e nº 10).**
>
> **Nº 9 — alcance.** A evidência de `P-136` passa a alcançar **todo conteúdo premium incluído no
> pacote ou bundle**: imagens, áudios, **textos narrativos**, **quizzes** e outros dados — e não
> apenas o que passa por `require()`. O campo `evid` de `P-136` na matriz canônica foi ampliado de
> *"378 requires medidos em `015c438`"* para incluir o **texto narrado integral das 20 histórias**
> em `stories.js` e os **18 quizzes premium** em `quizzes.js:36-238`, embarcados **sem** `require()`.
>
> **Nº 10 — nenhum código `P` novo.** O fundador exigiu demonstrar que `P-136` já cobre o mesmo
> **fato**, a mesma **superfície** e a mesma **correção** antes de criar código novo. A demonstração
> está na **§25.3 da matriz canônica** (tabela de quatro eixos): fato idêntico (conteúdo premium
> fisicamente presente no aparelho de quem não pagou), superfície idêntica (binário do app),
> correção idêntica (extrair para pack na Fase 16); a **única** diferença é o mecanismo de
> empacotamento (`require()` estático × importação direta de módulo de dados), que não altera fato,
> superfície nem correção. **Conclusão: nenhum código `P` novo foi criado para textos narrativos e
> quizzes.** `P-136` permanece **não** corrigido — só a evidência foi ampliada.

### 11.3 O que esta fase não fez

Nada foi removido. `P-136`, `P-135`, `P-130`, `P-137` e `P-116` permanecem com o status registrado
na matriz canônica. A execução é da **Fase 16** (binário) e da **Fase 17** (packs).

---

## 12. Colorir com o Beni × Criar Livre — a distinção que não pode ser apagada

> Base: `D-C60-NOMEACAO-OBRAS` (*"Colorir com o Beni é **COLEÇÃO**; Criar Livre é **AUTORIA**"*),
> `D-C60-PERSISTENCIA-TODOS-PLANOS` §1 e a revogação cirúrgica de 2026-08-03
> (`DECISIONS.md:334-348`, `:681-698`).

### 12.1 Quadro da distinção

| Eixo | **Colorir com o Beni** (narrativo) | **Criar Livre** (autoria) |
|---|---|---|
| Natureza | **Coleção** — obra derivada de um lineart da história | **Autoria** — obra do zero |
| Vínculo | Preso ao arco narrativo (história + atividade) | Sem história |
| Nome da obra | **Sem nome** | **Com nome** |
| Quantidade | **Uma por atividade** | Ilimitada |
| **Autoridade de salvamento** | **ACESSO AO CONTEÚDO** — história e atividade acessíveis | **PLANO** |
| Salva no plano grátis? | **SIM**, nas histórias a que tem acesso | **NÃO** — `ATELIER_FREE_SAVE_LIMIT = 0` |
| Revisitação | **Sim** — rever e editar a obra real | Grátis: não há obra a rever |
| Código | `ColoringScreen.js:352` → `coloring60DrawingStorage.js:509` | `AtelierCanvasScreen.js:234` → `atelierStorage.js:89` |

### 12.2 As sete determinações

1. **A distinção é estrutural, não redacional.** É ela que torna a revogação de 2026-08-03
   *cirúrgica*. Qualquer texto que fale genericamente em *"salvar arte"* sem dizer **qual das duas
   experiências** é ambíguo e reproduz o conflito C1 (§3.2).
2. **A autoridade do Colorir narrativo é o ACESSO, nunca o plano.** `coloring60DrawingStorage.js:16-23`
   já implementa: *"quem tem acesso legítimo à história E à atividade salva a pintura narrativa
   localmente, em QUALQUER plano"*. Desfechos tipados: `SAVED`, `WRITE_FAILED`, `ACCESS_DENIED`,
   `AUTHORIZATION_NOT_READY`, `INVALID_STORY`, `INVALID_ACTIVITY`, `INVALID_AUTHORIZATION`.
3. **No plano grátis, a criança tem obra real.** Em A Criação, ela pinta, **salva** e **revisita** —
   uma obra por atividade, três atividades. **Isto não é concessão desta fase: é decisão vigente.**
4. **O salvamento do Criar Livre NÃO é ampliado.** `E1-PLANO-FREE`, `E1-ARTES-SALVAR` e o limite
   zero permanecem **integralmente vigentes** (`DECISIONS.md:690-692`). **Nenhuma linha deste
   documento amplia, flexibiliza ou cria exceção ao limite zero do Criar Livre.**
5. **A diferenciação comercial mudou de lugar, não desapareceu.** O Plano Família se diferencia pelo
   **acesso às histórias e experiências premium** — não pela retenção das pinturas das histórias
   gratuitas (`DECISIONS.md:677-679`).
6. **A conclusão do Colorir precisa ser registrada.** Hoje `markStoryColoringActivityDone`
   (`coloringActivityService.js:28`) **nunca é chamado**, e `@ptf_coloring_done` jamais é escrita,
   embora `ProgressContext.js:198` a leia. Sem isso não há revisitação (`P-18`), não há recompensa
   (`P-08`) e o marco **Criar** de `D-CONCLUSAO-TOTAL-B` não fecha. `P-50`.
7. **O alcance no v1 é a lacuna real.** A regra é geral; o catálogo não. `coloring60Catalog.js:64-66`
   traz **apenas `creation`**, com 3 atividades, e **Noé não possui lineart no disco** — enquanto a
   Spec 014 declara 6 páginas base (Criação 3 + Noé 3). Ver §15, Pergunta 4.
   > ✅ **RESOLVIDO EM 2026-08-05 — a determinação 7 fica assim atualizada.** O fundador decidiu a
   > **escala completa**: **vinte histórias × três atividades = sessenta**. Ver §12.3.

### 12.3 ✅ DECISÃO DO FUNDADOR — 2026-08-05 · escala e nomes oficiais

> Resposta à Pergunta 4. **Mais ampla que a recomendação técnica desta fase** (que era A ou B). A
> recomendação foi preservada sem reescrita na §15 para manter o registro auditável.

**Escala obrigatória do Colorir com o Beni:**

1. O lançamento entrega o **Colorir com o Beni padronizado nas vinte histórias**, com **três
   atividades narrativas por história**, totalizando **sessenta atividades**.
2. **A Criação** permanece como **piloto canônico**.
3. **Noé** é o **primeiro alvo de escala**, por ser a segunda história gratuita.
4. Cada história terá **três atividades vinculadas a marcos narrativos**.
5. As atividades respeitam **os mesmos contratos** técnicos, visuais, de persistência, conclusão e
   revisitação aprovados no piloto.
6. **Assets legados não são aceitos automaticamente como arte final.** Qualquer arte antiga
   candidata a reaproveitamento passa por **perícia técnica e aprovação visual**.
7. **Nenhuma história é considerada pronta para lançamento** sem o conjunto aprovado de atividades
   previsto para ela.
8. A escala é implementada na **Fase 8A** e nas fases de produção de conteúdo correspondentes.
9. **Nenhuma imagem foi produzida ou alterada nesta Fase 4B** — determinação expressa do fundador.

**Distância entre o decidido e o existente:** hoje há **1 história de 20** com o modelo novo
(**3 de 60** atividades). A decisão está **resolvida**; a implementação é **inteiramente futura**.

**Contrato de salvamento (confirmado e agora explícito):**

| Experiência | Plano grátis | Plano Família |
|---|---|---|
| **Criar Livre** | **Desenha, mas NÃO salva.** Sem galeria | **Salva** e acessa a galeria |
| **Colorir com o Beni** | **Salva uma obra real por atividade**, em **qualquer história acessível** | **Salva** em todas as histórias autorizadas |

- Nas **histórias gratuitas**, o Colorir com o Beni **funciona e salva integralmente offline**.
- Nas **histórias premium**, **exige autorização válida** para **iniciar ou reabrir**.
- Perdido o direito de acesso, a **pintura premium permanece preservada e não pode ser apagada**, e
  **volta a ficar acessível e editável quando a autorização retornar**.
- **A pintura, o asset ou o pack no disco nunca concede autorização** sobre a história premium.

**Nomes oficiais — encerramento de `D-CRIAR-COM-BENI-STATUS`:**

1. **Não existirá uma terceira experiência chamada "Criar com Beni".**
2. Os nomes oficiais são **`Criar Livre`** e **`Colorir com o Beni`**.
3. **"Criar Juntos" é chamada contextual** para o `Criar Livre`, **não** funcionalidade independente.

Registrado em `docs/DECISIONS.md` §`PL4B` · `D-4B-COLORIR-60-ESCALA`,
`D-4B-SALVAMENTO-DUAS-EXPERIENCIAS` e `D-4B-NOMES-OFICIAIS`.

### 12.4 Correções de copy que decorrem desta seção

`P-63` (*"N de 0 artes salvas"* + barra `NaN`), `P-64` (*"3 artes salvas"*), `P-65` (*"guarde suas
criações"*) e `P-52` (comentários que ainda afirmam em presente que o grátis não persiste). Todas
são **execução**, não decisão.

---

## 13. Implementação futura

| Fase | Escopo | Códigos |
|---|---|---|
| **7** | Desfecho neutro do Cantinho do Beni; fluxo de revisão de história concluída | `P-42` |
| **9** | Registro de conclusão do Colorir; revisitação da atividade; alcance do C60; comentários de política | `P-18`, `P-50`, `P-36`, `P-52` |
| **10** | Copy do Livrinho condicionada à existência do lineart | `P-37` |
| **11** | Filtro de acesso na Home e no CTA do Story Detail; contrato de recompensa | `P-05`, `P-22`, `P-08` |
| **12A** | Galeria e Criar Livre no grátis; *fail-closed* nas rodadas; voz comercial fora da a11y; rota inalcançável | `P-63`, `P-64`, `P-65`, `P-56`, `P-57`, `P-66`, `P-55` |
| **12B** | Cultinho — filtro de acesso e rotação | `P-54` |
| **16** | Remoção do premium do binário — **incluindo texto narrado e quizzes** (§11.2) | `P-136`, `P-135` |
| **17** | Packs: colorir por pack, marcador de versão, limpeza de órfãos, estado do Mapa | `P-130`, `P-137`, `P-116`, `P-26` |
| **18** | RevenueCat, caminho de compra, offline com cache expirado, migração de *schema* | `P-24`, `P-129`, `P-140` |

**Ordem sugerida:** 12A antes de tudo (contém o único `BLOQUEIA` de superfície infantil, `P-63`) →
9 e 11 (contrato de conteúdo e vitrine) → 16 e 17 (payload e packs) → 18 (comercial).

---

## 14. Validação futura

| # | O que provar | Como | Fase |
|---|---|---|---|
| 1 | Conta grátis com as 2 gratuitas concluídas: Home não fica vazia, não vira paywall, mostra revisitação e obras | Aparelho físico, print/vídeo | 21 |
| 2 | Toque em card premium produz **apenas** orientação neutra; nenhum preço, desconto ou botão de compra | Aparelho físico | 21 |
| 3 | Leitor de tela **não lê** oferta comercial em nenhuma superfície infantil (iOS e Android) | VoiceOver + TalkBack | 21 |
| 4 | Galeria em conta grátis limpa: sem *"N de 0"*, sem barra `NaN` | Aparelho físico | 21 |
| 5 | Criar Livre no grátis: desenha, avisa antes, **não salva**, não destrói o desenho | Aparelho físico | 21 |
| 6 | Colorir em A Criação no **plano grátis**: pinta, **salva**, sai, **reabre a mesma obra** | Aparelho físico | 21 |
| 7 | Conclusão do Colorir registra progresso, alimenta recompensa e fecha o marco **Criar** | Aparelho físico | 21 |
| 8 | Rodadas: limite real do grátis respeitado; falha de storage **não** libera rodada nem premium | Falha induzida | 18 / 21 |
| 9 | Offline com cache expirado > 7 dias resolve para grátis, sem interrupção destrutiva do que estava em curso | Aparelho físico, sem rede | 18 / 21 |
| 10 | Downgrade: pintura premium **preservada**, atividade **não editável**, obra **reaparece** ao revalidar | Aparelho físico | 18 / 21 |
| 11 | Pack premium no disco **sem** entitlement válido **não abre** | Aparelho físico | 17 / 21 |
| 12 | *Bump* de versão **não** invalida pack instalado | Instalar, subir versão, reabrir | 17 / 20 |
| 13 | História premium sem pack **não** exibe imagem local (prova da remoção do binário) | Build de *release* | 17 |
| 14 | Rota do Monte a Cena V2 **inalcançável** em build de *release* | Build de *release* | 19 / 21 |
| 15 | Restaurar compra existe na Área dos Pais e no paywall pós-gate; **nunca** na superfície infantil | Aparelho físico, iOS e Android | 18 / 21 |

> **`npm run smoke` e `npx expo-doctor` não substituem nenhuma linha desta tabela.** Toda a coluna
> "Como" depende de aparelho físico ou build real.

---

## 15. Perguntas ao fundador — ✅ **TODAS RESPONDIDAS EM 2026-08-05**

> **Quatro perguntas.** As demais candidatas da lista do mandato foram **retiradas por já terem
> decisão aprovada** — ver §15.5. Nenhuma resposta foi escolhida por este documento.
>
> ✅ **ESTADO: as quatro foram respondidas pelo fundador em 2026-08-05.** O enunciado, as
> alternativas e a **recomendação técnica original de cada pergunta permanecem sem reescrita** — o
> registro do que foi proposto e do que foi decidido precisa continuar auditável. A resposta vem
> **ao final de cada pergunta**, em bloco próprio.

| # | Pergunta | Recomendação técnica desta fase | **Decisão do fundador** | Coincidiu? |
|---|---|---|---|---|
| 1 | Degustação de história premium | **A** | **A — nenhuma degustação** (`D-4B-SEM-DEGUSTACAO`) | ✅ sim |
| 2 | Grau da prévia na Home e no Mapa | **B** (capa, título, selo, sinopse) | **Contrato de 6 itens permitidos e 12 proibidos** (`D-4B-PREVIA-EDITORIAL`) — inclui os 4 de B e acrescenta região no Mapa e estado visual protegido | ✅ compatível, e mais específica |
| 3 | Cultinho e Meu Momento | **A** (filtro estrito) | **A — filtro estrito** (`D-4B-FILTRO-RECOMENDACAO`), com sete regras | ✅ sim |
| 4 | Alcance do Colorir com o Beni | **B se houver janela de arte; A se não** | **Escala completa: 20 × 3 = 60** (`D-4B-COLORIR-60-ESCALA`) | ❌ **não** — a decisão é **mais ampla** que ambas as alternativas recomendadas |

### Pergunta 1 — Existe degustação de história premium?

**Contexto.** A auditoria (§7.1) provou que **não existe, em nenhum documento, decisão, proposta ou
histórico Git, qualquer previsão de acesso parcial a história premium**. `degusta*` tem **zero**
ocorrências no repositório e **zero** em todo o histórico. Davi e Golias é `premium` em 100% dos
registros, e **dois guardrails do `npm run smoke`** reprovam se isso mudar. O gate de acesso é
**binário e por história**: não existe mecanismo por cena em nenhum ponto do código.

**Alternativas.**

- **A — Nenhuma degustação.** Só as 2 gratuitas, completas. É o estado aprovado e implementado.
- **B — Davi e Golias com degustação fixa** até um marco (ex.: cena 03 ou primeiro Colorir).
- **C — Todas as 18 premium com prévia narrativa padronizada**, sem progresso nem atividade
  persistente.

**Recomendação técnica: A.** É a única que não reabre decisão aprovada, a única que não exige criar
um terceiro estado de autorização e a única compatível com `D-4A-PAYLOAD-PREMIUM` — que, sendo
recente e ainda não implementada, seria contrariada tanto por B quanto por C. Se o objetivo for
**prova de valor**, a amostra cabe na **Área dos Pais, depois do gate parental**, sem tocar a
superfície infantil.

**Consequências.** **A:** nada muda; `P-05` e `P-26` viram só filtro de acesso. **B:** novo eixo de
autorização por cena em 7 pontos de código; reabre `D-4A-PAYLOAD-PREMIUM` (a cena degustada precisa
existir antes da compra); colide com `D-CONCLUSAO-TOTAL-B` (progresso parcial numa história que não
conclui); dois guardrails do smoke precisam ser reescritos; e o gatilho de compra passa a ser **a
criança interrompida**, o que tensiona `DECISIONS.md:987-989`. **C:** tudo de B, multiplicado por 18
no payload, com menor impacto em progresso.

**Códigos afetados.** `P-05`, `P-26`, `P-130`, `P-135`, `P-136`, `P-137`.

**Altera decisão anterior?** **A:** não. **B e C:** **sim** — `D-4A-PAYLOAD-PREMIUM` e, em B,
`D-CONCLUSAO-TOTAL-B`.

*Se a resposta for B ou C:* qual é o **marco exato** do corte, e a cena degustada vem **do binário**
ou de **pack parcial baixável sem entitlement**? (A segunda alternativa colide com *"pack no disco
nunca é autorização"*.)

> ✅ **RESPOSTA DO FUNDADOR — 2026-08-05: OPÇÃO A.** Sem degustação por cena, atividade ou marco;
> A Criação e Noé são as duas gratuitas completas; Davi e Golias e as outras dezessete ficam
> **integralmente** protegidas; **a hipótese de degustação de Davi e Golias fica rejeitada para o
> lançamento**; **não haverá mecanismo de autorização por cena**; **pack no aparelho nunca é
> autorização**. A sub-pergunta condicional **não se aplica**. Texto integral em §7.6 · registro em
> `DECISIONS.md` §`PL4B` · `D-4B-SEM-DEGUSTACAO`.

---

### Pergunta 2 — Qual é o grau da prévia na Home, e o Mapa segue a mesma regra?

**Contexto.** `D-4A-HOME-GRATIS-ESGOTADA` autoriza que conteúdo protegido apareça como *"prévia
carinhosa"*, mas **não define o grau** e foi escrita **para a Home**. O Mapa hoje exibe o marco
premium alcançado como `nextLocked`, com **cadeado e pulso de convite**
(`AdventureMapScreen.js:318-329`) — comportamento que **nenhum documento árbitro autoriza nem
proíbe**. Nada é ocultado hoje em nenhuma das duas superfícies.

**Alternativas.**

- **A — Vitrine mínima:** capa, título e selo dourado "Plano Família". Nada mais.
- **B — Vitrine com sinopse:** capa, título, selo e a sinopse curta já existente.
- **C — Vitrine com amostra visual:** capa, título, selo, sinopse e **uma ilustração** da história.

**Recomendação técnica: B.** Dá contexto suficiente para o responsável entender o que está sendo
oferecido, sem colocar conteúdo narrativo diante da criança. **C** exige manter uma ilustração
premium no binário, o que reabre `D-4A-PAYLOAD-PREMIUM` por 18 arquivos.

**Consequências.** **A:** menor payload, menor apelo. **B:** payload praticamente igual ao de A (a
sinopse é texto curto de vitrine). **C:** +18 ilustrações no binário e discussão de payload.

**Sub-pergunta obrigatória.** O **Mapa** segue a mesma regra da Home? E o **pulso de convite** no
marco premium é aceitável, ou o marco deve ser estático?

**Códigos afetados.** `P-05`, `P-26`, `P-136`.

**Altera decisão anterior?** Não — **completa** `D-4A-HOME-GRATIS-ESGOTADA` e a **estende
formalmente** ao Mapa.

> ✅ **RESPOSTA DO FUNDADOR — 2026-08-05: contrato fechado de prévia editorial.** Home e Mapa
> aplicam **a mesma regra de acesso**, podendo usar **composições visuais diferentes** — o que
> **responde a sub-pergunta**. **Pode conter (6):** capa · título · sinopse curta · região ou posição
> no Mapa · selo neutro do Plano Família · estado visual protegido. **Não pode conter (12):** cena
> narrativa integral · áudio narrado · quiz · reflexão · Colorir · recompensa · progresso fabricado ·
> **preço** · **desconto** · **teste grátis** · **urgência** · **botão "Assine agora"**. Ao tocar, a
> criança recebe **orientação neutra para pedir ajuda a um adulto**; **o gate parental vem antes** de
> qualquer paywall, preço, oferta ou informação comercial; e **a proibição comercial alcança
> `accessibilityLabel`, leitor de tela, áudio e qualquer mensagem falada**.
> Texto integral em §7.7 · registro em `DECISIONS.md` §`PL4B` · `D-4B-PREVIA-EDITORIAL`.

> ⚠️ **DERIVAÇÃO DO AGENTE — NÃO É PALAVRA DO FUNDADOR · PENDENTE DE CONFIRMAÇÃO.** A sub-pergunta
> tinha **duas** partes. A primeira — *"o Mapa segue a mesma regra da Home?"* — foi respondida
> **literalmente** pelo fundador (sim, mesma regra de acesso, composições visuais podendo diferir).
> A segunda — *"o **pulso de convite** no marco premium é aceitável, ou o marco deve ser estático?"* —
> **não recebeu resposta literal**. A leitura abaixo é **derivação deste agente a partir do contrato
> da §7.7**, e **não** decisão registrada:
>
> - o pulso **caberia** no item permitido *"estado visual protegido"*, desde que **sem** qualquer
>   carga comercial e **sem** carga de urgência (urgência está entre os 12 proibidos);
> - portanto **não foi decidido** que o pulso está aprovado nem que o marco deve ser estático.
>
> **Consequência:** a Fase 11 **não pode** tratar o pulso como aprovado. Ou o fundador confirma esta
> leitura, ou a questão volta como decisão de produto antes da implementação. Registrado também em
> §16.2 entre os itens que **continuam em aberto**.

---

### Pergunta 3 — Cultinho em Casa e Meu Momento podem recomendar conteúdo protegido?

**Contexto.** `familyWorshipService.js:75-77` usa a **vitrine** como história da semana, **sem
filtro de plano**. Hoje o resultado é uma história gratuita **por acidente** da preferência em
`showcaseStory.js:18-19`, não por regra. Nenhum documento árbitro trata do Cultinho nem do Meu
Momento: `D-4A-HOME-GRATIS-ESGOTADA` é textualmente **da Home**.

**Alternativas.**

- **A — Filtro estrito:** Cultinho e Meu Momento recomendam **apenas** conteúdo acessível ao plano
  atual.
- **B — Mesma regra da Home:** podem recomendar conteúdo protegido como prévia, com orientação
  neutra ao toque.
- **C — Regra mista:** o **Cultinho** (momento em família, com adulto presente) pode recomendar
  protegido; o **Meu Momento** (criança sozinha) não.

**Recomendação técnica: A.** O Cultinho e o Meu Momento são **rituais de continuidade**: uma
recomendação que não abre quebra o ritual toda semana, ao contrário da Home, onde a vitrine é
navegação. **C** é defensável pelo argumento do adulto presente, mas depende de o Cultinho ser
sempre acompanhado, o que o produto não garante.

**Consequências.** **A:** família grátis vê sempre A Criação ou Noé — o que torna `P-02` (rotação)
mais urgente. **B:** consistência com a Home, ao custo de recomendação que não abre. **C:** duas
regras a manter e a validar.

**Códigos afetados.** `P-54`, `P-02`, `P-44`.

**Altera decisão anterior?** Não — preenche lacuna.

> ✅ **RESPOSTA DO FUNDADOR — 2026-08-05: OPÇÃO A, filtro estrito**, com sete regras:
> (1) no plano grátis, só podem recomendar **A Criação**, **Noé** e demais atividades gratuitas
> disponíveis; (2) no Plano Família, todas as histórias autorizadas; (3) **não devem recomendar
> conteúdo protegido para depois apresentar bloqueio ou paywall**; (4) perdido o direito de acesso,
> o conteúdo protegido **sai das recomendações na próxima atualização controlada**; (5) com **cache
> expirado e sem rede**, aplica-se o **plano grátis**; (6) não havendo conteúdo novo acessível,
> **recomendar revisitação de conteúdo gratuito**; (7) **nenhuma recomendação pode resultar em toque
> sem resposta**.
> **Consequência já prevista pela análise:** a família do plano grátis passa a receber sempre A
> Criação ou Noé, o que torna `P-02` (rotação editorial) **mais urgente** — e a regra 6 é
> exatamente a válvula para isso. Registro em `DECISIONS.md` §`PL4B` · `D-4B-FILTRO-RECOMENDACAO`.

---

### Pergunta 4 — O v1 entrega Colorir com o Beni além de A Criação?

**Contexto.** A regra de salvamento é **geral** e vale em qualquer plano com acesso legítimo
(`DECISIONS.md:661-665`). O **catálogo não é**: `coloring60Catalog.js:64-66` traz **apenas
`creation`**, com 3 atividades, e a auditoria física confirmou que **`assets/stories/*/coloring/` só
existe para `creation`** — **Noé não tem nenhum lineart no disco**. A Spec 014 declara 6 páginas
base (Criação 3 + Noé 3) + 54 remotas. Além disso, `packDownloadService.js:136,243` pedem apenas
`['scene']`: **colorir nunca chega por pack** (`P-130`).

**Alternativas.**

- **A — Só A Criação no v1.** Noé sai sem Colorir; a copy do Livrinho é condicionada à existência do
  lineart.
- **B — A Criação + Noé.** Exige **produzir 3 linearts de Noé** antes do lançamento.
- **C — A Criação + Noé + premium por pack.** Exige B, mais estender `requestedKinds` e produzir 54
  linearts premium.

**Recomendação técnica: B, se houver janela de produção de arte; A, se não houver.** As duas
gratuitas são a experiência completa do plano livre, e uma delas ficar sem a atividade **Criar** é
assimetria que a criança percebe. Mas B é **decisão de produção de assets**, não de código.

**Consequências.** **A:** `P-37` vira copy condicional; o marco **Criar** de `D-CONCLUSAO-TOTAL-B`
precisa de tratamento em Noé. **B:** 3 linearts a produzir; nenhuma mudança de arquitetura.
**C:** 54 linearts + mudança no `packDownloadService` + peso de pack; matéria da Fase 17.

**Códigos afetados.** `P-36`, `P-37`, `P-130`, `P-18`, `P-50`.

**Altera decisão anterior?** **A** contradiz a meta de 6 páginas base da Spec 014 e exigiria anotá-la.
**B** a cumpre. **C** a amplia.

> ✅ **RESPOSTA DO FUNDADOR — 2026-08-05: ESCALA COMPLETA — nenhuma das três alternativas.**
> **A recomendação técnica desta fase (B ou A) NÃO foi seguida**, e o texto acima fica preservado
> exatamente como estava para que isso permaneça auditável. O fundador determinou o **Colorir com o
> Beni padronizado nas vinte histórias, três atividades por história, sessenta atividades no total**;
> **A Criação** como piloto canônico; **Noé** como primeiro alvo de escala; **mesmos contratos** do
> piloto; **assets legados não aceitos automaticamente como arte final** (perícia técnica e aprovação
> visual obrigatórias); **nenhuma história pronta para lançamento sem seu conjunto aprovado de
> atividades**; implementação na **Fase 8A** e nas fases de produção de conteúdo correspondentes.
> **"Não produza ou altere imagens nesta Fase 4B"** — cumprido: nenhuma imagem foi produzida ou
> alterada.
> **Isto é uma ampliação material de escopo em relação à alternativa C**, que previa 54 linearts
> premium: a decisão alcança **57 atividades a produzir** (60 previstas − 3 existentes), sobre 19
> histórias. Texto integral em §12.3 · registro em `DECISIONS.md` §`PL4B` ·
> `D-4B-COLORIR-60-ESCALA`.

---

### 15.5 Perguntas retiradas por já terem decisão aprovada

> O mandato pedia que estas fossem incluídas **se pendentes**. **Não estão.** Perguntá-las violaria
> *"não pergunte novamente algo já aprovado"*.

| Candidata | Onde já está decidida |
|---|---|
| Identidade nominal das duas histórias gratuitas | `DECISIONS.md:53` — **A Criação** e **Noé**, nominalmente, no árbitro máximo. Confirmado por `MATRIZ_DE_ACESSO.md:14`, `08_MATRIZ_DE_CONTEUDO:237` e pelo código (`planConfig.js:83`). |
| Regra de acesso às pinturas premium após perda do entitlement | `DECISIONS.md:702-709` — preservadas, não editáveis, reaparecem ao retornar o acesso. Ver §10.4. |
| História em andamento quando o entitlement expira | `DECISIONS.md:886-887` — *"uma atividade iniciada enquanto o entitlement ainda era válido não é interrompida no meio"*. |
| Conflito entre acesso parcial e packs remotos | **Só existe se houver degustação.** Incorporado à Pergunta 1 como sub-pergunta condicional. |
| Duração da janela offline | `D-4A-JANELA-OFFLINE` — **7 dias**, congelada; a Fase 18 *valida*, não *redecide*. |
| Periodicidade e existência de teste grátis | `D-4A-PRODUTOS-E-PERIODICIDADE` — mensal e anual, somente. |

---

## 16. Critérios de saída da Fase 4B

A Fase 4B **só pode ser encerrada** quando **todos** os itens abaixo forem verdadeiros.
✅ **Verificação de 2026-08-05 — os dez estão atendidos:**

| # | Critério | Estado | Prova |
|---|---|---|---|
| 1 | As quatro perguntas respondidas pelo fundador, por escrito | ✅ | §15, tabela de respostas e os quatro blocos "RESPOSTA DO FUNDADOR" |
| 2 | Respostas incorporadas a este artefato, com data e autoria | ✅ | §7.6, §7.7, §12.3, §15 — todos datados 2026-08-05 |
| 3 | Decisões novas registradas em `docs/DECISIONS.md` com código `D-4B-…` | ✅ | §`PL4B`: `D-4B-CONTEUDO-GRATUITO-E-PREMIUM`, `D-4B-SEM-DEGUSTACAO`, `D-4B-PREVIA-EDITORIAL`, `D-4B-FILTRO-RECOMENDACAO`, `D-4B-COLORIR-60-ESCALA`, `D-4B-SALVAMENTO-DUAS-EXPERIENCIAS`, `D-4B-NOMES-OFICIAIS`, `D-4B-PAYLOAD-PREMIUM-NO-BINARIO` |
| 4 | Matriz canônica atualizada só quanto a estado de decisão, preservando S1, S2 e prova 6 | ✅ | 9 códigos tocados; provas do gerador verdes; §25 da matriz |
| 5 | Conflitos C1–C5 com destino declarado, respeitando o estatuto de cada arquivo | ✅ | C1 e C2 corrigidos em `MATRIZ_DE_ACESSO.md`; C1 anotado em `DECISOES_E_CONFLITOS.md`; C3 encerrado em `DECISIONS.md`; C4 corrigido no artefato 4A; C5 **preservado por determinação expressa** |
| 6 | Nenhuma célula `[?]` na matriz de acesso da §5 | ✅ | Zero células `[?]` na tabela da §5 (as ocorrências restantes do literal são **menções em prosa** afirmando justamente que não há células pendentes) |
| 7 | Contrato das superfícies infantis fechado, com as seis invariantes aceitas | ✅ | §8 + o contrato de prévia da §7.7, que fecha a última indefinição |
| 8 | Escopo ampliado da Fase 16 (texto narrado e quizzes premium) registrado | ✅ | `D-4B-PAYLOAD-PREMIUM-NO-BINARIO`; evidência e observação de `P-136` ampliadas; §25.3 da matriz |
| 9 | Nenhum código, asset, pack, manifesto ou `eas.json` alterado | ✅ | Diff executável vazio contra `015c438`; nenhuma imagem produzida ou alterada |
| 10 | Commit de encerramento exclusivamente documental, atômico, `git add` seletivo, sem push | ✅ | `docs(product-lock): consolidar acesso e conteudo infantil` |

Texto original dos critérios, preservado:

1. **As quatro perguntas da §15 estão respondidas pelo fundador**, por escrito, nesta sessão.
2. As respostas foram **incorporadas a este artefato**, com data e autoria.
3. As decisões novas foram **registradas em `docs/DECISIONS.md`** com código próprio
   (`D-4B-…`) — **depois** da aprovação, nunca antes.
4. A **matriz canônica** foi atualizada nos códigos afetados **somente** quanto a estado de decisão,
   preservando as provas S1, S2 e 6 do gerador determinístico.
5. Os **conflitos documentais C1 a C5** (§3.2) têm destino declarado: correção, anotação ou registro
   consciente — respeitando o estatuto de cada arquivo (normativo vigente se corrige; histórico se
   anota; evidência de validação física **não se toca**).
6. A **matriz de acesso da §5** não tem nenhuma célula `[?]` remanescente.
7. O **contrato das superfícies infantis (§8)** está fechado, com as seis invariantes comuns
   explicitamente aceitas.
8. O escopo ampliado da **Fase 16** (§11.2 — texto narrado e quizzes premium) está registrado no
   plano dessa fase.
9. **Nenhum código, asset, pack, manifesto ou `eas.json` foi alterado** durante a fase.
10. O commit de encerramento é **exclusivamente documental**, atômico, com `git add` seletivo
    caminho a caminho, e **sem push**.

### 16.1 O que esta fase entregou e o que deixou explicitamente em aberto

**Entregue:** escopo de 26 códigos com ficha decisória completa (§2); auditoria dos 20 pontos nos
documentos árbitros com classificação e citação (§3); cinco conflitos documentais registrados
(§3.2); matriz canônica de acesso por conteúdo (§5); contrato das histórias gratuitas (§6);
auditoria integral da hipótese de degustação com três alternativas analisadas (§7); contrato das dez
superfícies infantis (§8); contrato da Home e do Mapa no grátis esgotado (§9); efeito da perda do
entitlement item a item, com seis invariantes (§10); auditoria somente-leitura do premium no binário
(§11); distinção Colorir × Criar Livre com sete determinações (§12); plano de implementação e de
validação futura (§13, §14).

**Em aberto, por decisão consciente:** as **quatro perguntas da §15**. Nenhuma delas foi respondida
por este documento.

### 16.2 ✅ Encerramento da Fase 4B — 2026-08-05

**As quatro perguntas foram respondidas pelo fundador** e a §16.1 fica assim atualizada: o que
estava "em aberto por decisão consciente" **está fechado**. A fase entrega, além do que a §16.1 já
listava, **oito decisões nomeadas** em `DECISIONS.md` §`PL4B`, a **matriz canônica sem células
`[?]`**, a **atualização de nove códigos `P`** sem nenhum passar a `CORRIGIDO` e sem nenhum código
novo, e a **§25 da matriz canônica** registrando o que mudou e por quê.

**Continua explicitamente em aberto, por determinação do fundador:**

1. **Rodadas diárias — "por criança" × "por dispositivo/jogo".** Conflito **preservado e não
   resolvido**; pertence ao bloco decisório do Brincar. Ambos os textos foram **anotados**, nenhum
   foi alterado.
2. **`P-37` — a *copy* do Livrinho.** A escala do Colorir muda a **premissa** (a pintura passará a
   existir em toda história), mas a escolha entre **mudar a copy** e **devolver a capacidade**
   **não foi decidida** e o código segue `EXIGE DECISÃO NO PRODUCT LOCK`.
3. **Fluxo de revisão de história concluída** — permanece na **Fase 7**.
4. **Preço nominal em reais** — pendência comercial herdada da Fase 4A, intocada.
5. **O *pulso de convite* no marco premium do Mapa** (`AdventureMapScreen.js:318-329`). A
   sub-pergunta da §15/P2 tinha duas partes; a parte do Mapa foi respondida, **a do pulso não
   recebeu resposta literal**. A leitura de que ele caberia em *"estado visual protegido"* é
   **derivação deste agente**, sinalizada como tal na §15/P2, e **não** vale como decisão. A Fase 11
   não pode tratá-lo como aprovado.

**O que esta fase NÃO fez:** não alterou código, *asset*, *pack*, manifesto ou `eas.json`; **não
produziu nem alterou nenhuma imagem**; não gerou *build*; não abriu Metro; não executou validação
física; não fez *push* nem *merge*; **não revogou nenhuma decisão da Fase 4A**; não marcou nenhum
risco como corrigido; não criou nenhum código `P`.

---

> ~~**Fim do artefato preliminar. A Fase 4B permanece ABERTA, aguardando o fundador.**~~
>
> ✅ **SUPERADO EM 2026-08-05.** As quatro perguntas foram respondidas. **Fim do artefato
> consolidado — a Fase 4B está ENCERRADA quanto às decisões de produto.** As implementações e
> validações listadas na §13, na §14 e na §16.2 **continuam pendentes** e não foram executadas aqui.
