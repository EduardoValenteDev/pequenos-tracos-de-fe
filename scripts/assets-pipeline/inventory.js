#!/usr/bin/env node
/**
 * inventory.js — Inventário reproduzível de assets (Feature 001, T002 · FR-001).
 *
 * Percorre `assets/`, categoriza (capas/cenas/colorir/mapas/UI/áudio/other), separa
 * tracked vs untracked (via `git ls-files`) e imprime JSON DETERMINÍSTICO em stdout
 * (mesma entrada → mesma saída). NÃO escreve arquivos, NÃO altera nada.
 *
 * Uso: `npm run assets:inventory`  (ou `node scripts/assets-pipeline/inventory.js`)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const ASSETS_DIR = 'assets';

function walk(relDir, acc) {
  const abs = path.join(root, relDir);
  if (!fs.existsSync(abs)) return acc;
  for (const name of fs.readdirSync(abs).sort()) {
    const rel = (relDir + '/' + name).replace(/\\/g, '/');
    const st = fs.statSync(path.join(root, rel));
    if (st.isDirectory()) walk(rel, acc);
    else acc.push({ path: rel, bytes: st.size });
  }
  return acc;
}

function categorize(p) {
  if (p.startsWith('assets/maps/')) return 'maps';
  if (p.startsWith('assets/avatar/')) return 'ui';
  if (p.startsWith('assets/audio/')) return 'audio';
  if (/^assets\/stories\/.+\/(scenes?)\//.test(p)) return 'scenes';
  if (/^assets\/stories\/.+\/coloring\//.test(p)) return 'coloring';
  if (/_cover\.(png|jpe?g|webp)$/i.test(p)) return 'covers';
  return 'other';
}

function trackedSet() {
  try {
    const out = execSync('git ls-files assets', { cwd: root, encoding: 'utf8' });
    return new Set(
      out.split(/\r?\n/).map((s) => s.trim().replace(/\\/g, '/')).filter(Boolean),
    );
  } catch (e) {
    return null; // git indisponível → estado tracked desconhecido
  }
}

function build() {
  const files = walk(ASSETS_DIR, []);
  const tracked = trackedSet();
  const cats = {};
  for (const f of files) {
    const cat = categorize(f.path);
    const bucket = (cats[cat] = cats[cat] || {
      tracked: { count: 0, bytes: 0 },
      untracked: { count: 0, bytes: 0 },
    });
    const key = tracked && !tracked.has(f.path) ? 'untracked' : 'tracked';
    bucket[key].count += 1;
    bucket[key].bytes += f.bytes;
  }
  const categories = Object.keys(cats)
    .sort()
    .map((c) => ({ category: c, tracked: cats[c].tracked, untracked: cats[c].untracked }));
  const totalBytes = files.reduce((a, f) => a + f.bytes, 0);
  return {
    source: ASSETS_DIR,
    trackedKnown: tracked != null,
    fileCount: files.length,
    totalBytes,
    totalMB: +(totalBytes / (1024 * 1024)).toFixed(2),
    categories,
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(build(), null, 2) + '\n');
}

module.exports = { build, categorize };
