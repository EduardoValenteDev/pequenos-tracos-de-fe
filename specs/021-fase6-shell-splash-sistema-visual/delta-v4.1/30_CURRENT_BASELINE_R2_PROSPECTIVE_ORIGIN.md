# 30 · CURRENT BASELINE · R2 PROSPECTIVE ORIGIN · 2026-08-13

> **Vereditos consolidados por este documento:**
> `CURRENT_DEVICE_BASELINE_PASS_TARGET_ALREADY_INSTALLED`
> `CURRENT_ACERVO_INTEGRITY_PASS_IDENTICAL_TO_HISTORICAL_POST`
>
> **Decisão do fundador que este documento ancora:**
> [`D-FUND-R2-CONTINUITY-01`](../../../docs/DECISIONS.md)
>
> **Custódia das evidências (fora do repositório):**
> `C:\tmp\ptf_evidencias_current_device_baseline_01\`
> `C:\tmp\ptf_evidencias_current_acervo_integrity_01\`
> `C:\tmp\ptf_evidencias\F6R1-INSTALL-GATE-20260813-015532\` *(histórica, artefato `29`)*

---

## 1 · Natureza deste documento

Este artefato **não é uma nova medição**. Ele **consolida** duas missões *read-only* já
concluídas e já reportadas, sem repetir uma única leitura do aparelho.

Nenhum ADB foi usado para produzir este documento. O app **não foi aberto**. Nada foi
instalado, desinstalado, limpo, escrito ou tocado.

### `CURRENT` não é a baseline `POST` histórica

Esta distinção é a razão de existir do artefato, e não pode ser diluída:

| | baseline **POST** histórica | baseline **CURRENT** |
|---|---|---|
| origem | instalação de `2026-08-13 02:00:59` | medição direta de `2026-08-13`, tarde |
| registro | [artefato `29`](29_HISTORICAL_INSTALL_GATE_20260813.md) §11 | **este** artefato |
| o que era | última baseline **conhecida** | estado **medido** do aparelho |
| limite que carregava | `CURRENT_DEVICE_STATE_NOT_YET_MEASURED` | — *(o limite foi levantado por medição)* |

A baseline histórica **permanece preservada** no artefato `29`. Ela **não é substituída, nem
corrigida, nem apagada**. Este artefato **acrescenta** a baseline **operacional** sobre a qual
a próxima campanha nasce.

### Janelas de medição

As duas missões gravaram evidências fora do repositório. Os *timestamps* abaixo são os do
**sistema de arquivos do HOST** para esses arquivos — são inequívocos como janela de medição,
e é isso que se afirma sobre eles. Nenhum horário foi inventado.

| missão | primeira evidência | última evidência |
|---|---|---|
| `CURRENT DEVICE READ-ONLY BASELINE 01` | `2026-08-13 16:24:52` | `2026-08-13 16:26:40` |
| `CURRENT ACERVO INTEGRITY READ-ONLY 01` | `2026-08-13 16:36:18` | `2026-08-13 16:45:44` |

---

## 2 · Baseline atual do binário

Medido por `dumpsys package` e `pm path`, e confirmado por `pull` + *hash* no HOST.

| campo | valor medido |
|---|---|
| *package* | `com.valentedev.pequenostracosdefe` |
| `versionCode` | `1` |
| `versionName` | `1.0.0` |
| `minSdk` | `24` |
| `targetSdk` | `36` |
| `apkSigningVersion` | `2` |
| assinatura (forma curta) | `3351bd8d` |
| *past signatures* | `[]` |
| `firstInstallTime` | `2026-08-10 12:03:42` |
| `timeStamp` | `2026-08-13 02:00:56` |
| `lastUpdateTime` | `2026-08-13 02:00:59` |

**`codePath` atual:**

```
/data/app/~~_hCWrhfEb6ZjFB6JfInP8w==/com.valentedev.pequenostracosdefe-RN_89kuv45zhEWVhbaATfQ==
```

**`base.apk` atual — lido de volta do aparelho:**

| | valor |
|---|---|
| tamanho | `227650294 B` |
| `SHA256` | `027395178CF65DC0C1D7EE04975057262AC5AEB03BEFA7434A1318ACCF97262E` |

**Alvo `BUILD NATIVE 01`** — recalculado na mesma missão: **mesmo tamanho** e **mesmo
`SHA256`**.

> `CURRENT_DEVICE_TARGET_BINARY_IDENTITY_PROVED`
> `BUILD_NATIVE_01_TARGET_ALREADY_INSTALLED_NOW`
> `DO_NOT_REINSTALL_IDENTICAL_BINARY`

### Precisão sobre o que foi provado

Duas coisas foram provadas, e elas são **independentes** uma da outra:

1. o `codePath` reportado pelo `dumpsys` e o caminho reportado pelo `pm path` são o **mesmo
   texto**;
2. o arquivo lido daquele caminho é o **mesmo arquivo** que o APK do `BUILD NATIVE 01`, por
   **`SHA256` e tamanho**.

**Não** se afirma "mesmo *inode*". *Inode* não foi medido, e nada aqui depende disso.

A assinatura `3351bd8d` é a **forma curta** exibida pelo `PackageManager`. Ela **não é** um
`SHA256` e não deve ser convertida em um.

---

## 3 · Consequência da identidade binária — prospectiva

Para a campanha atual, **não existe instalação pendente do `BUILD NATIVE 01`**. O binário
alvo **já está no aparelho**, provado byte a byte. Reinstalar o mesmo APK byte-idêntico seria
um ato de mutação sem ganho de informação, contra um acervo íntegro.

Não são necessários **para esta rota**:

- novo `INSTALL GATE` de mutação;
- Android SDK *Build Tools*;
- decodificador de `AXML`;
- pesquisa adicional sobre `install -r`;
- `H-INSTALL-MUTATION`.

> ⚠️ **Qualificação — não é um cheque em branco.** Isto vale **exclusivamente** para o
> `BUILD NATIVE 01` atualmente alvo e atualmente instalado. Se um **novo binário** for
> produzido no futuro, esta conclusão **não autoriza** sua instalação: valerão de novo o item 6
> de `D-FUND-PREBUILD-01` (*"qualquer instalação futura exige missão e gate próprios"*) e a
> exigência de gate de mutação.

---

## 4 · Baseline atual do acervo

Captura por *streaming* (`exec-out run-as … tar -c`, redirecionado no HOST). **Nenhum TAR foi
criado dentro de `/data/user/0`.** Extração e comparação **somente no HOST**.

A autoridade de comparação é a **árvore `POST` auditada em disco** — não uma lista
reconstruída de memória.

| | valor |
|---|---|
| captura atual | **14 arquivos** |
| `POST` histórico | **14 arquivos** |
| `IDENTICAL` | **14** |
| `CHANGED` | **0** |
| `MISSING` | **0** |
| `NEW` | **0** |

| matriz | resultado |
|---|---|
| `PROTECTED_USER_DATA` | **6/6 idênticos** |
| `INCIDENTAL_RUNTIME_STATE` | **8/8 idênticos** |

**Nenhum dado protegido ausente.**

> `CURRENT_ACERVO_INTEGRITY_PASS_IDENTICAL_TO_HISTORICAL_POST`

### Nota sobre o `SHA256` do contêiner TAR

O TAR atual e o TAR histórico têm **o mesmo tamanho** e **`SHA256` diferentes**. A causa foi
**medida, não suposta**: as 22 entradas de cabeçalho são **idênticas** (mesmo modo, dono,
tamanho e `mtime`); diverge apenas a **ordem das três raízes** dentro do contêiner
(`files, databases, shared_prefs` × `databases, files, shared_prefs`), efeito da ordem de
travessia na captura. **O contêiner não é serialização canônica.** A autoridade é a árvore
extraída — e ela é byte-idêntica.

---

## 5 · `RKStorage` atual

| campo | valor medido |
|---|---|
| tamanho | `49152 B` |
| `SHA256` | `950D93D13227E97F85E2FCBBD02B6918FBD07C13F136F37D405E4D4FE7B3FFA1` |
| `TOTAL_KEYS` | `27` |
| `MAX_ROWID` | `71` |
| `integrity_check` | `ok` |
| `quick_check` | `ok` |
| `freelist_count` | `0` |
| `journal_mode` | `delete` |
| `encoding` | `UTF-8` |
| valores nulos/vazios | `0` |
| chaves duplicadas | `0` |
| `RKStorage-journal` | `0 B` *(sem rollback pendente)* |

`TOTAL_KEYS` e `MAX_ROWID` foram **medidos**, não assumidos a partir do valor histórico.

### Condições da leitura

- a leitura ocorreu sobre **cópia no HOST**, em subdiretório de análise isolado;
- conexão aberta com **`readOnly = true`**;
- `SHA256` da cópia **antes e depois** da leitura: **inalterado**;
- nenhum `-wal`, `-shm` ou *journal* auxiliar foi criado;
- **nenhuma escrita no aparelho**; o banco **nunca** foi aberto no dispositivo.

---

## 6 · `C60`

| campo | valor |
|---|---|
| `rowid` | `43` |
| ponteiro | `274 B` |
| `rev` | `22` |
| `paintedPx` | `2123494` |
| `paintablePx` | `2317520` |
| `v` | `3` |
| `fmt` | `2` |
| `W` | `1440` |
| `H` | `2156` |
| *blob* | `200565 B` |
| `done` | `true` |
| `snap` | `ready` |
| `ever` | `true` |

> `C60_IDENTICAL_TO_HISTORICAL_POST`

---

## 7 · Ateliê

| campo | valor |
|---|---|
| `rowid` | `49` |
| registro | `19591 B` |
| `schema` | `2` |
| `updatedAt` | `2026-08-11T20:11:43.982Z` |
| `stateJson` | `15793 B` |
| campos de `stateJson` | `v`, `strokes`, `stamps`, `bgColor` |
| `payload` | **ausente** |
| `previewBase64` | `null` |

> `ATELIER_IDENTICAL_TO_HISTORICAL_POST`

---

## 8 · Integridade referencial

| verificação | resultado |
|---|---|
| ponteiro → *blob* | **3/3 resolvem** |
| *blobs* em disco | `3` |
| *blobs* referenciados | `3` |
| órfãos | `0` |
| `MISSING_PROTECTED_DATA` | `0` |
| `STRUCTURAL_CORRUPTION` | `0` |
| `ORPHAN_REFERENCE` | `0` |
| `UNKNOWN_REQUIRES_REVIEW` | `0` |

Verificado nos **dois sentidos**: nenhuma referência pendente e nenhum *blob* solto.

---

## 9 · Eixos legados

`paintSchemaVersion` · `layoutVersion` · `logicalW` · `logicalH` — **continuam AUSENTES**,
tanto no registro do Ateliê quanto dentro de `stateJson`.

> `LEGACY_AXES_STILL_ABSENT`

Registrado **somente como estado**. Isto **não** está resolvido, **não** é promovido a `STOP`,
e **nada foi migrado**.

---

## 10 · Conclusão de custódia

> ### `O1 · CUSTÓDIA ATUAL = ENCERRADO`

No **sentido estrito** — e apenas nele:

| | |
|---|---|
| binário alvo atual | **provado** |
| acervo atual | **provado** |
| integridade | **provada** |
| identidade com a baseline `POST` | **provada** |
| perda | **zero** |
| corrupção | **zero** |
| órfãos | **zero** |

> ⛔ **Nada aqui concede `PASS` de produto.** `F6-SG-A` = **NÃO CONCEDIDO** ·
> `F6-SG-C` = **NÃO CONCEDIDO** · `SD-1` = **NÃO CONCEDIDO** · `R1` = **NÃO CONCEDIDA** ·
> `R2` = **NÃO CONCEDIDA**. Provar que o binário e os dados estão íntegros **não** prova
> nenhum requisito de produto.

---

## 11 · `R2` histórica × `R2` prospectiva

| eixo | **`R2` HISTÓRICA** | **`R2` PROSPECTIVA** |
|---|---|---|
| status | **congelada / incompleta** | **nova campanha autorizada** |
| blocos | — *(interrompida onde parou)* | `B`..`E` |
| binário | histórico anterior | `BUILD NATIVE 01` **atualmente instalado** |
| dados | — | baseline atual **deste artefato** |
| origem | anterior | **nova** |
| `PASS` herdável | **não** | somente os obtidos **prospectivamente** |
| evidência | **preservada como histórica** | a produzir |

A campanha histórica permanece **congelada e incompleta exatamente no estado em que
ocorreu**. Nada nela é retroativamente completado, promovido ou reinterpretado.

---

## 12 · Origem prospectiva

A campanha prospectiva **nasce** a partir da decisão
[`D-FUND-R2-CONTINUITY-01`](../../../docs/DECISIONS.md) e da baseline atual lacrada **neste
artefato `30`**; o **commit que introduz ambos** é a **âncora Git de origem**.

A origem é, portanto, identificável por três coordenadas, e só por elas:

1. `D-FUND-R2-CONTINUITY-01`;
2. artefato `30`;
3. o `HEAD` canônico desta transição.

> ⛔ **Não reutilizar *timestamps* da campanha antiga.** Nenhuma data, *log*, *hash* ou marca
> temporal da `R2` histórica pode ser apresentada como se pertencesse à campanha nova.

*(O hash do commit de origem não é escrito aqui: ele só passa a existir depois deste
documento. Ele é registrado no relatório da missão que o produz.)*

---

## 13 · O que este artefato **não** faz

- **Não** executa a `R2`. Os blocos `B`, `C`, `D` e `E` **não foram executados**.
- **Não** produz `PASS` de caso, nem *log* físico, nem validação visual.
- **Não** usa ADB, não abre o app, não instala, não mede nada de novo.
- **Não** concede `F6-SG-A`, `F6-SG-C`, `SD-1`, `R1` ou `R2`.
- **Não** reescreve os artefatos `26`, `28` ou `29`, que permanecem byte-idênticos.
- **Não** autoriza a instalação de nenhum binário futuro.

Este artefato **autoriza a existência** da campanha prospectiva. Ele não a executa.
