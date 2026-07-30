/**
 * coloring60Catalog.js — Catálogo semântico (SÓ metadados) do piloto Colorir 60.
 *
 * Piloto "A Criação": exatamente 3 atividades, identificadas por `activityId`
 * SEMÂNTICO — NUNCA por `sceneId`/`cenaIndex`. A identidade de cada atividade é o
 * par composto (`storyId`, `activityId`). O catálogo é ADITIVO e independente dos
 * 200 linearts legados por cena e das ilustrações narrativas: 3 atividades ≠ 10 cenas.
 *
 * Este módulo é EXCLUSIVAMENTE de metadados:
 *   - NÃO contém `require()` de asset (a fonte runtime vive em coloring60LocalAssets.js);
 *   - NÃO carrega imagem, NÃO resolve caminho (isso é de coloring60Resolver.js);
 *   - NÃO conhece plano, progresso, navegação, writer ou conclusão.
 *
 * `expectedSha256` e `expectedDims` são os valores RATIFICADOS (spec 017 §15) que os
 * gates usam para provar a identidade dos PNGs — sem tocar em bytes aqui.
 * `localSourceKey` é a chave estável (`storyId:activityId`) sob a qual a fonte runtime é
 * registrada em coloring60LocalAssets.js. As TRÊS atividades já têm fonte ativa lá — nenhuma
 * é mais `null`, e `light` é atendida por scene_02.png (arquivo compartilhado com a cena 02
 * do mapa legado). "A Criação" é 100% LOCAL: nada aqui vem de pack remoto, e a migração para
 * conteúdo remoto NÃO é implementada neste bloco — exige spec própria.
 *
 * O catálogo tem EXATAMENTE três atividades, nesta ordem: `light` (1), `living_world` (2) e
 * `people_and_care` (3). A relação com as cenas vive em coloring60StoryMilestones.js, não
 * aqui: concluir a cena 09 é o que recomenda `people_and_care`.
 *
 * Governança: specs 014/015/016/017 · DECISIONS.md PL01A-03/PL01G · tasks.md P1.T1.
 */

// modelVersion do catálogo Colorir 60 (tasks.md P1.T1 — "coloring60 reporta 3 / modelVersion 2").
export const COLORING60_MODEL_VERSION = 2;

// As 3 atividades de "A Criação", em ordem sequencial estável (1, 2, 3).
const CREATION_ACTIVITIES = Object.freeze([
  Object.freeze({
    storyId: 'creation',
    activityId: 'light',
    order: 1,
    title: 'Haja luz',
    expectedSha256: 'c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1',
    expectedDims: Object.freeze({ width: 1122, height: 1402 }),
    localSourceKey: 'creation:light',
  }),
  Object.freeze({
    storyId: 'creation',
    activityId: 'living_world',
    order: 2,
    title: 'O mundo cheio de vida',
    expectedSha256: '818cd917c7493f4a3e04512a7120a6eaff5a03fdd16277b7d4fdfd1ee33b6ac5',
    expectedDims: Object.freeze({ width: 1122, height: 1402 }),
    localSourceKey: 'creation:living_world',
  }),
  Object.freeze({
    storyId: 'creation',
    activityId: 'people_and_care',
    order: 3,
    title: 'Na criação de Deus',
    expectedSha256: '59988d9a58082a8173a328857fccb6a3716815660f4434c0df4491d6bf30d4e9',
    expectedDims: Object.freeze({ width: 1122, height: 1402 }),
    localSourceKey: 'creation:people_and_care',
  }),
]);

// Catálogo por história. No piloto, SOMENTE `creation` possui atividades.
const COLORING60_CATALOG = Object.freeze({
  creation: CREATION_ACTIVITIES,
});

/**
 * getOwnActivityList(storyId) — a lista REGISTRADA sob esta história, ou `null`. É a única
 * porta de entrada ao mapa: nenhuma consulta indexa `COLORING60_CATALOG` diretamente.
 *
 * Por que a guarda existe: `COLORING60_CATALOG[storyId]` sozinho responde às chaves HERDADAS
 * de `Object.prototype` — 'constructor', 'toString', 'valueOf', '__proto__', 'hasOwnProperty',
 * '__defineGetter__' e as demais. O valor devolvido é truthy, atravessa um `if (!list)` e
 * explode no `.find`/`.slice` seguinte com `TypeError: ... is not a function`, quebrando o
 * contrato "não lança" do resolvedor.
 *
 * A defesa é NOMINAL e ESTRUTURAL, não uma lista de palavras proibidas (que seria incompleta
 * hoje e envelheceria a cada versão do runtime): prova-se que a chave é PRÓPRIA do objeto e,
 * só então, que o valor é mesmo um Array. Isso vale para qualquer propriedade herdada,
 * presente ou futura. `hasOwnProperty.call` também absorve chave não-string (null, número,
 * Symbol, objeto) sem lançar, devolvendo `null` — a ausência honesta de sempre.
 */
function getOwnActivityList(storyId) {
  if (!Object.prototype.hasOwnProperty.call(COLORING60_CATALOG, storyId)) return null;
  const list = COLORING60_CATALOG[storyId];
  return Array.isArray(list) ? list : null;
}

/**
 * getColoring60Activities(storyId) — cópia rasa da lista de atividades da história
 * (ordem preservada). História fora do piloto → lista vazia.
 */
export function getColoring60Activities(storyId) {
  const list = getOwnActivityList(storyId);
  return list ? list.slice() : [];
}

/**
 * getColoring60Activity(storyId, activityId) — entrada única por identidade composta,
 * ou null quando ausente. NÃO aceita/consulta `sceneId`.
 */
export function getColoring60Activity(storyId, activityId) {
  const list = getOwnActivityList(storyId);
  if (!list) return null;
  return list.find((activity) => activity.activityId === activityId) || null;
}
