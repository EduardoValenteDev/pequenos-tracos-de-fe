# F6.2R — A fronteira entre a navegação e o conteúdo · gutter global · residual de geometria

> **Bloco:** `F6.2R` do Roteiro Mestre v6.0 — **residual de `F6.2`**, não bloco novo
> **Branch:** `feat/fase6-shell-splash` · **HEAD de entrada:** `ac53a11`
> **Commit de implementação:** `bb33017` · **Worktree:** `C:\tmp\ptf_fase6_shell_splash_wt`
> **Data:** 2026-08-24 · **Status:** implementado, medido e servido no aparelho ·
> **confirmação visual do fundador PENDENTE** · `F6_2_COMPLETE = NÃO`

---

## 0. Por que `F6.2` não estava lacrada

`F6.2` provou, e provou certo, que **WINDOW VIEWPORT ≠ CONTENT REGION**. O shell passou
a publicar a região que sobra depois do trilho, e cinco telas pararam de adivinhar.

A prova física no SM-X510 em retrato mostrou que **isso ainda não era o requisito**. O
fundador relatou três coisas:

1. Na **Início**, principalmente no *Cantinho do Beni*, o trilho fica **visualmente
   próximo demais** do conteúdo.
2. Na **Área dos Responsáveis**, o conteúdo também **nasce colado** ao trilho.
3. Em **Cadê a Ovelhinha?**, o trilho **invade a região usada para procurar a ovelha**.

Os três relatos têm a mesma raiz e nenhuma delas é largura de barra. A região estava
certa; o que faltava era **a fronteira entre a navegação e o conteúdo**. Corrigir
`width`/`band` não responde a isso, porque não existe número nenhum em `F6.2` que diga
*onde a navegação termina e o conteúdo pode começar*.

---

## 1. `ROOT_CAUSE_OF_REMAINING_VISUAL_DEFECT`

**`F6.2` entregou a região certa e a fronteira nenhuma.**

A região começava **exatamente** onde o trilho terminava — `inicioConteudo = fimBarra`.
Isso é aritmeticamente correto e **visualmente errado**: navegação e conteúdo passam a
compartilhar uma borda. Cada tela ficava com a escolha de compensar por conta própria,
que é a lista de remendos que a ordem proíbe nome por nome (`HomeScreen paddingLeft`,
`ParentArea paddingLeft`, `Dimensions.width - 180 - 24`, *offset* por aparelho).

O recuo lateral que cada tela já tinha (16 dp de medida editorial) **não é** essa
fronteira: ele existe entre o cartão e a borda da tela, e existiria igual num telefone
sem trilho. Confundir os dois é o que fazia 16 dp parecerem "colados" — porque eram.

---

## 2. O contrato

```
SIDEBAR → NAVIGATION CONTENT GAP → CONTENT VIEWPORT → SCREEN
```

**Regra fundamental.** Se o trilho está visível, **nenhum pixel de conteúdo — visual ou
interativo — nasce antes da fronteira**. A fronteira é geometria, não decoração: ela
entra na largura publicada, e por isso o filho recebe **menos** área, não a mesma área
deslocada.

| Papel | Dono | Onde |
| --- | --- | --- |
| fim do trilho (`SIDEBAR_END_OWNER`) | *flex* do `BottomTabView` (trilho à esquerda) | shell — inalterado |
| a fronteira (`NAVIGATION_CONTENT_GAP_OWNER`) | **`NavigationContentHost`** | `src/components/layout/NavigationContentHost.js` |
| o valor (`NAVIGATION_CONTENT_GAP_TOKEN`) | **`tokens.navContentGap = 24`** | `src/theme/tokens.js` |
| a região publicada | `ContentViewportProvider` (`F6.2`) | inalterado |

### A ordem importa, e o portão cobra a ordem

```jsx
screenLayout={({ children }) => (
  <NavigationContentHost>
    <ContentViewportProvider>{children}</ContentViewportProvider>
  </NavigationContentHost>
)}
```

O recuo é aplicado **antes** do provedor. Medir antes da fronteira publicaria uma
largura que o filho não tem — seria `F6.2` outra vez, com um número a mais.

### O que o host **não** faz, de propósito

| Não faz | Motivo |
| --- | --- |
| aritmética de barra (janela − 180 − 24) | `G-SID-3`: ninguém abaixo do shell conhece a largura do trilho. O host só pergunta **se existe** trilho (`sidebarRole(band)`), nunca **quanto** ele mede. |
| `insets` / `SafeAreaView` | o dono único continua sendo `AppScreen` (`P-30`). |
| `Platform` / `isTablet` / `Dimensions` / nome de aparelho | a fronteira é função da **faixa**, não do dispositivo. |

`MAGIC_OFFSETS_ADDED = 0`. Nenhuma tela ganhou `paddingLeft`, `marginLeft` ou exceção.

---

## 3. Superfícies afetadas — o inventário completo

Duas topologias de navegação (`Stack` raiz e `Tab`), **44 rotas**:

| Classe | Total | Quais |
| --- | ---: | --- |
| **`SIDEBAR_VISIBLE`** | **6** | `MainTabs` (o container) + as 5 abas: **Início** · **Aventuras** · **Brincar** (Ateliê) · **Estrelinhas** · **Perfil** |
| `SIDEBAR_HIDDEN` | 38 | todas as telas de `Stack` e modais — inclusive **Área dos Responsáveis** e **Cadê a Ovelhinha?** |

Taxonomia das 5 abas: `STANDARD_CONTENT = 4` (Início, Brincar, Estrelinhas, Perfil) ·
`FULL_BLEED = 1` (Aventuras/Mapa) · `GAME = 0` · `CREATIVE_CANVAS = 0` — o Ateliê e a
Ovelhinha são destinos de `Stack` abertos **a partir** das abas.

A fronteira é montada **uma vez**, no `screenLayout` do `Tab.Navigator`. Uma sexta aba
nasce dentro do contrato sem que ninguém precise lembrar; e uma tela de `Stack` que um
dia passe a coexistir com o trilho recebe a fronteira **do shell**, sem uma linha de
diferença no arquivo dela.

---

## 4. Matriz responsiva — retrato, sem condição por aparelho

| janela | faixa | barra | fim da barra | fronteira | início do conteúdo | região `F6.2` | região `F6.2R` | faixa da região |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 360 | compact | — | 0 | **0** | 0 | 360 | 360 | compact |
| 390 | compact | — | 0 | **0** | 0 | 390 | 390 | compact |
| 412 | compact | — | 0 | **0** | 0 | 412 | 412 | compact |
| 599 | compact | — | 0 | **0** | 0 | 599 | 599 | compact |
| 600 | medium | 180 | 180 | **24** | 204 | 420 | **396** | compact |
| 768 | medium | 180 | 180 | **24** | 204 | 588 | **564** | compact |
| **823** | medium | 180 | 180 | **24** | **204** | 643 | **619** | medium |
| 899 | medium | 180 | 180 | **24** | 204 | 719 | **695** | medium |
| 900 | expanded | 240 | 240 | **24** | 264 | 660 | **636** | medium |
| 1024 | expanded | 240 | 240 | **24** | 264 | 784 | **760** | medium |
| 1317 | expanded | 240 | 240 | **24** | 264 | 1077 | **1053** | expanded |

**Fronteira única = 24 dp** em todas as 7 janelas com trilho; **0 dp** nas 4 sem trilho.
Um único valor distinto e não nulo — o portão cobra isso, e não apenas "existe recuo".

Identidade verificada em todas as linhas: `inicioConteudo + regiao = janela`. É o que
garante que *full-bleed* signifique **sangrar até a borda da região**, e não sangrar
**por baixo do trilho** — que era o relato 3 do fundador.

`CONTENT_VIEWPORT_BEFORE` (SM-X510, retrato) = **643 dp começando em `x = 180`**
`CONTENT_VIEWPORT_AFTER` = **619 dp começando em `x = 204`**

---

## 5. Os três relatos, um a um

### 5.1 Início / Cantinho do Beni

Todas as seções da Início usam `marginHorizontal: 16` — nenhuma exceção, nenhuma delas
foi tocada. Em 823 dp de retrato, a borda esquerda de cada seção vai de **196 dp → 220 dp**,
e a distância trilho → cartão vai de **16 dp → 40 dp** (24 da fronteira + 16 da medida
editorial do próprio cartão). Nenhum `marginLeft` foi adicionado a cartão nenhum:
o deslocamento vem inteiro do shell.

### 5.2 Área dos Responsáveis

O relato **não se reproduz como descrito**, e a perícia diz por quê: a Área dos
Responsáveis é `Stack.Screen` da raiz, **empilhada por cima das abas**. Enquanto ela
está aberta **não há trilho na tela** — a região dela é a janela inteira. Os
`paddingHorizontal: 16 / 48` que ela tem são **medida editorial**, não compensação de
navegação.

Criar recuo exclusivo para ela era proibido pela ordem, e seria errado: o que o portão
cobra dela é a **ausência** de recuo próprio (cláusula `E7`), justamente para que, no
dia em que ela coexistir com o trilho, quem lhe dê a fronteira seja o shell.

### 5.3 Cadê a Ovelhinha?

Era o relato **literalmente verdadeiro**: a tela dimensionava a cena por
`useWindowDimensions()`, isto é, pela **janela**. Passou a ler `useContentViewport()`.
A cena inteira recebe o retângulo certo — **nada de "shift da ovelha"**.

`OVELHINHA_ASSETS_CHANGED = NÃO`. Nenhuma coordenada canônica, esconderijo, *sprite* ou
dificuldade foi lida para mudança ou alterada.

| janela | região | cena | `x0` | `x1` | excede a região | *hitbox* centrada | ida-e-volta arte↔px |
| ---: | ---: | --- | ---: | ---: | :---: | :---: | :---: |
| 700 | 496 | 476 × 595 | 10 | 486 | **0** | sim | sim |
| **823** | **619** | 560 × 700 | 29,5 | 589,5 | **0** | sim | sim |
| 412 | 412 | 392 × 490 | 10 | 402 | **0** | sim | sim |

`OVELHINHA_PLAYABLE_RECT`: antes a cena era dimensionada pela janela de 823 dp e podia
nascer sob o trilho; agora vive dentro de `[204, 823]`, centrada na região de 619 dp.
`OVELHINHA_CONTENT_RECT_VALID = SIM` · `OVELHINHA_HITBOX_VALID = SIM`.

---

## 6. Estrelinhas — a residual de `F6.2`, quitada e com o intervalo exato

O relatório de `F6.2` afirmou **duas coisas incompatíveis**: residual em janela
∈ `[900, 1140)` **e** 1024 corrigida. A varredura dp a dp em `[360, 1400]`, com a
composição REAL do Hub (piso 320, intervalo 10, recuo lateral 32, 12 itens), diz qual
das duas era verdadeira:

| Cenário | Intervalos de falha (célula abaixo do piso de 320 dp) |
| --- | --- |
| `F6.2` como estava no aparelho | **`[830, 862)` ∪ `[900, 922)` ∪ `[1220, 1252)`** |
| `F6.2` + fronteira, ainda sem a grade | `[854, 886)` ∪ `[914, 946)` ∪ `[1244, 1276)` |
| **`F6.2R` como fica** | **vazio** |

Não era uma faixa de 240 dp: eram **três faixas estreitas, de 22 a 32 dp**. Por isso 900
falhava e 1024 não — as duas frases estavam certas sobre pontos diferentes, e a
generalização entre elas era falsa. `ESTRELINHAS_FAILURE_INTERVAL_EXACT` é a linha 1;
`ESTRELINHAS_RESIDUAL_FIXED = SIM`.

**Causa:** compor pela **região** e desenhar na **grade** (região − 32 dp de recuo
lateral). A assimetria é exatamente o que `G-RSP-8` já obrigava em Início e Brincar e
que nunca havia chegado a Estrelinhas. **Remédio:** sonda de altura zero com `onLayout`
no cabeçalho da lista, entregando a grade medida como `availableWidth`.

| janela | região ANTES | grade ANTES | col. ANTES | célula ANTES | região DEPOIS | grade DEPOIS | col. DEPOIS | célula DEPOIS |
| ---: | ---: | ---: | :---: | ---: | ---: | ---: | :---: | ---: |
| **823** | 643 | 611 | 1 | 611 | 619 | 587 | 1 | **587** |
| **900** | 660 | 628 | 2 | **309** (falha) | 636 | 604 | 1 | **604** |
| 1024 | 784 | 752 | 2 | 371 | 760 | 728 | 2 | **359** |

A fronteira **sozinha** apenas deslocaria as três faixas 24 dp para a direita (linha 2
da tabela anterior) — quem as fecha é a grade medida. As duas correções são
independentes e ambas eram necessárias.

---

## 7. O portão `G-GAP-1`, com nove mutantes

Quatro baterias executáveis (`scripts/testing/navigationGapHarness.js`) e oito
cláusulas de fonte, todas cobradas em `scripts/smoke.js`:

| Bateria / cláusula | O que cobra |
| --- | --- |
| **A** | a fronteira existe **se e somente se** o trilho existe; a região é `regiãoAntes − fronteira`; **um único** valor não nulo; faixa compact implica 0 |
| **B** | a **ordem**: o `screenLayout` envolve o provedor com o host, e não o contrário; a região pós-fronteira é a que o `resolveContentViewport` REAL publica |
| **C** | a tela do jogo lê `useContentViewport()`; a área jogável cabe na região; *hitbox* centrada em `artToPx(spot.pos)`; ida-e-volta arte→px→arte |
| **D** | varredura dp a dp de Estrelinhas — reporta os intervalos contíguos de falha |
| `E1`–`E3` | o host não faz aritmética de barra, não toca em `insets`, não conhece plataforma nem aparelho |
| `E4`–`E5` | **exatamente uma** montagem do host, e ela é a do shell; o *token* é lido por **um** arquivo |
| `E6` | nenhuma tela de aba compõe pela largura da **janela** sem medir — a lista de abas é lida de `TAB_DEFS`, então **uma sexta aba entra sozinha** |
| `E7` | **nenhuma tela** remenda a navegação por conta própria — a forma executável da lista de proibições da ordem |
| `E8` | *full-bleed* não é *window-bleed*: a superfície de sangria deriva a área da MEDIDA, e `inicioConteudo + regiao = janela` |

| Mutante | Regressão que ele nomeia | Veredito |
| --- | --- | --- |
| `MT-GUTTER-1` | remover a fronteira | **morto** — `[A1]` 600 dp: barra 180, recuo 0 |
| `MT-GUTTER-2` | medir **antes** da fronteira | **morto** — `[B1]` ordem invertida |
| `MT-GUTTER-3` | aplicar a fronteira no telefone | **morto** — `[A1]` 360 dp: sem barra, recuo 24 |
| `MT-GUTTER-4` | Ovelhinha volta a ler a **janela** | **morto** — `[C0]` |
| `MT-GUTTER-5` | Área dos Responsáveis se remenda sozinha | **morto** — `(E7)` |
| `MT-GUTTER-6` | zerar o *token* | **morto** — `[A1]` |
| `MT-GUTTER-7` | Estrelinhas volta à lógica antiga de grade | **morto** — `[D0]`, reabre as três faixas |
| `MT-GUTTER-8` | tela de aba compõe pela janela sem medir | **morto** — `(E6)` |
| `MT-GUTTER-9` | *full-bleed* volta a dimensionar pela janela | **morto** — `(E8)` |

**9/9 mortos.** Cláusula anti-fossilização: se a âncora de um mutante sumir do fonte, o
portão **falha** — mutante que não muta nada não prova nada.

Meta-mutação na **árvore real** (as duas restauradas e conferidas): zerar
`navContentGap` e remover `<NavigationContentHost>` deixam `npm run smoke` **vermelho**
(4979/4980, `G-GAP-1` reprovado). O portão morde a árvore de verdade, não só o arnês.

---

## 8. Portões — medidos, não presumidos

| Portão | Resultado |
| --- | --- |
| `npm run bundle:check` | **verde** — `gate:platform-scope` OK em **1485** arquivos; Android empacotou **2385** módulos |
| `npm run smoke` | **4980/4980**, 0 falhas *(baseline de entrada: 4979)* |
| `npm run verify:runtime` | **verde** |
| `npx expo-doctor` | **18/18** |
| focados | baterias **A**, **B**, **C**, **D** — 0 falhas na árvore real |
| mutantes | **9/9 mortos** |

### Runtime servido no aparelho (sem build nativo)

Aparelho `RX2XC003LTJ` (SM-X510) · Metro **já servindo a worktree canônica**
`C:\tmp\ptf_fase6_shell_splash_wt` (PID 24656, `expo start --dev-client`,
`packager-status:running`) · `adb reverse` = `UsbFfs tcp:8081 tcp:8081` ·
aberto por *deep link* no *Development Client*, sem instalar, desinstalar ou limpar dados.

**Prova de que o aparelho roda este HEAD** — marcadores presentes no *bundle* servido
(`GET /index.bundle?platform=android&dev=true&minify=false`, HTTP 200, 17.458.217 bytes):

| Marcador | Ocorrências |
| --- | ---: |
| `NavigationContentHost` | 16 |
| `navigationContentGap` | 4 |
| `navContentGap` | 6 |
| `gradeProbe` | 2 |
| `useContentViewport` | 38 |

---

## 9. O que este bloco **não** tocou

Zero condição por aparelho, modelo, plataforma ou resolução física. Zero *offset*
mágico. Zero alteração em: paywall, progresso, conquistas, `accessControl`, manifestos,
histórias, áudio, **assets**, `tokens.breakpoints`, *layout* do shell, `AppScreen`,
`TabletSidebar`, coordenadas/esconderijos/*sprites*/dificuldade da Ovelhinha,
*accordions* ou portão parental da Área dos Responsáveis.

**Registrados, com dono, e não corrigidos aqui** (nenhum é regressão deste bloco):

| Item | Onde | Dono |
| --- | --- | --- |
| `BeniGuideOverlay` mistura espaços de coordenadas | `:299`, `:370`, `:390`, `:398` | tour — `F7` |
| subtração literal de 64 dp da barra inferior | `ProfileScreen.js:114`, `HomeScreen.js:600` | `F6.x` |
| `editorialLayout` superestima `supportWidth` na Área dos Responsáveis | `editorialLayout` | `F6.x` |
| `insets.left` publicado e consumido por ninguém | `AppScreen` | `F6.x` |

---

## 10. Estado e pendências

- **`F6_2_COMPLETE = NÃO`.** `F6.2` **não** é declarada `PASS` final: falta a
  confirmação visual do fundador no aparelho, que está aberto em **Início** com este
  *bundle*.
- **Sem *push*.** Commit de implementação: **`bb33017`** (8 arquivos, +995/−32). Este
  documento vai em commit separado, de governança.
- **Nenhuma dívida transferida para `F6.3`.** A residual de Estrelinhas de `F6.2` foi
  quitada neste bloco, com o intervalo exato registrado em §6.
- **Nenhum risco de classe nova.** A matriz canônica `P-nnn` não é alterada.
- **`F6.3` não foi iniciada.**

---

## 11. Fechamento de `F6.2` — a fronteira VERTICAL (`F6.2R2`)

- **`ROOT_CAUSE` vertical.** O app é *edge-to-edge*: a janela vai até o último pixel e
  a barra do sistema desenha por cima. No telefone a **barra de abas** reserva
  `64 + insets.bottom` abaixo da cena; no tablet ela vira coluna à esquerda e o rodapé
  fica **sem dono**. Contrato aplicado, espelho do horizontal:
  `APP WINDOW → SYSTEM BOTTOM INSET → SAFE CONTENT AREA → SCREEN`. Na Ovelhinha havia
  um segundo defeito: `onLayout` media a *border box*, devolvendo a faixa da taskbar ao
  retângulo jogável.
- **Prova física do fundador (SM-X510 retrato, inset real de 48 dp): `PASS`.**
  - **Home** — `PASS`: "Uma oração curtinha" rola por completo acima da taskbar.
  - **Área dos Responsáveis** — `PASS`: o card "Administração (dev)" fecha acima da barra.
  - **Cadê a Ovelhinha** — `PASS`: a busca termina antes da faixa do sistema e o toque na
    ovelha continua pontuando (hitbox derivada do retângulo real).
- **Commit da correção:** **`28aba98`** (6 arquivos, +231/−18) — 4 de *runtime*, 2 de
  teste (`G-GAP-1` ganha a bateria F e os mutantes `MT-GUTTER-10..13`).
- **`F6_2_COMPLETE = SIM` · `F6.2 = PASS`.** Nenhuma dívida transferida; `F6.3` não foi
  iniciada e não há *push*.
