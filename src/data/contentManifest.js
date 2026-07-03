/**
 * contentManifest.js — Camadas de conteúdo (Feature 001-asset-architecture-budget, Fase 2).
 *
 * PLANO DECLARATIVO de DISTRIBUIÇÃO do conteúdo — define de ONDE cada história vem:
 *   - `starter`     → empacotado no BINÁRIO, grátis, offline desde a instalação;
 *   - `remote`      → pack BAIXÁVEL sob demanda (sem download neste bloco);
 *   - `coming_soon` → planejado, FORA do bundle (0 bytes no app).
 *
 * IMPORTANTE: é um EIXO SEPARADO do gate de disponibilidade em runtime (que continua
 * em `contentAccessService`/`mediaReadyService`). NADA consome este módulo ainda: sem
 * troca de `require` estático, sem download, sem alteração de telas/UX. Puro dado +
 * helpers, sem dependências (Constituição II — camada de dados única).
 */

export const CONTENT_LAYERS = Object.freeze({
  STARTER: 'starter',
  REMOTE: 'remote',
  COMING_SOON: 'coming_soon',
});

// STARTER: no binário, grátis, offline desde a instalação (Plano D1: A Criação + Noé).
export const STARTER_STORY_IDS = Object.freeze(['creation', 'noah']);

// Plano de camada por história (declarativo; NÃO altera requires/telas). `remote` =
// histórias prontas que virarão packs baixáveis; `coming_soon` = ainda não empacotadas.
export const STORY_CONTENT_LAYER = Object.freeze({
  creation: 'starter',
  noah: 'starter',
  david_goliath: 'remote',
  jesus_children: 'remote',
  daniel_lions: 'remote',
  jonah_big_fish: 'remote',
  lost_sheep: 'remote',
  good_samaritan: 'remote',
  abraham_stars: 'remote',
  joseph_colorful_coat: 'remote',
  moses_red_sea: 'remote',
  ruth_naomi: 'remote',
  esther_queen: 'remote',
  miraculous_catch: 'remote',
  samuel_hears_god: 'remote',
  josiah_young_king: 'remote',
  // F2.0a: estas 4 tinham conteúdo COMPLETO (10 cenas + 10 colorir + 10 áudio + capa +
  // quiz; status 'available', accessType premium) mas estavam marcadas 'coming_soon'
  // por engano → corrigidas para 'remote'. Agora as 18 premium prontas são packs
  // baixáveis; 'coming_soon' fica reservado para conteúdo realmente futuro (nenhum hoje).
  solomon_wisdom: 'remote',
  mary_says_yes: 'remote',
  timothy_faith: 'remote',
  jesus_temple: 'remote',
});

// Packs REMOTOS DECLARADOS (apenas declaração — SEM download, SEM URL real obrigatória,
// SEM fetch). Apenas registra que esses conteúdos serão entregues como pack baixável.
export const REMOTE_PACKS = Object.freeze([
  Object.freeze({
    id: 'story_ruth_naomi',
    type: 'story',
    layer: 'remote',
    storyId: 'ruth_naomi',
    status: 'not_downloaded',
  }),
]);

export function isValidLayer(layer) {
  return (
    layer === CONTENT_LAYERS.STARTER ||
    layer === CONTENT_LAYERS.REMOTE ||
    layer === CONTENT_LAYERS.COMING_SOON
  );
}

export function getContentLayer(storyId) {
  return STORY_CONTENT_LAYER[storyId] || CONTENT_LAYERS.COMING_SOON;
}

export function isStarterStory(storyId) {
  return getContentLayer(storyId) === CONTENT_LAYERS.STARTER;
}

export function getStoriesByLayer(layer) {
  return Object.keys(STORY_CONTENT_LAYER).filter((id) => STORY_CONTENT_LAYER[id] === layer);
}
