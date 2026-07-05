/**
 * packIntegrityService.js — Validação de manifesto e integridade de arquivos de pack
 * (Fase 2, F2.1a — fundação).
 *
 * - Manifesto (schema): delega ao `packManifestService.validateManifest` (já existe).
 * - Integridade por ARQUIVO: bytes + existência (expo-file-system).
 * - sha256 REAL (F2.4e.2): via **@noble/hashes** (JS puro, sem módulo nativo). Lê o
 *   arquivo como base64, decodifica para bytes crus e calcula sha256 → hex lowercase,
 *   batendo com o sha256 gerado pelo `build-story-pack.js` (Node crypto sobre bytes crus).
 *
 * NÃO baixa nada, NÃO usa rede. As funções de arquivo só têm efeito quando houver pack
 * real no disco. Erros → retorno seguro (nunca lança).
 */
import * as FileSystem from 'expo-file-system/legacy';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { validateManifest } from './packManifestService';
import { warn } from '../utils/logger';

/** Decodifica base64 → bytes crus (atob está disponível no Hermes/RN e no Node). */
function base64ToBytes(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

/** sha256 (hex lowercase) de um conteúdo base64 — PURA, testável, sem I/O. */
function hashBase64ToHex(b64) {
  return bytesToHex(sha256(base64ToBytes(b64)));
}

/** Valida o MANIFESTO (schema) — delega ao validador existente. */
export function validatePackManifest(manifest, options) {
  return validateManifest(manifest, options);
}

/**
 * sha256 REAL de um arquivo local (hex lowercase), via @noble/hashes sobre os bytes
 * crus. Lê o arquivo como base64 (expo-file-system) e decodifica. Retorno seguro
 * (nunca lança): arquivo inexistente/leitura inválida/erro de hash → { ok:false }.
 * @returns {Promise<{ok:boolean, sha256:string|null, reason:string}>}
 */
export async function computeFileSha256(fileUri) {
  if (!fileUri || typeof fileUri !== 'string') {
    return { ok: false, sha256: null, reason: 'fileUri inválido' };
  }
  try {
    const info = await FileSystem.getInfoAsync(fileUri, { size: true });
    if (!info.exists) return { ok: false, sha256: null, reason: 'arquivo ausente no disco' };
    const b64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
    const hex = hashBase64ToHex(b64);
    if (!/^[a-f0-9]{64}$/.test(hex)) return { ok: false, sha256: null, reason: 'hash inválido' };
    return { ok: true, sha256: hex, reason: 'sha256 (noble) sobre bytes crus' };
  } catch (e) {
    warn('packIntegrityService.computeFileSha256:', e);
    return { ok: false, sha256: null, reason: 'erro ao ler/hashear arquivo' };
  }
}

/**
 * Valida UM FileEntry contra o disco: path seguro + existência + bytes.
 * sha256 = fallback preparado (não bloqueia). Retorno seguro (nunca lança).
 * @returns {Promise<{ok:boolean, path:string, reason:string}>}
 */
export async function validateFileEntry(fileEntry, baseDir) {
  const at = (fileEntry && typeof fileEntry.path === 'string') ? fileEntry.path : '(sem path)';
  if (!fileEntry || typeof fileEntry !== 'object' || typeof fileEntry.path !== 'string' || !fileEntry.path) {
    return { ok: false, path: at, reason: 'fileEntry inválido' };
  }
  if (fileEntry.path.startsWith('/') || fileEntry.path.includes('..')) {
    return { ok: false, path: at, reason: 'path inseguro (absoluto ou com ..)' };
  }
  if (!baseDir) return { ok: false, path: at, reason: 'baseDir ausente' };
  try {
    const fileUri = baseDir + fileEntry.path;
    const info = await FileSystem.getInfoAsync(fileUri, { size: true });
    if (!info.exists) return { ok: false, path: at, reason: 'arquivo ausente no disco' };
    if (typeof fileEntry.bytes === 'number' && typeof info.size === 'number' && info.size !== fileEntry.bytes) {
      return { ok: false, path: at, reason: `bytes divergentes (manifesto ${fileEntry.bytes}, disco ${info.size})` };
    }
    // sha256 REAL quando o manifesto declara o hash. Se ausente (contrato futuro), não bloqueia.
    if (typeof fileEntry.sha256 === 'string' && fileEntry.sha256) {
      const h = await computeFileSha256(fileUri);
      if (!h.ok) return { ok: false, path: at, reason: `sha256 indisponível (${h.reason})` };
      if (h.sha256 !== fileEntry.sha256.toLowerCase()) {
        return { ok: false, path: at, reason: `sha256 divergente (manifesto ${fileEntry.sha256}, arquivo ${h.sha256})` };
      }
      return { ok: true, path: at, reason: 'bytes+existência+sha256 OK' };
    }
    return { ok: true, path: at, reason: 'bytes+existência OK (sha256 ausente no manifesto)' };
  } catch (e) {
    warn('packIntegrityService.validateFileEntry:', e);
    return { ok: false, path: at, reason: 'erro ao ler arquivo' };
  }
}

/**
 * Valida TODOS os arquivos de um manifesto contra um diretório base.
 * @returns {Promise<{ok:boolean, checked:number, errors:string[]}>}
 */
export async function validatePackFiles(manifest, baseDir) {
  const files = Array.isArray(manifest?.files) ? manifest.files : [];
  if (files.length === 0) return { ok: false, checked: 0, errors: ['manifesto sem files'] };
  const errors = [];
  let checked = 0;
  for (const f of files) {
    const r = await validateFileEntry(f, baseDir);
    checked += 1;
    if (!r.ok) errors.push(`${r.path}: ${r.reason}`);
  }
  return { ok: errors.length === 0, checked, errors };
}
