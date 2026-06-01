import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StoryCoverImage from './StoryCoverImage';
import StatusBadge from '../ui/StatusBadge';
import { colors as pt, radii, shadows, spacing } from '../../theme/productTheme';
import { storyHasAllRequiredAudio } from '../../services/audioService';

/**
 * StoryBookHero — hero de detalhe da história com capa 16:9.
 *
 * Mobile: capa 16:9 no topo, informações abaixo. Sem moldura falsa.
 * Tablet: 2 colunas — info (esq) + capa 16:9 (dir).
 *
 * @param {object}   story           — story object completo de stories.js
 * @param {number}   progressCount   — cenas concluídas
 * @param {number}   totalScenes     — total de cenas
 * @param {string}   primaryLabel    — texto do botão principal (null = sem botão)
 * @param {function} onPrimaryPress  — callback do botão principal
 * @param {boolean}  isTablet        — layout tablet
 * @param {boolean}  isCompleted     — história concluída
 * @param {boolean}  isComingSoon    — história em preparação
 * @param {boolean}  isLocked        — história bloqueada
 */
export default function StoryBookHero({
  story,
  progressCount = 0,
  totalScenes = 0,
  primaryLabel,
  onPrimaryPress,
  isTablet = false,
  isCompleted = false,
  isComingSoon = false,
  isLocked = false,
}) {
  const xpPercent = totalScenes > 0 ? Math.min(progressCount / totalScenes, 1) : 0;
  const themeColor = story.themeColor ?? story.corCapa ?? '#F4B400';

  const accessBadge = story.accessType === 'premium' ? 'premium' : 'free';
  const statusBadge = isCompleted ? 'completed'
    : isComingSoon ? 'coming_soon'
    : progressCount > 0 ? 'in_progress'
    : null;

  const hasAudio = storyHasAllRequiredAudio(story.id);

  const btnDisabled = isComingSoon;
  const showButton = !!primaryLabel && !!onPrimaryPress;

  let btnBg = themeColor;
  let btnTextColor = '#FFF';
  if (isComingSoon) {
    btnBg = pt.lockedBg;
    btnTextColor = pt.lockedText;
  } else if (isLocked) {
    btnBg = '#7C3AED';
    btnTextColor = '#FFF';
  }

  function InfoSection() {
    return (
      <View style={styles.info}>
        <View style={styles.badgeRow}>
          <StatusBadge type={accessBadge} size="md" />
          {statusBadge && (
            <StatusBadge type={statusBadge} size="md" style={{ marginLeft: 6 }} />
          )}
        </View>

        <Text style={[styles.title, isTablet && styles.titleTablet]}>
          {story.titulo}
        </Text>

        <Text style={styles.ref}>{story.referencia}</Text>

        {story.licaoCoracao && (
          <View style={styles.licaoBox}>
            <Text style={styles.licaoLabel}>Lição do Coração</Text>
            <Text style={styles.licao}>"{story.licaoCoracao}"</Text>
          </View>
        )}

        {totalScenes > 0 && (
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>📖 {totalScenes} cenas</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>🎨 Colorir</Text></View>
            {hasAudio && <View style={styles.chip}><Text style={styles.chipText}>🎵 Áudio</Text></View>}
          </View>
        )}

        {progressCount > 0 && totalScenes > 0 && (
          <View style={styles.progressArea}>
            <View style={styles.progressBarOuter}>
              <View style={[styles.progressBarFill, { width: `${xpPercent * 100}%`, backgroundColor: themeColor }]} />
            </View>
            <Text style={styles.progressLabel}>{progressCount}/{totalScenes} cenas</Text>
          </View>
        )}

        {showButton && (
          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: btnBg },
              isTablet && styles.btnTablet,
            ]}
            onPress={btnDisabled ? undefined : onPrimaryPress}
            activeOpacity={btnDisabled ? 1 : 0.85}
            disabled={btnDisabled}
          >
            <Text style={[styles.btnText, { color: btnTextColor }]}>
              {primaryLabel}
            </Text>
          </TouchableOpacity>
        )}

        {isLocked && !isComingSoon && (
          <Text style={styles.lockedHelper}>
            Peça a um responsável para desbloquear.
          </Text>
        )}
      </View>
    );
  }

  const focusTop = story.coverSafeArea === 'top';

  if (isTablet) {
    return (
      <View style={styles.tabletRow}>
        <View style={styles.tabletInfo}>
          <InfoSection />
        </View>
        <View style={styles.tabletCoverCol}>
          <StoryCoverImage
            story={story}
            style={styles.tabletCover}
            focusTop={focusTop}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileCard}>
      <StoryCoverImage story={story} rounded={false} focusTop={focusTop} />
      <View style={styles.mobileInfo}>
        <InfoSection />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Mobile — capa no topo, info abaixo, num card limpo
  mobileCard: {
    marginHorizontal: 16,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    ...shadows.card,
  },
  mobileInfo: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  // Tablet — 2 colunas
  tabletRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 24,
    alignItems: 'flex-start',
  },
  tabletInfo: {
    flex: 6,
  },
  tabletCoverCol: {
    flex: 4,
    paddingTop: 16,
  },
  tabletCover: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.card,
  },

  // Info section
  info: {
    paddingTop: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 24,
    color: pt.text,
    lineHeight: 30,
    marginBottom: 4,
  },
  titleTablet: {
    fontSize: 30,
    lineHeight: 36,
  },
  ref: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: pt.muted,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  licaoBox: {
    backgroundColor: '#FFF8EC',
    borderRadius: radii.md,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#F4B400',
    marginBottom: 12,
  },
  licaoLabel: {
    fontFamily: 'FredokaOne',
    fontSize: 10,
    color: '#D98A18',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  licao: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.text,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: pt.border,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    color: pt.text,
  },
  progressArea: {
    marginBottom: 14,
  },
  progressBarOuter: {
    height: 7,
    backgroundColor: pt.border,
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  progressLabel: {
    fontFamily: 'Nunito',
    fontSize: 11,
    color: pt.muted,
  },
  btn: {
    borderRadius: radii.xl,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 4,
    ...shadows.card,
  },
  btnTablet: {
    paddingVertical: 18,
  },
  btnText: {
    fontFamily: 'FredokaOne',
    fontSize: 18,
  },
  lockedHelper: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: pt.muted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
});
