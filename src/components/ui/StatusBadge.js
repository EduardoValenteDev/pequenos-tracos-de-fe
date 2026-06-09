import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as pt } from '../../theme/productTheme';

const BADGE_CONFIG = {
  free: {
    defaultLabel: 'Grátis',
    bg: pt.freeBg,
    text: pt.freeText,
    icon: '✨',
  },
  premium: {
    defaultLabel: 'Especial da Família',
    bg: pt.premiumBg,
    text: pt.premiumText,
    icon: '✨',
  },
  coming_soon: {
    defaultLabel: 'Em preparação',
    bg: pt.cream,
    text: pt.textSoft,
    icon: '🔮',
  },
  completed: {
    defaultLabel: 'Concluída',
    bg: pt.greenSoft,
    text: pt.freeText,
    icon: '✓',
  },
  in_progress: {
    defaultLabel: 'Em andamento',
    bg: pt.goldSoft,
    text: pt.premiumText,
    icon: '✏️',
  },
  locked: {
    defaultLabel: 'Bloqueada',
    bg: pt.lockedBg,
    text: pt.lockedText,
    icon: '🔒',
  },
  saved: {
    defaultLabel: 'Arte salva',
    bg: pt.cream,
    text: pt.premiumText,
    icon: '🎨',
  },
};

/**
 * StatusBadge — badge visual consistente para estados de história e conteúdo.
 *
 * @param {'free'|'premium'|'coming_soon'|'completed'|'in_progress'|'locked'|'saved'} type
 * @param {string} [label] — sobrescreve o label padrão
 * @param {'sm'|'md'} [size] — 'sm' (padrão) ou 'md'
 * @param {object} [style] — estilo extra no container
 */
export default function StatusBadge({ type, label, size = 'sm', style }) {
  const cfg = BADGE_CONFIG[type] ?? BADGE_CONFIG.coming_soon;
  const displayLabel = label ?? cfg.defaultLabel;
  const isMd = size === 'md';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: cfg.bg },
      isMd && styles.badgeMd,
      style,
    ]}>
      <Text style={[styles.text, { color: cfg.text }, isMd && styles.textMd]}>
        {cfg.icon} {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  text: {
    fontFamily: 'Nunito',
    fontSize: 10,
    fontWeight: '700',
  },
  textMd: {
    fontSize: 12,
  },
});
