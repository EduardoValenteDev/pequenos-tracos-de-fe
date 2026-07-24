/**
 * coloring60PaintMetrics.js — MEDIDA REAL DE PINTURA do Colorir 60 (C60 · Parte 3).
 *
 * PROBLEMA QUE ESTE MÓDULO RESOLVE. Até aqui "tem pintura" era inferido de duas fontes que
 * NÃO medem cor nenhuma:
 *   1) o sinal `PAINTED` do canvas — de MÃO ÚNICA: uma vez verdadeiro, nunca voltava a falso
 *      (apagar tudo continuava "pintado"); e `loadPaint` o forçava a verdadeiro só por existir
 *      um payload salvo;
 *   2) `hasMeaningfulPaint(payload)` — que mede o TAMANHO DO TEXTO BASE64, não a tinta: um PNG
 *      totalmente TRANSPARENTE de 1000×1500 passa folgado do limiar de 1000 caracteres.
 * Por isso "Pronto" concluía folha em branco e desenho apagado seguia concluído.
 *
 * O QUE ESTE MÓDULO É. Funções PURAS e SÍNCRONAS, SEM DEPENDÊNCIA ALGUMA (sem React, sem
 * AsyncStorage, sem canvas, sem I/O): recebem a contagem de pixels que o MOTOR DE PINTURA
 * realmente contou e decidem se existe COR SUFICIENTE. Como não importa nada, o smoke executa
 * estas funções REAIS (harness `new Function`) — mudar uma regra aqui muda o veredito lá.
 *
 * DE ONDE VÊM OS NÚMEROS. Do próprio motor (`ColoringCanvas`), que é o único lugar do app com
 * acesso aos pixels:
 *   - `paintablePx` — quantos pixels do retângulo da ARTE são realmente pintáveis, isto é, NÃO
 *     são traço/contorno (`isBFSBarrier`). Já exclui o lineart; a moldura creme fora da imagem
 *     nunca entra na conta. É calculado UMA vez, na abertura.
 *   - `paintedPx` — quantos pixels da CAMADA DE TINTA têm alfa > 0 dentro desse mesmo retângulo.
 *     Transparente não conta; branco só conta se a criança pintou de branco (é cor escolhida).
 *   - `revisionId` — contador monotônico do motor, incrementado a CADA operação que muda a tinta
 *     (pintar, apagar, desfazer, limpar, carregar arte salva). É o que permite provar que o
 *     instantâneo gravado é o MESMO estado que foi validado (Parte 4).
 *
 * CRITÉRIO (Parte 3). "Pelo menos uma operação de cor válida + cobertura mínima da área pintável",
 * sem exigir número de cores: `coverage = paintedPx / paintablePx >= C60_MIN_PAINT_COVERAGE`.
 * O limiar de referência é 0,5% — resíduo microscópico (um toque perdido, um pixel solto) NÃO
 * conclui; a primeira região de verdade preenchida conclui.
 */

/**
 * Cobertura mínima da ÁREA PINTÁVEL para uma atividade poder ser concluída (0,5%).
 * Referência da Parte 3, ajustada ao modelo real: o denominador já exclui traço/contorno, então
 * 0,5% corresponde a uma região preenchida de verdade, não a um respingo.
 */
export const C60_MIN_PAINT_COVERAGE = 0.005;

/**
 * Piso ABSOLUTO de pixels pintados. Protege o caso degenerado em que `paintablePx` é muito pequeno
 * (canvas minúsculo / medição incompleta) e a razão sozinha aceitaria um punhado de pixels.
 */
export const C60_MIN_PAINTED_PX = 250;

/** Estado neutro: nada medido ainda. NUNCA é tratado como "tem cor". */
export const EMPTY_PAINT_METRICS = Object.freeze({
  valid: false,
  hasAnyPaint: false,
  paintedPx: 0,
  paintablePx: 0,
  coverage: 0,
  revisionId: null,
});

function toFiniteInt(value) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

/**
 * normalizePaintMetrics(raw) — normaliza a medida vinda do motor (objeto já parseado OU string
 * JSON). Qualquer coisa que não traga `paintedPx` e `paintablePx` numéricos e `paintablePx > 0`
 * devolve o estado neutro com `valid:false` — e estado neutro JAMAIS conclui. Nunca lança.
 */
export function normalizePaintMetrics(raw) {
  let obj = raw;
  if (typeof raw === 'string') {
    try { obj = JSON.parse(raw); } catch { return EMPTY_PAINT_METRICS; }
  }
  if (!obj || typeof obj !== 'object') return EMPTY_PAINT_METRICS;
  const paintedPx = toFiniteInt(obj.paintedPx);
  const paintablePx = toFiniteInt(obj.paintablePx);
  if (paintedPx === null || paintablePx === null || paintablePx <= 0) return EMPTY_PAINT_METRICS;
  const rev = toFiniteInt(obj.rev != null ? obj.rev : obj.revisionId);
  return Object.freeze({
    valid: true,
    hasAnyPaint: paintedPx > 0,
    paintedPx,
    paintablePx,
    coverage: paintedPx / paintablePx,
    revisionId: rev,
  });
}

/**
 * hasMeaningfulColor(metricsOrRaw) — VERDADE ÚNICA de "existe cor suficiente para concluir".
 * Substitui o antigo sinal de mão única: como é recalculado a cada operação do motor, apagar
 * tudo faz voltar a `false` no mesmo toque (Parte 3/5). Medida inválida ⇒ `false` (fail-closed).
 */
export function hasMeaningfulColor(metricsOrRaw) {
  const m = metricsOrRaw && metricsOrRaw.valid !== undefined
    ? metricsOrRaw
    : normalizePaintMetrics(metricsOrRaw);
  if (!m.valid || !m.hasAnyPaint) return false;
  if (m.paintedPx < C60_MIN_PAINTED_PX) return false;
  return m.coverage >= C60_MIN_PAINT_COVERAGE;
}

/**
 * readPaintMetricsFromSnapshot(payload) — extrai a MESMA medida de dentro de um instantâneo
 * exportado pelo motor (payload v2). É assim que se prova que o que foi GRAVADO tem cor de
 * verdade, sem precisar decodificar o PNG no lado nativo. Payload legado (sem os campos) devolve
 * `valid:false` — e quem decide o que fazer com isso é o chamador (nunca conclui às cegas).
 */
export function readPaintMetricsFromSnapshot(payload) {
  if (typeof payload !== 'string' || payload.length === 0) return EMPTY_PAINT_METRICS;
  if (payload.startsWith('data:')) return EMPTY_PAINT_METRICS; // v1 legado não carrega medida
  let obj;
  try { obj = JSON.parse(payload); } catch { return EMPTY_PAINT_METRICS; }
  return normalizePaintMetrics(obj);
}

/**
 * snapshotHasMeaningfulColor(payload) — o instantâneo, por si só, prova cor suficiente?
 * Usado na TRANSAÇÃO (Parte 4) antes de gravar e na COLEÇÃO (Parte 7) ao reidratar: uma arte
 * cujo instantâneo não prova cor não pode sustentar "concluída".
 */
export function snapshotHasMeaningfulColor(payload) {
  return hasMeaningfulColor(readPaintMetricsFromSnapshot(payload));
}

/**
 * snapshotMatchesRevision(payload, revisionId) — o instantâneo é EXATAMENTE da revisão que foi
 * validada? É o passo 6 da transação atômica ("verificar mesma revisão"): se a criança pintou de
 * novo entre a validação e a exportação, o instantâneo é de outro estado e a transação recomeça
 * em vez de gravar um par pintura/instantâneo desencontrado.
 */
export function snapshotMatchesRevision(payload, revisionId) {
  const expected = toFiniteInt(revisionId);
  if (expected === null) return false;
  const m = readPaintMetricsFromSnapshot(payload);
  return m.valid && m.revisionId === expected;
}
