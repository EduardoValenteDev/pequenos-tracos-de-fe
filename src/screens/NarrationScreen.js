import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Image,
  Animated, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import SoundButton from '../components/SoundButton';
import { LumiSpeechBubble } from '../components/lumi';
import { colors } from '../theme/colors';
import AudioPlayer from '../components/AudioPlayer';
import ProgressBar from '../components/ProgressBar';
import { images } from '../assets/images';
import { canOpenStoryFullExperience } from '../services/contentAccessService';
import { hasSceneAudio, getSceneAudio } from '../services/audioService';

const LUMI_MESSAGES = [
  'Pinte essa cena com carinho quando terminar de ouvir.',
  'Que história incrível! Use suas melhores cores!',
  'Deus está em cada detalhe dessa cena!',
  'Continue, você está indo muito bem!',
  'Hora de deixar sua marca nessa aventura!',
];

export default function NarrationScreen({ route, navigation }) {
  const { story, cenaIndex } = route.params;
  const cena = story.cenas[cenaIndex];
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const numeroCena = cenaIndex + 1;
  const totalCenas = story.cenas.length;
  const sceneKey = `scene_${String(cenaIndex + 1).padStart(2, '0')}`;
  const sceneAudioEntry = getSceneAudio(story.id, sceneKey);

  const textoNarracao = cena.textoNarracao ?? cena.narracao ?? '';
  const corTema = cena.corTema ?? cena.ilustracaoCor ?? colors.secondary;
  const imagemNarracao = cena.imagemNarracao ?? cena.imagemCena ?? null;
  const emojiCena = cena.emojiCena ?? story.emoji ?? '✨';
  const tituloCena = cena.titulo ?? `Cena ${numeroCena}`;
  const lumiMessage = LUMI_MESSAGES[cenaIndex % LUMI_MESSAGES.length];

  const cenaImg = imagemNarracao ? images[imagemNarracao] : null;

  useEffect(() => {
    if (!canOpenStoryFullExperience(story)) {
      navigation.replace('ParentArea');
    }
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const colorirPulse = useRef(new Animated.Value(1)).current;
  const guiaFade = useRef(new Animated.Value(0)).current;
  const guiaSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(guiaFade, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      Animated.timing(guiaSlide, { toValue: 0, duration: 500, delay: 300, useNativeDriver: true }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(colorirPulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(colorirPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [cenaIndex]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── PROGRESS BAR ── */}
          <View style={styles.progressArea}>
            <ProgressBar current={numeroCena - 1} total={totalCenas} />
            <Text style={styles.cenaLabel}>
              {emojiCena} Cena {numeroCena} de {totalCenas}
            </Text>
          </View>

          {/* ── SCENE ILLUSTRATION ── */}
          <View style={styles.ilustracaoWrapper}>
            {cenaImg ? (
              <Image source={cenaImg} style={styles.ilustracaoImg} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={[corTema, corTema + 'BB']}
                style={styles.ilustracaoFallback}
              >
                <Text style={styles.fallbackEmoji}>{emojiCena}</Text>
                <Text style={styles.fallbackTitulo}>{tituloCena}</Text>
                <Text style={styles.fallbackSub}>Ilustração em breve</Text>
              </LinearGradient>
            )}
            <View style={styles.cenaBadge}>
              <Text style={styles.cenaBadgeText}>{numeroCena}/{totalCenas}</Text>
            </View>
          </View>

          {/* ── NARRATION CARD ── */}
          <View style={styles.narrCard}>
            <Text style={styles.narrTitulo}>{tituloCena}</Text>
            <Text style={styles.narracao}>{textoNarracao}</Text>
          </View>

          {/* ── AUDIO PLAYER — only when real audio is bundled and screen is focused ── */}
          {hasSceneAudio(story.id, sceneKey) && isFocused ? (
            <AudioPlayer audioAsset={sceneAudioEntry.audioAsset} />
          ) : (
            <View style={styles.noAudioHint}>
              <Text style={styles.noAudioHintText}>
                🔇 O som desta cena será adicionado depois. Você pode ler com calma.
              </Text>
            </View>
          )}

          {/* ── LUMI SPEECH BUBBLE — guia emocional em todas as histórias ── */}
          <Animated.View
            style={[
              styles.lumiArea,
              { opacity: guiaFade, transform: [{ translateY: guiaSlide }] },
            ]}
          >
            <LumiSpeechBubble message={lumiMessage} />
          </Animated.View>

          {/* ── "HORA DE COLORIR" BUTTON ── */}
          <Animated.View style={{ transform: [{ scale: colorirPulse }] }}>
            <SoundButton
              style={styles.colorirBtn}
              onPress={() => navigation.navigate('Coloring', { story, cenaIndex })}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#FFD166', '#FFC02D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.colorirBtnGradient}
              >
                <Text style={styles.colorirBtnText}>🎨  Hora de Colorir!</Text>
              </LinearGradient>
            </SoundButton>
          </Animated.View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { paddingBottom: 0 },

  progressArea: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 4 },
  cenaLabel: {
    fontFamily: 'Nunito', fontSize: 13, color: colors.textLight,
    textAlign: 'center', marginTop: 8,
  },

  ilustracaoWrapper: {
    marginHorizontal: 16, marginBottom: 16,
    borderRadius: 20, overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6,
  },
  ilustracaoImg: { width: '100%', height: 240 },
  ilustracaoFallback: {
    height: 240,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  fallbackEmoji: { fontSize: 60 },
  fallbackTitulo: {
    fontFamily: 'FredokaOne', fontSize: 20, color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
    textAlign: 'center', paddingHorizontal: 20,
  },
  fallbackSub: {
    fontFamily: 'Nunito', fontSize: 12, color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  cenaBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  cenaBadgeText: { fontFamily: 'FredokaOne', fontSize: 12, color: '#FFF' },

  noAudioHint: {
    marginHorizontal: 20,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F0FF',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#A78BFA',
  },
  noAudioHintText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    fontStyle: 'italic',
  },

  narrCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20, marginHorizontal: 16, marginBottom: 10,
    padding: 20, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  narrTitulo: {
    fontFamily: 'FredokaOne', fontSize: 17, color: colors.primary,
    marginBottom: 10,
  },
  narracao: {
    fontFamily: 'Nunito', fontSize: 18, color: colors.text,
    lineHeight: 30, textAlign: 'left',
  },

  lumiArea: {
    marginHorizontal: 16,
    marginBottom: 12,
  },

  colorirBtn: {
    marginHorizontal: 16, marginTop: 4,
    borderRadius: 24, overflow: 'hidden',
    elevation: 6,
    shadowColor: '#FFD166',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5, shadowRadius: 8,
  },
  colorirBtnGradient: {
    paddingVertical: 18, alignItems: 'center', borderRadius: 24,
  },
  colorirBtnText: { fontFamily: 'FredokaOne', fontSize: 20, color: colors.text },
});
