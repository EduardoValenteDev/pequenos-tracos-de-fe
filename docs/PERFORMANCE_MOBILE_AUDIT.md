# Auditoria de Performance Mobile — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**

---

## Resumo

| Tela | Risco atual | Volume atual | Volume futuro | Prioridade |
|---|---|---|---|---|
| Aventuras (StoriesScreen) | Médio | 20 cards | Fixo (20 hist.) | P2 |
| Conquistas (TrophiesScreen) | Baixo | ~15-20 items | ~30+ items | P2 |
| Área dos Pais | Baixo | 20 linhas de tabela | Fixo | P3 |
| Ateliê Galeria | Médio | Ilimitado (usuário) | Crescente | P2 |
| Home | Baixo-Médio | Fixo | Fixo | P3 |
| NarrationScreen | Baixo | 1 cena por vez | 1 cena por vez | P3 |
| ColoringScreen | Alto (PNG 2 MB) | 1 imagem por vez | 1 imagem | P0-P1 (PNG) |
| StoryBookScreen | Médio | 10 cenas/história | 10 cenas | P2 |
| QuizScreen | Baixo | 5-8 questões | Fixo | P3 |

---

## Análise detalhada por tela

### HomeScreen
- **Componentes:** ScrollView + Animated loops + FlatList horizontal de worlds (4 items)
- **Risco:** Baixo. `useFocusEffect` para refresh no foco. Animated com `useNativeDriver: true` ✓
- **Múltiplos `useState`:** Aceitável (5-6 estados)
- **Recomendação:** Nenhuma no momento. Monitorar com crescimento de catálogo.

### StoriesScreen (Aventuras)
- **Componentes:** ScrollView principal + ScrollView de chips de trilha + mapas de StoryCard
- **Volume:** 20 cards por trilha (máximo por tab)
- **Risco:** Médio. Com 20 items em ScrollView, todas as 20 cards renderizam ao mesmo tempo. Aceitável hoje.
- **Volume futuro:** Fixo (20 histórias por trilha por design)
- **Correção recomendada:** Manter ScrollView atual. FlatList valeria a pena se houver > 30 items por seção.
- **Prioridade de migração:** P3

### TrophiesScreen (Conquistas / Estrelinhas)
- **Componentes:** ScrollView com lista de conquistas (~15-20 items no MVP)
- **Risco:** Baixo atual. Pode crescer para 30-40 conquistas.
- **Correção recomendada:** Migrar para FlatList quando houver > 25 conquistas.
- **Prioridade:** P2

### AtelierGalleryScreen
- **Componentes:** Lista de artes do usuário (crescente ilimitado no plano premium)
- **Risco:** Médio a alto. Cada item tem thumbnail em base64. Com 50+ artes, a renderização pode ser lenta.
- **Correção recomendada:** Migrar para FlatList com `getItemLayout` fixo. Limitar carregamento de thumbnails lazy.
- **Prioridade:** P2

### ColoringScreen
- **Componentes:** WebView com canvas + imagem PNG de 2 MB
- **Risco:** Alto (PNG). `Image.resolveAssetSource` já é chamado para calcular canvas height ✓
- **Cálculo adaptativo de canvas height:** Implementado ✓
- **Fallback para imagem ausente:** Implementado ✓
- **Correção recomendada:** Comprimir PNGs (ver ASSET_SIZE_AUDIT.md). Nenhuma mudança de código.
- **Prioridade:** P0/P1 (PNG)

### StoryBookScreen (Livrinho)
- **Componentes:** ScrollView + 10 imagens de cenas (drawn base64 + lineart PNG)
- **Risco:** Médio. Carrega 10 imagens ao mesmo tempo. Com PNG de 2 MB + base64, uso de memória pode ser alto.
- **AsyncStorage reads:** 10 chamadas sequenciais para getSavedDrawing por história ✓ (já usa Promise.all)
- **Correção recomendada:** Lazy loading das imagens de cena (carregar apenas as 3 vizinhas da atual).
- **Prioridade:** P2

### ParentAreaScreen
- **Componentes:** ScrollView com tabela de 20 histórias + múltiplas seções
- **Risco:** Baixo. Dados locais, sem imagens pesadas.
- **Correção:** Nenhuma necessária agora.

---

## Memoização — estado atual

Encontradas ~40 ocorrências de `useCallback`, `useMemo`, `React.memo` em todo o projeto.

| Contexto | Memoização | Adequada? |
|---|---|---|
| `ProgressContext` — funções de acesso | `useCallback` em todas ✓ | Sim |
| `ProgressContext` — value do Provider | `useMemo` ✓ | Sim |
| `useProgress` — `salvarCena` | `useCallback` ✓ | Sim |
| StoryCard | Sem `React.memo` explícito | Aceitável (lista pequena) |
| Componentes Lumi | Sem `React.memo` | Aceitável |

---

## ScrollView vs FlatList — decisão por tela

| Tela | Componente atual | Migrar para FlatList? | Quando |
|---|---|---|---|
| Aventuras (20 cards) | ScrollView | Não obrigatório | Quando > 30 items |
| Conquistas (15-20) | ScrollView | Quando > 25 items | Sprint performance |
| Galeria Ateliê (ilimitado) | Provavelmente ScrollView | Sim — prioridade | Sprint performance |
| ParentArea (tabela 20 linhas) | ScrollView | Não | — |
| StoryBook (10 cenas) | ScrollView | Não (fixo 10) | — |

---

## Animated e animações

- Todos os `Animated` com `useNativeDriver: true` onde possível ✓
- `pulseLoop` no AudioPlayer: cleanup no `useEffect` return ✓
- `colorirPulse` no NarrationScreen: cleanup no `useEffect` return ✓
- Confetti: avaliar se usa JS thread pesadamente

---

## AsyncStorage e memória

| Chave de dados | Tamanho típico | Risco |
|---|---|---|
| `@ptf_profile` | < 1 KB | Baixo |
| `@ptf_progress_{storyId}` (×20) | < 1 KB cada | Baixo |
| `@ptf_drawing_s{id}_c{id}` | 200-500 KB cada (base64 PNG) | Alto com 200 cenas |
| `ptf_atelier_arts_v1_*` | 100-500 KB cada | Alto com muitas artes |
| `@ptf_achievements_seen` | < 1 KB | Baixo |

**Risco real com 200 cenas pintadas:** ~200 × 300 KB médio = ~60 MB em AsyncStorage  
**Limite Android AsyncStorage (RocksDB):** ~6 MB por entrada — **não por banco total**  
**Recomendação:** Migrar para `expo-file-system` na Sprint 19 (ver DRAWING_STORAGE_AUDIT.md)

---

## Safe Area

- `SafeAreaProvider` em `App.js` ✓
- `useSafeAreaInsets()` em todas as telas principais ✓
- `androidStatusBar.translucent: true` ✓
- `edgeToEdgeEnabled: true` ✓

---

## Recomendações por prioridade

| Item | Prioridade | Sprint |
|---|---|---|
| Comprimir PNG de colorir | P0/P1 | 17 (manual) |
| Migrar desenhos para FileSystem | P1 | 19 |
| FlatList na Galeria do Ateliê | P2 | 19 |
| FlatList em Conquistas (quando > 25 items) | P2 | 19 |
| Lazy loading de imagens no StoryBook | P2 | 19 |
| FlatList em Aventuras (quando > 30 items) | P3 | 20+ |
