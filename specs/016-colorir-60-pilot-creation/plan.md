# Plan — Piloto Colorir 60 · A Criação (016-colorir-60-pilot-creation)

> **Feature:** `016-colorir-60-pilot-creation` · **Etapa SDD:** 4 (Plan).
> **Portão Humano 2:** ⏳ **AGUARDANDO aprovação do Fundador** (artefato em revisão; nenhum código é escrito antes do Portão 2). **Revisado em C60-PLAN1-FIX1** (endurecimento estrutural).
> **Branch:** `plan/colorir-60-pilot-creation` · **Base do plano:** `214d5aa` (linhagem documental do Colorir 60 consolidada).
> **Specs governantes:** [014 arquitetura](../014-colorir-60/spec-colorir-60.md) · [015 rollout gates](../015-colorir-60-rollout-gates/spec-colorir-60-rollout-gates.md) · [016 piloto/catálogo](./spec-colorir-60-pilot-creation.md) (dona deste plano) · [017 prompts/produção](../017-colorir-60-creation-production-prompts/spec-colorir-60-creation-production-prompts.md).
> **Árbitro:** [`docs/DECISIONS.md`](../../docs/DECISIONS.md).

Este plano transforma as decisões ratificadas nas specs 014–017 numa **arquitetura executável e auditável**. Não escreve código, não copia/integra assets, não cria tasks e não reabre decisões visuais/teológicas. Onde as specs **não** decidiram (posição pública na interface, nome exibido à criança, regra de desbloqueio, métrica de conclusão do "colorir da história"), o plano **marca como decisão em aberto** e **não inventa** — ver §"Decisões em aberto".

---

## Inventário canônico (terminologia inequívoca)

Três conjuntos **distintos** de imagens, todos **preservados**:

- **Ilustrações narrativas** — as imagens oficiais de cena que contam a história (20 histórias × 10 cenas = **200 ilustrações de cena**). Conjunto próprio, **intacto**; nada aqui as toca.
- **Páginas legadas de colorir** — **200 páginas no total** (20 histórias × 10 cenas), registradas por `require()` literal em `src/assets/coloringImages.js`, indexadas por `[storyId][sceneId]`. As **10 páginas legadas de colorir de A Criação estão contidas nessas 200** (são um **subconjunto**, não um acréscimo).
- **Colorir 60** — **60 páginas** (20 histórias × 3 atividades) identificadas por `activityId` semântico. **Coexistem** com as 200 páginas legadas de colorir; não as substituem, não as somam a elas.

> Redação proibida: nunca dizer "200 + 10" linearts. Os 10 de A Criação **já pertencem** aos 200. As 60 do Colorir 60 são um programa separado que coexiste com os 200.

---

## Etapa 5 (SDD) — Decisões imutáveis que o plano assume (18)

1. **Aditivo, não substitutivo.** Colorir 60 **não** substitui as 200 ilustrações narrativas nem as 200 páginas legadas de colorir. (PL01A-03; spec 014.)
2. **Piloto = somente A Criação (`creation`).** (PL01A-13; spec 016.)
3. **Identidade semântica.** Atividade identificada por **`activityId`** (`light` · `living_world` · `people_and_care`), **nunca** por `sceneId`/posição. (spec 014/016.)
4. **Identidade composta `(storyId, activityId)` sem `#`.** (spec 014.)
5. **Catálogo dos 3** (spec 016 §11): `light` "Haja luz" ordem 1; `living_world` "O mundo cheio de vida" ordem 2; `people_and_care` "Na criação de Deus" ordem 3.
6. **Curadoria** (spec 016 §10): 1 reaproveitado (`light` = conteúdo de `scene_02`), 2 novos (`living_world`, `people_and_care`), **0 sobrescritos**, **10 páginas legadas de colorir de A Criação preservadas** (subconjunto dos 200).
7. **Hashes completos e dimensões** (spec 017 §15) — ver §6.2 (sem reticências).
8. **Exceção visual ratificada** de `people_and_care` (mulher à esquerda regando a muda; homem à direita cuidando do solo; animais ave/cervo/coelho; **sem cordeiro**) — PL01G-FIX1. **Não reabrir.**
9. **Capability `coloring60`:** `modelVersion = 2`, **exatamente 3 atividades**. (spec 014.)
10. **D1 — preservação do lineart.** Nenhum pixel de cor exibido sem contorno; `makeChildArtVisual` retorna `null` sem `baseImage`. (spec 015 §2/§20.)
11. **D2 / C14 / §15 — entitlement na fronteira real de escrita.** Free persiste **zero pixels**; salvar = Plano Família; fail-closed → free. (spec 015 §9/§10/§15.)
12. **D3 — prova de aprovação por formato** (spec 017 §15).
13. **D4 — estado honesto sem lineart.** (spec 015 §20.)
14. **D5 — conclusão por traço deliberado** (`hasMeaningfulPaint`). (spec 015 §20.)
15. **D6 — plano de escrita reavaliado a cada tentativa de persistência.** (spec 015 §20.)
16. **Salvar ≠ concluir.** Marcar a atividade como feita é **plan-agnóstico**; persistir pixels é **gated**. (spec 015 §1; `coloringActivityService`.)
17. **Free = `creation` + `noah`; `creation` é grátis; free salva 0 artes.** (E1-STORIES-GRATIS, E1-ARTES-SALVAR, D-FREE-SEM-SALVAR; `planConfig.FREE_STORY_IDS`.)
18. **PNGs fora do Git na criação do plano.** Nenhum PNG é integrado **durante a criação deste plano**. As **duas artes novas serão integradas durante a implementação autorizada do piloto** (fase P5), sob tasks aprovadas; `light` é reutilizado por referência, **sem cópia**. (PL01G-01; regra 7.)

---

## Etapa 6 (SDD) — Arquitetura alvo

Princípio-mestre: **paralelismo aditivo com isolamento**. O Colorir 60 ganha catálogo, registro estático de assets, resolvedor, **writer próprio**, chaves e conclusão **próprios**, ao lado dos caminhos legados por `sceneId`. Nenhuma estrutura legada muda de forma ou de contrato; o motor de pintura (`ColoringCanvas`) e a tela (`ColoringScreen`) são **reutilizados por composição**, não bifurcados.

### 6.1 — Catálogo semântico (só metadados) + registro estático de assets (Metro)

Duas camadas separadas — **metadado nunca é fonte de runtime**:

**(a) `src/data/coloring60Catalog.js` — somente metadados.** Por `storyId`, lista ordenada de atividades:
`{ storyId, activityId, order, title, expectedSha256, expectedDims, localSourceKey }`, conforme spec 016 §11 / 017 §15. No piloto, só `creation` tem entradas. `localSourceKey` é a **chave semântica** que aponta para a entrada no registro estático (b) — **não** é um caminho de arquivo carregável. Um campo textual opcional `auditPath` pode registrar o caminho canônico para auditoria humana, mas **não é a fonte runtime**.

**(b) `src/assets/coloring60LocalAssets.js` — registro estático de fontes locais.** Mapa por `storyId + activityId` onde **cada entrada usa `require()` literal em tempo de build** (compatível com Metro). Regras:
- **Nenhum `require()` construído por string dinâmica.**
- **Nenhuma dependência de `coloringImages.js`** (isolamento total do legado).
- `light` → `require('assets/stories/creation/coloring/scene_02.png')` — **reutilização direta do módulo `scene_02.png`**. **Não** declarar nem criar `activities/light.png`. **Não** copiar/duplicar `light`.
- `living_world` → (registro estático futuro) `require('assets/stories/creation/coloring/activities/living_world.png')`.
- `people_and_care` → (registro estático futuro) `require('assets/stories/creation/coloring/activities/people_and_care.png')`.

Motivo da correção: um catálogo que resolvesse o asset só por string de caminho **quebraria no Metro** (bundler exige `require()` literal). Por isso o catálogo carrega apenas metadados e delega a fonte runtime ao registro estático (b).

### 6.2 — Identidade completa dos assets (hashes sem reticências)

Usados **integralmente** em catálogo, testes, hash gate e aceite:

| activityId | fonte runtime | SHA-256 esperado (completo) | dims | razão |
|---|---|---|---|---|
| `light` | `scene_02.png` (reuso direto) | `35d6f50c72e978e44a9d2727a970a4ace3635ef3184a36729a5e4a13faffaddb` | 1122×1402 | 4:5 |
| `living_world` | `activities/living_world.png` (integração futura) | `818cd917c7493f4a3e04512a7120a6eaff5a03fdd16277b7d4fdfd1ee33b6ac5` | 1122×1402 | 4:5 |
| `people_and_care` | `activities/people_and_care.png` (integração futura) | `59988d9a58082a8173a328857fccb6a3716815660f4434c0df4491d6bf30d4e9` | 1122×1402 | 4:5 |

**Nenhum campo de integridade/catálogo/teste/aceite usa reticências.**

### 6.3 — Resolvedor de imagem (agnóstico e isolado)

- Novo `src/services/coloring60Resolver.js` — `resolveColoring60Lineart(storyId, activityId)` consome **apenas** o catálogo §6.1(a) + o registro estático §6.1(b). **Não** passa por `getColoringImage(storyId, sceneId)` nem por `useResolvedColoringImage`.
- Fallback honesto (D4): catálogo sem entrada ou fonte ausente → estado "sem lineart" → tela mostra imagem faltante. Nunca pinta sem contorno.
- **Local-first puro:** não chama `contentResolver`/`resolveRemoteColoringUri`; packs remotos ficam fora do piloto (§6.8).

### 6.4 — Navegação (aditiva por `activityId`)

- `ColoringScreen` passa a aceitar, **aditivamente**, uma atividade Colorir 60 por `(storyId, activityId)` via novo parâmetro de rota `activityId`, **sem remover** o caminho legado por cena.
- Modo decidido pela presença de `activityId`: presente → caminho Colorir 60 (resolvedor §6.3, writer §6.5, conclusão §6.6); ausente → caminho legado por `cena.id` **intocado**.
- **Posição pública** de onde a criança abre a atividade **não é decidida** pelas specs → decisão em aberto; o plano só garante que a rota **aceita** o destino e que a **entrada interna de QA** (§6.9) existe para device.

### 6.5 — Writer próprio + entitlement como autoridade de escrita

A tela é **chamadora**, não autoridade. Novo serviço irmão isolado:

**`src/services/coloring60DrawingStorage.js`** — API conceitual:
- `saveColoring60DrawingState(storyId, activityId, payload)`
- `getColoring60SavedDrawing(storyId, activityId)`
- `hasColoring60SavedDrawing(storyId, activityId)`
- `clearColoring60SavedDrawing(storyId, activityId)`

Requisitos:
1. **O serviço calcula a chave internamente** (funções fechadas §6.6); **não** aceita chave arbitrária vinda da tela.
2. **Revalida o entitlement em toda tentativa de salvar** (D6), síncrono e fail-closed (`accessControl.getCurrentPlan()` = `entitlementService.getEntitlementPlan()`).
3. **Plano Família** pode persistir.
4. **Plano grátis não escreve** arquivo, blob, ponteiro nem chave.
5. **Estado indeterminado falha fechado** (tratado como grátis).
6. A tela pode fazer **consulta preliminar** para UX (habilitar/rotular botão), mas **essa consulta não substitui o gate interno**.
7. **Chamada direta ao serviço sem entitlement é negada** (a autoridade é o serviço, não o chamador).
8. Pode **reutilizar helpers de blob existentes** (`fileBlobStore`, formato ponteiro v3) **somente se isso não enfraquecer o isolamento** — o serviço legado `drawingStorage.js` **não** vira writer genérico por chave arbitrária.
9. **Não altera o contrato público do writer legado** (`drawingStorage.saveDrawingState`), salvo prova indispensável (então: PARAR e reportar antes de editar).
10. **Sem escrita parcial:** falha de persistência não deixa arquivo temporário nem ponteiro órfão.

### 6.6 — Chaves e schema (funções fechadas, sem bump gratuito)

- **Namespace próprio, sem colisão:**
  - Pixels: `@ptf_drawing60_s<storyId>_a<activityId>`
  - Conclusão: `@ptf_coloring60_done_<storyId>_<activityId>`
- **Calculadas por funções fechadas** internas aos serviços Colorir 60; **não recebem valores livres** do chamador; **não colidem** com `@ptf_drawing_s<storyId>_c<sceneId>` nem `@ptf_coloring_done_<storyId>_<sceneId>` legados.
- **Sem bump global de schema apenas por adicionar chaves.** Um bump de `APP_STORAGE_SCHEMA_VERSION` só poderá ser **planejado se a auditoria da implementação provar necessidade concreta** (então volta ao artefato). **Nenhuma migração** das chaves legadas ocorre no piloto.

### 6.7 — Conclusão × Salvamento (resultados distintos)

**Conclusão da atividade** (marcar como vivida):
1. Requer lineart pronto (D1). 2. Requer traço significativo (`hasMeaningfulPaint`, D5). 3. Permitida para **grátis e Plano Família**. 4. Usa a **chave própria** `@ptf_coloring60_done_<storyId>_<activityId>` (serviço/extensão fechada por `activityId`). 5. **Não implica arte salva.** 6. **Não concede estrela indevida.** 7. **Não marca cena narrativa como concluída** (a conclusão de cena continua exclusiva da NarrationScreen).

**Persistência da arte** (pixels no disco):
1. Requer **Plano Família**. 2. Executada **exclusivamente pelo writer autorizado** §6.5. 3. Reavalia entitlement em toda tentativa (D6). 4. Retorna **resultado tipado**.

**Resultados tipados mínimos** (nomes conceituais; a convenção final pode diferir): `saved` · `not_persisted_free` · `write_failed`.

**Semântica de falha:**
1. A conclusão pode **permanecer registrada** após traço válido, mesmo sem persistência.
2. Falha de persistência **nunca** é apresentada como salvamento bem-sucedido.
3. A interface futura trata conclusão e salvamento como **resultados separados** (copy pública fica fora deste plano).
4. Nenhum erro de salvamento cria arquivo parcial ou ponteiro órfão.

**Ordem canônica na fronteira real de escrita** (`ColoringScreen.handleProximo` chamando o writer §6.5): `canvasReady` (D1) → `hasPainted`/`hasMeaningfulPaint` (D5) → **marcar conclusão** (plan-agnóstica) → **chamar o writer autorizado**, que **internamente** revalida plano e persiste **só** em Plano Família (D2/D6) → resultado tipado → `refreshProgress` → voltar. **Métrica de "colorir de A Criação concluído"** (1 de 3 vs 3 de 3) **não é decidida** (D-CONCLUSAO-TOTAL-B `[A CONFIRMAR]`) → decisão em aberto; o piloto entrega só a **conclusão por atividade**.

### 6.8 — Compatibilidade com packs remotos

O runtime de packs resolve colorir remoto por **posição** (`coloring/scene_NN.png`), gated a `david_goliath`. A identidade Colorir 60 é **semântica** (`activities/<activityId>.png`), namespace distinto. **No piloto, Colorir 60 é local-first**; o resolvedor §6.3 **não** consome pack remoto. Servir Colorir 60 via pack exigiria **kind/rota próprios** — backlog, fora do piloto.

### 6.9 — Feature flag + entrada interna de QA

- **Flag única** `COLORIR_60_CREATION_PILOT_ENABLED` (default **false**), centralizada. Off → catálogo sem atividades expostas, rota inerte, nenhuma superfície nova; app **idêntico** ao baseline.
- **Entrada interna de QA:** reutilizar `ColoringQaScreen` (ou ferramenta interna equivalente) para abrir as **3 atividades de A Criação** em device. Protegida por **três gates simultâneos**: `__DEV__` **e** Modo Criador/`isInternalToolsEnabled` **e** a feature flag do piloto. **Nunca** aparece em build pública; **não** decide a posição pública definitiva. **Controles negativos** provam que a rota **não abre** sem todos os gates. As ferramentas administrativas existentes permanecem no Dev Client.
- **Gate de rollout** (spec 015 §15): a flag só vai a `true` em produção quando D1 e D2 estiverem **provados em runtime** e os assets passarem o hash gate §6.2.

---

## Etapa 7 (bloco) — Matriz de arquivos

**Novos / futuros:**
| Arquivo | Papel |
|---|---|
| `src/data/coloring60Catalog.js` | Catálogo semântico — só metadados (§6.1a). |
| `src/assets/coloring60LocalAssets.js` (ou local coerente) | Registro estático `require()` literal (§6.1b); `light` = `scene_02.png` por referência. |
| `src/services/coloring60Resolver.js` | Resolvedor local-first agnóstico (§6.3). |
| `src/services/coloring60DrawingStorage.js` | **Writer próprio** com entitlement interno (§6.5). |
| serviço/extensão fechada de conclusão por `activityId` | Chave `@ptf_coloring60_done_<storyId>_<activityId>`, plan-agnóstica (§6.7). |
| Flag `COLORIR_60_CREATION_PILOT_ENABLED` | Kill switch (§6.9). |
| Entrada interna de QA (`ColoringQaScreen` ou equivalente) | Abrir as 3 atividades em device (§6.9). |
| `scripts/verify-coloring60-assets.js` | Hash gate (§6.2 / §8). |
| **2 PNGs novos** (`living_world`, `people_and_care`) | Integrados na fase P5 sob tasks autorizadas. |

**Preservados (não alterar):**
1. `src/assets/coloringImages.js` (200 páginas legadas de colorir).
2. `src/services/drawingStorage.js` — **salvo reutilização interna mínima comprovada** de helpers de blob, sem mudar seu contrato público.
3. `ColoringCanvas.js` (motor).
4. Os **200 linearts legados de colorir**.
5. Os **10 linearts de A Criação** — **subconjunto dos 200**.
6. Ilustrações narrativas (conjunto distinto).
7. Livrinho (`StoryBookScreen`/`storyBookPagesService`).
8. Pipeline remoto de packs (`contentResolver`/`PacksContext`/R2).

---

## Etapa 8 (bloco) — Integração futura dos assets (descrita; não executada aqui)

O plano **contém** a fase de integração, mas **este bloco documental não copia nada**.
1. **`light` é reutilizado diretamente**, sem cópia (registro estático → `scene_02.png`).
2. **Antes** da cópia das duas artes novas, **verificar os hashes externos** (fonte de produção) contra §6.2.
3. Copiar futuramente: `living_world_approved.png` e `people_and_care_approved.png`.
4. Destinos: `assets/stories/creation/coloring/activities/living_world.png` e `assets/stories/creation/coloring/activities/people_and_care.png`.
5. **Verificar novamente os hashes depois da cópia** (§6.2).
6. Comparar **tamanho, dimensões, magic bytes e modo** de cor.
7. Divergência → **falha dura + rollback**.
8. **Nunca reencodar** durante a integração.
9. **Nunca gerar `activities/light.png`.**
10. **Nenhuma integração de asset ocorre antes das tasks autorizadas.**

Distinção registrada: **nenhum PNG é integrado durante a criação do plano**; **as duas novas artes serão integradas durante a implementação autorizada do piloto (P5)**.

---

## Etapa 9 (bloco) — Estratégia de testes (com testes negativos de persistência)

**Catálogo/legado:** ordem/títulos/`activityId`/`expectedSha256` completos/dims (spec 016 §11 + 017 §15); `coloring60` = modelVersion 2, 3 atividades; `coloringImages.js` e o caminho por cena inalterados (spies de não-mutação sobre chaves legadas); registro estático usa `require()` literal (sem string dinâmica) e `light` aponta para `scene_02.png`.

**Grátis / entitlement negado — provar que NADA é escrito:**
1. `writeBlob` **não** chamado.
2. `FileSystem.writeAsStringAsync` **não** chamado.
3. Nenhuma chave permanente criada.
4. Nenhum ponteiro criado.
5. Nenhum arquivo temporário criado.
6. Nenhum blob órfão criado.
7. Nenhuma arte recuperada após reabrir.
8. **Chamada direta ao writer é negada.**
9. **Falha/ausência da fonte de entitlement também é negada** (fail-closed).
10. A **conclusão da atividade continua separada** da arte (done pode existir; pixels não).

**Plano Família — provar persistência íntegra:**
1. Writer autorizado chamado.
2. Arquivo criado.
3. Ponteiro persistido (v3).
4. Arte recuperada após reiniciar.
5. **Falha simulada não deixa resíduo** (sem arquivo parcial/ponteiro órfão).
6. A interface **não recebe falso sucesso** (resultado tipado honesto).

**Lineart (D1):** sem `baseImage`/resolvedor sem entrada → estado honesto; nunca cor sem contorno; `canvasReady` bloqueia salvar sem contorno.
**Flag/QA (§6.9):** flag off → app idêntico; entrada de QA só abre com os **três** gates; controles negativos provam bloqueio.

`npm run smoke` verde e `npx expo-doctor` verde são gates duros (Etapa SDD 8) e **não** substituem a validação visual em device (canvas/toque/persistência).

---

## Etapa 11 (bloco) — Fases P0–P10

Cada fase: objetivo · entradas · arquivos · gate · evidências · parada · dependências · riscos.

- **P0 — Portão, inventário, hashes e flag desligada.** *Obj:* fixar inventário canônico + hashes completos §6.2 + `COLORIR_60_CREATION_PILOT_ENABLED=false`. *Entradas:* specs 014–017, DECISIONS. *Arquivos:* flag. *Gate:* smoke verde; app idêntico com flag off. *Evidências:* diff mínimo; print app off. *Parada:* flag exigir tocar área protegida → PARAR. *Dep:* —. *Risco:* baixíssimo.
- **P1 — Catálogo semântico + registro estático de assets.** *Obj:* `coloring60Catalog.js` (metadados) + `coloring60LocalAssets.js` (`require()` literal; `light`=`scene_02.png`). *Gate:* testes de catálogo/registro estático verdes. *Evidências:* asserts de ordem/títulos/paths/SHA completos; ausência de `require()` por string; sem dependência de `coloringImages.js`. *Parada:* divergência com spec 016 §11/017 §15 → PARAR. *Dep:* P0. *Risco:* baixo.
- **P2 — Resolvedor + navegação interna por `activityId`.** *Obj:* `coloring60Resolver` + rota aditiva. *Gate:* legado por cena intocado; resolve válido / fallback honesto. *Evidências:* abrir por `activityId` usa resolvedor; abrir por cena inalterado. *Parada:* tocar `getColoringImage`/`useResolvedColoringImage` → PARAR. *Dep:* P1. *Risco:* baixo/médio.
- **P3 — Writer próprio, keyspace e entitlement interno.** *Obj:* `coloring60DrawingStorage.js` com chaves fechadas + gate interno fail-closed. *Gate:* não-colisão de chaves; chamada direta sem entitlement negada. *Evidências:* testes de chave fechada; negação de chamada direta. *Parada:* precisar transformar `drawingStorage` em writer por chave arbitrária, ou mudar seu contrato público, ou bump global de schema sem prova → PARAR. *Dep:* P1. *Risco:* **alto** (persistência + entitlement) → revisão independente.
- **P4 — Separação conclusão × salvamento.** *Obj:* conclusão plan-agnóstica (chave própria) distinta da persistência gated; resultados tipados. *Gate:* free conclui + 0 pixels; premium conclui + persiste. *Evidências:* testes §9 (negativos + positivos). *Parada:* conclusão acoplar-se à persistência → PARAR. *Dep:* P3. *Risco:* alto.
- **P5 — Integração controlada das 2 novas artes (hash antes/depois; `light` por referência).** *Obj:* copiar `living_world`/`people_and_care` para `activities/<activityId>.png` com hash gate §8; `light` sem cópia. *Gate:* SHA/dims/magic bytes/modo == esperado antes e depois; sem reencode; sem `activities/light.png`. *Evidências:* saída de `verify-coloring60-assets.js`. *Parada:* qualquer divergência → falha dura + rollback. *Dep:* P1–P4 + **tasks autorizadas**. *Risco:* alto (integridade do asset).
- **P6 — Reabertura, lineart e recuperação da arte salva.** *Obj:* provar round-trip premium (arte recuperada após reiniciar) e D1 sempre. *Gate:* §9 lineart + Família. *Evidências:* round-trip; contorno sempre presente. *Parada:* cor sem contorno → PARAR. *Dep:* P2–P5. *Risco:* médio.
- **P7 — Feature flag + entrada interna de QA.** *Obj:* `ColoringQaScreen` (ou equivalente) atrás dos 3 gates, só A Criação. *Gate:* flag off → invisível; QA abre só com os 3 gates. *Evidências:* controles negativos. *Parada:* inventar posição/nome/desbloqueio públicos → PARAR. *Dep:* P2–P6. *Risco:* governança.
- **P8 — Smoke + testes positivos e negativos.** *Obj:* consolidar §9. *Gate:* smoke verde; expo-doctor verde; negativos de persistência verdes. *Evidências:* relatório de testes. *Parada:* qualquer negativo falho → PARAR. *Dep:* P1–P7. *Risco:* médio.
- **P9 — QA no dispositivo.** *Obj:* validação visual em iPhone físico. *Gate:* free 0 pixels; premium persiste; lineart sempre; flag off invisível. *Evidências:* vídeo device. *Parada:* qualquer gate vermelho → flag permanece false. *Dep:* P8. *Risco:* alto → device obrigatório.
- **P10 — Rollback e fechamento do piloto.** *Obj:* provar rollback (flag false neutraliza; `git revert` aditivo) sem remover arte legada ou desenhos legados. *Gate:* rollback não toca dado legado. *Evidências:* checklist de rollback. *Parada:* rollback afetar legado → PARAR. *Dep:* P0–P9. *Risco:* médio.

---

## Etapa 13 (bloco) — Critérios de aceite (17)

1. Runtime local usa **referência estática compatível com Metro** (`require()` literal), nunca string dinâmica.
2. `light` usa **diretamente** `scene_02.png`.
3. **Não existe** `activities/light.png`.
4. O **writer valida entitlement internamente** (autoridade no serviço, não na tela).
5. **Chamada direta ao writer sem entitlement falha** (fail-closed).
6. **Nenhum resíduo de arquivo** (parcial/temporário/ponteiro órfão) para grátis ou para falha.
7. **Conclusão e persistência têm resultados distintos** (`saved` · `not_persisted_free` · `write_failed`).
8. As **duas artes novas fazem parte da futura integração do piloto** (P5, sob tasks autorizadas).
9. Os **hashes aparecem completos** em todos os campos de integridade/catálogo/teste/aceite.
10. **Nenhum schema global** é alterado sem necessidade comprovada.
11. **Entrada interna de QA** está definida (3 gates; só A Criação; invisível em build pública).
12. **Nenhuma decisão pública de interface** é inventada.
13. Os **200 linearts legados** permanecem intactos.
14. Os **10 de A Criação** são tratados como **subconjunto dos 200**.
15. As **ilustrações narrativas** permanecem como conjunto distinto e intacto.
16. O **caminho legado** de colorir por cena continua funcional.
17. **Rollback remove o piloto** sem remover arte legada nem desenhos legados.

---

## Decisões em aberto (NÃO inventar — voltam a bloco/spec próprios)

- **Posição pública na interface** de onde a criança abre a atividade.
- **Nome exibido à criança** para o conjunto "colorir da história" (rótulo agregador).
- **Regra de desbloqueio** das atividades Colorir 60.
- **Métrica de "colorir de A Criação concluído"** (1 de 3 vs 3 de 3) — `D-CONCLUSAO-TOTAL-B` `[A CONFIRMAR]`.
- **Exibição da arte Colorir 60 no Livrinho** (hoje por cena; exigiria resolver por `activityId`). Fora do piloto.
- **Consumo remoto via pack** do Colorir 60. Backlog.

---

## Pontos de PARADA OBRIGATÓRIA (parar e reportar ANTES de editar)

- Gate de entitlement exigir **alterar a lógica** de `accessControl`/`entitlementService` (não apenas consumir) → PARAR.
- Precisar **tocar o formato v3**, o `writer` legado (contrato público) ou o motor `ColoringCanvas` → PARAR.
- Precisar transformar `drawingStorage` em **writer genérico por chave arbitrária** → PARAR.
- Precisar **bump global de schema** sem prova concreta → PARAR.
- Exibir a arte Colorir 60 exigir **tocar o Livrinho** → PARAR.
- Chave Colorir 60 **colidir** com chave legada → PARAR.
- Superfície pública exigir **inventar** posição/nome/desbloqueio/métrica → PARAR.
- Piloto precisar **consumir pack remoto** → PARAR.
- Integração precisar **copiar/editar PNG durante a criação do plano** → PARAR (é P5, sob tasks).

---

## Constitution Check

Local-first, 100% JS, **sem dependência nova**, sem mudança arquitetural destrutiva. **Aditivo e reversível**: catálogo/registro estático/resolvedor/writer/keyspace/flag/entrada de QA novos ao lado do legado; nenhuma estrutura legada muda de forma nem de contrato público. Área **sensível** (persistência de dado da criança + entitlement) → SDD completo (3 portões) + **revisão independente** + **validação em device iOS** (P3/P4/P9). Respeita a precedência documental (specs 014–017 + DECISIONS) e as áreas protegidas (paywall/progresso/conquistas/assets só por consumo/instrução direta).

## Riscos e rollback

- **Persistência + entitlement (P3/P4)** = risco alto: writer próprio com gate interno fail-closed, testes negativos §9, revisão independente.
- **Integridade do asset (P5)** = risco alto: hash gate antes/depois + tamanho/dims/magic bytes/modo; divergência = falha dura + rollback; nunca reencodar.
- **Colisão de keyspace** = mitigada por funções fechadas + namespace próprio + teste de não-colisão.
- **Serialização** em `storageKeys`/`smoke.js` = re-ancorar por conteúdo.
- **Rollback:** flag `false` neutraliza o piloto; cada fase é commit aditivo revertível por `git revert`; **nenhum dado legado é migrado, apagado ou reescrito**.
