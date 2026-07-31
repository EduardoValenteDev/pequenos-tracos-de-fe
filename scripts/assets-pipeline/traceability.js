#!/usr/bin/env node
/**
 * traceability.js — Rastreabilidade asset ↔ história ↔ manifest ↔ require ↔ estado
 * (Feature 001, T012 · FR-011). LEITURA pura: não altera requires/assets/telas.
 *
 * Cruza, quando possível:
 *   - histórias declaradas (src/data/stories.js: id, status, accessType);
 *   - camada do contentManifest (starter/remote/coming_soon);
 *   - requires estáticos de capas/cenas/áudio;
 *   - existência em disco e estado tracked/untracked (clone limpo).
 * Sinaliza: require → arquivo AUSENTE (quebra) e require → arquivo UNTRACKED
 * (quebraria clone limpo). Imprime JSON determinístico em stdout.
 *
 * Uso: `npm run assets:traceability`
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');

// contentManifest é ESM sem imports → avalia removendo export/import (mesma técnica do smoke).
function loadContentManifest() {
  let code = fs
    .readFileSync(path.join(root, 'src/data/contentManifest.js'), 'utf8')
    .replace(/^\s*import\s.*$/gm, '')
    .replace(/export\s+default\s+/g, 'const __default = ')
    .replace(/export\s+(async\s+function|function|const|let|var)\s+/g, '$1 ');
  code += '\nreturn { getContentLayer };';
  // eslint-disable-next-line no-new-func
  return new Function(code)();
}

function storyCatalog() {
  const src = fs.readFileSync(path.join(root, 'src/data/stories.js'), 'utf8');
  const ids = [...src.matchAll(/\n\s*id:\s*'([a-z0-9_]+)',/g)].map((m) => m[1]);
  const seen = new Set();
  return ids
    .filter((id) => !seen.has(id) && seen.add(id))
    .map((id) => {
      const i = src.indexOf(`id: '${id}'`);
      const seg = src.slice(i, i + 400);
      return {
        id,
        status: (seg.match(/status:\s*'([a-z_]+)'/) || [])[1] || null,
        accessType: (seg.match(/accessType:\s*'([a-z_]+)'/) || [])[1] || null,
      };
    });
}

function requiresIn(relFile) {
  const abs = path.join(root, relFile);
  if (!fs.existsSync(abs)) return [];
  const src = fs.readFileSync(abs, 'utf8');
  const dir = path.dirname(abs);
  return [...src.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => {
    const resolved = path.resolve(dir, m[1]);
    return {
      ref: m[1],
      path: path.relative(root, resolved).replace(/\\/g, '/'),
      exists: fs.existsSync(resolved),
    };
  });
}

function trackedSet() {
  try {
    return new Set(
      execSync('git ls-files assets', { cwd: root, encoding: 'utf8' })
        .split(/\r?\n/)
        .map((s) => s.trim().replace(/\\/g, '/'))
        .filter(Boolean),
    );
  } catch (e) {
    return null;
  }
}

function run() {
  const { getContentLayer } = loadContentManifest();
  const stories = storyCatalog();
  // [P3J] A chave `coloring` (que apontava para `src/assets/coloringImages.js`) saiu do mapa: o
  // Colorir legado foi aposentado e esse arquivo não existe mais. Manter a chave produziria um
  // `requireCounts.coloring: 0` permanente, que se leria como "lacuna de asset pendente" — o
  // oposto do estado real. Os assets do Colorir com o Beni NÃO entram aqui: eles têm auditoria
  // dedicada e mais estrita em `scripts/verify-coloring60-assets.js` (16 verificações, incluindo
  // require único, sha256 e ausência de clones).
  const maps = {
    covers: 'src/assets/storyCovers.js',
    scenes: 'src/data/storySceneIllustrations.js',
    audio: 'src/data/audioManifest.js',
  };
  const tracked = trackedSet();

  const requireCounts = {};
  const missingRequires = [];
  const untrackedRequired = [];
  Object.keys(maps).forEach((k) => {
    const reqs = requiresIn(maps[k]);
    requireCounts[k] = reqs.length;
    reqs.forEach((r) => {
      if (!r.exists) missingRequires.push({ map: k, ref: r.ref, path: r.path });
      else if (tracked && !tracked.has(r.path)) untrackedRequired.push({ map: k, ref: r.ref, path: r.path });
    });
  });

  return {
    storiesCount: stories.length,
    layers: stories.map((s) => ({
      id: s.id,
      layer: getContentLayer(s.id),
      status: s.status,
      accessType: s.accessType,
    })),
    requireCounts,
    integrity: {
      trackedKnown: tracked != null,
      missingCount: missingRequires.length,
      missingRequires, // require → arquivo AUSENTE (quebraria o bundle)
      untrackedRequiredCount: untrackedRequired.length,
      untrackedRequired, // require → existe MAS untracked (quebraria clone limpo)
    },
    note: 'Leitura pura — não altera requires/assets. Sinaliza desvios; não corrige.',
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}

module.exports = { run };
