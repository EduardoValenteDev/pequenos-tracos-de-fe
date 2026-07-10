/**
 * ovelhaGameMachine.js — máquina de estados PURA de "Cadê a Ovelhinha?" (2.1 · corrigida no 2.1a).
 *
 * Fonte única `fase`, gravada no ref pela tela e atualizada SÍNCRONAMENTE no toque.
 * O acerto é decidido comparando o ID TOCADO com `targetId` — nunca por índice de array.
 *
 * Puro: sem React, relógio, I/O, navegação. Devolve `{ estado, efeitos }` (e `aceito`).
 *
 * ── Fases ────────────────────────────────────────────────────────────────────
 *   trocandoCena · entrandoCena · procurando · resolvendoErro · resolvendoAcerto · finalizado
 *   Só `procurando` aceita toque.
 */

export const FASES = Object.freeze({
  TROCANDO: 'trocandoCena',
  ENTRANDO: 'entrandoCena',
  PROCURANDO: 'procurando',
  ERRO: 'resolvendoErro',
  ACERTO: 'resolvendoAcerto',
  FIM: 'finalizado',
});

export const FASES_QUE_ACEITAM = Object.freeze([FASES.PROCURANDO]);

export const EFEITOS = Object.freeze({
  SOM_ACERTO: 'somAcerto',
  SOM_ERRO: 'somErro',
  SOM_TROCA: 'somTroca',
  VIBRAR_ACERTO: 'vibrarAcerto',
  AGENDAR_LIBERAR_ERRO: 'agendarLiberarErro',
  AGENDAR_PROXIMA: 'agendarProximaRodada',
  FINALIZAR: 'finalizarPartida',
});

const sem = (estado) => ({ estado, efeitos: [] });

/** Estado inicial. Começa em `trocandoCena` (a tela monta a rodada 1). */
export function criarJogo({ rounds = 5 } = {}) {
  return {
    fase: FASES.TROCANDO,
    rounds: Number(rounds) > 0 ? Math.floor(rounds) : 5,
    rodada: 1,
    targetId: null,
    itemIds: [],
    encontradas: 0,
    erros: 0,
    sequencia: 0,
    bestSequencia: 0,
  };
}

/**
 * A tela montou a rodada e informa `targetId` + os `itemIds` renderizados.
 * Só aceita a partir de `trocandoCena` E se o `targetId` estiver entre os `itemIds` —
 * é a barreira que impede iniciar uma rodada sem alvo válido (invariante).
 */
export function iniciarRodada(estado, { targetId, itemIds }) {
  if (!estado || estado.fase !== FASES.TROCANDO) return { ...sem(estado), aceito: false };
  const ids = Array.isArray(itemIds) ? itemIds : [];
  const alvoOk = typeof targetId === 'string' && ids.includes(targetId);
  if (!alvoOk) return { ...sem(estado), aceito: false };   // rodada inválida: NÃO inicia
  return { ...sem({ ...estado, fase: FASES.ENTRANDO, targetId, itemIds: ids }), aceito: true };
}

/** Fim da animação de entrada: agora aceita toque. */
export function cenaPronta(estado) {
  if (!estado || estado.fase !== FASES.ENTRANDO) return sem(estado);
  return sem({ ...estado, fase: FASES.PROCURANDO });
}

/** A grade aceita um toque neste ID AGORA? Única porta de entrada. */
export function aceitaToque(estado, id) {
  if (!estado || !FASES_QUE_ACEITAM.includes(estado.fase)) return false;
  return typeof id === 'string' && estado.itemIds.includes(id);
}

/**
 * Toque num item, por ID. Recusado → `aceito:false`, zero efeitos.
 * ID === targetId → acerto. Outro item conhecido → erro suave.
 */
export function tocar(estado, id) {
  if (!aceitaToque(estado, id)) return { ...sem(estado), aceito: false };

  if (id === estado.targetId) {
    const sequencia = estado.sequencia + 1;
    return {
      estado: {
        ...estado,
        fase: FASES.ACERTO,
        encontradas: estado.encontradas + 1,
        sequencia,
        bestSequencia: Math.max(estado.bestSequencia, sequencia),
      },
      efeitos: [EFEITOS.SOM_ACERTO, EFEITOS.VIBRAR_ACERTO, EFEITOS.AGENDAR_PROXIMA],
      aceito: true,
      acerto: true,
    };
  }

  return {
    estado: { ...estado, fase: FASES.ERRO, erros: estado.erros + 1, sequencia: 0 },
    efeitos: [EFEITOS.SOM_ERRO, EFEITOS.AGENDAR_LIBERAR_ERRO],
    aceito: true,
    acerto: false,
  };
}

/** Fim da resposta de erro: volta a aceitar toque, na MESMA rodada e MESMO alvo. */
export function liberarErro(estado) {
  if (!estado || estado.fase !== FASES.ERRO) return sem(estado);
  return sem({ ...estado, fase: FASES.PROCURANDO });
}

/** Fim da celebração do acerto. Última rodada → `finalizado`; senão, prepara a próxima. */
export function avancar(estado) {
  if (!estado || estado.fase !== FASES.ACERTO) return sem(estado);
  if (estado.rodada >= estado.rounds) {
    return { estado: { ...estado, fase: FASES.FIM }, efeitos: [EFEITOS.FINALIZAR] };
  }
  return {
    estado: { ...estado, fase: FASES.TROCANDO, rodada: estado.rodada + 1, targetId: null, itemIds: [] },
    efeitos: [EFEITOS.SOM_TROCA],
  };
}

/** Encerramento forçado (voltar, unmount): trava tudo. */
export function encerrar(estado) {
  if (!estado || estado.fase === FASES.FIM) return sem(estado);
  return sem({ ...estado, fase: FASES.FIM });
}

export default {
  FASES, FASES_QUE_ACEITAM, EFEITOS,
  criarJogo, iniciarRodada, cenaPronta, aceitaToque, tocar, liberarErro, avancar, encerrar,
};
