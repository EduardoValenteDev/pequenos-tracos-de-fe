#!/usr/bin/env node
/**
 * check-untracked-guard.js — Guard de Git (Feature 001, T005a · FR-013 · D9).
 *
 * FALHA se qualquer arquivo em `assets/stories/*` estiver STAGED (entrou por `git add`).
 * Lê `git diff --cached --name-only`. Torna VERIFICÁVEL a regra de governança de que
 * os assets de histórias permanecem untracked até auditoria por lote.
 *
 * Regras (T005a):
 *   (a) `assets/stories/*` NÃO podem entrar por `git add` acidental;
 *   (b) integrado ao `npm run smoke` (e disponível como `npm run assets:guard`);
 *   (c) NÃO bloqueia uma adição FUTURA, AUDITADA e APROVADA — apresenta o motivo e
 *       exige override explícito e documentado: variável de ambiente ALLOW_STORY_ASSETS=1.
 *
 * Reutilizável: exporta getStagedStoryAssets() (consumido pelo smoke) e roda como CLI.
 */
const { execSync } = require('child_process');

const STORY_ASSETS_PREFIX = 'assets/stories/';

function getStagedStoryAssets() {
  let staged = [];
  let error = null;
  try {
    const out = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    staged = out
      .split(/\r?\n/)
      .map((s) => s.trim().replace(/\\/g, '/'))
      .filter(Boolean)
      .filter((p) => p.startsWith(STORY_ASSETS_PREFIX));
  } catch (e) {
    error = e && e.message ? e.message : String(e);
  }
  return { ok: staged.length === 0, staged, error };
}

module.exports = { getStagedStoryAssets, STORY_ASSETS_PREFIX };

if (require.main === module) {
  const override = process.env.ALLOW_STORY_ASSETS === '1';
  const { ok, staged, error } = getStagedStoryAssets();

  if (error) {
    // Git indisponível (ex.: rodando fora de um clone) — não bloqueia.
    console.log('[assets:guard] git indisponível, nada a verificar:', error);
    process.exit(0);
  }
  if (ok) {
    console.log('[assets:guard] OK — nenhum assets/stories/* staged.');
    process.exit(0);
  }
  if (override) {
    console.warn('[assets:guard] OVERRIDE (ALLOW_STORY_ASSETS=1) — adição seletiva APROVADA de:');
    staged.forEach((p) => console.warn('  + ' + p));
    process.exit(0);
  }
  console.error('[assets:guard] BLOQUEADO — assets/stories/* NÃO podem entrar por git add acidental:');
  staged.forEach((p) => console.error('  ✗ ' + p));
  console.error('\nMotivo: assets de histórias exigem auditoria por lote (peso, proporção 4:5, flood-fill).');
  console.error('Para uma adição seletiva JÁ AUDITADA E APROVADA, rode com: ALLOW_STORY_ASSETS=1');
  process.exit(1);
}
