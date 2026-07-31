# Spec — Colorir 60: Gates de Rollout (Dependência do Lineart · Enforcement Grátis × Família)

> **Feature:** `015-colorir-60-rollout-gates` · **Bloco:** PTF PRODUCT LOCK 01D (+ QA/ratificação 01D-QA) · **Etapa SDD:** 1 (Specify) · **Portão 1: decisões D1–D6 ratificadas pelo fundador em 2026-07-21.**
> **Data:** 2026-07-21 · **Base (commit documental):** `dab57ed0dbaab5d45a290fc999020f39cb43761a` (01C) · cadeia `3cd7e3f`→`00d1a52`→`dab57ed` · **Worktree:** `docs/product-lock-01d-rollout-gates`.
> **Identificador ratificado:** `015` (`012`=loading, `013`=camada-de-alma, `014`=colorir-60).
> **Natureza:** documento **técnico, read-only**. **Nenhum** código, asset, storage, entitlement, migração, movimentação/exclusão de arquivo, pack, manifesto, imagem, prova de runtime, build, commit, push ou merge.
>
> **Precedência:** SoT → constituição → `AGENTS.md`/`CLAUDE.md`; decisões por `docs/DECISIONS.md` (PL01A). Respeita 013/014. **Não reabre decisão de 01A/01B/01C.**
>
> **Nota de numeração:** referências `(§N)` apontam para a numeração **deste** documento.
>
> **Objetivo:** provar e **ratificar** os dois gates BLOQUEANTES do Colorir 60 (014 §13/§15): **A) dependência do lineart** nas obras salvas; **B) enforcement real Grátis × Família**.

---

## 1. Fotografia factual (HEAD `dab57ed`, leitura direta)

| Fato | Evidência |
|---|---|
| Arte salva por cena | `@ptf_drawing_s{storyId}_c{sceneId}`: **v1** (dataURL), **v2** (JSON `{W,H,imgX,imgY,imgW,imgH,data}`), **v3** (ponteiro→blob em `ptf_blobs/drawings/`) |
| **Arte = camada de PINTURA apenas** | `drawingStorage`: *"A imagem base nunca é armazenada aqui — ela vem de coloringImages.js"*; `ColoringCanvas.exportPaint` exporta `paintD` |
| Lineart (base) | `coloringImages[storyId][sceneId]` → `assets/stories/<id>/coloring/scene_NN.png` (ou pack `file://`) |
| Flag de conclusão | `@ptf_coloring_done_{storyId}_{sceneId}='true'` (`coloringActivityService`, sem imagem) |
| **Único escritor de pixels** | `drawingStorage.saveDrawingState` — só em `ColoringScreen` (handleProximo→`exportPaint`→save), ao tocar **"Pronto"** |
| **Autosave** | **NÃO existe** (nenhuma escrita em background/unmount/AppState) |
| Escritor de arte do **Ateliê livre** (paralelo) | `atelierStorage.saveArt` (AtelierCanvasScreen) — sistema **separado** |
| Plano/entitlement | `accessControl.getCurrentPlan()`=`entitlementService.getEntitlementPlan()` (**síncrono, fail-closed→`free`**; `needs_revalidation`→free); `isPremiumUser()`=premium **ou** `isCreatorQaModeEnabled()` |
| Modo Criador | `creatorQaMode`: só em `__DEV__`/`EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE`; **nunca em produção**; override de permissão, não grava plano/compra |
| Limite de salvar (Ateliê) | `accessControl.getFreeAtelierSaveLimit()=0` (decisão) **≠** `atelierStorage.ATELIER_FREE_SAVE_LIMIT` (UI "X de N", 3) — **inconsistência/dívida** |

---

## 2. OBJETIVO A — Dependência do lineart (trace de composição)

1. Livrinho: `storyBookPagesService.buildLivrinhoPages`/`StoryBookScreen.loadDrawingsMap` → `getSavedDrawing(storyId, cena.id)` = **payload de pintura** (v3 resolvido p/ v1/v2).
2. `resolveStoryBookPageImage` (modo `child`): `parseDrawingPayload(raw)` → `{ uri: paint, W, H, imgX… }` (**só pintura**).
3. `baseImage = getColoringImage(storyId, cena.id)` = **o lineart** (`scene_NN.png`) — ou `file://` do pack quando `ready` e `cena.id===sceneNumber`.
4. `makeChildArtVisual(…, baseImage)`: **`if (!baseImage) return null;`** → *"sem contorno disponível → não mostra cor sozinha"*; v2 → `paintWithLineart` (alinhado por `imgX/Y/W/H`); v1 → `paintWithLineartFull`.
5. `childVisual` null → **fallback "Você ainda não pintou esta cena"** — **a arte NÃO é exibida**.
6. **Reabertura no Colorir:** canvas monta com `imageSource`=lineart; `loadPaint` aplica a pintura por cima → **também depende do lineart**.

**CONCLUSÃO (provada por código):** a arte salva (v1/v2/v3) é **pintura sem fundo**; Livrinho e reabertura **compõem pintura + lineart**; **sem o lineart (`getColoringImage[storyId][sceneId]`), a arte é descartada** (fallback), nunca renderizada sozinha. Depende do **asset base** e do **path/`sceneId`**.

> **Galeria:** a arte de **colorir de história NÃO aparece na galeria do Ateliê** (`atelierStorage`) — só no **Livrinho**. A "Minhas artes" é o Ateliê livre (sistema separado; pode guardar preview composto — a prova por formato cobre cada caminho).

---

## 3. Matriz v1 · v2 · v3

| Coluna | v1 (dataURL) | v2 (JSON layout) | v3 (ponteiro→blob) |
|---|---|---|---|
| Payload | `data:…;base64,…` (pintura) | `{v:2,W,H,imgX…,data:paint}` | `{v:3,fmt,uri:file://,…layout}`→v1/v2 |
| Pintura completa? | **NÃO** (transparente onde não pintou) | **NÃO** | **NÃO** |
| Possui lineart? | **NÃO** | **NÃO** | **NÃO** |
| Depende do asset original? | **SIM** (`makeChildArtVisual` null sem baseImage) | **SIM** | **SIM** |
| Depende do mesmo path (`sceneId`)? | **SIM** (`getColoringImage[storyId][sceneId]`) | **SIM** | **SIM** |
| Depende do mesmo conteúdo no path? | **SIM** (contorno certo) | **SIM** (layout presume o mesmo lineart) — **PROVA DE RUNTIME NECESSÁRIA** | **SIM** — idem |
| Mostrável offline **sem** lineart? | **NÃO** (fallback) | **NÃO** | **NÃO** |
| Reabrível p/ edição? | SIM com lineart | SIM (layout) | SIM (resolve v1/v2) |
| Usável no Livro? | SIM **com** lineart | idem | idem |
| Usável no Cartão? | **PROVA DE RUNTIME NECESSÁRIA** (compor c/ lineart) | idem | idem |
| Preservação segura | **manter `scene_NN.png`** enquanto houver obra | idem | idem (+ blob em `ptf_blobs/`) |
| Evidência | `StoryBookScreen.makeChildArtVisual`; `drawingStorage`+`exportPaint` | idem (`hasLayout`) | `resolvePointer`/`fileBlobStore` |
| Incerteza | resultado exato com asset **substituído** | alinhamento com dimensão natural diferente | leitura de blob após troca de container |

> **PROVA DE RUNTIME NECESSÁRIA** = o código não basta; exige device (§16). **Nada inventado.**

---

## 4. Cenários de risco do lineart (com estado honesto — D4)

| # | Cenário | Resultado esperado (alvo D4) | Provável no código ATUAL | Risco | Prova | Mitigação |
|---|---|---|---|---|---|---|
| 1 | Asset removido do **bundle** | arte preservada **ou** estado honesto recuperável | **arte some** (fallback "não pintou") | **alto** | runtime | não remover enquanto houver obra (§5/§6) |
| 2 | Asset removido do **pack** | idem | fallback local se bundled; senão some | **alto** | runtime | preservar base |
| 3 | Asset **substituído no mesmo path** | contorno certo ou estado honesto | **contorno errado/desalinhado** | **alto** | runtime v1/v2/v3 | congelar conteúdo do path legado (D1) |
| 4 | Pack antigo apagado após novo | narrativa ok; colorir cai no base | fallback base | médio | runtime | preservar base do colorir legado |
| 5 | Obra **v1** com asset ausente | **estado honesto + tentar de novo** (D4) | fallback "não pintou" — **perda silenciosa** | **alto** | runtime | §5/§6 + D4 |
| 6 | Obra **v2** com asset ausente | idem | idem | **alto** | runtime | §5/§6 + D4 |
| 7 | Obra **v3** com asset ausente | idem (resolve pintura, falta lineart) | idem | **alto** | runtime | §5/§6 + D4 |
| 8 | Arte legada após migração p/ Colorir 60 | preservada por `sceneId` | depende do `scene_NN.png` resolvível | **alto** | runtime | leitor legado (014 §8) |
| 9 | Arte legada no Livro | com contorno ou estado honesto | exibida se lineart existe | médio | runtime | §5/§6 |
| 10 | Arte legada no Cartão | composta | **PROVA DE RUNTIME** | médio | runtime | definir composição do Cartão |
| 11 | Rollback p/ versão anterior | arte intacta | intacta (chaves/blobs não apagados) | baixo | runtime | migração aditiva |
| 12 | Exclusão explícita pelo responsável | arte removida | `clearDrawingState`/`deleteBlob` idempotente | baixo | — | preservar até ação explícita |

---

## 5. Preservação do lineart — decisão ratificada (D1)

1. Os linearts legados `scene_NN.png` são **dependências das obras já salvas** (§2).
2. **Não** podem ser apagados, **sobrescritos por conteúdo visual diferente**, nem removidos do runtime **enquanto alguma obra puder depender deles**.
3. **Substituir o conteúdo no mesmo path também é quebra de compatibilidade** (o contorno da obra muda).
4. O **leitor legado** continua resolvendo por **`storyId + sceneId`**.
5. Remoção futura exige uma **representação autossuficiente da obra**: (a) imagem final composta; (b) snapshot imutável do lineart original; (c) outra estratégia aprovada pelos **oráculos de runtime**.
6. Até existir representação autossuficiente **validada**, os linearts **permanecem disponíveis**.
7. **Ausência de evidência = preservar.**
8. **O app NÃO possui conhecimento global** sobre todas as obras locais nos aparelhos → a remoção **não pode depender só de verificar o aparelho de desenvolvimento**. (Sem backend, é impossível provar que nenhum usuário tem uma obra dependente; logo, o default é preservar indefinidamente ou fornecer representação autossuficiente.)

Afeta: **matriz v1/v2/v3** (§3), **cenários de risco** (§4), **gate de remoção** (§6), **rollback** (§17), **mapa de impactos** (§19).

---

## 6. Gate de remoção segura de assets (oráculo mínimo — D1)

Antes de remover QUALQUER página antiga do runtime, provar: (1) por formato **v1/v2/v3**; (2) **Galeria** (quando aplicável); (3) **Livro**; (4) reabertura no **Colorir**; (5) **offline**; (6) **pack antigo**; (7) **pack novo**; (8) após **substituição** no mesmo path; (9) **rollback**; (10) **zero perda visual**; (11) **zero associação a página errada**; (12) **preservação do asset** sob dependência; (13) **representação autossuficiente validada** OU preservação indefinida (D1.5/D1.8, pois não há conhecimento global das obras nos aparelhos). **Nenhum asset removido neste bloco.**

---

## 7. OBJETIVO B — Call graph de persistência

**Escritores de PIXELS:** `drawingStorage.saveDrawingState` ← **`ColoringScreen`** (no "Pronto"; **SEM checagem de plano**) · `atelierStorage.saveArt` ← `AtelierCanvasScreen` (**gate só de UI**).
**Flag "Criar concluído":** `markStoryColoringActivityDone` ← `ColoringScreen` (**plano-agnóstico, correto**).
**Migração/exclusão/leitura:** `migrateDrawingsToFiles` (boot), `clearDrawingState`/`clearAllSavedDrawings` (ColoringScreen/reset), `getSavedDrawing`/`hasSavedDrawing` (Livro, Narration, StoryDetail, achievement).
**Plano conhecido:** `accessControl.getCurrentPlan()`/`isPremiumUser()` (síncrono, fail-closed→free). **NÃO consultado** dentro dos escritores.
**Gate DEVE ficar** no/abaixo da escrita de pixels (serviço); **UI é secundária** (chamada direta contornaria). **Modo Criador** = simulação de entitlement só em ambiente autorizado. **Sem autosave** → único ponto a gatear (colorir) = `saveDrawingState`.

---

## 8. Matriz de enforcement (por ação)

| Ação | Grátis | Família | Criador | Desconhecido | Sem entitlement | Offline | Atual | Alvo | Gate técnico | Bypass |
|---|---|---|---|---|---|---|---|---|---|---|
| Abrir Colorir | sim | sim | sim | sim | sim | sim | livre | livre | nenhum | — |
| Pintar | sim | sim | sim | sim | sim | sim | livre | livre | nenhum | — |
| Concluir (flag) | sim | sim | sim | sim | sim | sim | grava flag | **grava (ambos)** | nenhum | baixo |
| **Persistir pixels** | **NÃO** | **sim** | simula Família | **NÃO** | **NÃO** | último válido/fail-closed | **grava p/ todos** | **só Família** | **fail-closed na fronteira de escrita** | **ALTO hoje** |
| Persistir rascunho | **NÃO** | sim | simula | **NÃO** | **NÃO** | idem | inexistente | só Família | fronteira de escrita | alto |
| Reabrir rascunho | n/a | sim | simula | n/a | n/a | sim | inexistente | só Família | leitura gated | médio |
| Mostrar no Livro | oficial/fallback | arte+lineart | simula | oficial/fallback | oficial/fallback | sim | render por pintura | idem + D4 | leitura+lineart | médio |
| Mostrar na Galeria (Ateliê) | UI 0≠3 | ilimitado | simula | — | — | sim | **UI-only** | serviço fail-closed | **serviço** | alto |
| Usar no Cartão | não | opcional | simula | não | não | sim | conceito | só com arte salva | leitura gated | médio |
| Excluir arte | sim | sim | sim | sim | sim | sim | clear+deleteBlob | preservar até ação | — | baixo |
| Migrar arte antiga | preserva | preserva | preserva | preserva | preserva | preserva | aditiva | **sem novo salvamento** | migração read/adiciona | médio |

---

## 9. Gate de entitlement na fronteira de escrita — decisão ratificada (D2)

1. O gate obrigatório fica na **fronteira de escrita de pixels e rascunhos**.
2. O **serviço de baixo nível rejeita qualquer persistência nova** sem **autorização positiva e válida do Plano Família**.
3. A **UI é apenas camada secundária**.
4. **Nenhum chamador contorna** o gate.
5. Migrações **preservam obras antigas, mas não concedem novos direitos de salvamento**.
6. Modo Criador **simula autorização só em ambiente permitido**.
7. A **flag "Criar concluído" permanece plano-agnóstica**.
8. A capacidade técnica é expressa como **"pode persistir pixels"**, **sem acoplar** toda a arquitetura ao nome comercial do plano.

> Nome final de função/API **não** é escolhido aqui. Afeta call graph (§7), enforcement (§8), gate mínimo (§15), mapa de impactos (§19).

---

## 10. Regra fail-closed (persistência de pixels)

| Estado do entitlement | Persistir pixels/rascunho? | Flag "Criar concluído"? |
|---|---|---|
| Carregando (`loaded:false`) | **NÃO** | sim |
| Ausente | **NÃO** | sim |
| Corrompido | **NÃO** | sim |
| Indeterminado / `needs_revalidation` | **NÃO** | sim |
| Offline sem cache válido | **NÃO** (ver D3) | sim |
| Em restauração | **NÃO** até confirmação positiva | sim |
| Simulado por dev (Criador) | só em ambiente autorizado | sim |

**Regra:** **só autorização POSITIVA e válida do Plano Família** salva pixels/rascunho. A **flag** salva nos dois planos (é progresso).

---

## 11. Política offline — decisão ratificada (D3)

1. Família salva offline **só com entitlement local válido e não expirado**.
2. Validade segue **`expiresAt`** (ou contrato oficial equivalente).
3. Entitlement **ausente/expirado/corrompido/indeterminado/carregando → NÃO salva pixels**.
4. **Não criar prazo de tolerância específico do Colorir 60.**
5. A criança **continua podendo pintar, concluir e salvar a flag**.
6. **Restauração só libera pixels após confirmação positiva.**
7. **Offline sem cache válido = fail-closed** para pixels/rascunhos.

---

## 12. Estado sem lineart — decisão ratificada (D4)

**Comportamento ATUAL:** com payload salvo mas lineart ausente, o Livrinho cai no fallback **"Você ainda não pintou"** → **perda visual silenciosa** (a obra existe mas some).

**ALVO ratificado:**
1. A obra **não desaparece silenciosamente**.
2. O app **não mostra "você ainda não pintou"** quando **existe payload salvo**.
3. A UI infantil exibe **estado recuperável, não técnico**: **"Não conseguimos abrir esta criação agora."**
4. Há **ação de tentar novamente**.
5. **Metadados e payload permanecem preservados.**
6. **Nenhuma associação substituída automaticamente.**
7. Área dos Pais / ferramentas dev podem mostrar **diagnóstico técnico** quando necessário.
8. **Nunca recompor com outro lineart** por posição, semelhança ou aproximação.

---

## 13. Threshold atual × traço deliberado — decisão ratificada (D5)

**Contrato futuro:** uma criação **só conta** quando há **(1) pelo menos uma mutação visual efetiva provocada pela criança** **e (2) confirmação consciente em Concluir**.

- **Conta como mutação:** pincelada que altera pixels · preenchimento aplicado com sucesso · **alternativa motora acessível** que modifica visualmente a criação.
- **NÃO conta:** abrir a tela · toque sem alteração visual · movimento cancelado · carregar rascunho sem nova ação · **tamanho serializado isoladamente**.

**Registro:** `hasMeaningfulPaint > 1000` permanece **oráculo técnico legado**, **NÃO** é o contrato futuro. **Sem** percentual mínimo, avaliação estética, número mínimo de cores ou de traços. A implementação futura mede **mutação visual efetiva + Concluir**, sem julgamento estético.

---

## 14. Mudança de plano durante a sessão — decisão ratificada (D6)

1. A autorização é **reavaliada em cada tentativa de persistência**.
2. O plano ao **abrir a tela não garante** o direito de salvar depois.
3. Se o entitlement se tornar **inválido antes de Concluir**: (a) a experiência **pode concluir**; (b) a **flag persiste**; (c) os **pixels NÃO persistem**.
4. Se o entitlement **positivo for confirmado antes da escrita**, a arte **pode salvar**.
5. **Rascunho salvo durante autorização válida permanece** após downgrade.
6. **Downgrade impede novas gravações/atualizações**, mas **não apaga** obras anteriores.
7. **Exclusão continua ação explícita** do responsável.
8. Pintura **em memória pode continuar visível na sessão**, mas **não persiste** sem autorização válida.

---

## 15. Gate mínimo de rollout do plano (bloqueante)

(1) grátis colore; (2) grátis conclui Criar; (3) grátis salva **só a flag**; (4) grátis **não** salva pixels; (5) grátis **não** salva rascunho; (6) Família salva rascunho; (7) Família salva arte; (8) Família mostra no Livro; (9) Família mostra na Galeria; (10) Cartão só com arte salva; (11) desconhecido **não** salva pixels; (12) offline respeita último válido/fail-closed (D3); (13) Criador **só simula** em ambiente autorizado; (14) **nenhum serviço de baixo nível permite bypass** (D2); (15) migração preserva sem conceder novos salvamentos.

> **Dívida BLOQUEANTE atual:** `saveDrawingState`/`atelierStorage.saveArt` **não distinguem plano**; gate só de UI; Ateliê **0≠3**. Rollout bloqueado até o gate viver na fronteira de escrita (fail-closed) e ser provado.

---

## 16. Testes futuros (oráculos; não escrever agora)

Grátis: 1 mutação+Concluir (flag sim/pixels não) · várias (pixels não) · sair sem concluir (nada). Família: rascunho · concluir · offline. Entitlement: carregando · inválido. Criador on/off. Mudança de plano na atividade (D6). Migração v1/v2/v3. Livro/Galeria/reabertura **com lineart ausente → estado honesto (D4)**, nunca sumiço. Asset **substituído no mesmo path**. Pack antigo removido · atualizado · **rollback**.

---

## 17. Classificação final dos gates

- **Curadoria visual:** pode **começar** sem implementação — limitada a **inspeção e decisão documental**.
- **Planejamento de implementação:** pode **começar**.
- **Implementação com QUALQUER escrita persistente:** **nasce com o gate de entitlement na fronteira de escrita** (D2).
- **Piloto interno em device:** exige (1) gate fail-closed; (2) flag separada de pixels; (3) nenhum bypass; (4) Modo Criador isolado; (5) **linearts legados preservados** (D1).
- **Rollout para usuários:** exige **aprovação integral do gate Grátis × Família**.
- **Remoção de assets ou reconstrução de packs:** exige **todos os oráculos de runtime do lineart, zero perda visual e preservação v1/v2/v3** (D1/§6).

---

## 18. Relação com a curadoria de A Criação (delimitação)

**PODE:** (1) inspecionar candidatos (`scene_02/04/06/07/08.png`); (2) gates eliminatórios (014 §19); (3) comparar; (4) selecionar 3 (`light`/`living_world`/`people_and_care`); (5) marcar reutilizar/recriar/nova arte. **NÃO pode:** remover assets · renomear paths · alterar storage · publicar packs · declarar rollout pronto. **Este bloco não inicia a curadoria.**

---

## 19. Mapa de impactos futuros (read-only; nenhum arquivo "obrigatoriamente substituído")

| Arquivo/serviço | Responsabilidade atual | Achado | Mudança futura provável | Gate | Risco | Compat | Bloco |
|---|---|---|---|---|---|---|---|
| `drawingStorage` | arte por `_c{sceneId}`, pintura-apenas | único writer sem plano | chaves por `activityId` + **gate fail-closed na escrita** (D2) | A+B | **alto** | aditiva | impl |
| `coloringActivityService` | flag por `_{sceneId}` | plano-agnóstico (ok) | flag por `activityId`, segue agnóstica | — | médio | aditiva | impl |
| `storageKeys` | `drawing(storyId,sceneId)` | chave por cena | chave por atividade | A | baixo | aditiva | impl |
| `fileBlobStore` | blobs em `ptf_blobs/` | recompose por container | inalterado; **preservar blob** (D1) | A | baixo | — | impl |
| `ColoringScreen` | salva no "Pronto" | sem gate | gate fail-closed + reavaliação (D6) | B | alto | — | impl |
| `ColoringCanvas`/WebView | exporta `paintD` | pintura-apenas | medir **mutação efetiva** (D5) | A/B | médio | — | impl |
| entitlement (`accessControl`/`entitlementService`/`Source`/`Policy`) | plano síncrono fail-closed | não consultado no save | expor **"pode persistir pixels"** (D2), offline por `expiresAt` (D3) | B | médio | — | impl |
| `StoryBookScreen`/`storyBookPagesService` | compõe pintura+lineart | **null sem baseImage** | por `activityId` + **estado honesto** (D4) | A | alto | leitor legado | Livro |
| Galeria (`atelierStorage`) | UI-gate 0≠3 | inconsistência | gate no serviço (D2) | B | alto | — | acesso |
| Cartão (013) | conceito | depende de composição | prova de composição | A | médio | — | Cartão |
| `storageMigrationService` | move v1/v2→v3 | aditiva | **não conceder salvamento** (D2/D6) | B | médio | aditiva | impl |
| packs/`contentResolver` | `coloring/scene_NN` | base ainda no bundle | capacidade `coloring60`; **preservar base** (D1) | A | médio | transição | impl |
| assets legados (200) | 1/cena | obras dependem deles | **preservar indefinidamente ou repr. autossuficiente** (D1) | A | **alto** | legado | curadoria |
| `creatorQaMode` | override em dev/flag | vira premium | **simulação** no gate (D2) | B | médio | — | impl |
| `ParentAreaScreen` | reset/exclusão | `clearAll`/reset | gestão de arte + diagnóstico (D4) + explicação salvar | B | baixo | — | Livro/acesso |

---

## 20. Decisões ratificadas pelo fundador (2026-07-21)

> **D1–D6 DECIDIDOS** — deixam de ser questões abertas.

| ID | Decisão | Motivo | Impacto futuro | Dependência | Bloco responsável |
|---|---|---|---|---|---|
| **D1** preservação do lineart | linearts legados são dependência; não apagar/sobrescrever/remover enquanto houver obra; substituir no mesmo path = quebra; leitor legado por `storyId+sceneId`; remoção só com representação autossuficiente validada; **sem conhecimento global → preservar** | evitar perda visual silenciosa das obras nos aparelhos | trava remoção/pack | oráculos de runtime | impl/curadoria |
| **D2** gate na fronteira de escrita | serviço rejeita persistência sem autorização positiva do Família; UI secundária; sem bypass; migração não concede salvamento; Criador só simula; flag agnóstica; capacidade = "pode persistir pixels" | enforcement real, não só UI | trava piloto/usuários | entitlement | impl |
| **D3** política offline | Família salva offline só com `expiresAt` válido; sem tolerância própria; ausente/expirado/etc → não salva; pintar/concluir/flag seguem | proteção de receita offline sem virar vitalício | offline do salvar | entitlement | impl |
| **D4** estado sem lineart | obra não some; não mostrar "não pintou" com payload salvo; estado recuperável "Não conseguimos abrir esta criação agora." + tentar de novo; preservar payload; nunca recompor por posição/semelhança | confiança e não-perda | UX do Livro/Colorir | D1 | Livro |
| **D5** traço deliberado | conta = ≥1 mutação visual efetiva + Concluir; não conta abrir/toque-sem-mudança/cancelado/carregar-rascunho/tamanho; `>1000` = legado, não contrato; sem %/estética/min cores/min traços | conclusão justa sem julgar estética | conclusão C2/C3 | §13 | impl/conclusão |
| **D6** mudança de plano na sessão | reavaliar a cada tentativa; plano ao abrir não garante salvar; inválido antes do Concluir → conclui+flag, sem pixels; positivo antes da escrita → salva; rascunho válido persiste após downgrade; downgrade não apaga; exclusão explícita; memória visível mas não persistida | fechar bypass por downgrade | enforcement | D2 | impl |

**Novas pendências do fundador identificadas nesta auditoria:** **nenhuma.** (Nada inventado nem resolvido silenciosamente; nova pendência real seria registrada aqui separadamente.)

---

## 21. Fora de escopo

❌ código · ❌ assets · ❌ migração real · ❌ storage · ❌ entitlement · ❌ telas · ❌ packs · ❌ manifestos · ❌ curadoria visual final · ❌ geração de imagens · ❌ **provas de runtime** · ❌ implementação do Colorir 60 · ❌ commit · ❌ push · ❌ merge.

---

## 22. Critérios de aceite

(1) fotografia factual (§1); (2) dependência do lineart **comprovada** (§2) ou marcada `PROVA DE RUNTIME NECESSÁRIA` (§3); (3) matriz v1/v2/v3 (§3); (4) cenários de risco (§4); (5) gate de remoção (§6); (6) call graph (§7); (7) matriz de enforcement (§8); (8) fail-closed (§10); (9) política offline (§11); (10) gate mínimo de rollout (§15); (11) threshold × contrato futuro (§13); (12) mudança de plano na sessão (§14); (13) tratamento sem lineart (§12); (14) testes futuros (§16); (15) classificação dos gates (§17); (16) relação com a curadoria (§18); (17) mapa de impactos (§19); (18) **D1–D6 ratificados** (§5/§9/§11/§12/§13/§14/§20); (19) fora de escopo (§21); (20) critérios de aceite (esta seção); (21) **nenhuma questão aberta não registrada** (§20 — nenhuma nova); (22) **nenhum código/asset alterado**.
