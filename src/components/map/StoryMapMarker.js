/**
 * StoryMapMarker — marco de história no Mapa Pergaminho (M2).
 *
 * A capa OFICIAL é a estrela: círculo grande, sem nenhum emoji por cima.
 * Estados (calculados pela tela, sem regra nova de paywall):
 *   completed — concluída (anel verde + selo ✓ pequeno)
 *   current   — próxima aventura (anel dourado, maior, brilho suave)
 *   available — desbloqueada, ainda não concluída (anel azul)
 *   locked    — premium/Em breve/não alcançada → adormecida ELEGANTE:
 *               capa com opacidade menor + leve camada translúcida + cadeado
 *               pequeno discreto. NUNCA emoji gigante.
 *
 * Capa recortada em círculo; fallback seguro (cor + inicial) sem capa — sem crash.
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
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
  const size = isCurrent ? 112 : 96;
  const ring = RING[state] || RING.available;
  const inner = size - ring.width * 2;

  return (
    <SoundButton
      accessibilityLabel={`${story.titulo}${isLocked ? ' (bloqueada)' : ''}`}
      onPress={onPress}
      style={styles.touch}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, borderColor: ring.color, borderWidth: ring.width },
          isCurrent ? styles.currentShadow : styles.softShadow,
        ]}
      >
        <View style={[styles.circle, { width: inner, height: inner, borderRadius: inner / 2 }]}>
          {cover ? (
            <Image
              source={cover}
              style={[styles.cover, isLocked && { opacity: 0.55 }]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.fallback, { backgroundColor: story.corCapa || story.themeColor || '#BCA77E' }]}>
              <Text style={styles.fallbackText}>{(story.titulo || '?').trim().charAt(0).toUpperCase()}</Text>
            </View>
          )}
          {/* Camada translúcida discreta só nos bloqueados (adormecido elegante) */}
          {isLocked && <View style={styles.lockVeil} pointerEvents="none" />}
        </View>

        {/* Selos pequenos no canto — nunca cobrem a capa */}
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

      <View style={[styles.labelPill, isLocked && styles.labelPillLocked]}>
        <Text style={styles.label} numberOfLines={2}>{story.titulo}</Text>
      </View>
    </SoundButton>
  );
}

const styles = StyleSheet.create({
  touch: { width: 132, alignItems: 'center' },
  ring: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFDF8' },
  softShadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  currentShadow: {
    elevation: 8,
    shadowColor: '#F4B73E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 9,
  },
  circle: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFE7D6' },
  cover: { width: '100%', height: '100%' },
  fallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontFamily: 'FredokaOne', fontSize: 34, color: '#FFFFFF' },
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
    marginTop: 8,
    maxWidth: 128,
    backgroundColor: 'rgba(40,30,15,0.62)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  labelPillLocked: { backgroundColor: 'rgba(40,30,15,0.42)' },
  label: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
});
