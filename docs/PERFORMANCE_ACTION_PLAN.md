# Plano de Ação de Performance — Pequenos Traços de Fé

**Sprint 18.0 · 2026-06-01**  
Baseado em `docs/PERFORMANCE_MOBILE_AUDIT.md`. Convertendo achados em tarefas executáveis.

---

## Resumo executivo

O app está performático para o estado atual (3 histórias com imagens). Os riscos principais surgem com o crescimento de assets e dados de usuário. Nenhuma ação de performance é bloqueadora agora — os itens abaixo devem ser executados nas sprints indicadas.

---

## AGORA — Ações imediatas (antes da próxima história)

### 1. Comprimir PNG de colorir — Impacto ALTO
**Problema:** 30 PNGs de colorir = ~65 MB. Meta: ~2 MB (redução de 96%).  
**Ação:** `pngquant --quality 70-85 --ext .png --force assets/stories/**/*_coloring.png`  
**Quem:** Desenvolvedor ou designer (pós-aprovação visual)  
**Teste:** `node scripts/report-image-sizes.js --critical-only` → zero críticos  
**Sprint:** Manual (não requer sprint de código)

### 2. Comprimir capas e personagens — Impacto MÉDIO
**Problema:** Capas de 1,5–1,7 MB. Meta: ≤ 100 KB cada.  
**Ação:** `pngquant --quality 65-80 --ext .png --force assets/images/*.png`  
**Exceções:** `icon.png`, `adaptive-icon.png`, `favicon.png`, `splash-icon.png` — NÃO comprimir  
**Sprint:** Manual (não requer sprint de código)

---

## QUANDO IMAGENS CHEGAREM

### 3. Registrar novas imagens em coloringImages.js — Impacto ALTO
**Problema:** 17 histórias sem imagens registradas. ColoringScreen mostra placeholder.  
**Ação:** Para cada nova história, adicionar bloco em `src/assets/coloringImages.js`  
**Verificação:** `node scripts/validate-image-assets.js --story {id}`  
**Critério de aceite:** `node scripts/audit-assets.js` sem errors na seção 8

### 4. Comprimir cada PNG antes de commitar — Impacto CRÍTICO para bundle
**Problema:** Cada PNG sem compressão adiciona ~1 MB ao bundle.  
**Ação:** Seguir `docs/IMAGE_COMPRESSION_STRATEGY.md` antes de cada commit de imagem  
**Meta por arquivo:** ≤ 150 KB

### 5. Testar ColoringCanvas com novas imagens — Impacto MÉDIO
**Problema:** BFS fill usa threshold de luminância 210. Imagens com artefatos de compressão podem afetar o flood fill.  
**Ação:** Testar colorir em device real após cada nova história adicionada  
**Verificação:** Colorir funciona sem "fill leak" (cor vazando para área errada)

---

## QUANDO ÁUDIOS CHEGAREM

### 6. Verificar bundle size antes de cada commit de áudio — Impacto ALTO
**Problema:** 200 áudios × ~1 MB = ~200 MB adicionais. Limite: 150 MB APK.  
**Ação:** Após cada batch de áudios, verificar tamanho do build EAS  
**Checklist:** Ver `docs/MEDIA_BUDGET_GUIDE.md` e `docs/BUILD_SIZE_LOG.md`  
**Gatilho CDN:** Quando bundle ultrapassar 80 MB ou 80 áudios

### 7. Validar preload de áudio no StoryBookScreen — Impacto MÉDIO
**Problema:** `useAudioPlayer(audioAsset)` pode ter latência no primeiro play.  
**Ação:** Verificar se há atraso perceptível entre cenas no Livrinho com áudio real  
**Solução potencial:** Precarregar próximo áudio durante reprodução atual  
**Sprint:** Sprint 22+ (quando houver áudio real)

---

## ANTES DA LOJA

### 8. Migrar AsyncStorage → expo-file-system para desenhos — Impacto ALTO
**Problema:** Base64 em AsyncStorage pode acumular ~60-100 MB com 200 cenas pintadas.  
**Ação:** Reescrever `src/services/drawingStorage.js` para usar `expo-file-system`  
**Migração:** One-time migration no primeiro boot após update  
**Documentação:** `docs/DRAWING_STORAGE_AUDIT.md`  
**Sprint:** Sprint 19

### 9. FlatList na Galeria do Ateliê — Impacto MÉDIO
**Problema:** Lista de artes ilimitada em ScrollView. Com 50+ artes, renderização lenta.  
**Ação:** Migrar para FlatList com `getItemLayout` fixo  
**Sprint:** Sprint 19

### 10. Consumir `progressError` visualmente — Impacto MÉDIO
**Problema:** Se AsyncStorage falha, app fica em estado silencioso sem feedback.  
**Ação:** Em `HomeScreen`, `StoriesScreen` e `TrophiesScreen`, verificar `progressError` e exibir banner.  
**Sprint:** Sprint 18/19

---

## DEPOIS DO LANÇAMENTO

### 11. FlatList em StoriesScreen e TrophiesScreen — Impacto BAIXO-MÉDIO
**Problema:** ScrollView com 20 cards. Futuro: catálogo pode crescer.  
**Ação:** Migrar para FlatList com `initialNumToRender={8}`  
**Sprint:** Sprint 22+

### 12. Lazy loading de imagens no StoryBookScreen — Impacto MÉDIO
**Problema:** Carrega 10 imagens de cena de uma vez. Com PNG não comprimido é pesado.  
**Ação:** Carregar apenas as 3 cenas vizinhas da atual  
**Pré-requisito:** Compressão de PNG primeiro (reduz o impacto)  
**Sprint:** Sprint 22+

### 13. Profiling com Hermes DevTools — Impacto VARIÁVEL
**Quando:** Após reclamação de lentidão em device real  
**Como:** `npx react-devtools` + Hermes profiler no app em modo development  
**Focar em:** Renders desnecessários, chamadas de AsyncStorage frequentes

---

## QUANDO HOUVER BACKEND

### 14. Migrar ProgressContext para API + cache local — Impacto ALTO
**Problema:** Dados crescem com multi-perfil/multi-device  
**Ação:** API REST com cache local (AsyncStorage ou SQLite como cache de sessão)  
**Sprint:** Sprint 25+

### 15. CDN para áudios — Impacto CRÍTICO para bundle
**Problema:** 200 áudios locais = ~200 MB no bundle  
**Ação:** Cloudflare R2 + download lazy + cache local  
**Sprint:** Sprint 22+ (antes de 80 áudios)

---

## Resumo por momento

| Ação | Momento | Esforço | Impacto | Sprint |
|---|---|---|---|---|
| Comprimir PNG colorir | AGORA | Baixo (manual) | Crítico | — |
| Comprimir capas/personagens | AGORA | Baixo (manual) | Alto | — |
| Registrar novas imagens em coloringImages.js | Com imagens | Baixo | Alto | Com cada história |
| Migrar drawingStorage → FileSystem | Antes da loja | Alto | Alto | 19 |
| FlatList na Galeria Ateliê | Antes da loja | Médio | Médio | 19 |
| Consumir progressError visualmente | Antes da loja | Baixo | Médio | 18/19 |
| Validar preload de áudio | Com áudios | Médio | Médio | 22+ |
| CDN para áudios | Com 80+ áudios | Muito alto | Crítico | 22+ |
| Lazy loading StoryBook | Pós-lançamento | Médio | Médio | 22+ |
| FlatList Stories/Trophies | Pós-lançamento | Médio | Baixo | 22+ |
| Backend + cache | Com backend | Muito alto | Alto | 25+ |

---

## Métricas de performance a monitorar após lançamento

| Métrica | Ferramenta | Meta |
|---|---|---|
| Crash rate | Android Vitals / App Store Connect | < 0.5% |
| ANR rate (Android) | Android Vitals | < 0.1% |
| App startup time | Hermes profiler | < 2 s cold start |
| Frames por segundo | DevTools | > 55 fps scrolling |
| Memory usage | Android Vitals | < 200 MB em device 3 GB |
| Bundle size | EAS dashboard | < 50 MB (com compressão) |
