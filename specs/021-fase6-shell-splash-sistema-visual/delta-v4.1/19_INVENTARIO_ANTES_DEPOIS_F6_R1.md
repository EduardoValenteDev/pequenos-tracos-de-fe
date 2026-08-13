# 19 · Inventário de destinos **antes/depois** e revisão do *diff* do pacote `F6-R1` (`TK-C-027`)

> **Task:** `TK-C-027` · **Pacote:** `F6-R1.*` · **Subportão:** `F6-SG-C`
> **Gates:** `G-RSP-4` (criado em `a4b67a6`), `G-SID-4` (criado em `TK-C-023`)
> **Controles negativos:** `CN-5` (PLAN §24, canônico) · `CN-12` (novo)
> **Base do pacote:** `04bd479` · **Cabeça medida:** `a4b67a6`
> **Mutação injetada:** **nenhuma** — a prova vermelha de `G-RSP-4` é `MT-32`
> (`TK-C-059`) e a de `G-SID-4` é `MT-23` (`TK-C-057`), independentes por emenda
> `A-09`/`A-10`.

`TK-C-027` pede duas coisas que um portão estático não produz sozinho: **inventário de destinos
da barra antes/depois** e **revisão do `git diff` do pacote**. Este artefato é essa evidência,
medida — não relatada de memória.

O portão criado pela task (`G-RSP-4`) e os dois controles (`CN-5`, `CN-12`) vivem em
`scripts/smoke.js`, no commit `a4b67a6`. **A divisão é proposital:** o portão prova o presente e
sobrevive ao tempo; este artefato prova a **transição**, que só existe uma vez.

---

## 1. Onde o pacote começa

A base não é escolhida por conveniência: `04bd479` (*"docs(fase6): fechar R1 formalmente, preparar
Rodada 2 e registrar ADR de observabilidade"*) é o **último commit antes de qualquer alteração de
runtime de `F6-SG-C`** — o commit seguinte, `6b78b34`, é o que cria `useWindowBand.js`.

| | Commit | Assunto |
|---|---|---|
| **Antes** | `04bd479` | fechamento formal de `R1`, nenhum runtime de `SG-C` |
| **Depois** | `a4b67a6` | `G-RSP-4` + `CN-5` + `CN-12` |
| Extensão | **39 arquivos** | 24 em `src/`, 11 em `specs/`, 3 em `scripts/`, 1 em `docs/` |

---

## 2. `CN-5` — inventário de destinos da barra lateral, **antes** e **depois**

### 2.1 Quem declara: `TAB_DEFS` (`src/navigation/AppNavigator.js`)

```
$ git show 04bd479:src/navigation/AppNavigator.js | sed -n '/^const TAB_DEFS = \[/,/^\];/p' | md5sum
f1617e199d022a10651165bfeea44598
$ sed -n '/^const TAB_DEFS = \[/,/^\];/p' src/navigation/AppNavigator.js | md5sum
f1617e199d022a10651165bfeea44598
```

**Idêntico byte a byte.** Não "equivalente", não "sem mudança relevante": o mesmo *hash*. Os cinco
destinos, na mesma ordem, com os mesmos `faithIcon` e o mesmo `label` de `Ateliê` → *Brincar*:

`Início` · `Aventuras` · `Ateliê` · `Estrelinhas` · `Perfil`

### 2.2 Quem apresenta: `TabletSidebar.js`

| | Comparações `tab.name === '…'` |
|---|---|
| **Antes** (`04bd479`) | `Ateliê` · `Aventuras` · `Estrelinhas` · `Início` · `Perfil` |
| **Depois** (`a4b67a6`) | `Ateliê` · `Aventuras` · `Estrelinhas` · `Início` · `Perfil` |

Os mesmos cinco — e `TabletSidebar.js` mudou bastante no pacote (**+110 / −20**, os três defeitos de
§19 em `TK-C-019`..`TK-C-021`). É exatamente o caso que `CN-5` existe para cobrir: **arquivo
reescrito, inventário intacto.**

### 2.3 Destinos de *stack* — o outro caminho pelo qual um destino poderia nascer

| | `<Stack.Screen name="…">` em `AppNavigator.js` |
|---|---|
| **Antes** | `MonteACenaDifficulty` `MonteACenaGallery` `MonteACenaHome` `MonteACenaStory` `MonteACenaTableGame` `PuzzleGestureLab` |
| **Depois** | *(idem, sem alteração)* |

**Conclusão de `CN-5`:** a barra lateral tem exatamente os destinos de antes. Nenhum nasceu, nenhum
morreu, nenhum trocou de nome. `D4` preservado.

---

## 3. `CN-12` — nenhuma funcionalidade nova pela porta dos fundos

### 3.1 O que o pacote **criou** (`--diff-filter=A` em `src/`)

| Arquivo novo | Natureza | Linhas |
|---|---|---|
| `src/hooks/useWindowBand.js` | faixa de janela (`TK-C-002`) | 79 |
| `src/components/layout/HubSurface.js` | arquétipo | 223 |
| `src/components/layout/EditorialSurface.js` | arquétipo | 164 |
| `src/components/layout/ImmersiveSurface.js` | arquétipo | 91 |
| `src/components/layout/GameSurface.js` | arquétipo | 92 |
| `src/components/layout/displayType.js` | escala de display (`TK-C-061`) | 65 |

**Seis módulos, todos geometria e composição.** Nenhuma tela nova: `git diff --diff-filter=A
--name-only 04bd479..a4b67a6 -- src/screens/` devolve **vazio**.

### 3.2 O que o pacote **não** tocou

| Superfície | Estado |
|---|---|
| `package.json` · `package-lock.json` | **não tocados** — nenhuma dependência nova |
| `app.json` · `eas.json` · `babel.config.js` · `metro.config.js` | **não tocados** |
| *assets*, histórias, manifestos, conquistas, progresso, `accessControl`, *paywall* | **não tocados** — a varredura por caminho devolve vazio |

### 3.3 A porta dos fundos, nomeada

A porta dos fundos concreta de `R1` não é "uma tela nova" — isso apareceria no `--diff-filter=A`.
É **um módulo de layout que navega**: um arquétipo que chamasse `navigation.navigate('…')` seria,
na prática, um destino sem passar pelo `Tab.Navigator`. Medido nos seis módulos criados:

```
$ grep -nE "navigate\(|Stack\.Screen|Tab\.Screen|useNavigation|@react-navigation" \
    src/components/layout/*.js src/hooks/useWindowBand.js
(nenhuma ocorrência)
```

`CN-12` no `smoke` congela esse resultado. **Fronteira declarada:** `AppNavigator.js` e
`TabletSidebar.js` ficam **fora** dessa varredura, porque navegar é o trabalho deles — quem os
cobre é `G-SID-4` e `CN-5`.

### 3.4 Revisão do *diff* por área

| Área | Arquivos | Leitura |
|---|---|---|
| `src/components/layout/` (novo) | 6 | infraestrutura de composição — §3.1 |
| `src/screens/` (modificados) | 12 | **adoção** dos arquétipos (`TK-C-006`..`TK-C-011`); nenhuma tela nova, nenhum destino novo |
| `src/components/` (modificados) | 3 | `TabletSidebar` (§19), `BeniGuideOverlay` (`TK-C-026`), `ui/ContentContainer` (`TK-C-005`) |
| `src/theme/tokens.js` | 1 | **+44 / −2** — `grid`, `displayScaleTablet`, `navSidebarRole`, `navSidebarWidth` ganham consumidor; nada removido |
| `src/navigation/AppNavigator.js` | 1 | **+57 / −4** — composição lateral e o *callout* de `TK-C-026` |
| `scripts/` | 3 | `smoke.js` + arnês de teste |
| `specs/` · `docs/` | 12 | governança |

**Conclusão de `CN-12`:** o que `R1` acrescentou ao app é **capacidade de compor**, não capacidade
de fazer coisa nova. Nenhuma funcionalidade entrou pela porta dos fundos.

---

## 4. `G-RSP-4` — o que o portão criado em `a4b67a6` prova, e o que ele **não** prova

**Prova** (três eixos, todos lendo `tokens.js`, nenhum escrevendo valor):

1. **nome** — nenhum módulo de *layout* exporta um dos **19** nomes que `tokens.js` exporta;
2. **valor** — nenhum literal numérico igual a um valor estrutural de §2.4. Conjunto resolvido hoje:
   **600, 900, 560, 640, 1.1, 180, 240**. Comparação **numérica**, então `1.10` morre junto com `1.1`;
3. **forma** — nenhuma tabela por faixa/papel com valor **literal**. A tabela de **tradução** cujos
   valores são referências ao *token* (`HUB_COLUMN_CEILING`) é o idioma documentado em
   `tokens.js:162-165` e passa.

**Antivacuidade embutida:** como a task proíbe injetar mutação aqui, o portão **falha sozinho** se o
conjunto de valores vier vazio ou se menos de 5 nomes forem lidos de `tokens.js`. Um portão que
passa por não ter o que comparar seria mentira.

**Não prova** (e está escrito no próprio portão, não só aqui):

- **cor, tipografia, sombra e movimento ficam fora** — por medida, não por gosto: `shadow.radius`
  vale `10` e `motion.fast` vale `180`, números que colidiriam com aritmética honesta
  (`Math.round(v * 10) / 10` em `displayType.js`) e com largura já coberta por `G-SID-2`.
- **Achado registrado, fora do escopo:** `TabletSidebar.js:304` escreve `fontWeight: '600'`, valor
  que `tokens.fontWeight.display` também tem. É duplicação de **tipografia**, **anterior a `R1`**, e
  fora dos arquivos declarados de `TK-C-027` (`scripts/smoke.js` e o `git diff` do pacote).
  Registrado, não corrigido — corrigir seria a task decidir sozinha ampliar o próprio escopo.
- **`768` fica fora de propósito** — o dono é `G-BP-1`/`P-30` (`CN-7`), executado por `TK-A-094` e
  `TK-C-051`.

---

## 5. Estado dos gates no commit medido

```
npm run verify:runtime  →  bundle Android serializa · smoke 4942/4942, 0 falhas
git diff --check        →  limpo
```

**Física:** `TK-C-027` declara **`Física futura: não`** — é verificação estática e comparação de
`git`. Nada aqui pede aparelho, e nada aqui declara cumprida a física que outras tasks devem.

---

## 6. Colisão de identificador de *commit* (registro, não correção)

`TK-C-027` declara **Commit: `C-C9`**, mas `C-C9` já havia sido consumido por `a1b4380`
(`TK-C-014`). A colisão é o item **(f)** do `PARKING_LOT` e **não é reaberta aqui** — o trabalho
saiu em dois *commits* atômicos (`a4b67a6`, portão; este, evidência), separados porque governança
não se mistura com código (`AGENTS.md`).

---

## 7. Referências

`TK-C-027` · `TK-C-023` (`G-SID-4`) · `TK-C-057` (`MT-23`) · `TK-C-059` (`MT-32`) ·
`G-RSP-4` (`04_PLAN:1016`) · `Q9` restrição 3 (`04_PLAN:810`) · `RD-3`/`RG-3` (`04_PLAN:880`) ·
`CN-5` (PLAN §24) · `CN-12` (`05_TASKS:230-231`) · `D4` · `P-27` · artefato `18` (`TK-C-026`).
