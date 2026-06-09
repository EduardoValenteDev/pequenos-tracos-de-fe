/**
 * theme.js — Design System 1.0 do Pequenos Traços de Fé.
 *
 * Ponto único de tokens visuais. Consolida o tema de produto existente
 * (productTheme.js) e ADICIONA tokens de tipografia, botões, cards, badges e
 * cabeçalhos de seção. Não substitui productTheme/colors — apenas organiza e
 * complementa, para que novas telas tenham uma base consistente.
 *
 * Direção visual:
 *   creme acolhedor (fundo) · roxo mágico (com controle) · dourado (recompensa)
 *   azul suave (confiança/pais) · verde (sucesso) · laranja (ação infantil)
 *   texto em marrom quente (evita preto duro).
 */
import { colors, radii, spacing, shadows, layout } from './productTheme';

export { colors, radii, spacing, shadows, layout };

// ── Cores semânticas do Design System (apoiadas na paleta existente) ──
export const palette = {
  bg: colors.background,        // creme acolhedor
  surface: colors.surface,
  magic: colors.purple,         // roxo mágico — usar com controle (Livrinho)
  reward: colors.gold,          // dourado — estrelas/recompensa
  faith: colors.faithBlue,      // azul fé — confiança / botões de ouvir
  trust: colors.faithBlue,      // azul fé — segurança/guia
  sky: colors.blue,             // azul céu — decorativo
  success: colors.green,        // verde vida — confirmação/progresso
  action: colors.beni,          // laranja Beni — ação principal infantil
  text: colors.text,            // marrom escuro quente
  textSoft: colors.textSoft,
  muted: colors.muted,
  border: colors.border,
};

// ── Tipografia ──
export const typography = {
  display: { fontFamily: 'FredokaOne', fontSize: 26, color: colors.text },
  title:   { fontFamily: 'FredokaOne', fontSize: 20, color: colors.text },
  heading: { fontFamily: 'FredokaOne', fontSize: 17, color: colors.text },
  body:    { fontFamily: 'Nunito', fontSize: 15, color: colors.text, lineHeight: 22 },
  bodySoft:{ fontFamily: 'Nunito', fontSize: 14, color: colors.textSoft, lineHeight: 20 },
  caption: { fontFamily: 'Nunito', fontSize: 12, color: colors.muted },
  button:  { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFFFFF' },
};

// ── Tamanhos de botão ──
export const buttonSizes = {
  sm: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: radii.pill, fontSize: 14 },
  md: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: radii.pill, fontSize: 16 },
  lg: { paddingVertical: 17, paddingHorizontal: 32, borderRadius: radii.pill, fontSize: 18 },
};

// ── Estilos de card ──
export const cardStyles = {
  soft: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.md, ...shadows.soft,
  },
  elevated: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.md, ...shadows.card,
  },
  magic: {
    backgroundColor: colors.lilac, borderRadius: radii.lg,
    padding: spacing.md, borderWidth: 1, borderColor: 'rgba(124,58,237,0.18)',
  },
};

// ── Badges (estados de conteúdo) ──
export const badges = {
  free:    { bg: colors.freeBg, text: colors.freeText },
  premium: { bg: colors.premiumBg, text: colors.premiumText },
  reward:  { bg: colors.goldSoft, text: colors.premiumText },
  locked:  { bg: colors.lockedBg, text: colors.lockedText },
  success: { bg: colors.greenSoft, text: colors.freeText },
};

// ── Cabeçalhos de seção ──
export const sectionHeaders = {
  title: { fontFamily: 'FredokaOne', fontSize: 18, color: colors.text, marginBottom: spacing.sm },
  spacingTop: spacing.lg,
};

export default {
  colors, radii, spacing, shadows, layout,
  palette, typography, buttonSizes, cardStyles, badges, sectionHeaders,
};
