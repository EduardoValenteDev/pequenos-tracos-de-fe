/**
 * productTheme.js — Design tokens visuais centralizados do Pequenos Traços de Fé.
 * Novos componentes devem usar este tema. O tema legado em colors.js continua
 * válido para componentes existentes — não é necessário migrar tudo agora.
 */

export const colors = {
  // Fundos
  background: '#FFF8EF',
  surface: '#FFFFFF',
  cream: '#FFF3DD',
  creamStrong: '#FFE8BE',

  // Texto
  text: '#2F241D',
  textSoft: '#6F6258',
  muted: '#9B8D80',

  // Bordas
  border: '#EADFD2',

  // Ouro — estrelas, destaques, seleção
  gold: '#F4B400',
  goldSoft: '#FFF1BF',

  // Ações e destaques
  orange: '#F97316',
  coral: '#FF7A45',

  // Verde — sucesso, grátis
  green: '#34C759',
  greenSoft: '#E8F8EE',

  // Azul — céu, leitura
  blue: '#4FC3F7',
  blueSoft: '#DFF6FF',

  // Lilás — ateliê, criatividade
  lilac: '#F0E8FF',
  purple: '#8E44AD',

  // Estados de acesso
  premiumBg: '#FFF2C2',
  premiumText: '#7A4E00',
  freeBg: '#E8F8EE',
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
