# F6-DELTA0 · Clarify e *Checklist* de requisitos

> **Etapas SDD 2 e 3** aplicadas ao delta
> [`01_SPEC_DELTA_F6_R1_R2_R3.md`](01_SPEC_DELTA_F6_R1_R2_R3.md).
>
> **Regra de disciplina aplicada:** as decisões `D1`–`D18` do fundador **não** são reabertas. Uma
> pergunta só entra neste Clarify se for **genuinamente aberta** ou se houver **conflito técnico
> comprovado por código** com uma decisão — e nesse caso o conflito é apresentado com a prova, não
> com opinião. Nenhuma pergunta abaixo pede ao fundador que reconsidere algo que ele já decidiu.

---

## 1. Perguntas abertas — exigem decisão antes do Portão 2

### `Q1` · Identidade dos códigos novos — a série `E` × a matriz `P` **[BLOQUEANTE]**

**O fato.** O prompt determina *"preservar as 22 fases e os códigos `E000–E089`"*. A varredura
exaustiva de `docs/` e `specs/` neste HEAD devolve apenas `E003–E018`, `E022`, `E023`, `E039`,
`E042`, `E075`, `E076`, `E077`. **`E028`, `E032`, `E034`, `E035`, `E036`, `E049`, `E050`, `E052`,
`E053`, `E055`, `E066`–`E072` e `E078`–`E089` não existem neste repositório.** O próprio
`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:282` afirma textualmente que `E039` e `E042` *"**não**
possuem representação versionada neste repositório"*.

A identidade canônica de pendência aqui é a matriz **`P-01..P-149`**, adotada em `E018` como
**única** fonte de riscos, precisamente para acabar com esquemas concorrentes (matriz §22).

**O que fiz, provisoriamente.** Registrei os 18 achados como **`P-150` a `P-167`** na matriz
canônica, **preservando os rótulos `F6-*` / `F7-*` / `F9-*` / `F12A-*` do fundador como aliases
canônicos** na coluna "Aliases e relações" — o mesmo mecanismo já usado para absorver a série `R`
em `E018` §22. Nenhum código foi renumerado; nenhum esquema concorrente foi criado.

**O que preciso do fundador.** Confirmar **uma** das três:
- **(a)** A solução acima é a canônica — os rótulos `F6-*` são apelidos, os números `P` mandam.
- **(b)** A série `E` deve ser **importada** para o repositório como eixo versionado próprio, com
  mapeamento declarado para os códigos `P`.
- **(c)** A série `E` permanece **exclusivamente** no *checklist* mestre externo do fundador e este
  repositório nunca a versiona.

**Por que bloqueia.** Sem essa definição, o *checklist* do delta (`E028-R1..R9` etc., §5 abaixo)
não tem onde viver de forma rastreável, e o item 4 do escopo — *"atualizar a matriz oficial"* —
fica sem contrato de identidade.

---

### `Q2` · Orientação nas superfícies de canvas **[BLOQUEANTE para `F6-R1.1`]**

**O fato, comprovado por código.** `src/screens/AtelierCanvasScreen.js:6` declara textualmente:
*"NUNCA redimensionam o canvas (o motor é uma WebView; mudar o tamanho reinicia o desenho)."* A
auditoria §5.2 confirma que `ColoringCanvas.resize()` **não** recalcula `baseD`, `paintD`,
`imgX/imgY/imgW/imgH` nem `qBuf`/`visBuf` — qualquer redimensionamento posterior à inicialização
**desalinha a pintura do traço e corrompe o preenchimento**.

**Isto não contradiz `D1`; contradiz aplicá-la ao canvas antes da Fase 9.**

**Opções:**
- **(a)** Congelar Colorir e Ateliê em retrato até a Fase 9. Zero risco de perda de arte. Custo:
  incoerência percebida ("tudo gira menos o desenho").
- **(b)** Permitir rotação e **descartar** a arte em andamento com aviso. **Recomendo rejeitar** —
  perder o desenho de uma criança de 4 a 8 anos é dano de produto, não inconveniente.
- **(c)** Implementar preservação de arte sob `resize` **dentro da F6**. Puxa escopo da Fase 9 para
  a Fase 6 e reabre um motor de canvas fora de *spec* própria.

**Recomendação técnica:** **(a)**. A decisão é do fundador.

---

### `Q3` · Faixa expandida — painel de apoio × grade **[NÃO BLOQUEANTE]**

`D3` fixa as quatro famílias e `D10` fixa a composição do Leitor em paisagem. O que **não** está
decidido é o comportamento da família **Hub** em `>=900dp`: grade mais larga (mais colunas) ou
**painel de apoio** (lista + detalhe, como o *layout* canônico de painel de apoio do Material 3)?

Afeta Início, Brincar, Estrelinhas e a Galeria. **Pode ser decidido no Portão 2**, com maquete.

---

### `Q4` · `grid` e `displayScaleTablet` — consumir ou aposentar **[NÃO BLOQUEANTE]**

Ambos existem em `src/theme/tokens.js` §2.4 com **zero consumidores**. `F6-R1.3` exige que deixem
de ser declarados e inertes. Duas saídas legítimas: ganhar consumidor real em `F6-R1`, ou serem
declarados aposentados com registro. **Não** podem permanecer como estão. Decisão no Portão 2.

---

### `Q5` · Onde vive a âncora canônica do mapa **[NÃO BLOQUEANTE]**

`D11` fixa que a âncora **existe e é única**; não fixa **onde**. Duas opções coerentes com a
arquitetura:
- **(a)** Estender `src/services/guideTargetRegistry.js` — já é um registro global de alvos
  mensuráveis, já serve ao tour, já tem `measureGuideTarget`. **Estender o que existe.**
- **(b)** Módulo novo `src/services/mapAnchorRegistry.js`, separando geometria de mapa de alvos de
  guia.

**Recomendação:** **(a)** para o registro/medição, com a **derivação** de coordenada permanecendo
em `src/data/adventureMap.js`. Evita um terceiro sistema de geometria.

---

### `Q6` · Fator único de enquadramento — `0.58` ou `0.5` **[NÃO BLOQUEANTE]**

`F6-R2.2` unifica os dois fatores divergentes. Qual sobrevive é decisão **visual**, não técnica:
`0.58` (câmera, hoje majoritário) põe o pino um pouco acima do centro; `0.5` centra. Decidir com
captura em aparelho no Portão 2.

---

### `Q7` · Divergência `P-103` × comportamento observado **[NÃO BLOQUEANTE — encaminhado à F7]**

A matriz classifica `P-103` como `IMPLEMENTADO SEM CONSUMIDOR` (*"`ADVENTURES_GUIDE` sem consumidor
e `BeniAppTour` órfão"*). Porém o tour de Aventuras **executa em aparelho**, e
`isAdventureTourActive()` é consumido por `AppNavigator.js:291` e pela `TabletSidebar`.

**Não reclassifiquei `P-103`** — reclassificar exigiria evidência que esta auditoria não produziu, e
a regra é não reclassificar pendência sem prova. Registrado como `AD-2` na auditoria e encaminhado
à **Fase 7**, junto de `P-155`.

---

## 2. Perguntas que **NÃO** faço — e por quê

| Não pergunto | Porque |
|---|---|
| Se telefones devem girar | `D1` decidiu. Sem conflito técnico. |
| Se o *layout* pode olhar o modelo do aparelho | `D2` decidiu. A auditoria §2.1 mostra que a mecânica reativa **já existe** — não há obstáculo técnico. |
| Quantas famílias de superfície existem | `D3` decidiu: quatro. |
| Se a barra lateral ganha destinos novos | `D4` decidiu: não. |
| Como fica a *Story Home*, o Leitor, a conclusão do Colorir, a transição de cena | `D5`–`D10`, `D16`, `D17` decidiram — e são **Fase 9**, não Fase 6. |
| Se o mapa tem âncora única | `D11` decidiu. A auditoria §4.2 **confirma** a necessidade com cinco derivações. |
| Se a primeira experiência centra "Comece Aqui" | `D12` decidiu. |
| O que fazer com o Cantinho do Beni | `D13` congelou. |
| Quando o Monte a Cena desbloqueia | `D14` decidiu — e é **F12A**. |
| Se existe `GameShell` | `D15` decidiu — e é **F12A**. |
| Se B2 pode andar antes do delta | `D18` decidiu: não. |

---

## 3. *Checklist* de requisitos — Etapa SDD 3

Verificação da **qualidade dos requisitos** do delta, **antes** de qualquer plano. Cada item é
respondido com evidência ou com `FALHA`.

### 3.1 Completude

| ID | Verificação | Resultado |
|---|---|---|
| `CKD-01` | Todo achado de propriedade da F6 tem requisito correspondente | **OK** — `P-150`→`F6-R1.1`; `P-151`→`F6-R1.2/1.3`; `P-152`→`F6-R3`; `P-153`→`F6-R1.4`; `P-154`→`F6-R2` |
| `CKD-02` | Todo requisito tem critério de aceite observável | **OK** — `SD-1`..`SD-11` |
| `CKD-03` | Todo achado **não** pertencente à F6 tem dono declarado | **OK** — §8 da *spec* do delta |
| `CKD-04` | O contrato de faixas está numericamente definido | **OK** — `<600` / `600–899` / `>=900`, ligado a `tokens.js` §2.4 |
| `CKD-05` | As quatro famílias têm exemplos verificados no código | **OK** — §3 da *spec* do delta |
| `CKD-06` | A fronteira canvas F6 × F9 está declarada com prova | **OK** — §7 da *spec*, auditoria §5 |
| `CKD-07` | Existe ordem obrigatória entre os requisitos | **OK** — `F6-R3` → `F6-R2` → `F6-R1.1` (`RD-1`) |

### 3.2 Ausência de ambiguidade

| ID | Verificação | Resultado |
|---|---|---|
| `CKD-08` | Nenhum `[NEEDS CLARIFICATION]` em aberto no corpo da *spec* do delta | **OK** — as questões vivem aqui, numeradas |
| `CKD-09` | Nenhum requisito diz "responsivo" sem definir a faixa | **OK** |
| `CKD-10` | Nenhum requisito diz "tablet" como identidade de aparelho | **OK** — sempre largura de janela (`D2`) |
| `CKD-11` | "Âncora canônica" está definida operacionalmente | **OK** — `F6-R2.1`: fonte exclusiva de pino, alvo, brilho, *scroll* e holofote |
| `CKD-12` | "Preservação de estado" está enumerada, não adjetivada | **OK** — `F6-R3.2`, sete itens |

### 3.3 Testabilidade

| ID | Verificação | Resultado |
|---|---|---|
| `CKD-13` | Cada critério de aceite tem método de verificação declarado | **OK** — `SD-1`..`SD-11` |
| `CKD-14` | Existem critérios que **só** validação física resolve, e estão marcados | **OK** — `SD-1`, `SD-5`..`SD-9` |
| `CKD-15` | Existe critério **bloqueador absoluto** | **OK** — `SD-8` (perda de arte) |
| `CKD-16` | Existem testes **negativos** propostos | **OK** — §4 |
| `CKD-17` | Existem testes **mutantes** propostos | **OK** — §4 |

### 3.4 Rastreabilidade

| ID | Verificação | Resultado |
|---|---|---|
| `CKD-18` | Cada requisito aponta o código de risco que resolve | **OK** |
| `CKD-19` | Cada decisão `D1`–`D18` aparece onde é executada | **OK** — `DECISIONS.md` §`PF6D` traz o mapa completo |
| `CKD-20` | Nenhuma pendência existente foi apagada ou reclassificada | **OK** — matriz §32.5; `P-103` preservado com divergência declarada (`Q7`) |
| `CKD-21` | As sete pendências antigas seguem vivas com dono | **OK** — matriz §32.4 |
| `CKD-22` | A *spec* vigente da 021 não foi reescrita | **OK** — delta é aditivo; `CHK001..CHK040` intactos |

### 3.5 Limites

| ID | Verificação | Resultado |
|---|---|---|
| `CKD-23` | O delta não implementa nada de F7, F9, F11 ou F12A | **OK** — §8 da *spec* |
| `CKD-24` | O delta não introduz dependência nova | **OK** — opção `O1` recomendada é configuração pura |
| `CKD-25` | O delta não toca área protegida sem instrução | **OK** — não toca *paywall*, progresso, conquistas, `accessControl`, manifestos, histórias, *assets* |
| `CKD-26` | O delta não cria *breakpoint* novo | **OK** — reusa `tokens.js` §2.4 |
| `CKD-27` | O delta não migra `.js` para TypeScript | **OK** |
| `CKD-28` | O delta não altera o motor do canvas | **OK** — §7 e `Q2` |

**Resultado: 28 de 28 itens `OK`, com `Q1` e `Q2` registradas como bloqueantes de decisão** (não de
qualidade de requisito).

---

## 4. Testes negativos e mutantes — a escrever na Etapa SDD 7

Nenhum destes existe hoje. Todos são **propostas** para o *plan*/*tasks*, e nenhum será escrito
antes do Portão 3.

### 4.1 Portões automáticos propostos para `scripts/smoke.js`

| ID | Portão | O que prova |
|---|---|---|
| `G-ORIENT-1` | `app.json` declara orientação **por plataforma**, e Android permanece `portrait` | Telefone não gira |
| `G-ORIENT-2` | Se `UIRequiresFullScreen` for `false`, a lista de orientações de iPad é **completa** | Coerência com a regra de multitarefa da Apple |
| `G-BP-3` | **Nenhuma** comparação de largura literal (`600`, `768`, `900`, `1024`) fora de `tokens.js` | O corte permanece único |
| `G-BP-4` | A faixa `>=900` tem **mais de um** consumidor | A faixa expandida existe de fato |
| `G-ANCHOR-1` | `getStoryMapCoord` é chamada com a **mesma aridade** em todos os pontos | Mata a divergência `LATENTE` |
| `G-ANCHOR-2` | Existe **exatamente um** fator de enquadramento de câmera em `src/` | `0.58` × `0.5` não voltam |
| `G-ANCHOR-3` | `AdventureMapScreen` não contém constante literal de altura de barra (`56`) | O viewport estimado não volta |
| `G-DIM-1` | **Zero** `Dimensions.get` em `src/` | A leitura reativa não regride |
| `G-LFC-1` | Nenhum `useEffect` reposiciona *scroll* tendo **apenas** largura como dependência | `F6-LFC-01` não volta |
| `G-SIDEBAR-1` | `TabletSidebar` **não** importa `src/theme/colors.js` | Tema legado sai |

### 4.2 Testes **negativos** (falham se o defeito for reintroduzido)

| ID | Cenário | Esperado |
|---|---|---|
| `CN-D1` | Reintroduzir `orientation: "portrait"` global | `G-ORIENT-1` **falha** |
| `CN-D2` | Reintroduzir literal `768` numa comparação de largura | `G-BP-3` **falha** |
| `CN-D3` | Adicionar segundo fator de enquadramento | `G-ANCHOR-2` **falha** |
| `CN-D4` | Chamar `getStoryMapCoord(id)` com um argumento num ponto de *scroll* | `G-ANCHOR-1` **falha** |
| `CN-D5` | Reintroduzir `Dimensions.get('window')` | `G-DIM-1` **falha** |

### 4.3 Testes **mutantes** (o teste tem que morrer quando o código é sabotado)

| ID | Mutação deliberada | O teste que **deve** morrer |
|---|---|---|
| `MT-D1` | Trocar `breakpoints.tablet` de `600` para `599` | Teste de faixa da família Hub |
| `MT-D2` | Inverter a ordem dos ramos de faixa em `ContentContainer` | Teste de largura máxima por faixa |
| `MT-D3` | Zerar o fator de enquadramento | Teste de âncora da câmera |
| `MT-D4` | Devolver coordenada fixa em `getStoryMapCoord` | Teste de coincidência pino × holofote |
| `MT-D5` | Reintroduzir o reset de `didInitScroll` por largura | `SD-7` (preservação de *scroll* sob rotação) |
| `MT-D6` | Remover o congelamento de orientação do canvas (se `Q2`=(a)) | `SD-8` (perda de arte) |

### 4.4 Roteiro físico proposto — só em aparelho real

| ID | Passo | Aparelho |
|---|---|---|
| `FD-1` | Abrir o app em iPad em **retrato**; confirmar que a barra lateral não tem vazio acumulado | iPad |
| `FD-2` | Girar para **paisagem**; confirmar que rota, *scroll* e áudio sobrevivem | iPad |
| `FD-3` | Rolar o mapa até o fim, girar, confirmar que a posição **não** volta para a câmera | iPad |
| `FD-4` | Iniciar um desenho no Colorir, girar (ou confirmar o congelamento), verificar a arte | iPad |
| `FD-5` | Idem no Ateliê / Criar Livre | iPad |
| `FD-6` | Abrir Split View com outro aplicativo; variar a largura do painel nas três faixas | iPad |
| `FD-7` | Puxar o Centro de Controle sobre o Colorir, voltar, verificar o canvas | iPad |
| `FD-8` | Rodar o tour de Aventuras nas três faixas; conferir pino, holofote e "Ver mapa" | iPad + telefone |
| `FD-9` | Confirmar que o telefone **não** gira, em iOS **e** Android | iPhone + Android |
| `FD-10` | Regressão completa do roteiro `F1`–`F12` da *spec* vigente da 021 | Telefone |

> `FD-7` é o passo que reproduz o sintoma original relatado pelo fundador. Ele valida a camada
> **canvas-specific** (`P-164`), que é **Fase 9** — está aqui para que o roteiro da F6 **detecte**
> o defeito, não para que a F6 o corrija.
