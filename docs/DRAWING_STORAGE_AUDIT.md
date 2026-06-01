# Auditoria de Storage de Desenhos — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**  
Fonte: `src/services/drawingStorage.js`, `src/services/atelierStorage.js`

---

## Estado atual

### drawingStorage.js (Desenhos de cenas de colorir)

| Item | Detalhe |
|---|---|
| Chave | `@ptf_drawing_s{storyId}_c{sceneId}` |
| Valor | String base64 PNG (`data:image/png;base64,...`) — v1, ou JSON com `{v:2, W, H, imgX, imgY, imgW, imgH, data}` — v2 |
| Por cena | 1 entrada por cena colorida |
| Total possível | 200 entradas (200 cenas) |
| Tamanho médio por entrada | 200–500 KB (base64 do canvas 390×600) |
| **Total máximo** | **~40–100 MB em AsyncStorage** |

### atelierStorage.js (Artes do Ateliê)

| Item | Detalhe |
|---|---|
| Índice | `ptf_atelier_arts_v1_index` — array de metadados |
| Arte completa | `ptf_atelier_arts_v1_{id}` — JSON com `stateJson + previewBase64` |
| Thumbnail | Dentro do índice — base64 pequeno |
| Tamanho por arte completa | 100–500 KB (base64 + stateJson) |
| Limite gratuito | 3 artes |
| Limite premium | Ilimitado |
| Risco com 50+ artes premium | Alto — AsyncStorage acumula MBs |

---

## Riscos identificados

| Risco | Severidade | Cenário |
|---|---|---|
| OOM (Out of Memory) ao carregar AsyncStorage em dispositivo 2 GB RAM | Alto | 200 cenas pintadas × 300 KB = ~60 MB de strings em memória |
| Lentidão na inicialização | Médio | AsyncStorage carrega todas as chaves no boot; chaves grandes atrasam a leitura |
| Corrupção silenciosa | Médio | Se o dispositivo ficar sem espaço, `AsyncStorage.setItem` falha silenciosamente (capturado pelo logger agora) |
| Limite de tamanho de entrada | Médio | Android RocksDB: limite por entrada varia. Entradas > 1 MB podem falhar em alguns devices |
| Dados órfãos | Baixo | Desenhos de histórias removidas permanecem no storage |

---

## Proposta de migração: AsyncStorage → expo-file-system

```
ANTES:
  AsyncStorage.setItem('@ptf_drawing_s{id}_c{id}', base64String)
  AsyncStorage.getItem('@ptf_drawing_s{id}_c{id}') → base64String

DEPOIS:
  FileSystem.writeAsStringAsync(
    FileSystem.documentDirectory + 'drawings/{storyId}_{sceneId}.png',
    base64Data,
    { encoding: FileSystem.EncodingType.Base64 }
  )
  FileSystem.readAsStringAsync(path, { encoding: Base64 }) → base64
  AsyncStorage.setItem('@ptf_drawing_meta_{key}', JSON.stringify({ path, updatedAt }))
```

### Benefícios
- Imagens ficam no filesystem nativo → sem pressão de memória no AsyncStorage
- iOS / Android gerenciam paginação de arquivo automaticamente
- `expo-file-system` já é dependência indireta via Expo SDK

### Compatibilidade
- Os dados atuais em AsyncStorage precisariam de migração one-time na primeira abertura após o update
- Migração é não-destrutiva: ler do AsyncStorage, salvar no filesystem, deletar chave antiga
- Formato v1 e v2 já existentes no `parseDrawingPayload` (StoryBookScreen) continuam compatíveis

### Estimativa de esforço
- Médio (1–2 dias): reescrever `drawingStorage.js`, adicionar migração one-time, testar
- Bloqueia: nenhum recurso atual
- Sprint recomendada: **Sprint 19**

---

## Medida imediata desta sprint (sem reescrita)

O `logger.js` agora captura falhas silenciosas em `drawingStorage.js`. Em produção, as falhas de escrita não logarão, mas também não travarão o app (comportamento correto: o desenho simplesmente não é salvo e o usuário pode recolorir).

**Nenhuma mudança estrutural nesta sprint.** Documentação criada para Sprint 19.

---

## Checklist para Sprint 19 — Migração de Storage

- [ ] Instalar ou confirmar presença de `expo-file-system`
- [ ] Reescrever `drawingStorage.js` com FileSystem
- [ ] Implementar migração one-time no `drawingStorage.js` (ler AsyncStorage → salvar FileSystem → deletar chave)
- [ ] Verificar compatibilidade com `parseDrawingPayload` v1/v2 no `StoryBookScreen`
- [ ] Testar em iOS e Android
- [ ] Medir uso de memória antes/depois
- [ ] Atualizar smoke tests
- [ ] Atualizar `PRIVACY_POLICY_DRAFT.md` se necessário (dados agora em filesystem)
