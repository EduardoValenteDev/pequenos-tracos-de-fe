/**
 * storageKeys.js — Camada central de chaves do AsyncStorage.
 *
 * Fonte única de verdade para todas as chaves de persistência local do app.
 * Objetivo: evitar chaves espalhadas, duplicadas ou difíceis de migrar.
 *
 * Uso:
 *   import { STORAGE_KEYS, storageKey } from './storageKeys';
 *
 * Chaves estáticas ficam em STORAGE_KEYS (constantes por valor).
 * Chaves dinâmicas ficam em storageKey (funções geradoras).
 *
 * Regra: nenhum outro arquivo deve declarar chaves @ do app manualmente.
 * Migração gradual: os serviços legados podem continuar usando seus valores
 * literais enquanto não são migrados, mas novas chaves devem vir daqui.
 */

/** Versão atual do schema local. Incrementar a cada sprint que mude a estrutura. */
export const APP_STORAGE_SCHEMA_VERSION = 1;

/**
 * Chaves estáticas do AsyncStorage.
 * Prefixo @ = chaves de domínio principal do app (ptf).
 * Chaves sem @ são legadas do atelierStorage.
 */
export const STORAGE_KEYS = {
  // ── Schema de migração ──────────────────────────────────────────────────
  SCHEMA_VERSION: '@ptf_schema_version',
  MIGRATION_STATUS: '@ptf_migration_status_v1',

  // ── Perfil legado (mantido para compatibilidade) ────────────────────────
  LEGACY_PROFILE: '@ptf_profile',

  // ── Perfis infantis (v1 — múltiplos filhos) ─────────────────────────────
  CHILD_PROFILES_LIST: '@ptf_child_profiles_v1',
  ACTIVE_CHILD_PROFILE_ID: '@ptf_active_child_id_v1',

  // ── Progresso por história ───────────────────────────────────────────────
  // Chave dinâmica: storageKey.progress(storyId)
  // Exemplo: @ptf_progress_creation

  // ── Pós-história ─────────────────────────────────────────────────────────
  LUMI_MOMENT_EVER: '@ptf_lumi_moment_ever',
  BONUS_STARS: '@ptf_bonus_stars',

  // ── Ateliê (prefixo sem @ é legado do atelierStorage) ───────────────────
  ATELIER_INDEX: 'ptf_atelier_arts_v1_index',

  // ── Conquistas ───────────────────────────────────────────────────────────
  ACHIEVEMENTS_SEEN: '@ptf_achievements_seen',

  // ── Configurações dos pais ───────────────────────────────────────────────
  PARENT_SETTINGS: '@ptf_parent_settings_v1',
  PARENTAL_CONSENT: '@ptf_parental_consent_v1',

  // ── Plano local ──────────────────────────────────────────────────────────
  PLAN_STATE: '@ptf_plan_state_v1',

  // ── Modo Igreja ──────────────────────────────────────────────────────────
  CHURCH_GROUPS: '@ptf_church_groups_v1',

  // ── Certificados ─────────────────────────────────────────────────────────
  CERTIFICATES_INDEX: '@ptf_certificates_v1_index',

  // ── Cards compartilháveis ────────────────────────────────────────────────
  SHARE_CARDS_INDEX: '@ptf_share_cards_v1_index',
};

/**
 * Funções geradoras de chaves dinâmicas (dependem de parâmetros em runtime).
 *
 * Uso:
 *   storageKey.progress('noah')
 *   storageKey.drawing('noah', 3)
 *   storageKey.weeklyReport('abc123')
 */
export const storageKey = {
  /** Progresso de cenas de uma história. */
  progress: (storyId) => `@ptf_progress_${storyId}`,

  /** Payload de pintura de uma cena específica. */
  drawing: (storyId, sceneId) => `@ptf_drawing_s${storyId}_c${sceneId}`,

  /** Quiz concluído para uma história. */
  quizDone: (storyId) => `@ptf_quiz_done_${storyId}`,

  /** Reflexão salva para uma história. */
  reflection: (storyId) => `@ptf_reflection_${storyId}`,

  /** Livrinho da Fé aberto para uma história. */
  storyBookOpened: (storyId) => `@ptf_storybook_opened_${storyId}`,

  /** Momento Lumi de um dia específico (YYYY-MM-DD). */
  lumiMomentDate: (date) => `@ptf_lumi_moment_${date}`,

  /** Arte completa do ateliê por ID. */
  atelierArt: (id) => `ptf_atelier_arts_v1_${id}`,

  /** Certificado por ID. */
  certificate: (id) => `@ptf_certificate_v1_${id}`,

  /** Card compartilhável por ID. */
  shareCard: (id) => `@ptf_share_card_v1_${id}`,

  /** Índice de relatórios semanais por filho. */
  weeklyReportsIndex: (childId) => `@ptf_weekly_reports_v1_index_${childId}`,

  /** Relatório semanal por ID. */
  weeklyReport: (id) => `@ptf_weekly_report_v1_${id}`,
};
