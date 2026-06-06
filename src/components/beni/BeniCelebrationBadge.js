import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BeniAvatar from './BeniAvatar';
import { colors as pt, radii, shadows } from '../../theme/productTheme';

/**
 * BeniCelebrationBadge — célula de celebração com Beni.
 * Usado na conclusão de cenas, estrelas e conquistas.
 *
 * @param {string} [message] — mensagem de celebração
 * @param {object} [style]
 */
export default function BeniCelebrationBadge({
  message = 'Parabéns! Você arrasou!',
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <BeniAvatar variant="celebrating" size="small" />
      <Text style={styles.stars}>⭐⭐⭐</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: pt.goldSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: pt.gold + '60',
    ...shadows.soft,
  },
  stars: { fontSize: 14 },
  message: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: pt.premiumText,
    fontWeight: '700',
    flex: 1,
  },
});
