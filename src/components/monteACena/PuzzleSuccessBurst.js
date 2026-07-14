/**
 * PuzzleSuccessBurst.js — EFEITO DE ACERTO (M1R6 · M1R8A). Anel dourado que se expande + estrelinhas
 * ao redor da peça encaixada. LOCALIZADO na região da peça (não cobre a cena inteira, não altera a
 * opacidade da peça encaixada).
 *
 * M1R8A: cada instância é KEYED por `successEventId` (a tela usa key={successEventId}). Assim CADA
 * acerto tem seu próprio componente independente — anima ao MONTAR e se remove sozinho via `onDone`.
 * Não há timer compartilhado nem estado global: um efeito antigo NUNCA apaga um efeito novo, e um
 * encaixe seguinte não cancela o anterior.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors as pt } from '../../theme/productTheme';
import { MONTE_A_CENA_MOTION as MOTION } from '../../data/monteACenaMotionTokens';

const STAR_ANGLES = [45, 135, 225, 315];

export default function PuzzleSuccessBurst({ eventId, x, y, size, reduceMotion = false, onDone }) {
  const ring = useRef(new Animated.Value(0)).current;
  const stars = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // anima UMA vez ao montar (instância fresca por successEventId); ao terminar, pede a própria remoção.
    ring.setValue(0); stars.setValue(0);
    const dur = reduceMotion ? Math.round(MOTION.successEffectDuration * 0.55) : MOTION.successEffectDuration;
    const anim = Animated.parallel([
      Animated.timing(ring, { toValue: 1, duration: dur, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(stars, { toValue: 1, duration: reduceMotion ? 120 : 220, useNativeDriver: true }),
        Animated.timing(stars, { toValue: 0, duration: reduceMotion ? 120 : 300, useNativeDriver: true }),
      ]),
    ]);
    anim.start(({ finished }) => { if (finished && onDone) onDone(eventId); });
    return () => anim.stop();
    // eventId é a identidade da instância (via key); dispara só na montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!size) return null;

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.85, 0] });
  const starRadius = size * 0.62;
  const starScale = stars.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const angles = reduceMotion ? STAR_ANGLES.slice(0, 2) : STAR_ANGLES;

  const cx = x + size / 2;
  const cy = y + size / 2;
  const ringD = size * 0.9;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[styles.ring, {
          left: cx - ringD / 2, top: cy - ringD / 2, width: ringD, height: ringD, borderRadius: ringD / 2,
          opacity: ringOpacity, transform: [{ scale: ringScale }],
        }]}
      />
      {angles.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const sx = cx + Math.cos(rad) * starRadius - 6;
        const sy = cy + Math.sin(rad) * starRadius - 6;
        return (
          <Animated.View key={deg} style={[styles.star, { left: sx, top: sy, opacity: stars, transform: [{ scale: starScale }] }]} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', borderWidth: 3, borderColor: pt.gold, backgroundColor: 'rgba(249,199,79,0.12)' },
  star: { position: 'absolute', width: 12, height: 12, borderRadius: 3, backgroundColor: pt.gold, transform: [{ rotate: '45deg' }] },
});
