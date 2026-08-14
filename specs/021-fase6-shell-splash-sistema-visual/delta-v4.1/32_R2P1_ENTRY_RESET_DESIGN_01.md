# `32` — `R2P1_ENTRY_RESET_DESIGN_01` — reset determinístico do estado de entrada

**Data:** 2026-08-13 · **Área:** `F6_SG_A` / `R2P1` · **Estado:** **DESENHADO, NÃO EXECUTADO**
**Decisão vinculante:** [`D-FUND-R2P1-ENTRY-RESET-01`](../../../docs/DECISIONS.md)
**Gate desta materialização:** `HUMAN_GATE_R2P1_ENTRY_RESET_MATERIALIZATION = CONCEDIDO`
**Gate de execução:** `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` — **NÃO CONCEDIDO**

---

## 0. O que este documento é — e o que ele não é

**É** a materialização integral e auditável do procedimento de restauração determinística do
estado de entrada, com **comandos literais**, para que um auditor independente possa verificar
**antes** de qualquer execução física exatamente o que seria executado.

**NÃO é** autorização. Nenhum comando deste documento foi executado. No momento em que ele foi
escrito: `DEVICE_COMMANDS = 0` · `TAR_RESTORE = 0` · `FILES_DELETED_ON_DEVICE = 0` ·
`APP_OPEN = 0` · `METRO_START = 0` · `PS3_START = 0` · `DEEPLINK = 0` ·
`R2P1_RETRY_03_STARTED = NÃO`.

**Histórico que produziu este documento.** O desenho anterior recebeu
`R2P1_ENTRY_RESET_DESIGN_READY_FOR_HUMAN_GATE` do `AZUL` e, em seguida,
`R2P1_ENTRY_RESET_AUDIT_STOP` da auditoria adversarial do `VERDE`. O `STOP` **não** rejeitou a
arquitetura do reset: bloqueou a execução porque o procedimento destrutivo **não existia em
forma auditável, versionada ou selada** e porque restavam lacunas normativas. Este artefato
elimina esses bloqueios.

**O problema estrutural que o reset resolve.** A baseline de entrada é um estado
**pré-abertura**. Abrir o aplicativo reescreve cinco arquivos de infraestrutura;
`R2P1_RETRY_02` consumiu a única passagem natural por esse estado. Sem reset, cada nova
tentativa exigiria **recongelar** uma baseline nova — `BASELINE_02`, `BASELINE_03`,
`BASELINE_04` — que é exatamente o defeito que se quer eliminar. Com reset, a baseline deixa de
ser *"o estado que aconteceu uma vez"* e passa a ser *"o estado que se fabrica sob demanda"*.

---

## 1. Decisão vinculante — conteúdo normativo aplicável

Registro integral em `docs/DECISIONS.md`, `D-FUND-R2P1-ENTRY-RESET-01`. Resumo operativo:

1. **`R2P1_RETRY_ENTRY_BASELINE_01` continua sendo a única baseline operacional de entrada** e
   **não** será substituída a cada *retry*. Ela passa a poder ser **reproduzida**, sob `HUMAN
   GATE` próprio, por procedimento determinístico anterior ao item `13`.
2. **Finalidade:** tornar os *retries* repetíveis **sem** nova baseline, **sem** nova
   tolerância, **sem** *allowlist*, **sem** `AC_5` e **sem** alterar o comparador.
3. **As funções das duas referências permanecem distintas e nenhuma é removida:**
   `ARTEFATO 30 = proveniência + invariantes históricas de produto` ·
   `R2P1_RETRY_ENTRY_BASELINE_01 = estado operacional de entrada reproduzível`.
   A verificação das invariantes contra o artefato `30` **continua obrigatória**.

---

## 2. Constantes, variáveis e convenções

### 2.1 Variáveis do `HOST` (definidas uma vez, antes de qualquer passo)

```powershell
# ---- identidade fixa do alvo (NUNCA derivada, NUNCA parametrizada por entrada externa)
$ADB      = 'C:\Android\platform-tools\adb.exe'
$SERIAL   = 'RX2XC003LTJ'
$PKG      = 'com.valentedev.pequenostracosdefe'
$DATADIR  = '/data/user/0/com.valentedev.pequenostracosdefe'
$UID_ESP  = 10364
$GID_ESP  = 10364

# ---- raízes canônicas do escopo (as TRÊS, e somente elas)
$RAIZES   = @('databases','files','shared_prefs')

# ---- objetos de referência (somente leitura; nunca reescritos)
$BASE_TAR = 'C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\TAR-ENTRY-BASELINE-01.tar'
$BASE_SHA = 'DA87831C0D1AE6FA395A218FB2AF93F72BBBA4DDF0BC5005E88CC5D56356AB81'
$BASE_LEN = 17234944
$BASE_REF = 'C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\BASELINE-EXTRACTED'
$A30_REF  = 'C:\tmp\ptf_evidencias\F6R1-INSTALL-GATE-20260813-015532\POST\extract'
$CMP_SHA  = 'A7649DD2B92C7877ADAF12635E032DBC559F4074558B572CA1EDF8A9821EFDFD'

# ---- raiz de evidência DESTA execução (nova, exclusiva, criada em E0)
$EXEC     = 'C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01'
$CMP      = "$EXEC\tools\compare_state.py"
```

> **`O-1` (regra canônica do corpus, `14_R2_SESSAO_2` §`O-1`):** nunca depender de `adb` no
> `PATH`; sempre `$ADB` com caminho integral e `-s $SERIAL` em **todo** comando.

### 2.2 Conjunto canônico da baseline — constantes verificáveis

O TAR da baseline contém **22 entradas = 8 diretórios + 14 arquivos**. Zero *symlinks*, zero
*hardlinks*, zero nós especiais. Formato **PAX**, sem *pax headers* globais. Todas as entradas:
`uid 10364 / gid 10364 / uname u0_a364 / gname u0_a364`.

**Os 8 diretórios (`$DIRS_BASELINE`)** — nenhum deles é removido em nenhum passo:

```powershell
$DIRS_BASELINE = @(
  'databases',
  'files',
  'files/phenotype_storage_info',
  'files/phenotype_storage_info/shared',
  'files/ptf_blobs',
  'files/ptf_blobs/atelier',
  'files/ptf_blobs/drawings60',
  'shared_prefs'
)
```

| diretório | modo esperado |
|---|---|
| `databases` · `files` · `shared_prefs` | `0771` |
| `files/phenotype_storage_info` · `files/phenotype_storage_info/shared` | `0700` |
| `files/ptf_blobs` · `files/ptf_blobs/atelier` · `files/ptf_blobs/drawings60` | `0700` |

```powershell
$MODO_DIR_BASELINE = @{
  'databases' = '771'; 'files' = '771'; 'shared_prefs' = '771'
  'files/phenotype_storage_info' = '700'; 'files/phenotype_storage_info/shared' = '700'
  'files/ptf_blobs' = '700'; 'files/ptf_blobs/atelier' = '700'; 'files/ptf_blobs/drawings60' = '700'
}
```

**Os 14 arquivos (`$ARQS_BASELINE`)** — valores esperados exatos:

| # | caminho relativo | *bytes* | modo | `SHA256` | *mtime* (−03:00) | classe |
|---|---|---|---|---|---|---|
| 1 | `databases/RKStorage` | 49152 | `0660` | `950D93D13227E97F85E2FCBBD02B6918FBD07C13F136F37D405E4D4FE7B3FFA1` | 08-12 15:54:44 | **produto** |
| 2 | `databases/RKStorage-journal` | 0 | `0600` | `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` | 08-10 13:23:22 | **tolerado** |
| 3 | `files/DevLauncherApp-BridgelessReactNativeDevBundle.js` | 16863539 | `0600` | `CC7FB6FE3F43FF2281A6FF43B52E91AA804D1D6706D6C5E38CEDC65D45D092A3` | 08-13 17:23:41 | infra |
| 4 | `files/profileInstalled` | 24 | `0600` | `B6F5847664F2B9019A1DF493EB81D77C4E9092F70790CB823714B03602D7BF99` | 08-13 17:23:06 | infra |
| 5 | `files/phenotype_storage_info/shared/storage-info.pb` | 137 | `0600` | `A4AE55696A265D67ACC37C3200C7AB062B59699AAFFFD1F734225545275D1893` | 08-12 13:43:15 | **produto** |
| 6 | `files/ptf_blobs/atelier/art_1786479103982_6079_preview.jpg` | 89593 | `0600` | `FDC5529619201C3CC24CFC719DA719047DE9A65E827A8FD934644205D9E1E248` | 08-11 17:11:43 | **produto** |
| 7 | `files/ptf_blobs/atelier/art_1786479103982_6079_thumb.jpg` | 14730 | `0600` | `A5FB5908353A0E8D23C537AF2711C214D6E35F2048FD0281A60F3242A48910DE` | 08-11 17:11:44 | **produto** |
| 8 | `files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.a.png` | 200565 | `0600` | `6814DEE7975F95D126EAB69DDAE3E46C2BF59892DA429611B1141773E1C83F81` | 08-11 16:45:23 | **produto** |
| 9 | `shared_prefs/android.app.ActivityThread.IDS.xml` | 108 | `0660` | `DEC264C49B5F4F8B1526A8D84D803FC55102BE8B02C3B4A7F0EE6AC973CA9ECE` | 08-13 17:23:01 | infra |
| 10 | `shared_prefs/com.valentedev.pequenostracosdefe_preferences.xml` | 126 | `0660` | `95622E8F8BDD6D1DE6161184B706B5ACDDB687C490CE1AA42ECC21543696F022` | 08-10 23:37:30 | **produto** |
| 11 | `shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml` | 684 | `0660` | `3467F6CD284DE49193B3F8F01B31D9646D0A960322569B7733CC8290E8E9C81D` | 08-13 17:23:41 | infra |
| 12 | `shared_prefs/expo.modules.devmenu.sharedpreferences.xml` | 127 | `0660` | `496A13FD5BEC0B13B62950DC5B85776FC4E5452017C982ECC72AB33D7B49B91D` | 08-10 13:23:22 | **produto** |
| 13 | `shared_prefs/expo.modules.kotlin.PersistentDataManager.xml` | 65 | `0660` | `3325D2A819FDD8062C2CDC48A09B995C9B012915BCDF88B1CF9742A7F057C793` | 08-10 16:08:28 | **produto** |
| 14 | `shared_prefs/WebViewChromiumPrefs.xml` | 127 | `0660` | `72CACA87AC548DBF1C6DA29FD04F6246FDE1840091F4D9223F3F24CCF6776999` | 08-13 17:23:43 | infra |

A mesma tabela, na forma executável usada pelos passos (modo octal esperado por arquivo):

```powershell
$MODO_ARQ_BASELINE = @{
  'databases/RKStorage'                                              = '660'
  'databases/RKStorage-journal'                                      = '600'
  'files/DevLauncherApp-BridgelessReactNativeDevBundle.js'           = '600'
  'files/profileInstalled'                                           = '600'
  'files/phenotype_storage_info/shared/storage-info.pb'              = '600'
  'files/ptf_blobs/atelier/art_1786479103982_6079_preview.jpg'       = '600'
  'files/ptf_blobs/atelier/art_1786479103982_6079_thumb.jpg'         = '600'
  'files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.a.png' = '600'
  'shared_prefs/android.app.ActivityThread.IDS.xml'                  = '660'
  'shared_prefs/com.valentedev.pequenostracosdefe_preferences.xml'   = '660'
  'shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml'      = '660'
  'shared_prefs/expo.modules.devmenu.sharedpreferences.xml'          = '660'
  'shared_prefs/expo.modules.kotlin.PersistentDataManager.xml'       = '660'
  'shared_prefs/WebViewChromiumPrefs.xml'                            = '660'
}
$ARQS_BASELINE = @($MODO_ARQ_BASELINE.Keys | Sort-Object)     # os 14 caminhos
$MODO_ESPERADO = $MODO_ARQ_BASELINE + $MODO_DIR_BASELINE      # as 22 entradas
```

**Aritmética de fechamento:** 14 arquivos − 1 tolerado = **13 comparados**; 5 são infra ⇒
**8 invariantes de produto**. Bate exatamente com `ENTRY-vs-ARTEFATO30.txt`
(`FILES_CHANGED=5`, todos infra).

### 2.3 Regra de *quoting* — propriedade de segurança estrutural

**Dentro de `cmd.exe /c "…"` não há interpolação de variável, não há aspas aninhadas e todo
caminho é literal e sem espaços.** Essa é a forma proveniente do corpus
(`10_RODADA_FISICA_2` §5) e é a única usada aqui para canal binário.

**Regra `O-2` (canônica, `14_R2_SESSAO_2` §`O-2`):** `cmd.exe /c` é **obrigatório** em todo
redirecionamento binário (`>` de TAR, `<` de TAR). O `>` do PowerShell corrompe *stdout*
binário — foi o que produziu, historicamente, um `raw.log` em `UTF-16LE`.

Para comandos **não binários** (enumeração, `stat`, `ls -Z`) usa-se PowerShell diretamente com
`& $ADB`, porque a saída é texto e o `argv` é montado pelo próprio PowerShell — sem
reinterpretação por `cmd.exe`.

### 2.4 Validação de caminho — o coração da segurança destrutiva

Nenhum caminho enumerado do aparelho entra em comando destrutivo sem passar por esta função.
Ela é **rejeição por lista branca de forma**, não sanitização.

```powershell
# Um caminho só e valido se:
#   - comeca EXATAMENTE por uma das tres raizes canonicas;
#   - tem AO MENOS um segmento depois da raiz  -> uma raiz sozinha NUNCA e valida;
#   - todos os caracteres pertencem a  [A-Za-z0-9._-]  e '/'  -> nenhum metacaractere de shell;
#   - nenhum segmento e vazio, '.' ou '..'      -> nenhum path traversal.
$RX_CAMINHO = '^(databases|files|shared_prefs)(/[A-Za-z0-9._-]+)+$'

function Test-CaminhoSeguro {
    param([string]$Caminho)
    if ([string]::IsNullOrEmpty($Caminho))   { return $false }
    if ($Caminho -notmatch $RX_CAMINHO)      { return $false }
    foreach ($seg in $Caminho.Split('/')) {
        if ($seg -eq '' -or $seg -eq '.' -or $seg -eq '..') { return $false }
    }
    return $true
}
```

**Cinco propriedades que essa função garante por construção — e que o auditor pode verificar
lendo apenas a expressão regular:**

| propriedade | mecanismo |
|---|---|
| impossível remover raiz de topo | a *regex* exige `(/segmento)+` **depois** da raiz; `databases` sozinho **não casa** |
| impossível *path traversal* | `..` é rejeitado explicitamente segmento a segmento |
| impossível sair das três raízes | a *regex* é ancorada em `^(databases\|files\|shared_prefs)` |
| impossível alcançar `cache/`, `code_cache/`, `no_backup/` | não são raízes aceitas pela *regex* |
| impossível quebrar *quoting* | o conjunto `[A-Za-z0-9._-]` exclui espaço, aspas, `$`, `` ` ``, `;`, `&`, `\|`, `*`, `?`, `(`, `)`, `<`, `>`, `\n` |

**Consequência normativa:** qualquer caminho enumerado que **falhe** em `Test-CaminhoSeguro`
produz **`R2P1_STOP_ENTRY_RESET_FAILED` ANTES do primeiro `rm`** — nunca é sanitizado,
truncado, corrigido ou ignorado.

### 2.5 O reparse de `adb shell` — restrição de forma imposta a todo comando de aparelho

**Fato mecânico:** `adb shell a b c` **não** entrega três argumentos ao aparelho. O cliente
**junta o `argv` com espaços** e o **shell do dispositivo reparseia a string inteira**. Qualquer
aspa que o PowerShell tenha consumido **já não existe** do lado de lá; qualquer espaço dentro de
um argumento vira **separador**; qualquer metacaractere vira **sintaxe**.

**Consequência de desenho — três proibições de forma, válidas para TODO comando deste
documento dirigido ao aparelho:**

| # | proibição | motivo |
|---|---|---|
| `F1` | **nenhum `sh -c`** | o shell externo consumiria as aspas e `-c` receberia apenas a primeira palavra; o restante viraria argumento posicional |
| `F2` | **nenhum argumento contendo espaço** | seria fatiado em dois argumentos pelo shell do aparelho |
| `F3` | **nenhum argumento contendo metacaractere** (`\|`, `>`, `<`, `;`, `&`, `*`, `?`, `$`, `` ` ``, `(`, `)`, aspas) | seria interpretado como sintaxe pelo shell do aparelho |

**Como o desenho satisfaz as três.** Todo comando de aparelho é composto **apenas** de palavras
atômicas do conjunto `[A-Za-z0-9._%:/-]`: verbos (`find`, `stat`, `ls`, `rm`, `rmdir`, `tar`,
`pidof`), *flags* de uma palavra (`-type`, `-f`, `-c`, `-x`, `-t`, `-Zd`, `--`), o *package*
literal, as três raízes e caminhos já aprovados por `Test-CaminhoSeguro` (§2.4), cujo conjunto
de caracteres **exclui por construção** espaço e todo metacaractere. Onde seria natural usar um
formato com espaços — `stat -c '%n %a %u'` — o desenho usa **`:` como separador**, que não é
metacaractere em `sh`, eliminando a necessidade de aspas.

**Por isso "caminhos tratados como dados, não como fragmentos de comando" é verificável:**
nenhum caminho é concatenado em uma *string* de comando; cada um viaja como palavra atômica
própria, e a `regex` de §2.4 garante que essa palavra não possa se transformar em outra coisa
depois do reparse.

**Ganho colateral, deliberado:** ao proibir formatos com espaço, o desenho fica **imune à
divergência de aspas entre PowerShell 5.1, `cmd.exe` e o `sh` do Android** — as três camadas
veem exatamente as mesmas palavras.

> **`F1`–`F3` foram descobertas auditando este próprio documento.** A primeira redação usava
> `sh -c "find … -exec stat -c '%n|%a|…' {} +"`, que **não funcionaria** — e cuja falha só
> apareceria na execução. Está registrado aqui porque a auditoria estática servir para alguma
> coisa significa exatamente isto.

---

## 3. Regras normativas desta janela

### 3.1 Tokens de `STOP` e a fronteira entre eles

| token | quando se aplica | criado por |
|---|---|---|
| **`R2P1_STOP_ENTRY_RESET_FAILED`** | falha **dentro** da operação de reset, **antes** de a restauração ter sido concluída e validada pelos itens `13` e `14` | `D-FUND-R2P1-ENTRY-RESET-01` (novo) |
| **`R2P1_STOP_ENTRY_BASELINE_DIVERGED`** | a restauração **terminou**, o item `13` capturou corretamente, o item `14` executou normalmente sobre um TAR íntegro **e o comparador encontrou divergência** | corpus vigente |
| **`R2P1_STOP_BINARY_BASELINE_DIVERGED`** | identidade de instalação divergente no item `12` | corpus vigente |
| **`R2P1_STOP_PORT_OCCUPIED`** | *listener* inesperado em `8081`/`8082`/`8083` | corpus vigente |

**Casos que produzem `R2P1_STOP_ENTRY_RESET_FAILED`:** falha de remoção · falha de extração ·
`ADB` perdido durante mutação · estado parcial · *rollback* necessário · estrutura restaurada
inválida · metadado estrutural crítico divergente · SELinux divergente da referência pré-remoção
· qualquer situação em que o aparelho possa estar **parcialmente restaurado ou indeterminado**.

**A distinção é normativa.** Um token diz *"a operação não chegou ao fim"*; o outro diz *"a
operação chegou ao fim e o resultado não bate"*. Confundi-los apagaria a diferença entre
aparelho em estado conhecido e aparelho em estado indeterminado.

### 3.2 `MTIME_GATE = DIAGNOSTIC_ONLY`

`mtime` **não** integra o veredito de igualdade do item `14` — o comparador não o lê
(`compare_state.py` inventaria apenas caminho, tamanho e `SHA256` do conteúdo).

`mtime` **não pode**, sozinho, causar `R2P1_STOP_ENTRY_BASELINE_DIVERGED`.

`mtime` **deve** ser registrado, para: forense · atribuição temporal · detecção de comportamento
inesperado · comparação entre restaurações. **Nenhum gate novo é criado por `mtime`.**

> **Uso diagnóstico de alto valor, registrado como tal:** como `tar` restaura `mtime`, todo
> arquivo vindo do TAR deve exibir o `mtime` da baseline (`17:23:xx` para os cinco de infra).
> Um `mtime` "de agora" denuncia um arquivo que **não** veio do TAR. Isso é **sinal
> diagnóstico**, não critério de reprovação.

### 3.3 `RESET_WINDOW_SCOPE_RULE = HARD_STOP`

Entre o **início de `E5`** e o **encerramento válido do item `14`**, se `ESCOPO_OK = NAO`:

**NÃO** recapturar · **NÃO** repetir captura · **NÃO** prosseguir · **NÃO** explicar como falha
de comando · **NÃO** executar item seguinte.

| situação | resultado |
|---|---|
| a falha ocorreu **durante ou imediatamente após** a restauração, antes de um estado validado | **`R2P1_STOP_ENTRY_RESET_FAILED`** |
| a restauração **já foi declarada completa** e o item `14` está avaliando normalmente um TAR de entrada íntegro | **`R2P1_STOP_ENTRY_BASELINE_DIVERGED`** |

No protocolo histórico, `ESCOPO_OK=NAO` **podia** significar recaptura, porque a causa provável
era erro de captura sobre um aparelho **não mutado**. **Essa semântica não se aplica dentro de
uma janela destrutiva.** Dentro do reset, escopo divergente é indistinguível, a priori, de
extração parcial — e extração parcial é estado indeterminado.

### 3.4 Disciplina de *rollback*

| regra | valor |
|---|---|
| autorização | **faz parte da mesma autorização** de `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION`; **não** exige segundo gate depois que a mutação começou |
| artefato admissível | **exclusivamente** o TAR capturado em `E3` desta mesma execução |
| tentativas | **`ROLLBACK_ATTEMPTS = 1`** |
| proibido | *loop* de *rollback* · nova restauração para testar · segunda tentativa automática · reexecução de `E5`/`E6` para "fazer passar" |
| efeito no veredito | *rollback* bem-sucedido **NÃO** transforma a execução em `PASS`. O resultado continua `R2P1_STOP_ENTRY_RESET_FAILED` |

**Condições cumulativas para poder usar o *rollback*:** `E3` concluído com sucesso · TAR existe
no `HOST` · tamanho e `SHA256` registrados · listagem registrada · a falha ocorreu **depois do
início de `E5`** · não há dúvida sobre qual *rollback* pertence àquela execução.

**Se o *rollback* não puder ser executado** — `ADB` indisponível, `run-as` não funciona,
*rollback* inválido, *rollback* truncado, ou a restauração do *rollback* falhou: **NÃO**
improvisar · **NÃO** executar segunda restauração · **NÃO** abrir o app · **NÃO** usar
`pm clear` · **NÃO** instalar · **NÃO** apagar mais nada. Classificar
`R2P1_STOP_ENTRY_RESET_FAILED` com **`DEVICE_STATE = INDETERMINATE`** e aguardar novo
`HUMAN GATE`.

### 3.5 Atos permanentemente proibidos neste procedimento

`pm clear` · `adb install` · `adb install -r` · `adb uninstall` · *root* · troca de binário ·
`chmod` corretivo · `chcon` · `restorecon` · edição de `compare_state.py` · criação de
tolerância, *allowlist* ou `AC_5` · redefinição da baseline · recuperação silenciosa.

**`PM_CLEAR_ALLOWED_AS_RESET = NÃO`** — proibido literalmente em `docs/DECISIONS.md` (`:2718`,
`:2769`, `:2913`, `:3045`, `:3592`, `:3734`); **não é restauração** (produz o estado *vazio*);
destruiria `files/ptf_blobs/` (a obra do fundador, cujo único *backup* é o TAR); destruiria
`cache/`, `code_cache/`, `no_backup/`, para os quais **não existe fonte de restauração**;
revogaria permissões de tempo de execução; e contaminaria a proveniência.

**`REINSTALL_ALLOWED_AS_RESET = NÃO`** — o item `12` **detecta e mata**: reinstalar altera
`lastUpdateTime` e `codePath`; desinstalar+instalar altera `firstInstallTime` **e muda o `uid`**
(hoje `10364`), quebrando `run-as` e a cadeia de custódia inteira ⇒
`R2P1_STOP_BINARY_BASELINE_DIVERGED`.

---

## 4. Procedimento `E-1` … `E8`

**Legenda de tipo:** `READ-ONLY` = não altera nada no aparelho · `MUTANTE` = altera o aparelho.
**Somente `E5` e `E6` são `MUTANTE`.** Todo o resto é leitura.

---

### `E-1` — Pré-voo integral, itens `1`..`12`

| campo | valor |
|---|---|
| **OBJETIVO** | Estabelecer todas as pré-condições canônicas da campanha antes de qualquer coisa. |
| **PRÉ-CONDIÇÃO** | `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` concedido, citando o `SHA256` integral deste documento. |
| **TIPO** | `READ-ONLY` |
| **VARIÁVEIS** | §2.1 |
| **SAÍDA ESPERADA** | Itens `1`..`12` do pré-voo integral, todos `PASS`, incluindo `OFFSET_MS` **remedido nesta execução** (nunca herdado) e o item `12` conferindo `11/11` campos de identidade de instalação contra o artefato `30`. |
| **PASS** | Os doze itens `PASS`. |
| **STOP** | Item `11` ⇒ `R2P1_STOP_PORT_OCCUPIED`. Item `12` ⇒ `R2P1_STOP_BINARY_BASELINE_DIVERGED` e **NÃO instalar**. |
| **EVIDÊNCIA** | `$EXEC\preflight\00_PREVOO.txt`, `$EXEC\preflight\12_dumpsys_package_raw.txt` |

O item `12` é o que **prova a identidade do alvo** (`appId=10364`, assinatura `3351bd8d`,
`dataDir`). Operar destrutivamente sob `run-as` **antes** de confirmar contra quem se opera
inverteria a ordem elementar de segurança — é por isso que o reset vem **depois** do item `12`.

---

### `E0` — Integridade de Git, baseline, instrumento e raiz de evidência

| campo | valor |
|---|---|
| **OBJETIVO** | Provar que o repositório, a baseline e o instrumento estão íntegros; criar raiz de evidência nova e exclusiva. |
| **PRÉ-CONDIÇÃO** | `E-1` `PASS`. |
| **TIPO** | `READ-ONLY` (no aparelho); escreve **apenas** no `HOST`, em raiz nova. |
| **SAÍDA ESPERADA** | Branch/HEAD/status conforme; `$BASE_SHA` e `$BASE_LEN` conferem; `compare_state.py` = `$CMP_SHA`; `Test-Path $EXEC` = `False` antes da criação. |
| **PASS** | Todas as conferências batem. |
| **STOP** | Qualquer *hash* divergente ⇒ **`STOP`** (fora da janela destrutiva: nada foi mutado). `Test-Path $EXEC` = `True` ⇒ `R2P1_STOP_EVIDENCE_ROOT_PREEXISTS`. |
| **EVIDÊNCIA** | `$EXEC\00_E0_INTEGRIDADE.txt` |

```powershell
# --- Git
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git status --porcelain --untracked-files=all

# --- baseline (recalculada agora, nunca lida de registro)
(Get-Item     $BASE_TAR).Length          # esperado: 17234944
(Get-FileHash $BASE_TAR -Algorithm SHA256).Hash   # esperado: $BASE_SHA
(Get-ChildItem $BASE_REF -Recurse -File).Count    # esperado: 14

# --- raiz de evidencia NOVA e EXCLUSIVA
Test-Path $EXEC                          # DEVE ser False; se True -> STOP
New-Item -ItemType Directory -Force $EXEC          | Out-Null
New-Item -ItemType Directory -Force "$EXEC\tools"  | Out-Null
New-Item -ItemType Directory -Force "$EXEC\acervo" | Out-Null
New-Item -ItemType Directory -Force "$EXEC\preflight" | Out-Null
New-Item -ItemType Directory -Force "$EXEC\reset"  | Out-Null

# --- instrumento selado, copiado da origem canonica (NUNCA recriado, NUNCA editado)
Copy-Item 'C:\tmp\ptf_evidencias\R2S2\compare_state.py' $CMP
(Get-FileHash $CMP -Algorithm SHA256).Hash        # DEVE ser exatamente $CMP_SHA
```

---

### `E1` — Confirmar aplicativo parado (sem *force-stop* corretivo)

| campo | valor |
|---|---|
| **OBJETIVO** | Provar que nenhum processo do *package* está vivo — condição sem a qual escrever em SQLite é temerário. |
| **PRÉ-CONDIÇÃO** | `E0` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | `pidof` **sem saída**. |
| **PASS** | Nenhum PID. |
| **STOP** | Qualquer PID ⇒ **`STOP`**. **É proibido emitir `force-stop` neste ponto para mascarar atividade inesperada** (regra literal do item `13`). |
| **EVIDÊNCIA** | `$EXEC\reset\01_PIDOF_ANTES.txt` |

```powershell
& $ADB -s $SERIAL shell pidof com.valentedev.pequenostracosdefe |
    Tee-Object -FilePath "$EXEC\reset\01_PIDOF_ANTES.txt"
```

> **Contexto medido:** no encerramento de `R2P1_RETRY_02` o aplicativo já ficou parado pelo
> `S2` canônico. O pré-voo de `R2P1_RETRY_02` registrou `PIDOF_ANTES = []` **sem nenhum
> `force-stop`** — precedente direto de que esta pré-condição chega satisfeita.

---

### `E2` — Confirmar Metro, `reverse` e `PS3` ausentes; portas livres

| campo | valor |
|---|---|
| **OBJETIVO** | Provar que nenhuma infraestrutura está de pé — nenhum *writer* potencial, nenhuma porta aberta para lançamento acidental. |
| **PRÉ-CONDIÇÃO** | `E1` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | `0` *listeners* em `8081`/`8082`/`8083`; `0` processos `node`; `adb reverse --list` **vazio**; nenhuma captura de `logcat` viva; `logcat` **ainda não limpo**. |
| **PASS** | Todas as contagens em zero. |
| **STOP** | *Listener* inesperado ⇒ `R2P1_STOP_PORT_OCCUPIED`. **Não matar processo automaticamente.** |
| **EVIDÊNCIA** | `$EXEC\reset\02_INFRA_AUSENTE.txt` |

```powershell
@(Get-NetTCPConnection -State Listen -LocalPort 8081,8082,8083 -ErrorAction SilentlyContinue).Count
@(Get-Process node -ErrorAction SilentlyContinue).Count
& $ADB -s $SERIAL reverse --list
```

> `@(...)` é obrigatório: em PowerShell 5.1 um resultado único de `Where-Object`/cmdlet retorna
> escalar e `.Count` mediria caracteres, não elementos.

---

### `E3` — Capturar e validar o *rollback* do estado atual

| campo | valor |
|---|---|
| **OBJETIVO** | Produzir o **único** artefato que torna `E5` reversível. Também é a medição do estado físico atual, hoje `NÃO COMPROVADO`. |
| **PRÉ-CONDIÇÃO** | `E2` `PASS`. |
| **TIPO** | `READ-ONLY` (captura por `stdout`; **nenhum TAR dentro do aparelho**) |
| **SAÍDA ESPERADA** | TAR íntegro no `HOST`; `tar -tf` lista o conteúdo; presença de `databases/`, `files/`, `shared_prefs/`. |
| **PASS** | `EXIT = 0` · tamanho plausível · `SHA256` registrado · listagem registrada. |
| **STOP** | Falha de captura ⇒ **`STOP` antes de qualquer remoção**. Sem `E3` válido, `E5` **não pode começar** (§3.4). |
| **EVIDÊNCIA** | `$EXEC\reset\TAR-ROLLBACK-PRE-RESET.tar` · `…\03_ROLLBACK_META.txt` · `…\03_ROLLBACK_LISTAGEM.txt` |

```powershell
cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ exec-out run-as com.valentedev.pequenostracosdefe tar -c databases files shared_prefs > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\TAR-ROLLBACK-PRE-RESET.tar"

$RB = "$EXEC\reset\TAR-ROLLBACK-PRE-RESET.tar"
(Get-Item     $RB).Length
(Get-FileHash $RB -Algorithm SHA256).Hash
tar -tvf $RB | Tee-Object -FilePath "$EXEC\reset\03_ROLLBACK_LISTAGEM.txt"
```

> **Ordem do escopo:** `databases files shared_prefs` — **exatamente** a ordem usada na captura
> que originou a baseline. O comparador não depende da ordem (compara árvores extraídas), mas a
> igualdade de *bytes* do TAR sim, e ela é indicador corroborante valioso.

---

### `E3A` — Invariantes de produto **ANTES** de qualquer remoção

| campo | valor |
|---|---|
| **OBJETIVO** | Impedir que a restauração **apague evidência** de uma divergência de produto já existente. |
| **PRÉ-CONDIÇÃO** | `E3` `PASS`. |
| **TIPO** | `READ-ONLY` (opera sobre o TAR de `E3`, já no `HOST`) |
| **SAÍDA ESPERADA** | `8/8` invariantes de produto idênticas ao artefato `30`; `KEYS_ADDED = KEYS_CHANGED = KEYS_DELETED = KEYS_ROWID_MOVED = 0`. |
| **PASS** | **`PRE_RESET_PRODUCT_INVARIANTS = PASS`** |
| **STOP** | Qualquer invariante de produto divergente ⇒ **`STOP` ANTES DA REMOÇÃO**. Não restaurar. Não mascarar. Não modificar o aparelho. |
| **EVIDÊNCIA** | `$EXEC\reset\03A_PRE_RESET_vs_ARTEFATO30.txt` |

```powershell
New-Item -ItemType Directory -Force "$EXEC\reset\ROLLBACK-EXTRACTED" | Out-Null
tar -xf "$EXEC\reset\TAR-ROLLBACK-PRE-RESET.tar" -C "$EXEC\reset\ROLLBACK-EXTRACTED"

python $CMP $A30_REF "$EXEC\reset\ROLLBACK-EXTRACTED" "$EXEC\reset\03A_PRE_RESET_vs_ARTEFATO30.txt"
Get-Content "$EXEC\reset\03A_PRE_RESET_vs_ARTEFATO30.txt"
```

**Leitura obrigatória da saída.** O `ENTRY_STATE_RESULT` deste passo **não** precisa ser `PASS`:
espera-se `STOP` com `FILES_CHANGED` listando **apenas** arquivos de **infraestrutura**. O que é
exigido é:

| exigência | verificação |
|---|---|
| `ESCOPO_OK` | `= SIM` |
| `FILES_ADDED` | pode ser `> 0` (resíduo posterior); **registrar**, não é STOP aqui |
| `FILES_CHANGED` | **nenhum** dos `8` caminhos de produto da tabela §2.2 pode aparecer |
| `FILES_DELETED` | **nenhum** dos `8` caminhos de produto pode aparecer |
| `KEYS_*` | os quatro **obrigatoriamente** `0` |

**Esta prova NÃO substitui `E8`.** Existem **duas** provas de invariantes: **antes** da
restauração (aqui) e **depois** da restauração (`E8`).

---

### `E4` — Enumerar integralmente o conteúdo das três subárvores

| campo | valor |
|---|---|
| **OBJETIVO** | Produzir a lista explícita que dirigirá `E5`. Sem ela, remoção viraria *wildcard*. |
| **PRÉ-CONDIÇÃO** | `E3A` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | Lista de arquivos e lista de diretórios, integrais, das **três** subárvores — e de nada mais. |
| **PASS** | Toda linha passa em `Test-CaminhoSeguro`. |
| **STOP** | **Qualquer** linha que falhe ⇒ `R2P1_STOP_ENTRY_RESET_FAILED`, **antes do primeiro `rm`**. Não sanitizar, não truncar, não ignorar. |
| **EVIDÊNCIA** | `$EXEC\reset\04_ENUM_ARQUIVOS.txt` · `…\04_ENUM_DIRS.txt` · `…\04_RESIDUOS.txt` · `…\04_VALIDACAO.txt` |

```powershell
# --- enumeracao (primaria: find; fallback declarado: ls -alR)
& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f |
    Tee-Object -FilePath "$EXEC\reset\04_ENUM_ARQUIVOS.txt"
& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type d |
    Tee-Object -FilePath "$EXEC\reset\04_ENUM_DIRS.txt"
```

```powershell
# --- normalizacao e VALIDACAO OBRIGATORIA (caminhos tratados como DADOS)
$arqBrutos = Get-Content "$EXEC\reset\04_ENUM_ARQUIVOS.txt" |
             ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
$dirBrutos = Get-Content "$EXEC\reset\04_ENUM_DIRS.txt" |
             ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }

$arqInvalidos = @($arqBrutos | Where-Object { -not (Test-CaminhoSeguro $_) })
$dirInvalidos = @($dirBrutos | Where-Object {
                    -not ($RAIZES -contains $_) -and -not (Test-CaminhoSeguro $_) })

if ($arqInvalidos.Count -gt 0 -or $dirInvalidos.Count -gt 0) {
    # NAO remover nada. NAO corrigir. NAO continuar.
    'R2P1_STOP_ENTRY_RESET_FAILED (caminho invalido na enumeracao)' |
        Out-File "$EXEC\reset\04_VALIDACAO.txt" -Encoding utf8
    throw 'R2P1_STOP_ENTRY_RESET_FAILED'
}

# --- conjunto-residuo: o que existe hoje e NAO pertence a baseline
$RESIDUOS = @($arqBrutos | Where-Object { $ARQS_BASELINE -notcontains $_ })
$RESIDUOS | Out-File "$EXEC\reset\04_RESIDUOS.txt" -Encoding utf8

# --- diretorios inesperados: existem hoje e NAO pertencem aos 8 da baseline
$DIRS_INESPERADOS = @($dirBrutos | Where-Object {
                        $DIRS_BASELINE -notcontains $_ -and $RAIZES -notcontains $_ })
```

> **`OVERWRITE_ONLY_SUFFICIENT = NÃO`.** Sobrescrever os 14 arquivos conhecidos **não** produz
> equivalência: `compare_state.py:51` calcula `FILES_ADDED = set(atual) − set(ref)`, e um único
> resíduo sobrevivente produz `FILES_ADDED ≥ 1` ⇒ `ENTRY_STATE_RESULT=STOP`. Resíduo em
> subárvore nova produz `ESCOPO_OK=NAO` ⇒ `STOP_ESCOPO_DIVERGENTE`. Por isso `E4` + `E5`
> existem.

---

### `E4A` — `SELINUX_PRE` — construir a referência de SELinux

| campo | valor |
|---|---|
| **OBJETIVO** | Construir **agora** a referência de contexto SELinux. **Não existe referência histórica de `ls -Z`** — é preciso criá-la nesta execução, antes da remoção. |
| **PRÉ-CONDIÇÃO** | `E4` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | Contexto das 22 entradas relevantes **e** dos três diretórios de topo. |
| **PASS** | Captura completa e legível de todas as entradas enumeradas. |
| **STOP** | Se `ls -Z` não produzir contexto legível para as entradas ⇒ **`STOP` antes de `E5`**: sem `SELINUX_PRE` não há como validar `SELINUX_POST`, e prosseguir seria remover sem referência. |
| **EVIDÊNCIA** | `$EXEC\reset\04A_SELINUX_PRE.txt` |

```powershell
# UMA invocacao por caminho: 'ls -Zd' NAO recursivo devolve o contexto DAQUELE caminho.
# Cada caminho viaja como palavra atomica (F2/F3 de 2.5); nenhum 'sh -c' (F1).
$ALVOS_META = @($RAIZES) + @($dirBrutos | Where-Object { $RAIZES -notcontains $_ }) + @($arqBrutos)

foreach ($rel in $ALVOS_META) {
    if (-not (Test-CaminhoSeguro $rel) -and ($RAIZES -notcontains $rel)) {
        throw 'R2P1_STOP_ENTRY_RESET_FAILED'
    }
    $ctx = (& $ADB -s $SERIAL shell run-as $PKG ls -Zd -- $rel) -join ' '
    "$rel=$($ctx.Trim())" |
        Out-File "$EXEC\reset\04A_SELINUX_PRE.txt" -Append -Encoding utf8
}
```

**A referência é `SELINUX_PRE` da própria execução.** Este documento **não** finge que existe um
valor histórico anteriormente medido. Resultado esperado em `E7A`: contexto **funcionalmente
equivalente**, dentro da mesma instalação, mesmo `uid`, mesmo *package* e mesma janela.

> **Propriedade que dispensa conhecer o formato de saída de `ls -Zd`.** O formato exato da linha
> do `toybox` deste aparelho é **`NÃO COMPROVADO`** — e **não precisa** ser conhecido. `E4A` e
> `E7A` usam **o mesmo comando, sobre o mesmo caminho, na mesma instalação, na mesma janela**;
> a comparação é entre duas saídas produzidas identicamente. O desenho registra a linha
> **verbatim**, indexada pelo caminho, e compara texto com texto. Se o formato for
> `contexto caminho`, `caminho contexto` ou incluir colunas extras, a comparação continua
> válida. O que o desenho **não** faz é interpretar o rótulo — e não precisa fazer.

> **`ls -Zd -- <caminho>` não recursivo é a escolha correta**, e não `ls -ZR`: com `-R` a saída
> vem agrupada por cabeçalhos de diretório, exigindo **reconstruir** o caminho relativo a partir
> do cabeçalho — trabalho de parsing que pode errar em silêncio. Uma linha por caminho, indexada
> pelo próprio caminho, não tem essa classe de defeito.

---

### `E4B` — `MODE_PRE` — modo, *ownership* e grupo antes da remoção

| campo | valor |
|---|---|
| **OBJETIVO** | Construir a referência de metadados estruturais. O comparador **não** vê modo/dono/grupo — este é o ponto cego que `E7B` fecha. |
| **PRÉ-CONDIÇÃO** | `E4A` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | Para cada entrada: nome, modo octal, `uid`, `gid`, `uname`, `gname`, tamanho, `mtime`, tipo. Esperado `uid 10364` / `gid 10364` em **todas**. |
| **PASS** | Captura completa; `uid`/`gid` = `10364` em todas as entradas. |
| **STOP** | `uid`/`gid` diferente de `10364` ⇒ **`STOP`**: o alvo não é o que o item `12` provou. |
| **EVIDÊNCIA** | `$EXEC\reset\04B_MODE_PRE.txt` |

```powershell
# FORMATO SEM ESPACOS: ':' nao e metacaractere em sh, portanto NAO precisa de aspas
# e sobrevive intacto ao reparse do shell do aparelho (2.5).
# Campos: 0=%n caminho  1=%a modo  2=%u uid  3=%g gid  4=%U uname  5=%G gname
#         6=%s bytes    7=%Y mtime_epoch
$FMT = '%n:%a:%u:%g:%U:%G:%s:%Y'

foreach ($rel in $ALVOS_META) {
    $linha = (& $ADB -s $SERIAL shell run-as $PKG stat -c $FMT -- $rel) -join ' '
    $linha.Trim() | Out-File "$EXEC\reset\04B_MODE_PRE.txt" -Append -Encoding utf8
}
```

```powershell
# fallback DECLARADO, caso 'stat' nao exista no toybox deste aparelho.
# Tambem sem espacos em argumento e sem 'sh -c':
#   & $ADB -s $SERIAL shell run-as $PKG ls -lan -d -- $rel
# O executor registra QUAL das duas formas funcionou. Nenhuma e destrutiva:
# falharem apenas adia E5 -- nunca corrompe estado.
```

> **`NÃO COMPROVADO`, declarado:** a disponibilidade de `stat` no `toybox` **deste** aparelho
> nunca foi exercida. `find -exec … +` **não** é usado — foi eliminado por `F1`/`F2` de §2.5.
>
> **Nota de precisão sobre `%a`:** `stat -c %a` devolve o modo octal **sem zero à esquerda**
> (`771`, `660`, `600`) — por isso `$MODO_DIR_BASELINE` e `$MODO_ARQ_BASELINE` (§2.2) armazenam
> exatamente essa forma, e não `0771`/`0660`. A tabela §2.2 exibe a forma de quatro dígitos, que
> é a convenção de leitura humana; a comparação usa a forma que o comando realmente emite.

---

### `E4C` — `STDIN_CHANNEL_PROBE` — prova **não destrutiva** do canal de entrada

| campo | valor |
|---|---|
| **OBJETIVO** | Provar, **antes de remover qualquer coisa**, que o canal `HOST → stdin → run-as → tar` é fiel a *bytes*. É o único componente do reset cujo comportamento nunca foi exercido neste aparelho. |
| **PRÉ-CONDIÇÃO** | `E4B` `PASS`. |
| **TIPO** | `READ-ONLY` — `tar -t` **apenas lista**; não cria, não sobrescreve, não remove. |
| **SAÍDA ESPERADA** | **22 entradas**, idênticas à listagem selada da baseline. |
| **PASS** | 22 linhas; conjunto de caminhos igual ao da baseline; `tar` sem erro. |
| **STOP** | Contagem diferente, erro de `tar`, *checksum* inválido ou saída truncada ⇒ **`STOP` antes de `E5`**. Nenhuma mutação ocorreu; o aparelho continua em estado conhecido. |
| **EVIDÊNCIA** | `$EXEC\reset\04C_STDIN_PROBE.txt` |

```powershell
cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell run-as com.valentedev.pequenostracosdefe tar -t < C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\TAR-ENTRY-BASELINE-01.tar > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\04C_STDIN_PROBE.txt"

@(Get-Content "$EXEC\reset\04C_STDIN_PROBE.txt" |
  ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }).Count   # esperado: 22
```

> **Por que este passo foi acrescentado.** O risco não medido do desenho é a fidelidade de
> `stdin` através de `adb shell` (tradução `LF`↔`CRLF` em canal não-`raw`). Sem este teste, esse
> risco só apareceria **depois** de o conteúdo já ter sido removido — exatamente no pior momento.
> `tar -t` transforma um risco pós-destrutivo em uma verificação pré-destrutiva de custo zero.
> **É acréscimo, não substituição:** nenhum passo exigido pela decisão foi reduzido.

**Se `E4C` falhar — o que NÃO fazer e o que registrar.** Falha aqui significa: o canal de
`stdin` não é fiel a *bytes* neste par `adb`/aparelho. Nesse caso: **STOP antes de `E5`**;
nenhuma mutação ocorreu; o aparelho continua íntegro. **Não** improvisar variação de comando
para "fazer passar".

Existem duas alternativas técnicas conhecidas, registradas aqui **como informação para uma
decisão futura** e explicitamente **`NÃO COMPROVADAS` e `NÃO AUTORIZADAS` por este documento**:

| alternativa | efeito | estado |
|---|---|---|
| `adb shell -T …` | desabilita alocação de `PTY`, forçando canal binário puro | `NÃO COMPROVADO` neste `platform-tools`; `NÃO AUTORIZADO` |
| `adb exec-in …` | contraparte de `exec-out` para entrada binária | `NÃO COMPROVADO`; `NÃO AUTORIZADO`; nem todas as versões expõem o verbo |

Adotar qualquer uma delas **muda os comandos auditados** e portanto exige **novo desenho, novo
`SHA256` e novo `HUMAN GATE`** — é exatamente o mecanismo que §14 institui ao exigir que o gate
de execução cite o *hash* integral do desenho.

---

### `E5` — Remover, por lista explícita, **somente** o conteúdo autorizado ⚠️ **MUTANTE**

| campo | valor |
|---|---|
| **OBJETIVO** | Levar as três subárvores ao conjunto vazio de arquivos, sem tocar em nada fora delas. |
| **PRÉ-CONDIÇÃO** | `E3` `PASS` (*rollback* existe, com `SHA256` e listagem) · `E3A` `PASS` · `E4` `PASS` (100 % validado) · `E4A` `PASS` · `E4B` `PASS` · `E4C` `PASS`. **Todas cumulativas.** |
| **TIPO** | ⚠️ **MUTANTE — início da janela destrutiva.** A partir daqui vale `RESET_WINDOW_SCOPE_RULE = HARD_STOP` e a **proibição de recaptura** (§6). |
| **SAÍDA ESPERADA** | `find … -type f` posterior **vazio**; os 8 diretórios da baseline **intactos**. |
| **PASS** | Zero arquivos remanescentes nas três subárvores; os `$DIRS_BASELINE` continuam existindo. |
| **STOP** | Qualquer erro de remoção ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* (§5). |
| **EVIDÊNCIA** | `$EXEC\reset\05_REMOCAO_LOG.txt` · `…\05_POS_REMOCAO.txt` |

```powershell
# ---------- 5.1  ARQUIVOS: um 'rm -f' por caminho, cada caminho revalidado NA HORA
foreach ($rel in $arqBrutos) {
    if (-not (Test-CaminhoSeguro $rel)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }   # 2a barreira
    $out = (& $ADB -s $SERIAL shell run-as $PKG rm -f -- $rel) -join ' '
    "RM|$rel|EXIT=$LASTEXITCODE|OUT=$($out.Trim())" |
        Out-File "$EXEC\reset\05_REMOCAO_LOG.txt" -Append -Encoding utf8
    if ($LASTEXITCODE -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

# ---------- 5.2  DIRETORIOS INESPERADOS: rmdir, mais profundo primeiro, nunca as raizes
$ordenados = @($DIRS_INESPERADOS | Sort-Object { ($_ -split '/').Count } -Descending)
foreach ($rel in $ordenados) {
    if (-not (Test-CaminhoSeguro $rel)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }   # 2a barreira
    if ($RAIZES -contains $rel)         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }   # 3a barreira
    $out = (& $ADB -s $SERIAL shell run-as $PKG rmdir -- $rel) -join ' '
    "RMDIR|$rel|EXIT=$LASTEXITCODE|OUT=$($out.Trim())" |
        Out-File "$EXEC\reset\05_REMOCAO_LOG.txt" -Append -Encoding utf8
    if ($LASTEXITCODE -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

# ---------- 5.3  CONFERENCIA ESTRUTURAL -- esta e a prova, nao o codigo de saida
& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f |
    Tee-Object -FilePath "$EXEC\reset\05_POS_REMOCAO.txt"      # esperado: VAZIO

$restantes = @(Get-Content "$EXEC\reset\05_POS_REMOCAO.txt" -ErrorAction SilentlyContinue |
               ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
if ($restantes.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# os 8 diretorios da baseline DEVEM continuar existindo
$dirsPos = @(& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type d |
             ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
foreach ($d in $DIRS_BASELINE) {
    if ($dirsPos -notcontains $d) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}
```

> **Ressalva declarada sobre `$LASTEXITCODE`.** O código de saída remoto só é propagado pelo
> `adb` com o **protocolo de shell v2**; em transporte antigo, `adb shell` devolve `0`
> independentemente do resultado no aparelho. Além disso, `rm -f` **retorna `0` mesmo quando o
> arquivo não existe**, por definição. Portanto o teste de `$LASTEXITCODE` é **barreira
> auxiliar, não prova**. A prova de que `E5` cumpriu seu objetivo é **estrutural** e está em
> `5.3`: `find -type f` **vazio** e os oito diretórios da baseline **presentes**. O desenho não
> depende de uma propriedade do transporte que não foi medida neste par `adb`/aparelho.

**Cinco decisões de desenho que definem a segurança deste passo:**

| decisão | consequência |
|---|---|
| `rm -f -- <caminho-literal-único>` | **nenhum *wildcard***; um `rm` não pode alcançar mais de um arquivo |
| `--` como fim de opções | um caminho não pode ser reinterpretado como *flag* |
| dupla/tripla revalidação em tempo de laço | a lista não pode ser adulterada entre `E4` e `E5` |
| `rmdir` (não `rm -rf`) para diretórios | falha por construção em diretório não vazio ⇒ nada é removido em cascata |
| **os 8 `$DIRS_BASELINE` NÃO são removidos** | preserva rótulo SELinux e modo atribuídos pelo Android; reduz a superfície de reconstrução do `tar` a **arquivos** |

> **Por que preservar os 8 diretórios é estritamente melhor.** `compare_state.py` percorre com
> `os.walk` e coleta **arquivos**: diretórios vazios são invisíveis ao gate. Removê-los não
> traria ganho probatório e obrigaria o `tar` a recriá-los com modo/rótulo possivelmente
> diferentes. Mantê-los preserva metadados originais. Diretórios **inesperados** (fora dos 8)
> continuam sendo removidos — é o que elimina resíduo estrutural.

> **`cache/`, `code_cache/`, `no_backup/` NUNCA são enumerados nem tocados.** Não constam de
> `$RAIZES`, não passam em `Test-CaminhoSeguro`, não existe TAR deles e removê-los seria
> destruição sem *rollback*. **Limitação de escopo declarada:** o reset produz equivalência
> **dentro do escopo canônico**, não do diretório de dados inteiro.

---

### `E6` — Extrair a baseline por `stdin`, sob `run-as` ⚠️ **MUTANTE**

| campo | valor |
|---|---|
| **OBJETIVO** | Reconstruir os 14 arquivos da baseline a partir do TAR imutável. |
| **PRÉ-CONDIÇÃO** | `E5` `PASS` (três subárvores sem arquivos). |
| **TIPO** | ⚠️ **MUTANTE** |
| **SAÍDA ESPERADA** | `EXIT = 0`; 14 arquivos presentes. |
| **PASS** | `EXIT = 0` e `E7` conforme. |
| **STOP** | Erro de extração ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* (§5). |
| **EVIDÊNCIA** | `$EXEC\reset\06_EXTRACAO.txt` |

```powershell
cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell run-as com.valentedev.pequenostracosdefe tar -x -C /data/user/0/com.valentedev.pequenostracosdefe < C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\TAR-ENTRY-BASELINE-01.tar > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\06_EXTRACAO.txt 2>&1"
```

**Três propriedades exigidas, conforme `R5` histórico (`11_PREP_LEGADO_02` §11):**

1. **Por `stdin`** — *"Nenhum TAR dentro do aparelho"* (item `13`). O TAR nunca é gravado no
   armazenamento do dispositivo.
2. **Sob `run-as`** — a extração roda com o **`uid` do app** (`10364`), que é o dono correto.
3. **Sem `-p`** — não se tenta restaurar dono/grupo; eles vêm corretos do próprio `uid` de
   execução.

`-C /data/user/0/com.valentedev.pequenostracosdefe` é explícito por robustez: `run-as` já
posiciona o `cwd` no diretório do *package*, mas o desenho não depende dessa suposição.

---

### `E7` — Verificar estrutura e caminhos

| campo | valor |
|---|---|
| **OBJETIVO** | Provar que as 22 entradas existem, com os caminhos exatos da baseline — e nada além. |
| **PRÉ-CONDIÇÃO** | `E6` `EXIT = 0`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | 14 arquivos = `$ARQS_BASELINE`; diretórios ⊇ `$DIRS_BASELINE`; nenhum caminho extra. |
| **PASS** | Conjuntos idênticos. |
| **STOP** | Arquivo faltante, arquivo extra ou diretório inesperado ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* (§5). |
| **EVIDÊNCIA** | `$EXEC\reset\07_ESTRUTURA_POS.txt` |

```powershell
& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f |
    Tee-Object -FilePath "$EXEC\reset\07_ESTRUTURA_POS.txt"

$posArq = @(Get-Content "$EXEC\reset\07_ESTRUTURA_POS.txt" |
            ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
@(Compare-Object $ARQS_BASELINE $posArq).Count     # DEVE ser 0
```

---

### `E7A` — `SELINUX_POST` — comparar contra `SELINUX_PRE`

| campo | valor |
|---|---|
| **OBJETIVO** | Provar que a extração não degradou o contexto de segurança. |
| **PRÉ-CONDIÇÃO** | `E7` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | Contexto **funcionalmente equivalente** ao de `E4A`, dentro da mesma instalação, mesmo `uid`, mesmo *package*, mesma janela. |
| **PASS** | Equivalência funcional para todas as entradas. |
| **STOP** | Divergência material ⇒ `R2P1_STOP_ENTRY_RESET_FAILED`. **NÃO** corrigir com `restorecon`, `chcon`, *root* ou qualquer mecanismo não autorizado. |
| **EVIDÊNCIA** | `$EXEC\reset\07A_SELINUX_POST.txt` · `…\07A_SELINUX_DIFF.txt` |

```powershell
# ---- captura POS: MESMO comando, MESMO formato de registro que E4A
$ALVOS_POS = @($RAIZES) + @($DIRS_BASELINE | Where-Object { $RAIZES -notcontains $_ }) +
             @($ARQS_BASELINE)
foreach ($rel in $ALVOS_POS) {
    $ctx = (& $ADB -s $SERIAL shell run-as $PKG ls -Zd -- $rel) -join ' '
    "$rel=$($ctx.Trim())" |
        Out-File "$EXEC\reset\07A_SELINUX_POST.txt" -Append -Encoding utf8
}

# ---- comparacao pela INTERSECAO de caminhos (residuos removidos em E5 nao tem par)
function Import-Indexado {
    param([string]$Arquivo)
    $h = @{}
    Get-Content $Arquivo | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' } |
        ForEach-Object { $i = $_.IndexOf('='); $h[$_.Substring(0, $i)] = $_.Substring($i + 1) }
    return $h
}
$sePre  = Import-Indexado "$EXEC\reset\04A_SELINUX_PRE.txt"
$sePos  = Import-Indexado "$EXEC\reset\07A_SELINUX_POST.txt"

$seDiff = @()
foreach ($k in ($sePos.Keys | Sort-Object)) {
    if (-not $sePre.ContainsKey($k)) { $seDiff += "SEM_PAR_PRE|$k|$($sePos[$k])"; continue }
    if ($sePre[$k] -ne $sePos[$k])   { $seDiff += "DIVERGE|$k|PRE=$($sePre[$k])|POS=$($sePos[$k])" }
}
$seDiff | Out-File "$EXEC\reset\07A_SELINUX_DIFF.txt" -Encoding utf8
@($seDiff).Count      # esperado: 0
```

> **Por que a comparação é por interseção, e não `Compare-Object` das duas listas inteiras.**
> `SELINUX_PRE` foi capturado **antes** de `E5` e inclui os resíduos que `E5` removeu; `POST`
> contém apenas as 22 entradas da baseline. Comparar as listas cruas produziria divergência
> **por construção** — um falso positivo que treinaria o executor a ignorar o resultado. A
> comparação correta é: **toda entrada de `POST` precisa ter par em `PRE` e contexto idêntico**.
> `SEM_PAR_PRE` é condição de `STOP` legítima: significa que uma entrada da baseline **não
> existia** antes da remoção e portanto não tem referência de contexto medida — exatamente o
> caso em que não se pode afirmar equivalência.

---

### `E7B` — `MODE_POST` — modo, *ownership* e grupo

| campo | valor |
|---|---|
| **OBJETIVO** | Fechar o ponto cego do comparador: conteúdo correto com metadado errado passaria no item `14` e quebraria o app. |
| **PRÉ-CONDIÇÃO** | `E7A` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | `uid`/`gid` = `10364` em tudo; modos conforme §2.2 (arquivos `0600`/`0660`; os três topos `0771`; intermediários `0700`). |
| **PASS** | *Ownership* e grupo exatos **e** modos funcionalmente suficientes para o app ler/escrever. |
| **STOP** | Conteúdo correto **mas** modos necessários ao acesso do app divergentes ⇒ `R2P1_STOP_ENTRY_RESET_FAILED`. **`chmod` corretivo silencioso é PROIBIDO na primeira prova** — ela existe justamente para medir o comportamento real do mecanismo. |
| **EVIDÊNCIA** | `$EXEC\reset\07B_MODE_POST.txt` · `…\07B_MODE_DIFF.txt` |

```powershell
# ---- captura POS: MESMO comando e MESMO formato de E4B
foreach ($rel in $ALVOS_POS) {
    $linha = (& $ADB -s $SERIAL shell run-as $PKG stat -c $FMT -- $rel) -join ' '
    $linha.Trim() | Out-File "$EXEC\reset\07B_MODE_POST.txt" -Append -Encoding utf8
}

# ---- projecao: SOMENTE metadado estrutural. 'bytes' e 'mtime' ficam de FORA da igualdade.
function Import-Meta {
    param([string]$Arquivo)
    $h = @{}
    Get-Content $Arquivo | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' } |
        ForEach-Object {
            $c = $_.Split(':')                       # 0=%n 1=%a 2=%u 3=%g 4=%U 5=%G 6=%s 7=%Y
            $h[$c[0]] = [pscustomobject]@{
                Modo = $c[1]; Uid = $c[2]; Gid = $c[3]; Uname = $c[4]; Gname = $c[5]
                Bytes = $c[6]; Mtime = $c[7]
                Chave = ($c[1] + ':' + $c[2] + ':' + $c[3] + ':' + $c[4] + ':' + $c[5])
            }
        }
    return $h
}
$mdPre = Import-Meta "$EXEC\reset\04B_MODE_PRE.txt"
$mdPos = Import-Meta "$EXEC\reset\07B_MODE_POST.txt"

$mdDiff = @()
foreach ($k in ($mdPos.Keys | Sort-Object)) {
    $p = $mdPos[$k]
    # (a) contra MODE_PRE, pela intersecao, somente modo/uid/gid/uname/gname
    if ($mdPre.ContainsKey($k)) {
        if ($mdPre[$k].Chave -ne $p.Chave) {
            $mdDiff += "DIVERGE_VS_PRE|$k|PRE=$($mdPre[$k].Chave)|POS=$($p.Chave)"
        }
    } else { $mdDiff += "SEM_PAR_PRE|$k|POS=$($p.Chave)" }

    # (b) contra a tabela de modos da baseline (2.2)
    if ($MODO_ESPERADO.ContainsKey($k) -and $MODO_ESPERADO[$k] -ne $p.Modo) {
        $mdDiff += "DIVERGE_VS_BASELINE|$k|ESPERADO=$($MODO_ESPERADO[$k])|POS=$($p.Modo)"
    }

    # (c) requisito funcional: dono e grupo do app, e leitura+escrita do dono
    if ($p.Uid -ne "$UID_ESP" -or $p.Gid -ne "$GID_ESP") {
        $mdDiff += "OWNERSHIP|$k|uid=$($p.Uid)|gid=$($p.Gid)"
    }
    if ([int]$p.Modo.Substring(0, 1) -band 6) { } else { $mdDiff += "ACESSO_DONO|$k|modo=$($p.Modo)" }
}
$mdDiff | Out-File "$EXEC\reset\07B_MODE_DIFF.txt" -Encoding utf8
@($mdDiff).Count      # esperado: 0
```

> **Comparação de três vias, explicitamente separadas** — `(a)` contra `MODE_PRE`, `(b)` contra
> a tabela de modos da baseline (§2.2), `(c)` contra o requisito funcional de acesso do app. As
> três produzem rótulos distintos no `DIFF` para que o auditor saiba **qual** propriedade
> falhou, e não apenas *que* algo falhou.
>
> **`%s` e `%Y` ficam fora da chave de igualdade, por desenho.** Tamanho já é medido pelo
> comparador selado no item `14` — repeti-lo aqui criaria um segundo gate de conteúdo, não
> autorizado. `mtime` é **`DIAGNOSTIC_ONLY`** (§3.2): incluí-lo na chave o transformaria em
> critério de reprovação, violando a decisão. Os dois campos continuam **capturados e
> registrados**; apenas não entram na igualdade.
>
> Como o comportamento de `tar -x` do `toybox` **nunca foi exercido** neste aparelho, **não se
> presume** que os modos sejam reproduzidos automaticamente. **Nenhum `chmod` passa a ser
> autorizado por este documento.**

---

### `E7C` — Registro de `mtime` — **exclusivamente diagnóstico**

| campo | valor |
|---|---|
| **OBJETIVO** | Registrar `mtime` para forense e para comparação entre restaurações. |
| **PRÉ-CONDIÇÃO** | `E7B` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | `mtime` de cada uma das 14 entradas; esperado o valor da baseline (§2.2), pois `tar` restaura `mtime`. |
| **PASS** | **Sempre registra; nunca reprova.** `MTIME_GATE = DIAGNOSTIC_ONLY`. |
| **STOP** | **Nenhum.** `mtime` divergente, com conteúdo, estrutura e demais condições válidas, **não** é motivo autônomo de reprovação e **não** pode, sozinho, produzir `R2P1_STOP_ENTRY_BASELINE_DIVERGED`. |
| **EVIDÊNCIA** | `$EXEC\reset\07C_MTIME.txt` |

```powershell
# O campo %Y ja foi capturado em E4B/E7B. Aqui ele e apenas PROJETADO e datado,
# lado a lado, para leitura humana. Nenhuma condicao de PASS/STOP e avaliada.
foreach ($k in ($mdPos.Keys | Sort-Object)) {
    $eAnt = if ($mdPre.ContainsKey($k)) { $mdPre[$k].Mtime } else { '-' }
    $eDep = $mdPos[$k].Mtime
    $utc  = [DateTimeOffset]::FromUnixTimeSeconds([int64]$eDep).UtcDateTime.ToString('yyyy-MM-dd HH:mm:ss')
    "$k|PRE=$eAnt|POS=$eDep|POS_UTC=$utc" |
        Out-File "$EXEC\reset\07C_MTIME.txt" -Append -Encoding utf8
}
```

Sinal diagnóstico de alto valor: um `mtime` "de agora" em qualquer das 14 entradas indica um
arquivo que **não** veio do TAR. Isso **motiva investigação**, não reprovação automática.

> **O passo não contém nenhum `throw`, nenhum `if` de reprovação e nenhuma comparação com
> valor esperado — deliberadamente.** É assim que `MTIME_GATE = DIAGNOSTIC_ONLY` deixa de ser
> uma promessa textual e passa a ser uma propriedade verificável do procedimento: não existe,
> em lugar algum do desenho, caminho de código pelo qual `mtime` produza `STOP`.

---

### Item `13` — Capturar o TAR de entrada canônico

| campo | valor |
|---|---|
| **OBJETIVO** | Item canônico do protocolo, **inalterado**. Fotografar o estado restaurado. |
| **PRÉ-CONDIÇÃO** | `E7C` concluído · `pidof` **vazio** (reconfirmado). |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | TAR novo no `HOST`; `bytes`, `SHA256` e listagem registrados. **Nenhum TAR dentro do aparelho.** |
| **PASS** | `EXIT = 0`; TAR íntegro; 22 entradas. |
| **STOP** | Falha de captura dentro da janela de reset ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` (§6: **recaptura proibida**). |
| **EVIDÊNCIA** | `$EXEC\acervo\TAR-ENTRY-POS-RESET.tar` · `…\13_TAR_META.txt` · `…\13_TAR_LISTAGEM.txt` |

```powershell
& $ADB -s $SERIAL shell pidof com.valentedev.pequenostracosdefe    # DEVE ser vazio

cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ exec-out run-as com.valentedev.pequenostracosdefe tar -c databases files shared_prefs > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\acervo\TAR-ENTRY-POS-RESET.tar"

$T = "$EXEC\acervo\TAR-ENTRY-POS-RESET.tar"
(Get-Item     $T).Length
(Get-FileHash $T -Algorithm SHA256).Hash
tar -tvf $T | Tee-Object -FilePath "$EXEC\acervo\13_TAR_LISTAGEM.txt"
```

> **Indicador corroborante, não gate:** se este TAR sair **byte-idêntico** a `$BASE_SHA`, é
> sinal fortíssimo. Mas o veredito é do item `14`, e apenas dele — foi assim que
> `R2P1_RETRY_02` registrou o mesmo fenômeno (*"Indicador forte — mas o veredito é do item 14"*).

---

### Item `14` — Gate de entrada com o instrumento selado

| campo | valor |
|---|---|
| **OBJETIVO** | Provar igualdade **real** contra `R2P1_RETRY_ENTRY_BASELINE_01`. |
| **PRÉ-CONDIÇÃO** | Item `13` `PASS`; `compare_state.py` = `$CMP_SHA`. |
| **TIPO** | `READ-ONLY` (host) |
| **SAÍDA ESPERADA** | `ESCOPO_OK = SIM` e os **sete** contadores em **ZERO**. |
| **PASS** | `ESCOPO_OK=SIM` · `FILES_ADDED=0` · `FILES_CHANGED=0` · `FILES_DELETED=0` · `KEYS_ADDED=0` · `KEYS_CHANGED=0` · `KEYS_DELETED=0` · `KEYS_ROWID_MOVED=0` ⇒ `ENTRY_STATE_RESULT=PASS`. |
| **STOP** | Restauração já declarada completa e TAR íntegro ⇒ `R2P1_STOP_ENTRY_BASELINE_DIVERGED`. Dúvida sobre integridade da restauração ou `ESCOPO_OK=NAO` ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` (§3.3). |
| **EVIDÊNCIA** | `$EXEC\acervo\14_POS-RESET-vs-BASELINE.txt` |

```powershell
New-Item -ItemType Directory -Force "$EXEC\acervo\POS-RESET-EXTRACTED" | Out-Null
tar -xf "$EXEC\acervo\TAR-ENTRY-POS-RESET.tar" -C "$EXEC\acervo\POS-RESET-EXTRACTED"

python $CMP $BASE_REF "$EXEC\acervo\POS-RESET-EXTRACTED" "$EXEC\acervo\14_POS-RESET-vs-BASELINE.txt"
Get-Content "$EXEC\acervo\14_POS-RESET-vs-BASELINE.txt"
```

**Tolerância aplicável: exclusivamente `databases/RKStorage-journal`**, e apenas como já
definida **dentro** do instrumento (`compare_state.py:7`, `TOLERADOS`). **Nenhuma tolerância
nova. Nenhuma *allowlist*. `AC_5` continua inexistente.**

---

### `E8` — Invariantes de produto **DEPOIS** da restauração

| campo | valor |
|---|---|
| **OBJETIVO** | Reafirmar o papel do artefato `30`. O reset **não pode** enfraquecê-lo. |
| **PRÉ-CONDIÇÃO** | Item `14` `PASS`. |
| **TIPO** | `READ-ONLY` (host) |
| **SAÍDA ESPERADA** | `8/8` arquivos de produto idênticos; `KEYS_ADDED = KEYS_CHANGED = KEYS_DELETED = KEYS_ROWID_MOVED = 0`. `FILES_CHANGED` deve listar **apenas** os cinco de infraestrutura. |
| **PASS** | `8/8` e `4/4` zeros. |
| **STOP** | Qualquer diferença de **produto** ⇒ **STOP imediato**. |
| **EVIDÊNCIA** | `$EXEC\acervo\E8_POS-RESET-vs-ARTEFATO30.txt` |

```powershell
python $CMP $A30_REF "$EXEC\acervo\POS-RESET-EXTRACTED" "$EXEC\acervo\E8_POS-RESET-vs-ARTEFATO30.txt"
Get-Content "$EXEC\acervo\E8_POS-RESET-vs-ARTEFATO30.txt"
```

**Resultado previsto e sua justificativa.** Espera-se `ESCOPO_OK=SIM`, `FILES_ADDED=0`,
`FILES_CHANGED=5` (os cinco de infra), `FILES_DELETED=0`, quatro `KEYS_*` em zero,
`ENTRY_STATE_RESULT=STOP` — **exatamente** o conteúdo já medido em `ENTRY-vs-ARTEFATO30.txt`.
Esse `STOP` é o mesmo do corpus, **não** é convertido, **não** é contornado e **não** é
reinterpretado: ele apenas confirma que as cinco divergências são as cinco conhecidas.

> **Prova de que o reset não enfraquece o artefato `30`:** `RKStorage` **não** consta de
> `FILES_CHANGED`. Restaurar o `RKStorage` da baseline é, portanto, **byte-idêntico** a
> restaurar o do artefato `30` (`950D93D1…FFA1` dos dois lados). O mesmo vale para os três
> *blobs*, `storage-info.pb` e os três `shared_prefs` de produto. **Não há diferença de produto
> entre as duas referências** — logo a condição de STOP da proposta **não é acionada**.

**Somente depois de `E8` o reset pode ser considerado concluído.**

---

## 5. *Rollback* — `RB0` … `RB7` (literal)

Acionado **exclusivamente** por falha em `E5`, `E6` ou `E7*`, ou por interrupção depois do
início da mutação. **`ROLLBACK_ATTEMPTS = 1`.**

### `RB0` — Interromper e registrar

| campo | valor |
|---|---|
| **OBJETIVO** | Congelar a sequência principal e registrar a condição observada. |
| **TIPO** | `READ-ONLY` |
| **PASS/STOP** | Não se aplica; é registro. **NÃO iniciar o item `13`.** |
| **EVIDÊNCIA** | `$EXEC\reset\RB0_CONDICAO_OBSERVADA.txt` |

### `RB1` — Provar que o *rollback* pertence a **esta** execução

| campo | valor |
|---|---|
| **OBJETIVO** | Eliminar qualquer dúvida sobre a identidade do artefato de recuperação. |
| **PRÉ-CONDIÇÃO** | `E3` concluído; `03_ROLLBACK_META.txt` e `03_ROLLBACK_LISTAGEM.txt` existem. |
| **TIPO** | `READ-ONLY` |
| **PASS** | O TAR está **dentro de `$EXEC`** (raiz exclusiva desta execução, criada em `E0` com `Test-Path = False`) **e** seu `SHA256` recalculado agora bate com o registrado em `E3`. |
| **STOP** | Qualquer divergência ⇒ *rollback* **inválido** ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` com `DEVICE_STATE = INDETERMINATE`. |
| **EVIDÊNCIA** | `$EXEC\reset\RB1_ROLLBACK_IDENTIDADE.txt` |

```powershell
$RB = "$EXEC\reset\TAR-ROLLBACK-PRE-RESET.tar"
Test-Path $RB                                        # DEVE ser True
(Get-Item     $RB).Length                            # DEVE bater com E3
(Get-FileHash $RB -Algorithm SHA256).Hash            # DEVE bater com E3
tar -tf $RB | Measure-Object -Line                   # integridade: o TAR abre e lista
```

> A pertinência é **estrutural**, não declarada: `$EXEC` é raiz nova, exclusiva desta execução
> (`E0` exige `Test-Path $EXEC = False`), logo nenhum *rollback* de outra tentativa pode residir
> nela.

### `RB2` — Enumerar o estado parcial

```powershell
& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f |
    Tee-Object -FilePath "$EXEC\reset\RB2_ENUM_PARCIAL.txt"
& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type d |
    Tee-Object -FilePath "$EXEC\reset\RB2_ENUM_PARCIAL_DIRS.txt"
```

| campo | valor |
|---|---|
| **TIPO** | `READ-ONLY` |
| **PASS** | Toda linha passa em `Test-CaminhoSeguro`. |
| **STOP** | Qualquer linha inválida ⇒ **não remover nada** ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` com `DEVICE_STATE = INDETERMINATE`. |

### `RB3` — Remover o conteúdo parcial ⚠️ **MUTANTE**

Mesma mecânica, mesmas barreiras e mesmas proibições de `E5` — lista explícita, `rm -f --` por
caminho único, `rmdir` para diretórios inesperados, três raízes preservadas, `cache/`,
`code_cache/` e `no_backup/` intocados.

```powershell
$rbArq = Get-Content "$EXEC\reset\RB2_ENUM_PARCIAL.txt" |
         ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
foreach ($rel in $rbArq) {
    if (-not (Test-CaminhoSeguro $rel)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $out = (& $ADB -s $SERIAL shell run-as $PKG rm -f -- $rel) -join ' '
    "RB3|$rel|EXIT=$LASTEXITCODE|OUT=$($out.Trim())" |
        Out-File "$EXEC\reset\RB3_REMOCAO_LOG.txt" -Append -Encoding utf8
    if ($LASTEXITCODE -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}
```

> **`RB3` remove somente arquivos.** Os diretórios **não** são tocados no *rollback*: os oito da
> baseline nunca foram removidos (`E5` os preserva) e qualquer diretório inesperado já havia
> sido removido antes da falha. Introduzir `rmdir` aqui só ampliaria a superfície destrutiva
> numa situação em que o estado já é incerto — que é exatamente o oposto do que um *rollback*
> deve fazer.

### `RB4` — Restaurar o *rollback* por `stdin` ⚠️ **MUTANTE** — **tentativa única**

```powershell
cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell run-as com.valentedev.pequenostracosdefe tar -x -C /data/user/0/com.valentedev.pequenostracosdefe < C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\TAR-ROLLBACK-PRE-RESET.tar > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\RB4_EXTRACAO.txt 2>&1"
```

| campo | valor |
|---|---|
| **PASS** | `EXIT = 0`. |
| **STOP** | Falha ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` com `DEVICE_STATE = INDETERMINATE`. **NÃO** executar segunda restauração. **NÃO** abrir o app. **NÃO** usar `pm clear`. **NÃO** instalar. **NÃO** apagar mais nada. |

### `RB5` — Verificar estruturalmente o estado recuperado

```powershell
& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f |
    Tee-Object -FilePath "$EXEC\reset\RB5_ESTRUTURA_RECUPERADA.txt"
Compare-Object (Get-Content "$EXEC\reset\04_ENUM_ARQUIVOS.txt") `
               (Get-Content "$EXEC\reset\RB5_ESTRUTURA_RECUPERADA.txt") |
    Out-File "$EXEC\reset\RB5_DIFF.txt" -Encoding utf8      # esperado: vazio
```

### `RB6` — **Não continuar** o *retry*

Nenhuma continuação funcional ocorre depois de um *rollback*: **não** iniciar o item `13`,
**não** subir Metro, **não** iniciar `PS3`, **não** emitir *deep link*, **não** abrir o app,
**não** reexecutar `E5`/`E6`.

### `RB7` — Finalizar

**`R2P1_STOP_ENTRY_RESET_FAILED`** — **mesmo que o *rollback* tenha devolvido o estado
anterior**. *Rollback* bem-sucedido **NÃO** transforma a execução em `PASS`. Campo obrigatório
no relatório: `ROLLBACK_EXECUTED = SIM` e `ROLLBACK_RESULT = RECUPERADO | INDETERMINATE`.

---

## 6. ⛔ PROIBIÇÃO DE RECAPTURA DURANTE RESET

> **Esta seção prevalece, dentro da janela de reset, sobre a regra histórica de recaptura criada
> para capturas não destrutivas.**

**Depois do início de `E5`**, nenhuma das condições abaixo é tratada automaticamente como mero
erro de captura:

`ESCOPO_OK = NAO` · arquivo ausente · arquivo adicional · estrutura inesperada · captura
inconsistente · erro de `TAR`.

**Nenhuma recaptura é permitida até que a condição seja classificada.**

Se houver **qualquer possibilidade de estado parcial**: **`R2P1_STOP_ENTRY_RESET_FAILED`**.

**Motivo.** Fora de janela destrutiva, `ESCOPO_OK=NAO` podia significar "o comando de captura
saiu diferente" — hipótese benigna, porque o aparelho não fora mutado. Dentro da janela de
reset, a mesma observação é **indistinguível** de extração parcial. Recapturar seria trocar uma
hipótese perigosa por uma hipótese conveniente sem nenhuma evidência nova. A regra existe para
tornar essa troca impossível.

---

## 7. Atomicidade

| campo | valor |
|---|---|
| **`RESTORE_ATOMIC`** | **NÃO** |
| **`PARTIAL_FAILURE_DETECTABLE`** | **SIM** — condicionado ao desenho validado |

A restauração é uma sequência de operações de arquivo sobre um sistema de arquivos comum, **sem
transação**. Afirmar o contrário seria falso, e o procedimento **não finge transação
inexistente**.

**Mas toda falha parcial concebível produz sinal não-zero no instrumento já selado:**

| falha parcial | sinal |
|---|---|
| resíduo sobreviveu | `FILES_ADDED > 0` |
| arquivo não extraído | `FILES_DELETED > 0` |
| arquivo truncado ou corrompido | `FILES_CHANGED > 0` |
| subárvore inteira ausente | `ESCOPO_OK=NAO` ⇒ `STOP_ESCOPO_DIVERGENTE` |
| SQLite corrompido | `KEYS_*` ≠ 0, ou exceção do `sqlite3` — o comparador abre `RKStorage` em `mode=ro` (`compare_state.py:38`) e **falha ruidosamente** |
| metadado errado com conteúdo certo | **único ponto cego do gate** ⇒ fechado por `E7A`/`E7B` |

**A segurança deriva de oito mecanismos, não de atomicidade:** *rollback* prévio (`E3`) · lista
explícita (`E4`+`E5`) · verificação estrutural (`E7`) · TAR pós (item `13`) · comparador selado
(item `14`) · invariantes **pré** (`E3A`) **e pós** (`E8`) · SELinux **pré** (`E4A`) **e pós**
(`E7A`) · modo e *ownership* **pré** (`E4B`) **e pós** (`E7B`) · **STOP duro**.

**Regra terminal:** qualquer restauração **parcialmente concluída** resulta em `STOP` e **jamais
em continuação automática**. Não há recuperação silenciosa, não há repetição automática, não há
segunda extração "para ver se passa".

---

## 8. Prova de idempotência — `I0` … `I10`

**O procedimento não é aprovado se funcionar apenas uma vez.** A prova ocorre **sem** Metro,
**sem** `PS3`, **sem** `reverse`, **sem** *deep link*, **sem** abertura do app, **sem** *cold
start* e **sem** `CASO 7`. Ela **não consome** montagem fria e **não gasta** janela de gravação.

| passo | ato | comando / referência | exigência |
|---|---|---|---|
| `I0` | *Rollback* prévio | `E3` integral | TAR capturado, `bytes` + `SHA256` + listagem |
| `I1` | **Restauração 1** | `E3A` → `E4` → `E4A` → `E4B` → `E4C` → `E5` → `E6` → `E7` → `E7A` → `E7B` → `E7C` | estrutura, SELinux e modos conformes |
| `I2` | Capturar `TAR-RESTORE-01.tar` | abaixo | `bytes` + `SHA256` + listagem |
| `I3` | `RESTORE_01` **vs** baseline | abaixo | `ESCOPO_OK=SIM` + **7 zeros** |
| `I4` | **Restauração 2**, idêntica | `E4` → `E4A` → `E4B` → `E5` → `E6` → `E7` → `E7A` → `E7B` → `E7C` | estrutura, SELinux e modos conformes |
| `I5` | Capturar `TAR-RESTORE-02.tar` | abaixo | `bytes` + `SHA256` + listagem |
| `I6` | `RESTORE_02` **vs** baseline | abaixo | `ESCOPO_OK=SIM` + **7 zeros** |
| `I7` | `RESTORE_02` **vs** `RESTORE_01` | abaixo | `ESCOPO_OK=SIM` + **7 zeros** |
| `I8` | Invariantes: `RESTORE_01` e `RESTORE_02`, cada um contra o artefato `30` | abaixo | `8/8` idênticas · `4/4` zeros, **nos dois** |
| `I9` | SELinux `01` e `02` contra referência; modo/*ownership*/grupo `01` e `02` | `E7A`/`E7B` de cada rodada | equivalência funcional nas duas |
| `I10` | Lacre | abaixo | `bytes` + `SHA256` de todos os artefatos |

```powershell
# ---- I2 / I5 : capturas (trocar 01 por 02 na segunda rodada)
cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ exec-out run-as com.valentedev.pequenostracosdefe tar -c databases files shared_prefs > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\acervo\TAR-RESTORE-01.tar"

New-Item -ItemType Directory -Force "$EXEC\acervo\RESTORE-01-EXTRACTED" | Out-Null
tar -xf "$EXEC\acervo\TAR-RESTORE-01.tar" -C "$EXEC\acervo\RESTORE-01-EXTRACTED"

# ---- I3 : RESTORE_01 vs baseline
python $CMP $BASE_REF "$EXEC\acervo\RESTORE-01-EXTRACTED" "$EXEC\acervo\I3_RESTORE01-vs-BASELINE.txt"

# ---- I6 : RESTORE_02 vs baseline
python $CMP $BASE_REF "$EXEC\acervo\RESTORE-02-EXTRACTED" "$EXEC\acervo\I6_RESTORE02-vs-BASELINE.txt"

# ---- I7 : RESTORE_02 vs RESTORE_01   <-- o teste de idempotencia propriamente dito
python $CMP "$EXEC\acervo\RESTORE-01-EXTRACTED" "$EXEC\acervo\RESTORE-02-EXTRACTED" "$EXEC\acervo\I7_RESTORE02-vs-RESTORE01.txt"

# ---- I8 : invariantes de produto dos dois lados
python $CMP $A30_REF "$EXEC\acervo\RESTORE-01-EXTRACTED" "$EXEC\acervo\I8_RESTORE01-vs-ARTEFATO30.txt"
python $CMP $A30_REF "$EXEC\acervo\RESTORE-02-EXTRACTED" "$EXEC\acervo\I8_RESTORE02-vs-ARTEFATO30.txt"

# ---- I10 : lacre
Get-ChildItem $EXEC -Recurse -File |
    ForEach-Object { '{0}|{1}|{2}' -f $_.FullName, $_.Length,
                     (Get-FileHash $_.FullName -Algorithm SHA256).Hash } |
    Out-File "$EXEC\I10_LACRE.txt" -Encoding utf8
```

**Campos de relatório do artefato** (não são *gates* globais e não são cunhados como tal):

| campo | condição |
|---|---|
| `CONTENT_IDEMPOTENCE` | `PASS` se `I3`, `I6` e `I7` fecharem, todos, com `ESCOPO_OK=SIM` e sete zeros |
| `STRUCTURAL_METADATA_CHECK` | `PASS` se `I9` fechar com SELinux e modo/*ownership*/grupo equivalentes nas duas rodadas |

**Falha em `I3`, `I6` ou `I7` ⇒ `R2P1_STOP_ENTRY_RESET_FAILED`**, sem segunda tentativa
automática, com *rollback* por `I0`.

**Três propriedades do desenho, registradas:**

1. **`I7` é o teste de idempotência propriamente dito** — que as duas restaurações concordem
   *entre si* é proposição independente de concordarem com a baseline.
2. **`I3` é literalmente o item `14`** — a prova de idempotência **contém** o gate de entrada,
   executado duas vezes.
3. **`mtime` permanece diagnóstico** em toda a prova (`MTIME_GATE = DIAGNOSTIC_ONLY`).

**Fundamento de por que a idempotência é demonstrável:** a operação é determinística por
construção — pré-limpeza por lista explícita ⇒ conjunto inicial vazio e conhecido; extração de
um TAR **imutável** ⇒ conjunto final função apenas do TAR. Não há entrada variável, relógio,
rede ou estado herdado. **`IDEMPOTENCE_PROVABLE = SIM`.**

---

## 9. Posição exata da restauração no protocolo

**`RESTORE_POSITION = APÓS o item 12 (BINÁRIO ATUAL) e ANTES do item 13 (TAR DE ENTRADA
PROSPECTIVO)`** — bloco integral `E0`…`E8`.

| ponto alternativo | por que é inaceitável |
|---|---|
| **antes do item `12`** | Viável, **estritamente pior**: opera destrutivamente sob `run-as` **antes** de provar a identidade do alvo, e perde o `dumpsys` do estado pré-reset. |
| **entre `13` e `14`** | O item `13` já teria fotografado o estado **pré**-reset; seria preciso um segundo TAR, criando **dois** artefatos disputando o nome de "TAR de entrada". |
| **depois do `14`** | O gate teria medido o estado errado. Se deu `STOP`, prosseguir é proibido; se deu `PASS`, o reset é mutação gratuita. |
| **depois do `15`/`16`** | Metro/`reverse` de pé: o `DevLauncherApp-…js` restaurado descreveria um *bundle* que não é o do Metro no ar; e infraestrutura de pé é porta aberta para lançamento acidental. |
| **depois do `17`** | Os comandos do reset (`run-as`, `rm`, `tar -x`, 17,2 MB por `adb`) cairiam **dentro da janela causal**, contaminando irreversivelmente o `raw.log`. |
| **depois do `18`** | App aberto: *writer* vivo sobre SQLite e *shared prefs*. Catastrófico. |

**As sete pré-condições são satisfeitas exatamente e apenas nesse ponto:** app parado · Metro
inexistente · `reverse` inexistente · `PS3` não iniciado · `logcat` não limpo · gate ainda não
medido · nenhuma abertura nova.

---

## 10. Repetibilidade entre *retries*

**`RETRY_RESET_REPEATABLE = SIM`.**

| ciclo | com o reset |
|---|---|
| `RETRY_03` | encerramento `S1..S5` → reset `E0..E8` → itens `13`/`14` (**7 zeros**) → montagem fria `15..19` |
| `RETRY_04` | idem, **mesma baseline** |
| `RETRY_05..N` | idem, **mesma baseline** |

A regra passa a ser: **estado pós-tentativa · fechamento · reset determinístico · gate de
igualdade · nova montagem fria.** E deixa de ser: *nova tentativa · nova baseline · nova exceção
· novo valor congelado*. **`BASELINE_02`/`03`/`04` nunca precisam existir.**

Três invariantes sustentam a repetibilidade: a baseline nunca é reescrita · o instrumento nunca
é editado · a tolerância continua sendo **uma só**.

---

## 11. Relação com o *cold start*

Provas exigidas **depois** da restauração, todas pela via canônica já usada:

| # | a provar | como |
|---|---|---|
| 1 | app parado | `pidof` **vazio** — pré-condição literal do item `13` |
| 2 | nenhum processo do *package* | `pidof` vazio + ausência de `Start proc …pequenostracosdefe` no `raw.log` da janela |
| 3 | Metro ausente | nenhum `node.exe`; portas `8081`/`8082`/`8083` sem *listener* (item `11`) |
| 4 | `PS3` ausente | nenhuma captura de `logcat` viva |
| 5 | `reverse` ausente | `adb reverse --list` **vazio** |
| 6 | o *deep link* é o primeiro lançamento | o item `17` limpa o `logcat` **uma única vez** e o `PS3` começa antes do item `18`: o **primeiro** `Start proc` do `raw.log` é o do *deep link* |
| 7 | PID novo | o PID anterior foi destruído no `S2`; o novo `Start proc` traz PID diferente por construção |
| 8 | *task* nova ou compatível | a *task* anterior morreu com o processo; o *deep link* cria *task* nova |
| 9 | o `CASO 7` é o **primeiro** ciclo daquela instância | exatamente **um** `Running "main"`, **uma** montagem de `MainTabs`, **um** `PTF_PERF_SAMPLE first_layout` |

**Duas medições desta campanha sustentam a segurança causal do reset:**

1. entre `18:04` (baseline) e `18:45` (entrada de `RETRY_02`): **41 minutos** com o app parado,
   sete contadores em **zero** — o estado ocioso **não deriva**;
2. entre o `force-stop` de `18:47:57` e o *deep link* de `18:52:36`: **4 min 39 s** parado,
   **zero** `Start proc` do *package* — o `force-stop` **segura**; nenhum *broadcast*
   ressuscitou o app.

**Efeito do escopo não resetado.** `cache/`, `code_cache/` e `no_backup/` acumulam entre
tentativas e nunca são resetados. Isso altera **tempo** de partida, não a **causalidade** (PID
novo, *task* nova, primeiro ciclo da instância). O *bundle* do produto vem do Metro pela rede a
cada tentativa.

---

## 12. Matriz de *writers* dos cinco arquivos de infraestrutura

| EVENTO | PODE ESCREVER | ARQUIVOS AFETADOS | COMPROVAÇÃO | IMPACTO NA PRÓXIMA RESTAURAÇÃO |
|---|---|---|---|---|
| **Abertura do app** (*deep link*) | **SIM** | os cinco de infra | **MEDIDO** — *mtimes* no TAR: `IDS.xml` `17:23:01`, `profileInstalled` `17:23:06`, `DevBundle.js` e `recentyopenedapps` `17:23:41`, `WebViewChromiumPrefs` `17:23:43`. Janela de **42 s** = a abertura | É a causa que consome qualquer baseline pré-abertura. **É a razão de o reset existir** |
| **`ActivityThread`** (criação do processo) | **SIM** | `android.app.ActivityThread.IDS.xml` | **MEDIDO** — *mtime* `17:23:01`, o primeiro dos cinco; artefato `31` §3: `109 → 108 B` | Reescrito em toda partida. Restaurável exato |
| **ProfileInstaller** (AndroidX) | **SIM** | `files/profileInstalled` | **MEDIDO** — `18:52:42.906 31092 31182 D ProfileInstaller: Installing profile for com.valentedev.pequenostracosdefe`; *mtime* `17:23:06`; `24 → 24 B`, conteúdo distinto | Reescrito em toda partida. Restaurável exato |
| **Dev Launcher** | **SIM** | `recentyopenedapps.xml`, `DevLauncherApp-…js` | **MEDIDO** — `684 → 684 B` conteúdo distinto; *mtime* `17:23:41` | Registra URL/hora do último app aberto ⇒ **nunca** estável entre tentativas |
| **Bundle do Metro** (via Dev Launcher) | **SIM**, indireto | `DevLauncherApp-…DevBundle.js` | **MEDIDO** — `16772179 → 16863539 B` (+91 360); *mtime* `17:23:41` | Muda com o *bundle*; 16,8 MB é o item pesado da restauração |
| **WebView Chromium** | **SIM** | `WebViewChromiumPrefs.xml` | **MEDIDO** — `18:54:09.690 31092 31201 I WebViewFactory: Loading com.google.android.webview 150.0.7871.181`; *mtime* `17:23:43`; `377 → 127 B` | Escrito na 1ª inicialização do WebView **de cada processo** — e o `CASO 7` exige o canvas |
| **Processo isolado do WebView** | **NÃO** (no *sandbox* do app) | nenhum | **MEDIDO** — `Start proc 455 … sandboxed_process0/u0i37`: **uid distinto**, sem acesso a `/data/user/0/<pkg>` | Nenhum |
| **Play Services / Phenotype** | **SIM**, historicamente | `files/phenotype_storage_info/shared/storage-info.pb` | **MEDIDO** — *mtime* `08-12 13:43:15`, estável desde então; `raw.log`: `Phenotype.API is not available on this device (DEVELOPER_ERROR)` | Candidato latente a **sexta** divergência. Hoje inerte — ver §14 |
| **`am force-stop`** | **INFERÊNCIA** | possível `shared_prefs/*.xml.bak` | **NÃO MEDIDO.** Comportamento documentado do `SharedPreferencesImpl`. Contra-indício **fraco**: `grep '\.xml\.bak'` no `raw.log` = **0** (escrita em arquivo não é logada) | É precisamente o resíduo que `E4`/`E5` medem e removem |
| **Segundo plano → primeiro plano** | **NÃO OBSERVADO** | nenhum | Nenhuma linha de *writer* entre `18:54` e `19:46`. **Inferência fraca** — ausência de log ≠ ausência de escrita | Coberto pelo *pre-clean* de qualquer forma |
| **Abertura do canvas / Ateliê** | **SIM** (produto), se houver gravação | `files/ptf_blobs/*`, `RKStorage` | No `CASO 7` **não** houve gravação — relato do fundador + `KEYS_*` inalteradas | Fora do reset: o reset **restaura** o acervo, não o altera |
| **Aparelho ocioso, app parado** | **NÃO** | nenhum | **MEDIDO** — `18:04` vs `18:45`, 41 min, **7 contadores em zero** | É o que torna o gate pré-abertura estável e o reset possível |
| **Restauração (`tar -x` sob `run-as`)** | **SIM, por desenho** | as 22 entradas do escopo | a produzir em `E6`/`E7` | É o *writer* que o reset introduz deliberadamente — e o único que o gate espera |

**Nenhum *writer* foi inventado.** Tudo marcado como **MEDIDO** tem linha de `logcat` ou *mtime*
de TAR citável; tudo o mais está marcado como **INFERÊNCIA** ou **NÃO MEDIDO**.

**Avaliação dos cinco arquivos — `RESTORABLE_EXACTLY`:**

| arquivo | *bytes* | `SHA256` | `RESTORABLE_EXACTLY` |
|---|---|---|---|
| `files/DevLauncherApp-…DevBundle.js` | 16863539 | `CC7FB6FE…92A3` | **SIM** |
| `files/profileInstalled` | 24 | `B6F58476…BF99` | **SIM** |
| `shared_prefs/WebViewChromiumPrefs.xml` | 127 | `72CACA87…6999` | **SIM** |
| `shared_prefs/android.app.ActivityThread.IDS.xml` | 108 | `DEC264C4…9ECE` | **SIM** |
| `shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml` | 684 | `3467F6CD…C81D` | **SIM** |

Fundamento: os cinco são arquivos regulares comuns, sem *link*, sem metadado especial, do `uid`
do app, presentes íntegros no TAR e com `SHA256` conhecido. **A verificação não é por
confiança:** o item `14` mede cada um deles. Duas ressalvas declaradas: (a) `RESTORABLE_EXACTLY`
refere-se a **conteúdo** — metadados são cobertos por `E7A`/`E7B`; (b) a restauração é durável
**apenas até a abertura do app** — o que não é defeito, é a razão de o gate ser medido **antes**.

---

## 13. Matriz de riscos — `SM-X510` / `RX2XC003LTJ`

| # | RISCO | COMO DETECTAR ANTES | COMO DETECTAR DEPOIS | STOP CONDITION |
|---|---|---|---|---|
| `X1` | **Modo/dono/grupo incorretos** — o gate mede conteúdo, não metadado | `E4B` cria `MODE_PRE`; `run-as` roda com `uid 10364` = dono correto por construção | `E7B`: `stat` das entradas contra `MODE_PRE` **e** contra a tabela §2.2 | divergência de modo/dono/grupo ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` |
| `X2` | **Rótulo SELinux ausente ou errado** | `E4A` cria `SELINUX_PRE` (não existe referência histórica) | `E7A`: `ls -Z` comparado a `SELINUX_PRE` | divergência material ⇒ `R2P1_STOP_ENTRY_RESET_FAILED`; **sem `restorecon`/`chcon`** |
| `X3` | **Corrupção do SQLite** (`RKStorage`) | `E1` app parado; *journal* de 0 B não é *hot journal* | item `14`: `SHA256` **+** o comparador abre o banco em `mode=ro` e **falha ruidosamente** se corrompido | `FILE_CHANGED=databases/RKStorage` ou exceção do `sqlite3` ⇒ STOP |
| `X4` | **`-journal` residual não-vazio** | inventário `E4` | tolerado pelo instrumento (`TOLERADOS`) | **nenhuma** — é a única tolerância aprovada |
| `X5` | **Arquivo aberto por *writer* vivo** | `E1` `pidof` vazio + `E2` sem Metro/`reverse`/`PS3` | ausência de `Start proc` do *package* | qualquer PID do *package* ⇒ STOP, **sem** `force-stop` corretivo |
| `X6` | **TAR truncado / escrita parcial no transporte** | `E0` confere `$BASE_SHA` e `$BASE_LEN`; `E4C` prova o canal | `E7` (22 entradas) + item `14` | qualquer contador ≠ 0 ⇒ STOP conforme §3.3 |
| `X7` | **Extração parcial** | `E4C` (`tar -t` fiel) | `ESCOPO_OK=NAO` ⇒ `STOP_ESCOPO_DIVERGENTE`; ou `FILES_DELETED>0` | ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* §5 |
| `X8` | **Remoção parcial (resíduo sobrevive)** | `E4` produz lista explícita | `E5.3` `find` vazio; `FILES_ADDED>0` no item `14` | ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* |
| `X9` | **Remoção excessiva (fora do escopo)** | `Test-CaminhoSeguro` (§2.4): sem *wildcard*, raízes preservadas, `cache`/`code_cache`/`no_backup` fora da enumeração | `E4` da restauração seguinte; `E3` permite voltar | qualquer caminho inválido ⇒ **abortar ANTES do primeiro `rm`** |
| `X10` | **Alvo errado (outro *package*)** | item `12` confirma `appId=10364`, assinatura `3351bd8d`, `dataDir`; `$PKG` é literal fixo; `run-as` só aceita *package* depurável do próprio dono | `E7B` (`uid`/`gid`) | identidade divergente ⇒ `R2P1_STOP_BINARY_BASELINE_DIVERGED` |
| `X11` | **Espaço insuficiente** | `NÃO COMPROVADO` (exigiria comando ao aparelho). Atenuante estrutural: `E5` **remove antes** de `E6` extrair ⇒ saldo líquido ≈ 0 | erro de `tar` em `E6`; `E7`; item `14` | `ENOSPC` ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* |
| `X12` | **Falha de cabo / `ADB` interrompido no meio** | cabo validado na campanha; `adb devices -l` = 1, `transport_id` estável | `E7` + item `14` acusam estado parcial | queda entre `E5` e `E7` ⇒ STOP; recuperação **somente** por §5, nunca por nova extração cega |
| `X13` | **Corrida com Play Services / AndroidX** | app parado bloqueia *broadcasts* implícitos; **medido**: 4 min 39 s parado, zero `Start proc` | `pidof` após `E7` | qualquer PID surgido ⇒ STOP |
| `X14` | **`.xml.bak` residual do `force-stop`** | `E4` mede | `FILES_ADDED` no item `14` | resíduo ⇒ removido em `E5`; se reaparecer depois ⇒ STOP |
| `X15` | **TAR gravado dentro do aparelho** | proibição literal do item `13`; rota é `stdin`/`stdout` | inventário `E4` da próxima rodada | qualquer `.tar` no *sandbox* ⇒ STOP |
| `X16` | **Corrupção binária por redirecionamento do PowerShell** | `cmd.exe /c` **obrigatório** (§2.3, regra `O-2`) | `SHA256` do TAR capturado | *hash* divergente ⇒ STOP |
| `X17` | **`stdin` não fiel a *bytes* através de `adb shell`** | **`E4C`** — `tar -t` lista 22 entradas **sem mutar nada** | `E7` + item `14` | listagem ≠ 22 ou erro de `tar` ⇒ STOP **antes** de `E5` |
| `X18` | ***Rollback* inexistente ou inválido** | `E3` **antes** de qualquer remoção; `SHA256` + listagem registrados | `RB1` confere `SHA256` antes de usar | `E3` falhou ⇒ **não prosseguir para `E5`** |
| `X19` | **Recuperação silenciosa** — o pior de todos | — | — | **PROIBIDA.** Nenhuma repetição automática, nenhuma correção não registrada, nenhuma segunda extração "para ver se passa". Falha ⇒ STOP + relatório |

---

## 14. `storage-info.pb` — nota classificatória

`files/phenotype_storage_info/shared/storage-info.pb`:

- **aparenta ser infraestrutura** Play Services / Phenotype, não produto;
- **permaneceu byte-idêntico** durante a campanha até agora (`137 B`, `A4AE5569…1893`, *mtime*
  `2026-08-12 13:43:15`); o `raw.log` registra `Phenotype.API is not available on this device
  (DEVELOPER_ERROR)`, o que é consistente com a estabilidade observada;
- **continua sendo tratado conforme o corpus atual** — permanece entre as **oito** invariantes
  de produto, **não** é removido delas e **não** ganha tolerância;
- **qualquer mudança futura produz o gate vigente e exige decisão, não improviso.**

Registro classificatório apenas. **Nada é alterado nesta etapa.**

---

## 15. Regras humanas de vídeo — obrigação da futura instrução física

As sete regras abaixo são **parte obrigatória** da instrução física de `R2P1_RETRY_03` e de
qualquer *retry* posterior.

| regra | conteúdo normativo | forma operacional |
|---|---|---|
| **1** | Toda a sequência física **até o próximo ponto real de decisão** é entregue **antes** de iniciar a câmera. | O `AZUL` declara explicitamente qual é esse ponto. **Nada relevante fica para o meio da gravação** se puder ser explicado antes. |
| **2** | Se tudo ocorrer conforme descrito, o fundador **segue a sequência já recebida**, sem precisar consultar entre cada gesto. | Ausência de mensagem do `AZUL` **não** é sinal de parada. |
| **3** | Diante de **qualquer** comportamento diferente: o fundador **para de interagir** com o tablet; **não** corrige; **não** investiga; **não** improvisa; a câmera **continua gravando** sempre que operacionalmente possível; o fundador **relata pelo computador, em texto**. | Frase literal na instrução, no início e no fim. |
| **4** | O vídeo **não será solicitado** durante a janela probatória. | Declarado na abertura: enviar arquivo implicaria encerrar a gravação; o envio só ocorre **depois** do token final. |
| **5** | Somente **`VIDEO_CAN_STOP`** autoriza encerrar a gravação. Enquanto não existir: **`VIDEO_RECORDING_REQUIRED = SIM`**. | O `AZUL` confirma ao fim de **cada** caso que **ainda não** emitiu o token. |
| **6** | O fundador **observa e relata**. Ele **não precisa** decidir se algo é *bug*, `FAIL`, `STOP`, infraestrutura ou esperado. | Literal: *"Só relate. A classificação pertence ao protocolo e aos agentes."* |
| **7** | Antes da gravação, informar: blocos atravessados · duração aproximada · necessidade de bateria · necessidade de armazenamento. | Deixar explícito: **`CASO 7 → CK_C7 → CASO 8 → CK_C8 → VIDEO_CAN_STOP`**. Avisar que os *checkpoints* transferem **~17,2 MB** cada por `adb` e que a gravação **não** termina neles. |

**Por que estas regras existem — sem culpar o operador.** A interrupção de vídeo em
`R2P1_RETRY_02` permanece formalmente um `STOP` de custódia
(`R2P1_BLOCK_B_STOP_CASE7_VIDEO_CUSTODY_BROKEN`) e **não é convertida em `PASS`**. Mas a
correção **não** é a instrução simplista *"não pare a câmera"*: o fluxo anterior exigia que o
fundador **operasse, observasse, reportasse e consultasse orientação** enquanto a câmera deveria
permanecer contínua. A ambiguidade operacional é o defeito a corrigir, e é o que estas sete
regras eliminam. **O `STOP` anterior não é alterado retroativamente.**

---

## 16. Achado visual da barra lateral — preservado, não investigado

`Início / Aventuras / Brincar / Estrelinhas / Perfil` ancorados no **extremo inferior esquerdo**
da barra lateral, faixa tablet **823 dp**, retrato, `ROTATION_0`, rota `Home`, montagem `#1`.

| campo | valor |
|---|---|
| **CLASSIFICAÇÃO** | `OBSERVAÇÃO VISUAL` |
| **ÁREA** | `F6_SG_C` |
| **ESTADO** | registrada, **não investigada** |
| **REGISTRO ÍNTEGRO** | `C:\tmp\ptf_evidencias\R2P1_RETRY_02\23_OBSERVACAO_VISUAL_SIDEBAR_F6_SG_C.txt` |

**Não** alterar código · **não** diagnosticar nesta etapa · **não** misturar com o reset. O reset
trata de estado físico de armazenamento; o achado trata de geometria de interface. **Não têm
relação causal.** Efeito sobre vereditos: **nenhum**.

---

## 17. O que este documento **NÃO** autoriza

`HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` — **NÃO CONCEDIDO**.

Continuam **não autorizados**: qualquer comando ao tablet · qualquer restauração física ·
qualquer remoção física · abertura do aplicativo · Metro · `PS3` · `adb reverse` · *deep link* ·
execução real da idempotência · qualquer *retry* · mudança de baseline · qualquer tolerância ·
qualquer *allowlist* · `AC_5` · concessão de `F6_SG_A` · `R2P1_RETRY_03`.

**`compare_state.py` permanece selado em `A7649DD2B92C7877ADAF12635E032DBC559F4074558B572CA1EDF8A9821EFDFD` e este desenho não depende de editá-lo.**

O futuro `HUMAN GATE` de execução **deverá citar o `SHA256` integral deste documento**, de modo
que o executor não possa executar comandos diferentes dos auditados.
