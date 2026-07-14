/**
 * monteACenaProgress.js — PROGRESSO POR QUADRO + retomada de partida ("Continue montando") (M1R6).
 *
 * Complementa `monteACenaGallery.js` (que guarda as CONCLUSÕES permanentes do Plano Família). Aqui
 * mora o estado leve de PARTIDA EM ANDAMENTO por perfil (um marcador de retomada, NÃO um quadro
 * salvo): qual cena/dificuldade e quantas peças já foram colocadas. É o que alimenta o destaque
 * "Continue montando" na galeria de histórias e o estado "Em andamento" de um quadro.
 *
 * Isto NÃO é "salvar um quadro": grátis segue sem salvar em Meus Quadros (gate no gallery). O
 * marcador de retomada é um ponteiro pequeno (ids + contagem), limpo ao concluir ou ao trocar de
 * quadro. As FUNÇÕES DE ESTADO são PURAS e testáveis (avaliadas no smoke), sem I/O.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@ptf_monte_a_cena_progress_v1:';
const SCHEMA_VERSION = 1;

function keyFor(profileId) {
  return `${KEY_PREFIX}${profileId || 'default'}`;
}
function emptyProgress(profileId) {
  return { version: SCHEMA_VERSION, profileId: profileId || 'default', activeSession: null };
}

/* ────────────────────────── ESTADO PURO (sem I/O; testável) ────────────────────────── */

/** Estados de um QUADRO: 'concluido' > 'andamento' > 'novo' (prioridade nessa ordem). */
export function quadroState(puzzleSceneId, completedIds, activeSession) {
  const done = Array.isArray(completedIds) && completedIds.includes(puzzleSceneId);
  if (done) return 'concluido';
  if (activeSession && activeSession.puzzleSceneId === puzzleSceneId && placedOf(activeSession) > 0) {
    return 'andamento';
  }
  return 'novo';
}

/** Nº de peças encaixadas de uma sessão (usa placedPieceIds; tolera formato antigo placedCount). */
export function placedOf(session) {
  if (!session) return 0;
  if (Array.isArray(session.placedPieceIds)) return session.placedPieceIds.length;
  return session.placedCount || 0;
}

/** Progresso de uma coleção: { done, total } (quantos quadros aprovados foram concluídos). */
export function storyProgressCounts(sceneIds, completedIds) {
  const total = Array.isArray(sceneIds) ? sceneIds.length : 0;
  if (!Array.isArray(completedIds) || total === 0) return { done: 0, total };
  let done = 0;
  for (const id of sceneIds) if (completedIds.includes(id)) done += 1;
  return { done, total };
}

/** Coleção completa = todos os quadros APROVADOS concluídos (e existe ao menos um). */
export function isStoryComplete(sceneIds, completedIds) {
  const { done, total } = storyProgressCounts(sceneIds, completedIds);
  return total > 0 && done === total;
}

/**
 * Mensagem de coleção (M1R8B — até 10 quadros): "Coleção completa!" quando a história tem TODAS as 10
 * cenas disponíveis e as 10 concluídas. Se há menos de 10 disponíveis (algumas bloqueadas/ausentes)
 * mas todas as DISPONÍVEIS foram concluídas, usa a frase honesta. Caso contrário, null. NÃO exige
 * exatamente 4 cenas.
 */
export function collectionMessage(availableLen, completedInStoryLen) {
  if (availableLen > 0 && completedInStoryLen >= availableLen) {
    return availableLen >= 10 ? 'Coleção completa!' : 'Todos os quadros disponíveis foram concluídos.';
  }
  return null;
}

/** Um activeSession só é "retomável" se tiver progresso parcial (>0 e < total). */
export function isResumable(activeSession) {
  if (!activeSession) return false;
  const placed = placedOf(activeSession);
  const total = activeSession.pieceCount || activeSession.total || 0;
  return placed > 0 && total > 0 && placed < total;
}

/* ────────────────────────── PERSISTÊNCIA (por perfil; null-safe) ────────────────────────── */

export async function loadProgress(profileId) {
  try {
    const raw = await AsyncStorage.getItem(keyFor(profileId));
    if (!raw) return emptyProgress(profileId);
    const data = JSON.parse(raw);
    if (!data || data.version !== SCHEMA_VERSION) return emptyProgress(profileId);
    return { ...emptyProgress(profileId), ...data, activeSession: data.activeSession || null };
  } catch {
    return emptyProgress(profileId);
  }
}

/** Retorna a partida em andamento retomável (ou null) — para o destaque "Continue montando". */
export async function getActiveSession(profileId) {
  const p = await loadProgress(profileId);
  return isResumable(p.activeSession) ? p.activeSession : null;
}

/** Retorna a sessão bruta salva (mesmo com 0 peças) — para RESTAURAR ordem/dificuldade ao continuar. */
export async function getRawSession(profileId) {
  const p = await loadProgress(profileId);
  return p.activeSession || null;
}

/**
 * Salva a sessão COMPLETA (M1R8A): ordem embaralhada + peças encaixadas + seed. Guardada desde o
 * início (mesmo com 0 peças) para que fechar/continuar restaure a MESMA ordem. Ao concluir (placed
 * === total), o chamador usa `clearActiveSession`. `updatedAt`/`startedAt` vêm do chamador (I/O).
 */
export async function saveActiveSession(profileId, session) {
  if (!session || !session.puzzleSceneId) return null;
  try {
    const p = await loadProgress(profileId);
    const placedPieceIds = Array.isArray(session.placedPieceIds) ? session.placedPieceIds : [];
    const total = session.pieceCount || session.total || 0;
    if (total > 0 && placedPieceIds.length >= total) { p.activeSession = null; }
    else {
      p.activeSession = {
        sessionId: session.sessionId || null,
        puzzleSceneId: session.puzzleSceneId,
        storyId: session.storyId || null,
        sceneNumber: session.sceneNumber != null ? session.sceneNumber : null,
        pieceCount: total,
        placedPieceIds,
        trayPieceOrder: Array.isArray(session.trayPieceOrder) ? session.trayPieceOrder : null,
        shuffleSeed: session.shuffleSeed != null ? session.shuffleSeed : null,
        startedAt: session.startedAt || null,
        updatedAt: session.updatedAt || null,
      };
    }
    await AsyncStorage.setItem(keyFor(profileId), JSON.stringify(p));
    return p.activeSession;
  } catch {
    return null;
  }
}

export async function clearActiveSession(profileId) {
  try {
    const p = await loadProgress(profileId);
    p.activeSession = null;
    await AsyncStorage.setItem(keyFor(profileId), JSON.stringify(p));
  } catch { /* melhor esforço */ }
}

export default { quadroState, placedOf, storyProgressCounts, isStoryComplete, collectionMessage, isResumable, loadProgress, getActiveSession, getRawSession, saveActiveSession, clearActiveSession };
