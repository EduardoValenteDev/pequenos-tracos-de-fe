/**
 * useViewportProjection.js — a ÚNICA projeção `contain` do app.
 *
 * Fase 6 · `F6-R3.5` · `TK-A-030` / `TK-A-032`.
 *
 * ─── POR QUE ISTO EXISTE ────────────────────────────────────────────────────────────
 *
 * Antes, cada superfície inventava a sua conta de "caber a obra na tela": uma escala
 * aqui, uma centralização ali, uma sobra tratada de um jeito em cada motor. Duas contas
 * diferentes para a mesma pergunta produzem duas verdades diferentes sobre ONDE está o
 * traço da criança — e é assim que pintura acaba deslocada do desenho depois de girar.
 *
 * Aqui existe UMA conta só, pura, testável fora do React (`TA-4`).
 *
 * ─── CONTRATO (§11.3 do PLAN) ───────────────────────────────────────────────────────
 *
 *   `scale = Math.min(w / W, h / H)`  ← UM fator, isotrópico.
 *
 * `contain`, nunca `cover`: a obra aparece INTEIRA. O que sobra vira `letterbox` — faixa
 * de moldura, centralizada nos dois eixos. É proibido escalar X e Y por fatores
 * diferentes: `scaleX ≠ scaleY` esticaria o desenho da criança, e um desenho esticado é
 * um desenho corrompido. Este módulo não oferece nenhum caminho para isso — existe um
 * único `scale`, e não há como pedir outro.
 *
 * `contain` também é o que impede RECORTE SILENCIOSO: com `cover`, parte da obra ficaria
 * fora da janela sem aviso, e a criança concluiria que perdeu o traço.
 *
 * ─── ESPAÇO LÓGICO vs. ESPAÇO DE TELA ───────────────────────────────────────────────
 *
 * LÓGICO  → o espaço em que a obra é MODELADA e ARMAZENADA. `W`×`H`. Não muda quando a
 *           janela muda. É a única coordenada que pode ser persistida.
 * TELA    → o espaço em que a obra é EXIBIDA agora, nesta janela, nesta orientação.
 *           `w`×`h`. Muda o tempo todo e NUNCA deve ser persistido.
 *
 * `toScreen`  : lógico → tela (exibir).
 * `toCanonical`: tela → lógico (registrar o toque).
 *
 * A ida-e-volta é idempotente dentro da tolerância de ponto flutuante. A projeção
 * acontece na EXIBIÇÃO; o armazenamento continua sempre no espaço lógico.
 *
 * ─── ENTRADA DEGENERADA ─────────────────────────────────────────────────────────────
 *
 * Com qualquer dimensão ausente, zero ou negativa (janela ainda não medida, primeiro
 * quadro, `logicalSize` ainda não conhecido) não existe projeção possível. Neste caso
 * `valid` é `false`, `scale` é `0`, e `toScreen`/`toCanonical` devolvem `null` — nunca
 * uma coordenada inventada. Coordenada inventada é pior do que coordenada ausente: o
 * chamador que recebe `null` sabe que não sabe; o que recebe `0,0` acha que sabe.
 *
 * ─── O QUE ESTE MÓDULO NÃO FAZ ──────────────────────────────────────────────────────
 *
 * Não salva, não carrega, não descarta, não reamostra, não decide o que é área pintável
 * e não conhece nenhum motor. É aritmética. O recorte do toque à moldura pertence a
 * `TK-A-033`, dentro de cada motor; a reamostragem determinística pertence a `TK-A-036`.
 *
 * Zero dependência nova: só `react`.
 */
import { useMemo } from 'react';

/**
 * Núcleo PURO da projeção — sem React, para que `TA-4` prove em Node o que o aparelho
 * executa, e não uma segunda cópia da conta.
 *
 * @param {{width:number,height:number}} logicalSize tamanho do espaço lógico (`W`×`H`)
 * @param {{width:number,height:number}} windowSize  tamanho da janela atual (`w`×`h`)
 */
export function computeViewportProjection(logicalSize, windowSize) {
  const W = Number(logicalSize && logicalSize.width);
  const H = Number(logicalSize && logicalSize.height);
  const w = Number(windowSize && windowSize.width);
  const h = Number(windowSize && windowSize.height);

  const finito = (n) => Number.isFinite(n) && n > 0;
  if (!finito(W) || !finito(H) || !finito(w) || !finito(h)) {
    return {
      valid: false,
      scale: 0,
      offsetX: 0,
      offsetY: 0,
      displayW: 0,
      displayH: 0,
      logicalW: finito(W) ? W : 0,
      logicalH: finito(H) ? H : 0,
      toScreen: () => null,
      toCanonical: () => null,
    };
  }

  // UM fator, os dois eixos. `min` é o que faz `contain`: escolhe o eixo APERTADO, então
  // o outro sobra — e a sobra vira moldura, não recorte.
  const scale = Math.min(w / W, h / H);
  const displayW = W * scale;
  const displayH = H * scale;
  // Centraliza a sobra: metade de cada lado, nos dois eixos. Um dos dois será 0 (o eixo
  // apertado); o outro é a espessura da moldura.
  const offsetX = (w - displayW) / 2;
  const offsetY = (h - displayH) / 2;

  const toScreen = (p) => {
    if (!p || !Number.isFinite(Number(p.x)) || !Number.isFinite(Number(p.y))) return null;
    return { x: offsetX + Number(p.x) * scale, y: offsetY + Number(p.y) * scale };
  };
  const toCanonical = (p) => {
    if (!p || !Number.isFinite(Number(p.x)) || !Number.isFinite(Number(p.y))) return null;
    return { x: (Number(p.x) - offsetX) / scale, y: (Number(p.y) - offsetY) / scale };
  };

  return { valid: true, scale, offsetX, offsetY, displayW, displayH, logicalW: W, logicalH: H, toScreen, toCanonical };
}

/**
 * Versão React. As dimensões são desestruturadas ANTES do `useMemo` de propósito: quem
 * chama costuma passar um objeto literal novo a cada render, e memoizar pela identidade
 * do objeto seria memoizar nada.
 */
export function useViewportProjection(logicalSize, windowSize) {
  const W = logicalSize && logicalSize.width;
  const H = logicalSize && logicalSize.height;
  const w = windowSize && windowSize.width;
  const h = windowSize && windowSize.height;
  return useMemo(
    () => computeViewportProjection({ width: W, height: H }, { width: w, height: h }),
    [W, H, w, h],
  );
}

export default useViewportProjection;
