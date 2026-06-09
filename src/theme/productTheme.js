/**
 * productTheme.js — Design tokens visuais centralizados do Pequenos Traços de Fé.
 * Novos componentes devem usar este tema. O tema legado em colors.js continua
 * válido para componentes existentes — não é necessário migrar tudo agora.
 */

/**
 * Direção visual "Mundo Vivo do Beni" — papéis de cor (ver sprint Jornada 1.1):
 *   azul fé (confiança/ouvir) · ouro (estrelas/recompensa) · verde vida (progresso)
 *   laranja Beni (ação principal infantil) · creme (fundo) · roxo mágico (Livrinho)
 *   marrom quente (texto). Ajuste sobre a paleta existente, sem troca destrutiva.
 */
export const colors = {
  // Fundos — creme acolhedor, leve
  background: '#FFF9F0',
  surface: '#FFFFFF',
  cream: '#FFF3DD',
  creamStrong: '#FFE8BE',

  // Texto — marrom quente (evita preto duro)
  text: '#2F241D',
  textSoft: '#6F6258',
  muted: '#9B8D80',

  // Bordas
  border: '#EADFD2',

  // Ouro — estrelas, conquistas, luz, trilha Comece Aqui
  gold: '#F9C74F',
  goldDeep: '#E0A21A',
  goldSoft: '#FFF3CC',

  // Laranja Beni — ação principal infantil (Começar, Continuar, Colorir)
  beni: '#F3722C',
  beniDeep: '#E25A12',
  beniSoft: '#FFE6D6',

  // Ações e destaques (compatibilidade)
  orange: '#F3722C',
  coral: '#FF7A45',

  // Verde vida — progresso, concluído, criação, confirmação
  green: '#90BE6D',
  greenDeep: '#5E9C3E',
  greenSoft: '#EBF5E0',

  // Azul fé — confiança, céu, segurança, botões de ouvir
  faithBlue: '#2B5BA1',
  faithBlueDeep: '#1E467F',
  faithBlueSoft: '#E5ECF7',

  // Azul céu — elementos decorativos/secundários
  blue: '#4FC3F7',
  blueSoft: '#DFF6FF',

  // Roxo mágico — momentos especiais do Beni, fantasia, Livrinho
  lilac: '#F1EAFE',
  purple: '#7C3AED',
  purpleDeep: '#5B21B6',

  // Estados de acesso
  premiumBg: '#FFF2C2',
  premiumText: '#7A4E00',
  freeBg: '#EBF5E0',
  freeText: '#1F7A3D',
  lockedBg: '#F4EFE8',
  lockedText: '#9B8D80',

  // Alerta
  danger: '#E74C3C',
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const shadows = {
  card: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },
  soft: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
};

export const layout = {
  tabletBreakpoint: 768,
  contentMaxWidth: 1180,
  sideColumnWidth: 320,
};

export default { colors, radii, spacing, shadows, layout };
