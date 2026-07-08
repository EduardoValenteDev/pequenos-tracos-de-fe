# Clarify — Bloco 2 · Fase 2B.7.3a · Progresso visual em premium bloqueada

> **Etapa SDD 2.** Resolve ambiguidades da `spec-fase-2b73a.md` antes do Plan.

| # | Ponto | Resolução |
|---|---|---|
| C1 | Cena concluída sem acesso: clicável ou não? | **Clicável → `goToPremium` → ParentArea** (mínimo; sem tocar `SceneListItem`). Coerente com "para rever/continuar premium, precisa de assinatura". A regra 8 é respeitada: `goToPremium` **não** abre Narração/Colorir; leva à Área dos Pais. (Alternativa "não-clicável / ✓+cadeado" = melhoria opcional de `SceneListItem`, ver Plan.) |
| C2 | Como o smoke prova a matriz (gates 1-3)? | **Extrair a lógica para uma função PURA testável** (`sceneVisualStatus`), consumida por `getSceneStatus`. O smoke avalia a função isolada (padrão `storyJourneyService`/`entitlementPolicy`) cobrindo os casos. Alternativa (shape check inline) é mais fraca — recomendação: função pura. |
| C3 | Onde vive a função pura? | **Em `storyJourneyService`** (já é o "contrato único de status da história", puro, sem I/O, já testado pelo smoke) — coeso com o status de jornada. StoryDetail passa a delegar `getSceneStatus` a ela. (Alternativa: novo arquivo — decidir no Plan.) |
| C4 | `accessControl` precisa mudar? | **Não.** A análise mostra que o único ponto é `getSceneStatus` (ordem visual). `canAccess`/`isPremiumUser`/`hasAccess` já são a fonte correta de acesso — **intocados**. |
| C5 | Indicador visual "concluída mas bloqueada" em `SceneListItem`? | **Opcional** (não no mínimo). O mínimo mostra a cena como `completed` (✓/Concluída). Se quiser diferenciar "concluída mas premium bloqueada" (ex.: ✓ + cadeado discreto), é ajuste de `SceneListItem` — apresentado no Plan como opção, com validação visual. |
| C6 | Histórias grátis / premium sem progresso | **Idênticas ao atual** (prova por caso na spec): grátis `canAccess=true` → fluxo igual; premium sem progresso → nenhuma concluída → todas `locked`. |

**Sem ambiguidades pendentes.** Requisitos prontos para o Checklist.
