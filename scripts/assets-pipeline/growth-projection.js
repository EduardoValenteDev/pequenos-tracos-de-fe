#!/usr/bin/env node
/**
 * growth-projection.js — Projeção de CRESCIMENTO (Feature 001, T011 · FR-003).
 *
 * Projeta o tamanho de conteúdo para as 20 histórias atuais + reserva de >=25%
 * (~5 packs) a partir da média de assets de CONTEÚDO de história medidos hoje.
 * Estimativa LINEAR e explícita — não inventa: marca premissas e caveats.
 * A projeção é do CATÁLOGO COMPLETO; NÃO precisa entrar no bundle inicial (D3).
 *
 * Uso: `npm run assets:growth`
 */
const { build } = require('./inventory');
const { TARGET_INSTALL_MB } = require('./budget-report');

const CURRENT_STORIES = 20;
const RESERVE_PCT = 25;
const CONTENT_CATEGORIES = ['scenes', 'coloring', 'covers', 'audio'];
const MB = 1024 * 1024;
const mb = (bytes) => +(bytes / MB).toFixed(2);

function run() {
  const inv = build();
  let contentBytes = 0;
  inv.categories.forEach((c) => {
    if (CONTENT_CATEGORIES.includes(c.category)) {
      contentBytes += c.tracked.bytes + c.untracked.bytes;
    }
  });
  const perStoryBytes = Math.round(contentBytes / CURRENT_STORIES);
  const reserveStories = Math.ceil((CURRENT_STORIES * RESERVE_PCT) / 100); // +5
  const totalWithReserve = CURRENT_STORIES + reserveStories;
  const projected20 = perStoryBytes * CURRENT_STORIES;
  const projectedReserve = perStoryBytes * totalWithReserve;

  return {
    assumptions: {
      currentStories: CURRENT_STORIES,
      reservePct: RESERVE_PCT,
      reserveStories,
      totalStoriesWithReserve: totalWithReserve,
      perStoryAvgMB: mb(perStoryBytes),
      basis: 'média de assets de conteúdo (scenes+coloring+covers+audio), tracked+untracked / 20',
    },
    projection: {
      stories20MB: mb(projected20),
      storiesWithReserveMB: mb(projectedReserve),
    },
    budget: {
      installTargetMB: TARGET_INSTALL_MB,
      note: 'Projeção do CATÁLOGO COMPLETO de conteúdo — NÃO precisa entrar no bundle inicial; premium/novos vão para packs remotos (D3).',
      wouldExceedTargetIfAllBundled: mb(projectedReserve) > TARGET_INSTALL_MB,
    },
    caveats: [
      'Estimativa LINEAR (média por história); não modela variação real por história.',
      'Não considera otimização WebP futura (reduziria o total).',
      'Tamanho REAL de bundle/packs exige `expo export` (N/A nesta fase).',
    ],
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}

module.exports = { run };
