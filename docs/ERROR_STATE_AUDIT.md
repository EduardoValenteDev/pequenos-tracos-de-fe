# Auditoria de Estados de Erro — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**

---

## Critério de avaliação

Cada tela é avaliada em 5 dimensões:

| Símbolo | Significado |
|---|---|
| ✓ | Implementado e adequado |
| ⚠ | Parcial — existe mas incompleto |
| ✗ | Ausente |

---

## HomeScreen

| Estado | Status | Detalhe |
|---|---|---|
| Loading | ✓ | `isLoadingProgress` do ProgressContext — `ActivityIndicator` no App.js para fontes |
| Vazio | ✓ | Exibe estado "Comece sua primeira aventura" quando sem progresso |
| Erro de AsyncStorage | ⚠ | `progressError` existe no contexto mas não é consumido nesta tela |
| Fallback de asset | ✓ | `StoryFallbackCover` para capas ausentes |
| Ação de retorno | ✓ | Navegação funcional |

**Recomendação:** Consumir `progressError` e exibir banner discreto com "Tente novamente".

---

## Aventuras (StoriesScreen)

| Estado | Status | Detalhe |
|---|---|---|
| Loading | ✓ | Herda `isLoadingProgress` |
| Vazio | ✓ | Todas as histórias exibidas mesmo sem progresso |
| Erro | ⚠ | `progressError` não consumido |
| Fallback de capa | ✓ | `StoryFallbackCover` |
| Ação de retorno | ✓ | |

---

## StoryDetailScreen

| Estado | Status | Detalhe |
|---|---|---|
| Loading | ✓ | |
| Vazio | N/A | Sempre tem dados (passados por navegação) |
| História vazia/coming soon | ✓ | `status === 'coming_soon'` exibe estado adequado |
| Locked (premium) | ✓ | `LockedStoryFallback` / `PremiumLockCard` |
| Ação de retorno | ✓ | Botão Voltar funcional |

---

## NarrationScreen

| Estado | Status | Detalhe |
|---|---|---|
| Loading de fontes | ✓ | Aguarda fontes em App.js |
| Acesso negado | ✓ | `navigation.replace('ParentArea')` se não premium |
| Áudio ausente | ✓ | Hint "O som desta cena será adicionado depois" exibido automaticamente |
| Imagem de narração ausente | ✓ | `cenaImg === null` → não renderiza `<Image>` |
| Ação de retorno | ✓ | Botões de navegação entre cenas |

---

## ColoringScreen

| Estado | Status | Detalhe |
|---|---|---|
| Loading | ✓ | WebView tem estado de loading |
| Imagem ausente | ✓ | **Fallback implementado**: tela com emoji, título e botão "Continuar a história" |
| Acesso negado | ✓ | `navigation.replace('ParentArea')` |
| Canvas error | ✓ | `CANVAS_ERROR` capturado do WebView |
| Salvar falha | ✓ | `logger.log` (antes console.log sem DEV guard — corrigido Sprint 17) |
| Ação de retorno | ✓ | Botão "Pronto" sempre visível |

---

## StoryBookScreen (Livrinho)

| Estado | Status | Detalhe |
|---|---|---|
| Loading de desenhos | ✓ | `ActivityIndicator` enquanto carrega |
| Acesso negado | ✓ | `LockedStoryFallback` |
| Desenho ausente (cena não pintada) | ✓ | Lineart original exibida sem camada de pintura |
| Áudio ausente | ✓ | Controles manuais ativados automaticamente |
| Imagem de colorir ausente | ⚠ | Retorna null — comportamento depende do componente pai |
| Ação de retorno | ✓ | Botão Voltar |

---

## AtelierGalleryScreen / AtelierCanvasScreen

> **P3J-R.1 FIX1:** `AtelierScreen.js` (hub legado "Ateliê do Beni") foi **removido** do
> projeto. A auditoria abaixo cobre apenas as duas telas que permanecem.

| Estado | Status | Detalhe |
|---|---|---|
| Galeria vazia | ✓ | Estado vazio exibido |
| Limite de artes (gratuito) | ✓ | Modal de limite implementado |
| Erro de salvamento | ✓ | `logger.log` (corrigido Sprint 17) |
| Canvas error | ✓ | `CANVAS_ERROR` / `LOAD_CORRUPTED` capturados |
| Arte corrompida | ✓ | `LOAD_CORRUPTED` evento tratado |
| Ação de retorno | ✓ | |

---

## QuizScreen

| Estado | Status | Detalhe |
|---|---|---|
| Loading | ✓ | |
| Sem perguntas | ⚠ | Verificar comportamento se `quizzes[storyId]` for undefined |
| Resposta correta/errada | ✓ | Feedback visual imediato |
| Ação de retorno | ✓ | |

**Recomendação:** Adicionar guard para `quizzes[storyId]?.questions?.length === 0`.

---

## TrophiesScreen (Conquistas)

| Estado | Status | Detalhe |
|---|---|---|
| Loading | ✓ | Herda ProgressContext |
| Sem conquistas | ✓ | Estado vazio exibido |
| Progresso erro | ⚠ | `progressError` não consumido |
| Ação de retorno | ✓ | |

---

## ProfileScreen (Perfil)

| Estado | Status | Detalhe |
|---|---|---|
| Loading de perfil | ✓ | `loading` do ProfileContext |
| Sem nome | ✓ | Campo vazio exibido com placeholder |
| Erro de salvar nome | ✓ | `logger.log` (corrigido Sprint 17) |
| Ação de retorno | ✓ | |

---

## ParentAreaScreen (Área dos Pais)

| Estado | Status | Detalhe |
|---|---|---|
| ParentalGate (entrada) | ✓ | Desafio matemático |
| ParentalGate (link externo) | ✓ | Gate antes de Linking.openURL |
| Restore Purchase — unavailable | ✓ | **Novo Sprint 17**: botão com estados loading/unavailable |
| Reset de progresso — estados | ✓ | idle/confirm1/confirm2/done implementados |
| Erro de reset | ✓ | Alert nativo exibido |
| Link de suporte (null) | ✓ | storeUrl === null → botão de review não renderizado |
| Ação de retorno | ✓ | Botão de voltar funcional |

---

## LumiMomentScreen

| Estado | Status | Detalhe |
|---|---|---|
| Acesso negado (gratuito) | ✓ | `PremiumLockCard` exibido |
| Já feito hoje | ✓ | Botão muda para "Feito por hoje" |
| Estrela concedida | ✓ | Feedback de estrela |
| Ação de retorno | ✓ | `navigation.goBack()` |

---

## ReflectionScreen

| Estado | Status | Detalhe |
|---|---|---|
| Acesso negado | ✓ | Verificar gate implementado |
| Loading | ✓ | |
| Ação de retorno | ✓ | |

---

## Resumo de pendências

| Tela | Pendência | Prioridade |
|---|---|---|
| HomeScreen, StoriesScreen, TrophiesScreen | Consumir `progressError` e exibir estado de erro | P2 |
| QuizScreen | Guard para quiz vazio | P2 |
| StoryBookScreen | Verificar imagem de colorir null | P1 |
| Todas | `progressError` propagado visualmente ao usuário | P2 |
