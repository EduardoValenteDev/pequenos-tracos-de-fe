# `41` · `SF1` · `BLOCO 0A` — PERÍCIA FORENSE DO ACERVO CORRENTE DO SM-X510

> **Natureza deste artefato.** Missão de **medição determinística**, executada com `adb`
> **exclusivamente em operações comprovadamente somente leitura**, por **um único executor**.
> Nenhuma escrita alcançou o aparelho · nenhuma obra foi criada, salva, promovida ou restaurada ·
> nenhum insumo foi fabricado · o app **não foi aberto** · nenhum Metro foi iniciado · nenhum *build*
> foi gerado · nada foi instalado, desinstalado, limpo ou reiniciado · **o tablet permaneceu
> bloqueado, com a tela apagada, do início ao fim** · nenhum código funcional foi alterado.
>
> **Esta missão não inicia a execução funcional de `SF1`.** Não executa `Bloco 1`, `Bloco 3`,
> `CASO 13`, `E6` nem qualquer cenário §28. A `ERRATA-08` **não** foi tratada como autorização:
> nenhuma de suas conclusões foi aceita previamente, e a medição de fato **mudou** parte delas.
>
> **Estado alvo alcançado:** `SF1_ENTRY_ACERVO_MEASURED`.

---

## 1 · `GATE 0` — Baseline de entrada

| | Esperado | Medido | |
|---|---|---|---|
| Raiz | `C:\tmp\ptf_fase6_shell_splash_wt` | idem | ✅ |
| *Branch* | `feat/fase6-shell-splash` | idem | ✅ |
| `HEAD` | `37c4e24` | `37c4e24350a2ccc65cd8d497e7297916dc2aaed9` | ✅ |
| `git status --porcelain` | vazio | **vazio** | ✅ |
| Arquivo funcional alterado | nenhum | **nenhum** | ✅ |
| *Upstream* | — | **nenhum configurado** (nada enviado ao remoto) | ✅ |
| Portas `8081` / `8082` / `8083` | livres | **nenhuma escuta**, apurado **por leitura** | ✅ |

Nenhum Metro foi iniciado nem encerrado para satisfazer o *baseline*.
**Não houve `STOP_RECOVERY_BASELINE_DIVERGENCE`.** Nada foi corrigido, resetado, guardado em
*stash*, trocado de *branch*, emendado ou rebaseado.

---

## 2 · `GATE 1` — Lacuna documental `P3-JS` fechada

| Símbolo | Valor lacrado |
|---|---|
| `SF1_JS_BASE` | `37c4e24350a2ccc65cd8d497e7297916dc2aaed9` (`HEAD` corrente aprovado) |
| `CK-JS` esperado | **hash íntegro do `HEAD` medido nesta missão** — `37c4e24350a2ccc65cd8d497e7297916dc2aaed9` |

**Delta executável entre `07f83c8` e `37c4e24`:** `git diff --name-only 07f83c8 HEAD` devolve
**apenas dois arquivos `.md`** (artefatos `39` e `40`). Logo o **grafo executável é idêntico bit a
bit** ao de `07f83c8`; `SF1_JS_BASE` é uma âncora **documental**, não uma mudança de código.

Isto fecha **apenas** a lacuna documental `P3-JS`. **Nenhum Metro foi iniciado nesta missão** — a
verificação do `CK-JS` contra o *bundle* servido é obrigação de quem abrir `SF1`, não desta perícia.

---

## 3 · `GATE 2` — Identidade do dispositivo e custódia do `adb`

Constantes canônicas honradas (`O-1`, `14:1165`): binário absoluto `C:\Android\platform-tools\adb.exe`,
sempre com `-s <serial>`; nunca `adb` do `PATH`.

```
RX2XC003LTJ   device   product:gts9fewifixx   model:SM_X510   device:gts9fewifi   transport_id:1
```

| `G-04` (`14:381`, `14:2018`) | Exigido | Medido | |
|---|---|---|---|
| Nº de dispositivos | exatamente 1 | 1 | ✅ |
| Serial | `RX2XC003LTJ` | `RX2XC003LTJ` | ✅ |
| Estado | `device` | `device` | ✅ |
| `unauthorized` / `offline` | ausente | ausente | ✅ |

Reconfirmado ao fim da missão, com resultado idêntico. **Não houve `STOP_DEVICE_IDENTITY`.**

**Custódia:** todos os comandos `adb` desta missão foram emitidos por **um único executor**, em
sequência, a partir do *host*. **Nenhum agente paralelo emitiu `adb`.** Nenhum `Agent`, `Workflow`
ou subagente foi acionado.

### 3.1 · Estado físico do aparelho — bloqueado, do início ao fim

| Medida | Abertura | Fechamento |
|---|---|---|
| `mWakefulness` | `Dozing` | `Dozing` |
| `mScreenState` | `OFF` | `OFF` |
| `mDreamingLockscreen` | `true` | `true` |

**O tablet não foi acordado nem desbloqueado.** Como o `adb` funcionou com o aparelho bloqueado, ele
**foi mantido bloqueado**, conforme o mandato. **Nenhuma ação física foi pedida ao fundador.**

### 3.2 · Achado de custódia — o processo do app já estava vivo antes desta missão

```
PID    PPID   STAT   ETIME        NAME
18101  1178   S      2-14:33:15   com.valentedev.pequenostracosdefe
mFocusedApp = com.valentedev.pequenostracosdefe/.MainActivity  t850
```

`ETIME = 2 dias 14 h 33 min` medido às `2026-08-17 10:16` ⇒ **início do processo ≈ `2026-08-14
19:43`**, coincidente com o *mtime* de `files/` e `shared_prefs/` (`2026-08-14 19:42-19:43`).

> **Registro honesto.** O processo do app **não foi iniciado por esta missão** — ele antecede a
> missão em ~2,6 dias e é o resíduo da sessão de `2026-08-14`, com o aparelho bloqueado sobre a
> `MainActivity`. Esta perícia **não abriu o app, não o trouxe a primeiro plano, não o matou e não o
> reiniciou** — matar ou reiniciar seria escrita de estado e está proibido. A consequência
> metodológica está tratada em §9: a prova de não mutação cobre a **janela de custódia**, e nela o
> aparelho não escreveu **nada**.

---

## 4 · `GATE 3` — Lacre de entrada `TAR-SF1-ENTRY-FORENSIC`

**Mecanismo:** a **receita canônica já empregada nas campanhas anteriores** (`32:1199`, `31:125`),
reutilizada sem alteração — `exec-out run-as … tar -c` transmitido por *pipe* para o *host*.
**Nenhuma técnica nova foi inventada.** Honrando `30:131-132`, **nenhum TAR foi criado dentro de
`/data/user/0`**; a extração e toda a comparação ocorreram **somente no *host***.
**Nada foi copiado PARA o aparelho** em nenhum momento.

```bat
%ADB% -s RX2XC003LTJ exec-out run-as com.valentedev.pequenostracosdefe ^
      tar -c databases files shared_prefs  >  <HOST>\acervo\TAR-SF1-ENTRY-FORENSIC.tar
```

| Campo | Valor |
|---|---|
| Arquivo | `C:\tmp\ptf_evidencias\SF1_BLOCO_0A\acervo\TAR-SF1-ENTRY-FORENSIC.tar` |
| Tamanho | **17 424 384 bytes** |
| `SHA-256` | `84AE08848C8BB00D451253ADFC6986F45C53178069B115117FE126BC3EF58FB2` |
| Data/hora | `2026-08-17 10:08:37 -03:00` |
| Serial | `RX2XC003LTJ` |
| *Package* | `com.valentedev.pequenostracosdefe` |
| `stderr` do `run-as` | **vazio (0 byte)** |
| Código de saída | `0` |
| Colisão de nome | **nenhuma** — nome inédito entre os 19 diretórios de evidência já existentes |

`run-as` funcionou; o TAR **não** está truncado (extração íntegra, sem erro, com o `RKStorage`
interno conferindo *hash* com a leitura direta — §9). **Não houve `STOP_FORENSIC_ACQUISITION`.**

### 4.1 · Listagem completa do TAR (22 entradas, verbatim)

```
drwxrwx--x  u0_a364        0  ago 10 13:23  databases/
-rw-rw----  u0_a364    49152  ago 14 17:38  databases/RKStorage
-rw-------  u0_a364        0  ago 10 13:23  databases/RKStorage-journal
drwxrwx--x  u0_a364        0  ago 14 19:42  files/
-rw-------  u0_a364       24  ago 14 19:42  files/profileInstalled
drwx------  u0_a364        0  ago 10 23:37  files/phenotype_storage_info/
drwx------  u0_a364        0  ago 14 19:43  files/phenotype_storage_info/shared/
-rw-------  u0_a364      137  ago 14 19:43  files/phenotype_storage_info/shared/storage-info.pb
-rw-------  u0_a364 16866385  ago 14 19:42  files/DevLauncherApp-BridgelessReactNativeDevBundle.js
drwx------  u0_a364        0  ago 11 17:11  files/ptf_blobs/
drwx------  u0_a364        0  ago 14 17:38  files/ptf_blobs/drawings60/
-rw-------  u0_a364   386880  ago 14 17:38  files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.a.png
drwx------  u0_a364        0  ago 11 17:11  files/ptf_blobs/atelier/
-rw-------  u0_a364    89593  ago 11 17:11  files/ptf_blobs/atelier/art_1786479103982_6079_preview.jpg
-rw-------  u0_a364    14730  ago 11 17:11  files/ptf_blobs/atelier/art_1786479103982_6079_thumb.jpg
drwxrwx--x  u0_a364        0  ago 14 19:42  shared_prefs/
-rw-rw----  u0_a364      684  ago 14 19:42  shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml
-rw-rw----  u0_a364      108  ago 14 19:42  shared_prefs/android.app.ActivityThread.IDS.xml
-rw-rw----  u0_a364       65  ago 10 16:08  shared_prefs/expo.modules.kotlin.PersistentDataManager.xml
-rw-rw----  u0_a364      377  ago 14 19:42  shared_prefs/WebViewChromiumPrefs.xml
-rw-rw----  u0_a364      127  ago 10 13:23  shared_prefs/expo.modules.devmenu.sharedpreferences.xml
-rw-rw----  u0_a364      126  ago 10 23:37  shared_prefs/com.valentedev.pequenostracosdefe_preferences.xml
```

> **Nota factual sobre o crescimento do TAR.** O acréscimo de ~390 KB observado após o lacre de
> `§4.1` é explicado por **um único arquivo**: `_ptf_drawing60_screation_alight.a.png`
> (**386 880 B**, *mtime* `ago 14 17:38`), mais o enquadramento em blocos do `tar`. O *mtime* desse
> blob coincide **exatamente** com o do `RKStorage`. Isto é uma **coincidência temporal medida** —
> **não** se afirma aqui autoria de escrita alguma.

---

## 5 · `GATE 4` — O SQLite do aparelho não foi tocado

**Nenhuma operação de escrita foi emitida sobre o aparelho.** Nenhum `INSERT`, `UPDATE`, `DELETE`,
`REPLACE`, `VACUUM`, nenhum `PRAGMA` mutante, nenhuma injeção externa, nenhuma cópia modificada
devolvida. **Nenhum binário `sqlite3` foi executado no aparelho.**

Toda a inspeção ocorreu sobre a **cópia extraída no *host***, aberta em modo somente leitura pela
URI `file:…/RKStorage?mode=ro`, com `rowid` preservado (`SELECT rowid,…`, sem reordenar, sem
reescrever).

| `PRAGMA` (todos de leitura) | Resultado |
|---|---|
| `integrity_check` | **`ok`** |
| `quick_check` | **`ok`** |
| `journal_mode` | **`delete`** — não é WAL |
| `page_size` | `4096` |
| `user_version` | `1` |

`databases/RKStorage-journal` existe com **0 byte** (*journal* de *rollback* vazio, estado normal de
banco fechado). **Não há `-wal` nem `-shm`.** Nenhuma ambiguidade transacional.
**Não houve `STOP_FORENSIC_DB_AMBIGUOUS`.**

Esquema medido: `catalystLocalStorage (key TEXT PRIMARY KEY, value TEXT NOT NULL)` +
`android_metadata` + `sqlite_autoindex_catalystLocalStorage_1`.

---

## 6 · `GATE 5` — `INS-01-V2` (ampliado; o `INS-01` histórico permanece intocado)

### 6.0 · Definição canônica de "formato antigo" vs. "formato novo" — pela fonte dona

A discriminação **não** foi presumida. Ela vem da fonte dona, `src/components/AtelierCanvas.js:42-52`,
verbatim:

> 1. `APP_STORAGE_SCHEMA_VERSION` — "que chaves o AsyncStorage tem". Intocado.
> 2. `POINTER_VERSION` / campo `v` do PONTEIRO — "onde está o blob". Congelado.
> 3. `paintSchemaVersion` — "que campos o payload tem".
> 4. `layoutVersion` — "o que as coordenadas significam" (aqui: `logicalW` e `logicalH`, além das
>    coordenadas de `strokes` e `stamps`).
>
> ⚠️ `CANVAS_PAYLOAD_V` é o campo `v` INTERNO do `stateJson` e está **CONGELADO EM 2 PARA SEMPRE** —
> marca legada, **jamais discriminador de evolução**. Nenhum eixo é inferido de outro: **ausência de
> `paintSchemaVersion` significa payload legado, ausência de `layoutVersion` significa geometria
> legada, e as duas ausências são INDEPENDENTES.**

Confirmado por `TK-A-003` (`05:359`, `05:361`): *"o payload passa a conter `paintSchemaVersion` e
`layoutVersion`; **`v` permanece `2`** … nenhum payload emitido contém `v: 3`"*.

E o *writer* vigente do Ateliê emite **os dois eixos** (`AtelierCanvas.js:607-610`):

```js
JSON.stringify({ v: CANVAS_PAYLOAD_V,
                 paintSchemaVersion: PAINT_SCHEMA_VERSION, layoutVersion: LAYOUT_VERSION,
                 logicalW: LW, logicalH: LH,
                 strokes, stamps, bgColor })
```

⇒ **O discriminador é `paintSchemaVersion` + `layoutVersion`, e é o mesmo nas duas famílias**
(Ateliê e Colorir 60). `v` **não** discrimina nada.

### 6.1 · `A` — ATELIÊ

**Índice `ptf_atelier_arts_v1_index` — `rowid 50`, 297 caracteres, valor bruto:**

```json
[{"id":"art_1786479103982_6079","title":"Desenho de fé",
  "createdAt":"2026-08-11T20:11:43.982Z","updatedAt":"2026-08-11T20:11:43.982Z","schema":2,
  "thumbnailUri":"file:///data/user/0/com.valentedev.pequenostracosdefe/files/ptf_blobs/atelier/art_1786479103982_6079_thumb.jpg",
  "thumbnailBase64":null}]
```

| Campo | Valor |
|---|---|
| Comprimento do índice | **1** |
| IDs, na ordem | `[0] art_1786479103982_6079` |
| `title` | `Desenho de fé` |
| `schema` | `2` |
| `createdAt` | `2026-08-11T20:11:43.982Z` |
| `updatedAt` | `2026-08-11T20:11:43.982Z` — **idêntico ao `createdAt`** |

`createdAt == updatedAt` ⇒ **a obra nunca foi atualizada desde a criação**. Corrobora `13:321`
(`len(index) == 1`), agora **medido**, não citado.

**Vetor factual de presença de campos — obra `art_1786479103982_6079` (`rowid 49`, 19 590 caracteres):**

Chaves de topo: `createdAt · id · mission · previewBase64 · previewUri · schema · stateJson · title · updatedAt`

| Campo | Topo do registro | Dentro de `stateJson` |
|---|---|---|
| `paintSchemaVersion` | **AUSENTE** | **AUSENTE** |
| `layoutVersion` | **AUSENTE** | **AUSENTE** |
| `logicalW` | **AUSENTE** | **AUSENTE** |
| `logicalH` | **AUSENTE** | **AUSENTE** |
| `strokes` | AUSENTE | **PRESENTE — lista, `len = 12`** |
| `stamps` | AUSENTE | **PRESENTE — lista, `len = 0`** |
| `v` | AUSENTE | **PRESENTE = `2`** |
| `bgColor` | AUSENTE | PRESENTE = `#FFFDF8` |
| `schema` | PRESENTE = `2` | AUSENTE |
| `previewBase64` | **PRESENTE, valor `null`** | — |
| `mission` | PRESENTE, valor `null` | — |

Chaves de `stateJson`: exatamente `{ bgColor, stamps, strokes, v }`.
Chaves do 1º traço: `{ color, eraser, id, points, size }`.

**Contagem textual no registro íntegro (19 590 caracteres):**
`paintSchemaVersion` → **0 ocorrências** · `layoutVersion` → **0** · `logicalW` → **0** ·
`logicalH` → **0**.

**Confronto do vetor com a definição canônica (§6.0):** ausência de `paintSchemaVersion` ⇒ **payload
legado**; ausência de `layoutVersion` ⇒ **geometria legada**. As duas ausências, independentes, se
verificam. ⇒ A obra é **inequivocamente do FORMATO ANTIGO**, e é literalmente a *"obra `v:2` antiga"*
nomeada em `04:1057` (§28 #9).

| Símbolo | Valor |
|---|---|
| `ATELIER_TOTAL` | **1** |
| `ATELIER_LEGACY_CANDIDATES` | **1** — `art_1786479103982_6079` |
| `ATELIER_NEW_FORMAT_CANDIDATES` | **0** |

**`art_1786479103982_6079` ainda existe?** **SIM**, com o vetor acima, íntegra, em `rowid 49`, com
`previewUri` e `thumbnailUri` resolvendo para blobs existentes (§6.4). **Nenhum órfão.**

### 6.2 · `B` — COLORIR 60 (inventário de **todos** os ponteiros, não só o `light`)

Varredura por padrão (`%drawing60%`, `%coloring60%`, `%colorir%`) — **todas** as chaves encontradas:

| `rowid` | Chave | `len` |
|---|---|---|
| 58 | `@ptf_coloring60_milestone_invite_seen_creation_living_world` | 1 |
| 61 | `@ptf_coloring60_milestone_invite_seen_creation_people_and_care` | 1 |
| 67 | `@ptf_creation_colorir_invite_shown_v1` | 1 |
| **77** | **`@ptf_drawing60_screation_alight`** | **344** |
| 78 | `@ptf_coloring60_done_creation_light` | 4 |
| 79 | `@ptf_coloring60_snap_creation_light` | 5 |
| 80 | `@ptf_coloring60_ever_creation_light` | 4 |

**Existe exatamente UM ponteiro de desenho do C60.** Valor bruto de `@ptf_drawing60_screation_alight`:

```json
{"v":3,"fmt":2,
 "uri":"file:///data/user/0/com.valentedev.pequenostracosdefe/files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.a.png",
 "mime":"image/png","W":1122,"H":1402,"imgX":0,"imgY":0,"imgW":1122,"imgH":1402,"rev":2,
 "paintedPx":1348737,"paintablePx":1442745,
 "paintSchemaVersion":1,"layoutVersion":1,"logicalW":1122,"logicalH":1402}
```

**Vetor lógico do ponteiro, campo a campo:**

| Campo | `light` | `living_world` | `people_and_care` |
|---|---|---|---|
| chave | `@ptf_drawing60_screation_alight` | `@ptf_drawing60_screation_aliving_world` | `@ptf_drawing60_screation_apeople_and_care` |
| existe | **SIM** (`rowid 77`) | **NÃO** | **NÃO** |
| `v` | PRESENTE = `3` | — | — |
| `fmt` | PRESENTE = `2` | — | — |
| `rev` | PRESENTE = `2` | — | — |
| blob / URI | `…/drawings60/_ptf_drawing60_screation_alight.a.png` (**existe**) | — | — |
| `paintSchemaVersion` | **PRESENTE = `1`** | — | — |
| `layoutVersion` | **PRESENTE = `1`** | — | — |
| `logicalW` | **PRESENTE = `1122`** | — | — |
| `logicalH` | **PRESENTE = `1402`** | — | — |

**Confronto com §6.0:** os dois eixos estão **declarados** ⇒ **FORMATO NOVO**, sem ambiguidade.

| Símbolo | Valor |
|---|---|
| `C60_LIGHT_EXISTS` | **SIM** |
| `C60_LIVING_WORLD_EXISTS` | **NÃO** |
| `C60_PEOPLE_AND_CARE_EXISTS` | **NÃO** |

### 6.3 · `C` — MILESTONES (`done` · `snap` · `ever` · `finale_seen`), medidos

O nome canônico da chave de final vem da fonte dona,
`src/services/coloring60ActivityService.js:46` (`FINALE_SEEN_PREFIX = '@ptf_coloring60_finale_seen_'`)
e `:237` (`finaleSeen: map.get(…) === 'true'` ⇒ **ausência equivale a `false`**).

| Chave | `rowid` | Valor |
|---|---|---|
| `@ptf_coloring60_done_creation_light` | 78 | **`true`** |
| `@ptf_coloring60_done_creation_living_world` | — | **AUSENTE** |
| `@ptf_coloring60_done_creation_people_and_care` | — | **AUSENTE** |
| `@ptf_coloring60_snap_creation_light` | 79 | **`ready`** |
| `@ptf_coloring60_snap_creation_living_world` | — | **AUSENTE** |
| `@ptf_coloring60_snap_creation_people_and_care` | — | **AUSENTE** |
| `@ptf_coloring60_ever_creation_light` | 80 | **`true`** |
| `@ptf_coloring60_ever_creation_living_world` | — | **AUSENTE** |
| `@ptf_coloring60_ever_creation_people_and_care` | — | **AUSENTE** |
| `@ptf_coloring60_finale_seen_creation` | — | **AUSENTE** ⇒ `false` |

| Símbolo | Valor **medido** |
|---|---|
| `CREATION_DONE_COUNT` | **1** (de 3) |
| `LIGHT_DONE` | **`true`** |
| `LIVING_WORLD_DONE` | **ausente ⇒ `false`** |
| `PEOPLE_AND_CARE_DONE` | **ausente ⇒ `false`** |
| `EVER` relevante | `ever_creation_light = true`; os outros dois **ausentes** |
| `FINALE_SEEN` | **`false`** (chave ausente) |

> A conclusão histórica de "dois slots vazios" **não** foi assumida: foi **medida** e confirmada,
> pela ausência efetiva das seis chaves dos slots `living_world` e `people_and_care`.

Contexto adicional medido: `@ptf_progress_creation` (`rowid 62`) =
`{"1":true,…,"10":true}` (dez cenas concluídas) · `@ptf_achievements_seen` (`rowid 66`) =
`["brincar_poucos_erros","brincar_first_game","first_scene","five_stars","first_drawing","first_chest_card"]`.

### 6.4 · `D` — BLOBS: caminho, existência, tamanho, `SHA-256`

| Caminho (dentro de `files/`) | Existe | Bytes | `SHA-256` |
|---|---|---|---|
| `ptf_blobs/atelier/art_1786479103982_6079_preview.jpg` | **SIM** | 89 593 | `FDC5529619201C3CC24CFC719DA719047DE9A65E827A8FD934644205D9E1E248` |
| `ptf_blobs/atelier/art_1786479103982_6079_thumb.jpg` | **SIM** | 14 730 | `A5FB5908353A0E8D23C537AF2711C214D6E35F2048FD0281A60F3242A48910DE` |
| `ptf_blobs/atelier/art_1786479103982_6079.a.png` | **NÃO** | — | — |
| `ptf_blobs/atelier/art_1786479103982_6079.b.png` | **NÃO** | — | — |
| `ptf_blobs/drawings60/_ptf_drawing60_screation_alight.a.png` | **SIM** | 386 880 | `E267D4C0FB4C5C964D9F708DDF1433AE2DDFCB1148BA22CB03CFB449B93F33E1` |
| `ptf_blobs/drawings60/_ptf_drawing60_screation_alight.b.png` | **NÃO** | — | — |
| `ptf_blobs/drawings60/_ptf_drawing60_screation_aliving_world.a.png` | **NÃO** | — | — |
| `ptf_blobs/drawings60/_ptf_drawing60_screation_apeople_and_care.a.png` | **NÃO** | — | — |

Varredura integral de `files/ptf_blobs/`: **exatamente três arquivos**, os três listados como
existentes acima. **Nenhum blob de produto apareceu depois de `PREP-03` além do
`_ptf_drawing60_screation_alight.a.png`** já contabilizado em §4.1.

- O Ateliê **não** usa blobs `.a.png`/`.b.png`: os traços vivem em `stateJson` no `AsyncStorage`, e
  os blobs são apenas `preview.jpg` e `thumb.jpg`. A ausência de `.a.png`/`.b.png` no Ateliê é
  **estrutural**, não um sintoma.
- **Nenhum ponteiro órfão e nenhum blob órfão:** os três blobs são exatamente os três alvos
  referenciados por `previewUri`, `thumbnailUri` e `uri`.
- **Nada disso exigiu abrir ou salvar obra pelo produto.**

### 6.5 · `E` — SQLITE FORENSE

| Medida | Valor |
|---|---|
| Total de chaves em `catalystLocalStorage` | **27** |
| `MIN(rowid)` | **3** |
| `MAX(rowid)` | **80** |

**Tabela `rowid | chave` completa, ordenada:**

| `rowid` | Chave | `len(value)` |
|---|---|---|
| 3 | `@ptf_schema_version` | 1 |
| 4 | `@ptf_migration_status_v1` | 97 |
| 7 | `@ptf_active_child_id_v1` | 25 |
| 9 | `@ptf_beni_guide_home_v1` | 4 |
| 10 | `@ptf_beni_guide_stars_v1` | 4 |
| 12 | `@ptf_beni_guide_profile_v1` | 4 |
| 19 | `@ptf_bonus_stars` | 1 |
| 21 | `@ptf_brincar_daily_v1` | 29 |
| 31 | `@ptf_brincar_stats_v1` | 959 |
| 38 | `@ptf_profile` | 85 |
| 39 | `@ptf_child_profiles_v1` | 483 |
| 40 | `@ptf_onboarding_v1` | 71 |
| 41 | `@ptf_beni_app_tour_seen_v1` | 4 |
| 42 | `@ptf_beni_guide_adventures_v1` | 4 |
| 47 | `@ptf_creator_qa_mode` | 4 |
| **49** | **`ptf_atelier_arts_v1_art_1786479103982_6079`** | **19 590** |
| **50** | **`ptf_atelier_arts_v1_index`** | **297** |
| — | — *(teto histórico de `rowid` = 50)* | — |
| 58 | `@ptf_coloring60_milestone_invite_seen_creation_living_world` | 1 |
| 61 | `@ptf_coloring60_milestone_invite_seen_creation_people_and_care` | 1 |
| 62 | `@ptf_progress_creation` | 92 |
| 66 | `@ptf_achievements_seen` | 107 |
| 67 | `@ptf_creation_colorir_invite_shown_v1` | 1 |
| 72 | `@ptf_criar_livre_orientation_seen_v1:star` | 1 |
| **77** | **`@ptf_drawing60_screation_alight`** | **344** |
| 78 | `@ptf_coloring60_done_creation_light` | 4 |
| 79 | `@ptf_coloring60_snap_creation_light` | 5 |
| 80 | `@ptf_coloring60_ever_creation_light` | 4 |

**Linhas além do teto histórico `rowid 50`: dez** — `58, 61, 62, 66, 67, 72, 77, 78, 79, 80`.

Fatos de ordenação (o `AsyncStorage` do Android grava por `INSERT OR REPLACE`, e `REPLACE` reinsere
a linha com `rowid` novo):

- As **duas chaves do Ateliê ocupam `rowid 49` e `50`**, ou seja, **abaixo** do teto histórico. Em
  conjunto com `updatedAt == createdAt`, isso é consistente com **nenhuma regravação do registro do
  Ateliê após o lacre histórico**.
- As quatro chaves do C60 (`77`–`80`) estão **acima** do teto, e o *mtime* do `RKStorage` e do blob
  `_…_alight.a.png` é o mesmo (`ago 14 17:38`).

> **Limite deliberado.** Conforme o mandato, **não se afirma autoria de nenhuma escrita a partir do
> `rowid`.** O que está lavrado acima é **ordem relativa de gravação** e **coincidência de *mtime***
> — nada além disso. Quem gravou, e sob qual gesto, permanece **não determinado** por esta perícia.

---

## 7 · `GATE 6` — Matriz de classificação

Antes das respostas, dois fatos de código verificados na **fonte dona** (leitura, sem alteração):

- **A galeria do Ateliê lista somente obras do Ateliê.** `AtelierGalleryScreen.js:91` popula a tela
  com `listArts()`, e `atelierStorage.js:13,53` mostra que `listArts()` lê **apenas**
  `ptf_atelier_arts_v1_index`. **Não há fusão com o Colorir 60**; a coleção do C60 é outra
  superfície (`Coloring60CollectionScreen.js`).
- **`CASO 13` não exige família específica.** A fonte dona do caso — a matriz §28.1 em `04:1089` e a
  *task* `TK-A-075` em `05:1225` — descreve o insumo de forma **abstrata**: *"obras já gravadas no
  formato novo e no antigo"*, sem nomear Ateliê nem C60. O roteiro `07:661` instancia com
  *"5. Abrir uma obra do **formato antigo**. 6. Abrir uma obra do **formato novo**… 7. Abrir a
  **galeria** e a **coleção do C60**"*, e o critério de `FAIL` em `07:663` inclui explicitamente
  *"a **coleção do C60** perde vaga"* — ou seja, **o C60 está dentro do escopo de `CASO 13`**.

| # | Pergunta | Resposta | Prova |
|---|---|---|---|
| 1 | Existe hoje obra em **formato antigo**? | **SIM** | `art_1786479103982_6079`: `paintSchemaVersion` e `layoutVersion` **ausentes** (0 ocorrências textuais); `AtelierCanvas.js:50-51` |
| 2 | Existe hoje obra em **formato novo**? | **SIM** | `@ptf_drawing60_screation_alight`: `paintSchemaVersion:1`, `layoutVersion:1`, `logicalW/H` declarados |
| 3 | O acervo **já é misto**, sem qualquer escrita nova? | **SIM** | Os dois formatos coexistem **agora**, com zero escritas desta missão. Definição de "acervo misto" = *"mistura de **formatos de payload**, na camada de píxeis"* (`39:83`, `C-05`) |
| 4 | `art_1786479103982_6079` ainda serve ao **`CASO 15`**? | **SIM** | `04:1091` verifica *"`paintSchemaVersion` **ausente** ⇒ tratada como legada, sem erro"* — é exatamente o vetor medido. A outra metade (*"payload visual atual"*) é servida pelo ponteiro `light` |
| 5 | Ainda serve ao **`CASO 14` (`v2`)**? | **SIM** | `04:1090`: *"Obra `v1`/`v2` **sem geometria completa**"*. Medido: `stateJson.v = 2`, **sem `logicalW`/`logicalH`** — o insumo exato |
| 6 | Existe candidato preservado para o **"formato antigo" do `CASO 13`**? | **SIM — exatamente um** | `art_1786479103982_6079`. E, provado pela fonte dona (`04:1089`, `05:1225`, `07:661-663`), `CASO 13` **aceita qualquer família**: não exige que o antigo seja do Ateliê. Ocorre que, medido, **não existe nenhum antigo no C60** — o único ponteiro do C60 já é novo. Logo o antigo do `CASO 13` é o do Ateliê **por escassez medida**, não por presunção |
| 7 | **`ARB-OBRA-NOVA`** é necessária? | **DESNECESSÁRIA** como arbitragem autônoma | Seu propósito declarado — *produzir* o acervo misto — **já está satisfeito** (linha 3). E, no resíduo (§7.1), o insumo é produzido por **`E1`**, caso **obrigatório** da matriz (`05:1036`, `07:621` passo 4), que cria e reabre uma obra nova — **sem precisar de arbitragem** |
| 8 | **`ARB-28-7-TIRO-UNICO`** ainda descreve consumo futuro de peça legada? | **SIM — e mais agudo do que se supunha** | §28 #7 exige *"obra criada em ***build*** anterior à Fase 6"* (`05:1011`) e §28 #9 exige *"obra `v:2` **antiga** do Ateliê"* (`04:1057`). Medido: existe **um único objeto** que satisfaz ambos. Salvá-lo zera o formato antigo do aparelho e derruba os insumos dos casos **13**, **14** e da metade legada do **15** |
| 9 | **`R4` antes de `R5`** ainda é causalmente necessária sobre o acervo **real**? | **SIM — deixa de ser preferência e passa a ser restrição causal medida** | `R5` contém §28 #7 e #9, que **gravam** sobre o único objeto antigo; `R4` (`CASO 13`) **exige** um objeto antigo vivo (`07:661` passo 5). `R5→R4` o esvazia; `R4→R5` o preserva. Coincide com a ordem já **congelada** pelo fundador em `DECISIONS:2287-2288` |

### 7.1 · Ambiguidade nova, registrada e **não** resolvida por inferência: `AMB-E6-GALERIA`

O corpus contém **duas leituras incompatíveis** do insumo de `E6`, e a medição as separa:

| Leitura | Fonte | Satisfeita hoje? |
|---|---|---|
| **Preservação** — *"Todas as obras aparecem; nenhuma some da listagem"* | `06:434` | **SIM** |
| **Dois formatos na galeria** — *"abrir **uma de cada formato**"* · *"a galeria exibe **os dois formatos**"* | `05:1085`, `05:1087`, `07:621` passo 5, `07:622` | **NÃO** — a galeria do Ateliê tem 1 obra, e todas as obras do Ateliê são antigas |

Como `AtelierGalleryScreen.js:91` prova que a galeria **não** lista o C60, sob a segunda leitura
`E6` precisa de **duas obras do Ateliê**, uma por formato. **Isso não reabre `ARB-OBRA-NOVA`:** o
caso obrigatório **`E1`** (`TK-A-100`, `05:1036`; `07:621` passo 4 — *"criar obra nova e reabri-la
sem mudar a janela"*) já produz a segunda obra do Ateliê, no formato novo, **sem consumir a antiga**.

**Classificação de `E6`: `INDETERMINADO`** quanto a *qual* leitura o fundador adota — e
**irrelevante para o escalonamento**, porque as duas leituras são atendidas pela execução normal da
matriz, sem arbitragem e sem sacrificar a obra antiga. **Nenhum `PASS` é declarado aqui por
inferência.**

---

## 8 · `GATE 7` — Árvore de decisão: **CENÁRIO `A`**

> **`A` — a obra antiga sobrevive E existe obra em formato novo.**

| Condição do cenário | Medido |
|---|---|
| Obra antiga sobrevive | **SIM** — `art_1786479103982_6079`, íntegra, não promovida |
| Existe obra em formato novo | **SIM** — `@ptf_drawing60_screation_alight` |

**Consequências aplicadas, conforme o mandato:**

- O **acervo misto pode já existir — e existe**, medido, sem nenhuma escrita nova.
- **`ARB-OBRA-NOVA` torna-se desnecessária** como arbitragem autônoma (§7 linha 7 e §7.1).
- **Nenhuma obra foi criada. Nenhuma obra foi salva.** `CASO 13` fica **preservado**.

**Não se aplicam** `STOP_LEGACY_INPUT_ALREADY_CONSUMED` (cenário `C`) nem
`STOP_ACERVO_SCHEMA_AMBIGUOUS` (cenário `D`): não há promoção parcial, não há registro
contraditório, não há obra órfã, e `integrity_check` = `ok`.

### 8.1 · Insumos dos consumidores — situação medida (sem declarar `PASS`)

| Consumidor | Insumo exigido pela fonte dona | Presente hoje? |
|---|---|---|
| `CASO 13` (*rollback*) | obras nos **dois** formatos (`04:1089`) | **SIM** |
| `CASO 14` (formato legado) | obra `v1`/`v2` **sem geometria completa** (`04:1090`) | **SIM** |
| `CASO 15` (payload visual atual) | obra vigente **+** ramo `paintSchemaVersion` ausente (`04:1091`) | **SIM** (as duas metades) |
| `CASO 16` (envelope atual) | obra guardada como **ponteiro `v:3`** de blob (`04:1092`) | **SIM** — `light` tem `"v":3` |
| `CASO 17` (novo schema lógico) | obra com `paintSchemaVersion` **+** `layoutVersion` (`04:1093`) | **SIM** — `light` |
| `E6` (galeria com acervo misto) | ver `AMB-E6-GALERIA` (§7.1) | **INDETERMINADO** |
| §28 #7 | obra criada em *build* anterior à Fase 6 (`05:1011`) | **SIM** — a mesma única obra |
| §28 #9 | obra `v:2` antiga do Ateliê (`04:1057`) | **SIM** — a mesma única obra |

Nenhuma linha acima é um veredito de execução: são **insumos**, não resultados.
**Nada foi declarado `PASS` por inferência.**

---

## 9 · `GATE 8` — Prova de não mutação (somente leitura)

Três leituras independentes do mesmo objeto, sem nenhuma escrita, honrando `14:1131`
(*"dois `SHA256` de `databases/RKStorage`, ≥ 60 s de intervalo … funciona com a tela apagada e o
aparelho bloqueado"*):

| Ponto de custódia | Hora | Caminho de leitura | `SHA-256` de `databases/RKStorage` |
|---|---|---|---|
| **1** | `10:08:30` | `exec-out run-as … cat` (direto) | `79D45E96C99B4738E383A0B68D59BA2182FD909C0D43A2306969072482430857` |
| **2** | `10:08:37` | dentro de `TAR-SF1-ENTRY-FORENSIC.tar` | **idêntico** |
| **3** | `10:14:38` | `exec-out run-as … cat` (direto) | **idêntico** |

**Intervalo entre a 1ª e a 3ª leitura: 368 s (> 60 s).** Tamanho constante: 49 152 B nas três.

| Blob crítico | Custódia via TAR | Custódia 2 (leitura direta) | |
|---|---|---|---|
| `_ptf_drawing60_screation_alight.a.png` | `E267D4C0…F33E1` | `E267D4C0…F33E1` | **idêntico**, 386 880 B |

**Conclusão:** durante toda a janela de custódia o estado do aparelho permaneceu **bit a bit
imutável**. Isso confirma, por evidência, que **esta perícia não escreveu nada** — e também que o
processo residual do app (§3.2) **não escreveu nada** no período.

**Limitação registrada explicitamente, conforme o mandato:** esta prova cobre **a janela de
custódia**, não o intervalo entre `2026-08-14 19:43` e o início desta missão. Estender a prova para
trás exigiria **escrita ou reinício do app** — e **não foi feito**.

---

## 10 · Comandos emitidos ao aparelho (inventário íntegro)

Todos somente leitura, todos com `-s RX2XC003LTJ`, todos por um único executor:

| # | Comando (essência) | Natureza |
|---|---|---|
| 1 | `adb devices -l` (2×: abertura e fechamento) | leitura |
| 2 | `run-as <pkg> ls -la` | leitura |
| 3 | `exec-out run-as <pkg> cat databases/RKStorage` (custódia 1) | leitura |
| 4 | `exec-out run-as <pkg> tar -c databases files shared_prefs` → *host* | leitura |
| 5 | `exec-out run-as <pkg> cat databases/RKStorage` (custódia 2) | leitura |
| 6 | `exec-out run-as <pkg> cat files/ptf_blobs/drawings60/_…_alight.a.png` | leitura |
| 7 | `shell dumpsys power \| grep …` · `dumpsys window` · `dumpsys display` | leitura |
| 8 | `shell ps -A …` · `dumpsys activity processes` · `dumpsys activity activities` | leitura |

**Não foram emitidos:** `install`, `uninstall`, `pm clear`, `am start`, `am force-stop`, `push`,
`shell sqlite3`, `shell rm`, `shell mv`, `shell touch`, `input`, `reboot`, `settings put`, nem
qualquer redirecionamento **para** o aparelho. **Nada foi copiado PARA o SM-X510.**

Evidência bruta no *host* (fora do repositório):
`C:\tmp\ptf_evidencias\SF1_BLOCO_0A\` — `acervo/TAR-SF1-ENTRY-FORENSIC.tar`,
`out/{RKStorage_PRE.bin, RKStorage_POS.bin, C60_light_POS.png, TAR_listing.txt,
INS01V2_E_sqlite.txt, INS01V2_ABC.txt, INS01V2_A2_D.txt, estado_dispositivo.txt}`,
`extract/`, e os quatro `.bat`/`.py` de captura e inspeção.

---

## 11 · `STOP`s

| `STOP` | Condição | Estado |
|---|---|---|
| `STOP_RECOVERY_BASELINE_DIVERGENCE` | divergência de `HEAD`/*branch*/árvore | **NÃO DISPARADO** |
| `STOP_DEVICE_IDENTITY` | dispositivo ausente, `offline`, `unauthorized` ou inesperado | **NÃO DISPARADO** |
| `STOP_FORENSIC_ACQUISITION` | `run-as` falha ou TAR truncado | **NÃO DISPARADO** |
| `STOP_FORENSIC_DB_AMBIGUOUS` | WAL, *journal* não vazio ou ambiguidade | **NÃO DISPARADO** |
| `STOP_LEGACY_INPUT_ALREADY_CONSUMED` | cenário `C` | **NÃO DISPARADO** (cenário `A`) |
| `STOP_ACERVO_SCHEMA_AMBIGUOUS` | cenário `D` | **NÃO DISPARADO** (cenário `A`) |

---

## 12 · Efeito sobre a `ERRATA-08` (aditivo — nada acima foi reescrito)

A `ERRATA-08` foi escrita **sem** medição do aparelho. A perícia confirma parte dela e **corrige**
outra parte. Nada do artefato `40` é apagado; o que segue é retificação aditiva.

| Ponto | Situação após a medição |
|---|---|
| `E8-1` — *"`GH2b` não cria o acervo misto: ele o encerra"* | **CONFIRMADO e reforçado.** O misto **não depende** de `GH2b`: já existe. E gravar sobre a única obra antiga continua sendo o que o **encerra** |
| `E8-2` — *"`CASO 13` exige obra antiga sobrevivente, e `SF1` a consumiria"* | **CONFIRMADO.** A obra antiga existe, é única, e §28 #7/#9 a consomem |
| `E8-3` — *"criar obra nova cria o misto; o salvamento único vira o último ato consuntivo"* | **PARCIALMENTE RETIFICADO.** A premissa *"é preciso criar obra nova para haver misto"* é **falsa**: o misto já existe. A **conclusão de ordem** (adiar o salvamento de #7∪#9 para depois de `CASO 13`) **permanece válida** e agora está **provada sobre o acervo real**, não inferida |
| `E8-4` — recomendação *"§5.4 acervo misto: de aceitável para NECESSÁRIO"* | **RETIFICADO.** Não é necessário **produzir** o misto: ele está lá. O que é necessário é **não destruí-lo** antes de `R4` |
| `E8-5` — *"`35:43-44` registra dois `CASO 11` `PASS` sem identificar a obra"* | **CONFIRMADO, e a lacuna agora está fechada por medição.** Seja qual for a obra referida, o `RKStorage` de hoje mostra que **a obra do Ateliê não foi promovida** (`rowid 49`, `updatedAt == createdAt`, zero ocorrências dos dois eixos) |

---

## 13 · Confirmação final

**Nesta missão não ocorreu:** nenhum salvamento · nenhuma restauração · nenhuma criação de obra ·
nenhuma promoção de obra legada · nenhuma fabricação de insumo · nenhuma abertura do app · nenhum
Metro · nenhum *build* · nenhuma instalação, desinstalação, limpeza de dados ou reinício ·
nenhuma escrita de qualquer natureza no aparelho · nenhuma alteração funcional no repositório ·
nenhum uso de TAR histórico para repovoar o aparelho.

**Alterado neste artefato:** **documentação apenas** — este arquivo. Nenhum arquivo de `src/**`,
`App.js`, `index.js`, `babel.config.js`, `metro.config.js`, `package.json` ou configuração Expo foi
tocado; o gate de bundleabilidade **não é disparado** por documentação pura.

**Baseline de saída:** `HEAD` `37c4e24350a2ccc65cd8d497e7297916dc2aaed9` · *branch*
`feat/fase6-shell-splash` · `git status --porcelain` **vazio antes deste artefato** · **nenhum
push** · **nenhum merge** · sem *upstream* configurado.

**PARADA.** Esta perícia **não prossegue** para `SF1 Bloco 1`, `Bloco 3`, `R4`, `R5` ou qualquer
arbitragem. O próximo `HUMAN GATE` mínimo está em §14.

---

## 14 · Próximo `HUMAN GATE` mínimo

O fundador precisa decidir **um único ponto** para desbloquear a sequência:

> **`GATE-ORDEM-CONSUNTIVA`** — confirmar que **`R4` (`CASO 13`) executa antes** de qualquer
> execução de §28 #7 e §28 #9, preservando `art_1786479103982_6079` até lá.

- É **coerente com a ordem já congelada** em `DECISIONS:2287-2288` — portanto pode ser uma
  **ratificação**, não uma decisão nova.
- Uma vez ratificada, **`ARB-OBRA-NOVA` cai** (desnecessária, §7 linha 7) e `ARB-28-7-TIRO-UNICO`
  deixa de ser dilema: torna-se apenas *"#7 e #9 gravam por último"*.
- `AMB-E6-GALERIA` (§7.1) **não bloqueia**: as duas leituras são atendidas pela execução normal da
  matriz, sem arbitragem.

---

## 15 · Adendo — `GATE-ORDEM-CONSUNTIVA` **RATIFICADO** (2026-08-17)

> **Nota aditiva.** Esta seção foi acrescentada **depois** do fechamento da perícia, para registrar a
> resposta do fundador ao `HUMAN GATE` de §14. **Nada acima foi alterado, reescrito ou reinterpretado.**
> Nenhuma medição nova foi feita; nenhum comando novo foi emitido ao aparelho.

### 15.1 · O ato

O fundador **ratificou** `GATE-ORDEM-CONSUNTIVA`. Texto verbatim:

> *"RATIFICO `GATE-ORDEM-CONSUNTIVA`: `R4`, incluindo `CASO 13`, deve ser concluída e lacrada antes
> de qualquer salvamento consuntivo de §28 #7 ou #9 sobre `art_1786479103982_6079`. A obra legada
> deve permanecer intacta até o último consumidor obrigatório do formato antigo."*

Lavrado em `docs/DECISIONS.md` como **`D-FUND-SG-A-ORDEM-CONSUNTIVA-01`**.

### 15.2 · Duas cláusulas, não uma

| # | Cláusula | Alcance |
|---|---|---|
| `1` | `R4`, **incluindo `CASO 13`**, **concluída *e lacrada*** antes de qualquer salvamento consuntivo de §28 #7/#9 sobre `art_1786479103982_6079` | Trava **posicional** sobre `R4`. *"Lacrada"* é requisito próprio: **concluir sem lacrar não satisfaz** |
| `2` | A obra legada **permanece intacta até o último consumidor obrigatório do formato antigo** | **Mais ampla** que a cláusula `1` — **não se esgota** em `CASO 13` |

A cláusula `2` é a que governa: ela transforma `art_1786479103982_6079` em **objeto sob trava
explícita de preservação**, e não apenas em insumo de `CASO 13`.

### 15.3 · Ordem operacional derivada (leitura do agente, não decisão do fundador)

Cruzando a cláusula `2` com a tabela de consumidores de §8.1:

| Consumidor | Natureza medida | Posição |
|---|---|---|
| `CASO 1`/`2`/`3`/`10` | leitura — já executados em `R2`/`R3` | atrás |
| `CASO 14`, metade legada do `CASO 15` | leitura | atrás |
| **`CASO 13` (`R4`)** | **leitura** — abre a obra pelo caminho revertido | **antes de qualquer gravação** |
| `E6`/`GH1` | **leitura pura** (`39:584`) | antes de qualquer gravação |
| **§28 #7 ∪ #9** | **CONSUNTIVOS** — gravam sobre a obra (`05:1011`, `05:1013`, `04:1057`) | **último ato consuntivo da campanha** |

⇒ **`R4`/`CASO 13` → `E6`/`GH1` → §28 #7 ∪ #9 por último.**

### 15.4 · Efeito sobre §7 (arbitragens) e §12 (`ERRATA-08`)

| Item | Estado após a ratificação |
|---|---|
| `ARB-ORDEM-R4R5` | **ENCERRADA** — a ratificação é a decisão |
| `ARB-28-7-TIRO-UNICO` | **DEIXA DE SER DILEMA** — vira **regra de posição**: `#7` e `#9` gravam por último |
| `ARB-OBRA-NOVA` | **CAI** — desnecessária (§7 linha 7); o acervo já é misto **sem nenhuma escrita nova** |
| `AMB-E6-GALERIA` (§7.1) | **PERMANECE `INDETERMINADO`.** Continua **não bloqueante**: sob as duas leituras `E6` é leitura pura e não consome |
| `E8-3` / `E8-4` (§12) | Retificações **mantidas**. A ratificação confirma o que resta delas: **não é preciso produzir o misto — é preciso não destruí-lo antes de `R4`** |

### 15.5 · O que esta ratificação **não** autoriza

Não autoriza `SF1 Bloco 1` · `Bloco 3` · `R4` · `CASO 13` · `R5` · `E6` · nenhum cenário §28 ·
nenhuma criação, salvamento, promoção ou restauração de obra · nenhuma abertura do app · nenhum
Metro · nenhum *build*. É decisão **de ordem**, não de início. **A execução continua parada.**

### 15.6 · Estado ao lavrar o adendo

Nenhum comando `ADB` foi emitido. Nenhuma escrita no aparelho. Alteração **documental apenas** —
este arquivo e `docs/DECISIONS.md`. O gate de bundleabilidade **não é disparado**.
`art_1786479103982_6079` permanece exatamente como medido em §6.1.
