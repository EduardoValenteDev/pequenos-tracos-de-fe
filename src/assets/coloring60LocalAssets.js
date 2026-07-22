/**
 * coloring60LocalAssets.js — Registro estático (Metro-safe) das FONTES RUNTIME locais
 * do piloto Colorir 60. Consulta por identidade composta (`storyId`, `activityId`).
 *
 * Regras de Metro (invioláveis): todo `require()` de asset é LITERAL e relativo, e aponta
 * para um arquivo que EXISTE fisicamente. Este módulo NÃO importa coloringImages.js, NÃO
 * reusa getColoringImage, NÃO constrói caminho por concatenação/template e NÃO usa
 * `require()` dinâmico. Ele também NÃO é um resolvedor (resolução por regra de negócio,
 * fallback e local-first pertencem ao P2) — é apenas o mapa estático de fontes.
 *
 * Estado por atividade em P1:
 *   - `light`            → ATIVA. Reusa DIRETAMENTE scene_02.png (mesmo arquivo dos 200
 *                          legados), por caminho literal relativo — idêntico ao padrão de
 *                          coloringImages.js. Sem cópia, sem mover, sem renomear, sem
 *                          activities/light.png.
 *   - `living_world`     → SEM fonte runtime em P1 (null honesto).
 *   - `people_and_care`  → SEM fonte runtime em P1 (null honesto).
 *
 * Os `require()` literais de `living_world` e `people_and_care` NÃO entram aqui em P1:
 * eles são adicionados SOMENTE em P5 (tasks.md P5.T4/P5.T6), atomicamente com a cópia
 * dos PNGs reais para `assets/stories/creation/coloring/activities/`. Antes disso, um
 * `require()` desses arquivos QUEBRARIA o Metro (arquivo inexistente) — por isso a
 * ausência é representada por `null`, jamais por placeholder ou lineart alheio.
 *
 * Governança: specs 014/015/016/017 · DECISIONS.md PL01A-03/PL01G · tasks.md P1.T2/T3/T4.
 */

// P1.T3 — ÚNICO require() ATIVO do piloto em P1: `light` reusa scene_02.png por caminho
// literal relativo. De src/assets/, "../../" chega à raiz do repo; o alvo resolve para
// assets/stories/creation/coloring/scene_02.png (mesmo literal usado em coloringImages.js).
const CREATION_LIGHT_SOURCE = require('../../assets/stories/creation/coloring/scene_02.png');

// Mapa estático por (storyId → activityId → fonte runtime). Em P1, só `light` resolve.
// P1.T4 — slots futuros preparados como `null` (integração diferida a P5). NUNCA colocar
// aqui um require() de arquivo ainda inexistente.
const COLORING60_LOCAL_SOURCES = {
  creation: {
    light: CREATION_LIGHT_SOURCE,
    living_world: null,
    people_and_care: null,
  },
};

/**
 * getColoring60LocalSource(storyId, activityId) — fonte runtime estática da atividade,
 * ou `null` quando não há fonte ativa (identidade desconhecida OU atividade cuja
 * integração de PNG só ocorre em P5). Retorno honesto: `null` NÃO é erro nem placeholder.
 */
export function getColoring60LocalSource(storyId, activityId) {
  const byStory = COLORING60_LOCAL_SOURCES[storyId];
  if (!byStory) return null;
  const source = byStory[activityId];
  return source == null ? null : source;
}
