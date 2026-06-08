/**
 * shareCardService.js — Cards compartilháveis seguros.
 *
 * Registra intenções de compartilhamento sem dados sensíveis.
 * Usa apenas: nome/apelido da criança, história, desenho e conquista.
 * Sem foto da criança. Sem dados de localização. Sem identificadores únicos expostos.
 * Compartilhamento real (WhatsApp, etc.) fica para sprint futuro.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, storageKey } from './storageKeys';
import { createShareCardRecord as makeShareCardData } from '../data/appDataModel';
import { log } from '../utils/logger';

// ── Índice ────────────────────────────────────────────────────────────────────

async function readIndex() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SHARE_CARDS_INDEX);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(index) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SHARE_CARDS_INDEX, JSON.stringify(index));
  } catch (e) {
    log('shareCardService.writeIndex:', e);
  }
}

// ── API pública ──────────────────────────────────────────────────────────────

/**
 * Cria e persiste um registro de card compartilhável.
 * Sempre marca safeForSharing: true (sem dados sensíveis).
 * Retorna o card criado.
 */
export async function createShareCardRecord({ childId, storyId, drawingKey, achievementId } = {}) {
  const card = makeShareCardData({ childId, storyId, drawingKey, achievementId });
  await _persist(card);
  return card;
}

/** Retorna todos os cards de uma criança. */
export async function listShareCardsByChild(childId) {
  if (!childId) return [];
  const index = await readIndex();
  return index.filter(c => c.childId === childId);
}

/** Retorna um card pelo ID, ou null se não encontrado. */
export async function getShareCardRecord(cardId) {
  if (!cardId) return null;
  try {
    const raw = await AsyncStorage.getItem(storageKey.shareCard(cardId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Remove um card pelo ID. */
export async function deleteShareCardRecord(cardId) {
  if (!cardId) return;
  try {
    await AsyncStorage.removeItem(storageKey.shareCard(cardId));
    const index = await readIndex();
    await writeIndex(index.filter(c => c.id !== cardId));
  } catch (e) {
    log('shareCardService.delete:', e);
  }
}

/**
 * Monta um payload seguro para compartilhamento.
 * Contém apenas dados não sensíveis: storyId, drawingKey, achievementId.
 * safeForSharing: true indica que pode ser mostrado/compartilhado.
 *
 * Não abre WhatsApp nem Instagram — essa lógica fica para sprint futuro.
 */
export async function buildSafeShareCardPayload(cardId) {
  const card = await getShareCardRecord(cardId);
  if (!card) return null;

  return {
    id: card.id,
    storyId: card.storyId || null,
    drawingKey: card.drawingKey || null,
    achievementId: card.achievementId || null,
    shareType: card.shareType,
    safeForSharing: true,
    createdAt: card.createdAt,
  };
}

// ── Interno ───────────────────────────────────────────────────────────────────

async function _persist(card) {
  try {
    await AsyncStorage.setItem(storageKey.shareCard(card.id), JSON.stringify(card));
    const index = await readIndex();
    index.unshift({ id: card.id, childId: card.childId, storyId: card.storyId, shareType: card.shareType, createdAt: card.createdAt });
    await writeIndex(index);
  } catch (e) {
    log('shareCardService.persist:', e);
  }
}
