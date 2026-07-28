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
 *
 * ── Correção G1 · TRÊS EIXOS INDEPENDENTES (não confundir) ────────────────────────────────────
 * 1. SUCESSÃO VISUAL (`operationId` monotônico, `opCounters`): qual tentativa é a ATUAL na tela.
 *    Serve ao stale-guard de progresso e ao snapshot — um voo ANTIGO nunca sobrescreve o visual
 *    de um mais NOVO da mesma história. Começar uma segunda tentativa SUPERA a primeira.
 * 2. REVOGAÇÃO EXPLÍCITA (`revocations`, geração por storyId): SÓ o Reset do usuário
 *    (`clearStoryPackInstall`) avança esta geração. `beginInstall` NÃO a toca. Um voo é revogado
 *    quando nasceu numa geração ANTERIOR à vigente — isso distingue voos iniciados antes e depois
 *    do Reset e é a ÚNICA base legítima da fence de publicação e do joiner-guard.
 * 3. PUBLICAÇÃO FÍSICA (`notifyReady`): o pack foi realmente gravado no índice. É um FATO do
 *    disco, não uma opinião da tela: propaga ao PacksContext mesmo quando o voo já foi superado
 *    visualmente (só um Reset o suprime).
 *
 * Antes da correção G1 os eixos 1 e 2 eram o MESMO contador: qualquer nova operação da história
 * era indistinguível de um Reset, e um voo legítimo de outra identidade apagava o pack do anterior.
 */

/** Fases oficiais do estado de instalação (documentação executável). */
export const INSTALL_PHASES = Object.freeze([
  'idle', 'resolving', 'downloading', 'verifying', 'publishing', 'ready', 'error',
]);

const snapshots = new Map();       // storyId -> snapshot canônico
const listeners = new Map();       // storyId -> Set<listener>
const readyListeners = new Set();  // ouvintes GLOBAIS de disponibilidade persistida (PacksContext)
const opCounters = new Map();      // storyId -> operationId corrente (EIXO 1: sucessão VISUAL)
const revocations = new Map();     // storyId -> geração de REVOGAÇÃO (EIXO 2: só o Reset avança)
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
 * EIXO 1 — SUCESSÃO VISUAL: `operationId` ainda é a tentativa ATUAL da história?
 *
 * Correção G1: isto responde "sou a tentativa mais recente?", NÃO "fui revogado?". Serve ao
 * stale-guard de progresso e ao snapshot da interface. NÃO deve governar publicação física nem
 * joiner-guard — começar outro voo da mesma história (outra identidade resolvida) supera o
 * anterior visualmente, mas NÃO o revoga. Para autorização de publicação use `isFlightRevoked`.
 * Sem operationId conhecido → considerado atual (compatível com chamadas sem registro).
 */
export function isCurrentOperation(storyId, operationId) {
  if (operationId == null) return true;
  return isCurrent(storyId, operationId);
}

function revocationOf(storyId) {
  const g = revocations.get(storyId);
  return Number.isFinite(g) ? g : 0;
}

/**
 * EIXO 2 — GERAÇÃO DE REVOGAÇÃO vigente da história. O voo CAPTURA este número ao nascer e o
 * carrega até o fim. Só `clearStoryPackInstall` (Reset explícito) o avança; `beginInstall` não.
 */
export function getRevocationGeneration(storyId) {
  return storyId ? revocationOf(storyId) : 0;
}

/**
 * EIXO 2 — o voo nascido na geração `generation` foi REVOGADO por um Reset posterior?
 *
 * É a ÚNICA pergunta que autoriza (ou não) uma publicação física e o compartilhamento de um voo.
 * Não é um booleano global: compara a geração CAPTURADA pelo voo com a vigente, então distingue
 * voos iniciados ANTES do Reset (revogados) dos iniciados DEPOIS (livres para publicar).
 * Sem geração conhecida (chamada sem registro / registro dublado) → NÃO revogado (legado).
 */
export function isFlightRevoked(storyId, generation) {
  if (generation == null) return false;
  return revocationOf(storyId) > generation;
}

/**
 * Inicia (ou re-inicia) a operação canônica da história. Retorna um operationId monotônico.
 *
 * Correção G1 — INVARIANTE: mexe SÓ no eixo da sucessão visual (`opCounters`/snapshot).
 * NÃO avança a geração de revogação: iniciar B não revoga A. Duas identidades resolvidas
 * diferentes da mesma história são voos físicos legítimos e simultâneos; só o Reset revoga.
 */
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

/**
 * Conclui a operação com sucesso. Correção G1 — SEPARA dois efeitos que antes eram um só:
 *
 *  (a) SNAPSHOT VISUAL: só a operação ATUAL escreve na tela. Um voo superado NÃO reescreve o
 *      visual da tentativa mais nova (eixo 1 preservado, sem regressão do stale-guard).
 *  (b) EVENTO GLOBAL DE DISPONIBILIDADE: a publicação FÍSICA aconteceu — o pack está no índice.
 *      Isso é fato de disco e o PacksContext PRECISA saber, mesmo que a operação já tenha sido
 *      superada visualmente por outra identidade. Sem isto, um pack válido ficava invisível.
 *
 * `generation` é a geração de revogação CAPTURADA pelo voo: revogado por Reset → nada acontece
 * (nem visual, nem evento global). Chamada sem `generation` → tratada como não revogada (legado).
 * Cada publicação física produz NO MÁXIMO um evento global (um settlement por voo).
 */
export function settleReady(storyId, operationId, entry, generation) {
  if (isFlightRevoked(storyId, generation)) return;   // Reset explícito → NÃO restaura READY
  const cur = snapshots.get(storyId) || idleSnapshot(storyId);
  if (!isCurrent(storyId, operationId)) {
    // Voo SUPERADO (não revogado) que publicou de verdade: não toca o visual, mas reconcilia o índice.
    notifyReady({
      ...idleSnapshot(storyId),
      operationId,
      version: (entry && entry.version) || null,
      status: 'ready',
      phase: 'ready',
      progress: 1,
      entry: entry || null,
    });
    return;
  }
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
 * Reset/remoção de um pack — ÚNICA fonte de REVOGAÇÃO (correção G1).
 *
 * Avança a geração de revogação da história: TODOS os voos nascidos antes deste instante perdem a
 * autorização de publicar (`isFlightRevoked` passa a responder true para eles), e qualquer voo
 * iniciado DEPOIS nasce na nova geração e publica normalmente. Também faz bump do eixo visual
 * (settlements antigos deixam de ser correntes) e limpa o snapshot.
 */
export function clearStoryPackInstall(storyId) {
  if (!storyId) return;
  revocations.set(storyId, revocationOf(storyId) + 1);   // REVOGAÇÃO explícita (eixo 2)
  opCounters.set(storyId, ++seq);   // operação "fantasma" → settlements antigos deixam de ser correntes
  snapshots.delete(storyId);
  notify(storyId);
}

/** Só teste/diagnóstico. */
export function _debugState() {
  return {
    stories: [...snapshots.keys()],
    listeners: [...listeners.keys()],
    readyListeners: readyListeners.size,
    seq,
    revocations: Object.fromEntries(revocations),
  };
}
