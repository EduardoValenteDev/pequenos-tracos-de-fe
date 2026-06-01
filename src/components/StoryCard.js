import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import SoundButton from './SoundButton';
import StatusBadge from './ui/StatusBadge';
import StoryFallbackCover from './story/StoryFallbackCover';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { images } from '../assets/images';

/**
 * StoryCard — card de história para uso em listas de biblioteca.
 * Layout vertical com capa 16:9 no topo e info abaixo.
 * Badge de acesso segue accessType da história (free | premium).
 */
export default function StoryCard({ story, onPress, locked = false, progressCount = 0 }) {
  const coverImg = story.imagemCapa ? images[story.imagemCapa] : null;
  const themeColor = story.themeColor ?? story.corCapa ?? '#F4B400';

  const isDone = progressCount >= story.totalCenas && story.totalCenas > 0;
  const inProgress = progressCount > 0 && !isDone;
  const isComingSoon = story.status === 'coming_soon';

  // Um único badge dominante — coming_soon > completed > in_progress > acesso
  const accessBadgeType = story.accessType === 'premium' ? 'premium' : 'free';
  let badgeType;
  if (isComingSoon)    badgeType = 'coming_soon';
  else if (isDone)     badgeType = 'completed';
  else if (inProgress) badgeType = 'in_progress';
  else                 badgeType = accessBadgeType;

  return (
    <SoundButton
      style={[styles.card, locked && styles.lockedCard]}
      onPress={locked ? null : onPress}
      activeOpacity={locked ? 1 : 0.82}
    >
      {/* Capa 16:9 */}
      <View style={[styles.cover, { backgroundColor: themeColor + '22' }]}>
        {coverImg ? (
          <Image source={coverImg} style={styles.coverImg} resizeMode="cover" />
        ) : (
          <StoryFallbackCover
            title={story.titulo}
            themeColor={themeColor}
            icon={story.emoji ?? '📖'}
            style={styles.fallbackCover}
          />
        )}

        {/* Overlay de bloqueio */}
        {locked && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}

        {/* Badge "Concluída" na capa */}
        {isDone && !locked && (
          <View style={styles.doneBadge}>
            <Text style={styles.doneBadgeText}>⭐</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{story.titulo}</Text>
        <Text style={styles.ref}>{story.referencia}</Text>

        {/* Badge dominante */}
        <View style={styles.badgeRow}>
          <StatusBadge type={badgeType} />
        </View>

        {/* Barra de progresso */}
        {inProgress && story.totalCenas > 0 && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(progressCount / story.totalCenas) * 100}%`,
                  backgroundColor: themeColor,
                },
              ]}
            />
          </View>
        )}
      </View>
    </SoundButton>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    ...shadows.card,
  },
  lockedCard: { opacity: 0.65 },

  // 16:9 cover at top of card
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coverImg: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  fallbackCover: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: { fontSize: 28 },
  doneBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBadgeText: { fontSize: 14 },

  info: {
    padding: 14,
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: pt.text,
    marginBottom: 2,
    lineHeight: 22,
  },
  ref: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: pt.muted,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 5,
    backgroundColor: pt.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
