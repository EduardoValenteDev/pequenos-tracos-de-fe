/**
 * BeniAppTour — "Tour Mágico do Beni" (UX 2.0).
 *
 * Overlay encantador exibido UMA vez sobre a aba Aventuras, logo após o onboarding.
 * O Beni guia a criança em 5 passos + um convite final, com card de pergaminho,
 * tons quentes, brilho sutil e um leve pulso (Animated do RN — sem pacote novo).
 *
 * É puramente VISUAL: não navega entre abas, não toca em progresso/paywall/assets
 * do mapa. O fundo é um véu quente leve (o mapa continua visível por trás) e a
 * tab bar permanece livre (o overlay vive dentro da tela Aventuras, acima do mapa
 * e abaixo da tab bar) → não bloqueia permanentemente a navegação.
 *
 * Beni usa as poses OFICIAIS já existentes (beniImages). Se faltar a pose, cai no
 * avatarBase — nunca trava.
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from './SoundButton';
import { BENI_IMAGES, BENI_DEFAULT_VARIANT } from '../assets/mascot/beniImages';

// 5 passos de apresentação + 1 convite final (textos aprovados).
const STEPS = [
  { pose: 'acenando',   title: 'Bem-vindo à jornada!', text: 'Oi, pequeno aventureiro! Eu sou o Beni. Vou caminhar com você pelas histórias da Bíblia.' },
  { pose: 'ensinando',  title: 'Seu mapa de fé',       text: 'Aqui ficam suas aventuras. Cada marca no caminho é uma história especial para descobrir.' },
  { pose: 'celebrando', title: 'Siga o brilho',        text: 'Quando um ponto brilhar, é ali que sua próxima aventura começa.' },
  { pose: 'atelie',     title: 'Hora de colorir',      text: 'No Ateliê, você pinta desenhos das histórias e guarda suas artes.' },
  { pose: 'avatarBase', title: 'Sua caminhada',        text: 'Em Estrelinhas e no Perfil, você acompanha suas conquistas e deixa tudo com a sua carinha.' },
  { pose: 'celebrando', title: 'Vamos começar?',       text: 'Toque na próxima aventura e caminhe com o Beni!' },
];

export default function BeniAppTour({ onFinish, onSkip }) {
  const [index, setIndex] = useState(0);
  const isLast = index === STEPS.length - 1;
  const step = STEPS[index];
  const beniSource = BENI_IMAGES[step.pose] || BENI_IMAGES[BENI_DEFAULT_VARIANT];

  // Pulso suave e discreto do Beni + brilho (Animated nativo, leve).
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const beniScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  const handleNext = () => {
    if (isLast) onFinish?.();
    else setIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Véu quente LEVE — o mapa continua visível por trás (sem preto pesado). */}
      <View style={styles.veil} pointerEvents="auto" />

      <View style={styles.cardWrap} pointerEvents="box-none">
        <LinearGradient
          colors={['#FBF1D8', '#F4E3BE', '#EAD3A0']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.card}
        >
          {/* Beni com brilho mágico sutil */}
          <View style={styles.beniRow}>
            <Animated.View style={[styles.beniGlow, { opacity: glowOpacity }]} pointerEvents="none" />
            <Animated.Image
              source={beniSource}
              resizeMode="contain"
              style={[styles.beni, { transform: [{ scale: beniScale }] }]}
            />
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.text}>{step.text}</Text>

          {/* Indicador de progresso (pontinhos) */}
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>

          <SoundButton style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.9}>
            <LinearGradient
              colors={['#FFB15A', '#FF7A2F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryGrad}
            >
              <Text style={styles.primaryText}>{isLast ? 'Começar minha jornada' : 'Próximo'}</Text>
              <Text style={styles.primaryArrow}>▸</Text>
            </LinearGradient>
          </SoundButton>

          {/* Pular tour — visível em TODAS as etapas */}
          <SoundButton style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7} silent>
            <Text style={styles.skipText}>Pular tour</Text>
          </SoundButton>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50, justifyContent: 'flex-end' },
  // Véu quente leve: escurece DE LEVE para destacar o card, sem esconder o mapa.
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(40,28,12,0.30)' },
  cardWrap: { paddingHorizontal: 16, paddingBottom: 18 },
  card: {
    borderRadius: 26,
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(180,140,70,0.45)',
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    alignItems: 'center',
  },
  beniRow: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  beniGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,213,120,0.55)',
  },
  beni: { width: 88, height: 88 },
  title: { fontFamily: 'FredokaOne', fontSize: 20, color: '#5A4420', textAlign: 'center' },
  text: {
    fontFamily: 'Nunito',
    fontSize: 14.5,
    fontWeight: '700',
    color: '#6B5733',
    textAlign: 'center',
    marginTop: 6,
    marginHorizontal: 4,
    lineHeight: 20,
  },
  dots: { flexDirection: 'row', marginTop: 14, marginBottom: 12 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(120,95,55,0.30)',
  },
  dotActive: { backgroundColor: '#E08A2E', width: 18 },
  primaryBtn: {
    alignSelf: 'stretch',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FF7A2F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  primaryGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13 },
  primaryText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFFFFF' },
  primaryArrow: { fontSize: 15, color: '#FFFFFF', fontWeight: '900', marginLeft: 8 },
  skipBtn: { marginTop: 10, paddingVertical: 6, paddingHorizontal: 14 },
  skipText: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: '#8A7350', textDecorationLine: 'underline' },
});
