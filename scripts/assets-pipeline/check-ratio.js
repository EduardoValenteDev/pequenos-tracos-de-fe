#!/usr/bin/env node
/**
 * check-ratio.js — Validador de proporção 4:5 (Feature 001, T015 · FR-008/SC-004).
 *
 * Lê APENAS o cabeçalho das imagens (PNG via IHDR, JPG/JPEG via SOF) e sinaliza
 * CENAS e COLORIR fora de 4:5 para APROVAÇÃO VISUAL. Isenta capas/mapas/avatares/
 * outros. NUNCA altera, converte, move, corta ou redimensiona — só REPORTA.
 *
 * Modo padrão = relatório (exit 0 mesmo com avisos). `--strict` falha (exit 1) se
 * houver ofensores/não-suportados — para uso futuro em CI; NÃO ativado no smoke.
 *
 * Uso: `npm run assets:check-ratio`  ·  `node scripts/assets-pipeline/check-ratio.js --strict`
 */
const fs = require('fs');
const path = require('path');
const { categorize } = require('./inventory');

const root = path.resolve(__dirname, '..', '..');
const TARGET = 4 / 5; // 0.8
const TOL = 0.01; // tolerância p/ arredondamento (0.79–0.81)
const ENFORCED = ['scenes', 'coloring'];
const IMG_EXT = /\.(png|jpe?g|webp)$/i;
const HEAD_BYTES = 65536; // só o cabeçalho — evita ler arquivos grandes inteiros

function readHead(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const buf = Buffer.alloc(HEAD_BYTES);
    const bytes = fs.readSync(fd, buf, 0, HEAD_BYTES, 0);
    return buf.slice(0, bytes);
  } finally {
    fs.closeSync(fd);
  }
}

function pngDims(b) {
  if (b.length < 24 || b.slice(1, 4).toString() !== 'PNG') return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function jpgDims(b) {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let o = 2;
  while (o + 9 < b.length) {
    if (b[o] !== 0xff) { o += 1; continue; }
    const m = b[o + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: b.readUInt16BE(o + 5), w: b.readUInt16BE(o + 7) };
    }
    o += 2 + b.readUInt16BE(o + 2);
  }
  return null;
}

function dims(rel) {
  let head;
  try {
    head = readHead(path.join(root, rel));
  } catch (e) {
    return null;
  }
  if (/\.png$/i.test(rel)) return pngDims(head);
  if (/\.jpe?g$/i.test(rel)) return jpgDims(head);
  return null; // webp/outros: não suportado pelo leitor (reportado como tal)
}

function walk(relDir, acc) {
  const abs = path.join(root, relDir);
  if (!fs.existsSync(abs)) return acc;
  for (const name of fs.readdirSync(abs).sort()) {
    const rel = (relDir + '/' + name).replace(/\\/g, '/');
    const st = fs.statSync(path.join(root, rel));
    if (st.isDirectory()) walk(rel, acc);
    else if (IMG_EXT.test(rel)) acc.push(rel);
  }
  return acc;
}

function run() {
  const files = walk('assets', []);
  const offenders = [];
  const unsupported = [];
  const exemptByCategory = {};
  let checked = 0;
  let ok = 0;

  for (const rel of files) {
    const cat = categorize(rel);
    if (!ENFORCED.includes(cat)) {
      exemptByCategory[cat] = (exemptByCategory[cat] || 0) + 1;
      continue;
    }
    checked += 1;
    const d = dims(rel);
    if (!d || !d.w || !d.h) {
      unsupported.push({ path: rel, category: cat, reason: 'dimensões ausentes ou formato não suportado' });
      continue;
    }
    const ratio = +(d.w / d.h).toFixed(4);
    if (Math.abs(ratio - TARGET) <= TOL) ok += 1;
    else offenders.push({ path: rel, category: cat, width: d.w, height: d.h, ratio });
  }

  offenders.sort((a, b) => (a.path < b.path ? -1 : 1));
  unsupported.sort((a, b) => (a.path < b.path ? -1 : 1));

  return {
    target: '4:5 (0.8)',
    tolerance: TOL,
    enforcedCategories: ENFORCED,
    summary: { checked, ok, offenders: offenders.length, unsupported: unsupported.length },
    offenders, // cenas/colorir fora de 4:5 → APROVAÇÃO VISUAL (nunca esticar/cortar)
    unsupported,
    exemptByCategory, // categorias isentas (capas/mapas/ui/outros) com contagem
    note: 'Leitura pura (cabeçalho) — não altera/converte/move/corta. Só sinaliza.',
  };
}

if (require.main === module) {
  const strict = process.argv.includes('--strict');
  const r = run();
  process.stdout.write(JSON.stringify(r, null, 2) + '\n');
  if (strict && (r.offenders.length > 0 || r.unsupported.length > 0)) process.exit(1);
  process.exit(0);
}

module.exports = { run };
