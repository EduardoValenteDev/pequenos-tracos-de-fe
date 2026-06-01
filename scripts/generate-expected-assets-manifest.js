/**
 * generate-expected-assets-manifest.js
 * Gera docs/EXPECTED_ASSETS_MANIFEST.md com estado atual de todos os assets.
 * Run: node scripts/generate-expected-assets-manifest.js
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Parse stories.js
let src = fs.readFileSync(path.join(ROOT, 'src', 'data', 'stories.js'), 'utf8');
src = src.replace(/^export\s+const\s+(\w+)\s*=/, 'const $1 =');
const fn = new Function('module', 'exports', src + '\nmodule.exports={stories};');
const mod = { exports: {} };
fn(mod, mod.exports);
const { stories } = mod.exports;

// Parse coloringImages.js
const coloringImgSrc = fs.readFileSync(path.join(ROOT, 'src', 'assets', 'coloringImages.js'), 'utf8');
const coloringImgDir = path.join(ROOT, 'src', 'assets');
const COLORING_FILE_MAP = {}; // storyId → sceneNum → { folder, filename, exists }
const reqEntryRe = /(\d+)\s*:\s*require\(['"]([^'"]+)['"]\)/g;
let em;
while ((em = reqEntryRe.exec(coloringImgSrc)) !== null) {
  const sceneNum = parseInt(em[1], 10);
  const reqPath  = em[2];
  const pathMatch = reqPath.match(/stories\/(\w+)\/colorir\/(.*\.png)$/);
  if (!pathMatch) continue;
  const folder   = pathMatch[1];
  const filename = pathMatch[2];
  const FOLDER_TO_STORY = { noe:'noah', davi_golias:'david_goliath', jesus_criancas:'jesus_children' };
  const storyId  = FOLDER_TO_STORY[folder] || folder;
  if (!COLORING_FILE_MAP[storyId]) COLORING_FILE_MAP[storyId] = {};
  const absPath  = path.resolve(coloringImgDir, reqPath);
  COLORING_FILE_MAP[storyId][sceneNum] = {
    folder, filename,
    filePath: `assets/stories/${folder}/colorir/${filename}`,
    exists:   fs.existsSync(absPath),
  };
}

function pad2(n) { return String(n).padStart(2, '0'); }
function existsFile(rel) { return fs.existsSync(path.join(ROOT, rel)); }

const STATUS = { PRESENT: '✓ presente', ABSENT: '○ ausente', PLACEHOLDER: '⋯ placeholder' };

const lines = [];

lines.push('# Expected Assets Manifest — Pequenos Traços de Fé');
lines.push('');
lines.push('**Gerado em:** ' + new Date().toISOString().split('T')[0]);
lines.push('**Fonte:** `src/data/stories.js`, `src/assets/coloringImages.js`');
lines.push('**Atualizar após:** adicionar qualquer novo asset ao projeto');
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Legenda');
lines.push('');
lines.push('| Símbolo | Significado |');
lines.push('|---|---|');
lines.push('| ✓ presente | Arquivo existe em disco |');
lines.push('| ○ ausente | Arquivo esperado mas não existe |');
lines.push('| ⋯ placeholder | Não declarado no código (futuro) |');
lines.push('');
lines.push('---');
lines.push('');

// Summary table
lines.push('## Resumo geral');
lines.push('');
lines.push('| Item | Presente | Total esperado |');
lines.push('|---|---|---|');

let audioReady = 0;
let coloringReady = 0; let coloringRegistered = 0;
let capaReady = 0;
let narImgReady = 0;

stories.forEach(s => {
  // Count capas
  if (s.imagemCapa && existsFile(`assets/images/${s.imagemCapa}.png`)) capaReady++;
  // Count narration images
  (s.cenas||[]).forEach(c => {
    if (c.imagemNarracao && existsFile(`assets/images/${c.imagemNarracao}.png`)) narImgReady++;
  });
  // Count coloring
  if (COLORING_FILE_MAP[s.id]) {
    for (let i=1;i<=10;i++) {
      const info = COLORING_FILE_MAP[s.id]?.[i];
      if (info) { coloringRegistered++; if (info.exists) coloringReady++; }
    }
  }
});

lines.push(`| Capas de história | ${capaReady} | 20 |`);
lines.push(`| Imagens de colorir (registradas) | ${coloringReady} | ${coloringRegistered} |`);
lines.push(`| Imagens de colorir (total esperado) | ${coloringReady} | 200 |`);
lines.push(`| Imagens de narração | ${narImgReady} | 200 (futuro) |`);
lines.push(`| Áudios de narração | 0 | 200 |`);
lines.push('');
lines.push('---');
lines.push('');

// Per-story details
lines.push('## Detalhe por história');
lines.push('');

stories.forEach((s, idx) => {
  lines.push(`### ${pad2(idx+1)}. ${s.titulo} (\`${s.id}\`)`);
  lines.push('');
  lines.push(`**Trilha:** ${s.trackId} | **Acesso:** ${s.accessType === 'free' ? 'Grátis' : 'Premium'}`);
  lines.push('');

  // Capa
  let capaStatus;
  if (!s.imagemCapa) {
    capaStatus = STATUS.PLACEHOLDER + ' — `imagemCapa: null`';
  } else {
    const capaPath = `assets/images/${s.imagemCapa}.png`;
    capaStatus = existsFile(capaPath) ? STATUS.PRESENT + ` — \`${capaPath}\`` : STATUS.ABSENT + ` — \`${capaPath}\``;
  }
  lines.push(`**Capa 16:9:** ${capaStatus}`);
  lines.push('');

  // Áudio e imagens por cena
  lines.push('| Cena | Áudio | Imagem colorir | Imagem narração |');
  lines.push('|---|---|---|---|');

  (s.cenas || []).forEach((cena, cIdx) => {
    const cNum = cIdx + 1;
    const sceneKey = `scene_${pad2(cNum)}`;

    // Audio
    const audioFile = `assets/audio/${s.id}/${s.id}_${sceneKey}.mp3`;
    const audioStatus = existsFile(audioFile) ? '✓' : '○';

    // Coloring
    const colorInfo = COLORING_FILE_MAP[s.id]?.[cNum];
    let colorStatus;
    if (!colorInfo) {
      colorStatus = '⋯';
    } else if (colorInfo.exists) {
      colorStatus = '✓';
    } else {
      colorStatus = '○';
    }

    // Narration image
    let narStatus;
    if (!cena.imagemNarracao) {
      narStatus = '⋯';
    } else {
      narStatus = existsFile(`assets/images/${cena.imagemNarracao}.png`) ? '✓' : '○';
    }

    lines.push(`| ${cNum} | ${audioStatus} \`${s.id}_${sceneKey}.mp3\` | ${colorStatus} | ${narStatus} |`);
  });

  lines.push('');
});

// Audio folder map
lines.push('---');
lines.push('');
lines.push('## Mapa de pastas de áudio esperadas');
lines.push('');
lines.push('| Pasta | StoryId | Status |');
lines.push('|---|---|---|');
stories.forEach(s => {
  const folderPath = `assets/audio/${s.id}/`;
  const folderExists = fs.existsSync(path.join(ROOT, 'assets', 'audio', s.id));
  lines.push(`| \`${folderPath}\` | \`${s.id}\` | ${folderExists ? '✓ existe' : '○ criar'} |`);
});

// Coloring image naming conventions
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Convenção de nomes de assets');
lines.push('');
lines.push('### Áudios');
lines.push('```');
lines.push('assets/audio/{storyId}/{storyId}_scene_{NN}.mp3');
lines.push('Exemplo: assets/audio/creation/creation_scene_01.mp3');
lines.push('```');
lines.push('');
lines.push('### Imagens de colorir');
lines.push('```');
lines.push('assets/stories/{folder}/colorir/{prefix}_scene_{NN}_coloring.png');
lines.push('');
lines.push('Histórias existentes:');
lines.push('  noah        → assets/stories/noe/colorir/noe_scene_{NN}_coloring.png');
lines.push('  david_goliath → assets/stories/davi_golias/colorir/davi_scene_{NN}_coloring.png');
lines.push('  jesus_children → assets/stories/jesus_criancas/colorir/jesus_children_scene_{NN}_coloring.png');
lines.push('');
lines.push('Novas histórias (padrão recomendado):');
lines.push('  {storyId}   → assets/stories/{storyId}/colorir/{storyId}_scene_{NN}_coloring.png');
lines.push('```');
lines.push('');
lines.push('### Capas de história');
lines.push('```');
lines.push('assets/images/{storyId}_capa.png');
lines.push('Formato: PNG ou JPEG, 16:9, máx 100 KB após compressão');
lines.push('```');

const content = lines.join('\n');
fs.writeFileSync(path.join(ROOT, 'docs', 'EXPECTED_ASSETS_MANIFEST.md'), content, 'utf8');
console.log(`✓ docs/EXPECTED_ASSETS_MANIFEST.md (${lines.length} linhas)`);
