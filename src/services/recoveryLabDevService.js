/**
 * recoveryLabDevService.js — LABORATÓRIO DE RECOVERY (somente DEV/QA, NUNCA produção).
 *
 * Semeia estados DETERMINÍSTICOS de recovery no sandbox do app (`documentDirectory/packs/`)
 * usando os HELPERS REAIS — `buildPublishMarker`, o schema real de `manifest.json`
 * (`validatePackManifest`), os caminhos oficiais (`getPackLocalDir`), o sha256 real
 * (`computeFileSha256`) e o storage real do índice (`getPackIndex`/`setPackEntry`) — e chama o
 * `recoverStoryPack` REAL do app. NÃO reimplementa o recovery. NÃO fabrica `READY` (o READY, se
 * vier, é do recovery). Toca APENAS os `storyId` selecionados; nunca apaga todos os packs.
 *
 * ⚠️ GATE: tudo aqui só executa quando `isRecoveryLabEnabled()` (= `isPackSandboxDevEnabled()`)
 * é true — DEV (`__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX==='true'`) ou QA release-safe
 * (RELEASE_PACK_QA quádruplo gate). Com o gate falso, NADA é escrito.
 *
 * Os arquivos de conteúdo são pequenos textos SINTÉTICOS (o recovery valida sha256, não formato
 * de imagem): o objetivo é observar a PROMOÇÃO do recovery, não renderizar. A restauração limpa.
 */
import * as FileSystem from 'expo-file-system/legacy';
import {
  getPackLocalDir,
  getPackTempDir,
  getPackIndex,
  setPackEntry,
  getPackEntry,
  clearPackEntry,
  PACK_STATUS,
} from './packStorageService';
import { buildPublishMarker, MARKER_FILENAME, selectStoryPackDirs } from './packPublishMarker';
import { validatePackManifest, computeFileSha256 } from './packIntegrityService';
import { recoverStoryPack } from './packRecoveryService';
import { isPackSandboxDevEnabled } from './packSandboxDevService';
import { warn } from '../utils/logger';

/** Reusa o gate central da ferramenta de packs — PRODUÇÃO nunca liga. */
export function isRecoveryLabEnabled() {
  return isPackSandboxDevEnabled();
}

export const RECOVERY_LAB_PRESETS = Object.freeze([
  { id: 'P1', nome: 'Órfão recuperável', descricao: 'Conteúdo íntegro + manifesto + marcador; índice em downloading (não-ready).' },
  { id: 'P2', nome: 'Versão atual e antiga válidas', descricao: 'Duas versões íntegras no disco; índice aponta a atual.' },
  { id: 'P3', nome: 'Versão atual corrompida', descricao: 'Antiga íntegra + atual corrompida (hash divergente); índice aponta a corrompida.' },
  { id: 'P4', nome: 'Sem índice', descricao: 'Pack íntegro + marcador, mas SEM entrada no índice.' },
  { id: 'P5', nome: 'Duas histórias recuperáveis', descricao: 'Estados interrompidos para dois storyId diferentes.' },
  { id: 'P6', nome: 'Parcial sem marcador', descricao: 'Conteúdo em .tmp SEM marcador válido — prova o descarte seguro.' },
]);

const KINDS = ['scene'];
const ARQ = [
  { kind: 'scene', path: 'scenes/01.webp' },
  { kind: 'scene', path: 'scenes/02.webp' },
];
const APP_VERSION = '1.0.0';

/** Raiz local dos packs (`documentDirectory/packs/`). null se o FS não estiver pronto. */
function packsRoot() {
  const doc = FileSystem.documentDirectory;
  return doc ? `${doc}packs/` : null;
}
const dirParent = (uri) => uri.slice(0, uri.lastIndexOf('/', uri.length - 2) + 1);

/**
 * Escreve uma versão ÍNTEGRA (ou corrompida) no disco: arquivos sintéticos + manifest.json (schema
 * real) + `.ptf-publish.json` (buildPublishMarker real). `corromper` troca o conteúdo do disco
 * mantendo o MESMO tamanho e o sha256 ÍNTEGRO no manifesto (falha no hash, não no tamanho).
 */
async function semearVersao(storyId, version, { corromper = false } = {}) {
  const localDir = getPackLocalDir(storyId, version);
  if (!localDir) throw new Error('documentDirectory indisponível');
  await FileSystem.deleteAsync(localDir, { idempotent: true });
  await FileSystem.makeDirectoryAsync(`${localDir}scenes/`, { intermediates: true });

  const files = [];
  let totalBytes = 0;
  for (const a of ARQ) {
    const uri = `${localDir}${a.path}`;
    const integro = `PTF-LAB|${storyId}|${version}|${a.path}|ok`;   // conteúdo sintético íntegro
    await FileSystem.writeAsStringAsync(uri, integro);
    const h = await computeFileSha256(uri);                          // sha256 REAL do íntegro
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    if (!h.ok) throw new Error(`sha256 falhou em ${a.path}: ${h.reason}`);
    if (corromper) {
      // mesmo tamanho, último char trocado → hash difere, tamanho igual (isola a checagem de HASH)
      const corr = `${integro.slice(0, -1)}${integro.slice(-1) === 'X' ? 'Y' : 'X'}`;
      await FileSystem.writeAsStringAsync(uri, corr);
    }
    files.push({ kind: a.kind, path: a.path, bytes: info.size ?? 0, sha256: h.sha256 });
    totalBytes += info.size ?? 0;
  }

  const manifest = {
    schemaVersion: 1, id: storyId, version, type: 'story', minAppVersion: APP_VERSION,
    totalBytes, files, metadata: { storyId, title: storyId, language: 'pt-BR' },
  };
  // fidelidade: o manifesto que escrevemos passa no validador REAL do app
  const mv = validatePackManifest(manifest, { appVersion: APP_VERSION });
  if (!mv.ok) throw new Error(`manifesto sintético inválido: ${mv.errors.join(' | ')}`);
  const manifestText = JSON.stringify(manifest);
  await FileSystem.writeAsStringAsync(`${localDir}manifest.json`, manifestText);
  const mh = await computeFileSha256(`${localDir}manifest.json`);    // âncora REAL do marcador
  if (!mh.ok) throw new Error(`sha256 do manifest falhou: ${mh.reason}`);
  const marker = buildPublishMarker({ storyId, version, manifestSha256: mh.sha256, manifestPath: 'manifest.json', kinds: KINDS, appVersion: APP_VERSION });
  await FileSystem.writeAsStringAsync(`${localDir}${MARKER_FILENAME}`, JSON.stringify(marker));
  return { localDir, totalBytes };
}

/** P6: conteúdo em `.tmp` (parcial), SEM marcador — prova o descarte seguro (não recuperável). */
async function semearParcialSemMarcador(storyId, version) {
  const tempDir = getPackTempDir(storyId, version);
  const localDir = getPackLocalDir(storyId, version);
  if (!tempDir || !localDir) throw new Error('documentDirectory indisponível');
  await FileSystem.deleteAsync(tempDir, { idempotent: true });
  await FileSystem.deleteAsync(localDir, { idempotent: true });   // NÃO há diretório final íntegro
  await FileSystem.makeDirectoryAsync(`${tempDir}scenes/`, { intermediates: true });
  await FileSystem.writeAsStringAsync(`${tempDir}${ARQ[0].path}`, 'PARCIAL-SEM-MARCADOR');  // só 1 arquivo, no .tmp
  return { tempDir };
}

/** Limpa APENAS uma história: todos os diretórios de versão dela + a entrada do índice. Idempotente. */
async function limparHistoria(storyId) {
  const root = packsRoot();
  if (root) {
    let names = [];
    try { names = await FileSystem.readDirectoryAsync(root); } catch { names = []; }
    for (const d of selectStoryPackDirs(names, storyId)) {          // igualdade de storyId, nunca prefixo
      try { await FileSystem.deleteAsync(`${root}${d.name}/`, { idempotent: true }); } catch { /* noop */ }
    }
    // limpa também o `.tmp` das versões conhecidas
    for (const v of ['1.0.0', '2.0.0', '3.0.0']) {
      const t = getPackTempDir(storyId, v);
      if (t) { try { await FileSystem.deleteAsync(t, { idempotent: true }); } catch { /* noop */ } }
    }
  }
  await clearPackEntry(storyId);
}

/** Escreve o índice em estado NÃO-READY para a história (downloading), preservando as demais. */
async function indexarNaoReady(storyId, version) {
  await setPackEntry(storyId, { version, status: PACK_STATUS.DOWNLOADING, errorMessage: null });
}

/**
 * Aplica um preset determinístico. Limpa SÓ os storyId envolvidos antes de semear.
 * @param {'P1'|'P2'|'P3'|'P4'|'P5'|'P6'} presetId
 * @param {{storyId:string, version:string, prevVersion?:string, otherStoryId?:string}} opts
 * @returns {Promise<{ok:boolean, reason?:string, envolvidos?:string[]}>}
 */
export async function applyRecoveryLabPreset(presetId, opts = {}) {
  if (!isRecoveryLabEnabled()) return { ok: false, reason: 'gate desligado' };
  const storyId = opts.storyId;
  const version = opts.version || '2.0.0';
  const prevVersion = opts.prevVersion || '1.0.0';
  const otherStoryId = opts.otherStoryId;
  if (!storyId || !/^[a-z0-9_]+$/.test(storyId)) return { ok: false, reason: 'storyId inválido (slug [a-z0-9_])' };
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version) || !/^[0-9]+\.[0-9]+\.[0-9]+$/.test(prevVersion)) {
    return { ok: false, reason: 'versão inválida (semver x.y.z)' };
  }
  const envolvidos = presetId === 'P5' ? [storyId, otherStoryId] : [storyId];
  if (presetId === 'P5' && (!otherStoryId || !/^[a-z0-9_]+$/.test(otherStoryId) || otherStoryId === storyId)) {
    return { ok: false, reason: 'P5 exige um segundo storyId distinto' };
  }
  try {
    for (const sid of envolvidos) await limparHistoria(sid);        // isolamento: só os envolvidos
    switch (presetId) {
      case 'P1':
        await semearVersao(storyId, version);
        await indexarNaoReady(storyId, version);
        break;
      case 'P2':
        await semearVersao(storyId, prevVersion);
        await semearVersao(storyId, version);
        await indexarNaoReady(storyId, version);
        break;
      case 'P3':
        await semearVersao(storyId, prevVersion);                   // antiga íntegra
        await semearVersao(storyId, version, { corromper: true });  // atual corrompida
        await indexarNaoReady(storyId, version);                    // índice aponta a corrompida
        break;
      case 'P4':
        await semearVersao(storyId, version);
        await clearPackEntry(storyId);                              // remove a entrada do índice
        break;
      case 'P5':
        await semearVersao(storyId, version);
        await indexarNaoReady(storyId, version);
        await semearVersao(otherStoryId, version);
        await indexarNaoReady(otherStoryId, version);
        break;
      case 'P6':
        await semearParcialSemMarcador(storyId, version);
        await indexarNaoReady(storyId, version);
        break;
      default:
        return { ok: false, reason: `preset desconhecido: ${presetId}` };
    }
    return { ok: true, envolvidos };
  } catch (e) {
    warn('applyRecoveryLabPreset:', e);
    return { ok: false, reason: String(e?.message || e) };
  }
}

/** Observabilidade read-only: índice + versões no disco (manifesto/marcador/arquivos) por história. */
export async function inspectRecoveryState(storyIds) {
  if (!isRecoveryLabEnabled()) return { enabled: false };
  const index = await getPackIndex();
  const root = packsRoot();
  let names = [];
  if (root) { try { names = await FileSystem.readDirectoryAsync(root); } catch { names = []; } }
  const historias = {};
  for (const sid of storyIds || []) {
    const entry = index[sid] || null;
    const versoes = [];
    for (const d of selectStoryPackDirs(names, sid)) {
      const dir = getPackLocalDir(sid, d.version);
      const man = await FileSystem.getInfoAsync(`${dir}manifest.json`).catch(() => ({ exists: false }));
      const mk = await FileSystem.getInfoAsync(`${dir}${MARKER_FILENAME}`).catch(() => ({ exists: false }));
      const arquivos = [];
      for (const a of ARQ) {
        const info = await FileSystem.getInfoAsync(`${dir}${a.path}`, { size: true }).catch(() => ({ exists: false }));
        arquivos.push({ path: a.path, exists: !!info.exists, size: info.size ?? 0 });
      }
      versoes.push({ version: d.version, temManifest: !!man.exists, temMarcador: !!mk.exists, arquivos });
    }
    const tempDir = getPackTempDir(sid, entry?.version || '2.0.0');
    const temp = tempDir ? await FileSystem.getInfoAsync(tempDir).catch(() => ({ exists: false })) : { exists: false };
    historias[sid] = {
      indexEntry: entry ? { version: entry.version, status: entry.status, errorMessage: entry.errorMessage ?? null } : null,
      versoesNoDisco: versoes,
      tmpPresente: !!temp.exists,
    };
  }
  return { enabled: true, when: new Date().toISOString(), historias };
}

/**
 * Executa o RECOVERY REAL do app (recoverStoryPack) para uma história, com estado antes/depois.
 * Não reimplementa nada — chama o mesmo serviço que o downloader usa (sob demanda).
 */
export async function runRecoveryReal(storyId, otherStoryId) {
  if (!isRecoveryLabEnabled()) return { enabled: false };
  const ids = otherStoryId ? [storyId, otherStoryId] : [storyId];
  const antes = await inspectRecoveryState(ids);
  const resultados = {};
  const outrasAntes = {};
  for (const sid of ids) outrasAntes[sid] = await getPackEntry(sid);
  for (const sid of ids) {
    const r = await recoverStoryPack({ storyId: sid, requestedKinds: KINDS, appVersion: APP_VERSION });
    resultados[sid] = { recovered: r.recovered === true, ambiguous: r.ambiguous === true, reason: r.reason || null, version: r.version || null };
  }
  const depois = await inspectRecoveryState(ids);
  const entryFinal = {};
  for (const sid of ids) entryFinal[sid] = await getPackEntry(sid);
  return { enabled: true, when: new Date().toISOString(), antes, resultados, depois, entryFinal };
}

/** Restauração idempotente: limpa APENAS as histórias de teste indicadas. Não toca progresso/perfil. */
export async function cleanupRecoveryLab(storyIds) {
  if (!isRecoveryLabEnabled()) return { ok: false, reason: 'gate desligado' };
  try {
    for (const sid of storyIds || []) await limparHistoria(sid);
    return { ok: true, limpos: storyIds || [] };
  } catch (e) {
    warn('cleanupRecoveryLab:', e);
    return { ok: false, reason: String(e?.message || e) };
  }
}
