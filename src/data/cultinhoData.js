/**
 * cultinhoData.js — conteúdo LOCAL do "Cultinho em Casa" (UX 1.0 — Bloco 4B).
 *
 * Pequeno culto infantil em casa (3–5 min): uma passagem, o Beni explica em
 * poucas frases, uma conversa em família e uma oração curtinha.
 *
 * REGRAS:
 *   - Conteúdo fixo e leve (sem backend, sem IA em tempo real, sem texto livre).
 *   - "fraseDoDia" é uma frase de fé curta e fiel — NÃO é citação literal de
 *     versículo (a referência bíblica real vem dos dados da história).
 *   - beniExplica: 3 a 5 frases curtas, em tom de pastor infantil.
 *   - Histórias sem entrada própria caem em um fallback seguro derivado dos
 *     campos já existentes (licaoCoracao / shortDescription / cena).
 */

export const CULTINHO_BY_STORY = {
  creation: {
    fraseDoDia: 'Deus criou o céu, a terra e você, com muito amor.',
    beniExplica: [
      'Nessa história, Beni vê que Deus criou tudo: a luz, o mar, os animais e as pessoas.',
      'Cada coisinha foi feita com muito carinho — até você!',
      'Quando a gente olha a natureza, lembra que Deus cuida de nós.',
      'Hoje podemos agradecer a Deus por tudo o que Ele fez.',
    ],
    pergunta: 'O que Deus criou que você mais gosta?',
    oracao: 'Querido Deus, obrigado por criar o mundo e por me criar com amor. Amém.',
  },
  noah: {
    fraseDoDia: 'Deus protegeu Noé e a sua família com cuidado.',
    beniExplica: [
      'Noé confiou em Deus e cuidou de cada animalzinho na arca.',
      'Mesmo na chuva bem forte, Deus guardou todo mundo em segurança.',
      'Deus sempre cumpre o que promete e cuida da nossa família também.',
      'A gente pode confiar em Deus mesmo quando vem tempestade.',
    ],
    pergunta: 'Como você acha que Noé cuidou dos animais com amor?',
    oracao: 'Querido Deus, obrigado por cuidar da minha família. Eu confio em Você. Amém.',
  },
  david_goliath: {
    fraseDoDia: 'Com a ajuda de Deus, Davi foi muito corajoso.',
    beniExplica: [
      'Davi era pequeno, mas confiou em Deus para enfrentar o gigante.',
      'A coragem dele não vinha do tamanho — vinha da fé.',
      'Deus nos ajuda a ser corajosos quando a gente fica com medo.',
      'Com Deus pertinho, podemos enfrentar os desafios do dia.',
    ],
    pergunta: 'Onde você pode ser corajoso como Davi?',
    oracao: 'Querido Deus, me ajude a ser corajoso e a confiar em Você. Amém.',
  },
  jesus_children: {
    fraseDoDia: 'Jesus ama muito as crianças e quer elas pertinho.',
    beniExplica: [
      'Nessa história, Jesus abraça as crianças e diz que elas são importantes.',
      'Ninguém é pequeno demais para o amor de Jesus.',
      'Você pode falar com Jesus a qualquer hora — Ele te escuta.',
      'O coração de Jesus está sempre aberto para você.',
    ],
    pergunta: 'Como Jesus mostra que ama muito as crianças?',
    oracao: 'Querido Jesus, obrigado por me amar tanto. Quero ficar pertinho de Você. Amém.',
  },
};

/**
 * Retorna o conteúdo do Cultinho para uma história. Usa a entrada curada quando
 * existe; senão, monta um fallback seguro a partir dos dados já existentes da
 * história (sem inventar versículo). Nunca lança.
 */
export function getCultinhoForStory(story) {
  const curated = story && CULTINHO_BY_STORY[story.id];
  if (curated) return curated;

  const frase =
    (story && (story.licaoCoracao || story.shortDescription)) ||
    'Deus cuida de você com muito amor.';

  return {
    fraseDoDia: frase,
    beniExplica: [
      'Nessa história, Beni aprende uma lição linda sobre Deus.',
      frase,
      'Deus está sempre pertinho de nós, cuidando com amor.',
      'A fé ajuda nosso coração a confiar Nele todos os dias.',
    ],
    pergunta: 'O que essa história ensina ao seu coração?',
    oracao: 'Querido Deus, obrigado por este momento com a minha família. Amém.',
  };
}
