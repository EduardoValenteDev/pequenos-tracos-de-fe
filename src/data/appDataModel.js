/**
 * appDataModel.js — Modelo de dados local do MVP completo.
 *
 * Define estruturas padrão, factories e constantes para todos os domínios
 * de dados do app. Tudo local first — nenhuma estrutura aqui depende de backend.
 *
 * Uso:
 *   import { createChildProfile, createParentSettings, PLAN_TIER } from '../data/appDataModel';
 *   const profile = createChildProfile({ name: 'Bia', avatarId: '🌟' });
 */

// ── Helpers internos ────────────────────────────────────────────────────────

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 99999)}`;
}

function now() {
  return new Date().toISOString();
}

// ── ChildProfile ────────────────────────────────────────────────────────────

/**
 * Perfil de uma criança no app.
 * Um dispositivo pode ter múltiplos perfis infantis (multi-filho).
 */
export function createChildProfile({ name = '', avatarId = '🌟', id, createdAt, isActive = false } = {}) {
  const ts = now();
  return {
    id: id || generateId('child'),
    name: String(name).trim(),
    avatarId: String(avatarId),
    createdAt: createdAt || ts,
    updatedAt: ts,
    isActive: Boolean(isActive),
  };
}

// ── ParentProfile ───────────────────────────────────────────────────────────

/**
 * Perfil do responsável.
 * Opcional — o app funciona sem ele. Usado para consentimento e configurações.
 */
export function createParentProfile({ displayName, email, consentAccepted = false, consentAcceptedAt, id, createdAt } = {}) {
  const ts = now();
  return {
    id: id || generateId('parent'),
    displayName: displayName ? String(displayName).trim() : null,
    email: email ? String(email).trim().toLowerCase() : null,
    consentAccepted: Boolean(consentAccepted),
    consentAcceptedAt: consentAccepted ? (consentAcceptedAt || ts) : null,
    createdAt: createdAt || ts,
    updatedAt: ts,
  };
}

// ── ParentSettings ──────────────────────────────────────────────────────────

/** Configurações dos pais com valores padrão seguros. */
export function createDefaultParentSettings() {
  return {
    notificationsEnabled: false,
    sundayStoryReminderEnabled: false,
    familyReminderEnabled: false,
    allowShareCards: false,
    allowProgressReports: true,
    allowChurchMode: false,
    updatedAt: now(),
  };
}

// ── PlanState ───────────────────────────────────────────────────────────────

export const PLAN_TIER = {
  FREE: 'free',
  FAMILY_MONTHLY: 'family_monthly',
  FAMILY_ANNUAL: 'family_annual',
  CHURCH: 'church',
  CREATOR_QA: 'creator_qa',
};

/**
 * Estado local do plano do usuário.
 * Fonte de verdade local até integração com IAP.
 */
export function createDefaultPlanState() {
  return {
    tier: PLAN_TIER.FREE,
    premiumActive: false,
    isPurchaseEnabled: false,
    source: 'local',
    expiresAt: null,
    updatedAt: now(),
  };
}

// ── ChurchGroup ─────────────────────────────────────────────────────────────

/**
 * Turma/grupo de uma igreja usando o app.
 * Gerenciado localmente no dispositivo do líder.
 */
export function createChurchGroup({ name = '', leaderName = '', churchName = '', id, createdAt } = {}) {
  const ts = now();
  return {
    id: id || generateId('church'),
    name: String(name).trim(),
    leaderName: String(leaderName).trim(),
    churchName: String(churchName).trim(),
    inviteCode: _generateInviteCode(),
    createdAt: createdAt || ts,
    updatedAt: ts,
    childrenIds: [],
    weeklyStoryId: null,
    isActive: true,
  };
}

function _generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── CertificateRecord ───────────────────────────────────────────────────────

export const CERTIFICATE_TYPE = {
  STORY: 'story',
  TRACK: 'track',
};

/**
 * Registro local de certificado conquistado pela criança.
 * A geração visual (PDF/imagem) fica para sprint futuro.
 */
export function createCertificateRecord({ childId, storyId, trackId, type, title, id, createdAt } = {}) {
  const ts = now();
  return {
    id: id || generateId('cert'),
    childId: String(childId || ''),
    storyId: storyId ? String(storyId) : null,
    trackId: trackId ? String(trackId) : null,
    type: type || (trackId ? CERTIFICATE_TYPE.TRACK : CERTIFICATE_TYPE.STORY),
    title: String(title || ''),
    createdAt: createdAt || ts,
    shareable: true,
  };
}

// ── ShareCardRecord ─────────────────────────────────────────────────────────

export const SHARE_TYPE = {
  DRAWING: 'drawing',
  ACHIEVEMENT: 'achievement',
  STORY_COMPLETE: 'story_complete',
};

/**
 * Registro de card compartilhável gerado pela criança.
 * Não contém foto nem dados sensíveis — apenas nome/apelido, história e conquista.
 */
export function createShareCardRecord({ childId, storyId, drawingKey, achievementId, shareType, id, createdAt } = {}) {
  const ts = now();
  return {
    id: id || generateId('card'),
    childId: String(childId || ''),
    storyId: storyId ? String(storyId) : null,
    drawingKey: drawingKey ? String(drawingKey) : null,
    achievementId: achievementId ? String(achievementId) : null,
    createdAt: createdAt || ts,
    shareType: shareType || SHARE_TYPE.STORY_COMPLETE,
    safeForSharing: true,
  };
}

// ── WeeklyReport ────────────────────────────────────────────────────────────

/**
 * Relatório semanal de progresso de uma criança.
 * Calculado a partir dos dados locais existentes.
 */
export function createWeeklyReport({ childId, weekStart, weekEnd, storiesCompleted = 0, drawingsSaved = 0, quizzesCompleted = 0, starsEarned = 0, achievementsEarned = 0, id, createdAt } = {}) {
  const ts = now();
  return {
    id: id || generateId('report'),
    childId: String(childId || ''),
    weekStart: weekStart ? String(weekStart) : null,
    weekEnd: weekEnd ? String(weekEnd) : null,
    storiesCompleted: Number(storiesCompleted) || 0,
    drawingsSaved: Number(drawingsSaved) || 0,
    quizzesCompleted: Number(quizzesCompleted) || 0,
    starsEarned: Number(starsEarned) || 0,
    achievementsEarned: Number(achievementsEarned) || 0,
    createdAt: createdAt || ts,
  };
}

// ── LocalMigrationResult ────────────────────────────────────────────────────

/** Resultado de uma operação de migração local de schema. */
export function createMigrationResult({ fromVersion, toVersion, changed = [], errors = [], completedAt } = {}) {
  return {
    fromVersion: Number(fromVersion) || 0,
    toVersion: Number(toVersion) || 0,
    changed: Array.isArray(changed) ? changed : [],
    errors: Array.isArray(errors) ? errors : [],
    completedAt: completedAt || new Date().toISOString(),
  };
}
