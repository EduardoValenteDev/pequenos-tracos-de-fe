/**
 * Política nativa D1 (F6-R1.1): telefone Android em retrato; large screens livres.
 *
 * O attempt R7-01 provou que um `android:screenOrientation` apontando para recurso
 * variante por `sw600dp` é inválido em release (`ManifestResource`). A decisão agora
 * ocorre na Activity, antes do React, pela classificação Android em dp. O manifesto
 * fica sem lock para não competir com a política runtime.
 */

const {
  AndroidConfig,
  withAndroidManifest,
  withMainActivity,
} = require('@expo/config-plugins');

const TABLET_SMALLEST_WIDTH_DP = 600;
const POLICY_MARKER = '// PTF_D1_ANDROID_ORIENTATION_POLICY';
const ACTIVITY_INFO_IMPORT = 'import android.content.pm.ActivityInfo';
const POLICY_STATEMENT = `    ${POLICY_MARKER}
    requestedOrientation = if (
      resources.configuration.smallestScreenWidthDp >= ${TABLET_SMALLEST_WIDTH_DP}
    ) ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
    else ActivityInfo.SCREEN_ORIENTATION_PORTRAIT`;

function countOccurrences(source, token) {
  return source.split(token).length - 1;
}

function applyMainActivityPolicy(source, language = 'kt') {
  if (language !== 'kt') {
    throw new Error(`withAndroidTabletOrientation requer MainActivity Kotlin; recebido: ${language}`);
  }

  let next = source;
  const markerCount = countOccurrences(next, POLICY_MARKER);
  if (markerCount > 1) {
    throw new Error('Política D1 duplicada na MainActivity');
  }

  if (!next.includes(ACTIVITY_INFO_IMPORT)) {
    const bundleImport = 'import android.os.Bundle';
    if (countOccurrences(next, bundleImport) !== 1) {
      throw new Error('Âncora única import android.os.Bundle não encontrada na MainActivity');
    }
    next = next.replace(bundleImport, `${ACTIVITY_INFO_IMPORT}\n${bundleImport}`);
  }

  if (markerCount === 0) {
    const superCall = '    super.onCreate(null)';
    if (countOccurrences(next, superCall) !== 1) {
      throw new Error('Âncora única super.onCreate(null) não encontrada na MainActivity');
    }
    next = next.replace(superCall, `${POLICY_STATEMENT}\n${superCall}`);
  }

  if (countOccurrences(next, ACTIVITY_INFO_IMPORT) !== 1 || countOccurrences(next, POLICY_MARKER) !== 1) {
    throw new Error('Transformação D1 não produziu exatamente uma política nativa');
  }
  return next;
}

const withRuntimeOrientationPolicy = (config) =>
  withMainActivity(config, (cfg) => {
    cfg.modResults.contents = applyMainActivityPolicy(
      cfg.modResults.contents,
      cfg.modResults.language
    );
    return cfg;
  });

function removeManifestOrientation(mainActivity) {
  delete mainActivity.$[AndroidConfig.Orientation.SCREEN_ORIENTATION_ATTRIBUTE];
  return mainActivity;
}

const withUnlockedManifestOrientation = (config) =>
  withAndroidManifest(config, (cfg) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(cfg.modResults);
    removeManifestOrientation(mainActivity);
    return cfg;
  });

module.exports = function withAndroidTabletOrientation(config) {
  return withRuntimeOrientationPolicy(withUnlockedManifestOrientation(config));
};

module.exports.TABLET_SMALLEST_WIDTH_DP = TABLET_SMALLEST_WIDTH_DP;
module.exports.POLICY_MARKER = POLICY_MARKER;
module.exports.ACTIVITY_INFO_IMPORT = ACTIVITY_INFO_IMPORT;
module.exports.POLICY_STATEMENT = POLICY_STATEMENT;
module.exports.applyMainActivityPolicy = applyMainActivityPolicy;
module.exports.removeManifestOrientation = removeManifestOrientation;
