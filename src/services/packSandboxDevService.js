/**
 * packSandboxDevService.js — Ferramenta SOMENTE DE DESENVOLVIMENTO para semear, resetar
 * e diagnosticar um pack sandbox `ready` de `david_goliath` NO DEVICE (Fase 2, F2.2b).
 *
 * ⚠️ GATE (F2.4e.7b): tudo aqui só roda quando `isPackSandboxDevEnabled()` é true — em DOIS
 * ambientes seguros: (A) DEV `__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true'`; OU
 * (B) QA release-safe (preview/internal) via `RELEASE_PACK_QA_ENABLED` (quádruplo gate).
 * PRODUÇÃO nunca liga. Com o gate falso: seed/reset NÃO executam, NADA é escrito.
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
import { validatePackManifest, computeFileSha256 } from './packIntegrityService';
import { clearStoryPackInstall } from './packInstallRegistry';
import { resolveStoryMedia, RESOLVE_SOURCE_TYPE } from './contentResolver';
import { RELEASE_PACK_QA_ENABLED } from '../config/featureFlags';
import { warn } from '../utils/logger';

const STORY_ID = 'david_goliath';
const VERSION = '1.0.0';
const SCENE_COUNT = 10;

const pad2 = (n) => String(n).padStart(2, '0');
/** Caminhos relativos dentro do pack — DEVEM bater com o contentResolver. */
const sceneRelPath = (n) => `scenes/${STORY_ID}_scene_${pad2(n)}.webp`;
const coverRelPath = () => 'cover.webp';
// [P3J] `coloringRelPath` removido: o pack não carrega mais `coloring/scene_NN.png` (o Colorir
// legado foi aposentado e o kind saiu do download). Arquivos desse tipo em packs JÁ instalados
// continuam intocados no disco — nada é apagado por esta mudança.
const audioRelPath = (n) => `audio/${STORY_ID}_scene_${pad2(n)}.mp3`;

/** Cede o controle à UI entre etapas pesadas (evita travar o JS thread). */
const yieldToUI = () => new Promise((r) => setTimeout(r, 0));

/**
 * Gate central da ferramenta de pack sandbox. Ativo em DOIS ambientes seguros:
 *  (A) DEV: `__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true'`.
 *  (B) QA release-safe (preview/internal): `RELEASE_PACK_QA_ENABLED` — quádruplo gate
 *      (ver featureFlags). PRODUÇÃO nunca liga. Sem ele, nada nesta ferramenta executa.
 */
export function isPackSandboxDevEnabled() {
  const devGate = __DEV__ && process.env.EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true';
  return devGate || RELEASE_PACK_QA_ENABLED;
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
    // FIX1R — ORDEM DO RESET: (1) invalida a operação + o snapshot global ANTES de tudo (bump do
    // operationId → revoga a autorização de publicação do voo antigo e impede join do FlightRecord);
    // (2) limpa a entrada persistida; (3) limpa os diretórios. `typeof`-guard p/ o harness.
    if (typeof clearStoryPackInstall === 'function') clearStoryPackInstall(STORY_ID);
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

    // 4) baixar cada cena → .tmp (progresso cumulativo; chunk THROTTLED ~120ms — F2.4e.2pR)
    let completed = 0;
    let lastTick = 0;
    for (const f of scenes) {
      const to = `${tempDir}${f.path}`;
      const dl = FileSystem.createDownloadResumable(`${base}${f.path}`, to, {}, (p) => {
        const now = Date.now();
        if (now - lastTick < 120) return; // throttle: no máx ~8 updates/s durante o chunk
        lastTick = now;
        report(PACK_STATUS.DOWNLOADING, { downloadedBytes: completed + (p.totalBytesWritten || 0), totalBytes });
      });
      await dl.downloadAsync();
      const info = await FileSystem.getInfoAsync(to, { size: true });
      completed += info.size || 0;
      report(PACK_STATUS.DOWNLOADING, { downloadedBytes: completed, totalBytes }); // 1 por arquivo
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
 * Diagnóstico read-only LEVE POR KIND (F2.4e.1 → F2.4e.2p): cover/scene/audio com
 * existência, bytes, decisão do resolver (sourceType require|file) e uri file://.
 * [P3J] O kind `coloring` saiu do diagnóstico junto com a aposentadoria do Colorir legado — o
 * resolvedor não o resolve mais e o downloader não o pede. A verificação sha256 PROFUNDA (abaixo)
 * continua tolerante: ela lê os kinds do `manifest.json` do disco, então um pack antigo que ainda
 * tenha linearts segue sendo hasheado e reportado como sempre.
 * ⚠️ NÃO hasheia (a verificação sha256 profunda é uma ação dev explícita —
 * `verifyDavidGoliathPackSandboxSha256`). Isto mantém o refresh/entrada da tela rápidos.
 * @returns {Promise<object>}
 */
export async function diagnoseDavidGoliathPackSandbox() {
  if (!isPackSandboxDevEnabled()) return { enabled: false };
  const entry = await getPackEntry(STORY_ID);
  const localDir = entry?.localDir || getPackLocalDir(STORY_ID, VERSION);
  const media = resolveStoryMedia(STORY_ID, { packEntry: entry, sceneCount: SCENE_COUNT });

  // LEVE: só disco (existe/bytes) + resolver (require|file, uri). SEM hashing (F2.4e.2p).
  const inspect = async (rel, resolved) => {
    const expectedUri = `${localDir}${rel}`;
    let exists = false;
    let size = 0;
    try {
      const info = await FileSystem.getInfoAsync(expectedUri, { size: true });
      exists = !!info.exists;
      size = info.size ?? 0;
    } catch { /* mantém exists=false */ }
    return {
      expectedUri,
      exists,
      size,
      sourceType: resolved.sourceType,
      uri: (resolved.sourceType === RESOLVE_SOURCE_TYPE.FILE && resolved.source && resolved.source.uri) ? resolved.source.uri : null,
    };
  };

  const cover = { ...(await inspect(coverRelPath(), media.cover)) };
  const scenes = [];
  const audio = [];
  for (let n = 1; n <= SCENE_COUNT; n += 1) {
    scenes.push({ n, ...(await inspect(sceneRelPath(n), media.scenes[n - 1])) });
    audio.push({ n, ...(await inspect(audioRelPath(n), media.audio[n - 1])) });
  }

  const summarize = (items) => ({
    found: items.filter((i) => i.exists).length,
    total: items.length,
    file: items.filter((i) => i.sourceType === RESOLVE_SOURCE_TYPE.FILE).length,
    bytes: items.reduce((acc, i) => acc + (i.exists ? i.size : 0), 0),
  });

  const byKind = {
    cover: summarize([cover]),
    scene: summarize(scenes),
    audio: summarize(audio),
  };
  const filesFound = byKind.cover.found + byKind.scene.found + byKind.audio.found;
  const totalBytes = byKind.cover.bytes + byKind.scene.bytes + byKind.audio.bytes;

  return {
    enabled: true,
    storyId: STORY_ID,
    version: entry?.version ?? null,
    status: entry?.status ?? PACK_STATUS.NOT_DOWNLOADED,
    localDir,
    filesFound,
    totalBytes,
    usesPack: media.usesPack,
    byKind,
    cover,
    scenes,
    audio,
  };
}

/**
 * Verificação PROFUNDA de sha256 (F2.4e.2p) — AÇÃO DEV EXPLÍCITA e sob demanda. Hasheia
 * cada arquivo do pack contra o `manifest.json` do disco, **cedendo a UI entre arquivos**
 * (yield) para não travar. Não roda no refresh/entrada da tela. Retorno seguro (nunca lança).
 * @returns {Promise<{enabled:boolean, ok?:boolean, reason?:string, byKind?:object, checked?:number, ms?:number}>}
 */
export async function verifyDavidGoliathPackSandboxSha256() {
  if (!isPackSandboxDevEnabled()) return { enabled: false };
  const entry = await getPackEntry(STORY_ID);
  const localDir = entry?.localDir || getPackLocalDir(STORY_ID, VERSION);
  let man;
  try { man = JSON.parse(await FileSystem.readAsStringAsync(`${localDir}manifest.json`)); }
  catch { return { enabled: true, ok: false, reason: 'manifest.json ausente no disco (baixe primeiro)' }; }

  const files = (man.files || []).filter((f) => f && typeof f.path === 'string' && typeof f.sha256 === 'string');
  const byKind = {};
  const t0 = Date.now();
  for (const f of files) {
    const g = byKind[f.kind] || (byKind[f.kind] = { ok: 0, total: 0 });
    g.total += 1;
    const h = await computeFileSha256(`${localDir}${f.path}`);
    if (h.ok && h.sha256 === f.sha256.toLowerCase()) g.ok += 1;
    await yieldToUI(); // devolve controle à UI entre arquivos (evita congelar)
  }
  const ms = Date.now() - t0;
  const ok = files.length > 0 && Object.values(byKind).every((g) => g.ok === g.total);
  if (__DEV__) console.log('[PackSandbox] verify sha256 profundo:', ms, 'ms,', files.length, 'arquivos', byKind);
  return { enabled: true, ok, byKind, checked: files.length, ms };
}
