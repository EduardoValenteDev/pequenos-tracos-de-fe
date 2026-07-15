/**
 * StorybookIntroPage — Momento 1: a CAPA do Livro Vivo (O2.2/O2.3 · §11/§13).
 *
 * Abertura de um livro especial: o Beni como ilustração impressa principal (com sombra suave
 * projetada sob a ilustração), selo discreto "Uma jornada com Beni", texto integrado. Uma reação
 * curta ao tocar no Beni (sem loop). O CTA fica na base do livro (tela).
 */
import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import StorybookBeni from './StorybookBeni';
import { OB } from '../../theme/onboardingVisualTokens';

export default function StorybookIntroPage({ width, height }) {
  const illH = Math.min(height * 0.5, 240);
  const illW = Math.round(illH * 0.82);
  const react = useRef(new Animated.Value(0)).current;

  const onTap = () => {
    react.setValue(0);
    Animated.sequence([
      Animated.timing(react, { toValue: 1, duration: OB.durReact, useNativeDriver: true }),
      Animated.timing(react, { toValue: 0, duration: OB.durReact, useNativeDriver: true }),
    ]).start();
  };
  const scale = react.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <View style={styles.page}>
      <View style={styles.seal}>
        <Text style={styles.sealText}>Uma jornada com Beni</Text>
      </View>
      <Pressable onPress={onTap} accessibilityRole="image" accessibilityLabel="Beni, seu companheiro de aventuras">
        <View style={[styles.illShadow, { width: illW * 0.86, height: 14, borderRadius: illW / 2, top: illH - 6 }]} pointerEvents="none" />
        <Animated.View style={{ transform: [{ scale }] }}>
          <StorybookBeni pose="acenando" mode="illustration" width={illW} height={illH} />
        </Animated.View>
      </Pressable>
      <Text style={styles.speech}>Oi! Eu sou o Beni.{'\n'}Vamos descobrir juntos histórias lindas da Bíblia?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 6 },
  seal: {
    backgroundColor: OB.goldFaint, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: OB.goldSoft,
  },
  sealText: { fontFamily: 'FredokaOne', fontSize: 12, color: OB.gold, letterSpacing: 0.3 },
  illShadow: { position: 'absolute', alignSelf: 'center', backgroundColor: OB.bookShadow, opacity: 0.35 },
  speech: {
    fontFamily: 'Nunito', fontSize: 17, fontWeight: '800', color: OB.title,
    textAlign: 'center', lineHeight: 24, maxWidth: 360,
  },
});
