# Analyze — M2 · Alinhamento de conteúdo

> **Etapa SDD 6.** Consistência spec↔clarify↔plan↔tasks + verificação de segurança. **Nenhum código escrito, nada staged.** **Portão 3: pendente.**

## Consistência
| Eixo | Verdato |
|---|---|
| M2a = NO-OP (texto verificado 200/200) | ✅ spec/plan/tasks coerentes; `textoNarracao` fora do escopo |
| Critério de quiz (manter/reescrever/substituir) aplicado por pergunta | ✅ tasks T-b1..T-b4 |
| Ordem M2b→M2c→M2d | ✅ plan §Sequência, tasks §Ordem |
| Sem áudio/assets/app.json/eas.json/entitlement | ✅ spec §8, plan §Fora |
**Sem divergências.**

## Verificações de segurança
| # | Ponto | Verdato |
|---|---|---|
| A1 | **Ids de cena/história/`totalCenas` intactos** | ✅ M2 só edita conteúdo (quiz/reflexão/UX); nunca estrutura |
| A2 | **Chaves `@ptf_*` intactas** (progresso, reflexão, coloring) | ✅ M2c não altera fluxo/chaves de reflexão; M2d preserva `journeyComplete` |
| A3 | **8 perguntas/história mantidas** | ✅ REESCREVER/SUBSTITUIR não muda a contagem |
| A4 | **`correct` sempre índice válido** | ✅ redações mantêm 3 opções + índice; smoke valida |
| A5 | **Ids de quiz estáveis** | ✅ REESCREVER mantém id; SUBSTITUIR reusa o id (só troca texto) |
| A6 | **Nenhuma resposta sem base na narração** | ✅ todas as redações apontam para fato/conceito narrado |
| A7 | **`textoNarracao` não é tocado** | ✅ M2a NO-OP |
| A8 | **Finalização preserva estrela/`journeyComplete`** | ✅ M2d com regressão obrigatória (área sensível) |
| A9 | **Sem áudio/assets** | ✅ fora do escopo |
| A10 | **Escopo por subfase, commits separados** | ✅ M2b/c/d/f isolados |

## Riscos por arquivo
| Arquivo | Risco | Mitigação |
|---|---|---|
| `src/data/quizzes.js` | `correct` inválido; pergunta sem base; contagem ≠ 8 | smoke (índice/contagem/ids); redações ancoradas na narração |
| `src/data/stories.js` (campo lição M2c) | tocar `textoNarracao`/ids por engano | edição **aditiva** (novo campo); smoke guarda `textoNarracao` intacto |
| `src/screens/ReflectionScreen.js` | quebrar fluxo/`@ptf_*` de reflexão | só exibir texto; não mexer em navegação/chaves |
| `NarrationScreen`/`CongratsScreen`/`PostStoryHub`/`storyJourneyService` | quebrar conclusão/estrela/`journeyComplete` | **regressão de progresso** + device; mudança mínima do fluxo |
| `scripts/smoke.js` | falso verde | checks específicos por subfase |

## Curadoria de quiz — números
- **Reescrever/substituir:** 16 (alta) + 4 (média) = **20**; opcionais (baixa): ~5.
- **Manter:** ~135 (derivadas do texto). Auditoria heurística super-sinalizou 83; a curadoria humana reduziu a **~20 reais** (números/nomes/detalhes/citações não narradas).
- **Falsos positivos confirmados como MANTER:** morais `*_q6`/`*_q8` (sinônimos) e números realmente narrados (`noah_q7`, `daniel_q4`, `jonah_q2`, `lost_q1`, `temple_q2`, `temple_q3`).

## Gates por subfase
`npm run smoke` (checks novos) · `npx expo-doctor` · `git diff --check` · **device** (M2b: quiz responde certo; M2c: reflexão aparece; M2d: conclusão + estrela sem regressão).

## Conclusão
Consistência OK; segurança verificada (ids/chaves/estrutura intactos); curadoria de quiz **precisa**; escopo pequeno e por subfase. Pronto para **Portão 3**. Nada implementado.

---

## Resultado da implementação (pós-Portão 3 — rastreabilidade spec↔código)

Implementado, validado em device (Dev Client, iPhone) e publicado na branch `content-integrate-coloring-3`:

| Subfase | Commit | Arquivos | Entregue |
|---|---|---|---|
| M2a | — | — | **NO-OP**: `textoNarracao` bate 200/200 com o roteiro oficial. Nenhuma edição. |
| M2b | `e6d2173` | `src/data/quizzes.js`, `scripts/smoke.js` | **23 perguntas** alteradas (16 alta + 4 média + 3 baixa). 8/história, ids preservados, `correct` válido. `mary_q1`/`josiah_q4` mantidos. |
| M2c | `0ea4f27` | `src/data/stories.js`, `src/screens/ReflectionScreen.js`, `scripts/smoke.js` | Campo aditivo `reflexaoLicao` (20/20), exibido no passo `done`, display-only. Fluxo, `+1⭐` da reflexão e chaves `@ptf_*` intactos. |
| M2d | `384ccde` | `src/screens/NarrationScreen.js`, `scripts/smoke.js` | Rótulos "Concluir história ⭐" / "Ver conclusão →". **Sem estrela extra de conclusão.** Só `NarrationScreen` tocada. |

### Desvios em relação aos artefatos originais (e por quê)
1. **Estrela de conclusão.** Clarify Q5, Plan (M2d) e T-d1 previam "+1 estrela" ao concluir a história. **Não foi implementado** — decisão do Eduardo no Portão 3: a estrela da última cena já é a da própria cena (`salvarCena`, idempotente); uma estrela extra criaria assimetria com as cenas 1–9 e mexeria na economia de estrelinhas (bloco próprio, futuro). `NarrationScreen` tem **0** ocorrências de `addBonusStars`.
2. **Escopo do M2d.** T-d2 previa tocar `CongratsScreen`/`PostStoryHub`/`storyJourneyService`; a implementação mínima resolveu tudo em `NarrationScreen` (rótulo + ação). Os demais **não** foram tocados — menor risco na área sensível.
3. **`timothy_q1`.** A redação publicada difere da proposta em T-b1: "Com a avó Loide e a mãe Eunice" duplicaria `timothy_q2`/`timothy_q3`.
4. **T-b3 (baixa prioridade).** Estava marcado "manter salvo pedido"; o Eduardo autorizou e 3 dos 5 foram aplicados (`noah_q8`, `samaritan_q3`, `temple_q7`).

### Verificações finais
`npm run smoke` **1891/1891** verde (blocos `── M2b ──`, `── M2c ──`, `── M2d ──`) · `npx expo-doctor` **18/18** · `git diff --check` limpo · **device PASS** (quiz coerente, reflexão específica, finalização clara, histórias grátis sem regressão).

### Backlog aberto (não autorizado)
2ª rodada do M2b (~30 perguntas: `daniel_q7`, `esther_q2/3/7`, `ruth_q3`, `mary_q3/4/6/8`, citações verbatim) · bloco de **Economia/Recompensas** (estrelinhas + conquistas + avatares, considerando os 3 jogos do Brincar).
