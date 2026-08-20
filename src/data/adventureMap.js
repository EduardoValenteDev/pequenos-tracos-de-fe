/**
 * adventureMap.js — Dados das 4 regiões do Mapa Pergaminho (M1).
 *
 * As regiões REAPROVEITAM a classificação oficial do catálogo (`trackId` em
 * stories.js) — não inventam agrupamento. Cada região lista suas histórias na
 * ordem de `order`. Isto é só leitura/derivação de dados existentes: nenhuma
 * regra de negócio, paywall, mídia ou progresso é alterada aqui.
 *
 * Mapa (de cima para baixo) = 4 regiões = encaixe futuro de R1..R4 (M2):
 *   comece_aqui → pequeninos → descobridores → jovens_da_fe
 */
import { stories } from './stories';

// Imagens REAIS de cada região (assets/maps/). Convenção OFICIAL (confirmada pelo
// Eduardo): A = DESPERTA/COLORIDA (awake), B = ADORMECIDA/SEM COR (asleep).
// Mapeamento de regiões → R1..R4. Ambas importadas (sem quebrar).
//
// Cada região tem 4 fontes:
//   awake/asleep               = arte FINAL (941×1672, JPG q85, ~400 KB) — nítida.
//   awakePreview/asleepPreview = PREVIEW leve (405×720, JPG q60, ~60 KB) — decodifica
//                                quase instantâneo e aparece de imediato; a final
//                                entra por cima quando terminar (sem fundo bege).
export const REGION_MAP_IMAGES = {
  comece_aqui: {
    awake: require('../../assets/maps/R1A.jpg'),
    asleep: require('../../assets/maps/R1B.jpg'),
    awakePreview: require('../../assets/maps/R1A_preview.jpg'),
    asleepPreview: require('../../assets/maps/R1B_preview.jpg'),
  },
  pequeninos: {
    awake: require('../../assets/maps/R2A.jpg'),
    asleep: require('../../assets/maps/R2B.jpg'),
    awakePreview: require('../../assets/maps/R2A_preview.jpg'),
    asleepPreview: require('../../assets/maps/R2B_preview.jpg'),
  },
  descobridores: {
    awake: require('../../assets/maps/R3A.jpg'),
    asleep: require('../../assets/maps/R3B.jpg'),
    awakePreview: require('../../assets/maps/R3A_preview.jpg'),
    asleepPreview: require('../../assets/maps/R3B_preview.jpg'),
  },
  jovens_da_fe: {
    awake: require('../../assets/maps/R4A.jpg'),
    asleep: require('../../assets/maps/R4B.jpg'),
    awakePreview: require('../../assets/maps/R4A_preview.jpg'),
    asleepPreview: require('../../assets/maps/R4B_preview.jpg'),
  },
};

// Metadados visuais por região. `tint` = cor de borda/realce suave (fallback de
// fundo enquanto a imagem carrega); `accent` = cor do caminho/realces.
// `completedColor`/`currentColor` (B3.6) = cores dos PINS no mapa por região —
// substituem o verde fixo de concluído (que destoava da arte). completed = borda +
// badge ✓; current = borda + brilho pulsante da história atual.
export const ADVENTURE_REGION_META = [
  { id: 'comece_aqui',   title: 'Comece Aqui',   subtitle: 'Os primeiros passos',      tint: '#EAF6FF', accent: '#4FC3F7', completedColor: '#8E5CF7', currentColor: '#B48CFF' },
  { id: 'pequeninos',    title: 'Pequeninos',    subtitle: 'Histórias para crescer',   tint: '#EAF7EE', accent: '#66BB6A', completedColor: '#D59A2E', currentColor: '#F2C66D' },
  { id: 'descobridores', title: 'Descobridores', subtitle: 'Grandes aventuras',        tint: '#FFF4E3', accent: '#F0A93B', completedColor: '#2F9E9E', currentColor: '#65D6D6' },
  { id: 'jovens_da_fe',  title: 'Jovens da Fé',  subtitle: 'Coragem e sabedoria',      tint: '#F6ECFA', accent: '#BA68C8', completedColor: '#B56AD8', currentColor: '#E0A7FF' },
];

/**
 * Constrói as 4 regiões a partir do trackId oficial. Cada região recebe suas
 * histórias reais (ordenadas por `order`). Histórias sem região conhecida ficam
 * de fora do mapa (não inventa).
 */
export function getAdventureRegions() {
  return ADVENTURE_REGION_META.map(meta => {
    const regionStories = stories
      .filter(s => s.trackId === meta.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const images = REGION_MAP_IMAGES[meta.id] || null;
    return { ...meta, stories: regionStories, images };
  });
}

/**
 * Lista achatada das histórias na ordem das regiões (a "trilha" da jornada).
 * Usada para descobrir a próxima aventura (marco atual).
 */
export function getOrderedAdventureStories() {
  return getAdventureRegions().flatMap(r => r.stories);
}

// ── Geometria compartilhada da região (a tela e MapRegion usam a MESMA fórmula) ──
// Zona segura do TÍTULO no topo (nenhum marco entra) e BANDA dos marcos abaixo
// dela, impedindo colisão com o título. Fundo NEUTRO de pergaminho enquanto a arte
// carrega — nunca azul cru.
export const REGION_TITLE_SAFE = 0.16;          // topo reservado ao título da região
export const REGION_PARCHMENT_BG = '#E7D6B0';   // placeholder neutro (sem azul)

/** Banda vertical (frações) onde os marcos vivem, por nº de histórias. */
export function regionMarkerBand(storyCount) {
  return storyCount <= 3 ? { top: 0.36, bottom: 0.82 } : { top: 0.17, bottom: 0.87 };
}

// Proporção OFICIAL da arte do mapa (M5: reexportada em 9:16). FONTE ÚNICA — mudar
// AQUI muda marcador, caminho (path), câmera e "Ver mapa" (tudo é normalizado).
export const MAP_ASPECT = 9 / 16; // 0.5625

/**
 * Altura de uma região no MODO PRINCIPAL (Caminhada Cinematográfica): largura total
 * na proporção real da arte. A criança rola/sobe por ela. NÃO cresce por marcos.
 */
export function computeRegionHeight(width) {
  return Math.round(width / MAP_ASPECT); // = width*16/9
}

// imageRect em "contain" — usado pelo MODO 2 (Visão Geral / "Ver mapa"), que mostra
// a região INTEIRA num modal de orientação. Usa MAP_ASPECT (adapta-se sozinho).
export function computeImageRect(containerW, containerH) {
  let imageW;
  let imageH;
  if (containerW / containerH > MAP_ASPECT) {
    imageH = containerH;
    imageW = Math.round(containerH * MAP_ASPECT);
  } else {
    imageW = containerW;
    imageH = Math.round(containerW / MAP_ASPECT);
  }
  return {
    left: Math.round((containerW - imageW) / 2),
    top: Math.round((containerH - imageH) / 2),
    width: imageW,
    height: imageH,
  };
}

/**
 * [F6-SG-C · CAUSA C2] Largura da ARTE de uma região no modo principal, com TETO de
 * altura relativo à viewport que a mostra.
 *
 * A altura da região sempre foi função exclusiva da largura (`width * 16/9`). Em
 * paisagem a largura cresce, a altura cresce junto, e a região passa a ser quase 3×
 * mais alta que a janela: o mapa vira um corredor vertical de rolagem. O teto é o
 * ajuste "contain" que este módulo JÁ tinha para o modal "Ver mapa" — reusa-se a
 * regra existente em vez de inventar uma segunda primitiva de escala.
 *
 * Onde não há defeito, não há efeito: se o container é mais estreito que a janela na
 * proporção da arte (retrato, celular), `computeImageRect` devolve a própria largura
 * do container e a geometria fica idêntica à de antes. Sem viewport medida, também.
 *
 * NÃO toca `MAP_ANCHOR_FRAMING`: enquadramento é fração da viewport dentro de
 * `computeCameraTarget`; escala é outro assunto.
 */
export function computeRegionArtWidth(containerW, viewportH) {
  if (!Number.isFinite(containerW) || containerW <= 0) return 0;
  if (!Number.isFinite(viewportH) || viewportH <= 0) return containerW;
  return computeImageRect(containerW, viewportH).width;
}

/** Fração vertical (0..1) do marco i — FALLBACK quando não há coordenada explícita. */
export function markerFraction(index, storyCount) {
  if (storyCount <= 1) return 0.62;
  const b = regionMarkerBand(storyCount);
  return b.bottom - ((b.bottom - b.top) / (storyCount - 1)) * index;
}

// ── M3: COORDENADAS NORMALIZADAS por história (FONTE ÚNICA DE VERDADE) ──────────
// x,y em 0..1 dentro da ARTE da região (y: 0 = topo, 1 = base). `label` = lado em
// que o título do marco aparece ('below' | 'left' | 'right'), para nunca cortar.
// Marcador, label, caminho (path) e câmera derivam TODOS daqui. Composição feita à
// mão por região (não por fórmula de índice), de baixo para cima (1ª história mais
// embaixo). Histórias sem coordenada caem no fallback (markerFraction + zigue-zague).
// B3.5 (microajuste final de pins e posições): ajuste fino sobre a TRILHA principal
// de cada arte, conforme feedback manual do Eduardo. Os títulos não aparecem mais no
// mapa (showLabel={false}); `label` segue definindo o lado seguro caso volte a exibir.
// `markerScale` (opcional) aumenta/diminui SÓ aquele pin (clamp 0.85–1.25).
export const STORY_MAP_COORDS = {
  // comece_aqui (2 histórias) — pins um pouco maiores (markerScale)
  creation:             { x: 0.73, y: 0.67, label: 'below', markerScale: 1.22 },
  noah:                 { x: 0.65, y: 0.37, label: 'left', markerScale: 1.10 }, // B5.3: pin na marca do Eduardo (x 0.65, y 0.37) — no caminho central; guia marcador + reveal
  // pequeninos (baixo → cima)
  david_goliath:        { x: 0.69, y: 0.90, label: 'below' },
  jesus_children:       { x: 0.64, y: 0.71, label: 'right' },
  daniel_lions:         { x: 0.38, y: 0.61, label: 'left' },
  esther_queen:         { x: 0.68, y: 0.47, label: 'right' },
  lost_sheep:           { x: 0.47, y: 0.34, label: 'left' },
  good_samaritan:       { x: 0.72, y: 0.23, label: 'right' },
  // descobridores (baixo → cima)
  abraham_stars:        { x: 0.82, y: 0.90, label: 'below' },
  joseph_colorful_coat: { x: 0.64, y: 0.74, label: 'right' },
  moses_red_sea:        { x: 0.48, y: 0.61, label: 'left' },
  ruth_naomi:           { x: 0.76, y: 0.49, label: 'right' },
  miraculous_catch:     { x: 0.39, y: 0.35, label: 'left' },
  jonah_big_fish:       { x: 0.78, y: 0.22, label: 'right' },
  // jovens_da_fe (baixo → cima)
  samuel_hears_god:     { x: 0.68, y: 0.93, label: 'below' },
  josiah_young_king:    { x: 0.54, y: 0.75, label: 'right' },
  solomon_wisdom:       { x: 0.61, y: 0.60, label: 'right' },
  mary_says_yes:        { x: 0.70, y: 0.46, label: 'right' },
  timothy_faith:        { x: 0.45, y: 0.37, label: 'left' },
  jesus_temple:         { x: 0.78, y: 0.23, label: 'right' },
};

/**
 * Coordenada normalizada de uma história. Usa a coordenada explícita (fonte única);
 * só cai no fallback (markerFraction + zigue-zague) se a história não estiver no mapa.
 */
export function getStoryMapCoord(storyId, index = 0, storyCount = 1) {
  const c = STORY_MAP_COORDS[storyId];
  if (c) return c;
  return { x: index % 2 === 0 ? 0.30 : 0.70, y: markerFraction(index, storyCount), label: 'below' };
}

// ════════════════════════════════════════════════════════════════════════════
// B5.2 — Frontier e fração de reveal por região (base matemática do sépia→cor).
//
// PUROS e DERIVADOS: recebem `isNarrativeComplete(storyId)` (regra travada em B5.1
// = só cenas, sem quiz/colorir/livrinho/Cultinho/baú/estrelinhas) e usam as
// coordenadas normalizadas (STORY_MAP_COORDS / getStoryMapCoord). NÃO tocam
// storage, NÃO animam e NÃO renderizam nada. Consumidos só a partir de B5.3.
// A cor sobe de BAIXO (y=1) para CIMA (y=0), até o TOPO do marcador do frontier.
// ════════════════════════════════════════════════════════════════════════════

// Offset conservador (fração da altura da região) para a cor parar no TOPO do
// marcador (não no centro). O pin real varia com markerScale; este valor é uma
// margem segura e pode ser sobrescrito via options.pinTopFractionOffset em B5.3.
export const PIN_TOP_FRACTION_OFFSET = 0.035;

/**
 * Primeira história da região ainda NÃO concluída narrativamente, respeitando a
 * ordem já usada no mapa (stories ordenadas por `order` = de baixo para cima).
 * Retorna null se TODAS as histórias da região estiverem concluídas.
 * @param {object} region  — { stories: [...] } de getAdventureRegions()
 * @param {(storyId:string)=>boolean} isNarrativeComplete
 */
export function getRegionFrontierStory(region, isNarrativeComplete) {
  const list = region?.stories || [];
  for (const s of list) {
    if (!isNarrativeComplete(s.id)) return s;
  }
  return null;
}

/** True se todas as histórias da região estão concluídas narrativamente. */
export function isRegionNarrativeComplete(region, isNarrativeComplete) {
  const list = region?.stories || [];
  return list.length > 0 && list.every((s) => isNarrativeComplete(s.id));
}

/**
 * Fração vertical (0..1, medida da BASE para o topo) até o TOPO do marcador de uma
 * história. y é 0=topo/1=base; a cor sobe da base até (y - offset). Sempre clampada.
 * Usa getStoryMapCoord → herda o fallback markerFraction quando não há coordenada.
 */
export function getStoryRevealFraction(storyId, index = 0, storyCount = 1, options = {}) {
  const offset = options.pinTopFractionOffset ?? PIN_TOP_FRACTION_OFFSET;
  const { y } = getStoryMapCoord(storyId, index, storyCount); // y: 0 = topo, 1 = base
  const frac = 1 - (y - offset); // base (y=1) → topo do pin (y - offset)
  return Math.max(0, Math.min(1, frac));
}

/**
 * Fração da região que deve estar COLORIDA (revelada), 0..1, de baixo para cima.
 *  - região narrativamente completa → 1.0 (toda colorida);
 *  - senão → sobe até o TOPO do marcador do frontier (1ª história não concluída).
 * Derivado SÓ do progresso narrativo (isNarrativeComplete). Extras não entram.
 */
export function getRegionRevealFraction(region, isNarrativeComplete, options = {}) {
  const list = region?.stories || [];
  if (list.length === 0) return 0;
  if (isRegionNarrativeComplete(region, isNarrativeComplete)) return 1;
  const frontier = getRegionFrontierStory(region, isNarrativeComplete);
  if (!frontier) return 1; // defensivo (não deveria ocorrer aqui)
  const index = list.findIndex((s) => s.id === frontier.id);
  return getStoryRevealFraction(frontier.id, index, list.length, options);
}

/**
 * B5.3.1 — Fração revelada de uma região no contexto GLOBAL da jornada (não isolada).
 * A cor sobe região a região, EM ORDEM: uma região futura NÃO revela nada até a
 * jornada chegar nela. Corrige o cálculo por-região (que sozinho revelava até a 1ª
 * história de regiões ainda não alcançadas).
 *  - regiões ANTES da fronteira global (todas concluídas) → 1 (coloridas);
 *  - a região que CONTÉM a fronteira global (1ª região não concluída) → PARCIAL
 *    (getRegionRevealFraction: sobe até a 1ª história não concluída dela);
 *  - regiões DEPOIS da fronteira (futuras/bloqueadas) → 0 (sépia).
 * `orderedRegions` deve estar na ORDEM da jornada (comece_aqui → … → jovens_da_fe).
 * PURO: derivado só de isNarrativeComplete. Sem storage, sem visual, sem animação.
 */
export function getJourneyRegionRevealFraction(region, orderedRegions, isNarrativeComplete, options = {}) {
  const regions = Array.isArray(orderedRegions) ? orderedRegions : [];
  // Fronteira GLOBAL = 1ª região (na ordem da jornada) ainda não concluída.
  const frontierIdx = regions.findIndex((r) => !isRegionNarrativeComplete(r, isNarrativeComplete));
  if (frontierIdx === -1) return 1; // jornada inteira concluída → tudo colorido
  const myIdx = regions.findIndex((r) => r && region && r.id === region.id);
  // Defensivo: região fora da lista → cai no cálculo isolado (não quebra o mapa).
  if (myIdx === -1) return getRegionRevealFraction(region, isNarrativeComplete, options);
  if (myIdx < frontierIdx) return 1; // regiões anteriores já concluídas → coloridas
  if (myIdx > frontierIdx) return 0; // regiões futuras/bloqueadas → sépia
  return getRegionRevealFraction(region, isNarrativeComplete, options); // fronteira → parcial
}
