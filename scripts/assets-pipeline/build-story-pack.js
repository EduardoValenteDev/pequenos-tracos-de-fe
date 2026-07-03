#!/usr/bin/env node
/**
 * build-story-pack.js — Gera um PACK SANDBOX de uma história (Fase 2, F2.1b).
 *
 * Prova, FORA do repositório, a estrutura de pack que o runtime híbrido (F2.1a) irá
 * consumir: manifest.json + pack.sha256 + cover/scenes/coloring/audio, com bytes e
 * sha256 por arquivo. NÃO baixa nada, NÃO cria R2, NÃO toca telas, NÃO altera os
 * assets de origem (apenas LÊ e COPIA), NÃO apaga nada.
 *
 * Segurança: RECUSA gravar dentro do repositório (evita commit acidental de pack).
 *
 * Uso:
 *   node scripts/assets-pipeline/build-story-pack.js --story david_goliath --out C:/tmp/ptf_pack_sandbox
 *   (--version 1.0.0 opcional; padrão 1.0.0. --out padrão: <tmp>/ptf_pack_sandbox)
 *
 * Layout gerado (staging/R2): <out>/packs/<storyId>/v<major>/
 *   manifest.json  pack.sha256  cover.webp
 *   scenes/<storyId>_scene_NN.webp   coloring/scene_NN.png   audio/<storyId>_scene_NN.mp3
 *
 * Caminhos relativos dentro do pack seguem EXATAMENTE o contentResolver (F2.1a):
 *   cover.webp · scenes/<id>_scene_NN.webp · coloring/scene_NN.png · audio/<id>_scene_NN.mp3
 *
 * Sem dependência nova: sha256 = crypto nativo do Node; dimensões = sharp SE já instalado
 * (fallback null se ausente). 100% JavaScript/CommonJS; não importa Expo/React Native.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// sharp é OPCIONAL: usado só para width/height/ratio das imagens. Ausente → null.
let sharp = null;
try {
  // eslint-disable-next-line global-require
  sharp = require('sharp');
} catch (_e) {
  sharp = null;
}

// ── args ────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const out = { story: 'david_goliath', out: null, version: '1.0.0' };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--story') out.story = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--version') out.version = argv[++i];
  }
  if (!out.out) out.out = path.join(os.tmpdir(), 'ptf_pack_sandbox');
  return out;
}

// ── segurança: nunca gravar dentro do repo ────────────────────────────────────
function assertOutsideRepo(outputDir) {
  const resolved = path.resolve(outputDir);
  const root = path.resolve(REPO_ROOT);
  if (resolved === root || resolved.startsWith(root + path.sep)) {
    throw new Error(
      `RECUSADO: outputDir dentro do repositório (${resolved}). ` +
      'Use um diretório fora do repo (ex.: C:/tmp/ptf_pack_sandbox) para evitar commit acidental.'
    );
  }
}

// ── fontes de asset por storyId (padrões reais do app, verificados em F2.1b) ──
function sourcePaths(storyId) {
  return {
    cover: path.join(REPO_ROOT, 'assets', 'images', `${storyId}_cover.webp`),
    scenesDir: path.join(REPO_ROOT, 'assets', 'stories', storyId, 'scenes'),
    coloringDir: path.join(REPO_ROOT, 'assets', 'stories', storyId, 'coloring'),
    audioDir: path.join(REPO_ROOT, 'assets', 'audio', storyId),
  };
}

// Título oficial: lido de src/data/stories.js (fonte de verdade), sem importar o módulo.
function readStoryTitle(storyId) {
  try {
    const txt = fs.readFileSync(path.join(REPO_ROOT, 'src', 'data', 'stories.js'), 'utf8');
    const idx = txt.indexOf(`id: '${storyId}'`);
    if (idx === -1) return storyId;
    const m = txt.slice(idx).match(/titulo:\s*'([^']+)'/);
    return (m && m[1]) || storyId;
  } catch (_e) {
    return storyId;
  }
}

const pad2 = (n) => String(n).padStart(2, '0');

function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function ratioOf(w, h) {
  if (!w || !h) return null;
  const r = w / h;
  if (Math.abs(r - 4 / 5) < 0.02) return '4:5';
  if (Math.abs(r - 1) < 0.02) return '1:1';
  if (Math.abs(r - 16 / 9) < 0.02) return '16:9';
  return `${w}:${h}`;
}

async function imageDims(p) {
  if (!sharp) return { width: null, height: null, ratio: null };
  try {
    const m = await sharp(p).metadata();
    return { width: m.width || null, height: m.height || null, ratio: ratioOf(m.width, m.height) };
  } catch (_e) {
    return { width: null, height: null, ratio: null };
  }
}

// Descobre as cenas reais: assets/stories/<id>/scenes/<id>_scene_NN.webp
function discoverSceneNumbers(scenesDir, storyId) {
  if (!fs.existsSync(scenesDir)) return [];
  const re = new RegExp(`^${storyId}_scene_(\\d+)\\.webp$`);
  return fs.readdirSync(scenesDir)
    .map((f) => { const m = f.match(re); return m ? parseInt(m[1], 10) : null; })
    .filter((n) => n != null)
    .sort((a, b) => a - b);
}

function copyInto(src, destAbs) {
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  fs.copyFileSync(src, destAbs); // copia (não move): origem intacta
}

// ── build ─────────────────────────────────────────────────────────────────────
async function build() {
  const args = parseArgs(process.argv);
  const storyId = args.story;
  const version = args.version;
  const major = version.split('.')[0];

  assertOutsideRepo(args.out);

  const packDir = path.join(path.resolve(args.out), 'packs', storyId, `v${major}`);
  const src = sourcePaths(storyId);

  // Plano de arquivos (ordem determinística: cover, scenes, coloring, audio).
  const plan = [];
  plan.push({ kind: 'cover', src: src.cover, rel: 'cover.webp' });

  const sceneNums = discoverSceneNumbers(src.scenesDir, storyId);
  if (sceneNums.length === 0) throw new Error(`Nenhuma cena encontrada em ${src.scenesDir}`);
  sceneNums.forEach((n) => {
    plan.push({ kind: 'scene', src: path.join(src.scenesDir, `${storyId}_scene_${pad2(n)}.webp`), rel: `scenes/${storyId}_scene_${pad2(n)}.webp` });
  });
  sceneNums.forEach((n) => {
    plan.push({ kind: 'coloring', src: path.join(src.coloringDir, `scene_${pad2(n)}.png`), rel: `coloring/scene_${pad2(n)}.png` });
  });
  sceneNums.forEach((n) => {
    plan.push({ kind: 'audio', src: path.join(src.audioDir, `${storyId}_scene_${pad2(n)}.mp3`), rel: `audio/${storyId}_scene_${pad2(n)}.mp3` });
  });

  // Confere existência ANTES de gravar qualquer coisa (falha limpa).
  const missing = plan.filter((f) => !fs.existsSync(f.src)).map((f) => f.src);
  if (missing.length) throw new Error(`Assets de origem ausentes:\n  ${missing.join('\n  ')}`);

  // Recria só o diretório do pack (nunca toca fora dele).
  fs.mkdirSync(packDir, { recursive: true });

  const files = [];
  let totalBytes = 0;
  for (const f of plan) {
    const destAbs = path.join(packDir, f.rel);
    copyInto(f.src, destAbs);
    const bytes = fs.statSync(destAbs).size;
    const sha256 = sha256File(destAbs);
    let dims = { width: null, height: null, ratio: null };
    if (f.kind === 'cover' || f.kind === 'scene' || f.kind === 'coloring') dims = await imageDims(destAbs);
    if (bytes <= 0) throw new Error(`Arquivo vazio: ${f.rel}`);
    totalBytes += bytes;
    files.push({ path: f.rel.replace(/\\/g, '/'), bytes, sha256, kind: f.kind, width: dims.width, height: dims.height, ratio: dims.ratio });
  }

  const manifest = {
    schemaVersion: 1,
    id: `story_${storyId}`,
    version,
    type: 'story',
    minAppVersion: '1.0.0',
    totalBytes,
    files,
    metadata: {
      title: readStoryTitle(storyId),
      storyId,
      language: 'pt-BR',
      coverPath: 'cover.webp',
      // createdAt vive em metadata (schema permite additionalProperties em metadata);
      // NÃO no topo (schema congelado tem additionalProperties:false no nível raiz).
      createdAt: new Date().toISOString(),
      generator: 'build-story-pack.js F2.1b (sandbox — não é asset final de loja)',
    },
  };

  const manifestPath = path.join(packDir, 'manifest.json');
  const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
  fs.writeFileSync(manifestPath, manifestJson, 'utf8');

  // pack.sha256 = âncora de confiança: sha256 do manifest.json (formato sha256sum).
  const manifestSha = crypto.createHash('sha256').update(fs.readFileSync(manifestPath)).digest('hex');
  fs.writeFileSync(path.join(packDir, 'pack.sha256'), `${manifestSha}  manifest.json\n`, 'utf8');

  // Self-check imediato: re-hash de cada arquivo == manifesto.
  const selfErrors = [];
  for (const fe of files) {
    const abs = path.join(packDir, fe.path);
    if (!fs.existsSync(abs)) { selfErrors.push(`${fe.path}: ausente após cópia`); continue; }
    if (fs.statSync(abs).size !== fe.bytes) selfErrors.push(`${fe.path}: bytes divergentes`);
    if (sha256File(abs) !== fe.sha256) selfErrors.push(`${fe.path}: sha256 divergente`);
  }

  // Resumo.
  const kinds = files.reduce((acc, f) => { acc[f.kind] = (acc[f.kind] || 0) + 1; return acc; }, {});
  console.log('── build-story-pack (F2.1b sandbox) ──');
  console.log(`história:   ${storyId} — "${manifest.metadata.title}"`);
  console.log(`pack id:    ${manifest.id} @ ${version}`);
  console.log(`destino:    ${packDir}`);
  console.log(`sharp:      ${sharp ? 'disponível (width/height/ratio)' : 'ausente (dimensões null)'}`);
  console.log(`arquivos:   ${files.length}  (${Object.entries(kinds).map(([k, v]) => `${k}:${v}`).join(', ')})`);
  console.log(`totalBytes: ${totalBytes}  (${(totalBytes / 1048576).toFixed(2)} MB)`);
  console.log(`manifest:   ${manifestPath}`);
  console.log(`pack.sha256:${manifestSha}`);
  console.log(`self-check: ${selfErrors.length === 0 ? 'OK (bytes+sha256 conferem)' : `FALHOU\n  ${selfErrors.join('\n  ')}`}`);

  if (selfErrors.length) process.exit(1);
  return { packDir, manifest, manifestPath, totalBytes };
}

build().catch((e) => { console.error(`ERRO: ${e.message}`); process.exit(1); });
