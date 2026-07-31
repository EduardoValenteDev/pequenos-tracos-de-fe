import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/productTheme';
import SoundButton from './SoundButton';
import Confetti from './Confetti';
import BeniAvatar from './beni/BeniAvatar';

const NUM_STARS = 6;

/**
 * UnlockCelebration — feedback CURTO após concluir uma cena INTERMEDIÁRIA.
 *
 *   ⭐ badge "+1 estrela"  →  "Que lindo!"  →  Continuar (único botão)
 *
 * Simplificado (Bloco B4): sem Baú/Estrelinhas/Livrinho por cena. O hub completo
 * da história (Livrinho, Quiz, Baú, Estrelinhas, próxima aventura) vive só no
 * CongratsScreen, ao final. A última cena NÃO usa este modal — a NarrationScreen
 * conduz direto para o CongratsScreen (sem duplicar modal + tela final).
 *
 * [P3J] O botão secundário "Colorir esta cena" foi APOSENTADO junto com o Colorir legado.
 * O modal tem agora UMA ação — Continuar. Nenhum espaço vazio ficou no lugar, e nenhuma
 * prop de colorir sobrou: o colorir do produto é o "Colorir com o Beni", que aparece por
 * marco narrativo (Coloring60MilestoneInvite) e não por cena.
 */
export default function UnlockCelebration({
  visible,
  onContinue,
  sceneNumber,
  totalCenas,
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef(Array.from({ length: NUM_STARS }, () => new Animated.Value(0))).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

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

          {/* Badge de estrela */}
          <Animated.View style={[styles.starBadge, { transform: [{ scale: badgeAnim }] }]}>
            <Text style={styles.starBadgeText}>⭐ +1 estrela conquistada!</Text>
          </Animated.View>

          {/* Feedback curto */}
          <Text style={styles.title}>Que lindo! 🎉</Text>
          <Text style={styles.subtitle}>
            {hasProgress
              ? `Cena ${sceneNumber} de ${totalCenas} — você avançou!`
              : 'Você avançou na aventura!'}
          </Text>

          {/* Botão principal — Continuar (ação única) */}
          <SoundButton style={styles.primaryBtn} onPress={onContinue} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Continuar →</Text>
          </SoundButton>

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
    alignSelf: 'stretch',
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

  // Botão principal — Continuar. [P3J] Último elemento do card: sem marginBottom, para
  // não sobrar folga onde antes ficava o botão de colorir.
  primaryBtn: {
    backgroundColor: colors.success,
    paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: 20, elevation: 3,
    alignSelf: 'stretch', alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  primaryBtnText: {
    fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF',
  },
});
