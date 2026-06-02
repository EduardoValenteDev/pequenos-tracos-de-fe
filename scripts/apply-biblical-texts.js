/**
 * apply-biblical-texts.js
 * Sprint 19.2 — Aplica os textos finais revisados no stories.js
 *
 * Uso: node scripts/apply-biblical-texts.js [--dry-run] [--validate-only]
 *
 * O que faz:
 *   1. Lê o CSV de textos finais
 *   2. Valida: 20 histórias, 200 cenas, sem vazio, sem duplicata, sem storyId desconhecido
 *   3. Aplica textoNarracao e títulos no src/data/stories.js
 *   4. Gera changelog em JSON
 *
 * O que NÃO faz:
 *   - Não altera instrucaoColorir
 *   - Não altera imagemNarracao, imagemColorir, audio
 *   - Não altera storyId, scene id
 *   - Não altera acessType, premium, status
 *   - Não instala dependências
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DRY_RUN     = process.argv.includes('--dry-run');
const VALIDATE_ONLY = process.argv.includes('--validate-only');

const CSV_PATH      = 'docs/biblical-review/final-5-revisoes/TEXTOS_FINAIS_PARA_IMPLEMENTACAO_5_REVISOES.csv';
const STORIES_PATH  = 'src/data/stories.js';
const CHANGELOG_OUT = 'docs/biblical-review/SPRINT_19_2_CHANGELOG.json';

// ─────────────────────────────────────────────
// CSV parser (handles double-quoted fields)
// ─────────────────────────────────────────────
function parseCSVLine(line) {
  const result = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside quoted field
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  result.push(field);
  return result;
}

// ─────────────────────────────────────────────
// Load and parse CSV
// ─────────────────────────────────────────────
const csvRaw  = fs.readFileSync(CSV_PATH, 'utf8');
const csvLines = csvRaw.split('\n');
const dataRows = csvLines.slice(1).filter(l => l.trim());

// textMap[storyId][sceneNumber] = { newText, audioFileName }
const textMap  = {};
// titleMap[storyId] = { titleFinal, titlePrevious }
const titleMap = {};

for (const row of dataRows) {
  if (!row.trim()) continue;
  const fields = parseCSVLine(row);
  // storyNumber,storyTitleFinal,storyTitlePrevious,biblicalReference,
  // sceneNumber,audioFileName,appPath,textoFinalNarrar,direcaoDeVoz,sonoplastiaOpcional
  const storyNumber     = fields[0].trim();
  const storyTitleFinal = fields[1].trim();
  const storyTitlePrev  = fields[2].trim();
  const sceneNumber     = parseInt(fields[4].trim(), 10);
  const audioFileName   = fields[5].trim();
  const newText         = fields[7].trim();

  // Derive storyId from audioFileName (e.g. "noah_scene_01.mp3" → "noah")
  const storyId = audioFileName.replace(/_scene_\d+\.mp3$/i, '');

  if (!textMap[storyId]) textMap[storyId] = {};
  textMap[storyId][sceneNumber] = { newText, audioFileName };

  if (!titleMap[storyId]) {
    titleMap[storyId] = { titleFinal: storyTitleFinal, titlePrevious: storyTitlePrev };
  }
}

// ─────────────────────────────────────────────
// Known storyIds from stories.js (for validation)
// ─────────────────────────────────────────────
const KNOWN_STORY_IDS = new Set([
  'creation', 'noah', 'david_goliath', 'jesus_children', 'daniel_lions',
  'jonah_big_fish', 'lost_sheep', 'good_samaritan', 'abraham_stars',
  'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi', 'esther_queen',
  'miraculous_catch', 'samuel_hears_god', 'josiah_young_king',
  'solomon_wisdom', 'mary_says_yes', 'timothy_faith', 'jesus_temple',
]);

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────
const errors   = [];
const warnings = [];

// Count stories and scenes
const storyIds  = Object.keys(textMap);
const totalStories = storyIds.length;
let totalScenes  = 0;
const seenKeys   = new Set();

for (const [storyId, scenes] of Object.entries(textMap)) {
  // Unknown storyId?
  if (!KNOWN_STORY_IDS.has(storyId)) {
    errors.push(`UNKNOWN storyId: "${storyId}"`);
  }

  const sceneNums = Object.keys(scenes).map(Number);
  totalScenes += sceneNums.length;

  for (const sceneNum of sceneNums) {
    // Duplicate check
    const key = `${storyId}:${sceneNum}`;
    if (seenKeys.has(key)) {
      errors.push(`DUPLICATE: ${key}`);
    }
    seenKeys.add(key);

    // Empty text?
    const { newText } = scenes[sceneNum];
    if (!newText || !newText.trim()) {
      errors.push(`EMPTY TEXT: ${storyId} scene ${sceneNum}`);
    }

    // Single quotes in new text (would break JS string)
    if (newText.includes("'")) {
      errors.push(`SINGLE QUOTE in new text: ${storyId} scene ${sceneNum} — "${newText.substring(0, 60)}"`);
    }

    // Scene number range
    if (sceneNum < 1 || sceneNum > 10) {
      errors.push(`SCENE OUT OF RANGE: ${storyId} scene ${sceneNum}`);
    }
  }
}

if (totalStories !== 20) {
  errors.push(`Expected 20 stories, got ${totalStories}`);
}
if (totalScenes !== 200) {
  errors.push(`Expected 200 scenes, got ${totalScenes}`);
}

// Title changes — sanity check
const EXPECTED_TITLE_CHANGES = {
  noah:                { from: 'Noé e o Arco-Íris',       to: 'Noé e o Sinal da Aliança' },
  jonah_big_fish:      { from: 'Jonas e o Peixe',         to: 'Jonas e o Grande Peixe' },
  joseph_colorful_coat:{ from: 'José e o Manto Colorido', to: 'José e a Túnica Especial' },
  mary_says_yes:       { from: 'Maria Diz Sim',           to: 'Maria Recebe a Boa Notícia' },
};

for (const [storyId, { from, to }] of Object.entries(EXPECTED_TITLE_CHANGES)) {
  const tm = titleMap[storyId];
  if (!tm) {
    errors.push(`Missing titleMap for ${storyId}`);
    continue;
  }
  if (tm.titleFinal !== to) {
    warnings.push(`Title mismatch for ${storyId}: expected final="${to}", got "${tm.titleFinal}"`);
  }
  if (tm.titlePrevious && tm.titlePrevious !== from) {
    warnings.push(`Title previous mismatch for ${storyId}: expected "${from}", got "${tm.titlePrevious}"`);
  }
}

// ─────────────────────────────────────────────
// Print validation result
// ─────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════');
console.log('  VALIDAÇÃO DO CSV — Sprint 19.2');
console.log('══════════════════════════════════════════════\n');
console.log(`  Stories no CSV:   ${totalStories} (esperado: 20)`);
console.log(`  Cenas no CSV:     ${totalScenes} (esperado: 200)`);
console.log(`  Erros críticos:   ${errors.length}`);
console.log(`  Avisos:           ${warnings.length}`);
console.log();

if (warnings.length) {
  console.log('  AVISOS:');
  warnings.forEach(w => console.log('  ⚠', w));
  console.log();
}

if (errors.length) {
  console.log('  ERROS CRÍTICOS — aplicação cancelada:');
  errors.forEach(e => console.log('  ✗', e));
  console.log();
  process.exit(1);
}

console.log('  ✓ Validação passou — sem erros críticos.');

if (VALIDATE_ONLY) {
  console.log('\n  Modo --validate-only: sem alterações aplicadas.');
  process.exit(0);
}

// ─────────────────────────────────────────────
// LOAD stories.js
// ─────────────────────────────────────────────
const originalContent = fs.readFileSync(STORIES_PATH, 'utf8');
const lines = originalContent.split('\n');
const result = [];
const changelog = [];

let currentStoryId  = null;
let currentSceneId  = null;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  // ── Detect story-level id (string) ──────────────────────────────
  // Pattern: id: 'story_id',  (string id, NOT inside cenas)
  const storyIdMatch = line.match(/^\s{4}id:\s+'([a-z_]+)',\s*$/);
  if (storyIdMatch) {
    currentStoryId = storyIdMatch[1];
    currentSceneId = null;
  }

  // ── Detect scene-level id (number) — multi-line format ──────────
  // Pattern: ^        id: N,   (8 spaces + id: N,)
  const sceneIdMulti = line.match(/^\s{8}id:\s+(\d+),\s*$/);
  if (sceneIdMulti) {
    const n = parseInt(sceneIdMulti[1], 10);
    if (n >= 1 && n <= 10) currentSceneId = n;
  }

  // ── Detect scene-level id (number) — compact single-line format ──
  // Pattern: { id: N, titulo: ...  (compact inline object)
  const sceneIdCompact = line.match(/\{\s*id:\s+(\d+),\s+titulo:/);
  if (sceneIdCompact) {
    const n = parseInt(sceneIdCompact[1], 10);
    if (n >= 1 && n <= 10) currentSceneId = n;
  }

  // ── Replace textoNarracao ────────────────────────────────────────
  if (line.includes('textoNarracao:') && currentStoryId && currentSceneId !== null) {
    const entry = textMap[currentStoryId]?.[currentSceneId];
    if (entry) {
      const { newText } = entry;
      const before = line;

      // Match single-quoted value, handling escaped quotes (\')
      // Pattern: textoNarracao: '((?:[^'\\]|\\.)*)' — handles \' inside the value
      if (/textoNarracao:\s*'(?:[^'\\]|\\.)*'/.test(line)) {
        const oldMatch = line.match(/textoNarracao:\s*'((?:[^'\\]|\\.)*)'/);
        const oldText  = oldMatch ? oldMatch[1] : '';
        line = line.replace(/textoNarracao:\s*'(?:[^'\\]|\\.)*'/, `textoNarracao: '${newText}'`);

        if (line !== before) {
          changelog.push({
            storyId:     currentStoryId,
            sceneId:     currentSceneId,
            field:       'textoNarracao',
            textOld:     oldText.substring(0, 80) + (oldText.length > 80 ? '…' : ''),
            textNew:     newText.substring(0, 80) + (newText.length > 80 ? '…' : ''),
          });
        }
      } else {
        warnings.push(`Could not match textoNarracao for ${currentStoryId} scene ${currentSceneId}`);
      }
    }
  }

  result.push(line);
}

// ─────────────────────────────────────────────
// Apply title changes
// ─────────────────────────────────────────────
let finalContent = result.join('\n');

for (const [storyId, { titleFinal, titlePrevious }] of Object.entries(titleMap)) {
  if (!titlePrevious || titleFinal === titlePrevious) continue;

  const oldPattern = `titulo: '${titlePrevious}'`;
  const newPattern = `titulo: '${titleFinal}'`;

  if (finalContent.includes(oldPattern)) {
    const occurrences = (finalContent.match(new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    finalContent = finalContent.replaceAll(oldPattern, newPattern);
    changelog.push({
      storyId,
      sceneId:  null,
      field:    'titulo',
      textOld:  titlePrevious,
      textNew:  titleFinal,
      note:     `${occurrences} ocorrência(s) substituída(s)`,
    });
    console.log(`  título: "${titlePrevious}" → "${titleFinal}" [${occurrences} ocorrência(s)]`);
  } else {
    warnings.push(`Título não encontrado no stories.js: "${oldPattern}" (${storyId})`);
  }
}

// ─────────────────────────────────────────────
// Count results
// ─────────────────────────────────────────────
const textoChanges = changelog.filter(c => c.field === 'textoNarracao').length;
const titleChanges = changelog.filter(c => c.field === 'titulo').length;

console.log();
console.log('══════════════════════════════════════════════');
console.log('  RESULTADO DA APLICAÇÃO');
console.log('══════════════════════════════════════════════');
console.log(`  textoNarracao substituídos: ${textoChanges} (esperado: 200)`);
console.log(`  títulos substituídos:        ${titleChanges} (esperado: 4)`);
console.log(`  avisos:                      ${warnings.length}`);

if (warnings.length) {
  console.log('\n  AVISOS:');
  warnings.forEach(w => console.log('  ⚠', w));
}

if (textoChanges !== 200) {
  console.log(`\n  ✗ ATENÇÃO: esperava 200 textoNarracao substituídos, obteve ${textoChanges}`);
  process.exit(1);
}

// ─────────────────────────────────────────────
// Write output
// ─────────────────────────────────────────────
if (DRY_RUN) {
  console.log('\n  Modo --dry-run: stories.js NÃO foi alterado.');
} else {
  fs.writeFileSync(STORIES_PATH, finalContent, 'utf8');
  console.log('\n  ✓ stories.js atualizado com sucesso.');
}

// Write changelog JSON
fs.writeFileSync(CHANGELOG_OUT, JSON.stringify(changelog, null, 2), 'utf8');
console.log(`  ✓ Changelog gravado: ${CHANGELOG_OUT}`);
console.log();
