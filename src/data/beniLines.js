/**
 * beniLines.js — Falas curtas do Beni por contexto (camada reutilizável).
 *
 * Cada fala é { text, audioKey? }. O audioKey é a PREPARAÇÃO para áudio futuro
 * (hoje nenhum áudio existe — hasBeniLineAudio retorna false). As telas usam
 * getBeniLine(context) e o componente BeniSpeechCard, sem duplicar lógica.
 *
 * Linguagem: curta, humana, útil. Tom infantil para a criança; tom de "Dica do
 * Beni" (adulto) na Área dos Pais.
 */
export const BENI_LINES = {
  home: [
    { text: 'Oi, eu sou o Beni. Vamos escolher uma aventura da fé hoje?' },
    { text: 'Que bom te ver! Qual história vamos viver juntos agora?' },
  ],
  onboarding: [
    { text: 'Eu sou o Beni e vou caminhar com você em cada história.' },
  ],
  stories: [
    { text: 'Cada história guarda um ensino especial. Escolha uma para começar.' },
  ],
  storyStart: [
    { text: 'Essa história tem uma missão especial. Preste atenção no que Deus ensina!' },
  ],
  sceneComplete: [
    { text: 'Que lindo! Você ganhou uma estrela por completar esta parte.' },
    { text: 'Muito bem! Mais uma parte da jornada concluída.' },
  ],
  quizStart: [
    { text: 'Vamos lembrar juntos? Responda com calma, não tem pressa.' },
  ],
  atelier: [
    { text: 'Agora é sua vez de colorir com carinho.' },
  ],
  storyBook: [
    { text: 'Seu livrinho guarda as partes especiais da sua jornada.' },
  ],
  parentArea: [
    { text: 'Dica do Beni: acompanhe o progresso com calma. Cada pequena conquista importa.' },
    { text: 'Dica do Beni: histórias curtas e frequentes ajudam mais do que sessões longas.' },
  ],
  churchMode: [
    { text: 'Este modo ajuda líderes a usarem as histórias com suas turmas.' },
  ],
  premium: [
    { text: 'Em breve as famílias terão ainda mais histórias e recursos especiais.' },
  ],
};

const DEFAULT_LINE = { text: 'Vamos viver uma história juntos?' };

// Índice estável por dia — varia a fala sem flicker a cada render.
function dayIndex(len) {
  if (!len) return 0;
  return Math.floor(Date.now() / 86400000) % len;
}

/**
 * Retorna uma fala do Beni para um contexto.
 * @param {string} context  — chave de BENI_LINES (ex: 'home', 'parentArea')
 * @param {object} [params]
 * @param {number} [params.index] — força um índice específico (opcional)
 * @returns {{text:string, audioKey?:string}}
 */
export function getBeniLine(context, params = {}) {
  const group = BENI_LINES[context];
  if (!Array.isArray(group) || group.length === 0) return DEFAULT_LINE;
  const idx = Number.isInteger(params.index)
    ? ((params.index % group.length) + group.length) % group.length
    : dayIndex(group.length);
  return group[idx] ?? DEFAULT_LINE;
}

/**
 * Há áudio real para esta fala? HOJE sempre false (preparado para o futuro).
 * Quando os áudios do Beni existirem, esta função passa a consultar o manifesto.
 */
export function hasBeniLineAudio(/* context, index */) {
  return false;
}
