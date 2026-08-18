'use strict';

const assert = require('assert');
const {
  TABLET_SMALLEST_WIDTH_DP,
  POLICY_MARKER,
  ACTIVITY_INFO_IMPORT,
  applyMainActivityPolicy,
  removeManifestOrientation,
} = require('../../plugins/withAndroidTabletOrientation');

const fixture = `package com.example

import android.os.Build
import android.os.Bundle

class MainActivity {
  override fun onCreate(savedInstanceState: Bundle?) {
    setTheme(R.style.AppTheme);
    super.onCreate(null)
  }
}`;

let passes = 0;
function check(name, test) {
  test();
  passes += 1;
  console.log(`PASS ${name}`);
}

function validPolicy(source) {
  return source.split(POLICY_MARKER).length - 1 === 1
    && source.split(ACTIVITY_INFO_IMPORT).length - 1 === 1
    && source.includes(`smallestScreenWidthDp >= ${TABLET_SMALLEST_WIDTH_DP}`)
    && source.includes('ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED')
    && source.includes('ActivityInfo.SCREEN_ORIENTATION_PORTRAIT')
    && source.indexOf(POLICY_MARKER) < source.indexOf('super.onCreate(null)');
}

function killed(name, mutant) {
  check(name, () => assert.strictEqual(validPolicy(mutant), false));
}

const generated = applyMainActivityPolicy(fixture, 'kt');

check('D1 telefone gera PORTRAIT', () => {
  assert(generated.includes('else ActivityInfo.SCREEN_ORIENTATION_PORTRAIT'));
});
check('D1 tablet/large screen gera UNSPECIFIED', () => {
  assert(generated.includes(') ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED'));
});
check('threshold Android é 600dp', () => assert.strictEqual(TABLET_SMALLEST_WIDTH_DP, 600));
check('política executa antes de super.onCreate', () => assert(validPolicy(generated)));
check('aplicação repetida é idempotente', () => {
  assert.strictEqual(applyMainActivityPolicy(generated, 'kt'), generated);
});
check('linguagem não Kotlin falha fechada', () => {
  assert.throws(() => applyMainActivityPolicy(fixture, 'java'), /requer MainActivity Kotlin/);
});
check('âncora ausente falha fechada', () => {
  assert.throws(() => applyMainActivityPolicy('class MainActivity {}', 'kt'), /Âncora única/);
});
check('política duplicada falha fechada', () => {
  assert.throws(() => applyMainActivityPolicy(`${generated}\n${POLICY_MARKER}`, 'kt'), /duplicada/);
});

const manifestActivity = {
  $: {
    'android:name': '.MainActivity',
    'android:configChanges': 'keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode',
    'android:screenOrientation': '@integer/screen_orientation',
  },
};
const configChangesBefore = manifestActivity.$['android:configChanges'];
removeManifestOrientation(manifestActivity);
check('manifesto remove screenOrientation', () => {
  assert.strictEqual(manifestActivity.$['android:screenOrientation'], undefined);
});
check('manifesto preserva configChanges', () => {
  assert.strictEqual(manifestActivity.$['android:configChanges'], configChangesBefore);
});

killed('M1 telefone livre é morto', generated.replace(
  'else ActivityInfo.SCREEN_ORIENTATION_PORTRAIT',
  'else ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED'
));
killed('M2 tablet portrait é morto', generated.replace(
  ') ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED',
  ') ActivityInfo.SCREEN_ORIENTATION_PORTRAIT'
));
check('M3 referência variante no manifesto é morta', () => {
  const activity = { $: { 'android:screenOrientation': '@integer/screen_orientation' } };
  removeManifestOrientation(activity);
  assert(!('android:screenOrientation' in activity.$));
});
check('M4 mecanismo values-sw600dp antigo é morto', () => {
  const pluginSource = require('fs').readFileSync(require.resolve('../../plugins/withAndroidTabletOrientation'), 'utf8');
  assert(!pluginSource.includes('values-sw600dp'));
  assert(!pluginSource.includes('@integer/screen_orientation'));
});
killed('M5 ausência da política é morta', fixture);
check('M6 duplicação é morta', () => {
  assert.throws(() => applyMainActivityPolicy(`${generated}\n${POLICY_MARKER}`, 'kt'), /duplicada/);
});
check('M7 prebuild repetido divergente é morto', () => {
  assert.strictEqual(applyMainActivityPolicy(generated, 'kt'), generated);
});
check('M8 sobrescrita de configChanges é morta', () => {
  const activity = { $: { 'android:configChanges': configChangesBefore, 'android:screenOrientation': 'portrait' } };
  removeManifestOrientation(activity);
  assert.strictEqual(activity.$['android:configChanges'], configChangesBefore);
});

console.log(`RESULT ${passes}/${passes} PASS; MUTANTS 8/8 KILLED`);
