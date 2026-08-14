# `33` — `R2P1_ULTRACODE_NEXT_EXECUTION_PLAN` — plano da próxima execução física

**Data:** 2026-08-14 · **Área:** `F6_SG_A` / `R2P1` · **Estado:** **PLANEJADO, NÃO AUTORIZADO**
**Desenho que este plano executa:** [`32_R2P1_ENTRY_RESET_DESIGN_01.md`](32_R2P1_ENTRY_RESET_DESIGN_01.md) — versão `DESIGN_03`
**Decisão vinculante:** [`D-FUND-R2P1-ENTRY-RESET-01`](../../../docs/DECISIONS.md)
**Baseline de entrada:** [`31_R2P1_RETRY_ENTRY_BASELINE_01.md`](31_R2P1_RETRY_ENTRY_BASELINE_01.md)
**Aparelho:** `SM-X510` / `RX2XC003LTJ`

---

## 0. O que este artefato é — e o que ele não é

**É** o plano da **próxima** execução física de `R2P1`: a sequência exata, a ordem exata, as
pré-condições, as evidências exigidas e os critérios terminais. Existe para que a execução, se
um dia for autorizada, seja **conferível antes de começar** e não improvisada no meio.

**NÃO é** autorização, e não pede autorização. Ele **não** concede `HUMAN GATE`, **não** antecipa
concessão e **não** contém nenhum comando executado. No momento em que foi escrito:

`DEVICE_COMMANDS = 0` · `ADB = 0` · `APP_OPEN = 0` · `METRO = 0` · `DEEPLINK = 0` ·
`TAR_CAPTURE_ON_DEVICE = 0` · `TAR_RESTORE_ON_DEVICE = 0` · `FILES_DELETED_ON_DEVICE = 0` ·
`R2P1_RETRY_03_STARTED = NÃO`.

> **Por que o plano existe como arquivo, e não como prompt.** Um plano que vive apenas na
> instrução de uma sessão não é auditável: some com a sessão, não tem `SHA256`, não entra em
> custódia e não pode ser citado por um `HUMAN GATE`. Este artefato é **versionado, commitado e
> lacrado em custódia** exatamente para que o gate futuro possa citá-lo pelo *hash*, do mesmo modo
> que cita o desenho.

---

## 1. As `14` declarações deste plano

Cada linha abaixo é uma declaração **normativa** deste artefato. Elas são numeradas para poderem
ser citadas isoladamente por qualquer auditoria futura.

| # | declaração |
|---:|---|
| `D-1` | **Este plano executa um único objeto:** o desenho `32_R2P1_ENTRY_RESET_DESIGN_01.md` na versão `DESIGN_03`, e nenhuma outra. Qualquer alteração daquele arquivo invalida este plano até que ele seja reemitido com o novo `SHA256`. |
| `D-2` | **`SHA256` do desenho corrigido (`DESIGN_03`), que este plano executa:** `5B0083D49C0AAC484F3D77CD9C4770028CE346945915E52EEA3BE38CCF9E14D2` · `327924` *bytes* · `4926` linhas · `UTF-8` sem `BOM`, terminações `LF`. |
| `D-3` | **`SHA256` do objeto reprovado (`DESIGN_02`), que este plano NÃO executa:** `2CB45E1B1A2E885652C0C8D91561B0BCF5284860F54EFE8E5D94125D635B3B44` · `212435` *bytes* · commit `a275ee6595f3790a6ac1520e50bb137deb944dfc` · veredito `R2P1_ENTRY_RESET_HARDENED_FINAL_AUDIT_STOP`. Aquele objeto é **história preservada**: não foi reescrito, não foi apagado, não teve *hash* alterado. Ele fica **aposentado para efeito de autorização** — nenhum `HUMAN GATE` pode citá-lo. |
| `D-4` | **Custódia.** Este plano e o desenho `DESIGN_03` são lacrados em `C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_DESIGN_03\`. As custódias `_01` e `_02` permanecem **intactas e imutáveis**; nada nelas foi sobrescrito, movido ou reescrito. A identidade **arquivo no repositório = *blob* do Git = cópia em custódia** é provada em *bytes* e `SHA256` no manifesto daquela raiz. |
| `D-5` | **Um gate por tentativa, sem herança.** A execução de `RETRY_03` exige `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION`; `RETRY_04` exige `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_04`; `RETRY_05` exige `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_05`; e assim por diante, **nominalmente**. Regras integrais em §`17.1` do desenho (`G-1`…`G-7`). |
| `D-6` | **Todo gate cita o `SHA256` integral do desenho.** O bloco `E0.0` do desenho transforma essa exigência em **barreira executável**: `$GATE_SHA` vazio ou fora do formato de `64` dígitos ⇒ `R2P1_STOP_GATE_SEM_SHA`; divergência entre repositório, custódia e gate ⇒ `R2P1_STOP_DESIGN_CUSTODY_DIVERGED`. |
| `D-7` | **Definição de `HUMAN_GATE_R2P1_BLOCK_B_READY`** — ver §`3`. É o gate **posterior** ao reset: autoriza a retomada do `BLOCO B` do protocolo físico (itens `20` a `24`) e **só pode ser considerado** depois que o reset tiver terminado em `PASS` medido. |
| `D-8` | **NENHUM gate desta série está concedido nesta data.** `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` = **NÃO CONCEDIDO** · `..._REEXECUTION_04` = **NÃO CONCEDIDO** · `..._REEXECUTION_05` = **NÃO CONCEDIDO** · `HUMAN_GATE_R2P1_BLOCK_B_READY` = **NÃO CONCEDIDO**. Este artefato **não** os concede e **não** os solicita. |
| `D-9` | **Ordem de execução física** — §`2`. A ordem é **normativa**: um item fora de ordem invalida a tentativa, mesmo que cada item isolado passe. |
| `D-10` | **Instrumentos lacrados que a execução consome sem editar:** `compare_state.py` (`4380` *bytes*, `SHA256 A7649DD2B92C7877ADAF12635E032DBC559F4074558B572CA1EDF8A9821EFDFD`) e o TAR da baseline de entrada do artefato `31`. `COMPARE_STATE_EDIT_REQUIRED = NÃO`. |
| `D-11` | **Evidência exigida** — §`4`. Nenhuma etapa é declarada concluída por narrativa: cada uma tem arquivo de evidência nomeado, com asserção de existência **e** de cardinalidade, conforme a matriz §`13.1` do desenho. |
| `D-12` | **Critérios terminais** — §`5`. Os *tokens* de `STOP` são os de §`3.1` do desenho e **nenhum outro**; não existe "seguir mesmo assim", não existe repetição automática e não existe segunda extração "para ver se passa". |
| `D-13` | **O *rollback* (`RB0..RB7`) faz parte da mesma autorização** da tentativa que o disparou. É a **única** extensão admitida de um gate, e ela é **para trás** — nunca para frente. |
| `D-14` | **Precedência e registro.** Este plano se subordina a `docs/PROJECT_SOURCE_OF_TRUTH.md`, à Constituição e a `D-FUND-R2P1-ENTRY-RESET-01`, nessa ordem. A concessão de qualquer gate é ato **do responsável**, registrada em `docs/DECISIONS.md`. **Nenhum agente concede a si mesmo**, e nenhum relatório de agente equivale a concessão. |

---

## 2. Ordem de execução física da próxima tentativa

A numeração `9`…`24` é a do protocolo físico vigente e **não é reaberta** aqui.

| ordem | item | o que é | estado |
|---:|---|---|---|
| `1` | **`E0`…`E8`** do desenho | o **reset determinístico** do estado de entrada, incluindo `E0.0` (identidade do desenho), `E3` (TAR de *rollback*, `22` entradas provadas **antes** da primeira mutação) e `E5` (janela destrutiva) | **NÃO AUTORIZADO** |
| `2` | item `9` — `DEVICE` | conferência de aparelho e `transport_id` | pendente |
| `3` | item `10` — `RELÓGIO` | conferência de relógio | pendente |
| `4` | item `11` — `PORTAS` | `8081`/`8082`/`8083` sem *listener* ⇒ senão `R2P1_STOP_PORT_OCCUPIED` | pendente |
| `5` | item `12` — `BINÁRIO ATUAL` | identidade de instalação (`appId`, assinatura, `dataDir`) ⇒ senão `R2P1_STOP_BINARY_BASELINE_DIVERGED` | pendente |
| `6` | item `13` — `TAR DE ENTRADA` | captura do estado por `stdout` (**nunca** gravando TAR dentro do aparelho) | pendente |
| `7` | item `14` — `GATE DE ENTRADA` | `compare_state.py` contra a baseline do artefato `31` ⇒ divergência ⇒ `R2P1_STOP_ENTRY_BASELINE_DIVERGED` | pendente |
| `8` | **`I1`…`I10`** do desenho | prova de idempotência em **duas rodadas com raízes independentes** (`$RST01` / `$RST02`), `22 + 22`, sem acumulação | **NÃO AUTORIZADO** |
| `9` | item `15` — `Metro` | subida do Metro | pendente |
| `10` | item `16` — `reverse` | `adb reverse` | pendente |
| `11` | item `17` — `PS3` | | pendente |
| `12` | item `18` — *deep link* | **abertura do app** — a partir daqui a baseline de entrada está **consumida** | pendente |
| `13` | item `19` — `C-1` | | pendente |
| `14` | item `20` — **`HUMAN GATE` do `BLOCO B`** | ponto de parada obrigatório — ver §`3` | **NÃO CONCEDIDO** |
| `15` | item `21` — `CASO 7` | | pendente |
| `16` | item `22` — `CK-C7` | | pendente |
| `17` | item `23` — `CASO 8` | | pendente |
| `18` | item `24` — `CK-C8` | | pendente |

> **A ordem é a substância, não a forma.** O reset precede o item `9` porque ele **fabrica** o
> estado que o item `14` mede; a prova de idempotência precede o item `15` porque subir o Metro
> **é** um *writer*; e o item `18` é irreversível para a baseline — depois dele, só um novo reset
> devolve o estado de entrada. Trocar dois itens de lugar não é otimização: é invalidar a
> tentativa.

---

## 3. `HUMAN_GATE_R2P1_BLOCK_B_READY` — definição normativa

| aspecto | definição |
|---|---|
| **o que autoriza** | a retomada do `BLOCO B` do protocolo físico — itens `21` a `24` (`CASO 7`, `CK-C7`, `CASO 8`, `CK-C8`) |
| **o que NÃO autoriza** | o reset (`E0..E8`), a prova de idempotência (`I1..I10`), qualquer remoção, qualquer restauração, qualquer recaptura de baseline, qualquer tolerância nova e qualquer *allowlist* |
| **pré-condição `P-1`** | o reset terminou em `PASS` **medido** — itens `13` e `14` verdes sobre o estado restaurado, com evidência gravada e asseverada |
| **pré-condição `P-2`** | a prova de idempotência fechou `22 + 22` em raízes independentes, com `I10` gravando o lacre por rodada |
| **pré-condição `P-3`** | itens `15` a `19` concluídos, com evidência |
| **pré-condição `P-4`** | nenhum `STOP` pendente e nenhum estado indeterminado — se o *rollback* rodou, o veredito de `RB7` foi `RECUPERADO`, jamais `INDETERMINATE` |
| **quem concede** | o responsável, e apenas ele, com registro em `docs/DECISIONS.md` |
| **escopo temporal** | **uma** retomada. Não se estende a nova tentativa, a nova baseline nem a outro aparelho |
| **estado nesta data** | **NÃO CONCEDIDO** — e este artefato **não** o solicita |

> **Por que este gate é separado do gate de execução do reset.** São autorizações de **naturezas
> diferentes**: o gate do reset autoriza uma janela **destrutiva** sobre o *sandbox* do app; o
> `BLOCK_B_READY` autoriza **uso do produto** para colher casos de validação. Fundi-los faria com
> que autorizar a colheita de evidência de UI autorizasse, de carona, apagar arquivos. É
> exatamente a ampliação silenciosa que §`17.1` do desenho existe para impedir.

---

## 4. Evidência exigida da futura execução

| bloco | raiz de evidência | asserção mínima |
|---|---|---|
| identidade do desenho | `$EXEC\00_E0_INTEGRIDADE.txt` | `Assert-Evidencia … 34`, incluindo `DESIGN_REPO_VS_CUSTODY=IDENTICOS` |
| janela destrutiva | `$RSTC\` (comum) | matriz §`13.1` do desenho, linha a linha |
| rodada `01` | `$RST01\` | raiz **nova**, `Assert-RaizNova`; `22` entradas |
| rodada `02` | `$RST02\` | raiz **nova**, `Assert-RaizNova`; `22` entradas; **nenhum** `-Append` sobre evidência da rodada `01` |
| consolidação | `$EXEC\I9_METADADOS_POR_RODADA.txt` · `$EXEC\I10_LACRE.txt` | `I9` compara **projeções estruturais** (`6` campos, sem `%Y`); `I10` discrimina `RODADA01` / `RODADA02` |
| *rollback*, se ocorrer | `RB0`…`RB7` | `RB7` grava o veredito final; `RB5`/`RB6` classificam e registram, **sem** lançar |

**Regra de relatório.** O relatório da execução distingue, obrigatoriamente: **salvo no disco ·
untracked · modificado · staged/indexado · commitado · enviado ao remoto** — e nunca usa
"indexado" se nenhum `git add` ocorreu.

---

## 5. Critérios terminais

| resultado | condição | consequência |
|---|---|---|
| `PASS` | reset concluído, itens `13`/`14` verdes, idempotência `22 + 22`, nenhuma asserção reprovada | segue para o item `15`; `BLOCK_B_READY` passa a ser **considerável** — não concedido automaticamente |
| `R2P1_STOP_ENTRY_RESET_FAILED` | falha **dentro** da operação, antes de a restauração ter sido concluída e validada | *rollback* §`5` do desenho, relatório, **parada** |
| `R2P1_STOP_ENTRY_BASELINE_DIVERGED` | a operação **terminou** e o comparador acusou divergência | parada, relatório; **sem** recaptura de baseline |
| `R2P1_STOP_GATE_SEM_SHA` · `R2P1_STOP_DESIGN_CUSTODY_DIVERGED` | `E0.0` — gate sem `SHA256`, ou desenho diferente do auditado | parada **antes** de qualquer outro passo; nada foi tocado |
| `R2P1_STOP_EVIDENCE_ROOT_PREEXISTS` | raiz de evidência já existia | parada; investigar a execução anterior antes de qualquer coisa |
| `R2P1_STOP_PORT_OCCUPIED` · `R2P1_STOP_BINARY_BASELINE_DIVERGED` | pré-condições de ambiente / identidade | parada |

**Proibida a recuperação silenciosa.** Nenhuma repetição automática, nenhuma correção não
registrada, nenhuma segunda extração "para ver se passa". Falha ⇒ `STOP` + relatório.

---

## 6. `ULTRACODE_PLAN_SAFE`

| propriedade | valor | prova |
|---|---|---|
| comandos executados para produzir este plano | **`0`** | artefato documental; nenhum `adb`, nenhum Metro, nenhum *deep link* |
| gates concedidos por este plano | **`0`** | `D-8`; todos os quatro gates nomeados estão **NÃO CONCEDIDO** |
| gates solicitados por este plano | **`0`** | este artefato não pede concessão; a solicitação, se houver, será ato separado do responsável |
| desenho citado por `SHA256` | **sim** | `D-2` |
| objeto reprovado citado e aposentado | **sim** | `D-3` |
| história reescrita | **não** | commit `a275ee6` preservado; nenhum *amend*, *rebase*, *squash* ou *push* |
| código de produto alterado | **não** | nenhum arquivo fora de `specs/**` e `docs/**` foi tocado |
| **`ULTRACODE_PLAN_SAFE`** | **SIM** | as sete linhas acima |
