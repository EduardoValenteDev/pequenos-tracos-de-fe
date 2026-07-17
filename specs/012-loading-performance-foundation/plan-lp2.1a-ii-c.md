# Plan — LP2.1a-ii-C: recuperação de instalação interrompida entre o `move` e o `READY`

> **Feature:** `012-loading-performance-foundation` · **Cobre APENAS o bloco `LP2.1a-ii-C`.** D, E e F têm planos próprios, não iniciados.
> **Etapa SDD:** 4 (Plan) — **CONCLUÍDO**. **🚦 Portão Humano 2: PENDENTE.**
> **Branch:** `fix/loading-performance-foundation` · **HEAD na conclusão:** `5213688` · Spec: [spec.md](./spec.md) (Portão 1 APROVADO em 2026-07-16).
> **Risco:** S1 (conteúdo pago íntegro no disco, inacessível).
>
> **Decisões humanas de 2026-07-16 incorporadas:** AB-2 (C cobre C1+C2; `readDirectoryAsync` só em descoberta direcionada), AB-3 (recovery **sob demanda**), direção arquitetural (**Alternativa C — marcador de publicação validada**).
>
> **Nenhum código foi escrito. Nenhum arquivo candidato foi tocado.**

---

## 1. Invariante central (aprovado)

> **Um pack só pode ser recuperado como `READY` quando existe evidência local persistente de que o manifesto ancorado e todos os seus arquivos foram integralmente validados antes da publicação do diretório final.**
>
> A mera existência do diretório final, do `manifest.json` ou de uma entrada `DOWNLOADING` **não é evidência suficiente**.

Este invariante é o que decide toda a arquitetura abaixo: a evidência precisa ser **persistente** (sobreviver ao crash), **local** (sem rede) e **anterior à publicação** (escrita antes do move).

---

## 2. Decisões AB-2 e AB-3 (resolvidas por decisão humana, 2026-07-16)

### AB-2 — escopo: C1 **e** C2, com descoberta direcionada

`readDirectoryAsync` **aprovado**, com estas restrições congeladas:

1. **Proibida** varredura global com validação de todos os packs.
2. **C1:** localizar o candidato **diretamente** pelos dados do índice (sem listar).
3. **C2:** listar **apenas os nomes** da raiz `packs/`.
4. Filtrar **imediatamente** os nomes do `storyId` solicitado.
5. Validar **somente** candidatos daquela história.
6. **Nunca** abrir ou validar packs de outras histórias.
7. **Não** virar garbage collection nem limpeza geral.
8. **Não** remover candidatos antes de existir decisão segura.

### AB-3 — disparo: sob demanda

Acionado **quando uma história pede seu pack**, antes de o sistema concluir que precisa baixar/reinstalar. **Sem varredura nem validação geral no boot.**

Ordem conceitual aprovada:

1. Receber a solicitação do pack da história.
2. Verificar entrada do índice e operação ativa.
3. Procurar evidência local recuperável **só daquela história**.
4. Validar o candidato local quando existir.
5. Promover `READY` **apenas** se toda a evidência necessária for válida.
6. Prosseguir para o fluxo normal de resolução/download quando a recuperação não for possível.

### Estado das oito decisões

| ID | Bloco | Situação |
|---|---|---|
| AB-1 estados/metadados/validação | C | **RESOLVIDA pela auditoria** (§3, §5) — fatos executados |
| **AB-2** escopo/descoberta | C | **RESOLVIDA por decisão humana** (2026-07-16) |
| **AB-3** disparo | C | **RESOLVIDA por decisão humana** (2026-07-16) |
| AB-4, AB-5 | D | **ABERTAS** |
| AB-6, AB-7 | E | **ABERTAS** |
| AB-8 | F | **ABERTA** |

---

## 3. Auditoria do intervalo crítico (fato, executado no harness real)

### 3.1 O fluxo real

Tudo dentro de `guardedInstall` → `runExclusiveByStory(storyId)` e, para chamadores sem `isCancelled`, dentro do single-flight.

| # | Passo | Linha |
|---|---|---|
| 1 | Verify: existência + bytes + sha256 de **todos** + contagem por kind | `:392-410` |
| 2 | `if (errors.length) return failWith(...)` — última saída por validação | `:410` |
| 3 | `throwIfCancelled` — **último ponto cancelável; o swap não é** | `:412` |
| 4 | `getInfoAsync(localDir)` → `preExisting` | `:420-424` |
| 5 | `setPackEntry(DOWNLOADING)` — **só se `preExisting`** | `:425-427` |
| 6 | `deleteAsync(localDir)` — **ato destrutivo** | `:428` |
| 7 | `moveAsync(tempDir → localDir)` — publicação | `:429` |
| 8 | `setPackEntry(READY, {...})` | `:432-440` |
| 9 | `report(READY)` → `onProgress` (UI) | `:441` |
| 10 | `return {ok:true, ...}` | `:444` |
| 11 | `.finally(() => inFlightInstalls.delete(key))` | `:531` |

**Não existe** passo de "atualização de caminhos em memória": os caminhos são recompostos por `getPackLocalDir(storyId, version)` a cada leitura (`PacksContext.normalizedIndex`, `:113-151`). **Não existe** limpeza de temporários após o move: o `.tmp` some porque **foi renomeado**.

### 3.2 O estado que o crash deixa (executado)

```
══ CRASH depois do move / antes do READY — C1 (havia pack anterior) ══
  índice:  {"status":"downloading","version":"1.0.0",
            "localDir":".../david_goliath@1.0.0/","manifestPath":".../manifest.json",
            "totalBytes":15,"downloadedBytes":15,"errorMessage":null}
  final:   audio/01.mp3, manifest.json, scenes/01.webp, scenes/02.webp   (COMPLETO)
  .tmp:    0 arquivo(s)

══ CRASH depois do move / antes do READY — C2 (instalação nova) ══
  índice:  null                                                          (SEM ENTRADA)
  final:   audio/01.mp3, manifest.json, scenes/01.webp, scenes/02.webp   (COMPLETO)
  .tmp:    0 arquivo(s)
```

> **Achado:** em C1 o `totalBytes` do índice é **15 — o do pack ANTIGO**, não os 44 do novo. A marca `DOWNLOADING` passa só `{version, status}` e o merge herda o resto via `?? prev` (`packStorageService.js:135-147`). **`totalBytes` do índice não é evidência confiável** para validar um órfão.

### 3.3 Por que hoje nada recupera

`collectPackProbes` (`packReconcileService.js:77+`) percorre `Object.keys(index)` e pula tudo que não é `READY` (`needsDiskCheck`, `:31-32`). Logo **C1 nem é sondado** e **C2 é invisível**.

O retry **funciona** hoje (executado: `ok:true`, `status:ready`, 2 downloads) — re-baixando. **Nenhum ponto perde dado permanentemente.** O dano é: **conteúdo pago, íntegro no disco, inacessível — e inacessível para sempre se o usuário estiver offline.**

---

## 4. Alternativa selecionada e justificativa

**Selecionada: Alternativa C — marcador local de publicação validada.**

**Justificativa ancorada no invariante (§1),** não em contagem de linhas:

| | Por que não | Por que C |
|---|---|---|
| **A** (revalidar o final e promover) | Prova que o diretório é **auto-consistente com o próprio manifesto**, mas **não** que aquele manifesto é o que o R2 **ancorou** — o `manifestSha256` **não está no disco nem no índice** (§5.3). Isso **fere o invariante**, que exige evidência do *manifesto ancorado*. | — |
| **B** (journal antes do move) | Guardaria a âncora, mas o journal é **estado fora do pack**: precisa ser limpo, pode ficar órfão sozinho, e cria um segundo problema transacional para resolver o primeiro. | — |
| **D** (reinstalar sempre) | **Eliminada pelo princípio 6 aprovado** — sempre depende de rede. É o comportamento de hoje. | — |
| **C** (marcador dentro do pack) | — | A evidência **viaja com o conteúdo**: o mesmo `moveAsync` que publica os arquivos publica a prova de que eles foram validados. Não há estado a limpar, não há órfão de journal, e a atomicidade é a **do próprio move**. Marcador presente ⇒ tudo foi validado **antes** da publicação. É exatamente o invariante, materializado. |

---

## 5. Evidência local (fato, executado)

### 5.1 O que já está no diretório final

O `manifest.json` **está lá** — foi baixado no `.tmp` e **movido junto**.

| Dado | Onde | Suficiente? |
|---|---|---|
| Manifesto local, lista de arquivos, `sha256`/`bytes` por arquivo, `version`, `metadata.storyId`, `kinds`, `totalBytes` | `<final>/manifest.json` | sim |
| Nome do diretório `<storyId>@<version>` | filesystem | sim — **cruzável** com o manifesto |
| **`manifestSha256` (âncora)** | **NÃO ESTÁ** — só no manifesto global (rede); o índice não o guarda | **não** |
| Marcador de publicação | **não existe hoje** | — |

### 5.2 Classificação

- **No diretório:** manifesto + arquivos + hashes + tamanhos + identidade parcial.
- **No índice:** `status`, `version`, caminhos (**recompostos na leitura**), `totalBytes` (**pode estar estale** — §3.2).
- **Só em memória (perdido no crash):** o `pack` do manifesto global — inclusive `manifestSha256`.
- **A persistir antes do move:** **o marcador** (§6) — é a peça que falta.
- **Não necessários para C:** `baseUrl`, `manifestPath` remoto.
- **Pertencem a D:** a coordenação de identidade **entre solicitações**. Não antecipados aqui.

### 5.3 A lacuna que o marcador fecha

Sem marcador, offline só se prova auto-consistência — **não** que o manifesto é o ancorado. Com marcador escrito **após** a validação da âncora, a evidência da âncora passa a existir no disco. É por isso que a Alternativa A não basta.

---

## 6. Contrato do marcador

### 6.1 Nome e localização

- **Nome:** `.ptf-publish.json` (ponto inicial = convenção de metadado interno, não conteúdo).
- **Local:** raiz do diretório do pack — escrito em `${tempDir}.ptf-publish.json`, transportado pelo `moveAsync` para `${localDir}.ptf-publish.json`.

> **⚠ Achado da auditoria — colisão de nome é alcançável.** O schema só rejeita `path` que começa com `/` ou contém `..` (`packManifestService.js:38-42`; filtro em `packDownloadService.js:336-337`). **Nada impede** um manifesto de declarar `files[].path = ".ptf-publish.json"`. Como o marcador é escrito **depois** dos downloads, ele **sobrescreveria** o arquivo declarado — e o verify já teria passado, publicando um pack com conteúdo corrompido em silêncio.
>
> **Regra obrigatória:** rejeitar (via `failWith`) qualquer manifesto cujo `files[].path` colida com o nome do marcador. É uma checagem nova e necessária, no filtro do downloader. Mutante 11 e prova 21 cobrem isso.

### 6.2 Schema

```json
{
  "schemaVersion": 1,
  "storyId": "david_goliath",
  "version": "1.0.0",
  "manifestSha256": "<64-hex minúsculo>",
  "manifestPath": "manifest.json",
  "kinds": ["audio", "scene"],
  "appVersion": "1.0.0"
}
```

Sem segredos, sem URLs (o `baseUrl` é temporário e não pertence à evidência). `kinds` normalizados e ordenados, como em `packInstallKey`. `manifestSha256` em minúsculas, como o downloader já normaliza (`:310`).

### 6.3 Quando é escrito

**Somente depois** de todas estas validações — que já existem no fluxo:

| # | Validação | Linha atual |
|---|---|---|
| 1 | Manifesto global resolvido | `:241-243` |
| 2 | `manifestSha256` ancorado confirmado | `:310-316` |
| 3 | Manifesto local validado (schema) | `:323-324` |
| 4 | `storyId` e `version` confirmados | `:327-332` |
| 5 | Lista de arquivos + contagem por kind | `:336-346`, `:407-409` |
| 6 | Tamanho de cada arquivo | `:398` |
| 7 | `sha256` de cada arquivo | `:399-403` |
| 8 | Compatibilidade (`requiresAppUpdate`, `minAppVersion`) | `:246-248`, `:323` |

**Ponto exato:** logo após `if (errors.length) return failWith(...)` (`:410`) e **antes** do `throwIfCancelled` (`:412`) — ou seja, dentro da região já validada e **antes** do swap. Escrito no `.tmp`, viaja no move.

### 6.4 Escrita segura

- `writeAsStringAsync(${tempDir}.ptf-publish.json, JSON.stringify(marker))`.
- Uma escrita, arquivo pequeno, **dentro do `.tmp`** — se falhar, `failWith` limpa o `.tmp` e o pack anterior é preservado (comportamento já provado).
- **Não** exige atomicidade própria: o `.tmp` **não é conteúdo servido**. A atomicidade que importa é a do `moveAsync`, que publica marcador e arquivos **juntos**.

### 6.5 Validação do marcador no recovery

1. Existe? Senão → **não recuperável** (§7).
2. `JSON.parse` ok? `schemaVersion === 1`? Senão → não recuperável.
3. Campos obrigatórios presentes e bem formados (`manifestSha256` = 64-hex)?
4. `storyId` **bate** com o solicitado **e** com o nome do diretório **e** com `manifest.metadata.storyId`?
5. `version` **bate** com o nome do diretório **e** com `manifest.version`?
6. `sha256` real do `<final>/manifest.json` **bate** com `marker.manifestSha256`? — **este é o elo que fecha a lacuna §5.3.**
7. Cada arquivo de `manifest.files[]` dos `kinds` do marcador: existe, `bytes` batem, `sha256` bate?
8. Só então → promover.

### 6.6 Compatibilidade futura

`schemaVersion` presente desde o início. Marcador com `schemaVersion` desconhecido → **não recuperável** (conservador), nunca "tenta adivinhar".

### 6.7 Ausente / incompleto / divergente

| Situação | Ação | Razão |
|---|---|---|
| **Ausente** | **Não promover.** Seguir para o fluxo normal (pode usar rede). | Sem marcador não há evidência do manifesto **ancorado** (§5.3) — o invariante não é satisfeito. |
| **Incompleto** (falta campo, JSON inválido, `schemaVersion` desconhecido) | **Não promover.** | Idem. Conservador. |
| **Divergente** do diretório/manifesto (storyId, version, `manifestSha256`, arquivo, byte) | **Não promover.** | Evidência contraditória é pior que ausente. |

Em **todos** os casos: **não destruir** o candidato (princípio 3 + §8).

---

## 7. Fluxos

### 7.1 Instalação normal (com marcador) — mudança mínima

```
… verify de todos os arquivos (:392-410)
  └─ errors? → failWith                                    [inalterado]
  ├─ NOVO: escrever .ptf-publish.json no .tmp              ← única escrita nova
  ├─ throwIfCancelled (:412)                               [inalterado]
  ├─ preExisting? → setPackEntry(DOWNLOADING) (:425-427)   [inalterado]
  ├─ deleteAsync(localDir) (:428)                          [inalterado]
  ├─ moveAsync(.tmp → localDir) (:429)   ← publica arquivos E marcador juntos
  └─ setPackEntry(READY, …) (:432-440)                     [inalterado]
```

Mais a regra de colisão de nome (§6.1) no filtro de `files[]`.

### 7.2 Recovery sob demanda

```
solicitação do pack da história (storyId)
  │
  ├─ 1. operação ativa para esta história? ──sim──► não faz nada; deixa o fluxo normal seguir
  │       (o recovery NÃO compete com uma instalação em andamento)
  │
  ├─ 2. ler o índice (getPackEntry)
  │       ├─ status === READY ──────────────────► nada a recuperar; fluxo normal
  │       └─ senão (downloading | failed | ausente) → segue
  │
  ├─ 3. reunir candidatos SÓ desta história
  │       ├─ C1: entry.version existe? → candidato direto = getPackLocalDir(storyId, entry.version)
  │       │       (getInfoAsync; NÃO lista o diretório)
  │       └─ C2/complemento: readDirectoryAsync(`${doc}packs/`)
  │               → filtrar nomes: descartar '.tmp'; manter apenas `${storyId}@*`
  │               → NUNCA abrir nomes de outras histórias
  │
  ├─ 4. validar cada candidato desta história (§6.5) — marcador → manifesto → identidade → arquivos
  │
  ├─ 5. decidir (§8)
  │       ├─ exatamente 1 válido  → promover READY (via setPackEntry, dentro da fila)
  │       ├─ 0 válidos           → não promove; fluxo normal (pode usar rede)
  │       └─ 2+ válidos          → AMBÍGUO: não escolhe; fluxo normal resolve a identidade
  │
  └─ 6. devolver ao chamador: recuperado (pronto) ou "prossiga para download"
```

**Custo no caminho feliz:** um `getPackEntry` (já feito pelo fluxo) + **zero** I/O quando o índice já está `READY`. O `readDirectoryAsync` só ocorre quando o índice **não** está `READY` — isto é, quando o app já ia baixar de qualquer forma.

---

## 8. Múltiplos candidatos (política congelada)

1. **C1:** priorizar o candidato da versão indicada pelo índice.
2. **Mesmo em C1: validar integralmente.** O índice não é evidência (§3.2).
3. **C2:** um **único** candidato integralmente válido **e com marcador válido** pode ser recuperado.
4. Candidatos inválidos **não** contam como opção; sua remoção respeita a política segura (item 8).
5. Com **2+ válidos**, **proibido** escolher por: maior versão · data mais recente · ordem do filesystem · nome lexicográfico.
6. Havendo ambiguidade → **o fluxo normal resolve a identidade esperada** (busca o manifesto global).
7. Depois de resolvida, **somente** o candidato correspondente pode ser recuperado.
8. **Nenhum pack válido é destruído** antes de a recuperação/substituição terminar com sucesso.

> **Quando 2+ candidatos válidos são possíveis?** Duas versões da mesma história instaladas (`story@1.0.0` e `story@2.0.0`) — o bump **não apaga** o diretório antigo (spec §7.5.2, vazamento conhecido, cache = fora da trilha). Ambos podem ter marcador válido. **Nenhum é "o certo" sem saber a versão esperada** — que só o manifesto global diz. Daí a regra 6.

**Packs legados (sem marcador) — congelado:**

1. **Nunca** promovidos automaticamente a `READY`.
2. Ausência de marcador = **não há evidência local do `manifestSha256` ancorado**.
3. **Não destruir** antes de substituição segura.
4. O fluxo normal pode **resolver o manifesto de novo** para decidir se o candidato antigo corresponde ao esperado.
5. **Rede é permitida** quando a evidência local é insuficiente — o princípio 6 se aplica *"quando o disco já contém evidência suficiente"*, e aqui não contém. **Não há violação.**
6. **Sem migração retroativa insegura.**
7. **Decisão recomendada:** candidatos antigos **permanecem** (nem quarentena, nem remoção). A substituição já ocorre naturalmente: o fluxo normal faz `deleteAsync(localDir)` + `move` da mesma versão, ou instala outra versão em outro diretório. Criar quarentena seria estado novo a manter; remover seria garbage collection — **ambos fora do escopo**.

---

## 9. Interações

| Com | Como |
|---|---|
| **Índice** | Ler por `getPackEntry`. Promover por `setPackEntry(READY, {version, localDir, manifestPath, totalBytes, downloadedBytes, errorMessage: null})` — **a mesma** escrita do fluxo normal. `totalBytes` vem do **manifesto do disco**, nunca do índice (§3.2). |
| **`runSerialized`** | A promoção passa por `setPackEntry`, que já roda **inteiro** dentro da fila (`packStorageService.js:129`). **Nada a fazer** — e nada pode contorná-la. |
| **Fila por história** | O recovery **deve** rodar dentro de `runExclusiveByStory(storyId)`, senão poderia ler o disco enquanto uma instalação faz `delete`/`move` da mesma história. É a mesma fila física; reusar, não criar outra. |
| **Single-flight** | O recovery **não** cria voo nem entra em `inFlightInstalls`. Se há voo ativo para a história, o recovery **não roda** (§7.2 passo 1): quem está instalando vai gravar `READY` de qualquer forma. |
| **`errorMessage`** | A promoção passa `errorMessage: null` → **limpa** (contrato `3485b95`). Coerente: o pack está pronto. **Não reabrir** a semântica. |
| **Reconciliação** | **Não alterar** `needsDiskCheck`. Ele existe para rebaixar `READY` **inválido** em memória; o recovery é o caminho oposto (promover com evidência) e é **sob demanda**, não na reconciliação. Mantê-los separados evita que o boot herde custo. |

---

## 10. Idempotência, crash no recovery e rollback

- **Idempotente:** validar+promover não tem efeito colateral acumulativo. Rodar 2× → o 2º vê `READY` e sai no passo 2 (§7.2). Prova 7/16.
- **Crash durante o recovery:** a única escrita é o `setPackEntry(READY)` final, **depois** de toda a validação, e `AsyncStorage.setItem` grava a chave inteira de uma vez (`packStorageService.js:88-97` documenta: "não há escrita parcial de meia entrada"). Logo: **ou promoveu, ou não**. Um recovery interrompido antes disso não deixa efeito nenhum.
- **Rollback:** o bloco é **aditivo**. O recovery só **promove**; nunca apaga. Reverter = reverter o commit; nenhum dado do usuário muda de forma irreversível. O marcador em packs já instalados vira arquivo inerte e ignorado.

---

## 11. Política de rede

- **Zero rede** quando um candidato **inequívoco** tem evidência local suficiente (marcador válido + manifesto + arquivos). Prova: `fetch-global-manifest` e `download:` = **0**.
- **Rede permitida** quando: não há candidato; nenhum é válido; falta marcador (legado); ou há **ambiguidade** (2+ válidos). Nesses casos o disco **não** contém evidência suficiente — o princípio 6 não se aplica.

---

## 12. Arquivos e funções candidatos (**nenhum tocado**)

| Arquivo | Mudança prevista |
|---|---|
| **`src/services/packPublishMarker.js`** *(novo)* | Núcleo **puro**: `buildPublishMarker(...)`, `validatePublishMarker(marker, {storyId, version, manifest})`, `MARKER_FILENAME`. Sem I/O — testável como `packReconcileService`. |
| **`src/services/packRecoveryService.js`** *(novo)* | Casca do recovery: candidatos (C1 direto / C2 direcionado), leitura, validação, promoção. Recebe deps por injeção (padrão `1c84773`). |
| `src/services/packDownloadService.js` | (a) escrever o marcador no `.tmp` após `:410`; (b) rejeitar colisão de `path` com o marcador no filtro `:336-337`; (c) chamar o recovery no início do fluxo, dentro da fila. |
| `src/services/packStorageService.js` | **Área protegida — não alterar.** `setPackEntry` já basta. |
| `src/services/packReconcileService.js` | **Não alterar** (§9). |
| `scripts/testing/packInstallHarness.js` | Duas APIs novas no FS em memória — **`readDirectoryAsync`** (auditado: existe no `expo-file-system/legacy`, `FileSystem.d.ts:88`) e **`writeAsStringAsync`** (`:58`), que o marcador usa e o double **ainda não tem**. Mais helper para semear órfão com/sem marcador. Ambas devem **falhar onde o real falha** (ler diretório inexistente lança; escrever sem diretório-pai lança — a lição do achado A do bloco A). |
| `scripts/smoke.js` | Bloco `LP2.1a-ii-C`. |

## 13. Ordem exata de implementação

1. `packPublishMarker.js` (puro) + provas do núcleo.
2. `readDirectoryAsync` no harness + helpers de órfão (com/sem marcador).
3. Escrita do marcador no fluxo normal + **regra de colisão** + provas 13/21.
4. `packRecoveryService.js` (candidatos + validação + promoção) + provas 1–12.
5. Ligação sob demanda no downloader, dentro da fila + provas 14–20.
6. Mutation checks (§15).
7. Revisão adversarial + gates + validação no iPhone.

Cada passo mantém o smoke verde. Passos 1–2 não mudam comportamento; o passo 3 muda o conteúdo publicado (mais um arquivo) — atenção a `listFiles` nas provas do bloco B.

---

## 14. Estratégia de provas

Todas pelo **harness real** + downloader real. Mocks que contornem move, storage ou reconciliação **não servem** (spec §12, classe "recovery de crash").

**Base (14, do plano anterior):** crash depois do move · restart · recuperar sem rede · completo promovido · incompleto **não** · corrompido **não** (byte trocado **preservando tamanho**) · idempotência · retry depois do recovery · `READY` anterior preservado · sem operação ativa após restart · índice e FS convergem · não mexe em `errorMessage` · não mexe em single-flight/filas · sem dependência de D/E/F.

**Adicionais (20, exigidas):**

| # | Prova |
|---|---|
| 1 | C2 com **um** candidato válido → promovido |
| 2 | C2 com candidato **sem marcador** → não promovido |
| 3 | C2 com **marcador inválido** (JSON quebrado / `schemaVersion` desconhecido) → não promovido |
| 4 | C2 com **dois candidatos, um válido** → promove o válido |
| 5 | C2 com **dois válidos**, identidade não resolvida → **não escolhe**; devolve ao fluxo normal |
| 6 | Resolução posterior escolhe o candidato **correto** |
| 7 | **Ordem do filesystem não influencia** — mesma entrada, `readDirectoryAsync` devolvendo ordem invertida → **mesmo** resultado |
| 8 | Marcador com `storyId` divergente → não promovido |
| 9 | Marcador com `version` divergente → não promovido |
| 10 | Marcador com `manifestSha256` divergente → não promovido |
| 11 | Marcador válido + **manifesto alterado** → não promovido (o hash do manifesto não bate) |
| 12 | Marcador válido + **arquivo alterado** → não promovido |
| 13 | Crash **depois do marcador, antes do move** → `.tmp` tem marcador, final intacto; nada promovido |
| 14 | Crash **depois do move, antes do `READY`** → recuperado |
| 15 | Crash **durante a promoção** → ou promoveu, ou não; nunca meio-termo |
| 16 | Recovery repetido **depois** de promoção concluída → no-op |
| 17 | Pack **legado sem marcador preservado** até substituição segura |
| 18 | **Nenhum acesso a candidatos de outras histórias** — semear `noah@1.0.0`; contar eventos: nenhum `read:`/`hash:` em `noah` |
| 19 | **Nenhuma varredura no boot** — nenhum `readDirectoryAsync` sem solicitação |
| 20 | **Zero rede** com candidato inequívoco |
| 21 | Manifesto que declara `path` = nome do marcador → **rejeitado** (§6.1) |

---

## 15. Mutation checks

Em memória (`loadModule`/`loadPackDownloader` com `mutate`), **nunca** no working tree. Guarda antitautológica já implementada: mutação que não aplica **estoura**.

**Base (14):** promover só por existir · ignorar ausente · ignorar hash · ignorar tamanho · exigir rede · apagar `READY` anterior · não idempotente · manter `DOWNLOADING` para sempre · promover versão/história incompatível · limpar antes de validar · não persistir `READY` · caminhos inconsistentes · retry re-baixar à toa · misturar com identidade resolvida.

**Adicionais (15):**

| # | Mutante | Morre por |
|---|---|---|
| 1 | Aceitar candidato **sem marcador** | prova 2 |
| 2 | Ignorar `manifestSha256` divergente | prova 10/11 |
| 3 | Aceitar marcador **incompleto** | prova 3 |
| 4 | Escolher **o primeiro** candidato retornado | provas 5 e 7 |
| 5 | Escolher a **maior versão** sem identidade resolvida | prova 5 |
| 6 | Validar **todos** os packs da raiz | prova 18 |
| 7 | Executar recovery **no boot** | prova 19 |
| 8 | Apagar candidato antigo antes de substituição segura | prova 17 |
| 9 | Promover `READY` antes de validar todos os arquivos | prova 12 |
| 10 | Reutilizar `totalBytes` **do índice** | prova 11 (índice tem valor estale — §3.2) |
| 11 | Aceitar marcador **de outra história** | prova 8 |
| 12 | Aceitar marcador **de outra versão** | prova 9 |
| 13 | **Não serializar** a promoção (escrever fora de `setPackEntry`) | provas PK-02 existentes |
| 14 | Rodar recovery **em paralelo** com instalação ativa da mesma história | prova de concorrência (fila) |
| 15 | Re-baixar mesmo após recuperação inequívoca | prova 20 |

Cada mutante morre por prova **específica**. Erro de sintaxe, âncora ou infraestrutura **não conta** como mutante morto.

---

## 16. Gates

Classe **"recovery de crash"** (spec §12): smoke + Babel dos arquivos de aplicação + mutation checks codificados + `expo-doctor` + `expo install --check` + `git diff --check` + revisão adversarial read-only + integridade de hashes + **validação real no iPhone pelo Eduardo**. Único drift autorizado: `expo@54.0.35` → `~54.0.36`.

## 17. Exclusões

Identidade resolvida (D) · progresso (E) · cancelamento (F) · política de cache/garbage collection (inclui o diretório da versão antiga) · `errorMessage` (`3485b95`) · reconciliação (`needsDiskCheck`) · UI · assets · áudios · dependências · builds.

## 18. Critérios de aceite

1. Um órfão **com marcador válido** e conteúdo íntegro é promovido a `READY` **sem rede**.
2. Órfão **sem marcador**, com marcador inválido/divergente, ou com conteúdo incompleto/corrompido **não** é promovido.
3. Recovery é **idempotente**.
4. **Nenhum** candidato de outra história é aberto.
5. **Nenhuma** varredura ocorre no boot.
6. Com **2+ candidatos válidos**, nada é escolhido arbitrariamente.
7. Packs válidos e legados **não** são destruídos.
8. As provas de `6466c75`, `824aec1`, `478b0a5`, `1c84773`, `ead7f18`, `3485b95` seguem **verdes**.
9. Todos os mutantes (§15) morrem por prova específica.
10. Validação no iPhone pelo Eduardo.

## 19. Riscos residuais

1. **Colisão de nome do marcador** — alcançável hoje (§6.1); mitigada por regra nova + prova 21. **Se a regra falhar, publica-se conteúdo corrompido em silêncio.** É o risco mais sério do bloco.
2. **Crash *durante* o `moveAsync`** — não reproduzível no harness (o FS em memória move atomicamente). Se a plataforma não garantir rename atômico, um diretório meio-movido teria marcador sem arquivos → **prova 12 o rejeita**. Verificação real só no device.
3. **Packs legados** ficam sem recuperação offline até serem substituídos — aceito (§8).
4. **Diretórios de versões antigas** acumulam no disco — vazamento conhecido, cache, fora da trilha.
5. **`.tmp` órfão** de crash anterior — limpo pelo próximo download (`:292`).
6. **O marcador aumenta o pack em um arquivo** — as provas do bloco B que contam `listFiles` precisarão de ajuste (previsto no passo 3 da §13).

---

## 20. 🚦 Portão Humano 2 — PENDENTE

Este plano está **concluído** e aguarda aprovação. Nada será implementado antes dela.
