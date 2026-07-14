/**
 * monteACenaSpikeData.js — DADOS do Architecture Spike M1A de "Monte a Cena".
 *
 * ⚠️ USO PROVISÓRIO / SOMENTE DEV. Contém UMA cena técnica para o spike (baseline C-SVG, 4 peças).
 * Regras do uso provisório (ver specs/010-monte-a-cena/scene-audit.md §6.2):
 *   1. atrás de gate interno (isInternalToolsEnabled);   2. NÃO copiar o asset p/ assets/games/…;
 *   3. NÃO declarar narrativamente aprovada;             4. sem texto narrativo final;
 *   5. fora do Mural definitivo;                         6. não publicada;
 *   7. descartável/substituível;                         8. sem conflito bíblico conhecido;
 *   9. Daniel proibido;                                 10. reprovação M3 invalida imediatamente.
 *
 * A imagem é lida do MESMO require das histórias (`getSceneIllustrationAsset`) — NENHUMA cópia
 * do asset é criada. `noah_scene_01` foi escolhida por: story `status: available`, sem marcação
 * de errada/duvidosa/substituição/quarentena; ver relatório do M1A.
 *
 * As `protectedRegions` e as linhas de corte (`seams`) vêm da auditoria visual (scene-audit §6):
 *   rosto/cabeça de Noé ≈ x[0.28–0.52] y[0.12–0.34]; grupo de vila (dir) ≈ x[0.72–0.98] y[0.42–0.55];
 *   costura vertical deslocada p/ x≈0.60 (à direita do rosto); horizontal p/ y≈0.62 (abaixo do rosto).
 */

import { getSceneIllustrationAsset } from './storySceneIllustrations';

/** Status técnico — deixa explícito que a cena é provisória de DEV, nunca conteúdo final. */
export const SPIKE_SCENE_STATUS = 'dev-provisional';

export const MONTE_A_CENA_SPIKE_SCENE = Object.freeze({
  sceneId: 'noah_scene_01',
  storyId: 'noah',
  // Ponteiro para o asset OFICIAL das histórias (sem cópia). null-safe: a tela trata ausência.
  source: getSceneIllustrationAsset('noah', 1),
  sourcePath: 'assets/stories/noah/scenes/noah_scene_01.webp',
  artWidth: 1122,
  artHeight: 1402,
  aspectRatio: 1122 / 1402, // 0.8003 (4:5)
  // Região focal principal (rosto/tronco de Noé) — o corte não deve dividi-la.
  focalRect: { x: 0.28, y: 0.12, w: 0.24, h: 0.30 },
  protectedRegions: [
    { id: 'noah_face', label: 'Rosto/cabeça de Noé', x: 0.28, y: 0.12, w: 0.24, h: 0.22 },
    { id: 'village_group', label: 'Grupo da vila (direita)', x: 0.72, y: 0.42, w: 0.26, h: 0.13 },
  ],
  // Linhas de corte DESLOCADAS (não uniformes 0.5/0.5) para não atravessar as regiões protegidas.
  seams: { vx: 0.60, hy: 0.62 },
  tabDepthPx: 96, // profundidade da aba, proporcional à cena (~8.5% da largura)
  layoutVersion: 1,
  seed: 'noah_scene_01|m1a|v1',
  pieceCount: 4,
  status: SPIKE_SCENE_STATUS,
});

export default MONTE_A_CENA_SPIKE_SCENE;
