/**
 * onboardingVisualTokens.js — sistema visual "O Livro Vivo do Beni" (Onboarding O2.2).
 *
 * O onboarding é UM LIVRO que a criança abre e folheia. Base quente (creme/marfim/pêssego/
 * lilás/dourado + azul do cachecol do Beni). O azul PROFUNDO só nas bordas superiores (céu) e
 * detalhes. Papel marfim com volume (bordas douradas finas, vinco central, sombra), páginas que
 * viram. Sem clipart, sem emoji, sem branco puro dominante.
 *
 * As poses do Beni são OPACAS (RGB, fundo creme ~#FBF8F2): são usadas como ILUSTRAÇÕES IMPRESSAS
 * nas páginas (full-bleed ou medalhão), nunca como personagem recortado flutuante.
 */
import { colors as pt } from './productTheme';

export const OB = Object.freeze({
  // ── Fundo externo (quente) ──
  bgCenter: '#FFF6E8',
  bgEdge: '#FBECD9',
  peach: '#FFE7CE',
  lilac: '#EFE6FB',
  skyTop: '#DCEBFF',

  // ── Livro / papel ──
  paper: '#FFFDF8',            // marfim
  paperShade: '#F6EEDD',       // sombra entre páginas / vinco
  paperEdge: '#E8CE93',        // borda dourada fina
  bookShadow: 'rgba(74, 52, 18, 0.22)',

  // ── Dourado / acento ──
  gold: '#E0A21A',
  goldSoft: '#F4C651',
  goldGlow: 'rgba(244, 198, 81, 0.6)',
  goldFaint: 'rgba(224, 162, 26, 0.16)',
  scarf: pt.faithBlue,
  beniBg: '#FBF8F2',           // fundo embutido das poses

  // ── Texto ──
  title: '#3A2A18',            // marrom escuro
  text: '#4A3826',
  textSoft: '#8A7458',

  // ── Marcadores de página (indicador) ──
  markers: ['#E58AA6', '#7BB2E8', '#8FBF7A', '#F4C651'],

  // ── CTA (fita/marcador dourado) ──
  ctaBg: '#FFC94D',
  ctaText: '#5A3E1B',
  ctaShadow: '#E0A21E',
  ctaDisabled: '#EAD9B4',
  ctaDisabledText: '#A8946E',

  // ── Métricas ──
  radiusBook: 18,
  radiusCTA: 16,
  touchMin: 44,
  bookMaxWidth: 560,           // teto no tablet

  // ── Durações ──
  durTurn: 480,                // virada de página (380–620)
  durReady: 220,
  durKb: 240,                  // deslocamento por teclado
  durReact: 190,
  readyTimeoutMs: 2500,        // teto para esperar a próxima página ficar pronta
});

/** Fundo externo quente (contínuo). */
export const OB_BG_GRADIENT = Object.freeze([OB.skyTop, OB.bgCenter, OB.bgEdge]);

export default OB;
