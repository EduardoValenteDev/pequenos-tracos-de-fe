# 89 — `F6 · SG C` — Implementação da estabilização responsiva

> **Artefato de execução (§15 da ordem).** Registra o que foi implementado a partir
> da perícia congelada `88_F6_SG_C_PERICIA_FINAL_DE_CAUSAS_RAIZ.md` e da autorização
> `D-FUND-SG-C-ESTABILIZACAO-RESPONSIVA-01`.
>
> **Resultado desta rodada:**
> `SG_C_IMPLEMENTATION = AUTOMATED_COMPLETE_AWAITING_PHYSICAL_REVALIDATION`
>
> **`SG C` NÃO é declarado `PASS`.** A campanha física está congelada (§16) e não
> foi executada. Nenhum push, merge, release, build nativo, instalação, ADB ou
> gravação aconteceu.

---

## 1. Lacre e fronteiras

```
ENTRY_HEAD ....................... 4a433a0452358ee26e49796d3377b9923dcb0130
SG_C_IMPLEMENTATION_BASELINE ..... 40dd8ed57764e0dcee5475891775699728d8ecaa
HEAD ao fim da implementação ..... feb750ecf5a22f8b6fb29aef11378a551437d79a
BRANCH ........................... feat/fase6-shell-splash
REMOTO ........................... a branch NÃO existe no remoto — nada foi enviado
ÁRVORE DE TRABALHO ............... limpa
DIRETÓRIO ........................ C:\tmp\ptf_fase6_shell_splash_wt
```

A baseline documental (`40dd8ed`) é um commit exclusivamente de documentação,
criado **antes** da primeira mutação de `src/**`, exatamente como o §2 exigiu.

---

## 2. Placar por causa

Ordem canônica executada sem reordenamento: **A2 → A1 → B → C2 → C1 → C3
(condicionado) → D2 → E1**.

| # | Causa | Estado | Commit | Portão | Smoke |
|---|---|---|---|---|---|
| 1 | `A2` — teto do apoio no `EditorialSurface` | **GREEN** | `9a283e7` | `G-RSP-6` (ampliado) | 4971/4971 |
| 2 | `A1` — telas de aba compõem pela região medida | **GREEN** | `d70fffb` | `G-RSP-8` (novo) | 4972/4972 |
| 3 | `B` — a medida só vale para a janela em que foi tirada | **GREEN** | `725465b` | `G-RSP-9` (novo) | 4973/4973 |
| 4 | `C2` — teto de altura da região do mapa | **GREEN** | `f449865` | `G-MAP-6` (novo) | 4974/4974 |
| 5 | `C1` — par lógico do mapa sem exigir arrasto | **GREEN** | `2bff1ae` | `G-MAP-7` (novo) | 4975/4975 |
| 6 | `C3` — placeholders nos pinos | **`STOP_C3_UNPROVEN`** | *(nenhum — nenhum patch criado)* | — | — |
| 7 | `D2` — caixa de texto do Ateliê em paisagem | **GREEN** | `dfdbf14` | `G-CVS-4` (novo) | 4976/4976 |
| 8 | `E1` — expiração de rodada da Ovelhinha | **GREEN** | `feb750e` | `G-OVL-1` (novo) | 4977/4977 |

**Sete causas implementadas, sete commits independentes.** Nenhum commit genérico
de "fix responsividade"; nenhum commit misturando causas.

---

## 3. O que cada correção fez

### 3.1 `A2` — `9a283e7` · teto do apoio no `EditorialSurface`

A região de apoio acompanhava a **janela**; em `1317dp` ela abria muito além da
coluna de leitura. Passou a ser limitada à mesma coluna que o corpo do texto já
respeitava — função pura, quatro consumidores, risco mínimo. `G-RSP-6` ganhou as
cláusulas `(E)` e `(F)`; um mutante executável mata a remoção do teto.

### 3.2 `A1` — `d70fffb` · a região medida manda, não a janela

Com a barra lateral à esquerda, a janela de `1317dp` **não** é a área da tela de
aba: sobram `1077dp`. Home e Brincar compunham pela janela e erravam a faixa.
Passaram a compor pela **região medida**. Portão novo `G-RSP-8`, com os dois eixos
(executável e textual); `G-SID-3` permaneceu verde e `MT-16` continua morto.

### 3.3 `B` — `725465b` · a medida só vale para a janela em que foi tirada

Entre `onLayout → setState` e `useWindowDimensions` há **um quadro de defasagem**.
No quadro do meio, a janela já girou e a medida ainda é da orientação anterior — e
o layout usa as duas juntas. A correção **carimba a medida com a janela em que foi
tirada**: enquanto o carimbo não bate, vale a janela; quando bate, vale a medida.
`onLayout` passa a ser **correção**, nunca gatilho.

Aplicada nas quatro superfícies da perícia (mapa, Pares do Beni, Cadê a Ovelhinha,
Monte a Cena). O padrão é **inline por superfície** porque o artefato 88 provou que
não existe utilitário único a corrigir (`IS_GLOBAL = PARCIALMENTE`) — inventar um
módulo aqui seria arquitetura nova, não correção.

Detalhe que salvou um invariante: no mapa o carimbo entrou no cálculo de
`mapWidth`, **não** no portão de montagem do `ScrollView`. Carimbar o portão
desmontaria a lista e destruiria a posição de rolagem que a câmera existe para
preservar (`G-MAP-3`).

Em Monte a Cena o layout visível já saía da janela; o que atrasava um quadro era o
mapa de **toque** do motor. Como `setGeometry` só escreve refs, a publicação
imediata não custa render.

### 3.4 `C2` — `f449865` · teto de altura da região do mapa

A região do mapa derivava a altura só da largura (`w / (9/16)`). Em paisagem de
tablet isso produzia **1915dp de altura para 700dp de viewport** — a arte ficava
maior que a tela inteira, e a criança rolava dentro de um pergaminho gigante.

A correção reutiliza `computeImageRect`, a **mesma** regra "contain" que o modal
"Ver mapa" já usava — nenhuma segunda primitiva de escala, nenhum número mágico
(o defeito histórico `P-30` foi evitado de propósito). O teto só morde quando
`containerW > viewportH × 0,5625`.

**Consequências declaradas, ambas no raio físico:** em paisagem o mapa passa a ser
uma faixa de pergaminho centralizada (letterbox); em telefone retrato de viewport
curta o teto morde poucos dp (`390×674 → 379`).

`MAP_ANCHOR_FRAMING = 0,50` **não foi tocado** — enquadramento vive dentro de
`computeCameraTarget`, escala é outro assunto.

Redução de área decodificada por região (medida com o harness real):

| Cenário | Antes | Depois | Fator |
|---|---|---|---|
| paisagem `SM-X510` (aba, 1077×700) | 1077×1915 = 2,06 MP | 394×700 = 0,28 MP | **7,48×** |
| retrato `SM-X510` (aba, 643×1180) | 643×1143 = 0,73 MP | 643×1143 = 0,73 MP | 1,00× |
| telefone retrato (390×674) | 390×693 = 0,27 MP | 379×674 = 0,26 MP | 1,06× |

### 3.5 `C1` — `2bff1ae` · o par lógico nasce do estado visível

Dois invariantes dividiam um `if` por acidente. O guarda de gesto
(`userScrolledRef`) protege a **região ativa** — isso é da Fase 1.1.5 e continua
valendo. Mas a **posição lógica** (região + fração) estava presa ao mesmo guarda:
quem abrisse o mapa e girasse **sem nunca arrastar** era mandado de volta para a
âncora, perdendo o lugar.

A gravação do par lógico saiu de dentro do guarda e passou a ser função do estado
**visível**. A abertura pela câmera (`TK-A-020`/`CN-2`) foi preservada e `scrollY`
bruto continua recusado.

### 3.6 `C3` — **`STOP_C3_UNPROVEN`** · nenhum patch criado

Ver §4 — é o único ponto desta rodada que não fecha.

### 3.7 `D2` — `dfdbf14` · o sheet de nome respeita a altura útil

O documento lógico do Ateliê foi **absolvido** pela perícia linha a linha
(`PASS_NO_CHANGE`); `AtelierCanvas.js` não foi tocado (cláusula `(J)` do portão
existe para que essa proibição não dependa de memória humana).

Mecanismo real encontrado na implementação: `nameKav` tinha `width: '100%'` e
**nenhum `flex`**, então o `KeyboardAvoidingView` media o tamanho do **próprio
cartão**. Com `behavior='height'` no Android, o KAV encolhe a própria altura pela
altura do teclado — **mas não havia área alguma para encolher**. O cartão (~190dp
naturais) continuava ancorado embaixo, atrás do teclado.

Correção em duas metades que só funcionam juntas: um **teto**
(`computeNameSheetMaxHeight`, pura, fora do componente) e uma **saída** (o conteúdo
do cartão rola). Sem a saída, o teto trocaria um cartão atrás do teclado por um
cartão cortado com o botão de guardar fora da tela.

A medida vem de `onLayout`, logo obedece à CAUSA B: é **carimbada com a janela**.

### 3.8 `E1` — `feb750e` · saída da capa técnica sem depender de `onError`

A cena só descobria com os **três** `onDisplay` do token corrente; o único caminho
alternativo (`temErro`) exige um `onError` **explícito**. Há pelo menos um caminho
em que nenhum dos dois chega — retângulo de imagem ainda vazio quando o container
monta, antes de `medirArea`. A capa técnica ficava para sempre, **sem sinal algum**
para a criança.

Correção no menor ponto arquitetural, como a perícia determinou — o reducer puro:

- ação **`EXPIRAR`** por rodada, que é uma nova tentativa e nunca uma revelação, e
  que **se recusa** a agir sobre rodada antiga, cena já revelada, cena já pronta ou
  erro já declarado (ali quem manda é o "tentar novamente" que já existe);
- **geração de recarga** (`recarga`) no próprio estado, avançada por `RETRY` e por
  `EXPIRAR`. Limpar bandeiras não basta: sem `recyclingKey` novo o `expo-image`
  devolve o mesmo bitmap e nunca reemite `onDisplay`. O contador paralelo da tela
  (`retryNonce`) foi eliminado — **uma primitiva só**, não duas fontes de verdade.

A tela apenas agenda e cancela (`T.prazoCarga = 7000`). O relógio reinicia a cada
progresso real: cena lenta ganha prazo novo em vez de ser reiniciada no meio.
`ovelhaGameService.js`, o gate de exibição e a composição de `kBg`/`kSheep` ficaram
intactos.

---

## 4. `C3` — veredito `STOP_C3_UNPROVEN`

A autorização do fundador definiu **três estados possíveis e apenas três**, todos
condicionados a um `RED TEST` instrumentado executado **depois** de `C2`:

1. o sintoma **não sobrevive** a `C2` → `NO_PATCH_REQUIRED`, nenhum patch;
2. o sintoma sobrevive **e** o teste vermelho **prova** o mecanismo → patch mínimo
   causal;
3. o sintoma persiste **e** o mecanismo **continua não demonstrado** →
   `STOP_C3_UNPROVEN`, e é **proibido adivinhar solução**.

**O observável de `C3` é físico.** A letra inicial só aparece pelo `renderFallback`
de `RecoverableImage`, que exige um `onError` **real** da decodificação — evento que
não existe em Node, nem no `bundle:check`, nem no smoke. O protocolo do próprio
artefato 88 já dizia isso: *"`C3` → Mapa: rolar o mapa inteiro nas duas orientações,
duas sessões distintas"*. E a campanha física está **congelada por esta mesma ordem**
(§16: sem build nativo, sem instalação, sem ADB, sem nova gravação).

Logo, nesta rodada **não é possível estabelecer nem que o sintoma sumiu, nem que
persiste**. Os estados 1 e 2 exigem observação que a ordem proíbe; o estado 3 é o
único que descreve honestamente a situação, e ele já traz a conduta correta:
**nenhum patch**.

```
C3_STATE ............. STOP_C3_UNPROVEN
PATCH_CRIADO ......... NENHUM
ARQUIVOS TOCADOS ..... NENHUM (StoryMapMarker.js e RecoverableImage.js intactos)
MOTIVO ............... o RED TEST instrumentado exige aparelho; §16 congela a física
```

**Evidência automatizável recolhida (não é prova):** o mecanismo inferido pela
perícia era pressão de decodificação, e `C2` reduziu a área de bitmap montada por
região em **7,48×** em paisagem (tabela do §3.4) — exatamente o eixo do mecanismo.
Isso torna `NO_PATCH_REQUIRED` **plausível**, e é precisamente por isso que a
perícia mandou olhar depois de `C2`. Plausível não é provado, e a diferença é o
motivo deste stop existir.

Inspeção de leitura confirmada nesta rodada, sem alterar nada:

- `RecoverableImage` repassa `...rest` ao `Image`, então a mitigação candidata
  (`resizeMethod="resize"`) **estaria disponível** sem asset novo e sem dependência
  — mas ela permanece **não autorizada**, porque `C3 ALLOWED = nada até o RED TEST
  concluir` e aplicá-la agora seria adivinhar;
- cada pino decodifica a capa 16:9 inteira para exibi-la num círculo de 40–56dp —
  o dado da perícia continua verdadeiro.

### `RED TEST` congelado para a campanha física

Sem instrumentação nova no código (o observável já é visível a olho nu):

```
RT-C3-1  Abrir o mapa em RETRATO. Rolar do topo ao fim, devagar. Registrar
         quantos pinos exibem letra inicial e QUAIS histórias.
RT-C3-2  Girar para PAISAGEM. Repetir a varredura completa.
RT-C3-3  Fechar o app por completo, reabrir e repetir RT-C3-1 e RT-C3-2
         (a perícia registra variação ENTRE SESSÕES — a prova exige duas).
RT-C3-4  Confrontar com o logcat: `WrappingUtils … ReactImageDownloadListener
         $EmptyDrawable`. A campanha anterior registrou 100+ ocorrências.

LEITURA:
  zero placeholders nas duas orientações e nas duas sessões ..... NO_PATCH_REQUIRED
  placeholders persistem ....................................... abre o patch mínimo
                                                                  causal, e só ele
```

---

## 5. Portões criados nesta rodada

| Portão | Causa | O que prova |
|---|---|---|
| `G-RSP-6` (ampliado) | `A2` | o apoio do Editorial não passa da coluna de leitura |
| `G-RSP-8` | `A1` | telas de aba compõem pela região medida |
| `G-RSP-9` | `B` | a medida carimbada extingue o quadro intermediário da rotação |
| `G-MAP-6` | `C2` | a região do mapa tem teto relativo à viewport, pela primitiva existente |
| `G-MAP-7` | `C1` | o par lógico é função do estado visível; o guarda de gesto continua só para a região ativa |
| `G-CVS-4` | `D2` | o sheet respeita a altura útil, com saída rolável, sem tocar o documento lógico |
| `G-OVL-1` | `E1` | há saída da capa técnica que não depende de `onError`, e ela se recusa a agir onde não há o que recuperar |

O id `G-LFC-2` **não** foi reutilizado: ele já pertence ao PLAN §26 · `P-164`. Foi
por isso que o portão de `C1` nasceu como `G-MAP-7`.

**Todo portão nasceu VERMELHO antes do patch** e ficou verde depois — sem exceção.

### Mutantes

| Causa | Mutantes | Resultado |
|---|---|---|
| `A2` | 1 | morto |
| `A1` | `MT-16` (regressão) | morto |
| `D2` | 4 | 4/4 mortos |
| `E1` | 5 | 5/5 mortos |

Registro honesto de um sobrevivente: em `E1`, o mutante "efeito sem `clearTimeout`"
**sobreviveu na primeira rodada**, porque a cláusula procurava a palavra no arquivo
inteiro e a tela já cancelava outros temporizadores. A cláusula foi estreitada para
a janela do próprio efeito e o mutante morreu. O portão só foi dado por bom depois
disso.

---

## 6. Reconciliação global (§14)

| # | Verificação | Resultado |
|---|---|---|
| 1 | `npm run verify:runtime` (bundle:check → smoke, nessa ordem) | **verde** |
| 2 | `npm run bundle:check` (Metro, 2382 módulos) | **verde** |
| 3 | `npm run smoke` | **4977/4977 PASS, 0 falhas** |
| 4 | `npx expo-doctor` | **18/18** |
| 5 | `npm run gate:platform-scope` | **OK** — 0 arquivos próprios `.ios/.android/.native` em 1469 |
| 6 | Dependências (`package.json`, `package-lock.json`) | **intocadas** |
| 7 | Configuração Expo (`app.json`, `babel.config.js`, `metro.config.js`) | **intocada** |
| 8 | `MAP_ANCHOR_FRAMING` | **`0.5`, intocado** |
| 9 | Breakpoints canônicos (`tablet: 600`, `tabletL: 900`) | **intocados** |
| 10 | `AtelierCanvas.js` (documento lógico) | **intocado** |
| 11 | Achados congelados do §13 | **nenhum arquivo tocado** |
| 12 | Um commit por causa, nenhum genérico | **7 commits, 7 causas** |
| 13 | Árvore de trabalho | **limpa** |
| 14 | Push / merge / release / build / ADB / instalação / vídeo | **nenhum** |

Baseline de smoke da ordem era `4970/4970`; a contagem subiu para `4977` pelos sete
portões/cláusulas novas, com **100% PASS** em todas as rodadas.

### Arquivos alterados desde a baseline

```
scripts/smoke.js
scripts/testing/mapAnchorHarness.js
scripts/testing/surfaceArchetypeHarness.js
src/components/layout/EditorialSurface.js
src/components/map/MapRegion.js
src/data/adventureMap.js
src/screens/AdventureMapScreen.js
src/screens/AtelierCanvasScreen.js
src/screens/BrincarScreen.js
src/screens/CadeAOvelhinhaScreen.js
src/screens/HomeScreen.js
src/screens/MonteACenaTableGameScreen.js
src/screens/ParesDoBeniScreen.js
src/services/ovelhaTransition.js
```

---

## 7. Raio físico congelado (§16 — **não executado**)

Nada abaixo foi rodado. Fica registrado para a campanha que o fundador autorizar.

| Causa | O que revalidar no aparelho |
|---|---|
| `A1`, `A2` | Home, Brincar e telas editoriais nas três faixas, com barra lateral |
| `B` | girar durante a carga: mapa, Pares, Ovelhinha e Monte a Cena |
| `C2` | mapa em paisagem (letterbox novo) e em telefone retrato de viewport curta |
| `C1` | abrir o mapa e girar **sem nunca arrastar**; conferir que o lugar é mantido |
| `C3` | `RT-C3-1..4` do §4 — é o teste que decide o veredito |
| `D2` | Ateliê em paisagem, teclado aberto, salvando um desenho real |
| `E1` | abrir o jogo e girar durante a carga, nas duas orientações |

---

## 8. Estado dos arquivos

| Arquivo | Estado |
|---|---|
| `src/**` e `scripts/**` das sete causas | **commitados** (7 commits) |
| `specs/.../89_F6_SG_C_IMPLEMENTACAO_ESTABILIZACAO_RESPONSIVA.md` | **salvo no disco** |
| `src/components/map/StoryMapMarker.js`, `src/components/ui/RecoverableImage.js` | **intocados** (`C3` sem patch) |

**Nenhum push. Nenhum merge. Nenhum build nativo. Nenhuma interação com o tablet.**

---

## 9. Pendência única para o fundador

`C3` é a **única** causa autorizada que não fecha nesta rodada, e ela não fecha
porque a prova exige o aparelho que a própria ordem congelou. Duas saídas, ambas
do fundador:

1. **autorizar a campanha física** — aí `RT-C3-1..4` roda junto com o resto do raio
   do §7 e `C3` recebe seu veredito definitivo; ou
2. **manter congelado** — `SG C` segue com `C3` em `STOP_C3_UNPROVEN` registrado, e
   o achado permanece vivo em vez de apodrecer num patch adivinhado.

Nenhuma das duas é decidida aqui.
