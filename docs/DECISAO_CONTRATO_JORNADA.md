# Decisão — Contrato da Jornada (A0.10)

**Status:** aprovado pelo fundador (bloco A0.10). **Escopo:** status/progressão de
história (mapa, card, StoryDetail, estante, Área dos Pais). **Fonte única de código:**
`src/services/storyJourneyService.js` (`getStoryJourneyStatus`), exposto pelo
`ProgressContext` (`isStoryJourneyComplete`, `isStorySequenceUnlocked`,
`getStoryContractStatus`).

> **Emenda da Fase 4C — Product Lock de jornada, progressão, conclusão e desbloqueios
> (2026-08-05).** O fundador aprovou a **fórmula canônica de conclusão** e ela está
> incorporada abaixo. Três pontos deste documento foram **corrigidos**, não anotados,
> porque este é um documento **normativo vigente**:
>
> 1. O **Livrinho saiu** da fórmula obrigatória de `journeyComplete` (regra 8 e §Definições).
>    Fica formalmente registrada como **superada** a parcela do bloco A0.10 que incluía
>    `bookOpened` na fórmula.
> 2. Nenhuma regra depende de **quantidade fixa** de cenas: vale sempre **todas as cenas
>    declaradas** da história (regra 2).
> 3. O Colorir com o Beni é exigência **condicional permanente** (regra 5) — emenda `P3J`
>    ratificada.
>
> O texto original destes três pontos permanece recuperável no histórico do Git. Nenhuma
> outra regra deste bloco foi revogada, afrouxada ou reaberta. Detalhamento completo em
> `docs/fase4-product-lock/03_PRODUCT_LOCK_4C_JORNADA_PROGRESSAO_CONCLUSAO_E_DESBLOQUEIOS.md`.

## Regras oficiais

1. **"Concluída" = jornada completa** — nunca por cenas. Uma superfície do app só
   pode chamar uma história de "Concluída" quando `journeyComplete` for verdadeiro.
2. **Cenas completas NÃO liberam a próxima aventura.** Ter visto **todas as cenas
   declaradas** da história é apenas **progresso narrativo** (`scenesComplete`), exibido
   como progresso — nunca como conclusão. **Nenhuma regra canônica depende de uma
   quantidade fixa de cenas** (em particular, nunca do literal `10`): vale sempre o total
   declarado pela própria história.
3. **O mapa avança por `journeyComplete`**, não por cenas: reveal, região acordando,
   pulso, câmera, `nextJourney` e "Próxima aventura" seguem a jornada, não as cenas.
4. **Próxima aventura depende da anterior `journeyComplete`.** `sequenceUnlocked` =
   1ª história sempre liberada; demais só quando a **anterior** (ordem oficial do
   mapa) estiver `journeyComplete`.
5. **Colorir obrigatório é CONDICIONAL (permanente).** Quando o Colorir com o Beni
   estiver **disponível** para a história, concluir **pelo menos UMA** das atividades é
   requisito de conclusão. Quando **não** estiver disponível, a ausência **nunca** bloqueia
   a jornada. Concluir **as três** atividades é **conclusão da coleção**, nunca requisito de
   desbloqueio. Com a escala completa (60 atividades / 20 histórias), o resultado natural é
   **uma atividade obrigatória em cada história**.
6. **Colorir concluído NÃO depende de salvar arte na galeria premium.** É uma camada
   semântica de atividade (`@ptf_coloring_done_{storyId}_{sceneId}`, booleano leve),
   registrada ao tocar "Pronto" — o Free conclui o colorir das histórias grátis
   mesmo que, no futuro, salvar arte na galeria seja bloqueado.
7. **Acesso comercial é SEPARADO da progressão da jornada.** `access` (free /
   premium / comingSoon / premiumLocked / blocked) vem de `contentAccessService`
   (não reescrito). A jornada (`sequenceUnlocked` / `journeyComplete`) é outro eixo.
8. **O Livrinho NÃO é requisito de conclusão nem de desbloqueio.** Ele permanece como
   **experiência própria, revisável e recompensável**, com **dois estados distintos**:
   *iniciado/aberto* e *concluído* (ao alcançar a última página). **Abrir não equivale a
   concluir.** A conclusão do Livrinho pode conceder **recompensa própria uma única vez**,
   mas não compõe a conclusão obrigatória da história.
9. **Conclusão só é declarada após persistência confirmada.** Nenhuma superfície anuncia
   conclusão, desbloqueio ou recompensa antes de a escrita ser confirmada. Em falha, a
   criança recebe aviso afetivo e nova tentativa — **nunca** recompensa, rodada, *premium*
   ou desbloqueio como alternativa.
10. **Nenhuma superfície recalcula sua própria versão da conclusão.** O contrato deste
    documento é a **autoridade única**; Home, Mapa e demais telas consomem a **mesma
    leitura persistida**.

## Definições

- `scenesComplete` = **todas as cenas declaradas** da história foram vistas
  (`total > 0 && done >= total`) — nunca um número fixo.
- `coloringRequired` = o Colorir com o Beni está **disponível** para esta história.
- `journeyComplete` = `scenesComplete && quizDone && reflectionDone && (!coloringRequired || coloringComplete)`,
  **com persistência confirmada**.
  > **Corrigido na Fase 4C:** `bookOpened` **não** integra mais esta fórmula. Registros
  > antigos de `@ptf_storybook_opened_{id}` **não** são apagados e **não** causam regressão
  > de progresso.
- `bookOpened` = Livrinho **iniciado/aberto** (marco próprio, fora da fórmula).
- `bookCompleted` = Livrinho **concluído** ao alcançar a última página (marco próprio, com
  recompensa única, fora da fórmula).
- `coloringComplete` = ≥ 1 atividade de colorir concluída na história (chave nova
  `@ptf_coloring_done_*` **ou**, compat, desenho salvo `@ptf_drawing_s*` com tinta real).
- `sequenceUnlocked` = 1ª história `true`; demais = `previous.journeyComplete`.
- `canOpen` = `sequenceUnlocked && acesso comercial permitido && mídia pronta`.
- `canShowAsNext` = `sequenceUnlocked && !journeyComplete && acesso permitido`.

## Hierarquia de status (mapa/card)

`comingSoon` > **`journeyLocked`** > `premiumLocked` > `locked` > `journeyComplete` >
`scenesComplete` > `inProgress` > `notStarted`.

`journeyLocked` vem **antes** de `premiumLocked`: se a jornada ainda não chegou numa
história premium, mostrar "Complete a aventura anterior" — **nunca** "Plano Família"
como ação principal. "Plano Família" só aparece quando a sequência **alcança** a
história premium e o usuário é Free.

## Ordem oficial

Reaproveita a ordem já existente do mapa (`getOrderedAdventureStories` →
`adventureMap`/`stories.trackId+order`). A Criação → Noé → Davi e Golias → … Nenhuma
ordem manual duplicada foi criada.

**Fase 4C:** a **única** ordem oficial da jornada é a **ordem do Mapa de Aventuras**. A
**ordem cronológica bíblica não faz parte do produto de lançamento**: `chronologicalOrder`
e `getStoriesInChronologicalOrder()` **não orientam nenhuma superfície** no lançamento. Uma
futura trilha cronológica poderá ser avaliada **depois** do lançamento.

## Retomada e revisitação (Fase 4C)

- **A história retoma por cena.** O lançamento **não** persiste posição exata de áudio,
  rolagem ou palavra. Na revisitação voluntária, o fluxo futuro poderá permitir começar
  novamente ou selecionar uma cena.
- **A grande celebração acontece apenas na primeira conclusão.** Revisitação, reabertura da
  conclusão, edição de pintura e atualização de atividade já concluída usam **modo sóbrio**:
  sem confete completo, sem animação principal de conquista e **sem nova recompensa**, com
  confirmação afetiva discreta, preservando a primeira conclusão.
- **História já concluída permanece concluída.** Conteúdo novo entra como conteúdo **a
  explorar**, nunca como pendência retroativa: não retranca a próxima história, não retira
  recompensa e não repete automaticamente a grande celebração.
- **Ordem canônica dos destinos após a conclusão:** próxima aventura (quando existir e
  estiver autorizada) → Mapa de Aventuras → revisitar esta história → ir ao Brincar → ir ao
  Início. Baú, Estrelinhas, obras e demais recompensas são **elementos secundários**, nunca
  ações concorrentes da ação principal. Sem próxima história disponível — e também em
  revisitação — o **Mapa** assume a ação principal.

## Chaves de storage (invioláveis — não renomear/apagar)

`@ptf_progress_{id}` · `@ptf_quiz_done_{id}` · `@ptf_reflection_{id}` ·
`@ptf_storybook_opened_{id}` · `@ptf_drawing_s{id}_c{scene}` · `@ptf_bonus_stars`.
A chave nova `@ptf_coloring_done_{id}_{scene}` é **aditiva** e compatível com os
desenhos já salvos.

## Fora do escopo deste bloco

RevenueCat, R2, WebP, packs remotos, Brincar, áudio, vozes, EAS, backend, login,
analytics, notificações, novas permissões, rotas principais, bundle/package/slug/scheme.
