import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView,
  Animated, StyleSheet, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProgress } from '../hooks/useProgress';
import { hasSavedDrawing } from '../services/drawingStorage';
import { preloadStorySceneIllustrations } from '../services/storyImageService';
import { hasAccess } from '../services/accessControl';
import { isStoryComingSoon } from '../services/contentAccessService';
import { isQuizDone, getReflection } from '../services/postStoryStorage';
import StoryBookHero from '../components/story/StoryBookHero';
import SceneListItem from '../components/story/SceneListItem';
import { LumiEmptyState } from '../components/lumi';
import { BeniGuideBubble } from '../components/beni';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';

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

  const { progresso } = useProgress(story.id);
  const progressCount = Object.values(progresso).filter(Boolean).length;
  const totalScenes = story.totalCenas ?? 0;
  const xpPercent = totalScenes > 0 ? progressCount / totalScenes : 0;
  const isCompleted = progressCount >= totalScenes && totalScenes > 0;
  // B1: "Em breve" inclui histórias sem mídia suficiente (não só catálogo).
  const isComingSoon = isStoryComingSoon(story);
  const canAccess = hasAccess(story);

  const [savedDrawings, setSavedDrawings] = useState({});
  const [quizDone, setQuizDone] = useState(false);
  const [reflectionDone, setReflectionDone] = useState(false);

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
    }, [story.id, isCompleted]),
  );

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
    if (isComingSoon) return '⏳ Em breve';
    if (isCompleted) return '↩ Rever a Aventura';
    if (!canAccess) return 'Pedir ao responsável';
    if (progressCount > 0) return '▶ Continuar a História';
    return '▶ Começar a História';
  }

  function handlePrimary() {
    if (isComingSoon) return;
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

          {/* ── STORY BOOK HERO ── */}
          <StoryBookHero
            story={story}
            progressCount={progressCount}
            totalScenes={totalScenes}
            primaryLabel={getPrimaryLabel()}
            onPrimaryPress={handlePrimary}
            isTablet={isTablet}
            isCompleted={isCompleted}
            isComingSoon={isComingSoon}
            isLocked={!canAccess}
          />

          {/* ── ENTRADA GUIADA PELO BENI ── */}
          {!isComingSoon && (
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
          )}

          {/* ── AVENTURA CONCLUÍDA — 3 opções ── */}
          {isCompleted && (
            <View style={styles.completedSection}>
              <LinearGradient
                colors={['#7C3AED', '#A78BFA']}
                style={styles.completedHeader}
              >
                <Text style={styles.completedEmoji}>🎉</Text>
                <Text style={styles.completedTitle}>Aventura concluída!</Text>
                <Text style={styles.completedSub}>Agora escolha uma atividade especial.</Text>
              </LinearGradient>
              <View style={[styles.completedCards, isTablet && styles.completedCardsTablet]}>
                <PostStoryCard
                  emoji="📖"
                  title="Livrinho da Fé"
                  desc="Ver minha história colorida"
                  done={false}
                  tagColor={pt.blue}
                  isTablet={isTablet}
                  onPress={() => navigation.navigate('StoryBook', { story })}
                />
                <PostStoryCard
                  emoji="⭐"
                  title="Quiz"
                  desc="Responder perguntas"
                  done={quizDone}
                  tagColor={pt.gold}
                  isTablet={isTablet}
                  onPress={() => navigation.navigate('Quiz', { story })}
                />
                <PostStoryCard
                  emoji="✨"
                  title="Guardar no coração"
                  desc="O que ficou no coração"
                  done={reflectionDone}
                  tagColor={pt.purple}
                  isTablet={isTablet}
                  onPress={() => navigation.navigate('Reflection', { story })}
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
  wrapper: { flex: 1, backgroundColor: colors.background },
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
