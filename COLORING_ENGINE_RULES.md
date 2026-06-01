# COLORING ENGINE RULES — Pequenos Traços de Fé

> **Regras absolutas do motor de colorir.** Nenhuma mudança no componente `ColoringCanvas.js` ou em qualquer código que interfira no canvas pode ser feita sem respeitar estas regras. Violações são regressões críticas.

---

## Regra 1 — O PNG Original é Intocável

O arquivo PNG original nunca pode ser:
- Modificado pelo app em runtime
- Recortado, compactado ou redimensionado em disco
- Substituído por uma versão alterada
- Lido com `FileSystem.writeAsStringAsync` ou qualquer API de escrita

O PNG é apenas lido para exibição. Qualquer operação de transformação acontece em memória (canvas), nunca no arquivo.

---

## Regra 2 — Exibição com Contain Matemático

A imagem de colorir deve ser exibida usando `contain` matemático:
- Calcula a escala `s = min(availW / naturalWidth, availH / naturalHeight)`
- `imgW = Math.round(naturalWidth * s)`
- `imgH = Math.round(naturalHeight * s)`
- `imgX = Math.round((canvasW - imgW) / 2)`
- `imgY = Math.round((canvasH - imgH) / 2)`

**Proibido usar:** `cover`, `stretch`, `fill`, ou qualquer método que corte a imagem.

**Padding mínimo (SP):** 6px de cada lado. Suficiente para evitar artefatos de antialiasing na borda, sem desperdiçar espaço de tela. Não aumentar sem justificativa técnica documentada.

**Posicionamento inteiro:** todos os valores devem ser `Math.round()` para evitar pixels sub-pixel na borda da imagem que corrompem a detecção de barreiras no `baseD`.

---

## Regra 3 — BFS Confinado ao Retângulo da Imagem

O flood fill (BFS) **nunca pode sair do retângulo** `[imgX, imgY, imgW, imgH]`.

A área de padding ao redor da imagem tem cor de fundo (`#FFFDF8`, lum ≈ 254), que não é uma barreira. Se o BFS entrar nessa área, ele conecta regiões separadas (ex.: céu e chão se tornam uma região só).

Implementação obrigatória:
```javascript
function inImg(x, y) {
  return x >= imgX && x < imgX + imgW && y >= imgY && y < imgY + imgH;
}

// No início de fill():
if (!inImg(sx, sy)) return;

// Em cada vizinho no BFS:
if (!inImg(nx, ny)) continue;
```

**Estas duas verificações nunca podem ser removidas.**

---

## Regra 4 — A Margem Externa Não É Colorível

Toque fora do retângulo da imagem (na margem de padding ou fora do canvas) deve ser silenciosamente ignorado. O usuário não vê erro, a tinta simplesmente não aparece.

---

## Regra 5 — Ordem das Camadas

A composição final a cada frame deve respeitar esta ordem estrita:

```
1. Fundo creme (#FFFDF8)     offCtx.fillRect(0, 0, W, H)
2. Camada de cores           offCtx.drawImage(tmp, 0, 0)  [tmp tem paintD]
3. Line art por cima         offCtx.drawImage(lineArtImg, imgX, imgY, imgW, imgH)
                             com globalCompositeOperation = 'multiply'
```

**Por que multiply:** o PNG de line art tem fundo branco opaco. Com `source-over` padrão, o branco cobriria a pintura do usuário, tornando-a invisível. Com `multiply`, branco (255) × qualquer cor = aquela cor (transparência matemática), e preto (0) × qualquer cor = preto (linhas preservadas). Isso garante que:
- Áreas brancas: a cor do usuário aparece visível
- Linhas pretas: sempre visíveis por cima da cor
- Pixels antialiased: proporcionalmente preservados

**Nunca inverter esta ordem.** Pintura sobre line art → linhas cobertas. Line art sobre pintura sem multiply → pintura invisível.

---

## Regra 6 — baseD é Apenas para Barreiras

`baseD` é um `ImageData` capturado uma vez por imagem (durante `initCanvas`). Contém:
- Fundo creme
- Line art desenhada via `drawImage`

`baseD` é usado **exclusivamente** para a função `isBarrier()` no BFS. Nunca deve ser renderizado diretamente na tela após a inicialização.

A renderização usa `lineArtImg` (objeto Image original) e `paintD` (camada de pintura).

---

## Regra 7 — Threshold de Barreira

```javascript
function lum(r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b; }
function isBarrier(r, g, b, a) {
  if (a < 30) return false;
  return lum(r, g, b) < 230;
}
```

- Threshold: `lum < 230` — bloqueia linhas sólidas (lum ≈ 0) e pixels antialiased de borda (lum 40–229)
- Nunca aumentar para > 235 (deixaria pixels antialiased passarem, conectando regiões)
- Nunca diminuir para < 200 (tornaria certas linhas não detectáveis)
- Alpha < 30: considerado transparente, não é barreira

---

## Regra 8 — A Pintura Acontece em Camada Separada

`paintD` é um `ImageData` separado de `baseD`. Somente `paintD` é modificado pelo BFS de fill e erase. `baseD` é imutável após `initCanvas`.

Estrutura de dados:
- `baseD`: snapshot imutável (barreira)
- `paintD`: camada de cor mutável
- `lineArtImg`: objeto Image para renderização final

---

## Regra 9 — Botão Pronto Exige Pelo Menos Uma Cor

O botão "Pronto!" só pode concluir a cena se `hasPainted === true` no React Native.

Se acionado sem pintura:
```
Título: "🎨 Pinte um pouquinho primeiro!"
Mensagem: "Pinte um pedacinho da cena antes de continuar!"
Botão: "Tá bom!"
```

A mensagem deve ser infantil, sem culpa, sem pressão.

---

## Regra 10 — Troca de Cor Deve Ser Imediata

`window.setColor(hex)` deve atualizar a cor ativa no WebView sem delay. Implementado via `injectJavaScript` ao detectar mudança de `selectedColor` no React Native.

O efeito de sincronização de cor deve rodar **após** `isReadyRef.current === true`.

---

## Regra 11 — Desfazer (Undo)

- `pushHist()` chamado antes de cada operação de fill ou erase
- Máximo 10 estados em `hist[]`
- `window.undo()` restaura o último estado de `paintD`
- Undo após o primeiro fill retorna ao canvas vazio

---

## Regra 12 — Limpar (Clear)

`window.clearPaint()`:
- Salva estado atual em `hist` (undo pode recuperar)
- Cria novo `paintD` vazio
- Chama `renderAll()`
- `hasPainted` no React Native é responsabilidade do React Native; o WebView não redefine `hasPainted` interno ao limpar (para não enviar PAINTED novamente se a criança repintar)

---

## Regra 13 — Zoom

- Escala: 1.0 (mínimo) até 3.0 (máximo)
- Pan: limitado por `clamp()` para não arrastar além dos limites do canvas
- `window.resetZoom()`: volta para `scale=1, tx=0, ty=0`
- Pinch to zoom: 2 toques simultâneos

---

## Regra 14 — Salvar e Exportar (v2 com Metadados de Dimensão)

`window.exportPaint()`:
- Exporta `paintD` como PNG base64 envolto em JSON com metadados de dimensão
- Formato: `PAINT_EXPORT:{"v":2,"W":<W>,"H":<H>,"imgX":...,"imgH":...,"data":"data:image/png;..."}`
- React Native salva o JSON string inteiro em AsyncStorage com chave `@ptf_drawing_s{storyId}_c{sceneId}`

`window.loadPaint(jsonStr)`:
- Aceita formato **v2** (JSON com W/H) ou **legado v1** (raw data URL)
- **Validação obrigatória:** antes de aplicar a bitmap, verifica se `savedW === W && savedH === H`
  - v2: usa `payload.W` e `payload.H`
  - v1 (legado): usa `img.naturalWidth` e `img.naturalHeight` como fallback
- Se as dimensões não baterem: emite `LOAD_PAINT_INCOMPATIBLE` e **não aplica** a bitmap
- Se as dimensões baterem: carrega `paintD`, define `hasPainted=true`, chama `renderAll()`
- Em caso de erro de parse: emite `LOAD_PAINT_CORRUPTED`

**Regra crítica:** nunca aplicar bitmap salvo com dimensões diferentes do canvas atual.
O `paintD` contém pixels em coordenadas absolutas de canvas. Se W ou H mudou (frame adaptativo,
rotação de tela, dispositivo diferente), os pixels de cor não se alinham com `lineArtImg` e `baseD`.

**Mensagem `LOAD_PAINT_INCOMPATIBLE`** no React Native:
- Log em DEV: `[COLORING_STATE] incompatible saved state ignored`
- Nenhuma mensagem ao usuário — canvas abre limpo silenciosamente
- Callback `onLoadIncompatible` invocado (sem alert ao usuário)

---

## Regra 15 — Retry Limpo

`handleRetry()` no React Native:
- Define `isReadyRef.current = false`
- Incrementa `retryKey`
- `retryKey` nas deps do `useEffect` de prefetch força novo fetch da imagem
- `retryKey` nas deps de `htmlSource` useMemo força remount do WebView via `key={retryKey}`
- O WebView remonta com JS state completamente zerado (sem `baseD` stale, sem `paintD` stale)

---

## Regra 16 — Sem Loading Infinito

Timeout de 7 segundos (`TIMEOUT_MS = 7000`):
- Se `READY` não chegar em 7s, exibe overlay de erro com opção de retry
- O timeout é reiniciado a cada retry (via dep em `isLoading, retryKey`)

---

## Regra 17 — Erros Visíveis e Amigáveis

Nenhum erro pode ser silencioso para o usuário quando impede o uso:
- `window.onerror` → `ERR:` message → overlay de erro
- `img.onerror` → `ERR:img_load_failed` → overlay de erro
- `ERR:` antes de `READY` → `setErrorType('error')`
- Em DEV: `console.warn('[ColoringCanvas WebView]', msg)`
- Em produção: sem console, mas overlay amigável sempre exibido

---

## Regra 18 — getImageData Rodado Uma Vez

`getImageData` (que cria `baseD`) é chamado **uma única vez** por imagem, dentro de `initCanvas`, após `drawImage`. Nunca chamar `getImageData` a cada toque ou a cada renderização.

---

## Regra 19 — Buffers Pré-Alocados

`qBuf` e `visBuf` são alocados uma vez por sessão de canvas (em `allocBufs()`, chamado dentro de `initCanvas`). Nunca alocar `new Uint8Array(W*H)` ou `new Int32Array(W*H*2)` por toque.

Limpeza de `visBuf` após BFS: loop O(N_fill) sobre os pixels visitados, não O(W×H) full reset.

---

## Regra 20 — Logs de Diagnóstico

Em modo `DEV` (`__DEV__ === true`), os seguintes logs devem existir:
- `[COLORING_DEBUG] SET_COLOR received h=<hex>`
- `[COLORING_DEBUG] touch clientX=X clientY=Y canvasX=X canvasY=Y inImg=true/false`
- `[COLORING_DEBUG] fill rejected: outside inImg`
- `[COLORING_DEBUG] fill rejected: isBarrier lum=<n>`
- `[COLORING_DEBUG] fillPixelCount=<n>`
- `[COLORING_DEBUG] renderAll called`
- `[COLORING_DEBUG] hasPaint=<bool>`

Em produção: nenhum desses logs deve aparecer. Controlado por `var DEV = <flag>` injetado no HTML em build time.

---

## Regra 21 — Zoom Não Pode Acionar Fill

Ao terminar um gesto de pinch (zoom), o dedo remanescente ou o levantamento dos dois dedos **não pode disparar fill/erase**.

Implementação obrigatória no handler `touchend`:

```javascript
// Transição pinch → 1 dedo: tratar como pan, não como tap
touchState = (prev === 'pinch') ? 'pan' : 'tap';

// Cooldown de 300 ms após qualquer fim de pinch
if (prev === 'pinch') suppressPaintUntil = Date.now() + 300;

// Fill só permitido após o cooldown
if (prev === 'tap' && e.changedTouches.length > 0 && Date.now() > suppressPaintUntil) {
  // fill / erase
}
```

**Motivo:** sem essa proteção, o levantamento do segundo dedo após um pinch pode ser interpretado como `prev === 'tap'` e disparar um fill indesejado na região onde o dedo estava.

---

## Regra 22 — Canvas Dimensionado ao Aspect Ratio da Imagem

O container do canvas no React Native deve ser dimensionado com base no aspect ratio natural da imagem, não com `flex: 1` fixo.

Implementação em `ColoringScreen.js`:

```javascript
let canvasHeight = undefined;
if (imageSource) {
  const asset = Image.resolveAssetSource(imageSource);
  if (asset?.width && asset?.height) {
    const canvasW = screenW - 20; // margem de 10px em cada lado
    canvasHeight = Math.round(canvasW / (asset.width / asset.height));
  }
}
```

O container (`canvasArea`) usa `height: canvasHeight` quando disponível, ou `flex: 1` como fallback. Um wrapper com `flex: 1` e `justifyContent: 'center'` centraliza o canvas verticalmente.

**Cap obrigatório:** `canvasHeight` deve ser limitado a `maxCanvasH = screenH - approxTopH - approxBottomH - margins`. Sem esse cap, imagens portrait em celular portrait geram um canvas maior que o espaço disponível, empurrando o botão "Pronto!" e a paleta para fora da tela.

**Motivo:** imagens landscape em celular portrait ficavam com letterboxing vertical excessivo — a área útil de pintura era minúscula em relação ao espaço ocupado. Imagens portrait em celular portrait sem o cap escondiam o botão Pronto.
