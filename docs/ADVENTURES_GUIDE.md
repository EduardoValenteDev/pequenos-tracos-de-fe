# ADVENTURES_GUIDE — Sprint 10

**Última atualização:** Sprint 10 (2026-05-26)

---

## 1. Propósito

Este guia documenta a arquitetura e as regras de design da tela **Aventuras** (StoriesScreen), rebatizada de "Estante de Histórias" a partir do Sprint 10. Destinatário: desenvolvedor que vai manter ou evoluir essa tela.

---

## 2. Conceito visual

A tela Aventuras tem identidade infantil de **Estante de Histórias**:

- Título principal: "Estante de Histórias"
- Subtítulo inspirador: "Qual aventura vai abrir hoje?"
- Chips de trilha com ícone FaithIcon + nome + descrição curta + badge de acesso
- Cards de história com capa 16:9 (grande área visual) e info abaixo

---

## 3. Trilhas (CATEGORIES)

| ID | Label | FaithIcon | Acesso |
|---|---|---|---|
| `comece` | Comece Aqui | `star` | Grátis |
| `pequeninos` | Pequeninos | `heart` | Especial da Família |
| `descobridores` | Descobridores | `bible` | Especial da Família |
| `jovens_da_fe` | Jovens da Fé | `trophies` | Especial da Família |

### Comportamento dos chips

- Chip selecionado: `pt.goldSoft` de fundo, borda dourada, texto `pt.premiumText`
- Chip bloqueado (`available: false`): `opacity: 0.65`, mostra ícone `lock`
- Ao trocar trilha: o chip ativo centraliza no ScrollView horizontal
- Ao trocar trilha: a lista de histórias rola para o topo da tela

### Centralização do chip ativo

Implementado via `chipLayouts` ref (objeto `{ [catId]: { x, width } }`) coletado via `onLayout` em cada chip. Um `useEffect` em `[activeCategory]` chama:

```js
chipScrollRef.current.scrollTo({ x: Math.max(0, layout.x + layout.width/2 - screenWidth/2) });
```

---

## 4. Catálogo de histórias

O catálogo usa `src/data/catalog.js` como fonte de verdade, não as `stories` diretamente. Entradas podem ser `type: 'story'` (historia ativa/coming_soon) ou `type: 'placeholder'` (história planejada não cadastrada ainda).

```js
const CATALOG = {
  comece: [
    { type: 'story', storyId: 'creation' },
    { type: 'story', storyId: 'noah' },
  ],
  // ...
};
```

A função `getCatalogEntries(categoryId, storyMap)` resolve IDs para objetos de história.

---

## 5. Layout dos cards (StoryCard)

A partir do Sprint 10, `StoryCard` usa layout vertical:

```
┌─────────────────────────────┐
│          cover              │
│     aspectRatio: 16/9       │
├─────────────────────────────┤
│  titulo (FredokaOne 16)     │
│  referencia (Nunito 12)     │
│  [StatusBadge]              │
│  [barra de progresso]       │
└─────────────────────────────┘
```

### Regras do cover

- `width: '100%'` + `aspectRatio: 16/9`
- Quando há `imagemCapa`: renderiza `<Image resizeMode="cover" />`
- Quando não há capa: renderiza `<StoryFallbackCover>` com emoji + themeColor + título

### Placeholder infantil

`StoryFallbackCover` gera um fundo colorido com o emoji da história centralizado. Para histórias sem capa real, isso cria uma identidade visual infantil e colorida.

### Não reverter para layout horizontal

**Não mudar** `StoryCard` de volta para `flexDirection: 'row'` com `cover.width: 96`. O layout 16:9 vertical é o padrão do app a partir do Sprint 10.

---

## 6. Linguagem em áreas infantis

| Proibido | Correto |
|---|---|
| "Premium" | "Especial da Família" |
| "Plano Familiar" | "Especial da Família" (crianças) ou "Plano Família" (pais) |

Os chips de trilha premium mostram "Especial da Família" (não "Premium").

---

## 7. Proteções críticas

| O que não alterar | Motivo |
|---|---|
| `StoryDetailScreen` | Tela detalhada de história — tem sua própria arquitetura |
| `StoryBookScreen` | Livrinho — arquitetura de auto-advance separada |
| `ProgressContext` | Fonte única de progresso — não criar useProgress adicionais |
| `rewardService` | Fonte única de estrelas — não duplicar cálculos |
| `ColoringCanvas` / `AtelierCanvas` | Motores de pintura — não tocar |

---

## 8. Progresso

`StoriesScreen` usa `useProgressContext()` para obter `progressByStory`. Não usar `useProgress(storyId)` (hook legado) em StoriesScreen.

```js
const { progressByStory } = useProgressContext();
function getCount(storyId) {
  return Object.values(progressByStory[storyId] || {}).filter(Boolean).length;
}
```

---

## 9. Scroll to top

Quando o usuário troca de trilha, a lista de histórias rola para o topo via:

```js
useEffect(() => {
  outerScrollRef.current?.scrollTo({ y: 0, animated: false });
}, [activeCategory]);
```

O scroll é `animated: false` para ser instantâneo e não confundir o usuário.

---

## 10. Checklist de validação antes de alterar StoriesScreen

- [ ] `useProgressContext()` é usado (não `useProgress`)
- [ ] Chips têm `onLayout` para tracking de posição
- [ ] `chipScrollRef.current.scrollTo` é chamado no `useEffect [activeCategory]`
- [ ] `outerScrollRef.current.scrollTo({ y: 0 })` é chamado no `useEffect [activeCategory]`
- [ ] "Especial da Família" aparece nos chips premium (não "Premium")
- [ ] ENABLE_LOCAL_PREMIUM_TEST_MODE permanece false
- [ ] StoryCard tem `aspectRatio: 16/9` na capa
