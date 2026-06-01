import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Image,
  Animated, StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from '../components/SoundButton';
import Confetti from '../components/Confetti';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { images } from '../assets/images';
import { stories } from '../data/stories';
import { useProgressContext } from '../context/ProgressContext';
import { useAchievementCelebration } from '../hooks/useAchievementCelebration';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';
import NextAdventureCard from '../components/story/NextAdventureCard';

const { width: SCREEN_W } = Dimensions.get('window');

function SceneTimelineDot({ cena, done, index }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, friction: 5, tension: 80,
      delay: index * 60, useNativeDriver: true,
    }).start();
  }, []);

  const titulo = cena.titulo ?? `Cena ${cena.id}`;
  const emoji = cena.emojiCena ?? '⭐';

  return (
    <Animated.View style={[styles.dotRow, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.timelineDot, done ? styles.timelineDotDone : styles.timelineDotEmpty]}>
        <Text style={styles.timelineDotEmoji}>{done ? emoji : '○'}</Text>
      </View>
      <View style={styles.timelineDotLabel}>
        <Text style={[styles.timelineDotText, !done && styles.timelineDotTextEmpty]} numberOfLines={1}>
          {titulo}
        </Text>
        {done && <Text style={styles.timelineDotStar}>⭐ +1</Text>}
      </View>
    </Animated.View>
  );
}

function RewardCard({ emoji, title, desc, primary, done, onPress }) {
  return (
    <SoundButton
      style={[styles.rewardCard, primary && styles.rewardCardPrimary, done && styles.rewardCardDone]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.rewardEmojiCircle, { backgroundColor: primary ? '#7C3AED22' : pt.border + '60' }]}>
        <Text style={styles.rewardEmoji}>{emoji}</Text>
      </View>
      <View style={styles.rewardInfo}>
        <Text style={[styles.rewardTitle, primary && styles.rewardTitlePrimary]}>{title}</Text>
        <Text style={styles.rewardDesc}>{desc}</Text>
      </View>
      {done ? (
        <View style={styles.doneBadge}>
          <Text style={styles.doneBadgeText}>✓ Feito</Text>
        </View>
      ) : (
        <Text style={styles.rewardArrow}>›</Text>
      )}
    </SoundButton>
  );
}

export default function CongratsScreen({ route, navigation }) {
  const { story } = route.params;
  const insets = useSafeAreaInsets();
  const { progressByStory, postStoryStatusByStory } = useProgressContext();
  const progresso = progressByStory[story.id] ?? {};

  const { pendingAchievement, checkForNewAchievements, dismissAchievement } =
    useAchievementCelebration({ progressByStory, postStoryStatusByStory, source: 'CongratsScreen' });

  const completedScenesCount = Object.values(progresso).filter(Boolean).length;
  const scenesPercent = story.totalCenas > 0 ? completedScenesCount / story.totalCenas : 0;

  const availableStories = stories.filter(s => s.status === 'available' && (s.cenas?.length ?? 0) > 0);
  const currentIndex = availableStories.findIndex(s => s.id === story.id);
  const nextStory = currentIndex >= 0 ? (availableStories[currentIndex + 1] ?? null) : null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(starsAnim, { toValue: 1, duration: 1200, delay: 400, useNativeDriver: false }),
    ]).start();
    // Verificar novas conquistas após a tela de parabéns ser exibida
    const timer = setTimeout(() => { checkForNewAchievements(); }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const animatedProgress = starsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${scenesPercent * 100}%`],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.confettiLayer} pointerEvents="none">
        <Confetti visible={true} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.pageContent, {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        }]}>

          {/* ── HERO ── */}
          <LinearGradient colors={[colors.action, '#E8703A']} style={styles.heroHeader}>
            <Text style={styles.heroEmoji}>{story.emoji}</Text>
            <Text style={styles.heroTitle}>Parabéns!</Text>
            <Text style={styles.heroSub}>
              Você completou a aventura com carinho.
            </Text>
          </LinearGradient>

          {/* ── LIÇÃO DO CORAÇÃO ── */}
          <View style={styles.licaoBox}>
            <Text style={styles.licaoLabel}>Lição do Coração</Text>
            <Text style={styles.licao}>"{story.licaoCoracao}"</Text>
          </View>

          {/* ── STARS ── */}
          <View style={styles.starsCard}>
            <Text style={styles.starsCardTitle}>Suas estrelas</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: story.totalCenas }).map((_, i) => (
                <Text key={i} style={[styles.starIcon, i < completedScenesCount ? styles.starOn : styles.starOff]}>
                  ⭐
                </Text>
              ))}
            </View>
            <View style={styles.starsBarOuter}>
              <Animated.View style={[styles.starsBarInner, { width: animatedProgress }]} />
            </View>
            <Text style={styles.starsCount}>{completedScenesCount} / {story.totalCenas} estrelas</Text>
          </View>

          {/* ── TIMELINE ── */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Sua jornada</Text>
            <View style={styles.timelineList}>
              {story.cenas.map((cena, index) => (
                <SceneTimelineDot
                  key={cena.id}
                  cena={cena}
                  done={!!progresso[cena.id]}
                  index={index}
                />
              ))}
            </View>
          </View>

          {/* ── REWARD SECTION ── */}
          <View style={styles.rewardSection}>
            <Text style={styles.rewardSectionTitle}>Sua aventura virou um presente!</Text>
            <Text style={styles.rewardSectionSub}>
              Agora você pode rever sua história, responder o quiz e conversar com Lumi.
            </Text>
            <Text style={styles.rewardUnlocked}>Você desbloqueou:</Text>

            <RewardCard
              emoji="📖"
              title="Meu Livrinho da Fé"
              desc="Veja sua história com seus próprios desenhos."
              done={false}
              onPress={() => navigation.navigate('StoryBook', { story })}
            />
            <RewardCard
              emoji="⭐"
              title="Responder Quiz"
              desc="3 perguntas sobre a aventura. Ganhe +1 ⭐!"
              done={false}
              onPress={() => navigation.navigate('Quiz', { story })}
            />
            <RewardCard
              emoji="🐑"
              title="Conversar com Lumi"
              desc="Compartilhe o que ficou no seu coração."
              done={false}
              onPress={() => navigation.navigate('Reflection', { story })}
            />
          </View>

          {/* ── NEXT STORY ── */}
          {nextStory && (
            <>
              <Text style={styles.nextSectionTitle}>Continue a jornada</Text>
              <NextAdventureCard
                story={nextStory}
                onPress={() => navigation.navigate('StoryDetail', { story: nextStory })}
              />
            </>
          )}

          {/* ── SECONDARY ACTIONS ── */}
          <SoundButton
            style={styles.reviewBtn}
            onPress={() => navigation.navigate('StoryDetail', { story })}
            activeOpacity={0.85}
          >
            <Text style={styles.reviewBtnText}>▶ Rever a história</Text>
          </SoundButton>

          <SoundButton
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.homeBtnText}>🏠 Voltar ao início</Text>
          </SoundButton>

        </Animated.View>
      </ScrollView>

      {pendingAchievement && (
        <AchievementUnlockModal
          achievement={pendingAchievement}
          onDismiss={dismissAchievement}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },
  confettiLayer: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  container: { flex: 1 },
  pageContent: {},

  heroHeader: {
    paddingTop: 52, paddingBottom: 28,
    paddingHorizontal: 24, alignItems: 'center',
  },
  heroEmoji: { fontSize: 60, marginBottom: 10 },
  heroTitle: {
    fontFamily: 'FredokaOne', fontSize: 30, color: '#FFF',
    textAlign: 'center', marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4,
  },
  heroSub: {
    fontFamily: 'Nunito', fontSize: 14, color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },

  licaoBox: {
    backgroundColor: '#FFF8EC',
    borderRadius: radii.lg, padding: 18,
    marginHorizontal: 20, marginTop: 16,
    borderLeftWidth: 4, borderLeftColor: colors.accent,
    ...shadows.soft,
  },
  licaoLabel: {
    fontFamily: 'FredokaOne', fontSize: 11, color: colors.primary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  licao: {
    fontFamily: 'Nunito', fontSize: 16, color: colors.text,
    fontStyle: 'italic', lineHeight: 24, textAlign: 'center',
  },

  starsCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg, padding: 20,
    marginHorizontal: 20, marginTop: 16,
    ...shadows.soft, alignItems: 'center',
  },
  starsCardTitle: {
    fontFamily: 'FredokaOne', fontSize: 16, color: colors.text, marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 4, marginBottom: 14,
  },
  starIcon: { fontSize: 22 },
  starOn: { opacity: 1 },
  starOff: { opacity: 0.2 },
  starsBarOuter: {
    width: '100%', height: 10,
    backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden', marginBottom: 8,
  },
  starsBarInner: { height: '100%', backgroundColor: colors.accent, borderRadius: 5 },
  starsCount: { fontFamily: 'Nunito', fontSize: 13, color: colors.textLight },

  timelineCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg, padding: 20,
    marginHorizontal: 20, marginTop: 16,
    ...shadows.soft,
  },
  timelineTitle: {
    fontFamily: 'FredokaOne', fontSize: 16, color: colors.text, marginBottom: 14,
  },
  timelineList: { gap: 10 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineDot: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },
  timelineDotDone: { backgroundColor: colors.success },
  timelineDotEmpty: { backgroundColor: colors.border },
  timelineDotEmoji: { fontSize: 16 },
  timelineDotLabel: { flex: 1 },
  timelineDotText: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.text, fontWeight: '700',
  },
  timelineDotTextEmpty: { color: colors.textLight, fontWeight: 'normal' },
  timelineDotStar: { fontFamily: 'Nunito', fontSize: 11, color: colors.success },

  // Reward section
  rewardSection: {
    marginHorizontal: 16, marginTop: 24, marginBottom: 8,
  },
  rewardSectionTitle: {
    fontFamily: 'FredokaOne', fontSize: 20, color: pt.text,
    textAlign: 'center', marginBottom: 6,
  },
  rewardSectionSub: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    textAlign: 'center', lineHeight: 19, marginBottom: 16,
  },
  rewardUnlocked: {
    fontFamily: 'FredokaOne', fontSize: 14, color: '#7C3AED',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  rewardCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    padding: 14, marginBottom: 10, gap: 12,
    borderWidth: 1.5, borderColor: pt.border,
    ...shadows.soft,
  },
  rewardCardPrimary: {
    borderColor: '#7C3AED',
    borderWidth: 2,
    backgroundColor: '#FAF7FF',
  },
  rewardCardDone: { opacity: 0.7 },
  rewardEmojiCircle: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  rewardEmoji: { fontSize: 24 },
  rewardInfo: { flex: 1 },
  rewardTitle: {
    fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 2,
  },
  rewardTitlePrimary: { color: '#7C3AED' },
  rewardDesc: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 17,
  },
  rewardArrow: { fontFamily: 'FredokaOne', fontSize: 22, color: pt.muted },
  doneBadge: {
    backgroundColor: pt.greenSoft, borderRadius: radii.pill,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  doneBadgeText: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.freeText, fontWeight: '700',
  },

  nextSectionTitle: {
    fontFamily: 'FredokaOne', fontSize: 17, color: pt.text,
    marginHorizontal: 16, marginTop: 16, marginBottom: 8,
  },

  reviewBtn: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 20, marginTop: 12,
    borderRadius: radii.pill, paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    ...shadows.soft,
  },
  reviewBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: colors.primary },

  homeBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 20, marginTop: 12,
    borderRadius: radii.pill, paddingVertical: 16,
    alignItems: 'center',
    elevation: 4, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6,
  },
  homeBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
});
