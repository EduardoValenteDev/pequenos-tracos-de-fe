/**
 * packStorageService.js — Índice LOCAL de packs premium (Fase 2, F2.1a — fundação).
 *
 * Guarda o ESTADO de cada pack (CacheEntry) no AsyncStorage (`@ptf_packs_v1`) e
 * resolve os CAMINHOS locais persistentes (documentDirectory). É a base do runtime
 * híbrido — ainda NÃO consumido por telas.
 *
 * NESTE BLOCO (F2.1a): NÃO baixa nada, NÃO move/apaga arquivos reais, NÃO depende de
 * R2. Só índice (AsyncStorage) + construção de caminho (string). Erros → retorno
 * seguro (nunca lança).
 *
 * ── CacheEntry (por storyId) ──
 *   { storyId, version, status, localDir, manifestPath, totalBytes,
 *     downloadedBytes, updatedAt, errorMessage? }
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { STORAGE_KEYS } from './storageKeys';
import { warn } from '../utils/logger';

/** Estados oficiais de um pack (data-model spec 001 + doc mestre §7). */
export const PACK_STATUS = Object.freeze({
  INCLUDED: 'included',                 // no binário (starter) — não é pack baixável
  NOT_DOWNLOADED: 'not_downloaded',
  DOWNLOADING: 'downloading',
  VERIFYING: 'verifying',
  READY: 'ready',
  FAILED: 'failed',
  NEEDS_UPDATE: 'needs_update',
  REQUIRES_APP_UPDATE: 'requires_app_update',
});

const PACK_STATUS_VALUES = new Set(Object.values(PACK_STATUS));

/** True se o status é um dos estados oficiais. */
export function isValidPackStatus(status) {
  return PACK_STATUS_VALUES.has(status);
}

const PACKS_DIRNAME = 'packs';
const TMP_DIRNAME = '.tmp';

/**
 * Diretório PERSISTENTE de um pack instalado: documentDirectory/packs/<id>@<version>/
 * Só constrói a string (não cria pasta). null se FS/args indisponíveis.
 */
export function getPackLocalDir(storyId, version) {
  const doc = FileSystem.documentDirectory;
  if (!doc || !storyId || !version) return null;
  return `${doc}${PACKS_DIRNAME}/${storyId}@${version}/`;
}

/**
 * Diretório TEMPORÁRIO de download (nunca persistente):
 * documentDirectory/packs/.tmp/<id>@<version>/
 */
export function getPackTempDir(storyId, version) {
  const doc = FileSystem.documentDirectory;
  if (!doc || !storyId || !version) return null;
  return `${doc}${PACKS_DIRNAME}/${TMP_DIRNAME}/${storyId}@${version}/`;
}

/** Lê o índice completo (mapa storyId→CacheEntry). Vazio/erro → {} (nunca lança). */
export async function getPackIndex() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PACKS_INDEX);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    warn('packStorageService.getPackIndex:', e);
    return {};
  }
}

/** Grava o índice completo. Retorna true/false (nunca lança). */
export async function savePackIndex(index) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PACKS_INDEX, JSON.stringify(index || {}));
    return true;
  } catch (e) {
    warn('packStorageService.savePackIndex:', e);
    return false;
  }
}

/** CacheEntry de uma história (ou null se não houver). */
export async function getPackEntry(storyId) {
  if (!storyId) return null;
  const index = await getPackIndex();
  return index[storyId] || null;
}

/** Normaliza/mescla e grava um CacheEntry. Retorna a entry salva (ou null em erro). */
export async function setPackEntry(storyId, entry) {
  if (!storyId || !entry || typeof entry !== 'object') return null;
  try {
    const index = await getPackIndex();
    const prev = index[storyId] || {};
    const merged = {
      storyId,
      version: entry.version ?? prev.version ?? null,
      status: isValidPackStatus(entry.status) ? entry.status : (prev.status ?? PACK_STATUS.NOT_DOWNLOADED),
      localDir: entry.localDir ?? prev.localDir ?? null,
      manifestPath: entry.manifestPath ?? prev.manifestPath ?? null,
      totalBytes: entry.totalBytes ?? prev.totalBytes ?? 0,
      downloadedBytes: entry.downloadedBytes ?? prev.downloadedBytes ?? 0,
      updatedAt: entry.updatedAt ?? Date.now(),
      errorMessage: entry.errorMessage ?? prev.errorMessage ?? null,
    };
    index[storyId] = merged;
    await savePackIndex(index);
    return merged;
  } catch (e) {
    warn('packStorageService.setPackEntry:', e);
    return null;
  }
}

/** Remove o CacheEntry de uma história do índice (não apaga arquivos). */
export async function clearPackEntry(storyId) {
  if (!storyId) return false;
  try {
    const index = await getPackIndex();
    if (index[storyId]) {
      delete index[storyId];
      await savePackIndex(index);
    }
    return true;
  } catch (e) {
    warn('packStorageService.clearPackEntry:', e);
    return false;
  }
}

/** Estado do pack de uma história (a partir do índice; NOT_DOWNLOADED se ausente). */
export async function getPackStatus(storyId) {
  const entry = await getPackEntry(storyId);
  return entry?.status || PACK_STATUS.NOT_DOWNLOADED;
}
