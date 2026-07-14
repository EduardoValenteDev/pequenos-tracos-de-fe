/**
 * PuzzleCoach.js — faixa do Beni de ALTURA FIXA (item 9). Recolher troca só o conteúdo (fala↔compacto)
 * — a altura externa nunca muda, então nunca altera a posição do tabuleiro. Não entra no tabuleiro,
 * não intercepta o gesto (fica acima, com sua própria área).
 */

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import BeniAvatar from '../beni/BeniAvatar';

export default function PuzzleCoach({ top, height, left, right, expanded, message, celebrating, onToggle }) {
  return (
    <Pressable
      style={[styles.band, { top, height, left, right }]}
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`Beni diz: ${message}`}
    >
      <BeniAvatar variant={celebrating ? 'celebrating' : 'happy'} size="small" />
      {expanded
        ? <Text style={styles.text} numberOfLines={2}>{message}</Text>
        : <Text style={styles.compact}>Toque para ver a dica</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute', zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, backgroundColor: pt.cream, borderRadius: radii.lg, ...shadows.soft,
  },
  text: { flex: 1, fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.text, lineHeight: 18 },
  compact: { flex: 1, fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: pt.textSoft },
});
