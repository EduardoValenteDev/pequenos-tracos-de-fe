# Tasks — M2 · Alinhamento de conteúdo (M2b quiz · M2c reflexão · M2d finalização)

> **Etapa SDD 5.** Micro-tasks atômicas (executadas **só após Portão 3**). **M2a = NO-OP** (texto de cena verificado). Nada é executado agora.
> Lanes de commit: `[código/dados]` · `[governança]` (docs SDD). Nunca misturar. Sem áudio/assets/app.json/eas.json.

## M2b — Quiz (foco principal)
Curadoria das 160 perguntas (20×8) contra a narração oficial. Critério aprovado: **MANTER** (derivável do texto) · **REESCREVER** (pergunta boa, detalhe não narrado) · **SUBSTITUIR** (sem base natural). 8/história, `id` estável, `correct` sempre válido.

### T-b1 — Reescrever perguntas de ALTA prioridade (detalhe/número/nome/termo NÃO narrado)
| id | Problema (narração diz) | Redação proposta (resposta correta) |
|---|---|---|
| `noah_q4` | roteiro usa **"arco nas nuvens"**, não "arco-íris" | resposta → **"Um arco nas nuvens"** (ajustar distratores se preciso) |
| `david_q7` | narração: "**muitos dias**" (sem número) | pergunta → "Por quanto tempo Golias desafiou Israel?"; resposta → **"Durante muitos dias"** |
| `abraham_q5` | "sono profundo" **não narrado** | resposta → **"Ele esperou diante de Deus"** (narrado cena 7-8) |
| `abraham_q6` | narração: "**a presença de Deus** passou entre os animais" | resposta → **"A presença de Deus"** |
| `joseph_q1` | narração: "**túnica especial**" | resposta → **"Uma túnica especial"** |
| `esther_q1` | narração não nomeia o rei nem "todas as moças" | resposta → **"O rei a escolheu para ser rainha"** |
| `esther_q5` | "Se eu perecer, pereço" **não narrado** | resposta → **"Mesmo com medo, decidiu ir falar com o rei"** |
| `esther_q6` | narração: "o rei a recebeu **com favor**" (sem cetro) | resposta → **"A recebeu com favor"** |
| `samuel_q7` | quote de Eli **não narrado** | resposta → **"Reconheceu que o Senhor havia falado"** |
| `josiah_q1` | narração: "**muito jovem**" (sem idade) | pergunta → "Como Josias se tornou rei?"; resposta → **"Ainda muito jovem"** |
| `josiah_q5` | "rasgou as roupas" **não narrado** | resposta → **"Ficou profundamente tocado e arrependido"** |
| `josiah_q6` | "profetisa Hulda" **não narrada** | **SUBSTITUIR**: "O que Josias fez ao ouvir a Lei?" → "Levou a palavra de Deus a sério e buscou orientação" |
| `solomon_q3` | "criança que não sabe entrar nem sair" **não narrado** | resposta → **"Reconheceu que precisava da ajuda de Deus"** |
| `timothy_q1` | "Listra" **não narrada** | **SUBSTITUIR**. _Publicado:_ "Onde a fé de Timóteo começou a ser cultivada?" → **"Dentro de casa, com sua família"** (a redação inicialmente proposta — "Com a avó Loide e a mãe Eunice" — duplicaria `timothy_q2`/`timothy_q3`) |
| `timothy_q6` | "Deixou Listra" — Listra não narrada | resposta → **"Tornou-se colaborador de Paulo na missão"** |
| `timothy_q7` | "Avive a chama" **não narrado** | resposta → **"Ser exemplo no falar, no amor, na fé e na pureza"** (narrado cena 8) |

### T-b2 — Reescrever perguntas de MÉDIA prioridade (detalhe levemente fora)
| id | Ajuste |
|---|---|
| `jonah_q6` | "O cuspiu na praia" → **"O deixou em terra seca"** |
| `moses_q7` | "presas na areia molhada" → **"Deus confundiu/atrapalhou seus carros"** |
| `moses_q4` | "coluna de nuvem e fogo" → **"A coluna de nuvem"** (narração só cita nuvem) |
| `samuel_q2` | "templo perto da arca" → **"Deitado no tabernáculo"** |

### T-b3 — Ajustes de BAIXA prioridade (opcionais, cosméticos) — a confirmar com Eduardo
`noah_q8` "ramo"→"folha" de oliveira · `samaritan_q3` "Vai e faz"→"Vá e faça" (grafia) · `temple_q7` "negócios"→"casa" de meu Pai · `mary_q1`/`josiah_q4` termos extras (Bíblia, mas não narrados) — **manter salvo pedido**.

> **Executado (Portão 3, Eduardo autorizou):** os 3 primeiros foram aplicados (`noah_q8`, `samaritan_q3`, `temple_q7`, todos com apoio claro na narração). `mary_q1` e `josiah_q4` foram **MANTIDOS** (termos bíblicos aceitáveis). Total do M2b: 16 (alta) + 4 (média) + 3 (baixa) = **23 perguntas alteradas**.

### T-b4 — MANTER (default): as demais ~136 perguntas
São derivadas do texto narrado (fato/conceito/moral com sinônimos). Não tocar. Ex.: todas de `creation`, `jesus_children`, morais `*_q6`/`*_q8`, números realmente narrados (`noah_q7` quarenta dias, `daniel_q4` três vezes, `jonah_q2` três dias, `lost_q1` cem, `temple_q2` doze, `temple_q3` três dias).

_Aceite M2b:_ só cenas das tabelas T-b1/T-b2 (+T-b3 se aprovado) mudam; 8/história; ids estáveis (SUBSTITUIR mantém id); `correct` válido; nenhuma resposta sem base na narração.

## M2c — Reflexão "Guardar no coração"
- **T-c1:** adicionar por história um **texto curto de lição** (2–3 frases derivadas do `licaoCoracao`/roteiro) — novo campo em `stories.js` (ex.: `reflexaoLicao`) **sem** mexer em `textoNarracao`/ids.
- **T-c2:** `ReflectionScreen` exibe esse texto antes/junto das 2 perguntas, **sem** alterar o fluxo/`@ptf_*` de reflexão (bloco 4C). _Publicado:_ exibido **no passo final `done`**, display-only, após as 2 perguntas.
_Aceite:_ texto específico por história; fluxo e chaves intactos.

## M2d — Finalização (área sensível)
- **T-d1:** definir padrão único: última cena → botão **"Concluir história ⭐"** → tela de conclusão + ações; **remover auto-finalizar** na última cena. **Sem estrela extra de conclusão**: a estrela vem de `salvarCena` (idempotente) da própria cena 10; na revisita o rótulo é **"Ver conclusão →"** e nada é recompensado de novo.
- **T-d2:** ajustar **apenas** `NarrationScreen` (rótulo/ação da última cena). `CongratsScreen`, `PostStoryHubScreen` e `storyJourneyService` **NÃO** são tocados — `journeyComplete` e o cálculo de estrela ficam intactos.
- **T-d3:** regressão de progresso (`journeyComplete`, contagem de estrela) em smoke + device.
_Aceite:_ conclusão padronizada; sem auto-finalizar; progresso/estrela sem regressão.

## M2e — Smoke (por subfase)
- Quiz: 8/história; ids únicos; `correct` índice válido; (novo) termo-chave da resposta corrigida aparece na narração.
- Reflexão: campo de lição presente por história.
- Finalização: `journeyComplete` inalterado; `NarrationScreen` **sem `addBonusStars`** (zero estrela extra); rótulos "Concluir história ⭐" / "Ver conclusão →".

## M2f — Governança
Commit `[governança]` com docs SDD do M2 (spec/clarify/plan/tasks/analyze) — separado do código.

## Ordem e commits
1. **M2b** quiz (`quizzes.js` + smoke) — 1 commit `[dados]`.
2. **M2c** reflexão (`stories.js` campo lição + `ReflectionScreen` + smoke) — 1 commit `[código]`.
3. **M2d** finalização (screens + service + smoke) — 1 commit `[código]`, mais testes.
4. **M2f** governança (docs SDD) — 1 commit `[governança]`.
Cada um com gates + device. **Sem push sem autorização.**
