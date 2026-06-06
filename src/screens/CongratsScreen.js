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
import BeniAvatar from '../components/beni/BeniAvatar';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import { getNextAdventureRecommendation } from '../services/nextAdventureService';
import StoryCoverImage from '../components/story/StoryCoverImage';

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

  // Recomendação inteligente de continuidade (nunca recomenda história concluída)
  const recommendation = getNextAdventureRecommendation({
    currentStoryId: story.id,
    stories,
    progressByStory,
  });

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
            <Text style={styles.heroTitle}>Aventura concluída!</Text>
            <Text style={styles.heroSub}>
              {getBeniGuideMessage('storyCompleted')}
            </Text>
            <BeniAvatar variant="celebrating" size="medium" style={styles.heroBeni} />
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
              Agora você pode rever sua história, responder o quiz e conversar com Beni.
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
              emoji="✨"
              title="Guardar no coração"
              desc="Compartilhe o que ficou no seu coração."
              done={false}
              onPress={() => navigation.navigate('Reflection', { story })}
            />
          </View>

          {/* ── CONTINUIDADE INTELIGENTE ── */}
          {recommendation.state === 'A' && recommendation.story && (
            <>
              <Text style={styles.nextSectionTitle}>Continue a jornada</Text>
              <NextAdventureCard
                story={recommendation.story}
                label="Próxima aventura"
                buttonLabel={recommendation.inProgress ? 'Continuar →' : 'Começar →'}
                onPress={() => navigation.navigate('StoryDetail', { story: recommendation.story })}
              />
            </>
          )}

          {recommendation.state === 'B' && recommendation.story && (
            <>
              <Text style={styles.nextSectionTitle}>Novo caminho esperando</Text>
              <View style={styles.blockedCard}>
                <View style={styles.blockedCoverWrap}>
                  <StoryCoverImage story={recommendation.story} rounded={false} />
                  <View style={styles.blockedTint} pointerEvents="none" />
                  <View style={styles.blockedBadge}>
                    <Text style={styles.blockedBadgeText}>🔒 Com responsável</Text>
                  </View>
                </View>
                <View style={styles.blockedInfo}>
                  <Text style={styles.blockedTitle}>Novo caminho para descobrir</Text>
                  <Text style={styles.blockedSub}>
                    {getBeniGuideMessage('premiumBlocked')}
                  </Text>
                  <SoundButton
                    style={styles.blockedBtn}
                    onPress={() => navigation.navigate('ParentArea')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.blockedBtnText}>Chamar responsável</Text>
                  </SoundButton>
                </View>
              </View>
            </>
          )}

          {recommendation.state === 'C' && (
            <View style={styles.allDoneCard}>
              <Text style={styles.allDoneEmoji}>🌟</Text>
              <Text style={styles.allDoneTitle}>Que jornada linda!</Text>
              <Text style={styles.allDoneSub}>
                Você pode rever suas aventuras quando quiser.
              </Text>
              <SoundButton
                style={styles.allDoneBtn}
                onPress={() => navigation.navigate('Aventuras')}
                activeOpacity={0.85}
              >
                <Text style={styles.allDoneBtnText}>Rever histórias</Text>
              </SoundButton>
            </View>
          )}

          {/* ── SECONDARY ACTIONS ── */}
          <SoundButton
            style={styles.reviewBtn}
            onPress={() => navigation.navigate('StoryDetail', { story })}
            activeOpacity={0.85}
          >
            <Text style={styles.reviewBtnText}>▶ Rever aventura</Text>
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
  heroBeni: { marginTop: 12 },
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

  // Estado B — novo caminho bloqueado
  blockedCard: {
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    marginHorizontal: 16, marginBottom: 14,
    overflow: 'hidden',
    ...shadows.card,
    borderLeftWidth: 4, borderLeftColor: '#7C3AED',
  },
  blockedCoverWrap: { position: 'relative' },
  blockedTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124,58,237,0.16)',
  },
  blockedBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4,
  },
  blockedBadgeText: { fontFamily: 'Nunito', fontSize: 11, color: '#7C3AED', fontWeight: '700' },
  blockedInfo: { padding: 14 },
  blockedTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginBottom: 4 },
  blockedSub: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19, marginBottom: 12,
  },
  blockedBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: radii.pill, paddingVertical: 13, alignItems: 'center',
    elevation: 3, shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  blockedBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },

  // Estado C — todas concluídas
  allDoneCard: {
    backgroundColor: pt.greenSoft,
    borderRadius: radii.lg, marginHorizontal: 16, marginBottom: 14,
    padding: 20, alignItems: 'center',
    borderLeftWidth: 4, borderLeftColor: pt.green, ...shadows.soft,
  },
  allDoneEmoji: { fontSize: 40, marginBottom: 8 },
  allDoneTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center', marginBottom: 4,
  },
  allDoneSub: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', marginBottom: 14,
  },
  allDoneBtn: {
    backgroundColor: pt.green,
    borderRadius: radii.pill, paddingVertical: 12, paddingHorizontal: 28, alignItems: 'center',
  },
  allDoneBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },

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
