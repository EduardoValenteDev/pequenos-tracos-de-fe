/**
 * palavrinhasVisualDirector.js — Diretor VISUAL de "Palavrinhas do Beni" (P4R6).
 *
 * MÓDULO PURO (sem React Native, Expo, UI, áudio, timers, storage). Separa a COREOGRAFIA
 * visual da máquina de estados pura: define os grupos de poses por apresentação, os presets
 * de enquadramento por pose, os eventos visuais, sua PRIORIDADE (só um evento principal domina),
 * os tempos mínimos de permanência e os mapeadores de pose. A tela consome estas regras;
 * a máquina (palavrinhasGameMachine) continua responsável apenas pela lógica do jogo.
 */

/* ─────────── Grupos de poses por apresentação ─────────── */

/** Poses permitidas no PORTRAIT (faixa do guia, durante a rodada). */
export const PORTRAIT_POSES = Object.freeze(['avatarBase', 'acenando', 'ensinando', 'descansando', 'apontandoDireita', 'apontandoEsquerda']);
/** Poses permitidas SOMENTE em EVENT (celebrações/telas/Baú). */
export const EVENT_POSES = Object.freeze(['celebrando', 'celebrando2', 'comBau', 'orando', 'atelie']);

/**
 * Presets de enquadramento por pose (P4R7 — derivados da auditoria REAL dos arquivos).
 *
 * Auditoria: TODAS as artes são ilustrações OPACAS full-bleed (sem transparência), com fundo
 * próprio; poses 01–07 são 4:5 (960×1200) e 08–11 são 1:1 (1024×1024). Por isso `contain`
 * causava faixas do fundo da moldura (bandas brancas/creme) e cantos retos. **Solução: `cover`**
 * (a arte preenche integralmente o quadro; o próprio fundo full-bleed elimina qualquer banda),
 * com `overscan` (>1) para eliminar AA de borda e `translateYf`/`translateXf` (frações do lado)
 * para posicionar o rosto. A moldura (borda/tamanho) NÃO muda por pose.
 *
 * Campos: { resizeMode:'cover', scale, overscan, translateXf, translateYf }. `translate*f` são
 * frações do lado (multiplicadas por `size` no componente).
 */
const P_4x5 = { resizeMode: 'cover', scale: 1, overscan: 1.06, translateXf: 0, translateYf: -0.04 };   // 4:5 → cover recorta topo/base; leve subida p/ o rosto
const P_1x1 = { resizeMode: 'cover', scale: 1, overscan: 1.04, translateXf: 0, translateYf: 0 };        // 1:1 → preenche o quadro
export const BENI_STAGE_PRESETS = Object.freeze({
  avatarBase:        { portrait: { ...P_4x5 }, event: { ...P_4x5, overscan: 1.02, translateYf: 0 } },
  acenando:          { portrait: { ...P_4x5 }, event: { ...P_4x5, overscan: 1.02, translateYf: 0 } },
  ensinando:         { portrait: { ...P_4x5 }, event: { ...P_4x5, overscan: 1.02, translateYf: 0 } },
  descansando:       { portrait: { ...P_1x1 }, event: { ...P_1x1 } },
  apontandoDireita:  { portrait: { ...P_1x1, translateXf: 0.02 }, event: { ...P_1x1 } },
  apontandoEsquerda: { portrait: { ...P_1x1, translateXf: -0.02 }, event: { ...P_1x1 } },
  celebrando:        { event: { ...P_4x5, overscan: 1.02, translateYf: 0 } },
  celebrando2:       { event: { ...P_1x1 } },
  comBau:            { event: { ...P_4x5, overscan: 1.02, translateYf: 0 } },
  orando:            { event: { ...P_4x5, overscan: 1.02, translateYf: 0 } },
  atelie:            { event: { ...P_4x5, overscan: 1.02, translateYf: 0 } },
});
const PRESET_NEUTRO = { resizeMode: 'cover', scale: 1, overscan: 1.04, translateXf: 0, translateYf: 0 };

/** Uma pose pode ser usada nesta apresentação? PORTRAIT nunca aceita pose event; EVENT aceita ambas. */
export function poseSuportada(pose, presentation = 'portrait') {
  if (presentation === 'portrait') return PORTRAIT_POSES.includes(pose);
  return EVENT_POSES.includes(pose) || PORTRAIT_POSES.includes(pose);
}

/** No PORTRAIT, garante uma pose permitida (event → avatarBase). */
export function posePortraitSegura(pose) {
  return PORTRAIT_POSES.includes(pose) ? pose : 'avatarBase';
}

/** Preset de enquadramento (sempre um objeto válido, com `cover`). */
export function presetDe(pose, presentation = 'portrait') {
  const p = BENI_STAGE_PRESETS[pose] || {};
  return p[presentation] || PRESET_NEUTRO;
}

/** Poses mínimas que precisam estar prontas antes de "Abrir o Livro" (§3). */
export const POSES_MINIMAS = Object.freeze(['avatarBase', 'ensinando', 'apontandoDireita', 'celebrando', 'celebrando2', 'comBau']);
/** Pose event de fallback (já entre as mínimas) para nunca abrir moldura vazia. */
export const EVENT_FALLBACK = 'celebrando';

/* ─────────── Eventos visuais + prioridade + permanência ─────────── */

export const EVENTOS_VISUAIS = Object.freeze({
  TEMPO_ESGOTADO: 'TEMPO_ESGOTADO', IDLE: 'IDLE', LETRA_CORRETA: 'LETRA_CORRETA', ERRO: 'ERRO', PALAVRA_COMPLETA: 'PALAVRA_COMPLETA',
  BRILHO_TRIPLO: 'BRILHO_TRIPLO', SUPER_BENI: 'SUPER_BENI', BAU: 'BAU', PODER_ATIVADO: 'PODER_ATIVADO',
  TRANSICAO_PAGINA: 'TRANSICAO_PAGINA', TEMPO_CRITICO: 'TEMPO_CRITICO',
});

/** Prioridade (P4R8 §20): TEMPO_ESGOTADO vence TODOS; depois só UM evento principal domina. */
export const PRIORIDADE_EVENTOS = Object.freeze([
  'TEMPO_ESGOTADO', 'SUPER_BENI', 'BRILHO_TRIPLO', 'BAU', 'PODER_ATIVADO', 'PALAVRA_COMPLETA', 'ERRO', 'LETRA_CORRETA', 'TRANSICAO_PAGINA', 'TEMPO_CRITICO', 'IDLE',
]);

/**
 * Layouts DETERMINÍSTICOS de partículas por evento (sem Math.random). Cada partícula:
 * { anguloDeg, distF (fração do lado), size, tardarMs }. Estrelas grandes/pequenas de alto contraste.
 */
function arco(n, base, dist, size, gapMs) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ anguloDeg: base + (360 / n) * i, distF: dist, size, tardarMs: i * gapMs });
  return out;
}
export const PARTICULAS_TRIPLO = Object.freeze([
  ...arco(3, -90, 0.62, 32, 70),     // 3 estrelas grandes (28–36)
  ...arco(4, -45, 0.86, 18, 55),     // 4 estrelas secundárias (16–22)
]);
export const PARTICULAS_SUPER = Object.freeze([
  ...arco(6, -90, 0.66, 34, 55),     // 6 grandes
  ...arco(6, -60, 0.92, 20, 45),     // 6 médias → 12 no total
]);
export const PARTICULAS_PALAVRA = Object.freeze(arco(4, -90, 0.5, 16, 40));   // no máx. 4 pequenas
export const RAIOS_SUPER = 8;   // raios largos dourado/laranja

/** Evento dominante entre candidatos (mais prioritário vence). PURO. */
export function eventoDominante(cands = []) {
  for (const e of PRIORIDADE_EVENTOS) if (cands.includes(e)) return e;
  return 'IDLE';
}

/** Marco de sequência de palavras → evento de celebração (Super vence Triplo no mesmo marco). PURO. */
export function eventoDoMarco(seq = 0) {
  if (seq > 0 && seq % 5 === 0) return 'SUPER_BENI';
  if (seq > 0 && seq % 3 === 0) return 'BRILHO_TRIPLO';
  return 'PALAVRA_COMPLETA';
}

/** Permanência MÍNIMA (ms) por evento (P4R7 §5). PURO. */
export const PERMANENCIA_MS = Object.freeze({
  IDLE: 800, LETRA_CORRETA: 800, ERRO: 800, PALAVRA_COMPLETA: 700,
  BRILHO_TRIPLO: 1200, SUPER_BENI: 1700, PODER_ATIVADO: 900, TRANSICAO_PAGINA: 800, TEMPO_CRITICO: 800,
});
export function permanenciaDe(evento) { return PERMANENCIA_MS[evento] || 650; }

/* ─────────── Mapeadores de pose ─────────── */

/** Pose do GUIA (portrait) por evento/contexto — SEMPRE uma pose portrait permitida. PURO. */
export function posePortraitDe({ evento = 'IDLE', modoResgate = false, tempoCritico = false } = {}) {
  if (modoResgate) return 'apontandoEsquerda';
  if (tempoCritico) return 'ensinando';
  switch (evento) {
    case 'SUPER_BENI':
    case 'BRILHO_TRIPLO':
    case 'PALAVRA_COMPLETA':
    case 'LETRA_CORRETA': return 'acenando';
    case 'ERRO': return 'ensinando';
    case 'PODER_ATIVADO': return 'apontandoDireita';
    default: return 'apontandoDireita';
  }
}

/** Pose do EVENTO (overlay grande) — pose event. PURO. */
export function poseEventDe(evento) {
  if (evento === 'SUPER_BENI') return 'celebrando2';
  if (evento === 'BRILHO_TRIPLO') return 'celebrando';
  if (evento === 'BAU') return 'comBau';
  return 'celebrando';
}
