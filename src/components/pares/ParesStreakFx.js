/**
 * ParesStreakFx.js — efeitos do "Fogo da Memória" (R2B · §8).
 *
 * Dois efeitos, cada um remontado por `key` do evento (assim um evento ANTIGO nunca apaga
 * o efeito NOVO — §8):
 *   • ParesSpark  — a centelha que sai do CENTRO do par e sobe rumo ao medidor. Vive DENTRO
 *                   do bloco da grade (mesmas coordenadas das cartas), então nasce no par.
 *   • ParesFogoEmbers — pequenas brasas subindo pelas BORDAS da tela no 4º par seguido.
 *                   Máx. 700 ms; não cobre cartas nem rostos (só as margens laterais).
 *
 * Tudo com useNativeDriver (translate/opacity/scale). pointerEvents="none": nunca rouba
 * toque nem interrompe a próxima jogada.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

const QUENTE = '#FFB84D';
const QUENTE_FORTE = '#F3722C';

/**
 * Centelha do par → medidor. `x`,`y` são o CENTRO do par em coordenadas do bloco da grade.
 * `toX` é o alvo horizontal (centro/topo, onde fica o medidor). Remontar por key reinicia limpo.
 */
export function ParesSpark({ x = 0, y = 0, toX = 0, level = 1, reduceMotion = false }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(t, {
      toValue: 1, duration: reduceMotion ? 200 : 560, useNativeDriver: true, easing: Easing.out(Easing.quad),
    });
    anim.start();
    return () => anim.stop();
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -(y + 46)] });
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, (toX - x)] });
  const opacity = t.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 1, 0] });
  const scale = t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 1, 0.35] });
  const cor = level >= 3 ? '#FFD36B' : QUENTE;

  return (
    <Animated.View pointerEvents="none" style={[styles.sparkWrap, { left: x, top: y, opacity, transform: [{ translateX }, { translateY }, { scale }] }]}>
      <View style={[styles.spark, { backgroundColor: cor, shadowColor: cor }]} />
      <View style={[styles.sparkMini, { top: -8, left: 4, backgroundColor: cor }]} />
      <View style={[styles.sparkMini, { top: 6, left: -6, backgroundColor: cor }]} />
    </Animated.View>
  );
}

/** Brasas subindo pelas margens laterais no Fogo da Memória. Máx. 700 ms. */
export function ParesFogoEmbers({ width = 360, height = 640, reduceMotion = false }) {
  const N = reduceMotion ? 0 : 6;
  const vals = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (!N) return undefined;
    const anims = vals.slice(0, N).map((v, i) => Animated.timing(v, {
      toValue: 1, duration: 680, delay: i * 40, useNativeDriver: true, easing: Easing.out(Easing.quad),
    }));
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  if (!N) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {vals.slice(0, N).map((v, i) => {
        const esquerda = i % 2 === 0;
        const x = esquerda ? 6 + (i * 2) : width - 14 - (i * 2);
        const ty = v.interpolate({ inputRange: [0, 1], outputRange: [0, -(height * 0.55)] });
        const op = v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.85, 0] });
        const sc = v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] });
        return (
          <Animated.View
            key={i}
            style={[styles.ember, { left: x, top: height * 0.82, opacity: op, transform: [{ translateY: ty }, { scale: sc }] }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sparkWrap: { position: 'absolute', width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  spark: {
    width: 12, height: 12, borderRadius: 6,
    shadowOpacity: 0.9, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4,
  },
  sparkMini: { position: 'absolute', width: 5, height: 5, borderRadius: 2.5, opacity: 0.9 },
  ember: {
    position: 'absolute', width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: QUENTE_FORTE,
    shadowColor: QUENTE, shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 }, elevation: 3,
  },
});

export default { ParesSpark, ParesFogoEmbers };
