#!/usr/bin/env node
/**
 * validate-pack-manifest.js — Valida um arquivo de MANIFESTO de pack (JSON) contra o
 * `packManifestService` (fonte única da validação). Feature 001, Fase 2.
 *
 * Uso: `npm run assets:validate-manifest -- caminho/para/manifest.json`
 *      `node scripts/assets-pipeline/validate-pack-manifest.js caminho/manifest.json`
 *
 * Sem rede, sem download — só leitura do JSON + validação em memória.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');

// Carrega o service ESM em contexto CJS: remove imports/exports e avalia (mesma
// técnica do harness de smoke), mantendo o service como ÚNICA fonte da validação.
function loadValidateManifest() {
  let code = fs
    .readFileSync(path.join(root, 'src/services/packManifestService.js'), 'utf8')
    .replace(/^\s*import\s.*$/gm, '')
    .replace(/export\s+default\s+/g, 'const __default = ')
    .replace(/export\s+(async\s+function|function|const|let|var)\s+/g, '$1 ');
  code += '\nreturn { validateManifest };';
  // eslint-disable-next-line no-new-func
  return new Function(code)().validateManifest;
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/assets-pipeline/validate-pack-manifest.js <manifest.json>');
    process.exit(2);
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  } catch (e) {
    console.error('[validate-manifest] não foi possível ler/parsear o JSON:', e.message);
    process.exit(1);
  }
  const validateManifest = loadValidateManifest();
  const { ok, errors } = validateManifest(manifest);
  if (ok) {
    console.log('[validate-manifest] OK — manifesto válido.');
    process.exit(0);
  }
  console.error('[validate-manifest] INVÁLIDO:');
  errors.forEach((e) => console.error('  ✗ ' + e));
  process.exit(1);
}
