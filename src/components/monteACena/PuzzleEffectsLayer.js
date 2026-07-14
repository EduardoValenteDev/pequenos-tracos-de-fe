/**
 * PuzzleEffectsLayer.js — efeitos de encaixe e conclusão (itens 17/19). `pointerEvents:"none"`.
 *   snap:     anel dourado expandindo + 4–6 estrelinhas + brilho breve (~350–550 ms).
 *   complete: partículas douradas e roxas irradiando + brilho.
 * Respeita movimento reduzido (sem animação — mostra um flash curtíssimo estático e some).
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { colors as pt } from '../../theme/productTheme';

const STAR_ANGLES = [0, 60, 120, 180, 240, 300];
const PARTICLE_ANGLES = [10, 45, 80, 130, 170, 210, 250, 300, 340];

export default function PuzzleEffectsLayer({ effect, reduceMotion }) {
  const [shown, setShown] = useState(null);
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!effect) return undefined;
    setShown(effect);
    t.setValue(0);
    if (reduceMotion) {
      const id = setTimeout(() => setShown(null), 220);
      return () => clearTimeout(id);
    }
    const dur = effect.type === 'complete' ? 900 : 480;
    Animated.timing(t, { toValue: 1, duration: dur, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      .start(({ finished }) => { if (finished) setShown(null); });
    return undefined;
  }, [effect, reduceMotion, t]);

  if (!shown) return null;
  // ERRO: só um brilho/atenção suave no alvo incorreto (sem partículas, sem cruz vermelha).
  if (shown.type === 'error') {
    const eop = t.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.7, 0.5, 0] });
    const esc = t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.3] });
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.errRing, { left: shown.x - 34, top: shown.y - 34, opacity: eop, transform: [{ scale: esc }] }]} />
      </View>
    );
  }
  const isComplete = shown.type === 'complete';
  const reach = isComplete ? 120 : 46;
  const angles = isComplete ? PARTICLE_ANGLES : STAR_ANGLES;
  const ringScale = t.interpolate({ inputRange: [0, 1], outputRange: [0.2, isComplete ? 2.6 : 1.6] });
  const ringOpacity = t.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.9, 0.5, 0] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.ring, isComplete && styles.ringBig, {
        left: shown.x - 40, top: shown.y - 40, opacity: ringOpacity, transform: [{ scale: ringScale }],
      }]} />
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const tx = t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * reach] });
        const ty = t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * reach] });
        const op = t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.8, 0] });
        const color = isComplete ? (i % 2 ? pt.purple : pt.gold) : pt.gold;
        return (
          <Animated.View key={i} style={[styles.dot, { backgroundColor: color, left: shown.x - 4, top: shown.y - 4, opacity: op, transform: [{ translateX: tx }, { translateY: ty }] }]} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: pt.goldDeep },
  ringBig: { borderColor: pt.gold },
  errRing: { position: 'absolute', width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: '#E0A21A' },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
});
