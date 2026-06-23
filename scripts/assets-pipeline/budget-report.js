#!/usr/bin/env node
/**
 * budget-report.js — Relatório de ORÇAMENTO de assets (Feature 001, T010 · FR-003/FR-004).
 *
 * Usa o inventário existente (inventory.js) para comparar o tamanho dos assets versionados
 * (proxy do bundle inicial) com a META de ~150 MB de instalação inicial (D3 — meta de UX,
 * não limite rígido de loja). NÃO inventa números: o tamanho REAL do bundle exige
 * `expo export` (registrado como N/A). Imprime JSON determinístico em stdout.
 *
 * Uso: `npm run assets:budget`
 */
const { build } = require('./inventory');

const TARGET_INSTALL_MB = 150; // meta de UX p/ download/instalação inicial (Plano D3)
const MB = 1024 * 1024;
const mb = (bytes) => +(bytes / MB).toFixed(2);

function run() {
  const inv = build();
  let trackedBytes = 0;
  let untrackedBytes = 0;
  inv.categories.forEach((c) => {
    trackedBytes += c.tracked.bytes;
    untrackedBytes += c.untracked.bytes;
  });
  const trackedMB = mb(trackedBytes);

  return {
    target: {
      installInitialMB: TARGET_INSTALL_MB,
      note: 'meta de UX (~150 MB), não limite rígido de loja; acima de ~200 MB há fricção (D3).',
    },
    proxy: {
      trackedAssetsMB: trackedMB, // proxy do conteúdo que vai no binário/bundle inicial
      withinTarget: trackedMB <= TARGET_INSTALL_MB,
      headroomMB: +(TARGET_INSTALL_MB - trackedMB).toFixed(2),
      untrackedAssetsMB: mb(untrackedBytes), // fora do bundle ("em breve"/remoto)
    },
    dimensions: {
      downloadInstall: `~${trackedMB} MB (proxy via assets tracked) vs meta ${TARGET_INSTALL_MB} MB`,
      update: 'N/A — depende de EAS Update (não medido nesta fase)',
      memory: 'N/A — runtime (não medido nesta fase)',
      localStorage: 'N/A — packs baixados em runtime (não medido nesta fase)',
    },
    perCategoryTrackedMB: inv.categories.map((c) => ({
      category: c.category,
      trackedMB: mb(c.tracked.bytes),
    })),
    caveats: [
      'PROXY: tamanho REAL do bundle exige `expo export` (N/A aqui).',
      'assets tracked != bundle final (compressão Metro, WebP futuro, exclusões).',
      'Conteúdo untracked ("em breve"/remoto) NÃO entra no bundle inicial.',
    ],
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}

module.exports = { run, TARGET_INSTALL_MB };
