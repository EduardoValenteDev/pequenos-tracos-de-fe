#!/usr/bin/env node
/**
 * validate-story-pack.js — Valida um PACK SANDBOX já gerado (Fase 2, F2.1b).
 *
 * Independente do build. Prova que o pack está íntegro E compatível com o runtime
 * F2.1a. NÃO baixa nada, NÃO cria R2, NÃO altera assets, NÃO importa Expo/RN.
 *
 * Verificações:
 *   1. manifest.json e pack.sha256 existem.
 *   2. manifest passa em packManifestService.validateManifest (o MESMO validador do
 *      runtime — carregado por avaliação isolada, sem importar Expo). Prova de
 *      compatibilidade com packIntegrityService.validatePackManifest (que delega a ele).
 *   3. id = story_<storyId>, version major = 1, metadata.storyId = storyId.
 *   4. Contagem: 1 cover + N scenes + N coloring + N audio (N = nº de cenas).
 *   5. Extensões: cover/scenes .webp, coloring .png, audio .mp3.
 *   6. Convenção de path == contentResolver (F2.1a):
 *        cover.webp · scenes/<id>_scene_NN.webp · coloring/scene_NN.png · audio/<id>_scene_NN.mp3
 *   7. Paths seguros (sem '/', sem '..'); nenhum arquivo vazio.
 *   8. bytes + sha256 de CADA arquivo conferem com o disco (crypto nativo).
 *   9. totalBytes == soma de files.bytes.
 *  10. pack.sha256 == sha256 do manifest.json (âncora de confiança).
 *
 * Uso:
 *   node scripts/assets-pipeline/validate-story-pack.js --story david_goliath --out C:/tmp/ptf_pack_sandbox
 *   node scripts/assets-pipeline/validate-story-pack.js --dir C:/tmp/ptf_pack_sandbox/packs/david_goliath/v1
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function parseArgs(argv) {
  const out = { story: 'david_goliath', out: null, version: '1.0.0', dir: null };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--story') out.story = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--version') out.version = argv[++i];
    else if (a === '--dir') out.dir = argv[++i];
  }
  if (!out.out) out.out = path.join(os.tmpdir(), 'ptf_pack_sandbox');
  return out;
}

// Carrega validateManifest do runtime SEM importar Expo: lê o fonte puro e avalia
// isolado (packManifestService não tem imports). Mesma técnica do smoke.
function loadRuntimeValidator() {
  const srcPath = path.join(REPO_ROOT, 'src', 'services', 'packManifestService.js');
  let code = fs.readFileSync(srcPath, 'utf8');
  code = code.replace(/export\s+function\s+/g, 'function ');
  code += '\n;return { validateManifest };';
  // eslint-disable-next-line no-new-func
  return new Function(code)();
}

const pad2 = (n) => String(n).padStart(2, '0');
function sha256File(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }

function validate() {
  const args = parseArgs(process.argv);
  const storyId = args.story;
  const major = args.version.split('.')[0];
  const packDir = args.dir
    ? path.resolve(args.dir)
    : path.join(path.resolve(args.out), 'packs', storyId, `v${major}`);

  const errors = [];
  const fail = (m) => errors.push(m);

  const manifestPath = path.join(packDir, 'manifest.json');
  const packShaPath = path.join(packDir, 'pack.sha256');
  if (!fs.existsSync(manifestPath)) fail('manifest.json ausente');
  if (!fs.existsSync(packShaPath)) fail('pack.sha256 ausente');
  if (errors.length) return finish(packDir, errors);

  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
  catch (e) { return finish(packDir, [`manifest.json inválido: ${e.message}`]); }

  // 2. Validador do runtime (prova de compatibilidade).
  let runtimeOk = false;
  try {
    const { validateManifest } = loadRuntimeValidator();
    const r = validateManifest(manifest, { appVersion: '1.0.0' });
    runtimeOk = r.ok;
    if (!r.ok) fail(`packManifestService.validateManifest REJEITOU: ${r.errors.join(' | ')}`);
  } catch (e) { fail(`falha ao carregar validador do runtime: ${e.message}`); }

  // 3. Identidade.
  if (manifest.id !== `story_${storyId}`) fail(`id esperado story_${storyId}, obtido ${manifest.id}`);
  if (String(manifest.version || '').split('.')[0] !== major) fail(`version major esperado ${major}`);
  if (!manifest.metadata || manifest.metadata.storyId !== storyId) fail(`metadata.storyId != ${storyId}`);

  // 4/5/6/7. Estrutura por kind.
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  const byKind = { cover: [], scene: [], coloring: [], audio: [], other: [] };
  files.forEach((f) => { (byKind[f.kind] || byKind.other).push(f); });

  const N = byKind.scene.length;
  if (byKind.cover.length !== 1) fail(`esperado 1 cover, obtido ${byKind.cover.length}`);
  if (N < 1) fail('nenhuma cena no manifesto');
  if (byKind.coloring.length !== N) fail(`coloring (${byKind.coloring.length}) != scenes (${N})`);
  if (byKind.audio.length !== N) fail(`audio (${byKind.audio.length}) != scenes (${N})`);
  if (byKind.other.length) fail(`kinds inesperados: ${byKind.other.length}`);

  // Convenção de path (contentResolver) + extensões + segurança + não-vazio + hash.
  const expectCover = 'cover.webp';
  const sceneRe = new RegExp(`^scenes/${storyId}_scene_(\\d{2})\\.webp$`);
  const coloringRe = /^coloring\/scene_(\d{2})\.png$/;
  const audioRe = new RegExp(`^audio/${storyId}_scene_(\\d{2})\\.mp3$`);

  let sum = 0;
  const seen = new Set();
  files.forEach((f) => {
    const p = f.path;
    if (typeof p !== 'string' || !p) { fail('file.path ausente'); return; }
    if (seen.has(p)) fail(`path duplicado: ${p}`);
    seen.add(p);
    if (p.startsWith('/')) fail(`path com '/': ${p}`);
    if (p.includes('..')) fail(`path com '..': ${p}`);

    if (f.kind === 'cover' && p !== expectCover) fail(`cover fora da convenção: ${p}`);
    if (f.kind === 'scene' && !sceneRe.test(p)) fail(`scene fora da convenção: ${p}`);
    if (f.kind === 'coloring' && !coloringRe.test(p)) fail(`coloring fora da convenção: ${p}`);
    if (f.kind === 'audio' && !audioRe.test(p)) fail(`audio fora da convenção: ${p}`);

    const abs = path.join(packDir, p);
    if (!fs.existsSync(abs)) { fail(`arquivo ausente no disco: ${p}`); return; }
    const size = fs.statSync(abs).size;
    if (size <= 0) fail(`arquivo vazio: ${p}`);
    if (typeof f.bytes === 'number' && size !== f.bytes) fail(`bytes divergentes ${p} (manifesto ${f.bytes}, disco ${size})`);
    if (sha256File(abs) !== f.sha256) fail(`sha256 divergente: ${p}`);
    if (typeof f.bytes === 'number') sum += f.bytes;
  });

  // 9. totalBytes.
  if (manifest.totalBytes !== sum) fail(`totalBytes (${manifest.totalBytes}) != soma (${sum})`);

  // 10. pack.sha256 == sha256(manifest.json).
  const manifestSha = crypto.createHash('sha256').update(fs.readFileSync(manifestPath)).digest('hex');
  const packShaLine = fs.readFileSync(packShaPath, 'utf8').trim();
  const declaredSha = packShaLine.split(/\s+/)[0];
  if (declaredSha !== manifestSha) fail(`pack.sha256 (${declaredSha}) != sha256(manifest.json) (${manifestSha})`);

  return finish(packDir, errors, { files: files.length, N, totalBytes: manifest.totalBytes, runtimeOk });
}

function finish(packDir, errors, info) {
  console.log('── validate-story-pack (F2.1b) ──');
  console.log(`pack: ${packDir}`);
  if (info) {
    console.log(`arquivos: ${info.files}  (cover:1, scenes:${info.N}, coloring:${info.N}, audio:${info.N})`);
    console.log(`totalBytes: ${info.totalBytes}  (${(info.totalBytes / 1048576).toFixed(2)} MB)`);
    console.log(`runtime validateManifest: ${info.runtimeOk ? 'ACEITO ✓' : 'REJEITADO ✗'}`);
  }
  if (errors.length === 0) {
    console.log('RESULTADO: VÁLIDO ✓ (integridade + convenção + compatibilidade com runtime)');
    process.exit(0);
  }
  console.log(`RESULTADO: INVÁLIDO ✗ (${errors.length} erro(s)):`);
  errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}

validate();
