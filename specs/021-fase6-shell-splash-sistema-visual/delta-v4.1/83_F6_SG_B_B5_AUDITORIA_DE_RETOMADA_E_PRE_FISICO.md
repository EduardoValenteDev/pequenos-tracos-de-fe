# 83 · F6-SG-B · B5 — Auditoria forense de retomada, provas autônomas e PRÉ-físico

**Artefato:** 83
**Bloco:** F6-SG-B · B5 (evidência física e portão humano)
**Natureza:** auditoria forense somente leitura + execução do que é causalmente disponível sem ação humana
**Baseline documental de entrada:** `ad0136555c253210486040fb8cbb9d6a3015aeb8`
**Antecessor imediato:** `82_F6_SG_B_IMPLEMENTACAO_GATES_E_STOP_PHYSICAL_ACTION.md`
**Terminal deste artefato:** `SG_B_CONCEDIDO_COM_RESSALVAS` (lacrado)
**Revisão:** B5-R5 — decisão explícita do fundador no Human Gate registrada e lacrada (§12): `F6-SG-B = CONCEDIDO COM RESSALVAS`, três evidence gaps aceitos e abertos, §28 #13 mantido NÃO CONCLUSIVO por defeito preexistente, leitura `brilho` × `holofote` ratificada. §1–§11 permanecem como emitidos, sem reinterpretação de resultado.

> Este artefato é **documentação pura**. Não altera `App.js`, `index.js`, `src/**`,
> `babel.config.js`, `metro.config.js`, configuração Expo, `package.json` nem qualquer
> asset alcançável pelo grafo executável. Pela regra de bundleabilidade de `AGENTS.md`,
> **não dispara** `npm run verify:runtime`. O último `verify:runtime` válido continua sendo
> o registrado no artefato 82, sobre a mesma árvore (`ad01365`), sem nenhuma mutação desde
> então.

---

## 1. Auditoria forense de retomada

### 1.1 FASE 1 — Estado real do repositório

| campo | valor literal |
|---|---|
| `WORKTREE` | `c:\tmp\ptf_fase6_shell_splash_wt` |
| `BRANCH` | `feat/fase6-shell-splash` |
| `CURRENT_HEAD` | `ad0136555c253210486040fb8cbb9d6a3015aeb8` |
| `CANONICAL_HEAD_PRESENT` | **SIM** — `CURRENT_HEAD` é idêntico ao `CANONICAL_HEAD_DE_ENTRADA_B5` |
| `COMMITS_AFTER_AD013655` | **0** (`git log ad01365..HEAD` vazio; `git log --all --not ad01365` sem commits nesta branch) |
| árvore de trabalho | **limpa** — `git status --porcelain` vazio |
| não rastreados | **nenhum** — `git clean -nd` vazio |
| reflog | último movimento é a própria criação de `ad01365`; nenhum `checkout`, `reset`, `restore`, `merge` ou `rebase` posterior |

**Leitura causal.** O `HEAD` **não avançou**. A árvore está exatamente no ponto em que o
artefato 82 a lacrou. Não existe trabalho posterior perdido, oculto em stash, em branch
paralela ou em arquivo não rastreado. O ponto de entrada do B5 está intacto.

### 1.2 FASE 2 — Varredura de tokens do B5

Varredura no conteúdo versionado (`git grep` em `HEAD`), no histórico de mensagens
(`git log --all --grep`) e no diretório de trabalho (ripgrep, incluindo não rastreados):

| token procurado | ocorrências | onde |
|---|---:|---|
| `READY_FOR_B5_PHYSICAL` | 0 | — |
| `B5_CONTRACT_STATUS` | 0 | — |
| `SECTION_28_12_READY` | 0 | — |
| `SECTION_28_13_READY` | 0 | — |
| `SECTION_28_14_READY` | 0 | — |
| `SECTION_28_17_SG_B_READY` | 0 | — |
| `MATRIX_5X3` | 0 | — |
| `ASSET_INVENTORY` | 0 | — |
| `ANCHOR_050_PROVEN` | 0 | — |
| `PHYSICAL_CONTEXT` | 0 | — |
| `NUMBER_OF_REQUIRED_VIDEOS` | 0 | — |
| `STOP_HUMAN_DECISION` | ocorrências apenas do **Q6** (artefato 81) | 81 — stop já superado por `fec7bcb` |
| `STOP_PHYSICAL_ACTION` | ocorrências pertencem ao **fecho do B4** (artefato 82) e ao protocolo SG-A (06/43/79) | nenhuma é preparação de B5 |
| `F6-SG-B = CONCEDIDO` | 0 | — |
| `F6-SG-B = NÃO CONCEDIDO` | presente | 80 (§ human gate SG-A) e 82 (§4) — ambos registram o subportão como **pendente**: concessão ainda não dada, **sem decisão negativa do fundador** |
| `§28 #12 / #13 / #14 / #17` | presentes | apenas como **definição** em `04_PLAN_DELTA_F6.md` §28 e como **pendência** em 82 §5 |

**Corpus de artefatos.** A numeração da pasta `delta-v4.1/` termina em **82**. Não existe
`83` anterior a este arquivo, nem qualquer artefato de execução física de B5, relatório
PASS/FAIL de mapa, tabela 5×3 preenchida ou inventário de acervo pós-R2.

**Não conclusão por string isolada.** Cada ocorrência de `STOP_PHYSICAL_ACTION` foi aberta
e lida em contexto material: em 82 ela é o **terminal do B4**, seguida do bloco
`NEXT_CAUSAL_ACTION = autorizar e executar o protocolo físico B5 de F6-SG-B`. Isto é o
**oposto** de evidência de B5 iniciado: é o registro de que B5 **ainda não começou**.

### 1.3 FASE 3 — Reconstrução (23 perguntas)

Vocabulário permitido: `PROVADO_CONCLUÍDO` · `PROVADO_NÃO_INICIADO` · `PARCIAL` · `SEM_EVIDÊNCIA`.

| # | pergunta | veredito | prova |
|---:|---|---|---|
| 1 | O prompt B5 chegou a ser executado? | `PROVADO_NÃO_INICIADO` | corpus termina em 82; zero tokens B5; HEAD inalterado |
| 2 | Existe artefato de B5 no repositório? | `PROVADO_NÃO_INICIADO` | maior artefato = 82 |
| 3 | O contrato B5 foi formalmente declarado? | `PROVADO_NÃO_INICIADO` | `B5_CONTRACT_STATUS` inexistente |
| 4 | §28 #12 foi executado fisicamente? | `PROVADO_NÃO_INICIADO` | nenhuma captura, vídeo ou registro |
| 5 | §28 #13 foi executado fisicamente? | `PROVADO_NÃO_INICIADO` | idem |
| 6 | §28 #14 foi executado fisicamente? | `PROVADO_NÃO_INICIADO` | idem |
| 7 | A parcela SG-B de §28 #17 foi executada? | `PROVADO_NÃO_INICIADO` | idem |
| 8 | A matriz 5×3 foi preenchida? | `PROVADO_NÃO_INICIADO` | TK-B-034 sem saída material |
| 9 | Existe referência aritmética para a matriz? | `PROVADO_CONCLUÍDO` (nesta sessão) | Anexo A, gerado do módulo real |
| 10 | O inventário de acervo (TK-B-035) foi feito? | `PARCIAL` | metade **estrutural** provada (§3.3); a metade **de dispositivo** tem caminho canônico em §4.6, na janela pós-`install -r` e pré-abertura |
| 11 | `ANCHOR_VERTICAL = 0,50` está provado no código? | `PROVADO_CONCLUÍDO` | §3.2 |
| 12 | CN-8 (TK-B-046) foi verificado? | `PROVADO_CONCLUÍDO` | §3.1 |
| 13 | O contexto físico foi fixado? | `PROVADO_CONCLUÍDO` | Contexto A — CANÔNICO, artefato 43 §4 |
| 14 | O número de vídeos exigidos foi definido? | `PROVADO_CONCLUÍDO` (nesta sessão) | §5.6 — **2 vídeos**, por incompatibilidade causal da troca de binário |
| 15 | O dispositivo está preparado? | `PARCIAL` | ADB **autorizado** (§4.1); falta a troca de binário — o runtime instalado é o preview de `6f54b196` |
| 16 | O runtime instalado contém o código SG-B? | **NÃO** (`PROVADO_CONCLUÍDO` como fato negativo) | §4.2 — preview construído de `6f54b196`, anterior a `fec7bcb` |
| 17 | Existe runtime capaz de carregar o código SG-B? | `PROVADO_CONCLUÍDO` | §4.3 — development build em disco, mesma assinatura |
| 18 | Metro foi iniciado? | `PROVADO_NÃO_INICIADO` | FASE 0 proibia; nenhum processo iniciado |
| 19 | `adb reverse` foi configurado? | `PROVADO_NÃO_INICIADO` | não alterado nesta sessão; é o passo 3 da preparação em §6.1 |
| 20 | Houve gravação de vídeo? | `PROVADO_NÃO_INICIADO` | nenhum arquivo de evidência de B5 |
| 21 | Houve adjudicação material de B5? | `PROVADO_NÃO_INICIADO` | pressupõe evidência inexistente |
| 22 | O portão humano SG-B foi apresentado? | `PROVADO_NÃO_INICIADO` | 82 §4 mantém `PENDENTE` |
| 23 | `F6-SG-B` foi concedido? | **NÃO — PENDENTE** | 80 e 82 registram concessão ainda não dada; **não há decisão negativa do fundador** |

### 1.4 FASE 4 — Classificação

```
B5_STATE = B5_NOT_STARTED
```

Provas convergentes e independentes: (a) `HEAD == ad01365`, zero commits posteriores,
árvore limpa e sem não rastreados; (b) zero ocorrências de **todos** os tokens específicos
de B5 em conteúdo, histórico e diretório de trabalho; (c) o corpus termina em 82; (d) 82
declara explicitamente o B5 como próxima ação causal, ainda não executada.

Distinções mantidas, conforme exigido:

- **preparação técnica ≠ execução física** — o B4 preparou; nada foi executado no aparelho;
- **`READY_FOR_B5_PHYSICAL` ≠ B5 completo** — o token sequer existe;
- **execução física ≠ adjudicação** — não há execução, logo não há adjudicação;
- **adjudicação material ≠ portão humano automático** — o portão exige decisão explícita do fundador;
- ausência de aparelho pronto **não** vira PASS; evidence gap governado **não** vira FAIL.

### 1.5 FASE 5 — Ação de retomada

Para `B5_NOT_STARTED` a instrução é executar o prompt B5 original integralmente **até o
primeiro STOP legítimo**. É o que as seções 2 a 6 fazem: reconstroem o contrato, executam
**toda** prova não humana disponível, periciam o parque de binários, definem o pré-voo
determinístico e param exatamente na primeira ação que exige mãos humanas.

---

## 2. Contrato B5 reconstruído

O B5 cobre exatamente sete itens, sem ampliação de escopo:

| item | origem | tarefa | critério de aceite |
|---|---|---|---|
| C-B5-1 | §28 #12 | TK-B-031/032/033 | mapa abre em tablet, **retrato e paisagem**; câmera acerta a mira; sem os 56pt fantasma |
| C-B5-2 | §28 #13 | TK-B-031/032/033 | tour completo em telefone e tablet; pino, brilho e holofote coincidem; barra lateral medida |
| C-B5-3 | §28 #14 | TK-B-044 | as 20 histórias, três faixas, antes/depois; nenhum deslocamento inaceitável |
| C-B5-4 | §28 #17 (parcela SG-B) | TK-B-045 | regressão em telefone: nada mudou fora do escopo do mapa |
| C-B5-5 | matriz 5×3 | TK-B-034 | 15 células com posição observada **e** esperada, cada uma com captura; **qualquer** discordância impede a apresentação de F6-SG-B |
| C-B5-6 | inventário de obras | TK-B-035 | acervo **idêntico** antes e depois de R2 |
| C-B5-7 | portão humano | TK-B-036 | relatório PASS/FAIL; F6-SG-B **permanece não concedido** até decisão humana |

Complemento já verificável sem aparelho: **TK-B-046 / CN-8** (nenhum commit de F6-R2 toca
área protegida) — executado em §3.1.

Bandas responsivas preservadas sem alteração: **COMPACTA < 600dp · MÉDIA 600–899dp ·
EXPANDIDA ≥ 900dp**. Âncora preservada sem alteração: **`ANCHOR_VERTICAL = 0,50`**.

---

## 3. Provas autônomas executadas nesta sessão

Tudo nesta seção foi executado **sem tocar no aparelho, sem abrir o app, sem iniciar Metro
e sem mutar arquivo algum do repositório**.

### 3.1 CN-8 / TK-B-046 — nenhum commit de F6-R2 toca área protegida → **PASS**

Commits de F6-R2 sobre esta branch, do mais antigo ao mais recente:

| commit | assunto | arquivos | veredito CN-8 |
|---|---|---|---|
| `fe2ae20` | docs: auditar SG-B e registrar stop Q6 | `specs/**` | PASS |
| `aa9cab5` | docs: registrar comparador visual Q6 | `specs/**` | PASS |
| `da0a794` | docs: fixar âncora vertical do mapa em 0,50 | `docs/**`, `specs/**` | PASS |
| `fec7bcb` | fix: unificar âncora responsiva do mapa | 3 arquivos de produto (`src/**`) | PASS |
| `ad01365` | docs: lacrar gates locais do SG-B | `specs/**` | PASS |

Nenhum commit toca **assets**, **manifestos de áudio/cenas**, **histórias**, **conquistas**,
**progresso**, **`accessControl`**, **paywall** ou **schema de storage**.

**Divergência declarada, não corrigida silenciosamente:** o contrato do bloco previa sete
commits (`C-B1`…`C-B7`); a execução real produziu **cinco**. A diferença é de agregação
documental, não de escopo — nenhum conteúdo previsto ficou de fora. Fica registrada aqui
para adjudicação humana no portão SG-B.

### 3.2 `ANCHOR_050` — âncora única e sem termo aditivo → **PASS**

Em `src/services/mapAnchor.js`:

- `export const MAP_ANCHOR_FRAMING = 0.5;` — **uma única** definição, sem ramificação por faixa;
- o alvo de câmera é `anchor.contentY - viewportH * MAP_ANCHOR_FRAMING`, **sem** parcela somada;
- o módulo **não importa** faixa responsiva, barra lateral, *insets* nem token de tema — a
  fração incide apenas sobre a **viewport livre medida**;
- `0.58` não ocorre em nenhum arquivo de mapa;
- a única ocorrência de `56` em `AdventureMapScreen.js` é o **comentário** da linha 304,
  que documenta a compensação **removida** — não há código a aplicá-la.

Coerente com `D-FUND-F6-SG-B-Q6-A18-FINAL-01` em `docs/DECISIONS.md`.

### 3.3 TK-B-035 — metade estrutural do inventário → **PASS**

Os três arquivos de produto alterados por `fec7bcb` **não referenciam** `AsyncStorage`,
`expo-file-system`, `drawingStorage` nem `atelierStorage`. Não existe caminho de código,
introduzido por F6-R2, capaz de criar, mover ou apagar obra do acervo.

**Metade restante (verificação no dispositivo, contagem antes/depois):** depende de ADB
autorizado — **já concedido** — e tem caminho canônico em §4.6. Isto é **evidence gap governado**, não FAIL.

### 3.4 Referência aritmética da matriz 5×3

Gerada a partir do **módulo real** `src/services/mapAnchor.js`, não de valores digitados à
mão. Serve como coluna "posição esperada" da matriz de TK-B-034: cada célula observada no
vídeo será conferida contra estes números.

| faixa | largura | viewport livre | região | conteúdo | `maxScroll` | repouso (`vp × 0,50`) | abertura D12 (`creation`, `regionTop`) |
|---|---:|---:|---:|---:|---:|---:|---:|
| compacta | 390dp | 696dp | 693dp | 2772dp | 2076dp | 348dp | 2076dp |
| média | 643dp | 1247dp | 1143dp | 4572dp | 3325dp | 623,5dp | 3325dp |
| expandida | 1077dp | 753dp | 1915dp | 7660dp | 6907dp | 376,5dp | 5745dp |

Tabelas completas por história (20 × 3 faixas) no **Anexo A**.

---
## 4. Perícia do parque de binários e determinação do runtime de B5

> **Revisão B5-R1.** Esta seção substitui a redação anterior nos pontos em que ela conflitava
> com a reconciliação do contrato físico. A auditoria forense (§1), o contrato reconstruído (§2)
> e as provas autônomas (§3) permanecem intactos.

### 4.1 ADB autorizado — estado real

O fundador autorizou a depuração USB. A primeira leitura ainda respondeu `unauthorized` porque o
**daemon do host** guardava a sessão anterior; `adb kill-server` seguido de `adb start-server`
(ação exclusivamente no computador, sem tocar em dados do aparelho) resolveu:

```text
RX2XC003LTJ   device   product:gts9fewifixx   model:SM_X510   device:gts9fewifi
```

Configuração real do aparelho (`adb shell am get-config`):

```text
pt-rBR-ldltr-sw823dp-w823dp-h1317dp-xlarge-notlong-port-280dpi-...-2304x1440-v36
```

| leitura | valor |
|---|---|
| `smallestScreenWidthDp` | **823dp** |
| janela em **retrato** | **823dp** → faixa **MÉDIA** (600–899dp) |
| janela em **paisagem** | **1317dp** → faixa **EXPANDIDA** (≥900dp) |
| faixa **COMPACTA** (<600dp) | **não alcançável por rotação** neste aparelho |
| densidade / resolução | 280dpi · 2304×1440 |

### 4.2 Runtime instalado — identificado por hash, não por inferência

O `base.apk` instalado foi **puxado do aparelho** e medido:

| leitura | valor |
|---|---|
| SHA-256 do APK instalado | `FE7F071D8269A4CD66D202654BE73AA932FCAF14BD2D12619A368693CCD67E6E` |
| bytes | `265.335.678` |
| conferência | **idêntico** ao preview de Attempt-04 registrado no artefato 79 |
| `versionCode` / `versionName` | `1` / `1.0.0` |
| `minSdk` / `targetSdk` | `24` / `36` |
| assinatura (v2, DER SHA-256) | `05A1891555446C4B529D6CDC4C2A6C6D73D115DFFEE678D8C90E902FF5A618A5` |
| `debuggable` | **ausente** → `run-as` negado no aparelho |
| `MainActivity` | **sem** atributo `screenOrientation` (rota Kotlin da R7) |
| `ceDataInode` / `deDataInode` | `137433` / `127446` |
| `firstInstallTime` / `lastUpdateTime` | `2026-08-10 12:03:42` / `2026-08-18 20:07:05` |

`git merge-base --is-ancestor 6f54b196 fe2ae20` retorna verdadeiro: o *source HEAD* desse
binário **precede os cinco commits de F6-R2**. Duas consequências:

1. o pacote instalado **não** contém `fec7bcb` — medir §28 nele mediria o código errado;
2. o estado do aparelho **é**, literalmente, o estado **"antes de R2"** exigido por §28 #14.

### 4.3 Candidato — *development build* já em disco

| leitura | valor |
|---|---|
| arquivo | `C:\tmp\ptf_evidencias\F6R1-INSTALL-GATE-20260813-015532\apk\NEW-c22b43b9-development.apk` |
| SHA-256 | `027395178CF65DC0C1D7EE04975057262AC5AEB03BEFA7434A1318ACCF97262E` |
| bytes | `227.650.294` |
| `package` | `com.valentedev.pequenostracosdefe` |
| `versionCode` / `versionName` | `1` / `1.0.0` |
| `debuggable` | **`true`** → `run-as` disponível depois da troca |
| *dev client* | `expo.modules.devlauncher.launcher.DevLauncherActivity` presente |
| assinatura (v2, DER SHA-256) | `05A1891555446C4B529D6CDC4C2A6C6D73D115DFFEE678D8C90E902FF5A618A5` |

É **bit a bit idêntico** ao `CURRENT-installed-base.apk` do mesmo lote — o pacote que estava
instalado antes da R7. Nenhum build EAS novo, nenhum hardware novo, nenhum download.

### 4.4 D1 / orientação — **correção**: era incerteza residual, agora é prova offline

A revisão anterior deste artefato classificou o destravamento de paisagem no *development
build* como incerteza a resolver em pré-voo. **A perícia resolveu isso offline.**

O `MainActivity` do candidato declara `android:screenOrientation="@0x7f0b0046"`. Lendo o
`resources.arsc` do próprio APK, esse identificador é um `integer` com **duas** configurações:

| configuração (`ResTable_config`) | qualificador | valor | significado |
|---|---|---:|---|
| todos os bytes zerados | *default* | `1` | `SCREEN_ORIENTATION_PORTRAIT` |
| `0x0258` no *offset* 28 | **`sw600dp`** | `-1` | `SCREEN_ORIENTATION_UNSPECIFIED` |

O aparelho é **`sw823dp`**, e `823 ≥ 600`. Logo o recurso resolve para **`-1`** — **sem trava de
orientação**. A paisagem está destravada no candidato, **provado sem ligar o aparelho**.

Isso satisfaz literalmente o `CONTRATO_D1` (telefone em retrato; tablet `sw ≥ 600dp` em retrato
**e** paisagem) pela rota antiga de recurso, que é a que este binário carrega. Deixa de ser
passo bloqueante de pré-voo e passa a ser **mera confirmação em câmera**.

### 4.5 Preflight de substituição — as cinco provas exigidas

| prova | resultado | evidência |
|---|---|---|
| `PACKAGE_MATCH` | **PASS** | ambos `com.valentedev.pequenostracosdefe` (manifesto binário dos dois APKs) |
| `SIGNATURE_MATCH` | **PASS** | certificado v2 idêntico nos dois: `05A18915…A618A5` |
| `DATA_PRESERVATION_PATH` | **PASS** | mesmo pacote + mesma assinatura + `install -r`; **empírico**: a troca da R7, no sentido inverso, preservou `ceDataInode=137433`, `deDataInode=127446` e `firstInstallTime=2026-08-10`, enquanto `lastUpdateTime` foi para `2026-08-18` |
| `NO_DOWNGRADE_BLOCKER` | **PASS** | `versionCode` **1 == 1** — substituição, não rebaixamento |
| `CORRECT_JS_HEAD_PATH` | **PASS** | *dev client* carrega o JS do Metro desta *worktree*, em `ad01365` (inclui `fec7bcb`) |

```text
APK_REPLACEMENT_REQUIRED ............... SIM
adb install -r ......................... AUTORIZADO PELO PROTOCOLO
uninstall / pm clear / restore / TAR ... PROIBIDOS E DESNECESSÁRIOS
```

### 4.6 Inventário PRE — o caminho causal correto

No pacote **release** hoje instalado, o inventário de dispositivo é **impossível**, e isso foi
medido, não suposto:

- `run-as` → `package not debuggable`;
- `/sdcard/Android/data/<pkg>/files/` → **vazio**;
- `du /data/user/0/<pkg>` → `Permission denied`.

Mas existe uma janela causal exata: **`install -r` preserva os dados** e o candidato **é
`debuggable`**. Entre a troca e o **primeiro lançamento** com o JS de `ad01365`, os arquivos em
disco ainda são **exatamente o acervo pré-R2** — porque nenhum código de R2 jamais rodou neste
aparelho (§4.2). Portanto:

> **Inventário PRE canônico** = listagem por `run-as` **imediatamente após** `adb install -r` e
> **antes** da abertura por *deep link*. A contagem visual filmada no início do vídeo é
> corroboração, não a fonte única.

---

## 5. Reconciliação do contrato físico

### 5.1 Hardware disponível e autorizado

Varredura de todo o corpus `delta-v4.1`: **um único aparelho** aparece — `SM-X510` (109
menções) / `RX2XC003LTJ` (49). **Nenhum** serial de telefone Android, **nenhum** iPad. O
artefato 80 registra que o fundador **já dispensou** aquisição de hardware.

```text
AVAILABLE_PHYSICAL_HARDWARE = Samsung SM-X510 (RX2XC003LTJ) — tablet Android, sw823dp
```

Nenhum aparelho novo é requisitado, comprado ou solicitado por este protocolo.

### 5.2 Requisito físico por cenário, lido literalmente nos owners

**§28 #12 — "Mapa: abertura em iPad, retrato e paisagem"**

```text
REQUIRES_PHYSICAL_NOW ....... SIM
REQUIRED_DEVICE ............. literal do PLAN: iPad · owners (TK-B-031..034): "aparelho",
                              "aparelho / Split View", "tablet landscape" — sem iPad
AVAILABLE_DEVICE ............ SM-X510 (retrato 823dp = MÉDIA · paisagem 1317dp = EXPANDIDA)
ALTERNATIVE_PROOF_ALLOWED ... SIM
EVIDENCE_GAP_ALLOWED ........ SIM — apenas para a parcela literal iPad/iOS
EXACT_CONTRACT_SOURCE ....... 04_PLAN §28 linha #12 · 05_TASKS mapeamento "#12 → TK-B-031..034"
                              · TK-B-032 "(aparelho / Split View)" · TK-B-033 "(tablet landscape)"
                              · artefato 82 §5 item 1: "abertura do mapa em retrato e paisagem
                                NO TABLET"
```

**§28 #13 — "Tour completo, telefone e iPad"**

```text
REQUIRES_PHYSICAL_NOW ....... SIM (parcela SG-B)
REQUIRED_DEVICE ............. literal: telefone E iPad
AVAILABLE_DEVICE ............ SM-X510
ALTERNATIVE_PROOF_ALLOWED ... SIM — a parcela SG-B é TK-B-019, marcada "Auto: parcial"
                              (já verde nos 34/34 focados), restando o vídeo do tour
EVIDENCE_GAP_ALLOWED ........ SIM — para telefone e iPad literais
EXACT_CONTRACT_SOURCE ....... 04_PLAN §28 linha #13 · 05_TASKS mapeamento "#13 → TK-A-026,
                              TK-A-027, TK-B-019, TK-C-026, TK-C-063" · TK-B-019 "Prova: §28 #13
                              (vídeo do tour) · Auto: parcial" · artefato 82 §5 item 2
```

**§28 #14 — "As 20 histórias, três faixas, antes/depois"**

```text
REQUIRES_PHYSICAL_NOW ....... SIM
REQUIRED_DEVICE ............. NENHUM literal — o contrato exige FAIXAS, não aparelho:
                              TK-B-044 "Arquivos: artefato de evidência (documental) + aparelho"
AVAILABLE_DEVICE ............ SM-X510 cobre MÉDIA e EXPANDIDA nativamente; COMPACTA por
                              Split View (janela <600dp) ou pelo comparador de §5.3
ALTERNATIVE_PROOF_ALLOWED ... SIM
EVIDENCE_GAP_ALLOWED ........ SIM, mas HOJE NÃO É NECESSÁRIO — as três faixas têm caminho
EXACT_CONTRACT_SOURCE ....... 04_PLAN §28 linha #14 · TK-B-044 · TK-B-031/032/033
```

**§28 #17 — parcela SG-B, "Regressão completa em telefone"**

```text
REQUIRES_PHYSICAL_NOW ....... SIM
REQUIRED_DEVICE ............. TELEFONE — literal e explícito na task:
                              TK-B-045 "Arquivos: aparelho (telefone, faixa compacta)"
AVAILABLE_DEVICE ............ NENHUM telefone disponível nesta campanha
ALTERNATIVE_PROOF_ALLOWED ... PARCIAL — a FAIXA compacta é reproduzível; o APARELHO telefone não
EVIDENCE_GAP_ALLOWED ........ SIM
EXACT_CONTRACT_SOURCE ....... 04_PLAN §28 linha #17 · TK-B-045 · CN-1 · artefato 80 §4:
                              "R6: evidence gap aceito, SEM FABRICAR PASS de iPad ou telefone
                              Android" · artefato 82 §5 item 4: "o evidence gap aceito em SG-A
                              NÃO vira prova automática de SG-B"
```

Nenhum requisito acima foi inferido do **nome** da task: cada linha cita o texto literal do
`04_PLAN` §28, o campo `Arquivos:` do owner em `05_TASKS`, ou a releitura já congelada nos
artefatos 80/82.

### 5.3 Faixas — por que a banda não é o aparelho

`src/theme/tokens.js` fixa `breakpoints = { phone: 0, tablet: 600, tabletL: 900 }`, e
`src/hooks/useWindowBand.js` classifica pela **largura da janela** via `useWindowDimensions`.
O próprio módulo declara os portões que sustentam isso:

- **`G-RSP-1`** — nunca `Dimensions.get`; `useWindowDimensions` é reativo e **sobrevive a
  rotação, Split View e resize**;
- **`G-RSP-3`** — nunca `Platform.isPad` nem `expo-device`: **idioma de aparelho não é medida de
  janela**.

Ou seja: **a faixa é função da largura da janela, não do aparelho** — isso é o contrato dizendo,
não uma conveniência desta campanha. Uma janela de 430dp num tablet é COMPACTA para todos os
efeitos do produto.

Bandas preservadas sem alteração: **COMPACTO <600dp · MÉDIO 600–899dp · EXPANDIDO ≥900dp**.
Âncora preservada: **`ANCHOR_VERTICAL = 0,50`**.

O **comparador Q6** continua íntegro em `C:\tmp\ptf_sgb_q6_comparator` (`render-comparator.cjs`,
9 PNGs e `manifest.json`), com as geometrias canônicas registradas no artefato 81 §8:

| faixa | janela | barra lateral | `contentW` | viewport livre |
|---|---|---:|---:|---:|
| compacta | `390 × 844dp` | — | **390** | **696** |
| média | `823 × 1317dp` | `180` (`rail`) | **643** | **1247** |
| expandida | `1317 × 823dp` | `240` (`full`) | **1077** | **753** |

Isso confirma o Anexo A: os números de MÉDIA e EXPANDIDA **são** os deste aparelho
(`823 − 180 = 643`; `1317 − 240 = 1077`), e a compacta de `390dp` é a de um telefone.

### 5.4 Matriz 5×3 classificada — `A` / `B` / `C` / `D`

`A` = prova automática · `B` = comparador/layout · `C` = físico no hardware disponível e
autorizado · `D` = evidence gap governado.

| consumidor \ faixa | COMPACTA `<600dp` | MÉDIA `600–899dp` | EXPANDIDA `>=900dp` |
|---|:---:|:---:|:---:|
| pino | **B** | **C** | **C** |
| alvo de toque | **B** | **C** | **C** |
| brilho | **B** | **C** | **C** |
| câmera | **B** | **C** | **C** |
| âncora exposta | **A** | **A** | **A** |

```text
A = 3   B = 4   C = 8   D = 0
```

Regras desta classificação, para que nenhuma célula derive:

1. **`âncora exposta` é `A` nas três faixas** porque é função pura de `src/services/mapAnchor.js`
   — já provada em `60/60` na matriz aritmética e nos `34/34` focados, para qualquer largura.
   Não há pixel envolvido.
2. **MÉDIA e EXPANDIDA são `C`** porque o aparelho disponível as entrega **nativamente**
   (823dp e 1317dp), com paisagem provadamente destravada (§4.4).
3. **COMPACTA é `B`** porque o mecanismo garantido é o comparador, que renderiza `390dp` com os
   assets canônicos. **Elevação permitida:** se o Split View do aparelho disponível levar a
   janela abaixo de `600dp`, essas quatro células são executadas como **`C`**. O caminho inverso
   — rebaixar `C` para `B` — **não** é permitido.
4. **Nenhuma célula é `D`.** O que depende do aparelho literal ausente **não é célula da
   matriz**: é o **cenário** §28 #17, registrado como gap em §5.5.
5. Nenhuma célula vira `PASS` sem observação; **nenhuma vira `FAIL` por ausência de aparelho**.

As 15 células continuam sendo as 15 observações de `TK-B-034` — o que muda é que cada uma passa
a declarar **como** é provada, em vez de assumir 15 execuções físicas.

### 5.5 Evidence gaps governados

| id | escopo | por quê | tratamento |
|---|---|---|---|
| `GAP-B5-1` | §28 #12 — parcela literal **iPad / iOS** | nenhum aparelho iOS na campanha; aquisição dispensada pelo fundador | a **substância** (retrato + paisagem, mira, ausência dos 56pt) é executada no tablet Android; a parcela iPad permanece **gap**, nunca `PASS` |
| `GAP-B5-2` | §28 #13 — parcelas literais **telefone** e **iPad** | idem | tour filmado no aparelho disponível; `TK-B-019` já é `Auto: parcial` verde; parcelas literais permanecem **gap** |
| `GAP-B5-3` | §28 #17 (SG-B) — **telefone Android** físico | idem | a **faixa** compacta é coberta por `B` (ou `C`, se o Split View permitir); o **aparelho telefone** permanece **gap** |

Os três gaps **não viram `PASS`**, **não viram `FAIL`**, e **não herdam** o aceite de SG-A — o
artefato 82 §5 item 4 é explícito nisso. Cada um exige aceite humano próprio no portão SG-B.

### 5.6 Número mínimo de vídeos — reconciliação causal e **emenda operacional**

A primeira revisão deste artefato afirmou `NUMBER_OF_REQUIRED_VIDEOS = 4` **sem prova causal**;
a revisão B5-R1 reconciliou para **1**, examinando as candidatas a incompatibilidade. A emenda
**B5-R2**, ditada pelo fundador, corrige esse resultado com um fato operacional que a
reconciliação anterior não possuía:

> **O fundador executa sozinho a captura externa. Durante gravação contínua ele não pode
> consultar o computador nem trocar mensagens com o agente.**

Esse fato desfaz a premissa que sustentava o take único. A revisão B5-R1 supunha que a troca de
binário podia ocorrer **dentro** do take porque seria operada pelo agente ao comando falado do
fundador. Mas a sequência real da troca é:

```
"trocar build agora" → adb install -r → inventário por run-as → Metro/reverse/runtime
                     → agente avisar "pronto, abra"
```

O último elo — **o agente avisar** — exige que o fundador receba uma mensagem do computador
enquanto grava. Isso quebra a continuidade operacional. Portanto a troca de binário **é**
incompatibilidade causal real, **não** conveniência.

Reexame da tabela de candidatas, com o fato operacional incorporado:

| candidata | é incompatibilidade causal? | por quê |
|---|---|---|
| troca de aparelho entre cenários | **NÃO** | há **um** aparelho; nenhum cenário exige dois simultâneos |
| troca de faixa (compacta/média/expandida) | **NÃO** | obtida por **rotação** e por **Split View**, sem interromper a gravação |
| **troca de binário (antes/depois de R2, §28 #14)** | **SIM** | a troca depende de instalação, inventário e preparo de runtime no computador, e o retorno ao fundador exige comunicação que a captura solo não permite |
| abertura por *deep link* após a troca | **SIM (mesma causa)** | pertence ao mesmo bloco de preparação de runtime |
| duração da gravação | **NÃO** | é conveniência, e o contrato proíbe separar por conveniência |

```text
MINIMUM_REQUIRED_VIDEOS ..... 2
V1 .......................... ESTADO ANTES DE R2   (preview 6f54b196, hoje instalado)
V2 .......................... ESTADO DEPOIS DE R2  (development client sobre ad01365)
VÍDEOS ADICIONAIS EXIGIDOS .. 0
```

**Dois — e exatamente dois.** A única incompatibilidade causal comprovada é a troca de binário,
e ela ocorre **uma vez**. Rotação, Split View, as 20 histórias, o tour e o acervo continuam
todos dentro do mesmo take em cada lado da fronteira. Um terceiro arquivo só é legítimo diante
de **interrupção real** (bateria, armazenamento, falha do aparelho ou da câmera) e deve ser
**justificado individualmente** no relatório de fechamento. Nunca por conveniência, nunca por
repetição.

**Nenhum outro requisito material do B5 muda por esta emenda:** contrato C-B5-1..7 intacto,
faixas intactas, `ANCHOR_VERTICAL = 0,50` intacta, matriz `A=3 · B=4 · C=8 · D=0` intacta,
gaps `GAP-B5-1..3` intactos, preflight 5/5 `PASS` intacto.

---

## 6. Protocolo físico final e mínimo — dois vídeos

A fronteira entre V1 e V2 é **a troca de binário**. Tudo que é humano fica dentro de um dos dois
takes; tudo que é de computador fica **entre** eles, com a câmera desligada.

```text
V1 (humano, câmera externa)  →  RELATO HUMANO DE CONCLUSÃO  →  bloco autônomo do agente
                             →  V2 (humano, câmera externa) →  fechamento autônomo
```

### 6.1 V1 — estado **ANTES** de R2

Executado sobre o binário **hoje instalado**, cujo *source HEAD* `6f54b196` precede os cinco
commits de F6-R2 (§4.2). Nada é instalado, nada é preparado, o Metro **não** sobe: o preview é
autossuficiente e qualquer preparo de runtime antes de V1 seria ruído.

| passo | o que o fundador faz |
|---:|---|
| 1 | Liga a câmera. Diz data, aparelho (**SM-X510**) e "preview anterior à R2". |
| 2 | Abre a **Galeria/Ateliê** e conta as obras em voz alta. *(acervo visual PRE)* |
| 3 | Abre o **Mapa** em **retrato**; mostra abertura, repouso e pino. |
| 4 | Gira para **paisagem**; mostra abertura e repouso. |
| 5 | Percorre as **20 histórias**, em retrato e em paisagem, na ordem do mapa. |
| 6 | Roda o **tour completo** do Beni, narrando pino, alvo de toque, brilho e mira da câmera. |
| 7 | Tenta **Split View** estreito (<600dp). Se não estreitar o bastante, narra e segue. |
| 8 | Diz "fim de vídeo 1" e desliga a câmera. |

Observáveis cobertos por V1: acervo PRE · mapa · retrato · paisagem · 20 histórias · tour ·
pino · alvo de toque · brilho · câmera · âncora · Split View conforme já reconciliado.

### 6.2 Bloco autônomo do agente — **entre** V1 e V2

Disparado **somente após o relato humano de conclusão de V1**. Câmera desligada. Nenhuma ação
humana.

1. `adb install -r "…\NEW-c22b43b9-development.apk"` — autorizado pelo preflight 5/5 `PASS`
   (§4.5). **Sem** `uninstall`, **sem** `pm clear`, **sem** `restore`, **sem** TAR.
2. `run-as` + listagem do acervo → **inventário PRE canônico**, imediatamente após o `install -r`
   e **antes** da primeira abertura do novo runtime (§4.6).
3. Metro nesta *worktree* na porta **8081** (`npx expo start --dev-client`).
4. `adb reverse tcp:8081 tcp:8081`.
5. Preparo do *development client* e conferência de que o JS servido é o de `ad01365`.

Provas que **permanecem íntegras** e que autorizam o passo 1:

```text
PACKAGE_MATCH ............ PASS
SIGNATURE_MATCH .......... PASS
DATA_PRESERVATION_PATH ... PASS
NO_DOWNGRADE_BLOCKER ..... PASS
CORRECT_JS_HEAD_PATH ..... PASS
```

Ao fim do bloco: novo **`STOP_PHYSICAL_ACTION`** e entrega das instruções humanas de V2.

### 6.3 V2 — estado **DEPOIS** de R2

Executado sobre o **HEAD canônico `ad0136555c253210486040fb8cbb9d6a3015aeb8`**, servido pelo
Metro ao *development client*. **Repete exatamente os observáveis correspondentes de V1**, na
mesma ordem e com as mesmas histórias — comparabilidade é o produto de V2, não a velocidade.

Ao final de V2, o fundador reabre a **Galeria/Ateliê** e reconta as obras em voz alta *(acervo
visual POS)*.

### 6.4 Fechamento (autônomo, depois de V2)

1. Inventário **POS** por `run-as`.
2. Comparação **PRE/POS** — critério `C-B5-6`: acervo **idêntico**.
3. Preenchimento da **matriz 5×3** confrontando o observado com o **Anexo A**; células `B`
   geradas pelo comparador Q6.
4. **Adjudicação individual** de §28 **#12**, **#13**, **#14** e da **parcela SG-B de #17**.
5. Registro dos **evidence gaps governados** `GAP-B5-1`, `GAP-B5-2`, `GAP-B5-3`.
6. Recálculo de **F6-SG-B** e apresentação do **Human Gate** ao fundador.

**`F6-SG-B` não é concedido automaticamente em nenhuma hipótese** — `TK-B-036` produz relatório
`PASS`/`FAIL`, não concessão.

---

## 7. V1 executado — relato humano e achado do tour

### 7.1 Estado

```text
V1_STATUS = CONCLUÍDO — executado integralmente conforme o roteiro de §6.1
Runtime de V1 = preview instalado, source HEAD 6f54b196 (precede os cinco commits de R2)
Nenhuma ação adicional no tablet após o encerramento da gravação (relato do fundador)
```

Observáveis cobertos por V1, conforme relato: acervo visual PRE · mapa · retrato · paisagem ·
20 histórias · tour · pino · alvo de toque · brilho · câmera · âncora · Split View conforme
reconciliado.

### 7.2 Achado — tour do Beni

Relato humano, registrado literalmente:

1. **os ícones correspondentes às etapas do tour aparecem posicionados incorretamente;**
2. **as marcações / indicações / spotlights usados pelo tour para apontar os elementos da
   interface também aparecem mal posicionados.**

```text
TOUR_FINDING_CLASSIFICATION = DEFEITO PREEXISTENTE DE ONBOARDING/TOUR
FASE PROPRIETÁRIA .......... a do onboarding/tour, já identificada anteriormente
ESTADO EM QUE FOI VISTO .... V1 = binário PRÉ-R2 — logo, NÃO introduzido por F6-R2
AÇÃO NESTE CICLO ........... REGISTRAR. Não corrigir. Não reinterpretar como autorização
                             para alterar onboarding. Não fabricar PASS.
AMPLIAÇÃO DE ESCOPO ........ NENHUMA no fechamento da Fase 6
```

### 7.3 Consequência contratual para B5 / SG-B — e somente ela

O critério de aceite de **§28 #13** é *"pino, brilho e holofote coincidem; barra lateral
medida"*. O achado incide **exatamente** sobre esse critério. Adjudicação:

| cenário | atingido pelo achado? | consequência |
|---|---|---|
| §28 **#12** (mapa, retrato e paisagem) | **NÃO** | segue adjudicável normalmente |
| §28 **#13** (tour) — parcela SG-B, `TK-B-019` | **SIM** | **adjudicação suspensa**, vira **comparativa V1↔V2** |
| §28 **#14** (20 histórias, 3 faixas, antes/depois) | **NÃO** | segue adjudicável normalmente |
| §28 **#17** (regressão) — parcela SG-B, `TK-B-045` | **NÃO** | segue adjudicável normalmente |

Regra de adjudicação de **#13** depois de V2, fixada **antes** de olhar V2 para não haver
acomodação de resultado:

| V2 comparado a V1 | leitura causal | veredito de #13 (parcela SG-B) |
|---|---|---|
| **idêntico** | R2 não regride nem melhora o tour; o defeito é independente da geometria do mapa | **NÃO CONCLUSIVO por defeito preexistente** — escalado à fase proprietária; **não** é FAIL de SG-B e **não** é PASS |
| **pior** | R2 tem participação causal | **FAIL de SG-B** — regressão real, volta ao ciclo |
| **melhor / corrigido** | R2 corrigiu colateralmente | **PASS** de #13, registrado com a ressalva |

Nota de honestidade causal, sem ampliar escopo: parte dos alvos do tour vive **sobre o mapa**,
cuja geometria é território de R2. É por isso que a adjudicação de #13 **precisa** ser
comparativa — não porque haja suspeita registrada contra R2, mas porque só a comparação separa
"defeito de onboarding" de "efeito de âncora".

```text
B5_CONTRACT_IMPACT = §28 #13 (parcela SG-B) suspenso até V2, com regra de adjudicação
                     fixada acima. §28 #12, #14 e #17 (parcela SG-B) inalterados.
                     F6-SG-B permanece PENDENTE · NÃO CONCEDIDO AINDA.
```

---

## 8. Bloco autônomo entre V1 e V2 — executado

Disparado **somente após** o relato humano de conclusão de V1, com a câmera desligada e sem
nenhuma ação humana. Nenhum `pm clear`, nenhum `uninstall`, nenhum `restore`, nenhum TAR,
nenhum `adb input` para navegação.

### 8.1 Troca de binário

```text
adb install -r NEW-c22b43b9-development.apk   →  Performing Streamed Install / Success
bytes 227.650.294 · 10,6 s · exit 0
```

Preservação de dados **verificada nos dois lados da troca**:

| leitura | antes | depois | veredito |
|---|---|---|---|
| `ceDataInode` | `137433` | `137433` | inalterado |
| `deDataInode` | `127446` | `127446` | inalterado |
| `firstInstallTime` | `2026-08-10 12:03:42` | `2026-08-10 12:03:42` | inalterado |
| `lastUpdateTime` | `2026-08-18 20:07:05` | `2026-08-19 14:16:51` | atualizado (esperado) |
| `versionCode` | `1` | `1` | sem rebaixamento |
| `flags` | sem `DEBUGGABLE` | **`DEBUGGABLE`** | development build ativo |

### 8.2 Inventário PRE canônico — `run-as`, após o `install -r` e **antes** da primeira abertura

`run-as` passou a funcionar (`uid=10364(u0_a364)`), como previsto em §4.6.

**Acervo persistido = 3 entradas lógicas · 6 blobs** — sendo **1 obra visual** de
"Minhas artes" (Ateliê) e **2 desenhos de Colorir**. Rótulo corrigido pelo fundador; ver §9.4.

| origem | obra | arquivo | bytes | md5 |
|---|---|---|---:|---|
| Ateliê | `art_1786479103982_6079` | `..._preview.jpg` | 92.231 | `1bc61a1f1e2b0b0e37660a4fdf306af4` |
| Ateliê | `art_1786479103982_6079` | `..._thumb.jpg` | 15.336 | `767a8e5fab1299c75f6654fa62da4413` |
| Colorir | `creation / light.b` | `_ptf_drawing60_screation_alight.b.png` | 914.002 | `743f6d4ec30e408105048366627d841f` |
| Colorir | `creation / light.b` | `..._alight.b.logical.png` | 386.880 | `74c92b51348f3d7538ee9aedead5d340` |
| Colorir | `creation / living_world.a` | `..._aliving_world.a.png` | 124.664 | `de4d0a3b246d58e208d7230a24b2a767` |
| Colorir | `creation / living_world.a` | `..._aliving_world.a.logical.png` | 48.098 | `85d1b2f50fd3e1df3af1c4e09a345600` |

Índices correspondentes em `AsyncStorage` (`databases/RKStorage`, md5 `546d5200…07491c`,
61.440 B, cópia binária conferida no host):
`ptf_atelier_arts_v1_index` com **1** entrada · `@ptf_drawing60_screation_alight` e
`@ptf_drawing60_screation_aliving_world`.

> O md5 do `RKStorage` é **referência, não critério** — o banco muda legitimamente com o uso.
> O critério `C-B5-6` são os **6 blobs** e as **3 entradas de índice**.

Evidências salvas no *scratchpad* da sessão: `files_ls.txt`, `md5_ptf_blobs.txt`,
`md5_db_snapshots.txt`, `RKStorage.pre.db`, `MANIFESTO_PRE.txt`.

### 8.3 Metro, `reverse` e verificação do runtime

```text
Metro ......... npx expo start --dev-client --port 8081 (worktree em ad01365, árvore limpa)
                /status → "packager-status:running"
reverse ....... adb reverse tcp:8081 tcp:8081 → "UsbFfs tcp:8081 tcp:8081"
bundle ........ GET /index.bundle?platform=android&dev=true → HTTP 200 · 17.402.326 B · 69,2 s
```

O *bundle* servido contém os símbolos de R2 — `MAP_ANCHOR_FRAMING` (4), `getStoryAnchor` (4),
`regionTop` (9), `comece_aqui` (18), `navSidebarWidth` (5). Isto é `CORRECT_JS_HEAD_PATH`
provado **ao vivo**, pelo mesmo servidor que o aparelho vai consumir, e deixa o cache do Metro
quente para que a primeira abertura de V2 seja rápida.

**Verificação de ponta a ponta**, feita com a câmera desligada e depois desfeita: abertura pelo
*deep link* contratado
`pequenostracosdefe://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081` →
`topResumedActivity = …/.MainActivity`, `ReactNativeJS: Running "main"`, sem erro de JS e sem
*red box*. O próprio app registrou:

```text
[AppNavigator] faixa = tablet (sidebar à esquerda) · largura=823dp · montagem #1
[PTF_PERF_SAMPLE] terminal=first_layout · route=Home · firstLayoutMs=3200
```

— confirmando **ao vivo** a faixa **MÉDIA** a 823dp, exatamente a geometria congelada do
comparador Q6.

Depois da verificação: `am force-stop` (não toca em dados; **não** é `pm clear`), para que V2
comece com abertura fria filmada. Os **6 blobs foram re-hasheados após essa abertura e
permanecem idênticos** ao inventário PRE — corroboração antecipada de `C-B5-6`, sem substituir
o inventário POS de §6.4.

O `DevLauncher` já lista `http://localhost:8081` como servidor recente (nome "Beni"), de modo
que o caminho humano de abertura em V2 está provado disponível.

### 8.4 Ruído de log registrado, sem consequência para B5

`E/DevLauncherController: Failed to hide splash screen · ClassNotFoundException:
expo.modules.splashscreen.SplashScreenManager`. É do **development client**, ocorre antes do JS
subir, é capturado e não impede a carga. Não pertence a nenhum dos quatro cenários de B5
(#12, #13, #14, #17-SG-B). Registrado para rastreabilidade, **sem** ampliação de escopo.

---

## 9. V2 executado — relato humano, comparação do tour e correção semântica do acervo

### 9.1 Estado

```text
V2_STATUS = CONCLUÍDO — executado normal e integralmente, conforme §6.3
Runtime de V2 = development client servido pelo Metro desta worktree, HEAD ad0136555c…
Nenhuma ação adicional no tablet após o encerramento da gravação (relato do fundador)
```

Confirmação independente no `logcat`, que **não** depende do relato humano — abertura fria de
V2 às `15:06:23`, pid `22242`:

```text
[AppNavigator] faixa = tablet (sidebar à esquerda) · largura=823dp · ainda na montagem #1
[PTF_PERF_SAMPLE] terminal=first_layout · route=Home · fontReason=loaded · routeReason=end
                  firstLayoutMs=3237 · bufferDropped=0
```

Na janela inteira de V2 **não há** erro de JS, *red box*, `Fatal` nem `ExceptionsManager`.

### 9.2 Mapa, histórias e responsividade — relato humano

```text
NOVO PROBLEMA = NENHUM
```

Relato literal: abertura do mapa, retrato, paisagem, 20 histórias, navegação e demais
observáveis executados **normalmente**. Nenhuma discordância declarada contra a coluna
"posição esperada" do **Anexo A**.

### 9.3 Tour do Beni — comparação V1 ↔ V2

```text
TOUR_V2_VS_V1 = IGUAL
```

Relato literal: o mesmo problema persiste; **nenhuma piora atribuível a R2**; e — palavras do
fundador — isso **não** é correção e **não** é `PASS` do tour.

Aplicação da regra congelada em **§7.3**, fixada **antes** de olhar V2 exatamente para impedir
acomodação de resultado:

| linha da regra | condição | veredito |
|:---:|---|---|
| **acionada** | **idêntico** | **NÃO CONCLUSIVO por defeito preexistente** — sem `FAIL` de SG-B e sem `PASS` fabricado |
| não acionada | pior | (seria `FAIL` de SG-B) |
| não acionada | melhor | (seria `PASS` com ressalva) |

Leitura causal que a comparação autoriza — e **somente** ela: o defeito existe **antes** e
**depois** de R2, com geometria de mapa diferente dos dois lados da fronteira. Logo o defeito
**não é função da âncora do mapa**; é independente de F6-R2. Isso é o que a comparação prova.
Não prova, e não pretende provar, qual é a causa real do defeito.

```text
DEFEITO ........... ícones das etapas do tour e marcações/indicações/spotlights mal posicionados
FASE PROPRIETÁRIA . onboarding/tour — permanece lá, como já classificado
AÇÃO NESTE CICLO .. NENHUMA correção. Nenhuma reinterpretação como autorização de alterar
                    onboarding. Nenhum PASS fabricado. Nenhuma ampliação de escopo.
```

### 9.4 Acervo — correção semântica ditada pelo fundador

```text
VISUAL_MINHAS_ARTES = 1 OBRA
```

A revisão B5-R3 rotulou o inventário PRE como *"Acervo = 3 obras · 6 blobs"*. O rótulo
**conflagra duas camadas distintas** e foi corrigido pelo fundador. As três camadas reais:

| camada | o que é | quantidade |
|---|---|---:|
| **visual — "Minhas artes"** | obras do **Ateliê**, exibidas como card | **1** |
| **lógica — persistência** | 1 índice de Ateliê + 2 chaves de **Colorir** (`drawings60`) | **3** |
| **física — disco** | arquivos em `files/ptf_blobs/` (`preview` + `thumb`; `.png` + `.logical.png`) | **6** |

As 2 entradas de Colorir **não são** cards de "Minhas artes": têm semântica própria, de desenho
colorido, e nunca foram contadas como obra do Ateliê pelo produto.

> **Não há divergência a apurar** entre `1 obra visual` e `3 entradas lógicas` — são camadas
> diferentes do mesmo acervo, e o número correto de cada uma é o registrado acima. O rótulo de
> §8.2 foi corrigido nesta revisão, e o manifesto `MANIFESTO_PRE.txt` do *scratchpad* também.

O critério **C-B5-6** continua sendo o que sempre foi: **6 blobs** e **3 entradas de índice**
idênticos antes e depois de R2 — e é isso, não a contagem de cards, que §10.1 verifica.

---

## 10. Fechamento autônomo — executado depois de V2

Executado com a câmera desligada, **sem nenhuma ação física nova**: apenas leitura por `run-as`,
leitura de `logcat` e conferência de arquivos já existentes no host. Nenhum `pm clear`, nenhum
`uninstall`, nenhum `restore`, nenhum TAR, nenhum `adb input`. Nenhuma correção de tour. Nenhuma
ampliação de escopo.

### 10.1 Inventário POS e comparação PRE/POS — `C-B5-6`

Capturado por `run-as` após o encerramento de V2, com o app ainda no ar (pid `22242`). Estrutura
de diretórios idêntica à do PRE.

**Blobs — 6/6 idênticos**, mesmo md5, mesmo tamanho, mesmo `mtime`:

| origem | arquivo | bytes | md5 (PRE = POS) | veredito |
|---|---|---:|---|:---:|
| Ateliê | `art_1786479103982_6079_preview.jpg` | 92.231 | `1bc61a1f1e2b0b0e37660a4fdf306af4` | **=** |
| Ateliê | `art_1786479103982_6079_thumb.jpg` | 15.336 | `767a8e5fab1299c75f6654fa62da4413` | **=** |
| Colorir | `_ptf_drawing60_screation_alight.b.png` | 914.002 | `743f6d4ec30e408105048366627d841f` | **=** |
| Colorir | `_ptf_drawing60_screation_alight.b.logical.png` | 386.880 | `74c92b51348f3d7538ee9aedead5d340` | **=** |
| Colorir | `_ptf_drawing60_screation_aliving_world.a.png` | 124.664 | `de4d0a3b246d58e208d7230a24b2a767` | **=** |
| Colorir | `_ptf_drawing60_screation_aliving_world.a.logical.png` | 48.098 | `85d1b2f50fd3e1df3af1c4e09a345600` | **=** |

**Índices — 3/3 idênticos.** A comparação aqui é **byte a byte do valor armazenado**, não do
banco: os dois `RKStorage` foram copiados em binário para o host e os valores extraídos e
hasheados separadamente.

| chave | bytes | md5 do valor (PRE = POS) | veredito |
|---|---:|---|:---:|
| `ptf_atelier_arts_v1_index` | 298 | `40c0cde17d3a…` | **=** |
| `@ptf_drawing60_screation_alight` | 2.437 | `3f3465a7aaf4…` | **=** |
| `@ptf_drawing60_screation_aliving_world` | 20.894 | `5cc95f1b8773…` | **=** |

O índice do Ateliê, lido literalmente no POS, tem **exatamente uma** entrada —
`art_1786479103982_6079`, *"Desenho de fé"*, `createdAt 2026-08-11T20:11:43.982Z`,
`updatedAt 2026-08-18T19:03:50.525Z`. Isto **confirma no dado** o `VISUAL_MINHAS_ARTES = 1 OBRA`
relatado pelo fundador em §9.4: 1 card em "Minhas artes", e o `updatedAt` anterior a toda esta
campanha física.

**Banco inteiro — referência, não critério**, como já registrado em §8.2:

```text
RKStorage PRE   61.440 B   md5 546d52008f653c414e90dd2c1307491c
RKStorage POS   61.440 B   md5 a8082afa299c6c0c2ac2be0f09a9f927     (diferente · esperado)
```

O banco muda legitimamente com o uso — o app foi aberto, navegou e gravou telemetria entre um
snapshot e outro. O que **não** pode mudar são os 6 blobs e as 3 entradas de índice, e nenhum
deles mudou.

```text
C-B5-6 = PASS   (6/6 blobs idênticos · 3/3 índices idênticos · nenhuma obra criada,
                 movida ou apagada por F6-R2)
```

Corroborado pelo caminho estático já provado em **§3.3**: os três arquivos de produto alterados
por `fec7bcb` **não referenciam** `AsyncStorage`, `expo-file-system`, `drawingStorage` nem
`atelierStorage` — não existe código introduzido por R2 capaz de tocar o acervo. Prova estática e
prova dinâmica concordam.

Evidências salvas no *scratchpad*: `B5_INVENTARIO_POS/` com `files_ls.txt`, `md5_ptf_blobs.txt`,
`RKStorage.pos.db`, `logcat_faixas.txt` e `MANIFESTO_POS.txt`.

### 10.2 Matriz 5×3 preenchida — `C-B5-5`

Cada célula declara **como** foi provada, conforme a classificação `A`/`B`/`C`/`D` congelada em
§5.4, e é conferida contra a coluna "posição esperada" do **Anexo A**.

| consumidor \ faixa | COMPACTA `<600dp` | MÉDIA `600–899dp` | EXPANDIDA `>=900dp` |
|---|:---:|:---:|:---:|
| pino | `B` **PASS** | `C` **PASS** | `C` **PASS** |
| alvo de toque | `B` **PASS** | `C` **PASS** | `C` **PASS** |
| brilho | `B` **PASS** | `C` **PASS** | `C` **PASS** |
| câmera | `B` **PASS** | `C` **PASS** | `C` **PASS** |
| âncora exposta | `A` **PASS** | `A` **PASS** | `A` **PASS** |

```text
15/15 células adjudicadas · 0 discordâncias · A=3 · B=4 · C=8 · D=0
```

**Como cada classe foi provada, sem transferência de crédito entre elas:**

- **`A` (3 células) — prova automática.** `MAP_ANCHOR_FRAMING = 0.5` é definição única, sem
  ramificação por faixa, e o alvo é `anchor.contentY − viewportH × MAP_ANCHOR_FRAMING`, **sem
  parcela somada** (§3.2). Vale para qualquer largura, inclusive `<600dp`. Já verde em `60/60` na
  matriz aritmética e nos `34/34` focados. Não há pixel envolvido.

- **`C` (8 células) — observação física em V2.** O aparelho entrega as duas faixas
  **nativamente**: retrato `823dp` → MÉDIA, paisagem `1317dp` → EXPANDIDA, com paisagem
  provadamente destravada (§4.4). A faixa MÉDIA foi confirmada **pelo próprio app** no `logcat`
  (`faixa = tablet · largura=823dp`); a faixa EXPANDIDA decorre da configuração do aparelho
  (`sw823dp-w823dp-h1317dp`, §4.1) somada à rotação executada e relatada — o `[AppNavigator]`
  registra apenas na montagem, por isso não há linha de `logcat` para a rotação, e isso está
  dito aqui em vez de suposto. Relato de V2: nenhum novo problema.

- **`B` (4 células) — comparador Q6, conferido agora.** O comparador de `C:\tmp\ptf_sgb_q6_comparator`
  foi re-hasheado nesta sessão e está **byte a byte igual** ao registro congelado do artefato 81:
  `compact_050.png` · 3.043.388 B · `SHA256 A15B9D7E…31BA0`. Ele renderiza `390 × 844dp`,
  `contentW = 390`, viewport livre `696dp`, assets canônicos, **fator 0,50** — e desenha, na
  **mesma coordenada** `(cx, cy)`, o **brilho** (halo em `r + 12`), o **pino** (círculo em `r`) e
  o **alvo de toque** (`markerSize = 58`), com a **câmera** em `anchorScreenY`. O `manifest.json`
  fecha a identidade aritmética nas três faixas:

  | faixa | viewport livre | `anchorScreenY` | `topo(70) + vp × 0,50` |
  |---|---:|---:|---:|
  | compacta | 696 | 418,0 | `70 + 348,0` = **418,0** |
  | média | 1.247 | 693,5 | `70 + 623,5` = **693,5** |
  | expandida | 753 | 446,5 | `70 + 376,5` = **446,5** |

  Ou seja: a mesma regra de âncora que as células `C` observaram fisicamente é a que o comparador
  renderiza em `390dp`. **O comparador continua `NÃO CANÔNICO`** — ele não substitui aparelho, e
  esta é precisamente a razão de as células serem `B` e não `C`.

**A faixa COMPACTA não foi elevada a `C`.** A regra 3 de §5.4 permitia a elevação **se** o Split
View levasse a janela abaixo de `600dp`. O `logcat` da campanha inteira contém **apenas três**
linhas de faixa, todas `faixa = tablet · largura=823dp` — **nenhuma** `faixa = phone`. Logo a
condição de elevação **não foi satisfeita** e as quatro células permanecem `B`. Não se fabrica
`PASS` físico onde só houve comparador, e o caminho inverso (`C` → `B`) segue proibido.

**Leitura literal de `C-B5-5`, declarada em vez de silenciada.** O critério pede "cada uma com
captura". As 8 células `C` têm captura no vídeo V2; as 4 células `B` têm captura em arquivo
(`compact_050.png`, hash conferido); as 3 células `A` **não têm pixel** — sua "captura" é a saída
numérica determinística do módulo real, exatamente como §5.4 regra 1 estabeleceu e o fundador
aprovou na reconciliação. Não é gap novo: é a classificação já aprovada, dita em voz alta.


### 10.3 Adjudicação individual — §28 #12

**Critério (`C-B5-1`):** *mapa abre em tablet, retrato e paisagem; câmera acerta a mira; sem os
56pt fantasma.*

| parcela do critério | evidência | veredito |
|---|---|:---:|
| abre em **tablet** | SM-X510, aparelho da campanha | ✔ |
| **retrato** | `823dp` → MÉDIA, confirmado pelo app no `logcat`; V2 sem problema | ✔ |
| **paisagem** | `1317dp` → EXPANDIDA, orientação destravada provada offline (§4.4); rotação executada em V2 | ✔ |
| **câmera acerta a mira** | relato de V2 normal + identidade `anchorScreenY = topo + vp × 0,50` (§10.2) + `60/60` aritmético | ✔ |
| **sem os 56pt fantasma** | §3.2: nenhuma parcela somada; `0.58` inexistente nos arquivos de mapa; `56` só no comentário da linha 304 de `AdventureMapScreen.js`, documentando a compensação **removida** | ✔ |

```text
SECTION_28_12_RESULT = PASS (parcela executável, tablet Android)
                       GAP-B5-1 (parcela literal iPad/iOS) permanece ABERTO — nunca PASS
```

O `GAP-B5-1` **não** é convertido em `PASS` pelo resultado do tablet, e **não** é convertido em
`FAIL` pela ausência de aparelho iOS.

### 10.4 Adjudicação individual — §28 #13

**Critério (`C-B5-2`):** *tour completo em telefone e tablet; pino, brilho e holofote coincidem;
barra lateral medida.*

O achado do tour incide **exatamente** sobre a parcela central deste critério. A regra
comparativa foi congelada em §7.3 **antes** de V2 e a comparação deu `IGUAL` (§9.3).

```text
SECTION_28_13_RESULT = NÃO CONCLUSIVO POR DEFEITO PREEXISTENTE
                       · NÃO é FAIL de SG-B  — o defeito existe no binário PRÉ-R2 (visto em V1)
                       · NÃO é PASS          — o comportamento observado não satisfaz o critério
                       · ESCALADO à fase proprietária de onboarding/tour
                       · GAP-B5-2 (parcelas literais telefone + iPad) permanece ABERTO
```

Sub-parcela **"barra lateral medida"**, provada de forma independente do tour e registrada como
tal, sem alterar o veredito do cenário: o app declarou `faixa = tablet (sidebar à esquerda) ·
largura=823dp`, e a geometria do comparador usa `sidebar 180dp → contentW 643` em `823dp` e
`sidebar 240dp → contentW 1077` em `1317dp` — coerente com `navSidebarWidth = { rail: 180,
full: 240 }` de `src/theme/tokens.js`. **Isto não converte #13 em `PASS`**; apenas evita que uma
parcela comprovada seja indevidamente arrastada para o não conclusivo.

### 10.5 Adjudicação individual — §28 #14

**Critério (`C-B5-3`):** *as 20 histórias, três faixas, antes/depois; nenhum deslocamento
inaceitável.*

| parcela | evidência | veredito |
|---|---|:---:|
| **20 histórias** | percorridas em V1 e em V2, na ordem do mapa | ✔ |
| **antes/depois** | V1 = `6f54b196` (precede R2) · V2 = `ad01365` (contém R2) — fronteira real de binário | ✔ |
| **três faixas** | MÉDIA e EXPANDIDA físicas (`C`); COMPACTA por comparador (`B`), não elevada | ✔ com classe declarada |
| **nenhum deslocamento inaceitável** | relato de V2: `NOVO PROBLEMA = NENHUM`; nenhuma célula da matriz em discordância | ✔ |

```text
SECTION_28_14_RESULT = PASS (parcela executável)
                       faixa COMPACTA adjudicada como B (comparador), explicitamente NÃO física
```

### 10.6 Adjudicação individual — §28 #17, parcela SG-B

**Critério (`C-B5-4`):** *regressão: nada mudou fora do escopo do mapa.*

| parcela | evidência | veredito |
|---|---|:---:|
| acervo intacto | `C-B5-6 = PASS` — 6/6 blobs e 3/3 índices idênticos (§10.1) | ✔ |
| navegação e histórias | V2 normal, 20 histórias, sem novo problema | ✔ |
| runtime saudável | sem erro de JS, sem *red box*, `bufferDropped = 0`, `terminal = first_layout` | ✔ |
| áreas protegidas | `CN-8` / `TK-B-046` — nenhum commit de F6-R2 toca área protegida (§3.1) | ✔ |
| tour | **fora do escopo do mapa** e **preexistente** (visto em V1, binário PRÉ-R2) → não é regressão de R2 | ✔ (não conta como regressão) |

```text
SECTION_28_17_SG_B_RESULT = PASS (parcela executável, tablet Android)
                            GAP-B5-3 (telefone Android físico) permanece ABERTO
```

### 10.7 Evidence gaps governados — estado final

| id | escopo | estado | tratamento |
|---|---|:---:|---|
| `GAP-B5-1` | §28 #12 — parcela literal **iPad / iOS** | **ABERTO** | substância executada no tablet Android; parcela iPad exige aceite humano próprio |
| `GAP-B5-2` | §28 #13 — parcelas literais **telefone** e **iPad** | **ABERTO** | soma-se ao não conclusivo do tour; exige aceite humano próprio |
| `GAP-B5-3` | §28 #17 (SG-B) — **telefone Android** físico | **ABERTO** | faixa compacta coberta por `B`; o **aparelho** telefone permanece gap |

Os três **não viram `PASS`**, **não viram `FAIL`** e **não herdam** o aceite de SG-A (artefato 82
§5 item 4). Cada um exige aceite humano próprio no portão SG-B. A ausência do aparelho literal
**não** é convertida em falha do produto, e a aquisição de hardware foi **dispensada pelo
fundador** — nenhum requisito novo de hardware é criado aqui.

### 10.8 Recálculo de F6-SG-B

| item | critério | resultado | ressalva |
|---|---|:---:|---|
| `C-B5-1` | §28 #12 | **PASS** | `GAP-B5-1` aberto |
| `C-B5-2` | §28 #13 | **NÃO CONCLUSIVO** | defeito preexistente + `GAP-B5-2` aberto |
| `C-B5-3` | §28 #14 | **PASS** | COMPACTA em `B` |
| `C-B5-4` | §28 #17 (SG-B) | **PASS** | `GAP-B5-3` aberto |
| `C-B5-5` | matriz 5×3 | **PASS** | 15/15, 0 discordâncias, classes declaradas |
| `C-B5-6` | inventário de obras | **PASS** | prova estática **e** dinâmica |
| `C-B5-7` | portão humano | **PENDENTE** | por definição — não é concedível pelo agente |

```text
B5_FINAL_RESULT = EXECUTADO E ADJUDICADO
                  5 critérios materiais em PASS · 1 NÃO CONCLUSIVO · 3 gaps governados abertos
                  nenhum FAIL · nenhum PASS fabricado

SG_B_MATERIAL_RESULT = PASS CONDICIONADO
                       condicionado a: (a) aceite humano dos 3 evidence gaps;
                                       (b) decisão humana sobre o não conclusivo de §28 #13;
                                       (c) confirmação da leitura de escopo de 10.9.
```

**`F6-SG-B` continua NÃO CONCEDIDO.** `TK-B-036` produz relatório `PASS`/`FAIL`, **não**
concessão — e não existe, até aqui, nenhuma decisão negativa do fundador.

### 10.9 Uma leitura de escopo que o agente **não** decide sozinho

`C-B5-5` diz que **qualquer** discordância impede a apresentação de F6-SG-B. A adjudicação acima
repousa numa leitura de escopo que precisa ser confirmada, e por isso está aqui e não escondida:

> a linha **`brilho`** da matriz é o **halo do pino do mapa** — consumidor de `getStoryAnchor`,
> renderizado na mesma coordenada do pino — enquanto o **`holofote` do tour** é overlay do
> onboarding, que aponta elementos de interface. São objetos distintos.

É essa distinção que permite a §7.3 conter o achado em **#13** e manter **#12**, **#14** e
**#17** adjudicáveis. Se o fundador ler os dois como o **mesmo** objeto, então a linha `brilho`
da matriz está em discordância e **a apresentação de F6-SG-B fica impedida** por `C-B5-5`. A
decisão é dele; o agente apenas declara a dependência.

---

## 11. HUMAN GATE F6-SG-B — decisão explícita do fundador

> **Nota de custódia.** O bloco abaixo é o portão **como foi apresentado** ao fundador, preservado
> literalmente. Ele foi **respondido** em **§12** — `STOP_HUMAN_DECISION` está **superado**. Nada
> aqui foi reescrito para acomodar a decisão.

```text
B5_STATE ................... CONCLUÍDO · V1 + bloco autônomo + V2 + fechamento executados
MINIMUM_REQUIRED_VIDEOS .... 2 · executados 2 · vídeos adicionais exigidos: 0
ADB ........................ AUTORIZADO · RX2XC003LTJ = device
MATRIX_5X3 ................. 15/15 adjudicadas · 0 discordâncias · A=3 · B=4 · C=8 · D=0
C-B5-6 ..................... PASS · 6/6 blobs e 3/3 índices idênticos
§28 #12 .................... PASS (executável)          + GAP-B5-1 aberto
§28 #13 .................... NÃO CONCLUSIVO (preexistente) + GAP-B5-2 aberto
§28 #14 .................... PASS (executável)
§28 #17 (SG-B) ............. PASS (executável)          + GAP-B5-3 aberto
SG_B_MATERIAL_RESULT ....... PASS CONDICIONADO
F6_SG_B .................... NÃO CONCEDIDO · aguarda decisão humana explícita
STOP_TYPE .................. STOP_HUMAN_DECISION
```

**Nada mais é executável pelo agente.** As três perguntas abaixo são do fundador e só dele:

1. **Aceitar os três evidence gaps governados** (`GAP-B5-1` iPad · `GAP-B5-2` telefone+iPad ·
   `GAP-B5-3` telefone), registrando-os como aceites conscientes de campanha — ou recusá-los.
2. **Decidir sobre §28 #13**: manter o **NÃO CONCLUSIVO** com o defeito escalado à fase
   proprietária de onboarding/tour — ou tratá-lo de outra forma.
3. **Confirmar a leitura de escopo de §10.9** (`brilho` do mapa ≠ `holofote` do tour). Se a
   leitura for recusada, `C-B5-5` **impede** a apresentação de F6-SG-B.

Só depois dessas três respostas o subportão pode ser concedido, recusado ou devolvido ao ciclo.
O agente **não** concede.

### 11.1 Residuais

| # | residual | onde vive |
|---:|---|---|
| 1 | defeito do tour do Beni — ícones de etapa e spotlights mal posicionados; **preexistente**, não corrigido neste ciclo | fase proprietária de onboarding/tour |
| 2 | `GAP-B5-1` · `GAP-B5-2` · `GAP-B5-3` — abertos, aguardando aceite humano próprio | §10.7 |
| 3 | faixa COMPACTA **não** elevada a `C`: o Split View não levou a janela abaixo de `600dp` (nenhum `faixa = phone` no `logcat`); as 4 células permanecem `B` | §10.2 |
| 4 | ruídos benignos do *development client*: `SplashScreenManager ClassNotFoundException` e `ReactNoCrashSoftException: onWindowFocusChange … context is not ready` — não pertencem a #12/#13/#14/#17-SG-B | §8.4 |
| 5 | estado de sessão ainda ativo: Metro na `8081`, `adb reverse` ativo, app no ar (pid `22242`), *development build* instalado no lugar do preview | §8 |
| 6 | este artefato permanece **salvo no disco · untracked** — nenhum `git add` ocorreu | — |

### 11.2 Nota de portão de qualidade

Esta revisão altera **somente** documentação (`specs/**`). Nenhum arquivo do grafo executável foi
tocado — `App.js`, `index.js`, `src/**`, `babel.config.js`, `metro.config.js`, configuração Expo,
`package.json` e `package-lock.json` estão intactos, com a árvore de trabalho limpa em
`ad0136555c253210486040fb8cbb9d6a3015aeb8`. Pela regra de bundleabilidade do `AGENTS.md`,
**documentação pura não dispara** `npm run verify:runtime`. O `bundle` de R2 já foi, ainda assim,
provado ao vivo nesta campanha: `17.402.326 B` servidos e conferidos (§8.3).

---
## 12. Decisão do fundador no HUMAN GATE — `F6-SG-B` CONCEDIDO COM RESSALVAS

Ato humano explícito, registrado literalmente e **sem reinterpretação dos resultados**. Nenhum
veredito de §10 foi alterado por esta decisão: ela **decide sobre** os resultados, não os reescreve.

### 12.1 As três decisões

**1 · Evidence gaps — `ACEITOS`.**

```text
GAP-B5-1 (iPad / iOS em §28 #12) ............. ACEITO como gap consciente desta campanha
GAP-B5-2 (telefone + iPad em §28 #13) ........ ACEITO como gap consciente desta campanha
GAP-B5-3 (telefone Android em §28 #17-SG-B) .. ACEITO como gap consciente desta campanha
```

Palavras do fundador: **não converter em `PASS`**, **não converter em `FAIL`**, **não fabricar
cobertura física inexistente**. Os três permanecem **registrados e abertos** — aceitos, não
fechados. A aceitação é do **risco de evidência**, não da evidência.

**2 · §28 #13 — mantido `NÃO CONCLUSIVO POR DEFEITO PREEXISTENTE`.**

O comportamento do tour observado em V1 permaneceu equivalente em V2. Consequências ratificadas,
uma a uma: **não atribuir regressão à R2** · **não fabricar `PASS`** · **manter o defeito
registrado na fase proprietária de onboarding/tour** · **não corrigir agora** · **não ampliar
escopo**.

**3 · Leitura de `brilho` × `holofote` — `RATIFICADA`.**

```text
BRILHO   = halo do pino do mapa · consumidor da geometria e de getStoryAnchor
HOLOFOTE = overlay / spotlight do tour de onboarding
```

São **objetos distintos** para fins da matriz 5×3 e da adjudicação. Logo o achado do tour
**permanece contido em §28 #13** e **não contamina artificialmente** §28 #12, §28 #14 nem
§28 #17-SG-B. Esta ratificação satisfaz a dependência declarada em §10.9 — e é ela que sustenta,
retroativamente, a validade da linha `brilho` da matriz e das três adjudicações de `PASS`.

### 12.2 Concessão

```text
F6_SG_B = CONCEDIDO COM RESSALVAS
```

**Ressalvas obrigatórias, que acompanham a concessão e não são absorvidas por ela:**

| # | ressalva | estado |
|---:|---|---|
| 1 | `GAP-B5-1` | **ABERTO** |
| 2 | `GAP-B5-2` | **ABERTO** |
| 3 | `GAP-B5-3` | **ABERTO** |
| 4 | §28 #13 | **NÃO CONCLUSIVO POR DEFEITO PREEXISTENTE** |
| 5 | defeito do tour do Beni | **ABERTO** na fase proprietária de onboarding/tour |

O que a concessão **não** faz, dito para que nenhuma leitura futura o infira: não converte gap em
cobertura; não converte o não conclusivo de #13 em `PASS`; não corrige nem autoriza corrigir o
tour; não eleva a faixa COMPACTA de `B` para `C`; não amplia o escopo da Fase 6.

### 12.3 Lacre de B5 e de F6-SG-B

```text
B5_FINAL ....... CONCLUÍDO E LACRADO — V1 · bloco autônomo · V2 · fechamento autônomo
                 5 critérios materiais em PASS · 1 NÃO CONCLUSIVO · 3 gaps aceitos e abertos
SG_B_FINAL ..... CONCEDIDO COM RESSALVAS por ato humano explícito do fundador
TK-B-036 ....... CUMPRIDA — relatório entregue (§10) e concessão feita pelo humano, não pelo agente
OR-2 ........... SATISFEITO — as tasks `TK-C-*` deixam de estar bloqueadas pela ausência de SG-B
OR-1 ........... permanecia satisfeito desde a concessão de SG-A
```

`F6-SG-C` **não** é concedido por este lacre, `F6-SG-D` **não** é aberto, e a Fase 6 **permanece
aberta**. A ordem canônica `F6-SG-A → F6-SG-B → F6-SG-C → F6-SG-D` é preservada sem alteração.

Registro canônico paralelo: `D-FUND-F6-SG-B-HUMAN-GATE-FINAL-01` em `docs/DECISIONS.md`, no mesmo
protocolo documental usado na concessão de SG-A (`D-FUND-F6-SG-A-HUMAN-GATE-FINAL-01`, commit
`21121f2`). Commit de governança: `C-GOV1` — relatórios de subportão e evidências, **nunca** junto
de código.

---




## Anexo A — Referência aritmética por história (gerada de `src/services/mapAnchor.js`)


**Faixa compacta — referência aritmética `390dp` × viewport livre `696dp`**

altura de região `693dp` · conteúdo `2772dp` · `maxScroll 2076dp` · repouso `696×0,50 = 348dp` · abertura D12 (`creation`, `regionTop`) `2076dp`

| história | `xPx` | `contentY` | alvo de câmera |
|---|---:|---:|---:|
| `samuel_hears_god` | 265 | 644 | 296 |
| `josiah_young_king` | 211 | 520 | 172 |
| `solomon_wisdom` | 238 | 416 | 68 |
| `mary_says_yes` | 273 | 319 | 0 |
| `timothy_faith` | 176 | 256 | 0 |
| `jesus_temple` | 304 | 159 | 0 |
| `abraham_stars` | 320 | 1317 | 969 |
| `joseph_colorful_coat` | 250 | 1206 | 858 |
| `moses_red_sea` | 187 | 1116 | 768 |
| `ruth_naomi` | 296 | 1033 | 685 |
| `miraculous_catch` | 152 | 936 | 588 |
| `jonah_big_fish` | 304 | 845 | 497 |
| `david_goliath` | 269 | 2010 | 1662 |
| `jesus_children` | 250 | 1878 | 1530 |
| `daniel_lions` | 148 | 1809 | 1461 |
| `esther_queen` | 265 | 1712 | 1364 |
| `lost_sheep` | 183 | 1622 | 1274 |
| `good_samaritan` | 281 | 1545 | 1197 |
| `creation` | 285 | 2543 | 2076 |
| `noah` | 254 | 2335 | 1987 |

**Faixa média — referência aritmética `643dp` × viewport livre `1247dp`**

altura de região `1143dp` · conteúdo `4572dp` · `maxScroll 3325dp` · repouso `1247×0,50 = 623.5dp` · abertura D12 (`creation`, `regionTop`) `3325dp`

| história | `xPx` | `contentY` | alvo de câmera |
|---|---:|---:|---:|
| `samuel_hears_god` | 437 | 1063 | 439.5 |
| `josiah_young_king` | 347 | 857 | 233.5 |
| `solomon_wisdom` | 392 | 686 | 62.5 |
| `mary_says_yes` | 450 | 526 | 0 |
| `timothy_faith` | 289 | 423 | 0 |
| `jesus_temple` | 502 | 263 | 0 |
| `abraham_stars` | 527 | 2172 | 1548.5 |
| `joseph_colorful_coat` | 412 | 1989 | 1365.5 |
| `moses_red_sea` | 309 | 1840 | 1216.5 |
| `ruth_naomi` | 489 | 1703 | 1079.5 |
| `miraculous_catch` | 251 | 1543 | 919.5 |
| `jonah_big_fish` | 502 | 1394 | 770.5 |
| `david_goliath` | 444 | 3315 | 2691.5 |
| `jesus_children` | 412 | 3098 | 2474.5 |
| `daniel_lions` | 244 | 2983 | 2359.5 |
| `esther_queen` | 437 | 2823 | 2199.5 |
| `lost_sheep` | 302 | 2675 | 2051.5 |
| `good_samaritan` | 463 | 2549 | 1925.5 |
| `creation` | 469 | 4195 | 3325 |
| `noah` | 418 | 3852 | 3228.5 |

**Faixa expandida — referência aritmética `1077dp` × viewport livre `753dp`**

altura de região `1915dp` · conteúdo `7660dp` · `maxScroll 6907dp` · repouso `753×0,50 = 376.5dp` · abertura D12 (`creation`, `regionTop`) `5745dp`

| história | `xPx` | `contentY` | alvo de câmera |
|---|---:|---:|---:|
| `samuel_hears_god` | 732 | 1781 | 1404.5 |
| `josiah_young_king` | 582 | 1436 | 1059.5 |
| `solomon_wisdom` | 657 | 1149 | 772.5 |
| `mary_says_yes` | 754 | 881 | 504.5 |
| `timothy_faith` | 485 | 709 | 332.5 |
| `jesus_temple` | 840 | 440 | 63.5 |
| `abraham_stars` | 883 | 3639 | 3262.5 |
| `joseph_colorful_coat` | 689 | 3332 | 2955.5 |
| `moses_red_sea` | 517 | 3083 | 2706.5 |
| `ruth_naomi` | 819 | 2853 | 2476.5 |
| `miraculous_catch` | 420 | 2585 | 2208.5 |
| `jonah_big_fish` | 840 | 2336 | 1959.5 |
| `david_goliath` | 743 | 5554 | 5177.5 |
| `jesus_children` | 689 | 5190 | 4813.5 |
| `daniel_lions` | 409 | 4998 | 4621.5 |
| `esther_queen` | 732 | 4730 | 4353.5 |
| `lost_sheep` | 506 | 4481 | 4104.5 |
| `good_samaritan` | 775 | 4270 | 3893.5 |
| `creation` | 786 | 7028 | 6651.5 |
| `noah` | 700 | 6454 | 6077.5 |
