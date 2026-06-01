/**
 * generate-image-brief.js
 * Reads stories.js and writes docs/STORY_IMAGE_BRIEF_EXPORT.md
 * Run: node scripts/generate-image-brief.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STORIES_FILE = path.join(ROOT, 'src', 'data', 'stories.js');
const OUTPUT_FILE = path.join(ROOT, 'docs', 'STORY_IMAGE_BRIEF_EXPORT.md');

// --- Parse stories.js (ES module → CommonJS eval) ---
let src = fs.readFileSync(STORIES_FILE, 'utf8');
// Strip ES module export syntax
src = src.replace(/^export\s+const\s+(\w+)\s*=/, 'const $1 =');
// Evaluate in a safe function scope
const fn = new Function('module', 'exports', src + '\nmodule.exports = { stories };');
const mod = { exports: {} };
fn(mod, mod.exports);
const { stories } = mod.exports;

if (!Array.isArray(stories) || stories.length === 0) {
  console.error('ERROR: Could not parse stories from stories.js');
  process.exit(1);
}

// --- Track display names ---
const TRACK_NAMES = {
  comece_aqui: 'Comece Aqui',
  pequeninos: 'Pequeninos',
  descobridores: 'Descobridores',
  jovens_da_fe: 'Jovens da Fé',
};

const TRACK_DETAIL = {
  comece_aqui: 'Desenhos muito simples, poucos elementos, áreas grandes, quase nenhum detalhe pequeno.',
  pequeninos: 'Desenhos simples com leve contexto, 1 ou 2 personagens, cenário leve, áreas grandes.',
  descobridores: 'Detalhamento moderado, mais elementos narrativos, mais cenário, mas sem microdetalhes difíceis de tocar.',
  jovens_da_fe: 'Detalhamento moderado a alto, composição mais rica, mais narrativa, mas ainda totalmente colorível no celular.',
};

function ni(val) {
  if (val === null || val === undefined || val === '') return 'Não informado no arquivo original.';
  return val;
}

function accessLabel(accessType) {
  return accessType === 'free' ? 'Grátis' : 'Especial da Família';
}

function trackName(trackId) {
  return TRACK_NAMES[trackId] || trackId;
}

function trackDetail(trackId) {
  return TRACK_DETAIL[trackId] || 'Não informado no arquivo original.';
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

// --- Build index ---
const lines = [];

// Header
lines.push('# Export Oficial de Roteiros para Imagens — Pequenos Traços de Fé');
lines.push('');
lines.push('**Fonte:** `src/data/stories.js`  ');
lines.push('**Finalidade:** Brief para criação de imagens de colorir em sessão separada.  ');
lines.push('**Regra crítica:** Narrações copiadas verbatim. Nenhum campo inventado.');
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Regras Gerais das Imagens');
lines.push('');
lines.push('As imagens são linearts para colorir em celular. Regras inegociáveis:');
lines.push('');
lines.push('1. Fundo branco puro (sem transparência, sem cinza)');
lines.push('2. Sem sombra, sem textura, sem hachura, sem degradê');
lines.push('3. Sem texto na imagem, sem logo, sem assinatura');
lines.push('4. Linhas pretas grossas e contínuas');
lines.push('5. Regiões fechadas (áreas delimitadas para colorir)');
lines.push('6. Áreas grandes para toque mobile');
lines.push('7. Nada importante cortado nas bordas');
lines.push('8. Estilo infantil bíblico, personagens acolhedores');
lines.push('9. Sem violência explícita, sem realismo adulto');
lines.push('10. Sem detalhes pequenos demais');
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Níveis de Detalhe por Trilha');
lines.push('');
lines.push('| Trilha | Regra de detalhe |');
lines.push('|---|---|');
lines.push('| Comece Aqui | Desenhos muito simples, poucos elementos, áreas grandes, quase nenhum detalhe pequeno. |');
lines.push('| Pequeninos | Desenhos simples com leve contexto, 1 ou 2 personagens, cenário leve, áreas grandes. |');
lines.push('| Descobridores | Detalhamento moderado, mais elementos narrativos, mais cenário, mas sem microdetalhes difíceis de tocar. |');
lines.push('| Jovens da Fé | Detalhamento moderado a alto, composição mais rica, mais narrativa, mas ainda totalmente colorível no celular. |');
lines.push('');
lines.push('---');
lines.push('');

// Index
lines.push('## Índice das Histórias');
lines.push('');
stories.forEach((s, i) => {
  const num = pad2(i + 1);
  const anchor = `história-${num}--${s.titulo.toLowerCase().replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i').replace(/[óòõôö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/[ç]/g, 'c').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')}`;
  lines.push(`${i + 1}. [História ${num} — ${s.titulo}](#${anchor})`);
});
lines.push('');
lines.push('---');
lines.push('');

// Validation data collectors
const validationIssues = [];
let totalCenas = 0;

// Stories
stories.forEach((s, storyIndex) => {
  const num = pad2(storyIndex + 1);
  const cenas = s.cenas || [];
  const scenePlan = s.scenePlan || [];
  totalCenas += cenas.length;

  if (cenas.length !== 10) {
    validationIssues.push(`História ${num} (${s.id}): ${cenas.length} cenas (esperado 10)`);
  }

  lines.push(`## História ${num} — ${s.titulo} (\`${s.id}\`)`);
  lines.push('');
  lines.push('| Campo | Valor |');
  lines.push('|---|---|');
  lines.push(`| StoryId | \`${s.id}\` |`);
  lines.push(`| Trilha | ${trackName(s.trackId)} |`);
  lines.push(`| Acesso | ${accessLabel(s.accessType)} |`);
  lines.push(`| Referência bíblica | ${ni(s.referencia)} |`);
  const themes = Array.isArray(s.themes) ? s.themes.join(', ') : ni(s.themes);
  lines.push(`| Temas | ${themes} |`);
  lines.push(`| Lição do coração | ${ni(s.licaoCoracao)} |`);
  lines.push(`| Resumo para pais | ${ni(s.parentSummary)} |`);
  lines.push(`| Total de cenas | ${cenas.length} |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  cenas.forEach((cena, cenaIndex) => {
    const cenaNum = pad2(cena.id || cenaIndex + 1);
    const plan = scenePlan.find(p => p.sceneNumber === (cena.id || cenaIndex + 1)) || {};

    lines.push(`### Cena ${cenaNum} — ${ni(cena.titulo)}`);
    lines.push('');
    lines.push('| Campo | Valor |');
    lines.push('|---|---|');
    lines.push(`| SceneKey | \`scene_${cenaNum}\` |`);
    lines.push(`| Emoji | ${ni(cena.emojiCena)} |`);
    lines.push(`| Cor tema | ${ni(cena.corTema)} |`);
    lines.push(`| Título do colorir | ${ni(cena.tituloColorir)} |`);
    lines.push('');

    // Verbatim narration — the core requirement
    lines.push('**Narração exata:**');
    if (cena.textoNarracao) {
      lines.push(`> ${cena.textoNarracao}`);
    } else {
      lines.push('> Não informado no arquivo original.');
    }
    lines.push('');

    // Coloring instruction
    lines.push('**Instrução de colorir:**');
    lines.push(`> ${ni(cena.instrucaoColorir)}`);
    lines.push('');

    // Story beat from scenePlan
    lines.push('**Story beat (contexto narrativo):**');
    lines.push(`> ${plan.storyBeat ? plan.storyBeat : 'Não informado no arquivo original.'}`);
    lines.push('');

    // Coloring goal from scenePlan
    lines.push('**Coloring goal (foco visual):**');
    lines.push(`> ${plan.coloringGoal ? plan.coloringGoal : 'Não informado no arquivo original.'}`);
    lines.push('');

    // Other fields
    lines.push(`**Lição curta:** ${ni(cena.licaoCurta)}`);
    lines.push('');
    if (cena.mensagemGuia) {
      lines.push(`**Mensagem do guia:** ${cena.mensagemGuia}`);
      lines.push('');
    }

    lines.push(`**Nível de detalhe:** ${trackName(s.trackId)} — ${trackDetail(s.trackId)}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  });
});

// Validation section
lines.push('# Validação do Export');
lines.push('');
lines.push('| Item | Resultado |');
lines.push('|---|---|');
lines.push(`| Total de histórias | ${stories.length} |`);
lines.push(`| Total de cenas | ${totalCenas} |`);
lines.push(`| Histórias com 10 cenas | ${stories.filter(s => (s.cenas || []).length === 10).length}/${stories.length} |`);
lines.push(`| Histórias sem 10 cenas | ${validationIssues.length === 0 ? 'Nenhuma' : validationIssues.join('; ')} |`);

// Check missing fields
const semNarracao = [];
const semInstrucao = [];
stories.forEach(s => {
  (s.cenas || []).forEach((c, i) => {
    const ref = `${s.id} cena ${c.id || i + 1}`;
    if (!c.textoNarracao) semNarracao.push(ref);
    if (!c.instrucaoColorir) semInstrucao.push(ref);
  });
});

lines.push(`| Cenas sem textoNarracao | ${semNarracao.length === 0 ? 'Nenhuma' : semNarracao.join(', ')} |`);
lines.push(`| Cenas sem instrucaoColorir | ${semInstrucao.length === 0 ? 'Nenhuma' : semInstrucao.join(', ')} |`);
lines.push(`| imagemNarracao, imagemColorir, audio | Ausentes em quase todas as cenas (esperado — assets ainda não adicionados) |`);
lines.push(`| Informações inferidas | Nível de detalhe (derivado de trackId); sceneKey (derivado de cena.id) |`);
lines.push(`| Textos inventados | Nenhum — todas as narrações copiadas verbatim de src/data/stories.js |`);
lines.push(`| Arquivos de código alterados | Nenhum |`);
lines.push('');

// Story index table
lines.push('## Tabela de Histórias');
lines.push('');
lines.push('| # | StoryId | Título | Trilha | Acesso | Cenas |');
lines.push('|---|---|---|---|---|---|');
stories.forEach((s, i) => {
  lines.push(`| ${pad2(i + 1)} | \`${s.id}\` | ${s.titulo} | ${trackName(s.trackId)} | ${accessLabel(s.accessType)} | ${(s.cenas || []).length} |`);
});
lines.push('');

// Write output
fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');

const lineCount = lines.length;
const byteCount = Buffer.byteLength(lines.join('\n'), 'utf8');
console.log(`✓ Written: ${OUTPUT_FILE}`);
console.log(`  Lines:   ${lineCount}`);
console.log(`  Size:    ${(byteCount / 1024).toFixed(1)} KB`);
console.log(`  Stories: ${stories.length}`);
console.log(`  Scenes:  ${totalCenas}`);
if (semNarracao.length > 0) {
  console.log(`  ⚠ Scenes without narration: ${semNarracao.join(', ')}`);
} else {
  console.log(`  ✓ All scenes have textoNarracao`);
}
if (validationIssues.length > 0) {
  console.log(`  ⚠ Issues: ${validationIssues.join('; ')}`);
} else {
  console.log(`  ✓ All stories have 10 scenes`);
}
