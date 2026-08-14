# `32` — `R2P1_ENTRY_RESET_DESIGN_01` — reset determinístico do estado de entrada

**Data:** 2026-08-13 · **Área:** `F6_SG_A` / `R2P1` · **Estado:** **DESENHADO, NÃO EXECUTADO**
**Versão:** **`DESIGN_02` — endurecida após `R2P1_ENTRY_RESET_MATERIALIZED_AUDIT_STOP`**
**Decisão vinculante:** [`D-FUND-R2P1-ENTRY-RESET-01`](../../../docs/DECISIONS.md)
**Gate desta materialização:** `HUMAN_GATE_R2P1_ENTRY_RESET_HARDENING = CONCEDIDO`
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

**Segunda rodada de auditoria — e o que ela mudou.** A materialização foi ao `VERDE` no commit
`033ac60` e voltou com **`R2P1_ENTRY_RESET_MATERIALIZED_AUDIT_STOP`**. Pela segunda vez, **a
arquitetura foi aceita e a execução foi bloqueada** — agora por **defeitos literais de
execução**, não por lacuna normativa: arquivos declarados como `EVIDÊNCIA` que **nenhum comando
gravava**; expressões nuas seguidas de comentários `DEVE` e `esperado` no lugar de condições;
validação de lista **dentro** do laço destrutivo; sondas cujo resultado vazio produzia `PASS`;
um teste de bit que aceitaria `4` onde exigia `6`; e uma instrução de idempotência que mandava
o executor **editar comandos à mão**. Esta versão corrige **cada um deles literalmente** e
acrescenta as três auditorias transversais de §`13.1`, §`13.2` e §`13.3` e o quadro de tokens de
§`18`. **Nada da arquitetura foi reaberto, nenhum passo foi removido e nenhum comando novo ao
aparelho foi introduzido.**

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

### 2.6 *Helpers* de asserção — evidência real, coleção vazia e código de saída

**Origem:** os três defeitos estruturais apontados pela auditoria adversarial do `VERDE`
(`R2P1_ENTRY_RESET_MATERIALIZED_AUDIT_STOP`) eram **o mesmo defeito** em três roupagens:
(a) caminho declarado como `EVIDÊNCIA` cujo conteúdo só ia para o console; (b) coleção vazia
cujo `Count = 0` era lido como `PASS`; (c) ferramenta cujo código de saída nunca era conferido.
Em vez de remendar caso a caso, o desenho passa a ter **três funções obrigatórias**, definidas
uma única vez e usadas por **todos** os passos.

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
# A3) Assert-Exit : registra SEMPRE o codigo de saida e aborta quando != 0.
#     O codigo entra no arquivo de evidencia ANTES do throw, para que a
#     custodia registre a falha e nao apenas a interrupcao.
# ---------------------------------------------------------------------------
function Assert-Exit {
    param([int]$Codigo, [string]$Rotulo, [string]$Log)
    "EXIT|$Rotulo|$Codigo" | Out-File -LiteralPath $Log -Append -Encoding utf8
    if ($Codigo -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
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

**Três regras normativas que decorrem destas funções:**

| # | regra | motivo |
|---|---|---|
| `A-1` | **Todo caminho declarado como `EVIDÊNCIA` é gravado com `Out-File`/`Set-Content` e imediatamente validado por `Assert-Evidencia`.** `Tee-Object` conta como gravação; **console puro não conta.** | O `VERDE` encontrou três arquivos (`00_E0_INTEGRIDADE.txt`, `03_ROLLBACK_META.txt`, `13_TAR_META.txt`) declarados como evidência e **nunca escritos**. |
| `A-2` | **Nenhuma comparação de conjunto, mapa, interseção ou lista roda antes de `Assert-Colecao` nos dois lados.** | `''` igual a `''`, interseção vazia e mapa vazio produzem `0 divergências` — o **falso `PASS` mais perigoso** deste desenho. |
| `A-3` | **`$LASTEXITCODE` é registrado sempre e conferido onde o passo o declara como barreira.** Mas o código de saída é **barreira auxiliar, nunca prova**: `rm -f` devolve `0` para arquivo inexistente, e `$LASTEXITCODE` só atravessa `adb shell` com *shell protocol* `v2`. **A prova é sempre a medição de estado.** | **Ausência de exceção no *host* PowerShell NÃO é sucesso do comando remoto.** `& $ADB …` não lança exceção quando o binário remoto falha. |

> **`A-3`, dito de forma literal e sem eufemismo:** *stderr* do lado do aparelho chega ao
> PowerShell como **texto na saída**, não como erro. Por isso **nenhum passo deste documento
> conclui `PASS` por não ter havido exceção.** Todo `PASS` é a comparação explícita de um valor
> medido contra um valor esperado.

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
| **OBJETIVO** | Provar que o repositório, a baseline e o instrumento estão íntegros; criar raiz de evidência nova e exclusiva. |
| **PRÉ-CONDIÇÃO** | `E-1` `PASS`. |
| **TIPO** | `READ-ONLY` (no aparelho); escreve **apenas** no `HOST`, em raiz nova. |
| **SAÍDA ESPERADA** | Branch/HEAD/status conforme; `$BASE_SHA` e `$BASE_LEN` conferem; `compare_state.py` = `$CMP_SHA`; `Test-Path $EXEC` = `False` antes da criação. |
| **PASS** | Todas as conferências batem. |
| **STOP** | Qualquer *hash* divergente ⇒ **`STOP`** (fora da janela destrutiva: nada foi mutado). `Test-Path $EXEC` = `True` ⇒ `R2P1_STOP_EVIDENCE_ROOT_PREEXISTS`. |
| **EVIDÊNCIA** | `$EXEC\00_E0_INTEGRIDADE.txt` |

```powershell
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
New-Item -ItemType Directory -Force "$EXEC\reset"     | Out-Null

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
  "TODAS_AS_ASSERCOES=PASS"
) | Set-Content -LiteralPath $E0F -Encoding utf8
[void](Assert-Evidencia $E0F 20)
```

> **O que mudou aqui e por quê.** A redação anterior emitia `(Get-Item $BASE_TAR).Length` como
> **expressão nua** seguida do comentário `# esperado: 17234944`. Isso **não é uma verificação**
> — é um número no console que ninguém obriga a conferir, e `00_E0_INTEGRIDADE.txt` era declarado
> como `EVIDÊNCIA` **sem uma única linha que o escrevesse**. Agora cada valor é medido em
> variável, **comparado por `if` com `throw`**, e **gravado no disco**. `Assert-Evidencia` fecha
> o ciclo: se o arquivo não existir ou tiver menos de 20 linhas úteis, o passo **falha**.

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
$E1F = "$EXEC\reset\01_PIDOF_ANTES.txt"

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
| **EVIDÊNCIA** | `$EXEC\reset\02_INFRA_AUSENTE.txt` |

```powershell
$E2F = "$EXEC\reset\02_INFRA_AUSENTE.txt"

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

> ⛔ **Correção de auditoria.** `E2` declarava `$EXEC\reset\02_INFRA_AUSENTE.txt` como
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
| **SAÍDA ESPERADA** | TAR íntegro no `HOST`; `tar -tf` lista o conteúdo; presença de `databases/`, `files/`, `shared_prefs/`. |
| **PASS** | `EXIT = 0` · tamanho medido e gravado · `SHA256` medido e gravado · listagem gravada · **`03_ROLLBACK_META.txt` existente e validado**. |
| **STOP** | Falha de captura ⇒ **`STOP` antes de qualquer remoção**. Sem `E3` válido, `E5` **não pode começar** (§3.4). |
| **EVIDÊNCIA** | `$EXEC\reset\TAR-ROLLBACK-PRE-RESET.tar` · `…\03_ROLLBACK_META.txt` · `…\03_ROLLBACK_LISTAGEM.txt` · `…\03_ROLLBACK_STDERR.txt` |

```powershell
$RB     = "$EXEC\reset\TAR-ROLLBACK-PRE-RESET.tar"
$RBMETA = "$EXEC\reset\03_ROLLBACK_META.txt"
$RBLIST = "$EXEC\reset\03_ROLLBACK_LISTAGEM.txt"
$RBERR  = "$EXEC\reset\03_ROLLBACK_STDERR.txt"

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

# --- stderr: gravado SEMPRE; qualquer conteudo e STOP (regra A-3)
$rb_err = @(Get-Content -LiteralPath $RBERR -ErrorAction SilentlyContinue |
            ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
if ($rb_err.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# --- listagem: GRAVADA e contada; colecao vazia NAO passa (regra A-2)
tar -tvf $RB | Out-File -LiteralPath $RBLIST -Encoding utf8
$rb_ec_list = $LASTEXITCODE
if ($rb_ec_list -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$rb_itens = [int](Assert-Evidencia $RBLIST 1)

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
  "ROLLBACK_TAR_EXIT=$rb_exit"
  "ROLLBACK_STDERR_LINHAS=0"
  "ROLLBACK_CAPTURA_TS=$rb_ts"
  "ROLLBACK_TS_CLASSIFICACAO=DIAGNOSTICO_APENAS"
) | Set-Content -LiteralPath $RBMETA -Encoding utf8
[void](Assert-Evidencia $RBMETA 10)
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
| **EVIDÊNCIA** | `$EXEC\reset\03A_PRE_RESET_vs_ARTEFATO30.txt` · `…\03A_VEREDITO.txt` |

```powershell
$A3A     = "$EXEC\reset\03A_PRE_RESET_vs_ARTEFATO30.txt"
$A3A_VER = "$EXEC\reset\03A_VEREDITO.txt"
$RBX     = "$EXEC\reset\ROLLBACK-EXTRACTED"

New-Item -ItemType Directory -Force $RBX | Out-Null
tar -xf "$EXEC\reset\TAR-ROLLBACK-PRE-RESET.tar" -C $RBX
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
| **EVIDÊNCIA** | `$EXEC\reset\04_ENUM_ARQUIVOS.txt` · `…\04_ENUM_DIRS.txt` · `…\04_RESIDUOS.txt` · `…\04_VALIDACAO.txt` |

```powershell
$E4_ARQ = "$EXEC\reset\04_ENUM_ARQUIVOS.txt"
$E4_DIR = "$EXEC\reset\04_ENUM_DIRS.txt"
$E4_RES = "$EXEC\reset\04_RESIDUOS.txt"
$E4_VAL = "$EXEC\reset\04_VALIDACAO.txt"

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
| **EVIDÊNCIA** | `$EXEC\reset\04A_SELINUX_PRE.txt` · `…\04A_SELINUX_PRE_BRUTO.txt` · `…\04A_SELINUX_PRE_META.txt` |

```powershell
# UMA invocacao por caminho: 'ls -Zd' NAO recursivo devolve o contexto DAQUELE caminho.
# Cada caminho viaja como palavra atomica (F2/F3 de 2.5); nenhum 'sh -c' (F1).
$ALVOS_META = @($RAIZES) + @($dirBrutos | Where-Object { $RAIZES -notcontains $_ }) + @($arqBrutos)
[void](Assert-Colecao $ALVOS_META)          # colecao vazia NAO passa (regra A-2)

# Um contexto SELinux e um token com PELO MENOS tres ':' (user:role:type:level).
# Nenhum caminho valido contem ':' -- o charset de Test-CaminhoSeguro o exclui.
# Portanto este padrao identifica o contexto SEM presumir a ordem das colunas.
$RX_SECTX = '[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+:[A-Za-z0-9_.,=-]+'

$A4A     = "$EXEC\reset\04A_SELINUX_PRE.txt"
$A4A_BR  = "$EXEC\reset\04A_SELINUX_PRE_BRUTO.txt"
$A4A_MET = "$EXEC\reset\04A_SELINUX_PRE_META.txt"
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
| **SAÍDA ESPERADA** | Para cada entrada: nome, modo octal, `uid`, `gid`, `uname`, `gname`, tamanho, `mtime`, tipo. Esperado `uid 10364` / `gid 10364` em **todas**. |
| **PASS** | Captura completa; **8 campos parseáveis em TODAS as entradas**; `uid`/`gid` = `10364` em todas. |
| **STOP** | Código de saída ≠ `0` · linha vazia · número de campos ≠ `8` · modo não octal · `uid`/`gid` não numérico · `uid`/`gid` diferente de `10364` ⇒ **`throw` ANTES de `E5`**: o alvo não é o que o item `12` provou, ou a ferramenta não é confiável. |
| **EVIDÊNCIA** | `$EXEC\reset\04B_MODE_PRE.txt` · `…\04B_MODE_PRE_BRUTO.txt` · `…\04B_MODE_PRE_META.txt` |

```powershell
# FORMATO SEM ESPACOS: ':' nao e metacaractere em sh, portanto NAO precisa de aspas
# e sobrevive intacto ao reparse do shell do aparelho (2.5).
# Campos: 0=%n caminho  1=%a modo  2=%u uid  3=%g gid  4=%U uname  5=%G gname
#         6=%s bytes    7=%Y mtime_epoch
$FMT = '%n:%a:%u:%g:%U:%G:%s:%Y'

$A4B     = "$EXEC\reset\04B_MODE_PRE.txt"
$A4B_BR  = "$EXEC\reset\04B_MODE_PRE_BRUTO.txt"
$A4B_MET = "$EXEC\reset\04B_MODE_PRE_META.txt"
$MODO_PRE = @{}                             # mapa caminho -> objeto de metadados

foreach ($rel in $ALVOS_META) {
    $linha = (& $ADB -s $SERIAL shell run-as $PKG stat -c $FMT -- $rel) -join ' '
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

    $MODO_PRE[$rel] = [pscustomobject]@{
        Caminho = $c[0]; Modo = $c[1]; Uid = [int]$c[2]; Gid = [int]$c[3]
        Uname   = $c[4]; Gname = $c[5]; Bytes = [long]$c[6]; Mtime = [long]$c[7]
    }
    $t | Out-File -LiteralPath $A4B -Append -Encoding utf8
}

$PRE_META_COUNT = [int](Assert-Colecao @($MODO_PRE.Keys) $ALVOS_META.Count)
[void](Assert-Evidencia $A4B $PRE_META_COUNT)
@(
  "MODE_PRE_META"
  "PRE_META_COUNT=$PRE_META_COUNT"
  "PRE_META_COUNT_ESPERADO=$($ALVOS_META.Count)"
  "PRE_LINHAS_MAL_FORMADAS=0"
  "PRE_UID_FORA_DE_10364=0"
  "PRE_GID_FORA_DE_10364=0"
  "FONTE=stat"
  "FONTE_UNICA=SIM"
  "PRE_ARQUIVO=$A4B"
) | Set-Content -LiteralPath $A4B_MET -Encoding utf8
[void](Assert-Evidencia $A4B_MET 9)
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
| **PASS** | `EXIT = 0` · *stderr* **vazio** · 22 linhas úteis · **`SÓ_NO_TAR = 0` e `SÓ_NA_REFERÊNCIA = 0`**. |
| **STOP** | Código de saída ≠ `0` · qualquer linha em *stderr* · contagem ≠ 22 · **qualquer** diferença de conjunto ⇒ **`STOP` antes de `E5`**. Nenhuma mutação ocorreu; o aparelho continua em estado conhecido. |
| **EVIDÊNCIA** | `$EXEC\reset\04C_STDIN_PROBE.txt` · `…\04C_STDIN_PROBE_STDERR.txt` · `…\04C_STDIN_PROBE_META.txt` |

```powershell
$P4C     = "$EXEC\reset\04C_STDIN_PROBE.txt"
$P4C_ERR = "$EXEC\reset\04C_STDIN_PROBE_STDERR.txt"
$P4C_MET = "$EXEC\reset\04C_STDIN_PROBE_META.txt"

# '<', '>' e '2>' sao consumidos pelo cmd.exe; o aparelho nao ve metacaractere algum.
cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell run-as com.valentedev.pequenostracosdefe tar -t < C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\TAR-ENTRY-BASELINE-01.tar > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\04C_STDIN_PROBE.txt 2> C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\04C_STDIN_PROBE_STDERR.txt"
$p4c_exit = $LASTEXITCODE

# ---- 1) codigo de saida REGISTRADO e CONFERIDO
# ---- 2) stderr REGISTRADO e CONFERIDO (qualquer linha e STOP)
$p4c_err = @(Get-Content -LiteralPath $P4C_ERR -ErrorAction SilentlyContinue |
             ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
if ($p4c_exit -ne 0)      { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($p4c_err.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# ---- 3) contagem exata (colecao vazia NAO passa - regra A-2)
$p4c_bruto = @(Get-Content -LiteralPath $P4C -ErrorAction SilentlyContinue |
               ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
[void](Assert-Colecao $p4c_bruto 22)

# ---- 4) COMPARACAO DE CONJUNTO, nao apenas de contagem.
#         Diretorios saem do 'tar -t' com barra final; a normalizacao a remove.
$p4c_set = @($p4c_bruto | ForEach-Object { $_.TrimEnd('/') } | Sort-Object -Unique)
$esp_set = @($MODO_ESPERADO.Keys        | ForEach-Object { $_.TrimEnd('/') } | Sort-Object -Unique)
[void](Assert-Colecao $p4c_set 22)
[void](Assert-Colecao $esp_set 22)

$soNoTar = @($p4c_set | Where-Object { $esp_set -notcontains $_ })
$soNaRef = @($esp_set | Where-Object { $p4c_set -notcontains $_ })
if ($soNoTar.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($soNaRef.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

@(
  "STDIN_CHANNEL_PROBE_META"
  "EXIT=$p4c_exit"
  "STDERR_LINHAS=$($p4c_err.Count)"
  "ENTRADAS_LISTADAS=$($p4c_bruto.Count)"
  "ENTRADAS_ESPERADAS=22"
  "SO_NO_TAR=$($soNoTar.Count)"
  "SO_NA_REFERENCIA=$($soNaRef.Count)"
  "CONJUNTO_IDENTICO=SIM"
  "PROVA=FRAMING_E_LISTAGEM"
  "NAO_PROVA=FIDELIDADE_INTEGRAL_DO_PAYLOAD"
) | Set-Content -LiteralPath $P4C_MET -Encoding utf8
[void](Assert-Evidencia $P4C_MET 10)
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
| **SAÍDA ESPERADA** | Sonda de caminho único com `EXIT = 0`, saída não vazia, **8 campos**, modo/`uid`/`gid` parseáveis **e**, além disso, `04B_MODE_PRE.txt` integralmente revalidado. |
| **PASS** | **`STAT_PROBE_BEFORE_E5 = SIM`** e `STAT_EMPTY_PASS_VECTOR = NONE`. |
| **STOP** | **Qualquer** condição falha ⇒ `throw 'R2P1_STOP_ENTRY_RESET_FAILED'` **ANTES de `E5`**. O aparelho permanece intacto. |
| **EVIDÊNCIA** | `$EXEC\reset\04D_STAT_PROBE.txt` · `…\04D_STAT_PROBE_META.txt` |

```powershell
$P4D     = "$EXEC\reset\04D_STAT_PROBE.txt"
$P4D_MET = "$EXEC\reset\04D_STAT_PROBE_META.txt"

# ---------- 4D.1  SONDA DE CAMINHO UNICO, execucao FRESCA
#            Alvo: a primeira raiz canonica -- literal de $RAIZES, jamais um
#            caminho vindo do aparelho. Existe por construcao (E4 a enumerou).
$alvoProbe = $RAIZES[0]
$pl        = (& $ADB -s $SERIAL shell run-as $PKG stat -c $FMT -- $alvoProbe) -join ' '
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
#            Nao basta a sonda passar: o arquivo consumido por E7B precisa
#            estar completo, sem uma unica linha mal formada.
$mp = @(Get-Content -LiteralPath $A4B | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
[void](Assert-Colecao $mp $ALVOS_META.Count)
$mpRuim = @($mp | Where-Object {
              $f = $_.Split(':')
              ($f.Count -ne 8) -or
              ($f[1] -notmatch '^[0-7]{3,4}$') -or
              ($f[2] -notmatch '^[0-9]+$')     -or
              ($f[3] -notmatch '^[0-9]+$')
          })
if ($mpRuim.Count -ne 0)                { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

@(
  "STAT_PROBE_META"
  "STAT_DISPONIVEL=SIM"
  "PROBE_ALVO=$alvoProbe"
  "PROBE_EXIT=$pl_ec"
  "PROBE_CAMPOS=$($pc.Count)"
  "PROBE_CAMPOS_ESPERADOS=8"
  "MODE_PRE_LINHAS=$($mp.Count)"
  "MODE_PRE_LINHAS_ESPERADAS=$($ALVOS_META.Count)"
  "MODE_PRE_LINHAS_MAL_FORMADAS=0"
  "STAT_EMPTY_PASS_VECTOR=NONE"
  "STAT_PROBE_BEFORE_E5=SIM"
) | Set-Content -LiteralPath $P4D_MET -Encoding utf8
[void](Assert-Evidencia $P4D_MET 11)
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
| **SAÍDA ESPERADA** | Comando disponível · `EXIT = 0` · saída não vazia · contexto extraível · contagem de entradas coerente · **nenhuma** entrada com contexto vazio. |
| **PASS** | **`SELINUX_PROBE_BEFORE_E5 = SIM`** e `SELINUX_EMPTY_PASS_VECTOR = NONE`. |
| **STOP** | **Qualquer** condição falha ⇒ `throw 'R2P1_STOP_ENTRY_RESET_FAILED'` **ANTES de `E5`**. |
| **EVIDÊNCIA** | `$EXEC\reset\04E_SELINUX_PROBE.txt` · `…\04E_SELINUX_PROBE_META.txt` |

```powershell
$P4E     = "$EXEC\reset\04E_SELINUX_PROBE.txt"
$P4E_MET = "$EXEC\reset\04E_SELINUX_PROBE_META.txt"

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

# o mapa em memoria precisa bater com o arquivo gravado
[void](Assert-Colecao @($SELINUX_PRE.Keys) $sp.Count)
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
  "SELINUX_EMPTY_PASS_VECTOR=NONE"
  "SELINUX_PROBE_BEFORE_E5=SIM"
) | Set-Content -LiteralPath $P4E_MET -Encoding utf8
[void](Assert-Evidencia $P4E_MET 10)
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
| **EVIDÊNCIA** | `$EXEC\reset\04F_ESPACO.txt` |

**Prova estrutural do pico líquido no aparelho — por que ele é ≈ 0.** A ordem do desenho é
`E5` (remover) **antes** de `E6` (extrair). Durante `E6`, o *sandbox* está no seu **mínimo
histórico da janela**: os ~17,2 MB da árvore já saíram e vão voltar. Além disso, **nenhum TAR é
gravado dentro do aparelho** (proibição literal do item `13`): a entrada de `E6` chega por
`stdin` e é consumida em *stream*. Logo o pico de ocupação em `/data` é **o estado inicial**, e
o saldo líquido do reset é **substituição, não acréscimo**. A medição abaixo existe para provar
essa afirmação com número, não para substituí-la por confiança.

```powershell
$P4F = "$EXEC\reset\04F_ESPACO.txt"

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
| **EVIDÊNCIA** | `$EXEC\reset\05_REMOCAO_LOG.txt` · `…\05_POS_REMOCAO.txt` · `…\05_POS_REMOCAO_DIRS.txt` |

```powershell
$A5L = "$EXEC\reset\05_REMOCAO_LOG.txt"
$A5P = "$EXEC\reset\05_POS_REMOCAO.txt"
$A5D = "$EXEC\reset\05_POS_REMOCAO_DIRS.txt"

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
| **EVIDÊNCIA** | `$EXEC\reset\06_EXTRACAO.txt` (stdout + stderr + linha `E6_EXTRACAO_EXIT`) |

```powershell
$E6F = "$EXEC\reset\06_EXTRACAO.txt"

cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell run-as com.valentedev.pequenostracosdefe tar -x -C /data/user/0/com.valentedev.pequenostracosdefe < C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\acervo\TAR-ENTRY-BASELINE-01.tar > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\reset\06_EXTRACAO.txt 2>&1"
$e6_ec = $LASTEXITCODE

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
| **PASS** | Conjuntos idênticos. |
| **STOP** | Arquivo faltante, arquivo extra ou diretório inesperado ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` + *rollback* (§5). |
| **EVIDÊNCIA** | `$EXEC\reset\07_ESTRUTURA_POS.txt` |

```powershell
$A7 = "$EXEC\reset\07_ESTRUTURA_POS.txt"

& $ADB -s $SERIAL shell run-as $PKG find databases files shared_prefs -type f |
    Out-File -LiteralPath $A7 -Encoding utf8
$a7_ec = $LASTEXITCODE
if ($a7_ec -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

$posArq = @(Get-Content -LiteralPath $A7 -ErrorAction SilentlyContinue |
            ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })

# ---- guardas de vazio ANTES de comparar (regra A-2). Sem elas, uma extracao
#      que nao produzisse NADA compararia lista vazia com lista vazia... e o
#      Compare-Object devolveria 14 diferencas, mas uma leitura desatenta de
#      'Count' sobre colecao vazia e exatamente o falso PASS que se combate.
[void](Assert-Evidencia $A7 14)
[void](Assert-Colecao $posArq        14)
[void](Assert-Colecao $ARQS_BASELINE 14)

$estDiff = @(Compare-Object $ARQS_BASELINE $posArq)
if ($estDiff.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

---

### `E7A` — `SELINUX_POST` — comparar contra `SELINUX_PRE`

| campo | valor |
|---|---|
| **OBJETIVO** | Provar que a extração não degradou o contexto de segurança. |
| **PRÉ-CONDIÇÃO** | `E7` `PASS`. |
| **TIPO** | `READ-ONLY` |
| **SAÍDA ESPERADA** | Contexto **funcionalmente equivalente** ao de `E4A`, dentro da mesma instalação, mesmo `uid`, mesmo *package*, mesma janela. |
| **PASS** | Equivalência funcional para todas as entradas **com domínio de comparação provado não vazio e completo**. |
| **STOP** | `PRE` ausente · `POST` ausente · contexto vazio de qualquer lado · contagem incompatível · interseção vazia · chave de `POST` sem par em `PRE` · divergência material ⇒ `R2P1_STOP_ENTRY_RESET_FAILED`. **NÃO** corrigir com `restorecon`, `chcon`, *root* ou qualquer mecanismo não autorizado. |
| **EVIDÊNCIA** | `$EXEC\reset\07A_SELINUX_POST.txt` · `…\07A_SELINUX_POST_BRUTO.txt` · `…\07A_SELINUX_DIFF.txt` · `…\07A_SELINUX_DOMINIO.txt` |

```powershell
$A7A     = "$EXEC\reset\07A_SELINUX_POST.txt"
$A7A_BR  = "$EXEC\reset\07A_SELINUX_POST_BRUTO.txt"
$A7A_DIF = "$EXEC\reset\07A_SELINUX_DIFF.txt"
$A7A_DOM = "$EXEC\reset\07A_SELINUX_DOMINIO.txt"

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

$semParPre = @($sePos.Keys | Where-Object { -not $sePre.ContainsKey($_) })
if ($semParPre.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }        # chave faltante

$DOMINIO = @($sePos.Keys | Where-Object { $sePre.ContainsKey($_) } | Sort-Object)
$DOM_COUNT = [int](Assert-Colecao $DOMINIO $POST_PATH_COUNT)                # intersecao != vazia
                                                                            # e IGUAL a POST
$preVazios = @($sePre.Keys | Where-Object { $sePre[$_].Length -eq 0 })
$posVazios = @($sePos.Keys | Where-Object { $sePos[$_].Length -eq 0 })
if ($preVazios.Count -ne 0 -or $posVazios.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

@(
  "SELINUX_DOMINIO"
  "PRE_PATH_COUNT=$PRE_PATH_COUNT"
  "PRE_PATH_COUNT_ESPERADO=$($ALVOS_META.Count)"
  "POST_PATH_COUNT=$POST_PATH_COUNT"
  "POST_PATH_COUNT_ESPERADO=$($ALVOS_POS.Count)"
  "DOMINIO_COMPARACAO=$DOM_COUNT"
  "POST_SEM_PAR_EM_PRE=0"
  "DOMINIO_IGUAL_A_POST=SIM"
  "PRE_CONTEXTOS_VAZIOS=0"
  "POST_CONTEXTOS_VAZIOS=0"
  "SELINUX_EMPTY_PASS_VECTOR=NONE"
) | Set-Content -LiteralPath $A7A_DOM -Encoding utf8
[void](Assert-Evidencia $A7A_DOM 11)

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
> | 3 | `POST ⊆ PRE` — **nenhuma** chave de `POST` sem par | `$semParPre.Count -ne 0` ⇒ `throw` |
> | 4 | domínio de comparação = `POST`, **não vazio** | `Assert-Colecao $DOMINIO $POST_PATH_COUNT` |
> | 5 | zero contextos vazios em `PRE` **e** em `POST` | `$preVazios` / `$posVazios` ⇒ `throw` |
>
> `(3)` + `(4)` **são** `PRE_PATH_SET = POST_PATH_SET` restrito ao domínio em que a igualdade é
> semanticamente válida. Nenhum dos vetores que a exigência quer bloquear sobrevive: conjunto
> vazio, interseção vazia, chave faltante e contagem incompatível produzem `STOP` **antes** de
> qualquer comparação de valor.

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
$A7B     = "$EXEC\reset\07B_MODE_POST.txt"
$A7B_BR  = "$EXEC\reset\07B_MODE_POST_BRUTO.txt"
$A7B_DIF = "$EXEC\reset\07B_MODE_DIFF.txt"
$A7B_DOM = "$EXEC\reset\07B_MODE_DOMINIO.txt"

# ---- captura POS: MESMO comando, MESMO formato e MESMAS guardas de E4B
foreach ($rel in $ALVOS_POS) {
    $linha = (& $ADB -s $SERIAL shell run-as $PKG stat -c $FMT -- $rel) -join ' '
    $ec    = $LASTEXITCODE
    "$rel|EXIT=$ec|$($linha.Trim())" | Out-File -LiteralPath $A7B_BR -Append -Encoding utf8
    if ($ec -ne 0)                   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $t = $linha.Trim()
    if ($t.Length -eq 0)             { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    if ($t.Split(':').Count -ne 8)   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $t | Out-File -LiteralPath $A7B -Append -Encoding utf8
}

# ---- projecao: SOMENTE metadado estrutural. 'bytes' e 'mtime' ficam de FORA da igualdade.
#      O leitor REJEITA linha mal formada em vez de produzir campos nulos silenciosos.
function Import-Meta {
    param([string]$Arquivo)
    if (-not (Test-Path -LiteralPath $Arquivo)) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
    $h = @{}
    foreach ($ln in @(Get-Content -LiteralPath $Arquivo |
                      ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })) {
        $c = $ln.Split(':')                      # 0=%n 1=%a 2=%u 3=%g 4=%U 5=%G 6=%s 7=%Y
        if ($c.Count -ne 8)                     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        if ($c[0].Length -eq 0)                 { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        if ($c[1] -notmatch '^[0-7]{3,4}$')     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        if ($c[2] -notmatch '^[0-9]+$')         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        if ($c[3] -notmatch '^[0-9]+$')         { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
        $h[$c[0]] = [pscustomobject]@{
            Modo = $c[1]; Uid = $c[2]; Gid = $c[3]; Uname = $c[4]; Gname = $c[5]
            Bytes = $c[6]; Mtime = $c[7]
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
$mdSemPar      = @($mdPos.Keys | Where-Object { -not $mdPre.ContainsKey($_) })
if ($mdSemPar.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$MD_DOMINIO    = @($mdPos.Keys | Where-Object { $mdPre.ContainsKey($_) } | Sort-Object)
$MD_DOM_COUNT  = [int](Assert-Colecao $MD_DOMINIO $MD_POST_COUNT)
[void](Assert-Colecao @($MODO_ESPERADO.Keys) 22)

@(
  "MODE_DOMINIO"
  "PRE_META_COUNT=$MD_PRE_COUNT"
  "PRE_META_COUNT_ESPERADO=$($ALVOS_META.Count)"
  "POST_META_COUNT=$MD_POST_COUNT"
  "POST_META_COUNT_ESPERADO=$($ALVOS_POS.Count)"
  "DOMINIO_COMPARACAO=$MD_DOM_COUNT"
  "POST_SEM_PAR_EM_PRE=0"
  "TABELA_BASELINE_ENTRADAS=22"
  "META_EMPTY_PASS_VECTOR=NONE"
) | Set-Content -LiteralPath $A7B_DOM -Encoding utf8
[void](Assert-Evidencia $A7B_DOM 9)

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
        Out-File -LiteralPath "$EXEC\reset\07C_MTIME.txt" -Append -Encoding utf8
}
```

Sinal diagnóstico de alto valor: um `mtime` "de agora" em qualquer das 14 entradas indica um
arquivo que **não** veio do TAR. Isso **motiva investigação**, não reprovação automática.

> **O passo não contém nenhum `throw`, nenhum `if` de reprovação e nenhuma comparação com
> valor esperado — deliberadamente.** É assim que `MTIME_GATE = DIAGNOSTIC_ONLY` deixa de ser
> uma promessa textual e passa a ser uma propriedade verificável do procedimento: não existe,
> em lugar algum do desenho, caminho de código pelo qual `mtime` produza `STOP`.
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

# ---- app parado: CONDICAO REAL, nao comentario
$pid13 = @(& $ADB -s $SERIAL shell pidof com.valentedev.pequenostracosdefe |
           ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
"PIDOF_LINHAS=$($pid13.Count)" | Set-Content -LiteralPath $T_PID -Encoding utf8
if ($pid13.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

cmd.exe /c "C:\Android\platform-tools\adb.exe -s RX2XC003LTJ exec-out run-as com.valentedev.pequenostracosdefe tar -c databases files shared_prefs > C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\acervo\TAR-ENTRY-POS-RESET.tar 2> C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_EXEC_01\acervo\13_TAR_STDERR.txt"
$t_exit = $LASTEXITCODE

$t_err = @(Get-Content -LiteralPath $T_ERR -ErrorAction SilentlyContinue |
           ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
if ($t_exit -ne 0)                     { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($t_err.Count -ne 0)                { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
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
  "TAR_STDERR_LINHAS=0"
  "PIDOF_LINHAS=0"
  "IDENTICO_A_BASE_SHA=$t_identico"
  "IDENTICO_E_GATE=NAO"
) | Set-Content -LiteralPath $T_META -Encoding utf8
[void](Assert-Evidencia $T_META 12)
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

### `RB0` — Interromper e registrar

| campo | valor |
|---|---|
| **OBJETIVO** | Congelar a sequência principal e registrar a condição observada. |
| **TIPO** | `READ-ONLY` |
| **PASS/STOP** | Não se aplica; é registro. **NÃO iniciar o item `13`.** |
| **EVIDÊNCIA** | `$EXEC\reset\RB0_CONDICAO_OBSERVADA.txt` |

```powershell
$RB0F = "$EXEC\reset\RB0_CONDICAO_OBSERVADA.txt"

# O passo que falhou grava $ROLLBACK_PASSO e $ROLLBACK_MOTIVO antes de acionar o
# rollback. Lidos por Get-Variable para que a AUSENCIA da variavel produza um
# registro honesto ('NAO_INFORMADO') em vez de derrubar o proprio rollback.
$rb0_passo  = "$(Get-Variable -Name ROLLBACK_PASSO  -ValueOnly -ErrorAction SilentlyContinue)".Trim()
$rb0_motivo = "$(Get-Variable -Name ROLLBACK_MOTIVO -ValueOnly -ErrorAction SilentlyContinue)".Trim()
if ($rb0_passo  -eq '') { $rb0_passo  = 'NAO_INFORMADO' }
if ($rb0_motivo -eq '') { $rb0_motivo = 'NAO_INFORMADO' }

@(
  "RB0_CONDICAO_OBSERVADA"
  "EXEC_ROOT=$EXEC"
  "PASSO_QUE_FALHOU=$rb0_passo"
  "MOTIVO=$rb0_motivo"
  "JANELA_DESTRUTIVA_INICIADA=SIM"
  "ITEM_13_INICIADO=NAO"
  "RECAPTURA_DE_TAR=PROIBIDA"
  "ROLLBACK_ATTEMPTS_PERMITIDAS=1"
  "DEVICE_STATE=INDETERMINATE"
  "CARIMBO_DIAGNOSTICO=$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))"
) | Set-Content -LiteralPath $RB0F -Encoding utf8
[void](Assert-Evidencia $RB0F 10)
```

> **O que mudou aqui e por quê.** `RB0` declarava `RB0_CONDICAO_OBSERVADA.txt` como `EVIDÊNCIA`
> e **não tinha um único bloco de comando** — era o mesmo defeito de `E2`, agravado por estar no
> caminho de *rollback*, ou seja, exatamente onde a custódia mais importa. `CARIMBO_DIAGNOSTICO`
> é **diagnóstico**, como todo carimbo de tempo deste desenho: não é comparado, não decide nada e
> **não pode gerar `STOP`**.

### `RB1` — Provar que o *rollback* pertence a **esta** execução

| campo | valor |
|---|---|
| **OBJETIVO** | Eliminar qualquer dúvida sobre a identidade do artefato de recuperação. |
| **PRÉ-CONDIÇÃO** | `E3` concluído; `03_ROLLBACK_META.txt` e `03_ROLLBACK_LISTAGEM.txt` existem. |
| **TIPO** | `READ-ONLY` |
| **PASS** | O TAR está **dentro de `$EXEC`** (raiz exclusiva desta execução, criada em `E0` com `Test-Path = False`), o meta de `E3` **pertence a esta mesma `$EXEC`**, e **tamanho, `SHA256` e contagem de entradas recalculados agora batem com os gravados em `E3`**. |
| **STOP** | Qualquer divergência ⇒ *rollback* **inválido** ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` com `DEVICE_STATE = INDETERMINATE`. **Nenhuma remoção de `RB3` pode ocorrer sem este `PASS`.** |
| **EVIDÊNCIA** | `$EXEC\reset\RB1_ROLLBACK_IDENTIDADE.txt` · `…\RB1_LISTAGEM.txt` |

```powershell
$RB       = "$EXEC\reset\TAR-ROLLBACK-PRE-RESET.tar"
$RBMETA   = "$EXEC\reset\03_ROLLBACK_META.txt"
$RB1_OUT  = "$EXEC\reset\RB1_ROLLBACK_IDENTIDADE.txt"
$RB1_LIST = "$EXEC\reset\RB1_LISTAGEM.txt"

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
$rb1_itens = [int](Assert-Evidencia $RB1_LIST 1)
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
| **EVIDÊNCIA** | `$EXEC\reset\RB2_ENUM_PARCIAL.txt` · `…\RB2_ENUM_PARCIAL_DIRS.txt` · `…\RB2_VALIDACAO.txt` |

```powershell
$RB2_ARQ  = "$EXEC\reset\RB2_ENUM_PARCIAL.txt"
$RB2_DIRS = "$EXEC\reset\RB2_ENUM_PARCIAL_DIRS.txt"
$RB2_VAL  = "$EXEC\reset\RB2_VALIDACAO.txt"

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
$RB3_VAL = "$EXEC\reset\RB3_VALIDACAO.txt"
$RB3_LOG = "$EXEC\reset\RB3_REMOCAO_LOG.txt"

# Contador inicializado ANTES de qualquer validacao: se RB3.1 abortar, o valor
# reportado e obrigatoriamente 0, porque nenhum 'rm' chegou a ser emitido.
$FILES_DELETED_BY_RB3 = 0

if (-not $ROLLBACK_VERIFICADO) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

$rbArq = @(Get-Content -LiteralPath "$EXEC\reset\RB2_ENUM_PARCIAL.txt" |
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
    Out-File -LiteralPath "$EXEC\reset\RB4_EXTRACAO.txt" -Append -Encoding utf8
if (-not (Test-Path -LiteralPath "$EXEC\reset\RB4_EXTRACAO.txt")) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
if ($rb4_ec -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
```

| campo | valor |
|---|---|
| **PASS** | `EXIT = 0` **verificado em `$rb4_ec` e gravado**, não presumido pela ausência de exceção no host. |
| **STOP** | Falha ⇒ `R2P1_STOP_ENTRY_RESET_FAILED` com `DEVICE_STATE = INDETERMINATE`. **NÃO** executar segunda restauração. **NÃO** abrir o app. **NÃO** usar `pm clear`. **NÃO** instalar. **NÃO** apagar mais nada. |
| **EVIDÊNCIA** | `$EXEC\reset\RB4_EXTRACAO.txt` (stdout + stderr + linha `RB4_EXTRACAO_EXIT`) |

### `RB5` — Verificar estruturalmente o estado recuperado

| campo | valor |
|---|---|
| **TIPO** | `READ-ONLY` |
| **CLASSIFICA** | `ROLLBACK_RESULT = RECUPERADO` quando a estrutura recuperada é **idêntica** à enumerada em `E4`; `INDETERMINATE` em qualquer outro caso. |
| **EVIDÊNCIA** | `$EXEC\reset\RB5_ESTRUTURA_RECUPERADA.txt` · `…\RB5_DIFF.txt` · `…\RB5_VEREDITO.txt` |

```powershell
$RB5_EST = "$EXEC\reset\RB5_ESTRUTURA_RECUPERADA.txt"
$RB5_DIF = "$EXEC\reset\RB5_DIFF.txt"
$RB5_VER = "$EXEC\reset\RB5_VEREDITO.txt"
$E4_ARQ  = "$EXEC\reset\04_ENUM_ARQUIVOS.txt"

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
| `I1` | **Restauração 1** | `E3A` → `E4` → `E4A` → `E4B` → `E4C` → `E4D` → `E4E` → `E4F` → `E5` → `E6` → `E7` → `E7A` → `E7B` → `E7C` | estrutura, SELinux e modos conformes |
| `I2` | Capturar `TAR-RESTORE-01.tar` **e arquivar a rodada 1** | `I2` abaixo, **literal** | `bytes` + `SHA256` + listagem + arquivo da rodada |
| `I3` | `RESTORE_01` **vs** baseline | `I3` abaixo | `ESCOPO_OK=SIM` + **7 zeros** |
| `I4` | **Restauração 2** — **revalida `E1` e `E2`** e repete a rodada | `I4` abaixo → `E1'` → `E2'` → `E4` → `E4A` → `E4B` → `E4C` → `E4D` → `E4E` → `E4F` → `E5` → `E6` → `E7` → `E7A` → `E7B` → `E7C` | app parado e infra ausente **de novo**; estrutura, SELinux e modos conformes |
| `I5` | Capturar `TAR-RESTORE-02.tar` **e arquivar a rodada 2** | `I5` abaixo, **literal e completo** | `bytes` + `SHA256` + listagem + arquivo da rodada |
| `I6` | `RESTORE_02` **vs** baseline | `I6` abaixo | `ESCOPO_OK=SIM` + **7 zeros** |
| `I7` | `RESTORE_02` **vs** `RESTORE_01` | `I7` abaixo | `ESCOPO_OK=SIM` + **7 zeros** |
| `I8` | Invariantes: `RESTORE_01` e `RESTORE_02`, cada um contra o artefato `30` | `I8` abaixo | `8/8` idênticas · `4/4` zeros, **nos dois** |
| `I9` | SELinux e modo/*ownership*/grupo, **rodada a rodada**, a partir dos arquivos de cada rodada | `I9` abaixo | equivalência funcional nas duas, **auditada separadamente** |
| `I10` | Lacre | `I10` abaixo | `bytes` + `SHA256` de todos os artefatos, **com as duas rodadas discriminadas** |

#### Raízes por rodada — evidência **não colide**

```powershell
$RODADAS = "$EXEC\rodadas"
$R01     = "$EXEC\rodadas\RESTORE01"
$R02     = "$EXEC\rodadas\RESTORE02"
New-Item -ItemType Directory -Force $R01 | Out-Null
New-Item -ItemType Directory -Force $R02 | Out-Null
```

#### `I2` — capturar a rodada 1 e **arquivá-la** ⚠️ leitura do aparelho

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
if (-not (Test-Path -LiteralPath $T01ERR))  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$t01_err = @(Get-Content -LiteralPath $T01ERR |
             ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
if ($t01_err.Count -ne 0)                   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

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

# ARQUIVAMENTO DA RODADA 1 -- feito AQUI, antes que I4 sobrescreva '$EXEC\reset\*.txt'.
Copy-Item -Path "$EXEC\reset\*.txt" -Destination $R01 -Force
$r01_n = [int](Assert-Colecao @(Get-ChildItem -LiteralPath $R01 -File -Filter *.txt))

@(
  "I2_TAR01_META"
  "RODADA=01"
  "TAR_PATH=$T01"
  "TAR_BYTES=$t01_len"
  "TAR_SHA256=$t01_sha"
  "TAR_ENTRADAS=$t01_itens"
  "TAR_EXIT=$t01_ec"
  "STDERR_LINHAS=0"
  "ARQUIVO_DA_RODADA=$R01"
  "ARQUIVOS_ARQUIVADOS=$r01_n"
) | Set-Content -LiteralPath $T01META -Encoding utf8
[void](Assert-Evidencia $T01META 10)
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
$I4_E1 = "$EXEC\rodadas\RESTORE02\I4_E1_PIDOF_ANTES.txt"
$I4_E2 = "$EXEC\rodadas\RESTORE02\I4_E2_INFRA_AUSENTE.txt"

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

#### `I5` — capturar a rodada 2 e **arquivá-la** ⚠️ leitura do aparelho

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
if (-not (Test-Path -LiteralPath $T02ERR))  { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$t02_err = @(Get-Content -LiteralPath $T02ERR |
             ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
if ($t02_err.Count -ne 0)                   { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

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

Copy-Item -Path "$EXEC\reset\*.txt" -Destination $R02 -Force
$r02_n = [int](Assert-Colecao @(Get-ChildItem -LiteralPath $R02 -File -Filter *.txt))

@(
  "I5_TAR02_META"
  "RODADA=02"
  "TAR_PATH=$T02"
  "TAR_BYTES=$t02_len"
  "TAR_SHA256=$t02_sha"
  "TAR_ENTRADAS=$t02_itens"
  "TAR_EXIT=$t02_ec"
  "STDERR_LINHAS=0"
  "ARQUIVO_DA_RODADA=$R02"
  "ARQUIVOS_ARQUIVADOS=$r02_n"
) | Set-Content -LiteralPath $T02META -Encoding utf8
[void](Assert-Evidencia $T02META 10)
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

#### `I9` — SELinux e modos, **rodada a rodada**, dos arquivos arquivados

```powershell
$I9F = "$EXEC\I9_METADADOS_POR_RODADA.txt"
$i9Falta = @()
$i9Dif   = @()

# Cada rodada tem de ter produzido, no SEU proprio arquivo, os quatro vereditos.
foreach ($par in @(@{R='01'; D=$R01}, @{R='02'; D=$R02})) {
    foreach ($nome in @('07A_SELINUX_DOMINIO.txt','07A_SELINUX_POST.txt',
                        '07B_MODE_DOMINIO.txt','07B_MODE_POST.txt')) {
        $alvo = Join-Path $par.D $nome
        if (-not (Test-Path -LiteralPath $alvo)) { $i9Falta += "AUSENTE|$($par.R)|$nome" }
        elseif ((Get-Item -LiteralPath $alvo).Length -le 0) { $i9Falta += "VAZIO|$($par.R)|$nome" }
    }
}
if ($i9Falta.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }

# Equivalencia ENTRE as rodadas: os mapas de SELinux e de modo tem de ser identicos.
foreach ($nome in @('07A_SELINUX_POST.txt','07B_MODE_POST.txt')) {
    $a = @(Get-Content -LiteralPath (Join-Path $R01 $nome) |
           ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' } | Sort-Object)
    $b = @(Get-Content -LiteralPath (Join-Path $R02 $nome) |
           ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' } | Sort-Object)
    [void](Assert-Colecao $a)
    [void](Assert-Colecao $b)
    if ($a.Count -ne $b.Count) { $i9Dif += "CARDINALIDADE|$nome|$($a.Count)|$($b.Count)"; continue }
    for ($i = 0; $i -lt $a.Count; $i++) {
        if ($a[$i] -cne $b[$i]) { $i9Dif += "VALOR|$nome|$($a[$i])|$($b[$i])" }
    }
}

@(
  "I9_METADADOS_POR_RODADA"
  "RODADA_01_RAIZ=$R01"
  "RODADA_02_RAIZ=$R02"
  "ARQUIVOS_AUSENTES_OU_VAZIOS=$($i9Falta.Count)"
  "DIVERGENCIAS_ENTRE_RODADAS=$($i9Dif.Count)"
  "STRUCTURAL_METADATA_CHECK=$(if ($i9Dif.Count -eq 0) { 'PASS' } else { 'STOP' })"
) + $i9Dif | Set-Content -LiteralPath $I9F -Encoding utf8
[void](Assert-Evidencia $I9F 6)
if ($i9Dif.Count -ne 0) { throw 'R2P1_STOP_ENTRY_RESET_FAILED' }
$STRUCTURAL_METADATA_CHECK = 'PASS'
```

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
> | 3 | `07A_SELINUX_POST.txt`, `07B_MODE_POST.txt` e todos os demais têm **nome fixo**. A rodada 2 **sobrescreveria** a evidência da rodada 1, e `I9`/`I10` auditariam duas vezes o **mesmo** arquivo. | `I2` e `I5` **arquivam `$EXEC\reset\*.txt`** em `…\rodadas\RESTORE01\` e `…\rodadas\RESTORE02\` **antes** que a rodada seguinte sobrescreva. `I9` compara as duas raízes; `I10` marca cada linha com `RODADA01` / `RODADA02` e exige que **as duas** tenham conteúdo. |
>
> `I5_LITERAL_COMMANDS_PRESENT = SIM` · `I4_REVALIDATES_E1_E2 = SIM` ·
> `IDEMPOTENCE_EVIDENCE_PATHS_UNIQUE = SIM`

> **Por que o arquivamento é `Copy-Item … *.txt` e não a cópia da árvore inteira.** As evidências
> são todas `.txt`. Copiar `$EXEC\reset\` por inteiro arrastaria `TAR-ROLLBACK-PRE-RESET.tar`
> (~17 MB) e `ROLLBACK-EXTRACTED\` a cada rodada, **duplicando** o pico de disco que `E4F` acabou
> de orçar. O filtro é deliberado e a conferência é `Assert-Colecao` sobre o resultado — se o
> arquivamento não copiar nada, o passo para.

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

### 13.1 Auditoria de persistência real de evidência — varredura integral

**Propriedade auditada:** *nenhum artefato declarado como `EVIDÊNCIA` e consumido por um passo
posterior pode depender de saída apenas exibida no console.* A varredura abaixo é **integral**:
percorre todo caminho declarado em qualquer linha `EVIDÊNCIA` do documento e responde três
perguntas objetivas — existe comando que **grava**? algum passo posterior **lê**? existe
**asserção executável** sobre ele?

Legenda: `WRITER` = existe `Out-File`/`Set-Content`/`Tee-Object` ou redirecionamento
`cmd.exe /c … > …` para o caminho · `CONSUMIDO` = algum passo posterior faz `Get-Content`,
`Get-FileHash`, `Get-Item` ou `tar` sobre ele · `ASSERÇÃO` = `Assert-Evidencia`,
`Assert-Colecao` ou `if … throw` sobre o conteúdo.

| # | `EVIDENCE_PATH` | `WRITER_COMMAND_EXISTS` | `CONSUMED_LATER` | `REAL_ASSERTION_EXISTS` |
|---:|---|---|---|---|
| 1 | `00_PREVOO.txt` *(custódia do pré-voo canônico)* | **SIM**, fora deste desenho | **NÃO** | **N/A** — ver `E-1` |
| 2 | `12_dumpsys_package_raw.txt` *(idem)* | **SIM**, fora deste desenho | **NÃO** | **N/A** — ver `E-1` |
| 3 | `$EXEC\00_E0_INTEGRIDADE.txt` | **SIM** `E0.5` `Set-Content` | NÃO | **SIM** `Assert-Evidencia … 20` |
| 4 | `$EXEC\reset\01_PIDOF_ANTES.txt` | **SIM** `E1` | NÃO | **SIM** `Assert-Evidencia … 4` + `if ($e1_pids.Count -ne 0)` |
| 5 | `$EXEC\reset\02_INFRA_AUSENTE.txt` | **SIM** `E2` | NÃO | **SIM** `Assert-Evidencia … 9` + 4 condições |
| 6 | `$EXEC\reset\TAR-ROLLBACK-PRE-RESET.tar` | **SIM** `E3` `cmd.exe /c … > …` | **SIM** `RB1`, `RB4` | **SIM** `Get-Item`/`Get-FileHash` vs `03_ROLLBACK_META.txt` |
| 7 | `$EXEC\reset\03_ROLLBACK_META.txt` | **SIM** `E3` `Set-Content` | **SIM** `RB1` | **SIM** `Assert-Evidencia … 10` + 5 chaves + 3 comparações |
| 8 | `$EXEC\reset\03_ROLLBACK_LISTAGEM.txt` | **SIM** `E3` | **SIM** `E3` (contagem) | **SIM** `Assert-Evidencia … 1` + `-ne 22` |
| 9 | `$EXEC\reset\03_ROLLBACK_STDERR.txt` | **SIM** `E3` `2> …` | **SIM** `E3` | **SIM** `if (…Count -ne 0) throw` |
| 10 | `$EXEC\reset\03A_PRE_RESET_vs_ARTEFATO30.txt` | **SIM** `E3A` `> …` | **SIM** `E3A` | **SIM** `Read-Comparador` |
| 11 | `$EXEC\reset\03A_VEREDITO.txt` | **SIM** `E3A` | NÃO | **SIM** `Assert-Evidencia … 14` |
| 12 | `$EXEC\reset\04_ENUM_ARQUIVOS.txt` | **SIM** `E4` | **SIM** `E4`→`E5` | **SIM** `Test-Path` + `Assert-Colecao $arqBrutos` |
| 13 | `$EXEC\reset\04_ENUM_DIRS.txt` | **SIM** `E4` | **SIM** `E4`→`E5` | **SIM** `Assert-Evidencia … 3` + 3 raízes |
| 14 | `$EXEC\reset\04_RESIDUOS.txt` | **SIM** `E4` (com cabeçalho) | NÃO | **SIM** `Assert-Evidencia … 1` |
| 15 | `$EXEC\reset\04_VALIDACAO.txt` | **SIM** `E4`, **nos dois caminhos** | NÃO | **SIM** `Assert-Evidencia … 10` |
| 16 | `$EXEC\reset\04A_SELINUX_PRE.txt` | **SIM** `E4A` | **SIM** `E7A` | **SIM** `Assert-Evidencia … 22` |
| 17 | `$EXEC\reset\04A_SELINUX_PRE_BRUTO.txt` | **SIM** `E4A` | **SIM** `E4A` | **SIM** `Assert-Evidencia` |
| 18 | `$EXEC\reset\04A_SELINUX_PRE_META.txt` | **SIM** `E4A` | NÃO | **SIM** `Assert-Evidencia` |
| 19 | `$EXEC\reset\04B_MODE_PRE.txt` | **SIM** `E4B` | **SIM** `E7B` | **SIM** `Assert-Evidencia … 22` |
| 20 | `$EXEC\reset\04B_MODE_PRE_BRUTO.txt` | **SIM** `E4B` | **SIM** `E4B` | **SIM** `Assert-Evidencia` |
| 21 | `$EXEC\reset\04B_MODE_PRE_META.txt` | **SIM** `E4B` | NÃO | **SIM** `Assert-Evidencia` |
| 22 | `$EXEC\reset\04C_STDIN_PROBE.txt` | **SIM** `E4C` `> …` | **SIM** `E4C` | **SIM** `Assert-Colecao … 22` + conjunto |
| 23 | `$EXEC\reset\04C_STDIN_PROBE_STDERR.txt` | **SIM** `E4C` `2> …` | **SIM** `E4C` | **SIM** `if (…Count -ne 0) throw` |
| 24 | `$EXEC\reset\04C_STDIN_PROBE_META.txt` | **SIM** `E4C` | NÃO | **SIM** `Assert-Evidencia … 10` |
| 25 | `$EXEC\reset\04D_STAT_PROBE.txt` | **SIM** `E4D` | **SIM** `E4D` | **SIM** `Assert-Evidencia` + *parse* |
| 26 | `$EXEC\reset\04D_STAT_PROBE_META.txt` | **SIM** `E4D` | NÃO | **SIM** `Assert-Evidencia` |
| 27 | `$EXEC\reset\04E_SELINUX_PROBE.txt` | **SIM** `E4E` | **SIM** `E4E` | **SIM** `Assert-Evidencia` + `$RX_SECTX` |
| 28 | `$EXEC\reset\04E_SELINUX_PROBE_META.txt` | **SIM** `E4E` | NÃO | **SIM** `Assert-Evidencia` |
| 29 | `$EXEC\reset\04F_ESPACO.txt` | **SIM** `E4F` | NÃO | **SIM** `Assert-Evidencia … 9` |
| 30 | `$EXEC\reset\05_REMOCAO_LOG.txt` | **SIM** `E5.1`/`E5.2` | **SIM** `E5` | **SIM** `Assert-Evidencia … $FILES_DELETED_BY_E5` |
| 31 | `$EXEC\reset\05_POS_REMOCAO.txt` | **SIM** `E5.3`, **pré-criado** | **SIM** `E5.3` | **SIM** `Test-Path` + `if (…Count -ne 0)` |
| 32 | `$EXEC\reset\05_POS_REMOCAO_DIRS.txt` | **SIM** `E5.3` | **SIM** `E5.3` | **SIM** `Assert-Evidencia … 3` + `Assert-Colecao` |
| 33 | `$EXEC\reset\06_EXTRACAO.txt` | **SIM** `E6` | **SIM** `E6` | **SIM** exit + `$e6_ruido` |
| 34 | `$EXEC\reset\07_ESTRUTURA_POS.txt` | **SIM** `E7` | **SIM** `E7` | **SIM** `Assert-Evidencia … 14` + `Compare-Object` |
| 35 | `$EXEC\reset\07A_SELINUX_POST.txt` | **SIM** `E7A` | **SIM** `E7A`, `I9` | **SIM** `Assert-Evidencia … 22` |
| 36 | `$EXEC\reset\07A_SELINUX_POST_BRUTO.txt` | **SIM** `E7A` | **SIM** `E7A` | **SIM** `Assert-Evidencia` |
| 37 | `$EXEC\reset\07A_SELINUX_DOMINIO.txt` | **SIM** `E7A` | NÃO | **SIM** `Assert-Evidencia` |
| 38 | `$EXEC\reset\07A_SELINUX_DIFF.txt` | **SIM** `E7A` | NÃO | **SIM** `if (…Count -ne 0) throw` |
| 39 | `$EXEC\reset\07B_MODE_POST.txt` | **SIM** `E7B` | **SIM** `E7B`, `E7C`, `I9` | **SIM** `Assert-Evidencia … 22` |
| 40 | `$EXEC\reset\07B_MODE_POST_BRUTO.txt` | **SIM** `E7B` | **SIM** `E7B` | **SIM** `Assert-Evidencia` |
| 41 | `$EXEC\reset\07B_MODE_DOMINIO.txt` | **SIM** `E7B` | NÃO | **SIM** `Assert-Evidencia` |
| 42 | `$EXEC\reset\07B_MODE_DIFF.txt` | **SIM** `E7B` | NÃO | **SIM** `if (…Count -ne 0) throw` |
| 43 | `$EXEC\reset\07C_MTIME.txt` | **SIM** `E7C` `Out-File -Append` | **NÃO** | **NÃO** — **exceção declarada e única** (§`E7C`) |
| 44 | `$EXEC\acervo\TAR-ENTRY-POS-RESET.tar` | **SIM** item `13` `> …` | **SIM** item `14`, `E8` | **SIM** *bytes* + `SHA256` + 22 entradas |
| 45 | `$EXEC\acervo\13_TAR_META.txt` | **SIM** item `13` | NÃO | **SIM** `Assert-Evidencia … 12` |
| 46 | `$EXEC\acervo\13_TAR_LISTAGEM.txt` | **SIM** item `13` | **SIM** item `13` | **SIM** `Assert-Evidencia … 22` |
| 47 | `$EXEC\acervo\13_TAR_STDERR.txt` | **SIM** item `13` `2> …` | **SIM** item `13` | **SIM** `if (…Count -ne 0) throw` |
| 48 | `$EXEC\acervo\13_PIDOF.txt` | **SIM** item `13` | **SIM** item `13` | **SIM** `if (…Count -ne 0) throw` |
| 49 | `$EXEC\acervo\14_POS-RESET-vs-BASELINE.txt` | **SIM** item `14` `> …` | **SIM** item `14` | **SIM** `Read-Comparador` |
| 50 | `$EXEC\acervo\14_VEREDITO.txt` | **SIM** item `14` | NÃO | **SIM** `Assert-Evidencia … 14` |
| 51 | `$EXEC\acervo\E8_POS-RESET-vs-ARTEFATO30.txt` | **SIM** `E8` `> …` | **SIM** `E8` | **SIM** `Read-Comparador` |
| 52 | `$EXEC\acervo\E8_VEREDITO.txt` | **SIM** `E8` | NÃO | **SIM** `Assert-Evidencia … 13` |
| 53 | `$EXEC\reset\RB0_CONDICAO_OBSERVADA.txt` | **SIM** `RB0` | NÃO | **SIM** `Assert-Evidencia … 10` |
| 54 | `$EXEC\reset\RB1_ROLLBACK_IDENTIDADE.txt` | **SIM** `RB1` | NÃO | **SIM** `Assert-Evidencia … 17` |
| 55 | `$EXEC\reset\RB1_LISTAGEM.txt` | **SIM** `RB1` | **SIM** `RB1` | **SIM** `Assert-Evidencia … 1` + `-ne` meta |
| 56 | `$EXEC\reset\RB2_ENUM_PARCIAL.txt` | **SIM** `RB2`, **pré-criado** | **SIM** `RB3.1` | **SIM** `Test-Path` + validação integral |
| 57 | `$EXEC\reset\RB2_ENUM_PARCIAL_DIRS.txt` | **SIM** `RB2` | **SIM** `RB2` | **SIM** `Assert-Evidencia … 3` |
| 58 | `$EXEC\reset\RB2_VALIDACAO.txt` | **SIM** `RB2` | NÃO | **SIM** `Assert-Evidencia … 7` |
| 59 | `$EXEC\reset\RB3_VALIDACAO.txt` | **SIM** `RB3.1` | NÃO | **SIM** `Assert-Evidencia … 6` |
| 60 | `$EXEC\reset\RB3_REMOCAO_LOG.txt` | **SIM** `RB3.2` | NÃO | **SIM** exit por linha |
| 61 | `$EXEC\reset\RB4_EXTRACAO.txt` | **SIM** `RB4` | **SIM** `RB4` | **SIM** `RB4_EXTRACAO_EXIT` + `throw` |
| 62 | `$EXEC\reset\RB5_ESTRUTURA_RECUPERADA.txt` | **SIM** `RB5` | **SIM** `RB5` | **SIM** classificação executável |
| 63 | `$EXEC\reset\RB5_DIFF.txt` | **SIM** `RB5` | **SIM** `RB5` | **SIM** classificação executável |
| 64 | `$EXEC\reset\RB5_VEREDITO.txt` | **SIM** `RB5` | NÃO | **SIM** `Assert-Evidencia … 8` |
| 65 | `$R01\TAR-RESTORE-01.tar` · `$R02\TAR-RESTORE-02.tar` | **SIM** `I2`/`I5` `> …` | **SIM** `I3`/`I6`/`I7` | **SIM** *bytes* + `SHA256` + 22 entradas |
| 66 | `$R01\I2_TAR01_LISTAGEM.txt` · `$R02\I5_TAR02_LISTAGEM.txt` | **SIM** `I2`/`I5` | **SIM** `I2`/`I5` | **SIM** `Assert-Evidencia … 22` |
| 67 | `$R01\I2_TAR01_STDERR.txt` · `$R02\I5_TAR02_STDERR.txt` | **SIM** `I2`/`I5` `2> …` | **SIM** `I2`/`I5` | **SIM** `if (…Count -ne 0) throw` |
| 68 | `$R01\I2_TAR01_META.txt` · `$R02\I5_TAR02_META.txt` | **SIM** `I2`/`I5` | NÃO | **SIM** `Assert-Evidencia … 10` |
| 69 | `$R01\I4_E1_PIDOF_ANTES.txt` · `…\I4_E2_INFRA_AUSENTE.txt` | **SIM** `I4` | NÃO | **SIM** `Assert-Evidencia` + condições de `E1`/`E2` |
| 70 | `$EXEC\I9_METADADOS_POR_RODADA.txt` | **SIM** `I9` | NÃO | **SIM** `Assert-Evidencia … 6` |
| 71 | `$EXEC\I10_LACRE.txt` | **SIM** `I10` | NÃO | **SIM** `Assert-Evidencia … 1` + `$n01`/`$n02` não nulos |

**Resultado da varredura:**

| token | valor |
|---|---|
| caminhos de `EVIDÊNCIA` auditados | **71 linhas**, cobrindo **todo** caminho declarado |
| `WRITER_COMMAND_EXISTS = NÃO` | **0** |
| `CONSUMED_LATER = SIM` **e** `WRITER_COMMAND_EXISTS = NÃO` | **0** ← *a propriedade exigida* |
| `REAL_ASSERTION_EXISTS = NÃO` | **1** — `07C_MTIME.txt`, **exceção declarada**, `CONSUMED_LATER = NÃO` |

> **A propriedade que importa está satisfeita sem exceção:** **não existe, no documento, um único
> caminho que seja consumido por um passo posterior e não seja gravado em disco.** A única linha
> sem asserção (`07C_MTIME.txt`) é terminal por construção — se ela não existisse, **nada** a
> leria — e é assim que `MTIME_CAN_STOP = NÃO` continua sendo propriedade estrutural, não
> promessa textual.

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
| `I9`/`I10` | sim | 4 arquivos por rodada + `$n01`/`$n02` não nulos | não |

**`EMPTY_COLLECTION_FALSE_PASS_VECTORS = 0`.**

> **A distinção que sustenta o número.** Existem **cinco** pontos em que a coleção vazia é o
> resultado **correto** (`E1`, `E2`, `E5.3`, item `13`, `RB2`). Em nenhum deles o `PASS` decorre
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
| Todo comando externo tem seu `$LASTEXITCODE` **capturado em variável na linha imediatamente seguinte** — **36 capturas**, nenhuma lida depois de outro comando ter rodado | `$g_ec1` `$g_ec2` `$g_ec3` · `$e1_ec` · `$e2_ec_rev` · `$rb_exit` `$rb_ec_list` · `$a3a_ec_tar` `$a3a_ec_cmp` · `$e4_ec_f` `$e4_ec_d` · `$p4c_exit` · `$pl_ec` · `$sl_ec` · `$df_ec` · `$e5_ec_rm` `$e5_ec_rd` `$e5_ec_d` `$e5_ec_f` · `$e6_ec` · `$a7_ec` · `$t_exit` `$t_ec_list` · `$a14_ec_tar` `$a14_ec_cmp` · `$a8_ec` · `$rb1_ec` · `$rb2_ec_f` `$rb2_ec_d` · `$rb3_ec` · `$rb4_ec` · `$rb5_ec` · `$t01_ec` · `$i4_ec_pid` `$i4_ec_rev` · `$t02_ec` |
| *stderr* de todo canal binário é **redirecionado para arquivo** e **contado** | `03_ROLLBACK_STDERR.txt` · `04C_STDIN_PROBE_STDERR.txt` · `13_TAR_STDERR.txt` · `I2_TAR01_STDERR.txt` · `I5_TAR02_STDERR.txt`; `06_EXTRACAO.txt` e `RB4_EXTRACAO.txt` capturam `2>&1` **e** gravam a linha `…_EXTRACAO_EXIT` |
| Nenhuma linha inesperada de *stderr* é tolerada | `if (…Count -ne 0) { throw }` em cada um dos cinco arquivos de *stderr*; em `E6`, `$e6_ruido` conta linhas fora do conjunto esperado |
| O código de saída é **barreira auxiliar, nunca prova** | declarado em `A-3` e repetido na ressalva de `E5`: `rm -f` devolve `0` para arquivo inexistente e `$LASTEXITCODE` só atravessa `adb shell` com *shell protocol* `v2` |
| Existe **um** caso em que código ≠ 0 é o `PASS` | `pidof` devolve `1` quando não encontra processo (`E1`, `I4/E1'`, item `13`). Nesses três pontos o desenho **não** testa o código: testa `PIDS_ENCONTRADOS = 0`, gravado em arquivo. Está anotado no próprio passo, para que nenhum editor futuro "conserte" o que não está quebrado |

> **Consequência direta:** **nenhum passo deste documento conclui `PASS` por não ter havido
> exceção.** Todo `PASS` é a comparação explícita de um valor medido contra um valor esperado, e
> todo valor medido está gravado em disco antes de ser comparado.

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

---

## 18. Auditoria estática final — quadro de tokens verificáveis

Cada linha abaixo é uma afirmação **verificável por leitura deste documento**, sem execução.
A coluna *onde verificar* dá a âncora — quem auditar não precisa acreditar em nenhuma delas.

| # | token | valor | onde verificar |
|---:|---|---|---|
| 1 | `WILDCARDS_IN_DESTRUCTIVE_COMMANDS` | **0** | `E5.1`/`E5.2`/`RB3.2` — `rm -f -- <caminho>` e `rmdir -- <caminho>`, um caminho literal por chamada; §2.4 rejeita `*`, `?`, `[`, `]` |
| 2 | `PATH_TRAVERSAL_VECTOR` | **NONE** | §2.4 — `$RX_CAMINHO` **mais** validação por segmento; a tabela `ORIGEM` prova que a regex sozinha **não** basta |
| 3 | `VALIDATE_ALL_BEFORE_FIRST_DELETE` | **SIM** | `RB3.1` (`READ-ONLY`, valida a lista inteira e grava `RB3_VALIDACAO.txt`) precede `RB3.2`; `E4` valida tudo e faz `throw` antes de `E5` |
| 4 | `ROLLBACK_META_PERSISTED` | **SIM** | `E3` grava `03_ROLLBACK_META.txt` (10 chaves) + `Assert-Evidencia … 10` |
| 5 | `ROLLBACK_HASH_ASSERTED` | **SIM** | `RB1` — `Get-FileHash` recalculado e comparado a `ROLLBACK_TAR_SHA256` do meta |
| 6 | `ROLLBACK_SIZE_ASSERTED` | **SIM** | `RB1` — `Get-Item … .Length` comparado a `ROLLBACK_TAR_BYTES` do meta |
| 7 | `EMPTY_COLLECTION_FALSE_PASS_VECTORS` | **0** | §13.2, tabela integral: 5 pontos com vazio legítimo, todos com valor gravado **e** canário independente |
| 8 | `STAT_PROBE_BEFORE_E5` | **SIM** | `E4D`, e `E5` lista `E4D PASS` como pré-condição cumulativa |
| 9 | `SELINUX_PROBE_BEFORE_E5` | **SIM** | `E4E`, idem |
| 10 | `SELINUX_EMPTY_PASS_VECTOR` | **NONE** | `E4A` exige `context.Length > 0`; `E7A` prova `PRE_PATH_COUNT`, `POST_PATH_COUNT` e domínio de comparação **antes** de comparar valores |
| 11 | `MODE_4XX_MUST_NOT_PASS_OWNER_RW_CHECK` | **SIM** | `E7B` — o teste é sobre o **dígito** do dono, exigindo equivalência a `6`; `4` reprova |
| 12 | `I5_LITERAL_COMMANDS_PRESENT` | **SIM** | §8, `I5` é bloco **completo e literal**; não existe "trocar `01` por `02`" em lugar algum |
| 13 | `I4_REVALIDATES_E1_E2` | **SIM** | §8, `I4` → `E1'` (`pidof`) e `E2'` (portas, `node`, `reverse`), cada um com arquivo e asserção próprios |
| 14 | `IDEMPOTENCE_EVIDENCE_PATHS_UNIQUE` | **SIM** | §8, `$R01` e `$R02`; `I9` audita rodada a rodada; `I10` discrimina `RODADA01`/`RODADA02`/`COMUM` |
| 15 | `SCOPE_HISTORICAL_CONFLICT_EXPLICITLY_SUPERSEDED` | **SIM** | §1.1 — cita `14_R2_SESSAO_2.md` §11 item `14` e §8.1 **literalmente** e delimita a supersessão |
| 16 | `MTIME_CAN_STOP` | **NÃO** | `E7C` não contém `throw`, `if` de reprovação nem comparação com valor esperado |
| 17 | `PM_CLEAR_PRESENT` | **NÃO** | busca textual por `pm clear` no documento: só aparece como **proibição** |
| 18 | `INSTALL_PRESENT` | **NÃO** | nenhum `pm install`, `adb install` ou `install-multiple` |
| 19 | `UNINSTALL_PRESENT` | **NÃO** | nenhum `pm uninstall` ou `adb uninstall` |
| 20 | `ROOT_REQUIRED` | **NÃO** | todo acesso ao *sandbox* é por `run-as`; nenhum `adb root`, `su` ou `setenforce` |
| 21 | `COMPARE_STATE_EDIT_REQUIRED` | **NÃO** | o instrumento é **consumido**, nunca parametrizado; `E0.4` confere `SHA256` e `bytes` antes de usar |

> **O que este quadro NÃO é.** Não é prova de que os comandos **funcionam** no aparelho — nada
> aqui foi executado. É prova de que as **propriedades de segurança** afirmadas pelo documento
> são verificáveis **na letra do documento**, por qualquer auditor, **sem** ligar o tablet.
