/**
 * GuidanceCorridor.js — CORREDOR DE ORIENTAÇÃO (M1R6 §9.3). Faixa FIXA (48–56 pt) entre o tabuleiro
 * e a bandeja. É uma zona REAL do layout (reserva a própria altura) — a mensagem troca DENTRO dela,
 * sem empurrar tabuleiro nem bandeja. Mostra a orientação do Beni, acerto, erro e dica.
 *
 * A troca de mensagem faz um cross-fade curto; o tamanho da faixa NUNCA muda.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors as pt } from '../../theme/productTheme';
import BeniAvatar from '../beni/BeniAvatar';

export default function GuidanceCorridor({ message, height, tone = 'neutral', reduceMotion = false }) {
  const fade = useRef(new Animated.Value(1)).current;
  const shown = useRef(message);

  useEffect(() => {
    if (message === shown.current) return undefined;
    if (reduceMotion) { shown.current = message; fade.setValue(1); return undefined; }
    Animated.timing(fade, { toValue: 0, duration: 110, useNativeDriver: true }).start(() => {
      shown.current = message;
      Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
    return undefined;
  }, [message, reduceMotion, fade]);

  const toneStyle = tone === 'success' ? styles.success : (tone === 'error' ? styles.error : styles.neutral);

  return (
    <View style={[styles.band, { height }]}>
      <View style={styles.beniDot}>
        <BeniAvatar variant={tone === 'success' ? 'celebrating' : 'happy'} size="small" />
      </View>
      <Animated.Text style={[styles.msg, toneStyle, { opacity: fade }]} numberOfLines={2}>
        {shown.current}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10,
    paddingHorizontal: 18,
  },
  beniDot: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  msg: { flex: 1, fontFamily: 'FredokaOne', fontSize: 15, lineHeight: 19 },
  neutral: { color: pt.purpleDeep },
  success: { color: pt.greenDeep },
  error: { color: pt.goldDeep },
});
