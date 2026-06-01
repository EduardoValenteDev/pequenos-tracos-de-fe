/**
 * validate-audio-assets.js — Validação específica de assets de áudio.
 *
 * Verifica: padrão de nome, extensão, tamanho, pasta, manifest consistency.
 * Não altera nada. Gera relatório.
 *
 * Run: node scripts/validate-audio-assets.js
 * Run: node scripts/validate-audio-assets.js --story creation
 * Run: node scripts/validate-audio-assets.js --only-ready
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT         = path.join(__dirname, '..');
const FILTER_STORY = process.argv.includes('--story') ? process.argv[process.argv.indexOf('--story') + 1] : null;
const ONLY_READY   = process.argv.includes('--only-ready');

// ── Parse stories.js ─────────────────────────────────────────────────────────
let src = fs.readFileSync(path.join(ROOT, 'src', 'data', 'stories.js'), 'utf8');
src = src.replace(/^export\s+const\s+(\w+)\s*=/, 'const $1 =');
const fn = new Function('module', 'exports', src + '\nmodule.exports={stories};');
const mod = { exports: {} };
fn(mod, mod.exports);
const { stories } = mod.exports;

// ── Parse audioManifest for _readyEntries ────────────────────────────────────
const manifestSrc = fs.readFileSync(path.join(ROOT, 'src', 'data', 'audioManifest.js'), 'utf8');
const readyEntriesMatch = manifestSrc.match(/const _readyEntries\s*=\s*\[([\s\S]*?)\];/);
const readyBody = readyEntriesMatch ? readyEntriesMatch[1].trim() : '';
const readySet  = new Set(); // "storyId::sceneKey"
const rReady    = /storyId:\s*['"](\w+)['"]\s*,\s*sceneKey:\s*['"](\w+)['"]/g;
let rm;
while ((rm = rReady.exec(readyBody)) !== null) {
  readySet.add(`${rm[1]}::${rm[2]}`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad2(n) { return String(n).padStart(2, '0'); }
function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function sizeKB(p) { try { return Math.round(fs.statSync(p).size / 1024); } catch { return 0; } }

const MAX_KB = 3000;  // 3 MB — warn if larger
const MIN_KB = 40;    // 40 KB — warn if smaller (may be empty/corrupt)
const IDEAL_MAX_KB = 1500; // 1.5 MB — recommended max for ~90s @ 128kbps

let total = 0; let present = 0; let missing = 0;
let warns = 0; let errors = 0;

function pass(s)  { total++; present++; }
function warn(s)  { total++; present++; warns++;  console.log('⚠ ' + s); }
function miss(s)  { total++; missing++;             if (!ONLY_READY) console.log('○ ' + s); }
function fail(s)  { total++; errors++;  console.log('✗ ' + s); }

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log('  VALIDATE-AUDIO-ASSETS — Pequenos Traços de Fé');
if (FILTER_STORY) console.log(`  Filtering: --story ${FILTER_STORY}`);
if (ONLY_READY)   console.log('  Mode: --only-ready (only reporting present files)');
console.log('══════════════════════════════════════════════════════════\n');

const filteredStories = FILTER_STORY ? stories.filter(s => s.id === FILTER_STORY) : stories;

if (FILTER_STORY && filteredStories.length === 0) {
  console.error(`✗ Story not found: ${FILTER_STORY}`);
  process.exit(1);
}

// ── Per-story validation ──────────────────────────────────────────────────────
const missingByStory = {};

filteredStories.forEach(story => {
  const storyMissing = [];
  let storyPresent   = 0;
  const audioDir     = path.join(ROOT, 'assets', 'audio', story.id);

  // 1. Folder must exist
  if (!exists(audioDir)) {
    fail(`MISSING folder: assets/audio/${story.id}/ — run: mkdir assets/audio/${story.id}`);
  }

  for (let i = 1; i <= 10; i++) {
    const sceneKey  = `scene_${pad2(i)}`;
    const fileName  = `${story.id}_${sceneKey}.mp3`;
    const filePath  = path.join(audioDir, fileName);
    const isInManifest = readySet.has(`${story.id}::${sceneKey}`);

    if (!exists(filePath)) {
      // Only error if it's registered in manifest but file is gone
      if (isInManifest) {
        fail(`BROKEN manifest: ${fileName} is in _readyEntries but FILE NOT ON DISK`);
      } else {
        miss(`MISSING: assets/audio/${story.id}/${fileName}`);
        storyMissing.push(fileName);
      }
    } else {
      // File exists — validate
      const kbSize = sizeKB(filePath);

      if (isInManifest) {
        // Registered as ready — stricter validation
        if (kbSize < MIN_KB) {
          fail(`EMPTY/TINY ready audio (${kbSize} KB): ${story.id}/${fileName} — possibly corrupt`);
        } else if (kbSize > MAX_KB) {
          warn(`VERY LARGE ready audio (${kbSize} KB): ${story.id}/${fileName} — recommend < 1500 KB`);
        } else if (kbSize > IDEAL_MAX_KB) {
          warn(`LARGE ready audio (${kbSize} KB): ${story.id}/${fileName} — consider compressing`);
        } else {
          pass(`READY ✓ ${story.id}/${fileName} (${kbSize} KB)`);
        }
        storyPresent++;
      } else {
        // Present but not in manifest — informational
        warn(`PRESENT but NOT in manifest: ${story.id}/${fileName} — add to _readyEntries in audioManifest.js`);
        storyPresent++;
      }
    }
  }

  // 2. Check for wrong-named files in the folder
  if (exists(audioDir)) {
    fs.readdirSync(audioDir).forEach(f => {
      if (f === '.gitkeep') return;
      const expectedPattern = new RegExp(`^${story.id}_scene_\\d{2}\\.mp3$`);
      const ext = path.extname(f).toLowerCase();
      if (ext !== '.mp3') {
        warn(`WRONG_EXT in audio folder: assets/audio/${story.id}/${f} — rename to .mp3`);
      } else if (!expectedPattern.test(f)) {
        warn(`WRONG_NAME: assets/audio/${story.id}/${f} — expected: ${story.id}_scene_NN.mp3`);
      }
    });
  }

  if (storyMissing.length > 0) {
    missingByStory[story.id] = storyMissing;
  }
});

// ── Manifest integrity check ──────────────────────────────────────────────────
console.log('\n── Manifest integrity ──────────────────────────────────');
readySet.forEach(key => {
  const [sid, sk] = key.split('::');
  const fileName = `${sid}_${sk}.mp3`;
  const filePath = path.join(ROOT, 'assets', 'audio', sid, fileName);
  if (!exists(filePath)) {
    fail(`BROKEN manifest entry: ${key} — file missing: assets/audio/${sid}/${fileName}`);
  } else {
    pass(`manifest entry OK: ${key}`);
  }
});

if (readySet.size === 0) {
  console.log('  _readyEntries is empty (correct — no audio recorded yet)');
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log('  RESUMO');
console.log('══════════════════════════════════════════════════════════');
console.log(`  Áudios presentes:  ${present}/${filteredStories.length * 10}`);
console.log(`  Áudios ausentes:   ${missing}/${filteredStories.length * 10}`);
console.log(`  Ready no manifest: ${readySet.size}/200`);
console.log(`  Warnings:          ${warns}`);
console.log(`  Errors:            ${errors}`);

if (Object.keys(missingByStory).length > 0 && !ONLY_READY) {
  console.log('\n  Histórias com áudio ausente:');
  Object.entries(missingByStory).forEach(([id, files]) => {
    console.log(`    ${id}: ${files.length}/10 cenas sem áudio`);
  });
}

if (errors > 0) { process.exit(1); }
