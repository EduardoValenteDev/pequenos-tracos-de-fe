import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';

export const ATELIER_FREE_SAVE_LIMIT = 3;

const LIST_KEY = 'ptf_atelier_arts_v1_index';

function artKey(id) {
  return `ptf_atelier_arts_v1_${id}`;
}

function generateId() {
  return `art_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

/** Returns array of art metadata objects (id, title, createdAt, thumbnailBase64). */
export async function listArts() {
  try {
    const raw = await AsyncStorage.getItem(LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Returns the full art object (including ops/state) or null. */
export async function getArt(id) {
  try {
    const raw = await AsyncStorage.getItem(artKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Count of saved arts. */
export async function getArtCount() {
  const list = await listArts();
  return list.length;
}

/**
 * Saves a new art or overwrites an existing one (if artId provided).
 * artData: { title, mission, stateJson, thumbnailBase64, previewBase64 }
 * Returns the saved art's id.
 */
export async function saveArt({ artId, title, mission, stateJson, thumbnailBase64, previewBase64 }) {
  const id = artId || generateId();
  const now = new Date().toISOString();

  const fullArt = {
    id,
    title: title || 'Minha arte especial',
    mission: mission || null,
    createdAt: now,
    updatedAt: now,
    stateJson,
    previewBase64: previewBase64 || null,
  };

  const meta = {
    id,
    title: fullArt.title,
    createdAt: now,
    updatedAt: now,
    thumbnailBase64: thumbnailBase64 || null,
  };

  // Save full art
  await AsyncStorage.setItem(artKey(id), JSON.stringify(fullArt));

  // Update index
  const list = await listArts();
  const existingIdx = list.findIndex(a => a.id === id);
  if (existingIdx >= 0) {
    list[existingIdx] = meta;
  } else {
    list.unshift(meta); // newest first
  }
  await AsyncStorage.setItem(LIST_KEY, JSON.stringify(list));

  return id;
}

/** Deletes an art by id. */
export async function deleteArt(id) {
  try {
    await AsyncStorage.removeItem(artKey(id));
    const list = await listArts();
    const filtered = list.filter(a => a.id !== id);
    await AsyncStorage.setItem(LIST_KEY, JSON.stringify(filtered));
  } catch (e) {
    log('atelierStorage.deleteArt:', e);
  }
}
