# Auditoria read-only — persistência do Colorir 60 e sistema de conclusão

> **Feature:** `019-c60-persistence-all-plans` · **Artefato:** registro de achados (Etapa SDD 1–3)
> **Data:** 2026-08-03 · **Base auditada:** `1e2f8dd33ba6a222745e8de898a6b63b2e426da6`
> **Build de referência:** `3b4dea54-2194-491c-8ddb-0c6bf85ad049` (perfil `c60-pilot`, iOS interno)
> **Natureza:** **somente leitura.** Nenhum arquivo de código, teste ou asset foi alterado para produzir este documento.
> **Aprovação:** auditoria aprovada pelo fundador em 2026-08-03, junto com a ordem de execução do bloco **D1**.

---

## 0. Como ler esta matriz

- **Severidade** — `ALTA` bloqueia a nova política ou a validação física · `MÉDIA` degrada a experiência ou o dado · `BAIXA` é dívida declarada · `INFO` é constatação de estado.
- **Fase responsável** — fase do Roteiro Mestre ([`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](../../docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md)) que responde pelo item.
- **Spec 019?** — `SIM` entra no escopo desta spec, com o bloco indicado · `NÃO` fica **registrado e não corrigido nesta branch**.

> **Regra explícita do fundador:** *"Os problemas globais de conclusão devem ser registrados, mas não
> corrigidos nesta branch."* Os itens **I-16 a I-20** existem para **não serem esquecidos**, não para
> serem consertados aqui.

---

## 1. Matriz de inconsistências

### Grupo A — Persistência do Colorir com o Beni

| ID | Sintoma | Evidência | Sev. | Fase | Spec 019? |
|---|---|---|---|---|---|
| **I-01** | A criança do plano Grátis pinta, conclui, é celebrada — e **nenhum byte é gravado**. | `src/services/coloring60DrawingStorage.js:336-340` — `if (plan !== FAMILY_PLAN && !isDevWriteAuthorized()) return COLORING60_SAVE_RESULT.NOT_PERSISTED_FREE;` **antes** de qualquer I/O (antes da chave, da leitura do estado anterior e de `writeSlot`). | **ALTA** | 2.5 | **SIM — S1** |
| **I-02** | A autoridade de escrita decide por **plano**, não por **acessibilidade da história**. | Mesma linha 336; `FAMILY_PLAN = 'premium'` (`:80`). É o **único** portão de plano no caminho de escrita — não há segundo ponto de decisão. | **ALTA** | 2.5 | **SIM — S1** |
| **I-03** | O `scripts/smoke.js` **defende ativamente** a regra revogada; enquanto ele existir assim, a correção é reprovada pelo próprio gate. | 26 ocorrências do desfecho em `scripts/smoke.js` (16 `NOT_PERSISTED_FREE` + 10 `not_persisted_free`), incluindo `C60-P4.T2 [E]: GRÁTIS NÃO persiste pixels (not_persisted_free) com ZERO I/O` (`:37525`) e a tabela de 6 casos em `:36583-36585`. | **ALTA** | 2.5 | **SIM — S1** |
| **I-04** | O **caminho de escrita do C60 nunca rodou em dispositivo físico** — é provado apenas pelo smoke. | Nenhuma chave `EXPO_PUBLIC_REVENUECAT_*` declarada no `.env` nem em nenhum perfil do `eas.json`; `__DEV__` é `false` no perfil `c60-pilot`. Logo `getCurrentPlan()` resolve deterministicamente para `'free'` e o ramo premium era **inalcançável** no build `3b4dea54`. | **ALTA** | 2.5 | **SIM — S1 + §14** |
| **I-05** | A copy de não-permanência **passa a mentir** sob a nova política. | `src/components/coloring60/Coloring60SlotStateMark.js:43` — `note: 'A pintura não fica guardada depois de sair.'` (o título `'Parte concluída!'` da linha 42 **permanece**). Consumida por `Coloring60ArtPreviewScreen.js:281,290` e `Coloring60CollectionScreen.js:198`. | MÉDIA | 2.5 | **SIM — S2** |
| **I-06** | A semântica **documentada** de `NOT_PERSISTED` está amarrada a "decisão de plano" — e o produtor do estado muda. | `src/services/coloring60State.js:35,73,102,156` — *"NÃO gravado POR DECISÃO DE PLANO (Grátis não salva pixels)"*. O **valor** (`'notPersisted'`, `:48,82`) e o contrato **não mudam**: muda o produtor. | MÉDIA | 2.5 | **SIM — S2** |
| **I-07** | A coleção **nunca exibiu `ART` real** em produção — só `NOT_PERSISTED` e `EMPTY`. | Consequência direta de I-01 + I-04: sem escrita, `resolveSlotKind` nunca chega ao ramo `ART` (`coloring60State.js:200`). | MÉDIA | 2.5 | **SIM — S2** |
| **I-08** | **"Apagar progresso" apaga as pinturas do Colorir 60**, incluindo os arquivos físicos — o oposto da Decisão A. | `src/services/progressResetService.js:110` chama `resetCreationColoringJourney()`; o comentário `:103-108` declara que ela apaga *"conclusão, memória de 'já concluiu', grande conclusão vista, **pixels, ARQUIVOS físicos**, convite e caches"*. Acionado por `ParentAreaScreen.js:399`. | **ALTA** | 2.5 | **SIM — S4** |
| **I-09** | **Não existe** a ação parental separada "Apagar criações salvas". | `ParentAreaScreen.js` oferece apenas *"Apagar progresso"* (`:855`) e *"Apagar todos os dados locais"* (`:861`). Não há terceira ação, nem distinção entre pinturas do Colorir e criações do Criar Livre. | MÉDIA | 2.5 | **SIM — S4** |
| **I-10** | **Não há coleta de órfãos** em `ptf_blobs/drawings60`: um blob cujo ponteiro sumiu permanece no disco indefinidamente. | Ausência de qualquer varredura de diretório em `coloring60DrawingStorage.js`; o *rollback* remove apenas a geração recém-escrita (`:306`). | MÉDIA | 2.5 | **SIM — S3** |
| **I-11** | **Nenhum orçamento de armazenamento** está declarado ou verificado no código. | Sem constante de quota, sem soma de bytes, sem teto em `coloring60DrawingStorage.js`. O teto de **150 MB / 60 slots** existe hoje **só** como decisão (`D-C60-PERSISTENCIA-TODOS-PLANOS` §6). | BAIXA | 2.5 | **SIM — S3** (declaração; a implementação de quota **não** entra no D1) |
| **I-12** | O ponteiro v3 **não guarda a dimensão do canvas** — não há como reconciliar uma obra pintada em um viewport e reaberta em outro. | `coloring60DrawingStorage.js:241` — `const ptr = { v: POINTER_VERSION, fmt, uri: written.uri, mime };`. Nenhum campo de largura/altura. | MÉDIA (latente) | 2.5 / 3 | **NÃO** — registrado |
| **I-13** | O **downgrade Família → Grátis** nunca foi exercitado; hoje o comportamento é indefinido na prática. | Consequência de I-04 (o ramo premium nunca executou). Regras novas em `D-C60-PERSISTENCIA-TODOS-PLANOS` §3. | MÉDIA | 2.5 | **SIM — §14 cenário 13** |

### Grupo B — Mesma classe de defeito, fora do alcance da Decisão A

| ID | Sintoma | Evidência | Sev. | Fase | Spec 019? |
|---|---|---|---|---|---|
| **I-14** | O **Monte a Cena** grava a conclusão **somente se `premium`** — mesma classe de defeito de I-01, em outra experiência. | `src/screens/MonteACenaTableGameScreen.js:142-146` — `if (premium) { saveCompletion(...) }` dentro de `onComplete`. | MÉDIA | 3 | **NÃO** — registrado |
| **I-15** | **Colorir legado** e **Ateliê**: caminhos de robustez não revisados nesta auditoria (integridade de blob, ponteiro órfão, falha de escrita). | `src/services/drawingStorage.js` (`clearAllSavedDrawings`, `:246`) e o pipeline do Ateliê permanecem com contrato próprio, não alinhado ao do C60. | BAIXA | 3 | **NÃO** — registrado |

### Grupo C — Sistema global de conclusão (Decisões B e C) — registrar, **não** corrigir

| ID | Sintoma | Evidência | Sev. | Fase | Spec 019? |
|---|---|---|---|---|---|
| **I-16** | **Dois fechamentos de história coexistem**, sem casca única. | `src/screens/CongratsScreen.js` e `src/screens/PostStoryHubScreen.js` são telas distintas com fechamentos próprios. | MÉDIA | 4 | **NÃO** |
| **I-17** | **Bônus de estrelas divergente** entre atividades, sem política única declarada. | `src/screens/QuizScreen.js:22` — `const STAR_BONUS = 2;` · `src/screens/ReflectionScreen.js:16` — `const STAR_BONUS = 1;`. Duas constantes locais, nenhuma fonte comum. | MÉDIA | 4 | **NÃO** |
| **I-18** | **Cada experiência encerra com navegação própria** — não existe política de retorno. | Palavrinhas: `navigation.navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })` (`:891-894`) · Quiz: `goBack()` / `navigate('Home')` (`:53-54,126,197`) · C60: `planC60Exit` (`src/services/coloring60Navigation.js:78`). Só o C60 tem planejador explícito. | MÉDIA | 4 | **NÃO** |
| **I-19** | **Não existe modelo de conteúdo de conclusão**: os textos de fecho são fixos, tela a tela. | Copy embutida em cada tela de encerramento; nenhuma estrutura de dados de conclusão nas histórias. | MÉDIA | 4 | **NÃO** |
| **I-20** | **O contrato técnico das Decisões B e C não pode ser congelado agora** — o congelamento herdaria as divergências I-16 a I-19. | Síntese de I-16, I-17, I-18 e I-19. Congelamento previsto para o **Product Lock da Fase 4**. | INFO | 4 | **NÃO** |

---

## 2. Consolidação

| Corte | Contagem |
|---|---|
| Achados registrados | **20** (I-01 … I-20) |
| Severidade **ALTA** | **4** (I-01, I-02, I-03, I-04) |
| Severidade **MÉDIA** | **11** |
| Severidade **BAIXA** / **INFO** | **5** |
| **Pertencem à Spec 019** | **10** (I-01…I-11 e I-13, menos I-12) |
| **Registrados e não corrigidos nesta branch** | **10** (I-12, I-14, I-15, I-16, I-17, I-18, I-19, I-20 + os desdobramentos de Fase 3 e 4) |

**Distribuição por bloco da Spec 019:** **S1** → I-01, I-02, I-03, I-04 · **S2** → I-05, I-06, I-07 · **S3** → I-10, I-11 · **S4** → I-08, I-09 · **§14 (validação física)** → I-04, I-13.

---

## 3. Duas conclusões que orientam a spec

**Primeira — a correção é cirúrgica.** O não salvamento no Grátis não está espalhado: é **um `if`**, em **um arquivo**, colocado **antes de qualquer I/O**. Não há segundo portão de plano no caminho de escrita. Trocar o critério de *plano* para *acessibilidade* é uma mudança pontual — o que é grande é o **raio de validação**, não o diff.

**Segunda — o risco não está no diff, está no que nunca rodou.** Por causa de I-04, a Spec 019 **liga em produção, para praticamente todos os usuários, um caminho de escrita que jamais executou em um aparelho real**. *Double buffer*, promoção de ponteiro, verificação pós-escrita, *rollback*, hidratação, edição e sobrescrita são hoje provados **apenas** por `scripts/smoke.js`.

Por isso a validação física da Spec 019 é **própria e obrigatória**, e **nenhuma parte dela é herdada** do build `3b4dea54`.

---

## 4. O que esta auditoria **não** cobriu

1. Qualquer execução em dispositivo físico (auditoria **read-only**, sem build).
2. Revisão de assets, manifestos de áudio, catálogo ou paywall (**áreas protegidas**).
3. Desempenho e memória do canvas sob uso real.
4. Comportamento com entitlement Família **real** — inacessível sem chave RevenueCat declarada (I-04).
5. Revisão dos caminhos de robustez do colorir legado e do Ateliê (I-15).

---

## 5. Rastreabilidade

| Destino | Registro |
|---|---|
| Árbitro de produto | `D-C60-PERSISTENCIA-TODOS-PLANOS`, `D-CONCLUSAO-GLOBAL-SISTEMA`, `D-ENCERRAMENTO-GLOBAL-ATIVIDADES` e `D-CONCLUSAO-ESTADO-ATUAL` em [`docs/DECISIONS.md`](../../docs/DECISIONS.md) |
| Roteiro Mestre | Fase 2.5 de [`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](../../docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) (entrega 2 e critério de saída revisados) |
| Spec | [`spec-c60-persistence-all-plans.md`](spec-c60-persistence-all-plans.md) — §1.1 (causa), §1.2 (risco), §11 (riscos), §14 (validação física) |
