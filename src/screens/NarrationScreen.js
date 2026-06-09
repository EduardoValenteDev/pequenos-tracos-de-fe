import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Animated, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import SoundButton from '../components/SoundButton';
import SafeScreenHeader from '../components/layout/SafeScreenHeader';
import { BeniGuideBubble } from '../components/beni';
import StorySceneVisual from '../components/story/StorySceneVisual';
import UnlockCelebration from '../components/UnlockCelebration';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import { hasSavedDrawing } from '../services/drawingStorage';
import { colors } from '../theme/colors';
import { colors as pt, radii } from '../theme/productTheme';
import AudioPlayer from '../components/AudioPlayer';
import ProgressBar from '../components/ProgressBar';
import { useProgress } from '../hooks/useProgress';
import { useProgressContext } from '../context/ProgressContext';
import { getOfficialSceneIllustration, getStoryCoverImage } from '../services/storyImageService';
import { canOpenStoryFullExperience } from '../services/contentAccessService';
import { hasSceneAudio, getSceneAudio } from '../services/audioService';

export default function NarrationScreen({ route, navigation }) {
  const { story, cenaIndex } = route.params;

  // Guard: story must have cenas populated (navigation from onboarding used to crash here)
  const hasCenas = !!(story?.cenas?.length);
  const cena = hasCenas ? story.cenas[cenaIndex] : null;

  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const numeroCena = cenaIndex + 1;
  const totalCenas = hasCenas ? story.cenas.length : 0;
  const isLastCena = hasCenas ? (cenaIndex === story.cenas.length - 1) : false;
  const sceneKey = `scene_${String(cenaIndex + 1).padStart(2, '0')}`;
  const sceneAudioEntry = hasCenas ? getSceneAudio(story.id, sceneKey) : null;

  const textoNarracao = cena ? (cena.textoNarracao ?? cena.narracao ?? '') : '';
  const tituloCena = cena ? (cena.titulo ?? `Cena ${numeroCena}`) : '';
  // Fala do Beni antes da cena — vinda do catálogo central (sceneStart)
  const beniMessage = getBeniGuideMessage('sceneStart', { index: cenaIndex });

  // Visuais resolvidos separadamente: ilustração oficial (hoje null) e capa (ambientação)
  const officialIllustration = cena ? getOfficialSceneIllustration(story.id, cena.id) : null;
  const storyCover = getStoryCoverImage(story.id);

  // Progresso — conclusão da cena é desacoplada do colorir (Sprint Histórias 3.0)
  const { progresso, salvarCena } = useProgress(story.id);
  const { refreshProgress } = useProgressContext();
  const jaConcluida = cena ? (progresso[cena.id] === true) : false;

  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationHandledRef = useRef(false);
  // true enquanto a celebração ainda não foi finalizada pela ação principal.
  // Permite reabrir o modal ao retornar de uma ação secundária (visita).
  const celebrationPendingRef = useRef(false);

  // Já existe um desenho salvo desta cena? Muda o convite de colorir.
  const [sceneHasDrawing, setSceneHasDrawing] = useState(false);
  useEffect(() => {
    let alive = true;
    if (cena?.id) {
      hasSavedDrawing(story.id, cena.id).then(v => { if (alive) setSceneHasDrawing(v); });
    } else {
      setSceneHasDrawing(false);
    }
    return () => { alive = false; };
  }, [story.id, cena?.id, jaConcluida]);

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

  // Reexibe a celebração ao voltar de uma ação secundária (visita), enquanto o
  // hub ainda não foi encerrado pela ação principal.
  useFocusEffect(useCallback(() => {
    if (celebrationPendingRef.current && !celebrationHandledRef.current) {
      setShowCelebration(true);
    }
  }, []));

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
    celebrationPendingRef.current = true;
    setShowCelebration(true);
  }

  function handleContinue() {
    if (celebrationHandledRef.current) return;
    celebrationHandledRef.current = true;
    celebrationPendingRef.current = false;
    setShowCelebration(false);
    goToNext();
  }

  // Ações secundárias: escondem o modal antes de navegar para não sobrepor a tela
  // de destino (Modal do RN renderiza fora da pilha do navegador). Não marcam
  // celebrationHandledRef — ao voltar, useFocusEffect reabre o modal.
  function handleColorirFromCelebration() {
    if (celebrationHandledRef.current) return;
    setShowCelebration(false);
    navigation.navigate('Coloring', { story, cenaIndex });
  }

  function handleBauFromCelebration() {
    if (celebrationHandledRef.current) return;
    setShowCelebration(false);
    navigation.navigate('BeniChest');
  }

  function handleEstrelinhasFromCelebration() {
    if (celebrationHandledRef.current) return;
    setShowCelebration(false);
    // EstrelinhasCena é rota Stack — empurra TrophiesScreen sem remover NarrationScreen da pilha.
    navigation.navigate('EstrelinhasCena', { fromPostSceneCelebration: true });
  }

  function handleLibrinhoFromCelebration() {
    if (celebrationHandledRef.current) return;
    setShowCelebration(false);
    navigation.navigate('StoryBook', { story });
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

  // ── Fallback: story sem cenas (ex: objeto de navegação incompleto) ──────────
  if (!hasCenas) {
    return (
      <View style={styles.wrapper}>
        <SafeScreenHeader
          title={story?.titulo || 'Aventura'}
          onBack={handleVoltar}
          showHome
          onHome={handleInicio}
        />
        <View style={styles.fallback}>
          <Text style={styles.fallbackEmoji}>🌟</Text>
          <Text style={styles.fallbackTitle}>Ops!</Text>
          <Text style={styles.fallbackMsg}>
            Não conseguimos abrir essa aventura agora.
          </Text>
          <TouchableOpacity
            style={styles.fallbackBtn}
            onPress={handleVoltar}
            activeOpacity={0.85}
          >
            <Text style={styles.fallbackBtnText}>Voltar para as aventuras</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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

          {/* ── 8. CONVITE PARA COLORIR — ação central da história ── */}
          {sceneHasDrawing ? (
            <SoundButton
              style={styles.colorDoneCard}
              onPress={() => navigation.navigate('Coloring', { story, cenaIndex })}
              activeOpacity={0.85}
            >
              <View style={styles.colorIconWrapDone}>
                <Text style={styles.colorIconEmoji}>🎨</Text>
              </View>
              <View style={styles.colorInfo}>
                <Text style={styles.colorDoneTitle}>Você já coloriu esta cena ✓</Text>
                <Text style={styles.colorDoneSub}>Ver ou editar seu desenho</Text>
              </View>
              <Text style={styles.colorDoneArrow}>→</Text>
            </SoundButton>
          ) : (
            <SoundButton
              style={styles.colorInviteCard}
              onPress={() => navigation.navigate('Coloring', { story, cenaIndex })}
              activeOpacity={0.9}
            >
              <View style={styles.colorIconWrap}>
                <Text style={styles.colorIconEmoji}>🎨</Text>
              </View>
              <View style={styles.colorInfo}>
                <Text style={styles.colorInviteTitle}>Hora de colorir</Text>
                <Text style={styles.colorInviteSub}>Dê cor a esta parte da história.</Text>
              </View>
              <View style={styles.colorBtn}>
                <Text style={styles.colorBtnText}>Colorir cena</Text>
              </View>
            </SoundButton>
          )}

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
        onColorir={handleColorirFromCelebration}
        onBau={handleBauFromCelebration}
        onEstrelinhas={handleEstrelinhasFromCelebration}
        onLibrinho={isLastCena ? handleLibrinhoFromCelebration : null}
        sceneNumber={numeroCena}
        totalCenas={totalCenas}
        sceneHasDrawing={sceneHasDrawing}
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

  // Convite para colorir — ação central, chamativa (laranja Beni + creme)
  colorInviteCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: '#FFF4E6',
    borderRadius: radii.lg,
    padding: 12, gap: 12,
    borderWidth: 1.5, borderColor: pt.beniSoft,
    elevation: 3, shadowColor: pt.beniDeep,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 6,
  },
  colorIconWrap: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: pt.beniSoft,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  colorIconWrapDone: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: pt.greenSoft,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  colorIconEmoji: { fontSize: 26 },
  colorInfo: { flex: 1 },
  colorInviteTitle: {
    fontFamily: 'FredokaOne', fontSize: 16, color: '#9A4A12', marginBottom: 1,
  },
  colorInviteSub: {
    fontFamily: 'Nunito', fontSize: 12.5, color: '#9A6B4A', fontWeight: '700', lineHeight: 17,
  },
  colorBtn: {
    backgroundColor: pt.beni,
    borderRadius: radii.pill,
    paddingHorizontal: 16, paddingVertical: 10, flexShrink: 0,
    elevation: 2, shadowColor: pt.beniDeep,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  colorBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },

  // Cena já colorida — estado calmo (verde vida)
  colorDoneCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: pt.greenSoft,
    borderRadius: radii.lg,
    padding: 12, gap: 12,
    borderWidth: 1.5, borderColor: 'rgba(94,156,62,0.30)',
  },
  colorDoneTitle: {
    fontFamily: 'FredokaOne', fontSize: 15, color: pt.greenDeep, marginBottom: 1,
  },
  colorDoneSub: {
    fontFamily: 'Nunito', fontSize: 12.5, color: '#5E7A47', fontWeight: '700',
  },
  colorDoneArrow: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.greenDeep, flexShrink: 0, paddingRight: 4,
  },

  // Cena anterior — o mais discreto
  prevLink: {
    marginTop: 14, alignSelf: 'center',
    paddingVertical: 6, paddingHorizontal: 12,
  },
  prevLinkText: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.textLight, fontWeight: '700',
  },

  // Fallback: story sem cenas
  fallback: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  fallbackEmoji: { fontSize: 56, marginBottom: 12 },
  fallbackTitle: {
    fontFamily: 'FredokaOne', fontSize: 26, color: colors.text, marginBottom: 8,
  },
  fallbackMsg: {
    fontFamily: 'Nunito', fontSize: 16, color: colors.textLight,
    textAlign: 'center', lineHeight: 24, marginBottom: 24,
  },
  fallbackBtn: {
    backgroundColor: colors.action,
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28,
    elevation: 3,
    shadowColor: colors.action, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 5,
  },
  fallbackBtnText: {
    fontFamily: 'FredokaOne', fontSize: 17, color: '#FFFFFF',
  },
});
