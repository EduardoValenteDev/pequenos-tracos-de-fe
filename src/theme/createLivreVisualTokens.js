/**
 * createLivreVisualTokens.js — sistema visual centralizado do "Criar livre" premium (C1 · §21).
 *
 * Direção: papel marfim quase branco, superfície creme quente, ferramenta ativa em azul fé com
 * detalhe dourado, borracha ativa em âmbar suave, ação destrutiva em coral discreto e salvar no
 * verde já aprovado no produto. Sem cor sem função, sem gradiente excessivo, sem sombra grande,
 * sem borda grossa em todos os controles.
 *
 * O PAPEL usa a MESMA cor de fundo do canvas da WebView (#FFFDF8) — assim a moldura e o desenho
 * se fundem sem emenda. Não alterar sem auditar o `bgColor` do AtelierCanvas.
 */
import { colors as pt } from './productTheme';

export const CL = Object.freeze({
  // ── Superfícies ──
  paper: '#FFFDF8',        // marfim quase branco (== bgColor do canvas)
  paperEdge: '#ECE0C8',    // contorno discretíssimo do papel
  surface: '#FDF6E7',      // creme quente (cabeçalho / barra)
  surfaceEdge: '#EFE2CE',  // borda superior discreta da barra

  // ── Estados de ferramenta ──
  activeBlue: pt.faithBlue,        // ferramenta ativa (azul do app)
  activeBlueSoft: pt.faithBlueSoft,
  activeGold: pt.goldDeep,         // detalhe dourado da ativa
  eraserAmber: '#E39A2E',          // borracha ativa (âmbar)
  eraserAmberSoft: '#FFF3DE',
  destructive: '#D9663F',          // coral discreto (limpar / sair sem salvar)
  destructiveSoft: '#FCEAE2',
  save: pt.green,                  // salvar (verde aprovado)
  saveDeep: pt.greenDeep,

  // ── Texto ──
  text: pt.text,
  textSoft: pt.textSoft,
  disabled: '#C4B9A6',             // estado desabilitado (visível, sem cor)
  disabledSurface: '#F1E9D8',

  // ── Métrica ──
  headerHeight: 56,        // além da safe area (§3: 56–64)
  barHeight: 70,           // além da safe area (§6: 66–76)
  paperMargin: 6,          // margem externa pequena e consistente
  panelMaxHeightRatio: 0.32,   // painel contextual ≤ 32% da altura útil (§8)

  radiusPaper: 15,         // cantos do papel (§4: 12–18)
  radiusBar: 20,           // cantos superiores da barra
  radiusPanel: 20,
  radiusControl: 14,
  radiusSwatch: 999,

  hairline: 1,             // contorno fino
  border: 1.5,

  iconSize: 24,            // tamanho aparente único dos ícones
  iconStroke: 2,
  swatchSize: 30,          // amostra de cor (§9: 28–34)
  touchMin: 44,            // área de toque mínima

  // ── Sombras (curtas) ──
  shadowBar: {
    shadowColor: '#3A2A12', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08, shadowRadius: 5, elevation: 8,
  },
  shadowPaper: {
    shadowColor: '#3A2A12', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  shadowPanel: {
    shadowColor: '#3A2A12', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.10, shadowRadius: 8, elevation: 12,
  },

  // ── Durações de animação (§22) ──
  durTool: 140,      // troca de ferramenta (120–160)
  durPanelIn: 200,   // abertura (180–220)
  durPanelOut: 170,  // fechamento (150–190)
  durSave: 500,      // feedback de salvar (400–600)
});

/**
 * Larguras de pincel no ESPAÇO LÓGICO do canvas (mesmos números do motor atual).
 * O motor guarda `size` em pixels do canvas; estes valores já estão nesse espaço.
 */
export const BRUSH_PRESETS = Object.freeze([
  { id: 'fine', label: 'Fino', width: 4 },
  { id: 'medium', label: 'Médio', width: 10 },
  { id: 'thick', label: 'Grosso', width: 20 },
]);
export const BRUSH_MIN = 2;
export const BRUSH_MAX = 28;

/** Tamanhos da borracha (independentes do pincel). Mesmo motor (destination-out). */
export const ERASER_PRESETS = Object.freeze([
  { id: 'fine', label: 'Fina', width: 14 },
  { id: 'medium', label: 'Média', width: 30 },
  { id: 'thick', label: 'Grossa', width: 52 },
]);
export const ERASER_MIN = 8;
export const ERASER_MAX = 64;

/**
 * Paleta autoral do Criar livre — 18 cores (6 colunas × 3 linhas), TODAS reaproveitadas de
 * COLOR_PALETTE (hex já existentes) para manter 100% de compatibilidade com artes salvas.
 * Ordem: quentes · frios · neutros/pele. Cada cor tem rótulo PT-BR para acessibilidade.
 */
export const CRIAR_LIVRE_COLORS = Object.freeze([
  { hex: '#F44336', label: 'Vermelho' },
  { hex: '#FF6B35', label: 'Coral' },
  { hex: '#FF6F00', label: 'Laranja' },
  { hex: '#FDD835', label: 'Amarelo' },
  { hex: '#F4B400', label: 'Amarelo quente' },
  { hex: '#EC407A', label: 'Rosa' },

  { hex: '#A5D6A7', label: 'Verde claro' },
  { hex: '#2ECC71', label: 'Verde' },
  { hex: '#1B8F3A', label: 'Verde escuro' },
  { hex: '#81D4FA', label: 'Azul claro' },
  { hex: '#3498DB', label: 'Azul' },
  { hex: '#0D47A1', label: 'Azul escuro' },

  { hex: '#8E44AD', label: 'Roxo' },
  { hex: '#D9A066', label: 'Tom de pele' },
  { hex: '#C68642', label: 'Marrom claro' },
  { hex: '#8B4513', label: 'Marrom' },
  { hex: '#9E9E9E', label: 'Cinza' },
  { hex: '#263238', label: 'Preto' },
]);

/**
 * PALETAS organizadas (C1.1 §9). "Essenciais" = as 18 cores aprovadas (intocadas). As três
 * novas trazem ~12 cores curadas cada, com diferença visual clara (claras E escuras). Trocar
 * de paleta NÃO altera a cor selecionada. Novos hexes são seguros: os traços guardam o hex.
 */
export const ORGANIZED_PALETTES = Object.freeze([
  { id: 'essenciais', name: 'Essenciais', colors: CRIAR_LIVRE_COLORS },
  {
    id: 'pasteis',
    name: 'Pastéis',
    colors: [
      { hex: '#F8BBD0', label: 'Rosa pastel' }, { hex: '#FFCCBC', label: 'Coral pastel' },
      { hex: '#FFE0B2', label: 'Pêssego' }, { hex: '#FFF59D', label: 'Amarelo pastel' },
      { hex: '#DCEDC8', label: 'Lima pastel' }, { hex: '#C8E6C9', label: 'Verde pastel' },
      { hex: '#B2DFDB', label: 'Menta' }, { hex: '#B3E5FC', label: 'Azul pastel' },
      { hex: '#D1C4E9', label: 'Lavanda' }, { hex: '#E1BEE7', label: 'Lilás pastel' },
      { hex: '#CFD8DC', label: 'Cinza pastel' }, { hex: '#455A64', label: 'Ardósia' },
    ],
  },
  {
    id: 'natureza',
    name: 'Natureza',
    colors: [
      { hex: '#66BB6A', label: 'Verde folha' }, { hex: '#558B2F', label: 'Verde musgo' },
      { hex: '#2E7D32', label: 'Verde pinho' }, { hex: '#808000', label: 'Oliva' },
      { hex: '#26A69A', label: 'Turquesa' }, { hex: '#4FC3F7', label: 'Céu' },
      { hex: '#0288D1', label: 'Azul lago' }, { hex: '#1565C0', label: 'Azul profundo' },
      { hex: '#FFB300', label: 'Sol' }, { hex: '#8D6E63', label: 'Tronco' },
      { hex: '#D7CCC8', label: 'Areia' }, { hex: '#1B2A32', label: 'Céu noturno' },
    ],
  },
  {
    id: 'terra',
    name: 'Terra e pele',
    colors: [
      { hex: '#FFE0BD', label: 'Pele muito clara' }, { hex: '#FFCFA3', label: 'Pele clara' },
      { hex: '#F1C0A0', label: 'Pele rosada' }, { hex: '#E0AC69', label: 'Pele média' },
      { hex: '#C68642', label: 'Pele morena' }, { hex: '#A5673F', label: 'Pele castanha' },
      { hex: '#8D5524', label: 'Pele escura' }, { hex: '#5C3A21', label: 'Pele muito escura' },
      { hex: '#C0562B', label: 'Terracota' }, { hex: '#CC9544', label: 'Ocre' },
      { hex: '#6D4C41', label: 'Marrom' }, { hex: '#2B2B2B', label: 'Carvão' },
    ],
  },
]);

/** Nº máximo de cores recentes (§9). Discreto. */
export const RECENT_COLORS_MAX = 5;

/** Cores claras que precisam de marca escura no estado selecionado (contraste). */
export function isLightColor(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // luminância relativa aproximada
  return (0.299 * r + 0.587 * g + 0.114 * b) > 170;
}

export default CL;
