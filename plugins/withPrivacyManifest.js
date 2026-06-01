/**
 * withPrivacyManifest — PLUGIN SUPERSEDIDO (Sprint 15.1)
 *
 * Este plugin NÃO está registrado em app.json.
 * A configuração do Privacy Manifest foi migrada para o suporte nativo
 * do Expo SDK 54 via expo.ios.privacyManifests em app.json.
 *
 * Mantido aqui apenas como referência. Pode ser removido em sprint futuro.
 *
 * Configuração ativa: app.json → expo.ios.privacyManifests
 *   - NSPrivacyAccessedAPICategoryUserDefaults com razão CA92.1
 *   - NSPrivacyTracking: false
 *   - NSPrivacyCollectedDataTypes: []
 *   - NSPrivacyTrackingDomains: []
 */
const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const PRIVACY_MANIFEST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyAccessedAPITypes</key>
  <array>
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>1C8F.1</string>
      </array>
    </dict>
  </array>
  <key>NSPrivacyCollectedDataTypes</key>
  <array/>
  <key>NSPrivacyTracking</key>
  <false/>
  <key>NSPrivacyTrackingDomains</key>
  <array/>
</dict>
</plist>
`;

module.exports = function withPrivacyManifest(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const iosDir = path.join(projectRoot, cfg.modRequest.platformProjectRoot);
      const manifestPath = path.join(iosDir, 'PrivacyInfo.xcprivacy');
      fs.writeFileSync(manifestPath, PRIVACY_MANIFEST, 'utf8');
      return cfg;
    },
  ]);
};
