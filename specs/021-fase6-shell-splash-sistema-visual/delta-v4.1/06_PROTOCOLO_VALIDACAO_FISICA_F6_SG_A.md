# `06` — Protocolo de validação **física** de `F6-SG-A`

> **Estado:** `F6-R3` **EM ANDAMENTO**. Todos os portões **automatizados** de `F6-R3` estão verdes.
> Este documento é o que falta executar — **no aparelho** — antes que `F6-SG-A` possa sequer ser
> considerado. **`F6-SG-A` NÃO está concedido** e não pode ser concedido a partir deste documento:
> ele só descreve **o que observar**. Quem aprova é o fundador, com evidência.

> **Princípio que governa esta sessão:** não estamos tentando fazer o relatório ficar verde.
> Estamos tentando **provar que o comportamento correto existe**. Um cenário que não pôde ser
> executado é registrado como **NÃO EXECUTADO** — nunca como `PASS`.

---

## 0. Referência de estado — o que exatamente se valida

| Item | Valor |
|---|---|
| Worktree canônico | `C:\tmp\ptf_fase6_shell_splash_wt` |
| Branch | `feat/fase6-shell-splash` |
| `HEAD` a validar | **`456ac1b`** *(emenda de 2026-08-10; era `f013560` na redação original, antes dos commits `169e439` e `456ac1b` de `F6-R3.x`)* |
| Base documental do delta | `a190b3e` |
| Upstream | **nenhum** — nada foi enviado ao remoto |

⚠️ **Existe um segundo worktree no disco** (`C:\tmp\ptf_colorir_canonical_runtime_wt`). Ele **não** é
o alvo desta validação. Iniciar o Metro na pasta errada é a forma mais fácil de validar código que
não é este — o passo 1 existe justamente para impedir isso.

---

## 1. Passos 1–4 · Confirmar worktree, branch, `HEAD` e árvore limpa (PowerShell)

Cole o bloco inteiro em **uma** janela do PowerShell. Ele **não altera nada** — só confere.

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt

Write-Host "1) PASTA  : $((Get-Location).Path)"
Write-Host "2) BRANCH : $(git rev-parse --abbrev-ref HEAD)"
Write-Host "3) HEAD   : $(git rev-parse --short HEAD)"
$sujo = git status --porcelain
if ([string]::IsNullOrWhiteSpace($sujo)) { Write-Host "4) ARVORE : LIMPA" }
else { Write-Host "4) ARVORE : SUJA — PARE"; $sujo }
```

**Aceite:** pasta `C:\tmp\ptf_fase6_shell_splash_wt` · branch `feat/fase6-shell-splash` · `HEAD`
`f013560` · árvore `LIMPA`.

**Se qualquer um dos quatro divergir, PARE e reporte.** Não reconcilie silenciosamente: um `HEAD`
diferente significa que o que está no aparelho **não é** o que este documento descreve.

---

## 2. Passo 5 · Qual *build* representa exatamente este código

### 2.1 Precisa de *build* nativo novo? **NÃO.** — e a razão técnica

> **EMENDA DE 2026-08-10 — este parágrafo CADUCOU pela própria cláusula do fim da seção.**
> O *commit* `456ac1b` (`F6-R3.x`) **tocou `eas.json` e `package.json`**, exatamente as duas
> condições que a cláusula de caducidade previa. Consequências, já decididas:
>
> - **Para o Development Build:** o binário `development` já instalado **continua válido** para o JS
>   servido pelo Metro. *Fingerprint* divergente é **sinal conservador de detecção de mudança**, não
>   contrato de incompatibilidade nativa — nenhuma dependência com código nativo foi adicionada.
>   **Toda a campanha do Development Build (rodadas `R1`–`R6`) segue sem *build* novo.**
> - **Para o `preview`:** um **novo *build* `preview` Android pós-`456ac1b` é OBRIGATÓRIO** — ver
>   §2.4. Ele **não** é gerado enquanto as rodadas `R1`–`R6` não estiverem concluídas.
> - O comando de verificação abaixo **não sai mais vazio**. Ele permanece no documento como
>   ferramenta de auditoria, **não** como prova de dispensa.

`F6-R3` inteiro é **JavaScript**. Verificação objetiva, executável:

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
git diff --name-only a190b3e..HEAD -- app.json app.config.js eas.json package.json package-lock.json android ios
```

**Esse comando sai VAZIO.** Nenhum arquivo que participa da camada nativa mudou: sem dependência
nova, sem *plugin* novo, sem alteração de `app.json`/`eas.json`, e o projeto é *managed* (não existem
pastas `android/` nem `ios/` no repositório). Os 12 arquivos alterados são `scripts/` e `src/`.

**Consequência:** o binário nativo já instalado no aparelho continua sendo o binário correto. O que
mudou é **só o *bundle* JS**, e o *bundle* JS é servido pelo **Metro** em tempo real. Gerar um *build*
novo aqui seria **hábito, não necessidade** — custaria tempo de fila do EAS e não mudaria um byte do
que será exercitado.

> **Quando isso deixaria de valer:** se qualquer *commit* futuro tocar `app.json`, `eas.json`,
> `package.json` ou adicionar dependência com código nativo, um *build* novo passa a ser
> **obrigatório** e este parágrafo caduca. Reexecute o comando acima antes de confiar nele.

### 2.2 Qual *build* serve

Serve **qualquer *development build* (perfil `development` do `eas.json`) já instalado**, desde que
tenha sido gerado a partir de um *commit* em que os arquivos nativos acima estejam iguais aos de
hoje — o que, nesta branch, é **todo** *commit* de `a190b3e` em diante.

Para conferir o que existe na conta EAS:

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
npx eas build:list --platform android --profile development --limit 5
npx eas build:list --platform ios --profile development --limit 5
```

**Se não houver nenhum *development build* instalado no aparelho**, aí sim é preciso gerar um — e
**só nesse caso**:

```powershell
npx eas build --platform android --profile development
# ou, para iPad/iPhone:
npx eas build --platform ios --profile development
```

### 2.3 Passo 8 · **Expo Go é PROIBIDO** nesta validação

Não é preferência: é impossibilidade técnica. O projeto declara `expo-dev-client` e
`react-native-purchases` (RevenueCat) — módulos nativos que **não existem** dentro do Expo Go. Abrir
o app no Expo Go produziria erro de módulo nativo ausente ou, pior, um app **parcialmente**
funcional cujo comportamento **não é** o do produto. **Um `PASS` obtido no Expo Go não vale.**

### 2.4 *Build* `preview` não-DEV — **obrigatório**, e **só na rodada `R7`** *(emenda de 2026-08-10)*

Decisão de fundador **`D-3`**: **`T090` / `F-PERF` / `P-139` passa a ser complemento obrigatório do
Human Gate de `F6-SG-A`** — registrado como **complemento posterior**, sem fingir que constava da
redação histórica do §27. Razão: `F6-R3.x` alterou infraestrutura *F6-owned* **especificamente** para
tornar `P-139` verificável, e `SG-B` não será aberto deixando essa implementação **fisicamente não
provada**.

Por que um *build* novo é inevitável — cadeia de prova:

| # | Fato | Como se prova |
|---|---|---|
| 1 | `EXPO_PUBLIC_PTF_PERF_TRACE` entrou no `eas.json` **hoje** | `git log --oneline -S"EXPO_PUBLIC_PTF_PERF_TRACE" -- eas.json` → **só `456ac1b`** |
| 2 | Variáveis `EXPO_PUBLIC_*` são **embutidas no *bundle* em tempo de *build*** | Comportamento do Babel/Expo — nenhum binário anterior pode tê-la |
| 3 | Os dois `preview` Android existentes estão **expirados** e são anteriores a `R3.x` | `eb1bad08` expirou 2026-07-16; `51bc7e68` expirou 2026-06-10 |
| 4 | O `preview` iOS ainda vigente **não tem a variável** | `git show eb871f5:eas.json` → `build.preview.env` sem `PERF_TRACE` |
| 5 | **Não existe rota OTA** | sem `expo-updates` no `package.json`; sem bloco `updates` e sem `runtimeVersion` no `app.json`; **nenhum** perfil declara `channel` |
| 6 | `preview` **não anexa ao Metro** | o perfil não declara `developmentClient` |

**Comando, quando a rodada `R7` for autorizada — uma plataforma basta** (`tasks.md` §3.5 e correção
do Portão 3: `P-139` é `NEF`, sem duplicação de plataforma):

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
npx eas build --platform android --profile preview
```

⚠️ **Risco de acervo — regra dura.** Todos os perfis compartilham o *package*
`com.valentedev.pequenostracosdefe`: o APK `preview` **substitui** o Development Build e
**compartilha o mesmo contêiner de dados** (`ptf_blobs` + AsyncStorage), e o acervo real é o **único
insumo** da campanha. Portanto:

1. as rodadas `R1`–`R6` são executadas **inteiras antes**;
2. **backup somente-leitura do acervo por `adb` antes** de qualquer instalação;
3. usar **`adb install -r`**; **NUNCA desinstalar** (desinstalar apaga o acervo); **`pm clear`
   proibido**;
4. discriminação em tempo de execução: o **Development Build** imprime linhas `[shell]` (o
   `logger.log` é `__DEV__`-only) e oferece o *launcher* do *dev client*; o **`preview`** não imprime
   `[shell]`, mas **imprime** `[PTF_PERF_SAMPLE]`.

**Aceite de `T090` (`R7`):** `[PTF_PERF_SAMPLE]` efetivamente emitido · `schema 2` · terminal
`first_layout` **ou** `ceiling` · `preview` com `PERF_TRACE` ativo · `production` **comprovadamente
sem** `PERF_TRACE` · **zero telemetria externa**.

---

## 3. Passos 6, 7 e 9 · Instalar/abrir o *build* certo e **não** testar um antigo por engano

### 3.1 Passo 7 · **O Metro é OBRIGATÓRIO** — e a rota é **USB + ADB** *(emenda de 2026-08-10)*

Sem Metro, o *dev client* cai no último *bundle* que conseguir — e é exatamente assim que se valida
código velho sem perceber. Com Metro rodando **nesta pasta**, o JS exercitado é o de `456ac1b`.

> **CORREÇÃO OPERACIONAL (Android).** Deixam de ser requisito do roteiro: **mesma rede Wi-Fi**,
> **QR Code** e **descoberta automática de servidor**. A rota preferencial — **já fisicamente
> comprovada** — é **USB + ADB + `adb reverse` + *deep link* explícito para `localhost:8081`**.
> Ela elimina de uma vez as três causas mais comuns de sessão inválida: rede divergente, servidor
> errado escolhido na lista e *bundle* servido por outra pasta.

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
npm run start:dev
```

`start:dev` é `node scripts/check-env.js && expo start --dev-client --clear --lan`:

- `--dev-client` → abre no *development build*, **não** no Expo Go;
- `--clear` → **zera o cache do Metro**, que é a segunda causa mais comum de testar código velho;
- `--lan` → mantido pelo `script`; **irrelevante nesta rota**, porque o transporte é o `adb reverse`.

**Pré-voo de transporte — obrigatório antes de abrir o app:**

```powershell
adb reverse --remove-all
adb reverse tcp:8081 tcp:8081
adb reverse --list
```

**Gate correto — NÃO exigir saída literal.** Neste ambiente o `adb reverse --list` pode imprimir com
prefixo de transporte, por exemplo:

```
UsbFfs tcp:8081 tcp:8081
```

O aceite é: **existe exatamente UM mapeamento relevante contendo `tcp:8081 tcp:8081`**. Prefixo como
`UsbFfs` **é permitido** e não invalida nada. **`FAIL` de pré-voo** apenas se o `8081` do tablet
**não** apontar para o `8081` do host — ou se houver mais de um mapeamento relevante concorrente.

### 3.2 Abrir no aparelho — ***deep link* explícito**

1. Instale/abra o app **Pequenos Traços de Fé (development build)** no aparelho — **não** o Expo Go,
   **não** um APK de `preview`/`production`.
2. Abrir **sempre** pelo *deep link* explícito, nunca pela lista de servidores nem por QR:

**Forma canônica — preservar o `url` URL-encoded**, que é a que já funcionou fisicamente:

```powershell
adb shell am start -a android.intent.action.VIEW `
  -d "pequenostracosdefe://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
```

Usar **essa mesma forma** tanto no *cold start* quanto em **todas** as reaberturas da rodada.

3. Se o app já estava aberto: repetir o *deep link* (ou sacudir → **Reload**).

> **Não usar apenas `am start -n .../.MainActivity` como prova de *bundle* atual.** Abrir a
> `MainActivity` direto **não** demonstra de qual servidor veio o JS — pode reabrir o último *bundle*
> em cache. A prova é o *deep link* explícito **mais** a confirmação #2 abaixo.

### 3.3 Passo 9 · Três confirmações de que **não** é um *build* antigo

| # | Confirmação | Como |
|---|---|---|
| 1 | O Metro está servindo **esta** pasta | O terminal do Metro imprime `C:\tmp\ptf_fase6_shell_splash_wt` no cabeçalho. Se imprimir `ptf_colorir_canonical_runtime_wt`, **PARE**: pasta errada |
| 2 | O aparelho pediu o *bundle* **agora** | Ao abrir pelo *deep link* (ou dar *Reload*), o terminal do Metro registra a requisição do *bundle*. **Sem linha nova no terminal, o app está usando JS embutido — inválido** |
| 3 | Não é `preview` nem `production` | Esses perfis embutem o JS no binário e **ignoram** o Metro. Só o perfil `development` serve |
| 4 | O túnel USB está de pé *(emenda 2026-08-10)* | `adb reverse --list` exibe **`tcp:8081 -> tcp:8081`** |

> **Regra dura:** se as **quatro** confirmações não forem obtidas, **nenhum** cenário abaixo pode ser
> marcado como `PASS`.

### 3.4 Estratégia de execução — **rodadas `R1` a `R7`** *(emenda de 2026-08-10)*

A campanha física é dividida em rodadas. **A ordem é congelada** e não é uma sugestão.

| Rodada | Conteúdo | Aparelho |
|---|---|---|
| **`R1`** | `G-PRE` (worktree, `adb reverse`, três confirmações) + leitura de `targetSdk` + *cold start* / `MainTabs` + `A-03` | SM-X510 |
| **`R2`** | Casos canônicos **independentes de rotação**: `1, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17` | SM-X510 |
| **`R3`** | *Resize* / rotação: `2, 3, 4, 5, E2, E3` — **conforme executabilidade real** | SM-X510 |
| **`R4`** | **Caso 13** (*rollback*), **isolado** | SM-X510 + *worktree* de `a190b3e` |
| **`R5`** | Extras restantes (`E1`, `E4`, `E5`, `E6`) + cenários **§28 de `SG-A`** + painéis de recusa + `TA-5R` | SM-X510 |
| **`R6`** | **iPad** (§27, literal) + **telefone físico real** (§28 #17 / `CN-1`) | iPad · telefone |
| **`R7`** | **Preview Android** (§2.4) + `T090`/`P-139` + validações de áudio apropriadas | SM-X510 |
| — | **Human Gate final** | — |

**Ordem operacional congelada:** (1) campanha do Development Build inteira → (2) inventário e backup
do acervo → (3) iPad → (4) telefone → (5) **só então** gerar/instalar o *Preview* Android → (6)
executar `T090`/`P-139` e as validações de áudio → (7) Human Gate final.

> **REGRA DE PARADA.** Qualquer **`FAIL` relevante** em uma rodada: **PARAR antes da rodada
> seguinte**, **classificar** conforme §7 e **reportar**. **Não corrigir automaticamente.** Retomar a
> campanha só depois de decisão explícita.

### 3.5 Rotação no Android — como registrar *(emenda de 2026-08-10)*

`app.json` declara `"orientation": "portrait"` **global**, sem *override* Android. Destravar paisagem
no Android **é `F6-R1.1` = `F6-SG-C` = CONGELADO**. Regra de redação:

- **`targetSdk` é entrada crítica**, lida no aparelho (`adb shell dumpsys package … | Select-String targetSdk`);
- **`targetSdk` isoladamente NÃO "decide" a rotação.** O **comportamento físico efetivo continua
  sendo a prova**;
- se a rotação permanecer bloqueada, os cenários dependentes são marcados **`NÃO EXECUTÁVEL EM
  ANDROID — política de orientação congelada para `SG-C`**, nunca `PASS` e nunca `FAIL`;
- **é proibido alterar `F6-R1.1` durante `SG-A`.** A política canônica de orientação permanece
  congelada para `F6-SG-C`.

### 3.6 Captura de log — regra de janela *(emenda de 2026-08-10)*

A captura usa **três janelas PowerShell independentes**: **`PS1`** Metro · **`PS2`** controle ADB ·
**`PS3`** `adb logcat`. **`PS3` permanece em primeiro plano** e é encerrada **explicitamente com
Ctrl+C**.

```powershell
adb logcat -v threadtime |
  Out-File "C:\tmp\ptf_evidencias\R1\raw.log" -Encoding utf8
```

- **Não usar `Start-Process`** para o `logcat` (nem com, nem sem *handle*);
- **`Tee-Object` não é necessário**;
- **preservar o `raw.log` íntegro** — o filtro é sempre um arquivo **adicional**, nunca substituto;
- a captura começa **antes** da abertura do app: `force-stop` → `logcat -c` → **`PS3` já rodando** →
  só então o *deep link*.

### 3.7 Superfície de abertura **NÃO é gate de `F6-SG-A`** *(emenda de 2026-08-10)*

Fica **removida** de qualquer rodada a exigência de *"deixar chegar ao mapa"* como critério de
`PASS`. Depois do *cold start*, o procedimento correto é:

1. aguardar o *runtime* **estabilizar**;
2. **registrar a superfície real** em que o app abriu;
3. **confirmar `MainTabs`** pelo `shell.log`;
4. executar a **navegação de *shell*** prevista para a rodada.

> Se o app abrir em **Home** em vez de Aventuras/Mapa: **registrar**, **NÃO reprovar `SG-A`** por
> isso, **NÃO corrigir**, e **não transformar a rodada em `F7`**. A **primeira jornada** e a
> **obrigatoriedade semântica do Mapa** pertencem à **`F7`**, que permanece congelada.

---

## 4. Passo 10 · O que observar em **cada** cenário

**Quatro invariantes ZERO valem em todos os casos aplicáveis** — e qualquer uma violada é `FAIL`,
independentemente do resto:

1. **ZERO** perda de píxel da criança;
2. **ZERO** associação da tinta ao *lineart* errado;
3. **ZERO** promoção destrutiva;
4. **ZERO** abertura silenciosa como canvas branco quando existe obra recuperável.

### 4.0 · `TK-A-062` — inventário de armazenamento **antes** (fazer primeiro)

Antes de abrir qualquer obra, registre: **quantas obras existem na galeria**, seus nomes/miniaturas
e, se possível, uma captura da galeria inteira. Ao fim de tudo, repita. **Aceite:** contagem e
integridade **idênticas**, salvo as obras que a própria sessão salvou de propósito.

#### Backup binário do estado persistido — rota canônica *(emenda de 2026-08-10)*

⚠️ **Não usar `adb exec-out … > arquivo.tar` direto no Windows PowerShell 5.1** como rota canônica:
o `>` do PowerShell trata a saída como **texto** e corrompe o TAR.

**1) Inspecionar SOMENTE LEITURA, antes de qualquer coisa:**

```powershell
adb shell run-as com.valentedev.pequenostracosdefe ls -la
```

Identificar quais destes existem: **`files`** · **`databases`** · **`shared_prefs`**. O backup deve
preservar **os diretórios realmente existentes** necessários ao **acervo** e ao **estado
persistido** — não presumir a lista.

**2) Redirecionar o *stdout* binário pelo `cmd.exe`**, ajustando aos diretórios encontrados:

```powershell
cmd.exe /c "adb exec-out run-as com.valentedev.pequenostracosdefe tar cf - files databases shared_prefs > C:\tmp\ptf_evidencias\acervo_antes\appdata.tar"
```

**3) Validar o arquivo — o backup só é declarado válido se puder ser lido/listado:**

```powershell
Get-Item C:\tmp\ptf_evidencias\acervo_antes\appdata.tar
Get-FileHash C:\tmp\ptf_evidencias\acervo_antes\appdata.tar -Algorithm SHA256
tar -tf C:\tmp\ptf_evidencias\acervo_antes\appdata.tar   # se o tar estiver disponível
```

**Se `run-as` estiver indisponível:** **registrar a limitação**; **não** tentar contornar com root;
**não** usar `pm clear`; **não** desinstalar; seguir **apenas** com inventário visual onde permitido.

### 4.1 · Os **17 casos obrigatórios** de §28.1 — *um `FAIL` aqui impede `F6-SG-A`*

| Caso | Task | O que executar no aparelho | O que **observar** (critério objetivo) |
|---|---|---|---|
| **1** | `TK-A-063` | Abrir, **em retrato**, uma obra criada **antes** desta mudança | A pintura **aparece** e está **alinhada ao *lineart***. Não abre em branco |
| **2** | `TK-A-064` | **Girar para paisagem** com a obra aberta | Proporção preservada; `contain` + **moldura (*letterbox*)**; tinta e *lineart* andam **juntos**. Nada esticado, nada recortado |
| **3** | `TK-A-065` | **Girar de volta** para retrato | Estado **idêntico ao caso 1**. Nenhuma deriva: a tinta não "andou" nem um fio |
| **4** | `TK-A-066` | **Split View estreito / Slide Over** (iPad) ou janela reduzida | **Nada some**; nada é recortado em silêncio. A obra continua inteira, menor |
| **5** | `TK-A-067` | **Tela cheia em paisagem** | **Nada é esticado**: sobra vira **moldura**, nunca distorção. Círculo continua círculo |
| **6** | `TK-A-068` | **Encerrar o app** (matar de vez), reabrir, abrir a obra | Obra **íntegra**. Comparado ao inventário 4.0: **nenhuma gravação** ocorreu no ciclo anterior |
| **7** | `TK-A-069` | Com a obra aberta: ir para **segundo plano** e **voltar** | Obra **íntegra**; **nenhum recarregamento destrutivo**; o traço em curso não vira risco solto |
| **8** | `TK-A-070` | Abrir e fechar o **Centro de Controle** sobre o canvas | Igual ao caso 7. A interrupção **parcial** não pode se comportar diferente da plena |
| **9** | `TK-A-071` | **Se reproduzível**: provocar/aguardar o término do processo de conteúdo da WebView | A recuperação **preserva a obra** e o evento é **registrado**. **PROIBIDO escrever "causa confirmada"** (`FD-12`). Se não reproduzir: **"não reproduzido"**, explicitamente |
| **10** | `TK-A-072` | Abrir a obra e fechar **sem desenhar nada** | **Bytes persistidos idênticos** antes e depois. Abrir **não** migra, **não** promove, **não** reescreve |
| **11** | `TK-A-073` | **Desenhar e salvar** | Salva; reabrir mostra **exatamente** o que foi desenhado. A obra anterior nunca fica num estado meio-gravado |
| **12** | `TK-A-074` | Falha durante a gravação (ex.: matar o app **durante** o salvamento) | A representação **anterior** continua válida. **Nada destruído**. Nunca "abri e estava vazia" |
| **13** | `TK-A-075` | *Rollback* do código com acervo já **misto** — ver **§5**, exige autorização | O caminho revertido **consome o formato anterior**; **nenhuma obra órfã** |
| **14** | `TK-A-076` | Abrir obra **legada** (`v1`/`v2`, sem geometria completa) | Reconstrução **determinística** a partir dos metadados. **Jamais** usar a janela atual como se fosse a original. Na dúvida, **preserva** |
| **15** | `TK-A-077` | Abrir obra no formato de pintura **vigente** | Lida e enquadrada certo; `paintSchemaVersion` ausente ⇒ tratada como **legada, sem erro** — sem tela de erro, sem canvas branco |
| **16** | `TK-A-078` | Abrir obra guardada como **ponteiro `v:3`** de *blob* | Resolve normalmente; o *blob* **nunca é excluído** por incompatibilidade **visual** |
| **17** | `TK-A-079` | Abrir obra com **`paintSchemaVersion` + `layoutVersion`** | Lida, reprojetada e regravada **sem perda**; eixos de versão **nunca confundidos** |

### 4.2 · Os **6 casos adicionais** `E1`..`E6` — não bloqueiam `F6-SG-A`, mas entram na matriz

> **EMENDA DE 2026-08-10 — regra de Human Gate para `E1`–`E6`.** Eles permanecem, documentalmente,
> **não bloqueantes automáticos** de `F6-SG-A`. Mas **todo `FAIL` em `E1`–`E6` é classificado por
> severidade ANTES da concessão**. Um `FAIL` que revele **`P0`/`P1`** ou **violação de invariante
> ZERO** **não pode ser ignorado só porque o caso é "extra"** — nesse caso ele sobe ao Human Gate
> como item de decisão, exatamente como um `FAIL` canônico. "Não bloqueia automaticamente" nunca
> significa "não conta".

| Caso | Task | O que executar | O que observar |
|---|---|---|---|
| `E1` | `TK-A-100` | Obra **nova**, criada e reaberta na **mesma** janela | Reabre idêntica ao que foi fechado |
| `E2` | `TK-A-101` | Obra **vetorial do Ateliê** atravessando mudança de janela | Traços mantêm posição relativa ao espaço lógico; nada escorrega |
| `E3` | `TK-A-102` | **Dez ciclos** de rotação seguidos | **Sem deriva acumulada** — o décimo retorno é igual ao primeiro |
| `E4` | `TK-A-103` | Pintura associada a *lineart* **divergente** | **Recusa de aplicar**, com aviso legível. **Não** aplica, **não** regrava, **não** remove, **não** deforma |
| `E5` | `TK-A-104` | Payload **corrompido/truncado** | Aviso legível; a obra **não** é apagada |
| `E6` | `TK-A-105` | Galeria com **acervo misto** após atualizar o app | Todas as obras aparecem; nenhuma some da listagem |

### 4.3 · Cenários §28 e as duas telas de recusa

| Item | Task | O que observar |
|---|---|---|
| §28 **#7** | `TK-A-097` | Abrir desenho salvo **antes** da mudança **e continuar desenhando** por cima — sem salto de escala nem desalinhamento ao retomar |
| §28 **#17** | `TK-A-098` (`CN-1`) | **Regressão completa em telefone** (não só tablet): mapa, tour, Livrinho, Ateliê e Colorir sem regressão visível |
| Painéis "não consegui abrir" | `TK-A-045`, §28.1 caso 15 | Os **dois** avisos precisam ser **lidos em tela**: texto legível para criança, sem termo técnico, e **sem** oferecer "apagar" como saída. Hoje também alcançáveis pela **recusa de identidade** de `TK-A-051` |
| Nitidez em tablet | `TA-5R` (aviso) | Com o *lineart* em `multiply` e a camada de tinta **ampliada** em tela grande: a **borda do balde** aparece **limpa**, sem serrilhado grosseiro nem halo. Este é o único item que **nenhum** arnês em Node consegue provar |

---

## 5. Caso 13 (`TK-A-075`) — o único que exige preparo especial

O caso pede *rollback* do código **com acervo já misto**. Como a camada nativa não mudou (§2.1), ele
**não** exige um *build* antigo instalável: basta apontar o Metro para o código anterior, mantendo o
**mesmo** aparelho e o **mesmo** acervo.

Isso, porém, cria um segundo *worktree* — **alteração de repositório que exige autorização explícita
do fundador** e por isso **não** foi executada. Sob autorização, seria:

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
git worktree add C:\tmp\ptf_f6_rollback_wt a190b3e   # detached, só leitura de código
Set-Location C:\tmp\ptf_f6_rollback_wt
npx expo start --dev-client --clear --lan
```

Depois de observar, **remover** o *worktree* temporário (`git worktree remove`). Enquanto essa
autorização não vier, o caso 13 fica **NÃO EXECUTADO** — e continua **bloqueando** `F6-SG-A`, porque
é um dos 17 obrigatórios.

> **EMENDA DE 2026-08-10.** O *worktree* de *rollback* **já existe** em
> `C:\tmp\ptf_f6_CASO13_ROLLBACK_wt`, em `a190b3e`, *detached* — não é preciso criá-lo. O que falta é
> **autorização de uso**. O caso 13 é executado **isoladamente, na rodada `R4`**, com o Metro do
> *rollback* numa porta distinta (`--port 8082`) e **`adb reverse tcp:8081 tcp:8082`** redirecionando
> o aparelho para ele, **sem** mexer no acervo. Ao terminar, devolver o aparelho ao Metro canônico e
> **não remover** o *worktree* sem ordem explícita.

---

## 6. Registro do resultado (`TK-A-080`) — preencher **durante**, não depois

Para cada linha das tabelas §4.1 e §4.2, registrar: **veredito** (`PASS` / `FAIL` / `NÃO EXECUTADO`),
**aparelho**, **janela/orientação**, **captura (print ou vídeo)** e **quais invariantes ZERO** foram
verificadas. As duas famílias ficam **visualmente separadas**: o veredito de `F6-SG-A` lê **primeiro
os 17**.

---

## 7. Se a validação física revelar defeito

**Classificar antes de corrigir.** A classificação decide **onde** o conserto pertence:

| Classificação | Significa | Destino |
|---|---|---|
| Defeito de **`F6-R3`** | Ciclo de vida, *resize* ou *viewport*: salto de escala, deslocamento de alinhamento, corrupção de *padding*/safe area, perda indevida de estado | Corrigir **aqui**, com regressão própria |
| Defeito **interno ao canvas** que pertence à reconstrução posterior | Não é ciclo de vida nem projeção; é o motor por dentro | **Registrar** conforme o contrato canônico — inclusive **`F9-C60-LFC-01`** quando aplicável. **Não** antecipar a reconstrução da `F9` |
| Dívida já registrada | Ex.: `atelierStorage.saveArt` (§11.16-c das `TASKS`, destino `F12A`) | **Não** reabrir aqui |

**Se a classificação não puder ser demonstrada com evidência, não escolha arbitrariamente:** mostre a
cadeia causal — o que foi observado, em que ordem, sob que janela — e **reporte** para decisão.

**A validação física não pode expandir escopo em silêncio.** Um achado fora de `F6-R3` vira registro,
não vira trabalho não autorizado.

---

## 8. Depois

Com os 17 obrigatórios `PASS` e a matriz preenchida, a decisão sobre **`F6-SG-A`** volta ao fundador.
Até essa decisão, o estado correto continua sendo **`F6-R3` EM ANDAMENTO** — e `F6-R2`, `F6-R1` e
`B2` permanecem **fechados**.

> **EMENDA DE 2026-08-10 — composição completa do Human Gate de `F6-SG-A`.** Além dos 17 `PASS` e da
> matriz preenchida, o gate lê:
>
> 1. **`D-1`** — as **duas** coberturas de tablet, complementares: **SM-X510** *e* **iPad**. Tablet
>    Android **não** substitui iPad; o §27 **não** foi flexibilizado.
> 2. **`D-2`** — **`CN-1` / §28 #17 exige telefone físico real.** O SM-X510 **não** satisfaz `CN-1`.
>    **Não escolher arbitrariamente um modelo inexistente:** `CN-1` só é marcado `PASS` depois de
>    execução em telefone real compatível. Até lá, **`NÃO EXECUTADO`**.
> 3. **`D-3`** — **`T090` / `F-PERF` / `P-139` é complemento obrigatório do gate** (§2.4), registrado
>    como **complemento posterior** à redação histórica do §27.
> 4. A **classificação por severidade** de qualquer `FAIL` em `E1`–`E6` (§4.2).
> 5. A **regra de parada** entre rodadas (§3.4).
