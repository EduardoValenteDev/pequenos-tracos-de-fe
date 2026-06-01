/**
 * report-image-sizes.js — Relatório de tamanho de imagens (NÃO DESTRUTIVO).
 *
 * Lista todos os arquivos de imagem do projeto com seus tamanhos.
 * Indica candidatos a compressão e impacto no bundle.
 * NÃO altera, renomeia ou apaga nenhum arquivo.
 *
 * Run: node scripts/report-image-sizes.js
 * Run: node scripts/report-image-sizes.js --critical-only   (> 300 KB)
 * Run: node scripts/report-image-sizes.js --json            (output JSON)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT          = path.join(__dirname, '..');
const CRITICAL_ONLY = process.argv.includes('--critical-only');
const JSON_OUTPUT   = process.argv.includes('--json');

// ── Thresholds ─────────────────────────────────────────────────────────────
const CRITICAL_KB = 300;  // must compress
const WARN_KB     = 150;  // should compress
const TARGET_KB   = 120;  // ideal max for coloring images
const COVER_KB    = 100;  // ideal max for covers

// ── Walk directories for image files ────────────────────────────────────────
function* walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(fullPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) {
        yield fullPath;
      }
    }
  }
}

// ── Collect images ───────────────────────────────────────────────────────────
const images = [];
for (const absPath of walkDir(path.join(ROOT, 'assets'))) {
  const relPath = path.relative(ROOT, absPath);
  const bytes   = fs.statSync(absPath).size;
  const kb      = Math.round(bytes / 1024);

  // Skip system images from bundle size calculation
  const isSystem = /^assets\/(icon|adaptive-icon|favicon|splash-icon)\.png$/.test(relPath);

  // Categorize
  let category = 'other';
  if (relPath.includes('/stories/') && relPath.includes('/colorir/')) category = 'coloring';
  else if (relPath.includes('/stories/') && relPath.includes('/cover/')) category = 'cover';
  else if (relPath.includes('/images/') && (relPath.includes('_capa') || relPath.includes('arcoiris'))) category = 'cover';
  else if (relPath.includes('/images/')) category = 'narration';
  else if (isSystem) category = 'system';

  // Status
  let status;
  if (kb > CRITICAL_KB)       status = 'CRITICAL';
  else if (kb > WARN_KB)      status = 'WARN';
  else if (kb <= TARGET_KB)   status = 'OK';
  else                        status = 'REVIEW';

  images.push({ relPath, kb, bytes, category, status, isSystem });
}

// ── Sort by size desc ────────────────────────────────────────────────────────
images.sort((a, b) => b.kb - a.kb);

// ── Filter if needed ─────────────────────────────────────────────────────────
const filtered = CRITICAL_ONLY ? images.filter(i => i.kb > CRITICAL_KB) : images;

// ── JSON output ──────────────────────────────────────────────────────────────
if (JSON_OUTPUT) {
  console.log(JSON.stringify(filtered, null, 2));
  process.exit(0);
}

// ── Text report ──────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log('  REPORT-IMAGE-SIZES — Pequenos Traços de Fé');
console.log('  NÃO DESTRUTIVO — apenas leitura');
if (CRITICAL_ONLY) console.log('  Mode: --critical-only (> 300 KB only)');
console.log('══════════════════════════════════════════════════════════\n');

// ── Summary by category ──────────────────────────────────────────────────────
const byCategory = {};
let totalBundleKB = 0;
images.forEach(img => {
  if (!img.isSystem) totalBundleKB += img.kb;
  if (!byCategory[img.category]) byCategory[img.category] = { count: 0, kb: 0, critical: 0 };
  byCategory[img.category].count++;
  byCategory[img.category].kb += img.kb;
  if (img.status === 'CRITICAL') byCategory[img.category].critical++;
});

console.log('── Resumo por categoria ─────────────────────────────────');
Object.entries(byCategory).forEach(([cat, data]) => {
  const critStr = data.critical > 0 ? ` (${data.critical} CRITICAL)` : '';
  console.log(`  ${cat.padEnd(12)} ${String(data.count).padStart(3)} arquivos  ${String(Math.round(data.kb/1024*100)/100).padStart(8)} MB${critStr}`);
});
console.log(`\n  Total em bundle:  ${(totalBundleKB / 1024).toFixed(2)} MB (${images.filter(i => !i.isSystem).length} arquivos)`);
console.log(`  Projeção 20 hist: ~${((totalBundleKB / 30 * 200) / 1024).toFixed(0)} MB de colorir (estimativa linear)\n`);

// ── Critical files ────────────────────────────────────────────────────────────
const criticalFiles = images.filter(i => i.kb > CRITICAL_KB);
if (criticalFiles.length > 0) {
  console.log('── Arquivos CRITICAL (> 300 KB) — compressão obrigatória ─');
  criticalFiles.forEach(img => {
    const saving = Math.round((1 - TARGET_KB / img.kb) * 100);
    console.log(`  ✗ ${String(img.kb).padStart(5)} KB  ${img.relPath}`);
    console.log(`       → Meta: ${TARGET_KB} KB  |  Redução esperada: ~${saving}%`);
  });
  console.log('');
}

// ── Warning files ─────────────────────────────────────────────────────────────
const warnFiles = images.filter(i => i.kb > WARN_KB && i.kb <= CRITICAL_KB);
if (warnFiles.length > 0 && !CRITICAL_ONLY) {
  console.log('── Arquivos WARN (150–300 KB) — avaliar compressão ───────');
  warnFiles.forEach(img => {
    console.log(`  ⚠ ${String(img.kb).padStart(5)} KB  ${img.relPath}`);
  });
  console.log('');
}

// ── OK files ──────────────────────────────────────────────────────────────────
if (!CRITICAL_ONLY) {
  const okFiles = images.filter(i => i.kb <= WARN_KB && !i.isSystem);
  if (okFiles.length > 0) {
    console.log(`── Arquivos OK (≤ 150 KB) — ${okFiles.length} arquivos ──────────────`);
    okFiles.forEach(img => {
      console.log(`  ✓ ${String(img.kb).padStart(5)} KB  ${img.relPath}`);
    });
    console.log('');
  }
}

// ── Compression commands ──────────────────────────────────────────────────────
if (criticalFiles.length > 0) {
  console.log('── Comandos de compressão sugeridos (executar após backup) ─');
  console.log('  # Instalar pngquant: https://pngquant.org');
  console.log('  # Verificar antes:   node scripts/report-image-sizes.js');
  console.log('  # Criar backup:      cp -r assets/stories/ assets/stories_backup/');
  console.log('');
  console.log('  # Comprimir PNG de colorir (não destrutivo — salva em .png)');
  console.log('  pngquant --quality 70-85 --ext .png --force \\');
  console.log('    assets/stories/noe/colorir/*.png \\');
  console.log('    assets/stories/davi_golias/colorir/*.png \\');
  console.log('    assets/stories/jesus_criancas/colorir/*.png');
  console.log('');
  console.log('  # Verificar resultado depois:');
  console.log('  node scripts/report-image-sizes.js --critical-only');
  console.log('  # Se OK → commit; se não → restaurar backup');
}

console.log('\n══════════════════════════════════════════════════════════');
console.log(`  STATUS: ${criticalFiles.length} CRITICAL  |  ${warnFiles.length} WARN  |  ${images.filter(i=>i.kb<=WARN_KB&&!i.isSystem).length} OK`);
console.log('══════════════════════════════════════════════════════════\n');
