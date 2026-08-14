# `32` — `R2P1_ENTRY_RESET_DESIGN_01` — reset determinístico do estado de entrada

**Data:** 2026-08-13 · **Área:** `F6_SG_A` / `R2P1` · **Estado:** **DESENHADO, NÃO EXECUTADO**
**Versão:** **`DESIGN_03` — corrigida após `R2P1_ENTRY_RESET_HARDENED_FINAL_AUDIT_STOP`**
**Decisão vinculante:** [`D-FUND-R2P1-ENTRY-RESET-01`](../../../docs/DECISIONS.md)
**Plano companheiro:** [`33_R2P1_ULTRACODE_NEXT_EXECUTION_PLAN.md`](33_R2P1_ULTRACODE_NEXT_EXECUTION_PLAN.md)
**Gate desta materialização:** `HUMAN_GATE_R2P1_ENTRY_RESET_HARDENING = CONCEDIDO`
**Gate de execução (tentativa `RETRY_03`):** `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` — **NÃO CONCEDIDO**
**Gate de execução (tentativa `RETRY_04`):** `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_04` — **NÃO CONCEDIDO**
**Gate de execução (tentativa `RETRY_05`):** `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_05` — **NÃO CONCEDIDO**

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

**Segunda rodada de auditoria — e o que ela mudou.** A materialização foi ao `VERDE` no commit
`033ac60` e voltou com **`R2P1_ENTRY_RESET_MATERIALIZED_AUDIT_STOP`**. Pela segunda vez, **a
arquitetura foi aceita e a execução foi bloqueada** — agora por **defeitos literais de
execução**, não por lacuna normativa: arquivos declarados como `EVIDÊNCIA` que **nenhum comando
gravava**; expressões nuas seguidas de comentários `DEVE` e `esperado` no lugar de condições;
validação de lista **dentro** do laço destrutivo; sondas cujo resultado vazio produzia `PASS`;
um teste de bit que aceitaria `4` onde exigia `6`; e uma instrução de idempotência que mandava
o executor **editar comandos à mão**. Aquela versão corrigiu **cada um deles literalmente** e
acrescentou as três auditorias transversais de §`13.1`, §`13.2` e §`13.3` e o quadro de tokens de
§`18`. **Nada da arquitetura foi reaberto, nenhum passo foi removido e nenhum comando novo ao
aparelho foi introduzido.**

**Terceira rodada de auditoria — e o que ela mudou.** O `DESIGN_02` foi selado no commit
`a275ee6` (`SHA256` `2CB45E1B1A2E885652C0C8D91561B0BCF5284860F54EFE8E5D94125D635B3B44`) e voltou
do `VERDE` com **`R2P1_ENTRY_RESET_HARDENED_FINAL_AUDIT_STOP`**. Pela **terceira** vez a
arquitetura foi aceita e a execução foi bloqueada. Os achados eram, todos, do mesmo gênero:
**afirmação sem implementação**. Especificamente: (a) `MTIME_CAN_STOP = NÃO` era verdadeiro para
`E7C` mas **falso para `I9`**, porque `04B_MODE_PRE.txt` e `07B_MODE_POST.txt` gravavam a linha
`stat` **inteira**, com `%Y`, e `I9` comparava essas linhas byte a byte entre as duas rodadas;
(b) as duas rodadas de idempotência **compartilhavam** `$EXEC\reset\*.txt` e todos os escritores
`-Append`, de modo que a rodada `02` acumularia `44` linhas sobre a rodada `01` — o teste de
idempotência era **inalcançável**; (c) `E3` afirmava `22 entradas` numa tabela mas executava
`Assert-Evidencia $RBLIST 1`; (d) `03_ROLLBACK_STDERR.txt` era lido com `-ErrorAction
SilentlyContinue`, de modo que **arquivo ausente** virava coleção vazia e **`PASS`**; (e) `RB6` e
`RB7` eram prosa **sem uma única linha executável**, e `$ROLLBACK_PASSO` / `$ROLLBACK_MOTIVO`
**não tinham escritor** em lugar nenhum; (f) `Assert-Exit` estava definida e **nunca chamada**,
enquanto §`2.6` afirmava "três funções obrigatórias … usadas por **todos** os passos";
(g) `E7A`/`E7B` provavam `POST ⊆ PRE` e **cardinalidade**, mas não **identidade por `relpath`**
contra o conjunto selado de 22; (h) o `HUMAN GATE` de primeira execução estava redigido de modo
a poder ser lido como cobrindo `RETRY_04`, `RETRY_05` e seguintes.

**Esta versão fecha os oito, mais os vetores latentes que a própria varredura desta emenda
encontrou** (§`18.1`). As mudanças estruturais são quatro: **raízes de rodada independentes**
(`$RST01` / `$RST02`, §`2.7`); **projeção estrutural de `stat` separada do bruto** (`$FMT_ARB`
vs. `$FMT_BRUTO`, `E4B`); **`Assert-Stderr`** como único leitor autorizado de captura de *stderr*
(§`2.6`); e **`Assert-Identidade`** como único comparador autorizado de conjuntos de `relpath`
(§`2.6`). **Nada da arquitetura foi reaberto, nenhum passo foi removido, nenhuma barreira foi
enfraquecida e nenhum comando novo ao aparelho foi introduzido.**

> **Precisão de *hash* — registro de proveniência, não de custódia.** A versão auditada pelo
> `VERDE` está lacrada em `C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_DESIGN_01\`, **intacta**. O
> manifesto daquela custódia registra `SHA256 B87D58FC3E8D7D2D…B0B6` (`92029` *bytes*,
> `1544` linhas); o `VERDE` reporta ter recalculado e obtido `B87D58FC8E3D…`. A diferença está
> em **dois dígitos transpostos entre os dois registros textuais** — não em dois arquivos
> distintos: a cópia lacrada continua **byte-idêntica** ao artefato do commit `033ac60`, e
> `DESIGN_01` **não foi tocada**. A questão é, de resto, **terminal**: ambos os valores ficam
> **aposentados para efeito de autorização**. O `HUMAN GATE` de execução citará **exclusivamente
> o novo `SHA256`** desta versão, registrado em
> `C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_DESIGN_02\03_MANIFESTO.txt`.

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

### 1.1 ⛔ Conflito normativo com a proibição histórica de restaurar `TAR` — delimitação expressa

Existe **conflito real**, não aparente, entre este procedimento e duas passagens do corpus. Elas
são citadas aqui **nominalmente**, com o texto original, porque a resolução **não pode depender**
da regra tácita *"a decisão mais nova prevalece"*:

| origem | texto histórico |
|---|---|
| `14_R2_SESSAO_2.md` §11, **condição de `STOP` nº 14** | *"Necessidade de restaurar `TAR` para «consertar» o estado de entrada"* |
| `14_R2_SESSAO_2.md` §8.1 (`G-09`) | *"🔴 **NÃO restaurar `TAR` por reflexo.** O aparelho **já está** no estado correto — a `PREP-03` terminou nele e nada foi executado depois. Restaurar é operação destrutiva e **desnecessária**. **Primeiro compara-se; restaurar não é o caminho de correção deste gate.**"* |

**A proibição histórica CONTINUA VÁLIDA** — integralmente, fora da janela do
`R2P1 ENTRY RESET` autorizado. `D-FUND-R2P1-ENTRY-RESET-01` cria uma **exceção procedimental
específica**, e **somente** ela, delimitada assim:

| dimensão | delimitação |
|---|---|
| **natureza** | Supersessão **limitada** e **prospectiva**. Não revoga, não reescreve e não reinterpreta o §8.1 nem o item `14` do §11. |
| **janela** | Exclusivamente o intervalo delimitado por `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION`. Fora dela, o item `14` volta a valer sem qualquer atenuação. |
| **posição** | Sempre **anterior ao item `13`**. Nunca durante, nunca depois. |
| **pré-condições cumulativas** | App parado · **sem** Metro · **sem** `PS3` · **sem** *reverse* · **sem** *deep link* · *rollback* capturado (`E3`) · invariantes de produto pré-reset aprovadas (`E3A`) · comando integral auditado e selado por `SHA256`. |
| **o que a exceção NÃO faz** | ⛔ **Não** cria tolerância de estado. ⛔ **Não** transforma restauração em resposta genérica a `STOP`. ⛔ **Não** autoriza restauração depois de `R2P1_STOP_ENTRY_BASELINE_DIVERGED`. ⛔ **Não** altera o artefato `30`. ⛔ **Não** altera a baseline. ⛔ **Não** cria `AC_5`, *allowlist* ou tolerância nova. |

> **A distinção material, dita sem eufemismo.** O que o §8.1 proíbe é restaurar **como conserto**:
> o aparelho diverge do esperado e alguém restaura um `TAR` por cima para fazer o gate passar.
> Isso **destrói a evidência da divergência** e converte um `STOP` em `PASS` por sobrescrita —
> permanece **terminantemente proibido**, inclusive dentro desta janela, e é exatamente por isso
> que `E3A` mede as invariantes de produto **antes** de qualquer remoção e que §6 proíbe
> recaptura depois de `E5`.
>
> O que esta janela autoriza é **outra operação**: fabricar deliberadamente, **antes** do gate e
> **antes** do item `13`, o estado de entrada conhecido — para que o item `13` e o item `14`
> tenham algo **honesto** para medir. Não é conserto de resultado; é preparação declarada de
> pré-condição. O gate continua sendo julgado **depois**, e continua podendo reprovar.
>
> `SCOPE_HISTORICAL_CONFLICT_EXPLICITLY_SUPERSEDED = SIM`

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

# ---- ESTE documento, nos dois lugares em que ele existe. Conferidos em E0.0.
#      O SHA nao pode ser literal AQUI: um arquivo nao contem o proprio hash.
#      $GATE_SHA e preenchido pelo operador com o SHA256 CITADO NO HUMAN GATE
#      concedido -- se o gate nao citar SHA, nao ha o que preencher e E0.0 para.
$DESIGN_REPO = 'C:\tmp\ptf_fase6_shell_splash_wt\specs\021-fase6-shell-splash-sistema-visual\delta-v4.1\32_R2P1_ENTRY_RESET_DESIGN_01.md'
$DESIGN_CUST = 'C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_DESIGN_03\00_DESENHO_CANONICO.txt'
$GATE_SHA    = ''      # <-- preenchido NO ATO da concessao do HUMAN GATE
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

# As 8 invariantes de PRODUTO (linhas 1,5,6,7,8,10,12,13 da tabela acima).
# Consumidas literalmente por E3A e por E8 -- nenhum passo redigita esta lista.
$PRODUTO_8 = @(
  'databases/RKStorage'
  'files/phenotype_storage_info/shared/storage-info.pb'
  'files/ptf_blobs/atelier/art_1786479103982_6079_preview.jpg'
  'files/ptf_blobs/atelier/art_1786479103982_6079_thumb.jpg'
  'files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.a.png'
  'shared_prefs/com.valentedev.pequenostracosdefe_preferences.xml'
  'shared_prefs/expo.modules.devmenu.sharedpreferences.xml'
  'shared_prefs/expo.modules.kotlin.PersistentDataManager.xml'
)
if ($PRODUTO_8.Count -ne 8) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
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

**Cinco propriedades que essa função garante — e o mecanismo exato de cada uma. A coluna
`ORIGEM` é normativa:** ela diz **qual das duas metades** da função sustenta a propriedade.

| propriedade | mecanismo | `ORIGEM` |
|---|---|---|
| impossível remover raiz de topo | a *regex* exige `(/segmento)+` **depois** da raiz; `databases` sozinho **não casa** | **`REGEX`** |
| impossível *path traversal* | `..` é rejeitado explicitamente **segmento a segmento**, no laço | **`LAÇO` — a *regex* NÃO cobre esta propriedade** |
| impossível sair das três raízes | a *regex* é ancorada em `^(databases\|files\|shared_prefs)` | **`REGEX` + `LAÇO`** (a âncora só é suficiente **junto** com a proibição de `..`) |
| impossível alcançar `cache/`, `code_cache/`, `no_backup/` | não são raízes aceitas pela *regex* | **`REGEX` + `LAÇO`** (idem: sem o laço, `files/../cache/x` casaria) |
| impossível quebrar *quoting* | o conjunto `[A-Za-z0-9._-]` exclui espaço, aspas, `$`, `` ` ``, `;`, `&`, `\|`, `*`, `?`, `(`, `)`, `<`, `>`, `\n` | **`REGEX`** |

> ### ⛔ Correção de auditoria — a *regex* **NÃO** é suficiente sozinha
>
> Uma redação anterior deste documento afirmava que o auditor podia verificar as cinco
> propriedades **"lendo apenas a expressão regular"**. **Essa afirmação era FALSA e está
> revogada.**
>
> **Demonstração literal.** O ponto (`.`) pertence à classe `[A-Za-z0-9._-]`. Logo o segmento
> `..` é composto **inteiramente** de caracteres aceitos pela *regex*, e as *strings* abaixo
> **CASAM** com `$RX_CAMINHO`:
>
> ```
> databases/..
> files/../cache/algum_arquivo
> shared_prefs/../../../../data/local/tmp/x
> ```
>
> Nenhuma delas é segura. Todas são **rejeitadas** — mas quem as rejeita é o **laço**
> `foreach ($seg in $Caminho.Split('/'))`, **não** a *regex*.
>
> **Consequência normativa, dirigida a qualquer editor futuro deste documento:** o laço
> **NÃO É REDUNDANTE**. Remover, encurtar, "simplificar" ou transformar o laço em comentário
> reabre imediatamente o vetor de *path traversal* e **invalida todo o desenho**. A segurança
> anti-*traversal* é propriedade da **composição** *regex ancorada* **+** *validação por
> segmento* — e **só** dela. Qualquer alteração em `Test-CaminhoSeguro` exige **nova auditoria
> adversarial e novo `HUMAN GATE`**.
>
> **`PATH_TRAVERSAL_DEFENSE = REGEX_ANCORADA + VALIDACAO_POR_SEGMENTO` (as duas, conjuntamente).**

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

### 2.6 *Helpers* de asserção — evidência real, coleção vazia, *stderr* e identidade

**Origem:** os três defeitos estruturais apontados pela auditoria adversarial do `VERDE`
(`R2P1_ENTRY_RESET_MATERIALIZED_AUDIT_STOP`) eram **o mesmo defeito** em três roupagens:
(a) caminho declarado como `EVIDÊNCIA` cujo conteúdo só ia para o console; (b) coleção vazia
cujo `Count = 0` era lido como `PASS`; (c) ferramenta cujo código de saída nunca era conferido.
Em vez de remendar caso a caso, o desenho passou a ter funções de asserção definidas **uma única
vez**.

**A auditoria seguinte (`R2P1_ENTRY_RESET_HARDENED_FINAL_AUDIT_STOP`) mostrou que o inventário
de funções ainda continha ficção e ainda deixava vetores abertos.** Cinco correções:

1. **`Assert-Exit` foi REMOVIDA.** Ela estava definida e **nunca era chamada** — a frase "três
   funções obrigatórias … usadas por todos os passos" era literalmente falsa. A arbitragem de
   código de saída deste desenho é **inline**, por `if ($x -ne 0) { throw }` na linha seguinte à
   captura, e §`13.3.1` a inventaria caso a caso. **Nenhuma barreira foi removida junto:** as
   `33` arbitragens `inline` que já existiam continuam onde estavam, intactas.
2. **`Assert-Stderr` foi CRIADA** e é agora o **único** leitor autorizado de captura de *stderr*.
   Ela fecha o vetor `arquivo ausente → SilentlyContinue → coleção vazia → Count = 0 → PASS`,
   distinguindo **captura existente com zero linhas** de **captura inexistente**, e gravando
   prova positiva de materialização.
3. **`Assert-Identidade` foi CRIADA** e é o **único** comparador autorizado de conjuntos de
   `relpath`. Ela substitui, onde havia, a prova por cardinalidade: exige **mesma contagem, sem
   duplicata, sem sobra e sem falta**, e nomeia cada divergência.
4. **`Assert-RaizNova` foi CRIADA** e é a única forma de nascer uma raiz de evidência de rodada.
   Preexistência é `STOP` — nenhuma raiz é limpa, truncada ou reaproveitada (§`2.7`).
5. **`New-Projecao` / `Assert-Projecao` foram CRIADAS** e retiram `%s` e `%Y` de todo arquivo
   árbitro de `stat`. O `mtime` continua sendo **capturado** — em `*_BRUTO.txt`, evidência
   diagnóstica — mas deixa de ser **comparável**, porque nenhum consumidor de `STOP` o enxerga.

As funções abaixo são definidas uma única vez, no início da execução, e valem para **todos** os
passos — inclusive os do caminho de *rollback* e os das duas rodadas de idempotência.

```powershell
# ---------------------------------------------------------------------------
# A1) Assert-Evidencia : prova que um artefato declarado como EVIDENCIA
#     EXISTE NO DISCO e NAO esta vazio. Nenhum passo posterior pode consumir
#     um caminho sem que esta funcao tenha aprovado esse caminho antes.
# ---------------------------------------------------------------------------
function Assert-Evidencia {
    param([string]$Caminho, [int]$MinLinhas = 1)
    if ([string]::IsNullOrEmpty($Caminho))          { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if (-not (Test-Path -LiteralPath $Caminho))     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ((Get-Item -LiteralPath $Caminho).Length -le 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $n = @(Get-Content -LiteralPath $Caminho |
           ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }).Count
    if ($n -lt $MinLinhas)                          { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    return $n
}

# ---------------------------------------------------------------------------
# A2) Assert-Colecao : elimina o falso PASS por colecao vazia.
#     Sem esta funcao, uma saida vazia produz Count = 0 e uma comparacao
#     '0 divergencias' que o leitor humano interpreta como sucesso.
#     -Esperado >= 0 exige contagem EXATA;  -Esperado = -1 exige apenas > 0.
# ---------------------------------------------------------------------------
function Assert-Colecao {
    param($Colecao, [int]$Esperado = -1)
    $a = @($Colecao)
    if ($a.Count -eq 0)                                    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($Esperado -ge 0 -and $a.Count -ne $Esperado)       { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    return $a.Count
}

# ---------------------------------------------------------------------------
# A3) Assert-Stderr : UNICO leitor autorizado de captura de stderr.
#
#     Vetor fechado: 'arquivo ausente -> Get-Content -SilentlyContinue ->
#     colecao vazia -> Count = 0 -> PASS'. A ausencia do arquivo passava a ser
#     INDISTINGUIVEL de 'o comando nao emitiu nada'. Aqui as duas condicoes sao
#     separadas ANTES de qualquer contagem:
#
#       captura INEXISTENTE  -> throw   (o canal de captura falhou)
#       captura EXISTENTE    -> conta linhas uteis; != 0 -> throw
#
#     'Existente com zero bytes' e PASS legitimo: 'cmd.exe /c ... 2> arquivo'
#     CRIA o arquivo mesmo quando nada e escrito nele. E exatamente por isso que
#     a AUSENCIA do arquivo prova falha do redirecionamento, e nao silencio.
#
#     Prova positiva de materializacao: grava '<arquivo>_PROVA.txt' com o
#     resultado da medicao. Nenhum passo declara stderr limpo sem esse arquivo.
# ---------------------------------------------------------------------------
function Assert-Stderr {
    param([string]$Caminho, [string]$Rotulo)
    if ([string]::IsNullOrEmpty($Caminho))      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ([string]::IsNullOrEmpty($Rotulo))       { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

    # (1) MATERIALIZACAO -- ausencia e STOP, nunca vazio.
    $existe = Test-Path -LiteralPath $Caminho -PathType Leaf
    $prova  = "$Caminho.PROVA.txt"
    if (-not $existe) {
        @(
          "STDERR_PROVA"; "ROTULO=$Rotulo"; "ARQUIVO=$Caminho"
          "CAPTURA_EXISTE=NAO"; "BYTES=-1"; "LINHAS_STDERR=-1"
          "CLASSIFICACAO=CAPTURA_INEXISTENTE"; "VEREDITO=STOP"
        ) | Set-Content -LiteralPath $prova -Encoding utf8
        throw 'R2P1_STOP_ENTRY_RESET_FAILED'
    }

    # (2) MEDICAO -- so agora, e SEM SilentlyContinue: o arquivo provadamente existe.
    $bytes = (Get-Item -LiteralPath $Caminho).Length
    $linhas = @()
    if ($bytes -gt 0) {
        $linhas = @(Get-Content -LiteralPath $Caminho |
                    ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
    }
    $classe = if ($linhas.Count -eq 0) { 'CAPTURA_EXISTENTE_SEM_LINHAS' }
              else                     { 'CAPTURA_EXISTENTE_COM_LINHAS' }
    @(
      "STDERR_PROVA"; "ROTULO=$Rotulo"; "ARQUIVO=$Caminho"
      "CAPTURA_EXISTE=SIM"; "BYTES=$bytes"; "LINHAS_STDERR=$($linhas.Count)"
      "CLASSIFICACAO=$classe"
      "VEREDITO=$(if ($linhas.Count -eq 0) { 'PASS' } else { 'STOP' })"
    ) + $linhas | Set-Content -LiteralPath $prova -Encoding utf8
    [void](Assert-Evidencia $prova 8)

    if ($linhas.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    return $linhas.Count            # sempre 0 quando retorna
}

# ---------------------------------------------------------------------------
# A4) Assert-Identidade : UNICO comparador autorizado de conjuntos de relpath.
#
#     Cardinalidade igual NAO e identidade. Dois conjuntos de 22 elementos podem
#     divergir em 22 elementos. Esta funcao exige, na ordem:
#       (1) as duas colecoes nao vazias;
#       (2) contagem exata igual a $Esperado nos DOIS lados;
#       (3) ZERO duplicatas em cada lado;
#       (4) ZERO sobras (em A e nao em B);
#       (5) ZERO faltas (em B e nao em A).
#     Grava o veredito e NOMEIA cada divergencia. Retorna a contagem.
# ---------------------------------------------------------------------------
function Assert-Identidade {
    param($A, $B, [int]$Esperado, [string]$Rotulo, [string]$Log)
    $ca = @($A | ForEach-Object { "$_".Trim() } | Where-Object { $_ -ne '' })
    $cb = @($B | ForEach-Object { "$_".Trim() } | Where-Object { $_ -ne '' })

    [void](Assert-Colecao $ca $Esperado)                # (1) e (2), lado A
    [void](Assert-Colecao $cb $Esperado)                # (1) e (2), lado B

    $ua = @($ca | Sort-Object -Unique)
    $ub = @($cb | Sort-Object -Unique)
    $dupA = $ca.Count - $ua.Count                       # (3)
    $dupB = $cb.Count - $ub.Count
    $sobra = @($ua | Where-Object { $ub -notcontains $_ })   # (4)
    $falta = @($ub | Where-Object { $ua -notcontains $_ })   # (5)

    $ok = ($dupA -eq 0) -and ($dupB -eq 0) -and
          ($sobra.Count -eq 0) -and ($falta.Count -eq 0)
    @(
      "IDENTIDADE"; "ROTULO=$Rotulo"
      "ESPERADO=$Esperado"; "A_TOTAL=$($ca.Count)"; "B_TOTAL=$($cb.Count)"
      "A_UNICOS=$($ua.Count)"; "B_UNICOS=$($ub.Count)"
      "A_DUPLICATAS=$dupA"; "B_DUPLICATAS=$dupB"
      "SO_EM_A=$($sobra.Count)"; "SO_EM_B=$($falta.Count)"
      "VEREDITO=$(if ($ok) { 'PASS' } else { 'STOP' })"
    ) + @($sobra | ForEach-Object { "SO_EM_A|$_" }) `
      + @($falta | ForEach-Object { "SO_EM_B|$_" }) |
        Set-Content -LiteralPath $Log -Encoding utf8
    [void](Assert-Evidencia $Log 12)

    if (-not $ok) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    return $ca.Count
}

# ---------------------------------------------------------------------------
# A5) Assert-RaizNova : uma raiz de evidencia NASCE NOVA ou a execucao para.
#
#     Fecha o vetor de contaminacao entre rodadas. Se a raiz ja existir, existe
#     evidencia anterior sob ela, e todo escritor '-Append' desta rodada estaria
#     acumulando sobre a rodada anterior -- que foi, literalmente, o defeito
#     apontado em 'IDEMPOTENCE_EVIDENCE_PATHS_UNIQUE'.
#     A raiz NAO e limpa, NAO e truncada e NAO e sobrescrita: preexistencia e STOP.
# ---------------------------------------------------------------------------
function Assert-RaizNova {
    param([string]$Raiz, [string]$Rotulo)
    if ([string]::IsNullOrEmpty($Raiz)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if (Test-Path -LiteralPath $Raiz)   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    New-Item -ItemType Directory -Path $Raiz | Out-Null
    if (-not (Test-Path -LiteralPath $Raiz -PathType Container)) {
        throw 'R2P1_STOP_ENTRY_RESET_FAILED'
    }
    $conteudo = @(Get-ChildItem -LiteralPath $Raiz -Recurse -Force)
    if ($conteudo.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    return $Raiz
}

# ---------------------------------------------------------------------------
# A6) Projecao estrutural de 'stat' -- o mtime NAO chega ao arbitro.
#
#     stat e chamado UMA vez por caminho, com $FMT_BRUTO (8 campos), porque a
#     validacao de formato precisa de %s e %Y para provar que a ferramenta
#     respondeu de verdade. Mas o arquivo ARBITRO -- o unico que I9 compara
#     entre as duas rodadas -- recebe apenas a PROJECAO de 6 campos:
#
#         %n:%a:%u:%g:%U:%G      (caminho, modo, uid, gid, uname, gname)
#
#     %s (bytes) e %Y (mtime) ficam SOMENTE no arquivo *_BRUTO.txt, que e
#     evidencia diagnostica e NAO e consumida por nenhum caminho de STOP.
#
#     New-Projecao   : constroi a linha do arbitro a partir dos 8 campos.
#     Assert-Projecao: prova, LENDO O ARQUIVO GRAVADO, que toda linha tem
#                      exatamente 6 campos. Uma linha de 8 campos -- isto e,
#                      uma linha capaz de carregar mtime -- e STOP. E por isso
#                      que 'MTIME_CAN_STOP = NAO' e verificavel no artefato, e
#                      nao apenas prometido em prosa.
# ---------------------------------------------------------------------------
function New-Projecao {
    param([string[]]$Campos)
    if ($Campos.Count -ne 8) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    return (@($Campos[0], $Campos[1], $Campos[2],
              $Campos[3], $Campos[4], $Campos[5]) -join ':')
}

function Assert-Projecao {
    param([string]$Caminho, [int]$Esperado, [string]$Log)
    [void](Assert-Evidencia $Caminho $Esperado)
    $ln = @(Get-Content -LiteralPath $Caminho |
            ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
    [void](Assert-Colecao $ln $Esperado)
    $mal = @($ln | Where-Object { @($_.Split(':')).Count -ne 6 })
    @(
      "PROJECAO_ESTRUTURAL"; "ARQUIVO=$Caminho"
      "LINHAS=$($ln.Count)"; "LINHAS_ESPERADAS=$Esperado"
      "CAMPOS_POR_LINHA_EXIGIDOS=6"
      "LINHAS_FORA_DE_6_CAMPOS=$($mal.Count)"
      "CONTEM_BYTES=NAO"; "CONTEM_MTIME=NAO"
      "VEREDITO=$(if ($mal.Count -eq 0) { 'PASS' } else { 'STOP' })"
    ) + @($mal | ForEach-Object { "FORA|$_" }) |
        Set-Content -LiteralPath $Log -Encoding utf8
    [void](Assert-Evidencia $Log 9)
    if ($mal.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    return $ln.Count
}

# ---------------------------------------------------------------------------
# A7) Disciplina de rollback : ESCRITOR REAL de $ROLLBACK_PASSO / $ROLLBACK_MOTIVO.
#
#     Defeito corrigido: RB0 LIA as duas variaveis com Get-Variable
#     -ErrorAction SilentlyContinue, e NENHUMA linha do documento as escrevia.
#     O rollback registraria 'NAO_INFORMADO|NAO_INFORMADO' em 100% dos casos --
#     uma evidencia que parece informacao e nao e.
#
#     Agora existe UM escritor, chamado de UM lugar: o 'catch' unico da janela
#     destrutiva (secao 5.0). $PASSO_CORRENTE e mantido por UMA linha no topo de
#     cada passo da janela (E5, E6, E7, E7A, E7B, E7C) -- linhas literais, nao prosa.
# ---------------------------------------------------------------------------
$PASSO_CORRENTE         = 'NAO_INICIADO'
$ROLLBACK_PASSO         = ''
$ROLLBACK_MOTIVO        = ''
$ROLLBACK_JA_EXECUTADO  = $false      # ROLLBACK_ATTEMPTS = 1, imposto por variavel
# Nasce no pior valor possivel. SO RB5 promove para 'RECUPERADO', e so depois de
# comparar estrutura recuperada com a baseline. Se o rollback nunca chegar a RB5,
# RB7 encontra 'INDETERMINATE' -- que e a leitura honesta de 'nao foi verificado'.
$ROLLBACK_RESULT        = 'INDETERMINATE'

function Set-Passo {
    param([string]$Nome)
    if ([string]::IsNullOrEmpty($Nome)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $script:PASSO_CORRENTE = $Nome
    return $Nome
}

function Set-CausaRollback {
    param([string]$Passo, [string]$Motivo)
    $p = "$Passo".Trim()
    $m = "$Motivo".Trim()
    if ($p -eq '') { $p = 'NAO_INFORMADO' }
    if ($m -eq '') { $m = 'NAO_INFORMADO' }
    $script:ROLLBACK_PASSO  = $p
    $script:ROLLBACK_MOTIVO = $m
    return "$p|$m"
}

# Le a saida de compare_state.py como ESTRUTURA, nunca como texto exibido.
# Consumida por E3A, pelo item 14 e por E8 -- os tres passos que antes so faziam
# 'Get-Content' e deixavam a conferencia a cargo do olho humano.
function Read-Comparador {
    param([string]$Saida)
    [void](Assert-Evidencia $Saida 11)   # 3 de escopo + 7 contadores + ENTRY_STATE_RESULT
    $r = @{ CHAVES = @{}; FILE_ADDED = @(); FILE_CHANGED = @(); FILE_DELETED = @() }
    foreach ($ln in @(Get-Content -LiteralPath $Saida |
                      ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })) {
        $i = $ln.IndexOf('=')
        if ($i -lt 1) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        $k = $ln.Substring(0, $i)
        $v = $ln.Substring($i + 1)
        switch ($k) {
            'FILE_ADDED'   { $r.FILE_ADDED   += $v }
            'FILE_CHANGED' { $r.FILE_CHANGED += $v }
            'FILE_DELETED' { $r.FILE_DELETED += $v }
            default        { $r.CHAVES[$k] = $v }
        }
    }
    # O comparador emite ERRO= quando o RKStorage falta de um dos lados: nunca ignorar.
    if ($r.CHAVES.ContainsKey('ERRO')) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    foreach ($ch in @('ESCOPO_OK','FILES_ADDED','FILES_CHANGED','FILES_DELETED',
                      'KEYS_ADDED','KEYS_CHANGED','KEYS_DELETED','KEYS_ROWID_MOVED',
                      'ENTRY_STATE_RESULT')) {
        if (-not $r.CHAVES.ContainsKey($ch))         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        if ([string]::IsNullOrEmpty($r.CHAVES[$ch])) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    }
    foreach ($ch in @('FILES_ADDED','FILES_CHANGED','FILES_DELETED',
                      'KEYS_ADDED','KEYS_CHANGED','KEYS_DELETED','KEYS_ROWID_MOVED')) {
        if ($r.CHAVES[$ch] -notmatch '^[0-9]+$')     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    }
    # Coerencia interna: contador tem de bater com a quantidade de itens enumerados.
    if ([int]$r.CHAVES['FILES_ADDED']   -ne $r.FILE_ADDED.Count)   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ([int]$r.CHAVES['FILES_CHANGED'] -ne $r.FILE_CHANGED.Count) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ([int]$r.CHAVES['FILES_DELETED'] -ne $r.FILE_DELETED.Count) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    return $r
}
```

**Sete regras normativas que decorrem destas funções:**

| # | regra | motivo |
|---|---|---|
| `A-1` | **Todo caminho declarado como `EVIDÊNCIA` é gravado com `Out-File`/`Set-Content` e imediatamente validado por `Assert-Evidencia`.** `Tee-Object` conta como gravação; **console puro não conta.** | O `VERDE` encontrou três arquivos (`00_E0_INTEGRIDADE.txt`, `03_ROLLBACK_META.txt`, `13_TAR_META.txt`) declarados como evidência e **nunca escritos**. |
| `A-2` | **Nenhuma comparação de conjunto, mapa, interseção ou lista roda antes de `Assert-Colecao` nos dois lados.** | `''` igual a `''`, interseção vazia e mapa vazio produzem `0 divergências` — o **falso `PASS` mais perigoso** deste desenho. |
| `A-3` | **Todo comando externo tem seu `$LASTEXITCODE` capturado numa variável na linha imediatamente seguinte, e essa variável é arbitrada `inline` por `if (… -ne 0) { throw }`** — salvo nos **cinco** pontos que §`13.3.1` nomeia, declara e justifica um a um, e **todos os cinco gravam o código observado em arquivo de evidência**. **Não existe função `Assert-Exit`; a arbitragem é `inline`, e §`13.3.1` a inventaria captura a captura.** O código de saída é **barreira auxiliar, nunca prova**: `rm -f` devolve `0` para arquivo inexistente, e `$LASTEXITCODE` só atravessa `adb shell` com *shell protocol* `v2`. **A prova é sempre a medição de estado.** | **Ausência de exceção no *host* PowerShell NÃO é sucesso do comando remoto.** `& $ADB …` não lança exceção quando o binário remoto falha. A versão anterior desta regra prometia uma disciplina servida por uma função que **nunca era chamada**. |
| `A-4` | **Toda captura de *stderr* é lida exclusivamente por `Assert-Stderr`.** É **proibido** ler arquivo de *stderr* com `Get-Content -ErrorAction SilentlyContinue`. **Ausência do arquivo é `STOP`, nunca coleção vazia.** | `2> arquivo` sob `cmd.exe /c` **cria** o arquivo mesmo sem conteúdo; portanto a ausência prova que o **redirecionamento falhou**, e ler isso como "sem erros" era um `PASS` fabricado. |
| `A-5` | **Toda afirmação de identidade entre conjuntos de `relpath` usa `Assert-Identidade`.** Contagem igual **não** é identidade e **não** basta em nenhum ponto que decida `PASS`. | Dois conjuntos de `22` podem divergir em `22`. `POST ⊆ PRE` com `|POST| = |PRE|` só vira igualdade **depois** de provada a ausência de duplicata — o que a versão anterior não fazia. |
| `A-6` | **Cada rodada de idempotência escreve numa raiz própria, criada por `Assert-RaizNova`, com preexistência proibida.** Nenhum escritor `-Append` de uma rodada toca arquivo produzido por outra. Nenhuma raiz é limpa, truncada ou reaproveitada. | Rodada `02` acumulando sobre rodada `01` produz `44` linhas onde o desenho afirma `22`. Resolver isso por truncamento silencioso apagaria a evidência da rodada `01`. |
| `A-7` | **Nenhum arquivo árbitro de `stat` contém `%s` ou `%Y`.** O árbitro recebe a projeção `New-Projecao` (`6` campos) e é conferido por `Assert-Projecao`, que faz `STOP` em qualquer linha fora de `6` campos. `%s` e `%Y` existem **apenas** em `*_BRUTO.txt`, e `*_BRUTO.txt` **não é lido por nenhum consumidor de `STOP`**. | `mtime` **muda legitimamente** entre duas restaurações do mesmo TAR. Enquanto ele viajava dentro da linha árbitra, `I9` comparava `04B/07B` byte a byte entre rodadas e **derrubaria a execução por uma diferença esperada**. `MTIME_CAN_STOP = NÃO` passa a ser propriedade do artefato, não promessa de prosa. |

> **`A-3`, dito de forma literal e sem eufemismo:** *stderr* do lado do aparelho chega ao
> PowerShell como **texto na saída**, não como erro. Por isso **nenhum passo deste documento
> conclui `PASS` por não ter havido exceção.** Todo `PASS` é a comparação explícita de um valor
> medido contra um valor esperado.

---

### 2.7 Raízes de rodada — isolamento literal entre as duas restaurações

**Defeito corrigido.** Até o `DESIGN_02`, `E4` … `E7C` gravavam sempre em `$EXEC\reset\`, com
nomes fixos, e `I2`/`I5` **copiavam** o diretório para `…\rodadas\RESTORE01\` e `…\RESTORE02\`
depois do fato. Copiar **não é isolar**: os originais continuavam lá, e a rodada `02` reencontrava
`04A_SELINUX_PRE.txt`, `04B_MODE_PRE.txt`, `07A_SELINUX_POST.txt`, `07B_MODE_POST.txt`,
`04A/04B/07A/07B_*_BRUTO.txt` e `07C_MTIME.txt` — **todos escritos com `Out-File -Append`** — e
acumulava. `Assert-Colecao … 22` teria visto `44` e derrubado a execução no meio da rodada `02`:
o teste de idempotência era, na prática, **inalcançável**.

**Correção estrutural.** Cada rodada tem **raiz própria**, criada nova, com produtores e
consumidores próprios. O bloco abaixo é a **citação** das linhas que `E0` executa — **não** um
segundo ponto de execução: as raízes nascem **uma única vez**, em `E0` (`$RSTC` e `$RST01`) e em
`I4.0` (`$RST02`), e `Assert-RaizNova` **para** se qualquer uma já existir:

```powershell
# ---- raizes fixas desta execucao (E0 as declara; nenhuma e reaproveitada) ----
$RSTC   = "$EXEC\reset"            # COMUM: passos de execucao unica (E1, E2, E3, E3A, RB*)
$RST01  = "$EXEC\round01\reset"    # RODADA 01: E4 .. E7C da primeira restauracao
$RST02  = "$EXEC\round02\reset"    # RODADA 02: E4 .. E7C da segunda  restauracao

# 'A rodada corrente'. E4..E7C escrevem SEMPRE em $RST -- nunca em caminho literal.
$RODADA = '01'
$RST    = $RST01

[void](Assert-RaizNova $RSTC  'RESET_COMUM')
[void](Assert-RaizNova $RST01 'RESET_RODADA_01')
# $RST02 NAO nasce aqui: nasce em I4, imediatamente antes da rodada 02.
```

| propriedade exigida | como `$RST01` e `$RST02` a cumprem |
|---|---|
| **nascer nova** | `Assert-RaizNova` cria com `New-Item` e falha se `Test-Path` já era verdadeiro |
| **preexistência proibida** | `if (Test-Path -LiteralPath $Raiz) { throw }` — **antes** do `New-Item` |
| **produtores próprios** | `E4`…`E7C` escrevem em `$RST`; `$RST` vale `$RST01` na rodada `01` e `$RST02` na rodada `02`, atribuído por **linha literal** (`E0` e `I4`), nunca por edição manual |
| **consumidores próprios** | `E7A`/`E7B` leem o `PRE` **da própria rodada**; `RB5` lê `04_ENUM_ARQUIVOS.txt` **da rodada em curso**; `I9` lê `$RST01` **e** `$RST02` e nunca mistura |
| **nenhum `-Append` cruzado** | um escritor `-Append` só alcança `$RST`, e `$RST01` ≠ `$RST02` como *string*; a rodada `02` **não pode** abrir um arquivo da rodada `01` porque o caminho não existe sob a sua raiz |
| **`I2`/`I5` não copiam mais nada** | o arquivamento por `Copy-Item` **foi removido**: a evidência já nasce separada. `I2`/`I5` apenas **conferem** a raiz da sua rodada |

> **Por que não resolver por truncamento.** `Set-Content` no lugar de `Out-File -Append` faria a
> rodada `02` **apagar** a evidência da rodada `01` dentro do mesmo arquivo. O documento passaria
> na contagem e perderia a prova — trocaria um `STOP` visível por uma perda silenciosa. A
> auditoria proibiu isso literalmente, e o desenho não o faz em ponto nenhum.

**`IDEMPOTENCE_EVIDENCE_PATHS_UNIQUE = SIM`** · **`IDEMPOTENCE_DESIGN_COMPLETE = SIM`**

---

## 3. Regras normativas desta janela

### 3.1 Tokens de `STOP` e a fronteira entre eles

| token | quando se aplica | criado por |
|---|---|---|
| **`R2P1_STOP_ENTRY_RESET_FAILED`** | falha **dentro** da operação de reset, **antes** de a restauração ter sido concluída e validada pelos itens `13` e `14` | `D-FUND-R2P1-ENTRY-RESET-01` (novo) |
| **`R2P1_STOP_ENTRY_BASELINE_DIVERGED`** | a restauração **terminou**, o item `13` capturou corretamente, o item `14` executou normalmente sobre um TAR íntegro **e o comparador encontrou divergência** | corpus vigente |
| **`R2P1_STOP_BINARY_BASELINE_DIVERGED`** | identidade de instalação divergente no item `12` | corpus vigente |
| **`R2P1_STOP_PORT_OCCUPIED`** | *listener* inesperado em `8081`/`8082`/`8083` | corpus vigente |
| **`R2P1_STOP_EVIDENCE_ROOT_PREEXISTS`** | `$EXEC`, `$RSTC`, `$RST01` ou `$RST02` já existe antes de ser criada (regra `A-6`) | `D-FUND-R2P1-ENTRY-RESET-01` (novo) |
| **`R2P1_STOP_GATE_SEM_SHA`** | `E0.0` — o `HUMAN GATE` concedido **não cita** um `SHA256` de `64` dígitos, ou `$GATE_SHA` chegou vazio | esta emenda (`_03`) |
| **`R2P1_STOP_DESIGN_CUSTODY_DIVERGED`** | `E0.0` — o desenho no repositório, o da custódia `_03` e o citado no gate **não são o mesmo objeto** (*bytes* ou `SHA256`) | esta emenda (`_03`) |

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
| **EVIDÊNCIA** | `00_PREVOO.txt` e `12_dumpsys_package_raw.txt`, **na custódia do pré-voo canônico da campanha** — arquivados em `$EXEC\preflight\` depois de `E0.3`. |

O item `12` é o que **prova a identidade do alvo** (`appId=10364`, assinatura `3351bd8d`,
`dataDir`). Operar destrutivamente sob `run-as` **antes** de confirmar contra quem se opera
inverteria a ordem elementar de segurança — é por isso que o reset vem **depois** do item `12`.

> **Correção de contradição de ordem, e o limite honesto da regra `A-1` aqui.** A redação
> anterior declarava os dois arquivos em `$EXEC\preflight\…`, mas **`$EXEC` só existe a partir
> de `E0.3`** — que roda **depois** de `E-1`. Um caminho impossível não é evidência. A verdade
> operacional é esta: `E-1` **não é definido por este documento** — ele é o pré-voo canônico da
> campanha, com seus próprios *writers* e sua própria custódia; este desenho **não o redefine,
> não o reescreve e não inventa comandos para ele**. `$EXEC\preflight\` é criado por `E0.3` como
> **destino de arquivamento**, para onde a campanha copia os dois arquivos depois que a raiz
> passa a existir. E a regra `A-1` continua **integralmente honrada**, porque ela proíbe
> *consumir* caminho não gravado: **nenhum passo `E0`…`E8`, `RB0`…`RB7` ou `I0`…`I10` lê
> qualquer um desses dois arquivos.** Eles são custódia da campanha, não insumo do reset — e é
> exatamente assim que estão classificados na matriz `13.1`.

---

### `E0` — Integridade de Git, baseline, instrumento e raiz de evidência

| campo | valor |
|---|---|
| **OBJETIVO** | Provar que **este documento** é o mesmo no repositório, na custódia `_03` e no `HUMAN GATE` concedido; que o repositório, a baseline e o instrumento estão íntegros; e criar raiz de evidência nova e exclusiva. |
| **PRÉ-CONDIÇÃO** | `E-1` `PASS`. |
| **TIPO** | `READ-ONLY` (no aparelho); escreve **apenas** no `HOST`, em raiz nova. |
| **SAÍDA ESPERADA** | `SHA256` do desenho **idêntico** nos três lugares (`E0.0`); branch/HEAD/status conforme; `$BASE_SHA` e `$BASE_LEN` conferem; `compare_state.py` = `$CMP_SHA`; `Test-Path $EXEC` = `False` antes da criação. |
| **PASS** | Todas as conferências batem. |
| **STOP** | `$GATE_SHA` vazio ou fora de `^[0-9A-F]{64}$` ⇒ `R2P1_STOP_GATE_SEM_SHA`. Desenho do repositório ≠ custódia, ou ≠ o `SHA256` citado no gate ⇒ `R2P1_STOP_DESIGN_CUSTODY_DIVERGED`. Qualquer outro *hash* divergente ⇒ **`STOP`** (fora da janela destrutiva: nada foi mutado). `Test-Path $EXEC` = `True` ⇒ `R2P1_STOP_EVIDENCE_ROOT_PREEXISTS`. |
| **EVIDÊNCIA** | `$EXEC\00_E0_INTEGRIDADE.txt` |

```powershell
# =========================================================================
# E0.0  ESTE DOCUMENTO E O MESMO EM TRES LUGARES  (DESIGN_REPO_VS_CUSTODY)
#       Repositorio, custodia _03 e HUMAN GATE precisam falar do MESMO objeto.
#       Sem isto, o executor poderia rodar comandos auditados em outra versao.
#       Roda ANTES de E0.1: e o primeiro ato do desenho, e e READ-ONLY.
# =========================================================================
if ([string]::IsNullOrWhiteSpace($GATE_SHA))            { throw 'R2P1_STOP_GATE_SEM_SHA' }
if ($GATE_SHA -notmatch '^[0-9A-F]{64}$')               { throw 'R2P1_STOP_GATE_SEM_SHA' }
if (-not (Test-Path -LiteralPath $DESIGN_REPO))         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not (Test-Path -LiteralPath $DESIGN_CUST))         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$d_len_repo = (Get-Item     -LiteralPath $DESIGN_REPO).Length
$d_len_cust = (Get-Item     -LiteralPath $DESIGN_CUST).Length
$d_sha_repo = (Get-FileHash -LiteralPath $DESIGN_REPO -Algorithm SHA256).Hash
$d_sha_cust = (Get-FileHash -LiteralPath $DESIGN_CUST -Algorithm SHA256).Hash
if ($d_len_repo -ne $d_len_cust)                        { throw 'R2P1_STOP_DESIGN_CUSTODY_DIVERGED' }
if ($d_sha_repo -ne $d_sha_cust)                        { throw 'R2P1_STOP_DESIGN_CUSTODY_DIVERGED' }
if ($d_sha_repo -ne $GATE_SHA)                          { throw 'R2P1_STOP_DESIGN_CUSTODY_DIVERGED' }

# =========================================================================
# E0.1  GIT  - medido em variavel, comparado, e depois GRAVADO
# =========================================================================
$E0_BRANCH_ESP = 'feat/fase6-shell-splash'

$g_branch = @(& git rev-parse --abbrev-ref HEAD)
$g_ec1    = $LASTEXITCODE
$g_head   = @(& git rev-parse HEAD)
$g_ec2    = $LASTEXITCODE
$g_status = @(& git status --porcelain --untracked-files=all |
              ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
$g_ec3    = $LASTEXITCODE

if ($g_ec1 -ne 0 -or $g_ec2 -ne 0 -or $g_ec3 -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
[void](Assert-Colecao $g_branch 1)
[void](Assert-Colecao $g_head   1)
$g_branch = $g_branch[0].Trim()
$g_head   = $g_head[0].Trim()
if ($g_branch -ne $E0_BRANCH_ESP)          { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($g_head -notmatch '^[0-9a-f]{40}$')    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($g_status.Count -ne 0)                 { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# =========================================================================
# E0.2  BASELINE  - recalculada agora, NUNCA lida de registro
# =========================================================================
$b_len = (Get-Item -LiteralPath $BASE_TAR).Length
if ($b_len -ne $BASE_LEN)                  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$b_sha = (Get-FileHash -LiteralPath $BASE_TAR -Algorithm SHA256).Hash
if ($b_sha -ne $BASE_SHA)                  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$b_cnt = @(Get-ChildItem -LiteralPath $BASE_REF -Recurse -File).Count
if ($b_cnt -ne 14)                         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# =========================================================================
# E0.3  RAIZ DE EVIDENCIA NOVA E EXCLUSIVA
# =========================================================================
$e_preexistia = [bool](Test-Path -LiteralPath $EXEC)
if ($e_preexistia)                         { throw 'R2P1_STOP_EVIDENCE_ROOT_PREEXISTS' }
New-Item -ItemType Directory -Force $EXEC             | Out-Null
New-Item -ItemType Directory -Force "$EXEC\tools"     | Out-Null
New-Item -ItemType Directory -Force "$EXEC\acervo"    | Out-Null
New-Item -ItemType Directory -Force "$EXEC\preflight" | Out-Null

# ---- RAIZES DE RODADA (regra A-6, secao 2.7). Cada uma NASCE NOVA ou e STOP.
#      $RST02 NAO nasce aqui: nasce em I4, imediatamente antes da rodada 02.
$RSTC  = "$EXEC\reset"
$RST01 = "$EXEC\round01\reset"
$RST02 = "$EXEC\round02\reset"
New-Item -ItemType Directory -Force "$EXEC\round01" | Out-Null
[void](Assert-RaizNova $RSTC  'RESET_COMUM')
[void](Assert-RaizNova $RST01 'RESET_RODADA_01')

# A rodada corrente. E4..E7C escrevem SEMPRE em $RST, nunca em caminho literal.
$RODADA = '01'
$RST    = $RST01
if ($RST -ne $RST01) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# =========================================================================
# E0.4  INSTRUMENTO SELADO - copiado da origem canonica, NUNCA recriado
# =========================================================================
Copy-Item -LiteralPath 'C:\tmp\ptf_evidencias\R2S2\compare_state.py' -Destination $CMP
$c_len = (Get-Item -LiteralPath $CMP).Length
$c_sha = (Get-FileHash -LiteralPath $CMP -Algorithm SHA256).Hash
if ($c_len -ne 4380)                       { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($c_sha -ne $CMP_SHA)                   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# =========================================================================
# E0.5  PERSISTENCIA REAL DA EVIDENCIA  (regra A-1)
#       Escrito DEPOIS da criacao da raiz - antes dela nao havia onde gravar.
# =========================================================================
$E0F = "$EXEC\00_E0_INTEGRIDADE.txt"
@(
  "E0_INTEGRIDADE"
  "DESIGN_REPO=$DESIGN_REPO"
  "DESIGN_REPO_BYTES=$d_len_repo"
  "DESIGN_REPO_SHA256=$d_sha_repo"
  "DESIGN_CUSTODIA=$DESIGN_CUST"
  "DESIGN_CUSTODIA_BYTES=$d_len_cust"
  "DESIGN_CUSTODIA_SHA256=$d_sha_cust"
  "DESIGN_SHA256_CITADO_NO_GATE=$GATE_SHA"
  "DESIGN_REPO_VS_CUSTODY=IDENTICOS"
  "EXEC_ROOT=$EXEC"
  "EXEC_ROOT_PREEXISTIA=$e_preexistia"
  "GIT_BRANCH=$g_branch"
  "GIT_BRANCH_ESPERADO=$E0_BRANCH_ESP"
  "GIT_HEAD=$g_head"
  "GIT_STATUS_LINHAS=$($g_status.Count)"
  "BASE_TAR=$BASE_TAR"
  "BASE_TAR_BYTES=$b_len"
  "BASE_TAR_BYTES_ESPERADO=$BASE_LEN"
  "BASE_TAR_SHA256=$b_sha"
  "BASE_TAR_SHA256_ESPERADO=$BASE_SHA"
  "BASE_REF=$BASE_REF"
  "BASE_REF_ARQUIVOS=$b_cnt"
  "BASE_REF_ARQUIVOS_ESPERADO=14"
  "CMP=$CMP"
  "CMP_BYTES=$c_len"
  "CMP_SHA256=$c_sha"
  "CMP_SHA256_ESPERADO=$CMP_SHA"
  "RESET_COMUM=$RSTC"
  "RESET_RODADA_01=$RST01"
  "RESET_RODADA_02=$RST02"
  "RESET_RODADA_02_JA_CRIADA=NAO"
  "RODADA_CORRENTE=$RODADA"
  "IDEMPOTENCE_EVIDENCE_PATHS_UNIQUE=SIM"
  "TODAS_AS_ASSERCOES=PASS"
) | Set-Content -LiteralPath $E0F -Encoding utf8
[void](Assert-Evidencia $E0F 34)
```

> **O que mudou aqui e por quê.** A redação anterior emitia `(Get-Item $BASE_TAR).Length` como
> **expressão nua** seguida do comentário `# esperado: 17234944`. Isso **não é uma verificação**
> — é um número no console que ninguém obriga a conferir, e `00_E0_INTEGRIDADE.txt` era declarado
> como `EVIDÊNCIA` **sem uma única linha que o escrevesse**. Agora cada valor é medido em
> variável, **comparado por `if` com `throw`**, e **gravado no disco**. `Assert-Evidencia` fecha
> o ciclo: se o arquivo não existir ou tiver menos de **26** linhas úteis, o passo **falha**.
>
> **Emenda `DESIGN_03`:** `E0.3` deixou de criar `$EXEC\reset` com `-Force` e passa a criar as
> **raízes de rodada** por `Assert-RaizNova` (§`2.7`, regra `A-6`). `$EXEC\round02\reset` **não**
> nasce aqui — nasce em `I4` —, e `RESET_RODADA_02_JA_CRIADA=NAO` é gravado justamente para que
> a criação antecipada seja detectável na custódia.

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
| **EVIDÊNCIA** | `$RSTC\01_PIDOF_ANTES.txt` |

```powershell
$E1F = "$RSTC\01_PIDOF_ANTES.txt"

(& $ADB -s $SERIAL shell pidof com.valentedev.pequenostracosdefe) |
    Out-File -LiteralPath $E1F -Encoding utf8
$e1_ec = $LASTEXITCODE

# 'pidof' devolve 1 quando NAO ha processo: aqui o codigo de saida nao-zero e o
# resultado ESPERADO, e por isso ele e registrado mas NAO usado como barreira.
# A prova e a contagem de PIDs, nunca o exit code (regra A-3).
if (-not (Test-Path -LiteralPath $E1F)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$e1_pids = @(Get-Content -LiteralPath $E1F |
             ForEach-Object { $_.Trim() } |
             Where-Object { $_ -match '^[0-9]+$' })
@(
  "E1_PIDOF_ANTES"
  "PIDOF_EXIT=$e1_ec"
  "PIDS_ENCONTRADOS=$($e1_pids.Count)"
  "FORCE_STOP_CORRETIVO=NAO"
) + $e1_pids | Set-Content -LiteralPath $E1F -Encoding utf8
[void](Assert-Evidencia $E1F 4)

if ($e1_pids.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

> **Contexto medido:** no encerramento de `R2P1_RETRY_02` o aplicativo já ficou parado pelo
> `S2` canônico. O pré-voo de `R2P1_RETRY_02` registrou `PIDOF_ANTES = []` **sem nenhum
> `force-stop`** — precedente direto de que esta pré-condição chega satisfeita.

> ⚠️ **`E1` é o passo em que o código de saída MENTE por construção**, e o desenho diz isso em
> voz alta: `pidof` retorna `1` quando não encontra processo — ou seja, o `EXIT` **não zero** é
> justamente o caso `PASS`. É o exemplo canônico da regra `A-3`: registrar sempre, usar como
> barreira **apenas onde o passo declara**. Aqui a prova é `PIDS_ENCONTRADOS = 0`.
>
> `I4` revalida esta mesma condição antes da rodada 2 com **exatamente o mesmo comando e a mesma
> proibição** — `force-stop` corretivo continua vedado lá também. Revalidar `E1` significa
> **remedir**, não "garantir por força".

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
| **EVIDÊNCIA** | `$RSTC\02_INFRA_AUSENTE.txt` |

```powershell
$E2F = "$RSTC\02_INFRA_AUSENTE.txt"

$e2_portas = @(Get-NetTCPConnection -State Listen -LocalPort 8081,8082,8083 -ErrorAction SilentlyContinue)
$e2_node   = @(Get-Process node -ErrorAction SilentlyContinue)
$e2_rev    = @(& $ADB -s $SERIAL reverse --list |
               ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
$e2_ec_rev = $LASTEXITCODE

@(
  "E2_INFRA_AUSENTE"
  "PORTAS_8081_8082_8083_EM_LISTEN=$($e2_portas.Count)"
  "PROCESSOS_NODE=$($e2_node.Count)"
  "REVERSE_LIST_EXIT=$e2_ec_rev"
  "REVERSE_ENTRADAS=$($e2_rev.Count)"
  "LOGCAT_LIMPO=NAO"
  "METRO_START=0"
  "PS3_START=0"
  "DEEPLINK=0"
) + @($e2_portas | ForEach-Object { "PORTA|$($_.LocalPort)|$($_.OwningProcess)" }) `
  + @($e2_node   | ForEach-Object { "NODE|$($_.Id)|$($_.ProcessName)" }) `
  + @($e2_rev    | ForEach-Object { "REVERSE|$_" }) |
    Set-Content -LiteralPath $E2F -Encoding utf8
[void](Assert-Evidencia $E2F 9)

if ($e2_ec_rev -ne 0)        { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($e2_rev.Count   -ne 0)   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($e2_node.Count  -ne 0)   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($e2_portas.Count -ne 0)  { throw 'R2P1_STOP_PORT_OCCUPIED' }
```

> `@(...)` é obrigatório: em PowerShell 5.1 um resultado único de `Where-Object`/cmdlet retorna
> escalar e `.Count` mediria caracteres, não elementos.

> ⛔ **Correção de auditoria.** `E2` declarava `$RSTC\02_INFRA_AUSENTE.txt` como
> **EVIDÊNCIA** e o bloco de comandos **não continha um único `Out-File`**: as três contagens
> eram impressas no console e o arquivo **nunca existia**. Pior, `PASS` era *"todas as contagens
> em zero"* sem nenhuma comparação — três números rolando na tela. Agora as três medições são
> variáveis, o arquivo é gravado com os detentores das portas e dos PIDs, e cada contagem é uma
> condição executável com o **token correto** para cada caso (`R2P1_STOP_PORT_OCCUPIED` para
> porta ocupada, conforme a linha `STOP` da tabela).

---

### `E3` — Capturar e validar o *rollback* do estado atual

| campo | valor |
|---|---|
| **OBJETIVO** | Produzir o **único** artefato que torna `E5` reversível. Também é a medição do estado físico atual, hoje `NÃO COMPROVADO`. |
| **PRÉ-CONDIÇÃO** | `E2` `PASS`. |
| **TIPO** | `READ-ONLY` (captura por `stdout`; **nenhum TAR dentro do aparelho**) |
| **SAÍDA ESPERADA** | TAR íntegro no `HOST`; `tar -tf` lista o conteúdo; **exatamente 22 entradas**, cujo conjunto de caminhos é **idêntico** ao conjunto selado de §`2.2`. |
| **PASS** | `EXIT = 0` · *stderr* **materializado** e sem linhas (`Assert-Stderr`) · tamanho medido e gravado · `SHA256` medido e gravado · **`$rb_itens = 22` provado ANTES da primeira mutação** · identidade de conjunto provada (`Assert-Identidade`) · **`03_ROLLBACK_META.txt` existente e validado**. |
| **STOP** | Falha de captura · *stderr* ausente **ou** com qualquer linha · contagem ≠ `22` · qualquer divergência de conjunto ⇒ **`STOP` antes de qualquer remoção**. Sem `E3` válido, `E5` **não pode começar** (§3.4). |
| **EVIDÊNCIA** | `$RSTC\TAR-ROLLBACK-PRE-RESET.tar` · `…\03_ROLLBACK_META.txt` · `…\03_ROLLBACK_LISTAGEM.txt` · `…\03_ROLLBACK_STDERR.txt` · `…\03_ROLLBACK_STDERR.txt.PROVA.txt` · `…\03_ROLLBACK_IDENTIDADE.txt` |

```powershell
$RB     = "$RSTC\TAR-ROLLBACK-PRE-RESET.tar"
$RBMETA = "$RSTC\03_ROLLBACK_META.txt"
$RBLIST = "$RSTC\03_ROLLBACK_LISTAGEM.txt"
$RBERR  = "$RSTC\03_ROLLBACK_STDERR.txt"
$RBIDN  = "$RSTC\03_ROLLBACK_IDENTIDADE.txt"

# --- carimbo de tempo: DIAGNOSTICO APENAS. Nunca e criterio de PASS/STOP.
$rb_ts = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss')

# --- captura por stdout. 'cmd.exe /c' e OBRIGATORIO (regra O-2).
#     '>' e '2>' sao consumidos pelo proprio cmd.exe: o adb.exe NAO recebe
#     nenhum metacaractere, e o shell do aparelho tampouco (F1/F2/F3 intactas).
cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ exec-out run-as com.valentedev.pequenostracosdefe tar -c databases files shared_prefs > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\TAR-ROLLBACK-PRE-RESET.tar 2> C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\03_ROLLBACK_STDERR.txt"
$rb_exit = $LASTEXITCODE

# --- MEDICAO REAL + ASSERCAO REAL (nada de expressao nua)
if (-not (Test-Path -LiteralPath $RB)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$rb_len = (Get-Item     -LiteralPath $RB).Length
$rb_sha = (Get-FileHash -LiteralPath $RB -Algorithm SHA256).Hash
if ($rb_exit -ne 0)   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($rb_len  -le 0)   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($rb_sha -notmatch '^[0-9A-F]{64}$') { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# --- stderr: UNICO leitor autorizado (regra A-4). Arquivo AUSENTE e STOP, nao
#     colecao vazia. Assert-Stderr grava '03_ROLLBACK_STDERR.txt.PROVA.txt' com
#     CAPTURA_EXISTE/BYTES/LINHAS_STDERR e distingue 'existente com zero linhas'
#     de 'inexistente'. Retorna sempre 0 -- ou nao retorna.
$rb_err_n = [int](Assert-Stderr $RBERR 'E3.ROLLBACK_TAR')

# --- listagem: GRAVADA e contada; colecao vazia NAO passa (regra A-2)
tar -tvf $RB | Out-File -LiteralPath $RBLIST -Encoding utf8
$rb_ec_list = $LASTEXITCODE
if ($rb_ec_list -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# =========================================================================
# CARDINALIDADE EXATA DO ROLLBACK -- 22, provada AQUI, ANTES DE E5.
# Homologa a guarda ja existente no item 13 ('Assert-Evidencia $T_LIST 22'
# seguida de 'if ($t_itens -ne 22)'). A redacao anterior exigia apenas '1'
# linha: um TAR truncado com 1 entrada teria passado, e o unico artefato de
# reversao da janela destrutiva estaria vazio no momento em que fosse preciso.
# =========================================================================
$rb_itens = [int](Assert-Evidencia $RBLIST 22)
if ($rb_itens -ne 22) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# --- IDENTIDADE de conjunto, nao apenas contagem (regra A-5).
#     'tar -tvf' emite uma linha longa por entrada; o caminho e o ULTIMO campo.
#     Diretorios saem com barra final: a normalizacao a remove, como em E4C.
$rb_paths = @(Get-Content -LiteralPath $RBLIST |
              ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' } |
              ForEach-Object { ($_ -split '\s+')[-1].TrimEnd('/') })
$rb_esp   = @($MODO_ESPERADO.Keys | ForEach-Object { $_.TrimEnd('/') })
[void](Assert-Identidade $rb_paths $rb_esp 22 'E3.ROLLBACK_TAR_22' $RBIDN)

# --- as tres raizes PRECISAM aparecer na listagem
$rb_txt = (Get-Content -LiteralPath $RBLIST) -join "`n"
foreach ($r in $RAIZES) {
    if ($rb_txt -notmatch [regex]::Escape($r)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

# =========================================================================
# PERSISTENCIA REAL DO META  (regra A-1) - este arquivo e CONSUMIDO por RB1
# =========================================================================
@(
  "ROLLBACK_META"
  "EXEC_ROOT=$EXEC"
  "ROLLBACK_TAR_PATH=$RB"
  "ROLLBACK_TAR_BYTES=$rb_len"
  "ROLLBACK_TAR_SHA256=$rb_sha"
  "ROLLBACK_TAR_ENTRADAS=$rb_itens"
  "ROLLBACK_TAR_ENTRADAS_ESPERADAS=22"
  "ROLLBACK_TAR_IDENTIDADE=PASS"
  "ROLLBACK_TAR_EXIT=$rb_exit"
  "ROLLBACK_STDERR_ARQUIVO=$RBERR"
  "ROLLBACK_STDERR_PROVA=$RBERR.PROVA.txt"
  "ROLLBACK_STDERR_LINHAS=$rb_err_n"
  "ROLLBACK_CAPTURA_TS=$rb_ts"
  "ROLLBACK_TS_CLASSIFICACAO=DIAGNOSTICO_APENAS"
) | Set-Content -LiteralPath $RBMETA -Encoding utf8
[void](Assert-Evidencia $RBMETA 14)
```

> **O que mudou aqui e por quê.** `03_ROLLBACK_META.txt` era declarado como `EVIDÊNCIA` e
> **nenhum comando o escrevia**; `(Get-Item $RB).Length` e `(Get-FileHash $RB …).Hash` eram
> **expressões nuas** — números no console, perdidos no instante seguinte. `RB1` então mandava
> "conferir com `E3`" **sem ter com o quê conferir**. Agora o `E3` **grava** caminho absoluto,
> *bytes*, `SHA256`, contagem de entradas, código de saída, *stderr* e carimbo de tempo, e o
> `RB1` (§5) **lê esse arquivo e recalcula tudo**. O carimbo de tempo é explicitamente marcado
> `DIAGNOSTICO_APENAS` — coerente com `MTIME_GATE = DIAGNOSTIC_ONLY` (§3.5): **tempo jamais
> produz `STOP` neste desenho.**

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
| **EVIDÊNCIA** | `$RSTC\03A_PRE_RESET_vs_ARTEFATO30.txt` · `…\03A_VEREDITO.txt` |

```powershell
$A3A     = "$RSTC\03A_PRE_RESET_vs_ARTEFATO30.txt"
$A3A_VER = "$RSTC\03A_VEREDITO.txt"
$RBX     = "$RSTC\ROLLBACK-EXTRACTED"

New-Item -ItemType Directory -Force $RBX | Out-Null
tar -xf "$RSTC\TAR-ROLLBACK-PRE-RESET.tar" -C $RBX
$a3a_ec_tar = $LASTEXITCODE
if ($a3a_ec_tar -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

python $CMP $A30_REF $RBX $A3A
$a3a_ec_cmp = $LASTEXITCODE
if ($a3a_ec_cmp -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# A saida do comparador e ESTRUTURA, nao texto para leitura humana.
$C = Read-Comparador $A3A

# (1) ESCOPO_OK -- sem isto as duas capturas nem sao comparaveis
if ($C.CHAVES['ESCOPO_OK'] -ne 'SIM') { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# (2) as quatro contagens de chave obrigatoriamente ZERO
foreach ($ch in @('KEYS_ADDED','KEYS_CHANGED','KEYS_DELETED','KEYS_ROWID_MOVED')) {
    if ([int]$C.CHAVES[$ch] -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

# (3) NENHUM dos 8 caminhos de produto pode aparecer em CHANGED ou DELETED.
#     FILES_ADDED e registrado, mas nao e STOP aqui (residuo posterior e esperado).
$a3aProd = @()
foreach ($p in $PRODUTO_8) {
    if ($C.FILE_CHANGED -contains $p) { $a3aProd += "PRODUTO_CHANGED|$p" }
    if ($C.FILE_DELETED -contains $p) { $a3aProd += "PRODUTO_DELETED|$p" }
}

@(
  "03A_VEREDITO"
  "TAR_EXTRACAO_EXIT=$a3a_ec_tar"
  "COMPARADOR_EXIT=$a3a_ec_cmp"
  "ENTRY_STATE_RESULT=$($C.CHAVES['ENTRY_STATE_RESULT'])"
  "ESCOPO_OK=$($C.CHAVES['ESCOPO_OK'])"
  "FILES_ADDED=$($C.CHAVES['FILES_ADDED'])"
  "FILES_CHANGED=$($C.CHAVES['FILES_CHANGED'])"
  "FILES_DELETED=$($C.CHAVES['FILES_DELETED'])"
  "KEYS_ADDED=$($C.CHAVES['KEYS_ADDED'])"
  "KEYS_CHANGED=$($C.CHAVES['KEYS_CHANGED'])"
  "KEYS_DELETED=$($C.CHAVES['KEYS_DELETED'])"
  "KEYS_ROWID_MOVED=$($C.CHAVES['KEYS_ROWID_MOVED'])"
  "PRODUTO_8_ATINGIDO=$($a3aProd.Count)"
  "PRE_RESET_PRODUCT_INVARIANTS=$(if ($a3aProd.Count -eq 0) { 'PASS' } else { 'STOP' })"
) + $a3aProd + @($C.FILE_CHANGED | ForEach-Object { "CHANGED|$_" }) |
    Set-Content -LiteralPath $A3A_VER -Encoding utf8
[void](Assert-Evidencia $A3A_VER 14)

if ($a3aProd.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

**Leitura obrigatória da saída — agora feita pelo código, não pelo olho.** O
`ENTRY_STATE_RESULT` deste passo **não** precisa ser `PASS`: espera-se `STOP` com
`FILES_CHANGED` listando **apenas** arquivos de **infraestrutura**. Por isso o veredito do passo
**não** é o `ENTRY_STATE_RESULT` do comparador, e sim as três condições abaixo — cada uma
implementada como `if` + `throw` no bloco acima:

| # | exigência | verificação executável |
|---|---|---|
| 1 | `ESCOPO_OK` | `-ne 'SIM'` ⇒ `throw` |
| 2 | `KEYS_*` | os quatro `-ne 0` ⇒ `throw` |
| 3 | `FILES_CHANGED` / `FILES_DELETED` | interseção com `$PRODUTO_8` ⇒ `throw` |
| — | `FILES_ADDED` | **registrado** em `03A_VEREDITO.txt`; resíduo posterior é esperado, **não** é `STOP` aqui |

> ⛔ **Correção de auditoria.** A versão anterior terminava em `Get-Content …`: a saída era
> **exibida** e a tabela de exigências ficava como instrução de leitura para um humano atento.
> Um `ESCOPO_OK = NAO` ou um `KEYS_CHANGED = 3` **rolariam pela tela** e o procedimento seguiria
> para `E4` e `E5` — isto é, seguiria **para a remoção**. Agora as três exigências são condições
> executáveis e o passo grava seu próprio veredito.

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
| **EVIDÊNCIA** | `$RST\04_ENUM_ARQUIVOS.txt` · `…\04_ENUM_DIRS.txt` · `…\04_RESIDUOS.txt` · `…\04_VALIDACAO.txt` |

```powershell
$E4_ARQ = "$RST\04_ENUM_ARQUIVOS.txt"
$E4_DIR = "$RST\04_ENUM_DIRS.txt"
$E4_RES = "$RST\04_RESIDUOS.txt"
$E4_VAL = "$RST\04_VALIDACAO.txt"

# --- enumeracao. NAO EXISTE fallback: se 'find' falhar, o passo PARA. A redacao
#     anterior anunciava "fallback declarado: ls -alR" em COMENTARIO, e comentario
#     nao e fallback -- exatamente o vicio corrigido em E4B.
(& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f) |
    Out-File -LiteralPath $E4_ARQ -Encoding utf8
$e4_ec_f = $LASTEXITCODE
(& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type d) |
    Out-File -LiteralPath $E4_DIR -Encoding utf8
$e4_ec_d = $LASTEXITCODE
if ($e4_ec_f -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($e4_ec_d -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not (Test-Path -LiteralPath $E4_ARQ)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

```powershell
# --- CANARIO DO CANAL (regra A-2). As tres raizes existem SEMPRE neste ponto.
#     Listagem de diretorios vazia nao significa "aparelho limpo": significa
#     leitura quebrada -- e leitura quebrada faria E5 remover NADA e passar.
$e4_ndirs  = [int](Assert-Evidencia $E4_DIR 3)
$dirBrutos = @(Get-Content -LiteralPath $E4_DIR |
               ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
foreach ($r in $RAIZES) {
    if ($dirBrutos -notcontains $r) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

$arqBrutos = @(Get-Content -LiteralPath $E4_ARQ |
               ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })

# --- VALIDACAO OBRIGATORIA (caminhos tratados como DADOS, nunca como comando)
$arqInvalidos = @($arqBrutos | Where-Object { -not (Test-CaminhoSeguro $_) })
$dirInvalidos = @($dirBrutos | Where-Object {
                    -not ($RAIZES -contains $_) -and -not (Test-CaminhoSeguro $_) })

# --- conjunto-residuo: o que existe hoje e NAO pertence a baseline
$RESIDUOS = @($arqBrutos | Where-Object { $ARQS_BASELINE -notcontains $_ })

# --- diretorios inesperados: existem hoje e NAO pertencem aos 8 da baseline
$DIRS_INESPERADOS = @($dirBrutos | Where-Object {
                        $DIRS_BASELINE -notcontains $_ -and $RAIZES -notcontains $_ })

# --- EVIDENCIA GRAVADA SEMPRE, no caminho de sucesso E no de falha (regra A-1).
#     A redacao anterior so escrevia 04_VALIDACAO.txt DENTRO do 'if' de erro:
#     na execucao bem-sucedida o arquivo declarado como EVIDENCIA nunca existia.
@(
  "E4_ENUMERACAO"
  "FIND_ARQUIVOS_EXIT=$e4_ec_f"
  "FIND_DIRETORIOS_EXIT=$e4_ec_d"
  "DIRETORIOS_LISTADOS=$e4_ndirs"
  "ARQUIVOS_LISTADOS=$($arqBrutos.Count)"
  "ARQUIVOS_INVALIDOS=$($arqInvalidos.Count)"
  "DIRETORIOS_INVALIDOS=$($dirInvalidos.Count)"
  "RESIDUOS=$($RESIDUOS.Count)"
  "DIRS_INESPERADOS=$($DIRS_INESPERADOS.Count)"
  "LISTA_DE_ARQUIVOS_VAZIA_E_ADMISSIVEL=NAO"
) + @($arqInvalidos | ForEach-Object { "INVALIDO_ARQ|$_" }) +
    @($dirInvalidos | ForEach-Object { "INVALIDO_DIR|$_" }) |
    Set-Content -LiteralPath $E4_VAL -Encoding utf8
[void](Assert-Evidencia $E4_VAL 10)

# Cabecalho garante arquivo nao vazio mesmo com zero residuos: Assert-Evidencia
# passa a distinguir "medi e deu zero" de "nao gravei nada".
@("E4_RESIDUOS=$($RESIDUOS.Count)") + $RESIDUOS |
    Set-Content -LiteralPath $E4_RES -Encoding utf8
[void](Assert-Evidencia $E4_RES 1)

# NAO sanitizar, NAO truncar, NAO ignorar: qualquer linha invalida PARA aqui,
# antes do primeiro 'rm' de E5.
if ($arqInvalidos.Count -gt 0 -or $dirInvalidos.Count -gt 0) {
    throw 'R2P1_STOP_ENTRY_RESET_FAILED'
}

# A lista que dirige E5 NAO pode estar vazia neste ponto do protocolo.
[void](Assert-Colecao $arqBrutos)
```

> **Por que `ARQUIVOS_LISTADOS = 0` é `STOP` aqui e `PASS` em `RB2`.** Em `E4` o aparelho ainda
> **não** foi tocado: o estado de entrada contém, no mínimo, `databases/RKStorage`. Uma lista
> vazia aqui só pode significar **canal de enumeração quebrado** — e o efeito seria devastador,
> porque `E5` removeria **nada**, a conferência `5.3` encontraria **zero arquivos remanescentes**,
> e o `PASS` seria perfeito **sobre trabalho nenhum**. Em `RB2`, ao contrário, o *rollback* pode
> ser acionado **depois** de `E5`, quando zero arquivos é o estado correto — por isso lá o canário
> é `Assert-Evidencia $RB2_DIRS 3` e aqui é `Assert-Colecao $arqBrutos`. As duas regras são
> **opostas de propósito**, e cada uma está gravada no seu arquivo de validação
> (`LISTA_DE_ARQUIVOS_VAZIA_E_ADMISSIVEL=NAO` · `LISTA_VAZIA_E_LEGITIMA=SIM`).

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
| **PASS** | Captura completa; **contexto não vazio e extraível em TODAS as entradas**; `PRE_PATH_COUNT` igual ao número de alvos. |
| **STOP** | `ls -Z` indisponível · código de saída ≠ `0` · saída vazia · contexto não extraível em **qualquer** entrada ⇒ **`throw 'R2P1_STOP_ENTRY_RESET_FAILED'` ANTES de `E5`**. Sem `SELINUX_PRE` completo não há como validar `SELINUX_POST`, e prosseguir seria remover sem referência. |
| **EVIDÊNCIA** | `$RST\04A_SELINUX_PRE.txt` · `…\04A_SELINUX_PRE_BRUTO.txt` · `…\04A_SELINUX_PRE_META.txt` |

```powershell
# UMA invocacao por caminho: 'ls -Zd' NAO recursivo devolve o contexto DAQUELE caminho.
# Cada caminho viaja como palavra atomica (F2/F3 de 2.5); nenhum 'sh -c' (F1).
$ALVOS_META = @($RAIZES) + @($dirBrutos | Where-Object { $RAIZES -notcontains $_ }) + @($arqBrutos)
[void](Assert-Colecao $ALVOS_META)          # colecao vazia NAO passa (regra A-2)

# Um contexto SELinux e um token com PELO MENOS tres ':' (user:role:type:level).
# Nenhum caminho valido contem ':' -- o charset de Test-CaminhoSeguro o exclui.
# Portanto este padrao identifica o contexto SEM presumir a ordem das colunas.
$RX_SECTX = '[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+:[A-Za-z0-9_.,=-]+'

$A4A     = "$RST\04A_SELINUX_PRE.txt"
$A4A_BR  = "$RST\04A_SELINUX_PRE_BRUTO.txt"
$A4A_MET = "$RST\04A_SELINUX_PRE_META.txt"
$SELINUX_PRE = @{}                          # mapa caminho -> contexto extraido

foreach ($rel in $ALVOS_META) {
    if (-not (Test-CaminhoSeguro $rel) -and ($RAIZES -notcontains $rel)) {
        throw 'R2P1_STOP_ENTRY_RESET_FAILED'
    }
    $bruto = (& $ADB -s $SERIAL shell run-as $PKG ls -Zd -- $rel) -join ' '
    $ec    = $LASTEXITCODE
    "$rel|EXIT=$ec|$($bruto.Trim())" | Out-File -LiteralPath $A4A_BR -Append -Encoding utf8

    # ---- TRES CONDICOES REAIS. Nenhuma delas e comentario.
    if ($ec -ne 0)                              { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($bruto.Trim().Length -eq 0)             { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $m = [regex]::Match($bruto, $RX_SECTX)
    if (-not $m.Success)                        { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $ctx = $m.Value
    if ($ctx.Length -eq 0)                      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

    $SELINUX_PRE[$rel] = $ctx
    "$rel=$ctx" | Out-File -LiteralPath $A4A -Append -Encoding utf8
}

# ---- fechamento: contagem exata, nunca "0 divergencias" por conjunto vazio
$PRE_PATH_COUNT = [int](Assert-Colecao @($SELINUX_PRE.Keys) $ALVOS_META.Count)
[void](Assert-Evidencia $A4A $PRE_PATH_COUNT)
@(
  "SELINUX_PRE_META"
  "PRE_PATH_COUNT=$PRE_PATH_COUNT"
  "PRE_PATH_COUNT_ESPERADO=$($ALVOS_META.Count)"
  "PRE_CONTEXTOS_VAZIOS=0"
  "PRE_ARQUIVO=$A4A"
) | Set-Content -LiteralPath $A4A_MET -Encoding utf8
[void](Assert-Evidencia $A4A_MET 5)
```

> ### ⛔ Correção de auditoria — o vetor de falso `PASS` de SELinux está **eliminado**
>
> A redação anterior fazia `$ctx = (…) -join ' '` e gravava `"$rel=$($ctx.Trim())"` **sem
> qualquer condição**. Se `ls -Z` não existisse, falhasse ou devolvesse vazio, a linha gravada
> seria literalmente **`databases/RKStorage=`** — e o `E7A`, comparando `''` com `''`, produziria
> **`0 divergências` = `PASS`**. O reset teria sido declarado íntegro **sem que uma única
> etiqueta SELinux tivesse sido lida.**
>
> Três condições reais fecham o vetor: **código de saída `0`**, **saída não vazia** e **contexto
> efetivamente extraído** (`[regex]::Match(...).Success`). Qualquer uma que falhe produz `throw`
> **antes de `E5`** — nenhuma remoção ocorre. **`SELINUX_EMPTY_PASS_VECTOR = NONE`.**

**A referência é `SELINUX_PRE` da própria execução.** Este documento **não** finge que existe um
valor histórico anteriormente medido. Resultado esperado em `E7A`: contexto **funcionalmente
equivalente**, dentro da mesma instalação, mesmo `uid`, mesmo *package* e mesma janela.

> **Por que a comparação não depende de conhecer o formato de saída de `ls -Zd`.** O formato
> exato da linha do `toybox` deste aparelho é **`NÃO COMPROVADO`**. O desenho **não** o presume:
> extrai o **token com pelo menos três `:`**, que só pode ser o contexto, porque a `regex` de
> §2.4 **proíbe `:` em qualquer caminho válido**. Se o formato for `contexto caminho`,
> `caminho contexto` ou trouxer colunas extras, a extração continua correta. `E4A` e `E7A` usam
> **o mesmo comando, o mesmo caminho, a mesma instalação e a mesma janela**, e comparam o
> **contexto extraído** — não a linha bruta, que poderia variar por colunas irrelevantes. A linha
> bruta fica preservada em `04A_SELINUX_PRE_BRUTO.txt` para auditoria. O desenho **não interpreta
> o rótulo** — apenas exige que ele exista e seja idêntico depois.

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
| **SAÍDA ESPERADA** | Para cada entrada: nome, modo octal, `uid`, `gid`, `uname`, `gname`, tamanho, `mtime`. Esperado `uid 10364` / `gid 10364` em **todas**. **O árbitro guarda só os seis primeiros** (regra `A-7`). |
| **PASS** | Captura completa; **8 campos parseáveis em TODAS as entradas**; `uid`/`gid` = `10364` em todas; **árbitro com `22` linhas de exatamente `6` campos**. |
| **STOP** | Código de saída ≠ `0` · linha vazia · número de campos ≠ `8` · modo não octal · `uid`/`gid` não numérico · `uid`/`gid` diferente de `10364` · **qualquer linha do árbitro fora de `6` campos** ⇒ **`throw` ANTES de `E5`**: o alvo não é o que o item `12` provou, ou a ferramenta não é confiável. |
| **EVIDÊNCIA** | `$RST\04B_MODE_PRE.txt` (**árbitro, `6` campos**) · `…\04B_MODE_PRE_BRUTO.txt` (**diagnóstico, `8` campos, com `%Y`**) · `…\04B_MODE_PRE_PROJECAO.txt` · `…\04B_MODE_PRE_META.txt` |
| **RODADA** | escreve em `$RST` — `$RST01` na rodada `01`, `$RST02` na rodada `02` (§`2.7`). |

```powershell
# FORMATO SEM ESPACOS: ':' nao e metacaractere em sh, portanto NAO precisa de aspas
# e sobrevive intacto ao reparse do shell do aparelho (2.5).
# DUAS PROJECOES, UMA UNICA CHAMADA (regra A-7):
#   $FMT_BRUTO -> 8 campos. E o que stat realmente devolve, e e necessario para
#                 VALIDAR o formato: %s e %Y provam que a ferramenta respondeu de
#                 verdade. Vai SOMENTE para 04B_MODE_PRE_BRUTO.txt (diagnostico).
#   $FMT_ARB   -> 6 campos. E a PROJECAO ESTRUTURAL que 04B_MODE_PRE.txt recebe,
#                 e 04B_MODE_PRE.txt e o unico dos dois que E7B e I9 comparam.
# Campos: 0=%n caminho  1=%a modo  2=%u uid  3=%g gid  4=%U uname  5=%G gname
#         6=%s bytes    7=%Y mtime_epoch   <-- 6 e 7 NAO ENTRAM NO ARBITRO
$FMT_BRUTO = '%n:%a:%u:%g:%U:%G:%s:%Y'
$FMT_ARB   = '%n:%a:%u:%g:%U:%G'          # documenta a projecao; New-Projecao a constroi

$A4B     = "$RST\04B_MODE_PRE.txt"          # ARBITRO   -- 6 campos
$A4B_BR  = "$RST\04B_MODE_PRE_BRUTO.txt"    # DIAGNOSTICO -- 8 campos, com mtime
$A4B_MET = "$RST\04B_MODE_PRE_META.txt"
$A4B_PRJ = "$RST\04B_MODE_PRE_PROJECAO.txt"
$MODO_PRE = @{}                             # mapa caminho -> objeto de metadados

foreach ($rel in $ALVOS_META) {
    $linha = (& $ADB -s $SERIAL shell run-as $PKG stat -c $FMT_BRUTO -- $rel) -join ' '
    $ec    = $LASTEXITCODE
    "$rel|EXIT=$ec|$($linha.Trim())" | Out-File -LiteralPath $A4B_BR -Append -Encoding utf8

    # ---- SEIS CONDICOES REAIS (nenhuma e comentario, nenhuma e expressao nua)
    if ($ec -ne 0)                       { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $t = $linha.Trim()
    if ($t.Length -eq 0)                 { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $c = $t.Split(':')
    if ($c.Count -ne 8)                  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($c[0] -cne $rel)                 { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($c[1] -notmatch '^[0-7]{3,4}$')  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($c[2] -notmatch '^[0-9]+$')      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($c[3] -notmatch '^[0-9]+$')      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($c[6] -notmatch '^[0-9]+$')      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($c[7] -notmatch '^[0-9]+$')      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ([int]$c[2] -ne $UID_ESP)         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ([int]$c[3] -ne $GID_ESP)         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

    # O objeto EM MEMORIA tambem descarta %s e %Y: nem por variavel o mtime
    # alcanca um caminho de decisao. Quem quiser mtime le o *_BRUTO.txt.
    $MODO_PRE[$rel] = [pscustomobject]@{
        Caminho = $c[0]; Modo = $c[1]; Uid = [int]$c[2]; Gid = [int]$c[3]
        Uname   = $c[4]; Gname = $c[5]
    }
    # ARBITRO recebe a PROJECAO de 6 campos -- nunca a linha de 8.
    (New-Projecao $c) | Out-File -LiteralPath $A4B -Append -Encoding utf8
}

$PRE_META_COUNT = [int](Assert-Colecao @($MODO_PRE.Keys) $ALVOS_META.Count)

# O BRUTO tem escritor e prova positiva de materializacao -- ausencia e STOP AQUI,
# no produtor, e nunca no consumidor diagnostico (E7C).
[void](Assert-Evidencia $A4B_BR $ALVOS_META.Count)

# PROVA LITERAL DE 'MTIME_CAN_STOP = NAO' DO LADO PRE:
# le o arquivo GRAVADO e exige 6 campos em toda linha. Uma linha de 8 campos --
# a unica forma de mtime alcancar E7B ou I9 -- e STOP aqui, antes de E5.
[void](Assert-Projecao $A4B $PRE_META_COUNT $A4B_PRJ)

@(
  "MODE_PRE_META"
  "PRE_META_COUNT=$PRE_META_COUNT"
  "PRE_META_COUNT_ESPERADO=$($ALVOS_META.Count)"
  "PRE_LINHAS_MAL_FORMADAS=0"
  "PRE_UID_FORA_DE_10364=0"
  "PRE_GID_FORA_DE_10364=0"
  "FONTE=stat"
  "FONTE_UNICA=SIM"
  "PRE_ARQUIVO_ARBITRO=$A4B"
  "PRE_ARQUIVO_BRUTO=$A4B_BR"
  "PRE_ARQUIVO_PROJECAO=$A4B_PRJ"
  "ARBITRO_FORMATO=$FMT_ARB"
  "BRUTO_FORMATO=$FMT_BRUTO"
  "ARBITRO_CONTEM_MTIME=NAO"
  "RODADA=$RODADA"
) | Set-Content -LiteralPath $A4B_MET -Encoding utf8
[void](Assert-Evidencia $A4B_MET 15)
```

> ### ⛔ Correção de auditoria — **`stat` é fonte única; o *fallback*-comentário foi excluído**
>
> A redação anterior trazia um bloco de comentário dizendo que `ls -lan -d` "seria o *fallback*
> caso `stat` não exista". **Comentário não é *fallback*.** Não havia *parser*, não havia
> validação de formato, não havia quem escolhesse entre as duas formas — e, pior, se `stat` não
> existisse, o laço gravaria linhas vazias e o `E7B` compararia **vazio com vazio**, entregando
> um `PASS` sobre metadados **nunca lidos**.
>
> **Decisão desta versão, deliberada e conservadora:** `stat` é **fonte única**. A sonda `E4D`
> (adiante) prova que ele funciona **antes de `E5`**. Se `stat` não estiver disponível ou não
> emitir os oito campos, o resultado é **`STOP` antes de qualquer remoção** — nada é mutado, o
> aparelho fica intacto, e adotar `ls -lan` passa a exigir **novo desenho, novo `SHA256` e novo
> `HUMAN GATE`**, exatamente como já vale para `adb shell -T`/`exec-in` em `E4C` (§17).
>
> Isso satisfaz as duas exigências ao mesmo tempo: **não existe *fallback* fingido** e **não se
> adiciona complexidade** — um *parser* alternativo nunca exercido seria mais perigoso que o
> `STOP`.

> **`NÃO COMPROVADO`, declarado:** a disponibilidade de `stat` no `toybox` **deste** aparelho
> nunca foi exercida — é exatamente isso que `E4D` mede. `find -exec … +` **não** é usado — foi
> eliminado por `F1`/`F2` de §2.5.
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
| **SAÍDA ESPERADA** | **22 entradas**, cujo **CONJUNTO de caminhos** é idêntico ao conjunto selado da baseline (`$MODO_ESPERADO`, §2.2). |
| **PASS** | `EXIT = 0` · *stderr* **materializado e sem linhas** (`Assert-Stderr`) · 22 linhas úteis · **`SÓ_NO_TAR = 0` e `SÓ_NA_REFERÊNCIA = 0`** por `Assert-Identidade`. |
| **STOP** | Código de saída ≠ `0` · **captura de *stderr* inexistente** · qualquer linha em *stderr* · contagem ≠ 22 · **qualquer** diferença de conjunto · `$RODADA` fora de `{01, 02}` ⇒ **`STOP` antes de `E5`**. Nenhuma mutação ocorreu; o aparelho continua em estado conhecido. |
| **EVIDÊNCIA** | `$RST\04C_STDIN_PROBE.txt` · `…\04C_STDIN_PROBE_STDERR.txt` · `…\04C_STDIN_PROBE_STDERR.txt.PROVA.txt` · `…\04C_STDIN_PROBE_IDENTIDADE.txt` · `…\04C_STDIN_PROBE_META.txt` |
| **RODADA** | escreve em `$RST`; é o **único** passo do intervalo `E4`…`E7C` com caminho **literal**, e por isso tem **dois** comandos escritos por extenso, um por rodada (§`2.7`). |

```powershell
$P4C     = "$RST\04C_STDIN_PROBE.txt"
$P4C_ERR = "$RST\04C_STDIN_PROBE_STDERR.txt"
$P4C_MET = "$RST\04C_STDIN_PROBE_META.txt"
$P4C_IDN = "$RST\04C_STDIN_PROBE_IDENTIDADE.txt"

# ---- 0) LITERAL POR RODADA.
# Regra O-2 exige 'cmd.exe /c' para redirecionamento binario, e regra de auditoria
# exige comando LITERAL, nao montado por concatenacao. Como cada rodada escreve numa
# raiz propria (2.7), o literal e ESCRITO DUAS VEZES, por extenso, e escolhido por
# 'if' sobre $RODADA. Nao ha edicao manual entre as rodadas, e os dois comandos
# permanecem auditaveis palavra a palavra (I5_LITERAL_COMMANDS_PRESENT = SIM).
#
# Lacre anti-deriva: se o literal e a variavel apontarem para arquivos diferentes,
# o passo para AQUI -- antes de qualquer leitura -- em vez de arbitrar o arquivo errado.
$P4C_LIT01 = 'C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\round01\reset\04C_STDIN_PROBE.txt'
$P4C_LIT02 = 'C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\round02\reset\04C_STDIN_PROBE.txt'

# '<', '>' e '2>' sao consumidos pelo cmd.exe; o aparelho nao ve metacaractere algum.
if ($RODADA -eq '01') {
    if ($P4C -ne $P4C_LIT01) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell run-as com.valentedev.pequenostracosdefe tar -t < C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\TAR-ENTRY-BASELINE-01.tar > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\round01\reset\04C_STDIN_PROBE.txt 2> C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\round01\reset\04C_STDIN_PROBE_STDERR.txt"
    $p4c_exit = $LASTEXITCODE
} elseif ($RODADA -eq '02') {
    if ($P4C -ne $P4C_LIT02) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell run-as com.valentedev.pequenostracosdefe tar -t < C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\TAR-ENTRY-BASELINE-01.tar > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\round02\reset\04C_STDIN_PROBE.txt 2> C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\round02\reset\04C_STDIN_PROBE_STDERR.txt"
    $p4c_exit = $LASTEXITCODE
} else {
    throw 'R2P1_STOP_ENTRY_RESET_FAILED'
}

# ---- 1) codigo de saida REGISTRADO e CONFERIDO
if ($p4c_exit -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---- 2) stderr pelo UNICO leitor autorizado (regra A-4).
#         Ausencia do arquivo e STOP: '2> arquivo' sob cmd.exe /c CRIA o arquivo
#         mesmo sem conteudo, entao ausencia prova falha de redirecionamento.
#         Assert-Stderr grava '04C_STDIN_PROBE_STDERR.txt.PROVA.txt'.
$p4c_err_n = [int](Assert-Stderr $P4C_ERR "E4C.STDIN_PROBE.R$RODADA")

# ---- 3) contagem exata (colecao vazia NAO passa - regra A-2)
[void](Assert-Evidencia $P4C 22)
$p4c_bruto = @(Get-Content -LiteralPath $P4C |
               ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
[void](Assert-Colecao $p4c_bruto 22)

# ---- 4) IDENTIDADE DE CONJUNTO, nao apenas contagem (regra A-5).
#         Diretorios saem do 'tar -t' com barra final; a normalizacao a remove.
#         Assert-Identidade exige: 22 de cada lado, zero duplicata, zero sobra,
#         zero falta -- e NOMEIA cada divergencia em 04C_STDIN_PROBE_IDENTIDADE.txt.
$p4c_set = @($p4c_bruto        | ForEach-Object { $_.TrimEnd('/') })
$esp_set = @($MODO_ESPERADO.Keys | ForEach-Object { $_.TrimEnd('/') })
[void](Assert-Identidade $p4c_set $esp_set 22 "E4C.TAR_22.R$RODADA" $P4C_IDN)

@(
  "STDIN_CHANNEL_PROBE_META"
  "RODADA=$RODADA"
  "EXIT=$p4c_exit"
  "STDERR_ARQUIVO=$P4C_ERR"
  "STDERR_PROVA=$P4C_ERR.PROVA.txt"
  "STDERR_LINHAS=$p4c_err_n"
  "ENTRADAS_LISTADAS=$($p4c_bruto.Count)"
  "ENTRADAS_ESPERADAS=22"
  "IDENTIDADE_ARQUIVO=$P4C_IDN"
  "IDENTIDADE_VEREDITO=PASS"
  "SO_NO_TAR=0"
  "SO_NA_REFERENCIA=0"
  "CONJUNTO_IDENTICO=SIM"
  "PROVA=FRAMING_E_LISTAGEM"
  "NAO_PROVA=FIDELIDADE_INTEGRAL_DO_PAYLOAD"
) | Set-Content -LiteralPath $P4C_MET -Encoding utf8
[void](Assert-Evidencia $P4C_MET 15)
```

> **Por que este passo foi acrescentado.** O risco não medido do desenho é a fidelidade de
> `stdin` através de `adb shell` (tradução `LF`↔`CRLF` em canal não-`raw`). Sem este teste, esse
> risco só apareceria **depois** de o conteúdo já ter sido removido — exatamente no pior momento.
> `tar -t` transforma um risco pós-destrutivo em uma verificação pré-destrutiva de custo zero.
> **É acréscimo, não substituição:** nenhum passo exigido pela decisão foi reduzido.

> ### ⚠️ O que `E4C` prova — e o que ele **NÃO** prova
>
> **PROVA (`PROBE_PROVES`):** que o TAR atravessa `HOST → stdin → adb shell → run-as → tar` com
> **estrutura de blocos íntegra o bastante para o `tar` do aparelho percorrer a cadeia completa
> de cabeçalhos até o fim**, e que o **conjunto de 22 caminhos** chega correto. Cada cabeçalho
> `ustar` tem *checksum* próprio, e o `tar` do `toybox` recusa cabeçalho com *checksum* inválido
> — de modo que uma corrupção sistemática do canal (`CRLF`, truncamento, perda de alinhamento de
> 512 *bytes*) faria este passo **falhar ruidosamente**.
>
> **NÃO PROVA (`PROBE_DOES_NOT_PROVE`):** fidelidade **integral do *payload***. `tar -t` **não
> lê o conteúdo dos membros** — apenas salta de cabeçalho em cabeçalho. Uma corrupção de *bytes*
> **restrita ao interior de um arquivo**, sem desalinhar blocos, **passaria por este teste**.
>
> **Por que isso é aceitável.** A prova de fidelidade de *payload* é do **item `14`**: `SHA256`
> arquivo a arquivo, mais o comparador `compare_state.py` sobre a árvore extraída. `E4C` não
> substitui essa prova e **não é apresentado como se substituísse** — ele existe para converter
> uma falha catastrófica de canal em `STOP` **antes** da janela destrutiva. Declarar mais do que
> isso seria falsificar o valor probatório da sonda.

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

### `E4D` — `STAT_PROBE` — provar que `stat` **existe e é parseável** antes de destruir

| campo | valor |
|---|---|
| **OBJETIVO** | Eliminar o falso `PASS` por saída vazia de `stat`. Uma coleção vazia produz `Count = 0`, e `0 divergências` é lido por um humano como sucesso. Esta sonda garante que **houve leitura real de metadados**. |
| **PRÉ-CONDIÇÃO** | `E4C` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | Sonda de caminho único com `EXIT = 0`, saída não vazia, **8 campos**, modo/`uid`/`gid` parseáveis **e**, além disso, `04B_MODE_PRE.txt` integralmente revalidado — com **6 campos por linha**, porque o árbitro é a projeção estrutural (regra `A-7`). |
| **PASS** | **`STAT_PROBE_BEFORE_E5 = SIM`** · `STAT_EMPTY_PASS_VECTOR = NONE` · **`MTIME_CAN_STOP = NÃO` revalidado no último ponto `READ-ONLY`**. |
| **STOP** | **Qualquer** condição falha ⇒ `throw 'R2P1_STOP_ENTRY_RESET_FAILED'` **ANTES de `E5`**. O aparelho permanece intacto. |
| **EVIDÊNCIA** | `$RST\04D_STAT_PROBE.txt` · `…\04D_STAT_PROBE_META.txt` · `…\04D_PROJECAO_REVALIDADA.txt` |
| **RODADA** | escreve em `$RST`. |

```powershell
$P4D     = "$RST\04D_STAT_PROBE.txt"
$P4D_MET = "$RST\04D_STAT_PROBE_META.txt"

# ---------- 4D.1  SONDA DE CAMINHO UNICO, execucao FRESCA
#            Alvo: a primeira raiz canonica -- literal de $RAIZES, jamais um
#            caminho vindo do aparelho. Existe por construcao (E4 a enumerou).
$alvoProbe = $RAIZES[0]
$pl        = (& $ADB -s $SERIAL shell run-as $PKG stat -c $FMT_BRUTO -- $alvoProbe) -join ' '
$pl_ec     = $LASTEXITCODE
"PROBE|$alvoProbe|EXIT=$pl_ec|$($pl.Trim())" | Out-File -LiteralPath $P4D -Encoding utf8

if ($pl_ec -ne 0)                       { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 1 exit code
$pt = $pl.Trim()
if ($pt.Length -eq 0)                   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 2 nao vazia
$pc = $pt.Split(':')
if ($pc.Count -ne 8)                    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 3 8 campos
if ($pc[0] -cne $alvoProbe)             { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 4 %n coerente
if ($pc[1] -notmatch '^[0-7]{3,4}$')    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 5 modo octal
if ($pc[2] -notmatch '^[0-9]+$')        { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 6 uid numerico
if ($pc[3] -notmatch '^[0-9]+$')        { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 7 gid numerico
if ([int]$pc[2] -ne $UID_ESP)           { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 8 uid do app
if ([int]$pc[3] -ne $GID_ESP)           { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 9 gid do app
if ([string]::IsNullOrEmpty($pc[4]))    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 10 uname
if ([string]::IsNullOrEmpty($pc[5]))    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 11 gname

# ---------- 4D.2  REVALIDACAO INTEGRAL DO QUE E4B GRAVOU
#            Nao basta a sonda passar: o arquivo ARBITRO consumido por E7B e por I9
#            precisa estar completo, sem uma unica linha mal formada.
#            ATENCAO: o arbitro tem SEIS campos (regra A-7). A sonda acima usa OITO
#            porque fala direto com o stat; o arbitro guarda a projecao estrutural.
$mp = @(Get-Content -LiteralPath $A4B | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
[void](Assert-Colecao $mp $ALVOS_META.Count)
$mpRuim = @($mp | Where-Object {
              $f = $_.Split(':')
              ($f.Count -ne 6) -or
              ($f[1] -notmatch '^[0-7]{3,4}$') -or
              ($f[2] -notmatch '^[0-9]+$')     -or
              ($f[3] -notmatch '^[0-9]+$')
          })
if ($mpRuim.Count -ne 0)                { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---------- 4D.3  MTIME NAO ALCANCA NENHUM ARBITRO (regra A-7, prova redundante)
#            Assert-Projecao ja rodou em E4B; aqui ela roda DE NOVO, imediatamente
#            antes de E5, porque este e o ultimo ponto READ-ONLY da cadeia.
[void](Assert-Projecao $A4B $mp.Count "$RST\04D_PROJECAO_REVALIDADA.txt")

@(
  "STAT_PROBE_META"
  "STAT_DISPONIVEL=SIM"
  "PROBE_ALVO=$alvoProbe"
  "PROBE_EXIT=$pl_ec"
  "PROBE_CAMPOS=$($pc.Count)"
  "PROBE_CAMPOS_ESPERADOS=8"
  "PROBE_FORMATO=$FMT_BRUTO"
  "ARBITRO_FORMATO=$FMT_ARB"
  "ARBITRO_CAMPOS_EXIGIDOS=6"
  "ARBITRO_CONTEM_MTIME=NAO"
  "MODE_PRE_LINHAS=$($mp.Count)"
  "MODE_PRE_LINHAS_ESPERADAS=$($ALVOS_META.Count)"
  "MODE_PRE_LINHAS_MAL_FORMADAS=0"
  "MTIME_CAN_STOP=NAO"
  "STAT_EMPTY_PASS_VECTOR=NONE"
  "STAT_PROBE_BEFORE_E5=SIM"
  "RODADA=$RODADA"
) | Set-Content -LiteralPath $P4D_MET -Encoding utf8
[void](Assert-Evidencia $P4D_MET 17)
```

> **Por que esta sonda existe.** O `VERDE` mostrou o vetor completo: se `stat` não existir no
> `toybox` deste aparelho, `04B_MODE_PRE.txt` nasce **vazio ou lixo**, `$MODO_PRE` nasce **vazio**,
> e o `E7B` — comparando dois mapas vazios — devolve **`0 divergências`**. O reset seria declarado
> íntegro com **zero metadados lidos**. A descoberta ficaria para `E7B`, ou seja, **depois** da
> destruição. Esta sonda antecipa a descoberta para **antes de `E5`**, onde ela custa nada.

---

### `E4E` — `SELINUX_PROBE` — provar que `ls -Z` **produz contexto real** antes de destruir

| campo | valor |
|---|---|
| **OBJETIVO** | Eliminar o falso `PASS` por contexto vazio. `'' == ''` é o vetor mais silencioso deste desenho. |
| **PRÉ-CONDIÇÃO** | `E4D` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | Comando disponível · `EXIT = 0` · saída não vazia · contexto extraível · **identidade por `relpath`** entre arquivo, mapa em memória e os `22` alvos selados · **nenhuma** entrada com contexto vazio. |
| **PASS** | **`SELINUX_PROBE_BEFORE_E5 = SIM`** · `SELINUX_EMPTY_PASS_VECTOR = NONE` · **`SELINUX_PRE_PROVA = IDENTIDADE_POR_RELPATH`**. |
| **STOP** | **Qualquer** condição falha ⇒ `throw 'R2P1_STOP_ENTRY_RESET_FAILED'` **ANTES de `E5`**. |
| **EVIDÊNCIA** | `$RST\04E_SELINUX_PROBE.txt` · `…\04E_SELINUX_PROBE_META.txt` · `…\04E_SELINUX_PRE_IDENTIDADE.txt` · `…\04E_SELINUX_PRE_MAPA_IDENTIDADE.txt` |
| **RODADA** | escreve em `$RST`. |

```powershell
$P4E     = "$RST\04E_SELINUX_PROBE.txt"
$P4E_MET = "$RST\04E_SELINUX_PROBE_META.txt"

# ---------- 4E.1  SONDA DE CAMINHO UNICO, execucao FRESCA
$sl    = (& $ADB -s $SERIAL shell run-as $PKG ls -Zd -- $alvoProbe) -join ' '
$sl_ec = $LASTEXITCODE
"PROBE|$alvoProbe|EXIT=$sl_ec|$($sl.Trim())" | Out-File -LiteralPath $P4E -Encoding utf8

if ($sl_ec -ne 0)                    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 1 disponivel/exit 0
$st = $sl.Trim()
if ($st.Length -eq 0)                { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 2 saida nao vazia
$sm = [regex]::Match($st, $RX_SECTX)
if (-not $sm.Success)                { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 3 extraivel
if ($sm.Value.Length -eq 0)          { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 4 nao vazio

# ---------- 4E.2  REVALIDACAO INTEGRAL DO QUE E4A GRAVOU
$sp = @(Get-Content -LiteralPath $A4A | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
[void](Assert-Colecao $sp $ALVOS_META.Count)              # 5 contagem coerente

# nenhuma linha pode terminar em '=' (contexto vazio) nem faltar contexto
$spRuim = @($sp | Where-Object {
              $i = $_.IndexOf('=')
              ($i -lt 1) -or
              ($_.Substring($i + 1).Trim().Length -eq 0) -or
              (-not ([regex]::Match($_.Substring($i + 1), $RX_SECTX)).Success)
          })
if ($spRuim.Count -ne 0)             { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # 6 nenhum vazio

# ---------- 4E.3  IDENTIDADE, NAO CARDINALIDADE (regra A-5 / BLOCO F).
#            A redacao anterior parava em 'Assert-Colecao $sp $ALVOS_META.Count':
#            22 linhas quaisquer passavam. Agora o CONJUNTO DE RELPATHS do arquivo
#            gravado, o CONJUNTO DE CHAVES do mapa em memoria e os 22 relpaths
#            selados de 2.2 sao provados IDENTICOS, um a um, por nome.
$spRel = @($sp | ForEach-Object { $_.Substring(0, $_.IndexOf('=')).Trim() })
[void](Assert-Identidade $spRel $ALVOS_META 22 "E4E.SELINUX_PRE_ARQUIVO.R$RODADA" `
                         "$RST\04E_SELINUX_PRE_IDENTIDADE.txt")
[void](Assert-Identidade @($SELINUX_PRE.Keys) $ALVOS_META 22 "E4E.SELINUX_PRE_MAPA.R$RODADA" `
                         "$RST\04E_SELINUX_PRE_MAPA_IDENTIDADE.txt")

$spVazios = @($SELINUX_PRE.Keys | Where-Object { $SELINUX_PRE[$_].Length -eq 0 })
if ($spVazios.Count -ne 0)           { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

@(
  "SELINUX_PROBE_META"
  "LS_Z_DISPONIVEL=SIM"
  "PROBE_ALVO=$alvoProbe"
  "PROBE_EXIT=$sl_ec"
  "PROBE_CONTEXTO=$($sm.Value)"
  "SELINUX_PRE_LINHAS=$($sp.Count)"
  "SELINUX_PRE_LINHAS_ESPERADAS=$($ALVOS_META.Count)"
  "SELINUX_PRE_CONTEXTOS_VAZIOS=0"
  "SELINUX_PRE_IDENTIDADE_ARQUIVO=PASS"
  "SELINUX_PRE_IDENTIDADE_MAPA=PASS"
  "SELINUX_PRE_PROVA=IDENTIDADE_POR_RELPATH"
  "SELINUX_EMPTY_PASS_VECTOR=NONE"
  "SELINUX_PROBE_BEFORE_E5=SIM"
  "RODADA=$RODADA"
) | Set-Content -LiteralPath $P4E_MET -Encoding utf8
[void](Assert-Evidencia $P4E_MET 14)
```

---

### `E4F` — `SPACE_PROBE` — espaço livre medido **antes** de `E5`, nunca depois

| campo | valor |
|---|---|
| **OBJETIVO** | Nunca descobrir `ENOSPC` **depois** de `E5`, se puder ser prevenido antes. Cobre os **dois** lados: *sandbox* do aparelho e volume do `HOST`. |
| **PRÉ-CONDIÇÃO** | `E4E` `PASS`. |
| **TIPO** | `READ-ONLY` — `df` e `Get-PSDrive` não escrevem nada. |
| **SAÍDA ESPERADA** | `/data` com folga ≫ pico líquido; volume do `HOST` com folga ≫ soma dos artefatos previstos. |
| **PASS** | Ambos os limites satisfeitos, medidos e gravados. |
| **STOP** | Folga insuficiente em qualquer um dos dois ⇒ **`STOP` antes de `E5`**. |
| **EVIDÊNCIA** | `$RST\04F_ESPACO.txt` |

**Prova estrutural do pico líquido no aparelho — por que ele é ≈ 0.** A ordem do desenho é
`E5` (remover) **antes** de `E6` (extrair). Durante `E6`, o *sandbox* está no seu **mínimo
histórico da janela**: os ~17,2 MB da árvore já saíram e vão voltar. Além disso, **nenhum TAR é
gravado dentro do aparelho** (proibição literal do item `13`): a entrada de `E6` chega por
`stdin` e é consumida em *stream*. Logo o pico de ocupação em `/data` é **o estado inicial**, e
o saldo líquido do reset é **substituição, não acréscimo**. A medição abaixo existe para provar
essa afirmação com número, não para substituí-la por confiança.

```powershell
$P4F = "$RST\04F_ESPACO.txt"

# ---------- 4F.1  APARELHO: 'df /data', somente leitura, sem 'run-as'
$dfBruto = @(& $ADB -s $SERIAL shell df /data)
$df_ec   = $LASTEXITCODE
if ($df_ec -ne 0)          { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
[void](Assert-Colecao $dfBruto)

# a linha de dados e a que termina em '/data'; cabecalho e descartado
$dfLinha = @($dfBruto | ForEach-Object { $_.Trim() } |
             Where-Object { $_ -match '\s/data$' })
[void](Assert-Colecao $dfLinha 1)
$dfC = @($dfLinha[0] -split '\s+')
if ($dfC.Count -lt 6)                   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($dfC[3] -notmatch '^[0-9]+$')       { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$devLivreMB = [int]([long]$dfC[3] / 1024)
if ($devLivreMB -lt 64)                 { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---------- 4F.2  HOST: soma dos artefatos previstos ~= 8 x 17,2 MB ~= 138 MB
$hostDrv   = (Split-Path -Qualifier $EXEC).TrimEnd(':')
$hostLivre = (Get-PSDrive -Name $hostDrv).Free
if ($null -eq $hostLivre)               { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$hostLivreMB = [int]($hostLivre / 1MB)
if ($hostLivreMB -lt 1024)              { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

@(
  "SPACE_PROBE"
  "DEVICE_MOUNT=/data"
  "DEVICE_LIVRE_MB=$devLivreMB"
  "DEVICE_MINIMO_MB=64"
  "DEVICE_PICO_LIQUIDO=SUBSTITUICAO (E5 remove antes de E6 extrair; nenhum TAR no aparelho)"
  "HOST_VOLUME=$hostDrv"
  "HOST_LIVRE_MB=$hostLivreMB"
  "HOST_MINIMO_MB=1024"
  "HOST_ESTIMATIVA_MB=138 (8 artefatos de ~17,2 MB: rollback TAR+extract, pos-reset TAR+extract, restore01 TAR+extract, restore02 TAR+extract)"
) | Set-Content -LiteralPath $P4F -Encoding utf8
[void](Assert-Evidencia $P4F 9)
```

---

### `E5` — Remover, por lista explícita, **somente** o conteúdo autorizado ⚠️ **MUTANTE**

| campo | valor |
|---|---|
| **OBJETIVO** | Levar as três subárvores ao conjunto vazio de arquivos, sem tocar em nada fora delas. |
| **PRÉ-CONDIÇÃO** | `E3` `PASS` (*rollback* existe, com `03_ROLLBACK_META.txt` gravado e validado) · `E3A` `PASS` · `E4` `PASS` (100 % validado) · `E4A` `PASS` · `E4B` `PASS` · `E4C` `PASS` · **`E4D` `PASS`** · **`E4E` `PASS`** · **`E4F` `PASS`**. **Todas cumulativas — nenhuma pode ser pulada, nenhuma pode ser presumida.** |
| **TIPO** | ⚠️ **MUTANTE — início da janela destrutiva.** A partir daqui vale `RESET_WINDOW_SCOPE_RULE = HARD_STOP` e a **proibição de recaptura** (§6). |
| **SAÍDA ESPERADA** | `find … -type f` posterior **vazio**; os 8 diretórios da baseline **intactos**. |
| **PASS** | Zero arquivos remanescentes nas três subárvores; os `$DIRS_BASELINE` continuam existindo. |
| **STOP** | Qualquer erro de remoção ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* (§5). |
| **EVIDÊNCIA** | `$RST\05_REMOCAO_LOG.txt` · `…\05_POS_REMOCAO.txt` · `…\05_POS_REMOCAO_DIRS.txt` |

```powershell
[void](Set-Passo 'E5')          # escritor 1/6 de $PASSO_CORRENTE (2.6 / 5.0)

$A5L = "$RST\05_REMOCAO_LOG.txt"
$A5P = "$RST\05_POS_REMOCAO.txt"
$A5D = "$RST\05_POS_REMOCAO_DIRS.txt"

# A lista de E4 e pre-requisito DURO, revalidado aqui: vazia, E5 removeria nada
# e a conferencia 5.3 declararia PASS sobre trabalho nenhum.
[void](Assert-Colecao $arqBrutos)
$FILES_DELETED_BY_E5 = 0
$DIRS_REMOVED_BY_E5  = 0

# ---------- 5.1  ARQUIVOS: um 'rm -f' por caminho, cada caminho revalidado NA HORA
foreach ($rel in $arqBrutos) {
    if (-not (Test-CaminhoSeguro $rel)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }   # 2a barreira
    if ($RAIZES -contains $rel)         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }   # 3a barreira
    $out = (& $ADB -s $SERIAL shell run-as $PKG rm -f -- $rel) -join ' '
    $e5_ec_rm = $LASTEXITCODE
    $FILES_DELETED_BY_E5 = $FILES_DELETED_BY_E5 + 1
    "RM|$rel|EXIT=$e5_ec_rm|OUT=$($out.Trim())" |
        Out-File -LiteralPath $A5L -Append -Encoding utf8
    if ($e5_ec_rm -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

# ---------- 5.2  DIRETORIOS INESPERADOS: rmdir, mais profundo primeiro, nunca as raizes
$ordenados = @($DIRS_INESPERADOS | Sort-Object { ($_ -split '/').Count } -Descending)
foreach ($rel in $ordenados) {
    if (-not (Test-CaminhoSeguro $rel)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }   # 2a barreira
    if ($RAIZES -contains $rel)         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }   # 3a barreira
    $out = (& $ADB -s $SERIAL shell run-as $PKG rmdir -- $rel) -join ' '
    $e5_ec_rd = $LASTEXITCODE
    $DIRS_REMOVED_BY_E5 = $DIRS_REMOVED_BY_E5 + 1
    "RMDIR|$rel|EXIT=$e5_ec_rd|OUT=$($out.Trim())" |
        Out-File -LiteralPath $A5L -Append -Encoding utf8
    if ($e5_ec_rd -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}
[void](Assert-Evidencia $A5L $FILES_DELETED_BY_E5)

# ---------- 5.3  CONFERENCIA ESTRUTURAL -- esta e a prova, nao o codigo de saida
# 05_POS_REMOCAO.txt e o UNICO arquivo do desenho cujo conteudo correto e VAZIO.
# Por isso ele e pre-criado: assim 'nao existe' deixa de ser indistinguivel de
# 'existe e esta vazio', e o Test-Path abaixo vira uma barreira de verdade.
Set-Content -LiteralPath $A5P -Value '' -Encoding utf8

(& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type d) |
    Out-File -LiteralPath $A5D -Encoding utf8
$e5_ec_d = $LASTEXITCODE
(& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f) |
    Out-File -LiteralPath $A5P -Append -Encoding utf8
$e5_ec_f = $LASTEXITCODE
if ($e5_ec_d -ne 0)                     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($e5_ec_f -ne 0)                     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not (Test-Path -LiteralPath $A5P)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# CANARIO (regra A-2): '-type d' nunca vem vazio, porque E5 preserva as raizes.
# Sem ele, um canal de leitura quebrado devolveria vazio dos DOIS lados e
# "zero arquivos remanescentes" seria lido como sucesso.
[void](Assert-Evidencia $A5D 3)
$dirsPos = @(Get-Content -LiteralPath $A5D |
             ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
[void](Assert-Colecao $dirsPos)
foreach ($r in $RAIZES) {
    if ($dirsPos -notcontains $r) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

# os 8 diretorios da baseline DEVEM continuar existindo
[void](Assert-Colecao $DIRS_BASELINE 8)
foreach ($d in $DIRS_BASELINE) {
    if ($dirsPos -notcontains $d) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

# SO AGORA a lista de arquivos pode - e deve - ser vazia.
$restantes = @(Get-Content -LiteralPath $A5P |
               ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
if ($restantes.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
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
| **PASS** | `EXIT = 0` **medido, gravado e comparado** — e `E7` conforme. |
| **STOP** | Erro de extração ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* (§5). |
| **EVIDÊNCIA** | `$RST\06_EXTRACAO.txt` (stdout + stderr + linha `E6_EXTRACAO_EXIT`) |

```powershell
[void](Set-Passo 'E6')          # escritor 2/6 de $PASSO_CORRENTE (2.6 / 5.0)

$E6F = "$RST\06_EXTRACAO.txt"

# LITERAL POR RODADA -- mesma disciplina de E4C: dois comandos escritos por extenso,
# escolhidos por 'if' sobre $RODADA, com lacre anti-deriva entre literal e variavel.
$E6_LIT01 = 'C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\round01\reset\06_EXTRACAO.txt'
$E6_LIT02 = 'C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\round02\reset\06_EXTRACAO.txt'

if ($RODADA -eq '01') {
    if ($E6F -ne $E6_LIT01) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell run-as com.valentedev.pequenostracosdefe tar -x -C /data/user/0/com.valentedev.pequenostracosdefe < C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\TAR-ENTRY-BASELINE-01.tar > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\round01\reset\06_EXTRACAO.txt 2>&1"
    $e6_ec = $LASTEXITCODE
} elseif ($RODADA -eq '02') {
    if ($E6F -ne $E6_LIT02) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell run-as com.valentedev.pequenostracosdefe tar -x -C /data/user/0/com.valentedev.pequenostracosdefe < C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\TAR-ENTRY-BASELINE-01.tar > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\round02\reset\06_EXTRACAO.txt 2>&1"
    $e6_ec = $LASTEXITCODE
} else {
    throw 'R2P1_STOP_ENTRY_RESET_FAILED'
}

if (-not (Test-Path -LiteralPath $E6F)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
"E6_EXTRACAO_EXIT=$e6_ec" | Out-File -LiteralPath $E6F -Append -Encoding utf8

# O 2>&1 traz o stderr remoto para DENTRO do arquivo. Qualquer linha anterior
# a de EXIT e saida inesperada de 'tar -x', que em caso normal e silencioso.
$e6_ruido = @(Get-Content -LiteralPath $E6F |
              ForEach-Object { $_.Trim() } |
              Where-Object { $_ -ne '' -and $_ -notlike 'E6_EXTRACAO_EXIT=*' })
"E6_LINHAS_INESPERADAS=$($e6_ruido.Count)" | Out-File -LiteralPath $E6F -Append -Encoding utf8

if ($e6_ec -ne 0)             { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($e6_ruido.Count -ne 0)    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

> ⛔ **Correção de auditoria.** `E6` é o passo **mutante** que reconstrói os 14 arquivos, e sua
> tabela declarava `PASS = EXIT 0` **sem nenhuma linha que lesse o código de saída**. Um
> `tar: short read`, um `run-as: unknown package` ou um *pipe* interrompido cairiam dentro de
> `06_EXTRACAO.txt` por força do `2>&1`, o `cmd.exe` devolveria código não zero — e o
> procedimento seguiria para `E7` **com as três subárvores vazias**, porque `E5` já rodou.
> Agora o código de saída é capturado em `$e6_ec`, **gravado no próprio arquivo de evidência**, e
> qualquer linha de ruído remoto é `STOP` com *rollback*.

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
| **PASS** | Conjuntos **idênticos por nome**, provado por `Assert-Identidade` (sem duplicata, sem sobra, sem falta). |
| **STOP** | Arquivo faltante, arquivo extra, duplicata ou diretório inesperado ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* (§5). |
| **EVIDÊNCIA** | `$RST\07_ESTRUTURA_POS.txt` · `…\07_ESTRUTURA_IDENTIDADE.txt` |
| **RODADA** | escreve em `$RST`. |

```powershell
[void](Set-Passo 'E7')          # escritor 3/6 de $PASSO_CORRENTE (2.6 / 5.0)

$A7 = "$RST\07_ESTRUTURA_POS.txt"

& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f |
    Out-File -LiteralPath $A7 -Encoding utf8
$a7_ec = $LASTEXITCODE
if ($a7_ec -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---- guardas de vazio ANTES de ler (regra A-2). Sem elas, uma extracao que nao
#      produzisse NADA compararia lista vazia com lista vazia -- exatamente o falso
#      PASS que se combate. Nao ha 'SilentlyContinue': ausencia do arquivo e STOP.
[void](Assert-Evidencia $A7 14)
$posArq = @(Get-Content -LiteralPath $A7 |
            ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
[void](Assert-Colecao $posArq        14)
[void](Assert-Colecao $ARQS_BASELINE 14)

# ---- IDENTIDADE por nome, nao apenas ausencia de diferenca agregada (regra A-5).
[void](Assert-Identidade $posArq $ARQS_BASELINE 14 "E7.ESTRUTURA_14.R$RODADA" `
                         "$RST\07_ESTRUTURA_IDENTIDADE.txt")
```

---

### `E7A` — `SELINUX_POST` — comparar contra `SELINUX_PRE`

| campo | valor |
|---|---|
| **OBJETIVO** | Provar que a extração não degradou o contexto de segurança. |
| **PRÉ-CONDIÇÃO** | `E7` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | Contexto **funcionalmente equivalente** ao de `E4A`, dentro da mesma instalação, mesmo `uid`, mesmo *package*, mesma janela. |
| **PASS** | Equivalência funcional para todas as entradas **com domínio de comparação provado por identidade de `relpath`, não vazio, igual a `22` dos dois lados**. |
| **STOP** | `PRE` ausente · `POST` ausente · contexto vazio de qualquer lado · contagem incompatível · **`POST` diferente dos 22 selados** · **`PRE` que não cobre os 22 selados** · duplicata · interseção vazia · chave de `POST` sem par em `PRE` · divergência material ⇒ `R2P1_STOP_ENTRY_RESET_FAILED`. **NÃO** corrigir com `restorecon`, `chcon`, *root* ou qualquer mecanismo não autorizado. |
| **EVIDÊNCIA** | `$RST\07A_SELINUX_POST.txt` · `…\07A_SELINUX_POST_BRUTO.txt` · `…\07A_SELINUX_DIFF.txt` · `…\07A_SELINUX_DOMINIO.txt` · `…\07A_SELINUX_POST_IDENTIDADE.txt` · `…\07A_SELINUX_PRE_COBERTURA.txt` |
| **RODADA** | lê o `PRE` **da própria rodada** (`$RST\04A_…`) e escreve o `POST` na mesma raiz. |

```powershell
[void](Set-Passo 'E7A')         # escritor 4/6 de $PASSO_CORRENTE (2.6 / 5.0)

$A7A     = "$RST\07A_SELINUX_POST.txt"
$A7A_BR  = "$RST\07A_SELINUX_POST_BRUTO.txt"
$A7A_DIF = "$RST\07A_SELINUX_DIFF.txt"
$A7A_DOM = "$RST\07A_SELINUX_DOMINIO.txt"

# ---- captura POS: MESMO comando, MESMAS guardas e MESMA extracao de E4A
$ALVOS_POS = @($RAIZES) + @($DIRS_BASELINE | Where-Object { $RAIZES -notcontains $_ }) +
             @($ARQS_BASELINE)
[void](Assert-Colecao $ALVOS_POS 22)

foreach ($rel in $ALVOS_POS) {
    $bruto = (& $ADB -s $SERIAL shell run-as $PKG ls -Zd -- $rel) -join ' '
    $ec    = $LASTEXITCODE
    "$rel|EXIT=$ec|$($bruto.Trim())" | Out-File -LiteralPath $A7A_BR -Append -Encoding utf8
    if ($ec -ne 0)                  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($bruto.Trim().Length -eq 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $m = [regex]::Match($bruto, $RX_SECTX)
    if (-not $m.Success)            { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    "$rel=$($m.Value)" | Out-File -LiteralPath $A7A -Append -Encoding utf8
}

# ---- leitor endurecido: rejeita linha sem '=', chave vazia e valor vazio
function Import-Indexado {
    param([string]$Arquivo)
    if (-not (Test-Path -LiteralPath $Arquivo)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $h = @{}
    foreach ($ln in @(Get-Content -LiteralPath $Arquivo |
                      ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })) {
        $i = $ln.IndexOf('=')
        if ($i -lt 1)                              { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        $chave = $ln.Substring(0, $i)
        $valor = $ln.Substring($i + 1).Trim()
        if ($valor.Length -eq 0)                   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        $h[$chave] = $valor
    }
    if ($h.Count -eq 0)                            { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    return $h
}

# =========================================================================
# PROVA DO DOMINIO DE COMPARACAO -- executada ANTES de comparar UM UNICO VALOR
# =========================================================================
if (-not (Test-Path -LiteralPath $A4A)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # PRE ausente
if (-not (Test-Path -LiteralPath $A7A)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }  # POS ausente
$sePre = Import-Indexado $A4A
$sePos = Import-Indexado $A7A

$PRE_PATH_COUNT  = [int](Assert-Colecao @($sePre.Keys) $ALVOS_META.Count)   # PRE  = ESPERADO
$POST_PATH_COUNT = [int](Assert-Colecao @($sePos.Keys) $ALVOS_POS.Count)    # POST = ESPERADO

# ---- (A) IGUALDADE, onde o invariante E igualdade (BLOCO F / regra A-5).
#      POST tem de ser EXATAMENTE o conjunto selado de 22 relpaths de 2.2.
#      Cardinalidade 22 nao basta: 22 nomes errados tambem dao 22.
[void](Assert-Identidade @($sePos.Keys) $ALVOS_POS 22 "E7A.POST_IGUAL_A_22.R$RODADA" `
                         "$RST\07A_SELINUX_POST_IDENTIDADE.txt")

# ---- (B) SUBCONJUNTO, onde o invariante E subconjunto -- com a condicao previa
#      que o torna significativo PROVADA LITERALMENTE.
#      PRE inclui residuos que E5 remove, entao PRE = POST seria falso por
#      construcao. O que precisa ser verdade e: PRE CONTEM os 22 selados. Sem
#      isso, 'POST subset de PRE' seria satisfeito por um PRE arbitrario.
$semParPre = @($sePos.Keys | Where-Object { -not $sePre.ContainsKey($_) })
if ($semParPre.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }        # chave faltante

$preNosSelados = @($ALVOS_POS | Where-Object { $sePre.ContainsKey($_) })
[void](Assert-Identidade $preNosSelados $ALVOS_POS 22 "E7A.PRE_COBRE_OS_22.R$RODADA" `
                         "$RST\07A_SELINUX_PRE_COBERTURA.txt")

# ---- (C) so agora o dominio e formado, e ele vale 22 por identidade dos dois lados.
$DOMINIO = @($sePos.Keys | Where-Object { $sePre.ContainsKey($_) } | Sort-Object)
$DOM_COUNT = [int](Assert-Colecao $DOMINIO $POST_PATH_COUNT)                # intersecao != vazia
if ($DOM_COUNT -ne 22) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }             # e IGUAL a POST = 22

$preVazios = @($sePre.Keys | Where-Object { $sePre[$_].Length -eq 0 })
$posVazios = @($sePos.Keys | Where-Object { $sePos[$_].Length -eq 0 })
if ($preVazios.Count -ne 0 -or $posVazios.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

@(
  "SELINUX_DOMINIO"
  "RODADA=$RODADA"
  "PRE_ARQUIVO=$A4A"
  "POST_ARQUIVO=$A7A"
  "PRE_E_POST_NA_MESMA_RAIZ=SIM"
  "PRE_PATH_COUNT=$PRE_PATH_COUNT"
  "PRE_PATH_COUNT_ESPERADO=$($ALVOS_META.Count)"
  "POST_PATH_COUNT=$POST_PATH_COUNT"
  "POST_PATH_COUNT_ESPERADO=$($ALVOS_POS.Count)"
  "POST_IGUAL_AOS_22_SELADOS=SIM"
  "PRE_COBRE_OS_22_SELADOS=SIM"
  "DOMINIO_COMPARACAO=$DOM_COUNT"
  "DOMINIO_ESPERADO=22"
  "POST_SEM_PAR_EM_PRE=0"
  "DOMINIO_IGUAL_A_POST=SIM"
  "PROVA=IDENTIDADE_POR_RELPATH"
  "PRE_CONTEXTOS_VAZIOS=0"
  "POST_CONTEXTOS_VAZIOS=0"
  "SELINUX_EMPTY_PASS_VECTOR=NONE"
) | Set-Content -LiteralPath $A7A_DOM -Encoding utf8
[void](Assert-Evidencia $A7A_DOM 19)

# =========================================================================
# SO AGORA os VALORES sao comparados
# =========================================================================
$seDiff = @()
foreach ($k in $DOMINIO) {
    if ($sePre[$k] -cne $sePos[$k]) {
        $seDiff += "DIVERGE|$k|PRE=$($sePre[$k])|POS=$($sePos[$k])"
    }
}
$seDiff | Out-File -LiteralPath $A7A_DIF -Encoding utf8
if (@($seDiff).Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

> ### ⛔ Correção de auditoria — o falso `PASS` de SELinux em `E7A` está **eliminado**
>
> A redação anterior comparava `$sePre[$k] -ne $sePos[$k]` **sem provar que havia o que
> comparar**. Combinado com o `E4A` sem guardas, o cenário completo do falso `PASS` era:
> `ls -Z` indisponível ⇒ `PRE` e `POST` gravam `caminho=` ⇒ `'' -ne ''` é **falso** em toda
> entrada ⇒ `$seDiff` fica **vazio** ⇒ `@($seDiff).Count` = `0` ⇒ **`PASS`**. E, pior, se o
> arquivo `PRE` nem existisse, `Import-Indexado` devolveria mapa vazio, o laço não iteraria e o
> resultado seria **o mesmo `0`**.
>
> Agora **nada é comparado antes de o domínio ser provado**: `PRE` existe, `POST` existe,
> ambos com contagem **exata** e esperada, nenhuma chave de `POST` órfã, interseção **não
> vazia** e **igual a `POST`**, e **zero contextos vazios dos dois lados**. Só depois disso os
> valores entram na comparação — e a divergência é `-cne`, **sensível a maiúsculas**, porque
> rótulo SELinux é *case-sensitive*.

> **Sobre `PRE_PATH_SET` e `POST_PATH_SET` — declaração explícita de precisão.** A exigência de
> auditoria pede provar `PRE_PATH_SET = POST_PATH_SET` antes de comparar valores. Aqui a
> igualdade **não pode ser literal sobre os conjuntos brutos**, e isso é propriedade do
> procedimento, não descuido: `PRE` é capturado **antes** de `E5` e inclui os **resíduos** que
> `E5` remove; `POST` contém exatamente as **22** entradas da baseline. Exigir igualdade bruta
> criaria divergência **por construção** — um falso positivo que treinaria o executor a ignorar
> o resultado, que é o defeito oposto e igualmente grave.
>
> A propriedade **efetivamente provada e asseverada** é a forma correta da mesma exigência:
>
> | # | propriedade provada | asserção |
> |---|---|---|
> | 1 | `PRE_PATH_COUNT` = número de alvos enumerados em `E4A` | `Assert-Colecao … $ALVOS_META.Count` |
> | 2 | `POST_PATH_COUNT` = **22** | `Assert-Colecao … $ALVOS_POS.Count` |
> | 3 | **`POST` é IDENTICAMENTE o conjunto selado de 22 `relpath`** — mesma contagem, zero duplicata, zero sobra, zero falta | `Assert-Identidade @($sePos.Keys) $ALVOS_POS 22` |
> | 4 | `POST ⊆ PRE` — **nenhuma** chave de `POST` sem par | `$semParPre.Count -ne 0` ⇒ `throw` |
> | 5 | **condição prévia que torna `(4)` significativo: `PRE` COBRE os 22 selados**, provada por identidade | `Assert-Identidade $preNosSelados $ALVOS_POS 22` |
> | 6 | domínio de comparação = `POST`, **não vazio e igual a 22** | `Assert-Colecao $DOMINIO $POST_PATH_COUNT` + `if ($DOM_COUNT -ne 22) { throw }` |
> | 7 | zero contextos vazios em `PRE` **e** em `POST` | `$preVazios` / `$posVazios` ⇒ `throw` |
> | 8 | `PRE` e `POST` são **da mesma rodada** | ambos sob `$RST`; `$RST01` ≠ `$RST02` (§`2.7`) |
>
> **Emenda `DESIGN_03` — o que mudou e por quê.** A versão anterior parava em `(2)` + `(4)`:
> contagem correta dos dois lados e nenhuma chave órfã. Isso **não** é identidade — `22` chaves
> erradas satisfazem a contagem, e `POST ⊆ PRE` é satisfeito por qualquer `PRE` inchado. Agora
> `(3)` testa **igualdade** onde o invariante é igualdade, e `(5)` prova **literalmente** a
> condição prévia que torna o subconjunto de `(4)` significativo. Nenhum aparelho foi alterado
> para tornar o teste possível: as duas provas leem os mesmos arquivos que já existiam.

---

### `E7B` — `MODE_POST` — modo, *ownership* e grupo

| campo | valor |
|---|---|
| **OBJETIVO** | Fechar o ponto cego do comparador: conteúdo correto com metadado errado passaria no item `14` e quebraria o app. |
| **PRÉ-CONDIÇÃO** | `E7A` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | `uid`/`gid` = `10364` em tudo; modos conforme §2.2 (arquivos `0600`/`0660`; os três topos `0771`; intermediários `0700`). |
| **PASS** | *Ownership* e grupo exatos **e** modos funcionalmente suficientes para o app ler/escrever — sobre um domínio de `22` provado **por identidade de `relpath`**, não por contagem. |
| **STOP** | Conteúdo correto **mas** modos necessários ao acesso do app divergentes ⇒ `R2P1_STOP_ENTRY_RESET_FAILED`. Também `STOP`: árbitro com linha fora de `6` campos (`Assert-Projecao`); `POST` diferente dos `22` selados; `PRE` que não cobre os `22`; tabela §2.2 diferente dos `22`. **`chmod` corretivo silencioso é PROIBIDO na primeira prova** — ela existe justamente para medir o comportamento real do mecanismo. |
| **EVIDÊNCIA** | **árbitro** `$RST\07B_MODE_POST.txt` (**`6` campos — sem `%s`, sem `%Y`**) · **diagnóstico** `…\07B_MODE_POST_BRUTO.txt` (`8` campos, com `mtime`) · `…\07B_MODE_POST_PROJECAO.txt` · `…\07B_MODE_POST_IDENTIDADE.txt` · `…\07B_MODE_PRE_COBERTURA.txt` · `…\07B_MODE_TABELA_IDENTIDADE.txt` · `…\07B_MODE_DOMINIO.txt` · `…\07B_MODE_DIFF.txt` |
| **RODADA** | Escreve em `$RST` — `round01` na rodada `1`, `round02` na rodada `2`. Compara `POST` com o `PRE` **da própria rodada** (`$A4B`, também sob `$RST`). |

```powershell
[void](Set-Passo 'E7B')         # escritor 5/6 de $PASSO_CORRENTE (2.6 / 5.0)

$A7B     = "$RST\07B_MODE_POST.txt"
$A7B_BR  = "$RST\07B_MODE_POST_BRUTO.txt"
$A7B_DIF = "$RST\07B_MODE_DIFF.txt"
$A7B_DOM = "$RST\07B_MODE_DOMINIO.txt"

# ---- captura POS: MESMO comando, MESMO formato e MESMAS guardas de E4B.
#      A linha de 8 campos vai para o BRUTO; o ARBITRO recebe a PROJECAO de 6 (A-7).
foreach ($rel in $ALVOS_POS) {
    $linha = (& $ADB -s $SERIAL shell run-as $PKG stat -c $FMT_BRUTO -- $rel) -join ' '
    $ec    = $LASTEXITCODE
    "$rel|EXIT=$ec|$($linha.Trim())" | Out-File -LiteralPath $A7B_BR -Append -Encoding utf8
    if ($ec -ne 0)                   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $t = $linha.Trim()
    if ($t.Length -eq 0)             { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $c8 = $t.Split(':')
    if ($c8.Count -ne 8)             { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    (New-Projecao $c8) | Out-File -LiteralPath $A7B -Append -Encoding utf8
}

# BRUTO com escritor e prova positiva: ausencia e STOP no PRODUTOR.
[void](Assert-Evidencia $A7B_BR $ALVOS_POS.Count)

# PROVA LITERAL DE 'MTIME_CAN_STOP = NAO' DO LADO POST.
[void](Assert-Projecao $A7B $ALVOS_POS.Count "$RST\07B_MODE_POST_PROJECAO.txt")

# ---- projecao: SOMENTE metadado estrutural. 'bytes' e 'mtime' nem chegam aqui --
#      eles ficaram no arquivo *_BRUTO.txt, que NENHUM caminho de STOP le.
#      O leitor REJEITA linha mal formada em vez de produzir campos nulos silenciosos.
function Import-Meta {
    param([string]$Arquivo)
    if (-not (Test-Path -LiteralPath $Arquivo)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $h = @{}
    foreach ($ln in @(Get-Content -LiteralPath $Arquivo |
                      ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })) {
        $c = $ln.Split(':')                      # 0=%n 1=%a 2=%u 3=%g 4=%U 5=%G
        if ($c.Count -ne 6)                     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        if ($c[0].Length -eq 0)                 { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        if ($c[1] -notmatch '^[0-7]{3,4}$')     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        if ($c[2] -notmatch '^[0-9]+$')         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        if ($c[3] -notmatch '^[0-9]+$')         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        $h[$c[0]] = [pscustomobject]@{
            Modo = $c[1]; Uid = $c[2]; Gid = $c[3]; Uname = $c[4]; Gname = $c[5]
            Chave = ($c[1] + ':' + $c[2] + ':' + $c[3] + ':' + $c[4] + ':' + $c[5])
        }
    }
    if ($h.Count -eq 0)                         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    return $h
}

# =========================================================================
# PROVA DO DOMINIO -- antes de comparar UM UNICO VALOR de metadado
# =========================================================================
$mdPre = Import-Meta $A4B
$mdPos = Import-Meta $A7B
$MD_PRE_COUNT  = [int](Assert-Colecao @($mdPre.Keys) $ALVOS_META.Count)
$MD_POST_COUNT = [int](Assert-Colecao @($mdPos.Keys) $ALVOS_POS.Count)

# ---- IGUALDADE onde o invariante e igualdade (BLOCO F / regra A-5):
#      POST tem de ser EXATAMENTE os 22 selados, por nome.
[void](Assert-Identidade @($mdPos.Keys) $ALVOS_POS 22 "E7B.POST_IGUAL_A_22.R$RODADA" `
                         "$RST\07B_MODE_POST_IDENTIDADE.txt")

# ---- SUBCONJUNTO com a condicao previa PROVADA: PRE cobre os 22 selados.
$mdSemPar = @($mdPos.Keys | Where-Object { -not $mdPre.ContainsKey($_) })
if ($mdSemPar.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

$mdPreNosSelados = @($ALVOS_POS | Where-Object { $mdPre.ContainsKey($_) })
[void](Assert-Identidade $mdPreNosSelados $ALVOS_POS 22 "E7B.PRE_COBRE_OS_22.R$RODADA" `
                         "$RST\07B_MODE_PRE_COBERTURA.txt")

# ---- e a tabela selada de 2.2 tambem e provada identica aos 22, nao apenas contada.
[void](Assert-Identidade @($MODO_ESPERADO.Keys | ForEach-Object { $_.TrimEnd('/') }) `
                         @($ALVOS_POS | ForEach-Object { $_.TrimEnd('/') }) 22 `
                         "E7B.TABELA_2_2_IGUAL_A_22.R$RODADA" `
                         "$RST\07B_MODE_TABELA_IDENTIDADE.txt")

$MD_DOMINIO    = @($mdPos.Keys | Where-Object { $mdPre.ContainsKey($_) } | Sort-Object)
$MD_DOM_COUNT  = [int](Assert-Colecao $MD_DOMINIO $MD_POST_COUNT)
if ($MD_DOM_COUNT -ne 22) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

@(
  "MODE_DOMINIO"
  "RODADA=$RODADA"
  "PRE_ARQUIVO=$A4B"
  "POST_ARQUIVO=$A7B"
  "PRE_E_POST_NA_MESMA_RAIZ=SIM"
  "ARBITRO_CAMPOS=6"
  "ARBITRO_CONTEM_MTIME=NAO"
  "PRE_META_COUNT=$MD_PRE_COUNT"
  "PRE_META_COUNT_ESPERADO=$($ALVOS_META.Count)"
  "POST_META_COUNT=$MD_POST_COUNT"
  "POST_META_COUNT_ESPERADO=$($ALVOS_POS.Count)"
  "POST_IGUAL_AOS_22_SELADOS=SIM"
  "PRE_COBRE_OS_22_SELADOS=SIM"
  "TABELA_2_2_IGUAL_AOS_22=SIM"
  "DOMINIO_COMPARACAO=$MD_DOM_COUNT"
  "DOMINIO_ESPERADO=22"
  "POST_SEM_PAR_EM_PRE=0"
  "TABELA_BASELINE_ENTRADAS=22"
  "PROVA=IDENTIDADE_POR_RELPATH"
  "META_EMPTY_PASS_VECTOR=NONE"
) | Set-Content -LiteralPath $A7B_DOM -Encoding utf8
[void](Assert-Evidencia $A7B_DOM 20)

# =========================================================================
# SO AGORA os VALORES sao comparados
# =========================================================================
$mdDiff = @()
foreach ($k in $MD_DOMINIO) {
    $p = $mdPos[$k]

    # (a) contra MODE_PRE, no dominio provado, somente modo/uid/gid/uname/gname
    if ($mdPre[$k].Chave -cne $p.Chave) {
        $mdDiff += "DIVERGE_VS_PRE|$k|PRE=$($mdPre[$k].Chave)|POS=$($p.Chave)"
    }

    # (b) contra a tabela de modos da baseline (2.2) -- as 22 entradas PRECISAM constar
    if (-not $MODO_ESPERADO.ContainsKey($k)) {
        $mdDiff += "SEM_MODO_ESPERADO|$k|POS=$($p.Modo)"
    } elseif ($MODO_ESPERADO[$k] -ne $p.Modo) {
        $mdDiff += "DIVERGE_VS_BASELINE|$k|ESPERADO=$($MODO_ESPERADO[$k])|POS=$($p.Modo)"
    }

    # (c) requisito funcional: dono e grupo do app
    if ($p.Uid -ne "$UID_ESP" -or $p.Gid -ne "$GID_ESP") {
        $mdDiff += "OWNERSHIP|$k|uid=$($p.Uid)|gid=$($p.Gid)"
    }

    # (d) ACESSO DO DONO: exigir leitura E escrita, isto e, os DOIS bits de '6'.
    #     O digito do dono e o ANTEPENULTIMO: vale para '660' e tambem para '2771'.
    $digDono = [int]$p.Modo.Substring($p.Modo.Length - 3, 1)
    if (($digDono -band 6) -ne 6) {
        $mdDiff += "ACESSO_DONO|$k|modo=$($p.Modo)|digito_dono=$digDono|exigido=rw"
    }
}
$mdDiff | Out-File -LiteralPath $A7B_DIF -Encoding utf8
if (@($mdDiff).Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

> ### ⛔ Correção de auditoria — o teste de acesso do dono estava **frouxo**
>
> A redação anterior era `if ([int]$p.Modo.Substring(0,1) -band 6) { } else { … }`. Dois defeitos
> reais, ambos silenciosos:
>
> | defeito | consequência |
> |---|---|
> | `-band 6` usado como **verdade**, não como igualdade | o dígito `4` (`r--`) dá `4 -band 6 = 4`, que é **verdadeiro** ⇒ um arquivo **somente-leitura para o dono** passava no teste de "leitura **e** escrita". O dígito `2` (`-w-`) também passava. |
> | `Substring(0,1)` como dígito do dono | correto para `660`, **errado** para modo de quatro dígitos (`2771` ⇒ leria `2`, o bit `setgid`, e não `7`) |
>
> A forma correta exige os **dois** bits: **`($digDono -band 6) -ne 6` ⇒ divergência**, com o
> dígito lido do **antepenúltimo** caractere, que é o dígito do dono em `%a` de três **ou** de
> quatro posições.
>
> **`MODE_4XX_MUST_NOT_PASS_OWNER_RW_CHECK = SIM`** — verificável por leitura: `4 -band 6` é `4`,
> e `4 -ne 6` é verdadeiro, logo modo `4xx` **produz divergência** e, com ela, `STOP`.

> **Comparação de três vias, explicitamente separadas** — `(a)` contra `MODE_PRE`, `(b)` contra
> a tabela de modos da baseline (§2.2), `(c)` contra o requisito funcional de acesso do app. As
> três produzem rótulos distintos no `DIFF` para que o auditor saiba **qual** propriedade
> falhou, e não apenas *que* algo falhou.
>
> **`%s` e `%Y` não ficam apenas "fora da chave" — eles não existem no árbitro.** Esta é a
> diferença entre `DESIGN_02` e `DESIGN_03`. Antes, a linha gravada em `07B_MODE_POST.txt` era a
> saída **inteira** de `stat`, de `8` campos; a chave de igualdade descartava `%s` e `%Y`, mas
> `I9` comparava o **arquivo**, e o arquivo carregava o `mtime`. Bastava uma restauração produzir
> um `mtime` diferente da outra — comportamento **legítimo** — para `I9` derrubar a execução.
> Agora `07B_MODE_POST.txt` recebe a **projeção** de `6` campos (`New-Projecao`, regra `A-7`) e
> `Assert-Projecao` **relê o arquivo gravado** exigindo `6` campos em toda linha: uma linha de
> `8` campos é `STOP` no próprio passo que a produziu. `%s` e `%Y` continuam **capturados e
> registrados** — em `07B_MODE_POST_BRUTO.txt`, cujo único leitor é `E7C`, que não tem `throw`.
>
> Tamanho já é medido pelo comparador selado no item `14`; repeti-lo aqui criaria um segundo gate
> de conteúdo, não autorizado. `mtime` é **`DIAGNOSTIC_ONLY`** (§3.2).
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
| **SAÍDA ESPERADA** | `mtime` de cada uma das `22` entradas; esperado o valor da baseline (§2.2), pois `tar` restaura `mtime`. |
| **PASS** | **Sempre registra; nunca reprova.** `MTIME_GATE = DIAGNOSTIC_ONLY`. |
| **STOP** | **Nenhum.** `mtime` divergente, com conteúdo, estrutura e demais condições válidas, **não** é motivo autônomo de reprovação e **não** pode, sozinho, produzir `R2P1_STOP_ENTRY_BASELINE_DIVERGED`. |
| **EVIDÊNCIA** | `$RST\07C_MTIME.txt` |
| **RODADA** | Escreve em `$RST`. Terminal: **nenhum** passo posterior — inclusive `I9` — lê este arquivo. |

```powershell
[void](Set-Passo 'E7C')         # escritor 6/6 de $PASSO_CORRENTE (2.6 / 5.0)

# ---------------------------------------------------------------------------
# UNICO consumidor de '%Y' no desenho inteiro -- e ele nao arbitra nada.
# Regra A-7: o mtime NAO existe nos arquivos ARBITROS ($A4B / $A7B, 6 campos).
# Ele so existe nos *_BRUTO.txt, e este passo -- que nao tem 'throw', nao tem
# 'if' de reprovacao e nao tem valor esperado -- e o unico que os le.
# ---------------------------------------------------------------------------
function Read-MtimeBruto {
    param([string]$Arquivo)
    $h = @{}
    if (-not (Test-Path -LiteralPath $Arquivo)) { return $h }   # diagnostico: nunca reprova
    foreach ($ln in @(Get-Content -LiteralPath $Arquivo |
                      ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })) {
        $partes = $ln.Split('|')
        if ($partes.Count -lt 3) { continue }
        $c = $partes[$partes.Count - 1].Split(':')
        if ($c.Count -ne 8)      { continue }
        $h[$c[0]] = $c[7]                                        # %n -> %Y
    }
    return $h
}

$mtPre = Read-MtimeBruto $A4B_BR
$mtPos = Read-MtimeBruto $A7B_BR

foreach ($k in ($mdPos.Keys | Sort-Object)) {
    $eAnt = if ($mtPre.ContainsKey($k)) { $mtPre[$k] } else { '-' }
    $eDep = if ($mtPos.ContainsKey($k)) { $mtPos[$k] } else { '-' }
    $utc  = if ($eDep -match '^[0-9]+$') {
                [DateTimeOffset]::FromUnixTimeSeconds([int64]$eDep).UtcDateTime.ToString('yyyy-MM-dd HH:mm:ss')
            } else { '-' }
    "$k|PRE=$eAnt|POS=$eDep|POS_UTC=$utc" |
        Out-File -LiteralPath "$RST\07C_MTIME.txt" -Append -Encoding utf8
}
```

Sinal diagnóstico de alto valor: um `mtime` "de agora" em qualquer das `22` entradas indica um
arquivo que **não** veio do TAR. Isso **motiva investigação**, não reprovação automática.

> **O passo não contém nenhum `throw`, nenhum `if` de reprovação e nenhuma comparação com
> valor esperado — deliberadamente.** É assim que `MTIME_GATE = DIAGNOSTIC_ONLY` deixa de ser
> uma promessa textual e passa a ser uma propriedade verificável do procedimento: não existe,
> em lugar algum do desenho, caminho de código pelo qual `mtime` produza `STOP`.
>
> **`E7C` é o único leitor de `%Y` do documento inteiro** — e lê os `*_BRUTO.txt`, nunca os
> árbitros. A varredura que sustenta essa afirmação está em §13.4: `%Y` aparece em `$FMT_BRUTO`
> (produção), nos dois `*_BRUTO.txt` (registro) e em `Read-MtimeBruto` (leitura diagnóstica) —
> e em mais lugar nenhum. `Read-MtimeBruto` devolve mapa vazio se o arquivo faltar, o que aqui
> **não** é um vetor de falso `PASS`: os dois `*_BRUTO.txt` têm `Assert-Evidencia` **no
> produtor** (`E4B` e `E7B`), de modo que a ausência já teria produzido `STOP` antes — e este
> passo, por decisão, não arbitra coisa alguma.
>
> **Exceção declarada à regra `A-1` (§2.6), e a única do documento.** Todo outro caminho de
> evidência recebe `Assert-Evidencia`. `07C_MTIME.txt` **não** recebe — de propósito. Incluir a
> asserção introduziria um `throw` dentro de `E7C` e enfraqueceria a propriedade estrutural
> acima. O critério que torna a exceção segura é objetivo e verificável: **`07C_MTIME.txt` não é
> consumido por nenhum passo posterior**. Ele é terminal, puramente forense. A regra `A-1` existe
> para impedir que um passo **dependa** de evidência inexistente; onde não há dependência, não há
> o que proteger. **`MTIME_CAN_STOP = NÃO` permanece integral.**

---

### Item `13` — Capturar o TAR de entrada canônico

| campo | valor |
|---|---|
| **OBJETIVO** | Item canônico do protocolo, **inalterado**. Fotografar o estado restaurado. |
| **PRÉ-CONDIÇÃO** | `E7C` concluído · `pidof` **vazio** (reconfirmado). |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | TAR novo no `HOST`; `bytes`, `SHA256` e listagem registrados. **Nenhum TAR dentro do aparelho.** |
| **PASS** | `pidof` **vazio** · `EXIT = 0` · *stderr* vazio · TAR íntegro · **22 entradas** · `13_TAR_META.txt` gravado e validado. |
| **STOP** | Falha de captura dentro da janela de reset ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` (§6: **recaptura proibida**). |
| **EVIDÊNCIA** | `$EXEC\acervo\TAR-ENTRY-POS-RESET.tar` · `…\13_TAR_META.txt` · `…\13_TAR_LISTAGEM.txt` · `…\13_TAR_STDERR.txt` · `…\13_PIDOF.txt` |

```powershell
$T       = "$EXEC\acervo\TAR-ENTRY-POS-RESET.tar"
$T_META  = "$EXEC\acervo\13_TAR_META.txt"
$T_LIST  = "$EXEC\acervo\13_TAR_LISTAGEM.txt"
$T_ERR   = "$EXEC\acervo\13_TAR_STDERR.txt"
$T_PID   = "$EXEC\acervo\13_PIDOF.txt"

# ---- app parado: CONDICAO REAL, nao comentario.
#      O exit de 'pidof' e CAPTURADO e REGISTRADO, mas NAO arbitrado -- 'pidof'
#      devolve 1 justamente quando nao ha processo, que e o caso de PASS.
#      Excecao X-2 das CINCO declaradas da regra A-3 (tabela C de 13.3.1).
$pid13    = @(& $ADB -s $SERIAL shell pidof com.valentedev.pequenostracosdefe |
              ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
$pid13_ec = $LASTEXITCODE
@(
  "PIDOF_LINHAS=$($pid13.Count)"
  "PIDOF_EXIT=$pid13_ec"
  "PIDOF_EXIT_E_GATE=NAO"
) | Set-Content -LiteralPath $T_PID -Encoding utf8
[void](Assert-Evidencia $T_PID 3)
if ($pid13.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ exec-out run-as com.valentedev.pequenostracosdefe tar -c databases files shared_prefs > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\acervo\TAR-ENTRY-POS-RESET.tar 2> C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\acervo\13_TAR_STDERR.txt"
$t_exit = $LASTEXITCODE

# Regra A-4: stderr SO e lido por Assert-Stderr. Ausencia do arquivo e STOP,
# nunca colecao vazia -- '2> arquivo' sob cmd.exe /c CRIA o arquivo mesmo vazio.
$t_err_n = [int](Assert-Stderr $T_ERR 'ITEM13.TAR_POS_RESET')
if ($t_exit -ne 0)                     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not (Test-Path -LiteralPath $T))  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

$t_len = (Get-Item     -LiteralPath $T).Length
$t_sha = (Get-FileHash -LiteralPath $T -Algorithm SHA256).Hash
if ($t_len -le 0)                          { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($t_sha -notmatch '^[0-9A-F]{64}$')     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

tar -tvf $T | Out-File -LiteralPath $T_LIST -Encoding utf8
$t_ec_list = $LASTEXITCODE
if ($t_ec_list -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$t_itens = [int](Assert-Evidencia $T_LIST 22)
if ($t_itens -ne 22)  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---- indicador corroborante, REGISTRADO mas NAO usado como gate (ver nota abaixo)
$t_identico = [bool]($t_sha -eq $BASE_SHA)

@(
  "TAR_ENTRY_POS_RESET_META"
  "EXEC_ROOT=$EXEC"
  "TAR_PATH=$T"
  "TAR_BYTES=$t_len"
  "TAR_SHA256=$t_sha"
  "TAR_ENTRADAS=$t_itens"
  "TAR_ENTRADAS_ESPERADAS=22"
  "TAR_EXIT=$t_exit"
  "TAR_STDERR_ARQUIVO=$T_ERR"
  "TAR_STDERR_PROVA=$T_ERR.PROVA.txt"
  "TAR_STDERR_LINHAS=$t_err_n"
  "PIDOF_LINHAS=0"
  "PIDOF_EXIT=$pid13_ec"
  "PIDOF_EXIT_E_GATE=NAO"
  "IDENTICO_A_BASE_SHA=$t_identico"
  "IDENTICO_E_GATE=NAO"
) | Set-Content -LiteralPath $T_META -Encoding utf8
[void](Assert-Evidencia $T_META 16)
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
| **EVIDÊNCIA** | `$EXEC\acervo\14_POS-RESET-vs-BASELINE.txt` · `…\14_VEREDITO.txt` |

```powershell
$A14     = "$EXEC\acervo\14_POS-RESET-vs-BASELINE.txt"
$A14_VER = "$EXEC\acervo\14_VEREDITO.txt"
$PRX     = "$EXEC\acervo\POS-RESET-EXTRACTED"

New-Item -ItemType Directory -Force $PRX | Out-Null
tar -xf "$EXEC\acervo\TAR-ENTRY-POS-RESET.tar" -C $PRX
$a14_ec_tar = $LASTEXITCODE
if ($a14_ec_tar -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

python $CMP $BASE_REF $PRX $A14
$a14_ec_cmp = $LASTEXITCODE
if ($a14_ec_cmp -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

$G = Read-Comparador $A14

# ESCOPO_OK=NAO nao e "reprovacao do gate": e incomparabilidade. Token distinto (3.3).
if ($G.CHAVES['ESCOPO_OK'] -ne 'SIM') { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# Os SETE contadores em ZERO -- verificados um a um, e nao pela leitura do agregado.
$a14Zero = @()
foreach ($ch in @('FILES_ADDED','FILES_CHANGED','FILES_DELETED',
                  'KEYS_ADDED','KEYS_CHANGED','KEYS_DELETED','KEYS_ROWID_MOVED')) {
    if ([int]$G.CHAVES[$ch] -ne 0) { $a14Zero += "NAO_ZERO|$ch=$($G.CHAVES[$ch])" }
}
$a14_pass = ($a14Zero.Count -eq 0 -and $G.CHAVES['ENTRY_STATE_RESULT'] -eq 'PASS')

@(
  "14_VEREDITO"
  "TAR_EXTRACAO_EXIT=$a14_ec_tar"
  "COMPARADOR_EXIT=$a14_ec_cmp"
  "ESCOPO_OK=$($G.CHAVES['ESCOPO_OK'])"
  "FILES_ADDED=$($G.CHAVES['FILES_ADDED'])"
  "FILES_CHANGED=$($G.CHAVES['FILES_CHANGED'])"
  "FILES_DELETED=$($G.CHAVES['FILES_DELETED'])"
  "KEYS_ADDED=$($G.CHAVES['KEYS_ADDED'])"
  "KEYS_CHANGED=$($G.CHAVES['KEYS_CHANGED'])"
  "KEYS_DELETED=$($G.CHAVES['KEYS_DELETED'])"
  "KEYS_ROWID_MOVED=$($G.CHAVES['KEYS_ROWID_MOVED'])"
  "ENTRY_STATE_RESULT=$($G.CHAVES['ENTRY_STATE_RESULT'])"
  "CONTADORES_NAO_ZERO=$($a14Zero.Count)"
  "ENTRY_GATE=$(if ($a14_pass) { 'PASS' } else { 'STOP' })"
) + $a14Zero | Set-Content -LiteralPath $A14_VER -Encoding utf8
[void](Assert-Evidencia $A14_VER 14)

# Restauracao ja declarada completa e TAR integro: o token e o de baseline divergente.
if (-not $a14_pass) { throw 'R2P1_STOP_ENTRY_BASELINE_DIVERGED' }
```

> **Os dois tokens de `STOP` deste passo são distintos e a escolha é executável, não editorial.**
> `ESCOPO_OK = NAO` significa que as duas capturas **nem são comparáveis** — o token é
> `R2P1_STOP_ENTRY_RESET_FAILED` (§3.3) e ele é lançado **antes** de qualquer contagem. Só
> depois de `ESCOPO_OK = SIM` provado é que uma divergência de conteúdo pode significar
> `R2P1_STOP_ENTRY_BASELINE_DIVERGED`. A ordem dos dois `if` **é** a regra §3.3.

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
| **EVIDÊNCIA** | `$EXEC\acervo\E8_POS-RESET-vs-ARTEFATO30.txt` · `…\E8_VEREDITO.txt` |

```powershell
$A8     = "$EXEC\acervo\E8_POS-RESET-vs-ARTEFATO30.txt"
$A8_VER = "$EXEC\acervo\E8_VEREDITO.txt"

python $CMP $A30_REF "$EXEC\acervo\POS-RESET-EXTRACTED" $A8
$a8_ec = $LASTEXITCODE
if ($a8_ec -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

$P = Read-Comparador $A8

# (1) comparabilidade
if ($P.CHAVES['ESCOPO_OK'] -ne 'SIM') { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# (2) os quatro KEYS_* em zero
foreach ($ch in @('KEYS_ADDED','KEYS_CHANGED','KEYS_DELETED','KEYS_ROWID_MOVED')) {
    if ([int]$P.CHAVES[$ch] -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

# (3) nada acrescentado, nada apagado
if ([int]$P.CHAVES['FILES_ADDED']   -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ([int]$P.CHAVES['FILES_DELETED'] -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# (4) 8/8: NENHUM caminho de produto pode estar entre os alterados.
#     O teste e por INTERSECAO nomeada, nao pela contagem 'FILES_CHANGED=5' --
#     cinco divergencias tambem seriam cinco se fossem as cinco ERRADAS.
$a8Prod = @()
foreach ($p in $PRODUTO_8) {
    if ($P.FILE_CHANGED -contains $p) { $a8Prod += "PRODUTO_CHANGED|$p" }
    if ($P.FILE_DELETED -contains $p) { $a8Prod += "PRODUTO_DELETED|$p" }
}
$a8_produto_ok = ($a8Prod.Count -eq 0)
$a8_intactas   = $PRODUTO_8.Count - $a8Prod.Count

@(
  "E8_VEREDITO"
  "COMPARADOR_EXIT=$a8_ec"
  "ESCOPO_OK=$($P.CHAVES['ESCOPO_OK'])"
  "FILES_ADDED=$($P.CHAVES['FILES_ADDED'])"
  "FILES_CHANGED=$($P.CHAVES['FILES_CHANGED'])"
  "FILES_DELETED=$($P.CHAVES['FILES_DELETED'])"
  "KEYS_ADDED=$($P.CHAVES['KEYS_ADDED'])"
  "KEYS_CHANGED=$($P.CHAVES['KEYS_CHANGED'])"
  "KEYS_DELETED=$($P.CHAVES['KEYS_DELETED'])"
  "KEYS_ROWID_MOVED=$($P.CHAVES['KEYS_ROWID_MOVED'])"
  "ENTRY_STATE_RESULT=$($P.CHAVES['ENTRY_STATE_RESULT'])"
  "INVARIANTES_PRODUTO_INTACTAS=$a8_intactas/8"
  "POST_RESET_PRODUCT_INVARIANTS=$(if ($a8_produto_ok) { 'PASS' } else { 'STOP' })"
) + $a8Prod + @($P.FILE_CHANGED | ForEach-Object { "CHANGED|$_" }) |
    Set-Content -LiteralPath $A8_VER -Encoding utf8
[void](Assert-Evidencia $A8_VER 13)

if (-not $a8_produto_ok)  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($a8_intactas -ne 8)   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

> ⛔ **Correção de auditoria — `E8` é o passo que declara o reset concluído.** Ele terminava em
> `Get-Content`. O `ENTRY_STATE_RESULT` **esperado** aqui é `STOP` (as cinco divergências de
> infra conhecidas), de modo que **nenhuma leitura automática ingênua serviria** — e era
> exatamente por isso que a conferência havia sido deixada para o olho humano. A saída agora é
> lida como estrutura e o veredito é a **interseção nomeada com `$PRODUTO_8`**: `8/8` provado
> por caminho, não por contagem.

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

### `RB` — como o *rollback* é **acionado** (a linha que faltava)

> ### ⛔ Correção de auditoria — o acionamento do *rollback* **não existia**
>
> `DESIGN_02` descrevia `RB0`…`RB7` e, em `RB0`, lia `$ROLLBACK_PASSO` e `$ROLLBACK_MOTIVO` com
> `Get-Variable … -ErrorAction SilentlyContinue`. **Nenhuma linha do documento escrevia essas
> duas variáveis.** Consequência literal: em toda e qualquer execução, `RB0` gravaria
> `PASSO_QUE_FALHOU=NAO_INFORMADO` e `MOTIVO=NAO_INFORMADO` — dois campos que **parecem**
> informação, passam em `Assert-Evidencia … 10` e não dizem nada. Pior: **não havia linha alguma
> que transferisse o controle** de um `throw` da janela destrutiva para `RB0`. O *rollback* era,
> na prática, um capítulo que ninguém chamava.
>
> A emenda materializa as três peças que faltavam: o **escritor** (`Set-CausaRollback`, §`2.6`),
> o **rastreador de passo** (`Set-Passo`, uma linha literal no topo de cada passo da janela) e o
> **acionador** (o `try/catch` abaixo). `ROLLBACK_DISCIPLINE_COMPLETE = SIM` passa a ser
> verificável por leitura, não por confiança.

```powershell
# =========================================================================
# 5.0  JANELA DESTRUTIVA -- o UNICO ponto de entrada do rollback.
#      Tudo de E5 ate E7C corre aqui dentro. Um 'throw' em qualquer um
#      desses passos cai NESTE catch, que grava a causa e executa RB0..RB7.
#      Fora desta janela nao ha rollback: antes de E5 nada foi mutado, e
#      depois de E7C a janela ja fechou (item 13 em diante e READ-ONLY).
# =========================================================================
$ROLLBACK_ACIONADO = $false

try {
    # E5 -> E6 -> E7 -> E7A -> E7B -> E7C, na ordem, com os blocos literais
    # das secoes anteriores. Cada um comeca com a sua linha 'Set-Passo'.
    # (Na rodada 2, o mesmo bloco roda de novo, depois de I4.)
}
catch {
    $ROLLBACK_ACIONADO = $true
    [void](Set-CausaRollback $PASSO_CORRENTE $_.Exception.Message)

    # ROLLBACK_ATTEMPTS = 1 -- este catch nao e reentrante:
    if ($ROLLBACK_JA_EXECUTADO) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $ROLLBACK_JA_EXECUTADO = $true

    try {
        # RB0 .. RB7, na ordem, sem desvio e sem segunda tentativa.
        # A ultima linha de RB7 e, ela propria, o throw terminal.
    }
    catch {
        # ---------------------------------------------------------------
        # LACRE DE ROLLBACK INTERROMPIDO.
        # RB1, RB2, RB3 e RB4 PODEM lancar -- e devem: sao as barreiras que
        # impedem restaurar a partir de meta adulterado ou de lista invalida.
        # Mas um throw ali sairia do catch SEM passar por RB7, e a execucao
        # terminaria sem lacre algum. Isso tornaria 'ROLLBACK_DISCIPLINE_
        # COMPLETE = SIM' falso na pratica: existiria caminho real de termino
        # sem arquivo de veredito. Este bloco fecha esse caminho SEM afrouxar
        # nenhuma barreira -- os throws de RB1..RB4 continuam existindo e
        # continuam interrompendo o rollback; o que muda e que agora eles
        # deixam registro.
        # NAO e segunda tentativa: nada e reexecutado, nada e mutado aqui.
        # ---------------------------------------------------------------
        $RBIF = "$RSTC\RB_INTERROMPIDO_LACRE.txt"
        @(
          "RB_INTERROMPIDO_LACRE"
          "EXEC_ROOT=$EXEC"
          "RODADA=$RODADA"
          "VEREDITO=R2P1_STOP_ENTRY_RESET_FAILED"
          "ROLLBACK_ACIONADO=SIM"
          "ROLLBACK_CONCLUIDO=NAO"
          "ROLLBACK_ATTEMPTS=1"
          "ROLLBACK_RESULT=INDETERMINATE"
          "DEVICE_STATE=INDETERMINATE"
          "PASSO_CORRENTE_NA_INTERRUPCAO=$PASSO_CORRENTE"
          "EXCECAO_DO_ROLLBACK=$($_.Exception.Message)"
          "RB7_ALCANCADO=NAO"
          "ITEM_13_INICIADO=NAO"
          "PROXIMA_ACAO=HUMAN_GATE"
        ) | Set-Content -LiteralPath $RBIF -Encoding utf8
        [void](Assert-Evidencia $RBIF 14)

        throw 'R2P1_STOP_ENTRY_RESET_FAILED'
    }
}
```

> **Por que existem `RB7_VEREDITO_FINAL.txt` e `RB_INTERROMPIDO_LACRE.txt`, e nunca os dois.**
> `RB7` lacra o *rollback* que **chegou ao fim** — com `ROLLBACK_RESULT` classificado por `RB5`.
> `RB_INTERROMPIDO_LACRE.txt` lacra o *rollback* que **foi interrompido por uma de suas próprias
> barreiras** (`RB1` meta divergente, `RB2` enumeração quebrada, `RB3` lista inválida, `RB4` falha
> de extração). São estados **mutuamente exclusivos**: se `RB7` executou, o `catch` interno nunca
> foi alcançado; se o `catch` interno gravou, `RB7` não rodou e o arquivo dele não existe. Em
> **ambos** os desfechos existe arquivo de veredito, e em ambos o resultado é
> `R2P1_STOP_ENTRY_RESET_FAILED` — jamais `PASS`.

> **`$PASSO_CORRENTE` tem escritor em seis lugares literais** — uma linha `[void](Set-Passo 'E5')`
> no topo de `E5`, e as equivalentes em `E6`, `E7`, `E7A`, `E7B` e `E7C`. Não é convenção verbal:
> se a linha não estiver lá, `$PASSO_CORRENTE` mantém o valor do passo anterior, e `RB0` registra
> um passo **errado** — por isso as seis linhas estão escritas, uma a uma, nos blocos respectivos.
> Fora da janela, o próprio *rollback* também marca posição: `RB0`, `RB6` e `RB7` têm suas
> chamadas literais de `Set-Passo`. **Total no documento: `9` pontos de chamada** — `6` na janela
> destrutiva e `3` no *rollback* —, todos conferíveis por busca textual por `[void](Set-Passo`.
>
> **O que este `catch` deliberadamente não faz:** não tenta reexecutar o passo que falhou, não
> reabre a janela, não chama `force-stop`, não recaptura TAR e não decide nada sozinho. Ele
> **registra** e **entrega** ao procedimento `RB0`…`RB7`, cujo desfecho é sempre `RB7`.

### `RB0` — Interromper e registrar

| campo | valor |
|---|---|
| **OBJETIVO** | Congelar a sequência principal e registrar a condição observada. |
| **TIPO** | `READ-ONLY` |
| **PASS/STOP** | Não se aplica; é registro. **NÃO iniciar o item `13`.** |
| **EVIDÊNCIA** | `$RSTC\RB0_CONDICAO_OBSERVADA.txt` |

```powershell
$RB0F = "$RSTC\RB0_CONDICAO_OBSERVADA.txt"

[void](Set-Passo 'RB0')

# As duas variaveis TEM ESCRITOR: 'Set-CausaRollback', chamada pelo catch de 5.0
# imediatamente antes de RB0. Ler com Get-Variable -SilentlyContinue era encobrir
# a ausencia do escritor; agora a leitura e direta e a AUSENCIA e condicao real.
$rb0_passo  = "$ROLLBACK_PASSO".Trim()
$rb0_motivo = "$ROLLBACK_MOTIVO".Trim()
$rb0_causa_ok = (($rb0_passo -ne '') -and ($rb0_motivo -ne ''))
if ($rb0_passo  -eq '') { $rb0_passo  = 'NAO_INFORMADO' }
if ($rb0_motivo -eq '') { $rb0_motivo = 'NAO_INFORMADO' }

@(
  "RB0_CONDICAO_OBSERVADA"
  "EXEC_ROOT=$EXEC"
  "RODADA=$RODADA"
  "PASSO_QUE_FALHOU=$rb0_passo"
  "MOTIVO=$rb0_motivo"
  "CAUSA_REGISTRADA_POR_ESCRITOR=$(if ($rb0_causa_ok) { 'SIM' } else { 'NAO' })"
  "ESCRITOR_DA_CAUSA=Set-CausaRollback"
  "ACIONADOR=SECAO_5.0_CATCH"
  "JANELA_DESTRUTIVA_INICIADA=SIM"
  "ITEM_13_INICIADO=NAO"
  "RECAPTURA_DE_TAR=PROIBIDA"
  "ROLLBACK_ATTEMPTS_PERMITIDAS=1"
  "DEVICE_STATE=INDETERMINATE"
  "CARIMBO_DIAGNOSTICO=$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))"
) | Set-Content -LiteralPath $RB0F -Encoding utf8
[void](Assert-Evidencia $RB0F 14)

# A causa AUSENTE nao derruba o rollback -- derrubar seria perder o aparelho por
# um defeito de registro. Mas fica REGISTRADA como 'NAO', e RB7 a transporta.
$ROLLBACK_CAUSA_REGISTRADA = $(if ($rb0_causa_ok) { 'SIM' } else { 'NAO' })
```

> **O que mudou aqui e por quê.** `RB0` declarava `RB0_CONDICAO_OBSERVADA.txt` como `EVIDÊNCIA`
> e **não tinha um único bloco de comando** — era o mesmo defeito de `E2`, agravado por estar no
> caminho de *rollback*, ou seja, exatamente onde a custódia mais importa. `CARIMBO_DIAGNOSTICO`
> é **diagnóstico**, como todo carimbo de tempo deste desenho: não é comparado, não decide nada e
> **não pode gerar `STOP`**.
>
> **Emenda `DESIGN_03`.** As leituras `Get-Variable … -ErrorAction SilentlyContinue` **saíram**.
> Elas existiam para tolerar a ausência de um escritor que nunca existiu — isto é, para fazer o
> defeito parecer decisão. Agora `$ROLLBACK_PASSO` e `$ROLLBACK_MOTIVO` são inicializadas em
> §`2.6` e escritas por `Set-CausaRollback` no `catch` de §`5.0`; `RB0` as lê **direto** e grava
> `CAUSA_REGISTRADA_POR_ESCRITOR`, que é `SIM` quando o caminho normal ocorreu. A ausência
> continua **não** derrubando o *rollback* — mas agora ela é **um fato registrado**, não um
> valor-padrão indistinguível do sucesso.

### `RB1` — Provar que o *rollback* pertence a **esta** execução

| campo | valor |
|---|---|
| **OBJETIVO** | Eliminar qualquer dúvida sobre a identidade do artefato de recuperação. |
| **PRÉ-CONDIÇÃO** | `E3` concluído; `03_ROLLBACK_META.txt` e `03_ROLLBACK_LISTAGEM.txt` existem. |
| **TIPO** | `READ-ONLY` |
| **PASS** | O TAR está **dentro de `$EXEC`** (raiz exclusiva desta execução, criada em `E0` com `Test-Path = False`), o meta de `E3` **pertence a esta mesma `$EXEC`**, e **tamanho, `SHA256` e contagem de entradas recalculados agora batem com os gravados em `E3`**. |
| **STOP** | Qualquer divergência ⇒ *rollback* **inválido** ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` com `DEVICE_STATE = INDETERMINATE`. **Nenhuma remoção de `RB3` pode ocorrer sem este `PASS`.** |
| **EVIDÊNCIA** | `$RSTC\RB1_ROLLBACK_IDENTIDADE.txt` · `…\RB1_LISTAGEM.txt` |

```powershell
$RB       = "$RSTC\TAR-ROLLBACK-PRE-RESET.tar"
$RBMETA   = "$RSTC\03_ROLLBACK_META.txt"
$RB1_OUT  = "$RSTC\RB1_ROLLBACK_IDENTIDADE.txt"
$RB1_LIST = "$RSTC\RB1_LISTAGEM.txt"

# Trava consumida por RB3. So RB1, ao final e sem nenhum desvio, a levanta.
$ROLLBACK_VERIFICADO = $false

# ---- (1) o META de E3 precisa EXISTIR (RB1 nao depende de E7A ter rodado:
#          o rollback pode ser acionado ja em E5, portanto o parser e local)
if (-not (Test-Path -LiteralPath $RBMETA)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$M = @{}
foreach ($ln in @(Get-Content -LiteralPath $RBMETA |
                  ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })) {
    $i = $ln.IndexOf('=')
    if ($i -ge 1) { $M[$ln.Substring(0, $i)] = $ln.Substring($i + 1).Trim() }
}
foreach ($ch in @('EXEC_ROOT','ROLLBACK_TAR_PATH','ROLLBACK_TAR_BYTES',
                  'ROLLBACK_TAR_SHA256','ROLLBACK_TAR_ENTRADAS')) {
    if (-not $M.ContainsKey($ch))            { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ([string]::IsNullOrEmpty($M[$ch]))    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

# ---- (2) PERTENCE A ESTA EXECUCAO? tres condicoes, nenhuma declarativa
if ($M['EXEC_ROOT']         -ne $EXEC)     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($M['ROLLBACK_TAR_PATH'] -ne $RB)       { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not $RB.StartsWith($EXEC))            { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---- (3) o TAR precisa existir AGORA
if (-not (Test-Path -LiteralPath $RB))     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---- (4) RECALCULAR agora -- jamais reaproveitar numero de registro
$rb1_len = (Get-Item     -LiteralPath $RB).Length
$rb1_sha = (Get-FileHash -LiteralPath $RB -Algorithm SHA256).Hash

# ---- (5) COMPARAR DE VERDADE: tamanho e SHA256
if ($M['ROLLBACK_TAR_BYTES'] -notmatch '^[0-9]+$')      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($rb1_len -ne [long]$M['ROLLBACK_TAR_BYTES'])        { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($rb1_sha -ne $M['ROLLBACK_TAR_SHA256'])             { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---- (6) o TAR abre, lista, e a contagem bate com a de E3
tar -tf $RB | Out-File -LiteralPath $RB1_LIST -Encoding utf8
$rb1_ec = $LASTEXITCODE
if ($rb1_ec -ne 0)                                      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
# CARDINALIDADE LITERAL, nao herdada: 22 exigido AQUI, no piso e na igualdade.
# O encadeamento com o meta de E3 continua valendo, mas nao e mais a UNICA
# barreira: um meta adulterado para '1' nao compra passagem para o restore.
$rb1_itens = [int](Assert-Evidencia $RB1_LIST 22)
if ($rb1_itens -ne 22)                                  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($M['ROLLBACK_TAR_ENTRADAS'] -notmatch '^[0-9]+$')   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($rb1_itens -ne [int]$M['ROLLBACK_TAR_ENTRADAS'])    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

@(
  "RB1_ROLLBACK_IDENTIDADE"
  "EXEC_ROOT=$EXEC"
  "META_EXEC_ROOT=$($M['EXEC_ROOT'])"
  "PERTENCE_A_ESTA_EXECUCAO=SIM"
  "TAR_PATH=$RB"
  "META_TAR_PATH=$($M['ROLLBACK_TAR_PATH'])"
  "CAMINHO_CONFERE=SIM"
  "BYTES_RECALCULADO=$rb1_len"
  "BYTES_EM_E3=$($M['ROLLBACK_TAR_BYTES'])"
  "BYTES_CONFERE=SIM"
  "SHA256_RECALCULADO=$rb1_sha"
  "SHA256_EM_E3=$($M['ROLLBACK_TAR_SHA256'])"
  "SHA256_CONFERE=SIM"
  "ENTRADAS_RECALCULADO=$rb1_itens"
  "ENTRADAS_EM_E3=$($M['ROLLBACK_TAR_ENTRADAS'])"
  "ENTRADAS_CONFERE=SIM"
  "ROLLBACK_VERIFICADO=SIM"
) | Set-Content -LiteralPath $RB1_OUT -Encoding utf8
[void](Assert-Evidencia $RB1_OUT 17)

# ---- (7) SO AGORA a trava e levantada. RB3 a exige antes do primeiro 'rm'.
$ROLLBACK_VERIFICADO = $true
```

> ### ⛔ Correção de auditoria — `RB1` **compara**, não mais "deve bater"
>
> A redação anterior era literalmente:
>
> ```
> (Get-Item     $RB).Length                  # DEVE bater com E3
> (Get-FileHash $RB -Algorithm SHA256).Hash  # DEVE bater com E3
> ```
>
> Três expressões nuas e um comentário imperativo. **Nada comparava.** Pior: o `E3` **nunca havia
> gravado** os valores, de modo que o comentário mandava conferir contra um registro
> **inexistente**. Um *rollback* corrompido, truncado ou de outra execução seria restaurado
> **sem que ninguém percebesse** — e restaurado **por cima** de um estado já parcial.
>
> Agora o passo **lê `03_ROLLBACK_META.txt`**, **prova que ele pertence a esta `$EXEC`**,
> **recalcula** tamanho, `SHA256` e contagem de entradas, **compara os três** e só então levanta
> `$ROLLBACK_VERIFICADO`. `RB3` **exige essa trava antes do primeiro `rm`**.
>
> `ROLLBACK_META_PERSISTED = SIM` · `ROLLBACK_HASH_ASSERTED = SIM` · `ROLLBACK_SIZE_ASSERTED = SIM`

> **Nota de precisão sobre a contagem.** `E3` lista com `tar -tvf` (formato verboso, legível) e
> `RB1` com `tar -tf` (só nomes). **Os dois emitem exatamente uma linha por entrada**, logo a
> contagem é comparável; o que difere é a largura da linha, não a cardinalidade.

> A pertinência é **estrutural além de asseverada**: `$EXEC` é raiz nova, exclusiva desta
> execução (`E0` exige `Test-Path $EXEC = False`), logo nenhum *rollback* de outra tentativa pode
> residir nela — e, ainda assim, `RB1` confere `EXEC_ROOT` gravado contra `$EXEC` corrente, para
> que a propriedade não dependa apenas do argumento estrutural.

### `RB2` — Enumerar o estado parcial

| campo | valor |
|---|---|
| **TIPO** | `READ-ONLY` |
| **PASS** | `RB1` **verificado**; ambos os `find` com `EXIT = 0`; a listagem de diretórios **não vazia**; **toda** linha de arquivo aprovada por `Test-CaminhoSeguro`, sem raiz nua, sem *traversal*, dentro das três subárvores. |
| **STOP** | Qualquer linha inválida, qualquer `EXIT ≠ 0`, listagem de diretórios vazia ⇒ **não remover nada** ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` com `DEVICE_STATE = INDETERMINATE`. |
| **EVIDÊNCIA** | `$RSTC\RB2_ENUM_PARCIAL.txt` · `…\RB2_ENUM_PARCIAL_DIRS.txt` · `…\RB2_VALIDACAO.txt` |

```powershell
$RB2_ARQ  = "$RSTC\RB2_ENUM_PARCIAL.txt"
$RB2_DIRS = "$RSTC\RB2_ENUM_PARCIAL_DIRS.txt"
$RB2_VAL  = "$RSTC\RB2_VALIDACAO.txt"

# RB1 e pre-requisito DURO: sem rollback verificado nao se enumera para remover.
if (-not $ROLLBACK_VERIFICADO) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# Pre-criado pelo mesmo motivo de 05_POS_REMOCAO.txt: aqui a lista vazia e um
# resultado LEGITIMO, entao 'arquivo ausente' nao pode se confundir com ela.
Set-Content -LiteralPath $RB2_ARQ -Value '' -Encoding utf8

(& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f) |
    Out-File -LiteralPath $RB2_ARQ -Append -Encoding utf8
$rb2_ec_f = $LASTEXITCODE
(& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type d) |
    Out-File -LiteralPath $RB2_DIRS -Encoding utf8
$rb2_ec_d = $LASTEXITCODE
if ($rb2_ec_f -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($rb2_ec_d -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not (Test-Path -LiteralPath $RB2_ARQ))  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# As tres raizes SEMPRE sobrevivem (E5 as preserva), logo '-type d' NUNCA pode vir vazio.
# E este o teste que distingue "zero arquivos de verdade" de "canal de enumeracao quebrado".
$rb2_ndirs = [int](Assert-Evidencia $RB2_DIRS 3)

$rb2_arqs = @(Get-Content -LiteralPath $RB2_ARQ |
              ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })

$rb2Ruim = @()
foreach ($rel in $rb2_arqs) {
    if ($RAIZES -contains $rel)         { $rb2Ruim += "RAIZ_NUA|$rel";      continue }
    if (-not (Test-CaminhoSeguro $rel)) { $rb2Ruim += "INVALIDO|$rel";      continue }
    if ($RAIZES -notcontains $rel.Split('/')[0]) { $rb2Ruim += "FORA_DO_ESCOPO|$rel" }
}

@(
  "RB2_VALIDACAO"
  "FIND_ARQUIVOS_EXIT=$rb2_ec_f"
  "FIND_DIRETORIOS_EXIT=$rb2_ec_d"
  "DIRETORIOS_LISTADOS=$rb2_ndirs"
  "ARQUIVOS_LISTADOS=$($rb2_arqs.Count)"
  "LINHAS_INVALIDAS=$($rb2Ruim.Count)"
  "LISTA_VAZIA_E_LEGITIMA=SIM"
) + $rb2Ruim | Set-Content -LiteralPath $RB2_VAL -Encoding utf8
[void](Assert-Evidencia $RB2_VAL 7)

if ($rb2Ruim.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

> **Por que `ARQUIVOS_LISTADOS = 0` é legítimo aqui — e só aqui.** O *rollback* pode ser acionado
> **depois** de `E5` ter removido tudo e **antes** de `E6` gravar qualquer coisa. Nesse instante o
> estado correto do aparelho é, de fato, **zero arquivos** nas três subárvores. Aplicar
> `Assert-Colecao` à lista de arquivos criaria um `STOP` **falso** exatamente no cenário para o
> qual o *rollback* existe. A regra `A-2` continua honrada por outra via: quem prova que o canal
> de enumeração funcionou é **`Assert-Evidencia $RB2_DIRS 3`** — as três raízes sobrevivem a `E5`
> por construção, logo uma listagem de diretórios vazia só pode significar **falha de leitura**, e
> essa sim é `STOP`.

### `RB3` — Remover o conteúdo parcial ⚠️ **MUTANTE**

Mesma mecânica, mesmas barreiras e mesmas proibições de `E5` — lista explícita, `rm -f --` por
caminho único, três raízes preservadas, `cache/`, `code_cache/` e `no_backup/` intocados. E, como
em `E4` → `E5`, **a validação é integral e antecede o primeiro `rm`**.

#### `RB3.1` — Carga e validação **integral** · `READ-ONLY` · nenhum `rm` ainda

```powershell
$RB3_VAL = "$RSTC\RB3_VALIDACAO.txt"
$RB3_LOG = "$RSTC\RB3_REMOCAO_LOG.txt"

# Contador inicializado ANTES de qualquer validacao: se RB3.1 abortar, o valor
# reportado e obrigatoriamente 0, porque nenhum 'rm' chegou a ser emitido.
$FILES_DELETED_BY_RB3 = 0

if (-not $ROLLBACK_VERIFICADO) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

$rbArq = @(Get-Content -LiteralPath "$RSTC\RB2_ENUM_PARCIAL.txt" |
           ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })

$rbRuim = @()
foreach ($rel in $rbArq) {
    # (a) nenhuma raiz nua: 'databases', 'files', 'shared_prefs' NUNCA sao removidas
    if ($RAIZES -contains $rel)                  { $rbRuim += "RAIZ_NUA|$rel";       continue }
    # (b) forma valida: regex ancorada + validacao por segmento (ver 2.4)
    if (-not (Test-CaminhoSeguro $rel))          { $rbRuim += "INVALIDO|$rel";       continue }
    # (c) traversal explicito, redundante com (b) e mantido como barreira nomeada
    if ($rel -match '(^|/)\.\.(/|$)')            { $rbRuim += "TRAVERSAL|$rel";      continue }
    # (d) nada sai das tres subarvores
    if ($RAIZES -notcontains $rel.Split('/')[0]) { $rbRuim += "FORA_DO_ESCOPO|$rel"; continue }
    # (e) sem curinga, sem metacaractere: F2/F3 valem tambem no rollback
    if ($rel -match '[\s\*\?\[\]\$`;&|<>\(\)\{\}''"\\]') { $rbRuim += "METACARACTERE|$rel" }
}

@(
  "RB3_VALIDACAO"
  "LINHAS_CARREGADAS=$($rbArq.Count)"
  "LINHAS_INVALIDAS=$($rbRuim.Count)"
  "VALIDATE_ALL_BEFORE_FIRST_DELETE=SIM"
  "RM_EMITIDOS_ATE_AQUI=0"
  "FILES_DELETED_BY_RB3=$FILES_DELETED_BY_RB3"
) + $rbRuim | Set-Content -LiteralPath $RB3_VAL -Encoding utf8
[void](Assert-Evidencia $RB3_VAL 6)

# Uma unica linha invalida encerra tudo AQUI, com FILES_DELETED_BY_RB3 = 0.
if ($rbRuim.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

#### `RB3.2` — **Só agora** o primeiro `rm` ⚠️ **MUTANTE**

```powershell
foreach ($rel in $rbArq) {
    # Segunda barreira, deliberadamente redundante: mesma disciplina de E4 -> E5.
    if (-not (Test-CaminhoSeguro $rel)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($RAIZES -contains $rel)         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

    $out = (& $ADB -s $SERIAL shell run-as $PKG rm -f -- $rel) -join ' '
    $rb3_ec = $LASTEXITCODE
    $FILES_DELETED_BY_RB3 = $FILES_DELETED_BY_RB3 + 1
    "RB3|$rel|EXIT=$rb3_ec|OUT=$($out.Trim())" |
        Out-File -LiteralPath $RB3_LOG -Append -Encoding utf8
    if ($rb3_ec -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

if ($rbArq.Count -gt 0) {
    [void](Assert-Evidencia $RB3_LOG $rbArq.Count)
}
"FILES_DELETED_BY_RB3=$FILES_DELETED_BY_RB3" |
    Out-File -LiteralPath $RB3_VAL -Append -Encoding utf8
```

> ### ⛔ Correção de auditoria — a validação **não** pode morar dentro do laço destrutivo
>
> A redação anterior validava `Test-CaminhoSeguro` **dentro** do mesmo `foreach` que removia. A
> assimetria era real e grave: com a lista `[bom, bom, mau]`, os itens `1` e `2` **já teriam sido
> removidos** quando o item `3` revelasse a lista inválida. O `STOP` chegaria **depois** do dano,
> e o relatório registraria `FILES_DELETED_BY_RB3 = 2` — remoções feitas a partir de uma
> enumeração que o próprio passo acabara de declarar não confiável.
>
> `RB3` agora tem **duas fases separadas**. `RB3.1` é `READ-ONLY`: carrega a lista inteira,
> submete **todas** as linhas às cinco barreiras `(a)…(e)` e grava o veredito. `RB3.2` só começa
> se `RB3.1` passou por completo.
>
> **Não existe cenário** em que os itens `1..k-1` sejam removidos e o item `k` revele lista
> inválida.
>
> | garantia | valor |
> |---|---|
> | `VALIDATE_ALL_BEFORE_FIRST_DELETE` | `SIM` |
> | `FILES_DELETED_BY_RB3` se **qualquer** linha for inválida | `0` |
> | veredito nesse caso | `R2P1_STOP_ENTRY_RESET_FAILED` |
>
> `$FILES_DELETED_BY_RB3` é inicializado **antes** da validação, não depois: mesmo que `RB3.1`
> aborte na primeira barreira, a variável existe e vale `0` — o relatório nunca depende de uma
> variável não definida para afirmar que nada foi apagado.

> **Precisão sobre o nome do contador.** `FILES_DELETED_BY_RB3` conta **comandos `rm` emitidos com
> `EXIT = 0`**, não arquivos comprovadamente inexistentes depois. `rm -f` retorna `0` também para
> alvo ausente (§3, regra do código de saída como barreira auxiliar). A prova estrutural do estado
> final é de `RB5`, não deste contador.

> **`RB3` remove somente arquivos.** Os diretórios **não** são tocados no *rollback*: os oito da
> baseline nunca foram removidos (`E5` os preserva) e qualquer diretório inesperado já havia
> sido removido antes da falha. Introduzir `rmdir` aqui só ampliaria a superfície destrutiva
> numa situação em que o estado já é incerto — que é exatamente o oposto do que um *rollback*
> deve fazer.

### `RB4` — Restaurar o *rollback* por `stdin` ⚠️ **MUTANTE** — **tentativa única**

```powershell
cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell run-as com.valentedev.pequenostracosdefe tar -x -C /data/user/0/com.valentedev.pequenostracosdefe < C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\TAR-ROLLBACK-PRE-RESET.tar > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\RB4_EXTRACAO.txt 2>&1"
$rb4_ec = $LASTEXITCODE
"RB4_EXTRACAO_EXIT=$rb4_ec" |
    Out-File -LiteralPath "$RSTC\RB4_EXTRACAO.txt" -Append -Encoding utf8
if (-not (Test-Path -LiteralPath "$RSTC\RB4_EXTRACAO.txt")) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($rb4_ec -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

| campo | valor |
|---|---|
| **PASS** | `EXIT = 0` **verificado em `$rb4_ec` e gravado**, não presumido pela ausência de exceção no host. |
| **STOP** | Falha ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` com `DEVICE_STATE = INDETERMINATE`. **NÃO** executar segunda restauração. **NÃO** abrir o app. **NÃO** usar `pm clear`. **NÃO** instalar. **NÃO** apagar mais nada. |
| **EVIDÊNCIA** | `$RSTC\RB4_EXTRACAO.txt` (stdout + stderr + linha `RB4_EXTRACAO_EXIT`) |

### `RB5` — Verificar estruturalmente o estado recuperado

| campo | valor |
|---|---|
| **TIPO** | `READ-ONLY` |
| **CLASSIFICA** | `ROLLBACK_RESULT = RECUPERADO` quando a estrutura recuperada é **idêntica** à enumerada em `E4`; `INDETERMINATE` em qualquer outro caso. |
| **EVIDÊNCIA** | `$RSTC\RB5_ESTRUTURA_RECUPERADA.txt` · `…\RB5_DIFF.txt` · `…\RB5_VEREDITO.txt` |

```powershell
$RB5_EST = "$RSTC\RB5_ESTRUTURA_RECUPERADA.txt"
$RB5_DIF = "$RSTC\RB5_DIFF.txt"
$RB5_VER = "$RSTC\RB5_VEREDITO.txt"
$E4_ARQ  = "$RST\04_ENUM_ARQUIVOS.txt"

(& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f) |
    Out-File -LiteralPath $RB5_EST -Encoding utf8
$rb5_ec = $LASTEXITCODE

# Nenhuma comparacao antes de provar que os DOIS lados existem e tem conteudo (regra A-2).
$rb5_ok_leitura = $true
if ($rb5_ec -ne 0)                            { $rb5_ok_leitura = $false }
if (-not (Test-Path -LiteralPath $RB5_EST))   { $rb5_ok_leitura = $false }
if (-not (Test-Path -LiteralPath $E4_ARQ))    { $rb5_ok_leitura = $false }

$rb5_ref = @()
$rb5_pos = @()
if ($rb5_ok_leitura) {
    $rb5_ref = @(Get-Content -LiteralPath $E4_ARQ  |
                 ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
    $rb5_pos = @(Get-Content -LiteralPath $RB5_EST |
                 ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
    if ($rb5_ref.Count -eq 0) { $rb5_ok_leitura = $false }
}

$rb5_dif = @()
if ($rb5_ok_leitura) {
    $rb5_dif = @(Compare-Object -ReferenceObject $rb5_ref -DifferenceObject $rb5_pos)
}
$rb5_dif | Out-File -LiteralPath $RB5_DIF -Encoding utf8

$ROLLBACK_RESULT = 'INDETERMINATE'
if ($rb5_ok_leitura -and $rb5_dif.Count -eq 0) { $ROLLBACK_RESULT = 'RECUPERADO' }

@(
  "RB5_VEREDITO"
  "FIND_EXIT=$rb5_ec"
  "LEITURA_VALIDA=$rb5_ok_leitura"
  "ARQUIVOS_EM_E4=$($rb5_ref.Count)"
  "ARQUIVOS_APOS_ROLLBACK=$($rb5_pos.Count)"
  "DIFERENCAS=$($rb5_dif.Count)"
  "ROLLBACK_EXECUTED=SIM"
  "ROLLBACK_RESULT=$ROLLBACK_RESULT"
) | Set-Content -LiteralPath $RB5_VER -Encoding utf8
[void](Assert-Evidencia $RB5_VER 8)
```

> ### ⛔ Correção de auditoria — `RB5` **classifica**, e por isso **não** lança
>
> A redação anterior terminava em `Out-File … # esperado: vazio`: um comentário no lugar de uma
> condição. Agora a diferença é **calculada, gravada e convertida em veredito**.
>
> `RB5` é o **único** passo que deliberadamente **não** usa `throw` ao detectar divergência — e a
> razão é normativa, não uma omissão. A execução **já** terminará em
> `R2P1_STOP_ENTRY_RESET_FAILED` por força de `RB7`, **independentemente** do resultado. O papel
> de `RB5` é preencher o campo obrigatório `ROLLBACK_RESULT`. Um `throw` aqui pularia `RB6` e
> `RB7` e **destruiria justamente a informação** que o responsável precisa para decidir o que
> fazer com o aparelho. Ausência de `throw` em `RB5` é, portanto, **decisão de desenho declarada**,
> e não uma expressão nua remanescente.

### `RB6` — **Não continuar** o *retry*

| campo | valor |
|---|---|
| **OBJETIVO** | Provar, por evidência, que **nenhuma** continuação funcional ocorreu depois do *rollback*. |
| **TIPO** | `READ-ONLY` |
| **PASS/STOP** | Não se aplica; é lacre de não-continuação. `RB6` **não** absolve a execução. |
| **EVIDÊNCIA** | `$RSTC\RB6_NAO_CONTINUACAO.txt` |

Nenhuma continuação funcional ocorre depois de um *rollback*: **não** iniciar o item `13`,
**não** subir Metro, **não** iniciar `PS3`, **não** emitir *deep link*, **não** abrir o app,
**não** reexecutar `E5`/`E6`. E isso agora é **medido**, não prometido:

```powershell
[void](Set-Passo 'RB6')
$RB6F = "$RSTC\RB6_NAO_CONTINUACAO.txt"

# As proibicoes de RB6 sao MEDIDAS, uma a uma, com os MESMOS instrumentos de E2:
# se alguem tivesse subido Metro/PS3 ou aberto reverse depois do rollback, aqui apareceria.
$rb6_portas = @(Get-NetTCPConnection -State Listen -LocalPort 8081,8082,8083 -ErrorAction SilentlyContinue)
$rb6_node   = @(Get-Process node -ErrorAction SilentlyContinue)
$rb6_rev    = @(& $ADB -s $SERIAL reverse --list |
                ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
$rb6_ec_rev = $LASTEXITCODE

# O item 13 nao pode ter comecado: o seu TAR e o seu META nao podem existir.
$rb6_t13     = [bool](Test-Path -LiteralPath "$EXEC\acervo\TAR-ENTRY-POS-RESET.tar")
$rb6_t13meta = [bool](Test-Path -LiteralPath "$EXEC\acervo\13_TAR_META.txt")

@(
  "RB6_NAO_CONTINUACAO"
  "EXEC_ROOT=$EXEC"
  "RODADA=$RODADA"
  "PASSO_QUE_FALHOU=$rb0_passo"
  "ITEM_13_TAR_EXISTE=$rb6_t13"
  "ITEM_13_META_EXISTE=$rb6_t13meta"
  "PORTAS_8081_8082_8083_EM_LISTEN=$($rb6_portas.Count)"
  "PROCESSOS_NODE=$($rb6_node.Count)"
  "REVERSE_LIST_EXIT=$rb6_ec_rev"
  "REVERSE_ENTRADAS=$($rb6_rev.Count)"
  "METRO_START=0"
  "PS3_START=0"
  "DEEPLINK=0"
  "APP_OPEN=0"
  "REEXECUCAO_DE_E5_OU_E6=NAO"
  "ROLLBACK_ATTEMPTS_CONSUMIDAS=1"
) + @($rb6_portas | ForEach-Object { "PORTA|$($_.LocalPort)|$($_.OwningProcess)" }) `
  + @($rb6_node   | ForEach-Object { "NODE|$($_.Id)|$($_.ProcessName)" }) `
  + @($rb6_rev    | ForEach-Object { "REVERSE|$_" }) |
    Set-Content -LiteralPath $RB6F -Encoding utf8
[void](Assert-Evidencia $RB6F 16)
```

> **Por que `RB6` não lança, nem mesmo se encontrar Metro no ar.** Pela mesma razão de `RB5`: a
> execução **já** termina em `R2P1_STOP_ENTRY_RESET_FAILED` por força de `RB7`. Um `throw` aqui
> pularia `RB7` e apagaria o lacre final. O achado é **registrado** — `PROCESSOS_NODE`,
> `PORTAS…`, `REVERSE_ENTRADAS` diferentes de `0` são, no relatório, prova de que alguém violou a
> proibição — e o veredito continua sendo o de `RB7`.

### `RB7` — Finalizar

| campo | valor |
|---|---|
| **OBJETIVO** | Emitir o veredito terminal e lacrar os campos obrigatórios do relatório. |
| **TIPO** | `READ-ONLY` |
| **PASS/STOP** | **Sempre `STOP`.** Não existe caminho pelo qual `RB7` produza `PASS`. |
| **EVIDÊNCIA** | `$RSTC\RB7_VEREDITO_FINAL.txt` |

**`R2P1_STOP_ENTRY_RESET_FAILED`** — **mesmo que o *rollback* tenha devolvido o estado
anterior**. *Rollback* bem-sucedido **NÃO** transforma a execução em `PASS`. Campos obrigatórios
no relatório: `ROLLBACK_EXECUTED = SIM` e `ROLLBACK_RESULT = RECUPERADO | INDETERMINATE`.

```powershell
[void](Set-Passo 'RB7')
$RB7F = "$RSTC\RB7_VEREDITO_FINAL.txt"

# ROLLBACK_RESULT vem de RB5, que CLASSIFICA e nao lanca. A variavel nasce
# 'INDETERMINATE' em 2.6 e SO vira 'RECUPERADO' se RB5 rodou e fechou identico:
# se RB5 nao chegou a executar, a classificacao honesta continua INDETERMINATE.
$rb7_result = if ($ROLLBACK_RESULT -eq 'RECUPERADO') { 'RECUPERADO' } else { 'INDETERMINATE' }

@(
  "RB7_VEREDITO_FINAL"
  "EXEC_ROOT=$EXEC"
  "RODADA=$RODADA"
  "VEREDITO=R2P1_STOP_ENTRY_RESET_FAILED"
  "ROLLBACK_EXECUTED=SIM"
  "ROLLBACK_RESULT=$rb7_result"
  "ROLLBACK_ATTEMPTS=1"
  "PASSO_QUE_FALHOU=$rb0_passo"
  "MOTIVO=$rb0_motivo"
  "CAUSA_REGISTRADA_POR_ESCRITOR=$ROLLBACK_CAUSA_REGISTRADA"
  "RB6_NAO_CONTINUACAO=$RB6F"
  "ROLLBACK_TRANSFORMA_EM_PASS=NAO"
  "ITEM_13_INICIADO=NAO"
  "PROXIMA_ACAO=HUMAN_GATE"
) | Set-Content -LiteralPath $RB7F -Encoding utf8
[void](Assert-Evidencia $RB7F 14)

# A ultima linha do rollback e, literalmente, o STOP. Nao ha caminho alternativo.
throw 'R2P1_STOP_ENTRY_RESET_FAILED'
```

> ### ⛔ Correção de auditoria — `RB6` e `RB7` eram **prosa**
>
> Na versão anterior, as duas seções tinham título, texto normativo e **nenhuma linha
> executável**. A matriz de §13 as listava como passos; o desenho não as implementava. Um leitor
> apressado concluiria que existia lacre de não-continuação e veredito final gravados em
> evidência — e não existia **nada**. A emenda entrega os dois blocos: `RB6` **mede** as
> proibições que declara (portas, `node`, `reverse`, item `13` não iniciado) e `RB7` **grava** o
> veredito terminal e **executa** o `throw` que o documento sempre afirmou existir.
>
> `ROLLBACK_DISCIPLINE_COMPLETE = SIM` — com `RB0`…`RB7` todos com bloco literal, escritor
> nomeado, evidência asseverada e acionador real (§`5.0`).

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
| `I1` | **Restauração 1** | `E3A` → `E4` → `E4A` → `E4B` → `E4C` → `E4D` → `E4E` → `E4F` → `E5` → `E6` → `E7` → `E7A` → `E7B` → `E7C` | estrutura, SELinux e modos conformes |
| `I2` | Capturar `TAR-RESTORE-01.tar` **e selar a rodada 1** | `I2` abaixo, **literal** | `bytes` + `SHA256` + listagem + raiz `01` materializada + raiz `02` **inexistente** |
| `I3` | `RESTORE_01` **vs** baseline | `I3` abaixo | `ESCOPO_OK=SIM` + **7 zeros** |
| `I4` | **Restauração 2** — **revalida `E1` e `E2`** e repete a rodada | `I4` abaixo → `E1'` → `E2'` → `E4` → `E4A` → `E4B` → `E4C` → `E4D` → `E4E` → `E4F` → `E5` → `E6` → `E7` → `E7A` → `E7B` → `E7C` | app parado e infra ausente **de novo**; estrutura, SELinux e modos conformes |
| `I5` | Capturar `TAR-RESTORE-02.tar` **e selar a rodada 2** | `I5` abaixo, **literal e completo** | `bytes` + `SHA256` + listagem + **`22 + 22` medidos nas duas raízes** |
| `I6` | `RESTORE_02` **vs** baseline | `I6` abaixo | `ESCOPO_OK=SIM` + **7 zeros** |
| `I7` | `RESTORE_02` **vs** `RESTORE_01` | `I7` abaixo | `ESCOPO_OK=SIM` + **7 zeros** |
| `I8` | Invariantes: `RESTORE_01` e `RESTORE_02`, cada um contra o artefato `30` | `I8` abaixo | `8/8` idênticas · `4/4` zeros, **nos dois** |
| `I9` | SELinux e modo/*ownership*/grupo, **rodada a rodada**, a partir dos arquivos de cada rodada | `I9` abaixo | equivalência funcional nas duas, **auditada separadamente** |
| `I10` | Lacre | `I10` abaixo | `bytes` + `SHA256` de todos os artefatos, **com as duas rodadas discriminadas** |

#### Raízes por rodada — evidência **não colide**

> ### ⛔ Emenda `DESIGN_03` — a colisão foi **eliminada**, não **arquivada**
>
> `DESIGN_02` deixava `E4`…`E7C` escreverem os dois em `$EXEC\reset\` e tentava salvar a rodada 1
> **copiando** `$EXEC\reset\*.txt` para `…\rodadas\RESTORE01\` antes que a rodada 2 sobrescrevesse.
> Três defeitos reais nessa solução:
>
> | defeito | consequência |
> |---|---|
> | os arquivos eram **os mesmos** durante a rodada 2 | qualquer escritor `-Append` da rodada 2 abria o arquivo da rodada 1 **ainda com o conteúdo dela dentro** e produzia `44` linhas onde a asserção esperava `22` — ou, pior, passava numa contagem feita antes |
> | a cópia dependia de **ordem de execução** | bastava `I2` falhar, ser pulado ou rodar depois de `I4` para a rodada 1 desaparecer sem `STOP` |
> | `I9` comparava **cópia** com **original** | uma diferença poderia vir do `Copy-Item`, não do aparelho |
>
> A emenda **não trunca** e **não copia**: cada rodada tem **raiz própria desde o nascimento**
> (§`2.7`). `$RST01` e `$RST02` nascem por `Assert-RaizNova` — **preexistência é `STOP`** — e
> `E4`…`E7C` escrevem sempre em `$RST`, que vale uma ou outra por **linha literal**. Não existe
> arquivo gravável compartilhado entre as duas rodadas, logo não existe acumulação possível:
> a rodada `1` produz `22`, a rodada `2` produz `22`, e **nenhuma das duas pode produzir `44`**.

```powershell
# NAO ha copia, NAO ha arquivamento e NAO ha diretorio intermediario:
# as raizes de rodada JA SAO as raizes de escrita, criadas por Assert-RaizNova
# (E0.3 para a rodada 01; I4 para a rodada 02).
$R01 = $RST01                      # C:\...\R2P1_ENTRY_RESET_EXEC_01\round01\reset
$R02 = $RST02                      # C:\...\R2P1_ENTRY_RESET_EXEC_01\round02\reset

# Lacre anti-deriva: as duas raizes sao distintas e nenhuma e prefixo da outra.
if ($R01 -eq $R02)               { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($R01.StartsWith("$R02\"))    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($R02.StartsWith("$R01\"))    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

#### `I2` — capturar a rodada 1 e **selá-la na raiz própria** ⚠️ leitura do aparelho

```powershell
$T01     = "$EXEC\acervo\TAR-RESTORE-01.tar"
$T01META = "$EXEC\acervo\I2_TAR01_META.txt"
$T01LIST = "$EXEC\acervo\I2_TAR01_LISTAGEM.txt"
$T01ERR  = "$EXEC\acervo\I2_TAR01_STDERR.txt"
$X01     = "$EXEC\acervo\RESTORE-01-EXTRACTED"

cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ exec-out run-as com.valentedev.pequenostracosdefe tar -c databases files shared_prefs > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\acervo\TAR-RESTORE-01.tar 2> C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\acervo\I2_TAR01_STDERR.txt"
$t01_ec = $LASTEXITCODE

if ($t01_ec -ne 0)                          { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not (Test-Path -LiteralPath $T01))     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$t01_err_n = [int](Assert-Stderr $T01ERR 'I2.TAR_RESTORE_01')

$t01_len = (Get-Item     -LiteralPath $T01).Length
$t01_sha = (Get-FileHash -LiteralPath $T01 -Algorithm SHA256).Hash
if ($t01_len -le 0)                         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

tar -tvf $T01 | Out-File -LiteralPath $T01LIST -Encoding utf8
if ($LASTEXITCODE -ne 0)                    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$t01_itens = [int](Assert-Evidencia $T01LIST 22)
if ($t01_itens -ne 22)                      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

New-Item -ItemType Directory -Force $X01 | Out-Null
tar -xf $T01 -C $X01
if ($LASTEXITCODE -ne 0)                    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# SELAGEM DA RODADA 1 -- NAO ha copia. A evidencia ja nasceu na raiz propria da
# rodada ($RST01) e I4 nao tem como sobrescreve-la: a rodada 2 escreve em $RST02.
# O que se faz aqui e PROVAR que a raiz da rodada 1 esta materializada, e que a
# raiz da rodada 2 AINDA NAO EXISTE -- ou seja, nada da rodada 2 pode ter vazado
# para dentro da rodada 1, porque a rodada 2 nem comecou.
if (-not (Test-Path -LiteralPath $R01 -PathType Container)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (Test-Path -LiteralPath $R02)                            { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$r01_n = [int](Assert-Colecao @(Get-ChildItem -LiteralPath $R01 -File -Filter *.txt))
if ($r01_n -le 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# Cardinalidade da rodada 1, medida ARQUIVO A ARQUIVO nos tres arbitros de 22:
# se algum tivesse acumulado duas rodadas, marcaria 44 e faria STOP aqui.
foreach ($arb in @("$R01\04B_MODE_PRE.txt", "$R01\07B_MODE_POST.txt",
                   "$R01\07A_SELINUX_POST.txt")) {
    $n = [int](Assert-Evidencia $arb 22)
    if ($n -ne 22) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}

@(
  "I2_TAR01_META"
  "RODADA=01"
  "TAR_PATH=$T01"
  "TAR_BYTES=$t01_len"
  "TAR_SHA256=$t01_sha"
  "TAR_ENTRADAS=$t01_itens"
  "TAR_EXIT=$t01_ec"
  "STDERR_ARQUIVO=$T01ERR"
  "STDERR_PROVA=$T01ERR.PROVA.txt"
  "STDERR_LINHAS=$t01_err_n"
  "RAIZ_DA_RODADA=$R01"
  "RAIZ_DA_RODADA_02_JA_EXISTE=NAO"
  "ARQUIVOS_NA_RAIZ=$r01_n"
  "ARBITROS_DE_22_CONFERIDOS=3"
  "COPIA_ENTRE_RODADAS=NAO"
) | Set-Content -LiteralPath $T01META -Encoding utf8
[void](Assert-Evidencia $T01META 15)
```

#### `I3` — `RESTORE_01` **vs** baseline

```powershell
$I3F = "$EXEC\acervo\I3_RESTORE01-vs-BASELINE.txt"
python $CMP $BASE_REF $X01 $I3F
if ($LASTEXITCODE -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$I3 = Read-Comparador $I3F
if ($I3.CHAVES['ESCOPO_OK'] -ne 'SIM') { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
foreach ($ch in @('FILES_ADDED','FILES_CHANGED','FILES_DELETED',
                  'KEYS_ADDED','KEYS_CHANGED','KEYS_DELETED','KEYS_ROWID_MOVED')) {
    if ([int]$I3.CHAVES[$ch] -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}
if ($I3.CHAVES['ENTRY_STATE_RESULT'] -ne 'PASS') { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

#### `I4` — **revalidar `E1` e `E2`** antes da segunda janela destrutiva

```powershell
# ---------------------------------------------------------------------------
# I4.0) VIRADA DE RODADA -- a unica do documento, e ela e LITERAL.
#       A raiz da rodada 2 NASCE AQUI e tem de nascer NOVA: se ja existir,
#       e residuo de execucao anterior e o desenho para (regra A-6, secao 2.7).
#       Depois desta linha, TODO escritor de E4..E7C aponta para $RST02 --
#       nenhum arquivo da rodada 1 e reaberto, nem para leitura, nem em -Append.
# ---------------------------------------------------------------------------
[void](Assert-RaizNova $RST02 'RESET_RODADA_02')
$RODADA = '02'
$RST    = $RST02
if ($RST -ne $RST02)          { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($RST -eq $RST01)          { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($RODADA -ne '02')         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# A rodada 1 continua intacta e SELADA: nada abaixo escreve dentro dela.
if (-not (Test-Path -LiteralPath $RST01 -PathType Container)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

$I4_VIR = "$RST02\I4_VIRADA_DE_RODADA.txt"
@(
  "I4_VIRADA_DE_RODADA"
  "RODADA_ANTERIOR=01"
  "RODADA_CORRENTE=$RODADA"
  "RAIZ_RODADA_01=$RST01"
  "RAIZ_RODADA_02=$RST02"
  "RAIZ_02_NASCEU_NOVA=SIM"
  "RAIZ_01_PRESERVADA=SIM"
  "COPIA_ENTRE_RODADAS=NAO"
  "APPEND_CRUZADO=NAO"
) | Set-Content -LiteralPath $I4_VIR -Encoding utf8
[void](Assert-Evidencia $I4_VIR 9)

$I4_E1 = "$RST02\I4_E1_PIDOF_ANTES.txt"
$I4_E2 = "$RST02\I4_E2_INFRA_AUSENTE.txt"

# --- E1' : o app precisa estar parado DE NOVO. I2 nao abriu o app, mas nada garante
#     que o sistema (JobScheduler, sync, broadcast) nao o tenha subido entre as rodadas.
#     MESMO comando de E1, MESMA regra: force-stop corretivo continua PROIBIDO aqui.
(& $ADB -s $SERIAL shell pidof com.valentedev.pequenostracosdefe) |
    Out-File -LiteralPath $I4_E1 -Encoding utf8
$i4_ec_pid = $LASTEXITCODE
if (-not (Test-Path -LiteralPath $I4_E1)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$i4_pid = @(Get-Content -LiteralPath $I4_E1 |
            ForEach-Object { $_.Trim() } |
            Where-Object { $_ -match '^[0-9]+$' })
@(
  "I4_E1_PIDOF_ANTES"
  "RODADA=02"
  "PIDOF_EXIT=$i4_ec_pid"
  "PIDS_ENCONTRADOS=$($i4_pid.Count)"
  "FORCE_STOP_CORRETIVO=NAO"
) + $i4_pid | Set-Content -LiteralPath $I4_E1 -Encoding utf8
[void](Assert-Evidencia $I4_E1 5)
if ($i4_pid.Count -ne 0)   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# --- E2' : infra continua ausente. Metro, PS3, reverse e deep link seguem proibidos
#     DURANTE a prova de idempotencia. MESMAS tres medicoes de E2, MESMOS tokens.
$i4_portas = @(Get-NetTCPConnection -State Listen -LocalPort 8081,8082,8083 -ErrorAction SilentlyContinue)
$i4_node   = @(Get-Process node -ErrorAction SilentlyContinue)
$i4_rev    = @(& $ADB -s $SERIAL reverse --list |
               ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
$i4_ec_rev = $LASTEXITCODE
@(
  "I4_E2_INFRA_AUSENTE"
  "RODADA=02"
  "PORTAS_8081_8082_8083_EM_LISTEN=$($i4_portas.Count)"
  "PROCESSOS_NODE=$($i4_node.Count)"
  "REVERSE_LIST_EXIT=$i4_ec_rev"
  "REVERSE_ENTRADAS=$($i4_rev.Count)"
  "METRO_START=0"
  "PS3_START=0"
  "DEEPLINK=0"
  "APP_OPEN=0"
) + @($i4_portas | ForEach-Object { "PORTA|$($_.LocalPort)|$($_.OwningProcess)" }) `
  + @($i4_node   | ForEach-Object { "NODE|$($_.Id)|$($_.ProcessName)" }) `
  + @($i4_rev    | ForEach-Object { "REVERSE|$_" }) |
    Set-Content -LiteralPath $I4_E2 -Encoding utf8
[void](Assert-Evidencia $I4_E2 10)
if ($i4_ec_rev -ne 0)        { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($i4_rev.Count    -ne 0)  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($i4_node.Count   -ne 0)  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($i4_portas.Count -ne 0)  { throw 'R2P1_STOP_PORT_OCCUPIED' }

# --- so agora a rodada 2 repete E4 -> E4A -> E4B -> E4C -> E4D -> E4E -> E4F
#     -> E5 -> E6 -> E7 -> E7A -> E7B -> E7C, com os MESMOS comandos ja auditados.
```

#### `I5` — capturar a rodada 2 e **selá-la na raiz própria** ⚠️ leitura do aparelho

```powershell
$T02     = "$EXEC\acervo\TAR-RESTORE-02.tar"
$T02META = "$EXEC\acervo\I5_TAR02_META.txt"
$T02LIST = "$EXEC\acervo\I5_TAR02_LISTAGEM.txt"
$T02ERR  = "$EXEC\acervo\I5_TAR02_STDERR.txt"
$X02     = "$EXEC\acervo\RESTORE-02-EXTRACTED"

cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ exec-out run-as com.valentedev.pequenostracosdefe tar -c databases files shared_prefs > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\acervo\TAR-RESTORE-02.tar 2> C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\acervo\I5_TAR02_STDERR.txt"
$t02_ec = $LASTEXITCODE

if ($t02_ec -ne 0)                          { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not (Test-Path -LiteralPath $T02))     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$t02_err_n = [int](Assert-Stderr $T02ERR 'I5.TAR_RESTORE_02')

$t02_len = (Get-Item     -LiteralPath $T02).Length
$t02_sha = (Get-FileHash -LiteralPath $T02 -Algorithm SHA256).Hash
if ($t02_len -le 0)                         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

tar -tvf $T02 | Out-File -LiteralPath $T02LIST -Encoding utf8
if ($LASTEXITCODE -ne 0)                    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$t02_itens = [int](Assert-Evidencia $T02LIST 22)
if ($t02_itens -ne 22)                      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

New-Item -ItemType Directory -Force $X02 | Out-Null
tar -xf $T02 -C $X02
if ($LASTEXITCODE -ne 0)                    { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# SELAGEM DA RODADA 2 -- de novo SEM copia. As duas raizes coexistem, distintas,
# cada uma com os seus 22. E aqui que se prova, literalmente, que ninguem fez 44.
if (-not (Test-Path -LiteralPath $R01 -PathType Container)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not (Test-Path -LiteralPath $R02 -PathType Container)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$r02_n = [int](Assert-Colecao @(Get-ChildItem -LiteralPath $R02 -File -Filter *.txt))
if ($r02_n -le 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# 22 + 22, NUNCA 44 -- conferido nos TRES arbitros das DUAS raizes, um a um.
$I5_CARD = "$EXEC\acervo\I5_CARDINALIDADE_POR_RODADA.txt"
$i5_card = @('I5_CARDINALIDADE_POR_RODADA')
foreach ($par in @(@($R01,'01'), @($R02,'02'))) {
    foreach ($nome in @('04B_MODE_PRE.txt', '07B_MODE_POST.txt', '07A_SELINUX_POST.txt')) {
        $alvo = "$($par[0])\$nome"
        $n    = [int](Assert-Evidencia $alvo 22)
        $i5_card += "RODADA$($par[1])|$nome|LINHAS=$n|ESPERADO=22"
        if ($n -ne 22) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    }
}
$i5_card += @("RAIZES_DISTINTAS=SIM"; "SOMA_POR_ACUMULACAO=NAO"; "TOTAL_ESPERADO=22+22")
$i5_card | Set-Content -LiteralPath $I5_CARD -Encoding utf8
[void](Assert-Evidencia $I5_CARD 10)

@(
  "I5_TAR02_META"
  "RODADA=02"
  "TAR_PATH=$T02"
  "TAR_BYTES=$t02_len"
  "TAR_SHA256=$t02_sha"
  "TAR_ENTRADAS=$t02_itens"
  "TAR_EXIT=$t02_ec"
  "STDERR_ARQUIVO=$T02ERR"
  "STDERR_PROVA=$T02ERR.PROVA.txt"
  "STDERR_LINHAS=$t02_err_n"
  "RAIZ_DA_RODADA=$R02"
  "RAIZ_DA_RODADA_01_INTACTA=SIM"
  "ARQUIVOS_NA_RAIZ=$r02_n"
  "CARDINALIDADE_POR_RODADA=$I5_CARD"
  "COPIA_ENTRE_RODADAS=NAO"
) | Set-Content -LiteralPath $T02META -Encoding utf8
[void](Assert-Evidencia $T02META 15)
```

#### `I6` · `I7` · `I8` — as três comparações, cada uma com veredito executável

```powershell
$I6F = "$EXEC\acervo\I6_RESTORE02-vs-BASELINE.txt"
$I7F = "$EXEC\acervo\I7_RESTORE02-vs-RESTORE01.txt"
$I8A = "$EXEC\acervo\I8_RESTORE01-vs-ARTEFATO30.txt"
$I8B = "$EXEC\acervo\I8_RESTORE02-vs-ARTEFATO30.txt"

python $CMP $BASE_REF $X02 $I6F
if ($LASTEXITCODE -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
python $CMP $X01      $X02 $I7F      # <-- o teste de idempotencia propriamente dito
if ($LASTEXITCODE -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
python $CMP $A30_REF  $X01 $I8A
if ($LASTEXITCODE -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
python $CMP $A30_REF  $X02 $I8B
if ($LASTEXITCODE -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# I6 e I7 exigem os SETE zeros; I8 exige as 8 invariantes de produto, dos DOIS lados.
foreach ($f in @($I6F, $I7F)) {
    $Z = Read-Comparador $f
    if ($Z.CHAVES['ESCOPO_OK'] -ne 'SIM') { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    foreach ($ch in @('FILES_ADDED','FILES_CHANGED','FILES_DELETED',
                      'KEYS_ADDED','KEYS_CHANGED','KEYS_DELETED','KEYS_ROWID_MOVED')) {
        if ([int]$Z.CHAVES[$ch] -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    }
    if ($Z.CHAVES['ENTRY_STATE_RESULT'] -ne 'PASS') { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
}
foreach ($f in @($I8A, $I8B)) {
    $Y = Read-Comparador $f
    if ($Y.CHAVES['ESCOPO_OK'] -ne 'SIM') { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    foreach ($ch in @('KEYS_ADDED','KEYS_CHANGED','KEYS_DELETED','KEYS_ROWID_MOVED')) {
        if ([int]$Y.CHAVES[$ch] -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    }
    foreach ($p in $PRODUTO_8) {
        if ($Y.FILE_CHANGED -contains $p) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        if ($Y.FILE_DELETED -contains $p) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    }
}
$CONTENT_IDEMPOTENCE = 'PASS'
```

#### `I9` — SELinux e modos, **rodada a rodada**, nas raízes próprias de cada rodada

```powershell
$I9F = "$EXEC\I9_METADADOS_POR_RODADA.txt"
$i9Falta = @()
$i9Dif   = @()

# ---- 0) OS DOIS OBJETOS COMPARADOS SAO INDEPENDENTES. Nao ha copia, nao ha
#         arquivo compartilhado e nenhuma das raizes contem a outra.
if ($R01 -eq $R02)            { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($R01.StartsWith("$R02\")) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($R02.StartsWith("$R01\")) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not (Test-Path -LiteralPath $R01 -PathType Container)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if (-not (Test-Path -LiteralPath $R02 -PathType Container)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---- 1) Cada rodada tem de ter produzido, no SEU proprio arquivo, os quatro vereditos.
foreach ($par in @(@{R='01'; D=$R01}, @{R='02'; D=$R02})) {
    foreach ($nome in @('07A_SELINUX_DOMINIO.txt','07A_SELINUX_POST.txt',
                        '07B_MODE_DOMINIO.txt','07B_MODE_POST.txt')) {
        $alvo = Join-Path $par.D $nome
        if (-not (Test-Path -LiteralPath $alvo)) { $i9Falta += "AUSENTE|$($par.R)|$nome" }
        elseif ((Get-Item -LiteralPath $alvo).Length -le 0) { $i9Falta += "VAZIO|$($par.R)|$nome" }
    }
}
if ($i9Falta.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---- 2) I9 SO consome a PROJECAO ESTRUTURAL. Antes de comparar qualquer coisa,
#         relê o arbitro de modo das DUAS rodadas e exige 6 campos por linha.
#         Uma unica linha de 8 campos -- unica forma de o mtime chegar aqui --
#         faz STOP neste ponto. Os *_BRUTO.txt NAO sao abertos por I9.
[void](Assert-Projecao (Join-Path $R01 '07B_MODE_POST.txt') 22 "$EXEC\I9_PROJECAO_R01.txt")
[void](Assert-Projecao (Join-Path $R02 '07B_MODE_POST.txt') 22 "$EXEC\I9_PROJECAO_R02.txt")

# ---- 3) Equivalencia ENTRE as rodadas: os mapas de SELinux e de modo tem de ser
#         identicos -- 22 de um lado, 22 do outro, nunca 44 num arquivo so.
foreach ($nome in @('07A_SELINUX_POST.txt','07B_MODE_POST.txt')) {
    $a = @(Get-Content -LiteralPath (Join-Path $R01 $nome) |
           ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' } | Sort-Object)
    $b = @(Get-Content -LiteralPath (Join-Path $R02 $nome) |
           ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' } | Sort-Object)
    [void](Assert-Colecao $a 22)          # 22 -- nao "o que vier"
    [void](Assert-Colecao $b 22)          # 22 -- nao "o que vier"
    if ($a.Count -ne $b.Count) { $i9Dif += "CARDINALIDADE|$nome|$($a.Count)|$($b.Count)"; continue }
    for ($i = 0; $i -lt $a.Count; $i++) {
        if ($a[$i] -cne $b[$i]) { $i9Dif += "VALOR|$nome|$($a[$i])|$($b[$i])" }
    }
}

@(
  "I9_METADADOS_POR_RODADA"
  "RODADA_01_RAIZ=$R01"
  "RODADA_02_RAIZ=$R02"
  "RAIZES_INDEPENDENTES=SIM"
  "OBJETOS_COMPARADOS=ORIGINAIS_DE_CADA_RODADA"
  "COPIA_ENTRE_RODADAS=NAO"
  "ARBITRO_CAMPOS_EXIGIDOS=6"
  "ARBITRO_CONTEM_MTIME=NAO"
  "MTIME_CONSUMIDO_POR_I9=NAO"
  "LINHAS_POR_RODADA=22"
  "SOMA_POR_ACUMULACAO=NAO"
  "ARQUIVOS_AUSENTES_OU_VAZIOS=$($i9Falta.Count)"
  "DIVERGENCIAS_ENTRE_RODADAS=$($i9Dif.Count)"
  "STRUCTURAL_METADATA_CHECK=$(if ($i9Dif.Count -eq 0) { 'PASS' } else { 'STOP' })"
) + $i9Dif | Set-Content -LiteralPath $I9F -Encoding utf8
[void](Assert-Evidencia $I9F 14)
if ($i9Dif.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$STRUCTURAL_METADATA_CHECK = 'PASS'
```

> **Por que `I9` deixou de poder reprovar por `mtime`.** Em `DESIGN_02`, `07B_MODE_POST.txt`
> guardava a saída **inteira** de `stat`, com `%Y`. `I9` compara as linhas das duas rodadas com
> `-cne` — comparação **exata**. Duas restaurações do mesmo TAR podem, legitimamente, produzir
> `mtime` diferentes; bastava isso para `$i9Dif` encher e a execução parar por uma diferença
> **esperada**. Agora `07B_MODE_POST.txt` é a projeção de `6` campos, e `Assert-Projecao` **relê
> os dois arquivos** antes da comparação, exigindo `6` campos em cada linha. `MTIME_CAN_STOP =
> NÃO` é, aqui, uma condição verificada em tempo de execução — não uma afirmação de prosa.

#### `I10` — lacre, com as duas rodadas discriminadas

```powershell
$I10F = "$EXEC\I10_LACRE.txt"
$lacre = @(Get-ChildItem -LiteralPath $EXEC -Recurse -File |
           ForEach-Object {
               $rodada = 'COMUM'
               if ($_.FullName.StartsWith($R01)) { $rodada = 'RODADA01' }
               if ($_.FullName.StartsWith($R02)) { $rodada = 'RODADA02' }
               '{0}|{1}|{2}|{3}' -f $rodada, $_.FullName, $_.Length,
                                    (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
           })
[void](Assert-Colecao $lacre)
$lacre | Set-Content -LiteralPath $I10F -Encoding utf8
[void](Assert-Evidencia $I10F 1)

$n01 = @($lacre | Where-Object { $_ -like 'RODADA01|*' }).Count
$n02 = @($lacre | Where-Object { $_ -like 'RODADA02|*' }).Count
"LACRE_TOTAL=$($lacre.Count)"   | Out-File -LiteralPath $I10F -Append -Encoding utf8
"LACRE_RODADA01=$n01"           | Out-File -LiteralPath $I10F -Append -Encoding utf8
"LACRE_RODADA02=$n02"           | Out-File -LiteralPath $I10F -Append -Encoding utf8
if ($n01 -eq 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($n02 -eq 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

> ### ⛔ Correção de auditoria — as três falhas de §8, uma a uma
>
> | # | defeito literal da versão anterior | correção |
> |---|---|---|
> | 1 | `# ---- I2 / I5 : capturas (trocar 01 por 02 na segunda rodada)` — **`I5` não existia**. Havia um comando para `01` e uma **instrução de edição manual** para produzir `02`. | `I2` e `I5` são agora **dois blocos literais completos e distintos**. Nenhum executor redige comando novo durante a execução. |
> | 2 | `I4` listava `E4 → … → E7C` e **omitia `E1` e `E2`**. A segunda restauração herdava cegamente o resultado da primeira: se o app tivesse subido entre as rodadas, `E5` removeria arquivos **com o processo vivo**. | `I4` **revalida `E1'` (app parado, `pidof` vazio) e `E2'` (infra ausente)** antes de qualquer ato destrutivo da rodada 2. |
> | 3 | `07A_SELINUX_POST.txt`, `07B_MODE_POST.txt` e todos os demais têm **nome fixo**. A rodada 2 **sobrescreveria** a evidência da rodada 1, e `I9`/`I10` auditariam duas vezes o **mesmo** arquivo. | **`DESIGN_02` respondia com `Copy-Item` — e isso não bastava** (ver a emenda `DESIGN_03` acima). **`DESIGN_03` elimina o arquivo compartilhado:** `E4`…`E7C` escrevem em `$RST`, que é `$RST01` (`$EXEC\round01\reset\`) na rodada `1` e `$RST02` (`$EXEC\round02\reset\`) na rodada `2`, ambas nascidas por `Assert-RaizNova`. `I2` confere a raiz `01` **e** exige que a raiz `02` **ainda não exista**; `I4` faz a virada literal; `I5` confere as duas e mede `22 + 22` arquivo a arquivo; `I9` compara os **originais** de cada raiz; `I10` marca cada linha com `RODADA01` / `RODADA02`. |
>
> `I5_LITERAL_COMMANDS_PRESENT = SIM` · `I4_REVALIDATES_E1_E2 = SIM` ·
> `IDEMPOTENCE_EVIDENCE_PATHS_UNIQUE = SIM` · `IDEMPOTENCE_DESIGN_COMPLETE = SIM`

> **Por que não há mais `Copy-Item` nenhum.** O arquivamento por cópia resolvia o sintoma —
> preservar a rodada 1 — sem remover a causa: durante a rodada 2, os arquivos de nome fixo
> **continuavam sendo os mesmos**, abertos em `-Append` por escritores que esperavam `22` linhas
> e podiam encontrar `44`. Com raízes independentes, o arquivo da rodada 1 **não é alcançável**
> pela rodada 2: o caminho `$RST02\07B_MODE_POST.txt` não existe até `I4` criar a raiz, e o
> caminho `$RST01\07B_MODE_POST.txt` não é escrito por passo algum depois de `I2`. Como efeito
> colateral desejado, some também o custo de disco que a cópia impunha, e `I9` passa a comparar
> **originais** — não cópias, cujas diferenças poderiam vir do próprio `Copy-Item`.
>
> A prova de que **nenhuma rodada produz `44` por acumulação** é executável e está em três
> lugares: `Assert-RaizNova` (preexistência da raiz é `STOP`), `I2` (`$R02` não pode existir
> ainda) e `I5` (`Assert-Evidencia … 22` nos **três** árbitros das **duas** raízes, seis medições
> registradas em `I5_CARDINALIDADE_POR_RODADA.txt`).

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

## 13. Matriz de riscos e auditorias transversais — `SM-X510` / `RX2XC003LTJ`

### 13.0 Matriz de riscos

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
| `X11` | **Espaço insuficiente** | **`E4F` mede antes de `E5`** — `df /data` no aparelho (mínimo `64 MB`) e volume do `HOST` (mínimo `1024 MB`), com `STOP` **fora** da janela destrutiva. Atenuante estrutural: `E5` **remove antes** de `E6` extrair ⇒ saldo líquido ≈ 0 | erro de `tar` em `E6`; `E7`; item `14` | espaço abaixo da margem ⇒ `STOP` **antes** de `E5`; `ENOSPC` posterior ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* |
| `X12` | **Falha de cabo / `ADB` interrompido no meio** | cabo validado na campanha; `adb devices -l` = 1, `transport_id` estável | `E7` + item `14` acusam estado parcial | queda entre `E5` e `E7` ⇒ STOP; recuperação **somente** por §5, nunca por nova extração cega |
| `X13` | **Corrida com Play Services / AndroidX** | app parado bloqueia *broadcasts* implícitos; **medido**: 4 min 39 s parado, zero `Start proc` | `pidof` após `E7` | qualquer PID surgido ⇒ STOP |
| `X14` | **`.xml.bak` residual do `force-stop`** | `E4` mede | `FILES_ADDED` no item `14` | resíduo ⇒ removido em `E5`; se reaparecer depois ⇒ STOP |
| `X15` | **TAR gravado dentro do aparelho** | proibição literal do item `13`; rota é `stdin`/`stdout` | inventário `E4` da próxima rodada | qualquer `.tar` no *sandbox* ⇒ STOP |
| `X16` | **Corrupção binária por redirecionamento do PowerShell** | `cmd.exe /c` **obrigatório** (§2.3, regra `O-2`) | `SHA256` do TAR capturado | *hash* divergente ⇒ STOP |
| `X17` | **`stdin` não fiel a *bytes* através de `adb shell`** | **`E4C`** — `tar -t` lista 22 entradas **sem mutar nada** | `E7` + item `14` | listagem ≠ 22 ou erro de `tar` ⇒ STOP **antes** de `E5` |
| `X18` | ***Rollback* inexistente, inválido ou de outra execução** | `E3` **antes** de qualquer remoção, **gravando** `03_ROLLBACK_META.txt` (caminho absoluto, *bytes*, `SHA256`, entradas, `EXEC_ROOT`) | `RB1` **relê o meta**, confere `EXEC_ROOT`, confere o caminho esperado, **recalcula** tamanho e `SHA256`, reconta as entradas e só então marca `$ROLLBACK_VERIFICADO = $true` | `E3` falhou ⇒ **não prosseguir para `E5`**. `RB1` divergente ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` **antes de qualquer remoção** (`RB2`/`RB3` exigem `$ROLLBACK_VERIFICADO`) |
| `X19` | **Recuperação silenciosa** — o pior de todos | — | — | **PROIBIDA.** Nenhuma repetição automática, nenhuma correção não registrada, nenhuma segunda extração "para ver se passa". Falha ⇒ STOP + relatório |

---

### 13.1 Matriz integral escritor ⇄ consumidor de evidência

**Propriedade auditada — enunciada em três invariantes independentes, não em prosa:**

| invariante | enunciado | token |
|---|---|---|
| `INV-1` | Nenhum artefato **consumido** por qualquer passo posterior existe sem uma **linha de escrita literal** neste documento. | `CONSUMED_EVIDENCE_WITHOUT_WRITER = 0` |
| `INV-2` | Nenhum artefato que **arbitra** (isto é, do qual pode nascer um `PASS` ou um `STOP`) existe sem **asserção executável** sobre existência **e** cardinalidade. | `ARBITER_WITHOUT_ASSERTION = 0` |
| `INV-3` | Nenhum `PASS` decorre de coleção vazia obtida por ausência de arquivo, `-ErrorAction SilentlyContinue` ou canal quebrado. | `EMPTY_COLLECTION_FALSE_PASS_VECTORS = 0` |

**Como ler as colunas.** `ESCRITOR` = a linha que materializa o artefato — `Out-File`,
`Set-Content`, `New-Item` ou redirecionamento `cmd.exe /c … > …` / `2> …`; quando o escritor é um
*helper* de §2.6, o nome do *helper* é o escritor real. `EXISTÊNCIA` = asserção que **para** se o
caminho não existir ou tiver `0` *bytes*. `CARDINALIDADE` = asserção sobre a **contagem de linhas
úteis**: `Assert-Evidencia n` é **piso** (`-lt n` ⇒ `STOP`), `Assert-Colecao n` e
`Assert-Identidade n` são **exatas**, `Assert-Projecao n` é piso **mais** `6` campos por linha.
`RODADA` = `COMUM` (raiz `$RSTC`, escrita uma única vez), `POR RODADA` (raiz `$RST`, isto é
`$RST01` **ou** `$RST02`, nunca as duas) ou `PÓS-RODADAS` (`$EXEC`, escrito depois das duas).
`PRE/POST` = posição relativa à **primeira mutação** (`E5`). `DECISÃO DESTRUTIVA` = se um `STOP`
originado neste artefato altera o que é apagado, extraído ou restaurado — `AUTORIZA` (é gate de
entrada da janela), `DIRIGE` (é a lista que comanda os `rm`), `ACIONA ROLLBACK` (seu `STOP` cai no
`catch` de §5.0) ou `NÃO` (diagnóstico puro).

| # | ARTEFATO | ESCRITOR | MOMENTO DA ESCRITA | EXISTÊNCIA | CARDINALIDADE | CONSUMIDOR | CRITÉRIO DE `PASS` | CRITÉRIO DE `STOP` | RODADA | PRE/POST | DECISÃO DESTRUTIVA |
|---:|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `00_PREVOO.txt` *(custódia do pré-voo canônico)* | fora deste desenho | campanha anterior | — | — | **nenhum** neste desenho | n/a | n/a | — | PRE | **NÃO** — ver `E-1` |
| 2 | `12_dumpsys_package_raw.txt` *(idem)* | fora deste desenho | campanha anterior | — | — | **nenhum** neste desenho | n/a | n/a | — | PRE | **NÃO** — ver `E-1` |
| 3 | `$EXEC\tools\compare_state.py` | cópia lacrada, fora do desenho | antes de `E0` | `E0.4` `Get-FileHash` | `4380` *bytes* | `E3A`, item `14`, `E8`, `I3`, `I6`, `I7`, `I8` | `SHA256 = A7649DD2…FDFD` | *hash* ou tamanho divergente | COMUM | PRE | **AUTORIZA** |
| 4 | `$EXEC\00_E0_INTEGRIDADE.txt` | `E0.5` `Set-Content` | após `E0.0` (desenho *vs* custódia *vs* gate) e após conferir *branch*, `HEAD`, `SHA256` e *bytes* da baseline | `Assert-Evidencia $E0F 34` | piso `34` | terminal — nenhum passo lê | `34` linhas de integridade gravadas, incluindo `DESIGN_REPO_VS_CUSTODY=IDENTICOS` | ausente, vazio ou `< 34` linhas | COMUM | PRE | **AUTORIZA** |
| 5 | `$RSTC\01_PIDOF_ANTES.txt` | `E1` `Set-Content` | logo após `pidof`, antes de qualquer decisão | `Assert-Evidencia $E1F 4` | piso `4` | `E1` (a própria condição) | `PIDS_ENCONTRADOS=0` **lido do arquivo** | `if ($e1_pids.Count -ne 0) { throw }` | COMUM | PRE | **AUTORIZA** |
| 6 | `$RSTC\02_INFRA_AUSENTE.txt` | `E2` `Set-Content` | após medir portas `8081/8082/8083`, `node` e `adb reverse --list` | `Assert-Evidencia $E2F 9` | piso `9` | `E2` (as quatro condições) | quatro contagens gravadas em `0` | qualquer uma `≠ 0` | COMUM | PRE | **AUTORIZA** |
| 7 | `$RSTC\TAR-ROLLBACK-PRE-RESET.tar` | `E3` `cmd.exe /c … > …` | **antes** do primeiro `rm` de `E5` | `Get-Item .Length` em `E3` e de novo em `RB1` | `22` entradas via `03_ROLLBACK_LISTAGEM.txt` | `RB1` (identidade), `RB4` (extração) | *bytes* `> 0`, `SHA256` reproduzido em `RB1`, `22` entradas | ausente, `0` *bytes*, *hash* divergente ou `≠ 22` | COMUM | PRE | **AUTORIZA** |
| 8 | `$RSTC\03_ROLLBACK_STDERR.txt` | `E3` `cmd.exe /c … 2> …` | no mesmo comando que grava o TAR | **`Assert-Stderr`** — ausência é `STOP`, nunca coleção vazia | `0` linhas úteis exigido | `E3` via `Assert-Stderr` | arquivo **existe** e tem `0` linhas úteis | arquivo **ausente** (canal falhou) ou `≠ 0` linhas | COMUM | PRE | **AUTORIZA** |
| 9 | `$RSTC\03_ROLLBACK_STDERR.txt.PROVA.txt` | `Assert-Stderr` `Set-Content` | dentro do próprio `Assert-Stderr`, antes de retornar | `Assert-Evidencia $prova 8` | piso `8` | leitura humana e auditoria | `VEREDITO=PASS` gravado | não materializar as `8` linhas | COMUM | PRE | **AUTORIZA** |
| 10 | `$RSTC\03_ROLLBACK_LISTAGEM.txt` | `E3` `Out-File` | após `tar -t` do *rollback* | `Assert-Evidencia $RBLIST 22` | piso `22` **mais** `if ($rb_itens -ne 22) { throw }` | `E3` (guarda de cardinalidade) e `RB1` | `$rb_itens = 22` **exato** | `≠ 22` ⇒ `STOP` **antes** de `E5` | COMUM | PRE | **AUTORIZA** |
| 11 | `$RSTC\03_ROLLBACK_IDENTIDADE.txt` | `Assert-Identidade` `Set-Content` | dentro de `Assert-Identidade`, em `E3` | `Assert-Evidencia $Log 12` | piso `12` | auditoria | `VEREDITO=PASS`, `SO_EM_A=0`, `SO_EM_B=0` | qualquer sobra, falta ou duplicata | COMUM | PRE | **AUTORIZA** |
| 12 | `$RSTC\03_ROLLBACK_META.txt` | `E3` `Set-Content` | imediatamente após medir o TAR | `Assert-Evidencia $RBMETA 14` | piso `14` | **`RB1`** — relê caminho, *bytes*, `SHA256`, entradas e `EXEC_ROOT` | as cinco chaves conferem em `RB1` | qualquer chave ausente ou divergente | COMUM | PRE | **AUTORIZA** |
| 13 | `$RSTC\ROLLBACK-EXTRACTED\` | `E3A` `tar -x` **no `HOST`** | antes de `E4` | `Test-Path -PathType Container` | `22` entradas conferidas pelo comparador | `E3A` (`compare_state.py`) | árvore extraída legível | extração falha | COMUM | PRE | **AUTORIZA** |
| 14 | `$RSTC\03A_PRE_RESET_vs_ARTEFATO30.txt` | `E3A` `cmd.exe /c … > …` | após o comparador rodar | `Read-Comparador` ⇒ `Assert-Evidencia … 11` | piso `11` (3 de escopo + 7 contadores + veredito) | `E3A` | as `9` chaves presentes e numéricas | chave faltante, valor não numérico ou arquivo ausente | COMUM | PRE | **AUTORIZA** |
| 15 | `$RSTC\03A_VEREDITO.txt` | `E3A` `Set-Content` | após interpretar o comparador | `Assert-Evidencia $A3A_VER 14` | piso `14` | auditoria | veredito de escopo gravado | ausente ou `< 14` linhas | COMUM | PRE | **AUTORIZA** |
| 16 | `$RST\04_ENUM_ARQUIVOS.txt` | `E4` `Out-File` | primeira enumeração da rodada | `Test-Path` + leitura sem `SilentlyContinue` | **`Assert-Colecao $arqBrutos`** (`> 0`) | **`E5`** (dirige cada `rm -f`) e `RB5` | lista não vazia e `100 %` validada por `Test-CaminhoSeguro` | lista vazia ⇒ canal quebrado ⇒ `STOP` **antes** do 1º `rm` | POR RODADA | PRE | **DIRIGE** |
| 17 | `$RST\04_ENUM_DIRS.txt` | `E4` `Out-File` | junto com a enumeração de arquivos | `Assert-Evidencia $E4_DIR 3` | piso `3` | `E4` e `E5` | as três raízes nomeadas presentes | `< 3` linhas ou raiz ausente | POR RODADA | PRE | **DIRIGE** |
| 18 | `$RST\04_RESIDUOS.txt` | `E4` `Set-Content` com cabeçalho | após classificar resíduos | `Assert-Evidencia $E4_RES 1` | piso `1` (o cabeçalho garante `≥ 1`) | auditoria | inventário gravado | ausente ou vazio | POR RODADA | PRE | **AUTORIZA** |
| 19 | `$RST\04_VALIDACAO.txt` | `E4` `Set-Content`, **nos dois caminhos** | após validar toda a lista | `Assert-Evidencia $E4_VAL 10` | piso `10` | auditoria | `100 %` dos caminhos aprovados | qualquer caminho reprovado | POR RODADA | PRE | **AUTORIZA** |
| 20 | `$RST\04A_SELINUX_PRE.txt` | `E4A` `Out-File -Append` | um `ls -Zd` por alvo, `22` linhas | `Assert-Evidencia $A4A $PRE_PATH_COUNT` | **`Assert-Colecao … $ALVOS_META.Count`** (exata) | **`E7A`** (mapa `PRE`) e `E4E` | `22` contextos não vazios | `EXIT ≠ 0`, contexto vazio ou contagem `≠ 22` | POR RODADA | PRE | **AUTORIZA** |
| 21 | `$RST\04A_SELINUX_PRE_BRUTO.txt` | `E4A` `Out-File -Append` | **antes** de validar cada linha | `Assert-Evidencia` no produtor | piso = nº de alvos | diagnóstico | linha bruta preservada | ausência do bruto ⇒ `STOP` **no produtor** | POR RODADA | PRE | **NÃO** |
| 22 | `$RST\04A_SELINUX_PRE_META.txt` | `E4A` `Set-Content` | fechamento de `E4A` | `Assert-Evidencia $A4A_MET 5` | piso `5` | auditoria | `PRE_CONTEXTOS_VAZIOS=0` | ausente ou `< 5` linhas | POR RODADA | PRE | **NÃO** |
| 23 | `$RST\04B_MODE_PRE.txt` **(árbitro, `6` campos)** | `E4B` `New-Projecao` + `Out-File -Append` | uma linha projetada por alvo | `Assert-Projecao $A4B $PRE_META_COUNT` | exata `22` **e** `6` campos por linha | **`E7B`** (`Import-Meta`), **`E4D.3`** (revalidação) | `22` linhas, todas com `6` campos | qualquer linha fora de `6` campos ⇒ `STOP` **antes** de `E5` | POR RODADA | PRE | **AUTORIZA** |
| 24 | `$RST\04B_MODE_PRE_BRUTO.txt` **(`8` campos, com `%Y`)** | `E4B` `Out-File -Append` | antes de projetar | `Assert-Evidencia $A4B_BR $ALVOS_META.Count` | piso `22` | **apenas `E7C`** (`Read-MtimeBruto`) | linha bruta preservada | ausência ⇒ `STOP` **no produtor** `E4B` | POR RODADA | PRE | **NÃO** — nenhum caminho de `STOP` o lê |
| 25 | `$RST\04B_MODE_PRE_PROJECAO.txt` | `Assert-Projecao` `Set-Content` | dentro do próprio `Assert-Projecao` | `Assert-Evidencia $Log 9` | piso `9` | auditoria | `LINHAS_FORA_DE_6_CAMPOS=0`, `CONTEM_MTIME=NAO` | qualquer linha fora de `6` campos | POR RODADA | PRE | **AUTORIZA** |
| 26 | `$RST\04B_MODE_PRE_META.txt` | `E4B` `Set-Content` | fechamento de `E4B` | `Assert-Evidencia $A4B_MET 15` | piso `15` | auditoria | `ARBITRO_CONTEM_MTIME=NAO` gravado | ausente ou `< 15` linhas | POR RODADA | PRE | **NÃO** |
| 27 | `$RST\04C_STDIN_PROBE.txt` | `E4C` `cmd.exe /c … > …` (literal por rodada) | `tar -t` por `stdin`, **sem mutar nada** | `Assert-Evidencia $P4C 22` | piso `22` **mais** identidade exata | `E4C` | `22` entradas idênticas ao conjunto selado | `≠ 22` ou nome divergente ⇒ `STOP` **antes** de `E5` | POR RODADA | PRE | **AUTORIZA** |
| 28 | `$RST\04C_STDIN_PROBE_STDERR.txt` | `E4C` `cmd.exe /c … 2> …` | no mesmo comando | **`Assert-Stderr`** — ausência é `STOP` | `0` linhas úteis | `E4C` | existe e tem `0` linhas úteis | ausente ou `≠ 0` linhas | POR RODADA | PRE | **AUTORIZA** |
| 29 | `$RST\04C_STDIN_PROBE_STDERR.txt.PROVA.txt` | `Assert-Stderr` `Set-Content` | dentro do *helper* | `Assert-Evidencia $prova 8` | piso `8` | auditoria | `VEREDITO=PASS` | não materializar | POR RODADA | PRE | **AUTORIZA** |
| 30 | `$RST\04C_STDIN_PROBE_IDENTIDADE.txt` | `Assert-Identidade` `Set-Content` | após `tar -t` | `Assert-Evidencia $Log 12` | piso `12` | auditoria | `SO_EM_A=0` e `SO_EM_B=0` | qualquer divergência nomeada | POR RODADA | PRE | **AUTORIZA** |
| 31 | `$RST\04C_STDIN_PROBE_META.txt` | `E4C` `Set-Content` | fechamento de `E4C` | `Assert-Evidencia $P4C_MET 15` | piso `15` | auditoria | `STDIN_CHANNEL_PROBE_BEFORE_DESTRUCTION=SIM` | ausente ou `< 15` linhas | POR RODADA | PRE | **AUTORIZA** |
| 32 | `$RST\04D_STAT_PROBE.txt` | `E4D` `Set-Content` | sonda de caminho único, antes de `E5` | `Assert-Evidencia` + *parse* com `throw` | `8` campos exigidos na sonda | `E4D` | `EXIT = 0`, saída não vazia, `8` campos parseáveis | `stat` ausente, mudo ou com formato inesperado | POR RODADA | PRE | **AUTORIZA** |
| 33 | `$RST\04D_PROJECAO_REVALIDADA.txt` | `Assert-Projecao` `Set-Content` | `E4D.3`, **último ponto `READ-ONLY`** | `Assert-Evidencia $Log 9` | piso `9` | auditoria | `04B_MODE_PRE.txt` revalidado com `6` campos | uma única linha de `8` campos ⇒ `STOP` **antes** de `E5` | POR RODADA | PRE | **AUTORIZA** |
| 34 | `$RST\04D_STAT_PROBE_META.txt` | `E4D` `Set-Content` | fechamento de `E4D` | `Assert-Evidencia $P4D_MET 17` | piso `17` | auditoria | `STAT_PROBE_BEFORE_E5=SIM` | ausente ou `< 17` linhas | POR RODADA | PRE | **AUTORIZA** |
| 35 | `$RST\04E_SELINUX_PROBE.txt` | `E4E` `Set-Content` | sonda de `ls -Z`, antes de `E5` | `Assert-Evidencia` + `$RX_SECTX` | contexto com `≥ 3` `:` | `E4E` | sonda devolve contexto reconhecível | `ls -Z` ausente ou sem contexto | POR RODADA | PRE | **AUTORIZA** |
| 36 | `$RST\04E_SELINUX_PRE_IDENTIDADE.txt` | `Assert-Identidade` `Set-Content` | `E4E.3` | `Assert-Evidencia $Log 12` | piso `12` | auditoria | conjunto do **arquivo** idêntico aos `22` selados | qualquer sobra ou falta | POR RODADA | PRE | **AUTORIZA** |
| 37 | `$RST\04E_SELINUX_PRE_MAPA_IDENTIDADE.txt` | `Assert-Identidade` `Set-Content` | `E4E.3` | `Assert-Evidencia $Log 12` | piso `12` | auditoria | conjunto do **mapa em memória** idêntico aos `22` | qualquer sobra ou falta | POR RODADA | PRE | **AUTORIZA** |
| 38 | `$RST\04E_SELINUX_PROBE_META.txt` | `E4E` `Set-Content` | fechamento de `E4E` | `Assert-Evidencia $P4E_MET 14` | piso `14` | auditoria | `SELINUX_PROBE_BEFORE_E5=SIM`, `SELINUX_EMPTY_PASS_VECTOR=NONE` | ausente ou `< 14` linhas | POR RODADA | PRE | **AUTORIZA** |
| 39 | `$RST\04F_ESPACO.txt` | `E4F` `Set-Content` | medição de `df` no aparelho e no `HOST` | `Assert-Evidencia $P4F 9` | piso `9` | `E4F` | `≥ 64 MB` no aparelho **e** `≥ 1024 MB` no `HOST` | abaixo da margem ⇒ `STOP` **fora** da janela destrutiva | POR RODADA | PRE | **AUTORIZA** |
| 40 | `$RST\05_REMOCAO_LOG.txt` | `E5.1`/`E5.2` `Out-File -Append` | **uma linha por `rm`**, durante a remoção | `Assert-Evidencia $A5L $FILES_DELETED_BY_E5` | piso = nº de remoções contadas em memória | `E5` | log com tantas linhas quantas remoções | log menor que o contador ⇒ escrita perdida | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 41 | `$RST\05_POS_REMOCAO.txt` | `E5.3` `Out-File`, **arquivo pré-criado** | após todos os `rm` | `Test-Path` sobre arquivo pré-criado | `0` linhas é o `PASS` esperado | `E5.3` | `find -type f` vazio **com o canário vivo** | qualquer arquivo remanescente | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 42 | `$RST\05_POS_REMOCAO_DIRS.txt` | `E5.3` `Out-File` | após todos os `rm` | `Assert-Evidencia $A5D 3` | piso `3` — **canário da regra `A-2`** | `E5.3` | as três raízes sobrevivem | `< 3` ⇒ a enumeração quebrou, não a remoção acertou | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 43 | `$RST\06_EXTRACAO.txt` | `E6` `cmd.exe /c … > … 2>&1` (literal por rodada) | durante `tar -x` por `stdin` | `Test-Path` + leitura + linha `E6_EXTRACAO_EXIT` | `$e6_ruido = 0` | `E6` | `EXIT = 0` **gravado** e ruído `0` | `EXIT ≠ 0` ou linha inesperada | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 44 | `$RST\07_ESTRUTURA_POS.txt` | `E7` `Out-File` | após a extração | `Assert-Evidencia $A7 14` | `Assert-Colecao … 14` nos dois lados | `E7` | `14` arquivos idênticos por nome à baseline | falta, sobra ou duplicata | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 45 | `$RST\07_ESTRUTURA_IDENTIDADE.txt` | `Assert-Identidade` `Set-Content` | dentro de `E7` | `Assert-Evidencia $Log 12` | piso `12` | auditoria | `SO_EM_A=0` e `SO_EM_B=0` | qualquer divergência nomeada | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 46 | `$RST\07A_SELINUX_POST.txt` | `E7A` `Out-File -Append` | um `ls -Zd` por alvo | `Test-Path` + **`Import-Indexado`** (ausente ⇒ `throw`) | `Assert-Colecao … 22` + `Assert-Identidade … 22` | `E7A` e **`I9`** | `22` chaves idênticas ao conjunto selado | ausente, vazio, `≠ 22` ou nome divergente | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 47 | `$RST\07A_SELINUX_POST_BRUTO.txt` | `E7A` `Out-File -Append` | antes de validar cada linha | `Assert-Evidencia` no produtor | piso = nº de alvos | diagnóstico | linha bruta preservada | ausência ⇒ `STOP` no produtor | POR RODADA | **POST** | **NÃO** |
| 48 | `$RST\07A_SELINUX_POST_IDENTIDADE.txt` | `Assert-Identidade` `Set-Content` | prova **(A)** de `E7A` | `Assert-Evidencia $Log 12` | piso `12` | auditoria | `POST` **igual** aos `22` selados | `22` nomes errados também dariam `22` ⇒ aqui param | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 49 | `$RST\07A_SELINUX_PRE_COBERTURA.txt` | `Assert-Identidade` `Set-Content` | prova **(B)** de `E7A` | `Assert-Evidencia $Log 12` | piso `12` | auditoria | `PRE` **cobre** os `22` — condição que torna `POST ⊆ PRE` significativo | `PRE` arbitrário satisfazendo o subconjunto por vacuidade | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 50 | `$RST\07A_SELINUX_DOMINIO.txt` | `E7A` `Set-Content` | após formar a interseção | `Assert-Evidencia $A7A_DOM 19` | piso `19` | **`I9`** | domínio `= 22` por identidade dos dois lados | domínio `≠ 22` | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 51 | `$RST\07A_SELINUX_DIFF.txt` | `E7A` `Out-File` | após comparar contextos | `Test-Path` + contagem | `0` divergências materiais | `E7A` | `Count = 0` **sobre domínio provado de `22`** | qualquer divergência material — **sem** `restorecon`/`chcon` | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 52 | `$RST\07B_MODE_POST.txt` **(árbitro, `6` campos)** | `E7B` `New-Projecao` + `Out-File -Append` | uma linha projetada por alvo | **`Assert-Projecao $A7B $ALVOS_POS.Count`** | exata `22` **e** `6` campos por linha | `E7B` (`Import-Meta`) e **`I9`** | `22` linhas, todas com `6` campos | qualquer linha de `8` campos — única rota de `mtime` até `I9` | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 53 | `$RST\07B_MODE_POST_BRUTO.txt` **(`8` campos, com `%Y`)** | `E7B` `Out-File -Append` | antes de projetar | `Assert-Evidencia $A7B_BR $ALVOS_POS.Count` | piso `22` | **apenas `E7C`** (`Read-MtimeBruto`) | linha bruta preservada | ausência ⇒ `STOP` **no produtor** `E7B` | POR RODADA | **POST** | **NÃO** — nenhum caminho de `STOP` o lê |
| 54 | `$RST\07B_MODE_POST_PROJECAO.txt` | `Assert-Projecao` `Set-Content` | dentro do *helper*, em `E7B` | `Assert-Evidencia $Log 9` | piso `9` | auditoria | `CONTEM_MTIME=NAO` gravado sobre arquivo **relido** | `LINHAS_FORA_DE_6_CAMPOS ≠ 0` | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 55 | `$RST\07B_MODE_POST_IDENTIDADE.txt` | `Assert-Identidade` `Set-Content` | prova de igualdade de `E7B` | `Assert-Evidencia $Log 12` | piso `12` | auditoria | `POST` **igual** aos `22` selados | sobra, falta ou duplicata | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 56 | `$RST\07B_MODE_PRE_COBERTURA.txt` | `Assert-Identidade` `Set-Content` | prova da condição prévia de `E7B` | `Assert-Evidencia $Log 12` | piso `12` | auditoria | `PRE` cobre os `22` | subconjunto satisfeito por `PRE` arbitrário | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 57 | `$RST\07B_MODE_TABELA_IDENTIDADE.txt` | `Assert-Identidade` `Set-Content` | prova da tabela §2.2 | `Assert-Evidencia $Log 12` | piso `12` | auditoria | `$MODO_ESPERADO` idêntico aos `22` alvos | tabela selada divergente do escopo | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 58 | `$RST\07B_MODE_DOMINIO.txt` | `E7B` `Set-Content` | após formar a interseção | `Assert-Evidencia $A7B_DOM 20` | piso `20` | **`I9`** | domínio `= 22` | domínio `≠ 22` | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 59 | `$RST\07B_MODE_DIFF.txt` | `E7B` `Out-File` | após comparar modo, `uid`, `gid` | `Test-Path` + contagem | `0` divergências | `E7B` | `Count = 0` sobre domínio provado | qualquer divergência de modo, dono ou grupo | POR RODADA | **POST** | **ACIONA ROLLBACK** |
| 60 | `$RST\07C_MTIME.txt` | `E7C` `Out-File -Append` | último passo da janela | **nenhuma** — *exceção declarada e única* | **nenhuma** | **NENHUM** — terminal por construção | não avalia `PASS` | **não existe** `STOP` originado aqui | POR RODADA | **POST** | **NÃO** — `MTIME_GATE = DIAGNOSTIC_ONLY` |
| 61 | `$EXEC\acervo\13_PIDOF.txt` | item `13` `Set-Content` | antes de capturar o TAR final | `Assert-Evidencia $T_PID 3` | piso `3` | item `13` | `PIDOF_LINHAS=0` **lido do arquivo** | `≠ 0` — o `EXIT` do `pidof` **não** é gate (`PIDOF_EXIT_E_GATE=NAO`) | PÓS-RODADAS | **POST** | **NÃO** |
| 62 | `$EXEC\acervo\TAR-ENTRY-POS-RESET.tar` | item `13` `cmd.exe /c … > …` | captura por `stdout`, **nunca** gravando no aparelho | `Get-Item .Length` + `Get-FileHash` | `22` entradas via listagem | item `14`, `E8` | *bytes* `> 0`, `SHA256` gravado, `22` entradas | ausente, `0` *bytes* ou `≠ 22` | PÓS-RODADAS | **POST** | **NÃO** |
| 63 | `$EXEC\acervo\13_TAR_STDERR.txt` | item `13` `cmd.exe /c … 2> …` | no mesmo comando | **`Assert-Stderr $T_ERR 'ITEM13.TAR_POS_RESET'`** | `0` linhas úteis | item `13` | existe e tem `0` linhas úteis | **ausente** (canal falhou) ou `≠ 0` linhas | PÓS-RODADAS | **POST** | **NÃO** |
| 64 | `$EXEC\acervo\13_TAR_STDERR.txt.PROVA.txt` | `Assert-Stderr` `Set-Content` | dentro do *helper* | `Assert-Evidencia $prova 8` | piso `8` | auditoria | `VEREDITO=PASS` | não materializar | PÓS-RODADAS | **POST** | **NÃO** |
| 65 | `$EXEC\acervo\13_TAR_LISTAGEM.txt` | item `13` `Out-File` | após `tar -t` do TAR capturado | `Assert-Evidencia $T_LIST 22` | piso `22` + `if ($t_itens -ne 22)` | item `13` | `22` entradas exatas | `≠ 22` | PÓS-RODADAS | **POST** | **NÃO** |
| 66 | `$EXEC\acervo\13_TAR_META.txt` | item `13` `Set-Content` | fechamento do item `13` | `Assert-Evidencia $T_META 16` | piso `16` | auditoria | `TAR_CAPTURE_ON_DEVICE=NAO` gravado | ausente ou `< 16` linhas | PÓS-RODADAS | **POST** | **NÃO** |
| 67 | `$EXEC\acervo\POS-RESET-EXTRACTED\` | item `14` `tar -x` **no `HOST`** | antes do comparador | `Test-Path -PathType Container` | `22` entradas | item `14` | árvore extraída legível | extração falha | PÓS-RODADAS | **POST** | **NÃO** |
| 68 | `$EXEC\acervo\14_POS-RESET-vs-BASELINE.txt` | item `14` `cmd.exe /c … > …` | saída do comparador | `Read-Comparador` ⇒ `Assert-Evidencia … 11` | piso `11` | item `14` | `7` contadores em `0` | qualquer contador `≠ 0` ⇒ `ENTRY_STATE_RESULT` negativo | PÓS-RODADAS | **POST** | **NÃO** |
| 69 | `$EXEC\acervo\14_VEREDITO.txt` | item `14` `Set-Content` | após interpretar o comparador | `Assert-Evidencia $A14_VER 14` | piso `14` | auditoria | veredito de entrada gravado | ausente ou `< 14` linhas | PÓS-RODADAS | **POST** | **NÃO** |
| 70 | `$EXEC\acervo\E8_POS-RESET-vs-ARTEFATO30.txt` | `E8` `cmd.exe /c … > …` | saída do comparador | `Read-Comparador` ⇒ `Assert-Evidencia … 11` | piso `11` | `E8` | escopo conforme o artefato `30` | divergência de escopo | PÓS-RODADAS | **POST** | **NÃO** |
| 71 | `$EXEC\acervo\E8_VEREDITO.txt` | `E8` `Set-Content` | fechamento de `E8` | `Assert-Evidencia $A8_VER 13` | piso `13` | auditoria | veredito gravado | ausente ou `< 13` linhas | PÓS-RODADAS | **POST** | **NÃO** |
| 72 | `$RSTC\RB0_CONDICAO_OBSERVADA.txt` | `RB0` `Set-Content` | **primeiro** passo do *rollback* | `Assert-Evidencia $RB0F 14` | piso `14` | auditoria e `RB7` | `$ROLLBACK_PASSO` e `$ROLLBACK_MOTIVO` **não** `NAO_INFORMADO` | causa não registrada por `Set-CausaRollback` | COMUM | **POST** | **ACIONA ROLLBACK** |
| 73 | `$RSTC\RB1_LISTAGEM.txt` | `RB1` `Out-File` | relistagem do TAR de *rollback* | `Assert-Evidencia $RB1_LIST 22` | **exata `22`** (`-ne 22` ⇒ `STOP`) **e** igualdade com o META de `E3` | `RB1` | `22` entradas **e** contagem idêntica à gravada em `E3` | `≠ 22`, ou divergência do META ⇒ `STOP` **antes** de `RB2`/`RB3` | COMUM | **POST** | **DIRIGE** |
| 74 | `$RSTC\RB1_ROLLBACK_IDENTIDADE.txt` | `RB1` `Set-Content` | após recalcular *bytes* e `SHA256` | `Assert-Evidencia $RB1_OUT 17` | piso `17` | `RB2`, `RB3` (via `$ROLLBACK_VERIFICADO`) | caminho, `EXEC_ROOT`, *bytes*, `SHA256` e entradas conferem | qualquer divergência ⇒ **nenhuma remoção de `RB3`** | COMUM | **POST** | **DIRIGE** |
| 75 | `$RSTC\RB2_ENUM_PARCIAL.txt` | `RB2` `Out-File`, **pré-criado** | enumeração do estado parcial | `Test-Path` sobre arquivo pré-criado | validação integral de **todas** as linhas | `RB3.1` | `100 %` das linhas aprovadas em `Test-CaminhoSeguro` | uma linha reprovada ⇒ **nenhum `rm`** | COMUM | **POST** | **DIRIGE** |
| 76 | `$RSTC\RB2_ENUM_PARCIAL_DIRS.txt` | `RB2` `Out-File` | junto da enumeração | `Assert-Evidencia $RB2_DIRS 3` | piso `3` — **canário** | `RB2` | três raízes sobrevivem | `< 3` ⇒ enumeração quebrada, não "nada a remover" | COMUM | **POST** | **DIRIGE** |
| 77 | `$RSTC\RB2_VALIDACAO.txt` | `RB2` `Set-Content` | fechamento de `RB2` | `Assert-Evidencia $RB2_VAL 7` | piso `7` | auditoria | validação registrada | ausente ou `< 7` linhas | COMUM | **POST** | **DIRIGE** |
| 78 | `$RSTC\RB3_VALIDACAO.txt` | `RB3.1` `Set-Content` | **antes** do primeiro `rm` do *rollback* | `Assert-Evidencia $RB3_VAL 6` | piso `6` | `RB3.2` | `VALIDATE_ALL_BEFORE_FIRST_DELETE = SIM` | validação incompleta ⇒ nenhuma remoção | COMUM | **POST** | **DIRIGE** |
| 79 | `$RSTC\RB3_REMOCAO_LOG.txt` | `RB3.2` `Out-File -Append` | uma linha por `rm` | `Assert-Evidencia $RB3_LOG $rbArq.Count` | piso = nº de caminhos validados | auditoria | log completo, `EXIT` por linha | log menor que a lista validada | COMUM | **POST** | **DIRIGE** |
| 80 | `$RSTC\RB4_EXTRACAO.txt` | `RB4` `cmd.exe /c … > … 2>&1` | reextração do TAR de *rollback* | `Test-Path` + linha `RB4_EXTRACAO_EXIT` | `EXIT = 0` | `RB4` | `EXIT = 0` gravado | `EXIT ≠ 0` ⇒ `throw` | COMUM | **POST** | **ACIONA ROLLBACK** |
| 81 | `$RSTC\RB5_ESTRUTURA_RECUPERADA.txt` | `RB5` `Out-File` | após a reextração | `Test-Path` + `$rb5_ok_leitura` | comparada com `$RST\04_ENUM_ARQUIVOS.txt` | `RB5` | conjunto idêntico ao inventário de `E4` | **não lança** — `RB5` **classifica** | COMUM | **POST** | **NÃO** — classifica |
| 82 | `$RSTC\RB5_DIFF.txt` | `RB5` `Out-File` | após `Compare-Object` | `Test-Path` | `$rb5_dif.Count` | `RB5` | `0` diferenças ⇒ `RECUPERADO` | `> 0` ou leitura inválida ⇒ `INDETERMINATE` | COMUM | **POST** | **NÃO** — classifica |
| 83 | `$RSTC\RB5_VEREDITO.txt` | `RB5` `Set-Content` | fechamento de `RB5` | `Assert-Evidencia $RB5_VER 8` | piso `8` | **`RB7`** (via `$ROLLBACK_RESULT`) | `ROLLBACK_RESULT` gravado | ausente ou `< 8` linhas | COMUM | **POST** | **NÃO** — classifica |
| 84 | `$RSTC\RB6_NAO_CONTINUACAO.txt` | `RB6` `Set-Content` | após medir portas, `node`, `reverse` e artefatos do item `13` | `Assert-Evidencia $RB6F 16` | piso `16` | auditoria e `RB7` | infraestrutura **não** subida e item `13` **não** iniciado | **por desenho não lança** — o `STOP` terminal é de `RB7` | COMUM | **POST** | **NÃO** |
| 85 | `$RSTC\RB7_VEREDITO_FINAL.txt` | `RB7` `Set-Content` | **último** artefato da execução | `Assert-Evidencia $RB7F 14` | piso `14` | encerramento | não existe `PASS` — o *rollback* **sempre** termina em `STOP` | `throw 'R2P1_STOP_ENTRY_RESET_FAILED'` **literal** após gravar | COMUM | **POST** | **NÃO** |
| 86 | `$EXEC\acervo\TAR-RESTORE-01.tar` | `I2` `cmd.exe /c … > …` | *checkpoint* da rodada `01` | `Get-Item .Length` + `Get-FileHash` | `22` entradas | `I3`, `I7`, `I8` | *bytes* `> 0`, `22` entradas | ausente, `0` *bytes* ou `≠ 22` | RODADA `01` | **POST** | **NÃO** |
| 87 | `$EXEC\acervo\I2_TAR01_STDERR.txt` | `I2` `cmd.exe /c … 2> …` | no mesmo comando | **`Assert-Stderr $T01ERR 'I2.TAR_RESTORE_01'`** | `0` linhas úteis | `I2` | existe e tem `0` linhas úteis | ausente ou `≠ 0` linhas | RODADA `01` | **POST** | **NÃO** |
| 88 | `$EXEC\acervo\I2_TAR01_STDERR.txt.PROVA.txt` | `Assert-Stderr` `Set-Content` | dentro do *helper* | `Assert-Evidencia $prova 8` | piso `8` | auditoria | `VEREDITO=PASS` | não materializar | RODADA `01` | **POST** | **NÃO** |
| 89 | `$EXEC\acervo\I2_TAR01_LISTAGEM.txt` | `I2` `Out-File` | após `tar -t` | `Assert-Evidencia $T01LIST 22` | piso `22` | `I2` | `22` entradas | `≠ 22` | RODADA `01` | **POST** | **NÃO** |
| 90 | `$EXEC\acervo\I2_TAR01_META.txt` | `I2` `Set-Content` | fechamento de `I2` | `Assert-Evidencia $T01META 15` | piso `15` | auditoria | `22` linhas nos **três** árbitros de `$R01`, `$R02` **inexistente** | `$R02` já existente ⇒ `STOP` (contaminação entre rodadas) | RODADA `01` | **POST** | **NÃO** |
| 91 | `$EXEC\acervo\RESTORE-01-EXTRACTED\` | `I2` `tar -x` **no `HOST`** | antes de `I3` | `Test-Path -PathType Container` | `22` entradas | `I3`, `I7`, `I8` | árvore legível | extração falha | RODADA `01` | **POST** | **NÃO** |
| 92 | `$EXEC\acervo\I3_RESTORE01-vs-BASELINE.txt` | `I3` `cmd.exe /c … > …` | comparação da rodada `01` | `Read-Comparador` ⇒ `Assert-Evidencia … 11` | piso `11` | `I3` | `7` contadores em `0` | qualquer contador `≠ 0` | RODADA `01` | **POST** | **NÃO** |
| 93 | `$RST02\I4_VIRADA_DE_RODADA.txt` | `I4.0` `Set-Content` | **imediatamente após** `$RST = $RST02` | `Assert-Evidencia $I4_VIR 9` | piso `9` | auditoria e `I5` | `$RST` aponta para `$RST02` e **não** para `$RST01` | ponteiro não virado ⇒ rodada `02` escreveria sobre a `01` | RODADA `02` | PRE (da rodada `02`) | **AUTORIZA** |
| 94 | `$RST02\I4_E1_PIDOF_ANTES.txt` | `I4` `Set-Content` | revalidação de `E1` antes da rodada `02` | `Assert-Evidencia $I4_E1 5` | piso `5` | `I4` | `PIDS_ENCONTRADOS=0` | `≠ 0` | RODADA `02` | PRE (da rodada `02`) | **AUTORIZA** |
| 95 | `$RST02\I4_E2_INFRA_AUSENTE.txt` | `I4` `Set-Content` | revalidação de `E2` antes da rodada `02` | `Assert-Evidencia $I4_E2 10` | piso `10` | `I4` | portas, `node` e `reverse` em `0` | qualquer `≠ 0` | RODADA `02` | PRE (da rodada `02`) | **AUTORIZA** |
| 96 | `$EXEC\acervo\TAR-RESTORE-02.tar` | `I5` `cmd.exe /c … > …` | *checkpoint* da rodada `02` | `Get-Item .Length` + `Get-FileHash` | `22` entradas | `I6`, `I7`, `I8` | *bytes* `> 0`, `22` entradas | ausente, `0` *bytes* ou `≠ 22` | RODADA `02` | **POST** | **NÃO** |
| 97 | `$EXEC\acervo\I5_TAR02_STDERR.txt` | `I5` `cmd.exe /c … 2> …` | no mesmo comando | **`Assert-Stderr $T02ERR 'I5.TAR_RESTORE_02'`** | `0` linhas úteis | `I5` | existe e tem `0` linhas úteis | ausente ou `≠ 0` linhas | RODADA `02` | **POST** | **NÃO** |
| 98 | `$EXEC\acervo\I5_TAR02_STDERR.txt.PROVA.txt` | `Assert-Stderr` `Set-Content` | dentro do *helper* | `Assert-Evidencia $prova 8` | piso `8` | auditoria | `VEREDITO=PASS` | não materializar | RODADA `02` | **POST** | **NÃO** |
| 99 | `$EXEC\acervo\I5_TAR02_LISTAGEM.txt` | `I5` `Out-File` | após `tar -t` | `Assert-Evidencia $T02LIST 22` | piso `22` | `I5` | `22` entradas | `≠ 22` | RODADA `02` | **POST** | **NÃO** |
| 100 | `$EXEC\acervo\I5_CARDINALIDADE_POR_RODADA.txt` | `I5` `Set-Content` | após medir os **seis** árbitros | `Assert-Evidencia $I5_CARD 10` | piso `10`; cada medição é `Assert-Evidencia … 22` | auditoria e `I9` | `22 + 22`, **nunca `44`** num arquivo só | qualquer árbitro com contagem `≠ 22` | PÓS-RODADAS | **POST** | **NÃO** |
| 101 | `$EXEC\acervo\I5_TAR02_META.txt` | `I5` `Set-Content` | fechamento de `I5` | `Assert-Evidencia $T02META 15` | piso `15` | auditoria | raízes independentes, sem `Copy-Item` entre rodadas | evidência de acumulação entre rodadas | RODADA `02` | **POST** | **NÃO** |
| 102 | `$EXEC\acervo\RESTORE-02-EXTRACTED\` | `I5` `tar -x` **no `HOST`** | antes de `I6` | `Test-Path -PathType Container` | `22` entradas | `I6`, `I7`, `I8` | árvore legível | extração falha | RODADA `02` | **POST** | **NÃO** |
| 103 | `$EXEC\acervo\I6_RESTORE02-vs-BASELINE.txt` · `I7_RESTORE02-vs-RESTORE01.txt` · `I8_RESTORE01-vs-ARTEFATO30.txt` · `I8_RESTORE02-vs-ARTEFATO30.txt` | `I6`/`I7`/`I8` `cmd.exe /c … > …` | comparações finais | `Read-Comparador` ⇒ `Assert-Evidencia … 11` cada | piso `11` cada | `I6`, `I7`, `I8` | `7` contadores em `0` e interseção nomeada com `$PRODUTO_8` | qualquer contador `≠ 0` | PÓS-RODADAS | **POST** | **NÃO** |
| 104 | `$EXEC\I9_PROJECAO_R01.txt` · `$EXEC\I9_PROJECAO_R02.txt` | `Assert-Projecao` `Set-Content` | **antes** de `I9` comparar um único valor | `Assert-Evidencia $Log 9` cada | piso `9`; `22` linhas de `6` campos exigidas em cada raiz | auditoria | `CONTEM_MTIME=NAO` nas **duas** rodadas | uma linha de `8` campos em qualquer das duas raízes | PÓS-RODADAS | **POST** | **NÃO** |
| 105 | `$EXEC\I9_METADADOS_POR_RODADA.txt` | `I9` `Set-Content` | após comparar as duas rodadas | `Assert-Evidencia $I9F 14` | piso `14` | `I10` | `MTIME_CONSUMIDO_POR_I9=NAO` e `0` divergências | `$i9Dif.Count ≠ 0` | PÓS-RODADAS | **POST** | **NÃO** |
| 106 | `$EXEC\I10_LACRE.txt` | `I10` `Set-Content` | último artefato da execução bem-sucedida | `Assert-Evidencia $I10F 1` | piso `1` + `$n01`/`$n02` não nulos | encerramento | lacre gravado com as duas rodadas nomeadas | qualquer rodada sem contagem | PÓS-RODADAS | **POST** | **NÃO** |
| 107 | `$RSTC\RB_INTERROMPIDO_LACRE.txt` | `catch` interno de §`5.0` `Set-Content` | quando `RB1`…`RB4` interrompem o *rollback* antes de `RB7` | `Assert-Evidencia $RBIF 14` | piso `14` | encerramento — nenhum passo lê | lacre gravado com `ROLLBACK_CONCLUIDO=NAO` e `DEVICE_STATE=INDETERMINATE` | ausente ou `< 14` linhas ⇒ `STOP` (e o `throw` terminal ocorre de todo modo) | COMUM | **POST** | **NÃO** — o veredito já é `STOP`; este artefato o **registra** |

**Resultado da varredura:**

| token | valor | prova |
|---|---|---|
| artefatos auditados | **107 linhas**, cobrindo **todo** caminho declarado em qualquer linha `EVIDÊNCIA` | a tabela acima |
| `CONSUMED_EVIDENCE_WITHOUT_WRITER` | **0** | toda linha com `CONSUMIDOR ≠ nenhum` tem coluna `ESCRITOR` preenchida com comando literal |
| `ARBITER_WITHOUT_ASSERTION` | **0** | toda linha cuja coluna `DECISÃO DESTRUTIVA` é `AUTORIZA`, `DIRIGE` ou `ACIONA ROLLBACK` tem asserção de existência **e** de cardinalidade |
| `EMPTY_COLLECTION_FALSE_PASS_VECTORS` | **0** | ver §13.2 — **seis** vazios legítimos, todos com valor medido gravado **mais** canário independente; e os **cinco** arquivos de *stderr*, lidos só por `Assert-Stderr`, para o qual **ausência é `STOP`** |
| artefatos **sem** asserção | **3**, e nenhum deles arbitra — linhas `1` e `2` (`00_PREVOO.txt` e `12_dumpsys_package_raw.txt`: custódia de campanha **anterior**, sem escritor **neste** desenho, `CONSUMIDOR = nenhum`) e linha `60` (`07C_MTIME.txt`) | as três com `CONSUMIDOR = NENHUM` e `DECISÃO DESTRUTIVA = NÃO`; conferível varrendo a coluna `EXISTÊNCIA` da tabela acima em busca de `—` |
| artefatos que carregam `%Y` | **3** — `04B_MODE_PRE_BRUTO.txt`, `07B_MODE_POST_BRUTO.txt`, `07C_MTIME.txt` | os três com `DECISÃO DESTRUTIVA = NÃO`; ver §13.4 |

> **A propriedade que importa, dita sem rodeio.** Não existe, neste documento, um caminho que
> seja **lido** por um passo e não seja **gravado** por outro; e não existe um caminho capaz de
> produzir `PASS` ou `STOP` sem asserção executável sobre existência e cardinalidade. As três
> linhas sem asserção são **terminais por construção** — duas delas nem sequer têm escritor neste
> desenho (são custódia de campanha anterior, arroladas só para que a varredura seja exaustiva) e
> a terceira é `07C_MTIME.txt`; se qualquer uma não existisse, **nada** a leria. É essa estrutura,
> e não a prosa, que sustenta `MTIME_CAN_STOP = NÃO`.

---

### 13.1.1 Escritores que são *helpers*, não passos

Cinco artefatos da tabela acima **não** são gravados pelo passo que os nomeia, e sim por um
*helper* de §2.6. Isso é deliberado: o *helper* é o **único** lugar onde a asserção existe, e
por isso ela não pode ser esquecida em nenhum ponto de uso.

| *helper* | artefato que ele grava | asserção que ele impõe | por que o escritor é o *helper* |
|---|---|---|---|
| `Assert-Stderr` | `<captura>.PROVA.txt` | `Assert-Evidencia $prova 8` | separa **captura inexistente** de **captura vazia** antes de qualquer contagem — o vetor de `03_ROLLBACK_STDERR.txt` |
| `Assert-Identidade` | o `$Log` recebido | `Assert-Evidencia $Log 12` | nomeia cada sobra e cada falta; cardinalidade igual **não** é identidade |
| `Assert-Projecao` | o `$Log` recebido | `Assert-Evidencia $Log 9` | relê o **arquivo gravado** e exige `6` campos — é onde `MTIME_CAN_STOP = NÃO` deixa de ser promessa |
| `Assert-RaizNova` | a própria raiz | preexistência ⇒ `STOP` | impede que `-Append` de uma rodada acumule sobre a outra |
| `Set-CausaRollback` | `$ROLLBACK_PASSO` / `$ROLLBACK_MOTIVO` (memória, lidos por `RB0`) | valores vazios viram `NAO_INFORMADO` explicitamente | antes, `RB0` lia duas variáveis que **nenhuma linha escrevia** |

---

### 13.2 Auditoria transversal de coleção vazia

**Vetor combatido:** coleção vazia produzindo `Count = 0`, `0 divergências`, `'' -eq ''` ou
interseção vazia — e um humano lendo isso como sucesso. A regra `A-2` proíbe **qualquer**
comparação antes de `Assert-Colecao` nos dois lados; esta tabela lista onde o vazio é
**tecnicamente possível** e o que, em cada ponto, impede o falso `PASS`.

| ponto | vazio possível? | guarda executável | vazio é `PASS` legítimo? |
|---|---|---|---|
| `E0.1` `git rev-parse` | sim | `Assert-Colecao $g_branch 1` · `Assert-Colecao $g_head 1` | não |
| `E1` `pidof` | **sim, e é o `PASS`** | `Assert-Evidencia $E1F 4` grava a contagem; `if ($e1_pids.Count -ne 0)` | **sim** — provado pelo arquivo, não pela ausência |
| `E2` portas/`node`/`reverse` | **sim, e é o `PASS`** | `Assert-Evidencia $E2F 9`; 4 condições sobre contagens gravadas | **sim** — idem |
| `E3` listagem do TAR | não | `Assert-Evidencia` + `-ne 22` | não |
| `E3A`/item `14`/`E8` saída do comparador | sim | `Read-Comparador` exige 9 chaves e 7 contadores numéricos | não |
| `E4` `-type f` | não (há `RKStorage`) | **`Assert-Colecao $arqBrutos`** | **não** — canal quebrado |
| `E4` `-type d` | não (3 raízes) | `Assert-Evidencia $A4D 3` + 3 raízes nomeadas | não |
| `E4A`/`E4B` mapas `PRE` | não | `Assert-Colecao … 22` nos dois | não |
| `E4C` listagem por `stdin` | não | `Assert-Colecao … 22` + conjunto nos dois lados | não |
| `E4D`/`E4E` sondas | não | `Assert-Evidencia` + *parse* com `throw` | não |
| `E4F` linha do `df` | não | `Assert-Colecao $dfLinha 1` | não |
| `E5.3` `-type f` | **sim, e é o `PASS`** | arquivo **pré-criado** + `Test-Path` + canário `Assert-Evidencia $A5D 3` | **sim** — o canário separa "vazio de verdade" de "leitura quebrada" |
| `E7` estrutura | não | `Assert-Evidencia … 14` + `Assert-Colecao` nos dois | não |
| `E7A` domínio de comparação | não | `Assert-Colecao` em `PRE`, `POST` e no domínio; `POST ⊆ PRE` | não |
| `E7B` mapas de modo | não | `Assert-Colecao … 22` nos dois | não |
| `E7C` projeção de `mtime` | irrelevante | **não avalia `PASS`** — sem condição, não há falso `PASS` | n/a |
| item `13` `pidof` | **sim, e é o `PASS`** | `13_PIDOF.txt` gravado + condição sobre a contagem | **sim** |
| `RB2` `-type f` | **sim, e é o `PASS`** | pré-criado + `Assert-Evidencia $RB2_DIRS 3` como canário | **sim** |
| `RB3.1` lista carregada | sim | validação integral de **todas** as linhas antes do 1º `rm` | sim, com log |
| `RB5` diferenças | sim | classificação executável em `RECUPERADO`/`INDETERMINATE` | é registro, não `PASS` |
| `I3`/`I6`/`I7`/`I8` | sim | `Read-Comparador` + interseção nomeada com `$PRODUTO_8` | não |
| `I4` `E1'` `pidof` e `E2'` portas/`node`/`reverse` | **sim, e é o `PASS`** | `Assert-Evidencia $I4_E1 5` e `Assert-Evidencia $I4_E2 10`; as condições são sobre **contagens gravadas**, nunca sobre ausência | **sim** — mesmo aparato de `E1`/`E2`, na rodada `02` |
| `I9`/`I10` | sim | 4 arquivos por rodada + `$n01`/`$n02` não nulos | não |
| **os cinco arquivos de *stderr*** (`03_ROLLBACK`, `04C_STDIN_PROBE`, `13_TAR`, `I2_TAR01`, `I5_TAR02`) | **não** — `2> arquivo` sob `cmd.exe /c` **cria** o arquivo mesmo vazio | **`Assert-Stderr`**: ausência do arquivo é `STOP`; grava e autoafere `"$Caminho.PROVA.txt"` com `Assert-Evidencia … 8` | **não** — coleção vazia **sem** arquivo é falha de redirecionamento, não silêncio |

**`EMPTY_COLLECTION_FALSE_PASS_VECTORS = 0`.**

> **A distinção que sustenta o número.** Existem **seis** pontos em que a coleção vazia é o
> resultado **correto** (`E1`, `E2`, `E5.3`, item `13`, `RB2`, `I4`). Em nenhum deles o `PASS` decorre
> da ausência: decorre de um **valor medido e gravado** (`PIDS_ENCONTRADOS=0`,
> `PORTAS_OCUPADAS=0`, `ARQUIVOS_LISTADOS=0`) mais um **canário independente** que prova que o
> canal de medição estava vivo. Vazio **medido** e vazio **por falha** deixam de ser
> indistinguíveis — que era, exatamente, o defeito apontado.

---

### 13.3 Auditoria transversal de código de saída

**Regra `A-3`, na forma mais literal possível: ausência de exceção no *host* PowerShell NÃO é
sucesso do comando remoto.** `& $ADB …` **não** lança exceção quando o binário do aparelho
falha; o *stderr* do aparelho chega como **texto na saída**. Por isso:

| exigência | como o desenho cumpre |
|---|---|
| Todo comando externo tem seu `$LASTEXITCODE` **capturado em variável na linha imediatamente seguinte** — **`44` linhas de captura**, sob **`39` nomes distintos**, nenhuma lida depois de outro comando ter rodado | inventário literal, captura a captura, em §`13.3.1` |
| Existe uma **segunda forma legítima**: arbitragem direta de `$LASTEXITCODE` **na linha imediatamente seguinte ao comando**, sem variável intermediária | **`9` pontos**, todos em comandos de *host* (`tar`, `python`) nos passos `I2`, `I3`, `I5`, `I6/I7/I8` — inventariados em §`13.3.1`, tabela `B` |
| Total de pontos de arbitragem de código de saída | **`53`** = `44` capturas nomeadas + `9` arbitragens diretas. **`48`** terminam em `throw 'R2P1_STOP_ENTRY_RESET_FAILED'` |
| Exceções à cláusula `throw` | **`5`**, todas **declaradas, justificadas e gravadas em arquivo de evidência** — §`13.3.1`, tabela `C`. Nenhuma delas conclui `PASS` por ausência de exceção |
| **Não existe função `Assert-Exit`** | a arbitragem é `inline`. `DESIGN_02` declarava um `Assert-Exit` **sem nenhum ponto de chamada**: a disciplina era prometida por uma função morta. A promessa foi removida e substituída pelo inventário desta seção |
| *stderr* de todo canal binário é **redirecionado para arquivo** e lido **apenas** por `Assert-Stderr` | `03_ROLLBACK_STDERR.txt` · `04C_STDIN_PROBE_STDERR.txt` · `13_TAR_STDERR.txt` · `I2_TAR01_STDERR.txt` · `I5_TAR02_STDERR.txt`; `06_EXTRACAO.txt` e `RB4_EXTRACAO.txt` capturam `2>&1` **e** gravam a linha `…_EXTRACAO_EXIT` |
| Nenhuma linha inesperada de *stderr* é tolerada | `Assert-Stderr` faz `STOP` na **ausência** do arquivo (regra `A-4`) e `STOP` em qualquer linha; em `E6`, `$e6_ruido` conta linhas fora do conjunto esperado |
| O código de saída é **barreira auxiliar, nunca prova** | declarado em `A-3` e repetido na ressalva de `E5`: `rm -f` devolve `0` para arquivo inexistente e `$LASTEXITCODE` só atravessa `adb shell` com *shell protocol* `v2` |

> **Consequência direta:** **nenhum passo deste documento conclui `PASS` por não ter havido
> exceção.** Todo `PASS` é a comparação explícita de um valor medido contra um valor esperado, e
> todo valor medido está gravado em disco antes de ser comparado.

---

#### 13.3.1 Inventário literal das arbitragens de código de saída

Esta seção existe porque `DESIGN_02` afirmava uma disciplina de código de saída servida por uma
função (`Assert-Exit`) que **nunca era chamada**. A correção não foi criar pontos de chamada: foi
**inventariar o mecanismo que de fato existe** — arbitragem `inline` — captura a captura, para que
nenhuma linha desta auditoria descreva verificação inexistente.

**Tabela `A` — as `44` capturas nomeadas.** `THROW` significa `if (… -ne 0) { throw
'R2P1_STOP_ENTRY_RESET_FAILED' }`. A coluna `EVIDÊNCIA` diz se o valor observado também é
**gravado em arquivo**, e não só testado.

| # | passo | variável | comando externo | arbitragem | evidência |
|---|---|---|---|---|---|
| 1 | `E0` | `$g_ec1` | `git rev-parse --abbrev-ref HEAD` | `THROW` conjunto com `$g_ec2` e `$g_ec3` | `00_E0_INTEGRIDADE.txt` |
| 2 | `E0` | `$g_ec2` | `git rev-parse HEAD` | `THROW` conjunto | `00_E0_INTEGRIDADE.txt` |
| 3 | `E0` | `$g_ec3` | `git status --porcelain -uall` | `THROW` conjunto | `00_E0_INTEGRIDADE.txt` |
| 4 | `E1` | `$e1_ec` | `adb shell pidof` | **exceção `X-1`** — ver tabela `C` | `PIDOF_EXIT=` em `01_PIDOF_ANTES.txt` |
| 5 | `E2` | `$e2_ec_rev` | `adb reverse --list` | `THROW` | `REVERSE_LIST_EXIT=` em `02_INFRA_AUSENTE.txt` |
| 6 | `E3` | `$rb_exit` | `cmd.exe /c … exec-out … tar -c … > TAR` | `THROW` | `03_ROLLBACK_META.txt` |
| 7 | `E3` | `$rb_ec_list` | `tar -tvf` (*host*) | `THROW` | `03_ROLLBACK_LISTAGEM.txt` |
| 8 | `E3A` | `$a3a_ec_tar` | `tar -xf` (*host*) | `THROW` | `03A_PRE_RESET_vs_ARTEFATO30.txt` |
| 9 | `E3A` | `$a3a_ec_cmp` | `python $CMP` | `THROW` | idem + `03A_VEREDITO.txt` |
| 10 | `E4` | `$e4_ec_f` | `adb shell … find -type f` | `THROW` | `04_ENUM_ARQUIVOS.txt` |
| 11 | `E4` | `$e4_ec_d` | `adb shell … find -type d` | `THROW` | `04_ENUM_DIRS.txt` |
| 12 | `E4A` | `$ec` *(laço)* | `adb shell … ls -Zd` | `THROW` **dentro do laço**, após gravar | `EXIT=` em `04A_SELINUX_PRE_BRUTO.txt` |
| 13 | `E4B` | `$ec` *(laço)* | `adb shell … stat -c $FMT_BRUTO` | `THROW` **dentro do laço**, após gravar | `EXIT=` em `04B_MODE_PRE_BRUTO.txt` |
| 14 | `E4C` | `$p4c_exit` *(ramo `1`)* | `cmd.exe /c … tar -x` com `stdin` | `THROW` único, após os dois ramos | `04C_STDIN_PROBE_META.txt` |
| 15 | `E4C` | `$p4c_exit` *(ramo `2`)* | idem, segundo canal | `THROW` único | `04C_STDIN_PROBE_META.txt` |
| 16 | `E4D` | `$pl_ec` | `adb shell … stat -c $FMT_BRUTO` (sonda) | `THROW` | `PROBE\|…\|EXIT=` em `04D_STAT_PROBE.txt` |
| 17 | `E4E` | `$sl_ec` | `adb shell … ls -Zd` (sonda) | `THROW` | `PROBE\|…\|EXIT=` em `04E_SELINUX_PROBE.txt` |
| 18 | `E4F` | `$df_ec` | `adb shell df /data` | `THROW` | `04F_ESPACO.txt` |
| 19 | `E5` | `$e5_ec_rm` | `adb shell … rm -f` | `THROW` **dentro do laço**, após gravar | `RM\|…\|EXIT=` em `05_REMOCAO_LOG.txt` |
| 20 | `E5` | `$e5_ec_rd` | `adb shell … rmdir` | `THROW` **dentro do laço**, após gravar | `RMDIR\|…\|EXIT=` em `05_REMOCAO_LOG.txt` |
| 21 | `E5` | `$e5_ec_d` | `adb shell … find -type d` | `THROW` | `05_POS_REMOCAO_DIRS.txt` |
| 22 | `E5` | `$e5_ec_f` | `adb shell … find -type f` | `THROW` | `05_POS_REMOCAO.txt` |
| 23 | `E6` | `$e6_ec` *(ramo `1`)* | `cmd.exe /c … tar -x` `2>&1` | `THROW` único, após os dois ramos | `E6_EXTRACAO_EXIT=` em `06_EXTRACAO.txt` |
| 24 | `E6` | `$e6_ec` *(ramo `2`)* | idem, segundo canal | `THROW` único | `E6_EXTRACAO_EXIT=` em `06_EXTRACAO.txt` |
| 25 | `E7` | `$a7_ec` | `adb shell … find` (estrutura pós) | `THROW` | `07_ESTRUTURA_POS.txt` |
| 26 | `E7A` | `$ec` *(laço)* | `adb shell … ls -Zd` | `THROW` **dentro do laço**, após gravar | `EXIT=` em `07A_SELINUX_POST_BRUTO.txt` |
| 27 | `E7B` | `$ec` *(laço)* | `adb shell … stat -c $FMT_BRUTO` | `THROW` **dentro do laço**, após gravar | `EXIT=` em `07B_MODE_POST_BRUTO.txt` |
| 28 | item `13` | `$pid13_ec` | `adb shell pidof` | **exceção `X-2`** — ver tabela `C` | `PIDOF_EXIT=` em `13_PIDOF.txt` |
| 29 | item `13` | `$t_exit` | `cmd.exe /c … exec-out … tar -c … > TAR` | `THROW` | `13_TAR_META.txt` |
| 30 | item `13` | `$t_ec_list` | `tar -tvf` (*host*) | `THROW` | `13_TAR_LISTAGEM.txt` |
| 31 | item `14` | `$a14_ec_tar` | `tar -xf` (*host*) | `THROW` | `14_POS-RESET-vs-BASELINE.txt` |
| 32 | item `14` | `$a14_ec_cmp` | `python $CMP` | `THROW` | idem |
| 33 | `E8` | `$a8_ec` | `python $CMP` | `THROW` | `E8_POS-RESET-vs-ARTEFATO30.txt` |
| 34 | `RB1` | `$rb1_ec` | `tar -tf` (*host*) | `THROW` | `RB1_LISTAGEM.txt` |
| 35 | `RB2` | `$rb2_ec_f` | `adb shell … find -type f` | `THROW` | `RB2_ENUM_PARCIAL.txt` |
| 36 | `RB2` | `$rb2_ec_d` | `adb shell … find -type d` | `THROW` | `RB2_ENUM_PARCIAL_DIRS.txt` |
| 37 | `RB3.2` | `$rb3_ec` | `adb shell … rm -f` | `THROW` **dentro do laço**, após gravar | `RB3\|…\|EXIT=` em `RB3_REMOCAO_LOG.txt` |
| 38 | `RB4` | `$rb4_ec` | `cmd.exe /c … tar -x` | `THROW` | `RB4_EXTRACAO_EXIT=` em `RB4_EXTRACAO.txt` |
| 39 | `RB5` | `$rb5_ec` | `adb shell … find` (estrutura recuperada) | **exceção `X-4`** — ver tabela `C` | `RB5_ESTRUTURA_RECUPERADA.txt` |
| 40 | `RB6` | `$rb6_ec_rev` | `adb reverse --list` | **exceção `X-5`** — ver tabela `C` | `REVERSE_LIST_EXIT=` em `RB6_NAO_CONTINUACAO.txt` |
| 41 | `I2` | `$t01_ec` | `cmd.exe /c … exec-out … tar -c … > TAR01` | `THROW` | `I2_TAR01_META.txt` |
| 42 | `I4` | `$i4_ec_pid` | `adb shell pidof` | **exceção `X-3`** — ver tabela `C` | `PIDOF_EXIT=` em `I4_E1_PIDOF_ANTES.txt` |
| 43 | `I4` | `$i4_ec_rev` | `adb reverse --list` | `THROW` | `REVERSE_LIST_EXIT=` em `I4_E2_INFRA_AUSENTE.txt` |
| 44 | `I5` | `$t02_ec` | `cmd.exe /c … exec-out … tar -c … > TAR02` | `THROW` | `I5_TAR02_META.txt` |

> **Sobre as quatro capturas de laço (`$ec` em `E4A`, `E4B`, `E7A`, `E7B`) e as três de `E5`/`RB3`:**
> em todas elas a **gravação da linha bruta precede o `throw`**. Se o comando remoto falhar no
> alvo `k`, o arquivo de evidência já contém as `k` linhas produzidas até ali, e o `STOP` é
> auditável a partir do disco. O contrário — testar antes de gravar — apagaria a única prova de
> onde a execução parou.

**Tabela `B` — as `9` arbitragens diretas, sem variável intermediária.** Em todas, o `if` está na
**linha imediatamente seguinte** ao comando, sem nenhum outro comando externo no meio; `$LASTEXITCODE`
ainda é, portanto, o código daquele comando. Todas são comandos de *host* — nenhuma atravessa `adb`.

| # | passo | comando | forma |
|---|---|---|---|
| 1 | `I2` | `tar -tvf $T01` | `if ($LASTEXITCODE -ne 0) { throw … }` |
| 2 | `I2` | `tar -xf $T01 -C $X01` | idem |
| 3 | `I3` | `python $CMP $BASE_REF $X01 $I3F` | idem |
| 4 | `I5` | `tar -tvf $T02` | idem |
| 5 | `I5` | `tar -xf $T02 -C $X02` | idem |
| 6 | `I6` | `python $CMP $BASE_REF $X02 $I6F` | idem |
| 7 | `I7` | `python $CMP $X01 $X02 $I7F` | idem |
| 8 | `I8` | `python $CMP $A30_REF $X01 $I8A` | idem |
| 9 | `I8` | `python $CMP $A30_REF $X02 $I8B` | idem |

**Tabela `C` — as `5` exceções declaradas à cláusula `throw`.** São `5`, não `3`: `DESIGN_02`
contava apenas os três `pidof` e omitia `RB5` e `RB6`. **Nenhuma das cinco conclui `PASS` por
ausência de exceção**, e **todas as cinco gravam o código observado em arquivo**.

| id | passo | variável | por que não há `throw` | o que decide no lugar |
|---|---|---|---|---|
| `X-1` | `E1` | `$e1_ec` | `pidof` devolve **`1`** quando **não** encontra processo — e "não encontrar" é exatamente o `PASS` deste passo | `PIDS_ENCONTRADOS = 0`, **lido do arquivo** `01_PIDOF_ANTES.txt` após `Assert-Evidencia`. Arbitrar o código aqui reprovaria o estado correto |
| `X-2` | item `13` | `$pid13_ec` | idem `X-1`, no *pidof* que antecede o TAR pós-reset | `PIDS_ENCONTRADOS = 0` lido de `13_PIDOF.txt` |
| `X-3` | `I4` (`E1'`) | `$i4_ec_pid` | idem `X-1`, na revalidação de `E1` na rodada `02` | `PIDS_ENCONTRADOS = 0` lido de `I4_E1_PIDOF_ANTES.txt` |
| `X-4` | `RB5` | `$rb5_ec` | **`RB5` classifica, não lança.** Um `throw` em `RB5` pularia `RB6` e `RB7` e apagaria o lacre final do *rollback* | `if ($rb5_ec -ne 0) { $rb5_ok_leitura = $false }` — a falha **rebaixa o veredito** para `INDETERMINATE`, que `RB7` grava. Não existe caminho em que `$rb5_ec ≠ 0` produza `RECUPERADO` |
| `X-5` | `RB6` | `$rb6_ec_rev` | **`RB6` registra, não lança**, pela mesma razão de `RB5`: a execução **já** termina em `R2P1_STOP_ENTRY_RESET_FAILED` por força de `RB7`, e um `throw` aqui pularia `RB7` | `REVERSE_LIST_EXIT=$rb6_ec_rev` é gravado em `RB6_NAO_CONTINUACAO.txt`, arquivo submetido a `Assert-Evidencia $RB6F 16`. O código fica **legível na evidência**, sem poder suprimir o lacre |

> **`X-4` e `X-5` são a disciplina de *rollback*, não um relaxamento dela.** Todo o bloco `RB0..RB7`
> roda **dentro do `catch`** de §`5.0` — a execução **já está reprovada** quando `RB5` e `RB6`
> começam. A única coisa que um `throw` ali poderia fazer é **impedir o registro do que aconteceu**.
> É por isso que `ROLLBACK_DISCIPLINE_COMPLETE = SIM` depende de `RB5` e `RB6` **não** lançarem.

---

### 13.4 Varredura de `mtime` — prova de `MTIME_CAN_STOP = NÃO`

`MTIME_CAN_STOP = NÃO` **não** é sustentado por `E7C` não ter `throw`. Essa alegação, sozinha,
seria exatamente o tipo de argumento narrativo que a auditoria final reprovou: `E7C` é **um**
consumidor; a pergunta correta é se existe **algum outro**. Esta seção percorre **todos os
produtores e todos os consumidores** de tempo de modificação no documento inteiro.

**`mtime` só pode entrar no desenho por um lugar: o campo `%Y` de `stat`.** Não há `date`, não há
`ls -l`, não há `Get-ItemProperty LastWriteTime` sobre arquivo do aparelho, e o comparador
`compare_state.py` — instrumento lacrado, `4380 B`, `SHA256 A7649DD2…1EFDFD` — **não lê tempo**
(§`3.2`). Logo, a varredura de `%Y` é exaustiva por construção.

| # | ocorrência de `%Y` / `mtime` | natureza | pode causar `STOP`? |
|---|---|---|---|
| 1 | `$FMT_BRUTO = '%n:%a:%u:%g:%U:%G:%s:%Y'` | **produção** — declaração única do formato de `8` campos | **NÃO** — é uma *string*; o `STOP` que ela participa é o de **formato** (`Assert-Projecao` exige `6` campos no árbitro) |
| 2 | `04B_MODE_PRE_BRUTO.txt` | **registro** — `E4B`, `Out-File -Append`, `8` campos | **NÃO** — único leitor é `E7C` |
| 3 | `07B_MODE_POST_BRUTO.txt` | **registro** — `E7B`, `Out-File -Append`, `8` campos | **NÃO** — único leitor é `E7C` |
| 4 | `04A/07A_SELINUX_*_BRUTO.txt` | **registro** de `ls -Zd` | **NÃO** — `ls -Zd` não emite tempo; não há `%Y` nestes arquivos |
| 5 | `Read-MtimeBruto` | **leitura** — helper de `E7C`; `$c[7]` é o `%Y` | **NÃO** — a função **não contém `throw`**; devolve mapa vazio se o arquivo faltar |
| 6 | `07C_MTIME.txt` | **registro diagnóstico** — `E7C`, `Out-File -Append` | **NÃO** — `CONSUMIDOR = NENHUM`; terminal por construção (§`13.1`, item `60`) |
| 7 | §`2.2`, coluna *mtime* (−03:00) | **tabela documental** de baseline | **NÃO** — nenhuma linha executável a lê |
| 8 | §`3.2` `MTIME_GATE = DIAGNOSTIC_ONLY` | **norma** | **NÃO** — é a própria proibição |
| 9 | §`12`, matriz de *writers* (coluna `COMPROVAÇÃO`) e §`14` (`storage-info.pb`) | **evidência forense** de `logcat`/*mtime* da campanha **já ocorrida** | **NÃO** — documental; nenhuma linha executável lê essas tabelas |

**Os consumidores possíveis de metadado estrutural, e o que cada um lê:**

| consumidor | lê | contém `%Y`? | arbitra? |
|---|---|---|---|
| `E4B` (`Import-Meta` sobre `$A4B`) | **árbitro** `04B_MODE_PRE.txt`, `6` campos | **não** | sim |
| `E7B` (`Import-Meta` sobre `$A7B`) | **árbitro** `07B_MODE_POST.txt`, `6` campos | **não** | sim |
| `E7C` (`Read-MtimeBruto`) | **os dois `*_BRUTO.txt`** | **sim** | **não** — sem `throw` |
| `I9` | **árbitros das duas rodadas**, `$RST01\07B_MODE_POST.txt` e `$RST02\07B_MODE_POST.txt`, **cada um revalidado por `Assert-Projecao` antes da primeira comparação** | **não** | sim |
| `I10` | `I9_METADADOS_POR_RODADA.txt` (que grava `MTIME_CONSUMIDO_POR_I9=NAO`) | **não** | sim |
| item `14` / `E8` / `E3A` / `I3` / `I6` / `I7` / `I8` | saída de `compare_state.py` | **não** — o comparador não lê tempo | sim |

**Conclusão da varredura, verificável em tempo de execução e não só em prosa:**

1. `%Y` é **produzido** uma vez (`$FMT_BRUTO`), **registrado** em dois arquivos `*_BRUTO.txt` e
   **lido** por uma função (`Read-MtimeBruto`) que não tem `throw`. Não há quarto lugar.
2. Todo consumidor que **arbitra** lê **exclusivamente** um arquivo árbitro de `6` campos.
3. Cada arquivo árbitro é conferido por `Assert-Projecao`, que **relê o arquivo gravado** e faz
   `STOP` em qualquer linha fora de `6` campos — em `E4B`, `E4D.3`, `E7B` e **duas vezes** dentro
   de `I9`, uma por rodada. Uma única linha de `8` campos derruba a execução **no ponto que a
   produziu**, antes de o `mtime` alcançar qualquer comparação.
4. Portanto **`MTIME_CAN_STOP = NÃO`**, e a razão não é "`E7C` não lança": é que **nenhum caminho
   de `STOP` do desenho abre um arquivo que contenha `%Y`**.

> **O que exatamente foi corrigido.** Em `DESIGN_02`, `04B`/`07B` guardavam a saída **inteira** de
> `stat`, com `%Y`, e `I9` comparava essas linhas **byte a byte** entre as duas rodadas. Como `tar`
> restaura o `mtime`, mas duas restaurações do mesmo TAR podem legitimamente divergir em tempo,
> `I9` era capaz de reprovar a execução **por uma diferença esperada**. `MTIME_CAN_STOP = NÃO`
> estava escrito no documento e era **falso no aparato**. A correção não foi reescrever a frase:
> foi retirar `%s` e `%Y` do árbitro e tornar a ausência deles uma **asserção de tempo de execução**.

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

`HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` é **NÃO CONCEDIDO**.

Continuam **não autorizados**: qualquer comando ao tablet · qualquer restauração física ·
qualquer remoção física · abertura do aplicativo · Metro · `PS3` · `adb reverse` · *deep link* ·
execução real da idempotência · qualquer *retry* · mudança de baseline · qualquer tolerância ·
qualquer *allowlist* · `AC_5` · concessão de `F6_SG_A` · `R2P1_RETRY_03`.

**`compare_state.py` permanece selado em `A7649DD2B92C7877ADAF12635E032DBC559F4074558B572CA1EDF8A9821EFDFD` e este desenho não depende de alterá-lo.**

### 17.1 Escopo do `HUMAN GATE` — **um gate por tentativa**, sem herança

**Defeito corrigido.** O `HUMAN GATE` de primeira execução estava redigido de modo a poder ser
lido como cobrindo `RETRY_04`, `RETRY_05` e seguintes. Uma autorização destrutiva que se
**estende sozinha** para tentativas futuras é ampliação silenciosa: o responsável autorizaria
**uma** janela e o executor herdaria **todas**. Esta seção fecha isso pela raiz.

| tentativa | `HUMAN GATE` exigido | estado nesta data | o que ele cobre |
|---|---|---|---|
| `RETRY_03` | `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` | **NÃO CONCEDIDO** | **exatamente uma** execução do reset `E0..E8` + itens `13`/`14` + `I1..I10`, na versão deste documento cujo `SHA256` o gate citar |
| `RETRY_04` | `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_04` | **NÃO CONCEDIDO** | idem, **nova concessão**; não é renovação automática nem consequência do gate anterior |
| `RETRY_05` | `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_05` | **NÃO CONCEDIDO** | idem |
| `RETRY_06..N` | `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_<NN>` | **NÃO CONCEDIDO** | a série continua **nominalmente**; não existe gate "aberto" nem gate "de série" |

**Sete regras de escopo, todas em vigor:**

| # | regra |
|---|---|
| `G-1` | **Um gate autoriza uma tentativa.** Concluída ou interrompida a tentativa, o gate está **consumido** — mesmo que nenhum arquivo tenha sido removido |
| `G-2` | **Nenhum gate se estende** a `RETRY` seguinte, a outra baseline, a outro aparelho ou a outra raiz de evidência |
| `G-3` | **Todo gate cita o `SHA256` integral do documento** que autoriza. `E0.0` **exige** esse valor em `$GATE_SHA` e para em `R2P1_STOP_GATE_SEM_SHA` se ele não vier |
| `G-4` | **Documento diferente ⇒ gate diferente.** Se o desenho for alterado por qualquer motivo, o `SHA256` muda e o gate anterior deixa de conferir em `E0.0` — `R2P1_STOP_DESIGN_CUSTODY_DIVERGED` |
| `G-5` | O `ROLLBACK` (`RB0..RB7`) **faz parte** da mesma autorização da tentativa que o disparou: não exige segundo gate depois que a mutação começou. É a única extensão admitida, e ela é **para trás**, nunca para frente |
| `G-6` | **Nenhum gate desta série está concedido nesta data.** Esta emenda é documental; ela **não** concede, **não** solicita e **não** antecipa concessão |
| `G-7` | A concessão é ato **do responsável**, registrada em `docs/DECISIONS.md`. Nenhum agente concede a si mesmo, e nenhum relatório de agente equivale a concessão |

> **Por que a regra é nominal e não numérica.** Um gate chamado *"execução do reset"* seria
> reutilizável por leitura. Um gate chamado `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_04` só pode
> autorizar `RETRY_04`: **o nome carrega o escopo**. Isso é deliberado, e é o que impede que a
> autorização de uma janela destrutiva vire autorização permanente por desgaste de leitura.

O futuro `HUMAN GATE` de execução **deverá citar o `SHA256` integral deste documento**, de modo
que o executor não possa executar comandos diferentes dos auditados — e `E0.0` transforma essa
exigência em **barreira executável**, não em recomendação.

---

## 18. Auditoria estática final — quadro de tokens verificáveis

Cada linha abaixo é uma afirmação **verificável por leitura deste documento**, sem execução.
A coluna *onde verificar* dá a âncora — quem auditar não precisa acreditar em nenhuma delas.

**Tabela `I` — os `27` tokens terminais desta emenda.**

| # | token | valor | onde verificar |
|---:|---|---|---|
| 1 | `DESIGN_REPO_VS_CUSTODY` | **IDÊNTICOS** | `E0.0` — `SHA256` e *bytes* de `$DESIGN_REPO`, `$DESIGN_CUST` e `$GATE_SHA` comparados **antes** de `E0.1`; divergência ⇒ `R2P1_STOP_DESIGN_CUSTODY_DIVERGED` |
| 2 | `ROLLBACK_META_PERSISTED` | **SIM** | `E3` grava `03_ROLLBACK_META.txt` (`14` linhas) + `Assert-Evidencia … 14`; `RB1` **consome** as `5` chaves nomeadas |
| 3 | `ROLLBACK_HASH_ASSERTED` | **SIM** | `RB1` (4)/(5) — `Get-FileHash` **recalculado agora** e comparado a `ROLLBACK_TAR_SHA256` do meta |
| 4 | `ROLLBACK_SIZE_ASSERTED` | **SIM** | `RB1` (4)/(5) — `Get-Item … .Length` comparado a `ROLLBACK_TAR_BYTES` do meta |
| 5 | `ROLLBACK_EXEC_ROOT_ASSERTED` | **SIM** | `RB1` (2) — `$M['EXEC_ROOT'] -ne $EXEC`, `$M['ROLLBACK_TAR_PATH'] -ne $RB` e `-not $RB.StartsWith($EXEC)`, três `throw` distintos |
| 6 | `VALIDATE_ALL_BEFORE_FIRST_DELETE` | **SIM** | `RB3.1` (`READ-ONLY`, valida a lista **inteira** e grava `RB3_VALIDACAO.txt`) precede `RB3.2`, e `E3` prova `$rb_itens = 22` **antes** de `E5` |
| 7 | `PATH_TRAVERSAL_VECTOR` | **NONE** | §2.4 — `$RX_CAMINHO` **mais** validação por segmento; `Test-CaminhoSeguro` roda em `E5`, `RB3.1` e `RB3.2` |
| 8 | `STAT_PROBE_BEFORE_E5` | **SIM** | `E4D`, e `E5` lista `E4D PASS` como pré-condição cumulativa |
| 9 | `STAT_EMPTY_PASS_VECTOR` | **NONE** | `E4D` — `Assert-Evidencia` + *parse* com `throw`; saída vazia de `stat` **não** atravessa |
| 10 | `SELINUX_PROBE_BEFORE_E5` | **SIM** | `E4E`, idem, e `E5` a lista como pré-condição |
| 11 | `SELINUX_EMPTY_PASS_VECTOR` | **NONE** | `E4A` exige `context.Length > 0` **e** `$RX_SECTX` (≥ `3` `:`); contexto vazio é `STOP` no produtor |
| 12 | `SELINUX_CHECK_DESIGN_SAFE` | **SIM** | `E7A` — **duas** provas por `Assert-Identidade`: (A) `POST` **igual** aos `22` selados; (B) `PRE` **cobre** os `22`, condição que torna `POST ⊆ PRE` significativo. Contagem igual **nunca** decide sozinha |
| 13 | `META_EMPTY_PASS_VECTOR` | **NONE** | `E7B` grava `META_EMPTY_PASS_VECTOR=NONE` após `Assert-Colecao … 22` nos dois mapas e `Assert-Projecao` sobre o árbitro |
| 14 | `MODE_4XX_MUST_NOT_PASS_OWNER_RW_CHECK` | **SIM** | `E7B` — o teste é sobre o **dígito** do dono, exigindo equivalência a `6`; `4xx` reprova |
| 15 | `MTIME_CAN_STOP` | **NÃO** | §13.4, varredura integral: `%Y` existe em `$FMT_BRUTO`, em dois `*_BRUTO.txt` e em `Read-MtimeBruto` — e em mais lugar nenhum. **Nenhum caminho de `STOP` abre arquivo que contenha `%Y`**; `Assert-Projecao` reprova qualquer linha de `8` campos no árbitro, em `E4B`, `E4D.3`, `E7B` e **duas vezes** em `I9` |
| 16 | `SCOPE_HISTORICAL_CONFLICT_EXPLICITLY_SUPERSEDED` | **SIM** | §1.1 — cita `14_R2_SESSAO_2.md` §11 item `14` e §8.1 **literalmente**, e declara qual passa a valer |
| 17 | `I5_LITERAL_COMMANDS_PRESENT` | **SIM** | §8, `I5` — bloco **completo e literal**; não existe "trocar `01` por `02`" em lugar algum |
| 18 | `I4_REVALIDATES_E1_E2` | **SIM** | §8, `I4` — `E1'` (`pidof`, `Assert-Evidencia $I4_E1 5`) e `E2'` (portas, `node`, `reverse`, `Assert-Evidencia $I4_E2 10`) |
| 19 | `IDEMPOTENCE_EVIDENCE_PATHS_UNIQUE` | **SIM** | §2.7 — `$RSTC`/`$RST01`/`$RST02`; `Assert-RaizNova` **proíbe preexistência** de cada uma; nenhum `-Append` de uma rodada toca arquivo da outra |
| 20 | `IDEMPOTENCE_DESIGN_COMPLETE` | **SIM** | `I2` (raiz `02` **ainda não existe**), `I5` (`6` medições `Assert-Evidencia … 22` nas duas raízes, gravadas em `I5_CARDINALIDADE_POR_RODADA.txt`), `I9` (projeção revalidada por rodada), `I10` (discrimina `RODADA01`/`RODADA02`). `22 + 22`; **nenhuma rodada produz `44` por acumulação** |
| 21 | `CONSUMED_EVIDENCE_WITHOUT_WRITER` | **0** | §13.1, matriz de `107` artefatos — coluna `ESCRITOR` preenchida em **todas** as linhas; `INV-1` |
| 22 | `ARBITER_WITHOUT_ASSERTION` | **0** | §13.1 — coluna `EXISTÊNCIA` preenchida em toda linha com `DECISÃO DESTRUTIVA ≠ NÃO`; `INV-2`. As **três** linhas sem asserção — `1`, `2` e `60` — têm `CONSUMIDOR = nenhum` e `DECISÃO DESTRUTIVA = NÃO`; **nenhuma arbitra** |
| 23 | `EMPTY_COLLECTION_FALSE_PASS_VECTORS` | **0** | §13.2, tabela integral: `6` pontos com vazio legítimo, **todos** com valor medido gravado **e** canário independente; os `5` arquivos de *stderr* são lidos **apenas** por `Assert-Stderr`, para o qual ausência é `STOP` |
| 24 | `CRITICAL_EXIT_CODES_ASSERTED` | **SIM** | §13.3.1 — `44` capturas nomeadas + `9` arbitragens diretas = `53` pontos; `48` terminam em `throw`; as `5` exceções são nomeadas, justificadas **e gravadas em evidência** (tabela `C`) |
| 25 | `STDIN_CHANNEL_PROBE_BEFORE_DESTRUCTION` | **SIM** | `E4C` — prova **não destrutiva** do canal `stdin` (`tar -t` por `exec-in`), com `Assert-Stderr`, `Assert-Identidade` e `Assert-Evidencia $P4C_MET 15`, **antes** de `E5` |
| 26 | `ROLLBACK_DISCIPLINE_COMPLETE` | **SIM** | `Set-Passo` (**9** pontos de chamada literais: `6` na janela — `E5`,`E6`,`E7`,`E7A`,`E7B`,`E7C` — e `3` no *rollback* — `RB0`,`RB6`,`RB7`), `Set-CausaRollback` (escritor real de `$ROLLBACK_PASSO`/`$ROLLBACK_MOTIVO`), `try/catch` de §5.0 (acionador) e `RB0..RB7` **todos com bloco executável**, incluindo `RB6` e `RB7`; e o `catch` **interno** de §`5.0`, que grava `RB_INTERROMPIDO_LACRE.txt` quando `RB1`..`RB4` interrompem a cadeia — **nenhum desfecho termina sem arquivo de veredito** |
| 27 | `ULTRACODE_PLAN_SAFE` | **SIM** | artefato `33_R2P1_ULTRACODE_NEXT_EXECUTION_PLAN.md` — documental, sem comando executado, **sem gate concedido**, citando o `SHA256` deste desenho e o do objeto reprovado |

**Tabela `II` — tokens complementares, já vigentes e reconferidos.**

| # | token | valor | onde verificar |
|---:|---|---|---|
| 28 | `WILDCARDS_IN_DESTRUCTIVE_COMMANDS` | **0** | `E5.1`/`E5.2`/`RB3.2` — `rm -f -- <caminho>` e `rmdir -- <caminho>`, um caminho por chamada |
| 29 | `PM_CLEAR_PRESENT` | **NÃO** | busca textual por `pm clear`: só aparece como **proibição** |
| 30 | `INSTALL_PRESENT` | **NÃO** | nenhum `pm install`, `adb install` ou `install-multiple` |
| 31 | `UNINSTALL_PRESENT` | **NÃO** | nenhum `pm uninstall` ou `adb uninstall` |
| 32 | `ROOT_REQUIRED` | **NÃO** | todo acesso ao *sandbox* é por `run-as`; nenhum `adb root`, `su` ou `setenforce` |
| 33 | `COMPARE_STATE_EDIT_REQUIRED` | **NÃO** | o instrumento é **consumido**, nunca parametrizado; `E0.4` confere `SHA256` e *bytes* |
| 34 | `DEVICE_COMMANDS_NESTA_EMENDA` | **0** | esta emenda é documental; nenhum comando foi emitido ao aparelho para produzi-la |

> **O que este quadro NÃO é.** Não é prova de que os comandos **funcionam** no aparelho — nada
> aqui foi executado. É prova de que as **propriedades de segurança** afirmadas pelo documento
> são verificáveis **na letra do documento**, por qualquer auditor, **sem** ligar o tablet.

---

### 18.1 Varredura adversarial **desta** emenda — achados próprios, corrigidos antes do lacre

Os oito achados do `VERDE` estão fechados nos blocos acima. Esta seção registra o que a
**varredura própria** desta emenda encontrou **depois** de fechá-los — vetores que ninguém
apontou e que teriam sobrevivido ao lacre. Estão aqui porque **achado escondido é o defeito
que a próxima auditoria encontra**, e porque um documento que só relata o que lhe foi cobrado
não é auditável: é obediente.

**Método.** Varredura textual integral sobre o documento inteiro, eixo a eixo: toda ocorrência de
`-Append`; de `-ErrorAction SilentlyContinue`; de `Get-Content`; de `Test-Path`; de
`Assert-Evidencia`, `Assert-Colecao`, `Assert-Stderr`, `Assert-Identidade`, `Assert-Projecao`,
`Assert-RaizNova`; de `throw`; de `%Y` e de qualquer consumidor de *mtime*; de cada par
`PRE`/`POST`; de cada escritor e cada leitor de `SELinux`; de cada caminho de *rollback*; de
`HUMAN GATE`; de `RETRY_03`, `RETRY_04`, `RETRY_05`. Cada afirmação numérica das tabelas foi
**recontada contra o corpo executável**, e não relida da tabela anterior.

| # | vetor encontrado **nesta** varredura | por que era um defeito real | correção literal aplicada |
|---:|---|---|---|
| `V-1` | `RB1` reconferia a lista do TAR de *rollback* com `Assert-Evidencia $RB1_LIST 1` — **piso `1`** | a cardinalidade `22` chegava a `RB1` **apenas** herdada do meta gravado em `E3`. Um meta adulterado para `1` compraria passagem para o `restore` com **uma** entrada. Barreira única é barreira frágil | `$rb1_itens = [int](Assert-Evidencia $RB1_LIST 22)` **mais** `if ($rb1_itens -ne 22) { throw }` **mais** conferência de formato e igualdade contra `ROLLBACK_TAR_ENTRADAS`. §`13.1` linha `73` atualizada para `exata 22` |
| `V-2` | a regra `A-3` declarava **três** exceções de arbitragem de `$LASTEXITCODE` | a contagem estava simplesmente **errada**. A medição linha a linha achou **cinco** pontos em que o código capturado não termina em `throw`. Uma regra normativa com contagem falsa é pior que regra ausente: ela **autoriza** o que não inventariou | `A-3` reescrita para **cinco**, e §`13.3.1` criada com a tabela `C` nomeando `X-1`…`X-5`, cada uma com passo, variável, motivo e **arquivo de evidência** em que o código observado é gravado |
| `V-3` | §`13.3` afirmava `36` capturas de código de saída | número herdado de uma versão anterior do corpo executável. A recontagem deu **`44` linhas de captura** / `39` nomes distintos, mais `9` arbitragens diretas de comando de *host* = **`53` pontos**, `48` terminando em `throw` | §`13.3` e §`13.3.1` passam a declarar os números **medidos**, com a tabela `A` nomeando as `44` capturas uma a uma |
| `V-4` | §`5.0` afirmava que `Set-Passo` tinha **seis** pontos de chamada | verdadeiro para a janela destrutiva, **incompleto para o documento**: `RB0`, `RB6` e `RB7` também chamam. Total real: **`9`**. Quem auditasse por busca textual acharia `9` e concluiria — corretamente — que a tabela mentia | §`5.0` passa a declarar `6` na janela **mais** `3` no *rollback* = `9`, e o token `26` de §`18` repete os `9` com os passos nomeados |
| `V-5` | §`13.1` afirmava **`1`** artefato sem asserção (`07C_MTIME.txt`) | a varredura da coluna `EXISTÊNCIA` acha **`3`** traços: linhas `1` e `2` (`00_PREVOO.txt` e `12_dumpsys_package_raw.txt`) além da linha `60`. As duas primeiras são custódia de **campanha anterior**, sem escritor neste desenho — mas a tabela dizia `1` e a tabela era conferível | §`13.1` passa a declarar **`3`**, nomeando as três linhas e provando que as três têm `CONSUMIDOR = nenhum` e `DECISÃO DESTRUTIVA = NÃO`. `INV-2` continua valendo: **nenhuma delas arbitra** |
| `V-6` | §`13.2` afirmava **cinco** pontos de coleção legitimamente vazia | com a revalidação `E1'`/`E2'` de `I4`, são **seis**. E os **cinco arquivos de *stderr*** não apareciam na tabela, embora sejam exatamente o caso em que vazio é ambíguo | §`13.2` passa a declarar **seis**, com linha própria para `I4`, **mais** uma linha para os cinco arquivos de *stderr* registrando que `Assert-Stderr` é seu **único** leitor e que **ausência é `STOP`** |
| `V-7` | `R2P1_STOP_EVIDENCE_ROOT_PREEXISTS` era lançado por `Assert-RaizNova` e **não constava** da tabela de *tokens* de `STOP` de §`3.1` | um `STOP` que o documento pode emitir e não declara é um `STOP` que o operador não sabe interpretar quando acontece | §`3.1` recebe a linha, mais as de `R2P1_STOP_GATE_SEM_SHA` e `R2P1_STOP_DESIGN_CUSTODY_DIVERGED` |
| `V-8` | `DESIGN_REPO_VS_CUSTODY` era **afirmação de relatório**: nada no procedimento comparava repositório, custódia e `SHA256` citado no gate | o executor poderia rodar, de boa-fé, uma **versão diferente** da auditada — que é precisamente o risco que a custódia existe para eliminar. Afirmação sem barreira é a família de defeito que motivou esta emenda inteira | novo bloco **`E0.0`**, o **primeiro** ato do desenho e `READ-ONLY`: exige `$GATE_SHA` preenchido (`R2P1_STOP_GATE_SEM_SHA`), confere *bytes* e `SHA256` de `$DESIGN_REPO` e `$DESIGN_CUST` entre si **e** contra `$GATE_SHA` (`R2P1_STOP_DESIGN_CUSTODY_DIVERGED`), e grava as `8` linhas correspondentes em `00_E0_INTEGRIDADE.txt` (piso de `26` → **`34`**) |

| `V-9` | `RB1`, `RB2`, `RB3` e `RB4` **lançam** — corretamente —, mas o `catch` de §`5.0` **não** envolvia a cadeia `RB0..RB7`. Um `throw` em qualquer uma dessas barreiras **saía do `catch`** e a execução terminava **sem passar por `RB7`** | havia, portanto, um caminho **real** de término **sem nenhum arquivo de veredito**: nem `RB7_VEREDITO_FINAL.txt`, nem qualquer outro. `ROLLBACK_DISCIPLINE_COMPLETE = SIM` seria verdadeiro para o caminho feliz e **falso** para o caminho em que as próprias barreiras do *rollback* disparam — exatamente o caso em que o registro é mais necessário | a cadeia `RB0..RB7` passa a rodar dentro de um `try` **interno** ao `catch` de §`5.0`; o `catch` interno grava `$RSTC\RB_INTERROMPIDO_LACRE.txt` (`14` linhas, `Assert-Evidencia $RBIF 14`) com `ROLLBACK_CONCLUIDO=NAO`, `DEVICE_STATE=INDETERMINATE` e a exceção observada, e **relança** `R2P1_STOP_ENTRY_RESET_FAILED`. **Nenhum `throw` de `RB1`..`RB4` foi removido**; eles continuam interrompendo o *rollback* — passam apenas a deixar registro. §`13.1` ganha a linha `107` |

**Nenhum destes nove foi encontrado por execução.** Todos saíram de leitura do próprio texto,
antes do lacre e antes de qualquer `HUMAN GATE`. Nenhum deles enfraqueceu barreira existente:
`V-1` **endureceu** uma; `V-8` e `V-9` **criaram** uma cada; os demais alinharam a tabela ao corpo
executável — sempre corrigindo a **tabela**, nunca afrouxando o **código**.

> **A assimetria que esta seção protege.** Quando tabela e corpo executável divergem, existem
> duas correções possíveis, e elas **não** são equivalentes: mudar a tabela para descrever o
> código, ou mudar o código para satisfazer a tabela. A segunda é tentadora e é como se destrói
> um desenho de janela destrutiva — porque o código passa a servir à narrativa. Aqui, **sete**
> dos nove achados foram corrigidos na tabela, e os dois que tocaram o corpo executável (`V-1` e
> `V-9`) **aumentaram** o rigor. Nenhum `throw` foi removido, nenhum piso foi baixado, nenhuma asserção
> foi relaxada.
