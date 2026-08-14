# 34 · `R2P1_RETRY_03` · ENCERRAMENTO DOCUMENTAL E ARBITRAGEM PROSPECTIVA · 2026-08-14

> **Vereditos consolidados por este documento:**
> `R2P1_RETRY_03 = STOP_PRE_MUTATION`
> `R2P1_ENTRY_RESET = PHYSICAL_PROOF_INCOMPLETE`
> `F6_CLOSURE_BLOCKER = NÃO`
> `R1_PEND_5 = EVIDENCE_GAP_ACCEPTED_BY_FOUNDER`
>
> **Decisões do fundador que este documento ancora:**
> [`D-FUND-R2P1-CLOSURE-01`](../../../docs/DECISIONS.md) ·
> [`D-FUND-R1-PEND5-EVIDENCE-GAP-01`](../../../docs/DECISIONS.md) ·
> [`D-FUND-R2-PROSPECTIVE-STATE-ARBITER-01`](../../../docs/DECISIONS.md) ·
> [`D-FUND-R2-CASO6-ANTECEDENT-01`](../../../docs/DECISIONS.md)
>
> **Custódia da evidência (fora do repositório):**
> `C:\tmp\ptf_evidencias\R2P1_RETRY_03\`
> `C:\tmp\ptf_evidencias\R2P1_RETRY_03_POSTSTOP_ANALYSIS_01\`

---

## 1 · Natureza deste documento

Este artefato **não é uma nova medição**. Ele **transcreve para o repositório** fatos já
medidos e já lacrados fora dele, e registra a decisão do fundador que os encerra
documentalmente.

**Nenhum ADB foi usado para produzir este documento.** O app **não foi aberto**. Nada foi
instalado, desinstalado, limpo, escrito ou restaurado. `DEVICE_COMMANDS = 0`.

Este artefato **não** altera os artefatos [`30`](30_CURRENT_BASELINE_R2_PROSPECTIVE_ORIGIN.md),
[`31`](31_R2P1_RETRY_ENTRY_BASELINE_01.md), [`32`](32_R2P1_ENTRY_RESET_DESIGN_01.md) ou
[`33`](33_R2P1_ULTRACODE_NEXT_EXECUTION_PLAN.md), que permanecem **byte-idênticos**.

---

## 2 · Encerramento literal do `R2P1_RETRY_03`

| campo | valor lacrado |
|---|---|
| resultado | **`STOP_PRE_MUTATION`** |
| *token* terminal histórico | **`R2P1_STOP_ENTRY_RESET_FAILED`** |
| local do `STOP` | **`E3A`** |
| etapa `E5` | **não executada** |
| `FILES_DELETED_ON_DEVICE` | **`0`** |
| `TAR_RESTORE_ON_DEVICE` | **`0`** |
| *rollback* | **não utilizado** |
| estado final do aparelho | **`INTACT`** |

> ⛔ **O `STOP` permanece verdadeiro e preservado.** Ele **não** é convertido em `PASS`.
> Nenhuma tolerância, *allowlist* ou `AC-5` foi criada — nem para esta tentativa, nem para
> nenhuma outra.

### 2.1 · O `STOP` foi emitido **antes** de qualquer mutação

`E3A` é o portão de igualdade estrita de entrada. Ele reprovou **antes** da etapa destrutiva.
É por isso — e somente por isso — que os quatro fatos físicos acima são todos nulos: o
protocolo parou onde deveria parar. **A parada é o comportamento correto do gate**, não um
acidente favorável.

---

## 3 · Medição que sustentou o `STOP` (transcrição, não reinterpretação)

Instrumento: `compare_state.py` **lacrado**, `4380` *bytes*,
`SHA256 A7649DD2B92C7877ADAF12635E032DBC559F4074558B572CA1EDF8A9821EFDFD`, executado em cópia
byte-idêntica. **Não foi editado.**

**Comparação `CURRENT_E3` × `RETRY_ENTRY_BASELINE_01`:**

```
ESCOPO_OK=SIM  FILES_ADDED=0  FILES_CHANGED=6  FILES_DELETED=0
KEYS_ADDED=0   KEYS_CHANGED=0 KEYS_DELETED=0   KEYS_ROWID_MOVED=1
ENTRY_STATE_RESULT=STOP
```

**Os seis arquivos divergentes:**

| # | caminho | eixo |
|---|---|---|
| 1 | `databases/RKStorage` | produto |
| 2 | `files/phenotype_storage_info/shared/storage-info.pb` | produto *(à época)* |
| 3 | `files/profileInstalled` | infraestrutura |
| 4 | `shared_prefs/WebViewChromiumPrefs.xml` | infraestrutura |
| 5 | `shared_prefs/android.app.ActivityThread.IDS.xml` | infraestrutura |
| 6 | `shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml` | infraestrutura |

**Invariantes de produto contra o artefato `30`:** `PRODUCT_INVARIANTS_PASS = 6/8` ·
`CONTADORES_DE_CHAVE = 3/4` · `PRODUCT_INTEGRITY_DIVERGED = SIM`.

### 3.1 · Natureza medida das duas invariantes que falharam

**`databases/RKStorage`** — `49152 B` nos dois lados, **4 bytes divergentes** (`0,0081 %`):

| *offset* | de → para | significado |
|---|---|---|
| `0x1B` | `4A → 4B` | *file change counter* do SQLite (`0x18`–`0x1B`) |
| `0x5F` | `4A → 4B` | *version-valid-for-number* (`0x5C`–`0x5F`) |
| `0x4E6E` | `47 → 48` | `rowid 71 → 72` (página de tabela) |
| `0xBFD2` | `47 → 48` | `rowid 71 → 72` (página de índice) |

Conteúdo lógico: **`27` chaves dos dois lados**; `KEYS_ADDED` = `KEYS_CHANGED` =
`KEYS_DELETED` = **`0`**. `ROWID_PHYSICAL_DIFFERENCE = 1` · `LOGICAL_VALUE_DIFFERENCE = 0`.
A única chave deslocada é `@ptf_criar_livre_orientation_seen_v1:star`, com **valor idêntico**
(`'1'`, `1` *byte*, `SHA256 6B86B273…5B4B`) nos três lados.

**`files/phenotype_storage_info/shared/storage-info.pb`** — `137 B` nos dois lados, **4 bytes
contíguos** em `0x2B`–`0x2E`: *varint* do **campo 4** (carimbo de última escrita),
`2026-08-12 13:43:15 → 2026-08-13 19:16:50`. Campos `1, 2, 3, 6, 7, 8, 10, 11, 13`
**byte-idênticos**.

> ℹ️ **Nenhuma tolerância foi aplicada nesta comparação.** A janela de validade do `AC-4`
> ([artefato `14`](14_R2_SESSAO_2.md) §21.1) é `TAR-1B-C15-*` × `CK-C15-*` e **não** cobre
> este par.

### 3.2 · Janela causal — medida, não suposta

A captura `ENTRY-vs-RETRY-ENTRY-BASELINE-01` de **`2026-08-13 18:45:58`** registrou os **sete
contadores em zero** e `ENTRY_STATE_RESULT=PASS`. Logo, as seis divergências e o deslocamento
de `rowid` surgiram **depois** desse instante, **dentro da campanha `R2P1_RETRY_02`**.
**Nada nesta janela pertence ao `R2P1_RETRY_03`.**

### 3.3 · Contrafactual decisivo

`RETRY_ENTRY_BASELINE_01` × artefato `30`, pelo instrumento lacrado: `ESCOPO_OK=SIM`,
`FILES_CHANGED=5` (as cinco divergências de infraestrutura **já canonizadas** no
[artefato `31`](31_R2P1_RETRY_ENTRY_BASELINE_01.md) §3), **quatro contadores `KEYS_*` em
zero**. Nenhuma das cinco pertence a `$PRODUTO_8`.

**Conclusão:** se o aparelho estivesse exatamente em `RETRY_ENTRY_BASELINE_01`, `E3A` teria
**passado**. A divergência baseline × artefato `30` **não é causa do `STOP`**.

---

## 4 · Por que isto **não** bloqueia o encerramento da Fase 6

O reset determinístico da baseline de entrada era uma **camada posterior de endurecimento da
infraestrutura de entrada** — construída para tornar *retries* futuros mutuamente comparáveis.
Ele **não é** requisito funcional do Roteiro Mestre, **não é** critério de saída de `F6-SG-A` e
**não é** pré-condição dos blocos prospectivos `B`–`E`, cuja autorização nasce de
[`D-FUND-R2-CONTINUITY-01`](../../../docs/DECISIONS.md) e do
[artefato `30`](30_CURRENT_BASELINE_R2_PROSPECTIVE_ORIGIN.md).

| eixo | veredito |
|---|---|
| reset determinístico | **`PHYSICAL_PROOF_INCOMPLETE`** |
| `F6_CLOSURE_BLOCKER` | **`NÃO`** |
| origem da `R2` prospectiva | **inalterada** (`D-FUND-R2-CONTINUITY-01` + artefato `30`) |

> ⛔ **Retirar do caminho crítico não é declarar feito.** O reset **não** foi provado
> fisicamente. Ele sai do caminho crítico da Fase 6 **como incompleto**, e assim permanece
> registrado.

### 4.1 · Proibições que continuam em vigor

`RETRY_04` · recanonicalização da entrada do `R2P1` · `BASELINE_02` · reabertura da auditoria
`A`–`F` do reset · alteração do `DESIGN` (artefato `32`) · alteração do `PLAN` (artefato `33`)
· edição de `compare_state.py` · criação de `AC_5`.

---

## 5 · `R1-PEND-5` — lacuna de custódia aceita

O `raw.log` da `R1` **não foi preservado à época** e é **irrecuperável**. Nenhuma operação pode
fazê-lo existir.

**Proibido:** fabricar · reconstruir · sintetizar · retrodatar · apresentar log novo como se
fosse o antigo.

> `R1_PEND_5 = EVIDENCE_GAP_ACCEPTED_BY_FOUNDER`

Esta aceitação fecha **exclusivamente a lacuna de custódia**. Ela **não** altera o resultado
funcional observado da `R1`, **não** cria evidência inexistente e **não** autoriza esconder
nenhum `FAIL` real.

---

## 6 · Arbitragem prospectiva de estado — resumo operacional

Vale **somente** para a campanha prospectiva `B`–`E`. Detalhamento normativo em
[`D-FUND-R2-PROSPECTIVE-STATE-ARBITER-01`](../../../docs/DECISIONS.md).

### 6.1 · Dois eixos, julgados separadamente

| eixo | papel |
|---|---|
| **`ESTADO LÓGICO DE PRODUTO`** | árbitro de `PASS`/`FAIL` do caso |
| **`BOOKKEEPING / INFRAESTRUTURA DA PLATAFORMA`** | registrado sempre; **não reprova sozinho** |

O `compare_state.py` continua **lacrado** e sua saída continua **preservada integralmente**.
O que muda: seu *token* agregado de igualdade binária **deixa de ser, sozinho, o árbitro**.

### 6.2 · `RKStorage`

| árbitros de produto | diagnósticos físicos |
|---|---|
| conjunto de chaves | *file change counter* do SQLite |
| tipos | *version-valid-for* |
| valores serializados | mudança de `rowid` **com chave, tipo e valor idênticos** |
| chaves adicionadas / removidas | — |
| valores alterados | — |

`KEYS_ADDED`, `KEYS_CHANGED` e `KEYS_DELETED` **inesperados permanecem materialmente
relevantes**. **Nenhuma alteração lógica pode ser mascarada.**

### 6.3 · Superfícies de infraestrutura classificadas

`files/profileInstalled` · `shared_prefs/WebViewChromiumPrefs.xml` ·
`shared_prefs/android.app.ActivityThread.IDS.xml` ·
`shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml` ·
`files/DevLauncherApp-*DevBundle.js` ·
`files/phenotype_storage_info/shared/storage-info.pb`
*(este último classificado prospectivamente como `PLATFORM_BOOKKEEPING_DIAGNOSTIC`)*.

**Registrar sempre. Nunca ocultar. Não recebem `AC_5`. Não reprovam um caso sozinhas.**

### 6.4 · Escritor novo

Caminho mutado que **não** esteja classificado no corpus, **não** seja efeito previsto da
própria ação do caso e **não** seja atribuível com evidência ⇒ **`HARD STOP`**.

> ⛔ **É proibido criar `AC_5`.** Conforme [artefato `14`](14_R2_SESSAO_2.md) §21.3
> (`ALERTA_LOOP_INFRA`): *"`AC-5` não existe e não será criada"*.

---

## 7 · Ciclo antecedente do `CASO 6`

O antecedente exigido pelo `CASO 6` é o **Bloco `B` imediatamente anterior** (`CASO 7` →
`CASO 8`) — nunca um ciclo histórico herdado.

**Válido somente se a comparação pós-Bloco `B` provar, cumulativamente:**

1. nenhuma gravação lógica de produto incompatível com os critérios dos casos `7` e `8`;
2. nenhum trabalho perdido;
3. nenhuma alteração lógica de valor inesperada;
4. nenhuma violação das invariantes `ZERO`
   ([artefato `06`](06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md) §4).

Bookkeeping de infraestrutura já classificado **não** constitui "gravação de produto" para
efeito deste antecedente.

**Se o Bloco `B` produzir alteração lógica de produto real e inesperada, o `CASO 6` não é
executado** — emite-se `STOP` antes dele.

---

## 8 · O que este artefato **não** faz

- **Não** converte o `STOP` do `R2P1_RETRY_03` em `PASS`.
- **Não** declara o reset determinístico concluído ou provado.
- **Não** autoriza `RETRY_04`, recanonicalização ou `BASELINE_02`.
- **Não** cria tolerância, *allowlist* ou `AC_5`.
- **Não** edita `compare_state.py`, o artefato `32` ou o artefato `33`.
- **Não** executa a `R2` prospectiva: os blocos `B`, `C`, `D` e `E` **não foram executados**.
- **Não** concede `F6-SG-A`, `F6-SG-B`, `F6-SG-C`, `F6-SG-D` ou `F6_CLOSED`.
- **Não** reinterpreta a campanha histórica, que permanece congelada como ocorreu.
