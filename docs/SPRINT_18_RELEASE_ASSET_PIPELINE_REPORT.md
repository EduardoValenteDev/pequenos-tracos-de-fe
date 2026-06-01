# Sprint 18.0 — Release Readiness & Asset Pipeline Report

**Data:** 2026-06-01  
**Smoke antes:** 600/600  
**Smoke depois:** **620/620** ✓ (+20 novos checks)  
**Dependências instaladas:** Nenhuma  
**Conteúdo de histórias alterado:** Não  
**Assets alterados ou apagados:** Não  
**Compressão destrutiva aplicada:** Não  

---

## Resumo executivo

Esta sprint estabeleceu a infraestrutura completa de pipeline de assets e preparou os documentos e checklists para publicação nas lojas — sem depender de assets finais.

**O que foi construído:**
- 4 scripts de auditoria/validação de assets (executam sem alterar nada)
- 1 manifest auto-gerado de 467 linhas com estado de todos os 200 assets esperados
- 5 documentos de guia e checklist para loja, assets, compressão, build e publicação legal
- 20 novos smoke checks cobrindo pipeline, consistência de require() e release readiness

**O estado real dos assets:**
- 0/200 áudios prontos (esperado — ainda não gravados)
- 30/200 imagens de colorir presentes (3 histórias) — todas GRANDES (1-1,3 MB cada → comprimir)
- 3/20 capas presentes (também grandes → comprimir)
- 17 histórias sem imagem de colorir → fallback implementado ✓

---

## Arquivos criados

### Scripts
| Script | Descrição |
|---|---|
| `scripts/audit-assets.js` | Auditoria completa: áudio, colorir, capas, narração, legados, órfãos, manifest |
| `scripts/validate-audio-assets.js` | Validação detalhada de áudios (nome, extensão, tamanho, manifest) |
| `scripts/validate-image-assets.js` | Validação de imagens (require(), capas, narração, órfãos, legados) |
| `scripts/report-image-sizes.js` | Relatório de tamanho não-destrutivo com comandos de compressão |
| `scripts/generate-expected-assets-manifest.js` | Gerador do EXPECTED_ASSETS_MANIFEST.md |

### Documentos
| Arquivo | Descrição |
|---|---|
| `docs/EXPECTED_ASSETS_MANIFEST.md` | Manifest completo: 20 histórias × 10 cenas × 3 tipos de asset |
| `docs/ASSET_PIPELINE_GUIDE.md` | Guia completo: onde colocar, como nomear, workflow, erros comuns |
| `docs/IMAGE_COMPRESSION_STRATEGY.md` | Quando usar PNG/JPG/WebP, como comprimir sem perder qualidade |
| `docs/STORE_RELEASE_READINESS_CHECKLIST.md` | Checklist Apple + Google separado com todos os requisitos |
| `docs/LEGAL_PUBLICATION_GUIDE.md` | Opções de hospedagem: GitHub Pages, domínio próprio, outros |
| `docs/BUILD_PRODUCTION_AUDIT.md` | Auditoria de app.json, eas.json, versionamento, flags |
| `docs/PERFORMANCE_ACTION_PLAN.md` | Plano de ação por momento: agora, com assets, antes da loja, depois |
| `docs/SPRINT_18_RELEASE_ASSET_PIPELINE_REPORT.md` | Este relatório |

### Script de geração
| Arquivo | Descrição |
|---|---|
| `scripts/smoke.js` | +20 checks Sprint 18 [601–620] |

---

## Arquivos alterados

| Arquivo | O que mudou |
|---|---|
| `scripts/smoke.js` | 20 novos checks Sprint 18 [601–620] |
| `scripts/audit-assets.js` | Corrigido: path resolution para require() em manifestos; stripComments() |

---

## Comandos executados

```bash
node scripts/audit-assets.js            → ⚠ 0 errors, 37 warnings (tamanho PNG)
node scripts/validate-audio-assets.js   → 0/200 áudios prontos (esperado)
node scripts/validate-image-assets.js   → 30/30 require() OK
node scripts/report-image-sizes.js --critical-only → 56 arquivos > 300 KB
node scripts/generate-expected-assets-manifest.md  → 467 linhas criadas
node scripts/smoke.js                   → 620/620 ✓
```

---

## Riscos resolvidos

| # | Risco | Sprint | Resolução |
|---|---|---|---|
| P1 | Pipeline de validação de assets ausente | 18 | ✅ 4 scripts criados e funcionando |
| P1 | Manifest de assets esperados ausente | 18 | ✅ EXPECTED_ASSETS_MANIFEST.md auto-gerado |
| P1 | Guia de adição de assets ausente | 18 | ✅ ASSET_PIPELINE_GUIDE.md com workflow completo |
| P1 | Checklist de loja ausente | 18 | ✅ STORE_RELEASE_READINESS_CHECKLIST.md |
| P1 | Build production não auditado | 18 | ✅ BUILD_PRODUCTION_AUDIT.md |
| P2 | Estratégia de compressão não documentada | 18 | ✅ IMAGE_COMPRESSION_STRATEGY.md |
| P2 | Guia de publicação legal ausente | 18 | ✅ LEGAL_PUBLICATION_GUIDE.md |
| P2 | Plano de performance não priorizado | 18 | ✅ PERFORMANCE_ACTION_PLAN.md |

---

## Riscos restantes

### P0 (bloqueadores)
| Risco | Status | Ação |
|---|---|---|
| PNG não comprimido (65 MB → 437 MB projeção) | ✗ Não resolvido | Manual: `pngquant --quality 70-85` |
| Política de privacidade em URL pública | ✗ Aguardando | Decisão humana |
| Termos de uso em URL público | ✗ Aguardando | Decisão humana |
| Restore Purchase real (Apple) | ✗ Placeholder | Sprint 21 |

### P1
| Risco | Status |
|---|---|
| Consentimento LGPD para nome da criança | ⚠ Documentado, não implementado |
| 2 packages out of date (expo-doctor) | ⚠ Aguarda análise de breaking changes |
| npm audit 11 moderate | ⚠ Aguarda `npm audit fix` revisado |

### P2
| Risco | Status |
|---|---|
| AsyncStorage → FileSystem para desenhos | ⚠ Sprint 19 |
| FlatList na Galeria do Ateliê | ⚠ Sprint 19 |
| `progressError` consumido visualmente | ⚠ Sprint 18/19 |

---

## O que depende de imagens

1. Registrar require() em `coloringImages.js` para cada nova história
2. Comprimir PNG antes de commitar (pngquant)
3. Declarar `imagemCapa` em `stories.js` quando capa chegar
4. Verificar com `validate-image-assets.js --story {id}` após cada entrega

---

## O que depende de áudios

1. Seguir workflow em `docs/ASSET_PIPELINE_GUIDE.md`
2. Nomear: `{storyId}_scene_{NN}.mp3`
3. Mover para `assets/audio/{storyId}/`
4. Adicionar entrada em `audioManifest.js`
5. Verificar bundle size após cada batch (ver `BUILD_SIZE_LOG.md`)
6. Planejar CDN antes de 80 áudios

---

## O que depende de decisão humana

1. **Publicar política de privacidade:** Escolher domínio/plataforma, preencher PLACEHOLDERs, publicar
2. **Publicar termos de uso:** Idem
3. **Preencher PLACEHOLDERs legais:** CNPJ/CPF, endereço, DPO
4. **Compressão de PNG:** Executar `pngquant` e validar visualmente antes de commitar
5. **Classificação etária:** Preencher questionários nas consoles da Apple e Google
6. **Metadata de loja:** Título, descrição, palavras-chave, screenshots
7. **Contas de desenvolvedor:** Apple ($99/ano), Google ($25 único)

---

## O que depende de loja

1. Restore Purchase real — requer produtos IAP criados nas consoles
2. Data Safety Form (Google) — requer conta Play Console ativa
3. Privacy Nutrition Labels (Apple) — requer conta App Store Connect ativa
4. Screenshots de todos os device sizes — requer dispositivos físicos ou simuladores
5. TestFlight / Internal Testing — requer contas ativas

---

## O que depende de backend

1. Consentimento em nuvem para dados de crianças
2. Sincronização de progresso multi-dispositivo
3. Restore Purchase com validação server-side de receipt
4. Analytics centralizados
5. Rate limiting para Lumi IA (futuro)

---

## Próxima sprint recomendada

**Sprint 19 — Performance e Storage**

Objetivos:
1. Migrar `drawingStorage.js` de AsyncStorage para `expo-file-system`
2. FlatList na Galeria do Ateliê
3. Consumir `progressError` visualmente em HomeScreen, StoriesScreen, TrophiesScreen
4. Corrigir 2 packages out of date (`npx expo install --check`)
5. `npm audit fix` (sem --force, após revisar breaking changes)

Pré-requisito antes de Sprint 19: Comprimir PNG (manual) e publicar política de privacidade.
