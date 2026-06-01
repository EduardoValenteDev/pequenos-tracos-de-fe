import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, Easing } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

const COLORS = ['#FF8C42', '#FFD166', '#6EC6CA', '#6BCB77', '#E74C3C', '#8E44AD', '#FF6B9D', '#F1C40F'];

// Gerado uma única vez no módulo para posições consistentes
const PIECES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  x: (Math.random() - 0.5) * SCREEN_W * 1.1,
  y: -(Math.random() * 580 + 180),
  rotate: Math.random() * 720 - 360,
  scale: Math.random() * 0.6 + 0.5,
  delay: Math.floor(Math.random() * 180),
  width: Math.random() > 0.5 ? 10 : 7,
  height: Math.random() > 0.5 ? 14 : 10,
}));

function ConfettiPiece({ color, x, y, rotate, scale, delay, width, height }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = 900;

    // Fade in rápido
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Movimento X
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(translateX, {
        toValue: x,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Movimento Y
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(translateY, {
        toValue: y,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Rotação
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(rotateAnim, {
        toValue: rotate,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade out no final
    Animated.sequence([
      Animated.delay(delay + duration * 0.6),
      Animated.timing(opacity, {
        toValue: 0,
        duration: duration * 0.4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotateDeg = rotateAnim.interpolate({
    inputRange: [-720, 720],
    outputRange: ['-720deg', '720deg'],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          backgroundColor: color,
          width,
          height,
          borderRadius: width / 3,
          transform: [
            { translateX },
            { translateY },
            { rotate: rotateDeg },
            { scale },
          ],
          opacity,
        },
      ]}
    />
  );
}

export default function Confetti({ visible }) {
  if (!visible) return null;

  return (
    <>
      {PIECES.map(p => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: '45%',
    left: '50%',
  },
});
