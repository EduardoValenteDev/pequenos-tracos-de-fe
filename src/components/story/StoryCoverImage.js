import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { images } from '../../assets/images';
import { getStoryCoverMeta } from '../../assets/storyCovers';
import { radii } from '../../theme/productTheme';
import StoryFallbackCover from './StoryFallbackCover';
import RecoverableImage from '../ui/RecoverableImage';

/**
 * StoryCoverImage — renderiza capa de história sempre em proporção 16:9.
 *
 * Regras:
 * - Container 100% de largura, aspectRatio 16/9.
 * - resizeMode 'cover' — a imagem preenche a área, sem faixas brancas.
 * - Capas são 16:9 em container 16:9 → a arte aparece inteira (sem corte).
 * - Foco (focusX/focusY de STORY_COVER_META) aplicado apenas quando o container
 *   precisaria recortar (no-op em 16:9). Resolvido internamente por story.id.
 * - Fallback: StoryFallbackCover com a themeColor da história.
 *
 * @param {object}   story         — story object (resolve imagemCapa + foco por id)
 * @param {*}        source        — source de imagem manual (substitui story.imagemCapa)
 * @param {'card'|'hero'|'compact'} [variant='hero'] — contexto de uso
 * @param {boolean}  locked        — aplica overlay leve + selo de bloqueio
 * @param {object}   style         — estilo extra no container
 * @param {object}   imageStyle    — estilo extra na <Image>
 * @param {boolean}  rounded       — aplica borderRadius (default true)
 * @param {boolean}  showOverlay   — sobreposição escura semitransparente (legibilidade total)
 * @param {boolean}  showBottomGradient — gradiente inferior para texto legível
 * @param {*}        children      — conteúdo por cima da imagem (textos, gradientes)
 * @param {string}   fallbackTitle — título para o fallback visual
 * @param {string}   fallbackIcon  — ícone para o fallback visual
 */
export default function StoryCoverImage({
  story,
  source,
  variant = 'hero',
  locked = false,
  style,
  imageStyle,
  rounded = true,
  showOverlay = false,
  showBottomGradient = false,
  children,
  fallbackTitle,
  fallbackIcon,
  focusTop = false,
}) {
  let imgSource = source;
  if (!imgSource && story?.imagemCapa) {
    imgSource = images[story.imagemCapa];
  }

  // Foco da capa — resolvido pelo id (no-op em 16:9, útil em recortes futuros).
  const meta = story?.id ? getStoryCoverMeta(story.id) : { focusX: 0.5, focusY: 0.5 };
  const alignTop = focusTop || meta.focusY < 0.4;

  const borderRadius = rounded ? radii.lg : 0;

  // [P3J-R] Fallback da capa. Quando NÃO há arte, ele é o conteúdo. Quando há arte e ela FALHA ao
  // carregar, o mesmo fallback entra ATRÁS (absoluto) e a capa continua montada por cima — assim a
  // recuperação limitada ainda acontece e, ao voltar, a arte simplesmente cobre o fallback.
  // Nenhuma flag de carregamento vive aqui (ver RecoverableImage): a capa não pisca por re-render.
  const fallbackCover = (extraStyle) => (
    <StoryFallbackCover
      title={fallbackTitle ?? story?.titulo}
      themeColor={story?.themeColor ?? story?.corCapa ?? '#F4B400'}
      icon={fallbackIcon ?? story?.emoji ?? '✨'}
      status={story?.status}
      accessType={story?.accessType}
      style={extraStyle ? [styles.fallback, extraStyle] : styles.fallback}
    />
  );

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      {imgSource ? (
        <RecoverableImage
          source={imgSource}
          style={[alignTop ? styles.imageTopFocus : styles.image, imageStyle]}
          resizeMode="cover"
          renderFallback={() => fallbackCover(styles.fallbackBehind)}
        />
      ) : (
        fallbackCover(null)
      )}

      {/* Gradiente inferior — melhora legibilidade de título sobre a imagem */}
      {showBottomGradient && (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.72)']}
          locations={[0, 0.55, 1]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />
      )}

      {/* Overlay escuro completo (uso pontual) */}
      {showOverlay && <View style={styles.overlay} pointerEvents="none" />}

      {/* Bloqueio — leve, mantém a capa desejável */}
      {locked && (
        <>
          <View style={styles.lockedTint} pointerEvents="none" />
          <View style={styles.lockBadge}>
            <Text style={styles.lockBadgeText}>🔒</Text>
          </View>
        </>
      )}

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
  // Só quando há capa: o fallback ocupa a caixa SEM empurrar a imagem para baixo.
  fallbackBehind: { ...StyleSheet.absoluteFillObject },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  lockedTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124,58,237,0.14)',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadgeText: { fontSize: 15 },
});
