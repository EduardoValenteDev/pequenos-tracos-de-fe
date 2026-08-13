# Verificações finais e física pendente de `F6-SG-C` — `TK-C-038`..`TK-C-045`

> **Pacote:** `BLOCO 6` · `F6-SG-C` · **Commit deste artefato:** `C-GOV1` ·
> **Mudança de código esperada:** **nenhuma**.
>
> Oito tasks, dois tipos. `TK-C-038`..`TK-C-043` são **físicas** e por isso ficam
> **registradas com roteiro**, não executadas — a orientação vigente manda registrar e
> continuar, e nenhuma propriedade visual ou de *layout* nativa pode ser promovida por
> Node. `TK-C-044` e `TK-C-045` são **`Auto: parcial`** e estão executadas aqui, com
> parecer item a item.

---

## 1. Inversão de premissa que este artefato precisa declarar antes de tudo

`TK-C-062` está escrita com a premissa *"hoje **não tem aparelho disponível** (`P8`)"* e o
seu estado canônico é **`PENDENTE — SEM APARELHO`**. **Essa premissa está invertida em
relação ao parque de aparelhos real**, e a inversão importa porque muda *quais* tasks
estão bloqueadas.

| Aparelho | Disponível | Fonte |
|---|---|---|
| **Tablet Android** — Samsung **SM-X510** (Android 16, `targetSdk` 36, ≈`sw823dp`) | **SIM**, em uso | PLAN §33, emenda de 2026-08-10 (`D-1`) · medições do fundador no artefato `21` |
| **iPad** | **NÃO** | artefato `10` §"iPad — **NÃO** · `R6` (§27, literal)" |
| Telefone Android real | **NÃO** (`R6`) | artefato `10` §"telefone real = NÃO" |

**Consequência, dita sem suavizar:** o rótulo `SEM APARELHO` de `TK-C-062` descreve o
aparelho **errado**. O tablet Android existe; o que **não** existe é o iPad — e são as
tasks `TK-C-041` (Split View) e `TK-C-043` (§28 #16, barra lateral em iPad) que estão
bloqueadas por indisponibilidade, além de `TK-C-038` (telefone real).

**O que a inversão NÃO muda:** `TK-C-062` continua **`PENDENTE`**, e `SD-1` continua
**não concedível** (emenda `A-13`). Duas razões independentes:

1. **O roteiro não foi executado.** O que existe do SM-X510 é uma **sonda de rotação**
   (`ROTATION_0` → `ROTATION_90` → `ROTATION_0` com a `MainActivity` em foco) e duas
   medidas de configuração. `TK-C-062` pede o **roteiro completo**: retrato **e**
   paisagem, as **quatro** famílias de superfície, a barra lateral e a travessia de faixa.
   Uma sonda não é o roteiro.
2. **O *build* medido não contém a rota (C).** As medições do SM-X510 são anteriores a
   `e2702d2`. O aparelho girou pela **exceção de telas grandes do Android 16**, não pelo
   qualificador `sw600dp` — o artefato `21` já registra isso e proíbe usar aquela rotação
   como prova do *plugin*. **Nenhum *build* instalado em qualquer aparelho contém hoje a
   rota (C).**

Esta seção **não altera** o texto de `TK-C-062` nem escolhe rota de §33. Registra o fato e
o entrega ao fundador — como o artefato `20` §9.1 fez com a defasagem de PLAN §20.3.

---

## 2. `TK-C-038`..`TK-C-043` — as seis tasks físicas, registradas

**Nenhuma foi executada.** Para cada uma: o que exige, o aparelho, e o estado.

| Task | O que exige | Aparelho | Estado |
|---|---|---|---|
| `TK-C-038` · regressão em **telefone** | parcela `SG-C` do §28 **#17** + reexecução de §28 **#1**, **#4**, **#7**; capturas comparativas por família; `CN-11` + `CN-1` — **o telefone não pode piorar** | telefone Android real | **PENDENTE — SEM APARELHO** (`R6`) |
| `TK-C-039` · tablet ***portrait*** | parcela *portrait* do §28 **#15**; capturas por família; `SD-2`, `SD-3`, `SD-4` na faixa **média** | SM-X510 (**disponível**) | **PENDENTE — SEM *BUILD* COM A ROTA (C)** |
| `TK-C-040` · tablet ***landscape*** | parcela *landscape* do §28 **#15**; faixa **expandida**; nenhuma coluna estreita cercada de vazio em `>=900dp` | SM-X510 (**disponível**) | **PENDENTE — SEM *BUILD* COM A ROTA (C)** |
| `TK-C-041` · ***resize*** (Split View / Slide Over) | §28 **#6** reexecutado sob a ótica de `R1`; travessia de `600dp` arrastando o divisor; `SD-9` + `CN-6`; vídeo | **iPad** | **PENDENTE — SEM APARELHO** |
| `TK-C-042` · consistência entre as **quatro famílias** | matriz **4 famílias × 3 faixas = 12 células**, uma captura por célula, veredito comparativo de `SD-2` | tablet + telefone | **PENDENTE** — depende de `TK-C-038`..`TK-C-041` |
| `TK-C-043` · verificação final da **barra lateral** | §28 **#16**: barra em **iPad** retrato e paisagem, vazio vertical medido **em pontos**, os **cinco** `registerGuideTarget` medidos no aparelho; `CN-5`; defeitos 1–3 corrigidos e **4–5 abertos** em `B2` | **iPad** | **PENDENTE — SEM APARELHO** |

### 2.1 Por que `TK-C-039`/`TK-C-040` não são executáveis hoje, mesmo com o tablet na mão

Porque o *build* instalado no SM-X510 é anterior a `e2702d2` e a `RD-4` agrupa **todas** as
mudanças nativas da Fase 6 em **um único** *build* ao fim de `R1` — que é exatamente por
que `OR-6` põe a orientação por último. Executar o roteiro no *build* atual mediria o
comportamento **antigo** e produziria evidência que teria de ser descartada depois. O
gatilho destas duas tasks é o **primeiro *build* nativo**, que é também onde a compilação
AAPT2 da rota (C) fecha (artefato `21` §5).

### 2.2 O que a automação **não** substitui aqui

`TA-9` e `G-SID-1` provam que os cinco `registerGuideTarget` **existem** e estão nomeados
no código. `TK-C-043` pede outra coisa: que eles sejam **medidos no aparelho**. Presença
estática e geometria real são propriedades distintas, e é a segunda que o tour precisa
para acertar a mira. **Nada em `BLOCO 6` autoriza confundir as duas.**

---

## 3. `TK-C-044` — verificação final dos ***tokens***

**Executada.** *Diff* de `src/theme/tokens.js` entre `ffe856c` (último estado anterior a
`F6-R1`) e `da16b18`: **+40 linhas, −2**, nenhuma remoção de símbolo, nenhuma mudança de
valor pré-existente.

| Item | O que mudou | Parecer |
|---|---|---|
| `breakpoints` | **nada** — `{ phone: 0, tablet: 600, tabletL: 900 }` intacto | ✅ fonte única preservada · `G-BP-1` `[4529]`–`[4531]` · `G-RSP-7` `[4546]`/`[4547]` |
| `maxContentWidth` | **nada** | ✅ o dono da coluna de leitura continua sendo `ContentContainer` (`G-RSP-6` cláusula A) |
| `grid` | **valor idêntico**; ganhou comentário e consumidor **nomeado** (`HubSurface.HUB_COLUMN_CEILING`) | ✅ `Q4` resolvida pelo ramo **consumidor presente**, não por remoção · `G-RSP-2` `[4928]` |
| `displayScaleTablet` | **valor idêntico** (`1.10`); ganhou consumidor **único** (`displayType.js:46`) | ✅ um só auxiliar, consultado por Hub **e** Editorial · `G-RSP-2` `[4929]` |
| `navSidebarRole` | **novo** — `{ tablet: 'rail', tabletL: 'full' }` | ✅ `Q9` cumprida **além da renomeação**: declara o **cruzamento papel × faixa** exigido por §19.1, não uma constante movida de lugar |
| `navSidebarWidth` | **novo** — `{ rail: 180, full: 240 }` | ✅ largura **estrutural** por papel; `G-SID-2` `[4934]` impede literal equivalente fora daqui, `G-SID-3` `[4935]` impede derivar "espaço disponível" subtraindo-a |
| agregador `tokens` | os dois novos símbolos acrescentados | ✅ coerente com o padrão existente |

**Três propriedades que o parecer afirma, e onde cada uma está provada:**

1. **Nenhum *token* morto por inércia.** `grid` e `displayScaleTablet` eram `P-82`/`P-148`
   — declarados e inertes. Hoje cada um tem consumidor que **importa de `theme/tokens` e
   usa** (`G-RSP-2` verifica as duas metades, não só a importação). Prova vermelha:
   `MT-8`.
2. **Nenhuma remoção preventiva.** Nenhum símbolo saiu de `tokens.js` no delta. O ramo
   "símbolo ausente e obsolescência registrada", que `TK-C-061` também autorizava, **não**
   foi escolhido — e não foi escolhido por conveniência, mas porque havia consumidor
   legítimo a criar.
3. **A ausência de `phone` em `navSidebarRole` é contrato, não esquecimento.** No telefone
   não existe navegação lateral; uma chave `[phone]` seria número sem referente e um
   consumidor distraído reintroduziria a barra onde `CN-1` a proíbe. É a restrição 6 de
   §19.1 escrita **na forma** do *token*.

**Limite declarado:** este parecer é sobre o *diff* e sobre o que os portões medem. Se os
valores `180`/`240` são os **certos** para a criança é pergunta **física** — `TK-C-019`/
`TK-C-020` e `TK-C-043`. O *token* existe justamente para que ajustá-los depois da captura
seja **uma linha aqui**, não uma caçada a literais.

---

## 4. `TK-C-045` — ausência de arquitetura paralela

**Executada.** Inventário de `src/components/layout/`, `src/hooks/` e `src/services/`,
procurando **duas implementações concorrentes para a mesma responsabilidade**.

| Responsabilidade | Implementação única | Verificação |
|---|---|---|
| **Faixa** (medida → política) | `src/hooks/useWindowBand.js` | `export const BANDS` aparece em **exatamente um** arquivo de `src/`; é o único que importa `breakpoints` para **decidir** faixa |
| **Projeção `contain`** | `src/hooks/useViewportProjection.js` | consumidor de *layout*: só `ImmersiveSurface.js:77`. As menções em `AtelierCanvas.js:109` e `ColoringCanvas.js:206` são **comentários** que apontam para a conta canônica dentro do `template literal` do WebView — outro ambiente de execução, não um segundo módulo JS |
| ***Lifecycle*** de superfície | `src/hooks/useSurfaceLifecycle.js` | três consumidores (`BeniGuideOverlay`, `AtelierCanvasScreen`, `ColoringScreen`), **um** contrato |
| **Âncora / alvos de guia** | `src/services/guideTargetRegistry.js` | um registro, sete consumidores; nenhum componente mantém tabela própria de alvos |
| **Escala de *display*** | `src/components/layout/displayType.js` | auxiliar **único**; Hub e Editorial consultam, nenhum recalcula |
| **Coluna de leitura** | `src/components/ui/ContentContainer.js` | `EditorialSurface` **pergunta** (`contentColumnMaxWidth`) em vez de reimplementar — cláusula A de `G-RSP-6`, prova vermelha `MT-20` |
| **Teto de colunas** | `src/components/layout/HubSurface.js` | o único que conta colunas; o teto vem de `grid`, nunca de literal |

**Os quatro arquétipos não fundam *design system* paralelo.** `G-RSP-4` `[4940]` varre 11
módulos de *layout* em três eixos (nome exportado colidindo com `tokens.js`, literal
numérico igual a valor de `tokens.js`, objeto com chave `phone:`/`rail:` e valor literal).
Prova vermelha independente: `MT-32`.

### 4.1 Um esclarecimento que o inventário obriga

**24 módulos de `src/` usam `useWindowDimensions` diretamente** — além do próprio
`useWindowBand.js`; a 26ª ocorrência, em `tokens.js:127`, é comentário. E isso **não** é
arquitetura paralela. `useWindowDimensions` é a primitiva de **medida** do React Native; o
que `R1` centraliza é a **tradução de medida em política**, e essa continua tendo dono
único. A separação é verificável, não retórica: `G-RSP-5` eixo B reprova qualquer
comparação literal de largura **fora** de `useWindowBand.js` — prova vermelha `MT-22` — e
`G-RSP-1` `[4544]` reprova `Dimensions.get` em qualquer lugar, porque *aquilo* sim é
medida congelada. Medir é livre; **decidir** é do *hook*.

---

## 5. Referências

`TK-C-038`..`TK-C-045`, `TK-C-062`, `TK-C-019`, `TK-C-020`, `TK-C-061` · PLAN §19.1
(restrições 1–6), §27, §28 (#1, #4, #6, #7, #15, #16, #17), §33 · `SD-1`, `SD-2`, `SD-3`,
`SD-4`, `SD-9` · `CN-1`, `CN-5`, `CN-6`, `CN-11` · `Q4`, `Q9` · `RD-4`, `RG-2`, `RG-9`,
`OR-6` · emendas `A-12`, `A-13` · artefatos `10`, `14`, `20`, `21`, `22`.
