# Decisão — Contrato da Jornada (A0.10)

**Status:** aprovado pelo fundador (bloco A0.10). **Escopo:** status/progressão de
história (mapa, card, StoryDetail, estante, Área dos Pais). **Fonte única de código:**
`src/services/storyJourneyService.js` (`getStoryJourneyStatus`), exposto pelo
`ProgressContext` (`isStoryJourneyComplete`, `isStorySequenceUnlocked`,
`getStoryContractStatus`).

## Regras oficiais

1. **"Concluída" = jornada completa** — nunca por cenas. Uma superfície do app só
   pode chamar uma história de "Concluída" quando `journeyComplete` for verdadeiro.
2. **Cenas completas NÃO liberam a próxima aventura.** "10/10 cenas" é apenas
   **progresso narrativo** (`scenesComplete`), exibido como progresso — nunca como
   conclusão.
3. **O mapa avança por `journeyComplete`**, não por cenas: reveal, região acordando,
   pulso, câmera, `nextJourney` e "Próxima aventura" seguem a jornada, não as cenas.
4. **Próxima aventura depende da anterior `journeyComplete`.** `sequenceUnlocked` =
   1ª história sempre liberada; demais só quando a **anterior** (ordem oficial do
   mapa) estiver `journeyComplete`.
5. **Colorir obrigatório = pelo menos UMA página de colorir concluída por história.**
6. **Colorir concluído NÃO depende de salvar arte na galeria premium.** É uma camada
   semântica de atividade (`@ptf_coloring_done_{storyId}_{sceneId}`, booleano leve),
   registrada ao tocar "Pronto" — o Free conclui o colorir das histórias grátis
   mesmo que, no futuro, salvar arte na galeria seja bloqueado.
7. **Acesso comercial é SEPARADO da progressão da jornada.** `access` (free /
   premium / comingSoon / premiumLocked / blocked) vem de `contentAccessService`
   (não reescrito). A jornada (`sequenceUnlocked` / `journeyComplete`) é outro eixo.

## Definições

- `scenesComplete` = todas as cenas vistas.
- `journeyComplete` = `scenesComplete && bookOpened && quizDone && reflectionDone && coloringComplete`.
- `coloringComplete` = ≥ 1 página de colorir concluída na história (chave nova
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

## Chaves de storage (invioláveis — não renomear/apagar)

`@ptf_progress_{id}` · `@ptf_quiz_done_{id}` · `@ptf_reflection_{id}` ·
`@ptf_storybook_opened_{id}` · `@ptf_drawing_s{id}_c{scene}` · `@ptf_bonus_stars`.
A chave nova `@ptf_coloring_done_{id}_{scene}` é **aditiva** e compatível com os
desenhos já salvos.

## Fora do escopo deste bloco

RevenueCat, R2, WebP, packs remotos, Brincar, áudio, vozes, EAS, backend, login,
analytics, notificações, novas permissões, rotas principais, bundle/package/slug/scheme.
