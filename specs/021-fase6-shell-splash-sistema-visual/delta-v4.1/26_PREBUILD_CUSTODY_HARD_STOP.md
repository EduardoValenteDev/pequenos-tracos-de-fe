# `PRE-BUILD CUSTODY GATE` · `F6` — parada dura antes do primeiro *build* nativo

> **Missão:** fechar a cadeia probatória no binário **atualmente instalado** no `SM-X510`
> **antes** do primeiro *build* nativo novo.
> **Decisão do fundador vigente:** o binário **não** é substituído ainda
> (`D-FUND-PREBUILD-01`).
> **Mudança de código esperada:** **nenhuma**. Documental puro (`specs/**`) — não toca
> `src/`, não dispara bundleabilidade.

---

## 0. Veredito

# ⛔ `PREBUILD_CUSTODY_HARD_STOP`

A missão **não** pode produzir `PREBUILD_CUSTODY_READY` porque os `BLOCOS B`..`E` da `R2` são
**inexecutáveis hoje** por **quatro condições de `STOP` da lista fechada** do artefato `14`
§11, todas **medidas**, nenhuma inferida — e porque o fechamento de `R1-PEND-1..4` esbarra
numa decisão do fundador **já registrada** que o proíbe pela via que a missão sugere.

**Nada foi tocado no aparelho.** Todas as chamadas `adb` desta missão são de leitura. O
binário instalado, a assinatura, o `applicationId`, o acervo de desenhos e o `RKStorage`
estão **preservados e conferidos** (§2).

---

## 1. Estado canônico de entrada — medido no momento desta redação

```
PASTA:  C:\tmp\ptf_fase6_shell_splash_wt
RAMO:   feat/fase6-shell-splash
HEAD:   002872a0afe626799ecbf2195832a10f9b3de025
ARVORE: LIMPA
```

Confere com o `§1 ESTADO CANÔNICO` da missão. A árvore está limpa e **assim permanece** ao
fim desta missão, exceto por este artefato.

---

## 2. Baseline de custódia do binário — **PRESERVADO**

Todas as linhas abaixo são leitura direta do aparelho `RX2XC003LTJ` (`SM-X510`).

| Propriedade | Valor medido | Significado |
|---|---|---|
| *package* | `com.valentedev.pequenostracosdefe` | inalterado |
| Caminho do APK | `/data/app/~~GXL80biRI-EeByGJE9LTdw==/com.valentedev.pequenostracosdefe-Rlyx-DXo4WOYbVwNmNDG9g==/base.apk` | **mesmo inode de instalação** |
| `versionCode` / `versionName` | `1` / `1.0.0` | inalterados |
| `minSdk` / `targetSdk` | `24` / `36` | inalterados |
| `apkSigningVersion` | `2` · assinatura `3351bd8d` | **assinatura inalterada** |
| `DEBUGGABLE` | sim | é *Development Build* — ver §4 |
| `firstInstallTime` | `2026-08-10 12:03:42` | — |
| `lastUpdateTime` | `2026-08-10 12:03:42` | **idêntico ao primeiro**: o binário **nunca** foi atualizado |
| `databases/RKStorage` | `49152` bytes · *mtime* `2026-08-12 15:54` | **igual em duas leituras separadas por horas** |
| Obra de referência do acervo | `files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.a.png` · `200565` bytes · *mtime* `2026-08-11 16:45` | íntegra |

**`firstInstallTime == lastUpdateTime`** é a prova forte: o APK presente hoje é
**bit a bit** o que foi instalado em `2026-08-10 12:03:42`. `D-FUND-PREBUILD-01` está
cumprido.

**Comandos usados nesta missão, todos de leitura:** `devices -l` · `pm list packages` ·
`pm path` · `dumpsys package` · `run-as ls -la` · `reverse --list` · `pidof` · `date` ·
`uptime` · `stat`. **Nenhum** `install`, `uninstall`, `pm clear`, `force-stop`, `logcat -c`,
`am start`, `monkey` ou escrita de qualquer natureza.

---

## 3. As causas objetivas de `STOP`

A lista de `STOP` do artefato `14` §11 é **fechada**. Quatro de seus itens estão acesos.

### 3.1 `STOP` #1 — `HEAD` divergente da guarda de entrada

O artefato `14` §1 exige `HEAD` igual a
`8b1daf13a7a9e654ca3dc7fe72a60bf75665dc9b` **ou descendente documental aprovado**.

`002872a` **é** descendente de `8b1daf1` no grafo do Git — mas **não** é descendente
*documental*: o intervalo carrega **29 arquivos funcionais**. O adjetivo é a cláusula
inteira; ignorá-lo seria ler a guarda ao contrário.

### 3.2 `STOP` #2 — a prova de continuidade **quebrou**

O artefato `14` §1.1 executa este comando e registra o resultado como **lista vazia**:

```
git diff --name-only aa58849..HEAD | grep -v -E "^(docs/|specs/)"
```

Hoje o **mesmo** comando devolve **29 arquivos**:

```
 29 files changed, 4146 insertions(+), 314 deletions(-)     # total funcional
 24 files changed, 1656 insertions(+),  301 deletions(-)    # somente src/
```

Os 29: `app.json` · `plugins/withAndroidTabletOrientation.js` · `scripts/smoke.js` ·
`scripts/testing/surfaceArchetypeHarness.js` · `scripts/testing/windowBandHarness.js` · e
**24 arquivos de `src/`**, entre eles **`AtelierCanvasScreen.js`**, **`ColoringScreen.js`**,
**`AtelierGalleryScreen.js`**, `AppNavigator.js`, `TabletSidebar.js`, `useWindowBand.js` e
`tokens.js`.

O artefato `14` §1.1 é explícito sobre **por que** essa lista precisa estar vazia:

> ✅ Desde `aa58849`, nenhum arquivo funcional mudou… Isto dispensa novo *build* nativo e é
> a razão pela qual **não se desinstala, não se reinstala e não se troca binário**.

A frase é uma **bicondicional operacional**: a dispensa do *build* **vive** da lista vazia.
Com 29 arquivos, a premissa que autoriza medir `F6` no binário de `2026-08-10` **deixou de
valer**. E as três telas em destaque são exatamente as que os `CASOS 11`, `17`, `12` e `6`
exercitam.

### 3.3 `STOP` #4 — porta `8081` ocupada

```
LocalPort 8081  ->  OwningProcess 22312
PID 22312 : "node" ...\expo\bin\cli start --dev-client --port 8081
            iniciado em 12/08/2026 13:26:03
            cwd: C:\tmp\ptf_fase6_shell_splash_wt      <-- a árvore F6-R1
adb reverse --list : UsbFfs tcp:8081 tcp:8081
```

Não é só ocupação de porta: **é um Metro servindo a árvore `F6-R1`**, com o túnel para o
aparelho **ativo**. Ver §4.

### 3.4 `STOP` #13 — correspondência JS ↔ binário exigiria *build* novo

`app.json` e `plugins/withAndroidTabletOrientation.js` mudaram **depois** que o binário
instalado foi gerado. A rota (C) de orientação **não está** no APK do aparelho. Restabelecer
a correspondência exige **um *build* nativo novo** — proibido por `D-FUND-PREBUILD-01` e
pelo `§7` da missão.

> Este item já era conhecido: o artefato `23` §1 registra que *"o build medido é ANTERIOR a
> `e2702d2`, ou seja, nenhum build instalado contém hoje a rota (C)"*. O que é novo é que
> agora ele **colide** com a continuidade de `src/`.

---

## 4. Risco de custódia **ao vivo** — registrado, não atribuído

Três fatos simultâneos, medidos em `2026-08-13 00:28` (relógio do aparelho):

1. Metro da árvore **`F6-R1`** no ar desde `2026-08-12 13:26:03` (PID `22312`).
2. `adb reverse tcp:8081 tcp:8081` **ativo**.
3. O app está **rodando**: processo `22707`, iniciado em **`2026-08-13 00:24:58`**.

O binário é `DEBUGGABLE` e carrega o *bundle* do Metro. A composição dos três significa que
**a instância em execução pode estar rodando o JS de `F6-R1`**, que nunca passou por
validação física, sobre o acervo real.

**Mitigação medida:** `databases/RKStorage` continua com *mtime* `2026-08-12 15:54` em duas
leituras separadas por horas — **nenhuma escrita ocorreu** desde esse instante, e o
*mtime* é **anterior** ao lançamento das `00:24:58`. O acervo está intacto **agora**.

**Atribuição: nenhuma.** Nenhum comando desta missão é capaz de iniciar um aplicativo
(§2 lista todos). Não afirmo quem ou o quê lançou o processo — apenas que o arranjo
está ativo e que **enquanto ele estiver ativo, o acervo está exposto a escrita por código
não validado**.

---

## 5. Achado novo — o aparato `M+`/`M−` é **cego** a `F6-R1`

O artefato `14` §6.1–6.3 define os marcadores de proveniência do *bundle* e o par casado
`M+2 × M−1` como o discriminador mais forte. Eles foram desenhados para separar o *runtime*
**canônico** (`8b1daf1`) do **histórico** (`7de7085`).

Os arquivos que **emitem** esses marcadores:

| Marcador | Arquivo-fonte | Mudou em `aa58849..HEAD`? |
|---|---|---|
| `M+1`, `M+3`, `M+4`, `M+5` (`[shell] …`) | `src/services/shellLifecycleTrace.js` | **não** |
| `M+2` (`[COLORING_STATE] load OK espacoLogico=`) | `src/components/ColoringCanvas.js` | **não** |
| `M−1` (`[COLORING_STATE] load OK W=`) | idem | **não** |

**Consequência:** um aparelho servido pelo *bundle* de `F6-R1` emitiria **exatamente** os
mesmos `M+` e **nenhum** `M−`. Os portões `G-12` (*bundle*) e `G-13` (*logcat*) diriam
**"canônico"** enquanto o JS em execução seria a árvore `F6-R1` **não validada**.

O instrumento não está errado — está **fora de alcance**: ele nunca foi desenhado para esta
divergência, porque quando foi escrito a lista de §1.1 estava vazia e essa divergência era
impossível por construção. **Registrar isto aqui é o ponto:** ninguém deve, na próxima
sessão, usar `G-12`/`G-13` verdes como prova de que o *bundle* correto está no ar. **Hoje
eles não provam isso.** Não crio portão novo para cobrir a lacuna — `§9` da missão proíbe
transformar o fechamento em nova auditoria, e o instrumento certo é restabelecer a
continuidade, não instrumentar a quebra.

---

## 6. `R1-PEND-5` — a parcela mínima canônica, derivada como exigido

`D-FUND-R1-PEND5-01` exige que a parcela mínima seja **derivada documentalmente antes** de
qualquer execução. A derivação segue, e vale mesmo bloqueada.

### 6.1 O que `R1-PEND-5` exige

Artefato `06` §3.2 · §3.6, linha `556-560`: o **`raw.log` íntegro preservado**, mais
atestação de que **todas** as aberturas usaram o *deep link* URL-encoded e de que a ordem
foi `force-stop` → `logcat -c` → `PS3` no ar → *deep link*.

### 6.2 A parcela mínima equivalente

| Precisa repetir | Não precisa repetir |
|---|---|
| §3.1 — `adb reverse` da rodada | §3.4 — a bateria comportamental (`MainTabs`, `R3X-3`, `targetSdk`) |
| §3.2 — captura de log contínua (`PS3`) | — já **observada sem anomalia**; o veredito de `R1` é `CONTEÚDO OBSERVADO SEM ANOMALIA` |
| §3.3 — as quatro confirmações | |
| §3.6 — **uma** abertura a frio instrumentada por *deep link* | |

**A parcela mínima é o pré-voo mais UMA abertura a frio instrumentada.** O que falta em
`R1-PEND-5` é a **preservação do arquivo**, não o conteúdo comportamental — logo o mínimo
que produz evidência equivalente válida é o mínimo que gera um `raw.log` íntegro de uma
abertura conforme protocolo. Repetir a `R1` inteira seria excesso, e o protocolo não o pede.

### 6.3 Por que não é executável hoje

Duas razões independentes, **cada uma suficiente**:

1. **O pré-voo não passa.** §3.1 e §3.3 exigem a rodada rodando; as guardas de §3 falham
   pelas causas de §3.1–3.4 deste artefato. Um pré-voo que não passa não produz evidência
   válida — produz um segundo artefato inválido.
2. **`PF6SGA-R2-GATE-SANEAMENTO`** (`docs/DECISIONS.md`) já decidiu, com todas as letras:
   > **VEREDITO: NÃO PERMITE.** Não existe **uma linha sequer** que autorize **reexecutar**
   > um controle de pré-voo em outro momento e arquivá-lo como evidência da rodada anterior.

**Nada foi fabricado, sintetizado ou reconstruído.** Nenhum `raw.log` novo existe. A
distinção que `D-FUND-R1-PEND5-01` manda preservar fica registrada em voz alta: **o
`raw.log` histórico de `R1` está perdido e continua perdido**; se um dia houver repetição
controlada, o arquivo produzido será rotulado *"repetição controlada posterior"* e **nunca**
apresentado como o histórico.

---

## 7. `R1-PEND-1..4` — conflito documental ⇒ `HUMAN GATE`

A missão (`§3`) manda fechá-las *"no próximo pré-voo válido, usando as exigências canônicas
exatas"*. As exigências (artefato `06`, `556-560`):

| | Exigência canônica | Fonte |
|---|---|---|
| `R1-PEND-1` | os quatro `Write-Host` **do momento da rodada** (pasta · ramo · `HEAD` · `ARVORE: LIMPA`) + `git diff --stat aa58849..HEAD` | §1 |
| `R1-PEND-2` | confirmação #1 — cabeçalho do Metro exibindo `C:\tmp\ptf_fase6_shell_splash_wt` | §3.3 |
| `R1-PEND-3` | confirmação #2 — linha do Metro registrando o pedido de *bundle* **agora** | §3.3 |
| `R1-PEND-4` | confirmação #4 — `adb reverse --list` **da rodada**, exatamente um `tcp:8081 tcp:8081` | §3.1 · §3.3 |

Todas as quatro são **do momento da rodada**. Reproduzi-las hoje só teria valor se hoje
houvesse pré-voo válido — e não há (§3). E mesmo se houvesse, `PF6SGA-R2-GATE-SANEAMENTO`
tabela **`R1-PEND-1` NÃO · `-2` OMISSO · `-3` NÃO · `-4` NÃO**: a reexecução posterior **não**
fecha a pendência da rodada anterior. Para `-2`, `OMISSO` é lido de forma **conservadora** —
omissão não é autorização.

A missão prevê exatamente este desfecho: *"Se a documentação tornar impossível repetir
somente uma parcela: **HUMAN GATE**. Não invente exceção."* É o caso. **Nenhum waiver
administrativo foi concedido.** `R1-PEND-1..5` permanecem **ABERTAS**.

---

## 8. `F6-SG-A` — **NÃO CONCEDIDO**, com as condições nomeadas

O `§6` da missão manda auditar os critérios reais e, se não satisfeitos, dizer **exatamente
qual** condição continua aberta. São cinco, cada uma independente:

| # | Condição aberta | Por quê |
|---|---|---|
| 1 | **Os 17 obrigatórios `PASS` não foram alcançados** (artefato `06`, `630`) | `BLOCO A` fechou (`CASOS 1 · 15 · 14 · 16 · 10`, artefato `14` §25). Faltam os **seis** casos de `B`..`E` — `7`, `8`, `6`, `11`, `17`, `12` — e o `CASO 9` do `BLOCO F` |
| 2 | **`D-1` exige iPad** | o iPad **não existe** (artefato `24` §7, risco 3) |
| 3 | **`D-2` — `CN-1` / §28 #17 exige telefone Android real** | o `SM-X510` é **tablet** e **não** satisfaz o critério; o telefone real não existe |
| 4 | **`D-3` — `T090` / `F-PERF` / `P-139` exigem o par *preview* × *production*** | nenhum dos dois *builds* existe |
| 5 | **`R1-PEND-1..5` abertas** | §7 acima · artefato `14` · `PF6SGA-R2-GATE-SANEAMENTO` |

**Nenhum portão novo foi inventado.** O mecanismo canônico é o de artefato `06`
`634-645`, e é ele que recusa.

---

## 9. A rota de restauração é **decisão do fundador** — `ALERTA_LOOP_INFRA`

Medição objetiva dos candidatos, com a guarda de §1.1 aplicada:

```
e393768 -> 0 arquivo(s) funcional(is)   <-- "docs(r2s2): encerra bloco A e sessao 2 apos gate final"
92781ea -> 0 arquivo(s) funcional(is)
8b1daf1 -> 0 arquivo(s) funcional(is)
002872a -> 29 arquivo(s) funcional(is)  <-- HEAD atual
```

**`e393768` é o `HEAD` mais recente que satisfaz a guarda do artefato `14` §1.** Servir o
Metro a partir daquele estado restauraria a correspondência JS ↔ binário **sem tocar o
APK** — o que resolveria §3.1, §3.2 e §3.4 de uma vez.

**Não executo.** Toda via para chegar lá é uma de três coisas, e nenhuma é minha:

1. mover o `HEAD` do ramo — alteração não autorizada do estado canônico de `§1`;
2. criar uma **segunda árvore de trabalho** só para servir o Metro — **instrumento novo de
   infraestrutura**;
3. subir um **segundo Metro em outra porta** — idem, e ainda colide com `G-06`.

As opções 2 e 3 são exatamente o reflexo que o `§9` da missão manda interceptar:

> 🚨 **`ALERTA_LOOP_INFRA`** — a tentação aqui é criar mais uma exceção de infraestrutura
> para fazer o pré-voo passar. **Não crio.** A fronteira a redesenhar é a **relação entre a
> árvore de `F6-R1` e a campanha `R2`**, que hoje competem pela mesma árvore, pela mesma
> porta e pelo mesmo aparelho. Isso é decisão de sequenciamento do fundador, não ajuste
> técnico.

---

## 10. O que **não** foi feito

- ❌ Nenhum `BLOCO B`, `C`, `D` ou `E`; nenhum `CASO 7`, `8`, `6`, `11`, `17`, `12`.
- ❌ Nenhuma instalação, desinstalação, `pm clear`, troca de assinatura ou de *package*.
- ❌ Nenhum *build* — nem EAS, nem Gradle, nem *prebuild* de produção.
- ❌ Nenhum `waiver` para `R1-PEND-5`; nenhum `raw.log` fabricado, sintetizado ou reconstruído.
- ❌ Nenhum `AC-5`; nenhum instrumento novo; nenhum portão novo.
- ❌ Nenhum `push`, nenhum `merge`, nenhum `reset` destrutivo.
- ❌ **`LAUNCH_READINESS_LOCK_MUNDO_DO_BENI.md` não foi criado** (`§8` da missão).

---

## 11. Estado dos arquivos

| Estado | Arquivos |
|---|---|
| **Salvo no disco · untracked** | `specs/.../26_PREBUILD_CUSTODY_HARD_STOP.md` (este) — até o `git add` seletivo |
| **Modificado** | nenhum |
| **Enviado ao remoto** | **NADA.** Zero *push*, zero *merge* |

---

## 12. Referências

Artefato `06` §1, §3.1–3.3, §3.6, `556-560`, `566-591`, `630`, `634-645` · artefato `10`
§`316-325`, §`409`, §`451`, §`474`, §`505`, §`538` · artefato `14` §1, §1.1, §6.1–6.3, §11,
§25 · artefato `23` §1 · artefato `24` §7 · `docs/DECISIONS.md` — `R1-PROVENIENCIA-01`,
`PF6SGA-R2-GATE-SANEAMENTO` · `D-FUND-PREBUILD-01`, `D-FUND-R1-PEND5-01`,
`D-FUND-R2-CONTINUITY-01` · `CASO8-ANDROID-01`, `CASO12-PARCIAL-01` · `G-06`, `G-09`,
`G-12`, `G-13` · `O-1` · `RD-4`, `OR-6`.
