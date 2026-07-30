# Índice de Documentação — Pequenos Traços de Fé

Este índice classifica a documentação do projeto. Em caso de conflito, vale sempre a
**Fonte oficial atual**.

---

## 1. Fonte oficial atual

- **[PROJECT_SOURCE_OF_TRUTH.md](PROJECT_SOURCE_OF_TRUTH.md)** — fonte de verdade
  operacional e estratégica (governança técnica). **Prevalece sobre qualquer outro documento.**
- **[DECISIONS.md](DECISIONS.md)** — **árbitro único** das decisões de produto/lançamento.
  Em conflito entre um documento e este arquivo, **vence o `docs/DECISIONS.md`**.
- **[DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md)** —
  **linha de lançamento VIGENTE (v5, 2026-07-30)**, subordinada às decisões. Contém o **roadmap
  integral da Fase 0 à Fase 22**, o baseline técnico carimbado e a **fase atual (2.5)**.
- **[launch/RECONCILIACAO_E1.md](launch/RECONCILIACAO_E1.md)** — reconciliação da governança
  (E1, 2026-07-15): precedência, decisões consolidadas, superadas e pendentes.

**Superados (histórico, não normativo):**
- **[DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md)** (v4)
  — **histórica desde 2026-07-30**, superada pela v5; conteúdo preservado, com banner no topo.
- **[DOCUMENTO_OFICIAL_PROJETO_FINAL.md](DOCUMENTO_OFICIAL_PROJETO_FINAL.md)** (v2.0) — histórico.
- **[PLANO_OFICIAL_BENI_LANCAMENTO.md](PLANO_OFICIAL_BENI_LANCAMENTO.md)** — histórico; o §18 dele
  enumera apenas Fases 0–13 e **não** recebe a numeração ampliada (que vive na v5).
- **`/DECISIONS.md` da raiz** — agora só um aviso SUPERSEDED que aponta para `docs/DECISIONS.md`.

**Precedência:** governança técnica (`PROJECT_SOURCE_OF_TRUTH` → constitution → AGENTS → CLAUDE)
acima das decisões de produto (`docs/DECISIONS.md` **árbitro** → **v5** → Direção de Arte v1.1 →
docs narrativos/bíblicos vigentes → históricos: v4, v2.0, plano antigo).

**Fase atual:** **Fase 2.5 — integração do Colorir com o Beni sobre a fundação** (branch
`integrate/colorir-with-loading`, baseline `aeda9c2`). Ver
[`v5`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) §3 e o registro `D-C60-INTEGRACAO-PRODUTO` em
[`DECISIONS.md`](DECISIONS.md).

**Guias de feature vigentes do Brincar/Criar Livre:** [BRINCAR_HUB_GUIDE.md](BRINCAR_HUB_GUIDE.md),
[ATELIER_GUIDE.md](ATELIER_GUIDE.md) (Seção 0 = Criar Livre atual; seções antigas = histórico).

---

## 2. Documentos auxiliares técnicos

Guias e checklists ainda úteis (referência operacional). Não definem estratégia; se
houver conflito estratégico, valida-se contra a Fonte de Verdade.

**Build / release / loja / legal**
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
