# Spec — Colorir 60: Arquitetura e Reconciliação com o M3

> **Feature:** `014-colorir-60` · **Bloco:** PTF PRODUCT LOCK 01C (+ QA/ratificação 01C-QA) · **Etapa SDD:** 1 (Specify) · **Portão 1: decisões ratificadas pelo fundador em 2026-07-21.**
> **Data:** 2026-07-21 · **Base (commit documental):** `00d1a526efe47054f70d0efecb1098c31a295db8` (01B / Camada de Alma) · pai `3cd7e3f` (01A) · **Worktree:** `docs/product-lock-01c-colorir-60`.
> **Identificador ratificado:** `014` (`012`=loading-performance, `013`=camada-de-alma).
> **Natureza:** **documento de produto/arquitetura**, **somente leitura** sobre código/assets. **Nenhum** código, asset, movimentação/exclusão de arquivo, pack, manifesto, upload R2, build, storage, migração, tela, conclusão, Livro/Cartão, produção de páginas, geração de imagens, commit, push ou merge.
>
> **Precedência:** `docs/PROJECT_SOURCE_OF_TRUTH.md` → constituição → `AGENTS.md`/`CLAUDE.md`; decisões por `docs/DECISIONS.md` (**árbitro**, PL01A) → v4. **Respeita PL01A e a Camada de Alma v1 (013).** Não reabre decisão travada em 01A/01B.
>
> **Nota de numeração:** todas as referências internas `(§N)` apontam para a **numeração deste documento**.

---

## 1. Decisões imutáveis (contrato de entrada)

(1) 20 histórias; (2) 10 cenas narrativas/história; (3) 200 ilustrações narrativas; (4) **ilustrações narrativas separadas do colorir**; (5) **3 páginas de colorir/história**; (6) **60 páginas** no catálogo completo; (7) **1 página criada basta** para a jornada; (8) escolha livre entre as 3; (9) as outras ficam para revisita; (10) criação suficiente = **≥1 traço deliberado + Concluir consciente**; (11) **sem % mínimo** de cobertura; (12) **sem avaliação estética**; (13) **alternativa motora acessível também conta**; (14) **grátis NÃO persiste pixels/arquivo**; (15) grátis **pode** persistir estado de progresso da aventura; (16) Família preserva **rascunho e arte concluída**; (17) **artes antigas não podem ser apagadas por migração**; (18) dados locais existentes **preservados**; (19) **Colorir não substitui Recontar**; (20) Colorir e Recontar obedecem ao **modelo de conclusão em camadas ratificado no 01B** (R1).

---

## 2. Fotografia factual do estado atual (confirmada no HEAD `00d1a52`)

| # | Fato | Evidência |
|---|---|---|
| 1 | **200 páginas de colorir** (PNG) | `find assets/stories/*/coloring/*.png` = **200**; creation/noah/david = 10 cada |
| 2 | **202 require estáticos** (200 páginas; registro `[storyId][sceneId]`) | `coloringImages.js` = 202 `require(` |
| 3 | Convenção de path/nome | `assets/stories/<id>/coloring/scene_NN.png` (NN=01…10) |
| 4 | Relação `sceneId`↔página | **1:1 rígida** — `coloringImages[storyId][sceneId]` |
| 5 | Como a tela resolve | `ColoringScreen` → `useResolvedColoringImage(story, cenaIndex)` → require local **ou** `{uri:file://}` do pack, com fallback local; base64→dataURL no WebView |
| 6 | Progresso marcado | `coloringActivityService`: `@ptf_coloring_done_{storyId}_{sceneId}='true'` (flag, sem imagem), no "Pronto" |
| 7 | Rascunhos | `drawingStorage`: **sem rascunho persistido** (pintura vive só na memória do canvas); salva só no "Pronto" com tinta real |
| 8 | Chaves | `@ptf_drawing_s{storyId}_c{sceneId}` (arte: v1 dataURL / v2 JSON layout / **v3 ponteiro** p/ blob em `drawings/`) · `@ptf_coloring_done_{storyId}_{sceneId}` (flag) |
| 9 | **Arte = camada de PINTURA apenas** | `drawingStorage`: *"A imagem base nunca é armazenada aqui — ela vem de coloringImages.js."* → **v1/v2/v3 dependem do lineart base para exibir** |
| 10 | Galeria/Livro identificam | por **chave por cena** + `hasMeaningfulPaint` (>1000 chars); `getBookPageImageSource({storyId, sceneId, childArt})` |
| 11 | Packs representam colorir | `resolveStoryColoring` → `coloring/scene_NN.png` (kind `coloring`, 10/pack, sha256) |
| 12 | App base × premium | base: `creation`, `noah`; premium: 18 `remote` (ainda bundled pré-2C) |
| 13 | M3 | **23 colorir + 14 ilustradas = 37**, 7 `remote`; M3.1b = piso de versão |

> **Nota (threshold):** `hasMeaningfulPaint > 1000 chars` é heurística técnica **atual**; a chave por cena é escrita **só** no "Pronto" com tinta real. Hoje o `drawingStorage` **não** distingue plano (grátis × Família) — a regra "grátis = 0 pixels" (D-FREE-SEM-SALVAR) é **enforcement futuro**, não presente no storage. Ver §14.

---

## 3. Problema arquitetural

O modelo "**1 página por cena**" (200=10×20) **não deve comandar o produto futuro**: (a) prende o colorir ao índice de cena (`scene_NN`); (b) mistura **identidade de atividade** com **posição narrativa**; (c) chaves de arte/flag usam `sceneId` como identidade → reordenar/curar frágil; (d) força espelhamento de 10 folhas quando **3 curadas bastam** (PL01A-03).

**Oito conceitos DISTINTOS (nunca tratados como uma entidade):** (1) ilustração narrativa; (2) página de colorir (lineart curado); (3) criação da criança; (4) rascunho; (5) arte concluída; (6) registro de conclusão da etapa Criar (flag); (7) entrada da arte no Livro; (8) uso opcional no Cartão.

---

## 4. Opções de arquitetura

- **Opção A — manter `scene_NN`, 3 cenas:** menor mudança, mas **preso à cena**; identidade=posição; Livro/Cartão seguem dependendo de `sceneId`. Perpetua o acoplamento.
- **Opção B — 3 paths fixos, sem registro:** simples, mas título/instrução/versão/estado espalhados; validação frágil; i18n/reordenação difíceis.
- **Opção C — catálogo dedicado de atividades (RATIFICADA):** identidade estável independente da cena; curadoria/reordenação sem quebrar storage; Livro/Cartão por identidade; manifesto por atividade. Viável de forma **aditiva** (evidência: `drawingStorage` já convive com v1/v2/v3; `contentResolver` já tem fallback; `PacksContext` reconcilia sem gravar).

**Ratificada: Opção C** (C2), aditiva e compatível, com **resolvers separados** (C4) — não um shim genérico.

---

## 5. Identidade (ratificada — C1)

1. Identidade lógica = **dois campos separados**: `storyId` + `activityId`.
2. `activityId` é **imutável**.
3. `activityId` usa **ASCII + `snake_case`**.
4. `activityId` é **independente do título traduzido**.
5. A **ordem** é um **campo separado** (`order`).
6. O caractere **`#` NÃO é persistido** em ID, path ou chave.
7. Uma **chave lógica composta** pode ser construída internamente (ex.: `storyId` + separador + `activityId`) **sem** alterar a identidade dos campos.

**A Criação — identificadores conceituais:** `light`, `living_world`, `people_and_care`.

> **Nenhum** identificador, path ou chave usa o caractere `#`. A identidade é sempre o **par** `(storyId, activityId)` — ex.: `(storyId="creation", activityId="light")`.

---

## 6. Catálogo dedicado (ratificado — C2)

Registro conceitual por atividade (sem nomes finais de arquivo/função/tipo):
1. `activityId`. 2. `storyId`. 3. `order`. 4. metadado **traduzível de título**. 5. metadado **traduzível de instrução**. 6. **referência do asset**. 7. **âncora narrativa opcional** (sceneId, só referência). 8. **versão**. 9. **disponibilidade** (base/premium/pendente). 10. **metadados p/ Livro e Cartão**.

Organização: por `storyId` → **3 atividades**. Entrada ausente → estado recuperável (§8).

---

## 7. Paths (ratificado — C3)

- **Assets locais:** `assets/stories/<storyId>/coloring/activities/<activityId>.png`
- **Packs:** `coloring/activities/<activityId>.png`
- **Legado:** `coloring/scene_NN.png`

As **duas estruturas coexistem** durante a transição. **Não mover/renomear arquivos agora.**

---

## 8. Resolvers separados (ratificado — C4)

1. **Resolver novo** por `storyId + activityId` (asset local `activities/<activityId>.png` OU path do pack).
2. **Leitor/adaptador legado** por `storyId + sceneId` (só para exibir arte antiga; read-only).
3. **Nenhuma associação por índice.**
4. **Tabela explícita de reconciliação** apenas quando uma página antiga for **aprovada** como correspondente a uma atividade nova.
5. **Ausência de mapeamento → estado recuperável observável** (nunca outra página).
6. **Nunca mostrar outra página** só porque ocupa a mesma posição.
7. **O fluxo novo não depende de `sceneId`.**

Invariantes: nenhuma tela preta; nenhum fallback para página incorreta; offline; base sempre disponível; **capacidade Colorir 60 só `ready` com as 3 válidas** (§10).

---

## 9. Aplicativo base e packs premium

**Alvo:** Criação 3 + Noé 3 = **6 páginas base**; 18 premium × 3 = **54 remotas**. Total **60**. Redução de peso de colorir no binário; validação por sha256; troca atômica; offline pós-download; piso de versão para packs antigos. **Não construir/publicar packs.**

---

## 10. Manifesto por capacidade (ratificado — C7)

Capacidade **`coloring60`** com:
1. `modelVersion = 2`. 2. **exatamente 3 atividades ativas**. 3. `id`. 4. `path`. 5. `hash`. 6. **versão do asset**. 7. **estado obrigatório**.

- **Prontidão calculada por tipo de mídia/capacidade** (não um `ready` monolítico do pack).
- Uma **falha no Colorir 60 NÃO invalida**: **cenas**, **áudio**, **capa** nem outros conteúdos válidos do mesmo pack.
- **Pack parcialmente migrado NUNCA declara `coloring60` pronta.**
- Manifesto novo (modelVersion 2) distingue-se do antigo (10-cenas) e convive na transição.

**Não altera manifestos neste bloco.**

---

## 11. Packs antigos (ratificado — C8)

1. Pack antigo com **10 páginas continua válido para mídia narrativa** (cenas/áudio/capa).
2. Cliente novo **reconhece a ausência** da capacidade `coloring60`.
3. Colorir 60 **solicita atualização recuperável**.
4. **Nenhuma página antiga exibida como atividade nova sem mapeamento aprovado.**
5. Packs transitórios podem **carregar paths antigos e novos**.
6. Duplicação temporária **retirada só após o corte de compatibilidade**.
7. **A história não é bloqueada inteiramente** por um subconjunto de colorir desatualizado.
8. Pack parcialmente migrado **nunca** declara `coloring60` pronta.

---

## 12. Storage aditivo e preservação de dados

**Chaves atuais:** arte `@ptf_drawing_s{storyId}_c{sceneId}` (v1/v2/v3, ponteiro→`drawings/`); flag `@ptf_coloring_done_{storyId}_{sceneId}`; `coloringComplete` (contrato A0.10) = flag **ou** arte com tinta real.

**Estratégia NÃO destrutiva:** (1) nenhuma chave antiga apagada automaticamente; (2) nenhuma arte perdida; (3) obras antigas continuam acessíveis; (4) o modelo novo **não depende** de renomear arquivos antigos; (5) **migração aditiva** — chaves novas por `activityId` (conceitualmente `@ptf_coloring_art_{storyId}_{activityId}` / `@ptf_coloring_done2_{storyId}_{activityId}`) **convivem** com as antigas; (6) **leitura de legado separada da escrita nova**; (7) grátis **não** passa a persistir pixels; (8) Família preserva novos rascunhos (estado "rascunho", hoje inexistente); (9) exclusão = ação explícita do responsável; (10) falha de migração **não bloqueia** o app.

---

## 13. Dependência do lineart nas obras antigas (gate BLOQUEANTE — C15)

**Achado factual:** `drawingStorage` guarda **apenas a camada de pintura** — *"A imagem base nunca é armazenada aqui — ela vem de coloringImages.js."* Logo, **a arte salva (v1/v2/v3) depende do lineart base** para ser exibida (o Livrinho compõe pintura + contorno).

**Gate obrigatório — provar, POR FORMATO (v1, v2, v3), antes de qualquer remoção de asset:**

| Pergunta | v1 (dataURL) | v2 (JSON layout) | v3 (ponteiro) |
|---|---|---|---|
| A obra salva já contém o resultado visual completo? | **indicação: NÃO (pintura apenas)** — provar | **NÃO** — provar | **NÃO** — provar |
| Depende do lineart original? | **indicação: SIM** | **SIM** | **SIM** |
| Depende do path antigo (`scene_NN` via coloringImages)? | provar | provar | provar |
| Pode ser exibida sem o asset base? | **indicação: NÃO** | **NÃO** | **NÃO** |
| Qual asset precisa permanecer disponível? | o `scene_NN.png` referenciado | idem | idem |

**Regra:** **nenhuma remoção do bundle ou pack** (do asset base de colorir) pode ocorrer **antes** dessa prova por formato. Enquanto houver obra salva referenciando um `scene_NN.png`, **esse asset permanece disponível** (§16). *(A galeria/Ateliê pode ter um preview composto separado — a prova deve cobrir cada caminho.)*

---

## 14. Threshold atual × critério futuro

- **Fato técnico atual:** `hasMeaningfulPaint > 1000 chars` (heurística de "tinta real").
- **Regra futura de produto (R7/013):** **≥1 traço deliberado + ação consciente em Concluir**.

O **threshold atual NÃO é automaticamente o oráculo futuro.** A futura implementação deverá **provar a deliberatividade da ação** (traço intencional + Concluir) **sem** avaliação estética nem percentual de cobertura. O `>1000` pode ser um dos sinais, mas não define, sozinho, "criação suficiente".

---

## 15. Plano gratuito e Plano Família (+ gate bloqueante de rollout — C14)

### Plano gratuito
Abre/colore · **conclui Criar** (flag) · guarda progresso da aventura · **NÃO persiste pixels** · **sem slot bloqueado** no Livro infantil (R4/013) · não perde progresso.

### Plano Família
Preserva **rascunho** · conclui e **salva arte** · mostra no Livro · usa no Cartão (opcional) · exclui localmente · local-first.

### Gate BLOQUEANTE de rollout (C14)
O Colorir 60 **NÃO pode ser habilitado para usuários** enquanto não houver **prova** de que: (1) o grátis **não persiste pixels**; (2) Família **preserva rascunhos e artes**; (3) **ambos** persistem o estado **"Criar concluído"**; (4) **nenhum caminho alternativo** contorna essas regras.

> **Dívida de implementação BLOQUEANTE:** hoje o `drawingStorage` **não distingue plano** (salva pixels para todos ao tocar "Pronto"). Enquanto essa distinção não existir e for provada, o rollout do Colorir 60 fica **bloqueado**.

---

## 16. Política das 200 páginas antigas (ratificada — C5)

**Classificações (por página):** (1) reutilizada como ativa; (2) conceito reaproveitado com **arte recriada**; (3) **somente legado**; (4) **temporária para compatibilidade**; (5) **arquivada** fora do catálogo ativo; (6) **removível futuramente** do bundle/pack.

**Regras obrigatórias:** (1) **nenhum arquivo apagado do histórico**; (2) **nenhuma arte da criança perdida**; (3) **nenhum asset removido do runtime antes de provar que v1/v2/v3 não dependem dele** (§13); (4) classificação **página a página**; (5) **ausência de evidência mantém o asset preservado**.

Critérios: valor narrativo · qualidade visual · adequação 6–8 · facilidade de colorir · representação bíblica · reuso · **existência de obras salvas relacionadas**. **Não classificar visualmente as 200 sem inspeção** (bloco de curadoria).

---

## 17. Artes legadas em "Minhas criações" (ratificado — C6)

As artes antigas aparecem dentro de **"Minhas criações"**, **agrupadas por história**. **A interface infantil NÃO usa:** "Legado", "Antigo", "Obsoleto", "Migrado". O sistema pode **guardar internamente** a origem da obra; a **Área dos Pais** pode mostrar detalhes técnicos **apenas quando necessários** para gestão/exclusão. **Nenhuma seção infantil faz as obras antigas parecerem inferiores.**

---

## 18. Reconciliação com o M3 (ratificada — C10)

1. As **14 ilustrações narrativas continuam no M3** (lost_sheep 3, esther 7, good_samaritan 3, samuel 1) — independentes do colorir.
2. A **produção das 23 páginas de colorir permanece PAUSADA** (joseph 10, esther 5, good_samaritan 5, abraham 2, miraculous_catch 1).
3. **Auditoria e curadoria read-only** das páginas **podem continuar**.
4. **Nenhuma nova página de colorir** antes da seleção das 3 atividades da história.
5. **Nenhum pack reconstruído** por causa do Colorir 60.
6. **Nenhum upload R2.**
7. **Piso de versão** pode ser estudado, mas sua **aplicação ao Colorir 60 depende do manifesto por capacidade** (§10).

**Itens do M3 que prosseguem sem risco:** as **14 ilustradas** + a investigação M3.1b (read-only). As 23 folhas de colorir ficam pausadas.

---

## 19. Seleção das 3 páginas (ratificada — C9, duas etapas)

**Etapa 1 — gates eliminatórios** (a página deve): (1) ser **biblicamente coerente**; (2) **não contradizer o roteiro**; (3) ser **apropriada 6–8**; (4) ser **colorível**; (5) **evitar composição excessivamente complexa**; (6) ser **distinta** das outras escolhas; (7) **sem defeito visual impeditivo**.

**Etapa 2 — critérios comparativos** (avaliar): importância narrativa · valor emocional · clareza visual · diversidade do conjunto · potencial p/ Livro e Cartão · potencial de revisita · necessidade de arte nova.

**A escolha final é humana, registrada e rastreável por história.**

---

## 20. Piloto A Criação (ratificado — C16)

Identificadores: **`light`**, **`living_world`**, **`people_and_care`**. Paths conceituais conforme §7 (`assets/stories/creation/coloring/activities/<activityId>.png`; pack `coloring/activities/<activityId>.png`).

| activityId | Título | Instrução curta | Âncora narrativa (opcional) | Candidato legado (só p/ inspeção) | Arte nova? | Livro | Cartão | Grátis | Família |
|---|---|---|---|---|---|---|---|---|---|
| `light` | "Haja luz" | "Pinte a luz rompendo a escuridão." | cena 2 | `creation/coloring/scene_02.png` (**inspeção pendente**) | reavaliar | entrada | opcional | colore, sem pixels | rascunho+arte |
| `living_world` | "O mundo cheio de vida" | "Pinte a terra, as plantas e os animais." | cenas 4/6/7 | `scene_04|06|07.png` (**inspeção pendente**) | reavaliar/curar | entrada | opcional | idem | idem |
| `people_and_care` | "Na criação de Deus" | "Pinte as pessoas no jardim de Deus." | cena 8 | `scene_08.png` (**inspeção pendente**) | reavaliar | entrada | opcional | idem | idem |

> **Nenhum candidato legado é declarado aprovado visualmente** — exigem inspeção suficiente. Roteiro oficial (Gênesis 1) **intocado**. **Não gerar imagens; não substituir arquivos.**

---

## 21. Contrato para Noé (segundo piloto)

1. **Repetir o método** de A Criação (3 conceitos curados, ids estáveis snake_case, título+instrução, âncora opcional, candidatos legados p/ inspeção). 2. **Validar as 3 escolhas** por coerência bíblica + 6–8 + facilidade. 3. **Evitar repetição de cenas semelhantes** (momentos distintos: arca / animais / arco-íris). 4. **Coerência bíblica** (curadoria humana; sem inventar). 5. A página **`noah` colorir 04** (pendência visual do M3, conteúdo correto) é **candidata** sujeita à mesma inspeção — **não** aprovada automaticamente. **As 3 finais NÃO são selecionadas neste bloco.**

---

## 22. Galeria, Livro e Cartão (identidade)

Localizar uma criação sem depender exclusivamente de `sceneId`: (1) história; (2) `activityId`; (3) estado (rascunho/concluído); (4) plano de acesso; (5) **data local só se realmente necessária** (default: não); (6) asset base usado; (7) relação com entrada do Livro; (8) relação com Cartão; (9) estado legado (obra antiga por `sceneId`, exibida em "Minhas criações"); (10) exclusão explícita. **Minimização (013):** sem analytics, sem id remoto, sem PII; Cartão efêmero até salvar.

---

## 23. Conclusão em camadas (contrato ratificado — R1/013)

C1 = 10 cenas (manual/Escuta) · C2 = ações/rota + **≥1 entre Criar e Recontar** → desbloqueia · C3 = Criar **e** Recontar **e** Guardar → selo dourado.

O Colorir 60 fornece **somente** o estado **"Criar concluído"** (flag por atividade). **NÃO pode:** avaliar estética · exigir % cobertura · exigir salvar pixels · exigir Família · exigir as 3 páginas · confundir rascunho com conclusão. **Colorir não substitui Recontar.**

---

## 24. Estratégia de rollout

Fases (nenhuma apaga dados nem exige migração destrutiva):
1. Registro + **resolvers separados** atrás de flag (no-op comprovado).
2. **Prova do gate do plano gratuito (§15)** — bloqueante: sem ela, não habilitar.
3. Piloto A Criação (3 atividades locais).
4. Validação local e offline.
5. Validação do plano gratuito (sem pixels).
6. Validação do Plano Família (rascunho+arte).
7. **Prova de dependência do lineart (§13)** antes de qualquer remoção de asset.
8. Compatibilidade com artes antigas ("Minhas criações").
9. Noé.
10. Primeiro pack premium (capacidade `coloring60` pronta só com 3 válidas).
11. Migração progressiva das demais (gate por lote).
12. Retirada futura do modelo antigo + remoção de `require` do bundle (só após §13) + reconstrução/publicação de packs **somente após os gates**.

---

## 25. Segurança e rollback

1. **Flag/gate conceitual** por fase. 2. **Rollback sem perda** (novo aditivo; legado intacto). 3. **Compatibilidade** com versão anterior (resolvers separados + leitura legado). 4. **Invalidação de pack incorreto** (piso de versão + `modelVersion`). 5. **Reversão ao catálogo legado** (desliga flag → volta ao `scene_NN`). 6. **Preservação de artes novas.** 7. **Preservação de artes antigas.** 8. **Observabilidade local/dev** (logs de resolução/erro, sem PII/analytics). 9. **Abortar rollout se:** tela preta, fallback para página incorreta, perda de arte, `coloring60` `ready` parcial, ou gate do grátis (§15) não provado. 10. **Estabilizado quando:** 6 páginas base + ≥1 pack premium validados em device, offline ok, grátis/Família provados, legado acessível, §13 provado, zero perda de dados.

---

## 26. Testes e oráculos (matriz futura — não escrever agora)

3 páginas/história · sem associação por índice · resolver local · resolver remoto · pack não instalado · pack parcialmente instalado (não pronto) · **pack antigo 10 páginas** (narrativa válida; `coloring60` ausente) · pack novo 3 · offline · atualização de pack · plano gratuito (sem pixels) · Plano Família (rascunho+arte) · rascunho · arte concluída · **arte legada** (v1/v2/v3, exibível) · **dependência do lineart por formato (§13)** · Livro · Cartão · **Camada 2** · **Camada 3** · exclusão de dados · falha de asset (erro observável) · retomada depois de erro.

---

## 27. Alternativas descartadas

1. Apagar já as 200 — ❌ destrói legado/obras salvas. 2. Renomear todas as chaves de uma vez — ❌ risco de perda; migração é aditiva. 3. `sceneId` como única identidade permanente — ❌ é a amarra a desacoplar. 4. Resolver só por posição no array — ❌ índice frágil. 5. Misturar ilustração narrativa e colorir — ❌ conceitos distintos. 6. Exigir salvar pixels para conclusão — ❌ contra R7/013. 7. 60 páginas no app base — ❌ peso; premium sob demanda. 8. Publicar todos os packs de uma vez — ❌ rollout por lote com gate.

---

## 28. Mapa de impactos (somente leitura — nenhum arquivo "obrigatoriamente substituído")

| Superfície | Responsabilidade atual | Impacto possível | Reaproveitamento | Adaptação futura | Compatibilidade | Risco | Bloco futuro |
|---|---|---|---|---|---|---|---|
| `coloringImages.js` | 202 require por cena | catálogo por `activityId` | parcial | registro aditivo | leitor legado | médio | impl |
| `ColoringScreen` | abre/pinta/conclui por cena | receber `activityId` | alto | id + estados rascunho | legado | médio | impl |
| `useResolvedColoringImage` | resolve por cena | resolver novo por `activityId` | alto | resolver novo | leitor legado | médio | impl |
| `contentResolver.resolveStoryColoring` | `coloring/scene_NN.png` | `coloring/activities/<id>.png` | alto | manifesto capacidade | paths coexistem | médio | impl |
| serviços de packs | valida 10, `ready` monolítico | capacidade `coloring60` (3, per-capability) | alto | `modelVersion` | pack antigo 10p | médio | impl |
| scripts `build/validate` pack | por convenção | por atividade/capacidade | alto | `modelVersion` | manifesto novo | médio | impl |
| manifestos (R2) | 10 por path | 3 por atividade + capacidade | — | evolução conceitual | transição | médio | impl |
| `drawingStorage` | arte por `_c{sceneId}` (pintura apenas) | arte por `activityId` + rascunho Família | alto | chaves novas aditivas | **§13 lineart** | **alto** | impl |
| `coloringActivityService` | flag por `_{sceneId}` | flag por `activityId` | alto | chave nova aditiva | legado | médio | impl |
| `storyJourneyService` | `coloringComplete` por cena | por atividade (aditivo) | núcleo puro | após conclusão (R1) | legado | médio | conclusão |
| Galeria/Livro/Cartão | obra por cena | por `activityId` + "Minhas criações" | alto | seção agrupada | legado | médio | Livro/Cartão |
| assets `coloring/*` (200) | 200 páginas | política §16 (não destrutiva) | seletivo | curadoria 60 | **§13** | **alto** | curadoria |
| M3 (colorir 23 / ilustradas 14) | correções | colorir **pausa** / ilustradas **prosseguem** | seletivo | reavaliar colorir | — | médio | M3/curadoria |

---

## 29. Decisões ratificadas pelo fundador (2026-07-21)

> **C1–C10 DECIDIDOS** — deixam de ser questões abertas.

| ID | Decisão | Motivo | Impacto futuro | Dependência | Bloco responsável |
|---|---|---|---|---|---|
| **C1** identidade | `storyId`+`activityId` separados; `activityId` imutável ASCII snake_case, independente do título; `order` separado; **sem `#`** em id/path/chave | estabilidade + i18n + reordenação | storage, packs, Livro/Cartão | §5/§6/§7 | impl |
| **C2** catálogo | **Opção C** — catálogo dedicado (10 campos §6) | desacoplar da cena | resolver, manifesto, Livro | §6 | impl |
| **C3** paths | local `.../coloring/activities/<activityId>.png`; pack `coloring/activities/<activityId>.png`; legado `coloring/scene_NN.png` coexistem | transição sem mover arquivos | packs, manifesto, bundle | §7 | impl |
| **C4** resolvers | resolver novo (`activityId`) + leitor legado (`sceneId`); sem índice; tabela só com mapeamento aprovado | desacoplar sem quebrar legado | resolver, storage | §8 | impl |
| **C5** 200 páginas | política de classificação página a página; nada apagado do histórico; sem remoção antes da prova §13 | preservar dados/obras | assets, Livro | §13/§16 | curadoria |
| **C6** artes legadas | em "Minhas criações", agrupadas por história; sem "legado/antigo/obsoleto/migrado" na UI infantil | dignidade das obras | Livro/Galeria | §17 | Livro |
| **C7** manifesto | capacidade `coloring60` (`modelVersion=2`, 3 ativas, id/path/hash/versão/estado); prontidão por capacidade; falha não invalida cenas/áudio/capa | packs robustos e parciais seguros | packs, validação | §10 | impl |
| **C8** packs antigos | 10 páginas válidas p/ narrativa; capacidade ausente reconhecida; atualização recuperável; sem página antiga como nova sem mapa; história não bloqueada por colorir desatualizado | não quebrar instalados | packs instalados | §11 | impl |
| **C9** seleção | 2 etapas (gates eliminatórios + critérios comparativos); escolha humana, registrada, rastreável por história | curadoria consistente | produção, Livro/Cartão | §19 | curadoria |
| **C10** M3 | 14 ilustradas prosseguem; 23 colorir pausam; auditoria read-only continua; sem nova página/pack/upload; piso de versão depende do manifesto por capacidade | evitar retrabalho | M3, produção | §18 | M3/curadoria |

**Requisitos de rollout ratificados (adicionais):** **Gate do plano gratuito** (§15/C14, bloqueante — dívida atual: storage não distingue plano) e **Gate de dependência do lineart** (§13/C15, bloqueante — nenhuma remoção de asset antes da prova por formato).

**Novas pendências do fundador identificadas nesta auditoria:** **nenhuma.** (Nada foi inventado nem resolvido silenciosamente; caso surja, será registrado aqui separadamente.)

---

## 30. Fora de escopo

❌ código · ❌ assets · ❌ geração de imagens · ❌ exclusão/movimentação de arquivos · ❌ migração real · ❌ alteração de storage · ❌ alteração de manifests · ❌ construção de packs · ❌ upload R2 · ❌ alteração de telas · ❌ alteração de conclusão · ❌ alteração de Livro/Cartão · ❌ implementação do piloto · ❌ produção das 60 páginas · ❌ commit · ❌ push · ❌ merge.

---

## 31. Critérios de aceite

(1) estado factual comprovado no HEAD (§2); (2) problema arquitetural (§3); (3) 3 opções comparadas (§4); (4) **Opção C ratificada** (§4/§29); (5) **identidade sem `#`** (§5); (6) catálogo dedicado (§6); (7) paths novos+legados (§7); (8) **resolvers separados** (§8); (9) **manifesto por capacidade** (§10); (10) **packs antigos preservando narrativa** (§11); (11) **storage aditivo** (§12); (12) **prova de dependência do lineart** (§13); (13) plano gratuito e Família (§15); (14) **gate bloqueante do plano gratuito** (§15); (15) política das 200 (§16); (16) **artes legadas em "Minhas criações"** (§17); (17) M3 reconciliado (§18); (18) piloto A Criação (§20); (19) contrato Noé (§21); (20) conclusão em camadas (§23); (21) rollout (§24); (22) rollback/segurança (§25); (23) testes futuros (§26); (24) mapa de impactos (§28); (25) **decisões ratificadas** (§29); (26) fora de escopo (§30); (27) **nenhum código/asset alterado** e decisões abertas isoladas — **C1–C10 ratificados, sem questões abertas remanescentes**.
