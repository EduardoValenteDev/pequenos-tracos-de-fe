/**
 * audit-ovelha-backgrounds.js — Auditoria PERCEPTUAL dos backgrounds de "Cadê a Ovelhinha?".
 *
 * Decodifica os PIXELS do original e do processado e prova que o processado contém o
 * QUADRO COMPLETO do original (topo, base, laterais e a faixa inferior de 25%), não uma
 * região ampliada/recortada. Falha (exit 1) se qualquer região divergir além do limiar de
 * compressão. É um gate manual (usa `sharp`, devDependency) — NÃO roda dentro do smoke.
 *
 * Uso: node scripts/audit-ovelha-backgrounds.js
 */
const path = require('path');
const sharp = require(path.join(__dirname, '..', 'node_modules', 'sharp'));

const R = path.join(__dirname, '..', 'assets', 'games', 'cade_a_ovelhinha', 'backgrounds');
const NOMES = ['farm_01', 'warehouse_01'];
const W = 256, H = 320;                 // amostra normalizada (razão ~ da arte)
const MAE_MAX = 8.0;                    // ruído de WebP q84 fica < ~5; > 8 = crop/zoom real
const CORR_MIN = 0.99;                  // correlação estrutural mínima da faixa inferior

async function rgb(file) {
  return sharp(file).resize(W, H, { fit: 'fill' }).removeAlpha().raw().toBuffer();
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
function corr(a, b, y0) {
  let ma = 0, mb = 0, n = 0;
  for (let y = y0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 3; ma += a[i]; mb += b[i]; n++; }
  ma /= n; mb /= n;
  let num = 0, da = 0, db = 0;
  for (let y = y0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 3; num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return num / Math.sqrt(da * db);
}

(async () => {
  let falhas = 0;
  for (const nome of NOMES) {
    const orig = path.join(R, `${nome}.webp`);
    const proc = path.join(R, 'processed', `${nome}.webp`);
    const mo = await sharp(orig).metadata();
    const mp = await sharp(proc).metadata();
    const dimOk = mo.width === mp.width && mo.height === mp.height && mp.width === 1122 && mp.height === 1402;
    const a = await rgb(orig), b = await rgb(proc);
    const regioes = {
      global: mae(a, b, 0, 0, W, H),
      canto_SE: mae(a, b, 0, 0, W / 2, H / 2),
      canto_SD: mae(a, b, W / 2, 0, W, H / 2),
      canto_IE: mae(a, b, 0, H / 2, W / 2, H),
      canto_ID: mae(a, b, W / 2, H / 2, W, H),
      faixa_inferior_25: mae(a, b, 0, Math.floor(H * 0.75), W, H),
    };
    const corrInf = corr(a, b, Math.floor(H * 0.75));
    const maeOk = Object.values(regioes).every((v) => v <= MAE_MAX);
    const corrOk = corrInf >= CORR_MIN;
    const ok = dimOk && maeOk && corrOk;
    if (!ok) falhas++;
    console.log(`\n${ok ? 'OK ' : 'FALHA'} ${nome}  dims ${mo.width}x${mo.height} -> ${mp.width}x${mp.height} (${dimOk ? 'ok' : 'DIFERE'})`);
    for (const [k, v] of Object.entries(regioes)) console.log(`   MAE ${k.padEnd(18)} ${v.toFixed(2)} ${v <= MAE_MAX ? '' : '<< ACIMA'}`);
    console.log(`   corr faixa inferior 25% ${corrInf.toFixed(4)} ${corrOk ? '' : '<< ABAIXO'}`);
  }
  if (falhas > 0) { console.error(`\nAuditoria perceptual FALHOU em ${falhas} background(s): o processado NÃO corresponde ao quadro completo do original.`); process.exit(1); }
  console.log('\nAuditoria perceptual OK: o processado contém o quadro completo do original (topo, base, laterais e faixa inferior).');
})().catch((e) => { console.error(e); process.exit(1); });
