# Sprint 19.2.1 — Relatório de Alinhamento de Metadados

**Data:** 2026-06-01  
**Smoke antes:** 620/620  
**Smoke depois:** 620/620 ✓  
**Arquivo alterado:** `src/data/stories.js`  
**textoNarracao alterado novamente:** NÃO  
**Lógica do app alterada:** NÃO  
**IDs preservados:** SIM  
**Slugs preservados:** SIM  
**Nomes de áudio preservados:** SIM  
**Assets alterados:** NÃO

---

## Resumo executivo

A Sprint 19.2.1 alinhou os metadados editoriais visíveis de `src/data/stories.js` aos títulos revisados aprovados na Sprint 19.2. Foram corrigidos comentários de bloco, `parentSummary`, `shortDescription`, `mensagemBoasVindas`, `storyBeat`, `coloringGoal`, `quizFocus`, `reflectionPrompt`, títulos de cena, `instrucaoColorir`, `tituloColorir`, `licaoCurta` e `mensagemGuia` — sem alterar nenhum `textoNarracao`, nenhum id, nenhum slug, nenhum campo de lógica e nenhum asset.

---

## Histórias afetadas

| História | storyId | Campos alterados |
|---|---|---|
| Noé e o Sinal da Aliança | noah | Comentário, parentSummary, scenePlan cena 10, titulo cena 10, instrucaoColorir, tituloColorir |
| Jonas e o Grande Peixe | jonah_big_fish | Comentário |
| José e a Túnica Especial | joseph_colorful_coat | Comentário, storyBeat cenas 1 e 4, instrucaoColorir, tituloColorir, mensagemGuia cena 1 |
| Maria Recebe a Boa Notícia | mary_says_yes | Comentário, shortDescription, mensagemBoasVindas, storyBeat cenas 9 e 10, titulo cena 10, mensagemGuia cena 10 |
| Jesus no Templo | jesus_temple | reflectionPrompt scenePlan cena 5, licaoCurta cena 5 |

---

## Detalhamento por história

---

### Noé e o Sinal da Aliança (noah)

**Termos removidos:** `Noé e o Arco-Íris` (comentário), `o arco-íris como sinal eterno` (parentSummary), `O arco-íris da promessa` (scenePlan/cena titulo), `o arco-íris é o sinal eterno` (storyBeat), `arco-íris com todas as cores cruzando o céu` (coloringGoal), `O que o arco-íris representa?` (quizFocus), `Quando você vê um arco-íris` (reflectionPrompt), `O arco-íris: a promessa de Deus` (titulo cena 10), `O arco-íris enorme no céu` (instrucaoColorir), `O arco-íris de Deus` (tituloColorir)

**Termos adotados:** `Noé e o Sinal da Aliança`, `O sinal da aliança`, `arco nas nuvens`, `sinal eterno da promessa`

| Campo | Antes | Depois |
|---|---|---|
| Comentário de bloco | `Noé e o Arco-Íris` | `Noé e o Sinal da Aliança` |
| parentSummary | `...aliança com o arco-íris como sinal eterno.` | `...aliança com Noé e coloca o arco nas nuvens como sinal eterno da promessa.` |
| scenePlan[10].title | `O arco-íris da promessa` | `O sinal da aliança` |
| scenePlan[10].storyBeat | `...o arco-íris é o sinal eterno dessa promessa.` | `...coloca o arco nas nuvens como sinal eterno de sua promessa.` |
| scenePlan[10].coloringGoal | `arco-íris com todas as cores cruzando o céu` | `arco nas nuvens com cores — sinal da aliança de Deus` |
| scenePlan[10].quizFocus | `O que o arco-íris representa?` | `O que Deus colocou nas nuvens como sinal da promessa?` |
| scenePlan[10].reflectionPrompt | `Quando você vê um arco-íris, do que vai se lembrar?` | `Quando você vê o arco nas nuvens, do que vai se lembrar?` |
| cena 10 titulo | `O arco-íris: a promessa de Deus` | `O sinal da aliança` |
| cena 10 instrucaoColorir | `O arco-íris enorme no céu — cada faixa na sua cor...` | `O arco nas nuvens — sinal da promessa de Deus! Pinte cada faixa...` |
| cena 10 tituloColorir | `O arco-íris de Deus` | `O sinal da aliança` |

**Termos preservados intencionalmente:** `emoji: '🌈'` (não é texto exibido como rótulo editorial) — mantido pois o arco-íris é o símbolo visual associado à história.

---

### Jonas e o Grande Peixe (jonah_big_fish)

**Termos removidos:** `Jonas e o Peixe` (comentário de bloco)

| Campo | Antes | Depois |
|---|---|---|
| Comentário de bloco | `Jonas e o Peixe` | `Jonas e o Grande Peixe` |

Nenhum campo editorial continha o termo antigo além do comentário.

---

### José e a Túnica Especial (joseph_colorful_coat)

**Termos removidos:** `José e o Manto Colorido` (comentário), `manto de muitas cores` (storyBeat cena 1), `manto cheio de sangue ao pai` (storyBeat cena 4), `manto colorido` (tituloColorir cena 1), `Pinte o manto de José` (instrucaoColorir cena 1), `Que manto lindo você criou!` (mensagemGuia cena 1)

**Termos adotados:** `José e a Túnica Especial`, `túnica especial`, `a túnica ao pai`

| Campo | Antes | Depois |
|---|---|---|
| Comentário de bloco | `José e o Manto Colorido` | `José e a Túnica Especial` |
| scenePlan[1].storyBeat | `...manto de muitas cores — o que desperta inveja.` | `...túnica especial — o que desperta inveja dos irmãos.` |
| scenePlan[4].storyBeat | `...levam o manto cheio de sangue ao pai.` | `...levam a túnica ao pai para provar o ocorrido.` |
| cena 1 instrucaoColorir | `Pinte o manto de José com listras...` | `Pinte a túnica especial de José com listras...` |
| cena 1 tituloColorir | `O manto colorido` | `A túnica especial` |
| cena 1 mensagemGuia | `Que manto lindo você criou!` | `Que túnica linda você criou!` |

**Nota sobre coloringGoal da cena 1 no scenePlan:** mantido como `'manto colorido com listras e padrões vibrantes'` — ajustado para `'túnica especial com listras e padrões vibrantes'`. Este campo é internal/editorial, mas foi alinhado como parte do mesmo contexto.

---

### Maria Recebe a Boa Notícia (mary_says_yes)

**Termos removidos:** `Maria Diz Sim` (comentário), `O sim de Maria ao anjo Gabriel mudou a história do mundo` (shortDescription), `O sim de Maria mudou o mundo` (mensagemBoasVindas), `O maior sim da história` (storyBeat e titulo cena 10)

**Termos adotados:** `Maria Recebe a Boa Notícia`, `Maria respondeu com fé e humildade`, `A resposta de Maria`, `A resposta de fé de Maria`

| Campo | Antes | Depois |
|---|---|---|
| Comentário de bloco | `Maria Diz Sim` | `Maria Recebe a Boa Notícia` |
| shortDescription | `O sim de Maria ao anjo Gabriel mudou a história do mundo.` | `Maria recebeu a boa notícia do anjo Gabriel e respondeu com fé e humildade.` |
| mensagemBoasVindas | `O sim de Maria mudou o mundo — o seu sim a Deus também importa!` | `Maria respondeu com fé e humildade — você também pode responder ao chamado de Deus!` |
| scenePlan[9].storyBeat | `"Eis a serva do Senhor..." O maior sim da história.` | `"Eis a serva do Senhor..." Maria respondeu com fé e humildade.` |
| scenePlan[9].title | `O sim de Maria` | `A resposta de Maria` |
| scenePlan[10].title | `O maior sim da história` | `A resposta de fé de Maria` |
| scenePlan[10].storyBeat | `Com um sim de fé, Maria participou do plano de salvação de toda a humanidade.` | `Com fé e humildade, Maria participou do plano de Deus para o mundo.` |
| scenePlan[10].quizFocus | `Por que o sim de Maria foi tão importante para a história?` | `Por que a resposta de Maria foi tão importante?` |
| cena 10 titulo | `O maior sim da história` | `A resposta de fé de Maria` |
| cena 10 mensagemGuia | `Você completou a história de Maria! Parabéns!` | `Você completou a história de Maria! A fé dela nos inspira!` |

**Termos preservados intencionalmente:**
- `titulo: '"Cheia de graça"'` (cena 3) — mantido como título de cena entre aspas: é uma citação bíblica direta marcada como tal, não uma afirmação teológica autônoma. Não aparece como rótulo independente.
- `licaoCurta: 'Um sim a Deus pode mudar tudo!'` (cena 9) — mantida como lição geral de fé, não vinculada especificamente ao "sim de Maria" como slogan.
- `slug: 'maria_diz_sim'` — não alterado (instrução explícita).
- `storyId: 'mary_says_yes'` — não alterado (instrução explícita).
- Pasta de áudio `mary_says_yes` — não alterada (instrução explícita).

---

### Jesus no Templo (jesus_temple)

**Termos ajustados:** `'Quando você procura Jesus com toda a sua força, você sempre O encontra.'` (reflectionPrompt cena 5) e `'Quando procuramos Jesus com toda a força, O encontramos!'` (licaoCurta cena 5)

**Motivo:** Linguagem de promessa automática — conflita com o guia de linguagem infantil segura (evitar promessas absolutas que possam gerar frustração quando não confirmadas pela experiência da criança).

| Campo | Antes | Depois |
|---|---|---|
| scenePlan[5].reflectionPrompt | `Quando você procura Jesus com toda a sua força, você sempre O encontra.` | `Podemos buscar Jesus com confiança e com o coração aberto.` |
| cena 5 licaoCurta | `Quando procuramos Jesus com toda a força, O encontramos!` | `É bom manter Jesus perto do coração!` |

---

## Validações executadas

### Termos antigos removidos

```powershell
Select-String -Path "src\data\stories.js" -Pattern "Noé e o Arco-Íris|Jonas e o Peixe|José e o Manto Colorido|Maria Diz Sim"
```
**Resultado:** ✓ Nenhuma ocorrência encontrada

### Termos de produção

```powershell
Select-String -Path "src\data\stories.js" -Pattern "Direção de voz|Sonoplastia|SFX|trilha sonora|efeito sonoro|voz do narrador"
```
**Resultado:** ✓ Nenhuma ocorrência encontrada

### Smoke

```
620/620 passed, 0 failed
```

---

## Campos NÃO alterados (confirmado)

| Campo | Alterado? |
|---|---|
| textoNarracao (todas as cenas) | NÃO |
| storyId (id da história) | NÃO |
| slug | NÃO |
| audio | NÃO |
| imagemNarracao / imagemColorir | NÃO |
| accessType / status | NÃO |
| referencia bíblica | NÃO |
| licaoCoracao | NÃO |
| Qualquer arquivo fora de stories.js | NÃO |
