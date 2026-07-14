/**
 * monteACenaSession.js — estado de SESSÃO (M1R2) de "Monte a Cena". SEM persistência definitiva.
 *
 * Guarda apenas em memória quais níveis internos foram concluídos DURANTE a sessão (some ao
 * recarregar o app). Permite o avanço entre níveis e o estado "Concluído" na seleção sem tocar
 * AsyncStorage/arquivo. A persistência real fica para uma etapa futura aprovada.
 */

let completed = new Set();

export function getCompletedLevels() {
  return Array.from(completed);
}

export function isLevelCompleted(id) {
  return completed.has(id);
}

export function markLevelCompleted(id) {
  if (id) completed.add(id);
}

export function resetSession() {
  completed = new Set();
}
