/**
 * packManifestService.js — Validação do MANIFESTO de pack (Feature 001, Fase 2).
 *
 * Espelha `specs/001-asset-architecture-budget/contracts/pack-manifest.schema.json`
 * em JavaScript PURO — SEM biblioteca de schema (Constituição: nenhuma dependência
 * nova). NÃO baixa nada, NÃO toca rede nem arquivos. `validateManifest(m)` retorna
 * `{ ok, errors[] }` e NUNCA lança.
 *
 * Campos obrigatórios (manifesto): schemaVersion, id, version, type, minAppVersion,
 * totalBytes, files, metadata. Cada file: path, bytes, sha256, kind (+ width/height/ratio).
 */

const SEMVER = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const SLUG = /^[a-z0-9_]+$/;
const SHA256 = /^[a-f0-9]{64}$/;
const PACK_TYPES = ['story', 'coloring', 'audio', 'bundle'];
const FILE_KINDS = ['scene', 'coloring', 'audio', 'cover', 'other'];

function isInt(n) {
  return typeof n === 'number' && Number.isInteger(n);
}

function cmpSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

export function validateFileEntry(file, index, errors) {
  const at = `files[${index}]`;
  if (!file || typeof file !== 'object') {
    errors.push(`${at}: deve ser objeto`);
    return;
  }
  if (typeof file.path !== 'string' || !file.path) {
    errors.push(`${at}.path: string obrigatória`);
  } else {
    if (file.path.startsWith('/')) errors.push(`${at}.path: não pode começar com '/'`);
    if (file.path.includes('..')) errors.push(`${at}.path: não pode conter '..'`);
  }
  if (!isInt(file.bytes) || file.bytes < 0) errors.push(`${at}.bytes: inteiro >= 0`);
  if (typeof file.sha256 !== 'string' || !SHA256.test(file.sha256)) {
    errors.push(`${at}.sha256: hex de 64 caracteres`);
  }
  if (!FILE_KINDS.includes(file.kind)) errors.push(`${at}.kind: um de ${FILE_KINDS.join('|')}`);
  if (file.width != null && (!isInt(file.width) || file.width < 1)) {
    errors.push(`${at}.width: inteiro >= 1 ou null`);
  }
  if (file.height != null && (!isInt(file.height) || file.height < 1)) {
    errors.push(`${at}.height: inteiro >= 1 ou null`);
  }
  if (file.ratio != null && typeof file.ratio !== 'string') {
    errors.push(`${at}.ratio: string ou null`);
  }
}

export function validateManifest(manifest, options) {
  const errors = [];
  const opts = options || {};
  if (!manifest || typeof manifest !== 'object') {
    return { ok: false, errors: ['manifest: deve ser objeto'] };
  }

  if (manifest.schemaVersion !== 1) errors.push('schemaVersion: deve ser 1');
  if (typeof manifest.id !== 'string' || !SLUG.test(manifest.id)) errors.push('id: slug [a-z0-9_]');
  if (typeof manifest.version !== 'string' || !SEMVER.test(manifest.version)) {
    errors.push('version: semver x.y.z');
  }
  if (!PACK_TYPES.includes(manifest.type)) errors.push(`type: um de ${PACK_TYPES.join('|')}`);
  if (typeof manifest.minAppVersion !== 'string' || !SEMVER.test(manifest.minAppVersion)) {
    errors.push('minAppVersion: semver x.y.z');
  }
  if (!isInt(manifest.totalBytes) || manifest.totalBytes < 0) {
    errors.push('totalBytes: inteiro >= 0');
  }

  if (!Array.isArray(manifest.files) || manifest.files.length < 1) {
    errors.push('files: array com pelo menos 1 item');
  } else {
    const seen = new Set();
    let sum = 0;
    manifest.files.forEach((f, i) => {
      validateFileEntry(f, i, errors);
      if (f && typeof f.path === 'string') {
        if (seen.has(f.path)) errors.push(`files[${i}].path: duplicado (${f.path})`);
        seen.add(f.path);
      }
      if (f && isInt(f.bytes)) sum += f.bytes;
    });
    if (isInt(manifest.totalBytes) && sum !== manifest.totalBytes) {
      errors.push(`totalBytes (${manifest.totalBytes}) != soma de files.bytes (${sum})`);
    }
  }

  const md = manifest.metadata;
  if (!md || typeof md !== 'object') {
    errors.push('metadata: objeto obrigatório');
  } else {
    if (typeof md.title !== 'string' || !md.title) errors.push('metadata.title: string obrigatória');
    if (typeof md.storyId !== 'string' || !SLUG.test(md.storyId)) {
      errors.push('metadata.storyId: slug [a-z0-9_]');
    }
    if (typeof md.language !== 'string' || !md.language) {
      errors.push('metadata.language: string obrigatória');
    }
    if (md.coverPath != null && typeof md.coverPath !== 'string') {
      errors.push('metadata.coverPath: string ou ausente');
    }
  }

  // Opcional: compatibilidade de versão (minAppVersion <= appVersion), se informada.
  if (
    opts.appVersion &&
    typeof opts.appVersion === 'string' &&
    SEMVER.test(opts.appVersion) &&
    typeof manifest.minAppVersion === 'string' &&
    SEMVER.test(manifest.minAppVersion) &&
    cmpSemver(manifest.minAppVersion, opts.appVersion) > 0
  ) {
    errors.push(`minAppVersion (${manifest.minAppVersion}) > appVersion (${opts.appVersion})`);
  }

  return { ok: errors.length === 0, errors };
}
