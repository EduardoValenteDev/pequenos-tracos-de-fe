# `42` — `SF1` · Protocolo executável final (Cenário A) · consolidação, erratas e o que a campanha **não** pode fechar

> **Natureza deste artefato.** Documentação pura. Nenhum byte de `App.js`, `index.js`, `src/**`,
> `babel.config.js`, `metro.config.js`, configuração Expo ou `package.json` foi tocado — **nem em
> comentário**. Logo `npm run verify:runtime` **não é disparado** (`AGENTS.md:100-102`; precedente
> reiterado em `15:132-134`, `20:379`, `22:211`, `37:841-843`, `40:455`, `41:632`, `41:718`).
>
> **O que NÃO aconteceu ao produzir este artefato:** o tablet **não** foi acordado, o app **não** foi
> aberto, nenhum `force-stop` foi emitido, `adb reverse` **não** foi alterado, nenhum Metro subiu,
> nenhum *worktree* foi criado, nenhum *build* foi gerado, nenhuma restauração de `TAR` ocorreu,
> nenhum `PASS`/`FAIL` foi declarado. A única atividade sobre o aparelho nesta campanha foi a
> **leitura** do lacre de entrada (§2), já concluída antes deste artefato.

- **`HEAD` na lavratura:** `6337c2f0a51aa490fa0ee518a639cd78f58a8f97`
- **Branch:** `feat/fase6-shell-splash` · **árvore:** limpa (`git status --porcelain` vazio)
- **Antecessores diretos:** `41` (perícia do acervo), `40` (`ERRATA-07`, `ERRATA-08`), `39` (protocolo
  fechado do Bloco 3), `docs/DECISIONS.md` `D-FUND-SG-A-ORDEM-CONSUNTIVA-01`

---

## 1 · Por que este artefato existe

O artefato `41` fechou a perícia do acervo e o fundador ratificou `GATE-ORDEM-CONSUNTIVA`. Restava
consolidar num único documento executável: (a) as arbitragens que o mandato de encerramento e as
medições **já respondem**; (b) as que continuam genuinamente humanas; (c) as erratas que a
consolidação apurou — **inclusive contra o artefato `41` e contra uma nota minha em
`docs/DECISIONS.md`**; (d) a ordem de execução definitiva; e (e) uma verdade sobre o alcance da
campanha que precisa ser dita antes de qualquer execução física.

Este artefato **não inicia execução**. Ele fecha o protocolo.

---

## 2 · Estado de entrada — **medido hoje**, não herdado

### 2.1 · Lacre de entrada

| Item | Valor |
|---|---|
| `LACRE-F6-ENTRY-ULTRACODE.tar` | 17 424 384 B · SHA256 `84AE08848C8BB00D451253ADFC6986F45C53178069B115117FE126BC3EF58FB2` |
| `L00_RKStorage.bin` | 49 152 B · SHA256 `79D45E96C99B4738E383A0B68D59BA2182FD909C0D43A2306969072482430857` |
| Método | `adb -s RX2XC003LTJ exec-out run-as <pkg> tar -c databases files shared_prefs`, somente leitura, tela apagada |

**Cadeia de custódia ininterrupta.** O SHA256 do `RKStorage` é **idêntico** nas três aferições —
perícia `PRE`, perícia `POS` e lacre de entrada desta campanha. ⇒ **zero mutação** entre o artefato
`41` e agora. Nenhum ato desta campanha escreveu no acervo.

### 2.2 · Perícia forense do `RKStorage` lacrado (nova — fecha `E7-12` e refuta a dúvida de `E8-5`)

Executada **no host**, sobre **cópia de trabalho** do lacre (o arquivo de evidência foi conferido por
SHA256 antes e depois: **intacto**). SQLite `catalystLocalStorage` · **27 chaves**.

**Bit (a) — o ponteiro C60 traz os eixos?** `@ptf_drawing60_screation_alight` (`rowid 77`):

```json
{"v":3,"fmt":2,"uri":"…/drawings60/_ptf_drawing60_screation_alight.a.png","mime":"image/png",
 "W":1122,"H":1402,"imgX":0,"imgY":0,"imgW":1122,"imgH":1402,"rev":2,
 "paintedPx":1348737,"paintablePx":1442745,
 "paintSchemaVersion":1,"layoutVersion":1,"logicalW":1122,"logicalH":1402}
```

⇒ **SIM. Formato NOVO, completo nos quatro eixos.**

**Bit (b) — a obra do Ateliê ainda é legada?** `ptf_atelier_arts_v1_art_1786479103982_6079`
(`rowid 49`, 19 590 B):

- `paintSchemaVersion` **AUSENTE** · `layoutVersion` **AUSENTE** · `logicalW` **AUSENTE** ·
  `logicalH` **AUSENTE** — no topo **e** dentro de `stateJson`
- `stateJson.v = 2` · `schema = 2` · chaves de `stateJson`: `bgColor`, `stamps`, `strokes`, `v`
- **`updatedAt == createdAt == 2026-08-11T20:11:43.982Z`**

⇒ **SIM, ainda legada — e nunca regravada desde a criação.**

**Consequência: `E8-5` está refutado.** `ERRATA-08` alertou, com razão, que os dois `PASS` de
`CASO 11` (`35:43-44`) descrevem *"obra modificada e salva no formato novo"* sem nomear a obra, e que
*"não está estabelecido que a obra legada ainda seja legada"*. **Agora está estabelecido, por duas
vias independentes:** os quatro eixos ausentes **e** `updatedAt == createdAt`. O `PASS` de `CASO 11`
recai sobre o **C60** — `screation_alight` tem `rev: 2`, isto é, foi salvo mais de uma vez, e carrega
o formato novo. A obra legada do Ateliê **não** foi tocada por ele.

> Isto **confirma** o item 3 do conteúdo normativo de `D-FUND-SG-A-ORDEM-CONSUNTIVA-01`, que já
> registrava `updatedAt == createdAt` a partir de `41` §6.1. A medição de hoje reverifica no lacre de
> entrada: **o alvo nominal da ratificação do fundador continua íntegro**.

### 2.3 · Inventário — as duas famílias

| Família | Chave / índice | Itens | Formato |
|---|---|---|---|
| Ateliê | `ptf_atelier_arts_v1_index` | **1** (`art_1786479103982_6079`) | **ANTIGO** |
| Colorir 60 | `@ptf_drawing60_screation_alight` | **1** (`light`) | **NOVO** |

`CREATION_DONE_COUNT = 1` de 3 · `@ptf_coloring60_finale_seen_*` **ausente** · vagas `living_world` e
`people_and_care` **vazias** · `@ptf_creator_qa_mode` presente (`rowid 47`, 4 B).

---

## 3 · `CK-JS` / `ARB-JS-BINARIO` — **FECHADA por medição direta**

O mandato exigia provar qual JS o aparelho executa, sem confiar em título de *commit*.

**Prova 1 — o grafo executável parou em `2ffcd82`.** `git diff --stat 2ffcd82..6337c2f` restrito a
`src App.js index.js babel.config.js metro.config.js package.json package-lock.json app.json
app.config.js plugins eas.json` é **vazio**. Os 12 *commits* até o `HEAD` são documentação pura —
**provado por diff, não por título**.

**Prova 2 — o bundle servido, byte a byte.** `files/DevLauncherApp-BridgelessReactNativeDevBundle.js`
foi puxado do aparelho: **16 866 385 B**, SHA256
`465AB40B8A57B709EAF2C4CBD628C59E9F894C0EFE22C65254F93C7950A8D913`. Contém `carryLogicalSchema` (3
ocorrências) e `LOGICAL_SCHEMA_FIELDS` (2) ⇒ **JS ≥ `2ffcd82`**. Contém `shellLifecycleTrace`,
`useWindowBand`, `HubSurface`, `EditorialSurface`, `displayType` ⇒ **não** é o `1ae353f` obsoleto.
Contém **zero** marcadores de harness ⇒ **contexto A canônico**, sem tarja.

**Prova 3 — corroboração independente pelo acervo.** `2ffcd82` é o **único** *commit* entre `1ae353f`
e o `HEAD` a tocar `coloring60DrawingStorage.js`, e introduz `carryLogicalSchema` em **três** lugares
no **mesmo** *commit* (definição + `writeSlot` + `resolvePointer60`). Logo *qualquer JS capaz de ter
**escrito** `logicalW`/`logicalH` no ponteiro contém obrigatoriamente o leitor que os traz de volta*.
Como o ponteiro medido em §2.2 **os tem**, o JS que o escreveu era ≥ `2ffcd82`.

**Prova 4 — cronologia coerente.** *commit* `2ffcd82` às 16:53:20 → última escrita do `RKStorage` às
17:38 → processo PID 18101 iniciado às 19:42 (`ETIME 2-15:25:45`) com o bundle acima.

**Prova 5 — nada nativo mudou depois do *build*.** *Build* nativo `891d702` (2026-08-13;
`lastUpdateTime = 2026-08-13 02:00:59` no aparelho). O *plugin* de orientação
`./plugins/withAndroidTabletOrientation` entrou em `e2702d2` (2026-08-12), **antes** do *build*.
⇒ **nenhum *build* nativo novo é necessário.**

> **`CK-JS` ratificado: a base de `SF1` é o `HEAD` `6337c2f`, cujo grafo executável é idêntico ao de
> `2ffcd82`, servido pelo Metro do contexto A na porta 8081 via `adb reverse`.** Isto preenche a
> lacuna `S-03` (`40:109-113`: *"nenhuma porta `P3-x` exige resposta escrita a `ARB-JS-BINARIO`"*) —
> a declaração escrita é **esta seção**.

---

## 4 · `AMB-E6-GALERIA` — **RESOLVIDA como NÃO BLOQUEANTE**, e reformulada

### 4.1 · A ambiguidade do artefato `41` sobrevive, mas precisa ser formulada por superfície

`41` §7.1 registra duas leituras: preservação (`06:434`) × dois formatos
(`05:1085`/`05:1087`, `07:621`). A tabela de `41:485` as chama corretamente de **fontes**, não de
*fontes donas*. A divergência não está entre *ownerships*: está na superfície em que a expressão
*"uma de cada formato"* deve ser observada.

- A **fonte dona** de `E6` é `05_TASKS_DELTA_F6.md`, `TK-A-105`. O PLAN não define `E6` — a matriz
  §28.1 de `04` tem exatamente 17 linhas e nenhuma `E1`..`E6`; o ato constitutivo é a Emenda `A-03`
  (`05:1153-1159`): *"preservados como casos adicionais com IDs novos (`E1`..`E6`, tasks
  `TK-A-100`..`TK-A-105`). A matriz final tem 23 casos"*.
- `06` e `07` são protocolos operacionais derivados: `06:5-6` diz que o documento descreve o que
  observar; `07:4-5` diz que executa `TK-A-081` e não substitui o PLAN. Isso não torna `06:434` uma
  repetição textual de `05`: *"nenhuma some da listagem"* nasce em `06` como observável próprio.
- No dono, as duas cláusulas estão **na mesma frase**: `05:1085` — *"abrir a galeria com acervo
  misto, verificar miniaturas, **abrir uma de cada formato**, confirmar que nenhuma migração em massa
  ocorreu"*. **É conjunção, não disjunção.** `06:434` acrescenta o observável correlato de que
  nenhuma obra some da listagem.

⇒ **A conjunção de `05` não resolve sozinha em qual tela os dois formatos devem aparecer.** O
artefato `41` já enuncia o problema de superfície em `41:490-491`; esta seção o torna executável.

### 4.2 · Qual superfície é "a galeria" — prova lexical e prova de código

**Lexical.** `07` é o único documento que nomeia superfície, e distingue duas:
`07:419` — *"**Galeria do Ateliê** (`AtelierGalleryScreen`) — a lista inteira"*; `07:416` —
*"**Coleção do Colorir 60** (`Coloring60CollectionScreen`) — as três vagas"*. E prova a distinção
operando com os dois termos coordenados na mesma frase: `07:661` passo 7 do `CASO 13` — *"Abrir a
**galeria** e a **coleção do C60**"*; `07:591` — *"ordem da **galeria** e **vagas do C60**"*;
`07:663` — *"a **coleção do C60** perde vaga"*.

> **No vocabulário do corpus, "a galeria" = Galeria do Ateliê. O C60 é sempre "coleção", nunca
> "galeria".** Isto é fato textual, não inferência.

**Código.** As duas famílias são **arquiteturalmente isoladas na camada de tela**:

- `AtelierGalleryScreen.js:91` → `listArts()`, única fonte da lista (`:231`
  `data={emGrade ? hubRows(arts, columns) : arts}`). `atelierStorage.js:53-59` → `listArts()` é
  `AsyncStorage.getItem(LIST_KEY)` e nada mais; `atelierStorage.js:13` →
  `LIST_KEY = 'ptf_atelier_arts_v1_index'`. **Zero fusão com o C60.**
- `Coloring60CollectionScreen` importa apenas `coloring60CollectionPortrait` / `coloring60State` /
  `coloring60CollectionReader` (`SLOT`) / `coloring60Catalog`. **Não importa `atelierStorage`.**
- `BeniChestScreen` usa `listArts()` para alimentar **cartas de conquista**
  (`beniChestService.buildBeniChestCards`), não uma galeria de obras com miniaturas por formato.
- `BrincarScreen.js:191-193` usa `listArts()` só como **contador** (`:358`).

⇒ **Nenhuma tela do app lista as duas famílias juntas.** Portanto "obras antigas e novas lado a
lado" (`05:1082`) não pode significar "uma tela que mistura Ateliê e C60".

### 4.3 · A ambiguidade **real** é `07` × `39`, e é sobre onde os olhos pousam

| Leitura | Fonte | "Uma de cada formato" é lido… | Satisfazível hoje? |
|---|---|---|---|
| **Estrita** | `07:621` passo 5, dentro de `G6` "Ateliê" | **dentro** da Galeria do Ateliê | **NÃO** — a galeria tem 1 obra, antiga (§2.3) |
| **Atravessada** | `39:593` (`GH1`, protocolo fechado) | **através** do acervo: obra legada do Ateliê **e** obra C60 `light` | **SIM** — os dois formatos coexistem, medidos, com zero escritas (§2.2) |

`39:593`, verbatim: *"Abrir **a obra legada do Ateliê** **e** **a obra C60 de `light`** — **sem
salvar nenhuma das duas** | as duas abrem"*.

### 4.4 · Veredito: **NÃO BLOQUEANTE**. Não emito `STOP_AMB_E6_GALERIA_BLOCKING`.

1. **Não altera causalidade nem segurança.** Sob **ambas** as leituras `E6` é **leitura pura**
   (`39:584`; `AtelierGalleryScreen.js:89-96` só chama `listArts()`;
   `coloring60CollectionPortrait.js:10` — *"nada vai para AsyncStorage nem para arquivo"*, zero
   escritores no arquivo). Logo `E6` **não consome** `art_1786479103982_6079` sob leitura nenhuma, e
   a cláusula 2 da ratificação é satisfeita pela mesma ordem em qualquer hipótese — **exatamente como
   o item 8 das notas de `D-FUND-SG-A-ORDEM-CONSUNTIVA-01` já havia ressalvado**.
2. **Não altera o critério de aceite do subportão.** `E6` é caso **adicional**: `05:1157-1159`
   (*"os 17 originais … são todos obrigatórios"*), `05:1252` (*"o veredito de `F6-SG-A` lê primeiro
   os 17"*). Nenhum dos 17 obrigatórios menciona "galeria" nem depende de `E6`.
3. **Não põe em dúvida nenhuma medição.** §2.2 mede os dois formatos coexistindo hoje, com zero
   escritas.
4. **Existe uma coleta comum, segura e sem escrita para as duas leituras** — `E6-a` em §4.5. Ela
   satisfaz integralmente a leitura atravessada; sob a leitura estrita, preserva evidência útil, mas
   o veredito de `E6` continua pendente e `E6-b` exigiria nova decisão antes de qualquer escrita.

**O escopo estrito do que ela ainda bloqueia:** apenas a redação do veredito `PASS`/`FAIL` **do
próprio `E6`**, um caso adicional. `05:1254` — *"Um `FAIL` num caso adicional é registrado, analisado
e submetido ao fundador — não é automaticamente bloqueante, mas **não pode ser omitido**"*.

### 4.5 · Como se executa sem fabricar evidência

**`E6-a` — incondicional, é `GH1` como já está escrito (`39:589-596`), no primeiro *boot* da sessão,
antes de qualquer salvamento.** Abrir a Galeria do Ateliê sem nada salvo na sessão → conferir
miniaturas → abrir a obra legada do Ateliê **e** a obra C60 `light`, **saindo sempre pelo voltar,
nunca por salvar** → `SNP-DIFF` contra `INS-01` para `CN-13`. Nada é fabricado: os dois formatos já
coexistem, medidos, com zero escritas.

**`E6-b` — condicional, só se o fundador adotar a leitura estrita.** Exigiria uma segunda obra **do
Ateliê** em formato novo, o que reabre três coisas: realocar `E1` para o Ateliê contra `39:641-642`;
enfrentar o *sheet* "Nomeie seu desenho" (`AtelierCanvasScreen.js:333`), cujo comportamento no `HEAD`
é **`NÃO DETERMINADO`** (`13:449-451`, `13:515-517`); e reabrir `ARB-OBRA-NOVA` numa forma nova.
**Recomendação técnica (não é decisão):** o fundador arbitra a superfície em **uma linha** e `E6-b`
deixa de existir. A pergunta vai em §11.

---

## 5 · `ERRATA-09` — correções contra o corpus e contra uma nota minha em `docs/DECISIONS.md`

> Aditiva. Nada acima nos artefatos citados foi apagado ou reescrito.

### `E9-1` — o artefato `41` §7.1 e §7 linha 7 superestimam `E1`

`41:492-493` afirma que *"o caso obrigatório `E1` … **já produz a segunda obra do Ateliê**, no
formato novo, sem consumir a antiga"*, e `41:477` repete *"o insumo é produzido por `E1`"*.

Há dois erros objetivos. Primeiro, `E1` é **adicional, não obrigatório** (`05:1153-1159`,
`05:1248-1254`, `06:418-429`). Segundo, não está estabelecido que ele produza uma obra do Ateliê:
`39:358`/`:641-644` o protocola no Colorir 60, mas `P3-9` (`39:386`) condiciona essa execução a
`ARB-OBRA-NOVA`; `39:660-661` ainda registra `ARB-E1-CONCLUSAO`. Portanto, no `HEAD`, **a superfície
e a executabilidade de `E1` permanecem abertas**. A razão para não presumir Ateliê é real no código:
`AtelierCanvasScreen.js:330-333` — obra nova sem `mission` e sem `savedArtId` cai em
`setOverlay('name')`, comportamento classificado como `NÃO DETERMINADO` em `13:449-451`.

**Consequência condicional:** se `E1` vier a ser executado no **C60** como propõe `39`, e como as
duas famílias têm galerias separadas (§4.2), uma obra nova em `living_world` **não produz galeria
mista em lugar nenhum** — a coleção do C60 ficaria com duas obras novas, e a galeria do Ateliê
continuaria com uma obra antiga.

**A conclusão de `41` sobrevive; a justificativa não.** `ARB-OBRA-NOVA` **cai** — mas **não** porque
`E1` produz o insumo. Cai porque **o acervo já é misto, atravessado**, sem nenhuma escrita nova
(§2.3), e é assim que `GH1` o lê (`39:593`).

### `E9-2` — **RETIRADA após revisão adversarial tardia**

A redação inicial acusava `41` §7.1 de atribuir *ownership* errado. A acusação não se sustenta:
`41:485` usa apenas o cabeçalho **Fonte**, e *"nenhuma some da listagem"* tem origem textual em
`06:434`, não em `05`. Preserva-se aqui a retirada para não apagar silenciosamente a correção.
Permanece apenas o achado mais estreito de §4.1: `05:1085` reúne as cláusulas em conjunção, mas não
resolve a superfície.

### `E9-3` — **correção de uma nota minha**: a ordem derivada em `docs/DECISIONS.md` põe `R4` cedo demais

O item 6 das *"Notas de leitura — registro do agente, **NÃO decisão do fundador**"* de
`D-FUND-SG-A-ORDEM-CONSUNTIVA-01` conclui: *"Ordem operacional que satisfaz as duas cláusulas:
`R4`/`CASO 13` → `E6`/`GH1` (leitura pura) → §28 `#7` ∪ `#9` como último ato consuntivo"*.

**A ordem está correta quanto ao fim e imprecisa quanto ao começo.** As cláusulas do fundador são:

- **cláusula 1** — `R4` concluída **e lacrada** antes de qualquer **salvamento consuntivo** de `#7`/`#9`;
- **cláusula 2** — a obra legada intacta até o **último consumidor obrigatório**.

**Nenhuma das duas exige que `R4` preceda `E6`.** `E6` não é salvamento consuntivo. E o protocolo
fechado determina o oposto, com razão causal medida:

- `39:356` — *"`E6` … Único item cujo insumo é 'o acervo tal como a criança o deixou', e **todo item
  posterior o degrada** … `CN-13` … **só é observável no PRIMEIRO *boot* da sessão**"*;
- `39:87` (`C-09`) — a ordem que punha escritores antes de `E6` foi **derrubada** por
  *"autossabotagem"*;
- `39:762` (`X-05`) — *"**`E6` primeiro de todos**"*;
- `39:873` — *"A prova de `E6` tem de ser anterior a qualquer salvamento da sessão"*.

⇒ **Ordem corrigida: `E6`/`GH1` primeiro de todos → `R4`/`CASO 13` → restante de `R5` → `#7 ∪ #9`
por último.** As duas cláusulas do fundador continuam integralmente satisfeitas: `R4` fica **antes**
do salvamento consuntivo, e a obra legada permanece intacta até ele.

> Registro explícito de método: **a nota corrigida é minha, não do fundador.** O bloco normativo
> (itens 1–5) permanece intocado e integralmente válido.

### `E9-4` — o conflito de ordem `07:621` × `39:350` é item próprio, não é `AMB-E6-GALERIA`

`07:621` põe `E1` no passo 4 e `E6` no passo 5; `39:350` põe `E6` antes de `E1`. É **consequência**
da ambiguidade de superfície, não a ambiguidade em si. Nomeio-o **`AMB-E6-ORDEM-07x39`**. Não há
base para declarar `39` *fonte dona* apenas por ser posterior ou por se dizer fechado: `39:3-9` é
documental/preparatório, e sua §5.2 foi corrigida pela `ERRATA-08` (`40:465-481`).

Para esta campanha, a seleção de `E6` antes de `E1` é uma **síntese operacional conservadora**, não
uma regra de precedência documental: `39:584-596` demonstra que `GH1` é leitura pura e que `CN-13`
só é observável no primeiro *boot*; executar uma escrita antes pode destruir precisamente o estado
que se quer medir. Isso também respeita o ato do fundador, cujo texto normativo exige `R4` lacrada
antes dos salvamentos consuntivos (`DECISIONS:4336-4347`), mas **não ordena `R4` contra `E6`**. As
linhas `DECISIONS:4357-4375` são notas de agente, não decisão do fundador.

⇒ **Protocolo seguro desta campanha: `E6` antes de `E1`, por causalidade explicitada — não por
suposta precedência de `39`.**

---

## 6 · Arbitragens — estado formal após esta consolidação

| Arbitragem | Estado | Fundamento |
|---|---|---|
| `ARB-TAR-REDE` | **FECHADA — restauração PROIBIDA** | §7 do mandato de encerramento: *"restauração permanece proibida; nenhum `TAR` histórico pode recolocar estado no aparelho durante esta campanha"*. Consequência: `GH2b`, `GH3` e a metade "salvar por cima" de `INJ-09` executam **sem rede**, ou não executam |
| `ARB-INJ-CAMINHO` | **FECHADA — Saída A**, sob 5 condições (§7) | §8 do mandato autoriza *worktree* temporário + reaplicação controlada do enxerto; a reauditoria do catálogo contra o `HEAD` **cumpriu** a condição 2 e **não** encontrou divergência material |
| `ARB-JS-BINARIO` | **FECHADA — `CK-JS = 6337c2f`** | §3 deste artefato: cinco provas, duas delas por medição direta no aparelho |
| `ARB-28-ESCOPO` | **FECHADA** — `R5` recebe §28 `#1`–`#11` + parcela `SG-A` do `#17` | Resposta sobredeterminada em `40:144`; esta seção é a declaração escrita que faltava (`S-04`) |
| `ARB-28-7-TIRO-UNICO` | **FECHADA — vira regra de POSIÇÃO** | A ratificação do fundador converte o dilema em ordenação: `#7` e `#9` gravam **por último** |
| `ARB-OBRA-NOVA` | **CAI — desnecessária** | O acervo **já é misto**, atravessado, sem escrita nova (§2.3). ⚠️ **Justificativa corrigida por `E9-1`** — não cai por causa de `E1` |
| `ARB-NAOEXEC` | **ABERTA — humana** | `37:240`: *"Fundador decide se `NÃO EXECUTÁVEL` dispensa obrigatório"*. Atinge `CASO 2`, `CASO 3`, metade do `CASO 5` e `E3` |
| `ARB-28-7-TEXTO` | **ABERTA — humana** | `39:1008`. Decide se `#7` sequer exige salvamento. Se `06:440` governar, a disputa consuntiva tem **um** consumidor, não dois |
| `ARB-28-TABELA` | **ABERTA — menor** | `39:1009`. `05:2837` × `07:294` divergem sobre as tasks de `#9` |
| `AMB-E6-SUPERFICIE` | **ABERTA — não bloqueante** | §4.4. Uma linha do fundador a encerra |

**Autorização de início (`S-05`).** `DECISIONS.md:4311` (*"Não iniciar `SF1` ainda"*) e `41:711-713`
(*"A execução continua parada"*) refletiam o estado **anterior** ao mandato de encerramento. O
mandato autoriza expressamente a cadeia `CONSOLIDAR PROTOCOLO → EXECUTAR → LACRAR → RECONCILIAR →
FECHAR`. ⇒ **`S-05` satisfeita.** Com `S-01`..`S-04` fechadas acima, **`SF1` deixa de ser
`NÃO INICIÁVEL`**.

---

## 7 · Catálogo `INJ-*` reauditado contra o `HEAD` — Saída A e suas 5 condições

**Não há divergência material do caminho.** Medido: 22/22 símbolos-alvo presentes, nenhum renomeado
ou com assinatura alterada; `App.js` e `index.js` **byte-idênticos** a `1ae353f` ⇒ o enxerto de 7
linhas continua exato; 6 dos 8 arquivos de produto citados são byte-idênticos e os outros dois
mudaram de forma **inteiramente mapeada**, com o mapa **não uniforme** de `40:222-226` **correto**; a
rede (`fazerBackup`/`restaurar`/`exigirLimpo`/`RST-TUDO`) não depende do formato do ponteiro.

⇒ **NÃO emito `STOP_INJ_ROUTE_MATERIAL_DIVERGENCE`.**

**As cinco condições:**

1. Criar *worktree* é alteração de repositório e **exige autorização explícita** — concedida por §8
   do mandato.
2. Reauditar `INJ-*` contra o `HEAD` com o mapa **não uniforme** — **cumprida**; dois deslocamentos
   adicionais descobertos (`:570-590` e `:602-615`).
3. `INJ-04`/`INJ-05` → **`NÃO APLICÁVEL — inércia medida`**, retiradas do roteiro junto com a
   instrução de `08:367-368` que, sob o `HEAD`, é justamente o ato que **produz** a inércia. A
   reclassificação é **declarada aqui**, não absorvida em silêncio.
4. **`INJ-03` sai do roteiro como `SEM INSUMO`** (achado novo). `INJ-03` exige uma chave C60 com
   payload **inline** (`harnessInject.js:220-231`); o inventário tem **uma única** chave C60 e ela é
   **ponteiro** (§2.2) ⇒ lançaria o erro de `:227-231`. E `COBERTURA_EIXOS_DE_VERSAO:505`
   (*"porPonteiroV3: INALCANÇÁVEL"*) é **falsa no `HEAD`**: `resolvePointer60:489` chama
   `carryLogicalSchema` e os eixos atravessam. Fabricar insumo inline seria escrita de produto e cai
   sob `ARB-OBRA-NOVA` — **não pode ser decidido dentro da execução**.
5. Corrigir o rótulo de recusa de `INJ-10`: é **`e_diretorio`** (`fileBlobStore.js:332-335`), não
   `nao_e_arquivo`. Vale para `harnessInject.js:409` **e** para `08:258-259`.

**Escopo executável resultante: 8 injeções** — `INJ-01`, `INJ-02`, `INJ-06`, `INJ-07`, `INJ-08`,
`INJ-09`, `INJ-10`, `INJ-11`. Ressalvas mantidas: `INJ-09` é sondagem com desfecho em aberto
(`08:251`); `INJ-10` **nunca** encerra sem restaurar (`08:260`); `INJ-01` é o percurso **sem rede de
chave** apontado por `E7-13` — confirmado em código: `harnessInject.js:168` chama
`fazerBackupArquivo(a.uriAtivo)` e **nunca** `fazerBackup(a.chave)`.

**Por que a degradação não escolhe a Saída B.** A perda de `E4` decorre do curto-circuito em
`origemBruta:802-803` contra um ponteiro **que já tem os eixos**, e vale **igualmente** para a Saída
B — escrever `imgW:800` por `sqlite` externo bate no mesmo curto-circuito. **B não recupera `E4`; só
perde a contabilidade de `rowid`.** Neste eixo B é estritamente pior.

⚠️ **Correção ao mandato, registrada em vez de aceita em silêncio:** o mandato pediu as constantes de
versão em `AtelierCanvas.js` *"~linhas 42-52"*. No `HEAD`, `:38-56` é o comentário dos quatro eixos e
as constantes reais estão em **`:57-59`** (`CANVAS_PAYLOAD_V = 2`, `PAINT_SCHEMA_VERSION = 1`,
`LAYOUT_VERSION = 1`). O escritor pedido em *"~600-615"* está em **`:607-610`**.

⚠️ **`README_HARNESS.md` está desatualizado** e deve ser corrigido ao montar o contexto C: sua tabela
nomeia `1ae353f` como base canônica do harness, mas `git diff --stat 1ae353f..6337c2f` sobre a
superfície executável mede **31 arquivos, +1938/−332** (incluindo `AtelierGalleryScreen.js` +306 — a
própria superfície de `E6`). Suas limitações `L-1` (*"não inspeciona storage"*) e `L-2` são da era
**iPad**; `L-1` está **obsoleta no Android**, onde `adb run-as` inspeciona o storage — como §2.2
acabou de demonstrar.

---

## 8 · §28 `#7` ∪ `#9` — fusão do salvamento **CONDICIONADA a `ARB-28-7-TEXTO`**

**Por que a fusão é tecnicamente recomendada se `#7` exigir salvar:** existe **uma** peça legada;
`#9` exige salvá-la (`04:1057`) e a redação de Tasks para `#7` também exige salvamento
(`05:1013`). Nesse cenário, o primeiro salvamento extingue a condição de entrada do segundo
(`39:620`), tornando dois salvamentos independentes incompatíveis com a preservação do mesmo
insumo.

**Por que isso ainda não é obrigação provada:** o PLAN, de maior precedência técnica que Tasks,
define `#7` sem salvamento (`04:1055`), assim como `06:440`; `ARB-28-7-TEXTO` (`39:1008`) continua
aberta. Se essa redação governar, `#7` tem zero metade consuntiva e existe apenas um salvamento, o de
`#9`. A ratificação do fundador estabelece **posição** para qualquer salvamento consuntivo, mas não
resolve o texto de `#7` (`DECISIONS:4336-4347`).

**Por que a observação NÃO pode ser fundida:** sem observação e captura **entre** os gestos, um
`FAIL` na reabertura não distingue a causa (`40:164-166`), e o critério de `#7` — *"sem salto de
escala nem desalinhamento **ao retomar**"* (`06:440`, `39:613`) — é medido **no ato de retomar**,
referencial que a rotação subsequente destruiria.

**As quatro condições, caso o fundador determine que `#7` salva:**

1. A fusão é **declarada por escrito**, nunca silenciosa, e nomeia os dois cenários e o salvamento
   único — **esta seção é essa declaração**.
2. `R4`/`CASO 13` concluída **e lacrada**, e `E6`/`GH1` já colhido, **antes** do salvamento único.
3. Metade reversível preservada: abrir → fotografar intocada → pintar → observar/fotografar → girar →
   observar/fotografar — **tudo antes de salvar**, com direito de parada (`39:606-616`, `GH2a`;
   `39:616` — *"PARAR ANTES DE `GH2b`"*).
4. Declarar **antes** de executar que a metade *write-forward* de `#9` é **NÃO PROVÁVEL no `HEAD`** e
   registrá-la como dívida `F12A`, **jamais como `PASS`**.

**O que a fusão não resolve** (sobe ao fundador): `ARB-28-7-TEXTO` e `ARB-28-TABELA` (§6); para
`#7` instanciado no Colorir (`07:575`), o passo 3 de `07:540` (*obra do Colorir salva antes da Fase
6*) é inconferível, mas o gatilho de `07:542`, como redigido, **não reprova** porque existe obra
anterior à Fase 6; `CASO 11` como escrito em `07:605` seria um **terceiro** consumidor consuntivo não
catalogado, embora sua fonte dona (`04:1087`, `05:1215`) **não** exija obra antiga; e `39:786-787`
continua **sem a linha de `#9`**, que `E7-14` determinou acrescentar **antes** do Bloco 3.

---

## 9 · Ordem de execução definitiva

```
LACRE L00  ................. FEITO (§2.1) — cadeia de custódia íntegra
  │
  ├─ E6 / GH1 ............... LEITURA PURA · PRIMEIRO DE TODOS · primeiro boot · contexto A
  │                           (CN-13 só é observável aqui — 39:586)
  ├─ LACRE L01
  │
  ├─ SF1 Bloco 1 ............ reobservação do Bloco A (CASO 1, 10, 14v2, 15, 16) · contexto A
  ├─ LACRE L02
  │
  ├─ R4 / CASO 13 ........... contexto B (8082, a190b3e) · passo 5 = obra antiga do Ateliê,
  │                           passo 6 = obra C60 light · nenhuma restauração
  ├─ LACRE L03  ............. ⚠️ "concluir sem lacrar NÃO satisfaz" (cláusula 1)
  │
  ├─ Restante de R5 ......... §28 #1–#11 + parcela SG-A do #17 · E1/TA-5R/GH3 somente após resolver
  │                           superfície, executabilidade e ARB-E1-CONCLUSAO ·
  │                           painéis de recusa · E5 · E4 · #7→GH2a e #9→girar SEM SALVAR
  ├─ LACRE L04
  │
  └─ §28 #7 ∪ #9 ............ SE #7 EXIGIR SAVE: SALVAMENTO ÚNICO · PONTO DE NÃO RETORNO · ÚLTIMO ATO
     (se #7 não salvar: somente #9 executa o salvamento consuntivo final)
     LACRE L05
```

Cláusula 1 satisfeita: `R4` lacrada antes do salvamento consuntivo. Cláusula 2 satisfeita: a obra
legada permanece intacta até o último consumidor obrigatório. Se `#7` exigir salvamento, o ato final
é a fusão `#7 ∪ #9`; se não exigir, o salvamento consuntivo final é somente o de `#9`.

---

## 10 · Gates automáticos

**Para esta campanha (documental + física, sem alteração de código), o conjunto de gates automáticos
disparados é: `node scripts/check-env.js` — e mais nada**, desde que nenhum byte de `App.js`,
`index.js`, `src/**`, `babel.config.js`, `metro.config.js`, config Expo ou `package.json` seja
tocado, **inclusive em comentário**. `check-env.js` está embutido em `npm run start:dev`
(`package.json:11`) e é gate nominal do protocolo físico (`14:387`, `G-10`; `37:382`).

⚠️ **Exceção que se aplicará:** montar o contexto C (harness) **cria** um *worktree* e nele
**reaplica 7 linhas em `App.js`** e adiciona `src/devharness/`. Isso é alteração de grafo executável
**naquele worktree** ⇒ **`npm run verify:runtime` é obrigatório lá dentro, verde, antes de servir o
bundle ao aparelho**. O *worktree* canônico permanece **intocado e limpo**.

Para o **fechamento** da Fase 6 (`S21`/`B7` → `S22`/`F6_CLOSED`) a lista canônica é:
`npm run verify:runtime` no estado final · `npx expo-doctor` · os portões `G-*` de §26 dentro do
smoke · a série de mutantes `MT-*`. Referência verde medida em `2ffcd82`: `bundle:check` verde,
`smoke 4954/4954`, `doctor 18/18`. Não existe regra de monotonicidade de contagem de smoke na Fase 6
— *"o gate é `verify:runtime` verde, não um número congelado"* (`27:381`).

---

## 11 · O que esta campanha **não pode** fechar — e isso precisa ser dito antes de executar

O mandato pede, ao final, avaliar 16 critérios e eventualmente declarar `FASE 6 = ENCERRADA`.
**A varredura de bloqueantes mostra que essa declaração é inalcançável nesta campanha**, e não por
qualidade de execução: por **ausência de hardware**, por **código nunca escrito** e por **decisões do
fundador ainda não tomadas**.

**`F6_CLOSED` tem 17 bloqueantes, todos vivos** (fonte dona: `36` §5/§6). Esta campanha — `SF1`,
`R4`, `R5` — endereça **2 deles** (`B-04` e `B-05`). Os outros 15 permanecem, e entre eles:

| Bloqueante | Por que a campanha não o alcança |
|---|---|
| **`B-08` · `F6-SG-B` — zero implementação de `F6-R2`** | *"O maior item da fase"* — exige o **ciclo SDD completo** de `F6-R2 · Map Geometry Foundation`. **É o único trilho que exige código novo, e tem zero *commits* de implementação no `HEAD`** |
| **`B-14` · `B4` — `G-SPLASH`, `G-STATUS`, `G-ICON`** | **É o entregável que dá nome à Fase 6, e está `Não iniciado`** |
| **`B-02` · `R6`** | Exige **iPad** e **telefone Android real**. Nenhum dos dois existe. Só se resolve por **aquisição de hardware** ou por **ato escrito do fundador** aceitando o vão |
| **`B-06` · `R7`** | Exige binário `preview` **não-`DEV`**, que *"não existe"* (`37:712`) |
| **`B-01` · `R1-PEND-1..4`** | Abertas **por decisão**, não por trabalho — resolvem-se com um ato de escrita do fundador |
| **`B-03` · `R3` metade *resize*** | Sessão física de Split View no SM-X510 — **executável**, mas fora do escopo deste mandato |
| `B-09`..`B-13`, `B-15`..`B-17` | Subportões `C`/`D`, a11y, motion, `G-SEAL`, `G-PERF`, `B7` e o ato declaratório final |

⇒ **`F6_CLOSURE_BLOCKER = SIM`, e continuará `SIM` ao fim desta campanha, com sucesso integral em
tudo o que ela cobre.** O resultado honesto que a campanha pode produzir é: **`R4` e `R5` executadas,
lacradas e reconciliadas; `F6-SG-A` submetido ao Human Gate final**. Não mais que isso.

> ⚠️ Armadilha de leitura registrada: `F6_CLOSURE_BLOCKER = NÃO` aparece em `DECISIONS.md:4119`,
> `34:6`, `34:146` e `40:257` — mas o escopo ali é **exclusivamente o *reset* determinístico `R2P1`**
> (*"Motivo — **e apenas este**"*). Ler aquilo como desbloqueio geral inverte o estado da fase.
> Igualmente: `R2_PROSPECTIVE_BE = PASS` **não** é `F6-SG-A = PASS` (`DECISIONS.md:4237`), e
> `GATE-ORDEM-CONSUNTIVA` ratificado **não** autoriza execução (`41:711-713`).

---

## 12 · Perguntas ao fundador — todas de uma linha, todas acompanhando a instrução física

Nenhuma delas bloqueia o início. Elas viajam junto com as instruções de vídeo, para serem
respondidas **antes** dos passos que dependem delas.

1. **`AMB-E6-SUPERFICIE`** — em `E6`, *"uma de cada formato"* é lido **através do acervo** (obra
   legada do Ateliê + obra C60 `light`, conforme `GH1`/`39:593`) ou **dentro da Galeria do Ateliê**?
   *Recomendação técnica: através do acervo — satisfazível hoje, leitura pura, sem criar nada.*
2. **`ARB-TAR-REDE` na prática** — confirma que `GH2b`, `GH3` e a metade "salvar por cima" de
   `INJ-09` executam **sem rede de restauração**, ou que **não executam**?
3. **`ARB-NAOEXEC`** — `NÃO EXECUTÁVEL` dispensa um caso obrigatório? Atinge `CASO 2`, `CASO 3`,
   metade do `CASO 5` e `E3`.
4. **`ARB-28-7-TEXTO`** — qual redação de `#7` governa: `05:1013` (exige salvar) ou `06:440` (não
   exige)? Se for `06:440`, a disputa consuntiva tem **um** consumidor, não dois.
5. **`B-02` / `R6`** — adquirir iPad + telefone Android real, ou **aceitar o vão por escrito**?
6. **`B-01` / `R1-PEND-1..4`** — lavrar a aceitação do *evidence gap*, como já foi feito para
   `R1-PEND-5`?

---

## 13 · Estado ao fim deste artefato

```
HEAD ........................... 6337c2f (árvore limpa antes deste commit)
CK-JS .......................... 6337c2f · grafo executável idêntico a 2ffcd82 · contexto A
LACRE DE ENTRADA ............... L00 íntegro · RKStorage 79D45E96… (3 aferições idênticas)
OBRA LEGADA .................... art_1786479103982_6079 · quatro eixos AUSENTES · nunca regravada
PONTEIRO C60 ................... screation_alight · v:3 · quatro eixos PRESENTES · rev:2
ACERVO ......................... MISTO (atravessado): 1 antiga no Ateliê + 1 nova no C60
AMB-E6-GALERIA ................. RESOLVIDA — NÃO BLOQUEANTE · residual AMB-E6-SUPERFICIE (1 linha)
AMB-E6-ORDEM-07x39 ............. RESOLVIDA OPERACIONALMENTE — síntese causal · E6 antes de E1
ARB-TAR-REDE ................... FECHADA — restauração PROIBIDA
ARB-INJ-CAMINHO ................ FECHADA — Saída A · 5 condições · 8 injeções executáveis
ARB-JS-BINARIO ................. FECHADA — CK-JS ratificado
ARB-28-ESCOPO .................. FECHADA — §28 #1–#11 + parcela SG-A do #17
ARB-28-7-TIRO-UNICO ............ FECHADA — regra de posição (por último)
ARB-OBRA-NOVA .................. CAI — justificativa corrigida por E9-1
ARB-NAOEXEC · ARB-28-7-TEXTO ... ABERTAS — humanas
SF1 ............................ DEIXA DE SER "NÃO INICIÁVEL" — S-01..S-05 satisfeitas
TABLET ......................... HANDS OFF (nenhum toque nesta lavratura)
F6_CLOSURE_BLOCKER ............. SIM — 17 bloqueantes vivos; esta campanha endereça 2
FASE 6 ......................... NÃO ENCERRADA e NÃO ENCERRÁVEL nesta campanha (§11)
```

**O que este artefato NÃO faz:** não converte `☐` em `PASS`, não declara `FAIL`, não concede
subportão, não autoriza *build*, não inicia execução física, não toca o aparelho, não cria *worktree*,
não sobe Metro e não atribui ao fundador nenhuma decisão que ele não tenha tomado por escrito.
