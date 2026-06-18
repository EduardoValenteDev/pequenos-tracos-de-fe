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
  { variant: 'teaching',    title: 'Seu mapa de aventuras', text: 'Este é o seu mapa de aventuras. Onde vamos iniciar o seu caminho de fé!',                              audioKey: 'guide.initial.adventures', highlightTab: 'adventures' },
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

// Home (Home 1.0) — guia falado CURTO de 5 cards, com alvos MEDIDOS dos módulos
// principais. Card 1 sem alvo (mostra sem seta, posição segura). Não explica outras
// abas (Ateliê/Estrelinhas/Perfil/Área dos Pais têm guia próprio depois).
export const HOME_GUIDE = [
  { variant: 'happy',       title: 'Seu início',            text: 'Aqui ficam os caminhos principais da sua jornada.', audioKey: 'guide.home.welcome',      highlightTab: 'home' },
  { variant: 'teaching',    title: 'Sua aventura atual',    text: 'Aqui está a história para continuar sua jornada.', audioKey: 'guide.home.continue',     target: 'home.continue', noRing: true },
  { variant: 'happy',       title: 'Cultinho em Casa',      text: 'Um momento de fé em família.',                      audioKey: 'guide.home.cultinho',     target: 'home.cultinho' },
  { variant: 'celebrating', title: 'Baú do Beni',           text: 'Suas lembranças especiais ficam aqui.',             audioKey: 'guide.home.bau_beni',     target: 'home.bau' },
  { variant: 'artist',      title: 'Criar com Beni',        text: 'Crie comigo usando imaginação e fé.',               audioKey: 'guide.home.create_beni',  target: 'home.criar' },
  { variant: 'happy',       title: 'Momento com Beni',      text: 'O Beni fica pertinho para conversar e ajudar.',     audioKey: 'guide.home.momento_beni', target: 'home.momento' },
];

// Ateliê (Ateliê 1.0) — guia falado CURTO de 4 cards, com alvos MEDIDOS. Card 1
// destaca a aba Ateliê (tab bar / sidebar). Não explica outras telas.
export const ATELIER_GUIDE = [
  { variant: 'artist',      title: 'Seu Ateliê',        text: 'Aqui suas histórias viram arte.',               audioKey: 'guide.atelier.welcome',   highlightTab: 'atelier' },
  { variant: 'happy',       title: 'Colorir histórias', text: 'Escolha uma cena da Bíblia para colorir.',      audioKey: 'guide.atelier.coloring',  target: 'atelier.coloring' },
  { variant: 'artist',      title: 'Criar livre',       text: 'Crie do seu jeito, usando imaginação e fé.',    audioKey: 'guide.atelier.free_draw', target: 'atelier.free_draw' },
  { variant: 'celebrating', title: 'Minhas artes',      text: 'Aqui ficam as artes que você já criou.',        audioKey: 'guide.atelier.gallery',   target: 'atelier.gallery' },
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
