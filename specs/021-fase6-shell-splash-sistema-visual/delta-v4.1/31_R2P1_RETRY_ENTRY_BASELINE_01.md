# 31 · `R2P1_RETRY_ENTRY_BASELINE_01` · baseline de entrada de *retry* · 2026-08-13

> **Veredito deste documento:**
> `R2P1_RETRY_BASELINE_READY`
>
> **Vereditos PRESERVADOS, que este documento NÃO altera:**
> `R2P1_STOP_LOGCAT_DROPPED` *(tentativa `R2P1`)*
> `R2P1_STOP_ENTRY_BASELINE_DIVERGED` *(tentativa `R2P1_RETRY_01`)*
>
> **Decisão do fundador que este documento ancora:**
> [`D-FUND-R2P1-RETRY-ENTRY-BASELINE-01`](../../../docs/DECISIONS.md)
>
> **Custódia das evidências (fora do repositório):**
> `C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\` *(criada por este documento)*
> `C:\tmp\ptf_evidencias\R2P1_RETRY_01\` *(origem física · **lacrada e intacta**)*
> `C:\tmp\ptf_evidencias\R2P1\` *(tentativa anterior · **lacrada e intacta**)*
> `C:\tmp\ptf_evidencias_current_acervo_integrity_01\` *(artefato `30` · **imutável**)*

---

## 1 · Natureza deste documento

Este artefato **não é uma nova medição do aparelho**. **Nenhum comando ADB foi emitido**
para produzi‑lo. O aplicativo **não foi aberto**, nenhum *deep link* foi emitido, nenhum
Metro subiu, nenhum `adb reverse` foi configurado, nenhum `TAR` foi restaurado e nenhum
`TAR` novo foi capturado.

Ele faz **duas coisas, e só duas**:

1. **Reconfirma, por leitura**, que as invariantes de produto continuam idênticas às do
   artefato `30`;
2. **Lacra uma baseline operacional de ENTRADA** — `R2P1_RETRY_ENTRY_BASELINE_01` — a
   partir de um estado físico **que já havia sido capturado** no pré‑voo de
   `R2P1_RETRY_01`, **antes** de qualquer nova abertura do aplicativo.

---

## 2 · O que este documento NÃO altera

| objeto | estado | efeito deste artefato |
|---|---|---|
| tentativa `R2P1` | encerrada em `R2P1_STOP_LOGCAT_DROPPED` | **nenhum** — permanece lacrada e intacta |
| tentativa `R2P1_RETRY_01` | encerrada em `R2P1_STOP_ENTRY_BASELINE_DIVERGED` | **nenhum** — permanece lacrada e intacta |
| [artefato `30`](30_CURRENT_BASELINE_R2_PROSPECTIVE_ORIGIN.md) | baseline de proveniência | **nenhum** — **imutável**, nenhum arquivo regravado, substituído ou atualizado |
| `compare_state.py` (instrumento selado `G-03`) | `SHA256 A7649DD2…FDFD` | **nenhum** — **não editado**; copiado bit a bit |
| acervo do usuário no `SM-X510` | íntegro | **nenhum** — nenhuma escrita foi emitida |

> ⛔ **O `STOP` de `R2P1_RETRY_01` NÃO é convertido.** Ele **não** vira `PASS`, **não** vira
> *retry* válido e **não** vira tentativa descartada. Ele continua sendo o veredito daquela
> tentativa, para sempre. Este artefato **não recorre** dele — ele **parte** dele.

---

## 3 · O fato causal, sem ampliação

A reprovação do item `14` de `R2P1_RETRY_01` consiste **exclusivamente** em **cinco**
arquivos, **todos escritos por infraestrutura**, nenhum deles do produto:

| arquivo | escritor | artefato `30` → baseline |
|---|---|---|
| `files/DevLauncherApp-BridgelessReactNativeDevBundle.js` | cache de *bundle* do `expo-dev-launcher` | `16772179` → `16863539` B *(+91360)* |
| `files/profileInstalled` | marcador do AndroidX `ProfileInstaller` | `24` → `24` B *(conteúdo distinto)* |
| `shared_prefs/WebViewChromiumPrefs.xml` | WebView Chromium | `377` → `127` B *(−250)* |
| `shared_prefs/android.app.ActivityThread.IDS.xml` | `ActivityThread` do Android | `109` → `108` B *(−1)* |
| `shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml` | lista de *apps* recentes do `dev-launcher` | `684` → `684` B *(conteúdo distinto)* |

**Janela causal — medida, não suposta.** A comparação diagnóstica contra a árvore `ENTRY`
da tentativa `R2P1` (capturada às `17:22`, **antes** do *deep link* daquela corrida)
devolve **exatamente os mesmos cinco arquivos e exatamente os mesmos contadores**. Isso
localiza a mudança entre `17:22` e `18:04`, e nessa janela houve **um único evento**: a
**abertura do aplicativo às `17:23:00`** — abertura que o próprio protocolo manda fazer
(item `18`).

> 🔒 **Limite explícito da afirmação.** Afirma‑se que a mudança ocorreu **naquela janela** e
> que os cinco arquivos são **de infraestrutura**. **Não** se afirma qual linha de código de
> cada componente escreveu cada *byte*, **não** se afirma que a abertura foi indevida, e
> **não** se estende a causalidade a nada além dos cinco arquivos listados.

---

## 4 · Invariantes de produto — reconfirmadas contra o artefato `30`

Reconferência **somente por leitura**, sobre árvores que já existiam em disco. Evidência
integral: `C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\01_INVARIANTES_VS_ARTEFATO_30.txt`.

| # | arquivo | *bytes* | `SHA256` | veredito |
|---|---|---|---|---|
| 1 | `databases/RKStorage` | `49152` | `950D93D1…FFA1` | **IDÊNTICO** |
| 2 | `files/ptf_blobs/atelier/art_1786479103982_6079_preview.jpg` | `89593` | `FDC55296…E248` | **IDÊNTICO** |
| 3 | `files/ptf_blobs/atelier/art_1786479103982_6079_thumb.jpg` | `14730` | `A5FB5908…10DE` | **IDÊNTICO** |
| 4 | `files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.a.png` | `200565` | `6814DEE7…3F81` | **IDÊNTICO** |
| 5 | `files/phenotype_storage_info/shared/storage-info.pb` | `137` | `A4AE5569…1893` | **IDÊNTICO** |
| 6 | `shared_prefs/com.valentedev.pequenostracosdefe_preferences.xml` | `126` | `95622E8F…F022` | **IDÊNTICO** |
| 7 | `shared_prefs/expo.modules.kotlin.PersistentDataManager.xml` | `65` | `3325D2A8…C793` | **IDÊNTICO** |
| 8 | `shared_prefs/expo.modules.devmenu.sharedpreferences.xml` | `127` | `496A13FD…B91D` | **IDÊNTICO** |

**`catalystLocalStorage`** — comparação **semântica** pelo instrumento selado, chave a
chave, valor a valor, `rowid` a `rowid`:

| contador | valor |
|---|---|
| `KEYS_ADDED` | `0` |
| `KEYS_CHANGED` | `0` |
| `KEYS_DELETED` | `0` |
| `KEYS_ROWID_MOVED` | `0` |

**Cadeia de custódia do banco.** `950D93D1…FFA1` é **o mesmo valor** de
`CUSTODY_RKSTORAGE_AFTER_C10 = BYTE_IDENTICAL`
([`D-FUND-PREBUILD-01`](../../../docs/DECISIONS.md), artefato
[`26`](26_PREBUILD_CUSTODY_HARD_STOP.md) §4.2, `49152` *bytes*, idêntico ao `TAR-C10-POST`).
O banco do acervo permanece **byte‑idêntico** do `TAR-C10-POST` até esta baseline.

> ✅ `INVARIANTES_DE_PRODUTO_VS_ARTEFATO_30 = COMPROVADAS` — `8`/`8` arquivos e `4`/`4`
> contadores de chave. **Nenhuma invariante ficou por comprovar**; não há `STOP` por
> invariante.

---

## 5 · A baseline lacrada

**Identificação canônica:** `R2P1_RETRY_ENTRY_BASELINE_01`

| # | item exigido | valor registrado |
|---|---|---|
| 1 | **origem** | estado físico capturado no **item `13` do pré‑voo de `R2P1_RETRY_01`**, **antes** de qualquer nova abertura do *app*. `adb exec-out run-as … tar -c databases files shared_prefs`, redirecionamento *byte*‑fiel no HOST via `cmd.exe`. **Nada foi capturado agora.** |
| 2 | **data e hora** | `force-stop` único autorizado — HOST `2026-08-13 18:04:00.275` (`exit 0`); `pidof` vazio confirmado logo depois; captura do `TAR` — HOST `2026-08-13 ~18:04`. `OFFSET_MS` vigente `+9968` *(aparelho adiantado; medido no item `10` daquele pré‑voo, **não** herdado)*. Selagem desta baseline — HOST `2026-08-13 18:17`..`18:20`. |
| 3 | **serial** | `RX2XC003LTJ` *(`adb devices -l` = exatamente `1`; `transport_id 2`)* |
| 4 | **modelo** | `SM_X510` · `product:gts9fewifixx` · tela `ON`, `Awake`, `screen_off_timeout = 600000` |
| 5 | **estado do processo do *app*** | **PARADO.** `pidof com.valentedev.pequenostracosdefe` = **vazio** no instante da captura, confirmado **antes** dela. Aparelho na Home do Android. |
| 6 | **hash integral do `TAR`** | `DA87831C0D1AE6FA395A218FB2AF93F72BBBA4DDF0BC5005E88CC5D56356AB81` · `17234944` *bytes* |
| 7 | **quantidade de entradas** | `22` entradas no `TAR` *(inclui diretórios)* · `14` arquivos extraídos |
| 8 | **relação com o artefato `30`** | **não o substitui.** Ver §7. |
| 9 | **prova das invariantes** | §4 deste artefato + `01_INVARIANTES_VS_ARTEFATO_30.txt` |
| 10 | **cinco divergências** | §3 deste artefato + §6 (com *hashes* dos dois lados) |
| 11 | **não constituem *allowlist*** | §6 deste artefato |
| 12 | **igualdade estrita na próxima entrada** | §6 deste artefato |

**Materialização.** O `TAR` de origem foi **copiado** — **nunca movido** — e a cópia foi
verificada:

| verificação | resultado |
|---|---|
| `SHA256` da cópia == `SHA256` da origem | ✅ `DA87831C…AB81` nos dois |
| *bytes* da cópia == *bytes* da origem | ✅ `17234944` nos dois |
| árvore extraída: arquivos presentes | ✅ `14`/`14` |
| árvore extraída: divergências de `SHA256` | ✅ `0` |
| `compare_state.py` copiado sem edição | ✅ `A7649DD2…FDFD` |
| *self‑check* semântico da cópia contra a origem | ✅ `ENTRY_STATE_RESULT=PASS`, **sete** contadores em zero |
| `C:\tmp\ptf_evidencias\R2P1_RETRY_01\` após a cópia | ✅ **intacta** |

**Conteúdo da raiz de custódia:**

```
C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\
  00_MANIFESTO_BASELINE.txt
  01_INVARIANTES_VS_ARTEFATO_30.txt
  acervo\TAR-ENTRY-BASELINE-01.tar              <- cópia fiel (DA87831C…AB81)
  acervo\BASELINE-EXTRACTED\                    <- árvore de referência do próximo gate
  acervo\BASELINE-vs-ARTEFATO30.txt             <- instrumento selado vs artefato 30
  acervo\SELFCHECK-BASELINE-vs-RETRY01ENTRY.txt <- instrumento selado vs a origem (PASS)
  tools\compare_state.py                        <- instrumento selado G-03
```

---

## 6 · Isto **não** é *allowlist* — é congelamento

Esta é a seção que precisa sobreviver a qualquer leitura apressada.

**O que NÃO foi feito:**

1. Os cinco arquivos **não** foram declarados tolerados, dispensados ou "livres para mudar".
2. **Nenhuma tolerância nova** foi criada.
3. **`AC-5` não foi criado** — nem explícita, nem implicitamente, nem por omissão.
4. **`compare_state.py` não foi editado.** Sua única tolerância continua sendo
   `databases/RKStorage-journal`, exatamente como já estava — e ela **sequer foi necessária**
   nesta comparação (`0` *bytes* e mesmo `SHA256` dos dois lados).
5. **Nenhuma exceção silenciosa** foi introduzida em lugar algum.

**O que foi feito:** a inicialização **que já ocorreu** ficou **congelada dentro** da
baseline. A diferença é material, não retórica:

| leitura errada | leitura correta |
|---|---|
| "estes cinco arquivos podem mudar" | "estes cinco arquivos têm, a partir de agora, **um valor esperado exato**" |
| a divergência foi perdoada | a divergência foi **fixada** e passa a ser **verificável** |
| o *gate* ficou mais frouxo | o *gate* ficou **igualmente estrito**, com **referência nova** |

**Valores esperados a partir de agora** — o lado `BASELINE` de cada um dos cinco:

| arquivo | *bytes* | `SHA256` esperado |
|---|---|---|
| `files/DevLauncherApp-BridgelessReactNativeDevBundle.js` | `16863539` | `CC7FB6FE…92A3` |
| `files/profileInstalled` | `24` | `B6F58476…BF99` |
| `shared_prefs/WebViewChromiumPrefs.xml` | `127` | `72CACA87…6999` |
| `shared_prefs/android.app.ActivityThread.IDS.xml` | `108` | `DEC264C4…9ECE` |
| `shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml` | `684` | `3467F6CD…C81D` |

**Regra de igualdade estrita para a próxima entrada:**

| parâmetro | valor |
|---|---|
| referência do próximo item `14` | `C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\BASELINE-EXTRACTED` |
| instrumento | `compare_state.py` selado (`A7649DD2…FDFD`) — **inalterado** |
| exigência | `ESCOPO_OK=SIM` **e** os **sete** contadores em **zero** |
| qualquer divergência | **`STOP`** |
| tolerâncias admitidas | **somente** as **já formalmente aprovadas ANTES desta decisão** — hoje, exclusivamente `databases/RKStorage-journal` |

> ⛔ **O próximo item `14` continua sendo um *gate* de IGUALDADE ESTRITA.** Trocou‑se a
> **referência**, não o **rigor**. E a verificação das **invariantes de produto** contra o
> artefato `30` (as `8` de §4 mais os contadores de chave) **permanece obrigatória e
> inalterada**.

---

## 7 · Duas baselines, duas perguntas distintas

| | **artefato `30`** | **`R2P1_RETRY_ENTRY_BASELINE_01`** |
|---|---|---|
| função | **proveniência e invariantes de produto** | **igualdade física de entrada entre *retries* prospectivos** |
| pergunta que responde | "o acervo e o binário são os provados?" | "a entrada física deste *retry* é igual à do *retry* anterior, até o último *byte*?" |
| origem | medição direta de `2026-08-13`, tarde | `TAR` do item `13` do pré‑voo de `R2P1_RETRY_01`, HOST `~18:04` |
| estado do *app* na origem | — | **parado**, `pidof` vazio |
| mutabilidade | **imutável** | lacrada; substituível **apenas** por decisão explícita do fundador |
| escopo | acervo **+** binário **+** proveniência | árvore física de entrada (`databases` · `files` · `shared_prefs`) |
| o que **não** faz | não é *gate* de entrada de *retry* | **não** substitui o artefato `30`, **não** o corrige e **não** o revoga |

---

## 8 · Cadeia de custódia — intervenção física humana registrada

Durante o período em que o aplicativo **já estava parado** e o tablet estava na **Home do
Android**, ocorreram **dois toques humanos na tela**, feitos **exclusivamente** para evitar
bloqueio/apagamento do visor.

O registro existe **apenas para completude da cadeia de custódia**.

> 🔒 **Não se atribui a esses toques causalidade sobre as cinco divergências.** As cinco já
> existiam na captura das `18:04` e foram produzidas na janela das `17:23`, com o aplicativo
> **aberto**. Os toques ocorreram **fora da janela causal** e **fora da janela probatória da
> futura execução**. Nenhum deles abriu o aplicativo e nenhum navegou no produto.

---

## 9 · Estado do repositório

| campo | valor |
|---|---|
| *branch* | `feat/fase6-shell-splash` |
| `HEAD` na entrada | `92c64cd027e47a59899b577dbf618929887d1fb7` |
| `git status --porcelain` na entrada | **vazio** — árvore limpa |
| arquivos alterados nesta etapa | **somente** documentais: este artefato **+** `docs/DECISIONS.md` |
| protocolo versionado alterado | **nenhum** — `06`, `08`, `10` e `14` permanecem intocados |
| alteração de *runtime* ou de produto | **nenhuma** |
| gate de bundleabilidade | **não disparado** — alteração é documentação pura (`AGENTS.md`, regra de bundleabilidade) |

---

## 10 · O que este artefato **não** faz

1. **Não** executa `R2P1_RETRY_02` — e **não** o autoriza a começar.
2. **Não** abre o aplicativo, **não** emite *deep link*, **não** sobe Metro, **não** configura
   `adb reverse`, **não** restaura `TAR`.
3. **Não** emite **nenhum** comando ao aparelho.
4. **Não** altera código de produto nem o acervo do usuário.
5. **Não** cria tolerância, *allowlist* ou exceção silenciosa.
6. **Não** altera nem substitui o artefato `30`.
7. **Não** converte, não recorre e não relativiza `R2P1_STOP_ENTRY_BASELINE_DIVERGED`.
8. **Não** concede `PASS` a caso algum. **`F6-SG-A` permanece NÃO CONCEDIDO.**

> ✅ **Veredito:** `R2P1_RETRY_BASELINE_READY`
>
> ⛔ **`R2P1_RETRY_02` NÃO foi iniciada.** *`READY` descreve a baseline, não autoriza a
> execução.* A execução depende de **`HUMAN GATE` explícito** do fundador.
