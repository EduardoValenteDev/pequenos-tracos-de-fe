#!/usr/bin/env node
/**
 * Lacre da premissa Android-only do gate de bundleabilidade.
 *
 * `npm run bundle:check` roda `expo export:embed --platform android` e isso basta
 * porque hoje o CODIGO PROPRIO tem grafo identico entre Android e iOS: os 827
 * arquivos do repositorio alcancados a partir de `index.js` sao os MESMOS nas duas
 * plataformas, e 100% da divergencia medida (2378 vs 2379 modulos) esta dentro de
 * `node_modules`. Isso so e verdade porque o repositorio nao tem NENHUM arquivo
 * proprio com sufixo de plataforma — que e exatamente o que o resolver do Metro usa
 * para escolher implementacoes diferentes por plataforma.
 *
 * No dia em que um `Algo.ios.js` proprio existir, a premissa cai e o gate Android
 * sozinho passa a ter um ponto cego. Este script existe para que essa descoberta
 * seja DETERMINISTICA e imediata, em vez de depender de memoria humana.
 *
 * Sem dependencia nova: apenas `child_process` + `fs` da biblioteca padrao.
 * Consulta `git ls-files` para enxergar somente codigo proprio versionado
 * (node_modules nunca entra). Se o git nao estiver disponivel, cai para uma
 * varredura de diretorio com as mesmas exclusoes.
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/** Sufixos que fazem o resolver do Metro divergir por plataforma. */
const PLATFORM_SUFFIX = /\.(ios|android|native)\.(js|jsx|ts|tsx)$/i;

/** Diretorios ignorados no modo de varredura (fallback sem git). */
const SKIP_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', 'android', 'ios', 'build']);

function gitLsFiles(extraArgs) {
  const res = spawnSync('git', ['ls-files', '-z'].concat(extraArgs), {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (res.error || res.status !== 0 || typeof res.stdout !== 'string') return null;
  return res.stdout.split('\0').filter(Boolean);
}

/**
 * Versionados + ainda-nao-versionados-mas-nao-ignorados. A uniao importa: um
 * `Algo.ios.js` recem-criado e invisivel para `git ls-files` puro, e e justamente
 * no momento da criacao que o lacre precisa falar.
 */
function listOwnFiles() {
  const tracked = gitLsFiles([]);
  if (tracked === null) return null;
  const untracked = gitLsFiles(['--others', '--exclude-standard']) || [];
  return Array.from(new Set(tracked.concat(untracked)));
}

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), acc);
    } else if (entry.isFile()) {
      acc.push(path.relative(ROOT, path.join(dir, entry.name)).split(path.sep).join('/'));
    }
  }
  return acc;
}

const own = listOwnFiles();
const files = own || walk(ROOT, []);
const source = own
  ? 'git ls-files (versionados + nao ignorados)'
  : 'varredura de diretorio (git indisponivel)';

const offenders = files.filter((f) => PLATFORM_SUFFIX.test(f)).sort();

if (offenders.length > 0) {
  console.error('');
  console.error('  PREMISSA ANDROID-ONLY QUEBRADA — o gate de bundleabilidade precisa ser revisado.');
  console.error('');
  console.error('  Foram encontrados arquivos PROPRIOS com sufixo de plataforma:');
  for (const f of offenders) console.error(`    - ${f}`);
  console.error('');
  console.error('  Enquanto o codigo proprio nao tinha nenhum desses arquivos, o grafo executavel');
  console.error('  era identico entre Android e iOS e `npm run bundle:check` podia provar');
  console.error('  bundleabilidade rodando SO para Android. Com um arquivo desses, o resolver do');
  console.error('  Metro passa a escolher implementacoes diferentes por plataforma e o gate Android');
  console.error('  sozinho fica CEGO ao que so existe no iOS.');
  console.error('');
  console.error('  Acao necessaria (uma das duas), com registro na governanca da Fase 6:');
  console.error('    1. cobrir as duas plataformas no gate — trocar o `--platform android` de');
  console.error('       `bundle:check` por uma prova multiplataforma (custo medido: ~1,8x); ou');
  console.error('    2. remover o arquivo com sufixo de plataforma, se ele nao for intencional.');
  console.error('');
  console.error(`  (fonte da listagem: ${source})`);
  console.error('');
  process.exit(1);
}

console.log(
  `[gate:platform-scope] OK — nenhum arquivo proprio com sufixo .ios/.android/.native em ${files.length} arquivos (${source}). Premissa Android-only do bundle:check permanece valida.`
);
