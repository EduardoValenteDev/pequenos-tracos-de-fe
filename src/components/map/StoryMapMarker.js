/**
 * StoryMapMarker — marco de história no Mapa Pergaminho (M2.1).
 *
 * A capa OFICIAL é a protagonista: círculo grande, sem nenhum emoji por cima.
 * Estados (calculados pela tela, sem regra nova de paywall):
 *   completed — concluída (anel verde + selo ✓ pequeno)
 *   current   — próxima aventura (anel dourado + HALO de brilho + maior)
 *   available — desbloqueada, ainda não concluída (anel branco)
 *   locked    — premium/Em breve/não alcançada → adormecida ELEGANTE:
 *               capa com opacidade menor + leve véu + cadeado pequeno discreto.
 *               NUNCA emoji gigante.
 *
 * Título numa pílula CLARA (creme translúcido + texto escuro) — legível sobre a
 * arte, sem tarja preta pesada. Capa circular com fallback seguro (cor+inicial).
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import SoundButton from '../SoundButton';
import { getStoryCover } from '../../assets/storyCovers';

const RING = {
  completed: { color: '#5EBE6E', width: 4 },
  current:   { color: '#F4B73E', width: 5 },
  available: { color: '#FFFFFF', width: 4 },
  locked:    { color: '#D8CFC0', width: 3 },
};

export default function StoryMapMarker({ story, state = 'locked', onPress }) {
  const cover = getStoryCover(story.id);
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';
  const size = isCurrent ? 104 : 86;
  const ring = RING[state] || RING.available;
  const inner = size - ring.width * 2;

  // Pulso sutil no marco da próxima aventura (um elemento, leve).
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
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] });

  return (
    <SoundButton
      accessibilityLabel={`${story.titulo}${isLocked ? ' (bloqueada)' : ''}`}
      onPress={onPress}
      style={styles.touch}
      activeOpacity={0.85}
    >
      <View style={[styles.core, { width: size + 24, height: size + 24 }]}>
        {/* Halo de brilho pulsante só na história atual */}
        {isCurrent && (
          <Animated.View
            style={[
              styles.halo,
              { width: size + 22, height: size + 22, borderRadius: (size + 22) / 2, opacity: haloOpacity, transform: [{ scale: haloScale }] },
            ]}
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
            {isLocked && <View style={styles.lockVeil} pointerEvents="none" />}
          </View>

          {state === 'completed' && (
            <View style={[styles.badge, styles.doneBadge]}>
              <Text style={styles.doneBadgeText}>✓</Text>
            </View>
          )}
          {isLocked && (
            <View style={[styles.badge, styles.lockBadge]}>
              <Text style={styles.lockBadgeText}>🔒</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.labelPill, isLocked && styles.labelPillLocked]}>
        <Text
          style={[styles.label, isLocked && styles.labelLocked]}
          numberOfLines={2}
          ellipsizeMode="tail"
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {story.titulo}
        </Text>
      </View>
    </SoundButton>
  );
}

const styles = StyleSheet.create({
  touch: { width: 148, alignItems: 'center' },
  core: { alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    backgroundColor: 'rgba(244,183,62,0.30)',
    borderWidth: 2,
    borderColor: 'rgba(255,214,120,0.55)',
  },
  ring: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFDF8' },
  softShadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  currentShadow: {
    elevation: 9,
    shadowColor: '#F4B73E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },
  circle: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFE7D6' },
  cover: { width: '100%', height: '100%' },
  fallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontFamily: 'FredokaOne', fontSize: 36, color: '#FFFFFF' },
  lockVeil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(70,60,45,0.18)' },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doneBadge: { backgroundColor: '#5EBE6E' },
  doneBadgeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  lockBadge: { backgroundColor: '#8C8478' },
  lockBadgeText: { fontSize: 11 },
  labelPill: {
    marginTop: 6,
    maxWidth: 146,
    backgroundColor: 'rgba(255,250,238,0.94)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  labelPillLocked: { backgroundColor: 'rgba(247,242,232,0.78)' },
  label: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '800', color: '#4A3A1E', textAlign: 'center' },
  labelLocked: { color: '#8A7C66' },
});
