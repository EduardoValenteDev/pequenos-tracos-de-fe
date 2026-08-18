'use strict';

const fs = require('fs');
const path = require('path');
const { loadModule } = require('./packInstallHarness');

const root = path.resolve(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function buildProfiles(mutateEas) {
  const parsed = JSON.parse(read('eas.json'));
  if (mutateEas) mutateEas(parsed);
  return parsed.build;
}

function profileEnv(name, mutateEas) {
  const build = buildProfiles(mutateEas);
  const chain = [];
  const seen = new Set();
  let current = name;
  while (current && build[current] && !seen.has(current)) {
    seen.add(current);
    chain.unshift(current);
    current = build[current].extends;
  }
  return chain.reduce((env, profile) => Object.assign(env, build[profile].env || {}), {});
}

function flags(env, mutateSource) {
  return loadModule(
    'src/config/featureFlags.js',
    { process: { env: env || {} } },
    ['COLORIR_60_CREATION_PILOT_ENABLED', 'RELEASE_PACK_QA_ENABLED', 'CREATOR_QA_MODE_RELEASE_ENABLED'],
    mutateSource,
  );
}

function pilot(name, mutateEas, mutateSource) {
  return flags(profileEnv(name, mutateEas), mutateSource).COLORIR_60_CREATION_PILOT_ENABLED === true;
}

function contract(mutateEas, mutateSource, mutateStory) {
  const previewEnv = profileEnv('preview', mutateEas);
  const previewFlags = flags(previewEnv, mutateSource);
  const pilotFlags = flags(profileEnv('c60-pilot', mutateEas), mutateSource);
  const productionEnv = profileEnv('production', mutateEas);
  const storySource = mutateStory ? mutateStory(read('src/screens/StoryDetailScreen.js')) : read('src/screens/StoryDetailScreen.js');
  const storyGate = /const creationColoringVisible\s*=\s*([\s\S]*?);\r?\n/.exec(storySource);
  return {
    previewOn: previewFlags.COLORIR_60_CREATION_PILOT_ENABLED === true,
    previewNonDev: buildProfiles(mutateEas).preview.developmentClient !== true,
    previewToolsOff: previewFlags.CREATOR_QA_MODE_RELEASE_ENABLED === false,
    productionOff: flags(productionEnv, mutateSource).COLORIR_60_CREATION_PILOT_ENABLED === false,
    productionP139Off: productionEnv.EXPO_PUBLIC_PTF_PERF_TRACE !== '1',
    pilotPreserved: pilotFlags.COLORIR_60_CREATION_PILOT_ENABLED === true,
    previewP139On: previewEnv.EXPO_PUBLIC_PTF_PERF_TRACE === '1',
    storyUsesOfficialFlag: !!storyGate && /COLORIR_60_CREATION_PILOT_ENABLED/.test(storyGate[1]) && !/EXPO_PUBLIC_BUILD_PROFILE/.test(storyGate[1]),
  };
}

function run() {
  const checks = contract();
  const entries = Object.entries(checks);
  const failed = entries.filter(([, value]) => value !== true);

  const mutants = [
    ['remove-preview-auth', (e) => { delete e.build.preview.env.EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT; }, null, null, 'previewOn'],
    ['remove-preview-profile', (e) => { delete e.build.preview.env.EXPO_PUBLIC_BUILD_PROFILE; }, null, null, 'previewOn'],
    ['production-c60-on', (e) => { e.build.production.env.EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT = 'true'; e.build.production.env.EXPO_PUBLIC_BUILD_PROFILE = 'preview'; }, null, null, 'productionOff'],
    ['preview-dev-client', (e) => { e.build.preview.developmentClient = true; }, null, null, 'previewNonDev'],
    ['production-p139-on', (e) => { e.build.production.env.EXPO_PUBLIC_PTF_PERF_TRACE = '1'; }, null, null, 'productionP139Off'],
    ['story-profile-bypass', null, null, (s) => s.replace('COLORIR_60_CREATION_PILOT_ENABLED ||', "process.env.EXPO_PUBLIC_BUILD_PROFILE === 'preview' ||"), 'storyUsesOfficialFlag'],
  ];
  const survived = mutants.filter(([, easMut, sourceMut, storyMut, target]) => contract(easMut, sourceMut, storyMut)[target] === true);

  console.log(`R7 preview C60 focused: ${entries.length - failed.length}/${entries.length} PASS`);
  console.log(`R7 preview C60 mutants: ${mutants.length - survived.length}/${mutants.length} KILLED`);
  if (failed.length || survived.length) {
    if (failed.length) console.error(`Failed: ${failed.map(([name]) => name).join(', ')}`);
    if (survived.length) console.error(`Survived: ${survived.map(([name]) => name).join(', ')}`);
    process.exitCode = 1;
  }
  return { checks, mutants: mutants.length, survived: survived.map(([name]) => name) };
}

if (require.main === module) run();

module.exports = { contract, run, profileEnv, pilot };
