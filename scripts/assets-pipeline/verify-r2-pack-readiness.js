#!/usr/bin/env node
/**
 * verify-r2-pack-readiness.js — Bloco 2 · Fase 2B.5 (R2 pack readiness gate).
 *
 * PROVA, de forma READ-ONLY, que os 18 packs premium (camada `remote`) estão completos,
 * publicados e íntegros no R2 — os níveis:
 *   N1  presente e válido no MANIFESTO VIVO (content-manifest.json) + campos por pack
 *   N2  manifest.json POR-PACK íntegro: âncora sha256 + validador de runtime + contagem
 *       (1 cover + N scene + N coloring + N audio) + N == nº de cenas do app
 *   N3  ARQUIVOS baixáveis, bytes e sha256 por arquivo conferindo (via validate-story-pack)
 *   N4  prova em DEVICE (declarada aqui; confirmada no relatório após teste no iPhone)
 *
 * COMPOSIÇÃO: reusa os validadores do runtime (globalManifestService / packManifestService)
 * carregados de forma ISOLADA (sem importar Expo/RN) e a ferramenta validate-story-pack.js.
 *
 * REGRAS (Fase 2B.5): NÃO altera runtime; NÃO escreve em src/ nem assets/; NÃO toca o R2
 * (só HTTP GET); SEM dependência nova; compatível com Node 20 (usa node:https, não `fetch`).
 * Baixa arquivos APENAS para um diretório TEMPORÁRIO fora do repo (os.tmpdir()).
 *
 * Uso:
 *   node scripts/assets-pipeline/verify-r2-pack-readiness.js \
 *     [--manifest-url <url>] [--app-version 1.0.0] [--stories a,b] [--out <dir>] [--json] [--keep]
 * Exit: 0 se todos (do escopo) atingirem N3; 1 caso contrário.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const https = require('https');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATE_TOOL = path.join(REPO_ROOT, 'scripts', 'assets-pipeline', 'validate-story-pack.js');

// Os 18 esperados (SANITY SET). A verdade vem de getStoriesByLayer('remote'); se divergir, aborta.
const EXPECTED_18 = [
  'david_goliath', 'jesus_children', 'daniel_lions', 'jonah_big_fish', 'lost_sheep',
  'good_samaritan', 'abraham_stars', 'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi',
  'esther_queen', 'miraculous_catch', 'samuel_hears_god', 'josiah_young_king', 'solomon_wisdom',
  'mary_says_yes', 'timothy_faith', 'jesus_temple',
];

// Cobertura de device N4 acordada no Portão 2 (referência + as 3 desta fase; resto = lote).
const N4_MAP = {
  david_goliath: 'done',            // referência já validada na 2B
  moses_red_sea: 'to-validate',
  jesus_children: 'to-validate',
  mary_says_yes: 'to-validate',
};

const REQUIRED_KINDS = ['cover', 'scene', 'coloring', 'audio'];

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const out = { manifestUrl: null, appVersion: '1.0.0', stories: null, out: null, json: false, keep: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--manifest-url') out.manifestUrl = argv[++i];
    else if (a === '--app-version') out.appVersion = argv[++i];
    else if (a === '--stories') out.stories = String(argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--json') out.json = true;
    else if (a === '--keep') out.keep = true;
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Guard de escrita: NUNCA dentro de src/ ou assets/ (defesa em profundidade).
// ─────────────────────────────────────────────────────────────────────────────
function assertSafeWrite(p) {
  const abs = path.resolve(p);
  const forbidden = [path.join(REPO_ROOT, 'src'), path.join(REPO_ROOT, 'assets')];
  for (const dir of forbidden) {
    if (abs === dir || abs.startsWith(dir + path.sep)) {
      throw new Error(`GUARD: escrita proibida em ${abs} (dentro de ${path.basename(dir)}/)`);
    }
  }
  return abs;
}

// ─────────────────────────────────────────────────────────────────────────────
// loadIsolated: carrega um módulo src/ SEM importar Expo (strip de import/export,
// injeção de dependências por nome). Mesma técnica de validate-story-pack.js / smoke.js.
// ─────────────────────────────────────────────────────────────────────────────
function loadIsolated(relPath, wanted, injected = {}) {
  const srcPath = path.join(REPO_ROOT, relPath);
  let code = fs.readFileSync(srcPath, 'utf8');
  code = code.replace(/^[ \t]*import\s[^\n]*?;[ \t]*$/gm, ''); // remove imports single-line
  code = code.replace(/^[ \t]*export\s+/gm, '');               // export const/function → decl local
  code += `\n;return { ${wanted.join(', ')} };`;
  const names = Object.keys(injected);
  // eslint-disable-next-line no-new-func
  const fn = new Function(...names, code);
  return fn(...names.map((n) => injected[n]));
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP GET (node:https) com redirect + timeout — buffer. Nunca lança.
// ─────────────────────────────────────────────────────────────────────────────
function httpGet(url, opts = {}) {
  const redirects = typeof opts.redirects === 'number' ? opts.redirects : 5;
  const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 20000;
  return new Promise((resolve) => {
    let req;
    try { req = https.get(url, (res) => onRes(res)); }
    catch (e) { resolve({ ok: false, status: 0, error: String((e && e.message) || e) }); return; }

    function onRes(res) {
      const status = res.statusCode;
      if ([301, 302, 303, 307, 308].includes(status) && res.headers.location && redirects > 0) {
        res.resume();
        let next;
        try { next = new URL(res.headers.location, url).toString(); }
        catch (e) { resolve({ ok: false, status, error: `redirect inválido: ${res.headers.location}` }); return; }
        resolve(httpGet(next, { redirects: redirects - 1, timeoutMs }));
        return;
      }
      if (status !== 200) { res.resume(); resolve({ ok: false, status, error: `HTTP ${status}` }); return; }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ ok: true, status, buffer: Buffer.concat(chunks) }));
      res.on('error', (e) => resolve({ ok: false, status, error: String((e && e.message) || e) }));
    }
    req.setTimeout(timeoutMs, () => { try { req.destroy(new Error('timeout')); } catch (_) { /* noop */ } });
    req.on('error', (e) => resolve({ ok: false, status: 0, error: String((e && e.message) || e) }));
  });
}

async function httpGetToFile(url, dest) {
  const r = await httpGet(url);
  if (!r.ok) return r;
  const abs = assertSafeWrite(dest);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, r.buffer);
  return { ok: true, status: 200, bytes: r.buffer.length };
}

const sha256Buf = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const pad2 = (n) => String(n).padStart(2, '0');
const SHA256_RE = /^[a-f0-9]{64}$/;

// ─────────────────────────────────────────────────────────────────────────────
// Verificação de UM pack. Retorna a linha da tabela { storyId, n1, n2, n3, n4, notes }.
// ─────────────────────────────────────────────────────────────────────────────
async function verifyPack(storyId, ctx) {
  const row = { storyId, n1: false, n2: false, n3: false, n4: N4_MAP[storyId] || 'batch-plan', notes: [], bytes: null };
  const { validData, rawData, appVersion, tmpRoot, cenasById, validateManifest } = ctx;

  // ── N1: presente e válido no manifesto vivo + campos por pack ──
  const validPack = (validData && validData.packs || []).find((p) => p && p.storyId === storyId) || null;
  const rawPack = (rawData && rawData.packs || []).find((p) => p && p.storyId === storyId) || null;
  if (!validPack) {
    if (rawPack) row.notes.push('N1: excluído do índice vivo por defeito (ver warnings do manifesto)');
    else row.notes.push('N1: ausente no manifesto vivo');
    return row;
  }
  const pack = validPack;
  row.bytes = typeof pack.bytes === 'number' ? pack.bytes : null;
  const n1Problems = [];
  if (pack.access !== 'premium') n1Problems.push(`access=${pack.access} (esperado premium)`);
  const kinds = Array.isArray(pack.mediaKinds) ? pack.mediaKinds : [];
  const missingKinds = REQUIRED_KINDS.filter((k) => !kinds.includes(k));
  if (missingKinds.length) n1Problems.push(`mediaKinds faltando: ${missingKinds.join(',')}`);
  if (!(typeof pack.manifestSha256 === 'string' && SHA256_RE.test(pack.manifestSha256))) {
    n1Problems.push('manifestSha256 ausente/ inválido no índice (necessário p/ âncora N2)');
  }
  if (n1Problems.length) { row.notes.push('N1: ' + n1Problems.join('; ')); return row; }
  row.n1 = true;

  // ── N2: manifest.json por-pack íntegro (âncora + validador + contagem + N==cenas) ──
  const base = pack.baseUrl; // já validado https + '/' pelo schema do runtime
  const manUrl = base + (pack.manifestPath || 'manifest.json');
  const manRes = await httpGet(manUrl);
  if (!manRes.ok) { row.notes.push(`N2: manifest.json inacessível (${manRes.error || manRes.status})`); return row; }
  const anchor = sha256Buf(manRes.buffer);
  if (anchor !== pack.manifestSha256) {
    row.notes.push(`N2: âncora divergente (índice ${pack.manifestSha256.slice(0, 12)}… ≠ arquivo ${anchor.slice(0, 12)}…)`);
    return row;
  }
  let man;
  try { man = JSON.parse(manRes.buffer.toString('utf8')); }
  catch (e) { row.notes.push('N2: manifest.json por-pack inválido (JSON)'); return row; }

  const vr = validateManifest(man, { appVersion });
  if (!vr.ok) { row.notes.push(`N2: manifest reprovado no validador de runtime (${(vr.errors || []).slice(0, 2).join(' | ')})`); return row; }

  const files = Array.isArray(man.files) ? man.files : [];
  const byKind = { cover: 0, scene: 0, coloring: 0, audio: 0 };
  files.forEach((f) => { if (byKind[f.kind] != null) byKind[f.kind] += 1; });
  const N = byKind.scene;
  const nApp = cenasById[storyId];
  const countProblems = [];
  if (byKind.cover !== 1) countProblems.push(`cover=${byKind.cover} (esperado 1)`);
  if (N < 1) countProblems.push('nenhuma cena');
  if (byKind.coloring !== N) countProblems.push(`coloring=${byKind.coloring} ≠ scene=${N}`);
  if (byKind.audio !== N) countProblems.push(`audio=${byKind.audio} ≠ scene=${N}`);
  if (typeof nApp === 'number' && N !== nApp) countProblems.push(`N do pack=${N} ≠ cenas do app=${nApp}`);
  if (countProblems.length) { row.notes.push('N2: ' + countProblems.join('; ')); return row; }

  // Salva o manifest.json no temp + a âncora pack.sha256, p/ o validate-story-pack.
  const major = String(pack.version || '1.0.0').split('.')[0];
  const packDir = path.join(tmpRoot, 'packs', storyId, `v${major}`);
  fs.mkdirSync(assertSafeWrite(packDir), { recursive: true });
  fs.writeFileSync(assertSafeWrite(path.join(packDir, 'manifest.json')), manRes.buffer);
  fs.writeFileSync(assertSafeWrite(path.join(packDir, 'pack.sha256')), `${pack.manifestSha256}  manifest.json\n`);
  row.n2 = true;

  // ── N3: baixar arquivos + validate-story-pack (bytes + sha256 por arquivo) ──
  let dlError = null;
  for (const f of files) {
    if (typeof f.path !== 'string' || !f.path || f.path.includes('..') || f.path.startsWith('/')) { dlError = `path inseguro: ${f.path}`; break; }
    const r = await httpGetToFile(base + f.path, path.join(packDir, f.path));
    if (!r.ok) { dlError = `download ${f.path} (${r.error || r.status})`; break; }
  }
  if (dlError) { row.notes.push(`N3: ${dlError}`); return row; }

  const proc = spawnSync('node', [VALIDATE_TOOL, '--story', storyId, '--version', String(pack.version || '1.0.0'), '--dir', packDir], { encoding: 'utf8' });
  if (proc.status === 0) {
    row.n3 = true;
  } else {
    const outTxt = `${proc.stdout || ''}${proc.stderr || ''}`.trim().split('\n').filter((l) => /-\s|INVÁLIDO|erro/i.test(l)).slice(-4).join(' | ');
    row.notes.push(`N3: validate-story-pack reprovou (${outTxt || `exit ${proc.status}`})`);
  }
  return row;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabela + resumo (stdout).
// ─────────────────────────────────────────────────────────────────────────────
const mark = (b) => (b ? '✓' : '·');
function printTable(rows) {
  const idW = Math.max(...rows.map((r) => r.storyId.length), 8);
  console.log(`\n${'storyId'.padEnd(idW)}  N1 N2 N3  N4           notas`);
  console.log('─'.repeat(idW + 40));
  rows.forEach((r) => {
    const line = `${r.storyId.padEnd(idW)}  ${mark(r.n1)}  ${mark(r.n2)}  ${mark(r.n3)}   ${String(r.n4).padEnd(11)}  ${r.notes.join(' | ')}`;
    console.log(line);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('Uso: node scripts/assets-pipeline/verify-r2-pack-readiness.js [--manifest-url <url>] [--app-version 1.0.0] [--stories a,b] [--out <dir>] [--json] [--keep]');
    process.exit(0);
  }

  // 1) Descoberta dos 18 (fonte única).
  const cm = loadIsolated('src/data/contentManifest.js', ['getStoriesByLayer', 'STORY_CONTENT_LAYER', 'CONTENT_LAYERS']);
  const remote = cm.getStoriesByLayer('remote');
  const sanityOk = remote.length === EXPECTED_18.length && EXPECTED_18.every((id) => remote.includes(id));
  if (!sanityOk) {
    console.error(`ABORT: a camada 'remote' mudou (${remote.length} histórias). Esperado 18. Atualize a Fase 2B.5.`);
    console.error('remote atual:', remote.join(', '));
    process.exit(2);
  }
  const targetIds = args.stories && args.stories.length ? remote.filter((id) => args.stories.includes(id)) : remote;

  // Fonte do nº de cenas do app (cross-check N).
  const st = loadIsolated('src/data/stories.js', ['stories']);
  const cenasById = {};
  st.stories.forEach((s) => { if (s && s.id) cenasById[s.id] = Array.isArray(s.cenas) ? s.cenas.length : (s.totalCenas || 0); });

  // Validadores do runtime (isolados, sem Expo).
  const gms = loadIsolated(
    'src/services/globalManifestService.js',
    ['validateGlobalContentManifest', 'getPackFromGlobalManifest'],
    { STORY_CONTENT_LAYER: cm.STORY_CONTENT_LAYER, warn: () => {}, __DEV__: false },
  );
  const pms = loadIsolated('src/services/packManifestService.js', ['validateManifest']);

  // 2) Manifesto vivo.
  const url = args.manifestUrl || process.env.EXPO_PUBLIC_GLOBAL_MANIFEST_URL;
  if (!url) { console.error('ABORT: informe --manifest-url ou defina EXPO_PUBLIC_GLOBAL_MANIFEST_URL.'); process.exit(2); }
  console.log(`Manifesto vivo: ${url}`);
  const idxRes = await httpGet(url);
  if (!idxRes.ok) { console.error(`ABORT: falha ao buscar o manifesto vivo (${idxRes.error || idxRes.status}).`); process.exit(2); }
  let rawManifest;
  try { rawManifest = JSON.parse(idxRes.buffer.toString('utf8')); }
  catch (e) { console.error('ABORT: content-manifest.json inválido (JSON).'); process.exit(2); }

  const gRes = gms.validateGlobalContentManifest(rawManifest, { appVersion: args.appVersion, allowHttp: false });
  console.log(`Índice: manifestVersion=${rawManifest.manifestVersion} · packs=${Array.isArray(rawManifest.packs) ? rawManifest.packs.length : '—'} · válido=${gRes.ok} · warnings=${gRes.warnings.length}`);
  if (gRes.errors.length) gRes.errors.forEach((e) => console.log(`  índice.erro: ${e}`));
  if (gRes.warnings.length) gRes.warnings.forEach((w) => console.log(`  índice.warning: ${w}`));

  // Temp fora do repo (limpo antes e depois, salvo --keep).
  const tmpRoot = assertSafeWrite(args.out || path.join(os.tmpdir(), 'ptf_r2_readiness'));
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  fs.mkdirSync(tmpRoot, { recursive: true });

  // 3-6) Por pack.
  const ctx = {
    validData: gRes.data, rawData: rawManifest, appVersion: args.appVersion,
    tmpRoot, cenasById, validateManifest: pms.validateManifest,
  };
  const rows = [];
  for (const storyId of targetIds) {
    process.stdout.write(`\n· ${storyId} … `);
    /* eslint-disable no-await-in-loop */
    const row = await verifyPack(storyId, ctx);
    /* eslint-enable no-await-in-loop */
    process.stdout.write(`N1${mark(row.n1)} N2${mark(row.n2)} N3${mark(row.n3)}`);
    rows.push(row);
  }

  // 7) Tabela + veredito.
  printTable(rows);
  const n3Count = rows.filter((r) => r.n3).length;
  const allN3 = rows.every((r) => r.n3);
  console.log(`\nResumo: ${n3Count}/${rows.length} em N3 verde.`);

  const failing = rows.filter((r) => !r.n3);
  const verdict = allN3
    ? 'APTA-A-DISCUTIR: os packs do escopo atingiram N3. (2C só após N4 acordada documentada + os 18.)'
    : 'BLOQUEADA: há pack(s) abaixo de N3 → a 2C permanece bloqueada.';
  console.log(`Veredito 2C: ${verdict}`);
  if (failing.length) {
    console.log('Não prontos (storyId · nível travado · motivo):');
    failing.forEach((r) => {
      const level = r.n2 ? 'N2→N3' : r.n1 ? 'N1→N2' : 'N0→N1';
      console.log(`  - ${r.storyId} · ${level} · ${r.notes.join(' | ') || 'sem detalhe'}`);
    });
  }

  if (args.json) console.log('\nJSON:\n' + JSON.stringify({ url, valid: gRes.ok, warnings: gRes.warnings, rows, n3Count, total: rows.length, verdict }, null, 2));

  if (!args.keep) fs.rmSync(tmpRoot, { recursive: true, force: true });
  else console.log(`\n(temp mantido em ${tmpRoot})`);

  process.exit(allN3 ? 0 : 1);
}

main().catch((e) => { console.error('ERRO inesperado:', e && e.stack ? e.stack : e); process.exit(3); });
