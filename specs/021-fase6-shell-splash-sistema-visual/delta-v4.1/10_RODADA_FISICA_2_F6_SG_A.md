# `RODADA FÍSICA 2` — pacote operacional completo (`F6-SG-A`)

> **Preparado em 2026-08-11. NÃO EXECUTADO.** Este documento é o roteiro. Executá-lo depende de
> **Human Gate explícito** do fundador.
>
> **Fonte de verdade:** `06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md` (daqui em diante **`06`**).
> Este arquivo **não** cria requisito novo, **não** reinterpreta critério e **não** substitui o `06`.
> Ele **ordena** e **operacionaliza** o que o `06` já congelou. Em qualquer divergência, **vale o
> `06`**.

---

## 0. Composição — revalidada contra o `HEAD`, não contra a memória

`06` §3.4, linha da tabela congelada:

> `| **R2** | Casos canônicos **independentes de rotação**: `1, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17` | SM-X510 |`

Reafirmado em `docs/DECISIONS.md` §`PF6SGA-ORDEM`. **Confirmado caractere por caractere. Zero
divergência** entre a lista histórica e o texto canônico no `HEAD` atual.

**São 12 casos**, todos pertencentes aos **17 obrigatórios** de §28.1 — logo, **um `FAIL` aqui
impede `F6-SG-A`**.

### Quatro erros de leitura que este documento previne

| # | Erro | Correção canônica |
|---|---|---|
| 1 | Ler "**17**" como o §28 **#17** (regressão completa em telefone) | O caso 17 da `R2` é **`TK-A-079`**, item de **§28.1**. O §28 #17 / `CN-1` é da **`R6`** e **exige telefone real** (`06` §3.4 e `D-2`) |
| 2 | Trazer o **Caso 13** para a `R2` | `06` §3.4: **`R4`, isolado**, com *worktree* de `a190b3e`. Continua **bloqueando** `F6-SG-A` enquanto `NÃO EXECUTADO` |
| 3 | Trazer os **cenários §28** e os **painéis de recusa** para a `R2` | `06` §3.4: **`R5`**. O agrupamento do `07` é da campanha desenhada para **iPad**, anterior à emenda das rodadas |
| 4 | Cobrar do caso 15 os **painéis "não consegui abrir"** | Na `R2` executa-se **só a leitura normal** do *payload* vigente. Os painéis são **`R5`** e só são alcançáveis por injeção |

### Dependências externas — **nenhuma**

| Dependência | Algum caso da `R2` precisa? | Onde vive |
|---|---|---|
| **Telefone físico real** | **NÃO** | `R6` (§28 #17 / `CN-1`) — o **SM-X510 não satisfaz `CN-1`**; tablet não vira telefone por conveniência |
| **iPad** | **NÃO** | `R6` (§27, literal). `D-1`: coberturas **complementares**; Samsung **não** substitui iPad |
| **Build `preview`** | **NÃO** | `R7` (`T090`/`F-PERF`/`P-139`) — `D-3` |
| **Rotação / *resize*** | **NÃO** — a `R2` é, por definição, o bloco **independente de rotação** | `R3` |

**Aparelho da `R2`: SM-X510, sozinho.** Nada nesta rodada justifica gerar *build*, tocar `eas.json`,
`app.json` ou dependências.

---

## 1. Precondição bloqueante — **a `R2` ainda NÃO está liberada**

`06` §7.2 fecha a `R1` como **`CONTEÚDO OBSERVADO SEM ANOMALIA · PASS NÃO FORMALIZÁVEL`**, com
**5 pendências de arquivo** (`R1-PEND-1..5`). E `06` §3.3 é literal: *"se as quatro confirmações não
forem obtidas, **nenhum** cenário abaixo pode ser marcado como `PASS`"*.

> 🔴 **Enquanto `R1-PEND-1..5` não forem fechadas, todo `PASS` desta rodada é inválido.**
> As cinco são **capturas de terminal**, não comportamento novo: elas podem ser fechadas **no mesmo
> pré-voo da `R2`**, porque o pré-voo da `R2` é *o mesmo* pré-voo. É o caminho barato — e é o
> recomendado.

**Consequência prática:** o **Bloco 0** abaixo fecha, de uma vez, o pré-voo da `R2` **e** as
pendências `R1-PEND-1..4`. `R1-PEND-5` fecha ao preservar o `raw.log` desta sessão **e** atestar a
forma de abertura.

---

## 2. Ordem de execução otimizada — e por que ela **não** muda a semântica

O `06` lista os casos em ordem **numérica**, que é ordem de catálogo, não de execução. Executá-los
nessa ordem custaria **≥4 encerramentos forçados** e exigiria **um par de inventários por caso**.

A ordem abaixo agrupa por **grau de perturbação do processo** e por **quem escreve no acervo**.
**Reduz para 2 os encerramentos forçados** e aproveita **um único par de inventários** para todo o
bloco de leitura pura.

| Bloco | Casos | Perturbação | Escreve no acervo? |
|---|---|---|---|
| **0** | *(pré-voo + `TAR-1`)* | *cold start* único | não |
| **A** | **1 · 15 · 14 · 16 · 10** | nenhuma — só abrir e fechar | **não** (é o que se prova) |
| **B** | **7 · 8** | *background* / painel do sistema | não |
| **C** | **6** | **1º `force-stop`** | não |
| **D** | **11 · 17** | nenhuma | **sim, de propósito** |
| **E** | **12** | **2º `force-stop`, durante gravação** | tentativa interrompida |
| **F** | **9** | oportunístico — o roteiro inteiro | não |

### Fidelidade — cada precedência exigida pelo canônico está preservada

- **8 depois de 7** — `TK-A-070` tem `TK-A-069` como pré-condição, e seu critério é *"igual ao caso
  7"*: sem o 7 executado, o 8 não tem contra o que comparar. ✅
- **6 depois de um ciclo que NÃO gravou** — o critério do caso 6 é *"nenhuma gravação ocorreu no
  ciclo anterior"*. Pô-lo depois do Bloco D (que grava **de propósito**) tornaria o caso
  **inexecutável**. Por isso ele fecha os blocos A+B. ✅
- **17 depois de 11** — o caso 17 pede obra com `paintSchemaVersion` **+** `layoutVersion`; é
  exatamente o que o caso 11 acaba de gravar. ✅
- **12 depois de 11** — o caso 12 exige **representação anterior válida** para provar que ela
  sobrevive. ✅
- **10 com inventário imediatamente antes** — está dentro do Bloco A, coberto por `TAR-1`. ✅
- **9 oportunístico** — §3.4 o aloca à `R2`; o `07` o trata como `G-OPP`. Convivem: **registra-se na
  `R2`** e mantém-se o `logcat` vivo em todas as rodadas. ✅

### O aproveitamento do inventário — reforço, nunca afrouxamento

Todo o Bloco A é **leitura pura**. Um único par `TAR-1` → `TAR-2` prova, de uma vez, que **nenhum**
dos cinco casos gravou. Isso é uma prova **mais forte** que a exigida (o caso 10 pedia só o próprio
par).

> ⚠️ **Regra de honestidade.** Se `TAR-2 ≠ TAR-1`, **está proibido** concluir "foi outro caso".
> Nesse cenário: **PARE**, e reexecute o **caso 10 isolado** com par próprio para atribuir a
> diferença. Prova agregada **só vale quando dá igual**.

---

## 3. As quatro superfícies e os comandos exatos

Três janelas do PowerShell **abertas antes de tocar o tablet**, mais o próprio tablet. Nomes fixos:
**`PS1` Metro · `PS2` ADB · `PS3` logcat · `TABLET`**.

**Regras duras de §3.6:** `PS3` roda em **primeiro plano** e é encerrada com **Ctrl+C** — **não usar
`Start-Process`, não usar `Tee-Object`**. A captura **começa antes** de abrir o app. **Não limpar o
`logcat` fora do momento autorizado** (Bloco 0, passo 6).

### `PS1` — Metro (abrir **primeiro**, deixar viva a rodada inteira)

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt

Write-Host "1) PASTA  : $((Get-Location).Path)"
Write-Host "2) BRANCH : $(git rev-parse --abbrev-ref HEAD)"
Write-Host "3) HEAD   : $(git rev-parse --short HEAD)"
$sujo = git status --porcelain
if ([string]::IsNullOrWhiteSpace($sujo)) { Write-Host "4) ARVORE : LIMPA" }
else { Write-Host "4) ARVORE : SUJA — PARE"; $sujo }

git diff --stat aa58849..HEAD

npm run start:dev
```

**Aceite:** pasta `C:\tmp\ptf_fase6_shell_splash_wt` · branch `feat/fase6-shell-splash` · árvore
`LIMPA` · `git diff --stat` **vazio ou só `docs/`+`specs/`** · o cabeçalho do Metro **exibindo esta
pasta** · porta **8081**. **Metro em 8082 é `PARE`** — significa que outra instância já ocupa a
8081, e o `adb reverse` mandaria o aparelho para a instância errada.

📌 **Arquive esta janela inteira** (print ou cópia do texto): ela fecha **`R1-PEND-1`** e
**`R1-PEND-2`**.

### `PS2` — ADB (túnel e comandos pontuais)

```powershell
adb devices -l

adb reverse --remove-all
adb reverse tcp:8081 tcp:8081
adb reverse --list
```

**Aceite:** um aparelho `device` (não `unauthorized`, não `offline`) · **exatamente um** mapeamento
relevante contendo `tcp:8081 tcp:8081`. **Prefixo `UsbFfs` é permitido — o gate não é literal.**

📌 **Arquive a saída do `--list`**: fecha **`R1-PEND-4`**.

⛔ **USB + `adb reverse` + `localhost:8081`.** **Sem QR. Sem Wi-Fi como rota principal. Sem Expo Go.**

### `PS3` — logcat (primeiro plano; Ctrl+C só no fim da rodada)

```powershell
New-Item -ItemType Directory -Force C:\tmp\ptf_evidencias\R2 | Out-Null
adb logcat -v threadtime |
  Out-File "C:\tmp\ptf_evidencias\R2\raw.log" -Encoding utf8
```

📌 **`raw.log` preservado íntegro** ao fim: fecha a primeira metade de **`R1-PEND-5`**.
**Não editar, não filtrar, não recortar o arquivo original.** Extrações vão para cópias.

### `TABLET` — abertura canônica (**a mesma forma em toda abertura**)

```powershell
adb shell am start -a android.intent.action.VIEW `
  -d "pequenostracosdefe://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
```

⛔ **Toda reabertura desta rodada usa este comando** — inclusive as dos casos **6** e **12**. Abrir
pelo ícone ou pela `MainActivity` **não prova** que o *bundle* servido é o atual. Atestar isso por
escrito fecha a segunda metade de **`R1-PEND-5`**.

### Captura de imagem — regra de *observer effect*

⛔ **Proibido Samsung SmartCapture. Proibido gravação de tela.** Use **câmera externa** (segundo
aparelho, tripé/apoio). Gravação de tela concorre por GPU/encoder e contamina justamente o que se
mede.

---

## 4. Bloco comum a **todos** os casos — `C-1` … `C-11`

Cada caso remete a estes; não se repete o que já está aqui.

| Ref | Conteúdo | Fonte |
|---|---|---|
| **`C-1`** | **Gate de sessão — as 4 confirmações.** (1) Metro serve **esta** pasta; (2) o aparelho pediu o *bundle* **agora**; (3) não é `preview`/`production`; (4) túnel USB de pé. **Sem as quatro, nenhum `PASS`.** | `06` §3.3 |
| **`C-2`** | Transporte: `adb reverse` conforme §3 acima | `06` §3.1 |
| **`C-3`** | Abertura: *deep link* URL-encoded, **sempre** | `06` §3.2 |
| **`C-4`** | Log: 3 janelas; ordem `force-stop` → `logcat -c` → `PS3` no ar → *deep link*; `raw.log` íntegro | `06` §3.6 |
| **`C-5`** | Inventário/backup por `adb` (`TK-A-062`) — ver §5 | `06` §4.0 |
| **`C-6`** | **Invariantes ZERO** — qualquer uma violada é **`FAIL`**, independentemente do resto | `06` §4 |
| **`C-7`** | **Evidência mínima por linha**, preenchida **durante**: veredito · aparelho · janela/orientação · captura · quais invariantes ZERO foram verificadas | `06` §6 (`TK-A-080`) |
| **`C-8`** | **Superfície de abertura não é gate.** Estabilizar → registrar a superfície real → confirmar `MainTabs` pelo `shell.log` → executar a navegação prevista | `06` §3.7 |
| **`C-9`** | **Classificação de defeito:** ciclo de vida/*resize*/*viewport* → **`F6-R3`**, corrige aqui · interno ao canvas → registrar, inclusive **`F9-C60-LFC-01`** · dívida já registrada → **`F12A`**. *"Se a classificação não puder ser demonstrada com evidência, não escolha arbitrariamente."* | `06` §7 |
| **`C-10`** | Os 12 casos são dos **17 obrigatórios**: **um `FAIL` impede `F6-SG-A`** | `06` §4.1 |
| **`C-11`** | **NUNCA desinstalar. `pm clear` PROIBIDO.** `adb install -r` quando houver instalação. O acervo real é o **único insumo** da campanha | `06` §2.4 |

---

## 5. Inventário do acervo — `TAR-1` … `TAR-5`

O TAR da `R1` (**16.803.840 bytes**, `SHA256 501400425F64C42A5E6786BC294006FAE452E8CDE4EC2134D1F542E78E99CE1F`)
**serve como linha de base histórica**, mas a `R2` tira **o seu próprio `TAR-1`** no pré-voo: entre
uma sessão e outra o app foi aberto, e comparar contra um instantâneo antigo produziria diferenças
que não pertencem a caso nenhum.

**Rota canônica** (`06` §4.0) — `cmd.exe` é **obrigatório** no passo do TAR: o `>` do PowerShell
corrompe *stdout* binário.

```powershell
adb shell run-as com.valentedev.pequenostracosdefe ls -la

New-Item -ItemType Directory -Force C:\tmp\ptf_evidencias\R2\acervo | Out-Null

cmd.exe /c "adb exec-out run-as com.valentedev.pequenostracosdefe tar cf - files databases shared_prefs > C:\tmp\ptf_evidencias\R2\acervo\TAR-1.tar"

Get-Item      C:\tmp\ptf_evidencias\R2\acervo\TAR-1.tar | Select-Object Name,Length
Get-FileHash  C:\tmp\ptf_evidencias\R2\acervo\TAR-1.tar -Algorithm SHA256
tar -tf       C:\tmp\ptf_evidencias\R2\acervo\TAR-1.tar | Select-Object -First 20
```

Repetir trocando `TAR-1` por `TAR-2` … `TAR-5` nos pontos indicados na §6.

**Aceite de cada TAR:** tamanho plausível · `SHA256` registrado · `tar -tf` **lista** conteúdo
(arquivo íntegro) · presença de `files/`, `databases/`, `shared_prefs/`.

**Comparação:**

```powershell
(Get-FileHash C:\tmp\ptf_evidencias\R2\acervo\TAR-1.tar -Algorithm SHA256).Hash -eq `
(Get-FileHash C:\tmp\ptf_evidencias\R2\acervo\TAR-2.tar -Algorithm SHA256).Hash
```

> ⚠️ **`SHA256` do TAR é indicador, não veredito.** O TAR carrega *mtime*; um `SHA256` diferente
> pode ser só carimbo de tempo. **`True` prova identidade; `False` NÃO prova gravação** — nesse caso
> extraia os dois e compare **conteúdo de arquivo a arquivo** antes de escrever `FAIL`.

> 🔴 **Se `run-as` estiver indisponível:** `06` §4.0 manda **registrar a limitação** e seguir com
> inventário **visual**. **Não usar root. `pm clear` proibido. Não desinstalar.** Nesse cenário os
> casos **6, 10, 11, 16** ficam com prova **PARCIAL** — e isso **precisa constar do veredito**,
> jamais ser mascarado como `PASS` pleno.

---

## 6. Os 12 casos — 19 campos cada

> Campos não fixados pelo canônico aparecem como **"não especificado no protocolo"**. Onde há fonte
> secundária, ela é citada **como secundária** (`07`/`08` foram desenhados para **iPad**, antes da
> emenda das rodadas). **Não inventar critério.**
>
> Campos idênticos em todos os casos, ditos uma vez: **5. Dispositivo = SM-X510** ·
> **16. telefone real = NÃO** · **17. iPad = NÃO** · **18. Preview = NÃO** ·
> **19. rodada posterior = NÃO, pertence à `R2`** · **13. `FAIL` bloqueia** = os 12 são dos 17
> obrigatórios (`C-10`); a **regra de parada** manda **parar antes da rodada seguinte**, e violação
> de **invariante ZERO** é `FAIL` imediato do caso (`C-6`) · **14. Owner** = decidido por `C-9`,
> com evidência.

---

### BLOCO 0 — pré-voo *(não é caso; é o que valida todos)*

1. `PS1`: bloco de estado + `git diff --stat aa58849..HEAD` → **arquivar** *(`R1-PEND-1`)*.
2. `PS1`: `npm run start:dev`; conferir pasta no cabeçalho e **porta 8081** → **arquivar**
   *(`R1-PEND-2`)*.
3. `PS2`: `adb devices -l`, `adb reverse --remove-all`, `tcp:8081 tcp:8081`, `--list` → **arquivar**
   *(`R1-PEND-4`)*.
4. `PS2`: `adb shell dumpsys package com.valentedev.pequenostracosdefe | Select-String targetSdk`
   → registrar *(esperado `36`; confirma que o `build` instalado é o mesmo da `R1`)*.
5. `PS2`: **`TAR-1`** (§5) — **antes de abrir qualquer obra**.
6. `PS2`: `adb shell am force-stop com.valentedev.pequenostracosdefe` **e** `adb logcat -c`
   *(este é o **único** momento autorizado para limpar o logcat)*.
7. `PS3`: iniciar a captura — **antes** de abrir o app.
8. `TABLET`: *deep link*. Aguardar `Start proc: PID <n>` no `PS3` e **anotar o PID**.
9. `PS1`: confirmar a **linha de requisição do *bundle*** → **arquivar** *(`R1-PEND-3`)*.
10. `PS3`: confirmar `MainTabs MONTADO … vivos 1/1`; **registrar a superfície real** de abertura
    (`C-8`).

> ✅ Ao fim do Bloco 0, as **4 confirmações** de `C-1` estão obtidas **e arquivadas**, e
> **`R1-PEND-1..4`** estão fechadas. `R1-PEND-5` fecha ao final, com o `raw.log` preservado.
> **Se qualquer uma falhar: PARE. Nenhum caso abaixo pode ser marcado `PASS`.**

---

### BLOCO A — leitura pura *(sem desenhar, sem matar o app)*

> **Regra do bloco:** nenhum traço, nenhum salvamento, nenhum encerramento. Navegar até a obra,
> observar, voltar. **Qualquer desenho acidental invalida o par `TAR-1`/`TAR-2` e, com ele, o caso
> 10.**

#### CASO 1 — `TK-A-063` · §28.1 #1 — "Obra antiga em retrato"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-063` · §28.1 caso **1** |
| 2 | Nome | Obra antiga em retrato |
| 3 | Objetivo | *"o caso zero de `Q8`: obra criada **antes** da mudança abre com a pintura presente"* |
| 4 | Pré-condição | `TK-A-062` (= `TAR-1`) · `C-1` |
| 6 | Orientação | **RETRATO** — único caso da `R2` com orientação fixada pelo canônico |
| 7 | Superfície inicial | não especificado no protocolo (`C-8`). *Secundária:* `07` diz "Mapa aberto, retrato, tela cheia" |
| 8 | Ações no tablet | Abrir, **em retrato**, uma obra criada **antes** desta mudança. Observar. **Não desenhar.** Voltar |
| 9 | Evidência | `C-7` + **captura** (deformação e alinhamento provam-se por imagem) |
| 10 | Comando | nenhum próprio |
| 11 | `PASS` | *"A pintura **aparece** e está **alinhada ao lineart**. Não abre em branco"* — gate `G-CMP-1`, prova `TA-12` |
| 12 | `FAIL` | canvas branco onde há obra recuperável · tinta desalinhada ⇒ invariantes ZERO **#1, #2, #4** |

#### CASO 15 — `TK-A-077` · §28.1 #15 — "Payload visual atual"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-077` · §28.1 caso **15** |
| 3 | Objetivo | *"provar que a ausência de `paintSchemaVersion` é tratada como legado **sem erro**"* |
| 4 | Pré-condição | `TK-A-002` |
| 6 | Orientação | não especificado no protocolo |
| 8 | Ações | Abrir obra no formato de pintura **vigente**. Observar. Voltar |
| 11 | `PASS` | *"Lida e enquadrada certo; `paintSchemaVersion` ausente ⇒ tratada como **legada, sem erro**"* — sem tela de erro, sem canvas branco. Gate `G-VER-3`, prova `TA-11` |
| 12 | `FAIL` | tela de erro · canvas branco · enquadramento errado |
| — | ⚠️ | **Os painéis "não consegui abrir" NÃO são deste caso na `R2`** — são `R5` |

#### CASO 14 — `TK-A-076` · §28.1 #14 — "Formato legado (`v1`/`v2`)"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-076` · §28.1 caso **14** |
| 3 | Objetivo | *"reconstrução determinística **sem** usar a janela atual como se fosse a original (`Q8` r.6)"* |
| 4 | Pré-condição | `TK-A-041` · **existir obra legada no acervo real** |
| 8 | Ações | Abrir obra **legada** (`v1`/`v2`, sem geometria completa). Observar. Voltar |
| 9 | Evidência | `C-7` + **como a obra foi identificada como legada** |
| 10 | Comando | identificação objetiva pelo conteúdo das chaves no `TAR-1`; *secundária:* `07` usa o critério observável "obra mais antiga, anterior à Fase 6" |
| 11 | `PASS` | *"Reconstrução **determinística** a partir dos metadados. **Jamais** usar a janela atual como se fosse a original. Na dúvida, **preserva**"* — gate `G-CMP-1` |
| 12 | `FAIL` | uso da *viewport* atual como original · desalinhamento · abertura em branco ⇒ invariante ZERO **#4** |
| — | 🔴 | **Se não houver obra anterior à Fase 6 no acervo, PARE e reporte.** Não fabricar obra "legada" — isso destruiria o valor do caso |

#### CASO 16 — `TK-A-078` · §28.1 #16 — "Envelope atual — ponteiro `v:3`"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-078` · §28.1 caso **16** |
| 3 | Objetivo | *"o envelope permanece intocado e o blob **nunca** é excluído por incompatibilidade **visual**"* |
| 4 | Pré-condição | `TK-A-005` · inventário de *blobs* antes/depois (coberto por `TAR-1`/`TAR-2`) |
| 8 | Ações | Abrir obra guardada como **ponteiro `v:3`** de *blob*. Observar. Voltar |
| 9 | Evidência | `C-7` + presença do *blob* em `TAR-1` **e** em `TAR-2` |
| 11 | `PASS` | resolve normalmente · *blob* **não excluído** · `POINTER_VERSION` intocado — gates `G-VER-2`, `G-CMP-1` |
| 12 | `FAIL` | *blob* apagado · ponteiro reescrito · falha de resolução ⇒ invariante ZERO **#3**. *Secundária:* `07` classifica *"blob apontado por ponteiro **ativo** apagado"* como **"o achado mais grave possível"** |

#### CASO 10 — `TK-A-072` · §28.1 #10 — "Obra sem modificação"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-072` · §28.1 caso **10** |
| 3 | Objetivo | *"provar leitura pura (`Q8` r.1): abrir **não** migra, **não** promove, **não** reescreve"* |
| 4 | Pré-condição | `TK-A-042` · **`TAR-1` imediatamente antes** |
| 8 | Ações | Abrir a obra e fechar **sem desenhar nada** |
| 9 | Evidência | `C-7` + **par de inventários byte a byte** |
| 10 | Comando | **`TAR-2` agora** (§5) e comparação com `TAR-1` |
| 11 | `PASS` | *"**Bytes persistidos idênticos** antes e depois"* — gate `G-CMP-2` |
| 12 | `FAIL` | qualquer diferença de bytes/contadores/ordem ⇒ invariante ZERO **#3** |
| 15 | Executável no SM-X510 | **sim — e é aqui que o tablet Android vale mais que o iPad**: a limitação `L-1` ("não existe inspetor de armazenamento") foi declarada para **Windows + iPad**; um APK de dev é depurável e `run-as` resolve. **Sem `run-as`, a prova cai para visual e o veredito precisa dizê-lo** |

> ▶️ **Tirar `TAR-2` AGORA** e comparar com `TAR-1`. `True` fecha o caso 10 **e** reforça 1/15/14/16.
> `False` ⇒ **PARE** e reexecute o caso 10 isolado (§2).

---

### BLOCO B — ciclo de vida sem encerrar

#### CASO 7 — `TK-A-069` · §28.1 #7 — "*Background* e *foreground*"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-069` · §28.1 caso **7** |
| 3 | Objetivo | *"provar `useSurfaceLifecycle` no caminho mais sensível"* |
| 4 | Pré-condição | `TK-A-011` · obra **aberta no canvas** |
| 7 | Superfície | canvas com obra aberta |
| 8 | Ações | Com a obra aberta: ir para **segundo plano** e **voltar**. **Duração: não especificada no protocolo.** *Secundária:* `07` usa "~60 s" — **adotar 60 s e registrar a duração usada** |
| 9 | Evidência | `C-7` + **vídeo contínuo** (continuidade através de *background* não se prova por print) |
| 10 | Comando | não especificado no protocolo. **Preferir o gesto real** (botão Home / recentes) — é o caminho do usuário |
| 11 | `PASS` | *"Obra **íntegra**; **nenhum recarregamento destrutivo**; o traço em curso não vira risco solto"* — gate `G-LFC-2` |
| 12 | `FAIL` | perda de píxel · recarregamento destrutivo · traço órfão |
| 14 | Owner | `C-9` — **o caso mais tipicamente `F6-R3`** ("ciclo de vida … perda indevida de estado") |

#### CASO 8 — `TK-A-070` · §28.1 #8 — "Centro de Controle"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-070` · §28.1 caso **8** |
| 3 | Objetivo | *"cobrir a interrupção **parcial**, distinta do segundo plano pleno"* |
| 4 | Pré-condição | **caso 7 executado antes** |
| 7 | Superfície | canvas com obra aberta |
| 8 | Ações | Abrir e fechar o **Centro de Controle** sobre o canvas |
| 11 | `PASS` | *"Igual ao caso 7. A interrupção **parcial** não pode se comportar diferente da plena"* — gate `G-LFC-2` |
| 12 | `FAIL` | qualquer divergência do caso 7 |
| 15 | Executável | **sim, condicionado** — ver o vão abaixo |

> 🔴 **VÃO CANÔNICO — decidir ANTES de executar.** *"Centro de Controle"* é nomenclatura **iOS**.
> **Nenhum dos cinco documentos do delta traduz este caso para Android.** O equivalente natural é o
> **painel de notificações / *quick settings*** (arrastar da borda superior sobre o canvas e
> fechar). **Isto é interpretação, não texto canônico.** Registrar a escolha explicitamente no
> veredito; se o fundador preferir outra leitura, o caso vira `NÃO EXECUTADO` até a decisão —
> **nunca `PASS` por analogia silenciosa**.

---

### BLOCO C — primeiro encerramento forçado

#### CASO 6 — `TK-A-068` · §28.1 #6 — "Reabertura após fechar o app"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-068` · §28.1 caso **6** |
| 3 | Objetivo | *"provar que o ciclo anterior **não gravou nada**"* |
| 4 | Pré-condição | `TK-A-042` · **os blocos A e B não gravaram de propósito** — é o que torna o caso legível |
| 8 | Ações | **Encerrar o app (matar de vez)** → **`TAR-3`** → reabrir **pelo *deep link*** → abrir a obra |
| 9 | Evidência | `C-7` + par de inventários |
| 10 | Comando | `adb shell am force-stop com.valentedev.pequenostracosdefe`, depois **`TAR-3`**, depois o *deep link* de `C-3`. **`pm clear` PROIBIDO. Não desinstalar** |
| 11 | `PASS` | *"Obra **íntegra**. Comparado ao inventário 4.0: **nenhuma gravação** ocorreu no ciclo anterior"* — gate `G-CMP-2` |
| 12 | `FAIL` | obra alterada/ausente · evidência de gravação no ciclo anterior ⇒ invariante ZERO **#3** |
| 14 | Owner | `C-9` — *se* o achado for gravação indevida do Ateliê via `atelierStorage.saveArt`, o protocolo já a classifica como dívida de destino **`F12A`**, que **não se reabre aqui** |

> ⚠️ **`TAR-3` é tirado DEPOIS do `force-stop` e ANTES de reabrir.** É o instantâneo do que o ciclo
> encerrado deixou gravado. Tirá-lo depois de reabrir mistura o ciclo novo e **destrói o caso**.
>
> ⚠️ **Não limpar o `logcat` aqui.** `PS3` segue rodando; a continuidade do arquivo é evidência.

---

### BLOCO D — escrita deliberada

#### CASO 11 — `TK-A-073` · §28.1 #11 — "Obra modificada e salva no formato novo"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-073` · §28.1 caso **11** |
| 3 | Objetivo | *"provar a cadeia *write-forward* completa (`Q8` r.7–8)"* |
| 4 | Pré-condição | `TK-A-049` |
| 8 | Ações | **Desenhar e salvar.** Depois **reabrir** e conferir. **Anotar qual obra foi usada** — ela é o insumo dos casos 17 e 12 |
| 9 | Evidência | `C-7` + **vídeo do salvamento** + `TAR-4` ao fim do bloco |
| 11 | `PASS` | *"Salva; reabrir mostra **exatamente** o que foi desenhado. A obra anterior nunca fica num estado meio-gravado"*; no PLAN: *"nova representação criada, validada, relida e **só então** promovida"* — gates `G-CMP-4`, `TA-13` |
| 12 | `FAIL` | promoção antes de validar/reler · perda ao reabrir ⇒ invariante ZERO **#3** |

#### CASO 17 — `TK-A-079` · §28.1 #17 — "Novo schema lógico"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-079` · §28.1 caso **17** — ⚠️ **NÃO é o §28 #17 do telefone** |
| 3 | Objetivo | *"provar que os quatro eixos nunca se confundem no ciclo completo"* |
| 4 | Pré-condição | `TK-A-003` · **a obra salva no caso 11** |
| 8 | Ações | Abrir obra com **`paintSchemaVersion` + `layoutVersion`**. Observar. Fechar |
| 11 | `PASS` | *"Lida, reprojetada e regravada **sem perda**; eixos de versão **nunca confundidos**"* · *"a guarda de `:224` aceita o payload novo e continua rejeitando ponteiro"* — gate `G-VER-3`, prova `TA-11` |
| 12 | `FAIL` | perda na regravação · confusão de eixos |
| 16 | Telefone real | **NÃO.** `CN-1`/`D-2` recai sobre **§28 #17** (*regressão completa em telefone*), que é da **`R6`**. Este caso é `TK-A-079`, de §28.1 |

> ▶️ **`TAR-4` agora.** Diferença esperada — e **permitida somente** nas obras *"que a própria sessão
> salvou de propósito"*. **Qualquer obra NÃO tocada que tenha mudado é `FAIL`** (invariante ZERO #3).

---

### BLOCO E — falha durante a gravação

#### CASO 12 — `TK-A-074` · §28.1 #12 — "Falha durante a gravação nova"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-074` · §28.1 caso **12** |
| 3 | Objetivo | *"provar que a falha **em qualquer etapa** preserva o anterior"* |
| 4 | Pré-condição | `TK-A-050` · **representação anterior válida** (garantida pelo caso 11) |
| 8 | Ações | Provocar falha **durante** a gravação — no `06`, a variante prevista é **matar o app durante o salvamento**. Depois **`TAR-5`**, reabrir pelo *deep link* e conferir a obra |
| 9 | Evidência | `C-7` + **vídeo curto obrigatório** — *"o `kill` é continuidade e precisa ser visto"* |
| 10 | Comando | `adb shell am force-stop com.valentedev.pequenostracosdefe` disparado **no instante do salvamento** *(o comando exato não é especificado no protocolo)* |
| 11 | `PASS` | *"A representação **anterior** continua válida. **Nada destruído**. Nunca 'abri e estava vazia'"* — gates `TA-13`, `G-CMP-4` |
| 12 | `FAIL` | obra vazia/truncada/irrecuperável · ponteiro trocado · *blob* anterior apagado ⇒ invariante ZERO **#3** |
| 15 | Executável | **sim, com cobertura declaradamente PARCIAL** — ver o vão abaixo |

> 🔴 **VÃO DECLARADO — não mascarar.** PLAN e TASKS pedem falha injetada nas **quatro** etapas
> (*criar · persistir · validar · reler*); o `06` prevê fisicamente **só** *matar o app durante o
> salvamento*. A rota de injeção pertence ao **harness do contexto C**, que **§3.4 não menciona** —
> logo, **não especificado no protocolo** para a `R2`. **Executar a parcela física e registrar o
> resto como vão**, explicitamente, no veredito.

---

### BLOCO F — oportunístico, ativo o roteiro inteiro

#### CASO 9 — `TK-A-071` · §28.1 #9 — "Término do processo de conteúdo da WebView"

| # | Campo | Conteúdo |
|---|---|---|
| 1 | ID | `TK-A-071` · §28.1 caso **9** |
| 3 | Objetivo | *"observar a defesa instrumentada **sem** declarar causa provada (`FD-12`)"* |
| 4 | Pré-condição | `TK-A-014` · instrumentação de término ativa |
| 8 | Ações | **Se reproduzível**: provocar/aguardar o término do processo de conteúdo da WebView. **Como provocar: não especificado no protocolo** |
| 9 | Evidência | a **linha de instrumentação inteira**, copiada do `raw.log` (*secundária:* `07` exige "copiar a linha inteira" + captura da obra intacta; no Android o análogo é `onRenderProcessGone`), **ou** declaração explícita de **"não reproduzido"** |
| 11 | `PASS` | *"A recuperação **preserva a obra** e o evento é **registrado**"* — gate `G-LFC-3` |
| 12 | `FAIL` | o evento ocorre **e** a obra é perdida/zerada/recarregada em branco |
| 13 | Bloqueia? | `FAIL` sim. **"Não reproduzido" NÃO bloqueia** — o aceite é *"evento capturado **ou** 'não reproduzido'"* |
| 14 | Owner | `C-9` — é o caso em que o protocolo nomeia explicitamente o destino alternativo **`F9-C60-LFC-01`** para defeito **interno ao canvas** |
| — | ⛔ | **PROIBIDO escrever "causa confirmada" (`FD-12`)**, aconteça o que acontecer |

---

## 7. Condições de **PARADA IMEDIATA**

Pare, preserve tudo e reporte — **sem corrigir nada** — se qualquer uma ocorrer:

1. Qualquer das **4 confirmações** de `C-1` não obtida.
2. `git diff --stat aa58849..HEAD` mostrando **qualquer** caminho fora de `docs/`+`specs/`.
3. Metro **fora da 8081**, ou `adb reverse --list` com número de mapeamentos ≠ 1 relevante.
4. Árvore de trabalho **SUJA** no pré-voo.
5. Qualquer **invariante ZERO** violada (`FAIL` imediato do caso).
6. `TAR-2 ≠ TAR-1` no Bloco A *(isola o caso 10 antes de qualquer outra conclusão)*.
7. Obra **não tocada** alterada em qualquer TAR.
8. **Ausência de obra legada** no acervo (caso 14 inexecutável).
9. `run-as` indisponível → **não pare**, mas **registre a limitação** e rebaixe a prova de 6/10/11/16
   para **PARCIAL**.
10. `ReferenceError` ou qualquer *crash* de montagem → **novo `R1-BLOCK-*`**: pare a campanha inteira.

**Não corrigir automaticamente.** Retomar só após decisão explícita.

---

## 8. Fronteiras desta rodada — o que a `R2` **não** faz

| Não faz | Onde vive |
|---|---|
| Rotação / *resize* | `R3` |
| Caso 13 (*rollback*) | `R4` — **isolado**, com *worktree* de `a190b3e`; segue **bloqueando** `F6-SG-A` |
| `E1`–`E6`, cenários §28, painéis de recusa, `TA-5R` | `R5` |
| iPad, telefone real / `CN-1` | `R6` |
| `preview`, `T090`/`F-PERF`/`P-139`, áudio | `R7` |
| Corrigir **spotlight**, coordenadas, recortes verticais | **`SG-B`** — **congelado**. `R2` **não** abre `SG-B` |
| Corrigir composição para largura de tablet | **`SG-C`** / `F7` — congelado |
| Investigar lentidão / intervalo branco | **`PERF-OBS-01`**, leitura final em `R7` |
| Instalar SDK de observabilidade | **proibido** — `D-OBS-01` autoriza **só** o ADR |
| Trocar "Área dos Pais" na interface | **`COPY-RESPONSAVEIS-01`** — decisão registrada, implementação é feature própria |

> *"A validação física não pode expandir escopo em silêncio."* (`06` §7)

---

## 9. Estado ao fim da `R2`

Mesmo com os **12 casos `PASS`**, o estado correto continua sendo:

- **`F6-R3` EM ANDAMENTO**;
- **`F6-SG-A` NÃO CONCEDIDO** — faltam `R3`, `R4` (Caso 13), `R5`, `R6` (iPad **e** telefone real) e
  `R7` (`preview` + `T090`/`P-139` + áudio);
- **`F6-R2`, `F6-R1` e `B2` permanecem fechados.**

**Próximo passo após a `R2`: Human Gate.** Não encadear `R3` automaticamente.
