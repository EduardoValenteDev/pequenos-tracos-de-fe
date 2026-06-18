/**
 * BeniGuideOverlay — base reutilizável dos guias contextuais do Beni (UX 2.1).
 *
 * O Beni vira um GUIA dentro do app: aparece com uma pose, fala num balão de
 * pergaminho e (opcionalmente) destaca uma área da tela. É usado pelo tour inicial
 * (sobre Aventuras) e, nos próximos blocos, pelos guias de cada aba.
 *
 * Props:
 *   steps: [{ title, text, pose?, target?, balloon? }]
 *     - pose:   chave de beniImages (acenando, ensinando, celebrando, atelie, ...)
 *     - target: 'top'|'center'|'bottom'|'tabBar'|'map'|'pin'|'header'|'button'
 *               (posição APROXIMADA do destaque/seta — sem medir refs ainda)
 *     - balloon:'top'|'center'|'bottom' (posição do card de fala; default 'bottom')
 *   finalLabel: rótulo do botão no último passo (default 'Entendi')
 *   onFinish, onSkip: callbacks (ambos devem marcar o guia como visto)
 *
 * Visual: pergaminho quente, borda arredondada, sombra suave, Beni em destaque,
 * brilho/pulso DISCRETO (Animated nativo), seta/spotlight suave. Sem pacote novo,
 * sem Lottie, sem overlay preto pesado. Não bloqueia a tab bar (vive na tela host).
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from './SoundButton';
import { BENI_IMAGES, BENI_DEFAULT_VARIANT } from '../assets/mascot/beniImages';

// Destaque APROXIMADO por tipo de alvo (sem medição real de elementos). Retorna a
// caixa do spotlight ou null (sem destaque → só o card).
function spotlightBox(target, w, h) {
  const size = Math.min(w * 0.7, 260);
  const cx = (w - size) / 2;
  switch (target) {
    case 'header':
    case 'top':
      return { left: cx, top: h * 0.1, width: size, height: size * 0.5 };
    case 'pin':
      return { left: cx, top: h * 0.26, width: size, height: size };
    case 'map':
    case 'center':
      return { left: cx, top: h * 0.32, width: size, height: size };
    case 'tabBar':
    case 'button':
    case 'bottom':
      return { left: cx, top: h * 0.62, width: size, height: size * 0.6 };
    default:
      return null;
  }
}

export default function BeniGuideOverlay({ steps = [], finalLabel = 'Entendi', onFinish, onSkip }) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const safeSteps = steps.length ? steps : [{ title: '', text: '' }];
  const isLast = index === safeSteps.length - 1;
  const step = safeSteps[index];
  const beniSource = BENI_IMAGES[step.pose] || BENI_IMAGES[BENI_DEFAULT_VARIANT];
  const balloon = step.balloon || 'bottom';
  const spot = step.target ? spotlightBox(step.target, width, height) : null;

  // Pulso suave e discreto (Beni + brilho + spotlight) — Animated nativo.
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
  const spotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] });

  const handleNext = () => {
    if (isLast) onFinish?.();
    else setIndex((i) => Math.min(i + 1, safeSteps.length - 1));
  };

  // Card de fala alinhado por balloonPosition. A seta aponta para o alvo.
  const wrapJustify = balloon === 'top' ? 'flex-start' : balloon === 'center' ? 'center' : 'flex-end';
  const arrowUp = balloon === 'bottom' && !!spot; // card embaixo, alvo acima → seta pra cima

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Véu quente LEVE — a tela host continua visível por trás. */}
      <View style={styles.veil} pointerEvents="auto" />

      {/* Spotlight aproximado (decorativo) — anel suave, sem recorte real. */}
      {spot && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.spotlight,
            { left: spot.left, top: spot.top, width: spot.width, height: spot.height, borderRadius: Math.min(spot.width, spot.height) / 2, opacity: spotOpacity },
          ]}
        />
      )}

      <View style={[styles.cardWrap, { justifyContent: wrapJustify }]} pointerEvents="box-none">
        {arrowUp && <View style={styles.arrowUp} />}
        <LinearGradient
          colors={['#FBF1D8', '#F4E3BE', '#EAD3A0']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.card}
        >
          <View style={styles.beniRow}>
            <Animated.View style={[styles.beniGlow, { opacity: glowOpacity }]} pointerEvents="none" />
            <Animated.Image source={beniSource} resizeMode="contain" style={[styles.beni, { transform: [{ scale: beniScale }] }]} />
          </View>

          {!!step.title && <Text style={styles.title}>{step.title}</Text>}
          {!!step.text && <Text style={styles.text}>{step.text}</Text>}

          {safeSteps.length > 1 && (
            <View style={styles.dots}>
              {safeSteps.map((_, i) => (
                <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
              ))}
            </View>
          )}

          <SoundButton style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.9}>
            <LinearGradient colors={['#FFB15A', '#FF7A2F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGrad}>
              <Text style={styles.primaryText}>{isLast ? finalLabel : 'Próximo'}</Text>
              <Text style={styles.primaryArrow}>▸</Text>
            </LinearGradient>
          </SoundButton>

          {/* Pular — visível em TODAS as etapas */}
          <SoundButton style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7} silent>
            <Text style={styles.skipText}>Pular tour</Text>
          </SoundButton>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(40,28,12,0.30)' },
  spotlight: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'rgba(255,213,120,0.9)',
    backgroundColor: 'rgba(255,213,120,0.12)',
  },
  cardWrap: { ...StyleSheet.absoluteFillObject, paddingHorizontal: 16, paddingBottom: 18, paddingTop: 18 },
  arrowUp: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FBF1D8',
  },
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
  beniGlow: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,213,120,0.55)' },
  beni: { width: 88, height: 88 },
  title: { fontFamily: 'FredokaOne', fontSize: 20, color: '#5A4420', textAlign: 'center' },
  text: { fontFamily: 'Nunito', fontSize: 14.5, fontWeight: '700', color: '#6B5733', textAlign: 'center', marginTop: 6, marginHorizontal: 4, lineHeight: 20 },
  dots: { flexDirection: 'row', marginTop: 14, marginBottom: 12 },
  dot: { width: 7, height: 7, borderRadius: 4, marginHorizontal: 4, backgroundColor: 'rgba(120,95,55,0.30)' },
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
