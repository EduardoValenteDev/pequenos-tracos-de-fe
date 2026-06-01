import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { images } from '../../assets/images';
import { radii } from '../../theme/productTheme';
import StoryFallbackCover from './StoryFallbackCover';

/**
 * StoryCoverImage — renderiza capa de história sempre em proporção 16:9.
 *
 * Regras:
 * - Container 100% de largura, aspectRatio 16/9.
 * - resizeMode 'cover' — a imagem preenche toda a área, sem faixas brancas.
 * - Sem moldura decorativa falsa, sem fundo cinza, sem imagem pequena centralizada.
 * - Fallback: StoryFallbackCover com a themeColor da história.
 *
 * @param {object}   story         — story object (opicional se source for fornecido)
 * @param {*}        source        — source de imagem manual (substitui story.imagemCapa)
 * @param {object}   style         — estilo extra no container
 * @param {object}   imageStyle    — estilo extra na <Image>
 * @param {boolean}  rounded       — aplica borderRadius (default true)
 * @param {boolean}  showOverlay   — sobreposição escura semitransparente
 * @param {*}        children      — conteúdo por cima da imagem (textos, gradientes)
 * @param {string}   fallbackTitle — título para o fallback visual
 * @param {string}   fallbackIcon  — ícone para o fallback visual
 */
export default function StoryCoverImage({
  story,
  source,
  style,
  imageStyle,
  rounded = true,
  showOverlay = false,
  children,
  fallbackTitle,
  fallbackIcon,
  focusTop = false,
}) {
  let imgSource = source;
  if (!imgSource && story?.imagemCapa) {
    imgSource = images[story.imagemCapa];
  }

  const borderRadius = rounded ? radii.lg : 0;

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      {imgSource ? (
        <Image
          source={imgSource}
          style={[focusTop ? styles.imageTopFocus : styles.image, imageStyle]}
          resizeMode="cover"
        />
      ) : (
        <StoryFallbackCover
          title={fallbackTitle ?? story?.titulo}
          themeColor={story?.themeColor ?? story?.corCapa ?? '#F4B400'}
          icon={fallbackIcon ?? story?.emoji ?? '✨'}
          status={story?.status}
          accessType={story?.accessType}
          style={styles.fallback}
        />
      )}
      {showOverlay && <View style={styles.overlay} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageTopFocus: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '150%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
    aspectRatio: undefined,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});
