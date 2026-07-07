# Tasks — Bloco 2 · Fase 2B.6 · Política de acesso e download premium

> **Etapa SDD 5.** Micro-tasks atômicas. Implementação **só após o Portão 3**.
> **Arquivos:** StoryDetailScreen, NarrationScreen, ColoringScreen, StoryBookScreen, accessControl, smoke.js. **ProgressContext NÃO muda.** Resolver INTOCADO.
> **Guardas:** sem RevenueCat, sem 2C, sem `app.json`/patterns/requires/assets, sem `git add`/commit/push.

## Grupo A — RP1: download gated por progressão (StoryDetail)
- **A1** — Computar `canDownload = canAccess && packDownload.isRemote && !isComingSoon && sequenceUnlocked` e condicionar o bloco de download a `canDownload` (hoje: `canAccess && packDownload.isRemote && !isComingSoon`). Comentário: `sequenceUnlocked` = história **atual OU concluída** (exclui futuras bloqueadas). *Aceite:* futura bloqueada → sem botão; atual/concluída premium → botão.

## Grupo B — RP3: guard `canAccess` antes de navegar (StoryDetail)
- **B1** — Helper local `goToPremium(routeName, params)`: `if (!canAccess) navigation.navigate('ParentArea'); else navigation.navigate(routeName, params)`.
- **B2** — `handlePrimary`: usar `goToPremium('Narration', …)` no ramo **`isCompleted`** (:160-162) **e** no ramo normal (:168). Remove a dependência exclusiva do guard da tela seguinte.
- **B3** — Aplicar `goToPremium` nos `navigate` premium restantes: card Livrinho → `StoryBook` (:287), card Colorir → `Narration` (:314), lista de cenas → `Narration` (:331). *Aceite:* nenhum `navigate` premium sem `goToPremium`. (Quiz→`hasQuizAccess`; Reflection grátis — fora.)

## Grupo C — RP3: rechecagem em foco + parada de mídia
- **C1 — Narration** — `useFocusEffect` revalida `canOpenStoryFullExperience(story)`; inválido → `getStoryLockReason==='premium'` ? `replace('ParentArea')` : voltar. O `replace`/`goBack` desmonta a tela → `AudioPlayer` **pausa no cleanup** (`:116`). Consolida o guard de mount (roda também no 1º foco). *Aceite:* perder premium com áudio tocando → sai e **áudio para**.
- **C2 — Coloring** — `useFocusEffect` revalida (mantendo `qaBypass`); inválido → `replace('ParentArea')`. Sem áudio → basta sair seguro.
- **C3 — StoryBook** — `useFocusEffect` revalida acesso; inválido → **`setIsPaused(true)` + `setScreenState('locked')`** (pausa imediata via prop `paused` + desmonta `AudioPlayer` `:1227`). **Co-existir** com o `useFocusEffect` de refresh de desenhos (LIVRINHO_UX_1) **sem** quebrar autoplay/refresh; revalidar acesso **antes** do refresh. *Aceite:* perder premium no Livrinho com autoplay → estado `locked` e **áudio para**.

## Grupo D — RP4: contrato de assinatura (accessControl, só documentação)
- **D1** — Comentário/JSDoc em `getCurrentPlan`/`isPremiumUser`: futura integração reflete **active vs expired/cancelled**; entitlement offline com **`expiresAt`**; validade vencida → `'free'` (bloqueia premium mesmo offline). **Zero código funcional. Zero RevenueCat.**

## Grupo E — Smoke (checks RP1–RP7)
- **E1** — 1) download por `sequenceUnlocked` (atual/concluída, não futura); 2) todo `navigate` premium do StoryDetail via `goToPremium` (incl. `isCompleted`); 3) `useFocusEffect` revalida nas 3 telas; 4) parada de mídia (StoryBook `setIsPaused`+`locked`; Narration/Coloring `replace`); 5) `contentResolver.decide` sem entitlement; 6) contrato RP4 em `accessControl`; 7) starter livre/sem download.

## Grupo F — Gates + device + relatório
- **F1** — `npm run smoke` verde + `npx expo-doctor` 18/18; confirmar resolver/`app.json`/patterns/requires/assets intocados.
- **F2** — Device: Modo Criador on → baixar a **atual** → confirmar **futura bloqueada sem download** → desligar Modo Criador → avião → abrir baixada → **bloqueio premium** em Narração/Colorir/Livrinho, **áudio para** → Creation/Noah seguem livres.
- **F3** — Relatório PT-BR com os 15 critérios. **Sem** `git add`/commit/push sem aprovação.

## Rastreabilidade (RP → Task → critério)
RP1→A1 (crit. 1-3); RP2→resolver intocado (crit. 9); RP3→B1-B3+C1-C3 (crit. 4-8); RP4→D1 (contrato); RP5→starter (crit. 10); RP6→sem mudança; Smoke→E1 (crit. 11-12); Device→F2 (crit. 13); RevenueCat/2C→intocados (crit. 14-15).
