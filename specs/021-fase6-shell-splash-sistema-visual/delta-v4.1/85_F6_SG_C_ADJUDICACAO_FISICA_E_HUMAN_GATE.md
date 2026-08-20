# `85` — `F6-SG-C`: adjudicação da campanha física, `TK-C-046` e Portão Humano

> **Escopo deste artefato.** Adjudicar o **vídeo único** de `F6-SG-C` gravado pelo fundador no
> SM-X510, emitir `TK-C-046` e **parar no Portão Humano**. Este artefato **não concede
> `F6-SG-C`** — a concessão é ato humano explícito, como foi em `SG-A` e em `SG-B`.
> Nenhum código executável foi alterado. Nenhum vão foi convertido em `PASS`. Nenhum vão foi
> convertido em `FAIL`.

---

## 1. Estado de entrada e cadeia de custódia

| Item | Valor | Como foi provado |
|---|---|---|
| `HEAD` durante a gravação | `4a433a0452358ee26e49796d3377b9923dcb0130` | `git rev-parse HEAD` antes e depois — **igual** |
| Ramo | `feat/fase6-shell-splash` | `git rev-parse --abbrev-ref HEAD` |
| Árvore de trabalho | **limpa** antes e depois | `git status --porcelain` vazio nos dois momentos |
| Aparelho | SM-X510 · série `RX2XC003LTJ` | `adb devices` |
| Pacote | `com.valentedev.pequenostracosdefe` | `dumpsys` |
| *Runtime* | *development build* `DEBUGGABLE`, instalado em `2026-08-19 14:16:51` | `dumpsys package` |
| JavaScript | servido pelo **Metro** no `HEAD` acima, via `adb reverse tcp:8081 tcp:8081` | *bundle* servido HTTP 200, 17.400.206 bytes |
| Rotação automática | **ligada** (`accelerometer_rotation=1`) antes e depois | `settings get system` |
| Estado inicial exigido | app **fechado** (`am force-stop`), retrato, tela do Android | §8.4 do artefato `84` |

**Custódia de `SD-8` — 6 *blobs*, PRE vs POS:**

```
1bc61a1f1e2b0b0e37660a4fdf306af4  files/ptf_blobs/atelier/art_1786479103982_6079_preview.jpg
767a8e5fab1299c75f6654fa62da4413  files/ptf_blobs/atelier/art_1786479103982_6079_thumb.jpg
743f6d4ec30e408105048366627d841f  files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.b.png
74c92b51348f3d7538ee9aedead5d340  files/ptf_blobs/drawings60/_ptf_drawing60_screation_alight.b.logical.png
de4d0a3b246d58e208d7230a24b2a767  files/ptf_blobs/drawings60/_ptf_drawing60_screation_aliving_world.a.png
85d1b2f50fd3e1df3af1c4e09a345600  files/ptf_blobs/drawings60/_ptf_drawing60_screation_aliving_world.a.logical.png
```

`diff` PRE × POS: **idênticos, 6/6, byte a byte**. O acervo do fundador **não foi tocado** pela
campanha. Nenhum `pm clear`, nenhum `uninstall`, nenhum `restore`, nenhum TAR, nenhum
`adb input` de navegação foi executado em momento algum.

**Evidência bruta preservada:** `logcat -v threadtime` contínuo, capturado do computador durante
toda a gravação — **23.373 linhas · 3.360.152 bytes · md5 `a6e08b83ad435a92aee74a9e6a804601`**.

---

## 2. Reconstrução forense da sessão — linha do tempo

Todas as linhas abaixo são do `logcat` da própria sessão. Horários do aparelho.

| Hora | Linha do `logcat` (resumida) | Passo do §8.4 |
|---|---|---|
| `16:53:22.677` | `Start proc 7430:com.valentedev.pequenostracosdefe/u0a364 for top-activity` | 2 — abrir o app |
| `16:53:23.675` | `Displayed …/.MainActivity: +1s045ms` (1ª janela) | 2 |
| `16:53:24.127` | `Displayed …/.MainActivity: +336ms` (2ª janela — fluxo normal do *dev client*) | 2 |
| `16:53:29.038` | `ReactNativeJS: Running "main" with {"rootTag":1,…,"fabric":true}` | 2 — *bundle* do Metro executado, **New Architecture** |
| `16:53:30.758` | `[shell] MainTabs MONTADO · montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 · pareado` | 3 |
| `16:53:30.759` | `[AppNavigator] faixa = tablet (sidebar à esquerda) · largura=823dp · ainda na montagem #1` | 3 |
| `16:53:30.820` | `[PTF_PERF_SAMPLE] {"route":"Home","firstLayoutMs":3186,"bufferDropped":0,…}` | 3 — **`HomeScreen` = `HubSurface`** |
| `16:54:05.124` | `[ProfileGuide][DEV] preload áudios do Perfil` | 7 — aba **Perfil** alcançada |
| `16:54:23.9` / `16:54:25.3` | `AudioTrack: setVolume(0.4,0.4)` + `stop(394/395)` — sons de toque | 8–9 |
| `16:54:24.074` | nova `ViewRootImpl` `VRI[MainActivity]@2e880d9` | 9 — tela de detalhe |
| `16:54:37.229` | `AudioTrack: stop(396)` — toque que abre o Livrinho | 10 |
| `16:54:37.324` | `[StoryBook][DEV] todas as 10 cenas têm som (autoplay contínuo)` | 10 — **`StoryBookScreen` = `ImmersiveSurface`** |
| `16:54:40.909` | `AudioTrack: stop(397)` | 11 — virar página |
| `16:54:41.9–42.05` | `CCodec: allocate(c2.sec.mp3.decoder.mpeg)` · `audio/mpeg` 44100 Hz mono — narração tocando | 10–11 |
| `16:54:42.735` | `VRI[MainActivity]@a3663a2` | 11 |
| **`16:54:49.105`** | `Computed rotation=ROTATION_90 (1) … oldRotation=ROTATION_0` | **12 — rotação** |
| **`16:54:49.161`** | `scheduleConfigurationChanged: ActivityRecord{244952379 …} state=RESUMED config={… sw823dp w1317dp h823dp 280dpi xlrg land …}` | **12 — faixa EXPANDIDA** |
| `16:55:20`–`16:56:17` | atividade sustentada do processo `7430` (206 linhas `Kumiho`, 54 `VRI@95fc99b`, 4 `AudioTrack`, 8 `CCodec`) | 13–17 — navegação em paisagem |
| **`16:56:17.746`** | `Computed rotation=ROTATION_0 (0) … oldRotation=ROTATION_90` | **18 — rotação de volta** |
| **`16:56:17.800`** | `scheduleConfigurationChanged: ActivityRecord{244952379 …} state=RESUMED config={… sw823dp w823dp h1317dp 280dpi xlrg port …}` | **18 — faixa MÉDIA** |
| `16:56:18.902` | última linha do processo (`ReactImageDownloadListener` — imagens re-dispostas em retrato) | 19 |
| daí em diante | silêncio do processo; app **RESUMED** no topo | 20 — parou de gravar |

**Janela ativa do app: `16:53:22` → `16:56:18`, ou seja `2 min 56 s`.**

### 2.1 Reconciliação com o tempo estimado — e por que ela fecha

O §8.4 estimou "cerca de 8 a 9 minutos". A sessão levou menos. **Isso não é sinal de roteiro
encurtado**, e a aritmética das pausas declaradas mostra por quê:

| Bloco | Pausas exigidas pelo roteiro | Janela observada no `logcat` | Folga |
|---|---|---|---|
| 1 — retrato (passos 1–11) | `3+5+4+4+4+4+3+5+5+4` = **41 s** + carga do app | `16:53:22` → `16:54:49` = **87 s** | +46 s |
| 2+3 — paisagem (passos 13–17) | `6+5+4+6+(5×3)` = **36 s** | `16:54:49` → `16:56:17` = **88 s** | +52 s |
| 4 — volta (passo 19) | **6 s** | `16:56:17` → fim | ≥ 6 s |

Cada bloco **excede** com folga o tempo mínimo que suas próprias pausas exigem, e a folga é
compatível com os toques e as transições. A estimativa de 8–9 min era generosa; **o roteiro cabe
no tempo observado**. Nenhum bloco foi executado abaixo do seu piso.

---

## 3. O que o `logcat` **prova**

### 3.1 Travessia real de faixa, nas duas direções

```
MÉDIA  (sw823dp  w823dp  h1317dp · port) → EXPANDIDA (sw823dp w1317dp h823dp · land)   16:54:49
EXPANDIDA (sw823dp w1317dp h823dp · land) → MÉDIA  (sw823dp  w823dp  h1317dp · port)   16:56:17
```

`823dp` está na faixa **MÉDIA** (600–899) e `1317dp` na **EXPANDIDA** (≥900). As duas faixas
alcançáveis neste aparelho foram **efetivamente habitadas**, com o app em primeiro plano e
`state=RESUMED`, em ambos os sentidos.

### 3.2 Nenhuma remontagem — `CN-6`, no nível do sistema **e** no nível do JavaScript

**Sistema.** As duas rotações produziram exatamente a mesma decisão do `WindowManager`:

```
Checking to restart com.valentedev.pequenostracosdefe.MainActivity:
  changed={CONFIG_ORIENTATION}
  handles={CONFIG_MCC, CONFIG_MNC, CONFIG_KEYBOARD, CONFIG_KEYBOARD_HIDDEN,
           CONFIG_ORIENTATION, CONFIG_SCREEN_LAYOUT, CONFIG_UI_MODE, CONFIG_SCREEN_SIZE}
  not-handles={}
```

`not-handles={}` nas **duas** ocorrências: não sobrou nenhuma mudança de configuração fora do que a
`Activity` declara tratar, logo **o sistema não recriou a `Activity`**. Um único
`ActivityRecord{244952379 … t898}` do início ao fim; zero `relaunch`, zero `destroy` da
`MainActivity` depois do arranque.

**JavaScript.** O instrumento de `TK-A-022` (`shellLifecycleTrace`) registrou **uma** montagem e
**nenhuma** desmontagem em toda a sessão:

```
[shell] MainTabs MONTADO · montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 · pareado
```

Busca em todo o `logcat` por `DESMONTADO`, `montagens #2..#9`, `ANOMALIA` e
`PAREAMENTO PENDENTE`: **zero ocorrências**. O `useEffect` que emite essas linhas tem dependências
`[]` — se `MainTabs` tivesse remontado, a desmontagem e a montagem #2 teriam aparecido. Não
apareceram. **A travessia de faixa foi re-renderização, não remontagem.**

### 3.3 Nenhuma falha

| Busca | Resultado |
|---|---|
| `FATAL EXCEPTION` · `AndroidRuntime:` · `beginning of crash` | **0** |
| `ANR in com.valentedev` | **0** |
| `Unhandled JS Exception` / RedBox | **0** |
| `ReactNoCrashSoftException` | **1**, às `16:53:24.221` |

A única ocorrência é `raiseSoftException(onWindowFocusChange(hasFocus="true")): Tried to access
onWindowFocusChange while context is not ready` — emitida **5 segundos antes** de o *bundle*
começar a rodar (`Running "main"` às `16:53:29.038`), no arranque a frio do Bridgeless. A própria
classe se chama `NoCrash`; não houve interrupção nem tela vermelha. **Ruído de arranque, não
defeito.**

### 3.4 Barra lateral ativa na faixa MÉDIA, por decisão do *hook*

```
[AppNavigator] faixa = tablet (sidebar à esquerda) · largura=823dp · ainda na montagem #1
```

A decisão de compor com barra lateral (e não com barra inferior) foi **tomada pelo aparelho, ao
vivo, a 823dp** — não inferida de código.

### 3.5 Três das quatro famílias de superfície, alcançadas em **retrato**

| Família | Prova | Hora |
|---|---|---|
| **Hub** (`HubSurface`) | `[PTF_PERF_SAMPLE] … "route":"Home"` → `HomeScreen` | `16:53:30.820` |
| **Imersiva** (`ImmersiveSurface`) | `[StoryBook][DEV] todas as 10 cenas têm som` → `StoryBookScreen` | `16:54:37.324` |
| **Editorial** (`EditorialSurface`) | **por necessidade causal** — ver abaixo | `16:54:24`–`16:54:37` |

**A prova causal da família Editorial.** `StoryBookScreen` só é alcançável por três rotas, e o
código as enumera: `StoryDetailScreen:557`, `PostStoryHubScreen:80` e `CongratsScreen:293`. A
terceira exige **concluir** uma história, o que é impossível nos 13 segundos entre o toque no mapa
(`16:54:24`) e a abertura do Livrinho (`16:54:37`). As outras duas — `StoryDetailScreen` e
`PostStoryHubScreen` — **são ambas `EditorialSurface`**. Qualquer caminho realmente percorrido
atravessou a família Editorial. A nova `ViewRootImpl` às `16:54:24.074` marca a tela intermediária.

A quarta família, **`GameSurface`, tem zero consumidores** — nenhuma tela do app a adota hoje.
Isso é **contrato**, não defeito: `TK-C-012` difere a migração de telas de jogo para `F12A`.

---

## 4. O que o `logcat` **não** prova — dito sem maquiagem

### 4.1 A travessia das famílias **em paisagem**

Os registros `[ProfileGuide][DEV]` e `[StoryBook][DEV]` são **de uma vez só** por tela — já haviam
disparado em retrato. Os passos 14–17 revisitaram `StoryDetail`, o mapa, `Início` e as cinco abas
**em paisagem**, e o `logcat` mostra atividade sustentada do processo naquele intervalo
(`16:55:20`–`16:56:17`), mas **não nomeia as telas**. Quem viu foi o fundador; a prova é o vídeo.

### 4.2 A **composição distinta** da barra lateral entre as duas faixas

`[AppNavigator]` só re-registra quando `isTablet` **muda**, e `isTablet = band !== COMPACT` — ou
seja, ele **não** dispara na travessia MÉDIA→EXPANDIDA, porque nas duas faixas o valor é `true`.
Esta limitação **já era conhecida e já foi ratificada** como `GAP-B5-2` em
`D-FUND-F6-SG-B-HUMAN-GATE-FINAL-01`. Nenhuma linha nova sobre isso apareceu, e nenhuma era
esperada.

O que o **código** diz sobre a diferença, e o que ela é exatamente:

```js
// src/components/TabletSidebar.js
const SIDEBAR_BAND_KEY = { [BANDS.MEDIUM]: 'tablet', [BANDS.EXPANDED]: 'tabletL' };
// src/theme/tokens.js
export const navSidebarRole  = { tablet: 'rail', tabletL: 'full' };
export const navSidebarWidth = { rail: 180, full: 240 };
```

A **única** diferença estrutural entre as duas faixas é a **largura**: `180dp` (`rail`) na MÉDIA e
`240dp` (`full`) na EXPANDIDA. Varredura do componente: nenhuma outra propriedade do render depende
de `papel` ou de `band`.

> **Errata do próprio roteiro.** O passo 16 do §8.4 pediu ao fundador que observasse a barra
> "mais larga **e com os nomes**, diferente do retrato". A parte "mais larga" está correta
> (180 → 240). A parte "com os nomes" **não distingue as faixas**: `tab.label` é renderizado nas
> **duas**. A dica foi imprecisa e isso é registrado aqui porque **muda o que o fundador foi
> induzido a procurar**. A pergunta correta, feita no §8, é apenas sobre a **largura**.

### 4.3 Os **cinco alvos guiados medidos** — `TK-C-043`

O componente registra os cinco alvos (`home.sidebarTab`, `adventures.sidebarTab`,
`atelier.sidebarTab`, `stars.sidebarTab`, `profile.sidebarTab`) — e o *smoke* (`TA-9`, `G-SID-1`)
já prova que eles **existem**. Mas `registerGuideTarget` só **mede** quando um guia roda, e o
roteiro do §8.4 **não roda o tour**. Portanto:

> **Correção de uma afirmação minha no artefato `84`.** O §8.2 daquele artefato disse que este
> vídeo fecharia a "parcela Android" de `TK-C-043` com "os cinco alvos **filmados**". **Filmar não
> é medir.** §27 pede *"vídeo do tour … com os alvos da barra lateral **medidos**"*, e nem o tour
> rodou, nem medida alguma foi produzida. `TK-C-043` **não** foi fechada nem em parcela.

### 4.4 Observações visuais do fundador

O fundador relatou: *"Nenhuma ação adicional foi realizada no tablet após o encerramento da
gravação"* — e **nenhuma observação visual**. O §8.4 instruiu explicitamente a relatar qualquer
coisa que *"travar, sumir, piscar errado ou voltar ao início sozinho"*. **Nada foi relatado.**

Isso é **ausência de anomalia relatada**, e é exatamente assim que fica registrado. **Não** é a
mesma coisa que uma confirmação visual positiva de composição, e não é tratada como tal em lugar
nenhum deste artefato.

---

## 5. Adjudicação, task por task

| Task / contrato | Veredito | Fundamento |
|---|---|---|
| `TK-C-039` — §28 #15 *portrait*, faixa MÉDIA | **PASS** | app percorrido a `sw823dp w823dp h1317dp port`, barra lateral decidida ao vivo a 823dp, três famílias alcançadas, zero falha |
| `TK-C-040` — §28 #15 *landscape*, faixa EXPANDIDA | **PASS (material) · pendente da vista do fundador quanto a "nenhuma coluna estreita cercada de vazio"** | a faixa EXPANDIDA foi habitada e navegada por 88 s sem falha; o **julgamento de vazio** é visual e é pergunta do §8 |
| `TK-C-062` — roteiro completo (retrato + paisagem + famílias + barra lateral + travessia) | **EXECUTADA** — deixa de ser `PENDENTE — SEM APARELHO` | o roteiro foi executado de ponta a ponta no SM-X510; o rótulo antigo nomeava o aparelho errado (artefato `84` §6) |
| `SD-1` caso 4 — orientação em tablet Android | **SATISFEITO POR VALIDAÇÃO FÍSICA** | rotação real nos dois sentidos, `RESUMED`, sem remontagem |
| `PLAN §33` | **ROTA (i) CUMPRIDA** · rota (ii) rejeitada pelo fundador | `D-FUND-F6-SG-C-PLAN-33-ROTA-I-01`; nenhuma dispensa foi criada |
| `CN-6` — sem remontagem na travessia | **PASS** | `not-handles={}` nas duas rotações **e** `montagens #1 · desmontagens 0` do início ao fim |
| `TK-C-042` — 4 famílias × 3 faixas (12 células) | **PARCIAL: 3 células com prova nomeada · 3 dependentes do vídeo · 3 no vão do telefone · 3 sem consumidor** | ver matriz abaixo |
| `TK-C-043` — §28 #16, alvos da barra lateral **medidos** | **NÃO SATISFEITA** (nem em parcela) | §4.3 — o tour não rodou; filmar ≠ medir; hardware literal do *owner* é **iPad** |
| §19.1 restrição 5 — composição distinta 600–899 × ≥900 | **AS DUAS FAIXAS FORAM CAPTURADAS · a distinção (180→240dp) depende da vista do fundador** | §4.2, com a errata do roteiro declarada |
| `TK-C-038` — §28 #17 + #1/#4/#7 em **telefone real** | **`BLOCKING_UNSATISFIED_REQUIREMENT`** (inalterado) | não há telefone; `EVIDENCE_GAP_ALLOWED = NÃO` |
| `TK-C-041` — §28 #6 *resize* / `SD-9` em **iPad** | **`BLOCKING_UNSATISFIED_REQUIREMENT`** (inalterado) | não há iPad; §33 proíbe substituir por Android |
| `TK-C-044` — verificação final dos *tokens* | **PASS** (reconferida neste `HEAD`) | artefato `23` §3 |
| `TK-C-045` — ausência de arquitetura paralela | **PASS** (reconferida neste `HEAD`) | artefato `23` §4 |

### 5.1 `TK-C-042` — a matriz depois do vídeo

| | COMPACTA `<600` | MÉDIA `600–899` | EXPANDIDA `≥900` |
|---|---|---|---|
| **Hub** | vão do telefone | **PASS** — `route:"Home"` às `16:53:30` | vídeo (passos 16–17) |
| **Editorial** | vão do telefone | **PASS** — causal, §3.5 | vídeo (passo 14) |
| **Imersiva** | vão do telefone | **PASS** — `[StoryBook][DEV]` às `16:54:37` | vídeo (passo 13, Livrinho em paisagem) |
| **Jogo** | sem consumidor | sem consumidor | sem consumidor |

**3 células com prova instrumentada · 3 células cobertas pelo vídeo e dependentes da vista do
fundador · 3 no vão do telefone · 3 sem consumidor por contrato (`TK-C-012` → `F12A`).**

A faixa COMPACTA continua **inalcançável** neste aparelho: o artefato `83` §10.2 registrou que o
*Split View* **não** leva a janela abaixo de 600dp, e §33 critério 6 equipara o multi-janela do
Android ao *Split View*. Repetir a tentativa seria exatamente a repetição que a ordem proíbe.

---

## 6. Os dois vãos, sem terceira via

```
PHONE_GAP = BLOCKING_UNSATISFIED_REQUIREMENT
IPAD_GAP  = BLOCKING_UNSATISFIED_REQUIREMENT
```

Inalterados pela campanha, e inalteráveis por ela: nenhum dos dois aparelhos existe, e **§33 é a
única cláusula de vão da Fase 6 — cobre apenas o caso 4 de `SD-1`**, que acabou de ser satisfeito
pela rota (i). Não há, em §27, §28, §19.1 ou nos *owners* `TK-C-038`/`041`/`043`, nenhuma cláusula
equivalente para iPad ou telefone. **Inventar uma seria fabricar contrato.**

**Isto não é `FAIL`.** Nada foi observado falhando em telefone ou iPad — não houve observação
alguma. É requisito **não satisfeito**. A única instância que pode conceder o subportão com esses
requisitos em aberto é o **fundador**, por ato humano explícito, como fez em `SG-A`
(`D-FUND-F6-SG-A-HUMAN-GATE-FINAL-01` — *"CONCEDIDO COM RESIDUAIS EXPLÍCITOS"*, onde a mesma
rodada `R6` permaneceu residual sem virar `PASS` nem `FAIL`).

---

## 7. `TK-C-046` — relatório de `F6-SG-C`

**Emitido.** O *owner* pede o relatório do subportão; ele **não** concede o subportão.

### 7.1 Critérios de saída de `F6-SG-C` (§27), um a um

| Critério de §27 | Estado | Evidência |
|---|---|---|
| `SD-1` — superfície adaptativa, incluindo o **caso 4** | **ATENDIDO** | §5 · rota (i) de §33 cumprida |
| `SD-2`, `SD-3`, `SD-4` | **ATENDIDOS na parcela automática; parcela física coberta pelo vídeo nas duas faixas alcançáveis** | `G-RSP-1..7`, `G-SID-1..4`, `G-BP-1` verdes + §2 |
| `SD-9` — *Split View* e *Slide Over* (**iPad**) | **NÃO ATENDIDO** | `IPAD_GAP` |
| `CN-1` — telefone não herda barra lateral | **ATENDIDO por prova estrutural; NÃO ATENDIDO fisicamente** | `G-SID-2` verde e a **forma** do *token* (`navSidebarRole` sem chave `phone`) impedem o caso; falta o vídeo em telefone |
| `CN-5` | **ATENDIDO** | *smoke* |
| `CN-6` — sem remontagem na travessia | **ATENDIDO, agora também fisicamente** | §3.2 |
| Vídeo do tour em **telefone e iPad** com alvos da barra lateral **medidos** | **NÃO ATENDIDO** | §4.3 · `PHONE_GAP` + `IPAD_GAP` |

### 7.2 Portões automáticos neste `HEAD`

| Portão | Resultado |
|---|---|
| `npm run bundle:check` (inclui `gate:platform-scope`) | **verde** |
| `npm run smoke` | **4970/4970 verde** |
| `npx expo-doctor` | **verde** |

Nenhum arquivo executável foi tocado desde então: `HEAD` e árvore idênticos antes e depois da
campanha (§1). Os portões continuam válidos e **não** precisaram ser reexecutados — a alteração
deste bloco é **documentação pura**.

### 7.3 Limitação declarada do próprio `TK-C-046`

O *owner* declara `SD-1` **não concedível** enquanto `TK-C-062` estiver `PENDENTE`.
**`TK-C-062` foi executada** (§5). **Essa limitação específica caiu.**

O que **permanece** aberto ao final de `TK-C-046`: `PHONE_GAP`, `IPAD_GAP`, `TK-C-038`,
`TK-C-041`, `TK-C-043` e a faixa COMPACTA de `TK-C-042`.

```
TK_C_046 = EMITIDO
F6_SG_C  = NÃO CONCEDIDO POR ESTE ARTEFATO
```

---

## 8. Portão Humano de `F6-SG-C` — o que só o fundador pode responder

Três perguntas visuais, todas cobertas pelo vídeo que já existe. **Nenhuma delas exige nova
gravação**; todas exigem apenas a vista de quem assistiu.

| # | Pergunta | Por que ela não pode ser respondida daqui |
|---|---|---|
| **Q1** | Em **paisagem** (passo 16), a **barra lateral ficou visivelmente mais larga** que em retrato? *(180dp → 240dp; os rótulos aparecem nas duas faixas — a diferença é só a largura)* | §4.2 — `[AppNavigator]` não re-registra entre MÉDIA e EXPANDIDA (`GAP-B5-2`, já ratificado) |
| **Q2** | Em **paisagem**, alguma tela apresentou **coluna estreita cercada de vazio**, ou o conteúdo ocupou a largura de forma coerente? *(passos 13–17: Livrinho, detalhe da história, mapa, Início e as cinco abas)* | `TK-C-040` e `SD-2`/`SD-3` pedem julgamento de composição, que nenhum log emite |
| **Q3** | Durante as **duas rotações** (passos 12 e 18), houve **piscada, salto, volta ao início ou perda de estado**? | o `logcat` prova que a `Activity` e o `MainTabs` **não** foram recriados; a **percepção** da transição é visual |

### 8.1 Material que o fundador leva ao portão

**Concedido pela campanha (material, instrumentado):**
`TK-C-039` · `TK-C-040` (parcela material) · `TK-C-062` · `SD-1` caso 4 · `PLAN §33` rota (i) ·
`CN-6` físico · 3 das 6 células capturáveis de `TK-C-042` · custódia `SD-8` intacta 6/6 ·
zero *crash*, zero ANR, zero RedBox.

**Aberto, sem conversão:**

| Item | Classificação |
|---|---|
| `TK-C-038` — regressão em telefone real | `BLOCKING_UNSATISFIED_REQUIREMENT` |
| `TK-C-041` — `SD-9` / §28 #6 em iPad | `BLOCKING_UNSATISFIED_REQUIREMENT` |
| `TK-C-043` — alvos da barra lateral **medidos** | **NÃO SATISFEITA** — nem parcela Android (§4.3) |
| `TK-C-042` — faixa COMPACTA (3 células) | herda o `PHONE_GAP` |
| `TK-C-042` — família Jogo (3 células) | **sem consumidor por contrato** (`TK-C-012` → `F12A`) — não é vão |
| `CN-1` físico | prova estrutural verde; prova física depende do telefone |

**Herdado de `SG-B`, ainda em custódia:** o defeito do tour observado no B5 continua **aberto na
sua fase proprietária** e **não** foi corrigido aqui — como ordenado.

### 8.2 O que espera do lado de `SG-D` — dito antes, não decidido aqui

Repetido do artefato `84` §10 porque muda o que "conceder `SG-C`" significa na prática:
a condição **7** de `PLAN §37` é *"campanha física do §28 completa, com vídeo, **em iPad**"*, e o
*owner* de `TK-D-001` diz *"uma única `NÃO ATENDIDA` ⇒ parecer (ii)"*. Com o iPad ausente,
`TK-D-001` marcaria a condição 7 como **`NÃO ATENDIDA`**, e `TK-D-005` emitiria o parecer **(ii)**
— *"`B2` continua bloqueado"*. **Isto é o contrato de `SG-D` lido em voz alta, não uma decisão
deste artefato**, e não é motivo para conceder nem para negar `SG-C`.

---

## 9. Estado de arquivos, com a distinção exigida

| Arquivo | Estado |
|---|---|
| `docs/DECISIONS.md` | **modificado no disco, não indexado** (bloco `D-FUND-F6-SG-C-PLAN-33-ROTA-I-01`, +26 linhas) |
| `specs/.../85_F6_SG_C_ADJUDICACAO_FISICA_E_HUMAN_GATE.md` | **salvo no disco, untracked** |
| `src/**`, `scripts/**`, `plugins/**`, `app.json`, `package.json`, `package-lock.json` | **intocados** |

**Nenhum `git add` foi executado. Nenhum *commit*. Nenhum *push*. Nenhum *build*.**
Os dois arquivos são **governança** e cabem em **um** *commit* atômico, quando autorizado.

**Ambiente devolvido:** Metro **parado**; captura de `logcat` **encerrada**; `adb reverse`
**removido** (`adb reverse --list` vazio); aparelho conectado; **app deixado como o fundador o
deixou** — em primeiro plano, na tela Início, em retrato. Nenhum `force-stop` foi executado depois
da gravação.

---

## 10. `STOP_HUMAN_DECISION`

```
TK_C_046                    = EMITIDO
PLAN_33                     = ROTA (i) CUMPRIDA
SD_1_CASO_4                 = SATISFEITO POR VALIDAÇÃO FÍSICA
TK_C_062                    = EXECUTADA
CN_6_FISICO                 = PASS
SD_8_CUSTODIA               = INTACTA (6/6, byte a byte)
PHONE_GAP                   = BLOCKING_UNSATISFIED_REQUIREMENT
IPAD_GAP                    = BLOCKING_UNSATISFIED_REQUIREMENT
TK_C_043                    = NÃO SATISFEITA
PERGUNTAS_VISUAIS_ABERTAS   = Q1, Q2, Q3 (§8)
NOVOS_VIDEOS_NECESSARIOS    = 0
F6_SG_C                     = NÃO CONCEDIDO — aguarda ato humano explícito
STOP_HUMAN_DECISION
```

Nenhum vão virou `PASS`. Nenhum vão virou `FAIL`. Nenhum requisito novo de hardware foi criado.
Nenhuma task nova foi criada. O tour não foi corrigido. `SG-D` não foi iniciado. Nenhum escopo de
Fase 7 foi tocado.
