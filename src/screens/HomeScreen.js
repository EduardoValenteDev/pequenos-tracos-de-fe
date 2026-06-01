import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Image,
  Animated, StyleSheet, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { stories } from '../data/stories';
import { images } from '../assets/images';
import SoundButton from '../components/SoundButton';
import { LumiGuideCard } from '../components/lumi';
import CenteredContent from '../components/layout/CenteredContent';
import NextAdventureCard from '../components/story/NextAdventureCard';
import { useFocusEffect } from '@react-navigation/native';
import { useProfile } from '../context/ProfileContext';
import { useProgressContext } from '../context/ProgressContext';
import { AVATARS, DEFAULT_AVATAR_ID } from '../data/avatars';
import { hasSavedDrawing } from '../services/drawingStorage';
import { canOpenMomentoLumi } from '../services/accessControl';
import { getHomePrimaryAction } from '../services/homeService';

/* ── Conteúdo rotativo ─────────────────────────────────────────── */
const DAILY_MESSAGES = [
  { emoji: '🌈', text: 'Deus cuida de você hoje e sempre!' },
  { emoji: '🎨', text: 'Pinte uma cena e ganhe estrelas!' },
  { emoji: '💛', text: 'Cada história ensina um pedacinho do amor de Deus.' },
  { emoji: '⭐', text: 'Seja forte e corajoso — Deus está com você!' },
  { emoji: '🕊️', text: 'Confie em Deus com todo o seu coração.' },
  { emoji: '🐑', text: 'O Senhor é meu pastor e nada me faltará!' },
  { emoji: '✨', text: 'Sua fé move montanhas!' },
];

const DAILY_CHALLENGES = [
  { emoji: '🌈', text: 'Colorir uma cena e ganhar uma estrela!' },
  { emoji: '📖', text: 'Ler uma história completa com a família.' },
  { emoji: '⭐', text: 'Completar duas cenas de uma aventura hoje.' },
  { emoji: '🎨', text: 'Usar 5 cores diferentes em um único desenho.' },
  { emoji: '💛', text: 'Descobrir a lição do coração de Davi.' },
  { emoji: '🙏', text: 'Orar por alguém depois de ler a história.' },
  { emoji: '🌟', text: 'Contar uma história bíblica para alguém especial.' },
];

const WORLDS = [
  {
    id: 'comece',
    label: 'Comece Aqui',
    emoji: '🌈',
    desc: 'Primeiros passos da fé.',
    gradient: ['#87CEEB', '#4FC3F7'],
    accessLabel: 'Grátis',
    accessType: 'free',
    available: true,
    navKey: 'comece',
  },
  {
    id: 'pequeninos',
    label: 'Pequeninos',
    emoji: '⭐',
    desc: 'Histórias para corações corajosos.',
    gradient: ['#FFD166', '#F4B400'],
    accessLabel: 'Especial da Família',
    accessType: 'premium',
    available: true,
    navKey: 'pequeninos',
  },
  {
    id: 'descobridores',
    label: 'Descobridores',
    emoji: '🔍',
    desc: 'Aventuras mais profundas da fé.',
    gradient: ['#4DB6AC', '#26A69A'],
    accessLabel: 'Especial da Família',
    accessType: 'premium',
    available: true,
    navKey: 'descobridores',
  },
  {
    id: 'jovens_da_fe',
    label: 'Jovens da Fé',
    emoji: '📖',
    desc: 'Crescer na fé com novos desafios.',
    gradient: ['#7E57C2', '#5C3D99'],
    accessLabel: 'Especial da Família',
    accessType: 'premium',
    available: true,
    navKey: 'jovens_da_fe',
  },
];

function dayIndex(listLength) {
  return Math.floor(Date.now() / 86400000) % listLength;
}

/* ── Sub-componentes ─────────────────────────────────────────────── */
function SectionTitle({ title, style }) {
  return <Text style={[styles.sectionTitle, style]}>{title}</Text>;
}

function WorldCard({ world, onPress }) {
  const isAvailable = world.available;
  const textColor = isAvailable ? '#FFF' : pt.text;
  const descColor = isAvailable ? 'rgba(255,255,255,0.88)' : pt.muted;

  return (
    <TouchableOpacity
      activeOpacity={isAvailable ? 0.85 : 1}
      onPress={isAvailable ? onPress : undefined}
      style={styles.worldCardWrapper}
    >
      <LinearGradient
        colors={world.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.worldCard}
      >
        <Text style={styles.worldEmoji}>{world.emoji}</Text>
        <View style={styles.worldInfo}>
          <Text style={[styles.worldLabel, { color: textColor }]}>{world.label}</Text>
          <Text style={[styles.worldDesc, { color: descColor }]} numberOfLines={1}>{world.desc}</Text>
        </View>
        <View style={[
          styles.worldAccessBadge,
          isAvailable
            ? (world.accessType === 'premium' ? styles.worldBadgePremium : styles.worldBadgeFree)
            : styles.worldBadgeSoon,
        ]}>
          <Text style={[styles.worldAccessText, !isAvailable && { color: pt.muted }]}>
            {world.accessLabel}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function DailyChallengeCard({ challenge }) {
  return (
    <LinearGradient
      colors={['#FFD166', '#FFC02D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.challengeCard}
    >
      <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
      <View style={styles.challengeInfo}>
        <Text style={styles.challengeLabel}>Missão de hoje</Text>
        <Text style={styles.challengeText}>{challenge.text}</Text>
      </View>
    </LinearGradient>
  );
}

function LastAchievementCard({ lastCompleted, totalStars }) {
  return (
    <View style={styles.achievementCard}>
      {lastCompleted ? (
        <>
          <Text style={styles.achievementEmoji}>🏆</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Aventura concluída!</Text>
            <Text style={styles.achievementSub}>{lastCompleted.titulo}</Text>
          </View>
        </>
      ) : totalStars > 0 ? (
        <>
          <Text style={styles.achievementEmoji}>⭐</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>
              {totalStars} estrela{totalStars !== 1 ? 's' : ''} alcançada{totalStars !== 1 ? 's' : ''}!
            </Text>
            <Text style={styles.achievementSub}>Continue para conquistar mais.</Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.achievementEmoji}>✨</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Sua primeira conquista te espera!</Text>
            <Text style={styles.achievementSub}>Complete uma cena para ganhar estrelas.</Text>
          </View>
        </>
      )}
    </View>
  );
}

function LumiMomentCard({ msg, onPress, canAccess }) {
  return (
    <SoundButton style={styles.lumiMomentCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.lumiMomentTop}>
        <Text style={styles.lumiMomentEmoji}>{msg.emoji}</Text>
        <View style={styles.lumiMomentHeaderInfo}>
          <Text style={styles.lumiMomentTitle}>Momento com Lumi</Text>
          {canAccess ? (
            <Text style={styles.lumiMomentStar}>+1 ⭐ hoje</Text>
          ) : (
            <View style={styles.lumiPremiumBadge}>
              <Text style={styles.lumiPremiumBadgeText}>Especial da Família</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.lumiMomentText} numberOfLines={2}>{msg.text}</Text>
      <View style={[styles.lumiMomentBtn, !canAccess && styles.lumiMomentBtnLocked]}>
        <Text style={[styles.lumiMomentBtnText, !canAccess && styles.lumiMomentBtnTextLocked]}>
          {canAccess ? 'Abrir momento →' : 'Pedir ao responsável →'}
        </Text>
      </View>
    </SoundButton>
  );
}

/* ── Tela principal ──────────────────────────────────────────────── */
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const { profile } = useProfile();
  const avatar =
    AVATARS.find(a => a.id === profile.avatarId) ??
    AVATARS.find(a => a.id === DEFAULT_AVATAR_ID);
  const greeting = profile.name ? `Olá, ${profile.name}!` : 'Olá!';

  const { progressByStory, progressSummary, postStoryStatusByStory, refreshProgress } = useProgressContext();

  function getProgressCount(storyId) {
    const p = progressByStory[storyId] || {};
    return Object.values(p).filter(Boolean).length;
  }

  const totalStars = progressSummary?.totalStars ?? 0;
  const maxStars = progressSummary?.maxTotalStars ?? 0;
  const starsPercent = maxStars > 0 ? totalStars / maxStars : 0;

  const primaryAction = useMemo(() => getHomePrimaryAction({
    progressByStory,
    progressSummary,
    stories,
    postStoryStatusByStory,
  }), [progressByStory, progressSummary, postStoryStatusByStory]);

  const primaryStory = useMemo(
    () => (primaryAction.storyId ? stories.find(s => s.id === primaryAction.storyId) ?? null : null),
    [primaryAction.storyId],
  );

  const [continueHasDrawing, setContinueHasDrawing] = useState(false);
  useEffect(() => {
    if (primaryAction.targetType !== 'continueStory' || !primaryStory) {
      setContinueHasDrawing(false);
      return;
    }
    const cnt = getProgressCount(primaryStory.id);
    const lastDone = primaryStory.cenas?.[cnt - 1];
    if (lastDone) hasSavedDrawing(primaryStory.id, lastDone.id).then(setContinueHasDrawing);
    else setContinueHasDrawing(false);
  }, [totalStars, primaryAction.storyId, primaryAction.targetType]);

  useFocusEffect(
    useCallback(() => {
      refreshProgress();
    }, []),
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const dailyMsg = DAILY_MESSAGES[dayIndex(DAILY_MESSAGES.length)];
  const dailyChallenge = DAILY_CHALLENGES[dayIndex(DAILY_CHALLENGES.length)];

  const playableStories = stories.filter(s => (s.totalCenas ?? 0) > 0);
  const completedStories = playableStories.filter(s => getProgressCount(s.id) >= s.totalCenas);
  const lastCompleted = completedStories[completedStories.length - 1] ?? null;

  /* ── Bloco "Continuar minha aventura" — 4 cenários via getHomePrimaryAction ── */
  const adventureBlock = (
    <>
      <SectionTitle title="Continuar minha aventura" style={{ marginTop: 0 }} />
      {primaryAction.targetType === 'openAdventures' && !primaryAction.storyId ? (
        <View style={styles.allDoneCard}>
          <Text style={styles.allDoneEmoji}>🏆</Text>
          <Text style={styles.allDoneTitle}>{primaryAction.title}</Text>
          <Text style={styles.allDoneSub}>{primaryAction.description}</Text>
        </View>
      ) : primaryAction.targetType === 'continueStory' && primaryStory ? (
        <View style={styles.continueCard}>
          <View style={styles.continueCardHeader}>
            {primaryStory.imagemCapa && images[primaryStory.imagemCapa] ? (
              <View style={styles.continueCardThumb}>
                <Image
                  source={images[primaryStory.imagemCapa]}
                  style={styles.continueCardThumbImg}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <Text style={styles.continueCardEmoji}>{primaryStory.emoji}</Text>
            )}
            <View style={styles.continueCardInfo}>
              <Text style={styles.continueCardLabel}>Continue sua aventura!</Text>
              <Text style={styles.continueCardTitle} numberOfLines={1}>{primaryStory.titulo}</Text>
              <Text style={styles.continueCardProgress}>
                {getProgressCount(primaryStory.id)}/{primaryStory.totalCenas} cenas
              </Text>
              {continueHasDrawing && (
                <Text style={styles.continueCardDrawing}>🎨 Seu desenho está salvo!</Text>
              )}
            </View>
          </View>
          <View style={styles.continueProgressBar}>
            <View
              style={[styles.continueProgressFill,
                { width: `${(getProgressCount(primaryStory.id) / primaryStory.totalCenas) * 100}%` }]}
            />
          </View>
          <SoundButton
            style={styles.continueBtn}
            onPress={() => navigation.navigate('StoryDetail', { story: primaryStory })}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>▶ Continuar aventura</Text>
          </SoundButton>
        </View>
      ) : primaryAction.targetType === 'pendingRewards' && primaryStory ? (
        <SoundButton
          style={styles.pendingRewardsCard}
          onPress={() => navigation.navigate('PostStoryHub', { story: primaryStory })}
          activeOpacity={0.85}
        >
          <Text style={styles.pendingRewardsTitle}>🎁 {primaryAction.title}</Text>
          <Text style={styles.pendingRewardsDesc} numberOfLines={2}>
            {primaryAction.description}
          </Text>
          <Text style={styles.pendingRewardsBtn}>{primaryAction.buttonLabel}</Text>
        </SoundButton>
      ) : primaryAction.targetType === 'openAdventures' && primaryStory ? (
        <NextAdventureCard
          story={primaryStory}
          onPress={() => navigation.navigate('StoryDetail', { story: primaryStory })}
        />
      ) : (
        <View style={styles.startInviteCard}>
          <Text style={styles.startInviteEmoji}>⛵</Text>
          <View style={styles.startInviteInfo}>
            <Text style={styles.startInviteTitle}>{primaryAction.title}</Text>
            <Text style={styles.startInviteSub}>{primaryAction.description}</Text>
          </View>
          <SoundButton
            style={styles.startInviteBtn}
            onPress={() => primaryStory && navigation.navigate('StoryDetail', { story: primaryStory })}
            activeOpacity={0.85}
          >
            <Text style={styles.startInviteBtnText}>{primaryAction.buttonLabel}</Text>
          </SoundButton>
        </View>
      )}
    </>
  );

  const worldsBlock = (
    <>
      <SectionTitle title="Escolha seu caminho" style={{ marginTop: 16 }} />
      {WORLDS.map(world => (
        <WorldCard
          key={world.id}
          world={world}
          onPress={world.available
            ? () => navigation.navigate('Stories', { nivel: world.navKey })
            : undefined}
        />
      ))}
    </>
  );

  const challengeAchievementBlock = (
    <>
      <SectionTitle title="Desafio do Dia" style={{ marginTop: 8 }} />
      <DailyChallengeCard challenge={dailyChallenge} />
      <SectionTitle title="Última Conquista" style={{ marginTop: 8 }} />
      <LastAchievementCard lastCompleted={lastCompleted} totalStars={totalStars} />
    </>
  );

  const canLumi = canOpenMomentoLumi();
  const lumiMomentBlock = (
    <LumiMomentCard
      msg={dailyMsg}
      canAccess={canLumi}
      onPress={canLumi
        ? () => navigation.navigate('LumiMoment')
        : () => navigation.navigate('ParentArea')
      }
    />
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 56 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* ── HEADER ── */}
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={[styles.header, { paddingTop: Math.max(insets.top, 48) }]}
        >
          <View style={styles.headerTop}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{avatar?.emoji ?? '⭐'}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerGreeting}>{greeting}</Text>
              <Text style={styles.starsLabel}>
                ⭐ {totalStars === 1 ? '1 estrela alcançada' : `${totalStars} estrelas alcançadas`}
              </Text>
              <View style={styles.progressBarOuter}>
                <View style={[styles.progressBarInner, { width: `${starsPercent * 100}%` }]} />
              </View>
            </View>
            <View style={styles.lumiDecor}>
              <Text style={styles.lumiDecorEmoji}>🐑</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── COLUNA ÚNICA CENTRALIZADA ── */}
        <CenteredContent>
          {adventureBlock}
          {worldsBlock}
          {challengeAchievementBlock}
          <LumiGuideCard context="home" style={styles.lumiCard} />
          {lumiMomentBlock}
        </CenteredContent>

      </Animated.View>
    </ScrollView>
  );
}

/* ── Estilos ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 28 },
  headerInfo: { flex: 1 },
  headerGreeting: { fontFamily: 'FredokaOne', fontSize: 20, color: '#FFF', marginBottom: 4 },
  starsLabel: { fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 6 },
  progressBarOuter: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden',
  },
  progressBarInner: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  lumiDecor: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 10, flexShrink: 0,
  },
  lumiDecorEmoji: { fontSize: 28 },

  sectionTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text,
    marginHorizontal: 16, marginBottom: 12, marginTop: 4,
  },

  // All done
  allDoneCard: {
    backgroundColor: pt.greenSoft,
    borderRadius: radii.lg, marginHorizontal: 16, marginBottom: 14,
    padding: 20, alignItems: 'center',
    borderLeftWidth: 4, borderLeftColor: pt.green, ...shadows.soft,
  },
  allDoneEmoji: { fontSize: 48, marginBottom: 8 },
  allDoneTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center', marginBottom: 4,
  },
  allDoneSub: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center' },

  // Continue card
  continueCard: {
    backgroundColor: '#FFF',
    borderRadius: radii.lg, marginHorizontal: 16, marginBottom: 14,
    padding: 16, ...shadows.card,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  continueCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  continueCardEmoji: { fontSize: 32, marginRight: 12, marginTop: 2 },
  continueCardThumb: {
    width: 72, height: 72, borderRadius: 14,
    overflow: 'hidden', marginRight: 14, flexShrink: 0, ...shadows.soft,
  },
  continueCardThumbImg: { width: '100%', height: '100%' },
  continueCardInfo: { flex: 1 },
  continueCardLabel: {
    fontFamily: 'Nunito', fontSize: 11, color: colors.primary,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2,
  },
  continueCardTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text, marginBottom: 2 },
  continueCardProgress: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted },
  continueCardDrawing: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.orange, marginTop: 3, fontWeight: '700',
  },
  continueProgressBar: {
    height: 6, backgroundColor: pt.border, borderRadius: 3, overflow: 'hidden', marginBottom: 14,
  },
  continueProgressFill: { height: '100%', backgroundColor: pt.green, borderRadius: 3 },
  continueBtn: {
    backgroundColor: colors.action, borderRadius: radii.pill,
    paddingVertical: 12, alignItems: 'center',
    elevation: 3, shadowColor: colors.action,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4,
  },
  continueBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },

  // Start invite
  startInviteCard: {
    backgroundColor: pt.cream,
    borderRadius: radii.lg, marginHorizontal: 16, marginBottom: 14,
    padding: 16, borderLeftWidth: 4, borderLeftColor: pt.gold, ...shadows.soft,
  },
  startInviteEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  startInviteInfo: { marginBottom: 14 },
  startInviteTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center', marginBottom: 4,
  },
  startInviteSub: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', lineHeight: 19,
  },
  startInviteBtn: {
    backgroundColor: pt.gold, borderRadius: radii.pill, paddingVertical: 12, alignItems: 'center',
    elevation: 3, shadowColor: pt.gold,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4,
  },
  startInviteBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },

  // Mundos / Escolha seu caminho
  worldCardWrapper: { marginHorizontal: 16, marginBottom: 10 },
  worldCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radii.lg, padding: 16, ...shadows.card,
  },
  worldEmoji: { fontSize: 32, marginRight: 14 },
  worldInfo: { flex: 1 },
  worldLabel: { fontFamily: 'FredokaOne', fontSize: 17, marginBottom: 2 },
  worldDesc: { fontFamily: 'Nunito', fontSize: 12, lineHeight: 17 },
  worldAccessBadge: { borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  worldBadgeFree: { backgroundColor: 'rgba(255,255,255,0.25)' },
  worldBadgePremium: { backgroundColor: 'rgba(0,0,0,0.18)' },
  worldBadgeSoon: { backgroundColor: pt.cream },
  worldAccessText: { fontFamily: 'Nunito', fontSize: 12, color: '#FFF', fontWeight: '700' },

  // Desafio do Dia
  challengeCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: radii.lg, padding: 16,
    elevation: 4,
    shadowColor: '#FFD166',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 6,
  },
  challengeEmoji: { fontSize: 32, marginRight: 14 },
  challengeInfo: { flex: 1 },
  challengeLabel: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.text,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3,
  },
  challengeText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, lineHeight: 21 },

  // Última Conquista
  achievementCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: pt.lilac,
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: radii.lg, padding: 16,
    ...shadows.soft, borderLeftWidth: 4, borderLeftColor: pt.purple,
  },
  achievementEmoji: { fontSize: 32, marginRight: 14 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 2 },
  achievementSub: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 17 },

  pendingRewardsCard: {
    backgroundColor: '#FAF7FF',
    borderRadius: radii.lg,
    marginHorizontal: 16, marginBottom: 14,
    padding: 16,
    borderWidth: 2, borderColor: '#A78BFA',
    ...shadows.soft,
  },
  pendingRewardsTitle: {
    fontFamily: 'FredokaOne', fontSize: 15, color: '#7C3AED', marginBottom: 4,
  },
  pendingRewardsDesc: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 18, marginBottom: 10,
  },
  pendingRewardsBtn: {
    fontFamily: 'FredokaOne', fontSize: 14, color: '#7C3AED',
  },

  lumiCard: { marginHorizontal: 16, marginTop: 8, marginBottom: 14 },

  // Momento com Lumi
  lumiMomentCard: {
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    marginHorizontal: 16, marginBottom: 14,
    padding: 16,
    borderLeftWidth: 4, borderLeftColor: '#A78BFA',
    ...shadows.card,
  },
  lumiMomentTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  lumiMomentEmoji: { fontSize: 28, marginRight: 10 },
  lumiMomentHeaderInfo: { flex: 1 },
  lumiMomentTitle: {
    fontFamily: 'FredokaOne', fontSize: 15, color: pt.text,
  },
  lumiMomentStar: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.gold, fontWeight: '700',
  },
  lumiMomentText: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    lineHeight: 18, marginBottom: 12,
  },
  lumiMomentBtn: {
    backgroundColor: '#A78BFA',
    borderRadius: radii.pill, paddingVertical: 10, alignItems: 'center',
  },
  lumiMomentBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
  lumiMomentBtnLocked: {
    backgroundColor: pt.border,
  },
  lumiMomentBtnTextLocked: { color: pt.textSoft },
  lumiPremiumBadge: {
    backgroundColor: '#FFF8E1',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#F4B400',
  },
  lumiPremiumBadgeText: {
    fontFamily: 'Nunito', fontSize: 10, color: '#B8860B', fontWeight: '700',
  },
});
