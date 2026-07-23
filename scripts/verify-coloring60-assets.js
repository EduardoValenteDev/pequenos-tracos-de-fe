#!/usr/bin/env node
'use strict';

/**
 * verify-coloring60-assets.js — Gate determinístico e AUDITÁVEL de integridade dos assets
 * do piloto Colorir 60 de "A Criação" (tasks.md P5.T2 · plan.md §6.2/§7/§8 · spec 017 §15).
 *
 * O QUE ESTE GATE FAZ (e SÓ isto):
 *   - Prova, por leitura pura, que cada asset da matriz FECHADA de 3 atividades bate com o
 *     contrato ratificado (SHA-256 completo, magic bytes PNG, dimensões 1122×1402, modo de
 *     cor, tamanho em bytes). Para os 2 copiados, prova igualdade BYTE A BYTE fonte↔destino.
 *   - `light` é REUSO DIRETO de scene_02.png: não tem destino em `activities/`; o arquivo
 *     `activities/light.png` é PROIBIDO e sua presença é FALHA DURA.
 *
 * O QUE ESTE GATE NUNCA FAZ (invariante de segurança — regra 2/14):
 *   - NUNCA copia, move, renomeia, cria, apaga, trunca ou reescreve arquivo algum.
 *   - NUNCA reencoda, converte nem "conserta" (autofix) nenhum asset.
 *   - NUNCA aceita fallback: destino ausente NÃO é suprido pela fonte nem pelo reuso.
 *   - NUNCA usa dependência externa (Node puro: fs/path/crypto), NUNCA usa child_process.
 *   - NUNCA aceita caminho arbitrário do chamador: a matriz e a raiz do repo são fixas.
 *
 * MODOS:
 *   --mode=pre   Estado PRÉ-INTEGRAÇÃO (esperado ANTES das cópias P5.T4/P5.T6):
 *                fontes presentes e íntegras; destinos AUSENTES; `activities/light.png` ausente.
 *   --mode=post  Estado PÓS-INTEGRAÇÃO (esperado DEPOIS das cópias):
 *                destinos presentes e íntegros; byte a byte == fonte; `activities/light.png` ausente.
 *
 * SAÍDA determinística (mesma entrada → mesma saída; sem timestamp, sem ordem aleatória).
 * EXIT: 0 se o estado observado == estado esperado do modo; ≠ 0 em QUALQUER divergência
 * (inclui modo inválido/ausente). Este script é rodado VERDE em `--mode=pre` ANTES de qualquer
 * cópia; `--mode=post` só fica verde depois da integração autorizada dos 2 PNGs em P5.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Raiz do repositório resolvida a partir de __dirname (scripts/ vive na raiz), NUNCA de cwd.
const REPO_ROOT = path.resolve(__dirname, '..');

// Diretório externo (fora do repo) onde vivem as artes de produção aprovadas. Constante fixa:
// o gate não aceita este caminho por argumento do chamador.
const PRODUCTION_DIR = 'C:\\tmp\\ptf_colorir60_creation_production';

const EXPECTED_DIMS = Object.freeze({ width: 1122, height: 1402 });

// Assinatura PNG canônica (8 bytes): \x89 P N G \r \n \x1A \n.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Mapa tipo-de-cor PNG (byte 25 do IHDR) → rótulo legível.
const COLOR_TYPE_LABEL = Object.freeze({
  0: 'Grayscale',
  2: 'RGB',
  3: 'Palette',
  4: 'GrayscaleAlpha',
  6: 'RGBA',
});

// MATRIZ FECHADA — exatamente 3 assets. Contrato imutável (spec 017 §15 / plan §6.2).
const ASSETS = Object.freeze([
  Object.freeze({
    assetId: 'light',
    role: 'reuse', // reuso direto de scene_02.png — SEM destino em activities/
    reusePath: path.join(REPO_ROOT, 'assets', 'stories', 'creation', 'coloring', 'scene_02.png'),
    forbiddenPath: path.join(REPO_ROOT, 'assets', 'stories', 'creation', 'coloring', 'activities', 'light.png'),
    expectedSha256: 'c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1',
    expectedDims: EXPECTED_DIMS,
    expectedBitDepth: 8, // 8 bits por canal (contrato)
    expectedColorType: 2, // RGB
    expectedColorMode: 'RGB',
    expectedBytes: 861767,
  }),
  Object.freeze({
    assetId: 'living_world',
    role: 'external_copy', // cópia byte a byte da fonte externa para activities/
    sourcePath: path.join(PRODUCTION_DIR, 'living_world_approved.png'),
    destPath: path.join(REPO_ROOT, 'assets', 'stories', 'creation', 'coloring', 'activities', 'living_world.png'),
    expectedSha256: '818cd917c7493f4a3e04512a7120a6eaff5a03fdd16277b7d4fdfd1ee33b6ac5',
    expectedDims: EXPECTED_DIMS,
    expectedBitDepth: 8, // 8 bits por canal (contrato)
    expectedColorType: 2, // RGB
    expectedColorMode: 'RGB',
    expectedBytes: 973618,
  }),
  Object.freeze({
    assetId: 'people_and_care',
    role: 'external_copy',
    sourcePath: path.join(PRODUCTION_DIR, 'people_and_care_approved.png'),
    destPath: path.join(REPO_ROOT, 'assets', 'stories', 'creation', 'coloring', 'activities', 'people_and_care.png'),
    expectedSha256: '59988d9a58082a8173a328857fccb6a3716815660f4434c0df4491d6bf30d4e9',
    expectedDims: EXPECTED_DIMS,
    expectedBitDepth: 8, // 8 bits por canal (contrato)
    expectedColorType: 2, // RGB
    expectedColorMode: 'RGB',
    expectedBytes: 1195149,
  }),
]);

// ---------- leitura pura + perícia PNG (sem qualquer efeito colateral) ----------

// Estados possíveis de uma entrada de filesystem. AUSENTE significa que NENHUMA entrada
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
 * REGRAS: ENOENT ⇒ absent; qualquer outro erro ⇒ inspection_error; symlink SEMPRE symlink
 * (mesmo apontando para arquivo ou quebrado — usamos lstat, não seguimos o link).
 */
function classifyLstat(err, st) {
  if (err) return err.code === 'ENOENT' ? PATH_KIND.ABSENT : PATH_KIND.INSPECTION_ERROR;
  if (st.isSymbolicLink()) return PATH_KIND.SYMLINK;
  if (st.isFile()) return PATH_KIND.REGULAR_FILE;
  if (st.isDirectory()) return PATH_KIND.DIRECTORY;
  return PATH_KIND.OTHER;
}

/**
 * inspectPathKind(p) — inspeção read-only do TIPO da entrada em `p`, usando lstatSync
 * (NÃO segue symlinks). Retorna um dos PATH_KIND. Nunca lança, nunca escreve.
 */
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

function readBytes(p) {
  // Leitura pura; lança se ausente/erro — o chamador trata como divergência de existência.
  return fs.readFileSync(p);
}

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * inspectPng(buf) — perícia estrutural mínima e determinística de um PNG:
 * assinatura de 8 bytes + IHDR (largura/altura uint32BE, bit-depth, color-type).
 * Retorna { ok, reason?, width, height, bitDepth, colorType, colorMode }.
 * NUNCA conserta nem infere: bytes insuficientes / assinatura errada / IHDR ausente ⇒ ok:false.
 */
function inspectPng(buf) {
  if (buf.length < 33) return { ok: false, reason: 'arquivo curto demais para conter IHDR' };
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) return { ok: false, reason: 'assinatura PNG inválida' };
  // IHDR: comprimento(4)@8, tipo "IHDR"(4)@12, dados@16.
  // O comprimento declarado do IHDR é SEMPRE exatamente 13 num PNG válido — divergência é falha dura.
  if (buf.readUInt32BE(8) !== 13) return { ok: false, reason: 'IHDR com comprimento ≠ 13' };
  if (buf.subarray(12, 16).toString('ascii') !== 'IHDR') return { ok: false, reason: 'primeiro chunk não é IHDR' };
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  const colorMode = COLOR_TYPE_LABEL[colorType] || `desconhecido(${colorType})`;
  return { ok: true, width, height, bitDepth, colorType, colorMode };
}

/**
 * probe(p, expected) — perícia completa de UM arquivo contra o contrato do asset.
 * Read-only. Retorna um registro estruturado com todos os checks e um agregado `integrityOk`.
 */
function probe(p, expected) {
  const kind = inspectPathKind(p);
  const rec = { path: p, pathKind: kind, exists: kind !== PATH_KIND.ABSENT, isRegularFile: kind === PATH_KIND.REGULAR_FILE };
  // Só um ARQUIVO REGULAR pode ser lido e pericíado. Diretório, symlink, tipo exótico,
  // erro de inspeção ou ausência retornam cedo — integrityOk permanece ausente (falsy).
  if (kind !== PATH_KIND.REGULAR_FILE) {
    return rec;
  }
  let buf;
  try {
    buf = readBytes(p);
  } catch (e) {
    rec.readError = String(e && e.message ? e.message : e);
    return rec;
  }
  rec.bytes = buf.length;
  rec.sha256 = sha256Hex(buf);
  const png = inspectPng(buf);
  rec.png = png;

  rec.sizeOk = rec.bytes === expected.expectedBytes;
  rec.shaOk = rec.sha256 === expected.expectedSha256;
  rec.magicOk = png.ok;
  rec.dimsOk = png.ok && png.width === expected.expectedDims.width && png.height === expected.expectedDims.height;
  rec.bitDepthOk = png.ok && png.bitDepth === expected.expectedBitDepth;
  rec.colorTypeOk = png.ok && png.colorType === expected.expectedColorType;
  rec.colorModeOk = png.ok && png.colorMode === expected.expectedColorMode;
  // Integridade só é verdadeira se TODOS os atributos baterem. Sem fallback, sem tolerância.
  rec.integrityOk =
    rec.sizeOk === true &&
    rec.shaOk === true &&
    rec.magicOk === true &&
    rec.dimsOk === true &&
    rec.bitDepthOk === true &&
    rec.colorTypeOk === true &&
    rec.colorModeOk === true;
  return rec;
}

/**
 * bytesEqual(a, b) — comparação byte a byte estrita de dois ARQUIVOS REGULARES.
 * Se qualquer lado não for arquivo regular (ausente/diretório/symlink/erro), retorna false.
 */
function bytesEqual(pathA, pathB) {
  if (!isRegularFile(pathA) || !isRegularFile(pathB)) return false;
  const a = readBytes(pathA);
  const b = readBytes(pathB);
  return a.length === b.length && Buffer.compare(a, b) === 0;
}

// ---------- avaliação por asset, por modo ----------

// Rótulos estáveis por tipo de entrada — a saída distingue os estados sem colapsá-los.
const PATH_KIND_LABEL = Object.freeze({
  [PATH_KIND.ABSENT]: 'AUSENTE',
  [PATH_KIND.DIRECTORY]: 'DIRETÓRIO',
  [PATH_KIND.SYMLINK]: 'SYMLINK',
  [PATH_KIND.OTHER]: 'NÃO-É-ARQUIVO',
  [PATH_KIND.INSPECTION_ERROR]: 'ERRO-DE-INSPEÇÃO',
});

function fmtProbe(rec) {
  if (rec.pathKind !== PATH_KIND.REGULAR_FILE) return PATH_KIND_LABEL[rec.pathKind] || 'NÃO-É-ARQUIVO';
  if (rec.readError) return `ERRO-DE-LEITURA(${rec.readError})`;
  return [
    `bytes=${rec.bytes}`,
    `sha=${rec.sha256}`,
    `sig=${rec.magicOk ? 'ok' : 'X'}`,
    `dims=${rec.png.ok ? `${rec.png.width}x${rec.png.height}` : '?'}`,
    `bd=${rec.png.ok ? rec.png.bitDepth : '?'}`,
    `bdOk=${rec.bitDepthOk ? 'ok' : 'X'}`,
    `ct=${rec.png.ok ? rec.png.colorType : '?'}`,
    `mode=${rec.png.ok ? rec.png.colorMode : '?'}`,
    `integ=${rec.integrityOk ? 'ok' : 'X'}`,
  ].join(' ');
}

// fmtKind(p) — rótulo estável do TIPO de uma entrada (para os caminhos de ausência esperada).
function fmtKind(p) {
  const kind = inspectPathKind(p);
  return PATH_KIND_LABEL[kind] || (kind === PATH_KIND.REGULAR_FILE ? 'ARQUIVO' : 'NÃO-É-ARQUIVO');
}

/**
 * evaluateLight(mode) — regra do asset `light` (idêntica em pre e post):
 * reusePath presente e íntegro; forbiddenPath (activities/light.png) AUSENTE.
 */
function evaluateLight(asset) {
  const lines = [];
  const reuse = probe(asset.reusePath, asset);
  // O proibido só é aceitável se for EXATAMENTE ausente: diretório, symlink (mesmo quebrado),
  // tipo exótico ou erro de inspeção reprovam. Nada além de `absent` passa neste gate.
  const forbiddenKind = inspectPathKind(asset.forbiddenPath);
  const reuseOk = reuse.integrityOk === true; // exige regular_file íntegro (não symlink)
  const forbiddenOk = forbiddenKind === PATH_KIND.ABSENT;
  const pass = reuseOk && forbiddenOk;
  lines.push(`  reuse(scene_02.png): ${fmtProbe(reuse)}`);
  lines.push(`  activities/light.png: ${forbiddenOk ? 'AUSENTE (correto)' : `${PATH_KIND_LABEL[forbiddenKind] || 'PRESENTE'} (PROIBIDO!)`}`);
  return { assetId: asset.assetId, role: asset.role, pass, lines };
}

/**
 * evaluateExternalCopy(asset, mode) — regra de living_world / people_and_care.
 * PRE:  fonte presente e íntegra; destino AUSENTE (ainda não copiado).
 * POST: destino presente e íntegro; byte a byte == fonte.
 */
function evaluateExternalCopy(asset, mode) {
  const lines = [];
  // Fonte deve ser ARQUIVO REGULAR íntegro (probe já rejeita symlink/diretório).
  const source = probe(asset.sourcePath, asset);
  const destKind = inspectPathKind(asset.destPath);
  lines.push(`  fonte: ${fmtProbe(source)}`);

  if (mode === 'pre') {
    const sourceOk = source.integrityOk === true;
    // Destino em pre deve ser EXATAMENTE ausente: diretório/symlink/arquivo prematuro reprovam.
    const destAbsentOk = destKind === PATH_KIND.ABSENT;
    lines.push(`  destino: ${destAbsentOk ? 'AUSENTE (correto para pre)' : `${PATH_KIND_LABEL[destKind] || 'PRESENTE'} (indevido em pre!)`}`);
    return { assetId: asset.assetId, role: asset.role, pass: sourceOk && destAbsentOk, lines };
  }

  // mode === 'post' — destino deve ser ARQUIVO REGULAR íntegro E byte-idêntico à fonte.
  const dest = probe(asset.destPath, asset);
  lines.push(`  destino: ${fmtProbe(dest)}`);
  const destOk = dest.integrityOk === true; // exige regular_file (symlink/diretório reprovam)
  // Comparação byte a byte fonte↔destino — obrigatória, sem fallback; só entre arquivos regulares.
  const byteEqual =
    dest.isRegularFile && source.isRegularFile ? bytesEqual(asset.sourcePath, asset.destPath) : false;
  lines.push(`  byte-a-byte fonte==destino: ${byteEqual ? 'ok' : 'X'}`);
  return { assetId: asset.assetId, role: asset.role, pass: destOk && byteEqual, lines };
}

function evaluate(mode) {
  const results = [];
  for (const asset of ASSETS) {
    if (asset.role === 'reuse') {
      results.push(evaluateLight(asset));
    } else if (asset.role === 'external_copy') {
      results.push(evaluateExternalCopy(asset, mode));
    } else {
      // Papel desconhecido é um erro de contrato — falha dura, sem tolerância.
      results.push({ assetId: asset.assetId, role: asset.role, pass: false, lines: ['  papel desconhecido'] });
    }
  }
  return results;
}

// ---------- CLI ----------

function parseMode(argv) {
  const arg = argv.find((a) => a.startsWith('--mode='));
  if (!arg) return null;
  const value = arg.slice('--mode='.length);
  if (value !== 'pre' && value !== 'post') return null;
  return value;
}

function main() {
  const mode = parseMode(process.argv.slice(2));
  const out = [];
  out.push('verify-coloring60-assets · gate de integridade Colorir 60 (A Criação)');
  // Saída determinística: rótulo estável, SEM o caminho absoluto da worktree (que varia por
  // máquina/scratch). A raiz real segue derivada de __dirname internamente; não é impressa.
  out.push('repo=<repo>');

  if (mode === null) {
    out.push('ERRO: modo inválido ou ausente. Uso: --mode=pre | --mode=post');
    process.stdout.write(out.join('\n') + '\n');
    process.exit(2);
    return;
  }

  out.push(`mode=${mode}`);
  out.push(`matriz: ${ASSETS.length} assets (fechada)`);
  const results = evaluate(mode);
  let allPass = true;
  for (const r of results) {
    if (!r.pass) allPass = false;
    out.push(`[${r.pass ? 'OK' : 'DIVERGENTE'}] ${r.assetId} (${r.role})`);
    for (const l of r.lines) out.push(l);
  }
  // Reafirma explicitamente a contagem fechada (defesa contra matriz adulterada).
  if (ASSETS.length !== 3) {
    allPass = false;
    out.push('ERRO: matriz não contém exatamente 3 assets.');
  }
  out.push(`RESULTADO(${mode}): ${allPass ? 'VERDE' : 'VERMELHO'}`);
  process.stdout.write(out.join('\n') + '\n');
  process.exit(allPass ? 0 : 1);
}

// Executa como CLI SOMENTE quando rodado diretamente. Quando este arquivo é `require()`-ado
// (pelos testes do smoke), main() NÃO roda e NÃO chama process.exit — só os helpers são expostos.
if (require.main === module) {
  main();
}

// Helpers internos expostos para os testes carregarem o CÓDIGO REAL (sem cópia manual divergente).
module.exports = {
  PATH_KIND,
  classifyLstat,
  inspectPathKind,
  isAbsent,
  isRegularFile,
  inspectPng,
  probe,
  bytesEqual,
  ASSETS,
  EXPECTED_DIMS,
};
