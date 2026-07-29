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
 * Nos presets P1–P6 os arquivos de conteúdo são pequenos textos SINTÉTICOS (o recovery valida
 * sha256, não formato de imagem): o objetivo é observar a PROMOÇÃO do recovery, não renderizar.
 * A restauração limpa. O modo P7 (fim do arquivo) é o oposto: conteúdo REAL e caminho PÚBLICO.
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
import {
  buildPublishMarker, MARKER_FILENAME, selectStoryPackDirs, validatePublishMarker,
} from './packPublishMarker';
import { validatePackManifest, computeFileSha256 } from './packIntegrityService';
import { recoverStoryPack } from './packRecoveryService';
import { clearStoryPackInstall, getStoryPackInstallSnapshot } from './packInstallRegistry';
import { downloadStoryPackScenesFromGlobalManifest, inFlightInstallCount } from './packDownloadService';
import { fetchGlobalContentManifest, getPackFromGlobalManifest } from './globalManifestService';
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
  // LP2.1a-ii-01F: invalida o snapshot global junto com a remoção (typeof-guard p/ o harness).
  if (typeof clearStoryPackInstall === 'function') clearStoryPackInstall(storyId);
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
        if (typeof clearStoryPackInstall === 'function') clearStoryPackInstall(storyId);   // LP2.1a-ii-01F
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

/* ═══════════════════ P7 · RECOVERY REAL VIA PREFLIGHT (§10.8) ═══════════════════
 *
 * Os presets P1–P6 acima usam conteúdo SINTÉTICO e chamam `recoverStoryPack` DIRETO: servem para
 * observar a decisão do recovery isolado, não o caminho que o aplicativo percorre. O P7 é outro
 * trabalho, e é o preparo do §10.8:
 *
 *   1. instala um pack REAL pelo downloader PÚBLICO (identidade, bytes e marcador de verdade);
 *   2. transforma essa instalação no ÓRFÃO EXATO do bloco C — conteúdo íntegro no disco, entrada
 *      READY removida do índice — sem apagar um byte nem tocar em outra história;
 *   3. depois chama de novo o MESMO downloader público, exercitando o preflight de produção que,
 *      no ramo "coincidente + ancorado + não-READY", chama `recoverStoryPack` por dentro.
 *
 * A prova principal NUNCA chama `recoverStoryPack` diretamente: se chamasse, provaria o recovery
 * isolado (o que P1–P6 já fazem) e não o preflight real. O sinal de sucesso é o campo público
 * `recovered:true` do retorno somado à AUSÊNCIA de qualquer evento `downloading`/`verifying` no
 * `onProgress` — o caminho de recovery emite um único evento `ready`.
 *
 * Nada aqui grava conteúdo de arquivo nem credencial: o estado guarda apenas tamanhos, sha256
 * e a URL base sem query string.
 */

/** Kinds exigidos pelo modo real. O marcador guarda os kinds pedidos; preparar e recuperar têm de usar os MESMOS. */
export const REAL_RECOVERY_KINDS = ['cover', 'scene', 'coloring', 'audio'];

/** Vocabulário fechado de vereditos do painel P7. */
export const P7_VERDICTS = {
  READY_FOR_RESTART: 'READY_FOR_RESTART',
  RECOVERY_APPROVED: 'RECOVERY_APPROVED',
  RECOVERY_REPROVED: 'RECOVERY_REPROVED',
  TARGET_NOT_SAFE: 'TARGET_NOT_SAFE',
  CLEANED: 'CLEANED',
};

const P7_SHA256_RE = /^[a-f0-9]{64}$/;
const P7_SLUG_RE = /^[a-z0-9_]+$/;
const P7_SEMVER_RE = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const P7_DIRNAME = 'ptf-dev-recovery-p7';
const P7_STATE_SCHEMA = 1;

/** Diretório do estado interno da ferramenta. Fora do namespace de packs — a limpeza o remove por inteiro. */
function p7Dir() {
  const doc = FileSystem.documentDirectory;
  return doc ? `${doc}${P7_DIRNAME}/` : null;
}
function p7Uri(storyId) {
  const d = p7Dir();
  return d && P7_SLUG_RE.test(String(storyId || '')) ? `${d}${storyId}.json` : null;
}

/** Estado persistido em arquivo (não AsyncStorage): sobrevive a fechar/reabrir o app, some na limpeza. */
async function lerEstadoP7(storyId) {
  const uri = p7Uri(storyId);
  if (!uri) return null;
  try {
    const txt = await FileSystem.readAsStringAsync(uri);
    const st = JSON.parse(txt);
    return st && st.schema === P7_STATE_SCHEMA ? st : null;
  } catch { return null; }
}
async function gravarEstadoP7(storyId, estado) {
  const dir = p7Dir();
  const uri = p7Uri(storyId);
  if (!dir || !uri) throw new Error('documentDirectory indisponível');
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(estado));
}
async function apagarEstadoP7(storyId) {
  const uri = p7Uri(storyId);
  if (!uri) return;
  try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch { /* idempotente */ }
}

/** URL base sem query string: o painel é copiável, então nenhuma credencial de assinatura aparece nele. */
function baseUrlPublica(u) {
  const s = String(u || '');
  const i = s.indexOf('?');
  return i >= 0 ? s.slice(0, i) : s;
}

/** Estado do tempDir da versão: o órfão só é fiel se não houver instalação pendente ao lado. */
async function estadoTempDir(storyId, version) {
  const tempDir = getPackTempDir(storyId, version);
  if (!tempDir) return { tempDir: null, exists: false, entries: 0 };
  const info = await FileSystem.getInfoAsync(tempDir).catch(() => ({ exists: false }));
  if (!info.exists) return { tempDir, exists: false, entries: 0 };
  let names = [];
  try { names = await FileSystem.readDirectoryAsync(tempDir); } catch { names = []; }
  return { tempDir, exists: true, entries: names.length };
}

/**
 * Fotografia READ-ONLY do pack no disco: manifesto, marcador, lista de arquivos, bytes e sha256 reais.
 * É o que permite provar depois que o preflight não recriou nada. Custa I/O (hash de mídia real) —
 * aceitável numa ferramenta DEV, é o mesmo hash que a instalação já paga na verificação.
 */
async function fotografarPackNoDisco(storyId, version, requestedKinds) {
  const localDir = getPackLocalDir(storyId, version);
  const foto = {
    localDir: localDir || null,
    localDirExists: false,
    manifestExists: false,
    markerExists: false,
    markerValid: false,
    markerErrors: [],
    manifestSha256: null,
    markerSha256: null,
    fileCount: 0,
    totalBytes: 0,
    files: {},
    missing: [],
  };
  if (!localDir) return foto;
  const dirInfo = await FileSystem.getInfoAsync(localDir).catch(() => ({ exists: false }));
  foto.localDirExists = !!dirInfo.exists;
  if (!foto.localDirExists) return foto;

  let manifest = null;
  try {
    manifest = JSON.parse(await FileSystem.readAsStringAsync(`${localDir}manifest.json`));
    foto.manifestExists = true;
  } catch { return foto; }

  const mh = await computeFileSha256(`${localDir}manifest.json`);
  foto.manifestSha256 = mh && mh.ok ? String(mh.sha256).toLowerCase() : null;

  let marker = null;
  try {
    marker = JSON.parse(await FileSystem.readAsStringAsync(`${localDir}${MARKER_FILENAME}`));
    foto.markerExists = true;
    const kh = await computeFileSha256(`${localDir}${MARKER_FILENAME}`);
    foto.markerSha256 = kh && kh.ok ? String(kh.sha256).toLowerCase() : null;
  } catch { marker = null; }

  if (marker) {
    const v = validatePublishMarker(marker, {
      storyId,
      dirStoryId: storyId,
      dirVersion: version,
      manifestSha256: foto.manifestSha256,
      manifest,
      requestedKinds: [...(requestedKinds || REAL_RECOVERY_KINDS)],
    });
    foto.markerValid = v.ok === true;
    foto.markerErrors = v.errors || [];
  }

  for (const f of Array.isArray(manifest.files) ? manifest.files : []) {
    if (!f || typeof f.path !== 'string') continue;
    const uri = `${localDir}${f.path}`;
    const info = await FileSystem.getInfoAsync(uri, { size: true }).catch(() => ({ exists: false }));
    if (!info.exists) { foto.missing.push(f.path); continue; }
    const h = await computeFileSha256(uri);
    foto.files[f.path] = { bytes: info.size ?? 0, sha256: h && h.ok ? String(h.sha256).toLowerCase() : null };
    foto.fileCount += 1;
    foto.totalBytes += info.size ?? 0;
  }
  return foto;
}

/** Mesma lista de caminhos e mesma contagem: prova que nenhum arquivo foi recriado ou removido. */
function mesmaListaDeArquivos(a, b) {
  if (!a || !b) return false;
  const ka = Object.keys(a.files || {}).sort();
  const kb = Object.keys(b.files || {}).sort();
  return ka.length === kb.length && ka.join('|') === kb.join('|') && a.fileCount === b.fileCount;
}

/** Todos os sha256/bytes idênticos, mais manifesto e marcador: prova que nenhum byte mudou. */
function mesmosHashes(a, b) {
  if (!mesmaListaDeArquivos(a, b)) return false;
  for (const k of Object.keys(a.files)) {
    const x = a.files[k];
    const y = b.files[k];
    if (!x || !y || x.bytes !== y.bytes || x.sha256 == null || x.sha256 !== y.sha256) return false;
  }
  return a.manifestSha256 != null && a.manifestSha256 === b.manifestSha256
    && a.markerSha256 != null && a.markerSha256 === b.markerSha256
    && a.totalBytes === b.totalBytes;
}

/** Resolve a identidade real no manifesto global — READ-ONLY, sem tocar em disco ou índice. */
async function resolverAlvoReal({ storyId, globalManifestUrl, appVersion }) {
  const gm = await fetchGlobalContentManifest(globalManifestUrl, { appVersion });
  if (!gm || !gm.ok) {
    return { ok: false, reason: `manifesto global inválido: ${((gm && gm.errors) || ['sem detalhe']).join(' | ')}` };
  }
  const gp = getPackFromGlobalManifest(gm.data, storyId);
  if (!gp || !gp.ok) {
    return { ok: false, reason: `pack ausente no manifesto global: ${((gp && gp.errors) || ['sem detalhe']).join(' | ')}` };
  }
  const p = gp.data;
  const sha = typeof p.manifestSha256 === 'string' ? p.manifestSha256.toLowerCase() : null;
  const baseCru = String(p.baseUrl || '');
  const base = baseUrlPublica(baseCru);
  const identidade = {
    storyId,
    version: p.version || null,
    baseUrl: base,
    baseUrlQueryOmitida: base !== baseCru,
    manifestPath: p.manifestPath || null,
    manifestSha256: sha,
    requestedKinds: [...REAL_RECOVERY_KINDS],
    appVersion,
    mediaKinds: Array.isArray(p.mediaKinds) ? [...p.mediaKinds] : [],
    access: p.access || null,
    requiresAppUpdate: p.requiresAppUpdate === true,
  };
  // Mesma forma da chave canônica de single-flight do downloader, com a baseUrl já saneada acima.
  identidade.resolvedInstallKey = JSON.stringify([
    identidade.storyId, identidade.version, identidade.baseUrl, identidade.manifestPath,
    identidade.manifestSha256, [...identidade.requestedKinds].sort(), identidade.appVersion,
  ]);
  return { ok: true, identidade };
}

/**
 * "Validar alvo" — diz se a história REAL pode virar cobaia sem destruir nada do proprietário.
 * Bloqueia: storyId sintético, pack sem âncora, kinds faltando, entrada já no índice,
 * diretório da versão já existente e estado de teste anterior não limpo.
 */
export async function validateRealRecoveryTarget(opts = {}) {
  if (!isRecoveryLabEnabled()) return { enabled: false, ok: false, reason: 'gate desligado' };
  const storyId = String(opts.storyId || '').trim();
  const globalManifestUrl = String(opts.globalManifestUrl || '').trim();
  const appVersion = String(opts.appVersion || APP_VERSION);
  const problemas = [];

  if (!P7_SLUG_RE.test(storyId)) problemas.push('storyId inválido — use o id real da história ([a-z0-9_]).');
  // O modo real recusa as cobaias sintéticas de P1–P6: elas não têm bytes de mídia utilizáveis.
  if (/^recovery_lab/.test(storyId)) problemas.push('storyId sintético do laboratório não é aceito no modo real.');
  if (!globalManifestUrl) problemas.push('URL do manifesto global ausente.');
  if (problemas.length) {
    return { enabled: true, ok: false, verdict: P7_VERDICTS.TARGET_NOT_SAFE, storyId, problemas, identidade: null };
  }

  const res = await resolverAlvoReal({ storyId, globalManifestUrl, appVersion });
  if (!res.ok) {
    return { enabled: true, ok: false, verdict: P7_VERDICTS.TARGET_NOT_SAFE, storyId, problemas: [res.reason], identidade: null };
  }
  const id = res.identidade;

  if (!P7_SEMVER_RE.test(String(id.version || ''))) problemas.push(`versão inválida no manifesto global: ${id.version}`);
  // Sem manifestSha256 não há âncora: o preflight não reconhece o órfão e baixaria tudo de novo.
  if (!id.manifestSha256 || !P7_SHA256_RE.test(id.manifestSha256)) {
    problemas.push('pack sem manifestSha256 no manifesto global — sem âncora o preflight não recupera, ele rebaixa.');
  }
  if (id.requiresAppUpdate) problemas.push('pack exige app mais novo (requires_app_update).');
  const faltando = REAL_RECOVERY_KINDS.filter((k) => !id.mediaKinds.includes(k));
  if (faltando.length) {
    problemas.push(`o pack não declara os kinds exigidos (${faltando.join(', ')}) — o downloader recusa kind pedido ausente.`);
  }

  const entryAtual = await getPackEntry(storyId);
  if (entryAtual) {
    problemas.push(entryAtual.status === PACK_STATUS.READY
      ? `história já instalada (índice ${entryAtual.status}@${entryAtual.version}) — a preparação não destrói instalação existente.`
      : `índice já tem entrada (${entryAtual.status}@${entryAtual.version}) — limpe antes de preparar.`);
  }
  const localDir = id.version ? getPackLocalDir(storyId, id.version) : null;
  const dirInfo = localDir ? await FileSystem.getInfoAsync(localDir).catch(() => ({ exists: false })) : { exists: false };
  if (dirInfo.exists) problemas.push(`diretório final da versão ${id.version} já existe — a preparação não sobrescreve conteúdo.`);
  const anterior = await lerEstadoP7(storyId);
  if (anterior) problemas.push('estado de teste P7 anterior não foi limpo — use "Limpar teste" primeiro.');

  const ok = problemas.length === 0;
  return {
    enabled: true,
    ok,
    verdict: ok ? null : P7_VERDICTS.TARGET_NOT_SAFE,
    storyId,
    identidade: id,
    problemas,
    entryAtual: entryAtual ? { status: entryAtual.status, version: entryAtual.version } : null,
    localDir,
    localDirExists: !!dirInfo.exists,
  };
}

/**
 * "Preparar órfão real" — instala pelo downloader PÚBLICO, fotografa o disco e remove SOMENTE a
 * entrada do índice. Não usa `limparHistoria` nem o Reset do sandbox: os dois apagam o diretório,
 * que é exatamente o que precisa sobreviver.
 */
export async function prepareRealOrphan(opts = {}) {
  if (!isRecoveryLabEnabled()) return { enabled: false, ok: false, reason: 'gate desligado' };
  const val = await validateRealRecoveryTarget(opts);
  if (!val.ok) {
    return {
      enabled: true, ok: false, verdict: P7_VERDICTS.TARGET_NOT_SAFE, orphanPrepared: false,
      storyId: val.storyId, identidade: val.identidade || null, problemas: val.problemas || [],
      reason: (val.problemas || [])[0] || val.reason || 'alvo não seguro',
    };
  }
  const id = val.identidade;
  const storyId = id.storyId;
  const version = id.version;
  const globalManifestUrl = String(opts.globalManifestUrl || '').trim();
  const installEvents = [];

  // 1) Instalação de preparação pelo MESMO caminho público de produção — bytes e marcador reais.
  const inst = await downloadStoryPackScenesFromGlobalManifest({
    storyId,
    globalManifestUrl,
    appVersion: id.appVersion,
    requestedKinds: [...REAL_RECOVERY_KINDS],
    onProgress: (p) => { if (p && p.status) installEvents.push(String(p.status)); },
  });
  if (!inst || inst.ok !== true) {
    return {
      enabled: true, ok: false, verdict: P7_VERDICTS.TARGET_NOT_SAFE, orphanPrepared: false,
      storyId, identidade: id, installEvents,
      reason: `instalação de preparação falhou: ${(inst && inst.reason) || 'sem detalhe'}`,
    };
  }

  // 2) Confirma READY no índice e conteúdo íntegro no disco ANTES de criar o órfão.
  const entryPos = await getPackEntry(storyId);
  const indexReadyAposInstalar = !!entryPos && entryPos.status === PACK_STATUS.READY && entryPos.version === version;
  const baseline = await fotografarPackNoDisco(storyId, version, REAL_RECOVERY_KINDS);
  const conteudoOk = indexReadyAposInstalar && baseline.localDirExists && baseline.manifestExists
    && baseline.markerExists && baseline.markerValid && baseline.missing.length === 0 && baseline.fileCount > 0;
  if (!conteudoOk) {
    return {
      enabled: true, ok: false, verdict: P7_VERDICTS.TARGET_NOT_SAFE, orphanPrepared: false,
      storyId, identidade: id, installEvents, indexReadyAposInstalar, baseline,
      reason: 'instalação de preparação incompleta (índice, marcador ou arquivos) — nada foi órfanizado.',
    };
  }

  // 3) O corte cirúrgico: só o índice some. `clearPackEntry` não toca em arquivo.
  await clearPackEntry(storyId);
  // 4) E só o snapshot observável do registro. `clearStoryPackInstall` não toca em disco nem índice.
  clearStoryPackInstall(storyId);

  // 5) Confirmação do estado órfão.
  const entryDepois = await getPackEntry(storyId);
  const fotoDepois = await fotografarPackNoDisco(storyId, version, REAL_RECOVERY_KINDS);
  const tmp = await estadoTempDir(storyId, version);
  const filesUnchanged = mesmosHashes(baseline, fotoDepois);
  const tempLimpo = !tmp.exists || tmp.entries === 0;
  const orphanPrepared = !entryDepois && fotoDepois.localDirExists && fotoDepois.markerValid
    && filesUnchanged && tempLimpo;

  if (orphanPrepared) {
    await gravarEstadoP7(storyId, {
      schema: P7_STATE_SCHEMA,
      storyId,
      version,
      identidade: id,
      baseline,
      installEvents,
      preparedAt: new Date().toISOString(),
    });
  }

  return {
    enabled: true,
    ok: orphanPrepared,
    verdict: orphanPrepared ? P7_VERDICTS.READY_FOR_RESTART : P7_VERDICTS.RECOVERY_REPROVED,
    storyId,
    identidade: id,
    orphanPrepared,
    indexReady: !!entryDepois,
    localDirExists: fotoDepois.localDirExists,
    markerValid: fotoDepois.markerValid,
    filesUnchanged,
    installEvents,
    indexReadyAposInstalar,
    fileCount: fotoDepois.fileCount,
    totalBytes: fotoDepois.totalBytes,
    localDir: fotoDepois.localDir,
    tempDir: tmp,
    baseline,
    instrucao: orphanPrepared
      ? 'Feche o aplicativo por completo e reabra ANTES de "Exercitar preflight real" — o órfão precisa sobreviver ao restart.'
      : 'Órfão não confirmado: use "Limpar teste" e refaça.',
  };
}

/** "Inspecionar órfão" — leitura pura do estado atual, sem efeito colateral. Serve depois do restart. */
export async function inspectRealOrphan(opts = {}) {
  if (!isRecoveryLabEnabled()) return { enabled: false };
  const storyId = String(opts.storyId || '').trim();
  if (!P7_SLUG_RE.test(storyId)) return { enabled: true, ok: false, reason: 'storyId inválido' };
  const estado = await lerEstadoP7(storyId);
  const version = (estado && estado.version) || (P7_SEMVER_RE.test(String(opts.version || '')) ? String(opts.version) : null);
  const entry = await getPackEntry(storyId);
  const foto = version ? await fotografarPackNoDisco(storyId, version, REAL_RECOVERY_KINDS) : null;
  const tmp = version ? await estadoTempDir(storyId, version) : null;
  const filesUnchanged = estado && foto ? mesmosHashes(estado.baseline, foto) : null;
  const snapshot = getStoryPackInstallSnapshot(storyId);
  const indexReady = !!entry && entry.status === PACK_STATUS.READY;

  let verdict = null;
  if (!estado && (!foto || !foto.localDirExists)) verdict = P7_VERDICTS.CLEANED;
  else if (filesUnchanged === false) verdict = P7_VERDICTS.RECOVERY_REPROVED;
  else if (indexReady) verdict = P7_VERDICTS.RECOVERY_APPROVED;
  else if (estado && foto && foto.localDirExists && foto.markerValid) verdict = P7_VERDICTS.READY_FOR_RESTART;
  else verdict = P7_VERDICTS.RECOVERY_REPROVED;

  return {
    enabled: true,
    ok: true,
    verdict,
    storyId,
    version,
    temEstadoP7: !!estado,
    preparedAt: (estado && estado.preparedAt) || null,
    indexEntry: entry ? { status: entry.status, version: entry.version } : null,
    indexReady,
    localDir: foto ? foto.localDir : null,
    localDirExists: !!(foto && foto.localDirExists),
    markerValid: !!(foto && foto.markerValid),
    markerErrors: (foto && foto.markerErrors) || [],
    fileCount: foto ? foto.fileCount : 0,
    totalBytes: foto ? foto.totalBytes : 0,
    missing: (foto && foto.missing) || [],
    filesUnchanged,
    tempDir: tmp,
    registrySnapshot: snapshot ? { status: snapshot.status, phase: snapshot.phase || null } : null,
    foto,
  };
}

/**
 * "Exercitar preflight real" — a prova principal. Chama o downloader PÚBLICO oficial e avalia os
 * 12 critérios. Não chama `recoverStoryPack`: o recovery tem de ser alcançado POR DENTRO do
 * preflight de produção, senão a prova não vale.
 */
export async function exerciseRealPreflight(opts = {}) {
  if (!isRecoveryLabEnabled()) return { enabled: false, ok: false, reason: 'gate desligado' };
  const storyId = String(opts.storyId || '').trim();
  const globalManifestUrl = String(opts.globalManifestUrl || '').trim();
  if (!P7_SLUG_RE.test(storyId) || !globalManifestUrl) {
    return { enabled: true, ok: false, verdict: P7_VERDICTS.RECOVERY_REPROVED, reason: 'storyId ou URL do manifesto global inválidos' };
  }
  const estado = await lerEstadoP7(storyId);
  if (!estado || !estado.baseline || !estado.identidade) {
    return {
      enabled: true, ok: false, verdict: P7_VERDICTS.RECOVERY_REPROVED, storyId,
      reason: 'sem estado de preparação — rode "Preparar órfão real" antes.',
    };
  }
  const version = estado.version;
  const appVersion = String(opts.appVersion || estado.identidade.appVersion || APP_VERSION);

  const entryAntes = await getPackEntry(storyId);
  const fotoAntes = await fotografarPackNoDisco(storyId, version, REAL_RECOVERY_KINDS);
  const tmpAntes = await estadoTempDir(storyId, version);

  const progressEvents = [];
  const resultado = await downloadStoryPackScenesFromGlobalManifest({
    storyId,
    globalManifestUrl,
    appVersion,
    requestedKinds: [...REAL_RECOVERY_KINDS],
    onProgress: (p) => {
      progressEvents.push({
        status: (p && p.status) || null,
        kind: (p && p.kind) || null,
        downloadedBytes: (p && p.downloadedBytes) ?? null,
        totalBytes: (p && p.totalBytes) ?? null,
      });
    },
  });

  const entryDepois = await getPackEntry(storyId);
  const fotoDepois = await fotografarPackNoDisco(storyId, version, REAL_RECOVERY_KINDS);
  const tmpDepois = await estadoTempDir(storyId, version);
  const snapshot = getStoryPackInstallSnapshot(storyId);
  const statuses = progressEvents.map((e) => String(e.status || ''));

  const criterios = {
    okTrue: resultado && resultado.ok === true,
    recuperado: !!resultado && resultado.recovered === true,
    indiceFinalReady: !!entryDepois && entryDepois.status === PACK_STATUS.READY,
    mesmaVersao: !!entryDepois && entryDepois.version === version && !!resultado && resultado.version === version,
    // As duas provas de "não baixou de novo": o caminho de recovery emite UM único evento `ready`.
    semDownloading: !statuses.includes(PACK_STATUS.DOWNLOADING),
    semVerifying: !statuses.includes(PACK_STATUS.VERIFYING),
    nenhumArquivoRecriado: mesmaListaDeArquivos(estado.baseline, fotoDepois) && fotoDepois.missing.length === 0,
    hashesIdenticos: mesmosHashes(estado.baseline, fotoDepois),
    marcadorValido: fotoDepois.markerValid === true,
    tempSemSegundaInstalacao: !tmpDepois.exists || tmpDepois.entries === 0,
    registroFinalReady: !!snapshot && snapshot.status === 'ready',
    nenhumaOperacaoAtiva: inFlightInstallCount() === 0,
  };
  const reprovados = Object.keys(criterios).filter((k) => !criterios[k]);
  const aprovado = reprovados.length === 0;

  return {
    enabled: true,
    ok: aprovado,
    verdict: aprovado ? P7_VERDICTS.RECOVERY_APPROVED : P7_VERDICTS.RECOVERY_REPROVED,
    storyId,
    version,
    resultado: resultado
      ? {
        ok: resultado.ok === true, recovered: resultado.recovered === true, version: resultado.version || null,
        kinds: resultado.kinds || null, counts: resultado.counts || null, sceneCount: resultado.sceneCount ?? null,
        totalBytes: resultado.totalBytes ?? null, reason: resultado.reason || null, code: resultado.code || null,
      }
      : null,
    recovered: !!resultado && resultado.recovered === true,
    entryAntes: entryAntes ? { status: entryAntes.status, version: entryAntes.version } : null,
    entryFinal: entryDepois ? { status: entryDepois.status, version: entryDepois.version } : null,
    progressEvents,
    statuses,
    registrySnapshot: snapshot ? { status: snapshot.status, phase: snapshot.phase || null } : null,
    fotoAntes,
    fotoDepois,
    tempAntes: tmpAntes,
    tempDepois: tmpDepois,
    criterios,
    reprovados,
  };
}

/**
 * "Limpar teste" — remove APENAS o alvo: entrada do índice, snapshot, localDir e tempDir das versões
 * conhecidas e o estado interno. Nunca varre o diretório de packs, então nenhuma outra história é
 * alcançada. Idempotente: rodar duas vezes não é erro.
 */
export async function cleanupRealRecoveryTest(opts = {}) {
  if (!isRecoveryLabEnabled()) return { enabled: false, ok: false, reason: 'gate desligado' };
  const storyId = String(opts.storyId || '').trim();
  if (!P7_SLUG_RE.test(storyId)) return { enabled: true, ok: false, reason: 'storyId inválido' };

  const estado = await lerEstadoP7(storyId);
  const entry = await getPackEntry(storyId);
  const versoes = new Set();
  if (estado && P7_SEMVER_RE.test(String(estado.version || ''))) versoes.add(estado.version);
  if (entry && P7_SEMVER_RE.test(String(entry.version || ''))) versoes.add(entry.version);
  if (P7_SEMVER_RE.test(String(opts.version || ''))) versoes.add(String(opts.version));

  await clearPackEntry(storyId);
  clearStoryPackInstall(storyId);
  for (const v of versoes) {
    const ld = getPackLocalDir(storyId, v);
    const td = getPackTempDir(storyId, v);
    if (ld) { try { await FileSystem.deleteAsync(ld, { idempotent: true }); } catch { /* idempotente */ } }
    if (td) { try { await FileSystem.deleteAsync(td, { idempotent: true }); } catch { /* idempotente */ } }
  }
  await apagarEstadoP7(storyId);

  const entryFinal = await getPackEntry(storyId);
  const restos = [];
  for (const v of versoes) {
    const ld = getPackLocalDir(storyId, v);
    const i = ld ? await FileSystem.getInfoAsync(ld).catch(() => ({ exists: false })) : { exists: false };
    if (i.exists) restos.push(v);
  }
  const ok = !entryFinal && restos.length === 0;
  return {
    enabled: true,
    ok,
    verdict: ok ? P7_VERDICTS.CLEANED : P7_VERDICTS.RECOVERY_REPROVED,
    storyId,
    versoesLimpas: [...versoes],
    restos,
    indexEntry: entryFinal ? { status: entryFinal.status, version: entryFinal.version } : null,
    estadoRemovido: !!estado,
  };
}

/**
 * Painel de diagnóstico do P7: função PURA, só compõe o que as etapas já apuraram. Nenhum conteúdo
 * de arquivo nem credencial entra aqui — apenas identidade, tamanhos, sha256 e vereditos.
 */
export function buildRealRecoveryDiagnostic(estadoTela = {}) {
  const { target, prepare, inspect, preflight, cleanup } = estadoTela;
  const id = (preflight && preflight.identidade) || (prepare && prepare.identidade) || (target && target.identidade) || null;
  const baselineFoto = (prepare && prepare.baseline) || (preflight && preflight.fotoAntes) || (inspect && inspect.foto) || null;
  const finalFoto = (preflight && preflight.fotoDepois) || (inspect && inspect.foto) || null;
  const verdict = (cleanup && cleanup.verdict) || (preflight && preflight.verdict)
    || (inspect && inspect.verdict) || (prepare && prepare.verdict) || (target && target.verdict) || null;

  return {
    storyId: (id && id.storyId) || (target && target.storyId) || (inspect && inspect.storyId) || null,
    version: (id && id.version) || (inspect && inspect.version) || null,
    resolvedInstallKey: (id && id.resolvedInstallKey) || null,
    baseUrl: id ? id.baseUrl : null,
    baseUrlQueryOmitida: id ? id.baseUrlQueryOmitida === true : null,
    manifestSha256: id ? id.manifestSha256 : null,
    requestedKinds: id ? id.requestedKinds : [...REAL_RECOVERY_KINDS],
    indexBefore: target ? target.entryAtual : null,
    indexAfterPrepare: prepare ? { indexReady: prepare.indexReady === true, orphanPrepared: prepare.orphanPrepared === true } : null,
    indexAfterPreflight: preflight ? preflight.entryFinal : (inspect ? inspect.indexEntry : null),
    fileCount: finalFoto ? finalFoto.fileCount : (baselineFoto ? baselineFoto.fileCount : null),
    totalBytes: finalFoto ? finalFoto.totalBytes : (baselineFoto ? baselineFoto.totalBytes : null),
    hashesBefore: baselineFoto ? baselineFoto.files : null,
    hashesAfter: finalFoto ? finalFoto.files : null,
    markerValidBefore: baselineFoto ? baselineFoto.markerValid === true : null,
    markerValidAfter: finalFoto ? finalFoto.markerValid === true : null,
    progressEvents: preflight ? preflight.progressEvents : null,
    recovered: preflight ? preflight.recovered === true : null,
    registrySnapshot: (preflight && preflight.registrySnapshot) || (inspect && inspect.registrySnapshot) || null,
    localDir: (finalFoto && finalFoto.localDir) || (baselineFoto && baselineFoto.localDir) || null,
    tempDir: (preflight && preflight.tempDepois) || (prepare && prepare.tempDir) || (inspect && inspect.tempDir) || null,
    orphanPrepared: prepare ? prepare.orphanPrepared === true : null,
    criterios: preflight ? preflight.criterios : null,
    reprovados: preflight ? preflight.reprovados : null,
    problemas: (target && target.problemas) || null,
    verdict,
  };
}
