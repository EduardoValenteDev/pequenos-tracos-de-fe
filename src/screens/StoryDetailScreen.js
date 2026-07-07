import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView,
  Animated, StyleSheet, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProgress } from '../hooks/useProgress';
import { useStoryPackDownload } from '../hooks/useStoryPackDownload';
import { hasSavedDrawing } from '../services/drawingStorage';
import { preloadStorySceneIllustrations } from '../services/storyImageService';
import { hasAccess } from '../services/accessControl';
import { isStoryComingSoon, getStoryAccessStatus } from '../services/contentAccessService';
import { getStoryJourneyStatus } from '../services/storyJourneyService';
import { hasStoryColoringActivityDone } from '../services/coloringActivityService';
import { useProgressContext } from '../context/ProgressContext';
import { isQuizDone, getReflection, isStoryBookOpened } from '../services/postStoryStorage';
import StoryBookHero from '../components/story/StoryBookHero';
import SceneListItem from '../components/story/SceneListItem';
import { LumiEmptyState } from '../components/lumi';
import { BeniGuideBubble } from '../components/beni';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import ContentContainer from '../components/ui/ContentContainer';
import BotaoPrimario from '../components/ui/BotaoPrimario';
import { color } from '../theme/tokens';

function PostStoryCard({ emoji, title, desc, done, tagColor, onPress, isTablet }) {
  return (
    <SoundButton
      style={[styles.postCard, done && styles.postCardDone, isTablet && styles.postCardTablet]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.postCardIcon, { backgroundColor: tagColor + '22' }]}>
        <Text style={styles.postCardEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.postCardTitle}>{title}</Text>
      {desc ? <Text style={styles.postCardDesc}>{desc}</Text> : null}
      {done && (
        <View style={styles.postCardBadge}>
          <Text style={styles.postCardBadgeText}>✓</Text>
        </View>
      )}
    </SoundButton>
  );
}

export default function StoryDetailScreen({ route, navigation }) {
  const { story } = route.params;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;

  const { isStorySequenceUnlocked } = useProgressContext();
  const { progresso } = useProgress(story.id);
  const progressCount = Object.values(progresso).filter(Boolean).length;
  const totalScenes = story.totalCenas ?? 0;
  const xpPercent = totalScenes > 0 ? progressCount / totalScenes : 0;
  const isCompleted = progressCount >= totalScenes && totalScenes > 0;
  // B1: "Em breve" inclui histórias sem mídia suficiente (não só catálogo).
  const isComingSoon = isStoryComingSoon(story);
  const canAccess = hasAccess(story);
  // A0.10: sequência da jornada — só abre se a história ANTERIOR estiver journeyComplete.
  const sequenceUnlocked = isStorySequenceUnlocked(story.id);
  // Fase 2B: estado de download do pack remoto vem do hook dedicado em src/hooks; a tela
  // consome só esse hook e não acessa o runtime de conteúdo diretamente (guardrail preservado).
  // O bloco de download só aparece p/ premium-active (canAccess) + história remote (hook.isRemote).
  const packDownload = useStoryPackDownload(story.id);

  const [savedDrawings, setSavedDrawings] = useState({});
  const [quizDone, setQuizDone] = useState(false);
  const [reflectionDone, setReflectionDone] = useState(false);
  const [bookOpened, setBookOpened] = useState(false);
  const [coloringDone, setColoringDone] = useState(false);

  // Preload leve das ilustrações oficiais da história atual (reduz atraso visual
  // ao abrir as cenas). Fire-and-forget; no-op se a história ainda não tem artes.
  useEffect(() => {
    if (story?.id) preloadStorySceneIllustrations(story.id);
  }, [story?.id]);

  useEffect(() => {
    if (!story.cenas?.length) return;
    async function checkDrawings() {
      const result = {};
      for (const cena of story.cenas) {
        result[cena.id] = await hasSavedDrawing(story.id, cena.id);
      }
      setSavedDrawings(result);
    }
    checkDrawings();
  }, [progressCount]);

  useFocusEffect(
    useCallback(() => {
      if (!isCompleted) return;
      isQuizDone(story.id).then(setQuizDone);
      getReflection(story.id).then(r => setReflectionDone(!!r));
      isStoryBookOpened(story.id).then(setBookOpened);
      hasStoryColoringActivityDone(story.id).then(setColoringDone);
    }, [story.id, isCompleted]),
  );

  // A0.10: status público via FONTE ÚNICA (storyJourneyService) — mesma regra do
  // mapa e do card. journeyComplete = cenas + Livrinho + quiz + reflexão + colorir
  // (≥1 página). O progresso de cenas ("10/10") segue separado (journey.progress) e
  // NÃO dispara o selo "Concluída" sozinho.
  const journey = getStoryJourneyStatus({
    totalScenes,
    sceneDoneCount: progressCount,
    postStoryStatus: { storyBookOpened: bookOpened, quizDone, reflectionDone },
    coloringComplete: coloringDone,
    accessStatus: getStoryAccessStatus(story),
    accessType: story.accessType,
    isFirstStory: true, // sequência tratada à parte (sequenceUnlocked)
  });
  const isFullyComplete = journey.journeyComplete;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const startCenaIndex = progressCount > 0 && !isCompleted ? progressCount : 0;

  function getPrimaryLabel() {
    // A0.5: sentence case, SEM emoji de UI (Lei 3). Terracota é a única cor de ação.
    // A0.10: sequência primeiro (jornada não chegou → "Complete a aventura anterior",
    // desabilitado). "Rever a aventura" SÓ com journeyComplete. Cenas completas mas
    // jornada pendente → "Continuar aventura".
    if (isComingSoon) return 'Em breve';
    if (!sequenceUnlocked) return 'Complete a aventura anterior';
    if (!canAccess) return 'Pedir ao responsável';
    if (isFullyComplete) return 'Rever a aventura';
    if (progressCount > 0) return 'Continuar aventura';
    return 'Começar a história';
  }

  function handlePrimary() {
    if (isComingSoon) return;
    if (!sequenceUnlocked) return; // jornada não chegou — ação bloqueada (botão desabilitado)
    if (isCompleted) {
      navigation.navigate('Narration', { story, cenaIndex: 0 });
      return;
    }
    if (!canAccess) {
      navigation.navigate('ParentArea');
      return;
    }
    navigation.navigate('Narration', { story, cenaIndex: startCenaIndex });
  }

  function getSceneStatus(cena, index) {
    if (isComingSoon) return 'locked'; // B1: sem mídia → cenas não abrem o player vazio
    if (!canAccess) return 'locked';
    if (progresso[cena.id] === true) return 'completed';
    if (index === progressCount) return 'available';
    return 'locked';
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── STORY BOOK HERO (A0.5) — hero de exibição em papel/tinta ── */}
          <StoryBookHero
            story={story}
            progressCount={progressCount}
            totalScenes={totalScenes}
            isTablet={isTablet}
            isFullyComplete={isFullyComplete}
            isComingSoon={isComingSoon}
            isLocked={!canAccess}
          />

          {/* ── AÇÃO PRINCIPAL (A0.5) — BotaoPrimario terracota, centralizado no
              tablet/iPad via ContentContainer. Toda a lógica de acesso/navegação
              (handlePrimary) permanece intacta. ── */}
          <ContentContainer style={styles.ctaWrap}>
            <BotaoPrimario
              label={getPrimaryLabel()}
              onPress={handlePrimary}
              disabled={isComingSoon || !sequenceUnlocked}
              style={styles.ctaBtn}
            />
          </ContentContainer>

          {/* ── Fase 2B: download de pack remoto (só premium-active + história remote) ── */}
          {canAccess && packDownload.isRemote && !isComingSoon && (
            <ContentContainer style={styles.downloadWrap}>
              {packDownload.uiState === 'ready' ? (
                <Text style={styles.downloadReady}>Baixado ✓ · funciona offline</Text>
              ) : packDownload.uiState === 'downloading' ? (
                <View style={styles.downloadBox}>
                  <Text style={styles.downloadLabel}>Baixando… {Math.round(packDownload.progress * 100)}%</Text>
                  <View style={styles.downloadTrack}>
                    <View style={[styles.downloadFill, { width: `${Math.round(packDownload.progress * 100)}%` }]} />
                  </View>
                </View>
              ) : (
                <SoundButton
                  style={styles.downloadBtn}
                  onPress={packDownload.uiState === 'error' ? packDownload.retry : packDownload.download}
                  activeOpacity={0.85}
                >
                  <Text style={styles.downloadBtnText}>
                    {packDownload.uiState === 'error' ? 'Não foi possível baixar. Tentar de novo' : 'Baixar história (usar offline)'}
                  </Text>
                </SoundButton>
              )}
            </ContentContainer>
          )}

          {/* ── ENTRADA GUIADA PELO BENI ── */}
          {!isComingSoon && (
            <ContentContainer style={styles.beniWrap}>
              <BeniGuideBubble
                message={
                  !canAccess
                    ? getBeniGuideMessage('premiumBlocked')
                    : isCompleted
                      ? getBeniGuideMessage('storyCompleted')
                      : progressCount > 0
                        ? getBeniGuideMessage('continueStory')
                        : getBeniGuideMessage('storyIntro')
                }
                avatarVariant={isCompleted ? 'celebrating' : !canAccess ? 'thinking' : 'pointing'}
                tone={!canAccess ? 'yellow' : 'soft'}
                compact
                style={styles.beniEntry}
              />
            </ContentContainer>
          )}

          {/* ── PÓS-CENAS — pendências da jornada (Livrinho, Quiz, Guardar, Colorir) ── */}
          {/* A0.10: cabeçalho só diz "Aventura concluída!" quando journeyComplete
              (cenas + Livrinho + quiz + reflexão + colorir). Com apenas as cenas,
              evita "Concluída" e conduz às atividades pendentes (✓ em cada card já
              feito). Gradiente em AZUL-NOITE (tokens) — roxo aposentado (Lei 9). */}
          {isCompleted && (
            <View style={styles.completedSection}>
              <LinearGradient
                colors={[color.night800, color.night600]}
                style={styles.completedHeader}
              >
                <Text style={styles.completedEmoji}>{isFullyComplete ? '🎉' : '🎬'}</Text>
                <Text style={styles.completedTitle}>
                  {isFullyComplete ? 'Aventura concluída!' : 'Você terminou as cenas!'}
                </Text>
                <Text style={styles.completedSub}>
                  {isFullyComplete
                    ? 'Agora escolha uma atividade especial.'
                    : 'Ainda falta completar as atividades da aventura.'}
                </Text>
              </LinearGradient>
              <View style={[styles.completedCards, isTablet && styles.completedCardsTablet]}>
                <PostStoryCard
                  emoji="📖"
                  title="Livrinho da Fé"
                  desc="Ver minha história colorida"
                  done={bookOpened}
                  tagColor={color.night600}
                  isTablet={isTablet}
                  onPress={() => navigation.navigate('StoryBook', { story })}
                />
                <PostStoryCard
                  emoji="⭐"
                  title="Quiz"
                  desc="Responder perguntas"
                  done={quizDone}
                  tagColor={color.gold500}
                  isTablet={isTablet}
                  onPress={() => navigation.navigate('Quiz', { story })}
                />
                <PostStoryCard
                  emoji="✨"
                  title="Guardar no coração"
                  desc="O que ficou no coração"
                  done={reflectionDone}
                  tagColor={color.terra500}
                  isTablet={isTablet}
                  onPress={() => navigation.navigate('Reflection', { story })}
                />
                <PostStoryCard
                  emoji="🎨"
                  title="Colorir"
                  desc="Pintar uma cena"
                  done={coloringDone}
                  tagColor={color.gold300}
                  isTablet={isTablet}
                  onPress={() => navigation.navigate('Narration', { story, cenaIndex: 0 })}
                />
              </View>
            </View>
          )}

          {/* ── LISTA DE CENAS ── */}
          {story.cenas?.length > 0 ? (
            <View style={[styles.scenesSection, isTablet && styles.scenesSectionTablet]}>
              <Text style={styles.scenesTitle}>Cenas da aventura</Text>
              {story.cenas.map((cena, index) => (
                <SceneListItem
                  key={cena.id}
                  cena={cena}
                  index={index}
                  status={getSceneStatus(cena, index)}
                  hasDrawing={savedDrawings[cena.id] === true}
                  onPress={() => navigation.navigate('Narration', { story, cenaIndex: index })}
                />
              ))}
            </View>
          ) : isComingSoon ? (
            <View style={styles.emptySection}>
              <LumiEmptyState
                title="Essa história está sendo preparada!"
                message="Em breve você vai poder explorar todas as cenas dessa aventura com Beni."
              />
            </View>
          ) : null}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: color.paper50 }, // A0.5: fundo papel (Lei 7)
  ctaWrap: { marginHorizontal: 20, marginTop: 18 },
  // A0.5 ajuste: botão mais elegante — largura capada e centralizada (não full-bleed,
  // não encosta nas bordas). Mantém alvo 56 e terracota (do BotaoPrimario).
  ctaBtn: { alignSelf: 'center', width: '100%', maxWidth: 340 },

  // Fase 2B — bloco de download de pack remoto (premium-active + história remote).
  // Ação secundária abaixo do CTA; acento azul-noite (mesmo tom da seção "completed").
  downloadWrap: { marginHorizontal: 20, marginTop: 10, alignItems: 'center' },
  downloadReady: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center',
  },
  downloadBox: { width: '100%', maxWidth: 340, alignSelf: 'center' },
  downloadLabel: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    textAlign: 'center', marginBottom: 6,
  },
  downloadTrack: {
    height: 8, borderRadius: 4, backgroundColor: pt.border, overflow: 'hidden',
  },
  downloadFill: { height: '100%', borderRadius: 4, backgroundColor: color.night600 },
  downloadBtn: {
    alignSelf: 'center', width: '100%', maxWidth: 340, alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: radii.pill, borderWidth: 1.5, borderColor: color.night600,
    backgroundColor: 'transparent',
  },
  downloadBtnText: {
    fontFamily: 'FredokaOne', fontSize: 15, color: color.night600, textAlign: 'center',
  },

  beniWrap: { marginTop: 2 },
  beniEntry: { marginHorizontal: 16, marginTop: 14 },
  container: { flex: 1 },
  content: {},

  completedSection: {
    marginHorizontal: 16, marginTop: 16,
    borderRadius: radii.lg, overflow: 'hidden',
    ...shadows.card,
  },
  completedHeader: {
    paddingVertical: 16, paddingHorizontal: 20,
    alignItems: 'center',
  },
  completedEmoji: { fontSize: 32, marginBottom: 4 },
  completedTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF', marginBottom: 2,
  },
  completedSub: {
    fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.85)',
  },
  completedCards: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    padding: 12, gap: 8,
  },
  completedCardsTablet: {
    flexDirection: 'row',
  },
  postCard: {
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1.5, borderColor: pt.border,
    position: 'relative',
  },
  postCardTablet: {
    flex: 1,
  },
  postCardDone: { opacity: 0.7 },
  postCardIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  postCardEmoji: { fontSize: 26 },
  postCardTitle: {
    fontFamily: 'FredokaOne', fontSize: 14, color: pt.text,
    textAlign: 'center', marginBottom: 2,
  },
  postCardDesc: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft,
    textAlign: 'center', lineHeight: 17,
  },
  postCardBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: pt.greenSoft,
    borderRadius: radii.pill,
    width: 22, height: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  postCardBadgeText: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.freeText, fontWeight: '700',
  },

  scenesSection: {
    paddingHorizontal: 16, marginTop: 24,
  },
  scenesSectionTablet: { paddingHorizontal: 24 },
  scenesTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 12,
  },
  emptySection: {
    marginHorizontal: 16, marginTop: 24,
  },
});
