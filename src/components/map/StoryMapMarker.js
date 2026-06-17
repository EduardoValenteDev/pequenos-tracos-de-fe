/**
 * StoryMapMarker — marcador (pin médio) do Mapa Pergaminho (M3).
 *
 * O pin fica CENTRADO na âncora (coordenada normalizada da história) e o label
 * sai SEMPRE para um lado seguro (below/left/right), em até 2 linhas, sem cortar
 * pela tela. Tamanhos MÉDIOS (presença sem cobrir o mapa). A capa grande aparece
 * no StoryFocusModal. Estados: completed (✓), current (anel dourado + halo),
 * available (anel branco), locked (anel cinza + cadeado, capa esmaecida). Sem emoji.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import SoundButton from '../SoundButton';
import { getStoryCover } from '../../assets/storyCovers';

// Tamanhos reduzidos de novo (B3.2): pins mais delicados sobre a arte, ainda com
// avatar/badge legíveis e bons de tocar. As histórias ficam diretamente sobre o
// cenário do mapa (sem base/círculo atrás — removido na correção do B2.8).
const SIZE = { current: 68, available: 58, completed: 58, locked: 56 };
const RING = {
  completed: { color: '#5EBE6E', width: 3 },
  current:   { color: '#F4B73E', width: 4 },
  available: { color: '#FFFFFF', width: 3 },
  locked:    { color: '#D8CFC0', width: 2 },
};
const LABEL_W = 84; // legenda ainda menor (B3.2) — ocupa menos do mapa

// Caixa do label posicionada por lado, mantendo-se SEMPRE dentro da tela (o pin
// está em x ~0.40–0.78, então uma caixa de ~84px ao redor cabe nos dois lados).
function labelBoxStyle(side, size) {
  const below = { top: size + 3, left: (size - LABEL_W) / 2, width: LABEL_W, alignItems: 'center' };
  if (side === 'left') return { ...below, left: (size - LABEL_W) / 2 - 12, alignItems: 'flex-start' };
  if (side === 'right') return { ...below, left: (size - LABEL_W) / 2 + 12, alignItems: 'flex-end' };
  return below;
}

export default function StoryMapMarker({ story, state = 'locked', labelPos = 'below', onPress }) {
  const cover = getStoryCover(story.id);
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';
  const size = SIZE[state] || SIZE.available;
  const ring = RING[state] || RING.available;
  const inner = size - ring.width * 2;

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isCurrent) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isCurrent, pulse]);
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] });

  // O pin (SoundButton) tem tamanho `size` e fica centrado na âncora (slot 0×0).
  return (
    <SoundButton
      accessibilityLabel={`${story.titulo}${isLocked ? ' (bloqueada)' : ''}`}
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.pin, { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }]}
    >
      {isCurrent && (
        <Animated.View
          style={[styles.halo, { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2, opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
        />
      )}
      <View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, borderColor: ring.color, borderWidth: ring.width },
          isCurrent ? styles.currentShadow : styles.softShadow,
        ]}
      >
        <View style={[styles.circle, { width: inner, height: inner, borderRadius: inner / 2 }]}>
          {cover ? (
            <Image source={cover} style={[styles.cover, isLocked && { opacity: 0.55 }]} resizeMode="cover" />
          ) : (
            <View style={[styles.fallback, { backgroundColor: story.corCapa || story.themeColor || '#BCA77E' }]}>
              <Text style={styles.fallbackText}>{(story.titulo || '?').trim().charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        {state === 'completed' && (
          <View style={[styles.badge, styles.doneBadge]}><Text style={styles.doneBadgeText}>✓</Text></View>
        )}
        {isLocked && (
          <View style={[styles.badge, styles.lockBadge]}><Text style={styles.lockBadgeText}>🔒</Text></View>
        )}
      </View>

      {/* Label SEMPRE dentro da tela, no lado seguro, até 2 linhas */}
      <View style={[styles.labelBox, labelBoxStyle(labelPos, size)]}>
        <View style={[styles.labelPill, isLocked && styles.labelPillLocked]}>
          <Text
            style={[styles.label, isLocked && styles.labelLocked]}
            numberOfLines={2}
            ellipsizeMode="tail"
            adjustsFontSizeToFit
            minimumFontScale={0.78}
          >
            {story.titulo}
          </Text>
        </View>
      </View>
    </SoundButton>
  );
}

const styles = StyleSheet.create({
  pin: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', backgroundColor: 'rgba(244,183,62,0.30)', borderWidth: 2, borderColor: 'rgba(255,214,120,0.55)' },
  ring: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFDF8' },
  softShadow: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  currentShadow: { elevation: 8, shadowColor: '#F4B73E', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 10 },
  circle: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFE7D6' },
  cover: { width: '100%', height: '100%' },
  fallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontFamily: 'FredokaOne', fontSize: 26, color: '#FFFFFF' },
  badge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doneBadge: { backgroundColor: '#5EBE6E' },
  doneBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  lockBadge: { backgroundColor: '#8C8478' },
  lockBadgeText: { fontSize: 9 },
  labelBox: { position: 'absolute' },
  labelPill: {
    backgroundColor: 'rgba(255,250,238,0.94)',
    borderRadius: 8,
    paddingVertical: 1.5,
    paddingHorizontal: 6,
  },
  labelPillLocked: { backgroundColor: 'rgba(247,242,232,0.80)' },
  label: { fontFamily: 'Nunito', fontSize: 9, fontWeight: '800', color: '#4A3A1E', textAlign: 'center' },
  labelLocked: { color: '#8A7C66' },
});
