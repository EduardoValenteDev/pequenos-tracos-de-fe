/**
 * storageMigrationService.js — Migração local de schema do AsyncStorage.
 *
 * Prepara o app para mudanças futuras de estrutura de dados sem perder dados
 * de usuários existentes. Cada versão de schema tem uma função de migração
 * correspondente (migrateToVN).
 *
 * Regras:
 *   - Idempotente: rodar duas vezes não duplica perfis nem corrompe dados.
 *   - Não apaga dados antigos.
 *   - Resistente a JSON inválido — erros são registrados, não lançados.
 *   - Se a migração falhar, o app continua abrindo.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, APP_STORAGE_SCHEMA_VERSION } from './storageKeys';
import { createMigrationResult } from '../data/appDataModel';
import { migrateLegacyProfileIfNeeded } from './childProfileService';
import { migrateArtsToFiles, migrateArtTitles } from './atelierStorage';
import { migrateDrawingsToFiles } from './drawingStorage';
import { log } from '../utils/logger';

// ── Schema version ────────────────────────────────────────────────────────────

/** Retorna a versão do schema atualmente armazenada (0 se nunca migrado). */
export async function getCurrentSchemaVersion() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
    if (!raw) return 0;
    const v = parseInt(raw, 10);
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

/** Persiste a versão do schema. */
export async function setCurrentSchemaVersion(version) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(version));
  } catch (e) {
    log('storageMigration.setVersion:', e);
  }
}

// ── Migrações ─────────────────────────────────────────────────────────────────

/**
 * Migração para schema v1.
 * - Migra perfil legado @ptf_profile → lista nova @ptf_child_profiles_v1.
 * - Idempotente: se a lista já existir, não migra novamente.
 */
export async function migrateToV1() {
  const changed = [];
  const errors = [];

  try {
    const migrated = await migrateLegacyProfileIfNeeded();
    if (migrated) changed.push('legacy_profile_migrated');
  } catch (e) {
    errors.push(`migrateToV1.profile: ${e?.message || e}`);
    log('storageMigration.v1.profile:', e);
  }

  return { changed, errors };
}

/**
 * Migração para schema v2 (Sprint A5).
 * - Move blobs base64 grandes (preview/thumb de artes do Ateliê + camada de
 *   pintura dos desenhos) do AsyncStorage para arquivos locais (expo-file-system).
 * - O AsyncStorage passa a guardar só ponteiros (file://) + metadados leves.
 * - Idempotente: cada serviço pula itens já migrados (com uri / ponteiro v3).
 * - Não apaga base64 antes de confirmar a escrita do arquivo.
 * - Falha em um item não aborta a migração inteira.
 * - Escopo restrito: toca SOMENTE artes do Ateliê e desenhos. Não toca em
 *   progresso, quizzes, reflexões, plano, perfil, preferências ou flags.
 */
export async function migrateToV2() {
  const changed = [];
  const errors = [];

  try {
    const n = await migrateArtsToFiles();
    if (n > 0) changed.push(`atelier_blobs_to_files:${n}`);
  } catch (e) {
    errors.push(`migrateToV2.atelier: ${e?.message || e}`);
    log('storageMigration.v2.atelier:', e);
  }

  try {
    const n = await migrateDrawingsToFiles();
    if (n > 0) changed.push(`drawing_blobs_to_files:${n}`);
  } catch (e) {
    errors.push(`migrateToV2.drawings: ${e?.message || e}`);
    log('storageMigration.v2.drawings:', e);
  }

  return { changed, errors };
}

/**
 * Migração para schema v3 (Criar livre C1.1 · §6).
 * - Garante que toda arte do Ateliê tenha um título de exibição válido e ÚNICO.
 * - Só preenche artes SEM título; títulos reais permanecem intactos.
 * - Idempotente e não destrói metadados (só o campo `title`).
 * - Escopo restrito: toca SOMENTE o campo título das artes. Nada de progresso,
 *   quizzes, reflexões, plano, perfil, preferências, flags ou blobs.
 */
export async function migrateToV3() {
  const changed = [];
  const errors = [];

  try {
    const n = await migrateArtTitles();
    if (n > 0) changed.push(`atelier_titles_filled:${n}`);
  } catch (e) {
    errors.push(`migrateToV3.titles: ${e?.message || e}`);
    log('storageMigration.v3.titles:', e);
  }

  return { changed, errors };
}

// ── Runner principal ──────────────────────────────────────────────────────────

/**
 * Executa todas as migrações pendentes em sequência.
 *
 * Fluxo:
 *   1. Lê a versão atual do schema.
 *   2. Para cada versão entre (atual+1) e APP_STORAGE_SCHEMA_VERSION, roda a migração.
 *   3. Após cada migração bem-sucedida, atualiza a versão armazenada.
 *   4. Persiste o resultado no MIGRATION_STATUS.
 *
 * Nunca lança. Retorna o resultado agregado da migração.
 */
export async function runLocalMigrations() {
  const fromVersion = await getCurrentSchemaVersion();

  if (fromVersion >= APP_STORAGE_SCHEMA_VERSION) {
    return createMigrationResult({
      fromVersion,
      toVersion: fromVersion,
      changed: [],
      errors: [],
    });
  }

  const allChanged = [];
  const allErrors = [];
  let currentVersion = fromVersion;

  const migrations = [
    { version: 1, run: migrateToV1 },
    { version: 2, run: migrateToV2 },
    { version: 3, run: migrateToV3 },
  ];

  for (const m of migrations) {
    if (currentVersion >= m.version) continue;
    try {
      const result = await m.run();
      allChanged.push(...(result.changed || []));
      allErrors.push(...(result.errors || []));
      currentVersion = m.version;
      await setCurrentSchemaVersion(currentVersion);
    } catch (e) {
      allErrors.push(`migration_v${m.version}: ${e?.message || e}`);
      log(`storageMigration.v${m.version}:`, e);
      break;
    }
  }

  const result = createMigrationResult({
    fromVersion,
    toVersion: currentVersion,
    changed: allChanged,
    errors: allErrors,
  });

  await _saveMigrationStatus(result);
  return result;
}

// ── Status ────────────────────────────────────────────────────────────────────

/**
 * Retorna o resultado da última migração executada, ou null.
 */
export async function getMigrationStatus() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MIGRATION_STATUS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function _saveMigrationStatus(result) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MIGRATION_STATUS, JSON.stringify(result));
  } catch (e) {
    log('storageMigration.saveStatus:', e);
  }
}
