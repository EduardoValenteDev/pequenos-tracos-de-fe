/**
 * paresGameMachine.js — máquina de estados PURA do Pares do Beni (Bloco 1.4b).
 *
 * ── Por que ela existe ───────────────────────────────────────────────────────
 * A versão anterior decidia se aceitava um toque lendo `abertas`, que era ESTADO
 * REACT. Três toques disparados no mesmo frame liam todos o mesmo valor obsoleto
 * (`[]`), concluíam "ainda não tenho duas cartas" e voltavam ANTES de ligar a trava.
 * Resultado real no iPhone: três cartas abertas. Aumentar debounce não resolve isso —
 * só estreita a janela.
 *
 * Aqui existe UMA fonte de verdade: `fase`. Ela vive num objeto simples, guardado
 * num ref pela tela, e é atualizada de forma SÍNCRONA no início do toque, antes de
 * qualquer setState, animação, som ou await. Nenhum booleano paralelo pode divergir.
 *
 * ── Fases ────────────────────────────────────────────────────────────────────
 *   idle            — nada aberto; aceita toque
 *   flippingFirst   — 1ª carta girando; aceita o toque da 2ª (a criança é rápida,
 *                     e esperar o giro terminar deixaria o jogo travado)
 *   waitingSecond   — 1ª carta aberta e parada; aceita toque
 *   flippingSecond  — 2ª carta girando; NÃO aceita
 *   checking        — as duas visíveis, a criança está OLHANDO; NÃO aceita
 *   resolvingMatch  — acerto sendo celebrado; NÃO aceita
 *   resolvingError  — erro sendo mostrado; NÃO aceita
 *   changingBoard   — Turbo trocando de grade; NÃO aceita
 *   finished        — partida encerrada; NÃO aceita
 *
 * A trava da terceira carta é dupla e síncrona: a fase sai de `flippingFirst` no
 * mesmo instante em que a 2ª carta é aceita, E `abertas.length < 2` é verificado
 * dentro de `aceitaToque`. Nenhuma das duas depende de estado React.
 *
 * A verificação do par NUNCA acontece antes de o flip da 2ª carta TERMINAR: quem
 * move `flippingSecond → checking` é o callback de conclusão da animação, não um
 * atraso adivinhado.
 *
 * Puro: sem React, sem relógio, sem I/O, nunca lança. Devolve sempre
 * `{ estado, efeitos }` — os efeitos (som, vibração, agendamento) são executados
 * pela tela. É isto que torna o jogo testável de verdade.
 */
import { isPair, pointsForMatch } from './paresGameService';

export const FASES = Object.freeze({
  IDLE: 'idle',
  FIRST_FLIP: 'flippingFirst',
  WAITING_SECOND: 'waitingSecond',
  SECOND_FLIP: 'flippingSecond',
  CHECKING: 'checking',
  MATCH: 'resolvingMatch',
  ERROR: 'resolvingError',
  BOARD: 'changingBoard',
  FINISHED: 'finished',
});

/** As ÚNICAS fases em que a grade aceita um toque. Fonte única — sem booleano paralelo. */
export const FASES_QUE_ACEITAM = Object.freeze([FASES.IDLE, FASES.FIRST_FLIP, FASES.WAITING_SECOND]);

/** Nomes de efeito. A tela traduz para som/vibração/timer; a máquina não conhece nada disso. */
export const EFEITOS = Object.freeze({
  SOM_FLIP: 'som:flip',
  SOM_ACERTO: 'som:acerto',
  SOM_ERRO: 'som:erro',
  SOM_GRADE: 'som:grade',
  VIBRAR_ACERTO: 'vibrar:acerto',
  VIBRAR_ERRO: 'vibrar:erro',
  BONUS_TEMPO: 'tempo:bonus',
  AGENDAR_VERIFICAR: 'agendar:verificar',
  AGENDAR_LIBERAR: 'agendar:liberar',
  AGENDAR_FECHAR: 'agendar:fechar',
  AGENDAR_NOVA_GRADE: 'agendar:novaGrade',
  FIM_DE_JOGO: 'jogo:fim',
  RECORDE_BATIDO: 'jogo:recorde',
});

const sem = (estado) => ({ estado, efeitos: [] });

/** Estado inicial de uma partida. `recordeAtual` só é usado no Turbo (meta na HUD). */
export function criarJogo({ deck = [], pares = 0, cronometrado = false, recordeAtual = 0 } = {}) {
  return {
    fase: FASES.IDLE,
    deck,
    pares,
    cronometrado: !!cronometrado,
    abertas: [],
    casadas: [],
    jogadas: 0,
    erros: 0,
    pontos: 0,
    combo: 0,
    maiorCombo: 0,
    paresTotais: 0,
    gradesCompletas: 0,
    recordeAtual: Number(recordeAtual) > 0 ? Number(recordeAtual) : 0,
    recordeAvisado: false,
  };
}

/** A grade aceita um toque nesta carta AGORA? Única porta de entrada. */
export function aceitaToque(estado, i) {
  if (!estado || !FASES_QUE_ACEITAM.includes(estado.fase)) return false;
  if (!Number.isInteger(i) || i < 0 || i >= estado.deck.length) return false;
  if (estado.abertas.includes(i)) return false;
  if (estado.casadas.includes(estado.deck[i]?.key)) return false;
  // Cinto e suspensório: nunca mais de duas cartas viradas.
  return estado.abertas.length < 2;
}

/**
 * Toque numa carta. Se recusado, devolve `aceito: false` e NENHUM efeito — a carta
 * ignorada não toca som, não vibra, não anima e não conta jogada.
 */
export function tocar(estado, i) {
  if (!aceitaToque(estado, i)) return { ...sem(estado), aceito: false };

  const abertas = [...estado.abertas, i];
  const primeira = abertas.length === 1;

  return {
    estado: {
      ...estado,
      abertas,
      // A trava troca AQUI, de forma síncrona, antes de qualquer som/animação/setState.
      fase: primeira ? FASES.FIRST_FLIP : FASES.SECOND_FLIP,
    },
    efeitos: [EFEITOS.SOM_FLIP],
    aceito: true,
  };
}

/**
 * O flip de abertura de uma carta terminou (callback da animação, não um atraso).
 * 1ª carta → a grade volta a aceitar toque.
 * 2ª carta → as duas ficam visíveis por um instante antes da verificação.
 */
export function flipConcluido(estado, i) {
  if (!estado || !estado.abertas.includes(i)) return sem(estado);

  // Quem termina o giro importa. Se a criança tocou a 2ª carta enquanto a 1ª ainda
  // girava, o fim do giro da PRIMEIRA chega com a fase já em `flippingSecond` — e
  // não pode disparar a verificação, porque a 2ª carta ainda está virando.
  const ehSegunda = estado.abertas.length === 2 && estado.abertas[1] === i;

  if (estado.fase === FASES.FIRST_FLIP && !ehSegunda) {
    return sem({ ...estado, fase: FASES.WAITING_SECOND });
  }
  if (estado.fase === FASES.SECOND_FLIP && ehSegunda) {
    return {
      estado: { ...estado, fase: FASES.CHECKING },
      efeitos: [EFEITOS.AGENDAR_VERIFICAR],
    };
  }
  return sem(estado);
}

/**
 * Verifica o par. Só roda a partir de `checking`, ou seja: DEPOIS de a 2ª carta ter
 * terminado o flip e de a criança ter olhado as duas imagens. É aqui — e só aqui —
 * que som, borda, selo, combo, pontos e jogadas são atualizados.
 */
export function verificar(estado) {
  if (!estado || estado.fase !== FASES.CHECKING || estado.abertas.length !== 2) return sem(estado);

  const [a, b] = estado.abertas.map((k) => estado.deck[k]);
  const jogadas = estado.jogadas + 1;

  if (isPair(a, b)) {
    const combo = estado.combo + 1;
    const pontos = estado.cronometrado ? estado.pontos + pointsForMatch(combo) : estado.pontos;
    const bateuAgora = estado.cronometrado
      && !estado.recordeAvisado
      && estado.recordeAtual > 0
      && pontos > estado.recordeAtual;

    const proximo = {
      ...estado,
      fase: FASES.MATCH,
      jogadas,
      combo,
      maiorCombo: Math.max(estado.maiorCombo, combo),
      pontos,
      paresTotais: estado.paresTotais + 1,
      casadas: [...estado.casadas, a.key, b.key],
      abertas: [],
      recordeAvisado: estado.recordeAvisado || bateuAgora,
    };

    const efeitos = [EFEITOS.SOM_ACERTO, EFEITOS.VIBRAR_ACERTO, EFEITOS.AGENDAR_LIBERAR];
    if (estado.cronometrado) efeitos.push(EFEITOS.BONUS_TEMPO);
    if (bateuAgora) efeitos.push(EFEITOS.RECORDE_BATIDO);
    return { estado: proximo, efeitos };
  }

  return {
    estado: { ...estado, fase: FASES.ERROR, jogadas, erros: estado.erros + 1, combo: 0 },
    efeitos: [EFEITOS.SOM_ERRO, EFEITOS.VIBRAR_ERRO, EFEITOS.AGENDAR_FECHAR],
  };
}

/**
 * Fim da celebração do acerto. Grade limpa: no Clássico a partida acaba; no Turbo
 * vem uma grade nova (a partida continua — só o tempo a encerra).
 */
export function liberar(estado) {
  if (!estado || estado.fase !== FASES.MATCH) return sem(estado);

  const gradeLimpa = estado.casadas.length / 2 >= estado.pares;
  if (!gradeLimpa) return sem({ ...estado, fase: FASES.IDLE });

  if (!estado.cronometrado) {
    return { estado: { ...estado, fase: FASES.FINISHED }, efeitos: [EFEITOS.FIM_DE_JOGO] };
  }
  return {
    estado: { ...estado, fase: FASES.BOARD, gradesCompletas: estado.gradesCompletas + 1 },
    efeitos: [EFEITOS.SOM_GRADE, EFEITOS.AGENDAR_NOVA_GRADE],
  };
}

/** Fim da chacoalhada: as cartas viram e a grade libera. */
export function fechar(estado) {
  if (!estado || estado.fase !== FASES.ERROR) return sem(estado);
  return sem({ ...estado, fase: FASES.IDLE, abertas: [] });
}

/** Turbo: entra a grade nova. Pontos, combo, pares e tempo continuam. */
export function novaGrade(estado, deck) {
  if (!estado || estado.fase !== FASES.BOARD) return sem(estado);
  return sem({ ...estado, fase: FASES.IDLE, deck, abertas: [], casadas: [] });
}

/** Tempo esgotado (ou saída). A partir daqui nenhum toque é aceito, nunca mais. */
export function encerrar(estado) {
  if (!estado || estado.fase === FASES.FINISHED) return sem(estado);
  return sem({ ...estado, fase: FASES.FINISHED, abertas: [] });
}

export default { FASES, EFEITOS, criarJogo, aceitaToque, tocar, flipConcluido, verificar, liberar, fechar, novaGrade, encerrar };
