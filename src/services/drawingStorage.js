/**
 * Persistência local de desenhos por história + cena.
 *
 * Chave: @ptf_drawing_s{storyId}_c{sceneId}
 *
 * Formatos do VALOR armazenado:
 *   v1 — data URL cru: 'data:image/png;base64,...'                    (legado)
 *   v2 — JSON: '{"v":2,"W":..,"H":..,"imgX":..,...,"data":"data:..."}' (legado)
 *   v3 — ponteiro A5: '{"v":3,"fmt":1|2,"uri":"file://...","mime":..,
 *                        ...layout}'  → o blob grande (paint PNG) vive em arquivo
 *
 * No v3, apenas o blob grande (o PNG da camada de pintura) vai para arquivo.
 * Os campos de layout (W/H/imgX/imgY/imgW/imgH), necessários para alinhar o
 * contorno no Livrinho, continuam no ponteiro. `getSavedDrawing` reconstrói o
 * payload v1/v2 original a partir do ponteiro, de modo que TODOS os consumidores
 * (ColoringScreen, StoryBookScreen, hasMeaningfulPaint) seguem inalterados.
 *
 * A imagem base nunca é armazenada aqui — ela vem de coloringImages.js.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';
import { writeBlob, readBlobAsDataUrl, deleteBlob, safeName, isDataUrl, dataUrlMime } from './fileBlobStore';

const POINTER_VERSION = 3;
const BLOB_SUBDIR = 'drawings';

function key(storyId, sceneId) {
  return `@ptf_drawing_s${storyId}_c${sceneId}`;
}

/** Nome de arquivo determinístico derivado da própria chave (id interno). */
function fileNameForKey(storageKeyStr) {
  return `${safeName(storageKeyStr)}.png`;
}

/** true se o valor armazenado é um ponteiro v3 (blob em arquivo). */
function isDrawingPointer(value) {
  if (typeof value !== 'string' || value[0] !== '{') return false;
  try {
    const p = JSON.parse(value);
    return !!p && p.v === POINTER_VERSION && typeof p.uri === 'string';
  } catch {
    return false;
  }
}

/**
 * Constrói o ponteiro v3 a partir de um payload v1/v2, gravando o blob grande
 * em arquivo. Retorna a string do ponteiro, ou null se não foi possível mover
 * (o chamador então mantém o payload inline — sem perda).
 */
async function buildPointer(fileName, payload) {
  let fmt;
  let dataUrl;
  let layout = null;

  if (isDataUrl(payload)) {
    fmt = 1;
    dataUrl = payload;
  } else {
    let p;
    try { p = JSON.parse(payload); } catch { return null; }
    if (!p || typeof p.data !== 'string') return null;
    fmt = 2;
    dataUrl = p.data;
    layout = {
      W: p.W ?? null, H: p.H ?? null,
      imgX: p.imgX ?? null, imgY: p.imgY ?? null,
      imgW: p.imgW ?? null, imgH: p.imgH ?? null,
    };
  }

  const mime = dataUrlMime(dataUrl, 'image/png');
  const written = await writeBlob(BLOB_SUBDIR, fileName, dataUrl, mime);
  if (!written) return null;

  const ptr = { v: POINTER_VERSION, fmt, uri: written.uri, mime };
  if (layout) Object.assign(ptr, layout);
  return JSON.stringify(ptr);
}

/** Reconstrói o payload original (v1 data URL ou v2 JSON) a partir do ponteiro v3. */
async function resolvePointer(value) {
  let p;
  try { p = JSON.parse(value); } catch { return null; }
  const dataUrl = await readBlobAsDataUrl(p.uri, p.mime || 'image/png');
  if (!dataUrl) return null;
  if (p.fmt === 2) {
    return JSON.stringify({
      v: 2, W: p.W ?? null, H: p.H ?? null,
      imgX: p.imgX ?? null, imgY: p.imgY ?? null,
      imgW: p.imgW ?? null, imgH: p.imgH ?? null,
      data: dataUrl,
    });
  }
  return dataUrl; // fmt 1
}

/**
 * Retorna o payload do desenho salvo (mesmo contrato de sempre: string v1/v2),
 * ou null. Ponteiros v3 são resolvidos lendo o arquivo de volta — os
 * consumidores não percebem diferença. Formatos antigos (v1/v2) são retornados
 * direto (fallback de leitura).
 */
export async function getSavedDrawing(storyId, sceneId) {
  try {
    const raw = await AsyncStorage.getItem(key(storyId, sceneId));
    if (!raw) return null;
    if (isDrawingPointer(raw)) {
      return await resolvePointer(raw); // pode ser null se o arquivo sumiu
    }
    return raw; // formato antigo — fallback direto
  } catch {
    return null;
  }
}

/**
 * Salva o payload da camada de pintura. Se houver tinta real (blob grande), o
 * PNG vai para arquivo e o AsyncStorage guarda só o ponteiro. Canvas em branco
 * (payload pequeno) fica inline — não vale a pena criar arquivo.
 * Se a gravação em arquivo falhar, o payload é mantido inline (sem perda).
 */
export async function saveDrawingState(storyId, sceneId, base64DataUrl) {
  try {
    const k = key(storyId, sceneId);
    let toStore = base64DataUrl;

    if (hasMeaningfulPaint(base64DataUrl)) {
      const ptr = await buildPointer(fileNameForKey(k), base64DataUrl);
      if (ptr) toStore = ptr; // senão mantém inline
    }

    await AsyncStorage.setItem(k, toStore);
  } catch (e) {
    log('drawingStorage.save:', e);
  }
}

/** Remove o desenho salvo de uma cena específica (metadado + arquivo local). */
export async function clearDrawingState(storyId, sceneId) {
  try {
    const k = key(storyId, sceneId);
    const raw = await AsyncStorage.getItem(k);
    if (raw && isDrawingPointer(raw)) {
      try {
        const p = JSON.parse(raw);
        if (p?.uri) await deleteBlob(p.uri);
      } catch { /* ignora — segue removendo o metadado */ }
    }
    await AsyncStorage.removeItem(k);
  } catch (e) {
    log('drawingStorage.clear:', e);
  }
}

/**
 * Retorna true se a cena tem um desenho CONCLUÍDO de verdade.
 *
 * Modelo rascunho × concluído: não existe rascunho persistido — a pintura em
 * andamento vive só na memória do canvas. A chave `@ptf_drawing_*` só é escrita
 * quando a criança toca em "Pronto" (saveDrawingState), e apenas com tinta real.
 * Portanto "concluído" = chave existente COM tinta real. Aqui exigimos
 * hasMeaningfulPaint para nunca marcar "Você já coloriu" por uma chave vazia ou
 * residual. Após reset de jornada (clearAllSavedDrawings) a chave some → false.
 */
export async function hasSavedDrawing(storyId, sceneId) {
  try {
    const v = await AsyncStorage.getItem(key(storyId, sceneId));
    if (v === null) return false;
    return hasMeaningfulPaint(v);
  } catch {
    return false;
  }
}

/**
 * Retorna true se o payload salvo contém tinta real.
 *
 * Um PNG transparente (canvas sem nenhum fill aplicado) comprime para menos de
 * ~600 chars em base64. Qualquer fill real de cor produz significativamente mais
 * dados. Threshold de 1000 chars está bem acima de qualquer canvas em branco e
 * bem abaixo de qualquer canvas com ao menos um fill visível.
 *
 * Suporta v1 (data URL raw), v2 (JSON com campo "data") e v3 (ponteiro de
 * arquivo — só existe quando havia tinta real, então é sempre significativo).
 */
export function hasMeaningfulPaint(payload) {
  if (!payload || typeof payload !== 'string') return false;
  if (payload.startsWith('data:image/png;base64,')) {
    return payload.length > 1000;
  }
  try {
    const p = JSON.parse(payload);
    if (p?.v === POINTER_VERSION && typeof p?.uri === 'string') return true;
    return typeof p?.data === 'string' && p.data.length > 1000;
  } catch { return false; }
}

/**
 * Migração A5: move blobs base64 de desenhos antigos (v1/v2) para arquivos.
 *
 * - Só migra desenhos com tinta real (hasMeaningfulPaint); em branco fica inline.
 * - Idempotente: pula valores que já são ponteiros v3.
 * - Nome de arquivo derivado da chave (determinístico) → re-rodar sobrescreve o
 *   mesmo arquivo, sem duplicar.
 * - writeBlob confirma a escrita antes de o valor ser trocado pelo ponteiro.
 * - Falha em um item não aborta os demais.
 *
 * Retorna a quantidade de desenhos migrados.
 */
export async function migrateDrawingsToFiles() {
  let count = 0;
  let keys;
  try {
    keys = await AsyncStorage.getAllKeys();
  } catch {
    return 0;
  }
  const drawingKeys = (keys || []).filter(k => k.startsWith('@ptf_drawing_'));

  for (const k of drawingKeys) {
    try {
      const raw = await AsyncStorage.getItem(k);
      if (!raw || isDrawingPointer(raw)) continue; // já migrado
      if (!hasMeaningfulPaint(raw)) continue;       // em branco/pequeno: fica inline
      const ptr = await buildPointer(fileNameForKey(k), raw);
      if (ptr) {
        await AsyncStorage.setItem(k, ptr);
        count++;
      }
    } catch (e) {
      log('drawingStorage.migrateDrawingsToFiles.item:', e);
    }
  }
  return count;
}

/** Remove todos os desenhos salvos (DEV helper — limpar estado de teste). */
export async function clearAllSavedDrawings() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const drawingKeys = keys.filter(k => k.startsWith('@ptf_drawing_'));
    // Apaga também os arquivos apontados pelos ponteiros v3.
    for (const k of drawingKeys) {
      try {
        const raw = await AsyncStorage.getItem(k);
        if (raw && isDrawingPointer(raw)) {
          const p = JSON.parse(raw);
          if (p?.uri) await deleteBlob(p.uri);
        }
      } catch { /* ignora item */ }
    }
    if (drawingKeys.length > 0) await AsyncStorage.multiRemove(drawingKeys);
    return drawingKeys.length;
  } catch (e) {
    log('drawingStorage.clearAll:', e);
    return 0;
  }
}
