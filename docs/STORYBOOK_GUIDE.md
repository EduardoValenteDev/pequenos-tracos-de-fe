# Livrinho da Fé — Guia Técnico (Sprint 5.4)

## O que é

O Livrinho da Fé é uma retrospectiva guiada em formato de playback interno. A criança vê cada cena
da aventura completada, uma por vez, com o desenho que ela coloriu, a lição da cena e o player de
áudio (quando a narração estiver disponível). A experiência se parece com "um vídeo dentro do app".

---

## Máquina de estados

```
loading
  ├─► locked          (canOpenStoryFullExperience = false)
  ├─► invalidStory    (route.params.story ausente ou sem id)
  ├─► emptyScenes     (story.cenas.length === 0)
  ├─► notCompleted    (alguma cena ainda não salva em AsyncStorage)
  ├─► error           (falha inesperada no carregamento)
  └─► intro           (pré-requisitos atendidos — capa da história)

intro
  └─► playing (index 0)   (ao tocar "Iniciar Livrinho" — bookOpened marcado aqui)

playing (index N)
  ├─► [sub] isPaused=true    → áudio pausado, cena visível, sem avanço automático
  ├─► [sub] waitingForAudio  → audioAsset=null (sem narração real cadastrada)
  │          AudioPlayer=null, Livrinho visual funciona, avanço é manual
  ├─► intro               (◀ prev na cena 0)
  ├─► playing (index N-1) (◀ prev em qualquer outra cena)
  ├─► playing (index N+1) (onSceneAudioComplete → advanceToNextScene, ou ▶▶ manual)
  └─► ended               (onSceneAudioComplete ou ▶▶ manual na última cena)

ended
  └─► playing (index 0)   ("Ver de novo")
```

---

## Cadeia de auto-avanço por áudio (Sprint 5.4)

A experiência alvo é uma retrospectiva guiada: a criança toca Iniciar Livrinho e cada cena
avança automaticamente ao fim da narração, como um vídeo dentro do app.

```
expo-audio emite didJustFinish (status real do player)
  └─► AudioPlayer: finishedCalledRef guard (evita disparo duplo)
        └─► onFinished() chamado UMA vez
              └─► onSceneAudioComplete() em StoryBookScreen
                    └─► advanceToNextScene()
                          ├─► setCurrentSceneIndex(i + 1) + setIsPaused(false)
                          └─► setScreenState('ended')  ← quando for a última cena
```

**Regras da cadeia (não violar):**
- `AudioPlayer` retorna `null` quando `audioAsset === null` → `onFinished` NUNCA dispara sem áudio real
- Nenhum `setTimeout`, nenhum `setInterval`, nenhuma duração simulada — nunca
- `key={cena.id}` no AudioPlayer reseta todo o estado interno ao trocar de cena
- `finishedCalledRef` em AudioPlayer impede que `onSceneAudioComplete` seja chamado duas vezes
- `paused={isPaused}` sincroniza o botão ⏸/▶ do StoryBookScreen com o player real de expo-audio

**Sem áudio hoje:**
- `audioAsset === null` → AudioPlayer = null → nenhum player visível → nenhum avanço automático
- A criança avança manualmente pelo ▶▶ (controle auxiliar)
- O Livrinho visual funciona normalmente (arte colorida, linhas, fallback)

**Com áudio real amanhã:**
- Adicionar MP3 em `assets/audio/{storyId}/{storyId}_scene_NN.mp3`
  (exemplo: `assets/audio/creation/creation_scene_01.mp3`)
- Registrar no audioManifest em `_readyEntries` (NÃO incluir `status:` — ele é gerado por `_entry()`):
  `{ storyId: 'creation', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/creation/creation_scene_01.mp3') }`
- Rodar `npm run audio:audit` — confirmar ready count subindo
- A cadeia dispara automaticamente sem alterar StoryBookScreen ou AudioPlayer

---

## getStoryBookPlaybackReadiness

Função pura em `src/screens/StoryBookScreen.js`:

```javascript
getStoryBookPlaybackReadiness(story)
// Retorna:
// {
//   totalScenes: number,
//   scenesWithAudio: number,
//   allScenesHaveAudio: boolean,
//   canAutoPlay: boolean,        ← true só quando TODAS as cenas têm áudio ready
//   missingAudioSceneIds: []     ← IDs das cenas sem áudio cadastrado
// }
```

- `canAutoPlay` é derivado de `allScenesHaveAudio` que é derivado de `hasSceneAudio()` por cena
- Enquanto audioManifest está 0/200 ready: `canAutoPlay === false` para todas as histórias
- Quando todos os 10 MP3 de uma história forem adicionados: `canAutoPlay === true` para ela

---

## Fluxo de navegação

```
CongratsScreen       → StoryBook (botão "Meu Livrinho da Fé")
PostStoryHubScreen   → StoryBook (card "Meu Livrinho da Fé")
StoryDetailScreen    → StoryBook (PostStoryCard "Livrinho da Fé")
```

O StoryBook é uma rota de stack (`headerShown: false`), registrada em `AppNavigator.js`.

---

## Marcação de bookOpened

`markStoryBookOpened(storyId)` é chamado **uma única vez**, dentro de `handleStartLivrinho()`,
que é acionado quando a criança toca "▶ Iniciar Livrinho" na tela `intro` (transição intro → playing).
Um `useRef` (`markedRef`) garante que a chamada aconteça apenas uma vez por montagem do componente.

Isso garante que:
- A criança realmente abre o livrinho (não apenas chega na tela intro) antes de marcar como visto
- `isStoryBookOpened(storyId)` retorna `true` após a primeira vez que a criança inicia o playback
- `getPostStoryStatus(storyId).hasPendingRewards` é atualizado corretamente
- O badge de recompensas pendentes na HomeScreen desaparece

---

## Formato da arte salva — diagnóstico Sprint 5.3

### O que exportPaint salva

`exportPaint` (ColoringCanvas.js) cria um canvas temporário (W×H) e coloca **somente `paintD`**
nele. `paintD` é a camada de tinta do usuário:
- Pixels pintados → cor sólida (RGBA alpha=255)
- Pixels não pintados → transparente (alpha=0)

**Importante:** O export NÃO inclui o fundo creme (#FFFDF8) nem a lineart.

O resultado é um PNG transparente onde somente as regiões coloridas pela criança têm cor.

### Formato v2 (payload JSON)

```json
{
  "v": 2,
  "W": 390,
  "H": 600,
  "imgX": 3,
  "imgY": 15,
  "imgW": 384,
  "imgH": 570,
  "data": "data:image/png;base64,..."
}
```

- `W`, `H`: dimensões do canvas WebView no momento do export
- `imgX`, `imgY`, `imgW`, `imgH`: posição exata da lineart dentro do canvas
- `data`: o PNG da camada de tinta (transparente onde não pintado)

### Formato v1 (legado)

String raw: `'data:image/png;base64,...'` — sem metadados de posicionamento.

### Chave de armazenamento

`@ptf_drawing_s{storyId}_c{sceneId}` — via `drawingStorage.js`

---

## Composição do desenho por cena — Sprint 5.3

### Por que o Sprint 5.2 tinha efeito fantasma

No Sprint 5.2, a camada de tinta (W×H pixels, proporção do canvas) e a lineart PNG (dimensões
naturais próprias, proporção diferente) eram renderizadas ambas com `absoluteFill` + `resizeMode="contain"`
no mesmo container. Com aspect ratios diferentes, cada imagem escalava independentemente → a lineart
aparecia em posição diferente da tinta → efeito fantasma/dupla imagem.

### Solução correta — Sprint 5.3

**`resolveStoryBookVisual(cena, story, drawings)`** — função pura que determina o tipo de
renderização antes de qualquer JSX:

```
Prioridade:
  1. paintWithLineart — v2 paint + lineart + metadados completos de posição
     Usa computeLineartStyle() para posição absoluta pixel-perfeita.
     NUNCA usa absoluteFill na lineart — sempre coordenadas absolutas calculadas.

  2. paintOnly — paint salvo mas sem metadados (v1) ou sem lineart disponível.
     Mostra a camada de tinta sobre fundo creme. Sem overlay de lineart.

  3. lineartOnly — nenhum paint salvo, mas lineart existe.
     Mostra a lineart original (não colorida) sobre fundo creme.

  4. fallback — nem paint nem lineart.
     Gradiente colorido com emoji da cena e título.
```

**`computeLineartStyle(containerW, containerH, visual)`** — calcula a posição absoluta da
lineart replicando o comportamento `resizeMode="contain"` da camada de tinta:

```javascript
const scale = Math.min(containerW / visual.canvasW, containerH / visual.canvasH);
const paintDisplayW = visual.canvasW * scale;
const paintDisplayH = visual.canvasH * scale;
const offsetX = (containerW - paintDisplayW) / 2;
const offsetY = (containerH - paintDisplayH) / 2;
return {
  position: 'absolute',
  left: offsetX + visual.lineartImgX * scale,
  top: offsetY + visual.lineartImgY * scale,
  width: visual.lineartImgW * scale,
  height: visual.lineartImgH * scale,
};
```

**Medição do container** — `onLayout` no `playingImageArea` alimenta `imgContainerSize`.
A lineart só é renderizada após a primeira medição (`imgContainerSize.w > 0`). O delay de
um frame é imperceptível na prática.

### Stack visual (modo playWithLineart)

```
playingImageArea { flex:1, backgroundColor:'#FFFDF8' }
  │
  ├─ Image (paint layer)
  │    source={{ uri: paintUri }}
  │    style={StyleSheet.absoluteFill}
  │    resizeMode="contain"
  │    → escala o canvas W×H para caber no container
  │
  └─ Image (lineart)
       source={visual.baseImage}
       style={{ position:'absolute', left, top, width, height }}  ← via computeLineartStyle
       resizeMode="stretch"                                        ← box já tem a proporção certa
       mixBlendMode="multiply"
       → white pixels → transparentes (cores aparecem)
       → dark pixels  → contornos visíveis sobre as cores
```

### Regra crítica

**Nunca sobrepor lineart com `absoluteFill` sobre a camada de tinta.**
As duas imagens têm aspect ratios diferentes e escalam independentemente.
Sempre usar `computeLineartStyle` que calcula a posição correta via metadados v2.

---

## Player de áudio por cena

```js
const audioAsset = hasSceneAudio(story.id, cena.id)
  ? getSceneAudio(story.id, cena.id)?.audioAsset ?? null
  : null;

<AudioPlayer
  key={cena.id}
  audioAsset={audioAsset}
  onFinished={onSceneAudioComplete}
  paused={isPaused}
/>
// AudioPlayer retorna null quando audioAsset=null → nada renderizado, sem auto-advance
// key={cena.id} reseta estado do player ao trocar de cena
// paused={isPaused} sincroniza botão externo ⏸/▶ com player real
// Quando áudio real cadastrado → player renderiza, onFinished→onSceneAudioComplete→advanceToNextScene
```

A cadeia está completa e testada no smoke. Quando os MP3 forem cadastrados, o avanço
automático funcionará sem alterar StoryBookScreen, AudioPlayer ou qualquer outra tela.

**Sem áudio (hoje):** AudioPlayer=null, avanço manual via ▶▶ (controle auxiliar).
**Com áudio real:** avanço automático via cadeia onFinished→onSceneAudioComplete→advanceToNextScene.

---

## Header — padrão Quiz

Intro e ended usam `LinearGradient` com as mesmas cores do QuizScreen:
```javascript
colors={[colors.primaryDark, colors.primary]}
```

Estrutura do header:
```
LinearGradient
  ├─ headerNav: [← Voltar] ────── [🏠]
  └─ headerContent: emoji + título + subtítulo
```

O botão `← Voltar` do header chama `navigation.goBack()` (sai do Livrinho).
O botão `▶▶` (próxima cena) e `◀` (cena anterior) são os controles internos do playback.

---

## Telas intro e ended

**Intro** — Capa da história:
- Header quiz-style com `← Voltar` e `🏠`
- Card 16:9 com `resizeMode="contain"` (cover image ou emoji fallback)
- Texto descritivo + contagem de cenas
- Botão "▶ Iniciar Livrinho" (chama `handleStartLivrinho`)
- ScrollView com `paddingBottom: Math.max(insets.bottom + 32, 48)` — garante que o botão
  não encoste na barra de navegação do tablet

**Ended** — Tela de conclusão:
- Header quiz-style com `🙏` + "Seu Livrinho da Fé ficou pronto!"
- Botão "↩ Ver de novo" (volta para playing index 0)
- Botão "← Voltar para a aventura" (`navigation.goBack()`)

---

## Navegação pós-aventura (Sprint 5.1)

| Tela origem | Botão | Destino |
|---|---|---|
| CongratsScreen | "Meu Livrinho da Fé" | StoryBook |
| CongratsScreen | "Responder Quiz" | Quiz (direto) |
| CongratsScreen | "Conversar com Lumi" | Reflection (direto) |
| PostStoryHubScreen | card Livrinho | StoryBook |
| StoryDetailScreen | PostStoryCard "Livrinho da Fé" | StoryBook |
| LumiMomentScreen | ← Voltar (header) | goBack() |
| ReflectionScreen | ← Voltar (header) | goBack() |

---

## Arquitetura

| Arquivo | Responsabilidade |
|---|---|
| `src/screens/StoryBookScreen.js` | Tela principal — 9 estados, `resolveStoryBookVisual`, `computeLineartStyle`, `getStoryBookPlaybackReadiness`, `advanceToNextScene`, `onSceneAudioComplete` |
| `src/components/AudioPlayer.js` | Player real expo-audio — `onFinished`, `paused`, `finishedCalledRef` guard |
| `src/services/postStoryStorage.js` | `markStoryBookOpened`, `isStoryBookOpened` |
| `src/assets/coloringImages.js` | Lineart por cena — `getColoringImage` |
| `src/services/drawingStorage.js` | Camada de tinta salva — `getSavedDrawing` (retorna JSON v2 ou data URL v1) |
| `src/services/audioService.js` | `hasSceneAudio`, `getSceneAudio`, `getStoryAudioSequence` |
| `src/navigation/AppNavigator.js` | Rota `StoryBook` registrada como Stack.Screen |
| `src/components/ColoringCanvas.js` | `exportPaint` → JSON v2 com camada de tinta pura (NÃO alterar) |

---

## Hierarquia dos controles de playback (Sprint 5.4)

```
Controle principal:  ⏸/▶  (56×56, ctrlBtnPlay, cor primária) — pausa e retoma
Controle auxiliar:   ◀    (38×38, ctrlBtnAux, transparente)   — cena anterior
Controle auxiliar:   ▶▶   (38×38, ctrlBtnAux, transparente)   — pular cena manualmente
```

O usuário NÃO deve ser levado a usar ▶▶ como fluxo principal. O fluxo esperado é:
1. Tocar "▶ Iniciar Livrinho"
2. Assistir cada cena com narração tocando automaticamente
3. A cena avança sozinha quando a narração termina

▶▶ existe apenas para quem quiser pular uma cena.

---

## Regras absolutas

- Não marcar `bookOpened` antes de `handleStartLivrinho()` ser chamado (intro → playing)
- **Não usar `setInterval` ou `setTimeout` para simular narração ou auto-advance**
- Não criar player falso: AudioPlayer retorna `null` quando `audioAsset === null`
- Não exibir a tela a usuários sem acesso — `canOpenStoryFullExperience` é a porta de entrada
- Não mostrar conteúdo de cenas incompletas — verificar `@ptf_progress_${storyId}` antes de abrir
- Não registrar `require()` para arquivo de áudio ou imagem inexistente
- Não alterar `status` das cenas no audioManifest de `'missing'` para `'ready'` sem arquivo real
- **Não usar o valor bruto de `getSavedDrawing` como `source={{ uri }}`** — passar sempre por `parseDrawingPayload`
- **Não usar `absoluteFill` na lineart overlay** — usar sempre `computeLineartStyle` para coordenadas absolutas
- **Não sobrepor lineart sobre paint sem metadados v2** — sem `W/H/imgX/imgY/imgW/imgH` usar `paintOnly`
- Não usar `resizeMode="cover"` no playback — usar `resizeMode="contain"` para paint, `resizeMode="stretch"` para lineart posicionada
- Não incluir texto sobre narração futura na tela do Livrinho
- Não alterar ColoringCanvas, BFS, exportPaint, loadPaint
- **Não criar duração simulada de áudio — nenhum timer deve substituir `didJustFinish`**
- **`onSceneAudioComplete` só deve ser chamado via `onFinished` do AudioPlayer — nunca diretamente por timeout**

---

## Checklist antes de publicar

- [ ] `npm run smoke` — 154/154 checks passando
- [ ] `npm run audio:audit` — cobertura de áudio correta (0/200 ready esperado)
- [ ] `npm run qa` — sem incompatibilidades de versão
- [ ] `npx expo-doctor` — 18/18 checks
- [ ] Botão "Meu Livrinho da Fé" em CongratsScreen leva para `StoryBook`
- [ ] Botão "Responder Quiz" em CongratsScreen leva para `Quiz` (direto)
- [ ] Botão "Conversar com Lumi" em CongratsScreen leva para `Reflection` (direto)
- [ ] Card Livrinho em PostStoryHubScreen leva para `StoryBook`
- [ ] PostStoryCard "Livrinho da Fé" em StoryDetailScreen leva para `StoryBook`
- [ ] "▶ Iniciar Livrinho" na intro inicia playback e marca `bookOpened`
- [ ] Arte colorida da cena aparece sem lineart fantasma por cima (tipo paintWithLineart)
- [ ] Imagem não cortada (resizeMode contain no paint, stretch na lineart posicionada)
- [ ] Lineart visível apenas como contorno sobre as cores (multiply blend)
- [ ] Cena sem pintura salva mostra lineart (tipo lineartOnly)
- [ ] Cena sem lineart nem pintura mostra fallback gradiente (tipo fallback)
- [ ] Controles: ⏸/▶ central grande (principal), ◀ e ▶▶ pequenos (auxiliares), contador 1/10
- [ ] `← Voltar` no header do playback sai do Livrinho (navigation.goBack)
- [ ] `🏠` no header vai para Home
- [ ] ◀ na cena 0 vai para intro
- [ ] ▶▶ na última cena vai para ended
- [ ] "Ver de novo" em ended reinicia do index 0
- [ ] LumiMomentScreen tem ← Voltar e 🏠 no header
- [ ] ReflectionScreen tem ← Voltar e 🏠 no header
- [ ] Badge de recompensas pendentes desaparece na HomeScreen após Livrinho + Quiz + Reflexão
- [ ] Botão "Iniciar Livrinho" não encosta na navegação inferior do tablet
- [ ] Sem texto de áudio futuro em tela alguma
- [ ] Motor de colorir intocado (ColoringCanvas, BFS, exportPaint, loadPaint)
