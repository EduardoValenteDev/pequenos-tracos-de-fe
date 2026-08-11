# `PREP-LEGADO-02` — protocolo corrigido (escopo congelado, execução NÃO iniciada)

> **Estado deste documento:** **congelamento de escopo e protocolo**. Ele **não** executa nada, **não**
> concede `PASS` a nenhum caso da `R2`, **não** reabilita a `PREP-LEGADO-01` e **não** inicia a
> `R2 · Sessão 2`. Autoridade superior: [`docs/PROJECT_SOURCE_OF_TRUTH.md`](../../../docs/PROJECT_SOURCE_OF_TRUTH.md)
> → Constituição → [`docs/DECISIONS.md`](../../../docs/DECISIONS.md) → este pacote operacional.
>
> Documentos irmãos: [`10_RODADA_FISICA_2_F6_SG_A.md`](10_RODADA_FISICA_2_F6_SG_A.md) ·
> [`06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md`](06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md) ·
> [`05_TASKS_DELTA_F6.md`](05_TASKS_DELTA_F6.md) · [`04_PLAN_DELTA_F6.md`](04_PLAN_DELTA_F6.md).

---

## 1. Causa-raiz da `PREP-LEGADO-01`

A `PREP-LEGADO-01` terminou em **`ALLOWLIST_RESULT=STOP`** com **três chaves inesperadas**
(`@ptf_coloring60_milestone_invite_seen_creation_light`, `@ptf_creator_qa_mode`,
`@ptf_progress_creation`). A auditoria somente-leitura `AUDITORIA-PREP-STOP-01` estabeleceu a causa:

> **O protocolo da `PREP-01` era inexecutável como escrito.** A allowlist foi derivada dos *writers*
> do **artefato** (o que a obra grava) e **não** dos *writers* da **rota física** (o que o caminho até
> a obra grava). Duas coisas ficaram de fora por construção:
>
> 1. **O portão de gravação do Ateliê.** `ATELIER_FREE_SAVE_LIMIT = 0` — em plano grátis o Ateliê
>    **nunca** salva. Salvar exigia habilitar o **Modo Criador**, que grava `@ptf_creator_qa_mode`.
>    A allowlist não previa a chave porque não previa o pré-requisito.
> 2. **A rota de chegada ao Colorir 60.** A rota narrativa (cena 1 → cena 2 → marco) foi a escolhida,
>    e ela grava `@ptf_progress_creation` (`src/hooks/useProgress.js:29`, disparado por
>    `src/screens/NarrationScreen.js:186`) e `@ptf_coloring60_milestone_invite_seen_*`
>    (`src/services/coloring60MilestoneInviteSeen.js:61`, disparado por
>    `src/screens/NarrationScreen.js:216`). Nenhum dos dois *writers* está na tela de destino — por
>    isso uma auditoria feita a partir de `ColoringScreen.js` não os encontrava.

**Não houve desvio do operador.** As três escritas são consequência determinística da rota que o
protocolo mandava percorrer.

## 2. A `PREP-LEGADO-01` permanece `STOP`

Congelado por **`D-PREP02-01`**:

- `ALLOWLIST_RESULT=STOP` **permanece**. Não há reabilitação retroativa.
- **Nenhuma allowlist é ampliada retroativamente.** Nenhuma chave é apagada. Nenhum `TAR` é refeito.
  Nenhum artefato é descartado.
- Os arquivos de `C:\tmp\ptf_evidencias\PREP-LEGADO\` são **imutáveis**. `ALLOWLISTS.md` daquele
  diretório fica preservado **como está**, inclusive nos pontos em que está materialmente errado — é
  evidência do erro, não documento normativo.

## 3. Autenticidade ≠ admissibilidade

| Artefato da `PREP-01` | Autêntico? | Admissível na `R2`? |
|---|---|---|
| Obra do **Ateliê** `art_1786464756414_7766` | **SIM** — gravada pelo *runtime* `7de7085`; `performSave` não tem ramo em `unlimited`; `STATE_V=2` com `paintSchemaVersion`, `layoutVersion`, `logicalW` e `logicalH` **ausentes** | **NÃO** — a sessão inteira está sob `STOP` |
| Obra do **Colorir 60** `@ptf_drawing60_screation_alight` | **SIM quanto ao *writer*** — ponteiro `v:3`, `fmt:2`, *blob* presente | **NÃO** — mesma razão |

**O Modo Criador alterou a permissão de salvar, não o *payload*.** `isCreatorQaModeEnabled()` entra no
produto por uma única porta — `src/services/accessControl.js:74` — e daí só alimenta predicados de
acesso. `src/screens/AtelierCanvasScreen.js:227-267` (`performSave`) **não** referencia `unlimited`: o
*flag* só aparece em `:58` (leitura), `:271` (contagem de artes no `doSave`) e `:462` (rótulo de UI).

**O Colorir 60 não discrimina *runtime* histórico de atual** na variante estrutural do Caso 14: ambos
os *runtimes* descartam os eixos discriminantes no momento da gravação. Isso **não** o torna inútil —
ver §4 e §5.

## 4. Matriz de insumos — Casos 1, 10, 14, 15, 16

Fontes de autoridade, em ordem: [`04_PLAN_DELTA_F6.md`](04_PLAN_DELTA_F6.md) §28.1 (linhas 1075–1093,
a matriz de 17 casos) → [`05_TASKS_DELTA_F6.md`](05_TASKS_DELTA_F6.md) (`TK-A-063`, `TK-A-072`,
`TK-A-076`, `TK-A-077`, `TK-A-078`, e as precondições `TK-A-002`, `TK-A-005`, `TK-A-041`, `TK-A-042`)
→ [`06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md`](06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md) (linhas 400,
409, 413–415) → [`10_RODADA_FISICA_2_F6_SG_A.md`](10_RODADA_FISICA_2_F6_SG_A.md) (linhas 335–405,
definições operacionais do `BLOCO A`).

### 4.0 Fronteira das três superfícies de persistência (o achado que decide a matriz)

Existem **três** módulos de persistência de obra, e eles **não** são intercambiáveis:

| Módulo (em `7de7085`) | Chave | Forma do valor | Produzível fisicamente? |
|---|---|---|---|
| `src/services/drawingStorage.js:33` | `@ptf_drawing_s<storyId>_c<sceneId>` | `v1` *data URL* · `v2` JSON · **`v3` ponteiro** (`:30 POINTER_VERSION = 3`, `:43 isDrawingPointer`) | **NÃO** — Colorir legado **aposentado** (`:20-24`, marca `[P3J]`). `saveDrawingState` (`:130`) e `clearDrawingState` (`:147`) têm **zero chamadores** em `src/`, tanto em `7de7085` quanto no `HEAD` |
| `src/services/coloring60DrawingStorage.js:120` | `@ptf_drawing60_s<storyId>_a<activityId>` | **ponteiro `v:3`** — `:421` `const ptr = { v: POINTER_VERSION, fmt, uri: written.uri, mime }` | **SIM** — `saveColoring60DrawingState` (`:509`) |
| `src/services/atelierStorage.js:13` | `ptf_atelier_arts_v1_index` · `ptf_atelier_arts_v1_<artId>` | objeto `{ id, title, …, schema: 2, stateJson, previewUri }` (`:114-125`) — **`stateJson` inline e literal**; `previewUri`/`thumbnailUri` são **campos**, **não** um envelope versionado | **SIM** — `saveArt` (`:89`) |

Consequência direta: **o Ateliê não produz, e não pode produzir, um ponteiro `v:3`.** Seu registro não
tem campo `v` no nível do envelope; tem `schema: 2` e o `stateJson` literal.

Segunda consequência: **`loadPaint` existe apenas no canvas do Colorir 60.**
`src/components/ColoringCanvas.js:933` define `window.loadPaint`; `:1422` a ponte React. O canvas do
Ateliê (`src/components/AtelierCanvas.js`) **não tem `loadPaint`** — sua contraparte é `loadState`
(`TK-A-002`, linha 348 de `05_TASKS_DELTA_F6.md`). E o Ateliê **não tem *lineart***: o papel é branco.

### 4.1 Ficha por caso

#### CASO 1 — `TK-A-063` · §28.1 #1 — "obra **antiga** em retrato"

1. **ID/nome exato:** `TK-A-063` · Caso 1 · "obra antiga em retrato" (`05_TASKS_DELTA_F6.md:1163`).
2. **Objetivo:** *"o caso zero de `Q8`: obra criada **antes** da mudança abre com a pintura presente"* (`:1164`).
3. **Pré-condição:** `TK-A-062` + bloco comum `C-1` (`10_RODADA_FISICA_2:335-349`). Orientação **RETRATO** — único caso com orientação fixada.
4. **Insumo físico necessário:** obra pré-mudança, com pintura, **sobre um *lineart***.
5. **Precisa de (a) obra Ateliê:** não. **(b) obra C60:** **SIM**. **(c) ponteiro v3:** sim (é como o C60 grava). **(d) *blob*:** sim. **(e) progresso:** **não**. **(f) outra persistência:** não.
6. **Precisa de insumo HISTÓRICO:** **SIM** — "criada **antes** da mudança".
7. **Precisa que seja estruturalmente discriminável:** **NÃO.** O `PASS` é *"a pintura **aparece** e está **alinhada ao *lineart***"* (`:1165`) — um veredito **visual e geométrico**, não uma inspeção de campos.
8. **Basta proveniência por cadeia de custódia:** **SIM.** É exatamente o caso previsto em `D-PREP02-03`/§3 desta ordem.
9. **Pode usar Ateliê `v2` inline:** **NÃO.** Não há *lineart* para alinhar, e `TK-A-063` nomeia `ColoringCanvas.js` (`loadPaint`) — que não existe no canvas do Ateliê.
10. **Pode usar C60 `v3`/PNG:** **SIM** — é o único veículo possível.
11. **O C60 é irrelevante:** **NÃO — é obrigatório.**
12. **O Ateliê sozinho torna o caso executável:** **NÃO.**
13. **Citações:** `05_TASKS_DELTA_F6.md:1163-1166`; `04_PLAN_DELTA_F6.md:1077`; `10_RODADA_FISICA_2:335-349`; `src/components/ColoringCanvas.js:933,1422`; `src/components/AtelierCanvas.js` (sem `loadPaint`).

#### CASO 10 — `TK-A-072` · §28.1 #10 — "obra **sem modificação**"

1. **ID/nome exato:** `TK-A-072` · Caso 10 (`05_TASKS_DELTA_F6.md:1208`).
2. **Objetivo:** *"provar leitura pura (`Q8` r.1): abrir **não** migra, **não** promove, **não** reescreve"* (`:1209`).
3. **Pré-condição:** `TK-A-042` (`:717-723`) + `TAR-1` imediatamente antes (`10_RODADA_FISICA_2:390-405`).
4. **Insumo físico necessário:** obra persistida cuja representação possa ser comparada **byte a byte** antes e depois de abrir e fechar.
5. **(a) obra Ateliê:** **SIM**. **(b) obra C60:** **SIM**. **(c) ponteiro v3:** sim, pelo lado C60. **(d) *blob*:** sim, pelos dois lados. **(e) progresso:** não. **(f) outra persistência:** não.
6. **Insumo HISTÓRICO:** **SIM** — o caso encadeia com os Casos 1/14/15 sobre o mesmo acervo.
7. **Estruturalmente discriminável:** **NÃO.** O `PASS` é *"**bytes persistidos idênticos** antes e depois"* (`:1210`) — uma igualdade, não uma classificação.
8. **Proveniência por cadeia de custódia basta:** **SIM.**
9. **Pode usar Ateliê `v2` inline:** **SIM** — cobre `AtelierCanvasScreen.js`.
10. **Pode usar C60 `v3`/PNG:** **SIM** — cobre `ColoringScreen.js` e é o **único** que exercita a não-reescrita do par *ponteiro + blob*.
11. **O C60 é irrelevante:** **NÃO.** `TK-A-072` nomeia as **duas** telas: *"**Arquivos:** `ColoringScreen.js`, `AtelierCanvasScreen.js`, `drawingStorage.js` (**leitura**)"* (`:1209`). Idem `TK-A-042`: *"nenhuma escrita é disparada pela abertura — nem “normalização”, nem “reparo”, nem carimbo de versão"* (`:721`).
12. **Ateliê sozinho torna executável:** **PARCIALMENTE** — executa metade do caso. A metade do `ColoringScreen` fica sem insumo, e o caso é indivisível na matriz §28.1.
13. **Citações:** `05_TASKS_DELTA_F6.md:1208-1211,717-723`; `04_PLAN_DELTA_F6.md:1086`; `10_RODADA_FISICA_2:390-405`.

#### CASO 14 — `TK-A-076` · §28.1 #14 — "formato legado (`v1`/`v2` sem geometria completa)"

1. **ID/nome exato:** `TK-A-076` · Caso 14 (`05_TASKS_DELTA_F6.md:1228`).
2. **Objetivo:** *"provar reconstrução determinística **sem** usar a janela atual como se fosse a original"* (`:1229`).
3. **Pré-condição:** `TK-A-041` (`:708-715`) **e** *"existir obra legada no acervo real"* (`10_RODADA_FISICA_2:364-376`).
4. **Insumo físico necessário:** *payload* legado — na classificação de `TK-A-041`, os ramos são `d.v===2`, `Array.isArray(d.ops)`, `fmt: 1|2` do ponteiro, e **ausência de `paintSchemaVersion`/`layoutVersion`** (`:710`).
5. **(a) obra Ateliê:** **SIM** — cobre o ramo `d.v===2` + ausência dos eixos. **(b) obra C60:** **SIM, para o ramo `fmt: 1|2` do ponteiro**. **(c) ponteiro v3:** só no ramo do ponteiro. **(d) *blob*:** idem. **(e) progresso:** não. **(f)** não.
6. **Insumo HISTÓRICO:** **SIM — indispensável.** *"Se não houver obra anterior à Fase 6 no acervo, PARE e reporte. **Não fabricar obra 'legada'**"* (`10_RODADA_FISICA_2:364-376`).
7. **Estruturalmente discriminável:** **SIM — este é o único dos cinco casos que exige discriminação estrutural.**
8. **Proveniência por cadeia de custódia basta:** **NÃO, sozinha.** Discriminação **e** proveniência.
9. **Pode usar Ateliê `v2` inline:** **SIM.** O Ateliê grava `stateJson` **literal e inline** (`atelierStorage.js:121`), então a ausência dos quatro eixos é **verificável byte a byte** — foi exatamente o que a `PREP-01` mediu (`STATE_V=2`, `STATE_HAS_paintSchemaVersion=False`, `layoutVersion=False`, `logicalW=False`, `logicalH=False`).
10. **Pode usar C60 `v3`/PNG:** **para o ramo do ponteiro (`fmt:1|2`), sim.** Para a variante estrutural `v2`, **não é prova discriminável** — ambos os *runtimes* descartam os eixos no momento da gravação.
11. **O C60 é irrelevante:** **não para o ramo do ponteiro**; **sim** para a discriminação estrutural.
12. **Ateliê sozinho torna executável:** **SIM, para a variante `v2`.**
13. **Variante `v1`:** permanece **`INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL`** — ver `CASO14-V1-INEXECUTAVEL-01`. **Nenhum *writer* em `7de7085` emite `v1`.** Isto **não** é alterado pela `PREP-02`.
14. **Citações:** `05_TASKS_DELTA_F6.md:1228-1231,708-716`; `04_PLAN_DELTA_F6.md:1090`; `10_RODADA_FISICA_2:364-376`; `src/services/atelierStorage.js:114-125`.

#### CASO 15 — `TK-A-077` · §28.1 #15 — "*payload* visual atual"

1. **ID/nome exato:** `TK-A-077` · Caso 15 (`05_TASKS_DELTA_F6.md:1233`).
2. **Objetivo:** *"provar que a ausência de `paintSchemaVersion` é tratada como legado **sem erro**"* (`:1234`).
3. **Pré-condição:** `TK-A-002` (`:346-353`).
4. **Insumo físico necessário:** obra cujo *payload* **não** contenha `paintSchemaVersion`.
5. **(a) obra Ateliê:** **SIM**. **(b) obra C60:** opcional. **(c) ponteiro v3:** não. **(d) *blob*:** não. **(e) progresso:** não. **(f)** não.
6. **Insumo HISTÓRICO:** **SIM** (o `HEAD` atual emite os eixos — `AtelierCanvas.js:608`, `ColoringCanvas.js:706`).
7. **Estruturalmente discriminável:** **SIM** — e o Ateliê entrega essa discriminação.
8. **Proveniência por cadeia de custódia basta:** não sozinha; some-se a discriminação estrutural, que o Ateliê já dá.
9. **Pode usar Ateliê `v2` inline:** **SIM.** `TK-A-002` nomeia explicitamente **os dois** leitores: *"`src/components/ColoringCanvas.js` (`loadPaint`), `src/components/AtelierCanvas.js` (`loadState`)"* (`:348`).
10. **Pode usar C60 `v3`/PNG:** sim, mas **redundante**.
11. **O C60 é irrelevante:** **SIM, para este caso.**
12. **Ateliê sozinho torna executável:** **SIM.**
13. **Citações:** `05_TASKS_DELTA_F6.md:1233-1236,346-353`; `04_PLAN_DELTA_F6.md:1091`; `10_RODADA_FISICA_2:351-362`; `src/components/AtelierCanvas.js:159,608`.

> **Nota de fronteira** — `10_RODADA_FISICA_2:351-362`: *"Os painéis 'não consegui abrir' NÃO são deste caso na `R2`."*

#### CASO 16 — `TK-A-078` · §28.1 #16 — "envelope de armazenamento atual (ponteiro `v:3`)"

1. **ID/nome exato:** `TK-A-078` · Caso 16 (`05_TASKS_DELTA_F6.md:1238`).
2. **Objetivo:** *"provar que o envelope permanece intocado e que o blob nunca é excluído por incompatibilidade **visual**"* (`:1239`).
3. **Pré-condição:** `TK-A-005` (`:373-380`) + inventário de *blobs* antes/depois (`10_RODADA_FISICA_2:378-388`).
4. **Insumo físico necessário:** **uma obra efetivamente guardada como ponteiro `v:3` apontando para um *blob* em arquivo.**
5. **(a) obra Ateliê:** **NÃO — impossível.** **(b) obra C60:** **SIM — obrigatório.** **(c) ponteiro v3:** **SIM, é a definição do caso.** **(d) *blob*:** **SIM.** **(e) progresso:** não. **(f)** não.
6. **Insumo HISTÓRICO:** **SIM.**
7. **Estruturalmente discriminável:** **NÃO.** O `PASS` é *"resolve normalmente · *blob* não excluído · `POINTER_VERSION` intocado"*.
8. **Proveniência por cadeia de custódia basta:** **SIM.**
9. **Pode usar Ateliê `v2` inline:** **NÃO.** O registro do Ateliê **não é um ponteiro `v:3`** — é `{ …, schema: 2, stateJson, previewUri }` (`atelierStorage.js:114-125`). `previewUri`/`thumbnailUri` são campos de conveniência, não o envelope que `isDrawingPointer` reconhece.
10. **Pode usar C60 `v3`/PNG:** **SIM — é o único veículo produzível.** `TK-A-005` nomeia os **dois** módulos de envelope: *"`src/services/drawingStorage.js`, `src/services/coloring60DrawingStorage.js`, `src/services/storageKeys.js`, `src/services/storageMigrationService.js` — todos em modo de verificação"* (`:375`), e ambos declaram `POINTER_VERSION = 3`.
11. **O C60 é irrelevante:** **NÃO — é o caso que o exige.**
12. **Ateliê sozinho torna executável:** **NÃO.**
13. **Por que não `drawingStorage.js`:** o Colorir legado está **aposentado** — `saveDrawingState` (`:130`) tem **zero chamadores** em `7de7085` e no `HEAD`. Um ponteiro `@ptf_drawing_s*_c*` **não pode ser produzido** por nenhuma rota física sem fabricar obra, o que é proibido.
14. **Citações:** `05_TASKS_DELTA_F6.md:1238-1241,373-380`; `04_PLAN_DELTA_F6.md:1092`; `10_RODADA_FISICA_2:378-388`; `src/services/coloring60DrawingStorage.js:120,421`; `src/services/drawingStorage.js:30,43,130`; `src/services/atelierStorage.js:114-125`.

### 4.2 Tabela consolidada

| CASO | INSUMO | ATELIÊ | C60 | DISCRIMINAÇÃO | PROVENIÊNCIA | `PREP-02` NECESSÁRIA |
|---|---|---|---|---|---|---|
| **1** · `TK-A-063` | obra histórica com pintura **sobre *lineart***, em retrato | ❌ não serve (sem *lineart*, sem `loadPaint`) | ✅ **obrigatório** | não exigida | **suficiente** | **SIM — via C60** |
| **10** · `TK-A-072` | obra histórica comparável byte a byte | ✅ cobre `AtelierCanvasScreen` | ✅ cobre `ColoringScreen` + par ponteiro/*blob* | não exigida | **suficiente** | **SIM — via ambos** |
| **14** · `TK-A-076` | *payload* legado classificável | ✅ **veículo de grau probatório** (`v2` inline, 4 eixos ausentes, verificável) | ⚠️ só o ramo `fmt:1\|2` do ponteiro | **exigida** | necessária **e** insuficiente sozinha | **SIM — via Ateliê** (variante `v1` segue **INEXECUTÁVEL**) |
| **15** · `TK-A-077` | *payload* sem `paintSchemaVersion` | ✅ **suficiente** | ➖ redundante | **exigida** | complementar | **SIM — via Ateliê** |
| **16** · `TK-A-078` | ponteiro `v:3` + *blob* em arquivo | ❌ **impossível** (não produz envelope `v:3`) | ✅ **obrigatório e único** | não exigida | **suficiente** | **SIM — via C60** |

## 5. Escopo mínimo decidido — **OPÇÃO B: Ateliê + Colorir 60**

**Conclusão: o Ateliê sozinho NÃO basta.** O conjunto mínimo que torna executáveis todos os casos
fisicamente executáveis dentre 1, 10, 14, 15 e 16 é **`{ 1 obra do Ateliê, 1 obra do Colorir 60 }`**.

**Justificativa, caso a caso — o C60 não entra por hábito, entra por necessidade:**

1. **O Caso 16 exige o C60 por impossibilidade estrutural do Ateliê.** O caso pede um **ponteiro
   `v:3`**. O Ateliê grava `{ …, schema: 2, stateJson, previewUri }` — **não existe campo `v` no
   envelope**, logo `isDrawingPointer` (`drawingStorage.js:43`) e o predicado equivalente do C60
   (`coloring60DrawingStorage.js:350-356`, `isPointer60`) **retornam `false`** para qualquer registro do Ateliê. O
   único *writer* de envelope `v:3` fisicamente acionável é `coloring60DrawingStorage.js:421`.
2. **O Caso 1 exige o C60 por ausência de *lineart* no Ateliê.** O `PASS` é *alinhamento ao lineart*.
   O Ateliê é papel branco. E `TK-A-063` nomeia `ColoringCanvas.js` (`loadPaint`) — símbolo que
   **não existe** no canvas do Ateliê.
3. **O Caso 10 nomeia as duas telas.** Cobrir só o Ateliê deixa metade do caso sem insumo, e a matriz
   §28.1 não admite caso parcial.
4. **Nada disso contradiz o congelamento anterior.** Continua verdadeiro que **o C60 não é prova
   discriminável para a variante estrutural do Caso 14**. Os Casos 1, 10 e 16 **não pedem
   discriminação estrutural** — pedem envelope, geometria e igualdade de bytes, tudo estabelecível
   pela **cadeia de custódia**, que é justamente o que a `PREP-02` constrói.
5. **O Ateliê continua sendo o veículo de grau probatório** dos Casos 14 (`v2`) e 15, pelo motivo já
   provado: ele grava `stateJson` **literal e inline**, tornando a ausência dos quatro eixos
   verificável byte a byte.

**Opção A (somente Ateliê) é rejeitada** porque deixaria os Casos 1 e 16 sem insumo e o Caso 10 pela
metade. **Opção C não é necessária:** não há terceiro veículo produzível — o `drawingStorage.js` está
aposentado e fabricar obra é proibido.

## 6. Baseline — `TAR-PRE-LEGADO.tar` (`D-PREP02-03`)

Escolha do fundador: **restaurar `C:\tmp\ptf_evidencias\PREP-LEGADO\TAR-PRE-LEGADO.tar`**, **não**
"aparelho limpo". Motivo registrado: *"é o baseline exato já lacrado e byte a byte igual ao
`TAR-SUSPENSAO`"* — ambos com `SHA256 8486DEC6…1BA7`, 16.806.912 B.

### Inventário lógico do baseline (16 chaves, obtido por leitura das evidências)

`@ptf_achievements_seen` · `@ptf_active_child_id_v1` · `@ptf_beni_app_tour_seen_v1` ·
`@ptf_beni_guide_adventures_v1` · `@ptf_beni_guide_home_v1` · `@ptf_beni_guide_profile_v1` ·
`@ptf_beni_guide_stars_v1` · `@ptf_bonus_stars` · `@ptf_brincar_daily_v1` · `@ptf_brincar_stats_v1` ·
`@ptf_child_profiles_v1` · **`@ptf_criar_livre_orientation_seen_v1:star`** · `@ptf_migration_status_v1` ·
`@ptf_onboarding_v1` · `@ptf_profile` · `@ptf_schema_version`

**Fatos que decorrem disso e governam as allowlists:**

- **O acervo é vazio.** Nenhuma chave `@ptf_drawing_s*_c*`, `@ptf_drawing60_*` ou
  `ptf_atelier_arts_v1_*`. `extract-pre/files/` **não contém `ptf_blobs/`**. É a confirmação
  independente de `ACHADO-01_ACERVO_VAZIO`.
- **`@ptf_criar_livre_orientation_seen_v1:star` JÁ EXISTE**, com valor `'1'` — responde à pergunta
  do escopo: a chave **não** é nova e **não deve** mudar de valor. Ver §7.2.
- **`@ptf_progress_creation` está AUSENTE** no baseline — o que, por `coloring60Journey.js:731`,
  mantém `@ptf_creation_colorir_invite_shown_v1` fora de alcance (ver §7.3).

## 7. Allowlist lógica da `PREP-02` (`AsyncStorage`)

Derivada **da rota física mínima**, não do artefato. Rota congelada em §10.

### 7.1 `ALLOWLIST_C60` — Rota B (executada **primeiro**, com o Modo Criador **desligado**)

| Chave | Efeito | *Writer* (`7de7085`) |
|---|---|---|
| `@ptf_drawing60_screation_a<activityId>` | **ADDED** — ponteiro `v:3` | `coloring60DrawingStorage.js:421,581` |
| `@ptf_coloring60_done_creation_<activityId>` | **ADDED** | `coloring60ActivityService.js:39` (`DONE_PREFIX`) · `:129-133` (`multiSet` único) |
| `@ptf_coloring60_snap_creation_<activityId>` | **ADDED** — valor `ready` | `coloring60ActivityService.js:53` (`SNAP_PREFIX`) · `:129-133` |
| `@ptf_coloring60_ever_creation_<activityId>` | **ADDED** | `coloring60ActivityService.js:43` (`EVER_PREFIX`) · `:129-133` |

**Exatamente quatro chaves — e `@ptf_achievements_seen` NÃO pertence a esta rota.** O único *writer*
é `achievementsStorage.js:27`, alcançável apenas por `useAchievementCelebration`, que está montado
somente em `AtelierCanvasScreen.js:63`, `CongratsScreen.js:123`, `QuizScreen.js:33` e
`StoryBookScreen.js:204`. `ColoringScreen`, `ParentAreaScreen`, `ProfileScreen` e `HomeScreen` **não**
usam o *hook*. A chave continua prevista em **7.2** (Rota A), onde o Ateliê realmente a toca.

**O C60 grava em qualquer plano e não consulta o Modo Criador:** `coloring60DrawingStorage.js:18`
(*"em QUALQUER plano. Grátis em história gratuita acessível salva"*) e `:507` (*"NUNCA consulta
plano/rede"*). "A Criação" é gratuita (`src/data/planConfig.js:83` — `FREE_STORY_IDS = ['creation', 'noah']`),
logo `deriveStoryContentAuthorization` devolve `ALLOWED` e o *writer* persiste os pixels.

#### 7.1.1 `VISIBLE` ≠ `ENABLED` — por que a rota **não** pode partir do `StoryDetailScreen`

A seção do piloto na tela da história é **visível** por `StoryDetailScreen.js:139-142`
(`__DEV__ && isInternalToolsEnabled()`), e `internalTools.js:24-26` devolve `true` só por `__DEV__`
no *dev client* — **sem** depender de `@ptf_creator_qa_mode`. Mas **visibilidade não é acionabilidade**:

- `StoryDetailScreen.js:571-573` passa `unlocked={isCompleted}`, e `isCompleted` é
  `progressCount >= totalScenes && totalScenes > 0` (`:132`).
- Com o *baseline* restaurado, `@ptf_progress_creation` **não existe** ⇒ `progressCount = 0` ⇒
  `unlocked = false`.
- `coloring60Journey.js:363` — `if (unlocked !== true) state = COLORING60_STEP_STATE.LOCKED;` ⇒ as
  **três** fichas ficam `LOCKED`; `:378-379` — `let primaryAction = null; if (unlocked === true) {…}`
  ⇒ o CTA **nem é renderizado** (`CreationColoringJourneySection.js:254`).
- `CreationColoringJourneySection.js:141-142` — `onPress={locked ? undefined : onPress}` e
  `disabled={locked}` ⇒ o toque é **inerte**.

Portanto o editor **é** alcançável, mas **não por essa porta** com o *baseline* restaurado. A porta
correta está em **§10, bloco B** — e a `AUDITORIA-PREP-STOP-01` estava certa ao concluir que o
cartão do `StoryDetail` exige `10/10`.

### 7.2 `ALLOWLIST_ATELIER` — Rota A (executada **depois**, com o Modo Criador ligado)

| Chave | Efeito | *Writer* (`7de7085`) |
|---|---|---|
| `@ptf_creator_qa_mode` = `'true'` | **ADDED** — pré-requisito técnico legítimo (`D-PREP02-05`) | `creatorQaMode.js:90`, acionado por `ParentAreaScreen.js:475` |
| `ptf_atelier_arts_v1_index` | **ADDED** | `atelierStorage.js:146` |
| `ptf_atelier_arts_v1_art_<epochMs>_<4d>` | **ADDED** | `atelierStorage.js:137` |
| `@ptf_criar_livre_orientation_seen_v1:star` | **REESCRITA COM VALOR IDÊNTICO `'1'`** — permitida; **qualquer outro valor ⇒ `STOP`** | `criarLivreOrientation.js:31`, acionado por `AtelierCanvasScreen.js:155` |
| `@ptf_achievements_seen` | **CHANGED** — permitida | `achievementsStorage.js:10` (`KEY`) · `:27` (`setItem`), via `useAchievementCelebration` em `AtelierCanvasScreen.js:63` |

> **A quarta linha é o achado que a `PREP-01` não tinha.** `AtelierCanvasScreen.js:173` chama
> `hideOrientation()` no **primeiro traço**, **incondicionalmente** — inclusive quando o cartaz de
> orientação nunca apareceu (porque `hasSeenOrientation` já era `true`). Logo `markOrientationSeen`
> **será** chamada e **reescreverá** a chave. Como o baseline já tem `'1'`, o **diff lógico é nulo**;
> mas a chave é tocada e precisa estar pré-declarada. Não pré-declará-la reproduziria exatamente a
> falha da `PREP-01`.

### 7.3 Excluídas **por construção** — presença ⇒ `STOP`

| Chave | Por que não pode aparecer |
|---|---|
| `@ptf_progress_creation` | Único *writer*: `useProgress.js:29`, acionado por `NarrationScreen.js:186` (`salvarCena`). **A rota congelada não entra em `NarrationScreen`.** |
| `@ptf_coloring60_milestone_invite_seen_*` | Único *writer*: `coloring60MilestoneInviteSeen.js:61`, acionado por `NarrationScreen.js:216`. Mesma razão. |
| `@ptf_creation_colorir_invite_shown_v1` | *Writer*: `coloring60JourneyInvite.js:41`, acionado por `StoryDetailScreen.js:274` **somente se** o convite for visível. `coloring60Journey.js:731` reprova antes: `storyScenesComplete !== true ⇒ STORY_INCOMPLETE`. Com o baseline restaurado não há progresso de cena ⇒ convite invisível ⇒ chave não escrita. **Se aparecer, o baseline estava errado.** |
| `@ptf_coloring60_finale_seen_*` | *Writer*: `coloring60ActivityService.js:284`, acionado por `ColoringScreen.js:1019` **somente** quando `journey.allActivitiesComplete` (3/3). A rota conclui **uma** atividade. |
| `@ptf_creator_qa_mode` **durante o Bloco B** | Único *writer*: `creatorQaMode.js:90`, acionado pelo *switch* de `ParentAreaScreen.js:1127-1134`. O Bloco B **não** toca o *switch*. Se aparecer antes do Bloco A, a ordem foi violada ⇒ `STOP`. |
| `@ptf_beni_guide_parent_v1` | `ParentAreaScreen.js:304` instancia `useScreenGuide('parentArea', **false**)` — desabilitado. A chave **não tem gatilho**. |
| `@ptf_beni_guide_profile_v1` · `_home_v1` · `_adventures_v1` · `_stars_v1` · `@ptf_beni_app_tour_seen_v1` | Já valem `'true'` no *baseline* ⇒ `hasSeenGuide` recusa exibir ⇒ `markGuideSeen` (`beniTourService.js:63`) nunca é chamado. `ColoringScreen` não usa `useScreenGuide`. |
| Qualquer uma das **16 chaves do baseline** não listada em 7.1/7.2 | Alteração não prevista de registro preexistente. |

**Nada além do que está em 7.1 e 7.2 pode ser ADDED ou CHANGED. `DELETED` deve ser sempre 0.**

## 8. Allowlist física da `PREP-02` (sistema de arquivos)

Cada entrada é justificada individualmente. Qualquer arquivo fora desta lista ⇒ `STOP`.

| Caminho | Efeito | Justificativa |
|---|---|---|
| `databases/RKStorage` | **CHANGED** | Banco SQLite que **é** o `AsyncStorage` no Android (`ReactDatabaseSupplier`, tabela `catalystLocalStorage`). Toda escrita de §7 passa por aqui. |
| `databases/RKStorage-journal` | **CHANGED / ADDED / REMOVED** | *Journal* do SQLite. Existe no baseline; seu tamanho e existência são efeito colateral do motor, **não** do produto. Pré-declarado para não virar surpresa. |
| `files/DevLauncherApp-BridgelessReactNativeDevBundle.js` | **CHANGED** | *Bundle* JS da **nossa** aplicação, gravado pelo *dev client* ao carregar do Metro. É o **gate positivo de proveniência** (§9). |
| `files/ptf_blobs/atelier/art_<id>_preview.jpg` | **ADDED** | `atelierStorage.js:106` — `writeBlob(BLOB_SUBDIR, previewFileName(id), …)`. |
| `files/ptf_blobs/atelier/art_<id>_thumb.jpg` | **ADDED** | `atelierStorage.js:108` — idem para o *thumbnail*. |
| `files/ptf_blobs/drawings60/_ptf_drawing60_screation_a<activityId>.a.png` | **ADDED** | *Blob* da pintura do C60 (`coloring60DrawingStorage.js`, `BLOB_SUBDIR = 'drawings60'`, nome derivado de `safeName(chave)` + sufixo de *slot*). |
| `files/ptf_blobs/drawings60/…​.b.png` | **ADDED — tolerado** | *Slot* alternado A/B. Só surge se houver **mais de um** salvamento na mesma atividade. Pré-declarado; se aparecer, deve ser explicado no relatório. |
| `shared_prefs/WebViewChromiumPrefs.xml` | **CHANGED** | Ambos os canvas são **WebView** (`react-native-webview`). Abrir a WebView é o que muda este arquivo. Infraestrutura, não produto. |
| `shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml` | **CHANGED** | O *dev launcher* registra a última URL aberta. Consequência inevitável de carregar do Metro. |
| `shared_prefs/expo.modules.devmenu.sharedpreferences.xml` · `expo.modules.kotlin.PersistentDataManager.xml` · `android.app.ActivityThread.IDS.xml` · `com.valentedev.pequenostracosdefe_preferences.xml` | **CHANGED — tolerado** | Presentes no baseline; pertencem ao *dev menu*, ao Expo Modules e ao Android. Nenhum é escrito pelo produto. Se mudarem, o relatório registra; não são `STOP`. |
| `files/profileInstalled` · `files/phenotype_storage_info/shared/storage-info.pb` | **CHANGED — tolerado** | Perfil ART e Play Services. Infraestrutura do sistema. |

**Auditoria de "existe algum outro arquivo físico possível na rota escolhida?"** — os únicos módulos
que gravam arquivo no espaço do produto são `fileBlobStore.js` (usado por `atelierStorage.js`,
`drawingStorage.js` e `coloring60DrawingStorage.js`) e, indiretamente, `expo-file-system`. Como
`drawingStorage.js` não tem *writer* acionável, **`files/ptf_blobs/drawings/` não pode ser criado**.
Nenhuma outra raiz de arquivo é tocada pelo produto na rota congelada.

## 9. Proveniência do *runtime* — prova por **conjunto**

Nenhum item isolado prova qual Metro serviu o *bundle*. A prova é a **convergência** de:

1. *Worktree* histórico `C:\tmp\ptf_colorir_canonical_runtime_wt` com `HEAD = 7de7085` e árvore limpa.
2. `git status --porcelain` **vazio** nos **dois** *worktrees*, antes e depois.
3. **Um único** Metro no ar, servido **daquela** pasta, na porta **8081**; PID e diretório de trabalho registrados.
4. **Unicidade do *listener*** na 8081 (nenhum servidor concorrente).
5. Resposta de `/status` do Metro.
6. `adb reverse` com **exatamente** o mapeamento esperado, criado nesta sessão.
7. Dispositivo `RX2XC003LTJ` / `SM_X510`, *package* `com.valentedev.pequenostracosdefe`.
8. Pedido do aparelho registrado no log do Metro **e** a resposta correspondente.
9. **Gate positivo:** o *bundle* físico `files/DevLauncherApp-BridgelessReactNativeDevBundle.js` do
   `TAR-POST02` deve conter **somente** módulos compatíveis com `7de7085` — e nenhum símbolo
   introduzido depois. Este arquivo é a prova materializada no próprio aparelho.

## 10. Sequência física futura da `PREP-02` (**desenhada, não executada**)

> **Ordem deliberada: o Colorir 60 vem ANTES do Ateliê.** Assim a obra do C60 é produzida com
> `@ptf_creator_qa_mode` **ausente**, e o Modo Criador fica isolado como pré-requisito **exclusivo do
> Ateliê**. Isso torna a proveniência do artefato do C60 independente do *flag*.

**Bloco R — restauração do baseline** (detalhado em §11) · **Bloco P — proveniência** (§9) ·
**Bloco B — Colorir 60** · **Bloco A — Ateliê** · **Bloco F — captura e diff**.

| # | Ação | Observação |
|---|---|---|
| R1..R9 | Restaurar `TAR-PRE-LEGADO` e **provar** identidade semântica | §11 — `UNEXPECTED_COUNT` deve ser **0** antes de qualquer Metro |
| P1 | `adb logcat -c` | §12 — **única** limpeza autorizada, e só aqui |
| P2 | Iniciar `logcat` contínuo → `raw.log` da `PREP-02` | Arquivo próprio, em diretório próprio |
| P3 | Iniciar Metro **único** do *worktree* histórico + `adb reverse` | §9 itens 3–6 |
| P4 | *Cold start* do *dev client*; registrar pedido e resposta | §9 itens 7–8 |
| **B1** | Home → **Perfil** → **Área dos Pais** (`ParentalGate`, `number-pad`) | `ProfileScreen.js:323`. O `ParentalGate` é **de sessão** e **não grava nada** (`ParentalGate.js` não importa `AsyncStorage`) |
| **B2** | Abrir **🛠️ Administração (dev)** → cartão **"Colorir 60, A Criação"** → **"Abrir Luz"** | `ParentAreaScreen.js:1118` (`SHOW_TEST_TOOLS = isInternalToolsEnabled()`, `:66`) → `:1186` `navigate('Coloring', { storyId: 'creation', activityId: 'light' })`. **NÃO tocar no *switch* Modo Criador (`:1127-1134`) nem em "Abrir bancada" (`:1216`)** |
| **B3** | Pintar até a conclusão (**"Pronto!"**) | `ColoringScreen.js:1116` → `beginC60Attempt` → `:352` `saveColoring60DrawingState` → `:435` `markColoring60ActivityDone`. Produz ponteiro `v:3` + *blob* |
| **B4** | Fechar a celebração e sair pelo **Voltar** do editor | **NÃO tocar na ação principal** (abriria a 2ª atividade). `planC60Exit` (`coloring60Navigation.js:78-84`) cai em `popToTop()` quando o `StoryDetail` **não** está na pilha — que é exatamente o caso desta entrada |
| **A1** | Home → **Perfil** → **Área dos Pais** (`ParentalGate`, `number-pad`) | `ProfileScreen.js:323` |
| **A2** | Ligar o **Modo Criador** | `ParentAreaScreen.js:475` → `creatorQaMode.js:90` |
| **A3** | Sair da Área dos Pais → **Criar livre** | |
| **A4** | **Um traço**, salvar, aceitar a conquista | `AtelierCanvasScreen.js:269` (`doSave`) |
| **A5** | Sair do Ateliê | |
| F1 | `am force-stop` do *package* | Antes de qualquer captura |
| F2 | Encerrar Metro e `logcat`; `adb reverse --remove-all` | |
| F3 | Capturar `TAR-POST02.tar` | Rota canônica via `cmd.exe /c "adb exec-out run-as … tar cf - files databases shared_prefs > …"` |
| F4 | Produzir `DIFF_FISICO.txt` e `ASYNCSTORAGE_DIFF.txt` contra o `TAR-PRE02` | Comparação **semântica** (§11) |
| F5 | Avaliar as allowlists de §7 e §8 | `STOP` ou `CONFORME` |

**`D-PREP02-06` observado:** a rota narrativa **cena 1 → cena 2 → marco** **não** é usada. Nenhum dos
cinco casos a exige — o Caso 1 pede *lineart*, não narrativa.

**Por que a porta é a Área dos Pais e não o `StoryDetail` (correção de rota, `PREP02-ROTA-C60-CHECK-01`):**
com o *baseline* restaurado o cartão do piloto na tela da história fica **visível porém travado**
(§7.1.1). A entrada de `ParentAreaScreen.js:1186` despacha
`navigate('Coloring', { storyId: 'creation', activityId: 'light' })` — **os mesmos dois parâmetros, na
mesma rota**, que `planC60OpenEditorFromStory` (`coloring60Navigation.js:135`) produziria. O
`ColoringScreen` não tem como distinguir as duas origens: `resolveC60StoryId(route.params)` (`:598`) e
`route.params?.activityId` (`:599`) são a **fonte única** de identidade, e `origin`/`resumeCenaIndex`
— os únicos campos que `planC60OpenEditorFromMilestone` (`:155`) acrescenta — ficam ausentes nas duas.
Logo: **mesmo editor, mesmo *writer*, mesmo *payload*, nenhuma semeadura.** O próprio *runtime*
reconhece essa porta como entrada legítima de desenvolvimento em `coloring60Navigation.js:74`
(*"entradas de dev: bancada Colorir 60 / Área dos Pais"*).

> **A bancada (`Coloring60Lab`, `ParentAreaScreen.js:1216`) permanece PROIBIDA na `PREP-02`:** ela
> navega com `COLORING60_LAB_STORY_ID` (`Coloring60LabScreen.js:115`) — identidade **diferente** de
> `creation` — e **semeia e limpa** estado. Artefato produzido por ela seria inadmissível.

> **Divergência de *copy* registrada, não corrigida (é código):** o cartão em `ParentAreaScreen.js:1182`
> ainda diz *"Temporário: nada é salvo — não altera progresso, desenhos,
> plano nem conquistas"*. O texto
> é **obsoleto** desde que o *writer* do C60 passou a existir: `saveColoring60DrawingState` não consulta
> plano nem origem (`coloring60DrawingStorage.js:507`) e grava normalmente. O texto é *dev-only*, não
> altera comportamento e **não** é tocado aqui — `PREP02-ROTA-C60-CHECK-01` proíbe alterar código.

## 11. Procedimento de restauração do baseline (**desenhado, não executado**)

**Origem:** `C:\tmp\ptf_evidencias\PREP-LEGADO\TAR-PRE-LEGADO.tar` (16.806.912 B, `SHA256 8486DEC6…1BA7`).
**Destino:** `/data/user/0/com.valentedev.pequenostracosdefe/{files,databases,shared_prefs}`.

| # | Passo | Requisito atendido |
|---|---|---|
| R1 | `adb shell am force-stop com.valentedev.pequenostracosdefe` e **confirmar** que nenhum processo do *package* sobrevive | (1) app parado antes |
| R2 | **Rollback primeiro:** capturar `TAR-ROLLBACK-PRE-RESTORE.tar` do estado atual, pela rota canônica com `cmd.exe` | (9) rollback definido |
| R3 | Enumerar, via `run-as`, **todo** o conteúdo atual de `files/`, `databases/` e `shared_prefs/` | (6)(7) evitar órfãos |
| R4 | **Remover** o conteúdo dessas três subárvores — e **somente** delas. `cache/`, `code_cache/` e `no_backup/` **não** são tocados (não estão no `TAR` e não podem ser restaurados) | (6) sem órfãos · (7) não extrair PRE por cima do POST |
| R5 | Extrair o `TAR-PRE` **por `stdin`**, sob `run-as`, com o diretório do *package* como raiz. Sem `-p`, sem tentar restaurar dono/grupo — a extração roda com o **uid do app**, que é o dono correto | (2)(3)(4)(5) sem `install`/`uninstall`/`pm clear`/*root* |
| R6 | Conferir que `databases/RKStorage`, `databases/RKStorage-journal`, `files/` e `shared_prefs/` existem com os caminhos do `TAR-PRE` | (8) restauração semanticamente exata |
| R7 | Capturar `TAR-PRE02.tar` do estado restaurado, pela rota canônica | base da prova |
| R8 | **Comparação semântica** (§11.1) entre `TAR-PRE02` e `TAR-PRE-LEGADO` | (10) prova de identidade |
| R9 | Produzir `ASYNCSTORAGE_DIFF` do restaurado contra o `TAR-PRE` original: **`UNEXPECTED_COUNT` deve ser `0`, `ADDED=0`, `CHANGED=0`, `DELETED=0`** | exigência literal da ordem |

**`cmd.exe` é obrigatório** em qualquer transporte binário (`>` ou `<`): o redirecionamento do
PowerShell corrompe *stdout*/*stdin* binário — regra já lacrada em
[`10_RODADA_FISICA_2_F6_SG_A.md:236-244`](10_RODADA_FISICA_2_F6_SG_A.md).

### 11.1 Por que a comparação é **semântica** e não por `SHA256` do `TAR`

`10_RODADA_FISICA_2:263-265` já lacrou a razão: *"`SHA256` do `TAR` é indicador, não veredito. O `TAR`
carrega *mtime*… `True` prova identidade; `False` NÃO prova gravação"*. Um `TAR` reempacotado difere
por ordem de entradas e metadados sem que um único byte de conteúdo tenha mudado. Portanto a
identidade é estabelecida por:

1. **Conjunto de caminhos** idêntico (nenhum a mais, nenhum a menos).
2. **`length` por caminho** idêntico.
3. **`SHA256` do conteúdo de cada arquivo** idêntico.
4. **Diff lógico do `AsyncStorage`** — conjunto de chaves e `SHA256` de cada valor idênticos às 16
   chaves de §6.

**Exceção declarada:** `databases/RKStorage-journal` pode divergir em bytes sem que o conteúdo lógico
do banco mude. Divergência **apenas** nesse arquivo é registrada e **não** é `STOP`, desde que o passo
R9 (diff lógico) feche com zeros. Divergência em `databases/RKStorage` **é** `STOP`.

**Se R8 ou R9 falharem:** restaurar `TAR-ROLLBACK-PRE-RESTORE.tar` pelo mesmo procedimento, **parar** e
reportar. Não improvisar, não corrigir silenciosamente, não prosseguir para obter um resultado.

## 12. Política de `logcat`

**Recomendação:** executar `adb logcat -c` **uma única vez**, no passo **P1** de §10.

1. **Não altera o armazenamento do app** — o *ring buffer* do `logcat` é do sistema, fora do
   *sandbox* do *package*; nem `AsyncStorage`, nem `files/`, nem `shared_prefs` são tocados.
2. **Não altera evidência antiga.** `C:\tmp\ptf_evidencias\PREP-LEGADO\raw.log` (57.449.803 B,
   `SHA256 67320fcb…f9f09`) e todos os artefatos da Sessão 1 e da `PREP-01` permanecem **imutáveis**
   em disco.
3. **Ocorre somente DEPOIS** da verificação do baseline restaurado (passos R1..R9).
4. **Ocorre ANTES** do início da captura contínua da `PREP-02`.
5. **É regra exclusiva desta nova sessão.** Não retroage, não autoriza `logcat -c` em nenhuma outra
   campanha e não altera a regra da `R2 · Sessão 2`, que tem Bloco 0 próprio.

**Nesta etapa nada disso é executado.**

## 13. Evidências da `PREP-02` (**planejadas, não criadas**)

Diretório **novo**: `C:\tmp\ptf_evidencias\PREP-LEGADO-02\` (`D-PREP02-04`). **Nenhum arquivo antigo
pode ser sobrescrito**; nenhum nome colide com os da `PREP-01`.

| Arquivo | Conteúdo |
|---|---|
| `00_PROTOCOLO_CONGELADO.md` | Cópia operacional deste documento no momento da execução |
| `ALLOWLISTS.md` | §7 e §8, **como congeladas aqui** |
| `RESTORE_BASELINE_REPORT.txt` | Saída dos passos R1..R9, incluindo a comparação semântica |
| `TAR-PRE02.tar` | Captura do estado **restaurado** |
| `raw.log` | `logcat` contínuo da `PREP-02` |
| `TAR-POST02.tar` | Captura após as Rotas B e A |
| `DIFF_FISICO.txt` | Diff físico `TAR-PRE02` → `TAR-POST02` |
| `ASYNCSTORAGE_DIFF.txt` | Diff lógico de chaves e valores |
| `RUNTIME_PROVENANCE.txt` | Os nove itens de §9 |
| `FINAL_REPORT.md` | Veredito: `CONFORME` ou `STOP`, com causa |

## 14. Condições de `STOP` (pré-declaradas)

1. Baseline restaurado **divergir semanticamente** do `TAR-PRE` (§11.1), ressalvado apenas o `RKStorage-journal`.
2. `HEAD` do *worktree* histórico **≠** `7de7085`.
3. *Worktree* histórico **sujo**.
4. *Worktree* canônico sujo antes da sessão.
5. *Listener* concorrente na porta **8081**.
6. `adb reverse` preexistente e não explicado.
7. O *bundle* capturado **não** provar `7de7085`.
8. **Qualquer chave** fora da allowlist lógica de §7 — `ADDED`, `CHANGED` **ou** `DELETED`.
9. **Qualquer arquivo** fora da allowlist física de §8.
10. Arte do Ateliê **sem `STATE_V=2`**, ou **com qualquer um** de `paintSchemaVersion`,
    `layoutVersion`, `logicalW`, `logicalH`.
11. Ponteiro do C60 sem `v:3`, ou *blob* ausente após o salvamento.
12. **Qualquer ação fora da rota congelada** de §10.
13. Qualquer necessidade de instalar, desinstalar, `pm clear` ou *root*.
14. Qualquer *crash* de montagem.

**`STOP` significa:** preservar o estado e reportar. Não improvisar, não corrigir silenciosamente, não
continuar para obter um resultado.

## 15. Critérios de encerramento e o que a `PREP-02` **não** é

**Encerramento `CONFORME`** exige, cumulativamente: baseline provado (R9 com zeros) · proveniência
fechada pelos nove itens de §9 · `ASYNCSTORAGE_DIFF` sem nenhuma chave fora de §7 · `DIFF_FISICO` sem
nenhum arquivo fora de §8 · arte do Ateliê com `STATE_V=2` e os quatro eixos ausentes · ponteiro `v:3`
do C60 com *blob* presente · todas as evidências de §13 gravadas.

> ⛔ **A `PREP-LEGADO-02` NÃO executa nenhum caso da `R2` e NÃO concede `PASS` a nada.** Ela produz
> **insumo**. Os Casos 1, 10, 14 e 15/16 continuam **NÃO EXECUTADOS** até que a **`R2 · Sessão 2`** —
> campanha independente, com Bloco 0 próprio e Portão Humano próprio — os execute.
>
> ⛔ **A variante `v1` do Caso 14 permanece `INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL`**
> (`CASO14-V1-INEXECUTAVEL-01`). A `PREP-02` **não** a reabilita.
>
> ⛔ **`F6-SG-A` continua NÃO CONCEDIDO.** `R1-PEND-1..5` continuam **ABERTAS**.
> **`R2 · Sessão 2` continua NÃO INICIADA.**

## 16. `PREP-LEGADO-02-NAO-FEZ`

Até o commit que registra este documento: **nada foi executado.** Não se restaurou `TAR`; não se tocou
o aparelho; não se executou `adb`, Metro, Expo ou `logcat`; não se executou `logcat -c`; não se criou
`C:\tmp\ptf_evidencias\PREP-LEGADO-02\`; não se modificou `AsyncStorage` nem o sistema de arquivos do
app; não se instalou, desinstalou nem limpou dados; não se alterou `src/`, `scripts/`, `package.json`,
`app.json` nem `eas.json`; não se tocou o *worktree* histórico além de leitura; nenhum artefato da
`PREP-01` foi alterado. **Este documento registra e congela. Ele não executa.**

## 17. Execução de 2026-08-11 — `STOP` e auditoria causal (**posterior a este congelamento**)

> Esta seção é **anexo de fato**, escrito depois da execução física. Ela **não** reescreve nada acima:
> §1–§16 permanecem como foram congelados, inclusive onde a realidade os contrariou.

A `PREP-LEGADO-02` foi executada em 2026-08-11 e **parou no *checkpoint* do Colorir 60**:
`PRE_KEYS=16 → POST_KEYS=23`, `ADDED=7 CHANGED=0 DELETED=0`, `C60_ALLOWLIST_RESULT=STOP`. As quatro
chaves previstas por §7.1 apareceram **exatamente** como previstas; vieram acompanhadas de três
chaves fora da allowlist (`@ptf_creator_qa_mode='false'`,
`@ptf_coloring60_milestone_invite_seen_creation_light='1'`, `@ptf_progress_creation='{"1":true,"2":true}'`).
**Nenhuma continuação ao Ateliê foi autorizada. Nenhuma chave foi apagada.**

A auditoria causal somente leitura está em
[`12_AUDITORIA_PREP02_STOP.md`](12_AUDITORIA_PREP02_STOP.md). Em resumo, e sem eufemismo:

- **A rota congelada de §10 (`B1..B4`) NÃO foi a rota executada.** Perícia de `rowid` do `RKStorage` +
  canal de entrada do `InputDispatcher` provam que o editor foi aberto por um botão **dentro de um
  `<Modal>`** — o **convite do marco** da `NarrationScreen` —, depois de **duas cenas concluídas**.
  Foi percorrida a rota narrativa `cena 1 → cena 2 → marco`, a mesma da `PREP-01`, que
  `D-PREP02-06` (§10, nota de rodapé) declarava não utilizada.
- **A allowlist de §7.1 estava correta** e a de §8 foi respeitada. **A disciplina de `STOP` funcionou.**
- **§10 tem três defeitos materiais**, registrados em `D-PREP02-10`: coabitação do *switch* Modo
  Criador com o botão "Abrir Luz" no mesmo acordeão, **zero *checkpoints* intermediários** entre os
  blocos `B` e `A`, e proibições escritas fora da lista de passos do operador (§14.12 fica
  inauditável por falta de artefato que registre a rota).
- O que salvou a sessão — `CHECKPOINT-C60.tar` e `CHECKPOINT_C60_ASYNC_DIFF.txt` — **não consta** de
  §10 nem da lista de evidências de §13: foi improvisação do executor, e vira item obrigatório na
  `PREP-LEGADO-03`.

> ⛔ **A `PREP-LEGADO-02` permanece `STOP`.** Nenhuma allowlist é ampliada retroativamente; nenhum
> artefato é descartado; nenhum `TAR` é refeito. **`R2 · Sessão 2` continua NÃO INICIADA** e
> **`F6-SG-A` continua NÃO CONCEDIDO.**
