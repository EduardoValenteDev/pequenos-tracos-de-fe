/**
 * parentSettingsService.js — Configurações e consentimento dos responsáveis.
 *
 * Persiste preferências e consentimento parental localmente.
 * Nenhum dado sensível é coletado neste sprint.
 * Email é opcional e nunca obrigatório.
 * Pronto para integração com a Área dos Pais em sprint futuro.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { createDefaultParentSettings } from '../data/appDataModel';
import { log } from '../utils/logger';

// ── Configurações ────────────────────────────────────────────────────────────

/** Retorna as configurações atuais dos pais, ou os valores padrão seguros. */
export async function getParentSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PARENT_SETTINGS);
    if (!raw) return createDefaultParentSettings();
    const parsed = JSON.parse(raw);
    return { ...createDefaultParentSettings(), ...parsed };
  } catch {
    return createDefaultParentSettings();
  }
}

/**
 * Atualiza campos específicos das configurações.
 * Faz merge com os valores existentes (não substitui tudo).
 * Retorna as configurações atualizadas.
 */
export async function updateParentSettings(updates = {}) {
  try {
    const current = await getParentSettings();
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(STORAGE_KEYS.PARENT_SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    log('parentSettingsService.update:', e);
    return getParentSettings();
  }
}

/** Redefine as configurações para os valores padrão. */
export async function resetParentSettings() {
  try {
    const defaults = createDefaultParentSettings();
    await AsyncStorage.setItem(STORAGE_KEYS.PARENT_SETTINGS, JSON.stringify(defaults));
    return defaults;
  } catch (e) {
    log('parentSettingsService.reset:', e);
    return createDefaultParentSettings();
  }
}

// ── Consentimento parental ───────────────────────────────────────────────────

/**
 * Retorna o estado atual do consentimento parental.
 * Retorna { accepted: false } se não houver consentimento registrado.
 */
export async function getParentalConsent() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PARENTAL_CONSENT);
    if (!raw) return { accepted: false, acceptedAt: null, metadata: null };
    return JSON.parse(raw);
  } catch {
    return { accepted: false, acceptedAt: null, metadata: null };
  }
}

/**
 * Registra o consentimento parental.
 * metadata: objeto opcional com informações adicionais (versão dos termos, etc.)
 */
export async function acceptParentalConsent(metadata = null) {
  try {
    const record = {
      accepted: true,
      acceptedAt: new Date().toISOString(),
      metadata: metadata || null,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.PARENTAL_CONSENT, JSON.stringify(record));
    return record;
  } catch (e) {
    log('parentSettingsService.acceptConsent:', e);
    return null;
  }
}

/** Revoga o consentimento parental (mantém o registro com accepted: false). */
export async function revokeParentalConsent() {
  try {
    const current = await getParentalConsent();
    const record = { ...current, accepted: false, revokedAt: new Date().toISOString() };
    await AsyncStorage.setItem(STORAGE_KEYS.PARENTAL_CONSENT, JSON.stringify(record));
    return record;
  } catch (e) {
    log('parentSettingsService.revokeConsent:', e);
    return null;
  }
}
