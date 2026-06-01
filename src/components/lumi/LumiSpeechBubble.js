import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LumiAvatar from './LumiAvatar';
import { colors as pt, radii, shadows } from '../../theme/productTheme';

/**
 * LumiSpeechBubble — balão de fala com Lumi para orientação contextual inline.
 * Usado na NarrationScreen e em outros contextos de guia breve.
 *
 * @param {string}  message   — texto do balão
 * @param {boolean} [compact] — versão compacta (avatar menor)
 * @param {object}  [style]   — estilo extra
 */
export default function LumiSpeechBubble({ message, compact = false, style }) {
  return (
    <View style={[styles.row, compact && styles.rowCompact, style]}>
      <LumiAvatar
        variant="happy"
        size={compact ? 'small' : 'medium'}
        style={styles.avatar}
      />
      <View style={[styles.bubble, compact && styles.bubbleCompact]}>
        {/* Ponta do balão */}
        <View style={styles.bubbleTip} />
        <Text style={[styles.text, compact && styles.textCompact]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowCompact: {
    gap: 8,
  },
  avatar: {
    flexShrink: 0,
  },
  bubble: {
    flex: 1,
    backgroundColor: pt.blueSoft,
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1.5,
    borderColor: pt.blue + '50',
    position: 'relative',
    ...shadows.soft,
  },
  bubbleCompact: {
    padding: 9,
    borderRadius: radii.sm,
  },
  bubbleTip: {
    position: 'absolute',
    left: -7,
    top: '40%',
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: pt.blue + '50',
  },
  text: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: pt.text,
    lineHeight: 19,
    fontWeight: '700',
  },
  textCompact: {
    fontSize: 12,
    lineHeight: 17,
  },
});
