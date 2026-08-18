'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_PATH = path.join(ROOT, 'src', 'components', 'ColoringCanvas.js');

function extractFunction(source, name) {
  const plainStart = source.indexOf(`function ${name}(`);
  const asyncStart = source.indexOf(`async function ${name}(`);
  const from = asyncStart >= 0 && (plainStart < 0 || asyncStart < plainStart) ? asyncStart : plainStart;
  if (from < 0) throw new Error(`função ${name} não encontrada`);

  const brace = source.indexOf('{', from);
  let depth = 0;
  let state = 'code';
  for (let i = brace; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    if (state === 'line') {
      if (ch === '\n') state = 'code';
      continue;
    }
    if (state === 'block') {
      if (ch === '*' && next === '/') { state = 'code'; i++; }
      continue;
    }
    if (state === 'single' || state === 'double' || state === 'template') {
      if (ch === '\\') { i++; continue; }
      if ((state === 'single' && ch === "'")
        || (state === 'double' && ch === '"')
        || (state === 'template' && ch === '`')) state = 'code';
      continue;
    }
    if (ch === '/' && next === '/') { state = 'line'; i++; continue; }
    if (ch === '/' && next === '*') { state = 'block'; i++; continue; }
    if (ch === "'") { state = 'single'; continue; }
    if (ch === '"') { state = 'double'; continue; }
    if (ch === '`') { state = 'template'; continue; }
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return source.slice(from, i + 1);
  }
  throw new Error(`fim da função ${name} não encontrado`);
}

function loadRealFunctions(mutate) {
  let source = fs.readFileSync(SOURCE_PATH, 'utf8');
  if (mutate) {
    const changed = mutate(source);
    if (changed === source) throw new Error('mutante não alterou o fonte');
    source = changed;
  }
  const code = [
    extractFunction(source, 'lineartCacheKeyOf'),
    extractFunction(source, 'resolveLineartReadableUri'),
    extractFunction(source, 'convertLineartToDataUrl'),
  ].join('\n');
  return (deps) => new Function(
    'Asset', 'FileSystem', 'fetch', 'FileReader', 'lineartCache',
    `${code}; return { resolveLineartReadableUri, convertLineartToDataUrl };`,
  )(deps.Asset, deps.FileSystem, deps.fetch, deps.FileReader, new Map());
}

function makeWorld(mode) {
  const calls = { fromModule: 0, moduleDownload: 0, fromURI: 0, embeddedDownload: 0, reads: [], fetches: [] };
  const moduleAsset = {
    downloaded: mode === 'development' ? false : true,
    localUri: mode === 'release' || mode === 'copy-fails'
      ? 'assets_stories_creation_coloring_scene_02'
      : null,
    uri: mode === 'development'
      ? 'http://127.0.0.1:8081/assets/scene_02.png'
      : 'file:///cache/already.png',
    async downloadAsync() {
      calls.moduleDownload++;
      this.downloaded = true;
      this.localUri = 'file:///cache/from-metro.png';
      return this;
    },
  };
  if (mode === 'file') {
    moduleAsset.localUri = 'file:///bundle/already.png';
    moduleAsset.uri = moduleAsset.localUri;
  }
  const embeddedAsset = {
    downloaded: false,
    localUri: null,
    uri: 'assets_stories_creation_coloring_scene_02',
    async downloadAsync() {
      calls.embeddedDownload++;
      if (mode === 'copy-fails') throw new Error('native resource copy failed');
      this.downloaded = true;
      this.localUri = 'file:///cache/ExponentAsset-lineart.png';
      return this;
    },
  };
  const Asset = {
    fromModule() { calls.fromModule++; return moduleAsset; },
    fromURI() { calls.fromURI++; return embeddedAsset; },
  };
  const FileSystem = {
    EncodingType: { Base64: 'base64' },
    async readAsStringAsync(uri) {
      calls.reads.push(uri);
      return 'QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo='.repeat(3);
    },
  };
  const fetch = async (uri) => {
    calls.fetches.push(uri);
    if (!/^https?:/.test(uri)) throw new Error(`fetch inválido: ${uri}`);
    return { blob: async () => ({}) };
  };
  class FileReader {
    readAsDataURL() {
      this.result = `data:image/png;base64,${'QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo='.repeat(3)}`;
      this.onloadend();
    }
  }
  return { Asset, FileSystem, fetch, FileReader, calls };
}

async function contract(mutate) {
  const build = loadRealFunctions(mutate);
  const result = {};

  {
    const world = makeWorld('release');
    const api = build(world);
    const data = await api.convertLineartToDataUrl(101);
    result.releaseDrawableCopied = data.startsWith('data:image/png;base64,')
      && world.calls.fromURI === 1
      && world.calls.embeddedDownload === 1
      && world.calls.reads[0] === 'file:///cache/ExponentAsset-lineart.png'
      && world.calls.fetches.length === 0;
  }
  {
    const world = makeWorld('development');
    const api = build(world);
    await api.convertLineartToDataUrl(102);
    result.developmentMetroPreserved = world.calls.moduleDownload === 1
      && world.calls.fromURI === 0
      && world.calls.reads[0] === 'file:///cache/from-metro.png';
  }
  {
    const world = makeWorld('file');
    const api = build(world);
    await api.convertLineartToDataUrl(103);
    result.fileModulePreserved = world.calls.fromURI === 0
      && world.calls.moduleDownload === 0
      && world.calls.reads[0] === 'file:///bundle/already.png';
  }
  {
    const world = makeWorld('release');
    const api = build(world);
    await api.convertLineartToDataUrl({ uri: 'file:///packs/light.png' });
    result.packFilePreserved = world.calls.fromModule === 0
      && world.calls.fromURI === 0
      && world.calls.reads[0] === 'file:///packs/light.png';
  }
  {
    const world = makeWorld('release');
    const api = build(world);
    await api.convertLineartToDataUrl({ uri: 'https://example.test/light.png' });
    result.remotePreserved = world.calls.fromModule === 0
      && world.calls.fetches[0] === 'https://example.test/light.png';
  }
  {
    const world = makeWorld('copy-fails');
    const api = build(world);
    let rejected = false;
    try {
      await api.convertLineartToDataUrl(104);
    } catch (error) {
      rejected = /native resource copy failed/.test(error.message);
    }
    result.copyFailureIsVisible = rejected && world.calls.reads.length === 0;
  }
  {
    const world = makeWorld('release');
    const api = build(world);
    await api.convertLineartToDataUrl(105);
    await api.convertLineartToDataUrl(105);
    result.cacheAvoidsSecondCopy = world.calls.fromModule === 1
      && world.calls.embeddedDownload === 1
      && world.calls.reads.length === 1;
  }

  return result;
}

async function run() {
  const checks = await contract();
  const failed = Object.entries(checks).filter(([, ok]) => ok !== true);
  const mutants = [
    ['remove-bare-uri-branch', (s) => s.replace("if (localUri && !localUri.includes(':')) {", 'if (false) {')],
    ['reuse-wrong-asset', (s) => s.replace('Asset.fromURI(localUri)', 'Asset.fromModule(imageSource)')],
    ['skip-native-copy', (s) => s.replace('if (!embeddedAsset.downloaded) await embeddedAsset.downloadAsync();', '')],
    ['prefer-bare-uri', (s) => s.replace('embeddedAsset.localUri || embeddedAsset.uri', 'embeddedAsset.uri || embeddedAsset.localUri')],
    ['invert-bare-test', (s) => s.replace("!localUri.includes(':')", "localUri.includes(':')")],
  ];
  const survived = [];
  for (const [name, mutate] of mutants) {
    try {
      const mutant = await contract(mutate);
      if (Object.values(mutant).every(Boolean)) survived.push(name);
    } catch (_) {
      // Exceção num cenário antes verde mata o mutante.
    }
  }

  console.log(`R7 release asset focused: ${Object.keys(checks).length - failed.length}/${Object.keys(checks).length} PASS`);
  console.log(`R7 release asset mutants: ${mutants.length - survived.length}/${mutants.length} KILLED`);
  if (failed.length) console.error(`Failed: ${failed.map(([name]) => name).join(', ')}`);
  if (survived.length) console.error(`Survived: ${survived.join(', ')}`);
  if (failed.length || survived.length) process.exitCode = 1;
  return { checks, mutants: mutants.length, survived };
}

if (require.main === module) run().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

module.exports = { contract, run };
