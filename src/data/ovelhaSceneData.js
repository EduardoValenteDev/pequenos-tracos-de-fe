/**
 * ovelhaSceneData.js — dados de apresentação de "Cadê a Ovelhinha?" (Bloco 2.1).
 *
 * Só CONTEÚDO/estilo — nenhuma regra de jogo (essa vive na máquina/serviço puros).
 * Nada de leitura obrigatória para a criança: os textos são para o adulto/ambiente.
 */

/** Falas do Beni (texto por enquanto; a voz vem num bloco de áudio futuro). */
export const OVELHA_BENI = {
  entrada: 'Uma ovelhinha se escondeu entre os amiguinhos. Vamos achar?',
  procurando: 'Cadê a ovelhinha? Toque nela!',
  acerto: 'Achou! Que olhar espertinho!',
  erro: 'Quase! Essa não é a ovelhinha. Procura de novo!',
  vitoria: 'Você achou todas as ovelhinhas! Muito bem!',
  semRodadas: 'As rodadas de hoje acabaram. Amanhã a gente brinca de novo!',
};

/**
 * Aparência TEMPORÁRIA dos distratores (formas vetoriais desenhadas na tela — nenhum
 * asset). "Claramente diferentes" entre si e da ovelha. Trocados por arte oficial no
 * Bloco 2.2.
 */
export const OVELHA_DISTRATORES_DEV = Object.freeze({
  gato: { corpo: '#F4A259', orelha: '#E07A2F', rosto: '#3B2A1A', label: 'gatinho' },
  pato: { corpo: '#F7C948', orelha: '#E8A100', rosto: '#3B2A1A', label: 'patinho' },
  coelho: { corpo: '#CBB7E8', orelha: '#B49BDD', rosto: '#3B2A1A', label: 'coelhinho' },
  porco: { corpo: '#F6A6B2', orelha: '#E888A0', rosto: '#3B2A1A', label: 'porquinho' },
});

/** Asset TEMPORÁRIO do alvo. Isolado na pasta dev; substituído no Bloco 2.2. */
export const OVELHA_ALVO_DEV = require('../../assets/games/cade_a_ovelhinha/dev/ovelha_alvo_dev.png');
