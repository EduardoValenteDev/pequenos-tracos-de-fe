/**
 * generate-narrator-package.js
 * Gera docs/NARRATOR_PACKAGE/ com 5 arquivos para o narrador.
 * Fonte: src/data/stories.js
 * Run: node scripts/generate-narrator-package.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT   = path.join(__dirname, '..');
const SRC    = path.join(ROOT, 'src', 'data', 'stories.js');
const OUTDIR = path.join(ROOT, 'docs', 'NARRATOR_PACKAGE');

if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

// ── Parse stories.js ─────────────────────────────────────────────────────────
let src = fs.readFileSync(SRC, 'utf8');
src = src.replace(/^export\s+const\s+(\w+)\s*=/, 'const $1 =');
const fn = new Function('module', 'exports', src + '\nmodule.exports = { stories };');
const mod = { exports: {} };
fn(mod, mod.exports);
const { stories } = mod.exports;

if (!Array.isArray(stories) || stories.length === 0) {
  console.error('ERRO: não foi possível parsear stories.js'); process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const TRACK = {
  comece_aqui:   'Comece Aqui',
  pequeninos:    'Pequeninos',
  descobridores: 'Descobridores',
  jovens_da_fe:  'Jovens da Fé',
};

function pad2(n)   { return String(n).padStart(2, '0'); }
function ni(v)     { return (v === null || v === undefined || v === '') ? '—' : v; }
function trackName(t) { return TRACK[t] || t; }

function audioFile(storyId, sceneNum) {
  return `${storyId}_scene_${pad2(sceneNum)}.mp3`;
}
function pastaDestino(storyId) {
  return `assets/audio/${storyId}/`;
}
function fullPath(storyId, sceneNum) {
  return `assets/audio/${storyId}/${audioFile(storyId, sceneNum)}`;
}

// CSV RFC-4180
function csvQ(v) {
  const s = (v === null || v === undefined) ? '' : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

// ── Flatten rows ──────────────────────────────────────────────────────────────
const rows = [];
const emptyNarration = [];

stories.forEach(story => {
  (story.cenas || []).forEach((cena, idx) => {
    const num   = cena.id || idx + 1;
    const texto = cena.textoNarracao || '';
    if (!texto) emptyNarration.push(`${story.id} cena ${num}`);
    rows.push({
      trilha:         trackName(story.trackId),
      storyId:        story.id,
      tituloHistoria: story.titulo,
      sceneNumber:    num,
      textoNarracao:  texto,
      audioFileName:  audioFile(story.id, num),
      pastaDestino:   pastaDestino(story.id),
      fullPath:       fullPath(story.id, num),
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. README_NARRADOR.md
// ─────────────────────────────────────────────────────────────────────────────
const readme = [];
readme.push('# Instruções para o Narrador — Pequenos Traços de Fé');
readme.push('');
readme.push('Obrigado por fazer parte deste projeto!  ');
readme.push('Este pacote contém os roteiros completos para a narração do aplicativo.');
readme.push('');
readme.push('---');
readme.push('');
readme.push('## O que você vai fazer');
readme.push('');
readme.push('Gravar **200 narrações de áudio** — 10 por história, 20 histórias.  ');
readme.push('Cada narração é uma cena de uma história bíblica contada para crianças de **3 a 8 anos**.');
readme.push('');
readme.push('---');
readme.push('');
readme.push('## Regras de gravação');
readme.push('');
readme.push('### Voz');
readme.push('');
readme.push('- Voz **doce, clara, acolhedora e expressiva**');
readme.push('- Tom **infantil** — como quem conta uma história para uma criança querida');
readme.push('- Ritmo **calmo** — não apressado, adequado para crianças de 3 a 8 anos');
readme.push('- Pronunciar com clareza, sem engolir palavras');
readme.push('- Sorrir enquanto fala — o sorriso muda o timbre da voz');
readme.push('- Vaiar a entonação nos momentos de surpresa ou emoção');
readme.push('');
readme.push('### O que NÃO fazer');
readme.push('');
readme.push('- **Não juntar cenas** — cada cena é um arquivo separado');
readme.push('- **Não alterar o texto** — narrar exatamente as palavras do roteiro');
readme.push('- **Não adicionar música** de fundo');
readme.push('- **Não adicionar efeitos sonoros**');
readme.push('- **Não adicionar ruídos de fundo**');
readme.push('- **Não improvisar** ou resumir');
readme.push('- **Não corrigir** o texto — se parecer informal, é intencional');
readme.push('');
readme.push('### Ambiente e equipamento');
readme.push('');
readme.push('- Gravar em ambiente **silencioso** (portas fechadas, ar-condicionado desligado)');
readme.push('- Microfone a **20 cm da boca**, levemente desviado (evita plosivos: "p", "b", "t")');
readme.push('- Gravar **5–10 segundos de silêncio** antes de começar cada cena');
readme.push('  (serve como referência de ruído ambiente para tratamento)');
readme.push('- Pausar **1–2 segundos** entre frases longas');
readme.push('');
readme.push('### Exportação do arquivo');
readme.push('');
readme.push('- Formato: **MP3**');
readme.push('- Canais: **Mono**');
readme.push('- Taxa de bits: **128 kbps CBR**');
readme.push('- Taxa de amostragem: **44.1 kHz** ou **48 kHz**');
readme.push('- Tamanho esperado por cena: **500 KB a 2 MB**');
readme.push('');
readme.push('### Nome dos arquivos');
readme.push('');
readme.push('**Use exatamente o nome indicado em cada cena do roteiro.**  ');
readme.push('Nenhum espaço. Nenhum acento. Extensão `.mp3` em minúsculas.');
readme.push('');
readme.push('Exemplos de nomes corretos:');
readme.push('```');
readme.push('creation_scene_01.mp3');
readme.push('creation_scene_02.mp3');
readme.push('noah_scene_01.mp3');
readme.push('david_goliath_scene_01.mp3');
readme.push('```');
readme.push('');
readme.push('Exemplos de nomes **incorretos** (não usar):');
readme.push('```');
readme.push('audio_creation_scene_01.mp3  ← não usar prefixo "audio_"');
readme.push('creation scene 01.mp3        ← não usar espaços');
readme.push('creation_cena_01.mp3         ← não usar "cena", usar "scene"');
readme.push('Creation_Scene_01.MP3        ← não usar maiúsculas');
readme.push('```');
readme.push('');
readme.push('---');
readme.push('');
readme.push('## Arquivos deste pacote');
readme.push('');
readme.push('| Arquivo | Descrição |');
readme.push('|---|---|');
readme.push('| `README_NARRADOR.md` | Este arquivo — leia primeiro |');
readme.push('| `ROTEIRO_NARRACAO_FINAL.md` | Roteiro completo em formato legível |');
readme.push('| `ROTEIRO_NARRACAO_FINAL.csv` | Roteiro em planilha (para ferramentas de gestão) |');
readme.push('| `AUDIO_FILE_MAP_APP_FINAL.md` | Mapa completo dos 200 nomes de arquivo esperados |');
readme.push('| `CHECKLIST_GRAVACAO.md` | Lista para marcar cada áudio quando pronto |');
readme.push('');
readme.push('---');
readme.push('');
readme.push(`*Total: ${stories.length} histórias — ${rows.length} cenas — ${rows.length} arquivos MP3 esperados.*`);

fs.writeFileSync(path.join(OUTDIR, 'README_NARRADOR.md'), readme.join('\n'), 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// 2. ROTEIRO_NARRACAO_FINAL.md
// ─────────────────────────────────────────────────────────────────────────────
const roteiro = [];
roteiro.push('# Roteiro de Narração Final — Pequenos Traços de Fé');
roteiro.push('');
roteiro.push('**Regra:** Narrar exatamente o texto indicado. Não alterar nenhuma palavra.  ');
roteiro.push('**Cada cena = um arquivo MP3 separado.**');
roteiro.push('');
roteiro.push('---');
roteiro.push('');

let storyIdx  = 0;
let prevStory = null;
let prevTrack = null;

rows.forEach(row => {
  if (row.trilha !== prevTrack) {
    prevTrack = row.trilha;
    roteiro.push(`## TRILHA: ${row.trilha}`);
    roteiro.push('');
    roteiro.push('---');
    roteiro.push('');
  }
  if (row.storyId !== prevStory) {
    prevStory = row.storyId;
    storyIdx++;
    const s = stories.find(x => x.id === row.storyId);
    roteiro.push(`### ${pad2(storyIdx)}. ${row.tituloHistoria}`);
    roteiro.push('');
    if (s && s.referencia) roteiro.push(`**Referência bíblica:** ${s.referencia}`);
    roteiro.push('');
  }

  roteiro.push(`#### Cena ${pad2(row.sceneNumber)}`);
  roteiro.push('');
  roteiro.push(`**Arquivo:** \`${row.audioFileName}\`  `);
  roteiro.push(`**Pasta no app:** \`${row.fullPath}\``);
  roteiro.push('');
  roteiro.push('**Texto para narrar:**');
  roteiro.push('');
  roteiro.push(row.textoNarracao
    ? `> ${row.textoNarracao}`
    : '> ⚠ TEXTO AUSENTE — verificar src/data/stories.js'
  );
  roteiro.push('');
  roteiro.push('---');
  roteiro.push('');
});

fs.writeFileSync(path.join(OUTDIR, 'ROTEIRO_NARRACAO_FINAL.md'), roteiro.join('\n'), 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// 3. ROTEIRO_NARRACAO_FINAL.csv
// ─────────────────────────────────────────────────────────────────────────────
const csvLines = [];
csvLines.push(
  ['trilha','storyId','tituloHistoria','sceneNumber','textoNarracao','audioFileName','pastaDestino']
    .map(csvQ).join(',')
);
rows.forEach(r => {
  csvLines.push([
    r.trilha, r.storyId, r.tituloHistoria, r.sceneNumber,
    r.textoNarracao, r.audioFileName, r.pastaDestino,
  ].map(csvQ).join(','));
});
const csvContent = csvLines.join('\r\n') + '\r\n';
fs.writeFileSync(path.join(OUTDIR, 'ROTEIRO_NARRACAO_FINAL.csv'), csvContent, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// 4. AUDIO_FILE_MAP_APP_FINAL.md
// ─────────────────────────────────────────────────────────────────────────────
const filemap = [];
filemap.push('# Mapa Final de Arquivos de Áudio — Pequenos Traços de Fé');
filemap.push('');
filemap.push('Lista completa dos 200 arquivos de áudio esperados pelo app.');
filemap.push('');
filemap.push('**Padrão do nome:** `{storyId}_scene_{NN}.mp3`  ');
filemap.push('**Pasta no app:** `assets/audio/{storyId}/`');
filemap.push('');
filemap.push('---');
filemap.push('');

let fmStoryIdx  = 0;
let fmPrevStory = null;

rows.forEach(row => {
  if (row.storyId !== fmPrevStory) {
    fmPrevStory = row.storyId;
    fmStoryIdx++;
    filemap.push(`## ${pad2(fmStoryIdx)}. ${row.tituloHistoria} — \`${row.storyId}\``);
    filemap.push('');
    filemap.push('| Cena | Nome do arquivo | Caminho completo no app |');
    filemap.push('|---|---|---|');
  }
  filemap.push(`| ${pad2(row.sceneNumber)} | \`${row.audioFileName}\` | \`${row.fullPath}\` |`);

  const next = rows[rows.indexOf(row) + 1];
  if (!next || next.storyId !== row.storyId) filemap.push('');
});

filemap.push('---');
filemap.push('');
filemap.push('## Resumo');
filemap.push('');
filemap.push('| Item | Total |');
filemap.push('|---|---|');
filemap.push(`| Histórias | ${stories.length} |`);
filemap.push(`| Cenas | ${rows.length} |`);
filemap.push(`| Arquivos de áudio esperados | ${rows.length} |`);
filemap.push('');
// Validation: no audio_ prefix
const wrongPrefix = rows.filter(r => r.audioFileName.startsWith('audio_'));
filemap.push(`Arquivos com prefixo indevido \`audio_\`: **${wrongPrefix.length === 0 ? 'Nenhum ✓' : wrongPrefix.length}**`);
filemap.push('');

fs.writeFileSync(path.join(OUTDIR, 'AUDIO_FILE_MAP_APP_FINAL.md'), filemap.join('\n'), 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// 5. CHECKLIST_GRAVACAO.md
// ─────────────────────────────────────────────────────────────────────────────
const chk = [];
chk.push('# Checklist de Gravação — Pequenos Traços de Fé');
chk.push('');
chk.push('Marque `[x]` quando o arquivo de áudio for recebido e validado.');
chk.push('');
chk.push('**Validação mínima antes de marcar:**');
chk.push('- Ouviu o arquivo completo e está sem distorção');
chk.push('- Não tem ruído de fundo alto');
chk.push('- O nome do arquivo está exatamente correto');
chk.push('- A extensão é `.mp3` (minúsculas)');
chk.push('- O texto foi narrado sem alterações');
chk.push('');
chk.push('---');
chk.push('');

let ckStoryIdx  = 0;
let ckPrevStory = null;
let ckPrevTrack = null;

rows.forEach(row => {
  if (row.trilha !== ckPrevTrack) {
    ckPrevTrack = row.trilha;
    chk.push(`## Trilha: ${row.trilha}`);
    chk.push('');
  }
  if (row.storyId !== ckPrevStory) {
    ckPrevStory = row.storyId;
    ckStoryIdx++;
    chk.push(`### ${pad2(ckStoryIdx)}. ${row.tituloHistoria} (\`${row.storyId}\`)`);
    chk.push('');
  }
  chk.push(`- [ ] Cena ${pad2(row.sceneNumber)} — \`${row.audioFileName}\``);

  const next = rows[rows.indexOf(row) + 1];
  if (!next || next.storyId !== row.storyId) chk.push('');
});

chk.push('---');
chk.push('');
chk.push('## Progresso geral');
chk.push('');
chk.push(`- [ ] 0/${rows.length} arquivos recebidos`);
chk.push('');
chk.push('*(Atualizar manualmente conforme os arquivos chegarem.)*');

fs.writeFileSync(path.join(OUTDIR, 'CHECKLIST_GRAVACAO.md'), chk.join('\n'), 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// Relatório
// ─────────────────────────────────────────────────────────────────────────────
const wrongPrefixCount = rows.filter(r => r.audioFileName.startsWith('audio_')).length;
const wrongPattern = rows.filter(r => !/_scene_\d{2}\.mp3$/.test(r.audioFileName)).length;
const noPasta = rows.filter(r => !r.pastaDestino).length;

console.log('');
console.log('Arquivos gerados em docs/NARRATOR_PACKAGE/:');
[
  'README_NARRADOR.md',
  'ROTEIRO_NARRACAO_FINAL.md',
  'ROTEIRO_NARRACAO_FINAL.csv',
  'AUDIO_FILE_MAP_APP_FINAL.md',
  'CHECKLIST_GRAVACAO.md',
].forEach(f => {
  const p = path.join(OUTDIR, f);
  const kb = (fs.statSync(p).size / 1024).toFixed(1);
  console.log(`  ✓ ${f.padEnd(32)} ${kb} KB`);
});

console.log('');
console.log('══════════════════════════════════════════');
console.log('  Relatório final');
console.log('══════════════════════════════════════════');
console.log(`  Histórias:                       ${stories.length}`);
console.log(`  Cenas:                           ${rows.length}`);
console.log(`  Arquivos de áudio esperados:     ${rows.length}`);
console.log(`  audioFileName sem prefixo audio_:${wrongPrefixCount === 0 ? ' Todos corretos ✓' : ` ${wrongPrefixCount} com prefixo errado ✗`}`);
console.log(`  Padrão {storyId}_scene_NN.mp3:  ${wrongPattern === 0 ? ' Todos corretos ✓' : ` ${wrongPattern} fora do padrão ✗`}`);
console.log(`  pastaDestino presente:           ${noPasta === 0 ? ' Todos ✓' : ` ${noPasta} ausentes ✗`}`);
console.log(`  textoNarracao vazio:             ${emptyNarration.length === 0 ? ' Nenhum ✓' : ` ${emptyNarration.join(', ')}`}`);
console.log(`  Arquivos de código alterados:    Nenhum ✓`);
console.log('══════════════════════════════════════════');
