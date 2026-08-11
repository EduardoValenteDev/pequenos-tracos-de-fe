# `PREP-LEGADO-03` — execução, perícia independente e veredito (2026-08-11)

> **Precedência.** Este documento **acrescenta**. Não reescreve, não reabilita e não anula nada.
> `PREP-LEGADO-01` = **`STOP`** e `PREP-LEGADO-02` = **`STOP`** — e assim permanecem.
> Protocolo da `PREP-02`: [`11_PREP_LEGADO_02.md`](11_PREP_LEGADO_02.md).
> Auditoria causal do seu `STOP`: [`12_AUDITORIA_PREP02_STOP.md`](12_AUDITORIA_PREP02_STOP.md).
> Decisões canônicas: [`docs/DECISIONS.md`](../../../docs/DECISIONS.md) §`PREP-LEGADO-03-FECHO`.

**O que este documento faz:** audita de forma independente as evidências da `PREP-LEGADO-03`,
emite o veredito formal sobre o acervo e registra o que a execução provou **empiricamente**.

**O que este documento NÃO faz:** não concede `PASS` a nenhum caso da `R2`, não concede `F6-SG-A`,
não inicia a `R2 · Sessão 2`, não corrige o achado visual de §8.

---

## 1. Estado de entrada e método

| Item | Valor | Conferido |
|---|---|---|
| Worktree canônico | `C:\tmp\ptf_fase6_shell_splash_wt` · `feat/fase6-shell-splash` · `8b1daf1` · árvore **limpa** | ✅ |
| Worktree histórico (*runtime* da `PREP`) | `C:\tmp\ptf_colorir_canonical_runtime_wt` · `docs/e015-phase3-artifacts` · `7de7085` · árvore **limpa** | ✅ |
| Evidência | `C:\tmp\ptf_evidencias\PREP-LEGADO-03\` — tratada como **somente leitura** | ✅ |

**Método da auditoria.** Quatro frentes independentes em paralelo (custódia · perícia de `SQLite` e
*blobs* · reconciliação dos casos · desenho da `R2 S2`), mais integração e verificações de primeira
mão. **Nenhum relatório pré-existente foi aceito como prova**: todo número foi recalculado do zero.
Nenhum aparelho, `adb`, Metro, `logcat` ou restauração de `TAR`. Toda inspeção de banco em **cópias**
extraídas para diretório temporário, abertas com `mode=ro`.

Classificação usada: **OBSERVADO** · **INFERIDO** · **NÃO DETERMINADO** ·
**`INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL`**. **Ausência de prova não vira `PASS`.**

---

## 2. Cadeia de custódia — 23/23 hashes conferidos

Todos recalculados com `sha256sum` sobre os arquivos originais. **Nenhuma divergência.**

| Artefato | `SHA256` | Papel |
|---|---|---|
| `TAR-ROLLBACK-PRE03.tar` | `C556D264…83E0952` | Estado vivo **preservado antes** de restaurar — idêntico ao `TAR-STOP-C60` da `PREP-02` |
| `TAR-PRE03.tar` | `8486DEC6…FF1BA7` | *Baseline* restaurado — **byte-idêntico** ao `TAR-PRE02.tar` |
| `G0`…`G3` `TAR` | `27C7769A…16214F6` (os **quatro** iguais) | *Boot*, Área dos Pais, acordeão, editor aberto |
| `G0`…`G3` `CHECK` | `ED531A43…BC1BBB1D` (os **quatro** iguais) | `ADDED=0 CHANGED=0 DELETED=0` |
| `G4-C60-SAVED.tar` | `D5318D36…DCC33F923` | `CHECK` `6C7B2C68…179BC127` |
| `G5-CREATOR-ON.tar` | `14CF6798…DC7EE4380` | `CHECK` `EDC580F4…5F9D28BE8` |
| `A1-ATELIER-OPEN-PREPAINT.tar` | `14CF6798…DC7EE4380` — **igual ao `G5`** | `CHECK` `9E71F96B…059D7BC1C` |
| `A2-BLOCKED-NAME-SHEET-PRE-SAVE.tar` | `FE448167…83301E62` | Estado congelado **antes** de resolver o bloqueio visual |
| `A2-ATELIER-SAVED.tar` | `8398EE72…3FBB6A923` | Obra do Ateliê gravada |
| `TAR-POST03.tar` | `14FFA2E4…D3E25574` · **17.033.728 B** | Lacre final |
| `A2-NAME-SHEET-BLOCKED.png` | `8317D474…D5642E27` · 449.056 B | Prova visual do achado de §8 |
| `A2-UI-HIERARCHY.txt` | `FB965FAD…4BAC619359` | ⚠️ ver §8.2 |
| `FINAL_PRE03_POST03_ASYNC_DIFF.txt` | `FC063888…2C74EC0` | ⚠️ ver §7 |
| `raw.log` | `48DED077…47A39E02EF` · 15.315.964 B | Captura contínua |

**Âncoras de cadeia entre campanhas — OBSERVADAS:**

1. `TAR-ROLLBACK-PRE03 = TAR-STOP-C60` da `PREP-02` ⇒ o estado terminal da `PREP-02` **não foi
   destruído** pela restauração; ele existe em dois lugares e continua auditável.
2. `TAR-PRE03 = TAR-PRE02 = TAR-PRE-LEGADO` (`8486DEC6…`) ⇒ o *baseline* é **um só**, rastreável em
   linha reta até a `PREP-01`. As três campanhas partiram do **mesmo** ponto declarado.
3. Bônus de custódia: `TAR-LEGADO = TAR-ROLLBACK-PRE-RESTORE` (`EF27CD3A…`).

### 2.1 ⚠️ Correção de rigor — o que prova o *restore*

Uma versão anterior desta seção afirmava que a igualdade `TAR-PRE03 = TAR-PRE02` provava que **o
*restore* no aparelho** reproduziu o *baseline* byte a byte. **Isso não se sustenta.** Ambos os
arquivos são **anteriores** ao início do `raw.log`, e **nenhum `tar -cf` ou restauração aparece no
`raw.log` antes de `16:33:41`**. A igualdade é, portanto, **INFERIDA** como preservação de artefato
(cópias do lado do PC) — ela prova **custódia**, não prova a operação física no aparelho.

**A prova correta do *restore* é outra — e é mais forte, porque veio do aparelho:**

> `G0-POST-BOOT` foi extraído **do aparelho** às **`16:33:41.078`** e o seu `databases/RKStorage` é
> **byte-idêntico** ao do *baseline* (`SHA256 B7F8FA36…5B5EAB2B`), permanecendo idêntico até `G3`.

Isto é `OBSERVADO`: o estado **realmente lido do dispositivo** após o *boot* é o *baseline* esperado.
A distinção importa — *hash* de arquivo em disco do PC não é evidência de operação em dispositivo.

Nenhum arquivo da `PREP-01` ou da `PREP-02` foi alterado, apagado ou sobrescrito. Todos os seus
*mtimes* são **≤ 15:57**, anteriores ao início da `PREP-03` (**16:31**).

---

## 3. Perícia independente do `TAR-POST03`

### 3.1 Inventário físico — 13 arquivos, nenhum inesperado

`SHA256` do `TAR` reproduzido exatamente. Conteúdo completo: `databases/RKStorage` (45.056 B),
`databases/RKStorage-journal` (**0 B** — sem transação pendente), `files/profileInstalled`,
`files/phenotype_storage_info/shared/storage-info.pb`,
`files/DevLauncherApp-BridgelessReactNativeDevBundle.js`, os **três** *blobs* do produto e seis
`shared_prefs/*.xml`.

**Todos os arquivos cabem na allowlist física de `11_PREP_LEGADO_02.md` §8.** Não existe
`files/ptf_blobs/drawings/`, não existe *slot* `.b.png`, não existe `RKStorage-wal`. **Nenhuma
escrita ficou fora do lacre** — não há `WAL` com páginas não aplicadas.

### 3.2 `catalystLocalStorage` — 23 chaves, `ADDED=7 CHANGED=0 DELETED=0`

Recalculado independentemente. `PRAGMA integrity_check = ok`. As **sete** adições são **exatamente**
as sete esperadas — nenhuma a mais, nenhuma a menos. As **quatro** chaves proibidas estão
**AUSENTES**, e nenhuma chave do acervo contém as *substrings* `progress`, `finale`, `invite` ou
`milestone`.

### 3.3 Forense de `rowid` — a prova mais forte deste acervo

O `AsyncStorage` do Android grava com `INSERT OR REPLACE`: reescrever uma chave **apaga a linha antiga
e reinsere no fim**, deixando o `rowid` antigo **vago**. Logo, a ordem de `rowid` **é** a ordem de
gravação, e um `rowid` realocado **é prova de reescrita**.

| `rowid` | Chave | Leitura |
|---|---|---|
| **43** | `@ptf_drawing60_screation_alight` | ponteiro `v:3` |
| **44** | `@ptf_coloring60_done_creation_light` | `'true'` |
| **45** | `@ptf_coloring60_snap_creation_light` | `'ready'` |
| **46** | `@ptf_coloring60_ever_creation_light` | `'true'` — **fim do bloco C60 (`G4`)** |
| **47** | `@ptf_creator_qa_mode` | `'true'` — **bloco isolado (`G5`)** |
| **48** | `@ptf_criar_livre_orientation_seen_v1:star` | `'1'` — **reescrita idempotente**, antes no `rowid` **30** (janela `A1 → A2-BLOCKED`, ver §3.3.1) |
| **49** | `ptf_atelier_arts_v1_art_1786479103982_6079` | registro completo |
| **50** | `ptf_atelier_arts_v1_index` | índice — **fim do bloco Ateliê (`A2`)** |

**O que isto prova, sozinho:**

- **`rowid` 43–50 é uma sequência densa, sem lacuna intercalada** ⇒ cada chave foi gravada
  **exatamente uma vez**. Não houve toque repetido em nenhum controle. *(Contraste direto com a
  `PREP-02`, onde os `rowid` 43 e 45 vagos denunciaram o duplo toque no *switch*.)*
- A **única** lacuna nova em relação ao *baseline* é o `rowid` **30**, e ela existe porque a chave que
  o ocupava reapareceu no **48**. As outras 26 lacunas são **herdadas do `PRE03`** e não pertencem a
  esta sessão.
- A ordem física **43 → 46** (ponteiro antes das *flags*) e **49 → 50** (registro antes do índice)
  reproduz a ordem do código: `atelierStorage.js:137` grava o registro e `:146` o índice.
  **Cross-validação da técnica contra a fonte.**
- `@ptf_achievements_seen` **manteve o `rowid` 20 nos seis *snapshots*** ⇒ **não foi tocada**. Isto
  não é "não observada": é **REFUTAÇÃO** da previsão de escrita da allowlist (ver §9.2).
- **15 das 16 chaves do *baseline* têm `rowid` provadamente intacto** (a 16ª é a de §3.4). Isto é
  **prova positiva de ausência de mutação silenciosa** — estritamente mais forte que `CHANGED=0`,
  que é compatível com qualquer número de reescritas idempotentes.

#### 3.3.1 Localização exata da reescrita — verificada de primeira mão

Rastreando a chave nos **sete** *snapshots*, o `rowid` só se move em **uma** transição:

| *Snapshot* | `sha256[:16]` do `RKStorage` | chaves | `rowid` da chave |
|---|---|---|---|
| `baseline-ref` | `b7f8fa36d1926475` | 16 | **30** |
| `G4-C60-SAVED` | `7cb7ab23bf61ea3b` | 20 | **30** |
| `G5-CREATOR-ON` | `069022d8e26f0300` | 21 | **30** |
| `A1-ATELIER-OPEN-PREPAINT` | `069022d8e26f0300` | 21 | **30** |
| **`A2-BLOCKED-NAME-SHEET-PRE-SAVE`** | **`be6aec0377a3fc6e`** | **21** | **48** ⬅ |
| `A2-ATELIER-SAVED` | `8faf5f0c2ff8069b` | 23 | **48** |
| `POST03-EXTRACTED` | `8faf5f0c2ff8069b` | 23 | **48** |

`A1 → A2-BLOCKED`: **`ADDED=0 DELETED=0 CHANGED=0`** e **`ROWID_MOVED=1`**, com valor idêntico.

> 🔬 **A reescrita ocorreu durante a pintura, ANTES do *save*** — não no *save*. É precisamente o
> comportamento de `AtelierCanvasScreen.js:173` (`hideOrientation()` no primeiro traço), e **não** do
> *writer* de arte. A janela `A1 → A2-BLOCKED` é um *checkpoint* que **o desenho não pedia** (§9): sem
> ele, esta escrita seria atribuível apenas ao intervalo inteiro `A1 → A2`, e o mecanismo ficaria
> `INFERIDO`. Com ele, é **OBSERVADO**.
>
> Note que este *snapshot* é o retrato perfeito da armadilha: **21 chaves antes, 21 depois, nenhum
> valor diferente — e ainda assim houve `I/O` de escrita.**

### 3.4 A reescrita do `rowid` 30 → 48 é **a allowlist §7.2 se confirmando**

`11_PREP_LEGADO_02.md:291` pré-declarou `@ptf_criar_livre_orientation_seen_v1:star` como
*"**REESCRITA COM VALOR IDÊNTICO `'1'`** — permitida; **qualquer outro valor ⇒ `STOP`**"*, porque
`AtelierCanvasScreen.js:173` chama `hideOrientation()` no primeiro traço **incondicionalmente**.

**Foi exatamente isso que aconteceu**: `rowid` realocado (houve `setItem`), valor inalterado (`'1'`).
`CHANGED=0` permanece **correto** — o diff lógico é nulo por identidade de valor, e a escrita
redundante estava **prevista**. Não é falha; é a previsão do protocolo se confirmando na física.

> 📌 **Achado metodológico.** Um diff `key→value` classifica isto como "nada aconteceu". Só o `rowid`
> mostra que houve escrita. **Um instrumento que só compara valores não prova ausência de mutação** —
> e isso governa o desenho da `R2 · Sessão 2` (ver [`14_R2_SESSAO_2.md`](14_R2_SESSAO_2.md) §4).

### 3.5 Progressão entre *checkpoints* — verificada de forma independente

| Transição | Resultado | Leitura |
|---|---|---|
| `PRE03 → G0 → G1 → G2 → G3` | **16 chaves, `ADDED=0 CHANGED=0 DELETED=0`**; os quatro `TAR` **byte-idênticos** | *boot*, `ParentalGate`, acordeão e **abrir o editor** não gravam nada |
| `G3 → G4` | `ADDED=4` (`rowid` 43–46) | o *save* do C60 grava **exatamente** as quatro chaves de §7.1 |
| `G4 → G5` | `ADDED=1` (`rowid` 47) | o *switch* grava **só** `@ptf_creator_qa_mode` |
| `G5 → A1` | `RKStorage` **byte-idêntico** | **abrir o Ateliê antes de pintar não grava nada** |
| `A1 → A2-BLOCKED` | `ADDED=0 CHANGED=0 DELETED=0` + **1 `rowid` realocado** (30 → 48) | **pintar** grava só a *flag* de orientação prevista (§3.3.1) |
| `A2-BLOCKED → A2-SAVED` | `ADDED=2` (`rowid` 49–50), **nenhum `rowid` realocado** | o *save* grava **exatamente** a obra e o índice — e **nada mais** |
| `A2 → POST03` | `ADDED=0 CHANGED=0 DELETED=0`; `RKStorage` **byte-idêntico**; os três *blobs* com `SHA256` idêntico | **nada foi gravado depois do *save*** |

Progressão **16 → 20 → 21 → 21 → 21 → 23** confirmada.

### 3.6 Nenhuma escrita ficou fora do lacre — prova por modo de *journal*

Uma objeção legítima a qualquer perícia de `SQLite` em `TAR`: *e se houvesse páginas sujas num `WAL`
não capturado?* Verificado nos **seis** bancos:

- **Nenhum** `RKStorage-wal` ou `RKStorage-shm` existe em **nenhum** `TAR` da campanha.
- `PRAGMA journal_mode` = **`delete`** em todos (não é `WAL`).
- Bytes **18–19** do cabeçalho `SQLite` = **`01 01`** (`WAL` seria `02 02`) — confirmação **no
  arquivo**, independente do `PRAGMA`.
- `RKStorage-journal` = **0 B**; `freelist_count = 0`; `integrity_check = ok`.

> ✅ Consequência: o `check_async.py` **ignorar** os sufixos `-wal`/`-shm`/`-journal` (linhas 12–13) é
> **inócuo neste acervo** — não há nada nesses arquivos para ignorar. **Cada `TAR` é um estado
> completo e consistente.**

---

## 4. Validação do insumo C60

| Verificação | Resultado |
|---|---|
| Ponteiro `v` | **3** ✅ |
| `fmt` | **2** ✅ |
| `mime` | **`image/png`** ✅ |
| `rev` | **22** ✅ |
| `paintedPx` / `paintablePx` | **2.123.494 / 2.317.520** ✅ (≈ **91,6 %** de preenchimento) |
| *Blob* apontado pela `uri` | `files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.a.png` — **presente** ✅ |
| Tamanho / `SHA256` | **200.565 B** / `6814DEE7…1C83F81` ✅ |
| PNG válido | *magic* `89 50 4E 47…` · `IHDR` **1440×2156**, 8 bits, RGBA · **`IEND` presente** (não truncado) ✅ |
| **Corroboração cruzada** | `IHDR` **1440×2156** = `W`/`H` do ponteiro. **Ponteiro e *blob* são mutuamente consistentes.** |

O insumo do C60 é **real, íntegro e autoconsistente**.

---

## 5. Validação do insumo Ateliê

| Verificação obrigatória | Resultado |
|---|---|
| `schema == 2` | **2** ✅ |
| `stateJson.v == 2` | **2** ✅ (*string* JSON aninhada — parse duplo) |
| `strokes > 0` | **12 *strokes*, 824 pontos, 4 cores, 0 borrachas** ✅ |
| `stamps` é lista | **`[]`** ✅ |
| `bgColor` presente | **`#FFFDF8`** ✅ |
| `paintSchemaVersion` | **AUSENTE** ✅ |
| `layoutVersion` | **AUSENTE** ✅ |
| `logicalW` | **AUSENTE** ✅ |
| `logicalH` | **AUSENTE** ✅ |

A ausência foi verificada por **busca recursiva em todos os níveis** do registro, do `stateJson`
desserializado e do índice, **mais** busca literal por *substring* nos bytes brutos do `SQLite`. O
conjunto **exaustivo** de nomes de campo existentes é: `bgColor, color, createdAt, eraser, id,
mission, points, previewBase64, previewUri, schema, size, stamps, stateJson, strokes, title,
updatedAt, v, x, y`. **Nada além disso existe.** Esta ausência é a **propriedade probatória** que o
Caso 14 exige.

**Índice ↔ registro:** mesmo `id`, mesmo `title`, mesmo `schema`, mesmos `createdAt`/`updatedAt`,
`len(index) == 1`. **Concordantes.**

**Sem *base64* persistido:** `previewBase64: null` e `thumbnailBase64: null`, coerente com
`atelierStorage.js:123,135` (o *fallback* inline só existe se a gravação em arquivo falhar). O
caminho de arquivo foi usado, como manda a arquitetura.

**Blobs:** `art_1786479103982_6079_preview.jpg` **89.593 B** `FDC55296…C83F81…` e
`art_1786479103982_6079_thumb.jpg` **14.730 B** `A5FB5908…F057C793…` — ambos JPEG válidos
(`FF D8 FF` … `FF D9`), 809×1098 e 300×407, e ambos são exatamente os arquivos apontados por
`previewUri` / `thumbnailUri`.

**Consistência temporal interna:** o `id` `art_**1786479103982**_6079` decodifica para
`2026-08-11T20:11:43.982Z` = **17:11:43,982 local (−03:00)**, exatamente o `createdAt` gravado — e
compatível com o *mtime* do `A2-ATELIER-SAVED.tar` (17:12). O artefato é **internamente coerente**.

---

## 6. Microverificação de *encoding* — **CLASSIFICAÇÃO `A`**

O relatório final `PRE03→POST03` exibe o título como **`Desenho de fÚ`**; o *checkpoint* `A2` exibia
**`Desenho de fé`**. A divergência **não** foi assumida como "coisa de console".

**O que há no *storage*** — lido como **bytes crus** da coluna `value`, sem decodificação
intermediária, com o resultado gravado em arquivo e **relido do arquivo**:

```
registro: 22 74 69 74 6C 65 22 3A 22 44 65 73 65 6E 68 6F 20 64 65 20 66 C3 A9 22 …
          b'"title":"Desenho de f\xc3\xa9","mission":null,'
índice:   b'"title":"Desenho de f\xc3\xa9","createdAt":"20…'
```

- *Codepoint*: **`U+00E9`** — `LATIN SMALL LETTER E WITH ACUTE`.
- Bytes UTF-8: **`C3 A9`** — UTF-8 **canônico**.
- `json.dumps(ensure_ascii=True)` ⇒ `"Desenho de f\u00e9"`.
- Registro **e** índice: bytes idênticos; igualdade estrita **`True`**.
- Testes negativos: `\u00e9` escapado **ausente**; `E9` Latin-1 solto **ausente**; *mojibake* duplo
  `C3 83 C2 A9` **ausente**; `U+FFFD` **ausente**.
- **Mesmo resultado no banco do `A2-ATELIER-SAVED.tar`** ⇒ o valor **nasceu correto** e **permaneceu
  correto** até o `POST03`.

> ✅ **CLASSIFICAÇÃO `A` — artefato de *encoding*/transcrição.** **O *storage* contém
> `Desenho de fé`.** A forma `fÚ` é **apresentação**, não dado.

**Mecanismo, determinado** (OBSERVADO + INFERIDO): `check_async.py:93` imprime
`repr(post[k])`, e o `repr()` do Python 3 **preserva `é` legível**. Ao escrever em *stdout*
redirecionado no Windows, o Python codifica em **CP1252** ⇒ byte **`E9`**. O PowerShell decodificou
esse *stdout* como **CP850/CP858** (console OEM), onde **`0xE9 = Ú`**, e o `Out-File` gravou `Ú` em
**UTF-16LE** — o arquivo `FINAL_PRE03_POST03_ASYNC_DIFF.txt` **é UTF-16LE com BOM** (`FF FE`),
49.566 B, 29 linhas. Decodificado corretamente, ele **realmente contém `U+00DA`**: o dano é do
**transporte de relatório**, não do banco.

**Página de código refutada:** **CP437 está descartada** — nela `0xE9` mapeia para `U+0398` (`Θ`),
não para `Ú`. Só as famílias **CP850/CP858** produzem o `Ú` observado. O mecanismo não é hipótese
genérica de "mojibake": é **uma** cadeia de transcodificação identificada.

**Consequência para a `R2 · Sessão 2`:** todo relatório passa a ser gravado em **UTF-8 explícito**, e
toda conferência de texto com acento é feita sobre **bytes**, nunca sobre a renderização
(ver [`14_R2_SESSAO_2.md`](14_R2_SESSAO_2.md) §4).

---

## 7. Duas armadilhas de leitura nos artefatos (registradas para não repetir)

### 7.1 `BASELINE_EQUAL=STOP` **não é reprovação**

`check_async.py:121-124` imprime `"PASS" if pre == post else "STOP"` — comparação do **dicionário
inteiro**. Como a `PREP-03` adicionou 7 chaves **de propósito**, `STOP` ali significa apenas
**`PRE ≠ POST`**, que é o resultado **esperado e desejado** do relatório final. Nos *checkpoints*
`G0…G3`, onde nada devia mudar, o mesmo token **`PASS`** é que carrega significado.

**O mesmo rótulo troca de sentido conforme o *checkpoint*.** É a segunda ocorrência da classe de
defeito já registrada em `AUDITORIA-PREP02-STOP-01` para o `BUNDLE_PROVENANCE_PRE_C60.txt`
(*"não emite veredito e, lido sem análise, induz a erro"*). **Instrumento deve emitir veredito
nomeado pelo que mede.**

### 7.2 `A2-UI-HIERARCHY.txt` **não contém hierarquia**

O arquivo tem 37 bytes e o seu conteúdo integral é:

```
UI hierchary dumped to: /dev/tty
```

O `uiautomator dump` escreveu a árvore no **terminal**, e o arquivo capturou só a linha de status.
**A hierarquia de UI do *sheet* bloqueado NÃO foi preservada.** O `SHA256` confere — o arquivo é
autêntico; o que ele não é, é útil. Consequência: as **coordenadas e limites** do botão
"Guardar desenho" são **NÃO DETERMINADOS**. O achado visual de §8 se sustenta pelo **PNG** e pela
observação humana, **não** por hierarquia.

### 7.3 Lacuna de reprodutibilidade — o instrumento de `G4`/`G5` **não está versionado**

`check_async.py` (2.645 B) **está** preservado na evidência, e é o instrumento do relatório final.
Mas `G4_C60_ASYNC_CHECK.txt` e `G5_CREATOR_ASYNC_CHECK.txt` contêm campos que **esse script é
incapaz de emitir**: `=== G4 C60 DIFF ===`, `G4_ALLOWLIST_RESULT=`, `CREATOR_MODE=`, `POINTER_*`.

> ⚠️ **O programa que gerou esses dois relatórios não foi preservado.** Eles **não são
> reproduzíveis a partir da evidência**.

**Impacto material: nenhum, neste caso** — todos os números desses dois arquivos foram
**recalculados diretamente do `SQLite`** por duas frentes independentes (§3.2, §3.5, §4) e conferem.
A evidência **primária** (os `TAR`) é suficiente sem eles. Mas a lacuna é real e vira regra:
**na `R2 · Sessão 2`, todo instrumento é versionado junto com a sua saída**
(ver [`14_R2_SESSAO_2.md`](14_R2_SESSAO_2.md) §4).

### 7.4 O `raw.log` **emudece** antes de `G5`, `A1` e `A2`

O `raw.log` (15.315.964 B) é contínuo e íntegro do ponto de vista do `logcat`. Mas a saída do
*runtime* JavaScript **cessa por completo**:

> **Última linha `ReactNativeJS` da campanha: `08-11 16:48:01.502`** (110 linhas no total).
> **`G5`, `A1` e `A2` não têm nenhum log do aplicativo.**

**A causa é `NÃO DETERMINADA`** — não foi observado `am_crash`, ANR, `FATAL` nem reinício de
processo: o `Start proc 32379` de `16:33:19` sobrevive até `17:15:36`, e o *force-stop* **precede** a
extração final do `TAR` (`17:15:53.616`). O app **não** morreu; apenas parou de emitir.

**O que isto significa — e o que não significa.** O *save* da obra **não** é provado por log do
aplicativo. Ele é provado por: (1) o estado persistido e periciado (§3, §5); (2) a correlação com o
`InputDispatcher`/IME de §8.2. Como o `AsyncStorage` **nunca** emite `logcat` (nem quando tudo
funciona), o log nunca seria a prova da gravação — mas a sua ausência remove uma **corroboração
independente** que existia nas etapas anteriores. **Registrado como fragilidade, não como falha.**

---

## 8. Achado visual real — *sheet* "Nomeie seu desenho"

### 8.1 O achado

No **SM-X510**, ao salvar uma obra nova no `Criar Livre`, o *sheet* **"Nomeie seu desenho"** abriu
**parcialmente abaixo/atrás da barra fixa inferior**. O campo de texto ficou **parcialmente visível**
e a ação visual **"Guardar desenho" ficou inacessível**.

**Classificação: `ACHADO VISUAL REAL` do *runtime* histórico `7de7085`.**

O estado foi **congelado antes** de qualquer solução: `A2-BLOCKED-NAME-SHEET-PRE-SAVE.tar`
(`FE448167…`) + `A2-NAME-SHEET-BLOCKED.png` (449.056 B, `8317D474…`). Isso é disciplina de evidência
e merece registro: **preservou-se o defeito antes de contorná-lo.**

### 8.2 Por que **não** invalida o *writer*

A leitura estática de `7de7085` mostra que o campo tem `returnKeyType="done"` e
`onSubmitEditing={confirmName}`, e que `confirmName()` → `resolveArtTitle(…)` → `performSave(…)`.
O operador usou **somente a interação nativa prevista pelo próprio componente**: campo real →
teclado Samsung → **Done/Concluído** → `onSubmitEditing` → `confirmName` → `performSave`.

**Sem `adb input`. Sem coordenada artificial. Sem rotação. Sem alteração de *display*. Sem
modificação de *runtime*.**

O caminho acionado é o **mesmo** que o toque no botão acionaria. O *writer* executou com sucesso — e
a perícia de §3, §5 e §6 prova o resultado. **O defeito é de apresentação; a gravação é legítima.**
Confundir os dois seria descartar um insumo válido por um problema de *layout*.

#### 8.2.1 Duas corroborações independentes no `raw.log`

Ambas vêm de **fora do processo do aplicativo**, o que as torna imunes ao silêncio de §7.4.

**(a) Testemunha externa de que o *sheet* existiu, com o rótulo esperado** — o *autofill* do sistema
inspecionou o campo de texto:

```
08-11 16:55:46.960  4095  4116 I [PASS][SPAF]AutofillHintExtension:
    findFromEditText() / entry [null], hint [Nome do desenho] => username
```

O **PID 4095** é o Samsung Pass — **não** é o aplicativo. Um componente do sistema operacional
registrou, de forma independente, um `EditText` real com o *hint* **`Nome do desenho`**. O *sheet*
não é interpretação de captura de tela: **é objeto real na hierarquia do sistema.**

**(b) Correlação temporal do `Done` com a gravação — 111 ms:**

| Evento | Origem | Horário local |
|---|---|---|
| IME **ocultado** (teclado fechado após `Done`) | `logcat` (sistema) | `17:11:43.871` |
| `createdAt` da obra gravada | `SQLite` (`POST03`) | `17:11:43.982` |
| **Δ** | | **+111 ms** |

O `createdAt` é gerado **dentro** de `performSave`. Um intervalo de **111 ms** entre o fechamento do
teclado e o carimbo de tempo do registro é exatamente o esperado da cadeia
`onSubmitEditing → confirmName → resolveArtTitle → performSave`, e **incompatível** com qualquer
gravação desacoplada da ação do operador. **Duas fontes de relógio distintas convergem.**

> 🔬 Estas duas corroborações **não dependem** do `raw.log` do aplicativo. É por isso que o silêncio
> de §7.4 enfraquece, mas **não** derruba, a prova da interação real.

### 8.3 Escopo — o que **não** se faz agora

**Não corrigir. Não alterar `7de7085`. Não ampliar escopo.** O item entra no inventário de achados
visuais como registro, na mesma disciplina de `docs/DECISIONS.md` §`PF6SGA-R1-VISUAL`
(*"achado fora de `F6-R3` vira registro, não vira trabalho não autorizado"*) — e **sem contradizê-lo**:
aquele inventário cobre cinco achados **da `R1`**, observados no *runtime* **canônico**; este é um
achado **da `PREP-03`**, no *runtime* **histórico**, e por isso é registrado **em separado**, não
acrescentado à tabela de lá.

⚠️ **Ressalva honesta:** o achado é do `7de7085`. **Se o `HEAD` atual reproduz ou não o mesmo
problema é `NÃO DETERMINADO`** — não foi testado, e não pode ser inferido daqui. Investigar isso é
trabalho próprio, fora desta campanha.

---

## 9. Desenhado × executado — a `PREP-03` cumpriu o desenho e o **excedeu**

O desenho está em `12_AUDITORIA_PREP02_STOP.md` §9. Comparação:

| Item desenhado (§9.2/§9.4) | Executado | |
|---|---|---|
| *Baseline* = `TAR-PRE02` | `TAR-PRE03` **byte-idêntico** | ✅ |
| `G0` após o *boot*, antes de qualquer toque | `G0-POST-BOOT` | ✅ |
| `G1` ao entrar na Área dos Pais | `G1-PARENT-AREA` | ✅ |
| `G2` com o acordeão aberto — **prova positiva de `@ptf_creator_qa_mode` AUSENTE** | `G2-ADMIN-EXPANDED` | ✅ |
| `G3` editor montado, antes de pintar | `G3-C60-OPEN-PREPAINT` | ✅ |
| `G4` imediatamente após o *save* | `G4-C60-SAVED` | ✅ |
| `G5` após ligar o Modo Criador, antes do Ateliê | `G5-CREATOR-ON` | ✅ |
| C60 **antes** do Modo Criador | `rowid` 43–46 **antes** de 47 — **prova física** | ✅ |
| Sem narrativa, sem `StoryDetail`, sem bancada, sem *seed*, sem automação | `@ptf_progress_creation` e `_milestone_invite_seen_*` **ausentes** | ✅ |
| — | **`A1-ATELIER-OPEN-PREPAINT`** — *checkpoint* **extra**, não previsto | ➕ |
| — | **`A2-BLOCKED-NAME-SHEET-PRE-SAVE`** — lacre **extra** do defeito | ➕ |

**A execução acrescentou dois *checkpoints* que o desenho não pedia** — e ambos produziram prova:
`A1` estabeleceu que **abrir o Ateliê não grava nada**, e `A2-BLOCKED` preservou o achado visual. É a
correção direta do defeito `P-2` da `PREP-02` (*"zero *checkpoints* intermediários"*), levada além do
que fora especificado.

### 9.1 A `PREP-03` **validou empiricamente** o veredito `A*` da auditoria anterior

`AUDITORIA-PREP02-STOP-01` concluiu que a rota `B1..B4` era **correta por análise estática**, mas
**não validada empiricamente**, porque nunca chegara a ser executada. **Agora foi.** `G3 → G4`
produziu `ADDED=4`, exatamente as quatro chaves de §7.1, com o Modo Criador **ausente** e sem
qualquer passagem pela `NarrationScreen`.

> ✅ **A ressalva do veredito `A*` está resolvida.** A rota do C60 é correta **por análise e por
> execução**. Isso **não** reabilita a `PREP-02`, que permanece `STOP` pelo que **de fato** ocorreu
> lá — a rota executada foi outra.

### 9.2 A allowlist §7.2 também se confirmou

Ela previa **cinco** toques na rota do Ateliê. Ocorreram **quatro**: as três chaves novas
(`@ptf_creator_qa_mode`, registro, índice) e a reescrita idempotente de
`@ptf_criar_livre_orientation_seen_v1:star`. O quinto, `@ptf_achievements_seen`, **não ocorreu**.

**E aqui a forense de `rowid` entrega um grau de prova que o diff não alcança.** O `rowid` **20** da
chave é **fixo nos seis *snapshots***. Logo a previsão de escrita de `useAchievementCelebration`
(`AtelierCanvasScreen.js:63`) não é apenas *não observada*: ela é **REFUTADA** — a chave é
**provadamente não tocada** nesta rota (nenhuma conquista nova foi desbloqueada).

| | `@ptf_criar_livre_orientation_seen_v1:star` | `@ptf_achievements_seen` |
|---|---|---|
| Previsão da allowlist | reescrita idempotente permitida | escrita possível |
| Diff `key→value` diria | "nada aconteceu" | "nada aconteceu" |
| `rowid` diz | **30 → 48 — ESCREVEU** | **20 fixo — NÃO ESCREVEU** |
| Estatuto | **CONFIRMADA** | **REFUTADA** |

Duas previsões indistinguíveis para o instrumento em uso, e **opostas** na física. **Allowlist prevê
o permitido, não obriga o previsto.** Prever a mais é conservador e correto; prever a menos foi o que
derrubou a `PREP-01`.

---

## 10. Veredito formal

> ## ✅ `PREP-LEGADO-03` = **CONCLUÍDA COM ACERVO ADMISSÍVEL**

Sustentado por, cumulativamente:

1. **Cadeia de custódia fechada** — 23/23 hashes; *baseline* reproduzido byte a byte; estado anterior
   preservado antes da restauração (§2).
2. **Diff independente conferido** — `ADDED=7 CHANGED=0 DELETED=0`, as sete exatas, as quatro
   proibidas ausentes (§3.2).
3. **Ordem física provada** — `rowid` 43–50 denso, C60 **antes** do Modo Criador, nada gravado depois
   do `A2` (§3.3, §3.5).
4. **Insumo C60 íntegro e autoconsistente** — ponteiro `v:3`/`fmt:2`/`image/png` e *blob* PNG com
   `IHDR` batendo com o ponteiro (§4).
5. **Insumo Ateliê íntegro e probatório** — `schema 2`, `stateJson v 2`, 12 *strokes*, e os **quatro
   eixos legados exaustivamente ausentes** (§5).
6. **Nenhuma mutação silenciosa** — a única reescrita detectada estava **pré-declarada** na allowlist
   e é idempotente (§3.4).
7. **Título íntegro no *storage*** — `C3 A9`, `CLASSIFICAÇÃO A` (§6).
8. **Interação real do começo ao fim** — sem *seed*, sem fabricação, sem bancada, sem automação por
   coordenada; o único contorno usado foi a ação nativa `onSubmitEditing` do próprio componente (§8).

### 10.1 O que este veredito **NÃO** concede

| | |
|---|---|
| ⛔ | **`PREP-LEGADO-01` = `STOP`** — permanece. Sem reabilitação, sem ampliação retroativa de allowlist. |
| ⛔ | **`PREP-LEGADO-02` = `STOP`** — permanece. A rota executada lá foi outra; o fato não muda. |
| ⛔ | **Nenhum caso da `R2` foi executado.** A `PREP-03` produz **insumo**; não é rodada. |
| ⛔ | **Nenhum `PASS` de `R2`.** |
| ⛔ | **`F6-SG-A` NÃO CONCEDIDO**; `R1-PEND-1..5` **ABERTAS**. |
| ⛔ | **`R2 · Sessão 2` NÃO INICIADA.** |

### 10.2 Para que serve o acervo — matriz resumida

O insumo cobre os cinco casos do **Bloco A** da `R2`. A reconciliação completa, com os critérios de
`PASS` **lidos** do canônico e citados por arquivo:linha, está em
[`14_R2_SESSAO_2.md`](14_R2_SESSAO_2.md) §3.

| Caso | Insumo | Veredito de insumo |
|---|---|---|
| **1** · `TK-A-063` | *blob* + ponteiro C60 | ✅ SUFICIENTE |
| **15** · `TK-A-077` | obra do Ateliê | ✅ SUFICIENTE |
| **14** · `TK-A-076` | obra do Ateliê (variante **`v2`**) | ⚠️ **PARCIAL** |
| **16** · `TK-A-078` | ponteiro `v:3` + *blob* | ✅ SUFICIENTE |
| **10** · `TK-A-072` | ambas as metades | ✅ SUFICIENTE |

⛔ **`CASO 14 · variante v1` = `INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL`** — classificação
**preexistente** (`CASO14-V1-INEXECUTAVEL-01`, `docs/DECISIONS.md:2797`), **não** alterada por esta
auditoria. Não é `PASS`, não é `FAIL`, e **não** autoriza fabricar *fixture*. A `PREP-03` **não** a
supre e **não** tentou supri-la: nenhum *writer* de `7de7085` emite `v1`
([`14_R2_SESSAO_2.md`](14_R2_SESSAO_2.md) §4).

---

## 11. `NÃO DETERMINADOS` — registrados como tais

- **Coordenadas/limites do *sheet* bloqueado** — `A2-UI-HIERARCHY.txt` não preservou a hierarquia
  (§7.2). O achado se sustenta por PNG + observação humana.
- **Se o `HEAD` canônico reproduz o mesmo defeito visual** — não testado (§8.3).
- **Horário absoluto de cada escrita de `AsyncStorage`** — o `AsyncStorage` não emite `logcat`; a
  ordem de §3.3 é **física** (`rowid`), o relógio é **inferido** dos *mtimes* dos `TAR`.
- **As 26 lacunas de `rowid` herdadas do `PRE03`** — não atribuíveis a eventos específicos.
- **Ausência das quatro chaves proibidas** — é propriedade **deste *snapshot***. Prova que **esta
  rota** não as grava; **não** prova que nenhum caminho de código as grave em outras condições.
- **Causa do silêncio de `ReactNativeJS` após `16:48:01.502`** (§7.4) — sem `crash`, sem ANR, sem
  reinício de processo. Não determinada.
- **Deriva de relógio aparelho ↔ PC ≈ 10,5 s** — o aparelho está **adiantado**, de forma consistente
  durante toda a sessão. Não estava documentada em nenhum artefato da campanha. **Nenhuma conclusão
  desta auditoria depende de comparação de relógios entre as duas máquinas** — as correlações de
  §8.2.1 são **intra-aparelho** (`logcat` × `createdAt` gerado no próprio dispositivo). Fica
  registrado para que a `R2 · Sessão 2` **declare o *offset* antes de correlacionar** qualquer coisa.
- **Reprodutibilidade de `G4_C60_ASYNC_CHECK.txt` e `G5_CREATOR_ASYNC_CHECK.txt`** — instrumento não
  versionado (§7.3). Os valores foram reconferidos na fonte primária; os arquivos, em si, não são
  regeneráveis.

---

## 12. O que esta auditoria **NÃO** fez

Não se tocou o aparelho; não se executou `adb`, Metro, Expo, `logcat` nem `logcat -c`; não se
restaurou nenhum `TAR`; não se alterou `AsyncStorage`, sistema de arquivos do app, `src/`, `scripts/`,
`package.json`, `app.json` nem `eas.json`; não se corrigiu o achado visual; nenhuma evidência da
`PREP-01`, da `PREP-02` ou da `PREP-03` foi alterada, apagada ou sobrescrita.

> ⛔ **`PREP-LEGADO-01` = `STOP`** · ⛔ **`PREP-LEGADO-02` = `STOP`** ·
> ✅ **`PREP-LEGADO-03` = CONCLUÍDA COM ACERVO ADMISSÍVEL** ·
> ⛔ **`R2 · SESSÃO 2` = NÃO INICIADA** · ⛔ **`F6-SG-A` = NÃO CONCEDIDO** (`R1-PEND-1..5` ABERTAS).
