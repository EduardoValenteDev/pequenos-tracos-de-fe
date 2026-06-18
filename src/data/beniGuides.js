/**
 * beniGuides.js — passos dos guias contextuais do Beni por tela (UX 2.2).
 *
 * Cada guia é um array de passos { title, text, variant, target, balloon } usado
 * por BeniGuideOverlay. Só conteúdo/visual — nenhuma regra de negócio. O tour
 * INICIAL (sobre Aventuras, pós-onboarding) fica em BeniAppTour.
 *
 * variant: pose do BeniAvatar · target: destaque aproximado · balloon: posição do card.
 */

// TOUR ÚNICO de abertura (UX 2.4.2): fluxo contínuo de 6 cards sobre Aventuras,
// pós-onboarding. Não há mais "tour inicial" + "guia de Aventuras" separados. Os
// cards do pin (4 e 6) têm o áudio/texto DEFAULT (liberado); a tela troca para a
// versão BLOQUEADA conforme o estado real (só leitura — não mexe no acesso).
export const INITIAL_TOUR = [
  { variant: 'happy',       title: 'Eu sou o Beni',         text: 'Ei, eu sou o Beni! Seu companheiro de aventuras. E vou caminhar com você pelas histórias da Bíblia.', audioKey: 'guide.initial.welcome' },
  { variant: 'teaching',    title: 'Seu mapa de aventuras', text: 'Este é o seu mapa de aventuras. Onde vamos iniciar o seu caminho de fé!',                              audioKey: 'guide.initial.adventures' },
  { variant: 'teaching',    title: 'Seu mapa',              text: 'Aqui em Aventuras, você acompanha sua jornada! As histórias aparecem pelo caminho!',  target: 'adventures.map',           audioKey: 'guide.adventures.path' },
  { variant: 'happy',       title: 'Ver a região',          text: 'O botão Ver mapa abre o seu mapa inteiro! Dessa forma você pode olhar os detalhes com calma!', target: 'adventures.viewMapButton', audioKey: 'guide.adventures.view_region' },
  { variant: 'celebrating', title: 'Siga o brilho',         text: 'Sua primeira aventura está brilhando! Siga por ela!',                                  target: 'adventures.nextPin',       audioKey: 'guide.initial.glow' },
];
// Reservados (NÃO usados no tour inicial): guide.adventures.next_available e
// guide.adventures.next_locked — ficam p/ um guia contextual futuro da aba Aventuras
// (e estados bloqueados). Continuam em beniGuideAudio e na ADVENTURES_GUIDE abaixo.

// Aventuras (aba) — guia contextual SEPARADO: DESATIVADO (substituído pelo tour
// único acima). Mantido só como dado planejado; a tela não o dispara mais.
export const ADVENTURES_GUIDE = [
  { variant: 'teaching',    target: 'adventures.map',           title: 'Seu mapa',      text: 'Você acompanha sua jornada aqui. As histórias aparecem pelo caminho.', audioKey: 'guide.adventures.path' },
  // O pin é DEFAULT (liberado/available); a tela troca título/texto/áudio para a
  // versão BLOQUEADA quando o foco for nextLocked (só leitura — não mexe no acesso).
  { variant: 'celebrating', target: 'adventures.nextPin',       title: 'Siga o brilho', text: 'Este brilho mostra sua próxima aventura. Toque nele quando estiver pronto.', audioKey: 'guide.adventures.next_available' },
  { variant: 'happy',       target: 'adventures.viewMapButton', title: 'Ver a região',  text: 'O botão Ver mapa abre o mapa inteiro. Olhe os detalhes com calma.',     audioKey: 'guide.adventures.view_region' },
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
