/**
 * scripts/audio-audit.js — Audio coverage report.
 *
 * Run: node scripts/audio-audit.js
 * Strict: node scripts/audio-audit.js --strict  (or AUDIO_LAUNCH_STRICT_MODE=1)
 *
 * Reports how many scenes per story have real MP3 files bundled.
 * In strict mode, exits 1 if any required audio scene is missing.
 *
 * File convention: assets/audio/{storyId}/{storyId}_scene_NN.mp3
 * Example: assets/audio/creation/creation_scene_01.mp3
 */

const fs = require('fs');
const path = require('path');

const STRICT =
  process.argv.includes('--strict') ||
  process.env.AUDIO_LAUNCH_STRICT_MODE === '1';

const root = path.resolve(__dirname, '..');
const audioDir = path.join(root, 'assets', 'audio');

const STORY_IDS = [
  'creation', 'noah', 'david_goliath', 'jesus_children', 'daniel_lions',
  'jonah_big_fish', 'lost_sheep', 'good_samaritan', 'abraham_stars',
  'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi', 'esther_queen',
  'miraculous_catch', 'samuel_hears_god', 'josiah_young_king', 'solomon_wisdom',
  'mary_says_yes', 'timothy_faith', 'jesus_temple',
];

const SCENE_KEYS = Array.from({ length: 10 }, (_, i) => `scene_${String(i + 1).padStart(2, '0')}`);
const SCENES_PER_STORY = SCENE_KEYS.length;
const TOTAL_REQUIRED = STORY_IDS.length * SCENES_PER_STORY;

// Count require() lines in _readyEntries (declared ready entries in manifest)
const manifestSrc = fs.readFileSync(path.join(root, 'src', 'data', 'audioManifest.js'), 'utf8');
const readyEntriesSection = manifestSrc.split('const _readyEntries')[1]?.split('];')[0] ?? '';
const manifestReadyCount = readyEntriesSection
  .split('\n')
  .filter(l => !l.trim().startsWith('//') && l.includes('require(')).length;

// Integrity: verify every require() path in _readyEntries points to an existing file
const requirePaths = [...readyEntriesSection.matchAll(/require\(['"](.*?)['"]\)/g)].map(m => m[1]);
const brokenRequires = requirePaths.filter(p => {
  const absPath = path.join(root, p.replace(/^\.\.\/\.\.\//, ''));
  return !fs.existsSync(absPath);
});

function fileExists(storyId, sceneKey) {
  const mp3 = path.join(audioDir, storyId, `${storyId}_${sceneKey}.mp3`);
  return fs.existsSync(mp3);
}

function scanStory(storyId) {
  const results = SCENE_KEYS.map(sk => ({ sceneKey: sk, hasFile: fileExists(storyId, sk) }));
  const ready = results.filter(r => r.hasFile).length;
  return { storyId, results, ready, total: SCENE_KEYS.length };
}

console.log('\n══════════════════════════════════════════════════════');
console.log('  Audio Coverage Report — Pequenos Traços de Fé');
if (STRICT) console.log('  MODE: STRICT — will exit 1 if any audio is missing');
console.log('══════════════════════════════════════════════════════\n');

let totalReady = 0;
const storiesMissing = [];

for (const sid of STORY_IDS) {
  const { results, ready, total } = scanStory(sid);
  totalReady += ready;
  const bar = results.map(r => (r.hasFile ? '█' : '░')).join('');
  const status = ready === total ? '✓ COMPLETA' : ready > 0 ? '~ parcial' : '✗ sem áudio';
  console.log(`  ${sid.padEnd(28)} [${bar}] ${ready}/${total}  ${status}`);
  if (ready < total) storiesMissing.push({ storyId: sid, ready, total });
}

const totalMissing = TOTAL_REQUIRED - totalReady;
const percent = Math.round((totalReady / TOTAL_REQUIRED) * 100);

console.log(`\n  Manifest 'ready' declarations: ${manifestReadyCount}`);
console.log(`  Files found in assets/audio/:  ${totalReady}`);
console.log(`\n  ${totalReady}/${TOTAL_REQUIRED} scenes ready (${percent}%)`);
console.log(`  ${totalMissing} scenes missing\n`);

// Integrity: manifest requires must match files on disk
if (manifestReadyCount !== totalReady) {
  console.warn(
    `  ⚠ Manifest declares ${manifestReadyCount} ready, but ${totalReady} files found on disk.\n` +
    `    Keep audioManifest.js and assets/audio/ in sync.\n`,
  );
}

if (brokenRequires.length > 0) {
  console.error('  ✗ INTEGRITY ERROR: require() paths in _readyEntries with no file on disk:');
  for (const p of brokenRequires) console.error(`    - ${p}`);
  console.error('');
  process.exit(1);
}

if (storiesMissing.length === 0) {
  console.log('  ✓ All stories have full audio coverage. App is launch-ready.\n');
} else {
  console.log(`  Stories with missing audio (${storiesMissing.length}):`);
  for (const s of storiesMissing) {
    console.log(`    - ${s.storyId}: ${s.total - s.ready} scenes missing`);
  }
  console.log('');
}

if (STRICT && totalMissing > 0) {
  console.error(`  ✗ STRICT MODE: ${totalMissing} required audio files are missing. Cannot launch.\n`);
  process.exit(1);
}
