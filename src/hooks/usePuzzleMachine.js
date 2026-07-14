/**
 * usePuzzleMachine.js — MÁQUINA DE ESTADOS PURA do motor de "Monte a Cena" (M1R4, Portão 1).
 *
 * INVARIANTE ABSOLUTO (seção 3): selecionar uma peça NUNCA altera `placedPieceIds` e NUNCA inicia
 * animação para o tabuleiro. SÓ dois eventos levam ao encaixe: DROP no alvo correto e TAP no alvo
 * correto — e o COMMIT só acontece em SNAP_FINISHED (depois da animação). Nenhum outro evento chama
 * commit. Pura e testável (avaliada no smoke via new Function). Sem React, sem side effects.
 *
 * Estados: idle · selected · dragging · snapping · returning · placed(→idle) · celebrating ·
 *          viewingArtwork · showingActions
 * Eventos: PIECE_TAPPED · PAN_STARTED · PAN_UPDATED · PAN_ENDED{hit} · TARGET_TAPPED{targetId} ·
 *          EMPTY_AREA_TAPPED · SNAP_FINISHED · RETURN_FINISHED · ARTWORK_REVEALED · ACTIONS_REQUESTED · RESET
 * `hit` (em PAN_ENDED) = 'correct' | 'wrong' | 'none'.
 */

export function initialPuzzleState(totalPieces = 4, initialPlaced) {
  // Restauração de partida (M1R8A): peças já encaixadas de uma sessão anterior (parcial). RESET NÃO
  // passa este argumento → volta sempre para vazio. Deduplicado e capado ao total.
  const placed = Array.isArray(initialPlaced)
    ? initialPlaced.filter((id, i, a) => id != null && a.indexOf(id) === i).slice(0, totalPieces)
    : [];
  return {
    status: 'idle',
    totalPieces,
    selectedPieceId: null,
    activePieceId: null,          // peça na camada de arrasto/snap/return
    pendingTargetId: null,        // alvo que a animação vai preencher (ainda NÃO gravado)
    placedPieceIds: placed,
    interactionId: 0,
    lastCommand: null,
    lastSound: null,              // 'match_success' | 'wrong_place' | 'board_complete' | null
    hitResult: null,              // 'correct' | 'wrong' | 'none' | null
    lastTargetId: null,           // (M1R6, só diagnóstico) último alvo tocado/atingido
  };
}

// A regra de acerto do motor: o alvo de uma peça é o próprio id da peça (targetId === pieceId).
function isCorrect(pieceId, targetId) {
  return pieceId != null && targetId != null && pieceId === targetId;
}

export function puzzleReducer(state, event) {
  const s = state;
  const e = event || {};
  switch (e.type) {
    case 'RESET':
      return initialPuzzleState(s.totalPieces);

    // ── SELEÇÃO: só marca selectedPieceId. NUNCA encaixa/anima/soa acerto/altera progresso. ──
    case 'PIECE_TAPPED': {
      if (s.status === 'snapping' || s.status === 'returning') return s; // ignora durante animação
      if (s.placedPieceIds.includes(e.pieceId)) return s;
      const same = s.selectedPieceId === e.pieceId;
      return {
        ...s,
        status: same ? 'idle' : 'selected',
        selectedPieceId: same ? null : e.pieceId,
        activePieceId: null,
        lastCommand: 'PIECE_TAPPED',
        lastSound: 'select', // som leve OPCIONAL de seleção (NÃO é acerto)
        hitResult: null,
      };
    }

    // ── ARRASTO ──
    case 'PAN_STARTED': {
      if (s.status === 'snapping' || s.status === 'returning') return s;
      if (s.placedPieceIds.includes(e.pieceId)) return s;
      return { ...s, status: 'dragging', activePieceId: e.pieceId, selectedPieceId: null, interactionId: s.interactionId + 1, lastCommand: 'PAN_STARTED', hitResult: null };
    }
    case 'PAN_UPDATED':
      // Só coordenadas (fora do reducer). Não muda o estado lógico.
      return s;
    case 'PAN_ENDED': {
      if (s.status !== 'dragging' || s.activePieceId == null) return s;
      const tgt = e.targetId != null ? e.targetId : s.lastTargetId;
      if (e.hit === 'correct') {
        return { ...s, status: 'snapping', pendingTargetId: s.activePieceId, lastCommand: 'PAN_ENDED_CORRECT', lastSound: 'match_success', hitResult: 'correct', lastTargetId: tgt };
      }
      if (e.hit === 'wrong') {
        return { ...s, status: 'returning', pendingTargetId: null, lastCommand: 'PAN_ENDED_WRONG', lastSound: 'wrong_place', hitResult: 'wrong', lastTargetId: tgt };
      }
      // 'none' = área vazia → retorno SILENCIOSO (sem som de erro). CANCELAMENTO, não erro.
      return { ...s, status: 'returning', pendingTargetId: null, lastCommand: 'PAN_ENDED_NONE', lastSound: null, hitResult: 'none', lastTargetId: null };
    }

    // ── TOQUE NO ALVO (cada alvo tem seu próprio gesto; sem onPress global no fundo) ──
    case 'TARGET_TAPPED': {
      if (s.selectedPieceId == null) return s;                 // sem seleção → nada
      if (s.status === 'snapping' || s.status === 'returning') return s;
      if (isCorrect(s.selectedPieceId, e.targetId)) {
        // ALVO CORRETO: inicia animação; commit só em SNAP_FINISHED.
        return { ...s, status: 'snapping', activePieceId: s.selectedPieceId, pendingTargetId: s.selectedPieceId, lastCommand: 'TARGET_TAPPED_CORRECT', lastSound: 'match_success', hitResult: 'correct', lastTargetId: e.targetId };
      }
      // ALVO INCORRETO: som de erro, peça CONTINUA selecionada, progresso NÃO muda.
      return { ...s, lastCommand: 'TARGET_TAPPED_WRONG', lastSound: 'wrong_place', hitResult: 'wrong', lastTargetId: e.targetId };
    }
    case 'EMPTY_AREA_TAPPED':
      // Mantém a seleção; NÃO encaixa, NÃO toca erro.
      return { ...s, lastCommand: 'EMPTY_AREA_TAPPED', lastSound: null, hitResult: null };

    // ── COMMIT: SÓ aqui a peça entra em placedPieceIds ──
    case 'SNAP_FINISHED': {
      if (s.status !== 'snapping' || s.pendingTargetId == null) return s;
      const placedPieceIds = s.placedPieceIds.includes(s.pendingTargetId) ? s.placedPieceIds : [...s.placedPieceIds, s.pendingTargetId];
      const complete = placedPieceIds.length >= s.totalPieces;
      return {
        ...s,
        status: complete ? 'celebrating' : 'idle',
        placedPieceIds,
        selectedPieceId: null,
        activePieceId: null,
        pendingTargetId: null,
        lastCommand: 'SNAP_FINISHED',
        lastSound: complete ? 'board_complete' : s.lastSound,
        hitResult: null,
      };
    }
    case 'RETURN_FINISHED':
      if (s.status !== 'returning') return s;
      return { ...s, status: 'idle', activePieceId: null, pendingTargetId: null, lastCommand: 'RETURN_FINISHED' };

    case 'ARTWORK_REVEALED':
      return s.status === 'celebrating' ? { ...s, status: 'viewingArtwork', lastCommand: 'ARTWORK_REVEALED' } : s;
    case 'ACTIONS_REQUESTED':
      return s.status === 'viewingArtwork' ? { ...s, status: 'showingActions', lastCommand: 'ACTIONS_REQUESTED' } : s;

    default:
      return s;
  }
}

export default puzzleReducer;
