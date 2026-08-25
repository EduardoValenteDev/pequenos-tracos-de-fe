# V6 · CROSSWALK DO REGISTRO EXECUTIVO DE DEFEITOS PARA O LEDGER CANÔNICO E018

> **Bloco `F6.1` · 2026-08-24 · documento factual de reconciliação de autoridade.**
> **Não é decisão de produto. Não altera a semântica da `v6`. Não cria ledger novo.**

## 1. O problema de autoridade que este documento resolve

Dois artefatos versionados descrevem defeitos do projeto com **esquemas de código
diferentes**:

| Artefato | Esquema | Papel |
|---|---|---|
| [`docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`](../fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md) | `P-01` … `P-176` (era `P-01` … `P-169` antes da §34) | **Ledger canônico único**, adotado em **E018** |
| [`docs/roadmap/ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md`](ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md) §9 | `F6-UX-01` … `F20-STORE-01` | **Visão executiva por fase**, aprovada com a `v6` |

**Resolução declarada em `F6.0` e confirmada aqui:** a matriz **não** foi superada. A `v6`
em nenhum ponto declara a matriz *superseded*, e a §17.1 da `v6` não a lista entre os
documentos rebaixados. O §9 da `v6` é uma **camada de leitura executiva**, útil para
planejar fase por fase; o **inventário, a identidade, o status e a rastreabilidade** das
pendências continuam governados **exclusivamente** pela matriz, conforme E018.

**Regra operacional resultante:** ao fechar qualquer item, o registro obrigatório é feito
no `P-nnn`. O código executivo da `v6` é **rótulo de agrupamento**, nunca destino de baixa.

## 2. Prova de que os dois esquemas descrevem o mesmo universo

A matriz **já continha**, antes da `v6`, aliases escritos no formato executivo. Quatro
códigos da `v6` §9 são **redescrições literais** de aliases pré-existentes:

| Código `v6` | Alias literal já registrado na matriz | Código canônico |
|---|---|---|
| `F11-STR-ONB-01` | `STR ONB 01: transporte do estado de guia` | **`P-35`** |
| `F7-BRI-01` | `ONB BRI 01: guia do Brincar só especificado` | **`P-34`** |
| `F7-QA-01` | `QA REP 01: resetOnboardingForQa grava em vez de remover` | **`P-32`** |
| `F9-JRN-C60-01` | `JRN C60 01: unlocked={isCompleted} no Colorir` | **`P-18`** |

A matriz mantém ainda `ONB IMG 01` (**`P-33`**), sem código `v6` correspondente direto.

Reforço estrutural: a matriz possui coluna **Fase implementação**, e a distribuição dos
169 códigos então existentes por fase coincide com os prefixos usados pela `v6` §9 — Fase 6 (16 códigos),
Fase 7 (12), Fase 9 (12), Fase 11 (19), Fase 12A (28), Fase 12B (7), Fase 16 (14),
Fase 17 (16), Fase 18 (4), Fase 19 (10), Fase 20 (8). Os dois esquemas **particionam o
mesmo universo pelo mesmo eixo**.

## 3. Crosswalk completo — 24 linhas do §9 da `v6`

Legenda de `ESTADO`: **`MAPEADO`** = coberto por código(s) existente(s) ·
**`MAPEADO PARCIAL + NOVO`** = parte coberta, parte genuinamente ausente ·
**`NOVO`** = nenhum código existente descreve o defeito.

| # | Código `v6` | Sev. `v6` | Owner | Código(s) canônico(s) `P-nnn` | Estado |
|---|---|---|---|---|---|
| 1 | `F6-UX-01` | P1 | F6 | `P-151`, `P-153`, `P-169`, `P-168`, `P-30`, `P-47`, `P-31`, `P-29`, `P-20`, `P-167`, `P-152` | `MAPEADO` |
| 2 | `F6-PERF-01` | **`REMEDIATED_WITH_ACCEPTED_EVIDENCE_GAP`** — `BLOCKS_F6 = NÃO` (adjudicado pelo fundador; a severidade `P1 ATIVO (bloqueador)` registrada aqui antes está **superada**) | F6 | `P-139`, `P-135`, `P-136`, `P-85` | `MAPEADO` |
| 3 | `F6-BUILD-01` | P1 governança | F6 | `P-94`, `P-137` **+ `P-170`** | `MAPEADO PARCIAL + NOVO` |
| 4 | `F6-MAP-01` | P1 visual | F6 | `P-105`, `P-111`, `P-26`, `P-154` **+ `P-171`** | `MAPEADO PARCIAL + NOVO` |
| 5 | `F6-TYPE-01` | **`PASS` — quitado em 2026-08-25** (barra inferior exercitada em iPhone 14 / iOS 26.6 com `fontScale > 1,0`; `PENDING_F6_PHYSICAL_CAMPAIGN = QUITADO`) | F6 | `P-27`, `P-59`, `P-60` | `MAPEADO` |
| 6 | `F6-VIS-01` | P2 | F6 | `P-33` **+ `P-172`** | `MAPEADO PARCIAL + NOVO` |
| 7 | `F6-EVID-01` | GAP histórico | F6 | **`P-173`** | `NOVO` |
| 8 | `F7-ONB-01` | P1 | F7 | `P-157`, `P-155`, `P-156`, `P-158`, `P-103` | `MAPEADO` |
| 9 | `F7-BRI-01` | P2 | F7 | **`P-34`** (alias literal), `P-159` | `MAPEADO` |
| 10 | `F7-QA-01` | P2 | F7 | **`P-32`** (alias literal), `P-35` | `MAPEADO` |
| 11 | `F9-JRN-C60-01` | P1 | F9 | **`P-18`** (alias literal), `P-14`, `P-50`, `P-13`, `P-163` | `MAPEADO` |
| 12 | `F9-READER-01` | P1 produto | F9 | `P-160`, `P-161`, `P-162` | `MAPEADO` |
| 13 | `F11-STR-ONB-01` | P1 | F11 | **`P-35`** (alias literal), `P-16` | `MAPEADO` |
| 14 | `F11-CONC-01` | P1 UX | F11 | `P-03`, `P-07`, `P-15`, `P-01`, `P-04`, `P-05` | `MAPEADO` |
| 15 | `F12A-OV-01` | P1 | F12A | `P-152` **+ `P-174`** | `MAPEADO PARCIAL + NOVO` |
| 16 | `F12A-CL-01` | P1/P2 | F12A | `P-68`, `P-164`, `P-86` | `MAPEADO` |
| 17 | `F12A-GAME-01` | P2 | F12A | `P-166`, `P-86` | `MAPEADO` |
| 18 | `F12B-MOM-01` | P1 produto | F12B | `P-43`, `P-44`, `P-53`, `P-39`, `P-40` | `MAPEADO` |
| 19 | `F12B-CUL-01` | P1 produto | F12B | `P-54`, `P-41`, `P-02`, `P-108` | `MAPEADO` |
| 20 | `F16-CONT-01` | P1 release | F16 | `P-74`, `P-12`, `P-110`, `P-111`, `P-105`, `P-118`, `P-119`, `P-131`, `P-147` | `MAPEADO` |
| 21 | `F17-PACK-01` | P1 release | F17 | `P-135`, `P-136`, `P-132`, `P-133`, `P-134`, `P-137`, `P-138`, `P-116`, `P-120`, `P-123`, `P-130` | `MAPEADO` |
| 22 | `F18-PAY-01` | P0/P1 | F18 | `P-24`, `P-93`, `P-129`, `P-140` | `MAPEADO` |
| 23 | `F19-SEC-01` | P0/P1 | F19 | `P-55`, `P-107`, `P-115`, `P-92`, `P-149`, `P-144`, `P-145` **+ `P-175`** | `MAPEADO PARCIAL + NOVO` |
| 24 | `F20-STORE-01` | P0/P1 | F20 | **`P-176`** | `NOVO` |

### 3.1 Números

| Métrica | Valor |
|---|---|
| Linhas executivas na `v6` §9 | **24** |
| Mapeadas **inteiramente** em códigos existentes | **17** |
| Mapeadas **parcialmente**, exigindo código novo | **5** (`F6-BUILD-01`, `F6-MAP-01`, `F6-VIS-01`, `F12A-OV-01`, `F19-SEC-01`) |
| Sem nenhum código existente | **2** (`F6-EVID-01`, `F20-STORE-01`) |
| Códigos canônicos **novos** exigidos | **7** — `P-170` a `P-176` |
| Aliases literais pré-existentes confirmados | **4** |

## 4. Justificativa individual dos sete códigos novos

Cada um foi criado **somente** depois de busca negativa no corpo inteiro da matriz. Nenhum
força equivalência com código existente, e nenhum renumera ou reclassifica código anterior.

| Novo | Origem `v6` | Busca negativa que justifica o código |
|---|---|---|
| `P-170` | `F6-BUILD-01` | Os termos *proveniência*, *provenance* e *manifesto de build* **não ocorrem** na matriz. `P-94` cobre a ausência de `runtimeVersion`/`updates`/`assetBundlePatterns` e `P-137` cobre o `appVersion` literal; **nenhum** cobre a inexistência de vínculo verificável entre binário instalado e commit de origem. |
| `P-171` | `F6-MAP-01` | Nenhuma linha descreve o mapa exibindo marcador de inicial quando o artwork existe. `P-105` é chave sem `require`, `P-111` é ratio de capa, `P-123` é capa declarada em pack, `P-26` é cegueira a pack ausente — o defeito de resolução `source`/`fallback`/cache do mapa não tem código. |
| `P-172` | `F6-VIS-01` | Os termos *shadow* e *sombra* **não ocorrem** na matriz. `P-33` trata da borda do Beni no onboarding (Fase 7), não do sistema compartilhado de cards e conquistas. |
| `P-173` | `F6-EVID-01` | Os termos `raw.log` e `R1-PEND` **não ocorrem** na matriz. O gap de evidência histórica nunca foi codificado. |
| `P-174` | `F12A-OV-01` | Nenhuma linha da Ovelhinha (`P-72`, `P-75`, `P-76`, `P-77`, `P-79`) descreve inicialização dependente de mudança de estado ou de rotação. `P-152` é a camada genérica de `resize`, não o defeito de entrada do jogo. **Este código fecha uma lacuna que a própria matriz declarou aberta:** a §33.5 registrou o achado `E-01` como *bloqueador crítico de lançamento sem código `P` próprio* e escreveu textualmente *"Não inventei um terceiro"*. Ver §4.1 abaixo. |
| `P-175` | `F19-SEC-01` | Os termos *threat model*, *scan* e *secret* **não ocorrem** na matriz. Os códigos existentes cobrem superfícies internas alcançáveis e declarações falsas ao responsável, não a **inspeção do artefato final** antes do release. |
| `P-176` | `F20-STORE-01` | Os termos *DUNS*, *CNPJ* e *titularidade* **não ocorrem** na matriz. O domínio jurídico-comercial de loja não possuía nenhum código. |

### 4.1 `P-174` e o achado `E-01` — conversão de uma lacuna declarada, não invenção

A §33.2 e a §33.5 da matriz registraram que o achado `E-01` — **a `ExpoImage` da ovelha que
nunca recarrega entre rodadas, travando o gate de prontidão da rodada 2 em diante, em 100% das
partidas do Modo Fácil** — era **bloqueador crítico de lançamento sem código `P` próprio**, porque
o Human Gate de 2026-08-10 autorizou exatamente dois códigos novos (`P-168` e `P-169`).

A §33.2 previu o caminho de saída: os achados sem código *"serão convertidos em código — se for o
caso — pela fase proprietária de cada um, sob autorização própria"*. A aprovação da `v6`, que
inclui `F12A-OV-01` no §9, **é** essa autorização. `F6.1` apenas executa a conversão.

**O que continua exatamente como estava:** fase proprietária **12A**; a Fase 6 permanece
**PROIBIDA** de corrigir; *"Cadê a Ovelhinha"* segue **DEV-GATED / EM TESTE**; classificação
`BLOQUEIA LANÇAMENTO`.

**Lacuna remanescente declarada:** os achados `E-02` a `E-05` continuam **congelados para
`F12A` sem código `P` próprio**. Não foram convertidos porque a `v6` §9 não os aprovou
individualmente. **A lacuna é declarada, não preenchida.**

## 4.2 Registro na matriz

Os sete foram registrados na matriz canônica em **§34**, como **acréscimo puro**: nenhuma
fusão, nenhuma renumeração, nenhuma reclassificação de código anterior. O total da matriz
passa de **169** para **176**.

## 5. O que este documento explicitamente NÃO faz

- **Não** supera, substitui nem duplica a matriz. Não é um segundo ledger.
- **Não** altera a semântica, a severidade, o owner ou a redação de nenhuma linha da `v6` §9.
- **Não** fecha, reabre nem reclassifica nenhum `P-nnn` existente.
- **Não** corrige nenhum defeito. `F6.1` é bloco de baseline, não de correção.
- **Não** transforma código executivo em destino de baixa: a baixa se registra no `P-nnn`.
