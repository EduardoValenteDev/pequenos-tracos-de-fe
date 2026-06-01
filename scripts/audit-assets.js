/**
 * audit-assets.js — Auditoria completa de assets do projeto.
 *
 * Verifica: áudios, imagens de colorir, capas, narração, pastas legadas,
 * assets órfãos, arquivos grandes, extensões erradas, duplicidades.
 *
 * Não altera, renomeia ou apaga nenhum arquivo.
 * Run: node scripts/audit-assets.js
 * Run: node scripts/audit-assets.js --verbose
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');

// ── Parse stories.js ─────────────────────────────────────────────────────────
let src = fs.readFileSync(path.join(ROOT, 'src', 'data', 'stories.js'), 'utf8');
src = src.replace(/^export\s+const\s+(\w+)\s*=/, 'const $1 =');
const fn = new Function('module', 'exports', src + '\nmodule.exports={stories};');
const mod = { exports: {} };
fn(mod, mod.exports);
const { stories } = mod.exports;

// ── Parse coloringImages.js to know which require()s are registered ───────────
const coloringImgSrc = fs.readFileSync(path.join(ROOT, 'src', 'assets', 'coloringImages.js'), 'utf8');
const COLORING_REGISTERED = new Set(); // "storyId::sceneId"
const reColoring = /require\(['"].*?assets\/stories\/(\w+)\/colorir\/(\w+_scene_\d+_coloring\.png)['"]\)/g;
let m;
while ((m = reColoring.exec(coloringImgSrc)) !== null) {
  const folder = m[1]; // e.g. "noe"
  const file   = m[2]; // e.g. "noe_scene_01_coloring.png"
  COLORING_REGISTERED.add(folder + '/' + file);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad2(n)    { return String(n).padStart(2, '0'); }
function mb(bytes)  { return (bytes / 1024 / 1024).toFixed(2) + ' MB'; }
function kb(bytes)  { return (bytes / 1024).toFixed(0) + ' KB'; }
function exists(p)  { try { fs.accessSync(p); return true; } catch { return false; } }
function size(p)    { try { return fs.statSync(p).size; } catch { return 0; } }

const WARN = '⚠ ';
const OK   = '✓ ';
const ERR  = '✗ ';
const INFO = '  ';

let errors = 0; let warnings = 0; let oks = 0;

function pass(msg)  { oks++;      if (VERBOSE) console.log(OK + msg); }
function warn(msg)  { warnings++; console.log(WARN + msg); }
function fail(msg)  { errors++;   console.log(ERR + msg); }
function info(msg)  { console.log(INFO + msg); }

// ── Story → folder mapping (stories use different folder names than storyId) ──
// Derived from coloringImages.js naming conventions
const STORY_FOLDER_MAP = {
  noah:          'noe',
  david_goliath: 'davi_golias',
  jesus_children:'jesus_criancas',
  // all others: storyId === folder name (when added)
};
function storyFolder(id) { return STORY_FOLDER_MAP[id] || id; }

// ── Build exact scene→file mapping from coloringImages.js requires ────────────
// Each story in coloringImages.js uses a specific file prefix (may differ from storyId)
// e.g. david_goliath uses "davi_scene_NN_coloring.png" (prefix: "davi")
const STORY_COLORING_FILES = {}; // storyId → { sceneNum → filename }

coloringImgSrc.replace(/\/\/ ── (\w+):.*?──/g, ''); // strip comments
// Parse entries like: 1: require('../../assets/stories/FOLDER/colorir/FILENAME')
const reqEntryRe = /(\d+)\s*:\s*require\(['"]([^'"]+)['"]\)/g;
let entry;
while ((entry = reqEntryRe.exec(coloringImgSrc)) !== null) {
  const sceneNum = parseInt(entry[1], 10);
  const reqPath  = entry[2]; // e.g. '../../assets/stories/noe/colorir/noe_scene_01_coloring.png'
  // Extract folder and filename from path
  const pathMatch = reqPath.match(/stories\/(\w+)\/colorir\/(.*\.png)$/);
  if (!pathMatch) continue;
  const folder   = pathMatch[1]; // e.g. "noe"
  const filename = pathMatch[2]; // e.g. "noe_scene_01_coloring.png"
  // Find which storyId maps to this folder
  const storyId = Object.entries(STORY_FOLDER_MAP).find(([,f]) => f === folder)?.[0] || folder;
  if (!STORY_COLORING_FILES[storyId]) STORY_COLORING_FILES[storyId] = {};
  STORY_COLORING_FILES[storyId][sceneNum] = { folder, filename };
}

// ── Stories that have coloring images registered ─────────────────────────────
const STORIES_WITH_COLORING = new Set(Object.keys(STORY_COLORING_FILES));

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: Audio assets
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log('  AUDIT-ASSETS — Pequenos Traços de Fé');
console.log('══════════════════════════════════════════════════════════\n');
console.log('── SEÇÃO 1: Áudio ──────────────────────────────────────');

let audioPresent = 0; let audioMissing = 0; let audioBig = 0; let audioWrongExt = 0;
const AUDIO_MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const AUDIO_MIN_BYTES = 40 * 1024;        // 40 KB (silence or very short = suspicious)

stories.forEach(s => {
  for (let i = 1; i <= 10; i++) {
    const fileName = `${s.id}_scene_${pad2(i)}.mp3`;
    const filePath = path.join(ROOT, 'assets', 'audio', s.id, fileName);

    if (!exists(filePath)) {
      audioMissing++;
      if (VERBOSE) info(`MISSING audio: assets/audio/${s.id}/${fileName}`);
    } else {
      audioPresent++;
      const bytes = size(filePath);
      if (bytes > AUDIO_MAX_BYTES) {
        warn(`LARGE audio (${mb(bytes)}): assets/audio/${s.id}/${fileName}`);
        audioBig++;
      } else if (bytes < AUDIO_MIN_BYTES) {
        warn(`TINY audio (${kb(bytes)} KB): assets/audio/${s.id}/${fileName} — possibly empty`);
      } else {
        pass(`audio OK: ${s.id}/${fileName}`);
      }
    }
  }

  // Check for wrong extensions in the audio folder
  const audioDir = path.join(ROOT, 'assets', 'audio', s.id);
  if (exists(audioDir)) {
    fs.readdirSync(audioDir).forEach(f => {
      if (f === '.gitkeep') return;
      const ext = path.extname(f).toLowerCase();
      if (ext !== '.mp3') {
        if (ext === '.wav' || ext === '.m4a' || ext === '.aac') {
          warn(`WRONG_EXT audio (${ext}): assets/audio/${s.id}/${f} — deve ser .mp3`);
          audioWrongExt++;
        } else if (ext !== '.mp3') {
          warn(`UNEXPECTED file in audio folder: assets/audio/${s.id}/${f}`);
        }
      }
      // Check naming convention
      if (f !== '.gitkeep' && ext === '.mp3') {
        const expectedPattern = new RegExp(`^${s.id}_scene_\\d{2}\\.mp3$`);
        if (!expectedPattern.test(f)) {
          warn(`WRONG_NAME audio: ${f} — expected pattern: ${s.id}_scene_NN.mp3`);
        }
      }
    });
  } else {
    fail(`MISSING audio folder: assets/audio/${s.id}/`);
  }
});

console.log(`\n  Audio ready:   ${audioPresent}/200`);
console.log(`  Audio missing: ${audioMissing}/200`);
if (audioBig > 0)      console.log(`  Audio > 3 MB:  ${audioBig} (compress recommended)`);
if (audioWrongExt > 0) console.log(`  Wrong ext:     ${audioWrongExt}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: Coloring images
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 2: Imagens de colorir ─────────────────────────');

let coloringPresent = 0; let coloringMissing = 0; let coloringBig = 0;
const COLORING_MAX_BYTES = 300 * 1024; // 300 KB — above this, needs compression
const COLORING_WARN_BYTES = 150 * 1024; // 150 KB — flag for review

stories.forEach(s => {
  const isRegistered = STORIES_WITH_COLORING.has(s.id);

  if (!isRegistered) {
    coloringMissing += 10;
    if (VERBOSE) {
      for (let i = 1; i <= 10; i++) {
        info(`NOT_REGISTERED colorir: ${s.id} scene ${i} (not in coloringImages.js)`);
      }
    }
    return;
  }

  const sceneMap = STORY_COLORING_FILES[s.id] || {};

  for (let i = 1; i <= 10; i++) {
    const sceneInfo = sceneMap[i];
    if (!sceneInfo) {
      fail(`MISSING colorir entry in coloringImages.js: ${s.id} scene ${i}`);
      coloringMissing++;
      continue;
    }

    const { folder, filename } = sceneInfo;
    const fp = path.join(ROOT, 'assets', 'stories', folder, 'colorir', filename);

    if (!exists(fp)) {
      fail(`MISSING colorir FILE: assets/stories/${folder}/colorir/${filename}`);
      coloringMissing++;
    } else {
      const bytes = size(fp);
      if (bytes > COLORING_MAX_BYTES) {
        warn(`LARGE colorir (${mb(bytes)}): ${folder}/colorir/${filename} — comprimir para < 150 KB`);
        coloringBig++;
      } else if (bytes > COLORING_WARN_BYTES) {
        warn(`MEDIUM colorir (${kb(bytes)} KB): ${folder}/colorir/${filename} — avaliar compressão`);
      } else {
        pass(`colorir OK: ${folder}/colorir/${filename}`);
      }
      coloringPresent++;
    }
  }
});

console.log(`\n  Colorir presente: ${coloringPresent}/200`);
console.log(`  Colorir ausente:  ${coloringMissing}/200`);
if (coloringBig > 0) console.log(`  Colorir > 300 KB: ${coloringBig} (compressão necessária)`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: Cover images
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 3: Capas de história ──────────────────────────');

let capaPresent = 0; let capaMissing = 0;
stories.forEach(s => {
  if (!s.imagemCapa) {
    capaMissing++;
    if (VERBOSE) info(`NO_CAPA declared: ${s.id} — imagemCapa: null (expected for future)`);
  } else {
    const p = path.join(ROOT, 'assets', 'images', s.imagemCapa + '.png');
    if (exists(p)) {
      capaPresent++;
      const bytes = size(p);
      if (bytes > 200 * 1024) warn(`LARGE capa (${kb(bytes)} KB): assets/images/${s.imagemCapa}.png`);
      else pass(`capa OK: ${s.imagemCapa}.png`);
    } else {
      fail(`MISSING capa file: assets/images/${s.imagemCapa}.png — declared but not on disk`);
      capaMissing++;
    }
  }
});

console.log(`\n  Capas presentes: ${capaPresent}/20`);
console.log(`  Capas ausentes:  ${capaMissing}/20 (${20 - stories.filter(s => s.imagemCapa).length} ainda não declaradas)`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: Narration images
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 4: Imagens de narração ────────────────────────');

let narPresent = 0; let narMissing = 0;
stories.forEach(s => {
  (s.cenas || []).forEach((cena, idx) => {
    if (!cena.imagemNarracao) return;
    const p = path.join(ROOT, 'assets', 'images', cena.imagemNarracao + '.png');
    if (exists(p)) {
      narPresent++;
      pass(`narImg OK: ${cena.imagemNarracao}.png`);
    } else {
      fail(`MISSING narImg: assets/images/${cena.imagemNarracao}.png — declared in ${s.id} cena ${idx+1}`);
      narMissing++;
    }
  });
});

console.log(`\n  Narração imgs presentes: ${narPresent}`);
console.log(`  Narração imgs ausentes:  ${narMissing}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: Pastas legadas (com espaços/acentos)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 5: Pastas legadas ─────────────────────────────');

const LEGACY_DIRS = [
  path.join(ROOT, 'assets', 'stories', 'Davi e o Golias'),
  path.join(ROOT, 'assets', 'stories', 'Jesus e as crianças'),
  path.join(ROOT, 'assets', 'stories', 'noe'),           // correct but check for stale files
];

let legacyCount = 0;
LEGACY_DIRS.forEach(dir => {
  if (exists(dir)) {
    const rel = path.relative(ROOT, dir);
    const files = [];
    function walkDir(d) {
      fs.readdirSync(d).forEach(f => {
        const fp = path.join(d, f);
        if (fs.statSync(fp).isDirectory()) walkDir(fp);
        else files.push(path.relative(ROOT, fp));
      });
    }
    walkDir(dir);
    if (dir.includes(' ') || dir.includes('ç') || dir.includes('ã')) {
      warn(`LEGACY folder with spaces/accents: ${rel} (${files.length} files) — confirm no require() points here before removing`);
      legacyCount++;
    } else {
      pass(`folder OK: ${rel} (${files.length} files)`);
    }
  }
});

// Check backup file
const backupImg = path.join(ROOT, 'assets', 'images', 'noe_apontandoBackup.png');
if (exists(backupImg)) {
  warn(`BACKUP file found: assets/images/noe_apontandoBackup.png — verify it is not referenced, then remove`);
  legacyCount++;
}

console.log(`\n  Legacy items: ${legacyCount}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: Orphan assets
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 6: Assets órfãos ──────────────────────────────');

// Build set of all declared image keys
const declaredImages = new Set();
stories.forEach(s => {
  if (s.imagemCapa) declaredImages.add(s.imagemCapa + '.png');
  if (s.personagemGuia) declaredImages.add(s.personagemGuia + '.png');
  (s.cenas || []).forEach(c => {
    if (c.imagemNarracao) declaredImages.add(c.imagemNarracao + '.png');
    if (c.imagemColorir)  declaredImages.add(c.imagemColorir + '.png');
  });
});

const imagesDir = path.join(ROOT, 'assets', 'images');
let orphanCount = 0;
if (exists(imagesDir)) {
  fs.readdirSync(imagesDir).forEach(f => {
    if (!declaredImages.has(f)) {
      warn(`ORPHAN image: assets/images/${f} — not referenced by any story`);
      orphanCount++;
    }
  });
}

console.log(`\n  Orphan images: ${orphanCount}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: Audio manifest consistency
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 7: audioManifest.js consistency ───────────────');

const manifestSrc = fs.readFileSync(path.join(ROOT, 'src', 'data', 'audioManifest.js'), 'utf8');
const readyEntriesMatch = manifestSrc.match(/const _readyEntries\s*=\s*\[([\s\S]*?)\];/);
const readyBody = readyEntriesMatch ? readyEntriesMatch[1].trim() : '';
const readyCount = readyBody.length === 0 ? 0 : (readyBody.match(/storyId/g) || []).length;

console.log(`  Manifest entries (ready): ${readyCount}/200`);
if (readyCount === 0) {
  info(`  All entries are MISSING status (expected — no audio recorded yet)`);
  pass('audioManifest _readyEntries = [] is correct for current state');
}

// Check that every require() in manifest points to a file that exists
const manifestDir = path.join(ROOT, 'src', 'data');
// Strip block comments and line comments before searching for require()
function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/\/\/[^\n]*/g, '');       // line comments
}
const requiresInManifest = [...stripComments(manifestSrc).matchAll(/require\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
requiresInManifest.forEach(reqPath => {
  const absPath = path.resolve(manifestDir, reqPath);
  if (!exists(absPath)) {
    fail(`BROKEN require() in audioManifest.js: ${reqPath} — file not on disk`);
  } else {
    pass(`manifest require() OK: ${reqPath}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: coloringImages.js consistency
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 8: coloringImages.js consistency ───────────────');

const coloringImgDir = path.join(ROOT, 'src', 'assets');
const coloringRequires = [...coloringImgSrc.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
let brokenColoring = 0;
coloringRequires.forEach(reqPath => {
  const absPath = path.resolve(coloringImgDir, reqPath);
  if (!exists(absPath)) {
    fail(`BROKEN require() in coloringImages.js: ${reqPath}`);
    brokenColoring++;
  } else {
    pass(`coloringImages require() OK: ${reqPath}`);
  }
});

console.log(`  Broken requires in coloringImages.js: ${brokenColoring}`);

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log('  RESUMO FINAL');
console.log('══════════════════════════════════════════════════════════');
console.log(`  ✓ Checks OK:      ${oks}`);
console.log(`  ⚠ Warnings:       ${warnings}`);
console.log(`  ✗ Errors:         ${errors}`);
console.log('');
console.log('  Audio:');
console.log(`    ${audioPresent}/200 ready  |  ${audioMissing}/200 missing`);
console.log('  Colorir:');
console.log(`    ${coloringPresent}/200 ready  |  ${coloringMissing}/200 missing (${STORIES_WITH_COLORING.size}/20 histórias)`);
console.log('  Capas:');
console.log(`    ${capaPresent} files present  |  ${capaMissing} declared/missing`);
console.log('  Legacy folders: ' + legacyCount);
console.log('  Orphan images:  ' + orphanCount);
console.log('');
if (errors > 0) {
  console.log('  STATUS: ✗ ISSUES FOUND — ver errors acima');
  process.exit(1);
} else if (warnings > 0) {
  console.log('  STATUS: ⚠ WARNINGS — revisar os items marcados');
} else {
  console.log('  STATUS: ✓ ALL GOOD');
}
