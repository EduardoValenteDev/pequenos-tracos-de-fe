# 🟢 VERDE · AUDITOR FINAL · `F6-SG-C` / `F6-R1`

> ## ⚖️ NOTA DE CUSTÓDIA — versionagem posterior (`DOC REPAIR 01`, `2026-08-13`)
>
> Esta nota é **acréscimo desta missão** e não faz parte do relatório histórico. Ela existe
> para que a versionagem tardia não seja confundida com contemporaneidade.
>
> **a.** O relatório abaixo foi **originalmente emitido** quando o canônico estava em
> **`002872a`** (`002872a0afe626799ecbf2195832a10f9b3de025`). Todos os caminhos, contagens e
> medições do corpo referem-se **àquele** `HEAD`.
>
> **b.** Sua **versionagem no Git ocorreu posteriormente**, nesta missão `DOC REPAIR 01`, com o
> canônico já em `8086cda` — quatro *commits* documentais adiante (`0f5766b`, `294232c`,
> `820d2e3`, `8086cda`). O relatório existia como entrega do auditor; o que faltava era o
> **lacre no corpus**.
>
> **c.** Versioná-lo agora **não altera sua data lógica de emissão**. A data de emissão é a de
> `002872a`; a data de versionagem é `2026-08-13`. As duas são distintas e ambas ficam
> registradas.
>
> **d.** A versionagem **não transforma constatações posteriores em evidência contemporânea de
> `002872a`**. Nada que foi apurado depois — `PREBUILD_CUSTODY_HARD_STOP` (artefato `26`), seu
> adendo, sua errata, ou `D-FUND-BUILD-SEQUENCE-01` — retroage para dentro deste relatório. Onde
> houver divergência entre este corpo e os artefatos posteriores, **prevalecem os posteriores**,
> e este documento é lido como **fotografia de `002872a`**.
>
> **e.** O corpo abaixo é **preservado como relatório histórico**, integral. Não foi resumido,
> reescrito, reconstruído, nem teve conclusão alterada.
>
> **Nota de transcrição (mecânica, não editorial).** O relatório chegou a esta missão por
> anexo, com a codificação de caracteres corrompida em trânsito (`UTF-8` lido como `cp1252`) e
> com delimitadores de tabela e marcadores de ênfase colapsados pela conversão. A transcrição
> **restaurou a codificação e os delimitadores**, sem alterar uma única palavra, número, veredito
> ou token. Os símbolos que o transporte colapsou (`✅`, `—`, `→`, `−`, `≥`, `≈`, `×`) foram
> restaurados por contexto. **Nenhum conteúdo ausente foi inventado**: onde o anexo não trazia
> texto, este documento também não traz.
>
> **Por que este artefato existe.** O `GATE 0` do 🟦 AZUL apurou que os tokens
> `SGC_FINAL_GATE_AUTOMATION_PASS_BUILD_AUTHORIZED` e `BUILD_NATIVE_AUTHORIZED` eram citados por
> `D-FUND-BUILD-SEQUENCE-01` mas **não existiam em nenhum artefato do corpus** (risco `R-1`).
> Este lacre fecha exatamente essa lacuna: os dois tokens, e **todas as condições que os
> acompanhavam**, passam a ser verificáveis na árvore — em especial o §16 (as doze provas de
> antes/durante/depois), o §17 (os oito riscos) e o §18 (*"`READY_FOR_FINAL_GATE` não é
> `SG-C PASS`"*).
>
> ⛔ **Este lacre não concede nada.** `F6-SG-A` = **NÃO CONCEDIDO**. `F6-SG-C` = **NÃO
> CONCEDIDO**. `SD-1` = **NÃO CONCEDÍVEL**. `R1-PEND-1..5` = **ABERTAS**. `BLOCOS B`..`E` = **NÃO
> EXECUTADOS**. O *build* autorizado é **GERAR, NÃO INSTALAR** — a instalação foi restringida
> depois, por `D-FUND-BUILD-SEQUENCE-01` e `D-FUND-PREBUILD-01`, e o §16 item 10 deste relatório
> **não** vale como autorização de instalar.

---

<!-- ↓↓↓ CORPO HISTÓRICO PRESERVADO — emitido em `002872a`, não modificado ↓↓↓ -->

# 🟢 VERDE · AUDITOR FINAL · F6-SG-C / F6-R1

> Todos os caminhos citados são relativos a `C:\tmp\ptf_fase6_shell_splash_wt` no `HEAD` `002872a`. Não uso links clicáveis de propósito: o *worktree* deste auditor está preso em `58080b4`, anterior a quase todo o arco, e o link apontaria para um arquivo que lá não existe. Tudo foi lido por `git show`/leitura direta do *worktree* do Azul, sem escrita, sem ADB, sem Metro, sem *build*.

---

## 1. `HEAD`, status, remoto

| Item | Esperado (§1) | Medido | |
|---|---|---|---|
| Pasta | `C:\tmp\ptf_fase6_shell_splash_wt` | idem | ✅ |
| Ramo | `feat/fase6-shell-splash` | idem | ✅ |
| `HEAD` | `002872a` | `002872a0afe626799ecbf2195832a10f9b3de025` | ✅ |
| `git status --porcelain` | vazio | vazio | ✅ |
| `e393768..HEAD` | 30 *commits* / 41 arquivos | 30 / 41 | ✅ |
| Ramo no `origin` | ausente | `git ls-remote --heads origin feat/fase6-shell-splash` → vazio | ✅ |

Nenhum *push*, nenhum *merge*. **§1 confere integralmente.**

## 2. Escopo auditado

Arco inteiro `e393768..002872a`, não apenas os dois últimos *commits*: 30 *commits*, 41 arquivos, +6402/−315. Li na íntegra os quatro arquétipos, `displayType.js`, `useWindowBand.js`, `TabletSidebar.js`, `ContentContainer.js`, o *plugin* nativo, `app.json`, os trechos relevantes de `scripts/smoke.js` (`TA-14` inteiro), os artefatos `21`..`25`, `06`, `10`, `14` e `docs/DECISIONS.md`. Verifiquei as três afirmações externas do *plugin* contra o `node_modules` real, e não contra o relatório.

## 3. Cadeia dos pacotes `C-C1`..`C-C10` + `C-GOV1`

Rótulo → *commits*, reconstruído do `git log` e conferido contra o artefato `25` §1:

`C-C1` `6b78b34` · `C-C2` `1cd30df`+`c44ac28` · `C-C3` `03426d7`+`957be23`+`9272760` · `C-C4` `1f72438`+`4130aca`+`591bc57` · `C-C5` `3ef00af` · `C-C6` `f825459` · `C-C7` `f08f3aa`+`fd88ab9` · `C-C8` `76cfdf9` · `C-C9` `a1b4380`+`06ab3ad` · `C-C10` `e2702d2` · `C-GOV1` `a9d1340`+`237fa8e`+`3ea12e8`+`77e1e19`+`002872a`, mais nove *commits* sem rótulo no assunto (ratificação, mutantes, *callout*, inventário, artefatos).

A ordem respeita `OR-6`: `C-C10` (orientação nativa) é o **último** pacote material, isolado em um *commit* que toca exatamente dois arquivos — `app.json` e o *plugin*. Os arquétipos nascem sem consumidor (`TK-C-004`) e só depois são adotados por onda, cada onda em seu pacote.

**Divergências materiais procuradas e o que foi encontrado:**

| Suspeita do §3 | Resultado |
|---|---|
| `Platform.isPad` | **0 ocorrências reais.** A única linha é o comentário proibitivo em `useWindowBand.js:15` |
| `expo-device` | **0 reais** — mesma linha de comentário |
| `expo-screen-orientation` | **0 reais** — única menção é o comentário do *plugin* declarando que **não** foi instalado |
| Dependência nova | **nenhuma** — `git diff e393768..002872a -- package.json package-lock.json` é vazio |
| Regra "tablet = duas colunas" | **ausente.** As duas ocorrências de "duas colunas" estão em `MonteACenaHomeScreen.js:3` e `MonteACenaStoryScreen.js:3`, telas de jogo **intocadas pelo arco**, descrevendo `numColumns={2}` legado e fixo — grade de conteúdo, não regra de faixa |
| *Breakpoint* estrutural local | **ausente.** `breakpoints.*` fora de `tokens.js`/`useWindowBand.js` só aparece em `productTheme.js:113`, campo legado de compatibilidade, pré-existente |
| `Dimensions.get` | **0 reais** — duas ocorrências, ambas comentário |
| `GameSurface` imposto antes de `F12A` | **não** — zero consumidor (§5 abaixo) |
| `G-RSP-5` criado fora da *task* correta | **não** — nasce em `a1b4380` (`C-C9`/`TK-C-014`), depois de `TK-C-003`, exatamente como a Rodada 9 já havia apurado |
| Área protegida sem autorização | **nenhuma** (§12 abaixo) |
| Antecipação de `F7`/`F9`/`F11`/`F12A`/`B2` | **não.** `ImmersiveSurface` declara `companionCapacity` e diz por escrito que a composição é `F9`; `GameSurface` diz que a adoção é `F12A`; `TabletSidebar` registra que os defeitos 4–5 são de `B2` e **nenhuma medida deles foi tocada** |

Nenhum escopo indevido encontrado.

## 4. Arquitetura responsiva

`useWindowBand` é a única tradução de medida em política: `bandForWidth` é função **pura**, exportada e provável em Node, com `>=` em `breakpoints.tabletL` (900) e `breakpoints.tablet` (600), *fallback* `COMPACT` para entrada não finita. O *hook* devolve `{width, height, isLandscape, band}` — **faixa discreta e medida contínua saem juntas**, e é isso que permite geometria real conviver com composição por faixa sem segunda primitiva.

A separação está sustentada no consumo: `AppNavigator` usa `band` para decidir estrutura e `width` cru para `tabW`/`calloutW`/`calloutLeft`; `StoryBookScreen` passa `width, screenH` reais a `computeBookImageSize`; `GameSurface` **não usa** **`band`** **em conta nenhuma**. Não há regressão de contrato.

## 5. Arquétipos e adoções

Os quatro contratos são **genuinamente distintos** — verificado no código, não na descrição:

| Família | Contrato publicado | Faixa entra como |
|---|---|---|
| **Hub** | `{columns, rows, ceiling, fit, inventory, limitedBy, displayType}` | **teto** |
| **Editorial** | `{columnOwner:'ContentContainer', supportCapacity, support, displayType, columnMaxWidth, supportPlacement, supportWidth, voidWidth, dominantVoid}` | capacidade de apoio |
| **Imersiva** | `{fill:'window', imposesColumn:false, cropsArt:false, companionCapacity}` | só capacidade acompanhante |
| **Jogo** | `{width, height, frameX, frameY}` | **não entra** |

**`grid[band]`** **é teto, não ordem de colunas — confirmado no código, não na prosa.** `hubComposition` calcula `Math.max(1, Math.min(teto, cabimento, inventario))` e publica `limitedBy` com precedência `balance → inventory → width → band`. Se a faixa fosse regra universal, `limitedBy` responderia `'band'` sempre; o campo existe justamente para tornar `SD-2` verificável.

**Editorial preserva a medida de linha:** não reimplementa `maxWidth` — importa `contentColumnMaxWidth` de `ContentContainer` e pergunta. `styles.leitura` usa `flexShrink: 0` e só o apoio cresce (`flex: 1`), de modo que a coluna não vira sobra do *layout*.

**Imersiva não herda** **`maxContentWidth`** **editorial:** não importa `ContentContainer` — a ausência é declarada como contrato no cabeçalho, e `TA-14 [10/21]` a cobra mecanicamente. Delega a projeção a `useViewportProjection`, sem aritmética `contain` própria.

**`GameSurface`** **continua oferecido, não imposto:** `grep` por importação em todo `src/` — **zero consumidores**. `TA-14 [11/21]` cobra isso e `[20/21]` cobra o recíproco (nenhuma tela de jogo importa arquétipo algum, piso de 5 telas varridas). Confirmei nominalmente: `MonteACenaHomeScreen`, `MonteACenaStoryScreen`, `QuizScreen` = 0 importações, e nenhuma tela de jogo aparece nos 41 arquivos do arco.

**Consumidores batem exatamente com as** ***tasks*** **autorizadas:**

- Hub — `HomeScreen`, `BrincarScreen`, `TrophiesScreen`, `AtelierGalleryScreen` (as quatro de `TK-C-008`)
- Editorial — `StoryDetailScreen`, `ReflectionScreen`, `PostStoryHubScreen`, `ParentAreaScreen` (as quatro de `TK-C-006`)
- Imersiva — `StoryBookScreen`, `ColoringScreen`, `AtelierCanvasScreen` (as três de `TK-C-011`)
- Jogo — nenhum (`F12A`)

**`TA-14`:** 21 asserções, lidas por amostragem dirigida nas mais carregadas. Não são declarativas. `[8/21]` lê o **fonte bruto** (inclusive comentários) para a frase proibida, exige que exatamente uma família consuma `grid`, que o teto do Hub derive dos três *tokens*, e proíbe literal `1|2|3` atribuído a nome de coluna/teto. `[9/21]` proíbe `breakpoints` próprio, comparação contra literal de 2+ dígitos e `Dimensions.get`/`useWindowDimensions` paralelo nos quatro. `[21/21]` cobra as duas faces de arquitetura paralela — usurpação (área segura, rolagem, cabeçalho) e orfandade (nenhum dono de contrato ficou sem consumidor). São portões com dentes.

## 6. Barra lateral

`sidebarRole`/`sidebarWidth` são funções puras de faixa. A faixa **compacta não tem chave** em `SIDEBAR_BAND_KEY` — a ausência é o contrato (restrição 6 · `CN-1`), e `sidebarWidth` devolve `null`, nunca zero. O componente tem guarda `if (largura === null) return null`, hoje inalcançável, documentada como rede para o caso de o *shell* afrouxar.

Os três defeitos de PLAN §19 estão corrigidos de forma verificável: **(1)** `styles.sidebar` **não tem mais** **`width`**; a largura vem de `navSidebarWidth[navSidebarRole[faixa]]` = `rail:180` / `full:240`, valores em `tokens.js`, e não do literal `200` renomeado; **(2)** `navButtons` usa `flexGrow: 1` + `justifyContent:'flex-end'` — e a escolha de `flexGrow` em vez de `flex` está justificada corretamente (`flex` ligaria `flexShrink` e uma janela baixa cortaria os **primeiros** botões); **(3)** `theme/colors` legado saiu, origem única `theme/tokens`, com tabela de 11 trocas de cor registrada explicitamente como **mudança de aparência pendente de conferência em aparelho**.

**Nenhum destino artificial:** cinco `registerGuideTarget`, os mesmos cinco itens de rota; `G-SID-4` e `MT-23` guardam o sexto. `G-SID-3`/`RG-12` proíbem derivar espaço disponível subtraindo o *token* — quem precisa do que sobra **mede**.

**Confronto com** **`B-04`**/**`B-05`**/**`B-06`**: o vazio vertical de ~700pt em iPad retrato (`B-05`) e a largura única para 600dp e 1366dp (`B-04`) eram exatamente os defeitos 1 e 2, e ambos foram atacados na **causa estrutural**. Mas o fecho de ambos é **físico e não obtido**: `TK-C-043` exige a barra medida em iPad retrato e paisagem, com o vazio residual **em pontos** e os cinco alvos medidos no aparelho — e o iPad **não existe no parque**. O artefato `23` §2.2 diz isso sem suavizar: presença estática (`TA-9`/`G-SID-1`) e geometria real são propriedades distintas. O que pertencia a `F6-R1` foi endereçado no código; o que pertencia à prova continua aberto, corretamente rotulado.

## 7. Rota C — `TK-C-035` / `C-C10`

**Arquivos tocados:** exatamente dois, em `e2702d2` — `plugins/withAndroidTabletOrientation.js` (novo, 126 linhas) e `app.json` (+2/−1: uma vírgula e a entrada `"./plugins/withAndroidTabletOrientation"` no fim do *array* `plugins`). `"orientation": "portrait"` em `app.json:6` permanece **intocado** — é ele que segue entregando iPhone/iPad conforme o contrato iOS, e o *plugin* não toca iOS.

**Mecanismo, na ordem real:**

1. `withRecursosDeOrientacao` (`withDangerousMod` android) grava `screen_orientation` em `app/src/main/res/values/integers.xml` = **1** (`SCREEN_ORIENTATION_PORTRAIT`) e em `values-sw600dp/integers.xml` = **−1** (`SCREEN_ORIENTATION_UNSPECIFIED`). Lê o XML antes de escrever e só substitui/insere o item nomeado — não apaga recurso do *template*.
2. `withReferenciaNoManifesto` (`withAndroidManifest`) escreve `android:screenOrientation="@integer/screen_orientation"` na `MainActivity`.
3. O sistema de recursos do Android responde por `smallestScreenWidthDp`: telefone → 1 (retrato travado); tablet ≥600dp → −1 (livre).

**Zero pergunta de** ***runtime*** **"sou tablet?", zero** **`Platform.isPad`**, **zero** **`expo-device`**, **zero** **`expo-screen-orientation`**, **zero dependência nova** — verificado por varredura, não por leitura do relatório. O celular Android continua retrato; o tablet Android ganha retrato **e** paisagem; iPhone/iPad seguem pelo caminho iOS inalterado.

`MainActivity` mantém `android:configChanges="…|orientation|screenSize|screenLayout|uiMode"` (artefato `21` §4.6): girar **não** recria a Activity — o que é coerente com a evidência de `MainTabs` do `F6-SG-A`.

## 8. `RISCO 1` — ordem LIFO

Reconstruí a cadeia inteira no `node_modules`, sem confiar no relatório nem no comentário do *plugin*:

1. `@expo/config/build/Config.js:229` — `getConfig(..., {isModdedConfig:true})` chama `withConfigPlugins(exp, skipPlugins)`.
2. `withConfigPlugins.js:33` — `withPlugins(config, config.plugins)`: **os *plugins* do usuário são registrados AQUI, PRIMEIRO.**
3. `getPrebuildConfig.js` — só **depois** aplica `withVersionedExpoSDKPlugins`, `withLegacyExpoPlugins` e, na linha 72, `withAndroidExpoPlugins`.
4. `withDefaultPlugins.js:194` — `withAndroidExpoPlugins` contém `AndroidConfig.Orientation.withOrientation`: **registrado POR ÚLTIMO.**
5. `withMod.js:190-205` — `action(...)` executa e então `return nextMod(results)`: o último registrado **executa primeiro** e delega ao anterior. LIFO confirmado no código.
6. `Orientation.js` — `setAndroidOrientation` escreve **uma** chave global, **incondicionalmente**, e mapeia `'default'` → `'unspecified'`. Versão instalada: `@expo/config-plugins@54.0.5`.

Logo: `withOrientation` roda **primeiro** e escreve `"portrait"`; o *plugin* do usuário roda **por último** e sobrescreve com a referência. **Corroboração empírica**, e é ela que fecha a questão: o artefato `21` §4 registra um `expo prebuild --platform android --no-install` **realmente executado**, cujo `AndroidManifest.xml` final contém `@integer/screen_orientation` e cujo `values-sw600dp/` contém **um único arquivo**, provando que nasceu do *plugin*.

Respondendo aos seis pontos, um a um:

1. **Por que a ordem é necessária:** porque `withOrientation` escreve o mesmo atributo sem condição. Quem escreve por último vence. Só há uma ordem que produz a referência observada.
2. **Onde está definida:** em nenhum lugar contratual. Emerge da composição entre `getConfig` (aplica *plugins* do usuário) e `getPrebuildConfig` (aplica os embutidos depois), interpretada pelo encadeamento LIFO de `withMod`.
3. **Depende de detalhe não contratado? SIM — e mais do que o Azul registrou.** O comentário do próprio `getPrebuildConfig.js` diz: *"Add all built-in plugins first because they should take priority over the unversioned plugins."* A **intenção declarada a montante é o oposto do resultado observado**: os embutidos deveriam ter prioridade, e no encadeamento LIFO eles não têm. Isso não é um detalhe estável que por acaso ninguém contratou — é um comportamento que uma correção futura a montante poderia "consertar" para casar com a própria intenção declarada, invertendo o resultado. O comentário do *plugin* nomeia a fragilidade corretamente, mas subestima-a ao tratá-la como propriedade neutra de versão.
4. **Uma inversão silenciosa apagaria a referência? SIM.** `withOrientation` passaria a rodar depois e escreveria `"portrait"` por cima. O manifesto ficaria válido, o *build* passaria, e **o tablet voltaria a travar em retrato sem erro nenhum.** Falha silenciosa.
5. **Existe portão/asserção suficiente para detectar a regressão? NÃO — e este é o achado deste gate.** Varri `scripts/smoke.js`: **zero ocorrências** de `withAndroidTabletOrientation`, `screen_orientation`, `sw600dp`, `values-sw600dp` ou `integers.xml`. Não há asserção que sequer confirme que o *plugin* continua registrado em `app.json`, quanto mais que ele vence a ordem. `bundle:check` não olha configuração nativa. A única defesa hoje é procedimental — repetir o *prebuild* e reler o manifesto ao subir versão — e depende de lembrança humana, exatamente o que a regra de bundleabilidade do `AGENTS.md` existe para não depender.
6. **Isso impede AUTORIZAR o *build*? NÃO.** Hoje o comportamento está **provado por observação direta** do *prebuild* executado, na versão exata que está no `package-lock`. O risco é de **manutenção futura**, não de estado presente, e o `build` é justamente o ato que consome o estado presente. Registro como risco aberto de alta prioridade, não como bloqueio.

**Não redesenhei a rota.** Julguei a implementação existente: ela está correta, é a mais barata que resolve o problema real, e sua fragilidade é declarada — só está desguarnecida.

## 9. `RISCO 2` — AAPT2 / `@integer/screen_orientation`

Os dois fatos são verdadeiros: AAPT2 nunca compilou esta referência neste projeto (o artefato `21` §5 tabula "Compilação AAPT2 = **NÃO EXERCITADA**" e documenta por quê — não há Android SDK na máquina: `ANDROID_HOME`/`ANDROID_SDK_ROOT` vazios, sem `~/.gradle`, `adb` fora do `PATH`; Java 21 não basta), e `android:screenOrientation` é atributo de formato `enum`, ao qual se atribui um inteiro negativo por referência.

Análise estática do que AAPT2 faz com isso:

- **Referência em atributo tipado:** ao processar um valor de atributo, AAPT2 tenta primeiro interpretá-lo como **referência** (`@pacote:tipo/nome`) e, quando a análise sintática de referência tem sucesso, devolve a referência **sem confrontá-la com a máscara de tipos do `attr`**. Referências são resolvidas em tempo de execução, não de compilação — é essa propriedade que torna todo o sistema de qualificadores de recurso utilizável em atributos tipados. `@integer/...` em atributo `enum` é, portanto, sintaticamente aceito.
- **Valor negativo em `<integer>`:** `<integer>-1</integer>` é literal padrão e válido; `integer` não tem restrição de sinal.
- **Resolução em tempo de execução:** `android:screenOrientation` é lido via `TypedArray.getInt`, que resolve a referência e devolve o inteiro. `-1` é `SCREEN_ORIENTATION_UNSPECIFIED` e `1` é `SCREEN_ORIENTATION_PORTRAIT` — os mesmos valores que o *framework* usa internamente, e `-1` é exatamente o que o Expo produziria escrevendo `unspecified`.
- **Qualificador:** `sw600dp` deriva de `smallestScreenWidthDp`, propriedade estável do dispositivo que **não muda com a rotação** — é o qualificador certo, e a razão pela qual `w600dp` seria errado aqui.

**Veredito do §6, dito com as palavras exigidas:** **`CONFIGURAÇÃO ESTATICAMENTE VÁLIDA PARA TENTAR BUILD`**.

Não afirmo que compila — não houve compilação, e nenhuma leitura de código substitui AAPT2. Afirmo que a configuração é **estaticamente plausível o bastante para que o próximo árbitro correto seja o** ***build*** **real**, e que, se AAPT2 recusar, ele falha **alto e cedo**, na máquina de *build*, antes de qualquer aparelho e sem custo físico. Esse é o modo de falha desejável, e concordo com o artefato `21` neste ponto.

## 10. Reconciliação `F6-SG-A` / `R1-PEND-1..5`

Não copiei a frase do Azul. Reconstruí a cadeia inteira e ordenei por recência canônica.

| Pendência | Origem | Fechamento posterior encontrado? | Estado atual | Evidência |
|---|---|---|---|---|
| `R1-PEND-1` — saída dos quatro `Write-Host` (pasta · ramo · `HEAD` · `ARVORE: LIMPA`) + `git diff --stat aa58849..HEAD` | `06_…:556` (§1) | **Não.** `10_…:158` diz que as confirmações da `R2` **não** a fecham | **ABERTA** | `06_…:581`, `10_…:158`, `14_…:630`, `14_…:665` |
| `R1-PEND-2` — confirmação #1: cabeçalho do Metro **exibindo** `C:\tmp\ptf_fase6_shell_splash_wt` | `06_…:557` (§3.3) | **Não** — idem | **ABERTA** | `06_…:581`, `10_…:158` |
| `R1-PEND-3` — confirmação #2: linha do Metro registrando o pedido de *bundle* **agora** | `06_…:558` (§3.3) | **Não** | **ABERTA** | `06_…:581`, `10_…:173` |
| `R1-PEND-4` — confirmação #4: `adb reverse --list` da rodada (exatamente um mapeamento `tcp:8081 tcp:8081`) | `06_…:559` (§3.1·§3.3) | **Não** — idem | **ABERTA** | `06_…:581`, `10_…:158` |
| `R1-PEND-5` — `raw.log` **preservado íntegro** + atestação do *deep link* codificado e da ordem `force-stop` → `logcat -c` → `PS3` → *deep link* | `06_…:560` (§3.2·§3.6) | **Não — e há impedimento material** | **ABERTA, e a única não sanável por repetição administrativa** | **`10_…:186`**: ***"o `raw.log` da `R1` não foi preservado e é irrecuperável"*** |

**Documento mais recente e canonicamente superior:** `14_R2_SESSAO_2.md`, tocado por último em `e393768` (2026-08-12 16:24), posterior a `docs/DECISIONS.md` (`09cb9f1`, 2026-08-11 18:27) e ao artefato `10` (`f7f261a`, 2026-08-11 17:59). Ele diz, literalmente: *"**`R1-PEND-1..5`** seguem **ABERTAS**"* e *"⛔ `F6-SG-A` NÃO CONCEDIDO · `R1-PEND-1..5` **ABERTAS**"*. O fecho formal do §25.8 encerra **`R2 · Sessão 2`** **e o** **`BLOCO A`** — e mais nada. Não concede `F6-SG-A`, não fecha `R1-PEND`, e não é redigido como se fizesse.

Busquei nominalmente por `SUPERSEDE`, `FECHADO`, `ENCERRADO`, `CONCEDIDO`, `resolvido` associados a `R1-PEND` em todo `specs/` e `docs/`: **nenhum fechamento existe**. As únicas ocorrências reafirmam a abertura, em `06:581`, `06:621`, `10:57`, `10:68`, `11:523`, `12:379`, `13:609`, `13:672`, `14:630`, `14:665`, `24:19`, `24:134`.

**Veredito da reconciliação: a frase do Azul NÃO está defasada. Não é** **`ERRO DE ESTADO DO RELATÓRIO AZUL`**. As cinco estão realmente abertas e `F6-SG-A` está realmente não concedido, no corpus cronologicamente mais recente.

**Tensão que precisa ser dita, porque muda o custo:** `docs/DECISIONS.md` (`PF6SGA-R1-VEREDITO`) qualifica a `R1` como **"CONTEÚDO OBSERVADO SEM ANOMALIA ·** **`PASS`** **NÃO FORMALIZÁVEL"** e afirma que *"as 5 pendências são de **ARQUIVO**, não de comportamento… **nenhuma exige repetir a rodada** — fechadas as cinco, `R1` vira `PASS` por leitura direta"*. Isso é verdadeiro para `R1-PEND-1..4`, que são saídas de comandos reobteníveis num pré-voo subsequente. **É falso para** **`R1-PEND-5`**, e o próprio artefato `10:186` o diz: o `raw.log` da `R1` **não foi preservado e é irrecuperável**. Um insumo irrecuperável não se fecha por arquivamento posterior.

**O que exatamente falta hoje para** **`F6-SG-A`**:

1. `R1-PEND-1..4` — obteníveis no próximo pré-voo físico, sem repetir a `R1`. Custo baixo.
2. `R1-PEND-5` — **não obtenível por arquivamento**. Só há dois caminhos, e ambos são decisão do fundador, não minha: (a) repetir a parcela da `R1` que produz o `raw.log`; ou (b) uma decisão canônica explícita que substitua a exigência de preservação por prova equivalente já existente. **Fabricar, reconstruir ou sintetizar o `raw.log` está fora de questão** e nenhum documento o autoriza.
3. Os Blocos `B`, `C`, `D`, `E` da `R2` (casos 7, 8, 6, 11, 17, 12), que nunca foram executados.

**`F6-SG-A`** **bloqueia o** ***build***? Procurei uma regra canônica que o dissesse e **não encontrei nenhuma**. `RD-4` e `OR-6` dizem o contrário: um único *build* nativo agrupando todas as mudanças de configuração da Fase 6, **no fim de** **`F6-R1`** — exatamente onde estamos. O que `R1-PEND` bloqueia é a **concessão de** **`F6-SG-A`**, não o ato material de compilar. O risco 5 do artefato `24` (*"todo `F6-R1` está construído sobre uma porta que ainda não abriu"*) é honesto e correto como registro de risco, mas não é uma proibição canônica.

**Consequência que ninguém no corpus tratou, e que considero material** (§17): o primeiro *build* **substitui o binário do SM-X510**, que é o mesmo aparelho que carrega a cadeia de evidências da `R2` e a obra protegida da criança. Os Blocos `B`–`E` da `R2` passariam a rodar sobre um binário diferente daquele dos Blocos `A`, e a lista fechada de `STOP` do artefato `14` §11 traz, no item 13, *"necessidade de instalar, desinstalar ou substituir binário"*. Isso não impede o *build*, mas **é decisão do fundador tomada com o fato à vista**, e hoje ela não está registrada.

## 11. Mutantes

O artefato `22` sustenta o que promete. As 14 mutações do PLAN §25 aplicáveis a `R1` foram executadas **uma por** ***task***, **uma viva por vez** (emenda `A-08`), com defeito nomeado, portão-alvo nomeado e contagem de falhas registrada. Nenhuma *task* de mutação criou o portão que ela mesma prova (`A-09`/`A-10`) — verifiquei o caso mais sensível na Rodada 9: `G-RSP-5` nasce em `TK-C-014`/`C-C9` e é provado por `MT-19`/`MT-22`, posteriores.

**Nenhuma mutação foi commitada** — confirmado independentemente e não por declaração: as varreduras do §3 acima mostram zero `Dimensions.get`, zero `Platform.isPad`, zero literal de largura fora do *hook*, zero quarto *breakpoint*, e a árvore está limpa em `002872a`.

***`HEAD`s*** **diferentes:** seis mutantes rodaram em `eb11061`/`1801405` e oito em `da16b18`, porque cada mutante roda depois da *task* que cria seu portão. A justificativa do §2.1 se sustenta: o total subiu de 4936 para 4942 porque nasceram portões novos, não porque algum sinal mudou, e os portões antigos estão verdes em `da16b18`. Reexecutar acrescentaria conforto, não evidência. Não vi dúvida material que justificasse reexecutar a bateria — e não a reexecutei.

**`MT-19`** **(6 vermelhos):** explicáveis por **uma** violação. A mutação trocou `Math.max(1, Math.min(teto, cabimento, inventario))` por `band === COMPACT ? 1 : 2`, apagando **de uma vez** as três entradas da composição. Li as cláusulas acusadas — `TA-14 [2]`, `[3]`, `[15]`, `M-a`, `M-b` e `G-RSP-5` — e todas falam de inventário ou cabimento. É o mesmo defeito visto por seis ângulos, e um arnês que não acendesse seria o problema.

**`MT-11`** **≠** **`MT-22`**: cobertura **sobreposta mas não duplicada**, e a prova é a assimetria. `B1_LITERAL` (`G-BP-1`) casa `width [<>]= 768`; `G5_LITERAL` (eixo B de `G-RSP-5`) casa `width [<>]= \d{2,4}` — generalização deliberada. `MT-11` (`768`) acende **os dois**; `MT-22` (`width > 900`) acende **só** **`G-RSP-5`**. Se fossem o mesmo portão escrito duas vezes, `MT-22` acenderia ambos. `G-BP-1` guarda o valor histórico de `P-30`; `G-RSP-5` guarda a classe. Correto.

**Correção editorial (não bloqueante):** o artefato `22` §3 abre com *"Quatro mutantes produziram mais de uma falha"* e em seguida lista **cinco** (`MT-8`, `MT-10`, `MT-11`, `MT-19`, `MT-20`). Erro de contagem no texto; os dados abaixo dele estão certos. `PARKING_LOT`.

## 12. `CN-8`

Verifiquei **mecanicamente e sobre o arco inteiro**, não sobre a tabela do artefato `25` — e minha verificação é estritamente mais forte que a dele, porque cobre os 30 *commits* (o artefato `25` tabula 29, por ter sido escrito antes de `002872a`, que o contém).

- **União dos 41 arquivos filtrada por área protegida** (`assets/`, `stories`, `manifest`, `achievement`, `conquist`, `accessControl`, `paywall`, `progress`, `audio`, `scenes`, `purchase`, `billing`): **vazia**.
- **`src/services/`**, **`src/data/`**, **`src/context/`**: **zero arquivos tocados.** Nenhum serviço de conquistas, nenhum *storage*, nenhum controle de acesso.
- Distribuição: 12 telas · 12 documentos · 6 `components/layout` · 2 `components` · 2 `scripts/testing` · 1 cada de `theme`, `navigation`, `hooks`, `components/ui`, `scripts`, `plugins`, mais `app.json`.

**`src/theme/tokens.js`** **(`Q9`):** `git diff --numstat ffe856c..da16b18` devolve **`44 2`** — a errata `TK-C-064` está certa e a mensagem de `77e1e19` é que carrega o número antigo (+40/−2). As duas linhas removidas são as declarações de `grid` e `displayScaleTablet`, reescritas **com os mesmos valores** (`{phone:1, tablet:2, tabletL:3}` e `1.10`) e comentário novo. Nenhum símbolo removido, nenhum valor pré-existente alterado. Os dois símbolos novos — `navSidebarRole` e `navSidebarWidth` — são exatamente o cruzamento *papel × faixa* que PLAN §19.1 exige, e `Q9` autoriza.

**`TrophiesScreen`:** o *diff* toca **apenas superfície**. Sai `useWindowDimensions` + `isTablet = width >= breakpoints.tablet` + o fatiador `i % 2` embutido; entra `useHubComposition` + `hubRows`. `AchievementCard` perde a *prop* `isTablet`. **`isUnlocked(a)`**, **`ctx`**, **o catálogo de conquistas e qualquer persistência permanecem intocados** — nenhuma linha de domínio no *diff*. É composição, não conquista.

**`CN8_F6_R1_PASS`** **— CONFIRMADO**, por medição própria.

## 13. Último verde executável

`git diff --name-only da16b18..002872a` devolve **quatro arquivos, todos em** **`specs/…/delta-v4.1/`**: `22_PROVAS_VERMELHAS…` (220), `23_VERIFICACOES_FINAIS…` (166), `24_RELATORIO_F6_SG_C.md` (155), `25_CN8_AREAS_PROTEGIDAS…` (229) — 770 inserções, **zero linha executável**. Nenhum arquivo de `src/`, `scripts/`, `plugins/`, `app.json`, `babel.config.js`, `metro.config.js`, `package.json` ou `package-lock.json`.

Pela regra do `AGENTS.md`, documentação pura **não dispara** a obrigação de bundleabilidade. As superfícies executáveis em `002872a` são **byte-idênticas** às de `da16b18`, onde `bundle:check EXIT=0` e `smoke 4942/4942` foram medidos, com `expo-doctor 18/18` em `e2702d2` (último *commit* a mexer em `app.json`). **Reexecutar seria ritual, e não o fiz.** O último verde executável vale para o `HEAD` atual.

## 14. Físico pendente, *task* a *task*

| *Task* | Aparelho | *Build* | Orientação | Superfície | Evidência mínima | Bloqueia `SG-C`? | Executável hoje? |
|---|---|---|---|---|---|---|---|
| `TK-C-038` — regressão em telefone | telefone Android real | novo | retrato | as quatro famílias | §28 #17 (parcela `SG-C`) + reexecução de #1/#4/#7, capturas comparativas, `CN-11`+`CN-1` | **Sim** | **Não** — sem aparelho (`R6`) |
| `TK-C-039` — tablet retrato | SM-X510 (**disponível**) | **novo, com a rota C** | retrato | as quatro famílias, faixa **média** | parcela retrato de §28 #15; `SD-2`/`SD-3`/`SD-4` | **Sim** | **Não hoje — sim logo após o *build*** |
| `TK-C-040` — tablet paisagem | SM-X510 (**disponível**) | **novo, com a rota C** | paisagem | idem, faixa **expandida** | parcela paisagem de §28 #15; nenhuma coluna estreita cercada de vazio em ≥900dp | **Sim** | **Não hoje — sim logo após o *build*** |
| `TK-C-041` — *resize* (Split View) | **iPad** | novo | ambas | travessia de 600dp arrastando o divisor | §28 #6 sob a ótica de `R1`; `SD-9`+`CN-6`; **vídeo** | **Sim** | **Não** — sem iPad |
| `TK-C-042` — consistência entre famílias | tablet + telefone | novo | ambas | **4 famílias × 3 faixas = 12 células** | uma captura por célula + veredito comparativo de `SD-2` | **Sim** | **Não** — depende de `038`..`041` |
| `TK-C-043` — barra lateral final | **iPad** | novo | retrato e paisagem | barra lateral | §28 #16: vazio vertical medido **em pontos** e os cinco `registerGuideTarget` medidos **no aparelho**; `CN-5` | **Sim** | **Não** — sem iPad |
| `TK-C-062` — roteiro completo | tablet (disponível) | **novo, com a rota C** | retrato **e** paisagem | as quatro famílias + barra lateral + travessia de faixa | o roteiro **inteiro** — uma sonda de rotação não é o roteiro | **Sim — e `SD-1` não é concedível enquanto pendente** (`A-13`) | **Não hoje — parcialmente após o *build*** |

Aparelho indisponível **não vira** **`PASS`** em nenhuma linha. `SD-1` continua **não concedível**. Registro a favor do artefato `23` §1: ele **inverte por conta própria a premissa errada** de `TK-C-062` ("sem aparelho"), mostrando que o tablet Android existe e que quem falta é o iPad e o telefone real — e faz isso **sem** converter disponibilidade em aprovação. É a postura correta.

## 15. Classificação da evidência SM-X510 já obtida

O que existe: Android 16, `targetSdk` 36 lido no aparelho, ≈`sw823dp`, *auto rotate* = 1; retrato→paisagem com `dumpsys` em `mDisplayRotation=ROTATION_90`, `mRotation=ROTATION_90`, `w1317dp h823dp`, `land`, `MainActivity` em foco; paisagem→retrato com `ROTATION_0`, `w823dp h1317dp`, `port`, mesma `MainActivity`; foto física da UI de "Minhas artes" em paisagem.

**O que essa evidência PROVA:**

- O SM-X510 com Android 16 **já aceita rotação no *build* antigo**, pela exceção de telas grandes do Android 16 — não pelo qualificador `sw600dp`.
- A `MainActivity` **sobrevive** ao giro sem ser recriada, coerente com o `configChanges` do manifesto.
- O aparelho está **apto para a campanha física**: gira, mede, responde e não perde foco.
- Existe uma UI real renderizando em paisagem — dado útil de baseline visual.

**O que essa evidência NÃO PROVA, e não pode fechar:** `TK-C-039` e `TK-C-040` da rota C. **Concordo explicitamente com o §7 e o digo com minhas palavras:** o APK instalado é **anterior a** **`e2702d2`**, portanto não contém o *plugin*, não contém `values-sw600dp/integers.xml` e não contém a referência no manifesto. A rotação observada tem **outra causa suficiente** — a exceção de telas grandes —, e uma observação compatível com duas causas não distingue entre elas. Usá-la como prova do *plugin* seria o erro lógico clássico de afirmar o consequente.

Registro a favor do artefato `21` §1: ele **adota essa correção como redação oficial**, por iniciativa do fundador, e chega a **proibir** que qualquer relatório use a rotação do SM-X510 como prova do *plugin* — *"aquele tablet giraria com ou sem ele"*. Um documento que fecha a porta do próprio atalho probatório é o oposto de um relatório complacente, e isso pesa a favor da confiabilidade do arco.

## 16. Decisão sobre o primeiro *build* nativo

### **`BUILD_NATIVE_AUTHORIZED`**

Sim, este é o próximo ponto causal. Seis dos sete itens físicos pendentes esperam por um binário que ainda não existe; a compilação AAPT2 da rota C só fecha num *build*; e `RD-4`/`OR-6` já decidiram que haveria **um único** *build* agrupando toda a configuração nativa da Fase 6, ao fim de `F6-R1` — que é exatamente aqui. Continuar auditando estaticamente não produz mais informação: o arco automatizável está esgotado.

Não gerei *build*, não toquei credenciais, não enviei nada a loja, não fiz *push*.

**O que o Azul deve provar ANTES do** ***build***:

1. **Identidade do que está sendo construído** — `HEAD` = `002872a`, ramo `feat/fase6-shell-splash`, `git status --porcelain` vazio, exibidos na mesma janela.
2. **Preservação de dados de usuário — condição, não formalidade.** Provar, antes de instalar, que a instalação é *upgrade in place*: **mesmo `applicationId` e mesma chave de assinatura** do APK hoje no SM-X510. Se a chave divergir, a instalação exige desinstalar, e desinstalar **destrói** a obra da criança e toda a linha de base da `R2` (cadeia `MAX_ROWID`, ponteiro/blob do C60, arte do Ateliê). Nesse caso: **parar e escalar ao fundador**, não improvisar.
3. **Decisão registrada sobre a substituição do binário** — o artefato `14` §11 item 13 trata "substituir binário" como condição de `STOP` dentro de uma rodada, e os Blocos `B`–`E` da `R2` ainda não rodaram. Que o fundador decida com o fato à vista se aceita que eles rodem sobre binário novo.
4. **`npm run verify:runtime` verde no `HEAD` exato do *build*** — `bundle:check` `EXIT=0` e `smoke` 4942/4942, mais `npx expo-doctor` 18/18.

**Durante:**

5. **`prebuild` reproduzido e lido**, não presumido: versões de `expo` e `@expo/config-plugins` registradas, e a confirmação de que continuam sendo as do `package-lock`.
6. **Recursos Android gerados** — `values/integers.xml` = **1** e `values-sw600dp/integers.xml` = **−1**, ambos transcritos.
7. **`AndroidManifest.xml` final** — `android:screenOrientation="@integer/screen_orientation"` na `MainActivity` e **não** `"portrait"`. **Se aparecer `"portrait"`, a ordem LIFO inverteu: pare o *build* e reporte.** Este é o único ponto onde a falha silenciosa do §8 vira visível de graça.
8. **Compilação AAPT2** — registrar que passou, ou capturar o erro literal se recusar a referência ou o inteiro negativo. Falha aqui é resultado válido e barato, não acidente.

**Depois:**

9. **`targetSdk` confirmado** no binário resultante.
10. **Instalação** com registro de que foi *upgrade* e de que o acervo sobreviveu — reconferir as âncoras protegidas (ponteiro e *blob* do C60, arte e índice do Ateliê) antes de qualquer toque.
11. **Prova de orientação da rota C**, agora com causa isolada: o telefone (quando houver) **travado em retrato** é a metade que a exceção de telas grandes do Android 16 **não** explica, e é ela que discrimina o *plugin*. No tablet, retrato **e** paisagem com `dumpsys`.
12. ***Rollback*** **declarado antes de começar** — qual binário, onde guardado, e como se volta a ele.

## 17. Riscos reais restantes

| # | Risco | Gravidade | Por quê |
|---|---|---|---|
| 1 | **Ordem LIFO sem portão automatizado algum** | **Alta** | Falha **silenciosa** (tablet volta a travar em retrato, sem erro), a intenção declarada a montante é o oposto do resultado observado, `smoke` tem **zero** cobertura do *plugin*, e a única defesa é lembrar de reler o manifesto. Detectável de graça no item 7 do §16 — a cada *build*, e só a cada *build* |
| 2 | **AAPT2 nunca compilou a referência** | Média | Estaticamente plausível; se recusar, falha alto e cedo. Fecha no primeiro *build* |
| 3 | **Substituição do binário sob a `R2` inacabada** | **Alta** | Blocos `B`–`E` passariam a rodar sobre binário diferente do dos Blocos `A`; item 13 da lista de `STOP` do artefato `14`. Nenhum documento decidiu isso |
| 4 | **Perda de dados na instalação** | **Alta se materializar** | Chave de assinatura divergente → desinstalar → obra da criança e linha de base da `R2` destruídas. Mitigável 100% por verificação prévia (item 2 do §16) |
| 5 | **`R1-PEND-5` é irrecuperável** | Média | `R1-PEND-1..4` fecham num pré-voo; a `-5` não fecha por arquivamento. `F6-SG-A` depende de decisão do fundador, não de mais execução |
| 6 | **iPad ausente** | Média | `TK-C-041` e `TK-C-043` sem caminho. `B-04`/`B-05` corrigidos na causa, **não conferidos** onde foram observados |
| 7 | **Mudança de aparência da barra lateral não conferida** | Baixa | 11 trocas de cor com valores diferentes dos legados; registrada, nunca vista em aparelho |
| 8 | **Mutação prova sensibilidade, não completude** | Baixa | Declarado pelo próprio artefato `22` §5. Honesto, e não corrigível por mais mutantes |

## 18. Próximo ponto causal mínimo

**O menor pacote material que leva a um** **`SG-C PASS`** **real:**

1. **Verificar a chave de assinatura e o `applicationId`** contra o APK instalado no SM-X510, e **decidir com o fundador** a substituição do binário sob a `R2` inacabada. *(Antes de tudo — os itens 2 e 3 do §16 são condição, não etapa.)*
2. **Gerar o primeiro *build* nativo** com as doze provas do §16. Fecha a compilação AAPT2 e o risco 2, e **expõe** o risco 1 no item 7.
3. **Instalar e reconferir as âncoras protegidas** antes do primeiro toque.
4. **Executar `TK-C-039` e `TK-C-040`** no SM-X510 — retrato e paisagem, quatro famílias, `SD-2`/`SD-3`/`SD-4`. São as duas únicas *tasks* físicas que o parque atual permite executar, e destravam a maior parte do valor.
5. **Executar `TK-C-062`** — o roteiro completo, não a sonda. É o que torna `SD-1` concedível.
6. **Registrar como não executáveis, com causa,** `TK-C-038` (telefone real), `TK-C-041` e `TK-C-043` (iPad), e `TK-C-042` (depende delas). **Isso não é `PASS`** — é a fronteira do que o parque permite, e a decisão de aceitá-la ou de obter os aparelhos é do fundador.

Fora do caminho do *build*, e independentes dele: fechar `R1-PEND-1..4` no próximo pré-voo, e levar `R1-PEND-5` ao fundador como o que ela é — insumo irrecuperável, que só sai por repetição da parcela da `R1` ou por decisão canônica explícita.

**Duas coisas que não devo deixar ambíguas:** `READY_FOR_FINAL_GATE` não é `SG-C PASS`. O arco automatizável está pronto e o *build* está autorizado — **`F6-SG-C`** **não está concedido, e** **`SD-1`** **não é concedível**, porque as provas físicas obrigatórias não existem. E o *build* autorizado aqui é o **ato técnico de compilar e instalar para produzir evidência**; não autoriza EAS de distribuição, credencial nova, envio a loja, *push* nem *merge*.

## 19. Veredito final

O arco automatizável está íntegro e é promovível: 30 *commits* coerentes, 41 arquivos, quatro arquétipos com contratos genuinamente distintos, `grid[band]` operando como teto verificável e não como ordem de colunas, `GameSurface` oferecido e sem um único consumidor, consumidores batendo exatamente com as *tasks* autorizadas, zero idioma de aparelho, zero dependência nova, `CN-8` confirmado por medição própria sobre os 30 *commits*, 14 mutantes com defeito nomeado e nenhuma mutação commitada, e `da16b18..002872a` mecanicamente provado como documentação pura sobre superfícies executáveis byte-idênticas ao último verde.

A rota C é estaticamente válida para tentar o *build*, com sua fragilidade real — a ordem LIFO — nomeada, medida e desguarnecida de portão, mas hoje comprovada por observação direta do *prebuild* executado, e detectável de graça na leitura do manifesto a cada *build*.

`F6-SG-A` está de fato não concedido e `R1-PEND-1..5` estão de fato abertas — **a frase do Azul está correta, não defasada** —, mas nenhuma regra canônica faz de `F6-SG-A` predecessor do *build*, e `RD-4`/`OR-6` situam este *build* exatamente aqui. Não há bloqueio a montante; há uma decisão de fundador a registrar sobre a substituição do binário.

**`SGC_FINAL_GATE_AUTOMATION_PASS_BUILD_AUTHORIZED`**

`F6-SG-C` **NÃO** concedido. `SD-1` **NÃO** concedível. `F6-SG-A` **NÃO** concedido. `ACHADO-V1` permanece congelado e não investigado.

---

🟢 VERDE · AUDITOR FINAL

<!-- ↑↑↑ FIM DO CORPO HISTÓRICO PRESERVADO ↑↑↑ -->

---

## Apêndice de custódia — o que mudou DEPOIS deste relatório (não retroage)

Acréscimo desta missão, para leitura segura. **Nada abaixo altera o corpo acima.**

| Ponto do relatório | O que aconteceu depois | Onde |
|---|---|---|
| §16 item 3 — *"decisão registrada sobre a substituição do binário… hoje ela não está registrada"* | **Registrada.** `D-FUND-BUILD-SEQUENCE-01` (2026-08-13) decidiu o **sequenciamento**: *build* à frente, campanha histórica **não** refeita, e o *build* é **gerado e não instalado** | `docs/DECISIONS.md` |
| §16 itens 10 e 11 · §18 itens 3 a 5 — instalar e provar no aparelho | **NÃO autorizados hoje.** `D-FUND-PREBUILD-01` mantém o binário do `SM-X510` sob custódia; instalar exige **missão e gate próprios** | `docs/DECISIONS.md` |
| §16 item 1 — `HEAD` do *build* = `002872a` | O canônico avançou para `8086cda`, **quatro *commits* documentais** adiante. As superfícies executáveis seguem byte-idênticas; a identidade a exibir no *preflight* é a do `HEAD` **do momento** | artefato `26` §1 · `GATE 0` |
| §16 item 4 — `smoke` 4942/4942 | Contagem **do momento** do relatório. O `HEAD` atual mede o que medir; o gate é `verify:runtime` verde, não um número congelado | `AGENTS.md` |
| §17 risco 3 — substituição do binário sob a `R2` inacabada | **Continua Alto e continua aberto.** A decisão de sequenciamento **não** o resolve: apenas registra que o fundador escolheu a ordem com o fato à vista | `D-FUND-BUILD-SEQUENCE-01` |
| §17 risco 4 — perda de dados na instalação | **Continua Alto.** Custódia reconciliada em `CUSTODY_RKSTORAGE_AFTER_C10 = BYTE_IDENTICAL`, mas a mitigação (verificar assinatura e `applicationId`) pertence ao gate de instalação, que **não** ocorreu | artefato `26` §4.2 |
| §17 risco 5 — `R1-PEND-5` irrecuperável | **Formalizado** em `D-FUND-R1-PEND5-01`: pendência **ABERTA**, fabricação **proibida**, repetição futura rotulada como repetição posterior | `docs/DECISIONS.md` |
| §10 — `PREBUILD_CUSTODY_HARD_STOP` | Ainda **não existia** quando este relatório foi emitido. O artefato `26` mediu, depois, quatro condições de `STOP` que tornaram os `BLOCOS B`..`E` inexecutáveis | artefato `26` §3 |

**Estado que este apêndice reafirma, sem exceção:** `F6-SG-A` **NÃO CONCEDIDO** · `F6-SG-C` **NÃO CONCEDIDO** · `SD-1` **NÃO CONCEDÍVEL** · `R1-PEND-1..5` **ABERTAS** · `BLOCOS B`..`E` **NÃO EXECUTADOS** · veredito da campanha histórica **não-`PASS`** · *build* = **GERAR, NÃO INSTALAR**.
