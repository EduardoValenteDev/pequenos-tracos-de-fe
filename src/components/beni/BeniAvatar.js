/**
 * BeniAvatar — mascote oficial Beni, o cordeirinho guia bíblico infantil.
 *
 * Usa as imagens reais do mascote em assets/mascot/beni/.
 * Mantém fallback com emoji 🐑 para variants desconhecidas.
 *
 * Disponíveis:
 *   assets/mascot/beni/beni_main.png
 *   assets/mascot/beni/beni_idle.png
 *   assets/mascot/beni/beni_pointing.png
 *   assets/mascot/beni/beni_celebrating.png
 *   assets/mascot/beni/beni_artist.png
 *   assets/mascot/beni/beni_thinking.png
 *   assets/mascot/beni/beni_reading.png
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

/* ── Mapa estático de imagens (require deve ser literal no Metro) ── */
const VARIANT_IMAGE = {
  main:        require('../../../assets/mascot/beni/beni_main.png'),
  idle:        require('../../../assets/mascot/beni/beni_idle.png'),
  happy:       require('../../../assets/mascot/beni/beni_idle.png'),
  pointing:    require('../../../assets/mascot/beni/beni_pointing.png'),
  celebrating: require('../../../assets/mascot/beni/beni_celebrating.png'),
  artist:      require('../../../assets/mascot/beni/beni_artist.png'),
  thinking:    require('../../../assets/mascot/beni/beni_thinking.png'),
  reading:     require('../../../assets/mascot/beni/beni_reading.png'),
  locked:      require('../../../assets/mascot/beni/beni_thinking.png'),
  parent:      require('../../../assets/mascot/beni/beni_main.png'),
  neutral:     require('../../../assets/mascot/beni/beni_idle.png'),
};

const SIZES = {
  small:  40,
  medium: 64,
  large:  96,
  hero:  128,
};

/* Tema visual por variant: fundo e borda adequados à pose */
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
};

/* Badge decorativo opcional por variant */
const VARIANT_BADGE = {
  thinking:    '💭',
  celebrating: '🌟',
  artist:      '🎨',
  reading:     '📖',
  locked:      '🔒',
  parent:      '❤️',
};

/**
 * @param {'main'|'idle'|'happy'|'pointing'|'thinking'|'celebrating'|'artist'|'reading'|'locked'|'parent'|'neutral'} [variant='happy']
 * @param {'small'|'medium'|'large'|'hero'} [size='medium']
 * @param {object} [style] — estilos extras no container
 */
export default function BeniAvatar({ variant = 'happy', size = 'medium', style }) {
  const diameter = SIZES[size] ?? SIZES.medium;
  const imageSource = VARIANT_IMAGE[variant] ?? VARIANT_IMAGE.main;
  const theme = VARIANT_THEME[variant] ?? VARIANT_THEME.main;
  const badge = VARIANT_BADGE[variant] ?? null;

  const badgeDiam = Math.round(diameter * 0.30);
  const badgeFontSize = Math.round(diameter * 0.20);

  return (
    <View
      style={[
        styles.circle,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: theme.bg,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
        style,
      ]}
    >
      {/* Imagem real — clipped ao círculo pelo inner View */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius: diameter / 2, overflow: 'hidden' },
        ]}
      >
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Badge decorativo no canto inferior direito (apenas para algumas variants) */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    position: 'relative',
    overflow: 'visible',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
