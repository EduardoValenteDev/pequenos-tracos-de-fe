/**
 * BeniGuideOverlay — guia falado do Beni (UX 2.4.2, fluxo único e bloqueante).
 *
 * Profissional e PRECISO: o destaque (moldura/seta) só aparece quando o alvo é
 * MEDIDO de verdade (measureInWindow via `measure`) E está visível; senão, só o
 * card numa posição segura — nunca aponta errado. O guia roda dentro de um Modal
 * que BLOQUEIA a navegação (mapa/pins/tab bar) durante o tour; só os botões do
 * próprio guia respondem.
 *
 * Recursos: aviso de som inicial (com voz / sem voz), voz por etapa (BeniGuideAudio,
 * respeitando soundsEnabled), "Sem voz" durante o tour, Voltar (a partir do 2º
 * card), debounce no avançar (sem duplo toque / sem som duplo), progresso contínuo,
 * e CTA final só no último card.
 *
 * Props: steps[], measure?, finalLabel?, onFinish, onSkip, onStep?(target),
 *        withAudioPrompt?
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Modal, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from './SoundButton';
import BeniAvatar from './beni/BeniAvatar';
import BeniGuideAudio from './BeniGuideAudio';
import { getBeniGuideAudio, preloadGuideAudio } from '../data/beniGuideAudio';
import { getAudioPreferences, subscribeAudioPreferences } from '../services/audioManager';

const CARD_H = 168;        // altura estimada do card (posicionamento)
const TABBAR_APPROX = 64;  // altura aproximada da tab bar (não cobrir)
const GAP = 12;
const MEASURE_SETTLE_MS = 320; // espera o layout/scroll estabilizar antes de medir
const ADVANCE_DEBOUNCE_MS = 320; // trava o botão por um instante (evita duplo toque)

export default function BeniGuideOverlay({
  steps = [],
  measure,
  finalLabel = 'Entendi',
  onFinish,
  onSkip,
  onStep,
  withAudioPrompt = false,
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState(withAudioPrompt ? 'prompt' : 'steps');
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [busy, setBusy] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true); // por-tour (o aviso de som define)

  const [soundsOn, setSoundsOn] = useState(() => getAudioPreferences().soundsEnabled);
  useEffect(() => subscribeAudioPreferences(() => setSoundsOn(getAudioPreferences().soundsEnabled)), []);

  const safeSteps = steps.length ? steps : [{ title: '', text: '' }];
  const isLast = index === safeSteps.length - 1;
  const step = safeSteps[index];
  // Voz da etapa: só com aviso "com voz" + soundsEnabled + áudio existente.
  const stepAudio = phase === 'steps' && voiceOn && soundsOn && step.audioKey
    ? getBeniGuideAudio(step.audioKey)
    : null;

  // Mede o alvo do passo (com settle p/ scroll/layout estabilizar) e avisa a tela
  // (onStep) para rolar o pin à viewport. Sem alvo/medição → rect null (fallback).
  useEffect(() => {
    if (phase !== 'steps') { setRect(null); return undefined; }
    let alive = true;
    let timer;
    setRect(null);
    onStep?.(step.target);
    if (step.target && typeof measure === 'function') {
      timer = setTimeout(() => {
        measure(step.target).then((r) => { if (alive) setRect(r || null); });
      }, MEASURE_SETTLE_MS);
    }
    return () => { alive = false; if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase, step.target]);

  // Pulso discreto (Beni + moldura do alvo).
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

  const lockBriefly = () => { setBusy(true); setTimeout(() => setBusy(false), ADVANCE_DEBOUNCE_MS); };
  const handleNext = () => {
    if (busy) return; // anti duplo-toque (sem som de clique — a voz é a resposta)
    lockBriefly();
    if (isLast) onFinish?.();
    else setIndex((i) => Math.min(i + 1, safeSteps.length - 1));
  };
  const handleBack = () => {
    if (busy || index === 0) return;
    lockBriefly();
    setIndex((i) => Math.max(0, i - 1)); // troca o áudio (key) → o anterior toca de novo
  };

  const startWithVoice = async () => {
    setVoiceOn(true);
    await preloadGuideAudio(safeSteps.map((s) => s.audioKey)); // 1ª fala sem atraso
    setPhase('steps');
  };
  const startNoVoice = () => { setVoiceOn(false); setPhase('steps'); };

  // ── Posicionamento do card por alvo medido ───────────────────────────────────
  const isBigArea = rect && rect.width > width * 0.85 && rect.height > height * 0.5;
  const tabTop = height - (TABBAR_APPROX + insets.bottom);
  const inViewport = !!rect && rect.y + rect.height > insets.top && rect.y < tabTop;
  const showRing = !!rect && !isBigArea && inViewport;

  const usableBottom = tabTop;
  let cardTop;
  let arrow = null;
  if (showRing) {
    const targetMid = rect.y + rect.height / 2;
    if (targetMid < height * 0.5) { cardTop = rect.y + rect.height + GAP; arrow = 'up'; }
    else { cardTop = rect.y - CARD_H - GAP; arrow = 'down'; }
    cardTop = Math.max(insets.top + 8, Math.min(cardTop, usableBottom - CARD_H - 8));
  } else {
    cardTop = usableBottom - CARD_H - 8;
  }
  const ringPad = 6;

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={() => onSkip?.()}>
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Véu = escudo de toque: BLOQUEIA o que está atrás (mapa/pins/tab bar). */}
        <View style={styles.veil} pointerEvents="auto" />

        {/* Voz do Beni (headless). Some no aviso e ao trocar etapa/pular/concluir. */}
        {phase === 'steps' && (
          <BeniGuideAudio key={`guide-audio-${index}-${voiceOn}-${soundsOn}`} audioAsset={stepAudio} />
        )}

        {phase === 'prompt' ? (
          <View style={styles.promptWrap} pointerEvents="box-none">
            <LinearGradient colors={['#FBF1D8', '#F4E3BE', '#EAD3A0']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.promptCard}>
              <BeniAvatar variant="happy" size="large" />
              <Text style={styles.promptTitle}>Quer ouvir o Beni?</Text>
              <Text style={styles.promptText}>Ative o som do celular para escutar o guia.</Text>
              <SoundButton style={styles.promptPrimary} onPress={startWithVoice} activeOpacity={0.9} silent>
                <LinearGradient colors={['#FFB15A', '#FF7A2F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promptPrimaryGrad}>
                  <Text style={styles.promptPrimaryText}>Começar com som</Text>
                </LinearGradient>
              </SoundButton>
              <SoundButton style={styles.promptSecondary} onPress={startNoVoice} activeOpacity={0.7} silent>
                <Text style={styles.promptSecondaryText}>Continuar sem voz</Text>
              </SoundButton>
            </LinearGradient>
          </View>
        ) : (
          <>
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
              <LinearGradient colors={['#FBF1D8', '#F4E3BE', '#EAD3A0']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Animated.View style={{ transform: [{ scale: beniScale }] }}>
                    <BeniAvatar variant={step.variant || 'happy'} size="medium" />
                  </Animated.View>
                  <View style={styles.cardBody}>
                    {!!step.title && <Text style={styles.title} numberOfLines={1}>{step.title}</Text>}
                    {!!step.text && <Text style={styles.text} numberOfLines={3}>{step.text}</Text>}
                  </View>
                </View>

                {/* Linha de progresso + links (Voltar / Pular / Sem voz) — contínua */}
                <View style={styles.metaRow}>
                  <View style={styles.dots}>
                    {safeSteps.map((_, i) => (
                      <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                    ))}
                  </View>
                  <View style={styles.links}>
                    {index > 0 && (
                      <SoundButton style={styles.linkBtn} onPress={handleBack} activeOpacity={0.7} disabled={busy} silent>
                        <Text style={styles.linkText}>Voltar</Text>
                      </SoundButton>
                    )}
                    {voiceOn && soundsOn && (
                      <SoundButton style={styles.linkBtn} onPress={() => setVoiceOn(false)} activeOpacity={0.7} silent>
                        <Text style={styles.linkText}>Sem voz</Text>
                      </SoundButton>
                    )}
                    <SoundButton style={styles.linkBtn} onPress={onSkip} activeOpacity={0.7} silent>
                      <Text style={styles.linkText}>Pular</Text>
                    </SoundButton>
                  </View>
                </View>

                {/* CTA largura total → "Começar minha jornada" cabe inteiro (só no fim) */}
                <SoundButton style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.9} disabled={busy} silent>
                  <LinearGradient colors={['#FFB15A', '#FF7A2F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGrad}>
                    <Text style={styles.primaryText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                      {isLast ? finalLabel : 'Próximo'}
                    </Text>
                  </LinearGradient>
                </SoundButton>
              </LinearGradient>
              {arrow === 'down' && <View style={[styles.arrow, styles.arrowDown]} />}
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(40,28,12,0.30)' },
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: 'rgba(255,205,110,0.95)',
    backgroundColor: 'rgba(255,222,150,0.10)',
  },
  // Aviso de som — centralizado
  promptWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 24 },
  promptCard: {
    width: '100%', maxWidth: 360, borderRadius: 24, paddingVertical: 22, paddingHorizontal: 20, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(180,140,70,0.45)',
    elevation: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16,
  },
  promptTitle: { fontFamily: 'FredokaOne', fontSize: 20, color: '#5A4420', marginTop: 8 },
  promptText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '700', color: '#6B5733', textAlign: 'center', marginTop: 6 },
  promptPrimary: { alignSelf: 'stretch', borderRadius: 16, overflow: 'hidden', marginTop: 18 },
  promptPrimaryGrad: { paddingVertical: 13, alignItems: 'center' },
  promptPrimaryText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFFFFF' },
  promptSecondary: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 12 },
  promptSecondaryText: { fontFamily: 'Nunito', fontSize: 13.5, fontWeight: '800', color: '#8A7350', textDecorationLine: 'underline' },
  // Card de etapa
  cardWrap: { position: 'absolute', left: 16, right: 16 },
  arrow: { alignSelf: 'center', width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  arrowUp: { borderBottomWidth: 12, borderBottomColor: '#FBF1D8' },
  arrowDown: { borderTopWidth: 12, borderTopColor: '#EAD3A0' },
  card: {
    borderRadius: 22, paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: 'rgba(180,140,70,0.45)',
    elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  cardBody: { flex: 1, marginLeft: 12 },
  title: { fontFamily: 'FredokaOne', fontSize: 16, color: '#5A4420' },
  text: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: '#6B5733', marginTop: 2, lineHeight: 18 },
  metaRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4, backgroundColor: 'rgba(120,95,55,0.30)' },
  dotActive: { backgroundColor: '#E08A2E', width: 14 },
  links: { flexDirection: 'row', alignItems: 'center' },
  linkBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  linkText: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '800', color: '#8A7350' },
  primaryBtn: { marginTop: 10, borderRadius: 14, overflow: 'hidden' },
  primaryGrad: { paddingVertical: 11, alignItems: 'center' },
  primaryText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFFFFF' },
});
