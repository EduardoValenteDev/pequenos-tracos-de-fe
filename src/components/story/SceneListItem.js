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
 * @param {boolean}  entryBlocked  — [FIX 2] a história inteira está sem autorização de ENTRADA no
 *                                   conteúdo. Nem os cartões já concluídos abrem: o selo de
 *                                   concluída continua ali (o progresso é real e permanece), mas o
 *                                   toque não leva a lugar nenhum.
 * @param {string}   lockedHint    — [FIX 2] frase do estado bloqueado. Quando a aventura anterior é
 *                                   que segura, ela diz isso; sem frase, segue o texto de sempre.
 * @param {function} onPress
 *
 * [P3J] A prop `hasDrawing` (selo "desenho salvo") saiu com o Colorir legado por cena: era o
 * único produtor de desenhos por cena, e sem ele nenhuma cena pode voltar a ter um.
 */
export default function SceneListItem({ cena, index, status, entryBlocked = false, lockedHint, onPress }) {
  const isLocked = status === 'locked';
  const isDone = status === 'completed';
  const isAvailable = status === 'available';
  // Bloqueio de ENTRADA vale para todo cartão — inclusive os concluídos.
  const blocked = isLocked || entryBlocked === true;
  const hintText = lockedHint || 'Complete a cena anterior';

  const numBg = isDone ? pt.greenSoft : isAvailable ? pt.goldSoft : pt.lockedBg;
  const numColor = isDone ? pt.freeText : isAvailable ? pt.premiumText : pt.lockedText;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        isLocked && styles.rowLocked,
        isDone && styles.rowDone,
      ]}
      onPress={blocked ? undefined : onPress}
      activeOpacity={blocked ? 1 : 0.8}
      disabled={blocked}
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
        {blocked && (
          <Text style={styles.lockedHint}>{hintText}</Text>
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
