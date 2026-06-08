/**
 * onboardingService.js — Controle local do onboarding progressivo.
 *
 * Determina se o onboarding já foi concluído e persiste o estado.
 * Defensivo contra JSON inválido — se falhar, o app abre normalmente.
 *
 * Estado salvo em: STORAGE_KEYS.ONBOARDING_STATE (@ptf_onboarding_v1)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { log } from '../utils/logger';

export const ONBOARDING_CURRENT_VERSION = 1;

const DEFAULT_STATE = {
  completed: false,
  completedAt: null,
  version: 0,
};

// ── Leitura/escrita ───────────────────────────────────────────────────────────

async function readState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

async function writeState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(state));
  } catch (e) {
    log('onboardingService.write:', e);
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

/** Retorna o estado completo do onboarding. Nunca lança. */
export async function getOnboardingState() {
  return readState();
}

/**
 * Marca o onboarding como concluído.
 * Idempotente: chamar duas vezes não cria problemas.
 */
export async function markOnboardingCompleted() {
  await writeState({
    completed: true,
    completedAt: new Date().toISOString(),
    version: ONBOARDING_CURRENT_VERSION,
  });
}

/**
 * Reseta o onboarding para o estado inicial.
 * Não apaga dados de perfil, progresso ou conquistas.
 * Uso: QA e desenvolvimento.
 */
export async function resetOnboarding() {
  await writeState({ ...DEFAULT_STATE });
}

/**
 * Retorna true se o onboarding deve ser exibido.
 *
 * Lógica:
 * 1. Se @ptf_onboarding_v1 existir → usa o campo completed.
 * 2. Se não existir → verifica @ptf_profile (legado).
 *    - Perfil legado com name válido: marca onboarding concluído e retorna false.
 *      (usuário antigo não deve refazer onboarding após atualização do app)
 *    - Sem perfil legado: retorna true (nova instalação).
 * 3. Em caso de erro, retorna false (abre o app normalmente).
 */
export async function shouldShowOnboarding() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      return !parsed.completed;
    }
    // Estado de onboarding ainda não existe — verificar perfil legado
    const legacyRaw = await AsyncStorage.getItem(STORAGE_KEYS.LEGACY_PROFILE);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy?.name?.trim()) {
        // Usuário com perfil pré-onboarding: marcar como concluído silenciosamente
        await markOnboardingCompleted();
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Reseta apenas o estado de onboarding para nova visualização em QA.
 * Não apaga @ptf_profile, progresso, desenhos, conquistas nem dados do ateliê.
 * Retorna { success: true } ou { success: false, error: string }.
 */
export async function resetOnboardingForQa() {
  try {
    await writeState({ ...DEFAULT_STATE });
    return { success: true };
  } catch (e) {
    log('onboardingService.resetForQa:', e);
    return { success: false, error: String(e) };
  }
}

/** Retorna a versão de onboarding registrada (0 se nunca concluído). */
export async function getOnboardingVersion() {
  const state = await readState();
  return state.version ?? 0;
}
