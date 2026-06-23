#!/usr/bin/env node
/**
 * measure-size.js — Medição de tamanho (Feature 001, T003 · FR-002).
 *
 * Mede o que é tecnicamente mensurável NESTE ambiente (repo, assets, src, .git) e
 * registra explicitamente "N/A" para o que NÃO é mensurável aqui (export Metro,
 * bundle, builds Android/iOS) — sem inventar números. Imprime JSON em stdout.
 *
 * Uso: `npm run assets:measure`  (ou `node scripts/assets-pipeline/measure-size.js`)
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');

function dirBytes(relDir) {
  const abs = path.join(root, relDir);
  if (!fs.existsSync(abs)) return null;
  let total = 0;
  const stack = [abs];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch (e) {
      continue;
    }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else {
        try {
          total += fs.statSync(p).size;
        } catch (_) {
          /* ignore inacessível */
        }
      }
    }
  }
  return total;
}

function mb(bytes) {
  return bytes == null ? null : +(bytes / (1024 * 1024)).toFixed(2);
}

function build() {
  const targets = {
    assets: 'assets',
    'assets/stories (dir: tracked + untracked)': 'assets/stories',
    src: 'src',
    '.git (histórico do repo)': '.git',
  };
  const measuredBytes = {};
  const measuredMB = {};
  for (const label of Object.keys(targets)) {
    const bytes = dirBytes(targets[label]);
    measuredBytes[label] = bytes;
    measuredMB[label] = mb(bytes);
  }
  return {
    measuredBytes,
    measuredMB,
    notMeasurableHere: {
      metroExport: 'N/A — requer `expo export` (fora do escopo da Fase 1)',
      jsBundle: 'N/A — derivado do export Metro',
      androidBuild: 'N/A — requer EAS/Gradle build',
      iosBuild: 'N/A — requer ambiente macOS/Xcode',
    },
    notes: [
      'Peso de repositório (.git) != peso do app entregue ao usuário (ver spec, edge cases).',
      'assets/stories e demais untracked NÃO entram no bundle ativo (conteúdo "em breve").',
    ],
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(build(), null, 2) + '\n');
}

module.exports = { build, dirBytes };
