# M2 · Alinhamento de conteúdo (texto de cena, narração, quiz, reflexão, finalização)

> **Feature:** `007-m2-conteudo-narracao` · **Etapa SDD:** 1 (Specify) · **Portão 1: pendente + BLOQUEADOR de premissa.**
> **Base:** M1 publicado (`06ec4b7`). Roadmap [[M0–M10]] — este é o **M2**.
> **Natureza:** conteúdo (dados/texto) + UX de finalização. **Não** toca áudio, assets de imagem, RevenueCat, entitlement, packs, EAS.
>
> ⚠️ **Este documento é o registro histórico do Portão 1** (com o bloqueador da §2 ainda em aberto). O bloqueador foi **resolvido**: o docx Final(8) bate com o roteiro do repo em palavras ⇒ **M2a = NO-OP** e a hipótese **H1 foi descartada**. O que foi de fato implementado e publicado está em `analyze-m2.md` → "Resultado da implementação".

## 1. Problema (reportado pelo Eduardo)
No playthrough completo (iPhone 14): (1) texto das cenas divergindo da narração; (2) quizzes com perguntas não mencionadas na história; (3) "Guardar no coração" (reflexão) genérica/superficial; (4) final de história confuso, com informação demais; (5) última cena com finalização inconsistente ("Concluir cena" → "finalizar história", às vezes auto-finaliza) — falta padrão claro com recompensa de estrela.

## 2. ⚠️ Achado da auditoria read-only (BLOQUEADOR de premissa)
Comparação **sistemática das 200 cenas** (script read-only, fora do repo): o campo **`cenas[].textoNarracao`** de `src/data/stories.js` (que é exatamente o que a `NarrationScreen` exibe, linha 274) **BATE 100%** com o campo **"Texto final para narrar"** do roteiro `docs/biblical-review/final-5-revisoes/ROTEIRO_NARRACAO_FINAL_5_REVISOES.md`:

```
match: 200 · diverge: 0 · faltando: 0  (20 histórias × 10 cenas, todas 10/0/0/0)
```

➡️ **O texto de cena do app JÁ está alinhado ao roteiro final-5-revisões do repo.** Portanto a divergência que o Eduardo ouviu **não** é "app-text ≠ roteiro do repo". As hipóteses são:
- **(H1)** Os **áudios** foram gerados de um documento **diferente** do roteiro do repo — provavelmente **"Roteiro de Narração Final(8).docx"** (confirmado pelo Eduardo), que pode ser uma versão **posterior/distinta** do markdown `..._5_REVISOES.md`. Nesse caso o **áudio ≠ texto na tela**, e o **repo NÃO contém a fonte da verdade real** (o `.docx` Final(8) não está versionado, ou difere). → **M2 (texto) não pode começar sem esse documento.**
- **(H2)** O `.docx` Final(8) é **idêntico** ao markdown do repo → então **áudio = texto** e **não há divergência de texto** → a percepção do Eduardo é sobre **outra coisa** (qualidade de áudio, cenas específicas, ou é o **quiz/reflexão/final**, não o texto de cena).

**Ação exigida (regra do próprio Eduardo):** confirmar **exatamente** se `Roteiro de Narração Final(8).docx` é idêntico a `ROTEIRO_NARRACAO_FINAL_5_REVISOES.md`, ou se é uma versão nova que gerou os áudios (e que precisa ser versionada no repo). **Sem isso, a parte de texto de cena (M2a) fica bloqueada.**

## 3. Objetivo do M2
Garantir que **texto de cena, quiz, reflexão e finalização** estejam alinhados ao **roteiro oficial** (a ser confirmado) e coerentes entre si, sem quebrar navegação nem progresso. Fonte da verdade: o roteiro oficial confirmado (campo "Texto para narrar").

## 4. Sub-blocos (escopo)
| Sub-bloco | O quê | Status auditoria |
|---|---|---|
| **M2a — texto de cena ↔ narração** | alinhar `textoNarracao`/títulos ao roteiro que gerou os áudios | **BLOQUEADO** — app já bate com o roteiro do repo; depende de confirmar o `.docx` Final(8) (H1/H2) |
| **M2b — quiz** | cada pergunta deve ser respondível pela história; remover fatos não mencionados | **Real** — `quizzes.js` tem perguntas de detalhe (ex.: `david_q7` "quarenta dias", `david_q8` "Senhor dos Exércitos") a checar contra o roteiro |
| **M2c — reflexão** | "Guardar no coração" útil/específico da história (não genérico) | **Real** — `ReflectionScreen`/dados; hoje 2 perguntas genéricas ([[ux1_bloco4c]]) |
| **M2d — finalização** | padrão claro de conclusão + recompensa de estrela; sem auto-finalizar confuso | **Real** — fluxo `NarrationScreen`/`CongratsScreen`/`PostStoryHub`/`storyJourneyService` |

## 5. Arquivos prováveis (por sub-bloco)
- **M2a:** `src/data/stories.js` (`cenas[].textoNarracao`, `titulo`) — **só se** o roteiro confirmado diferir do texto atual.
- **M2b:** `src/data/quizzes.js`.
- **M2c:** `src/screens/ReflectionScreen.js` + dados de reflexão (`stories.js` `scenePlan[].reflectionPrompt` / `lumiReflections.js`).
- **M2d:** `src/screens/NarrationScreen.js`, `CongratsScreen.js`, `PostStoryHubScreen.js`, `src/services/storyJourneyService.js` (conclusão/estrela).
- Governança/testes: `scripts/smoke.js` (checks de coerência), docs SDD.

## 6. Histórias afetadas
Potencialmente as **20** (auditoria por cena). M2a: **0 divergências** contra o roteiro do repo (a reavaliar contra o `.docx` Final(8)). M2b/c/d: a auditar por história.

## 7. Escopo permitido
Edição de **texto/dados** (`stories.js` textoNarracao/títulos, `quizzes.js`, reflexão) e **UX de finalização**; smoke de coerência; docs.

## 8. Escopo proibido
- ❌ Mexer em **áudio** (mp3), assets de imagem, cenas ilustradas, colorir.
- ❌ RevenueCat/entitlement/packs/downloader/EAS/screenshot/.easignore/app.json.
- ❌ Alterar **ids de cena/história**, estrutura de navegação ou chaves de progresso (`@ptf_*`).
- ❌ Iniciar M3–M10.
- ❌ **M2a (texto) antes** de confirmar o documento-fonte (H1/H2).

## 9. Riscos
- **Retrabalho:** editar texto sobre o roteiro errado (se o `.docx` Final(8) diferir). → confirmar antes.
- **Quebrar progresso/navegação:** editar texto NÃO pode mudar ids de cena, `totalCenas`, chaves `@ptf_*` nem o fluxo de conclusão. → só conteúdo.
- **Quiz incoerente:** trocar pergunta/opções deve manter `correct` válido e id estável.
- **Finalização:** mudar o fluxo de conclusão pode afetar cálculo de estrela/`journeyComplete`. → área sensível ([[ux_a0_vitrine_contrato_jornada]]).

## 10. Critérios de aceite (alto nível)
- Texto de cena = roteiro oficial **confirmado** (após H1/H2 resolvido).
- Toda pergunta de quiz respondível pelo texto da história.
- Reflexão específica e útil por história.
- Finalização com padrão único + recompensa de estrela; sem auto-finalizar confuso; sem quebrar `journeyComplete`/progresso.
- Gates verdes; validação device; sem tocar áudio/assets.

## 11. Perguntas do Portão 1 → `clarify-m2.md`
Bloqueio #1: confirmar o documento-fonte (Final(8).docx vs repo). Demais: onde exatamente o Eduardo viu a divergência de texto; escopo do quiz; forma da reflexão; padrão de finalização.
