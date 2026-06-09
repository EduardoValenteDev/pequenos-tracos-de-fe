import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { colors as pt, radii } from '../../theme/productTheme';
import { colors } from '../../theme/colors';
import { BeniAvatar } from '../beni';

/**
 * Celebração de conquista — reutilizável em todas as telas.
 * @param onDismiss    fecha (botão "Continuar").
 * @param onSeeAlbum   opcional: se fornecido, mostra botão secundário "Ver álbum".
 */
export default function AchievementUnlockModal({ achievement, onDismiss, onSeeAlbum }) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!achievement) return null;
  const color = achievement.color ?? colors.accent;

  return (
    <Modal transparent animationType="none" visible statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.box, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.superTitle}>Nova estrelinha acesa! ✨</Text>
          <BeniAvatar variant="celebrating" size="medium" />
          <View style={[styles.emojiCircle, { backgroundColor: color + '30' }]}>
            <Text style={styles.emoji}>{achievement.emoji}</Text>
          </View>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.desc}>{achievement.desc}</Text>
          <Text style={styles.beniLine}>Beni viu essa vitória! 💛</Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: color }]}
            onPress={onDismiss}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Continuar 🎉</Text>
          </TouchableOpacity>
          {onSeeAlbum && (
            <TouchableOpacity style={styles.btnSecondary} onPress={onSeeAlbum} activeOpacity={0.85}>
              <Text style={styles.btnSecondaryText}>Ver álbum</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#FFF',
    borderRadius: radii.xl,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  superTitle: {
    fontFamily: 'FredokaOne',
    fontSize: 18,
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  emojiCircle: {
    width: 76, height: 76, borderRadius: 38,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 8, marginBottom: 14,
  },
  emoji: { fontSize: 40 },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 20,
    color: pt.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.textSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 10,
  },
  beniLine: {
    fontFamily: 'FredokaOne',
    fontSize: 13,
    color: pt.purpleDeep,
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  btnText: {
    fontFamily: 'FredokaOne',
    fontSize: 17,
    color: '#FFF',
  },
  btnSecondary: { paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  btnSecondaryText: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.muted,
    fontWeight: '700', textDecorationLine: 'underline',
  },
});
