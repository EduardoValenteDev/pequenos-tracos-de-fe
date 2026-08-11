# `AUDITORIA-PREP02-STOP-01` — auditoria causal do `STOP` da `PREP-LEGADO-02`

> **Estado deste documento:** **auditoria somente leitura**. Ele **não** executa nada, **não** concede
> `PASS` a nenhum caso da `R2`, **não** reabilita a `PREP-LEGADO-01` nem a `PREP-LEGADO-02`, **não**
> inicia a `R2 · Sessão 2` e **não** executa a `PREP-LEGADO-03`. Autoridade superior:
> [`docs/PROJECT_SOURCE_OF_TRUTH.md`](../../../docs/PROJECT_SOURCE_OF_TRUTH.md) → Constituição →
> [`docs/DECISIONS.md`](../../../docs/DECISIONS.md) → este pacote operacional.
>
> Documentos irmãos: [`11_PREP_LEGADO_02.md`](11_PREP_LEGADO_02.md) ·
> [`10_RODADA_FISICA_2_F6_SG_A.md`](10_RODADA_FISICA_2_F6_SG_A.md) ·
> [`06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md`](06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md).

**Pergunta que esta auditoria responde:** por que o *checkpoint* `C60` da `PREP-LEGADO-02` trouxe
**sete** chaves novas em vez de **quatro**, e o desenho da futura `PREP-LEGADO-03` pode reutilizar a
rota atual ou precisa de correção material?

---

## 1. Estado de entrada e método

| Item | Valor |
|---|---|
| *Worktree* canônico | `C:\tmp\ptf_fase6_shell_splash_wt` · `feat/fase6-shell-splash` · `HEAD c71e8b64ff17a037acf1e364e75061e25df995de` · `git status --porcelain` **vazio** |
| *Worktree* histórico (auditado) | `C:\tmp\ptf_colorir_canonical_runtime_wt` · `docs/e015-phase3-artifacts` · `HEAD 7de7085e8c3ddf777b8b479b6b554f668081c77c` · `git status --porcelain` **vazio** |
| Evidência | `C:\tmp\ptf_evidencias\PREP-LEGADO-02\` — **10/10** *hashes* `SHA256` conferidos contra a lista congelada, **antes** de qualquer análise |
| Aparelho / `adb` / Metro / `logcat` / restauração de `TAR` | **nada disso foi usado** |
| Alteração de *storage*, de evidência ou de código | **nenhuma** |

**Método.** Quatro frentes independentes (linha do tempo do `raw.log`; grafo de *writers*; rota de
navegação/UI; lacuna de protocolo + proveniência do *bundle*) mais **uma perícia física do banco
`AsyncStorage`** conduzida diretamente. Toda inspeção de banco foi feita sobre **cópias** extraídas
dos `TAR` para diretório temporário, abertas em modo somente leitura; os arquivos de evidência não
foram tocados em escrita.

---

## 2. Técnica decisiva — forense de `rowid` do `AsyncStorage`

No Android o `AsyncStorage` deste *runtime* é o caminho **legado** (`AsyncStorageModule.java`, sem
`room_master_table` no banco; `useNextStorage` continua `false`), que grava com:

```java
// node_modules/@react-native-async-storage/async-storage/.../AsyncStorageModule.java:182
String sql = "INSERT OR REPLACE INTO " + ReactDatabaseSupplier.TABLE_CATALYST + " VALUES (?, ?);";
```

`INSERT OR REPLACE` **apaga a linha antiga e insere uma nova**: a chave reescrita recebe um `rowid`
**novo e maior**, e o `rowid` antigo fica **vago**. Disso decorrem dois fatos verificados
empiricamente em banco de teste antes de serem usados como prova:

1. **a ordem de `rowid` é a ordem de gravação**;
2. **um `rowid` vago imediatamente antes de uma chave prova que aquela chave foi gravada duas vezes.**

`AsyncStorage` **não emite nenhuma linha de `logcat`**. Esta técnica é, portanto, a única fonte de
**ordem** disponível — e ela é física, não inferida.

### 2.1 Leitura dos bancos

*Baseline* restaurado (`baseline-restored`, 16 chaves) — `rowid` máximo = **42**.
*Checkpoint* `C60` (`checkpoint-c60`, 23 chaves) — `rowid` máximo = **51**:

| `rowid` | Chave | Valor | Leitura |
|---:|---|---|---|
| **43** | *(vago)* | — | **`@ptf_creator_qa_mode` gravado a 1ª vez** (`'true'`) |
| 44 | `@ptf_creator_qa_mode` | `'false'` | 2ª gravação — o desligamento |
| **45** | *(vago)* | — | **`@ptf_progress_creation` gravado a 1ª vez** (cena 1) |
| 46 | `@ptf_progress_creation` | `{"1":true,"2":true}` | 2ª gravação — cena 2 |
| 47 | `@ptf_coloring60_milestone_invite_seen_creation_light` | `'1'` | convite do marco **apresentado** |
| 48 | `@ptf_drawing60_screation_alight` | ponteiro `v:3 fmt:2 image/png` | *save* do C60 |
| 49 | `@ptf_coloring60_done_creation_light` | `'true'` | `multiSet` de conclusão |
| 50 | `@ptf_coloring60_snap_creation_light` | `'ready'` | idem |
| 51 | `@ptf_coloring60_ever_creation_light` | `'true'` | idem |

**Validação cruzada da técnica:** a ordem `49 → 50 → 51` reproduz **exatamente** a ordem do
`multiSet` de `coloring60ActivityService.js:129-133`. A técnica acerta onde já se conhecia a resposta.

### 2.2 O que a tabela prova sozinha

- O ***switch*** **Modo Criador foi tocado exatamente duas vezes** — `ON` e depois `OFF`. Isto
  **confirma fisicamente** a observação humana congelada em `STOP_ALLOWLIST_C60_01.md`, de forma
  independente do relato.
- **Duas cenas foram concluídas**, uma de cada vez — não é uma gravação única de estado sintético.
- **Nada mais foi gravado** entre o *baseline* e o `C60`: não há nenhum `rowid` vago fora de 43 e 45.
- **A ordem é irrefutável:** *switch* → progresso (×2) → marco → ponteiro do desenho → conclusão. As
  três chaves inesperadas nasceram **antes** do *save* do Colorir 60, **não** depois dele.

### 2.3 Nada foi gravado depois do *checkpoint*

O `RKStorage` dentro de `TAR-STOP-C60.tar` (15:56) é **idêntico em conteúdo, tamanho e `mtime`
(15:51)** ao do `CHECKPOINT-C60.tar`. **Zero escritas entre o *checkpoint* e o `force-stop`.** O
*blob* referenciado pelo ponteiro é um `PNG` real de 205.591 bytes, `IHDR 1440×2156` — coincidente
com `W/H` do ponteiro — com `mtime` 15:51.

---

## 3. Linha do tempo reconstruída

Marcos informados pelo operador correm ~10–11 s **adiantados** em relação ao relógio do `logcat`; as
horas abaixo são as do `logcat` (fonte primária). Classificação: **[O]** observado · **[I]** inferido
· **[N]** não determinado.

| Hora | Evento | Classe |
|---|---|---|
| 15:41:29 | início da captura `logcat` | [O] |
| 15:43:09 | *cold start* único do app — `PID 23076`, sem *crash*, sem `ANR`, sem *reload* | [O] |
| 15:43:36 → 15:49:18 | **tela apagada/bloqueada**; o app carregou em segundo plano | [O] |
| 15:49:24.959 | `[PTF_PERF_SAMPLE] {"route":"Home"}` | [O] |
| 15:49:33.389 | `[ProfileGuide][DEV] preload áudios do Perfil` ⇒ `ProfileScreen` | [O] |
| 15:49:37.008 → 15:49:42.090 | `Dialog` nativo com `ReactEditText` + teclado ⇒ **`ParentalGate`** ⇒ Área dos Pais | [O]/[I] |
| 15:49:45,46,47–48,50–51 | toques na janela principal (`'e4273a4'`), dois deles longos (~1 s) = rolagem | [O] |
| **15:49:52.179 (85 ms)** e **15:49:56.112 (73 ms)** | dois toques curtos isolados na janela principal | [O] |
| ~15:49:52 / ~15:49:56 | **`@ptf_creator_qa_mode` gravado `'true'` e depois `'false'`** (`rowid` 43 vago → 44) | [I] pelo `rowid`; [O] quanto ao par de toques |
| 15:49:56 → 15:50:18 | 22 s sem toque | [O] |
| 15:50:18 · 15:50:19 · 15:50:20 · 15:50:22 | quatro toques na janela principal — **saída da Área dos Pais e entrada na história** | [O]/[I] |
| 15:50:22.649 → 15:50:24.203 | `Dialog` nativo **#1** (`ReactModalHostView.showOrUpdate`), dispensado por toque **dentro** dele | [O] · identidade **[N]** |
| 15:50:27.374 | toque na janela principal | [O] |
| 15:50:27.609 → 15:50:33.608 | **≈6,0 s de áudio `MP3`** (`ExoPlayerImpl` + `c2.sec.mp3.decoder`) ⇒ narração de cena | [O]/[I] |
| 15:50:33.266 | toque na janela principal — **conclusão de cena** | [O]/[I] |
| 15:50:33.976 → 15:50:35.407 | `Dialog` nativo **#2**, com áudio próprio, dispensado por toque **dentro** dele (15:50:34.980) | [O] |
| 15:50:36.620 | toque na janela principal — **conclusão de cena** | [O]/[I] |
| ~15:50:36,7 | **`@ptf_progress_creation` → `{"1":true,"2":true}`** (`rowid` 46) | [I] pelo `rowid` |
| ~15:50:37,0 | **`@ptf_coloring60_milestone_invite_seen_creation_light` → `'1'`** (`rowid` 47) | [I] pelo `rowid` |
| 15:50:37.079 | `Dialog` nativo **#3** aberto — canal de entrada `'f28c3a2'` | [O] |
| **15:50:38.271 → .358** | **toque entregue ao canal `'f28c3a2'` — isto é, DENTRO do modal #3** | [O] |
| **15:50:38.637** | `[DEV Colorir60] Helper: __devResetCreationColoring60()` ⇒ **`ColoringScreen` MONTADA** | [O] |
| 15:50:38.759 | modal #3 removido (depois da montagem) | [O] |
| 15:50:38.849 | `[ColoringCanvas] lineart CACHE MISS story=creation scene=null` | [O] |
| 15:50:41.9 → 15:51:33.9 | pintura contínua | [O] |
| 15:51:35.538 | toque em **"Pronto!"** | [O] |
| 15:51:35.931 | `[Coloring60] máquina de conclusão: already=false antes=0 depois=1/3 persistido=true modo=activity próxima=living_world` | [O] |
| ~15:51:35,9 | ponteiro + `done`/`snap`/`ever` (`rowid` 48–51) | [I] pelo `rowid` |
| 15:51:58.626 | **um** toque após a conclusão, sem log de JS e sem nova janela | [O] |
| 15:56:09 | `force-stop` | [O] |
| 15:57:28 | fim do `raw.log` | [O] |

A janela de uso real foi de **~3 minutos** (15:49:23 → 15:52:29), com **72 toques**. Em 41.111 linhas
o `raw.log` **não contém** nenhuma ocorrência de `narration`, `milestone`, `cena` ou `creator`: o
*runtime* histórico não instrumenta rota. Nenhuma escrita de `AsyncStorage` aparece em `logcat` —
como esperado.

---

## 4. A prova de rota: qual **janela** entregou o toque que abriu o editor

Este é o achado central, e ele é **observado**, não inferido.

- O botão **"Abrir Luz"** da Área dos Pais (`ParentAreaScreen.js:1186`,
  `navigation.navigate('Coloring', { storyId: 'creation', activityId: 'light' })`) é um `SoundButton`
  **na árvore da tela principal**. Um toque nele é entregue ao canal da janela principal — `'e4273a4'`
  em toda esta sessão.
- O toque que **precedeu a montagem do `ColoringScreen` em 366 ms** foi entregue ao canal
  **`'f28c3a2'`** — o canal criado às 15:50:37.081 para o `Dialog` nativo aberto por
  `com.facebook.react.views.modal.ReactModalHostView.showOrUpdate`, isto é, um **`<Modal>` do React
  Native**.

**⇒ O editor do Colorir 60 NÃO foi aberto pelo passo `B2` do protocolo congelado. Foi aberto por um
botão DENTRO de um modal.**

Quais modais do app abrem o editor?

| Modal | Componente | Situação nesta sessão |
|---|---|---|
| Convite da jornada, na `StoryDetail` | `StoryDetailScreen.js:612` → `handleInviteColorNow` (`:392`) | **EXCLUÍDO por dupla prova.** Só é visível com `storyScenesComplete === true` (`deriveColoring60JourneyInvite`), o que é falso com o *baseline* restaurado; e a apresentação grava `@ptf_creation_colorir_invite_shown_v1` (`coloring60JourneyInvite.js:41` ← `StoryDetailScreen.js:274`), chave que **não** aparece no `ADDED` e cujo `rowid` não existe. |
| **Convite do marco**, na `Narration` | `Coloring60MilestoneInvite` (`<Modal>` do RN) ← `NarrationScreen.js:217`; aceite em `:244` `handleMilestoneAccept` → `c60OpenEditorFromMilestone` | **É ESTE.** Único restante, e o único cujo botão de aceite monta o editor. |

E o encaixe é exato: `markColoring60MilestoneInviteSeen` é chamado em `NarrationScreen.js:216` **no
instante da apresentação** do convite — o que explica `rowid` 47 imediatamente **antes** do ponteiro
(48) e imediatamente **depois** da segunda gravação de progresso (46), ambas produzidas pela mesma
chamada de `handleConcluirCena` (`await salvarCena(cena.id)` em `:186`).

**A rota realmente percorrida foi:** Home → Perfil → `ParentalGate` → **Área dos Pais** (*switch*
`ON`→`OFF`) → sair → história "A Criação" → **cena 1 concluída** → **cena 2 concluída** → **convite do
marco** → **"Colorir agora"** → `ColoringScreen` (`origin = storyMilestone`) → pintura → "Pronto!".

Ou seja: **a rota narrativa `cena 1 → cena 2 → marco`** — exatamente a que `D-PREP02-06` declarava não
utilizada e a que já havia sido a causa-raiz da `PREP-LEGADO-01`.

> **Sobre `modo=activity`:** essa palavra **não** identifica a porta. `COLORING60_MODE` é
> `{ UPDATE: 'update', FIRST: 'activity', FINALE: 'finale' }` (`coloring60Journey.js:64`) e
> `completionMode` é derivado **apenas** do mapa de conclusões (`:163`). `activity` significa
> "primeira conclusão desta parte" — nada sobre `origin`. Registrado aqui porque é uma armadilha
> plausível de leitura.

---

## 5. Causa de cada chave inesperada

| Chave | Único *writer* | Único *caller* | Causa determinada |
|---|---|---|---|
| `@ptf_creator_qa_mode = 'false'` | `creatorQaMode.js:90` | `ParentAreaScreen.js:474` (`handleToggleQa`) ← `<Switch>` `:1134-1139` | **Toque acidental** no *switch*: `ON` (`rowid` 43, vago) e `OFF` (`rowid` 44). Não existe gravação em *boot*, em montagem, em normalização ou em `logout`; o carregador (`:56-71`) **só lê**. Não existe remoção da chave em lugar nenhum — por isso "desligar" **não** restaura a ausência. |
| `@ptf_progress_creation = {"1":true,"2":true}` | `useProgress.js:29` (`salvarCena`) | `NarrationScreen.js:186`, dentro de `handleConcluirCena` | **Duas conclusões de cena reais**, na `NarrationScreen`. `ProgressContext.js` não contém nenhum `setItem`/`multiSet`/`removeItem` — é leitura pura, incluindo a ponte C60→progresso (`:200-205`). `limparProgresso` (`useProgress.js:38`) não tem *caller*. **Não existe nenhuma função de sincronização/derivação que converta estado do C60 em progresso de história.** |
| `@ptf_coloring60_milestone_invite_seen_creation_light = '1'` | `coloring60MilestoneInviteSeen.js:61` | `NarrationScreen.js:216` | **Apresentação do convite do marco**, disparada pela conclusão da cena 2 (`coloring60StoryMilestones.js:45` — `unlockAfterScene: 2`, `resumeScene: 3`). Escrita *fire-and-forget*, sem modal próprio de confirmação. |

**Nenhuma das três é alcançável a partir da rota congelada `B1..B4`.** Nenhuma delas é efeito
colateral do *save* do C60. Nenhuma delas ocorreu **depois** de "Pronto!".

---

## 6. Contraprova — o que a rota congelada faria

- `ColoringScreen` **não tem `useFocusEffect`**; seus dez efeitos de montagem são **somente leitura**.
- `beginC60Attempt` (`:298-476`) grava o ponteiro (`:352-354`) e a tripla de conclusão (`:435-437`);
  `onCelebrate` (`:450-457`) **não navega**.
- `handleC60Celebrate` (`:937`) só deriva estado e aquece a coleção (`primeColoring60Collection`,
  *fire-and-forget*); **não grava progresso, não toca som de cena, não navega**.
- A saída do editor é `planC60Exit` → `POP_TO_TOP` (`coloring60Navigation.js:78-84`) — vai para
  Home/Perfil, telas que **não gravam nada** em montagem ou foco.
- `navigate('Coloring', …)` a partir da Área dos Pais **empilha** o editor; **não** monta
  `NarrationScreen` em pilha alguma.

E a evidência física fecha: **entre o *checkpoint* e o `force-stop` não houve nenhuma escrita**
(§2.3), e o único toque posterior à conclusão (15:51:58.626) não produziu log nem janela.

**Resposta às duas perguntas obrigatórias de §7:** tocar "Pronto!" **não** pode terminar em
`NarrationScreen`; o botão da Área dos Pais **não** pode montar uma pilha que contenha
`NarrationScreen`. Ambas são **NÃO** — por análise estática e por evidência física convergentes.

---

## 7. Proveniência do *bundle* (revalidação **documental**, sem refazer *bundle*)

| Item | Resultado |
|---|---|
| `shellLifecycleTrace` no *bundle* | **AUSENTE** (0 ocorrências). Existe em 6 arquivos de `c71e8b6` e em **0** de `7de7085` ⇒ prova negativa válida |
| `useSurfaceLifecycle` no *bundle* | **AUSENTE** (0 ocorrências) |
| `Length` / `SHA256` | `16.666.562` · `0680E3BCF0655E34E20918ADAB84BB8236BE5FF3C47C13933F12C749788BC598` |
| `Bundle src modules` / `Unknown to 7de7085` | `1441` / `1137` |
| Marcador **positivo** de época | O *bundle* contém, caractere a caractere, a *copy* obsoleta de `ParentAreaScreen.js:1182` (`"Temporário: nada é salvo — não altera progresso, desenhos, plano nem conquistas."`), que §10 do protocolo registra como deliberadamente **não** corrigida no *runtime* histórico |

**Sobre os `1137` "desconhecidos":** **não** é anomalia — é artefato de método. ~800 são caminhos
internos de `node_modules` (`react-native-reanimated`, `react-native-svg`, `react-native-screens`,
`react-native-gesture-handler`, `expo`, `react-devtools`) e ~337 vêm com **barra dupla**
(`src//screens//ColoringScreen.js`), falha de normalização do script. Normalizadas e testadas contra a
árvore de `7de7085`, **nenhum módulo `.js` do app está ausente**.

**Ressalva honesta:** `BUNDLE_PROVENANCE_PRE_C60.txt` **não emite veredito** — termina sem linha de
resultado, ao contrário dos demais artefatos da sessão. Ele entrega a metade negativa (dois símbolos
ausentes) e uma contagem que, lida sem análise, **induz a erro**. O gate **positivo** de §9 item 9 do
protocolo **não é cumprido pelo arquivo**; é cumprido por esta auditoria. **Ação para a `PREP-03`:** o
gerador de proveniência deve imprimir veredito explícito e normalizar caminhos.

**Conclusão:** o *bundle* servido é **consistente com `7de7085`** e **incompatível com `c71e8b6`**.

---

## 8. Veredito sobre a rota (§11 da diretiva)

> **`A*` — a ROTA congelada é correta; a segunda asserção do enunciado `A` é REJEITADA.**

Desdobrando, porque a diferença é material:

1. **A rota `B1..B4` é correta** — por análise de *writers* ela grava **exatamente** as quatro chaves
   da allowlist de §7.1, e o pós-conclusão **não** grava nada. Isso **exclui `B`** (não há efeito
   colateral inevitável) e **exclui `C`** (o pós-conclusão é inerte).
2. **Mas o enunciado `A` afirma que "o único problema material foi o toque acidental no Modo
   Criador" — e isso é FALSO.** O problema material **maior** é que **a rota congelada não foi
   executada**: o editor foi aberto pelo convite do marco, depois de duas cenas concluídas.
3. **`D` também seria desonesto:** a causa **está determinada**, por três linhas independentes e
   convergentes (ordem física por `rowid`; grafo de *writers*; canal de entrada do toque).

**Não se escolhe `A` por conveniência.** A correção da rota é afirmada por **análise estática**, não
por um teste físico bem-sucedido — porque esse teste **nunca chegou a acontecer**. A rota continua
**não validada empiricamente**.

### 8.1 O protocolo da `PREP-02` tinha defeito material? **Sim — três.**

| # | Defeito | Evidência |
|---|---|---|
| **P-1** | **Coabitação de controles.** O *switch* Modo Criador é o **primeiro** card do acordeão "🛠️ Administração (dev)" (`ParentAreaScreen.js:1127-1145`) e o botão "Abrir Luz" está no **terceiro** (`:1184-1190`). Chegar ao botão exige **rolar o dedo por cima do *switch***. O protocolo **sabia** disso — cita as duas linhas na mesma frase — e não previu **nenhuma** contramedida física. | §10, linha 373 |
| **P-2** | **Zero *checkpoints* intermediários.** §10 vai de `B1..B4` direto para `A1..A5`; a primeira verificação de *storage* só aparece em `F4`/`F5`. Executado **como escrito**, o desvio só seria percebido **depois** de o Ateliê já ter sido produzido — e ambos os insumos cairiam no mesmo `STOP`, como na `PREP-01`. **O que salvou a sessão foi uma improvisação do executor** (`CHECKPOINT-C60.tar` + `CHECKPOINT_C60_ASYNC_DIFF.txt`), que **não constam** de §10 nem da lista de evidências de §13. | §10 · §13 |
| **P-3** | **Proibições fora da lista de passos.** A proibição de entrar na `NarrationScreen` existe **só** em §7.3 (tabela de *writers* excluídos) e na nota de rodapé de §10 (`D-PREP02-06`) — textos endereçados ao **auditor**, não ao **operador**. A condição de `STOP` §14.12 ("qualquer ação fora da rota congelada") é **inauditável como escrita**: nenhum artefato exigido registra a rota percorrida. | §7.3 linha 305 · §10 linha 387 · §14.12 |

### 8.2 O que funcionou

A **allowlist lógica de §7.1 estava materialmente correta** (quatro chaves, `snap = 'ready'`,
`@ptf_achievements_seen` fora) e a **allowlist física de §8 foi respeitada** (os 12 caminhos de
`STOP_DEVICE_FILELIST.txt` estavam pré-declarados). A **disciplina de parada funcionou**: `STOP`
declarado, `TAR-STOP-C60` preservado, nenhuma chave apagada, nenhuma continuação ao Ateliê, nenhuma
conclusão causal inventada. **Falhou a disciplina de rota, não a de parada.**

### 8.3 Achado de processo

O *commit* `c71e8b6` — que **corrigiu a rota do C60** para a Área dos Pais — foi criado às **15:28:57**.
A sessão física começou às **15:34:28**: **~5,5 minutos de margem**, sem nenhum ponto de rebriefing
entre a mudança de rota e a execução. Uma rota nova competiu com um hábito antigo, sem intervalo.

---

## 9. `PREP-LEGADO-03` — desenho (**NÃO executada**)

A causa está fechada o suficiente para desenhar. **Nada aqui é executado por este documento.**

### 9.1 Invariantes herdados

- *Baseline* = **`TAR-PRE02.tar`**, `SHA256 8486DEC65C2A61834B54C5B8FCB54FD5BDEE6B8DD7BF76B9359443F0E2FF1BA7`
  (conferido). **Não** é "aparelho limpo".
- **`PREP-01` e `PREP-02` preservadas integralmente.** Evidência nova em diretório próprio
  (`C:\tmp\ptf_evidencias\PREP-LEGADO-03\`). **Nenhum arquivo antigo é sobrescrito, apagado ou
  reabilitado.** Nenhuma allowlist é ampliada retroativamente.
- **Ordem obrigatória:** o **C60 é criado com o Modo Criador AUSENTE/`OFF`**; **só depois** o Modo
  Criador é ligado, para o Ateliê (`Criar Livre` → obra real → *save* histórico).
- Proibido: *seed*, fabricação de *storage*, bancada (`Coloring60Lab`), edição manual de
  `AsyncStorage`, `pm clear`, *root*.

### 9.2 *Checkpoints* `G0..G5` (todos **somente leitura**: `TAR` + *dump* do `RKStorage`)

| ID | Momento | O que prova | `STOP` se |
|---|---|---|---|
| **`G0`** | Após o *boot* do app, **antes de qualquer toque** | que o *boot* sozinho **não** grava nada | `ADDED ≠ 0` ou `CHANGED ≠ 0` |
| **`G1`** | Ao **entrar na Área dos Pais**, **antes** de tocar em "🛠️ Administração (dev)" | que `ParentalGate` + montagem da tela não gravam | qualquer chave nova |
| **`G2`** | Com o acordeão aberto, **antes** de tocar em "Abrir Luz" | **prova positiva de que `@ptf_creator_qa_mode` continua AUSENTE** | a chave existir, com qualquer valor |
| **`G3`** | Com o `ColoringScreen` montado, **antes de pintar** | que abrir o editor não grava; e que **não houve passagem por `NarrationScreen`** (`@ptf_progress_creation` e `@ptf_coloring60_milestone_invite_seen_*` **ausentes**) | qualquer uma das duas presente |
| **`G4`** | **Imediatamente após o *save* do C60**, antes de **qualquer** navegação adicional | que o *save* grava **exatamente** as quatro chaves de §7.1 | `ADDED ≠ 4` ou chave fora da allowlist |
| **`G5`** | Após ligar o Modo Criador e **antes** de abrir o Ateliê | isola a escrita legítima de `@ptf_creator_qa_mode = 'true'` do bloco do C60, que já está lacrado | qualquer chave além dessa |

`G2` e `G3` endereçam diretamente as duas causas observadas; `G4` fecha o insumo do C60 **antes** de
o Ateliê existir, de modo que um desvio posterior **não contamina retroativamente** o C60 — a falha
estrutural da `PREP-02` (`P-2`).

### 9.3 Mitigação de erro humano (§14 da diretiva)

1. **Roteiro em forma de toques, não de blocos.** Cada linha = **um** toque, com o alvo nomeado e o
   que **não** tocar. As proibições saem das tabelas de justificativa e entram **na lista de passos**.
2. **Instrução visual explícita para `B2`:** *"role a lista **sem tocar**; o **primeiro** card é o
   *switch* Modo Criador — passe por ele; o alvo é o **terceiro** card, botão **Abrir Luz**."*
3. **`G2` como trava dura:** a rota **não avança** para o editor antes de a ausência de
   `@ptf_creator_qa_mode` estar provada. Se ela já existir, `STOP` **antes** de qualquer pintura — e
   o insumo não se perde por descoberta tardia.
4. **Reordenação de controles no `ParentAreaScreen` — NÃO autorizada aqui.** Seria a mitigação mais
   eficaz (afastar fisicamente o *switch* do botão), mas exige alterar `src/` do *runtime* histórico,
   o que **invalidaria a proveniência** do *bundle* `7de7085`. **Rejeitada por construção.**
5. **Rebriefing obrigatório:** nenhuma sessão física começa a menos de **30 minutos** de um *commit*
   que altere a rota, e o operador **relê em voz alta** a lista de toques antes do `G0`.
6. **Automação de UI por coordenada — NÃO admitida.** Avaliada e **rejeitada**: `adb shell input tap`
   sintetiza evento na camada do `InputDispatcher` e **produziria interação indistinguível da real no
   `raw.log`**, destruindo justamente a forense de canal (§4) que fechou esta auditoria. O que se
   ganha em precisão de toque se perde em **auditabilidade** — e auditabilidade é o produto. A
   interação continua **humana e real**.
7. **Proveniência com veredito:** o gerador de `BUNDLE_PROVENANCE` passa a normalizar caminhos e a
   imprimir linha de resultado explícita (§7 acima).
8. **`CHECKPOINT` promovido a artefato de protocolo:** o que salvou a `PREP-02` por improviso vira
   item obrigatório de §13.

### 9.4 Sequência de alto nível (desenhada, não executada)

`restaurar TAR-PRE02` → `R9` (zeros) → *boot* → **`G0`** → Perfil → `ParentalGate` → **`G1`** → abrir
acordeão → **`G2`** → "Abrir Luz" → **`G3`** → pintar → "Pronto!" → **`G4`** → sair (`POP_TO_TOP`) →
ligar Modo Criador → **`G5`** → `Criar Livre` → obra real → *save* histórico → `TAR-POST03` →
`DIFF_FISICO` + `ASYNCSTORAGE_DIFF` → avaliação das allowlists.

---

## 10. Itens que permanecem **NÃO DETERMINADOS**

Registrados como tais, sem preenchimento por conveniência:

- **Identidade nominal dos modais #1 (15:50:22.649) e #2 (15:50:33.976).** Um deles é, quase
  certamente, a celebração genérica da cena 1 (`UnlockCelebration`, `NarrationScreen.js:433`); o outro
  **não** tem identificação. O que **é** certo: **nenhum dos dois gravou qualquer chave** — não há
  `rowid` vago ou novo que os acomode. (Os guias do Beni estão excluídos: `@ptf_beni_guide_home_v1`,
  `_stars_v1`, `_profile_v1` e `_adventures_v1` já valiam `'true'` no *baseline*.)
- **Se o operador chegou a ver o cartão "Colorir 60, A Criação" da Área dos Pais.** O `ColoringScreen`
  montou **uma única vez**, a partir de modal. Não há evidência de toque em "Abrir Luz".
- **Horário absoluto de cada escrita de `AsyncStorage`.** O `AsyncStorage` não emite `logcat`; as
  horas de escrita em §3 são **intervalos inferidos** ancorados na ordem física dos `rowid`.
- **Contagem de "conhecidos" do *bundle* (304).** Derivada por subtração; o relatório não a imprime
  nem documenta o critério de classificação.

---

## 11. O que esta auditoria **NÃO** fez

Não se tocou o aparelho; não se executou `adb`, Metro, Expo, `logcat` nem `logcat -c`; não se
restaurou nenhum `TAR`; não se alterou `AsyncStorage`, sistema de arquivos do app, `src/`, `scripts/`,
`package.json`, `app.json` nem `eas.json`; não se refez o *bundle*; nenhuma evidência da `PREP-01` ou
da `PREP-02` foi alterada, apagada ou sobrescrita; nenhuma allowlist foi ampliada retroativamente.

> ⛔ **`PREP-LEGADO-01` = `STOP`.** ⛔ **`PREP-LEGADO-02` = `STOP`.**
> ⛔ **`R2 · Sessão 2` = NÃO INICIADA.** ⛔ **`F6-SG-A` = NÃO CONCEDIDO.** `R1-PEND-1..5` = **ABERTAS**.
> ⛔ **`PREP-LEGADO-03` = DESENHADA, NÃO EXECUTADA.**
