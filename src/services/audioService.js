/**
 * src/services/audioService.js
 *
 * Manifest-query functions for story narration audio.
 * All functions read from AUDIO_MANIFEST; none hold Audio.Sound state.
 * Audio.Sound lifecycle is managed exclusively by AudioPlayer.js.
 */

import { AUDIO_MANIFEST, AUDIO_STATUS } from '../data/audioManifest';

// O(1) lookup: `${storyId}::${sceneKey}` → entry
const _index = new Map(AUDIO_MANIFEST.map(e => [`${e.storyId}::${e.sceneKey}`, e]));

const _sceneKeys = Array.from({ length: 10 }, (_, i) => `scene_${String(i + 1).padStart(2, '0')}`);

/** Returns the manifest entry for a scene, or null if not found. */
export function getSceneAudio(storyId, sceneKey) {
  return _index.get(`${storyId}::${sceneKey}`) ?? null;
}

/** True only when the scene has a real audio file bundled (status === 'ready'). */
export function hasSceneAudio(storyId, sceneKey) {
  return _index.get(`${storyId}::${sceneKey}`)?.status === AUDIO_STATUS.READY;
}

/** Returns 'ready' | 'missing' | 'not_found'. */
export function getSceneAudioStatus(storyId, sceneKey) {
  const entry = _index.get(`${storyId}::${sceneKey}`);
  if (!entry) return 'not_found';
  return entry.status;
}

/** { total, ready, missing, percent } — audio coverage for one story. */
export function getStoryAudioCoverage(storyId) {
  const entries = AUDIO_MANIFEST.filter(e => e.storyId === storyId);
  const ready = entries.filter(e => e.status === AUDIO_STATUS.READY).length;
  const total = entries.length;
  return { total, ready, missing: total - ready, percent: total > 0 ? ready / total : 0 };
}

/** True if the story has at least one ready audio scene. */
export function storyHasAnyAudio(storyId) {
  return AUDIO_MANIFEST.some(e => e.storyId === storyId && e.status === AUDIO_STATUS.READY);
}

/** True only if ALL required scenes for this story have audio. Used for the 🎵 chip. */
export function storyHasAllRequiredAudio(storyId) {
  const required = AUDIO_MANIFEST.filter(e => e.storyId === storyId && e.requiredForLaunch);
  return required.length > 0 && required.every(e => e.status === AUDIO_STATUS.READY);
}

/** Returns an array of sceneKeys that are still missing audio for a story. */
export function getMissingAudioScenes(storyId) {
  return AUDIO_MANIFEST
    .filter(e => e.storyId === storyId && e.status === AUDIO_STATUS.MISSING)
    .map(e => e.sceneKey);
}

/** Ordered array of audioAsset values for a story (null for missing scenes). For Livrinho. */
export function getStoryAudioSequence(storyId) {
  return _sceneKeys.map(sk => _index.get(`${storyId}::${sk}`)?.audioAsset ?? null);
}

/**
 * Overall launch readiness across all stories.
 * { totalRequired, totalReady, totalMissing, storiesReady, storiesMissing, launchReady }
 */
export function getAudioLaunchReadiness() {
  const allStoryIds = [...new Set(AUDIO_MANIFEST.map(e => e.storyId))];
  const required = AUDIO_MANIFEST.filter(e => e.requiredForLaunch);
  const totalReady = required.filter(e => e.status === AUDIO_STATUS.READY).length;
  const totalRequired = required.length;
  const storiesReady = allStoryIds.filter(id => storyHasAllRequiredAudio(id));
  const storiesMissing = allStoryIds.filter(id => !storyHasAllRequiredAudio(id));
  return {
    totalRequired,
    totalReady,
    totalMissing: totalRequired - totalReady,
    storiesReady,
    storiesMissing,
    launchReady: totalRequired === totalReady,
  };
}
