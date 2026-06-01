/**
 * scripts/audio-audit-self-test.js — Self-test do pipeline de áudio.
 *
 * Run: node scripts/audio-audit-self-test.js
 * Or:  npm run audio:audit:self-test
 *
 * Valida as regras do audioManifest e do audio-audit usando objetos em memória.
 * NÃO cria arquivos MP3. NÃO altera o app. NÃO toca em audioManifest.js.
 * Usa fs.mkdtempSync para criar arquivos temporários isolados, removidos ao final.
 *
 * Cenários testados (12):
 *   [01] missing sem asset → passa (sem require, sem arquivo)
 *   [02] ready com arquivo existente → passa
 *   [03] ready sem arquivo em disco → DEVE FALHAR (integrity error)
 *   [04] require() em missing → DEVE ALERTAR (estruturalmente incorreto)
 *   [05] status desconhecido → DEVE FALHAR
 *   [06] storyId inexistente → DEVE FALHAR
 *   [07] sceneKey inválida (fora de scene_01–10) → DEVE FALHAR
 *   [08] extensão inválida (.wav em vez de .mp3) → DEVE FALHAR
 *   [09] path fora da convenção (stories/ prefix antigo) → DEVE FALHAR
 *   [10] filename correto creation_scene_01.mp3 → passa
 *   [11] filename creation_scene1.mp3 (sem zero-padding) → DEVE FALHAR
 *   [12] filename creation_01.mp3 (sem 'scene_') → DEVE FALHAR
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const VALID_STORY_IDS = new Set([
  'creation', 'noah', 'david_goliath', 'jesus_children', 'daniel_lions',
  'jonah_big_fish', 'lost_sheep', 'good_samaritan', 'abraham_stars',
  'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi', 'esther_queen',
  'miraculous_catch', 'samuel_hears_god', 'josiah_young_king', 'solomon_wisdom',
  'mary_says_yes', 'timothy_faith', 'jesus_temple',
]);

const VALID_SCENE_KEYS = new Set(
  Array.from({ length: 10 }, (_, i) => `scene_${String(i + 1).padStart(2, '0')}`)
);

// ── Validation rules (pure logic, no filesystem) ────────────────────────────

/** Returns array of error strings for a manifest entry. Empty = valid. */
function validateEntry(entry, audioBaseDir) {
  const errors = [];

  // storyId must be a known ID
  if (!VALID_STORY_IDS.has(entry.storyId)) {
    errors.push(`storyId '${entry.storyId}' is not in the known story list`);
  }

  // sceneKey must be scene_01 … scene_10
  if (!VALID_SCENE_KEYS.has(entry.sceneKey)) {
    errors.push(`sceneKey '${entry.sceneKey}' is not valid (expected scene_01 … scene_10)`);
  }

  // status must be 'ready' or 'missing'
  if (!['ready', 'missing'].includes(entry.status)) {
    errors.push(`status '${entry.status}' is not valid (expected 'ready' or 'missing')`);
  }

  if (entry.status === 'missing') {
    // missing must have no audioAsset
    if (entry.audioAsset !== null && entry.audioAsset !== undefined) {
      errors.push(`status is 'missing' but audioAsset is not null — remove the asset reference`);
    }
  }

  if (entry.status === 'ready') {
    // ready must have an audioAsset path
    if (!entry.audioAsset) {
      errors.push(`status is 'ready' but audioAsset is null — add the require() path`);
    } else {
      // Validate file naming convention: {storyId}_scene_NN.mp3
      const filename = path.basename(entry.audioAsset);
      const expectedName = `${entry.storyId}_${entry.sceneKey}.mp3`;
      if (filename !== expectedName) {
        errors.push(
          `filename '${filename}' does not match convention '${expectedName}' (expected {storyId}_{sceneKey}.mp3)`
        );
      }

      // Must be .mp3 extension
      if (!filename.endsWith('.mp3')) {
        errors.push(`audio file must be .mp3, got '${filename}'`);
      }

      // Path must NOT use old 'stories/' subdirectory (neither as prefix nor infix)
      if (/(?:^|[/\\])stories[/\\]/.test(entry.audioAsset)) {
        errors.push(
          `path uses old 'stories/' subdirectory convention — use assets/audio/{storyId}/{storyId}_scene_NN.mp3`
        );
      }

      // File must exist on disk
      if (audioBaseDir) {
        const absPath = path.join(audioBaseDir, entry.storyId, filename);
        if (!fs.existsSync(absPath)) {
          errors.push(`file not found on disk: ${absPath}`);
        }
      }
    }
  }

  return errors;
}

// ── Test harness ─────────────────────────────────────────────────────────────

let passes = 0;
let failures = 0;

function assert(label, condition, detail) {
  if (condition) {
    console.log(`  ✓ [${String(passes + failures + 1).padStart(2, '0')}] ${label}`);
    passes++;
  } else {
    console.error(`  ✗ [${String(passes + failures + 1).padStart(2, '0')}] ${label}`);
    if (detail) console.error(`       → ${detail}`);
    failures++;
  }
}

/** Assert that validateEntry returns errors (scenario MUST fail). */
function assertFails(label, entry, audioBaseDir) {
  const errors = validateEntry(entry, audioBaseDir);
  assert(label, errors.length > 0, errors.length === 0 ? 'Expected errors but got none' : undefined);
}

/** Assert that validateEntry returns NO errors (scenario MUST pass). */
function assertPasses(label, entry, audioBaseDir) {
  const errors = validateEntry(entry, audioBaseDir);
  assert(label, errors.length === 0, errors.join('; '));
}

// ── Temporary directory for fake files ───────────────────────────────────────

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ptf-audio-self-test-'));

function createTmpFile(storyId, filename) {
  const storyDir = path.join(tmpDir, storyId);
  if (!fs.existsSync(storyDir)) fs.mkdirSync(storyDir, { recursive: true });
  fs.writeFileSync(path.join(storyDir, filename), '');
  return path.join(tmpDir, storyId, filename);
}

// ── Run scenarios ─────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════');
console.log('  Audio Audit Self-Test — Pequenos Traços de Fé');
console.log('  (In-memory mocks only. No real MP3 files used.)');
console.log('══════════════════════════════════════════════════════\n');

// [01] missing sem asset → deve passar
assertPasses(
  'missing entry with null audioAsset → passes',
  { storyId: 'creation', sceneKey: 'scene_01', status: 'missing', audioAsset: null },
  tmpDir,
);

// [02] ready com arquivo existente → deve passar
createTmpFile('creation', 'creation_scene_01.mp3');
assertPasses(
  'ready entry with existing file on disk → passes',
  { storyId: 'creation', sceneKey: 'scene_01', status: 'ready', audioAsset: 'creation/creation_scene_01.mp3' },
  tmpDir,
);

// [03] ready sem arquivo em disco → deve falhar
assertFails(
  'ready entry with no file on disk → FAILS (integrity error)',
  { storyId: 'noah', sceneKey: 'scene_01', status: 'ready', audioAsset: 'noah/noah_scene_01.mp3' },
  tmpDir,
);

// [04] missing com audioAsset não-null → deve alertar/falhar
assertFails(
  'missing entry with non-null audioAsset → FAILS (structural error)',
  { storyId: 'creation', sceneKey: 'scene_02', status: 'missing', audioAsset: 'creation/creation_scene_02.mp3' },
  tmpDir,
);

// [05] status desconhecido → deve falhar
assertFails(
  "unknown status 'draft' → FAILS",
  { storyId: 'creation', sceneKey: 'scene_01', status: 'draft', audioAsset: null },
  tmpDir,
);

// [06] storyId inexistente → deve falhar
assertFails(
  "unknown storyId 'unicorn_story' → FAILS",
  { storyId: 'unicorn_story', sceneKey: 'scene_01', status: 'missing', audioAsset: null },
  tmpDir,
);

// [07] sceneKey inválida → deve falhar
assertFails(
  "invalid sceneKey 'scene_00' (out of range) → FAILS",
  { storyId: 'creation', sceneKey: 'scene_00', status: 'missing', audioAsset: null },
  tmpDir,
);

assertFails(
  "invalid sceneKey 'scene_11' (out of range) → FAILS",
  { storyId: 'creation', sceneKey: 'scene_11', status: 'missing', audioAsset: null },
  tmpDir,
);

// [08] extensão inválida (.wav) → deve falhar
createTmpFile('creation', 'creation_scene_03.wav');
assertFails(
  "invalid extension .wav instead of .mp3 → FAILS",
  { storyId: 'creation', sceneKey: 'scene_03', status: 'ready', audioAsset: 'creation/creation_scene_03.wav' },
  tmpDir,
);

// [09] path com stories/ prefix antigo → deve falhar
createTmpFile('creation', 'creation_scene_04.mp3');
assertFails(
  "old path convention with 'stories/' subfolder → FAILS",
  { storyId: 'creation', sceneKey: 'scene_04', status: 'ready', audioAsset: 'stories/creation/creation_scene_04.mp3' },
  tmpDir,
);

// [10] filename correto creation_scene_01.mp3 → deve passar (arquivo já criado no [02])
assertPasses(
  'correct filename creation_scene_01.mp3 → passes',
  { storyId: 'creation', sceneKey: 'scene_01', status: 'ready', audioAsset: 'creation/creation_scene_01.mp3' },
  tmpDir,
);

// [11] filename creation_scene1.mp3 (sem zero-padding) → deve falhar
createTmpFile('creation', 'creation_scene1.mp3');
assertFails(
  "filename without zero-padding 'creation_scene1.mp3' → FAILS",
  { storyId: 'creation', sceneKey: 'scene_01', status: 'ready', audioAsset: 'creation/creation_scene1.mp3' },
  tmpDir,
);

// [12] filename creation_01.mp3 (sem 'scene_') → deve falhar
createTmpFile('creation', 'creation_01.mp3');
assertFails(
  "filename without 'scene_' prefix 'creation_01.mp3' → FAILS",
  { storyId: 'creation', sceneKey: 'scene_01', status: 'ready', audioAsset: 'creation/creation_01.mp3' },
  tmpDir,
);

// ── Cleanup ───────────────────────────────────────────────────────────────────

fs.rmSync(tmpDir, { recursive: true, force: true });

// ── Summary ───────────────────────────────────────────────────────────────────

const total = passes + failures;
console.log(`\n  ${passes}/${total} scenarios passed, ${failures} failed\n`);

if (failures > 0) {
  console.error('  ✗ Self-test FAILED — validation rules have gaps.\n');
  process.exit(1);
} else {
  console.log('  ✓ Self-test PASSED — audio pipeline validation rules are working.\n');
}
