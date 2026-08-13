# Mutantes da barra lateral — `MT-9`, `MT-10`, `MT-15`, `MT-16`, `MT-23`

> **Pacote:** `F6-R1.4` · `F6-SG-C` · **Portões sob prova:** `G-SID-1`, `G-SID-2`, `G-SID-3`,
> `G-SID-4` (criados em `06ab3ad` / `C-C9`) · **Commit deste artefato:** `C-GOV1` ·
> **Mudança de código esperada:** **nenhuma** — as cinco mutações foram revertidas.

`TK-C-023` criou os quatro portões e diz, literalmente, que **não prova nenhum deles**. Este
artefato é o registro das cinco provas vermelhas independentes que os provam, cada uma exigida
por uma task própria, todas executadas contra `eb11061`.

Um portão que nunca foi visto vermelho não é portão: é uma linha de log que sempre diz sim.

---

## 0. Linha de base

| Item | Valor |
|---|---|
| `HEAD` durante as execuções | **`eb11061`** |
| `verify:runtime` antes e depois | **verde** — *bundle* Android `EXIT=0`, *smoke* **4936/4936**, 0 falhas |
| Árvore antes e depois | **limpa** (`git status --porcelain` vazio) |
| Reversão | `git checkout -- <arquivo>` (os arquivos mutados estão **commitados**; nenhum trabalho não commitado foi posto em risco) |

---

## 1. Quadro consolidado

| # | Task | Mutação | Portão-alvo | Resultado | Falhas |
|---|---|---|---|---|---|
| `MT-9` | `TK-C-049` | reimportar `theme/colors` na barra lateral | **`G-SID-1`** (eixo `TA-10`) | **4935/4936** | 1 |
| `MT-10` | `TK-C-050` | remover um `registerGuideTarget` | **`G-SID-1`** (eixo `TA-9`) | **4933/4936** | 3 |
| `MT-15` | `TK-C-024` | largura estrutural fora de `tokens.js` — forma **renomeada** | **`G-SID-2`** | **4935/4936** | 1 |
| `MT-16` | `TK-C-052` | derivar espaço disponível subtraindo o *token* | **`G-SID-3`** | **4935/4936** | 1 |
| `MT-23` | `TK-C-057` | sexto destino de navegação na barra | **`G-SID-4`** | **4935/4936** | 1 |

Quatro dos cinco produziram **falha única**. O único com três falhas é `MT-10`, e as três são
consequência da **mesma** mutação — ver §3.

---

## 2. `MT-9` — reimportar `theme/colors` (`TK-C-049`)

Texto canônico do PLAN §25: **"Reimportar `theme/colors` na barra lateral"**.

**Mutação** — uma linha em `src/components/TabletSidebar.js`:

```diff
  import { color, navSidebarRole, navSidebarWidth } from '../theme/tokens';
+ import { colors } from '../theme/colors';
```

**Observado:**

```
[4933] ✗ `G-SID-1` … consome `theme/tokens` e **não** `theme/colors` (`TA-10`) …
       → `TabletSidebar.js` voltou a referenciar `theme/colors` — tema legado concorrente (defeito 3 de §19)
── Result: 4935/4936 passed, 1 failed ──
```

Falha **única**, e no eixo certo: o segundo eixo (os cinco alvos) continuou verde. É o defeito 3
de PLAN §19 renascendo, e o portão o vê **mesmo sem nenhum uso** de `colors` — a mera existência
da segunda origem já é o defeito, porque é ela que torna "qual é a origem da cor" uma questão de
opinião por linha.

---

## 3. `MT-10` — remover um `registerGuideTarget` (`TK-C-050`)

Texto canônico do PLAN §25: **"Remover um `registerGuideTarget` da barra lateral"**.

**Mutação** — uma linha, escolhida para **não** alterar a contagem de comparações de rota (assim
o alvo desaparece sem que `G-SID-4` se mexa, isolando o eixo sob prova):

```diff
- : tab.name === 'Estrelinhas' ? 'stars.sidebarTab'
+ : tab.name === 'Estrelinhas' ? null
```

**Observado — três falhas, todas da mesma causa:**

```
[895]  ✗ ESTRELINHAS1.0: TrophiesScreen ativa só pela aba (!fromCena) …
       → TrophiesScreen não ativa/medê o guia de Estrelinhas corretamente
[4932] ✗ `TA-9` (`TK-C-063` · PLAN §23) …
       → alvos ausentes em `TabletSidebar.js`: stars.sidebarTab
[4933] ✗ `G-SID-1` … e mantém os **cinco** alvos de guia (`TA-9`) …
       → alvo de guia `stars.sidebarTab` desapareceu
── Result: 4933/4936 passed, 3 failed ──
```

**`TA-9` e `G-SID-1` caindo juntos é o esperado, não ruído.** O próprio corpus escreve, em
`TK-C-050`: *"Esperado: `G-SID-1` **vermelho** (`TA-9`)"*. As duas asserções medem o mesmo eixo
de propósito — `TA-9` porque `TK-C-063` lhe deu task própria, `G-SID-1` porque PLAN §26 escreve
o portão com as duas metades juntas.

**A terceira falha é uma descoberta, e boa.** `[895]` é um portão **herdado** do bloco de tour
(`ESTRELINHAS1.0`), anterior à Fase 6 e que ninguém desta sessão escreveu. Ele também depende de
`stars.sidebarTab`. Ou seja: o alvo da barra lateral está protegido por **defesa em
profundidade** — dois sistemas independentes o vigiam, e o mais antigo não sabe que o novo
existe. Registrado aqui porque é informação que nenhum dos dois portões declara sozinho.

Com `MT-9` e `MT-10`, **`G-SID-1` está provado vermelho por dois defeitos distintos**, um por
metade da sua asserção — que é exatamente a conclusão que `TK-C-050` exige.

---

## 4. `MT-15` — largura estrutural fora de `tokens.js` (`TK-C-024`)

Texto canônico do PLAN §25: **"Reintroduzir largura estrutural de barra lateral fora de
`tokens.js`"**. O objetivo da task acrescenta: **"inclusive no caso *renomear e declarar
resolvido*"** — §19.1 é explícito em que `sidebarWidth: 200` sozinho **não** cumpre `F6-R1.4`.

**A mutação foi executada na forma renomeada, deliberadamente**, porque ela é estritamente mais
difícil de pegar: a forma ingênua (`width: 200` de volta em `styles.sidebar`) percorre
exatamente o mesmo caminho de detecção — o literal do conjunto estrutural — e não acrescentaria
informação nenhuma.

```diff
- const largura = sidebarWidth(band);
+ const sidebarWidthValue = 200;
+ const largura = sidebarWidthValue;
```

Repare no que esta mutação **preserva**: o `import { navSidebarWidth }` continua lá, e a função
`sidebarWidth()` continua lendo o *token* corretamente. Um portão que só checasse "o componente
importa o *token*?" ou "a função devolve o valor certo?" daria **verde**. É a terceira condição
de `G-SID-2` — nenhum literal do conjunto estrutural nos seis arquivos de navegação — que pega.

**Observado:**

```
[4934] ✗ `G-SID-2` … renomear `width: 200` para `sidebarWidth: 200` não cumpre `F6-R1.4` (§19.1)
       → `src/components/TabletSidebar.js` contém o literal de largura estrutural `200`
── Result: 4935/4936 passed, 1 failed ──
```

O conjunto estrutural é **lido** de `tokens.js` (valores do *token* ∪ o histórico `200`), nunca
escrito no portão: se a captura física de `TK-C-019` mudar `180`, o portão acompanha sozinho.

*(`MT-16` — derivar largura disponível em vez de medir — é mutação **distinta**, provada
isoladamente na §5 contra `G-SID-3`, como `TK-C-024` determina.)*

---

## 5. `MT-16` — derivar espaço disponível subtraindo o *token* (`TK-C-052`)

Texto canônico do PLAN §25: **"Derivar largura disponível a partir do *token* de barra lateral
em vez de medir"**. É a restrição 4 de §19.1 e o defeito de classe que `RG-12` nomeia: o *token*
diz quanto a navegação **ocupa**, não quanto **sobra**.

**Mutação** em `src/components/layout/HubSurface.js` — um consumidor de *layout* real, no ponto
exato onde a largura disponível é decidida:

```diff
- import { grid } from '../../theme/tokens';
+ import { grid, navSidebarWidth } from '../../theme/tokens';
…
  export function useHubComposition({ itemCount, minItemWidth, gap = 0, availableWidth }) {
    const { band, width } = useWindowBand();
-   const largura = Number.isFinite(availableWidth) ? availableWidth : width;
+   const largura = width - navSidebarWidth.rail;
```

Este é o defeito na sua forma mais **plausível**: alguém trocando uma medida real por uma conta
que "dá quase o mesmo número" — e que erra em Split View, em Slide Over, na faixa expandida
(onde o papel é `full`, não `rail`) e em todo telefone (onde não há barra alguma).

**Observado — as duas condições do portão dispararam:**

```
[4935] ✗ `G-SID-3` … quem precisa do espaço MEDE (`RG-12` · restrição 4 de §19.1)
       → src/components/layout/HubSurface.js → deriva espaço disponível subtraindo a largura da barra
       · src/components/layout/HubSurface.js → consome `navSidebarWidth` fora da própria barra lateral
── Result: 4935/4936 passed, 1 failed ──
```

Falha única. **Restrição 4 tem dentes.**

---

## 6. `MT-23` — sexto destino de navegação (`TK-C-057`)

**Mutação** em `src/components/TabletSidebar.js` — um sexto botão fixo, irmão do `.map`:

```diff
          })}
+         <TouchableOpacity
+           style={styles.navButton}
+           onPress={() => onTabPress('Ajustes')}
+           activeOpacity={0.75}
+         >
+           <View style={styles.navIcon}>
+             <FaithIcon name="star" size={21} color={color.ink600} />
+           </View>
+           <Text style={styles.navLabel}>Ajustes</Text>
+         </TouchableOpacity>
        </View>
```

Escrito de propósito como um desenvolvedor escreveria: usando os estilos que já existem, com um
ícone plausível, sem tocar em `items`. Não é um destino "de mentira" — é um destino que a barra
teria e o **telefone não**, que é o preço que a Fase 6 já pagou uma vez com o catálogo próprio
de abas (`P-27`).

**Observado — duas condições do portão dispararam:**

```
[4936] ✗ `G-SID-4` … o inventário vem das rotas do `Tab.Navigator` e de nenhum outro lugar (`D4` · `CN-5`)
       → 2 `TouchableOpacity` na barra (esperado 1) — destino renderizado fora do `.map`
       · `onTabPress` recebe rota LITERAL em 1 ponto(s) — destino que o navegador não declarou
── Result: 4935/4936 passed, 1 failed ──
```

Falha única. **`D4` tem dentes.**

### 6.1 Sobre o "`CN-5` reexecutado após a reversão"

`TK-C-057` pede que o controle negativo **`CN-5`** seja reexecutado depois de reverter. É
preciso ser exato sobre o que foi feito:

- O significado canônico de `CN-5` (PLAN §24, `05_TASKS:222`) é **"nenhum destino novo aparece
  na barra lateral (`D4`)"**.
- A asserção **dedicada** de `CN-5` ainda **não existe**: seu dono é **`TK-C-027`**, que não foi
  executada. Antecipá-la aqui seria criar portão fora da task que o corpus lhe deu.
- O que carrega o significado de `CN-5` hoje é **`G-SID-4`**, cujo rótulo o cita nominalmente.
  Após a reversão ele voltou **verde**, junto com os demais 4936.
- A metade **visual** de `CN-5` ("inspeção visual + contagem de itens", PLAN:959) é **física** e
  continua **PENDENTE** — dona: `TK-C-043`. Nenhuma automação a concede.

---

## 7. O que este artefato **não** prova

- **Não** prova que os portões pegam *todas* as formas de cada defeito. Prova que pegam a forma
  canônica que o corpus nomeou, mais — em `MT-15` — a variante explicitamente citada.
- **Não** substitui física. `G-SID-2` prova que a largura **vem do *token* e difere por faixa**;
  que os dois papéis sejam **legíveis e distintos no aparelho** é captura de `TK-C-019`, e o
  vazio vertical de `TK-C-020` é `SD-4` / §28 #16. Ambas **PENDENTES**.
- **Não** toca `B2`. Os defeitos 4 e 5 de §19 continuam abertos (ver `16_TK_C_022_NAO_INVASAO_B2.md`).

---

## 8. Conclusão

As cinco mutações foram aplicadas, observadas **vermelhas** no portão que cada task nomeia, e
revertidas. `verify:runtime` fechou **verde** (4936/4936, *bundle* `EXIT=0`) com a árvore limpa.

Os quatro portões de `TK-C-023` estão **provados**: `G-SID-1` por **dois** defeitos distintos
(um por metade), `G-SID-2`, `G-SID-3` e `G-SID-4` por um cada.
