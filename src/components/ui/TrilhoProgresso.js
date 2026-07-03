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
  // Fração clampada [0,1], blindada contra NaN/Infinity (progress pode chegar inválido).
  const safePct = Number.isFinite(progress) ? Math.max(0, Math.min(progress, 1)) : 0;
  // ⚠️ accessibilityValue.now é Int32 no New Architecture (Fabric): passar decimal quebra
  // o app na abertura ("Loss of precision during arithmetic conversion: (long long) 0.9").
  // Usar escala INTEIRA 0..100 (nunca a fração). O visual continua usando safePct * 100%.
  const accessibilityNow = Math.round(safePct * 100);
  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: accessibilityNow }}
    >
      <View
        style={[
          styles.fill,
          { width: `${safePct * 100}%`, borderRadius: height / 2 },
          safePct > 0 && safePct < 1 ? styles.fillPartial : null,
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
