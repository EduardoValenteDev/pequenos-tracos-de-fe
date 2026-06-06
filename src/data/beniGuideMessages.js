/**
 * beniGuideMessages.js — Catálogo central das falas do Beni (guia).
 *
 * Linguagem: frases curtas, acolhedoras, tom bíblico leve, infantil. Sem tom
 * adulto, sem pressão, sem culpa, sem promessas. Beni acompanha a jornada.
 *
 * Use getBeniGuideMessage(context, params) para obter uma string segura.
 */

export const BENI_GUIDE_MESSAGES = {
  home: [
    'Vamos abrir uma história juntos?',
    'Eu preparei uma aventura para você.',
    'Hoje temos um caminho bonito para seguir.',
  ],
  homeWithProgress: [
    'Vamos continuar de onde paramos?',
    'Sua próxima parada está pronta.',
    'Beni guardou seu caminho.',
  ],
  adventures: [
    'Escolha uma história e eu caminho com você.',
    'Cada parada tem uma descoberta.',
    'Qual mundo vamos visitar agora?',
  ],
  trailFree: [
    'Esse caminho é perfeito para começar.',
    'Aqui ficam os primeiros passos da fé.',
  ],
  trailPremium: [
    'Peça a um responsável para abrir esse caminho.',
    'Esse mundo especial espera por você.',
  ],
  atelier: [
    'Vamos criar uma arte com carinho?',
    'Sua imaginação também conta histórias.',
    'Escolha uma cor e comece devagar.',
  ],
  achievements: [
    'Olha quantas estrelinhas você encontrou.',
    'Cada estrela mostra um passo da sua jornada.',
  ],
  profile: [
    'Esse é o seu cantinho no app.',
    'Aqui eu guardo seu jeitinho de brincar.',
  ],
  blockedStory: [
    'Peça a um responsável para abrir essa aventura.',
    'Esse caminho precisa da ajuda de um adulto.',
  ],
  completedStory: [
    'Você completou essa aventura.',
    'Que linda jornada você terminou.',
  ],
  inProgressStory: [
    'Vamos continuar essa história?',
    'A próxima cena está esperando.',
  ],

  // ── Experiência dentro da aventura ──
  storyIntro: [
    'Vamos descobrir essa história juntos?',
    'Essa aventura vai tocar seu coração.',
    'Pronto para começar? Eu vou com você.',
  ],
  continueStory: [
    'Vamos continuar de onde paramos?',
    'A próxima cena está esperando por você.',
  ],
  sceneStart: [
    'Olhe com atenção. Essa parte é especial.',
    'Vamos descobrir o que acontece agora?',
    'Beni está com você nesta cena.',
  ],
  sceneNoIllustration: [
    'Essa cena vai ganhar uma ilustração em breve.',
    'Por enquanto, leia com calma comigo.',
    'Vamos imaginar essa parte juntos?',
  ],
  sceneAudioPending: [
    'O som será adicionado depois.',
    'Hoje você pode ler essa parte com calma.',
  ],
  sceneCompleted: [
    'Você ganhou uma estrelinha!',
    'Mais uma estrelinha no seu caminho.',
    'Você está indo muito bem!',
  ],
  storyCompleted: [
    'Essa aventura ficou guardada no seu coração.',
    'Que linda jornada você terminou!',
    'Você completou essa aventura com carinho.',
  ],
  premiumBlocked: [
    'Peça a um responsável para abrir esse caminho.',
    'Esse caminho especial precisa da ajuda de um adulto.',
  ],
};

const DEFAULT_MESSAGE = 'Vamos abrir uma história juntos?';

// Índice estável por dia — varia a fala sem flicker a cada render.
function dayIndex(len) {
  if (!len) return 0;
  return Math.floor(Date.now() / 86400000) % len;
}

/**
 * Resolve a fala do Beni para um contexto.
 *
 * @param {string} context — chave do grupo (ex: 'home', 'adventures', 'atelier')
 * @param {object} [params]
 * @param {boolean} [params.hasProgress]  — em 'home', alterna para 'homeWithProgress'
 * @param {boolean} [params.isLocked]     — em 'adventures'/trilha, alterna para 'trailPremium'
 * @param {boolean} [params.premium]      — trilha premium → 'trailPremium'
 * @param {boolean} [params.isCompleted]  — história concluída → 'completedStory'
 * @param {number}  [params.index]        — força um índice específico (opcional)
 * @returns {string} mensagem segura (nunca vazia)
 */
export function getBeniGuideMessage(context, params = {}) {
  let key = context;

  // Resolução de intenção por estado
  if (context === 'home' && params.hasProgress) key = 'homeWithProgress';
  if (context === 'trail') key = (params.premium || params.isLocked) ? 'trailPremium' : 'trailFree';
  if (context === 'story') {
    if (params.isLocked) key = 'blockedStory';
    else if (params.isCompleted) key = 'completedStory';
    else if (params.hasProgress) key = 'inProgressStory';
    else key = 'adventures';
  }

  const group = BENI_GUIDE_MESSAGES[key] ?? BENI_GUIDE_MESSAGES[context];
  if (!Array.isArray(group) || group.length === 0) return DEFAULT_MESSAGE;

  const idx = Number.isInteger(params.index)
    ? ((params.index % group.length) + group.length) % group.length
    : dayIndex(group.length);

  return group[idx] ?? DEFAULT_MESSAGE;
}
