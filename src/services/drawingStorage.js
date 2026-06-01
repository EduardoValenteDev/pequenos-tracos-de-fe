/**
 * Persistência local de desenhos por história + cena.
 *
 * Chave: @ptf_drawing_s{storyId}_c{sceneId}
 * Valor: string PNG em base64 ("data:image/png;base64,...")
 *
 * O estado salvo representa apenas a camada de pintura (paint layer).
 * A imagem base nunca é armazenada aqui — ela vem de coloringImages.js.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';

function key(storyId, sceneId) {
  return `@ptf_drawing_s${storyId}_c${sceneId}`;
}

/** Retorna a base64 do desenho salvo, ou null se não existir. */
export async function getSavedDrawing(storyId, sceneId) {
  try {
    return await AsyncStorage.getItem(key(storyId, sceneId));
  } catch {
    return null;
  }
}

/** Salva a base64 PNG da camada de pintura. */
export async function saveDrawingState(storyId, sceneId, base64DataUrl) {
  try {
    await AsyncStorage.setItem(key(storyId, sceneId), base64DataUrl);
  } catch (e) {
    log('drawingStorage.save:', e);
  }
}

/** Remove o desenho salvo de uma cena específica. */
export async function clearDrawingState(storyId, sceneId) {
  try {
    await AsyncStorage.removeItem(key(storyId, sceneId));
  } catch (e) {
    log('drawingStorage.clear:', e);
  }
}

/** Retorna true se existe um desenho salvo para essa cena. */
export async function hasSavedDrawing(storyId, sceneId) {
  try {
    const v = await AsyncStorage.getItem(key(storyId, sceneId));
    return v !== null;
  } catch {
    return false;
  }
}

/** Remove todos os desenhos salvos (DEV helper — limpar estado de teste). */
export async function clearAllSavedDrawings() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const drawingKeys = keys.filter(k => k.startsWith('@ptf_drawing_'));
    if (drawingKeys.length > 0) await AsyncStorage.multiRemove(drawingKeys);
    return drawingKeys.length;
  } catch (e) {
    log('drawingStorage.clearAll:', e);
    return 0;
  }
}
