/**
 * churchModeService.js — Modo Igreja local (base para sprint futuro).
 *
 * Permite que um líder de turma/grupo gerencie crianças e histórias semanais
 * diretamente no dispositivo. Totalmente local — sem backend, sem ranking
 * individual público, sem comunicação em rede.
 *
 * inviteCode gerado localmente para uso manual (colar em outro dispositivo).
 * Resumo de progresso usa dados locais existentes do app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { createChurchGroup as makeChurchGroupData } from '../data/appDataModel';
import { log } from '../utils/logger';

// ── Leitura/escrita da lista de grupos ───────────────────────────────────────

async function readGroups() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CHURCH_GROUPS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeGroups(groups) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CHURCH_GROUPS, JSON.stringify(groups));
  } catch (e) {
    log('churchModeService.writeGroups:', e);
  }
}

// ── API pública ──────────────────────────────────────────────────────────────

/** Retorna todos os grupos cadastrados. */
export async function getChurchGroups() {
  return readGroups();
}

/**
 * Cria um novo grupo.
 * Retorna o grupo criado com inviteCode gerado localmente.
 */
export async function createChurchGroup({ name, leaderName, churchName } = {}) {
  const group = makeChurchGroupData({ name, leaderName, churchName });
  const groups = await readGroups();
  groups.push(group);
  await writeGroups(groups);
  return group;
}

/**
 * Atualiza campos de um grupo existente.
 * Retorna o grupo atualizado, ou null se não encontrado.
 */
export async function updateChurchGroup(groupId, updates = {}) {
  if (!groupId) return null;
  const groups = await readGroups();
  const idx = groups.findIndex(g => g.id === groupId);
  if (idx < 0) return null;
  const updated = { ...groups[idx], ...updates, id: groupId, updatedAt: new Date().toISOString() };
  groups[idx] = updated;
  await writeGroups(groups);
  return updated;
}

/** Remove um grupo pelo ID. */
export async function deleteChurchGroup(groupId) {
  if (!groupId) return;
  const groups = await readGroups();
  await writeGroups(groups.filter(g => g.id !== groupId));
}

/**
 * Busca um grupo pelo inviteCode.
 * Retorna o grupo ou null se não encontrado.
 */
export async function getChurchGroupByInviteCode(inviteCode) {
  if (!inviteCode) return null;
  const groups = await readGroups();
  return groups.find(g => g.inviteCode === String(inviteCode).toUpperCase()) || null;
}

/**
 * Define a história semanal de um grupo.
 * Retorna o grupo atualizado, ou null se não encontrado.
 */
export async function setWeeklyStory(groupId, storyId) {
  return updateChurchGroup(groupId, { weeklyStoryId: storyId || null });
}

/**
 * Retorna um resumo de progresso do grupo com base em dados locais.
 * Se não houver crianças vinculadas, retorna estado vazio seguro.
 * O resumo real por criança depende de sprint futuro de multi-perfil.
 */
export async function getChurchProgressSummary(groupId) {
  if (!groupId) return _emptySummary();
  const groups = await readGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group) return _emptySummary();

  return {
    groupId,
    groupName: group.name,
    weeklyStoryId: group.weeklyStoryId || null,
    totalChildren: (group.childrenIds || []).length,
    childrenIds: group.childrenIds || [],
    progressByChild: {},
  };
}

function _emptySummary() {
  return {
    groupId: null,
    groupName: '',
    weeklyStoryId: null,
    totalChildren: 0,
    childrenIds: [],
    progressByChild: {},
  };
}
