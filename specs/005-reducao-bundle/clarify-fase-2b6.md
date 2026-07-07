# Clarify — Bloco 2 · Fase 2B.6 · Política de acesso e download premium

> **Etapa SDD 2.** Resolve ambiguidades da `spec-fase-2b6.md` antes do Plan. Sem `[NEEDS CLARIFICATION]` em aberto.

| # | Ponto | Resolução |
|---|---|---|
| C1 | "atual OU concluída" (RP1, ajuste Portão 2) | Pode baixar se a história é a **atual** OU **já concluída**. Em jornada linear isso **equivale a `sequenceUnlocked(id)`**: concluída → anterior completa → `sequenceUnlocked=true`; atual → anterior completa → `true`; futura bloqueada → anterior incompleta → `false`. **Gate implementado = `sequenceUnlocked`** (já disponível no StoryDetail via `isStorySequenceUnlocked`). **Dispensa** `getCurrentJourneyStoryId` → ProgressContext **não** muda. |
| C2 | Escopo do gate de download | Bloqueia **só as futuras** (`sequenceUnlocked=false`). **Atual e concluídas podem baixar** — sem download em massa de futuras, sem punir quem já avançou. |
| C3 | Rechecagem em foco (RP3) | `useFocusEffect` executa a **mesma ação do mount guard**: se `!canOpenStoryFullExperience(story)` → redireciona (ParentArea p/ premium; voltar p/ mídia/coming_soon). Não é comportamento novo — é a revalidação também ao **refocar** (não só no mount). Sem quebrar máquinas de estado existentes (LIVRINHO_FIX/UX no StoryBook). |
| C4 | "Modo Criador off" como teste | É **proxy de expiração** para o teste de device (Modo Criador é o "premium" local). Não é o contrato real de expiração (RP4/RevenueCat futuro), mas exercita o mesmo caminho (`isPremiumUser()` vira false → telas bloqueiam). |
| C5 | RP4 (`expiresAt`) | **Contrato documentado, não implementado.** Nesta fase, apenas registra em `accessControl` (comentário/JSDoc) que a futura integração deve refletir active/expired e guardar validade offline. **Zero mudança de comportamento** agora. |
| C6 | Re-download de história concluída | **Permitido** (ajuste Portão 2): concluída tem `sequenceUnlocked=true` → mostra download para rebaixar/revisitar. Só as **futuras** ficam sem download. |
| C7 | Parada de mídia em foco (RP3, ajuste Portão 2) | Ao bloquear em foco: **Narração** `replace('ParentArea')` → desmonta → `AudioPlayer` pausa no cleanup (`:116`); **StoryBook** `setIsPaused(true)` + `setScreenState('locked')` (pausa imediata + desmonta player); **Colorir** `replace` (sem áudio). Reusa mecanismos existentes; preserva LIVRINHO_FIX/UX. |

**Sem ambiguidades pendentes.** Requisitos prontos para o Checklist.
