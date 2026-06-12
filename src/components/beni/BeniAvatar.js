/**
 * BeniAvatar — mascote oficial Beni, o cordeirinho guia bíblico infantil.
 *
 * Usa as 7 poses oficiais do registro central beniImages.js (assets/mascot/beni/
 * 0N_beni_*.png). Mantém os nomes de variant legados mapeados para as novas
 * poses, então todas as telas existentes continuam funcionando com a nova arte.
 *
 * Para uma imagem simples (sem moldura circular), use BeniMascotImage.
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BENI_IMAGES } from '../../assets/mascot/beniImages';

/* ── Mapa estático variant → pose oficial (require literal vem de beniImages) ──
   Legado (main/idle/happy/pointing/...) + semânticos novos (waving/teaching/
   praying/chest) → as 7 poses reais. */
const VARIANT_IMAGE = {
  // legado
  main:        BENI_IMAGES.avatarBase,
  idle:        BENI_IMAGES.avatarBase,
  happy:       BENI_IMAGES.acenando,
  pointing:    BENI_IMAGES.ensinando,
  celebrating: BENI_IMAGES.celebrando,
  artist:      BENI_IMAGES.atelie,
  thinking:    BENI_IMAGES.ensinando,
  reading:     BENI_IMAGES.ensinando,
  locked:      BENI_IMAGES.avatarBase,
  parent:      BENI_IMAGES.avatarBase,
  neutral:     BENI_IMAGES.avatarBase,
  // semânticos (poses oficiais por nome direto)
  avatarBase:  BENI_IMAGES.avatarBase,
  waving:      BENI_IMAGES.acenando,
  teaching:    BENI_IMAGES.ensinando,
  praying:     BENI_IMAGES.orando,
  chest:       BENI_IMAGES.comBau,
  atelie:      BENI_IMAGES.atelie,
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
