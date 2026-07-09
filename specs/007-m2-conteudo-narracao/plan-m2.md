# Plan — M2 · Alinhamento de conteúdo (ajustado após Portão 1)

> **Etapa SDD 4 (ajustado).** **Q1 resolvida (Portão 1, Eduardo):** M2a = **NO-OP/verificado** — `stories.js textoNarracao` == roteiro do repo **200/200** e == docx Final(8) **em palavras** (as 6 diferenças eram só aspas na conversão do docx). H1 descartada. Foco do M2: **M2b (quiz), M2c (reflexão), M2d (finalização)**. Sem código. **Portão 2: pendente.**

## Constitution Check
- Só **conteúdo/dados** (`stories.js` texto, `quizzes.js`, reflexão) + **UX de finalização**; **não** toca áudio/assets/entitlement/packs/EAS. ✅
- **Ids de cena/história, `totalCenas`, chaves `@ptf_*` e navegação intactos** (M2 é texto, não estrutura). ✅
- Áreas sensíveis (finalização afeta `journeyComplete`/estrela) → cuidado + testes. ✅

## Estratégia por sub-bloco

### M2a — texto de cena ↔ narração (**NO-OP / VERIFICADO — nada a fazer**)
- Comprovado (comparação read-only das 200 cenas): `textoNarracao` == roteiro do repo (200/200) e == docx Final(8) em palavras. **Nenhuma edição de texto de cena** no M2. Diferença de aspas na conversão do docx é cosmética e **não** será tocada (decisão do Eduardo).
- Se o Eduardo apontar uma cena onde o **MP3 fala diferente da legenda**, isso é problema de **áudio** → **auditoria separada FORA do M2**.

### M2b — quiz (foco principal do M2)
- **Padrão observado:** a narração das 5-revisões foi **suavizada/generalizada** (removeu números específicos, nomes próprios, detalhes gráficos e citações literais), mas alguns quizzes ainda perguntam **exatamente esses detalhes removidos**.
- **Auditoria heurística (revisão humana obrigatória)** cruzou `quizzes.js` × narração. Achados de **alta confiança** (fato/termo que NÃO está na narração):
  | Pergunta | Resposta | Na narração |
  |---|---|---|
  | `david_q7` | "Quarenta dias" | narração diz "**muitos dias**" (sem número) |
  | `josiah_q1` | "Oito anos" | narração diz "**muito jovem**" (sem idade) |
  | `joseph_q1` | "manto de **muitas cores**" | narração diz "**túnica especial**" (título mudou) |
  | `abraham_q6` | "**tocha de fogo**" | narração diz "**a presença de Deus** passou entre os animais" |
  | `esther_q1` | "rei **Assuero**" | narração nunca nomeia o rei (só "o rei") |
  | `esther_q6` | "**cetro dourado**" | narração diz "o rei a recebeu com favor" (sem cetro) |
  | citações verbatim (`ruth_q3`, `esther_q5`, `esther_q3`, etc.) | frases entre aspas | narração tem o **conceito**, não a **citação literal** |
- **NÃO** confiar cegamente na heurística: ela **super-sinaliza** perguntas de "moral da história" (q6/q8) que usam **sinônimos** — essas ficam. A curadoria é **por pergunta**.
- Ação: manter/reescrever/remover conforme o **critério (§ Critério de quiz)**; **8 por história**, `id` estável, `correct` válido.
- Smoke: cada `correct` é índice válido; ids únicos; 8/história; (opcional) checagem de que o termo-chave da resposta aparece na narração.

### M2c — reflexão (independe de Q1)
- Adicionar, por história, um texto curto de **explicação da lição** (derivado de `licaoCoracao`/roteiro), sem quebrar o fluxo de 2 perguntas atual.
- `ReflectionScreen` passa a exibir esse texto; dados por história.
- **Implementado:** campo aditivo `reflexaoLicao` em `stories.js` (20/20) exibido **no passo final `done`**, display-only.

### M2d — finalização (independe de Q1; área sensível)
- Definir **padrão único** (Q5): última cena → "Concluir história ⭐" → tela de conclusão + ações; **remover auto-finalizar**.
- **Sem estrela extra de conclusão** (decidido no Portão 3): a estrela da última cena é a da própria cena, via `salvarCena` idempotente. Nenhum `addBonusStars` na `NarrationScreen`.
- **Escopo real da implementação:** apenas `NarrationScreen` (rótulo/ação da última cena). `CongratsScreen`, `PostStoryHubScreen` e `storyJourneyService` **não** foram tocados — `journeyComplete` e o cálculo de estrela ficam intactos ([[ux_a0_vitrine_contrato_jornada]]).
- Testes de regressão do progresso/`journeyComplete`.

## Critério de quiz (manter / reescrever / remover)
Para cada pergunta, na ordem:
1. **MANTER** — se a resposta correta é derivável do **texto narrado** da história (fato, conceito ou moral clara, mesmo com sinônimos).
2. **REESCREVER** — se a pergunta é boa mas pede um **detalhe específico não narrado** (número, nome próprio, citação literal, detalhe removido). Reescrever para um fato **realmente narrado** OU generalizar a resposta (ex.: "Quarenta dias" → "Durante muitos dias"; "manto de muitas cores" → "uma túnica especial"; "cetro dourado" → "com favor").
3. **REMOVER + substituir** — só se a pergunta não tem base na narração e não há reescrita natural; substituir por outra pergunta respondível, mantendo **8 por história** e `id` estável quando possível.
> Prioridade: **reescrever** > remover. Nunca deixar `correct` inválido. Nunca criar pergunta cuja resposta não esteja no texto.

## Arquivos prováveis
`src/data/quizzes.js` (M2b), `src/screens/ReflectionScreen.js` + dados de reflexão em `src/data/stories.js`/`lumiReflections.js` (M2c), `src/screens/NarrationScreen.js`/`CongratsScreen.js`/`PostStoryHubScreen.js`/`src/services/storyJourneyService.js` (M2d), `scripts/smoke.js`, docs SDD. **`textoNarracao` de `stories.js` NÃO é tocado** (M2a NO-OP). **Sem áudio/assets/app.json/eas.json.**

## Sequência proposta (Tasks, após Portão 2)
1. **M2b** quiz (dados `quizzes.js`) — auditoria por pergunta + critério; commit próprio.
2. **M2c** reflexão (dados + `ReflectionScreen`) — commit próprio.
3. **M2d** finalização (UX/lógica; área sensível) — commit próprio, mais testes de regressão.
4. Smoke + device por subfase. **M2a: nada a implementar (verificado).**

## NÃO agrupar no mesmo commit
M2a (texto) · M2b (quiz) · M2c (reflexão) · M2d (finalização) — **commits separados**; governança (Final(8) versionado, se houver) em commit próprio; nunca com código.

## Riscos e mitigação
| Risco | Mitigação |
|---|---|
| Editar texto sobre roteiro errado | **Q1 antes de tudo** |
| Quebrar progresso/navegação | não mexer em ids/`totalCenas`/`@ptf_*`; M2 é conteúdo |
| Finalização afetar estrela/`journeyComplete` | regressão de progresso; área sensível |
| Quiz com `correct` inválido | smoke valida índice + ids |

## Fora do M2
Áudio (regravar/regenerar), assets de imagem, colorir, entitlement/packs/EAS, M3–M10.

**Portão 2 — aguardando (após Q1).** Este Plan é preliminar: a Q1 pode transformar M2a em no-op e reordenar o resto.
