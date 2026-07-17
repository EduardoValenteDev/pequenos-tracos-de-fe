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
const { createHash } = require('crypto');   // só para o md5 do double de getInfoAsync (built-in do Node)
const { sha256 } = require('@noble/hashes/sha2.js');
const { bytesToHex } = require('@noble/hashes/utils.js');

const ROOT = path.join(__dirname, '..', '..');
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/**
 * Carrega um módulo ES do projeto injetando suas dependências. Sem transpilar: só remove imports.
 * `mutate` (opcional, só para mutation check) altera o TEXTO antes de avaliar; se não bater no
 * fonte, LANÇA — uma âncora obsoleta jamais pode passar por mutante morto.
 */
function loadModule(rel, deps = {}, exportNames = [], mutate) {
  let src = readSrc(rel);
  if (mutate) {
    const mutado = mutate(src);
    if (mutado === src) throw new Error(`loadModule(${rel}): a mutação não alterou o fonte (âncora não encontrada)`);
    src = mutado;
  }
  const code = src
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
  'getPackFromGlobalManifest', 'warn', 'recoverStoryPack',
  // símbolos de packPublishMarker usados pelo downloader (a regra de colisão e o marcador)
  'MARKER_FILENAME', 'buildPublishMarker', 'findMarkerCollisions',
  '__DEV__',
];
function loadPackDownloader(mutate, markerMutate) {
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
  // packPublishMarker é núcleo PURO (sem I/O): entra REAL, não como stub. O Impl chama
  // `findMarkerCollisions`/`buildPublishMarker` direto — dublá-los desativaria a regra de colisão
  // e o marcador nos testes, que é justamente o que se quer provar.
  const marker = loadModule('src/services/packPublishMarker.js', {},
    ['MARKER_FILENAME', 'MARKER_SCHEMA_VERSION', 'normalizePackFilePath', 'collidesWithMarker',
      'findMarkerCollisions', 'buildPublishMarker', 'validateMarkerSchema', 'validatePublishMarker',
      'parsePackDirName', 'selectStoryPackDirs'], markerMutate);
  const inertes = {
    __DEV__: false, FileSystem: {}, PACK_STATUS: {},
    MARKER_FILENAME: marker.MARKER_FILENAME,
    buildPublishMarker: marker.buildPublishMarker,
    findMarkerCollisions: marker.findMarkerCollisions,
  };
  const args = DOWNLOADER_DEPS.map((k) => (k in inertes ? inertes[k] : () => {}));
  return new Function(...DOWNLOADER_DEPS, code)(...args);
}

/* ────────────────────────────── FileSystem em memória ────────────────────────────── */
/*
 * Modela SÓ o que o fluxo usa. Diretórios e arquivos num Map por URI.
 * Um diretório é uma chave terminada em '/'. Arquivo guarda bytes (Uint8Array).
 */
function createMemoryFileSystem({ freeBytes = 10 * 1024 * 1024 * 1024, log, fire = async () => {}, dirOrder = 'asc' } = {}) {
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

    /**
     * SUBCONJUNTO do contrato do expo-file-system/legacy (SDK 54) que este harness modela.
     * Onde modela, segue o nativo; o que não modela, OMITE (nunca inventa um valor).
     *
     * FONTE DE VERDADE = a implementação NATIVA instalada, não o `.d.ts`. O tipo declara
     * `{ exists:false; uri:string; isDirectory:false }` para o ramo ausente, mas o nativo NÃO
     * devolve `uri` ali — iOS (`EXFileSystemLocalFileHandler.m`) resolve `{exists:NO, isDirectory:NO}`
     * e Android (`FileSystemLegacyModule.kt`) devolve um Bundle só com esses dois booleanos. O JS
     * apenas repassa o nativo, então o `.d.ts` é mais amplo que o objeto real: aqui vale o nativo.
     *
     *   opções    → InfoOptions = { md5?: boolean }   ← NÃO existe opção `size`
     *   arquivo   → { exists:true, uri, size, isDirectory:false, md5? }
     *   diretório → { exists:true, uri, size (SOMA RECURSIVA dos descendentes), isDirectory:true }
     *   ausente   → { exists:false, isDirectory:false }        ← sem uri, sem size, sem md5
     *
     * `modificationTime` é a exceção consciente: o NATIVO sempre o devolve no ramo `exists:true`,
     * mas aqui é OMITIDO — nenhum consumidor em `src/` o lê (grep: zero) e um placeholder fixo
     * deixaria uma prova verde por acidente. Omitir é mais ESTRITO que o nativo (quem ler recebe
     * `undefined` e quebra no teste, não no aparelho). Nenhuma prova assere essa ausência: modelar
     * mtime de verdade um dia é evolução válida, não regressão.
     */
    async getInfoAsync(uri, opts = {}) {
      if (files.has(uri)) {
        const b = files.get(uri);
        const info = { exists: true, uri, size: b.length, isDirectory: false };
        if (opts.md5) info.md5 = createHash('md5').update(Buffer.from(b)).digest('hex');
        return info;
      }
      const dir = isDir(uri) ? uri : `${uri}/`;
      if (dirs.has(dir) || dirs.has(uri)) {
        // Nativo: o tamanho de um diretório é a soma RECURSIVA dos arquivos que ele contém
        // (iOS acumula em getFileSize; Android reduz `listFiles()`). `size: 0` fixo era inventado.
        // O prefixo já garante "descendentes" e não conta ninguém duas vezes (cada arquivo é uma
        // chave única do Map). Diretório vazio → 0, que é o resultado real.
        let size = 0;
        for (const [k, v] of files) if (k.startsWith(dir)) size += v.length;
        return { exists: true, uri, size, isDirectory: true };
      }
      return { exists: false, isDirectory: false };
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

    /** Espelha o expo: escrever num diretório inexistente LANÇA (não cria o caminho por conta). */
    async writeAsStringAsync(uri, contents) {
      log && log('write', uri);
      requireParent(uri);
      files.set(uri, enc.encode(String(contents)));
    },

    /**
     * Espelha o expo: `readDirectoryAsync` de um diretório inexistente LANÇA, e devolve os NOMES
     * simples dos filhos diretos (arquivos e subdiretórios), não caminhos.
     */
    async readDirectoryAsync(uri) {
      log && log('readdir', uri);
      const dir = isDir(uri) ? uri : `${uri}/`;
      if (!dirs.has(dir)) throw new Error(`ENOENT readdir: ${dir}`);
      const out = new Set();
      for (const k of files.keys()) {
        if (!k.startsWith(dir)) continue;
        const rest = k.slice(dir.length);
        if (rest && !rest.includes('/')) out.add(rest);          // arquivo filho direto
      }
      for (const d of dirs) {
        if (d === dir || !d.startsWith(dir)) continue;
        const rest = d.slice(dir.length).replace(/\/$/, '');
        if (rest && !rest.includes('/')) out.add(rest);          // subdiretório filho direto
      }
      // A ordem de um readdir real NÃO é contratual. `dirOrder` permite provar que o algoritmo
      // não depende dela (o FS pode devolver em qualquer ordem, em qualquer plataforma).
      const list = [...out].sort();
      return dirOrder === 'desc' ? list.reverse() : list;
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
/**
 * @param {object}   [opts]
 * @param {number}   [opts.freeBytes]
 * @param {function} [opts.storageMutate] — muta o TEXTO do packStorageService antes de carregá-lo.
 *   Existe só para mutation check: permite provar que uma prova de ponta a ponta (downloader real)
 *   REALMENTE falha quando a regra do índice regride. Lança se a mutação não bater no fonte, para
 *   que uma âncora obsoleta nunca seja contada como mutante morto. Nada no disco é alterado.
 */
function createPackInstallHarness({ freeBytes, storageMutate, recoveryMutate, markerMutate, dirOrder } = {}) {
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

  const mem = createMemoryFileSystem({ freeBytes, log, fire, dirOrder });
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
  }, ['PACK_STATUS', 'getPackLocalDir', 'getPackTempDir', 'getPackIndex', 'getPackEntry', 'setPackEntry', 'clearPackEntry'],
  storageMutate);

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

  // ── packPublishMarker REAL (núcleo puro, sem I/O — não há o que dublar) ──
  const markerSvc = loadModule('src/services/packPublishMarker.js', {},
    ['MARKER_FILENAME', 'MARKER_SCHEMA_VERSION', 'normalizePackFilePath', 'collidesWithMarker',
      'findMarkerCollisions', 'buildPublishMarker', 'validateMarkerSchema', 'validatePublishMarker',
      'parsePackDirName', 'selectStoryPackDirs'], markerMutate);

  /*
   * ── globalManifestService REAL: a ÚNICA fronteira dublada é o `fetch` ──
   *
   * `fetchGlobalContentManifest` NÃO é dublado: o módulo real é carregado e executado. Ele faz, em
   * ordem: valida a URL (https; http só em dev) → AbortController/timeout → `fetch` → confere
   * `res.ok`/`res.status` → `res.json()` → `validateGlobalContentManifest(json, opts)`. Dublar a
   * função inteira e reexecutar só a cauda (como se fazia) deixava de fora 3 dos 4 passos: uma URL
   * inválida, um HTTP 404 e um JSON quebrado viravam sucesso nos testes e falha no aparelho.
   *
   * `STORY_CONTENT_LAYER` entra REAL (objeto puro): é ele que faz o validador rejeitar
   * `storyId: desconhecido pelo app`. `__DEV__: false` = regra de PRODUÇÃO (exige https) — a mais
   * estrita, para o teste nunca ser mais frouxo que a loja.
   */
  const contentSvc = loadModule('src/data/contentManifest.js', {}, ['STORY_CONTENT_LAYER']);

  let globalManifest = null;
  let modoRede = 'ok';   // 'ok' | 'offline' | 'http-erro' | 'json-invalido'

  /** Único double: o transporte. Devolve uma Response mínima (o que o real consome dela). */
  const fetchDouble = async (_url, _init) => {
    log('fetch-global-manifest');
    // O modo pedido MANDA. Um `|| !globalManifest` aqui atropelaria o modo e devolveria "offline"
    // para um cenário que pediu 404 — foi assim que uma prova tautológica passou despercebida.
    if (modoRede === 'offline') throw new TypeError('Network request failed');
    if (modoRede === 'http-erro') return { ok: false, status: 404 };
    if (modoRede === 'json-invalido') {
      // Corpo ilegível independe de haver manifesto configurado — é defeito do transporte.
      return { ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token < in JSON'); } };
    }
    // Manifesto não configurado ≠ rede caída: na rede real isso é 404, nunca TypeError.
    if (!globalManifest) return { ok: false, status: 404 };
    return { ok: true, status: 200, json: async () => globalManifest };
  };

  const globalSvc = loadModule('src/services/globalManifestService.js', {
    STORY_CONTENT_LAYER: contentSvc.STORY_CONTENT_LAYER,
    warn: () => {},
    __DEV__: false,
    fetch: fetchDouble,
  }, ['getPackFromGlobalManifest', 'validateGlobalContentManifest', 'fetchGlobalContentManifest']);

  const fetchGlobalContentManifest = globalSvc.fetchGlobalContentManifest;

  // sha256 REAL de um texto (para montar manifestos coerentes nos cenários)
  const sha256OfText = (text) => bytesToHex(sha256(new TextEncoder().encode(text)));

  const setEntrySpy = async (storyId, entry) => {
    await fire('set-entry', `${storyId}:${entry && entry.status}`);   // checkpoint: antes do READY
    counters.setEntry += 1;
    log('set-entry', `${storyId}:${entry && entry.status}`);
    return storage.setPackEntry(storyId, entry);
  };

  // ── packRecoveryService REAL (LP2.1a-ii-C), sobre o mesmo disco/índice em memória ──
  // Nada de mock: o recovery é o que este bloco prova. Só as fronteiras (disco, índice) são doubles.
  const recoverySvc = loadModule('src/services/packRecoveryService.js', {
    FileSystem: mem.FileSystem,
    PACK_STATUS: storage.PACK_STATUS,
    getPackLocalDir: storage.getPackLocalDir,
    getPackEntry: storage.getPackEntry,
    setPackEntry: storage.setPackEntry,
    validatePackManifest: (m, o) => integrity.validatePackManifest(m, o),
    computeFileSha256: async (uri) => integrity.computeFileSha256(uri),
    MARKER_FILENAME: markerSvc.MARKER_FILENAME,
    validatePublishMarker: markerSvc.validatePublishMarker,
    selectStoryPackDirs: markerSvc.selectStoryPackDirs,
    parsePackDirName: markerSvc.parsePackDirName,
    warn: () => {},
  }, ['createPackRecoveryService'], recoveryMutate);
  const recovery = recoverySvc.createPackRecoveryService({
    FileSystem: mem.FileSystem,
    PACK_STATUS: storage.PACK_STATUS,
    getPackLocalDir: storage.getPackLocalDir,
    getPackEntry: storage.getPackEntry,
    setPackEntry: setEntrySpy,           // o mesmo spy: as gravações do recovery aparecem no log
    validatePackManifest: (m, o) => { log('validate-manifest'); return integrity.validatePackManifest(m, o); },
    computeFileSha256: async (uri) => { log('hash', uri); return integrity.computeFileSha256(uri); },
    warn: () => {},
  });

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
    recoverStoryPack: (p) => recovery.recoverStoryPack(p),
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

    /**
     * Modo do TRANSPORTE do manifesto global (a única fronteira dublada):
     *   'ok' (default) · 'offline' (fetch lança) · 'http-erro' (404) · 'json-invalido' (json() lança)
     * Serve para exercitar os passos do `fetchGlobalContentManifest` REAL que antes eram engolidos.
     */
    setModoRede: (m) => { modoRede = m; },

    /**
     * Entrada de pack VÁLIDA por default para o manifesto global.
     *
     * A fonte de verdade do schema é `validateGlobalContentManifest` (globalManifestService) — este
     * helper NÃO o reimplementa nem o descreve por extenso; só monta um pack que ele aceita, para
     * cada cenário sobrescrever o que quer testar.
     *
     * Campos fornecidos por default = os OBRIGATÓRIOS. `manifestSha256` e `status` são OPCIONAIS no
     * validador (ausentes não geram defeito) e por isso ficam de fora: quem quer testar a âncora a
     * informa explicitamente.
     *
     * Existe porque o double antigo do fetch devolvia o manifesto CRU e nunca chamava a validação:
     * fixtures com meia dúzia de campos passavam nos testes e seriam EXCLUÍDAS no aparelho.
     */
    packEntry: (over = {}) => {
      // A sobrescrita VENCE sempre — inclusive valores falsy ('' , 0, null). Um cenário que quer
      // uma entrada INVÁLIDA precisa que ela chegue inválida ao validador; `over.x || default`
      // "consertaria" o defeito em silêncio e o teste provaria o oposto do que pretende.
      const p = {
        storyId: 'david_goliath',
        version: '1.0.0',
        type: 'story',
        access: 'premium',
        title: 'Pack de teste',
        bytes: 1024,
        manifestPath: 'manifest.json',
        requiredAppVersion: '1.0.0',
        // As fixtures dos blocos A/B/C servem cena E áudio e pedem requestedKinds ['scene','audio'];
        // declarar só 'scene' descrevia um pack que se contradiz. Um cenário que precise de outro
        // conjunto sobrescreve — o helper não força.
        mediaKinds: ['scene', 'audio'],
        ...over,
      };
      // Derivados: calculados dos valores FINAIS (nunca dos defaults), e só quando o cenário não
      // os informou. `requiresAppUpdate` NÃO entra: quem o deriva é o validador real.
      if (!('baseUrl' in over)) p.baseUrl = `https://r2/${p.storyId}/v1/`;
      if (!('id' in over)) p.id = `${p.storyId}-${p.version}`;
      return p;
    },
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

    /**
     * Semeia um ÓRFÃO: o diretório final publicado, SEM entrada READY no índice — exatamente o
     * que um encerramento entre o `moveAsync` e o `setPackEntry(READY)` deixa.
     *
     * Monta o destino À MÃO, arquivo a arquivo: é assim que se prova que o recovery rejeita um
     * destino PARCIAL. Depender do move do FS em memória (que é atômico) esconderia o caso.
     *
     * @param {object} p
     * @param {string} p.storyId
     * @param {string} p.version
     * @param {Array<{path:string,text:string}>} p.files  arquivos a colocar (omita um → parcial)
     * @param {string|null} [p.manifestText]  conteúdo do manifest.json (null → manifesto ausente)
     * @param {object|string|null} [p.marker] marcador (objeto → JSON; string → cru; null → ausente)
     * @param {object|null} [p.indexEntry]    entrada do índice (null → C2; objeto → C1)
     * @returns {string} o diretório final semeado
     */
    seedOrphanPack: ({ storyId, version, files = [], manifestText = null, marker = null, indexEntry = null }) => {
      const dir = storage.getPackLocalDir(storyId, version);
      if (manifestText !== null) mem._seedFile(`${dir}manifest.json`, manifestText);
      for (const f of files) mem._seedFile(dir + f.path, f.text);
      if (marker !== null) {
        mem._seedFile(`${dir}.ptf-publish.json`, typeof marker === 'string' ? marker : JSON.stringify(marker));
      }
      if (indexEntry !== null) {
        store.raw = JSON.stringify({
          ...(store.raw ? JSON.parse(store.raw) : {}),
          [storyId]: { storyId, version, updatedAt: 1, ...indexEntry },
        });
      }
      return dir;
    },

    /** Zera o log depois do setup, para as asserções verem só o que o fluxo executou. */
    resetEvents: () => { events.length = 0; progress.length = 0; counters.downloads = 0; counters.byUrl = {}; counters.setEntry = 0; },
  };
  return h;
}

module.exports = { createPackInstallHarness, createMemoryFileSystem, loadModule, loadPackDownloader };
