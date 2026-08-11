# `R2 · SESSÃO 2` — protocolo executável (preparado em 2026-08-11 · **NÃO INICIADA**)

> **Precedência.** Este documento **acrescenta** e é **subordinado**. Não reescreve o
> [`10_RODADA_FISICA_2_F6_SG_A.md`](10_RODADA_FISICA_2_F6_SG_A.md), não altera critérios de `PASS`/`FAIL`
> e não redefine caso algum. Fonte de verdade dos critérios:
> [`06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md`](06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md) §4.1
> (declarada em `10_RODADA_FISICA_2_F6_SG_A.md:12-15`).
>
> ⛔ **Estado atual: `R2 · SESSÃO 2` = NÃO INICIADA.** Este é o **plano**, não o registro de execução.
> Nada aqui autoriza tocar no aparelho. A execução depende de **`HUMAN GATE`** explícito.

**O que este documento faz:** consolida o insumo admissível produzido pela `PREP-LEGADO-03`
([`13_PREP_LEGADO_03.md`](13_PREP_LEGADO_03.md)), reconcilia-o com os Casos **1 · 15 · 14 · 16 · 10**,
e entrega a sequência operacional exata da `R2 · Sessão 2`.

**O que este documento NÃO faz:** não concede `PASS` a nenhum caso, não concede `F6-SG-A`, não
reabilita `PREP-LEGADO-01` nem `PREP-LEGADO-02` (ambas **`STOP`**), não corrige o achado visual de
`13_PREP_LEGADO_03.md` §8 e não amplia o escopo da `R2`.

---

## 1. Estado de entrada exigido — **guardas duras**

| Item | Valor exigido |
|---|---|
| Worktree que **serve o Metro** | `C:\tmp\ptf_fase6_shell_splash_wt` |
| Ramo | `feat/fase6-shell-splash` |
| `HEAD` | `8b1daf13a7a9e654ca3dc7fe72a60bf75665dc9b` (ou descendente **documental** aprovado) |
| `git status --porcelain` | **VAZIO** |
| Worktree histórico `C:\tmp\ptf_colorir_canonical_runtime_wt` | `docs/e015-phase3-artifacts` · `7de7085` · **VAZIO** · **SOMENTE LEITURA** |

> 🔴 **Divergiu ⇒ `STOP`.** Não "ajustar para bater".

**O worktree histórico NÃO serve Metro na `R2 · Sessão 2`.** Ele cumpriu o seu papel na
`PREP-LEGADO-03` e volta a ser **arquivo**. Nele estão proibidos: `checkout`, `switch`, `reset`,
`commit`, `merge`, `rebase`, `stash`, `npm install`, `npm ci` e edição de qualquer arquivo.

### 1.1 Prova de continuidade — por que o *runtime* atual é o mesmo validado

| Verificação | Comando | Resultado **conferido** |
|---|---|---|
| `c71e8b6` é ancestral do `HEAD`? | `git merge-base --is-ancestor c71e8b6 HEAD` | **SIM** |
| O que mudou de `aa58849` até o `HEAD` fora de `docs/` e `specs/`? | `git diff --name-only aa58849..HEAD \| grep -v -E "^(docs/\|specs/)"` | **lista vazia** |

> ✅ **Desde `aa58849`, nenhum arquivo funcional mudou.** Todos os *commits* posteriores são
> **documentais**. Logo o *runtime* servido na `R2 · Sessão 2` é, byte a byte no que importa, o mesmo
> já exercitado na `R2 · Sessão 1`. **Isto dispensa novo *build* nativo** e é a razão pela qual não se
> desinstala, não se reinstala e não se troca binário.

---

## 2. Insumo disponível — o que a `PREP-LEGADO-03` entregou

Detalhamento e perícia em [`13_PREP_LEGADO_03.md`](13_PREP_LEGADO_03.md) §3–§6. Resumo do acervo:

| Artefato | Chave / caminho | Propriedade probatória |
|---|---|---|
| **Obra do Ateliê** | `ptf_atelier_arts_v1_art_1786479103982_6079` + `ptf_atelier_arts_v1_index` | `schema 2`, `stateJson.v 2`, 12 *strokes*, `stamps []`; **`paintSchemaVersion`, `layoutVersion`, `logicalW`, `logicalH` AUSENTES** |
| **Ponteiro C60** | `@ptf_drawing60_screation_alight` | `v:3`, `fmt:2`, `image/png`, `rev:22`, `W/H 1440×2156` |
| ***Blob* C60** | `files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.a.png` | PNG íntegro, `IHDR` **1440×2156** = `W`/`H` do ponteiro |
| ***Blobs* do Ateliê** | `…_preview.jpg` (809×1098) · `…_thumb.jpg` (300×407) | JPEG íntegros, apontados por `previewUri`/`thumbnailUri` |
| **Lacre** | `TAR-POST03.tar` · **17.033.728 B** · `SHA256 14FFA2E42C95FB92B997B327AA90CAC897025E92FC32367DC31F3D04E3C25574` | Estado do dispositivo ao fim da `PREP-03` — **referência do gate `G-09`** |

**A ausência dos quatro eixos é o insumo**, não um defeito: é ela que caracteriza a obra como
**legada** perante o *runtime* da Fase 6.

---

## 3. Reconciliação caso a caso — matriz de insumo

Critérios **lidos** do canônico e citados por arquivo:linha. **Nenhum critério foi inventado.**

| Caso | Ficha | Insumo que o cobre | `PASS` canônico (citação) | Veredito de insumo |
|---|---|---|---|---|
| **1** | `TK-A-063` | ***Blob* + ponteiro C60** | *"A pintura **aparece** e está **alinhada ao lineart**. Não abre em branco"* — `10_RODADA_FISICA_2_F6_SG_A.md:348` | ✅ **SUFICIENTE** |
| **15** | `TK-A-077` | **Obra do Ateliê** (`paintSchemaVersion` ausente) | *"Lida e enquadrada certo; `paintSchemaVersion` ausente ⇒ tratada como **legada, sem erro**"* — `:360` | ✅ **SUFICIENTE** |
| **14** | `TK-A-076` | **Obra do Ateliê** — variante **`v2` sem geometria completa** | *"Reconstrução **determinística** a partir dos metadados. **Jamais** usar a janela atual como se fosse a original. Na dúvida, **preserva**"* — `:374` | ⚠️ **PARCIAL** — ver §4 |
| **16** | `TK-A-078` | **Ponteiro `v:3` + *blob*** | *"resolve normalmente · **blob não excluído** · `POINTER_VERSION` intocado"* — `:387` | ✅ **SUFICIENTE** |
| **10** | `TK-A-072` | **Ambas as metades** (Ateliê **e** C60) | *"**Bytes persistidos idênticos** antes e depois"* — `:400` | ✅ **SUFICIENTE** |

**Ordem de execução: `1 · 15 · 14 · 16 · 10`** — congelada em `10_RODADA_FISICA_2_F6_SG_A.md:92`.
**Não alterar.**

### 3.1 O bloqueio 🔴 do Caso 14 está satisfeito

A ficha do Caso 14 traz: *"**Se não houver obra anterior à Fase 6 no acervo, PARE e reporte.** Não
fabricar obra 'legada' — isso destruiria o valor do caso"* (`10_RODADA_FISICA_2_F6_SG_A.md:376`).

> ✅ **Há obra anterior à Fase 6 no acervo, e ela é genuína.** Foi produzida por interação humana real
> no *runtime* histórico `7de7085`, cujo *writer* (`atelierStorage.js:112-150`) **não conhece** os
> quatro eixos da Fase 6. A ausência é **originária**, não simulada. Nada foi fabricado, convertido,
> sintetizado ou editado.

O critério de identificação exigido pelo campo 10 da ficha (*"identificação objetiva pelo conteúdo
das chaves"*) é atendido de forma direta: **`schema 2` + `stateJson.v 2` + ausência dos quatro eixos**.

---

## 4. `CASO 14 · VARIANTE v1` — regra dura, sem exceção

A ficha do Caso 14 cita *"formato legado (`v1`/`v2`)"*. **Só a variante `v2` é executável.**

**Definição canônica de `v1`** — `docs/DECISIONS.md:2799`:

> *"A variante `v1` (**data URL crua gravada direto no `AsyncStorage`**)"*

⚠️ **Precisão necessária:** `v1` **não** é "um Ateliê antigo com os quatro eixos". É um formato do
**Colorir** (`drawingStorage`, `src/services/drawingStorage.js:7`). Os quatro eixos
(`paintSchemaVersion`, `layoutVersion`, `logicalW`, `logicalH`) são campos **novos da Fase 6** cuja
**ausência** marca o legado (`docs/DECISIONS.md:2778-2780`, `05_TASKS_DELTA_F6.md:710`). Confundir os
dois eixos leva a conclusões erradas sobre o que o acervo prova.

**Verificação independente de código** (conferida nos dois *worktrees*):

| Fato | `7de7085` (histórico) | `8b1daf1` (canônico) |
|---|---|---|
| Os quatro eixos existem? | **não** — zero ocorrências | sim — `AtelierCanvas.js:608-610`, `ColoringCanvas.js:706-708` |
| Motor emite `v:` qual? | `v:2` | `v:2` (`ColoringCanvas.js:485`, `AtelierCanvas.js:411`) |
| `saveDrawingState` (*writer* `v1`) | **órfão — zero chamadores** (`drawingStorage.js:130`) | idem |
| Migração `v1 → v2` | **não existe** | **não existe** |

> ### ⛔ `CASO 14 · v1` = **`INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL`**
> Ver `CASO14-V1-INEXECUTAVEL-01` (`docs/DECISIONS.md:2797`). **Esta classificação é preexistente e
> não é alterada por este documento.**

| Regra | |
|---|---|
| **não é `PASS`** | ⛔ |
| **não é `FAIL`** | ⛔ |
| **não autoriza fabricar *fixture*, converter arte ou sintetizar JSON** | ⛔ |
| **não pode bloquear as variantes executáveis** | ⛔ — bloquear seria desonesto |
| **deve aparecer SEPARADAMENTE no relatório**, nunca diluído no veredito do Caso 14 | ✅ |

**Forma exigida no relatório da `R2 · Sessão 2`:**

```
CASO 14 · variante v2 ....... PASS | FAIL   (com evidência C-7 + captura)
CASO 14 · variante v1 ....... INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL
                              (não é PASS, não é FAIL — CASO14-V1-INEXECUTAVEL-01)
```

---

## 5. Regras metodológicas herdadas da `PREP-LEGADO-03`

Quatro defeitos de instrumentação foram **observados** na `PREP-03`. Cada um vira regra aqui.

### 5.1 `rowid` é obrigatório — diff `key→value` **não** prova ausência de escrita

A `PREP-03` demonstrou fisicamente que uma reescrita idempotente é **invisível** a um comparador de
valores: `A1 → A2-BLOCKED` teve `ADDED=0 CHANGED=0 DELETED=0` **e houve `I/O` de escrita**
(`13_PREP_LEGADO_03.md` §3.3.1).

> 🔴 **Na `R2 · Sessão 2`, o Bloco A afirma que "nada é escrito".** Com o instrumento da `PREP-03`,
> essa afirmação **não seria demonstrável**. Todo comparador desta sessão captura **`rowid`**.

### 5.2 Todo relatório em **UTF-8 explícito**

`13_PREP_LEGADO_03.md` §6: o título correto no *storage* (`C3 A9` = `é`) apareceu como `Ú` no
relatório, por cadeia `CP1252 → CP850/CP858 → UTF-16LE`. **O banco estava certo o tempo todo.**

- Toda saída usa `Out-File -Encoding utf8` (ou `-Encoding utf8` em `Set-Content`).
- Toda conferência de texto acentuado é feita sobre **bytes**, nunca sobre a renderização.

### 5.3 Instrumento **versionado junto com a saída**

`13_PREP_LEGADO_03.md` §7.3: dois relatórios da `PREP-03` não são reproduzíveis porque o programa que
os gerou não foi preservado. **Aqui, `compare_state.py` (§8.1) é copiado para o diretório de evidência
e tem o seu `SHA256` registrado antes do primeiro uso.**

### 5.4 Instrumento emite **veredito nomeado pelo que mede**

`13_PREP_LEGADO_03.md` §7.1: o token `BASELINE_EQUAL=STOP` significava coisas opostas em
*checkpoints* diferentes. **Proibido rótulo ambíguo.** Cada verificação emite um nome próprio
(`ENTRY_STATE_RESULT=`, `BLOCO_A_READONLY_RESULT=`), e o veredito diz **o que** foi medido.

### 5.5 Declarar o *offset* de relógio **antes** de correlacionar

`13_PREP_LEGADO_03.md` §11: o aparelho está ≈ **10,5 s adiantado** em relação ao PC. Nenhuma
conclusão da `PREP-03` dependeu disso, mas a `R2` correlaciona `logcat` com ações do operador.
**`G-05` mede e registra o *offset*.** Correlação sem *offset* declarado ⇒ inválida.

### 5.6 `SHA256` de gate é **sempre** de 64 dígitos

`13_PREP_LEGADO_03.md` §2.2: sete abreviações foram publicadas com a cauda errada, entre elas a do
`TAR-POST03` — a **referência do `G-09`**. Nenhum arquivo tinha divergido; o defeito era de
transcrição manual, escondido por caudas de comprimento variável. Portanto, nesta sessão:

| | |
|---|---|
| ✅ | Todo `hash` que **decide** um gate aparece com os **64 dígitos**, ou é **recalculado na hora** com `sha256sum` e colado da saída. |
| ✅ | Abreviação, quando usada, é **uniforme `PRIMEIROS8…ÚLTIMOS8`** e serve **apenas** à leitura. |
| ⛔ | **Nenhum `hash` é digitado à mão.** Copia-se da saída do comando. |
| ⛔ | Abreviação **não** reprova nem aprova gate algum. |

### 5.7 Um único **escopo de captura** para toda a sessão

Descoberto ao validar o instrumento contra o acervo da `PREP-03`: **os `TAR` daquela campanha não
têm todos a mesma abrangência.**

| `TAR` | Escopo capturado |
|---|---|
| `G0`…`G3` | `databases/` apenas |
| `G4`, `G5`, `A1`, `A2` | `databases/` + `files/ptf_blobs/` |
| `TAR-PRE03`, `TAR-POST03` | **completo** — `databases/` + `files/` + `shared_prefs/` |

`compare_state.py` percorre a árvore inteira. Comparar um *checkpoint* estreito com um `TAR` completo
produz **`FILES_ADDED` que não são escritas** — apenas arquivos que o lado estreito nunca capturou.
Rodando `A2-ATELIER-SAVED × TAR-POST03` o instrumento acusava **`FILES_ADDED=9`** com todos os
contadores de chave em zero: um `STOP` **falso**, por defeito do método de captura.

**Correções aplicadas:**

| | |
|---|---|
| ✅ | **Todo `TAR` desta sessão** — `TAR-R2S2-PRE`, `TAR-1`, todos os `CK-C<n>`, `TAR-2` — é capturado com o **mesmo comando**, no escopo **completo**. |
| ✅ | O instrumento passou a computar a **assinatura de escopo** dos dois lados e emite `ESCOPO_OK=SIM/NAO`. |
| ✅ | Escopos diferentes ⇒ veredito **`STOP_ESCOPO_DIVERGENTE`**, distinto de `STOP`: é **recusa de comparar**, não reprovação de estado. |
| ⛔ | **Nunca** comparar capturas de escopos diferentes e ler o resultado como mutação. |

> Aplicação de §5.4 (*veredito nomeado pelo que mede*) ao próprio instrumento: o `STOP` genérico
> teria sido lido como "o aparelho mudou", quando o fato era "as duas fotos não têm o mesmo
> enquadramento".

---

## 6. Proveniência do *bundle* — marcadores **derivados para o *runtime* ATUAL**

> 🔴 **Não reutilizar os marcadores negativos da `PREP` histórica.** Na `PREP-LEGADO-02` exigia-se a
> **ausência** de `shellLifecycleTrace`/`useSurfaceLifecycle`, porque o alvo era o *runtime*
> histórico. **Aqui o alvo é o oposto.** Reaproveitar aqueles marcadores produziria um `STOP`
> garantido e falso.

Todos os marcadores abaixo foram **verificados nos dois *worktrees*** durante a preparação.

### 6.1 `M+` — **devem estar PRESENTES** (provam *runtime* canônico)

| | Marcador | Origem no canônico | No histórico `7de7085` |
|---|---|---|---|
| **`M+1`** | `[shell] MainTabs MONTADO · montagens #` | `src/services/shellLifecycleTrace.js:105-111`, chamado em `src/navigation/AppNavigator.js:257` | **arquivo inexistente**; zero ocorrências de `MONTADO` |
| **`M+2`** | `[COLORING_STATE] load OK espacoLogico=` | `src/components/ColoringCanvas.js:1037` | **ausente** (lá é `load OK W=`) |
| **`M+3`** | `obra existente não aberta por este motor — bytes preservados no armazenamento` | `src/components/ColoringCanvas.js:1492` | **ausente** |
| **`M+4`** | Existem `src/hooks/useSurfaceLifecycle.js`, `src/hooks/useViewportProjection.js`, `src/services/shellLifecycleTrace.js` | `git diff --name-status 7de7085 8b1daf1 -- src/` ⇒ **3 `A`, 0 `D`** | **os três não existem** |

**Forma completa de `M+1` no `logcat`** (`SHELL_MAX_VIVOS = 1`, `shellLifecycleTrace.js:32`):

```
[shell] MainTabs MONTADO · montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 · pareado
```

### 6.2 `M−` — **devem estar AUSENTES** (denunciam *runtime* histórico)

| | Marcador | Origem no histórico | No canônico `8b1daf1` |
|---|---|---|---|
| **`M−1`** | `[COLORING_STATE] load OK W=` | `ColoringCanvas.js:567` | **0 arquivos** — verificado |
| **`M−2`** | `incompatible saved state ignored` | `ColoringCanvas.js:551`, `:969` | **0 arquivos** — verificado |
| **`M−3`** | `saved state invalid/incompatible — healing (clear + fresh)` | `ColoringCanvas.js:962` | **ausente** |
| **`M−4`** | Qualquer linha começando por `[shell] ` | — | (se ausente ⇒ *runtime* errado) |

### 6.3 `M+2` × `M−1` — **par casado**, o discriminador mais forte

Os dois marcam **o mesmo ponto do mesmo código**, com texto diferente:

| *Runtime* | Linha emitida ao abrir uma obra do Colorir |
|---|---|
| **canônico `8b1daf1`** | `[ColoringCanvas WebView] [COLORING_STATE] load OK espacoLogico=…` |
| histórico `7de7085` | `[ColoringCanvas WebView] [COLORING_STATE] load OK W=…` |

**Cadeia de emissão verificada de ponta a ponta:** `devLog(…)` (`ColoringCanvas.js:119-122`) →
`window.ReactNativeWebView.postMessage('LOG:'+msg)` → *handler* `msg.startsWith('LOG:')`
(`ColoringCanvas.js:1494`) → `console.log('[ColoringCanvas WebView]', …)` → `logcat` como
`ReactNativeJS`. Ambos sob `__DEV__` — válidos no *dev client*.

Este par dispensa interpretação: **a mesma ação produz textos mutuamente exclusivos**, e ele dispara
exatamente durante os Casos 1/15/16.

### 6.4 ⚠️ `08_SEQUENCIA_OPERACIONAL_UNICA_F6_SG_A.md` — marcador **obsoleto** (errata por acréscimo)

O documento `08` prescreve, em **duas** linhas, o literal **`[AppNavigator] MainTabs MONTADO`**:

| Linha | Uso prescrito | Defeito **real** |
|---|---|---|
| `08_…:451` | marcador **positivo** do `CONTEXTO A` (*"Console mostra…"*) | a *string* **não existe** ⇒ nunca aparece ⇒ **`STOP` falso** |
| `08_…:483` | marcador **negativo** do `CONTEXTO B` (*"Se aparecer, você está em A — pare"*) | a *string* **não existe** ⇒ a guarda **nunca dispara** ⇒ **`PASS` falso (guarda morta)** |

> 🔴 **O mesmo literal obsoleto produz erros em direções opostas** — reprova o contexto certo e
> aprova o contexto errado. A segunda é a mais perigosa, porque **silenciosa**.

**Causa:** o texto é **composto em tempo de execução** (`` `[shell] ${s.nome} ${evento}` ``,
`shellLifecycleTrace.js:105`) — o prefixo é `[shell]`, não `[AppNavigator]`, e o campo é
**`montagens #N`** (plural), não `montagem #N`. Um `grep` pelo literal antigo falha nos dois sentidos.

**Encaminhamento:** a `R2 · Sessão 2` usa **`M+1`** (§6.1), não o literal de `08`. **O documento `08`
NÃO é reescrito** — esta errata é acréscimo, na mesma disciplina de `R2-ACH-01-ERRATA`
(`10_RODADA_FISICA_2_F6_SG_A.md`) e da convenção de `docs/DECISIONS.md:2733`. `08` permanece como foi
congelado, e quem o executar deve ler esta seção antes.

---

## 7. Topologia física — três terminais

| Terminal | Título | Papel | Diretório |
|---|---|---|---|
| **`PS1`** | `PS1 · CURRENT METRO` | **Único** Metro da sessão | `C:\tmp\ptf_fase6_shell_splash_wt` |
| **`PS2`** | `PS2 · R2 SESSION 2 CONTROL` | `adb`, `run-as`, `TAR`, *hashes*, `compare_state.py` | `C:\tmp\ptf_evidencias\R2S2` |
| **`PS3`** | `PS3 · R2 SESSION 2 LOGCAT` | **Captura contínua**, nunca interrompida | `C:\tmp\ptf_evidencias\R2S2` |

> 🔴 **`PS3` não é fechado, não é limpo (`logcat -c`) e não é reiniciado no meio da sessão.** Uma
> captura fragmentada não correlaciona. Se `PS3` cair ⇒ **`STOP`** e reinício do Bloco 0.
>
> 🔴 **`PS1` é o único Metro.** Nenhuma outra porta, nenhum outro *worktree*. Antes de subir, provar
> que **8081, 8082 e 8083 estão livres** (`G-06`).

---

## 8. `BLOCO 0` — pré-voo da `R2 · Sessão 2`

Cada *gate* `G-nn` registra **sete campos**: `id · comando · saída esperada · saída obtida ·
horário · veredito · artefato`.

> 📌 **Origem da regra dos sete campos.** Ela **não** consta do corpus canônico — é **decisão de
> desenho deste documento**, derivada dos sete campos de saída do `check_async.py` da `PREP-03`.
> Registrada explicitamente para não ser lida como requisito preexistente.

| *Gate* | O que faz | `STOP` se |
|---|---|---|
| **`G-00`** | Abrir `PS1`/`PS2`/`PS3` com os títulos exatos de §7; criar `C:\tmp\ptf_evidencias\R2S2\` | diretório já existir com conteúdo |
| **`G-01`** | `PS1`: provar *worktree*, ramo, `HEAD` e `porcelain` (§1) | qualquer divergência |
| **`G-02`** | `PS1`: provar continuidade — `git merge-base --is-ancestor c71e8b6 HEAD` e `git diff --name-only aa58849..HEAD` fora de `docs/`+`specs/` (§1.1) | ancestralidade falsa **ou** lista não vazia |
| **`G-03`** | `PS2`: copiar `compare_state.py` para a evidência e registrar o seu `SHA256` (§5.3) | falha de cópia |
| **`G-04`** | `PS2`: `adb devices` ⇒ **`RX2XC003LTJ  device`**; um **único** dispositivo | zero, múltiplos ou `unauthorized` |
| **`G-05`** | `PS2`: medir e registrar o ***offset* de relógio** aparelho ↔ PC (§5.5) | impossível medir |
| **`G-06`** | `PS2`: provar **8081, 8082 e 8083 livres** | qualquer porta em `Listen` |
| **`G-07`** | `PS3`: **iniciar a captura contínua** e provar que grava | arquivo não cresce |
| **`G-08`** | `PS2`: capturar **`TAR-R2S2-PRE`** no **escopo completo** (§5.7) — *hash*, tamanho, listagem | falha de `run-as`, truncamento ou **escopo estreito** |
| **`G-09`** | 🔴 **GATE DE ESTADO DE ENTRADA** — `compare_state.py` contra `TAR-POST03` (§8.1) | `ESCOPO_OK=NAO` ou **qualquer um dos sete contadores ≠ 0** |
| **`G-10`** | `PS1`: `node scripts/check-env.js`, depois `npx expo start --dev-client --clear --lan --port 8081` | `check-env` falhar |
| **`G-11`** | Aparelho: **`force-stop` + *cold start*** por *deep link* `pequenostracosdefe://` | app não abrir |
| **`G-12`** | `PS2`: baixar o *bundle* de `http://127.0.0.1:8081/index.bundle?platform=android&dev=true` e **grep dos marcadores** — `M+1..M+4` **presentes**, `M−1..M−4` **ausentes** (§6) | **qualquer** `M+` ausente **ou** **qualquer** `M−` presente |
| **`G-13`** | `PS3`: confirmar `M+1` no `logcat` na forma completa de §6.1, com o `PID` do processo do app | não aparecer, ou `PID` divergente |
| **`G-14`** | `PS2`: capturar **`TAR-1`** conforme `10_RODADA_FISICA_2_F6_SG_A.md:244` — **antes de abrir qualquer obra** | falha ou app já ter aberto obra |

> ✅ **Só depois de `G-14` verde começa o Bloco A.**

### 8.1 `G-09` — gate de estado de entrada (**o gate que a `PREP-03` tornou obrigatório**)

**Objetivo:** provar que o acervo no aparelho é **exatamente** o que a `PREP-LEGADO-03` lacrou.

> 🔴 **NÃO restaurar `TAR` por reflexo.** O aparelho **já está** no estado correto — a `PREP-03`
> terminou nele e nada foi executado depois. Restaurar é operação destrutiva e **desnecessária**.
> **Primeiro compara-se; restaurar não é o caminho de correção deste gate.**

**Comparação SEMÂNTICA, não byte-a-byte entre `TAR`.** Dois `TAR` do mesmo conteúdo diferem
legitimamente em *mtime*, ordem e *padding*. **Exigir igualdade de `SHA256` entre `TAR` como prova
única está proibido** — produziria `STOP` falso.

**Critério de aprovação — escopo idêntico e os *sete* contadores em zero:**

```
ESCOPO_OK=SIM
FILES_ADDED=0  FILES_CHANGED=0  FILES_DELETED=0
KEYS_ADDED=0   KEYS_CHANGED=0   KEYS_DELETED=0   KEYS_ROWID_MOVED=0
ENTRY_STATE_RESULT=PASS
```

**Única tolerância:** `databases/RKStorage-journal` (arquivo de 0 B cujo *mtime* varia sem significado
semântico). **Nenhuma outra.**

`ESCOPO_OK=NAO` ⇒ `ENTRY_STATE_RESULT=STOP_ESCOPO_DIVERGENTE` (§5.7). Isso **não** é reprovação do
aparelho: é `TAR-R2S2-PRE` capturado com abrangência diferente da do `TAR-POST03`. Recapturar no
escopo completo e repetir — **não** restaurar nada.

> 🔴 **Qualquer contador ≠ 0 ⇒ `STOP` e reporte.** Não interpretar, não "explicar", não seguir.
> `KEYS_ROWID_MOVED ≠ 0` significa que **houve escrita** entre o lacre e agora, mesmo com todos os
> valores idênticos — exatamente o que a `PREP-03` provou ser invisível ao instrumento antigo (§5.1).

#### `compare_state.py` — instrumento versionado

```python
#!/usr/bin/env python3
# compare_state.py — comparacao SEMANTICA de dois estados do app (R2 Sessao 2, gate G-09)
# Uso: python compare_state.py <ROOT_REF> <ROOT_ATUAL> <SAIDA.txt>
# Somente leitura. Nao escreve em nenhum banco. Saida sempre em UTF-8.
import hashlib, os, sqlite3, sys

TOLERADOS = {"databases/RKStorage-journal"}
DB_REL    = "databases/RKStorage"

def inventario(root):
    itens = {}
    for base, _, arquivos in os.walk(root):
        for nome in arquivos:
            caminho = os.path.join(base, nome)
            rel = os.path.relpath(caminho, root).replace("\\", "/")
            if rel in TOLERADOS:
                continue
            with open(caminho, "rb") as fh:
                dados = fh.read()
            itens[rel] = (len(dados), hashlib.sha256(dados).hexdigest())
    return itens

def escopo(itens):
    # Assinatura de ABRANGENCIA da captura (prefixos de diretorio, niveis 1 e 2).
    # Serve para recusar comparacao entre TAR capturados com comandos diferentes.
    prefixos = set()
    for rel in itens:
        partes = rel.split("/")[:-1]
        for n in (1, 2):
            if len(partes) >= n:
                prefixos.add("/".join(partes[:n]))
    return prefixos

def linhas_do_banco(root):
    caminho = os.path.join(root, DB_REL.replace("/", os.sep))
    if not os.path.isfile(caminho):
        return None
    con = sqlite3.connect("file:" + caminho + "?mode=ro", uri=True)
    try:
        linhas = con.execute(
            'SELECT rowid, "key", "value" FROM catalystLocalStorage ORDER BY rowid'
        ).fetchall()
    finally:
        con.close()
    return {k: (rid, v) for rid, k, v in linhas}

ref_root, atual_root, destino = sys.argv[1], sys.argv[2], sys.argv[3]
saida = []

ref, atual = inventario(ref_root), inventario(atual_root)
arq_add = sorted(set(atual) - set(ref))
arq_del = sorted(set(ref) - set(atual))
arq_chg = sorted(c for c in set(ref) & set(atual) if ref[c] != atual[c])

kref, katual = linhas_do_banco(ref_root), linhas_do_banco(atual_root)
if kref is None or katual is None:
    saida.append("ERRO=RKStorage ausente em um dos lados")
    ch_add = ch_del = ch_chg = ch_mov = ["<indeterminado>"]
else:
    ch_add = sorted(set(katual) - set(kref))
    ch_del = sorted(set(kref) - set(katual))
    comuns = set(kref) & set(katual)
    ch_chg = sorted(c for c in comuns if kref[c][1] != katual[c][1])
    ch_mov = sorted(c for c in comuns if kref[c][0] != katual[c][0])

esc_ref, esc_atual = escopo(ref), escopo(atual)
escopo_ok = (esc_ref == esc_atual)

saida += [
    "ESCOPO_REF="   + ",".join(sorted(esc_ref)),
    "ESCOPO_ATUAL=" + ",".join(sorted(esc_atual)),
    "ESCOPO_OK="    + ("SIM" if escopo_ok else "NAO"),
]
for pref in sorted(esc_ref ^ esc_atual):
    saida.append("ESCOPO_DIVERGENTE=" + pref
                 + " (" + ("so_em_REF" if pref in esc_ref else "so_em_ATUAL") + ")")

saida += [
    "FILES_ADDED="      + str(len(arq_add)),
    "FILES_CHANGED="    + str(len(arq_chg)),
    "FILES_DELETED="    + str(len(arq_del)),
    "KEYS_ADDED="       + str(len(ch_add)),
    "KEYS_CHANGED="     + str(len(ch_chg)),
    "KEYS_DELETED="     + str(len(ch_del)),
    "KEYS_ROWID_MOVED=" + str(len(ch_mov)),
]
for rotulo, colecao in (("FILE_ADDED", arq_add), ("FILE_CHANGED", arq_chg),
                        ("FILE_DELETED", arq_del), ("KEY_ADDED", ch_add),
                        ("KEY_CHANGED", ch_chg), ("KEY_DELETED", ch_del)):
    for item in colecao:
        saida.append(rotulo + "=" + str(item))
if kref is not None and katual is not None:
    for chave in ch_mov:
        saida.append("KEY_ROWID_MOVED=" + chave
                     + " " + str(kref[chave][0]) + "->" + str(katual[chave][0])
                     + " valor_identico=" + str(kref[chave][1] == katual[chave][1]))

limpo = (kref is not None and katual is not None
         and not (arq_add or arq_chg or arq_del or ch_add or ch_chg or ch_del or ch_mov))

if not escopo_ok:
    # Capturas de escopos diferentes NAO sao comparaveis: os arquivos ausentes de um
    # dos lados apareceriam como FILES_ADDED/DELETED reais. Recusar, nao "reprovar".
    resultado = "STOP_ESCOPO_DIVERGENTE"
elif limpo:
    resultado = "PASS"
else:
    resultado = "STOP"
saida.append("ENTRY_STATE_RESULT=" + resultado)

with open(destino, "w", encoding="utf-8") as fh:
    fh.write("\n".join(saida) + "\n")
print("ENTRY_STATE_RESULT=" + resultado)
```

#### Autoteste obrigatório — o instrumento é calibrado **antes** do `G-09`

`G-03` não termina na cópia: o instrumento é rodado contra **pares de resultado já conhecido** do
acervo da `PREP-03`, que é imutável e serve de padrão de aferição. Executado em **2026-08-11**:

| # | Par | Esperado | Obtido |
|---|---|---|---|
| **T1** | `A1-ATELIER-OPEN-PREPAINT` × `A2-BLOCKED-NAME-SHEET-PRE-SAVE` | detectar a reescrita idempotente de §3.3.1 do `13_` | `KEY_ROWID_MOVED=@ptf_criar_livre_orientation_seen_v1:star 30->48 valor_identico=True` ✅ |
| **T2** | `G0-POST-BOOT` × `G3-C60-OPEN-PREPAINT` | `PASS` — os dois são o *baseline* | `ESCOPO_OK=SIM` · sete contadores **0** · `PASS` ✅ |
| **T3** | `A2-ATELIER-SAVED` × `TAR-POST03` | recusar: escopos diferentes (§5.7) | `STOP_ESCOPO_DIVERGENTE`, com os quatro contadores de chave em **0** ✅ |

**T1 prova que ele detecta** (sem falso negativo — e reproduz, de forma independente, o achado
central da `PREP-03`). **T2 prova que ele não inventa** (sem falso positivo). **T3 prova que ele
recusa o que não pode comparar.** Um instrumento que só passou por `T2` não está calibrado.

> O `SHA256` do arquivo copiado é registrado em `C:\tmp\ptf_evidencias\R2S2\G-03_INSTRUMENTO.txt`
> — **não** aqui. Um `hash` que muda a cada edição deste documento, escrito **dentro** deste
> documento, é auto-referente e sempre estaria desatualizado. Aplicação de §5.6.

**Notas de projeto** — cada uma corrige um defeito observado na `PREP-03`:

| Decisão | Corrige |
|---|---|
| Captura **`rowid`** além de chave/valor | §5.1 — reescrita idempotente invisível |
| Escreve o relatório em **UTF-8 explícito**, sem `repr()` | §5.2 — `Ú` no lugar de `é` |
| Compara **arquivos** (caminho/tamanho/`SHA256`), não só o banco | *blobs* fora do `SQLite` |
| Veredito nomeado **`ENTRY_STATE_RESULT`** | §5.4 — rótulo ambíguo |
| **Não** ignora `-wal`/`-shm` | `13_PREP_LEGADO_03.md` §3.6 — não há, mas se aparecerem é sinal |
| Tolerância **explícita e única** | tolerância implícita é buraco de auditoria |

---

## 9. `BLOCO A` — execução dos casos

> ⛔ **NÃO EXECUTAR AGORA.** Esta seção descreve o que **será** feito após `HUMAN GATE`.

**Regra do bloco** (`10_RODADA_FISICA_2_F6_SG_A.md:330-333`): *"nenhum traço, nenhum salvamento,
nenhum encerramento. Navegar até a obra, observar, voltar. **Qualquer desenho acidental invalida o
par `TAR-1`/`TAR-2` e, com ele, o caso 10**"*.

Cada caso é registrado com **18 campos** — os **15** da ficha canônica (`10_RODADA…` §6), preservados
sem alteração, **mais três** derivados desta preparação:

| # | Campo | Origem |
|---|---|---|
| 1–15 | ID · Nome · Objetivo · Pré-condição · *(5)* · Orientação · Superfície inicial · Ações · Evidência · Comando · `PASS` · `FAIL` · *(13, 14)* · Executável no SM-X510 | **canônico** — `10_RODADA…` §6 |
| **16** | **Insumo utilizado** — qual artefato da `PREP-03` (§2) sustenta o caso | novo |
| **17** | **Marcador de proveniência observado** — qual `M+` apareceu no `logcat` durante o caso | novo (§6) |
| **18** | ***Checkpoint*** — `CK-C<n>` tirado ao fim do caso, com *hash* | novo (§9.1) |

**Ordem — congelada, `10_RODADA_FISICA_2_F6_SG_A.md:92`:**

| Ordem | Caso | Insumo (campo 16) | `M+` esperado (campo 17) | *Checkpoint* (campo 18) |
|---|---|---|---|---|
| 1º | **1** — obra antiga em retrato (**orientação RETRATO fixa**) | *blob* + ponteiro C60 | `M+2` | `CK-C1` |
| 2º | **15** — *payload* visual atual | obra do Ateliê | `M+1` | `CK-C15` |
| 3º | **14** — formato legado (**só `v2`**) | obra do Ateliê | `M+1` | `CK-C14` |
| 4º | **16** — envelope `v:3` | ponteiro + *blob* C60 | `M+2` | `CK-C16` |
| 5º | **10** — obra sem modificação | ambas as metades | `M+1`/`M+2` | `CK-C10` |

### 9.1 *Checkpoints* `CK-C*` — **obrigatórios**

`12_AUDITORIA_PREP02_STOP.md` registrou como defeito `P-2` da `PREP-02` a existência de **zero
*checkpoints* intermediários**, e a `PREP-03` provou o valor de tê-los: foi o *checkpoint* extra
`A2-BLOCKED` que transformou o mecanismo da reescrita de `INFERIDO` em `OBSERVADO`
(`13_PREP_LEGADO_03.md` §3.3.1).

**Ao fim de cada caso**, capturar `CK-C<n>.tar` + `SHA256` + `compare_state.py` contra o *checkpoint*
anterior. Custo: alguns segundos por caso. Benefício: **atribuição de qualquer escrita ao caso exato**.

> 🔴 **Sem `CK-C*`, um `TAR-2 ≠ TAR-1` seria inatribuível** — e a regra de honestidade de
> `10_RODADA_FISICA_2_F6_SG_A.md:120` (*"se `TAR-2 ≠ TAR-1`, **está proibido** concluir 'foi outro
> caso'"*) transformaria isso em `FAIL` de **todo** o bloco.

---

## 10. `TAR-2` e fecho da sessão

1. Capturar **`TAR-2`** (`10_RODADA_FISICA_2_F6_SG_A.md:244`, trocando `TAR-1` por `TAR-2`).
2. Rodar `compare_state.py` **`TAR-1` × `TAR-2`** — os **sete** contadores devem ser **zero**.
3. `10_RODADA…:400` exige *"**bytes persistidos idênticos** antes e depois"* ⇒ **Caso 10 fecha aqui.**
4. Encerrar `PS3` **por último**, e só depois de `TAR-2` estar com *hash* registrado.

> ⛔ **`F6-SG-A` NÃO é concedido automaticamente por um Bloco A verde.** A `R2 · Sessão 2` cobre os
> casos **1 · 15 · 14 · 16 · 10** do **Bloco A**. Os Blocos **B, C, D, E** (casos 7, 8, 6, 11, 17, 12)
> **não** estão nesta sessão, e **`R1-PEND-1..5` seguem ABERTAS** (`06_…:554-560`).
> **`F6-SG-A` exige o conjunto completo. Um único `FAIL` canônico impede a concessão.**

---

## 11. Condições de `STOP` — lista fechada

| | Condição |
|---|---|
| 1 | *Worktree*, ramo, `HEAD` ou `porcelain` divergente (§1) |
| 2 | Continuidade `aa58849..HEAD` com arquivo funcional alterado (§1.1) |
| 3 | Mais de um dispositivo, ou `unauthorized` (`G-04`) |
| 4 | Porta 8081/8082/8083 ocupada antes de subir o Metro (`G-06`) |
| 5 | `PS3` interrompido, fechado ou limpo em qualquer momento |
| 6 | Falha de `run-as` ou `TAR` truncado |
| 7 | **Qualquer** contador de `G-09` ≠ 0 (§8.1) — `ESCOPO_OK=NAO` é **recaptura**, não `STOP` (§5.7) |
| 8 | **Qualquer** `M+` ausente no *bundle* ou no `logcat` (`G-12`, `G-13`) |
| 9 | **Qualquer** `M−` presente (`G-12`) |
| 10 | Traço, salvamento ou encerramento acidental durante o Bloco A |
| 11 | `TAR-2 ≠ TAR-1` em qualquer um dos sete contadores |
| 12 | `CK-C<n>` revelando escrita não prevista |
| 13 | Necessidade de instalar, desinstalar ou substituir binário |
| 14 | Necessidade de restaurar `TAR` para "consertar" o estado de entrada |
| 15 | Aparecer obra no acervo que não veio da `PREP-LEGADO-03` |
| 16 | Impossibilidade de medir o *offset* de relógio (`G-05`) |
| 17 | Qualquer tentação de fabricar, converter ou sintetizar insumo `v1` (§4) |

---

## 12. O que este documento **NÃO** concede

| | |
|---|---|
| ⛔ | **`R2 · SESSÃO 2` = NÃO INICIADA** — este é o plano |
| ⛔ | **Nenhum `PASS` de caso** |
| ⛔ | **`F6-SG-A` NÃO CONCEDIDO** · `R1-PEND-1..5` **ABERTAS** |
| ⛔ | **`PREP-LEGADO-01` = `STOP`** — permanece |
| ⛔ | **`PREP-LEGADO-02` = `STOP`** — permanece |
| ⛔ | **`CASO 14 · v1` = `INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL`** — sem exceção |
| ⛔ | **Achado visual de `13_PREP_LEGADO_03.md` §8 NÃO corrigido** — registro, não trabalho autorizado |

> 🚦 **A execução da `R2 · Sessão 2` depende de `HUMAN GATE` explícito.**
