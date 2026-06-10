/**
 * originBack.js — convenção de origem de navegação (Bloco 2).
 *
 * Telas reaproveitadas (Ateliê, Colorir, Baú, Estrelinhas, Livrinho, Criar com
 * Beni) recebem `route.params.from`. O botão Voltar reflete a origem; o destino
 * continua sendo a tela anterior (navigation.goBack), pois essas telas são
 * empurradas na pilha.
 *
 * Valores: home | cultinho | storyComplete | postScene | createWithBeni | tab
 */
export const ORIGIN = {
  HOME: 'home',
  CULTINHO: 'cultinho',
  STORY_COMPLETE: 'storyComplete',
  POST_SCENE: 'postScene',
  CREATE_WITH_BENI: 'createWithBeni',
  TAB: 'tab',
};

/** Rótulo do botão Voltar conforme a origem. */
export function backLabelFor(from) {
  switch (from) {
    case 'home':
    case 'createWithBeni':
      return 'Voltar ao Início';
    case 'cultinho':
      return 'Voltar para Cultinho';
    case 'storyComplete':
      return 'Voltar para a conclusão';
    case 'postScene':
      return 'Voltar para a aventura';
    default:
      return 'Voltar';
  }
}

/** True quando a tela foi aberta pela aba principal (sem botão de voltar). */
export function isFromTab(from) {
  return !from || from === 'tab';
}
