# Spec — Trilha Loading Performance Foundation: contratos e blocos restantes

> **Feature:** `012-loading-performance-foundation` · **Bloco:** LP2.1-GOV-01 (governança/congelamento) · **Data:** 2026-07-16
> **Branch:** `fix/loading-performance-foundation` · **HEAD na criação:** `3485b95`
> **Etapa SDD:** 1 (Specify). **Portão Humano 1 (spec): APROVADO por Eduardo em 2026-07-16.**
> Aprovados na íntegra: esta spec como **fonte oficial versionada** da trilha; a **nomenclatura congelada** (C = recuperação depois do move e antes de `READY`; D = identidade resolvida; E = progresso compartilhado; F = cancelamento e ciclo de vida); e a **ordem C → D → E → F**.
> As decisões marcadas **[ABERTO]** (§15) **continuam abertas** e **não podem ser resolvidas silenciosamente durante a implementação**.
> **Autorizado apenas o PLANEJAMENTO do `LP2.1a-ii-C`** (Etapa SDD 4 → [plan-lp2.1a-ii-c.md](./plan-lp2.1a-ii-c.md)). **Implementação ainda NÃO autorizada** — depende do Portão Humano 2. Blocos D, E e F não iniciados. *(Frase de 2026-07-16, preservada como registro. **Superada** — ver §4.1.)*
> **Precedência:** `docs/PROJECT_SOURCE_OF_TRUTH.md` → `.specify/memory/constitution.md` → `AGENTS.md` → `CLAUDE.md` → **esta spec** → plan → tasks.
> **Risco:** S1 (concorrência + persistência de conteúdo pago; um defeito aqui deixa a criança sem a história que a família comprou).

> ### 🔄 Reconciliação documental — 2026-07-28
>
> Escrita na **ETAPA 2 do bloco “Auditoria integrada de concorrência” (§10.7)**, que está **EM EXECUÇÃO** — **não** concluído.
>
> **[ATUALIZADO 2026-07-28 — fechamento do §10.7]** A matriz integrada terminou: **G1** e **G4** encontraram defeitos reais, corrigidos em commits separados (**`bcfde07`** e **`746c1f3`**); **G2, G3, G5 e G6** foram **aprovados**. **§10.7 CONCLUÍDO**; **§10.8 permanece PENDENTE**. Registro factual em [audit-lp2.1-concorrencia.md §13](./audit-lp2.1-concorrencia.md). **Isto não fecha a trilha.**
>
> As linhas do cabeçalho acima descrevem o estado **na criação** desta spec (2026-07-16, HEAD `3485b95`) e ficam **preservadas**: a história da trilha não é reescrita, só recebe o estado verificado hoje ao lado.
>
> **Estado verificado em 2026-07-28 (detalhe em §4.1):** blocos **C, D, E e F implementados e commitados**; **auditoria integrada da recuperação executada**; **LP2.1a-ii-01F** e **LP2.1a-ii-01G-C** registrados como **subblocos corretivos** nascidos da validação física; **§10.7 CONCLUÍDO**; **§10.8 (iPhone), §10.9 (fechamento) e §14 (análise global) pendentes**.
>
> **Portão aplicado pelo Eduardo (2026-07-28):** *nenhuma decisão que dependa das lacunas de composição **G1–G6** (§4.2) pode ser declarada resolvida aqui.* O §15 obedece a isso linha por linha.

---

## 0. Por que esta spec existe

A trilha LP acumulou **12 commits** em persistência e concorrência **sem nenhuma spec versionada**. Ela vinha sendo conduzida só por prompts de sessão. Isso violou o rigor que a Constituição exige para esta classe de mudança e produziu um dano concreto e verificável: **o nome `LP2.1a-ii-C` foi vinculado a dois blocos diferentes** — recuperação de órfão (registrado em `scripts/smoke.js:9439,9449`, commit `ead7f18`) e identidade resolvida + progresso compartilhado (só nos prompts). A execução do bloco parou por essa ambiguidade.

Esta spec transforma o que está comprovado em contrato versionado e **congela a nomenclatura**, para que nenhum bloco seguinte dependa da memória de uma sessão.

**Distinção que atravessa o documento inteiro:**
- **Fato comprovado** — sustentado por código, teste ou commit, sempre com âncora `arquivo:linha` ou hash.
- **Decisão de governança (GOV-01)** — tomada agora, neste bloco. Não é fato histórico preexistente. Marcada com **[GOV-01]**.
- **Em aberto** — deliberadamente não decidido aqui. Marcado com **[ABERTO]**.

---

## 1. Contexto e objetivo da trilha

O app é local-first, mas as histórias premium vêm de um bucket R2 e são **instaladas** no dispositivo: baixar manifesto, validar, baixar arquivos, validar de novo, publicar num diretório final e registrar num índice local (`AsyncStorage @ptf_packs_v1`).

Os problemas que a trilha ataca:

1. **Boot** que podia ficar preso na splash (resolvido, `67fa172`).
2. **Ausência de baseline** — não havia como saber se uma otimização melhorou algo (resolvido, `72fa5ee`/`33fdc19`/`b94734e`).
3. **Concorrência da instalação**: duas telas pedindo a mesma história abriam duas instalações físicas que se destruíam no mesmo `.tmp` (resolvido, `6466c75`).
4. **Integridade do índice**: mutações concorrentes com *lost update* (resolvido, `6466c75`).
5. **Índice mentindo sobre o disco**: entrada `READY` cujo diretório não existe (resolvido, `824aec1`/`478b0a5`).
6. **Instalação não testável**: não havia como provar comportamento sem rede e sem disco (resolvido, `1c84773`).
7. **Reinstalação e rejeições** (resolvido, `ead7f18`).
8. **Erro velho grudado numa instalação bem-sucedida** (resolvido, `3485b95`).

O que **falta** é o objeto desta spec: recuperação de instalação interrompida na publicação (C), identidade resolvida (D), progresso compartilhado (E) e cancelamento (F).

---

## 2. Autoridades e como esta spec se relaciona com elas

| Autoridade | Relação |
|---|---|
| `docs/PROJECT_SOURCE_OF_TRUTH.md` (Roteiro Mestre) | **Manda.** Esta spec não altera roadmap nem prioridades. Auditado em 2026-07-16: **não menciona a trilha LP** — esta spec não conflita com ele. |
| `.specify/memory/constitution.md` | **Manda.** Define o fluxo SDD e os 3 portões humanos. Esta spec é a Etapa SDD 1 que faltava. |
| `AGENTS.md` | **Manda.** `git add` seletivo, sem push sem aprovação, áreas protegidas, gates. |
| `CLAUDE.md` | **Manda.** Precedência documental e rigor proporcional ao risco. |
| `docs/DECISIONS.md` (árbitro) | Auditado: **não trata da trilha LP**. Só cita "identidade" sobre rota da aba Brincar (`E1-NAV-5ABAS`) — assunto não relacionado. Sem conflito. |
| `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md` | Auditado: **não menciona a trilha LP**. Sem conflito. |
| Código e testes versionados | **Fonte primária de fato** para o §4 (estado atual). Onde código e prosa divergirem, **o código vence** e a spec deve ser corrigida. |

Esta spec **não cria autoridade nova sobre produto**. Ela é a fonte oficial **da trilha técnica LP2**, subordinada a todas as acima.

---

## 3. Glossário

| Termo | Definição |
|---|---|
| **Pack** | Conjunto versionado de arquivos de uma história (cenas, capa, colorir, áudio) descrito por um `manifest.json` próprio e referenciado pelo manifesto global. |
| **Solicitação de instalação** | Uma chamada de `downloadStoryPackScenesFromGlobalManifest(params)`. |
| **Operação física** | Uma execução real do algoritmo: baixar, validar, publicar, registrar. Consome rede e disco. Várias solicitações podem compartilhar **uma** operação física. |
| **Participante** | Um chamador que aguarda o resultado de uma operação física — o criador do voo ou um *joiner*. |
| **Single-flight** | Mecanismo que faz solicitações equivalentes compartilharem uma única operação física (`inFlightInstalls`, `packDownloadService.js:735`). |
| **Identidade da solicitação** (preliminar) | O que se sabe **antes** de buscar o manifesto: `storyId`, `globalManifestUrl`, `appVersion`, `kinds`. Era a chave do voo em 2026-07-16 (`packInstallKey`, hoje `packDownloadService.js:132`). *(Depois de D deixou de ser a chave do voo e permanece **só** como utilitário exportado — §4.1.)* |
| **Identidade resolvida** | O que identifica o pack **de verdade**, conhecido só **depois** de buscar e validar o manifesto — inclui `version` e `manifestSha256`. Contrato em §7. *(Em 2026-07-16 **não existia no código**; **implementada no bloco D** — `resolveInstallIdentity` `packDownloadService.js:239`, `canonicalResolvedKey` `:276`. Ver §4.1.)* |
| **Identidade física** | O que determina o recurso em disco: `storyId@version` (**sem kinds**), via `getPackLocalDir`/`getPackTempDir` (`packStorageService.js:47-61`). |
| **Índice** | Mapa `storyId → CacheEntry` em `AsyncStorage @ptf_packs_v1` (`packStorageService.js:125`). Chaveado **só por storyId** — uma entrada por história, sem versão. |
| **Diretório temporário** | `documentDirectory/packs/.tmp/<storyId>@<version>/`. Sempre recomeça vazio; nunca é conteúdo servido ao app. |
| **Diretório final** | `documentDirectory/packs/<storyId>@<version>/`. O que o app lê. |
| **Reconciliação** | Comparar índice × disco e rebaixar **em memória** um `READY` sem evidência física (`packReconcileService.js`, `PacksContext.js:113-151`). Nunca escreve no índice. |
| **Órfão** | Instalação cujo **disco está completo** mas o índice **não** diz `READY` — porque o app encerrou entre o `moveAsync` e a persistência. Provado em `smoke.js:9449`. |
| **Progresso compartilhado** | Todos os participantes ativos de uma operação receberem progresso coerente (§8). *(Em 2026-07-16 **não existia**; **implementado no bloco E** — `registerProgressSubscriber` `packDownloadService.js:816`, `replayLatestProgress` `:768`. Ver §4.1.)* |
| **Cancelamento** | Um participante deixar de precisar do resultado. `isCancelled` torna o chamador **dono exclusivo** do resultado (`packDownloadService.js:895`) e **nenhum chamador de produto o usa** — auditado de novo em 2026-07-28, continua verdade. *(O bloco F **não** mexeu em `isCancelled`: a saída de participante passou a ser expressa por `participantSignal` — `inspectParticipantSignal` `:793`, `removeProgressSubscriber` `:807`. Ver §4.1 e §9.)* |

---

## 4. Estado atual comprovado

Cada linha traz o **commit** e a **evidência principal**. Nada aqui é hipótese.

| # | Item | Commit | Evidência |
|---|---|---|---|
| 1 | **Boot fail-safe** — splash nunca fica presa; `replace` que lança faz rollback e repescagem limitada | `67fa172` | `src/services/bootRoute.js`; `SplashScreen.js:7,52` (`MAX_NAV_ATTEMPTS`, `NAV_RETRY_MS`) |
| 2 | **Instrumentação de boot** — `t0` no ponto mais cedo possível (import #2 do `App.js`, antes do grafo de telas) | `72fa5ee` | `src/services/bootMark.js`; `App.js:2` |
| 3 | **Baseline reprodutível** + agregador (inclui logs UTF-16 do PowerShell) | `33fdc19`, `b94734e` | `scripts/perf-baseline-report.js`; `src/services/performanceTrace.js` |
| 4 | **Single-flight por chave canônica** — solicitações equivalentes compartilham a operação; a chave sai do mapa em `finally` | `6466c75` | `packDownloadService.js:466,528-532`; `smoke.js` "LP2 PK-01 (comportamental): 10 chamadas na mesma chave = 1 download físico" |
| 5 | **Exclusão física por história** — `.tmp`/`localDir` derivam de `storyId@version` sem kinds, então a fila é por `storyId` | `6466c75` | `packDownloadService.js:483-492` (`runExclusiveByStory`); `smoke.js` "mesma história com kinds diferentes NUNCA executa em paralelo" |
| 6 | **Fila serializada do índice (PK-02)** — ler→mesclar→gravar inteiro dentro da fila; task que rejeita não envenena | `6466c75` | `packStorageService.js:99,106` (`indexWriteChain`, `runSerialized`); `smoke.js` "task que REJEITA não envenena a fila" |
| 7 | **Identidade do voo endurecida** (honestidade do teste: versão **não** entra na chave) | `b2ba305` | `smoke.js:8371-8374` (comentário "HONESTIDADE DO TESTE") |
| 8 | **Reconciliação índice×disco** (núcleo puro, sem I/O; rebaixa só em memória) | `6c098f6`, `824aec1` | `packReconcileService.js`; `PacksContext.js:113-151` |
| 9 | **`READY` sem `localDir` é reconciliado** — `needsDiskCheck` passou a exigir só `status===READY` | `824aec1` | `packReconcileService.js:31-32` |
| 10 | **Preservação de `READY` anterior com evidência de disco** — `failWith` só preserva se o probe confirmar; `localDir` é **recomposto** por `(storyId, version)` porque o persistido não é confiável no iOS | `478b0a5` | `packDownloadService.js:260-287` |
| 11 | **Seam de injeção + harness** — uma só implementação (`createPackDownloadService`), produção e teste executam o **mesmo** algoritmo; mapas por instância | `1c84773` | `packDownloadService.js:158+`; `scripts/testing/packInstallHarness.js` |
| 12 | **Validar antes de destruir** — o diretório final só é removido depois de baixar tudo e validar âncora, schema e hash de cada arquivo; delete colado no move | `ead7f18` | `smoke.js` "LP2.1a-ii-B §6.3" e "§6.6-6.7" |
| 13 | **Reinstalação substitui, não mistura** — arquivo que saiu do pack some do disco | `ead7f18` | `smoke.js` "§6.9-6.11" |
| 14 | **`DOWNLOADING` antes da janela destrutiva** (só quando `preExisting`) | `ead7f18` | `packDownloadService.js:420-427`; `smoke.js` "§6.4-6.5" |
| 15 | **Rejeições isoladas por dimensão**: âncora `manifestSha256`, hash de arquivo **posterior**, tamanho, arquivo ausente, queda de rede | `ead7f18` | `smoke.js` "§8.1-8.2", "§9.1-9.3", "§10.1-10.3", "§11.1-11.3", "§12.1-12.6" |
| 16 | **Preservação do pack anterior nas 5 falhas** + `.tmp` limpo + chave liberada | `ead7f18` | `smoke.js` "§13", "§12.4+12.8" |
| 17 | **Retry** — parte do estado que a falha deixou, chave liberada, nova operação física | `ead7f18` | `smoke.js` "§8.9-8.10/§9.8/§10.6/§11.6/§12.7" |
| 18 | **Semântica de `errorMessage`** — omitido/`undefined` herda, `null` limpa, string substitui | `3485b95` | `packStorageService.js:147`; `smoke.js` "LP2.1a-ii-BR §6.1" (fluxo real) e "§8.1b" (controle negativo) |
| 19 | **Mutation checks codificados** no suite (não manuais), com guarda antitautológica: mutação que não aplica **estoura**, nunca conta como morta | `1c84773`, `ead7f18`, `3485b95` | `packInstallHarness.js` (`loadPackDownloader`/`loadModule` com `mutate`); `smoke.js` "§10", "§15", "§8" |
| 20 | **Revisões adversariais** com céticos independentes | `1c84773` (14 lentes, 5 confirmados), `ead7f18` (18 lentes, 7 confirmados → 3 distintos), `3485b95` (12 lentes, 0 achados) | Relatórios de sessão; correções nos próprios commits |

**Fronteira registrada:** `smoke.js:9483` (*"LP2.1a-ii-B §7.4 (FRONTEIRA, etapa C)"* — âncora original `:9449`, deslocada pelo crescimento do suite) prova que, depois do `moveAsync` e antes do `READY`, o disco está completo e o índice diz `DOWNLOADING`. É o **órfão** — escopo do LP2.1a-ii-C (§6). **Resolvido pelo bloco C** (`82362e6` + `0e049f9`); o recovery real promove esse órfão a `READY` — `smoke.js:10712` e `:10269` (§4.1).

---

## 4.1. Estado da trilha reconciliado (2026-07-28)

> Escrito na **ETAPA 2 do §10.7**, a partir de leitura de código, de `scripts/smoke.js` e de `git log` — **não** de memória de sessão. Cada linha traz commit e prova.

### Itens da ordem congelada (§10)

| # (§10) | Item | Estado | Commits | Prova principal | Validação física |
|---|---|---|---|---|---|
| 1 | **LP2.1-GOV-01** (esta spec) | **CONCLUÍDO** | `00c2d44` (2026-07-16) | o próprio documento | n/a |
| 2 | **LP2.1a-ii-C** — recuperação de órfão | **IMPLEMENTADO** | `82362e6` (2026-07-16), `0e049f9` (2026-07-17) | bloco `LP2.1a-ii-C` em `scripts/smoke.js:10370` (38 checks); serviços `packRecoveryService.js`, `packPublishMarker.js` | **pendente** (§10.8) |
| 3 | **Auditoria integrada da recuperação** | **EXECUTADA** | `0d3ee57`, `0b009d1`, `16cba03`, `3b9b2d8`, `4907f3a`, `9a5251f`, `d26330b` (2026-07-16/17); laboratório de device `4ebe639` (2026-07-18) | blocos `C-QA3R` (`smoke.js:10019`, 9 checks) e `C-DEVICE-TOOLS1` (`:10227`, 11 checks) | **pendente** (§10.8) |
| 4 | **LP2.1a-ii-D** — identidade resolvida | **IMPLEMENTADO** | `090a928` (2026-07-20) | blocos `D1` (`smoke.js:11711`), `D2` (`:11916`), `D3` (`:12237`) — 28 checks; `resolveInstallIdentity` `:239`, `canonicalResolvedKey` `:276` | **pendente** (§10.8) |
| 5 | **LP2.1a-ii-E** — progresso compartilhado | **IMPLEMENTADO** | `d5a46c1` (2026-07-20) | blocos `E1 RED` (`smoke.js:12438`) e `E3 HARDENING` (`:12596`) — 23 checks; `registerProgressSubscriber` `:816`, `replayLatestProgress` `:768` | **pendente** (§10.8) |
| 6 | **LP2.1a-ii-F** — cancelamento e ciclo de vida | **IMPLEMENTADO** | `6cf799c` (2026-07-20) | bloco `F1 RED` (`smoke.js:13045`, 18 checks); `inspectParticipantSignal` `:793`, `removeProgressSubscriber` `:807` | **pendente** (§10.8) |
| 7 | **Auditoria integrada de concorrência** | **🟡 EM EXECUÇÃO** | — | — | — |
| 8 | **Validação real no iPhone** | **PENDENTE** | — | — | — |
| 9 | **Fechamento da trilha LP2** | **PENDENTE** | — | — | — |
| 10 | **Análise global de gargalos** (§14) | **NÃO INICIADA** | — | — | — |

> **O item 7 está EM EXECUÇÃO e não pode ser lido como concluído.** Enquanto as lacunas do §4.2 não estiverem provadas, a composição entre os contratos **não** está demonstrada — e o §13.3 continua **não atendido**.

### Subblocos corretivos não previstos no §10

Nasceram **depois** de F, de validação física no iPhone conduzida pelo Eduardo. Não são blocos novos do roadmap: são **correções** dentro da mesma trilha.

| Subbloco | O que corrigiu | Commit | Prova |
|---|---|---|---|
| **LP2.1a-ii-01F** | O `READY` chegava ao app **só** pela tela que iniciou a instalação. Passou a existir um **registro global observável** de instalação (`src/services/packInstallRegistry.js`), com `operationId` monotônico como guarda de obsolescência, replay imediato para quem se inscreve e ouvinte global de disponibilidade (`subscribePackReady` → `PacksContext.js:113-115`). | `fddd1f0` (2026-07-28) | bloco `01F` em `scripts/smoke.js:13485` — 137 checks |
| **LP2.1a-ii-01G-C** | A capa da história **piscava** durante o download. Causa provada: `Moldura`, `Selo` e `InfoSection` eram declarados **dentro do render** de `StoryBookHero` → `element.type` novo a cada render → React **remontava** a subárvore e a `<Image>` nativa reiniciava o carregamento. Correção: mover para o **escopo do módulo**. | `fddd1f0` (2026-07-28) | bloco `01G-C` em `scripts/smoke.js:17332` — 23 checks |

> **Nomenclatura (registro para não repetir a colisão do §0):** os nomes `01F` e `01G-C` existem **apenas** em código, testes e prompts de sessão — nenhum outro `.md` do repositório os cita. **`LP2.1a-ii-01H` não existe** em lugar nenhum e **não será criado** — decisão do Eduardo em 2026-07-28.

### Gates no estado atual

- `node scripts/smoke.js` em `fddd1f0`: **3038/3038**, 0 falhas.
- `npx expo-doctor`: **17/18** — único desvio é o drift ambiental já autorizado no §12 (`expo@54.0.35` × catálogo `~54.0.36`).
- Backup remoto do fechamento local feito em 2026-07-28 (`git push -u origin fix/loading-performance-foundation`, SHA idêntico, **sem PR e sem merge**).

### O que já teve dispositivo físico — e o que **não** teve

Houve validação física **pontual**, fora do bloco §10.8: a captura instrumentada no iPhone que fundamentou o `01G-C` (839 remontagens da capa em 205 s antes; 2 montagens e 221 ms depois) e a aprovação do fechamento local pelo Eduardo.

> **Isso não é o §10.8.** A **validação real no iPhone da trilha LP2** — C, D, E e F exercitados juntos em dispositivo — continua **PENDENTE**. O assistente não tem dispositivo e **não declara validação visual** (§12).

### Limite honesto das âncoras deste documento

As âncoras `arquivo:linha` das seções **§3, §5, §7, §8 e §9** foram escritas contra o HEAD `3485b95` (2026-07-16). Depois de C, D, E e F o `packDownloadService.js` passou de ~560 para **1000 linhas** e o `scripts/smoke.js` cresceu para **30302 linhas** — muitas dessas âncoras **se deslocaram**. Esta ETAPA 2 corrigiu **apenas** as âncoras das linhas que ela própria tocou; **não** foi feita varredura completa. Vale o §2: **onde código e prosa divergirem, o código vence.** As âncoras vivas dos contratos estão nas tabelas acima e no §4.2.

---

## 4.2. Lacunas de composição registradas (G1–G6)

> Levantadas na **ETAPA 1 do §10.7** (mapa read-only dos 28 contratos implementados). São **lacunas de prova**, não defeitos declarados: cada contrato foi provado **isolado**; nenhuma prova existente os exercita **combinados**. É exatamente o que o §13.3 exige e ainda não tem.

| ID | Lacuna | Contratos que se cruzam | Situação |
|---|---|---|---|
| **G1** | **Identidade resolvida divergente × registro global por `storyId`.** O voo é chaveado pela identidade resolvida de 7 campos (`canonicalResolvedKey` `:276`), mas `beginInstall`/`isCurrentOperation` eram chaveados **só por `storyId`**. Duas identidades resolvidas diferentes da mesma história criam **dois voos legítimos** — e o segundo `beginInstall` incrementava o contador daquela história, tornando supersessão indistinguível de Reset. | D + 01F | **✅ DEFEITO CONFIRMADO em `fddd1f0` E CORRIGIDO em `bcfde07` — SUPERADO** |
| **G2** | **Recovery de órfão com consumidor já inscrito.** Recovery (C), fan-out de progresso (E) e registro global (01F) nunca foram exercitados na mesma execução. | C + E + 01F | **✅ APROVADO** (auditoria §7.1) |
| **G3** | **Reset concorrente com voo compartilhado.** `RESET-1`/`RESET-2` usam **um** participante; o comportamento com dois nunca foi provado. | 01F + E + F | **✅ APROVADO** (auditoria §7.2) |
| **G4** | **Dois `READY` concorrentes → dois `loadPacks()`.** Não há prova de convergência do índice observado. | 01F + `PacksContext` | **✅ DEFEITO CONFIRMADO em `bcfde07` E CORRIGIDO em `746c1f3` — SUPERADO** |
| **G5** | **Participante sai durante a publicação enquanto outro permanece.** | F + E + 01F | **✅ APROVADO** (auditoria §10) |
| **G6** | **Chamador cancelável (`isCancelled`) dividindo a fila física com um voo compartilhado.** | F + single-flight | **✅ APROVADO** (auditoria §11) |

> **Portão do Eduardo (2026-07-28):** **G1 é o portão de continuidade da auditoria.** Se G1 confirmar que a primeira operação perde a autorização de publicação e devolve `reason:'reset'` (ou remove `localDir`) **sem reset real do usuário**, a auditoria **para**, nenhum arquivo de produção é alterado, o §10.7 **não** é declarado concluído e um bloco corretivo separado e mínimo é proposto. Só se G1 passar é que G2–G6 seguem.
>
> **Desfecho do portão (2026-07-28):** G1 **confirmou o defeito** em `fddd1f0`; a auditoria **parou** como mandado e o corretivo mínimo foi autorizado como bloco **separado** (não é o `01H`) e criado em **`bcfde07`** — *fix(loading): separar reset de sucessão concorrente*. Provas: cenários **G1-A a G1-F** e **8 controles negativos**, smoke **3078/3078**. O portão foi **reaberto** pelo Eduardo e **G2–G6 seguem**. Registro factual completo em [audit-lp2.1-concorrencia.md §6](./audit-lp2.1-concorrencia.md). **Nenhuma validação física nova** foi feita (§10.8 pendente); a **limpeza de versões superadas continua fora do escopo**. **§10.7 permanece EM EXECUÇÃO.**
>
> **Fechamento da matriz (2026-07-28):** **G2, G3, G5 e G6 aprovados**; **G4 confirmou um segundo defeito real** (dois `READY` concorrentes com conclusão invertida das leituras faziam uma história **sumir** do `PacksContext`), corrigido em **`746c1f3`** — *fix(loading): guardar leitura obsoleta do índice*. Os dois corretivos (**`bcfde07`** e **`746c1f3`**) são commits **separados e mínimos**, ambos publicados no remoto. Todos os cenários vieram acompanhados de **controles negativos** e verificação de **antitautologia**; smoke final **3231/3231, 0 falhas**. Revisão adversarial das 10 afirmações executada, **nenhuma refutada** (auditoria §12). **§10.7 CONCLUÍDO — §10.8 PENDENTE.** Nenhum interleaving foi observado em runtime real: todos foram **impostos pelo harness**, e as validações físicas dos dois corretivos continuam **em aberto**.

---

## 5. Contrato de estados

### 5.1 O enum real (fato)

`PACK_STATUS` (`packStorageService.js:22-31`) declara **oito** valores: `included`, `not_downloaded`, `downloading`, `verifying`, `ready`, `failed`, `needs_update`, `requires_app_update`.

**Mas o downloader só persiste três** (auditado em 2026-07-16, `packDownloadService.js`):

| Estado | Persistido no índice? | Onde |
|---|---|---|
| `DOWNLOADING` | **Sim** — só quando `preExisting` (o diretório final já existe) | `:426` |
| `READY` | **Sim** | `:434` (fluxo) e `:70` (`markPackReady`) |
| `FAILED` | **Sim** — só quando não há `READY` preservável | `:282` |
| `VERIFYING` | **Não** — apenas reportado à UI via `onProgress` | `:391` (`report`, que é `onProgress`, `:229-231`) |
| `NOT_DOWNLOADED` | **Não** — é o *default* de entrada ausente | `getPackStatus` (`packStorageService.js:180-183`) |
| `INCLUDED` | **Não** pelo downloader — derivado da camada de conteúdo | `PacksContext.js:164`; `contentResolver.js:49` |
| `NEEDS_UPDATE`, `REQUIRES_APP_UPDATE` | **Não** — declarados no enum, **sem nenhum uso** no código | grep sem resultado (2026-07-16) |

> **[GOV-01]** `requiresAppUpdate` **retorna sem tocar o índice** (`packDownloadService.js:246-248`) — não existe transição para `requires_app_update`. Registrado como **dívida de enum**: valores declarados sem uso. Não é defeito hoje; nenhum bloco desta trilha os introduz.

### 5.2 Transições válidas (fato)

```
(ausente = NOT_DOWNLOADED)
      │  instalação nova (preExisting=false): NENHUMA marca intermediária
      └──────────────────────────────► READY        (:434, após o move)
                                    └► FAILED       (:282, se não há READY preservável)

READY (mesma versão, re-download)
      └► DOWNLOADING (:426, ANTES do delete destrutivo)
              └► READY   (:434, após o move)
              └► FAILED  (:282) ── só se o READY anterior NÃO for preservável

FAILED
      └► DOWNLOADING (:426, se o diretório final existir) ou direto ► READY
```

**Invariantes já provados:**
1. `READY` **nunca** antes do `moveAsync` (`smoke.js` "§6.6-6.7", "§8.4b").
2. `READY` **nunca** parcial — só com todos os kinds pedidos validados.
3. Uma falha **antes** da janela destrutiva **preserva** o `READY` anterior válido; nenhum `FAILED` por cima (`smoke.js` "§13").
4. Instalação nova grava o índice **uma única vez** (`smoke.js` "§8.4c").

### 5.3 Decisão preservada: `DOWNLOADING` pode carregar o erro anterior

No caminho `FAILED → retry`, a marca `DOWNLOADING` (`:426`) passa só `{version, status}`. Pelo contrato de `errorMessage` (`3485b95`), **campo omitido herda** — então a entrada fica `status: downloading` carregando a string de erro da tentativa anterior, até o `READY` limpá-la (`:439`).

> **[GOV-01] Decisão deliberada, não defeito.** O `?? prev` é *load-bearing*: é ele que preserva `localDir`/`manifestPath` na escrita parcial, e é disso que a reconciliação e o retry dependem (`smoke.js` "LP2.1a-ii-B §7.2"). Tratar o campo omitido como limpeza quebraria a herança dos demais campos.
>
> **Risco semântico futuro (registrado):** uma entrada `DOWNLOADING` com `errorMessage` de uma falha antiga é ambígua para quem **ler** o campo. Hoje **ninguém lê `errorMessage`** — auditado em 2026-07-16, o campo só é escrito (6 sites, `packDownloadService.js:75,282,439`; `packSandboxDevService.js:98,152,220`). No dia em que alguém exibir esse campo, esta decisão precisa ser reavaliada em bloco próprio. **Nenhum bloco desta trilha pode reabrir isso** sem spec nova.

---

## 6. LP2.1a-ii-C — Recuperação de instalação interrompida na publicação

### 6.1 Escopo exclusivo

Recuperar uma instalação interrompida **depois** de o conteúdo validado ter sido movido para o diretório final e **antes** de o índice persistir `READY`.

> **[GOV-01] Congelamento de nome.** `LP2.1a-ii-C` designa **exclusivamente** este bloco. O nome já estava vinculado a ele no repositório desde `ead7f18` (`smoke.js:9439,9449`). **Identidade resolvida e progresso compartilhado NÃO são C** — são D e E (§7, §8). Essa colisão foi a causa da parada do bloco anterior e não pode voltar.

### 6.2 O problema (fato, provado)

`smoke.js:9483` (âncora original `:9449`) observa, no instante exato (hook antes da escrita `READY`): **disco completo** (todos os arquivos novos publicados em `localDir`) e **índice dizendo `downloading`**. Se o app encerrar ali, o pack está **inteiro e correto no disco**, mas o app o trata como não instalado e cai no bundle.

Agrava: `needsDiskCheck` só sonda `READY` (`packReconcileService.js:31-32`), então a reconciliação **nunca olha** uma entrada `DOWNLOADING` — o órfão não é detectado nem corrigido hoje.

### 6.3 Auditoria obrigatória antes de implementar

O bloco C **deve** começar por uma auditoria read-only que determine, com âncoras:

1. Todos os estados **concretos** possíveis no índice após um encerramento nessa janela — inclusive quando `preExisting=false` (instalação nova: **não há marca alguma**, a entrada **não existe** → `NOT_DOWNLOADED`; o órfão é indetectável pelo índice).
2. Quais **metadados** estão disponíveis para decidir (a entrada `DOWNLOADING` tem `version`? `totalBytes`? o `localDir` herdado aponta para onde?).
3. Que **validação** é necessária e suficiente para promover — e qual é o custo dela no boot.
4. Onde o recovery roda (boot? foco? sob demanda?) e quem o dispara.

> **[RESOLVIDO por decisão humana em 2026-07-16]** A auditoria foi executada (ver [plan-lp2.1a-ii-c.md](./plan-lp2.1a-ii-c.md) §3) e as decisões que dela dependiam foram tomadas pelo Eduardo:
>
> - **AB-2 (escopo):** o bloco C cobre **C1 e C2**. `readDirectoryAsync` está **aprovado**, restrito a **descoberta direcionada**: listar apenas os nomes da raiz de packs, filtrar de imediato pelo `storyId` solicitado e validar **somente** candidatos daquela história. **Proibido** varrer/validar todos os packs ou virar garbage collection.
> - **AB-3 (disparo):** o recovery roda **sob demanda**, quando uma história pede o pack e **antes** de o sistema concluir que precisa baixar. **Sem varredura nem validação geral no boot.**
> - **Direção arquitetural aprovada:** **Alternativa C — marcador local de publicação validada**, escrito no `.tmp` **depois** de todas as validações e **antes** do move, para ser transportado junto. Os detalhes (nome, schema, escrita segura, ausência/divergência) são do **plano**, não desta spec.
>
> Segue valendo: **não** determinar que a presença do diretório basta para promover `READY` (princípio 1).

### 6.4 Princípios congelados

> **[GOV-01]** Estes princípios são vinculantes para o bloco C:
> 1. **Nunca** promover `READY` só porque o diretório existe.
> 2. Validar **conteúdo e identidade** antes da promoção.
> 3. **Não destruir** um pack válido por inferência incompleta.
> 4. **Não manter indefinidamente** um `DOWNLOADING` sem operação ativa.
> 5. Recovery **idempotente** — rodar duas vezes = rodar uma.
> 6. Recovery **não pode depender de rede** quando o disco já tem evidência suficiente.
> 7. Conteúdo **inválido ou incompleto nunca** é promovido.
> 8. O comportamento precisa **sobreviver a uma nova inicialização**.
> 9. O bloco **não inclui** identidade resolvida (D), progresso compartilhado (E) nem cancelamento (F).

### 6.5 Cenários de crash a cobrir

| # | Momento do encerramento | Estado esperado no disco | Estado no índice | Coberto hoje? |
|---|---|---|---|---|
| C1 | Depois do `move`, antes do `READY`, **com** pack anterior (`preExisting=true`) | final completo | `downloading` | Registrado (`smoke.js:9449`); **recovery não existe** |
| C2 | Depois do `move`, antes do `READY`, **sem** pack anterior (instalação nova) | final completo | **entrada ausente** | Auditado e **executado** (plan §3.2); **no escopo de C** (AB-2 resolvida) |
| C3 | Depois do `delete`, antes do `move` | final **removido**, `.tmp` completo | `downloading` | Registrado (`smoke.js:9436`); **recovery não existe** |
| C4 | Recovery interrompido pela metade | — | — | Exige idempotência (princípio 5) |

> **[RECONCILIADO 2026-07-28]** A coluna *"Coberto hoje?"* descreve 2026-07-16. Depois de `82362e6` + `0e049f9` o **recovery existe** (`src/services/packRecoveryService.js` + `src/services/packPublishMarker.js`) e cobre **C1 e C2** conforme AB-2, com idempotência (C4) provada. As âncoras `smoke.js:9449` (C1/fronteira) e `:9436` (C3) se deslocaram para `:9483` (*"§7.4 (FRONTEIRA, etapa C)"*) e `:9468` (*"§7.3 (depois do delete, antes do move)"*). **Nada disso foi validado em iPhone** — §10.8 continua pendente.

### 6.6 Critérios de aceite

Verificáveis, pelo harness real (`packInstallHarness.js`) e pelo downloader real:

1. Um órfão C1 é promovido a `READY` **somente** após validação de conteúdo e identidade — provado por um cenário em que o conteúdo do disco está **corrompido** e a promoção **não** ocorre.
2. Um órfão C3 (`.tmp` cheio, final ausente) **não** é promovido; o estado é detectável e o retry funciona.
3. Recovery rodado duas vezes produz o mesmo resultado (idempotência), provado por assinatura observável.
4. Recovery **não** faz nenhuma chamada de rede quando o disco basta — provado contando eventos do harness (`fetch-global-manifest`, `download:`).
5. Nenhum pack válido é destruído por recovery — provado com o cenário de pack anterior íntegro.
6. Mutation checks: remover a validação antes da promoção **derruba** a prova (1); tornar o recovery não-idempotente **derruba** a prova (3).

### 6.7 Riscos

1. **Promoção indevida** de conteúdo incompleto → criança vê história quebrada. Mitigado pelos princípios 1, 2, 7.
2. **Custo no boot** — validar hash de todos os arquivos no boot pode custar caro. A auditoria (§6.3.3) deve medir; pode ser necessário validar sob demanda.
3. **C2 indetectável pelo índice** — sem entrada, não há o que reconciliar; a evidência está só no disco. Pode exigir varredura de diretório, que tem custo. **[ABERTO]**
4. **Interação com D** — se a identidade resolvida mudar, o critério de "identidade válida" do recovery muda junto. Por isso C vem **antes** de D (§10): C congela o comportamento com a identidade atual, e D depois o revisita explicitamente.

---

## 7. LP2.1a-ii-D — Identidade resolvida

### 7.1 Escopo exclusivo

Definir e implementar a **identidade resolvida** da instalação.

### 7.2 A distinção congelada

> **[GOV-01]** Duas identidades, e a diferença entre elas é o bloco inteiro:
>
> **Identidade preliminar da solicitação** — o que se sabe **antes** de buscar o manifesto:
> `storyId`, `globalManifestUrl` normalizada, `appVersion`, `kinds` normalizados.
>
> **Identidade resolvida** — o que identifica o pack de verdade:
> `storyId`, `version`, `baseUrl` normalizada, `manifestPath` normalizado, **`manifestSha256` normalizado**, `kinds` normalizados, `appVersion`.
>
> **`manifestSha256` faz parte da identidade resolvida.** Ele já existe no manifesto global e já é usado como **âncora** antes de confiar no manifesto do pack (`packDownloadService.js:307-316`) — mas **não** entra em nenhuma chave hoje.
>
> Precisão sobre a validação (auditado 2026-07-16): `globalManifestService.js:145` valida o formato 64-hex **apenas se o campo estiver presente** (`p.manifestSha256 != null && ...`) — ou seja, o manifesto global aceita um pack **sem** o campo. Quem o torna **obrigatório** é o downloader: `packDownloadService.js:310-313` rejeita a instalação quando o campo é ausente ou não é 64-hex. D deve levar isso em conta: um pack sem `manifestSha256` **não instala hoje**, então a identidade resolvida sempre o terá — mas essa garantia vem do downloader, não do schema do manifesto global.

### 7.3 Estado atual (fato)

> **[RECONCILIADO 2026-07-28]** Esta subseção descreve o estado **antes** do bloco D. Desde `090a928`, a chave do voo é a **identidade resolvida** (`canonicalResolvedKey`, `packDownloadService.js:276`), calculada por `resolveInstallIdentity` (`:239`) **antes** de admitir ou recusar o compartilhamento — *resolve-first*. `packInstallKey` (`:132`) **continua exportado**, mas já **não** é a chave do voo. A coordenação em duas fases do §7.6 foi implementada nessa forma; ver §15 nº 4 para por que ela ainda **não** é declarada resolvida.

A chave em 2026-07-16 era **só a preliminar** (`packInstallKey`, então `packDownloadService.js:128-135`):

```js
[storyId, globalManifestUrl, appVersion, kinds.sort().join(',')].join('|')
```

O comentário do próprio código explica o raciocínio: *"A VERSÃO não entra: ela só é conhecida DEPOIS de buscar o manifesto — mas é função de (manifesto, storyId, appVersion), então duas chamadas com a mesma chave resolvem necessariamente a mesma versão."*

E o suite registra o limite honestamente (`smoke.js:8371-8374`): *"isto NÃO prova separação por VERSÃO DE PACK… um joiner pode receber a versão resolvida no início do voo."*

### 7.4 Mapa das identidades em uso (fato)

| Onde | Identidade usada | Âncora |
|---|---|---|
| **Single-flight** (compartilha resultado) | preliminar: `storyId\|globalManifestUrl\|appVersion\|kinds` | `packDownloadService.js:128-135,528` |
| **Fila por história** (exclusão física) | **só `storyId`** | `packDownloadService.js:485-492` |
| **Diretório** (`.tmp` e final) | `storyId@version` — **sem kinds** | `packStorageService.js:47-61` |
| **Índice** | **só `storyId`** — uma entrada por história, **sem versão na chave** | `packStorageService.js:125` |

### 7.5 Colisões possíveis e consequências

Registradas como **[ABERTO]** para o bloco D decidir com provas:

1. **Mesma chave preliminar, versões resolvidas diferentes em momentos diferentes.** O manifesto global pode mudar no R2 entre duas instalações. Duas chamadas com a chave idêntica em momentos diferentes resolvem versões diferentes — correto, porque não compartilham voo. Mas um **joiner** que entra num voo em andamento recebe a versão que o voo resolveu, **não** a que ele resolveria agora. Isso é aceitável? **[ABERTO]**
2. **Índice sem versão na chave.** Instalar a v2 de uma história **sobrescreve** a entrada da v1, mas **não apaga** o diretório da v1 (`packs/story@1.0.0/` fica órfão no disco). Isso é vazamento de disco — pertence a política de cache (**fora desta trilha**), mas D deve **registrar** a interação.
3. **Fila por `storyId` apenas.** Duas versões diferentes da mesma história têm diretórios diferentes e **não** disputariam recurso, mas ainda assim são serializadas. Conservador e correto; D deve confirmar que continua assim.
4. **`kinds` fora da identidade física.** Já resolvido pela fila por história (`6466c75`): sem ela, duas chamadas com kinds diferentes se destruiriam no mesmo `.tmp`.

### 7.6 Coordenação em duas fases

> **[GOV-01] Registrado, não imposto.** `version` e `manifestSha256` só são conhecidos **depois** de obter e validar o manifesto. Logo, uma identidade resolvida **não pode** ser a chave de entrada do single-flight sem alguma forma de coordenação em duas fases: uma chave preliminar para admitir a solicitação, e uma chave resolvida para consolidar (ou rejeitar) o compartilhamento depois que o manifesto chega.
>
> **A implementação não é decidida aqui.** [ABERTO]: se as fases são duas chaves, uma promoção de chave, ou uma revalidação do joiner.

### 7.7 Critérios de aceite

1. A identidade resolvida existe como valor computável e testável, com todos os 7 campos.
2. Duas solicitações que resolvem identidades **diferentes** não compartilham resultado — provado comportamentalmente (não só por comparação de string).
3. Duas solicitações que resolvem a **mesma** identidade compartilham uma operação física.
4. A resolução é **estável** durante a operação (o voo não muda de identidade no meio).
5. Nenhuma regressão nas provas de `6466c75`, `1c84773`, `ead7f18`.
6. Mutation check: chave incompleta (sem `version` ou sem `manifestSha256`) **derruba** a prova (2).

---

## 8. LP2.1a-ii-E — Progresso compartilhado

### 8.1 Escopo exclusivo

Fazer todos os participantes ativos de uma operação receberem progresso coerente.

### 8.2 Estado atual (fato, confirmado no código)

> **[RECONCILIADO 2026-07-28]** A limitação abaixo **foi resolvida** pelo bloco E (`d5a46c1`). Hoje `inFlightInstalls` guarda um **FlightRecord** com inscritos, não uma Promise nua: `registerProgressSubscriber` (`packDownloadService.js:816`) registra cada participante com identidade própria, `emitProgress` (`:762`) faz o fan-out e `replayLatestProgress` (`:768`) entrega ao recém-chegado o último snapshot. O trecho a seguir fica como registro do que existia em 2026-07-16.

**Confirmado em 2026-07-16.** A limitação estava documentada no próprio código (então `packDownloadService.js:514-518`):

> *"LIMITAÇÃO CONHECIDA (aceita neste bloco): quem JOINA um voo em andamento não recebe `onProgress` — só o `onProgress` de quem criou o voo é repassado. O resultado final é o mesmo para todos; apenas a barra de progresso de um segundo observador ficaria parada em 0% até a conclusão. Resolver exige multiplexar os inscritos ({ promise, subscribers }) — mudança de estrutura que não é necessária para a integridade e fica para quando houver caso real."*

Mecânica: `inFlightInstalls` guarda uma **Promise nua** (`:531-532`), não `{promise, subscribers}`. O `onProgress` é um parâmetro do chamador, capturado no closure do Impl (`report`, `:229-231`). Um joiner recebe a Promise existente (`:529`) — o `onProgress` dele **nunca é chamado**.

Consumidores reais de `onProgress`: `useStoryPackDownload.js:51` (barra 0..1, produção) e `PackSandboxDevScreen.js:118,138` (dev).

**Impacto real:** o resultado final é correto para todos; só a barra do segundo observador fica em 0%.

### 8.3 Princípios congelados

> **[GOV-01]**
> 1. Todos os participantes **ativos** da mesma operação recebem progresso coerente.
> 2. Identidades diferentes **não** compartilham eventos.
> 3. Um participante pode **entrar** durante uma operação em andamento.
> 4. Um participante pode **sair** sem deixar listener órfão.
> 5. O **resultado terminal** é coerente para todos os participantes.
> 6. Retry **não** herda progresso terminal antigo.
> 7. O bloco **não** altera identidade (D), instalação física, nem política de cancelamento (F).
> 8. O contrato vale **mesmo** que hoje o fluxo comum tenha só uma tela observadora — o contrato é do serviço, não da tela atual.

### 8.4 Critérios de aceite

1. Duas solicitações concorrentes da mesma identidade → **ambos** os `onProgress` recebem eventos; uma operação física só.
2. Um joiner que entra no meio recebe progresso **do ponto em que entrou** em diante (não é obrigatório reemitir o histórico — **[ABERTO]** se deve haver *replay* do último evento).
3. Identidades diferentes → nenhum evento cruzado.
4. Participante que sai antes do fim → nenhum listener órfão; a operação dos demais **não** é afetada (já provado hoje em `smoke.js` "LP2 §7 (comportamental)").
5. Resultado terminal idêntico para todos.
6. Retry após falha não entrega evento terminal da tentativa anterior.
7. Mutation checks: só o criador recebe progresso → derruba (1); listener não removido → derruba (4); evento cruzado entre identidades → derruba (3).

> **[ABERTO]** Se o progresso deve ser **monotônico** por participante (nunca retroceder). O fluxo atual reporta bytes cumulativos e um `report` por arquivo, mas o `throttle` de chunk (`:376`) pode entregar eventos fora de ordem entre kinds. E deve ser decidido em E, com prova.

---

## 9. LP2.1a-ii-F — Cancelamento e ciclo de vida dos participantes

### 9.1 Escopo exclusivo

Definir cancelamento e o ciclo de vida dos participantes da operação compartilhada.

### 9.2 Estado atual (fato)

- `isCancelled` faz o chamador **dono exclusivo** do resultado: ele **não** entra no mapa de compartilhamento, mas **ainda** passa pela fila física (`packDownloadService.js:895`) — senão disputaria o `.tmp`.
- **Nenhum chamador de produto passa `isCancelled`** — provado por guarda no suite (`smoke.js:8252` "LP2 §4.5", que assere `!/isCancelled/.test(hook)`). A UI que "cancela" apenas **deixa de observar**.
- O swap (delete→move→READY) **não é cancelável**: o último `throwIfCancelled` fica antes dele (`:618`).
- Cancelamento **não grava o índice** — só limpa o `.tmp`.

> **[RECONCILIADO 2026-07-28]** Os quatro fatos acima **continuam verdadeiros** — auditados de novo hoje (`grep isCancelled src/` só encontra ocorrências dentro de `packDownloadService.js`). O bloco F (`6cf799c`) **não** mexeu em `isCancelled`: ele definiu a saída de participante por um caminho **separado**, o `participantSignal` (`inspectParticipantSignal` `:793`, `removeProgressSubscriber` `:807`), consumido pela tela via `createHookAbortController` (`useStoryPackDownload.js:35`). Sair **remove o participante**; **não** aborta a operação física. Ver §15 nº 8 para por que a política ainda **não** é declarada resolvida.

### 9.3 O que o bloco F deve decidir, com provas

> **[ABERTO]** Nenhuma política é escolhida aqui. F deve decidir e provar:
> 1. Se cancelar remove **apenas o participante** ou pode abortar a operação física.
> 2. **Quando** uma operação física pode ser abortada (e se pode, dado que o swap não é cancelável).
> 3. O que acontece quando **ainda existem outros participantes**.
> 4. Como callbacks e listeners são removidos.
> 5. O que acontece **durante** move, persistência e finalização.
> 6. Como o retry se comporta **após** cancelamento.
> 7. Como evitar resultados ou eventos entregues a participantes **desmontados**.

### 9.4 Critério de aceite mínimo

Qualquer política escolhida deve preservar os invariantes já provados: nunca `READY` parcial, nunca destruir pack válido, `.tmp` limpo, chave liberada, fila não travada.

---

## 10. Dependências e ordem

> **[GOV-01] Ordem congelada** *(estado reconciliado em 2026-07-28 — detalhe e provas em §4.1)*:
>
> 1. **LP2.1-GOV-01** (esta spec) — ✅ **concluído** (`00c2d44`)
> 2. **LP2.1a-ii-C** — recuperação de órfão — ✅ **implementado** (`82362e6`, `0e049f9`)
> 3. **Auditoria integrada da recuperação** — ✅ **executada** (`0d3ee57` … `d26330b`, `4ebe639`)
> 4. **LP2.1a-ii-D** — identidade resolvida — ✅ **implementado** (`090a928`)
> 5. **LP2.1a-ii-E** — progresso compartilhado — ✅ **implementado** (`d5a46c1`)
> 6. **LP2.1a-ii-F** — cancelamento — ✅ **implementado** (`6cf799c`)
> 7. **Auditoria integrada de concorrência** — 🟡 **EM EXECUÇÃO** (bloco atual; **não** concluído — §4.2)
> 8. **Validação real no iPhone** — ⬜ **pendente**
> 9. **Fechamento da trilha LP2** — ⬜ **pendente**
> 10. **Análise global de gargalos** (§14) — ⬜ **não iniciada**
>
> **A ordem não mudou.** As correções `01F` e `01G-C` (§4.1) não são itens novos desta lista: são subblocos corretivos dentro da mesma trilha, feitos entre o item 6 e o item 7 por causa da validação física.

**Por que C primeiro:** é o único item com **perda de valor já provada** (conteúdo íntegro no disco tratado como ausente) e é o que menos depende dos outros — resolve-se com a identidade atual.

**Por que identidade (D) antes de progresso (E):** progresso compartilhado é *"todos os participantes **da mesma operação**"*. Sem uma identidade resolvida confiável, "mesma operação" é ambíguo — e um erro de identidade faria progresso vazar entre packs diferentes, que é pior que não ter progresso. Não se pode multiplexar inscritos de um conjunto mal definido.

**Por que progresso (E) antes de cancelamento (F):** cancelamento é a **remoção** de um participante. Só faz sentido definir como um participante sai depois de existir a estrutura que define como ele entra e o que recebe enquanto está dentro (`{promise, subscribers}`). F sem E teria de inventar essa estrutura por conta — e as duas definições divergiriam.

---

## 11. Exclusões

> **[GOV-01]** Fora do escopo de **toda** esta sequência (C, D, E, F):
>
> 1. Alterações visuais.
> 2. Assets e áudios.
> 3. R2 e publicação de conteúdo — salvo o uso dos testes controlados **já existentes**.
> 4. RevenueCat e entitlement.
> 5. Mudanças de produto.
> 6. Atualização de dependências.
> 7. Otimizações visíveis não relacionadas ao contrato de loading.
> 8. Garbage collection geral / política de cache (inclui o diretório da versão antiga que fica no disco — §7.5.2).
> 9. Refatorações estéticas.
> 10. Builds de distribuição.
> 11. **Reabrir a semântica de `errorMessage`** (`3485b95`) ou a decisão do §5.3.

---

## 12. Gates por classe de bloco

| Classe | Gates mínimos |
|---|---|
| **Documental** | `npm run smoke` verde + `expo-doctor` verde + `git diff --check`; nenhum código/asset/áudio/config/dependência alterado; nenhuma âncora ou comentário existente renomeado; estrutura e âncoras do documento validadas (toda referência `arquivo:linha` deve existir **e dizer o que o texto afirma**). **Smoke é exigido também aqui:** `AGENTS.md:60` põe smoke e `expo-doctor` como obrigatórios "antes de concluir", **sem exceção para docs**, e o CI (`.github/workflows/ci.yml`) trata smoke como **gate duro**. A linha "Documentação pura" do `CLAUDE.md:55` regula o **tamanho do artefato** (rigor proporcional ao risco), não dispensa gate. |
| **Correção de storage** | Tudo do documental + `npm run smoke` verde + **Babel** dos arquivos de aplicação + mutation checks codificados + revisão adversarial read-only + integridade de hashes dos arquivos não commitados. |
| **Correção de downloader** | Igual a storage + provas pelo **harness real** (`packInstallHarness.js`), não por mocks que contornem a lógica. |
| **Concorrência** | Igual a downloader + provas com solicitações **concorrentes** + prova de isolamento entre instâncias + mutation check de single-flight/serialização. |
| **Recovery de crash** | Igual a concorrência + cenários de encerramento por **checkpoint** (hook `onBefore` do harness, que inspeciona o estado no instante da operação real) + prova de **idempotência**. |
| **Validação no dispositivo** | Todos acima + **validação real no iPhone pelo Eduardo** (print/vídeo). O assistente **não tem dispositivo** e **não pode** declarar validação visual. |

**Comuns a todos:** `expo-doctor`, `expo install --check`, `git diff --check`, `git status` limpo após o commit, `git add` seletivo, sem push sem aprovação.

**Único drift ambiental autorizado:** `expo@54.0.35` → esperado `~54.0.36`. **Qualquer alerta novo é achado**, não ruído.

---

## 13. Critério de fechamento da trilha

A trilha LP2 só pode ser declarada concluída quando **todos** forem verdade:

| # | Critério | Estado em 2026-07-28 |
|---|---|---|
| 1 | Todos os blocos comprometidos (C, D, E, F) implementados **ou** formalmente descartados com justificativa registrada nesta spec. | ✅ **atendido** — os quatro implementados (§4.1) |
| 2 | Gates verdes. | ✅ **atendido em `fddd1f0`** — smoke 3038/3038; expo-doctor 17/18 com o único drift autorizado (§12). *[2026-07-28: smoke **3231/3231** ao fim do §10.7]* |
| 3 | A **composição** entre os contratos testada — não só cada bloco isolado (ex.: recovery + identidade resolvida + progresso simultâneos). | ✅ **atendido em harness** — §10.7 **concluído**: G1–G6 exercitados em composição, dois defeitos reais encontrados e corrigidos (`bcfde07`, `746c1f3`). **Ressalva:** provas **comportamentais em harness**; a validação em dispositivo é o §10.8 (critério 4) |
| 4 | **Validação real no iPhone** pelo Eduardo. | ❌ **NÃO atendido** — §10.8 pendente (validações físicas pontuais do `01G-C` **não** substituem) |
| 5 | Nenhum estado órfão conhecido sem política documentada. | ✅ **atendido** — C1/C2 recuperáveis, C3 detectável, legados congelados (plan §8) |
| 6 | Riscos residuais registrados. | ✅ **atendido** — §16 |
| 7 | Árvore limpa. | ⬜ **a verificar no fechamento** (§10.9) |
| 8 | Commits locais individualmente rastreáveis (um bloco lógico = um commit). | ✅ **atendido até aqui** — um commit por bloco (§4.1) |
| 9 | Relatório consolidado produzido. | ⬜ **pendente** — pertence ao §10.9 |

> **Enquanto 3 e 4 estiverem em ❌, a trilha LP2 NÃO pode ser declarada concluída.** Esta reconciliação não os move.

---

## 14. Análise global posterior (registro, não escopo)

> **[GOV-01]** Depois do fechamento da trilha, será feita uma análise **separada** sobre tudo que foi realizado, procurando: gargalos de desempenho; gargalos arquiteturais; complexidade acidental; dívidas técnicas; riscos de concorrência; riscos de persistência; cobertura insuficiente; observabilidade; experiência percebida; prioridades seguintes.
>
> **Não faz parte do LP2.1-GOV-01 e não deve ser iniciada agora.**

---

## 15. Decisões deliberadamente em aberto

Reunidas para o Portão Humano 1:

| # | Em aberto | Bloco | Situação |
|---|---|---|---|
| 1 | Estados concretos do índice na janela de crash; metadados disponíveis; validação necessária e suficiente | C (§6.3) | **RESOLVIDA pela auditoria** (2026-07-16) — fatos executados no harness real: [plan §3](./plan-lp2.1a-ii-c.md) e [plan §5](./plan-lp2.1a-ii-c.md) |
| 2 | Se o órfão C2 (instalação nova, sem entrada no índice) é detectável sem varrer o disco, e a que custo | C (§6.5) | **RESOLVIDA por decisão humana** (2026-07-16): C cobre **C1 e C2**; `readDirectoryAsync` aprovado **só** para descoberta direcionada por `storyId` (§6.3) |
| 3 | Onde o recovery roda (boot, foco, sob demanda) | C (§6.3.4) | **RESOLVIDA por decisão humana** (2026-07-16): **sob demanda**, sem varredura no boot (§6.3) |
| 4 | Como coordenar as duas fases da identidade (duas chaves? promoção? revalidação do joiner?) | D (§7.6) | **RESPONDIDA na implementação, NÃO DECLARADA RESOLVIDA** — ver abaixo |
| 5 | Se um joiner pode receber a versão que o voo resolveu, e não a que ele resolveria agora | D (§7.5.1) | **RESPONDIDA na implementação, NÃO DECLARADA RESOLVIDA** — ver abaixo |
| 6 | Se há *replay* do último evento de progresso para quem entra no meio | E (§8.4.2) | **RESOLVIDA — SIM, há replay** (2026-07-20, `d5a46c1`) |
| 7 | Se o progresso deve ser monotônico por participante | E (§8.4) | **RESOLVIDA — SIM, monotônico** (2026-07-20, `d5a46c1`) |
| 8 | Toda a política de cancelamento | F (§9.3) | **RESPONDIDA na implementação, NÃO DECLARADA RESOLVIDA** — ver abaixo |

### 15.1 Detalhamento das decisões 4 a 8 (reconciliação de 2026-07-28)

> **Portão do Eduardo:** *"Não marque como resolvida nenhuma decisão que dependa das lacunas G1 a G6."* O critério aplicado abaixo é literal: **decisão cuja correção sob composição ainda é objeto de G1–G6 fica NÃO RESOLVIDA**, mesmo já tendo implementação e provas de bloco isolado.

**Nº 4 — coordenação em duas fases.** *Resposta implementada em `090a928`:* **resolve-first**. Toda solicitação resolve a própria identidade (`resolveInstallIdentity`, `packDownloadService.js:239`) **antes** de consultar o mapa de voos, e o voo é chaveado pela identidade resolvida (`canonicalResolvedKey`, `:276`). Não há promoção de chave nem revalidação tardia do joiner. Provado isolado nos blocos `D1`/`D2`/`D3` (`smoke.js:11711`, `:11916`, `:12237`).
**Por que NÃO é declarada resolvida:** o registro global de instalação criado no `01F` é chaveado **só por `storyId`** (`packInstallRegistry.js:108`). Duas identidades resolvidas diferentes da mesma história produzem dois voos legítimos sobre **um** contador de operação. A correção dessa coordenação **sob composição** é a lacuna **G1** (§4.2), o portão de continuidade da auditoria.

**Nº 5 — versão que o joiner recebe.** *Resposta implementada em `090a928`:* **não recebe versão alheia.** Como a resolução vem antes do join, um joiner só entra num voo cuja identidade resolvida é **idêntica** à sua; identidades divergentes **não** compartilham resultado.
**Por que NÃO é declarada resolvida:** essa resposta troca o problema de lugar — divergir passou a significar **dois voos**, e o que acontece com o **primeiro** voo quando o segundo começa é precisamente **G1**. Declarar resolvido antes de G1 seria declarar segura uma composição não provada.

**Nº 6 — replay para quem entra no meio.** **RESOLVIDA: sim.** `replayLatestProgress` (`packDownloadService.js:768`) entrega ao recém-inscrito o último snapshot conhecido, e depois os eventos futuros. Prova: `smoke.js:12498` (*"E-PROG-02 (joiner tardio + replay)"*), com controle negativo real — a mutação `ME2` (`smoke.js:12960-12962`) remove a chamada de replay e **derruba** a prova.
**Por que pode ser declarada resolvida:** o contrato é interno ao bloco E e vale para participantes da **mesma** identidade resolvida. Não depende de nenhuma das lacunas G1–G6 — G1 trata de identidades que **não** compartilham voo; G5 trata de **saída**, não de entrada.

**Nº 7 — monotonicidade do progresso.** **RESOLVIDA: sim, monotônico por participante**, em bytes, total e status, **sem clamp e sem fabricação de evento**. Prova: `smoke.js:12766` (*"E-PROG-12 (ordem/monotonicidade)"*), que verifica as sequências do criador **e** do joiner.
**Por que pode ser declarada resolvida:** mesma razão do nº 6 — contrato interno do fan-out de E, verificado sobre as sequências realmente emitidas, sem dependência de G1–G6.

**Nº 8 — política de cancelamento.** *Resposta implementada em `6cf799c`:* sair **remove o participante**, **nunca** aborta a operação física. A saída é expressa por `participantSignal` (`inspectParticipantSignal` `:793`, `removeProgressSubscriber` `:807`); `isCancelled` permanece um caminho **exclusivo e sem uso em produção** (§9.2); o swap continua **não cancelável** (`:618`).
**Por que NÃO é declarada resolvida:** as perguntas 3, 5 e 7 do §9.3 — *o que acontece quando ainda existem outros participantes*, *o que acontece durante o move/persistência* e *como evitar entrega a participantes desmontados* — são exatamente as lacunas **G5** (saída durante a publicação com outro participante presente) e **G6** (chamador cancelável dividindo a fila física com um voo compartilhado). Sem elas provadas, a política está implementada, **não** demonstrada em composição.

> As decisões 4, 5 e 8 **permanecem em aberto quanto à composição** e pertencem ao §10.7. A resolução de 1–3 **não** as toca. O marcador aprovado para C preserva a identidade **de uma instalação específica já resolvida**, para fins transacionais — **não** é a implementação do bloco D, que segue responsável pela identidade e pela coordenação **entre solicitações**.

---

## 16. Riscos residuais registrados

1. **Dívida de enum** — `NEEDS_UPDATE` e `REQUIRES_APP_UPDATE` declarados sem uso (§5.1). Não é defeito; é superfície morta que pode confundir quem ler o enum como contrato.
2. **`errorMessage` em `DOWNLOADING`** — ambíguo se algum dia alguém ler o campo (§5.3).
3. **Diretório da versão antiga fica no disco** após um bump de versão (§7.5.2) — vazamento conhecido, pertence a política de cache, **fora desta trilha**.
4. **A trilha não tem validação em dispositivo** até hoje. Todas as provas são comportamentais em harness. Isso é adequado para os invariantes provados, mas **não substitui** o iPhone (§12, §13.4). *(Reconciliado 2026-07-28: houve captura física **pontual** no `01G-C`; o §10.8 continua pendente — §4.1.)*
5. **[REGISTRADO 2026-07-28] Composição entre os contratos ainda não provada** — cada bloco (C, D, E, F, 01F, 01G-C) tem provas isoladas; as seis lacunas **G1–G6** (§4.2) são combinações nunca exercitadas numa mesma execução. **G1** — identidade resolvida divergente × registro global por `storyId` — era a mais séria e foi o **portão de continuidade** do §10.7: **confirmada como defeito real em `fddd1f0` e corrigida em `bcfde07`** (revogação de Reset separada da sucessão visual e da publicação física). **G2–G6 seguem pendentes.** Enquanto o §10.7 não fechar, o §13.3 permanece **não atendido**. *(**Atualizado 2026-07-28:** **G2, G3, G5 e G6 aprovados**; **G4 confirmou um segundo defeito real**, corrigido em **`746c1f3`**. **§10.7 concluído** e o §13.3 passa a **atendido em harness** — a validação em dispositivo continua sendo o §10.8. Risco residual **permanece**: nenhum dos interleavings foi observado em runtime real, todos foram impostos pelo harness.)*
6. **[REGISTRADO 2026-07-28] Dívida técnica de renderização** — `src/components/story/StorySceneVisual.js:40` declara `SceneNumberBadge` **dentro do render**, o mesmo mecanismo que causou o `01G-C`. Consequência **muito menor** (o badge é **irmão**, não ancestral, de qualquer `<Image>`, e no estado A nem é renderizado) e **sem sintoma visual observado**. Registrado como dívida; **não corrigir sem medição** e fora do escopo do §10.7 (decisão do Eduardo, 2026-07-28).
