/**
 * audit-assets.js — Auditoria completa de assets do projeto.
 *
 * Verifica: áudios, capas, narração, pastas legadas, assets órfãos, arquivos
 * grandes, extensões erradas, duplicidades — e o LACRE do Colorir legado.
 *
 * [P3J] A Seção 2 deixou de contar "imagens de colorir por cena" (atividade aposentada) e passou
 * a ser um LACRE: falha se o mapa `src/assets/coloringImages.js` reaparecer, se qualquer lineart
 * voltar para `assets/stories/<historia>/coloring/`, ou se um dos 3 assets do Colorir com o Beni
 * sumir.
 *
 * Não altera, renomeia ou apaga nenhum arquivo.
 * Run: node scripts/audit-assets.js
 * Run: node scripts/audit-assets.js --verbose
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');

// ── Parse stories.js ─────────────────────────────────────────────────────────
let src = fs.readFileSync(path.join(ROOT, 'src', 'data', 'stories.js'), 'utf8');
src = src.replace(/^export\s+const\s+(\w+)\s*=/, 'const $1 =');
const fn = new Function('module', 'exports', src + '\nmodule.exports={stories};');
const mod = { exports: {} };
fn(mod, mod.exports);
const { stories } = mod.exports;

// ── Colorir legado: APOSENTADO (P3J) ─────────────────────────────────────────
// O mapa `src/assets/coloringImages.js` foi removido. A leitura virou uma VERIFICAÇÃO de ausência:
// se o arquivo reaparecer, a Seção 2 falha (é o sinal de que alguém reabriu a atividade sem spec).
const LEGACY_COLORING_MAP_REL = 'src/assets/coloringImages.js';
const LEGACY_COLORING_MAP_PRESENT = fs.existsSync(path.join(ROOT, LEGACY_COLORING_MAP_REL));

// Os 3 únicos PNGs que podem viver sob assets/stories/**/coloring/ — Colorir com o Beni.
const C60_ALLOWED = new Set([
  'assets/stories/creation/coloring/scene_02.png',
  'assets/stories/creation/coloring/activities/living_world.png',
  'assets/stories/creation/coloring/activities/people_and_care.png',
]);

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad2(n)    { return String(n).padStart(2, '0'); }
function mb(bytes)  { return (bytes / 1024 / 1024).toFixed(2) + ' MB'; }
function kb(bytes)  { return (bytes / 1024).toFixed(0) + ' KB'; }
function exists(p)  { try { fs.accessSync(p); return true; } catch { return false; } }
function size(p)    { try { return fs.statSync(p).size; } catch { return 0; } }

const WARN = '⚠ ';
const OK   = '✓ ';
const ERR  = '✗ ';
const INFO = '  ';

let errors = 0; let warnings = 0; let oks = 0;

function pass(msg)  { oks++;      if (VERBOSE) console.log(OK + msg); }
function warn(msg)  { warnings++; console.log(WARN + msg); }
function fail(msg)  { errors++;   console.log(ERR + msg); }
function info(msg)  { console.log(INFO + msg); }

// [P3J] O mapa storyId→pasta (`noah: 'noe'`, `david_goliath: 'davi_golias'`, …) e o parser de
// cena→arquivo existiam SÓ para inventariar os linearts legados, cujos nomes seguiam convenções
// antigas de pasta. Com a atividade aposentada, ambos saíram: nenhuma outra seção os usava.
//
// Varre assets/stories/**/coloring/ e devolve os caminhos relativos (POSIX) dos arquivos achados.
function findColoringFiles(dirAbs, out) {
  let entries;
  try { entries = fs.readdirSync(dirAbs, { withFileTypes: true }); } catch { return out; }
  entries.forEach((e) => {
    const abs = path.join(dirAbs, e.name);
    if (e.isDirectory()) findColoringFiles(abs, out);
    else out.push(path.relative(ROOT, abs).replace(/\\/g, '/'));
  });
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: Audio assets
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log('  AUDIT-ASSETS — Pequenos Traços de Fé');
console.log('══════════════════════════════════════════════════════════\n');
console.log('── SEÇÃO 1: Áudio ──────────────────────────────────────');

let audioPresent = 0; let audioMissing = 0; let audioBig = 0; let audioWrongExt = 0;
const AUDIO_MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const AUDIO_MIN_BYTES = 40 * 1024;        // 40 KB (silence or very short = suspicious)

stories.forEach(s => {
  for (let i = 1; i <= 10; i++) {
    const fileName = `${s.id}_scene_${pad2(i)}.mp3`;
    const filePath = path.join(ROOT, 'assets', 'audio', s.id, fileName);

    if (!exists(filePath)) {
      audioMissing++;
      if (VERBOSE) info(`MISSING audio: assets/audio/${s.id}/${fileName}`);
    } else {
      audioPresent++;
      const bytes = size(filePath);
      if (bytes > AUDIO_MAX_BYTES) {
        warn(`LARGE audio (${mb(bytes)}): assets/audio/${s.id}/${fileName}`);
        audioBig++;
      } else if (bytes < AUDIO_MIN_BYTES) {
        warn(`TINY audio (${kb(bytes)} KB): assets/audio/${s.id}/${fileName} — possibly empty`);
      } else {
        pass(`audio OK: ${s.id}/${fileName}`);
      }
    }
  }

  // Check for wrong extensions in the audio folder
  const audioDir = path.join(ROOT, 'assets', 'audio', s.id);
  if (exists(audioDir)) {
    fs.readdirSync(audioDir).forEach(f => {
      if (f === '.gitkeep') return;
      const ext = path.extname(f).toLowerCase();
      if (ext !== '.mp3') {
        if (ext === '.wav' || ext === '.m4a' || ext === '.aac') {
          warn(`WRONG_EXT audio (${ext}): assets/audio/${s.id}/${f} — deve ser .mp3`);
          audioWrongExt++;
        } else if (ext !== '.mp3') {
          warn(`UNEXPECTED file in audio folder: assets/audio/${s.id}/${f}`);
        }
      }
      // Check naming convention
      if (f !== '.gitkeep' && ext === '.mp3') {
        const expectedPattern = new RegExp(`^${s.id}_scene_\\d{2}\\.mp3$`);
        if (!expectedPattern.test(f)) {
          warn(`WRONG_NAME audio: ${f} — expected pattern: ${s.id}_scene_NN.mp3`);
        }
      }
    });
  } else {
    fail(`MISSING audio folder: assets/audio/${s.id}/`);
  }
});

console.log(`\n  Audio ready:   ${audioPresent}/200`);
console.log(`  Audio missing: ${audioMissing}/200`);
if (audioBig > 0)      console.log(`  Audio > 3 MB:  ${audioBig} (compress recommended)`);
if (audioWrongExt > 0) console.log(`  Wrong ext:     ${audioWrongExt}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: Colorir legado — LACRE DE APOSENTADORIA (P3J)
// ─────────────────────────────────────────────────────────────────────────────
// Antes esta seção contava 200 linearts por cena. Ela NÃO virou um "pass" vazio: contava a partir
// de um regex de pasta `colorir/` que o mapa real (que usava `coloring/`) nunca casava — ou seja,
// reportava 0/200 mesmo com 199 arquivos em disco. No lugar disso ficam três provas que falham de
// verdade se a atividade for reaberta ou se o Colorir com o Beni for mutilado.
console.log('\n── SEÇÃO 2: Colorir legado (aposentado — P3J) ──────────');

let coloringIntruders = 0;
let c60Present = 0;

// [2a] O mapa legado não pode voltar a existir.
if (LEGACY_COLORING_MAP_PRESENT) {
  fail(`REINTRODUZIDO: ${LEGACY_COLORING_MAP_REL} voltou a existir — o Colorir legado foi aposentado (P3J)`);
} else {
  pass(`mapa legado ausente: ${LEGACY_COLORING_MAP_REL}`);
  info(`APOSENTADO: ${LEGACY_COLORING_MAP_REL} não existe — 0 linearts por cena esperados`);
}

// [2b] Sob assets/stories/**/coloring/ só podem viver os 3 assets do Colorir com o Beni.
const coloringOnDisk = findColoringFiles(path.join(ROOT, 'assets', 'stories'), [])
  .filter(rel => /\/coloring\//.test(rel));
coloringOnDisk.forEach(rel => {
  if (C60_ALLOWED.has(rel)) return;
  fail(`LINEART INTRUSO: ${rel} — colorir por cena foi retirado; só os 3 assets do Colorir com o Beni são permitidos`);
  coloringIntruders++;
});

// [2c] Os 3 assets do Colorir com o Beni continuam em disco (restrição 11 do bloco).
C60_ALLOWED.forEach(rel => {
  const fp = path.join(ROOT, rel);
  if (!exists(fp)) {
    fail(`AUSENTE (Colorir com o Beni): ${rel} — asset obrigatório da atividade viva`);
  } else {
    c60Present++;
    pass(`Colorir com o Beni OK (${kb(size(fp))} KB): ${rel}`);
  }
});

console.log(`\n  Mapa legado presente:      ${LEGACY_COLORING_MAP_PRESENT ? 'SIM ✗' : 'não ✓'}`);
console.log(`  Linearts intrusos:         ${coloringIntruders}`);
console.log(`  Assets Colorir com o Beni: ${c60Present}/${C60_ALLOWED.size}`);
info('Auditoria profunda (sha256, require único, clones): node scripts/verify-coloring60-assets.js');

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: Cover images
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 3: Capas de história ──────────────────────────');

let capaPresent = 0; let capaMissing = 0;
stories.forEach(s => {
  if (!s.imagemCapa) {
    capaMissing++;
    if (VERBOSE) info(`NO_CAPA declared: ${s.id} — imagemCapa: null (expected for future)`);
  } else {
    const p = path.join(ROOT, 'assets', 'images', s.imagemCapa + '.png');
    if (exists(p)) {
      capaPresent++;
      const bytes = size(p);
      if (bytes > 200 * 1024) warn(`LARGE capa (${kb(bytes)} KB): assets/images/${s.imagemCapa}.png`);
      else pass(`capa OK: ${s.imagemCapa}.png`);
    } else {
      fail(`MISSING capa file: assets/images/${s.imagemCapa}.png — declared but not on disk`);
      capaMissing++;
    }
  }
});

console.log(`\n  Capas presentes: ${capaPresent}/20`);
console.log(`  Capas ausentes:  ${capaMissing}/20 (${20 - stories.filter(s => s.imagemCapa).length} ainda não declaradas)`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: Narration images
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 4: Imagens de narração ────────────────────────');

let narPresent = 0; let narMissing = 0;
stories.forEach(s => {
  (s.cenas || []).forEach((cena, idx) => {
    if (!cena.imagemNarracao) return;
    const p = path.join(ROOT, 'assets', 'images', cena.imagemNarracao + '.png');
    if (exists(p)) {
      narPresent++;
      pass(`narImg OK: ${cena.imagemNarracao}.png`);
    } else {
      fail(`MISSING narImg: assets/images/${cena.imagemNarracao}.png — declared in ${s.id} cena ${idx+1}`);
      narMissing++;
    }
  });
});

console.log(`\n  Narração imgs presentes: ${narPresent}`);
console.log(`  Narração imgs ausentes:  ${narMissing}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: Pastas legadas (com espaços/acentos)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 5: Pastas legadas ─────────────────────────────');

const LEGACY_DIRS = [
  path.join(ROOT, 'assets', 'stories', 'Davi e o Golias'),
  path.join(ROOT, 'assets', 'stories', 'Jesus e as crianças'),
  path.join(ROOT, 'assets', 'stories', 'noe'),           // correct but check for stale files
];

let legacyCount = 0;
LEGACY_DIRS.forEach(dir => {
  if (exists(dir)) {
    const rel = path.relative(ROOT, dir);
    const files = [];
    function walkDir(d) {
      fs.readdirSync(d).forEach(f => {
        const fp = path.join(d, f);
        if (fs.statSync(fp).isDirectory()) walkDir(fp);
        else files.push(path.relative(ROOT, fp));
      });
    }
    walkDir(dir);
    if (dir.includes(' ') || dir.includes('ç') || dir.includes('ã')) {
      warn(`LEGACY folder with spaces/accents: ${rel} (${files.length} files) — confirm no require() points here before removing`);
      legacyCount++;
    } else {
      pass(`folder OK: ${rel} (${files.length} files)`);
    }
  }
});

// Check backup file
const backupImg = path.join(ROOT, 'assets', 'images', 'noe_apontandoBackup.png');
if (exists(backupImg)) {
  warn(`BACKUP file found: assets/images/noe_apontandoBackup.png — verify it is not referenced, then remove`);
  legacyCount++;
}

console.log(`\n  Legacy items: ${legacyCount}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: Orphan assets
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 6: Assets órfãos ──────────────────────────────');

// Build set of all declared image keys
const declaredImages = new Set();
stories.forEach(s => {
  if (s.imagemCapa) declaredImages.add(s.imagemCapa + '.png');
  if (s.personagemGuia) declaredImages.add(s.personagemGuia + '.png');
  (s.cenas || []).forEach(c => {
    if (c.imagemNarracao) declaredImages.add(c.imagemNarracao + '.png');
    if (c.imagemColorir)  declaredImages.add(c.imagemColorir + '.png');
  });
});

const imagesDir = path.join(ROOT, 'assets', 'images');
let orphanCount = 0;
if (exists(imagesDir)) {
  fs.readdirSync(imagesDir).forEach(f => {
    if (!declaredImages.has(f)) {
      warn(`ORPHAN image: assets/images/${f} — not referenced by any story`);
      orphanCount++;
    }
  });
}

console.log(`\n  Orphan images: ${orphanCount}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: Audio manifest consistency
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── SEÇÃO 7: audioManifest.js consistency ───────────────');

const manifestSrc = fs.readFileSync(path.join(ROOT, 'src', 'data', 'audioManifest.js'), 'utf8');
const readyEntriesMatch = manifestSrc.match(/const _readyEntries\s*=\s*\[([\s\S]*?)\];/);
const readyBody = readyEntriesMatch ? readyEntriesMatch[1].trim() : '';
const readyCount = readyBody.length === 0 ? 0 : (readyBody.match(/storyId/g) || []).length;

console.log(`  Manifest entries (ready): ${readyCount}/200`);
if (readyCount === 0) {
  info(`  All entries are MISSING status (expected — no audio recorded yet)`);
  pass('audioManifest _readyEntries = [] is correct for current state');
}

// Check that every require() in manifest points to a file that exists
const manifestDir = path.join(ROOT, 'src', 'data');
// Strip block comments and line comments before searching for require()
function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/\/\/[^\n]*/g, '');       // line comments
}
const requiresInManifest = [...stripComments(manifestSrc).matchAll(/require\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
requiresInManifest.forEach(reqPath => {
  const absPath = path.resolve(manifestDir, reqPath);
  if (!exists(absPath)) {
    fail(`BROKEN require() in audioManifest.js: ${reqPath} — file not on disk`);
  } else {
    pass(`manifest require() OK: ${reqPath}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: coloring60LocalAssets.js consistency
// ─────────────────────────────────────────────────────────────────────────────
// [P3J] Era a consistência dos require() de `coloringImages.js` (arquivo removido). O alvo passou
// a ser o registro do Colorir com o Beni: mesma prova (todo require() aponta para arquivo em
// disco), agora sobre o mapa que de fato existe. Sem essa troca, a seção viraria um zero mudo.
console.log('\n── SEÇÃO 8: coloring60LocalAssets.js consistency ────────');

const c60MapDir = path.join(ROOT, 'src', 'assets');
const c60MapPath = path.join(c60MapDir, 'coloring60LocalAssets.js');
let brokenColoring = 0;
if (!exists(c60MapPath)) {
  fail('AUSENTE: src/assets/coloring60LocalAssets.js — registro do Colorir com o Beni');
  brokenColoring++;
} else {
  const c60MapSrc = fs.readFileSync(c60MapPath, 'utf8');
  const c60Requires = [...c60MapSrc.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  c60Requires.forEach(reqPath => {
    const absPath = path.resolve(c60MapDir, reqPath);
    if (!exists(absPath)) {
      fail(`BROKEN require() in coloring60LocalAssets.js: ${reqPath}`);
      brokenColoring++;
    } else {
      pass(`coloring60LocalAssets require() OK: ${reqPath}`);
    }
  });
  console.log(`  require() verificados: ${c60Requires.length}`);
}

console.log(`  Broken requires in coloring60LocalAssets.js: ${brokenColoring}`);

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════');
console.log('  RESUMO FINAL');
console.log('══════════════════════════════════════════════════════════');
console.log(`  ✓ Checks OK:      ${oks}`);
console.log(`  ⚠ Warnings:       ${warnings}`);
console.log(`  ✗ Errors:         ${errors}`);
console.log('');
console.log('  Audio:');
console.log(`    ${audioPresent}/200 ready  |  ${audioMissing}/200 missing`);
console.log('  Colorir legado (aposentado — P3J):');
console.log(`    mapa legado: ${LEGACY_COLORING_MAP_PRESENT ? 'PRESENTE ✗' : 'ausente ✓'}  |  linearts intrusos: ${coloringIntruders}  |  Colorir com o Beni: ${c60Present}/${C60_ALLOWED.size}`);
console.log('  Capas:');
console.log(`    ${capaPresent} files present  |  ${capaMissing} declared/missing`);
console.log('  Legacy folders: ' + legacyCount);
console.log('  Orphan images:  ' + orphanCount);
console.log('');
if (errors > 0) {
  console.log('  STATUS: ✗ ISSUES FOUND — ver errors acima');
  process.exit(1);
} else if (warnings > 0) {
  console.log('  STATUS: ⚠ WARNINGS — revisar os items marcados');
} else {
  console.log('  STATUS: ✓ ALL GOOD');
}
