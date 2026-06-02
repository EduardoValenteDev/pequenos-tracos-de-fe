'use strict';
/**
 * generate-narrator-package-final.js
 * Sprint 19.3 — Gera documentos do pacote final para o narrador
 *
 * Saída: docs/NARRATOR_PACKAGE_FINAL_REVISED/
 *   - ROTEIRO_NARRACAO_FINAL_REVISADO.md
 *   - ROTEIRO_NARRACAO_FINAL_REVISADO.csv
 *   - AUDIO_FILE_MAP_APP_FINAL_REVISED.md
 *   - VALIDACAO_PACOTE_NARRADOR_FINAL.md
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = 'docs/NARRATOR_PACKAGE_FINAL_REVISED';
const CSV_SRC = 'docs/biblical-review/final-5-revisoes/TEXTOS_FINAIS_PARA_IMPLEMENTACAO_5_REVISOES.csv';
const STORIES_SRC = 'src/data/stories.js';

// ─── CSV parser ───────────────────────────────────────────────────────────────
function parseCSVLine(line) {
  const result = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(field); field = '';
    } else {
      field += ch;
    }
  }
  result.push(field);
  return result;
}

// ─── Read CSV ─────────────────────────────────────────────────────────────────
const csvContent = fs.readFileSync(CSV_SRC, 'utf8');
const csvRows = csvContent.split('\n').slice(1).filter(l => l.trim());

const scenes = csvRows.map(row => {
  const f = parseCSVLine(row);
  // storyNumber,storyTitleFinal,storyTitlePrevious,biblicalReference,
  // sceneNumber,audioFileName,appPath,textoFinalNarrar,direcaoDeVoz,sonoplastiaOpcional
  const audioFileName = f[5].trim();
  const storyId = audioFileName.replace(/_scene_\d+\.mp3$/i, '');
  const sceneNum = parseInt(f[4].trim(), 10);
  const padded = String(sceneNum).padStart(2, '0');
  return {
    storyNumber: f[0].trim(),
    storyTitleFinal: f[1].trim(),
    biblicalReference: f[3].trim(),
    sceneNumber: sceneNum,
    scenePadded: padded,
    audioFileName,
    pastaDestino: `assets/audio/${storyId}/`,
    storyId,
    textoNarracao: f[7].trim(),
    direcaoVoz: f[8].trim(),
    sonoplastiaOpcional: f[9] ? f[9].trim() : '',
  };
});

// ─── Read trackId from stories.js ────────────────────────────────────────────
const storiesLines = fs.readFileSync(STORIES_SRC, 'utf8').split('\n');
const storyTrackMap = {};
let curId = null;
for (const line of storiesLines) {
  const idMatch = line.match(/^\s{4}id:\s+'([a-z_]+)',/);
  if (idMatch) curId = idMatch[1];
  const trackMatch = line.match(/^\s{4}trackId:\s+'([a-z_]+)',/);
  if (trackMatch && curId) { storyTrackMap[curId] = trackMatch[1]; curId = null; }
}

const TRILHA_NAMES = {
  comece_aqui:  'Comece Aqui',
  pequeninos:   'Pequeninos',
  descobridores:'Descobridores',
  jovens_da_fe: 'Jovens da Fé',
};

// ─── Group scenes by trilha → story ──────────────────────────────────────────
const byTrilha = {};
for (const sc of scenes) {
  const trackId = storyTrackMap[sc.storyId] || 'sem_trilha';
  if (!byTrilha[trackId]) byTrilha[trackId] = {};
  if (!byTrilha[trackId][sc.storyId]) byTrilha[trackId][sc.storyId] = [];
  byTrilha[trackId][sc.storyId].push(sc);
}
// Sort trilhas in logical order
const TRILHA_ORDER = ['comece_aqui', 'pequeninos', 'descobridores', 'jovens_da_fe'];

// ─── 1. ROTEIRO MD ────────────────────────────────────────────────────────────
let md = `# Roteiro de Narração Final — Revisão Bíblica Aprovada

**Data:** 2026-06-01
**Versão:** Final — 5 revisões bíblicas aplicadas
**Total:** 20 histórias · 200 cenas · 200 arquivos MP3

> Este roteiro é o documento oficial para gravação.
> Narrar **apenas** o campo **"Texto para narrar"**.
> Direção de voz e sonoplastia são referências de produção — não narrá-las.

---

`;

let sceneGlobal = 0;
for (const trackId of TRILHA_ORDER) {
  const stories = byTrilha[trackId];
  if (!stories) continue;
  const trilhaName = TRILHA_NAMES[trackId] || trackId;
  md += `## Trilha: ${trilhaName}\n\n`;

  // Sort stories by storyNumber
  const sortedStories = Object.values(stories).sort((a, b) => {
    return parseInt(a[0].storyNumber) - parseInt(b[0].storyNumber);
  });

  for (const scenesOfStory of sortedStories) {
    const first = scenesOfStory[0];
    md += `---\n\n### ${first.storyTitleFinal}\n`;
    md += `**Referência bíblica:** ${first.biblicalReference}  \n`;
    md += `**StoryId:** \`${first.storyId}\`  \n`;
    md += `**Pasta de áudio:** \`${first.pastaDestino}\`\n\n`;

    for (const sc of scenesOfStory.sort((a, b) => a.sceneNumber - b.sceneNumber)) {
      sceneGlobal++;
      md += `#### Cena ${sc.scenePadded} — \`${sc.audioFileName}\`\n\n`;
      md += `**Texto para narrar:**\n\n> ${sc.textoNarracao}\n\n`;
      md += `**Direção de voz:** ${sc.direcaoVoz}\n\n`;
      if (sc.sonoplastiaOpcional) {
        md += `**Sonoplastia opcional:** ${sc.sonoplastiaOpcional}\n\n`;
      }
    }
  }
}

md += `---\n\n*Total: ${sceneGlobal} cenas · ${sceneGlobal} arquivos MP3*\n`;
fs.writeFileSync(path.join(OUT_DIR, 'ROTEIRO_NARRACAO_FINAL_REVISADO.md'), md, 'utf8');
console.log(`✓ ROTEIRO_NARRACAO_FINAL_REVISADO.md — ${sceneGlobal} cenas`);

// ─── 2. ROTEIRO CSV ───────────────────────────────────────────────────────────
const csvHeader = 'trilha,storyId,storyTitle,referencia,sceneNumber,audioFileName,pastaDestino,textoNarracao,direcaoVoz,sonoplastiaOpcional,observacoes';

function csvField(val) {
  const s = String(val).replace(/"/g, '""');
  return `"${s}"`;
}

const csvLines = [csvHeader];
for (const trackId of TRILHA_ORDER) {
  const stories = byTrilha[trackId];
  if (!stories) continue;
  const trilhaName = TRILHA_NAMES[trackId] || trackId;
  const sortedStories = Object.values(stories).sort((a, b) =>
    parseInt(a[0].storyNumber) - parseInt(b[0].storyNumber)
  );
  for (const scenesOfStory of sortedStories) {
    for (const sc of scenesOfStory.sort((a, b) => a.sceneNumber - b.sceneNumber)) {
      csvLines.push([
        csvField(trilhaName),
        csvField(sc.storyId),
        csvField(sc.storyTitleFinal),
        csvField(sc.biblicalReference),
        csvField(sc.scenePadded),
        csvField(sc.audioFileName),
        csvField(sc.pastaDestino),
        csvField(sc.textoNarracao),
        csvField(sc.direcaoVoz),
        csvField(sc.sonoplastiaOpcional),
        csvField(''),
      ].join(','));
    }
  }
}
fs.writeFileSync(path.join(OUT_DIR, 'ROTEIRO_NARRACAO_FINAL_REVISADO.csv'), csvLines.join('\n'), 'utf8');
console.log(`✓ ROTEIRO_NARRACAO_FINAL_REVISADO.csv — ${csvLines.length - 1} linhas`);

// ─── 3. AUDIO FILE MAP ────────────────────────────────────────────────────────
let mapMd = `# Mapa de Arquivos de Áudio — App Final

**Total:** 200 arquivos MP3
**Convenção:** \`{storyId}_scene_NN.mp3\`
**Pasta:** \`assets/audio/{storyId}/\`

| # | storyId | storyTitle | Cena | audioFileName | Pasta destino |
|---|---|---|---|---|---|
`;

let mapRow = 0;
for (const trackId of TRILHA_ORDER) {
  const stories = byTrilha[trackId];
  if (!stories) continue;
  const sortedStories = Object.values(stories).sort((a, b) =>
    parseInt(a[0].storyNumber) - parseInt(b[0].storyNumber)
  );
  for (const scenesOfStory of sortedStories) {
    for (const sc of scenesOfStory.sort((a, b) => a.sceneNumber - b.sceneNumber)) {
      mapRow++;
      mapMd += `| ${mapRow} | \`${sc.storyId}\` | ${sc.storyTitleFinal} | ${sc.scenePadded} | \`${sc.audioFileName}\` | \`${sc.pastaDestino}\` |\n`;
    }
  }
}
fs.writeFileSync(path.join(OUT_DIR, 'AUDIO_FILE_MAP_APP_FINAL_REVISED.md'), mapMd, 'utf8');
console.log(`✓ AUDIO_FILE_MAP_APP_FINAL_REVISED.md — ${mapRow} arquivos`);

// ─── 4. VALIDACAO ─────────────────────────────────────────────────────────────
const allStoryIds = [...new Set(scenes.map(s => s.storyId))];
const totalStories = allStoryIds.length;
const totalScenes = scenes.length;
const emptyTexts = scenes.filter(s => !s.textoNarracao.trim()).length;
const badAudioNames = scenes.filter(s => !s.audioFileName.match(/^[a-z_]+_scene_\d{2}\.mp3$/)).length;
const badPrefixAudio = scenes.filter(s => s.audioFileName.startsWith('audio_')).length;
const badPastas = scenes.filter(s => !s.pastaDestino.match(/^assets\/audio\/[a-z_]+\/$/)).length;

const FORBIDDEN_TERMS = [
  'Noé e o Arco-Íris', 'Jonas e o Peixe', 'José e o Manto Colorido', 'Maria Diz Sim',
  'Direção de voz', 'Sonoplastia', 'SFX',
];
const forbidden = {};
for (const term of FORBIDDEN_TERMS) {
  const hits = scenes.filter(s => s.textoNarracao.includes(term));
  if (hits.length) forbidden[term] = hits.map(h => `${h.storyId} cena ${h.sceneNumber}`);
}
const forbiddenCount = Object.keys(forbidden).length;

let valMd = `# Validação do Pacote Final para Narrador

**Data:** 2026-06-01
**Fonte:** \`${CSV_SRC}\`

## Resultado geral

| Critério | Esperado | Encontrado | Status |
|---|---|---|---|
| Total de histórias | 20 | ${totalStories} | ${totalStories === 20 ? '✓ OK' : '✗ FALHA'} |
| Total de cenas | 200 | ${totalScenes} | ${totalScenes === 200 ? '✓ OK' : '✗ FALHA'} |
| Textos de narração | 200 | ${totalScenes - emptyTexts} | ${emptyTexts === 0 ? '✓ OK' : '✗ FALHA'} |
| Textos vazios | 0 | ${emptyTexts} | ${emptyTexts === 0 ? '✓ OK' : '✗ FALHA'} |
| audioFileName sem prefixo audio_ | 0 | ${badPrefixAudio} | ${badPrefixAudio === 0 ? '✓ OK' : '✗ FALHA'} |
| audioFileName no padrão correto | 200 | ${200 - badAudioNames} | ${badAudioNames === 0 ? '✓ OK' : '✗ FALHA'} |
| pastaDestino no padrão correto | 200 | ${200 - badPastas} | ${badPastas === 0 ? '✓ OK' : '✗ FALHA'} |
| Termos proibidos em textoNarracao | 0 | ${forbiddenCount} | ${forbiddenCount === 0 ? '✓ OK' : '✗ FALHA'} |

## Status geral

`;

const allPassed = totalStories === 20 && totalScenes === 200 && emptyTexts === 0
  && badAudioNames === 0 && badPrefixAudio === 0 && badPastas === 0 && forbiddenCount === 0;

valMd += allPassed
  ? '**✓ APROVADO — todos os critérios passaram.**\n\n'
  : '**✗ ATENÇÃO — um ou mais critérios falharam.**\n\n';

if (forbiddenCount > 0) {
  valMd += '## Termos proibidos encontrados\n\n';
  for (const [term, locs] of Object.entries(forbidden)) {
    valMd += `- **"${term}"**: ${locs.join(', ')}\n`;
  }
  valMd += '\n';
}

valMd += `## Inventário de storyIds (${totalStories})\n\n`;
valMd += '| storyId | Trilha | Cenas |\n|---|---|---|\n';
for (const trackId of TRILHA_ORDER) {
  const stories = byTrilha[trackId];
  if (!stories) continue;
  const trilhaName = TRILHA_NAMES[trackId] || trackId;
  for (const [sid, sc] of Object.entries(stories)) {
    valMd += `| \`${sid}\` | ${trilhaName} | ${sc.length} |\n`;
  }
}

valMd += `\n## Amostra de audioFileNames\n\n`;
valMd += '```\n';
scenes.slice(0, 10).forEach(s => { valMd += s.audioFileName + '\n'; });
valMd += '...\n';
scenes.slice(-5).forEach(s => { valMd += s.audioFileName + '\n'; });
valMd += '```\n';

fs.writeFileSync(path.join(OUT_DIR, 'VALIDACAO_PACOTE_NARRADOR_FINAL.md'), valMd, 'utf8');
console.log(`✓ VALIDACAO_PACOTE_NARRADOR_FINAL.md — ${allPassed ? 'APROVADO' : 'ATENÇÃO'}`);

console.log('\n✓ Geração concluída.');
