import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import SoundButton from './SoundButton';
import Confetti from './Confetti';
import BeniAvatar from './beni/BeniAvatar';

const NUM_STARS = 6;

export default function UnlockCelebration({ visible, onContinue, isLast = false }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef(Array.from({ length: NUM_STARS }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.8);
      starAnims.forEach(a => a.setValue(0));

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.stagger(80, starAnims.map(a =>
          Animated.spring(a, {
            toValue: 1,
            friction: 4,
            tension: 60,
            useNativeDriver: true,
          })
        )),
      ]).start();
    }
  }, [visible]);

  const starPositions = [
    { top: -30, left: 20 },
    { top: -20, right: 20 },
    { top: 20, left: -30 },
    { top: 20, right: -30 },
    { bottom: -20, left: 30 },
    { bottom: -20, right: 30 },
  ];

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Confetti visible={visible} />
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          {starAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.star,
                starPositions[i],
                { transform: [{ scale: anim }] }
              ]}
            >
              <Text style={styles.starText}>⭐</Text>
            </Animated.View>
          ))}

          {/* Beni comemorando */}
          <BeniAvatar variant="celebrating" size="large" style={styles.beni} />
          {isLast ? (
            <>
              <Text style={styles.title}>Você completou! 🏆</Text>
              <Text style={styles.subtitle}>Que jornada linda você viveu!</Text>
              <Text style={styles.hint}>Beni guardou essa conquista com muito carinho.</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Que lindo! 🎉</Text>
              <Text style={styles.subtitle}>Você avançou na aventura!</Text>
              <Text style={styles.hint}>Beni viu sua conquista. Mais uma estrela para a sua jornada! ⭐</Text>
            </>
          )}

          <SoundButton style={[styles.btn, isLast && styles.btnLast]} onPress={onContinue}>
            <Text style={styles.btnText}>{isLast ? 'Ver conclusão' : 'Continuar'}</Text>
          </SoundButton>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    elevation: 8,
    position: 'relative',
    marginHorizontal: 40,
  },
  star: {
    position: 'absolute',
  },
  starText: {
    fontSize: 24,
  },
  beni: {
    marginBottom: 10,
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 26,
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  hint: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: colors.success,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
    elevation: 3,
  },
  btnLast: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
  },
  btnText: {
    fontFamily: 'FredokaOne',
    fontSize: 18,
    color: '#FFF',
  },
});
