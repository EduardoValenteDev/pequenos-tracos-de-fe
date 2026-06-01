/**
 * src/data/audioManifest.js
 *
 * Central source of truth for all story narration audio assets.
 *
 * To add audio when a real recording is ready:
 *   1. Place MP3 at: assets/audio/{storyId}/{storyId}_scene_NN.mp3
 *   2. Add an entry to _readyEntries with the require() below
 *   3. Run: npm run audio:audit  (should show +1 ready)
 *   4. Run: npm run smoke        (all checks must pass)
 *   5. Never add require() for a file that does not exist
 *
 * See docs/AUDIO_PIPELINE_GUIDE.md for the complete delivery workflow.
 *
 * Asset path: assets/audio/{storyId}/{storyId}_scene_01.mp3 … {storyId}_scene_10.mp3
 *
 * Example entry (only after the file exists on disk):
 *   { storyId: 'creation', sceneKey: 'scene_01',
 *     audioAsset: require('../../assets/audio/creation/creation_scene_01.mp3') }
 */

export const AUDIO_STATUS = {
  MISSING: 'missing',
  READY: 'ready',
};

const STORY_IDS = [
  'creation', 'noah', 'david_goliath', 'jesus_children', 'daniel_lions',
  'jonah_big_fish', 'lost_sheep', 'good_samaritan', 'abraham_stars',
  'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi', 'esther_queen',
  'miraculous_catch', 'samuel_hears_god', 'josiah_young_king', 'solomon_wisdom',
  'mary_says_yes', 'timothy_faith', 'jesus_temple',
];

const _sceneKeys = Array.from({ length: 10 }, (_, i) => `scene_${String(i + 1).padStart(2, '0')}`);

// Add entries here when real MP3 files are recorded and bundled.
// Do NOT add require() for a file that does not yet exist in assets/.
// See docs/AUDIO_GUIDE.md for the exact format.
const _readyEntries = [
];

const _readyIndex = new Map(_readyEntries.map(e => [`${e.storyId}::${e.sceneKey}`, e]));

function _entry(storyId, sceneKey) {
  const r = _readyIndex.get(`${storyId}::${sceneKey}`);
  if (r) {
    return { storyId, sceneKey, status: AUDIO_STATUS.READY, audioAsset: r.audioAsset, requiredForLaunch: true };
  }
  return { storyId, sceneKey, status: AUDIO_STATUS.MISSING, audioAsset: null, requiredForLaunch: true };
}

export const AUDIO_MANIFEST = STORY_IDS.flatMap(sid =>
  _sceneKeys.map(sk => _entry(sid, sk))
);
