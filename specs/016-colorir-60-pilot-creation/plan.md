# Plan — Piloto Colorir 60 · A Criação (016-colorir-60-pilot-creation)

> **Feature:** `016-colorir-60-pilot-creation` · **Etapa SDD:** 4 (Plan).
> **Portão Humano 2:** ⏳ **AGUARDANDO aprovação do Fundador** (este documento é o artefato submetido à revisão; nenhum código é escrito antes do Portão 2).
> **Branch:** `plan/colorir-60-pilot-creation` · **Base/HEAD:** `214d5aa` (linhagem documental do Colorir 60 consolidada).
> **Specs governantes:** [014 arquitetura](../014-colorir-60/spec-colorir-60.md) · [015 rollout gates](../015-colorir-60-rollout-gates/spec-colorir-60-rollout-gates.md) · [016 piloto/catálogo](./spec-colorir-60-pilot-creation.md) (dona deste plano) · [017 prompts/produção](../017-colorir-60-creation-production-prompts/spec-colorir-60-creation-production-prompts.md).
> **Árbitro:** [`docs/DECISIONS.md`](../../docs/DECISIONS.md).

Este plano transforma as decisões ratificadas nas specs 014–017 numa **arquitetura executável e auditável**. Não escreve código, não copia/integra assets, não cria tasks e não reabre decisões visuais/teológicas. Onde as specs **não** decidiram (posição pública na interface, nome exibido à criança, regra de desbloqueio, métrica de conclusão do "colorir da história"), o plano **marca como decisão em aberto** e **não inventa** — ver §"Decisões em aberto".

---

## Etapa 5 — Decisões imutáveis que o plano assume (18)

O plano é construído **sobre** estas decisões; nenhuma delas é reaberta.

1. **Aditivo, não substitutivo.** Colorir 60 **não** substitui as ~200 ilustrações narrativas nem os 202 `require()` de colorir legado. (PL01A-03; spec 014.)
2. **Piloto = somente A Criação (`creation`).** Nenhuma outra história é tocada. (PL01A-13; spec 016.)
3. **Identidade semântica.** A atividade é identificada por **`activityId`** (`light` · `living_world` · `people_and_care`), **nunca** por `sceneId`/posição. (spec 014/016.)
4. **Identidade composta `(storyId, activityId)` sem `#`.** (spec 014.)
5. **Catálogo dos 3** (spec 016 §11): `light` "Haja luz" ordem 1; `living_world` "O mundo cheio de vida" ordem 2; `people_and_care` "Na criação de Deus" ordem 3.
6. **Resultado da curadoria** (spec 016 §10): 1 reaproveitado (`light` = conteúdo de `scene_02`), 2 novos (`living_world`, `people_and_care`), **0 sobrescritos**, **10 linearts legados preservados**.
7. **Hashes fixos dos 3 aprovados** (spec 017 §15): `light` `35d6f50c…faffaddb`; `living_world` `818cd917…`; `people_and_care` `59988d9a…`. Dimensões **1122×1402**, razão **4:5**.
8. **Exceção visual ratificada** de `people_and_care` (mulher à esquerda regando a muda; homem à direita cuidando do solo; animais ave/cervo/coelho; **sem cordeiro**) — PL01G-FIX1. **Não reabrir** (regras 10/11).
9. **Capability `coloring60`:** `modelVersion = 2`, **exatamente 3 atividades**. (spec 014.)
10. **D1 — preservação do lineart.** Nenhum pixel de cor é exibido sem contorno; `makeChildArtVisual` retorna `null` sem `baseImage`. (spec 015 §2/§20; confirmado em `StoryBookScreen.js:99`.)
11. **D2 / C14 / §15 — entitlement na fronteira real de escrita.** Free persiste **zero pixels**; salvar = Plano Família; fail-closed → free. (spec 015 §9/§10/§15.)
12. **D3 — prova de aprovação por formato** registrada como contrato histórico de produção. (spec 017 §15.)
13. **D4 — estado honesto sem lineart** (cai para oficial/fallback; nunca cor sozinha). (spec 015 §20.)
14. **D5 — conclusão por traço deliberado** (`hasMeaningfulPaint`). (spec 015 §20.)
15. **D6 — plano de escrita reavaliado a cada tentativa de persistência.** (spec 015 §20.)
16. **Salvar ≠ concluir.** Marcar a atividade como feita é **plan-agnóstico** (free conclui a experiência); persistir pixels é **gated**. (spec 015 §1; `coloringActivityService.js`.)
17. **Free = `creation` + `noah`; `creation` é grátis; free salva 0 artes.** (DECISIONS E1-STORIES-GRATIS, E1-ARTES-SALVAR, D-FREE-SEM-SALVAR; `planConfig.FREE_STORY_IDS`.)
18. **PNGs fora do Git.** A integração dos 3 assets exige **plan + tasks próprios**; este bloco **não** copia, move, renomeia, edita nem integra imagem. (PL01G-01; regras 6/7.)

---

## Etapa 6 — Arquitetura alvo

Princípio-mestre: **paralelismo aditivo**. O Colorir 60 ganha catálogo, resolvedor, chaves de persistência e chave de conclusão **próprios**, ao lado dos caminhos legados indexados por `sceneId`. Nenhuma estrutura legada muda de forma ou semântica; o motor de pintura (`ColoringCanvas`) e a tela (`ColoringScreen`) são **reutilizados** por composição, não bifurcados.

### 6.1 — Catálogo (fonte única da identidade semântica)
- Novo módulo **somente-dados** (ex.: `src/data/coloring60Catalog.js`) declarando, por `storyId`, a lista ordenada de atividades: `{ activityId, order, title, assetPath }`, conforme spec 016 §11. No piloto, só `creation` tem entradas.
- `assetPath` aponta para o **caminho futuro** `assets/stories/<storyId>/coloring/activities/<activityId>.png` (string declarativa; nenhum `require()` é adicionado neste bloco — a integração dos binários é um bloco posterior, regra 7).
- API de leitura pura: `getColoring60Activities(storyId)` → array ordenado (ou vazio); `getColoring60Activity(storyId, activityId)` → entrada ou `null`. **Sem** acoplamento com `coloringImages.js` legado.

### 6.2 — Identidade técnica dos 3 assets + hash gate
- Cada asset tem **identidade tripla**: (a) `activityId` semântico; (b) `assetPath` canônico; (c) **SHA-256 esperado** (spec 017 §15), com dims 1122×1402 e razão 4:5.
- **Hash gate (na integração futura, não neste bloco):** um script de verificação (ex.: `scripts/verify-coloring60-assets.js`) que, **antes e depois** de qualquer cópia dos PNGs para a árvore de assets, computa o SHA-256 real e o compara ao esperado; diverge → **falha dura**, integração abortada. O gate é **descrito aqui**; sua execução pertence ao bloco de integração de assets.
- O gate impede: arquivo trocado, recompressão silenciosa, dimensões erradas, exceção visual desfeita.

### 6.3 — Resolvedor de imagem (agnóstico e separado)
- Novo resolvedor **próprio** do Colorir 60 (ex.: `resolveColoring60Lineart(storyId, activityId)`), consumindo **apenas** o catálogo §6.1. **Não** passa por `getColoringImage(storyId, sceneId)` nem por `useResolvedColoringImage(story, cenaIndex)` (que são indexados por cena e permanecem exclusivos do legado).
- Fallback honesto: catálogo sem entrada ou asset ausente → retorna estado "sem lineart" → tela mostra estado de imagem faltante (D4). Nunca pinta sem contorno.
- **Compatibilidade com packs remotos fica fora do piloto** (ver §6.8): o resolvedor do piloto é **local-first puro** (fonte = asset empacotado no bundle na integração futura).

### 6.4 — Navegação
- Entrada na `ColoringScreen` passa a aceitar, **aditivamente**, uma atividade Colorir 60 identificada por `(storyId, activityId)` — via novo parâmetro de rota (ex.: `activityId`) **sem remover** o caminho legado por cena.
- A tela decide o modo pela presença de `activityId`: presente → caminho Colorir 60 (resolvedor §6.3, chaves §6.5, conclusão §6.6); ausente → caminho legado por `cena.id` intocado.
- **Posição pública** de onde a criança abre a atividade (card, aba, ordem visível) **não é decidida pelas specs** → decisão em aberto; o plano só garante que a rota **aceita** o destino.

### 6.5 — Persistência (keyspace próprio, sem colisão)
- **Chave de pixels nova, separada do legado:** `@ptf_drawing60_s<storyId>_a<activityId>` (namespace distinto de `@ptf_drawing_s<storyId>_c<sceneId>`). Declarada em `src/services/storageKeys.js` ("novas chaves devem vir daqui") e incrementando o schema conforme convenção.
- **Motivo da separação:** `light` reaproveita o *conteúdo* de `scene_02`, mas sua identidade é `activityId`; reusar a chave legada de cena colidiria com desenhos legados de `scene_02`. Namespace próprio = zero colisão, legado imutável.
- **Formato do payload = idêntico ao legado** (ponteiro v3 → `ptf_blobs/drawings/`, via `drawingStorage`/`fileBlobStore`). O plano **reutiliza** o pipeline v3; não cria formato novo. A função de escrita recebe a chave Colorir 60, mas o mecanismo (`buildPointer`/`writeBlob`) é o mesmo.
- **`hasMeaningfulPaint`** (D5) permanece o juiz de "houve traço".

### 6.6 — Entitlement na fronteira real de escrita + **DECISÃO CRÍTICA DE PROGRESSO**
- **Fronteira real de escrita** = `ColoringScreen.handleProximo` → `exportPaint(cb)` → gravação. Hoje essa gravação **não consulta plano** (dívida D2/C14). O plano corrige **exatamente aqui**.
- **Regra de escrita (fail-closed):** antes de persistir pixels, consultar o plano de forma síncrona e fail-closed (`accessControl.getCurrentPlan()` = `entitlementService.getEntitlementPlan()`). `premium` → persiste (chave §6.5). Não-premium/indeterminado → **persiste zero pixels** (D2). O guard de lineart (`canvasReady`) e o guard de traço (`hasPainted`/D5) permanecem **antes** do guard de plano.
- **DECISÃO CRÍTICA: separar "salvar arte" de "concluir atividade".**
  - **Concluir a atividade** (marcar como vivida) é **plan-agnóstico**: free e Plano Família concluem. Mecanismo = **nova chave de conclusão** `@ptf_coloring60_done_<storyId>_<activityId>` (paralela a `@ptf_coloring_done_<storyId>_<sceneId>`; `coloringActivityService` estendido aditivamente ou serviço irmão). Marcar conclusão **não** persiste pixels.
  - **Salvar a arte** (persistir pixels no disco) é **gated a Plano Família** (D2/E1-ARTES-SALVAR/D-FREE-SEM-SALVAR).
  - Consequência: **free colore, vê sua arte na sessão e conclui a atividade; ao sair, 0 pixels ficam no disco.** Plano Família colore, conclui **e** mantém a arte.
- **Ordem canônica no write boundary:** `canvasReady` (D1/lineart) → `hasPainted`/`hasMeaningfulPaint` (D5/traço) → marcar conclusão (plan-agnóstico) → **checar plano** → se premium, persistir pixels; senão, pular persistência → `refreshProgress` → voltar. Cada tentativa reavalia o plano (D6).
- **Métrica de "colorir de A Criação concluído"** (1 de 3? 3 de 3?) **não é decidida** pelas specs (D-CONCLUSAO-TOTAL-B está `[A CONFIRMAR]`) → **decisão em aberto**; o plano entrega apenas a conclusão **por atividade**, não o roll-up da história.

### 6.7 — Preservação do lineart (D1)
- O contorno do Colorir 60 vem **sempre** do resolvedor §6.3 (asset da atividade). Enquanto a arte é exibida (na sessão ou em qualquer superfície futura), o contorno é recomposto por cima (mesmo contrato `makeChildArtVisual`/`paintWithLineart`): **sem contorno → sem cor** (retorna `null`, cai para estado honesto).
- **Livrinho:** o modo `child` do Livrinho hoje recompõe o `baseImage` via `getColoringImage(story.id, cena.id)` — **indexado por cena**. A arte Colorir 60 é indexada por `activityId` e **não** apareceria nesse recompositor sem uma extensão dedicada. **Exibir a arte Colorir 60 no Livrinho está FORA do escopo do piloto** e é **decisão em aberto** (exigiria resolver por `activityId` no Livrinho). O plano **não** altera o Livrinho e **não** inventa essa superfície — D1 permanece intacto justamente por não misturar keyspaces.

### 6.8 — Compatibilidade com packs remotos
- O runtime de packs (Fase 2) resolve colorir remoto por **posição** (`coloring/scene_NN.png`), gated hoje a `david_goliath`. A identidade Colorir 60 é **semântica** (`activities/<activityId>.png`) e **não** por posição.
- **No piloto, o Colorir 60 é local-first** (asset no bundle na integração futura); **não** consome pack remoto. O resolvedor §6.3 **não** chama `contentResolver`/`resolveRemoteColoringUri`. Isso mantém `creation` como camada `starter` (sempre local) e evita acoplar o piloto à pipeline remota.
- **Contrato de convivência:** o path de atividade (`activities/<activityId>.png`) é um **namespace distinto** do path de cena (`coloring/scene_NN.png`); um manifesto de pack futuro que queira servir Colorir 60 remoto precisará de um **kind/rota próprios** — item de backlog, **fora do piloto**.

### 6.9 — Feature flag e rollout
- **Flag única** `COLORIR_60_CREATION_PILOT_ENABLED` (default **false**), centralizada (ex.: `src/config/featureFlags` ou o local canônico de flags do projeto). Com a flag off: catálogo não expõe atividades, rota Colorir 60 inerte, nenhuma superfície nova visível — app idêntico ao atual.
- **Escopo do rollout:** somente `creation`. A flag é **kill switch** e porta de QA em device.
- **Gate de rollout (spec 015 §15):** a flag só pode ir a `true` em produção quando D1 e D2 estiverem **provados em runtime** (lineart presente; free = 0 pixels) e os 3 assets passarem o hash gate §6.2.

---

## Etapa 7 — Matriz de arquivos

| Arquivo | Ação | Papel no piloto |
|---|---|---|
| `src/data/coloring60Catalog.js` | **NOVO** | Catálogo semântico (§6.1): 3 atividades de `creation`, `assetPath` + SHA esperado. Somente-dados. |
| `src/services/coloring60Resolver.js` | **NOVO** | `resolveColoring60Lineart(storyId, activityId)` local-first (§6.3). |
| `src/services/storageKeys.js` | **ALTERAR** | Adicionar `drawing60(storyId, activityId)` e `coloring60Done(storyId, activityId)`; bump de schema. Aditivo. |
| `src/services/drawingStorage.js` | **ALTERAR (mínimo)** | Aceitar gravar/ler pelo keyspace Colorir 60 (parâmetro de chave), reutilizando o pipeline v3. **Sem** mudar formato v3 nem o caminho legado. |
| `src/services/coloringActivityService.js` | **ALTERAR (mínimo)** | Marcar/consultar conclusão por `activityId` (chave §6.6), plan-agnóstico. Aditivo ao caminho por cena. |
| `src/screens/ColoringScreen.js` | **ALTERAR** | Aceitar `activityId` (rota), usar resolvedor §6.3, aplicar ordem canônica do write boundary §6.6 (**inclui o gate de entitlement fail-closed que hoje falta**). Caminho legado por cena intocado. |
| `src/navigation` / rota de Colorir | **ALTERAR (mínimo)** | Aceitar param `activityId` aditivo. |
| Flag `COLORIR_60_CREATION_PILOT_ENABLED` | **NOVO** | Kill switch (§6.9). |
| `scripts/verify-coloring60-assets.js` | **NOVO (integração futura)** | Hash gate §6.2. Descrito aqui; usado no bloco de integração de assets. |
| `scripts/smoke.js` | **ALTERAR** | Bloco de testes §9. |
| **`src/assets/coloringImages.js`** | **SOMENTE LEITURA / PRESERVAR** | 202 `require()` legado indexado por `[storyId][sceneId]`. **Não tocar.** |
| **200 linearts narrativos + 10 linearts legados de `creation`** | **PRESERVAR** | Regra 6/spec 016 §10. Não apagar/mover/sobrescrever. |
| **`src/screens/StoryBookScreen.js` / `storyBookPagesService.js`** | **SOMENTE LEITURA / PROIBIDO** | Livrinho por cena; exibir Colorir 60 aqui é decisão em aberto (§6.7). Não tocar no piloto. |
| **`ColoringCanvas.js` (motor)** | **SOMENTE LEITURA / PROIBIDO** | Reusado por composição; **não** bifurcar o motor. |
| **`contentResolver.js` / `PacksContext.js` / packs R2** | **PROIBIDO** | Piloto é local-first (§6.8). |
| **Os 3 PNGs aprovados** | **PROIBIDO neste bloco** | Integração = bloco próprio (regra 7). |
| **paywall / progresso / conquistas / `accessControl` (lógica)** | **PROIBIDO** | Só **consumir** `getCurrentPlan()` no write boundary; não alterar sua lógica. |

---

## Etapa 8 — Fases de implementação (P0–P10)

Cada fase: objetivo · entradas · arquivos · gate · evidência · parada · dependências · riscos.

- **P0 — Base e flag.** *Obj:* criar `COLORIR_60_CREATION_PILOT_ENABLED=false` e confirmar app inalterado. *Entradas:* §6.9. *Arquivos:* flag. *Gate:* smoke verde; app idêntico com flag off. *Evidência:* diff mínimo; print app off. *Parada:* se a flag exigir tocar áreas protegidas → PARAR. *Dep:* —. *Risco:* baixíssimo (aditivo/inerte).
- **P1 — Catálogo somente-dados.** *Obj:* `coloring60Catalog.js` com os 3 (§6.1). *Gate:* teste de catálogo §9.1 verde. *Evidência:* asserts de ordem/títulos/paths/SHA batendo com spec 016 §11 + 017 §15. *Parada:* qualquer título/ordem/path divergente da spec → PARAR. *Dep:* P0. *Risco:* baixo.
- **P2 — Chaves de persistência e conclusão.** *Obj:* `storageKeys.drawing60`/`coloring60Done` + bump schema. *Gate:* §9.2 (não colisão com chaves legadas). *Evidência:* teste provando `drawing60` ≠ `drawing` para os mesmos ids. *Parada:* se colidir com chave legada → PARAR. *Dep:* P1. *Risco:* médio (persistência) → teste de não-colisão obrigatório.
- **P3 — Resolvedor local.** *Obj:* `resolveColoring60Lineart` (§6.3). *Gate:* §9.1/§9.5. *Evidência:* resolve entrada válida; sem entrada → estado honesto (null). *Parada:* se precisar tocar `getColoringImage`/`useResolvedColoringImage` → PARAR. *Dep:* P1. *Risco:* baixo.
- **P4 — Leitura/gravação Colorir 60 no `drawingStorage`.** *Obj:* gravar/ler pelo keyspace §6.5 reutilizando v3. *Gate:* §9.2. *Evidência:* round-trip por `activityId`; formato v3 idêntico; caminho legado intocado (spy). *Parada:* se exigir mudar formato v3 ou o writer legado → PARAR. *Dep:* P2. *Risco:* médio.
- **P5 — Conclusão plan-agnóstica.** *Obj:* marcar/ler conclusão por `activityId` (§6.6). *Gate:* §9.3/§9.4. *Evidência:* free marca done; nenhum pixel gravado. *Parada:* se conclusão acabar acoplada à persistência → PARAR. *Dep:* P2. *Risco:* médio.
- **P6 — Rota aditiva.** *Obj:* `ColoringScreen` aceita `activityId`; caminho legado por cena intocado. *Gate:* §9.2/§9.6. *Evidência:* abrir por `activityId` usa resolvedor §6.3; abrir por cena inalterado. *Parada:* se o caminho legado mudar de comportamento → PARAR. *Dep:* P3–P5. *Risco:* médio.
- **P7 — Write boundary com entitlement (o coração).** *Obj:* aplicar ordem canônica §6.6 (lineart→traço→conclusão→**gate de plano**→persistência gated). *Gate:* §9.3/§9.4/§9.5 (D1+D2+D5+D6). *Evidência:* free = 0 pixels + done=true; premium = pixels + done=true; sem lineart → não pinta/não salva. *Parada:* se o gate precisar mudar a **lógica** de `accessControl` (e não só consumir) → PARAR; se precisar autosave → PARAR. *Dep:* P4–P6. *Risco:* **alto** (persistência + entitlement) → revisão independente.
- **P8 — Superfície de entrada (mínima, se decidida).** *Obj:* expor a atividade **somente** se/como a decisão em aberto de "posição pública" for ratificada em bloco próprio; caso contrário, entrega fica atrás da flag sem superfície pública. *Gate:* §9.6. *Evidência:* com flag off, nada aparece. *Parada:* **não inventar** posição/nome/desbloqueio (regra 14) → se indefinido, PARAR e reportar. *Dep:* P7. *Risco:* governança.
- **P9 — Hash gate de assets (integração futura).** *Obj:* `verify-coloring60-assets.js` (§6.2). *Gate:* §9.7. *Evidência:* SHAs reais == esperados antes/depois da cópia. *Parada:* divergência de SHA/dims → falha dura. *Dep:* bloco de integração de assets (fora deste plano de código). *Risco:* alto (integridade do asset).
- **P10 — Rollout controlado.** *Obj:* flag → `true` só após D1/D2 provados em device + hash gate ok (§6.9/spec 015 §15). *Gate:* device matrix §9.7. *Evidência:* vídeo device (free 0 pixels; premium salva; lineart sempre). *Parada:* qualquer gate vermelho → flag permanece false. *Dep:* P0–P9. *Risco:* alto → validação em device física obrigatória.

---

## Etapa 9 — Estratégia de testes

- **9.1 — Catálogo.** Ordem (1/2/3), títulos exatos (spec 016 §11), `activityId` semânticos, `assetPath` canônicos, SHAs esperados (017 §15), dims 1122×1402/4:5. `coloring60` = modelVersion 2, exatamente 3 atividades.
- **9.2 — Legado intocado / não-colisão.** `@ptf_drawing60_*` ≠ `@ptf_drawing_*` e `@ptf_coloring60_done_*` ≠ `@ptf_coloring_done_*` para os mesmos ids; `getColoringImage`/`useResolvedColoringImage` e o caminho por cena inalterados (spies de não-mutação sobre chaves legadas).
- **9.3 — Free.** No write boundary com plano free: conclusão marcada (done=true) **e** `AsyncStorage.setItem` do blob **não** chamado (0 pixels). Fail-closed: plano indeterminado → tratado como free.
- **9.4 — Plano Família.** Premium: pixels persistidos (ponteiro v3) **e** done=true; round-trip de leitura recupera a arte.
- **9.5 — Lineart (D1).** Sem `baseImage`/resolvedor sem entrada → `makeChildArt`/render retorna estado honesto; **nunca** cor sem contorno; `canvasReady` bloqueia salvar sem contorno.
- **9.6 — Flag.** Flag off → catálogo sem atividades, rota inerte, nenhuma superfície nova; app idêntico ao baseline. Flag on → caminho Colorir 60 disponível **sem** afetar o legado.
- **9.7 — Device matrix + hash gate.** iPhone físico: free (0 pixels após sair) · premium (arte persiste após reabrir) · lineart sempre visível · flag off (invisível). Hash gate: SHA real dos 3 == esperado, antes/depois da cópia; divergência aborta.

`npm run smoke` verde e `npx expo-doctor` verde são gates duros da Etapa SDD 8. Smoke/doctor **não** substituem a validação visual em device (obrigatória por envolver canvas, toque e persistência).

---

## Etapa 10 — Critérios de aceite (20)

1. `coloring60Catalog` expõe exatamente 3 atividades para `creation`, na ordem 1/2/3.
2. Títulos exatos: "Haja luz" · "O mundo cheio de vida" · "Na criação de Deus".
3. `activityId` = `light` · `living_world` · `people_and_care` (semânticos, nunca sceneId).
4. `assetPath` = `assets/stories/creation/coloring/activities/<activityId>.png`.
5. SHAs esperados registrados == spec 017 §15; dims 1122×1402, razão 4:5.
6. Capability `coloring60` reporta modelVersion 2 e 3 atividades.
7. Nenhum dos 202 `require()` legados é removido/alterado; `coloringImages.js` intocado.
8. Os 10 linearts legados de `creation` permanecem (0 sobrescritos).
9. Chave de pixels Colorir 60 (`@ptf_drawing60_*`) não colide com a legada.
10. Chave de conclusão Colorir 60 (`@ptf_coloring60_done_*`) não colide com a legada.
11. Formato de payload persistido = ponteiro v3 idêntico ao legado (sem formato novo).
12. **Free conclui a atividade (done=true) e persiste 0 pixels.**
13. **Plano Família persiste os pixels e conclui a atividade.**
14. Fail-closed: plano indeterminado → tratado como free (0 pixels).
15. Sem lineart, o app não pinta nem salva (D1); nunca há cor sem contorno.
16. Conclusão é plan-agnóstica e independente da persistência (salvar ≠ concluir).
17. Cada tentativa de salvar reavalia o plano (D6); não há autosave.
18. Caminho legado por cena (`ColoringScreen` sem `activityId`) inalterado.
19. Flag off → nenhuma superfície nova; app idêntico ao baseline; flag on não afeta o legado.
20. Livrinho, motor de canvas, `accessControl` (lógica), packs remotos e os 3 PNGs **não** são alterados por este piloto.

---

## Decisões em aberto (NÃO inventar — voltam a bloco/spec próprios; regra 14)

- **Posição pública na interface** de onde a criança abre a atividade (card/aba/ordem visível). Specs não decidem.
- **Nome exibido à criança** para o conjunto "colorir da história" (os títulos por atividade estão em §11; o rótulo agregador, não).
- **Regra de desbloqueio** das atividades Colorir 60 (sequencial? livre? por conclusão da história?). Specs não decidem.
- **Métrica de "colorir de A Criação concluído"** (1 de 3 vs 3 de 3). `D-CONCLUSAO-TOTAL-B` = `[A CONFIRMAR]`. O piloto entrega conclusão **por atividade** apenas.
- **Exibição da arte Colorir 60 no Livrinho** (exigiria resolver por `activityId`; hoje é por cena). Fora do piloto.
- **Consumo remoto via pack** do Colorir 60 (kind/rota próprios). Backlog, fora do piloto.

---

## Pontos de PARADA OBRIGATÓRIA (parar e reportar ANTES de editar)

- Se o gate de entitlement exigir **alterar a lógica** de `accessControl`/`entitlementService` (e não apenas consumir `getCurrentPlan()`) → PARAR.
- Se o piloto exigir **tocar o formato v3**, o `writer` legado, ou o motor `ColoringCanvas` → PARAR.
- Se exibir a arte Colorir 60 exigir **tocar o Livrinho** (`StoryBookScreen`/`storyBookPagesService`) → PARAR.
- Se a chave Colorir 60 **colidir** com qualquer chave legada → PARAR.
- Se qualquer superfície pública exigir **inventar** posição/nome/desbloqueio/métrica não decididos → PARAR.
- Se o piloto precisar **consumir pack remoto** (contentResolver/PacksContext) → PARAR.
- Se a integração precisar **copiar/editar os PNGs** dentro deste bloco → PARAR (é bloco próprio).

---

## Constitution Check

Local-first, 100% JS, **sem dependência nova**, sem mudança de arquitetura destrutiva. **Aditivo e reversível**: catálogo/resolvedor/keyspace/flag novos ao lado do legado; nenhuma estrutura legada muda de forma. Área **sensível** (persistência de dado da criança + entitlement) → SDD completo (3 portões) + **revisão independente** + **validação em device iOS** obrigatórias (P7/P10). Respeita a precedência documental (specs 014–017 + DECISIONS) e as áreas protegidas (paywall/progresso/conquistas/assets só por consumo/instrução direta).

## Riscos e rollback

- **Persistência + entitlement (P7)** = risco alto: mitigado por ordem canônica fail-closed, testes §9.3/§9.4 e revisão independente.
- **Integridade do asset (P9)** = risco alto: mitigado pelo hash gate §6.2 (falha dura antes/depois da cópia).
- **Colisão de keyspace** = mitigada por namespace próprio + teste §9.2.
- **Serialização com outros blocos** em `storageKeys.js`/`smoke.js` = re-ancorar por conteúdo.
- **Rollback:** flag `false` neutraliza o piloto sem remover código; cada fase é um commit aditivo revertível por `git revert`. Nenhum dado legado é migrado, apagado ou reescrito.
