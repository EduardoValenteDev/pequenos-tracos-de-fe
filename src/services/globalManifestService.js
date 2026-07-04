/**
 * globalManifestService.js — Leitura e validação do MANIFESTO GLOBAL de conteúdo
 * (content-manifest.json) — Fase 2, F2.4d.2.
 *
 * É o índice REMOTO de packs disponíveis (aponta para cada pack: id, storyId, versão,
 * baseUrl, acesso, metadados). NÃO substitui o manifest.json por-pack (que continua sendo
 * a fonte de verdade dos arquivos internos). Contrato: docs/F2_4D_1_GLOBAL_MANIFEST_CONTRACT.md.
 *
 * ⚠️ READ-ONLY e SEGURO: só LÊ e VALIDA. NÃO baixa packs, NÃO baixa mídia, NÃO instala,
 * NÃO grava AsyncStorage, NÃO chama setPackEntry/contentResolver, NÃO dispara download.
 * Nunca lança para manifesto inválido — retorna sempre `{ ok, data, errors, warnings }`.
 * O consumo (F2.4d.3+) permanece dev-gated; entitlement real fica para etapa futura.
 */
import { STORY_CONTENT_LAYER } from '../data/contentManifest';
import { warn } from '../utils/logger';

/** Versão do schema do índice global (raiz `manifestVersion`). */
export const GLOBAL_MANIFEST_VERSION = 1;

const SEMVER = /^\d+\.\d+\.\d+$/;
const SHA256 = /^[a-f0-9]{64}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const KNOWN_MEDIA_KINDS = ['cover', 'scene', 'coloring', 'audio'];
const KNOWN_ACCESS = ['free', 'premium'];
const KNOWN_PACK_TYPES = ['story'];
const KNOWN_STATUS = [
  'not_downloaded', 'downloading', 'verifying', 'ready',
  'failed', 'needs_update', 'requires_app_update', 'included',
];

function isNonEmptyString(v) { return typeof v === 'string' && v.length > 0; }
function isPositiveInt(v) { return typeof v === 'number' && Number.isInteger(v) && v > 0; }
function isValidISO(v) { return isNonEmptyString(v) && ISO_DATE.test(v) && Number.isFinite(Date.parse(v)); }

function cmpSemver(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da !== db) return da - db;
  }
  return 0;
}

/** storyIds conhecidos pelo app (camada de conteúdo). Read-only; nunca lança. */
function defaultKnownStoryIds() {
  try { return Object.keys(STORY_CONTENT_LAYER); } catch (e) { return []; }
}

/**
 * Valida o MANIFESTO GLOBAL conforme o contrato F2.4d.1. Nunca lança.
 * @param {*} rawManifest objeto do content-manifest.json
 * @param {{ appVersion?:string, knownStoryIds?:string[]|Set, allowHttp?:boolean }} [options]
 *   - appVersion: para sinalizar requires_app_update (NÃO é erro de schema).
 *   - knownStoryIds: conjunto de storyIds válidos (padrão: camada de conteúdo do app).
 *   - allowHttp: em dev, aceita http:// além de https:// (padrão false = exige https).
 * @returns {{ ok:boolean, data:object|null, errors:string[], warnings:string[] }}
 */
export function validateGlobalContentManifest(rawManifest, options = {}) {
  const errors = [];
  const warnings = [];
  const opts = options || {};
  const appVersion = isNonEmptyString(opts.appVersion) && SEMVER.test(opts.appVersion) ? opts.appVersion : null;
  const allowHttp = opts.allowHttp === true;
  const knownStoryIds = new Set(
    Array.isArray(opts.knownStoryIds)
      ? opts.knownStoryIds
      : (opts.knownStoryIds instanceof Set ? [...opts.knownStoryIds] : defaultKnownStoryIds()),
  );

  if (!rawManifest || typeof rawManifest !== 'object' || Array.isArray(rawManifest)) {
    return { ok: false, data: null, errors: ['manifest: deve ser objeto'], warnings };
  }

  if (rawManifest.manifestVersion !== GLOBAL_MANIFEST_VERSION) {
    errors.push(`manifestVersion: deve ser ${GLOBAL_MANIFEST_VERSION}`);
  }
  if (!isValidISO(rawManifest.generatedAt)) errors.push('generatedAt: string ISO válida obrigatória');
  if (!isNonEmptyString(rawManifest.minAppVersion) || !SEMVER.test(rawManifest.minAppVersion)) {
    errors.push('minAppVersion: semver x.y.z obrigatório');
  }
  if (!Array.isArray(rawManifest.packs)) {
    errors.push('packs: deve ser array');
    return { ok: false, data: null, errors, warnings };
  }

  // Índice pede app mais novo → warning (NÃO erro de schema).
  if (appVersion && isNonEmptyString(rawManifest.minAppVersion) && SEMVER.test(rawManifest.minAppVersion)
      && cmpSemver(rawManifest.minAppVersion, appVersion) > 0) {
    warnings.push(`minAppVersion (${rawManifest.minAppVersion}) > appVersion (${appVersion}) — índice pede app mais novo`);
  }

  const seenIds = new Set();
  const seenStoryIds = new Set();
  const outPacks = [];

  rawManifest.packs.forEach((p, i) => {
    const at = `packs[${i}]`;
    if (!p || typeof p !== 'object' || Array.isArray(p)) { errors.push(`${at}: deve ser objeto`); return; }

    if (!isNonEmptyString(p.id)) errors.push(`${at}.id: string obrigatória`);
    else if (seenIds.has(p.id)) errors.push(`${at}.id: duplicado (${p.id})`);
    else seenIds.add(p.id);

    if (!isNonEmptyString(p.storyId)) {
      errors.push(`${at}.storyId: string obrigatória`);
    } else {
      if (seenStoryIds.has(p.storyId)) errors.push(`${at}.storyId: duplicado (${p.storyId})`);
      else seenStoryIds.add(p.storyId);
      if (!knownStoryIds.has(p.storyId)) errors.push(`${at}.storyId: desconhecido pelo app (${p.storyId})`);
    }

    if (!isNonEmptyString(p.version) || !SEMVER.test(p.version)) errors.push(`${at}.version: semver x.y.z`);
    if (!KNOWN_PACK_TYPES.includes(p.type)) errors.push(`${at}.type: deve ser ${KNOWN_PACK_TYPES.join('|')}`);
    if (!KNOWN_ACCESS.includes(p.access)) errors.push(`${at}.access: deve ser ${KNOWN_ACCESS.join('|')}`);
    if (!isNonEmptyString(p.title)) errors.push(`${at}.title: string não vazia`);
    if (!isPositiveInt(p.bytes)) errors.push(`${at}.bytes: inteiro positivo`);

    if (!isNonEmptyString(p.baseUrl)) {
      errors.push(`${at}.baseUrl: string obrigatória`);
    } else {
      if (!p.baseUrl.endsWith('/')) errors.push(`${at}.baseUrl: deve terminar com '/'`);
      const isHttps = /^https:\/\//.test(p.baseUrl);
      const isHttp = /^http:\/\//.test(p.baseUrl);
      if (!isHttps && !(allowHttp && isHttp)) {
        errors.push(`${at}.baseUrl: deve usar https://${allowHttp ? ' (ou http:// em dev)' : ' em produção'}`);
      }
    }

    if (p.manifestPath !== 'manifest.json') errors.push(`${at}.manifestPath: deve ser "manifest.json"`);

    if (p.manifestSha256 != null && !(isNonEmptyString(p.manifestSha256) && SHA256.test(p.manifestSha256))) {
      errors.push(`${at}.manifestSha256: hex de 64 caracteres (ou ausente)`);
    }

    if (!isNonEmptyString(p.requiredAppVersion) || !SEMVER.test(p.requiredAppVersion)) {
      errors.push(`${at}.requiredAppVersion: semver x.y.z`);
    }

    if (!Array.isArray(p.mediaKinds) || p.mediaKinds.length === 0) {
      errors.push(`${at}.mediaKinds: array não vazio`);
    } else {
      const bad = p.mediaKinds.filter((k) => !KNOWN_MEDIA_KINDS.includes(k));
      if (bad.length) errors.push(`${at}.mediaKinds: valores inválidos (${bad.join(',')})`);
    }

    if (p.status != null && !KNOWN_STATUS.includes(p.status)) errors.push(`${at}.status: valor inesperado (${p.status})`);

    // requiredAppVersion > appVersion → NÃO é erro de schema; sinaliza requires_app_update.
    let requiresAppUpdate = false;
    if (appVersion && isNonEmptyString(p.requiredAppVersion) && SEMVER.test(p.requiredAppVersion)
        && cmpSemver(p.requiredAppVersion, appVersion) > 0) {
      requiresAppUpdate = true;
      warnings.push(`${at}: requiredAppVersion (${p.requiredAppVersion}) > appVersion (${appVersion}) → requires_app_update`);
    }

    outPacks.push({ ...p, requiresAppUpdate });
  });

  const ok = errors.length === 0;
  return { ok, data: ok ? { ...rawManifest, packs: outPacks } : null, errors, warnings };
}

/**
 * Busca (fetch) + valida o manifesto global. READ-ONLY: NÃO grava storage, NÃO instala,
 * NÃO baixa packs/mídia, NÃO chama setPackEntry/contentResolver. Nunca lança.
 * Trata URL inválida, 404, rede indisponível, JSON inválido e timeout — tudo estruturado.
 * @param {string} url URL do content-manifest.json (https em produção; http só em dev)
 * @param {{ appVersion?:string, knownStoryIds?:string[]|Set, allowHttp?:boolean, timeoutMs?:number }} [options]
 * @returns {Promise<{ ok:boolean, data:object|null, errors:string[], warnings:string[] }>}
 */
export async function fetchGlobalContentManifest(url, options = {}) {
  const opts = options || {};
  const trimmed = (typeof url === 'string' ? url : '').trim();
  // Em dev aceita http; produção exige https. `allowHttp` explícito tem prioridade.
  const allowHttp = opts.allowHttp === true || (typeof __DEV__ !== 'undefined' && __DEV__ && opts.allowHttp !== false);
  const isHttps = /^https:\/\//.test(trimmed);
  const isHttp = allowHttp && /^http:\/\//.test(trimmed);
  if (!trimmed || (!isHttps && !isHttp)) {
    return { ok: false, data: null, errors: [`url inválida (use https://${allowHttp ? ' ou http:// em dev' : ''})`], warnings: [] };
  }

  const timeoutMs = Number.isFinite(opts.timeoutMs) && opts.timeoutMs > 0 ? opts.timeoutMs : 10000;
  let controller = null;
  let timer = null;
  try {
    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      timer = setTimeout(() => { try { controller.abort(); } catch (_) { /* noop */ } }, timeoutMs);
    }
    const res = await fetch(trimmed, controller ? { signal: controller.signal } : undefined);
    if (timer) clearTimeout(timer);
    if (!res || !res.ok) {
      return { ok: false, data: null, errors: [`HTTP ${res ? res.status : '???'} ao buscar content-manifest.json`], warnings: [] };
    }
    let json;
    try { json = await res.json(); }
    catch (e) { return { ok: false, data: null, errors: ['content-manifest.json inválido (JSON)'], warnings: [] }; }
    return validateGlobalContentManifest(json, opts);
  } catch (e) {
    if (timer) clearTimeout(timer);
    warn('globalManifestService.fetch:', e);
    const reason = (e && e.name === 'AbortError')
      ? 'timeout ao buscar content-manifest.json'
      : 'rede indisponível ao buscar content-manifest.json';
    return { ok: false, data: null, errors: [reason], warnings: [] };
  }
}

/**
 * Retorna o pack de um storyId a partir de um manifesto (ou do `data` já validado).
 * Resultado estruturado; NÃO dispara download. Nunca lança.
 * @param {{packs?:Array}} manifestOrData manifesto global (raw ou validado)
 * @param {string} storyId
 * @returns {{ ok:boolean, data:object|null, errors:string[] }}
 */
export function getPackFromGlobalManifest(manifestOrData, storyId) {
  if (!isNonEmptyString(storyId)) return { ok: false, data: null, errors: ['storyId ausente'] };
  const packs = manifestOrData && Array.isArray(manifestOrData.packs) ? manifestOrData.packs : null;
  if (!packs) return { ok: false, data: null, errors: ['manifesto sem packs'] };
  const pack = packs.find((p) => p && p.storyId === storyId) || null;
  if (!pack) return { ok: false, data: null, errors: [`storyId não encontrado no manifesto global (${storyId})`] };
  return { ok: true, data: pack, errors: [] };
}
