/**
 * setup-compression-test.js — Copia assets para pasta de teste.
 * NÃO altera os originais. NÃO comprime nada.
 * Run: node scripts/setup-compression-test.js
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const TEST_DIR = path.join(ROOT, 'tmp', 'asset-compression-test');

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function copyFile(src, destDir, label) {
  const dest = path.join(destDir, path.basename(src));
  fs.copyFileSync(src, dest);
  const kb = Math.round(fs.statSync(src).size / 1024);
  console.log(`  ✓ ${label.padEnd(55)} ${String(kb).padStart(5)} KB`);
  return kb;
}

console.log('\n── setup-compression-test.js ───────────────────────────');
console.log('  Copiando assets para: tmp/asset-compression-test/');
console.log('  Os originais NÃO são alterados.\n');

// Create test directories
const dirs = {
  colorir_noe:    path.join(TEST_DIR, 'colorir', 'noe'),
  colorir_davi:   path.join(TEST_DIR, 'colorir', 'davi_golias'),
  colorir_jesus:  path.join(TEST_DIR, 'colorir', 'jesus_criancas'),
  capas:          path.join(TEST_DIR, 'capas'),
  narration:      path.join(TEST_DIR, 'narration'),
};
Object.values(dirs).forEach(ensureDir);

let totalKB = 0;
let fileCount = 0;
const report = [];

// Copy coloring images — noe
console.log('  [Colorir] Noé:');
const noeDir = path.join(ROOT, 'assets', 'stories', 'noe', 'colorir');
fs.readdirSync(noeDir).filter(f => f.endsWith('.png')).sort().forEach(f => {
  const kb = copyFile(path.join(noeDir, f), dirs.colorir_noe, 'noe/' + f);
  report.push({ file: `noe/colorir/${f}`, originalKB: kb, group: 'colorir', story: 'noah' });
  totalKB += kb; fileCount++;
});

// Copy coloring images — davi_golias
console.log('  [Colorir] Davi e Golias:');
const daviDir = path.join(ROOT, 'assets', 'stories', 'davi_golias', 'colorir');
fs.readdirSync(daviDir).filter(f => f.endsWith('.png')).sort().forEach(f => {
  const kb = copyFile(path.join(daviDir, f), dirs.colorir_davi, 'davi_golias/' + f);
  report.push({ file: `davi_golias/colorir/${f}`, originalKB: kb, group: 'colorir', story: 'david_goliath' });
  totalKB += kb; fileCount++;
});

// Copy coloring images — jesus_criancas
console.log('  [Colorir] Jesus e as Crianças:');
const jesusDir = path.join(ROOT, 'assets', 'stories', 'jesus_criancas', 'colorir');
fs.readdirSync(jesusDir).filter(f => f.endsWith('.png')).sort().forEach(f => {
  const kb = copyFile(path.join(jesusDir, f), dirs.colorir_jesus, 'jesus_criancas/' + f);
  report.push({ file: `jesus_criancas/colorir/${f}`, originalKB: kb, group: 'colorir', story: 'jesus_children' });
  totalKB += kb; fileCount++;
});

// Copy cover images
console.log('\n  [Capas]:');
const coverFiles = ['noe_arcoiris_capa.png', 'davi_golias_capa.png', 'jesus_criancas_capa.png'];
coverFiles.forEach(f => {
  const src = path.join(ROOT, 'assets', 'images', f);
  if (fs.existsSync(src)) {
    const kb = copyFile(src, dirs.capas, 'images/' + f);
    report.push({ file: `images/${f}`, originalKB: kb, group: 'capa', story: f.replace('_capa.png', '') });
    totalKB += kb; fileCount++;
  }
});

// Copy narration images
console.log('\n  [Narração]:');
const narFiles = ['noe_sorrindo.png', 'noe_apontando.png'];
narFiles.forEach(f => {
  const src = path.join(ROOT, 'assets', 'images', f);
  if (fs.existsSync(src)) {
    const kb = copyFile(src, dirs.narration, 'images/' + f);
    report.push({ file: `images/${f}`, originalKB: kb, group: 'narration', story: 'noah' });
    totalKB += kb; fileCount++;
  }
});

// Save report JSON for use by other scripts
fs.writeFileSync(
  path.join(TEST_DIR, 'report-before.json'),
  JSON.stringify({ date: new Date().toISOString(), files: report }, null, 2),
  'utf8'
);

console.log(`\n  Total: ${fileCount} arquivos copiados — ${(totalKB / 1024).toFixed(2)} MB`);
console.log('  Relatório JSON: tmp/asset-compression-test/report-before.json');
console.log('  Originais: INTACTOS ✓');
