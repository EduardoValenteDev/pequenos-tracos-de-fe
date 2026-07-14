/**
 * monteACenaGallery.js — "Meus Quadros" (M1R3). Persistência POR PERFIL (AsyncStorage), versionada.
 * Guarda apenas dados estáveis (puzzleSceneId, storyId, sceneNumber, data, dificuldades concluídas) —
 * NUNCA referências de componentes nem caminhos frágeis. Plano Família salva permanentemente; o
 * plano grátis contempla na sessão mas NÃO persiste (gate gentil na UI).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@ptf_monte_a_cena_gallery_v1:';
const SCHEMA_VERSION = 1;

function keyFor(profileId) {
  return `${KEY_PREFIX}${profileId || 'default'}`;
}
function emptyGallery(profileId) {
  return { version: SCHEMA_VERSION, profileId: profileId || 'default', completedScenes: {} };
}

/** Lê a galeria do perfil (null-safe; migra formato antigo/ausente para o vazio). */
export async function loadGallery(profileId) {
  try {
    const raw = await AsyncStorage.getItem(keyFor(profileId));
    if (!raw) return emptyGallery(profileId);
    const data = JSON.parse(raw);
    if (!data || data.version !== SCHEMA_VERSION || typeof data.completedScenes !== 'object') {
      return emptyGallery(profileId);
    }
    return { ...emptyGallery(profileId), ...data, completedScenes: data.completedScenes || {} };
  } catch {
    return emptyGallery(profileId);
  }
}

/**
 * Registra a conclusão de uma cena (Plano Família). Acumula as dificuldades concluídas por cena.
 * `completedAt` é passado pelo chamador (o app evita Date.now em módulos puros; aqui é serviço de I/O).
 */
export async function saveCompletion(profileId, { puzzleSceneId, storyId, sceneNumber, pieceCount, completedAt }) {
  if (!puzzleSceneId) return null;
  try {
    const g = await loadGallery(profileId);
    const prev = g.completedScenes[puzzleSceneId] || { storyId, sceneNumber, completedPieceCounts: [] };
    const counts = new Set(prev.completedPieceCounts || []);
    if (pieceCount) counts.add(pieceCount);
    // M1R8B: SOMENTE metadados leves (ids + contagens + data). NUNCA imagem/thumbnail/base64/SVG/path/
    // coordenadas — a imagem é reutilizada do catálogo por puzzleSceneId. `lastPieceCount` = última
    // dificuldade concluída (uma cena aparece UMA vez, independente de 4/6/9).
    g.completedScenes[puzzleSceneId] = {
      storyId: storyId || prev.storyId,
      sceneNumber: sceneNumber != null ? sceneNumber : prev.sceneNumber,
      completedAt: completedAt || prev.completedAt || null,
      completedPieceCounts: Array.from(counts).sort((a, b) => a - b),
      lastPieceCount: pieceCount || prev.lastPieceCount || null,
    };
    await AsyncStorage.setItem(keyFor(profileId), JSON.stringify(g));
    return g;
  } catch {
    return null;
  }
}

export async function getCompletedList(profileId) {
  const g = await loadGallery(profileId);
  return Object.entries(g.completedScenes).map(([puzzleSceneId, v]) => ({ puzzleSceneId, ...v }));
}

export async function clearGallery(profileId) {
  try { await AsyncStorage.removeItem(keyFor(profileId)); } catch { /* melhor esforço */ }
}
