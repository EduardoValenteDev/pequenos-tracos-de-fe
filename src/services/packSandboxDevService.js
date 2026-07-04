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
  setPackEntry,
  clearPackEntry,
  getPackEntry,
  PACK_STATUS,
} from './packStorageService';
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
    if (localDir) await FileSystem.deleteAsync(localDir, { idempotent: true });
    return { ok: true };
  } catch (e) {
    warn('resetDavidGoliathPackSandbox:', e);
    return { ok: false, reason: String(e?.message || e) };
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
