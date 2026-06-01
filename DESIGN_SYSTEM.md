# DESIGN SYSTEM — Pequenos Traços de Fé

> **Lei visual do app.** Qualquer componente, tela ou animação nova deve seguir estas regras antes de ser implementado.

---

## 1. Direção Visual

O app deve sentir-se como um **livro ilustrado premium ganho vida** — caloroso, mágico, suave, com personalidade. Não é um app escolar. Não é um app genérico de criança. É um universo visual consistente que a criança reconhece e abraça.

**Palavras-chave de direção:** fofo, premium educativo, caloroso, mágico, familiar, encantador, seguro.

**O que evitar:** azul frio de apps de educação, branco clínico, flat design sem alma, emojis como único recurso visual, gradientes neon.

---

## 2. Paleta Base

| Token | Hex | Uso principal |
|---|---|---|
| `cream` | `#FFF8EF` | Fundo principal das telas |
| `creamDark` | `#FFFDF8` | Fundo de canvas de colorir |
| `white` | `#FFFFFF` | Cards, overlays |
| `gold` | `#FFD700` | Estrelas, seleção ativa, destaques de conquista |
| `goldLight` | `#FFEAA0` | Gradientes de cards, brilhos |
| `skyBlue` | `#87CEEB` | Azul céu, cards de histórias, Comece Aqui |
| `skyBlueDark` | `#2980B9` | Ações secundárias, links |
| `mint` | `#A8D5A2` | Verde claro, elementos de natureza |
| `coral` | `#FF6B6B` | Alertas amigáveis, destaques secundários |
| `orange` | `#FF8C42` | CTAs principais, botão Tentar Novamente |
| `lilac` | `#C39BD3` | Ateliê, criatividade, trilha Pequeninos |
| `deepBlue` | `#2C3E50` | Texto principal, ícones escuros |
| `softBrown` | `#C4A882` | Bordas, separadores, elementos neutros |
| `primary` | definido em `colors.js` | Cor primária do tema (usar via token) |
| `action` | definido em `colors.js` | Botões de ação principal |

### Regras de Uso de Cores
- **Fundo padrão de tela:** `cream` (#FFF8EF)
- **Fundo de canvas:** `creamDark` (#FFFDF8)
- **Texto principal:** `deepBlue` (#2C3E50)
- **Texto secundário/suave:** `#888` ou `colors.textLight`
- **Cores fortes (coral, orange, gold) apenas para:** botões de ação primária, celebrações, seleção ativa, destaques de conquista
- **Nunca usar cores fortes em:** texto corrido, fundo de tela inteira, estados neutros
- **Gradientes:** apenas em headers de seção, capas de histórias e cards com propósito visual claro

---

## 3. Tipografia

| Família | Uso |
|---|---|
| `FredokaOne` | Títulos, botões, labels de ação, nomes de histórias |
| `Nunito` | Textos descritivos, datas, instruções, parágrafos |

**Tamanhos de referência (celular):**
- Título grande: 24–28px FredokaOne
- Título de card: 16–18px FredokaOne
- Texto descritivo: 13–14px Nunito
- Label pequeno: 11–12px Nunito

**Tamanhos em tablet:** escalar proporcionalmente (+20–30%).

---

## 4. Cards

- `borderRadius`: 18–24px (cards principais), 12–16px (cards internos)
- `backgroundColor`: `colors.cardBg` (branco suave)
- `elevation`: 3–4 em Android, `shadowOpacity` 0.08–0.12 em iOS
- `shadowColor`: `#000` para sombras neutras, cor do elemento para sombras coloridas (botões)
- **Nunca** usar `border` grosso sem propósito
- Gradientes internos: apenas em cards de destaque (LinearGradient, 2–3 cores da paleta)
- Espaçamento interno: padding 16–20px

---

## 5. Botões

### Botão Primário (ação principal)
- `backgroundColor`: `colors.action` ou cor contextual
- `borderRadius`: 18–22px
- `paddingVertical`: 14–16px
- `paddingHorizontal`: 24–32px
- Sombra colorida (`shadowColor` = botão color, `shadowOpacity` 0.35–0.45)
- Texto: FredokaOne, 15–17px, branco

### Botão Secundário
- `backgroundColor`: transparente ou neutro claro
- `borderRadius`: 14–18px
- Texto: Nunito, sublinhado ou cor secundária

### Botão de Ferramenta (ícone + label)
- `width`: mínimo 60px, `height` mínimo 52px (toque fácil para crianças)
- `borderRadius`: 12–14px
- Estado ativo: `backgroundColor` amarelo/dourado (`#FFE066`)

### Regras gerais de botões
- Toque mínimo: 44×44px (WCAG mobile)
- Para crianças pequenas: preferir 52×52px+
- Nunca mostrar botão desabilitado sem visual claro do motivo
- `activeOpacity`: 0.8–0.85

---

## 6. Estados

### Bloqueado (conteúdo premium)
- Card com `opacity: 0.65` e ícone de cadeado `🔒`
- Badge "Premium" dourado no canto
- Toque abre modal suave explicando o benefício (nunca frustração agressiva)
- Texto: "Esta história é especial! Desbloqueie para explorar toda a aventura."

### Concluído
- Badge de estrela(s) preenchida(s) sobre o card
- Borda ou brilho dourado sutil
- CheckMark em verde no thumbnail

### Em progresso
- Barra de progresso suave (estrelas parciais preenchidas)
- Sem marcação de "incompleto" — mostrar o quanto foi feito, não o que falta

### Erro
- Overlay creme com ícone gentil (😕 ou Lumi triste)
- Mensagem curta e infantil
- Botão "Tentar novamente" em laranja
- Botão "Voltar" como opção secundária
- **Nunca** mostrar stack trace ou código de erro na tela da criança

### Loading
- Spinner `ActivityIndicator` em laranja (`#FF8C42`) ou animação do Lumi
- Background creme para não piscar
- Timeout: máximo 7 segundos — se não carregar, mostrar estado de erro

---

## 7. Regras para Tablet

- Espaçamento horizontal: `paddingHorizontal` mínimo 32px
- Cards em grade 2 colunas quando tela >= 600px
- Imagens de capa: máximo 480px de largura por coluna
- Texto: escalar +20–25% em relação ao celular
- Nunca deixar coluna central com conteúdo muito estreito em iPad landscape
- `SafeAreaView` obrigatório em todas as telas
- Testar em iPad mini (7.9") e iPad padrão (10.2"+)

---

## 8. Regras para Celular

- Layout single-column, sem grade
- `paddingHorizontal`: 12–16px para conteúdo, 8px para listas
- Toque em toda a linha (não só no ícone)
- ScrollView vertical com `showsVerticalScrollIndicator={false}`
- Bottom safe area sempre respeitada (`insets.bottom`)

---

## 9. Capas de Histórias (Padrão 16:9)

Todas as capas oficiais de histórias são geradas em formato **16:9 horizontal**. O app assume esse formato em Home, Aventuras e Detalhe da História.

Metadados obrigatórios por história (definidos em `stories.js`):

```javascript
{
  imagemCapa: 'key_do_asset',       // Chave em assets/images/index.js
  themeColor: '#F4B400',            // Cor principal do tema (usada no fallback)
  coverAspectRatio: 16 / 9,         // Proporção oficial — 16:9 horizontal
  coverFit: 'cover',                // Modo de encaixe — nunca 'contain'
  coverSafeArea: 'center',          // Área segura — rostos e pontos focais devem estar no centro
  coverFormat: 'story_cover_16_9',  // Tag para geração de assets (Midjourney etc.)
}
```

### Regras de Capa — Lei Obrigatória

1. **Usar `resizeMode="cover"`.** Nunca `contain` para capas narrativas.
2. **Não centralizar imagem pequena** dentro de espaço grande — a capa deve preencher toda a área.
3. **Não criar moldura decorativa falsa** (tela, quadro, papel) em volta da capa.
4. **Não usar fundo cinza** como fallback — usar `StoryFallbackCover` com `themeColor`.
5. **Proporção única: 16:9.** Toda capa nova deve ser gerada nesse formato.
6. **Área segura central.** Rostos e elementos principais devem estar centrados na imagem (serão recortados nas bordas em alguns tamanhos).
7. **Componente oficial: `StoryCoverImage`.** Nunca usar `<Image resizeMode="contain">` diretamente em capas.

### Onde a Capa Aparece

| Local | Componente | Variação |
|---|---|---|
| Home (próxima aventura) | `NextAdventureCard` → `StoryCoverImage` | 16:9 topo do card |
| Detalhe da história (mobile) | `StoryBookHero` → `StoryCoverImage` | 16:9 topo do card |
| Detalhe da história (tablet) | `StoryBookHero` → `StoryCoverImage` | 16:9 coluna direita |
| Lista de histórias (Aventuras) | `StoryCard` | Thumbnail compacto à esquerda, cover |

### StoryCoverImage — Componente Oficial

```jsx
import StoryCoverImage from '../components/story/StoryCoverImage';

// Uso básico — usa automaticamente a imagemCapa da história
<StoryCoverImage story={story} />

// Com arredondamento desabilitado (dentro de card com overflow hidden)
<StoryCoverImage story={story} rounded={false} />

// Com overlay escuro para texto por cima
<StoryCoverImage story={story} showOverlay>
  <Text>Texto por cima</Text>
</StoryCoverImage>
```

Props: `story`, `source`, `style`, `imageStyle`, `rounded` (default true), `showOverlay`, `children`, `fallbackTitle`, `fallbackIcon`.

---

## 10. Espaçamento Anti-Vazio em Tablet

Para evitar telas vazias em tablet landscape:
- Use `maxWidth: 720px` com `alignSelf: 'center'` em layouts de coluna única
- Em telas de lista, prefira grade 2×N em vez de lista vertical única
- Header de tela: adicionar hero image ou ilustração quando a tela tiver espaço
- Nunca deixar mais de 40% da tela visualmente vazio sem intenção

---

## 11. Animações

- Entradas de card: fade + slide suave (`Animated.timing`, 400–500ms, delay escalonado)
- Celebração (estrela, conquista): escala + fade (`scale 0.5→1.0`, 300ms, spring)
- Transições de tela: padrão do React Navigation (nativo)
- Lumi: animações curtas e gentis, loop suave
- **Evitar:** animações simultâneas demais, tremidas, piscar agressivo

### Modal de Celebração (`UnlockCelebration`)
- `animationType="none"` — sem fade de entrada; o modal aparece imediatamente e é tocável no primeiro frame
- `scaleAnim.setValue(0.8)` — card começa em 80% da escala (visível e tocável desde o início, não invisível)
- **Motivo:** `animationType="fade"` + `scale(0)` combinados causam ~250ms onde o botão está no DOM mas invisível/intocável, exigindo dois toques para navegar

---

## 12. Modais In-App (Custom Dialogs)

Mensagens de feedback ao usuário devem usar **modais in-app** (View overlay com `StyleSheet.absoluteFillObject`) em vez de `Alert.alert` do sistema operacional.

**Motivo:** `Alert.alert` exibe diálogo nativo do OS com tipografia e estilo fora do design system, quebrando a imersão visual do app.

### Estrutura padrão de modal in-app
```javascript
{showModal && (
  <View style={styles.dialogOverlay}>
    <View style={styles.dialogBox}>
      <Text style={styles.dialogEmoji}>🎨</Text>
      <Text style={styles.dialogTitle}>Título da mensagem</Text>
      <Text style={styles.dialogSub}>Subtítulo descritivo</Text>
      <SoundButton style={styles.dialogBtnPrimary} onPress={() => setShowModal(false)}>
        <Text style={styles.dialogBtnPrimaryText}>Tá bom! 🖌️</Text>
      </SoundButton>
    </View>
  </View>
)}
```

### Estilos padrão de dialog
- `dialogOverlay`: `absoluteFillObject`, `rgba(0,0,0,0.55)`, `justifyContent:'center'`, `zIndex:99`
- `dialogBox`: `borderRadius:28`, `padding:28`, `width:'82%'`, `backgroundColor:'#FFFAF4'`
- `dialogTitle`: FredokaOne 20px
- `dialogSub`: Nunito 14px, `lineHeight:20`
- `dialogBtnPrimary`: `colors.primary`, `borderRadius:20`, `paddingVertical:14`

### Exceções (Alert.alert ainda aceito)
- Confirmações destrutivas com "Cancelar" e "Confirmar" (`handleClearAll`, `handleStartFresh`)
- Esses fluxos têm dois botões e o padrão nativo é adequado e familiar

---

## 13. Design Tokens Canônicos — `productTheme.js`

A partir de Sprint 2.1, **novos componentes e telas devem importar tokens de `src/theme/productTheme.js`**, não de `colors.js`. O `colors.js` legado permanece válido para componentes existentes não migrados.

```javascript
import { colors as pt, radii, shadows, layout } from '../theme/productTheme';
```

| Grupo | Tokens |
|---|---|
| Cores | `pt.background`, `pt.surface`, `pt.cream`, `pt.text`, `pt.muted`, `pt.gold`, `pt.green`, `pt.blue`, `pt.purple` |
| Acesso | `pt.premiumBg`, `pt.premiumText`, `pt.freeBg`, `pt.freeText`, `pt.lockedBg`, `pt.lockedText` |
| Raios | `radii.sm(10)`, `radii.md(16)`, `radii.lg(22)`, `radii.xl(28)`, `radii.pill(999)` |
| Sombras | `shadows.card` (elevation 4), `shadows.soft` (elevation 2) |
| Layout | `layout.tabletBreakpoint(768)` |

**Regra:** Nunca hardcodar `#FFF8EF`, `#2F241D`, `#F4B400` em novos componentes — usar o token correspondente.

---

## 14. Mascote Oficial — Lumi

**Lumi** é o cordeirinho guia do app. É o único personagem que representa o app como mascote.

### Identidade
- Animal: cordeirinho (🐑)
- Tom: gentil, encorajador, caloroso
- Fallback visual: círculo creme (`#FFF3DD`) com borda dourada (`#F4B400`), emoji 🐑, badge ⭐ no canto

### Regras absolutas
- **Nunca usar** Noé, Davi, Jesus ou qualquer personagem bíblico como mascote do app
- **Nunca usar** emoji solto (🐑 ou ⭐) como solução final de mascote — usar `<LumiAvatar />`
- Lumi guia o usuário emocionalmente, não substitui conteúdo bíblico

### Componentes Lumi (`src/components/lumi/`)
| Componente | Uso |
|---|---|
| `LumiAvatar` | Avatar visual nas telas — fallback circular creme + 🐑 |
| `LumiGuideCard` | Card de orientação emocional nas telas principais |
| `LumiSpeechBubble` | Balão de fala na NarrationScreen |
| `LumiEmptyState` | Estado vazio genérico (ex.: trilha coming_soon) |
| `LumiLockedState` | Estado de conteúdo premium bloqueado |
| `LumiCelebrationBadge` | Badge de celebração dourada |

**Import:**
```javascript
import { LumiAvatar, LumiGuideCard, LumiSpeechBubble, LumiEmptyState } from '../components/lumi';
```

---

## 15. StatusBadge — Componente Centralizado de Badges

Toda badge de estado de história **deve usar `<StatusBadge />`**. Nunca criar badge ad hoc com View + Text.

```javascript
import StatusBadge from '../components/ui/StatusBadge';

<StatusBadge type="free" />       // Grátis — verde
<StatusBadge type="premium" />    // Premium — dourado
<StatusBadge type="coming_soon" /> // Em preparação — azul
<StatusBadge type="completed" />  // Concluída — verde
<StatusBadge type="in_progress" /> // Em progresso — âmbar
<StatusBadge type="locked" />     // Bloqueada — cinza creme
<StatusBadge type="saved" />      // Salvo — azul
```

**Regra:** O badge `premium` deve refletir `story.accessType`, **não** `hasAccess()`. Uma história premium com `devUnlocked=true` ainda exibe badge premium.

---

## 16. StoryFallbackCover — Capa Temática sem Arte Real

Para histórias sem `imagemCapa` ou em status `coming_soon`, **usar `<StoryFallbackCover />`**. Nunca usar `backgroundColor: colors.locked` ou qualquer cinza como fallback.

```javascript
import StoryFallbackCover from '../components/story/StoryFallbackCover';

<StoryFallbackCover
  title={story.titulo}
  themeColor={story.themeColor ?? '#F4B400'}
  icon={story.emoji ?? '✨'}
  status={story.status}       // mostra badge coming_soon no canto
  accessType={story.accessType}
  compact                     // versão quadrada para cards pequenos
/>
```

**Regra:** A capa usa `themeColor + opacidade` como fundo — nunca cinza.

---

## 17. StoryBookHero — Hero de Detalhe da História

Na `StoryDetailScreen`, usar `<StoryBookHero />` para o hero da história.

- **Tablet:** layout 2 colunas (info ~60% esquerda, livro ~40% direita)
- **Herofit `contain`:** imagem de capa sem corte (`resizeMode='contain'`)
- **Fallback:** `StoryFallbackCover` quando sem `imagemCapa`
- **Nunca:** cortar rosto/corpo na capa em nenhum breakpoint

---

## 18. Regras de Placeholder — Nunca Bloco Cinza

A partir de Sprint 2.1, **blocos cinzas de placeholder são proibidos**.

| Situação | Solução correta |
|---|---|
| História sem imagem de capa | `StoryFallbackCover` com `themeColor` |
| Trilha coming_soon | `LumiEmptyState` |
| Conteúdo premium bloqueado | `LumiLockedState` |
| Coming-soon em catalog | `CatalogCard` com `StoryFallbackCover` |

Cor `colors.locked` (`#D8D0C8`) **não deve aparecer** em fundos de cards ou capas de conteúdo.
