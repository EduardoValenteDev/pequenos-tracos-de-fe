/**
 * F6-PERF-01 — Harness da DECODIFICAÇÃO DAS CAPAS NO PIN DO MAPA.
 *
 * A campanha física da F6.9 (SM-S928B, 360 dp, densidade 3.0) mediu, no toque de
 * 12:33:03.176, ~5,1 s sem resposta útil e nove frames de 712–1111 ms com 100% da
 * duração na fase SYNC (upload de bitmap para a GPU) e a thread principal em
 * 0,43–0,82 ms. A superfície é a aba Aventuras → `AdventureMapScreen`, cujo
 * `ScrollView` NÃO virtualizado monta as 4 regiões e, dentro delas, os 20
 * `StoryMapMarker` — cada um pintando uma capa de 1456×816 ou 1672×941 dentro de um
 * círculo de 44–77 dp.
 *
 * Este harness prova, sem React Native e sem escrever no repositório, que:
 *   - o pin pede decodificação reduzida (`resizeMethod="resize"`);
 *   - o multiplicador escolhido garante bitmap MAIOR que o círculo em toda a matriz
 *     densidade × estado × escala × capa (nitidez — exatamente o que faltou na F6.6);
 *   - a economia de memória é material;
 *   - a correção é ESCOPADA (arte de região, capa da StoryDetail e a primitiva
 *     `RecoverableImage` continuam sem `resizeMethod`);
 *   - o asset de alta resolução continua disponível e único (nenhuma variante nova);
 *   - o escalonamento de montagem do mapa continua de pé;
 *   - a geometria do pin não mudou um pixel.
 *
 * Os mutantes vivem somente em strings em memória.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const MARKER_REL = 'src/components/map/StoryMapMarker.js';
const REGION_REL = 'src/components/map/MapRegion.js';
const SCREEN_REL = 'src/screens/AdventureMapScreen.js';
const RECOVERABLE_REL = 'src/components/ui/RecoverableImage.js';
const COVERS_REL = 'src/assets/storyCovers.js';
const STORY_COVER_IMAGE_REL = 'src/components/story/StoryCoverImage.js';

const semComentarios = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

// ---------------------------------------------------------------------------
// Dimensões REAIS dos assets — leitor de cabeçalho WebP, sem dependência nova.
// ---------------------------------------------------------------------------
function webpSize(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const fourcc = buf.toString('ascii', 12, 16);
  if (fourcc === 'VP8 ') {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (fourcc === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  if (fourcc === 'VP8X') {
    const w = buf[24] | (buf[25] << 8) | (buf[26] << 16);
    const h = buf[27] | (buf[28] << 8) | (buf[29] << 16);
    return { width: w + 1, height: h + 1 };
  }
  return null;
}

// Extrai `const <nome> = { ... };` por contagem de chaves (o arquivo tem JSX e não
// pode ser carregado como módulo em Node).
function extrairLiteral(source, nome) {
  const marca = new RegExp(`const\\s+${nome}\\s*=\\s*\\{`);
  const m = marca.exec(source);
  if (!m) return null;
  const inicio = source.indexOf('{', m.index);
  let nivel = 0;
  for (let j = inicio; j < source.length; j += 1) {
    if (source[j] === '{') nivel += 1;
    else if (source[j] === '}') {
      nivel -= 1;
      if (nivel === 0) return source.slice(inicio, j + 1);
    }
  }
  return null;
}

function avaliarLiteral(source, nome) {
  const bloco = extrairLiteral(source, nome);
  if (!bloco) return null;
  // eslint-disable-next-line no-new-func
  return new Function(`return ${bloco};`)();
}

function lerCapas(coversSource) {
  const bloco = extrairLiteral(coversSource, 'STORY_COVERS');
  if (!bloco) return [];
  const entradas = [...bloco.matchAll(/([A-Za-z0-9_]+)\s*:\s*require\('([^']+)'\)/g)];
  return entradas.map(([, id, rel]) => {
    const arquivo = path.resolve(ROOT, 'src', 'assets', rel);
    if (!fs.existsSync(arquivo)) return { id, rel, existe: false, width: 0, height: 0 };
    const dim = webpSize(fs.readFileSync(arquivo));
    return { id, rel, existe: true, width: dim ? dim.width : 0, height: dim ? dim.height : 0 };
  });
}

// ---------------------------------------------------------------------------
// Modelo do downsample do Fresco (DownsampleUtil / SampleSizeUtil).
//
// `inSampleSize` é POTÊNCIA DE DOIS e a escolha tem TOLERÂNCIA (ROUND_UP_FRACTION =
// 2/3): pedir exatamente a caixa pode devolver um bitmap MENOR que ela. É daí que
// vem o multiplicador — e é isso que explica por que a tentativa da F6.6 degradou a
// arte da capa na StoryDetail.
// ---------------------------------------------------------------------------
const ROUND_UP_FRACTION = 2 / 3;
const MAX_BITMAP_DIMENSION = 2048;

function ratioToSampleSize(ratio) {
  if (ratio > 0.5 + 0.5 * ROUND_UP_FRACTION) return 1;
  let sampleSize = 2;
  while (sampleSize <= 1024) {
    const maxRatio = (1 / (2 * sampleSize)) * (1 + ROUND_UP_FRACTION);
    if (maxRatio <= ratio) return sampleSize;
    sampleSize *= 2;
  }
  return 1024;
}

function determineDownsampleRatio(reqW, reqH, w, h) {
  let ratio = Math.max(reqW / w, reqH / h);
  if (w * ratio > MAX_BITMAP_DIMENSION) ratio = MAX_BITMAP_DIMENSION / w;
  if (h * ratio > MAX_BITMAP_DIMENSION) ratio = MAX_BITMAP_DIMENSION / h;
  return ratio;
}

// `ReactImageView.resizeOptions` usa largura/altura da VIEW em PIXELS × multiplicador.
// `multiplicador = null` representa o comportamento ANTERIOR: `resizeMethod` "auto"
// sobre asset empacotado → `shouldResize` falso → sem ResizeOptions → tamanho NATIVO.
function planoDeDecode({ coverW, coverH, caixaPx, caixaW, caixaH, multiplicador }) {
  const cw = caixaW || caixaPx;
  const ch = caixaH || caixaPx;
  if (!multiplicador) {
    return {
      sampleSize: 1,
      decW: coverW,
      decH: coverH,
      bytes: coverW * coverH * 4,
      margem: Math.min(coverW / cw, coverH / ch),
    };
  }
  const reqW = Math.round(cw * multiplicador);
  const reqH = Math.round(ch * multiplicador);
  const ratio = determineDownsampleRatio(reqW, reqH, coverW, coverH);
  const s = ratioToSampleSize(ratio);
  const decW = Math.max(1, Math.floor(coverW / s));
  const decH = Math.max(1, Math.floor(coverH / s));
  return {
    sampleSize: s,
    decW,
    decH,
    bytes: decW * decH * 4,
    // resizeMode="cover": quem manda é o eixo em que o bitmap fica mais apertado.
    margem: Math.min(decW / cw, decH / ch),
  };
}

// Geometria do pin — espelha `StoryMapMarker` linha a linha.
function caixaInternaDp(state, markerScale, SIZE, RING) {
  const scale = Math.min(1.25, Math.max(0.85, markerScale || 1));
  const size = Math.round((SIZE[state] || SIZE.available) * scale);
  const ring = RING[state] || RING.available;
  return size - ring.width * 2;
}

const ESTADOS = ['current', 'available', 'completed', 'locked', 'nextLocked'];
// Densidades em jogo: tablets mdpi/hdpi, SM-X510 MÉDIO (2.0), Pixel (2.625), o
// S24 Ultra da F6.9 com override 1080×2340 @480 dpi (3.0) e o teto 4.0.
const DENSIDADES = [1.5, 2.0, 2.625, 3.0, 3.5, 4.0];
// Extremos do clamp de `markerScale` + os dois valores realmente usados no mapa.
const ESCALAS = [0.85, 1, 1.1, 1.22, 1.25];

const DENSIDADE_REF = 3.0; // perna telefone compacto da F6.9 (360 dp)
const TETO_BYTES_REF = 25 * 1024 * 1024; // teto para as 20 capas do mapa

// ---------------------------------------------------------------------------
// Gates
// ---------------------------------------------------------------------------
function avaliarGates(sources = {}) {
  const markerCode = semComentarios(sources.marker || read(MARKER_REL));
  const regionCode = semComentarios(sources.region || read(REGION_REL));
  const screenCode = semComentarios(sources.screen || read(SCREEN_REL));
  const recoverableCode = semComentarios(sources.recoverable || read(RECOVERABLE_REL));
  const coversCode = semComentarios(sources.storyCovers || read(COVERS_REL));
  const coverImageCode = semComentarios(sources.storyCoverImage || read(STORY_COVER_IMAGE_REL));

  const SIZE = avaliarLiteral(markerCode, 'SIZE');
  const RING = avaliarLiteral(markerCode, 'RING');

  // Bloco de props da <RecoverableImage> da CAPA (do `source={cover}` até o
  // `renderFallback`), para não confundir com nenhuma outra imagem do arquivo.
  const capaMatch = /<RecoverableImage source=\{cover\}([\s\S]*?)renderFallback/.exec(markerCode);
  const propsCapa = capaMatch ? capaMatch[1] : '';

  const multMatch = /const\s+COVER_RESIZE_MULTIPLIER\s*=\s*([0-9.]+)\s*;/.exec(markerCode);
  const multiplicador = multMatch ? Number(multMatch[1]) : null;
  const usaMultiplicador = /resizeMultiplier=\{COVER_RESIZE_MULTIPLIER\}/.test(propsCapa);

  const gateResize = /resizeMethod="resize"/.test(propsCapa);
  const gateMult = multiplicador !== null && Number.isFinite(multiplicador)
    && multiplicador >= 2 && usaMultiplicador;

  const capas = lerCapas(coversCode);
  const capasValidas = capas.filter((c) => c.existe && c.width > 0 && c.height > 0);
  // O multiplicador só vale se o `resizeMethod` estiver de fato pedindo redução.
  const multEfetivo = gateResize ? (multiplicador || 1) : null;

  // Matriz de nitidez: toda capa × todo estado × toda escala × toda densidade.
  let piorMargem = Infinity;
  let piorCaso = null;
  if (SIZE && RING && capasValidas.length > 0) {
    capasValidas.forEach((capa) => {
      ESTADOS.forEach((state) => {
        ESCALAS.forEach((escala) => {
          const dp = caixaInternaDp(state, escala, SIZE, RING);
          DENSIDADES.forEach((densidade) => {
            const caixaPx = Math.round(dp * densidade);
            const plano = planoDeDecode({
              coverW: capa.width, coverH: capa.height, caixaPx, multiplicador: multEfetivo,
            });
            if (plano.margem < piorMargem) {
              piorMargem = plano.margem;
              piorCaso = { capa: capa.id, state, escala, densidade, caixaPx, ...plano };
            }
          });
        });
      });
    });
  }
  const gateNitidez = capasValidas.length === 20 && piorMargem >= 1;

  // Economia: soma dos 20 pins no aparelho de referência (360 dp @ 3.0), com as
  // escalas reais do mapa (creation 1.22, noah 1.10, demais 1).
  const escalaReal = (id) => (id === 'creation' ? 1.22 : id === 'noah' ? 1.10 : 1);
  const somar = (mult) => capasValidas.reduce((acc, capa) => {
    const dp = caixaInternaDp('available', escalaReal(capa.id), SIZE || {}, RING || {});
    const caixaPx = Math.round(dp * DENSIDADE_REF);
    return acc + planoDeDecode({
      coverW: capa.width, coverH: capa.height, caixaPx, multiplicador: mult,
    }).bytes;
  }, 0);
  const bytesAntes = SIZE && RING ? somar(null) : 0;
  const bytesDepois = SIZE && RING ? somar(multEfetivo) : 0;
  const gateEconomia = bytesDepois > 0 && bytesDepois <= TETO_BYTES_REF
    && bytesDepois * 4 <= bytesAntes;

  // Escopo: a redução vale SÓ para o pin. A arte de região aparece AMPLIADA
  // (941×1672 numa caixa de ~1080×1920) e a capa da StoryDetail aparece perto do
  // tamanho nativo — reduzir qualquer uma das duas é o erro que a F6.6 já cometeu.
  const gateEscopo = !/resizeMethod/.test(regionCode)
    && !/resizeMethod/.test(recoverableCode)
    && !/resizeMethod/.test(coverImageCode);

  // Alta resolução preservada onde é realmente necessária: manifest único, 20
  // entradas, arquivos presentes, nenhuma variante reduzida — e a StoryDetail segue
  // consumindo a capa cheia em 16:9 sem redução.
  const gateAltaRes = capas.length === 20
    && capas.every((c) => c.existe && /_cover\.webp$/.test(c.rel))
    && capasValidas.every((c) => Math.min(c.width, c.height) >= 800)
    && /aspectRatio:\s*16\s*\/\s*9/.test(coverImageCode)
    && /resizeMode="cover"/.test(coverImageCode);

  // Montagem escalonada continua de pé: o mapa não pode voltar a montar toda a arte
  // final de uma vez, e os marcadores continuam entrando depois da 1ª pintura.
  const timers = (screenCode.match(/addFinal\('[a-z_]+'\)/g) || []).length;
  const gateMontagem = /loadedFinalIds/.test(screenCode)
    && timers >= 3
    && /renderImageFinal=\{loadedFinalIds\.has\(region\.id\)\}/.test(screenCode)
    && /OVERLAY_DELAY_MS/.test(regionCode);

  // Geometria intacta: enquadramento (cover), caixa 100%×100% e a primitiva ainda
  // repassando props para EXATAMENTE uma <Image> (nenhuma camada nova de layout).
  const gateGeometria = /resizeMode="cover"/.test(propsCapa)
    && /cover:\s*\{\s*width:\s*'100%',\s*height:\s*'100%'\s*\}/.test(markerCode)
    && /<Image key=\{token\} source=\{source\} onError=\{aoFalhar\} onLoad=\{aoCarregar\} \{\.\.\.rest\} \/>/.test(recoverableCode)
    && (recoverableCode.match(/<Image/g) || []).length === 1;

  return {
    'G-PERF-1-RESIZE': gateResize,
    'G-PERF-2-MULT': gateMult,
    'G-PERF-3-NITIDEZ': gateNitidez,
    'G-PERF-4-ECONOMIA': gateEconomia,
    'G-PERF-5-ESCOPO': gateEscopo,
    'G-PERF-6-ALTA-RES': gateAltaRes,
    'G-PERF-7-MONTAGEM': gateMontagem,
    'G-PERF-8-GEOMETRIA': gateGeometria,
    _dados: {
      multiplicador, capas: capas.length, piorMargem, piorCaso, bytesAntes, bytesDepois, timers,
    },
  };
}

// ---------------------------------------------------------------------------
// Casos focados
// ---------------------------------------------------------------------------
function executarFocados() {
  const casos = [];
  const g = avaliarGates();
  const d = g._dados;

  Object.keys(g).filter((k) => k !== '_dados').forEach((nome) => {
    casos.push({ nome, ok: g[nome] === true, detalhe: JSON.stringify(d.piorCaso) });
  });

  // TA-1/TA-2 — o modelo reproduz o fracasso da F6.6 e o acerto do pin.
  const capa = { coverW: 1456, coverH: 816 };
  const semMult = planoDeDecode({ ...capa, caixaPx: 156, multiplicador: 1 });
  const comMult = planoDeDecode({ ...capa, caixaPx: 156, multiplicador: 2 });
  casos.push({
    nome: 'TA-1 pedir a caixa exata devolve bitmap MENOR que ela (o borrão da F6.6)',
    ok: semMult.margem < 1,
    detalhe: JSON.stringify(semMult),
  });
  casos.push({
    nome: 'TA-2 pedir 2x a caixa devolve bitmap MAIOR que ela (nitidez de sobra)',
    ok: comMult.margem > 1.2,
    detalhe: JSON.stringify(comMult),
  });
  casos.push({
    nome: 'TA-3 a redução do pin economiza ao menos 10x de bitmap',
    ok: comMult.bytes * 10 <= capa.coverW * capa.coverH * 4,
    detalhe: `${comMult.bytes} vs ${capa.coverW * capa.coverH * 4}`,
  });
  // TA-4 — na StoryDetail (mesma capa a ~1080 px de largura) a mesma conta degrada:
  // é a superfície que a F6.6 mediu e reverteu, e continua intocada aqui.
  const naStoryDetail = planoDeDecode({ ...capa, caixaW: 1080, caixaH: 608, multiplicador: 1 });
  casos.push({
    nome: 'TA-4 na StoryDetail a mesma redução degradaria a arte (superfície diferente)',
    ok: naStoryDetail.sampleSize > 1 && naStoryDetail.margem < 1,
    detalhe: JSON.stringify(naStoryDetail),
  });
  // TA-5 — invariante do modelo: com multiplicador 2 a margem vive em (1.2, 2.4].
  casos.push({
    nome: 'TA-5 margem da matriz inteira dentro do invariante (1.15, 2.4]',
    ok: d.piorMargem > 1.15 && d.piorMargem <= 2.4,
    detalhe: JSON.stringify(d.piorCaso),
  });
  // TA-6 — 360 dp @ 3.0 (a perna física da F6.9) e SM-X510 MÉDIO @ 2.0 seguem nítidos.
  const capas = lerCapas(semComentarios(read(COVERS_REL)));
  const SIZE = avaliarLiteral(semComentarios(read(MARKER_REL)), 'SIZE');
  const RING = avaliarLiteral(semComentarios(read(MARKER_REL)), 'RING');
  const piorEm = (densidade) => capas.reduce((pior, c) => ESTADOS.reduce((p2, state) => {
    const dp = caixaInternaDp(state, 1, SIZE, RING);
    const plano = planoDeDecode({
      coverW: c.width, coverH: c.height, caixaPx: Math.round(dp * densidade), multiplicador: 2,
    });
    return Math.min(p2, plano.margem);
  }, pior), Infinity);
  casos.push({
    nome: 'TA-6 nitidez preservada a 360 dp / densidade 3.0 (perna física da F6.9)',
    ok: piorEm(3.0) >= 1,
    detalhe: `margem ${piorEm(3.0).toFixed(3)}x`,
  });
  casos.push({
    nome: 'TA-7 nitidez preservada no MÉDIO/tablet SM-X510 (densidade 2.0)',
    ok: piorEm(2.0) >= 1,
    detalhe: `margem ${piorEm(2.0).toFixed(3)}x`,
  });
  return { casos };
}

// ---------------------------------------------------------------------------
// Mutantes
// ---------------------------------------------------------------------------
function executarMutantes() {
  const original = {
    marker: read(MARKER_REL),
    region: read(REGION_REL),
    screen: read(SCREEN_REL),
    recoverable: read(RECOVERABLE_REL),
    storyCovers: read(COVERS_REL),
    storyCoverImage: read(STORY_COVER_IMAGE_REL),
  };
  const mutantes = [];
  const matar = (nome, gate, chave, transform) => {
    const mutado = { ...original, [chave]: transform(original[chave]) };
    if (mutado[chave] === original[chave]) {
      mutantes.push({ nome, ok: false, detalhe: 'mutação não aplicou (âncora mudou)' });
      return;
    }
    const gates = avaliarGates(mutado);
    mutantes.push({ nome, ok: gates[gate] === false, detalhe: `${gate}=${gates[gate]}` });
  };

  matar('MT-P1 pin volta ao resizeMethod padrão', 'G-PERF-1-RESIZE', 'marker',
    (s) => s.replace('resizeMethod="resize" resizeMultiplier={COVER_RESIZE_MULTIPLIER}', ''));
  matar('MT-P2 multiplicador 1 (pede a caixa exata)', 'G-PERF-3-NITIDEZ', 'marker',
    (s) => s.replace('const COVER_RESIZE_MULTIPLIER = 2;', 'const COVER_RESIZE_MULTIPLIER = 1;'));
  matar('MT-P3 multiplicador abaixo de 1', 'G-PERF-2-MULT', 'marker',
    (s) => s.replace('const COVER_RESIZE_MULTIPLIER = 2;', 'const COVER_RESIZE_MULTIPLIER = 0.5;'));
  matar('MT-P4 multiplicador 16 (perde a economia)', 'G-PERF-4-ECONOMIA', 'marker',
    (s) => s.replace('const COVER_RESIZE_MULTIPLIER = 2;', 'const COVER_RESIZE_MULTIPLIER = 16;'));
  matar('MT-P5 resizeMethod global na primitiva', 'G-PERF-5-ESCOPO', 'recoverable',
    (s) => s.replace('{...rest} />', 'resizeMethod="resize" {...rest} />'));
  matar('MT-P6 resizeMethod na arte de região (que aparece AMPLIADA)', 'G-PERF-5-ESCOPO', 'region',
    (s) => s.replace('source={asleepPreview}', 'source={asleepPreview} resizeMethod="resize"'));
  matar('MT-P7 mapa volta a montar toda a arte final de uma vez', 'G-PERF-7-MONTAGEM', 'screen',
    (s) => s.replace('renderImageFinal={loadedFinalIds.has(region.id)}', 'renderImageFinal'));
  matar('MT-P8 enquadramento da capa trocado (contain)', 'G-PERF-8-GEOMETRIA', 'marker',
    (s) => s.replace('resizeMode="cover"\n              resizeMethod', 'resizeMode="contain"\n              resizeMethod'));
  matar('MT-P9 primitiva para de repassar props', 'G-PERF-8-GEOMETRIA', 'recoverable',
    (s) => s.replace(' {...rest} />', ' />'));
  matar('MT-P10 troca em massa das capas por variante reduzida', 'G-PERF-6-ALTA-RES', 'storyCovers',
    (s) => s.replace(/_cover\.webp/g, '_cover_thumb.webp'));
  return { mutantes };
}

function main() {
  const { casos } = executarFocados();
  const { mutantes } = executarMutantes();
  casos.forEach((c) => console.log(`  ${c.ok ? '✓' : '✗'} ${c.nome}${c.ok ? '' : ` — ${c.detalhe}`}`));
  mutantes.forEach((m) => console.log(`  ${m.ok ? '✓' : '✗'} ${m.nome} ${m.ok ? 'KILLED' : `SURVIVED — ${m.detalhe}`}`));
  const d = avaliarGates()._dados;
  console.log(`  · pior margem de nitidez: ${d.piorMargem.toFixed(3)}x — ${JSON.stringify(d.piorCaso)}`);
  console.log(`  · bitmap dos 20 pins @360dp/3.0: ${(d.bytesAntes / 1048576).toFixed(1)} MB → ${(d.bytesDepois / 1048576).toFixed(1)} MB`);
  const fp = casos.filter((c) => c.ok).length;
  const mp = mutantes.filter((m) => m.ok).length;
  console.log(`FOCUSED ${fp}/${casos.length} PASS; MUTANTS ${mp}/${mutantes.length} KILLED`);
  process.exit(fp === casos.length && mp === mutantes.length ? 0 : 1);
}

if (require.main === module) main();

module.exports = {
  avaliarGates, executarFocados, executarMutantes, planoDeDecode, ratioToSampleSize, lerCapas,
};
