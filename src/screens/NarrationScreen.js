import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView,
  Animated, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import SoundButton from '../components/SoundButton';
import SafeScreenHeader from '../components/layout/SafeScreenHeader';
import { BeniGuideBubble } from '../components/beni';
import StorySceneVisual from '../components/story/StorySceneVisual';
import UnlockCelebration from '../components/UnlockCelebration';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import { colors } from '../theme/colors';
import AudioPlayer from '../components/AudioPlayer';
import ProgressBar from '../components/ProgressBar';
import { useProgress } from '../hooks/useProgress';
import { useProgressContext } from '../context/ProgressContext';
import { getOfficialSceneIllustration, getStoryCoverImage } from '../services/storyImageService';
import { canOpenStoryFullExperience } from '../services/contentAccessService';
import { hasSceneAudio, getSceneAudio } from '../services/audioService';

export default function NarrationScreen({ route, navigation }) {
  const { story, cenaIndex } = route.params;
  const cena = story.cenas[cenaIndex];
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const numeroCena = cenaIndex + 1;
  const totalCenas = story.cenas.length;
  const isLastCena = cenaIndex === story.cenas.length - 1;
  const sceneKey = `scene_${String(cenaIndex + 1).padStart(2, '0')}`;
  const sceneAudioEntry = getSceneAudio(story.id, sceneKey);

  const textoNarracao = cena.textoNarracao ?? cena.narracao ?? '';
  const tituloCena = cena.titulo ?? `Cena ${numeroCena}`;
  // Fala do Beni antes da cena — vinda do catálogo central (sceneStart)
  const beniMessage = getBeniGuideMessage('sceneStart', { index: cenaIndex });

  // Visuais resolvidos separadamente: ilustração oficial (hoje null) e capa (ambientação)
  const officialIllustration = getOfficialSceneIllustration(story.id, cena.id);
  const storyCover = getStoryCoverImage(story.id);

  // Progresso — conclusão da cena é desacoplada do colorir (Sprint Histórias 3.0)
  const { progresso, salvarCena } = useProgress(story.id);
  const { refreshProgress } = useProgressContext();
  const jaConcluida = progresso[cena.id] === true;

  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationHandledRef = useRef(false);

  useEffect(() => {
    if (!canOpenStoryFullExperience(story)) {
      navigation.replace('ParentArea');
    }
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
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
  }, [cenaIndex]);

  // ── Navegação segura ──
  function handleVoltar() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('StoryDetail', { story });
  }

  function handleInicio() {
    navigation.navigate('Home');
  }

  function handleCenaAnterior() {
    if (cenaIndex <= 0) return;
    // replace mantém a pilha limpa; não conclui cena, não dá estrela, não abre colorir
    navigation.replace('Narration', { story, cenaIndex: cenaIndex - 1 });
  }

  function goToNext() {
    if (isLastCena) navigation.navigate('Congrats', { story });
    else navigation.replace('Narration', { story, cenaIndex: cenaIndex + 1 });
  }

  // ── Conclusão da cena (caminho principal) ──
  async function handleConcluirCena() {
    if (!canOpenStoryFullExperience(story)) return;
    // salvarCena é idempotente: não duplica estrela se a cena já estava concluída
    await salvarCena(cena.id);
    refreshProgress();
    celebrationHandledRef.current = false;
    setShowCelebration(true);
  }

  function handleContinue() {
    if (celebrationHandledRef.current) return;
    celebrationHandledRef.current = true;
    setShowCelebration(false);
    goToNext();
  }

  // Rótulo + ação do botão principal conforme o estado da cena
  let primaryLabel;
  let primaryAction;
  if (!jaConcluida) {
    primaryLabel = 'Concluir cena ⭐';
    primaryAction = handleConcluirCena;
  } else if (!isLastCena) {
    primaryLabel = 'Próxima cena →';
    primaryAction = goToNext;
  } else {
    primaryLabel = 'Finalizar aventura →';
    primaryAction = goToNext;
  }

  return (
    <View style={styles.wrapper}>
      {/* ── HEADER seguro: Voltar · título · 🏠 Início ── */}
      <SafeScreenHeader
        title={story.titulo}
        onBack={handleVoltar}
        showHome
        onHome={handleInicio}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── 1. PROGRESSO DA HISTÓRIA ── */}
          <View style={styles.progressArea}>
            <ProgressBar current={numeroCena - 1} total={totalCenas} />
            <Text style={styles.cenaLabel}>
              Cena {numeroCena} de {totalCenas}
            </Text>
          </View>

          {/* ── 2. BENI GUIA COMPACTO ── */}
          <Animated.View
            style={[
              styles.beniArea,
              { opacity: guiaFade, transform: [{ translateY: guiaSlide }] },
            ]}
          >
            <BeniGuideBubble message={beniMessage} avatarVariant="reading" tone="blue" compact />
          </Animated.View>

          {/* ── 3. VISUAL DA CENA ── */}
          <StorySceneVisual
            scene={cena}
            story={story}
            officialIllustration={officialIllustration}
            storyCover={storyCover}
            sceneNumber={numeroCena}
            totalScenes={totalCenas}
          />

          {/* ── 4 + 5. TÍTULO + TEXTO DA CENA ── */}
          <View style={styles.narrCard}>
            <Text style={styles.narrTitulo}>{tituloCena}</Text>
            <Text style={styles.narracao}>{textoNarracao}</Text>
          </View>

          {/* ── 6. ÁUDIO (real) ou aviso discreto de áudio futuro ── */}
          {hasSceneAudio(story.id, sceneKey) && isFocused ? (
            <AudioPlayer audioAsset={sceneAudioEntry.audioAsset} />
          ) : (
            <View style={styles.noAudioHint}>
              <Text style={styles.noAudioHintText}>
                🔇 O som desta cena será adicionado depois. Você pode ler com calma.
              </Text>
            </View>
          )}

          {/* ── 7. AÇÃO PRINCIPAL — concluir / avançar a cena ── */}
          <SoundButton
            style={styles.primaryBtn}
            onPress={primaryAction}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#7C3AED', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
            </LinearGradient>
          </SoundButton>

          {/* ── 8. AÇÃO SECUNDÁRIA — pintar a cena no Ateliê (opcional) ── */}
          <SoundButton
            style={styles.pintarLink}
            onPress={() => navigation.navigate('Coloring', { story, cenaIndex })}
            activeOpacity={0.8}
          >
            <Text style={styles.pintarLinkText}>Pintar no Ateliê 🎨</Text>
          </SoundButton>

          {/* ── 9. CENA ANTERIOR — secundário, só a partir da cena 2 ── */}
          {cenaIndex > 0 && (
            <SoundButton
              style={styles.prevLink}
              onPress={handleCenaAnterior}
              activeOpacity={0.8}
            >
              <Text style={styles.prevLinkText}>‹ Cena anterior</Text>
            </SoundButton>
          )}

        </Animated.View>
      </ScrollView>

      <UnlockCelebration
        visible={showCelebration}
        onContinue={handleContinue}
        isLast={isLastCena}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { paddingBottom: 0 },

  // Header customizado (sem nomes internos de rota)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: colors.cardBg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  headerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  headerBtnText: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.primary, fontWeight: '700',
  },
  headerHomeText: {
    fontFamily: 'FredokaOne', fontSize: 14, color: colors.primary,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'FredokaOne', fontSize: 16, color: colors.text,
    textAlign: 'center', marginHorizontal: 6,
  },

  progressArea: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 4 },
  cenaLabel: {
    fontFamily: 'Nunito', fontSize: 13, color: colors.textLight,
    textAlign: 'center', marginTop: 8,
  },

  beniArea: {
    marginHorizontal: 16,
    marginBottom: 8,
  },

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

  // Ação principal — concluir / avançar (botão forte)
  primaryBtn: {
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 999, overflow: 'hidden',
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
  primaryBtnGradient: {
    paddingVertical: 16, alignItems: 'center',
  },
  primaryBtnText: { fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF' },

  // Ação secundária — pintar no Ateliê (link leve, não compete com o principal)
  pintarLink: {
    marginTop: 12, alignSelf: 'center',
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#FFF6E0',
    borderWidth: 1, borderColor: '#FFE0A3',
  },
  pintarLinkText: {
    fontFamily: 'Nunito', fontSize: 14, color: '#8A6D00', fontWeight: '700',
  },

  // Cena anterior — o mais discreto
  prevLink: {
    marginTop: 14, alignSelf: 'center',
    paddingVertical: 6, paddingHorizontal: 12,
  },
  prevLinkText: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.textLight, fontWeight: '700',
  },
});
