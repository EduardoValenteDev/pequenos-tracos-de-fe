# ADR `D-OBS-01` — Observabilidade como requisito arquitetural do Mundo do Beni

> **ESTUDO TÉCNICO.** Este documento é o **único** artefato autorizado por `D-OBS-01`
> (`docs/DECISIONS.md` §`D-OBS-01`). Ele **não** instala nada, **não** altera `package.json`,
> `package-lock.json`, `app.json` nem `eas.json`, e **não** concede nenhum Human Gate.
>
> **Status:** proposto · **Data:** 2026-08-11 · **Decisão que o autoriza:** `docs/DECISIONS.md`
> §`D-OBS-01`.
>
> ⚠️ **Sobre as citações.** Referências a `docs/DECISIONS.md` por **número de linha** valem para o
> estado do arquivo em **2026-08-11** e **deslocam** a cada verbete novo. A referência **estável** é
> sempre o **nome do verbete** (`D-4E-ANALYTICS-3-CAMADAS`, `PF5-MEDICAO`, `D-OBS-01`,
> `PERF-OBS-01`, …). Em caso de divergência, **vale o verbete nomeado**, não o número.

---

## 0. Contexto verificável

### 0.1 O que já existe no runtime

| Peça | Arquivo | O que faz, verificado |
|---|---|---|
| Coletor de boot | `src/services/performanceTrace.js` | 394 linhas, zero dependência, zero rede, zero I/O. Marca eventos em array de memória (`:39-40`), sanitiza metadata por allowlist (`:64-79`), emite **uma** linha JSON por processo (`:354`). |
| `t0` do boot JS | `src/services/bootMark.js:17` | Módulo de efeito colateral importado como **2º import** de `App.js:2`, antes do grafo de telas. |
| Registro de instâncias vivas do shell | `src/services/shellLifecycleTrace.js` | Conta montagens **e** desmontagens, teto `SHELL_MAX_VIVOS = 1` (`:32`), nomeia anomalias (`:70`, `:81`). Sem UI, sem persistência, sem rede. |
| Log central | `src/utils/logger.js:16-26` | `log`/`warn`/`error` guardados por `__DEV__`. Fora de DEV, **silêncio total**. |
| Agregador offline | `scripts/perf-baseline-report.js` | Lê log, valida `schema === 2` (`:23`), reporta **mediana e p90** (média omitida de propósito, `:11-12`), conta `null` em vez de preencher com zero (`:14`). Sem dependência. |
| Gating de build | `eas.json:24` | `EXPO_PUBLIC_PTF_PERF_TRACE: "1"` existe **apenas** no perfil `preview`. `production` (`eas.json:47-58`) **não** declara a variável. |

### 0.2 O que já foi decidido e não se reabre aqui

- `D-4E-ANALYTICS-3-CAMADAS` (`docs/DECISIONS.md:1569-1572`): três camadas — local de produto,
  diagnóstico técnico, pública opcional. **Proibido** converter `childId` em identificador remoto.
- `D-4E-CONSENTIMENTO` (`:1574-1577`): coleta opcional exige consentimento adulto explícito,
  revogável, atrás do portão parental, sem *dark pattern*.
- `D-4E-COMPARTILHAMENTO` (`:1584-1587`): folha nativa, ação adulta, `expo-sharing` conceitualmente
  autorizado, `expo-media-library` **não**.
- `PF5-MEDICAO` (`:1667-1674`): plano de medição aprovado **no eixo documental**, com **zero
  categorias enviando dados no lançamento**, classes de retenção `R0`–`R4`/`RL`/`RT`, allowlist
  fechada de **quatro** atributos técnicos, `k ≥ 20` geral e `k ≥ 50` religioso.
- Registro de restrição de *Analytics / SDKs* (`:2531-2539`).
- `D-OBS-01` (`:2455-2469`): **nenhuma dependência**, **nada de *screen/session replay***.

### 0.3 Os riscos em jogo

| Código | Fato registrado | Fonte |
|---|---|---|
| `P-85` | Zero telemetria em `src/`; o campo "métrica ou evento" é impreenchível. `ABERTO`. | `09_MATRIZ…:714` |
| `P-93` | `EXPO_PUBLIC_REVENUECAT_*` lidas no código e ausentes de todos os perfis. `CRÍTICO`, `BLOQUEIA LANÇAMENTO`. | `09_MATRIZ…:699` |
| `P-127` | Boot instrumentado, **nenhuma amostra coletada**. `EXIGE VALIDAÇÃO FÍSICA`. | `09_MATRIZ…:715` |
| `P-139` | Coletor inalcançável em qualquer perfil de build. Fase proprietária **6**. | `09_MATRIZ…:716` |

`P-93` entra neste ADR por um motivo específico e não óbvio: `react-native-purchases` **já está
instalado** (`package.json:67`) e **já é um SDK de rede de terceiro**. Qualquer discussão sobre "o
app não coleta nada" precisa considerá-lo — foi exatamente isso que matou a redação absoluta em
`D-4E-TEXTO-PRIVACIDADE` (`docs/DECISIONS.md:1604-1607`) e produziu `P-149` (seis textos
divergentes em `ParentAreaScreen.js`).

### 0.4 O dado de campo que motiva este ADR

Development Build, coletor `P-139`, schema 2, terminal `first_layout`, rota `Home`
(`docs/DECISIONS.md:2517-2521`):

| Campo | Valor |
|---|---|
| `fontGateMs` | 277 |
| `routeDecisionMs` | 38 |
| `splashReactMs` | 808 |
| **`firstLayoutMs`** | **3204** |
| `profileHydrationMs` | 33 |
| `progressHydrationMs` | 58 |
| `packsHydrationMs` | 23 |
| `bufferDropped` | 0 |

**Leitura honesta — duas conclusões e uma incerteza.**

1. **A hidratação não é o gargalo.** 33 + 58 + 23 ms de perfil, progresso e packs somam ~114 ms
   contra 3204 ms de `firstLayoutMs`. Qualquer hipótese de "AsyncStorage lento" está refutada por
   medição própria. Isso é um achado real, produzido sem uma única dependência.
2. **Existe um buraco de ~2 s que nenhuma marca atual explica.** `fontGate` (277) + `routeDecision`
   (38) + `splashReact` (808) = 1123 ms atribuídos. Sobram **~2080 ms** dentro de `firstLayoutMs`
   sem marca nenhuma. Esse buraco é a justificativa concreta para instrumentar mais — não para
   comprar um SDK.
3. **Incerteza declarada:** é um *Development Build*. O JS vem do Metro, e avaliação de módulos +
   transferência de bundle vivem dentro desse buraco. Parte dos ~2080 ms pode simplesmente **não
   existir** num bundle de release. `docs/DECISIONS.md:2508-2510` já proíbe usar
   `Android Bundled 34102ms` como métrica pelo mesmo motivo. **Sem uma amostra de `preview`, o
   número não sustenta conclusão de produto.**

---

## 1. Decisão

**Observabilidade passa a ser requisito arquitetural do Mundo do Beni**, com quatro invariantes:

1. **Guarda local e síncrona, sempre.** Nenhum caminho de código de observabilidade é alcançável
   sem passar por uma guarda local, síncrona e **independente de rede**, cujo modo de falha é
   **desligado**. É o contrato que `performanceTrace.js:45-52` já implementa e que passa a valer
   para toda peça futura.
2. **Sem PII por construção, não por disciplina.** A defesa é allowlist fechada + validação de
   forma (`:29`, `:32`, `:37`, `:64-79`), não revisão humana de call site.
3. **Local por padrão, remoto nunca por padrão.** Camada 2 é o estado do lançamento. Camada 3 exige
   consentimento adulto por finalidade e **backend que não existe**.
4. **Nada de replay.** Nenhuma captura de tela, vídeo, sessão ou árvore de UI para fim
   diagnóstico — reafirmando `docs/DECISIONS.md:2468-2469`.

**Esta etapa produz apenas este estudo.** Nenhuma dependência é autorizada.

---

## 2. Separação obrigatória: cliente móvel × backend

Boa parte da confusão sobre observabilidade em app móvel vem de tratar as duas metades como uma só.

| | **Cliente móvel (o que roda no aparelho da criança)** | **Backend / infraestrutura (o que este projeto NÃO tem)** |
|---|---|---|
| Existe hoje? | Sim — `performanceTrace.js`, `shellLifecycleTrace.js`, `logger.js` | **Não.** Zero servidores próprios. O único host remoto é o R2 estático de manifesto/packs (`eas.json:25`). |
| Modelo | *push* ou nada; processo efêmero; sem endereço estável | *pull* (Prometheus) ou *push* recebido por um ingestor |
| Restrições dominantes | bateria, memória, privacidade infantil, regras de loja, tamanho de bundle, código nativo | custo, retenção, cardinalidade, autenticação |
| Quem pode ver o dado | ninguém, hoje | ninguém, hoje |

**Consequência dura:** Prometheus, Grafana, OTel Collector, alerta e retenção são **todos**
componentes de backend. Nenhum deles resolve, sozinho, um único problema do cliente. Adotá-los
implica **criar backend**, o que contraria "local-first, sem backend" e abre uma superfície de dados
infantis que hoje não existe. Isso não é detalhe de implementação: é a decisão.

---

## 3. As 26 perguntas

Convenção: **✅ SEM DEPENDÊNCIA** = existe caminho estendendo `performanceTrace.js` / `logger.js` /
o schema do `P-139`. **⚠️ DEPENDÊNCIA — NÃO AUTORIZADA** = a resposta completa exige pacote novo.

---

### A. Como detectar crashes?

**Estado verificado:** `grep` por `componentDidCatch`, `getDerivedStateFromError`, `ErrorBoundary` e
`ErrorUtils` em `src/` e `App.js` retorna **zero ocorrências**. O app **não tem** *error boundary*
nem *global handler*. Um erro de render em produção derruba a árvore React com tela cinza/branca e
**nada é registrado** — `logger.js:24` cala fora de `__DEV__`.

**✅ SEM DEPENDÊNCIA — crashes de JS.** Duas APIs de plataforma, nenhuma delas um pacote npm:

1. `ErrorUtils.setGlobalHandler(fn)` — global do React Native, presente em Hermes. Captura exceções
   não tratadas do thread JS e recebe `(error, isFatal)`.
2. Um componente de classe com `static getDerivedStateFromError` + `componentDidCatch` — API do
   `react` 19.1.0, já dependência (`package.json:64`).

Caminho concreto: um `errorTrace.js` irmão de `performanceTrace.js`, com a mesma guarda de `:45-52`,
que grava **apenas** `{ error_code, screen_id, fatal }`, onde `error_code` vem de uma **allowlist
fechada** derivada do `error.name` mais um mapeamento de mensagens conhecidas — **nunca** a mensagem
livre, **nunca** o `stack`. O plano já congelou essa forma: `05_PLANO_DE_MEDICAO_ANONIMA.md` §4.6,
campos proibidos = *"stack trace bruto… mensagem de erro livre"*. Persistência opcional em `R2`
(§K). Sem envio.

**Limite honesto e intransponível sem dependência:** crashes **nativos** (Java/Kotlin/ObjC/Swift,
C++ do Hermes, OOM kill do Android, watchdog termination do iOS) **não são observáveis por JS** — o
processo morre antes de qualquer callback JS rodar. Para esses, a única fonte sem dependência é a
**Camada 1**: Google Play Console → Android Vitals (taxa de travamento) e App Store Connect →
Xcode Organizer (Crashes). É exatamente o que `05_PLANO…` §4.6 declara como estado do lançamento
(retenção `RL`, agregação `A3`).

**⚠️ DEPENDÊNCIA — NÃO AUTORIZADA — cobertura de crash nativo em tempo real**
- **Nome:** `@sentry/react-native`.
- **Versão compatível:** a linha **7.x** é a que o catálogo do Expo SDK 54 resolve. **Incerteza
  declarada:** o *patch* exato deve sair de `npx expo install --check` contra o catálogo do SDK 54,
  não de memória. Não afirmo um número.
- **Motivo:** é o único caminho realista para capturar sinal nativo (signal handlers, JVM
  `UncaughtExceptionHandler`, `mach` exceptions) e correlacionar com o JS.
- **Arquivos afetados:** `package.json`, `package-lock.json`, `app.json` (array `plugins`,
  `app.json:60-71`), `eas.json` (DSN e upload de source map), `App.js` (init como primeiro efeito),
  possivelmente `metro.config.js`.
- **Impacto no bundle:** acréscimo de JS na ordem de **centenas de KB** e binário nativo de
  **alguns MB** (sentry-cocoa + AAR Android). **Números aproximados — não medidos neste repositório.**
- **Impacto nativo:** **sim**. Exige *config plugin* (`@sentry/react-native/expo`) e portanto
  **prebuild/CNG**. Isso é exatamente o que `D-OBS-01` proíbe.
- **Impacto Expo:** o app deixa de rodar no Expo Go; Development Build precisa ser regerado; toda a
  campanha física em curso (`F6-SG-A`) seria invalidada por mudança nativa.
- **Impacto privacy:** por padrão o SDK captura `stack trace` completo (com caminhos de arquivo),
  breadcrumbs de navegação e console, `device model` exato, e opcionalmente IP. Cada um desses é
  proibido pelo plano (§3.5 "modelo do aparelho proibido"; §4.6 "stack trace bruto" proibido).
  Desligá-los é possível (`beforeSend`, `sendDefaultPii: false`, `attachStacktrace: false`), mas a
  garantia passa a ser **configuração**, não **construção** — regressão em relação à allowlist atual.
- **Impacto LGPD/child privacy:** obriga a mudar `app.json:35-37`, hoje
  `NSPrivacyCollectedDataTypes: []` e `NSPrivacyTracking: false`, para declarar *Crash Data* e
  *Performance Data*; obriga a atualizar o formulário de Data Safety do Google Play; e traz o
  *privacy manifest* + assinatura do próprio SDK, que passa a ser auditável a cada release
  (`E5.59`). Sob Apple Kids Category e Google Play Families, SDK de terceiro em app infantil exige
  verificação contratual específica.
- **Alternativa sem dependência:** *error boundary* + `ErrorUtils` para JS (cobre a maioria dos
  defeitos que o time introduz) **+** Android Vitals / App Store Connect para o nativo. Cobertura
  menor, latência de dias em vez de minutos, custo zero, risco zero.

---

### B. Como detectar ANRs?

**Fato técnico primeiro:** ANR é um veredito do `system_server` do Android — 5 s sem despachar
input, 10 s de `BroadcastReceiver` em foreground, etc. Ele é emitido **quando o thread principal
está travado**. Se a UI thread está travada, código JS que dependa da ponte/JSI para reportar
**pode não conseguir rodar**. Detectar o próprio ANR de dentro do processo é estruturalmente frágil.
iOS não tem "ANR": tem *watchdog termination* (`0x8badf00d`), reportada só pelo sistema.

**✅ SEM DEPENDÊNCIA — mas medindo outra coisa, e dizendo que é outra coisa.** Dá para medir
**starvation do thread JS**, que não é ANR mas correlaciona: um `setInterval` de período fixo `P`
(ex.: 500 ms) registra o *drift* real; `drift > limiar` significa que o event loop JS ficou parado.
Isso vai para `performanceTrace` como faixa (§3.4 do plano: buckets, nunca valor contínuo). Custo:
um timer por sessão, desprezível, e **apenas sob a guarda** de `:45-52`.

**Rotular corretamente é obrigatório.** Chamar esse número de "ANR" seria falso: o thread JS pode
estar livre com a UI thread travada (animação nativa, layout caro, `WebView` do Colorir) e
vice-versa. Fonte autoritativa de ANR continua sendo **Android Vitals** (Camada 1), que é
justamente o que o `05_PLANO…` §4.6 declara.

**⚠️ DEPENDÊNCIA — NÃO AUTORIZADA:** `@sentry/react-native` (linha 7.x, mesma ressalva de versão)
oferece detecção de ANR/App Hangs a partir do lado nativo. Mesmos impactos de (A). **Alternativa
sem dependência:** watchdog de drift do loop JS, rotulado honestamente, + Android Vitals.

---

### C. Como medir cold start?

**✅ SEM DEPENDÊNCIA — já medido.** `bootMark.js:17` marca `app_render_start` como 2º import de
`App.js:2`; `buildSample` (`performanceTrace.js:311`) já entrega `firstLayoutMs` como
`app_render_start → {home|onboarding}_first_layout`, escolhendo a marca **da rota que realmente
governou o boot** (`:297-298`) — detalhe correto que evita medir navegação como se fosse boot.

**Limite honesto:** `t0` é o **início da avaliação do JS**, não o `fork` do Zygote nem o
`didFinishLaunchingWithOptions`. Tudo o que acontece antes do primeiro módulo JS — inicialização
nativa, carga do Hermes, splash nativo do `app.json:11-15` — é **invisível** a este coletor. Ler o
tempo de início do processo a partir do JS exigiria módulo nativo.

**Compensação sem dependência, já normativa no projeto:** o protocolo de captura de
`docs/DECISIONS.md:2186-2192` — `adb logcat -c` antes, captura começando em `Start proc`, PID sempre
correlacionado. A linha `ActivityManager: Displayed` dá o cold start medido pelo sistema. Isso é
externo ao app, custa zero e não exige nada instalado no aparelho da criança.

---

### D. Como medir time-to-interactive?

**Estado verificado: não é medido.** `firstLayoutMs` é **primeiro layout**, não interatividade —
`HomeScreen.js:762` chama `markOnce('home_first_layout')` dentro de `onLayout`, ou seja, quando a
`View` raiz recebe geometria. Entre isso e "a criança toca e algo responde" cabem: montagem das
abas, warm-up de assets (`src/services/assetPreloadService.js`, `beniAssetWarmup.js`), primeiro
frame realmente desenhado e a fila de interações.

**✅ SEM DEPENDÊNCIA — caminho concreto:**
1. Nova marca `home_interactive`, emitida por `markOnce` **depois** de
   `InteractionManager.runAfterInteractions` + um `requestAnimationFrame` duplo a partir do
   `onLayout` — isso garante que pelo menos um frame foi comitado e a fila de interações drenou.
   `InteractionManager` e `requestAnimationFrame` são do `react-native`, **não são dependência**.
2. Novo campo `interactiveMs` em `buildSample` (`performanceTrace.js:299-316`).
3. **`SAMPLE_SCHEMA` sobe de 2 para 3** (`:241`) e `METRICS`/`FIELDS` de
   `scripts/perf-baseline-report.js:25-35` recebem o campo **no mesmo commit** — o agregador rejeita
   schema divergente (`:23`), então a subida é segura e detectável.

**Ressalva de governança:** isto **instrumenta uma superfície nova**, e `PF6R3X-EXC-T077`
(`docs/DECISIONS.md:2129-2131`) proíbe textualmente *"instrumentar novas superfícies de produto"*
dentro da exceção da Fase 6. Portanto: **é caminho sem dependência, mas exige Human Gate próprio.**

**Ressalva técnica:** `runAfterInteractions` mede a fila de interações do JS, não a
responsividade real ao toque. É uma aproximação. Dizê-lo é obrigatório.

---

### E. Como medir troca de telas?

**Estado verificado: não é medido, e isso está registrado.** `docs/DECISIONS.md:2162-2164`
(`PF6R3X-R3X2`, achado `F-04`): *"tempo de transição entre telas, custo de foco/desfoco, latência de
toque em destino de aba e correlação entre navegação e áudio continuam sem instrumentação"*.

**✅ SEM DEPENDÊNCIA.** `@react-navigation/native` ^7.2.4, `@react-navigation/stack` ^7.9.2 e
`@react-navigation/bottom-tabs` ^7.16.1 **já são dependências** (`package.json:49-51`) e já expõem o
necessário: `NavigationContainer.onStateChange`, e os eventos `focus`, `blur`, `transitionStart`,
`transitionEnd` do stack. Medir `intenção de navegar → transitionEnd` por `route.name` é possível
sem instalar nada.

**Três restrições concretas que precisam entrar no desenho:**
1. `route.name` precisa passar por **allowlist fechada de rotas** antes de virar metadata —
   `SAFE_VALUE` (`:37`) aceita qualquer identificador curto, o que é forma correta mas não garante
   que só rotas conhecidas entrem.
2. `TRACE_BUFFER_LIMIT = 200` (`:20`) é um orçamento **desenhado para o boot**. Navegação é evento
   recorrente; uma sessão infantil de 20 minutos estoura isso e o excedente vira `dropped` (`:86`).
   Solução: buffer anelar separado por categoria, ou teto por categoria — não aumentar o teto global.
3. `ALLOWED_META_KEYS` (`:29`) tem 6 chaves e `TRACE_MAX_META_KEYS` (`:22`) é 4. Chaves novas exigem
   decisão explícita, e cada chave nova é superfície de vazamento.

---

### F. Como detectar render lento?

**✅ SEM DEPENDÊNCIA — parcialmente.**
- `<Profiler>` do `react` 19.1.0 (`package.json:64`) entrega `onRender(id, phase, actualDuration,
  baseDuration, startTime, commitTime)`. Envolver apenas árvores suspeitas, **somente sob a guarda**
  de `isPerformanceTraceEnabled()`, e emitir `actualDuration` em **faixa**, nunca em ms cru.
- Dev Menu → *Perf Monitor* (RN nativo, zero instalação) mostra FPS de UI e JS em desenvolvimento.

**Limites honestos, dois:**
1. `<Profiler>` **tem custo próprio** e infla o que mede. O número não é representativo de release.
   Serve para comparar A/B **dentro do mesmo build**, não para afirmar desempenho de produto.
2. **Quadros perdidos não são observáveis com fidelidade a partir do JS na New Architecture.** A
   fonte externa é `Choreographer: Skipped frames` no logcat, e `docs/DECISIONS.md:2183-2185` já
   registra a ressalva correta: ele só dispara a partir de **30 quadros consecutivos** perdidos, e
   *"a ausência de log não prova fluidez"*. Pior: o mesmo registro documenta que linhas de
   `Skipped frames` foram atribuídas erradamente ao app quando pertenciam ao **PID 26398 = Samsung
   SmartCapture**. Sem correlação de PID, esse sinal é lixo.

**Nota específica de Reanimated:** `react-native-reanimated` ~4.1.1 e `react-native-worklets` 0.5.1
rodam em runtime separado. **Nunca chamar `mark` de dentro de um worklet** — o módulo é estado de
JS runtime e a chamada seria, na melhor hipótese, incorreta.

---

### G. Como detectar imagem/decode lento?

**✅ SEM DEPENDÊNCIA.** `expo-image` ~3.0.11 (`package.json:60`) já expõe `onLoadStart`, `onLoad`,
`onError` e `onDisplay`. Medir `onLoadStart → onLoad` por **classe de asset** (cena de história,
retrato de Colorir, ícone de UI) — **nunca por `storyId` correlacionável ao progresso da criança**,
que é campo explicitamente proibido em `05_PLANO…` §4.5.

**Três ressalvas técnicas obrigatórias:**
1. `expo-image` mantém cache de memória e disco. A segunda medição da mesma imagem não é a fria. A
   amostra precisa carregar `first_load: true|false` (booleano, já aceito por `ALLOWED_META_KEYS`
   via `ok`… na prática exige chave nova → decisão explícita).
2. **Incerteza declarada:** se `onLoad` dispara após *decode* ou após *decode + primeiro desenho* é
   detalhe de implementação por versão. Deve ser **verificado empiricamente** antes de o número
   virar critério. Não afirmo o comportamento aqui.
3. Existe pré-carga própria (`assetPreloadService.js`, `beniAssetWarmup.js`) que desloca o custo
   para antes da tela. Medir a tela sem medir a pré-carga produz conclusão errada.

---

### H. Como detectar I/O/storage lento?

**✅ SEM DEPENDÊNCIA — e já parcialmente feito, com resultado.** Os três providers já marcam
início e fim da hidratação: `ProfileContext.js:27,31`, `ProgressContext.js:187,213`,
`PacksContext.js:105,128`. O dado de campo respondeu a pergunta: **33 / 58 / 23 ms**. AsyncStorage
**não** é o gargalo deste boot.

**Extensão sem dependência:** um utilitário `timed(classe, fn)` em `performanceTrace.js` que
cronometra chamadas de `AsyncStorage` e `expo-file-system` **por classe de operação** (`profile`,
`progress`, `packs`, `drawings`, `gallery`) — nunca por chave, nunca por caminho de arquivo.
Caminho de arquivo é PII estrutural: `drawingStorage.js` e `fileBlobStore.js` operam em `/legacy` com
nomes derivados de criação infantil. **Nome de arquivo nunca entra em metadata.**

**Onde isso importa de verdade:** o pipeline de download de packs
(`packDownloadService.js:520-521, 611-618`) faz I/O grande com timeouts próprios. Ali, medir bytes/s
em faixa é útil; medir por `storyId` não é permitido.

---

### I. Como detectar erro de rede?

**Superfície de rede verificada — é pequena e mapeada.** Um único `fetch` em `src/services`:
`globalManifestService.js:211`, com `AbortController` e timeout padrão de 10 000 ms (`:203`). Mais os
downloads resumíveis de `packDownloadService.js:520,611`. Ambos **iniciados por ação adulta** atrás
de botão rotulado — fato já apurado em `PF5-P149` (`docs/DECISIONS.md:1664`).

**Problema atual:** as falhas já são estruturadas — `globalManifestService.js:213-227` devolve
`{ ok:false, errors:[…] }` com razões distintas (`HTTP ${status}`, `timeout`, `rede indisponível`,
`JSON inválido`) — mas o único registro é `warn(…)` em `:222`, que é **`__DEV__`-only**
(`logger.js:20`). Fora de desenvolvimento, **nenhuma falha de rede deixa rastro**.

**✅ SEM DEPENDÊNCIA — caminho concreto:** mapear aqueles retornos estruturados para um
`error_code` de **allowlist fechada** — `net_timeout`, `net_offline`, `http_4xx`, `http_5xx`,
`bad_json`, `checksum_fail` — e emitir via `mark`. **Regras duras:** nunca a URL (contém o host do
bucket, `eas.json:25`); nunca `res.status` cru (bucketizar em classe); nunca o `storyId`, porque
correlacionado ao download revela o que aquela criança está consumindo.

---

### J. Como distinguir problema DEV de problema Preview/produção?

Esta é a pergunta que o dado de campo torna urgente, e hoje **a amostra não permite distinguir**:
`buildSample` (`:299-316`) não carrega **nenhum** discriminador de build. Duas amostras de origens
diferentes são indistinguíveis no log e no agregador.

**✅ SEM DEPENDÊNCIA — caminho concreto:** acrescentar dois campos que já estão disponíveis sem
pacote algum:
- `dev: __DEV__` — booleano do runtime.
- `profile: process.env.EXPO_PUBLIC_BUILD_PROFILE ?? 'unset'` — já declarado em `eas.json:23`
  (`preview`), `:42` (`preview-criador`) e `:73` (`c60-pilot`). **Sua ausência em `development` e
  `production` é, ela própria, informação** — combinada com `dev`, separa os cinco casos.

E uma regra no agregador: **`scripts/perf-baseline-report.js` deve recusar-se a misturar coortes com
`dev`/`profile` diferentes**, em vez de calcular uma mediana sem sentido. Hoje ele não tem como
saber.

**Declaração honesta:** cravar `EXPO_PUBLIC_BUILD_PROFILE` também em `production` e `development`
seria melhor, e **exige editar `eas.json`** — proibido por `D-OBS-01` (`docs/DECISIONS.md:2460`).
O caminho `?? 'unset'` funciona sem isso.

**Regra de leitura já normativa:** um Development Build carrega JS pelo Metro e infla o número
(`docs/DECISIONS.md:2520-2521`). Nenhuma conclusão de produto sai de amostra DEV.

---

### K. Como guardar métricas offline?

**Estado:** `R0`. `events` e `measures` são arrays de módulo (`performanceTrace.js:39-40`),
destruídos com o processo. Nada é gravado. Isso é a razão de o coletor ser inofensivo.

**✅ SEM DEPENDÊNCIA.** `@react-native-async-storage/async-storage` ^2.2.0 já é dependência
(`package.json:48`). Um buffer anelar sob chave versionada nova (padrão do projeto: sufixo `_v1`,
como `@ptf_entitlement_v1`), com a política **`R2` já congelada** por `PF5-MEDICAO`
(`docs/DECISIONS.md:1670`): **≤ 7 dias ou ≤ 200 registros, o que vier primeiro**.

**Cinco requisitos que não podem ser esquecidos:**
1. **Escrita em lote**, no `blur`/background — nunca por evento. Escrever a cada `mark` transformaria
   o observador em causa do problema observado.
2. **Teto em bytes**, não só em contagem.
3. **Poda na leitura**, não só na escrita — o app pode ficar semanas sem abrir, e não há cron.
4. **Falha fechada:** erro de leitura, schema desconhecido ou JSON inválido ⇒ descartar tudo e
   seguir desligado (`05_PLANO…` §10, "regra de falha segura").
5. **Acoplamento obrigatório ao reset:** a partir do momento em que existe persistência, ela é dado
   no aparelho da criança e **tem de ser apagada pelo "Apagar dados" da Área dos Pais** (garantias da
   Fase 4D). Persistir sem ligar ao reset seria criar um dado órfão — regressão de privacidade.

---

### L. Como enviar posteriormente sem expor criança?

**Resposta curta: hoje, não enviando.** `PF5-MEDICAO` congelou **zero categorias enviando dados no
lançamento** (`docs/DECISIONS.md:1670`). Não existe destino: não há backend, e o único host remoto é
um bucket estático de leitura.

**Forma que um envio futuro teria de ter** — já congelada, não inventada aqui
(`05_PLANO…` §3.4, §3.5, §6.5):
- Payload: **apenas** `platform` ∈ {ios, android}, `os_major` inteiro, `device_class` ∈
  {phone, tablet}, `app_version`. **Nada além dos quatro.**
- Durações em **faixa** (`0-2s`, `2-5s`, …). Nenhum valor contínuo sai.
- Carimbo: **semana ISO + faixa de 6 h**. Nenhuma precisão de segundo, minuto ou hora.
- Sumarização **no aparelho** antes de sair (`A1`); agregação por coorte com supressão `k ≥ 20` no
  processamento (`A2`).
- Borda descarta IP e User-Agent completo.
- `R3` = 90 dias para o registro de evento; depois, só agregado irreversível.
- Consentimento adulto **por finalidade**, revogável, atrás do portão parental — e revogação apaga a
  fila local.

**Consequência honesta já registrada e que precisa ser dita ao adulto:** com agregação irreversível,
**exclusão individual na Camada 3 é impossível** (`05_PLANO…` §6.4). Prometer o contrário seria
mentira.

**Isto exige backend.** Backend é decisão de produto de outra magnitude e não é objeto deste ADR.

---

### M. Como trabalhar sem account/user identifiers desnecessários?

**Estado favorável:** o app **não tem login, não tem conta, não tem backend**. Não existe
identificador remoto a minimizar — existe um a **não criar**.

**Armadilha concreta e nomeada:** `@noble/hashes` ^2.2.0 **já está instalado** (`package.json:47`).
A tentação de `sha256(childId)` como "identificador anônimo" é real e está **proibida**:
`docs/DECISIONS.md:2538` proíbe *"converter o `childId` local em identificador remoto"*, e um hash
determinístico do `childId` **é** o `childId` — pseudonimização, não anonimização. A distinção está
congelada em `05_PLANO…` §0.4 e no registro literal do fundador (`docs/DECISIONS.md:1671`).

**✅ SEM DEPENDÊNCIA — caminho:** **nenhum identificador**. Contagem agregada por coorte não precisa
de ID. Se um dia for necessária uma chave de deduplicação, ela terá de ser um valor **aleatório por
instalação, rotativo, não derivado de nada local e não juntável ao armazenamento do app** — e ainda
assim exige gate próprio. A opção padrão continua sendo: nenhum.

---

### N. Como fazer redaction?

**✅ SEM DEPENDÊNCIA — já implementado, e no formato certo.** A defesa é *allow-by-construction*:

| Mecanismo | Local | O que garante |
|---|---|---|
| `ALLOWED_META_KEYS` (6 chaves) | `:29` | Chave fora da lista nunca é copiada |
| `TRACE_MAX_META_KEYS = 4` | `:22` | Teto de chaves por evento |
| `SAFE_NAME` `/^[a-z][a-z0-9_]{0,39}$/` | `:32` | Nome de marca é identificador snake_case |
| `SAFE_VALUE` `/^[A-Za-z_][A-Za-z0-9_]{0,23}$/` | `:37` | Exclui espaço, acento, `@`, frase, JSON, URL |
| `sanitizeMetadata` | `:64-79` | Objeto, array, `null` e string livre são **descartados** |
| Retorno silencioso | `:85`, `:116` | Nome inválido não é registrado nem gera erro |

Isto é melhor que a abordagem usual de SDK (regex de *denylist* sobre payload arbitrário): aqui,
**nome, e-mail, texto de história e conteúdo de desenho são impossíveis por forma**, não por
vigilância.

**Fraqueza honesta:** `SAFE_VALUE` valida **forma**, não **domínio**. Uma string curta como `Ana`
passaria se algum chamador a colocasse em `reason`. A garantia hoje é estrutural (nenhum chamador
tem motivo) e não criptográfica. **Endurecimento sem dependência:** trocar o regex de valor por um
**enum fechado por chave** (`reason ∈ {loaded, error, timeout}`, `route ∈ {Home, Onboarding}`), o
que o próprio comentário de `:26-28` já descreve como intenção.

---

### O. Como limitar retenção?

**Estado:** `R0` puro. Nada é gravado, logo nada é retido. É o estado mais forte possível.

**✅ SEM DEPENDÊNCIA — classes já congeladas** (`docs/DECISIONS.md:1670`, `05_PLANO…` §3.2):
`R0` memória · `R1` local até o adulto apagar · `R2` local rotativo (7 dias / 200 registros) ·
`R3` remoto ≤ 90 dias · `R4` remoto só agregado · `RL` da loja · `RT` legal.

**Regras de implementação, concretas:**
- Diagnóstico técnico nunca usa `R1` sem apagamento visível ao adulto.
- Poda executada **na leitura**, porque não há processo de fundo.
- **Assimetria já registrada** (`docs/DECISIONS.md:1672`): revisão jurídica futura pode exigir
  retenção **menor** sem reabrir o Product Lock; retenção **maior** exige decisão formal nova.
- `RL` é **declarada, não prometida** — o projeto não controla a retenção da Play Console nem do
  App Store Connect e não pode dar prazo em nome delas.

---

### P. Como controlar volume e custo?

**Custo hoje: zero.** Uma linha de `console.log` por processo (`:354`), sem rede, sem storage.

**Controles que já existem e que devem virar padrão:**
- Teto de buffer `200` (`:20`) com contador `dropped` (`:86`) exposto na amostra como
  `bufferDropped` (`:315`). **A amostra reporta a própria perda** — propriedade rara e correta:
  `bufferDropped 0` no dado de campo significa que a amostra é completa, não truncada.
- Teto de espera dos providers 3 000 ms (`:243`) e teto terminal 12 000 ms (`:258`): o coletor
  **sempre termina**, mesmo quando o boot não termina.
- Emissão única por processo (`:340`).

**Para qualquer futuro remoto:** teto de eventos por sessão, amostragem **decidida no aparelho**
(nunca por servidor — configuração remota é a categoria 11, **proibida**, `05_PLANO…` §4.11), envio
em lote no background, e contagem explícita do descartado. **O custo financeiro não é a restrição
que decide** — a restrição que decide é privacidade infantil.

---

### Q. Como versionar schema?

**✅ SEM DEPENDÊNCIA — já existe e já foi exercitado.** `SAMPLE_SCHEMA = 2`
(`performanceTrace.js:241`), com a justificativa da subida escrita no próprio arquivo (`:234-240`):
v1 nunca foi coletada porque o coletor era inalcançável, então não há baseline histórica perdida.
O agregador **rejeita** schema divergente (`scripts/perf-baseline-report.js:23`) e valida a lista de
campos obrigatórios (`:35`).

**Regras a formalizar:**
1. Campo novo, campo removido ou semântica alterada ⇒ **novo inteiro**. Sem "versão menor".
2. O agregador **nunca** mistura versões — recusa, não converte.
3. Subir a versão e atualizar `METRICS`/`FIELDS` acontecem **no mesmo commit**.
4. `null` é "não medido" e é **contado**, nunca substituído por zero
   (`scripts/perf-baseline-report.js:14`) — a distinção entre "não medi" e "foi instantâneo" é a
   diferença entre dado e ficção.
5. O campo `terminal` (`:304`) é o modelo a seguir: ele existe justamente porque
   `firstLayoutMs: null` era ambíguo entre "não medi" e "nunca aconteceu".

---

### R. Como correlacionar versão/build/device class?

**Alvo:** exatamente os quatro atributos congelados (`05_PLANO…` §3.5) — `platform`, `os_major`,
`device_class`, `app_version`. **Proibidos:** modelo, fabricante, resolução, densidade, idioma, fuso,
operadora, memória, `deviceName`, tipo de rede.

**✅ SEM DEPENDÊNCIA — três dos quatro:**
- `platform` ← `Platform.OS` (`react-native`, sem pacote novo).
- `os_major` ← `Platform.Version` (Android: inteiro de API level; iOS: string, extrair o major).
- `device_class` ← menor lado em dp via `useWindowDimensions()`; `≥ 600 dp` = `tablet`. Isso é
  **coerente com a faixa já normativa do projeto** (Médio 600–899, `docs/DECISIONS.md:2100-2107`) e
  evita `expo-device`, que traria o modelo exato — o campo proibido.

**O quarto é o problema honesto.** `app_version` vive em `app.json:5` (`"1.0.0"`). Lê-lo em runtime
normalmente exige `expo-constants` ou `expo-application` — **nenhum dos dois está em
`package.json`**. Sem dependência restam duas saídas, ambas com defeito declarado:
(a) constante em `src/config/productConfig.js` mantida **manualmente** em sincronia com `app.json` —
frágil, e a fragilidade tem de estar escrita no arquivo; (b) variável `EXPO_PUBLIC_*` por perfil —
**exige editar `eas.json`, proibido por `D-OBS-01`**. Recomendação: (a), com comentário explícito de
que é espelho manual, até um gate permitir (b).

**⚠️ DEPENDÊNCIA — NÃO AUTORIZADA:** `expo-constants` ou `expo-application` (ambos do catálogo Expo,
instaláveis por `npx expo install`, compatibilidade com SDK 54 alta e sem *prebuild* adicional).
Impacto de bundle pequeno; impacto de privacidade **nulo se usados só para `nativeApplicationVersion`**
— o risco é `expo-device`, que expõe modelo. Ainda assim: **alterar `package.json` está proibido
agora**. **Alternativa sem dependência:** a constante espelhada de (a).

---

### S. Como manter observabilidade desabilitável?

**✅ SEM DEPENDÊNCIA — já é assim, e é o modelo a generalizar.** `isPerformanceTraceEnabled()`
(`:45-52`) é síncrona, local, sem rede, e devolve `false` em caso de exceção (`:49-51`). **Todas** as
funções públicas começam por ela: `mark` `:84`, `markOnce` `:115`, `measure` `:131`, `getSnapshot`
`:146`, `summarize` `:180`, `buildSample` `:288`, `emitSummaryOnce` `:337`. O handle de depuração
`globalThis.__ptfPerf` **só existe** quando ligado (`:388-392`) — desligado, ele nem aparece.

Os cinco níveis de desligamento do plano (§10) e a propriedade que os une: **nenhum depende de
rede**. Um interruptor remoto seria, ele mesmo, configuração remota — proibida.

| Nível | Mecanismo | Depende de rede? |
|---|---|---|
| 1 | código não compilado no perfil | não |
| 2 | `EXPO_PUBLIC_PTF_PERF_TRACE` ausente (`eas.json:47-58` — `production` não a declara) | não |
| 3 | bandeira em `src/config/featureFlags.js` | não |
| 4 | ausência de consentimento (estado inicial) | não |
| 5 | revogação adulta ⇒ fila local apagada | não |

**Invariante a inscrever no ADR:** *nenhum caminho de observabilidade é alcançável sem passar por uma
guarda local síncrona cujo modo de falha é desligado.*

---

### T. Como garantir baixo overhead?

**Evidência do que existe:** `mark` desligado retorna no **primeiro `if`** (`:84`). Ligado, faz um
teste de regex, um `push` e um laço sobre 6 chaves. Não faz `setState`, não dispara render, não toca
disco nem rede — contrato declarado em `:8-16` e verificável por leitura.

**Cinco regras concretas para manter isso:**
1. **Nunca marcar dentro de `render`.** Todas as marcas atuais vivem em `useEffect`, `onLayout`
   (`HomeScreen.js:762`, `OnboardingScreen.js:322`) ou callbacks de conclusão.
2. **Nunca marcar em callback de scroll, gesto ou frame de animação.**
3. **Custo escondido real:** o objeto de metadata é construído **pelo chamador**, antes de `mark`
   poder desistir. Em caminho quente, o call site deve checar `isPerformanceTraceEnabled()` antes de
   alocar o objeto. Isso é medível e não é hipotético.
4. **Nunca de dentro de worklet** (Reanimated/Worklets rodam em outro runtime).
5. **Emissão única** (`:340`) e **timers sempre canceláveis** (`cancelSampleEmission`, `:379-384`).

**Ressalva de honestidade:** *"baixo overhead"* aqui é **argumentado por inspeção**, não medido. O
projeto não tem microbenchmark. Afirmar número seria inventar.

---

### U. Como respeitar LGPD/child privacy/store rules?

**Postura atual, verificável:** `app.json:35-37` declara `NSPrivacyCollectedDataTypes: []`,
`NSPrivacyTracking: false`, `NSPrivacyTrackingDomains: []`. O único `NSPrivacyAccessedAPIType`
declarado é `UserDefaults` com razão `CA92.1` (`app.json:26-34`). Isso só é sustentável porque **não
há coleta**.

**O que cada eixo exige, concretamente:**
- **LGPD:** art. 14 — tratamento de dados de crianças exige consentimento **específico e destacado**
  de ao menos um dos pais; e o princípio da necessidade (art. 6º, III) já derruba a maioria dos
  campos padrão de SDK. `D-4E-CONSENTIMENTO` é a implementação dessa exigência.
- **Apple:** *Kids Category* restringe severamente analytics de terceiro; qualquer SDK listado
  precisa fornecer *privacy manifest* + assinatura, que passam a ser auditados a cada release
  (`E5.59`). O *privacy manifest* do app precisaria declarar *Crash Data* / *Performance Data*.
- **Google:** *Families / Designed for Families* exige SDK certificado; o formulário de **Data
  Safety** teria de ser reaberto.
- **Estado já registrado do projeto:** conformidade jurídica **não foi declarada**
  (`docs/DECISIONS.md:1631`); é **proibido** dizer *"legalmente aprovado"*, *"100% conforme"*,
  *"nenhum risco"* ou *"anonimização garantida"*. Este ADR **não** declara conformidade.

**Complicação já existente e que precisa ser dita:** `react-native-purchases` ^10.4.1 é SDK de rede
de terceiro **já instalado**, e processa dados de compra. Foi por isso que
`D-4E-TEXTO-PRIVACIDADE` proibiu a frase absoluta *"sem coleta de dados"* e que `P-149` registra
**seis** textos divergentes em `ParentAreaScreen.js` (`:890,896,911,952,1104,1280`). Adicionar um
segundo SDK de rede pioraria um problema de texto que ainda não foi resolvido.

**Caminho de menor risco jurídico: Camada 2 local.** Dado que não sai do aparelho não gera
tratamento remoto, não muda o *privacy manifest*, não muda Data Safety e não exige consentimento
adicional. É a postura atual e é a recomendada.

---

### V. Como impedir screen/session replay não autorizado?

**Proibição já normativa:** `docs/DECISIONS.md:2468-2469` — *"Nada de screen replay ou session
replay"*.

**O risco específico deste app, que não é óbvio:** o Colorir/Criar Livre já possui um pipeline de
**captura do canvas** via `react-native-webview` 13.15.0 → `postMessage` → base64 (autorizado como
uso **transitório** pelo `CLAUDE.md`). Ou seja: **a capacidade técnica de produzir uma imagem do que
a criança está fazendo já existe dentro do app.** A proibição de replay, aqui, não é abstrata — é a
regra de que essa saída **nunca** pode ser encaminhada a um canal diagnóstico.

**✅ SEM DEPENDÊNCIA — enforcement executável.** Não há ESLint no projeto; o portão é `npm run smoke`
(`package.json:14`, script único em `scripts/smoke.js`). Três asserções a acrescentar lá:
1. **Nenhuma** das strings `@sentry/`, `@opentelemetry/`, `@grafana/faro`, `logrocket`, `posthog`,
   `smartlook`, `prom-client`, `session-replay` aparece em `dependencies`/`devDependencies` de
   `package.json`.
2. **Nenhum** módulo de `src/` importa esses nomes.
3. **Nenhuma** saída do pipeline de captura do canvas é passada a `mark`, `markOnce` ou a qualquer
   função de `errorTrace`/logger fora do fluxo de desenho.

Asserção em `smoke` é superior a uma regra escrita: ela **falha o build**.

---

### W. Como integrar alertas de regressão posteriormente?

**Separação obrigatória.** "Alerta" no sentido de alguém ser notificado exige um serviço que
**receba** dados — backend. Não existe e não está previsto.

**✅ SEM DEPENDÊNCIA — o que dá para ter agora: gate de regressão, não alerta.**
`scripts/perf-baseline-report.js` já calcula **mediana e p90** sem dependência. Acrescentar:
- modo `--baseline <arquivo>` comparando a coorte atual com uma baseline versionada;
- limiares por métrica (ex.: p90 de `firstLayoutMs` > baseline × 1,25 ⇒ `exit 1`);
- execução em `.github/workflows/ci.yml`, ao lado de `npm run smoke`.

**Limitação honesta e decisiva:** não há *device farm*. As amostras entram **manualmente**, colhidas
por um humano com um aparelho. Portanto isto é **gate com humano no circuito**, com latência de dias
— não monitoramento contínuo. Chamá-lo de "alerta" seria exagero.

**⚠️ DEPENDÊNCIA — NÃO AUTORIZADA (e, aqui, provavelmente sempre):** alerta contínuo exigiria
ingestão + armazenamento de séries + regras (Prometheus/Alertmanager ou equivalente hospedado) +
cliente emissor no aparelho. Cada uma dessas peças é backend ou SDK. **Alternativa sem
dependência:** o gate acima, mais Android Vitals / App Store Connect, cujos alertas já existem, já
são agregados, e não custam nem uma linha de código no app.

---

### X. Qual papel real de Grafana e Prometheus?

**Prometheus — o que é:** um servidor que faz *scrape* periódico de um endpoint HTTP `/metrics` em
alvos de vida longa, guarda séries temporais e avalia regras.

**Por que apontá-lo para o telefone é tecnicamente errado** — seis razões, todas independentes:

1. **Modelo *pull*.** Prometheus abre conexão **para** o alvo. Um telefone não é servidor.
2. **NAT / CGNAT.** Aparelhos móveis vivem atrás de NAT de operadora e de roteador doméstico; não há
   endereço de entrada. Furar isso significaria VPN ou túnel reverso permanente **num aparelho
   infantil** — inaceitável.
3. **IP efêmero.** O endereço muda a cada troca Wi-Fi↔celular. Descoberta de alvo seria um serviço
   próprio (mais backend) e ainda assim chegaria atrasada.
4. **Alvo não é *long-lived*.** O SO mata o processo. `up == 0` seria o estado normal, e falha de
   scrape ficaria indistinguível de app quebrado — o sinal perde significado.
5. **Bateria e rádio.** *Scrape* a cada 15 s implica acordar o rádio continuamente. Em app infantil
   usado offline, isso é dano direto ao produto.
6. **Cardinalidade e privacidade.** Cada aparelho seria um `instance` — **uma série temporal por
   dispositivo**, ou seja, exatamente o identificador estável que a allowlist de quatro atributos
   (`05_PLANO…` §3.5) existe para impedir. Prometheus explode em custo com alta cardinalidade, e
   aqui a explosão de custo e a violação de privacidade são **o mesmo evento**.

Existem contornos (`Pushgateway`, `remote_write`, OTLP push), mas **todos** exigem um ingestor
próprio — isto é, backend. O contorno não elimina o problema estrutural; só o move.

**Papel correto de Prometheus:** **exclusivamente backend**, coletando métricas de um serviço de
ingestão de primeira parte. Este projeto não tem esse serviço e não planeja ter.

**Grafana — o que é:** camada de visualização e alerta sobre um armazenamento. **Zero papel no
cliente.** É útil no dia em que houver backend; até lá, não resolve nada. **Atenção:** *Grafana
Faro* é coisa diferente — é **SDK de cliente**, e é justamente o que `D-OBS-01` nomeia como não
autorizado (`docs/DECISIONS.md:2457-2458`). **Incerteza declarada:** o suporte de Faro a React
Native não é maduro/estabelecido até onde este estudo apurou; não afirmo existência de pacote RN
oficial.

---

### Y. Qual papel real de OpenTelemetry?

**O que OTel realmente é**, separando as quatro coisas que costumam ser confundidas:
(1) uma **API**; (2) um **SDK** por linguagem; (3) um **protocolo de fio** (OTLP); (4)
**convenções semânticas** de nomes de atributo.

**O valor real para este projeto está em (4) e em parte de (1) — e custa zero.** A amostra atual já
é, na prática, um *trace* degenerado: um `t0` (`app_render_start`), marcas nomeadas, durações
derivadas por par início/fim (`deltaBetween`, `:272-276`) e um evento terminal explícito
(`terminal`, `:304`). Adotar a **forma** de OTel — bloco `resource` com exatamente os quatro
atributos congelados, versionamento explícito de schema (já existe, `:241`), nomes de span
estáveis, relógio monotônico (já existe, `:55-61`) — é adotar boas ideias sem instalar nada.

**Por que os pacotes não servem hoje:**
- `@opentelemetry/api` + `@opentelemetry/sdk-trace-*` são desenhados para Node e navegador; a
  compatibilidade com **Hermes + New Architecture** não é garantida pelo catálogo Expo e **não foi
  verificada** neste estudo. **Incerteza declarada.**
- Propagação de contexto do SDK depende de mecanismos de async context que não existem em Hermes;
  na prática, exigiria gestão manual — anulando a vantagem.
- **OTel sem exportador é inútil**, e o exportador OTLP aponta para um **Collector** = backend.
- Árvore de dependências não trivial dentro do bundle, para benefício zero enquanto não houver
  destino.

**⚠️ DEPENDÊNCIA — NÃO AUTORIZADA**
- **Nome:** `@opentelemetry/api` (linha 1.x) + `@opentelemetry/sdk-trace-web` + exportador OTLP.
- **Versão compatível com Expo SDK 54 / RN 0.81.5 / New Arch:** **não estabelecida.** Nenhum desses
  pacotes está no catálogo do Expo; `npx expo install` não os gerencia. Afirmar compatibilidade
  seria irresponsável.
- **Motivo:** padronização de traces e portabilidade de fornecedor.
- **Arquivos afetados:** `package.json`, `package-lock.json`, `App.js` (bootstrap do provider),
  provavelmente `metro.config.js` (resolução de módulos Node).
- **Impacto no bundle:** significativo e **não medido** — o SDK web puxa várias sub-bibliotecas.
- **Impacto nativo:** nenhum em tese (é JS puro), o que o torna menos invasivo que Sentry — mas
  também menos capaz: **não vê crash nativo nem ANR**.
- **Impacto Expo:** pacotes fora do catálogo, sem garantia de compatibilidade a cada upgrade de SDK.
- **Impacto privacy:** convenções semânticas padrão incluem atributos (`device.model.identifier`,
  `network.carrier.name`, `user_agent`) **explicitamente proibidos** por `05_PLANO…` §3.5. Usar OTel
  "por padrão" seria violar o plano; usar OTel com allowlist é reescrever o que já existe.
- **Impacto LGPD/child privacy:** OTel só faz sentido com exportação; exportação é Camada 3;
  Camada 3 exige consentimento adulto e um destino que não existe.
- **Alternativa sem dependência:** adotar o **vocabulário e a disciplina** de OTel dentro de
  `performanceTrace.js` — bloco `resource` de 4 atributos, versão inteira de schema, nomes estáveis,
  pares início/fim. Todo o valor conceitual, nenhum pacote.

---

### Z. Qual solução mínima de lançamento?

Ver §6, que é a resposta completa e ordenada.

---

## 4. Blocos de dependência — resumo consolidado

Nenhum destes está autorizado. Listados para que a decisão futura seja informada, não para que seja
antecipada.

| Dependência | Versão p/ Expo 54 · RN 0.81.5 · New Arch | Nativo? | Bundle | Privacy | Alternativa sem dependência |
|---|---|---|---|---|---|
| `@sentry/react-native` | linha **7.x** — *patch* exato só via `npx expo install --check`; **não afirmado** | **Sim** — config plugin + prebuild | JS centenas de KB + nativo alguns MB (**estimado**) | Alto: stack, breadcrumbs, modelo exato, IP. Muda `app.json:35-37` e Data Safety | `ErrorBoundary` + `ErrorUtils` + Android Vitals / App Store Connect |
| `@opentelemetry/*` | **não estabelecida** — fora do catálogo Expo | Não | Significativo, **não medido** | Convenções padrão incluem atributos proibidos | Adotar o formato de OTel dentro de `performanceTrace.js` |
| `prom-client` | **inaplicável** — biblioteca Node (`perf_hooks`, `process`), não funciona em Hermes | Não | — | Exigiria expor endpoint no aparelho | Nenhuma necessidade: Prometheus é backend |
| `@grafana/faro-*` | suporte RN **não estabelecido** (**incerto**) | Provável | Não medido | SDK de cliente com replay — nomeado como não autorizado | Camada 2 local |
| `expo-device` | catálogo Expo, compatível | Não | Pequeno | **Expõe modelo exato — campo proibido** | `Platform.OS` + `Platform.Version` + dp da tela |
| `expo-constants` / `expo-application` | catálogo Expo, compatível | Não | Pequeno | Baixo se usado só para versão | Constante espelhada em `src/config/productConfig.js` |

---

## 5. Recomendação arquitetural faseada

### Fase I — AGORA, sem dependência, sem Human Gate novo (só documental)

Este ADR e o verbete `D-OBS-01`. **Nada de código.**

### Fase II — Próximo Human Gate, ainda **sem nenhuma dependência**

Ordenado por razão valor/risco, do maior para o menor:

1. **Discriminador de build na amostra** (§J) — `dev` + `profile`, `SAMPLE_SCHEMA` → 3, agregador
   recusando mistura de coortes. **Sem isso, todo número medido é ambíguo.** É o item mais barato e
   mais valioso da lista.
2. **`ErrorBoundary` + `ErrorUtils.setGlobalHandler`** (§A) — hoje um erro de render em produção é
   invisível **e** derruba a tela. Isto conserta duas coisas: observabilidade **e** experiência
   infantil (tela de recuperação amigável em vez de tela branca).
3. **Marca de time-to-interactive** (§D) — para atacar os ~2080 ms não explicados. Exige gate porque
   `PF6R3X-EXC-T077` proíbe instrumentar superfície nova dentro da Fase 6.
4. **Códigos de erro de rede de allowlist fechada** (§I) — as falhas já são estruturadas; falta só
   não perdê-las fora de DEV.
5. **Asserções anti-SDK e anti-replay em `npm run smoke`** (§V) — enforcement executável do que hoje
   é só texto.
6. **Endurecer `SAFE_VALUE` para enum fechado por chave** (§N).
7. **Comparação com baseline em `perf-baseline-report.js`** + CI (§W).

### Fase III — Só depois de Human Gate específico, com spec própria

- Persistência local `R2` das métricas (§K) — **só** com o acoplamento ao "Apagar dados" resolvido.
- Instrumentação de navegação (§E) — **só** com buffer por categoria resolvido.
- `expo-constants`/`expo-application` para `app_version` (§R).
- Comparação Development Build × Preview × segundo dispositivo — **e o `Preview` só depois da
  campanha atual**, conforme `docs/DECISIONS.md:2523-2525`.

### Fase IV — Provavelmente **nunca** num app infantil local-first

- **Sentry / qualquer crash SDK de terceiro.** Não porque seja mau software — é bom — mas porque
  converte garantias **estruturais** em garantias de **configuração**, muda `app.json:35-37`, reabre
  Data Safety, entra na auditoria de SDK de Kids Category e adiciona código nativo a um app que hoje
  não precisa de `prebuild`.
- **Prometheus fazendo scrape do aparelho.** Errado por seis razões independentes (§X).
- **Grafana Faro** ou qualquer SDK com *session replay*. Proibido por `D-OBS-01`.
- **Qualquer identificador remoto derivado do `childId`.** Proibido por `docs/DECISIONS.md:2538`.
- **Configuração remota / A-B testing.** Categoria 11, `X` no lançamento; e a cerca de `EAS Update`
  em `docs/DECISIONS.md:1673` impede contorná-la por atualização.

**Reversibilidade — critério de decisão.** Tudo na Fase II é revertível por um `git revert`. Tudo na
Fase IV é irreversível na prática: uma vez declarada coleta de *Crash Data* no *privacy manifest* e
no Data Safety, voltar atrás é evento de conformidade, não *commit*.

---

## 6. Solução mínima de lançamento

**Tese:** para lançar, o Mundo do Beni precisa saber **se quebrou** e **se ficou mais lento** — não
precisa de plataforma de observabilidade. As duas perguntas têm resposta sem uma linha de
dependência nova.

**A. No aparelho (Camada 2, local, `R0`/`R2`, nada sai)**
1. `performanceTrace.js` **efetivamente emissor** em perfil interno — já é o que `P-139` pede e o que
   `eas.json:24` já habilita em `preview`. `production` permanece **desligado** (`eas.json:47-58`).
2. **Discriminador de build** na amostra (`dev` + `profile`), `SAMPLE_SCHEMA` → 3.
3. **`ErrorBoundary` + global handler de JS**, gravando `{error_code, screen_id, fatal}` de allowlist
   fechada — sem stack, sem mensagem livre. Com tela de recuperação infantil.
4. **Códigos de erro de rede** das duas superfícies existentes (`globalManifestService.js:211`,
   `packDownloadService.js:520,611`).
5. `shellLifecycleTrace.js` mantido como está — contador de instâncias vivas, sem persistência.
6. Guarda local síncrona em **tudo**; falha ⇒ desligado.

**B. Fora do aparelho, sem código (Camada 1)**
7. **Google Play Console → Android Vitals**: taxa de travamento, **taxa de ANR**, tempo de
   inicialização, quadros lentos/congelados — por versão, agregado, sem SDK e sem consentimento
   adicional.
8. **App Store Connect → Metrics/Organizer**: hangs, launch time, crashes.
9. Estes dois são **a resposta oficial do lançamento** para crash e ANR — exatamente como
   `05_PLANO…` §4.6 declara (`RL`, `A3`).

**C. No repositório**
10. `scripts/perf-baseline-report.js` com comparação de baseline, rodando em CI.
11. Protocolo físico de captura já normativo (`docs/DECISIONS.md:2186-2192`): `logcat -c` antes,
    início em `Start proc`, PID sempre correlacionado, **sem SmartCapture ativo**.
12. Asserções anti-SDK/anti-replay em `npm run smoke`.

**D. Explicitamente FORA do lançamento**
Envio remoto (zero categorias, `PF5-MEDICAO`) · Camada 3 · qualquer SDK · qualquer backend ·
qualquer identificador · replay · configuração remota.

**Custo total: R$ 0. Dependências novas: 0. Mudança nativa: nenhuma. Prebuild: nenhum.**

---

## 7. O que este ADR **NÃO** decide

1. **Não** decide adotar Sentry, OTel, Prometheus, Grafana ou qualquer SDK — nem agora nem no futuro.
2. **Não** concede Human Gate. Todo item da Fase II precisa de spec/plan/tasks e dos três portões.
3. **Não** resolve a divergência de fase de `P-127`/`P-139` (Fase 3 × 6 × 9), registrada e não
   resolvida em `09_MATRIZ…:1184-1185`.
4. **Não** fecha `P-85`, `P-93`, `P-127`, `P-139` nem `P-149`. Nenhum risco técnico passa a
   `CORRIGIDO` por causa deste documento.
5. **Não** declara conformidade jurídica. Continua proibido dizer *"legalmente aprovado"*,
   *"100% conforme"*, *"nenhum risco"* ou *"anonimização garantida"* (`docs/DECISIONS.md:1631`).
6. **Não** autoriza backend, endpoint de ingestão ou destino de envio.
7. **Não** reabre `D-4E-ANALYTICS-3-CAMADAS`, `D-4E-CONSENTIMENTO`, `D-4E-COMPARTILHAMENTO`,
   `PF5-MEDICAO` nem os limites de `k`.
8. **Não** conclui nada sobre `PERF-OBS-01`. Os `firstLayoutMs 3204` são **evidência inicial de
   Development Build**, não veredito de produto.
9. **Não** altera a campanha `F6-SG-A` nem destrava `SG-B`/`SG-C`/`SG-D`.
10. **Não** decide o valor de `app_version` em runtime (§R) — registra o problema e a saída
    provisória.

## 8. O que este ADR **NÃO** instalou

**Nada.** Verificável:

- `package.json` — **não alterado**. `dependencies` seguem as 32 entradas atuais; `devDependencies`
  segue **apenas `sharp` 0.35.2**.
- `package-lock.json` — **não alterado**.
- `app.json` — **não alterado**. `NSPrivacyCollectedDataTypes` continua `[]`, `NSPrivacyTracking`
  continua `false` (`app.json:35-37`); array `plugins` inalterado (`app.json:60-71`).
- `eas.json` — **não alterado**. Nenhuma variável nova em nenhum dos seis perfis.
- `src/` — **não alterado**. Nenhuma linha de `performanceTrace.js`, `shellLifecycleTrace.js` ou
  `logger.js` foi tocada.
- Nenhum `npm install`, nenhum `npx expo install`, nenhum *config plugin*, nenhum *prebuild*,
  nenhum *build*, nenhum push.
- Não foram instalados: `@sentry/react-native`, `@opentelemetry/*`, `prom-client`,
  `@grafana/faro-*`, Grafana Agent, `expo-device`, `expo-constants`, `expo-application`.

---

## 9. Tabela comparativa final — as sete opções

| # | Opção | Papel real | Onde roda | Custo | Risco de privacidade | Adequação a app infantil offline-first | Veredito |
|---|---|---|---|---|---|---|---|
| 1 | **Instrumentação própria atual** (`performanceTrace.js`, `shellLifecycleTrace.js`, `logger.js`) | Marcas de boot, durações derivadas, contagem de instâncias do shell, log calado fora de DEV | **Cliente**, memória, `R0` | Zero — sem dependência, sem rede, sem I/O | **Mínimo.** Allowlist fechada (`:29`), duas regexes (`:32`,`:37`), sanitização (`:64-79`) | **Alta.** Funciona offline por construção; desligada em `production` | ✅ **MANTER E ESTENDER.** É a base do ADR |
| 2 | **Coletor `P-139`** (amostra schema 2 + `scripts/perf-baseline-report.js`) | Uma linha JSON por processo; mediana/p90 offline; terminal por teto para o boot que não termina | **Cliente** emite, **máquina do dev** agrega | Zero | **Mínimo.** Nenhum campo livre; `bufferDropped` denuncia a própria perda | **Alta.** Já produziu achado real (hidratação ≠ gargalo) | ✅ **MANTER.** Falta discriminador de build (§J) e schema 3 |
| 3 | **OpenTelemetry** | Padrão de API, protocolo e convenções semânticas | SDK no **cliente**, Collector no **backend** | Bundle não medido; **exige Collector = backend** | **Médio-alto** se usado com convenções padrão (`device.model`, `network.carrier` são proibidos) | **Baixa.** Sem exportador é inútil; exportador exige rede e destino | ⚠️ **IDEIAS SIM, PACOTES NÃO.** Compatibilidade com Hermes/New Arch **não estabelecida** |
| 4 | **Sentry para React Native** | Crash JS **e nativo**, ANR/hangs, releases, source maps | **Cliente** (JS + nativo) + **SaaS** | *Free tier* existe; custo real é `prebuild`, `app.json`, Data Safety, auditoria de SDK | **Alto por padrão** (stack, breadcrumbs, modelo exato, IP); reduzível por config, mas vira garantia de configuração | **Baixa.** SDK de terceiro em app infantil sob Kids Category/Families; muda o *privacy manifest* hoje vazio | ⚠️ **NÃO AUTORIZADO.** Único que resolve crash nativo — e o mais caro em conformidade |
| 5 | **Prometheus** | Séries temporais por *scrape* de alvos de vida longa | **Backend, exclusivamente** | Servidor + retenção + operação | **Alto se apontado ao aparelho:** um `instance` por dispositivo = identificador estável | **Nula no cliente.** *Pull*, NAT/CGNAT, IP efêmero, processo efêmero, bateria, cardinalidade | ❌ **NUNCA NO CLIENTE.** Só faria sentido sobre um backend que não existe |
| 6 | **Grafana** | Visualização e alerta sobre um armazenamento | **Backend** | Assinatura ou self-host | Nulo por si; **Grafana Faro é outra coisa** — SDK de cliente com replay | **Nula hoje** — não há o que visualizar | ❌ **SEM PAPEL HOJE.** Faro explicitamente não autorizado |
| 7 | **Combinações plausíveis** | (a) Própria + Camada 1 das lojas · (b) Própria + OTel-como-formato · (c) Sentry + Grafana/Prometheus · (d) OTel → Collector → Prometheus → Grafana | (a) cliente + consoles · (b) cliente · (c) e (d) cliente + backend completo | (a) e (b) **zero** · (c) e (d) alto e recorrente | (a) e (b) **mínimo** · (c) e (d) alto | (a) **a melhor** · (b) boa · (c) e (d) incompatíveis com local-first infantil | ✅ **(a) + (b) É A RECOMENDAÇÃO.** ❌ (c) e (d) rejeitadas |

**A combinação recomendada, em uma frase:** *instrumentação própria (1 + 2), disciplinada pelo
vocabulário do OpenTelemetry sem instalar OpenTelemetry, complementada pelas métricas agregadas que
Google Play e App Store Connect já entregam de graça e sem SDK — e nada mais até um Human Gate
específico.*

---

## 10. Consequências

**Positivas:** custo zero; nenhuma mudança nativa; `F6-SG-A` não é invalidada; `app.json:35-37`
continua declarando coleta vazia; nenhuma reabertura de Data Safety; garantias permanecem
**estruturais**; tudo revertível.

**Negativas, declaradas sem maquiagem:** crash **nativo** continua invisível em tempo real (só via
consoles, com latência de dias); ANR continua não observável de dentro do app; não há alerta
automático; a coleta de amostras depende de um humano com um aparelho; e o coletor continua
desligado em `production` por decisão — o que significa que **o app publicado não mede a si mesmo**.
Isso é uma escolha deliberada de privacidade, não um esquecimento, e precisa estar escrito para que
ninguém a "conserte" sem passar por um gate.

**Riscos residuais:** `P-85`, `P-127`, `P-139` e `P-149` seguem `ABERTO`; `PERF-OBS-01` segue sem
causa declarada; e a divergência de fase de `P-127`/`P-139` segue não resolvida.
