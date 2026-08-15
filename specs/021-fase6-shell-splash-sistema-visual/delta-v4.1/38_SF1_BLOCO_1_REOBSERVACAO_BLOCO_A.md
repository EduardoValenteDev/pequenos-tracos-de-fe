# 38 · `SF1` Bloco 1 — protocolo fechado de reobservação do `BLOCO A` da `R2`

> **Natureza deste artefato:** documentação pura. Preparação, **não** execução.
> Nenhum portão é concedido aqui. Nenhum `PASS` é declarado aqui. O tablet **não foi tocado**
> na produção deste documento e **não deve ser tocado** até o `HUMAN GATE` físico da §12.

- **Worktree:** `c:\tmp\ptf_fase6_shell_splash_wt`
- **Branch:** `feat/fase6-shell-splash`
- **`HEAD` na abertura:** `e88981e`
- **Antecedente direto:** [`37_RECONCILIACAO_POS_R2_E_PREPARO_SG_A.md`](37_RECONCILIACAO_POS_R2_E_PREPARO_SG_A.md)
- **Decisão que originou este artefato:** `D-FUND-SG-A-S01-REOBSERVAR-01`
  ([`docs/DECISIONS.md`](../../../docs/DECISIONS.md))
- **Fontes normativas do conteúdo:**
  [`10_RODADA_FISICA_2_F6_SG_A.md`](10_RODADA_FISICA_2_F6_SG_A.md) (roteiro original do `BLOCO A`)
  e [`14_R2_SESSAO_2.md`](14_R2_SESSAO_2.md) (método efetivamente empregado, `EMENDA 1` e `EMENDA 5`)

---

## 1 · O que este artefato fecha, e o que não fecha

| Bloco de `SF1` | Escopo | Roteiro gesto a gesto | Onde |
|---|---|---|---|
| **Bloco 1** | `BLOCO A` da `R2`: casos `1`, `15`, `14 v2`, `16`, `10` | **FECHADO por este artefato** | §6–§9 |
| **Bloco 2** | `R3` — *resize* / multi-janela, 18 gestos | **JÁ FECHADO** | `37` §9 |
| **Bloco 3** | `R5` — `E1`, `E4`, `E5`, `E6`, §28 `#7`, painéis de recusa, `TA-5R` | **NÃO FECHADO** | §11 |

**Declaração explícita, para não induzir a erro:** `SF1` **não** está integralmente preparada.
O Bloco 3 tem **escopo e resultado esperado** definidos em
[`06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md`](06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md)`:285` e
`:418-443`, mas **não** tem roteiro gesto a gesto. Ver §11.

---

## 2 · O que `S0.1 = REOBSERVAR` decide — e o que não decide

O fundador respondeu **uma palavra**: `REOBSERVAR`. Conforme `§9` da missão, nada além disso
lhe é atribuído. O conteúdo normativo está lavrado em `D-FUND-SG-A-S01-REOBSERVAR-01`. Em resumo
operacional:

- **Decidido:** os cinco casos do `BLOCO A` serão **reobservados sobre o binário atual**.
- **Não decidido, e portanto não vale:** anulação do `PASS` histórico · concessão de `F6-SG-A` ·
  reabertura da `R2` prospectiva `B`–`E` · reabertura do `CASO 9` ou do `CASO 12` ·
  reclassificação de `CASO 14 v1` · criação de `AC_5` · edição de `compare_state.py` ·
  **qualquer autorização para tocar no tablet agora**.

**Coexistência das duas provas.** A reobservação **não substitui** o registro histórico. Ao final
haverá dois vereditos legítimos, cada um verdadeiro sobre o seu binário:

```
CASO 1/15/14v2/16/10 · binário 92781ea .... PASS  (histórico, íntegro — 14_R2_SESSAO_2.md:3031)
CASO 1/15/14v2/16/10 · binário atual ....... a colher em SF1 Bloco 1
```

Somente o segundo alimenta `F6-SG-A`.

---

## 3 · Por que o roteiro original do doc `10` **não** pode ser copiado como está

O doc `10` prescreve um par de `TAR` **para o bloco inteiro** (`TAR-1` antes de tudo, `TAR-2`
depois de tudo) e adjudica pela igualdade do par. **Esse método foi superado na prática**, e
copiá-lo hoje produziria uma prova **mais fraca** do que aquela que a reobservação existe para
renovar — o que seria absurdo.

O que a execução histórica de fato construiu, e que **precisa ser carregado adiante**:

| # | Refinamento | Origem | Por que é indispensável |
|---|---|---|---|
| R-1 | **Par de `TAR` por caso**, não por bloco | `14:1612-1691` (`EMENDA 5`) | Um par por bloco não diz **qual** caso escreveu. Um `FAIL` vira uma investigação, não um veredito. |
| R-2 | **Cisão `FASE A` / `FASE B`** | `14:1612-1691` | Mantém o escritor automático `W-2` **fora** da janela de medição. Sem isso, `W-2` contamina o `CASO 1` e simula gravação. |
| R-3 | **`rowid` e `MAX_ROWID`** obrigatórios | `14:148-155` | `AsyncStorage` grava com `INSERT OR REPLACE`: **uma reescrita idempotente é invisível a um comparador de valores**. Sem `rowid`, uma gravação mascarada passa como zero. |
| R-4 | **Classes de adjudicação `AC-1`..`AC-4`** | `14:3031-3139` | Vocabulário fechado para escritores de infraestrutura. **`AC-5` é proibido criar.** |
| R-5 | **Allowlist de infraestrutura pré-registrada** | `14:1612-1691` | `shared_prefs/WebViewChromiumPrefs.xml` foi justificado por quatro provas **pré-registradas** — não por allowlist retroativa. A ordem importa: pré-registro é prova, pós-registro é desculpa. |
| R-6 | **`CASO 10` em três subjanelas** | `14:3031-3139` | metade `C60` · fronteira · metade Ateliê, com `TAR-C10-PRE`, `CK-C10-C60`, `CK-C10-FRONTEIRA`, `TAR-C10-POST`. |
| R-7 | **`TAR-1 × TAR-2` é inventário de encerramento** | `14:3031-3139` | **Não** é um portão agregado de sete zeros. O agregado histórico foi `FILES_CHANGED=5 KEYS_ADDED=4 KEYS_CHANGED=1 KEYS_ROWID_MOVED=2` **e ainda assim o bloco fechou `PASS`**, porque a adjudicação é **por caso**. |

**`ERRATA` ao artefato `37`:** o `37` descreve o `CASO 10` como exigindo "*baseline imediatamente
antes*". A redação é imprecisa por omissão — está correta, mas incompleta. Ver §10 deste artefato.

---

## 4 · ⛔ BLOQUEIO CAUSAL — `ARB-ARBITRO` precisa ser respondido **antes** de `SF1`

Este é o achado material deste artefato, e ele **impede o início da sessão física**.

### 4.1 · O fato

`D-FUND-R2-PROSPECTIVE-STATE-ARBITER-01` abre com (`docs/DECISIONS.md:4111`, literal):

> Decisão **do fundador**, aplicável **somente de forma prospectiva** à campanha `B`–`E`.

Uma reobservação do `BLOCO A` **não é** a campanha `B`–`E`. Logo, hoje, o arcabouço de
adjudicação **não a alcança**.

### 4.2 · Por que isso não é formalismo

Não se trata de poder ou não **rodar** `compare_state.py` — rodar é medir, e medir é sempre
permitido. O que está fora de escopo é o **arcabouço que interpreta o que a medição devolve**.
E a medição **vai** devolver superfícies que só esse arcabouço classifica:

- O item `7` da decisão é justamente a lista de superfícies de infraestrutura já classificadas —
  `WebViewChromiumPrefs.xml`, `profileInstalled`, `android.app.ActivityThread.IDS.xml`,
  `expo.modules.devlauncher.recentlyopenedapps.xml`, `DevLauncherApp-*DevBundle.js`,
  `storage-info.pb`. **Prova de que elas aparecem:** a janela histórica do `CASO 1` produziu
  exatamente **uma** diferença, e foi `shared_prefs/WebViewChromiumPrefs.xml` (`14:1612-1691`).
  Ela vai reaparecer.
- O item `8` é a **única regra autorizada** para um caminho mutado que ninguém classificou:
  `escritor novo ⇒ HARD STOP`, e **`É proibido criar AC_5`**.

Sem extensão de escopo, o operador que encontrar uma dessas superfícies fica sem regra
autorizada: não pode aplicá-la (fora de escopo), não pode improvisar outra (item `8` proíbe), e
não pode reprovar o caso por um *bookkeeping* de plataforma sem falsificar o veredito.

**Agravante do binário novo.** O binário mudou. Superfícies que a pré-registração histórica do
`BLOCO A` não conhecia — várias das que constam do item `7` **foram descobertas durante `B`–`E`,
depois do `BLOCO A`** — têm probabilidade alta de aparecer. É exatamente o cenário que o item `8`
endereça, e é exatamente o cenário fora de escopo.

### 4.3 · As duas saídas, com recomendação

| Saída | O que é | Consequência |
|---|---|---|
| **A — estender o escopo** *(recomendada)* | Uma decisão do fundador declarando que os itens `1`, `3`–`8` de `D-FUND-R2-PROSPECTIVE-STATE-ARBITER-01` valem também para a reobservação do `BLOCO A` sobre o binário atual. **Não** edita `compare_state.py`, **não** cria `AC_5`, **não** altera relatório histórico. | `SF1` Bloco 1 executa com rigor **igual ou superior** ao da prova histórica. Custo: uma decisão. |
| **B — método histórico puro** | Reobservar usando só a pré-registração por caso do `BLOCO A` (`EMENDA 5`), sem o arcabouço. | Qualquer superfície fora da pré-registração histórica força **`STOP`** e retorno ao fundador **no meio da sessão física**, com o tablet aberto e o cronômetro correndo. Risco alto de sessão perdida. |

**Recomendação:** saída **A**. É a única que preserva a proporcionalidade entre o custo da sessão
física e a força da prova colhida.

> **Enquanto `ARB-ARBITRO` não for respondido, `SF1` não começa** — e, como a ordem interna
> `Bloco 1 → Bloco 2 → Bloco 3` é causal e não negociável (§5.3), o bloqueio do Bloco 1 bloqueia
> **toda** a `SF1`.

---

## 5 · Pré-condições

### 5.1 · Bloco comum `C-1`..`C-11` (`10:213-225`) — vale integralmente

Sem repetir o texto normativo, os pontos que mais custam quando esquecidos:

- **`C-1`** — as **quatro confirmações de sessão**. *"Sem as quatro, nenhum `PASS`."*
- **`C-6`** — invariantes **ZERO**.
- **`C-8`** — superfície de abertura **não é** portão.
- **`C-10`** — *"um `FAIL` impede `F6-SG-A`"*.
- **`C-11`** — **NUNCA desinstalar. `pm clear` PROIBIDO.**

### 5.2 · Captura (`10:203-205`, literal)

> ⛔ **Proibido Samsung SmartCapture. Proibido gravação de tela.** Use **câmera externa**.

Motivo registrado: gravação de tela disputa GPU/*encoder* e altera o próprio fenômeno observado.

### 5.3 · Ordem interna de `SF1` — causal, não preferencial

```
Bloco 1 (BLOCO A · leitura pura) → Bloco 2 (R3 resize) → Bloco 3 (R5)
```

O Bloco 1 é **leitura pura** e prova que **nada foi escrito**. Os Blocos 2 e 3 **mutam o acervo**
(o `R5` chega a injetar estado: `E4` *lineart* divergente, `E5` *payload* corrompido, `E6` acervo
misto). Executar 2 ou 3 antes de 1 contamina irreversivelmente a janela de medição do Bloco 1.
**A ordem não pode ser trocada para contornar o bloqueio da §4.**

### 5.4 · Metro e `adb reverse`

- Metro em **8082** é **`PARE`** (`10:154-155`).
- `adb reverse --list` deve mostrar **exatamente um** mapeamento relevante contendo
  `tcp:8081 tcp:8081`. **Prefixo `UsbFfs` é permitido — o portão não é literal** (`10:170-171`).
- Lembrete de armadilha já registrado: `adb reverse` indexa pela porta **remota**;
  `tcp:8081 tcp:8082` **substitui** `tcp:8081 tcp:8081` em vez de somar.

---

## 6 · Bloco 0 — pré-voo e **insumo-check somente-leitura**

O acervo de hoje **não é** o estado de entrada histórico. Entre então e agora a sessão histórica
concluiu 7 cenas extras, dispensou conquistas, executou o `CASO 1` e percorreu os Blocos `B`–`E`,
incluindo as mortes `E0` do `CASO 12`. **Cada insumo precisa ser confirmado, não presumido.**

### 6.1 · Passos (adaptados de `10:289-306`)

| # | Passo | Observação |
|---|---|---|
| 1 | Confirmar dispositivo, binário e as quatro confirmações `C-1` | |
| 2 | Metro vivo em **8081**; conferir `adb reverse --list` | §5.4 |
| 3 | Confirmar `run-as` disponível: `adb shell run-as com.valentedev.pequenostracosdefe ls -la` | Se indisponível, ver §6.3 |
| 4 | Câmera externa posicionada e testada | §5.2 |
| 5 | **`TAR-SF1-BASE`** — captura de linha de base, **antes de abrir qualquer obra** | §6.2 |
| 6 | `force-stop` + `logcat -c` | **Único momento autorizado para limpar o `logcat`** (`10:289-306`) |
| 7 | Bloco `PS3` de captura antes de abrir o app | |
| 8 | *Deep link* de abertura; **anotar o `PID`** | |
| 9 | **Insumo-check** — §6.4 | Somente leitura |
| 10 | Registrar `CK-0` | |

### 6.2 · Rota do `TAR` — `cmd.exe` é **obrigatório** (`10:236-254`)

`adb exec-out … > arquivo.tar` **corrompe o `TAR`** no PowerShell. A saída binária precisa ser
roteada por `cmd.exe`:

```powershell
adb shell run-as com.valentedev.pequenostracosdefe ls -la
New-Item -ItemType Directory -Force C:\tmp\ptf_evidencias\SF1_BLOCO1 | Out-Null
cmd.exe /c "adb exec-out run-as com.valentedev.pequenostracosdefe tar cf - files databases shared_prefs > C:\tmp\ptf_evidencias\SF1_BLOCO1\TAR-SF1-BASE.tar"
Get-Item     C:\tmp\ptf_evidencias\SF1_BLOCO1\TAR-SF1-BASE.tar | Select-Object Name,Length
Get-FileHash C:\tmp\ptf_evidencias\SF1_BLOCO1\TAR-SF1-BASE.tar -Algorithm SHA256
tar -tf      C:\tmp\ptf_evidencias\SF1_BLOCO1\TAR-SF1-BASE.tar | Select-Object -First 20
```

**Aceite** (`10:254`): tamanho plausível · `SHA256` registrado · `tar -tf` **lista** conteúdo ·
presença de `files/`, `databases/`, `shared_prefs/`.

**Advertência que não pode ser esquecida** (`10:263-265`, literal):

> ⚠️ **`SHA256` do TAR é indicador, não veredito.** … **`True` prova identidade; `False` NÃO prova
> gravação.**

Um `False` abre **investigação de conteúdo**, não um `FAIL`.

### 6.3 · Se `run-as` estiver indisponível (`10:267-270`)

Registrar a limitação e seguir com inventário **visual apenas**. Nesse caso os casos **6, 10, 11 e
16** tornam-se **`PARCIAL`**, e — literal — *"isso **precisa constar do veredito**, jamais ser
mascarado como `PASS` pleno"*.

### 6.4 · Insumo-check — o que **precisa existir** no acervo, por caso

| Caso | Insumo obrigatório | Se ausente |
|---|---|---|
| `CASO 1` | uma **obra antiga** reabrível | `STOP` — reportar, **não** fabricar |
| `CASO 15` | obra **sem `paintSchemaVersion`** | `STOP` — reportar |
| `CASO 14 v2` | obra **anterior à Fase 6** | **`PARE e reporte`** — literal em `10:335-405`: *"Não fabricar obra 'legada'"* |
| `CASO 16` | obra armazenada como **ponteiro `v:3`** | `STOP` — reportar |
| `CASO 10` | obra `C60` **e** obra de Ateliê | `STOP` — reportar |

### 6.5 · Rota de acesso do `CASO 1` — verificar, não presumir

`EMENDA 1` (`14:675-779`) registra o incidente de rota, classificação `D (A+B)`. A rota do convite
de marco (`NarrationScreen.js:246`) está **fechada por contrato**, porque
`@ptf_coloring60_done_creation_light='true'`. Literal:

> **Obra legada autêntica e convite de primeira vez não coexistem em nenhum estado do mundo.**

- **Rota viável:** [`StoryDetailScreen.js:375`](../../../src/screens/StoryDetailScreen.js#L375),
  que exige `unlocked={isCompleted}` ⇒ história **10/10**.
- **Expectativa a confirmar (não a presumir):** a história foi concluída na sessão histórica, então
  a rota **deve** estar aberta hoje. **Confirmar em tela antes de contar como rota disponível.**
- **Excluídos por decisão do fundador:** `Coloring60LabScreen` e `__devResetCreationColoring60()`.
- `CongratsScreen.js:170` abre a atividade **errada** — não usar.

### 6.6 · `ALLOWLIST PRE-STORY-COMPLETE` (`14:675-779`)

Se for necessário completar história antes do `CASO 1`, as **únicas** chaves autorizadas a mudar
são `@ptf_progress_creation` (7×) e `@ptf_achievements_seen` (8×).
Literal: **"Qualquer outra chave = `STOP`."**

---

## 7 · Bloco 1 — protocolo fechado, caso a caso

### 7.0 · Regra que governa o bloco inteiro (`10:329-333`, literal)

> **BLOCO A — leitura pura**: nenhum traço, nenhum salvamento, nenhum encerramento… **Qualquer
> desenho acidental invalida o par `TAR-1`/`TAR-2` e, com ele, o caso 10.**

**Ordem canônica de execução — não reordenar:**

```
TAR-SF1-BASE → CASO 1 → CASO 15 → CASO 14 v2 → CASO 16 → CASO 10 → TAR-SF1-FIM → comparação
```

Cada caso abaixo segue o mesmo esqueleto de seis tempos:

```
[PRÉ]  TAR do caso  ·  MAX_ROWID  ·  pré-registro das superfícies esperadas
[A]    FASE A — ações preparatórias fora da janela de medição (deixa W-2 acontecer aqui)
[CK]   checkpoint: reconfirmar MAX_ROWID — este é o início real da janela
[B]    FASE B — o gesto observado do caso, leitura pura
[POST] TAR pós-caso  ·  MAX_ROWID  ·  captura por câmera externa
[ADJ]  adjudicação por caso (§8)
```

---

### 7.1 · `CASO 1` — `TK-A-063` · obra antiga reabre alinhada

- **Evidências:** `TAR-SF1-C1-PRE` / `TAR-SF1-C1-POST`
- **`FASE A`:** navegar até a lista de obras pela rota da §6.5, **sem abrir** nenhuma obra.
  Deixar o escritor automático `W-2` ocorrer aqui, **antes** do checkpoint.
- **`CK`:** reler `MAX_ROWID`. **A janela de medição começa neste ponto.**
- **`FASE B`:** abrir **uma** obra antiga em **RETRATO**. **Apenas observar.** Não traçar, não
  salvar, não encerrar.
- **Critério de `PASS`** (`10:335-405`, literal): *"A pintura **aparece** e está **alinhada ao
  lineart**. Não abre em branco."*
- **Esperado na adjudicação** (referência histórica, `14:1612-1691`): `MAX_ROWID` **inalterado**,
  **`rowids` consumidos = 0**, diferença única e classificável em `shared_prefs/`.
  Literal do histórico: *"**Abrir 'Haja luz' e apenas observar NÃO REALIZOU NENHUMA ESCRITA.**"*

---

### 7.2 · `CASO 15` — `TK-A-077` · obra sem `paintSchemaVersion`

- **Evidências:** `TAR-SF1-C15-PRE` / `TAR-SF1-C15-POST`
- **`FASE B`:** abrir a obra **sem `paintSchemaVersion`**. Apenas observar.
- **Critério de `PASS`:** a ausência de `paintSchemaVersion` é *"tratada como **legada, sem erro**"*.
- **⚠️ Delimitação que evita um `FAIL` falso** (`10:335-405`, literal):
  *"Os painéis 'não consegui abrir' **NÃO são deste caso na `R2`** — são `R5`."*
  Se um painel de recusa aparecer aqui, **não** é `FAIL` do `CASO 15`: é observação a encaminhar ao
  Bloco 3.
- **Precedente processual:** na execução histórica este caso passou na **tentativa 2**; a
  tentativa 1 foi preservada como `STOP_INFRA_UNREGISTERED`. Uma segunda tentativa é legítima
  **desde que a primeira seja preservada integralmente no relatório**.

---

### 7.3 · `CASO 14 v2` — `TK-A-076` · obra anterior à Fase 6

- **Evidências:** `TAR-SF1-C14-PRE` / `TAR-SF1-C14-POST`
- **Pré-condição dura** (`10:335-405`, literal): *"**Se não houver obra anterior à Fase 6 no acervo,
  PARE e reporte.** Não fabricar obra 'legada'."*
- **`FASE B`:** abrir a obra anterior à Fase 6. Apenas observar.
- **`CASO 14 v1` — não executar.** Estado terminal já lavrado, `CASO14-V1-INEXECUTAVEL-01`
  (`14:99-140`): a `v1` é *"data URL crua gravada direto no `AsyncStorage`"*, formato do **Colorir**
  e não de um Ateliê antigo; `saveDrawingState` é **órfão, zero chamadores**; a migração `v1→v2`
  **não existe**. Forma de reporte obrigatória em §9.2.

---

### 7.4 · `CASO 16` — `TK-A-078` · *blob* não excluído

- **Evidências:** `TAR-SF1-C16-PRE` / `TAR-SF1-C16-POST`
- **`FASE B`:** exercitar o caminho do caso em leitura pura.
- **Critério de `PASS`:** *blob* **não excluído** e `POINTER_VERSION` **intocado**.
- **Dependente de `run-as`:** sem `run-as`, este caso é **`PARCIAL`** (§6.3).

---

### 7.5 · `CASO 10` — `TK-A-072` · bytes persistidos idênticos · portão `G-CMP-2`

O caso mais caro do bloco, e o que mais se degrada se for medido de forma ingênua.

- **Critério de `PASS`** (literal): *"**Bytes persistidos idênticos** antes e depois."*
- **Três subjanelas** (`14:3031-3139`), com captura em cada fronteira:

| Subjanela | Captura ao final |
|---|---|
| metade `C60` | `CK-SF1-C10-C60` |
| fronteira | `CK-SF1-C10-FRONTEIRA` |
| metade Ateliê | `TAR-SF1-C10-POST` |

  Linha de base do caso: `TAR-SF1-C10-PRE`.
- **Economia de captura, registrada para não virar confusão depois:** no histórico,
  `TAR-C10-POST`, `CK-C10` e `TAR-2` foram **uma única captura em três papéis documentais**. O
  mesmo vale aqui: `TAR-SF1-C10-POST` **é** `TAR-SF1-FIM`. Registrar os três papéis explicitamente.
- **Se a comparação der `False`** (`10:404-405`, literal): *"**PARE** e reexecute o caso 10
  isolado"*. Não adjudicar `FAIL` na primeira divergência.

---

## 8 · Adjudicação

### 8.1 · Regra estrutural

A adjudicação é **por caso**, com pré-registro. O par `TAR-SF1-BASE` × `TAR-SF1-FIM` é
**inventário de encerramento**, **não** portão agregado (R-7 da §3). Um agregado diferente de zero
**não** reprova o bloco por si só — o histórico fechou `PASS` com
`FILES_CHANGED=5 KEYS_ADDED=4 KEYS_CHANGED=1 KEYS_ROWID_MOVED=2`.

### 8.2 · Instrumentos obrigatórios

1. **`MAX_ROWID`** antes e depois de **cada** caso, com a cadeia registrada em sequência
   (o histórico foi monotônico `50→53→66→67→68→69→70→71`).
2. **Conjunto de chaves · tipos · valores serializados · adicionadas · removidas · alteradas.**
3. **`rowid` por chave** — sem isso, uma reescrita idempotente é invisível (R-3 da §3).
4. **Classes `AC-1`..`AC-4`.** **`AC-5` é proibido criar.**

### 8.3 · Pendência que governa esta seção

**A §8.2 pressupõe `ARB-ARBITRO` respondido (§4).** Sob a saída **B**, os itens `1`, `3`–`8` do
árbitro não se aplicam e a adjudicação recai sobre a pré-registração por caso do `EMENDA 5`, com o
risco de `STOP` no meio da sessão ali descrito.

---

## 9 · Forma de reporte

### 9.1 · Vocabulário fechado

`PASS` · `FAIL` · `PARCIAL` (§6.3) · `STOP` · `NÃO EXECUTADO` ·
`INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL`.
**Nenhum termo novo.** Nenhum `PASS` "com ressalva".

### 9.2 · `CASO 14 v1` — forma literal obrigatória (`14:134-140`)

Reproduzir **exatamente** assim, em linha separada, nunca fundida ao `v2`:

```
CASO 14 · variante v2 ....... PASS | FAIL   (com evidência C-7 + captura)
CASO 14 · variante v1 ....... INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL
                              (não é PASS, não é FAIL — CASO14-V1-INEXECUTAVEL-01)
```

`v1` **não bloqueia** as variantes executáveis.

### 9.3 · Após um `STOP`

Preservar a tentativa interrompida **integralmente** (precedente `STOP_INFRA_UNREGISTERED`, §7.2).
Não apagar, não reescrever, não renumerar. Correção é **aditiva**.

---

## 10 · `ERRATA-03` ao artefato `37` — aditiva, sem reescrita

Conforme `§25` da missão, nada do texto do `37` é apagado ou reordenado. Registram-se aqui quatro
correções, por referência cruzada:

| # | Onde, no `37` | Correção |
|---|---|---|
| E3-1 | Descrição do `CASO 10` | Dizer que exige "*baseline imediatamente antes*" está **correto mas incompleto**. A linha de base é o `TAR` do Bloco 0 **e só serve como tal porque o `BLOCO A` é leitura pura**; além disso o caso exige **três subjanelas** (§7.5), não um par simples. |
| E3-2 | Registro `PENDING`, item `ARB-CASO14v1` | **Colapsa em `ARB-17-OBRIG`.** O corpus **já** resolve o tratamento documental de `CASO 14 v1` (`14:134-140`, §9.2 acima). O que resta em aberto não é específico da `v1`: é a questão geral de como um caso **obrigatório** parado em estado **não terminal** é tratado no `HUMAN GATE`. De 16 itens pendentes, passa a **15**. |
| E3-3 | §9, método de `TAR` | O par de `TAR` **por bloco** herdado do doc `10` está **superado**. Vale a tabela R-1..R-7 da §3 deste artefato. |
| E3-4 | Matriz `SG-A`, item `11` | Sai de "*aguardando `S0.1`*" e passa a **"confirmado executável, protocolo fechado (artefato `38`), bloqueado por `ARB-ARBITRO`"**. |

---

## 11 · O que este artefato **não** fecha — Bloco 3 (`R5`)

**Escopo, já definido** (`06:285`): extras restantes `E1`, `E4`, `E5`, `E6` + cenários **§28 de
`SG-A`** + painéis de recusa + `TA-5R`, no `SM-X510`.

**Resultados esperados, já definidos** (`06:418-443`):

| Item | Token | Resultado esperado (literal) |
|---|---|---|
| `E1` | `TK-A-100` | obra nova reaberta na mesma janela |
| `E4` | `TK-A-103` | *lineart* divergente ⇒ **"Recusa de aplicar**, com aviso legível. **Não** aplica, **não** regrava, **não** remove, **não** deforma" |
| `E5` | `TK-A-104` | *payload* corrompido ⇒ "a obra **não** é apagada" |
| `E6` | `TK-A-105` | acervo misto ⇒ "Todas as obras aparecem; nenhuma some da listagem" |
| §28 `#7` | `TK-A-097` | "sem salto de escala nem desalinhamento ao retomar" |
| painéis | `TK-A-045`, `TK-A-051` | "Os **dois** avisos precisam ser **lidos em tela** … **sem** oferecer 'apagar' como saída" |
| `TA-5R` | — | "a **borda do balde** aparece **limpa**, sem serrilhado grosseiro nem halo. Este é o único item que **nenhum** arnês em Node consegue provar" |

**O que falta:** roteiro gesto a gesto, método de injeção de estado para `E4`/`E5`/`E6`,
pré-condições, *checkpoints*, nomes de evidência e critérios de `STOP`. `E4`, `E5` e `E6`
**mutam o acervo deliberadamente** — o método de injeção precisa ser desenhado e aprovado, não
improvisado com o tablet na mão.

Pela `EMENDA` de 2026-08-10 (`06:420-421`), `E1`–`E6` seguem *"não bloqueantes automáticos"*, mas
*"todo `FAIL` em `E1`–`E6` é classificado por"* severidade.

---

## 12 · Estado final e próxima ação única

### 12.1 · *Tokens* de estado

```
F6-SG-A ............................. NÃO CONCEDIDO
F6-SG-B ............................. NÃO CONCEDIDO
R2_PROSPECTIVE_BE ................... PASS (inalterado)
R2_RAW_CAMPAIGN_LOG_SEALED_AND_HASHED
CASO10_AND_BLOCO_A_FINAL_GATE_PASS ... íntegro para o binário 92781ea
S0.1 ................................ REOBSERVAR (D-FUND-SG-A-S01-REOBSERVAR-01)
SF1 · Bloco 1 ....................... PROTOCOLO FECHADO · BLOQUEADO POR ARB-ARBITRO
SF1 · Bloco 2 ....................... PROTOCOLO FECHADO (artefato 37 §9)
SF1 · Bloco 3 ....................... PROTOCOLO NÃO FECHADO
SF1 ................................. NÃO INICIÁVEL
TABLET .............................. HANDS OFF
```

### 12.2 · Próxima ação única do fundador

**Responder `ARB-ARBITRO`** — saída **A** (estender o escopo do árbitro de estado à reobservação do
`BLOCO A`, sem editar `compare_state.py` e sem criar `AC_5`) ou saída **B** (método histórico puro,
aceitando o risco de `STOP` no meio da sessão física). Detalhe e recomendação na §4.3.

Nada mais é executável até essa resposta. O tablet permanece **HANDS OFF**.

---

## `ERRATA-04` — `ARB-ARBITRO` respondido (aditiva; nada acima foi reescrito)

> **Posterior a este artefato, em 2026-08-15.** O fundador respondeu **`ARB-ARBITRO = SAÍDA A`**,
> lavrado em `D-FUND-SG-A-ARBITER-EXT-BLOCO-A-01` ([`docs/DECISIONS.md`](../../../docs/DECISIONS.md)).
> Os itens `1` e `3`–`8` de `D-FUND-R2-PROSPECTIVE-STATE-ARBITER-01` passam a valer **também** para
> a reobservação do `BLOCO A` sobre o binário atual — e **somente** para ela —, com as regras,
> classificações, `HARD STOP` e a **proibição de `AC_5`** preservados **integralmente**.
>
> **Efeito sobre este documento:**
>
> | Seção | Antes | Depois |
> |---|---|---|
> | §4 | bloqueio causal aberto; duas saídas | **resolvido pela saída A.** O texto da §4 permanece íntegro como registro do raciocínio que produziu a decisão; a saída **B** está **descartada** |
> | §8.3 | *"pressupõe `ARB-ARBITRO` respondido"* | **pressuposto satisfeito.** A §8.2 vale integralmente, com o arcabouço aplicável |
> | §12.1 | `SF1 · Bloco 1 = BLOQUEADO POR ARB-ARBITRO` | **`SF1 · Bloco 1 = EXECUTÁVEL SOB AUTORIZAÇÃO`** |
> | §12.2 | próxima ação = responder `ARB-ARBITRO` | **cumprida.** A próxima ação passa a ser o fechamento do Bloco 3 (`R5`) — artefato `39` |
>
> **O que NÃO mudou:** `SF1` continua **não iniciável**. A instrução do fundador é expressa —
> *"Não iniciar `SF1` ainda."* — e o Bloco 3 (`R5`) segue **sem protocolo fechado** (§11). O
> aparelho permanece **`HANDS OFF`**.
>
> **Fechamento do Bloco 3, na mesma data.** O artefato
> [`39_SF1_BLOCO_3_R5_E_PROTOCOLO_UNICO.md`](39_SF1_BLOCO_3_R5_E_PROTOCOLO_UNICO.md) fecha o
> protocolo do Bloco 3 e consolida os Blocos 0–3 num protocolo único de `SF1`. Isso **não** torna
> `SF1` iniciável: `39` §12.1 levanta **cinco arbitragens bloqueadoras** que só o fundador pode
> responder. Dois pontos de `39` alcançam **este** artefato e ficam registrados aqui:
>
> | Ponto deste artefato | Registro |
> |---|---|
> | §8.1 — TAR do Bloco 1 em `…\SF1_BLOCO1\` | diverge de `37:540` (`…\SF1_R2_BLOCO_A_01\`). **Não existe convenção canônica** para `R3`/`R4`/`R5`/`R7` (`37:533-535`) — entra em `ARB-EVID-DIR` (`39` §12.4) |
> | §7 — casos `1`, `10`, `14 v2`, `15`, `16` | o Bloco 3 **consome** insumo que estes casos leem: `GH2b` extingue a única obra legada e `GH3` cria obra fora da `PREP-LEGADO-03` (`STOP` `#15` de `14` §11). **O Bloco 1 tem de encerrar antes** — ordem já fixada em `37:288-304` e reforçada em `39` §11.2 |
>
> ### `SF1` = `NÃO INICIÁVEL` — 5 arbitragens bloqueadoras *(ver `39` §12.1)*
