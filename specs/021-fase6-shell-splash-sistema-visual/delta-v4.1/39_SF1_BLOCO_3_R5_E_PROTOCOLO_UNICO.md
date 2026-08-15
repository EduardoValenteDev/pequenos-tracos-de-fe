# 39 · `SF1` Bloco 3 (`R5`) — protocolo fechado — e o protocolo único de `SF1`

> **Natureza deste artefato.** Documental. **Nenhuma linha de código foi alterada**, nenhum comando
> `adb` foi executado, nenhum *build* foi gerado, o tablet permanece **`HANDS OFF`** e `SF1`
> permanece **não iniciável**. Tudo abaixo é preparação escrita, para ser lida *antes* de a câmera
> ligar.
>
> **Continuidade.** Este artefato é a ação que a `ERRATA-04` do artefato `38` nomeou:
> *"a próxima ação passa a ser o fechamento do Bloco 3 (`R5`) — artefato `39`"* (`38:495`).
>
> **`REV-02` · 2026-08-15.** Esta é a **segunda redação**, produzida **antes de qualquer entrega e
> antes de qualquer commit**. A primeira redação foi submetida a um crítico de completude e a uma
> leitura de fechamento de lacunas, e teve **duas teses centrais derrubadas**: a **ordem de execução**
> (correção `C-09`) e o **veredito de reversibilidade** (correção `C-10`). Nenhuma das duas sobreviveu
> ao confronto com o código do harness e com a perícia do artefato `13`. As duas derrubadas estão
> lavradas em §2 com fonte — não foram apagadas em silêncio. Nada em `37` ou `38` foi reescrito.
>
> **Método de correção.** Aditivo. Onde este artefato corrige uma leitura anterior — inclusive as
> suas próprias — ele **nomeia a leitura, cita a fonte que a refuta e data a correção**.

---

## 1 · O que este artefato fecha — e o que ele **não** pode fechar

O artefato `38` listou, verbatim (`38:442-445`), o que faltava para o Bloco 3:

> *"roteiro gesto a gesto, método de injeção de estado para `E4`/`E5`/`E6`, pré-condições,
> *checkpoints*, nomes de evidência e critérios de `STOP`. `E4`, `E5` e `E6` **mutam o acervo
> deliberadamente** — o método de injeção precisa ser desenhado e aprovado, não improvisado com o
> tablet na mão."*

| O que faltava | Estado após este artefato |
|---|---|
| Roteiro gesto a gesto de `R5` | **FECHADO** — §7 |
| Método de injeção de `E4`/`E5`/`E6` | **DESENHADO** — §6. **Não aprovado** (`ARB-INJ-CAMINHO`) |
| Pré-condições | **FECHADAS** — §5.3 |
| *Checkpoints* | **FECHADOS** — §7, §9 |
| Nomes de evidência e destinos | **FECHADOS** — §10 |
| Critérios de `STOP` | **FECHADOS** — §9.2, com os 17 herdados de `14` §11 |
| Análise de reversibilidade | **FECHADA — e o veredito inverteu-se** — §6.7 |
| Ordem causal | **FECHADA — e é diferente da que a numeração sugere** — §5 |
| Contaminações | **FECHADAS** — §8, dezoito vetores |
| Ramificação de rotação | **FECHADA** — §11.4 |
| Protocolo único de `SF1` (Blocos 0–3) | **CONSOLIDADO** — §11 |

**O achado central, dito sem rodeio.** O acervo do SM-X510 é **minúsculo, lacrado e não renovável**:
**14 arquivos** no `TAR-POST03`, **23 chaves** no `catalystLocalStorage`, **uma** obra legada do
Ateliê, **um** ponteiro C60, **três** *blobs* de produto — e *"não existe *slot* `.b.png`"*
(`13:167`). O Colorir 60 tem **1/3** concluído: *"Só `light` está `done`"* (`14:941`). Nesse
aparelho, **toda escrita fora de injeção é irreversível e consome insumo probatório**. O `R5` foi
desenhado para um acervo que não existe.

Disso decorrem quatro consequências que **nenhum artefato do corpus registra**:

1. **§28 `#7` é de tiro único.** Salvar por cima da única obra legada extingue, na mesma tacada, o
   insumo dos casos `14 v2`, `15` e a metade "formato antigo" de `E6` (§8, `X-01`).
2. **O painel de recusa do Colorir contém, dentro de si, o caminho que apaga a obra que ele existe
   para proteger** (§4.3) — e esse caminho **só é reversível se houver *backup* de harness ativo**
   (§6.7).
3. **A parte destrutiva do bloco não são as injeções: são os salvamentos legítimos do produto.**
   Isto inverte a premissa de `08:317` para este acervo (§6.7, correção `C-10`).
4. **Criar obra nova torna o acervo permanentemente não conforme** à condição de `STOP` `#15` de
   `14` §11 — *"Aparecer obra no acervo que não veio da `PREP-LEGADO-03`"* — para qualquer
   reobservação futura da `R2` (§8, `X-18`).

**Cinco arbitragens bloqueiam o Bloco 3** — §12.1. Nenhum `PASS` é declarado aqui. Nenhum portão é
concedido aqui.

---

## 2 · Correções aditivas às leituras que produziram este artefato

A extração de `R5` foi submetida a verificação adversarial independente, a um crítico de completude e
a uma leitura de fechamento das fontes que nenhuma frente havia lido. **Dez leituras foram
refutadas** — oito da extração e **duas da primeira redação deste próprio artefato**.

| # | Leitura refutada | O que é verdade | Fonte que refuta |
|---|---|---|---|
| `C-01` | *"Só `#7` e `#17` da §28 têm task própria"* | **Treze** dos 17 carregam token `TK-A-*`. `05:2847`: *"**17 cenários do PLAN · 17 com task · nenhum substituído.**"* O marcador *"(task própria — restaurada)"* ocorre duas vezes — **`#7` e `#14`** — nunca `#17`, que é *"parcela"* | `05_TASKS:2829-2847` |
| `C-02` | *"§28 = 17 cenários a executar em `R5`"* | Cinco (`#12`–`#16`) são `SG-B`/`SG-C`, excluídos por `07:299`; `#17` é `R6` e está `NÃO EXECUTADO` (`CN-1`). Quanto é o escopo de `R5` está **em disputa** (`ARB-28-ESCOPO`) | `07:299`, `06:286`, `37:248` |
| `C-03` | *"O painel deve dizer 'não consegui abrir esta obra' (`05:748`)"* | `05:744-750` é o campo **"Mudança esperada"**, não texto de tela. A frase **não aparece em tela alguma**. Os textos reais estão em §4.2 | `05:744-750` × `ColoringScreen.js:1383-1385`, `AtelierCanvasScreen.js:462-466` |
| `C-04` | *"Três *namespaces* de obra em `storageKeys.js`"* | `:48` e `:116` são **índice e itens da MESMA loja**; `:101` é o Colorir **legado, aposentado**; e o *namespace* do **C60 não está em `storageKeys.js`** (`grep -c drawing60` = 0). Inventário correto em §4.5 | `atelierStorage.js:13,17`; `drawingStorage.js:21-24`; `coloring60DrawingStorage.js:179` |
| `C-05` | *"O *namespace* de conclusão do C60 produz o acervo misto de `E6`"* | **Falso e perigoso.** *"Acervo misto"* é mistura de **formatos de *payload***, na camada de píxeis. Mexer em `done`/`ever`/`snap` **não exercita `E6`** e corrompe a contagem *"x de 3"* | `07:610`, `coloring60ActivityService.js:8-9` |
| `C-06` | *"O sufixo `R` de `TA-5R` nasceu na implementação"* | Verdade só para o arquivo `04`. `TA-5R` é **normativo** em `05`, `06`, `07`, `10`, `36`, `37`, `38`, com critério físico congelado em `06:443` | `06:443`, `06:285` |
| `C-07` | *"O item se chama `TA-5R (aviso)`"* | O cabeçalho é `\| Item \| Task \| O que observar \|` (`06:438`). O **item** é **"Nitidez em tablet"**; *"`TA-5R` (aviso)"* está na coluna **Task**, onde *"(aviso)"* supre o ID ausente (`07:338`) | `06:438`, `07:338` |
| `C-08` | *"A família `TA-*` vive só em `04` §23"* | `TA-14`/`TA-15` são criados por `05:205-212`; a família tem **15** (`05:2793`). E `TA-5R` **não pertence a ela** — é homônimo colidente (`ARB-TA5R-HOMONIMIA`) | `05:205-212`, `05:2793` |
| **`C-09`** | **A ordem proposta na `REV-01` deste artefato** — `E1` → §28 `#7` → `E6` → `TA-5R` → `E5` → `E4` | **Derrubada.** Punha três escritores **antes** de `E6`, autossabotando o único item cujo insumo todos eles degradam, num acervo com **uma** obra antiga. A ordem é ditada pelo **consumo de insumo**, não pela numeração — §5 | `14:941`, `13:167`, `coloring60DrawingStorage.js:384,657-659` |
| **`C-10`** | **O veredito de reversibilidade da `REV-01`** — *"o harness restaura a chave que alterou; não restaura um arquivo que o produto apagou legitimamente depois"* | **Derrubada, e o erro era grave nos dois sentidos.** `restaurar()` **recopia o *blob* original de volta para a `uri` original** — *"Blobs primeiro: a chave só volta a apontar para algo que já existe"* —, logo **com *backup* ativo até o caminho "Pintar de novo"→"Pronto" é reversível**. O que **não** é reversível é o salvamento legítimo **fora** de injeção, onde *backup* nenhum existe. **A parte destrutiva do bloco não são as injeções** | `harnessStore.js:292-320`, `:324-362`, `:381-388`, `:391-404` |

**Três avisos que precisam viajar com o protocolo:**

- **Defeito conhecido e diferido no Ateliê (gravação).** `05:2982` registra o *write-forward* de
  `atelierStorage.saveArt` como descoberto por `TK-A-096`, severidade **média**, destino **`F12A`**,
  literalmente *"**Não é bloqueador de `F6-SG-A`**"*.
- **Defeito visual conhecido e NÃO corrigido (salvar obra NOVA no Criar Livre).** `13:449-451`: no
  **próprio SM-X510**, o *sheet* **"Nomeie seu desenho"** abriu *"parcialmente abaixo/atrás da barra
  fixa inferior"* e *"a ação visual **'Guardar desenho' ficou inacessível**"*. Classificado
  `ACHADO VISUAL REAL` do *runtime* histórico `7de7085`, com ressalva explícita em `13:514-515`:
  *"**Se o `HEAD` atual reproduz ou não o mesmo problema é `NÃO DETERMINADO`**"*. `14:669` reafirma:
  *"Achado visual de `13` §8 **NÃO corrigido** — registro, não trabalho autorizado."* **O operador
  pode topar com ele ao criar obra nova e lê-lo como defeito novo.** Declarar antes.
- **Colisão de superfície de chave.** `atelierArt('index')` produz literalmente `ATELIER_INDEX`.
  Nenhuma injeção pode usar o identificador literal `index`.

**Vão de cobertura — declarado, e em boa parte FECHADO.** A extração correu com **27 agentes; 26
concluíram, 1 falhou por esgotamento** — a frente de **forma/redação**, a de menor carga probatória e
a única que não produz fato verificável. **Nenhuma frente de conteúdo se perdeu.** Das treze fontes
que o crítico apontou como não lidas, esta `REV-02` fechou as quatro de maior peso por leitura
direta: **`13_PREP_LEGADO_03.md` §3–§6 e §8** (a perícia do acervo real, antes citada só de segunda
mão), **`13` §10.2**, **`14_R2_SESSAO_2.md` §11–§12** (a lista **fechada de 17** condições de `STOP`)
e **o corpo de `harnessStore.js`** (que produziu a correção `C-10`). Permanecem não lidas as de menor
carga — entre elas `32` §2–§9 e o restante de `harnessInject.js`.

---

## 3 · O achado que muda a **condição de entrada** de `SF1`

### 3.1 O fato

O commit **`2ffcd82`** — *"fix(f6): persistir os campos logicos do payload atraves do ponteiro do
Colorir 60"*, **2026-08-14 16:53:20 -0300** — acrescentou a
[`src/services/coloring60DrawingStorage.js`](../../../src/services/coloring60DrawingStorage.js):

```js
const LOGICAL_SCHEMA_FIELDS = ['paintSchemaVersion', 'layoutVersion', 'logicalW', 'logicalH'];

/** Copia para `target` cada campo lógico PRESENTE em `source`, um a um. Devolve `target`. */
function carryLogicalSchema(source, target) { … }
```

Chamado em **`writeSlot`** (`:442`) e em **`resolvePointer60`** (`:489`). É o **único** *delta* de
código-fonte entre o commit do binário instalado (`521d59c`) e o `HEAD` (`d678140`): **um arquivo,
+46 / −2**.

### 3.2 O que este *delta* contradiz

**(a) Uma "Consequência congelada" viva em `docs/DECISIONS.md`.** `DECISIONS:2789-2791` afirma que
`paintSchemaVersion` e `layoutVersion` *"**nunca alcançam o disco, em veículo nenhum, nem em
`7de7085` nem no `HEAD`**"*, e conclui que uma obra C60 dos dois *runtimes* é *"estruturalmente
indistinguível"*. A citação de apoio do próprio bloco — `coloring60DrawingStorage.js:390-401` — é
**exatamente onde `LOGICAL_SCHEMA_FIELDS` (`:392`) e `carryLogicalSchema` (`:395-402`) hoje vivem**.
A referência aponta para o código que a refuta.

**(b) O "achado estrutural" do artefato `08`.** `08:273-277` declara os eixos *"**inalcançáveis
através de um ponteiro `v:3`**"*. No `HEAD` isso é falso.

**(c) O comentário do próprio harness.** `harnessInject.js:217-218` repete a premissa antiga como
justificativa de projeto de `INJ-03`.

> ✅ **Mas o INSTRUMENTO de observação não caducou.** `harnessStore.js:157` já lista
> `'paintSchemaVersion', 'layoutVersion'` entre os metadados que `inspecionarChave` extrai de toda
> chave. **O inventário do harness reporta os eixos novos se eles aparecerem.** O que está
> desatualizado é o **comentário** de `harnessInject.js`, não a capacidade de medir. Isto reduz — não
> elimina — o risco da saída `A` (§6.5).

### 3.3 Por que isto é **condição de entrada**

`SF1` roda sobre **Development Build**. `DECISIONS:2762-2763`, verbatim: *"**Trocar o escritor não
exige trocar o binário: exige trocar o Metro.**"* **O JS sob teste é o do *worktree* que serve o
Metro, não o do APK.** Com o Metro no `HEAD`, todo salvamento de `SF1` grava os quatro eixos dentro
do ponteiro `v:3` — e isso **muda o valor probatório** de tudo que for salvo.

**A alavanca de segurança está no próprio código**, `:384-386`:

> *"só o SAVE seguinte escreve o formato novo (write-forward, `Q8` r.8). **Ler não promove, não
> migra e não regrava**: um ponteiro legado resolve HOJE nos mesmos bytes de ontem."*

**Ler é seguro. Salvar é o ato irreversível.** Todo o §7 é sequenciado em cima disso.

### 3.4 *Checkpoint* obrigatório `CK-JS`

```powershell
# CK-JS — qual código o Metro está servindo. Executar NO worktree que serve o Metro.
git rev-parse HEAD
git status --short
git log -1 --format="%h %ad %s" --date=iso
```

Saída em `…\SF1_PREFLIGHT_01\CK_JS.txt`. Divergência do declarado ⇒ **`S-STOP-6`**.

---

## 4 · O substrato real

### 4.1 O acervo do SM-X510 — perícia, não estimativa

Lacre `TAR-POST03.tar`, **17 033 728 B**, `SHA256 14FFA2E4…C25574` — referência do gate `G-09`.
Perícia independente em `13` §3–§6; recontagem posterior em `30:137-141`: **14 arquivos ·
`IDENTICAL` 14 · `CHANGED` 0**.

**Inventário físico (`13:160-164`), os 14:** `databases/RKStorage` (45 056 B) ·
`databases/RKStorage-journal` (**0 B**, sem transação pendente) · `files/profileInstalled` ·
`files/phenotype_storage_info/shared/storage-info.pb` ·
`files/DevLauncherApp-BridgelessReactNativeDevBundle.js` · **três** *blobs* de produto · **seis**
`shared_prefs/*.xml`.

Três ausências verificadas, todas operacionalmente relevantes:

> `13:166-168`, verbatim: *"**Não existe `files/ptf_blobs/drawings/`, não existe *slot* `.b.png`, não
> existe `RKStorage-wal`.** Nenhuma escrita ficou fora do lacre."*

**`catalystLocalStorage`: 23 chaves**, `ADDED=7 CHANGED=0 DELETED=0`, `PRAGMA integrity_check = ok`,
e *"nenhuma chave do acervo contém as *substrings* `progress`, `finale`, `invite` ou `milestone`"*
(`13:172-176`).

| Artefato | Identidade pericial | Propriedade probatória |
|---|---|---|
| **Ponteiro C60** (único) | `@ptf_drawing60_screation_alight` — `v:3`, `fmt:2`, `mime image/png`, `rev:22`, `paintedPx/paintablePx` **2 123 494 / 2 317 520** (≈ 91,6 %) | `13` §4: *"real, íntegro e autoconsistente"* |
| ***Blob* C60** | `…/drawings60/_ptf_drawing60_screation_alight.a.png` — **200 565 B**, `SHA256 6814DEE7…1C83F81`, `IHDR` **1440×2156** RGBA, `IEND` presente | `IHDR` = `W`/`H` do ponteiro ⇒ **mutuamente consistentes** |
| **Obra do Ateliê** (única legada) | `art_1786479103982_6079` — `schema 2`, `stateJson.v 2`, **12 *strokes*, 824 pontos, 4 cores, 0 borrachas**, `stamps []`, `bgColor #FFFDF8`, `len(index) == 1` | **os quatro eixos AUSENTES**, verificado por busca recursiva **e** por *substring* nos bytes brutos do SQLite (`13` §5) |
| ***Blobs* do Ateliê** | `…_preview.jpg` **89 593 B** (809×1098) · `…_thumb.jpg` **14 730 B** (300×407) | JPEG válidos; `previewBase64`/`thumbnailBase64` **null** — caminho de arquivo usado |

`14:64`, verbatim: **"A ausência dos quatro eixos é o insumo, não um defeito"**.
`14:941`, verbatim: **"O acervo tem 1/3 do C60 concluído. Só `light` está `done`."**
`13:618-624`: o insumo cobre os cinco casos do Bloco A — `1`, `15`, `16`, `10` **SUFICIENTE**;
**`14` PARCIAL** (só a variante `v2`); e `CASO 14 · v1` = `INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_
REPRODUZÍVEL`, *"sem exceção"* (`14:668`).

**Consequências operacionais, todas duras:**

- **Há exatamente DOIS *slots* C60 vazios** — `living_world` e `people_and_care`. Cada item que
  exigir pintura nova gasta um.
- **🛑 Nunca pintar em `light`.** O salvamento executa
  `deleteBlob(oldUri, { requireSubdir: BLOB_SUBDIR, protect: newUri })`
  (`coloring60DrawingStorage.js:657-659`) e GC dirigido (`:668-673`). **Não há lixeira, quarentena
  nem cópia do lado do produto.** Nenhum documento do corpus proíbe nominalmente usar `light` —
  **este artefato proíbe**.
- **Há exatamente UMA obra legada do Ateliê.** Insumo simultâneo de §28 `#7`, do caso `14 v2`, do
  caso `15` e da metade "formato antigo" de `E6`. **Salvar por cima consome os quatro de uma vez.**
- **O *slot* `.b.png` não existe hoje.** `INJ-10` e `INJ-11` o **criam**; `GH8-2` tem de confirmar que
  ele voltou a não existir.

### 4.2 Os dois painéis de recusa

| Superfície | Arquivo · linhas | Texto em tela | Interação |
|---|---|---|---|
| **Colorir 60** | [`ColoringScreen.js:1381-1396`](../../../src/screens/ColoringScreen.js) | *"Não consegui abrir sua pintura 😕"* · *"Ela continua guardadinha, do jeitinho que estava. Nada foi apagado."* | **um** `Pressable`: **"Pintar de novo"** (`:1387-1394`) |
| **Ateliê** | [`AtelierCanvasScreen.js:460-468`](../../../src/screens/AtelierCanvasScreen.js) | *"Não consegui abrir este desenho"* · *"Ele continua guardadinho, do jeitinho que estava. Nada foi apagado."* · *"Toque em voltar para escolher outro."* | **nenhum** *pressable*; salvar **inativo** (`disabled={!canSave}`, `:427`) |

**Não existe terceiro painel.** A recusa de identidade (`TK-A-051`) **reusa o painel do Colorir**.

**`E4` e `E5` produzem o MESMO texto no Colorir.** O que os distingue é só o console:

| Caso | Linha esperada |
|---|---|
| `E5` (ilegível) | `LOAD_PAINT_CORRUPTED` |
| `E4` (identidade divergente) | `LOAD_PAINT_ORIGIN:{"motivo":"identidade-lineart"}` **seguida de** `LOAD_PAINT_INCOMPATIBLE` |

⇒ **A fotografia do painel, sozinha, não discrimina `E4` de `E5`.** O par `foto + linha de console`
é critério de admissibilidade (§10).

**Duas armadilhas de evidência.** (i) `Coloring60ArtPreviewScreen.js:302-306` e
`Coloring60CollectionScreen.js:379-383` exibem erro **no plural** (*"Não conseguimos"*) —
**fotografá-las não satisfaz `TK-A-045`**. (ii) A palavra **"Apagar"** (`AtelierCanvasScreen.js:601`)
e **"Limpar desenho"** (`:772-774`) permanecem visíveis na barra **enquanto o painel está de pé** —
o código não as oculta. Ver `ARB-PAINEL-APAGAR`.

### 4.3 🛑 O caminho de destruição **dentro** do painel de recusa

O painel do Colorir tem um botão que **reabre o caminho de escrita**:
`ColoringScreen.js:1387-1394` → `onPress={() => setC60ObraNaoAberta(false)}`, rótulo
**"Pintar de novo"**. E `scripts/smoke.js:39418-39419` registra a decisão de projeto, verbatim:

> *"Deliberadamente **NÃO** se bloqueia aqui o 'Pronto': isso alcançaria progresso/conquistas, que
> são área protegida."*

```
injeta E5 → painel sobe → toca "Pintar de novo" → uma pincelada → toca "Pronto"
          → o writer promove o payload novo → deleteBlob(oldUri) → o blob original sai do disco
```

**Duas metades, com desfechos opostos — e a `REV-01` errou nas duas (correção `C-10`):**

- **Com *backup* de harness ativo:** **é reversível.** `restaurar(chave)` recopia o *blob* preservado
  de volta para a **`uri` original** antes de repor a chave — `harnessStore.js:301`: *"Blobs
  primeiro: a chave só volta a apontar para algo que já existe."* Resíduo: o `.b.png` novo fica
  órfão, e o GC do produto o recolhe no salvamento seguinte.
- **Sem *backup* — isto é, em qualquer salvamento legítimo fora de injeção:** **é definitivo.**

⇒ **Proibição escrita, vinculante para todo o Bloco 3:** enquanto o painel de recusa do Colorir
estiver sob observação, **é proibido tocar "Pintar de novo"**. O painel é observado, fotografado e
lido — **e sai-se dele pelo botão de voltar do sistema**. Motivo: mesmo reversível, o toque cria um
salvamento não previsto, e `14:648` faz de *"traço, salvamento ou encerramento acidental"* uma
condição de `STOP`. O painel do Ateliê é estruturalmente seguro e serve de ensaio do gesto (`GH4`).

### 4.4 🛑 O segundo gatilho: migração em massa no *boot*

`App.js:88` executa `runLocalMigrations()` **a cada inicialização**.
`storageMigrationService.js:140-141` só dispensa a migração se a versão gravada for
`>= APP_STORAGE_SCHEMA_VERSION`, que é **3** (`storageKeys.js:19`). Abaixo disso, o *boot* roda
`migrateDrawingsToFiles` (`drawingStorage.js:218-243`), que percorre `@ptf_drawing_*` e executa
`AsyncStorage.setItem(k, ptr)` **em laço**.

Isso é **exatamente** a "migração em massa" que `E6`/`CN-13` existe para refutar — e aconteceria
**antes do primeiro gesto**, sem ninguém tocar na tela.

**Agravante:** `08:159` promete que `RST-TUDO` devolve cada chave ao estado exato anterior. Se a
chave de *schema* entrar nesse escopo, **uma restauração pode REBAIXAR a versão e armar o gatilho
para o *boot* seguinte**.

⇒ **Verificação obrigatória** em `P3-3`, em `GH0-7` e **de novo** em `GH8-3`.

### 4.5 Inventário correto dos *namespaces*

| # | Superfície | Chave | Dono | *Blobs* | Estado |
|---|---|---|---|---|---|
| 1 | **Ateliê / Criar Livre** | `ptf_atelier_arts_v1_index` + `…_<id>` | `atelierStorage.js:13,17` | `ptf_blobs/atelier/` | vivo · `stateJson` **inline** |
| 2 | **Colorir legado** | `@ptf_drawing_s<storyId>_c<sceneId>` | `drawingStorage.js:34` | `ptf_blobs/drawings/` | **aposentado** — `saveDrawingState` tem *"zero chamadores"* (`11:174`); e `13:167` confirma que **o diretório não existe no aparelho** |
| 3 | **Colorir 60** | `@ptf_drawing60_s<storyId>_a<activityId>` | `coloring60DrawingStorage.js:179` | `ptf_blobs/drawings60/` | vivo · ponteiro `v:3` + *blob* |

`storageKeys.js` **não é o censo completo** (`grep -c drawing60` = **0**) apesar de `:4`
declarar-se *"fonte única de verdade"*. Registrado em `ARB-CENSO-CHAVES` — higiene, não bloqueador.

**Provado seguro para leitura pura:** `grep -l "setItem|removeItem|multiRemove|deleteBlob|writeBlob"`
em `coloring60CollectionReader.js`, `coloring60State.js` e `coloring60PortraitMerge.js` retorna
**vazio**. **Os leitores de coleção não escrevem** — é o que torna `E6` executável primeiro.

### 4.6 ⛔ A bancada `Coloring60Lab` é uma armadilha destrutiva

Na falta do harness, a tentação óbvia é a rota interna `Coloring60Lab`
(`AppNavigator.js:500-503`, sob `isInternalToolsEnabled()`). **Dois de seus botões destroem acervo:**

- `clearColoring60Lab()` (`coloring60LabService.js:169-172`) chama `resetCreationColoringJourney`,
  que apaga ponteiro, desfecho e **arquivo físico** das três atividades;
- `setColoring60LabProgress(count)` (`:141`, `:145`) chama `clearColoring60Done` nas atividades fora
  do alvo, **apagando a conclusão histórica de `light`**.

E a bancada **não resolve** `E4`/`E5`: `:111` recusa semear sem arte real
(`if (!snapshotHasMeaningfulColor(art)) return false`).

⇒ **A bancada `Coloring60Lab` está proibida durante todo o `SF1`.**

---

## 5 · Ordem causal — o princípio que ordena o Bloco 3

### 5.1 O princípio

> **No SM-X510 a ordem é ditada pelo consumo de insumo, não pela numeração dos casos:
> leitura pura antes de escrita; escrita não destrutiva antes de destrutiva; e o que exige estado
> fabricado por último, porque é o único que tem desfazimento provado.**

A segunda metade é a correção `C-10`. `08:317` dizia *"`GH2` vem por último porque as injeções são a
única parte destrutiva-e-restaurada"* — e, para **este** acervo, o adjetivo que pesa é
**"restaurada"**: as injeções são a única parte que **tem rede**. Os salvamentos legítimos não têm.

**Ordem resultante:**

```
E6 (leitura pura)  →  §28 #7 (em duas metades)  →  TA-5R fundido com E1 (slot VAZIO)
                   →  painel do Ateliê  →  E5 no Colorir  →  E4 por último
```

| Posição | Item | Razão causal |
|---|---|---|
| 1 | **`E6`** | Único item cujo insumo é *"o acervo tal como a criança o deixou"*, e **todo item posterior o degrada** — há **uma** obra antiga. Além disso `CN-13` (*"nenhuma migração em massa"*) **só é observável no PRIMEIRO *boot* da sessão** (§4.4). É leitura pura e comprovadamente não escreve (§4.5) |
| 2 | **§28 `#7`** | Insumo irrepetível. Vem antes de qualquer outra escrita para medir o produto puro — e **partido ao meio**, com o ponto de não retorno explícito (`GH2`) |
| 3 | **`TA-5R` + `E1` fundidos** | Os dois querem **uma pintura nova**. Separados gastam os **dois** *slots* vazios; fundidos gastam **um**. E vão no Colorir 60, **não** no Ateliê — criar obra nova no Criar Livre esbarra no *sheet* "Nomeie seu desenho" de `13` §8, cujo estado no `HEAD` é `NÃO DETERMINADO` |
| 4 | **Painel do Ateliê** | Estruturalmente **incapaz** de causar dano (`:427` `disabled={!canSave}`; painel sem botão). É o **ensaio seguro** do gesto de observação, antes do painel perigoso |
| 5 | **`E5` no Colorir** | Exige estado fabricado ⇒ tem *backup* ⇒ é a parte **com** rede. Mas o painel contém o caminho de escrita (§4.3), então quanto menos itens dependerem do acervo depois dele, menor a exposição |
| 6 | **`E4`** | O mais frágil epistemicamente: **as três atividades têm dimensões idênticas** — `coloring60Catalog.js:40,49,58`, todas `1122×1402` — logo trocar *lineart* **não dispara nada**, e o único `E4` legítimo é `INJ-04`, que fabrica `imgW`/`imgH` divergentes. Se o harness não existir, `E4` termina `NÃO EXECUTÁVEL` — **melhor descobrir com todo o resto já colhido** |

### 5.2 Por que `R5` (`SF1`) vem antes de `R4` (`SF2`)

Não é conflito com `06:277`. `06:449` exige, para o `CASO 13`, *"rollback do código **com acervo já
misto**"*, e `37:311` explicita que esse é um *"estado que só existe **depois** de `SF1`"*. **`SF1`
produz a pré-condição de `SF2`.** Resolvido por leitura, não por arbitragem.

> ⚠️ **Mas a premissa do acervo misto precisa ser reexaminada.** `07:610` afirma *"Ao fim de `G5` o
> acervo está **misto**"* — só que `G5` é **iPad** e inclui `E3`, congelado no Android. No SM-X510 o
> "misto" dependeria do salvamento de §28 `#7` (`GH2b`), que é justamente o passo em disputa
> (`ARB-28-7-TIRO-UNICO`). **Se `GH2b` não for autorizado, `SF2` fica sem pré-condição.**

### 5.3 Portas de entrada do Bloco 3

| # | Porta | Verificação | Se falhar |
|---|---|---|---|
| `P3-1` | Blocos 0, 1 e 2 encerrados, TAR de *checkpoint* gravado e conferido | `Get-FileHash` + `tar -tf` | não entrar |
| `P3-2` | `CK-JS` gravado e igual ao declarado | `CK_JS.txt` | `S-STOP-6` |
| `P3-3` | Versão de *schema* no aparelho = **3** | §4.4 | **não abrir o app** — `S-STOP-11` |
| `P3-4` | Existe a obra legada do Ateliê **e** o ponteiro C60 de `light`, íntegros; e **não existe** `.b.png` | inventário `INS-01` × §4.1 | **pare** (`07:542`) |
| `P3-5` | Caminho de injeção **autorizado** (`ARB-INJ-CAMINHO`) | resposta escrita | `E4`, `E5` e os painéis ⇒ `☐ bloqueado (L-2)` |
| `P3-6` | Postura de restauração **decidida por escrito** (`ARB-TAR-REDE`) | resposta escrita | não executar `GH2b` nem `GH7` |
| `P3-7` | Escopo §28 **decidido** (`ARB-28-ESCOPO`) | resposta escrita | só `#7`; demais `NÃO EXECUTADO` |
| `P3-8` | Salvamento de `GH2b` **decidido** (`ARB-28-7-TIRO-UNICO`) | resposta escrita | `#7` para em `GH2a` |
| `P3-9` | Criação de obra nova **decidida** (`ARB-OBRA-NOVA`) — ela torna o acervo não conforme a `14` §11 `#15` | resposta escrita | `TA-5R` e `E1` = `NÃO EXECUTADO` |
| `P3-10` | Passos de reset do artefato `32` (`E0..E8`) **renomeados** para não colidirem com `E1..E6` | tabela escrita antes da sessão | **não iniciar** — ambiguidade de comando |
| `P3-11` | Portas **8081/8082/8083 livres** antes de subir o Metro (`14` §11 `#4`) | `netstat` | `S-STOP-13` |
| `P3-12` | `logcat` limpo, câmera externa em posição | `PS3` em primeiro plano | não iniciar |
| `P3-13` | Rotação **observada e registrada** (§11.4) | rotação de teste fora de obra aberta | registrar o ramo |

---

## 6 · Método de injeção

### 6.1 A limitação, verbatim

`07:362` titula *"`L-2` — não existe caminho de injeção no acervo"*, e `07:366`: *"Os painéis de
recusa (`TK-A-045`, `TK-A-051`) **só** são alcançáveis por essa via."* `07:801` e `07:842` já preveem
um terceiro estado: **`☐ bloqueado (L-2)`**.

### 6.2 O harness existe — e onde

```
$ git worktree list
…  C:/tmp/ptf_f6_PHYSICAL_HARNESS_wt   1ae353f (detached HEAD)
$ git log --all --oneline -- src/devharness
(vazio — NUNCA commitado; 08:130 diz que é deliberado)
```

| Arquivo | Bytes | Papel |
|---|---|---|
| `F6PhysicalHarnessOverlay.js` | 8 868 | tarja + painel, único componente montado |
| `harnessInject.js` | 25 605 | catálogo `INJ-01`..`INJ-12` |
| `harnessStore.js` | 18 681 | leitura crua, *backup*, restauração, `RST-TUDO` |
| `harnessDiff.js` | 9 415 | `SNP-DIFF` |
| `harnessOps.js` | 7 656 | operações |
| `harnessLog.js` | 2 569 | registro em console |
| `README_HARNESS.md` | 3 549 | fronteira e regras |

Fronteira declarada: `O harness INJETA. → O produto REAGE. → O harness OBSERVA.` O acoplamento com o
produto é de **sete linhas** em `App.js`, sob `__DEV__`, como **irmão** da árvore de *providers*.

> ⚠️ **`README_HARNESS.md` é um sétimo arquivo não lacrado** — `08` §4.7 lista **seis** com `SHA256`
> e este não está entre eles.

### 6.3 A rede de desfazimento — lida no código, não no documento

Esta é a leitura que a `REV-01` não tinha feito, e que produziu a correção `C-10`.

| Mecanismo | Onde | O que garante |
|---|---|---|
| `fazerBackup(chave)` | `:265-291` | preserva o **valor da chave** e **copia os *blobs*** que ela referencia (`uri`, `previewUri`, `thumbnailUri`) para `DIR_BACKUP = ${documentDirectory}__f6h_backup__/` — **fora** de `ptf_blobs/` |
| **Idempotência de *backup*** | `:271`, `:336` | *"backup ja existia — preservado"*. **Nunca sobrescreve** o primeiro *backup* com um estado intermediário já corrompido |
| `restaurar(chave)` | `:292-320` | **repõe os *blobs* primeiro, depois a chave** — *"a chave só volta a apontar para algo que já existe"*. `deleteAsync(u)` + `copyAsync(backup → u)`: **devolve os bytes originais à `uri` original** |
| `fazerBackupArquivo(uri)` | `:333-347` | preserva arquivo avulso (o *slot* inativo) **e registra a AUSÊNCIA**: *"se o arquivo não existia, desfazer é apagá-lo de volta"* |
| `restaurarArquivo(uri)` | `:349-365` | `deleteAsync` **remove arquivo OU diretório** — comentário próprio: *"é o que desfaz `INJ-10`, cujo compensatório do produto (`deleteBlob`) recusa diretório com `nao_e_arquivo` e o deixa para trás"* |
| `exigirLimpo(idOperacao)` | `:377-388`, chamado em `harnessInject.js:134` | **portão de entrada de TODA injeção.** Se houver *backup* pendente, lança: *"`RECUSADA`: … rode `RST-TUDO` antes"*. *"A operação é recusada, não emendada"* |
| `restaurarTudo()` | `:391-404` | **arquivos primeiro, chaves depois** — *"assim nenhuma chave restaurada aponta, nem por um instante, para um *blob* que ainda não voltou ao lugar"* |

**Duas consequências que mudam o protocolo:**

1. **A regra de ferro "uma injeção por vez" é mecânica, não documental.** `exigirLimpo` a impõe no
   código. Um operador **não consegue** empilhar injeções.
2. **`INJ-09` faz *backup* dos DOIS *slots*** (`harnessInject.js:385-386`) e `INJ-10`/`INJ-11` do
   arquivo-alvo (`:413`, `:438`), inclusive da sua ausência. **O desfazimento de `INJ-10` está
   implementado**, não prometido.

### 6.4 O bloqueio: o harness está defasado

```
$ git rev-list --count 1ae353f..HEAD
85
$ git diff --stat 1ae353f 521d59c -- src App.js index.js babel.config.js metro.config.js app.json package.json
 30 files changed, 1892 insertions(+), 330 deletions(-)
```

**Oitenta e cinco commits** atrás do `HEAD`; trinta arquivos de diferença até o binário instalado —
`AppNavigator`, superfícies de *layout*, `useWindowBand`, `shellLifecycleTrace`, `TabletSidebar`, a
maioria das telas. Servir o Metro a partir do *worktree* `C` como está poria **um app materialmente
diferente** sob teste. É o que `08:284-286` manda evitar: *"parar essa parte e reportar — não
construir um teste que prova a si próprio."*

### 6.5 O que destrava a saída A

```
$ git diff --stat 1ae353f HEAD -- App.js index.js
(vazio)
```

**`App.js` e `index.js` são byte a byte idênticos entre `1ae353f` e o `HEAD`** — o enxerto de sete
linhas aplica-se sem conflito. O vocabulário de chaves bate com o `HEAD` (`harnessInject.js:48,49,50,
45` × `coloring60DrawingStorage.js:179`, `drawingStorage.js:34`, `atelierStorage.js:17`,
`coloring60DrawingStorage.js:122`). E **o inspetor já é compatível com o formato novo**
(`harnessStore.js:157`, §3.2).

**Duas confirmações independentes vindas do próprio harness:**

- `harnessStore.js:167-169` calcula `razaoOrigem = imgW/imgH` com o comentário *"`imgW/imgH` só
  protegem a tinta pela RAZÃO de aspecto (`ColoringCanvas.js:857-864`)"* — **o autor do harness
  chegou à mesma conclusão de §7 `GH6` sobre o limite estrutural de `E4`**, por caminho independente.
- `:161-163` grava o título da obra como **hash, nunca como texto** — *"o título da arte é escrito
  pela criança e pode conter nome próprio"*. Higiene de dados de criança, já resolvida.

**Uma premissa caducou** — `harnessInject.js:217-218` repete o achado de `08:273-277`, hoje falso por
`carryLogicalSchema` (§3). Não quebra `INJ-03`; **muda a declaração de cobertura**.

### 6.6 As três saídas — decisão do fundador (`ARB-INJ-CAMINHO`)

| | **A · Reenxertar no `HEAD`** | **B · `adb run-as`** | **C · `BLOQUEADO (L-2)`** |
|---|---|---|---|
| **O que é** | *Worktree* novo no `HEAD`, copiar `src/devharness/`, reaplicar as 7 linhas, servir na **8083** com tarja | Alterar arquivos e o SQLite de fora, app parado | Não injetar. `E4`, `E5` e os painéis saem `☐ bloqueado (L-2)` |
| **Custo** | *Worktree* novo — **alteração de repositório, exige autorização** (`06:453`) | nenhum no repositório | nenhum |
| **Risco** | Código sob teste = `HEAD`, não o binário. Divergência declarada (§3). Exige **reauditar o catálogo `INJ-*` contra o `HEAD`** | **Alto.** Escrita externa consome *rowid* fora da contabilidade e corrompe a forense de `13` §3.3; dissolve a fronteira *"o harness injeta, o produto reage"*. E `14:644` faz de *"falha de `run-as`"* um `STOP` | zero |
| **Rede** | `fazerBackup` + `restaurar` + `exigirLimpo` + `RST-TUDO`, **verificados em código** (§6.3) | só TAR — que `14:652` transforma em `STOP` | trivial |
| **Cobertura** | `E4`, `E5`, painéis, `INJ-01`..`INJ-11` | idem, com atribuição causal pior | perde todos |
| **Precedente** | `06:467-472` já aceitou *worktree* dedicado + porta distinta para o `CASO 13` | nenhum | `07:801`, `07:842` |

**Recomendação técnica (não é decisão):** **A**, condicionada a (i) reauditar `harnessInject.js`
contra o `HEAD` — `harnessStore.js` já foi lido nesta preparação e o contrato de *backup*/restauração
**não depende** do formato do ponteiro, o que o torna resiliente ao *delta* de `2ffcd82`; e (ii)
conferir que **8083 está livre** antes de subir o Metro (`14` §11 `#4`). **B** é a única que
compromete a contabilidade de *rowid* que já sustenta evidência histórica.

> ⚠️ **Nada da saída A foi executado.** Nenhum *worktree* foi criado, nenhum arquivo copiado, nenhum
> enxerto aplicado. O *worktree* `C` foi **apenas lido**.

### 6.7 Veredito de reversibilidade — invertido em relação à `REV-01`

**Com o harness ativo, a parte injetada é a parte SEGURA do bloco.**

| Op | Toca | Desfaz-se como | Classe |
|---|---|---|---|
| `INJ-01` | *blob* ativo vira texto | `restaurar` recopia os bytes originais para a `uri` original | ✅ com *backup* |
| `INJ-02` · `03` · `04` · `05` | valor no AsyncStorage | regravar | ✅ total |
| `INJ-06` · `07` · `08` | `stateJson` do Ateliê (**inline**) | regravar a *string* | ✅ total |
| `INJ-09` | ponteiro ilegível, *blob* vivo; *backup* dos **dois** *slots* (`:385-386`) | reabrir: reversível · **salvar por cima: gesto proibido** | ⚠ desfecho em aberto (`08:251`) |
| `INJ-10` | **diretório** no nome do *slot* inativo | `restaurarArquivo` — `deleteAsync` remove diretório (`:359`), o que `deleteBlob` do produto recusa | ✅ **implementado**; `08:260`: nunca encerrar sem restaurar |
| `INJ-11` | lixo no *slot* **inativo** | *backup* registra a **ausência** ⇒ desfazer é apagar de volta; e o GC do produto também recolhe | ✅ duplamente |
| `INJ-12` | cena legada do Livrinho | — | ⛔ **SEM INSUMO** — ver abaixo |

> ⛔ **`INJ-12` não é executável neste aparelho.** `11:174`: o Colorir legado está *"**aposentado** —
> `saveDrawingState` (`:130`) tem **zero chamadores**"*. E a perícia confirma fisicamente:
> `13:167` — *"**não existe `files/ptf_blobs/drawings/`**"*. Produzir o insumo exigiria **fabricar
> obra**, o que `10:376` proíbe (*"isso destruiria o valor do caso"*) e `14:655` lista como `STOP`
> `#17`. **`INJ-12` sai do roteiro.**

**O que NÃO tem rede — e é o que de fato ameaça o acervo:**

1. **Todo salvamento legítimo do produto fora de injeção.** `GH2b`, `GH3`, e qualquer toque acidental
   em "Pronto". Não há *backup*, e `deleteBlob` já apagou o anterior.
2. **A restauração do TAR está juridicamente trancada.** `32:116-117`: *"**A proibição histórica
   CONTINUA VÁLIDA** — integralmente, fora da janela do `R2P1 ENTRY RESET` autorizado."* A tabela de
   `32:122-126` restringe a exceção a uma janela nominal e a uma posição fixa, e proíbe *"transformar
   restauração em resposta genérica a `STOP`"*. `32:114` cita `14` §8.1: *"🔴 **NÃO restaurar `TAR`
   por reflexo** … Restaurar é operação destrutiva e **desnecessária**."* E a lista fechada é ainda
   mais dura — `14:652`, condição `#14`: **a própria *"necessidade de restaurar `TAR` para 'consertar'
   o estado de entrada"* É UMA CONDIÇÃO DE `STOP`.**

⇒ **Conclusão operacional.** Não se pede autorização prévia para restaurar: pede-se **decisão sobre
executar ou não os passos que não têm rede**. É isso que `ARB-TAR-REDE` e `ARB-28-7-TIRO-UNICO`
perguntam. Se a resposta for "não executar", o Bloco 3 roda **inteiro dentro da parte com rede** — e
`SF2` fica sem pré-condição (§5.2).

### 6.8 Como o alvo é escolhido

`08:232-237`: o harness **não pergunta identificadores**. Elege, no C60, o *blob* de
`modificationTime` mais recente; no Ateliê, a arte de maior `updatedAt`. *"O operador controla o
alvo pintando"*, e o harness **imprime** a chave eleita.

> **Regra derivada:** entre pintar o alvo e injetar, **não tocar em nenhuma outra obra**. Conferir
> sempre a chave impressa antes de observar (`S-STOP-1`).

---

## 7 · Roteiro gesto a gesto — `SF1` Bloco 3 (`R5`)

> **Protocolo fechado antes de a câmera ligar.** O fundador opera sozinho; nenhuma instrução
> interativa durante a gravação. Se a câmera parar antes de um *checkpoint*, **registrar a
> descontinuidade** (`37:443-447`).
>
> **Preâmbulo da §28, verbatim (`04:1044-1045`):** *"**Cada passo é executado com desenho em
> andamento no Colorir e no Ateliê, e com o acervo real de desenhos já salvos do aparelho.**
> Registro em vídeo, não só em captura."*
>
> **Três proibições vinculantes:** ⛔ nunca pintar em `light` (§4.1) · ⛔ nunca tocar "Pintar de
> novo" (§4.3) · ⛔ nunca abrir `Coloring60Lab` (§4.6).

### `GH0` — abertura

| # | Gesto |
|---|---|
| 1 | `PS1`: confirmar o *worktree* que o Metro serve — colar `CK-JS` no `raw.log` |
| 2 | Conferir **8081/8082/8083 livres** antes de subir o Metro (`14` §11 `#4`) |
| 3 | `PS2`: `am force-stop com.valentedev.pequenostracosdefe` |
| 4 | `PS2`: `logcat -c` **(o último do bloco; daqui em diante o `raw.log` é contínuo)** |
| 5 | `PS3` em primeiro plano, capturando para `…\SF1_R5_01\logcat\raw.log` |
| 6 | Câmera externa ligada, tablet inteiro + barra de sistema no quadro |
| 7 | **TAR `TAR-R5-ANTES`** + `Get-FileHash` + `tar -tf`, conferidos **antes** de prosseguir |
| 8 | **Conferir versão de *schema* = 3** (§4.4). Se `< 3`, **não abrir o app** — `S-STOP-11` |
| 9 | Abrir o app. Com a saída `A` autorizada: conferir a **tarja `F6 PHYSICAL HARNESS`**. Ausente ⇒ `S-STOP-9` |
| 10 | Harness → `INS-01` (inventário ANTES) e `INS-02` (limpeza). Conferir contra §4.1: **14 arquivos, 23 chaves, sem `.b.png`** |

### `GH1` — `E6`, acervo misto · **LEITURA PURA, PRIMEIRO DE TODOS**

**Por que primeiro:** único item cujo insumo todo item posterior degrada; e `CN-13` só é observável
no **primeiro *boot*** da sessão. Provado que os leitores não escrevem (§4.5).

| # | Gesto | Esperado (`06:434`) |
|---|---|---|
| 1 | Abrir a **galeria** — **sem nada ter sido salvo ainda nesta sessão** | *"Todas as obras aparecem; nenhuma some da listagem"* |
| 2 | Conferir **miniaturas** — nenhuma vazia, nenhuma trocada | — |
| 3 | Abrir **a obra legada do Ateliê** e **a obra C60 de `light`** — **sem salvar nenhuma das duas** | as duas abrem |
| 4 | Sair de cada uma **pelo voltar**, nunca por salvar | — |
| 5 | Captura da galeria completa | — |
| 6 | Harness → `SNP-DIFF` contra `INS-01` | **`CN-13`: nenhuma migração em massa**; nenhum registro reescrito só por abrir (`05:1086`) |

**`FAIL`:** obra some; registros reescritos pela simples abertura (detectável pela ordem do índice,
pelos contadores de `07:623` e pela forense de `rowid` de `13` §3.3).

### `GH2` — §28 `#7` · **EM DUAS METADES, COM O PONTO DE NÃO RETORNO EXPLÍCITO**

Resultado esperado operativo, `06:440`: *"Abrir desenho salvo **antes** da mudança **e continuar
desenhando** por cima — sem salto de escala nem desalinhamento ao retomar"*.

#### `GH2a` — abrir e continuar desenhando, **SEM SALVAR** *(reversível)*

| # | Gesto |
|---|---|
| 1 | Abrir a **obra legada do Ateliê** (`art_1786479103982_6079`) |
| 2 | **Fotografar antes de tocar** — este quadro é o referencial de alinhamento |
| 3 | **Continuar desenhando por cima**, sem sair da tela |
| 4 | Observar: houve **salto de escala** ao retomar? houve **desalinhamento**? — é **aqui** que `#7` é medido |
| 5 | Fotografar o traço novo sobre o antigo |

**Se houver qualquer dúvida em `GH2a`, PARAR ANTES DE `GH2b`.** Sair sem gravar ainda é reversível.

#### `GH2b` — 🛑 **SALVAR — PONTO DE NÃO RETORNO** *(exige `P3-8`)*

O *write-forward* grava os quatro eixos e **a obra deixa de ser legada para sempre**. Morrem junto os
insumos dos casos `14 v2`, `15` e a metade "formato antigo" de `E6` (que por isso já foi colhida em
`GH1`). **Não há *backup* de harness aqui** — é salvamento legítimo do produto (§6.7).

| # | Gesto |
|---|---|
| 1 | Declarar em voz alta, para a câmera, que este é o ponto de não retorno autorizado por `ARB-28-7-TIRO-UNICO` |
| 2 | **Salvar** |
| 3 | Reabrir e fotografar |
| 4 | Harness → `SNP-DIFF` — confirmar que apareceram os quatro eixos e **nada mais** |

> ⚠️ Um `FAIL` ao salvar pode ser o defeito **já conhecido e diferido** de `atelierStorage.saveArt`
> (`05:2982`, destino `F12A`, *"não é bloqueador de `F6-SG-A`"*). Registrar; **não** tratar como
> descoberta nova sem confronto com `05:2982`.

> ⚠️ `04:1161-1162` blinda o §28 como critério **literal de iPad**. O que se executa aqui **não
> fecha** o critério de saída do §27. Ver `ARB-28-IPAD`.

### `GH3` — `TA-5R` **fundido com** `E1`, num *slot* **VAZIO** *(exige `P3-9`)*

**Por que fundidos:** os dois exigem uma pintura nova, e há **apenas dois *slots* vazios**.
**Por que no Colorir 60 e não no Ateliê:** criar obra nova no Criar Livre convoca o *sheet* "Nomeie
seu desenho" de `13` §8, cujo comportamento no `HEAD` é `NÃO DETERMINADO`.

> 🛑 **Alvo obrigatório: `living_world` ou `people_and_care`. NUNCA `light`** (§4.1).

| # | Gesto | Item |
|---|---|---|
| 1 | Abrir um *slot* C60 **vazio** | — |
| 2 | Pintar com o **balde** em ≥ 3 regiões, incluindo uma de **borda curva** | — |
| 3 | Deixar a tela **estática** — nenhum toque, nenhuma animação | `TA-5R` |
| 4 | **Registrar a borda do balde** contra o *lineart* em `multiply`, **ampliada** | `TA-5R` |
| 5 | **Salvar** — sem rede (§6.7) | — |
| 6 | Fechar e **reabrir sem mudar a janela e sem girar** | `E1` |
| 7 | Fotografar antes/depois da reabertura | `E1` |

**`E1` — esperado (`06:429`):** *"Reabre idêntica ao que foi fechado"*.
**`TA-5R` — aceite (`06:443`):** *"a **borda do balde** aparece **limpa**, sem serrilhado grosseiro
nem halo"*. **`FAIL` (`07:607`):** *"borda do balde borrada/serrilhada em tela grande"*.

> ⚠️ **`E1` grava conclusão em área protegida** (progresso/conquistas) e **não tem desfazimento
> cirúrgico**: `coloring60ResetService.js:139` reseta o catálogo inteiro. Ver `ARB-E1-CONCLUSAO`.

> ⚠️ **A obra criada aqui torna o acervo permanentemente não conforme** à condição `#15` de
> `14` §11 — *"Aparecer obra no acervo que não veio da `PREP-LEGADO-03`"*. Não afeta este `SF1`
> (o Bloco 1 já terá encerrado), mas **fecha a porta a reobservações futuras da `R2`**. Ver
> `ARB-OBRA-NOVA`.

> ⚠️ **Quatro lacunas abertas em `TA-5R`** (`ARB-TA5R-*`). **Recomendação técnica (não é decisão):**
> usar **captura de tela do aparelho**, não foto de câmera — `TA-5R` julga **qualidade de
> rasterização**, e a óptica de uma câmera acrescenta *moiré* e desfoque indistinguíveis do defeito
> procurado. A câmera externa continua gravando a continuidade; a captura é evidência **adicional**.

> 🛑 **Armadilha de leitura.** `npm run smoke` imprime linhas **verdes** rotuladas `TA-5R · …`
> (`smoke.js:52196`). **Isso não é este item.** Ali `R` = *RASTER* (`:52180`), e o próprio smoke
> desmente em `:52189-52190`: *"nitidez física … segue sendo evidência FÍSICA, PENDENTE"*.

### `GH4` — painel do **Ateliê** · o ensaio seguro **(exige `P3-5`)**

Estruturalmente incapaz de causar dano: `:427` mantém `disabled={!canSave}` e o painel `:460-468`
não oferece botão nenhum, só *"Toque em voltar para escolher outro."*

**A regra de ferro é mecânica:** `exigirLimpo` (`harnessStore.js:377-388`, chamado em
`harnessInject.js:134`) **recusa** qualquer injeção com *backup* pendente. Injetar → observar →
`RST-TUDO` → conferir `INS-02` limpo → próxima.

| Ordem | Op | Observar | `FAIL` |
|---|---|---|---|
| 1 | `INJ-06` — `stateJson` truncado | Painel **e botão de salvar INATIVO**; ramo `ilegivel` → `LOAD_CORRUPTED` | folha em branco silenciosa |
| 2 | `INJ-07` — formato desconhecido | Painel, nada regravado; ramo `LOAD_INCOMPATIBLE`, **distinto** de `INJ-06` | abrir vazio, ou classificar como corrompido |
| 3 | `INJ-08` — *array* no topo | Mesmo painel — corrompida por **tipo**, não por sintaxe | folha em branco |

Em cada uma: **ler o texto em voz alta**, fotografar o painel legível, registrar em vídeo a tentativa
de tocar o botão de salvar, e fotografar o **entorno** para o registro de `ARB-PAINEL-APAGAR`.

### `GH5` — `E5` no **Colorir** **(exige `P3-5`)**

> 🛑 **Proibição vinculante: NÃO TOCAR "Pintar de novo".** Sair do painel pelo **voltar do sistema**.
> Ainda que o *backup* torne o caminho reversível (§4.3), o toque cria salvamento não previsto, e
> `14:648` faz disso um `STOP`.

| Ordem | Op | Observar | `FAIL` |
|---|---|---|---|
| 1 | `INJ-01` — *blob* ativo vira texto não-PNG | Painel + console `LOAD_PAINT_CORRUPTED`. **Arquivo continua no disco** | canvas branco silencioso |
| 2 | `INJ-02` — `uri` → arquivo inexistente | *Lineart* limpo, **sem** painel — ausência honesta. Chave e *blob* real intactos | apagar chave ou *blob* |

### `GH6` — `E4` · **por último de todos** **(exige `P3-5`)**

Esperado, `06:432`: *"**Recusa de aplicar**, com aviso legível. **Não** aplica, **não** regrava,
**não** remove, **não** deforma"*.

| Ordem | Op | Observar | `FAIL` |
|---|---|---|---|
| 1 | `INJ-04` — `imgW`/`imgH` fora de `TOL_ASPECTO_LINEART = 0.02` | Painel e **zero píxel** de tinta. Console: `LOAD_PAINT_ORIGIN:{"motivo":"identidade-lineart"}` **e** `LOAD_PAINT_INCOMPATIBLE` | **o mais grave possível:** tinta esticada sobre o *lineart* |
| 2 | `INJ-05` — `imgH` +0,6 % (**dentro** da tolerância) — controle negativo | **A obra ABRE** com a pintura | painel — tolerância estreita demais |
| 3 | `INJ-03` — `paintSchemaVersion: -1` em *payload* **inline** — controle negativo | **A obra ABRE.** Quem decide é a geometria | recusa de obra íntegra |

> **Limite estrutural de `E4`, a declarar antes de executar.** A **única** alavanca de identidade é a
> **razão de aspecto** — o que o próprio harness registra como `razaoOrigem`
> (`harnessStore.js:167-169`). Não há id nem *hash* de *lineart* na obra, e **as três atividades são
> `1122×1402`** (`coloring60Catalog.js:40,49,58`) — trocar uma pela outra **não dispara nada**. `E4`
> só é alcançável por `INJ-04`. É propriedade do produto, não falha do método.

> **Nota de cobertura (§3).** `08:273-277` declarava os eixos *"inalcançáveis através de um ponteiro
> `v:3`"*. No `HEAD` isso mudou. `INJ-03` inline continua válido; **caducou** a afirmação de que
> **só** o inline os alcança. Ver `ARB-08-EIXOS`.

### `GH7` — `caso 12`, sondagens de fronteira · **opcional e de maior risco**

> ⚠️ Executar **apenas** com autorização nominal. `INJ-09` tem desfecho **em aberto** (`08:251`).

| Ordem | Op | Observar | Desfazimento |
|---|---|---|---|
| 1 | `INJ-11` | Reabrir mostra a pintura anterior; no salvamento **imediatamente seguinte** o GC recolhe o órfão sem tocar no ativo | *backup* registra a ausência ⇒ `RST-TUDO` apaga de volta |
| 2 | `INJ-10` | Alerta *"Quase lá! 🎨 / Não conseguimos guardar sua pintura agora."* Ponteiro anterior **intocado**. Vídeo curto obrigatório | 🛑 `RST-TUDO` obrigatório e conferido (`08:260`); `restaurarArquivo` remove o diretório |
| 3 | `INJ-09` | Registrar **literalmente** o que acontece ao reabrir. **Não executar a metade "salvar por cima"** | reabrir: reversível |

**`INJ-09` não recebe `PASS` nem `FAIL`.** Recebe transcrição literal. Destruição ⇒ `S-STOP-7`.

### `GH8` — fechamento

| # | Gesto |
|---|---|
| 1 | `RST-TUDO` final. Conferir `INS-02` **limpo** e `backupsPendentes().total == 0` |
| 2 | **Conferência dirigida**: nenhum diretório residual e **`.b.png` de volta à inexistência** (§4.1). Se houver ⇒ `S-STOP-4` |
| 3 | **Reconferir a versão de *schema* = 3** — `RST-TUDO` pode tê-la rebaixado (§4.4) |
| 4 | Harness → `INS-03` + `SNP-DIFF` contra `INS-01`, **classificando** o que a campanha gravou de propósito (`GH2b`, `GH3`) e o que apareceu sem autorização |
| 5 | **TAR `TAR-R5-DEPOIS`** + `Get-FileHash` + `tar -tf` |
| 6 | Encerrar o `logcat`. **Preservar o `raw.log` íntegro** (`06:328`) |
| 7 | Encerrar a câmera. Registrar hora e qualquer descontinuidade |
| 8 | Com a saída `A`: devolver o aparelho ao Metro canônico (**8081**) e registrar o `adb reverse` |

---

## 8 · Contaminações — dezoito vetores nomeados

| # | Vetor | Mecanismo | Contenção |
|---|---|---|---|
| `X-01` | 🛑 **§28 `#7` consome a única obra legada** | `TK-A-097` exige salvar; o *write-forward* grava os quatro eixos e a obra **deixa de ser legada para sempre**, matando os insumos dos casos `14 v2`, `15` e a metade "antigo" de `E6`. `07:542` protege a **pré**-condição, nunca a **pós** | `E6` **antes** de `GH2b`; `GH2` partido em duas metades; `ARB-28-7-TIRO-UNICO` |
| `X-02` | 🛑 **Todo salvamento no C60 apaga o *blob* anterior** | `coloring60DrawingStorage.js:657-659` + GC `:668-673`. Sem lixeira | ⛔ **nunca pintar em `light`**; `TA-5R`+`E1` fundidos num *slot* vazio |
| `X-03` | 🛑 **Escrita dentro do painel de recusa** | `ColoringScreen.js:1387-1394` "Pintar de novo" → pincelada → "Pronto" (`smoke.js:39418-39419`: deliberadamente não bloqueado). Reversível **se** houver *backup*; `14:648` faz do salvamento acidental um `STOP` de qualquer forma | ⛔ **proibido tocar "Pintar de novo"**; sair pelo voltar |
| `X-04` | 🛑 **Migração em massa no *boot*** | `App.js:88` → `storageMigrationService.js:140-141` → `drawingStorage.js:218-243`, se *schema* < 3. Contamina `E6`/`CN-13` **antes do primeiro gesto** | `P3-3`, `GH0-8`; reconferir em `GH8-3` porque `RST-TUDO` pode rebaixar |
| `X-05` | **Autossabotagem de `E6`** | Todo escritor reduz monotonicamente o insumo de `E6`, e há **uma** obra antiga. `07:610` afirma o oposto, mas `G5` é iPad e inclui `E3`, congelado no Android | `E6` **primeiro de todos** (§5.1) |
| `X-06` | **Bancada `Coloring60Lab`** | `clearColoring60Lab()` apaga arquivo físico das três atividades; `setColoring60LabProgress` apaga a conclusão de `light` | ⛔ **proibida durante todo o `SF1`** (§4.6) |
| `X-07` | **Colisão de nomes `E*` na mesma sessão** | O reset do artefato `32` nomeia passos `E0..E8`; os extras são `E1..E6`. *"Executar `E4`"* significaria duas coisas incompatíveis | `P3-10` — renomeação escrita **antes** da sessão |
| `X-08` | **Promoção de formato** | Todo salvamento no `HEAD` grava os quatro eixos (§3) | `CK-JS`; inventário "antes" antes de qualquer salvamento; `ARB-JS-BINARIO` |
| `X-09` | **Reeleição silenciosa de alvo** | O harness elege por `modificationTime`/`updatedAt` | Não tocar em outra obra entre pintar e injetar; conferir a chave impressa (`S-STOP-1`) |
| `X-10` | **Contabilidade de *rowid*** | As injeções também consomem *rowid* (`INSERT OR REPLACE`), e a forense de `13` §3.3 é *"a prova mais forte deste acervo"* | O harness imprime as próprias escritas; `SNP-DIFF` as separa; **saída B é proibida por isto** |
| `X-11` | **Resíduo de `INJ-10`** | Diretório no nome do *slot* **bloqueia salvamentos futuros** e sobrevive à limpeza do produto (`deleteBlob` recusa diretório) | `restaurarArquivo` o remove; conferência dirigida em `GH8-2` |
| `X-12` | **`.b.png` deixado para trás** | Hoje o *slot* `.b.png` **não existe** (`13:167`). `INJ-10`/`INJ-11` o criam; um salvamento normal também | Conferência explícita em `GH8-2` contra o inventário de §4.1 |
| `X-13` | **GC precoce** | `INJ-11` depende de o GC agir no **próximo** salvamento | O salvamento seguinte a `INJ-11` tem de ser o pretendido, sem nada no meio |
| `X-14` | **`E4` confundido com `E5`** | Mesmo texto na tela no Colorir | Par obrigatório foto + linha de console (§4.2) |
| `X-15` | **Tela errada fotografada** | `ArtPreview`/`Collection` exibem erro no plural | Só `ColoringScreen:1381-1396` e `AtelierCanvasScreen:460-468` são evidência válida |
| `X-16` | **Ruído de UI na observação pura** | *"Apagar"* (`:601`) e *"Limpar desenho"* (`:772-774`) seguem visíveis com o painel de pé. **Dois operadores chegariam a vereditos opostos sobre o MESMO ecrã** conforme a barra esteja ou não no quadro | Regra escrita de enquadramento — `ARB-PAINEL-APAGAR` |
| `X-17` | **Defeito antigo lido como novo** | (a) *write-forward* de `atelierStorage.saveArt`, diferido para `F12A` (`05:2982`); (b) *sheet* "Nomeie seu desenho" de `13` §8, **`NÃO DETERMINADO` no `HEAD`** | Ambos declarados em §2 **antes** de executar; `GH3` evita o Criar Livre |
| `X-18` | **Obra nova quebra o `STOP` `#15` da `R2`** | `14` §11 `#15`: *"Aparecer obra no acervo que não veio da `PREP-LEGADO-03`"*. `GH3` cria exatamente isso — **irreversivelmente**, para toda reobservação futura da `R2` | `ARB-OBRA-NOVA`; e `GH3` depois do Bloco 1, nunca antes |

---

## 9 · `PASS` · `FAIL` · `STOP`

### 9.1 Matriz de desfecho

| Item | Token | `PASS` | `FAIL` | Terceiro estado |
|---|---|---|---|---|
| `E6` | `TK-A-105` | todas as obras aparecem; **nenhuma migração em massa** | obra some; registros reescritos pela abertura | — |
| §28 `#7` (`GH2a`) | `TK-A-097` | sem salto de escala nem desalinhamento ao retomar | salto ou desalinhamento | — |
| §28 `#7` (`GH2b`) | `TK-A-097` | salva e reabre alinhada | falha ao salvar *(confrontar `05:2982`)* | `NÃO EXECUTADO` se `ARB-28-7-TIRO-UNICO` negar |
| `E1` | `TK-A-100` | reabre idêntica na mesma janela | qualquer diferença | `NÃO EXECUTADO` se `ARB-OBRA-NOVA` negar |
| `TA-5R` | — (`07:338`) | borda limpa, sem serrilhado grosseiro, sem halo | borda borrada/serrilhada | `NÃO CONCLUSIVO` se `ARB-TA5R-*` não for respondido |
| `E5` | `TK-A-104` | painel legível **e** obra não apagada, nos cinco ramos | canvas/folha em branco silenciosa; chave ou *blob* removido | `☐ bloqueado (L-2)` |
| `E4` | `TK-A-103` | `INJ-04` recusa **e** `INJ-05`/`INJ-03` abrem | tinta aplicada sobre *lineart* divergente; recusa nos controles negativos | `☐ bloqueado (L-2)` |
| painéis | `TK-A-045`, `TK-A-051` | os **dois** lidos em tela, legíveis, sem termo técnico | ilegível, técnico, ou "apagar" oferecido **no painel** | `☐ bloqueado (L-2)` |
| §28 `#1,2,3,8,9,10,11` | `TK-A-081` et al. | conforme `04:1049-1065` | idem | `NÃO EXECUTADO` — escopo ou rotação |
| `INJ-09` | — | **não se aplica** | **não se aplica** | **`ACHADO EM ABERTO`** (`08:251`) |
| `INJ-12` | — | **não se aplica** | **não se aplica** | ⛔ **`SEM INSUMO`** — §6.7 |

**Regra de severidade, vinculante (`06:420-425`, reiterada em `38:447-448`):** `E1`–`E6` são *"não
bloqueantes automáticos"*, **mas todo `FAIL` é classificado por severidade ANTES da concessão**. Um
`FAIL` que revele **`P0`/`P1`** ou violação de **invariante ZERO** sobe ao Human Gate. Verbatim:
*"'Não bloqueia automaticamente' nunca significa 'não conta'."*

**Por construção:** `E4`↔ZERO #2, `E5`↔ZERO #4, `E6`↔ZERO #3. **Qualquer `FAIL` nesses três escala
automaticamente.** Não existe `FAIL` "leve" em `E4`, `E5` ou `E6`.

### 9.2 Critérios de `STOP` próprios do Bloco 3

| ID | Gatilho | Ação |
|---|---|---|
| `S-STOP-1` | Harness imprime chave de alvo **diferente** da obra recém-tocada | **não injetar.** Repintar e reeleger |
| `S-STOP-2` | `INS-02` **não limpo** após `RST-TUDO`, ou `exigirLimpo` recusando | parar a cadeia — nada depois é atribuível |
| `S-STOP-3` | Injeção **remove** chave ou *blob* que declarou não tocar | **STOP da sessão** — violação de invariante ZERO |
| `S-STOP-4` | `INJ-10` não se desfaz, ou `.b.png` sobrevive ao fechamento | **STOP antes de qualquer novo salvamento** |
| `S-STOP-5` | Não aparece linha `LOAD_PAINT_*` onde é exigida | repetir **uma** vez; se repetir, `NÃO CONCLUSIVO` — nunca `PASS`/`FAIL` |
| `S-STOP-6` | `git rev-parse HEAD` do *worktree* do Metro diverge de `CK-JS` | **STOP** — não se sabe o que está sob teste |
| `S-STOP-7` | `INJ-09` produz destruição | **HARD STOP** + escalada (ZERO #1 / #3) |
| `S-STOP-8` | `FAIL` em `E1` | **STOP** dos itens **posteriores** (`GH4`–`GH7`). `E6` e `GH2a`, já colhidos, permanecem válidos — foram leitura pura e medida do produto puro |
| `S-STOP-9` | Tarja `F6 PHYSICAL HARNESS` ausente com a saída `A` autorizada | **STOP** — código servido desconhecido |
| `S-STOP-10` | Câmera para antes de um *checkpoint* | registrar a descontinuidade; **não** reconstruir de memória |
| `S-STOP-11` | 🛑 Versão de *schema* no aparelho **< 3** | **STOP — não abrir o app.** O *boot* migraria em massa (§4.4) |
| `S-STOP-12` | 🛑 Dano ao acervo **fora** da parte com rede (§6.7) | **HARD STOP.** Não improvisar restauração de `TAR`: `32:116-117` mantém a proibição e `14:652` faz da própria necessidade de restaurar uma condição de `STOP` |
| `S-STOP-13` | Porta 8081/8082/8083 ocupada antes de subir o Metro | **STOP** — `14` §11 `#4` |

### 9.3 As 17 condições herdadas de `14` §11

A lista de `14:639-655` é **fechada** e o `R5` a herda. As que mais pesam neste bloco:

| # | Condição (verbatim) | Onde morde no Bloco 3 |
|---|---|---|
| `4` | *"Porta 8081/8082/8083 ocupada antes de subir o Metro"* | a saída `A` usa **8083** — `P3-11` |
| `5` | *"`PS3` interrompido, fechado ou limpo em qualquer momento"* | `raw.log` contínuo do `GH0` ao `GH8` |
| `6` | *"Falha de `run-as` ou `TAR` truncado"* | **derruba a saída `B`** |
| `10` | *"Traço, salvamento ou encerramento **acidental**"* | é o que a proibição de "Pintar de novo" previne |
| `13` | *"Necessidade de instalar, desinstalar ou substituir binário"* | nenhum APK novo em `SF1` |
| `14` | *"Necessidade de restaurar `TAR` para 'consertar' o estado de entrada"* | **base de `ARB-TAR-REDE`** — §6.7 |
| `15` | *"Aparecer obra no acervo que não veio da `PREP-LEGADO-03`"* | **`GH3` cria exatamente isso** — `ARB-OBRA-NOVA`, `X-18` |
| `17` | *"Qualquer tentação de fabricar, converter ou sintetizar insumo `v1`"* | **fecha `INJ-12`** junto com `10:376` |

**Permanecem íntegros:** o `HARD STOP` do árbitro de estado e a **proibição de criar `AC_5`**,
estendidos por `D-FUND-SG-A-ARBITER-EXT-BLOCO-A-01` *"somente"* à reobservação do `BLOCO A` — **o
Bloco 3 não está sob essa extensão**.

---

## 10 · Evidências

Diretório: **`C:\tmp\ptf_evidencias\SF1_R5_01\`** (proposto em `37:542`; pendente — `ARB-EVID-DIR`).

```
SF1_R5_01\
  logcat\raw.log                       íntegro, contínuo do GH0-4 ao GH8-6
  logcat\filtrado.log                  ADICIONAL, nunca substituto (06:328)
  acervo\TAR-R5-ANTES.tar   + .sha256
  acervo\TAR-R5-DEPOIS.tar  + .sha256
  harness\INS-01.txt  INS-03.txt  SNP-DIFF.txt
  harness\INJ-<nn>.txt                 console por injeção, com a chave eleita
  foto\E6-GALERIA.jpg  E6-ATELIE-LEGADA.jpg  E6-C60-LIGHT.jpg
  foto\S28-7-ANTES.jpg  S28-7-TRACO.jpg  S28-7-DEPOIS.jpg
  foto\E1-ANTES.jpg  E1-DEPOIS.jpg
  foto\PAINEL-ATELIE.jpg  PAINEL-COLORIR.jpg  PAINEL-*-ENTORNO.jpg
  captura\TA5R-1.png  TA5R-2.png        captura de tela do aparelho (GH3)
  captura\SCHEMA-VERSION.png            prova de que a versão é 3
  video\bloco3-continuo.mp4             câmera externa, tablet inteiro + barra de sistema
  video\INJ-10.mp4                      curto, obrigatório (08:252)
  video\PAINEL-ATELIE-SALVAR.mp4        tentativa de toque no botão inativo
  CK_JS.txt
```

**Admissibilidade — cinco regras duras:**

1. **Painel sem linha de console pareada não é evidência de `E4` nem de `E5`** (§4.2).
2. **`raw.log` íntegro**; qualquer filtro é arquivo **adicional** (`06:328`).
3. **Vídeo, não só captura**, onde a §28 exige continuidade (`04:1045`).
4. **A prova de `E6` tem de ser anterior a qualquer salvamento da sessão** — datada pelo `raw.log`.
5. **Relatórios em UTF-8 explícito** e **`SHA256` de gate sempre com 64 dígitos** — regras
   metodológicas herdadas de `13`, lavradas em `14` §5.2 e §5.6.

> **Divergência de convenção, registrada:** `38:202-206` grava o TAR do Bloco 1 em
> `…\SF1_BLOCO1\`, enquanto `37:540` propõe `…\SF1_R2_BLOCO_A_01\`. Entra em `ARB-EVID-DIR`.

---

## 11 · Protocolo único de `SF1` — Blocos 0, 1, 2 e 3

### 11.1 Identidade

| | |
|---|---|
| Aparelho | **SM-X510** (tablet Android, `sw823dp`) |
| App | **Development Build** já instalado — **nenhum APK novo, nenhum `pm clear`, nenhum `uninstall`** |
| Camada nativa | commit **`521d59c`** |
| JS sob teste | **do *worktree* que serve o Metro** — declarado em `CK-JS` |
| Metro canônico | *worktree* `A` = `C:\tmp\ptf_fase6_shell_splash_wt`, porta **8081** |
| Metro do harness | *worktree* dedicado, porta **8083**, tarja visível — só sob `ARB-INJ-CAMINHO = A` |
| Acervo | **real, lacrado e não renovável** — 14 arquivos, 23 chaves, 1 obra legada, 1 ponteiro C60, sem `.b.png`, 2 *slots* vazios |

### 11.2 Sequência

```
Bloco 0  Pré-voo         ── 4 confirmações de §3.3 do 37 + CK-JS + schema = 3 + portas livres
   │                        TAR-SF1-BASE
   ▼
Bloco 1  R2 Bloco A — casos 1, 10, 14 v2, 15, 16          ── artefato 38
   │                        ROTAÇÃO TRAVADA (CASO 1 exige RETRATO)
   │                        As 17 condições de STOP de 14 §11 valem INTEGRALMENTE aqui
   │                        TAR de checkpoint
   ▼
Bloco 2  R3 metade resize — caso 4, caso 5 parcial, E2     ── artefato 37 §9
   │                        ENTRADA: observar rotação → ramo R-A ou R-B
   │                        TAR de checkpoint
   ▼
Bloco 3  R5  ── este artefato §7, NESTA ordem:
         E6 → §28 #7 (2 metades) → TA-5R+E1 → painel Ateliê → E5 → E4 → [caso 12]
   │                        TAR-R5-DEPOIS
   ▼
FIM      Acervo MISTO — pré-condição de SF2  (só se GH2b for autorizado, §5.2)
```

**Uma sessão basta**, com TAR de *checkpoint* entre blocos (`37:304`).

> ⚠️ **Nota de ordem interna.** `37:288-304` fixou a ordem `Bloco 1 → 2 → 3` porque *"`E4`/`E5`/`E6`
> mutam exatamente o acervo que os casos do Bloco `A` leem"*. Isso continua válido **entre blocos** —
> e ganha um motivo novo: `GH3` viola o `STOP` `#15` da `R2`, logo **tem** de vir depois do Bloco 1.
> O que este artefato acrescenta é a ordem **dentro** do Bloco 3 (correção `C-09`).

### 11.3 Travas transversais — Bloco 0 ao Bloco 3

1. **Um único `logcat -c`** por bloco, no início.
2. **Nenhuma instalação, desinstalação, limpeza de dados ou `pm clear`** (`14` §11 `#13`).
3. **Não remover o *worktree* de *rollback*** sem ordem explícita (`06:472`).
4. **`RST-TUDO` + `INS-02` limpo** entre injeções — imposto por `exigirLimpo`, não só por disciplina.
5. **Câmera externa** com tablet inteiro e barra de sistema; **SmartCapture não substitui**
   (`37:444-446`).
6. **Descontinuidade se registra**, nunca se reconstrói.
7. **Nenhum `PASS` se declara no aparelho.**
8. ⛔ **Nunca pintar em `light`** · ⛔ **nunca tocar "Pintar de novo"** · ⛔ **nunca abrir
   `Coloring60Lab`** · ⛔ **nunca fabricar insumo `v1`** (`14` §11 `#17`).
9. **Versão de *schema* conferida** na abertura e no fechamento de cada bloco.

### 11.4 Ramificação de rotação

**Premissa herdada:** `06:310-311` congela como *"`NÃO EXECUTÁVEL EM ANDROID` — política de
orientação congelada para `SG-C`"* os cenários dependentes de rotação; `06:312` proíbe *"alterar
`F6-R1.1` durante `SG-A`"*.

**Fato apurado por leitura:** `withAndroidTabletOrientation.js` escreve `values-sw600dp` com
orientação **`-1` (UNSPECIFIED)**; o SM-X510 é **`sw823dp`**, acima do limiar. O commit do *plugin*
(`e2702d2`) é **ancestral de `521d59c`** — o binário instalado — **mas não de `92781ea`**, sobre o
qual a premissa do congelamento foi escrita. **A premissa pode estar factualmente vencida.**

**Isto não autoriza alterar política nenhuma.** Observar que o aparelho gira **não é** alterar
`F6-R1.1`. O protocolo **observa e ramifica**:

| | `R-A` · **não** gira | `R-B` · **gira** |
|---|---|---|
| **Como se decide** | Uma rotação de teste na entrada do Bloco 2, **fora de obra aberta**, gravada | idem |
| **Bloco 2** | `caso 4` e `E2` sem rotação; parcela dependente de giro = `NÃO EXECUTÁVEL EM ANDROID` | `caso 4`, `caso 5` parcial e `E2` **com** rotação real |
| **Bloco 3 · §28** | `#1,2,3,8,9,10,11` = `NÃO EXECUTADO` | executáveis **se** `ARB-28-ESCOPO` autorizar |
| **Efeito documental** | nenhum | os itens de `06:310-311` foram congelados sobre premissa vencida ⇒ **`ARB-ROT-STATUS`** |

**Trava dura:** rotação **travada durante todo o Bloco 1** (`CASO 1` exige **RETRATO**). A observação
acontece **na entrada do Bloco 2**, nunca antes.

### 11.5 Estado por bloco

```
SF1 · Bloco 0 ....................... PROTOCOLO FECHADO  (+ CK-JS, schema = 3, portas livres)
SF1 · Bloco 1 ....................... EXECUTÁVEL SOB AUTORIZAÇÃO  (artefato 38 · ERRATA-04)
SF1 · Bloco 2 ....................... PROTOCOLO FECHADO  (artefato 37 §9) + ramo de rotação
SF1 · Bloco 3 ....................... PROTOCOLO FECHADO  (este artefato §7)
                                      ramo COM injeção  → ARB-INJ-CAMINHO
                                      passos sem rede   → ARB-TAR-REDE
                                      salvamento de #7  → ARB-28-7-TIRO-UNICO
                                      obra nova         → ARB-OBRA-NOVA
                                      escopo §28        → ARB-28-ESCOPO
                                      JS sob teste      → ARB-JS-BINARIO
SF1 ................................. NÃO INICIÁVEL — 5 arbitragens bloqueadoras
TABLET .............................. HANDS OFF
```

---

## 12 · Arbitragens abertas

> Nenhum item abaixo foi decidido por agente. Cada um traz a fonte do conflito e a razão pela qual
> preenchê-lo por plausibilidade seria fabricação.

### 12.1 Bloqueadores duros do Bloco 3

| ID | Questão | Conflito literal |
|---|---|---|
| **`ARB-TAR-REDE`** | Os passos **sem rede** — `GH2b`, `GH3` e a metade "salvar por cima" de `INJ-09` — são executados sabendo que **não há restauração autorizada** se derem errado? | `32:116-117` mantém a proibição *"integralmente, fora da janela do `R2P1 ENTRY RESET`"*; `32:114` cita `14` §8.1 (*"Restaurar é operação destrutiva e desnecessária"*); e `14:652` faz da **própria necessidade de restaurar** a condição de `STOP` `#14`. **A parte injetada tem rede provada em código (§6.3); estes três passos não** |
| **`ARB-INJ-CAMINHO`** | Saída **A** (reenxertar no `HEAD`), **B** (`adb run-as`) ou **C** (`BLOQUEADO (L-2)`)? | `07:366` (*"só alcançáveis por essa via"*) × harness **nunca commitado**, **85 commits** atrás × `08:284-286` (*"parar essa parte e reportar"*) × `14:644` (falha de `run-as` = `STOP`, o que derruba **B**) |
| **`ARB-28-7-TIRO-UNICO`** | O salvamento de `GH2b` — que **extingue para sempre** a única obra legada e com ela os insumos dos casos `14 v2`, `15` e metade de `E6` — está autorizado? | `TK-A-097` (`05:1012-1013`) exige salvar × `14:64` (*"A ausência dos quatro eixos **é o insumo**"*) × `13:618-624` (a obra é insumo de **três** casos) × `07:542` protege só a **pré**-condição. **Nenhum documento avisa que `#7` é de tiro único** |
| **`ARB-OBRA-NOVA`** | `GH3` cria obra que **não veio da `PREP-LEGADO-03`**, tornando o acervo permanentemente não conforme ao `STOP` `#15` da `R2`. Aceitável? E a conclusão que `E1` grava em **área protegida**, sem desfazimento cirúrgico? | `14:653` (`STOP` `#15`) × `TK-A-100`/`TA-5R` exigem obra nova × `coloring60ResetService.js:139` reseta o catálogo inteiro × área protegida por `CLAUDE.md`/`AGENTS.md` |
| **`ARB-JS-BINARIO`** | `SF1` roda com o JS do `HEAD` (que promove formato e refuta `DECISIONS:2789-2791`) ou com o de `521d59c`? A *"Consequência congelada"* recebe errata? | `DECISIONS:2789-2791` × `coloring60DrawingStorage.js:392-402,442,489` (`2ffcd82`) |
| **`ARB-28-ESCOPO`** | Quantos cenários §28 entram em `R5` — **um** (`#7`) ou **onze** (`#1`–`#11`)? | `37:297`, `38:25,432-440` (só `#7`) × `06:285` (plural) × `05:2997` (*"#1–#11 + #7 + parcela `SG-A` do #17"*). **Nenhuma emenda reconcilia** |

> São **seis linhas** para **cinco bloqueadores**: `ARB-JS-BINARIO` e `ARB-28-ESCOPO` bloqueiam o
> **valor probatório** e o **escopo**; `ARB-TAR-REDE`, `ARB-INJ-CAMINHO`, `ARB-28-7-TIRO-UNICO` e
> `ARB-OBRA-NOVA` bloqueiam **gestos concretos**. Os dois últimos podem ser respondidos juntos: são
> a mesma pergunta — *"quanto do acervo insubstituível estou disposto a gastar nesta sessão?"*

### 12.2 Decisões de execução

| ID | Questão | Conflito literal |
|---|---|---|
| `ARB-PAINEL-APAGAR` | `06:442` exige *"sem oferecer 'apagar' como saída"*. O **painel** não oferece; a barra contém *"Apagar"* (`:601`) e *"Limpar desenho"* (`:772-774`). O critério alcança o entorno? **Sem regra de enquadramento, dois operadores chegam a vereditos opostos sobre o mesmo ecrã** | `06:442` × `AtelierCanvasScreen.js:601,772-774` |
| `ARB-28-7-TEXTO` | Qual redação de aceite de §28 `#7` governa? | `04:1055` × `06:440` (adotada por `37`/`38`) × `05:1015` (a mais forte: acrescenta SAVE + as quatro invariantes ZERO) |
| `ARB-28-TABELA` | Qual tabela cenário→task prevalece? | `07:288-294` × `05:2831-2837` divergem em `#3`, `#4`, `#6`, `#9` |
| `ARB-07-PRECEDENCIA` | Quem manda no agrupamento? | `07:31` (*"vale este `07`"*) × `10:37` (*"anterior à emenda das rodadas"*). **Circular** |
| `ARB-28-IPAD` | O §28 executado no SM-X510 conta para quê? | `04:1161-1162`: o §27 permanece *"literal"* em **iPad**; *"Tablet Android não é equivalente genérico de iPad"* (confirmado `37:720`) |
| `ARB-NAOEXEC` | `NÃO EXECUTÁVEL` dispensa item obrigatório? | `06:396` × `06:310-311`/`06:464`. Classe **F** não resolvida em `37:240` |
| `ARB-ROT-STATUS` | Se o SM-X510 girar (ramo `R-B`), reclassificar o congelamento de `06:310-311`, feito sobre premissa vencida? | §11.4 |
| `ARB-SHEET-NOME` | O *sheet* "Nomeie seu desenho" de `13` §8 reproduz no `HEAD`? `13:514-515` diz `NÃO DETERMINADO`; `14:669` diz que **não** é trabalho autorizado. Se aparecer em `SF1`, é achado novo ou o mesmo? | `13:445-515` × `14:669` |

### 12.3 `TA-5R`

| ID | Questão | Conflito literal |
|---|---|---|
| `ARB-TA5R-EQUIP` | Em que aparelho? | `06:285` (SM-X510) × `07:600` (iPad) × `36:284` (não há caminho de hardware iPad) |
| `ARB-TA5R-ENQ` | Enquadramento? | `37:443-445` (câmera externa, **tablet inteiro** + barra) × `07:608` (*"captura **ampliada** da borda"*). **Fisicamente incompatíveis** |
| `ARB-TA5R-ESPEC` | Distância, zoom, foco, limiar objetivo? | Não existe. Aceite (`06:443`) diz *"sem serrilhado **grosseiro**"*; o `FAIL` (`07:607`) diz *"borrada/serrilhada"*, **sem** o qualificador. Critérios assimétricos |
| `ARB-TA5R-CAPTURA` | Captura de tela é admissível para item estático? | Recomendação em `GH3`; sem exceção escrita à regra da câmera externa |
| `ARB-TA5R-SEV` | Severidade de um `FAIL`? | Não existe regra; classe **B** (`36:199,283`) × **D** (`37:246`) |
| `ARB-TA5R-HOMONIMIA` | `TA-5R` físico (`06:443`) × `TA-5R` *raster* verde no smoke (`smoke.js:52196`) | **Nunca reconciliado.** Risco: ler o verde como quitação do item físico. O smoke desmente em `:52189-52190` |

### 12.4 Higiene documental *(não bloqueiam)*

| ID | Questão |
|---|---|
| `ARB-08-EIXOS` | `08:273-277` caducou no `HEAD` por `2ffcd82`. Errata aditiva ao `08` |
| `ARB-08-INJ12` | `INJ-12` está no catálogo do `08` mas **não tem insumo**: `11:174` (writer sem chamadores) + `13:167` (**o diretório não existe no aparelho**) + `14:655` (`STOP` `#17`). Errata aditiva |
| `ARB-CENSO-CHAVES` | `storageKeys.js:4` declara-se *"fonte única de verdade"* mas não contém o *namespace* do C60 |
| `ARB-TA11-EIXOS` | `TA-11`: **três** eixos (`04:938`, `05:201`) × **quatro** (`05:2786`) |
| `ARB-EVID-DIR` | `37:533-535` avisa que **não existe convenção canônica** para `R3`/`R4`/`R5`/`R7`; `38:202` diverge de `37:540` |
| `ARB-HARNESS-README` | `README_HARNESS.md` é um **sétimo** arquivo do harness, fora dos seis lacrados por `SHA256` em `08` §4.7 |

---

## 13 · Estado final

```
F6-SG-A ............................. NÃO CONCEDIDO
F6-SG-B ............................. NÃO CONCEDIDO
R2_PROSPECTIVE_BE ................... PASS (inalterado)
CASO10_AND_BLOCO_A_FINAL_GATE_PASS .. íntegro para o binário 92781ea
CASO 14 · v1 ........................ INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL
S0.1 ................................ REOBSERVAR
ARB-ARBITRO ......................... RESPONDIDO — SAÍDA A
SF1 · Bloco 0 ....................... PROTOCOLO FECHADO
SF1 · Bloco 1 ....................... EXECUTÁVEL SOB AUTORIZAÇÃO
SF1 · Bloco 2 ....................... PROTOCOLO FECHADO + ramo de rotação
SF1 · Bloco 3 ....................... PROTOCOLO FECHADO (este artefato)
REVERSIBILIDADE ..................... PROVADA EM CÓDIGO para a parte injetada (§6.3)
                                      INEXISTENTE para GH2b, GH3 e "salvar por cima" (§6.7)
SF1 ................................. NÃO INICIÁVEL
ARBITRAGENS BLOQUEADORAS ............ 5 grupos / 6 linhas — §12.1
ARBITRAGENS ABERTAS (total) ......... 26
TABLET .............................. HANDS OFF
CÓDIGO .............................. NÃO ALTERADO
```

**Próxima ação única do fundador:** responder às arbitragens bloqueadoras de §12.1.

**A pergunta que reúne quatro delas é uma só:** *quanto do acervo insubstituível — uma obra legada,
um ponteiro C60, dois *slots* vazios, todos irreproduzíveis — vale a pena gastar para fechar `R5`?*
A parte injetada não custa nada: tem rede provada em código. **O que custa são os três salvamentos
legítimos.** Se a resposta for "nenhum", `R5` fecha parcialmente e `SF2` fica sem pré-condição — e
isso é um desfecho legítimo, registrável, honesto.

O aparelho permanece **`HANDS OFF`**.
