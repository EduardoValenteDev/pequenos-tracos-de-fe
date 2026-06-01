import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatusBadge from '../ui/StatusBadge';
import { radii } from '../../theme/productTheme';

/**
 * StoryFallbackCover — capa temática para histórias sem arte real.
 * Nunca usa cinza. Sempre usa a themeColor da história em opacidade suave.
 *
 * @param {string}  title        — título da história
 * @param {string}  themeColor   — cor base do tema (#hex)
 * @param {string}  icon         — emoji grande central
 * @param {string}  [status]     — 'available'|'coming_soon'
 * @param {string}  [accessType] — 'free'|'premium'
 * @param {boolean} [compact]    — versão menor para cards pequenos
 * @param {object}  [style]      — estilo externo
 */
export default function StoryFallbackCover({
  title,
  themeColor = '#F4B400',
  icon = '✨',
  status,
  accessType,
  compact = false,
  style,
}) {
  const bgColor = themeColor + '28';
  const ringColor = themeColor + '55';

  let badgeType = null;
  if (status === 'coming_soon') badgeType = 'coming_soon';
  else if (accessType === 'premium') badgeType = 'premium';
  else if (accessType === 'free') badgeType = 'free';

  return (
    <View style={[
      styles.cover,
      { backgroundColor: bgColor, borderColor: ringColor },
      compact && styles.coverCompact,
      style,
    ]}>
      {/* Bolhas decorativas de fundo */}
      {!compact && (
        <>
          <View style={[styles.bubble1, { backgroundColor: themeColor + '22' }]} />
          <View style={[styles.bubble2, { backgroundColor: themeColor + '18' }]} />
          <View style={[styles.bubble3, { backgroundColor: themeColor + '28' }]} />
        </>
      )}

      {/* Anel decorativo central */}
      <View style={[
        styles.ring,
        { borderColor: themeColor + '40', backgroundColor: themeColor + '18' },
        compact && styles.ringCompact,
      ]}>
        <Text style={[styles.icon, compact && styles.iconCompact]}>{icon}</Text>
      </View>

      {/* Título opcional */}
      {!compact && title && (
        <View style={[styles.titlePill, { backgroundColor: themeColor + '30' }]}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
        </View>
      )}

      {/* Badge no canto */}
      {badgeType && (
        <View style={styles.badgeCorner}>
          <StatusBadge type={badgeType} size="sm" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  coverCompact: {
    aspectRatio: 1,
    borderRadius: radii.md,
  },
  bubble1: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    top: -35,
    left: -25,
  },
  bubble2: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    bottom: -15,
    right: -15,
  },
  bubble3: {
    position: 'absolute',
    width: 55,
    height: 55,
    borderRadius: 28,
    top: 16,
    right: 28,
  },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  ringCompact: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 0,
  },
  icon: {
    fontSize: 44,
  },
  iconCompact: {
    fontSize: 24,
  },
  titlePill: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 2,
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 14,
    color: '#3A2A1E',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  badgeCorner: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
