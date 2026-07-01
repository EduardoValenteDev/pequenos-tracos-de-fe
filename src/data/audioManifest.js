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
  // ── A Criação (creation) — 10 áudios reais ──
  { storyId: 'creation', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/creation/creation_scene_01.mp3') },
  { storyId: 'creation', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/creation/creation_scene_02.mp3') },
  { storyId: 'creation', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/creation/creation_scene_03.mp3') },
  { storyId: 'creation', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/creation/creation_scene_04.mp3') },
  { storyId: 'creation', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/creation/creation_scene_05.mp3') },
  { storyId: 'creation', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/creation/creation_scene_06.mp3') },
  { storyId: 'creation', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/creation/creation_scene_07.mp3') },
  { storyId: 'creation', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/creation/creation_scene_08.mp3') },
  { storyId: 'creation', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/creation/creation_scene_09.mp3') },
  { storyId: 'creation', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/creation/creation_scene_10.mp3') },
  // ── Noé e o Sinal da Aliança (noah) — 10 áudios reais ──
  { storyId: 'noah', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/noah/noah_scene_01.mp3') },
  { storyId: 'noah', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/noah/noah_scene_02.mp3') },
  { storyId: 'noah', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/noah/noah_scene_03.mp3') },
  { storyId: 'noah', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/noah/noah_scene_04.mp3') },
  { storyId: 'noah', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/noah/noah_scene_05.mp3') },
  { storyId: 'noah', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/noah/noah_scene_06.mp3') },
  { storyId: 'noah', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/noah/noah_scene_07.mp3') },
  { storyId: 'noah', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/noah/noah_scene_08.mp3') },
  { storyId: 'noah', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/noah/noah_scene_09.mp3') },
  { storyId: 'noah', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/noah/noah_scene_10.mp3') },
  // ── Davi e Golias (david_goliath) — 10 áudios reais ──
  { storyId: 'david_goliath', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/david_goliath/david_goliath_scene_01.mp3') },
  { storyId: 'david_goliath', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/david_goliath/david_goliath_scene_02.mp3') },
  { storyId: 'david_goliath', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/david_goliath/david_goliath_scene_03.mp3') },
  { storyId: 'david_goliath', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/david_goliath/david_goliath_scene_04.mp3') },
  { storyId: 'david_goliath', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/david_goliath/david_goliath_scene_05.mp3') },
  { storyId: 'david_goliath', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/david_goliath/david_goliath_scene_06.mp3') },
  { storyId: 'david_goliath', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/david_goliath/david_goliath_scene_07.mp3') },
  { storyId: 'david_goliath', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/david_goliath/david_goliath_scene_08.mp3') },
  { storyId: 'david_goliath', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/david_goliath/david_goliath_scene_09.mp3') },
  { storyId: 'david_goliath', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/david_goliath/david_goliath_scene_10.mp3') },
  // ── Jesus e as Crianças (jesus_children) — 10 áudios reais ──
  { storyId: 'jesus_children', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/jesus_children/jesus_children_scene_01.mp3') },
  { storyId: 'jesus_children', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/jesus_children/jesus_children_scene_02.mp3') },
  { storyId: 'jesus_children', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/jesus_children/jesus_children_scene_03.mp3') },
  { storyId: 'jesus_children', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/jesus_children/jesus_children_scene_04.mp3') },
  { storyId: 'jesus_children', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/jesus_children/jesus_children_scene_05.mp3') },
  { storyId: 'jesus_children', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/jesus_children/jesus_children_scene_06.mp3') },
  { storyId: 'jesus_children', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/jesus_children/jesus_children_scene_07.mp3') },
  { storyId: 'jesus_children', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/jesus_children/jesus_children_scene_08.mp3') },
  { storyId: 'jesus_children', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/jesus_children/jesus_children_scene_09.mp3') },
  { storyId: 'jesus_children', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/jesus_children/jesus_children_scene_10.mp3') },
  // ── Daniel e os Leões (daniel_lions) — 10 áudios reais ──
  { storyId: 'daniel_lions', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/daniel_lions/daniel_lions_scene_01.mp3') },
  { storyId: 'daniel_lions', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/daniel_lions/daniel_lions_scene_02.mp3') },
  { storyId: 'daniel_lions', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/daniel_lions/daniel_lions_scene_03.mp3') },
  { storyId: 'daniel_lions', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/daniel_lions/daniel_lions_scene_04.mp3') },
  { storyId: 'daniel_lions', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/daniel_lions/daniel_lions_scene_05.mp3') },
  { storyId: 'daniel_lions', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/daniel_lions/daniel_lions_scene_06.mp3') },
  { storyId: 'daniel_lions', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/daniel_lions/daniel_lions_scene_07.mp3') },
  { storyId: 'daniel_lions', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/daniel_lions/daniel_lions_scene_08.mp3') },
  { storyId: 'daniel_lions', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/daniel_lions/daniel_lions_scene_09.mp3') },
  { storyId: 'daniel_lions', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/daniel_lions/daniel_lions_scene_10.mp3') },
  // ── Jonas e o Grande Peixe (jonah_big_fish) — 10 áudios reais ──
  { storyId: 'jonah_big_fish', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/jonah_big_fish/jonah_big_fish_scene_01.mp3') },
  { storyId: 'jonah_big_fish', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/jonah_big_fish/jonah_big_fish_scene_02.mp3') },
  { storyId: 'jonah_big_fish', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/jonah_big_fish/jonah_big_fish_scene_03.mp3') },
  { storyId: 'jonah_big_fish', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/jonah_big_fish/jonah_big_fish_scene_04.mp3') },
  { storyId: 'jonah_big_fish', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/jonah_big_fish/jonah_big_fish_scene_05.mp3') },
  { storyId: 'jonah_big_fish', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/jonah_big_fish/jonah_big_fish_scene_06.mp3') },
  { storyId: 'jonah_big_fish', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/jonah_big_fish/jonah_big_fish_scene_07.mp3') },
  { storyId: 'jonah_big_fish', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/jonah_big_fish/jonah_big_fish_scene_08.mp3') },
  { storyId: 'jonah_big_fish', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/jonah_big_fish/jonah_big_fish_scene_09.mp3') },
  { storyId: 'jonah_big_fish', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/jonah_big_fish/jonah_big_fish_scene_10.mp3') },
  // ── A Ovelha Perdida (lost_sheep) — 10 áudios reais ──
  { storyId: 'lost_sheep', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/lost_sheep/lost_sheep_scene_01.mp3') },
  { storyId: 'lost_sheep', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/lost_sheep/lost_sheep_scene_02.mp3') },
  { storyId: 'lost_sheep', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/lost_sheep/lost_sheep_scene_03.mp3') },
  { storyId: 'lost_sheep', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/lost_sheep/lost_sheep_scene_04.mp3') },
  { storyId: 'lost_sheep', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/lost_sheep/lost_sheep_scene_05.mp3') },
  { storyId: 'lost_sheep', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/lost_sheep/lost_sheep_scene_06.mp3') },
  { storyId: 'lost_sheep', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/lost_sheep/lost_sheep_scene_07.mp3') },
  { storyId: 'lost_sheep', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/lost_sheep/lost_sheep_scene_08.mp3') },
  { storyId: 'lost_sheep', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/lost_sheep/lost_sheep_scene_09.mp3') },
  { storyId: 'lost_sheep', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/lost_sheep/lost_sheep_scene_10.mp3') },
  // ── O Bom Samaritano (good_samaritan) — 10 áudios reais ──
  { storyId: 'good_samaritan', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/good_samaritan/good_samaritan_scene_01.mp3') },
  { storyId: 'good_samaritan', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/good_samaritan/good_samaritan_scene_02.mp3') },
  { storyId: 'good_samaritan', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/good_samaritan/good_samaritan_scene_03.mp3') },
  { storyId: 'good_samaritan', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/good_samaritan/good_samaritan_scene_04.mp3') },
  { storyId: 'good_samaritan', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/good_samaritan/good_samaritan_scene_05.mp3') },
  { storyId: 'good_samaritan', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/good_samaritan/good_samaritan_scene_06.mp3') },
  { storyId: 'good_samaritan', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/good_samaritan/good_samaritan_scene_07.mp3') },
  { storyId: 'good_samaritan', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/good_samaritan/good_samaritan_scene_08.mp3') },
  { storyId: 'good_samaritan', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/good_samaritan/good_samaritan_scene_09.mp3') },
  { storyId: 'good_samaritan', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/good_samaritan/good_samaritan_scene_10.mp3') },
  // ── Abraão e as Estrelas (abraham_stars) — 10 áudios reais ──
  { storyId: 'abraham_stars', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/abraham_stars/abraham_stars_scene_01.mp3') },
  { storyId: 'abraham_stars', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/abraham_stars/abraham_stars_scene_02.mp3') },
  { storyId: 'abraham_stars', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/abraham_stars/abraham_stars_scene_03.mp3') },
  { storyId: 'abraham_stars', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/abraham_stars/abraham_stars_scene_04.mp3') },
  { storyId: 'abraham_stars', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/abraham_stars/abraham_stars_scene_05.mp3') },
  { storyId: 'abraham_stars', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/abraham_stars/abraham_stars_scene_06.mp3') },
  { storyId: 'abraham_stars', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/abraham_stars/abraham_stars_scene_07.mp3') },
  { storyId: 'abraham_stars', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/abraham_stars/abraham_stars_scene_08.mp3') },
  { storyId: 'abraham_stars', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/abraham_stars/abraham_stars_scene_09.mp3') },
  { storyId: 'abraham_stars', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/abraham_stars/abraham_stars_scene_10.mp3') },
  // ── José e a Túnica Especial (joseph_colorful_coat) — 10 áudios reais ──
  { storyId: 'joseph_colorful_coat', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/joseph_colorful_coat/joseph_colorful_coat_scene_01.mp3') },
  { storyId: 'joseph_colorful_coat', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/joseph_colorful_coat/joseph_colorful_coat_scene_02.mp3') },
  { storyId: 'joseph_colorful_coat', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/joseph_colorful_coat/joseph_colorful_coat_scene_03.mp3') },
  { storyId: 'joseph_colorful_coat', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/joseph_colorful_coat/joseph_colorful_coat_scene_04.mp3') },
  { storyId: 'joseph_colorful_coat', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/joseph_colorful_coat/joseph_colorful_coat_scene_05.mp3') },
  { storyId: 'joseph_colorful_coat', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/joseph_colorful_coat/joseph_colorful_coat_scene_06.mp3') },
  { storyId: 'joseph_colorful_coat', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/joseph_colorful_coat/joseph_colorful_coat_scene_07.mp3') },
  { storyId: 'joseph_colorful_coat', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/joseph_colorful_coat/joseph_colorful_coat_scene_08.mp3') },
  { storyId: 'joseph_colorful_coat', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/joseph_colorful_coat/joseph_colorful_coat_scene_09.mp3') },
  { storyId: 'joseph_colorful_coat', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/joseph_colorful_coat/joseph_colorful_coat_scene_10.mp3') },
  // ── Moisés e o Mar Vermelho (moses_red_sea) — 10 áudios reais ──
  { storyId: 'moses_red_sea', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/moses_red_sea/moses_red_sea_scene_01.mp3') },
  { storyId: 'moses_red_sea', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/moses_red_sea/moses_red_sea_scene_02.mp3') },
  { storyId: 'moses_red_sea', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/moses_red_sea/moses_red_sea_scene_03.mp3') },
  { storyId: 'moses_red_sea', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/moses_red_sea/moses_red_sea_scene_04.mp3') },
  { storyId: 'moses_red_sea', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/moses_red_sea/moses_red_sea_scene_05.mp3') },
  { storyId: 'moses_red_sea', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/moses_red_sea/moses_red_sea_scene_06.mp3') },
  { storyId: 'moses_red_sea', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/moses_red_sea/moses_red_sea_scene_07.mp3') },
  { storyId: 'moses_red_sea', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/moses_red_sea/moses_red_sea_scene_08.mp3') },
  { storyId: 'moses_red_sea', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/moses_red_sea/moses_red_sea_scene_09.mp3') },
  { storyId: 'moses_red_sea', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/moses_red_sea/moses_red_sea_scene_10.mp3') },
  // ── Rute e Noemi (ruth_naomi) — 10 áudios reais ──
  { storyId: 'ruth_naomi', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/ruth_naomi/ruth_naomi_scene_01.mp3') },
  { storyId: 'ruth_naomi', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/ruth_naomi/ruth_naomi_scene_02.mp3') },
  { storyId: 'ruth_naomi', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/ruth_naomi/ruth_naomi_scene_03.mp3') },
  { storyId: 'ruth_naomi', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/ruth_naomi/ruth_naomi_scene_04.mp3') },
  { storyId: 'ruth_naomi', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/ruth_naomi/ruth_naomi_scene_05.mp3') },
  { storyId: 'ruth_naomi', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/ruth_naomi/ruth_naomi_scene_06.mp3') },
  { storyId: 'ruth_naomi', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/ruth_naomi/ruth_naomi_scene_07.mp3') },
  { storyId: 'ruth_naomi', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/ruth_naomi/ruth_naomi_scene_08.mp3') },
  { storyId: 'ruth_naomi', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/ruth_naomi/ruth_naomi_scene_09.mp3') },
  { storyId: 'ruth_naomi', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/ruth_naomi/ruth_naomi_scene_10.mp3') },
  // ── Ester, a Rainha Corajosa (esther_queen) — 10 áudios reais ──
  { storyId: 'esther_queen', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/esther_queen/esther_queen_scene_01.mp3') },
  { storyId: 'esther_queen', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/esther_queen/esther_queen_scene_02.mp3') },
  { storyId: 'esther_queen', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/esther_queen/esther_queen_scene_03.mp3') },
  { storyId: 'esther_queen', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/esther_queen/esther_queen_scene_04.mp3') },
  { storyId: 'esther_queen', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/esther_queen/esther_queen_scene_05.mp3') },
  { storyId: 'esther_queen', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/esther_queen/esther_queen_scene_06.mp3') },
  { storyId: 'esther_queen', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/esther_queen/esther_queen_scene_07.mp3') },
  { storyId: 'esther_queen', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/esther_queen/esther_queen_scene_08.mp3') },
  { storyId: 'esther_queen', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/esther_queen/esther_queen_scene_09.mp3') },
  { storyId: 'esther_queen', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/esther_queen/esther_queen_scene_10.mp3') },
  // ── A Pesca Milagrosa (miraculous_catch) — 10 áudios reais ──
  { storyId: 'miraculous_catch', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/miraculous_catch/miraculous_catch_scene_01.mp3') },
  { storyId: 'miraculous_catch', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/miraculous_catch/miraculous_catch_scene_02.mp3') },
  { storyId: 'miraculous_catch', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/miraculous_catch/miraculous_catch_scene_03.mp3') },
  { storyId: 'miraculous_catch', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/miraculous_catch/miraculous_catch_scene_04.mp3') },
  { storyId: 'miraculous_catch', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/miraculous_catch/miraculous_catch_scene_05.mp3') },
  { storyId: 'miraculous_catch', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/miraculous_catch/miraculous_catch_scene_06.mp3') },
  { storyId: 'miraculous_catch', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/miraculous_catch/miraculous_catch_scene_07.mp3') },
  { storyId: 'miraculous_catch', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/miraculous_catch/miraculous_catch_scene_08.mp3') },
  { storyId: 'miraculous_catch', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/miraculous_catch/miraculous_catch_scene_09.mp3') },
  { storyId: 'miraculous_catch', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/miraculous_catch/miraculous_catch_scene_10.mp3') },
  // ── Samuel Ouve a Voz de Deus (samuel_hears_god) — 10 áudios reais ──
  { storyId: 'samuel_hears_god', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/samuel_hears_god/samuel_hears_god_scene_01.mp3') },
  { storyId: 'samuel_hears_god', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/samuel_hears_god/samuel_hears_god_scene_02.mp3') },
  { storyId: 'samuel_hears_god', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/samuel_hears_god/samuel_hears_god_scene_03.mp3') },
  { storyId: 'samuel_hears_god', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/samuel_hears_god/samuel_hears_god_scene_04.mp3') },
  { storyId: 'samuel_hears_god', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/samuel_hears_god/samuel_hears_god_scene_05.mp3') },
  { storyId: 'samuel_hears_god', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/samuel_hears_god/samuel_hears_god_scene_06.mp3') },
  { storyId: 'samuel_hears_god', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/samuel_hears_god/samuel_hears_god_scene_07.mp3') },
  { storyId: 'samuel_hears_god', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/samuel_hears_god/samuel_hears_god_scene_08.mp3') },
  { storyId: 'samuel_hears_god', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/samuel_hears_god/samuel_hears_god_scene_09.mp3') },
  { storyId: 'samuel_hears_god', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/samuel_hears_god/samuel_hears_god_scene_10.mp3') },
  // ── Josias, o Rei Jovem (josiah_young_king) — 10 áudios reais ──
  { storyId: 'josiah_young_king', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/josiah_young_king/josiah_young_king_scene_01.mp3') },
  { storyId: 'josiah_young_king', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/josiah_young_king/josiah_young_king_scene_02.mp3') },
  { storyId: 'josiah_young_king', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/josiah_young_king/josiah_young_king_scene_03.mp3') },
  { storyId: 'josiah_young_king', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/josiah_young_king/josiah_young_king_scene_04.mp3') },
  { storyId: 'josiah_young_king', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/josiah_young_king/josiah_young_king_scene_05.mp3') },
  { storyId: 'josiah_young_king', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/josiah_young_king/josiah_young_king_scene_06.mp3') },
  { storyId: 'josiah_young_king', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/josiah_young_king/josiah_young_king_scene_07.mp3') },
  { storyId: 'josiah_young_king', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/josiah_young_king/josiah_young_king_scene_08.mp3') },
  { storyId: 'josiah_young_king', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/josiah_young_king/josiah_young_king_scene_09.mp3') },
  { storyId: 'josiah_young_king', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/josiah_young_king/josiah_young_king_scene_10.mp3') },
  // ── Salomão e a Sabedoria (solomon_wisdom) — 10 áudios reais ──
  { storyId: 'solomon_wisdom', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/solomon_wisdom/solomon_wisdom_scene_01.mp3') },
  { storyId: 'solomon_wisdom', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/solomon_wisdom/solomon_wisdom_scene_02.mp3') },
  { storyId: 'solomon_wisdom', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/solomon_wisdom/solomon_wisdom_scene_03.mp3') },
  { storyId: 'solomon_wisdom', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/solomon_wisdom/solomon_wisdom_scene_04.mp3') },
  { storyId: 'solomon_wisdom', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/solomon_wisdom/solomon_wisdom_scene_05.mp3') },
  { storyId: 'solomon_wisdom', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/solomon_wisdom/solomon_wisdom_scene_06.mp3') },
  { storyId: 'solomon_wisdom', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/solomon_wisdom/solomon_wisdom_scene_07.mp3') },
  { storyId: 'solomon_wisdom', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/solomon_wisdom/solomon_wisdom_scene_08.mp3') },
  { storyId: 'solomon_wisdom', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/solomon_wisdom/solomon_wisdom_scene_09.mp3') },
  { storyId: 'solomon_wisdom', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/solomon_wisdom/solomon_wisdom_scene_10.mp3') },
  // ── Maria Recebe a Boa Notícia (mary_says_yes) — 10 áudios reais ──
  { storyId: 'mary_says_yes', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/mary_says_yes/mary_says_yes_scene_01.mp3') },
  { storyId: 'mary_says_yes', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/mary_says_yes/mary_says_yes_scene_02.mp3') },
  { storyId: 'mary_says_yes', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/mary_says_yes/mary_says_yes_scene_03.mp3') },
  { storyId: 'mary_says_yes', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/mary_says_yes/mary_says_yes_scene_04.mp3') },
  { storyId: 'mary_says_yes', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/mary_says_yes/mary_says_yes_scene_05.mp3') },
  { storyId: 'mary_says_yes', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/mary_says_yes/mary_says_yes_scene_06.mp3') },
  { storyId: 'mary_says_yes', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/mary_says_yes/mary_says_yes_scene_07.mp3') },
  { storyId: 'mary_says_yes', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/mary_says_yes/mary_says_yes_scene_08.mp3') },
  { storyId: 'mary_says_yes', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/mary_says_yes/mary_says_yes_scene_09.mp3') },
  { storyId: 'mary_says_yes', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/mary_says_yes/mary_says_yes_scene_10.mp3') },
  // ── Timóteo e a Fé (timothy_faith) — 10 áudios reais ──
  { storyId: 'timothy_faith', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/timothy_faith/timothy_faith_scene_01.mp3') },
  { storyId: 'timothy_faith', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/timothy_faith/timothy_faith_scene_02.mp3') },
  { storyId: 'timothy_faith', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/timothy_faith/timothy_faith_scene_03.mp3') },
  { storyId: 'timothy_faith', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/timothy_faith/timothy_faith_scene_04.mp3') },
  { storyId: 'timothy_faith', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/timothy_faith/timothy_faith_scene_05.mp3') },
  { storyId: 'timothy_faith', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/timothy_faith/timothy_faith_scene_06.mp3') },
  { storyId: 'timothy_faith', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/timothy_faith/timothy_faith_scene_07.mp3') },
  { storyId: 'timothy_faith', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/timothy_faith/timothy_faith_scene_08.mp3') },
  { storyId: 'timothy_faith', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/timothy_faith/timothy_faith_scene_09.mp3') },
  { storyId: 'timothy_faith', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/timothy_faith/timothy_faith_scene_10.mp3') },
  // ── Jesus no Templo (jesus_temple) — 10 áudios reais ──
  { storyId: 'jesus_temple', sceneKey: 'scene_01', audioAsset: require('../../assets/audio/jesus_temple/jesus_temple_scene_01.mp3') },
  { storyId: 'jesus_temple', sceneKey: 'scene_02', audioAsset: require('../../assets/audio/jesus_temple/jesus_temple_scene_02.mp3') },
  { storyId: 'jesus_temple', sceneKey: 'scene_03', audioAsset: require('../../assets/audio/jesus_temple/jesus_temple_scene_03.mp3') },
  { storyId: 'jesus_temple', sceneKey: 'scene_04', audioAsset: require('../../assets/audio/jesus_temple/jesus_temple_scene_04.mp3') },
  { storyId: 'jesus_temple', sceneKey: 'scene_05', audioAsset: require('../../assets/audio/jesus_temple/jesus_temple_scene_05.mp3') },
  { storyId: 'jesus_temple', sceneKey: 'scene_06', audioAsset: require('../../assets/audio/jesus_temple/jesus_temple_scene_06.mp3') },
  { storyId: 'jesus_temple', sceneKey: 'scene_07', audioAsset: require('../../assets/audio/jesus_temple/jesus_temple_scene_07.mp3') },
  { storyId: 'jesus_temple', sceneKey: 'scene_08', audioAsset: require('../../assets/audio/jesus_temple/jesus_temple_scene_08.mp3') },
  { storyId: 'jesus_temple', sceneKey: 'scene_09', audioAsset: require('../../assets/audio/jesus_temple/jesus_temple_scene_09.mp3') },
  { storyId: 'jesus_temple', sceneKey: 'scene_10', audioAsset: require('../../assets/audio/jesus_temple/jesus_temple_scene_10.mp3') },
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
