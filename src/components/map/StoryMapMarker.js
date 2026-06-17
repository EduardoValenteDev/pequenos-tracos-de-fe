/**
 * StoryMapMarker — PIN pequeno de história no mapa (Full Map Region View).
 *
 * No mapa o marco é um PIN compacto (não cobre a arte). A capa grande aparece no
 * StoryFocusModal ao tocar. Estados:
 *   completed — concluída (anel verde + ✓ pequeno)
 *   current   — próxima aventura (anel dourado + halo pulsante leve)
 *   available — desbloqueada (anel branco)
 *   locked    — premium/Em breve (anel cinza + cadeado pequeno, capa esmaecida)
 *
 * Título só aparece para a história ATUAL ou CONCLUÍDA (pílula minúscula) — o
 * resto fica limpo; o nome aparece no modal ao tocar. Sem emoji dormindo.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import SoundButton from '../SoundButton';
import { getStoryCover } from '../../assets/storyCovers';

const SIZE = { current: 60, available: 50, completed: 50, locked: 46 };
const RING = {
  completed: { color: '#5EBE6E', width: 3 },
  current:   { color: '#F4B73E', width: 3 },
  available: { color: '#FFFFFF', width: 3 },
  locked:    { color: '#D8CFC0', width: 2 },
};

export default function StoryMapMarker({ story, state = 'locked', onPress }) {
  const cover = getStoryCover(story.id);
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';
  const size = SIZE[state] || SIZE.available;
  const ring = RING[state] || RING.available;
  const inner = size - ring.width * 2;
  const showLabel = state === 'current' || state === 'completed';

  // Pulso sutil só no pin da próxima aventura (um elemento, leve).
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

  return (
    <SoundButton
      accessibilityLabel={`${story.titulo}${isLocked ? ' (bloqueada)' : ''}`}
      onPress={onPress}
      style={styles.touch}
      activeOpacity={0.85}
    >
      <View style={[styles.core, { width: size + 18, height: size + 18 }]}>
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
      </View>

      {showLabel && (
        <View style={styles.labelPill}>
          <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">{story.titulo}</Text>
        </View>
      )}
    </SoundButton>
  );
}

const styles = StyleSheet.create({
  touch: { width: 88, alignItems: 'center' },
  core: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', backgroundColor: 'rgba(244,183,62,0.30)', borderWidth: 2, borderColor: 'rgba(255,214,120,0.55)' },
  ring: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFDF8' },
  softShadow: { elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, shadowRadius: 3 },
  currentShadow: { elevation: 7, shadowColor: '#F4B73E', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 8 },
  circle: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFE7D6' },
  cover: { width: '100%', height: '100%' },
  fallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontFamily: 'FredokaOne', fontSize: 20, color: '#FFFFFF' },
  badge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  doneBadge: { backgroundColor: '#5EBE6E' },
  doneBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  lockBadge: { backgroundColor: '#8C8478' },
  lockBadgeText: { fontSize: 9 },
  labelPill: {
    marginTop: 4,
    maxWidth: 86,
    backgroundColor: 'rgba(255,250,238,0.94)',
    borderRadius: 9,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  label: { fontFamily: 'Nunito', fontSize: 10, fontWeight: '800', color: '#4A3A1E', textAlign: 'center' },
});
