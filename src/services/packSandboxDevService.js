/**
 * packSandboxDevService.js — Ferramenta SOMENTE DE DESENVOLVIMENTO para semear, resetar
 * e diagnosticar um pack sandbox `ready` de `david_goliath` NO DEVICE (Fase 2, F2.2b).
 *
 * ⚠️ DUPLO GATE: tudo aqui só roda sob `__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true'`.
 * Com o gate falso: seed/reset NÃO executam, NADA é escrito em AsyncStorage nem em FileSystem.
 *
 * O seed cria `file://` REAIS copiando as 10 cenas de david_goliath do BUNDLE para
 * `documentDirectory/packs/david_goliath@1.0.0/scenes/` (via expo-asset + expo-file-system),
 * valida 10/10, e só então grava `@ptf_packs_v1` com status `ready`. SEM R2, SEM download
 * real, SEM RevenueCat/entitlement. É a primeira escrita real no índice de packs — só em dev.
 */
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { getSceneIllustrationAsset } from '../data/storySceneIllustrations';
import {
  getPackLocalDir,
  getPackTempDir,
  setPackEntry,
  clearPackEntry,
  getPackEntry,
  PACK_STATUS,
} from './packStorageService';
import { validatePackManifest } from './packIntegrityService';
import { resolveStoryScene, resolveStoryMedia, RESOLVE_SOURCE_TYPE } from './contentResolver';
import { warn } from '../utils/logger';

const STORY_ID = 'david_goliath';
const VERSION = '1.0.0';
const SCENE_COUNT = 10;

const pad2 = (n) => String(n).padStart(2, '0');
/** Caminho relativo dentro do pack — DEVE bater com o contentResolver. */
const sceneRelPath = (n) => `scenes/${STORY_ID}_scene_${pad2(n)}.webp`;

/** DUPLO GATE. Sem ele, nada nesta ferramenta executa. */
export function isPackSandboxDevEnabled() {
  return __DEV__ && process.env.EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true';
}

/**
 * Semeia o pack sandbox: copia as 10 cenas do bundle → documentDirectory e, SOMENTE se
 * 10/10 existirem, marca `ready` no índice. Nunca marca ready com arquivo faltando.
 * @returns {Promise<{ok:boolean, reason?:string, files?:Array, totalBytes?:number, entry?:object}>}
 */
export async function seedDavidGoliathPackSandbox() {
  if (!isPackSandboxDevEnabled()) return { ok: false, reason: 'gate desligado' };
  const localDir = getPackLocalDir(STORY_ID, VERSION);
  if (!localDir) return { ok: false, reason: 'documentDirectory indisponível' };
  try {
    await FileSystem.makeDirectoryAsync(`${localDir}scenes/`, { intermediates: true });

    const files = [];
    let totalBytes = 0;
    for (let n = 1; n <= SCENE_COUNT; n += 1) {
      const mod = getSceneIllustrationAsset(STORY_ID, n);
      if (!mod) { files.push({ n, ok: false, reason: 'sem asset no bundle' }); continue; }
      const asset = Asset.fromModule(mod);
      if (!asset.downloaded) await asset.downloadAsync();
      const from = asset.localUri || asset.uri;
      const to = `${localDir}${sceneRelPath(n)}`;
      await FileSystem.deleteAsync(to, { idempotent: true }); // idempotente
      await FileSystem.copyAsync({ from, to });
      const info = await FileSystem.getInfoAsync(to, { size: true });
      const ok = !!info.exists && (info.size ?? 0) > 0;
      files.push({ n, ok, size: info.size ?? 0, uri: to });
      if (ok) totalBytes += info.size ?? 0;
    }

    const allOk = files.length === SCENE_COUNT && files.every((f) => f.ok);
    if (!allOk) {
      // NÃO marca ready se faltar qualquer arquivo — o resolver não checa existência.
      return { ok: false, reason: `apenas ${files.filter((f) => f.ok).length}/${SCENE_COUNT} cenas válidas — NÃO marcado ready`, files };
    }

    const entry = await setPackEntry(STORY_ID, {
      version: VERSION,
      status: PACK_STATUS.READY,
      localDir,
      manifestPath: null, // resolver não lê manifesto para cena (F2.2a)
      totalBytes,
      downloadedBytes: totalBytes,
      errorMessage: null,
    });
    return { ok: true, files, totalBytes, entry };
  } catch (e) {
    warn('seedDavidGoliathPackSandbox:', e);
    return { ok: false, reason: String(e?.message || e) };
  }
}

/**
 * Reseta o sandbox: limpa a entrada do índice E apaga o diretório local. Idempotente.
 * @returns {Promise<{ok:boolean, reason?:string}>}
 */
export async function resetDavidGoliathPackSandbox() {
  if (!isPackSandboxDevEnabled()) return { ok: false, reason: 'gate desligado' };
  try {
    await clearPackEntry(STORY_ID);
    const localDir = getPackLocalDir(STORY_ID, VERSION);
    const tempDir = getPackTempDir(STORY_ID, VERSION);
    if (localDir) await FileSystem.deleteAsync(localDir, { idempotent: true });
    if (tempDir) await FileSystem.deleteAsync(tempDir, { idempotent: true }); // F2.3b: limpa .tmp também
    return { ok: true };
  } catch (e) {
    warn('resetDavidGoliathPackSandbox:', e);
    return { ok: false, reason: String(e?.message || e) };
  }
}

const sceneRe = /^scenes\/david_goliath_scene_\d{2}\.webp$/;

/**
 * DOWNLOAD REAL sandbox (F2.3b) — baixa as 10 CENAS de david_goliath de uma origem HTTP
 * local (LAN), executando o DOWNLOAD_FLOW: manifest → .tmp → validar bytes/existência →
 * mover atômico → ready. SÓ cenas (sem áudio/colorir/capa). SEM R2, SEM dep nova.
 *
 * Segurança: retry começa com `.tmp` LIMPO; NUNCA marca ready parcial; falha → mantém
 * fallback (require) + status `failed`; storyId/version incompatíveis → rejeita.
 *
 * @param {string} baseUrl  ex.: 'http://192.168.x.x:8787/'
 * @param {(p:{status:string, downloadedBytes:number, totalBytes:number})=>void} [onProgress]
 * @returns {Promise<{ok:boolean, reason?:string, totalBytes?:number, entry?:object, errors?:string[]}>}
 */
export async function downloadDavidGoliathPackSandbox(baseUrl, onProgress) {
  if (!isPackSandboxDevEnabled()) return { ok: false, reason: 'gate desligado' };
  // F2.3d: trim de segurança (espaços acidentais no início/fim do input) antes de validar.
  const trimmed = (typeof baseUrl === 'string' ? baseUrl : '').trim();
  if (!trimmed || !/^https?:\/\//.test(trimmed)) return { ok: false, reason: 'baseUrl inválido (use http://IP:porta/)' };
  const base = trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
  const localDir = getPackLocalDir(STORY_ID, VERSION);
  const tempDir = getPackTempDir(STORY_ID, VERSION);
  if (!localDir || !tempDir) return { ok: false, reason: 'documentDirectory indisponível' };
  const report = (status, extra) => { try { if (onProgress) onProgress({ status, downloadedBytes: 0, totalBytes: 0, ...extra }); } catch { /* noop */ } };
  const failWith = async (reason, errors) => {
    try { await FileSystem.deleteAsync(tempDir, { idempotent: true }); } catch { /* noop */ }
    try { await setPackEntry(STORY_ID, { version: VERSION, status: PACK_STATUS.FAILED, errorMessage: reason }); } catch { /* noop */ }
    report(PACK_STATUS.FAILED, {});
    return { ok: false, reason, errors };
  };

  try {
    // retry LIMPO: .tmp sempre recomeça vazio (nunca reaproveita parcial)
    await FileSystem.deleteAsync(tempDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(`${tempDir}scenes/`, { intermediates: true });
    report(PACK_STATUS.DOWNLOADING, {});

    // 1) manifest remoto
    const mTo = `${tempDir}manifest.json`;
    await FileSystem.downloadAsync(`${base}manifest.json`, mTo);
    let manifest;
    try { manifest = JSON.parse(await FileSystem.readAsStringAsync(mTo)); }
    catch { return failWith('manifest.json inválido (JSON)'); }

    // 2) validar manifesto + storyId + version
    const mv = validatePackManifest(manifest, { appVersion: '1.0.0' });
    if (!mv.ok) return failWith(`manifesto inválido: ${mv.errors.join(' | ')}`);
    if (manifest?.metadata?.storyId !== STORY_ID) return failWith('storyId != david_goliath (rejeitado)');
    if (manifest?.version !== VERSION) return failWith(`version incompatível (${manifest?.version} != ${VERSION})`);

    // 3) subset = SOMENTE as 10 cenas
    const scenes = (manifest.files || []).filter((f) => f.kind === 'scene' && sceneRe.test(f.path));
    if (scenes.length !== SCENE_COUNT) return failWith(`manifesto tem ${scenes.length} cenas (esperado ${SCENE_COUNT})`);
    const totalBytes = scenes.reduce((a, f) => a + (Number(f.bytes) || 0), 0);

    // 4) baixar cada cena → .tmp (progresso cumulativo)
    let completed = 0;
    for (const f of scenes) {
      const to = `${tempDir}${f.path}`;
      const dl = FileSystem.createDownloadResumable(`${base}${f.path}`, to, {}, (p) => {
        report(PACK_STATUS.DOWNLOADING, { downloadedBytes: completed + (p.totalBytesWritten || 0), totalBytes });
      });
      await dl.downloadAsync();
      const info = await FileSystem.getInfoAsync(to, { size: true });
      completed += info.size || 0;
      report(PACK_STATUS.DOWNLOADING, { downloadedBytes: completed, totalBytes });
    }

    // 5) verificar existência + bytes (verifying) — sha256 pendente (sem expo-crypto)
    report(PACK_STATUS.VERIFYING, { downloadedBytes: completed, totalBytes });
    const errors = [];
    for (const f of scenes) {
      const info = await FileSystem.getInfoAsync(`${tempDir}${f.path}`, { size: true });
      if (!info.exists) errors.push(`${f.path}: ausente`);
      else if (typeof f.bytes === 'number' && info.size !== f.bytes) errors.push(`${f.path}: bytes ${info.size} != ${f.bytes}`);
    }
    if (errors.length) return failWith(`validação falhou (${errors.length})`, errors);

    // 6) promover .tmp → localDir (troca atômica) — só depois de TUDO validado
    await FileSystem.deleteAsync(localDir, { idempotent: true });
    await FileSystem.moveAsync({ from: tempDir, to: localDir });

    // 7) ready
    const entry = await setPackEntry(STORY_ID, {
      version: VERSION,
      status: PACK_STATUS.READY,
      localDir,
      manifestPath: `${localDir}manifest.json`,
      totalBytes,
      downloadedBytes: totalBytes,
      errorMessage: null,
    });
    report(PACK_STATUS.READY, { downloadedBytes: totalBytes, totalBytes });
    return { ok: true, totalBytes, entry };
  } catch (e) {
    warn('downloadDavidGoliathPackSandbox:', e);
    return failWith(String(e?.message || e));
  }
}

/**
 * Diagnóstico read-only: status/localDir/version/arquivos + decisão do resolver por cena
 * (sourceType require|file, uri) e usesPack. Usa resolveStoryScene/resolveStoryMedia.
 * @returns {Promise<object>}
 */
export async function diagnoseDavidGoliathPackSandbox() {
  if (!isPackSandboxDevEnabled()) return { enabled: false };
  const entry = await getPackEntry(STORY_ID);
  const localDir = entry?.localDir || getPackLocalDir(STORY_ID, VERSION);

  const scenes = [];
  for (let n = 1; n <= SCENE_COUNT; n += 1) {
    const expectedUri = `${localDir}${sceneRelPath(n)}`;
    let exists = false;
    let size = 0;
    try {
      const info = await FileSystem.getInfoAsync(expectedUri, { size: true });
      exists = !!info.exists;
      size = info.size ?? 0;
    } catch { /* mantém exists=false */ }
    const r = resolveStoryScene(STORY_ID, n, entry); // decisão do resolver (require|file)
    scenes.push({
      n,
      expectedUri,
      exists,
      size,
      sourceType: r.sourceType,
      uri: (r.sourceType === RESOLVE_SOURCE_TYPE.FILE && r.source && r.source.uri) ? r.source.uri : null,
    });
  }

  const media = resolveStoryMedia(STORY_ID, { packEntry: entry, sceneCount: SCENE_COUNT });
  const filesFound = scenes.filter((s) => s.exists).length;
  const totalBytes = scenes.reduce((acc, s) => acc + (s.exists ? s.size : 0), 0);

  return {
    enabled: true,
    storyId: STORY_ID,
    version: entry?.version ?? null,
    status: entry?.status ?? PACK_STATUS.NOT_DOWNLOADED,
    localDir,
    filesFound,
    totalBytes,
    usesPack: media.usesPack,
    scenes,
  };
}
