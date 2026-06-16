/**
 * StoryMapMarker — marco de história no Mapa Pergaminho.
 *
 * Estados (calculados pela tela, sem regra nova de paywall):
 *   completed — história concluída (anel verde + ✓, alegre)
 *   current   — próxima aventura disponível (anel dourado, maior, "Você está aqui")
 *   available — desbloqueada, ainda não concluída (anel azul)
 *   locked    — premium/Em breve/não alcançada (adormecida: tom lavanda + 😴)
 *
 * Capa recortada em CÍRCULO quando disponível; fallback seguro (cor + inicial)
 * quando a história ainda não tem capa — nunca quebra.
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import SoundButton from '../SoundButton';
import { getStoryCover } from '../../assets/storyCovers';

const RING = {
  completed: { color: '#66BB6A', width: 4 },
  current:   { color: '#F0A93B', width: 5 },
  available: { color: '#4FC3F7', width: 3 },
  locked:    { color: '#C7B8D9', width: 3 },
};

export default function StoryMapMarker({ story, state = 'locked', onPress }) {
  const cover = getStoryCover(story.id);
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';
  const size = isCurrent ? 84 : 68;
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
          isCurrent && styles.currentShadow,
        ]}
      >
        <View style={[styles.circle, { width: inner, height: inner, borderRadius: inner / 2 }]}>
          {cover ? (
            <Image
              source={cover}
              style={[styles.cover, { opacity: isLocked ? 0.5 : 1 }]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.fallback, { backgroundColor: story.corCapa || story.themeColor || '#BCA77E' }]}>
              <Text style={styles.fallbackText}>{(story.titulo || '?').trim().charAt(0).toUpperCase()}</Text>
            </View>
          )}
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockEmoji}>😴</Text>
            </View>
          )}
        </View>

        {state === 'completed' && (
          <View style={styles.doneBadge}>
            <Text style={styles.doneBadgeText}>✓</Text>
          </View>
        )}
      </View>

      <Text style={[styles.label, isLocked && styles.labelLocked]} numberOfLines={1}>
        {story.titulo}
      </Text>
      {isCurrent && <Text style={styles.hereTag}>Você está aqui ✨</Text>}
    </SoundButton>
  );
}

const styles = StyleSheet.create({
  touch: { width: 112, alignItems: 'center' },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF8',
  },
  currentShadow: {
    elevation: 6,
    shadowColor: '#F0A93B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  circle: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFE7D6' },
  cover: { width: '100%', height: '100%' },
  fallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontFamily: 'FredokaOne', fontSize: 26, color: '#FFFFFF' },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(199,184,217,0.30)',
  },
  lockEmoji: { fontSize: 22 },
  doneBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#66BB6A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doneBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  label: {
    marginTop: 6,
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '700',
    color: '#5B4A2E',
    textAlign: 'center',
  },
  labelLocked: { color: '#9C8FAE' },
  hereTag: {
    marginTop: 2,
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '800',
    color: '#E08A1E',
  },
});
