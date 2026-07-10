/**
 * ovelhaSceneData.js — falas do Beni de "Cadê a Ovelhinha?".
 *
 * Só CONTEÚDO — nenhuma regra de jogo (essa vive na máquina/serviço puros).
 * O contrato de CENAS autorais vive em `ovelhaScenes.js` (Bloco 2.2a). O modelo antigo
 * de "distratores dev" saiu com a mudança de direção; o PNG dev (assets/games/.../dev)
 * fica no repo como placeholder histórico, sem uso em código.
 */

/** Falas do Beni (texto por enquanto; a voz vem num bloco de áudio futuro). */
export const OVELHA_BENI = {
  entrada: 'A ovelhinha se escondeu na paisagem. Vamos achar?',
  procurando: 'Cadê a ovelhinha? Procure com atenção!',
  acerto: 'Achou! Que olhar espertinho!',
  erro: 'Quase! Ali não é a ovelhinha. Procura de novo!',
  // Incentivo NÃO espacial (dica nível 1): anima sem apontar onde está.
  incentivo: 'Olha com carinho… a ovelhinha tá aí pertinho!',
  vitoria: 'Você achou todas as ovelhinhas! Muito bem!',
  semRodadas: 'As rodadas de hoje acabaram. Amanhã a gente brinca de novo!',
};
