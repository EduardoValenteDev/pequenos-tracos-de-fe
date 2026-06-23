---
description: "Task list — Fundação de Arquitetura e Orçamento de Assets"
---

# Tasks: Fundação de Arquitetura e Orçamento de Assets

**Branch**: `001-asset-architecture-budget` | **Input**: [spec.md](./spec.md) + [plan.md](./plan.md) (+ research/data-model/contracts/quickstart)

> ⚠️ **Estas tarefas são de IMPLEMENTAÇÃO FUTURA.** Nada aqui é executado nesta etapa (Etapa SDD 5). A implementação só ocorre na Etapa SDD 7 (`/speckit.implement`), após o Portão Humano 3 e a Etapa SDD 6 (Analyze). Caminhos `src/...` e `scripts/...` são **alvos a criar**, não arquivos existentes.

**Mapa de histórias (spec):** `US1` = decidir integração por orçamento mensurável (P1) · `US2` = qualidade visual + flood-fill (P2) · `US3` = rastreabilidade + controle "em breve" (P3).

**Legenda:** `[P]` = paralelizável (arquivos distintos, sem dependência pendente). Tags `[US1/US2/US3]` só nas fases de história.

---

## 🚫 Exclusões explícitas desta feature (escopo NÃO implementado)

Estas tarefas **não** existem nesta feature; se entrarem, exigem nova spec/escopo:
- **Sem premium real** (nenhuma venda/download pago habilitado).
- **Sem RevenueCat** nesta implementação — só entra se o escopo mudar para premium pago (aí, antes do download premium).
- **Sem Edge Functions / Worker.**
- **Sem URLs assinadas.**
- **Sem backend complexo.**
- **Sem subir automaticamente** `assets/stories/*` ao Git (permanecem untracked até pipeline de auditoria).
- **Sem restaurar o stash de avatares** (`wip avatars block 2`).
- **Sem migração de áudio** (expo-av ausente; já em expo-audio).

---

## Fase 1 — Setup e auditoria inicial

- [ ] T001 Criar estrutura de pasta do pipeline de assets em `scripts/assets-pipeline/` (README com objetivo e uso).
- [ ] T002 [P] Implementar inventário reproduzível em `scripts/assets-pipeline/inventory.js` (categoriza capas/cenas/colorir/mapas/UI/áudio; separa tracked vs untracked; saída JSON determinística) — atende FR-001.
- [ ] T003 [P] Implementar medição de tamanho em `scripts/assets-pipeline/measure-size.js` (repo, export Metro, bundle; registra "N/A" quando não mensurável) — FR-002.
- [ ] T004 Adicionar scripts npm `assets:inventory` e `assets:measure` em `package.json` (sem novas dependências).
- [ ] T005 [P] Documentar o pipeline obrigatório (auditar→padronizar→otimizar→decidir camada→versionar) em `scripts/assets-pipeline/PIPELINE.md` — base de D9.
- [ ] T005a [P] **(M1 — guard de Git)** Implementar guard verificável em `scripts/assets-pipeline/check-untracked-guard.js` que **falha** se qualquer `assets/stories/*` estiver **staged** (lê `git diff --cached --name-only`). Regras: (a) `assets/stories/*` NÃO podem entrar por `git add` acidental; (b) o guard é integrado ao `npm run smoke` (ou check dedicado rodado no CI/pré-commit); (c) NÃO bloqueia adição **futura aprovada e seletiva** — apresenta motivo e exige **auditoria/aprovação explícita** (ex.: variável/flag de override documentada) — torna a Exclusão verificável (FR-013/D9).
- [ ] T005b **(M2 — padrão canônico de nomes/dir)** Definir e validar o **padrão canônico** por categoria em `scripts/assets-pipeline/check-naming.js` + `scripts/assets-pipeline/NAMING.md` — FR-005. Deve cobrir: (a) divergência atual **`scene/` vs `scenes/`**; (b) **`scene_NN.png` vs `<story>_scene_NN.png`**; (c) padrão esperado para **`coloring/`**; (d) padrão esperado para **cenas ilustradas**; (e) **validação por script/relatório ANTES** de integrar **Rute, José, Ester, Moisés, Samuel e Josias** (sinaliza desvios; não renomeia nesta feature).

## Fase 2 — Contratos / schema do manifesto (Foundational — bloqueia US1)

- [ ] T006 Validar o schema `specs/001-asset-architecture-budget/contracts/pack-manifest.schema.json` contra exemplos válidos/ inválidos em `scripts/assets-pipeline/__fixtures__/manifest/`.
- [ ] T007 Implementar `packManifestService` em `src/services/packManifestService.js` (parse + valida schemaVersion + minAppVersion + soma de bytes; nunca lança — retorna {ok,errors}) — FR-018.
- [ ] T008 [P] Definir o modelo de camadas de conteúdo em `src/data/contentManifest.js` (`starter`/`remote`/`coming_soon` por história) — D1/D2.
- [ ] T009 Adicionar checagens de smoke para o schema/manifestService em `scripts/smoke.js` (carrega schema, valida fixtures) — sem alterar comportamento do app.

## Fase 3 — Inventário e orçamento de assets (US1)

- [ ] T010 [US1] Gerar relatório de orçamento em `scripts/assets-pipeline/budget-report.js` (5 dimensões; teto ~150 MB como meta; folga ≥25% fora do bundle) — FR-003/FR-004, SC-002/SC-003.
- [ ] T011 [P] [US1] Implementar projeção de crescimento (20 + ≥25%) com impacto por categoria em `scripts/assets-pipeline/growth-projection.js` — FR-003.
- [ ] T012 [US1] Produzir registro de rastreabilidade asset↔história↔manifest↔require↔disponibilidade em `scripts/assets-pipeline/traceability.js` — FR-011/SC-007 (US3 também).

## Fase 4 — Pipeline piloto de imagem (US2)

- [ ] T013 [US2] Implementar conversor piloto de cena para WebP lossy em `scripts/assets-pipeline/optimize-scene.js` (entrada/saída fora do app; mede redução) — D7.
- [ ] T014 [P] [US2] Implementar conversor de página de colorir (WebP lossless/PNG otimizado) em `scripts/assets-pipeline/optimize-coloring.js` (preserva contornos) — D7/FR-020.
- [ ] T015 [US2] Implementar validador de proporção 4:5 em `scripts/assets-pipeline/check-ratio.js` (sinaliza fora-do-padrão para aprovação visual; nunca estica/corta) — FR-008/SC-004.

## Fase 5 — Pipeline piloto de pack remoto (US1)

- [ ] T016 [US1] Implementar gerador de manifesto a partir de um diretório de pack em `scripts/assets-pipeline/build-manifest.js` (calcula bytes/sha256/dimensões/ratio; valida no schema) — FR-018/FR-019.
- [ ] T017 [US1] Implementar `packDownloadService` em `src/services/packDownloadService.js` (download resumable p/ `.tmp/`, fallback em falha, sem premium/URL assinada) — D6.
- [ ] T018 [US1] Implementar resolvedor central de mídia em `src/services/contentResolver.js` (starter `require` → pack `file://` → fallback seguro) — D2/FR-006. **(L1 — dependência: requer o contrato de caminho de `packStorageService` (T020) já definido; implementar T018 APÓS T020, ou contra a convenção `documentDirectory/packs/<id>@<version>/` fixada em T020. Não usar caminhos de pack ainda não definidos.)**
- [ ] T019 [P] [US1] Definir 1 pack remoto GRÁTIS de teste (manifesto + arquivos) e documentar publicação em R2 público-não-listado em `scripts/assets-pipeline/PILOT_PACK.md` (sem subir nada automaticamente).

## Fase 6 — Cache / persistência local (US1)

- [ ] T020 [US1] Implementar `packStorageService` em `src/services/packStorageService.js` (instala em `documentDirectory/packs/<id>@<version>/` — PERSISTENTE, não cache volátil; `.tmp/` só p/ download) — D2/FR-017.
- [ ] T021 [P] [US1] Implementar índice local em AsyncStorage `@ptf_packs_v1` (status, versão, bytes, installedAt, lastUsedAt) — data-model CacheEntry.
- [ ] T022 [US1] Implementar limpeza/remoção (LRU por `lastUsedAt` + remoção explícita pelo responsável) em `src/services/packStorageService.js` — D6/FR-017.

## Fase 7 — Integridade por bytes/hash (US1)

- [ ] T023 [US1] Implementar `packIntegrityService` em `src/services/packIntegrityService.js` (sha256 + bytes por arquivo e agregado; usa expo-file-system) — FR-019.
- [ ] T024 [US1] Ligar o gate de integridade ao fluxo: transição `verifying → ready` SOMENTE com todos os hashes/bytes confirmados em `src/services/packDownloadService.js` — SC-010.
- [ ] T025 [P] [US1] Teste de regressão de integridade (arquivo adulterado → `failed`, não `ready`) em `scripts/smoke.js` ou fixture dedicado.

## Fase 8 — UI / fluxo de download sob controle do responsável (US1)

- [ ] T026 [US1] Adicionar entrada de gestão de packs na Área dos Pais (iniciar/remover download; Wi-Fi por padrão; aviso de dados móveis) em `src/screens/ParentAreaScreen.js` — D10/FR-021.
- [ ] T027 [P] [US1] Exibir estado do pack (não baixado/baixando/verificando/pronto/falhou + retry) na UI de gestão — D6.
- [ ] T028 [US1] Garantir que nenhum download inicie sem ação do responsável (sem auto-download em rede móvel) — D10.

## Fase 9 — Áudio offline no pack (sem reintroduzir expo-av) (US1)

- [ ] T029 [US1] Incluir a narração da história DENTRO do pack (manifesto `kind: audio`) e resolvê-la via `contentResolver` quando o pack está `ready` — D8.
- [ ] T030 [US1] Confirmar por verificação automatizada que NENHUM import de `expo-av` é introduzido (checagem em `scripts/smoke.js`: `rg expo-av src` = 0) — D8/exclusões.

## Fase 10 — Validação de flood-fill para colorir (US2)

- [ ] T031 [US2] Implementar harness de teste de flood-fill em `scripts/assets-pipeline/floodfill-check.js` (compara regiões preenchidas antes/depois da conversão; falha = rejeita) — FR-020.
- [ ] T032 [US2] Definir critério de aprovação (contornos fechados, sem vazamento; limiar alinhado ao BFS 210) e documentar em `scripts/assets-pipeline/FLOODFILL.md` — D7.

## Fase 11 — Validação visual / device (Polish)

- [ ] T033 Roteiro de validação em device (offline starter; download/retomada/falha; flood-fill; remoção) seguindo [quickstart.md](./quickstart.md) V1–V8.
- [ ] T034 [P] Captura de print/vídeo das telas afetadas (Área dos Pais — gestão de packs; Livrinho/colorir com conteúdo de pack) — Constituição (validação visual).

## Fase 12 — Testes smoke / expo-doctor (Polish)

- [ ] T035 `npm run smoke` verde após cada bloco (inclui novas checagens de schema/integridade/expo-av).
- [ ] T036 `npx expo-doctor` verde (sem novas dependências não aprovadas; expo-file-system já presente).
- [ ] T037 [P] Atualizar contadores/checagens de smoke conforme novos módulos `src/services/pack*` forem criados.

---

## Dependências e ordem
- **Fase 1 → Fase 2 → Fase 3** são pré-requisitos; **US1** (Fases 5–9) depende do schema (Fase 2) e do orçamento (Fase 3).
- **Guards de Fase 1**: **T005a** (guard de Git de `assets/stories`) e **T005b** (padrão canônico de nomes/dir) são **pré-requisito de governança** para integrar qualquer história nova (Rute/José/Ester/Moisés/Samuel/Josias) — devem existir antes de qualquer versionamento/integração de assets.
- **L1 — ordem**: **T018 (contentResolver) depende de T020 (packStorageService)** — implementar T018 **após** T020 (ou contra a convenção de caminho fixada em T020). Não é dependência circular.
- **US2** (Fases 4, 10) é largamente **independente** de US1 e pode correr **em paralelo** — porém a aceitação de páginas de colorir do MVP exige o flood-fill (T031/T032).
- **US3** (rastreabilidade / "em breve") é coberta por T012 + `contentManifest` (T008) — sem fase própria pesada.
- **Polish** (Fases 11–12) fecha cada incremento.

## Estratégia de entrega (MVP primeiro)
- **MVP**: Fases 1–3 (incluindo os guards **T005a** e o padrão **T005b**) + corte fino de US1 (T016–T024) com **1 pack grátis** + integridade + persistência + gestão na Área dos Pais (T026–T028) + áudio no pack (T029–T030) **+ validação de imagem/flood-fill (T013–T015, T031–T032)**. **(L2)** A **validação de imagem/flood-fill faz parte do incremento MVP**, ainda que US2 rode **em paralelo** com US1 — uma página de colorir convertida só é aceita após passar no flood-fill. **Sem premium, sem RevenueCat, sem URL assinada.**
- **Incremental (pós-MVP)**: robustez (retomada/LRU), mais packs grátis e otimização em escala das demais cenas.
- **Fora desta feature** (próximas specs): premium + RevenueCat + URLs assinadas + Edge/Worker (ver Exclusões).

## Exemplos de paralelização
- Fase 1: T002, T003, T005 em paralelo.
- Fase 4 (US2) inteira em paralelo com Fase 5–7 (US1).
- T021 (índice) em paralelo com T020 (storage) se interfaces forem definidas antes.
