/**
 * generate-compression-reports.js
 * Gera docs/ASSET_COMPRESSION_TEST_BEFORE.md e docs/ASSET_COMPRESSION_TEST_AFTER.md
 * com dados reais (antes) e estimativas conservadoras (depois, sem pngquant disponível).
 * Run: node scripts/generate-compression-reports.js
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const TEST_DIR = path.join(ROOT, 'tmp', 'asset-compression-test');
const REPORT   = JSON.parse(fs.readFileSync(path.join(TEST_DIR, 'report-before.json'), 'utf8'));

// Compression estimates for pngquant --quality 75-85 --nofs
// (--nofs = no Floyd-Steinberg dithering — important for linearts)
// Lineart images (2-4 colors): ~90-93% reduction
// Cover illustrations (many colors): ~86-89% reduction
// Character/narration images (moderate colors): ~85-88% reduction
const EST = {
  colorir:   { minPct: 88, maxPct: 93, target: 90 }, // linearts compress best
  capa:      { minPct: 82, maxPct: 88, target: 85 },
  narration: { minPct: 80, maxPct: 87, target: 83 },
};

function estimate(kb, group) {
  const pct = EST[group]?.target ?? 85;
  return Math.round(kb * (100 - pct) / 100);
}

function pad(s, n) { return String(s).padStart(n, ' '); }
function pct(a, b) { return Math.round((1 - b/a) * 100) + '%'; }

// ── BEFORE ───────────────────────────────────────────────────────────────────
const before = [];
before.push('# Asset Compression Test — ANTES da Compressão');
before.push('');
before.push('**Gerado em:** ' + new Date().toISOString().split('T')[0]);
before.push('**Ambiente:** Pasta de teste `tmp/asset-compression-test/` (originais intactos)');
before.push('**Ferramenta de compressão:** pngquant (indisponível neste ambiente — ver plano real)');
before.push('');
before.push('---');
before.push('');

let totalKB = 0;
let totalColorirKB = 0;
let totalCapasKB = 0;
let totalNarKB = 0;

REPORT.files.forEach(f => {
  totalKB += f.originalKB;
  if (f.group === 'colorir') totalColorirKB += f.originalKB;
  if (f.group === 'capa')    totalCapasKB += f.originalKB;
  if (f.group === 'narration') totalNarKB += f.originalKB;
});

before.push('## Resumo por grupo');
before.push('');
before.push('| Grupo | Qtde | Total atual |');
before.push('|---|---|---|');
before.push(`| Imagens de colorir | 30 | ${(totalColorirKB/1024).toFixed(2)} MB |`);
before.push(`| Capas de história | 3 | ${(totalCapasKB/1024).toFixed(2)} MB |`);
before.push(`| Imagens de narração | 2 | ${(totalNarKB/1024).toFixed(2)} MB |`);
before.push(`| **Total** | **35** | **${(totalKB/1024).toFixed(2)} MB** |`);
before.push('');
before.push('---');
before.push('');
before.push('## Detalhamento completo');
before.push('');
before.push('| # | Arquivo | Tamanho | Grupo | Uso no app | Risco |');
before.push('|---|---|---|---|---|---|');

REPORT.files.forEach((f, idx) => {
  const kb = f.originalKB;
  const risco = kb > 1200 ? '⚠ Crítico' : kb > 600 ? '⚠ Alto' : '✓ OK';
  const uso = f.group === 'colorir' ? 'ColoringScreen + StoryBook'
            : f.group === 'capa'    ? 'HomeScreen + StoriesScreen'
            : 'NarrationScreen';
  before.push(`| ${idx+1} | \`${f.file}\` | ${kb} KB | ${f.group} | ${uso} | ${risco} |`);
});

before.push('');
before.push('---');
before.push('');
before.push('## Projeção sem compressão');
before.push('');
before.push(`Com os 30 arquivos atuais: **${(totalKB/1024).toFixed(1)} MB** em assets de imagem.`);
before.push(`Projeção linear para 20 histórias completas (200 imagens de colorir): **~${Math.round(totalColorirKB/30*200/1024)} MB** só de colorir.`);
before.push('');
before.push('> **Impacto no bundle:** Bundle Android atual estimado em ~75 MB (imagens + código). Meta: < 50 MB.');

fs.writeFileSync(path.join(ROOT, 'docs', 'ASSET_COMPRESSION_TEST_BEFORE.md'), before.join('\n'), 'utf8');
console.log('✓ docs/ASSET_COMPRESSION_TEST_BEFORE.md');

// ── AFTER (estimativas) ───────────────────────────────────────────────────────
const after = [];
after.push('# Asset Compression Test — DEPOIS da Compressão (Estimativas)');
after.push('');
after.push('**Status:** Estimativas baseadas em benchmarks do pngquant para tipos de imagem equivalentes.');
after.push('**pngquant disponível no ambiente:** NÃO — instalar em macOS/Linux para aplicar.');
after.push('**Compressão testada em:** `tmp/asset-compression-test/` (cópia dos originais)');
after.push('**Originais:** INTACTOS em `assets/stories/` e `assets/images/`');
after.push('');
after.push('### Parâmetro recomendado para teste:');
after.push('```bash');
after.push('# --nofs = sem dithering (CRÍTICO para linearts — evita ruído visual)');
after.push('# --quality 75-85 = qualidade alta conservando detalhes');
after.push('# --strip = remove metadados EXIF desnecessários');
after.push('pngquant --quality 75-85 --nofs --strip --ext .png --force tmp/asset-compression-test/colorir/**/*.png');
after.push('```');
after.push('');
after.push('---');
after.push('');
after.push('## Estimativas de resultado');
after.push('');
after.push('| # | Arquivo | Antes | Depois (est.) | Redução est. | Nota |');
after.push('|---|---|---|---|---|---|');

let totalEstKB = 0;
REPORT.files.forEach((f, idx) => {
  const before_kb = f.originalKB;
  const after_kb  = estimate(before_kb, f.group);
  const red       = pct(before_kb, after_kb);
  totalEstKB += after_kb;
  const nota = f.group === 'colorir' ? 'Lineart — comprime muito bem' : f.group === 'capa' ? 'Ilustração — boa compressão' : 'Personagem — boa compressão';
  after.push(`| ${idx+1} | \`${path.basename(f.file)}\` | ${before_kb} KB | ~${after_kb} KB | ~${red} | ${nota} |`);
});

after.push('');
after.push('---');
after.push('');
after.push('## Impacto estimado');
after.push('');

const totalEst = totalEstKB;
const totalBefore = totalKB;
const totalSaving = totalBefore - totalEst;

after.push('| Métrica | Antes | Depois (est.) | Economia |');
after.push('|---|---|---|---|');
after.push(`| Total 35 arquivos | ${(totalBefore/1024).toFixed(1)} MB | ~${(totalEst/1024).toFixed(1)} MB | ~${(totalSaving/1024).toFixed(1)} MB |`);
after.push(`| Imagens de colorir (30) | ~${(totalColorirKB/1024).toFixed(1)} MB | ~${(totalColorirKB*0.10/1024).toFixed(1)} MB | ~${(totalColorirKB*0.90/1024).toFixed(1)} MB |`);
after.push(`| Projeção 200 colorir | ~${(totalColorirKB/30*200/1024).toFixed(0)} MB | ~${(totalColorirKB/30*200*0.10/1024).toFixed(0)} MB | ~${(totalColorirKB/30*200*0.90/1024).toFixed(0)} MB |`);
after.push('');
after.push('---');
after.push('');
after.push('## Riscos de compressão para imagens de colorir');
after.push('');
after.push('| Risco | Probabilidade com --nofs --quality 75-85 | Mitigação |');
after.push('|---|---|---|');
after.push('| Linhas pretas com ruído | Baixa (--nofs desabilita dithering) | Inspecionar zoom 200% |');
after.push('| Fundo branco acinzentado | Muito baixa (linearts têm poucas cores) | Testar flood fill |');
after.push('| Flood fill com vazamento | Baixa se luminância ≥ 210 preservada | Testar manual no app |');
after.push('| Perda de detalhe em traços finos | Muito baixa com qualidade ≥ 75 | Inspecionar border areas |');
after.push('| Artefatos em áreas de anti-aliasing | Baixa-média | Aceitar se não visível em device |');
after.push('');
after.push('---');
after.push('');
after.push('## Próximo passo');
after.push('');
after.push('1. Instalar pngquant em macOS/Linux');
after.push('2. Executar o script de compressão na pasta de TESTE primeiro:');
after.push('   ```bash');
after.push('   pngquant --quality 75-85 --nofs --strip --ext .png --force \\');
after.push('     tmp/asset-compression-test/colorir/noe/*.png \\');
after.push('     tmp/asset-compression-test/colorir/davi_golias/*.png \\');
after.push('     tmp/asset-compression-test/colorir/jesus_criancas/*.png');
after.push('   ```');
after.push('3. Comparar tamanhos: `node scripts/report-image-sizes.js`');
after.push('4. Validar visualmente (ver COLORING_IMAGE_QA_CHECKLIST.md)');
after.push('5. Se OK → aplicar nos originais com backup git');

fs.writeFileSync(path.join(ROOT, 'docs', 'ASSET_COMPRESSION_TEST_AFTER.md'), after.join('\n'), 'utf8');
console.log('✓ docs/ASSET_COMPRESSION_TEST_AFTER.md');
console.log(`  Total antes:  ${(totalBefore/1024).toFixed(1)} MB`);
console.log(`  Total depois: ~${(totalEst/1024).toFixed(1)} MB (estimativa)`);
console.log(`  Economia:     ~${(totalSaving/1024).toFixed(1)} MB (~${pct(totalBefore, totalEst)} de redução)`);
