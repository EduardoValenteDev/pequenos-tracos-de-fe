/**
 * StoryFocusModal — card de FOCO ao tocar num marco do mapa (estilo Livrinho).
 *
 * Em vez de navegar seco, o toque abre este overlay: fundo escurece, a capa
 * oficial aparece GRANDE em destaque, com título, estado e um botão principal.
 * A navegação para a história continua sendo a existente — acontece no botão,
 * via onOpen (que faz navigation.navigate('StoryDetail', { story })). Nada de
 * paywall/disponibilidade é burlado: bloqueada/Em breve apenas explicam com
 * delicadeza e o botão leva ao detalhe, que aplica a regra real.
 *
 * Só React Native / Animated (sem pacote novo): fade do fundo + scale do card.
 */
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Image, StyleSheet, Animated, Pressable, useWindowDimensions } from 'react-native';
import SoundButton from '../SoundButton';
import { getStoryCover } from '../../assets/storyCovers';

// Rótulo de estado + texto do botão por estado/progresso/motivo de bloqueio.
function describe(state, lockReason, progressPercent) {
  const inProgress = progressPercent > 0 && progressPercent < 100;
  switch (state) {
    case 'completed':
      return { badge: 'Concluída ✓', badgeColor: '#5EBE6E', cta: 'Rever história', ctaEnabled: true };
    case 'current':
      return { badge: 'Próxima aventura ✨', badgeColor: '#F4B73E', cta: inProgress ? 'Continuar aventura' : 'Começar aventura', ctaEnabled: true };
    case 'available':
      return { badge: 'Disponível', badgeColor: '#4FC3F7', cta: inProgress ? 'Continuar aventura' : 'Começar aventura', ctaEnabled: true };
    default: {
      // locked: distinguir Em breve x Plano Família com delicadeza.
      if (lockReason === 'coming_soon' || lockReason === 'media') {
        return { badge: 'Em breve', badgeColor: '#9C8FAE', cta: 'Ver detalhes', ctaEnabled: true, note: 'Essa aventura está chegando! ✨' };
      }
      return { badge: 'Plano Família', badgeColor: '#B07CD6', cta: 'Ver detalhes', ctaEnabled: true, note: 'Peça a um responsável para desbloquear.' };
    }
  }
}

export default function StoryFocusModal({ visible, story, state, lockReason, progressPercent = 0, onClose, onOpen }) {
  const { width } = useWindowDimensions();
  const backdrop = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      ]).start();
    } else {
      backdrop.setValue(0);
      scale.setValue(0.9);
    }
  }, [visible, backdrop, scale]);

  function handleClose() {
    Animated.timing(backdrop, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => onClose?.());
  }

  if (!story) return null;
  const cover = getStoryCover(story.id);
  const info = describe(state, lockReason, progressPercent);
  const cardW = Math.min(width - 40, 360);
  const coverH = Math.round((cardW - 24) * 9 / 16);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <Animated.View style={[styles.card, { width: cardW, transform: [{ scale }] }]}>
          <SoundButton style={styles.closeBtn} onPress={handleClose} accessibilityLabel="Fechar" activeOpacity={0.8}>
            <Text style={styles.closeText}>✕</Text>
          </SoundButton>

          <View style={[styles.coverWrap, { height: coverH }]}>
            {cover ? (
              <Image source={cover} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={[styles.coverFallback, { backgroundColor: story.corCapa || story.themeColor || '#BCA77E' }]}>
                <Text style={styles.coverFallbackText}>{(story.titulo || '?').trim().charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={[styles.stateBadge, { backgroundColor: info.badgeColor }]}>
              <Text style={styles.stateBadgeText}>{info.badge}</Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>{story.titulo}</Text>
          {!!story.referencia && <Text style={styles.reference}>{story.referencia}</Text>}
          {!!info.note && <Text style={styles.note}>{info.note}</Text>}

          <SoundButton style={styles.primaryBtn} onPress={onOpen} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>{info.cta} ▶</Text>
          </SoundButton>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,12,4,0.66)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 26,
    padding: 12,
    paddingBottom: 18,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 5,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  closeText: { fontSize: 16, color: '#6B5A3E', fontWeight: '900' },
  coverWrap: { width: '100%', borderRadius: 18, overflow: 'hidden', backgroundColor: '#EFE7D6' },
  cover: { width: '100%', height: '100%' },
  coverFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  coverFallbackText: { fontFamily: 'FredokaOne', fontSize: 48, color: '#FFFFFF' },
  stateBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  stateBadgeText: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  title: { fontFamily: 'FredokaOne', fontSize: 20, color: '#4A3A1E', textAlign: 'center', marginTop: 14 },
  reference: { fontFamily: 'Nunito', fontSize: 13, color: '#8A7A5E', fontWeight: '700', textAlign: 'center', marginTop: 2 },
  note: { fontFamily: 'Nunito', fontSize: 13, color: '#7A6A4E', fontWeight: '600', textAlign: 'center', marginTop: 8, marginHorizontal: 6 },
  primaryBtn: {
    marginTop: 16,
    marginHorizontal: 6,
    backgroundColor: '#FF8A3D',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF8A3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  primaryBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFFFFF' },
});
