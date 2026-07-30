# Relatório de Fechamento — Trilha Loading / Performance (LP1 + LP2 + LP2.1)

> **Natureza deste documento:** relatório técnico consolidado de fechamento. **Não** é spec, **não**
> é plano e **não** redefine o Roteiro Mestre. Precedência inalterada:
> `docs/PROJECT_SOURCE_OF_TRUTH.md` → `.specify/memory/constitution.md` → `AGENTS.md` → `CLAUDE.md`
> → spec → plan → tasks.
>
> **Data:** 2026-07-30 · **Branch:** `fix/loading-performance-foundation` · **HEAD:** `26d2b57`
> **Janela auditada:** `67fa172` (2026-07-16) … `26d2b57` (2026-07-29) = **37 commits**
> **Estado de publicação:** os **4 commits finais** (`945400b`, `ba396d1`, `d4db2ed`, `26d2b57`)
> são **locais**; `origin/fix/loading-performance-foundation` está em `eb871f5`. **Nenhum push.**

---

## 1. Decisão de fechamento

> ## **TRILHA ENCERRADA COM DÍVIDAS NÃO BLOQUEANTES**

A trilha loading/performance está **encerrada**. Os defeitos que a originaram foram eliminados,
os contratos foram escritos no código, provados por suíte comportamental e **validados fisicamente**
em build interno iOS `preview-criador` instalado sem Metro.

**Nenhuma nova investigação de loading/performance deve ser aberta antes da integração do
Colorir com o Beni.** As dívidas listadas na §7 são **registro**, não backlog ativo: nenhuma delas
bloqueia a próxima integração, e nenhuma deve ser convertida em projeto sem decisão explícita do
fundador.

**O que o fechamento NÃO declara:**

- **Não** declara a §14 da spec ("análise global de gargalos") executada — ela continua **não iniciada**
  e permanece fora de escopo.
- **Não** declara desempenho **medido**. A trilha corrigiu *correção* de carregamento, não *velocidade*
  medida. Ver dívida **D1**.
- **Não** declara prontidão de loja. Os bloqueadores de lançamento (§7, R5–R7, R17, R20) permanecem
  abertos e pertencem às Fases 2, 10, 12 e 13 do Roteiro Mestre.

---

## 2. Escopo consolidado da trilha

32 blocos executáveis, reconstruídos a partir do histórico Git **e confirmados no código atual**
(o nome do commit não foi tratado como prova).

| # | Bloco | Commits | Estado no código |
|---|---|---|---|
| 1 | **LP1A** — boot à prova de falhas (`fontError`, teto de espera, rota de boot pura, fire-and-forget com rejeição tratada) | `67fa172` | ativo |
| 2 | **LP1M-A** — instrumentação local do boot (t0 → primeiro layout) | `72fa5ee` | ativo |
| 3 | **LP1M-B** — amostra reproduzível + agregador local de baseline | `33fdc19`, `b94734e` | ativo |
| 4 | **LP2 PK-01** — single-flight de instalação de pack | `6466c75`, `b2ba305`, `090a928` | ativo (chave superada por `canonicalResolvedKey`; `packInstallKey` permanece exportada — dívida **D5**) |
| 5 | **LP2 PK-02** — fila serializada de mutação do índice | `6466c75` | ativo |
| 6 | **LP2.1a-i** — reconciliação índice × disco (só em memória) | `6c098f6` | ativo |
| 7 | **LP2.1a-iR2** — `failWith` só preserva READY com evidência de disco | `824aec1`, `478b0a5` | ativo |
| 8 | **LP2.1a-ii-A** — seam de injeção + harness + prova da instalação válida | `1c84773` | ativo |
| 9 | **LP2.1a-ii-B** — reinstalação segura + rejeições durante download/validação | `ead7f18` | ativo |
| 10 | **LP2.1a-ii-BR** — contrato de limpeza do `errorMessage` no índice | `3485b95` | ativo |
| 11 | **LP2.1a-ii-C** — recovery de publicação interrompida + marcador `.ptf-publish.json` | `82362e6`, `0e049f9`, `0d3ee57` | ativo |
| 12 | **LP2.1a-ii-C-QA3R** — fidelidade dos doubles ao contrato real do SDK 54 | `0b009d1` … `d26330b` (6) | ativo |
| 13 | **DEVICE-TOOLS1** — Laboratório de Recovery (presets sintéticos P1–P6) | `4ebe639` | ativo |
| 14 | **LP2.1a-ii-D** — identidade resolvida (resolve-first), D1/D2/D3 | `090a928` | ativo |
| 15 | **LP2.1a-ii-E** — progresso compartilhado (fan-out, replay, monotonicidade) | `d5a46c1` | ativo |
| 16 | **LP2.1a-ii-F** — cancelamento de observadores e ciclo de vida | `6cf799c` | ativo |
| 17 | **LP2.1a-ii-01F** — registro global observável + propagação de READY | `fddd1f0` | ativo |
| 18 | **FIX1R** — cerca de publicação por revogação, desfazer READY, fonte única de progresso | `fddd1f0` | ativo |
| 19 | **LP2.1a-ii-01G-C** — capa estável durante o download (anti-piscar) | `fddd1f0` | ativo |
| 20 | **G1** — separar revogação (Reset) de sucessão de identidades | `bcfde07` | ativo (**defeito real corrigido**) |
| 21 | **G2** — recovery de órfão com consumidores concorrentes | `138f738` | ativo (aprovado) |
| 22 | **G3** — Reset com voo compartilhado | `138f738` | ativo (aprovado) |
| 23 | **G4** — guarda de geração de leitura no `PacksContext` | `746c1f3` | ativo (**defeito real corrigido**) |
| 24 | **G5** — saída durante a publicação com participante remanescente | `138f738` | ativo (aprovado) |
| 25 | **G6** — chamador cancelável × voo compartilhado | `138f738` | ativo (aprovado) |
| 26 | **P7** — laboratório de recovery **REAL** exercitado pelo preflight público | `eb871f5`, `26d2b57` | ativo |
| 27 | **B1** — envelope de publicação das rotas criadoras | `d4db2ed` | ativo |
| 28 | **B2** — cobertura P8 (rede indisponível, saídas antecipadas, concorrência, revogação, reinício realista) | `d4db2ed` | ativo |
| 29 | **B3** — diagnóstico do P7 autocontido e resistente a reinício | `26d2b57` | ativo |
| 30 | **B4** — perfil EAS `preview-criador` + gate quíntuplo do Modo Criador | `ba396d1` | ativo |
| 31 | **IOS-CFG** — normalização da config iOS (criptografia e Privacy Manifest) | `945400b` | ativo |
| 32 | **LP2.1-GOV-01** — governança documental da trilha | `00c2d44`, `5213688`, `2b902d3` | parcial (ver D2) |

### 2.1 Eixos que a trilha **não** tocou (registro honesto)

Verificado por `git diff --name-only 67fa172~1..HEAD`:

- **Warmups e preloaders:** `assetPreloadService.js`, `beniAssetWarmup.js`, `onboardingAssetWarmup.js`
  e `paresImagePreload.js` **não foram tocados**. O único toque foi o tratamento de rejeição de
  `preloadCriticalAssets()` em `App.js` (LP1A).
- **Fallbacks visuais:** `mediaReadyService.js`, `contentResolver.js`, `storyImageService.js`,
  `SafeImage` e `StoryFallback` **não foram tocados**. Os efeitos nesse eixo foram indiretos
  (preservação de READY com evidência de disco, recomposição de `localDir` em `PacksContext`,
  anti-piscar da capa).
- **Rótulos que não existem:** não há bloco `B0`, `01H`, `E2` nem `F2` na suíte. `P8` é rótulo de
  provas (`smoke.js:16868+`), **não** preset do laboratório (que tem P1–P6 e a seção P7).

---

## 3. Arquitetura final — 18 camadas

Fluxo completo: tela → hook → contexto → downloader público → resolução → identidade → single-flight
→ fila física → download → verificação → publicação → índice → marcador → registro → notificação →
UI → reabertura offline → recovery pós-reinício.

| # | Camada | Arquivo responsável | Contrato (resumo) | Estado | Provas |
|---|---|---|---|---|---|
| 1 | Tela | `src/screens/StoryDetailScreen.js` | Bloco de download só sob `canAccess && isRemote && !isComingSoon && sequenceUnlocked`; a tela renderiza **só** de `uiState`/`progress` — nunca importa a camada `pack*` | volátil | 2B.6, F2.1b |
| 2 | Hook (entrada) | `src/hooks/useStoryPackDownload.js` | Uma execução por vez (`busyRef`); cada execução dona da própria geração e `AbortController`; setters obsoletos descartados | ambos | F1 `F-HOOK-01..05` |
| 3 | Contexto | `src/context/PacksContext.js` | **Read-only**: não baixa, não instala, não grava índice. `localDir` **recomposto** por `(storyId, version)` — o `file://` persistido é ignorado (o UUID do container iOS muda) | ambos | G4-A…G4-D (27) |
| 4 | Downloader público | `src/services/packDownloadService.js` | Uma resolução de identidade por invocação; fase física não rebusca o manifesto; toda rota criadora abre **uma** operação e publica **um** desfecho | ambos | P8-1…P8-14 |
| 5 | Resolução do manifesto global | `packDownloadService.js` + `globalManifestService.js` | Um `fetch` do `content-manifest.json` por invocação; **gate de rede explícito** — só `/rede indispon[íi]vel|timeout/` marca `networkError`; manifesto inválido **não** é "offline" | sem estado | D-ID-11, D-ID-22, B3-6, B3-N03 |
| 6 | Identidade canônica | `packDownloadService.js:276` | `JSON.stringify([storyId, version, baseUrl, manifestPath, manifestSha256, kinds, appVersion])`; kinds filtrados por `KNOWN_KINDS`, ordenados, **sem dedup**; `manifestSha256` obrigatório (64-hex) ou a chave é `null` | sem estado | D1 `D-ID-03/04`, D2, D3 |
| 7 | Single-flight | `packDownloadService.js` | Mesma identidade ⇒ **mesma Promise**; fan-out com cópia própria do snapshot; replay ao joiner tardio; joiner **não** abre operação nem republica READY; chave liberada no `finally` | volátil | PK-01, G6-A/3, §ATOMIC, §FINALLY-ANTIGO |
| 8 | Fila física por história | `packDownloadService.js:855` (`storyInstallChains` em `:853`) | `runExclusiveByStory` — duas identidades da **mesma** história nunca executam juntas (mesmo `.tmp`); histórias diferentes em paralelo; a corrente **nunca** carrega rejeição | volátil | PK-01 (comportamental), G2/3, P7-16 |
| 9 | Download | `packDownloadService.js` | `.tmp` limpo → manifest → âncora sha256 **dos bytes** antes do parse → schema/minAppVersion → kinds obrigatórios → path seguro → sha256 por arquivo | ambos | A §8.1–§8.4b, B §6.x |
| 10 | Verificação | `packIntegrityService.js`, `packManifestService.js` | Âncora obrigatória; existência + bytes + sha256 **real** (`@noble/hashes`) por arquivo; rejeita path traversal e o nome reservado do marcador; `failWith` apaga `.tmp` e **preserva** READY anterior válido | sem estado | §8.4a, §15/MUT_B (10 mutantes) |
| 11 | Publicação | `packDownloadService.js:609-635` | Marcador escrito **no `.tmp`, depois de toda a validação e antes do move** — o mesmo `moveAsync` publica conteúdo **e** prova; cerca de revogação antes e depois do `setPackEntry READY`, com undo pós-persistência | ambos | B §6.3–§6.8, G1-E, G3 |
| 12 | Índice persistido | `packStorageService.js` | Todo ler→mesclar→escrever dentro de `runSerialized`; `whenIndexQueueDrained` como ponto de sincronização; 8 valores de `PACK_STATUS` | **persistente** | BR §5–§6.8 (5 mutantes) |
| 13 | Marcador de publicação | `packPublishMarker.js` | Módulo **puro**, nunca lança; é a **única** evidência em disco da âncora `manifestSha256`; comparação por `storyId` **parseado** (sem colisão de prefixo) | **persistente** | C §7, §11, §19.15-16 |
| 14 | Registro em memória | `packInstallRegistry.js` | Três eixos **independentes**: sucessão visual (`opCounters`), revogação (só `clearStoryPackInstall` avança), publicação física (`notifyReady`); snapshot **nunca** é `null` | volátil | 01F, G1 (27), FIX1R |
| 15 | Notificação do contexto | `PacksContext.js` + `packReconcileService.js` | Assina **apenas** o READY global (sem progresso por arquivo ⇒ sem tempestade de render); guarda de **geração de leitura** descarta resultado obsoleto | volátil | 01F "sem tempestade", G4-A/2 |
| 16 | Atualização imediata da UI | `useStoryPackDownload.js:184-200` | `uiState` trata `installReady` do registro **em pé de igualdade** com `packState.ready`; replay do snapshot na montagem | volátil | P8-9, P8-12, 01F H1/H3/H4 |
| 17 | Reabertura offline | `packDownloadService.js:696-726` | Online: só reusa o local se a identidade **local** casar com a **resolvida**. Offline: reusa READY ancorado em bytes reais, senão recovery, senão **erro honesto** — nunca `idle` | ambos | D-ID-25/26/27/29 |
| 18 | Recovery pós-reinício | `packRecoveryService.js` (lab: `recoveryLabDevService.js`) | Só alcançado **por dentro** do downloader público — **não roda no boot**; fast-path se o índice já é READY; `validateCandidate` valida **todos** os kinds do marcador; empate entre versões íntegras ⇒ `ambiguous`, não adivinha | ambos | P7-E1/E3, P7-03…P7-22 (48) |

---

## 4. Problemas originais × resultado final

| # | Sintoma original | Classificação | Onde foi resolvido |
|---|---|---|---|
| 1 | Capas piscando (remontagem contínua durante o download) | **RESOLVIDO** | Causa raiz: componentes declarados **dentro** do render. `Moldura`, `Selo` e `InfoSection` movidos para escopo de módulo (`StoryBookHero.js:25/33/42`); raiz→capa sem `key` derivada de progresso |
| 2 | Imagens desaparecendo (capa/cena em branco) | **MITIGADO** | Capa: eliminado pelo 01G-C. Cena: resolução fallback-first com `safeRemoteSource` (`useResolvedStoryMedia.js:93/109`). **Resíduo:** `StorySceneVisual.js:40` mantém o mesmo padrão (badge irmão, sem sintoma observado) |
| 3 | Segundo toque necessário para baixar | **RESOLVIDO** | READY virou evento **global**; `PacksContext` assina `subscribePackReady` e o hook deriva `ready` do registro, independentemente da tela iniciadora |
| 4 | Progresso excessivo / reiniciando | **RESOLVIDO** | Throttle ~8 upd/s; um report por arquivo; o contexto **não** assina progresso; hook virou espelho do registro; stale-guard por operação |
| 5 | Voos duplicados | **RESOLVIDO** | Single-flight por **identidade resolvida** (resolve-first, 7 campos); joiner recebe o mesmo objeto; chave liberada no `finally` |
| 6 | Concorrência sobre `.tmp`/`localDir` | **RESOLVIDO** | `runExclusiveByStory`; `.tmp` sempre recomeça vazio; swap `delete→move` colado ao fim da validação |
| 7 | Chamadores cancelados derrubando instalação alheia | **RESOLVIDO** | Separação **observar × executar**: `participantSignal` só remove assinante, nunca aborta o voo físico; inspeção fail-closed |
| 8 | Reset durante download ressuscitando o pack | **RESOLVIDO** | **G1**: três eixos separados no registro; cerca de publicação consulta **revogação**, não sucessão; undo pós-persistência |
| 9 | Identidades diferentes da mesma história | **RESOLVIDO** | Resolve-first com `manifestSha256` obrigatório; preflight local só reusa quando o sha **real dos bytes** bate com marcador **e** identidade |
| 10 | Pack no disco, ausente do índice (órfão) | **RESOLVIDO** | Marcador `.ptf-publish.json` publicado pelo mesmo `moveAsync`; promoção sem baixar um byte |
| 11 | Índice ready mas registro idle | **RESOLVIDO** | **B1/B2**: toda rota criadora (S1/S1a/S1b, S3, S4, S6) abre uma operação e publica o próprio desfecho, derivado da Promise — não de eventos de progresso |
| 12 | UI oferecendo download para pack já pronto | **RESOLVIDO** | `uiState` com duas fontes convergentes (índice **ou** registro) |
| 13 | "Restart" do smoke que não reiniciava nada | **RESOLVIDO** | `bootProcesso()`/`reiniciarProcesso()` recarregam os **três** módulos voláteis sobre o mesmo disco em memória |
| 14 | Diagnóstico do P7 com campos nulos após reinício | **RESOLVIDO** | **B3**: retorno de `exerciseRealPreflight` autocontido (identidade persistida em arquivo, rota, evidência, snapshot, índice) |
| 15 | Modo Criador visível mas não ativável | **RESOLVIDO** | **B4**: switch só renderiza sob `qaAllowed`; perfil `preview-criador` é o único que declara a env; gate **quíntuplo**; produção fail-closed |
| 16 | Diferença entre Dev Client e build instalado | **MITIGADO** | Reconciliado o eixo **ferramentas internas** (`isInternalToolsEnabled`, gate quíntuplo, perfil interno). A divergência Dev Client × build instalado **em si** não tem prova automatizada |
| 17 | Experiência offline global | **MITIGADO** | A **camada de packs** ficou offline-safe de ponta a ponta e foi validada fisicamente. Para o **app inteiro** offline não há prova automatizada — a evidência é física (§5, cenários 1, 2, 3, 12) |

**Fora do escopo (registrado, não reclassificado):** medição de desempenho (D1), peso do binário (R5–R7),
Android (R20).

---

## 5. Provas físicas — build interno iOS `preview-criador`, sem Metro

Fonte: relatório do Eduardo de 2026-07-29 (24 resultados aprovados). O assistente **não tem dispositivo**
e **não** declara validação visual — esta matriz **transcreve** o relatado, com a origem explícita.

| # | Cenário | Ambiente | Rede | História | Esperado | Observado | Veredito |
|---|---|---|---|---|---|---|---|
| 1 | Primeira abertura | build instalado, sem Metro | **offline** | — | App abre sem depender de rede | Abertura completa offline | ✅ |
| 2 | Shell global | build instalado | **modo avião** | — | Home, Mapa, 4 regiões, capas, Benis, fontes, avatar, Brincar, Estrelinhas, Perfil íntegros | Todos íntegros | ✅ |
| 3 | Alternância online → offline | build instalado | online → offline | — | Sem quebra ao perder rede | Alternância sem falha | ✅ |
| 4 | Encerramento e reinício | build instalado | **offline** | — | Estado persistido sobrevive ao restart | Reinício offline íntegro | ✅ |
| 5 | Modo Criador — visibilidade | build `preview-criador` | — | — | Visível **somente** no perfil autorizado | Visível só no perfil autorizado | ✅ |
| 6 | Modo Criador — persistência | build `preview-criador` | — | — | Permanece ativado após reinício | Permaneceu ativado | ✅ |
| 7 | Conteúdo premium | build `preview-criador` | — | — | Acessível sob o gate correto | Acessível | ✅ |
| 8 | Preparação real de órfão | laboratório P7 | online | `david_goliath` | Instala de verdade e limpa **só** o índice | 31 arquivos / 18.604.321 bytes persistidos | ✅ |
| 9 | Inspeção após reinício | laboratório P7 | — | `david_goliath` | Conteúdo intacto e marcador válido | Hashes **antes == depois**; marcador válido | ✅ |
| 10 | Rota `online-preflight` | laboratório P7 | online | `david_goliath` | Classificada e aprovada | Aprovada | ✅ |
| 11 | Rota `offline-best-effort` | laboratório P7 | **offline** | `david_goliath` | Recovery **sem** segundo download | Sem segundo download; **nenhum** evento `downloading`/`verifying`; índice **ready**; registro **ready**; **12/12** critérios; **RECOVERY_APPROVED** | ✅ |
| 12 | Atualização imediata da UI | build instalado | — | `david_goliath` | Estante reconhece como baixada na mesma sessão | Reconheceu imediatamente | ✅ |
| 13 | História completa offline | build instalado | **offline** | `david_goliath` | Cenas, imagens, áudio e navegação funcionam | Tudo funcionou; nenhum erro visual ou funcional inesperado | ✅ |

### 5.1 O que a validação física **não** cobriu

O `audit-lp2.1-concorrencia.md` §13.2 registrou **três** validações físicas pendentes que **não**
constam entre os 24 resultados:

1. Instalar **duas histórias em sequência rápida** e conferir que **ambas** permanecem na estante
   (corretivo `746c1f3`, dois READY concorrentes).
2. **Reset seguido de retry** (corretivo `bcfde07`, identidade divergente).
3. **Saída da tela durante uma instalação em curso** (G5).

Os três permanecem provados **apenas em harness** (G1: 27 provas; G4: 27; G5: 24 — todas
comportamentais, com controles negativos e antitautologia). Classificação: **dívida não bloqueante**
(D4) — o cenário exige coordenação manual fina e o risco coberto é de regressão, não de defeito
conhecido em aberto.

---

## 6. Provas automatizadas

**`npm run smoke` — 3312/3312 · 0 falhas** (executado em `26d2b57`).
**`npx expo-doctor` — 17/18**, única falha = drift de patch pré-autorizado (§8).

### 6.1 Perfil da suíte

| Métrica | Valor |
|---|---|
| Total de provas | **3312** |
| Comportamentais (executam módulo real) | **1227** (37,6%) |
| Estáticas (regex/leitura de fonte) | **2037** (62,4%) |
| Controles negativos | 56 |
| Mutantes catalogados | 50 em 5 arrays (`MUTANTES` 5, `MUT_B` 10, `MUT_BR` 5, `MUT_C` 19, `MUT_E` 11) + ~36 âncoras mutáveis em G4/G5/G6/P8 |
| Provas de concorrência | 47 |
| Provas de revogação | 29 |

**A assimetria é conhecida e favorável à trilha:** LP2/LP2.1a tem **299 comportamentais em 358**;
G1–G6 + P8 tem **148 em 149**. A massa textual está nas áreas **antigas** (jogos, sprints históricos,
telas), que dependem integralmente da validação visual manual exigida pelo `AGENTS.md`.

**Por que é comportamental de verdade:** `scripts/testing/packInstallHarness.js` carrega **do fonte**
os módulos reais — `packStorageService`, `packManifestService`, `packIntegrityService` (sha256 real via
`@noble/hashes`), `packReconcileService`, `packPublishMarker`, `globalManifestService`,
`packRecoveryService`. Os **únicos** dublês são o FileSystem em memória, o `fetch` e o `warn`. E o
FileSystem em memória é deliberadamente **hostil**: `requireParent` lança ENOENT, `readDirectoryAsync`
lança em diretório inexistente, `_write` **não** cria o diretório pai — justamente para que os
`makeDirectoryAsync` do código real sejam falsificáveis.

**Antitautologia (mecanismo real):** `packInstallHarness.js:44` e `:77` **lançam** quando
`mutate(src) === src` — uma mutação que não bate na âncora não pode carregar o módulo íntegro e
passar por engano.

### 6.2 Área crítica ainda sem teste — achado

| Área | Criticidade | Por quê |
|---|---|---|
| **Lacuna de antitautologia em §10** (`smoke.js:9185-9235`) | **alta** | O `loadPackDownloader(mut)` está **dentro** do `try` cujo `catch` converte a exceção em `{ ok:false, reason:'lançou: …' }`. Como essa assinatura difere da do original, uma âncora obsoleta contaria como "mutante morto" sem ter mutado nada. Afeta **2 mutantes** (M1, M2 em `:9192-9195`) — os demais têm proteção de direção em `:9243-9247`. `C11`/`C17` de `MUT_C` (`:11938-11946`) têm o mesmo formato. Correção = mover a chamada para fora do `try`, como §15 já faz e documenta. **Não corrigido nesta etapa** (a ordem proíbe alterar código de produção e de teste no fechamento) |
| FileSystem físico real (permissões, disco cheio, move entre volumes, kill no meio do move) | **crítica** | Todo o núcleo é provado só contra o FS em memória. Mitigado — não eliminado — pela validação física de 2026-07-29 |
| SDK real do RevenueCat (compra, restauração, expiração) | **crítica** | Só o adapter isolado é exercitado. Fora do escopo desta trilha |
| Render/UI: nenhum componente montado exceto `01G-C` | **alta** | 1400+ provas afirmam comportamento de UI por regex sobre JSX. O número "3312 provas" **não** substitui validação visual |
| Rede real (TLS, redirects, corte no meio do stream com `Content-Length` correto) | **alta** | `fetchDouble` é offline/online binário |
| Kind `coloring` ponta a ponta no harness | **média** | 0 ocorrências de `"coloring"` em `packInstallHarness.js`; o kind é aceito e resolvido em produção, mas o caminho não é exercitado pela suíte |
| Cobertura de `expo@54.0.36` | — | Ver §8 |

---

## 7. Riscos residuais e dívidas

### 7.1 Riscos residuais (24)

| ID | Risco | Prob. | Impacto | Bloq. Colorir | Bloq. lançamento | Fase do Roteiro |
|---|---|---|---|---|---|---|
| R1 | Rota offline (`installOfflinePublishing`) publica no índice **sem** cerca de escrita — `recoverStoryPack` marca READY fora do fence de revogação (assimetria admitida em comentário no fonte) | muito baixa | alto | não | não | Fase 3 |
| R2 | Falha **nova** sobrepondo visualmente sucesso **antigo**: `settleError` guardado só por `isCurrent` | baixa | alto | não | não | Fase 3 |
| R3 | `notifyReady` do ramo **superado** monta payload a partir do `idleSnapshot` (sem `resolvedInstallKey`/`requestedKinds`) | muito baixa | baixo | não | não | Fase 3 |
| R4 | Identidade sem `manifestSha256` ⇒ chave `null` ⇒ instala **fora** do single-flight (ainda sob a cerca de publicação) | baixa | médio | não | não | Fase 3 |
| R5 | **Peso do binário / arquivo enviado ao EAS** — 401,12 MB referenciados por `require()` estático em 711 arquivos (`assets/` = 495 MB em disco) | alta | **crítico** | não | **SIM** | Fase 2 |
| R6 | **Assets premium ainda embarcados** — as 18 histórias `remote` continuam no binário | alta | **crítico** | não | **SIM** | Fase 2 |
| R7 | **200 linearts legados de Colorir embarcados** — 283,19 MB, 70,6% do total referenciado | alta | **crítico** | não | **SIM** | Fase 2 |
| R8 | Duplicação embarcado × pack — o usuário baixa bytes que já estão no binário (`contentResolver.js:83-92` é explícito) | alta | alto | não | não | Fase 2 |
| R9 | Cache/fallback mascarando falha de pack — os 4 hooks de mídia engolem a falha e seguem no `require` local, sem sinalizar | alta | médio | não | não | Fase 3 |
| R10 | Estado do painel `PackSandboxDevScreen` é `useState` puro (não persiste); o **diagnóstico** persiste em arquivo | alta | baixo | não | não | Fase 6 |
| R11 | Logs/diagnósticos em release — **tratado**: `logger.js` fecha tudo atrás de `__DEV__`; os 6 `console.log` fora dele estão em blocos já gated. Residual: **nenhum teste impede** um novo `console.log` sem gate | muito baixa | baixo | não | não | Fase 13 |
| R12 | Vazamento de URL assinada — **parcialmente tratado**. `PackSandboxDevScreen.js:486-490` renderiza JSON **cru** do Recovery-Lab sem `textoSemQuery`/`baseUrlPublica` | baixa | alto | não | não | Fase 10 |
| R13 | **Sem refresh de manifesto para pack já instalado.** `NEEDS_UPDATE` é enum morto; pack instalado congela para sempre. Combinado com R19, **não existe canal de correção pós-venda** | alta | médio | não | não | Fase 10 |
| R14 | Espaço insuficiente: precheck existe no início, **não durante**; e `StoryDetailScreen.js:242` colapsa todos os erros numa frase genérica | média | baixo | não | não | Fase 10 |
| R15 | Corrupção parcial: **detecção forte na instalação, inexistente na leitura**. `contentResolver` confia no índice READY; `probePackDisk` checa só `localDir` e `manifest.json` | baixa | médio | não | não | Fase 10 |
| R16 | Migração v1→v2: as duas versões **coexistem para sempre**; não há coletor de lixo (decisão registrada, spec §7.5.2) | alta | médio | não | não | Fase 10 |
| R17 | **`appVersion` é literal congelado `'1.0.0'`** (`useStoryPackDownload.js:62`; sem `expo-constants`). `requiresAppUpdate` e `minAppVersion` estão **inertes**, e no dia em que o valor virar real **todos** os packs instalados deixam de coincidir e serão rebaixados | alta | alto | não | **SIM** | Fase 10 — antes do binário de loja |
| R18 | Rollback: sem barreira efetiva (o caminho offline trata `appVersion` como evidência, não gate); índice sem `schemaVersion` | baixa | médio | não | não | Fase 12/13 |
| R19 | **Não há OTA** (`expo-updates` ausente). O risco não é conflito — é a **ausência de canal de correção** | muito baixa | baixo | não | não | Fase 13 |
| R20 | **Android sem qualquer evidência empírica.** Sinal bom: 0 usos de `Platform` no caminho de packs, tudo derivado de `documentDirectory`. Sinal ruim: `packIntegrityService.js:45-60` lê o **arquivo inteiro em base64** para o sha256, sem streaming nem teto — pico de memória proporcional ao maior asset | média | alto | não | **SIM** | Fase 12 |
| R21 | **Nenhuma medição de desempenho foi registrada.** `performanceTrace.js:45-52` é gated por `__DEV__`/`EXPO_PUBLIC_PTF_PERF_TRACE`, ausente de todos os perfis do `eas.json`; não há script npm para `scripts/perf-baseline-report.js` nem baseline versionado | alta | médio | não | não | Fase 14 (§14 da spec) |
| R22 | **Os 4 commits finais nunca rodaram em CI limpo.** O gate duro (`.github/workflows/ci.yml`, job `smoke`) dispara em `pull_request` e push para `main`; `origin` está em `eb871f5` | alta | médio | não | não | imediato — resolvido pelo primeiro PR |
| R23 | **Hazard de CRLF na integração.** `d9101f2` (branch `feat/colorir-60-pilot-creation`) converteu `scripts/smoke.js` para CRLF (tip CR=37162; base e `26d2b57` CR=0). Sem `.gitattributes` e com `core.autocrlf=false`, o merge gera conflito de **arquivo inteiro** no gate de CI de 37k linhas | alta | alto | **SIM (operacional)** | não | imediato — antes do primeiro merge |
| R24 | `EXPO_PUBLIC_GLOBAL_MANIFEST_URL` não é declarada em nenhum perfil do `eas.json`. **Refutado como bloqueador pela evidência física** (o build instalado baixou 31 arquivos do R2, logo o valor resolveu em runtime), mas a origem do valor não está versionada | média | alto | não | não | Fase 13 |

### 7.2 Dívidas não bloqueantes (registro — **não** abrir projeto)

| ID | Dívida | Origem |
|---|---|---|
| D1 | Trilha chamada "loading/performance" fecha **sem um único número medido** | R21 |
| D2 | Âncoras de linha do `smoke.js` na `spec.md` estão **deslocadas** (01F citado `:13485`, hoje `:14314`; 01G-C `:17332`→`:20804`; bloco C `:10370`→`:11198`; D1/D2/D3 `:11711/:11916/:12237`→`:12539/:12744/:13065`; E1/E3 `:12438/:12596`→`:13266/:13424`; F1 `:13045`→`:13875`). As âncoras de `packDownloadService.js` **continuam corretas** | crescimento da suíte |
| D3 | Lacuna de antitautologia em `smoke.js:9185-9235` (2 mutantes) | §6.2 |
| D4 | Três validações físicas de concorrência (audit §13.2) seguem só em harness | §5.1 |
| D5 | `packInstallKey` (`packDownloadService.js:132`) permanece exportada e retornada pela factory (`:1102`) embora superada por `canonicalResolvedKey` | LP2 PK-01 |
| D6 | `packManifestService.js:17` aceita kind `other`, que `packDownloadService.js:84` **não** aceita — um pack válido pelo schema pode conter arquivo que o downloader não classifica | LP2.1a-ii-A |
| D7 | `StorySceneVisual.js:40` declara `SceneNumberBadge` dentro do render (mesmo mecanismo do 01G-C; badge é **irmão**, não ancestral, e sem sintoma observado) | spec §16.6 |
| D8 | `configMissing` nunca é consumido pelo render de `StoryDetailScreen.js:224-247`; toda falha de config mostra a cópia genérica de `:242`; `retry` sem backoff nem limite | B1 |
| D9 | Duas numerações "B" convivem sem documento conciliador: B2/B3 como subseções do P7 (`smoke.js:10889`, `:10955`) e B1–B4 como os blocos dos commits finais | governança |

---

## 8. Drift do Expo — decisão

**Fato:** `expo` instalado **54.0.35**, esperado **~54.0.36**. `npx expo-doctor` = **17/18**, falha única.
Pré-existente no baseline e **pré-autorizado** pela `spec.md` §12 (*"único drift ambiental autorizado"*).

| Pergunta | Resposta |
|---|---|
| Bloqueia a integração do Colorir com o Beni? | **Não.** É drift de **patch**; nada no caminho do Colorir depende de comportamento novo do 54.0.36 |
| Resolver agora ou na engenharia de lançamento? | **Engenharia de lançamento.** Junto com a decisão de peso do binário (R5–R7) e do `appVersion` real (R17) |
| Risco de alterar o baseline imediatamente | **Alto.** (a) Invalida o build físico recém-aprovado — as 24 evidências foram colhidas com **este** conjunto de dependências; (b) `expo@54.0.36` pode arrastar `expo-file-system ~19.0.23`, que é o **substrato** de todas as provas de P7, recovery e harness; (c) `expo install --check` reescreve `package.json` **e** `package-lock.json`, tocando arquivos fora do escopo desta etapa |
| Testes obrigatórios **após** a futura atualização | 1) `npm run smoke` completo; 2) `npx expo-doctor` 18/18; 3) suíte de packs no harness (A, B, BR, C, D1–D3, E, F, G1–G6, P8, P7); 4) `moveAsync`/`deleteAsync`/`makeDirectoryAsync`/`getInfoAsync` conferidos contra os doubles do QA3R; 5) `getFreeDiskStorageAsync` (precheck de espaço); 6) `createDownloadResumable` + `cancelAsync` (gate de rede); 7) sha256 real (`@noble/hashes` + leitura base64); 8) novo build interno `preview-criador`; 9) **repetir no aparelho** os 13 cenários da §5; 10) `git diff` de `package.json`/`package-lock.json` auditado linha a linha; 11) confirmar que nenhum alerta **novo** apareceu no `expo-doctor` |

> **Não atualizado nesta etapa**, conforme a ordem.

---

## 9. Prontidão para o Colorir com o Beni

> ## **PRONTO COM CONDIÇÕES**

| # | Requisito | Fundação suporta? | O que falta |
|---|---|---|---|
| 1 | Três atividades por história (vocabulário de `kinds`) | **parcial** | `KNOWN_KINDS` é lista fechada duplicada em 3 lugares + 2 convenções de path. Um kind novo exige 5 edições coordenadas. **Reusar `coloring` não exige nenhuma** |
| 2 | Persistência de pinturas | **sim** | Nada. Subsistemas fisicamente disjuntos: pinturas em `ptf_blobs/{drawings,atelier}` com ponteiros v3; packs em `packs/<storyId>@<version>/` |
| 3 | Assets de colorir em packs premium | **sim** | Nada. `coloring` é cidadão de primeira classe de ponta a ponta e já está em produção |
| 4 | Assets gratuitos no app base coexistindo com pack | **sim** | Nada. A arquitetura é explicitamente fallback-first, com guarda `keyMatches` |
| 5 | Salvamento exclusivo do Plano Família | **parcial** | A cadeia de entitlement é fail-closed, mas o **salvamento do colorir de história** (`ColoringScreen.js:254`) grava **sem nenhuma verificação de plano** — ao contrário do Ateliê |
| 6 | Reabertura offline de atividade já baixada | **sim** | Lado físico bem coberto e **validado no aparelho** |
| 7 | Atualização de manifesto sem quebrar quem já baixou | **NÃO** | `needs_update` é código morto; não há detecção de deriva de versão. **Único requisito reprovado** |
| 8 | Remoção futura dos 200 linearts legados | **parcial** | Existe mapa (`coloringImages.js`, 200 requires), 4 consumidores e asserts de gate duro no smoke. Remoção = projeto próprio |
| 9 | Redução do peso dos packs | **parcial** | Há instrumentos de medição e integridade; **não** há mecanismo de redução (sem download seletivo na prática — o hook sempre pede os 4 kinds) |
| 10 | Migração sem quebrar usuários existentes | **parcial** | Diretório versionado, publish atômico, `ambiguous` em vez de adivinhar. Falta coletor de lixo (R16) e o `appVersion` real (R17) |

### 9.1 Condições mínimas — específicas

| ID | Condição |
|---|---|
| **C1** | Se a integração introduzir **kind novo**, editar de forma coordenada os 5 pontos: `packDownloadService.js:84`, `globalManifestService.js:23`, `packManifestService.js:17`, `contentResolver.js:100`/`:122-131`, `scripts/assets-pipeline/build-story-pack.js:166-177`. **Reusando `coloring`, nenhuma edição é necessária.** Em ambos os casos: `globalManifestService.js:119-120` permite **um pack por `storyId`** — a atividade tem de caber no pack existente |
| **C2** | Alinhar `packManifestService.js:17` (aceita `other`) com `packDownloadService.js:84` (não aceita) — dívida **D6** |
| **C3** | Antes de vender "salvar pintura" como exclusivo do Plano Família, adicionar o gate no caminho de salvamento do colorir de história, **preferencialmente na camada de serviço**, e definir por escrito o que acontece com pinturas já salvas por usuários free |
| **C4** | **Ativar `needs_update`** (detecção de versão instalada × publicada). É a **única condição que hoje reprova um requisito inteiro** (o 7). Sem ela, trocar a arte de colorir de uma história não chega a quem já baixou |
| **C5** | Coletor de lixo de versões antigas + política de desempate para o caso `ambiguous` |
| **C6** | Decidir **antes**: (a) formato (o resolver assume PNG fixo, sem WebP) e (b) se o download continua monolítico — o serviço já filtra por `requestedKinds`; falta o hook/tela exercerem isso |
| **C7** | **Não remover** os 200 linearts embarcados nesta integração — 4 consumidores de runtime/QA e asserts de gate duro dependem deles |
| **C8** | Documentar o limite offline: a autorização premium expira em **7 dias** sem rede, independentemente de o pack estar íntegro. Se a atividade for premium, o comportamento após 7 dias tem de ser decidido, não descoberto pelo usuário |
| **C9** | **Renormalizar o `scripts/smoke.js` para LF antes do primeiro merge** com `feat/colorir-60-pilot-creation` (R23) |

**Nenhuma dessas condições exige reabrir a trilha de loading/performance.** C1, C2, C3, C6 e C9
pertencem à própria integração; C4, C5, C7 e C8 são pré-requisitos de **publicação de conteúdo novo**,
não de escrita de código de atividade.

---

## 10. Próximo baseline de integração

**Baseline:** `fix/loading-performance-foundation` @ `26d2b57` (+ o commit de fechamento desta etapa).

**Direção obrigatória da integração: LP → Colorir** (rebase/merge do Colorir **sobre** a fundação).
Razões verificadas:

- `feat/colorir-60-pilot-creation` bifurca em `6cf799c`, está **46 commits à frente** e **não contém
  nenhum** dos 9 commits da trilha (`fddd1f0`, `bcfde07`, `746c1f3`, `138f738`, `eb871f5`, `945400b`,
  `ba396d1`, `d4db2ed`, `26d2b57`).
- `main` está em `a97f392`, **349 commits atrás** — **rejeitado** como baseline.
- Conflitos de produção esperados: **apenas dois** — `src/config/featureFlags.js` (linhas adjacentes)
  e `src/screens/ParentAreaScreen.js` (LP ~164 × Colorir ~977).
- O Colorir **não toca** nenhum arquivo do runtime de packs.

**Pré-condições operacionais antes do merge:** (1) renormalizar `smoke.js` para LF (R23);
(2) abrir PR para que o gate duro de CI rode em ambiente `npm ci` limpo (R22).

**Próximo passo oficial: integração do Colorir com o Beni.** Nada de loading/performance antes disso.

---

## 11. Rastreabilidade

- Spec mestra: [`spec.md`](./spec.md) (§10 ordem, §13 critérios de fechamento, §16 riscos, §17 fechamento)
- Plano do bloco C: [`plan-lp2.1a-ii-c.md`](./plan-lp2.1a-ii-c.md)
- Auditoria de concorrência (§10.7): [`audit-lp2.1-concorrencia.md`](./audit-lp2.1-concorrencia.md)
- Harness: `scripts/testing/packInstallHarness.js` · Suíte: `scripts/smoke.js`
- Laboratório de recovery: `src/services/recoveryLabDevService.js` · `src/screens/PackSandboxDevScreen.js`
