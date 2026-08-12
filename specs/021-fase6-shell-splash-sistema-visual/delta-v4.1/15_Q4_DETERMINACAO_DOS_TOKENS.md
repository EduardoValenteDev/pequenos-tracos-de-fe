# 15 — `Q4`, passo 1: determinação de `grid` e `displayScaleTablet`

> **Task:** `TK-C-015` (`F6-R1.3` · `F6-SG-C`) · **Commit:** `C-GOV1` (registro)
> **Precondição cumprida:** `TK-C-014` (`C-C9` = `a1b4380`)
> **Mudança em código nesta task: NENHUMA.** `src/theme/tokens.js` foi lido, não editado.

---

## 1. O que esta task decide — e o que ela não decide

`TK-C-015` responde **uma** pergunta, por *token*, e nada além dela:

> existe **consumidor legítimo** — um consumidor que precise do valor **pela sua semântica**,
> e não um consumidor criado para justificar a existência do *token*?

O que ela **não** faz, por texto explícito da própria task:

- não integra consumidor e não remove *token* — isso é **`TK-C-061`** (`Q4` passo 2, `C-C7`);
- não cria `TA-8` nem `G-RSP-2` — o portão **nasce em `TK-C-061`** (campo *Gate* de `TK-C-015`
  está vazio de propósito: *"esta task determina; o portão é criado em `TK-C-061`"*).

Duas regras invioláveis do fundador governam a determinação: **é proibido criar consumidor
artificial apenas para salvar o *token*** e **é proibido remover o *token* antes da
determinação**. Os dois vereditos são independentes — um *token* pode terminar diferente do outro.

## 2. Método

Medição no código de hoje (`HEAD` = `a1b4380`, árvore limpa), não em relatório histórico:

1. varredura de `src/**` pelos dois símbolos;
2. descarte manual dos **homônimos** — `grid` é nome comum de `StyleSheet` no app e aparece em
   seis telas como chave de estilo (`BeniChestScreen.js:407`, `BrincarScreen.js:432`,
   `MonteACenaGalleryScreen.js:147`, `StorybookProfilePage.js:121`, `TrophiesScreen.js:552`,
   `monteACenaGeometry.js:319`), **sem nenhuma relação** com `tokens.grid`;
3. descarte da **auto-referência**: `tokens.js:154-155` são o agregador `tokens = { … }`
   reexportando os próprios símbolos. Reexportar não é consumir;
4. descarte do **inventário**: as ocorrências de `displayScaleTablet` em `scripts/smoke.js`
   (`:23359`, `:23404`) são o portão que confere a *existência* do *token*, não uso por semântica;
5. leitura dirigida dos quatro arquétipos escritos em `TK-C-004`..`TK-C-013`.

## 3. Veredito — `grid`

**CONSUMIDOR LEGÍTIMO IDENTIFICADO.**

| | |
|---|---|
| **Declaração** | `src/theme/tokens.js:136` — `export const grid = { phone: 1, tablet: 2, tabletL: 3 };` |
| **Consumidor** | `src/components/layout/HubSurface.js:3` (import), `:34-36` (uso), `:41` (recuo conservador) |
| **Legitimidade** | semântica exata, não conveniente |

O `HubSurface` usa os três valores como **teto de colunas por faixa** — `grid.phone` na compacta,
`grid.tablet` na média, `grid.tabletL` na expandida — e o comentário `:32` grava a razão da
legitimidade em uma linha: *"Os valores são de `tokens.grid` — nunca escritos aqui."* O consumo é
do **significado declarado** do *token* ("colunas por *breakpoint*"), e o arquétipo seria obrigado
a inventar 1/2/3 na mão se o *token* não existisse.

Este consumidor **não** foi criado para salvar o *token*: ele nasceu em `TK-C-004` para cumprir
`SD-2`/`Q3` (*"grid\[band\] é teto, não ordem universal de colunas"*), e o teto é exigido por
`TA-14 [8/21]`, que reprova o arquétipo se a resposta ultrapassar `grid[band]`. O *token* foi
adotado pelo requisito; o requisito não foi inventado para o *token*.

## 4. Veredito — `displayScaleTablet`

**ZERO CONSUMIDORES EM `src/` HOJE — E, MESMO ASSIM, O DESFECHO É O RAMO (a), NÃO OBSOLESCÊNCIA.**

Os dois fatos, separados, porque só o primeiro é medição:

**Fato medido.** `src/theme/tokens.js:137` é a **única** ocorrência do símbolo em `src/`, fora da
reexportação do agregador em `:155`. Nenhum dos quatro arquétipos o importa; nenhuma tela o
importa. Pela leitura do código isolado, o veredito seria *"sem consumidor legítimo — candidato a
obsolescência controlada"*.

**Determinação vinculante.** A leitura do código isolado **não** é a autoridade aqui. O
`04_PLAN_DELTA_F6.md` §17.2 já resolveu `Q4` *token* a *token*, e o fez **com** este fato à vista:

- `04_PLAN_DELTA_F6.md:736` — `displayScaleTablet` · **0 consumidores** ·
  ✅ **PERTENCE — ganha consumidor real** · *"Escala do tipo de exibição (`fontSize.display: 34`,
  `fontSize.displayXL: 40`, família `Fraunces`) nas faixas **média e expandida**, aplicada por um
  único auxiliar dos arquétipos Hub e Editorial"*;
- `:738-741` — a forma de **dois estados** num sistema de **três faixas** é *"intencional e
  mantida"*: a faixa expandida ganha **composição**, não heróis maiores. *"O token permanece com o
  nome e o valor atuais"*;
- `:743-745` — *"**Nenhum dos dois é aposentado.** … nada foi removido preventivamente"*;
- `:1353` (§41.3, `Q4` resolvida) — *"**`displayScaleTablet` PERTENCE** (escala do tipo de exibição
  nas faixas média e expandida)"*.

O PLAN precede as TASKS na ordem documental (`AGENTS.md`: fonte de verdade → constituição →
`AGENTS.md` → `CLAUDE.md` → spec → **plan** → **tasks** → sessão). Logo o ramo (b) de `TK-C-061`
está **fechado** para este *token*: a obsolescência já foi considerada e recusada por escrito, no
artefato de maior precedência, com o "0 consumidores" na mesa.

**Isto viola a proibição de "consumidor artificial"?** Não, e a distinção é o ponto inteiro desta
determinação. A proibição alcança um consumidor **inventado para justificar o *token***. Aqui a
ordem causal é inversa e está registrada: existe um requisito de `F6-R1` — a escala do tipo de
exibição nas faixas média e expandida — declarado no PLAN **antes** e **independentemente** desta
task, e o *token* é o valor que esse requisito precisa. `TK-C-061` cumpre um requisito e, de
quebra, dá consumidor ao *token*; não fabrica um consumidor e, de quebra, inventa um requisito.

O que torna isso **verificável** em vez de retórico é a forma exigida: **um único auxiliar**
compartilhado por Hub e Editorial. Consumidor artificial tende ao oposto — pontual, decorativo,
colado onde der. Um auxiliar único, com duas famílias perguntando a ele, é composição.

## 5. Consequências para `TK-C-061` (`Q4` passo 2 · `C-C7`)

Determinado aqui, a executar lá:

1. **`grid`** — ramo (a) **já satisfeito**: o consumidor existe e está medido. `TK-C-061` não
   precisa criar nada para ele; precisa apenas que `G-RSP-2` o exija.
2. **`displayScaleTablet`** — ramo (a) **a satisfazer**: criar o auxiliar único de escala do tipo
   de exibição descrito em `04_PLAN_DELTA_F6.md:736`, consumido por Hub e Editorial, escalando
   `fontSize.display`/`fontSize.displayXL` (`tokens.js:79-80`) nas faixas **média e expandida** —
   e **só** nelas, porque a forma de dois estados é a política, não um resíduo.
3. **`G-RSP-2`** nasce em `scripts/smoke.js` exigindo consumidor real para **os dois** *tokens*
   (ramo (a) em ambos). Prova: `TA-8`. Prova vermelha independente: `MT-8` (`TK-C-048`), cuja
   mutação canônica é *"remover o consumidor de `grid`"*.
4. `src/theme/tokens.js` é **área protegida** (design system) — a autorização para tocá-lo é `Q9`,
   e vale para `TK-C-061`/`TK-C-016`, **não** para esta task.

## 6. Por que `TA-8` não foi criado agora

`TA-8` é *"portão estático: `grid` e `displayScaleTablet` têm **pelo menos um** consumidor real"*
(`04_PLAN_DELTA_F6.md:943`). Criado hoje, ele seria **vermelho por construção** — o segundo *token*
não tem consumidor, e só passa a ter em `TK-C-061`. Escrevê-lo agora exigiria ou deixar a árvore
vermelha, ou enfraquecer a asserção para caber no presente — as duas coisas piores que esperar uma
task. O campo *Gate* vazio de `TK-C-015` já dizia isso; o registro apenas confirma que foi
obedecido, e não esquecido.

## 7. Estado deste registro

- **Auto:** parcial (a determinação é leitura dirigida; o portão que a automatiza é `TK-C-061`).
- **Física futura:** não.
- **Gate de bundleabilidade:** **não disparado** — este pacote é documentação pura
  (`specs/**`), sem tocar o grafo executável (`AGENTS.md`, *"Documentação pura não dispara a
  obrigação"*). O último `verify:runtime` verde é o de `C-C9`: bundle Android `EXIT=0` +
  smoke **4926/4926**.
- **Rollback:** não aplicável — nada muda no código.
