/**
 * StoryFocusModal — card de FOCO ao tocar num marco do mapa (estilo Livrinho).
 *
 * Em vez de navegar seco, o toque abre este overlay com mágica: o fundo escurece
 * (fade), o card SOBE (slide) e a capa CRESCE (scale com mola), com brilhos
 * decorativos por código. A capa oficial aparece grande, com título, estado e um
 * botão principal com gradiente premium. A navegação continua sendo a existente —
 * acontece no botão, via onOpen → navigation.navigate('StoryDetail', { story }).
 * Bloqueada/Em breve só explicam com delicadeza; nada é burlado.
 *
 * Só React Native / Animated + expo-linear-gradient (já no projeto). Sem pacote novo.
 */
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Image, StyleSheet, Animated, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from '../SoundButton';
import { getStoryCover } from '../../assets/storyCovers';

// Rótulo de estado + texto do botão por estado/progresso/motivo de bloqueio.
function describe(state, lockReason, progressPercent) {
  const inProgress = progressPercent > 0 && progressPercent < 100;
  switch (state) {
    case 'completed':
      return { badge: 'Concluída ✓', badgeColor: '#5EBE6E', cta: 'Rever história' };
    case 'current':
      return { badge: 'Próxima aventura ✨', badgeColor: '#F4B73E', cta: inProgress ? 'Continuar aventura' : 'Começar aventura' };
    case 'available':
      return { badge: 'Disponível', badgeColor: '#4FC3F7', cta: inProgress ? 'Continuar aventura' : 'Começar aventura' };
    default:
      if (lockReason === 'coming_soon' || lockReason === 'media') {
        return { badge: 'Em breve', badgeColor: '#9C8FAE', cta: 'Ver detalhes', note: 'Essa aventura está chegando! ✨' };
      }
      return { badge: 'Plano Família', badgeColor: '#B07CD6', cta: 'Ver detalhes', note: 'Peça a um responsável para desbloquear.' };
  }
}

// Brilhos decorativos por código (sem imagens/emoji): pequenos pontos que pulsam
// suavemente ao redor da capa para dar sensação de recompensa.
const SPARKS = [
  { top: 6, left: 14, size: 7 },
  { top: 20, right: 18, size: 5 },
  { bottom: 18, left: 22, size: 6 },
  { bottom: 8, right: 26, size: 8 },
];

export default function StoryFocusModal({ visible, story, state, lockReason, progressPercent = 0, onClose, onOpen }) {
  const { width } = useWindowDimensions();
  const backdrop = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current; // 0 = fechado, 1 = aberto

  useEffect(() => {
    if (visible) {
      backdrop.setValue(0);
      pop.setValue(0);
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, friction: 6.5, tension: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, backdrop, pop]);

  function handleClose() {
    Animated.timing(backdrop, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => onClose?.());
  }

  if (!story) return null;
  const cover = getStoryCover(story.id);
  const info = describe(state, lockReason, progressPercent);
  const cardW = Math.min(width - 40, 360);
  const coverH = Math.round((cardW - 24) * 9 / 16);

  // Escala mais perceptível: a capa "cresce" do marco para o card.
  const cardScale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const cardTranslateY = pop.interpolate({ inputRange: [0, 1], outputRange: [46, 0] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <Animated.View
          style={[styles.card, { width: cardW, opacity: backdrop, transform: [{ translateY: cardTranslateY }, { scale: cardScale }] }]}
        >
          <SoundButton style={styles.closeBtn} onPress={handleClose} accessibilityLabel="Fechar" activeOpacity={0.8}>
            <Text style={styles.closeText}>✕</Text>
          </SoundButton>

          {/* Brilho curto atrás da capa (recompensa) */}
          <Animated.View style={[styles.coverGlow, { height: coverH + 20, opacity: pop }]} pointerEvents="none" />

          <View style={[styles.coverWrap, { height: coverH }]}>
            {cover ? (
              <Image source={cover} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={[styles.coverFallback, { backgroundColor: story.corCapa || story.themeColor || '#BCA77E' }]}>
                <Text style={styles.coverFallbackText}>{(story.titulo || '?').trim().charAt(0).toUpperCase()}</Text>
              </View>
            )}
            {/* Brilhos decorativos por código */}
            {SPARKS.map((s, i) => (
              <Animated.View key={i} style={[styles.spark, s, { opacity: pop }]} />
            ))}
            <View style={[styles.stateBadge, { backgroundColor: info.badgeColor }]}>
              <Text style={styles.stateBadgeText}>{info.badge}</Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>{story.titulo}</Text>
          {!!story.referencia && <Text style={styles.reference}>{story.referencia}</Text>}
          {!!info.note && <Text style={styles.note}>{info.note}</Text>}

          <SoundButton style={styles.primaryBtn} onPress={onOpen} activeOpacity={0.9}>
            <LinearGradient
              colors={['#FFB15A', '#FF7A2F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryGrad}
            >
              <Text style={styles.primaryBtnText}>{info.cta}</Text>
              <Text style={styles.primaryArrow}>▸</Text>
            </LinearGradient>
          </SoundButton>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,12,4,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 26,
    padding: 12,
    paddingBottom: 16,
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
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
  coverGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    borderRadius: 22,
    backgroundColor: 'rgba(255,220,140,0.55)',
  },
  coverWrap: { width: '100%', borderRadius: 18, overflow: 'hidden', backgroundColor: '#EFE7D6' },
  cover: { width: '100%', height: '100%' },
  coverFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  coverFallbackText: { fontFamily: 'FredokaOne', fontSize: 48, color: '#FFFFFF' },
  spark: { position: 'absolute', backgroundColor: 'rgba(255,238,190,0.95)', borderRadius: 6, width: 7, height: 7 },
  stateBadge: { position: 'absolute', left: 10, bottom: 10, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12 },
  stateBadgeText: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  title: { fontFamily: 'FredokaOne', fontSize: 20, color: '#4A3A1E', textAlign: 'center', marginTop: 14 },
  reference: { fontFamily: 'Nunito', fontSize: 13, color: '#8A7A5E', fontWeight: '700', textAlign: 'center', marginTop: 2 },
  note: { fontFamily: 'Nunito', fontSize: 13, color: '#7A6A4E', fontWeight: '600', textAlign: 'center', marginTop: 8, marginHorizontal: 6 },
  primaryBtn: {
    marginTop: 16,
    marginHorizontal: 6,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FF7A2F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  primaryGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  primaryBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFFFFF' },
  primaryArrow: { fontSize: 15, color: '#FFFFFF', fontWeight: '900', marginLeft: 8 },
});
