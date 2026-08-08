# F6-DELTA0 · Roteiro v4.1 — reconciliação e *checklist* do delta

> **Natureza.** Documental. Este artefato **formaliza o delta v4.1 no repositório sem apagar
> história**. Ele **não** substitui, **não** reorganiza e **não** renumera o Roteiro Mestre.
>
> **Precedência preservada.** `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` §3 continua o
> **árbitro da sequência de fases**. `docs/DECISIONS.md` continua o **árbitro das decisões de
> produto**. `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` continua o **árbitro
> do inventário de pendências**. `docs/PROJECT_SOURCE_OF_TRUTH.md` continua a **verdade máxima de
> governança**. **Este artefato não é árbitro de nada** — é o registro versionado do delta.
>
> **As 22 fases permanecem 22.** O delta **acrescenta subportões dentro de fases existentes**; não
> cria roteiro paralelo, não move entrega de fase e não inverte ordem.

---

## 1. Estado real reconciliado até a Fase 6

| Fase | Estado registrado antes | Estado real reconciliado no delta | Fonte |
|---|---|---|---|
| 0 a 4E | Encerradas / Product Lock registrado | **Inalterado** | `v5` §3, matriz §24–§28 |
| 5 | **DOCUMENTALMENTE ENCERRADA**; nada aprovado para lançamento; 19 dependências externas vivas | **Inalterado** | `DECISIONS.md` §`PF5-ENCERRAMENTO` |
| **6** | **EM EXECUÇÃO desde 2026-08-07** | **EM EXECUÇÃO, com delta aberto.** B1 e B3 implementados e **validados fisicamente em iPad com bloqueadores estruturais encontrados**. **B2 não iniciado e BLOQUEADO** por `D18`. Blocos B2′, B5, B4, B6 e B7 não iniciados. | `tasks.md` da 021; validação física do fundador |
| 7 e seguintes | Não iniciadas | **Inalterado** — porém **herdam 10 códigos novos** (matriz §32) | Este delta |

### 1.1 O que a validação física mudou — e o que **não** mudou

**Mudou:** a Fase 6 passou a ter um **delta de fundação** (`F6-R1`, `F6-R2`, `F6-R3`) que **não
existia** na *spec* aprovada. O Bloco **B2** passou a ser **bloqueado** por decisão do fundador
(`D18`).

**Não mudou:** os eixos A/B/C da *spec* da 021; os requisitos `RF-*`; os critérios `S1`–`S11`; o
*checklist* `CHK001`–`CHK040` (40/40 aprovados); os Portões Humanos 1 e 2 já concedidos àquela
*spec*; a ordem macro `PRE-0 · B1 · B3 · B2 · B2′ · B5 · B4 · B6 · B7` imposta pelo fundador; o
critério de saída da Fase 6 no `v5`; o risco `R21`.

**Regressão em telefone:** validada, **sem anomalia relevante**. Registrado para que o delta não
seja lido como falha de B1/B3 — B1 e B3 entregaram o que lhes foi pedido. O que faltou nunca foi
pedido a eles.

---

## 2. *Checklist* do delta por fase — preservado como recebido

> ### ✅ `Q1` **RESOLVIDA** — emenda do Portão Humano 1, 2026-08-08
>
> A identidade dos dois eixos está **congelada** pelo fundador:
>
> - **`E000–E089` = eixo EXECUTIVO** do roteiro mestre.
> - **`P-01–P-167` = eixo de RISCOS E PENDÊNCIAS.**
>
> São **taxonomias paralelas** e **não possuem relação obrigatoriamente 1:1**: um `E` pode depender
> de **vários** `P`; um `P` pode aparecer ou revalidar-se em **vários** `E`. **Os `P` NÃO
> substituem, NÃO renumeram e NÃO absorvem os `E`.**
>
> A **ausência material** de `E000–E089` neste repositório — fato que o próprio
> `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:282` já registrava para `E039` e `E042` — **NÃO
> autoriza**: inventar entradas faltantes · recriar a série · migrar `E` para `P` · substituir o
> *checklist* mestre.
>
> **A ponte declarada adotada no `F6-DELTA0` está APROVADA.** Os quadros abaixo são exatamente
> essa ponte: *crosswalks* do tipo `E028-R3 → P-152` **podem** ser registrados, **desde que não
> alterem a identidade de nenhum dos dois eixos**. Os códigos `E***-R*` continuam reproduzidos
> **exatamente como o fundador os enviou**. **Nenhum dos dois eixos foi apagado, renumerado ou
> subordinado ao outro.**
>
> `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` permanece o **árbitro da sequência de fases**.
> Registro canônico da decisão: `docs/DECISIONS.md` §`PF6D-Q1`.

### 2.1 Fase 6 — Shell, splash e sistema visual

| Código do *checklist* mestre | Substância | Código canônico da matriz | Requisito do delta |
|---|---|---|---|
| `E028-R1` .. `E028-R9` | Fundação de superfície adaptativa | `P-150`, `P-151`, `P-153` | `F6-R1.1` .. `F6-R1.4` |
| `E032-R1` .. `E032-R4` | Fundação de geometria do mapa | `P-154` | `F6-R2.1` .. `F6-R2.5` |
| `E034-R1`, `E034-R2` | Estabilidade de ciclo de vida e `resize` | `P-152` | `F6-R3.1` .. `F6-R3.4` |

### 2.2 Fase 7 — *Onboarding* e guias

| Código | Substância | Matriz | Observação |
|---|---|---|---|
| `E035-R1` .. `E035-R6` | Coreografia e marcação do *onboarding* | `P-155`, `P-156`, `P-157` | `P-157` **depende** de `F6-R2` |
| `E036-R1`, `E036-R2` | Semântica de "Ver mapa" no *onboarding* | `P-158` | Semântica definitiva é **F11** |
| `E042-R1` | Cantinho do Beni | `P-159` | `DECISÃO DE PRODUTO PENDENTE` por `D13` — Portão de Produto. *(`CONGELADO` **não** é status canônico da matriz §6 e não foi introduzido.)* |

### 2.3 Fase 9 — Story Home, Leitor e conclusão

| Código | Substância | Matriz |
|---|---|---|
| `E049-R1` .. `E049-R6` | *Story Home V2* (`D5`–`D8`) | `P-160` |
| `E052-R1` .. `E052-R7` | *Página Viva* / Leitor V2 (`D9`, `D10`) | `P-161` |
| `E050-R1` | Transição de cena sem quadro vazio (`D17`) | `P-162` |
| `E053-R1` | Conclusão do Colorir (`D16`) | `P-163` |
| `E055-R1` | Ciclo de vida do canvas | `P-164` |

### 2.4 Fase 12A — Brincar e jogos

| Código | Substância | Matriz |
|---|---|---|
| `E066-R1` | Portão do Monte a Cena (`D14`) | `P-165` |
| `E067`–`E070-R1`, `E070-R2`, `E070-R3` | `GameShell` integral (`D15`) | `P-166` |
| `E071-R1` .. `E071-R4` | Composição do Brincar em tablet | `P-167` |
| `E072-R1` | Consolidação da família Jogo | `P-166`, `P-167` |

### 2.5 Escala — Fases 13 a 22

`E077-R1` · `E078-R1` · `E079-R1` · `E082-R1` · `E083-R1` · `E085-R1` · `E087-R1` · `E089` —
reproduzidos como recebidos. **Nenhum** deles recebeu código de matriz neste delta: a auditoria não
produziu evidência de código sobre eles, e a regra do fundador (matriz §27.2) proíbe criar código
por ampliação de evidência. Ficam registrados aqui e serão confrontados com a matriz na fase
proprietária de cada um.

---

## 3. Subportões acrescentados — dentro das fases existentes

**Nenhuma fase foi criada, movida, dividida ou renumerada.** O que o delta acrescenta são
**subportões**, que são condições de saída **adicionais** dentro de fases que já existiam.

| Fase | Subportão | Requisito | Condição |
|---|---|---|---|
| **6** | `F6-SG-A` | **`F6-R3`** — ciclo de vida + segurança do canvas | Implementada e validada — **antes** de qualquer liberação de orientação |
| **6** | `F6-SG-B` | **`F6-R2`** — fundação de geometria do mapa | Implementada — âncora canônica única, verificada nas três faixas |
| **6** | `F6-SG-C` | **`F6-R1`** — superfície adaptativa + orientação | Implementada — faixas, famílias, barra lateral, orientação nos **quatro** *idioms* |
| **6** | `F6-SG-D` | **liberação do `B2`** | **Só então** o Bloco `B2` é desbloqueado (`D18`) |
| **7** | `F7-SG-A` | Marcação, ponto de partida e holofote do *onboarting* corretos sobre a âncora de `F6-R2` |
| **9** | `F9-SG-A` | *Story Home V2* e Leitor V2 entregues sobre os arquétipos de `F6-R1` |
| **9** | `F9-SG-B` | Ciclo de vida do canvas resolvido — desenho sobrevive a segundo plano e a `resize` |
| **12A** | `F12A-SG-A` | `GameShell` integral sobre a geometria da família Jogo de `F6-R1` |

**Ordem obrigatória dentro da Fase 6:** `F6-SG-A` → `F6-SG-B` → `F6-SG-C` → `F6-SG-D`.
Inverter destrói arte da criança (auditoria §5.2, risco `RD-1`).

### 3.1 ✅ **EMENDA EXPLÍCITA DA ORDEM** — Portão Humano 1, 2026-08-08 (item 9)

**A ordem acima está APROVADA pelo fundador** e **substitui, por emenda explícita, a ordem anterior
do roteiro v4.1 recebido.**

| | Ordem |
|---|---|
| **Ordem anterior — preservada, não apagada** | `F6-R1` → `F6-R2` → `F6-R3` |
| **Ordem vigente — aprovada na emenda** | `F6-R3` (`SG-A`) → `F6-R2` (`SG-B`) → `F6-R1` (`SG-C`) → **`B2`** (`SG-D`) |

**Razão da mudança, registrada conforme exigido** — *"não apague a ordem antiga sem registrar a
razão da mudança"*:

1. **`R3` foi para a frente porque a exposição é presente, não futura.** A correção da §1.2 da
   auditoria provou que o **iPad já gira hoje** — a variante `UISupportedInterfaceOrientations~ipad`
   é escrita pelo `withRequiresFullScreen` com as quatro orientações. Somado ao Split View, há
   **dois** caminhos de `resize` abertos **agora**. Deixar `R3` por último manteria a arte da
   criança desprotegida durante toda a fase.
2. **`R1` foi para o fim porque é a que libera orientação.** Liberar faixas e orientação sobre uma
   fundação que ainda não preserva a obra violaria `SD-8`, que é **bloqueador absoluto**.
3. **`R2` precede `R1`** porque a **âncora canônica única** do mapa (`D11`) é pré-requisito da
   geometria que `R1` consome — e `P-157` (Fase 7) depende dela.

**Nada foi apagado em silêncio.** Registro canônico paralelo em `docs/DECISIONS.md` §`PF6D-D18`.

### 3.2 Exceção formal de escopo de `F6-R3` — autorizada (futura)

O fundador **autorizou formalmente**, para vigorar **somente após** os demais portões do fluxo SDD,
uma exceção **estreita**: `F6-R3` **pode** alterar **apenas** as primitivas técnicas — sistema de
coordenadas, `resize`, transformação de *viewport*, ciclo de vida, preservação de estado e
recuperação técnica — **indispensáveis à rotação segura**.

`F6-R3` **NÃO pode antecipar**: redesenho do Colorir · conclusão visual do Colorir · *Story Home
V2* · *Página Viva* · redesenho final do Criar Livre · política comercial · `GameShell` · qualquer
escopo de produto de **F9** ou **F12A**.

Registro canônico em `docs/DECISIONS.md` §`PF6D-EXC-R3`; contrato na *spec* do delta.

---

## 4. Pendências antigas — preservadas, com dono

**Nenhuma foi apagada, fundida ou reclassificada.** Reproduzidas com o dono e a revalidação já
registrados:

| Pendência | Fase proprietária | Revalidação | Código canônico |
|---|---|---|---|
| `JRN C60 01` | 9 | 11 e 21 | `P-18` |
| `QA ONB 01` | 7 | ausência em produção: 19 e 21 | — (registro de Fase 3) |
| `STR ONB 01` | 11 | dependências 7 e 8A | `P-35` |
| `ONB BRI 01` | 7 | acabamento 12A; revalidação 14 e 21 | `P-34` |
| `ONB IMG 01` | 6 e 7 | — | — (registro de Fase 3) |
| `BRI UX 01` | 12A | política comercial 18 | — (registro de Fase 3) |
| `BRI UI 01` | 6 e 12A | — | — (registro de Fase 3) |

`ONB IMG 01` e `BRI UI 01` têm **porção de propriedade da Fase 6** e podem ser implementadas
**apenas nessa porção**, conforme o escopo autorizado.

---

## 5. O que este artefato **não** fez

Não alterou o `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`. Não mudou a sequência das 22 fases. Não
moveu entrega de fase. Não renumerou código algum — nem `E`, nem `P`. Não apagou nem reclassificou
pendência existente. Não reabriu decisão registrada. Não criou roteiro paralelo. Não tocou runtime,
*assets*, manifestos ou configuração de *build*. Não gerou *build*, não executou validação física e
não fez *push*.

**A emenda do Portão Humano 1 (2026-08-08) não fez:** não criou fase nova · não moveu nenhuma das
22 fases · não renumerou `E` nem `P` · **não apagou a ordem anterior `R1 → R2 → R3`**, que fica
registrada em §3.1 com a razão da mudança · não iniciou `plan.md`, `tasks.md` nem `analyze` · não
desbloqueou o `B2` · não escolheu via de orientação · não instalou dependência · não gerou *build*
· não fez *push* nem *merge*.
