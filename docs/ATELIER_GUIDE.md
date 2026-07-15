# ATELIER_GUIDE

**Última atualização:** Criar Livre CF — bloco de encerramento (2026-07-15)

> ⚠️ **Precedência das seções.** A **Seção 0 (Criar Livre CF)** descreve o estado
> ATUAL e APROVADO do "Criar livre" e da galeria "Meus desenhos". As seções 1–13
> a seguir são **históricas (Sprint 9.2)** e permanecem para rastreabilidade —
> onde conflitarem com a Seção 0, **vale a Seção 0**. Em especial estão
> **SUPERADOS**: limite gratuito 3 (hoje é 0), UI de carimbos/stickers, painel por
> abas, ícones em emoji e miniatura base64 no índice (hoje `file://`).

---

## 0. Criar Livre CF — estado de fechamento (2026-07-15)

Blocos C1 (redesenho premium) → C1.1 (correções de slider/borracha/nome/paletas) →
**CF (consolidação, regressão, limpeza, fechamento)**. Validado no aparelho e
aprovado pelo proprietário. **Nenhuma funcionalidade nova nesta etapa.**

### 0.1 Conclusão
- **Criar livre** concluído: cabeçalho compacto, papel protagonista, barra fixa de
  6 controles (Cor · Pincel · Apagar · Desfazer · Refazer · Mais) e painéis
  contextuais que **sobrepõem** o papel (nunca redimensionam o canvas).
- **Galeria "Meus desenhos"** concluída: lista, viewer em tela cheia, exclusão
  com confirmação, nomes de exibição sempre válidos.

### 0.2 Arquitetura
| Camada | Arquivo | Papel |
|---|---|---|
| Tela | `src/screens/AtelierCanvasScreen.js` | Casca premium, histórico, saída, salvamento |
| Motor | `src/components/AtelierCanvas.js` | WebView + canvas 2D; traços vetoriais; borracha real |
| Galeria | `src/screens/AtelierGalleryScreen.js` | Cards, viewer, exclusão |
| Slider | `src/components/criarLivre/CriarLivreSlider.js` | Espessura estável (coordenada absoluta) |
| Ícones | `src/components/criarLivre/CriarLivreIcon.js` | SVG (react-native-svg), sem emoji |
| Tokens | `src/theme/createLivreVisualTokens.js` | Métricas, cores, durações, paletas, presets |
| Nomes | `src/services/atelierArtNaming.js` | Nomes únicos e amigáveis (puro) |
| Orientação | `src/services/criarLivreOrientation.js` | Dica inicial (uma vez por perfil) |
| Storage | `src/services/atelierStorage.js` | Persistência das artes |

A ferramenta ativa tem **fonte única** na tela (`tool = 'draw' | 'eraser'` + refs de
cor/pincel/borracha) e é enviada ao motor por **injeção atômica** `window.applyTool({tool,color,brush,eraser})`.
Isso elimina estados intermediários entre ferramenta e tamanho. Painéis são
**overlays absolutos** com `key` estável do canvas → **o canvas nunca remonta**.

### 0.3 Modelo de armazenamento das artes
- Chaves legadas (NÃO renomear): índice `ptf_atelier_arts_v1_index`; arte completa
  `ptf_atelier_arts_v1_{id}`.
- Blobs grandes (preview full-res + thumbnail) vão para **arquivos** (`writeBlob` →
  `previewUri`/`thumbnailUri` = `file://`); o AsyncStorage guarda ponteiros + `stateJson`
  leve. Fallback inline `previewBase64`/`thumbnailBase64` só quando a escrita em arquivo falha.
- Campos: `{ id, title, mission, createdAt, updatedAt, schema, stateJson, previewUri }`
  (completo) e `{ id, title, createdAt, updatedAt, schema, thumbnailUri }` (índice).
- **`createdAt` é preservado ao atualizar** a mesma arte; **`updatedAt`** reflete a
  última modificação (corrigido no CF — antes `createdAt` era resetado a cada save).
- **`id` único e estável** por arte (`art_{ts}_{rand}`); update reusa o mesmo `id`,
  sobrescrevendo os mesmos arquivos (sem órfãos).
- `deleteArt(id)` remove **só** a arte alvo (índice + blobs); as demais permanecem.

### 0.4 Convenção de nomes (`atelierArtNaming.js`)
- Campo oficial único: **`title`**.
- Nome vazio → base **"Desenho de fé"**, depois "Desenho de fé 2", "3", …
- Nome digitado que já existe (normalizado) → menor sufixo livre ("Meu desenho 2", …),
  usando o **maior** sufixo existente + 1.
- Duplicidade por nome **normalizado**: ignora caixa, espaços nas pontas, espaços
  duplicados e normalização Unicode (NFC).
- `displayTitle(title)` garante nome de exibição válido (nunca vazio/undefined/null).

### 0.5 Compatibilidade com artes antigas
- Exibição: a galeria usa `displayTitle()` — nenhuma arte aparece sem nome, com
  `undefined`, `null` ou vazio.
- Persistência: migração **v3** `migrateArtTitles()` (schema `APP_STORAGE_SCHEMA_VERSION = 3`,
  registrada no runner) **só preenche** títulos vazios com um nome único; **idempotente**
  (2ª execução não muda nada) e **não destrói** outros metadados.

### 0.6 Fluxo de salvamento
- **1º salvamento de desenho novo:** abre o painel "Nomeie seu desenho"
  (`KeyboardAvoidingView` — teclado não cobre campo/botões); vazio → nome automático.
- **Salvamentos seguintes na mesma sessão:** atualizam a **mesma** arte (a tela
  aprendeu o `id`); **não** re-perguntam nome e **não** criam cópia.
- `savingRef` bloqueia duplo toque; papel vazio não salva; erro mantém o desenho
  (painel "Tentar de novo").
- Acesso: no **Plano Grátis** salvar é bloqueado (`ATELIER_FREE_SAVE_LIMIT = 0`) com
  convite gentil ao **Plano Família** (`hasAtelierUnlimitedAccess()`); premium salva sem limite.

### 0.7 Paletas e pincel/borracha
- Paletas organizadas (`ORGANIZED_PALETTES`): **Essenciais** (as 18 cores aprovadas,
  intactas) + **Pastéis**, **Natureza**, **Terra e pele** (~12 cada). Seletor
  horizontal; **trocar de paleta não altera a cor selecionada**; "Recentes" (≤5, em
  memória); toda cor tem rótulo PT-BR.
- **Pincel:** presets Fino/Médio/Grosso + slider contínuo; prévia real do traço.
- **Borracha:** apagamento **real** (`globalCompositeOperation='destination-out'`);
  tamanho **independente** do pincel; voltar ao pincel restaura o tamanho anterior;
  escolher cor sai da borracha; nenhum movimento cria traço colorido com Apagar ativo.
- O traço captura **tool/cor/tamanho no início** — mudar depois não altera traços já feitos.

### 0.8 Slider estável
Coordenada **absoluta** de tela (`measureInWindow` da trilha + `pageX`/`moveX`),
`clamp` min/max, `PanResponder` criado **uma vez** (lê config por ref). Guardas de
terminação (`onPanResponderTerminationRequest: false`, `onShouldBlockNativeResponder: true`)
→ **o painel não fecha durante o gesto** e presets **não fecham** o painel.

### 0.9 Limitações técnicas conhecidas
- O motor é uma **WebView** (canvas 2D), não nativo/Skia — redimensionar a WebView
  reiniciaria o desenho (por isso painéis são overlays, nunca redimensionam o papel).
- Base64 é usado apenas de forma **transitória** no pipeline de exportação; a
  persistência é por `file://`.
- "Recentes" é apenas em memória (não persiste entre sessões — por decisão).
- Dois locais definem o limite gratuito (0) — `atelierStorage` e `accessControl`;
  devem permanecer iguais.

### 0.10 Possibilidades futuras (sem compromisso de implementação)
- **Pincéis alternativos** (Canetinha/Lápis suave/Marca-texto) — proposta C1.2.
- **Carimbos/adesivos** — fora do escopo atual (não implementar sem decisão de produto).
- **Migração para Skia** — apenas hipótese; exigiria spec própria e regressão ampla.

Estes itens são **possibilidades**, não pendências obrigatórias deste bloco.

---

## 1. Como o Ateliê funciona

O Ateliê da Criação é uma área de desenho livre do app. A criança pode:

- Abrir uma **folha em branco** (Minha Folha Mágica) e criar livremente.
- Receber um **Desafio da Imaginação** — ideia aleatória para inspirar o desenho.
- Acessar a **Galeria dos Pequenos Artistas** para ver, abrir, editar ou apagar artes salvas.

O Ateliê funciona **100% offline** — sem backend, sem login, sem sincronização em nuvem.

### Telas envolvidas

| Tela | Arquivo | Função |
|---|---|---|
| Hub do Ateliê | `src/screens/AtelierScreen.js` | Cards de entrada |
| Canvas de desenho | `src/screens/AtelierCanvasScreen.js` | Desenhar, salvar |
| Galeria | `src/screens/AtelierGalleryScreen.js` | Listar, visualizar, apagar |
| Canvas (componente) | `src/components/AtelierCanvas.js` | WebView canvas livre |

---

## 2. Onde e como os desenhos são salvos

### Storage do Ateliê (`src/services/atelierStorage.js`)

Os desenhos do Ateliê são persistidos via **AsyncStorage** em dois tipos de chave:

| Chave | Dados | Descrição |
|---|---|---|
| `ptf_atelier_arts_v1_index` | JSON array de metadados | Índice de todas as artes salvas (id, title, createdAt, updatedAt, thumbnailBase64) |
| `ptf_atelier_arts_v1_{id}` | JSON objeto completo | Arte completa: id, title, mission, createdAt, updatedAt, stateJson |

### Formato salvo

```js
// Metadado no índice
{ id, title, createdAt, updatedAt, thumbnailBase64 }

// Arte completa (chave individual)
{ id, title, mission, createdAt, updatedAt, stateJson }
```

- **`stateJson`**: JSON com `{ v: 2, strokes: [...], stamps: [...], bgColor: string }` — estado completo do canvas para reabrir e editar.
- **`thumbnailBase64`**: JPEG 300px em base64 (`data:image/jpeg;base64,...`) — miniatura gerada pelo canvas para exibição na galeria e no viewer.

### Funções exportadas

| Função | Uso |
|---|---|
| `listArts()` | Retorna array de metadados do índice |
| `getArt(id)` | Retorna arte completa (com stateJson) |
| `getArtCount()` | Retorna número de artes salvas |
| `saveArt({ artId, title, mission, stateJson, thumbnailBase64 })` | Salva ou sobrescreve arte |
| `deleteArt(id)` | Remove arte do índice e da chave individual |
| `ATELIER_FREE_SAVE_LIMIT` | Constante = 3 (limite gratuito) |

---

## 3. Diferença entre desenho do Ateliê e desenho de cena da história

**São storages completamente separados e independentes.**

| | Ateliê livre | Cena da história |
|---|---|---|
| Service | `atelierStorage.js` | `drawingStorage.js` |
| Chave | `ptf_atelier_arts_v1_*` | `@ptf_drawing_s{storyId}_c{sceneId}` |
| Formato | `stateJson` (canvas AtelierCanvas) + thumbnail JPEG | base64 PNG (camada de pintura BFS) |
| Limite | 3 no plano gratuito | Não tem limite (1 por cena) |
| Usado no Livrinho | Não | Sim (via `getSavedDrawing`) |
| Apagável pelo usuário | Sim (via galeria) | Apenas por `clearDrawingState` (não exposto ao usuário na UI) |

**Apagar uma arte do Ateliê não apaga nenhuma cena da história e vice-versa.**

---

## 4. Limite gratuito

| Plano | Limite |
|---|---|
| Gratuito | 3 artes no Ateliê |
| Premium (Plano Familiar) | Ilimitado (`hasAtelierUnlimitedAccess() → isPremiumUser()`) |

### Onde está definido

```js
// atelierStorage.js
export const ATELIER_FREE_SAVE_LIMIT = 3;

// accessControl.js (interno, não exportado diretamente)
const FREE_ATELIER_SAVE_LIMIT = 3;
export function hasAtelierUnlimitedAccess() { return isPremiumUser(); }
```

**Nota:** há dois locais com a constante 3. Ambos são iguais e consistentes. `AtelierCanvasScreen` usa `ATELIER_FREE_SAVE_LIMIT` de atelierStorage junto com `hasAtelierUnlimitedAccess` de accessControl — essa é a combinação correta.

### Lógica de verificação no salvamento

```js
// AtelierCanvasScreen.js
if (!hasAtelierUnlimitedAccess() && !savedArtId) {
  const count = await getArtCount();
  if (count >= ATELIER_FREE_SAVE_LIMIT) {
    setLimitModalVisible(true);
    return;
  }
}
```

- Premium → sempre pode salvar.
- Gratuito + arte nova → verifica contagem.
- Gratuito + editando arte existente (`savedArtId` preenchido) → sempre pode sobrescrever.

---

## 5. Bloqueio de limite (PremiumLock do Ateliê)

Quando o usuário gratuito tenta salvar a 4ª arte, aparece o modal de limite:

- **Título:** "Ateliê cheio!"
- **Mensagem:** "Você já salvou 3 desenhos no Ateliê. Para guardar mais criações, peça para um adulto ver o Plano Familiar."
- **Botão primário:** "💎 Ver Área dos Pais" → navega para `ParentArea` (que tem ParentalGate próprio).
- **Botão secundário:** "🖼️ Gerenciar minhas artes" → navega para `AtelierGallery` (para apagar uma arte antiga).
- **Fechar:** encerra o modal sem ação.

**O app nunca apaga uma arte automaticamente. Nunca substitui arte sem confirmação.**

---

## 6. Qualidade do viewer — thumbnail vs. preview

Ao salvar uma arte, o `AtelierCanvas.exportState` gera **duas imagens**:

| Campo | Geração | Tamanho | Qualidade | Onde é salvo |
|---|---|---|---|---|
| `thumbnailBase64` | Canvas 300×proporcional desenhado em canvas auxiliar | ~300px largura | JPEG 0.6 | `meta` (índice) |
| `previewBase64` | `C.toDataURL('image/jpeg', 0.85)` — resolução nativa do canvas | ~390px+ largura (depende do dispositivo) | JPEG 0.85 | `fullArt` (chave individual) |

- O índice (`ptf_atelier_arts_v1_index`) carrega apenas os metadados com `thumbnailBase64` — rápido e leve para a listagem.
- O objeto completo (`ptf_atelier_arts_v1_{id}`) inclui `stateJson` e `previewBase64`.

### Como o viewer carrega a imagem

Ao tocar na miniatura de um card, `handleViewArt(art)` executa:

```js
setViewingArt(art);          // exibe o viewer imediatamente com thumbnail
setViewingArtFull(null);     // sinaliza "carregando"
getArt(art.id).then(full => setViewingArtFull(full));  // async
```

O viewer exibe:
```jsx
source={{ uri: viewingArtFull?.previewBase64 || viewingArt?.thumbnailBase64 }}
```

- Se `viewingArtFull` ainda está `null`: mostra "Carregando...".
- Após `getArt` resolver: mostra `previewBase64` (alta resolução).
- **Backward compat:** artes salvas antes da Sprint 8.1 têm `previewBase64 = null` — o viewer cai silenciosamente para `thumbnailBase64`. Não há perda de dados nem crash.

### Nunca usar `stateJson` para gerar imagem no viewer

O `stateJson` armazena coordenadas de pinceladas — ele serve apenas para **reabrir o canvas em modo de edição** via `loadState`. Para exibição, usar sempre `previewBase64` (novo) ou `thumbnailBase64` (fallback).

---

## 6b. Como visualizar um desenho salvo

Na Galeria (`AtelierGalleryScreen`):

1. Tocar na **miniatura** de qualquer arte abre o **viewer de tela cheia**.
2. O viewer mostra a imagem com `resizeMode="contain"` — imagem inteira, sem corte.
3. Do viewer é possível:
   - `✏️ Editar` → abre o canvas no modo de edição com a arte carregada.
   - `🗑️ Apagar` → fecha o viewer e exibe confirmação de exclusão.
   - `✕` → fecha o viewer.
4. Respeita `useSafeAreaInsets` para paddings superior e inferior no iPhone.

---

## 7. Como excluir um desenho

Dois caminhos:

**Via card da galeria:**
1. Tocar em `🗑️` no card.
2. Alert: "Quer apagar '{título}' do Ateliê? Isso não pode ser desfeito."
3. Tocar em "Apagar" confirma. "Cancelar" aborta.
4. Lista da galeria atualiza imediatamente.

**Via viewer (tela cheia):**
1. Abrir viewer → tocar "🗑️ Apagar".
2. Viewer fecha → mesmo Alert de confirmação é exibido.

**A exclusão nunca apaga outros desenhos, progresso de cena ou estrelas.**

---

## 8. Estado vazio

Quando não há artes salvas, a galeria exibe:
- Emoji: 🎨
- Título: "Seu Ateliê ainda está vazio"
- Descrição: "Crie seu primeiro desenho para guardar aqui."
- Botão: "✏️ Começar a desenhar" → abre `AtelierCanvas` vazio.

---

## 9. Como evitar perda de dados

- Nunca chamar `clearAllSavedDrawings()` fora de um dev-helper explícito.
- Nunca remover as chaves `ptf_atelier_arts_v1_*` do AsyncStorage.
- O `ATELIER_FREE_SAVE_LIMIT` jamais deve ser alterado sem decisão de produto documentada.
- `saveArt` usa `artId` para evitar duplicar a arte atual ao sobrescrever.
- `deleteArt` só remove a entrada específica do índice + a chave individual.

---

## 10. Como testar no iPhone (Expo Go)

1. Abrir o app → aba "Ateliê" → ver 3 cards.
2. Tocar "Criar minha arte" → canvas abre com toolbar inferior.
3. Desenhar → tocar "💾 Salvar" → dar nome → confirmar.
4. Repetir 3 vezes → tentar salvar 4ª vez → ver modal de limite.
5. Verificar que modal tem "Ver Área dos Pais" (navega corretamente) e "Gerenciar minhas artes".
6. Ir à galeria → tocar miniatura → viewer abre em tela cheia, imagem não cortada.
7. No viewer tocar "✏️ Editar" → canvas abre com arte carregada.
8. Voltar à galeria → tocar 🗑️ → confirmar → arte some da lista.
9. Apagar todas as artes → ver estado vazio com "Seu Ateliê ainda está vazio".
10. Verificar que nenhuma cena da história ou estrela mudou.

---

## 11. Paleta de cores compartilhada (Sprint 9.2)

Ateliê e Colorir usam a mesma paleta exportada de `src/constants/colorPalette.js`.

```js
import { COLOR_PALETTE, DEFAULT_COLOR } from '../constants/colorPalette';
```

| Arquivo | Paleta usada |
|---|---|
| `AtelierCanvasScreen.js` | `COLOR_PALETTE` (44 cores) |
| `ColoringScreen.js` | `COLOR_PALETTE` (44 cores) |

**Não criar paleta inline** em nenhuma dessas telas. Edições de paleta devem acontecer somente em `colorPalette.js`.

O arquivo antigo `src/data/atelierData.js` ainda exporta `ATELIER_PALETTE` para outros imports legados (BG_COLORS, STAMPS, BRUSHES, SHAPES), mas não é mais a fonte de verdade da paleta de cores do Ateliê.

---

## 12. Posicionamento de stickers (Sprint 9.2)

### Como funcionava (bug)

`drawStamp` usava `textAlign='center'` e `textBaseline='middle'`. Com emojis que contêm variation selectors como `❤️` (U+2764 + U+FE0F) e `🕊️` (U+1F54A + U+FE0F), o `ctx.measureText().width` incluía o advance width do selector invisível, deslocando o centro horizontal para a direita.

### Como funciona agora

`drawStamp` usa `TextMetrics.actualBoundingBoxLeft/Right/Ascent/Descent` para calcular onde o glifo é **visualmente** centrado, independentemente de caracteres invisíveis:

```js
var m = ctx.measureText(s.emoji);
if (typeof m.actualBoundingBoxLeft === 'number' && m.actualBoundingBoxAscent > 0) {
  drawX = s.x - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
  drawY = s.y + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
}
```

### Regras invariantes

- `(s.x, s.y)` continua sendo o **centro intencional** do sticker — sem mudança de formato.
- O anel de seleção (`ctx.arc(s.x, s.y, ...)`) continua centrado em `(s.x, s.y)`.
- O hit test usa `(s.x, s.y)` como centro.
- Artes salvas com posições antigas continuam abrindo corretamente — os stickers aparecem onde o usuário os colocou.
- Há fallback para `textAlign='center' / textBaseline='middle'` em ambientes sem TextMetrics nível 2.

---

## 13. O que NÃO fazer

| Proibido | Motivo |
|---|---|
| Alterar `BFS`, `exportPaint` ou `loadPaint` no ColoringCanvas | Motor de pintura das histórias — intocável |
| Alterar a threshold do isBarrier (tap rejection, 230) | Impede fill em cima de linhas |
| Alterar a threshold do isBFSBarrier (BFS expansion, 210) | Balanceado para eliminar fringe sem vazar |
| Usar `__DEV__` como regra de produto | Comportamento muda em produção |
| Usar `ENABLE_LOCAL_PREMIUM_TEST_MODE = true` | Nunca deve ir para produção |
| Apagar desenhos antigos automaticamente ao atingir limite | Perda de dados sem consentimento |
| Contar desenhos de cenas da história no limite do Ateliê | Storages separados, contextos diferentes |
| Criar compra real, RevenueCat ou backend neste sprint | Fora do escopo do MVP |
| Alterar a arquitetura do Livrinho ou a cadeia de auto-avanço | Risco de regressão crítica |
| Criar áudio/vídeo falso ou alterar audioManifest para `ready` | Falsa promessa de funcionalidade |
| Definir paleta de cores inline em AtelierCanvasScreen ou ColoringScreen | Quebra a unificação |

---

## Relação com outros serviços

- **ProgressContext** — não é afetado pelo Ateliê. O Ateliê não cria estrelas.
- **rewardService** — não é afetado. Estrelas do Ateliê não existem neste sprint.
- **drawingStorage** — completamente independente. Livrinho lê de `drawingStorage`, não de `atelierStorage`.
- **achievementService** — usa `listArts()` para contar `savedDrawingCount` no contexto de conquistas, mas isso é leitura apenas, não afeta o limite do Ateliê.
