# 28 · `BUILD NATIVE 01` — evidência do primeiro build nativo causal

> **NOTA DE CUSTÓDIA, ANTES DE TUDO.** O APK descrito aqui foi construído em
> `521d59c14f265fde4a4b3c6f5d7638693571d4c8`. **Este documento foi criado DEPOIS** da
> tentativa remota, exatamente para que `521d59c` permanecesse o `gitCommitHash` real do
> build. Logo: **este arquivo NÃO integra o binário produzido** e nenhum trecho dele
> esteve presente na árvore que o EAS empacotou. Ler qualquer frase abaixo como se fosse
> conteúdo do APK é erro de leitura.

---

## §1 · Cabeçalho de custódia

| Campo | Valor |
| --- | --- |
| Missão | `BUILD NATIVE 01` + `EVIDENCE SEAL 01` |
| Plataforma | `ANDROID` |
| Perfil | `development` |
| `BUILD_ID` | `a123250f-384e-4665-a443-2c783351aad0` |
| HEAD construído | `521d59c14f265fde4a4b3c6f5d7638693571d4c8` |
| `status` | `FINISHED` |
| `createdAt` | `2026-08-13T16:18:04.621Z` |
| `completedAt` | `2026-08-13T16:58:21.159Z` |

Comando disparado, literal e único:

```
eas build --platform android --profile development --non-interactive
```

Toda a evidência bruta (JSON, logs, APK) vive **fora do repositório**, em
`C:\tmp\ptf_evidencias_build_native_01\`. Nada disso é versionado — nem o APK, nem as
URLs assinadas dos logs remotos.

---

## §2 · Introspecção (medição do Manifest **lógico**)

Registrada aqui por custódia; foi produzida em missão anterior (`DIAG LIFO INTROSPECT 01`)
e **não foi reexecutada** nesta missão.

| Item | Valor |
| --- | --- |
| Comando original | `.\node_modules\.bin\expo.cmd config --type introspect --json` |
| `expo` | `54.0.36` |
| `@expo/config-plugins` | `54.0.5` |
| Artefato externo | `expo_config_introspect.json` |
| `SHA256` | `B2B32C7E1BA39E4CCCF4A79A641FDB8B94A12D57575366722DC8C0761503E214` |

`MainActivity` medida (aplicação única, activity única):

```
android:name=".MainActivity"
android:screenOrientation="@integer/screen_orientation"
android:configChanges="keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode"
android:exported="true"
```

**Classificação: `MEDIÇÃO DIRETA ATUAL DO MANIFEST LÓGICO`.**

Isto **não** é leitura do `AndroidManifest.xml` binário do APK. É o resultado da mesma
cadeia `getPrebuildConfigAsync` que o prebuild usa, compilada com `introspect: true`. O
valor tem força para responder à questão LIFO do *mod* de manifesto — `withOrientation` do
Expo escreveu o literal e o plugin de `plugins/withAndroidTabletOrientation.js` sobrescreveu
com a referência — e **nenhuma** força sobre o que foi efetivamente empacotado no APK.

---

## §3 · Gates locais imediatamente antes do disparo

Fatos medidos na árvore canônica, todos na mesma sessão e antes do `eas build`:

| Gate | Medição |
| --- | --- |
| `G-06` portas `8081`/`8082`/`8083` | livres; nenhum escritor do projeto presente |
| HEAD | `521d59c14f265fde4a4b3c6f5d7638693571d4c8` |
| Branch | `feat/fase6-shell-splash` |
| `git status --porcelain --untracked-files=all` | vazio |
| `git diff --quiet HEAD --` | `TRACKED_DIFF_EXIT=0` |
| `npm run verify:runtime` | `EXIT=0` |
| `gate:platform-scope` | `OK` — `1403` arquivos |
| `expo export:embed --platform android` | `2381 modules`, `Done writing bundle output` |
| `npm run smoke` | `4942/4942 passed, 0 failed` |
| `npx expo-doctor` (local) | `18/18 checks passed. No issues detected!` |
| `eas whoami` | `eduardocriacao` |
| `projectId` (`app.json`) | `ccf727af-fd51-4722-bf88-787cd48553c8` |
| Perfil `development` (`eas.json`) | `developmentClient: true` · `distribution: internal` · `android.buildType: apk` |

Corroboração remota independente: o builder do EAS executou `expo doctor` por conta própria
na fase `RUN_EXPO_DOCTOR` e reportou, literal, `18/18 checks passed. No issues detected!`.

---

## §4 · O build

**Credenciais.** Reutilizadas, sem qualquer mutação:

```
√ Using remote Android credentials (Expo server)
√ Using Keystore from configuration: Build Credentials sY31pjNJH0 (default)
```

Nenhuma credencial foi **criada**, **trocada** ou **reparada**. `eas credentials` não foi
executado em momento algum.

**Metadados terminais** (de `eas build:view … --json`, arquivo externo
`eas_build_view_a123250f.final.json`, `5013 B`,
`SHA256 B8EDE8F212F83A1C78ADDBB8D18CE2F1B1EF8EF3EE1C884B2F62DF42BA38DBB5`):

| Campo | Valor |
| --- | --- |
| `id` | `a123250f-384e-4665-a443-2c783351aad0` |
| `status` | `FINISHED` |
| `platform` | `ANDROID` |
| `buildProfile` | `development` |
| `distribution` | `INTERNAL` |
| `sdkVersion` | `54.0.0` |
| `gitCommitHash` | `521d59c14f265fde4a4b3c6f5d7638693571d4c8` |
| `appVersion` | `1.0.0` |
| `appBuildVersion` | `1` |
| `fingerprint.id` | `019ff947-f2d6-7fcd-a72c-578d27a812e1` |
| `fingerprint.hash` | `21e4500a30350da9482727b5451b309b1cf15e16` |
| `metrics.buildWaitTime` | `3608` |
| `metrics.buildQueueTime` | `1558125` |
| `metrics.buildDuration` | `854805` |

Campos **ausentes** do payload, registrados como ausência e não preenchidos por inferência:
`runtimeVersion`. Nenhum campo de `applicationId`/*identifier* existe no JSON.

**A árvore permaneceu limpa durante todo o build** — `git status --porcelain
--untracked-files=all` vazio antes, durante e depois; `TRACKED_DIFF_EXIT=0` nas duas
aferições.

---

## §5 · `AAPT2` / compilação de resources

### `AAPT2_LITERAL_LOG_CAPTURED`

`logFiles` no JSON terminal é um **array de 1 elemento**, uma URL assinada de expiração
curta (`storage.googleapis.com`). A URL **não** é transcrita aqui. O objeto servido vem com
`Content-Encoding: br` (Brotli) e `Content-Type: text/plain;charset=utf-8`; foi baixado duas
vezes por caminhos independentes, **byte-idênticos**, e decodificado fora do repositório:

| Arquivo externo | Tamanho | `SHA256` |
| --- | --- | --- |
| `remote_logs/build_log_00.raw.bin` (Brotli) | `66670 B` | `B14B87E0D40A8BB5FF48FA0F27440B9979AF0D52017168D6B1ED2EB28F43FCCC` |
| `remote_logs/build_log_00.decoded.txt` (NDJSON) | `731215 B` · `1967` linhas | `C36B708AD6B04AE08A1357C27D5BEA162811AB6B4E14682540A0D3172AB4E1C8` |

Sequência real de fases do builder:

```
SPIN_UP_BUILDER → INSTALL_CUSTOM_TOOLS → PREPARE_PROJECT → PRE_INSTALL_HOOK →
READ_EAS_JSON → READ_PACKAGE_JSON → INSTALL_DEPENDENCIES → READ_APP_CONFIG →
RUN_EXPO_DOCTOR → PREBUILD → RESTORE_CACHE → POST_INSTALL_HOOK →
CALCULATE_EXPO_UPDATES_RUNTIME_VERSION → PREPARE_CREDENTIALS → CONFIGURE_EXPO_UPDATES →
RUN_GRADLEW → GRADLE_BUILD_PROFILE → PRE_UPLOAD_ARTIFACTS_HOOK →
UPLOAD_APPLICATION_ARCHIVE → SAVE_CACHE → CACHE_STATS → ON_BUILD_SUCCESS_HOOK →
ON_BUILD_COMPLETE_HOOK → UPLOAD_BUILD_ARTIFACTS
```

Trecho mínimo suficiente — nomes **reais** das tarefas de resources, fase `RUN_GRADLEW`:

```
L606  > Task :app:mergeDebugResources
L607  > Task :app:packageDebugResources
L608  > Task :app:parseDebugLocalResources
L611  > Task :app:processDebugMainManifest
L616  > Task :app:processDebugManifest
L648  > Task :app:processDebugResources
```

Resultado, no perfil de execução emitido pelo próprio Gradle (`GRADLE_BUILD_PROFILE`,
`102 tasks, total task time: 831.2s`):

```
:app:mergeDebugResources            7.1s   0.9%   executed
:app:processDebugResources          6.5s   0.8%   executed
:app:processDebugMainManifest       2.6s   0.3%   executed
:app:processDebugManifestForPackage 4.5s   0.5%   executed
:app:packageDebug                   1.4s   0.2%   executed
```

Fecho literal do Gradle:

```
L1917  BUILD SUCCESSFUL in 13m 30s
L1918  550 actionable tasks: 550 executed
```

Nenhum erro: o log tem **`0`** registros com `level >= 40`. Nenhuma linha de `AAPT2`
contraditória com `FINISHED` — logo **não** há `STOP_REMOTE_LOG_CONTRADICTION`.

O prebuild remoto executou de fato (`PREBUILD`: `Creating native directory (./android)` →
`Running prebuild` → `✔ Finished prebuild`), com um aviso não fatal registrado por
honestidade: `» android: userInterfaceStyle: Install expo-system-ui in your project to
enable this feature.`

### Registro separado: `EAS_BUILD_FINISHED`

O build remoto concluiu a pipeline inteira. Isso é fato próprio e **não** deve ser
renomeado como transcrição de nada. Ele demonstra conclusão; a transcrição literal das
tarefas de resources está acima, e é ela — não o `FINISHED` — que sustenta o token
`AAPT2_LITERAL_LOG_CAPTURED`.

---

## §6 · XMLs de orientação

### `REMOTE_XML_VALUES_NOT_DIRECTLY_EXPOSED`

Busca ampla no log remoto decodificado por `screen_orientation`, `values-sw600dp` e
`integers.xml`: **zero ocorrências**. Portanto:

- `android/app/src/main/res/values/integers.xml` **atual** — conteúdo **não transcrito**;
- `android/app/src/main/res/values-sw600dp/integers.xml` **atual** — conteúdo **não
  transcrito**.

O builder não emite o conteúdo dos recursos gerados, e a fase `PREBUILD` não os despeja.
Ausência de prova permanece ausência de prova; nada aqui é preenchido por dedução.

**Distinção que este artefato preserva, sem colapsar os quatro níveis:**

| Nível | O que é | Estado |
| --- | --- | --- |
| Prova estática atual | `plugins/withAndroidTabletOrientation.js` é o **único** escritor de `screen_orientation`/`android:screenOrientation` em código próprio; `values: 1`, `values-sw600dp: -1` estão literais na fonte | **PROVADO** |
| Medição direta atual | introspecção do Manifest **lógico** (§2): `@integer/screen_orientation` venceu o literal do Expo | **PROVADO** (só o Manifest) |
| Medição histórica direta | prebuild em `e2702d2` (artefato `21` §4.2/§4.3) transcreveu `1` e `-1` nos dois *buckets* | **HISTÓRICO**, não contemporâneo |
| XML remoto atual | conteúdo dos dois `integers.xml` neste build | **NÃO OBSERVADO** |

O build remoto `FINISHED` **corrobora** que o AAPT2 compilou e linkou os resources sem
erro, mas **não discrimina** a ordem LIFO: um encadeamento invertido produziria um build
igualmente verde, apenas com o tablet travado em retrato. A questão LIFO segue respondida
**apenas** pela introspecção, e **apenas** para o Manifest.

---

## §7 · APK

**Nunca commitar o APK no repositório.** Ele vive somente em
`C:\tmp\ptf_evidencias_build_native_01\`.

| Item | Valor |
| --- | --- |
| Arquivo local de evidência | `build_native_01_a123250f.apk` |
| Origem | `artifacts.applicationArchiveUrl` do JSON terminal |
| Nome no builder | `android/app/build/outputs/apk/debug/app-debug.apk (217 MB)` |
| Tamanho | `227650294 B` (`217,1 MB`) |
| `SHA256` | `027395178CF65DC0C1D7EE04975057262AC5AEB03BEFA7434A1318ACCF97262E` |
| *Magic* | `50 4b 03 04` (ZIP) |

Extensão `.apk` confirmada — **não** há `STOP_UNEXPECTED_ARTIFACT_TYPE`. O arquivo **não
foi aberto, instalado nem enviado a dispositivo**; foi apenas lido como ZIP em modo
somente-leitura pela API `System.IO.Compression` já disponível, sem extrair nada.

### Estrutura ZIP — `1672` entradas

| Entrada | Medição |
| --- | --- |
| `AndroidManifest.xml` | **presente** — comprimido `4756`, descomprimido `20764` |
| `resources.arsc` | **presente** — `1824296` (armazenado sem compressão) |
| `classes*.dex` | **9** arquivos: `classes.dex` … `classes9.dex` |
| `META-INF/` | `103` entradas |
| `res/` | `1295` · `lib/` `96` · `META-INF/` `103` · `kotlin/` `8` · `assets/` `4` |

### Assinatura — `NOT_MEASURED`

`APK_SIGNATURE_FINGERPRINT_NOT_MEASURED`

Nenhuma *fingerprint* do APK novo foi obtida. O motivo correto é **não ter sido executada
uma ferramenta apropriada para inspeção de assinatura APK v2/v3** — `apksigner` não foi
executado nem instalado (proibido), e `apkanalyzer` tampouco.

Estado real do `keytool` neste host, conforme medido pela auditoria adversarial:

| Sonda | Resultado |
| --- | --- |
| `Get-Command keytool` | **não encontrado no PATH** |
| `Get-Command java` | `C:\Program Files\Common Files\Oracle\Java\javapath\java.exe` |
| `JAVA_HOME` | `C:\Program Files\Java\jdk-21` |
| `Test-Path "$env:JAVA_HOME\bin\keytool.exe"` | `True` |
| `Test-Path "C:\Program Files\Java\jdk-21\bin\keytool.exe"` | `True` |

Ou seja: **`keytool` ESTÁ INSTALADO**, em `C:\Program Files\Java\jdk-21\bin\keytool.exe`. O
que faltava era **resolução pelo PATH** do ambiente medido — não o binário. Ele **não foi
executado** nem na missão de build nem na de reparo documental.

Observação estrutural que **é** medida, e que não substitui a *fingerprint*: entre as `103`
entradas de `META-INF/` **não existe** nenhum `META-INF/*.RSA`, `*.DSA`, `*.EC`, `*.SF` nem
`META-INF/MANIFEST.MF` na raiz — a única correspondência é
`META-INF/versions/9/OSGI-INF/MANIFEST.MF`, que é recurso de biblioteca, não bloco de
assinatura. A ausência desses artefatos clássicos é **compatível** com um APK assinado
apenas por esquema v2/v3, e explica por que `keytool -printcert -jarfile` — que lê a
assinatura clássica **v1** — não teria bloco algum para ler, mesmo se `keytool` estivesse no
PATH. Isso é leitura de **estrutura do ZIP**, e **não prova criptográfica** da versão de
assinatura: só uma ferramenta de verificação v2/v3 poderia estabelecer isso.

> **ERRATA PÓS-AUDITORIA · `BUILD NATIVE 01` · FIX-1 (`keytool`).** A primeira versão deste
> artefato, commitada em `891d702`, afirmava que "`keytool` **não está instalado** neste
> ambiente". A auditoria adversarial verificou que a afirmação era **imprecisa**: o
> executável existe em `C:\Program Files\Java\jdk-21\bin\keytool.exe`, e o que foi
> efetivamente medido era **ausência no PATH**, não ausência do binário. Por isso o token
> `APK_SIGNATURE_FINGERPRINT_NOT_MEASURED_WITH_AVAILABLE_TOOL` foi substituído por
> `APK_SIGNATURE_FINGERPRINT_NOT_MEASURED`: a premissa "sem ferramenta disponível" era
> falsa e não podia sobreviver dentro do token. **A conclusão técnica não muda** — a
> *fingerprint* do APK novo **NÃO foi medida**, e a verificação de assinatura segue
> pendência do `INSTALL GATE`. `BUILD_NATIVE_01_BUILD_PASS` permanece **inalterado**: a
> correção é de custódia documental, não de mérito do build.

Isto **não é STOP do build**. A verificação de assinatura permanece **pendência do
`INSTALL GATE`**, que não existe ainda.

### `applicationId` — `CONFIG_EXPECTATION_ONLY`

`APK_APPLICATION_ID_NOT_DIRECTLY_MEASURED_WITH_AVAILABLE_TOOL`

- `CONFIG_EXPECTATION`: `com.valentedev.pequenostracosdefe` — fonte: `app.json`
  (`android.package`).
- O JSON do EAS **não possui** campo de *identifier*; as chaves de topo são
  `appBuildVersion, appVersion, artifacts, buildProfile, completedAt, createdAt,
  distribution, expirationDate, fingerprint, gitCommitHash, gitCommitMessage, id,
  initiatingActor, isForIosSimulator, logFiles, metrics, platform, priority, project,
  sdkVersion, status, updatedAt`.
- A única ocorrência de `com.valentedev` no log remoto está na fase `READ_APP_CONFIG`, que é
  o builder **ecoando o próprio `app.json`**. Eco de configuração não é medição do binário:
  continua `CONFIG_EXPECTATION`.

### Manifest binário — não decodificado

`APK_BINARY_MANIFEST_NOT_DECODED_WITH_AVAILABLE_TOOL`

`AndroidManifest.xml` dentro do APK é **XML binário (AXML)**. Sem `aapt2`/`apkanalyzer` já
instalados, **nenhum valor empacotado é declarado aqui** — nem `android:screenOrientation`,
nem `package`. Busca pela *string* `portrait` dentro do APK **não foi usada como prova** e
não seria prova: um binário AXML não se lê por *grep*.

Isso **não apaga** a medição introspectada de §2, que continua sendo a prova do Manifest
**lógico** de prebuild — mas as duas coisas são camadas distintas e não se substituem.

---

## §8 · Limites normativos

Este artefato registra um build. Ele **não** promove nada. Explicitamente:

- **NÃO** concede `F6-SG-A`.
- **NÃO** concede `F6-SG-C`.
- **NÃO** concede `SD-1`.
- **NÃO** fecha `R1-PEND-1`, `R1-PEND-2`, `R1-PEND-3`, `R1-PEND-4` nem `R1-PEND-5`.
- **NÃO** executa os `BLOCOS B`..`E`.
- **NÃO** é prova física.
- **NÃO** autoriza instalação.
- **NÃO** autoriza `adb install`.
- **NÃO** autoriza `pm clear`.
- **NÃO** autoriza desinstalação.
- **NÃO** autoriza substituição do binário instalado.
- **NÃO** transfere prova alguma para o APK **hoje instalado** no `SM-X510`.
- **NÃO** investiga `ACHADO-V1`.

**O build novo NÃO foi instalado.** O QR code e o link de instalação emitidos pela CLI
foram deixados sem uso deliberadamente.

**Nenhum comando ADB foi emitido durante `BUILD NATIVE 01`.** A sonda passiva de processos
detectou um servidor `adb.exe` **pré-existente e residente no host**, `PID 24760`, linha de
comando `adb -L tcp:5037 fork-server server --reply-fd 704`. Esse processo **não** foi
iniciado, morto, reiniciado nem utilizado pela missão — foi apenas **observado**. Nenhuma
operação foi enviada ao `SM-X510`, que **permaneceu intocado**: nenhum `adb devices`,
nenhum `adb install`, nenhum `adb uninstall`, nenhum `pm clear`, nenhum toque no aparelho.

Essa é a medição **daquela janela de execução**. Este artefato **não** afirma nada sobre o
estado do daemon `adb` agora.

A custódia do binário descrita no artefato `26` e em `D-FUND-PREBUILD-01` permanece
**integralmente vigente**: `GERAR` foi autorizado e feito; `INSTALAR`, `DESINSTALAR`,
`SUBSTITUIR` e `LIMPAR DADOS` seguem proibidos sem gate próprio.

> **ERRATA PÓS-AUDITORIA · `BUILD NATIVE 01` · FIX-2 (ADB).** A primeira versão deste
> artefato, commitada em `891d702`, dizia "nenhum ADB foi executado nesta missão". A
> auditoria adversarial apontou que a frase era **ampla demais**: podia ser lida como
> "não havia processo ADB algum no host", o que a medição não sustenta. O fato correto tem
> duas metades, agora registradas acima: (1) **nenhum comando ADB foi emitido** pela missão;
> (2) um **daemon ADB pré-existente**, `PID 24760`, foi **observado** pela sonda passiva de
> processos — e deliberadamente não foi morto nem tocado. Nenhuma mutação do aparelho
> ocorreu, e `D-FUND-PREBUILD-01` permaneceu **respeitada** o tempo todo.
> `BUILD_NATIVE_01_BUILD_PASS` permanece **inalterado**: a correção é de custódia
> documental, não de mérito do build.

---

## §9 · O que este artefato de fato prova

1. A árvore em `521d59c` é **bundleável** (`verify:runtime` `EXIT=0`) e **construível
   nativamente** (`BUILD SUCCESSFUL`, `550/550`).
2. O EAS construiu **o commit certo** (`gitCommitHash` bate), no **perfil certo**
   (`development`), com a **versão certa** (`1.0.0` / `1`), reutilizando a credencial
   existente.
3. O `AAPT2` **compilou e linkou** os resources Android sem erro — com nome de tarefa e
   resultado literais.
4. Existe um APK de `227650294 B` com `SHA256`
   `027395178CF65DC0C1D7EE04975057262AC5AEB03BEFA7434A1318ACCF97262E`, estruturalmente
   íntegro como pacote Android.

E, com igual clareza, **o que ele não prova**: nada sobre o comportamento do app em
execução, nada sobre orientação em tablet físico, nada sobre o conteúdo empacotado do
Manifest binário, nada sobre os dois `integers.xml` deste build, e nada sobre a assinatura
do APK.

Refs: artefato `21` §4 · artefato `26` · artefato `27` · `D-FUND-PREBUILD-01` ·
`D-FUND-BUILD-SEQUENCE-01` · `plugins/withAndroidTabletOrientation.js`
