/**
 * beniGuides.js — passos dos guias contextuais do Beni por tela (UX 2.2).
 *
 * Cada guia é um array de passos { title, text, variant, target, balloon } usado
 * por BeniGuideOverlay. Só conteúdo/visual — nenhuma regra de negócio. O tour
 * INICIAL (sobre Aventuras, pós-onboarding) fica em BeniAppTour.
 *
 * variant: pose do BeniAvatar · target: destaque aproximado · balloon: posição do card.
 */

// Aventuras (aba) — aparece na visita à aba, depois do tour inicial.
export const ADVENTURES_GUIDE = [
  { variant: 'teaching',    target: 'map',      balloon: 'bottom', title: 'Seu caminho',   text: 'Aqui você acompanha as histórias da sua jornada.' },
  { variant: 'celebrating', target: 'pin',      balloon: 'bottom', title: 'O próximo passo', text: 'O brilho mostra onde continuar.' },
  { variant: 'happy',       target: 'topRight', balloon: 'bottom', title: 'Ver mapa',       text: 'Este botão abre uma visão maior da região.' },
];

// Home
export const HOME_GUIDE = [
  { variant: 'happy',    target: 'mainArea', balloon: 'bottom', title: 'Seu cantinho',  text: 'Aqui ficam os atalhos para continuar sua jornada.' },
  { variant: 'teaching', target: 'mainArea', balloon: 'bottom', title: 'Beni por perto', text: 'Quando aparecer uma dica do Beni, ele está te ajudando a encontrar o caminho.' },
];

// Ateliê
export const ATELIER_GUIDE = [
  { variant: 'artist',   target: 'mainArea', balloon: 'bottom', title: 'Hora de colorir',  text: 'Aqui você pinta desenhos das histórias.' },
  { variant: 'happy',    target: 'mainArea', balloon: 'bottom', title: 'Escolha suas cores', text: 'Toque nas cores para pintar do seu jeito.' },
  { variant: 'celebrating', target: 'mainArea', balloon: 'bottom', title: 'Guarde sua arte', text: 'Quando terminar, sua arte pode ficar salva para você ver depois.' },
];

// Estrelinhas
export const STARS_GUIDE = [
  { variant: 'celebrating', target: 'mainArea', balloon: 'bottom', title: 'Suas estrelinhas', text: 'Aqui aparecem as conquistas da sua caminhada.' },
  { variant: 'teaching',    target: 'mainArea', balloon: 'bottom', title: 'Continue aprendendo', text: 'Cada história vivida pode acender uma nova conquista.' },
];

// Perfil
export const PROFILE_GUIDE = [
  { variant: 'happy',    target: 'top',      balloon: 'bottom', title: 'Sua carinha', text: 'Aqui ficam seu nome e seu avatar.' },
  { variant: 'teaching', target: 'mainArea', balloon: 'bottom', title: 'Seu jeitinho', text: 'Você pode deixar sua jornada com a sua cara.' },
];

// Área dos Pais (tom para responsáveis). O 2º passo só entra se Modo Criador ativo.
export const PARENT_GUIDE_BASE = [
  { variant: 'parent', target: 'top', balloon: 'bottom', title: 'Área dos Pais', text: 'Aqui ficam configurações e informações importantes para os responsáveis.' },
];
export const PARENT_GUIDE_CREATOR_STEP = {
  variant: 'parent', target: 'parentTools', balloon: 'bottom', title: 'Ferramentas seguras',
  text: 'Algumas opções ajudam a testar e ajustar o app sem mudar a jornada da criança.',
};
