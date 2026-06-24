#!/usr/bin/env node
/**
 * optimize-scene.js — Piloto de otimização de CENAS COLORIDAS → WebP lossy
 * (Feature 001, T013 · D7). Usa `sharp` (devDependency, build-time).
 *
 * SEGURANÇA (nunca toca assets reais):
 *   - converte APENAS cenas; RECUSA arquivos de COLORIR (flood-fill sensível);
 *   - saída SEMPRE fora de `assets/` (padrão: tmp/assets-pipeline/); RECUSA saída
 *     dentro de assets/ ou assets/stories/;
 *   - nunca sobrescreve o original; nunca move/renomeia/altera assets;
 *   - `--dry-run` (não escreve) e `--help`. Sem integração com runtime do app.
 *
 * Uso:
 *   node scripts/assets-pipeline/optimize-scene.js --in <cena.png> [--out <dir>] \
 *        [--quality 80] [--dry-run]
 *   node scripts/assets-pipeline/optimize-scene.js --help
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const ASSETS_DIR = path.join(root, 'assets');
const DEFAULT_OUT = path.join(root, 'tmp', 'assets-pipeline');
const TARGET_RATIO = 4 / 5;
const RATIO_TOL = 0.01;

function isColoringInput(p) {
  const norm = p.replace(/\\/g, '/');
  return /\/coloring\//i.test(norm) || /coloring/i.test(path.basename(norm));
}
function looksLikeScene(p) {
  const norm = p.replace(/\\/g, '/');
  return /\/scenes?\//i.test(norm) || /_scene_\d+\./i.test(path.basename(norm));
}
function isInsideAssets(absPath) {
  const rel = path.relative(ASSETS_DIR, path.resolve(absPath));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function parseArgs(argv) {
  const args = { in: null, out: null, quality: 80, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--in') args.in = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--quality') args.quality = parseInt(argv[++i], 10);
  }
  return args;
}

const HELP = `optimize-scene.js — piloto: cena colorida -> WebP lossy (sharp, build-time).

  --in <arquivo>   cena de entrada (PNG/JPG). OBRIGATÓRIO (exceto --help).
  --out <dir>      diretório de SAÍDA (padrão: tmp/assets-pipeline/). DEVE ser fora de assets/.
  --quality <N>    qualidade WebP lossy (padrão 80).
  --dry-run        só relata; NÃO escreve.
  --help           esta ajuda.

Regras: só CENAS (recusa colorir); saída fora de assets/; nunca sobrescreve original;
nunca toca assets reais. Não integra com o runtime do app.`;

async function run(argv) {
  const args = parseArgs(argv);
  if (args.help || argv.length === 0) {
    process.stdout.write(HELP + '\n');
    return 0;
  }
  if (!args.in) {
    process.stderr.write('[optimize-scene] erro: --in é obrigatório (use --help)\n');
    return 2;
  }
  const inAbs = path.resolve(args.in);
  // (13) recusa colorir
  if (isColoringInput(inAbs)) {
    process.stderr.write('[optimize-scene] RECUSADO: a entrada parece COLORIR (flood-fill). Use optimize-coloring (lossless) — não este.\n');
    return 1;
  }
  if (!fs.existsSync(inAbs)) {
    process.stderr.write(`[optimize-scene] erro: entrada não encontrada: ${args.in}\n`);
    return 1;
  }
  const outDir = path.resolve(args.out || DEFAULT_OUT);
  // (12) saída nunca dentro de assets/
  if (isInsideAssets(outDir)) {
    process.stderr.write('[optimize-scene] RECUSADO: a saída não pode ficar dentro de assets/ (nem assets/stories/). Use tmp/ ou --out fora de assets.\n');
    return 1;
  }
  const base = path.basename(inAbs).replace(/\.(png|jpe?g|webp)$/i, '');
  const outAbs = path.join(outDir, `${base}.webp`);
  // (5) nunca sobrescreve original; saída != entrada
  if (path.resolve(outAbs) === inAbs) {
    process.stderr.write('[optimize-scene] RECUSADO: saída coincide com a entrada.\n');
    return 1;
  }

  const sharp = require('sharp');
  const meta = await sharp(inAbs).metadata();
  const bytesBefore = fs.statSync(inAbs).size;
  const ratio = meta.width && meta.height ? +(meta.width / meta.height).toFixed(4) : null;
  const is4x5 = ratio != null && Math.abs(ratio - TARGET_RATIO) <= RATIO_TOL;

  const report = {
    input: path.relative(root, inAbs).replace(/\\/g, '/'),
    isScene: looksLikeScene(inAbs),
    format: meta.format || null,
    width: meta.width || null,
    height: meta.height || null,
    ratio,
    is4x5, // (11) cena deve ser 4:5; senão exige aprovação visual
    bytesBefore,
    output: path.relative(root, outAbs).replace(/\\/g, '/'),
    quality: args.quality,
    dryRun: !!args.dryRun,
  };

  if (!is4x5) report.warning = 'Proporção != 4:5 — requer APROVAÇÃO VISUAL (não esticar/cortar).';

  if (args.dryRun) {
    report.bytesAfter = 'N/A (dry-run)';
    report.reductionPct = 'N/A (dry-run)';
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    return 0;
  }

  if (fs.existsSync(outAbs)) {
    process.stderr.write(`[optimize-scene] RECUSADO: saída já existe (não sobrescreve): ${report.output}\n`);
    return 1;
  }
  fs.mkdirSync(outDir, { recursive: true });
  await sharp(inAbs).webp({ quality: args.quality, effort: 4 }).toFile(outAbs); // lossy p/ CENA; preserva dimensões
  const bytesAfter = fs.statSync(outAbs).size;
  report.bytesAfter = bytesAfter;
  report.reductionPct = +(((bytesBefore - bytesAfter) / bytesBefore) * 100).toFixed(1);
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  return 0;
}

if (require.main === module) {
  run(process.argv.slice(2)).then((code) => process.exit(code)).catch((e) => {
    process.stderr.write('[optimize-scene] falha: ' + (e && e.message) + '\n');
    process.exit(1);
  });
}

module.exports = { isColoringInput, looksLikeScene, isInsideAssets, parseArgs, run };
