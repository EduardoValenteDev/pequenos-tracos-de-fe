# Provas vermelhas consolidadas de `F6-SG-C` — `TK-C-036` e `TK-C-037`

> **Pacote:** `BLOCO 6` · `F6-SG-C` · **Commit deste artefato:** `C-GOV1` ·
> **Mudança de código esperada:** **nenhuma** — todas as 14 mutações foram revertidas e
> **nenhuma** foi commitada.
>
> Duas tasks, um argumento só. `TK-C-036` mostra o conjunto **verde na árvore boa**;
> `TK-C-037` mostra cada portão **vermelho quando o defeito que ele existe para pegar
> volta**. Verde sem vermelho é uma linha de log que sempre diz sim; vermelho sem verde é
> um portão que reprova tudo. Só os dois juntos provam alguma coisa.

---

## 1. `TK-C-036` — o conjunto automatizado, verde

| Item | Valor |
|---|---|
| `HEAD` | **`da16b18`** |
| `npm run bundle:check` | **`EXIT=0`** — grafo Android transforma e serializa |
| `npm run smoke` | **4942/4942**, **0 falhas** |
| `npx expo-doctor` | **18/18** (executado em `e2702d2`, porque `app.json` mudou e um *plugin* foi registrado — não por ritual) |
| Árvore | **limpa** (`git status --porcelain` vazio) |

### 1.1 Os doze portões que a task nomeia, um a um

| Portão | Índices | Estado |
|---|---|---|
| `G-BP-1` | `[4529]` · `[4530]` · `[4531]` | ✓ (três cláusulas) |
| `G-RSP-1` | `[4544]` | ✓ |
| `G-RSP-2` | `[4928]` · `[4929]` | ✓ (duas cláusulas) |
| `G-RSP-3` | `[4545]` (antecipado, bloco `TK-A-094`) · `[4548]` (`TK-C-060`) | ✓ |
| `G-RSP-4` | `[4940]` | ✓ |
| `G-RSP-5` | `[4926]` | ✓ (dois eixos numa asserção) |
| `G-RSP-6` | `[4927]` | ✓ (quatro cláusulas numa asserção) |
| `G-RSP-7` | `[4546]` · `[4547]` | ✓ (duas metades) |
| `G-SID-1` | `[4933]` | ✓ |
| `G-SID-2` | `[4934]` | ✓ |
| `G-SID-3` | `[4935]` | ✓ |
| `G-SID-4` | `[4936]` | ✓ |

Os arneses de teste que a task também pede — `TA-6`, `TA-7`, `TA-8`, `TA-9`, `TA-10`,
`TA-14` (21 cláusulas + os mutantes mortos internos) e `TA-15` — estão presentes e verdes
na mesma execução.

---

## 2. `TK-C-037` — quadro consolidado das 14 provas vermelhas

Cada linha abaixo é **uma task própria**, com **uma única** mutação viva por vez
(emenda `A-08`). Nenhuma task de mutação criou o portão que ela mesma prova (emendas
`A-09`/`A-10`).

| # | Task | Mutação | Portão-alvo | Resultado | Falhas | `HEAD` |
|---|---|---|---|---|---|---|
| `MT-7` | `TK-C-047` | reintroduzir `Dimensions.get` | **`G-RSP-1`** | **4941/4942** | 1 | `da16b18` |
| `MT-8` | `TK-C-048` | remover o consumidor de `grid` | **`G-RSP-2`** | **4939/4942** | 3 | `da16b18` |
| `MT-9` | `TK-C-049` | reimportar `theme/colors` na barra lateral | **`G-SID-1`** (eixo `TA-10`) | **4935/4936** | 1 | `eb11061` |
| `MT-10` | `TK-C-050` | remover um `registerGuideTarget` | **`G-SID-1`** (eixo `TA-9`) | **4933/4936** | 3 | `eb11061` |
| `MT-11` | `TK-C-051` | reintroduzir literal `768` | **`G-BP-1`** | **4940/4942** | 2 | `da16b18` |
| `MT-15` | `TK-C-024` | largura estrutural fora de `tokens.js` (forma renomeada) | **`G-SID-2`** | **4935/4936** | 1 | `eb11061` |
| `MT-16` | `TK-C-052` | derivar espaço disponível subtraindo o *token* | **`G-SID-3`** | **4935/4936** | 1 | `eb11061` |
| `MT-19` | `TK-C-053` | regra universal "tablet = duas colunas" | **`G-RSP-5`** (eixo A) | **4936/4942** | 6 | `da16b18` |
| `MT-20` | `TK-C-054` | coluna estreita cercada de vazio em `>=900dp` | **`G-RSP-6`** | **4938/4942** | 4 | `da16b18` |
| `MT-21` | `TK-C-055` | quarto *breakpoint* em `tokens.js` | **`G-RSP-7`** | **4941/4942** | 1 | `da16b18` |
| `MT-22` | `TK-C-056` | comparação literal de largura fora do *hook* de faixa | **`G-RSP-5`** (eixo B) | **4941/4942** | 1 | `da16b18` |
| `MT-23` | `TK-C-057` | sexto destino de navegação na barra | **`G-SID-4`** | **4935/4936** | 1 | `eb11061` |
| `MT-31` | `TK-C-058` | reintroduzir `Platform.isPad` decidindo *layout* | **`G-RSP-3`** | **4941/4942** | 1 | `1801405` |
| `MT-32` | `TK-C-059` | módulo de *layout* redeclara valor de `tokens.js` | **`G-RSP-4`** | **4941/4942** | 1 | `da16b18` |

**As 14 mutações canônicas do PLAN §25 aplicáveis a `R1` foram observadas falhando, uma a
uma.** Nenhum portão de `R1` ficou sem prova vermelha independente, e dois deles —
`G-SID-1` e `G-RSP-5` — foram provados por **dois defeitos distintos** cada, um por eixo
da sua asserção.

### 2.1 Por que os `HEAD` diferem, e por que isso não enfraquece a prova

As 14 execuções **não** ocorreram na mesma árvore, e isso é consequência da ordem exigida
pelas próprias tasks: cada mutante roda **depois** da task que cria o portão que ele prova.
`MT-9`/`MT-10`/`MT-15`/`MT-16`/`MT-23` rodaram em `eb11061` (artefato `17`), logo após
`TK-C-023` criar os `G-SID-*`; `MT-31` rodou em `1801405` (artefato `20`, §0), logo após
`TK-C-060`; os oito restantes rodaram em `da16b18`, o `HEAD` de `TK-C-036`.

O total de asserções cresceu de **4936** para **4942** entre esses pontos porque portões
novos nasceram no meio — não porque algum resultado mudou de sinal. Nenhuma das seis
provas antigas depende de código escrito depois delas: os portões `G-SID-*` e `G-RSP-3`
estão hoje verdes em `da16b18` (§1.1), e os arquivos que elas mutaram não foram alterados
desde então. O que uma reexecução em `da16b18` acrescentaria é conforto, não evidência.

---

## 3. Mutações que acenderam mais de um vermelho

Quatro mutantes produziram mais de uma falha: `MT-8` (3), `MT-10` (3), `MT-11` (2),
`MT-19` (6) e `MT-20` (4). Em **todos** os casos as falhas extras são **o mesmo defeito
visto por outro ângulo** — nunca defeitos distintos, e nunca uma mutação a mais.

### 3.1 `MT-8` — remover o consumidor de `grid` (3 falhas)

```
[4899] ✗ TA-14 [8/21]: … só o Hub conta colunas e o teto dele vem de `grid` (token), não de literal
[4915] ✗ TA-14 (mutante morto): M-c · o teto da faixa expandida cai para o da média
[4928] ✗ `G-RSP-2` [1/2] — `TA-8`: `grid` … tem ao menos um consumidor REAL
```

O portão-alvo `[4928]` acendeu como a task exige. As outras duas são o **contrato do
arquétipo** enxergando a mesma substituição: `TA-14 [8/21]` afirma nominalmente que o teto
do Hub vem do *token* e não de literal, e `M-c` é o detector interno do arnês para
exatamente essa troca. Se o teto deixa de vir de `grid`, é impossível que só `G-RSP-2`
perceba — e um arnês que não percebesse seria o problema, não a evidência.

### 3.2 `MT-19` — regra universal "tablet = duas colunas" (6 falhas)

```
[4893] ✗ TA-14 [2/21]  · composição por inventário × cabimento × teto nos 7 cenários
[4894] ✗ TA-14 [3/21]  · mesmo conteúdo → 1 · 2 · 3 nas três faixas
[4906] ✗ TA-14 [15/21] · densidade governada pelo inventário real
[4913] ✗ TA-14 M-a     · o Hub para de olhar o cabimento
[4914] ✗ TA-14 M-b     · o Hub para de olhar o inventário
[4926] ✗ `G-RSP-5`     · nenhuma regra universal de colunas
```

Seis vermelhos, um defeito. A mutação trocou
`Math.max(1, Math.min(teto, cabimento, inventario))` por `band === COMPACT ? 1 : 2` —
isto é, apagou **de uma vez** as três entradas da composição. `TA-14` foi escrito
justamente para que a "regra universal de colunas" não tivesse onde se esconder, então
cada cláusula que menciona inventário ou cabimento acende. Que `G-RSP-5` e `TA-14`
concordem é a propriedade desejada: o portão de produto e o contrato do arquétipo estão
falando da mesma coisa.

### 3.3 `MT-20` — coluna estreita cercada de vazio (4 falhas)

```
[4903] ✗ TA-14 [12/21] · a coluna editorial para na medida de leitura nas três faixas
[4904] ✗ TA-14 [13/21] · o Editorial PERGUNTA a largura a `ContentContainer`
[4921] ✗ TA-14 M-i     · o Editorial reimplementa a largura em vez de perguntar ao dono
[4927] ✗ `G-RSP-6`     · nenhuma coluna estreita cercada de vazio em `>=900dp`
```

A mutação (`const columnMaxWidth = 420;` no lugar de `contentColumnMaxWidth(band)`) é ao
mesmo tempo "coluna abaixo do limiar" e "reimplementar em vez de perguntar" — são duas
descrições do mesmo `P-30`. A cláusula (A) de `G-RSP-6` foi escrita citando `MT-20`
nominalmente, e é ela que acendeu.

### 3.4 `MT-11` — literal `768` (2 falhas)

```
[4530] ✗ G-BP-1 [2/3]  · nenhuma comparação de largura contra o literal 768 sobrevive em `src`
[4926] ✗ `G-RSP-5`     · … nenhuma comparação literal de largura decide composição fora de `useWindowBand`
```

**Sobreposição por construção, não por acidente.** `B1_LITERAL` (`G-BP-1`) casa
`width [<>]= 768`; `G5_LITERAL` (eixo B de `G-RSP-5`) casa `width [<>]= \d{2,4}`. O
segundo é a generalização deliberada do primeiro: `G-BP-1` é o portão **herdado** que
guarda o valor específico de `P-30`, e `G-RSP-5` é o portão **novo** que guarda a classe
inteira do defeito. Todo literal `768` é também um literal de 2–4 dígitos. As duas
proteções são intencionalmente redundantes nesse ponto e independentes fora dele — `MT-22`
(`width > 900`) acende **só** `G-RSP-5`, e é essa assimetria que prova que não são o mesmo
portão escrito duas vezes.

### 3.5 O caso simétrico: mutações que acenderam **exatamente um**

`MT-7`, `MT-21`, `MT-22`, `MT-32` (mais `MT-9`, `MT-15`, `MT-16`, `MT-23`, `MT-31` das
rodadas anteriores) produziram **uma única** falha cada. Vale registrar o que isso custou
de desenho, porque não foi automático:

- **`MT-7`** foi colocado em `src/screens/PostStoryHubScreen.js` — tela, **não** módulo de
  *layout* — porque a região pura dos arquétipos é avaliada pelo arnês com dependências
  injetadas, e uma mutação lá derruba o arnês antes do sumário (achado de `MT-31`,
  artefato `20` §0). A comparação escolhida (`> 0`) tem **um** dígito, então `G5_LITERAL`
  (`\d{2,4}`) não casa.
- **`MT-32`** usa `maxWidth: 640` porque `640` **é** `maxContentWidth.tabletL`, e o eixo
  numérico de `G-RSP-4` só considera valores de `tokens.js` inteiros `>= 10`. Um literal
  arbitrário como o `420` de `MT-20` **não** acende `G-RSP-4` — e de fato não acendeu,
  o que delimita com precisão o que aquele portão promete: ele pega **redeclaração de
  valor do *design system***, não "número mágico" em geral.

---

## 4. Controles negativos que as tasks pedem nominalmente

| Controle | Task | Estado |
|---|---|---|
| **`CN-7`** — `P-30`/`G-BP-1` verdes, zero literais `768` | `TK-C-051` | **reexecutado após a reversão** — `[4530]` verde, *smoke* **4942/4942**. A proteção herdada de `P-30` **não** sofreu regressão (emenda `A-16`). |
| **`CN-5`** — nenhum destino novo na barra | `TK-C-057` | reexecutado em `eb11061`; a ressalva sobre a asserção **dedicada** de `CN-5` ainda não existir está registrada no artefato `17` §6.1 e **não** é reaberta aqui. |

---

## 5. O que estas 14 provas **não** cobrem

| Propriedade | Estado |
|---|---|
| Os portões pegam os defeitos canônicos do PLAN §25 | **PROVADO** — 14 de 14 |
| Os portões pegam **qualquer** defeito da mesma classe | **NÃO PROVADO** — mutação prova sensibilidade a um defeito nomeado, não completude |
| A composição resultante é **boa** para a criança | **NÃO PROVADO POR AQUI** — é validação perceptual, `TK-C-038`..`TK-C-043` |
| Comportamento em aparelho real | **NÃO EXERCITADO** — `TK-C-062` segue **PENDENTE — SEM APARELHO** |

Nada neste artefato move `SD-1`, que permanece **não concedível** enquanto `TK-C-062`
estiver pendente (emenda `A-13`). Um portão provado vermelho continua sendo um portão
estático: ele diz que a regra tem dentes, não que a tela está bonita.

---

## 6. Higiene

| Item | Estado |
|---|---|
| Mutações commitadas | **nenhuma** — as 14 tasks declaram *Commit:* **nenhum** |
| Reversão | `git checkout -- <arquivo>` em cada uma; os arquivos mutados estavam **commitados**, nenhum trabalho não commitado foi posto em risco |
| Árvore ao fim de cada mutação | **limpa** (`git status --porcelain` vazio) — critério de conclusão da emenda `A-08` |
| Árvore ao fim da série | **limpa** · `npm run verify:runtime` **verde** (*bundle* `EXIT=0`, *smoke* **4942/4942**) |
| `verify:runtime` para **este** artefato | **não** re-executado por causa dele: alteração é documental pura (`specs/**`), que por `AGENTS.md` não dispara bundleabilidade. Rodou porque as **mutações** são alteração de `src/` — e a árvore voltou verde depois da última |

---

## 7. Referências

`TK-C-036`, `TK-C-037`, `TK-C-024`, `TK-C-047`..`TK-C-059`, `TK-C-062` ·
emendas `A-08`, `A-09`, `A-10`, `A-13`, `A-16` · PLAN §25 (numeração canônica dos
mutantes), §26 · artefatos `17` (mutantes da barra lateral) e `20` §0 (`MT-31`) ·
`RG-13`.
