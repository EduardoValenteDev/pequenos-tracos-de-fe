/**
 * childProfileService.js — Gerenciamento de perfis infantis.
 *
 * Mantém compatibilidade total com o perfil legado em @ptf_profile enquanto
 * prepara a base para múltiplos filhos. Toda a persistência é local.
 *
 * Fluxo de migração:
 *   1. migrateLegacyProfileIfNeeded() lê @ptf_profile (se existir)
 *   2. Cria um ChildProfile equivalente na lista nova
 *   3. O perfil legado NÃO é removido (zero perda de dados)
 *
 * Regra: ProfileContext continua lendo @ptf_profile diretamente.
 * Este serviço é a nova camada — adoção gradual sprint a sprint.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { createChildProfile as makeChildProfileData } from '../data/appDataModel';
import { log } from '../utils/logger';

// ── Leitura/escrita da lista ─────────────────────────────────────────────────

async function readProfilesList() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CHILD_PROFILES_LIST);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeProfilesList(list) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CHILD_PROFILES_LIST, JSON.stringify(list));
  } catch (e) {
    log('childProfileService.writeList:', e);
  }
}

// ── API pública ──────────────────────────────────────────────────────────────

/** Retorna todos os perfis infantis cadastrados. */
export async function getChildProfiles() {
  return readProfilesList();
}

/** Retorna o perfil ativo, ou null se não houver nenhum. */
export async function getActiveChildProfile() {
  try {
    const list = await readProfilesList();
    if (list.length === 0) return null;
    const activeId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_CHILD_PROFILE_ID);
    if (activeId) {
      const found = list.find(p => p.id === activeId);
      if (found) return found;
    }
    return list[0] || null;
  } catch {
    return null;
  }
}

/**
 * Cria um novo perfil infantil e o adiciona à lista.
 * Retorna o perfil criado.
 */
export async function createChildProfile({ name, avatarId } = {}) {
  const profile = makeChildProfileData({ name, avatarId });
  const list = await readProfilesList();
  list.push(profile);
  await writeProfilesList(list);
  if (list.length === 1) {
    await setActiveChildProfile(profile.id);
  }
  return profile;
}

/**
 * Atualiza campos de um perfil existente.
 * Retorna o perfil atualizado, ou null se não encontrado.
 */
export async function updateChildProfile(childId, updates = {}) {
  if (!childId) return null;
  const list = await readProfilesList();
  const idx = list.findIndex(p => p.id === childId);
  if (idx < 0) return null;
  const updated = { ...list[idx], ...updates, id: childId, updatedAt: new Date().toISOString() };
  list[idx] = updated;
  await writeProfilesList(list);
  return updated;
}

/** Define o perfil ativo pelo ID. */
export async function setActiveChildProfile(childId) {
  if (!childId) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_CHILD_PROFILE_ID, String(childId));
  } catch (e) {
    log('childProfileService.setActive:', e);
  }
}

/**
 * Remove um perfil da lista.
 * Não apaga dados de progresso/desenhos associados.
 * Não apaga o perfil legado @ptf_profile.
 */
export async function deleteChildProfile(childId) {
  if (!childId) return;
  const list = await readProfilesList();
  const filtered = list.filter(p => p.id !== childId);
  await writeProfilesList(filtered);
  const activeId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_CHILD_PROFILE_ID);
  if (activeId === childId && filtered.length > 0) {
    await setActiveChildProfile(filtered[0].id);
  }
}

/**
 * Garante que existe pelo menos um perfil.
 * Se a lista estiver vazia, cria um perfil padrão vazio.
 * Retorna o perfil ativo (existente ou recém-criado).
 */
export async function ensureDefaultChildProfile() {
  const list = await readProfilesList();
  if (list.length > 0) {
    return await getActiveChildProfile();
  }
  return createChildProfile({ name: '', avatarId: '🌟' });
}

/**
 * Migra o perfil legado (@ptf_profile) para a nova lista de perfis, se:
 *   1. Existir um perfil legado.
 *   2. A lista nova estiver vazia (migração ainda não ocorreu).
 *
 * Idempotente: chamar duas vezes não duplica perfis.
 * O perfil legado NÃO é removido.
 *
 * Retorna true se migrou, false se não havia nada para migrar.
 */
export async function migrateLegacyProfileIfNeeded() {
  try {
    const list = await readProfilesList();
    if (list.length > 0) return false;

    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LEGACY_PROFILE);
    if (!raw) return false;

    let legacy;
    try {
      legacy = JSON.parse(raw);
    } catch {
      return false;
    }

    if (!legacy || typeof legacy !== 'object') return false;

    const profile = makeChildProfileData({
      name: legacy.name || '',
      avatarId: legacy.avatarId || '🌟',
      isActive: true,
    });

    await writeProfilesList([profile]);
    await setActiveChildProfile(profile.id);
    log('childProfileService: perfil legado migrado para v1, id=', profile.id);
    return true;
  } catch (e) {
    log('childProfileService.migrateLegacy:', e);
    return false;
  }
}
