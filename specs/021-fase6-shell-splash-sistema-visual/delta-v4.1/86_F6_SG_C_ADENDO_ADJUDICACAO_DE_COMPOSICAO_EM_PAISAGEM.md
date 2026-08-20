# `86` — `F6-SG-C` · ADENDO DO FUNDADOR · adjudicação da composição em **paisagem**

> **Ato de entrada:** *"F6 SG C · HUMAN GATE · ADENDO DE OBSERVAÇÃO DO FUNDADOR"* (2026-08-19).
> **Ato que este artefato NÃO pratica:** conceder `F6-SG-C`. *"Não conceder SG C antes desta
> adjudicação."*
>
> **Fontes autorizadas e únicas usadas aqui:** vídeo físico já realizado (roteiro §8.4 do artefato
> `84`), `logcat` existente, *owners* das tasks, artefatos `84` e `85`, critérios canônicos de
> `SG-C`, e o **código atual** quando necessário para identificar a superfície.
> **Não** foi pedido vídeo novo. **Não** foi criado requisito novo. **Não** foi iniciado redesenho.
> **Não** foi corrigida estética por conveniência. **Nenhum** critério novo foi inventado para
> produzir uma classificação `A`.

---

## 1. As três respostas humanas, tomadas como fato

| | Pergunta do §8 do artefato `85` | Resposta do fundador |
|---|---|---|
| **Q1** | a barra lateral ficou visivelmente **mais larga** em paisagem que em retrato? | **SIM** |
| **Q2** | todo o conteúdo ocupou a largura de forma coerente, sem coluna estreita cercada de vazio? | **SIM, com ressalva** — *"Em algumas telas em paisagem, observei posicionamento e composição inadequados das informações. Não afirmo que todas as telas falharam."* |
| **Q3** | houve piscada, salto, volta ao início ou perda de estado nas rotações? | **NÃO** |

**Q3 = NÃO** confirma humanamente o que o `logcat` já provara (`not-handles={}` nas duas
rotações · `montagens #1 · desmontagens 0`): `CN-6`, `SD-1` caso 4 e a travessia de faixa
permanecem **PASS**, e o ADENDO **não os toca**.

**Q1 = SIM** é a chave causal deste artefato — e não por si mesmo. A barra passou de `rail`
(**180dp**) para `full` (**240dp**), como `navSidebarRole`/`navSidebarWidth` mandam. Foi exatamente
esse crescimento que **abriu** a discrepância descrita na §3: o espaço que sobra para o conteúdo
encolheu 240dp, enquanto a aritmética de composição de uma das telas continuou lendo a **janela
inteira**.

---

## 2. Geometria medida do aparelho, sem estimativa

Medidas do próprio `logcat` da sessão (SM-X510, `RX2XC003LTJ`):

| | Retrato | Paisagem |
|---|---|---|
| janela | `sw823dp w823dp h1317dp` | `sw823dp w1317dp h823dp` |
| faixa (`useWindowBand`) | **MÉDIA** (600–899) | **EXPANDIDA** (≥900) |
| papel da barra (`sidebarRole`) | `rail` | `full` |
| largura da barra (`navSidebarWidth`) | **180dp** | **240dp** |
| **região de conteúdo real** | 823 − 180 = **643dp** | 1317 − 240 = **1077dp** |

A barra é lateral por decisão do *shell*: `AppNavigator.js:329` — `tabBarPosition` vale `left` em
tablet e `bottom` no telefone. Logo, em tablet, **janela ≠ espaço disponível** nas duas faixas.

---

## 3. O mecanismo, dito uma vez e usado em todas as classificações

Os arquétipos aceitam `availableWidth` como **prop de primeira classe** e, na ausência dela,
caem para a janela — a mesma linha em `HubSurface.js` e em `EditorialSurface.js`:

```js
const { band, width } = useWindowBand();
const largura = Number.isFinite(availableWidth) ? availableWidth : width;
```

Esse recuo é **correto no arquétipo** (é o idioma declarado da família) e **errado no chamador que
vive à direita de uma barra lateral**, porque ali a janela tem 240dp que o conteúdo não pode usar.

O canon já diz qual é o comportamento certo, e **três telas já o praticam**:

| Tela | Como obtém o espaço | Veredito |
|---|---|---|
| `AtelierGalleryScreen.js:76-77` | `availableWidth: larguraLista` — **medido** | correto |
| `AdventureMapScreen.js:125-131` | `onContainerLayout` → `contentW` → `mapWidth`, com o comentário do próprio autor: *"o mapa deve usar a largura da ÁREA DE CONTEÚDO (à direita da sidebar), não a largura total da tela — senão fica cortado"* | correto |
| `StoryBookScreen.js:526-531` | `handleArtSectionLayout` → `artSectionSize` | correto |
| **`HomeScreen.js:805`** | **`HubSurface` chamado só com `minItemWidth` — sem `availableWidth`** | **incorreto** |
| `BrincarScreen.js:259` | sem `availableWidth` | incorreto, **sem manifestação** (§5.2) |
| `TrophiesScreen.js:250` | sem `availableWidth` | incorreto, **sem manifestação** (§5.3) |
| `StoryDetailScreen.js:611` | sem `availableWidth` | incorreto, **sem consequência visual** (§5.4) |

Não é regra nova: é a **restrição 4 de §19.1**, textual em `TabletSidebar.js` e citada no próprio
enunciado de `G-SID-3` em `scripts/smoke.js:54136`:

> *"Não é espaço disponível, e ninguém deve subtraí-la da janela para descobrir o que sobra: **quem
> precisa do espaço MEDE** (restrição 4 de §19.1 · `G-SID-3` · `RG-12`)."*

`HomeScreen` **precisa** do espaço — ele decide o número de colunas — e **não mede**.

---

## 4. Por que os portões automáticos estão verdes com este defeito de pé

Isto **precisa** ser dito, não contornado. `npm run smoke` devolveu **4970/4970**, com
`G-RSP-*`, `G-SID-*` e `G-BP-1` verdes, e ainda assim a §5.1 aponta um defeito objetivo. Não há
contradição, e a explicação é literal:

| Portão | O que ele realmente afirma | Por que não vê a §5.1 |
|---|---|---|
| `G-SID-3` (`smoke.js:54106-54140`) | proíbe a **maneira errada** de obter o espaço: nenhuma subtração de `navSidebarWidth`/`sidebarWidth`, e um único consumidor do *token* | é uma proibição **negativa**. `HomeScreen` não subtrai — ele **nem tenta**. Quem simplesmente adota a janela passa em silêncio |
| `G-RSP-6` (`smoke.js:53688-53716`) | exercita `editorialLayout` com `availableWidth: 1180` **fornecido pelo arnês** e prova que a coluna é a de `ContentContainer`, não encolhe ao crescer a janela, e que o excedente vira apoio | testa a **aritmética do arquétipo**, nunca o **valor que o chamador entrega**. Com a entrada certa, a conta está certa — e está |
| `G-RSP-2` (`smoke.js:53791`) | exercita `hubComposition` com `availableWidth: 1180` explícito | idem: nível de arquétipo, não de chamador |
| `G-RSP-1/3/4/5/7`, `G-SID-1/2/4`, `G-BP-1` | fonte única, ausência de arquitetura paralela, ausência de *breakpoint* paralelo, inventário da barra | eixos **ortogonais** a este defeito |

**Conclusão factual:** nenhum portão do *corpus* verifica se um **consumidor** de arquétipo entrega
um `availableWidth` **medido**. Essa lacuna é da rede automática, e é precisamente o que a
**validação física** existe para pegar — foi o que ela pegou. Registrar isso **não** cria portão
novo aqui: a criação de um portão é ato de task, e nenhuma task nova é criada neste artefato.

---

## 5. Superfícies em paisagem, uma a uma

Inventário fechado pelo roteiro §8.4 (passos 13–17), que é o que o vídeo contém: `StoryBookScreen`
(13), `StoryDetailScreen` (14), `AdventureMapScreen` (15), `HomeScreen` (16 e 17), `BrincarScreen`,
`TrophiesScreen` e `ProfileScreen` (17). **Sete superfícies.**

### 5.1 `HomeScreen` — **A · `VIOLA_CRITERIO_SG_C`**

**Aritmética, com os números do aparelho.** `HUB_MIN_CARD = 420`, `gap = 0`, 5 destinos na grade,
faixa EXPANDIDA (teto `grid.tabletL = 3`):

| | com a janela (o que o código faz) | com a região real (o que deveria) |
|---|---|---|
| largura de entrada | **1317dp** | **1077dp** |
| `cabimento = floor(w / 420)` | `floor(3,136)` = **3** | `floor(2,564)` = **2** |
| `viavel = min(teto 3, cabimento, inventário 5)` | **3** | **2** |
| `hubBalanced` (5 itens) | última linha com 2 — sem órfão → **3 colunas** | piso de 2 → **2 colunas** |
| largura da célula (`cell: { flex: 1 }`) | 1077 / 3 = **≈359dp** | 1077 / 2 = **≈538dp** |
| contra o mínimo declarado de **420dp** | **−61dp (−14,5%)** | **+118dp** ✔ |
| largura útil do cartão (menos `marginHorizontal: 16` de cada lado) | **≈327dp** | ≈506dp |

**`OBSERVED_BEHAVIOR`** — em paisagem, a grade da Home compõe **três** colunas numa região que,
pelo mínimo declarado pela própria tela, comporta **duas**. Cada cartão recebe ≈327dp úteis contra
os *"pouco mais de 400dp somando os respiros"* que o comentário de `HUB_MIN_CARD` documenta como
piso — e esse mesmo comentário diz o que acontece abaixo dele: *"o título e a etiqueta se
atropelam, e a coluna não deve se dividir"* (`HomeScreen.js:71-81`).

**`CANONICAL_CRITERION`** — quatro critérios **preexistentes**, nenhum criado aqui:

1. **§19.1 restrição 4 · `G-SID-3` · `RG-12`** — *"quem precisa do espaço MEDE"*. A tela decide
   colunas a partir de geometria **estimada** (a janela), não medida. É a classe de defeito que
   `R2.3` existe para corrigir e que `RG-12` nomeia.
2. **`SD-2`** — a composição por faixa é do arquétipo; `hubComposition` cumpre seu contrato, mas
   sobre uma entrada que não descreve a superfície real. O `minItemWidth` é uma **garantia**, e ela
   é rompida no ponto de chamada.
3. **`SD-3` · `PLAN §18`, invocado pela própria tela** — o comentário de `HomeScreen.js:795-803`
   declara que os cinco destinos existem para que *"a faixa larga deixa de ser coluna estreita
   cercada de vazio (PLAN §18)"*. A tela se coloca, por escrito, sob o critério de composição da
   faixa larga. O mecanismo desenhado para curar o vazio produziu **compressão**.
4. **Exemplo literal da categoria `A` do próprio ADENDO** — *"conteúdo comprimido indevidamente"*.

**`CLASSIFICATION` = `VIOLA_CRITERIO_SG_C`**

**`SG_C_IMPACT`** — atinge `TK-C-040` (§28 #15 *landscape*) e a célula **Hub × EXPANDIDA** de
`TK-C-042`. **Não** atinge `CN-6`, `SD-1` caso 4, `SD-8`, nem qualquer resultado de retrato.

**Por que só em paisagem** — em retrato a conta é 823dp de janela contra 643dp de região:
`floor(823/420) = 1` e `floor(643/420) = 1`. **Mesmo resultado.** O erro de entrada existe nas duas
orientações; ele só **se manifesta** na faixa EXPANDIDA. Isso reproduz exatamente o recorte da
observação do fundador (*"em algumas telas em paisagem"*) e explica por que `TK-C-039` (retrato)
não é atingida.

### 5.2 `BrincarScreen` — **sem ocorrência**

`HUB_MIN_BLOCO = 420`, 4 blocos. Com 1317: `cabimento` 3, `viavel` 3, mas `hubBalanced` recua para
**2** (a 4ª ficaria órfã, e o recuo não custa linha extra). Com 1077: `cabimento` 2 → **2**.
**Mesma composição pelos dois caminhos**; célula ≈538dp ≥ 420. O erro de entrada está presente e
**não produz efeito**. Nada a classificar.

### 5.3 `TrophiesScreen` — **sem ocorrência**

`HUB_MIN_CARD = 320`, `HUB_GAP = 10`. Com 1317: `floor(1327/330)` = 4, limitado pelo teto → **3**.
Com 1077: `floor(1087/330)` = **3**. **Mesma composição**; célula ≈352dp ≥ 320. Erro de entrada
presente, **latente**, sem manifestação nesta janela. Nada a classificar.

### 5.4 `StoryDetailScreen` — **sem ocorrência**

`EditorialSurface` também recebe a janela em vez da região, mas aqui o número errado **não governa
pixel algum**: `supportWidth`/`voidWidth` são **diagnóstico**; a distribuição real é *flexbox*
(`leitura: { flexShrink: 0 }` com `maxWidth` de `ContentContainer` = 640dp · `apoio: { flex: 1 }`).
Em EXPANDIDA, com história normal, `guiaNaListaDeCenas` abre o apoio
(`StoryDetailScreen.js:424-425`, dentro do ramo com cenas) → `dominantVoid = false`,
`voidWidth = 0`. **`SD-3` satisfeito.** As faixas de largura cheia (herói, ação principal,
pós-cenas) são decisão **ratificada** de `TK-C-006`, declarada no próprio arquivo: *"são faixas de
exibição, não leitura corrida"*. Nada a classificar.

### 5.5 `StoryBookScreen` (Livrinho, passo 13) — **B · `RESIDUAL_VISUAL_FORA_DO_GATE`**

**`OBSERVED_BEHAVIOR`** — em paisagem a arte 4:5 passa a ser limitada pela **altura** da área medida
(≈823dp menos cabeçalho e painel), e o excedente horizontal da região de 1077dp fica **vazio dos
dois lados** da ilustração.

**`CANONICAL_CRITERION`** — `TK-C-004` / `TK-C-011`, no cabeçalho de `ImmersiveSurface.js`, que
antecipa este exato estado e o **defere por contrato**: *"A faixa expandida comporta uma composição
acompanhante (livro aberto, apoio — `D10`), mas `TK-C-004` só declara a capacidade: a composição em
si é entrega de `F9`, e antecipá-la seria invadir fase alheia."* O mesmo arquivo proíbe a
"correção" oposta: *"espremer a ilustração numa largura de texto seria trocar a família pela do
lado"*, e `immersiveComposition` devolve `imposesColumn: false, cropsArt: false`. A área **é
medida** (`artSectionSize`), então a restrição 4 de §19.1 está cumprida. `G-RSP-6` trata da coluna
de **leitura** da família Editorial — não há coluna aqui.

**`CLASSIFICATION` = `RESIDUAL_VISUAL_FORA_DO_GATE`** — o espaço lateral é **capacidade declarada e
não preenchida**, com dono nomeado (`F9`), não quebra de contrato.

**`SG_C_IMPACT`** — nenhum. A célula **Imersiva × EXPANDIDA** de `TK-C-042` permanece coberta:
`SG-C` pede que a família **funcione** na faixa, e ela funciona.

### 5.6 `AdventureMapScreen` (passo 15) — **sem ocorrência de `SG-C`**

Mede a região (`contentW`) e usa `mapWidth = 1077` para `computeRegionLayout`: a arte 9:16 ocupa a
largura **inteira** e rola na vertical. **Não há vazio lateral e não há estimativa.** Além disso, a
composição do mapa (âncora `0,50`, região, pino, câmera) pertence a **`SG-B`, já concedido** — este
artefato não a reabre.

### 5.7 `ProfileScreen` (passo 17) — **B · `RESIDUAL_VISUAL_FORA_DO_GATE`**

**`OBSERVED_BEHAVIOR`** — a tela não adota arquétipo algum e não impõe largura máxima (usa apenas
`useWindowDimensions()` para a **altura**, `ProfileScreen.js:90`). Em paisagem seus blocos se
estendem pelos 1077dp da região; o resultado é uma composição **larga e esparsa**, com informação
distribuída ao longo de uma linha longa.

**`CANONICAL_CRITERION`** — o inventário de adoção das quatro famílias é **fechado por contrato**
(artefato `84` §6.2, de `TK-C-011`/`TK-C-012`): Hub = `Home`, `Brincar`, `Trophies`,
`AtelierGallery`; Editorial = `StoryDetail`, `Reflection`, `PostStoryHub`, `ParentArea`; Imersiva =
`StoryBook`, `Coloring`, `AtelierCanvas`; Jogo = nenhuma. **`ProfileScreen` não está em nenhuma
delas**, e migrar telas remanescentes é escopo de **`F12A`**. `SD-3`/`G-RSP-6` regem a coluna de
leitura da família **Editorial**; não existe, em `SG-C`, critério que obrigue toda tela a impor
coluna. Exigir isso agora seria **inventar critério para produzir `A`** — expressamente vedado.

**`CLASSIFICATION` = `RESIDUAL_VISUAL_FORA_DO_GATE`** — *"composição funcional mas esteticamente
não ideal"*, na letra da categoria `B`.

**`SG_C_IMPACT`** — nenhum. **Ponteiro honesto:** se o fundador quiser esta tela sob contrato de
composição, o caminho é a adoção de arquétipo em `F12A`, com task própria — **não** um remendo aqui.

---

## 6. Resultado consolidado das tasks, **depois** do ADENDO

| Task | Antes do ADENDO (artefato `85`) | Depois do ADENDO |
|---|---|---|
| `TK-C-039` — §28 #15 *portrait* | PASS | **PASS** — inalterada; o defeito da §5.1 não se manifesta em MÉDIA (`floor(823/420) = floor(643/420) = 1`) |
| `TK-C-040` — §28 #15 *landscape* | PASS material, pendente da vista do fundador | **FAIL PARCIAL — 1 superfície de 7** (`HomeScreen`). A faixa foi habitada e navegada 88 s sem falha de *runtime*; a **composição** de uma superfície viola `SD-2`/§19.1 restrição 4 |
| `TK-C-042` — 4 famílias × 3 faixas | 3 células instrumentadas · 3 no vídeo · 3 no vão · 3 sem consumidor | **Hub × EXPANDIDA = FAIL** (§5.1) · **Editorial × EXPANDIDA = PASS** (§5.4) · **Imersiva × EXPANDIDA = PASS** (§5.5) · demais **inalteradas** |
| `TK-C-043` — alvos da barra **medidos** | NÃO SATISFEITA | **NÃO SATISFEITA** — inalterada. O ADENDO não a toca: Q1 confirma a **largura**, não a **medição dos alvos**, e o *hardware* literal do *owner* é **iPad** |
| `CN-6` · `SD-1` caso 4 · `PLAN §33` rota (i) · `SD-8` | PASS / SATISFEITO / CUMPRIDA / INTACTA | **inalterados** — Q3 = NÃO os reforça |
| `PHONE_GAP` · `IPAD_GAP` | `BLOCKING_UNSATISFIED_REQUIREMENT` | **inalterados** |

---

## 7. Patch mínimo proposto — **proposto, não aplicado**

Escopo restrito, na letra da ordem: *"limitar a correção SOMENTE às violações objetivas de SG C
identificadas"*. Isso é **uma** violação, em **um** arquivo, no **ponto de chamada**.

**Arquivo único: `src/screens/HomeScreen.js`.**

1. Um `onLayout` no contêiner que já envolve a grade, guardando a largura arredondada em estado
   (mesmo formato de `AdventureMapScreen.js:126-131` e de `StoryBookScreen.js:526-531` — nenhum
   idioma novo).
2. Passar essa largura na chamada de `HomeScreen.js:805`, como `availableWidth`. A prop **já é de
   primeira classe** em `HubSurface` e já é usada assim por `AtelierGalleryScreen`.

**O que o patch NÃO faz** — não toca `HubSurface.js` nem nenhum arquétipo; não muda `tokens.js`;
não muda `HUB_MIN_CARD`; não mexe em `Brincar`, `Trophies`, `StoryDetail`, `StoryBook`,
`AdventureMap` ou `Profile`; não corrige residual visual algum; não toca *onboarding* nem tour; não
adiciona dependência; não cria task, portão ou critério.

**Efeito medido, antes de qualquer linha:** paisagem 3 → **2 colunas**, célula 359 → **538dp**;
retrato **inalterado** (1 coluna pelos dois caminhos). Nenhuma outra tela muda.

**Revalidação mínima necessária:**

| Passo | Motivo |
|---|---|
| `npm run verify:runtime` (`bundle:check` **depois** `smoke`) | `src/**` alcançável — obrigação global de `AGENTS.md` |
| `npx expo-doctor` | portão de conclusão |
| **1 verificação visual em paisagem, na tela Início, no SM-X510** | a mudança é de composição; *smoke* e *doctor* não substituem vista |

**Sobre a verificação visual:** o *runtime* instalado é *development build* e o JavaScript vem do
Metro — **não** é necessário `build` novo. E ela é **fotografia**, não roteiro: uma tela, uma
orientação, um enquadramento. **Não** é o vídeo de §8.4 de novo, e **nenhum vídeo novo é pedido
por este artefato**.

**Nada disto foi executado.** Nenhum arquivo de `src/` foi tocado.

---

## 8. Estado de arquivos

| Arquivo | Estado |
|---|---|
| `specs/.../86_F6_SG_C_ADENDO_ADJUDICACAO_DE_COMPOSICAO_EM_PAISAGEM.md` | **salvo no disco, untracked** |
| `specs/.../85_F6_SG_C_ADJUDICACAO_FISICA_E_HUMAN_GATE.md` | **salvo no disco, untracked** (inalterado por este artefato — a §6 acima é o adendo; o `85` permanece como registro do estado anterior) |
| `specs/.../84_F6_SG_C_ABERTURA_PATCH_E_FRONTEIRA_FISICA.md` | **commitado** em `4a433a0` (`docs: abrir F6-SG-C e reconstruir a fronteira física`), que é o `HEAD` corrente |
| `docs/DECISIONS.md` | **modificado no disco, não indexado** (+26 linhas, bloco `D-FUND-F6-SG-C-PLAN-33-ROTA-I-01`) |
| `package.json` · `package-lock.json` | **commitados** em `9f1229c` (`chore: alinhar expo e expo-file-system ao catálogo SDK 54`) — sem modificação pendente |
| `src/**`, `scripts/**`, `plugins/**`, `app.json` | **intocados** — `HEAD` inalterado em `4a433a0` |

**Nenhum `git add` foi executado. Nenhum *commit*. Nenhum *push*. Nenhum *build*. Nenhuma ação
física no tablet.**

---

## 9. Bloco de retorno do ADENDO

```
LANDSCAPE_OBSERVATIONS      = 7 superficies em paisagem no roteiro §8.4 (passos 13-17);
                              2 com ocorrencia de composicao identificavel;
                              1 objetiva (A) · 2 residuais (B)
AFFECTED_SURFACES           = HomeScreen (A) · StoryBookScreen/Livrinho (B) · ProfileScreen (B)

FOR_EACH_SURFACE:
  [1] HomeScreen
      OBSERVED_BEHAVIOR   = grade compoe 3 colunas numa regiao de 1077dp que so comporta 2
                            pelo minimo declarado pela propria tela; celula ~359dp contra
                            HUB_MIN_CARD = 420dp (-14,5%); cartao util ~327dp
      CANONICAL_CRITERION = §19.1 restricao 4 · G-SID-3 · RG-12 ("quem precisa do espaco MEDE")
                            + SD-2 (garantia de minItemWidth rompida no ponto de chamada)
                            + SD-3 / PLAN §18, invocado pelo comentario da propria tela
      CLASSIFICATION      = VIOLA_CRITERIO_SG_C
      SG_C_IMPACT         = TK-C-040 (landscape) e celula Hub x EXPANDIDA de TK-C-042.
                            Nao atinge TK-C-039, CN-6, SD-1 caso 4, SD-8 nem TK-C-043

  [2] StoryBookScreen (Livrinho, paisagem)
      OBSERVED_BEHAVIOR   = arte 4:5 limitada pela altura; excedente horizontal vazio nos dois lados
      CANONICAL_CRITERION = TK-C-004 / TK-C-011 — a composicao acompanhante da faixa expandida
                            (D10) e entrega DECLARADA de F9; a area e MEDIDA (artSectionSize)
      CLASSIFICATION      = RESIDUAL_VISUAL_FORA_DO_GATE
      SG_C_IMPACT         = nenhum — a familia FUNCIONA na faixa (celula Imersiva x EXPANDIDA PASS)

  [3] ProfileScreen (paisagem)
      OBSERVED_BEHAVIOR   = sem arquetipo e sem largura maxima; blocos esparsos ao longo de 1077dp
      CANONICAL_CRITERION = inventario de adocao fechado por TK-C-011/TK-C-012 (84 §6.2);
                            telas remanescentes sao escopo de F12A; SD-3/G-RSP-6 regem a coluna
                            de leitura da familia Editorial, e ProfileScreen nao pertence a ela
      CLASSIFICATION      = RESIDUAL_VISUAL_FORA_DO_GATE
      SG_C_IMPACT         = nenhum

  SEM OCORRENCIA: BrincarScreen (2 colunas pelos dois caminhos) ·
                  TrophiesScreen (3 colunas pelos dois caminhos) ·
                  StoryDetailScreen (apoio abre; dominantVoid = false) ·
                  AdventureMapScreen (mede contentW; largura cheia; e pertence a SG-B, concedido)

TK_C_039_RESULT             = PASS (inalterado — o defeito nao se manifesta em MEDIA)
TK_C_040_RESULT             = FAIL PARCIAL — 1 superficie de 7 (HomeScreen)
TK_C_042_RESULT             = Hub x EXPANDIDA = FAIL · Editorial x EXPANDIDA = PASS ·
                              Imersiva x EXPANDIDA = PASS · demais celulas inalteradas
TK_C_043_RESULT             = NAO SATISFEITA (inalterado — o ADENDO nao a toca; hardware literal = iPad)

SG_C_MATERIAL_STATUS_AFTER_ADENDO = NAO CONCEDIVEL — uma violacao objetiva ABERTA (HomeScreen),
                                    somada aos dois BLOCKING_UNSATISFIED_REQUIREMENT (telefone, iPad)
                                    e a TK-C-043 NAO SATISFEITA, todos inalterados

FIX_REQUIRED_BEFORE_SG_C    = SIM
```

**Escopo da correção autorizada por esta adjudicação, e nada além:** `src/screens/HomeScreen.js`,
ponto de chamada de `HubSurface`, passando `availableWidth` **medido**. Residuais `[2]` e `[3]`
ficam **registrados para a fase proprietária futura** (`F9` e `F12A`, respectivamente) e **não são
corrigidos**. Tour e *onboarding* **não** são tocados. Nenhum critério, portão, task ou requisito de
*hardware* é criado.

```
F6_SG_C = NÃO CONCEDIDO — aguarda (a) autorização do patch mínimo da §7 e (b) ato humano explícito
STOP_HUMAN_DECISION
```
