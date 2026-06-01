/**
 * apply-compressed-assets.js
 * Etapa 1: Cria backup dos originais em tmp/asset-compression-original-backup/
 * Etapa 2: Aplica os comprimidos da pasta de teste nos originais.
 *
 * NAO altera código. NAO renomeia. NAO apaga. NAO toca em áudios.
 * Operação: cópia segura — originals → backup, then compressed → originals.
 *
 * Run: node scripts/apply-compressed-assets.js [--dry-run]
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const BACKUP_DIR = path.join(ROOT, 'tmp', 'asset-compression-original-backup');

// Map: compressed source → original destination
// Only files that were tested AND approved in Sprint 18.2
const COPY_GROUPS = [
  {
    name:   'Imagens de colorir — Noé (10)',
    srcDir: path.join(ROOT, 'tmp', 'asset-compression-test', 'compressed', 'colorir', 'noe'),
    dstDir: path.join(ROOT, 'assets', 'stories', 'noe', 'colorir'),
  },
  {
    name:   'Imagens de colorir — Davi e Golias (10)',
    srcDir: path.join(ROOT, 'tmp', 'asset-compression-test', 'compressed', 'colorir', 'davi_golias'),
    dstDir: path.join(ROOT, 'assets', 'stories', 'davi_golias', 'colorir'),
  },
  {
    name:   'Imagens de colorir — Jesus e as Crianças (10)',
    srcDir: path.join(ROOT, 'tmp', 'asset-compression-test', 'compressed', 'colorir', 'jesus_criancas'),
    dstDir: path.join(ROOT, 'assets', 'stories', 'jesus_criancas', 'colorir'),
  },
  {
    name:   'Capas de história (3)',
    srcDir: path.join(ROOT, 'tmp', 'asset-compression-test', 'compressed', 'capas'),
    dstDir: path.join(ROOT, 'assets', 'images'),
    // Only specific files approved in Sprint 18.2
    allowList: ['noe_arcoiris_capa.png', 'davi_golias_capa.png', 'jesus_criancas_capa.png'],
  },
  {
    name:   'Imagens de narração (2)',
    srcDir: path.join(ROOT, 'tmp', 'asset-compression-test', 'compressed', 'narration'),
    dstDir: path.join(ROOT, 'assets', 'images'),
    allowList: ['noe_sorrindo.png', 'noe_apontando.png'],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function sizeKB(p) { try { return Math.round(fs.statSync(p).size / 1024); } catch { return 0; } }

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function getDimensions(p) {
  // Quick PNG dimension read from header bytes
  try {
    const buf = Buffer.alloc(24);
    const fd  = fs.openSync(p, 'r');
    fs.readSync(fd, buf, 0, 24, 0);
    fs.closeSync(fd);
    if (buf.toString('ascii', 1, 4) === 'PNG') {
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      return `${w}x${h}`;
    }
  } catch {}
  return 'unknown';
}

// ── Collect all operations ────────────────────────────────────────────────────
const operations = []; // {srcPath, dstPath, backupPath, name, group}

COPY_GROUPS.forEach(group => {
  if (!fs.existsSync(group.srcDir)) {
    console.log('[WARN] Missing src dir:', group.srcDir);
    return;
  }

  const files = fs.readdirSync(group.srcDir)
    .filter(f => f.endsWith('.png'))
    .filter(f => !group.allowList || group.allowList.includes(f));

  files.forEach(filename => {
    const srcPath    = path.join(group.srcDir, filename);
    const dstPath    = path.join(group.dstDir, filename);
    const relDst     = path.relative(ROOT, dstPath).replace(/\\/g, '/');
    // Mirror the destination path structure under backup dir
    const backupPath = path.join(BACKUP_DIR, relDst);

    if (!fs.existsSync(dstPath)) {
      console.log('[WARN] Original not found, skipping:', relDst);
      return;
    }

    operations.push({ srcPath, dstPath, backupPath, filename, group: group.name });
  });
});

// ── Report ────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(65));
console.log(`  APPLY-COMPRESSED-ASSETS ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'}`);
console.log('='.repeat(65));
console.log(`  Files to process: ${operations.length}`);
console.log(`  Backup dir: tmp/asset-compression-original-backup/\n`);

// ── Summary table ─────────────────────────────────────────────────────────────
let totalBefore = 0; let totalAfter = 0;
const backupReport = [];

operations.forEach(op => {
  const before = sizeKB(op.dstPath);
  const after  = sizeKB(op.srcPath);
  const red    = before > 0 ? Math.round((1 - after / before) * 100) : 0;
  const dim    = getDimensions(op.dstPath);
  totalBefore += before;
  totalAfter  += after;

  backupReport.push({
    filename:     op.filename,
    originalPath: path.relative(ROOT, op.dstPath).replace(/\\/g, '/'),
    backupPath:   path.relative(ROOT, op.backupPath).replace(/\\/g, '/'),
    sizeBefore:   before,
    sizeAfter:    after,
    reduction:    red,
    dimensions:   dim,
    group:        op.group,
  });

  console.log(`  [${red}%] ${path.relative(ROOT, op.dstPath).replace(/\\/g, '/').padEnd(60)} ${before} KB -> ${after} KB`);
});

console.log('\n  Total: ' + totalBefore + ' KB -> ' + totalAfter + ' KB (' + Math.round((1 - totalAfter / totalBefore) * 100) + '% reducao)\n');

if (DRY_RUN) {
  console.log('  DRY RUN - nothing changed.');
  process.exit(0);
}

// ── STEP 1: Backup originals ──────────────────────────────────────────────────
console.log('STEP 1: Backing up originals...');
operations.forEach(op => {
  ensureDir(path.dirname(op.backupPath));
  fs.copyFileSync(op.dstPath, op.backupPath);
  const kb = sizeKB(op.backupPath);
  console.log('  [BACKUP] ' + path.relative(ROOT, op.backupPath).replace(/\\/g, '/') + ' (' + kb + ' KB)');
});
console.log('  Backup complete: ' + operations.length + ' files.\n');

// ── STEP 2: Apply compressed ──────────────────────────────────────────────────
console.log('STEP 2: Applying compressed files...');
operations.forEach(op => {
  fs.copyFileSync(op.srcPath, op.dstPath);
  const kb = sizeKB(op.dstPath);
  console.log('  [APPLY] ' + path.relative(ROOT, op.dstPath).replace(/\\/g, '/') + ' (' + kb + ' KB)');
});
console.log('  Apply complete: ' + operations.length + ' files.\n');

// ── STEP 3: Verify ────────────────────────────────────────────────────────────
console.log('STEP 3: Verifying...');
let verifyErrors = 0;
operations.forEach(op => {
  const exists = fs.existsSync(op.dstPath);
  const size   = sizeKB(op.dstPath);
  const backup = fs.existsSync(op.backupPath);
  const dim    = getDimensions(op.dstPath);

  if (!exists || size < 20) {
    console.log('  [ERR] Verification failed: ' + op.filename);
    verifyErrors++;
  } else if (!backup) {
    console.log('  [ERR] Backup missing: ' + op.filename);
    verifyErrors++;
  }
});

if (verifyErrors === 0) {
  console.log('  All ' + operations.length + ' files verified OK.\n');
} else {
  console.log('  ' + verifyErrors + ' verification errors! Check above.\n');
  process.exit(1);
}

// ── Write backup report JSON ──────────────────────────────────────────────────
const reportPath = path.join(ROOT, 'tmp', 'asset-compression-original-backup', 'backup-manifest.json');
fs.writeFileSync(reportPath, JSON.stringify({
  date:        new Date().toISOString(),
  filesBackedUp: operations.length,
  totalBeforeKB: totalBefore,
  totalAfterKB:  totalAfter,
  backupDir:   'tmp/asset-compression-original-backup/',
  files:       backupReport,
}, null, 2), 'utf8');

console.log('='.repeat(65));
console.log('  DONE');
console.log('  Files compressed: ' + operations.length);
console.log('  Size before: ' + (totalBefore/1024).toFixed(1) + ' MB');
console.log('  Size after:  ' + (totalAfter/1024).toFixed(1) + ' MB');
console.log('  Reduction:   ' + Math.round((1 - totalAfter/totalBefore)*100) + '%');
console.log('  Backup manifest: tmp/asset-compression-original-backup/backup-manifest.json');
console.log('='.repeat(65));
