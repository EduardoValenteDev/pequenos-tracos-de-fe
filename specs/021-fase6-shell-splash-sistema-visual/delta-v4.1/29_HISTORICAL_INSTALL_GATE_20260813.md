# 29 · HISTORICAL INSTALL GATE · 2026-08-13

> **Veredito autorizador desta canonização:**
> `HISTORICAL_INSTALL_EVIDENCE_AUDIT_PASS_READY_FOR_CANONICAL_REPAIR`
>
> **Custódia da evidência auditada:**
> `C:\tmp\ptf_evidencias\F6R1-INSTALL-GATE-20260813-015532\`

---

## 1 · Natureza deste documento

Esta é uma **canonização retrospectiva** de um evento **real**, ocorrido em
**13/08/2026, por volta de 02:00**, no aparelho `RX2XC003LTJ` (`SM-X510`).

Quatro afirmações delimitam o que este artefato é — e o que ele **não** é:

1. **O evento aconteceu.** Uma instalação foi executada naquela madrugada.
2. **A evidência ficou fora do corpus.** Ela foi produzida e preservada em disco, mas
   **não** foi versionada nem incorporada ao corpus documental na época. A baseline
   documental do projeto seguiu, por isso, descrevendo um estado que já não era o mais
   recente. **Esta reparação corrige essa defasagem.**
3. **A auditoria adversarial posterior provou o evento.** As classificações registradas
   abaixo vêm dessa auditoria, não de uma nova medição.
4. **Isto não é uma nova instalação, e não é uma reconstrução artificial do evento.**
   Nenhum ADB foi usado para produzir este documento; nada foi instalado, desinstalado,
   limpo ou tocado. O aparelho **não foi medido** nesta missão.

Consequência normativa direta: os artefatos históricos **não são reescritos**. O artefato
[`26`](26_PREBUILD_CUSTODY_HARD_STOP.md) permanece **exatamente** como está, válido como
registro da baseline **PRE**. Este artefato **acrescenta** a baseline **POST**; não corrige
o passado.

---

## 2 · O comando e o resultado

### Comando histórico — **transcrito**, não capturado

```
adb -s RX2XC003LTJ install -r "<evidência>\apk\NEW-c22b43b9-development.apk"
```

Esta *string* vem do **relatório histórico** da missão de instalação. **Não existe
transcript bruto do shell com o comando ecoado.** O comando é, portanto, evidência de
**segunda ordem**: reconstituição documental do que foi digitado.

### Resultado — **saída literal capturada**

```
Performing Streamed Install
Success
```

| Propriedade | Valor |
|---|---|
| `exit` | `0` |
| duração registrada | `11 s` |

**Assimetria deliberada de peso probatório.** A **saída** acima é captura literal; o
**comando** é transcrição. Este artefato **não eleva a transcrição do comando ao mesmo
nível da saída literal**, e nenhuma conclusão posterior depende de o comando ter sido
digitado exatamente com aquela grafia.

---

## 3 · Prova do `PackageManager` — estado **POST**

Medição **direta**, capturada no momento do evento.

| Propriedade | Valor medido |
|---|---|
| *package* | `com.valentedev.pequenostracosdefe` |
| `versionCode` | `1` |
| `versionName` | `1.0.0` |
| `minSdk` | `24` |
| `targetSdk` | `36` |
| `apkSigningVersion` | `2` |
| assinatura curta (`PackageManager`) | `3351bd8d` |
| *past signatures* | `[]` |
| `firstInstallTime` | `2026-08-10 12:03:42` |
| `timeStamp` | `2026-08-13 02:00:56` |
| `lastUpdateTime` | `2026-08-13 02:00:59` |
| `initiatingPackageName` | `com.android.shell` |

`codePath` **POST**:

```
/data/app/~~_hCWrhfEb6ZjFB6JfInP8w==/com.valentedev.pequenostracosdefe-RN_89kuv45zhEWVhbaATfQ==
```

**Classificação:** `PACKAGE_POST_PROVED_BY_RAW_CAPTURE`

---

## 4 · O estado **PRE** — e o que exatamente o prova

### `DUMPSYS-PRE.txt` = **AUSENTE**

Este artefato **não declara** a existência de uma captura bruta do `dumpsys` anterior à
instalação. Ela **não existe** no acervo de evidências. Dizer o contrário seria inventar
prova.

### O que prova o PRE, então: **corroboração independente**

O estado PRE está provado pelo artefato [`26`](26_PREBUILD_CUSTODY_HARD_STOP.md), que foi
**commitado antes da instalação** e cujas linhas são leitura direta do mesmo aparelho. Um
documento anterior ao evento, versionado, não pode ter sido ajustado depois para
acomodá-lo — é essa anterioridade que lhe dá força probatória.

| Propriedade | Baseline **PRE** |
|---|---|
| `versionCode` / `versionName` | `1` / `1.0.0` |
| `apkSigningVersion` | `2` |
| assinatura curta | `3351bd8d` |
| `firstInstallTime` | `2026-08-10 12:03:42` |
| `lastUpdateTime` | `2026-08-10 12:03:42` |

`codePath` **PRE** (valor real já versionado no artefato `26` §2):

```
/data/app/~~GXL80biRI-EeByGJE9LTdw==/com.valentedev.pequenostracosdefe-Rlyx-DXo4WOYbVwNmNDG9g==/base.apk
```

**Classificação:** `PACKAGE_PRE_PROVED_BY_INDEPENDENT_CORROBORATION`

Esta classificação **não é** e **não deve ser chamada de** captura bruta. É corroboração
documental independente — categoria distinta, deliberadamente nomeada de forma distinta.

---

## 5 · *Upgrade in-place* — provado

Comparando §4 (PRE) com §3 (POST):

| Fato observado | PRE → POST |
|---|---|
| `firstInstallTime` | `2026-08-10 12:03:42` → **inalterado** |
| `lastUpdateTime` | `2026-08-10 12:03:42` → `2026-08-13 02:00:59` — **mudou** |
| `codePath` | `~~GXL80biRI-…` → `~~_hCWrhfEb6ZjFB6JfInP8w==/…` — **mudou** |
| *past signatures* | `[]` → `[]` — **permaneceu vazio** |
| dados do *package* | **sobreviveram** (ver §7) |

**Classificação:** `UPGRADE_IN_PLACE_PROVED`

> ⚠️ **Alcance.** Isto é prova **histórica deste aparelho e desta instalação**. **Não** é
> regra universal do Android, **não** é garantia para instalações futuras, e **não**
> autoriza presumir *upgrade in-place* em qualquer outra troca de binário.

---

## 6 · Identidade binária

| # | Arquivo | Bytes | `SHA256` |
|---|---|---|---|
| **A** | `NEW-c22b43b9-development.apk` | `227650294` | `027395178CF65DC0C1D7EE04975057262AC5AEB03BEFA7434A1318ACCF97262E` |
| **B** | `INSTALLED-post-base.apk` | `227650294` | `027395178CF65DC0C1D7EE04975057262AC5AEB03BEFA7434A1318ACCF97262E` |
| **C** | `build_native_01_a123250f.apk` (`BUILD NATIVE 01`) | `227650294` | `027395178CF65DC0C1D7EE04975057262AC5AEB03BEFA7434A1318ACCF97262E` |
| **D** | `OLD-baseline-rollback.apk` | `227650194` | `5ED71F710B925053C9C83EE5F937327F591832A001E60883E6935814A864AB2C` |

**`A == B == C`** — o binário oferecido à instalação, o binário lido de volta do aparelho
após a instalação, e o binário do `BUILD NATIVE 01` são **o mesmo objeto**, bit a bit.

**Classificação:** `BINARY_IDENTITY_HISTORICAL_PASS`

Duas consequências, e a segunda limita a primeira:

- `BUILD_NATIVE_01_BINARY_ALREADY_INSTALLED_AT_HISTORICAL_POST` — o binário do
  `BUILD NATIVE 01` (`BUILD_ID a123250f-384e-4665-a443-2c783351aad0`) **já estava
  instalado** no aparelho no instante POST de `2026-08-13 02:00:59`.
- `CURRENT_DEVICE_STATE_NOT_YET_MEASURED` — **este artefato não afirma que esse binário
  permanece no aparelho hoje.** O estado atual do `SM-X510` **não foi medido**.

**D** é objeto **distinto**: `100` bytes menor e `SHA256` diferente. É o binário de
*rollback*, tratado em §9.

---

## 7 · Assinatura

### O script foi auditado **antes** do uso

| Propriedade | Valor |
|---|---|
| script | `apksigcert.js` |
| `SHA256` | `A574B0D71A2D4E8A155CE33246540E829332623D3070227354BEA55164C0CA08` |
| módulos usados | **somente** `fs` e `crypto` |
| ausências verificadas | **sem** rede · **sem** `child_process` · **sem** ADB · **sem** escrita · **sem** alteração de ambiente |

### Certificado — idêntico nos **quatro** APKs

| Propriedade | Valor |
|---|---|
| `CERT_SHA256` | `05A1891555446C4B529D6CDC4C2A6C6D73D115DFFEE678D8C90E902FF5A618A5` |
| `CERT_SHA1` | `1FAAC8BAFD723BBEA33A3234E523520A80061BA7` |
| *scheme* | `v2` |
| chave | `rsa` |
| validade | `2026-05-27` → `2053-10-12` |

**Classificação:** `SIGNING_IDENTITY_HISTORICAL_PROVED`

> ⚠️ `3351bd8d` é a assinatura **curta** reportada pelo `PackageManager`. Ela **não é** o
> `SHA256` do certificado e **não foi convertida** nele. São duas medições distintas, de
> fontes distintas, que este artefato mantém separadas.

---

## 8 · Acervo — PRE × POST

| Métrica | Valor |
|---|---|
| arquivos PRE | `14` |
| arquivos POST | `14` |
| divergências | `0` |

| Objeto | Medição |
|---|---|
| `databases/RKStorage` | `49152` bytes · `SHA256 950D93D13227E97F85E2FCBBD02B6918FBD07C13F136F37D405E4D4FE7B3FFA1` |
| `TOTAL_KEYS` | `27` |
| `MAX_ROWID` | `71` |
| `C60` · `rev` | `22` |
| `C60` · `paintedPx` | `2123494` |

**Os `14` arquivos foram recalculados pela auditoria adversarial** e deram
**byte-identical** entre PRE e POST.

**Classificação:** `ACERVO_PRE_POST_IDENTICAL_PROVED`

O acervo da criança **atravessou a instalação intacto**. É este o bem que
`D-FUND-PREBUILD-01` protege, e ele **não foi perdido**.

---

## 9 · *Backup* e *rollback*

### *Backup* do acervo

| Arquivo | Bytes | `SHA256` |
|---|---|---|
| `TAR-PRE-INSTALL.tar` | `17143808` | `E50EA1C7E7D7065502FC40C16B00EB59423CBB8B37887897C54937859E279A62` |
| `TAR-POST-INSTALL.tar` | `17143808` | **o mesmo** `SHA256` |

**Classificação:** `DATA_BACKUP_PROVED`

### Artefato de *rollback*

| Arquivo | Bytes | `SHA256` |
|---|---|---|
| `OLD-baseline-rollback.apk` | `227650194` | `5ED71F710B925053C9C83EE5F937327F591832A001E60883E6935814A864AB2C` |
| `C:\tmp\f6_sg_a_evidence\c05a5800-development.apk` (segunda cópia) | — | **byte-identical** ao anterior |

**Classificações — separadas de propósito:**

| Token | Significado |
|---|---|
| `ROLLBACK_BINARY_ARTIFACT_PROVED` | o binário anterior **existe**, está preservado em duas cópias idênticas |
| `DATA_BACKUP_PROVED` | o acervo tem *backup* íntegro |
| `ROLLBACK_EXECUTION_NOT_TESTED` | **o rollback NUNCA foi executado** |

> ⛔ **Este artefato não escreve, e ninguém pode inferir dele, que "o rollback foi
> testado".** Existe o **artefato**; **não** existe o **teste**. Ter o binário anterior em
> mãos não prova que reinstalá-lo funcionaria, nem que o acervo sobreviveria à volta.

---

## 10 · Ressalvas — explícitas e permanentes

1. **`DUMPSYS-PRE` bruto AUSENTE.** O PRE vale por corroboração independente (§4), não por
   captura.
2. ***Rollback* NUNCA executado** (§9).
3. **Defasagem de relógio *host* ↔ *device* INFERIDA, não medida.** Os horários desta
   página convivem com essa imprecisão.
4. **Estado atual do aparelho NÃO medido** — `CURRENT_DEVICE_STATE_NOT_YET_MEASURED`.

> **Nenhuma dessas ressalvas invalida a instalação histórica provada.** Elas delimitam o
> que **mais** se pode afirmar a partir dela — não o fato de ela ter ocorrido.

---

## 11 · Baseline temporal — **duas**, nenhuma apagada

### `HISTORICAL_BASELINE_VALID_UNTIL_INSTALL` — baseline **PRE**

Historicamente válida de **`2026-08-10 12:03:42`** até **`2026-08-13 02:00:59`**.
**Preservada no artefato [`26`](26_PREBUILD_CUSTODY_HARD_STOP.md)**, que **não** é corrigido
retroativamente. Ela não estava errada quando foi escrita; ela **expirou**.

### Baseline **POST** — a partir de `2026-08-13 02:00:59`

| Propriedade | Valor |
|---|---|
| *package* | `com.valentedev.pequenostracosdefe` |
| versão | `1.0.0` / `1` |
| `codePath` | `/data/app/~~_hCWrhfEb6ZjFB6JfInP8w==/com.valentedev.pequenostracosdefe-RN_89kuv45zhEWVhbaATfQ==` |
| `firstInstallTime` | `2026-08-10 12:03:42` |
| `lastUpdateTime` | `2026-08-13 02:00:59` |
| assinatura | `v2` / `3351bd8d` |
| APK `SHA256` | `027395178CF65DC0C1D7EE04975057262AC5AEB03BEFA7434A1318ACCF97262E` |
| certificado | `05A1891555446C4B529D6CDC4C2A6C6D73D115DFFEE678D8C90E902FF5A618A5` |
| acervo | **preservado** |

> ⚠️ **IMPORTANTE.** Esta baseline POST é a **última baseline histórica conhecida** — a mais
> recente que o corpus possui. Ela **não** é uma afirmação sobre o **estado presente** do
> aparelho. Entre `2026-08-13 02:00:59` e agora, o corpus **não mediu nada**.

---

## 12 · `R1` / `R2` — registrado, **não adjudicado**

| Item | Estado |
|---|---|
| `R1-PEND-1` .. `R1-PEND-4` | **ABERTAS** |
| `R1-PEND-5` | **ABERTA** |
| `F6-SG-A` | **NÃO CONCEDIDO** |
| `F6-SG-C` | **NÃO CONCEDIDO** |
| `SD-1` | **NÃO CONCEDIDO** |

### `R2` — as duas continuidades se separaram

- **Continuidade de dados: PRESERVADA.** O acervo é byte-idêntico entre PRE e POST (§8), e
  o `RKStorage` mantém `SHA256 950D93D1…FFA1`, `TOTAL_KEYS 27`, `MAX_ROWID 71`.
- **Continuidade do binário histórico: ROMPIDA** pela instalação de `2026-08-13 02:00:59`.
  O binário sobre o qual a campanha histórica correu **não é mais** o binário instalado a
  partir daquele instante.

Consequência lógica, e só ela: **qualquer `R2` futura `B`..`E` será necessariamente
prospectiva**, sobre binário posterior, **se** autorizada pelo fundador.

> ⛔ **Este documento NÃO decide** se a `R2` remanescente será refundada
> prospectivamente ou se a campanha histórica será encerrada no estado atual. A pergunta
> fica registrada como decisão pendente `D-FUND-R2-CONTINUITY-01` em
> [`docs/DECISIONS.md`](../../../docs/DECISIONS.md). **A resposta é do fundador.**

---

## 13 · O que este artefato **não** faz

- **Não** mede o aparelho.
- **Não** instala, desinstala, substitui nem limpa dados.
- **Não** altera os artefatos `26` ou `28`.
- **Não** concede `F6-SG-A`, `F6-SG-C` nem `SD-1`.
- **Não** fecha nenhuma `R1-PEND`.
- **Não** executa nem valida *rollback*.
- **Não** decide o destino da `R2`.
- **Não** afirma qual binário está no `SM-X510` **agora**.
