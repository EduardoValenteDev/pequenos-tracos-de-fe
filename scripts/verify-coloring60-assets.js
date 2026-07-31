#!/usr/bin/env node
'use strict';

/**
 * verify-coloring60-assets.js — Gate determinístico e AUDITÁVEL de integridade do
 * "Colorir com o Beni" (Colorir 60 · A Criação), ancorado no baseline da Fase 2.5.
 *
 * ORIGEM E ADAPTAÇÃO (P2X §9.1)
 * Transplantado de `feat/colorir-60-pilot-creation` (commits e954d6a → dccea14 → cc63e19).
 * A versão original pressupunha coisas que NÃO valem mais neste baseline e foram removidas:
 *   1. `PRODUCTION_DIR` — pasta externa (`C:\tmp\ptf_colorir60_creation_production`) usada
 *      como FONTE das cópias. Hoje a fonte autoritativa é o blob versionado em Git (P2A
 *      `e4e55a7` e P2B `9eb0244`); um diretório de scratch por máquina não é contrato.
 *   2. Modos `--mode=pre` / `--mode=post` — a distinção "antes/depois da cópia" morreu com a
 *      integração. O gate agora assere UM estado: o integrado.
 *   3. Matriz de 3 assets — passou a 8 arquivos físicos (3 linearts + 5 poses do Beni).
 *   4. `bytesEqual` — existia só para a prova fonte-externa↔destino; sem fonte externa,
 *      seria código morto.
 * O que foi PRESERVADO integralmente: leitura pura, classificação de path por `lstat` (sem
 * seguir symlink), perícia PNG por assinatura + IHDR, agregação estrita de integridade
 * (`=== true`, sem tolerância), saída determinística e o guard `require.main === module`.
 *
 * O QUE ESTE GATE FAZ (16 verificações — P2X §9.1):
 *   [01] Existência dos oito assets.        [09] Três IDs exatos.
 *   [02] Dimensões.                         [10] Nenhum item duplicado.
 *   [03] Tipo PNG.                          [11] Resolução positiva dos três itens.
 *   [04] Integridade estrutural.            [12] Resolução negativa de story inválida.
 *   [05] Transparência das cinco poses.     [13] Resolução negativa de activity inválida.
 *   [06] Cantos transparentes.              [14] scene_02.png no blob aprovado.
 *   [07] Paths do catálogo.                 [15] scene_02.png com consumidor único.
 *   [08] Catálogo versus registry.          [16] Nenhum asset fora da lista oficial.
 *
 * ADAPTAÇÃO P3J (aposentadoria do Colorir legado): a verificação [15] mudava de sentido junto com
 * a remoção do mapa `src/assets/coloringImages.js`. Ela NÃO foi enfraquecida — passou a exigir que
 * o mapa legado esteja ausente e que, em todo o `src/`, o registro do Colorir 60 seja o ÚNICO
 * módulo que requer `scene_02.png`. As outras quinze seguem literalmente as mesmas.
 *
 * O QUE ESTE GATE NUNCA FAZ (invariante de segurança):
 *   - NUNCA copia, move, renomeia, cria, apaga, trunca ou reescreve arquivo algum.
 *   - NUNCA reencoda, converte nem "conserta" (autofix) nenhum asset.
 *   - NUNCA aceita fallback: asset ausente NÃO é suprido por outro.
 *   - NUNCA usa dependência externa. Só builtins do Node: fs/path/crypto/zlib.
 *     (`zlib` entrou com as verificações [05]/[06], que exigem decodificar o canal alpha;
 *     é builtin, não dependência — a regra "não adicione dependências" segue intacta.)
 *   - NUNCA usa child_process. NUNCA aceita caminho arbitrário do chamador.
 *
 * EXIT: 0 se as 16 verificações passam; 1 em qualquer divergência.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

// Raiz do repositório resolvida a partir de __dirname (scripts/ vive na raiz), NUNCA de cwd.
const REPO_ROOT = path.resolve(__dirname, '..');

const LINEART_DIMS = Object.freeze({ width: 1122, height: 1402 });
const POSE_DIMS = Object.freeze({ width: 1024, height: 1280 });

// Assinatura PNG canônica (8 bytes): \x89 P N G \r \n \x1A \n.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const COLOR_TYPE_LABEL = Object.freeze({
  0: 'Grayscale', 2: 'RGB', 3: 'Palette', 4: 'GrayscaleAlpha', 6: 'RGBA',
});

const REL = Object.freeze({
  SCENE_02: 'assets/stories/creation/coloring/scene_02.png',
  ACTIVITIES_DIR: 'assets/stories/creation/coloring/activities',
  FORBIDDEN_LIGHT: 'assets/stories/creation/coloring/activities/light.png',
  BENI_DIR: 'assets/mascot/beni',
  CATALOG: 'src/data/coloring60Catalog.js',
  REGISTRY: 'src/assets/coloring60LocalAssets.js',
  RESOLVER: 'src/services/coloring60Resolver.js',
  BENI_IMAGES: 'src/assets/mascot/beniImages.js',
  LEGACY_COLORING_MAP: 'src/assets/coloringImages.js',
});

// ── MATRIZ FECHADA: 3 linearts (uma delas por REUSO) ────────────────────────────────────
// `light` NÃO tem arquivo próprio: reusa scene_02.png. `activities/light.png` é PROIBIDO.
const LINEARTS = Object.freeze([
  Object.freeze({
    activityId: 'light',
    role: 'reuse',
    rel: REL.SCENE_02,
    forbiddenRel: REL.FORBIDDEN_LIGHT,
    expectedSha256: 'c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1',
    expectedBytes: 861767,
    expectedDims: LINEART_DIMS,
    expectedBitDepth: 8,
    expectedColorType: 2,
    expectedColorMode: 'RGB',
  }),
  Object.freeze({
    activityId: 'living_world',
    role: 'own_file',
    rel: 'assets/stories/creation/coloring/activities/living_world.png',
    expectedSha256: '818cd917c7493f4a3e04512a7120a6eaff5a03fdd16277b7d4fdfd1ee33b6ac5',
    expectedBytes: 973618,
    expectedDims: LINEART_DIMS,
    expectedBitDepth: 8,
    expectedColorType: 2,
    expectedColorMode: 'RGB',
  }),
  Object.freeze({
    activityId: 'people_and_care',
    role: 'own_file',
    rel: 'assets/stories/creation/coloring/activities/people_and_care.png',
    expectedSha256: '59988d9a58082a8173a328857fccb6a3716815660f4434c0df4491d6bf30d4e9',
    expectedBytes: 1195149,
    expectedDims: LINEART_DIMS,
    expectedBitDepth: 8,
    expectedColorType: 2,
    expectedColorMode: 'RGB',
  }),
]);

// ── MATRIZ FECHADA: 5 poses do Beni (RGBA com fundo transparente) ───────────────────────
const POSES = Object.freeze([
  Object.freeze({
    poseKey: 'admiraEsquerda', rel: 'assets/mascot/beni/12_beni_admira_esquerda.png',
    expectedSha256: '00d79751129ff8121e497d94191429df2eb6083a13fff86d6a834be7d49b91de',
    expectedBytes: 818885, expectedDims: POSE_DIMS, expectedBitDepth: 8,
    expectedColorType: 6, expectedColorMode: 'RGBA',
  }),
  Object.freeze({
    poseKey: 'admiraDireita', rel: 'assets/mascot/beni/13_beni_admira_direita.png',
    expectedSha256: '9c309d23e3b65d64bc8be6243a520e66984b88f8509394f81e838ae3e304545a',
    expectedBytes: 888021, expectedDims: POSE_DIMS, expectedBitDepth: 8,
    expectedColorType: 6, expectedColorMode: 'RGBA',
  }),
  Object.freeze({
    poseKey: 'celebraFrente', rel: 'assets/mascot/beni/14_beni_celebra_frente.png',
    expectedSha256: 'cff48323d5c7855681e494026c1f00775cadc2c73528c163e3b527bf4cd45709',
    expectedBytes: 953223, expectedDims: POSE_DIMS, expectedBitDepth: 8,
    expectedColorType: 6, expectedColorMode: 'RGBA',
  }),
  Object.freeze({
    poseKey: 'apresentaGaleria', rel: 'assets/mascot/beni/15_beni_apresenta_galeria.png',
    expectedSha256: '29719e11a4d17c87b26467eed38782cbbaeddf80175d10246c98315b5e51fd36',
    expectedBytes: 779480, expectedDims: POSE_DIMS, expectedBitDepth: 8,
    expectedColorType: 6, expectedColorMode: 'RGBA',
  }),
  Object.freeze({
    poseKey: 'olhaAcima', rel: 'assets/mascot/beni/16_beni_olha_acima.png',
    expectedSha256: '302b8ca37d9dd0dc4328949ca24d032f72c86a5b7afb2c0f46e7702359b3516f',
    expectedBytes: 847780, expectedDims: POSE_DIMS, expectedBitDepth: 8,
    expectedColorType: 6, expectedColorMode: 'RGBA',
  }),
]);

// Os OITO arquivos físicos do contrato (3 linearts + 5 poses). Contagem travada em runAll().
const ALL_ASSETS = Object.freeze(LINEARTS.concat(POSES));

// Os 11 PNGs canônicos do Beni que já existiam antes da expansão do Colorir 60.
const BENI_CANONICAL_PNGS = Object.freeze([
  '01_beni_avatar_base.png', '02_beni_acenando.png', '03_beni_celebrando.png',
  '04_beni_com_bau.png', '05_beni_ensinando.png', '06_beni_orando.png',
  '07_beni_atelie.png', '08_beni_celebrando_2.png', '09_beni_descansando.png',
  '10_beni_apontando_direita.png', '11_beni_apontando_esquerda.png',
]);

const EXPECTED_ACTIVITY_IDS = Object.freeze(['light', 'living_world', 'people_and_care']);

// ---------- leitura pura + perícia PNG (sem qualquer efeito colateral) ----------

// Estados possíveis de uma entrada de filesystem. ABSENT significa que NENHUMA entrada
// existe no caminho; qualquer outra coisa (diretório, symlink — inclusive quebrado —,
// tipo exótico ou erro de inspeção) NÃO é ausência e NUNCA passa num gate de ausência.
const PATH_KIND = Object.freeze({
  ABSENT: 'absent',
  REGULAR_FILE: 'regular_file',
  DIRECTORY: 'directory',
  SYMLINK: 'symlink',
  OTHER: 'other',
  INSPECTION_ERROR: 'inspection_error',
});

/**
 * classifyLstat(err, st) — classificador PURO (sem I/O) de um resultado de lstat.
 * Separado de inspectPathKind para ser testável com doubles de fs (stat/err fabricados),
 * sem depender da criação física de symlink (não-portável no Windows sem privilégio).
 */
function classifyLstat(err, st) {
  if (err) return err.code === 'ENOENT' ? PATH_KIND.ABSENT : PATH_KIND.INSPECTION_ERROR;
  if (st.isSymbolicLink()) return PATH_KIND.SYMLINK;
  if (st.isFile()) return PATH_KIND.REGULAR_FILE;
  if (st.isDirectory()) return PATH_KIND.DIRECTORY;
  return PATH_KIND.OTHER;
}

/** inspectPathKind(p) — inspeção read-only do TIPO da entrada (lstat, NÃO segue symlink). */
function inspectPathKind(p) {
  try {
    return classifyLstat(null, fs.lstatSync(p));
  } catch (e) {
    return classifyLstat(e, null);
  }
}

/** Verdadeiro somente se `p` é EXATAMENTE ausente (nenhuma entrada de filesystem). */
function isAbsent(p) {
  return inspectPathKind(p) === PATH_KIND.ABSENT;
}

/** Verdadeiro somente se `p` é um ARQUIVO REGULAR (symlink→arquivo NÃO conta). */
function isRegularFile(p) {
  return inspectPathKind(p) === PATH_KIND.REGULAR_FILE;
}

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * inspectPng(buf) — perícia estrutural mínima e determinística: assinatura de 8 bytes +
 * IHDR (largura/altura uint32BE, bit-depth, color-type, interlace).
 * NUNCA conserta nem infere: bytes insuficientes / assinatura errada / IHDR ausente ⇒ ok:false.
 */
function inspectPng(buf) {
  if (!Buffer.isBuffer(buf)) return { ok: false, reason: 'entrada não é Buffer' };
  if (buf.length < 33) return { ok: false, reason: 'arquivo curto demais para conter IHDR' };
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) return { ok: false, reason: 'assinatura PNG inválida' };
  // O comprimento declarado do IHDR é SEMPRE exatamente 13 num PNG válido — divergência é falha dura.
  if (buf.readUInt32BE(8) !== 13) return { ok: false, reason: 'IHDR com comprimento ≠ 13' };
  if (buf.subarray(12, 16).toString('ascii') !== 'IHDR') return { ok: false, reason: 'primeiro chunk não é IHDR' };
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  const interlace = buf[28];
  const colorMode = COLOR_TYPE_LABEL[colorType] || `desconhecido(${colorType})`;
  return { ok: true, width, height, bitDepth, colorType, colorMode, interlace };
}

// CRC-32 (PNG usa o polinômio padrão) — usado só para VERIFICAR chunks, nunca para reescrever.
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * scanPngChunks(buf) — percorre a cadeia de chunks e devolve o veredito estrutural:
 * CRC de CADA chunk conferido, presença de IEND e ausência de bytes após ele.
 * Um PNG truncado, com chunk corrompido ou com lixo anexado reprova aqui.
 */
function scanPngChunks(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 8 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { ok: false, reason: 'assinatura ausente', crcBad: -1, hasIEND: false, trailing: -1, chunks: [] };
  }
  const chunks = [];
  let crcBad = 0;
  let hasIEND = false;
  let off = 8;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const end = off + 8 + len;
    if (end + 4 > buf.length) return { ok: false, reason: 'chunk truncado', crcBad, hasIEND, trailing: -1, chunks };
    const type = buf.toString('ascii', off + 4, off + 8);
    if (crc32(buf.subarray(off + 4, end)) !== buf.readUInt32BE(end)) crcBad++;
    chunks.push(type);
    off = end + 4;
    if (type === 'IEND') { hasIEND = true; break; }
  }
  const trailing = buf.length - off;
  return {
    ok: crcBad === 0 && hasIEND && trailing === 0,
    reason: crcBad !== 0 ? 'CRC divergente' : !hasIEND ? 'IEND ausente' : trailing !== 0 ? 'bytes após IEND' : null,
    crcBad, hasIEND, trailing, chunks,
  };
}

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
};

/**
 * measureAlpha(buf) — decodifica o canal alpha de um PNG RGBA de 8 bits e devolve as
 * medidas de transparência. A prova é por ÁREA, não por pixel isolado:
 *   - `ringNonZero`: pixels opacos no anel externo de 8 px (um cenário/moldura acusaria aqui);
 *   - `fullOpaqueRows/Cols`: linhas/colunas 100% opacas de ponta a ponta (fundo retangular);
 *   - `corners`: os quatro cantos;
 *   - `bbox`: caixa do conteúdo visível (tem de ser MENOR que o quadro).
 * Só decodifica; nunca reescreve. Devolve { ok:false, reason } sem lançar em entrada inválida.
 */
function measureAlpha(buf) {
  const png = inspectPng(buf);
  if (!png.ok) return { ok: false, reason: png.reason };
  if (png.colorType !== 6 || png.bitDepth !== 8) return { ok: false, reason: 'não é RGBA 8 bits' };
  if (png.interlace !== 0) return { ok: false, reason: 'PNG entrelaçado (Adam7) não é suportado pelo contrato' };

  const chunkScan = scanPngChunks(buf);
  if (!chunkScan.ok) return { ok: false, reason: chunkScan.reason };

  // Reúne os IDAT na ordem em que aparecem e infla.
  const idat = [];
  let off = 8;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    if (type === 'IDAT') idat.push(buf.subarray(off + 8, off + 8 + len));
    off += 12 + len;
    if (type === 'IEND') break;
  }
  let raw;
  try {
    raw = zlib.inflateSync(Buffer.concat(idat));
  } catch (e) {
    return { ok: false, reason: `IDAT não inflável: ${e && e.message ? e.message : e}` };
  }

  const W = png.width; const H = png.height;
  const bytesPerRow = W * 4;
  if (raw.length !== H * (bytesPerRow + 1)) return { ok: false, reason: 'IDAT inflado com tamanho inesperado' };

  const px = Buffer.alloc(H * bytesPerRow);
  let pos = 0;
  for (let y = 0; y < H; y++) {
    const ft = raw[pos++];
    const rs = y * bytesPerRow;
    const ps = (y - 1) * bytesPerRow;
    for (let x = 0; x < bytesPerRow; x++) {
      const rb = raw[pos + x];
      const a = x >= 4 ? px[rs + x - 4] : 0;
      const b = y > 0 ? px[ps + x] : 0;
      const c = x >= 4 && y > 0 ? px[ps + x - 4] : 0;
      let v;
      switch (ft) {
        case 0: v = rb; break;
        case 1: v = rb + a; break;
        case 2: v = rb + b; break;
        case 3: v = rb + ((a + b) >> 1); break;
        case 4: v = rb + paeth(a, b, c); break;
        default: return { ok: false, reason: `filtro PNG desconhecido (${ft}) na linha ${y}` };
      }
      px[rs + x] = v & 0xff;
    }
    pos += bytesPerRow;
  }

  const A = (x, y) => px[y * bytesPerRow + x * 4 + 3];
  let minA = 256; let maxA = -1; let zero = 0; let visible = 0;
  let minX = W; let minY = H; let maxX = -1; let maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = A(x, y);
      if (a < minA) minA = a;
      if (a > maxA) maxA = a;
      if (a === 0) { zero++; } else {
        visible++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  let ringNonZero = 0; let ringTotal = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (x < 8 || y < 8 || x >= W - 8 || y >= H - 8) { ringTotal++; if (A(x, y) !== 0) ringNonZero++; }
    }
  }
  let fullOpaqueRows = 0; let fullOpaqueCols = 0;
  for (let y = 0; y < H; y++) {
    let all = true;
    for (let x = 0; x < W; x++) if (A(x, y) !== 255) { all = false; break; }
    if (all) fullOpaqueRows++;
  }
  for (let x = 0; x < W; x++) {
    let all = true;
    for (let y = 0; y < H; y++) if (A(x, y) !== 255) { all = false; break; }
    if (all) fullOpaqueCols++;
  }
  const total = W * H;
  return {
    ok: true,
    width: W,
    height: H,
    alphaMin: minA,
    alphaMax: maxA,
    transparentPct: +((zero / total) * 100).toFixed(2),
    visiblePx: visible,
    corners: { tl: A(0, 0), tr: A(W - 1, 0), bl: A(0, H - 1), br: A(W - 1, H - 1) },
    ringNonZero,
    ringTotal,
    fullOpaqueRows,
    fullOpaqueCols,
    bbox: maxX < 0 ? null : { w: maxX - minX + 1, h: maxY - minY + 1 },
  };
}

/**
 * probe(abs, expected) — perícia completa de UM arquivo contra o contrato do asset.
 * Read-only. Retorna um registro estruturado com todos os checks e o agregado `integrityOk`.
 * `integrityOk` é conjunção ESTRITA (`=== true`): nenhum atributo tem tolerância ou fallback.
 */
function probe(abs, expected) {
  const kind = inspectPathKind(abs);
  const rec = {
    path: abs, pathKind: kind,
    exists: kind !== PATH_KIND.ABSENT,
    isRegularFile: kind === PATH_KIND.REGULAR_FILE,
  };
  if (kind !== PATH_KIND.REGULAR_FILE) return rec;
  let buf;
  try {
    buf = fs.readFileSync(abs);
  } catch (e) {
    rec.readError = String(e && e.message ? e.message : e);
    return rec;
  }
  return Object.assign(rec, probeBuffer(buf, expected));
}

/**
 * probeBuffer(buf, expected) — o NÚCLEO de decisão do probe, separado do I/O para que os
 * controles negativos possam exercitar a REGRA REAL com bytes fabricados (um byte trocado,
 * assinatura destruída, tamanho errado) sem tocar em nenhum arquivo do repositório.
 */
function probeBuffer(buf, expected) {
  const rec = { bytes: buf.length, sha256: sha256Hex(buf) };
  const png = inspectPng(buf);
  const structure = scanPngChunks(buf);
  rec.png = png;
  rec.structure = structure;
  rec.sizeOk = rec.bytes === expected.expectedBytes;
  rec.shaOk = rec.sha256 === expected.expectedSha256;
  rec.magicOk = png.ok;
  rec.dimsOk = png.ok && png.width === expected.expectedDims.width && png.height === expected.expectedDims.height;
  rec.bitDepthOk = png.ok && png.bitDepth === expected.expectedBitDepth;
  rec.colorTypeOk = png.ok && png.colorType === expected.expectedColorType;
  rec.colorModeOk = png.ok && png.colorMode === expected.expectedColorMode;
  rec.structureOk = structure.ok === true && png.ok && png.interlace === 0;
  rec.integrityOk =
    rec.sizeOk === true &&
    rec.shaOk === true &&
    rec.magicOk === true &&
    rec.dimsOk === true &&
    rec.bitDepthOk === true &&
    rec.colorTypeOk === true &&
    rec.colorModeOk === true &&
    rec.structureOk === true;
  return rec;
}

// ---------- carga dos módulos REAIS de src/ (sem transpilador, sem dependência) ----------

/**
 * loadRealModule(rel, deps, exportNames) — avalia o CÓDIGO REAL de um módulo ESM de `src/`
 * dentro deste processo. Remove `import`/`export`/`export default` (o Metro/Babel fazem isso
 * em produção) e injeta as dependências como parâmetros. Os `require()` de PNG são atendidos
 * por um stub do chamador — assim a ÁRVORE DE DECISÃO exercitada é a de produção, e nenhum
 * binário é decodificado à toa.
 */
function loadRealModule(rel, deps, exportNames) {
  const src = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
  const code = src
    .replace(/^import[\s\S]*?;$/gm, '')
    .replace(/export default[\s\S]*$/m, '')
    .replace(/export /g, '')
    + `\n; return { ${exportNames.join(', ')} };`;
  const keys = Object.keys(deps);
  // eslint-disable-next-line no-new-func
  return new Function(...keys, code)(...keys.map((k) => deps[k]));
}

/** Sentinelas distintas por path — provam que cada atividade recebe a SUA fonte, nunca a de outra. */
function buildRegistryStub() {
  const sentinels = new Map();
  for (const l of LINEARTS) sentinels.set(l.rel, Object.freeze({ __sentinel__: l.activityId }));
  const req = (p) => {
    const resolved = path.resolve(REPO_ROOT, 'src/assets', p).split(path.sep).join('/');
    for (const [rel, sent] of sentinels) {
      if (resolved.endsWith(rel)) return sent;
    }
    throw new Error(`registro: require inesperado ${p}`);
  };
  return { req, sentinels };
}

/** Carrega catálogo + registro + resolvedor REAIS, já ligados entre si. */
function loadColoring60Contracts() {
  const catalog = loadRealModule(REL.CATALOG, {}, [
    'COLORING60_MODEL_VERSION', 'getColoring60Activities', 'getColoring60Activity',
  ]);
  const { req, sentinels } = buildRegistryStub();
  const registry = loadRealModule(REL.REGISTRY, { require: req }, ['getColoring60LocalSource']);
  const resolver = loadRealModule(REL.RESOLVER, {
    getColoring60Activity: catalog.getColoring60Activity,
    getColoring60LocalSource: registry.getColoring60LocalSource,
  }, ['resolveColoring60Lineart', 'COLORING60_RESOLUTION_STATUS']);
  return { catalog, registry, resolver, sentinels };
}

// ---------- as 16 verificações ----------

function abs(rel) {
  return path.join(REPO_ROOT, rel);
}

/**
 * runAll() — executa as 16 verificações e devolve a lista de resultados.
 * PURA quanto a efeitos: só lê disco. Nunca chama process.exit (isso é do main).
 */
function runAll() {
  const results = [];
  const add = (id, titulo, pass, detalhe) => results.push({ id, titulo, pass: pass === true, detalhe: detalhe || '' });

  // Perícia dos oito arquivos, feita uma vez e reaproveitada.
  const probes = ALL_ASSETS.map((a) => ({ asset: a, rec: probe(abs(a.rel), a) }));

  // [01] Existência dos oito assets.
  const ausentes = probes.filter((p) => p.rec.isRegularFile !== true).map((p) => p.asset.rel);
  add('01', 'Existência dos oito assets',
    ALL_ASSETS.length === 8 && ausentes.length === 0,
    ausentes.length ? `não são arquivos regulares: ${ausentes.join(', ')}` : `matriz com ${ALL_ASSETS.length} assets (esperado 8)`);

  // [02] Dimensões.
  const dimsRuins = probes.filter((p) => p.rec.dimsOk !== true)
    .map((p) => `${p.asset.rel} (${p.rec.png && p.rec.png.ok ? `${p.rec.png.width}x${p.rec.png.height}` : '?'})`);
  add('02', 'Dimensões (linearts 1122×1402 · poses 1024×1280)',
    dimsRuins.length === 0, dimsRuins.join(', '));

  // [03] Tipo PNG (bit depth + color type + rótulo de modo).
  const tipoRuim = probes.filter((p) => !(p.rec.magicOk === true && p.rec.bitDepthOk === true && p.rec.colorTypeOk === true && p.rec.colorModeOk === true))
    .map((p) => `${p.asset.rel} (${p.rec.png && p.rec.png.ok ? p.rec.png.colorMode : 'sem IHDR'})`);
  add('03', 'Tipo PNG (linearts RGB · poses RGBA · 8 bits)', tipoRuim.length === 0, tipoRuim.join(', '));

  // [04] Integridade estrutural: CRC de cada chunk, IEND, sem lixo, sem entrelaçamento,
  //      e o par sha256+bytes do contrato.
  const estruturaRuim = probes.filter((p) => p.rec.integrityOk !== true)
    .map((p) => `${p.asset.rel} (${[
      p.rec.sizeOk ? null : `bytes=${p.rec.bytes}`,
      p.rec.shaOk ? null : `sha=${p.rec.sha256}`,
      p.rec.structureOk ? null : `estrutura=${p.rec.structure ? p.rec.structure.reason : '?'}`,
    ].filter(Boolean).join(' ')})`);
  add('04', 'Integridade estrutural (CRC + IEND + sem lixo + sha256 + bytes)',
    estruturaRuim.length === 0, estruturaRuim.join(', '));

  // [05] Transparência das cinco poses (por ÁREA: anel de 8 px e ausência de fundo retangular).
  const alphaByPose = new Map();
  const transpRuim = [];
  for (const pose of POSES) {
    const p = abs(pose.rel);
    const m = isRegularFile(p) ? measureAlpha(fs.readFileSync(p)) : { ok: false, reason: 'ausente' };
    alphaByPose.set(pose.poseKey, m);
    const ok = m.ok === true
      && m.alphaMin === 0 && m.alphaMax > 0
      && m.visiblePx > 0
      && m.ringNonZero === 0
      && m.fullOpaqueRows === 0 && m.fullOpaqueCols === 0
      && m.bbox != null && m.bbox.w < m.width && m.bbox.h < m.height
      && m.transparentPct > 20;
    if (!ok) {
      transpRuim.push(`${pose.poseKey} (${m.ok ? `anel=${m.ringNonZero} linhasOpacas=${m.fullOpaqueRows} transp=${m.transparentPct}%` : m.reason})`);
    }
  }
  add('05', 'Transparência das cinco poses (anel de 8 px vazio · sem retângulo de fundo)',
    transpRuim.length === 0, transpRuim.join(', '));

  // [06] Cantos transparentes.
  const cantosRuins = [];
  for (const pose of POSES) {
    const m = alphaByPose.get(pose.poseKey);
    const c = m && m.ok ? m.corners : null;
    if (!c || c.tl !== 0 || c.tr !== 0 || c.bl !== 0 || c.br !== 0) {
      cantosRuins.push(`${pose.poseKey} (${c ? `${c.tl}/${c.tr}/${c.bl}/${c.br}` : 'sem medida'})`);
    }
  }
  add('06', 'Cantos transparentes nas cinco poses', cantosRuins.length === 0, cantosRuins.join(', '));

  // Contratos de código: catálogo, registro e resolvedor REAIS.
  let contracts = null;
  let loadError = null;
  try {
    contracts = loadColoring60Contracts();
  } catch (e) {
    loadError = String(e && e.message ? e.message : e);
  }
  const acts = contracts ? contracts.catalog.getColoring60Activities('creation') : [];

  // [07] Paths do catálogo: cada atividade do catálogo tem lineart físico íntegro na matriz.
  const relByActivity = new Map(LINEARTS.map((l) => [l.activityId, l.rel]));
  const pathsRuins = [];
  for (const a of acts) {
    const rel = relByActivity.get(a.activityId);
    if (!rel) { pathsRuins.push(`${a.activityId} sem lineart na matriz`); continue; }
    const rec = probes.find((p) => p.asset.rel === rel);
    if (!rec || rec.rec.integrityOk !== true) pathsRuins.push(`${a.activityId} → ${rel} não íntegro`);
    if (a.expectedSha256 !== (rec && rec.asset ? rec.asset.expectedSha256 : null)) {
      pathsRuins.push(`${a.activityId}: expectedSha256 do catálogo ≠ contrato do arquivo`);
    }
    if (!a.expectedDims || a.expectedDims.width !== LINEART_DIMS.width || a.expectedDims.height !== LINEART_DIMS.height) {
      pathsRuins.push(`${a.activityId}: expectedDims ≠ 1122×1402`);
    }
  }
  add('07', 'Paths do catálogo apontam para linearts íntegros com o hash declarado',
    contracts != null && acts.length === 3 && pathsRuins.length === 0,
    loadError || pathsRuins.join(', '));

  // [08] Correspondência catálogo × registry: todo item do catálogo tem fonte no registro,
  //      e o registro não fornece fonte para nada fora do catálogo.
  let corrRuim = [];
  if (contracts) {
    for (const a of acts) {
      if (contracts.registry.getColoring60LocalSource('creation', a.activityId) == null) {
        corrRuim.push(`catálogo tem ${a.activityId}, registro não fornece fonte`);
      }
    }
    for (const extra of ['light2', 'water', 'scene_02', 'nope']) {
      if (contracts.registry.getColoring60LocalSource('creation', extra) != null) {
        corrRuim.push(`registro fornece fonte para ${extra}, que não está no catálogo`);
      }
    }
    if (contracts.registry.getColoring60LocalSource('noah', 'light') != null) {
      corrRuim.push('registro fornece fonte para história fora do piloto');
    }
  }
  add('08', 'Correspondência catálogo × registry (1:1, sem excedente dos dois lados)',
    contracts != null && corrRuim.length === 0, loadError || corrRuim.join(', '));

  // [09] Três IDs exatos, na ordem canônica.
  const ids = acts.map((a) => a.activityId);
  add('09', 'Três IDs exatos e em ordem (light · living_world · people_and_care)',
    ids.join(',') === EXPECTED_ACTIVITY_IDS.join(','),
    `recebido: ${ids.join(',') || '(nenhum)'}`);

  // [10] Nenhum item duplicado: ids, orders, hashes e paths são únicos.
  const dup = (arr) => arr.length !== new Set(arr).size;
  const dupRuim = [];
  if (dup(ids)) dupRuim.push('activityId duplicado');
  if (dup(acts.map((a) => a.order))) dupRuim.push('order duplicada');
  if (dup(acts.map((a) => a.expectedSha256))) dupRuim.push('expectedSha256 duplicado');
  if (dup(acts.map((a) => a.localSourceKey))) dupRuim.push('localSourceKey duplicado');
  if (dup(ALL_ASSETS.map((a) => a.rel))) dupRuim.push('path duplicado na matriz');
  if (dup(ALL_ASSETS.map((a) => a.expectedSha256))) dupRuim.push('sha256 duplicado na matriz');
  add('10', 'Nenhum item duplicado (id · order · hash · chave · path)',
    acts.length === 3 && dupRuim.length === 0, dupRuim.join(', '));

  // [11] Resolução positiva dos três itens, cada um com a SUA fonte.
  const resRuim = [];
  if (contracts) {
    const R = contracts.resolver.resolveColoring60Lineart;
    const ST = contracts.resolver.COLORING60_RESOLUTION_STATUS;
    const vistos = new Set();
    for (const id of EXPECTED_ACTIVITY_IDS) {
      const r = R('creation', id);
      if (r.status !== ST.AVAILABLE) resRuim.push(`${id} → ${r.status} (esperado available)`);
      if (!r.activity || r.activity.activityId !== id) resRuim.push(`${id}: metadados ausentes/errados`);
      if (r.source == null) resRuim.push(`${id}: sem fonte`);
      if (r.source != null) {
        if (vistos.has(r.source)) resRuim.push(`${id}: fonte COLIDE com a de outra atividade`);
        vistos.add(r.source);
      }
      const esperado = contracts.sentinels.get(relByActivity.get(id));
      if (r.source !== esperado) resRuim.push(`${id}: fonte não é a do próprio path`);
    }
  }
  add('11', 'Resolução positiva das três atividades, cada uma com a SUA fonte',
    contracts != null && resRuim.length === 0, loadError || resRuim.join(', '));

  // [12] Resolução negativa de story inválida.
  const negStoryRuim = [];
  if (contracts) {
    const R = contracts.resolver.resolveColoring60Lineart;
    const ST = contracts.resolver.COLORING60_RESOLUTION_STATUS;
    for (const s of ['noah', 'xyz', '', 2, null, undefined]) {
      const r = R(s, 'light');
      if (!(r.status === ST.UNKNOWN && r.activity === null && r.source === null)) {
        negStoryRuim.push(`story=${JSON.stringify(s)} → ${r.status}`);
      }
    }
  }
  add('12', 'Resolução negativa de story inválida → unknown honesto',
    contracts != null && negStoryRuim.length === 0, loadError || negStoryRuim.join(', '));

  // [13] Resolução negativa de activity inválida (inclusive a identidade LEGADA por cena).
  const negActRuim = [];
  if (contracts) {
    const R = contracts.resolver.resolveColoring60Lineart;
    const ST = contracts.resolver.COLORING60_RESOLUTION_STATUS;
    for (const a of ['nope', 'scene_02', '2', 2, '', null, undefined]) {
      const r = R('creation', a);
      if (!(r.status === ST.UNKNOWN && r.activity === null && r.source === null)) {
        negActRuim.push(`activity=${JSON.stringify(a)} → ${r.status}`);
      }
    }
  }
  add('13', 'Resolução negativa de activity inválida (incl. "2" e "scene_02") → unknown',
    contracts != null && negActRuim.length === 0, loadError || negActRuim.join(', '));

  // [14] scene_02.png no blob aprovado.
  const light = LINEARTS[0];
  const scene02 = probes.find((p) => p.asset.rel === light.rel);
  add('14', 'scene_02.png é exatamente o blob aprovado (sha256 + bytes + dims)',
    scene02 != null && scene02.rec.integrityOk === true && scene02.rec.sha256 === light.expectedSha256,
    scene02 && scene02.rec.sha256 ? `sha=${scene02.rec.sha256} bytes=${scene02.rec.bytes}` : 'ausente');

  // [15] scene_02.png com CONSUMIDOR ÚNICO (reescrito no P3J — aposentadoria do Colorir legado).
  //      Antes: o arquivo era COMPARTILHADO entre o mapa legado (por CENA) e o registro do
  //      Colorir 60 (por ATIVIDADE), e o gate exigia exatamente 1 require de cada lado.
  //      Agora o mapa legado (`src/assets/coloringImages.js`) não existe mais e `scene_02.png` é o
  //      ÚNICO lineart de `creation/coloring/` que sobreviveu — logo a invariante ficou mais forte:
  //        (a) o mapa legado está AUSENTE (nenhum arquivo, nem vazio, nem symlink);
  //        (b) em TODO o `src/`, exatamente UM require resolve para scene_02.png;
  //        (c) esse require está no registro do Colorir 60 — nenhum outro módulo o alcança;
  //        (d) não existe gêmeo `activities/light.png`.
  //      Reintroduzir o mapa legado, ou fazer qualquer outro módulo requerer o arquivo, reprova.
  const requiresToInFile = (fileAbs, alvoAbs) => {
    const src = fs.readFileSync(fileAbs, 'utf8');
    const dir = path.dirname(fileAbs);
    const re = /require\(\s*'([^']+\.png)'\s*\)/g;
    let n = 0;
    let m;
    while ((m = re.exec(src)) !== null) {
      if (path.resolve(dir, m[1]) === alvoAbs) n++;
    }
    return n;
  };
  /** Varredura read-only de TODOS os .js de src/ — quem ainda alcança o arquivo alvo. */
  const findRequirersIn = (dirAbs, alvoAbs, out) => {
    for (const nome of fs.readdirSync(dirAbs).slice().sort()) {
      const filho = path.join(dirAbs, nome);
      const kind = inspectPathKind(filho);
      if (kind === PATH_KIND.DIRECTORY) findRequirersIn(filho, alvoAbs, out);
      else if (kind === PATH_KIND.REGULAR_FILE && nome.endsWith('.js')) {
        const n = requiresToInFile(filho, alvoAbs);
        if (n > 0) out.push({ rel: path.relative(REPO_ROOT, filho).split(path.sep).join('/'), n });
      }
    }
    return out;
  };
  const scene02Abs = abs(REL.SCENE_02);
  const consumidores = findRequirersIn(path.join(REPO_ROOT, 'src'), scene02Abs, []);
  const totalRequires = consumidores.reduce((acc, c) => acc + c.n, 0);
  const legadoAusente = isAbsent(abs(REL.LEGACY_COLORING_MAP));
  const soORegistro = consumidores.length === 1 && consumidores[0].rel === REL.REGISTRY && consumidores[0].n === 1;
  // Nenhum gêmeo: o arquivo aprovado não pode existir também sob outro nome dentro de activities/.
  const semClone = isAbsent(abs(REL.FORBIDDEN_LIGHT));
  add('15', 'scene_02.png com consumidor único (mapa legado ausente · só o registro Colorir 60 o requer)',
    legadoAusente && soORegistro && totalRequires === 1 && isRegularFile(scene02Abs) && semClone,
    `mapa legado=${legadoAusente ? 'ausente' : 'PRESENTE (proibido após o P3J)'} · requires em src/=${totalRequires} [${consumidores.map((c) => `${c.rel}×${c.n}`).join(', ') || 'nenhum'}] · activities/light.png=${semClone ? 'ausente' : 'PRESENTE (proibido)'}`);

  // [16] Nenhum asset fora da lista oficial: `activities/` e a raiz do Beni são conjuntos FECHADOS.
  const foraDaLista = [];
  const actDirKind = inspectPathKind(abs(REL.ACTIVITIES_DIR));
  if (actDirKind !== PATH_KIND.DIRECTORY) {
    foraDaLista.push(`activities/ não é diretório (${actDirKind})`);
  } else {
    const oficiais = new Set(LINEARTS.filter((l) => l.role === 'own_file').map((l) => path.basename(l.rel)));
    const encontrados = fs.readdirSync(abs(REL.ACTIVITIES_DIR)).slice().sort();
    for (const n of encontrados) if (!oficiais.has(n)) foraDaLista.push(`activities/${n} não autorizado`);
    for (const n of oficiais) if (!encontrados.includes(n)) foraDaLista.push(`activities/${n} ausente`);
  }
  const beniDirKind = inspectPathKind(abs(REL.BENI_DIR));
  if (beniDirKind !== PATH_KIND.DIRECTORY) {
    foraDaLista.push(`assets/mascot/beni não é diretório (${beniDirKind})`);
  } else {
    const autorizados = new Set(BENI_CANONICAL_PNGS.concat(POSES.map((p) => path.basename(p.rel))));
    const pngs = fs.readdirSync(abs(REL.BENI_DIR))
      .filter((n) => isRegularFile(path.join(abs(REL.BENI_DIR), n)) && n.toLowerCase().endsWith('.png'))
      .slice().sort();
    for (const n of pngs) if (!autorizados.has(n)) foraDaLista.push(`beni/${n} não autorizado`);
    for (const n of autorizados) if (!pngs.includes(n)) foraDaLista.push(`beni/${n} ausente`);
  }
  add('16', 'Nenhum asset fora da lista oficial (activities/ = 2 · raiz do Beni = 16)',
    foraDaLista.length === 0, foraDaLista.join(', '));

  return results;
}

// ---------- CLI ----------

function main() {
  const out = [];
  out.push('verify-coloring60-assets · gate de integridade do Colorir com o Beni (A Criação)');
  // Saída determinística: rótulo estável, SEM o caminho absoluto da worktree (que varia por
  // máquina). A raiz real segue derivada de __dirname internamente; não é impressa.
  out.push('repo=<repo>');
  out.push(`matriz: ${LINEARTS.length} linearts + ${POSES.length} poses = ${ALL_ASSETS.length} arquivos (fechada)`);

  let results;
  try {
    results = runAll();
  } catch (e) {
    out.push(`ERRO NÃO TRATADO: ${e && e.message ? e.message : e}`);
    process.stdout.write(`${out.join('\n')}\n`);
    process.exit(1);
    return;
  }

  let allPass = results.length === 16;
  if (results.length !== 16) out.push(`ERRO: esperadas 16 verificações, executadas ${results.length}.`);
  for (const r of results) {
    if (!r.pass) allPass = false;
    out.push(`[${r.pass ? 'OK' : 'DIVERGENTE'}] ${r.id} ${r.titulo}${r.pass || !r.detalhe ? '' : ` → ${r.detalhe}`}`);
  }
  // Reafirma explicitamente as contagens fechadas (defesa contra matriz adulterada).
  if (ALL_ASSETS.length !== 8) {
    allPass = false;
    out.push('ERRO: matriz não contém exatamente 8 arquivos.');
  }
  out.push(`RESULTADO: ${allPass ? 'VERDE' : 'VERMELHO'}`);
  process.stdout.write(`${out.join('\n')}\n`);
  process.exit(allPass ? 0 : 1);
}

// Executa como CLI SOMENTE quando rodado diretamente. Quando este arquivo é `require()`-ado
// (pelos testes do smoke), main() NÃO roda e NÃO chama process.exit — só os helpers são expostos.
if (require.main === module) {
  main();
}

// Helpers internos expostos para os testes carregarem o CÓDIGO REAL (sem cópia divergente).
module.exports = {
  PATH_KIND,
  classifyLstat,
  inspectPathKind,
  isAbsent,
  isRegularFile,
  inspectPng,
  scanPngChunks,
  measureAlpha,
  probe,
  probeBuffer,
  loadRealModule,
  loadColoring60Contracts,
  buildRegistryStub,
  runAll,
  LINEARTS,
  POSES,
  ALL_ASSETS,
  BENI_CANONICAL_PNGS,
  EXPECTED_ACTIVITY_IDS,
  LINEART_DIMS,
  POSE_DIMS,
  REL,
};
