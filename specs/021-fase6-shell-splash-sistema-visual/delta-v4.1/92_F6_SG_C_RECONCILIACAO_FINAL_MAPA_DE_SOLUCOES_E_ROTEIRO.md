# `92` — `F6-SG-C` · Reconciliação final da campanha, mapa de soluções e roteiro da prova final

> Este artefato fecha a campanha física `SG_C_FISICA_02`. Ele **reconcilia** vídeo e logcat
> antes de qualquer código, **adjudica** cada item do roteiro, **reabre** o Mapa de Conclusões
> do artefato `88` §12 em três classes, e entrega o **roteiro humano** da última prova física.
>
> Precedência respeitada: `PROJECT_SOURCE_OF_TRUTH` → Constituição → `AGENTS.md` → `CLAUDE.md`.
> Nada aqui reorganiza o Roteiro Mestre. `C3` permanece **lacrado**.

---

## 1. Selo probatório — a evidência, antes de tudo

A captura resiliente de logcat foi encerrada, o arquivo preservado e o hash computado **antes**
de qualquer alteração de código. Nenhuma linha de `src/**` foi tocada antes da §3 deste
documento.

```
ENTRY_HEAD   = 89c1daa  (branch feat/fase6-shell-splash)
VIDEO_HASH   = 688aadd29ac07ab6f19026fa4b16689a1c73ee8c35109659f2e4b30ed941e65a
LOGCAT_HASH  = 963d27b6c169ec6b53a3f0fb12d16f87f60fc15fd77df6035a3fc8a36fec30e7
```

| | Vídeo | Logcat |
|---|---|---|
| caminho | `C:\tmp\ptf_evidencias\SG_C_FISICA_02\VIDEO_FINAL.mp4` | `...\logcat.txt` |
| tamanho | 20.881.195 bytes | 14.430.094 bytes |
| extensão | **172,61 s** · h264 464×832 · 30 fps · 5179 quadros | 92.742 linhas · 16:37 → 17:04:39,164 |
| sessões | tomada única | **uma** sessão de captura, sem emenda |

O vídeo foi inspecionado **diretamente**, com `ffprobe` e extração de quadros (perícia quadro a
quadro nas janelas de rotação), não por leitura de resumo.

### 1.1 O que o logcat de um *release build* pode e não pode provar

O binário é `release`: `console.*` é removido. Sobram **6 linhas `ReactNativeJS`** na sessão
inteira — e são exatamente as que o instrumento de `SG-B` deixou fora do `console`:

```
16:42:38.897  Running "main" … "fabric":true
16:42:40.663  [shell] MainTabs MONTADO · montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 · pareado
16:42:40.664  [AppNavigator] faixa = tablet … largura=823dp
16:42:40.728  [PTF_PERF_SAMPLE] {"schema":2,"terminal":"first_layout","route":"Home",
              "fontReason":"loaded","routeReason":"end","fontGateMs":298,"routeDecisionMs":37,
              "splashReactMs":825,"firstLayoutMs":3211,…,"bufferDropped":0}
16:45:25.727  [Atelie] superfície → segundo plano
16:45:53.846  [ProfileGuide][DEV] preload áudios do Perfil
```

**Correção documental obrigatória.** O artefato `91` §3.2 afirma que a linha `[AppNavigator]
faixa` sai **em toda rotação** neste aparelho. Isso é **FALSO** no SM-X510: o aparelho é
`sw823dp` nas **duas** orientações, a faixa nunca vira, e a linha saiu **uma única vez**. As 14
rotações do logcat não produziram nenhuma linha de faixa nova, e `MainTabs` registra **1
montagem e 0 desmontagens**. Consequência direta: a hipótese "remontagem indevida" está
**eliminada como causa de `B`** — não por argumento, por contagem.

Este é um **limite probatório do instrumento**, não uma falha da campanha.

---

## 2. Linha do tempo reconciliada (`TIMELINE_RECONCILED`)

Âncora de sincronia: o vídeo começa em `t0 (v0,0 s) = 16:43:55,0 ± 0,3 s` do logcat.

| Vídeo | Logcat | Evento | Fonte |
|---|---|---|---|
| **−76 s** (fora da mídia) | 16:42:38,897 → 16:42:40,728 | boot, `MainTabs` monta, `first_layout` em Início | logcat |
| v0,0–3,2 | 16:43:55 | Ato 0/1 · Início em retrato, parado | vídeo |
| **v3,3–4,1** | 16:43:58,3 | aba **Aventuras** + rotação · **mapa na largura cheia da janela nova** | vídeo (quadro a quadro) |
| **v4,2** | 16:43:59,2 | **salto** para a geometria correta | vídeo |
| v7,5–18,0 | — | fundador **arrasta** o mapa (violação de pré-condição do passo 7) | vídeo |
| **v18,9** | 16:44:13,9 | rotação **paisagem→retrato** · ~0,2 s com escala de **paisagem** | vídeo |
| **v21,5** | 16:44:16,5 | rotação **retrato→paisagem** · escala de **retrato** no 1º quadro | vídeo |
| v83–90 | 16:45:17,906 → 16:45:23,152 | **IME #1** (pid 19292) · Ateliê · **PAISAGEM** | ambos |
| v90,7 | 16:45:25,727 | `[Atelie] superfície → segundo plano` | ambos |
| **v102** | 16:44:37 | visualização da arte salva (Minhas Artes) | vídeo |
| v120–124 | 16:45:55,328 → 16:45:58,287 | **IME #2** (pid 19292) · Portão Parental · **RETRATO** | ambos |
| v172,6 | 16:46:47 | fim da gravação | vídeo |

**Existem exatamente DUAS sessões de IME do aplicativo em toda a captura.** Não há uma terceira.
Este fato, sozinho, decide `D2` (§3).

### 2.1 Desvios do roteiro — registrados como limite probatório, não como falha

| Desvio | Passo do `91` | Consequência probatória |
|---|---|---|
| o mapa foi **arrastado** antes da rotação de volta | 7 e 11 (*"NÃO arraste o mapa"*) | `C1` foi exercitada num caso **mais difícil** que o roteirizado, e passou. Não invalida — fortalece |
| o **Ato 2** não aconteceu | 12–16 | `E1` **não foi estimulada**. A tela "Cadê a Ovelhinha?" nunca aparece na mídia |
| `D2` executou o ciclo de salvar **uma vez**, em paisagem | 19–24 | o ciclo de **retrato** (passos 19–21) não foi executado |
| passos 30–31 (Modo Igreja) não executados | 30–31 | a sonda `KAV` cobre o Portão Parental, não o formulário de turma |

Nenhum destes é reclassificado como falha. Onde o estímulo não rodou, o veredito é
`NOT_EXERCISED` ou `UNPROVEN` — **nunca `PASS`**.

---

## 3. Placar da campanha — item a item

| Item | Veredito | Prova |
|---|---|---|
| `A1` | **PASS_TELEMÉTRICO** | `first_layout` em `Home` com `bufferDropped: 0` e `firstLayoutMs 3211`; o boot ocorreu 76 s **antes** do vídeo, logo não há prova visual nesta mídia |
| `A2` | **PASS_TELEMÉTRICO** | idem; a composição Editorial não foi filmada em paisagem nesta tomada |
| **`B`** | **PHYSICAL_FAIL** | **três** reproduções, **bidirecionais** (§4) |
| `C1` | **RECONCILIADO** | pré-condição violada (arrasto) e ainda assim **sem salto para o começo** ao girar |
| `C2_TECHNICAL` | **PASS** | a região deixou de ser corredor vertical; `contentViewport` real, sem constante de aparelho |
| **`C2_PRODUCT_ACCEPTANCE`** | **REJECTED** | 394dp de arte para 1077dp de região útil = **36,6%**, com **683dp** de creme lateral — o vazio ficou maior que o mapa. Palavra do fundador: *"o mapa de aventuras estava melhor do tamanho antigo do que com estas bordas"* |
| `C3` | **LACRADO · NO_PATCH_REQUIRED** | não reaberto, não retestado, não tocado |
| `D2_LANDSCAPE` | **PASS_OBSERVACIONAL** | IME #1 em paisagem, ciclo completo, três elementos visíveis acima do teclado |
| **`D2_PORTRAIT`** | **UNPROVEN** | só existem duas sessões de IME, e a segunda é o Portão Parental. O ciclo de salvar em retrato **nunca foi executado** |
| `E1` | **NOT_EXERCISED** | o Ato 2 não ocorreu; *"Cadê a Ovelhinha?"* não aparece na mídia |
| sonda `KAV` | **PASS_PARCIAL** | executada em **retrato**, não no caso apertado de paisagem; passos 30–31 fora |
| `CREAR_LIVRE_FOUNDER_ACCEPTANCE` | **ACCEPTED** | *"as mudanças no Criar Livre estão MUITO melhores"* |
| **`ARTWORK_VIEWER_UX`** | **FOUNDER_REJECTED_CURRENT_PRESENTATION** | *"a forma de visualização da arte ainda está muito ruim"*, corroborado em v102 s |

---

## 4. `B` — a causa raiz, em código

### 4.1 O que o vídeo prova, e por que a explicação alternativa cai

A hipótese benigna seria "animação de rotação do sistema". Ela é **refutada pelo próprio
quadro**: nos três eventos, o **cromo já está nas dimensões NOVAS** — barra lateral na largura
final, cabeçalho na posição final — e **só a arte do mapa** está na escala da orientação
anterior. Um *cross-fade* do sistema levaria tudo junto. Aqui, uma coisa só está errada.

### 4.2 A causa

`G-RSP-9` já havia estabelecido, em `725465b`, a doutrina do carimbo para a **CAUSA B** em
quatro superfícies: *eleger uma fonte de verdade por superfície — a janela — e deixar a medida
CORRIGIR divergência real, nunca inaugurar; carimbar cada medida com a janela em que foi tirada e
recusá-la enquanto o carimbo não bater.*

**O patch `C2` (`f449865`) acrescentou uma SEGUNDA medida à mesma geometria — a ALTURA da
viewport, que passou a decidir a escala — e não a carimbou.** A largura recusava medida de outra
janela; a altura, não.

A aritmética bate com o filme, sem folga:

| Rotação | Altura usada (errada) | Largura resultante | Largura correta | Fator |
|---|---|---|---|---|
| retrato → paisagem | 1180dp (retrato) | `min(1317, 1180×9/16)` = **664dp** | 394dp | **1,69×** |
| paisagem → retrato | 700dp (paisagem) | `min(823, 700×9/16)` = **394dp** | 643dp | **0,61×** |

```
B_ROOT_CAUSE = a ALTURA da viewport entrou na geometria do mapa pelo patch C2 e
               nao recebeu o carimbo de janela que a LARGURA ja tinha.
               B nao e defeito novo: e regressao de C2, e as duas causas
               dividem um unico caminho de codigo.
```

### 4.3 O menor patch causal

`src/screens/AdventureMapScreen.js` — três pontos, nenhuma primitiva nova:

1. `viewportM` guarda `{ h, janela }`; `areaHeight` só aceita a medida quando `viewportM.janela
   === width`. É o **mesmo** carimbo que `contentM`/`areaWidth` já usavam.
2. `onMapViewportLayout` carimba a medida com a janela em que foi tirada.
3. `medidasDaJanela` = as duas medidas desta janela; enquanto for falso, a arte **não é
   pintada** (`opacity`).

**Por que a opacidade e não um valor de reserva.** Recusada a medida, a escala fica sem
viewport — e **nenhum valor derivado da janela a substitui sem estimar o cromo** (cabeçalho +
barra), estimativa que `G-MAP-3` proíbe desde `TK-A-093`. Sobraria um segundo enquadramento,
menor mas ainda visível.

**Por que não desmontar.** O `ScrollView` continua montado pela medida **CRUA**, porque
desmontá-lo a cada rotação perderia a rolagem que a **CAUSA C1** existe para preservar. Não há
atraso artificial: é a ausência de resposta enquanto a pergunta não foi respondida — quem
responde é o `onLayout`, no ritmo dele. **Nenhuma programação específica para SM-X510.**
`ANCHOR_VERTICAL`/`MAP_ANCHOR_FRAMING = 0,50` **não é tocada**.

`C1` sobrevive a qualquer geometria transitória porque `posLogicaRef` guarda uma **fração
invariante de escala** — `frac = (offsetY − rPos.top) / rPos.height` — e não pixels.

---

## 5. `C2` — a nova estratégia de escala em paisagem

O fundador reprovou a apresentação atual **sem** autorizar reverter `C2`. As duas pontas estão
reprovadas:

| Ponta | O que dá em paisagem (1077dp úteis, viewport 700dp) | Veredito |
|---|---|---|
| **regra antiga** (arte cola na largura) | região de **1915dp** de altura = **2,74×** a viewport | corredor vertical — reprovada em `88` §12 #8 |
| **`contain`** (arte cabe na altura) | arte de **394dp**, vazio lateral de **683dp** | ilha de arte cercada de creme — reprovada na campanha física |

```
C2_SCALE_STRATEGY = media GEOMETRICA entre encher a largura e caber na altura.
                    art = round( sqrt( containerW * containW_contida ) )
```

**Por que esta e não outra.** É a única escala que fica no **meio exato** das duas pontas *em
proporção* — dobrar as duas pontas dobra o resultado. Sai **só** do `contentViewport` real e do
*aspect ratio*: nenhuma constante de aparelho, nenhum número afinado à mão. E onde `contain` não
morde, a média de `x` com `x` **é** `x` — retrato e celular estreito ficam **byte a byte
idênticos**.

| | antes (`contain`) | agora | reprovado antigo |
|---|---|---|---|
| largura da arte | 394dp (**36,6%**) | **651dp (60,4%)** | 1077dp (100%) |
| vazio lateral | 683dp (> a arte) | **426dp (< a arte)** | 0dp |
| altura da região | 700dp (1,00× viewport) | **1157dp (1,65×)** | 1915dp (2,74×) |
| retrato de tablet | 643dp | **643dp** (no-op) | 643dp |

`computeImageRect`, `MAP_ASPECT`, `computeRegionHeight` e `MAP_ANCHOR_FRAMING` **não foram
tocados** — o modal "Ver mapa" continua com `contain` **exato**. `Q6`/`A-18` permanecem
fechados. C1 preservada.

> **`C2_PRODUCT_ACCEPTANCE` continua REJEITADA até a prova física.** O portão automático não
> tem autoridade para revogar rejeição do fundador. Conforme a própria ordem, na ausência de
> critério automatizável honesto para "margem excessiva" a decisão de produto é **Human Gate
> físico final**.

---

## 6. Mapa de Soluções — o Mapa de Conclusões (`88` §12) reaberto

Três classes, exatamente três. Nada some.

### 6.1 `FIX_NOW_SG_C` — resolvido nesta rodada, aguardando prova física

| ITEM | DECISÃO ORIGINAL | ESTADO ATUAL | EVIDÊNCIA | OWNER | FIX_NOW / DEFER | PRÓXIMA AÇÃO |
|---|---|---|---|---|---|---|
| `ROTATION_FIRST_LAYOUT_B` | `88` §12 #5 · `FIX_NOW_FOUNDATION` | **corrigido** em `7d93a12` | vídeo v3,3/v18,9/v21,5; `G-RSP-9` v2 + `G-RSP-9-MAPA` + MT-31/32 | `SG-B` / `TK-C-012` | **FIX_NOW** | Ato 1 do roteiro §7 |
| `MAP_SCALE_LANDSCAPE` | `88` §12 #8 · `FIX_NOW_FOUNDATION` | **reaberto e re-resolvido** em `eb54d4a` | rejeição do fundador; `G-MAP-6` v2 + `G-MAP-6-ESCALA` + MT-33/34/35 | `SG-B` → Fase 11 | **FIX_NOW** | Ato 1 §7 — **decisão de produto do fundador** |

### 6.2 `DEFERRED_WITH_OWNER` — diferido, com dono provado

| ITEM | DECISÃO ORIGINAL | ESTADO ATUAL | EVIDÊNCIA | OWNER | FIX_NOW / DEFER | PRÓXIMA AÇÃO |
|---|---|---|---|---|---|---|
| `ARTWORK_VIEWER_UX` | não existia como item | **`FOUNDER_REJECTED_CURRENT_PRESENTATION`** | vídeo v102 s; palavra do fundador | **evolução do Ateliê / Minhas Artes** (`F12A`) | **DEFER** | spec própria de apresentação da arte; **não** desaparece como PASS só porque salvar e abrir funcionam |
| `GAME_COMPOSITION_RESIDUALS` | `88` §12 #13 e #15 · `DEFER_TO_EXISTING_OWNER` | inalterado | `88` §10; `GameSurface` com zero consumidores por contrato | **Fase 12A** (`TK-C-012`) | **DEFER** | redesenho de layout dos 5 jogos em `F12A` |
| `PARENT_AREA_LANDSCAPE` | `86` §5.7 · `RESIDUAL_VISUAL_FORA_DO_GATE` | inalterado; sonda `KAV` **PASS_PARCIAL** | `86` §5.7; `88` §12 #18 | **`F12A`** (adoção de arquétipo) | **DEFER** | migrar `ProfileScreen`/`ParentArea` para arquétipo, com task própria — **não** remendo |
| `ONBOARDING_TOUR_ALIGNMENT` | `85` §4.3 · `PHONE_GAP` + `IPAD_GAP` **BLOCKING_UNSATISFIED** | **ainda aberto** — o tour não rodou em nenhuma campanha | `85` §251, §310, §368 | `TK-C-043` / `SG-D` | **DEFER** | exige **telefone** e **iPad** com alvos da barra **medidos**; hardware indisponível |
| `GRAY_BORDERS` | `88` §9 · `PASS_NO_CHANGE` | inalterado | `88` §9 — duas origens: `cardLocked` (intencional) e `elevation` × `overflow:hidden` | **design system** (área protegida) | **DEFER** | só com instrução direta; nenhum critério de `SG-C` violado |
| `TRANSITIONS_HARD_UX` | `88` §12 — sem achado estrutural | sem manifestação nova nesta campanha | 14 rotações, `MainTabs` 1 montagem / 0 desmontagens | Fase 7 (composição) | **DEFER** | reavaliar quando a Fase 7 redesenhar transições |
| Livrinho: vazio lateral | `88` §12 #17 · `DEFER_TO_EXISTING_OWNER` | inalterado | capacidade `D10` diferida por `TK-C-004` | **Fase 9** | **DEFER** | acompanhante da família Imersiva em F9 |

### 6.3 `RESOLVED` — fechado, com prova

| ITEM | DECISÃO ORIGINAL | ESTADO ATUAL | EVIDÊNCIA | OWNER | FIX_NOW / DEFER | PRÓXIMA AÇÃO |
|---|---|---|---|---|---|---|
| `HOME_AVAILABLE_WIDTH` | `86` §5.1 · `VIOLA_CRITERIO_SG_C`; `88` §12 #1 | **resolvido** em `d70fffb` | `HomeScreen.js:818` `availableWidth={gradeW > 0 ? gradeW : undefined}`; gate de chamador | `TK-C-008` | RESOLVED | sentinela visual no Ato 0 |
| `BRINCAR_HUB_LANDSCAPE` | `86` §5.2 · incorreto **sem manifestação**; `88` §12 #3 | **resolvido** em `d70fffb` | `BrincarScreen.js:270`, mesmo gate | `TK-C-008` | RESOLVED | nenhuma |
| `A2` — apoio maior que a leitura | `88` §12 #2 · `FIX_NOW_FOUNDATION` | **resolvido** em `9a283e7` | teto do apoio em `editorialLayout` | `TK-C-006`/`009` | RESOLVED | nenhuma |
| `C1` — "perde o lugar" ao girar | `88` §12 #7 · `FIX_NOW_FUNCTIONAL` | **resolvido** em `2bff1ae` | vídeo v7,5–18 s: arrastado e **ainda assim** sem salto | `SG-B` | RESOLVED | sentinela no Ato 1 |
| `C3` — pinos com a letra inicial | `88` §12 #9 · condicionado a RED TEST | **LACRADO · NO_PATCH_REQUIRED** | teste vermelho não nasceu | `SG-B` | RESOLVED | **não retestar** |
| `D2` — caixa de texto sob o teclado | `88` §12 #11 · `FIX_NOW_FUNCTIONAL` | **resolvido** em `dfdbf14` + `af6f7d5` | IME #1 paisagem, ciclo completo | `TK-C-004` | RESOLVED **em paisagem** | **retrato ainda `UNPROVEN`** → Ato 3 |
| `E1` — jogo não inicia | `88` §12 #12 · `FIX_NOW_FUNCTIONAL` | **corrigido** em `feb750e`, **não exercitado** | Ato 2 não ocorreu | `TK-C-012` | RESOLVED em código | Ato 2 do roteiro §7 |
| `QuizScreen` · `Estrelinhas` | `88` §11 · `PASS_NO_CHANGE` | inalterado | `88` §11 | `TK-C-008`/`012` | RESOLVED | nenhuma |

---

## 7. Roteiro humano — **UMA** campanha curta (`NUMBER_OF_REQUIRED_FINAL_VIDEOS = 1`)

> **Escopo fechado.** Cobre só: `B` (alterada), `C2` (apresentação nova), `D2` **retrato**
> (`UNPROVEN`), `D2` paisagem (sentinela), `E1` (nunca exercitada) e as sentinelas `A1`/`A2`/`C1`.
> **NÃO** testar `C3`. **NÃO** repetir a varredura das 20 histórias. **NÃO** repetir a sonda `KAV`.
> Duração alvo: **≈ 3 minutos**.

### 7.1 Antes do REC

1. No PC, com o tablet ligado por USB e a depuração autorizada:
   ```
   C:\Android\platform-tools\adb.exe -s RX2XC003LTJ logcat -c
   C:\Android\platform-tools\adb.exe -s RX2XC003LTJ logcat -v time > C:\tmp\ptf_evidencias\SG_C_FISICA_03\logcat.txt
   ```
   *(deixe rodando; o Ctrl+C é o último passo)*
2. No aparelho: **rotação automática LIGADA**, brilho estável, **não** perturbe.
3. Confirme o **Modo Criador** ligado: **Perfil → "🔐 Para responsáveis" → "Área dos Pais" →
   resolver a conta → "🛠️ Administração (dev)"**. Sem ele, o Ato 3 mostra *"Guardar é do Plano
   Família"* e `D2` **não é testável**.
4. Feche o app **completamente** pelos recentes.

### 7.2 ▶ ATO 0 — partida e sentinela `A1`/`A2` (≈ 20 s)

1. Aparelho em **RETRATO**. Inicie a **gravação de tela**. Espere **3 s** parado.
2. Abra **Pequenos Traços de Fé**. Espere a tela **Início** e conte **3 s** sem tocar.
   *(ponto de sincronia — a claquete)*
3. **Gire para PAISAGEM** e espere **4 s** sem tocar.
   - **Observe:** a **barra lateral** está à esquerda e os cartões de **Início** compõem
     **dentro do que sobrou** — não contra a janela inteira, sem coluna estreita cercada de vazio.
4. Gire de volta para **RETRATO**.

### 7.3 ▶ ATO 1 — `B` e `C2`, o coração desta campanha (≈ 70 s)

5. **`B` — o estímulo.** Toque na aba **"Aventuras"** e, **cerca de meio segundo depois** —
   assim que o mapa começar a pintar e **antes** de os pinos aparecerem — **gire o tablet para
   PAISAGEM** num movimento só.
   - 🚫 **NÃO arraste o mapa.** Nem antes, nem durante, nem depois.
   - Se girar tarde (mapa já estável), **fale em voz alta "girei tarde"**, volte para retrato,
     toque em outra aba, volte em **"Aventuras"** e repita. Até **três** tentativas.
6. Espere **5 s** parado, em paisagem, **sem tocar**.
   - **Observe (`B`):** a arte do mapa aparece **uma vez só**, já na geometria final? Ou ela
     aparece **larga demais** e depois **salta** para uma apresentação mais estreita?
     *Um único enquadramento = PASS. Dois enquadramentos = FAIL.*
7. **`C2` — a decisão de produto.** Continue **sem tocar** por mais **5 s** e **olhe com calma**.
   - **Observe:** o mapa tem **presença** na tela? A **arte** ocupa mais espaço que o **creme**
     em volta dela? Ainda parece um pergaminho **ampliado demais**?
   - 📣 **Fale em voz alta o seu veredito**: *"aceito"* ou *"ainda não"*. Esta frase **é** o
     Human Gate de `C2` — nenhum portão automático decide isto.
8. **`B` no sentido inverso + `C1`.** **Sem nunca ter arrastado o mapa**, gire de volta para
   **RETRATO**. Espere **4 s**.
   - **Observe (`B`):** de novo — um enquadramento só, ou dois?
   - **Observe (`C1`):** o mapa continua aproximadamente na **mesma região lógica**? Não pode
     ter saltado para o começo.
9. Repita o par: gire para **PAISAGEM**, espere **3 s**, gire para **RETRATO**, espere **3 s**.
   *(duas idas e voltas dão à perícia quadro a quadro mais de uma amostra por sentido)*

### 7.4 ▶ ATO 2 — `E1`, nunca exercitada (≈ 35 s)

10. Toque na aba **"Brincar"**.
11. Toque no card **"Cadê a Ovelhinha?"** e, **cerca de meio segundo depois**, **gire para
    PAISAGEM**. Espere **5 s** sem tocar.
12. **`E1`.** Toque em **"Começar no Fácil"**.
    - **Observe:** a tela de apresentação aparece e o botão **"Vamos procurar!"** está presente
      e tocável **sem** precisar de nenhuma rotação para destravar.
13. Toque em **"Agora não"**. Gire de volta para **RETRATO**.

### 7.5 ▶ ATO 3 — `D2` **RETRATO**, o que ficou `UNPROVEN` (≈ 60 s)

> ⚠️ O card **"Criar livre" da tela Início** abre o Ateliê com uma missão e **pula o sheet de
> nome**. Ele **não** reproduz `D2`. O caminho correto é pela aba **Brincar**.

14. Ainda na aba **"Brincar"**, role até a seção **"Crie do seu jeito"** e toque em
    **"Abrir folha"**, no card **"Criar livre"**. **Fique em RETRATO.**
15. **Rabisque** na folha por **3 a 4 segundos**.
16. **`D2` RETRATO.** Toque em **"Salvar"**, no topo.
    - Se aparecer *"Guardar é do Plano Família"*: **PARE**. O Modo Criador está desligado —
      volte à §7.1 passo 3 e refaça a campanha do Ato 0.
    - Se aparecer **"Nomeie seu desenho"**: siga.
17. **Não digite nada ainda.** Espere **6 s** com o teclado aberto.
    - **O cartão pode fazer UM movimento aqui, e isso é esperado** — é o primeiro teclado da
      sessão. Um movimento é correto; um cartão que fica no alto **e não desce** é falha.
    - **Observe os TRÊS elementos:** o campo **"Nome do desenho"**, o botão **"Cancelar"** e o
      botão **"Guardar desenho"** — os três **inteiramente visíveis acima do teclado**.
18. Digite **`teste`** e toque em **"Guardar desenho"**.
    - **Observe:** salvou e a tela reage normalmente. *(este é o ciclo que faltou na campanha
      anterior)*
19. **`D2` PAISAGEM — sentinela.** Gire para **PAISAGEM**, espere **2 s**, rabisque **2 s** e
    toque em **"Salvar"**. Espere **5 s** sem digitar e confira os mesmos três elementos.
20. Toque em **"Cancelar"**. Gire para **RETRATO**.

### 7.6 ▶ Encerramento

21. Espere **3 s** parado e **encerre a gravação**.
22. No PC: **Ctrl+C** no logcat e, em seguida:
    ```
    certutil -hashfile C:\tmp\ptf_evidencias\SG_C_FISICA_03\VIDEO_FINAL.mp4 SHA256
    certutil -hashfile C:\tmp\ptf_evidencias\SG_C_FISICA_03\logcat.txt SHA256
    ```

### 7.7 Condições de PARADA

| Se acontecer | Faça |
|---|---|
| *"Guardar é do Plano Família"* no passo 16 | **PARE** o Ato 3, ligue o Modo Criador, refaça do Ato 0 |
| o app fechar sozinho | **PARE**, não reabra, avise — o logcat tem o *stack trace* |
| qualquer diálogo com **"Apagar"** / **"Excluir"** | toque em **"Cancelar"** e siga |

### 7.8 Como o resultado será lido

| Observação | Veredito |
|---|---|
| um enquadramento por rotação, nas 4 rotações do mapa | `B_FINAL = PASS` |
| **qualquer** segundo enquadramento | `B_FINAL = PHYSICAL_FAIL` — a causa volta à mesa |
| o fundador disse *"aceito"* no passo 7 | `C2_PRODUCT_ACCEPTANCE = ACCEPTED` |
| o fundador disse *"ainda não"* | `C2_PRODUCT_ACCEPTANCE = REJECTED` — nova estratégia, **sem** reverter |
| os três elementos visíveis no passo 17 **e** salvou no 18 | `D2_PORTRAIT = PASS` |
| "Vamos procurar!" tocável sem rotação | `E1_FINAL = PASS` |

---

## 8. Prova automatizada desta rodada

| Portão | Resultado |
|---|---|
| `gate:platform-scope` | **OK** — nenhum arquivo próprio `.ios/.android/.native` em 1473 arquivos |
| `bundle:check` | **Android Bundled · index.js · 2383 módulos** |
| `npm run smoke` | **4978/4978 passed, 0 failed** |
| `npm run verify:runtime` | **verde** (exit 0) — nos **dois** commits, separadamente |
| `npx expo-doctor` | **18/18 checks passed** |
| arnês `mapAnchorHarness` | **FOCUSED 36/36 PASS; MUTANTS 11/11 KILLED** |

**Portões vermelhos, provados antes do patch** (contra `git show 89c1daa:...`):

| Portão | Antes | Depois |
|---|---|---|
| `[924]` `TABLET1.0` mapa | ✗ | ✓ |
| `[4964]` `G-RSP-9` v2 | ✗ (4 cláusulas vermelhas) | ✓ |
| `[4965]` `G-MAP-6` v2 | ✗ | ✓ |
| cláusula anti-regressão da montagem crua | ✓ → ✓ | *(verde nos dois lados, por desenho — é anti-regressão, não descoberta)* |

**Mutantes novos:** `MT-31` (desfaz o carimbo da altura) · `MT-32` (volta a pintar com meia
geometria) · `MT-33` (regra antiga) · `MT-34` (`contain` puro) · `MT-35` (média **aritmética** —
morre só pela cláusula da identidade geométrica, provando que ela tem dentes).

---

## 9. Estado de arquivos

| Arquivo | Estado |
|---|---|
| `src/screens/AdventureMapScreen.js` | **commitado** em `7d93a12` |
| `src/data/adventureMap.js` | **commitado** em `eb54d4a` |
| `scripts/smoke.js` · `scripts/testing/mapAnchorHarness.js` | **commitados**, divididos por causa entre `7d93a12` e `eb54d4a` |
| `specs/.../92_F6_SG_C_RECONCILIACAO_FINAL_MAPA_DE_SOLUCOES_E_ROTEIRO.md` | **salvo no disco** |
| `C:\tmp\ptf_evidencias\SG_C_FISICA_02\*` | fora do repositório, **preservados e com hash** |

**Nenhum push. Nenhum merge. Nenhuma release.**

---

## 10. Bloco de retorno

```
SG_C_CURRENT_STATE     = duas causas corrigidas e provadas em automacao; aguardando
                         UMA campanha fisica curta. Human Gate NAO declarado.
READY_FOR_FINAL_REVALIDATION = SIM
NEXT_CAUSAL_ACTION     = executar o roteiro da secao 7 e adjudicar B_FINAL e
                         C2_PRODUCT_ACCEPTANCE pela palavra do fundador.
```

**Human Gate não é declarado** porque `B` só está provada em automação, `C2` continua com
aceitação de produto **rejeitada** até a vista do fundador, e `D2_PORTRAIT` segue `UNPROVEN`.
Sucesso automatizado **não** sobrescreve rejeição física nem decisão de produto.
