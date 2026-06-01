# REWARDS_GUIDE — Sprint 7

**Última atualização:** Sprint 7 (2026-05-26)
**Smoke:** 224/224

---

## Regra oficial de estrelas

| Atividade | Estrelas | Condição |
|---|---|---|
| Cena colorida | +1 estrela de cena | Por sceneId único (idempotente) |
| Quiz concluído | +1 estrela especial | Apenas na primeira vez |
| Reflexão com Lumi | +1 estrela especial | Apenas na primeira vez |
| Livrinho aberto | +1 estrela especial | Apenas na primeira vez |

**Regra de idempotência:** Refazer qualquer atividade NÃO gera novas estrelas. A contagem é sempre derivada do estado armazenado, nunca de um acumulador.

---

## Campos do progressSummary (Sprint 7+)

| Campo | Tipo | Descrição |
|---|---|---|
| `sceneStars` | number | Cenas completadas (estrelas de cena) |
| `specialStars` | number | Soma de quiz + reflexão + livrinho completados |
| `totalStars` | number | `sceneStars + specialStars` — exibir para o usuário |
| `maxSceneStars` | number | Total de cenas disponíveis |
| `maxSpecialStars` | number | `playableStories × 3` — máximo teórico de especiais |
| `maxTotalStars` | number | `maxSceneStars + maxSpecialStars` — denominador da barra |

Campos herdados do Sprint 6 (mantidos para retrocompatibilidade):

| Campo | Tipo | Equivalência |
|---|---|---|
| `completedScenes` | number | = `sceneStars` |
| `totalScenes` | number | = `maxSceneStars` |
| `totalBonusStars` | number | Legacy acumulador AsyncStorage (`@ptf_bonus_stars`) — não usar para exibição |

---

## Serviços

### `src/services/rewardService.js` (Sprint 7 — novo)

Serviço **puro** — sem leituras de AsyncStorage. Recebe dados, retorna cálculos.

```js
import { getRewardsSummary, getStoryRewardBreakdown } from '../services/rewardService';

// Resumo global (usado por ProgressContext)
const summary = getRewardsSummary(progressByStory, postStoryStatusByStory, stories);
// → { sceneStars, specialStars, totalStars, maxSceneStars, maxSpecialStars, maxTotalStars }

// Detalhes por história
const breakdown = getStoryRewardBreakdown(progressByStory, postStoryStatusByStory, storyId, story);
// → { sceneStars, maxSceneStars, quizStar, reflectionStar, storyBookStar, specialStars, totalStars, maxTotalStars }
```

### `src/services/achievementService.js` (Sprint 7 — fast path adicionado)

Assinatura: `buildCtx(progressMap, storiesList, options = {})`

Quando `options.postStoryStatusByStory` é fornecido (via TrophiesScreen → ProgressContext), **~40 leituras AsyncStorage são eliminadas**.

```js
// Fast path (TrophiesScreen — usa dados pré-carregados do ProgressContext)
const ctx = await buildCtx(progressByStory, stories, { postStoryStatusByStory });

// Legacy fallback (sem dados pré-carregados — faz leituras individuais)
const ctx = await buildCtx(progressByStory, stories);
```

---

## Fluxo de cálculo

```
ProgressProvider.loadAll()
  └─ computeSummary(progress, postStatus, bonusStars)
       └─ getRewardsSummary(progress, postStatus, stories)  ← puro, sem I/O
            ├─ sceneStars = Σ cenas completadas
            ├─ specialStars = Σ (quizDone + reflectionDone + storyBookOpened)
            └─ totalStars = sceneStars + specialStars
```

---

## Garantias de idempotência

| Tela | Guard | O que protege |
|---|---|---|
| `QuizScreen` | `alreadyDone` flag | `addBonusStars` não é chamado novamente se quiz já foi feito |
| `ReflectionScreen` | `alreadyDone` flag | `addBonusStars` não é chamado novamente se reflexão já foi feita |
| `StoryBookScreen` | `markedRef` ref | `markStoryBookOpened` não é chamado novamente se já marcado |

---

## O que NÃO fazer

1. **Nunca usar `totalBonusStars` como contagem primária.** É um acumulador legado (`quiz=2, lumi=1`) incompatível com a regra oficial. Mantido apenas para retrocompatibilidade interna.
2. **Nunca remover os guards de idempotência** (`alreadyDone`, `markedRef`).
3. **Nunca acumular estrelas em um contador separado.** Toda contagem é derivada dos estados armazenados.
4. **Nunca liberar estrelas especiais para usuários gratuitos em histórias premium.** O `hasPendingRewards` só é ativado quando `done >= total`, e histórias premium bloqueadas nunca têm cenas completadas.
5. **Nunca apagar `@ptf_bonus_stars`.** Usuários existentes têm dados; migração destrutiva quebraria retrocompatibilidade.

---

## Chaves do AsyncStorage relacionadas a recompensas

| Chave | Dados | Origem |
|---|---|---|
| `@ptf_progress_${storyId}` | `{ [sceneId]: true }` | `useProgress` hook (escrita) |
| `@ptf_quiz_done_${storyId}` | `'true'` | `markQuizDone` em `postStoryStorage` |
| `@ptf_reflection_${storyId}` | JSON do objeto de reflexão | `saveReflection` em `postStoryStorage` |
| `@ptf_storybook_opened_${storyId}` | `'true'` | `markStoryBookOpened` em `postStoryStorage` |
| `@ptf_bonus_stars` | número como string (legacy acumulador) | `addBonusStars` em `postStoryStorage` |
