/**
 * BeniGuideOverlay — base reutilizável dos guias contextuais do Beni (UX 2.2).
 *
 * O Beni vira um GUIA dentro do app: aparece com uma pose (BeniAvatar — recorte
 * circular, SEM imagem quadrada crua), fala num balão de pergaminho e DESTACA de
 * forma contextual a área relevante da tela (sem mais o círculo amarelo gigante).
 *
 * Props:
 *   steps: [{ title, text, variant?, target?, balloon? }]
 *     - variant: variant do BeniAvatar (happy, teaching, celebrating, artist,
 *                praying, parent, avatarBase, reading…) — pose do guia.
 *     - target:  'map'|'mainArea'|'pin'|'topRight'|'top'|'header'|'bottom'|
 *                'button'|'parentTools'|'tabAtelier'|'tabStars'|'tabProfile'|'center'
 *                (destaque APROXIMADO — sem medir refs ainda).
 *     - balloon: 'top'|'center'|'bottom' (posição do card; default 'bottom').
 *   finalLabel: rótulo do botão no último passo (default 'Entendi').
 *   onFinish, onSkip: callbacks (ambos marcam o guia como visto).
 *
 * Seguro: se um alvo não existir, cai num destaque/posição segura; se faltar pose,
 * BeniAvatar usa fallback. Véu quente LEVE, não bloqueia a tab bar, Pular sempre
 * visível. Sem pacote novo, sem Lottie.
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from './SoundButton';
import BeniAvatar from './beni/BeniAvatar';

// Destaque APROXIMADO por tipo de alvo (sem medição real). Retorna a caixa do
// spotlight { left, top, width, height, radius } e o formato, ou null (sem destaque).
function spotlightFor(target, w, h) {
  const wide = w - 28;
  switch (target) {
    case 'map':
    case 'mainArea':
      // Destaque AMPLO e suave da área principal (rounded rect, não círculo gigante).
      return { left: 14, top: h * 0.13, width: wide, height: h * 0.42, radius: 26 };
    case 'pin':
      // Anel pequeno na região do próximo pin (centro-superior do mapa).
      return { left: w * 0.30, top: h * 0.24, width: w * 0.40, height: w * 0.40, radius: (w * 0.40) / 2 };
    case 'topRight':
      // Perto do botão "Ver mapa" (canto superior direito do header).
      return { left: w - 138, top: 8, width: 126, height: 42, radius: 16 };
    case 'top':
    case 'header':
      return { left: 14, top: h * 0.05, width: wide, height: h * 0.1, radius: 18 };
    case 'parentTools':
    case 'bottom':
    case 'button':
      return { left: 14, top: h * 0.58, width: wide, height: h * 0.14, radius: 18 };
    case 'tabAtelier':
      return { left: w * 0.5 - 26, top: h - 56, width: 52, height: 52, radius: 26 };
    case 'tabStars':
      return { left: w * 0.7 - 26, top: h - 56, width: 52, height: 52, radius: 26 };
    case 'tabProfile':
      return { left: w * 0.9 - 26, top: h - 56, width: 52, height: 52, radius: 26 };
    default:
      return null; // 'center' / desconhecido → sem destaque, só o card + Beni
  }
}

export default function BeniGuideOverlay({ steps = [], finalLabel = 'Entendi', onFinish, onSkip }) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const safeSteps = steps.length ? steps : [{ title: '', text: '' }];
  const isLast = index === safeSteps.length - 1;
  const step = safeSteps[index];
  const balloon = step.balloon || 'bottom';
  const spot = step.target ? spotlightFor(step.target, width, height) : null;

  // Pulso discreto (Beni + destaque) — Animated nativo, sem exagero.
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
  const spotScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const spotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] });

  const handleNext = () => {
    if (isLast) onFinish?.();
    else setIndex((i) => Math.min(i + 1, safeSteps.length - 1));
  };

  const wrapJustify = balloon === 'top' ? 'flex-start' : balloon === 'center' ? 'center' : 'flex-end';
  // Seta do card aponta para o alvo (cima quando o card está embaixo, etc.).
  const arrowUp = balloon === 'bottom' && !!spot;
  const arrowDown = balloon === 'top' && !!spot;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Véu quente LEVE — a tela host continua visível por trás. */}
      <View style={styles.veil} pointerEvents="auto" />

      {/* Destaque contextual APROXIMADO (rounded rect / anel suave). */}
      {spot && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.spotlight,
            {
              left: spot.left,
              top: spot.top,
              width: spot.width,
              height: spot.height,
              borderRadius: spot.radius,
              opacity: spotOpacity,
              transform: [{ scale: spotScale }],
            },
          ]}
        />
      )}

      <View style={[styles.cardWrap, { justifyContent: wrapJustify }]} pointerEvents="box-none">
        {arrowUp && <View style={[styles.arrow, styles.arrowUp]} />}
        <LinearGradient
          colors={['#FBF1D8', '#F4E3BE', '#EAD3A0']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.card}
        >
          {/* Beni recortado (BeniAvatar — sem quadrado). Leve pulso. */}
          <Animated.View style={[styles.beniWrap, { transform: [{ scale: beniScale }] }]}>
            <BeniAvatar variant={step.variant || 'happy'} size="large" />
          </Animated.View>

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
        {arrowDown && <View style={[styles.arrow, styles.arrowDown]} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(40,28,12,0.28)' },
  spotlight: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: 'rgba(255,205,110,0.95)',
    backgroundColor: 'rgba(255,222,150,0.10)',
  },
  cardWrap: { ...StyleSheet.absoluteFillObject, paddingHorizontal: 16, paddingVertical: 18 },
  arrow: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowUp: { borderBottomWidth: 14, borderBottomColor: '#FBF1D8' },
  arrowDown: { borderTopWidth: 14, borderTopColor: '#EAD3A0' },
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
  beniWrap: { marginBottom: 6 },
  title: { fontFamily: 'FredokaOne', fontSize: 20, color: '#5A4420', textAlign: 'center', marginTop: 4 },
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
