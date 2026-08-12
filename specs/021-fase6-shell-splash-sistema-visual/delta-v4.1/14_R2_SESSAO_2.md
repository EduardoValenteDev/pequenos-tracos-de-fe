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
| **`M+5`** | `[shell] ` (o prefixo, como literal) | `src/services/shellLifecycleTrace.js:105` — **1** ocorrência no canônico | **0 ocorrências** |

**Forma completa de `M+1` no `logcat`** (`SHELL_MAX_VIVOS = 1`, `shellLifecycleTrace.js:32`):

```
[shell] MainTabs MONTADO · montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 · pareado
```

> 🔴 **`M+1` NÃO existe como texto contíguo no *bundle*.** `descreverShellLifecycle`
> (`shellLifecycleTrace.js:103-112`) monta a linha por concatenação de *template literals*:
>
> ```js
> const base = `[shell] ${s.nome} ${evento}`
>   + ` · montagens #${s.montagens}`
> ```
>
> O que o *bundle* contém são os **fragmentos** `[shell] ` (`M+5`) e ` · montagens #`; a forma
> composta só nasce **em tempo de execução**. Procurar a linha inteira no *bundle* daria **`STOP`
> falso garantido**. Por isso `G-12` (*bundle*) e `G-13` (`logcat`) usam alvos diferentes — §6.5.

### 6.2 `M−` — **devem estar AUSENTES** (denunciam *runtime* histórico)

| | Marcador | Origem no histórico | No canônico `8b1daf1` |
|---|---|---|---|
| **`M−1`** | `[COLORING_STATE] load OK W=` | `ColoringCanvas.js:567` | **0 arquivos** — verificado |
| **`M−2`** | `incompatible saved state ignored` | `ColoringCanvas.js:551`, `:969` | **0 arquivos** — verificado |
| **`M−3`** | `saved state invalid/incompatible — healing (clear + fresh)` | `ColoringCanvas.js:962` | **ausente** |

Reconferido no canônico em **2026-08-11**: `load OK W=` → **0**, `incompatible saved state ignored`
→ **0**, `saved state invalid/incompatible` → **0**. Os três negativos são válidos.

> ⚠️ **`M−4` foi RETIRADO — era um marcador invertido, defeito do próprio documento.**
> Ele dizia "qualquer linha começando por `[shell] `", sentado na tabela dos que **devem estar
> ausentes**, enquanto a sua própria observação dizia *"se ausente ⇒ runtime errado"*. As duas
> leituras se contradizem, e **ambas reprovam**: pela tabela, encontrar `[shell] ` seria `STOP`
> (falso — é o *runtime* certo); pela observação, não encontrar seria `STOP`.
> O fato é que **`[shell] ` só existe no canônico** (`shellLifecycleTrace.js:105`, **1** ocorrência;
> **0** no histórico `7de7085`, onde o arquivo não existe): é marcador **positivo**. Reclassificado
> como **`M+5`** em §6.1. Mesma classe de defeito catalogada em §6.4 — um guarda que aponta para o
> lado errado é pior que guarda nenhum, porque parece proteger.
>
> **Os negativos desta sessão são `M−1`, `M−2` e `M−3`. Não há `M−4`.**

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

### 6.5 Onde cada marcador é observável — `G-12` ≠ `G-13`

> 📌 **Esta seção existe porque §6.4 diagnosticou a causa certa e eu não a apliquei ao meu próprio
> `G-12`.** O defeito do documento `08` é *texto composto em tempo de execução procurado como
> literal*. `M+1` tem **exatamente** essa forma — e o `G-12`, que lê o *bundle*, o exigia inteiro.

| Marcador | *Bundle* (`G-12`) | `logcat` (`G-13`) |
|---|---|---|
| `M+1` linha completa | ⛔ **não procurar** — composta em execução | ✅ é aqui que ela existe |
| `M+5` `[shell] ` | ✅ 1 ocorrência | ✅ prefixo de toda linha do *shell* |
| ` · montagens #` | ✅ fragmento presente | ✅ dentro da linha composta |
| `M+2` `[COLORING_STATE] load OK espacoLogico=` | ✅ literal contíguo (`ColoringCanvas.js:1037`) | ✅ ao abrir obra do Colorir |
| `M+3` `bytes preservados no armazenamento` | ✅ literal contíguo (`:1492`) | ✅ quando dispara |
| `M+4` (três arquivos) | ✅ por nome de módulo no *bundle* | — não se aplica |
| `M−1` `load OK W=` | ⛔ deve estar ausente | ⛔ deve estar ausente |
| `M−2` `incompatible saved state ignored` | ⛔ ausente | ⛔ ausente |
| `M−3` `saved state invalid/incompatible` | ⛔ ausente | ⛔ ausente |

**Regra geral, aplicável a qualquer marcador futuro:** antes de transformar um texto em critério de
gate, abrir o código e verificar se ele é **literal** ou **composto**. Literal se procura no
*bundle*; composto **só** se observa em execução. Confundir os dois produz `STOP` falso quando o
*runtime* está certo — e foi o que derrubou o documento `08`.

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
| **`G-12`** | `PS2`: baixar o *bundle* de `http://127.0.0.1:8081/index.bundle?platform=android&dev=true` e **grep dos marcadores de *bundle* de §6.5** — `M+2`, `M+3`, `M+4`, `M+5` e ` · montagens #` **presentes**; `M−1`, `M−2`, `M−3` **ausentes**. **`M+1` inteiro NÃO se procura aqui** (§6.5) | qualquer marcador de *bundle* `M+` ausente **ou** qualquer `M−` presente |
| **`G-13`** | `PS3`: confirmar `M+1` no `logcat` na forma completa de §6.1 — **é aqui, e só aqui, que a linha composta existe** —, com o `PID` do processo do app | não aparecer, ou `PID` divergente |
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
| 8 | **Qualquer** `M+` ausente **onde §6.5 diz que ele é observável** (`G-12`, `G-13`) — ausência de `M+1` no *bundle* **não** é `STOP`: ele não existe lá |
| 9 | **Qualquer** `M−1`/`M−2`/`M−3` presente (`G-12`). **Não existe `M−4`** (§6.2) |
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

---

## 13. `EMENDA 1` — incidente do `CASO 1` e redesenho do pré-condicionamento

> Emenda escrita em **2026-08-11**, **depois** do `BLOCO 0` fechado (`G-00..G-14` todos `PASS`) e
> **depois** da primeira tentativa física do `CASO 1`. Ela **não** reescreve o histórico acima: o
> corpo do documento permanece como foi aprovado, e esta seção registra o que a execução real
> revelou. Nada aqui autoriza código, *push* ou *merge*.

### 13.1 O incidente — o que aconteceu

O fundador percorreu a **única rota de produção disponível** — `Início → Aventuras → A Criação →
cena 1 → concluir → cena 2 → concluir`. O **convite do marco não apareceu**, e o fluxo nunca chegou
ao Colorir. O `CASO 1` **não pôde ser executado**.

### 13.2 Veredito formal do incidente — `CLASSIFICAÇÃO D (A + B)`

| Hipótese | Veredito | Prova |
|---|---|---|
| **A** — pré-condição incompatível criada pelo próprio acervo | **SIM** — causa raiz | `@ptf_coloring60_done_creation_light='true'` no `TAR-1` |
| **B** — defeito do protocolo da `R2` | **SIM** | a ficha do `CASO 1` nunca especificou rota (campo 7 = *"não especificado"*); o auditor preencheu a lacuna **por suposição** e preencheu **errado** |
| **C** — comportamento incorreto do *runtime* | **NÃO — REFUTADO** | `src/data/coloring60StoryMilestones.js:164-172` |
| **D** — combinação | ✅ **É ESTE** | |

O contrato provado no `HEAD`:

```js
if (milestone && !activityAlreadyComplete && !inviteAlreadySeen) return COLORING_MILESTONE_INVITE;
return GENERIC_CELEBRATION;   // CAMINHO B
```

`NarrationScreen.js:201-219` alimenta essa decisão com `loadColoring60Done(story.id,'light')`. Como
a atividade **já estava concluída**, `derivePostSceneExperience` desceu pelo `CAMINHO B`. A ausência
do convite é o comportamento **correto e documentado** — o *fail-safe* declarado no próprio módulo.
**Não é bug de produto e não se registra como achado da `R2`.**

> 🔴 **DECLARAÇÃO EXPLÍCITA.** A `PREP-LEGADO-03` produziu um artefato **AUTÊNTICO** porém
> **INCOMPATÍVEL** com a pré-condição de entrada planejada para esta variante do `CASO 1`. A
> incompatibilidade é **estrutural**: salvar uma obra do `C60` grava obrigatoriamente
> `@ptf_coloring60_done_<story>_<activity>`, que por contrato fecha o convite de primeira vez.
> **Obra legada autêntica e convite de primeira vez não coexistem em nenhum estado do mundo.**

### 13.3 `CASO 1` na primeira tentativa = `NÃO EXECUTADO`

| | |
|---|---|
| ⛔ | **`CASO 1` · 1ª tentativa = `NÃO EXECUTADO`** — **não** é `PASS` e **não** é `FAIL` |
| — | A pré-condição não foi satisfeita; o critério do campo 11 (*"a pintura aparece e está alinhada ao lineart"*) **nunca chegou a ser observável** |
| — | Nenhum invariante `ZERO` foi exercitado. Nada a reportar como defeito |

### 13.4 Evidência imutável — **não se apaga, não se renomeia, não se sobrescreve**

| Artefato | Papel | Estado |
|---|---|---|
| `TAR-1.tar` | **baseline original e IMUTÁVEL** da entrada do `BLOCO A` | `17139712 B` · `6650AC4B…26B19439` |
| `CK-C1-ROUTE-BLOCKED.tar` | checkpoint do **incidente**, progresso `3/10` | `17139712 B` · `98B8A194…A2638BBA` |

> ⛔ **PROIBIDO** substituir, renomear, sobrescrever ou remover da cadeia de custódia qualquer um dos
> dois. O *rebaseline* dos itens abaixo **acrescenta** artefatos; **não** aposenta estes.

Comparação `TAR-1 × CK-C1-ROUTE-BLOCKED` (`compare_state.py`, `ESCOPO_OK=SIM`):

```
FILES_CHANGED=1 (databases/RKStorage)   FILES_ADDED=0   FILES_DELETED=0
KEYS_ADDED=1 (@ptf_progress_creation)   KEYS_CHANGED=0  KEYS_DELETED=0  KEYS_ROWID_MOVED=0
```

Legado **byte a byte intacto**: as 4 chaves `C60` (*rowids* 43/44/45/46, **sem migração**), o `PNG`
`200565 B` `6814dee7…e1c83f81`, e os dois *blobs* do Ateliê (`89593 B` `fdc55296…d9e1e248` e
`14730 B` `a5fb5908…a48910de`).

`@ptf_progress_creation` = `{"1":true,"2":true,"3":true}` (*rowid* 53) — **três** cenas.
`@ptf_coloring60_milestone_invite_seen_creation_light` = **AUSENTE nos dois lados** ⇒ prova positiva
**por escrita ausente** de que o convite jamais foi apresentado (`NarrationScreen.js:214` marca no
**instante** da apresentação).

### 13.5 Rota de revisita — enumeração exaustiva

Todas as entradas em `ROUTES.COLORING` (editor `C60`) em `src/`:

| # | Ponto | Situação |
|---|---|---|
| 1 | `NarrationScreen.js:246` | **fechada** — `CAMINHO B`, provado |
| 2 | `StoryDetailScreen.js:375` | **viável** — exige `unlocked={isCompleted}` (`:131`, `:571-578`) ⇒ `10/10` |
| 3 | `Coloring60CollectionScreen.js:354` | exige chegar à coleção ⇒ `unlocked===true` **ou** `3/3` |
| 4 | `CongratsScreen.js:170` | exige `10/10` **e abre a atividade ERRADA**: `coloring60Journey.js:629-640` com `1/3` devolve `OPEN_NEXT → living_world`, **jamais** `light` |

Bancada `Coloring60LabScreen.js:122` e `__devResetCreationColoring60()`: **EXCLUÍDAS** por decisão do
fundador (fabricariam estado).

> ✅ **A rota `2` é de PRODUÇÃO, não `dev`/`admin`:** o portão `creationColoringVisible`
> (`StoryDetailScreen.js:138-141`) é o **mesmo** `isColoring60PilotAllowed()` que habilita o convite
> do marco. Num *build* `c60-pilot` as duas superfícies aparecem juntas.
>
> ⛔ **Não existe rota de produção com menos mutação.** O custo mínimo é **7 cenas** (`4..10`) mais a
> passagem **obrigatória** pela `CongratsScreen`.

### 13.6 `ALLOWLIST PRE-STORY-COMPLETE` — provada por código

Mutações **autorizadas** entre `CK-C1-ROUTE-BLOCKED` e `CK-STORY-COMPLETE`:

| Chave | *Writer* | Ocorrências |
|---|---|---|
| `@ptf_progress_creation` | `useProgress.js:29` | **7** (`INSERT OR REPLACE` ⇒ *rowid* migra a cada uma) |
| `@ptf_achievements_seen` | `achievementsStorage.js:27` via `dismissAchievement` | **8** (§13.7) |

**Qualquer outra chave = `STOP`.** Prova de ausência de outros *writers* automáticos no caminho
`cenas 4..10 → Congrats`:

| Candidato | Veredito | Prova |
|---|---|---|
| `@ptf_bonus_stars` | **não escreve** | `addBonusStars` só em `CadêAOvelhinha` / `LumiMoment` / `Palavrinhas` / `Pares` — nenhum no caminho |
| `@ptf_audio_prefs_v1` | **não escreve** | `persistPrefs` só via `setMusicEnabled`, chamado **apenas** por `ParentAreaScreen.js:366` |
| `@ptf_beni_guide_*` | **não escreve** | `NarrationScreen`/`CongratsScreen` não importam `beniTourService`; as duas chaves ainda não gravadas (`atelier`, `parentArea`) estão fora do caminho |
| progresso via *context* | **não escreve** | `ProgressContext.js` só faz `multiGet` (leitura) |
| quiz / reflexão / Livrinho / baú / certificado / *share card* / relatório | **não escrevem** | todos atrás de `onPress` na `CongratsScreen` |
| ponte `C60` do `Congrats` | **não escreve** | `useFocusEffect` (`CongratsScreen.js:141-158`) apenas **lê** |
| Ateliê / `drawingStorage` / `coloring60*` | **não escrevem** | nenhum toque no *canvas* |
| `brincar*` / `monteACena` / `churchMode` / `packStorage` / perfil / *onboarding* | **não escrevem** | fora do caminho |

> ⚠️ **`WATCH` — único *writer* condicional restante: `@ptf_entitlement_v1`.**
> `entitlementService.js:126-135` registra ouvinte de `AppState` e revalida quando o app volta a
> **`active`** ⇒ `refreshEntitlement()` → `saveEntitlement()`. A chave **não existe** hoje (fonte
> `RevenueCat`, *fail-closed*), mas o gatilho é real.
> **GUARDA OPERACIONAL: NÃO colocar o app em segundo plano durante toda a sequência.**
> Se a chave aparecer, é mutação **explicável** — registra-se e reporta-se; **não** se silencia.
>
> ⚠️ `@ptf_schema_version` / `@ptf_migration_status_v1`: só gravam em *boot* com migração pendente
> (já em `v3`). **Não relançar o app** durante a sequência.

### 13.7 Modais de conquista — lista **exata** e falseável

`CongratsScreen.js:194` dispara `checkForNewAchievements()` **automaticamente**, 1800 ms após montar.
Como `@ptf_achievements_seen` **não** está vazia (`["brincar_poucos_erros","brincar_first_game"]`), o
ramo silencioso `silentlyMarkAllCurrentAsSeen` **não** roda (`useAchievementCelebration.js:47`
exige `seenIds.length === 0`). Os modais entram em **fila**, na ordem do *array* `ACHIEVEMENTS`, e
**cada dispensa grava uma vez**.

| # | Emoji | Título | Origem | Predicado |
|---|---|---|---|---|
| 1 | ⭐ | Primeira cena | novo | `totalScenes >= 1` |
| 2 | 🌟 | Cinco cenas | novo | `totalScenes >= 5` |
| 3 | 💛 | Dez cenas | novo | `totalScenes >= 10` |
| 4 | 🏆 | Primeira aventura | novo | `anyStoryComplete` |
| 5 | 🌍 | Guardião da Criação | novo | `creationComplete` |
| 6 | 🌈 | Primeira história grátis | novo | `creationComplete` |
| 7 | 🎨 | Primeiro traço | **atrasado** | `hasAnyDrawing` — já verdadeiro pela obra `C60` (`achievementService.js:104-110`), nunca dispensado |
| 8 | ✨ | Primeira conquista | **atrasado** | `savedDrawingCount >= 1` — 1 arte no Ateliê |

> 🎯 **SÃO EXATAMENTE 8 MODAIS.** Estado final esperado: `@ptf_achievements_seen` com **10** entradas.
> **Um 9.º modal = `STOP`** — e é um `STOP` informativo, não catastrófico: significa que o modelo de
> conquistas divergiu do previsto e precisa ser reconciliado antes de prosseguir.

**Não** acendem (verificado): `fifteen_stars`/`thirty`/`fifty` (`totalScenes` = 10),
`three_stories`, `noah_done`, `comece_aqui_complete`, `first_premium_story_done`, `david_*`,
`jesus_*`, `all_stories_complete`, `artist_ark` (sem desenho da arca), `gallery_started` (≥2 artes) e
`little_artist_faith` (≥3 artes) — há **1** arte —, `first_quiz`, `first_book_opened`,
`first_reflection`, `lumi_moment`, `first_family_worship`, `brincar_three_games` (`paresPlays` = 1),
`brincar_pares_medio`, `brincar_pares_dificil`.

### 13.8 `REPOUSO` — critério **objetivo**, não aparência

`CK-STORY-COMPLETE` só é capturado quando **os quatro** forem verdadeiros:

| # | Critério | Como se mede |
|---|---|---|
| `R-1` | **8 modais dispensados**, contados um a um; nenhum modal na tela | observação física, contagem explícita |
| `R-2` | **Quiescência de armazenamento medida** | `SHA256` de `databases/RKStorage` capturado **duas vezes com ≥ 60 s de intervalo**; os dois **idênticos** |
| `R-3` | App **em primeiro plano**, na `CongratsScreen`, sem toque por ≥ 60 s | não voltar ao `Início`, não ir a segundo plano, não matar |
| `R-4` | `PS3` contínuo e `PS1` servindo | `LOGCAT_PROCESS_COUNT=1` e `raw.log` crescendo |

> 🔴 **`R-2` é o critério que substitui "parece parado".** As escritas do `AsyncStorage` **não emitem
> nenhuma linha de `logcat`** (§5.1) — silêncio no log **não** é prova de repouso. Só a igualdade de
> dois `SHA256` do próprio banco, separados no tempo, prova que nada mais está gravando.
> A leitura é **lado-PC** (`adb exec-out run-as … cat`): **não** toca o aparelho.
>
> ⚠️ **A armadilha que `R-1` fecha:** um `TAR` tirado com modal pendente faz a gravação posterior de
> `@ptf_achievements_seen` cair **dentro** da janela do caso seguinte — mutação real, atribuição
> errada, **`FAIL` falso**.

### 13.9 Cadeia de artefatos redesenhada

| Ordem | Artefato | Momento | Comparação que autoriza |
|---|---|---|---|
| 1 | `TAR-1.tar` | **imutável** — entrada do `BLOCO A` | histórico; **não** se aposenta |
| 2 | `CK-C1-ROUTE-BLOCKED.tar` | **imutável** — incidente, `3/10` | `TAR-1 × CK-C1` ✅ feita |
| 3 | `CK-STORY-COMPLETE.tar` | após `10/10` **e** `R-1..R-4` | `CK-C1 × CK-STORY-COMPLETE` sob a *allowlist* §13.6 |
| 4 | `TAR-1B-C1.tar` | **imediatamente antes** do `CASO 1` | `CK-STORY-COMPLETE × TAR-1B-C1` ⇒ exigido **`0` mutações** |
| — | *(execução)* | `CASO 1 → CASO 15 → CASO 14 → CASO 16` | — |
| 5 | `TAR-C10-PRE.tar` | **imediatamente antes** do `CASO 10` | *baseline* **próprio** do caso 10 |
| — | *(execução)* | `CASO 10` — abrir e fechar **sem desenhar** | — |
| 6 | `TAR-C10-POST.tar` (= `TAR-2`) | imediatamente depois | `TAR-C10-PRE × TAR-C10-POST` ⇒ **único** julgamento do `CASO 10` |

> 🔴 **`TAR-1B-C1` NÃO é reutilizável como "imediatamente antes" do `CASO 10`.** Os casos `1`, `15`,
> `14` e `16` ocorrem **entre** os dois; usar o mesmo *baseline* atribuiria ao `CASO 10` mutações de
> quatro casos anteriores. O canônico exige `TAR-1` **imediatamente antes** (`TK-A-072`, campo 4) —
> e "imediatamente" é literal.
>
> 🔴 **Entre `CK-STORY-COMPLETE` e `TAR-1B-C1`: `0` mutações.** Qualquer chave alterada nesse
> intervalo é `STOP`, porque nesse trecho **nada deveria estar escrevendo**.

### 13.10 Impacto nos demais casos — auditoria de interferência

| Caso | Depende de progresso narrativo? | Veredito |
|---|---|---|
| `CASO 15` (`TK-A-077`) | não — depende do **conteúdo do ponteiro** | **discriminável**, sem impacto |
| `CASO 14` (`TK-A-076`) | não | **sem impacto** — já travado por outro motivo: o único ponteiro do acervo é `v:3` com geometria completa; a ficha manda **PARAR e reportar** e **proíbe fabricar** |
| `CASO 16` (`TK-A-078`) | não — depende do **par de inventários** | **discriminável**, sem impacto |
| `CASO 10` (`TK-A-072`) | **SIM** — *baseline* "imediatamente antes" | resolvido por `TAR-C10-PRE` (§13.9) |

`CASO 6` (`BLOCO C`) exige que *"os blocos A e B não gravaram de propósito"*: o pré-condicionamento
acontece **antes** do `BLOCO A`, portanto **fora** da janela daquele caso.

### 13.11 `STOP` adicionais desta emenda

| # | Condição |
|---|---|
| `S-18` | Chave **fora** da *allowlist* §13.6 mutada entre `CK-C1` e `CK-STORY-COMPLETE` |
| `S-19` | Qualquer mutação entre `CK-STORY-COMPLETE` e `TAR-1B-C1` |
| `S-20` | Mais de **8** modais de conquista, ou modal fora da lista §13.7 |
| `S-21` | `R-2` não converge (dois `SHA256` de `RKStorage` diferentes) após 3 tentativas |
| `S-22` | Qualquer *rowid* das 4 chaves `C60` migrar, ou qualquer *blob* mudar de `SHA256` |
| `S-23` | App em segundo plano / relançado durante o pré-condicionamento (`@ptf_entitlement_v1`, migração) |

### 13.12 O que esta emenda **NÃO** concede

| | |
|---|---|
| ⛔ | **Nenhum `PASS`** de caso |
| ⛔ | **Nenhuma** autorização de código, `push` ou `merge` |
| ⛔ | **Nenhuma** rota `dev`/`admin`, *reset*, escrita manual ou fabricação de estado |
| ⛔ | `TAR-1` e `CK-C1-ROUTE-BLOCKED` **não** deixam a cadeia de custódia |
| ⛔ | `CASO 14 · v1` permanece `INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL` |

---

## 14. `EMENDA 2` — marcos das cenas 7 e 9, *allowlist* incompleta e repouso redesenhado

> 🔴 **Esta emenda CORRIGE a `EMENDA 1`.** A `ALLOWLIST PRE-STORY-COMPLETE` de §13.6 estava
> **INCOMPLETA** e o roteiro físico derivado dela estava **ERRADO**. A omissão foi levantada pelo
> fundador antes de qualquer execução física — nenhum toque ocorreu sob a versão defeituosa. O
> tablet permanece na **cena 4**.

### 14.1 A omissão — o catálogo tem **três** marcos, não um

`coloring60StoryMilestones.js:44-48` (catálogo `Object.freeze`, imutável em *runtime*):

| Marco | `activityId` | `unlockAfterScene` | `resumeScene` |
|---|---|---|---|
| 1 | `light` | **2** | 3 |
| 2 | `living_world` | **7** | 8 |
| 3 | `people_and_care` | **9** | 10 |

A `EMENDA 1` raciocinou **apenas** sobre `light` — o marco do incidente — e não projetou os marcos
das cenas **7** e **9**, que estão exatamente **dentro** do trecho `4 → 10` do pré-condicionamento.

**Auditoria direta do `CK-C1-ROUTE-BLOCKED`** (`SELECT rowid,key,value FROM catalystLocalStorage`,
21 chaves, extração `CKC1-EXTRACTED/databases/RKStorage`):

| Chave | Presença no `CK-C1` | Consequência |
|---|---|---|
| `@ptf_coloring60_done_creation_light` | **`true`** (*rowid* 44) | `activityAlreadyComplete=TRUE` ⇒ marco 1 fechado |
| `@ptf_coloring60_done_creation_living_world` | **AUSENTE** | `activityAlreadyComplete=FALSE` |
| `@ptf_coloring60_done_creation_people_and_care` | **AUSENTE** | `activityAlreadyComplete=FALSE` |
| `@ptf_coloring60_milestone_invite_seen_creation_light` | **AUSENTE** | prova do incidente (§13.4) |
| `@ptf_coloring60_milestone_invite_seen_creation_living_world` | **AUSENTE** | `inviteAlreadySeen=FALSE` |
| `@ptf_coloring60_milestone_invite_seen_creation_people_and_care` | **AUSENTE** | `inviteAlreadySeen=FALSE` |

O acervo tem **1/3** do `C60` concluído. Só `light` está `done`.

### 14.2 O contrato confirmado no `HEAD` — os convites **VÃO** abrir

Três condições precisam ser verdadeiras ao mesmo tempo. As três foram verificadas no `HEAD` atual:

**(a) O piloto está ATIVO neste *runtime*.**

```
NarrationScreen.js:45     coloring60JourneyActive = isCreationColoringPilotActive(story?.id)
coloring60Pilot.js:44     storyId === 'creation' && isColoring60PilotAllowed()
coloring60Pilot.js:33-36  COLORIR_60_CREATION_PILOT_ENABLED  ||  (__DEV__ && isInternalToolsEnabled())
internalTools.js:24-26    isInternalToolsEnabled() = __DEV__ || isCreatorQaModeAllowed() || RELEASE_PACK_QA_ENABLED
```

O *runtime* da `R2 · Sessão 2` é **Dev Client + Metro** (`G-13`, `PID 18029`) ⇒ `__DEV__ === true`
⇒ `isInternalToolsEnabled() === true` ⇒ `isColoring60PilotAllowed() === true` ⇒ **piloto ativo**.
Corroboração empírica independente: o próprio acervo contém as 4 chaves `C60` (*rowids* 43-46),
gravadas por este mesmo caminho na `PREP-03`. `sceneMilestone` **não** será `null` nas cenas 7 e 9.

**(b) `getColoring60MilestoneForCompletedScene('creation', 7|9)` devolve o marco** — tabela §14.1.

**(c) A decisão pura cai no `CAMINHO A`.**

```
coloring60StoryMilestones.js:164-172
  if (milestone && !activityAlreadyComplete && !inviteAlreadySeen)
      return COLORING_MILESTONE_INVITE;
```

Cena 7: `(marco, false, false)` ⇒ **`COLORING_MILESTONE_INVITE`**.
Cena 9: `(marco, false, false)` ⇒ **`COLORING_MILESTONE_INVITE`**.

**Portanto: `@ptf_progress_creation` + `@ptf_achievements_seen` NÃO cobrem o
pré-condicionamento. A *allowlist* de §13.6 está incompleta.**

### 14.3 A escrita acontece **no instante da apresentação**, antes de qualquer escolha

```
NarrationScreen.js:212-217
  if (experience === C60_POST_SCENE.COLORING_MILESTONE_INVITE) {
    markColoring60MilestoneInviteSeen(story.id, sceneMilestone.activityId);   // ← AQUI
    setShowMilestoneInvite(true);
    return;
  }
```

`markColoring60MilestoneInviteSeen` é chamada **antes** de `setShowMilestoneInvite(true)` e é
**síncrona na fachada** (`coloring60MilestoneInviteSeen.js:58-63`): grava a guarda de sessão em
memória e dispara `AsyncStorage.setItem(key, '1')` *fire-and-forget*. **Não depende da escolha da
criança.** Escolher `Colorir agora` ou `Continuar a história` **não altera** se a chave é gravada —
altera apenas o que acontece depois. Chave e valor exatos:

```
coloring60MilestoneInviteSeen.js:27-30
  KEY_PREFIX = '@ptf_coloring60_milestone_invite_seen_'
  keyFor(storyId, activityId) = `${KEY_PREFIX}${storyId}_${activityId}`
  valor gravado = '1'
```

### 14.4 Prova de que `Continuar a história` **não** acrescenta escrita alguma

```
NarrationScreen.js:257-260
  function handleMilestoneSkip() {
    setShowMilestoneInvite(false);   // estado de React — sem storage
    goToNext();
  }

NarrationScreen.js:172-176
  function goToNext() {
    if (!contentEntryAllowed) return;
    if (isLastCena) navigation.navigate('Congrats', { story });
    else navigation.replace('Narration', { story, cenaIndex: cenaIndex + 1 });
  }
```

`handleMilestoneSkip` faz **exatamente duas coisas**: fecha o modal e navega. **Zero**
`AsyncStorage`, **zero** `FileSystem`, **zero** serviço. `goToNext` é o mesmo avanço de sempre,
já exercido nas cenas 1→2→3. O botão `Continuar a história` é um `SoundButton` com `silent`
(`Coloring60MilestoneInvite.js:56`) — nem som toca, e `SoundButton` não tem *writer* de
armazenamento em caminho algum.

> ✅ **Conclusão formal:** o par (apresentação + `Continuar a história`) escreve **UMA** chave por
> marco — o `invite_seen` já gravado na apresentação — **e nada mais**.

O caminho oposto (`Colorir agora`) chamaria `c60OpenEditorFromMilestone` e abriria o editor:
**PROIBIDO** nesta janela. Ele criaria obra nova em `living_world`/`people_and_care`, contaminando
irreversivelmente os `CASOS 15` e `16` e o inventário do `CASO 10`.

### 14.5 `@ptf_coloring60_milestone_invite_seen_creation_light` permanece **AUSENTE**

A cena 2 **já está concluída** (`@ptf_progress_creation = {"1":true,"2":true,"3":true}`, *rowid* 53).
`NarrationScreen.js:273-283`: numa cena já concluída, `primaryAction = goToNext`, **não**
`handleConcluirCena`. O operador avança **sempre para a frente**, da 4 em diante, e nunca reentra na
cena 2 — logo `handleConcluirCena` nunca roda para a cena 2 outra vez.

> 🔴 **A prova por escrita ausente do incidente (§13.4) permanece INTACTA e falseável.**
> Se `@ptf_coloring60_milestone_invite_seen_creation_light` **aparecer** no
> `CK-STORY-COMPLETE`, isso significa que a cena 2 foi reconcluída ⇒ **`STOP S-24`**.

### 14.6 `ALLOWLIST PRE-STORY-COMPLETE` — versão **CORRIGIDA** (substitui §13.6)

| # | Chave | *Writer* | Ocorrências | Natureza |
|---|---|---|---|---|
| 1 | `@ptf_progress_creation` | `useProgress.js:29` | **7** (cenas 4,5,6,7,8,9,10) | `CHANGED` — *rowid* migra |
| 2 | `@ptf_achievements_seen` | `achievementsStorage.js:27` via `dismissAchievement` | **8** (§13.7) | `CHANGED` — *rowid* migra |
| 3 | `@ptf_coloring60_milestone_invite_seen_creation_living_world` | `coloring60MilestoneInviteSeen.js:61` | **1** (cena 7) | **`ADDED`** — valor `'1'` |
| 4 | `@ptf_coloring60_milestone_invite_seen_creation_people_and_care` | `coloring60MilestoneInviteSeen.js:61` | **1** (cena 9) | **`ADDED`** — valor `'1'` |

**Contadores esperados de `CK-C1-ROUTE-BLOCKED × CK-STORY-COMPLETE`:**

```
ESCOPO_OK          = SIM
FILES_ADDED        = 0
FILES_CHANGED      = 1        (databases/RKStorage)
FILES_DELETED      = 0
KEYS_ADDED         = 2        (as duas chaves invite_seen)
KEYS_CHANGED       = 2        (@ptf_progress_creation, @ptf_achievements_seen)
KEYS_DELETED       = 0
KEYS_ROWID_MOVED   = 2        (exatamente as duas CHANGED — INSERT OR REPLACE)
```

> Um arquivo lateral do `SQLite` (`RKStorage-journal` / `-wal` / `-shm`) que apareça ou suma **não**
> é `STOP` por si: é artefato de motor, não estado do app. **Deve ser reportado**, nunca silenciado,
> e nunca serve de justificativa para uma chave fora da lista.

**Classificação obrigatória (Decisão 1 do fundador, estendida):** as **quatro** mutações são
**inevitáveis** e pertencem à **etapa de PRÉ-CONDICIONAMENTO DA HISTÓRIA**. Não são achado do
`CASO 1`, nem do `CASO 10`, nem de nenhum caso funcional. Ocorrem **antes** do `TAR-1B-C1` e,
portanto, **fora** de toda janela de medição.

As tabelas de ausência de *writer* de §13.6 (bônus estrelas, áudio, guia do Beni, *context*,
quiz/Livrinho/baú, ponte `C60`, Ateliê, `brincar*`) **permanecem válidas e não são revogadas** —
foram reverificadas e nada nelas muda. O que muda é **apenas** o acréscimo das linhas 3 e 4 acima.

### 14.7 Roteiro físico **CORRIGIDO** — cena a cena

A `EMENDA 1` presumia celebração genérica em todas as cenas 4-9. **Errado.** O comportamento
esperado, derivado do contrato:

| Cena | Botão | Experiência pós-cena | Escrita |
|---|---|---|---|
| 4 | `Concluir cena ⭐` | celebração genérica → `Continuar →` | `@ptf_progress_creation` |
| 5 | `Concluir cena ⭐` | celebração genérica → `Continuar →` | `@ptf_progress_creation` |
| 6 | `Concluir cena ⭐` | celebração genérica → `Continuar →` | `@ptf_progress_creation` |
| **7** | `Concluir cena ⭐` | 🎯 **CONVITE** — *"O mundo ficou cheio de vida!"* / *"Quer colorir essa parte comigo?"* | `@ptf_progress_creation` **+** `invite_seen_creation_living_world` |
| 8 | `Concluir cena ⭐` | celebração genérica → `Continuar →` | `@ptf_progress_creation` |
| **9** | `Concluir cena ⭐` | 🎯 **CONVITE** — *"A Criação ficou muito boa!"* / *"Vamos mostrar nosso cuidado com as cores?"* | `@ptf_progress_creation` **+** `invite_seen_creation_people_and_care` |
| 10 | `Concluir história ⭐` | **nenhuma** — vai direto a `Congrats` (`NarrationScreen.js:189-192`) | `@ptf_progress_creation` |

Textos verbatim do catálogo (`coloring60StoryMilestones.js:70-80`) — os botões do convite são
`Colorir agora` (laranja, principal) e `Continuar a história` (discreto, abaixo).

> 🔴 **Nas cenas 7 e 9: tocar SOMENTE `Continuar a história`.**
> `Colorir agora` = `STOP S-25` — abriria o editor e criaria obra nova.
> O recuo por *hardware* do Android também cai em `onSkip`
> (`Coloring60MilestoneInvite.js:41 onRequestClose={onSkip}`) — é seguro, mas **não** é o caminho
> instruído: use o botão.

**Falseabilidade:** se o convite **não** aparecer na cena 7 ou na 9, isso **contradiz** o contrato
auditado e é `STOP` imediato — pare e reporte, não improvise.

### 14.8 `REPOUSO` — método **REDESENHADO** (`R-2'`, substitui `R-2`/`R-3` de §13.8)

**O problema levantado pelo fundador:** §13.8 exigia ≥ 60 s + 75 s sem interação **e** proibia
`background`. Se o `SCREEN_OFF_TIMEOUT` do aparelho for menor que a janela, os dois requisitos são
**incompatíveis** — e alterar a configuração do aparelho é **proibido**.

**A resolução vem do código, não de uma configuração.** O ouvinte é assimétrico:

```
entitlementService.js:128-132
  _appStateSub = AppState.addEventListener('change', (s) => {
    if (s === 'active') refreshEntitlement().catch(() => {});
  });
```

> 🔴 **Só a transição `→ active` escreve. `→ background` / `→ inactive` NÃO escrevem NADA.**

Varredura completa de `AppState` em `src/` + `App.js` (13 pontos): `AudioPlayer` e `StoryBookScreen`
(desmontados no `Congrats`), `usePuzzleController`, `MonteACena*`, `Pares`, `Palavrinhas`,
`CadêAOvelhinha` (telas não montadas), `useSurfaceLifecycle` (só `setState`), `useImageRecovery`
(**zero** `AsyncStorage` — verificado por *grep*). **`entitlementService` é o único com *writer*.**

**Método `R-2'` — o aparelho PODE dormir; o que não pode é ACORDAR:**

| # | Critério | Como se mede |
|---|---|---|
| `R-1` | 8 modais dispensados, contados um a um, nenhum na tela | observação física |
| `R-2'` | Dois `SHA256` de `databases/RKStorage`, ≥ 60 s de intervalo, **idênticos** | lado-**PC** (`adb exec-out run-as … cat`) — funciona com a tela apagada e o aparelho bloqueado |
| `R-3'` | **Zero toque no tablet** desde a dispensa do 8.º modal até o `TAR-1B-C1` — inclusive **não acordar a tela** | disciplina do operador |
| `R-4` | `PS3` contínuo e `PS1` servindo | `LOGCAT_PROCESS_COUNT=1`, `raw.log` crescendo |

**Consequências desenhadas:**

1. `SCREEN_OFF_TIMEOUT_MS`, `STAY_ON_WHILE_PLUGGED_IN` e `mWakefulness` passam a ser
   **informativos**, não bloqueantes. Continuam sendo lidos e registrados (leitura pura, nenhuma
   escrita de configuração), mas **nenhum passo depende do valor**. Um protocolo que depende de um
   valor não reportado é um protocolo que trava.
2. **Nada é alterado no aparelho** — nem `settings put`, nem `svc power`, nem `keyevent`.
3. Se a tela apagar entre `R-2'`-A e `R-2'`-B, o resultado **continua válido**: o `→ background` não
   escreve, e a leitura por `adb` não acorda o aparelho.

> ⚠️ **`W-1` — a transição `→ active` do PRÓXIMO despertar.**
> Quando o operador acordar o tablet para iniciar o `CASO 1`, `AppState` disparará `'active'` e
> `refreshEntitlement()` **poderá** gravar `@ptf_entitlement_v1`. Esse despertar acontece
> **depois** do `TAR-1B-C1`, logo cairia **dentro** da janela do `CASO 1`.
> **Atribuição declarada por antecipação: `@ptf_entitlement_v1` que apareça na primeira medição
> após um despertar é `RETOMADA DE SESSÃO (W-1)`, jamais achado do `CASO 1`.**
> A chave nunca apareceu em nenhum `TAR` até aqui (fonte `RevenueCat`, *fail-closed*), então o
> cenário mais provável é que não apareça. Se aparecer, é **explicável e registrada**, nunca
> silenciada, e **nunca** convertida em `FAIL` de caso.

**`CK-STORY-COMPLETE` e `TAR-1B-C1` são capturados na MESMA janela de quiescência**, ambos com o
tablet intocado. Por construção, a comparação entre os dois deve dar **`0` mutações** — que é
exatamente o que `S-19` exige. Esta é a forma **mais forte** de satisfazer a Decisão 2 do fundador:
o intervalo em que "nada deveria estar escrevendo" passa a ser um intervalo em que **nada pode
sequer ser acionado**.

### 14.9 Correções operacionais dos comandos

| # | Regra |
|---|---|
| `O-1` | **Nunca depender de `adb` no `PATH`.** Usar sempre `$adb = 'C:\Android\platform-tools\adb.exe'` e `$serial = 'RX2XC003LTJ'`, com `-s $serial` em todo comando. |
| `O-2` | **`cmd.exe /c` obrigatório** para todo redirecionamento binário (`TAR`, `RKStorage`): o `>` do PowerShell corrompe `stdout` binário (foi o que produziu o `raw.log` em `UTF-16LE`). |
| `O-3` | **Guarda anti-sobrescrita:** antes de criar qualquer artefato, exigir `Test-Path <destino>` = `False`. Um artefato que já existe **nunca** é sobrescrito — é evidência. |
| `O-4` | Leituras de estado do aparelho (`settings get`, `dumpsys`) são **somente leitura**. `settings put`, `svc`, `input`, `keyevent` são **proibidos** nesta sessão. |

### 14.10 `STOP` adicionais desta emenda

| # | Condição |
|---|---|
| `S-24` | `@ptf_coloring60_milestone_invite_seen_creation_light` **aparecer** — a cena 2 foi reconcluída, o incidente foi contaminado |
| `S-25` | `Colorir agora` tocado em qualquer convite — obra nova criada, `CASOS 15/16/10` contaminados |
| `S-26` | Convite **não** aparecer na cena 7 ou na cena 9 — contradiz o contrato auditado em §14.2 |
| `S-27` | Artefato de destino já existente (`Test-Path` = `True`) — não sobrescrever evidência |

`S-23` fica **REVISADO**: o app ir a segundo plano por apagamento de tela **não** é `STOP`
(§14.8). Continua `STOP` **relançar/matar** o app (migração) e **acordar** o tablet dentro da janela
de quiescência.

### 14.11 O que esta emenda **NÃO** concede

| | |
|---|---|
| ⛔ | **Nenhum `PASS`** de caso — o pré-condicionamento não é caso |
| ⛔ | **Nenhuma** autorização de `push`, `merge` ou alteração de código |
| ⛔ | **Nenhuma** alteração de configuração do aparelho |
| ⛔ | `TAR-1` e `CK-C1-ROUTE-BLOCKED` seguem imutáveis na cadeia de custódia |
| ⛔ | As duas chaves `invite_seen` gravadas **não** viram evidência de caso — são pré-condicionamento |
| ⛔ | `CASO 1` continua `NÃO EXECUTADO`; nada aqui o executa |

---

## 15. `EMENDA 3` — `HARD STOP`, preservação de tentativas e cisão `FASE A` / `FASE B`

> 🔴 **Esta emenda corrige três defeitos de protocolo da `EMENDA 2`**, todos levantados pelo fundador
> **antes** de qualquer execução física. O tablet permanece na **cena 4**. Nenhum toque novo.

### 15.1 Defeito `1` — `S-27` não parava nada

A guarda escrita na `EMENDA 2` apenas **imprimia** texto:

```powershell
foreach ($n in 'CK-STORY-COMPLETE','TAR-1B-C1') {
  if (Test-Path "$ev\acervo\$n.tar") { "STOP S-27 - $n ja existe" }   # ← só imprime
}
cmd.exe /c "... > ...CK-STORY-COMPLETE.tar"                            # ← executa mesmo assim
```

Em PowerShell, uma *string* solta é **saída**, não controle de fluxo. Pior: linhas coladas no console
são **statements independentes** — um `throw` numa linha **não** impede a linha seguinte de rodar.
A guarda era decorativa e podia **sobrescrever evidência**.

**Padrão obrigatório a partir daqui — `HARD STOP` real:** toda captura vive **dentro de um único
bloco `& { … }`**, com `$ErrorActionPreference='Stop'` e `throw` **antes** de qualquer
redirecionamento. Um `throw` dentro do bloco é erro **terminante**: aborta o bloco inteiro, e nenhum
`cmd.exe` posterior chega a ser invocado.

```powershell
$ErrorActionPreference='Stop'
& {
  foreach ($p in @($dest1,$dest2)) { if (Test-Path $p) { throw "STOP S-27 - preexiste: $p" } }
  cmd.exe /c "..."      # só chega aqui se NENHUM destino existir
}
```

> **Regra `O-5`:** nunca confiar em mensagem textual como controle. Guarda que não aborta **não é
> guarda**. Captura e guarda no **mesmo bloco**, sempre.

### 15.2 Defeito `2` — apagar `RK-A`/`RK-B` destruía evidência de instabilidade

A `EMENDA 2` mandava apagar e repetir quando `RK_A ≠ RK_B`. **Errado**: a divergência **é** o dado —
prova que algo continuava gravando, e o quanto. Apagar é destruir o único registro disso.

**`R-2''` — tentativas numeradas e preservadas.** Máximo **3**; **nenhuma** é apagada:

| Tentativa | Arquivos | Registro obrigatório |
|---|---|---|
| 1 | `RK-A1.bin` · `RK-B1.bin` | `mtime`, `Length`, `SHA256` de cada um |
| 2 | `RK-A2.bin` · `RK-B2.bin` | idem |
| 3 | `RK-A3.bin` · `RK-B3.bin` | idem |

`A(n) ≠ B(n)` ⇒ registrar **`TENTATIVA n = NÃO ESTÁVEL`**, esperar, e produzir `A(n+1)`/`B(n+1)` em
**arquivos novos**. Três tentativas sem convergir ⇒ **`S-21`**, parar e reportar — com as **seis**
amostras intactas, que passam a ser evidência de primeira classe sobre o que não silenciou.

Os nomes `RK-A.bin` / `RK-B.bin` (sem índice) da `EMENDA 2` ficam **revogados**.

### 15.3 Defeito `3` — o `TAR-1B-C1` estava no lugar errado

A `EMENDA 2` provou que `AppState → active` pode gravar `@ptf_entitlement_v1`, e ao mesmo tempo
colocava `TAR-1B-C1` **antes** do despertar. Contradição: a mutação do despertar cairia **dentro** da
janela `TAR-1B-C1 → CASO 1`. Chamá-la de `W-1` não resolve — **atribuição não conserta posição**.

Um *baseline* "imediatamente antes" que precede um *writer* conhecido **não é** um *baseline*.

### 15.4 Auditoria da rota física pós-`Parabéns` — **não suposta, lida**

Rota **determinística** da `CongratsScreen` até o *card* `Haja luz`:

| Passo | Superfície | Elemento | Código |
|---|---|---|---|
| 1 | `Congrats` | **`🏠 Voltar ao início`** | `CongratsScreen.js:401-408` → `navigation.navigate('Home')` |
| 2 | `Home` (aba) | aba **`Aventuras`** | `AppNavigator.js:142` → `AdventureMapScreen` |
| 3 | mapa | *pin* de **`A Criação`** | `AdventureMapScreen.js:342-345` → `openFocus` (abre `StoryFocusModal`) |
| 4 | `StoryFocusModal` | botão principal — **`Continuar aventura`** | `AdventureMapScreen.js:347-351` → `navigate('StoryDetail')` |
| 5 | `StoryDetail` | modal do Beni → **`Continuar depois`** | `StoryDetailScreen.js:632-635` |
| 6 | `StoryDetail` | *card* **`Haja luz`** na jornada de cores | `coloring60Catalog.js:36-38` |

> ⚠️ **`🏠 Voltar ao início` é o ÚNICO botão determinístico de saída do `Congrats`.**
> `Próxima aventura` passa por `getNextAdventureRecommendation` e pode ir a `StoryDetail` de **outra**
> história, a `ParentArea` ou à aba `Aventuras`, conforme o estado — **não** serve a um protocolo.
> O *card* de continuar da `HomeScreen` também é variável: `HomeScreen.js:666-671` desvia para
> `PostStoryHub` quando `targetType === 'pendingRewards'` — **superfície proibida** nesta rota.

**Varredura de *writers* de cada passo:**

| Superfície | *Writer* automático? | Prova |
|---|---|---|
| `Congrats` (saída) | **não** | apenas `navigate`; a fila de conquistas já se esgotou na `FASE A` |
| `HomeScreen` | **NENHUM** | `grep AsyncStorage\|setItem` em `HomeScreen.js` ⇒ **zero ocorrências** |
| `AdventureMapScreen` | **não dispara** | os únicos *writers* (`markBeniAppTourSeen`, `markGuideSeen('adventures')`, `:60-61`) vivem **dentro de `closeBeniTour`**, que só roda se o tour abrir — e o tour exige `hasSeenBeniAppTour()` **false**; `@ptf_beni_app_tour_seen_v1` já é `true` (*rowid* 41) |
| `StoryFocusModal` | **não** | componente de apresentação; `onOpen` = `navigate` |
| **`StoryDetail`** | 🔴 **SIM — achado novo** | ver abaixo |
| `CreationColoringJourneySection` | **não** | `onPress={locked ? undefined : onPress}`; nada dispara sozinho |

#### 🔴 `ACHADO` — `@ptf_creation_colorir_invite_shown_v1`

```js
// StoryDetailScreen.js:241-276  (useFocusEffect)
if (!deriveColoring60JourneyInvite({ ...fatos, inviteSeen: false }).visible) return;
const seen = await hasSeenCreationColoringInvite();
if (!deriveColoring60JourneyInvite({ ...fatos, inviteSeen: seen }).visible) return;
setInviteVisible(true);
const marked = await markCreationColoringInviteSeen();      // ← ESCRITA AUTOMÁTICA
```

```js
// coloring60JourneyInvite.js:18
const INVITE_KEY = '@ptf_creation_colorir_invite_shown_v1';
// :41  await AsyncStorage.setItem(INVITE_KEY, '1');
```

Predicado (`coloring60Journey.js:721-742`) no estado que teremos após a `FASE A`:

| Fato | Valor | Efeito |
|---|---|---|
| `pilotVisible` | `true` | não é `PILOT_OFF` |
| `storyScenesComplete` | `true` (10/10) | não é `STORY_INCOMPLETE` |
| `allActivitiesComplete` | `false` (**1/3**) | não é `ALL_ACTIVITIES_COMPLETE` |
| `inviteSeen` | `false` — chave **AUSENTE** no `CK-C1` | não é `ALREADY_SEEN` |
| ⇒ `reason` | **`SHOW`** | `visible = true` ⇒ **grava** |

> 🎯 **Este é exatamente o *writer* automático que o fundador exigiu que eu não supusesse.**
> Ele dispara **no foco da `StoryDetail`**, sem toque nenhum — e, no desenho da `EMENDA 2`, cairia
> **dentro** da janela do `CASO 1`. No desenho corrigido, ele acontece **antes** do `TAR-1B-C1`.
> A escrita é **única**: no foco seguinte, `hasSeenCreationColoringInvite()` devolve `true` e o
> ramo `ALREADY_SEEN` corta antes de qualquer `setItem`.

`handleInviteLater` (`StoryDetailScreen.js:409-411`) é `setInviteVisible(false)` e **nada mais** —
`Continuar depois` **não escreve**. `Colorir agora` chamaria `handleInviteColorNow`, que abre a
**próxima atividade incompleta** = `living_world` — **atividade errada, obra nova**: `S-25`.

### 15.5 Cadeia redesenhada — `FASE A` e `FASE B` são **execuções separadas**

**`FASE A` — pré-condicionamento** (termina e é validada antes de a `FASE B` começar):

| # | Passo | Artefato |
|---|---|---|
| A1 | Cenas 4→10, convites 7 e 9 com `Continuar a história` | — |
| A2 | `Congrats`: dispensar **8** modais | — |
| A3 | Repouso `R-1` + `R-2''` + `R-3'` + `R-4` — **o tablet pode dormir** | `RK-A(n)`/`RK-B(n)` |
| A4 | Captura do *checkpoint* | **`CK-STORY-COMPLETE.tar`** |
| A5 | `CK-C1 × CK-STORY-COMPLETE` sob a *allowlist* §14.6 | veredito |

> 🔴 **`TAR-1B-C1` NÃO é capturado na `FASE A`.** A `FASE A` termina no `CK-STORY-COMPLETE`.
> O app fica onde está (`Congrats`); a tela pode apagar.

**`FASE B` — entrada real do `CASO 1`** (só começa após A5 validado):

| # | Passo | Observação |
|---|---|---|
| B1 | **Despertar** o tablet — `AppState → active` **absorvido aqui**, de propósito | é o momento do `W-1` |
| B2 | Rota §15.4, passos 1→5 — inclusive `Continuar depois` | `W-2` grava aqui |
| B3 | Parar na `StoryDetail`, sobre o *card* `Haja luz`, **sem tocá-lo** | última superfície antes da obra |
| B4 | Provar estabilidade de novo (`R-2''`, mesma mecânica, arquivos `RK-C(n)`/`RK-D(n)`) | — |
| B5 | Capturar **`TAR-1B-C1.tar`** | *baseline* verdadeiro |
| B6 | Tocar `Haja luz` — **`CASO 1` começa** | nenhuma outra interação entre B5 e B6 |

> 🔴 **Entre `B5` e `B6`: NADA.** Nem tocar, nem rolar, nem sair da tela, nem deixar dormir.
> Se o tablet dormir entre `B5` e `B6`, o despertar seguinte reabre a janela: **descartar `B5`**,
> refazer `B4`/`B5` com **novo** nome (`TAR-1B-C1-r2.tar`) e **preservar** o anterior.

**Como manter a tela acesa em `B4`/`B5` sem alterar configuração e sem tocar em nada com *handler*:**
a `StoryDetail` é `<AppScreen scroll …>` (`StoryDetailScreen.js:415-417`), e o `AppScreen` em modo
`scroll` renderiza um `ScrollView` **nu** — `ref`, `style`, `contentContainerStyle`,
`showsVerticalScrollIndicator`, e **nenhum** `onScroll`, `onMomentumScrollEnd` ou `refreshControl`
(`AppScreen.js:67-77`). **Um micro-arrasto vertical na área vazia é provadamente inerte**: não
navega, não escreve, não dispara *handler* algum. É o único gesto autorizado nessa janela — e só se
o `SCREEN_OFF_TIMEOUT_MS` lido em `B0` for menor que a janela. Nenhum `settings put`, nenhum
`keyevent`, nenhuma mudança no aparelho.

### 15.6 Os quatro papéis — **não se fundem**

| Artefato | Papel | Imutável? |
|---|---|---|
| `TAR-1.tar` | *baseline* **original** da entrada do `BLOCO A` | **sim** |
| `CK-C1-ROUTE-BLOCKED.tar` | **incidente**, progresso `3/10` | **sim** |
| `CK-STORY-COMPLETE.tar` | **fim do pré-condicionamento** (`FASE A`) | sim, após capturado |
| `TAR-1B-C1.tar` | **entrada imediata do `CASO 1`** (`FASE B`, pós-navegação) | sim, após capturado |

Nenhum substitui, renomeia ou aposenta outro. Nenhum é reutilizado como *baseline* do `CASO 10` —
esse continua sendo `TAR-C10-PRE` (§13.9).

### 15.7 `ALLOWLIST-NAV-C1` — janela `CK-STORY-COMPLETE → TAR-1B-C1`

Esta janela **não** é a do pré-condicionamento e **não** é a de nenhum caso. Tem lista própria,
**fechada em duas entradas**:

| # | Chave | *Writer* | Quando | Ocorrências |
|---|---|---|---|---|
| `W-1` | `@ptf_entitlement_v1` | `entitlementService.js:128-132` | **`B1`** — `AppState → active` do despertar | 0 ou 1 (**condicional**: a chave nunca apareceu em `TAR` algum; fonte `RevenueCat`, *fail-closed*) |
| `W-2` | `@ptf_creation_colorir_invite_shown_v1` | `coloring60JourneyInvite.js:41` via `StoryDetailScreen.js:273` | **`B2`** — foco da `StoryDetail` | **1** (`ADDED`, valor `'1'`) |

**Qualquer outra chave nesta janela = `STOP`.** Em particular, `@ptf_progress_creation`,
`@ptf_achievements_seen` e as duas `invite_seen` de marco **não** podem se mover aqui — se moverem,
o pré-condicionamento não havia terminado quando o `CK-STORY-COMPLETE` foi tirado.

`S-19` fica **REVISADO**: a exigência de "`0` mutações" passa a valer para a janela
`CK-STORY-COMPLETE → início da FASE B`. Dentro da `FASE B`, vale a `ALLOWLIST-NAV-C1`.

### 15.8 `STOP` adicionais

| # | Condição |
|---|---|
| `S-28` | Qualquer destino de captura preexistente — abortado por `throw` **antes** do redirecionamento (substitui a versão decorativa de `S-27`) |
| `S-29` | Qualquer `RK-*.bin` apagado, renomeado ou sobrescrito |
| `S-30` | Chave fora da `ALLOWLIST-NAV-C1` mutada entre `CK-STORY-COMPLETE` e `TAR-1B-C1` |
| `S-31` | Tablet dormir, ser tocado ou navegar entre `B5` e `B6` — `TAR-1B-C1` deixa de ser "imediatamente antes" |
| `S-32` | `PostStoryHub`, `Próxima aventura` ou o *card* de continuar da `Home` usados na rota — superfícies não auditadas |

### 15.9 O que esta emenda **NÃO** concede

| | |
|---|---|
| ⛔ | **Nenhum `PASS`** — `CASO 1` continua `NÃO EXECUTADO` |
| ⛔ | **Nenhuma** execução de `FASE A` e `FASE B` na mesma sessão de comandos |
| ⛔ | **Nenhuma** alteração de configuração do aparelho, `settings put`, `svc` ou `input` |
| ⛔ | **Nenhuma** exclusão de amostra, tentativa ou artefato |
| ⛔ | **Nenhum** `push`, `merge` ou alteração de código |

---

## 16. `EMENDA 4` — cancelamento do `B1`, tela que nunca podia apagar, `S-34`

> 🟢 **`CK-STORY-COMPLETE` está `APROVADO`** (laudo em `C:\tmp\ptf_evidencias\R2S2\CK-STORY-COMPLETE_LAUDO.txt`).
> Esta emenda corrige a **`FASE B`** antes do `B2`. Tablet no `Parabéns`, em primeiro plano,
> **nunca** foi a segundo plano. Nenhuma navegação executada.

### 16.1 O fato físico que derrubou a premissa

O `B0.1`/`B1` foi executado e devolveu:

```
RK-PRE-WAKE  = F84EF633361779A16521D907AA52E8692DBA5F9F11D301D9446A2802E598FEF1
RK-POST-WAKE = F84EF633361779A16521D907AA52E8692DBA5F9F11D301D9446A2802E598FEF1
```

**Mas não houve despertar.** O relato do operador: *"o tablet NUNCA apagou desde o
`CK-STORY-COMPLETE`. Ele permaneceu ligado na tela `Parabéns` durante todo o intervalo."*
Não houve transição de tela apagada para acesa, logo **`B1` não foi executado** — foi apenas uma
segunda amostra do banco.

Isso contradizia frontalmente a leitura `A0`: `screen_off_timeout = 30000` e
`stay_on_while_plugged_in = 0`. Trinta segundos de tempo-limite, e a tela seguiu acesa por dezenas
de minutos.

### 16.2 A causa — provada no código, não suposta

```tsx
// node_modules/expo/src/launch/withDevTools.tsx:8-20
// This hook can be optionally imported because __DEV__ never changes during runtime.
const useOptionalKeepAwake: (tag?: string) => void = (() => {
  ...
  const { useKeepAwake, ExpoKeepAwakeTag } = require('expo-keep-awake');
  return () => useKeepAwake(ExpoKeepAwakeTag, { suppressDeactivateWarnings: true });
})();
...
useOptionalKeepAwake();      // ← ativo por TODA a vida do app quando __DEV__
```

`expo-keep-awake@15.0.8` está instalado como dependência do próprio `expo`
(`package-lock.json:4665`). E o mecanismo no Android é **flag de janela**, não *wake lock*:

```kotlin
// expo-keep-awake/android/.../ExpoKeepAwakeManager.kt:36
activity.runOnUiThread { activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) }
```

> 🔴 **Em `__DEV__`, a raiz do app segura `FLAG_KEEP_SCREEN_ON` o tempo inteiro.**
> `screen_off_timeout` é **irrelevante** enquanto o app estiver em primeiro plano.

**Correção de premissa (`ponto 5`):** o `R-2'` da `EMENDA 2` §14.8 afirmava *"o aparelho **PODE**
dormir; o que não pode é ACORDAR"*. A primeira metade é **FALSA**: com o *dev client* em primeiro
plano, o aparelho **nunca pôde** dormir naturalmente. O desenho sobreviveu porque era conservador
nas duas direções, mas a premissa fica **corrigida e registrada como errada**. Nenhum resultado da
`FASE A` depende dela: a prova do `CK-STORY-COMPLETE` é a perícia de *storage*, com contabilidade
de *rowid* de folga zero.

### 16.3 `B1` — **CANCELADO DEFINITIVAMENTE** (não adiado, não substituído)

Cadeia lógica:

| | |
|---|---|
| 1 | Em `__DEV__`, o app segura `FLAG_KEEP_SCREEN_ON` (§16.2) |
| 2 | ⇒ a tela não apaga sozinha com o app em primeiro plano |
| 3 | ⇒ o app não vai a segundo plano sozinho |
| 4 | ⇒ `AppState` **nunca sai de `active`** |
| 5 | ⇒ o ouvinte de `entitlementService.js:128-132` **nunca volta a disparar** |
| 6 | ⇒ **`@ptf_entitlement_v1` não será escrito** |

> 🔴 **`W-1` é IMPOSSÍVEL no percurso natural desta sessão**, enquanto o *runtime* `DEV` permanecer
> em primeiro plano. A afirmação é condicional e o antecedente é verificável — não é fé.

**Por que não se fabrica o `wake`:** produzir a transição exigiria apertar o botão de energia,
o `Home`, os recentes ou disparar `adb keyevent` **de propósito**, só para gerar uma escrita que o
protocolo **jamais sofreria**. Isso não é reparar evidência — é **fabricar estado**, proibido desde
a abertura desta rodada. Absorver um evento previsto é correto; **provocá-lo é contaminar**.

`O-4` fica reforçado: `keyevent`, `input`, `svc` e `settings put` seguem proibidos — e agora também
o **botão físico de energia**, pelo mesmo motivo.

### 16.4 A cisão `FASE A` / `FASE B` **permanece** — agora por uma razão só

A cisão tinha **duas** justificativas. Uma caiu (`W-1`). A outra **não**:

> **`W-2` — `@ptf_creation_colorir_invite_shown_v1`**, gravada automaticamente no foco da
> `StoryDetail` (`StoryDetailScreen.js:273` → `coloring60JourneyInvite.js:41`), sem toque nenhum.
> Chave **AUSENTE** no `CK-C1` **e** no `CK-STORY-COMPLETE` (verificado direto no `SQLite`).

Enquanto existir um *writer* automático **dentro da rota de entrada**, o `TAR-1B-C1` tem de ser
capturado **depois** dele. A cisão continua obrigatória e a `ALLOWLIST-NAV-C1` (§15.7) segue válida,
com `W-1` agora marcado **`0` ocorrências esperadas** em vez de `0 ou 1`.

### 16.5 Artefatos preservados e **reclassificados**

Nenhum arquivo é apagado, renomeado ou sobrescrito. **Nome de arquivo não se corrige reescrevendo
evidência** — corrige-se no laudo:

| Arquivo | Nome de origem | **Classificação real** |
|---|---|---|
| `RK-PRE-WAKE.bin` | passo `B0.1` | **amostra de quiescência `Q-1`** |
| `RK-POST-WAKE.bin` | passo `B1` (não executado) | **amostra de quiescência `Q-2`** |

Os dois, somados ao `RK-B1` da `FASE A`, formam uma **prova tripla de quiescência**:

```
RK-B1 (21:07:16) = RK-PRE-WAKE = RK-POST-WAKE
                 = F84EF633361779A16521D907AA52E8692DBA5F9F11D301D9446A2802E598FEF1
```

Três leituras independentes, separadas no tempo, com o app **vivo e em primeiro plano** — evidência
**mais forte** do que o teste que o `B1` pretendia fazer. O `B1` não deixou lacuna; deixou reforço.

### 16.6 `S-34` — o app não vai a segundo plano até o fim do `CASO 1`

> 🔴 **Proibidos até o encerramento do `CASO 1`:** botão de energia, `Home`, botão de recentes,
> troca de aplicativo, notificação atendida, ou **qualquer** ida voluntária a segundo plano.

Se ocorrer por acidente: **não esconder**. Registrar a hora pela câmera externa, capturar um `RK`
novo com nome próprio, verificar se `@ptf_entitlement_v1` apareceu e — se o `TAR-1B-C1` já existir —
**descartá-lo logicamente** (nunca apagá-lo) e refazer `B4`/`B5` como `TAR-1B-C1-r2.tar`.

### 16.7 Duas simplificações que **fortalecem** o protocolo

| Item | `EMENDA 3` | **Agora** |
|---|---|---|
| Micro-arrasto vertical em `B3`/`B4`/`B5` | autorizado como gesto inerte | **REMOVIDO — desnecessário**; a tela não apaga |
| Janela `B4`/`B5` | toques inertes tolerados | **ZERO TOQUE** |
| `S-31` (tela apagar entre `B5` e `B6`) | risco real a vigiar | **estruturalmente impossível** com o app em primeiro plano; segue no papel apenas como rede de segurança de `S-34` |

"Zero toque" é estritamente mais forte que "toques provadamente inertes": elimina a classe inteira
de dúvida em vez de argumentar contra ela.

### 16.8 Canal de log

| | |
|---|---|
| `raw.log` | **PRESERVADO INTEGRALMENTE**, `87632782 B`, última escrita `20:29:13`. Não editado, não truncado, não reaproveitado. A lacuna da `FASE A` fica **documentada, não maquiada**. |
| `raw2.log` | **VIVO** — `34563961 B` → `34579668 B` em 8 s. `PS3` não interrompido. |

> ⚠️ **Declaração obrigatória sobre `raw2.log`:** os ~**34,5 MB iniciais** são o *dump*
> **retrospectivo** do *ring buffer* do `logcat` no instante do `B0`, **não** captura ao vivo. Só o
> que vem **depois** desse ponto é captura viva. Toda correlação tem de declarar de qual dos dois
> trechos veio a linha, além do `OFFSET_MS=+10799`.
>
> 🟢 **Bônus:** esse *dump* retrospectivo **pode conter parte da janela `20:55-21:07`** perdida na
> `FASE A`. Vale procurar depois — recuperação gratuita, sem custo probatório, e nunca substitui o
> que se perdeu, apenas complementa.

### 16.9 Correção da condição empírica — `dumpsys` é **informativo**, nunca reprova

A `EMENDA 3` propunha exigir um *wake lock* visível em `dumpsys power` para autorizar `B2`.
**Exigência retirada**, e o fundador está tecnicamente certo: o mecanismo é
`FLAG_KEEP_SCREEN_ON` **na janela da `Activity`** (`ExpoKeepAwakeManager.kt:36`), **não** um
`PowerManager` *wake lock* — logo a seção `Wake Locks` do `dumpsys power` legitimamente **pode não
listá-lo**.

| Leitura | Papel |
|---|---|
| `dumpsys power` | **informativa**, opcional |
| `dumpsys window` / `FLAG_KEEP_SCREEN_ON` | **informativa**, opcional, corroborante |

> 🔴 **A ausência de uma *string* específica em qualquer `dumpsys` NÃO reprova o portão.**
> A representação do `dumpsys` varia por versão e por OEM; ausência de *string* não é ausência de
> fato. O portão se apoia em evidência positiva, não em ausência de texto.

### 16.10 **Texto final da condição que autoriza `B2`**

> **`B2` está AUTORIZADO** quando, e somente quando, as seis evidências abaixo forem
> **simultaneamente** verdadeiras — todas positivas, nenhuma por ausência de *string*:
>
> 1. `RK-B1` = `RK-PRE-WAKE` = `RK-POST-WAKE` = `F84EF633361779A16521D907AA52E8692DBA5F9F11D301D9446A2802E598FEF1` — quiescência tripla do `RKStorage`;
> 2. `raw2.log` **vivo e crescendo**, com `PS3` ininterrupto;
> 3. `raw.log` **preservado integralmente**, não editado, não truncado, não reaproveitado;
> 4. app **continuamente em primeiro plano** na tela `Parabéns`, sem nenhuma ida a segundo plano;
> 5. **nenhuma** interação de *background* ocorrida — nem acidental, nem provocada;
> 6. **prova de código** de que o *runtime* `DEV` ativa o mecanismo *keep awake*
>    (`withDevTools.tsx:8-20` + `ExpoKeepAwakeManager.kt:36`), tornando `W-1` impossível no percurso
>    natural desta sessão.
>
> Leituras de `dumpsys` são **informativas** e **não** integram esta condição.
> Satisfeitas as seis, a `FASE B` prossegue **direto do `B2`**, sob `S-34`, com `B4`/`B5` em
> **zero toque**.

### 16.11 O que esta emenda **NÃO** concede

| | |
|---|---|
| ⛔ | **Nenhum** `PASS` — `CASO 1` continua `NÃO EXECUTADO` |
| ⛔ | **Nenhuma** fabricação de `sleep`/`wake`, por botão físico ou por `adb` |
| ⛔ | **Nenhuma** exclusão, renomeação ou sobrescrita de artefato — inclusive os de nome agora impróprio |
| ⛔ | **Nenhuma** interrupção, limpeza ou edição de `raw.log` / `raw2.log` |
| ⛔ | **Nenhuma** alteração de configuração do aparelho |
| ⛔ | **Nenhum** `push`, `merge` ou alteração de código |

---

## 17. `EMENDA 5` — `CASO 1` = `PASS` formal · **PAUSA CONTROLADA PÓS-`CASO-1`**

> 🟢 **`CASO 1` ENCERRADO FORMALMENTE COM `PASS`.**
> Laudo integral: `C:\tmp\ptf_evidencias\R2S2\CASO1_LAUDO.txt` (fora do Git, untracked).
> A `R2 Sessão 2` fica **PAUSADA CONTROLADAMENTE ENTRE `CASO 1` E `CASO 15`** — **não** encerrada.

### 17.1 Veredito formal

| Eixo | Resultado |
|---|---|
| **Persistência** | 🟢 **`PASS`** |
| **Visual** | 🟢 **`PASS`** |
| **`CASO 1`** | 🟢 **`PASS`** |

Observação física em **~22:20 de 11/08/2026**. **Evidência externa em vídeo registrada** pelo
fundador — peça soberana do eixo visual, mantida fora do Git e não reconstruída por este laudo.

### 17.2 Artefatos da janela probatória

| | |
|---|---|
| **Baseline** `TAR-1B-C1.tar` | `Length = 17139712` · `SHA256 = F7AA94237284347972149593872CFD4DE4E3FB5CDD6CF01F2F31A270CEA8BF6C` |
| **Pós** `TAR-1B-C1-POST.tar` | `Length = 17139712` · `SHA256 = 3442F114FD95AFF466EFF6664C53B6A402DE6B3A6A9EAC4439885D8B1DD59BA2` |

**Mesmo `Length`, `SHA256` diferentes** — resolvido por perícia de conteúdo, **não** por inferência:
o `TAR` é container de blocos de `512 B` com *padding*, logo um arquivo interno pode mudar de
conteúdo e de tamanho sem alterar o total de blocos.

### 17.3 A diferença é **uma só**

```
ESCOPO_OK=SIM
FILES_ADDED=0   FILES_CHANGED=1   FILES_DELETED=0
KEYS_ADDED=0    KEYS_CHANGED=0    KEYS_DELETED=0   KEYS_ROWID_MOVED=0
FILE_CHANGED=shared_prefs/WebViewChromiumPrefs.xml
```

**Justificativa PRÉ-REGISTRADA — não é allowlist retroativa.** Quatro provas positivas:

| | |
|---|---|
| 1 | **Nenhum** código do projeto escreve o arquivo — varredura por `WebViewChromiumPrefs`/`CachedFlags` no repositório: **zero** ocorrências. O dono é o `Chromium` do sistema. |
| 2 | `mtime 22:20:15` casa ao segundo com `22:20:15.636 cr_WebViewApkApp: version=150.0.7871.181 (787118103)` — e `787118103` é **exatamente** o `lastVersionCodeUsed` do arquivo. |
| 3 | Pré-declarado em `11_PREP_LEGADO_02.md:329` e em `docs/DECISIONS.md` ("Allowlist física corrigida"): *"Abrir a WebView é o que muda este arquivo. **Infraestrutura, não produto.**"* |
| 4 | O registro do `BLOCO 0` (`G-10_A_G-14_REGISTRO.txt`, item 3) já documentara a oscilação **no sentido inverso**: *"`377 → 127 B` … cache de feature flags do `Chromium`, **re-populado pelo WebView a cada inicialização**."* |

**Prova de retorno byte a byte ao estado já congelado:**

```
PRE-EXTRACTED          377 B  4ddc93412df13b854dbbfcd8582a2b7e71cedf5efa1ee1a0519cfc679db37282
REF-POST03             377 B  4ddc93412df13b854dbbfcd8582a2b7e71cedf5efa1ee1a0519cfc679db37282   <== PREP-03
TAR1BC1POST-EXTRACTED  377 B  4ddc93412df13b854dbbfcd8582a2b7e71cedf5efa1ee1a0519cfc679db37282   <== agora
```

> 🟢 O arquivo **não mutou para um estado novo: RETORNOU, byte a byte, ao estado que a referência
> congelada da `PREP-03` já registrava.** O *cold start* com `--clear` zerara o cache; a primeira
> abertura de `WebView` o repôs de forma determinística e idêntica. `lastVersionCodeUsed` **inalterado**.

### 17.4 Persistência — a prova central

| | |
|---|---|
| `MAX_ROWID` baseline → pós | **`67` → `67`** |
| **Rowids consumidos** | **`0`** |
| `catalystLocalStorage` idêntico em `(rowid, chave, valor)` | ✅ **sim** |
| `files/ptf_blobs` | ✅ **byte a byte inalterado** (3 arquivos) |
| `_ptf_drawing60_screation_alight.a.png` | ✅ **preservado**, `200565 B`, `6814dee7975f95d126eab69ddae3e46c2bf59892da429611b1141773e1c83f81` — **idêntico** em `TAR-1`, `PRE`, `CK-C1`, **`REF-POST03`** e `POST` |

`AsyncStorage` grava com `INSERT OR REPLACE`: **toda** escrita consome *rowid*, inclusive a que fosse
depois sobrescrita — que um diff de valores jamais veria. **Zero *rowid* consumido** significa que não
houve **nem sequer uma tentativa** de escrita mascarada.

> 🔴 **Abrir "Haja luz" e apenas observar NÃO REALIZOU NENHUMA ESCRITA.**

### 17.5 Os dois *writers* automáticos

| | |
|---|---|
| **`W-2`** `@ptf_creation_colorir_invite_shown_v1` | ✅ **ocorreu ANTES do baseline**, em **`rowid 67`**, valor `"1"` — exatamente conforme a previsão nominal da `EMENDA 4` §16.4. A cisão `FASE A`/`FASE B` cumpriu sua função: manteve `W-2` **fora** da janela de medição do `CASO 1`. |
| **`W-1`** `@ptf_entitlement_v1` | ✅ **PERMANECEU AUSENTE** — confirma a previsão da `EMENDA 4` §16.3 (`FLAG_KEEP_SCREEN_ON` em `__DEV__` ⇒ `AppState` nunca sai de `active`). |

### 17.6 Marcadores congelados — previsão pré-registrada cumprida

O `G-13` do `BLOCO 0` registrou, **antes** desta execução: *"`COLORING_STATE_COUNT=0` … **será o
marcador do `Caso 1`**."*

| Marcador | Janela `22:19:30–22:22:30` |
|---|---|
| **`M+2`** `[COLORING_STATE] load OK espacoLogico=` | 🟢 **PRESENTE — `1×`** |
| `M-1` `load OK W=` | ⚪ **AUSENTE** |
| `M-2` `incompatible saved state ignored` | ⚪ **AUSENTE** |
| `M-3` `saved state invalid/incompatible` | ⚪ **AUSENTE** |

Os três negativos são as assinaturas de falha do *runtime* **HISTÓRICO**. Todos ausentes: o *runtime*
canônico carregou a obra legada **sem descartar, ignorar nem invalidar** o estado salvo.
`2964` linhas na janela, **todas** as linhas `ReactNativeJS` sob **`PID 18029`** — idêntico ao `PID`
probatório congelado no `G-13`. O processo **não** reiniciou.

### 17.7 Ramo `v2-legado` — carregado com sucesso

```
22:20:16.256  PAINT_BRANCH:{"ramo":"v2-legado","candidato":true}
22:20:16.274  LOAD_PAINT_BRANCH:{"ramo":"v2-legado","candidato":true}
22:20:16.400  [COLORING_STATE] load OK espacoLogico=1122x1402 origem=6,186 1428x1784
```

Geometria de carga **idêntica** à de projeção (`espacoLogico=1122x1402 projecao x=6 y=186 w=1428 h=1784`):
mesma dimensão lógica, mesma origem, mesma área — **sem deslocamento, sem reescala, sem corte**.
O caminho de compatibilidade legada foi **exercido e bem-sucedido**.

### 17.8 Pendências que **permanecem abertas**

| | |
|---|---|
| **`ACHADO-V1`** (imagens das cenas `5..10` não carregadas na `FASE A`) | 🟡 **CONGELADO e NÃO INVESTIGADO.** Não afetou o `CASO 1`: a imagem-base do editor `C60` carregou normalmente (`uriLen=1149046`, `naturalSize=1122x1402`). Investigação em spec própria, fora desta janela probatória. |
| **`CASO 15`, `CASO 14`, `CASO 16`, `CASO 10`** | ⛔ **NÃO EXECUTADOS** |
| **Ressalva de escopo do `CASO 1`** | Mediu **abrir e observar**. **Não** mediu desenhar, salvar, girar nem recarregar. |

### 17.9 **CONTRATO DE RETOMADA** — vinculante

| | |
|---|---|
| **A** | **`TAR-1B-C1-POST` é o estado probatório final do `CASO 1`.** É o marco contra o qual a retomada será comparada. |
| **B** | Após o fechamento desta pausa, o fundador **poderá bloquear fisicamente o tablet**. 🔴 **A partir desse ato, `S-34` se extingue e NÃO se presume mais continuidade de *foreground* nem ausência de *writes* de *lifecycle*.** Em particular, `W-1` (`@ptf_entitlement_v1`) passa a ser **esperado**, pois o retorno de `AppState` a `active` dispara `entitlementService.js:128-132`. |
| **C** | Na retomada, **não reutilizar `raw2.log`**. Abrir **canal novo** (ex.: `raw3.log`), com `raw.log` **e** `raw2.log` preservados integralmente — não editados, não truncados, não reaproveitados. |
| **D** | Antes do `CASO 15`, capturar **novo estado de entrada com nome próprio** (ex.: `CK-RESUME-01.tar`) e compará-lo com `TAR-1B-C1-POST`, **identificando explicitamente** cada mutação ocorrida durante suspensão/retomada. |
| **E** | 🔴 **Nenhuma mutação de *lifecycle* da pausa pode contaminar o baseline do `CASO 15`.** O caso só começa depois de **nova estabilidade** (`R-2''`: duas capturas `RK` idênticas, nenhuma descartada) **e** de um **`TAR` de baseline próprio** do `CASO 15`. |
| **F** | 🔴 **Nenhum artefato existente pode ser apagado, sobrescrito ou renomeado** — inclusive os de nome impróprio (`RK-PRE-WAKE.bin`, `RK-POST-WAKE.bin`, reclassificados `Q-1`/`Q-2` na §16.5). |
| **G** | ⛔ **Nenhum caso seguinte é iniciado fisicamente hoje.** |

### 17.10 Previsão falsificável registrada **antes** da retomada

O cache de *feature flags* do `Chromium` **já está populado** neste processo. Portanto, nas próximas
aberturas de `WebView` **sem *cold start***, `shared_prefs/WebViewChromiumPrefs.xml` deve permanecer
em `377 B` / `4ddc9341…` e o comparador deve devolver `FILES_CHANGED=0`.

> 🔴 **Se voltar a mudar, a explicação da §17.3 está ERRADA e vira `STOP`.**

### 17.11 O que esta emenda **NÃO** concede

| | |
|---|---|
| ⛔ | **Nenhum** `PASS` a `CASO 15`, `14`, `16` ou `10` — seguem **não executados** |
| ⛔ | **Nenhuma** conclusão sobre desenhar, salvar, girar ou recarregar obra legada |
| ⛔ | **Nenhum** encerramento da `R2 Sessão 2` — é **pausa**, não fecho |
| ⛔ | **Nenhuma** investigação ou normalização do `ACHADO-V1` |
| ⛔ | **Nenhuma** exclusão, renomeação ou sobrescrita de artefato |
| ⛔ | **Nenhum** `push`, `merge` ou alteração de código |
