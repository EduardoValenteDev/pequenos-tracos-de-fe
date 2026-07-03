/**
 * storyJourneyService.js — CONTRATO ÚNICO do status da história (A0.10).
 *
 * Puro (sem I/O, sem React, sem storage, sem imports) → única definição de
 * "concluída", "próxima aventura" e "bloqueada" para mapa, card, StoryDetail,
 * estante e Área dos Pais. Sandbox-testável (o smoke avalia esta lógica direto).
 *
 * SEPARA claramente três eixos:
 *   1. ACESSO COMERCIAL  — free / premium / comingSoon / premiumLocked / blocked
 *      (derivado do accessStatus/accessType já resolvidos por contentAccessService;
 *       NÃO reescreve acesso real, paywall, packs ou premium).
 *   2. PROGRESSO NARRATIVO — scenesComplete = todas as cenas vistas.
 *   3. JORNADA COMPLETA  — journeyComplete = cenas + Livrinho + quiz + reflexão +
 *      colorir (pelo menos 1 página). "10/10 cenas" é só progresso, nunca conclusão.
 *
 * PROGRESSÃO DA JORNADA (sequência):
 *   - sequenceUnlocked = 1ª história sempre true; demais só se a ANTERIOR estiver
 *     journeyComplete. Cenas completas NÃO liberam a próxima.
 *   - canOpen        = sequenceUnlocked && acesso comercial permitido && mídia pronta.
 *   - canShowAsNext  = sequenceUnlocked && !journeyComplete && acesso permitido.
 *
 * HIERARQUIA de status (mapa/card): comingSoon > journeyLocked > premiumLocked >
 * locked > journeyComplete > scenesComplete > inProgress > notStarted.
 * journeyLocked vem ANTES de premiumLocked: se a jornada ainda não chegou, mostrar
 * "complete a anterior" — nunca "Plano Família" como ação principal.
 */

/** Status público/mapa possíveis. */
export const JOURNEY_STATUS = {
  COMING_SOON: 'comingSoon',
  JOURNEY_LOCKED: 'journeyLocked',
  PREMIUM_LOCKED: 'premiumLocked',
  LOCKED: 'locked',
  NOT_STARTED: 'notStarted',
  IN_PROGRESS: 'inProgress',
  SCENES_COMPLETE: 'scenesComplete',
  JOURNEY_COMPLETE: 'journeyComplete',
};

/** Acesso comercial (separado da progressão da jornada). */
export const COMMERCIAL_ACCESS = {
  FREE: 'free',
  PREMIUM: 'premium',
  COMING_SOON: 'comingSoon',
  PREMIUM_LOCKED: 'premiumLocked',
  BLOCKED: 'blocked',
};

/**
 * Deriva o contrato completo de UMA história a partir de dados já carregados.
 *
 * @param {object} params
 * @param {number} [params.totalScenes]
 * @param {number} [params.sceneDoneCount]
 * @param {object} [params.postStoryStatus] — { storyBookOpened, quizDone, reflectionDone }
 * @param {boolean}[params.coloringComplete] — pelo menos 1 página de colorir concluída
 * @param {string} [params.accessStatus]     — 'full' | 'preview' | 'locked' | 'coming_soon'
 * @param {string} [params.accessType]       — 'free' | 'premium'
 * @param {boolean}[params.isFirstStory]     — 1ª história da jornada oficial
 * @param {boolean}[params.previousJourneyComplete] — anterior journeyComplete?
 */
export function getStoryJourneyStatus(params) {
  const p = params || {};

  // ── Progresso narrativo ──
  const total = p.totalScenes > 0 ? p.totalScenes : 0;
  const doneRaw = p.sceneDoneCount > 0 ? p.sceneDoneCount : 0;
  const done = total > 0 ? Math.min(doneRaw, total) : doneRaw;
  const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const progress = { done, total, percent };

  // ── Jornada ──
  const pss = p.postStoryStatus || {};
  const scenesComplete = total > 0 && done >= total;
  const hasStarted = done > 0;
  const bookOpened = !!pss.storyBookOpened;
  const quizDone = !!pss.quizDone;
  const reflectionDone = !!pss.reflectionDone;
  const coloringComplete = !!p.coloringComplete;
  const journeyComplete =
    scenesComplete && bookOpened && quizDone && reflectionDone && coloringComplete;

  // ── Acesso comercial (classifica; não reescreve regra de acesso) ──
  const accessStatus = p.accessStatus || 'full'; // contentAccessService.getStoryAccessStatus
  const accessType = p.accessType || 'free';
  let access;
  if (accessStatus === 'coming_soon') access = COMMERCIAL_ACCESS.COMING_SOON;
  else if (accessType === 'premium' && accessStatus !== 'full') access = COMMERCIAL_ACCESS.PREMIUM_LOCKED;
  else if (accessStatus === 'locked') access = COMMERCIAL_ACCESS.BLOCKED;
  else if (accessType === 'premium') access = COMMERCIAL_ACCESS.PREMIUM; // premium com acesso
  else access = COMMERCIAL_ACCESS.FREE;

  const mediaReady = accessStatus !== 'coming_soon';
  const commercialAllowed = access === COMMERCIAL_ACCESS.FREE || access === COMMERCIAL_ACCESS.PREMIUM;

  // ── Sequência da jornada ──
  const sequenceUnlocked = !!p.isFirstStory || !!p.previousJourneyComplete;

  // ── Status (hierarquia) ──
  let status;
  if (access === COMMERCIAL_ACCESS.COMING_SOON) status = JOURNEY_STATUS.COMING_SOON;
  else if (!sequenceUnlocked) status = JOURNEY_STATUS.JOURNEY_LOCKED;        // antes de premiumLocked
  else if (access === COMMERCIAL_ACCESS.PREMIUM_LOCKED) status = JOURNEY_STATUS.PREMIUM_LOCKED;
  else if (access === COMMERCIAL_ACCESS.BLOCKED) status = JOURNEY_STATUS.LOCKED;
  else if (journeyComplete) status = JOURNEY_STATUS.JOURNEY_COMPLETE;
  else if (scenesComplete) status = JOURNEY_STATUS.SCENES_COMPLETE;
  else if (hasStarted) status = JOURNEY_STATUS.IN_PROGRESS;
  else status = JOURNEY_STATUS.NOT_STARTED;

  const canOpen = sequenceUnlocked && commercialAllowed && mediaReady;
  const canShowAsNext = sequenceUnlocked && !journeyComplete && commercialAllowed && mediaReady;

  return {
    access,
    status,
    hasStarted,
    scenesComplete,
    bookOpened,
    quizDone,
    reflectionDone,
    coloringComplete,
    journeyComplete,
    sequenceUnlocked,
    canOpen,
    canShowAsNext,
    progress,
  };
}
