import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StatusBadge from '../ui/StatusBadge';
import { colors as pt, radii, shadows } from '../../theme/productTheme';

/**
 * SceneListItem — item de cena na lista de detalhes da história.
 *
 * @param {object}   cena          — objeto cena de stories.js
 * @param {number}   index         — índice na lista (0-based)
 * @param {'completed'|'available'|'locked'} status
 * @param {boolean}  hasDrawing    — há desenho salvo
 * @param {function} onPress
 */
export default function SceneListItem({ cena, index, status, hasDrawing, onPress }) {
  const isLocked = status === 'locked';
  const isDone = status === 'completed';
  const isAvailable = status === 'available';

  const numBg = isDone ? pt.greenSoft : isAvailable ? pt.goldSoft : pt.lockedBg;
  const numColor = isDone ? pt.freeText : isAvailable ? pt.premiumText : pt.lockedText;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        isLocked && styles.rowLocked,
        isDone && styles.rowDone,
      ]}
      onPress={isLocked ? undefined : onPress}
      activeOpacity={isLocked ? 1 : 0.8}
      disabled={isLocked}
    >
      {/* Número */}
      <View style={[styles.numCircle, { backgroundColor: numBg }]}>
        <Text style={[styles.numText, { color: numColor }]}>
          {isDone ? '✓' : String(index + 1)}
        </Text>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <Text style={[styles.name, isLocked && styles.nameLocked]} numberOfLines={2}>
          {cena.titulo ?? `Cena ${index + 1}`}
        </Text>
        {hasDrawing && !isLocked && (
          <StatusBadge type="saved" style={{ marginTop: 4 }} />
        )}
      </View>

      {/* Badge de estado */}
      <View style={styles.badgeArea}>
        {isDone && <StatusBadge type="completed" />}
        {isAvailable && <StatusBadge type="in_progress" label="Disponível" />}
        {isLocked && <StatusBadge type="locked" />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    ...shadows.soft,
  },
  rowLocked: {
    backgroundColor: pt.cream,
    opacity: 0.72,
  },
  rowDone: {
    borderLeftWidth: 3,
    borderLeftColor: pt.green,
  },
  numCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  numText: {
    fontFamily: 'FredokaOne',
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  name: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: pt.text,
    fontWeight: '700',
    lineHeight: 18,
  },
  nameLocked: {
    color: pt.muted,
    fontWeight: '600',
  },
  badgeArea: {
    flexShrink: 0,
  },
});
