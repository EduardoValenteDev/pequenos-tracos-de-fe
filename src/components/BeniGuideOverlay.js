/**
 * BeniGuideOverlay — guia contextual do Beni (UX 2.3, reconstruído).
 *
 * Profissional e PRECISO: o destaque só aparece quando o alvo é MEDIDO de verdade
 * (measureInWindow via prop `measure`). Sem medição → NENHUM contorno, só o balão
 * do Beni numa posição segura (nunca aponta para o lugar errado). Nada de círculos/
 * linhas amarelas atravessando a tela.
 *
 * Visual: card COMPACTO (Beni circular via BeniAvatar + título curto + até ~2 linhas),
 * botão principal pequeno, "Pular" discreto, véu quente leve. O card se posiciona
 * acima/abaixo do alvo conforme o espaço, sem cobrir o alvo nem a tab bar; quando há
 * medição, uma moldura fina e suave envolve o alvo real, com seta apontando para ele.
 *
 * Props:
 *   steps: [{ title, text, variant?, target? }]
 *   measure?: (name) => Promise<rect|null>  // medição real (opcional)
 *   finalLabel?: rótulo do último passo (default 'Entendi')
 *   onFinish, onSkip
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from './SoundButton';
import BeniAvatar from './beni/BeniAvatar';
import BeniGuideAudio from './BeniGuideAudio';
import { getBeniGuideAudio } from '../data/beniGuideAudio';
import { getAudioPreferences, subscribeAudioPreferences, playUiSound } from '../services/audioManager';

const CARD_H = 150;       // altura estimada do card (posicionamento)
const TABBAR_APPROX = 64; // altura aproximada da tab bar (não cobrir)
const GAP = 12;

export default function BeniGuideOverlay({ steps = [], measure, finalLabel = 'Entendi', onFinish, onSkip }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null); // alvo MEDIDO do passo atual (ou null)

  const safeSteps = steps.length ? steps : [{ title: '', text: '' }];
  const isLast = index === safeSteps.length - 1;
  const step = safeSteps[index];

  // UX 2.4: voz do Beni por etapa. Só toca se houver áudio E `soundsEnabled` ON.
  // (respeita o mudo do sistema; se desligar no meio, o áudio para — key muda.)
  const [soundsOn, setSoundsOn] = useState(() => getAudioPreferences().soundsEnabled);
  useEffect(() => subscribeAudioPreferences(() => setSoundsOn(getAudioPreferences().soundsEnabled)), []);
  const stepAudio = soundsOn && step.audioKey ? getBeniGuideAudio(step.audioKey) : null;

  // Mede o alvo do passo atual de verdade. Sem alvo/medição → rect null (fallback).
  useEffect(() => {
    let alive = true;
    setRect(null);
    if (step.target && typeof measure === 'function') {
      measure(step.target).then((r) => { if (alive) setRect(r || null); });
    }
    return () => { alive = false; };
  }, [index, step.target, measure]);

  // Pulso discreto (Beni + moldura do alvo) — Animated nativo.
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
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] });

  const handleNext = () => {
    playUiSound('success'); // micro-som leve ao avançar (já respeita soundsEnabled)
    if (isLast) onFinish?.();
    else setIndex((i) => Math.min(i + 1, safeSteps.length - 1));
  };

  // Alvo "área grande" (ex.: o mapa inteiro) → não desenha moldura (ficaria uma borda
  // na tela toda). Só molduramos alvos PEQUENOS/precisos (botão, pin…).
  const isBigArea = rect && rect.width > width * 0.85 && rect.height > height * 0.5;
  // Gate de VISIBILIDADE (UX 2.3.1): só destaca se o rect medido estiver de fato na
  // área visível (abaixo do topo, acima da tab bar). Pin/alvo fora da viewport →
  // SEM moldura, SEM seta (fallback honesto).
  const tabTop = height - (TABBAR_APPROX + insets.bottom);
  const inViewport = !!rect && rect.y + rect.height > insets.top && rect.y < tabTop;
  const showRing = !!rect && !isBigArea && inViewport;

  // Posição do card: abaixo de alvo no topo; acima de alvo embaixo; senão rodapé.
  const usableBottom = height - (TABBAR_APPROX + insets.bottom);
  let cardTop;
  let arrow = null; // 'up' (alvo acima do card) | 'down' (alvo abaixo) | null
  if (showRing) {
    const targetMid = rect.y + rect.height / 2;
    if (targetMid < height * 0.5) {
      cardTop = rect.y + rect.height + GAP;
      arrow = 'up';
    } else {
      cardTop = rect.y - CARD_H - GAP;
      arrow = 'down';
    }
    cardTop = Math.max(insets.top + 8, Math.min(cardTop, usableBottom - CARD_H - 8));
  } else {
    // Sem alvo medido (ou área grande) → card seguro no rodapé, sem seta.
    cardTop = usableBottom - CARD_H - 8;
  }

  const ringPad = 6;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Voz do Beni (headless). key por etapa+som → troca de etapa/desligar som
          desmonta o áudio anterior (para) e monta o novo. Some ao pular/concluir. */}
      <BeniGuideAudio key={`guide-audio-${index}-${soundsOn}`} audioAsset={stepAudio} />

      {/* Véu quente LEVE — a tela continua visível por trás. */}
      <View style={styles.veil} pointerEvents="auto" />

      {/* Moldura fina e suave SÓ no alvo medido (sem aproximação). */}
      {showRing && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              left: rect.x - ringPad,
              top: rect.y - ringPad,
              width: rect.width + ringPad * 2,
              height: rect.height + ringPad * 2,
              // Alvo quase quadrado (pin) → círculo; alvo largo (botão) → cantos suaves.
              borderRadius:
                Math.abs(rect.width - rect.height) <= 10
                  ? (Math.max(rect.width, rect.height) + ringPad * 2) / 2
                  : Math.min(18, (rect.height + ringPad * 2) / 2),
              opacity: ringOpacity,
            },
          ]}
        />
      )}

      <View style={[styles.cardWrap, { top: cardTop }]} pointerEvents="box-none">
        {arrow === 'up' && <View style={[styles.arrow, styles.arrowUp]} />}
        <LinearGradient
          colors={['#FBF1D8', '#F4E3BE', '#EAD3A0']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.card}
        >
          <Animated.View style={{ transform: [{ scale: beniScale }] }}>
            <BeniAvatar variant={step.variant || 'happy'} size="medium" />
          </Animated.View>

          <View style={styles.cardBody}>
            {!!step.title && <Text style={styles.title} numberOfLines={1}>{step.title}</Text>}
            {!!step.text && <Text style={styles.text} numberOfLines={3}>{step.text}</Text>}

            <View style={styles.actions}>
              {safeSteps.length > 1 && (
                <View style={styles.dots}>
                  {safeSteps.map((_, i) => (
                    <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                  ))}
                </View>
              )}
              <View style={styles.btnRow}>
                <SoundButton style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7} silent>
                  <Text style={styles.skipText}>Pular</Text>
                </SoundButton>
                <SoundButton style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.9}>
                  <LinearGradient colors={['#FFB15A', '#FF7A2F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGrad}>
                    <Text style={styles.primaryText}>{isLast ? finalLabel : 'Próximo'}</Text>
                  </LinearGradient>
                </SoundButton>
              </View>
            </View>
          </View>
        </LinearGradient>
        {arrow === 'down' && <View style={[styles.arrow, styles.arrowDown]} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(40,28,12,0.26)' },
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: 'rgba(255,205,110,0.95)',
    backgroundColor: 'rgba(255,222,150,0.10)',
  },
  cardWrap: { position: 'absolute', left: 16, right: 16 },
  arrow: { alignSelf: 'center', width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  arrowUp: { borderBottomWidth: 12, borderBottomColor: '#FBF1D8' },
  arrowDown: { borderTopWidth: 12, borderTopColor: '#EAD3A0' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(180,140,70,0.45)',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  cardBody: { flex: 1, marginLeft: 12 },
  title: { fontFamily: 'FredokaOne', fontSize: 16, color: '#5A4420' },
  text: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: '#6B5733', marginTop: 2, lineHeight: 18 },
  actions: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4, backgroundColor: 'rgba(120,95,55,0.30)' },
  dotActive: { backgroundColor: '#E08A2E', width: 14 },
  btnRow: { flexDirection: 'row', alignItems: 'center' },
  skipBtn: { paddingVertical: 6, paddingHorizontal: 10, marginRight: 4 },
  skipText: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '800', color: '#8A7350' },
  primaryBtn: { borderRadius: 14, overflow: 'hidden' },
  primaryGrad: { paddingVertical: 8, paddingHorizontal: 16 },
  primaryText: { fontFamily: 'FredokaOne', fontSize: 13.5, color: '#FFFFFF' },
});
