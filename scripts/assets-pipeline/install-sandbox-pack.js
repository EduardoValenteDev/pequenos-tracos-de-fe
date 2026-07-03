#!/usr/bin/env node
/**
 * install-sandbox-pack.js — Instala um pack sandbox num "runtime" LOCAL (Fase 2, F2.1c).
 *
 * Simula, FORA do repo e FORA do app, o fluxo oficial (doc §5–7):
 *   copiar → .tmp → validar (manifest + pack.sha256 + bytes/sha256) → mover atômico
 *   → registrar `ready` num índice JSON sandbox.
 *
 * NÃO grava AsyncStorage real, NÃO escreve @ptf_packs_v1 no app, NÃO toca o
 * documentDirectory real, NÃO baixa da rede, NÃO cria R2, NÃO importa Expo/RN.
 * Pack corrompido NUNCA vira `ready` (não move e não registra).
 *
 * Uso:
 *   node scripts/assets-pipeline/install-sandbox-pack.js \
 *     --storyId david_goliath \
 *     --sourcePackDir C:/tmp/ptf_pack_sandbox/packs/david_goliath/v1 \
 *     --runtimeDir C:/tmp/ptf_pack_runtime --version 1.0.0
 *
 * Resultado (fora do repo):
 *   <runtimeDir>/packs/<storyId>@<version>/   (pack instalado)
 *   <runtimeDir>/pack-index.json              (índice sandbox: storyId → CacheEntry ready)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { pathToFileURL } = require('url');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function parseArgs(argv) {
  const out = { storyId: 'david_goliath', sourcePackDir: null, runtimeDir: null, version: '1.0.0' };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--storyId') out.storyId = argv[++i];
    else if (a === '--sourcePackDir') out.sourcePackDir = argv[++i];
    else if (a === '--runtimeDir') out.runtimeDir = argv[++i];
    else if (a === '--version') out.version = argv[++i];
  }
  const major = out.version.split('.')[0];
  if (!out.sourcePackDir) out.sourcePackDir = path.join(os.tmpdir(), 'ptf_pack_sandbox', 'packs', out.storyId, `v${major}`);
  if (!out.runtimeDir) out.runtimeDir = path.join(os.tmpdir(), 'ptf_pack_runtime');
  return out;
}

function assertOutsideRepo(dir, label) {
  const resolved = path.resolve(dir);
  const root = path.resolve(REPO_ROOT);
  if (resolved === root || resolved.startsWith(root + path.sep)) {
    throw new Error(`RECUSADO: ${label} dentro do repositório (${resolved}). Use um diretório fora do repo.`);
  }
}

function sha256File(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }

// Validador de manifesto do runtime, carregado sem importar Expo (mesma técnica do smoke).
function loadRuntimeValidator() {
  let code = fs.readFileSync(path.join(REPO_ROOT, 'src', 'services', 'packManifestService.js'), 'utf8');
  code = code.replace(/export\s+function\s+/g, 'function ');
  code += '\n;return { validateManifest };';
  // eslint-disable-next-line no-new-func
  return new Function(code)();
}

function rmrf(dir) { if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true }); }

// Diretório-URI file:// com barra final (compatível com contentResolver: localDir + relPath).
function dirFileUri(absDir) {
  let href = pathToFileURL(absDir).href;
  if (!href.endsWith('/')) href += '/';
  return href;
}

function install() {
  const args = parseArgs(process.argv);
  const { storyId, version } = args;

  assertOutsideRepo(args.sourcePackDir, 'sourcePackDir');
  assertOutsideRepo(args.runtimeDir, 'runtimeDir');

  const sourceDir = path.resolve(args.sourcePackDir);
  const runtimeDir = path.resolve(args.runtimeDir);
  const tmpDir = path.join(runtimeDir, '.tmp', `${storyId}@${version}`);
  const installedDir = path.join(runtimeDir, 'packs', `${storyId}@${version}`);
  const indexPath = path.join(runtimeDir, 'pack-index.json');

  // Fonte precisa ter manifest + pack.sha256.
  const srcManifest = path.join(sourceDir, 'manifest.json');
  const srcPackSha = path.join(sourceDir, 'pack.sha256');
  if (!fs.existsSync(srcManifest) || !fs.existsSync(srcPackSha)) {
    throw new Error(`pack fonte incompleto em ${sourceDir} (falta manifest.json ou pack.sha256)`);
  }

  // 1. Copiar → .tmp (nunca direto no destino final).
  rmrf(tmpDir);
  fs.mkdirSync(path.dirname(tmpDir), { recursive: true });
  fs.cpSync(sourceDir, tmpDir, { recursive: true });

  // 2. Validar no .tmp.
  const errors = [];
  const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, 'manifest.json'), 'utf8'));

  const { validateManifest } = loadRuntimeValidator();
  const mv = validateManifest(manifest, { appVersion: '1.0.0' });
  if (!mv.ok) errors.push(`manifest inválido: ${mv.errors.join(' | ')}`);

  // pack.sha256 == sha256(manifest.json)
  const manifestSha = sha256File(path.join(tmpDir, 'manifest.json'));
  const declaredSha = fs.readFileSync(path.join(tmpDir, 'pack.sha256'), 'utf8').trim().split(/\s+/)[0];
  if (declaredSha !== manifestSha) errors.push(`pack.sha256 (${declaredSha}) != sha256(manifest.json) (${manifestSha})`);

  // bytes + sha256 por arquivo
  let sum = 0;
  (manifest.files || []).forEach((f) => {
    const abs = path.join(tmpDir, f.path);
    if (!fs.existsSync(abs)) { errors.push(`ausente: ${f.path}`); return; }
    const size = fs.statSync(abs).size;
    if (size !== f.bytes) errors.push(`bytes ${f.path} (manifesto ${f.bytes}, disco ${size})`);
    if (sha256File(abs) !== f.sha256) errors.push(`sha256 ${f.path}`);
    sum += f.bytes;
  });
  if (manifest.totalBytes !== sum) errors.push(`totalBytes (${manifest.totalBytes}) != soma (${sum})`);

  if (errors.length) {
    rmrf(tmpDir);
    console.log('── install-sandbox-pack (F2.1c) ──');
    console.log(`RESULTADO: FALHOU — pack NÃO instalado, NÃO registrado ready (${errors.length} erro(s)):`);
    errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }

  // 3. Mover atômico .tmp → packs/<id>@<version>/
  rmrf(installedDir);
  fs.mkdirSync(path.dirname(installedDir), { recursive: true });
  fs.renameSync(tmpDir, installedDir);

  // 4. Registrar ready no índice sandbox (JSON fora do repo — NÃO é AsyncStorage/@ptf_packs_v1).
  const localDir = dirFileUri(installedDir);
  const manifestPath = `${localDir}manifest.json`;
  const index = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : {};
  index[storyId] = {
    storyId,
    version,
    status: 'ready',                 // == PACK_STATUS.READY
    localDir,                        // file:// com barra final
    manifestPath,
    totalBytes: manifest.totalBytes,
    downloadedBytes: manifest.totalBytes,
    updatedAt: Date.now(),
    errorMessage: null,
  };
  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');

  console.log('── install-sandbox-pack (F2.1c) ──');
  console.log(`história:   ${storyId} @ ${version}`);
  console.log(`fonte:      ${sourceDir}`);
  console.log(`instalado:  ${installedDir}`);
  console.log(`localDir:   ${localDir}`);
  console.log(`índice:     ${indexPath}`);
  console.log(`status:     ready  (totalBytes ${manifest.totalBytes} = ${(manifest.totalBytes / 1048576).toFixed(2)} MB)`);
  console.log('RESULTADO: INSTALADO ✓ (manifest + pack.sha256 + bytes/sha256 validados no .tmp antes de mover)');
  return { installedDir, localDir, indexPath };
}

try { install(); } catch (e) { console.error(`ERRO: ${e.message}`); process.exit(1); }
