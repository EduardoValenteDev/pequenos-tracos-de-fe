# Índice de Documentação — Pequenos Traços de Fé

Este índice classifica a documentação do projeto. Em caso de conflito, vale sempre a
**Fonte oficial atual**.

---

## 1. Fonte oficial atual

- **[PROJECT_SOURCE_OF_TRUTH.md](PROJECT_SOURCE_OF_TRUTH.md)** — fonte de verdade
  operacional e estratégica (governança técnica). **Prevalece sobre qualquer outro documento.**
- **[DECISIONS.md](DECISIONS.md)** — **árbitro único** das decisões de produto/lançamento.
  Em conflito entre um documento e este arquivo, **vence o `docs/DECISIONS.md`**.
- **[roadmap/ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md](roadmap/ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md)**
  — **ROADMAP OPERACIONAL VIGENTE (v6.0, desde 2026-08-24, instalado pelo bloco F6.0)**, subordinado
  às decisões. Governa **sequência, fases, escopo e portões** (**F0 à F22**). **Cópia única no
  repositório** — não existe roadmap operacional concorrente. Contém a **ERRATA EDITORIAL 01**
  (separação de `F6.8 · Builds canônicos` e `F6.9 · Campanha física e lacre`). A reconciliação das
  decisões da v6 está em [`DECISIONS.md` §V6](DECISIONS.md).
- **[fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md](fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md)**
  — **matriz canônica única de riscos e pendências** (`P-01` a **`P-176`**), adotada em
  **2026-08-05 (E018)**. Governa **inventário, identidade, status, severidade, fase e
  rastreabilidade** das pendências. Nenhum outro documento replica esta matriz nem mantém tabela
  normativa de riscos. **A `v6` não a superou:** o registro `F6-UX-01`…`F20-STORE-01` da v6 §9 é
  **vista executiva por fase**, e **a baixa de qualquer item se registra no `P-nnn`** — correlação
  código a código em [roadmap/V6_RISK_CROSSWALK_TO_E018.md](roadmap/V6_RISK_CROSSWALK_TO_E018.md)
  e na **§34** da própria matriz.
- **[roadmap/F6_1_BASELINE_CANONICA_E_PROVENIENCIA.md](roadmap/F6_1_BASELINE_CANONICA_E_PROVENIENCIA.md)**
  — artefato do bloco **`F6.1`** (2026-08-24): declara a **linha canônica** após prova de
  convergência, registra a absorção do ícone, o crosswalk de riscos, o inventário de builds e o
  reconhecimento da orientação iOS.
- **[roadmap/F6_2_FUNDACAO_DE_GEOMETRIA_PORTRAIT.md](roadmap/F6_2_FUNDACAO_DE_GEOMETRIA_PORTRAIT.md)**
  — artefato do bloco **`F6.2`** (2026-08-24): prova que **WINDOW VIEWPORT ≠ CONTENT VIEWPORT**,
  registra o mapa causal da geometria, a causa raiz, o contrato de área útil publicado pelo shell,
  o raio de correção por tela, a matriz responsível em retrato e o roteiro de prova física.
  **Prova física pendente.**
- **[roadmap/F6_2R_FRONTEIRA_NAVEGACAO_CONTEUDO.md](roadmap/F6_2R_FRONTEIRA_NAVEGACAO_CONTEUDO.md)**
  — artefato do residual **`F6.2R`** (2026-08-24): registra a **fronteira navegação → conteúdo**
  (`SIDEBAR → GAP → CONTENT VIEWPORT → SCREEN`), o *token* `navContentGap`, o inventário das
  superfícies com trilho, a baixa da residual de Estrelinhas com o intervalo exato, a prova da
  área jogável de *Cadê a Ovelhinha?* e o portão `G-GAP-1`. **Confirmação visual pendente.**
- **[launch/RECONCILIACAO_E1.md](launch/RECONCILIACAO_E1.md)** — reconciliação da governança
  (E1, 2026-07-15): precedência, decisões consolidadas, superadas e pendentes.

**Superados (histórico, não normativo):**
- **[DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md)** (v5)
  — **histórica como sequência operacional desde 2026-08-24**, superada pela **v6.0**; conteúdo
  preservado, com banner no topo. **Não usar como sequência de execução.** Seu conteúdo de produto
  vale **apenas** onde o `docs/DECISIONS.md` o mantém.
- **[/APP_ROADMAP.md](../APP_ROADMAP.md)** — plano de sprints antigo da raiz, **histórico desde
  2026-08-24**; nunca foi reancorado no roadmap de fases e **não** descreve a sequência vigente.
- **[DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md)** (v4)
  — **histórica desde 2026-07-30**, superada pela v5; conteúdo preservado, com banner no topo.
- **[DOCUMENTO_OFICIAL_PROJETO_FINAL.md](DOCUMENTO_OFICIAL_PROJETO_FINAL.md)** (v2.0) — histórico.
- **[PLANO_OFICIAL_BENI_LANCAMENTO.md](PLANO_OFICIAL_BENI_LANCAMENTO.md)** — histórico; o §18 dele
  enumera apenas Fases 0–13 e **não** recebe a numeração ampliada (que vive na v5).
- **`/DECISIONS.md` da raiz** — agora só um aviso SUPERSEDED que aponta para `docs/DECISIONS.md`.
- Desde **2026-07-21 (PTF PRODUCT LOCK 01A)**, os dois documentos-mestre da **raiz**
  **[`/PRODUCT_BLUEPRINT.md`](../PRODUCT_BLUEPRINT.md)** e
  **[`/ACCESS_AND_MONETIZATION_RULES.md`](../ACCESS_AND_MONETIZATION_RULES.md)** (banner SUPERSEDED
  no topo; **não** orientam decisões — ver §3).

**Nenhum destes tem autoridade normativa**; em qualquer conflito, vale a **Fonte oficial atual**
acima, com `docs/DECISIONS.md` como árbitro de produto.

**Precedência:** governança técnica (`PROJECT_SOURCE_OF_TRUTH` → constitution → AGENTS → CLAUDE)
acima das decisões de produto (`docs/DECISIONS.md` **árbitro** das decisões individuais → **v6.0**
(roadmap operacional: sequência, fases, escopo e portões) → Direção de Arte v1.1 →
docs narrativos/bíblicos vigentes → históricos: **v5 como sequência**, v4, v2.0, plano antigo). O **inventário de
pendências** corre num eixo próprio e não concorre com nenhum dos anteriores: ele vive na **matriz
09**, e os demais documentos apenas citam códigos `P`.

**Fase atual (atualizada em 2026-08-24 · F6.0):** **Fase 6 — Shell, splash e sistema visual,
EM EXECUÇÃO desde 2026-08-07**, no subbloco **F6.0 concluído → F6.1**. `worktree`
`C:	mpptf_fase6_shell_splash_wt` · `branch` `feat/fase6-shell-splash`. Ver
[`PROJECT_SOURCE_OF_TRUTH.md`](PROJECT_SOURCE_OF_TRUTH.md) §1.1 e o
[`ROADMAP v6.0`](roadmap/ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md).
*(Correção declarada, não silenciosa: este campo dizia **"Fase 3 — reconciliação completa (somente
leitura)"**, atualizado em 2026-08-05 · E018, e ficou desatualizado quando a Fase 6 entrou em
execução em 2026-08-07. O texto anterior não foi apagado — está descrito aqui. Antes disso, dizia
"Fase 2.5, branch `integrate/colorir-with-loading`, baseline `aeda9c2`". O bloco documental
**Fase 3H (E009 a E018)** permanece **ENCERRADO** e o commit executável `015c438` permanece o
carimbo daquele momento.)*

**Guias de feature vigentes do Brincar/Criar Livre:** [BRINCAR_HUB_GUIDE.md](BRINCAR_HUB_GUIDE.md),
[ATELIER_GUIDE.md](ATELIER_GUIDE.md) (Seção 0 = Criar Livre atual; seções antigas = histórico).

---

## 2. Documentos auxiliares técnicos

Guias e checklists ainda úteis (referência operacional). Não definem estratégia; se
houver conflito estratégico, valida-se contra a Fonte de Verdade.

**Build / release / loja / legal**
- **[BUILD_PROVENANCE_CONTRACT.md](BUILD_PROVENANCE_CONTRACT.md)** — contrato que define o que
  precisa ser verdade para um binário contar como **evidência** (criado em `F6.1`, consumido em
  `F6.8`; risco `P-170`)
- **[BUILD_REGISTRY.md](BUILD_REGISTRY.md)** — registro histórico de **origem** dos builds e do
  binário instalado em cada aparelho. Não substitui [BUILD_SIZE_LOG.md](BUILD_SIZE_LOG.md), que
  registra **peso**
- [EAS_BUILD_GUIDE.md](EAS_BUILD_GUIDE.md)
- [STORE_RELEASE_READINESS_CHECKLIST.md](STORE_RELEASE_READINESS_CHECKLIST.md)
- [PRODUCTION_FLAGS_CHECKLIST.md](PRODUCTION_FLAGS_CHECKLIST.md)
- [LEGAL_PUBLICATION_GUIDE.md](LEGAL_PUBLICATION_GUIDE.md) · pasta [legal/](legal/)
- pasta [biblical-review/](biblical-review/) — governança bíblica

**Assets / mídia / performance**
- [ASSET_PIPELINE_GUIDE.md](ASSET_PIPELINE_GUIDE.md)
- [AUDIO_PIPELINE_GUIDE.md](AUDIO_PIPELINE_GUIDE.md) · [AUDIO_GUIDE.md](AUDIO_GUIDE.md)
- [BENI_GUIDE_AUDIO_PLAN.md](BENI_GUIDE_AUDIO_PLAN.md)
- [COLORING_ASSET_GUIDE.md](COLORING_ASSET_GUIDE.md) · [COLORING_IMAGE_QA_CHECKLIST.md](COLORING_IMAGE_QA_CHECKLIST.md)
- [IMAGE_COMPRESSION_STRATEGY.md](IMAGE_COMPRESSION_STRATEGY.md) · [MEDIA_BUDGET_GUIDE.md](MEDIA_BUDGET_GUIDE.md) · [MEDIA_PLACEHOLDER_GUIDE.md](MEDIA_PLACEHOLDER_GUIDE.md)
- [PERFORMANCE_ACTION_PLAN.md](PERFORMANCE_ACTION_PLAN.md)
- [PNGQUANT_WINDOWS_SETUP.md](PNGQUANT_WINDOWS_SETUP.md)
- [NARRATION_AUDIO_FILE_MAP.md](NARRATION_AUDIO_FILE_MAP.md) · [NARRATION_EXPORT.md](NARRATION_EXPORT.md) · `NARRATION_EXPORT.csv` · pastas `NARRATOR_PACKAGE*`
- [EXPECTED_ASSETS_MANIFEST.md](EXPECTED_ASSETS_MANIFEST.md) · [STORY_IMAGE_BRIEF_EXPORT.md](STORY_IMAGE_BRIEF_EXPORT.md)
- [FIRST_AUDIO_PILOT_CHECKLIST.md](FIRST_AUDIO_PILOT_CHECKLIST.md)

**Guias de feature / UX (referência de implementação)**
- [ADVENTURES_GUIDE.md](ADVENTURES_GUIDE.md) · [STORYBOOK_GUIDE.md](STORYBOOK_GUIDE.md) · [ATELIER_GUIDE.md](ATELIER_GUIDE.md) · [HOME_LUMI_STARS_GUIDE.md](HOME_LUMI_STARS_GUIDE.md)
- [PROGRESS_GUIDE.md](PROGRESS_GUIDE.md) · [REWARDS_GUIDE.md](REWARDS_GUIDE.md) · [ACHIEVEMENT_CELEBRATION_GUIDE.md](ACHIEVEMENT_CELEBRATION_GUIDE.md)
- [PARENT_AREA_GUIDE.md](PARENT_AREA_GUIDE.md) · [UX_POLISH_GUIDE.md](UX_POLISH_GUIDE.md)

> Nota: nomes com "LUMI" são legados (o mascote oficial é **Beni**). O conteúdo
> técnico do guia pode seguir válido; o nome, não.

---

## 3. Documentos históricos

Relatórios, auditorias e planos que podem conter **decisões superadas**. Mantidos
como histórico.

**Para cada item desta seção: Histórico — validar contra
[PROJECT_SOURCE_OF_TRUTH.md](PROJECT_SOURCE_OF_TRUTH.md) antes de usar.**

**Documentos-mestre de produto SUPERADOS (raiz) — 2026-07-21 (PTF PRODUCT LOCK 01A)**
- [`/PRODUCT_BLUEPRINT.md`](../PRODUCT_BLUEPRINT.md) — **SUPERSEDED.** Contém estratégia obsoleta
  (mascote "Lumi", faixa 3–8, "3 artes grátis"). Autoridade transferida para `docs/DECISIONS.md` +
  v4. Mantido só para consulta histórica.
- [`/ACCESS_AND_MONETIZATION_RULES.md`](../ACCESS_AND_MONETIZATION_RULES.md) — **SUPERSEDED.** Planos
  vitalício/avulso, "3 artes" e "tudo no bundle" **não** valem; monetização vigente = **E1-MONETIZACAO-V1**
  + **PL01A-15** em `docs/DECISIONS.md`. Mantido só para consulta histórica.

**Auditorias amplas (podem conter estratégia superada)**
- [APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md](APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md)
- [BUILD_PRODUCTION_AUDIT.md](BUILD_PRODUCTION_AUDIT.md) · [ASSET_SIZE_AUDIT.md](ASSET_SIZE_AUDIT.md) · [DEPENDENCY_AUDIT.md](DEPENDENCY_AUDIT.md)
- [ACCESSIBILITY_CHILD_UX_AUDIT.md](ACCESSIBILITY_CHILD_UX_AUDIT.md) · [ERROR_STATE_AUDIT.md](ERROR_STATE_AUDIT.md) · [DRAWING_STORAGE_AUDIT.md](DRAWING_STORAGE_AUDIT.md)
- [PERFORMANCE_MOBILE_AUDIT.md](PERFORMANCE_MOBILE_AUDIT.md) · [SECRETS_AUDIT.md](SECRETS_AUDIT.md) · [LEGACY_FILES_AUDIT.md](LEGACY_FILES_AUDIT.md)

**Planos pontuais já executados/superados**
- [ASSET_COMPRESSION_REAL_PLAN.md](ASSET_COMPRESSION_REAL_PLAN.md) · [ASSET_COMPRESSION_TEST_BEFORE.md](ASSET_COMPRESSION_TEST_BEFORE.md) · [ASSET_COMPRESSION_TEST_AFTER.md](ASSET_COMPRESSION_TEST_AFTER.md)
- [LEGACY_ASSET_CLEANUP_PLAN.md](LEGACY_ASSET_CLEANUP_PLAN.md) · [BUILD_SIZE_LOG.md](BUILD_SIZE_LOG.md)

**Relatórios de sprint (histórico de execução)**
- `SPRINT_17_PRODUCTION_FOUNDATION_REPORT.md`
- Família `SPRINT_18_*` (1/2/3/4 — fundação de produção e pipeline de assets):
  `SPRINT_18_1_*`, `SPRINT_18_2_*`, `SPRINT_18_3_*`, `SPRINT_18_4_*`,
  `SPRINT_18_RELEASE_ASSET_PIPELINE_REPORT.md`

> Estes documentos descrevem o estado em datas passadas (ex.: contagens de smoke
> antigas). Use-os para contexto, nunca como decisão atual.
