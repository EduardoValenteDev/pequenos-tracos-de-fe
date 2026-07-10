import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';
import { writeBlob, deleteBlob, safeName, recomposeBlobUri, currentBlobsRoot } from './fileBlobStore';

/**
 * Bloco 1.1 — decisão oficial do Eduardo: o plano GRATUITO **não salva artes** (0).
 * Espelha `FREE_ATELIER_SAVE_LIMIT` de `accessControl.js`; os dois devem andar juntos.
 */
export const ATELIER_FREE_SAVE_LIMIT = 0;

// ⚠️ Chave LEGADA (sem prefixo `@`). NÃO renomear: apagaria a galeria de quem já usa o app.
const LIST_KEY = 'ptf_atelier_arts_v1_index';
const BLOB_SUBDIR = 'atelier';

function artKey(id) {
  return `ptf_atelier_arts_v1_${id}`;
}

function generateId() {
  return `art_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

function previewFileName(id) {
  return `${safeName(id)}_preview.jpg`;
}

function thumbFileName(id) {
  return `${safeName(id)}_thumb.jpg`;
}

/**
 * Resolve a URI exibível do preview (full-res) de uma arte.
 * Aceita formato novo (previewUri = file://) e antigo (previewBase64 = data URL).
 */
export function resolveArtPreviewUri(full) {
  if (!full) return null;
  // Boundary B: recompõe file:// absoluto de blob p/ o documentDirectory atual (eager,
  // síncrono, idempotente). No-op p/ data URL (previewBase64) e file:// fora de ptf_blobs.
  return recomposeBlobUri(full.previewUri || full.previewBase64 || null, currentBlobsRoot());
}

/**
 * Resolve a URI exibível do thumbnail de uma meta de arte.
 * Aceita formato novo (thumbnailUri = file://) e antigo (thumbnailBase64).
 */
export function resolveArtThumbUri(meta) {
  if (!meta) return null;
  return recomposeBlobUri(meta.thumbnailUri || meta.thumbnailBase64 || null, currentBlobsRoot());
}

/** Returns array of art metadata objects (id, title, createdAt, thumbnailUri|thumbnailBase64). */
export async function listArts() {
  try {
    const raw = await AsyncStorage.getItem(LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Returns the full art object (including stateJson/previewUri) or null. */
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
 *
 * Blobs grandes (preview full-res + thumbnail) são gravados em arquivos locais
 * e o AsyncStorage guarda apenas ponteiros (previewUri/thumbnailUri) + stateJson
 * (strokes, leve). Se a escrita em arquivo falhar, o base64 é mantido inline
 * (formato antigo) para não perder a arte.
 *
 * Returns the saved art's id.
 */
export async function saveArt({ artId, title, mission, stateJson, thumbnailBase64, previewBase64 }) {
  const id = artId || generateId();
  const now = new Date().toISOString();

  // Move blobs grandes para arquivos. Caminhos determinísticos por id →
  // re-salvar a mesma arte sobrescreve o mesmo arquivo (sem órfãos).
  let previewUri = null;
  let thumbnailUri = null;
  try {
    const pv = await writeBlob(BLOB_SUBDIR, previewFileName(id), previewBase64, 'image/jpeg');
    if (pv) previewUri = pv.uri;
    const th = await writeBlob(BLOB_SUBDIR, thumbFileName(id), thumbnailBase64, 'image/jpeg');
    if (th) thumbnailUri = th.uri;
  } catch (e) {
    log('atelierStorage.saveArt.writeBlob:', e);
  }

  const fullArt = {
    id,
    title: title || 'Minha arte especial',
    mission: mission || null,
    createdAt: now,
    updatedAt: now,
    schema: 2,
    stateJson,
    previewUri,
    // Fallback inline só quando a gravação em arquivo falhou:
    previewBase64: previewUri ? null : (previewBase64 || null),
  };

  const meta = {
    id,
    title: fullArt.title,
    createdAt: now,
    updatedAt: now,
    schema: 2,
    thumbnailUri,
    thumbnailBase64: thumbnailUri ? null : (thumbnailBase64 || null),
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

/** Deletes an art by id (metadata + arquivos locais de preview/thumb). */
export async function deleteArt(id) {
  try {
    // Apaga os blobs locais ANTES de remover o metadado (evita arquivos órfãos).
    const full = await getArt(id);
    if (full?.previewUri) await deleteBlob(full.previewUri);
    const list = await listArts();
    const meta = list.find(a => a.id === id);
    if (meta?.thumbnailUri) await deleteBlob(meta.thumbnailUri);

    await AsyncStorage.removeItem(artKey(id));
    const filtered = list.filter(a => a.id !== id);
    await AsyncStorage.setItem(LIST_KEY, JSON.stringify(filtered));
  } catch (e) {
    log('atelierStorage.deleteArt:', e);
  }
}

/**
 * Migração A5: move blobs base64 de artes antigas para arquivos locais.
 *
 * - Idempotente: pula artes que já têm previewUri/thumbnailUri.
 * - Não apaga o base64 antigo antes de confirmar a escrita do arquivo
 *   (writeBlob só retorna uri após getInfoAsync confirmar o arquivo).
 * - Falha em um item não aborta os demais (try/catch por arte).
 *
 * Retorna a quantidade de blobs migrados.
 */
export async function migrateArtsToFiles() {
  let count = 0;
  let indexChanged = false;
  const list = await listArts();

  for (const meta of list) {
    if (!meta || !meta.id) continue;
    try {
      // Thumbnail no índice
      if (meta.thumbnailBase64 && !meta.thumbnailUri) {
        const w = await writeBlob(BLOB_SUBDIR, thumbFileName(meta.id), meta.thumbnailBase64, 'image/jpeg');
        if (w) {
          meta.thumbnailUri = w.uri;
          meta.thumbnailBase64 = null;
          meta.schema = 2;
          indexChanged = true;
          count++;
        }
      }
      // Preview full-res no registro completo
      const full = await getArt(meta.id);
      if (full && full.previewBase64 && !full.previewUri) {
        const w = await writeBlob(BLOB_SUBDIR, previewFileName(meta.id), full.previewBase64, 'image/jpeg');
        if (w) {
          full.previewUri = w.uri;
          full.previewBase64 = null;
          full.schema = 2;
          await AsyncStorage.setItem(artKey(meta.id), JSON.stringify(full));
          count++;
        }
      }
    } catch (e) {
      log('atelierStorage.migrateArtsToFiles.item:', e);
      // continua nas próximas artes — um item ruim não quebra a Galeria
    }
  }

  if (indexChanged) {
    await AsyncStorage.setItem(LIST_KEY, JSON.stringify(list));
  }
  return count;
}
