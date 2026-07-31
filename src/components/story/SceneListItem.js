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
 * @param {function} onPress
 *
 * [P3J] A prop `hasDrawing` (selo "desenho salvo") saiu com o Colorir legado por cena: era o
 * único produtor de desenhos por cena, e sem ele nenhuma cena pode voltar a ter um.
 */
export default function SceneListItem({ cena, index, status, onPress }) {
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
        {isLocked && (
          <Text style={styles.lockedHint}>Complete a cena anterior</Text>
        )}
      </View>

      {/* Badge de estado */}
      <View style={styles.badgeArea}>
        {isDone && <StatusBadge type="completed" />}
        {isAvailable && <StatusBadge type="in_progress" label="Disponível" />}
        {isLocked && <StatusBadge type="locked" label="Bloqueada" />}
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
    opacity: 0.9,
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
    color: pt.textSoft,
    fontWeight: '700',
  },
  lockedHint: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.muted,
    fontStyle: 'italic', marginTop: 3,
  },
  badgeArea: {
    flexShrink: 0,
  },
});
