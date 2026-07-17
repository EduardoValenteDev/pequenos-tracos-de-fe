# Plan — LP2.1a-ii-C: recuperação de instalação interrompida entre o `move` e o `READY`

> **Feature:** `012-loading-performance-foundation` · **Cobre APENAS o bloco `LP2.1a-ii-C`.** D, E e F têm planos próprios, não iniciados.
> **Etapa SDD:** 4 (Plan). **Portão Humano 2: PENDENTE.**
> **Branch:** `fix/loading-performance-foundation` · **HEAD na criação:** `00c2d44` · Spec: [spec.md](./spec.md) (Portão 1 APROVADO em 2026-07-16).
> **Risco:** S1 (conteúdo pago íntegro no disco, inacessível).

> ## ⛔ ESTE PLANO ESTÁ DELIBERADAMENTE INCONCLUSO
>
> A classificação das decisões abertas (§2) encontrou **dois itens `C-BLOCKING`**. Conforme o contrato do bloco, **paro antes de concluir o plano** e apresento alternativas, consequências e evidências — **sem escolher sozinho**.
>
> Tudo que **não** depende dessas duas decisões está completo e verificado abaixo: auditoria do intervalo crítico (§3), matriz de cenários (§4), evidência local disponível (§5), alternativas arquiteturais (§6). O que **depende** está explicitamente marcado **[BLOQUEADO — decisão do Eduardo]**.
>
> **Nada de código foi escrito. Nenhum arquivo candidato foi tocado.**

---

## 1. Fonte oficial e método

Fonte principal: [spec.md](./spec.md) §6 (contrato do bloco C), com os 9 princípios congelados e aprovados no Portão 1.

Cruzamentos feitos (read-only, 2026-07-16, HEAD `00c2d44`):

| Fonte | Uso |
|---|---|
| `src/services/packDownloadService.js` | fluxo real do intervalo crítico |
| `src/services/packStorageService.js` | índice, merge, fila serializada |
| `src/services/packReconcileService.js` | o que a reconciliação percorre |
| `src/context/PacksContext.js` | onde a reconciliação roda hoje |
| `scripts/smoke.js` | provas existentes (LP2, LP2.1a-i, LP2.1a-ii-A/B/BR) |
| `scripts/testing/packInstallHarness.js` | harness real (hook `onBefore` de checkpoint) |
| Commits `6466c75`, `824aec1`, `478b0a5`, `1c84773`, `ead7f18`, `3485b95` | contratos já provados |

**Método:** toda afirmação de estado atual foi **executada** pelo harness real, não inferida por leitura. As saídas estão citadas em §3 e §5.

---

## 2. As oito decisões abertas — classificação

Da spec §15, verificadas uma a uma contra o código.

| ID | Pergunta aberta | Bloco | Evidência | Consequência de errar | Resolver até | Classificação |
|---|---|---|---|---|---|---|
| **AB-1** | Estados concretos do índice na janela; metadados disponíveis; validação necessária e suficiente | C | **RESOLVIDA por esta auditoria** (§3, §5) — executada no harness real | — | — | **NON-BLOCKING** *(resolvida por evidência + princípios já aprovados; ver §5.3 para o limite da âncora, registrado como risco residual)* |
| **AB-2** | O órfão C2 (instalação nova, sem entrada no índice) é detectável sem varrer o disco, e a que custo? | C | **Metade factual RESOLVIDA:** `collectPackProbes` itera `Object.keys(index)` e pula tudo que não é `READY` (`packReconcileService.js:31-32,77+`) → **C2 é invisível** e C1 (`downloading`) **nem é sondado**. `readDirectoryAsync` **nunca é usado no projeto** (grep vazio). **Metade em aberto:** varrer o disco, ou não? | Não varrer = o caso **mais comum** (instalação nova) fica sem recuperação. Varrer = I/O novo no caminho de boot, que é o tema da própria trilha | **Antes de concluir este plano** | **C-BLOCKING** |
| **AB-3** | Onde o recovery roda (boot, foco, sob demanda)? | C | Nenhuma. Hoje **não existe recovery**. A reconciliação roda no `PacksContext` (`useMemo`/`useEffect`, `:113-151`) | Boot: custo direto no tempo de abertura (o que a trilha existe para proteger). Sob demanda: conteúdo íntegro segue inacessível até o usuário tentar de novo | **Antes de concluir este plano** | **C-BLOCKING** |
| **AB-4** | Como coordenar as duas fases da identidade | D | spec §7.6 | — | Bloco D | **D-DEFERRED** |
| **AB-5** | Joiner pode receber a versão que o voo resolveu? | D | spec §7.5.1 | — | Bloco D | **D-DEFERRED** |
| **AB-6** | Há *replay* do último evento de progresso? | E | spec §8.4.2 | — | Bloco E | **E-DEFERRED** |
| **AB-7** | Progresso monotônico por participante? | E | spec §8.4 | — | Bloco E | **E-DEFERRED** |
| **AB-8** | Toda a política de cancelamento | F | spec §9.3 | — | Bloco F | **F-DEFERRED** |

**Nenhuma decisão foi resolvida para eliminar a marcação.** AB-1 é a única que muda de estado, e muda porque a **auditoria a respondeu com fatos executados**, não porque escolhi uma política.

> **AB-2 e AB-3 são `C-BLOCKING` e estão inter-relacionadas.** As alternativas estão em §6 e a decisão pedida em §8.

---

## 3. Auditoria do intervalo crítico (fato, executado)

### 3.1 O fluxo real, passo a passo

Fonte: `packDownloadService.js`. Todo o trecho roda dentro de `guardedInstall` → `runExclusiveByStory(storyId)` (fila física por história) e, para chamadores sem `isCancelled`, dentro do single-flight.

| # | Passo | Linha |
|---|---|---|
| 1 | Verify completo: existência + bytes + sha256 de **todos** os arquivos + contagem por kind | `:392-410` |
| 2 | `if (errors.length) return failWith(...)` — última saída por validação | `:410` |
| 3 | `throwIfCancelled` — **último ponto cancelável; o swap não é cancelável** | `:412` |
| 4 | `getInfoAsync(localDir)` → `preExisting` (try/catch: se lançar, `false`) | `:420-424` |
| 5 | **`setPackEntry(DOWNLOADING)` — só se `preExisting`** | `:425-427` |
| 6 | `deleteAsync(localDir, {idempotent:true})` — **ato destrutivo** | `:428` |
| 7 | `moveAsync({from: tempDir, to: localDir})` — publicação | `:429` |
| 8 | `setPackEntry(READY, {version, localDir, manifestPath, totalBytes, downloadedBytes, errorMessage:null})` | `:432-440` |
| 9 | `report(READY)` → `onProgress` (UI, não índice) | `:441` |
| 10 | `return {ok:true, ...}` | `:444` |
| 11 | `.finally(() => inFlightInstalls.delete(key))` — libera a chave | `:531` |
| 12 | `runExclusiveByStory`: a corrente normaliza e a entrada sai do mapa | `:489-492` |

**Não há passo de "atualização de caminhos em memória" separado** (item 5 do roteiro de auditoria): os caminhos são recomputados por `getPackLocalDir(storyId, version)` a cada leitura (`PacksContext.normalizedIndex`, `:113-151`), justamente porque o `localDir` persistido não é confiável no iOS (F2.5-hardening-1 C3). **Não há limpeza de temporários após o move** (item 8): o `.tmp` deixa de existir porque **foi renomeado** pelo move — verificado (`.tmp restante: 0`).

### 3.2 Pontos de interrupção e o estado que cada um deixa

Executado com o harness real (hook `onBefore`, que observa o estado **no instante da operação de verdade**):

```
══ CRASH depois do move / antes do READY — C1 (havia pack anterior) ══
  índice:  {"status":"downloading","version":"1.0.0",
            "localDir":"file:///doc/packs/david_goliath@1.0.0/",
            "manifestPath":".../manifest.json",
            "totalBytes":15,"downloadedBytes":15,"errorMessage":null}
  final:   audio/01.mp3, manifest.json, scenes/01.webp, scenes/02.webp   (COMPLETO)
  .tmp:    0 arquivo(s)

══ CRASH depois do move / antes do READY — C2 (instalação nova) ══
  índice:  null                                                          (SEM ENTRADA)
  final:   audio/01.mp3, manifest.json, scenes/01.webp, scenes/02.webp   (COMPLETO)
  .tmp:    0 arquivo(s)
```

> **Achado novo, não previsto na spec:** em C1 o `totalBytes` do índice é **15 — o do pack ANTIGO**, não os 44 do novo. Causa: a marca `DOWNLOADING` (`:426`) passa só `{version, status}`, e o merge herda o resto via `?? prev` (`packStorageService.js:135-147`). O mesmo vale para `localDir`/`manifestPath` (que **coincidem** aqui só porque a versão é a mesma). **Consequência para C:** `totalBytes` do índice **não é evidência confiável** para validar um órfão. A verdade está no `manifest.json` do disco.

### 3.3 Tabela do intervalo

| Ponto de interrupção | `.tmp` | Diretório final | Índice | Metadados disponíveis | Boot/reconciliação hoje | Recuperável offline? | Perda de pack válido | Promover incompleto | Retry duplicado |
|---|---|---|---|---|---|---|---|---|---|
| Antes do passo 5 | cheio, validado | **anterior intacto** | `READY` anterior (ou ausente) | índice + `.tmp` | reconcilia normal | n/a — nada a recuperar | não | não | não |
| Entre 5 e 6 (após `DOWNLOADING`) | cheio, validado | **anterior intacto** | `downloading` + campos herdados | índice + `.tmp` + final antigo | **não sonda** (`needsDiskCheck` só `READY`) → trata como não-pronto → bundle | **sim, em tese** (o pack antigo está lá) | não | não | re-baixa |
| Entre 6 e 7 (após delete, antes do move) | cheio, validado | **REMOVIDO** | `downloading` | `.tmp` + manifesto no `.tmp` | não-pronto → bundle | **sim, em tese** (o `.tmp` está completo) | **o anterior já foi apagado** | não | re-baixa |
| **Entre 7 e 8 (após move, antes do READY) — C1** | vazio | **NOVO, completo** | `downloading`, `totalBytes` **estale** | **`manifest.json` no final + todos os arquivos** | não-pronto → bundle | **SIM** | não | não | re-baixa |
| **Entre 7 e 8 — C2 (fresh)** | vazio | **NOVO, completo** | **ausente** → `NOT_DOWNLOADED` | **`manifest.json` no final + todos os arquivos** | **invisível** (não há entrada) | **SIM, mas indetectável sem varrer** | não | não | re-baixa |
| Após 8, antes de 10/11 | vazio | novo, completo | `READY` coerente | tudo | pronto ✓ | n/a | não | não | não |

**Nenhum ponto perde dado de forma permanente** — verificado: o retry sobre um órfão funciona hoje (`ok: true`, `status: ready`, 2 downloads). O dano real é: **conteúdo pago, íntegro no disco, inacessível — e inacessível para sempre se o usuário estiver offline**, até que ele consiga rede para re-baixar o que já tem.

---

## 4. Matriz de cenários

| # | Cenário | Evidência detectável | Ação candidata | Resultado esperado | Prova necessária | Risco residual |
|---|---|---|---|---|---|---|
| 1 | Crash **antes** do move | índice `downloading` (C1) ou `READY` anterior; `.tmp` cheio | nenhuma (o retry cobre) | pack anterior segue usável | já provado (`smoke.js` "§7.2") | `.tmp` órfão ocupa disco → cache (fora da trilha) |
| 2 | Crash **durante** o move | **[ABERTO — auditar em C]** `moveAsync` é rename atômico no mesmo volume? Se sim, não há estado parcial observável | depende | — | exige prova por plataforma | **não verificável no harness** (o FS em memória move de forma atômica); só device |
| 3 | Crash **depois** do move, antes de qualquer persistência | disco completo + manifesto | validar local e promover | `READY` | executado (§3.2) | é o alvo do bloco |
| 4 | Crash **durante** a persistência do índice | `AsyncStorage.setItem` grava a chave inteira de uma vez (`packStorageService.js:88-97` documenta: "não há escrita parcial de meia entrada") | nenhuma (não há meio-estado) | índice íntegro | leitura do contrato existente | AsyncStorage não oferece transação entre processos |
| 5 | Crash depois dos caminhos, antes de `READY` | **não existe** — `:432` grava caminhos e `READY` **na mesma** chamada | n/a | n/a | — | cenário do roteiro que **não é alcançável** neste código |
| 6 | Crash depois de `READY`, antes da limpeza | `READY` coerente; `.tmp` já não existe (consumido pelo move) | nenhuma | pronto | executado | **cenário sem conteúdo** aqui |
| 7 | Final completo + índice `DOWNLOADING` (**C1**) | índice + disco | validar e promover | `READY` | harness + hook | âncora não verificável offline (§5.3) |
| 8 | Final completo + índice `FAILED` | índice + disco | **[BLOQUEADO]** depende de AB-2/AB-3 | — | — | `FAILED` pode ser de outra versão |
| 9 | Final **incompleto** + índice `DOWNLOADING` | manifesto local lista arquivo ausente | **não promover** | segue não-pronto; retry | harness com arquivo removido | — |
| 10 | Final **corrompido** | hash diverge do manifesto local | **não promover** | segue não-pronto | harness com byte trocado de mesmo tamanho | — |
| 11 | Final válido **sem entrada no índice** (**C2**) | **só o disco** | **[BLOQUEADO — AB-2]** | — | — | é o caso **mais comum** |
| 12 | Entrada apontando para diretório inexistente | índice `READY` sem disco | **já resolvido** — reconciliação rebaixa em memória (`824aec1`) | não-pronto | já provado | — |
| 13 | `READY` anterior preservado enquanto a nova versão falha | índice | **já resolvido** (`478b0a5`) | anterior intacto | já provado (`smoke.js` "§13") | — |
| 14 | Retry depois da recuperação | — | recovery roda antes; retry vira no-op ou download | coerente | harness | — |
| 15 | Recovery 2+ vezes | — | idempotente (princípio 5) | mesmo resultado | assinatura observável | — |
| 16 | App encerrado **durante o próprio recovery** | — | recovery só escreve o índice **depois** de validar tudo; a escrita é atômica por chave | ou promoveu, ou não | harness com hook antes da escrita | recovery parcial = nenhum efeito |

**Nenhuma ação candidata virou decisão.** Os cenários 8 e 11 dependem de AB-2/AB-3.

> **Correção ao roteiro:** o cenário 5 ("crash depois da persistência de caminhos, mas antes de `READY`") **não existe neste código** — caminhos e `READY` são gravados na mesma chamada `setPackEntry` (`:432-440`). Registro em vez de inventar um passo para preenchê-lo.

---

## 5. Evidência local disponível para validar offline

### 5.1 O que está no diretório final (fato, executado)

O `manifest.json` **está lá** — foi baixado para o `.tmp` e **movido junto**. Logo o disco contém, sem rede:

| Dado | Onde | Suficiente para validar? |
|---|---|---|
| Manifesto local | `<final>/manifest.json` | **sim** — schema completo |
| Lista de arquivos | `manifest.files[]` | sim |
| Hash individual | `manifest.files[].sha256` | sim |
| Tamanho | `manifest.files[].bytes` | sim |
| Versão | `manifest.version` + nome do diretório `<storyId>@<version>` | sim — **cruzáveis entre si** |
| `storyId` | `manifest.metadata.storyId` + nome do diretório | sim — cruzáveis |
| `kinds` | `manifest.files[].kind` | sim |
| Caminho do manifesto | derivável de `getPackLocalDir` | sim |
| `totalBytes` | `manifest.totalBytes` (= Σ `files[].bytes`, exigido pelo schema) | sim |
| **`manifestSha256` (âncora)** | **NÃO ESTÁ NO DISCO** — só no manifesto global (rede). O índice não o guarda (grep vazio em `packStorageService.js`) | **não** — ver §5.3 |
| Marcador de publicação completa | **não existe** | — |

### 5.2 Classificação dos dados

- **Já no diretório:** manifesto, arquivos, hashes, tamanhos, versão, storyId, kinds.
- **Já no índice:** `status`, `version`, `localDir`/`manifestPath` (**recompostos na leitura**, não confiáveis como persistidos), `totalBytes`/`downloadedBytes` (**podem estar estale** — §3.2).
- **Só em memória:** o `pack` do manifesto global (baseUrl, manifestPath, `manifestSha256`) — perdido no crash.
- **Precisariam ser persistidos antes do move:** apenas o `manifestSha256`, **se** a decisão for exigir a âncora na promoção (Alternativa B/C).
- **Não necessários para C:** `baseUrl`, `manifestPath` remoto, `appVersion`.
- **Pertencem ao bloco D:** a identidade resolvida completa (7 campos). **Este plano não a antecipa.**

### 5.3 O limite da validação offline (risco a registrar)

Offline é possível provar que **o diretório é internamente consistente com o próprio manifesto** e que **a identidade bate com o nome do diretório** (`storyId@version` × `manifest.metadata.storyId`/`manifest.version`).

**Não** é possível provar, offline, que aquele `manifest.json` é **o que o R2 ancorou** — a âncora não está no disco.

Avaliação: o conteúdo chegou ao `localDir` pelo **nosso** `move`, a partir do **nosso** `.tmp`, que **foi** validado contra a âncora (`:307-316`). Plantar um diretório auto-consistente exigiria acesso ao sandbox do app — fora do modelo de ameaça. O princípio 2 aprovado exige "validar o **conteúdo e a identidade**", e ambos são verificáveis localmente. **Portanto o contrato aprovado é satisfazível offline** — mas o limite fica registrado como risco residual, e a Alternativa B/C existe justamente para fechá-lo.

---

## 6. Alternativas arquiteturais

**Eliminada pelo contrato, não por preferência:** a **Alternativa D** ("considerar toda publicação sem `READY` inválida e reinstalar") **viola o princípio 6 aprovado** — *"Recovery não pode depender de rede quando o disco já contém evidência suficiente"* —, porque sempre exige rede. É exatamente o comportamento de hoje (retry re-baixa: verificado, 2 downloads). Fica registrada como **linha de base**, não como candidata.

| Critério | **A** — revalidar o final na reconciliação e promover | **B** — journal/intenção antes do move, finalizar no próximo boot | **C** — marcador atômico de publicação completa |
|---|---|---|---|
| Compat. com a arquitetura | **Alta** — reconciliação já existe (`packReconcileService` puro + casca no `PacksContext`) | Média — introduz artefato de estado novo | Média — introduz arquivo/marcador novo no pack |
| Mudança mínima | `needsDiskCheck` (hoje só `READY`) + uma casca de validação + promoção via `setPackEntry` | escrita extra **antes** do move + leitor no boot + limpeza do journal | escrita do marcador **depois** do move + leitura na reconciliação |
| Recuperação offline | **Sim** (§5.1) | **Sim** — e com a âncora, se o journal a persistir | Sim |
| Segurança contra falso `READY` | Boa: valida tudo. **Não prova a âncora** (§5.3) | **Melhor**: o journal pode guardar o `manifestSha256` → âncora verificável offline | Boa: o marcador prova "nós publicamos", mas não prova integridade sozinho — ainda exige validar |
| Preserva versão anterior | Sim (não destrói nada; só promove) | Sim | Sim |
| Idempotência | Natural (validar+promover é idempotente) | Exige apagar o journal ao concluir — mais estado a manter coerente | Natural |
| Complexidade | **Menor** | **Maior** (2 escritas extras + limpeza + estado órfão do próprio journal) | Média |
| Migração | Nenhuma | Nenhuma (journal ausente = nada a fazer) | **Packs já instalados não têm o marcador** → precisaria de fallback ou seriam vistos como não-publicados |
| Android/iOS | Igual — `getInfoAsync`/`readAsStringAsync` já usados nos dois | Igual | Igual |
| Relação com D/E/F | **Neutra** — usa a identidade atual (`storyId@version`) | **Toca D**: o journal guardaria `manifestSha256`, que é campo da identidade resolvida → **risco de antecipar D** | Neutra |
| Provas exigidas | promover válido; não promover incompleto/corrompido; idempotência; sem rede; preservar anterior | idem + journal escrito/limpo + crash durante o journal | idem + marcador + compat. com packs legados |
| Mutantes possíveis | promover só por existir; ignorar hash/bytes/ausente; exigir rede; não idempotente | não escrever o journal; não limpar; confiar no journal sem validar | escrever o marcador antes do move; confiar só no marcador |

**Nenhuma escolha é feita aqui.** A escolha depende de AB-2 e AB-3 (§8) — e a Alternativa B em especial esbarra no limite de escopo com D.

---

## 7. Plano técnico — parte não bloqueada

1. **Causa raiz (fato):** a publicação (`move`, `:429`) e o registro (`setPackEntry READY`, `:432`) são **dois passos não atômicos**, e **nada** no sistema reconcilia o disco quando o segundo não acontece: `collectPackProbes` (`packReconcileService.js:77+`) percorre **o índice** e só sonda entries **`READY`** (`needsDiskCheck`, `:31-32`). Um pack completo no disco fica invisível.
2. **Invariante central (do contrato aprovado):** *um pack só é promovido a `READY` com evidência local de que o conteúdo e a identidade estão íntegros — nunca por existir; nunca dependendo de rede quando o disco basta; sempre idempotente.*
3. **Arquivos candidatos** (**nenhum tocado nesta etapa**):
   - `src/services/packReconcileService.js` — núcleo **puro** (regra de decisão). Hoje `needsDiskCheck` só admite `READY`.
   - `src/context/PacksContext.js` — casca de I/O da reconciliação (`probePackDisk`, `:59-69`).
   - `src/services/packStorageService.js` — **área protegida**; só se a promoção exigir escrita nova (a existente `setPackEntry` deve bastar).
   - `scripts/smoke.js` + `scripts/testing/packInstallHarness.js` — provas.
   - **[BLOQUEADO]** um serviço novo de recovery e/ou o ponto de disparo dependem de **AB-3**.
4. **Funções candidatas:** `needsDiskCheck`, `collectPackProbes`, `reconcileEntry` (puras); `probePackDisk` (casca); **[BLOQUEADO]** a função de validação local e a de promoção dependem da alternativa escolhida.
5. **Ordem de execução:** **[BLOQUEADO]** — depende de AB-2/AB-3.
6. **Compatibilidade:** nenhuma migração de dados. Índices legados sem `errorMessage` normalizam igual (já provado, `3485b95`). Packs já instalados e `READY` **não podem** ser afetados.
7. **Rollback:** o bloco é aditivo — não altera o caminho de instalação. Reverter = reverter o commit. Nenhum dado do usuário muda de forma irreversível (o recovery só **promove**; nunca apaga).
8. **Packs anteriores:** intocáveis. O princípio 3 ("não destruir por inferência incompleta") e a prova `smoke.js` "§13" seguem valendo.
9. **Temporários:** fora do escopo — o `.tmp` já é consumido pelo move; `.tmp` órfão de crash anterior é limpo pelo próximo download (`:292`). Política de cache **não** entra aqui.
10. **Estados do índice:** só `downloading` (C1) e ausente (C2) interessam. **[BLOQUEADO]** `failed` + disco completo (cenário 8) depende de AB-2/AB-3.
11. **Reentrada/idempotência:** exigidas pelo princípio 5; a estratégia depende da alternativa.
12. **Política de rede:** princípio 6 — **nenhuma chamada de rede** quando o disco basta. Prova: contar `fetch-global-manifest` e `download:` no harness (= 0).
13. **Exclusões:** identidade resolvida (D), progresso (E), cancelamento (F), política de cache, `errorMessage` (`3485b95` congelado), UI, assets, dependências.
14. **Critérios de aceite:** os 6 da spec §6.6, mais os que AB-2/AB-3 determinarem.
15. **Gates:** classe "recovery de crash" (spec §12) — smoke + Babel + mutation checks + `expo-doctor` + `expo install --check` + `git diff --check` + revisão adversarial + hashes + **validação no iPhone pelo Eduardo**.
16. **Riscos residuais:** §5.3 (âncora não verificável offline); custo de validação no boot (**AB-3**); cenário 2 (crash *durante* o move) não é provável no harness — só device.

---

## 8. ⛔ Decisão pedida ao Eduardo (Portão Humano 2 parcial)

### AB-2 — Recuperar o caso C2 (instalação nova) exige varrer o disco. Varremos?

**Evidência:** `collectPackProbes` é *index-driven* e só sonda `READY`. C2 não tem entrada → invisível. `readDirectoryAsync` nunca foi usado no projeto. **C2 é provavelmente o caso mais comum** (toda primeira instalação).

| Opção | Consequência |
|---|---|
| **Só C1** (sem varredura) | Corrige o caso **raro** (re-download da mesma versão). O caso comum segue exigindo rede. Mudança menor, zero I/O novo no boot. |
| **C1 + C2** (com varredura de `packs/`) | Corrige o caso comum. Introduz `readDirectoryAsync` — padrão novo. Custo: listar **um** diretório (barato); **validar** cada candidato é que custa (hash de todos os arquivos). |

### AB-3 — Onde o recovery roda?

| Opção | Consequência |
|---|---|
| **Boot** | Recupera antes de o usuário perceber. **Custa tempo de abertura** — exatamente o que esta trilha existe para proteger. Hash de todos os arquivos de um pack pode custar segundos. |
| **Sob demanda** (ao abrir a história) | Custo zero no boot; o usuário só espera quando vai usar aquele pack. Mas a Estante mostra "não baixado" até ele tentar. |
| **Ao focar a tela de histórias** | Meio-termo; complexidade de disparo. |

**Interação:** varrer no boot (AB-2 = C1+C2, AB-3 = boot) é a combinação mais cara. Sob demanda + só a história pedida é a mais barata e resolve o caso que importa **no momento em que importa**.

**Não escolho.** As duas decisões mudam arquitetura e experiência, e a spec §15 as declarou abertas com aprovação do Portão 1.

---

## 9. Estratégia de provas (planejada, não escrita)

Todas pelo **harness real** (`packInstallHarness.js`) + downloader real. Mocks que contornem move, storage ou reconciliação **não servem** como prova principal (spec §12, classe "recovery de crash").

| # | Prova | Como |
|---|---|---|
| 1 | Crash depois do move e antes do `READY` | hook `onBefore('set-entry', ':ready')` — já existe e já é usado (`smoke.js` "§7.4") |
| 2 | Reinicialização | nova instância de serviço/contexto sobre o **mesmo** `mem`/índice |
| 3 | Recuperar **sem rede** | contar `fetch-global-manifest` e `download:` = **0** |
| 4 | Completo é promovido | índice → `ready`, caminhos coerentes |
| 5 | **Incompleto não** é promovido | remover um arquivo do final antes do recovery |
| 6 | **Corrompido não** é promovido | trocar bytes **preservando o tamanho** (senão a checagem de bytes reprova antes e o hash não é exercitado — lição do bloco B) |
| 7 | Idempotência | rodar 2× e comparar assinatura observável |
| 8 | Retry depois do recovery | `ok`, sem download redundante |
| 9 | `READY` anterior preservado | pack anterior íntegro antes e depois |
| 10 | Sem operação ativa após restart | `inFlightInstallCount() === 0` |
| 11 | Índice e FS convergem | entry × disco |
| 12 | Não mexe em `errorMessage` | as provas de `3485b95` seguem verdes |
| 13 | Não mexe em single-flight/filas | as provas de `6466c75`/`1c84773` seguem verdes |
| 14 | Sem dependência de D/E/F | nenhuma referência a identidade resolvida/progresso/cancelamento |

---

## 10. Mutation plan (planejado)

Em memória (`loadModule`/`loadPackDownloader` com `mutate`), **nunca** no working tree. Guarda antitautológica obrigatória: mutação que não aplica **estoura** (já implementada, `packInstallHarness.js`).

| # | Mutante | Morre por |
|---|---|---|
| 1 | Promover `READY` só porque o diretório existe | prova 5 e 6 |
| 2 | Ignorar arquivo ausente | prova 5 |
| 3 | Ignorar hash divergente | prova 6 |
| 4 | Ignorar tamanho divergente | prova 6 (variante de tamanho) |
| 5 | Exigir rede mesmo com evidência local | prova 3 |
| 6 | Apagar `READY` anterior válido | prova 9 |
| 7 | Recovery não idempotente | prova 7 |
| 8 | Manter `DOWNLOADING` indefinidamente | prova 4 (princípio 4) |
| 9 | Promover versão/história incompatível | prova de identidade (manifesto × nome do diretório) |
| 10 | Limpar o diretório antes de validar | prova 9 |
| 11 | Não persistir `READY` | prova 4 |
| 12 | Deixar caminhos inconsistentes no índice | prova 11 |
| 13 | Retry re-baixar desnecessariamente | prova 8 |
| 14 | Misturar recuperação com identidade resolvida | prova 14 |

**Critério:** cada mutante morre por uma prova **específica**. Falha de sintaxe, âncora ausente ou infraestrutura **não conta** como mutante morto.

---

## 11. Revisão adversarial do plano (read-only)

18 lentes: falso positivo/negativo de recuperação; perda de pack anterior; conteúdo parcial; hash/tamanho; idempotência; crash durante recovery; concorrência; índice; filesystem; rede; Android; iOS; migração; testabilidade; ampliação para D/E/F; testes que passam por acidente; complexidade sem benefício.

**Executada nesta etapa** sobre a auditoria e as alternativas — resultados no relatório da sessão. A revisão das **decisões** só faz sentido depois que AB-2/AB-3 forem resolvidas.

---

## 12. O que este plano NÃO faz

Não escreve código. Não escolhe alternativa. Não resolve AB-2 nem AB-3. Não toca os arquivos candidatos. Não inicia D, E ou F. Não reabre `errorMessage` (`3485b95`) nem a decisão da spec §5.3.
