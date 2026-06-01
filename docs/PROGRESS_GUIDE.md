# PROGRESS_GUIDE — Sprint 7

**Última atualização:** Sprint 7 (2026-05-26)
**Smoke:** 224/224

> Para a regra de estrelas e recompensas, consulte também [REWARDS_GUIDE.md](REWARDS_GUIDE.md).

---

## Problema resolvido

Antes do Sprint 6, 5 telas chamavam `useProgress` 20 vezes cada, individualmente:

| Tela | Chamadas useProgress |
|---|---|
| HomeScreen | 20 |
| AppNavigator (useStarsTotal) | 20 |
| ProfileScreen | 20 |
| TrophiesScreen | 20 |
| StoriesScreen | 20 |
| **Total** | **100 chamadas ao AsyncStorage na montagem** |

Cada `useProgress` abre uma leitura independente do AsyncStorage. Com 100 chamadas paralelas, o app fazia 100+ leituras de disco na abertura e podia exibir dados inconsistentes entre telas.

---

## Solução: ProgressContext

### Arquivo

`src/context/ProgressContext.js`

### Provider

```jsx
// App.js — dentro de ProfileProvider
<ProgressProvider>
  <AppNavigator />
</ProgressProvider>
```

### Hook de acesso

```js
import { useProgressContext } from '../context/ProgressContext';

const {
  progressByStory,          // { [storyId]: { [sceneId]: true } }
  postStoryStatusByStory,   // { [storyId]: { storyBookOpened, quizDone, reflectionDone, hasPendingRewards } }
  progressSummary,          // objeto com agregados (ver abaixo)
  isLoadingProgress,        // boolean
  progressError,            // Error | null
  refreshProgress,          // () => Promise<void>
  markProgressDirty,        // alias de refreshProgress
  getStoryProgress,         // (storyId) => {}
  isStoryCompleted,         // (storyId) => boolean
  getCompletedScenesCount,  // (storyId) => number
  getTotalScenesCount,      // (storyId) => number
  getStoryCompletionPercent,// (storyId) => 0-100
  getPostStoryStatusForStory,// (storyId) => { storyBookOpened, quizDone, reflectionDone, hasPendingRewards } | null
  hasPendingRewardsForStory, // (storyId) => boolean
} = useProgressContext();
```

### progressSummary — campos

| Campo | Tipo | Descrição |
|---|---|---|
| `totalStories` | number | Total de histórias no catálogo |
| `availableStories` | number | Histórias com status 'available' |
| `freeStories` | number | Histórias gratuitas |
| `premiumStories` | number | Histórias premium |
| `startedStories` | number | Histórias com progresso parcial |
| `completedStories` | number | Histórias totalmente completadas |
| `totalScenes` | number | Soma de totalCenas de todas as histórias |
| `completedScenes` | number | Cenas concluídas no total |
| `completionPercent` | number | 0–1 (completedScenes / totalScenes) |
| `pendingRewardsCount` | number | Histórias completas com recompensas pendentes |
| `storiesWithPendingRewards` | string[] | IDs das histórias com recompensas pendentes |
| `storyBookOpenedCount` | number | Quantidade de livrinho abertos |
| `quizCompletedCount` | number | Quizzes completados |
| `lumiCompletedCount` | number | Reflexões com Lumi completadas |
| `totalBonusStars` | number | Legacy acumulador (`@ptf_bonus_stars`) — não usar para exibição |
| `hasAnyProgress` | boolean | true se completedScenes > 0 |
| `nextRecommendedStory` | object \| null | Primeiro story sem nenhuma cena completada |
| `sceneStars` | number | Estrelas de cena (= completedScenes) |
| `specialStars` | number | Estrelas especiais (quiz + reflexão + livrinho) |
| `totalStars` | number | `sceneStars + specialStars` — valor a exibir para o usuário |
| `maxSceneStars` | number | Total de cenas disponíveis (= totalScenes) |
| `maxSpecialStars` | number | Máximo teórico de especiais (`playableStories × 3`) |
| `maxTotalStars` | number | `maxSceneStars + maxSpecialStars` — denominador da barra de progresso |

---

## Como funciona internamente

### Carregamento

```
ProgressProvider.mount
  └─ loadAll()
       ├─ loadAllProgress()          ← AsyncStorage.multiGet (1 round-trip para 20 chaves)
       ├─ loadAllPostStoryStatuses() ← Promise.all de 20 × Promise.all(3)
       └─ getBonusStars()            ← 1 leitura
       → computeSummary(progress, postStatus, bonusStars)
```

**Benefício:** 1 `multiGet` em vez de 20 `getItem` separados para o progresso principal.

### Invalidação

Sempre que uma tela ESCREVE dados de progresso, ela chama `refreshProgress()` ou `markProgressDirty()`:

| Tela | Evento de escrita | Quando chamar |
|---|---|---|
| ColoringScreen | `salvarCena(cena.id)` | Imediatamente após o await |
| QuizScreen | `markQuizDone(story.id)` | Após marcar quiz como feito |
| ReflectionScreen | `saveReflection(story.id, ...)` | Após salvar reflexão |
| StoryBookScreen | `markStoryBookOpened(story.id)` | Ao iniciar o Livrinho |

### Telas de leitura

Não precisam mais de `useProgress` para montar um progressMap de 20 histórias:

| Tela | Antes | Depois |
|---|---|---|
| HomeScreen | 20 × useProgress | `progressByStory` do contexto |
| AppNavigator | 20 × useProgress (useStarsTotal) | `progressSummary.completedScenes` |
| ProfileScreen | 20 × useProgress | `progressSummary.completedScenes` |
| TrophiesScreen | 20 × useProgress | `progressByStory` (passado para buildCtx) |
| StoriesScreen | 20 × useProgress | `progressByStory` (como progressMap) |

---

## Regras absolutas

1. **Nunca alterar o formato dos dados salvos.** A chave `@ptf_progress_${storyId}` e o formato `{ [sceneId]: true }` são imutáveis enquanto usuários reais tiverem dados salvos. Qualquer mudança exige migração.
2. **Nunca apagar progresso existente.** ProgressContext lê, nunca escreve diretamente.
3. **Nunca remover `useProgress` das telas de escrita individual** (ColoringScreen, StoryDetailScreen). O hook `useProgress` ainda é usado para `salvarCena` — ele é a fonte de escrita, não de leitura em massa.
4. **Sempre chamar `refreshProgress()` após writes.** Sem isso o contexto fica desatualizado até a próxima montagem do ProgressProvider.
5. **`isLoadingProgress` é true apenas no primeiro carregamento.** Refreshes subsequentes não ativam o loading (silent refresh). Telas não devem exibir loading spinner baseado nele após a montagem inicial.

---

## Chaves do AsyncStorage

| Chave | Dados | Usado por |
|---|---|---|
| `@ptf_progress_${storyId}` | `{ [sceneId]: true }` | useProgress (escrita), ProgressContext (leitura) |
| `@ptf_quiz_done_${storyId}` | `'true'` | postStoryStorage |
| `@ptf_reflection_${storyId}` | JSON do objeto de reflexão | postStoryStorage |
| `@ptf_storybook_opened_${storyId}` | `'true'` | postStoryStorage |
| `@ptf_bonus_stars` | número como string | postStoryStorage |
| `@ptf_lumi_moment_YYYY-MM-DD` | `'true'` | postStoryStorage |
| `@ptf_lumi_moment_ever` | `'true'` | postStoryStorage |

---

## Relação com rewardService (Sprint 7)

`computeSummary` chama `getRewardsSummary(progressByStory, postStoryStatusByStory, stories)` de `src/services/rewardService.js` — um serviço puro (sem AsyncStorage) que calcula os campos de estrelas. Ver [REWARDS_GUIDE.md](REWARDS_GUIDE.md) para detalhes.

## Checklist — Sprint 7 (224/224)

- [x] ProgressContext criado com todos os helpers
- [x] ProgressProvider registrado em App.js (dentro de ProfileProvider)
- [x] HomeScreen migrada (removidas 20 chamadas useProgress)
- [x] AppNavigator migrado (useStarsTotal removido)
- [x] ProfileScreen migrada (removidas 20 chamadas useProgress)
- [x] TrophiesScreen migrada (buildCtx recebe progressByStory do contexto)
- [x] StoriesScreen migrada (progressMap = progressByStory do contexto)
- [x] ColoringScreen: refreshProgress após salvarCena
- [x] QuizScreen: refreshProgress após markQuizDone
- [x] ReflectionScreen: refreshProgress após saveReflection
- [x] StoryBookScreen: refreshProgress após markStoryBookOpened
- [x] smoke.js atualizado (checks [155–182])
- [x] PROGRESS_GUIDE.md criado
