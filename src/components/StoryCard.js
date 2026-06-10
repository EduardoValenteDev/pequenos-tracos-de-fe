import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SoundButton from './SoundButton';
import StatusBadge from './ui/StatusBadge';
import StoryFallbackCover from './story/StoryFallbackCover';
import SafeImage from './ui/SafeImage';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { images } from '../assets/images';

/**
 * StoryCard — card de história estilo pôster infantil.
 * Capa 16:9 LIMPA no topo (sem texto, sem gradiente, sem overlay pesado) e
 * área de informações abaixo (título, referência, badge, progresso).
 * Bloqueio: capa visível + pequeno cadeado no canto; texto "Plano Família"
 * vai na área de informações, fora da arte.
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
      style={styles.card}
      onPress={locked ? null : onPress}
      activeOpacity={locked ? 1 : 0.85}
    >
      {/* Capa 16:9 LIMPA no topo — sem texto, sem gradiente, sem overlay pesado */}
      <View style={[styles.cover, { backgroundColor: themeColor + '18' }]}>
        <SafeImage
          source={coverImg}
          fill
          resizeMode="cover"
          renderFallback={() => (
            <StoryFallbackCover
              title={story.titulo}
              themeColor={themeColor}
              icon={story.emoji ?? '📖'}
              style={styles.fallbackCover}
            />
          )}
        />

        {/* Overlay muito leve só em bloqueio — mantém a capa visível e desejável */}
        {locked && <View style={styles.lockedTint} pointerEvents="none" />}

        {/* Selo pequeno no canto: cadeado (bloqueio) ou estrela (concluída) */}
        {locked ? (
          <View style={styles.cornerBadge}>
            <Text style={styles.cornerBadgeText}>🔒</Text>
          </View>
        ) : isDone ? (
          <View style={styles.cornerBadge}>
            <Text style={styles.cornerBadgeText}>⭐</Text>
          </View>
        ) : null}
      </View>

      {/* Faixa colorida — "lombada" do livro entre a capa e a folha de rosto */}
      <View style={[styles.spine, { backgroundColor: themeColor }]} />

      {/* Folha de rosto do livro — abaixo da imagem */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{story.titulo}</Text>
        <Text style={styles.ref} numberOfLines={1}>{story.referencia}</Text>

        <View style={styles.metaRow}>
          <StatusBadge type={badgeType} />
          {story.totalCenas > 0 && (
            <View style={styles.cenasChip}>
              <Text style={styles.cenasChipText}>
                {isDone
                  ? `${story.totalCenas} cenas`
                  : inProgress
                    ? `${progressCount}/${story.totalCenas} cenas`
                    : `📖 ${story.totalCenas} cenas`}
              </Text>
            </View>
          )}
        </View>

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
    borderWidth: 1,
    borderColor: pt.border,
    elevation: 4,
    shadowColor: '#3A2A1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 9,
  },

  // Lombada colorida — separa a capa da folha de rosto, dá cara de livro
  spine: {
    height: 5,
    width: '100%',
  },

  // 16:9 cover limpa no topo
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  fallbackCover: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
  },

  // Overlay muito leve apenas para bloqueio (dentro do limite permitido)
  lockedTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },

  // Selo pequeno no canto superior direito
  cornerBadge: {
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
  cornerBadgeText: { fontSize: 15 },

  // Folha de rosto do livro (abaixo da imagem)
  info: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFDF7',
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 18,
    color: pt.text,
    lineHeight: 23,
    marginBottom: 3,
  },
  ref: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: pt.muted,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  cenasChip: {
    backgroundColor: pt.cream,
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: pt.border,
  },
  cenasChipText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    color: pt.textSoft,
    fontWeight: '800',
  },
  progressBar: {
    height: 6,
    backgroundColor: pt.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
