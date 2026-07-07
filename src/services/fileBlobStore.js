/**
 * fileBlobStore.js — Armazenamento local de blobs grandes em arquivos.
 *
 * Tira os blobs grandes (full-res de artes e pinturas, em base64) do
 * AsyncStorage e os grava como arquivos reais no diretório de documentos do
 * app, via expo-file-system. O AsyncStorage passa a guardar apenas ponteiros
 * (file:// URIs) + metadados leves — reduzindo risco de lentidão, travamento e
 * estouro de limite de linha do SQLite em Android fraco.
 *
 * Entrypoint legacy de propósito: `writeAsStringAsync`/`readAsStringAsync` com
 * `EncodingType.Base64` é o caminho mais estável para gravar/ler base64 no
 * SDK 54 (a API nova exigiria conversão manual atob → Uint8Array).
 *
 * Degradação segura: se o FileSystem não estiver disponível ou a escrita
 * falhar, as funções retornam null e o chamador mantém o blob inline (formato
 * antigo). Nada é perdido.
 *
 * Nomes de arquivo derivam SEMPRE de IDs internos (sanitizados via safeName),
 * NUNCA de nome da criança, título da arte ou texto livre.
 *
 * NOTA: a confirmação final do FileSystem em produção fica para a Sprint C
 * (Development Build). No Expo Go / Node validamos estrutura e comportamento.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { log } from '../utils/logger';

const ROOT_DIRNAME = 'ptf_blobs';

/** Base do diretório controlado de blobs (ou null se o FS estiver indisponível). */
function blobsRoot() {
  const doc = FileSystem.documentDirectory;
  if (!doc) return null;
  return doc + ROOT_DIRNAME + '/';
}

/** Raiz ATUAL dos blobs (documentDirectory + 'ptf_blobs/'), ou null. Wrapper fino de blobsRoot(). */
export function currentBlobsRoot() {
  return blobsRoot();
}

// ── Helpers puros (sem dependência nativa — testáveis isoladamente) ────────────

/** true se a string é um data URL base64 ('data:...;base64,...'). */
export function isDataUrl(str) {
  return typeof str === 'string' && str.startsWith('data:');
}

/** true se a string é um ponteiro de arquivo local (file://...). */
export function isFileUri(str) {
  return typeof str === 'string' && str.startsWith('file:');
}

/** Extrai o mime de um data URL ('data:image/png;base64,...') → 'image/png'. */
export function dataUrlMime(dataUrl, fallback = 'image/png') {
  if (!isDataUrl(dataUrl)) return fallback;
  const m = /^data:([^;,]+)[;,]/.exec(dataUrl);
  return (m && m[1]) || fallback;
}

/** Remove o prefixo 'data:...;base64,' deixando só o base64 cru. */
export function stripDataUrlPrefix(dataUrl) {
  if (typeof dataUrl !== 'string') return '';
  const i = dataUrl.indexOf('base64,');
  return i >= 0 ? dataUrl.slice(i + 'base64,'.length) : dataUrl;
}

/** Monta um data URL a partir de base64 cru + mime. */
export function toDataUrl(base64, mime = 'image/png') {
  return 'data:' + mime + ';base64,' + base64;
}

/** Sanitiza um id para nome de arquivo seguro (somente [A-Za-z0-9_-]). */
export function safeName(id) {
  return String(id == null ? '' : id).replace(/[^A-Za-z0-9_-]/g, '_');
}

/**
 * Recompõe uma URI de blob file:// ABSOLUTA (que embute um documentDirectory antigo,
 * ex.: container iOS após restore) para a raiz de blobs ATUAL. PURO e param-based —
 * sem I/O, sem escrita, sem getInfoAsync. Não muda o formato do ponteiro v3.
 *   - não-string → inalterado
 *   - data URL   → inalterado
 *   - file:// FORA de 'ptf_blobs/' → inalterado
 *   - file:// dentro de 'ptf_blobs/' → currentBlobsRoot + (sufixo após 'ptf_blobs/')
 *   - currentBlobsRoot ausente → inalterado
 * Idempotente: recompor o já-atual devolve o mesmo valor (no-op quando o container não mudou).
 */
export function recomposeBlobUri(oldUri, currentBlobsRoot) {
  if (typeof oldUri !== 'string') return oldUri;
  if (oldUri.startsWith('data:')) return oldUri;
  const marker = ROOT_DIRNAME + '/';
  const i = oldUri.indexOf(marker);
  if (i < 0) return oldUri;
  if (!currentBlobsRoot) return oldUri;
  return currentBlobsRoot + oldUri.slice(i + marker.length);
}

// ── Operações de FileSystem (async, nativas) ───────────────────────────────────

const _dirEnsured = {};

async function ensureDir(subdir) {
  const root = blobsRoot();
  if (!root) return null;
  const dir = root + subdir + '/';
  if (_dirEnsured[dir]) return dir;
  try {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    _dirEnsured[dir] = true;
    return dir;
  } catch (e) {
    log('fileBlobStore.ensureDir:', e);
    return null;
  }
}

/**
 * Grava um data URL (ou base64 cru) em arquivo dentro de `subdir/filename`.
 * Retorna { uri, mime } em caso de sucesso, ou null em falha (o chamador então
 * mantém o blob inline, sem perda).
 *
 * Confirma a existência do arquivo ANTES de retornar — assim o chamador só
 * descarta o base64 antigo depois que a escrita está garantida.
 * Idempotente: regrava o mesmo caminho determinístico (sem duplicar arquivo).
 */
export async function writeBlob(subdir, filename, dataUrlOrBase64, mimeHint) {
  if (!dataUrlOrBase64 || typeof dataUrlOrBase64 !== 'string') return null;
  const dir = await ensureDir(subdir);
  if (!dir) return null;
  const mime = mimeHint || dataUrlMime(dataUrlOrBase64, 'image/png');
  const base64 = isDataUrl(dataUrlOrBase64)
    ? stripDataUrlPrefix(dataUrlOrBase64)
    : dataUrlOrBase64;
  if (!base64) return null;
  const uri = dir + filename;
  try {
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return null;
    return { uri, mime };
  } catch (e) {
    log('fileBlobStore.writeBlob:', e);
    return null;
  }
}

/** Lê um arquivo de blob de volta como data URL. Retorna null em falha. */
export async function readBlobAsDataUrl(uri, mime = 'image/png') {
  if (!isFileUri(uri)) return null;
  try {
    // Boundary A: tenta o URI ANTIGO primeiro; se o arquivo não existe (ex.: o
    // container iOS mudou de UUID após restore/update), recompõe pelo
    // documentDirectory ATUAL e tenta de novo. Só LÊ — nunca grava/apaga/migra.
    let target = uri;
    let info = await FileSystem.getInfoAsync(target);
    if (!info || !info.exists) {
      const recomposed = recomposeBlobUri(uri, currentBlobsRoot());
      if (recomposed === uri) return null;
      info = await FileSystem.getInfoAsync(recomposed);
      if (!info || !info.exists) return null;
      target = recomposed;
    }
    const base64 = await FileSystem.readAsStringAsync(target, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return toDataUrl(base64, mime);
  } catch (e) {
    log('fileBlobStore.readBlobAsDataUrl:', e);
    return null;
  }
}

/** Apaga um arquivo de blob. Silencioso se não existir (idempotente). */
export async function deleteBlob(uri) {
  if (!isFileUri(uri)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (e) {
    log('fileBlobStore.deleteBlob:', e);
  }
}
