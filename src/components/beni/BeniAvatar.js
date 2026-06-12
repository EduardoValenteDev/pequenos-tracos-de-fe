/**
 * BeniAvatar — avatar circular do mascote Beni (cordeirinho guia bíblico).
 *
 * Renderiza via BeniCircularArt, que ENQUADRA a arte 4:5 inteira dentro da
 * moldura redonda (margem de segurança + contain) — sem cortar cabeça/corpo/pose.
 * Mantém a API existente (variant, size, style), o tema por variant (borda/fundo/
 * sombra) e o badge decorativo, então todas as telas seguem funcionando.
 *
 * Para uma imagem simples sem moldura, use BeniMascotImage.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BeniCircularArt from '../common/BeniCircularArt';

/* Variant (legado + semântico) → pose oficial do Beni (beniImages.js). */
const VARIANT_POSE = {
  // legado
  main:        'avatarBase',
  idle:        'avatarBase',
  neutral:     'avatarBase',
  parent:      'avatarBase',
  locked:      'avatarBase',
  happy:       'acenando',
  pointing:    'ensinando',
  thinking:    'ensinando',
  reading:     'ensinando',
  celebrating: 'celebrando',
  artist:      'atelie',
  // semânticos
  avatarBase:  'avatarBase',
  waving:      'acenando',
  teaching:    'ensinando',
  praying:     'orando',
  chest:       'comBau',
  atelie:      'atelie',
};

// Tamanhos com um pouco mais de presença (Beni mais fácil de identificar nos
// círculos de apoio). Aumento sutil: small 40→50, medium 64→72.
const SIZES = {
  small:  50,
  medium: 72,
  large:  96,
  hero:  128,
};

/* Tema visual por variant: fundo (mat) e borda da moldura adequados à pose. */
const VARIANT_THEME = {
  main:        { bg: '#FFF9ED', border: '#F4B400', shadow: '#F4B400' },
  happy:       { bg: '#FFF9ED', border: '#F4B400', shadow: '#F4B400' },
  idle:        { bg: '#FFF9ED', border: '#F4B400', shadow: '#F4B400' },
  pointing:    { bg: '#FFF3E5', border: '#FF8A5B', shadow: '#FF8A5B' },
  neutral:     { bg: '#FFF9ED', border: '#F4B400', shadow: '#F4B400' },
  thinking:    { bg: '#EEF4FF', border: '#6C9EFF', shadow: '#6C9EFF' },
  celebrating: { bg: '#FFFBEF', border: '#FFD166', shadow: '#F4B400' },
  artist:      { bg: '#F5F0FF', border: '#8E44AD', shadow: '#8E44AD' },
  reading:     { bg: '#EEF4FF', border: '#6C9EFF', shadow: '#6C9EFF' },
  locked:      { bg: '#F5F0ED', border: '#C4B0A0', shadow: '#9B8D80' },
  parent:      { bg: '#F0FAF0', border: '#4CAF50', shadow: '#4CAF50' },
  praying:     { bg: '#EEF4FF', border: '#6C9EFF', shadow: '#6C9EFF' },
  chest:       { bg: '#FFF6E2', border: '#F4B400', shadow: '#F4B400' },
  atelie:      { bg: '#F5F0FF', border: '#8E44AD', shadow: '#8E44AD' },
  waving:      { bg: '#FFF9ED', border: '#F4B400', shadow: '#F4B400' },
  teaching:    { bg: '#FFF3E5', border: '#FF8A5B', shadow: '#FF8A5B' },
};

/* Badge decorativo opcional por variant */
const VARIANT_BADGE = {
  thinking:    '💭',
  celebrating: '🌟',
  artist:      '🎨',
  reading:     '📖',
  locked:      '🔒',
  parent:      '❤️',
  praying:     '🙏',
  chest:       '✨',
};

/**
 * @param {string} [variant='happy'] — pose/contexto (legado ou semântico)
 * @param {'small'|'medium'|'large'|'hero'} [size='medium']
 * @param {object} [style] — estilos extras no container
 */
export default function BeniAvatar({ variant = 'happy', size = 'medium', style }) {
  const diameter = SIZES[size] ?? SIZES.medium;
  const pose = VARIANT_POSE[variant] ?? 'avatarBase';
  const theme = VARIANT_THEME[variant] ?? VARIANT_THEME.main;
  const badge = VARIANT_BADGE[variant] ?? null;
  // Borda mais fina e elegante; ainda mais delicada nos avatares pequenos.
  const borderWidth = diameter <= 56 ? 1.5 : 2;

  const badgeDiam = Math.round(diameter * 0.30);
  const badgeFontSize = Math.round(diameter * 0.20);

  return (
    <BeniCircularArt
      variant={pose}
      size={diameter}
      backgroundColor={theme.bg}
      borderColor={theme.border}
      borderWidth={borderWidth}
      shadowColor={theme.shadow}
      style={style}
    >
      {badge !== null && (
        <View
          style={[
            styles.badge,
            {
              width: badgeDiam,
              height: badgeDiam,
              borderRadius: badgeDiam / 2,
              bottom: -badgeDiam * 0.1,
              right: -badgeDiam * 0.1,
              backgroundColor: theme.bg,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={{ fontSize: badgeFontSize }}>{badge}</Text>
        </View>
      )}
    </BeniCircularArt>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
