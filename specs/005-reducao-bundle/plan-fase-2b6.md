# Plan — Bloco 2 · Fase 2B.6 · Política de acesso e download premium

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.6 · **Etapa SDD:** 4 (Plan) · **Portão Humano 2: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `77be545` · Spec: [spec-fase-2b6.md](./spec-fase-2b6.md) · Clarify: [clarify-fase-2b6.md](./clarify-fase-2b6.md).
> **PARA no Plan.** Nenhum código antes do Portão 2/3. Sem RevenueCat, sem 2C, sem `git`.

## Abordagem
Mudanças **cirúrgicas** em telas + ProgressContext + um contrato documentado em `accessControl`. **Resolver INTOCADO** (permanece agnóstico). Áreas sensíveis (LIVRINHO_FIX/UX, máquina de estados do StoryBook) preservadas. Sem dependência nova.

### Arquivos que serão tocados (na implementação, após Portão 3)
1. `src/screens/StoryDetailScreen.js` — gate de download por `sequenceUnlocked` + guard `canAccess` antes de navegar.
2. `src/screens/NarrationScreen.js`, `ColoringScreen.js`, `StoryBookScreen.js` — rechecagem de acesso **em foco** + **parada de mídia**.
3. `src/services/accessControl.js` — **contrato** RP4 (comentário/JSDoc; zero comportamento).
4. `scripts/smoke.js` — checks RP1–RP7.
- **`ProgressContext.js` NÃO muda** (ajuste 1 usa `sequenceUnlocked` já disponível na tela).

---

## RP1 — Download gated por progressão (atual OU concluída) · ajuste Portão 2
**Política:** pode baixar premium remote se `premium active + remote + !coming_soon + (história ATUAL da jornada OU já CONCLUÍDA)`. Só as **futuras bloqueadas** ficam sem download — para não punir quem já avançou e quer rebaixar/revisitar.
- **Equivalência (chave da simplificação):** numa jornada linear, "atual OU concluída, exceto futuras" **é exatamente `sequenceUnlocked`**. A anterior está `journeyComplete` só para as **concluídas** + a **atual**; para as **futuras bloqueadas** é falso. Prova em [clarify-fase-2b6.md](./clarify-fase-2b6.md) C1.
- **StoryDetail (mínimo, sem novo método):** `sequenceUnlocked` **já existe** na tela (`isStorySequenceUnlocked(story.id)`). Gate:
  ```js
  // sequenceUnlocked = história atual da jornada OU já concluída (exclui futuras bloqueadas)
  const canDownload = canAccess && packDownload.isRemote && !isComingSoon && sequenceUnlocked;
  ```
  O bloco de download passa a ser condicionado a **`canDownload`**. **Dispensa `getCurrentJourneyStoryId`** → **ProgressContext NÃO muda** (menos superfície, menos risco).
- **Efeito:** futura bloqueada → **sem** download; atual → download; **concluída → download** (rebaixar/revisitar). Starter (creation/noah) nunca (não é remote). Pack no disco **não** libera abertura (RP2/RP3).

## RP2 — Pack ≠ acesso
Nenhuma mudança no `contentResolver` — segue decidindo só a FONTE. O gate de abertura continua entitlement-based nas telas (RP3).

## RP3 — Abertura checa assinatura ativa (firme) + parada de mídia · ajuste Portão 2
- **StoryDetail — guard antes de navegar.** Helper local:
  ```js
  function goToPremium(routeName, params) {
    if (!canAccess) { navigation.navigate('ParentArea'); return; }
    navigation.navigate(routeName, params);
  }
  ```
  Aplicar em **todos** os `navigate` premium: `handlePrimary` (ramo `isCompleted` **e** normal); cards da seção concluída → StoryBook (:287) e Narração (:314); lista de cenas (:331). (Quiz usa `hasQuizAccess`; Reflection é grátis — fora do guard premium.)
- **Rechecagem em foco + PARADA DE MÍDIA (obrigatório).** `useFocusEffect` revalida `canOpenStoryFullExperience`; se inválido, **bloqueia E interrompe qualquer mídia premium em andamento**:
  - **Narration:** `replace('ParentArea')` → a tela desmonta → o `AudioPlayer` **pausa no cleanup** (`player.pause()`, [AudioPlayer.js:116-117](../../src/components/AudioPlayer.js#L116)) → áudio para.
  - **StoryBook:** `setIsPaused(true)` (pausa imediata via prop `paused` — mecanismo existente `:587`) **+** `setScreenState('locked')` (remove o `AudioPlayer` do render `:1227` → `player.pause()` no unmount). Dupla garantia porque `locked` é estado interno (não navega).
  - **Coloring:** sem áudio → `replace('ParentArea')` (bloqueia e sai seguro).
  - Preserva LIVRINHO_FIX/UX: reusa `isPaused`/`screenState` existentes; **não** altera autoplay nem o `useFocusEffect` de refresh de desenhos. **Nunca** pode haver tela bloqueada com áudio premium ainda tocando.

## RP4 — Contrato de assinatura expirada (documentar, não implementar)
Bloco de comentário/JSDoc em `accessControl.getCurrentPlan`/`isPremiumUser` registrando o contrato: a futura integração de compra deve (a) refletir **active vs expired/cancelled** em `getCurrentPlan()`; (b) persistir entitlement com **validade offline (`expiresAt`)** — se a validade local passou, `getCurrentPlan()` retorna `'free'` (bloqueia premium **mesmo offline**). **Zero código funcional / zero RevenueCat** nesta fase.

## RP5 — Creation/Noah livres e offline
Sem mudança. `starter` → `hasStoryAccess` free → sempre. Smoke reforça (starter nunca gated por download nem por premium).

## RP6 — Retenção do pack
Sem mudança de comportamento (pack permanece no disco ao perder premium; abertura bloqueada por RP2/RP3). Trilha futura opcional (limpeza/limite/botão) apenas **registrada** na spec.

## Smoke (checks RP1–RP7)
1. StoryDetail: bloco de download condicionado a **`sequenceUnlocked`** (atual OU concluída), não só `canAccess && isRemote`; **não** restrito só à atual (concluída também pode baixar).
2. StoryDetail: **nenhum** `navigate('Narration'|'StoryBook'|'Coloring')` sem passar por `goToPremium` (guard `canAccess`), inclusive na seção `isCompleted`.
3. Narration/Coloring/StoryBook: `useFocusEffect` revalida `canOpenStoryFullExperience` (rechecagem em foco).
4. **Parada de mídia ao bloquear em foco:** StoryBook `setIsPaused(true)` + `setScreenState('locked')`; Narration/Coloring `replace('ParentArea')` (desmonta → `AudioPlayer` pausa).
5. `contentResolver.decide` permanece **sem** `isPremiumUser`/entitlement (agnóstico).
6. `accessControl` contém o **contrato RP4** documentado (comentário `expiresAt`/expired).
7. Starter (creation/noah): free, sempre abre, nunca mostra download.

## Device (RP-validação)
Baixar a história premium **atual** com Modo Criador on → confirmar que **história futura bloqueada não mostra download** → desligar Modo Criador → modo avião → abrir a baixada → **bloqueio premium** (ParentArea/locked) em Narração/Colorir/Livrinho → Creation/Noah seguem abrindo.

## Tasks (após Portão 3)
- **T1** — StoryDetail: gate `canDownload = canAccess && isRemote && !isComingSoon && sequenceUnlocked` (RP1; **sem** novo método no ProgressContext).
- **T2** — StoryDetail: helper `goToPremium` + aplicar em todos os `navigate` premium (RP3, incl. `isCompleted`).
- **T3** — Narration/Coloring/StoryBook: `useFocusEffect` de revalidação **+ parada de mídia** (RP3), preservando LIVRINHO_FIX/UX.
- **T4** — accessControl: contrato RP4 (comentário/JSDoc).
- **T5** — smoke: checks 1–7.
- **T6** — gates (`smoke`/`doctor`) + device + relatório PT-BR.

## Paradas obrigatórias
Não iniciar 2C · não `app.json`/`assetBundlePatterns`/requires/assets · não RevenueCat · não reescrever o resolver · não apagar packs · não `git add`/commit/push sem aprovação · **PARAR no Plan** (código só após Portão 3).

## Analyze (consistência spec↔plan)
RP1→T1 (gate por `sequenceUnlocked` = atual OU concluída, exclui futura); RP2→resolver intocado; RP3→T2/T3 (guard + foco + parada de mídia); RP4→T4 (contrato); RP5→starter; RP6→sem mudança; risco R2→registrado. Os **15 critérios de aceite** têm task/checagem. Áreas sensíveis (LIVRINHO_FIX/UX, resolver, ProgressContext) preservadas. **Risco:** baixo-médio (telas premium + progressão + áudio) → device obrigatório. **CONSISTENTE.**
