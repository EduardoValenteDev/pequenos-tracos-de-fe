/**
 * packInstallRegistry.js — FONTE GLOBAL OBSERVÁVEL do estado de instalação de packs
 * (LP2.1a-ii DEVICE FAIL 01F — correção funcional).
 *
 * Problema que resolve (comprovado na Rodada F): o progresso do download morava no `useState`
 * local do hook e a propagação de READY dependia da tela iniciadora continuar `current`. Ao
 * desmontar a tela, o progresso sumia, o READY não chegava ao PacksContext e a interface voltava
 * a oferecer "Baixar história" (exigindo um segundo toque para reconciliar).
 *
 * Este registro é um SINGLETON de MÓDULO (sem React, sem deps): a instalação física publica aqui
 * e o estado SOBREVIVE ao unmount das telas. Telas OBSERVAM por `storyId` (replay imediato do
 * último snapshot). READY dispara um evento GLOBAL para o PacksContext reconciliar o índice —
 * independente de qual tela iniciou o download.
 *
 * NÃO baixa, NÃO grava índice, NÃO toca disco/rede. Só mantém e distribui estado observável.
 * `operationId` monotônico garante que um voo ANTIGO nunca sobrescreva um mais NOVO da mesma
 * história (stale-guard), e que um Reset invalide settlements em voo (nenhum READY indevido).
 */

/** Fases oficiais do estado de instalação (documentação executável). */
export const INSTALL_PHASES = Object.freeze([
  'idle', 'resolving', 'downloading', 'verifying', 'publishing', 'ready', 'error',
]);

const snapshots = new Map();       // storyId -> snapshot canônico
const listeners = new Map();       // storyId -> Set<listener>
const readyListeners = new Set();  // ouvintes GLOBAIS de disponibilidade persistida (PacksContext)
const opCounters = new Map();      // storyId -> operationId corrente
let seq = 0;                       // contador monotônico global de operações

function idleSnapshot(storyId) {
  return {
    storyId,
    operationId: null,
    resolvedInstallKey: null,
    version: null,
    status: 'idle',
    phase: 'idle',
    progress: 0,
    requestedKinds: null,
    startedAt: null,
    updatedAt: null,
    error: null,
    entry: null,
  };
}

/** Snapshot atual da história (idle se não há operação). NUNCA lança. */
export function getStoryPackInstallSnapshot(storyId) {
  return snapshots.get(storyId) || idleSnapshot(storyId);
}

function notify(storyId) {
  const set = listeners.get(storyId);
  if (!set || !set.size) return;
  const snap = getStoryPackInstallSnapshot(storyId);
  for (const fn of Array.from(set)) { try { fn(snap); } catch (_) { /* um ouvinte não afeta os outros */ } }
}

function notifyReady(snap) {
  for (const fn of Array.from(readyListeners)) { try { fn(snap); } catch (_) { /* isola */ } }
}

/**
 * Observa a instalação de UMA história. Replay IMEDIATO do último snapshot no registro (a tela que
 * monta durante um voo recebe status/phase/progress na hora, sem novo download). Retorna unsubscribe.
 * Isola histórias diferentes (mapa por storyId). Não referencia o componente desmontado após o unsub.
 */
export function subscribeStoryPackInstall(storyId, listener) {
  if (!storyId || typeof listener !== 'function') return () => {};
  let set = listeners.get(storyId);
  if (!set) { set = new Set(); listeners.set(storyId, set); }
  set.add(listener);
  try { listener(getStoryPackInstallSnapshot(storyId)); } catch (_) { /* replay isola */ }
  return () => {
    const s = listeners.get(storyId);
    if (s) { s.delete(listener); if (!s.size) listeners.delete(storyId); }
  };
}

/**
 * Ouvinte GLOBAL de disponibilidade PERSISTIDA (READY). O PacksContext usa isto para reconciliar
 * o índice quando um pack fica pronto — INDEPENDENTE da tela iniciadora. NÃO recebe progresso por
 * arquivo (só READY), para não causar tempestade de renders durante o download. Retorna unsubscribe.
 */
export function subscribePackReady(listener) {
  if (typeof listener !== 'function') return () => {};
  readyListeners.add(listener);
  return () => { readyListeners.delete(listener); };
}

function isCurrent(storyId, operationId) {
  return operationId != null && opCounters.get(storyId) === operationId;
}

/**
 * FENCE DE AUTORIZAÇÃO (FIX1R): a operação `operationId` ainda tem autorização GLOBAL para publicar?
 * O serviço consulta isto ANTES de `setPackEntry(READY)` — um Reset (que faz bump do contador via
 * `clearStoryPackInstall`) revoga a autorização e impede o voo antigo de gravar READY no índice.
 * Sem operationId conhecido → autorizado (compatível com chamadas sem registro).
 */
export function isCurrentOperation(storyId, operationId) {
  if (operationId == null) return true;
  return isCurrent(storyId, operationId);
}

/** Inicia (ou re-inicia) a operação canônica da história. Retorna um operationId monotônico. */
export function beginInstall(storyId, meta = {}) {
  if (!storyId) return null;
  const operationId = ++seq;
  opCounters.set(storyId, operationId);
  snapshots.set(storyId, {
    ...idleSnapshot(storyId),
    operationId,
    resolvedInstallKey: meta.resolvedInstallKey || null,
    version: meta.version || null,
    requestedKinds: meta.requestedKinds || null,
    status: 'downloading',
    phase: meta.phase || 'resolving',
    progress: 0,
    startedAt: meta.now != null ? meta.now : null,
    updatedAt: meta.now != null ? meta.now : null,
  });
  notify(storyId);
  return operationId;
}

/** Atualiza fase/status/progresso de uma operação. Ignora eventos de operação ANTIGA (stale-guard). */
export function reportInstall(storyId, operationId, patch = {}) {
  if (!isCurrent(storyId, operationId)) return;
  const cur = snapshots.get(storyId);
  if (!cur) return;
  const next = { ...cur, updatedAt: patch.now != null ? patch.now : cur.updatedAt };
  if ('phase' in patch && patch.phase) next.phase = patch.phase;
  if ('status' in patch && patch.status) next.status = patch.status;
  if ('progress' in patch && Number.isFinite(patch.progress)) next.progress = Math.max(0, Math.min(1, patch.progress));
  snapshots.set(storyId, next);
  notify(storyId);
}

/** Conclui a operação com sucesso: publica READY + dispara o evento global de disponibilidade. */
export function settleReady(storyId, operationId, entry) {
  if (!isCurrent(storyId, operationId)) return;   // voo antigo/Reset → NÃO restaura READY
  const cur = snapshots.get(storyId) || idleSnapshot(storyId);
  const snap = { ...cur, status: 'ready', phase: 'ready', progress: 1, entry: entry || cur.entry, error: null };
  snapshots.set(storyId, snap);
  notify(storyId);
  notifyReady(snap);
}

/** Conclui a operação com erro: publica ERROR e NÃO publica READY. */
export function settleError(storyId, operationId, error) {
  if (!isCurrent(storyId, operationId)) return;
  const cur = snapshots.get(storyId) || idleSnapshot(storyId);
  snapshots.set(storyId, { ...cur, status: 'error', phase: 'error', error: error != null ? String(error) : 'error' });
  notify(storyId);
}

/**
 * Reset/remoção de um pack: invalida QUALQUER settlement em voo (bump do contador → operações
 * antigas ficam stale e não restauram READY) e limpa o snapshot (sem ready/progresso/erro antigos).
 * A PRÓXIMA instalação começa numa nova operationId.
 */
export function clearStoryPackInstall(storyId) {
  if (!storyId) return;
  opCounters.set(storyId, ++seq);   // operação "fantasma" → settlements antigos deixam de ser correntes
  snapshots.delete(storyId);
  notify(storyId);
}

/** Só teste/diagnóstico. */
export function _debugState() {
  return { stories: [...snapshots.keys()], listeners: [...listeners.keys()], readyListeners: readyListeners.size, seq };
}
