# 18 · Geometria do *callout* na composição lateral — congelamento documental (`TK-C-026`)

> **Estado:** congelamento **anterior** a qualquer alteração de runtime, exigido pela própria task.
> **Task:** `TK-C-026` · **Pacote:** `F6-R1.2` · **Subportão:** `F6-SG-C`
> **Gate:** `G-RSP-4` · **Prova:** `TA-15` (parcela automatizável) · **Commit do runtime:** `C-C6`
> **Base medida:** `HEAD = 3ea12e8`, árvore limpa.

`TK-C-026` abre com **⚠️ INCERTEZA LOCALIZADA** quanto ao arquivo que renderiza o *callout*, e
determina, literalmente: *"A incerteza é resolvida por leitura dirigida dentro desta própria task,
**antes de qualquer edição**: localizar a expressão `width / TAB_DEFS.length + insets.bottom` e a
condicional `!isTablet` que a governa (PLAN §19.1), e **congelar documentalmente** o arquivo e a
linha antes de alterar runtime"*.

Este artefato é esse congelamento. Nenhuma linha de runtime foi alterada antes dele.

---

## 1. A incerteza, resolvida

A expressão citada pelo PLAN §19.1 (`04_PLAN:824`) **não existe como uma única expressão**. Ela é a
união de duas metades que vivem em **dois arquivos distintos** — e é exatamente por isso que a task
nomeia os dois (`AppNavigator.js` *"e a camada de overlay do guia"*) sem conseguir apontar um só.

| Metade da expressão | Arquivo · linha (congelados) | Texto exato |
|---|---|---|
| `width / TAB_DEFS.length` | `src/navigation/AppNavigator.js:289` | `const tabW = width / TAB_DEFS.length;` |
| `+ insets.bottom` (altura da barra) | `src/navigation/AppNavigator.js:287` | `const tabBarH = 64 + insets.bottom;` |
| `width / TAB_COUNT` (gêmea no overlay) | `src/components/BeniGuideOverlay.js:268` | `const tabItemW = width / TAB_COUNT;` |
| `+ insets.bottom` (faixa reservada) | `src/components/BeniGuideOverlay.js:227` | `const tabTop = height - (TABBAR_APPROX + insets.bottom);` |

**A condicional `!isTablet` que governa o desenho** — congelada:

| Papel | Arquivo · linha | Texto exato |
|---|---|---|
| Desenho da moldura | `src/navigation/AppNavigator.js:345` | `{!isTablet && calloutOn && advIndex >= 0 && (` |
| Estilo da moldura | `src/navigation/AppNavigator.js:217-223` | `const TOUR_TAB_CALLOUT = { position: 'absolute', … }` |
| Geometria aplicada | `src/navigation/AppNavigator.js:350` | `{ left: calloutLeft, width: calloutW, bottom: insets.bottom + 5, height: tabBarH - insets.bottom - 9 }` |
| Gêmea no overlay | `src/components/BeniGuideOverlay.js:250` | `const showTabGlow = … && !isTabletLayout && glowTabIndex != null;` |
| Sinal para a barra | `src/components/BeniGuideOverlay.js:261` | `const tabCalloutOn = embedded && showTabGlow;` |

**O arquivo do *callout* é `src/navigation/AppNavigator.js`.** O *overlay* não o desenha no modo
embutido — e o motivo já estava escrito no próprio código, em `BeniGuideOverlay.js:246-249`:

> *"A MOLDURA do item, porém, no modo EMBEDDED é desenhada pela PRÓPRIA tab bar (AppNavigator),
> pois o overlay vive dentro da tela e não alcança a tab bar"*.

Essa frase é a chave de toda a task: **o mesmo argumento vale, palavra por palavra, para a barra
lateral.** O *overlay* embutido vive dentro da tela e **não alcança a barra lateral** — que, na
composição lateral, é irmã da tela, não filha dela.

---

## 2. Onde a árvore põe cada coisa (fato estrutural, não estimativa)

`AppNavigator.js:296-300` decide a composição:

```js
tabBar={isTablet ? (props) => <TabletSidebarTabBar {...props} /> : undefined}
tabBarPosition: isTablet ? 'left' : 'bottom',
```

Disso decorrem duas caixas de coordenadas diferentes, e é essa diferença que produz os defeitos:

| | Faixa compacta | Composição lateral |
|---|---|---|
| Onde fica a navegação | **embaixo**, altura `64 + insets.bottom` | **à esquerda**, largura estrutural |
| Origem da área de tela (janela) | `(0, 0)` | `(largura da barra, 0)` |
| Faixa ocupada embaixo | a barra inferior | **nada** |
| Alcance do *overlay* embutido | não alcança a barra | não alcança a barra |

O *overlay* embutido é montado em `AdventureMapScreen.js:588-596`, dentro de
`<View style={styles.container}>` — ou seja, **dentro da área de tela**, com
`overlay: { ...StyleSheet.absoluteFillObject }` (`BeniGuideOverlay.js:485`). O alvo, porém, é medido
por `measureInWindow` (`guideTargetRegistry.js:39`), que devolve **coordenadas de janela**.

Na faixa compacta as duas origens coincidem e ninguém percebe a diferença. Na composição lateral
elas **não** coincidem.

---

## 3. Os três defeitos congelados

### D1 · A moldura não existe na composição lateral

`AppNavigator.js:345` é `!isTablet`, e `BeniGuideOverlay.js:250` também. Na composição lateral
`showTabGlow` é falso → `tabCalloutOn` (`:261`) é falso → `setAdventureTabCalloutActive(false)` →
`calloutOn` nunca liga. **Nenhuma moldura é desenhada sobre o item da barra lateral, em nenhum
passo.** É literalmente a frase do PLAN §19.1: *"no tablet a barra está à esquerda e essa aritmética
não tem equivalente"*.

### D2 · A faixa reservada da barra inferior é aplicada onde não há barra inferior

`BeniGuideOverlay.js:227` reserva `TABBAR_APPROX + insets.bottom` **sem condicional de composição**.
Esse `tabTop` governa, logo abaixo:

- `:230` `inViewport = … && rect.y < tabTop` — **um alvo abaixo de `tabTop` é descartado em
  silêncio**: sem anel, sem seta, e o card cai no ramo final `:314`;
- `:275` `usableBottom = tabTop` — o card é empurrado 64dp para cima sem que exista nada ali.

O agravante é estrutural e mensurável no código: `TabletSidebar.js:286` empilha os destinos com
`styles.navButtons: { flexGrow: 1, justifyContent: 'flex-end' }` — **os cinco alvos são
encostados na base da barra lateral**. Justamente a região que `tabTop` declara inexistente.

### D3 · O card e a seta do alvo lateral são posicionados em coordenadas da janela dentro de uma caixa que não começa na janela

`BeniGuideOverlay.js:282-288` é o ramo do alvo lateral e usa `rect.x` cru:

```js
cardLeft = Math.min(rect.x + rect.width + 18, Math.round(width * 0.42));
```

`rect.x` é janela; `cardLeft` é relativo à área de tela. Na composição lateral o card nasce deslocado
para a direita pela largura da barra, e o anel de `:366-369` (`left: rect.x - ringPad`) é desenhado
**por cima da tela**, não sobre a barra lateral.

**Alcance de D3:** só o modo **embutido**. `AdventureMapScreen` é o **único** consumidor com
`embedded` (verificado: `grep -rn "embedded" src/screens/` devolve apenas `AdventureMapScreen.js:592`).
Home, Conquistas, Perfil e Área dos Pais usam a forma **modal**, e um `Modal` do RN é de janela — lá
as origens coincidem e não há deslocamento.

---

## 4. O equivalente lateral — e por que ele é MEDIDO, não calculado

A aritmética `width / TAB_DEFS.length` só existe porque a barra inferior tem **cinco itens iguais em
linha**: o centro do enésimo é dedutível sem medir. A barra lateral **não** tem essa propriedade —
`flexGrow: 1` com `justifyContent: 'flex-end'`, alturas dependentes de rótulo e de inserção do
sistema. Não há divisão que produza a posição do item.

E há uma proibição explícita fechando a única saída aritmética restante: **restrição 4 do PLAN
§19.1** (*"A largura **não** é usada como substituto de medição real da viewport"*), com portão
`G-SID-3` e mutante `MT-16` já observado vermelho (artefato `17_MUTANTES_BARRA_LATERAL_F6_SG_C.md`).
Subtrair `navSidebarWidth` para converter coordenadas seria exatamente `MT-16` entrando na árvore.

**Portanto o equivalente lateral da aritmética é a MEDIÇÃO** — que já existe, pronta e sem
dependência nova: os cinco `registerGuideTarget` de `TabletSidebar.js:191-195` e
`measureGuideTarget` (`guideTargetRegistry.js:31`). É o que §41.4 chama de "medir o que pode ser
medido", e é o que faz a solução valer igualmente em Split View, Slide Over e nas duas faixas de
tablet.

---

## 5. Forma da correção (congelada antes de escrever)

| # | Defeito | Arquivo | Forma |
|---|---|---|---|
| 1 | D1 | `AppNavigator.js` | ramo lateral da moldura, posicionado pelo **rect medido** de `adventures.sidebarTab`; a moldura compacta segue pela aritmética, intocada |
| 2 | D1 | `BeniGuideOverlay.js` | o sinal `onTabHighlight` passa a valer nas **duas** composições; a geometria de barra inferior (`tabHalo*`, seta para baixo) continua exclusiva da compacta |
| 3 | D2 | `BeniGuideOverlay.js` | a faixa reservada embaixo passa a ser consequência da **composição**: barra inferior na compacta, nada na lateral |
| 4 | D3 | `BeniGuideOverlay.js` | conversão janela→*overlay* pela **origem medida** do próprio *overlay*; identidade quando as origens coincidem |
| 5 | D3 | `BeniGuideOverlay.js` | no modo embutido, o anel do alvo lateral deixa de ser desenhado pelo *overlay* (quem desenha é a barra) — espelho exato de `showTabHalo = showTabGlow && !embedded` |

**`CN-1` por construção, não por esperança.** Nenhum dos cinco itens altera um valor na faixa
compacta: 1 e 2 acrescentam ramo lateral; 3 devolve `TABBAR_APPROX + insets.bottom` na compacta;
4 é identidade quando a origem medida é `(0, 0)` e é aplicada apenas na composição lateral; 5 é
condicionado a alvo `.sidebarTab`, que `targetFor` (`:91-92`) só produz quando
`isTabletLayout`.

**O que decide o quê** (D2/§41.4, e a razão de 4 ser condicionada à composição): a **faixa** decide
apenas se a caixa do *overlay* coincide com a janela — que é consequência de a navegação estar
embaixo ou à esquerda, isto é, **composição**. O **valor** subtraído é sempre medido. Nenhum número
de geometria nasce da faixa.

---

## 6. O que este congelamento **não** decide

- **Qual história o tour aponta continua sendo F7** (PLAN §19.1, e a própria task). Aqui só entra
  geometria.
- **A geometria real exige aparelho** (§11.11). `TA-15` prova a parcela **estrutural**; o
  apontamento correto nas três faixas é **`Física futura: sim (obrigatória)`**, coberto pelo vídeo
  do tour em telefone **e** iPad exigido por `SG-C` (`04_PLAN:1037`).
- **Nenhuma dependência nova**, nenhum destino novo, nenhuma funcionalidade nova — `CN-5` e `CN-12`
  são de `TK-C-027`.

---

## 7. Referências

`TK-C-026` · `TK-C-021` (precondição, cumprida) · `TA-15` (`05_TASKS:210-212`) · `G-RSP-4`
(`04_PLAN:1016`) · `G-SID-3` · `CN-1` (`04_PLAN:955`) · `RG-6` · `RG-12` (`04_PLAN:889`) ·
PLAN §19.1 restrição 4 (`04_PLAN:811`) · PLAN §19.1 *callout* (`04_PLAN:824-826`) · §41.4 ·
§11.11 · `MT-16` (artefato `17`).
