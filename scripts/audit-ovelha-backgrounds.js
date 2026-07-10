/**
 * audit-ovelha-backgrounds.js — Auditoria PERCEPTUAL dos backgrounds de "Cadê a Ovelhinha?".
 *
 * Decodifica os PIXELS de cada par (original PNG × processado WebP) e prova que o processado
 * é o MESMO quadro COMPLETO do original — sem crop, zoom, espelhamento, rotação, perda da
 * faixa inferior nem de qualquer lateral, e sem arquivo com extensão WebP e bytes de outro
 * formato. Falha (exit 1) em qualquer divergência. Gate MANUAL (usa `sharp`, devDependency) —
 * NÃO roda dentro do smoke.
 *
 * Uso: node scripts/audit-ovelha-backgrounds.js
 */
const path = require('path');
const fs = require('fs');
const sharp = require(path.join(__dirname, '..', 'node_modules', 'sharp'));

const ORIG = path.join(__dirname, '..', 'assets', 'games', 'cade_a_ovelhinha', 'backgrounds', 'originals');
const PROC = path.join(__dirname, '..', 'assets', 'games', 'cade_a_ovelhinha', 'backgrounds', 'processed');

/** Pares auditados: original .png (em originals/) × processado .webp (em processed/). */
const PARES = ['farm_lively_01', 'bakery_01', 'underwater_01', 'toy_workshop_01', 'laundry_yard_01'];

const W = 256, H = 320;
const MAE_MAX = 8.0;         // ruído de WebP fica < ~5; > 8 = crop/zoom/perda de conteúdo
const CORR_MIN = 0.99;       // correlação estrutural mínima
const MAE_ALT_MIN = 18.0;    // espelhado/rotacionado tem de ser MUITO diferente (> este piso)

async function rgb(file) {
  return sharp(file).resize(W, H, { fit: 'fill' }).removeAlpha().raw().toBuffer();
}
async function rgbTransform(file, tr) {
  let img = sharp(file).resize(W, H, { fit: 'fill' });
  if (tr === 'flopX') img = img.flop();       // espelho horizontal
  if (tr === 'rot180') img = img.rotate(180);
  return img.removeAlpha().raw().toBuffer();
}
function mae(a, b, x0, y0, x1, y1) {
  let sum = 0, n = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * W + x) * 3;
    sum += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    n += 3;
  }
  return sum / n;
}
function corr(a, b, x0, y0, x1, y1) {
  let ma = 0, mb = 0, n = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * W + x) * 3; ma += a[i]; mb += b[i]; n++; }
  ma /= n; mb /= n;
  let num = 0, da = 0, db = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * W + x) * 3; num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return num / Math.sqrt(da * db || 1);
}
function isRiffWebp(buf) {
  return buf.length > 12 && buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP';
}

(async () => {
  let falhas = 0;
  for (const nome of PARES) {
    const orig = path.join(ORIG, `${nome}.png`);
    const proc = path.join(PROC, `${nome}.webp`);
    const problemas = [];
    if (!fs.existsSync(orig)) problemas.push('original ausente');
    if (!fs.existsSync(proc)) problemas.push('processado ausente');
    if (problemas.length) { console.log(`\nFALHA ${nome}: ${problemas.join(', ')}`); falhas++; continue; }

    if (!isRiffWebp(fs.readFileSync(proc))) problemas.push('processado não é WebP real (bytes)');
    const mo = await sharp(orig).metadata();
    const mp = await sharp(proc).metadata();
    if (mo.width !== mp.width || mo.height !== mp.height) problemas.push(`dimensões diferem (${mo.width}x${mo.height} vs ${mp.width}x${mp.height})`);
    const ro = mo.height / mo.width, rp = mp.height / mp.width;
    if (Math.abs(ro - rp) > 0.002) problemas.push('proporção diferente');
    const orientO = mo.width >= mo.height ? 'paisagem' : 'retrato';
    const orientP = mp.width >= mp.height ? 'paisagem' : 'retrato';
    if (orientO !== orientP) problemas.push('orientação diferente');

    const a = await rgb(orig), b = await rgb(proc);
    const regioes = {
      global: mae(a, b, 0, 0, W, H),
      canto_SE: mae(a, b, 0, 0, W / 2, H / 2),
      canto_SD: mae(a, b, W / 2, 0, W, H / 2),
      canto_IE: mae(a, b, 0, H / 2, W / 2, H),
      canto_ID: mae(a, b, W / 2, H / 2, W, H),
      faixa_superior_20: mae(a, b, 0, 0, W, Math.floor(H * 0.20)),
      faixa_inferior_25: mae(a, b, 0, Math.floor(H * 0.75), W, H),
      faixa_esquerda: mae(a, b, 0, 0, Math.floor(W * 0.20), H),
      faixa_direita: mae(a, b, Math.floor(W * 0.80), 0, W, H),
    };
    for (const [k, v] of Object.entries(regioes)) if (v > MAE_MAX) problemas.push(`${k} divergente (MAE ${v.toFixed(1)})`);
    const corrGlobal = corr(a, b, 0, 0, W, H);
    const corrInf = corr(a, b, 0, Math.floor(H * 0.75), W, H);
    if (corrGlobal < CORR_MIN) problemas.push(`correlação global baixa (${corrGlobal.toFixed(3)})`);
    if (corrInf < CORR_MIN) problemas.push(`correlação faixa inferior baixa (${corrInf.toFixed(3)})`);

    // Espelhamento / rotação: o processado NÃO pode casar melhor transformado do que igual.
    const flop = await rgbTransform(proc, 'flopX');
    const rot = await rgbTransform(proc, 'rot180');
    const maeFlop = mae(a, flop, 0, 0, W, H);
    const maeRot = mae(a, rot, 0, 0, W, H);
    if (maeFlop < MAE_ALT_MIN) problemas.push(`possível espelhamento (MAE flop ${maeFlop.toFixed(1)})`);
    if (maeRot < MAE_ALT_MIN) problemas.push(`possível rotação (MAE rot180 ${maeRot.toFixed(1)})`);

    const ok = problemas.length === 0;
    if (!ok) falhas++;
    console.log(`\n${ok ? 'OK ' : 'FALHA'} ${nome}  ${mo.width}x${mo.height} (${orientO}, ratio ${ro.toFixed(4)})`);
    for (const [k, v] of Object.entries(regioes)) console.log(`   MAE ${k.padEnd(18)} ${v.toFixed(2)}`);
    console.log(`   corr global ${corrGlobal.toFixed(4)} · corr inferior ${corrInf.toFixed(4)} · MAE flop ${maeFlop.toFixed(1)} · MAE rot180 ${maeRot.toFixed(1)}`);
    if (!ok) console.log(`   >> ${problemas.join(' | ')}`);
  }
  if (falhas > 0) { console.error(`\nAuditoria perceptual FALHOU em ${falhas} par(es).`); process.exit(1); }
  console.log(`\nAuditoria perceptual OK: os ${PARES.length} processados contêm o quadro completo do original (sem crop/zoom/espelho/rotação/perda de lateral).`);
})().catch((e) => { console.error(e); process.exit(1); });
