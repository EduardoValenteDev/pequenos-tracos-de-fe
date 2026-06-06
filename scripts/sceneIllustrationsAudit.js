/**
 * scripts/sceneIllustrationsAudit.js — Relatório de cobertura das ILUSTRAÇÕES
 * OFICIAIS de cena (uma por cena), usadas na NarrationScreen / StorySceneVisual.
 *
 * Run normal:  node scripts/sceneIllustrationsAudit.js   (npm run scene:images:audit)
 * Run strict:  node scripts/sceneIllustrationsAudit.js --strict
 *              (npm run scene:images:audit -- --strict)
 * Por história: node scripts/sceneIllustrationsAudit.js --story creation
 *              (npm run scene:images:audit -- --story creation)
 *              (npm run scene:images:audit -- --story creation --strict)
 *
 * Normal: nunca falha por imagem ausente, apenas informa o status (exit 0).
 * Strict: falha (exit 1) se existir qualquer cena sem imagem oficial registrada
 *         (no escopo: todas as histórias, ou só a indicada por --story).
 *
 * Padrão oficial:
 *   Pasta: assets/stories/<storyId>/scenes/
 *   Nome:  <storyId>_scene_NN.png   (NN = 01..10)
 *   Ex:    assets/stories/creation/scenes/creation_scene_01.png
 */

const fs = require('fs');
const path = require('path');

const STRICT =
  process.argv.includes('--strict') ||
  process.env.SCENE_IMAGES_STRICT === '1';

// --story <storyId>: limita a auditoria a uma história.
const storyArgIdx = process.argv.indexOf('--story');
const STORY = (storyArgIdx >= 0 && process.argv[storyArgIdx + 1] && !process.argv[storyArgIdx + 1].startsWith('--'))
  ? process.argv[storyArgIdx + 1]
  : (process.env.SCENE_IMAGES_STORY || null);

const root = path.resolve(__dirname, '..');
const storiesDir = path.join(root, 'assets', 'stories');

const SCENES_PER_STORY = 10;

// ── Lê stories.js para id + titulo + totalCenas (sem avaliar ESM) ──
const storiesSrc = fs.readFileSync(path.join(root, 'src', 'data', 'stories.js'), 'utf8');

const STORY_META = [];
const storyMetaRe = /id:\s*'([a-z_]+)'[\s\S]*?titulo:\s*'([^']+)'[\s\S]*?totalCenas:\s*(\d+)/g;
let m;
while ((m = storyMetaRe.exec(storiesSrc)) !== null) {
  STORY_META.push({ storyId: m[1], titulo: m[2], totalCenas: Number(m[3]) || SCENES_PER_STORY });
}

// ── Resolve o escopo (todas as histórias ou só a de --story) ──
const availableIds = STORY_META.map(s => s.storyId);
if (STORY && !availableIds.includes(STORY)) {
  console.error(`\n✗ storyId inválido: "${STORY}"\n`);
  console.error('storyIds disponíveis:');
  console.error('  ' + availableIds.join('\n  ') + '\n');
  process.exit(1);
}
const SCOPE = STORY ? STORY_META.filter(s => s.storyId === STORY) : STORY_META;

// ── Lê o manifesto e conta os require() registrados por história ──
const manifestFull = fs.readFileSync(
  path.join(root, 'src', 'data', 'storySceneIllustrations.js'),
  'utf8',
);
// Considera apenas a declaração real do objeto — ignora o exemplo no comentário.
const objStart = manifestFull.indexOf('STORY_SCENE_ILLUSTRATIONS = {');
const manifestSrc = objStart >= 0 ? manifestFull.slice(objStart) : manifestFull;

function registeredScenes(storyId) {
  // Captura o bloco `storyId: { ... }` (sem chaves aninhadas além dos parênteses do require)
  const blockRe = new RegExp(`\\b${storyId}\\s*:\\s*\\{([\\s\\S]*?)\\}`);
  const block = blockRe.exec(manifestSrc);
  if (!block) return [];
  const body = block[1];
  const sceneRe = /(\d+)\s*:\s*require\(/g;
  const scenes = [];
  let s;
  while ((s = sceneRe.exec(body)) !== null) scenes.push(Number(s[1]));
  return scenes.sort((a, b) => a - b);
}

// ── Varre o disco para arquivos presentes e fora do padrão ──
function scanDiskFiles(storyId) {
  const dir = path.join(storiesDir, storyId, 'scenes');
  if (!fs.existsSync(dir)) return { files: [], offPattern: [] };
  const all = fs.readdirSync(dir).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  const valid = new RegExp(`^${storyId}_scene_(0[1-9]|10)\\.(png|jpg|jpeg|webp)$`, 'i');
  const offPattern = all.filter(f => !valid.test(f));
  return { files: all, offPattern };
}

// Caminho esperado do arquivo de uma cena.
function expectedPath(storyId, sceneNumber) {
  const nn = String(sceneNumber).padStart(2, '0');
  return `assets/stories/${storyId}/scenes/${storyId}_scene_${nn}.png`;
}

// ── Relatório ──
const scopeLabel = STORY ? ` — história: ${STORY}` : '';
console.log(`\n=== Auditoria de ilustrações oficiais de cena${STRICT ? ' (STRICT)' : ''}${scopeLabel} ===\n`);

let totalRegistered = 0;
const totalExpected = SCOPE.reduce((acc, s) => acc + (s.totalCenas || SCENES_PER_STORY), 0);
const offPatternWarnings = [];
const foundList = [];   // { storyId, titulo, scenes:[n] }
const missingList = []; // { storyId, titulo, scenes:[n] }

for (const story of SCOPE) {
  const expected = story.totalCenas || SCENES_PER_STORY;
  const registered = registeredScenes(story.storyId);
  totalRegistered += registered.length;

  const disk = scanDiskFiles(story.storyId);
  if (disk.offPattern.length) {
    offPatternWarnings.push({ storyId: story.storyId, files: disk.offPattern });
  }

  const missingNumbers = [];
  for (let n = 1; n <= expected; n++) {
    if (!registered.includes(n)) missingNumbers.push(n);
  }

  if (registered.length) foundList.push({ storyId: story.storyId, titulo: story.titulo, scenes: registered });
  if (missingNumbers.length) missingList.push({ storyId: story.storyId, titulo: story.titulo, scenes: missingNumbers });

  console.log(`• ${story.titulo} (${story.storyId}): ${registered.length} de ${expected} ilustrações oficiais`);
  if (missingNumbers.length) {
    console.log(`    cenas faltantes: ${missingNumbers.join(', ')}`);
  }

  // Detalhe por história (somente no modo --story): caminhos esperados.
  if (STORY) {
    console.log('    caminhos esperados dos arquivos:');
    for (let n = 1; n <= expected; n++) {
      const mark = registered.includes(n) ? '✓' : '·';
      console.log(`      ${mark} cena ${n}: ${expectedPath(story.storyId, n)}`);
    }
  }
}

const totalMissing = totalExpected - totalRegistered;

console.log('\n── Totais ──');
console.log(`Histórias avaliadas: ${SCOPE.length}`);
console.log(`Cenas avaliadas: ${totalExpected}`);
console.log(`Imagens oficiais encontradas: ${totalRegistered}`);
console.log(`Imagens oficiais ausentes: ${totalMissing}`);
console.log(`Total: ${totalRegistered} de ${totalExpected} ilustrações oficiais.`);

// ── Lista das imagens encontradas ──
console.log('\n── Imagens encontradas ──');
if (foundList.length) {
  for (const f of foundList) {
    console.log(`  ${f.storyId}: cenas ${f.scenes.join(', ')}`);
  }
} else {
  console.log('  (nenhuma imagem oficial registrada ainda)');
}

// ── Lista das imagens ausentes ──
console.log('\n── Imagens ausentes (por história e cena) ──');
if (missingList.length) {
  for (const mi of missingList) {
    console.log(`  ${mi.storyId}: cenas ${mi.scenes.join(', ')}`);
  }
} else {
  console.log('  (nenhuma — todas as cenas têm imagem oficial)');
}

if (offPatternWarnings.length) {
  console.log('\n⚠ Arquivos fora do padrão de nome (<storyId>_scene_NN.png):');
  for (const w of offPatternWarnings) {
    console.log(`  ${w.storyId}: ${w.files.join(', ')}`);
  }
} else {
  console.log('\nNenhum arquivo fora do padrão encontrado.');
}

if (STRICT && totalMissing > 0) {
  console.log(`\n✗ STRICT: ${totalMissing} cena(s) sem imagem oficial. Falhando (exit 1).\n`);
  process.exit(1);
}

console.log(STRICT ? '\n✓ STRICT: todas as cenas têm imagem oficial.\n' : '');
process.exit(0);
