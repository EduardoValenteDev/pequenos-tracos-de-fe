# HOME_LUMI_STARS_GUIDE — Sprint 11

**Última atualização:** Sprint 11 (2026-05-26)
**Smoke:** 459/459

---

## Visão geral

Sprint 11 transforma três áreas principais:

1. **HomeScreen** — bloco "Continuar minha aventura" com 4 cenários claros via `getHomePrimaryAction`
2. **TrophiesScreen** → **"Minhas Estrelinhas"** — título renomeado, estrelas apagadas para bloqueadas, dicas de progresso
3. **Linguagem** — varredura final: sem "Premium" em áreas infantis

---

## 1. HomeScreen — Bloco "Continuar minha aventura"

### getHomePrimaryAction (src/services/homeService.js)

Função pura: sem I/O, sem navegação. Recebe estado atual e retorna ação primária.

```js
import { getHomePrimaryAction } from '../services/homeService';

const primaryAction = useMemo(() => getHomePrimaryAction({
  progressByStory,
  progressSummary,
  stories,
  postStoryStatusByStory,
}), [progressByStory, progressSummary, postStoryStatusByStory]);
```

#### Retorno

```ts
{
  targetType: 'startFirstStory' | 'continueStory' | 'pendingRewards' | 'openAdventures',
  title: string,
  description: string,
  buttonLabel: string,
  storyId: string | null,
}
```

### 4 Cenários (prioridade A → B → C → D)

| Cenário | Condição | targetType | UI em HomeScreen |
|---|---|---|---|
| A | `totalStars === 0` | `startFirstStory` | `startInviteCard` — "Sua aventura começa aqui!" |
| B | História em andamento | `continueStory` | `continueCard` — progress bar + "▶ Continuar aventura" |
| C | Recompensas pendentes | `pendingRewards` | `pendingRewardsCard` — "🎁 Você tem recompensas..." |
| D | Nenhum dos anteriores | `openAdventures` | `NextAdventureCard` (próxima) ou `allDoneCard` (todas completas) |

### primaryStory

```js
const primaryStory = useMemo(
  () => primaryAction.storyId ? stories.find(s => s.id === primaryAction.storyId) : null,
  [primaryAction.storyId],
);
```

### Invariantes HomeScreen

- `refreshProgress()` chamado via `useFocusEffect` (mantido)
- `postStoryStatusByStory` do ProgressContext (substitui `getPostStoryStatusForStory`)
- `continueHasDrawing` reage a `primaryAction.storyId` e `targetType`
- Sem `pendingRewardsStory` state isolado — integrado via `getHomePrimaryAction`

---

## 2. TrophiesScreen — "Minhas Estrelinhas"

### Renomeação

| Antes | Depois |
|---|---|
| Título: "Conquistas" | Título: "Minhas Estrelinhas" |
| Header icon: FaithIcon "trophies" | Header icon: FaithIcon "star" |
| Subtítulo: "X de Y desbloqueadas" | Subtítulo: "X de Y conquistadas" |
| Tab (AppNavigator): "Conquistas" | Tab: "Estrelinhas" |
| TabletSidebar: "Conquistas" 🏆 | TabletSidebar: "Estrelinhas" ⭐ |

### AchievementCard — estado bloqueado

**Antes:** `<FaithIcon name="lock" />` em círculo cinza — visual punitivo

**Depois:** Emoji da conquista com `opacity: 0.28` — estrela apagada, gentil

```jsx
<Text style={[styles.cardEmoji, !unlocked && styles.cardEmojiDimmed]}>
  {achievement.emoji}
</Text>
// styles.cardEmojiDimmed: { opacity: 0.28 }
```

### Dicas de progresso (progressLabel)

Conquistas com `progressLabel` exibem progresso quando bloqueadas e `ctx` disponível:

```jsx
{!unlocked && ctx && achievement.progressLabel ? (
  <Text style={styles.progressHint}>{achievement.progressLabel(ctx)}</Text>
) : null}
```

#### Conquistas com progressLabel

| ID | Exemplo de dica |
|---|---|
| `first_scene` | "0 de 1 cena" |
| `five_stars` | "3 de 5 cenas" |
| `ten_stars` | "3 de 10 cenas" |
| `fifteen_stars` | "3 de 15 cenas" |
| `thirty_stars` | "3 de 30 cenas" |
| `fifty_stars` | "3 de 50 cenas" |
| `first_story` | "0 de 1 história" |
| `three_stories` | "0 de 3 histórias" |

---

## 3. Linguagem — varredura Sprint 11

| Arquivo | Antes | Depois |
|---|---|---|
| `src/data/achievements.js` | `title: 'Primeiro passo premium'` | `title: 'Primeira aventura especial'` |
| `src/data/achievements.js` | `desc: '...trilha Premium.'` | `desc: '...trilha Especial da Família.'` |
| `src/components/story/NextAdventureCard.js` | Badge `<Text>Premium</Text>` | Badge `<Text>Especial da Família</Text>` |
| `src/components/lumi/LumiLockedState.js` | `'...plano premium...'` | `'...Plano Família...'` |

### Regra de linguagem (consolidada)

| Área | Termo correto |
|---|---|
| Áreas infantis (qualquer tela exceto ParentArea) | "Especial da Família" |
| Área dos Pais (ParentAreaScreen) | "Plano Família" |
| Nunca usar em nenhuma área | "Premium", "Plano Familiar", "Plano Familiar Premium" |

---

## 4. O que NÃO fazer

1. **Nunca alterar `getHomePrimaryAction` para ler AsyncStorage diretamente.** Função pura.
2. **Nunca remover `refreshProgress()` do `useFocusEffect` em HomeScreen.** Sem ele o contexto não atualiza ao voltar de uma cena.
3. **Nunca reintroduzir `pendingRewardsStory` state separado.** O cenário C está integrado em `getHomePrimaryAction`.
4. **Nunca reverter "Minhas Estrelinhas" para "Conquistas" sem instrução explícita.**
5. **Nunca usar FaithIcon `lock` no `AchievementCard`.** Estrelas apagadas são o padrão aprovado.
6. **Nunca usar "Premium" em textos visíveis para a criança.** Usar sempre "Especial da Família".

---

## 5. Arquivos modificados (Sprint 11)

| Arquivo | Tipo | Mudança |
|---|---|---|
| `src/services/homeService.js` | NOVO | `getHomePrimaryAction` pura |
| `src/screens/HomeScreen.js` | Modificado | Bloco "Continuar minha aventura", primaryAction, remove state pendingRewardsStory |
| `src/screens/TrophiesScreen.js` | Modificado | "Minhas Estrelinhas", dimmed stars, progressHint, ctx prop |
| `src/navigation/AppNavigator.js` | Modificado | Tab "Estrelinhas" |
| `src/components/TabletSidebar.js` | Modificado | Tab "Estrelinhas" |
| `src/data/achievements.js` | Modificado | Linguagem + progressLabel |
| `src/components/story/NextAdventureCard.js` | Modificado | Badge "Especial da Família" |
| `src/components/lumi/LumiLockedState.js` | Modificado | "Plano Família" |
| `scripts/smoke.js` | Modificado | 28 novos checks [431–459] |
| `docs/HOME_LUMI_STARS_GUIDE.md` | NOVO | Este guia |
| `docs/UX_POLISH_GUIDE.md` | Modificado | Seção 13 adicionada |
