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

// [P3J] O bloco que lia `src/assets/coloringImages.js` foi REMOVIDO junto com o arquivo: o Colorir
// legado foi aposentado e não há mais lineart por cena a inventariar. Como consequência, a coluna
// "Imagem colorir" e as duas linhas de resumo de colorir saíram do documento gerado — manter
// "0/200 imagens de colorir" descreveria uma lacuna de conteúdo que não existe mais.
// A atividade viva do app é o Colorir com o Beni, cujos assets NÃO entram neste manifesto: eles têm
// auditoria própria e mais estrita em `scripts/verify-coloring60-assets.js` (16 verificações).

function pad2(n) { return String(n).padStart(2, '0'); }
function existsFile(rel) { return fs.existsSync(path.join(ROOT, rel)); }

const STATUS = { PRESENT: '✓ presente', ABSENT: '○ ausente', PLACEHOLDER: '⋯ placeholder' };

const lines = [];

lines.push('# Expected Assets Manifest — Pequenos Traços de Fé');
lines.push('');
lines.push('**Gerado em:** ' + new Date().toISOString().split('T')[0]);
lines.push('**Fonte:** `src/data/stories.js`');
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
let capaReady = 0;
let narImgReady = 0;

stories.forEach(s => {
  // Count capas
  if (s.imagemCapa && existsFile(`assets/images/${s.imagemCapa}.png`)) capaReady++;
  // Count narration images
  (s.cenas||[]).forEach(c => {
    if (c.imagemNarracao && existsFile(`assets/images/${c.imagemNarracao}.png`)) narImgReady++;
  });
});

lines.push(`| Capas de história | ${capaReady} | 20 |`);
lines.push(`| Imagens de narração | ${narImgReady} | 200 (futuro) |`);
lines.push(`| Áudios de narração | 0 | 200 |`);
lines.push('');
lines.push('> **Colorir legado — APOSENTADO (P3J).** As linhas de "imagens de colorir" saíram deste');
lines.push('> resumo: a atividade foi retirada do app e os 199 linearts por cena foram removidos do');
lines.push('> repositório (histórico Git é o arquivo oficial). Ver `docs/COLORING_LEGACY_RETIREMENT_INVENTORY.md`.');
lines.push('> O Colorir com o Beni é auditado por `node scripts/verify-coloring60-assets.js`.');
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

  // Áudio e imagens por cena ([P3J]: a coluna "Imagem colorir" saiu — atividade aposentada)
  lines.push('| Cena | Áudio | Imagem narração |');
  lines.push('|---|---|---|');

  (s.cenas || []).forEach((cena, cIdx) => {
    const cNum = cIdx + 1;
    const sceneKey = `scene_${pad2(cNum)}`;

    // Audio
    const audioFile = `assets/audio/${s.id}/${s.id}_${sceneKey}.mp3`;
    const audioStatus = existsFile(audioFile) ? '✓' : '○';

    // Narration image
    let narStatus;
    if (!cena.imagemNarracao) {
      narStatus = '⋯';
    } else {
      narStatus = existsFile(`assets/images/${cena.imagemNarracao}.png`) ? '✓' : '○';
    }

    lines.push(`| ${cNum} | ${audioStatus} \`${s.id}_${sceneKey}.mp3\` | ${narStatus} |`);
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
lines.push('### Imagens de colorir — APOSENTADAS (P3J)');
lines.push('```');
lines.push('NÃO existe mais convenção de lineart por cena.');
lines.push('O Colorir legado foi retirado do app; nenhuma história deve voltar a declarar');
lines.push('assets/stories/{storyId}/coloring/*.png para colorir cena a cena.');
lines.push('');
lines.push('Atividade viva: Colorir com o Beni (A Criação) — assets registrados em');
lines.push('src/assets/coloring60LocalAssets.js e auditados por');
lines.push('node scripts/verify-coloring60-assets.js');
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
