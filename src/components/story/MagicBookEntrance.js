import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

/**
 * MagicBookEntrance — transição mágica curta ao abrir o Livrinho da Fé.
 *
 * Fundo escurece, o card do livro cresce suavemente no centro (scale 0.92→1,
 * opacity 0→1, leve translateY) e pequenas partículas de luz aparecem ao redor.
 * Usa apenas Animated nativo (sem dependência nova). Dura ~650ms e chama onDone.
 *
 * @param {*}        cover  — capa da história (opcional); sem capa usa o emoji
 * @param {string}   emoji
 * @param {function} onDone — chamado ao fim da animação (entra na leitura)
 */
const PARTICLES = [
  { x: 0.16, y: 0.30, size: 8, delay: 60 },
  { x: 0.82, y: 0.27, size: 6, delay: 150 },
  { x: 0.28, y: 0.72, size: 7, delay: 210 },
  { x: 0.74, y: 0.70, size: 9, delay: 110 },
  { x: 0.50, y: 0.17, size: 5, delay: 250 },
  { x: 0.64, y: 0.55, size: 6, delay: 300 },
  { x: 0.36, y: 0.45, size: 5, delay: 180 },
];

export default function MagicBookEntrance({ cover, emoji = '📖', onDone }) {
  const bg = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const ty = useRef(new Animated.Value(14)).current;
  const parts = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bg, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 340, useNativeDriver: true }),
      ...parts.map((p, i) =>
        Animated.sequence([
          Animated.delay(PARTICLES[i].delay),
          Animated.timing(p, { toValue: 1, duration: 440, useNativeDriver: true }),
        ]),
      ),
    ]).start();

    const t = setTimeout(() => { onDone?.(); }, 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.dark,
          { opacity: bg.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }) },
        ]}
      />

      {PARTICLES.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              opacity: parts[i].interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 0.25] }),
              transform: [{ scale: parts[i].interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.3] }) }],
            },
          ]}
        />
      ))}

      <Animated.View style={[styles.card, { opacity: op, transform: [{ scale }, { translateY: ty }] }]}>
        {cover ? (
          <Image source={cover} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.emojiBox}><Text style={styles.emoji}>{emoji}</Text></View>
        )}
        <Text style={styles.openLabel}>Abrindo seu livrinho…</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  dark: { backgroundColor: '#000' },
  particle: { position: 'absolute', backgroundColor: '#FFE9A8' },
  card: { alignItems: 'center' },
  cover: {
    width: 150, aspectRatio: 4 / 5, borderRadius: 16, overflow: 'hidden',
    elevation: 10, shadowColor: '#FFD166',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 18,
  },
  emojiBox: {
    width: 150, aspectRatio: 4 / 5, borderRadius: 16,
    backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center',
    elevation: 10, shadowColor: '#FFD166', shadowOpacity: 0.7, shadowRadius: 18,
  },
  emoji: { fontSize: 64 },
  openLabel: {
    fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF', marginTop: 16,
    textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
});
