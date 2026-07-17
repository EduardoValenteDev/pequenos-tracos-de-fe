/**
 * packInstallHarness.js — harness comportamental da instalação de story packs (LP2.1a-ii-A).
 *
 * Usado pelo smoke. NÃO é código de aplicação e nada em `src/` o importa.
 *
 * Princípio: só é DOUBLE aquilo que é fronteira de mundo (disco, rede, log). Tudo que é lógica
 * do projeto entra REAL, carregado do fonte:
 *   REAL  → setPackEntry/getPackEntry/getPackLocalDir/getPackTempDir/PACK_STATUS (packStorageService,
 *           com a fila serializada de verdade sobre um AsyncStorage em memória)
 *   REAL  → computeFileSha256 + validatePackManifest (packIntegrityService + packManifestService,
 *           com sha256 do @noble/hashes de verdade sobre os bytes escritos pelo harness)
 *   REAL  → isReadyEntryValid (packReconcileService)
 *   REAL  → getPackFromGlobalManifest (globalManifestService — função pura)
 *   DOUBLE→ FileSystem (em memória), fetchGlobalContentManifest (rede), warn (log)
 *
 * Assim o harness NÃO é permissivo: um hash errado, um byte a mais ou um manifesto fora do schema
 * são rejeitados pela MESMA lógica que roda no aparelho.
 *
 * O mesmo vale para o double de disco: ele precisa falhar ONDE O REAL FALHA, senão a proteção
 * correspondente vira infalsificável. Em especial, escrever num diretório inexistente LANÇA aqui
 * como lança no expo-file-system — sem isso, remover os `makeDirectoryAsync` do fluxo passaria
 * despercebido (o double criaria o caminho por conveniência e o mutante instalaria).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { sha256 } = require('@noble/hashes/sha2.js');
const { bytesToHex } = require('@noble/hashes/utils.js');

const ROOT = path.join(__dirname, '..', '..');
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/** Carrega um módulo ES do projeto injetando suas dependências. Sem transpilar: só remove imports. */
function loadModule(rel, deps = {}, exportNames = []) {
  const code = readSrc(rel)
    .replace(/^import[\s\S]*?;$/gm, '')
    .replace(/export default[\s\S]*$/m, '')
    .replace(/export /g, '')
    + `\n; return { ${exportNames.join(', ')} };`;
  const keys = Object.keys(deps);
  return new Function(...keys, code)(...keys.map((k) => deps[k]));
}

/**
 * Carrega o packDownloadService REAL e devolve seus exports.
 *
 * As 12 dependências do módulo são satisfeitas com stubs inertes só para o módulo AVALIAR: quem
 * decide as dependências de verdade é `createPackDownloadService(deps)` (a seam). `__DEV__` entra
 * porque o Impl o usa num log de diagnóstico do verify.
 */
const DOWNLOADER_DEPS = [
  'FileSystem', 'PACK_STATUS', 'getPackLocalDir', 'getPackTempDir', 'setPackEntry', 'getPackEntry',
  'isReadyEntryValid', 'validatePackManifest', 'computeFileSha256', 'fetchGlobalContentManifest',
  'getPackFromGlobalManifest', 'warn', '__DEV__',
];
function loadPackDownloader(mutate) {
  let src = readSrc('src/services/packDownloadService.js');
  if (mutate) {
    const mutado = mutate(src);
    // ANTITAUTOLOGIA: uma mutação que não bate no fonte (código reformatado) carregaria o módulo
    // ÍNTEGRO, o teste passaria e o mutation check estaria provando nada. Falha alto.
    if (mutado === src) throw new Error('loadPackDownloader: a mutação não alterou o fonte (âncora não encontrada)');
    src = mutado;
  }
  const code = src
    .replace(/^import[\s\S]*?;$/gm, '')
    .replace(/export /g, '')
    + '; return { createPackDownloadService, packInstallKey, DOWNLOAD_FLOW };';
  const inert = DOWNLOADER_DEPS.map((k) => (k === '__DEV__' ? false : (k === 'FileSystem' || k === 'PACK_STATUS' ? {} : () => {})));
  return new Function(...DOWNLOADER_DEPS, code)(...inert);
}

/* ────────────────────────────── FileSystem em memória ────────────────────────────── */
/*
 * Modela SÓ o que o fluxo usa. Diretórios e arquivos num Map por URI.
 * Um diretório é uma chave terminada em '/'. Arquivo guarda bytes (Uint8Array).
 */
function createMemoryFileSystem({ freeBytes = 10 * 1024 * 1024 * 1024, log, fire = async () => {} } = {}) {
  const files = new Map();   // uri -> Uint8Array
  const dirs = new Set(['file:///doc/']);
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const isDir = (uri) => uri.endsWith('/');
  const ensureParents = (uri) => {
    let i = uri.indexOf('/', 'file:///'.length);
    while (i !== -1) { dirs.add(uri.slice(0, i + 1)); i = uri.indexOf('/', i + 1); }
  };
  /** Espelha o expo: escrever num diretório inexistente falha (não cria o caminho por conta). */
  const requireParent = (uri) => {
    const parent = uri.slice(0, uri.lastIndexOf('/') + 1);
    if (!dirs.has(parent)) throw new Error(`ENOENT parent dir: ${parent}`);
  };
  const toB64 = (bytes) => Buffer.from(bytes).toString('base64');

  const FileSystem = {
    documentDirectory: 'file:///doc/',

    async deleteAsync(uri, opts = {}) {
      await fire('delete', uri);   // checkpoint: o estado AQUI é o que um crash deixaria
      log && log('delete', uri);
      const exists = dirs.has(uri) || files.has(uri);
      if (!exists && !opts.idempotent) throw new Error(`ENOENT: ${uri}`);
      if (isDir(uri)) {
        for (const k of [...files.keys()]) if (k.startsWith(uri)) files.delete(k);
        for (const d of [...dirs]) if (d.startsWith(uri)) dirs.delete(d);
      } else files.delete(uri);
    },

    async makeDirectoryAsync(uri, opts = {}) {
      log && log('mkdir', uri);
      const dir = isDir(uri) ? uri : `${uri}/`;
      if (!opts.intermediates && !dirs.has(dir.slice(0, dir.lastIndexOf('/', dir.length - 2) + 1))) {
        throw new Error(`ENOENT parent: ${dir}`);
      }
      ensureParents(dir);
      dirs.add(dir);
    },

    async getInfoAsync(uri, opts = {}) {
      if (files.has(uri)) {
        const b = files.get(uri);
        return opts.size ? { exists: true, isDirectory: false, size: b.length, uri } : { exists: true, isDirectory: false, uri };
      }
      const dir = isDir(uri) ? uri : `${uri}/`;
      if (dirs.has(dir) || dirs.has(uri)) return { exists: true, isDirectory: true, uri };
      return { exists: false, uri };
    },

    async moveAsync({ from, to }) {
      await fire('move', `${from} -> ${to}`);   // checkpoint: depois do delete, antes do move
      log && log('move', `${from} -> ${to}`);
      if (!dirs.has(from) && !files.has(from)) throw new Error(`ENOENT move: ${from}`);
      if (isDir(from)) {
        for (const k of [...files.keys()]) {
          if (k.startsWith(from)) { files.set(to + k.slice(from.length), files.get(k)); files.delete(k); }
        }
        for (const d of [...dirs]) {
          if (d.startsWith(from)) { dirs.add(to + d.slice(from.length)); dirs.delete(d); }
        }
        ensureParents(to); dirs.add(to);
      } else { files.set(to, files.get(from)); files.delete(from); }
    },

    async readAsStringAsync(uri, opts = {}) {
      log && log('read', uri);   // registrado: é como se prova que o manifesto não é lido antes da âncora
      if (!files.has(uri)) throw new Error(`ENOENT read: ${uri}`);
      const bytes = files.get(uri);
      return opts.encoding === 'base64' ? toB64(bytes) : dec.decode(bytes);
    },

    async getFreeDiskStorageAsync() { return freeBytes; },
  };

  return {
    FileSystem,
    // inspeção
    exists: (uri) => files.has(uri) || dirs.has(uri) || dirs.has(`${uri}/`),
    fileText: (uri) => (files.has(uri) ? dec.decode(files.get(uri)) : null),
    listFiles: (prefix) => [...files.keys()].filter((k) => k.startsWith(prefix)).sort(),
    listDirs: () => [...dirs].sort(),
    // Escrita usada pelos downloads. NÃO cria o diretório-pai: o expo-file-system real falha o
    // download quando o destino não existe, e é isso que torna os `makeDirectoryAsync` do fluxo
    // FALSIFICÁVEIS. Criar o pai por conveniência aqui deixaria passar a remoção do mkdir por
    // arquivo (packDownloadService.js:373) — a única coisa que permite baixar caminhos aninhados.
    _write: (uri, text) => { requireParent(uri); files.set(uri, enc.encode(text)); },
    _writeBytes: (uri, bytes) => { requireParent(uri); files.set(uri, bytes); },
    // SÓ para montar o cenário (um pack já instalado ANTES do teste). Não passa pelas APIs
    // observadas, então o log de eventos não ganha operações que o fluxo não executou.
    _seedFile: (uri, text) => { ensureParents(uri); files.set(uri, enc.encode(text)); },
    setFreeBytes: (n) => { freeBytes = n; },
  };
}

/* ────────────────────────────── Downloads configuráveis ────────────────────────────── */
/*
 * `createDownloadResumable(url, to, opts, onProgress)` → { downloadAsync, cancelAsync }.
 * A rota é configurada por URL: conteúdo (texto) e, opcionalmente, eventos de progresso.
 */
function createDownloadLayer({ mem, routes, log, counters }) {
  return function createDownloadResumable(url, to, _opts, onProgress) {
    return {
      async downloadAsync() {
        counters.downloads += 1;
        counters.byUrl[url] = (counters.byUrl[url] || 0) + 1;
        log('download', `${url} -> ${to}`);
        const route = routes.get(url);
        if (!route) throw new Error(`404: ${url}`);
        // Rede que cai NO MEIO do lote (depois de arquivos já gravados no .tmp).
        if (route.throws) throw new Error(route.throws);
        // Download que RESOLVE sem produzir arquivo: exercita o `if (!info.exists)` do verify
        // (packDownloadService.js:397), que é uma checagem REAL do serviço, não inventada aqui.
        if (route.noFile) return { uri: to, status: route.status || 200 };
        if (typeof route.text !== 'string') throw new Error(`rota sem conteúdo: ${url}`);
        if (Array.isArray(route.progressEvents) && typeof onProgress === 'function') {
          for (const ev of route.progressEvents) onProgress(ev);
        }
        mem._write(to, route.text);
        return { uri: to, status: route.status || 200 };
      },
      async cancelAsync() { log('cancel', url); },
    };
  };
}

/* ────────────────────────────── Harness completo ────────────────────────────── */
function createPackInstallHarness({ freeBytes } = {}) {
  const events = [];
  const log = (type, detail) => { events.push(detail === undefined ? type : `${type}:${detail}`); };
  const counters = { downloads: 0, byUrl: {}, setEntry: 0 };

  /*
   * Checkpoints: `onBefore` é chamado ANTES de uma operação real acontecer, então o estado que
   * ele observa é exatamente o que um encerramento do app naquele instante deixaria persistido.
   * É inspeção, não simulação — o gatilho é a operação de verdade, não um marcador do teste.
   */
  const hooks = { before: null };
  const fire = async (type, detail) => { if (hooks.before) await hooks.before(type, detail); };

  const mem = createMemoryFileSystem({ freeBytes, log, fire });
  const routes = new Map();

  // ── AsyncStorage em memória + packStorageService REAL (fila serializada de verdade) ──
  const store = { raw: null };
  const AsyncStorage = {
    async getItem() { await null; return store.raw; },
    async setItem(_k, v) { await null; store.raw = v; },
  };
  const storage = loadModule('src/services/packStorageService.js', {
    AsyncStorage,
    FileSystem: mem.FileSystem,
    STORAGE_KEYS: { PACKS_INDEX: '@ptf_packs_v1' },
    warn: () => {},
  }, ['PACK_STATUS', 'getPackLocalDir', 'getPackTempDir', 'getPackIndex', 'getPackEntry', 'setPackEntry', 'clearPackEntry']);

  // ── packManifestService + packIntegrityService REAIS (sha256 noble sobre os bytes reais) ──
  const manifestSvc = loadModule('src/services/packManifestService.js', {}, ['validateManifest', 'validateFileEntry']);
  const integrity = loadModule('src/services/packIntegrityService.js', {
    FileSystem: mem.FileSystem,
    sha256,
    bytesToHex,
    validateManifest: manifestSvc.validateManifest,
    warn: () => {},
  }, ['validatePackManifest', 'computeFileSha256']);

  // ── packReconcileService REAL ──
  const reconcile = loadModule('src/services/packReconcileService.js', {
    PACK_STATUS: storage.PACK_STATUS,
  }, ['isReadyEntryValid']);

  // ── globalManifestService: getPackFromGlobalManifest REAL (puro); fetch é DOUBLE (rede) ──
  const globalSvc = loadModule('src/services/globalManifestService.js', {
    STORY_CONTENT_LAYER: {},
    warn: () => {},
  }, ['getPackFromGlobalManifest']);

  let globalManifest = null;
  const fetchGlobalContentManifest = async () => {
    log('fetch-global-manifest');
    if (!globalManifest) return { ok: false, data: null, errors: ['rede indisponível'], warnings: [] };
    return { ok: true, data: globalManifest, errors: [], warnings: [] };
  };

  // sha256 REAL de um texto (para montar manifestos coerentes nos cenários)
  const sha256OfText = (text) => bytesToHex(sha256(new TextEncoder().encode(text)));

  const setEntrySpy = async (storyId, entry) => {
    await fire('set-entry', `${storyId}:${entry && entry.status}`);   // checkpoint: antes do READY
    counters.setEntry += 1;
    log('set-entry', `${storyId}:${entry && entry.status}`);
    return storage.setPackEntry(storyId, entry);
  };

  const deps = {
    FileSystem: mem.FileSystem,
    PACK_STATUS: storage.PACK_STATUS,
    getPackLocalDir: storage.getPackLocalDir,
    getPackTempDir: storage.getPackTempDir,
    setPackEntry: setEntrySpy,
    getPackEntry: storage.getPackEntry,
    isReadyEntryValid: reconcile.isReadyEntryValid,
    validatePackManifest: (m, o) => { log('validate-manifest'); return integrity.validatePackManifest(m, o); },
    computeFileSha256: async (uri) => { log('hash', uri); return integrity.computeFileSha256(uri); },
    fetchGlobalContentManifest,
    getPackFromGlobalManifest: globalSvc.getPackFromGlobalManifest,
    warn: () => {},
  };
  deps.FileSystem.createDownloadResumable = createDownloadLayer({ mem, routes, log, counters });

  // `onProgress` do CONTRATO REAL da API (o mesmo que a UI passa) — captura as transições
  // reportadas, que são distintas das gravações persistidas no índice.
  const progress = [];
  const onProgress = (p) => { progress.push(p && p.status); };

  const h = {
    deps,
    mem,
    events,
    progress,
    onProgress,
    counters,
    storage,
    sha256OfText,
    route: (url, cfg) => routes.set(url, cfg),
    setGlobalManifest: (m) => { globalManifest = m; },
    index: () => storage.getPackIndex(),
    entry: (storyId) => storage.getPackEntry(storyId),
    seedIndexRaw: (raw) => { store.raw = JSON.stringify(raw); },
    eventsOfType: (type) => events.filter((e) => e === type || e.startsWith(`${type}:`)),
    indexOfEvent: (needle) => events.findIndex((e) => e.includes(needle)),

    /** Instala o hook de checkpoint: `fn(type, detail)` roda ANTES da operação real. */
    set onBefore(fn) { hooks.before = fn; },
    get onBefore() { return hooks.before; },

    /**
     * Monta um pack JÁ INSTALADO antes do teste: arquivos no diretório canônico + entry READY
     * no índice. Não passa pelas APIs observadas — o log de eventos só terá o que o FLUXO fez.
     */
    seedInstalledPack: ({ storyId, version, files, manifestText = '{"anterior":true}' }) => {
      const dir = storage.getPackLocalDir(storyId, version);
      mem._seedFile(`${dir}manifest.json`, manifestText);
      for (const f of files) mem._seedFile(dir + f.path, f.text);
      store.raw = JSON.stringify({
        ...(store.raw ? JSON.parse(store.raw) : {}),
        [storyId]: {
          storyId,
          version,
          status: storage.PACK_STATUS.READY,
          localDir: dir,
          manifestPath: `${dir}manifest.json`,
          totalBytes: files.reduce((a, f) => a + Buffer.byteLength(f.text), 0),
          downloadedBytes: files.reduce((a, f) => a + Buffer.byteLength(f.text), 0),
          updatedAt: 1,
          errorMessage: null,
        },
      });
      return dir;
    },

    /** Zera o log depois do setup, para as asserções verem só o que o fluxo executou. */
    resetEvents: () => { events.length = 0; progress.length = 0; counters.downloads = 0; counters.byUrl = {}; counters.setEntry = 0; },
  };
  return h;
}

module.exports = { createPackInstallHarness, createMemoryFileSystem, loadModule, loadPackDownloader };
