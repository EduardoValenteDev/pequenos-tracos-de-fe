# Auditoria integrada de concorrência — matriz de cenários (spec §10.7)

> **Feature:** `012-loading-performance-foundation` · **Bloco:** Auditoria integrada de concorrência (**spec [§10.7](./spec.md)**) · **Data:** 2026-07-28
> **Branch:** `fix/loading-performance-foundation` · **HEAD na abertura:** `fddd1f0`
> **Estado do bloco: 🟡 EM EXECUÇÃO.** Este documento **não** declara o §10.7 concluído.
> **Escopo:** provar que os contratos de **C, D, E, F, 01F e 01G-C** funcionam **quando combinados** sob concorrência real. Cada bloco já tem provas **isoladas**; nenhuma prova existente os exercita **juntos** — é o critério [§13.3](./spec.md) da spec, hoje **não atendido**.

---

## 0. Regra que governa este bloco

> **Não alterar código de produção apenas para satisfazer o teste.** Se a auditoria provar um defeito real de composição: **parar**, **não corrigir neste bloco**, apresentar a causa, apresentar o menor escopo corretivo possível e **aguardar autorização para um bloco separado.**

Consequência prática: toda prova aqui é **descritiva** do comportamento real. Uma prova que falha **não** autoriza mexer em `src/`.

### Portão de continuidade (Eduardo, 2026-07-28)

**G1 roda primeiro e sozinho.** Se G1 confirmar que (a) duas identidades resolvidas diferentes da mesma história criam voos separados, (b) o segundo `beginInstall` incrementa o `operationId` global por `storyId`, (c) a primeira operação perde a autorização de publicação e (d) a primeira devolve `reason:'reset'` ou remove `localDir` **sem reset real do usuário** — então a auditoria **para imediatamente**, nenhum arquivo de produção é alterado, não há staging nem commit do bloco, o §10.7 **não** é declarado concluído, e um bloco corretivo separado e mínimo é proposto. **G2–G6 só rodam se G1 passar.**

---

## 1. Disciplina de provas (vale para todos os cenários)

| Regra | Detalhe |
|---|---|
| **Motor real** | Toda prova usa `scripts/testing/packInstallHarness.js` + `createPackDownloadService(deps)` — o **mesmo** algoritmo da produção (seam de `1c84773`). |
| **Doubles só na fronteira do mundo** | Permitido: rede (`fetchGlobalContentManifest`), disco (FS em memória), relógio/checkpoints (`onBefore`), log (`warn`). |
| **Nunca substituir por double permissivo** | Registro global, fila do índice, identidade da operação, reconciliação, recovery, publicação, lógica de cancelamento e decisão de join entram **reais**. |
| **Registro global REAL** | ⚠️ `h.deps` **não** inclui `installRegistry` — sem injetá-lo, `isAuthorizedToPublish` é `undefined` e a fence de publicação fica **inerte**. Toda prova de composição que envolva 01F **deve** carregar o registro real por `loadModule('src/services/packInstallRegistry.js', …)` e injetá-lo, com **instância nova por cenário** (o módulo é singleton: `snapshots`, `opCounters`, `seq`). |
| **Ordem controlada** | Interleavings são forçados por `h.onBefore` em checkpoints reais (`delete`, `move`, `set-entry`), não por `setTimeout` torcendo por sorte. |
| **Controle negativo obrigatório** | Cada cenário novo tem ≥1 mutação que **derruba** a prova. Mutação que não bate no fonte **estoura** (`loadModule`/`loadPackDownloader` já garantem) — nunca conta como morta. |
| **Sem prova tautológica** | Proibido provar por regex de comentário ou por asserção que o cenário satisfaz por construção. |

---

## 2. Matriz

### Cenário A — dois participantes no mesmo voo *(mapeia G4)*

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Índice vazio. Manifesto global com um pack válido de `david_goliath@2.0.0`. Registro global **real** injetado. |
| **Eventos concorrentes** | A cria o voo; B entra com a **mesma** identidade resolvida; ambos observam progresso; ambos observam o registro global. |
| **Ordem controlada** | B despachado no `onBefore('delete')` do voo de A. |
| **Invariante** | Uma operação física (`moves === 1`); um único `beginInstall`; ambos recebem progresso coerente; **um** evento de disponibilidade global (`subscribePackReady`), não dois. |
| **Resultado terminal** | `rA` e `rB` idênticos, `ok:true`; snapshot do registro em `ready` com `operationId` **inalterado**; mapa de voos vazio. |
| **Prova positiva** | Contar `moves`, `beginInstall`, disparos de `subscribePackReady` e comparar `JSON.stringify(rA) === JSON.stringify(rB)`. |
| **Mutação que deve quebrar** | Emitir READY duas vezes no registro (`settleReady` sem stale-guard) → a contagem de eventos globais passa de 1 para 2. |

### Cenário B — recovery de órfão com consumidor ativo *(mapeia G2)*

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Órfão semeado: disco completo com marcador válido, índice em `downloading` (`h.seedOrphanPack`). Consumidor já inscrito no registro global **antes** da chamada. |
| **Eventos concorrentes** | Uma solicitação de instalação dispara o recovery (C) enquanto um participante observa progresso (E) e o registro global (01F). |
| **Ordem controlada** | Inscrição no registro **antes** do `downloadStoryPackScenesFromGlobalManifest`. |
| **Invariante** | Recovery promove sem baixar assets (`h.counters.downloads === 0`); o participante inscrito **recebe** o terminal; o registro **não** fica preso em `resolving`/`downloading`. |
| **Resultado terminal** | Índice `ready`; snapshot global `ready`; `subscribePackReady` disparado ≥1. |
| **Prova positiva** | `downloads === 0` + índice `ready` + snapshot `ready` + evento global observado. |
| **Mutação que deve quebrar** | Remover a reconciliação de órfão (recovery não promove) → aparecem downloads e o caminho muda. |

### Cenário C — identidade divergente *(mapeia **G1** — portão)*

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Mesma história; o manifesto global entrega `2.0.0` na 1ª resolução e `3.0.0` na 2ª (`fetchFila`). Registro global **real** injetado. |
| **Eventos concorrentes** | Duas solicitações da **mesma** `storyId` que resolvem identidades **diferentes** → dois voos legítimos (`canonicalResolvedKey` distintos), serializados pela fila física por `storyId`. |
| **Ordem controlada** | A despachada primeiro; B despachada em seguida, **antes** de A chegar à fence de publicação. |
| **Invariante em teste** | Nenhuma operação legítima pode perder a autorização de publicação **sem reset real do usuário**. A fence (`packDownloadService.js:641`) existe para o **Reset**, não para supersessão por outra identidade. |
| **Resultado terminal esperado (contrato)** | Ambas as instalações concluem, cada uma no seu diretório (`story@2.0.0`, `story@3.0.0`); nenhuma devolve `reason:'reset'`. |
| **Prova positiva** | Observar `rA.ok`, `rB.ok`, `reason`, `resetInvalidated`, `moves`, o índice final, os diretórios em disco e `_debugState()` do registro. |
| **Mutação que deve quebrar** | Chavear o registro pela identidade resolvida em vez de `storyId` — se a prova continuar idêntica, ela não estava medindo a interação. |

> **Este é o portão.** A prova é **descritiva**: ela registra o que o código faz hoje, não o que se gostaria que fizesse.

### Cenário D — saída durante a publicação *(mapeia G5)*

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Voo compartilhado com dois participantes (A e B), cada um com seu `participantSignal`. |
| **Eventos concorrentes** | B aborta o próprio signal **durante** a janela de publicação (entre `move` e `READY`). |
| **Ordem controlada** | `onBefore('set-entry')` dispara `controllerB.abort()`. |
| **Invariante** | A saída de B **remove só B**; a operação física **não** é abortada; A recebe o terminal íntegro; nenhum listener órfão fica no record. |
| **Resultado terminal** | `rA.ok === true`; índice `ready`; `inFlightInstallCount() === 0`; B não recebe evento após o abort. |
| **Prova positiva** | Contar eventos de B após o abort (deve ser 0) e conferir o terminal de A. |
| **Mutação que deve quebrar** | Cancelar o voo físico quando um participante sai → A perde o resultado. |

### Cenário E — reset e retry concorrentes *(mapeia G3)*

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Voo compartilhado com **dois** participantes (as provas `RESET-1`/`RESET-2` do 01F usam **um** só). |
| **Eventos concorrentes** | `clearStoryPackInstall(storyId)` (Reset real) durante o voo; em seguida, um retry. |
| **Ordem controlada** | Reset no `onBefore('move')`; retry após o settlement do voo invalidado. |
| **Invariante** | O voo invalidado **não** publica; o Reset é **real** (veio do usuário) e por isso a invalidação é legítima; o retry cria voo novo e conclui; **ambos** os participantes veem estado coerente. |
| **Resultado terminal** | 1ª chamada `{ok:false, reason:'reset', resetInvalidated:true}`; retry `ok:true`; índice final `ready`. |
| **Prova positiva** | Comparar o desfecho dos dois participantes e o estado do registro. |
| **Mutação que deve quebrar** | Permitir voo antigo publicar após reset (remover a fence) → o READY revogado reaparece. |

### Cenário F — duas histórias *(isolamento; apoia G4)*

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | `david_goliath` e `noah`, ambos válidos no manifesto global. |
| **Eventos concorrentes** | Instalações simultâneas das duas histórias, com participantes distintos. |
| **Ordem controlada** | Despacho simultâneo; sem barreira artificial. |
| **Invariante** | Zero cross-talk: progresso, snapshots e `operationId` por história; as duas filas físicas são independentes; dois `READY` concorrentes **convergem** no índice. |
| **Resultado terminal** | Índice com **as duas** entradas `ready`; nenhuma sobrescreve a outra. |
| **Prova positiva** | Ler o índice final e conferir as duas entradas + isolamento dos snapshots. |
| **Mutação que deve quebrar** | Remover o isolamento por `storyId` (broadcast global) → eventos cruzam. |

### Cenário G — erro terminal *(mapeia G6 e o invariante de vivacidade)*

| Campo | Conteúdo |
|---|---|
| **Pré-condição** | Quatro variantes: **offline** (rede indisponível), **HTTP** (404 no arquivo), **SHA divergente** (byte trocado), **cancelamento** (`isCancelled`) dividindo a fila física com um voo compartilhado. |
| **Eventos concorrentes** | Em cada variante, um participante observador e um voo compartilhado simultâneo. |
| **Ordem controlada** | Falha injetada em ponto determinístico do harness. |
| **Invariante (vivacidade)** | **Nada fica eternamente** em `resolving`, `downloading`, `verifying` ou `publishing`: todo caminho termina em `ready`, `error` ou `idle`. A chave do voo é sempre liberada (`cleanupRecord` no `finally`). |
| **Resultado terminal** | Snapshot global em estado terminal; `inFlightInstallCount() === 0`; pack anterior válido preservado. |
| **Prova positiva** | Inspecionar `_debugState()` do registro ao fim de cada variante e o mapa de voos. |
| **Mutação que deve quebrar** | Permitir erro permanecer em estado ativo (não emitir terminal) → o snapshot fica preso numa fase intermediária. |

---

## 3. Mutações exigidas pelo bloco (ETAPA 5)

Cada uma deve **derrubar** ao menos uma prova nova; nenhuma pode ser mutante morto:

1. Remover isolamento por `storyId`.
2. Permitir join com identidade divergente.
3. Cancelar o voo físico quando um participante sai.
4. Emitir `READY` duas vezes.
5. Remover o replay do snapshot.
6. Permitir voo antigo publicar após reset.
7. Remover a reconciliação de órfão.
8. Permitir erro permanecer em estado ativo.
9. Remover `subscribePackReady`.
10. Tornar o progresso novamente apenas local.

---

## 4. Execução

| Etapa | Estado |
|---|---|
| Matriz (este documento) | ✅ escrita |
| **G1 — portão de continuidade** | 🔴 **EXECUTADO — DEFEITO CONFIRMADO** em `fddd1f0` · ✅ **CORRIGIDO** em `bcfde07` · **SUPERADO** (§6) |
| **G2** — recovery de órfão com consumidores | ✅ **APROVADO** (§7.1) |
| **G3** — Reset com voo compartilhado | ✅ **APROVADO** (§7.2) |
| **G4** — dois READY concorrentes no `PacksContext` | 🔴 **EXECUTADO — DEFEITO CONFIRMADO** em `bcfde07` (§8) · ✅ **CORRIGIDO** em `746c1f3` · **SUPERADO** (§9) |
| **G5** — saída durante a publicação | ✅ **APROVADO** (§10) — nenhum defeito de produção |
| **G6** — chamador cancelável × voo compartilhado | ✅ **APROVADO** (§11) — nenhum defeito de produção |
| Revisão adversarial das 10 afirmações | ✅ **executada** (§12) — nenhuma refutada |
| Staging / commit do bloco | ✅ commit **local** de auditoria (§13) — **sem push** |
| Declaração de conclusão do §10.7 | ✅ **§10.7 CONCLUÍDO** (§13). **§10.8 permanece pendente.** |

---

## 5. Resultado do G1 — **defeito de composição confirmado**

Executado em 2026-07-28 como diagnóstico (fora do repositório, `scripts/smoke.js` **não** foi
tocado). Motor real: `packDownloadService` + `packStorageService` + `packIntegrityService` +
`packManifestService` + `packReconcileService` + `packPublishMarker` + `globalManifestService`,
com o **registro global real** (`packInstallRegistry`) injetado. O registro foi apenas
**observado** por wrappers que delegam ao real — nenhuma decisão foi substituída.

### 5.1 Interleaving exata (ordem controlada no checkpoint `moveAsync` de A)

```
beginInstall(david_goliath) -> operationId=1  [v2.0.0]      ← voo A criado
A: checkpoint MOVE (.tmp/david_goliath@2.0.0/ -> packs/david_goliath@2.0.0/)
beginInstall(david_goliath) -> operationId=2  [v3.0.0]      ← voo B criado; BUMP do contador global
  fence: isCurrentOperation(david_goliath, op=1) -> false   ← A perde a autorização
A: RESOLVIDA -> { ok:false, reason:'reset', resetInvalidated:true }
  fence: isCurrentOperation(david_goliath, op=2) -> true
READY-GLOBAL v=3.0.0
B: RESOLVIDA -> ok=true v=3.0.0
```

Os quatro pontos do portão, **todos confirmados**:

| # | Afirmação | Evidência |
|---|---|---|
| a | Duas identidades resolvidas diferentes da mesma história criam voos separados | 2 resoluções; 2 `beginInstall`; `resolvedInstallKey` distintos (7 campos) |
| b | O 2º `beginInstall` incrementa o `operationId` global por `storyId` | `op=1` → `op=2`, mesmo `storyId` |
| c | A 1ª operação perde a autorização de publicação | `isCurrentOperation(david_goliath, 1) → false` na fence `packDownloadService.js:641` |
| d | A 1ª devolve `reason:'reset'` / remove `localDir` **sem reset real** | `{ok:false, reason:'reset', resetInvalidated:true}`; `david_goliath@2.0.0` fica com **0 arquivos**. Nenhuma chamada a `clearStoryPackInstall` ocorreu |

**Controle negativo (tem dentes):** o MESMO cenário, MESMA interleaving, **sem** o registro
injetado, devolve `A: ok=true v=2.0.0` e mantém os 4 arquivos de `david_goliath@2.0.0` em disco.
O desfecho de A **diverge** entre os dois modos → a conclusão mede o registro, não o harness.
É por isso que o `E-PROG-05` (`smoke.js:12651`) passa hoje: `h.deps` **não** inclui
`installRegistry`, então `isAuthorizedToPublish` é `undefined` e a fence fica **inerte**.

### 5.2 Reset real × supersessão por outra identidade

| | **Reset real (legítimo)** | **Supersessão por outra identidade (defeito)** |
|---|---|---|
| Origem | `clearStoryPackInstall(storyId)` — ação do usuário | `beginInstall(storyId, …)` de outro voo |
| Intenção | revogar a instalação | iniciar outra instalação |
| Efeito no contador | bump (`packInstallRegistry.js:166`) | bump (`packInstallRegistry.js:110-111`) |
| Como a fence enxerga | **idênticos** | **idênticos** |

A fence FIX1R pergunta *"esta operação ainda é a corrente?"*, mas precisa perguntar
*"esta operação foi revogada?"*. Hoje **qualquer** operação nova da mesma história responde
"não é a corrente" — e a resposta é indistinguível de um Reset.

### 5.3 Bytes, índice e snapshots ao final de cada operação

| Variante | Voo A (2.0.0) | Voo B (3.0.0) | Disco | Índice | Snapshot |
|---|---|---|---|---|---|
| **V1** — B conclui | `ok:false reason:'reset'` | `ok:true` | `@2.0.0`: **0 arquivos** (apagado após download + validação completos) · `@3.0.0`: 4 | `ready 3.0.0` | `ready op=2 v=3.0.0` |
| **V2** — B falha (rede) | `ok:false reason:'reset'` | `ok:false` | `@2.0.0`: **0** · `@3.0.0`: **0** | `failed 3.0.0` | `error op=2` |
| **V3** — havia `1.0.0` instalado; B falha | `ok:false reason:'reset'` | `ok:false` | `@1.0.0`: 2 (**intacto**) · `@2.0.0`: 0 · `@3.0.0`: 0 | `ready 1.0.0` | `error op=2` |

Fatos que a medição fixa:

- **V2 é a pior consequência:** ao final **nada** fica instalado, embora um pack **completo,
  íntegro e já promovido ao diretório final** (`@2.0.0`, marcador de publicação incluso) tenha
  existido em disco e sido **apagado** pela fence.
- **V3 é a mitigação:** um pack **anteriormente instalado** não é perdido — A e B trabalham em
  diretórios de outra versão, e o índice permanece apontando para o pack válido.
- **O participante de A nunca recebe terminal:** os eventos param em `verifying`. O `settleError`
  de A é engolido pelo stale-guard (`op=1` não é corrente), então o registro nunca reporta o
  desfecho de A. Quem chamou recebe `reason:'reset'` — semanticamente **falso**.

### 5.4 Segunda manifestação da mesma causa — o **joiner-guard**

O `isCurrentOperation` também governa a decisão de join (`packDownloadService.js:906`). Com uma
terceira resolução voltando à identidade `2.0.0` (A→2.0.0, B→3.0.0, C→2.0.0):

| | com registro (produção) | sem registro (controle) |
|---|---|---|
| downloads do `manifest.json` da 2.0.0 | **2** | 1 |
| downloads da cena 01 da 2.0.0 | **2** | 1 |
| `moveAsync` | **3** | 2 |
| A e C compartilham a conclusão | **não** | sim |

C **não joina** A — mesmo tendo a **mesma** identidade resolvida — e monta um voo novo com a
**mesma chave**, sobrescrevendo o mapa. É exatamente a duplicação que o single-flight existe para
impedir. A correção precisa cobrir **as duas** consultas, não só a fence.

### 5.5 Alcance real em produção (honesto)

O gatilho exige **duas resoluções divergentes da mesma história**. Verificado no código:

- `requestedKinds` **não** diverge: `useStoryPackDownload.js:26` e `PackSandboxDevScreen.js:43`
  declaram a mesma lista `['cover','scene','coloring','audio']`.
- `appVersion` é constante na sessão.
- **Não há cache** do manifesto global: `resolveInstallIdentity:246` busca a cada invocação.

Logo, o gatilho real é **o manifesto global mudar entre duas resoluções enquanto uma instalação
está em voo** — uma republicação de conteúdo no R2. Baixa frequência, mas é precisamente o modo
de operação para o qual o pipeline híbrido F2 foi construído; não é hipótese de laboratório.
Caminhos **não** afetados: identidade idêntica (joina, sem `beginInstall`), `manifestSha256`
ausente (identidade inadmissível → instala sem registro) e o dono exclusivo `isCancelled`
(`:895`, não passa pela fence).

### 5.6 Bloco corretivo proposto (separado e mínimo) — **aguardando autorização**

**Causa raiz:** os voos são chaveados pela **identidade resolvida de 7 campos**
(`canonicalResolvedKey:276`), mas a autorização é chaveada por **`storyId`**
(`opCounters`, `packInstallRegistry.js:28`). Um `operationId` novo significa duas coisas
diferentes — "houve Reset" e "começou outra instalação" — e a fence não as distingue.

**Menor escopo corretivo:** separar **revogação** de **sucessão**, sem mudar a chave do registro
(a UI observa por `storyId` e esse contrato deve permanecer).

1. `src/services/packInstallRegistry.js` — adicionar um contador de **revogação** por história,
   incrementado **somente** por `clearStoryPackInstall`, e expor uma consulta nova
   (ex.: `isPublishRevoked(storyId, epoch)`). `beginInstall` passa a devolver também o epoch
   corrente. `isCurrentOperation` permanece **inalterado** (continua governando o stale-guard de
   progresso, onde a semântica atual está correta).
2. `src/services/packDownloadService.js` — capturar o epoch no `beginInstall` (`:930`) e trocar
   as **duas** consultas de autorização — `isAuthorizedToPublish` (`:946`, usada em `:641` e
   `:660`) e o joiner-guard `__stillAuth` (`:906`) — de "ainda sou a operação corrente" para
   "não fui revogada".
3. `scripts/smoke.js` — provas novas: G1 (V1/V2/V3) + G1-b, cada uma com controle negativo, e
   as provas de Reset real (`RESET-1`, `RESET-2`, retry) mantidas **verdes** sem alteração.

**Fora do escopo deste corretivo** (registrar, não resolver junto): o diretório da versão
superada (`@2.0.0` no MODO B) fica órfão em disco quando a fence deixa de apagá-lo — coleta de
versões superadas é assunto próprio, com spec e medição próprias.

**Risco de não corrigir:** perda total de um pack completo e validado quando o voo mais novo
falha (V2), desperdício de banda em rede móvel, `reason:'reset'` semanticamente falso para o
chamador, e quebra do single-flight com download duplicado (§5.4).

---

## 6. Fecho do G1 — corretivo `bcfde07` (registro factual, 2026-07-28)

> Bloco **“Correção G1 · Separar revogação de Reset e sucessão concorrente”**, autorizado pelo
> Eduardo como bloco **separado** — **não** é o `01H` e **não** altera a ordem oficial do roadmap.
> Aprovado por ele em 2026-07-28. Este parágrafo é **registro de fato**, não declaração de fecho
> do §10.7.

| # | Fato registrado | Evidência |
|---|---|---|
| 1 | **G1 é defeito de composição** — não é defeito isolado de C, D, E, F, 01F ou 01G-C; nasce do cruzamento entre a chave do voo (identidade resolvida de 7 campos) e a chave da autorização (`storyId`) | §5.1–§5.6 deste documento |
| 2 | **O defeito existia em `fddd1f0`** | interleaving de §5.1 reproduzida contra aquele HEAD |
| 3 | **O corretivo foi criado em `bcfde07`** — *fix(loading): separar reset de sucessão concorrente*; 3 arquivos (`packInstallRegistry.js`, `packDownloadService.js`, `scripts/smoke.js`), 409 inserções, 32 remoções; nenhuma spec, asset ou dependência no commit | `git show --name-status bcfde07` |
| 4 | **G1-A a G1-F passaram** — A (duas identidades concluem), B (A publica, B falha), C (existia `1.0.0`), D (terceiro participante joina), E (Reset real revoga tudo), F (Reset após a publicação) | bloco `LP2.1 G1` em `scripts/smoke.js` |
| 5 | **Oito controles negativos passaram** — NEG-1 `beginInstall` revogando · NEG-2 fence por sucessão · NEG-3 joiner por sucessão · NEG-4 Reset sem revogação · NEG-5 ready global suprimido · NEG-6 `failWith` sem preservação · NEG-7 join desativado · NEG-8 apagar sem Reset. Mutante inerte **estoura** (`loadModule`/`loadPackDownloader`) | mesmo bloco |
| 6 | **Smoke em 3078/3078, 0 falhas** (piso anterior 3038 → **+40 provas**) | `node .\scripts\smoke.js` |
| 7 | **G1 está superado** — o mesmo cenário que confirmou o defeito passa contra `bcfde07`, e cada âncora desfeita derruba a prova correspondente | §6 + controles negativos |
| 8 | **§10.7 continua EM EXECUÇÃO** | este documento não declara conclusão |
| 9 | **G2 a G6 ainda pendentes** na data deste registro | §4 |
| 10 | **Nenhuma validação física nova foi realizada** — todas as provas são comportamentais em harness; o §10.8 (iPhone) segue **pendente** | §12 da spec |
| 11 | **A limpeza de diretórios de versões superadas continua FORA do escopo** — asserida como fora de escopo em `G1-C/5`; permanece dívida com spec e medição próprias | §5.6 |

### 6.1 Modelo implementado — três eixos independentes

| Eixo | Estado | Quem avança | Quem pergunta |
|---|---|---|---|
| **1. Sucessão visual** | `opCounters` / `operationId` | `beginInstall` **e** `clearStoryPackInstall` | stale-guard de progresso, snapshot, `settleError` |
| **2. Revogação explícita** | `revocations` (geração por `storyId`) | **somente** `clearStoryPackInstall` | fence de publicação **e** joiner-guard, via `isFlightRevoked(storyId, geração)` |
| **3. Publicação física** | `notifyReady` | o índice, quando grava de verdade | `PacksContext` por `subscribePackReady` |

O voo **captura** a geração vigente ao nascer, em leitura **síncrona adjacente** ao `beginInstall`
(sem `await` no meio — nenhum Reset se intercala na captura). `settleReady` passou a separar
**snapshot visual** de **evento global**: voo revogado não faz nada; voo apenas **superado** que
publicou de verdade avisa o `PacksContext` **sem** reescrever a tela da tentativa atual; voo
corrente faz os dois. Um settlement por voo ⇒ **no máximo um evento global por publicação física**.

`isCurrentOperation` permaneceu **inalterada** e foi redocumentada como acessor do **eixo 1** —
não governa mais publicação nem join. O retorno público de `beginInstall` **não** mudou.

---

## 7. Retomada da auditoria — G2 e G3 aprovados (2026-07-28)

Executados **um por vez**, na ordem exigida, contra o código de produção de `bcfde07` (nenhum
arquivo de `src/` foi alterado para satisfazer teste algum).

### 7.1 G2 — recovery de órfão com consumidores concorrentes — **APROVADO**

Órfão real: pack **integralmente publicado no disco** (diretório final + marcador construído pelo
`buildPublishMarker` de produção) e **sem entrada READY** no índice — exatamente o que um
encerramento entre `moveAsync` e `setPackEntry` deixa. As rotas de rede do manifesto e das duas
cenas **existem e funcionam**, de modo que "zero downloads" é discriminante e não artefato.

| # | Prova | Resultado |
|---|---|---|
| 1 | O cenário é um órfão de verdade (disco íntegro, índice ausente) | ✅ |
| 2 | A é atendido pelo recovery (`recovered: true`, sem rede de conteúdo) | ✅ |
| 3 | O recovery roda **dentro** da fila física (`runExclusiveByStory`) | ✅ |
| 4 | B entra com o recovery ainda suspenso, e havia **um** recovery | ✅ |
| 5 | Nenhum segundo download físico | ✅ |
| 6 | Nenhum segundo recovery físico | ✅ |
| 7 | A e B convergem para o **mesmo** terminal (identidade de referência) | ✅ |
| 8 | Índice termina READY | ✅ |
| 9 | Registro global coerente (snapshot + entry) | ✅ |
| 10 | **Um único** evento ready global | ✅ |
| 11 | Consumidor montado **depois** recebe o terminal por replay | ✅ |
| 12 | Nada fica eternamente ativo (mapa vazio, sem ouvintes pendurados) | ✅ |
| 13 | Sonda cancelável (`isCancelled`) reaproveita o pack recuperado | ✅ |

**Controles negativos (4/4 reprovaram o mutante, como exigido):** join desativado → conclusão e
ready duplicados; `notifyReady` suprimido → pack recuperado invisível ao `PacksContext`; recovery
devolvendo `recovered:false` → volta a baixar o que já estava no disco; `runExclusiveByStory`
removido de `guardedInstall` → outro voo trabalha o disco durante o recovery.

### 7.2 G3 — Reset com voo compartilhado — **APROVADO**

A cria o voo, B **joina** antes do primeiro evento de progresso; o Reset explícito
(`clearStoryPackInstall` + `clearPackEntry`) cai no checkpoint do `moveAsync` — tudo baixado e
validado, **nada publicado**.

| # | Prova | Resultado |
|---|---|---|
| 1 | A e B no mesmo voo e na mesma identidade (um download só) | ✅ |
| 2 | Os dois recebem progresso (sequências idênticas) | ✅ |
| 3 | O Reset ocorre **durante** o voo | ✅ |
| 4 | A revogação invalida o voo **compartilhado** (`resetInvalidated`) | ✅ |
| 5 | Nenhum participante recebe READY do voo antigo | ✅ |
| 6 | O voo antigo **não publica** | ✅ |
| 7 | Bytes revogados limpos (`localDir` e `.tmp` vazios) | ✅ |
| 8 | Terminal honesto para os dois; ninguém eternamente em progresso | ✅ |
| 9 | O retry cria um voo **novo** | ✅ |
| 10 | Novos consumidores entram no retry | ✅ |
| 11 | **Só o retry** publica | ✅ |
| 12 | **Um único** ready global, vindo do retry | ✅ |
| 13 | Nada fica eternamente ativo | ✅ |
| 14 | Nascendo com o voo revogado **ainda no mapa**, o retry não o joina | ✅ |

**Controles negativos (4/4):** sem join, a revogação passa a atingir cada participante em separado;
a fence relendo a geração **vigente** em vez da **capturada** faz o voo revogado gravar READY; o
joiner-guard sempre autorizando faz o retry herdar o terminal revogado e **nada** ser publicado;
`cleanupRecord` sem liberar a chave deixa voo ativo depois do terminal.

---

## 8. G4 — **DEFEITO DE PRODUÇÃO CONFIRMADO** (parada da auditoria)

> **Regra de parada acionada.** `src/` **não** foi alterado, os cenários G5 e G6 **não** foram
> executados, nada foi indexado nem commitado, e §10.7 **não** é declarado concluído.

### 8.1 Interleaving exata

Duas histórias remotas distintas (`david_goliath` e `jesus_children`), cada uma concluindo sua
instalação e emitindo o READY global real:

| t | Evento |
|---|---|
| 1 | `setPackEntry(david_goliath, READY)` persiste. Índice = `{david_goliath}` |
| 2 | `settleReady` → `notifyReady` → ouvinte do `PacksContext` → **`loadPacks` #1** |
| 3 | `loadPacks` #1 despacha `getPackIndex()`; a leitura fotografa `{david_goliath}` e **fica em voo** |
| 4 | `setPackEntry(jesus_children, READY)` persiste. Índice = `{david_goliath, jesus_children}` |
| 5 | `settleReady` → `notifyReady` → **`loadPacks` #2**, que fotografa `{david_goliath, jesus_children}` |
| 6 | **A leitura #2 conclui primeiro** → `setPackIndex({david_goliath, jesus_children})` |
| 7 | **A leitura #1 (antiga) conclui depois** → `setPackIndex({david_goliath})` |

### 8.2 Esperado × observado

| | |
|---|---|
| **Esperado** | Estado final do contexto com as **duas** histórias READY, **independente** da ordem de conclusão das leituras (item 7 do cenário: "repetir com a ordem oposta deve dar o mesmo estado final") |
| **Observado (ordem natural)** | `["david_goliath:ready","jesus_children:ready"]` ✅ |
| **Observado (ordem invertida)** | `["david_goliath:ready"]` — **`jesus_children` some do estado React** ❌ |
| **Índice persistido (as duas ordens)** | `["david_goliath","jesus_children"]` — o disco está **certo**; quem regride é o estado React |
| **Sintoma para a criança** | Uma história recém-baixada **desaparece da estante** sem erro, sem log e sem sinal — até um refresh posterior |

### 8.3 Arquivos e funções

| Arquivo | Função | Papel no defeito |
|---|---|---|
| `src/context/PacksContext.js` | `loadPacks` (`useCallback`, ~L85–L102) | Faz `await getPackIndex()` e grava `setPackIndex(...)` **sem nenhuma guarda de leitura obsoleta**: a última gravação vence, mesmo vindo da leitura mais antiga |
| `src/context/PacksContext.js` | ouvinte de `subscribePackReady` (~L113–L115) | Cada READY global dispara um `loadPacks` **independente**; dois READY próximos põem duas leituras em voo ao mesmo tempo |
| `src/services/packStorageService.js` | `getPackIndex` (L64) | Leitura **fora** de `runSerialized` — a fila serializada cobre apenas as **mutações** (`setPackEntry`, `clearPackEntry`) |

Contraste interno relevante: o **efeito de reconciliação** do mesmo arquivo (~L141–L152) **já tem**
guarda (`let cancelled = false` + `if (cancelled) return`). `loadPacks` é o único caminho assíncrono
do contexto que grava estado **sem** essa proteção.

### 8.4 Provas e controle (o harness não é tautológico)

O `PacksProvider` executado é o **fonte real** (JSX transpilado, hooks reais). Também são reais
`packStorageService`, `packReconcileService`, `contentManifest` e o registro global. Dublados apenas
React (fronteira de framework), AsyncStorage e FileSystem (fronteiras de mundo). A **única** variável
do experimento é a ordem de conclusão das leituras.

| Prova | Resultado |
|---|---|
| G4/1 duas histórias remotas distintas, as duas READY no índice | ✅ |
| G4/2 cada READY global dispara sua própria leitura (duas em voo) | ✅ |
| G4/3 a leitura #1 é comprovadamente **antiga** (fotografou só uma história) | ✅ |
| G4/4 **ordem natural** → as duas no estado React | ✅ (o harness sabe produzir o estado correto) |
| G4/5 a inversão é real (a antiga conclui por último) | ✅ |
| G4/6 **ordem invertida** → nenhuma história some | ❌ **REPROVADO** |
| G4/7 sem regressão a snapshot antigo do índice | ❌ **REPROVADO** |
| G4/8 ordem oposta → mesmo estado final | ❌ **REPROVADO** |
| **CTRL** a **mesma** inversão sobre um mutante com guarda de geração em `loadPacks` | ✅ **passa** |

O controle é o que fecha o diagnóstico: a inversão imposta é **sobrevivível**. Uma implementação com
guarda passa; a atual não. A reprovação é da produção, não do harness.

### 8.5 Alcance real em produção (honesto)

A inversão foi **imposta pelo harness**; ela **não** foi observada no runtime real. Hoje
`AsyncStorage.getItem` é despachado em fila serial nativa (fila de método única no iOS, executor
serial no Android), de modo que a ordem de conclusão normalmente acompanha a ordem de despacho.

O defeito é, portanto, de **robustez**: a correção do `PacksContext` depende de uma garantia de
ordenação **externa, de terceiro e não documentada** — não de nada que o app controle. O modo de
falha é **silencioso** (história some da estante, sem erro nem log). O mesmo `loadPacks` já é
chamado por **dois caminhos distintos** (`refreshPacks` das telas e o ouvinte de READY global), o
que torna a corrida entre invocações um fato corrente, e não hipotético.

### 8.6 Corretivo proposto — separado e mínimo — **AUTORIZADO E APLICADO** (ver §9)

Três linhas em `src/context/PacksContext.js`, sem tocar em nenhum outro arquivo, sem dependência
nova, sem mudar assinatura pública e sem alterar o comportamento de caminho feliz:

1. Um contador de geração por provider (`useRef`) incrementado no início de `loadPacks`.
2. Guardar `setPackIndex` (e o `setPacksError`/`setIsLoadingPacks` do mesmo ciclo) atrás de
   "esta ainda é a leitura mais recente?".
3. Comentário registrando **por que** a guarda existe.

É exatamente a forma já usada pelo efeito de reconciliação do mesmo arquivo — extensão do padrão
existente, não paralelo novo. Os checks `G4/6`, `G4/7` e `G4/8` já escritos viram o **teste de
regressão** do corretivo: hoje vermelhos, verdes depois da correção.

> **Estado do smoke enquanto o corretivo não foi autorizado:** `scripts/smoke.js` ficou **vermelho de
> propósito** (3 falhas em 3122/3125), registrando o defeito. A saída desse estado foi capturada
> **fora do repositório**, em diretório temporário da máquina, antes de qualquer edição — evidência
> local de apoio, **não versionada** e não necessária para reproduzir: o mesmo vermelho se obtém
> revertendo `746c1f3` e rodando `node scripts/smoke.js`.

---

## 9. Fecho do G4 — corretivo `746c1f3` (registro factual, 2026-07-28)

Bloco corretivo separado autorizado pelo responsável. **Commit local `746c1f3`, sem push.**
Produção alterada: **somente** `src/context/PacksContext.js` (37 linhas, +34/−3). `scripts/smoke.js`
recebeu apenas adições (888 inserções, **0 remoções** — nenhum check existente removido ou
enfraquecido). G5 e G6 **não** foram executados; §10.7 **não** é declarado concluído.

### 9.1 Modelo implementado — guarda de geração por instância

| Eixo | Implementação | Por que assim |
|---|---|---|
| Identidade da leitura | `loadGenRef` (`useRef`), incrementado **sincronamente antes** do `await` | O `useRef` sobrevive ao render e morre com a instância; o incremento síncrono impede qualquer evento entre a captura e o despacho |
| Autoridade de escrita | `isCurrent() = mountedRef.current && gen === loadGenRef.current`, consultado em **toda** escrita de estado | `setPackIndex`, `setPacksError` e `setIsLoadingPacks` são estado; nenhuma leitura obsoleta pode gravar nem anunciar "terminou" |
| Descarte | `if (!isCurrent()) return;` após o `await` | A leitura antiga é **descartada**, não mesclada |
| Substituição, nunca merge | `setPackIndex(index …)` recebe o snapshot **completo** | Remoções, resets e FAILED continuam refletidos — um merge os mascararia |
| Desmontagem | `mountedRef` + efeito StrictMode-safe (`true` no setup, `false` no cleanup) | Leitura em voo quando o provider morre não escreve estado |
| Ponto único | A guarda vive na função central `loadPacks` | Carga inicial, ouvinte de READY global e `refreshPacks` herdam a proteção sem duplicação |

**Fora do escopo por decisão explícita:** `packStorageService` não foi tocado; a escrita do índice
não mudou; nenhuma leitura foi serializada; nenhum evento READY foi suprimido; nada de debounce,
`setTimeout` ou mutex; nenhuma dependência nova. O índice persistido segue como fonte de verdade.

### 9.2 Provas integradas ao smoke (3149/3149, 0 falhas)

| Prova | O que fixa |
|---|---|
| `G4-A/1…5` | Ordem natural: duas leituras em voo, conclusão na ordem de despacho, estado com as duas |
| `G4-B/1…7` | Ordem **invertida** (o cenário que reprovava): a leitura antiga **não** sobrescreve a nova; estado final idêntico ao da ordem natural |
| `G4-C/1…5` | Remoção real (`clearPackEntry`) **não** é mascarada; `C/1b` prova que o estado continha as duas antes da remoção — logo havia o que mascarar |
| `G4-D/1…4` | **Três** leituras concorrentes, conclusão fora de ordem: só a geração mais recente grava |
| `G4-E/1…5` | Provider desmontado com leitura em voo: **0** escritas React após o cleanup e ouvinte de READY de volta ao baseline |
| `G4-F/1…6` | **Dois** ready-events globais emitidos e **duas** leituras disparadas — a convergência vem do descarte, não da redução de eventos |
| `G4 REFRESH` | A **mesma** inversão pelo caminho `refreshPacks` sobrevive — todos os chamadores herdam a guarda |
| `G4 ANTITAUTOLOGIA` | As 7 âncoras dos controles existem no fonte e âncora ausente **lança** |

### 9.3 Controles negativos (8, todos reprovaram como devido)

`NEG-1` sem comparação de geração · `NEG-2` geração capturada depois do await · `NEG-3` geração
local recriada a cada chamada · `NEG-4` guarda só no ouvinte READY (o ouvinte passa, **`refreshPacks`
volta a perder história**) · `NEG-5` merge no lugar de substituição · `NEG-6` sem guard de
desmontagem · `NEG-7` aceitar geração menor ou igual · `NEG-8` leitura obsoleta gravando no
`finally`. Cada mutante altera uma âncora real do fonte de produção.

### 9.4 Gates

`git diff --check` limpo · smoke **3149/3149, 0 falhas** (piso exigido 3125) · parse Babel com a
config real do projeto · imports relativos resolvem · nenhuma dependência externa nova ·
`npm run assets:guard` OK · `npx expo-doctor` **17/18** (única falha = drift conhecido
`expo@54.0.35` vs catálogo `~54.0.36`) · sem segredos, sem `console`/`debugger`/`setTimeout` novos ·
sem arquivos pessoais · `packInstallRegistry`, `packStorageService`, `packDownloadService`,
`StorySceneVisual` e `assets/` intocados.

> **Alcance honesto (não muda §8.5):** a inversão continua imposta pelo harness. O que o corretivo
> remove é a **dependência** de uma garantia de ordenação externa e não documentada — não uma falha
> observada em dispositivo. A validação física do G4 **não** foi executada.

### 9.5 Registro factual consolidado do G4 (2026-07-28)

| # | Fato | Estado |
|---|---|---|
| 1 | Defeito G4 **confirmado** contra a produção de `bcfde07` | ✅ registrado (§8) |
| 2 | Corretivo criado em **`746c1f3`** (commit separado e mínimo) | ✅ aprovado pelo responsável e **publicado** em `origin/fix/loading-performance-foundation` |
| 3 | `G4-A` a `G4-F` | ✅ **aprovados** |
| 4 | **Oito** controles negativos (`NEG-1`…`NEG-8`) | ✅ **aprovados** (todos reprovaram como devido) |
| 5 | Smoke | ✅ **3149/3149, 0 falhas** |
| 6 | Ordem **invertida** de conclusão das leituras | ✅ **corrigida** — mesmo estado final da ordem natural |
| 7 | Remoções e resets | ✅ **não mascarados** (substituição, nunca merge) |
| 8 | Provider desmontado | ✅ **nenhuma escrita tardia** (0 `setState` após o cleanup) |
| 9 | Dois READY globais | ✅ **preservados** (2 eventos → 2 leituras; nada suprimido) |
| 10 | **G4 superado** | ✅ |
| 11 | **G5 e G6** | 🟡 **ainda pendentes** |
| 12 | **§10.7** | 🟡 **continua EM EXECUÇÃO — não concluído** |

> O `746c1f3` é o **único** commit de produção do G4 e **não** contém artefatos documentais. Os
> arquivos desta auditoria seguem **fora** do stage até o commit de fechamento do bloco.

---

## 10. G5 — saída durante a publicação — **APROVADO** (2026-07-28)

Executado contra a produção de **`746c1f3`**, sem alterar nenhum arquivo de `src/`.

### 10.1 Interleaving

Checkpoint colocado **logo após o `moveAsync` e antes da escrita do índice READY** — a janela mais
estreita e mais perigosa do fluxo, em que o conteúdo já está publicado no disco mas ainda não existe
entrada `ready`. Nesse instante, o participante **A** aborta o próprio `participantSignal`
(equivalente ao unmount do componente) enquanto **B** permanece no mesmo voo.

### 10.2 Resultado

| # | Invariante | Estado |
|---|---|---|
| 1 | A e B ocupam **um** voo e resolvem o **mesmo objeto** de resultado | ✅ |
| 2 | A saída de A remove **só** o subscriber de A; o signal de B segue ativo | ✅ |
| 3 | O voo **físico** continua — nenhum trabalho de rede ou disco é repetido | ✅ |
| 4 | A **não recebe nada** após o cleanup (zero callbacks, zero escritas de estado) | ✅ |
| 5 | B recebe o **terminal** (`ready`) | ✅ |
| 6 | Índice termina `ready`; registro converge para o mesmo snapshot | ✅ |
| 7 | READY global **exatamente uma vez** | ✅ |
| 8 | `PacksContext` recarrega e `isPackReady` responde `true` | ✅ |
| 9 | Consumidor **C**, montado depois, recebe **replay do terminal** | ✅ |
| 10 | A saída de A **não** altera a identidade do voo nem a geração de **revogação** | ✅ |
| 11 | A saída de A **não** é interpretada como Reset — nada é desfeito | ✅ |
| 12 | Mapa de voos vazio e nenhuma fase intermediária presa ao final | ✅ |
| 13 | **Terminal honesto no erro**: B recebe a falha, nada é publicado, nenhum READY global | ✅ |

**BASELINE adicional:** a mesma saída **dentro** da janela cancelável (antes do último
`throwIfCancelled`) também publica para B — a saída de um observador nunca vira cancelamento.

### 10.3 Controles negativos (8, todos reprovaram como devido)

`NEG-1` abort de A cancela o voo físico · `NEG-2` cleanup de A remove também B · `NEG-3` voo termina
sem notificar B · `NEG-4` listener de A permanece após o cleanup · `NEG-5` replay para C removido ·
`NEG-6` READY global emitido duas vezes · `NEG-7` a saída de A incrementa a revogação ·
`NEG-8` mapa de voo não é limpo após o settle.

**Antitautologia:** as 8 âncoras dos mutantes foram verificadas caractere a caractere contra o fonte
e uma âncora falsa **lança** — um controle que deixou de corresponder ao código não passa despercebido.

**Smoke após o G5:** **3181/3181, 0 falhas** (piso 3149) — 32 checks novos.

---

## 11. G6 — chamador cancelável × voo compartilhado — **APROVADO** (2026-07-28)

Executado contra a produção de **`746c1f3`**, sem alterar nenhum arquivo de `src/`.

### 11.1 Auditoria read-only do contrato real (feita ANTES de escrever qualquer prova)

O comportamento esperado foi **derivado do código**, não inventado:

| # | Pergunta | Resposta observada no fonte |
|---|---|---|
| 1 | Onde `isCancelled` é recebido | `…Impl` (`packDownloadService.js:399`); consumido em 469, 484, 560, 580 e **618** |
| 2 | Quando o caminho de dono exclusivo é usado | L895 — `typeof params.isCancelled === 'function'` → `guardedInstall(resolved, params)` com params **crus** |
| 3 | Quando `participantSignal` é usado | Só em `registerProgressSubscriber` (joiner L914, criador L952) |
| 4 | Quando uma chamada entra em `inFlightInstalls` | Só na L960, e só o **criador não-cancelável** com chave admissível |
| 5 | Quando passa direto a `guardedInstall` | Cancelável (L895) e identidade inadmissível (L898) |
| 6 | Como a fila interage com os dois caminhos | `runExclusiveByStory` é atravessada por **todos**; fila por `storyId`, compartilhamento por identidade resolvida → os dois **serializam** |
| 7 | Se um cancelável encontra voo existente | **Não** — o `return` da L895 precede o `get`. Ele **enfileira** |
| 8 | Se um voo iniciado pelo cancelável recebe joiner | **Não** — nunca entra no mapa |
| 9 | Retorno esperado do cancelado | `{ ok:false, cancelled:true, reason:'cancelado' }`, só o `.tmp` apagado, índice **intocado** |
| 10 | Terminal dos não-cancelados | `{ ok:true, …, entry }` + `report(READY)` + `settleReady` |

**Conclusão da auditoria:** o contrato real **permite composição segura** — a regra de parada do G6
**não** disparou. O elo que sustenta "nenhum download físico duplicado" **não** é um join: é o
**preflight READ-ONLY** (L409-425), que reavalia o disco quando a vez do cancelável chega e devolve
`asReadyEntry` sem baixar, sem mover e sem escrever índice.

### 11.2 Cenários

| Cenário | Situação | Estado |
|---|---|---|
| **G6-A** | O voo compartilhado **já existe**; o cancelável pede a mesma identidade e é cancelado durante a publicação | ✅ 10/10 |
| **G6-B** | O **cancelável começa primeiro**; A entra depois e B joina A; o cancelável morre | ✅ 10/10 |
| **G6-C** | **Identidade incompatível**: voo de V1 ativo, cancelável e comum pedem V2 | ✅ 7/7 |
| **G6-D** | Cancelado **antes** do trabalho físico (sozinho na fila **e** com voo compartilhado vivo) | ✅ 7/7 |
| **G6-E** | Cancelado **durante a espera** na fila física | ✅ 6/6 |

Fatos medidos que sustentam os invariantes exigidos: o cancelável **nunca** aparece em
`inFlightInstallCount()`; cada URL da identidade é baixada **uma** vez; **um** `moveAsync` e **uma**
escrita de índice por publicação real; **um** READY global por publicação física (dois quando há duas
publicações legítimas, V1 e V2, na ordem); manifesto e os quatro *kinds* de **ambas** as identidades
íntegros no disco ao final; mapa de voos e ouvintes do registro vazios.

### 11.3 Controles negativos (8, todos reprovaram como devido)

| # | Mutante | Cenário que o derruba |
|---|---|---|
| 1 | `isCancelled` mata o voo compartilhado (o cancelável vira criador) | G6-B |
| 2 | Chamador compatível cria voo duplicado (`existing = null`) | G6-A |
| 3 | Chamador incompatível faz join (identidade colapsada em `storyId`) | G6-C/E |
| 4 | Chamador cancelado publica índice (`failWith` no lugar do retorno limpo) | G6-D |
| 5 | Chamador cancelado emite READY global (`beginInstall`/`settleReady`) | G6-D |
| 6 | Cancelamento apaga bytes válidos de outro voo (cancelável **fora** da fila física) | G6-B |
| 7 | Cancelamento deixa a fila bloqueada (corrente nunca liberada) | G6-C/E |
| 8 | Cancelamento de um revoga os outros (`clearStoryPackInstall` no cancelamento) | G6-C/E |

**Antitautologia:** as 5 âncoras reais usadas pelos mutantes (desvio do dono exclusivo, consulta do
mapa de voos, canonicalização dos 7 campos da identidade, retorno terminal do cancelamento e
liberação da corrente da fila) foram conferidas contra o fonte; uma âncora falsa **lança**.

### 11.4 Duas correções de **desenho de prova** (nenhuma em `src/`)

Registradas por honestidade metodológica — as duas primeiras execuções do G6 reprovaram por erro
**meu**, não por defeito de produção:

1. **Limite de espera por relógio de parede.** A cauda **síncrona** do próprio smoke bloqueia o event
   loop por ~19 s, e o primeiro `await` do bloco G6 media esse bloqueio, não a instalação. O limite
   passou a contar **ticks do event loop**: uma promessa pendurada continua sendo detectada (é dela
   que o `NEG-7` depende), mas uma instalação viva deixa de ser reprovada por lentidão do harness.
2. **Instante de medição no G6-D.** O `delete` de limpeza do `.tmp` **do próprio cancelado** dispara
   o checkpoint do harness; a medição do mapa de voos acontecia depois disso. Passou a ser feita
   exatamente enquanto o cancelável executa **sozinho** — que é o instante em que a pergunta "o dono
   exclusivo entrou no mapa?" tem sentido.

### 11.5 Alcance honesto

**Nenhum call site de produção passa `isCancelled` hoje** (`grep` em `src/` devolve apenas o próprio
`packDownloadService.js`). O G6 prova o **contrato público** — a composição que qualquer consumidor
futuro encontraria —, e **não** uma regressão observada em tela. Como no G4, o interleaving é
**imposto pelo harness**.

**Ponto de não-retorno (comportamento intencional, registrado):** o último `throwIfCancelled` está na
L618, **antes** do swap (L634-635). Um cancelamento pedido depois disso **não** impede a publicação —
o pack é publicado e o chamador recebe `ok:true`. É deliberado: evita meia-publicação e índice
inconsistente. Quem cancela recebe um retorno **honesto** do que de fato aconteceu.

**Smoke após o G6:** **3231/3231, 0 falhas** — 50 checks novos.

---

## 12. Revisão adversarial (2026-07-28)

Tentativa deliberada de **refutar** as dez afirmações da auditoria, lendo o código real e as provas.
Nenhuma foi refutada; três observações residuais foram registradas como comportamento documentado.

| # | Afirmação atacada | Veredito | Base |
|---|---|---|---|
| 1 | Unmount remove **apenas** o participante correto | ✅ sustentada | `record.subscribers` é `Map` chaveado por `Symbol` **por chamada** (L821); `removeProgressSubscriber` deleta por id e cada `detach` remove **o próprio** handler do **próprio** signal |
| 2 | Um voo físico compartilhado **sobrevive** à saída de um participante | ✅ sustentada | `participantSignal` não toca o físico (L784-790); zero subscribers não cancela; `internalParams` espalha `params`, mas um `isCancelled` **nunca** chega ali (a L895 retorna antes) — G5/6, G6-A/4, G6-B/4 |
| 3 | Nenhum callback chega a componente desmontado | ⚠️ sustentada **com ressalva** | `emitProgress` itera uma **fotografia** (L763): um participante removido **durante** o fan-out ainda pode receber aquele evento em voo. O hook não escreve estado nessa janela — `generationRef` já foi incrementada no cleanup (L81) e `isCurrentExecution()` barra o `onProgress` (L116). Defesa em profundidade, sem defeito |
| 4 | Replay terminal funciona | ✅ sustentada | Joiner tardio recebe `replayLatestProgress`; se o record já settled, ele **não existe mais no mapa** (`cleanupRecord` marca e remove na mesma função síncrona, L774-781) e o consumidor recebe o terminal pelo registro — G5/13 |
| 5 | `isCancelled` **não invade** o contrato de `participantSignal` | ✅ sustentada | Os dois caminhos não se cruzam: `participantSignal` só é lido por `registerProgressSubscriber`, que o caminho cancelável nunca chama — G6 NEG-1, NEG-5, NEG-6 |
| 6 | Identidade compatível **não duplica** voo | ✅ sustentada | `canonicalResolvedKey` serializa 7 campos; G6-A/1-3 e NEG-2 |
| 7 | Identidade incompatível **não faz** join | ✅ sustentada | G6-C/2 e NEG-3 (colapsar a chave em `storyId` derruba a prova) |
| 8 | Cancelamento **não publica** | ⚠️ sustentada **com ressalva** | O catch do cancelamento apaga só o `.tmp` e não toca o índice (L676-679) — G6-D/3-4, NEG-4. **Ressalva:** cancelar **depois** da L618 não impede a publicação (ver §11.5) |
| 9 | Erro **sempre** chega a terminal | ✅ sustentada | `failWith` → `report(FAILED)` → `settleError`; o settlement do criador trata resultado **e** rejeição (L966-969) e `res` ausente cai no ramo de erro — G5/21 |
| 10 | Mapas, listeners e filas são liberados | ✅ sustentada | `cleanupRecord` no `finally` só apaga a **própria** chave (L781, correção G1); a corrente da fila se autolimpa sob a mesma comparação de identidade (L862) — G5/15, G6-A/10, G6-E/6 |

**Terceira observação residual:** as dez afirmações valem para o **contrato público**. O alcance
prático de 5 e 8 é hoje teórico, porque nenhum consumidor de produção passa `isCancelled` (§11.5).

---

## 13. Fechamento do §10.7 (2026-07-28)

### 13.1 Registro factual consolidado da matriz integrada

| # | Fato | Estado |
|---|---|---|
| 1 | **G1** — defeito **encontrado** e **corrigido** | ✅ corretivo em **`bcfde07`** (§5, §6) |
| 2 | **G2** — recovery de órfão com consumidores | ✅ **aprovado** (§7.1) |
| 3 | **G3** — Reset com voo compartilhado | ✅ **aprovado** (§7.2) |
| 4 | **G4** — defeito **encontrado** e **corrigido** | ✅ corretivo em **`746c1f3`** (§8, §9) — publicado no remoto |
| 5 | **G5** — saída durante a publicação | ✅ **aprovado** (§10) |
| 6 | **G6** — chamador cancelável × voo compartilhado | ✅ **aprovado** (§11) |
| 7 | **Controles negativos** de todos os cenários | ✅ G1-G4 conforme §§5-9 · **G5: 8/8** · **G6: 8/8** — todos reprovaram como devido, com antitautologia verificada |
| 8 | **Smoke final** | ✅ **3231/3231, 0 falhas** (piso exigido 3149) |
| 9 | **Alteração de produção no commit de fechamento** | ✅ **nenhuma** — o commit da auditoria não contém arquivo de `src/` |
| 10 | **§10.7 — matriz integrada de concorrência** | ✅ **CONCLUÍDO** |
| 11 | **§10.8** | 🟡 **PENDENTE** — não iniciado por este bloco |
| 12 | Revisão adversarial das 10 afirmações | ✅ executada (§12) — nenhuma refutada |

### 13.2 Validações físicas

| Situação | Estado |
|---|---|
| Já realizadas | Nenhuma **para esta auditoria**. Os cenários G1-G6 são provas de **composição** executadas em harness determinístico. |
| Ainda pendentes | Validação em dispositivo físico dos corretivos **`bcfde07`** (identidade divergente) e **`746c1f3`** (dois READY concorrentes): instalar duas histórias em sequência rápida e conferir que **ambas** permanecem na estante; Reset seguido de retry; e saída de tela durante uma instalação em curso. |

Nenhum interleaving desta auditoria foi observado em runtime real — todos foram **impostos pelo
harness**. O que os corretivos removem é a **dependência** de garantias de ordenação externas e não
documentadas (§8.5, §9.4).

### 13.3 Dívidas registradas, fora do escopo deste bloco

Ficam **registradas**, e **não** se convertem em blocos novos:

1. `expo-doctor` permanece **17/18** pelo drift conhecido `expo@54.0.35` × catálogo `~54.0.36`.
2. Nenhum consumidor de produção usa `isCancelled`; o contrato existe e está provado, mas sem uso vivo.
3. A janela de reentrância do fan-out (§12, item 3) é segura hoje **por defesa em profundidade** no
   hook, não por construção do serviço.
4. A publicação **não é cancelável** após a L618 (§11.5) — intencional e agora documentado.

> **Este bloco não declara o fechamento da trilha.** Ele fecha **apenas** o §10.7. O §10.8 segue
> pendente e as validações físicas de §13.2 continuam em aberto.

---

## 14. Ponteiro de fechamento (2026-07-30)

O **§10.8 foi concluído** em 2026-07-29 (build interno iOS `preview-criador` instalado sem Metro) e a
trilha foi encerrada em 2026-07-30 — ver [`RELATORIO_FECHAMENTO_LP.md`](./RELATORIO_FECHAMENTO_LP.md)
e `spec.md` §13/§17.

**As três validações físicas do §13.2 continuam em aberto.** A validação de 2026-07-29 cobriu boot
offline, shell global, Modo Criador, premium, preparação real de órfão, recovery `RECOVERY_APPROVED`
(12/12) e história completa offline — **não** cobriu instalação de duas histórias em sequência rápida,
Reset seguido de retry, nem saída de tela durante uma instalação em curso.

Classificação no fechamento: **dívida não bloqueante D4**. Os corretivos `bcfde07` e `746c1f3` seguem
provados em harness comportamental (G1: 27 provas; G4: 27; G5: 24), com controles negativos e
antitautologia. O risco coberto é de **regressão**, não de defeito conhecido em aberto — por isso não
bloqueia a integração do Colorir com o Beni e **não deve** ser convertido em bloco novo.
