# Tasks — Bloco 2 · Fase 2B.7.3a · Progresso visual em premium bloqueada

> **Etapa SDD 5.** Micro-tasks atômicas. Implementação **só após o Portão 3**.
> **Arquivos:** `storyJourneyService.js` (+função pura), `StoryDetailScreen.js` (delega), `scripts/smoke.js`. **`SceneListItem` NÃO** (aprovado: sem indicador extra). **Sem** entitlement/accessControl/App.js/packs/2C.

## Grupo A — função pura em `storyJourneyService`
- **A1** — Adicionar `export function sceneVisualStatus({ isComingSoon, isDone, canAccess, isCurrent })` — **puro** (sem I/O/React/storage/imports; nunca lança), com a **matriz aprovada** (top-down, primeiro match):
  ```
  if (isComingSoon) return 'locked';   // 1
  if (isDone)       return 'completed'; // 2  ← progresso visual, ANTES de canAccess
  if (!canAccess)   return 'locked';    // 3
  if (isCurrent)    return 'available'; // 4
  return 'locked';                      // 5
  ```
  `isDone` é **campo separado** de `canAccess` → concluída (`isDone:true`) vira `completed` mesmo com `canAccess:false` (**ponto 1**).

## Grupo B — `StoryDetailScreen` delega (sem nova fonte de dados)
- **B1** — `getSceneStatus(cena, index)` passa a **delegar**:
  ```
  return sceneVisualStatus({
    isComingSoon,
    isDone: progresso[cena.id] === true,   // progresso REAL salvo (useProgress), independe de canAccess (ponto 1)
    canAccess,                              // continua sendo a fonte de acesso (ponto 2)
    isCurrent: index === progressCount,
  });
  ```
  Importa `sceneVisualStatus` de `storyJourneyService`. **Nada mais muda** no StoryDetail: `goToPremium` (onPress das cenas), `getPrimaryLabel` (`!canAccess`→"Pedir ao responsável") e o guard de acesso permanecem (**pontos 2/4/5/6/7**).

## Grupo C — smoke (matriz + separação + intocados)
Avaliar `storyJourneyService` isolado (strip `export` + `new Function`, retornando `sceneVisualStatus`) — o serviço é puro/sem imports.
- **C1 (matriz):** todos os 5 ramos: `isComingSoon:true`→`locked`; `isDone:true`(qualquer canAccess)→`completed`; `isDone:false,canAccess:false,isCurrent:true`→`locked`; `isDone:false,canAccess:false,isCurrent:false`→`locked`; `isDone:false,canAccess:true,isCurrent:true`→`available`; `isDone:false,canAccess:true,isCurrent:false`→`locked`.
- **C2 (progresso sem acesso = concluído):** `{isDone:true, canAccess:false}` → `completed` (**ponto 5 do device / prova 5**).
- **C3 (grátis não regride):** `{isDone:true, canAccess:true}`→`completed`; `{isDone:false, canAccess:true, isCurrent:true}`→`available`; else `locked` (**ponto 7**).
- **C4 (premium sem progresso igual):** todas `{isDone:false, canAccess:false}` → `locked` (**ponto 8**).
- **C5 (StoryDetail delega + não libera abertura):** `getSceneStatus` chama `sceneVisualStatus`; onPress das cenas segue `goToPremium`; **nenhum** `navigate('Narration'|'StoryBook'|'Coloring')` cru (guard 2B.6 intacto) (**pontos 4/5/6**).
- **C6 (pedido ao responsável):** `getPrimaryLabel` mantém `!canAccess → 'Pedir ao responsável'` (**ponto 7 da regra**).
- **C7 (intocados):** `SceneListItem` sem diff; `accessControl`/`entitlement*` sem diff; nenhum `react-native-purchases`; `app.json` sem `assetBundlePatterns` (**pontos 9/10**).

## Grupo D — gates + device + relatório
- **D1** — `npm run smoke` verde + `npx expo-doctor` 18/18.
- **D2** — grep: `SceneListItem`/`accessControl`/`entitlement*`/`App.js`/packs/`app.json` intactos (`git status`).
- **D3** — **Validação visual device (Eduardo):** Ester com progresso até cena 5 + Modo Criador off → cenas 1-5 concluídas, 6+ bloqueadas, toque em concluída → ParentArea, botão "Pedir ao responsável"; grátis e premium-sem-progresso idênticos.
- **D4** — Relatório PT-BR. Sem `git add`/commit/push.

## Rastreabilidade (ponto obrigatório → task)
1→A1/B1 (isDone separado) · 2→B1 (canAccess mantido) · 3→A1 (só visual) · 4→C5 (goToPremium) · 5→C2/C5 · 6→C1/C4 · 7→C3 · 8→C4 · 9→D2/C7 (SceneListItem) · 10→D2/C7 (todos os proibidos).
