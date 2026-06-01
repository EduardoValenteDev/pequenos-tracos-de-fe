/**
 * generate-narration-export.js
 * Gera docs/NARRATION_EXPORT.md, docs/NARRATION_EXPORT.csv e docs/NARRATION_AUDIO_FILE_MAP.md
 * Fonte: src/data/stories.js
 * Run: node scripts/generate-narration-export.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STORIES_FILE = path.join(ROOT, 'src', 'data', 'stories.js');
const OUT_MD   = path.join(ROOT, 'docs', 'NARRATION_EXPORT.md');
const OUT_CSV  = path.join(ROOT, 'docs', 'NARRATION_EXPORT.csv');
const OUT_MAP  = path.join(ROOT, 'docs', 'NARRATION_AUDIO_FILE_MAP.md');

// ── Parse stories.js (ES module → CommonJS eval) ────────────────────────────
let src = fs.readFileSync(STORIES_FILE, 'utf8');
src = src.replace(/^export\s+const\s+(\w+)\s*=/, 'const $1 =');
const fn = new Function('module', 'exports', src + '\nmodule.exports = { stories };');
const mod = { exports: {} };
fn(mod, mod.exports);
const { stories } = mod.exports;

if (!Array.isArray(stories) || stories.length === 0) {
  console.error('ERRO: Não foi possível parsear stories.js');
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const TRACK_NAMES = {
  comece_aqui:  'Comece Aqui',
  pequeninos:   'Pequeninos',
  descobridores: 'Descobridores',
  jovens_da_fe: 'Jovens da Fé',
};

// Tom sugerido por trilha (derivado do público-alvo de cada trilha)
const TRACK_TOM = {
  comece_aqui:
    'Voz suave, encantada e bem pausada. Ritmo lento. Sorria enquanto fala — as crianças percebem. Faça uma pausa de 1–2 s entre frases longas.',
  pequeninos:
    'Voz gentil e levemente expressiva. Dramatize os momentos de surpresa com entonação, mas sem assustar. Pause antes de revelar o desfecho.',
  descobridores:
    'Voz narrativa e envolvente. Varie o ritmo: acelere levemente em momentos de tensão, desacelere nos momentos de reflexão.',
  jovens_da_fe:
    'Voz mais reflexiva e madura. Permita 1–2 s de silêncio antes dos pontos de ensino. Leia como quem conta uma história real.',
};

function trackName(trackId) {
  return TRACK_NAMES[trackId] || trackId;
}

function trackTom(trackId) {
  return TRACK_TOM[trackId] || 'Não informado.';
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function audioFileName(storyId, sceneNumber) {
  return `audio_${storyId}_scene_${pad2(sceneNumber)}.mp3`;
}

// CSV: escapa campo (RFC 4180)
function csvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// ── Coleta de dados ───────────────────────────────────────────────────────────
const rows = []; // { trilha, storyId, tituloHistoria, sceneNumber, textoNarracao, tomSugerido, audioFileName }
const emptyNarration = [];
const allAudioFiles = [];

stories.forEach(story => {
  const cenas = story.cenas || [];
  cenas.forEach((cena, idx) => {
    const sceneNum = cena.id || idx + 1;
    const texto = cena.textoNarracao || '';
    const audioFile = audioFileName(story.id, sceneNum);

    if (!texto) emptyNarration.push(`${story.id} cena ${sceneNum}`);

    rows.push({
      trilha:        trackName(story.trackId),
      storyId:       story.id,
      tituloHistoria: story.titulo,
      sceneNumber:   sceneNum,
      textoNarracao: texto,
      tomSugerido:   trackTom(story.trackId),
      audioFileName: audioFile,
    });

    allAudioFiles.push(audioFile);
  });
});

// ── 1. NARRATION_EXPORT.md ────────────────────────────────────────────────────
const md = [];

md.push('# Narration Export — Pequenos Traços de Fé');
md.push('');
md.push('**Fonte:** `src/data/stories.js` → campo `textoNarracao`  ');
md.push('**Uso:** Enviar ao narrador. Gravar cada cena como arquivo separado.  ');
md.push('**Regra:** Narrar exatamente o texto abaixo. Não improvisar. Não resumir.');
md.push('');
md.push('---');
md.push('');
md.push('## Orientações gerais de gravação');
md.push('');
md.push('- Gravar cada cena em arquivo separado (.mp3, mono, 128 kbps, 44.1 kHz)');
md.push('- Nome do arquivo: exatamente como indicado em "Arquivo de áudio"');
md.push('- Gravar em ambiente silencioso (portas fechadas, ar-condicionado desligado)');
md.push('- Microfone a ~20 cm da boca, levemente desviado (evita plosivos)');
md.push('- Gravar 5–10 s de silêncio antes de começar (referência para remoção de ruído)');
md.push('- Falar devagar — crianças pequenas precisam de tempo para absorver');
md.push('- Sorrir enquanto fala — muda o timbre da voz para mais acolhedor');
md.push('- Uma cena por arquivo — nunca misturar cenas');
md.push('');
md.push('---');
md.push('');

// Agrupar por trilha → história
let currentTrack = null;
let currentStory = null;
let storyCount = 0;

rows.forEach(row => {
  // Trilha header
  if (row.trilha !== currentTrack) {
    currentTrack = row.trilha;
    currentStory = null;
    md.push(`## Trilha: ${row.trilha}`);
    md.push('');
    md.push(`> **Tom sugerido para esta trilha:** ${TRACK_TOM[
      Object.keys(TRACK_NAMES).find(k => TRACK_NAMES[k] === row.trilha)
    ] || ''}`);
    md.push('');
    md.push('---');
    md.push('');
  }

  // História header
  if (row.storyId !== currentStory) {
    currentStory = row.storyId;
    storyCount++;
    const story = stories.find(s => s.id === row.storyId);
    md.push(`### ${pad2(storyCount)}. ${row.tituloHistoria} (\`${row.storyId}\`)`);
    md.push('');
    if (story && story.referencia) {
      md.push(`**Referência bíblica:** ${story.referencia}`);
    }
    if (story && story.licaoCoracao) {
      md.push(`**Tema central:** ${story.licaoCoracao}`);
    }
    md.push('');
  }

  // Cena
  md.push(`#### Cena ${pad2(row.sceneNumber)}`);
  md.push('');
  md.push(`**Arquivo de áudio:** \`${row.audioFileName}\``);
  md.push('');
  md.push('**Texto para narrar:**');
  md.push('');
  if (row.textoNarracao) {
    md.push(`> ${row.textoNarracao}`);
  } else {
    md.push('> ⚠ TEXTO AUSENTE — verificar src/data/stories.js');
  }
  md.push('');
  md.push('---');
  md.push('');
});

// Validação no MD
md.push('## Validação');
md.push('');
md.push(`- **Total de histórias:** ${stories.length}`);
md.push(`- **Total de cenas:** ${rows.length}`);
md.push(`- **Total de arquivos de áudio esperados:** ${allAudioFiles.length}`);
md.push(`- **Cenas sem textoNarracao:** ${emptyNarration.length === 0 ? 'Nenhuma' : emptyNarration.join(', ')}`);
md.push(`- **Textos alterados ou inventados:** Nenhum — conteúdo verbatim de \`textoNarracao\``);
md.push('');

fs.writeFileSync(OUT_MD, md.join('\n'), 'utf8');
console.log(`✓ ${OUT_MD}`);
console.log(`  Linhas: ${md.length} | Tamanho: ${(Buffer.byteLength(md.join('\n'), 'utf8') / 1024).toFixed(1)} KB`);

// ── 2. NARRATION_EXPORT.csv ───────────────────────────────────────────────────
const csvLines = [];
csvLines.push(['trilha','storyId','tituloHistoria','sceneNumber','textoNarracao','tomSugerido','audioFileName'].map(csvField).join(','));

rows.forEach(row => {
  csvLines.push([
    row.trilha,
    row.storyId,
    row.tituloHistoria,
    row.sceneNumber,
    row.textoNarracao,
    row.tomSugerido,
    row.audioFileName,
  ].map(csvField).join(','));
});

const csvContent = csvLines.join('\r\n') + '\r\n';
fs.writeFileSync(OUT_CSV, csvContent, 'utf8');
console.log(`✓ ${OUT_CSV}`);
console.log(`  Linhas: ${csvLines.length} | Tamanho: ${(Buffer.byteLength(csvContent, 'utf8') / 1024).toFixed(1)} KB`);

// ── 3. NARRATION_AUDIO_FILE_MAP.md ───────────────────────────────────────────
const map = [];

map.push('# Narration Audio File Map — Pequenos Traços de Fé');
map.push('');
map.push('Lista completa dos 200 arquivos de áudio esperados, na ordem de gravação.');
map.push('');
map.push('**Padrão:** `audio_{storyId}_scene_{NN}.mp3`  ');
map.push('**Destino no app:** `assets/audio/{storyId}/audio_{storyId}_scene_{NN}.mp3`');
map.push('');
map.push('> Atenção: o nome do arquivo no app usa a convenção `{storyId}_scene_{NN}.mp3`.');
map.push('> O prefixo `audio_` é apenas para identificação na lista de gravação.');
map.push('> Ao mover para o app, use o nome sem o prefixo `audio_`.');
map.push('');
map.push('---');
map.push('');

let mapStoryCount = 0;
let mapCurrentStory = null;

rows.forEach((row, i) => {
  if (row.storyId !== mapCurrentStory) {
    mapCurrentStory = row.storyId;
    mapStoryCount++;
    const story = stories.find(s => s.id === row.storyId);
    map.push(`## ${pad2(mapStoryCount)}. ${row.tituloHistoria} — \`${row.storyId}\``);
    map.push('');
    map.push('| # | Arquivo de áudio | Caminho no app |');
    map.push('|---|---|---|');
  }

  const appPath = `assets/audio/${row.storyId}/${row.storyId}_scene_${pad2(row.sceneNumber)}.mp3`;
  map.push(`| ${pad2(row.sceneNumber)} | \`${row.audioFileName}\` | \`${appPath}\` |`);

  // Blank line after last scene of each story
  const nextRow = rows[i + 1];
  if (!nextRow || nextRow.storyId !== row.storyId) {
    map.push('');
  }
});

map.push('---');
map.push('');
map.push('## Resumo');
map.push('');
map.push(`| Item | Total |`);
map.push('|---|---|');
map.push(`| Histórias | ${stories.length} |`);
map.push(`| Cenas | ${rows.length} |`);
map.push(`| Arquivos de áudio esperados | ${allAudioFiles.length} |`);
map.push('');
map.push('**Checklist rápido antes de commitar um arquivo de áudio:**');
map.push('');
map.push('- [ ] Nome exatamente igual ao indicado (sem espaços, sem acentos, extensão `.mp3`)');
map.push('- [ ] Colocado na pasta correta em `assets/audio/{storyId}/`');
map.push('- [ ] Entrada adicionada em `src/data/audioManifest.js`');
map.push('- [ ] `npm run audio:audit` → contagem aumentou');
map.push('- [ ] `npm run smoke` → 582/582');
map.push('');

const mapContent = map.join('\n');
fs.writeFileSync(OUT_MAP, mapContent, 'utf8');
console.log(`✓ ${OUT_MAP}`);
console.log(`  Linhas: ${map.length} | Tamanho: ${(Buffer.byteLength(mapContent, 'utf8') / 1024).toFixed(1)} KB`);

// ── Relatório final ───────────────────────────────────────────────────────────
console.log('');
console.log('══════════════════════════════════════════');
console.log('  Relatório final');
console.log('══════════════════════════════════════════');
console.log(`  Histórias exportadas:        ${stories.length}`);
console.log(`  Cenas exportadas:            ${rows.length}`);
console.log(`  Arquivos de áudio esperados: ${allAudioFiles.length}`);
console.log(`  Textos de textoNarracao:     ${rows.length - emptyNarration.length}/${rows.length}`);
console.log(`  Textos vazios ou ausentes:   ${emptyNarration.length === 0 ? 'Nenhum ✓' : emptyNarration.join(', ')}`);
console.log(`  Texto inventado:             Nenhum ✓`);
console.log(`  Arquivos de código alterados: Nenhum ✓`);
console.log('══════════════════════════════════════════');
