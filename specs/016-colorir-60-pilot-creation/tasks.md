# Tasks — Piloto Colorir 60 · A Criação (016-colorir-60-pilot-creation)

> **Feature:** `016-colorir-60-pilot-creation` · **Etapa SDD:** 5 (Tasks) + 6 (Analyze).
> **Portão Humano 2 (plano):** APROVADO pelo Fundador — plano `9c75a3d` ([plan.md](./plan.md)).
> **Portão Humano 3 (tasks/análise):** ⏳ **AGUARDANDO** (este arquivo é o artefato submetido; **nenhuma task é executada neste bloco**).
> **Branch:** `tasks/colorir-60-pilot-creation` · **Base:** `9c75a3d`.
> **Specs:** [014](../014-colorir-60/spec-colorir-60.md) · [015](../015-colorir-60-rollout-gates/spec-colorir-60-rollout-gates.md) · [016](./spec-colorir-60-pilot-creation.md) · [017](../017-colorir-60-creation-production-prompts/spec-colorir-60-creation-production-prompts.md) · **Árbitro:** [DECISIONS.md](../../docs/DECISIONS.md).

## Como ler cada task (16 campos obrigatórios)
Cada task declara: **ID** (`P<fase>.T<n>`) · **Fase** · **Título** · **Objetivo** · **Dep** (dependências) · **Arq✔** (arquivos autorizados) · **Arq✗** (arquivos proibidos) · **Entradas** · **Passos** (verificáveis) · **Gates** (testes) · **Evidências** · **Parada** (condição de parada) · **Aceite** · **Rollback** · **Commit** (sim/não) · **Push/merge:** SEMPRE proibido sem autorização explícita. Onde uma task diz "Push/merge: proibido", valem integralmente as **Regras de Git durante a execução** (sem push/merge/amend/squash/reset/rebase/force sem autorização do fundador).

## Convenções herdadas (specs 004) e reforços deste piloto
- `require()` **literal com caminho relativo real** — proibido `require()` por string dinâmica; proibido pressupor alias não configurado (o padrão comprovado é `coloringImages.js`, que usa `require('../../assets/stories/...')` a partir de `src/assets/`).
- Namespace de chaves próprio: `@ptf_drawing60_s<storyId>_a<activityId>` e `@ptf_coloring60_done_<storyId>_<activityId>`; funções fechadas; **sem bump global de schema** sem prova; **sem migração** de legado.
- `light` = reuso direto de `assets/stories/creation/coloring/scene_02.png`; **nunca** criar `activities/light.png`.
- Os **2 PNGs novos** só aparecem em **P5**, sob task e portão autorizados.
- Inventário canônico: **200 páginas legadas de colorir**; os **10 de A Criação são subconjunto** dos 200; **ilustrações narrativas** = conjunto distinto; **60 do Colorir 60 coexistem**.
- **Decisões públicas em aberto NÃO são resolvidas** por nenhuma task (posição pública, nome à criança, desbloqueio, métrica "colorir concluído" 1×3).

### Nota de rastreabilidade — exceção de `light` (spec 016 §11 ↔ plan)
Esclarecimento de rastreabilidade, **não** uma nova decisão de produto:
1. A spec 016 §11 lista, de forma **nominal**, um caminho futuro `…/coloring/activities/light.png` para a atividade `light`.
2. A decisão **governante** (plan `9c75a3d`) é **reuso direto** de `assets/stories/creation/coloring/scene_02.png`, **sem criar** `activities/light.png`.
3. Em caso de conflito, o **plan prevalece** (precedência documental): `light` = reuso, nunca cópia/arquivo novo.
4. O caminho nominal da spec é registro de intenção; **nenhuma task o materializa** — `activities/light.png` só aparece em contexto de **proibição** e **prova de ausência** (P1.T2/T3, P5.T1, P5.T7).
5. Esta nota **não** reabre nem redefine a spec 016, o plan ou qualquer decisão de produto.
6. O gate P5.T2 (`verify-coloring60-assets.js`) valida a ausência de `activities/light.png` como invariante.

---

# P0 — Portão, inventário, hashes e flag desligada

### P0.T1 — Portão inicial da futura implementação
- **Objetivo:** provar branch/base corretos e worktree limpa antes de qualquer edição.
- **Dep:** — · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** nenhum (somente leitura de git) · **Arq✗:** todo o código/assets.
- **Entradas:** branch de implementação, base aprovada.
- **Passos:** 1) `git rev-parse --abbrev-ref HEAD`; 2) `git rev-parse HEAD`; 3) `git status --porcelain` vazio.
- **Gates:** worktree limpa; base = commit aprovado.
- **Evidências:** saída dos 3 comandos.
- **Parada:** estado sujo/branch errado → PARAR.
- **Aceite:** branch e base confirmados, working tree limpo.
- **Rollback:** n/a (sem escrita).

### P0.T2 — Registro de branch, HEAD, worktree e estado
- **Objetivo:** registrar identidade da worktree de implementação para auditoria futura.
- **Dep:** P0.T1 · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** documento de evidências (fora do app) · **Arq✗:** código/assets.
- **Entradas:** P0.T1.
- **Passos:** 1) `git worktree list`; 2) anotar caminho/branch/HEAD; 3) confirmar isolamento das demais worktrees.
- **Gates:** worktrees `loading` e `product-lock-*` intocadas.
- **Evidências:** `git worktree list`.
- **Parada:** worktree alheia alterada → PARAR.
- **Aceite:** registro completo e isolamento provado.
- **Rollback:** n/a.

### P0.T3 — Inventário byte a byte dos 200 linearts legados de colorir
- **Objetivo:** baseline de integridade para comparação posterior (prova de "legado intocado").
- **Dep:** P0.T1 · **Commit:** não (evidência) · **Push/merge:** proibido.
- **Arq✔:** script de inventário read-only (ex.: em `scripts/`, sem alterar app) + relatório · **Arq✗:** `coloringImages.js`, PNGs legados.
- **Entradas:** `src/assets/coloringImages.js`, árvore `assets/stories/*/coloring/`.
- **Passos:** 1) enumerar os 200 arquivos legados de colorir; 2) SHA-256 de cada; 3) gravar tabela `path→sha256→bytes` como baseline.
- **Gates:** exatamente 200 páginas legadas mapeadas.
- **Evidências:** tabela baseline dos 200.
- **Parada:** contagem ≠ 200 → PARAR e reconciliar com o inventário canônico.
- **Aceite:** baseline dos 200 gerado, reprodutível.
- **Rollback:** descartar relatório (nada tocado).

> **Nota de execução e evidência (acréscimo; não substitui os critérios acima).**
> 1. **Status:** **executada e aprovada por QA independente**.
> 2. **Baseline canônica:** `C:\tmp\ptf_colorir60_p0_evidence\baseline_200_legacy_f16491c.tsv`.
> 3. **SHA-256 da baseline:** `a3bc2d10d526ea49e85c92f3a1c61e89038ca3323c56ef8877146e80a87c7a61` (28441 bytes).
> 4. **Registros:** 200 (201 linhas lógicas: cabeçalho + 200). Schema `ptf-coloring-baseline-v1`; colunas `path`, `bytes`, `width`, `height`, `bitDepth`, `colorType`, `colorMode`, `sha256`.
> 5. **HEAD de origem:** `f16491ca5e05c27fdd8e9d47b672650b444b4ded`.
> 6. **Prova 199 + 1:** contra a baseline histórica, **199** registros idênticos em bytes e SHA-256 e **exatamente 1** divergência, isolada em `assets/stories/creation/coloring/scene_02.png` — resultado esperado da substituição autorizada (`cc63e19`), não regressão.
> 7. **`scene_02` usa `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1`** (861767 bytes, 1122×1402, bitDepth 8, colorType 2, `RGB`).
> 8. **Baseline histórica** `baseline_200_legacy.tsv` (SHA-256 `beb1b4e3cb901ecee3eac26fe8b3c1adc9e043efd6805518a1ee197e28f1bdd9`) permanece preservada, porém **NÃO CANÔNICA** para P5.T7.
> 9. **Manifesto:** `baseline_200_legacy_f16491c.manifest.txt`, SHA-256 `ccf741b52b4f42eccd397fd50ec4d41647a71ac8fe035e0290fa135ed4faade1` — **snapshot pré-P5.T4** (spec 016 §16.6).
> 10. **Veredito:** **`C60-IMPL-P0-T3-REBASELINE1-QA1` APROVADO**.
> 11. Contrato completo e vinculante em **spec 016 §16.5**. Artefatos permanecem **fora do Git** (task de evidência, sem commit).

### P0.T4 — Inventário dos 10 linearts de A Criação como subconjunto dos 200
- **Objetivo:** provar que os 10 de `creation` pertencem aos 200 (não são acréscimo).
- **Dep:** P0.T3 · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** relatório · **Arq✗:** PNGs de `creation`.
- **Entradas:** baseline P0.T3.
- **Passos:** 1) filtrar os 10 de `creation` na baseline; 2) provar que ⊆ dos 200; 3) registrar `scene_02` (fonte de `light`).
- **Gates:** 10 ⊆ 200; `scene_02` presente.
- **Evidências:** subtabela dos 10 + destaque de `scene_02`.
- **Parada:** algum dos 10 fora dos 200 → PARAR.
- **Aceite:** subconjunto provado; nenhuma redação "200 + 10".
- **Rollback:** descartar relatório.

### P0.T5 — Registro separado das ilustrações narrativas
- **Objetivo:** provar que as ilustrações narrativas são conjunto distinto e não são tocadas.
- **Dep:** P0.T1 · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** relatório · **Arq✗:** ilustrações narrativas.
- **Entradas:** manifestos/árvore de cenas oficiais.
- **Passos:** 1) enumerar as ilustrações narrativas; 2) registrar que são disjuntas das páginas de colorir; 3) marcar como fora de escopo.
- **Gates:** conjunto disjunto documentado.
- **Evidências:** lista/contagem das narrativas.
- **Parada:** sobreposição inesperada com colorir → PARAR.
- **Aceite:** conjunto distinto e intocado registrado.
- **Rollback:** descartar relatório.

### P0.T6 — Verificação dos três hashes aprovados
- **Objetivo:** fixar os SHA-256 completos como contrato de integridade (sem tocar assets).
- **Dep:** P0.T1 · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** relatório · **Arq✗:** qualquer PNG.
- **Entradas:** spec 017 §15.
- **Passos:** registrar, completos: `light` `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1`; `living_world` `818cd917c7493f4a3e04512a7120a6eaff5a03fdd16277b7d4fdfd1ee33b6ac5`; `people_and_care` `59988d9a58082a8173a328857fccb6a3716815660f4434c0df4491d6bf30d4e9`; dims 1122×1402, 4:5.
- **Gates:** três hashes completos, sem reticências.
- **Evidências:** tabela de integridade.
- **Parada:** hash divergente da spec → PARAR.
- **Aceite:** contrato de integridade registrado.
- **Rollback:** descartar relatório.

### P0.T7 — Criação da feature flag desligada por padrão
- **Objetivo:** introduzir `COLORIR_60_CREATION_PILOT_ENABLED = false` no módulo canônico de flags **comprovado**.
- **Dep:** P0.T1 · **Commit:** sim (só flag) · **Push/merge:** proibido.
- **Arq✔:** módulo canônico de flags do projeto (a ser **localizado por auditoria**, não presuposto) · **Arq✗:** `ColoringScreen.js`, writer, catálogo.
- **Entradas:** auditoria do local real de flags.
- **Passos:** 1) localizar onde as flags vivem hoje; 2) se ambíguo/inexistente → PARAR e reportar; 3) adicionar a flag default `false`, isolada.
- **Gates:** flag existe e default `false`; app inalterado.
- **Evidências:** diff da flag; print app.
- **Parada:** sem módulo de flags claro → PARAR (não inventar caminho — regra 17).
- **Aceite:** flag desligada, centralizada, sem efeito colateral.
- **Rollback:** `git revert` da flag.

### P0.T8 — Controle negativo com a flag desligada
- **Objetivo:** provar que, com a flag off, nenhuma superfície nova aparece.
- **Dep:** P0.T7 · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** `scripts/smoke.js` (teste) · **Arq✗:** app runtime.
- **Entradas:** flag P0.T7.
- **Passos:** teste assertando catálogo sem exposição, rota inerte, QA invisível com flag off.
- **Gates:** app idêntico ao baseline com flag off.
- **Evidências:** teste verde + print.
- **Parada:** qualquer vazamento com flag off → PARAR.
- **Aceite:** baseline preservado com flag off.
- **Rollback:** remover teste.

### P0.T9 — Baseline de smoke e expo-doctor
- **Objetivo:** registrar contagem de smoke e doctor antes de qualquer código do piloto.
- **Dep:** P0.T1 · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** relatório · **Arq✗:** —.
- **Entradas:** repositório na base.
- **Passos:** 1) `npm run smoke`; 2) `npx expo-doctor`; 3) anotar baseline.
- **Gates:** smoke verde; doctor verde.
- **Evidências:** saídas.
- **Parada:** baseline vermelho → PARAR (não construir sobre base quebrada).
- **Aceite:** baseline registrado.
- **Rollback:** n/a.

### P0.T10 — Confirmação de que nenhum asset novo foi integrado ainda
- **Objetivo:** provar que, ao fim de P0, nenhum PNG do piloto entrou na árvore.
- **Dep:** P0.T3 · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** relatório · **Arq✗:** `activities/`.
- **Entradas:** baseline P0.T3.
- **Passos:** 1) verificar ausência de `assets/stories/creation/coloring/activities/`; 2) confirmar contagem legada inalterada.
- **Gates:** 0 assets novos; `activities/` ausente.
- **Evidências:** listagem do diretório.
- **Parada:** qualquer asset novo presente → PARAR.
- **Aceite:** integração ainda não ocorreu (correto para P0).
- **Rollback:** n/a.

---

# P1 — Catálogo semântico e registro estático de assets

### P1.T1 — Catálogo semântico (metadados) · `src/data/coloring60Catalog.js`
- **Objetivo:** criar catálogo **só de metadados** dos 3 de `creation`, sem carregar asset.
- **Dep:** P0.T6 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `src/data/coloring60Catalog.js` · **Arq✗:** `coloringImages.js`, qualquer `require()` de PNG neste arquivo.
- **Entradas:** spec 016 §11, spec 017 §15.
- **Passos:** 1) declarar entradas `{ storyId:'creation', activityId, order, title, expectedSha256, expectedDims, localSourceKey }`; 2) `auditPath` textual opcional (não runtime); 3) API `getColoring60Activities`/`getColoring60Activity`.
- **Gates:** `coloring60` reporta 3 atividades / modelVersion 2.
- **Evidências:** dump do catálogo.
- **Parada:** faltar/divergir campo obrigatório → PARAR.
- **Aceite:** cobre P1.T3–T7 (activityIds, ordem, títulos, hashes, dims) como asserts; sem `require()` de PNG.
- **Rollback:** `git revert`.

### P1.T2 — Estrutura do registro estático + `require()` ativo **somente** de `light` · `src/assets/coloring60LocalAssets.js`
- **Objetivo:** criar a estrutura do mapa estático `storyId+activityId → require() literal`, isolada do legado, **com um único `require()` ativo em P1: o de `light`** (via `scene_02.png`). Os `require()` de `living_world` e `people_and_care` **não** entram nesta task.
- **Dep:** P1.T1 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `src/assets/coloring60LocalAssets.js` · **Arq✗:** `coloringImages.js` (sem import), `require()` por string, `require()` de `living_world.png`/`people_and_care.png`, qualquer `require()` de arquivo inexistente.
- **Entradas:** localização real dos PNGs; padrão comprovado em `coloringImages.js`.
- **Passos:** 1) calcular caminho relativo real do módulo até `assets/stories/...`; 2) registrar **apenas o `require()` literal de `light`** (delegado a P1.T3, que aponta para `scene_02.png`); 3) API `getColoring60LocalSource(storyId, activityId)`.
- **Gates (7 afirmações):** (a) único `require()` ativo em P1 é o de `light`; (b) `light` resolve para `scene_02.png`; (c) nenhum `require()` de `living_world` em P1; (d) nenhum `require()` de `people_and_care` em P1; (e) nenhuma entrada ativa aponta para arquivo inexistente; (f) sem lineart placeholder/falso/alternativo; (g) os `require()` estáticos de `living_world`/`people_and_care` entram **somente em P5**, atomicamente com os PNGs reais (P5.T4/P5.T6) — o plural "fontes locais" nunca implica 3 atividades ativadas em P1.
- **Evidências:** conteúdo do módulo + resolução Metro (apenas `light` resolve).
- **Parada:** alias não comprovado / caminho relativo incerto / tentação de `require()` de PNG inexistente → PARAR (regra 17 e regra Metro).
- **Aceite:** estrutura pronta; somente `light` resolve estaticamente no Metro em P1.
- **Rollback:** `git revert`.

### P1.T3 — Registro estático de `light` (reuso de `scene_02.png`)
- **Objetivo:** `light` referencia diretamente `assets/stories/creation/coloring/scene_02.png`.
- **Dep:** P1.T2 · **Commit:** sim (com P1.T2) · **Push/merge:** proibido.
- **Arq✔:** `src/assets/coloring60LocalAssets.js` · **Arq✗:** criar `activities/light.png`, copiar/duplicar `light`.
- **Entradas:** hash de `scene_02` (baseline P0.T3).
- **Passos:** 1) `require()` literal de `scene_02.png` para `light`; 2) provar ausência de `activities/light.png`.
- **Gates:** `light` → `scene_02.png`; `activities/light.png` inexistente.
- **Evidências:** entrada do mapa + listagem de diretório.
- **Parada:** qualquer tentativa de cópia de `light` → PARAR.
- **Aceite:** reuso direto, sem cópia/conversão.
- **Rollback:** `git revert`.

### P1.T4 — Entradas estáticas futuras de `living_world` e `people_and_care`
- **Objetivo:** preparar os slots estáticos (referências) que **só resolverão após P5**.
- **Dep:** P1.T2 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `src/assets/coloring60LocalAssets.js` · **Arq✗:** integrar/copiar PNGs (isso é P5).
- **Entradas:** destinos `activities/living_world.png`, `activities/people_and_care.png`.
- **Passos:** documentar que os `require()` definitivos entram junto com a cópia em P5 (sem `require()` de arquivo inexistente antes da integração).
- **Gates:** nenhum `require()` aponta para arquivo ainda ausente.
- **Evidências:** nota de dependência P5.
- **Parada:** tentar `require()` de PNG inexistente → PARAR (quebra Metro).
- **Aceite:** slots preparados, integração diferida a P5.
- **Rollback:** `git revert`.

### P1.T5 — Testes de Metro do catálogo e registro estático · `scripts/smoke.js`
- **Objetivo:** provar resolução estática e integridade de metadados.
- **Dep:** P1.T1–T4 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `scripts/smoke.js` · **Arq✗:** app runtime.
- **Entradas:** catálogo + registro.
- **Passos:** asserts de: 3 activityIds; ordem 1/2/3; títulos ratificados; hashes completos; dims; `light`→`scene_02`; ausência de `require()` dinâmico.
- **Gates:** smoke verde.
- **Evidências:** testes verdes.
- **Parada:** falha de resolução Metro → PARAR.
- **Aceite:** catálogo/registro provados; cobre P1.T3–T10 da Etapa 7.
- **Rollback:** remover testes.

---

# P2 — Resolvedor e navegação interna por `activityId`

### P2.T1 — Resolvedor · `src/services/coloring60Resolver.js`
- **Objetivo:** `resolveColoring60Lineart(storyId, activityId)` agnóstico e isolado.
- **Dep:** P1.T5 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `src/services/coloring60Resolver.js` · **Arq✗:** `getColoringImage`, `useResolvedColoringImage`, `contentResolver`.
- **Entradas:** catálogo + registro estático.
- **Passos:** 1) resolver por `storyId+activityId`; 2) sem entrada → estado honesto (null); 3) local-first (sem remoto).
- **Gates:** não importa nem chama o caminho legado.
- **Evidências:** testes de resolução.
- **Parada:** precisar tocar resolvedor legado → PARAR.
- **Aceite:** cobre P2.T2/T3/T4 (resolução válida; ausência honesta; sem fallback para página errada).
- **Rollback:** `git revert`.

### P2.T2 — Navegação aditiva por `activityId` · `src/screens/ColoringScreen.js` (rota)
- **Objetivo:** aceitar param `activityId` sem alterar o fluxo legado por cena.
- **Dep:** P2.T1 · **Commit:** sim · **Push/merge:** proibido · **⚠ arquivo sensível serializado.**
- **Arq✔:** `ColoringScreen.js` + módulo de rotas (localizado por auditoria) · **Arq✗:** motor `ColoringCanvas.js`, Livrinho.
- **Entradas:** resolvedor P2.T1.
- **Passos:** 1) ler `activityId` da rota; 2) presente → caminho Colorir 60; ausente → caminho legado intocado; 3) `activityId` tratado como **string semântica**, nunca número.
- **Gates:** regressão do fluxo legado verde.
- **Evidências:** teste legado + teste Colorir 60.
- **Parada:** caminho legado mudar de comportamento → PARAR.
- **Aceite:** cobre P2.T5/T6/T7 (navegação aditiva; preservação legado; controle negativo activityId≠número).
- **Rollback:** `git revert`.

### P2.T3 — Entrada interna provisória (sem exposição pública) + testes de regressão
- **Objetivo:** permitir abrir a atividade internamente para dev, sem UI pública, e blindar o legado.
- **Dep:** P2.T2 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** ponto de entrada interno provisório (gated em P7) + `scripts/smoke.js` · **Arq✗:** superfície pública.
- **Entradas:** rota P2.T2.
- **Passos:** 1) entrada dev provisória por `activityId`; 2) testes do resolvedor; 3) testes de regressão do fluxo legado (por `sceneId`/`cenaIndex`).
- **Gates:** legado inalterado; nenhuma posição pública criada.
- **Evidências:** suíte verde.
- **Parada:** exposição pública surgir → PARAR (decisão em aberto).
- **Aceite:** cobre P2.T8/T9/T10.
- **Rollback:** `git revert`.

---

# P3 — Writer próprio, keyspace e entitlement interno

### P3.T1 — Funções fechadas de chave + validação de identificadores · `src/services/coloring60DrawingStorage.js`
- **Objetivo:** builders de chave internos, sem valor livre da tela; validar `storyId/activityId`.
- **Dep:** P1.T1 · **Commit:** sim · **Push/merge:** proibido · **⚠ serializa com writer/conclusão.**
- **Arq✔:** `src/services/coloring60DrawingStorage.js` · **Arq✗:** `drawingStorage.js` (contrato público), `storageKeys.js` bump global.
- **Entradas:** namespace do plano §6.6.
- **Passos:** 1) `keyDrawing60(storyId, activityId)` fechada; 2) validar identificadores contra catálogo; 3) rejeitar chave arbitrária.
- **Gates:** chave não colide com legado; não aceita input livre.
- **Evidências:** testes de chave/validação.
- **Parada:** precisar bump global de schema → PARAR.
- **Aceite:** cobre P3.T1/T2; sem chave arbitrária.
- **Rollback:** `git revert`.

### P3.T2 — APIs de leitura/existência/limpeza · `coloring60DrawingStorage.js`
- **Objetivo:** `getColoring60SavedDrawing`, `hasColoring60SavedDrawing`, `clearColoring60SavedDrawing`.
- **Dep:** P3.T1 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `coloring60DrawingStorage.js` · **Arq✗:** writer legado.
- **Entradas:** chave fechada P3.T1.
- **Passos:** 1) leitura por ponteiro v3; 2) existência; 3) limpeza que **não** remove lineart.
- **Gates:** limpeza não toca legado nem lineart.
- **Evidências:** testes de leitura/existência/limpeza.
- **Parada:** limpeza afetar blob legado → PARAR.
- **Aceite:** cobre P3.T3/T4/T5.
- **Rollback:** `git revert`.

### P3.T3 — API de salvamento com entitlement interno + fail-closed + resultado tipado
- **Objetivo:** `saveColoring60DrawingState` como **autoridade de escrita** com gate interno.
- **Dep:** P3.T2 · **Commit:** sim · **Push/merge:** proibido · **⚠ fronteira real de escrita.**
- **Arq✔:** `coloring60DrawingStorage.js` · **Arq✗:** lógica de `accessControl`/`entitlementService` (só consumir).
- **Entradas:** `accessControl.getCurrentPlan()`.
- **Passos:** 1) revalidar plano a cada save (D6); 2) Família → persiste; grátis → 0 escrita; indeterminado → fail-closed; 3) retorno tipado `saved`/`not_persisted_free`/`write_failed`; 4) reutilizar `fileBlobStore` só se preservar isolamento; 5) sem escrita parcial/ponteiro órfão.
- **Gates:** revisão independente da fronteira de escrita.
- **Evidências:** testes por plano + resultado tipado.
- **Parada:** precisar chave da tela / mudar contrato de `drawingStorage` / writer genérico → PARAR.
- **Aceite:** cobre P3.T6/T7/T8/T9/T10/T11.
- **Rollback:** `git revert`.

### P3.T4 — Testes negativos do writer (grátis / chamada direta / falha sem resíduo)
- **Objetivo:** provar que nada é escrito sem entitlement e que falhas não deixam resíduo.
- **Dep:** P3.T3 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `scripts/smoke.js` · **Arq✗:** app runtime.
- **Entradas:** writer P3.T3.
- **Passos:** asserts — `writeBlob`/`writeAsStringAsync` não chamados; sem chave/ponteiro/arquivo temp/blob órfão; chamada direta sem entitlement negada; ausência/falha da fonte de entitlement também negada.
- **Gates:** todos os spies em 0 no caminho grátis.
- **Evidências:** suíte negativa verde.
- **Parada:** qualquer escrita no grátis → PARAR.
- **Aceite:** cobre P3.T12/T13/T14.
- **Rollback:** remover testes.

### P3.T5 — Teste de round-trip premium
- **Objetivo:** provar persistência íntegra e recuperação no Plano Família.
- **Dep:** P3.T3 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `scripts/smoke.js` · **Arq✗:** —.
- **Entradas:** writer P3.T3.
- **Passos:** premium → salva → lê de volta; falha simulada → sem resíduo; sem falso sucesso.
- **Gates:** round-trip verde.
- **Evidências:** teste verde.
- **Parada:** falso sucesso reportado → PARAR.
- **Aceite:** cobre P3.T15.
- **Rollback:** remover teste.

---

# P4 — Separação entre conclusão e salvamento

### P4.T1 — Serviço de conclusão por `activityId` · `src/services/coloring60ActivityService.js`
- **Objetivo:** conclusão plan-agnóstica com chave `@ptf_coloring60_done_<storyId>_<activityId>`.
- **Dep:** P3.T1 · **Commit:** sim · **Push/merge:** proibido · **⚠ serializa com writer.**
- **Arq✔:** `src/services/coloring60ActivityService.js` (irmão; sem tocar `coloringActivityService.js` legado) · **Arq✗:** conceder estrela, marcar cena narrativa.
- **Entradas:** namespace de conclusão §6.6.
- **Passos:** 1) `markColoring60ActivityDone`/`loadColoring60Done` fechadas; 2) exige lineart pronto + traço significativo; 3) funciona free e Família; 4) **não** persiste pixels; **não** dá estrela; **não** conclui cena narrativa.
- **Gates:** conclusão independente da persistência.
- **Evidências:** testes de conclusão.
- **Parada:** conclusão acoplar-se a save/estrela/cena → PARAR.
- **Aceite:** cobre P4.T1–T8.
- **Rollback:** `git revert`.

### P4.T2 — Integração com `ColoringScreen` (ordem canônica) + resultados tipados
- **Objetivo:** ligar conclusão + writer na fronteira real, na ordem `lineart → traço → concluir → gate → persistir`.
- **Dep:** P4.T1, P3.T3 · **Commit:** sim · **Push/merge:** proibido · **⚠ ColoringScreen serializado.**
- **Arq✔:** `ColoringScreen.js` · **Arq✗:** copy pública, Livrinho, motor.
- **Entradas:** writer + serviço de conclusão.
- **Passos:** 1) `canvasReady`(D1) → `hasMeaningfulPaint`(D5) → marcar conclusão → chamar writer (gate interno) → tratar `saved`/`not_persisted_free`/`write_failed`; 2) falha de persistência **não** apaga conclusão válida; 3) UI não anuncia falso salvamento; 4) sem definir copy pública.
- **Gates:** free conclui + 0 pixels; premium conclui + salva.
- **Evidências:** testes de separação.
- **Parada:** métrica pública "colorir concluído" exigida → PARAR (em aberto).
- **Aceite:** cobre P4.T9–T14.
- **Rollback:** `git revert`.

---

# P5 — Integração controlada das duas novas artes (só após portão autorizado)

> **Bloqueio:** nenhuma task de P5 executa antes das tasks anteriores concluídas **e** de portão humano específico de integração de assets. Auditoria de lote por asset (governança de assets).

### P5.T1 — `light`: perícia e reuso sem cópia
- **Objetivo:** confirmar `light` por referência a `scene_02.png`, sem cópia/conversão.
- **Dep:** P1.T3 · **Commit:** não (verificação) · **Push/merge:** proibido.
- **Arq✔:** relatório · **Arq✗:** criar `activities/light.png`, converter/copiar.
- **Entradas:** hash de `scene_02` (P0.T3), hash esperado `light` `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1`.
- **Passos:** 1) verificar hash do original `scene_02.png`; 2) confirmar `require()` direto; 3) provar ausência de `activities/light.png`.
- **Gates:** `light` idêntico ao contrato; sem novo arquivo.
- **Evidências:** hash + listagem.
- **Parada:** qualquer cópia/conversão de `light` → PARAR.
- **Aceite:** cobre P5(light) 1–5.
- **Rollback:** n/a.

### P5.T2 — Gate determinístico de integridade dos assets Colorir 60 · `scripts/verify-coloring60-assets.js`
- **Objetivo:** criar o gate auditável e determinístico que prova a integridade dos assets Colorir 60 (`light` por reuso; `living_world` e `people_and_care` por cópia byte a byte), sem reencode, cópia, autofix ou criação de arquivo — deliverable nomeado no plan.md §7 e §6.2/§8.
- **Dep:** P0.T6 · **Commit:** sim (script + testes, **sem PNG**) · **Push/merge:** proibido · **⚠ script de verificação — não integra nem copia assets.**
- **Arq✔:** `scripts/verify-coloring60-assets.js` + `scripts/smoke.js` (controles do script) · **Arq✗:** qualquer PNG, linearts legados, `coloringImages.js`, `coloring60LocalAssets.js`, código runtime do app, packs/manifests remotos.
- **Entradas:** contrato de hashes P0.T6 (spec 017 §15); destinos canônicos dos 2 PNGs novos; regra de reuso de `light` (nunca `activities/light.png`).
- **Passos:** 1) Node.js puro, **sem dependência nova**; 2) matriz **explícita** de assets aprovados — `light`=reuso de `assets/stories/creation/coloring/scene_02.png` (sem destino em `activities/`), `living_world` fonte `C:\tmp\ptf_colorir60_creation_production\living_world_approved.png` → destino `assets/stories/creation/coloring/activities/living_world.png`, `people_and_care` fonte `C:\tmp\ptf_colorir60_creation_production\people_and_care_approved.png` → destino `assets/stories/creation/coloring/activities/people_and_care.png`; 3) **somente leitura**; 4) por asset: SHA-256, magic bytes PNG, dimensões (1122×1402), modo de cor, tamanho em bytes; 5) existência/ausência esperada — `activities/light.png` deve estar **AUSENTE** (falha se existir); 6) comparação **byte a byte** fonte↔destino nos 2 copiados; 7) `exit ≠ 0` em qualquer divergência; 8) modos **pré-integração** (fontes/destinos ainda ausentes → estado esperado) e **pós-integração** (destinos presentes e íntegros); 9) **nunca** reencode/copiar/autofix/criar arquivo ausente/aceitar fallback; 10) saída determinística e auditável (mesma entrada → mesma saída).
- **Gates:** script existe e roda **`--mode=pre` VERDE (exit `0`) na fase `PRE`, antes de qualquer cópia** (P5.T4/P5.T6); controles em `smoke.js` verdes. *(Este verde é o do estado pré-integração; após P5.T4 o `--mode=pre` fica VERMELHO por contrato — ver decisão do fundador em P5.T3b.)*
- **Evidências:** saída do script (pré e pós) + testes de controle em `smoke.js`.
- **Parada:** script precisar copiar/reencode/criar arquivo, aceitar fallback ou depender de lib nova → PARAR (regra 2/14).
- **Aceite:** gate determinístico presente e **VERDE em `--mode=pre` na fase `PRE`**; cobre P5(script) 1–10; sem nenhum PNG no commit.
- **Rollback:** `git revert` (script/testes; nenhum asset tocado).

### P5.T3 — `living_world`: perícia da fonte (hash/magic/dims/modo/tamanho antes da cópia)
- **Objetivo:** validar a fonte externa antes de qualquer cópia.
- **Dep:** P4 concluído + portão de assets · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** relatório · **Arq✗:** destino em `assets/`.
- **Entradas:** fonte `C:\tmp\ptf_colorir60_creation_production\living_world_approved.png`; SHA esperado `818cd917c7493f4a3e04512a7120a6eaff5a03fdd16277b7d4fdfd1ee33b6ac5`; dims 1122×1402.
- **Passos:** 1) SHA-256 antes; 2) magic bytes PNG; 3) dimensões; 4) modo de cor; 5) tamanho.
- **Gates:** todos os atributos == esperado.
- **Evidências:** ficha de perícia.
- **Parada:** qualquer divergência → PARAR (não copiar).
- **Aceite:** fonte validada.
- **Rollback:** n/a.

### P5.T3b — `C60-IMPL-P5-ASSET-PHASE-SMOKE-FIX1` (bloco próprio) — smoke consciente de fase · **PRÉ-REQUISITO OBRIGATÓRIO DE P5.T4**
- **Objetivo:** eliminar o bloqueio **RR1** da auditoria `C60-IMPL-P0-T3-BASELINE-ANCHOR1-FIX1-QA1`: até este bloco, `scripts/smoke.js` continha controles válidos **apenas** para o estado pré-P5.T4 — (i) asserção de que `activities/` não existe; (ii) exigência de **exatamente dois** `destino: AUSENTE` em `--mode=post`; (iii) tratamento da existência de `activities/` como falha absoluta. Após a integração **legítima** de `living_world` (P5.T4) e `people_and_care` (P5.T6) esses controles reprovariam um estado **correto**.
- **Dep:** `C60-IMPL-P0-T3-BASELINE-ANCHOR1-FIX1-QA1` APROVADO · **Commit:** sim (1 commit local, só teste/governança) · **Push/merge:** proibido.
- **Arq✔:** `scripts/smoke.js` + `specs/016-colorir-60-pilot-creation/tasks.md` · **Arq✗:** qualquer PNG, `activities/`, `coloring60LocalAssets.js`, `coloring60Catalog.js`, `coloringImages.js`, `verify-coloring60-assets.js`, `plan.md`, spec 016/017, feature flags, `package.json`/`package-lock.json`, config Expo, qualquer runtime, qualquer baseline/manifesto/gerador.
- **Entradas:** matriz fechada de 3 assets do `verify-coloring60-assets.js`; contrato `c960f1bb…83c1`; semântica `199 + 1`; proibição permanente de `activities/light.png`.
- **Passos:** 1) máquina de estados **fechada** interna ao smoke com as três únicas fases legítimas — `C60_ASSET_PHASE_PRE`, `C60_ASSET_PHASE_LIVING_WORLD`, `C60_ASSET_PHASE_COMPLETE` (mais `INVALID` como falha dura); 2) substituir as suposições absolutas por verificações **condicionadas à fase**, sem deletar cobertura; 3) inventário fechado de `activities/` por `lstat` (sem filtrar ocultos/extensões, sem seguir symlink, sem aceitar subdiretório nem terceiro arquivo); 4) contrato de `--mode=post` por fase (2/1/0 destinos ausentes; VERDE só em COMPLETE); 5) contrato de `--mode=pre` por fase, sem relaxar as provas substantivas; 6) 20 controles negativos + provas por funções puras, fixtures em memória e repo-scratch em `os.tmpdir()` removido ao final.
- **Gates:** `npm run smoke` verde **sem redução líquida de cobertura**; `npx expo-doctor`; nenhum asset criado/copiado/movido; nenhum resíduo de fixture.
- **Evidências:** contagem de testes antes/depois; execução do **verificador real** nas três fases via repo-scratch; buscas adversariais; `git diff --cached --name-only` com exatamente os dois arquivos autorizados.
- **Parada:** máquina de estados incompleta / regressão de cobertura / qualquer relaxamento de integridade / escopo excedido → PARAR.
- **Aceite:** o smoke reconhece as três fases legítimas e reprova como **falha dura** qualquer estado fora delas; `activities/light.png` continua proibido em **todas** as fases; a ordem `living_world` → `people_and_care` é obrigatória.
- **Rollback:** `git revert` do commit (só teste/governança; nenhum asset tocado).
- **⚠ Constatação técnica RR2 (comprovada empiricamente, não relaxada):** `verify-coloring60-assets.js` é **arquivo proibido** neste bloco e sua função `evaluateExternalCopy(asset, 'pre')` exige `destino: AUSENTE`. Logo, **a partir de P5.T4 o `--mode=pre` fica VERMELHO por contrato próprio do gate** — comportamento provado empiricamente contra o binário real nas três fases. O smoke passa a **exigir** esse resultado por fase (um `pre` VERDE na fase `LIVING_WORLD`/`COMPLETE` **reprova**), e as cinco provas substantivas do `pre` (matriz fechada de 3, `light` íntegro, `activities/light.png` ausente, 2 fontes externas íntegras, nenhum erro de fonte) permanecem obrigatórias nas três fases. **Consequência para P5.T4/P5.T6:** o gate de aceite é `--mode=post`, não `--mode=pre`.

- **🚦 DECISÃO NORMATIVA DO FUNDADOR — bloco `C60-IMPL-P5-ASSET-PHASE-CONTRACT-RATIFICATION1`.** As determinações abaixo são **decisão explícita e final do fundador**, por ele registrada neste bloco documental — **não** são interpretação autônoma do executor nem do auditor. Elas **substituem** qualquer exigência incompatível presente nos briefings anteriores deste fluxo:
  1. A antiga exigência de `--mode=pre` com **exit code `0` nas três fases legítimas** está **formalmente REVOGADA**.
  2. `--mode=pre` é **exclusivamente o gate do estado anterior à integração dos destinos**: **VERDE / exit `0` somente na fase `PRE`**; **VERMELHO / exit ≠ `0`** nas fases `LIVING_WORLD` e `COMPLETE`. Esse vermelho **não é regressão** — é consequência obrigatória do contrato congelado do verificador.
  3. `--mode=post` é o **gate oficial durante e depois das integrações**: VERMELHO em `PRE` (2 destinos ausentes), VERMELHO em `LIVING_WORLD` (1 destino ausente) e **VERDE / exit `0` somente em `COMPLETE`**.
  4. A máquina de estados e seus resultados esperados por fase permanecem **falhas duras e bidirecionais**: reprova tanto o resultado pior quanto o resultado *melhor* que o contratado para a fase.
  5. **Nenhum relaxamento do verificador foi autorizado.**
  6. `scripts/verify-coloring60-assets.js` **permanece congelado** (SHA-256 verificado `55158761a67514d85116c8639d84f25032976890838276c74e081a583ce70750`); alterá-lo continua **proibido**.

- **🚦 RATIFICAÇÃO EXCEPCIONAL DO AMEND (decisão explícita do fundador).** O fundador **ratificou** o `git commit --amend` que substituiu o commit local `f3ad3ef` pelo commit `87f3fa6`, com base nas provas da auditoria independente `C60-IMPL-P5-ASSET-PHASE-SMOKE-FIX1-QA1`: **tree idêntica**, **parent idêntico**, **patch idêntico**, **lista de arquivos idêntica**, **nenhuma mudança de conteúdo** — somente a mensagem do commit foi corrigida — e **nenhuma branch, tag, worktree ou remoto dependia** do commit anterior; **nenhuma publicação ocorreu**. A ratificação é **pontual e NÃO cria precedente** autorizando futuros amends proibidos. A partir deste bloco, diante de mensagem de commit criada incorretamente o agente deve: 1) **PARAR**; 2) **não** executar `git commit --amend`; 3) **não** executar reset nem qualquer reescrita de histórico; 4) **relatar o SHA criado e a mensagem incorreta**; 5) **aguardar autorização explícita do fundador**. O commit `87f3fa6` **não deve ser alterado novamente**.

### P5.T3c — `C60-IMPL-P5-ASSET-PHASE-SMOKE-FIX2` (bloco próprio) — fixtures de fase independentes do estado do repositório · **PRÉ-REQUISITO OBRIGATÓRIO DE P5.T4**
- **Objetivo:** corrigir o **defeito de harness** revelado pela primeira tentativa de P5.T4: mesmo com o asset e o registro aprovados em todos os gates anteriores, **oito** provas do bloco de fases de `scripts/smoke.js` — `[anc3]`, `[anc4]`, `[P1]`, `[P2]`, `[P3]`, `[P4]`, `[N4]`, `[N15]` — continuavam **dependentes da fase real `PRE`**: as fixtures de registro eram o próprio arquivo real (`regPre = regReal`), a ligação de slot era um `.replace()` sem validação (virava no-op no slot e injetava `require()` **duplicado** quando o slot já estava ligado) e a expectativa das âncoras estava **fixada em `PRE`**. Resultado: `npm run smoke` 3302/3310 num estado de integração **correto**.
- **Dep:** `C60-IMPL-P5-ASSET-PHASE-CONTRACT-RATIFICATION1-QA1` APROVADO · **Commit:** sim (1 commit local, só teste/governança) · **Push/merge:** proibido · **⚠ este bloco NÃO integra imagens.**
- **Arq✔:** `scripts/smoke.js` + `specs/016-colorir-60-pilot-creation/tasks.md` · **Arq✗:** `scripts/verify-coloring60-assets.js` (congelado), `src/assets/coloring60LocalAssets.js`, qualquer arquivo em `assets/`, `coloring60Catalog.js`, `coloringImages.js`, feature flags, spec 016/017, `plan.md`, `docs/DECISIONS.md`, resolvers, services, telas, navegação, `package.json`/`package-lock.json`, config Expo.
- **Registro de fato:** a tentativa de P5.T4 foi **interrompida e revertida sem commit** (rollback restrito: PNG removido, registro restaurado por `git checkout HEAD --`, `activities/` vazio removido); o **asset e o registro haviam passado por todos os gates anteriores** (perícia da fonte, cópia byte a byte, SHA-256 depois, `--mode=post` no contrato da fase `LIVING_WORLD`) — a falha foi **exclusivamente** do harness de teste.
- **Passos:** 1) normalização canônica de registro para `PRE`, derivável de **qualquer** das três fases, com recusa dura de slot fora do contrato, `require()` dinâmico, path não autorizado, duplicata, ordem inválida, contagem errada de ocorrências e **transformação sem efeito**; 2) ligação estrita de slot (só a partir de `null`, exatamente 1 `require()` literal canônico inserido, sem tocar no outro slot, recusando religação); 3) as quatro fixtures canônicas passam a nascer dessa normalização; 4) âncoras `[anc3]`/`[anc4]` passam a usar a **fase detectada na execução** (reconferida depois do subprocesso, `INVALID` reprova) e a comparar `stdout` **integral** + exit code + `stderr`; 5) seis controles novos contra reincidência (7.1–7.6) + prova de estado completo nas três fases via repo-scratch; 6) **nenhuma** cobertura removida ou rebaixada a aviso.
- **Gates:** `npm run smoke` **integralmente verde e sem redução líquida de cobertura** (3310 → 3324, +14, nenhum teste removido); `--mode=pre` VERDE na fase `PRE`; `--mode=post` VERMELHO com 2 destinos ausentes na fase `PRE`; `npx expo-doctor`.
- **Evidências:** reprodução do defeito nos três estados de registro antes da correção; prova focal (19 demonstrações) com os helpers **extraídos literalmente** do smoke corrigido; execução do **verificador real** nas três fases via repo-scratch; buscas adversariais; `git diff --cached --name-only` com exatamente os dois arquivos autorizados.
- **Parada:** qualquer remoção/rebaixamento de teste, qualquer relaxamento do contrato de fase ratificado, qualquer alteração do verificador congelado ou do registro estático, escopo excedido → PARAR sem commit.
- **Aceite:** as oito provas passam a valer **identicamente** nas fases `PRE`, `LIVING_WORLD` e `COMPLETE`; os contratos ratificados de `--mode=pre` e `--mode=post` permanecem **intactos**; o gate de P5.T4 **não** foi relaxado.
- **Rollback:** `git revert` do commit (só teste/governança; nenhum asset tocado).
- **🚦 Bloqueio de P5.T4:** P5.T4 **permanece não executada** e fica **bloqueada até `C60-IMPL-P5-ASSET-PHASE-SMOKE-FIX2-QA1` APROVADO**. P5.T6 e P5.T7 também permanecem não executadas. `scripts/smoke.js` **continua fora** do commit futuro de P5.T4. **Nenhuma integração de asset foi concluída neste bloco.**

### P5.T4 — `living_world`: cópia byte a byte + hash depois + comparação + registro estático
- **Objetivo:** integrar **apenas** `living_world` (**integração atômica**), sem reencode, com prova antes/depois. **O gate de aceite desta task NÃO é o resultado verde final do lote** — é o contrato de fase `LIVING_WORLD` abaixo (decisão do fundador registrada em P5.T3b).
- **Dep:** **bloqueada até `C60-IMPL-P5-ASSET-PHASE-SMOKE-FIX2-QA1` APROVADO (pré-requisito obrigatório)** — a primeira tentativa de P5.T4 foi interrompida e revertida sem commit por defeito de harness (oito fixtures ainda dependentes da fase real `PRE`), corrigido em **P5.T3c**; `C60-IMPL-P5-ASSET-PHASE-CONTRACT-RATIFICATION1-QA1` APROVADO — este gate **substituiu** o anterior `C60-IMPL-P5-ASSET-PHASE-SMOKE-FIX1-QA1`, cuja reprovação por contrato foi resolvida pela decisão normativa do fundador em P5.T3b; P5.T3c (fixtures independentes de fase), P5.T3b (smoke consciente de fase), P5.T2 (gate `--mode=pre` VERDE na fase `PRE`), P5.T3 (perícia), P4 concluído + portão de assets · **Commit:** sim (asset isolado) · **Push/merge:** proibido · **⚠ commit de asset, não misturar com código.**
- **Arq✔:** `assets/stories/creation/coloring/activities/living_world.png` + `src/assets/coloring60LocalAssets.js` (require definitivo) · **Arq✗:** reencode, outros assets, **`scripts/smoke.js` (já adaptado em P5.T3b — não pode entrar neste commit)**.
- **Entradas:** perícia P5.T3; gate `verify-coloring60-assets.js` **VERDE em `--mode=pre` na fase `PRE`, antes de qualquer cópia** (P5.T2); smoke consciente de fase (P5.T3b).
- **Passos:** 1) cópia byte a byte para o destino; 2) SHA-256 depois == `818cd917...`; 3) comparação byte a byte fonte↔destino; 4) rodar `verify-coloring60-assets.js --mode=post` pós-integração; 5) `require()` estático definitivo.
- **Gates (contrato da fase `LIVING_WORLD` — resultados concretos, todos obrigatórios):** hash depois == esperado; diff byte a byte zero; e **todas** as condições abaixo:
  1. Máquina de estados detecta **exatamente `C60_ASSET_PHASE_LIVING_WORLD`**.
  2. `activities/` contém **exatamente** `living_world.png`.
  3. `activities/light.png` **continua AUSENTE**.
  4. `people_and_care.png` **continua AUSENTE**.
  5. Registro estático com `light` e `living_world` **ligados**.
  6. Slot `people_and_care` **continua `null`**.
  7. `--mode=post` produz **exatamente dois `[OK]`**: `[OK] light` e `[OK] living_world`.
  8. `--mode=post` reporta `people_and_care` **ausente ou divergente**, com **exatamente 1** `destino: AUSENTE`.
  9. `--mode=post` termina em **`RESULTADO(post): VERMELHO`**.
  10. `--mode=post` termina com **exit code ≠ `0`**.
  11. `--mode=pre` termina em **VERMELHO** (exit ≠ `0`) — **esperado por contrato, NÃO é regressão** (ver P5.T3b).
  12. `npm run smoke` **integralmente verde**, reconhecendo a fase `C60_ASSET_PHASE_LIVING_WORLD`.
  13. **Nenhum** asset ou arquivo fora do **Arq✔** de P5.T4 alterado.
  - **REPROVA:** `RESULTADO(post): VERDE` nesta fase **reprova P5.T4** — indicaria integração prematura de `people_and_care.png` ou adulteração do contrato. O **VERDE de `post` só é atingível em P5.T6**.
- **Evidências:** hash antes/depois + comparação + saída de `--mode=post` + saída de `--mode=pre` + saída de `npm run smoke`.
- **Parada:** hash divergente / `post` fora do contrato da fase (inclusive **`post` VERDE**) / `pre` VERDE / smoke classificando `INVALID` → PARAR + rollback.
- **Aceite:** um PNG novo, íntegro, registrado; repositório na fase `C60_ASSET_PHASE_LIVING_WORLD`.
- **Rollback:** remover arquivo + reverter require (o repositório volta à fase `C60_ASSET_PHASE_PRE`).

### P5.T5 — `people_and_care`: perícia da fonte
- **Objetivo:** validar a fonte externa antes da cópia.
- **Dep:** P4 concluído + portão de assets · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** relatório · **Arq✗:** destino em `assets/`.
- **Entradas:** fonte `C:\tmp\ptf_colorir60_creation_production\people_and_care_approved.png`; SHA esperado `59988d9a58082a8173a328857fccb6a3716815660f4434c0df4491d6bf30d4e9`; dims 1122×1402.
- **Passos:** hash antes / magic bytes / dims / modo / tamanho.
- **Gates:** atributos == esperado.
- **Evidências:** ficha de perícia.
- **Parada:** divergência → PARAR.
- **Aceite:** fonte validada (exceção visual PL01G-FIX1 já ratificada; não reabrir).
- **Rollback:** n/a.

### P5.T6 — `people_and_care`: cópia byte a byte + hash depois + comparação + registro estático
- **Objetivo:** integrar `people_and_care` sem reencode, com prova antes/depois, **concluindo o lote**: é aqui — e **só** aqui — que `--mode=post` fica **VERDE (exit `0`)**.
- **Dep:** **P5.T3b (smoke consciente de fase)**, P5.T4 (fase `LIVING_WORLD` estabelecida), P5.T2 (gate `--mode=pre` VERDE na fase `PRE`), P5.T5 (perícia), P4 concluído + portão de assets · **Commit:** sim (asset isolado) · **Push/merge:** proibido.
- **Arq✔:** `assets/stories/creation/coloring/activities/people_and_care.png` + `coloring60LocalAssets.js` · **Arq✗:** reencode, **`scripts/smoke.js`**.
- **Entradas:** perícia P5.T5; gate `verify-coloring60-assets.js` **VERDE em `--mode=pre` na fase `PRE`, antes de qualquer cópia** (P5.T2); smoke consciente de fase (P5.T3b).
- **Passos:** cópia byte a byte → hash depois == `59988d9a...` → comparação byte a byte → `verify-coloring60-assets.js --mode=post` pós-integração → require estático.
- **Gates (contrato da fase `COMPLETE` — resultados concretos, todos obrigatórios):** hash depois == esperado; diff zero; e **todas** as condições abaixo:
  1. Máquina de estados detecta **exatamente `C60_ASSET_PHASE_COMPLETE`**.
  2. `--mode=post` produz **`[OK]` nos três assets** (`light`, `living_world`, `people_and_care`).
  3. `--mode=post` reporta **ZERO** `destino: AUSENTE`.
  4. `--mode=post` termina em **`RESULTADO(post): VERDE`**.
  5. `--mode=post` termina com **exit code `0`**.
  6. `--mode=pre` termina em **VERMELHO** (exit ≠ `0`) — **esperado por contrato** (ver P5.T3b), com as cinco provas substantivas intactas.
  7. `npm run smoke` **integralmente verde**, reconhecendo a fase `C60_ASSET_PHASE_COMPLETE`.
  8. **Nenhum** asset ou arquivo fora do **Arq✔** de P5.T6 alterado.
- **Evidências:** hash antes/depois + saída de `--mode=post` (VERDE) + saída de `--mode=pre` (VERMELHO) + saída de `npm run smoke`.
- **Parada:** divergência / `post` não-VERDE / smoke classificando `INVALID` → PARAR + rollback.
- **Aceite:** segundo PNG novo íntegro; repositório na fase `C60_ASSET_PHASE_COMPLETE`.
- **Rollback:** remover arquivo + reverter require (o repositório volta à fase `C60_ASSET_PHASE_LIVING_WORLD`).

### P5.T7 — Reconciliação de inventário: apenas dois PNGs novos, legado intacto
- **Objetivo:** provar que a árvore ganhou exatamente 2 arquivos e os 200 legados seguem idênticos.
- **Dep:** P5.T4, P5.T6 · **Commit:** não (verificação) · **Push/merge:** proibido.
- **Arq✔:** relatório · **Arq✗:** —.
- **Entradas:** baseline canônica P0.T3 — `C:\tmp\ptf_colorir60_p0_evidence\baseline_200_legacy_f16491c.tsv`, SHA-256 `a3bc2d10d526ea49e85c92f3a1c61e89038ca3323c56ef8877146e80a87c7a61` (contrato em spec 016 §16.5).
- **Passos:** 1) reconciliar os **200 legados** pelo **algoritmo canônico** abaixo (conjunto fechado do TSV); 2) inventariar **separadamente** os **2 assets novos**; 3) confirmar ausência de `activities/light.png`; 4) rodar `verify-coloring60-assets.js --mode=post` pós-integração como gate final de lote (VERDE).
- **Gates:** **200/200 legados idênticos** ao conjunto fechado do TSV; **exatamente +2 novos**, verificados fora do conjunto legado; **gate de lote — comando inequívoco: `node scripts/verify-coloring60-assets.js --mode=post` → `RESULTADO(post): VERDE`, exit `0`**; `npm run smoke` verde na fase `C60_ASSET_PHASE_COMPLETE`. **`--mode=pre` NÃO é gate de sucesso do lote integrado** e, nesta fase, termina em VERMELHO por contrato (decisão do fundador em P5.T3b).
- **Evidências:** diff de inventário (legados) + inventário separado dos 2 novos + saída do script.
- **Parada:** qualquer legado alterado / mais de 2 novos → PARAR + rollback.
- **Aceite:** cobre P5 1–14 (reconciliação e ausência de reencode).
- **Rollback:** reverter cópias.

> **Algoritmo canônico de P5.T7 (conjunto fechado do TSV) — obrigatório.**
> **Proibido** usar `git ls-files -- 'assets/stories/*/coloring/*.png'` isoladamente como conjunto canônico dos legados: no pathspec do Git o `*` **atravessa `/`**, de modo que, após P5.T4 e P5.T6, esse padrão passa a capturar também os PNGs de `assets/stories/creation/coloring/activities/` e retorna **202** entradas. As 2 entradas adicionais **não são legados** e nunca podem ser contadas como tal. O mesmo vale para qualquer glob de filesystem equivalente. A solução canônica é usar os **paths do TSV**:
> 1. verificar o **SHA-256 do TSV externo**;
> 2. exigir exatamente `a3bc2d10d526ea49e85c92f3a1c61e89038ca3323c56ef8877146e80a87c7a61`;
> 3. ler o **cabeçalho** do TSV;
> 4. exigir schema `ptf-coloring-baseline-v1` e as colunas `path`, `bytes`, `width`, `height`, `bitDepth`, `colorType`, `colorMode`, `sha256`, nessa ordem;
> 5. ler **exatamente os 200 paths** da coluna `path`;
> 6. exigir **200 paths únicos**;
> 7. usar essa lista como **conjunto fechado dos legados** (nunca ampliar);
> 8. para **cada** path: a) confirmar presença; b) confirmar **arquivo regular**; c) confirmar **ausência de symlink** (`lstat`, nunca `stat`); d) recomputar **bytes**; e) recomputar **dimensões**; f) recomputar **bit depth**; g) recomputar **color type**; h) recomputar **modo**; i) recomputar **SHA-256**; j) **comparar todos os campos** à linha correspondente do TSV;
> 9. exigir **200 de 200 idênticos**;
> 10. **não ampliar** o conjunto com glob de filesystem;
> 11. **não incluir** `activities/` no conjunto legado;
> 12. **não reexecutar** `generate_baseline_200_f16491c.js` depois que o HEAD mudar — ele é fixado a `f16491ca5e05c27fdd8e9d47b672650b444b4ded` e aborta em qualquer outro HEAD;
> 13. tratar o gerador como **artefato de produção da baseline daquele HEAD**, **não** como verificador de P5.T7 — a verificação de P5.T7 é recomputação própria contra o TSV.

> **Inventário separado dos 2 assets novos (nunca misturado aos 200 legados).**
> Após P5.T4 e P5.T6, exigir **exatamente**:
> 1. `assets/stories/creation/coloring/activities/living_world.png`;
> 2. `assets/stories/creation/coloring/activities/people_and_care.png`.
>
> E ainda: 1) **exatamente dois** PNGs em `activities/`; 2) **nenhum terceiro arquivo** no diretório; 3) `activities/light.png` **ausente** (falha dura se existir); 4) `living_world` **byte-idêntico** à fonte aprovada; 5) `people_and_care` **byte-idêntico** à fonte aprovada; 6) os **dois `require()` literais** presentes em `coloring60LocalAssets.js`; 7) `scene_02.png` **permanece fora** de `activities/` (reuso direto, sem cópia); 8) total conceitual: **200 legados preservados + 2 novos assets físicos** — jamais "202 legados"; 9) Colorir 60 possui **3 atividades**: `light` **por reuso**, `living_world` **por cópia**, `people_and_care` **por cópia**.

> **Compatibilidade da baseline com P5.T4 e P5.T6.**
> 1. **P5.T4 pode adicionar `living_world` sem alterar o TSV.**
> 2. **P5.T6 pode adicionar `people_and_care` sem alterar o TSV.**
> 3. O TSV **continua válido** porque contém apenas os **200 paths fechados** dos legados — nenhum dos 2 novos pertence a esse conjunto.
> 4. O **manifesto não precisa ser regenerado** após cada cópia.
> 5. Os campos `living_world_destination` e `people_and_care_destination` do manifesto são **snapshot** do momento da geração (spec 016 §16.6) e ficarão naturalmente desatualizados — isso não invalida o TSV.
> 6. **P5.T7 executa a reconciliação final** usando **baseline TSV dos 200** **mais** o **inventário separado dos 2 novos**.
> 7. Nada aqui altera os contratos técnicos de `living_world` (`818cd917c7493f4a3e04512a7120a6eaff5a03fdd16277b7d4fdfd1ee33b6ac5`) ou de `people_and_care` (`59988d9a58082a8173a328857fccb6a3716815660f4434c0df4491d6bf30d4e9`), definidos em P5.T3/P5.T5 e no gate P5.T2.

---

# P6 — Reabertura, lineart e recuperação

### P6.T1 — Recuperação premium: ponteiro + blob + recomposição de lineart
- **Objetivo:** provar round-trip premium reabrindo a atividade, com contorno correto por atividade.
- **Dep:** P3.T3, P5.T7 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `scripts/smoke.js` + código de exibição da atividade (sem Livrinho) · **Arq✗:** `StoryBookScreen.js`, motor.
- **Entradas:** writer + resolvedor.
- **Passos:** 1) reabrir atividade premium; 2) recuperar ponteiro/blob; 3) recompor lineart: `light`↔lineart legado correto, `living_world`↔seu lineart, `people_and_care`↔seu lineart; 4) provar ausência de troca entre atividades.
- **Gates:** cada atividade usa o próprio contorno; sem cruzamento.
- **Evidências:** testes por atividade.
- **Parada:** troca de contorno entre atividades → PARAR.
- **Aceite:** cobre P6.T1–T8.
- **Rollback:** `git revert`.

### P6.T2 — Limpeza sem remover lineart + estado honesto + testes reabrir/offline
- **Objetivo:** provar D1/D4 e persistência através de reinício e offline.
- **Dep:** P6.T1 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `scripts/smoke.js` + exibição da atividade · **Arq✗:** Livrinho (permanece fora de escopo/intocado).
- **Entradas:** P6.T1.
- **Passos:** 1) limpar arte sem apagar lineart; 2) sem lineart → estado honesto (nunca cor sozinha); 3) fechar/reabrir app; 4) offline.
- **Gates:** lineart sempre presente; recuperação após reinício; Livrinho intocado.
- **Evidências:** testes + verificação de que Livrinho não foi tocado.
- **Parada:** cor sem contorno / Livrinho alterado → PARAR.
- **Aceite:** cobre P6.T9–T13.
- **Rollback:** `git revert`.

---

# P7 — Feature flag e entrada interna de QA

### P7.T1 — Entrada interna de QA com três gates · `ColoringQaScreen` (ou equivalente)
- **Objetivo:** abrir as 3 atividades de A Criação em device, protegido por 3 gates simultâneos.
- **Dep:** P2.T3, P0.T7 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `ColoringQaScreen` (localizado por auditoria) + registro de rota gated · **Arq✗:** superfície pública, posição definitiva.
- **Entradas:** flag P0.T7; `__DEV__`; Modo Criador/`isInternalToolsEnabled`.
- **Passos:** 1) exigir `__DEV__` **e** Modo Criador/`isInternalToolsEnabled` **e** flag; 2) expor somente `creation`; 3) listar somente as 3 atividades; 4) não definir posição pública; 5) invisível em build pública; 6) ferramentas admin existentes seguem no Dev Client.
- **Gates:** rota só abre com os 3 gates.
- **Evidências:** print device + testes.
- **Parada:** exposição pública / posição definitiva exigida → PARAR.
- **Aceite:** cobre P7.T1–T10.
- **Rollback:** `git revert`.

### P7.T2 — Controles negativos dos gates
- **Objetivo:** provar que a rota **não** abre sem todos os gates.
- **Dep:** P7.T1 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `scripts/smoke.js` · **Arq✗:** —.
- **Entradas:** rota gated P7.T1.
- **Passos:** asserts — cada gate isolado desligado bloqueia; dois ligados + um desligado bloqueia; rota direta sem autorização bloqueia.
- **Gates:** todos os controles negativos verdes.
- **Evidências:** suíte negativa.
- **Parada:** rota abrir com gate faltante → PARAR.
- **Aceite:** cobre P7.T11–T13.
- **Rollback:** remover testes.

---

# P8 — Smoke e testes positivos e negativos

### P8.T1 — Consolidação de smoke (catálogo/registro/Metro/resolvedor/chaves/writer/entitlement/conclusão/flag/QA)
- **Objetivo:** reunir os smokes unitários das camadas do piloto.
- **Dep:** P1–P7 · **Commit:** sim · **Push/merge:** proibido · **⚠ smoke.js serializado.**
- **Arq✔:** `scripts/smoke.js` · **Arq✗:** app runtime.
- **Entradas:** todas as camadas.
- **Passos:** garantir cobertura de: catálogo; registro estático; Metro; resolvedor; chaves; writer; entitlement; conclusão; flag; entrada de QA.
- **Gates:** smoke verde.
- **Evidências:** relatório de contagem.
- **Parada:** qualquer camada sem smoke → PARAR.
- **Aceite:** cobre P8.T1–T10.
- **Rollback:** remover testes.

### P8.T2 — Testes positivos e negativos de comportamento (grátis/premium/falhas/resíduos)
- **Objetivo:** provar grátis 0 pixels, premium salva, falhas de entitlement/escrita sem resíduo.
- **Dep:** P8.T1 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `scripts/smoke.js` · **Arq✗:** —.
- **Entradas:** writer/conclusão.
- **Passos:** testes — grátis; premium; falha da fonte de entitlement; falha de escrita; ausência de resíduos.
- **Gates:** todos verdes.
- **Evidências:** suíte.
- **Parada:** resíduo/escrita indevida → PARAR.
- **Aceite:** cobre P8.T11–T15.
- **Rollback:** remover testes.

### P8.T3 — Regressão do legado + comparação dos 200 hashes + gates finais + revisão independente
- **Objetivo:** provar legado intacto e rodar gates duros + revisão da fronteira de escrita.
- **Dep:** P8.T2 · **Commit:** sim · **Push/merge:** proibido.
- **Arq✔:** `scripts/smoke.js` + relatório · **Arq✗:** —.
- **Entradas:** baseline canônica P0.T3 — `C:\tmp\ptf_colorir60_p0_evidence\baseline_200_legacy_f16491c.tsv`, SHA-256 `a3bc2d10d526ea49e85c92f3a1c61e89038ca3323c56ef8877146e80a87c7a61` (contrato em spec 016 §16.5).
- **Passos:** 1) reconciliar os **200 legados** pelo **algoritmo canônico de P5.T7** (conjunto fechado do TSV — referência normativa, ver nota abaixo); 2) inventariar **separadamente** os **2 assets novos**; 3) `npm run smoke`; 4) `npx expo-doctor`; 5) revisão independente da fronteira de escrita.
- **Gates:** **200/200 legados idênticos** ao conjunto fechado do TSV; inventário dos **2 novos** conforme P5.T7; smoke/doctor verdes; revisão aprovada.
- **Evidências:** saídas + diff de inventário (legados) + inventário separado dos 2 novos + parecer de revisão.
- **Parada:** legado alterado / gate vermelho → PARAR.
- **Aceite:** cobre P8.T16–T20.
- **Rollback:** n/a.

> **Conjunto canônico dos 200 em P8.T3 (mesma regra de P5.T7 — referência normativa, sem redação paralela).**
> 1. **Baseline:** `C:\tmp\ptf_colorir60_p0_evidence\baseline_200_legacy_f16491c.tsv`.
> 2. **SHA-256 exigido:** `a3bc2d10d526ea49e85c92f3a1c61e89038ca3323c56ef8877146e80a87c7a61` — verificar **antes** de usar o arquivo.
> 3. **Conjunto fechado:** validar schema `ptf-coloring-baseline-v1` e o cabeçalho de 8 colunas; ler **exatamente os 200 paths** da coluna `path`; exigir **200 únicos**; usar essa lista como **conjunto fechado dos legados**, **nunca ampliar**; recomputar os campos físicos de cada um dos 200 e comparar **todos** ao TSV; exigir **200/200 idênticos**.
> 4. **`activities/` fica FORA dos 200:** `living_world.png` e `people_and_care.png` **não são legados** e nunca entram nesse conjunto.
> 5. **Inventário separado dos 2 novos:** exigir **exatamente** `activities/living_world.png` e `activities/people_and_care.png`; **exatamente dois** PNGs em `activities/`; **nenhum terceiro arquivo**; `activities/light.png` **ausente** (falha dura).
> 6. **Não ampliar por glob** e **não** usar isoladamente `git ls-files -- 'assets/stories/*/coloring/*.png'`: o `*` do pathspec **atravessa `/`** e, após P5.T4/P5.T6, esse padrão retorna **202** entradas — as 2 adicionais **não são legados**.
> 7. Total conceitual: **200 legados preservados + 2 novos assets físicos** — jamais "202 legados".
> 8. Os **13 passos do algoritmo canônico de P5.T7** valem aqui **integralmente**; esta nota fixa os pontos obrigatórios sem reescrevê-los.
> 9. A existência legítima de `activities/` após P5.T4 **não é falha** (spec 016 §16.6).

---

# P9 — QA no dispositivo

### P9.T1 — Matriz de QA em device (contexto: install/legado/plano/rede/flag/atividade)
- **Objetivo:** definir e executar a matriz cobrindo as 20 dimensões em iPhone físico.
- **Dep:** P8.T3 · **Commit:** não (evidências) · **Push/merge:** proibido.
- **Arq✔:** dossiê de QA (fora do app) · **Arq✗:** código.
- **Entradas:** build Dev Client.
- **Passos (dimensões):** iPhone físico; app recém-instalado; app com desenhos legados; plano grátis; Plano Família; online; offline; flag ligada; flag desligada; cada um dos 3 `activityId`; fechar/reabrir.
- **Gates:** todas as combinações registradas.
- **Evidências:** tabela de resultados.
- **Parada:** qualquer combinação falha → PARAR.
- **Aceite:** cobre P9 dims 1–11.
- **Rollback:** n/a.

### P9.T2 — QA de segurança/persistência (falhas, rota direta, exposição, pixels, arte, estrela, cena)
- **Objetivo:** validar em device os invariantes de segurança e persistência.
- **Dep:** P9.T1 · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** dossiê de QA · **Arq✗:** código.
- **Entradas:** matriz P9.T1.
- **Passos:** falha simulada de escrita; falha/ausência de entitlement; rota direta sem gates; ausência de exposição pública; lineart sempre presente; grátis com 0 pixels persistidos; premium recuperando arte; nenhuma estrela indevida; nenhuma cena narrativa concluída.
- **Gates:** todos os invariantes confirmados.
- **Evidências:** vídeos; screenshots; logs permitidos; leitura de chaves; inventário de blobs; hashes; tabela.
- **Parada:** qualquer invariante violado → PARAR (flag permanece false).
- **Aceite:** cobre P9 dims 12–20 + as 7 evidências.
- **Rollback:** n/a.

---

# P10 — Rollback e fechamento do piloto

### P10.T1 — Rollback por flag e por `git revert`, com preservação do legado
- **Objetivo:** provar que o piloto pode ser neutralizado sem tocar dado legado.
- **Dep:** P9.T2 · **Commit:** não (verificação) · **Push/merge:** proibido.
- **Arq✔:** relatório · **Arq✗:** desenhos legados, 200 linearts.
- **Entradas:** baseline P0.T3, flag.
- **Passos:** 1) flag desligada → app idêntico; 2) rollback por flag; 3) rollback por `git revert`; 4) provar 200 linearts preservados; 5) provar desenhos legados preservados.
- **Gates:** rollback não altera legado.
- **Evidências:** checklist + hashes.
- **Parada:** rollback afetar legado → PARAR.
- **Aceite:** cobre P10.T1–T5.
- **Rollback:** n/a (é a própria prova de rollback).

### P10.T2 — Limpeza autorizada de chaves/blobs Colorir 60 sem tocar legado
- **Objetivo:** definir remoção exclusiva das chaves/blobs Colorir 60 **quando explicitamente autorizada**.
- **Dep:** P10.T1 · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** relatório/procedimento · **Arq✗:** blobs/chaves legados.
- **Entradas:** namespace Colorir 60.
- **Passos:** 1) remoção só das chaves `@ptf_drawing60_*`/`@ptf_coloring60_done_*` sob autorização; 2) limpeza de blobs Colorir 60 sem tocar blobs legados; 3) reconciliação de arquivos.
- **Gates:** legado intocado após limpeza.
- **Evidências:** inventário antes/depois.
- **Parada:** limpeza tocar legado → PARAR.
- **Aceite:** cobre P10.T6–T8.
- **Rollback:** n/a.

### P10.T3 — Relatório final, decisão do fundador e bloqueio de expansão
- **Objetivo:** consolidar o piloto e travar avanço até aprovação humana.
- **Dep:** P10.T2 · **Commit:** não · **Push/merge:** proibido.
- **Arq✔:** relatório final do piloto · **Arq✗:** iniciar outra história/asset.
- **Entradas:** P9/P10.
- **Passos:** 1) relatório final; 2) decisão do fundador sobre aprovação no dispositivo; 3) bloquear expansão enquanto o piloto não for aprovado; 4) registrar o próximo momento de criação de imagens (ver regra abaixo).
- **Gates:** portão humano de fechamento.
- **Evidências:** relatório + decisão registrada.
- **Parada:** expansão iniciar sem aprovação → PARAR.
- **Aceite:** cobre P10.T9–T12.
- **Rollback:** n/a.

## Regra sobre a próxima criação de imagens (registro obrigatório)
1. **Nenhuma imagem nova** será produzida durante a implementação do piloto A Criação.
2. A próxima etapa de criação de imagens só poderá começar depois de: (a) implementação; (b) gates automatizados; (c) QA no dispositivo; (d) **aprovação explícita do fundador**.
3. A próxima história **não** deve ser escolhida silenciosamente.
4. O início da produção artística futura exige **novo portão humano**.
5. **Claude não gera imagens.**
6. A criação visual permanece sob responsabilidade do fundador com o ChatGPT.
7. O ChatGPT deverá avisar explicitamente quando a próxima **`ETAPA DE CRIAÇÃO DE IMAGENS`** for iniciada.

---

# Grafo de dependências e serialização (Etapa 17)

**Cadeia principal (sequencial):**
`P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P9 → P10`.

**Detalhe intra-fase:**
- P0.T1 precede tudo; P0.T3→P0.T4 e P0.T3→P0.T10; P0.T7→P0.T8.
- P1.T1→P1.T2→(P1.T3, P1.T4)→P1.T5.
- P2.T1→P2.T2→P2.T3.
- P3.T1→P3.T2→P3.T3→(P3.T4, P3.T5); P3.T1→P4.T1.
- P4.T1+P3.T3→P4.T2.
- P5 depende de P4 concluído **+ portão de assets**; P5.T2 (gate do script `verify-coloring60-assets.js`, dep P0.T6) precede as cópias; P5.T3→P5.T4; P5.T5→P5.T6; (P5.T2,P5.T3)→P5.T4; (P5.T2,P5.T5)→P5.T6; (P5.T4,P5.T6)→P5.T7.
- P6 depende de P3.T3+P5.T7.
- P7 depende de P2.T3+P0.T7.
- P8 depende de P1–P7; P9 de P8.T3; P10 de P9.T2.

**Podem ocorrer em paralelo (arquivos disjuntos):** P0.T3/T5/T6 (inventários independentes); P3.T4 e P3.T5 (ambos só em `smoke.js` — ver serialização); P5.T3 e P5.T5 (perícias de fontes distintas, sem escrita).

**Serialização obrigatória (mesmo arquivo / risco alto) — proibido paralelismo:**
1. `ColoringScreen.js` — P2.T2, P4.T2 (um de cada vez).
2. **módulo de rotas da `ColoringScreen`** (localizado por auditoria, **sem inventar caminho**) — P2.T2, P7.T1 (edição em série; **P2 antes de P7**; proibido paralelismo no mesmo módulo de navegação).
3. `storageKeys.js`/chaves — P3.T1 (e qualquer toque em chaves).
4. `scripts/smoke.js` — P0.T8, P1.T5, P2.T3, P3.T4, P3.T5, P5.T2, P7.T2, P8.T1, P8.T2, P8.T3 (serializar todos os toques em smoke).
5. **feature flags** — P0.T7, P7.T1.
6. **writer e conclusão** — P3.T1–T3, P4.T1 (serializados).
7. **cópia e registro dos assets** — P5.T4, P5.T6 (assets isolados, um commit por asset).

**Bloqueios:** o **writer** é bloqueado por P3.T1/T2; a **integração dos PNGs** por P4 + portão de assets; o **QA no dispositivo** por P8.T3; o **fechamento** por P9.T2 + portão humano.

---

# Estratégia de commits futuros (Etapa 18)

Commits pequenos, reversíveis, **um bloco lógico = um commit**; **nunca** um único commit com todo o piloto; **não** misturar código e assets; **não** misturar writer e interface pública; **sem push antes de autorização**. Todas as operações de reescrita/histórico obedecem às **Regras de Git durante a execução** abaixo.

| Commit sugerido | Tasks | Arquivos | Gates | Rollback |
|---|---|---|---|---|
| `feat: coloring60 feature flag (off)` | P0.T7 | módulo de flags | smoke | revert |
| `feat: coloring60 catalog + local assets registry` | P1.T1–T5 | `coloring60Catalog.js`, `coloring60LocalAssets.js`, `smoke.js` | smoke/Metro | revert |
| `feat: coloring60 resolver + additive route` | P2.T1–T3 | `coloring60Resolver.js`, `ColoringScreen.js`(rota), rotas, `smoke.js` | regressão legado | revert |
| `feat: coloring60 drawing writer (entitlement gate)` | P3.T1–T5 | `coloring60DrawingStorage.js`, `smoke.js` | negativos + round-trip | revert |
| `feat: coloring60 activity completion (plan-agnostic)` | P4.T1–T2 | `coloring60ActivityService.js`, `ColoringScreen.js`, `smoke.js` | separação | revert |
| `test: add Colorir 60 asset integrity gate` | P5.T2 | `scripts/verify-coloring60-assets.js`, `smoke.js` (**sem PNG**) | script verde + controles | revert |
| `chore: integrate living_world approved art` | P5.T3–T4 | `activities/living_world.png` + registro | hash antes/depois + `--mode=post` **VERMELHO** (fase `LIVING_WORLD`) | remover arquivo |
| `chore: integrate people_and_care approved art` | P5.T5–T6 | `activities/people_and_care.png` + registro | hash antes/depois + `--mode=post` **VERDE** (fase `COMPLETE`) | remover arquivo |
| `feat: coloring60 internal QA entry (3 gates)` | P7.T1–T2 | `ColoringQaScreen`, rotas, `smoke.js` | controles negativos | revert |
| `test: coloring60 suite consolidation` | P8.T1–T3 | `smoke.js` | smoke/doctor | remover testes |

(P0 inventários, P6 provas de recuperação, P9 device e P10 rollback geram **evidências/relatórios**, não necessariamente commits de código.)

---

# Regras de Git durante a execução (invioláveis)

Durante a implementação do piloto, **sem autorização explícita do fundador**, é **proibido**:
1. `git push` (para qualquer remoto/branch).
2. `git merge`.
3. `git commit --amend`.
4. `git rebase` (interativo ou não).
5. `git reset` (`--soft`, `--mixed` ou `--hard`).
6. `git push --force` / `--force-with-lease`.
7. Reescrever, remover ou reordenar commits já revisados (`squash`, `fixup`, `filter-branch`, `cherry-pick` sobre histórico revisado).

**Forma permitida de correção:** avançar com **novo commit** aditivo (nunca reescrever histórico). Qualquer necessidade de reescrita **para** e reporta ao fundador antes de agir.

**Exceção operacional já encerrada (registro de rastreabilidade):** durante a autoria deste `tasks.md` (bloco C60-TASKS1) ocorreu **um único** `git reset --soft HEAD~1` para corrigir a mensagem de um commit **antes** de qualquer revisão/aprovação, retornando o HEAD ao plano aprovado `9c75a3d` e recompondo o commit limpo `1bcda27`. Esse evento:
- foi **local**, restrito à worktree de tasks, e está **encerrado**;
- **não** constitui precedente;
- **não** autoriza resets futuros;
- **não** pode ser repetido durante a implementação do piloto.

---

# Portões humanos

- **Portão 2 (plano):** APROVADO (`9c75a3d`).
- **Portão 3 (tasks/análise):** este arquivo — **aguardando**.
- **Portão de integração de assets:** antes de P5 (governança de assets, `git add` seletivo).
- **Portão de fechamento do piloto:** P10.T3 (decisão do fundador em device).
- **Portão da próxima criação de imagens:** novo portão humano (regra acima).

---

# Analyze — rastreabilidade e consistência (Etapa SDD 6)

**Aceite (plan.md §Etapa 13) → tasks:** 1→P1.T2/T5; 2→P1.T3/P5.T1; 3→P1.T3/P5.T7; 4→P3.T3; 5→P3.T4; 6→P3.T4/P3.T5; 7→P4.T2; 8→P5.T2/P5.T4/P5.T6; 9→P0.T6/P1.T5; 10→P3.T1; 11→P7.T1/T2; 12→(nenhuma resolve pública — garantido em P2.T3/P4.T2/P7.T1); 13→P0.T3/P8.T3; 14→P0.T4; 15→P0.T5; 16→P2.T2/P2.T3; 17→P10.T1/T2. **Gate de integridade dos assets (plan §6.2/§7/§8) → P5.T2** (`verify-coloring60-assets.js`).

**Cobertura das enumerações do bloco:** P0(1–10)→P0.T1–T10; P1(1–10)→P1.T1–T5 (validações folded em asserts); P2(1–10)→P2.T1–T3; P3(1–15)→P3.T1–T5; P4(1–14)→P4.T1–T2; P5→P5.T1–T7 (inclui o gate de integridade P5.T2); P6(1–13)→P6.T1–T2; P7(1–13)→P7.T1–T2; P8(1–20)→P8.T1–T3; P9(1–20 + 7 evid.)→P9.T1–T2; P10(1–12 + regra imagens)→P10.T1–T3.

**Confirmações:** writer com gate interno (P3.T3); Metro por `require()` literal relativo, sem alias presuposto (P1.T2, regra 17); em P1 só `light` resolve (P1.T2); `light` nunca copiado (P1.T3/P5.T1); gate de integridade determinístico e read-only, verde antes das cópias (P5.T2); 2 PNGs só em P5 (P5.T4/P5.T6); hashes completos (P0.T6); 10⊆200 (P0.T4); narrativas distintas (P0.T5); testes negativos cobrem arquivos/blobs/ponteiros/chaves (P3.T4); módulo de rotas serializado P2.T2 antes de P7.T1; entrada interna com 3 gates (P7.T1/T2); QA device completo (P9); rollback definido (P10); Git durante a execução **sem** reset/rebase/amend/squash/merge/push sem autorização; próxima criação de imagens bloqueada até aprovação. **Nenhuma decisão pública em aberto é resolvida.** CONSISTENTE, sem `[NEEDS CLARIFICATION]`.

---

# Paradas obrigatórias (globais — parar e reportar ANTES de editar)

1. Precisar alterar a **lógica** de `accessControl`/`entitlementService` (não apenas consumir) → PARAR.
2. Precisar tocar **formato v3**, **writer legado** (contrato público) ou **`ColoringCanvas`** → PARAR.
3. Precisar transformar `drawingStorage` em **writer genérico por chave arbitrária** → PARAR.
4. Precisar **bump global de schema** sem prova concreta → PARAR.
5. Precisar tocar o **Livrinho** para exibir arte Colorir 60 → PARAR.
6. Chave Colorir 60 **colidir** com chave legada → PARAR.
7. Superfície pública exigir **inventar** posição/nome/desbloqueio/métrica → PARAR.
8. Piloto precisar **consumir pack remoto** → PARAR.
9. Integrar/copiar/editar **PNG** fora de P5 e sem portão de assets → PARAR.
10. `require()` exigir **alias não comprovado** ou caminho incerto → PARAR (regra 17).
