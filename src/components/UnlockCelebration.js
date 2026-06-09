import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { colors as pt, radii } from '../theme/productTheme';
import SoundButton from './SoundButton';
import Confetti from './Confetti';
import BeniAvatar from './beni/BeniAvatar';

const NUM_STARS = 6;

/**
 * UnlockCelebration — modal de vitória após concluir uma cena.
 *
 * Modo normal (isLast=false):
 *   ⭐ badge  →  Continuar aventura (primário)  →  Colorir · Baú · Estrelas (secundários)
 *
 * Modo fim de aventura (isLast=true):
 *   Livrinho da Fé (destaque)  →  Ver conclusão (primário)  →  Colorir · Baú · Estrelas
 */
export default function UnlockCelebration({
  visible,
  onContinue,
  isLast = false,
  onColorir,
  onBau,
  onEstrelinhas,
  onLibrinho,
  sceneNumber,
  totalCenas,
  sceneHasDrawing = false,
}) {
  const scaleAnim    = useRef(new Animated.Value(0)).current;
  const starAnims    = useRef(Array.from({ length: NUM_STARS }, () => new Animated.Value(0))).current;
  const badgeAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.8);
      starAnims.forEach(a => a.setValue(0));
      badgeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
        }),
        Animated.stagger(80, starAnims.map(a =>
          Animated.spring(a, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true })
        )),
        Animated.sequence([
          Animated.delay(350),
          Animated.spring(badgeAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [visible]);

  const starPositions = [
    { top: -28, left: 18 },
    { top: -20, right: 18 },
    { top: 16, left: -28 },
    { top: 16, right: -28 },
    { bottom: -18, left: 28 },
    { bottom: -18, right: 28 },
  ];

  const hasProgress = sceneNumber != null && totalCenas != null;
  const hasSecondaryActions = onColorir || onBau || onEstrelinhas;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Confetti visible={visible} />

        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>

          {/* Estrelas decorativas */}
          {starAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[styles.star, starPositions[i], { transform: [{ scale: anim }] }]}
            >
              <Text style={styles.starText}>⭐</Text>
            </Animated.View>
          ))}

          {/* Beni comemorando */}
          <BeniAvatar variant="celebrating" size="medium" style={styles.beni} />

          {/* Badge de estrela — apenas em cenas intermediárias */}
          {!isLast && (
            <Animated.View style={[styles.starBadge, { transform: [{ scale: badgeAnim }] }]}>
              <Text style={styles.starBadgeText}>⭐ +1 estrela conquistada!</Text>
            </Animated.View>
          )}

          {/* Título e subtítulo */}
          {isLast ? (
            <>
              <Text style={styles.title}>Aventura concluída! 🏆</Text>
              <Text style={styles.subtitle}>Que jornada linda você viveu!</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Que lindo! 🎉</Text>
              <Text style={styles.subtitle}>
                {hasProgress
                  ? `Cena ${sceneNumber} de ${totalCenas} — você avançou na aventura!`
                  : 'Você avançou na aventura!'}
              </Text>
            </>
          )}

          {/* Última cena: destaque do Livrinho da Fé */}
          {isLast && onLibrinho && (
            <SoundButton style={styles.livrinhoCard} onPress={onLibrinho} activeOpacity={0.85}>
              <Text style={styles.livrinhoEmoji}>📖</Text>
              <View style={styles.livrinhoInfo}>
                <Text style={styles.livrinhoTitle}>Livrinho da Fé</Text>
                <Text style={styles.livrinhoSub}>
                  Sua história virou um livrinho especial
                </Text>
              </View>
              <Text style={styles.livrinhoArrow}>›</Text>
            </SoundButton>
          )}

          {/* Botão principal */}
          <SoundButton
            style={[styles.primaryBtn, isLast && styles.primaryBtnLast]}
            onPress={onContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {isLast ? 'Ver conclusão →' : 'Continuar aventura →'}
            </Text>
          </SoundButton>

          {/* Ações secundárias: Colorir · Baú · Estrelinhas */}
          {hasSecondaryActions && (
            <View style={styles.actionsRow}>
              {onColorir && (
                <SoundButton style={styles.actionBtn} onPress={onColorir} activeOpacity={0.85}>
                  <Text style={styles.actionBtnEmoji}>🎨</Text>
                  <Text style={styles.actionBtnLabel}>
                    {sceneHasDrawing ? 'Ver desenho' : 'Colorir'}
                  </Text>
                </SoundButton>
              )}
              {onBau && (
                <SoundButton style={styles.actionBtn} onPress={onBau} activeOpacity={0.85}>
                  <Text style={styles.actionBtnEmoji}>🎴</Text>
                  <Text style={styles.actionBtnLabel}>Baú</Text>
                </SoundButton>
              )}
              {onEstrelinhas && (
                <SoundButton style={styles.actionBtn} onPress={onEstrelinhas} activeOpacity={0.85}>
                  <Text style={styles.actionBtnEmoji}>⭐</Text>
                  <Text style={styles.actionBtnLabel}>Estrelas</Text>
                </SoundButton>
              )}
            </View>
          )}

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 28, padding: 26,
    alignItems: 'center', elevation: 12,
    position: 'relative', marginHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20,
  },
  star: { position: 'absolute' },
  starText: { fontSize: 20 },
  beni: { marginBottom: 8 },

  // Badge ⭐ +1
  starBadge: {
    backgroundColor: '#FFF7DC',
    borderRadius: radii.pill,
    paddingHorizontal: 14, paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1.5, borderColor: '#FFD700',
  },
  starBadgeText: {
    fontFamily: 'FredokaOne', fontSize: 14, color: '#A37A00',
  },

  title: {
    fontFamily: 'FredokaOne', fontSize: 24, color: colors.primary,
    marginBottom: 4, textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Nunito', fontSize: 13, color: colors.textLight,
    fontWeight: '700', marginBottom: 16, textAlign: 'center', lineHeight: 19,
  },

  // Livrinho da Fé (última cena)
  livrinhoCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: radii.lg, padding: 12, marginBottom: 14,
    alignSelf: 'stretch', gap: 10,
    borderWidth: 1.5, borderColor: '#93C5FD',
  },
  livrinhoEmoji: { fontSize: 26 },
  livrinhoInfo: { flex: 1 },
  livrinhoTitle: {
    fontFamily: 'FredokaOne', fontSize: 14, color: '#1E40AF',
  },
  livrinhoSub: {
    fontFamily: 'Nunito', fontSize: 11, color: '#3B82F6', lineHeight: 15,
  },
  livrinhoArrow: { fontFamily: 'FredokaOne', fontSize: 18, color: '#93C5FD' },

  // Botão principal
  primaryBtn: {
    backgroundColor: colors.success,
    paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: 20, elevation: 3,
    alignSelf: 'stretch', alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  primaryBtnLast: { backgroundColor: colors.primary },
  primaryBtnText: {
    fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF',
  },

  // Ações secundárias
  actionsRow: {
    flexDirection: 'row', gap: 8, alignSelf: 'stretch',
    justifyContent: 'center',
  },
  actionBtn: {
    flex: 1, alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 4,
    backgroundColor: '#F8F4FF',
    borderRadius: radii.lg,
    borderWidth: 1, borderColor: '#E8DFFF', gap: 3,
  },
  actionBtnEmoji: { fontSize: 20 },
  actionBtnLabel: {
    fontFamily: 'Nunito', fontSize: 11, fontWeight: '700',
    color: '#5B21B6', textAlign: 'center',
  },
});
