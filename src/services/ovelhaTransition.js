/**
 * ovelhaTransition.js — Reducer PURO da transição em DUPLO BUFFER de "Cadê a Ovelhinha?".
 *
 * Separa a LÓGICA de staging/promoção da renderização (testável sem React). A tela mantém
 * duas camadas completas (activeLayer + stagingLayer); este reducer decide QUANDO a staging
 * está pronta e QUANDO promover, garantindo que:
 *   • a activeLayer nunca é desmontada antes da staging estar pronta;
 *   • a ovelha e o background novos entram JUNTOS (mesma opacidade de camada);
 *   • a próxima ovelha nunca aparece sobre o background anterior;
 *   • callbacks de load/frames de uma rodada antiga (seq diferente) são ignorados.
 *
 * Sem React, sem relógio, sem I/O. `seq` é o carimbo da transição atual.
 */

export const TFASE = Object.freeze({
  IDLE: 'idle',           // nada em jogo
  PREVIEW: 'preview',     // card do alvo visível; staging carregando (invisível)
  CROSSFADE: 'crossfade', // active some, staging aparece (juntos)
  ACTIVE: 'active',       // procurando (input liberado)
});

export function initialTransition() {
  return {
    fase: TFASE.IDLE,
    seq: 0,
    activeRound: null,
    stagingRound: null,
    bgLoaded: false,
    poseLoaded: false,
    framesReady: false,
    previewMinElapsed: false,
    inputLiberado: false,
  };
}

/** A staging está realmente pronta (bg REAL + ovelha REAL + 2 frames), para esta seq? */
export function stagingPronta(s) {
  return !!s && !!s.stagingRound && s.bgLoaded && s.poseLoaded && s.framesReady;
}

/** Pode iniciar o cross-fade? (staging pronta E tempo mínimo do card cumprido). */
export function podeCrossfade(s) {
  return !!s && s.fase === TFASE.PREVIEW && stagingPronta(s) && s.previewMinElapsed;
}

/** O input está bloqueado? (só liberado quando ACTIVE e a promoção ocorreu). */
export function inputBloqueado(s) {
  return !s || s.fase !== TFASE.ACTIVE || !s.inputLiberado;
}

/** O card do alvo está visível? */
export function mostrandoAlvo(s) {
  return !!s && s.fase === TFASE.PREVIEW;
}

export function transitionReducer(state, action) {
  const s = state || initialTransition();
  switch (action && action.type) {
    // Começa a preparar uma rodada: card do alvo + staging (invisível). NÃO mexe na active.
    case 'PREPARAR':
      return {
        ...s,
        fase: TFASE.PREVIEW,
        seq: action.seq,
        stagingRound: action.round,
        bgLoaded: false,
        poseLoaded: false,
        framesReady: false,
        previewMinElapsed: false,
        inputLiberado: false,
      };
    case 'BG_CARREGADO':
      if (action.seq !== s.seq) return s;               // callback antigo: ignora
      return { ...s, bgLoaded: true };
    case 'POSE_CARREGADA':
      if (action.seq !== s.seq) return s;
      return { ...s, poseLoaded: true };
    case 'FRAMES_PRONTOS':
      if (action.seq !== s.seq) return s;
      return { ...s, framesReady: true };
    case 'PREVIEW_MIN':
      if (action.seq !== s.seq) return s;
      return { ...s, previewMinElapsed: true };
    // Inicia o cross-fade — só se a staging estiver pronta e o tempo mínimo cumprido.
    case 'CROSSFADE':
      if (action.seq !== s.seq || !podeCrossfade(s)) return s;
      return { ...s, fase: TFASE.CROSSFADE };
    // Promove staging → active (juntas). Só a partir do cross-fade, mesma seq.
    case 'PROMOVER':
      if (action.seq !== s.seq || s.fase !== TFASE.CROSSFADE) return s;
      return {
        ...s,
        fase: TFASE.ACTIVE,
        activeRound: s.stagingRound,
        stagingRound: null,
        inputLiberado: true,
      };
    case 'RESET':
      return initialTransition();
    default:
      return s;
  }
}

export default {
  TFASE, initialTransition, stagingPronta, podeCrossfade, inputBloqueado, mostrandoAlvo, transitionReducer,
};
