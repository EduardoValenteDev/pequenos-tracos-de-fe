/**
 * PuzzleTarget.js — ALVO com SEU PRÓPRIO gesto de toque (M1R5 · materialidade M1R6). Substitui o
 * onPress global do tabuleiro. Ao tocar, chama onTap(targetPieceId) — o motor compara com a peça
 * selecionada e SÓ encaixa se for o alvo correto (nunca procura o alvo correto quando a criança toca
 * em outro).
 *
 * MODO SEGURO: o gesto usa `.runOnJS(true)` (mesma política do motor js-safe — decisão no runtime JS).
 * Feedback visual (M1R6):
 *   • pulso ÂMBAR breve quando este alvo recebeu um toque errado (`pulseKey` muda → anima).
 *   • brilho de dica quando é o alvo correto e a criança já errou 2× (`hintLevel` 1) / 4× (2).
 *   Nada disso encaixa automaticamente — a ação continua com a criança.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { colors as pt } from '../../theme/productTheme';

export default function PuzzleTarget({ targetPieceId, left, top, width, height, onTap, hintLevel = 0, pulseKey = 0, reduceMotion = false }) {
  const tap = Gesture.Tap().runOnJS(true).maxDistance(18).onEnd(() => { onTap(targetPieceId); });

  // Pulso âmbar de erro: sobe e volta quando pulseKey muda.
  const amber = useRef(new Animated.Value(0)).current;
  const firstPulse = useRef(true);
  useEffect(() => {
    if (firstPulse.current) { firstPulse.current = false; return; } // ignora o valor inicial
    if (reduceMotion) {
      amber.setValue(1);
      const t = setTimeout(() => amber.setValue(0), 200);
      return () => clearTimeout(t);
    }
    amber.setValue(0);
    Animated.sequence([
      Animated.timing(amber, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(amber, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
    return undefined;
  }, [pulseKey, reduceMotion, amber]);

  // Brilho de dica (sutil pulso contínuo) quando é o alvo correto após erros repetidos.
  const hint = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (hintLevel <= 0 || reduceMotion) { hint.setValue(hintLevel > 0 ? 0.6 : 0); return undefined; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(hint, { toValue: 1, duration: 620, useNativeDriver: true }),
      Animated.timing(hint, { toValue: 0.35, duration: 620, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [hintLevel, reduceMotion, hint]);

  const amberOpacity = amber.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] });
  const hintOpacity = hintLevel <= 0 ? 0 : hint.interpolate({ inputRange: [0, 1], outputRange: [0.2, hintLevel >= 2 ? 0.85 : 0.55] });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.target, { left, top, width, height }]} accessibilityRole="button" accessibilityLabel="Espaço da peça no desenho">
        {hintLevel > 0 && (
          <Animated.View pointerEvents="none" style={[styles.hintGlow, { opacity: hintOpacity, borderWidth: hintLevel >= 2 ? 3 : 2 }]} />
        )}
        <Animated.View pointerEvents="none" style={[styles.amber, { opacity: amberOpacity }]} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  target: { position: 'absolute', backgroundColor: 'transparent', borderRadius: 12 },
  hintGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 12, borderColor: pt.goldDeep, backgroundColor: 'rgba(249,199,79,0.12)' },
  amber: { ...StyleSheet.absoluteFillObject, borderRadius: 12, borderWidth: 2.5, borderColor: pt.goldDeep, backgroundColor: 'rgba(224,162,26,0.16)' },
});
