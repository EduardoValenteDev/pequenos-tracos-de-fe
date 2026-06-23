# Implementation Plan: Fundação de Arquitetura e Orçamento de Assets

**Branch**: `001-asset-architecture-budget` | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-asset-architecture-budget/spec.md`

> Detalhes de pesquisa/decisão em [research.md](./research.md); modelo de dados e schema em [data-model.md](./data-model.md) e [contracts/pack-manifest.schema.json](./contracts/pack-manifest.schema.json); guia de validação em [quickstart.md](./quickstart.md).

## Summary

A feature estabelece a **arquitetura híbrida de conteúdo** e o **orçamento de assets** do app: um **starter pack gratuito empacotado no binário** (offline desde a instalação) + **packs remotos baixáveis sob demanda** (premium/novos), com **offline persistente após download**, **remoção gerenciada pelo responsável** e conteúdo **"em breve" fora do bundle inicial**. O alvo de download/instalação inicial é **≤ ~150 MB**; o catálogo é **20 histórias + ≥25% de folga** sem inflar o bundle. A entrega remota recomendada é **Cloudflare R2** (egress zero) com **URLs públicas-não-listadas no MVP** e **URLs assinadas + RevenueCat** nas fases seguintes. Imagens migram para **WebP** (com PNG/lossless preservado para colorir, validado por flood-fill); o áudio **já está em expo-audio** (sem dívida de expo-av). Integridade por **sha256** + download atômico com retomada e cache persistente. Tudo respeitando **LGPD/local-first** e **download sob controle do responsável** (Wi-Fi por padrão; "Modo Igreja" com pré-download).

## Technical Context

**Language/Version**: JavaScript (sem TypeScript nesta feature — Constituição I/III). React 19.1.0.

**Primary Dependencies**: Expo SDK 54 (~54.0.35), React Native 0.81.5, **expo-file-system ~19 (`/legacy`)** para download/cache/hash, expo-audio ~1.1.1 (já presente). **Novas dependências (aprovação prévia obrigatória, fases futuras):** `react-native-purchases` (RevenueCat) — entitlement; possível util de WebP no pipeline de build (offline, não runtime).

**Storage**: Local-first. Estado em AsyncStorage (`@ptf_*`); packs **instalados** em **armazenamento persistente** `expo-file-system` `documentDirectory/packs/<packId>@<version>/` (NÃO no cache volátil do SO); **download em curso** num `.tmp/` descartável. Remoto: **object storage (R2 recomendado)** — fora do app/Git.

**Testing**: `npm run smoke` (1296+), `npx expo-doctor`, scripts de auditoria (`scene:images:audit`, `audio:audit`), validação visual em device (mapa/Livrinho/Ateliê/colorir) — Constituição.

**Target Platform**: iOS 15+ / Android (New Architecture), foco Brasil-first em **aparelhos de baixo custo**.

**Project Type**: Mobile app (Expo/RN), local-first, sem backend próprio no MVP.

**Performance Goals**: Download/instalação inicial **≤ ~150 MB** como **meta de UX/performance** (não como limite rígido de loja). Acima de **~200 MB** há **fricção adicional** (avisos/limites de download por dados móveis no Google Play, adoção em aparelhos modestos), então a meta enxuta permanece válida. Também: cold start sem regressão; decode de imagem sem jank no Livrinho/colorir; flood-fill preservado.

**Constraints**: Offline-capable (starter sempre; packs após download); memória contida (preferir `file://` a base64 grande — Constituição IV); download resiliente em redes móveis fracas; controle do responsável.

**Scale/Scope**: 20 histórias atuais + ≥25% (≈5 packs); categorias-base medidas: cenas 160, colorir 90, áudio 61, capas 20; `assets/` working ≈791 MiB hoje (precisa cair drasticamente no starter via WebP + remoto).

## Constitution Check

*GATE: passar antes da Fase 0; reavaliar após Fase 1.*

| Princípio (Constituição v1.1.0) | Avaliação | Veredito |
|---|---|---|
| **I. Stack Soberano** | Sem libs novas no MVP além de `expo-file-system` (já presente). RevenueCat/WebP-tooling marcados como **aprovação prévia** em fases futuras. Sem TS nesta feature. | ✅ (com flag de dependência futura) |
| **II. Local-first & separação** | Starter local + cache local; lógica de packs em `src/services/` (download/integrity/manifest); UI só consome. Áreas sensíveis (paywall/accessControl) só mudam em fases com SDD próprio. | ✅ |
| **III. Clean Code / nomes EN, docs PT** | Plano define módulos pequenos (manifestService, packDownloadService, integrityService, packStorage). | ✅ |
| **IV. Performance/UX** | WebP + `file://` (sem blobs grandes), download atômico fora da UI thread, sem re-render desnecessário. | ✅ |
| **V. Spec-Driven** | Este é o Plano (Etapa SDD 4); implementação só após Tasks/Analyze/Portões. | ✅ |
| **Restrições de assets / Git** | `assets/stories/*` permanecem untracked até auditoria; sem `git add .`; Git LFS não automático (ver research). | ✅ |
| **Privacidade/LGPD** | Sem analytics; download sob controle do responsável; sem coleta infantil. | ✅ |

**Resultado**: **PASS** — sem violações que exijam Complexity Tracking. Pontos que **disparam rigor máximo** (paywall, accessControl, pagamento, persistência) ficam nas **fases futuras**, cada uma com seu ciclo SDD; este plano apenas as **arquiteta**, não as implementa.

## Áreas obrigatórias do Plano (mapa)

1. **Arquitetura híbrida** → §Decisões D1–D2 + [data-model.md](./data-model.md).
2. **Orçamento** → §Decisões D3 + [research.md](./research.md) §Orçamento.
3. **Armazenamento remoto (R2/Supabase/alt.)** → [research.md](./research.md) §Storage (D4).
4. **Monetização/acesso (RevenueCat, signed URLs, Edge)** → [research.md](./research.md) §Acesso (D5).
5. **Manifesto de pack** → [contracts/pack-manifest.schema.json](./contracts/pack-manifest.schema.json) + [data-model.md](./data-model.md).
6. **Integridade e download** → §Decisões D6 + [research.md](./research.md) §Download.
7. **Imagens (PNG/WebP/4:5/flood-fill)** → [research.md](./research.md) §Imagens (D7).
8. **Áudio (expo-av/expo-audio)** → [research.md](./research.md) §Áudio (D8).
9. **Git/versionamento (comum/LFS/remoto)** → [research.md](./research.md) §Git (D9).
10. **Compliance/infantil (LGPD, Modo Igreja)** → [research.md](./research.md) §Compliance (D10).

## Decisões técnicas (resumo — detalhe em research.md)

- **D1 — Camadas de conteúdo:** `starter` (binário, grátis: A Criação + Noé) · `remote` (premium/novos packs, R2) · `coming_soon` (fora do bundle, só catálogo).
- **D2 — Armazenamento de pack (persistência ≠ cache temporário):** packs **instalados** vivem em **armazenamento PERSISTENTE do app** (`expo-file-system` `documentDirectory/packs/<id>@<version>/`) — **não** no diretório de cache do sistema. Apenas o **download em andamento** usa um diretório **temporário** (`…/packs/.tmp/`), que **pode** ser limpo a qualquer momento sem perda do conteúdo já instalado. Índice em AsyncStorage (`@ptf_packs_v1`). Resolução de mídia: pack instalado → `file://`; senão fallback seguro (já existe no Livrinho). **Prioridade: persistência offline dos packs baixados** (não confiar em cache volátil do SO).
- **D3 — Orçamento:** starter ≤ ~150 MB pós-WebP **como meta de UX/performance (não limite rígido de loja)**; acima de ~200 MB há fricção (Play/dados móveis) → meta enxuta válida. Cada pack remoto medido; projeção 20 + ≥25% **não** entra no bundle. Impacto por categoria em research.
- **D4 — Storage remoto:** **Cloudflare R2** (egress zero, S3-compat, CDN). **MVP: público-não-listado SÓ se não houver risco comercial relevante** (grátis/piloto). **Fase 2: URLs temporárias/assinadas** para premium. **Fase 3: endurecimento** (Edge/Worker, expiração, rotação, observabilidade).
- **D5 — Acesso (gating):** **RevenueCat** é **pré-requisito de qualquer venda/download premium real** — se um pack premium pago for liberado, o entitlement entra **antes**. Se o MVP não liberar premium real, RevenueCat fica na **Fase 2**. **URL pública não-listada ≠ proteção robusta** (só piloto/grátis/fase controlada).
- **D6 — Download íntegro:** temp → valida bytes + sha256 (por arquivo e por pack) → move atômico → marca `ready`. Falha → mantém estado anterior + retry; retomada via download resumable; limpeza LRU + remoção pelo responsável.
- **D7 — Imagens:** cenas coloridas → **WebP lossy**; **páginas de colorir → WebP lossless ou PNG otimizado**, com **teste de flood-fill** obrigatório (contornos fechados, sem vazamento). Preservar **4:5**; nunca esticar/cortar sem aprovação. Limiar de anti-aliasing definido aqui (ver research §Imagens).
- **D8 — Áudio:** **expo-av NÃO está presente** (já em expo-audio) → **sem migração nesta feature**; narração viaja **dentro do pack** da história. Risco de áudio já resolvido historicamente.
- **D9 — Git:** starter (otimizado/pequeno) no **Git comum**; packs remotos **fora do Git** (R2); **Git LFS não adotado** (EAS Build + custo). `assets/stories/*` seguem untracked até o **pipeline de auditoria** (antes de Rute/José/Ester/Moisés/Samuel/Josias).
- **D10 — Compliance:** LGPD, zero telemetria, sem coleta infantil; downloads **sob controle do responsável**, **Wi-Fi por padrão** (cautela com dados móveis BR); **Modo Igreja** com pré-download em Wi-Fi.

## Project Structure

### Documentation (this feature)

```text
specs/001-asset-architecture-budget/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 — decisões D1–D10 (Decision/Rationale/Alternatives)
├── data-model.md        # Fase 1 — entidades Pack, Manifesto, ContentLayer, CacheEntry
├── quickstart.md        # Fase 1 — guia de validação
├── contracts/
│   └── pack-manifest.schema.json   # Contrato do manifesto de pack (versionado)
└── tasks.md             # Fase 2 (/speckit.tasks — NÃO criado aqui)
```

### Source Code (repository root) — alvo das fases de implementação (não criado neste Plano)

```text
src/
├── services/
│   ├── packManifestService.js     # ler/validar manifesto (schema + versão + compat mínima)
│   ├── packDownloadService.js     # download atômico + retomada + fallback
│   ├── packIntegrityService.js    # sha256/bytes por arquivo e por pack
│   ├── packStorageService.js      # cache em documentDirectory + índice AsyncStorage + limpeza
│   └── contentResolver.js         # resolve mídia: starter (require) | pack (file://) | fallback
├── data/
│   └── contentManifest.js         # camadas (starter/remote/coming_soon) por história
└── context/                       # (sem mudança estrutural)
scripts/
└── assets-pipeline/               # auditoria + otimização (WebP) + flood-fill test (offline, build-time)
```

**Structure Decision**: Mantém a arquitetura local-first existente (Constituição II). Toda a lógica de pack vive em `src/services/` (camada de dados única); a UI continua consumindo via um resolvedor central, espelhando o padrão já usado em `storyImageService`/`drawingStorage`. Nada é implementado neste Plano — apenas especificado para Tasks.

## Fases de entrega (MVP / Fase 2 / Fase 3)

- **MVP (≈ Fase 2 do Roteiro Mestre):** otimizar starter (WebP, ≤150 MB) · definir/validar **manifesto** + `packManifestService` · infra de **download/integridade/cache** provada com **1 pack remoto grátis** em R2 (público-não-listado) · downloads **Wi-Fi/responsável** · **sem** RevenueCat e **sem** premium ainda. Pipeline de assets para destravar histórias novas.
- **Fase 2:** packs **premium** + **RevenueCat** (entitlement) + **URLs assinadas** (R2 presigned via Worker) · retomada + limpeza LRU · gestão de remoção na Área dos Pais.
- **Fase 3:** **Edge Functions**/validação de token se necessário · escala/CDN tuning · packs de **i18n** · "Modo Igreja" pré-download avançado.

## Riscos

- **Starter ainda pesado** mesmo com WebP → mitigação: medir cedo; mover história não-grátis para remoto antes do binário.
- **Flood-fill quebrar** com WebP nas páginas de colorir → mitigação: lossless/PNG + teste de regressão de flood-fill obrigatório (D7).
- **Rede móvel fraca (BR)** → download incompleto → mitigação: atômico + retomada + Wi-Fi padrão + Modo Igreja.
- **Dependência futura (RevenueCat)** sem aprovação → mitigação: feature/SDD própria + Constituição I.
- **Proteção fraca no MVP** (URL não-listada) confundida com robusta → mitigação: D5 separa explicitamente MVP vs futuro.
- **Custo de egress** se não usar R2 → mitigação: R2 (egress zero) como recomendação primária.
- **Assets não auditados** (incl. `josiah_young_king`) entrarem cedo → mitigação: pipeline de auditoria obrigatório antes de versionar/subir.

## Complexity Tracking

> Sem violações constitucionais que exijam justificativa. (Constitution Check = PASS.)

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
