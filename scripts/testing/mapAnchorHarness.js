/**
 * TA-1..3 e mutantes de F6-SG-B / Map Geometry Foundation.
 *
 * Executa o módulo REAL em Node, sem React Native e sem escrever no repositório.
 * Os mutantes vivem somente em strings em memória.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const SERVICE_REL = 'src/services/mapAnchor.js';
const SCREEN_REL = 'src/screens/AdventureMapScreen.js';
const REGION_REL = 'src/components/map/MapRegion.js';

function loadAdventureGeometry() {
  const source = read('src/data/adventureMap.js')
    .replace(/^import[\s\S]*?;$/gm, '')
    .replace(/require\([^)]*\)/g, 'null')
    .replace(/export /g, '')
    // `computeRegionArtWidth` entra guardado: enquanto ele nao existir (RED da CAUSA
    // C2) o carregador precisa devolver `null` em vez de estourar ReferenceError — um
    // teste vermelho tem de reprovar dizendo o que falta, nao morrer no carregamento.
    + '\nreturn { STORY_MAP_COORDS, computeRegionHeight, getStoryMapCoord, computeImageRect,'
    + '\n  computeRegionArtWidth: typeof computeRegionArtWidth === "function" ? computeRegionArtWidth : null };';
  return new Function('stories', source)([]);
}

const adventureGeometry = loadAdventureGeometry();
const { computeRegionHeight, getStoryMapCoord } = adventureGeometry;

function loadMapAnchor(source = read(SERVICE_REL)) {
  const code = source
    .replace(/^import[\s\S]*?;$/gm, '')
    .replace(/export /g, '')
    + '\nreturn { MAP_ANCHOR_FRAMING, computeRegionLayout, getStoryAnchor, computeCameraTarget, resolveActiveRegion };';
  return new Function('computeRegionHeight', 'getStoryMapCoord', code)(computeRegionHeight, getStoryMapCoord);
}

const visualRegions = () => [
  { id: 'jovens_da_fe', title: 'Jovens da Fé', stories: [{ id: 'samuel_hears_god' }, { id: 'fallback_young' }] },
  { id: 'descobridores', title: 'Descobridores', stories: [{ id: 'fallback_discovery' }] },
  { id: 'pequeninos', title: 'Pequeninos', stories: [{ id: 'fallback_little' }] },
  { id: 'comece_aqui', title: 'Comece Aqui', stories: [{ id: 'creation' }, { id: 'noah' }] },
];

const realVisualRegions = () => [
  { id: 'jovens_da_fe', title: 'Jovens da Fé', stories: [
    'samuel_hears_god', 'josiah_young_king', 'solomon_wisdom', 'mary_says_yes',
    'timothy_faith', 'jesus_temple',
  ].map((id) => ({ id })) },
  { id: 'descobridores', title: 'Descobridores', stories: [
    'abraham_stars', 'joseph_colorful_coat', 'moses_red_sea', 'ruth_naomi',
    'miraculous_catch', 'jonah_big_fish',
  ].map((id) => ({ id })) },
  { id: 'pequeninos', title: 'Pequeninos', stories: [
    'david_goliath', 'jesus_children', 'daniel_lions', 'esther_queen',
    'lost_sheep', 'good_samaritan',
  ].map((id) => ({ id })) },
  { id: 'comece_aqui', title: 'Comece Aqui', stories: ['creation', 'noah'].map((id) => ({ id })) },
];

const semComentarios = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

function avaliarGates(sources = {}) {
  const service = sources.service || read(SERVICE_REL);
  const screen = sources.screen || read(SCREEN_REL);
  const region = sources.region || read(REGION_REL);
  const serviceCode = semComentarios(service);
  const screenCode = semComentarios(screen);
  const regionCode = semComentarios(region);
  const regionTopCount = (screenCode.match(/'regionTop'/g) || []).length;

  return {
    'G-MAP-1': /export const MAP_ANCHOR_FRAMING\s*=\s*0\.5\s*;/.test(serviceCode)
      && !/\b(?:LOCAL_)?MAP_ANCHOR_FRAMING\b/.test(screenCode)
      && !/\b0\.58\b/.test(screenCode)
      && /const target = computeCameraTarget\(cameraAnchor, vp, mapContentH\);/.test(screenCode),
    'G-MAP-2': !/\bgetStoryMapCoord\b/.test(screenCode)
      && !/\bgetStoryMapCoord\b/.test(regionCode)
      && /getStoryAnchor\(s\.id, anchorContext\)/.test(regionCode),
    'G-MAP-3': !/\bvpEst\b|insets\.(?:top|bottom)\s*\+\s*56|56\s*\+\s*insets\.(?:top|bottom)/.test(screenCode)
      && /onLayout=\{onMapViewportLayout\}/.test(screenCode)
      && /mapViewportH\s*>\s*0\s*&&\s*contentW\s*>\s*0\s*&&\s*<ScrollView/.test(screenCode),
    'G-MAP-4': /anchor\.contentY\s*-\s*viewportH\s*\*\s*MAP_ANCHOR_FRAMING/.test(serviceCode)
      && !/anchor\.contentY\s*-\s*viewportH\s*\*\s*MAP_ANCHOR_FRAMING\s*[+-]/.test(serviceCode)
      && !/windowBand|surfaceArchetype|navSidebarWidth|safeArea|insets/.test(serviceCode),
    'G-MAP-5': /getStoryAnchor\(cameraStoryId, anchorContext\)/.test(screenCode)
      && regionTopCount >= 2
      && /cameraAnchor\.regionIndex\s*===\s*comeceRegionIdx\s*\?\s*'regionTop'\s*:\s*'anchor'/.test(screenCode),
  };
}

function executarTA1a3() {
  const casos = [];
  const add = (nome, ok, detalhe = '') => casos.push({ nome, ok: !!ok, detalhe });
  let api;
  try {
    api = loadMapAnchor();
    add('TA-1.0 módulo real carrega', true);
  } catch (error) {
    add('TA-1.0 módulo real carrega', false, error.message);
    return { casos };
  }

  const regions = visualRegions();
  const widths = [390, 643, 1077];
  add('TA-1.1 framing canônico é exatamente 0,50', api.MAP_ANCHOR_FRAMING === 0.5);

  for (const width of widths) {
    const layout = api.computeRegionLayout(regions, width);
    const expectedH = computeRegionHeight(width);
    add(`TA-1 layout contíguo e visual em ${width}dp`, layout.length === 4
      && layout.every((r, i) => r.id === regions[i].id && r.height === expectedH && r.top === i * expectedH));

    const creation = api.getStoryAnchor('creation', { regions, regionLayout: layout, width });
    const young = api.getStoryAnchor('samuel_hears_god', { regions, regionLayout: layout, width });
    const fallback = api.getStoryAnchor('fallback_young', { regions, regionLayout: layout, width });
    add(`TA-1 creation usa a última região visual em ${width}dp`, creation?.regionIndex === 3
      && creation.regionId === 'comece_aqui' && creation.contentTop === layout[3].top);
    add(`TA-1 jovens_da_fe usa a primeira região visual em ${width}dp`, young?.regionIndex === 0
      && young.regionId === 'jovens_da_fe');
    add(`TA-1 fallback preserva índice/contagem em ${width}dp`, fallback?.storyIndex === 1
      && fallback.storyCount === 2 && fallback.x === 0.7 && fallback.y === 0.36
      && fallback.xPx === Math.round(0.7 * width));

    const viewport = width === 390 ? 696 : width === 643 ? 1247 : 753;
    const contentH = layout[3].top + layout[3].height;
    const target = api.computeCameraTarget(young, viewport, contentH);
    const expected = Math.max(0, Math.min(young.contentY - viewport * 0.5, contentH - viewport));
    add(`TA-2 câmera usa somente 0,50 da viewport real em ${width}dp`, target === expected);
    add(`TA-2 D12 mira o topo de comece_aqui em ${width}dp`,
      api.computeCameraTarget(creation, viewport, contentH, { mode: 'regionTop' })
        === Math.min(creation.contentTop, Math.max(0, contentH - viewport)));
  }

  const realRegions = realVisualRegions();
  for (const width of widths) {
    const realLayout = api.computeRegionLayout(realRegions, width);
    const viewport = width === 390 ? 696 : width === 643 ? 1247 : 753;
    const contentH = realLayout[3].top + realLayout[3].height;
    const cells = realRegions.flatMap((region) => region.stories).map((story) => {
      const anchor = api.getStoryAnchor(story.id, { regions: realRegions, regionLayout: realLayout, width });
      const sourceCoord = adventureGeometry.STORY_MAP_COORDS[story.id];
      const target = api.computeCameraTarget(anchor, viewport, contentH);
      return !!anchor && !!sourceCoord
        && anchor.x === sourceCoord.x && anchor.y === sourceCoord.y
        && anchor.xPx >= 0 && anchor.xPx <= width
        && anchor.yPx >= 0 && anchor.yPx <= anchor.contentH
        && target >= 0 && target <= Math.max(0, contentH - viewport);
    });
    add(`TA-1/2 auditoria aritmética das 20 histórias na faixa ${width}dp`,
      cells.length === 20 && cells.every(Boolean));
  }

  const layout = api.computeRegionLayout(regions, 360);
  const anchor = api.getStoryAnchor('samuel_hears_god', { regions, regionLayout: layout, width: 360 });
  add('TA-2 clamp superior nunca produz scroll negativo', api.computeCameraTarget({ ...anchor, contentY: 10 }, 600, 3000) === 0);
  add('TA-2 clamp inferior nunca ultrapassa o conteúdo', api.computeCameraTarget({ ...anchor, contentY: 9999 }, 600, 3000) === 2400);
  add('TA-2 conteúdo menor que viewport fica em zero', api.computeCameraTarget(anchor, 4000, 3000) === 0);
  add('TA-2 âncora ausente usa fallback honesto no fim', api.computeCameraTarget(null, 600, 3000) === 2400);

  add('TA-3 região ativa compartilha as fronteiras do layout',
    api.resolveActiveRegion(0, layout) === 0
      && api.resolveActiveRegion(layout[1].top, layout) === 1
      && api.resolveActiveRegion(layout[2].top - 91, layout, 90) === 1
      && api.resolveActiveRegion(999999, layout) === 3);
  add('TA-3 entrada degenerada é explícita', api.resolveActiveRegion(0, []) === -1
    && api.getStoryAnchor('inexistente', { regions, regionLayout: layout, width: 360 }) === null
    && api.computeRegionLayout(regions, 0).length === 0);

  const gates = avaliarGates();
  Object.entries(gates).forEach(([gate, ok]) => add(`TA-3 ${gate} está verde`, ok));
  return { casos };
}

function executarMutantes() {
  const original = {
    service: read(SERVICE_REL),
    screen: read(SCREEN_REL),
    region: read(REGION_REL),
  };
  const mutantes = [];
  const matar = (nome, alvo, mutate) => {
    const changed = mutate(original[alvo]);
    if (changed === original[alvo]) {
      mutantes.push({ nome, ok: false, detalhe: 'mutação não encontrou o símbolo-alvo' });
      return;
    }
    const gates = avaliarGates({ ...original, [alvo]: changed });
    mutantes.push({ nome, ok: gates[nome.gate] === false, detalhe: JSON.stringify(gates) });
  };

  matar({ toString: () => 'MT-2', gate: 'G-MAP-1' }, 'screen', (s) => s.replace(
    'const target = computeCameraTarget(cameraAnchor, vp, mapContentH);',
    'const LOCAL_MAP_ANCHOR_FRAMING = 0.58;\n    const target = cameraAnchor.contentY - vp * LOCAL_MAP_ANCHOR_FRAMING;',
  ));
  matar({ toString: () => 'MT-24', gate: 'G-MAP-2' }, 'region', (s) => s.replace(
    'getStoryAnchor(s.id, anchorContext)', 'getStoryMapCoord(s.id)'),
  );
  matar({ toString: () => 'MT-3', gate: 'G-MAP-2' }, 'screen', (s) => s.replace(
    "const cameraAnchor = useMemo(", "const divergentCoord = getStoryMapCoord(cameraStoryId);\n  const cameraAnchor = useMemo("),
  );
  matar({ toString: () => 'MT-4', gate: 'G-MAP-3' }, 'screen', (s) => s.replace(
    'if (!cameraAnchor || mapViewportH <= 0) return 0;',
    'const vpEst = height - (insets.top + 56) - (insets.bottom + 56);\n    if (!cameraAnchor || vpEst <= 0) return 0;',
  ));
  matar({ toString: () => 'MT-25', gate: 'G-MAP-4' }, 'service', (s) => s.replace(
    'anchor.contentY - viewportH * MAP_ANCHOR_FRAMING;',
    'anchor.contentY - viewportH * MAP_ANCHOR_FRAMING + 12;',
  ));
  matar({ toString: () => 'MT-30', gate: 'G-MAP-5' }, 'screen', (s) => s.replace(
    "const mode = cameraAnchor.regionIndex === comeceRegionIdx ? 'regionTop' : 'anchor';",
    "const mode = 'anchor';",
  ));
  return { mutantes };
}

function main() {
  const focused = executarTA1a3().casos;
  const mutants = executarMutantes().mutantes;
  focused.forEach((c) => console.log(`  ${c.ok ? '✓' : '✗'} ${c.nome}${c.ok || !c.detalhe ? '' : ` — ${c.detalhe}`}`));
  mutants.forEach((m) => console.log(`  ${m.ok ? '✓' : '✗'} ${m.nome} ${m.ok ? 'KILLED' : `SURVIVED — ${m.detalhe}`}`));
  const focusedPass = focused.filter((c) => c.ok).length;
  const mutantPass = mutants.filter((m) => m.ok).length;
  console.log(`FOCUSED ${focusedPass}/${focused.length} PASS; MUTANTS ${mutantPass}/${mutants.length} KILLED`);
  process.exit(focusedPass === focused.length && mutantPass === mutants.length ? 0 : 1);
}

if (require.main === module) main();

module.exports = { executarTA1a3, executarMutantes, avaliarGates, loadMapAnchor, adventureGeometry };
