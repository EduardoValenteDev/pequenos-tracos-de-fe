#!/usr/bin/env node
/**
 * verify-sandbox-resolver.js — Prova que o contentResolver monta file:// para um pack
 * READY (Fase 2, F2.1c).
 *
 * Carrega o `contentResolver.js` REAL por avaliação isolada (removendo imports e
 * injetando stubs puros para contentManifest/packStorageService/storyImageService/
 * audioService — que dependem de Expo/RN e não rodam em Node). Lê o índice sandbox
 * (`pack-index.json`), pega a entrada `ready` de david_goliath e resolve as 21 mídias.
 *
 * NÃO importa Expo/RN, NÃO grava AsyncStorage, NÃO toca o app, NÃO altera assets.
 *
 * [P3J] Eram 31 mídias (com 10 de colorir). Com o Colorir legado aposentado, o `contentResolver`
 * não expõe mais `resolveStoryColoring` nem o `case 'coloring'`, e o pack deixou de pedir esse
 * kind — então o plano caiu para 21. A cobertura NÃO diminuiu: no lugar das 10 resoluções, foi
 * acrescentada uma prova mais forte (kind aposentado ⇒ envelope de ERRO explícito), que falha se
 * alguém reintroduzir um caminho de lineart pelo pack.
 *
 * Prova:
 *   - 21 resoluções (1 cover + 10 scenes + 10 audio) com sourceType=file
 *   - cada file:// aponta para um arquivo EXISTENTE dentro do localDir
 *   - cada path resolvido bate com o manifesto
 *   - o kind aposentado 'coloring' devolve status=error/sourceType=missing (nunca file://)
 *   - o FALLBACK local continua (packEntry=null → sourceType=require)
 *   - nenhuma tela importa o contentResolver
 *
 * Uso:
 *   node scripts/assets-pipeline/verify-sandbox-resolver.js --storyId david_goliath --runtimeDir C:/tmp/ptf_pack_runtime
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { fileURLToPath } = require('url');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function parseArgs(argv) {
  const out = { storyId: 'david_goliath', runtimeDir: null };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--storyId') out.storyId = argv[++i];
    else if (a === '--runtimeDir') out.runtimeDir = argv[++i];
  }
  if (!out.runtimeDir) out.runtimeDir = path.join(os.tmpdir(), 'ptf_pack_runtime');
  return out;
}

// Carrega o contentResolver REAL sem Expo: remove imports, tira `export`, injeta stubs.
function loadContentResolver(storyId) {
  let code = fs.readFileSync(path.join(REPO_ROOT, 'src', 'services', 'contentResolver.js'), 'utf8');
  code = code.replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, ''); // remove imports (multi-linha)
  code = code.replace(/^export\s+/gm, '');                           // export const/function → const/function

  const stubs = {
    getContentLayer: (id) => (id === storyId ? 'remote' : 'starter'),
    CONTENT_LAYERS: { STARTER: 'starter', REMOTE: 'remote', COMING_SOON: 'coming_soon' },
    // Espelha packStorageService.PACK_STATUS (verificado por smoke [1449]).
    PACK_STATUS: {
      INCLUDED: 'included', NOT_DOWNLOADED: 'not_downloaded', DOWNLOADING: 'downloading',
      VERIFYING: 'verifying', READY: 'ready', FAILED: 'failed',
      NEEDS_UPDATE: 'needs_update', REQUIRES_APP_UPDATE: 'requires_app_update',
    },
    // Fontes locais não-nulas → provam que o FALLBACK local continua disponível.
    // [P3J] `getSceneColoringImage` saiu dos stubs junto com a função real: o storyImageService
    // não a exporta mais, então stubá-la aqui esconderia uma reintrodução em vez de denunciá-la.
    getOfficialSceneIllustration: () => ({ __local: 'scene' }),
    getStoryCoverImage: () => ({ __local: 'cover' }),
    getSceneAudio: () => ({ __local: 'audio' }),
  };

  const header = `
    const getContentLayer = __stubs.getContentLayer;
    const CONTENT_LAYERS = __stubs.CONTENT_LAYERS;
    const PACK_STATUS = __stubs.PACK_STATUS;
    const getOfficialSceneIllustration = __stubs.getOfficialSceneIllustration;
    const getStoryCoverImage = __stubs.getStoryCoverImage;
    const getSceneAudio = __stubs.getSceneAudio;
  `;
  // [P3J] `resolveStoryColoring` saiu do retorno: a função não existe mais no contentResolver.
  const footer = `
    ;return { resolveStoryCover, resolveStoryScene, resolveStoryAudio,
      resolveStoryMediaFromPackEntry, getPackState, canResolveStoryMedia, RESOLVE_STATUS, RESOLVE_SOURCE_TYPE };
  `;
  // eslint-disable-next-line no-new-func
  return new Function('__stubs', header + code + footer)(stubs);
}

const pad2 = (n) => String(n).padStart(2, '0');

function verify() {
  const args = parseArgs(process.argv);
  const { storyId } = args;
  const runtimeDir = path.resolve(args.runtimeDir);
  const indexPath = path.join(runtimeDir, 'pack-index.json');

  const errors = [];
  const rows = [];

  if (!fs.existsSync(indexPath)) { console.log(`ERRO: índice sandbox ausente: ${indexPath}`); process.exit(1); }
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const entry = index[storyId];
  if (!entry) { console.log(`ERRO: sem entrada para ${storyId} no índice`); process.exit(1); }
  if (entry.status !== 'ready') errors.push(`status esperado ready, obtido ${entry.status}`);
  if (!entry.localDir) errors.push('entry.localDir ausente');

  // Manifesto instalado (via manifestPath file://).
  const manifestAbs = fileURLToPath(entry.manifestPath);
  const manifest = JSON.parse(fs.readFileSync(manifestAbs, 'utf8'));
  const manifestPaths = new Set((manifest.files || []).map((f) => f.path));

  const resolver = loadContentResolver(storyId);
  const { RESOLVE_STATUS, RESOLVE_SOURCE_TYPE } = resolver;

  // Plano de 21 mídias ([P3J]: as 10 de colorir saíram — ver prova do kind aposentado abaixo).
  const requests = [{ kind: 'cover', scene: null }];
  for (let n = 1; n <= 10; n += 1) requests.push({ kind: 'scene', scene: n });
  for (let n = 1; n <= 10; n += 1) requests.push({ kind: 'audio', scene: n });

  let fileCount = 0;
  let existCount = 0;
  requests.forEach((req) => {
    const r = resolver.resolveStoryMediaFromPackEntry(storyId, req.kind, req.scene, entry);
    const label = `${req.kind}${req.scene ? ' ' + pad2(req.scene) : ''}`;
    let ok = true;
    let relPath = '';
    let exists = false;

    if (r.status !== RESOLVE_STATUS.READY) { errors.push(`${label}: status ${r.status} != ready`); ok = false; }
    if (r.sourceType !== RESOLVE_SOURCE_TYPE.FILE) { errors.push(`${label}: sourceType ${r.sourceType} != file`); ok = false; }
    const uri = r.source && r.source.uri;
    if (!uri || typeof uri !== 'string') { errors.push(`${label}: sem uri`); ok = false; }
    else {
      if (!uri.startsWith(entry.localDir)) { errors.push(`${label}: uri fora do localDir`); ok = false; }
      relPath = uri.slice(entry.localDir.length);
      if (!manifestPaths.has(relPath)) { errors.push(`${label}: path '${relPath}' não está no manifesto`); ok = false; }
      try { exists = fs.existsSync(fileURLToPath(uri)); } catch { exists = false; }
      if (!exists) { errors.push(`${label}: arquivo file:// inexistente (${relPath})`); ok = false; }
    }

    if (r.sourceType === RESOLVE_SOURCE_TYPE.FILE) fileCount += 1;
    if (exists) existCount += 1;
    rows.push({ label, relPath, file: r.sourceType === RESOLVE_SOURCE_TYPE.FILE, exists, ok });
  });

  // [P3J] Kind APOSENTADO: mesmo com o pack READY instalado (e com os linearts ainda presentes em
  // packs antigos, que NÃO são apagados), pedir 'coloring' precisa cair no `default` do resolver —
  // envelope de ERRO explícito, nunca um file:// de lineart. Falha se o caso voltar a existir.
  const retired = resolver.resolveStoryMediaFromPackEntry(storyId, 'coloring', 1, entry);
  const retiredOk = retired.status === RESOLVE_STATUS.ERROR
    && retired.sourceType === RESOLVE_SOURCE_TYPE.MISSING
    && retired.source === null;
  if (!retiredOk) {
    errors.push(`kind aposentado 'coloring' resolveu: status=${retired.status}, sourceType=${retired.sourceType}`);
  }

  // Fallback local: packEntry=null → require (remote sem pack).
  const fb = resolver.resolveStoryMediaFromPackEntry(storyId, 'scene', 1, null);
  const fallbackOk = fb.sourceType === RESOLVE_SOURCE_TYPE.REQUIRE && fb.status === RESOLVE_STATUS.NOT_DOWNLOADED;
  if (!fallbackOk) errors.push(`fallback local quebrado: sourceType=${fb.sourceType}, status=${fb.status}`);

  // Nenhuma tela importa o contentResolver.
  const screens = ['src/screens/StoryDetailScreen.js', 'src/screens/NarrationScreen.js', 'src/screens/ColoringScreen.js'];
  const screenImports = screens.filter((s) => /contentResolver|packStorageService|packDownloadService|packIntegrityService/.test(fs.readFileSync(path.join(REPO_ROOT, s), 'utf8')));
  if (screenImports.length) errors.push(`telas importam runtime: ${screenImports.join(', ')}`);

  // Saída.
  console.log('── verify-sandbox-resolver (F2.1c) ──');
  console.log(`storyId: ${storyId}  ·  status: ${entry.status}  ·  localDir: ${entry.localDir}`);
  console.log('');
  console.log('mídia         file?  existe?  path');
  rows.forEach((r) => console.log(`${r.label.padEnd(12)}  ${r.file ? ' ✓ ' : ' ✗ '}   ${r.exists ? ' ✓ ' : ' ✗ '}   ${r.relPath}`));
  console.log('');
  console.log(`resoluções file://: ${fileCount}/21   arquivos existentes: ${existCount}/21`);
  console.log(`kind aposentado 'coloring' → erro explícito: ${retiredOk ? 'OK ✓' : 'FALHOU ✗'}`);
  console.log(`fallback local (packEntry=null → require): ${fallbackOk ? 'OK ✓' : 'FALHOU ✗'}`);
  console.log(`telas sem import do runtime: ${screenImports.length === 0 ? 'OK ✓' : 'FALHOU ✗'}`);

  const allOk = errors.length === 0 && fileCount === 21 && existCount === 21;
  if (allOk) {
    console.log('RESULTADO: VÁLIDO ✓ (21 file:// resolvidos e existentes; colorir aposentado; fallback preservado; telas intactas)');
    process.exit(0);
  }
  console.log(`RESULTADO: INVÁLIDO ✗ (${errors.length} erro(s)):`);
  errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}

try { verify(); } catch (e) { console.error(`ERRO: ${e.message}`); process.exit(1); }
