/**
 * ovelhaTransition.js — Reducer PURO do CARREGAMENTO/COBERTURA de "Cadê a Ovelhinha?" (2.2e).
 *
 * Substitui o duplo buffer visual frágil do 2.2d. Agora existe UMA única cena real, montada
 * com opacidade 1 por baixo de um OVERLAY OPACO (o card do alvo). A cena só é revelada quando
 * as TRÊS imagens reais reportaram `onDisplay` (não onLoadEnd): o retrato do card, o background
 * da cena e a ovelha da cena — todas do MESMO `roundToken`.
 *
 * O botão "Procurar" só habilita com os três `*Displayed`, nenhum `*Error` e o token corrente.
 * Callbacks de rodada antiga (token diferente) são ignorados. Estado imutável — toda mudança
 * vem por dispatch (nada de prontidão escondida em ref). Sem React, sem relógio, sem I/O.
 */

/** Alvos de imagem monitorados. */
export const ALVOS = Object.freeze(['preview', 'background', 'sceneSheep']);

const CAMPO_DISPLAY = { preview: 'previewDisplayed', background: 'backgroundDisplayed', sceneSheep: 'sceneSheepDisplayed' };
const CAMPO_ERRO = { preview: 'previewError', background: 'backgroundError', sceneSheep: 'sceneSheepError' };

export function initialLoading() {
  return {
    roundToken: 0,
    sceneId: null,
    spotId: null,
    pose: null,
    previewDisplayed: false,
    backgroundDisplayed: false,
    sceneSheepDisplayed: false,
    previewError: false,
    backgroundError: false,
    sceneSheepError: false,
    coverVisible: true,     // abre sempre coberto
    inputEnabled: false,
  };
}

export function todosExibidos(s) {
  return !!s && s.previewDisplayed && s.backgroundDisplayed && s.sceneSheepDisplayed;
}
export function temErro(s) {
  return !!s && (s.previewError || s.backgroundError || s.sceneSheepError);
}
/** Cena pronta para revelar: as 3 imagens exibidas e nenhum erro. NÃO depende de toque. */
export function prontoParaRevelar(s) {
  return todosExibidos(s) && !temErro(s);
}
/** O botão "Procurar" pode ficar habilitado? (coberto, pronto, sem erro). */
export function botaoHabilitado(s) {
  return !!s && s.coverVisible && prontoParaRevelar(s);
}
/** O input do jogo (toque na cena) está bloqueado? */
export function inputBloqueado(s) {
  return !s || !s.inputEnabled;
}

export function loadingReducer(state, action) {
  const s = state || initialLoading();
  const a = action || {};
  switch (a.type) {
    case 'RESET':
      return initialLoading();

    // Cobre a cena IMEDIATAMENTE (sem trocar a rodada ainda). Bloqueia input.
    case 'COBRIR':
      return { ...s, coverVisible: true, inputEnabled: false };

    // Nova rodada: descritor + reset de prontidão/erros; permanece coberto e bloqueado.
    case 'NOVA_RODADA':
      return {
        ...s,
        roundToken: a.token,
        sceneId: a.sceneId,
        spotId: a.spotId,
        pose: a.pose,
        previewDisplayed: false,
        backgroundDisplayed: false,
        sceneSheepDisplayed: false,
        previewError: false,
        backgroundError: false,
        sceneSheepError: false,
        coverVisible: true,
        inputEnabled: false,
      };

    // Uma imagem REAL foi exibida (onDisplay). Ignora token antigo.
    case 'EXIBIDA': {
      if (a.token !== s.roundToken) return s;
      const campo = CAMPO_DISPLAY[a.alvo];
      if (!campo || s[campo]) return s;
      return { ...s, [campo]: true };
    }

    // Uma imagem falhou (onError). Mantém coberto e bloqueado.
    case 'ERRO': {
      if (a.token !== s.roundToken) return s;
      const campo = CAMPO_ERRO[a.alvo];
      if (!campo) return s;
      return { ...s, [campo]: true, coverVisible: true, inputEnabled: false };
    }

    // Tentar novamente a MESMA rodada: limpa prontidão/erros, segue coberto.
    case 'RETRY':
      if (a.token !== s.roundToken) return s;
      return {
        ...s,
        previewDisplayed: false,
        backgroundDisplayed: false,
        sceneSheepDisplayed: false,
        previewError: false,
        backgroundError: false,
        sceneSheepError: false,
        coverVisible: true,
        inputEnabled: false,
      };

    // Revelar: só se pronto. Tira o overlay (o input é liberado depois da saída — LIBERAR).
    case 'REVELAR':
      if (a.token !== s.roundToken || !prontoParaRevelar(s)) return s;
      return { ...s, coverVisible: false };

    // Libera o input (após a saída do overlay).
    case 'LIBERAR':
      if (a.token !== s.roundToken) return s;
      return { ...s, inputEnabled: true };

    default:
      return s;
  }
}

export default {
  ALVOS, initialLoading, todosExibidos, temErro, prontoParaRevelar, botaoHabilitado, inputBloqueado, loadingReducer,
};
