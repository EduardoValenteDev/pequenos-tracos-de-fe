/**
 * monteACenaLevels.js — MANIFESTO de níveis (M1R2R). Separa dados da tela (nada de nível no JSX).
 *
 * TODOS os três níveis são jogáveis no Modo Criador (sem "Ajustando"/"Em breve"). O motor de gesto
 * é o MESMO para os três (nenhum arrasto específico por nível). Uso PROVISÓRIO/DEV: única cena
 * autorizada = `noah_scene_01` (story `status: available`, sem marcação de erro/dúvida/substituição/
 * quarentena) — ver scene-audit §6.2. NENHUMA cópia de asset (resolvedor oficial).
 *
 * GEOMETRIA (item 14): CÉLULAS IGUAIS (grade uniforme; razão de áreas ≈ 1). Para proteger o ROSTO
 * de Noé sem desbalancear a grade, cada nível aplica um CROP 4:5 da cena que mantém o rosto DENTRO
 * de uma célula. Limitação registrada: com uma só cena, o crop dos níveis 6/9 aproxima a moldura do
 * rosto (o rosto fica na célula superior-esquerda, sem ser cortado) — o refino/uso de cenas
 * dedicadas por nível é tarefa de CONTEÚDO (M3), não de engenharia.
 */

import { getSceneIllustrationAsset } from './storySceneIllustrations';
import { buildGridGeometry } from '../services/monteACenaGeometry';

// Rosto de Noé em coords da ARTE (auditoria visual). Convertido p/ o espaço do CROP por nível.
const NOAH_FACE_ART = { x: 0.28, y: 0.12, w: 0.24, h: 0.22 };
function faceInCrop(crop) {
  return {
    id: 'noah_face',
    x: (NOAH_FACE_ART.x - crop.x) / crop.w,
    y: (NOAH_FACE_ART.y - crop.y) / crop.h,
    w: NOAH_FACE_ART.w / crop.w,
    h: NOAH_FACE_ART.h / crop.h,
  };
}

const CROP_2x2 = { x: 0.12, y: 0.0, w: 0.84, h: 0.84 };
const CROP_MULTI = { x: 0.28, y: 0.10, w: 0.72, h: 0.72 };

export const MONTE_A_CENA_LEVELS = Object.freeze([
  {
    id: 'nivel_1',
    title: 'Primeiros encaixes',
    storyId: 'noah', sceneNumber: 1, artWidth: 1122, artHeight: 1402,
    pieceCount: 4, rows: 2, columns: 2,
    seamsX: [0.5], seamsY: [0.5], crop: CROP_2x2,
    guideOpacity: 0.12, snapFactor: 0.5, areaRatioMax: 1.02,
    layoutVersion: 3, seed: 'noah_scene_01|m1r2r|2x2',
    theme: 'calm', chip: '4 peças', indicator: 'Tranquilo',
    accessType: 'free', status: 'available',
  },
  {
    id: 'nivel_2',
    title: 'Vamos tentar mais',
    storyId: 'noah', sceneNumber: 1, artWidth: 1122, artHeight: 1402,
    pieceCount: 6, rows: 3, columns: 2,          // 3 linhas × 2 colunas
    seamsX: [0.5], seamsY: [1 / 3, 2 / 3], crop: CROP_MULTI,
    guideOpacity: 0.11, snapFactor: 0.42, areaRatioMax: 1.02,
    layoutVersion: 3, seed: 'noah_scene_01|m1r2r|3x2',
    theme: 'adventure', chip: '6 peças', indicator: 'Aventura',
    accessType: 'free', status: 'available',
  },
  {
    id: 'nivel_3',
    title: 'Grande desafio',
    storyId: 'noah', sceneNumber: 1, artWidth: 1122, artHeight: 1402,
    pieceCount: 9, rows: 3, columns: 3,
    seamsX: [1 / 3, 2 / 3], seamsY: [1 / 3, 2 / 3], crop: CROP_MULTI,
    guideOpacity: 0.10, snapFactor: 0.34, areaRatioMax: 1.02,
    layoutVersion: 3, seed: 'noah_scene_01|m1r2r|3x3',
    theme: 'challenge', chip: '9 peças', indicator: 'Desafio',
    accessType: 'free', status: 'available',
  },
]);

/** No M1R2R todos os níveis são jogáveis. */
export function isLevelPlayable(level) {
  return !!level && level.status === 'available';
}

export function getLevelSource(level) {
  return getSceneIllustrationAsset(level.storyId, level.sceneNumber);
}

/** Geometria do nível: grade UNIFORME (células iguais) + crop que protege o rosto. */
export function buildLevelGeometry(level) {
  return buildGridGeometry({
    sceneId: `${level.storyId}_scene_${String(level.sceneNumber).padStart(2, '0')}`,
    artWidth: level.artWidth,
    artHeight: level.artHeight,
    rows: level.rows,
    cols: level.columns,
    seed: level.seed,
    crop: level.crop,
    presetSeams: { x: level.seamsX, y: level.seamsY },
    protectedRegions: [faceInCrop(level.crop)],
    areaRatioMax: level.areaRatioMax || 1.02,
  });
}

export function getLevelById(id) {
  return MONTE_A_CENA_LEVELS.find((l) => l.id === id) || null;
}
export function getNextLevel(id) {
  const i = MONTE_A_CENA_LEVELS.findIndex((l) => l.id === id);
  return i >= 0 && i < MONTE_A_CENA_LEVELS.length - 1 ? MONTE_A_CENA_LEVELS[i + 1] : null;
}

/**
 * Ordem EMBARALHADA (desarranjo determinístico): nenhuma peça começa no slot da própria posição
 * espacial. Para grades regulares, uma ROTAÇÃO não-nula garante o desarranjo E que nenhuma LINHA
 * inteira da mesa coincida com a mesma linha do tabuleiro (as peças giram entre linhas).
 */
export function shuffledTrayOrder(pieces, seed) {
  const n = pieces.length;
  if (n <= 1) return pieces.map((p) => p.id);
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  const k = 1 + (Math.abs(h) % (n - 1));
  const out = [];
  for (let i = 0; i < n; i++) out.push(pieces[(i + k) % n].id);
  return out;
}
