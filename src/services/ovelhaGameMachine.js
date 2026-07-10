/**
 * ovelhaGameMachine.js — máquina de estados PURA de "Cadê a Ovelhinha?" (Bloco 2.1).
 *
 * Mesma filosofia da máquina do Pares: UMA fonte de verdade (`fase`), guardada num ref
 * pela tela e atualizada SÍNCRONAMENTE no primeiro instante do toque — antes de qualquer
 * setState, som, animação ou timer. É isso que impede toque durante a resolução.
 *
 * Puro: sem React, sem relógio, sem I/O, sem navegação, nunca lança. Devolve sempre
 * `{ estado, efeitos }` (e `aceito` no toque). Quem executa os efeitos é a tela.
 *
 * ── Fases ────────────────────────────────────────────────────────────────────
 *   trocandoCena     — entre rodadas (e no início); NÃO aceita toque
 *   entrandoCena     — a cena está entrando (animação); NÃO aceita toque
 *   procurando       — a criança pode tocar; ÚNICA fase que aceita
 *   resolvendoErro   — distrator tocado; NÃO aceita
 *   resolvendoAcerto — ovelha encontrada; NÃO aceita
 *   finalizado       — 5 rodadas concluídas; NÃO aceita, nunca mais
 */

export const FASES = Object.freeze({
  TROCANDO: 'trocandoCena',
  ENTRANDO: 'entrandoCena',
  PROCURANDO: 'procurando',
  ERRO: 'resolvendoErro',
  ACERTO: 'resolvendoAcerto',
  FIM: 'finalizado',
});

/** A ÚNICA fase que aceita toque. Fonte única — sem booleano paralelo. */
export const FASES_QUE_ACEITAM = Object.freeze([FASES.PROCURANDO]);

export const EFEITOS = Object.freeze({
  SOM_TOQUE: 'somToque',           // reservado (SoundButton já cobre a UI)
  SOM_ACERTO: 'somAcerto',
  SOM_ERRO: 'somErro',
  SOM_TROCA: 'somTroca',
  VIBRAR_ACERTO: 'vibrarAcerto',
  AGENDAR_LIBERAR_ERRO: 'agendarLiberarErro',
  AGENDAR_PROXIMA: 'agendarProximaRodada',
  AGENDAR_DICA: 'agendarDica',
  FINALIZAR: 'finalizarPartida',
});

const sem = (estado) => ({ estado, efeitos: [] });

/** Estado inicial de uma partida. Começa em `trocandoCena` (a tela monta a rodada 1). */
export function criarJogo({ rounds = 5 } = {}) {
  return {
    fase: FASES.TROCANDO,
    rounds: Number(rounds) > 0 ? Math.floor(rounds) : 5,
    rodada: 1,
    alvoIndex: null,
    n: 0,
    encontradas: 0,
    erros: 0,
    sequencia: 0,
    bestSequencia: 0,
  };
}

/**
 * A tela montou a geometria da rodada e informa qual índice é o alvo e quantos sprites.
 * Válido a partir de `trocandoCena`. Vai para `entrandoCena` (a cena vai animar a entrada).
 */
export function iniciarRodada(estado, { alvoIndex, n }) {
  if (!estado || estado.fase !== FASES.TROCANDO) return sem(estado);
  const total = Number.isInteger(n) && n > 0 ? n : 0;
  const alvo = Number.isInteger(alvoIndex) && alvoIndex >= 0 && alvoIndex < total ? alvoIndex : 0;
  return sem({ ...estado, fase: FASES.ENTRANDO, alvoIndex: alvo, n: total });
}

/** Fim da animação de entrada da cena: agora aceita toque. Agenda a dica (uma vez). */
export function cenaPronta(estado) {
  if (!estado || estado.fase !== FASES.ENTRANDO) return sem(estado);
  return { estado: { ...estado, fase: FASES.PROCURANDO }, efeitos: [EFEITOS.AGENDAR_DICA] };
}

/** A grade aceita um toque nesta posição AGORA? Única porta de entrada. */
export function aceitaToque(estado, i) {
  if (!estado || !FASES_QUE_ACEITAM.includes(estado.fase)) return false;
  return Number.isInteger(i) && i >= 0 && i < estado.n;
}

/**
 * Toque num sprite. Recusado → `aceito:false` e NENHUM efeito (sem som/haptic/estatística).
 * Acerto → conta a ovelhinha, cresce a sequência, agenda a próxima rodada.
 * Erro → zera a sequência (não perde ovelhinhas), agenda a volta ao "procurando".
 */
export function tocar(estado, i) {
  if (!aceitaToque(estado, i)) return { ...sem(estado), aceito: false };

  if (i === estado.alvoIndex) {
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
    };
  }

  // Erro suave: a sequência quebra, mas nenhuma ovelhinha é perdida.
  return {
    estado: { ...estado, fase: FASES.ERRO, erros: estado.erros + 1, sequencia: 0 },
    efeitos: [EFEITOS.SOM_ERRO, EFEITOS.AGENDAR_LIBERAR_ERRO],
    aceito: true,
  };
}

/** Fim da resposta de erro: volta a aceitar toque, na MESMA rodada e MESMO alvo. */
export function liberarErro(estado) {
  if (!estado || estado.fase !== FASES.ERRO) return sem(estado);
  return sem({ ...estado, fase: FASES.PROCURANDO });
}

/**
 * Fim da celebração do acerto. Última rodada → `finalizado`. Senão, prepara a próxima
 * (a tela vai montar a geometria e chamar `iniciarRodada`).
 */
export function avancar(estado) {
  if (!estado || estado.fase !== FASES.ACERTO) return sem(estado);
  if (estado.rodada >= estado.rounds) {
    return { estado: { ...estado, fase: FASES.FIM }, efeitos: [EFEITOS.FINALIZAR] };
  }
  return {
    estado: { ...estado, fase: FASES.TROCANDO, rodada: estado.rodada + 1, alvoIndex: null },
    efeitos: [EFEITOS.SOM_TROCA],
  };
}

/** Saída/encerramento forçado (voltar, unmount): trava tudo. */
export function encerrar(estado) {
  if (!estado || estado.fase === FASES.FIM) return sem(estado);
  return sem({ ...estado, fase: FASES.FIM });
}

export default {
  FASES, FASES_QUE_ACEITAM, EFEITOS,
  criarJogo, iniciarRodada, cenaPronta, aceitaToque, tocar, liberarErro, avancar, encerrar,
};
