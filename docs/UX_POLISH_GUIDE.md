# UX_POLISH_GUIDE — Sprint 13

**Última atualização:** Sprint 13 (2026-05-27)

---

## 1. Safe Area — regras de uso

O app usa `react-native-safe-area-context` via `useSafeAreaInsets()`. As regras abaixo definem onde aplicar cada inset.

### Quando NÃO usar `insets.top` no conteúdo

Em telas dentro de um **Stack navigator com header nativo visível**, o header já absorve o inset de topo. Aplicar `paddingTop: insets.top` dentro do conteúdo cria espaço em branco duplo.

**Exemplo incorreto (antes da Sprint 9):**
```jsx
// ParentAreaScreen — Stack screen com header "Área dos Pais"
<LinearGradient style={[styles.header, { paddingTop: Math.max(insets.top, 24) }]}>
```

**Exemplo correto:**
```jsx
<LinearGradient style={styles.header}>  {/* paddingTop: 24 fixo no StyleSheet */}
```

### Quando usar `insets.top`

- Telas de **tab** com `headerShown: false` (sem header nativo acima).
- Overlays ou modals que cobrem toda a tela por cima da navegação.
- Componente `AppScreen` com `applyTopInset={true}` (telas headless).

### Quando usar `insets.bottom`

Sempre que houver conteúdo rolável ou botões fixos que precisam ficar acima da home bar do iPhone / barra de navegação Android.

---

## 2. AppScreen — wrapper padronizado

`src/components/layout/AppScreen.js` é o wrapper oficial de Safe Area para novas telas.

| Prop | Tipo | Default | Uso |
|---|---|---|---|
| `children` | node | — | Conteúdo |
| `backgroundColor` | string | `pt.background` | Cor de fundo |
| `scroll` | bool | `false` | Envolve em ScrollView |
| `contentContainerStyle` | style | — | Passado para ScrollView |
| `style` | style | — | Style extra no container |
| `noBottomPadding` | bool | `false` | Remove padding inferior seguro |
| `applyTopInset` | bool | `false` | Aplica paddingTop do inset (só headless) |

**Quando usar `applyTopInset={true}`:** apenas em telas sem Stack header nativo (tabs, telas flutuantes). Stack screens com header ativo **nunca** devem usar esta prop.

---

## 3. FaithIcon — sistema de ícones vetoriais

`src/components/ui/FaithIcon.js` é o wrapper semântico sobre `@expo/vector-icons` (Ionicons).

### Nomes semânticos disponíveis

| Nome | Ionicons | Uso |
|---|---|---|
| `home` | home | Tab Início |
| `adventures` | book | Tab Aventuras |
| `atelier` | color-palette | Tab Ateliê |
| `trophies` | trophy | Tab Troféus |
| `profile` | person-circle | Tab Perfil |
| `bible` | book-outline | Referência bíblica |
| `star` | star | Estrela/progresso |
| `lock` | lock-closed | Conteúdo bloqueado |
| `heart` | heart | Favorito/amor |
| `paint` | brush | Pintura/desenho |
| `gallery` | images | Galeria de artes |
| `parent` | people | Área dos Pais |
| `lumi` | sparkles | Lumi IA |
| `play` | play-circle | Reproduzir |
| `back` | chevron-back | Voltar |
| `close` | close | Fechar |
| `check` | checkmark-circle | Concluído |
| `family` | people-circle | Família/premium |

### Uso

```jsx
import FaithIcon from '../components/ui/FaithIcon';

<FaithIcon name="lock" size={32} color={pt.muted} />
<FaithIcon name="star" size={20} color={pt.gold} />
```

### Nunca usar emojis como ícones principais de UI

Emojis não são acessíveis, têm tamanho inconsistente entre plataformas e não recebem cores via código. Use `FaithIcon` para todos os ícones funcionais de interface.

**Exceções permitidas:** emojis decorativos dentro de cards de conteúdo, mensagens de motivação, avatares de personagens.

---

## 4. ParentalGate — especificações

O componente `src/components/ParentalGate.js` exige um cálculo de multiplicação antes de qualquer ação adulta.

### Regras da operação

| Parâmetro | Valor |
|---|---|
| Primeiro fator | 6 a 12 (Math.random * 7 + 6) |
| Segundo fator | 4 a 12 (Math.random * 9 + 4) |
| Botão confirmar | "Entrar" |
| Texto de erro | "Resposta incorreta. Tente novamente." |
| Erro visível como | Texto vermelho (não apenas borda vermelha) |
| Ícone principal | Nenhum emoji como ícone de UI |

### Por que aumentar os fatores?

Fatores 2–10 permitem operações muito simples (2×2=4) que uma criança pode resolver por acidente. Faixa 6–12 × 4–12 garante que apenas um adulto com habilidade de multiplicação de múltiplos dígitos consiga passar.

---

## 5. Linguagem em áreas infantis

### Regra geral

"Premium" é terminologia técnica/comercial não adequada para o contexto de uma criança de 4 a 8 anos. Em áreas acessíveis pela criança, usar a linguagem afetiva do produto.

| Onde | Antes (proibido) | Depois (correto) |
|---|---|---|
| Badge de mundo bloqueado (HomeScreen) | "Premium" | "Especial da Família" |
| Badge Lumi (HomeScreen) | "💎 Plano Familiar" | "Especial da Família" |
| Botão primário de história bloqueada | "💎 Ver Plano Familiar" | "Pedir ao responsável" |
| Card Lumi no PostStoryHub (bloqueado) | "💎 Premium" | "Especial da Família" |
| Desc de card Lumi no PostStoryHub (bloqueado) | "Atividade do Plano Familiar" | "Atividade Especial da Família" |
| Modal de limite do Ateliê | "peça para um adulto ver o Plano Familiar" | "peça a um responsável" |
| PremiumLockCard default title | "Essa aventura está guardada no Plano Familiar" | "Essa aventura é Especial da Família" |
| LockedStoryFallback default title | "está guardada no Plano Familiar" | "é Especial da Família" |
| LockedStoryFallback botão chamar | "👨‍👩‍👧 Chamar responsável" | "Chamar responsável" |
| contentAccessService locked label | "💎 Ver Plano Familiar" | "Pedir ao responsável" |
| contentAccessService getLockedStoryMessage | "faz parte do Plano Familiar" | "é Especial da Família" |
| StatusBadge premium defaultLabel | "Premium" | "Especial da Família" |

### Áreas de adultos (exceção)

Na **Área dos Pais** (`ParentAreaScreen`) a linguagem técnica é adequada: "Plano Família". Pais precisam de terminologia clara para decisões de compra. O termo correto é **"Plano Família"** (não "Plano Familiar" nem "Plano Familiar Premium").

| Forma | Status |
|---|---|
| "Plano Família" | ✓ Correto — usar em ParentAreaScreen |
| "Plano Familiar" | ✗ Proibido em todo o código |
| "Plano Familiar Premium" | ✗ Proibido — foi substituído por "Plano Família" |

---

## 6. ProfileScreen — área da criança vs. área de adultos

### Regra

`ProfileScreen` é acessada pela criança diretamente via tab. O bloco de adultos deve conter **apenas** o acesso à Área dos Pais. Ações adultas (plano, feedback, e-mail) pertencem à `ParentAreaScreen`.

### Bloco de adultos correto

```jsx
<AdultCard
  emoji="👨‍👩‍👧"
  title="Área dos Pais"
  desc="Acompanhe o progresso e gerencie o perfil."
  tint="#EFF8FF"
  onPress={() => navigation.navigate('ParentArea')}
/>
```

**Removidos na Sprint 9:** "Meu Plano" e "Enviar Feedback". Ambos estão disponíveis dentro da Área dos Pais com o gate de multiplicação.

---

## 7. Sprint 9.1 — Onde FaithIcon foi aplicado

Componentes e telas que usam `FaithIcon` após Sprint 9.1:

| Local | Nome semântico | Substituiu |
|---|---|---|
| AppNavigator — tabs | `home`, `adventures`, `atelier`, `trophies`, `profile` | Emojis 🏠📚🎨🏆👤 |
| PremiumLockCard — ícone principal | `lock` | Emoji `💎` |
| LockedStoryFallback — ícone principal | `lock` | Emoji `🔒` |
| TrophiesScreen — header | `trophies` | Emoji `🏆` |
| TrophiesScreen — achievements bloqueados | `lock` | Emoji `🔒` |

---

## 8. Safe Area — aplicação em StoriesScreen

`StoriesScreen` é usada como **tab** (headerShown: false) E como rota Stack "Stories" (tem header nativo). A solução escolhida aplica `insets.top` em ambos os casos:

```jsx
contentContainerStyle={{
  paddingTop: insets.top + 16,
  paddingBottom: insets.bottom + 48,
}}
```

No contexto de Stack com header nativo, cria padding extra pequeno — aceitável porque o header já cria separação visual suficiente. O caso primário (tab) fica correto.

---

## 9. Sprint 9.2 — Preenchimento e qualidade visual

### Flood fill com dois thresholds

`ColoringCanvas.js` usa dois limites distintos para o BFS:

| Função | Threshold | Uso |
|---|---|---|
| `isBarrier(r,g,b,a)` | `lum < 230` | Rejeição do toque inicial — impede fill em cima de linhas |
| `isBFSBarrier(r,g,b,a)` | `lum < 210` | Barreira do BFS durante expansão — mais permissivo |

O `isBFSBarrier` mais permissivo deixa o BFS pintar os pixels de fringe (lum 210–229) que estão na transição anti-aliased entre a cor sólida da linha e o fundo. Esses pixels, ao serem composited com multiply sobre a lineart, aparecem como a cor certa em vez de bege. Resultado: **sem falhas brancas** nas bordas.

**Não alterar os valores 230 e 210** sem reavaliação — estão calibrados para linha art com linhas pretas sólidas.

### Paleta de cores compartilhada

`src/constants/colorPalette.js` é a única fonte de verdade. Não criar paleta inline em telas.

### drawStamp com glifo centrado

`AtelierCanvas.drawStamp` usa `TextMetrics.actualBoundingBoxLeft/Right/Ascent/Descent` para posicionar o emoji exatamente no centro visual `(s.x, s.y)`. Não reverter para `textAlign='center' / textBaseline='middle'` — aquele método era impreciso para emoji com variation selectors.

---

## 10. O que NÃO fazer

| Proibido | Motivo |
|---|---|
| `paddingTop: Math.max(insets.top, N)` dentro de Stack screen com header | Cria overlay vazio no topo em iPhone |
| `paddingTop: insets.top` em Stack screen com header | Mesmo problema |
| Usar emoji como ícone funcional de UI (`🔐`, `💎`, `🔒`) | Inacessível, inconsistente entre plataformas |
| `accessLabel: 'Premium'` em WORLDS do HomeScreen | Linguagem técnica em área infantil |
| "Ver Plano Familiar" em botões visíveis pela criança | Converte linguagem comercial em UI infantil |
| "Plano Familiar" em qualquer string de código | Forma antiga/incorreta — usar "Plano Família" (adultos) ou "Especial da Família" (crianças) |
| Expor "Enviar Feedback" ou "Meu Plano" no ProfileScreen | Ações adultas em área infantil |
| Fator de multiplicação 2×2 no ParentalGate | Criança pode resolver por acidente |
| Alterar `isBarrier` threshold (230) | Impede fill em cima de linhas |
| Alterar `isBFSBarrier` threshold (210) sem reavaliação | Pode vazar cor para fora da área |
| Usar `textAlign='center'` para emoji em canvas | Variation selectors inflam `measureText.width` |
| Criar paleta inline em `ColoringScreen` ou `AtelierCanvasScreen` | Quebra unificação |
| Usar emoji como `icon` prop em `ToolBtn` de ColoringScreen | Sprint 9.3 migrou para `iconName` + FaithIcon |
| Remover `lineTipTimerRef` cleanup do useEffect | Vazamento de timer em unmount |
| Expor `FILL_REJECTED` sem throttle de 2s | Spam de mensagens em taps rápidos |

---

## 11. Sprint 9.3 — Coloring UX: ferramentas, zoom e feedback tátil

### FaithIcon — novos ícones de ferramentas de colorir

`FaithIcon.js` recebeu 5 novos nomes semânticos para as ferramentas da tela de colorir:

| Nome semântico | Ionicons | Uso |
|---|---|---|
| `erase` | `backspace-outline` | Borracha — ativa modo de apagar |
| `undo` | `arrow-undo` | Desfazer último preenchimento |
| `clear` | `trash` | Limpar toda a pintura |
| `zoom_in` | `search` | Ampliar — zoom in 1.5× centrado |
| `zoom_reset` | `scan` | Enquadrar — reset zoom para 1:1 |

### Barra de ferramentas de colorir (5 botões)

`ColoringScreen` passou de 4 para 5 botões:

| Botão | Antes | Depois |
|---|---|---|
| Borracha | 🧹 Apagar | `erase` Borracha |
| Desfazer | ↩️ Desfazer | `undo` Desfazer |
| Limpar | 🗑️ Limpar | `clear` Limpar |
| Ampliar | — | `zoom_in` Ampliar (novo) |
| Enquadrar | 🔍 Zoom ↺ | `zoom_reset` Enquadrar |

Para caber 5 botões: `toolBtn` reduzido para `paddingHorizontal: 8, minWidth: 52`.

**Confirmação manual antes de Limpar está intacta** — `handleClearAll` usa `Alert.alert` com botão destrutivo.

### window.zoomIn — API de zoom do canvas

`ColoringCanvas` expõe `window.zoomIn` que amplia 1.5× em relação ao centro do canvas, clampeado em `maxScale=3`:

```js
window.zoomIn = function() {
  var ns = Math.min(maxScale, scale * 1.5);
  if (ns === scale) return;
  var cx = W/2, cy = H/2;
  tx = cx - (cx - tx) * (ns / scale);
  ty = cy - (cy - ty) * (ns / scale);
  scale = ns; clamp(); show();
};
```

O `useImperativeHandle` expõe `zoomIn()` para que `canvasRef.current?.zoomIn()` funcione.

### FILL_REJECTED — feedback quando toca em linha

Quando o BFS rejeita um toque por `isBarrier` (usuário tocou em cima de uma linha), o WebView envia `FILL_REJECTED` para o React Native. A mensagem é throttled a 1 vez a cada 2s via `lastFillRejectedAt`.

`ColoringCanvas` aceita prop `onFillRejected` e a chama ao receber a mensagem.

`ColoringScreen` exibe um toast `lineTip` por 2,5s com o texto:
> "Toque dentro de uma parte branca para colorir"

O toast tem `pointerEvents="none"` para não bloquear toques. O timer é limpo no unmount via `lineTipTimerRef`.

### Posicionamento do lineTip

O toast é posicionado com `bottom: 154 + insets.bottom` para ficar acima do painel inferior independente do dispositivo (com ou sem home bar do iPhone).

---

## 12. Sprint 10 — Aventuras como Estante de Histórias

### Conceito da tela

A aba Aventuras tem identidade infantil de **"Estante de Histórias"**. Header com:
- Título: "Estante de Histórias" (FredokaOne 24)
- Subtítulo: "Qual aventura vai abrir hoje?" (Nunito 14)

### Chips de trilha redesenhados

Cada chip exibe verticalmente: ícone `FaithIcon` + nome + descrição curta + badge de acesso.

| Trilha | FaithIcon | Acesso |
|---|---|---|
| Comece Aqui | `star` | Grátis |
| Pequeninos | `heart` | Especial da Família |
| Descobridores | `bible` | Especial da Família |
| Jovens da Fé | `trophies` | Especial da Família |

### Centralização automática do chip ativo

`chipLayouts` ref rastreia posição de cada chip via `onLayout`. Um `useEffect` em `[activeCategory]` centraliza o chip ativo no scroll horizontal.

### Scroll to top na troca de trilha

Um `useEffect` em `[activeCategory]` chama `outerScrollRef.current?.scrollTo({ y: 0, animated: false })`.

### StoryCard — layout 16:9

`StoryCard` foi migrado de layout horizontal (cover 96px) para layout vertical com capa `aspectRatio: 16/9` no topo e info abaixo. **Não reverter** para layout horizontal.

### Linguagem

Os chips premium exibem "Especial da Família" (não "Premium"). Ver Seção 5 para regras completas.

---

## 13. Sprint 11 — Home, Lumi e Minhas Estrelinhas

### HomeScreen — Bloco "Continuar minha aventura"

O bloco primário da Home agora responde a 4 cenários via `getHomePrimaryAction` (função pura em `src/services/homeService.js`):

| Cenário | Condição | UI |
|---|---|---|
| A | Sem progresso (`totalStars === 0`) | `startInviteCard` — convite para primeira aventura |
| B | História em andamento | `continueCard` — barra de progresso + "▶ Continuar" |
| C | Recompensas pendentes | `pendingRewardsCard` — "🎁 Você tem recompensas..." |
| D | Nenhum dos anteriores | `NextAdventureCard` (próxima) ou `allDoneCard` (todas completas) |

Ver [HOME_LUMI_STARS_GUIDE.md](HOME_LUMI_STARS_GUIDE.md) para documentação completa.

### TrophiesScreen → "Minhas Estrelinhas"

- **Tab:** "Conquistas" → "Estrelinhas" (AppNavigator + TabletSidebar)
- **Título:** "Conquistas" → "Minhas Estrelinhas"
- **Ícone do header:** FaithIcon `star` (antes: `trophies`)
- **Conquistas bloqueadas:** emoji da conquista com `opacity: 0.28` — sem ícone de cadeado
- **Dicas de progresso:** conquistas com `progressLabel` exibem "X de Y cenas" quando bloqueadas

### Varredura de linguagem Sprint 11

| Arquivo | Mudança |
|---|---|
| `achievements.js` | "Primeiro passo premium" → "Primeira aventura especial" |
| `achievements.js` | "trilha Premium" → "trilha Especial da Família" |
| `NextAdventureCard.js` | Badge "Premium" → "Especial da Família" |
| `LumiLockedState.js` | "plano premium" → "Plano Família" |

### Regra final de linguagem

| Contexto | Termo |
|---|---|
| Qualquer tela vista pela criança | "Especial da Família" |
| Área dos Pais | "Plano Família" |
| Proibido em qualquer área | "Premium", "Plano Familiar" |

---

## 14. Sprint 13 — Estados vazios e ausência de mídia

### ProfileScreen — nome padrão
Nome de fallback alterado de `"Pequeno explorador"` para `"Pequeno artista"` — reforça a identidade criativa do app.

### NarrationScreen — ausência de áudio
Quando nenhum áudio real está disponível para a cena, exibe aviso suave no lugar do player:

> 🔇 O som desta cena será adicionado depois. Você pode ler com calma.

Estilo `noAudioHint`: fundo roxo claro, borda roxa à esquerda, texto itálico discreto. Nunca exibe player sem áudio real.

### TrophiesScreen — estado vazio (zero conquistas)
Quando `unlockedCount === 0`, exibe mensagem motivacional abaixo da lista:

> ⭐ Pinte sua primeira cena para acender a primeira estrelinha!

Fundo `#FFFBF0`, borda dourada `#F4B400`. Coerente com a paleta de estrelas.

### Regra geral de estados vazios
Ver `docs/MEDIA_PLACEHOLDER_GUIDE.md` para guia completo de textos permitidos e proibidos em cada área do app.
