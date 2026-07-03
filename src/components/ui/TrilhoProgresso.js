import React from 'react';
import { View, StyleSheet } from 'react-native';
import { color } from '../../theme/tokens';

/**
 * TrilhoProgresso — A0.4 (Direção de Arte v1.1). Barra de progresso do mundo papel:
 * trilho paper300 preenchido por DOURADO (gold300 com borda gold500) — nunca o
 * "verde de progresso" antigo. Só tokens. Não aplicado a nenhuma tela ainda.
 *
 * Props: progress (0..1), height (default 8), style.
 */
export default function TrilhoProgresso({ progress = 0, height = 8, style }) {
  const pct = Math.max(0, Math.min(1, progress ?? 0));
  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 1, now: pct }}
    >
      <View
        style={[
          styles.fill,
          { width: `${pct * 100}%`, borderRadius: height / 2 },
          pct > 0 && pct < 1 ? styles.fillPartial : null,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: color.paper300,   // trilho inativo
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: color.gold300,    // preenchimento dourado (recompensa)
  },
  fillPartial: {
    borderRightWidth: 1,
    borderRightColor: color.gold500,   // fronteira dourada no avanço parcial
  },
});
