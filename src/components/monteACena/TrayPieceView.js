/**
 * TrayPieceView.js — PEÇA NA BANDEJA com realce de SELEÇÃO animado (M1R7). A seleção NÃO cria overlay
 * nem faz a peça "surgir na tela": a própria peça da bandeja cresce um pouco (1 → 1.035), sobe 3–4 pt,
 * ganha contorno dourado (variante) e sombra maior. Ao selecionar outra, esta volta suavemente ao
 * normal. Enquanto a peça está ATIVA (arrasto/snap/retorno) ela fica invisível (o overlay a espelha).
 *
 * Puramente visual (RN Animated, useNativeDriver). O gesto vive no pai (GestureDetector).
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors as pt } from '../../theme/productTheme';
import { MONTE_A_CENA_MOTION as MOTION } from '../../data/monteACenaMotionTokens';
import PuzzlePiece from './PuzzlePiece';

export default function TrayPieceView({ piece, source, artW, artH, boardW, boardH, trayScale, selected, reduceMotion = false }) {
  const anim = useRef(new Animated.Value(0)).current; // 0 = normal, 1 = selecionado

  useEffect(() => {
    if (reduceMotion) { anim.setValue(selected ? 1 : 0); return undefined; }
    Animated.timing(anim, { toValue: selected ? 1 : 0, duration: MOTION.selectionDuration, useNativeDriver: true }).start();
    return undefined;
  }, [selected, reduceMotion, anim]);

  // escala 1 → 1.035, elevação 4 pt (a seleção NÃO cria peça nova; a própria peça da bandeja realça).
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }, { scale }] }, selected && styles.selShadow]}>
      <PuzzlePiece source={source} piece={piece} artW={artW} artH={artH} boardW={boardW} boardH={boardH} scale={trayScale} variant={selected ? 'selected' : 'tray'} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  selShadow: { shadowColor: pt.goldDeep, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 6 },
});
