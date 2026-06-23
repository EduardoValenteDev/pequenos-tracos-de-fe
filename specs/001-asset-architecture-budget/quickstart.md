# Quickstart — Validação da Fundação de Arquitetura de Assets

> Guia de validação (WHAT/como provar), não implementação. Cenários derivam de spec.md (FR/SC) e do plan.md. Os comandos de código serão criados nas Tasks; aqui ficam os **critérios observáveis**.

## Pré-requisitos
- Branch `001-asset-architecture-budget`; spec aprovada (Portão 1).
- Device físico (Android baixo custo + iOS) para validação visual/offline.
- `npm run smoke` e `npx expo-doctor` verdes como portão mínimo.

## Cenários de aceitação (mapeados a SC)

### V1 — Inventário reproduzível (SC-001)
- Rodar o inventário (script de auditoria) **duas vezes** → saída **idêntica**, categorizada (capas/cenas/colorir/mapas/UI/áudio), separando tracked/untracked.

### V2 — Orçamento e teto (SC-002/SC-003)
- Relatório de orçamento define **5 dimensões** com **download/instalação ≤ ~150 MB** e a projeção **20 + ≥25%** com folga **fora** do bundle inicial.
- Medir tamanho do export/bundle e comparar ao teto; sinalizar estouro.

### V3 — Starter offline (FR-015/SC-005)
- Instalar app, **desligar rede**, abrir **A Criação** e **Noé** → cenas, colorir e narração funcionam 100% offline.

### V4 — Pack remoto: download íntegro (FR-016/017/019, SC-009/SC-010)
- Com 1 pack remoto de teste em R2: iniciar download (pela Área dos Pais, Wi-Fi) →
  - estado evolui `downloading → verifying → ready`;
  - **interromper a rede no meio** → estado **não** corrompe; ao voltar, **retoma** e conclui;
  - adulterar 1 byte (teste) → **hash falha** → pack **não** vira `ready` (fica `failed` + retry);
  - após `ready`, **desligar rede** → conteúdo abre offline;
  - **remover** pelo responsável → volta a `not_downloaded`, arquivos limpos.

### V5 — Manifesto versionado (FR-018)
- Validar um manifesto de exemplo contra [contracts/pack-manifest.schema.json](./contracts/pack-manifest.schema.json): manifesto válido passa; `minAppVersion` futura é recusada; `sum(files.bytes) != totalBytes` é rejeitado.

### V6 — Imagens 4:5 e flood-fill (FR-008/FR-020)
- Converter uma página de colorir (WebP/PNG otimizado) → **teste de flood-fill**: contornos fechados preservados, preenchimento **sem vazar** (comparar regiões antes/depois).
- Imagem fora de 4:5 → **não** é esticada/cortada; é **sinalizada** para aprovação visual.

### V7 — Reprodutibilidade em clone limpo (FR-010/SC-006)
- `git archive HEAD` (tracked-only) → todos os `require` estáticos do **starter** resolvem; nenhum depende de untracked/remoto.

### V8 — Compliance (FR-021/D10)
- Confirmar: **sem** telemetria/coleta infantil; downloads **só** com ação do responsável; **Wi-Fi por padrão** (aviso antes de dados móveis); "Modo Igreja" pré-baixa em Wi-Fi.

## Portões de qualidade (Constituição)
- `npm run smoke` verde · `npx expo-doctor` verde.
- **Validação visual por print/vídeo** (mapa, Livrinho, Ateliê, colorir) e **em device** (offline, download, flood-fill).
- Relatórios em PT-BR.

## Fora deste guia
Implementação (services, schema runtime, telas) e migração de áudio (não aplicável — já em expo-audio). Vão para `tasks.md` (Etapa SDD 5) após aprovação do Plano.
