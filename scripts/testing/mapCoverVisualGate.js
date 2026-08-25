/**
 * F6-PERF-01 — Portão VISUAL objetivo da capa no pin do mapa.
 *
 * A correção muda a RESOLUÇÃO em que a capa é decodificada. A F6.6 já provou que uma
 * redução mal dimensionada degrada a arte, então "passou no teste unitário" não basta:
 * é preciso comparar PIXEL A PIXEL o que o pin pinta antes e depois.
 *
 * Três imagens, todas do mesmo asset e com o MESMO enquadramento (recorte "cover"
 * quadrado centrado, saída do tamanho exato do círculo do pin):
 *
 *   ANTES  — comportamento atual: decodifica em tamanho NATIVO (`resizeMethod` "auto"
 *            sobre asset empacotado não gera ResizeOptions) e deixa a GPU minificar
 *            para a caixa com amostragem BILINEAR e SEM mipmap.
 *   DEPOIS — com o patch: decodifica com `inSampleSize` = o passo que o Fresco escolhe
 *            para `resizeMethod="resize"` + `resizeMultiplier=2` (média de blocos s×s,
 *            que é o que o BitmapFactory faz) e então a mesma minificação bilinear.
 *   IDEAL  — referência: a mesma arte reamostrada com filtro de alta qualidade
 *            (Lanczos-3) direto para a caixa. É "como a arte deveria aparecer nesse
 *            tamanho".
 *
 * O IDEAL é a referência de propósito. O ANTES NÃO é padrão-ouro: minificar 1456 px
 * para 156 px com bilinear sem mipmap descarta ~26 de cada 27 texels e produz
 * SERRILHADO — energia de gradiente alta que parece nitidez e não é. Medir o DEPOIS
 * contra o ANTES puniria o patch justamente por corrigir isso. O portão então
 * pergunta o que importa: o DEPOIS fica MAIS LONGE do ideal que o ANTES?
 *
 * Emite uma folha de contato PNG por tamanho de pin em `.expo/f6-perf-01/`
 * (diretório ignorado pelo Git) com ANTES | DEPOIS | IDEAL lado a lado, ampliados,
 * para inspeção humana.
 *
 * IMPORTANTE: isto é SIMULAÇÃO determinística do pipeline de decodificação, não
 * captura de tela do aparelho. NÃO substitui validação física — prova, com números e
 * imagem, que a arte não é degradada pela mudança.
 *
 * Uso: node scripts/testing/mapCoverVisualGate.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
// `sharp` NÃO é dependência declarada do app: vem indireto, do `@expo/image-utils`, e é
// usado só aqui, fora do grafo do bundle. Se sumir, este portão avisa em vez de estourar.
let sharp;
try {
  // eslint-disable-next-line global-require
  sharp = require('sharp');
} catch (e) {
  console.error('VISUAL GATE INDISPONÍVEL — `sharp` não está em node_modules (vem indireto de @expo/image-utils).');
  process.exit(2);
}

const ROOT = path.join(__dirname, '..', '..');
const SAIDA = path.join(ROOT, '.expo', 'f6-perf-01');
const { lerCapas, planoDeDecode } = require('./mapCoverDecodeHarness');

const COVERS_REL = 'src/assets/storyCovers.js';
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

// Caixas reais do pin no aparelho de referência da F6.9 (360 dp, densidade 3.0):
// menor (locked ×0.85 → 44 dp), típica (available ×1.0 → 52 dp) e maior
// (current ×1.22 → 75 dp). Em pixels: 132, 156, 225.
const CAIXAS = [
  { nome: 'pin-menor-44dp', px: 132 },
  { nome: 'pin-tipico-52dp', px: 156 },
  { nome: 'pin-maior-75dp', px: 225 },
];
const MULTIPLICADOR = 2;

const PSNR_TOLERANCIA_DB = 1;  // DEPOIS não pode ficar mais longe do IDEAL que o ANTES
const NITIDEZ_MIN = 0.85;      // nem mais liso que o IDEAL (borrão)
const NITIDEZ_MAX = 1.25;      // nem mais "nervoso" que o IDEAL (serrilhado)

// --- utilitários de pixel (RGB, 3 bytes por pixel) --------------------------

// Média de blocos s×s — o que `BitmapFactory.Options.inSampleSize` faz.
function blocoMedia(src, w, h, s) {
  const dw = Math.max(1, Math.floor(w / s));
  const dh = Math.max(1, Math.floor(h / s));
  const out = Buffer.alloc(dw * dh * 3);
  for (let y = 0; y < dh; y += 1) {
    for (let x = 0; x < dw; x += 1) {
      let r = 0; let g = 0; let b = 0; let n = 0;
      for (let j = 0; j < s; j += 1) {
        const sy = y * s + j;
        if (sy >= h) break;
        for (let i = 0; i < s; i += 1) {
          const sx = x * s + i;
          if (sx >= w) break;
          const p = (sy * w + sx) * 3;
          r += src[p]; g += src[p + 1]; b += src[p + 2]; n += 1;
        }
      }
      const q = (y * dw + x) * 3;
      out[q] = Math.round(r / n); out[q + 1] = Math.round(g / n); out[q + 2] = Math.round(b / n);
    }
  }
  return { data: out, width: dw, height: dh };
}

function recortarQuadradoCentral(src, w, h) {
  const lado = Math.min(w, h);
  const x0 = Math.floor((w - lado) / 2);
  const y0 = Math.floor((h - lado) / 2);
  const out = Buffer.alloc(lado * lado * 3);
  for (let y = 0; y < lado; y += 1) {
    src.copy(out, y * lado * 3, ((y0 + y) * w + x0) * 3, ((y0 + y) * w + x0 + lado) * 3);
  }
  return { data: out, lado, rect: { x: x0, y: y0, w: lado, h: lado } };
}

// Bilinear — o filtro que a GPU aplica ao desenhar a textura na caixa.
function bilinear(src, w, h, destW, destH) {
  const out = Buffer.alloc(destW * destH * 3);
  const sx = w / destW;
  const sy = h / destH;
  for (let y = 0; y < destH; y += 1) {
    const fy = Math.min(h - 1, Math.max(0, (y + 0.5) * sy - 0.5));
    const y0 = Math.floor(fy); const y1 = Math.min(h - 1, y0 + 1); const wy = fy - y0;
    for (let x = 0; x < destW; x += 1) {
      const fx = Math.min(w - 1, Math.max(0, (x + 0.5) * sx - 0.5));
      const x0 = Math.floor(fx); const x1 = Math.min(w - 1, x0 + 1); const wx = fx - x0;
      const p00 = (y0 * w + x0) * 3; const p01 = (y0 * w + x1) * 3;
      const p10 = (y1 * w + x0) * 3; const p11 = (y1 * w + x1) * 3;
      const q = (y * destW + x) * 3;
      for (let c = 0; c < 3; c += 1) {
        const a = src[p00 + c] * (1 - wx) + src[p01 + c] * wx;
        const b = src[p10 + c] * (1 - wx) + src[p11 + c] * wx;
        out[q + c] = Math.round(a * (1 - wy) + b * wy);
      }
    }
  }
  return out;
}

function psnr(a, b) {
  let soma = 0;
  let maxAbs = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = a[i] - b[i];
    soma += d * d;
    if (Math.abs(d) > maxAbs) maxAbs = Math.abs(d);
  }
  const mse = soma / a.length;
  return { psnr: mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse), mse, maxAbs };
}

// Energia de gradiente = proxy objetivo de detalhe. Abaixo do ideal = borrão;
// muito acima do ideal = serrilhado de minificação.
function nitidez(buf, w, h) {
  let soma = 0;
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const p = (y * w + x) * 3;
      const l = (y * w + x - 1) * 3;
      const u = ((y - 1) * w + x) * 3;
      for (let c = 0; c < 3; c += 1) {
        soma += Math.abs(buf[p + c] - buf[l + c]) + Math.abs(buf[p + c] - buf[u + c]);
      }
    }
  }
  return soma / ((w - 2) * (h - 2) * 6);
}

function zoom(buf, w, h, fator) {
  const dw = w * fator; const dh = h * fator;
  const out = Buffer.alloc(dw * dh * 3);
  for (let y = 0; y < dh; y += 1) {
    for (let x = 0; x < dw; x += 1) {
      const p = (Math.floor(y / fator) * w + Math.floor(x / fator)) * 3;
      const q = (y * dw + x) * 3;
      out[q] = buf[p]; out[q + 1] = buf[p + 1]; out[q + 2] = buf[p + 2];
    }
  }
  return { data: out, width: dw, height: dh };
}

// --- execução ---------------------------------------------------------------

async function medirCapa(capa, caixaPx) {
  const arquivo = path.resolve(ROOT, 'src', 'assets', capa.rel);
  const { data, info } = await sharp(arquivo).removeAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width; const H = info.height;

  const plano = planoDeDecode({ coverW: W, coverH: H, caixaPx, multiplicador: MULTIPLICADOR });

  // ANTES — bitmap nativo minificado pela GPU.
  const antesCrop = recortarQuadradoCentral(data, W, H);
  const antes = bilinear(antesCrop.data, antesCrop.lado, antesCrop.lado, caixaPx, caixaPx);

  // DEPOIS — bitmap reduzido no decode e então minificado pela GPU.
  const reduzido = plano.sampleSize === 1
    ? { data, width: W, height: H }
    : blocoMedia(data, W, H, plano.sampleSize);
  const depoisCrop = recortarQuadradoCentral(reduzido.data, reduzido.width, reduzido.height);
  const depois = bilinear(depoisCrop.data, depoisCrop.lado, depoisCrop.lado, caixaPx, caixaPx);

  // IDEAL — referência de alta qualidade, mesmo enquadramento.
  const ideal = await sharp(arquivo).removeAlpha()
    .resize(caixaPx, caixaPx, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .raw().toBuffer();

  const pAntes = psnr(antes, ideal);
  const pDepois = psnr(depois, ideal);
  const nIdeal = nitidez(ideal, caixaPx, caixaPx);

  return {
    id: capa.id,
    nativo: `${W}x${H}`,
    sampleSize: plano.sampleSize,
    decodificado: `${plano.decW}x${plano.decH}`,
    margem: plano.margem,
    mbAntes: (W * H * 4) / 1048576,
    mbDepois: plano.bytes / 1048576,
    psnrAntes: pAntes.psnr,
    psnrDepois: pDepois.psnr,
    ganhoDb: pDepois.psnr - pAntes.psnr,
    psnrEntre: psnr(antes, depois).psnr,
    razaoNitidezAntes: nitidez(antes, caixaPx, caixaPx) / nIdeal,
    razaoNitidezDepois: nitidez(depois, caixaPx, caixaPx) / nIdeal,
    // Enquadramento/recorte/proporção: as duas versões percorrem a MESMA regra de
    // recorte quadrado centrado; a igualdade é conferida em fração da imagem.
    mesmoRecorte: Math.abs((antesCrop.rect.w / W) - (depoisCrop.rect.w / reduzido.width)) < 0.01,
    mesmaDimensao: antes.length === depois.length && depois.length === ideal.length,
    antes,
    depois,
    ideal,
  };
}

async function folhaDeContato(resultados, caixaPx, nome) {
  const FATOR = 2;
  const COLS = 3;      // 3 capas por linha, cada uma em 3 painéis
  const GAP = 6;
  const painel = caixaPx * FATOR;
  const celW = painel * 3 + GAP * 2;
  const linhas = Math.ceil(resultados.length / COLS);
  const W = COLS * (celW + GAP) + GAP;
  const H = linhas * (painel + GAP) + GAP;
  const canvas = Buffer.alloc(W * H * 3, 24);

  resultados.forEach((r, idx) => {
    const col = idx % COLS;
    const lin = Math.floor(idx / COLS);
    const ox = GAP + col * (celW + GAP);
    const oy = GAP + lin * (painel + GAP);
    [r.antes, r.depois, r.ideal].forEach((buf, k) => {
      const z = zoom(buf, caixaPx, caixaPx, FATOR);
      const px = ox + k * (painel + GAP);
      for (let y = 0; y < painel; y += 1) {
        z.data.copy(canvas, ((oy + y) * W + px) * 3, y * z.width * 3, (y + 1) * z.width * 3);
      }
    });
  });

  fs.mkdirSync(SAIDA, { recursive: true });
  const destino = path.join(SAIDA, `${nome}.png`);
  await sharp(canvas, { raw: { width: W, height: H, channels: 3 } }).png().toFile(destino);
  return destino;
}

async function main() {
  const capas = lerCapas(semComentarios(fs.readFileSync(path.join(ROOT, COVERS_REL), 'utf8')));
  let falhas = 0;

  for (const caixa of CAIXAS) {
    const resultados = [];
    for (const capa of capas) {
      // eslint-disable-next-line no-await-in-loop
      resultados.push(await medirCapa(capa, caixa.px));
    }
    const piorGanho = Math.min(...resultados.map((r) => r.ganhoDb));
    const piorNitidez = Math.min(...resultados.map((r) => r.razaoNitidezDepois));
    const maiorNitidez = Math.max(...resultados.map((r) => r.razaoNitidezDepois));
    const recorteOk = resultados.every((r) => r.mesmoRecorte);
    const dimOk = resultados.every((r) => r.mesmaDimensao);
    const mbAntes = resultados.reduce((a, r) => a + r.mbAntes, 0);
    const mbDepois = resultados.reduce((a, r) => a + r.mbDepois, 0);
    // eslint-disable-next-line no-await-in-loop
    const png = await folhaDeContato(resultados, caixa.px, caixa.nome);

    const ok = piorGanho >= -PSNR_TOLERANCIA_DB
      && piorNitidez >= NITIDEZ_MIN && maiorNitidez <= NITIDEZ_MAX
      && recorteOk && dimOk;
    if (!ok) falhas += 1;

    const pior = resultados.reduce((p, r) => (r.ganhoDb < p.ganhoDb ? r : p));
    const medAntes = resultados.reduce((a, r) => a + r.psnrAntes, 0) / resultados.length;
    const medDepois = resultados.reduce((a, r) => a + r.psnrDepois, 0) / resultados.length;
    console.log(`  ${ok ? '✓' : '✗'} ${caixa.nome} (${caixa.px} px) — 20 capas`);
    console.log(`      proximidade do IDEAL: antes ${medAntes.toFixed(1)} dB → depois ${medDepois.toFixed(1)} dB (média)`);
    console.log(`      pior capa: ${pior.id} ${pior.ganhoDb >= 0 ? '+' : ''}${pior.ganhoDb.toFixed(2)} dB (tolerância -${PSNR_TOLERANCIA_DB} dB)`);
    console.log(`      detalhe vs IDEAL: depois ${(piorNitidez * 100).toFixed(0)}%–${(maiorNitidez * 100).toFixed(0)}% (faixa ${NITIDEZ_MIN * 100}%–${NITIDEZ_MAX * 100}%)`);
    console.log(`      recorte idêntico: ${recorteOk} · dimensão de saída idêntica: ${dimOk} · proporção 1:1 em ambos`);
    console.log(`      bitmap se os 20 pins tivessem ESTE tamanho: ${mbAntes.toFixed(1)} MB → ${mbDepois.toFixed(1)} MB`);
    console.log(`      folha de contato (ANTES | DEPOIS | IDEAL): ${path.relative(ROOT, png)}`);
  }

  console.log(falhas === 0 ? 'VISUAL GATE PASS' : `VISUAL GATE FAIL (${falhas})`);
  process.exit(falhas === 0 ? 0 : 1);
}

if (require.main === module) main();

module.exports = { medirCapa, bilinear, blocoMedia, nitidez };
