/**
 * validate-image-assets.js — Validação específica de assets de imagem.
 *
 * Verifica: coloringImages.js consistency, capas declaradas vs disco,
 * arquivos grandes, extensões erradas, arquivos órfãos, pastas legadas.
 *
 * Não altera nada. Gera relatório.
 *
 * Run: node scripts/validate-image-assets.js
 * Run: node scripts/validate-image-assets.js --story noah
 * Run: node scripts/validate-image-assets.js --check-sizes
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT         = path.join(__dirname, '..');
const FILTER_STORY = process.argv.includes('--story') ? process.argv[process.argv.indexOf('--story') + 1] : null;
const CHECK_SIZES  = process.argv.includes('--check-sizes');

// ── Parse stories.js ─────────────────────────────────────────────────────────
let src = fs.readFileSync(path.join(ROOT, 'src', 'data', 'stories.js'), 'utf8');
src = src.replace(/^export\s+const\s+(\w+)\s*=/, 'const $1 =');
const fn = new Function('module', 'exports', src + '\nmodule.exports={stories};');
const mod = { exports: {} };
fn(mod, mod.exports);
const { stories } = mod.exports;

// ── Parse coloringImages.js ───────────────────────────────────────────────────
const coloringImgDir = path.join(ROOT, 'src', 'assets');
const coloringImgSrc = fs.readFileSync(path.join(coloringImgDir, 'coloringImages.js'), 'utf8');

// Extract all require() calls
const coloringRequires = [];
const reReq = /require\(['"]([^'"]+)['"]\)/g;
let rm;
while ((rm = reReq.exec(coloringImgSrc)) !== null) {
  coloringRequires.push(rm[1]);
}

// Determine which storyIds are registered
const REGISTERED_STORIES = new Set();
coloringRequires.forEach(req => {
  // Resolve path relative to src/assets/coloringImages.js — correct resolution
  const abs = path.resolve(coloringImgDir, req);
  // Extract storyId from path: assets/stories/{folder}/colorir/{file}
  const match = abs.match(/stories[/\\](\w+)[/\\]colorir[/\\]/);
  if (match) REGISTERED_STORIES.add(match[1]);
});

// Folder-to-storyId reverse mapping
const FOLDER_TO_STORY = {
  noe:           'noah',
  davi_golias:   'david_goliath',
  jesus_criancas:'jesus_children',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad2(n) { return String(n).padStart(2, '0'); }
function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function sizeKB(p) { try { return Math.round(fs.statSync(p).size / 1024); } catch { return 0; } }

const COLORING_WARN_KB   = 150;  // warn above this
const COLORING_CRIT_KB   = 300;  // critical above this
const COVER_WARN_KB      = 150;  // covers should be small

let errors = 0; let warnings = 0; let oks = 0;
function pass(s)  { oks++;      }
function warn(s)  { warnings++; console.log('⚠ ' + s); }
function fail(s)  { errors++;   console.log('✗ ' + s); }
function info(s)  { console.log('  ' + s); }

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log('  VALIDATE-IMAGE-ASSETS — Pequenos Traços de Fé');
if (FILTER_STORY) console.log(`  Filtering: --story ${FILTER_STORY}`);
console.log('══════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A: coloringImages.js require() → file on disk
// ─────────────────────────────────────────────────────────────────────────────
console.log('── A: coloringImages.js require() validation ──────────');

let reqOk = 0; let reqBroken = 0;
coloringRequires.forEach(req => {
  const abs = path.resolve(coloringImgDir, req);
  if (!exists(abs)) {
    fail(`BROKEN require(): ${req} — file not found`);
    reqBroken++;
  } else {
    reqOk++;
    if (CHECK_SIZES) {
      const kb = sizeKB(abs);
      if (kb > COLORING_CRIT_KB) {
        warn(`LARGE (${kb} KB): ${path.relative(ROOT, abs)} — comprimir para < 150 KB`);
      } else if (kb > COLORING_WARN_KB) {
        warn(`MEDIUM (${kb} KB): ${path.relative(ROOT, abs)} — avaliar compressão`);
      } else {
        pass(`OK (${kb} KB): ${path.relative(ROOT, abs)}`);
      }
    }
  }
});

console.log(`  require() OK:     ${reqOk}`);
console.log(`  require() broken: ${reqBroken}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B: Cover images (imagemCapa) declared in stories.js
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── B: Cover images (imagemCapa) ────────────────────────');

let coverOk = 0; let coverMissing = 0; let coverNotDeclared = 0;
const filteredStories = FILTER_STORY ? stories.filter(s => s.id === FILTER_STORY) : stories;

filteredStories.forEach(s => {
  if (!s.imagemCapa) {
    coverNotDeclared++;
    info(`NOT_DECLARED: ${s.id} — imagemCapa: null (placeholder expected)`);
    return;
  }
  const p = path.join(ROOT, 'assets', 'images', s.imagemCapa + '.png');
  if (exists(p)) {
    coverOk++;
    if (CHECK_SIZES) {
      const kb = sizeKB(p);
      if (kb > COVER_WARN_KB) warn(`LARGE cover (${kb} KB): assets/images/${s.imagemCapa}.png`);
      else pass(`cover OK: ${s.imagemCapa}.png`);
    }
  } else {
    fail(`MISSING cover: assets/images/${s.imagemCapa}.png — declared but not on disk`);
    coverMissing++;
  }
});

console.log(`  Covers OK:           ${coverOk}`);
console.log(`  Covers missing:      ${coverMissing}`);
console.log(`  Covers not declared: ${coverNotDeclared}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C: Narration images declared in cenas
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── C: Narration images (imagemNarracao) ────────────────');

let narOk = 0; let narMissing = 0;
filteredStories.forEach(s => {
  (s.cenas || []).forEach((cena, idx) => {
    if (!cena.imagemNarracao) return;
    const p = path.join(ROOT, 'assets', 'images', cena.imagemNarracao + '.png');
    if (exists(p)) {
      narOk++;
      if (CHECK_SIZES) {
        const kb = sizeKB(p);
        if (kb > 200) warn(`LARGE narImg (${kb} KB): assets/images/${cena.imagemNarracao}.png`);
      }
    } else {
      fail(`MISSING narImg: assets/images/${cena.imagemNarracao}.png (${s.id} cena ${idx + 1})`);
      narMissing++;
    }
  });
});

console.log(`  Narration images OK:      ${narOk}`);
console.log(`  Narration images missing: ${narMissing}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D: Orphan files in assets/images/
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── D: Orphan images ────────────────────────────────────');

const declaredImages = new Set();
stories.forEach(s => {
  if (s.imagemCapa)     declaredImages.add(s.imagemCapa + '.png');
  if (s.personagemGuia) declaredImages.add(s.personagemGuia + '.png');
  (s.cenas || []).forEach(c => {
    if (c.imagemNarracao) declaredImages.add(c.imagemNarracao + '.png');
    if (c.imagemColorir)  declaredImages.add(c.imagemColorir + '.png');
  });
});

// Known system images not in stories.js
const SYSTEM_IMAGES = new Set(['adaptive-icon.png', 'favicon.png', 'icon.png', 'splash-icon.png']);

const imagesDir = path.join(ROOT, 'assets', 'images');
let orphanCount = 0;
if (exists(imagesDir)) {
  fs.readdirSync(imagesDir).forEach(f => {
    if (!declaredImages.has(f) && !SYSTEM_IMAGES.has(f)) {
      warn(`ORPHAN: assets/images/${f} — not referenced by any story in stories.js`);
      orphanCount++;
    }
  });
}

console.log(`  Orphan files: ${orphanCount}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E: Legacy folders with spaces/accents
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── E: Legacy folders ───────────────────────────────────');

const storiesDir = path.join(ROOT, 'assets', 'stories');
if (exists(storiesDir)) {
  fs.readdirSync(storiesDir).forEach(f => {
    if (/[\sÀ-ɏ]/.test(f)) {
      // Has spaces or accented chars
      const fp = path.join(storiesDir, f);
      if (fs.statSync(fp).isDirectory()) {
        warn(`LEGACY folder (spaces/accents): assets/stories/${f} — confirm zero require() references, then schedule removal`);
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F: Expected folders for future stories
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── F: Future coloring image structure ──────────────────');

const storiesWithNoFolder = stories.filter(s => {
  if (REGISTERED_STORIES.has('noe') && s.id === 'noah') return false;
  if (REGISTERED_STORIES.has('davi_golias') && s.id === 'david_goliath') return false;
  if (REGISTERED_STORIES.has('jesus_criancas') && s.id === 'jesus_children') return false;
  if (REGISTERED_STORIES.has(s.id)) return false;
  return true;
});

console.log(`  Stories without coloring images registered: ${storiesWithNoFolder.length}/20`);
if (storiesWithNoFolder.length > 0 && !FILTER_STORY) {
  storiesWithNoFolder.slice(0, 5).forEach(s => {
    info(`  Pending: ${s.id} — future folder: assets/stories/${s.id}/colorir/`);
  });
  if (storiesWithNoFolder.length > 5) {
    info(`  ... and ${storiesWithNoFolder.length - 5} more`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log('  RESUMO');
console.log('══════════════════════════════════════════════════════════');
console.log(`  ✓ Checks OK:       ${oks}`);
console.log(`  ⚠ Warnings:        ${warnings}`);
console.log(`  ✗ Errors:          ${errors}`);
console.log(`  require() OK:      ${reqOk}  |  broken: ${reqBroken}`);
console.log(`  Covers OK:         ${coverOk}  |  missing: ${coverMissing}  |  not declared: ${coverNotDeclared}`);
console.log(`  Narration OK:      ${narOk}   |  missing: ${narMissing}`);
console.log(`  Orphans:           ${orphanCount}`);

if (errors > 0) { process.exit(1); }
