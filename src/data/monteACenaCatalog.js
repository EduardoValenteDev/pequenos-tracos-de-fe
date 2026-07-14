/**
 * monteACenaCatalog.js — FONTE ÚNICA das cenas de "Monte a Cena" (M1R3 · expandido no M1R8B).
 *
 * GERAÇÃO (não lista manual de 200): 20 histórias oficiais × até 10 cenas cada = até 200 quadros.
 * As ilustrações são as OFICIAIS do projeto (`storySceneIllustrations.getSceneIllustrationAsset`) —
 * NENHUMA cópia/duplicação/base64. Uma cena ilustrada = um quadro montável (a dificuldade 4/6/9 é
 * escolhida DEPOIS da cena; não se duplica a imagem por dificuldade).
 *
 * ACESSO (fonte única): `isFreePuzzleStory` — A Criação e Noé são GRÁTIS; as outras 18 são Plano
 * Família. Não se repete `premium: true/false` manualmente em centenas de cenas.
 *
 * BLOQUEIO (M1R8B §5): cenas com ILUSTRAÇÃO marcada errada/duvidosa/quarentena entram como
 * `contentStatus: 'blocked'` e NÃO aparecem para a criança. A fonte é o mapa reconciliado `ATENCAO`
 * (só entradas `:ilu:`) de `src/screens/SceneValidationScreen.js` (pós-reancoragem). Folhas de
 * colorir (`:col:`) NÃO afetam o quebra-cabeça. Cena inexistente → 'missing' (não quebra o app).
 *
 * M1R5R — baseline SEM zoom: fonte 4:5 e board 4:5 → cena inteira preenche o board (scale=1). Sem
 * crop personalizado (BASELINE sem zoom).
 */

import { getSceneIllustrationAsset } from './storySceneIllustrations';
import { stories as NARRATIVE_STORIES } from './stories';

const ALL_COUNTS = [4, 6, 9];
const ART_W = 1122; const ART_H = 1402; // 4:5 oficial (confirmado: 200/200 ilustrações 1122×1402)
const CROP_A = { x: 0, y: 0, w: 1, h: 1 };
const CROP_B = { x: 0, y: 0, w: 1, h: 1 };

/** ACESSO — fonte ÚNICA de verdade. A Criação e Noé são grátis; o resto é Plano Família. */
export function isFreePuzzleStory(storyId) {
  return storyId === 'creation' || storyId === 'noah';
}

/** 20 histórias oficiais (storyId idêntico a stories.js / storySceneIllustrations) + título + ordem. */
export const MONTE_A_CENA_STORY_ORDER = Object.freeze([
  { storyId: 'creation', storyTitle: 'A Criação', sortOrder: 10 },
  { storyId: 'noah', storyTitle: 'Noé', sortOrder: 20 },
  { storyId: 'david_goliath', storyTitle: 'Davi e Golias', sortOrder: 30 },
  { storyId: 'jesus_children', storyTitle: 'Jesus e as Crianças', sortOrder: 40 },
  { storyId: 'daniel_lions', storyTitle: 'Daniel e os Leões', sortOrder: 50 },
  { storyId: 'esther_queen', storyTitle: 'Ester, a Rainha Corajosa', sortOrder: 60 },
  { storyId: 'lost_sheep', storyTitle: 'A Ovelha Perdida', sortOrder: 70 },
  { storyId: 'good_samaritan', storyTitle: 'O Bom Samaritano', sortOrder: 80 },
  { storyId: 'abraham_stars', storyTitle: 'Abraão e as Estrelas', sortOrder: 90 },
  { storyId: 'joseph_colorful_coat', storyTitle: 'José e a Túnica Especial', sortOrder: 100 },
  { storyId: 'moses_red_sea', storyTitle: 'Moisés e o Mar Vermelho', sortOrder: 110 },
  { storyId: 'ruth_naomi', storyTitle: 'Rute e Noemi', sortOrder: 120 },
  { storyId: 'miraculous_catch', storyTitle: 'A Pesca Milagrosa', sortOrder: 130 },
  { storyId: 'jonah_big_fish', storyTitle: 'Jonas e o Grande Peixe', sortOrder: 140 },
  { storyId: 'samuel_hears_god', storyTitle: 'Samuel Ouve a Voz de Deus', sortOrder: 150 },
  { storyId: 'josiah_young_king', storyTitle: 'Josias, o Rei Jovem', sortOrder: 160 },
  { storyId: 'solomon_wisdom', storyTitle: 'Salomão e a Sabedoria', sortOrder: 170 },
  { storyId: 'mary_says_yes', storyTitle: 'Maria Recebe a Boa Notícia', sortOrder: 180 },
  { storyId: 'timothy_faith', storyTitle: 'Timóteo e a Fé', sortOrder: 190 },
  { storyId: 'jesus_temple', storyTitle: 'Jesus no Templo', sortOrder: 200 },
]);

/**
 * Cenas com ILUSTRAÇÃO bloqueada (só entradas `:ilu:` do mapa reconciliado `ATENCAO` de
 * SceneValidationScreen.js — pós-reancoragem). Formato: storyId → { sceneNumber: motivo }. As
 * folhas de colorir (`:col:`) NÃO entram (não são a ilustração do quebra-cabeça).
 * Fonte visual única — atualizar aqui ao promover/rebaixar uma cena.
 */
export const MONTE_A_CENA_SCENE_BLOCKS = Object.freeze({
  lost_sheep: {
    3: 'duvidosa — o pastor percebe a falta ou só afaga o rebanho?',
    6: 'duvidosa — o pastor está saindo para procurar?',
    7: 'duvidosa — a ovelha já aparece à frente do pastor?',
    8: 'quarentena/deslocamento — mostra a ovelha nos ombros (cena 9)',
    9: 'quarentena/deslocamento — mostra a festa (cena 10)',
    10: 'quarentena/deslocamento — mostra o abraço (cena 8)',
  },
  samuel_hears_god: { 10: 'quarentena — Samuel deve ser adulto; arte mostra o menino' },
  mary_says_yes: { 10: 'duvidosa — Maria parece de viagem; narração fala de guardar a palavra' },
  good_samaritan: { 3: 'duvidosa — o ferido está sozinho ou já há um passante?' },
});

/** Título oficial da cena (de stories.js), com fallback seguro (não quebra na avaliação do smoke). */
function officialSceneTitle(storyId, sceneNumber) {
  try {
    const st = (NARRATIVE_STORIES || []).find((s) => s.id === storyId);
    const sc = st && Array.isArray(st.scenes) ? st.scenes.find((x) => x.sceneNumber === sceneNumber) : null;
    if (sc && sc.title) return sc.title;
  } catch { /* fallback abaixo */ }
  return `Quadro ${sceneNumber}`;
}

/** Gera TODAS as cenas (20 × 10). approved (existe + não bloqueada) · blocked · missing. */
function buildRaw() {
  const raw = [];
  for (const { storyId, storyTitle, sortOrder } of MONTE_A_CENA_STORY_ORDER) {
    const premium = !isFreePuzzleStory(storyId);
    const blocks = MONTE_A_CENA_SCENE_BLOCKS[storyId] || {};
    for (let n = 1; n <= 10; n++) {
      const source = getSceneIllustrationAsset(storyId, n); // require oficial ou null
      const exists = !!source;
      const blockedReason = blocks[n] || null;
      const contentStatus = !exists ? 'missing' : (blockedReason ? 'blocked' : 'approved');
      raw.push({
        puzzleSceneId: `${storyId}_scene_${String(n).padStart(2, '0')}`,
        storyId,
        storyTitle,
        sceneNumber: n,
        title: officialSceneTitle(storyId, n),
        crop: n % 2 === 0 ? CROP_B : CROP_A,
        premium,
        contentStatus,
        blockedReason,
        sortOrder: sortOrder + n,
        artWidth: ART_W,
        artHeight: ART_H,
        allowedPieceCounts: ALL_COUNTS,
      });
    }
  }
  return raw;
}

const RAW = buildRaw();

/** Só cenas APROVADAS entram no catálogo público, ordenadas. */
export const MONTE_A_CENA_CATALOG = Object.freeze(
  RAW.filter((s) => s.contentStatus === 'approved').map((s) => Object.freeze(s)).sort((a, b) => a.sortOrder - b.sortOrder),
);

/** Cenas BLOQUEADAS (transparência/relatório — NÃO aparecem para a criança). */
export const MONTE_A_CENA_BLOCKED = Object.freeze(
  RAW.filter((s) => s.contentStatus === 'blocked').map((s) => ({ puzzleSceneId: s.puzzleSceneId, storyId: s.storyId, storyTitle: s.storyTitle, sceneNumber: s.sceneNumber, reason: s.blockedReason })),
);

/** Compatibilidade: cenas fora do catálogo público (bloqueadas + ausentes). */
export const MONTE_A_CENA_REJECTED = Object.freeze(
  RAW.filter((s) => s.contentStatus !== 'approved').map((s) => ({ puzzleSceneId: s.puzzleSceneId, storyTitle: s.storyTitle, reason: s.blockedReason || s.contentStatus })),
);

/** Totais reais (para o relatório de conteúdo). */
export const MONTE_A_CENA_TOTALS = Object.freeze((() => {
  const approved = RAW.filter((s) => s.contentStatus === 'approved');
  const free = approved.filter((s) => !s.premium).length;
  return {
    stories: MONTE_A_CENA_STORY_ORDER.length,
    scenesConsidered: RAW.length,
    available: approved.length,
    blocked: RAW.filter((s) => s.contentStatus === 'blocked').length,
    missing: RAW.filter((s) => s.contentStatus === 'missing').length,
    free,
    premium: approved.length - free,
  };
})());

export function getCatalogScene(puzzleSceneId) {
  return MONTE_A_CENA_CATALOG.find((s) => s.puzzleSceneId === puzzleSceneId) || null;
}

export function getCatalogSceneSource(scene) {
  return scene ? getSceneIllustrationAsset(scene.storyId, scene.sceneNumber) : null;
}

/** Configuração de dificuldade (grade uniforme = células iguais). */
const DIFFICULTY = {
  4: { rows: 2, cols: 2, seamsX: [0.5], seamsY: [0.5], label: 'Para começar', guideOpacity: 0.12, snapFactor: 0.5 },
  6: { rows: 3, cols: 2, seamsX: [0.5], seamsY: [1 / 3, 2 / 3], label: 'Vamos montar', guideOpacity: 0.11, snapFactor: 0.42 },
  9: { rows: 3, cols: 3, seamsX: [1 / 3, 2 / 3], seamsY: [1 / 3, 2 / 3], label: 'Grande desafio', guideOpacity: 0.10, snapFactor: 0.34 },
};
export function getDifficultyConfig(pieceCount) {
  return DIFFICULTY[pieceCount] || DIFFICULTY[4];
}

/** Monta o objeto "level" consumido pelo motor/geometria a partir de (cena, nº de peças). */
export function buildCatalogLevel(scene, pieceCount) {
  const d = getDifficultyConfig(pieceCount);
  return {
    id: `${scene.puzzleSceneId}_${pieceCount}`,
    puzzleSceneId: scene.puzzleSceneId,
    title: scene.title,
    storyId: scene.storyId,
    storyTitle: scene.storyTitle,
    sceneNumber: scene.sceneNumber,
    artWidth: scene.artWidth,
    artHeight: scene.artHeight,
    pieceCount,
    rows: d.rows,
    columns: d.cols,
    seamsX: d.seamsX,
    seamsY: d.seamsY,
    crop: scene.crop,
    guideOpacity: d.guideOpacity,
    snapFactor: d.snapFactor,
    areaRatioMax: 1.02,
    layoutVersion: 1,
    seed: `${scene.puzzleSceneId}|m1r3|${d.rows}x${d.cols}`,
    premium: scene.premium,
  };
}
