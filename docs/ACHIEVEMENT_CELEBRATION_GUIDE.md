# ACHIEVEMENT_CELEBRATION_GUIDE — Pequenos Traços de Fé

**Sprint 13 — 2026-05-27**

Guia do sistema de celebração de conquistas: arquitetura, fluxo e regras absolutas.

---

## 1. Componentes e arquivos

| Arquivo | Papel |
|---|---|
| `src/data/achievements.js` | Array `ACHIEVEMENTS` — 26 conquistas, cada uma com `id`, `emoji`, `title`, `desc`, `color`, `check(ctx)`, `progressLabel?(ctx)` |
| `src/services/achievementService.js` | `buildCtx(progressByStory, stories, extras)` — constrói o objeto `ctx` usado em todos os `check()` |
| `src/services/achievementsStorage.js` | Camada de AsyncStorage — chave `@ptf_achievements_seen`, `getSeenAchievements()`, `markAchievementSeen(id)` |
| `src/services/achievementSeenService.js` | Wrapper de alto nível: `getSeenAchievementIds`, `markAchievementAsSeen`, `markAchievementsAsSeen`, `diffNewAchievements`, `silentlyMarkAllCurrentAsSeen` |
| `src/hooks/useAchievementCelebration.js` | Hook que detecta e enfileira conquistas novas |
| `src/components/achievements/AchievementUnlockModal.js` | Modal de celebração isolado — sem grants, sem XP |

---

## 2. Fluxo de uma celebração

```
Ação importante (pintar / quiz / livrinho)
    ↓
checkForNewAchievements()   ← chamado manualmente pelo screen
    ↓
buildCtx()                  ← async, lê ProgressContext
    ↓
ACHIEVEMENTS.filter(a => a.check(ctx)) → unlockedIds
    ↓
getSeenAchievementIds()     → seenIds
    ↓
diffNewAchievements(unlockedIds, seenIds) → newIds
    ↓
newIds.length > 0  →  setPendingAchievement(first) + setQueue(rest)
    ↓
AchievementUnlockModal aparece
    ↓
Criança clica "Legal! 🎉"
    ↓
dismissAchievement()  →  markAchievementAsSeen(id) + mostra próxima (se houver)
```

---

## 3. Proteção contra spam no primeiro uso (Sprint 13)

Na primeira chamada a `checkForNewAchievements()`:
- Se `seenIds` está vazio **e** `unlockedIds.length > 0` → usuário existente que instalou o Sprint 13 sem nunca ter tido o sistema de celebração.
- Ação: chama `silentlyMarkAllCurrentAsSeen(ctx)` e retorna sem exibir modal.
- `firstCheckRef.current` fica `true` nas chamadas seguintes → comportamento normal.

**Por que:** evitar que um usuário com 15 conquistas acumuladas seja bombardeado com 15 modais ao abrir o app pela primeira vez após atualizar.

---

## 4. Onde a celebração é disparada

| Tela | Momento do disparo | Delay |
|---|---|---|
| `CongratsScreen` | `useEffect` na montagem (após pintura salva) | 1 800 ms |
| `QuizScreen` | Dentro de `handleNext()` quando quiz é concluído pela primeira vez | 800 ms |
| `StoryBookScreen` | Dentro de `handleStartLivrinho()` após `markStoryBookOpened` | 1 000 ms |

O delay existe para deixar a animação de entrada da tela terminar antes de exibir o modal.

---

## 5. Regras absolutas

1. **`AchievementUnlockModal` não concede estrelas** — nenhuma chamada a `addBonusStars`, `grantStar`, `setBonusStars` ou equivalente.
2. **`AchievementUnlockModal` não usa linguagem de XP** — proibidos: `totalXP`, `xpPercent`, `animatedXP`, `STAR_XP`.
3. **`achievementSeenService` nunca chama `AsyncStorage.clear()`** — usa apenas `markAchievementSeen()` da camada de storage.
4. **O hook falha silenciosamente** — qualquer exceção em `checkForNewAchievements` ou `dismissAchievement` é capturada e logada apenas em `__DEV__`. Nunca quebra a tela.
5. **Conquistas são avaliadas, nunca concedidas, pelo modal** — o `check(ctx)` é read-only.

---

## 6. Adicionar uma nova conquista

1. Abrir `src/data/achievements.js`
2. Adicionar objeto ao array `ACHIEVEMENTS`:
   ```js
   {
     id: 'minha_conquista',
     emoji: '🌟',
     title: 'Título curto',
     desc: 'Descrição em uma frase.',
     color: '#F59E0B',
     check: (ctx) => ctx.completedStories >= 5,
     progressLabel: (ctx) => `${ctx.completedStories}/5 histórias concluídas`,
   }
   ```
3. O `achievementService.buildCtx()` pode precisar de novos campos em `ctx` — verificar e adicionar se necessário.
4. O `progressLabel` é opcional — aparece sob `desc` na `TrophiesScreen` quando a conquista ainda não foi desbloqueada.
5. Rodar `npm run smoke` — o check de "at least 5 progressLabel functions" deve continuar passando.

---

## 7. TrophiesScreen — estado vazio

Quando `unlockedCount === 0`, exibe:

> ⭐ Pinte sua primeira cena para acender a primeira estrelinha!

Fundo amarelo suave (`#FFFBF0`), borda dourada, fonte Nunito bold — coerente com a identidade visual de estrelas.

---

## 8. Textos proibidos na área de conquistas

| Proibido | Substituir por |
|---|---|
| `XP` | estrelas |
| `ponto` / `pontos` | estrelas |
| `nível` | conquista / estrelinha |
| `Premium` como label | Especial da Família |
| `erro ao carregar conquista` | silencioso |
