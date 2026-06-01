/**
 * LumiAvatar — mascote oficial Lumi, o cordeirinho guia.
 *
 * Fallback premium interno enquanto as artes oficiais não existem.
 * Quando as imagens estiverem prontas, definir os caminhos abaixo e
 * substituir a lógica de fallback por um <Image source={...} />.
 *
 * Caminhos futuros das imagens:
 *   assets/mascot/lumi/lumi_happy.png
 *   assets/mascot/lumi/lumi_thinking.png
 *   assets/mascot/lumi/lumi_celebrating.png
 *   assets/mascot/lumi/lumi_locked.png
 *   assets/mascot/lumi/lumi_parent.png
 *   assets/mascot/lumi/lumi_neutral.png
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SIZES = {
  small:    40,
  medium:   64,
  large:    96,
  hero:    128,
};

const VARIANT_EMOJI = {
  happy:       '🐑',
  thinking:    '🐑',
  celebrating: '🐑',
  locked:      '🐑',
  parent:      '🐑',
  neutral:     '🐑',
};

/**
 * @param {'happy'|'thinking'|'celebrating'|'locked'|'parent'|'neutral'} [variant='happy']
 * @param {'small'|'medium'|'large'|'hero'} [size='medium']
 * @param {object} [style] — estilos extras no container
 */
export default function LumiAvatar({ variant = 'happy', size = 'medium', style }) {
  const diameter = SIZES[size] ?? SIZES.medium;
  const emoji = VARIANT_EMOJI[variant] ?? '🐑';
  const emojiSize = Math.round(diameter * 0.5);
  const starSize = Math.round(diameter * 0.22);
  const starDiam = Math.round(diameter * 0.28);

  return (
    <View
      style={[
        styles.circle,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: emojiSize }}>{emoji}</Text>

      {/* Estrela decorativa no canto inferior direito */}
      <View style={[
        styles.star,
        {
          width: starDiam,
          height: starDiam,
          borderRadius: starDiam / 2,
          bottom: -starDiam * 0.05,
          right: -starDiam * 0.05,
        },
      ]}>
        <Text style={{ fontSize: starSize }}>⭐</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#FFF3DD',
    borderWidth: 2.5,
    borderColor: '#F4B400',
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra suave
    elevation: 3,
    shadowColor: '#F4B400',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    position: 'relative',
    overflow: 'visible',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFF8EF',
    borderWidth: 1.5,
    borderColor: '#F4B400',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
