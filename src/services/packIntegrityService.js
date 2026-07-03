/**
 * packIntegrityService.js — Validação de manifesto e integridade de arquivos de pack
 * (Fase 2, F2.1a — fundação).
 *
 * - Manifesto (schema): delega ao `packManifestService.validateManifest` (já existe).
 * - Integridade por ARQUIVO: bytes + existência (expo-file-system).
 * - sha256: PREPARADO com fallback documentado — **expo-crypto NÃO está instalado**
 *   (nenhuma dependência nova neste bloco). Até uma dep aprovada chegar, a integridade
 *   usa bytes + existência (suficiente para o piloto sandbox do F2.1b).
 *
 * NESTE BLOCO: NÃO baixa nada, NÃO usa rede. As funções de arquivo só têm efeito
 * quando houver pack real no disco (F2.1b). Erros → retorno seguro (nunca lança).
 */
import * as FileSystem from 'expo-file-system/legacy';
import { validateManifest } from './packManifestService';
import { warn } from '../utils/logger';

/** Valida o MANIFESTO (schema) — delega ao validador existente. */
export function validatePackManifest(manifest, options) {
  return validateManifest(manifest, options);
}

/**
 * sha256 de um arquivo local. PREPARADO: sem `expo-crypto` (dep não instalada),
 * retorna { ok:false, sha256:null, reason }. Quando a dependência de hash for
 * aprovada, implementar aqui — SEM instalar nada neste bloco.
 * @returns {Promise<{ok:boolean, sha256:string|null, reason:string}>}
 */
export async function computeFileSha256(fileUri) {
  return {
    ok: false,
    sha256: null,
    reason: 'hash indisponível sem dependência de crypto — fallback: bytes + existência (F2.1b/dep aprovada)',
  };
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
    const info = await FileSystem.getInfoAsync(baseDir + fileEntry.path, { size: true });
    if (!info.exists) return { ok: false, path: at, reason: 'arquivo ausente no disco' };
    if (typeof fileEntry.bytes === 'number' && typeof info.size === 'number' && info.size !== fileEntry.bytes) {
      return { ok: false, path: at, reason: `bytes divergentes (manifesto ${fileEntry.bytes}, disco ${info.size})` };
    }
    return { ok: true, path: at, reason: 'bytes+existência OK (sha256 pendente de dep de crypto)' };
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
