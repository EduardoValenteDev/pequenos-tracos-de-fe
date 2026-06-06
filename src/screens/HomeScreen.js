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
import CenteredContent from '../components/layout/CenteredContent';
import { BeniAvatar } from '../components/beni';
import { useFocusEffect } from '@react-navigation/native';
import { useProfile } from '../context/ProfileContext';
import { useProgressContext } from '../context/ProgressContext';
import { AVATARS, DEFAULT_AVATAR_ID } from '../data/avatars';
import { hasSavedDrawing } from '../services/drawingStorage';
import { canOpenMomentoLumi } from '../services/accessControl';
import { getHomePrimaryAction } from '../services/homeService';
import { getBeniGuideMessage } from '../data/beniGuideMessages';

/* ── Conteúdo rotativo ─────────────────────────────────────────── */
const DAILY_MESSAGES = [
  { emoji: '🌈', text: 'Deus cuida de você hoje e sempre!' },
  { emoji: '🎨', text: 'Pinte uma cena e ganhe estrelas!' },
  { emoji: '💛', text: 'Cada história ensina um pedacinho do amor de Deus.' },
  { emoji: '⭐', text: 'Seja forte e corajoso, Deus está com você!' },
  { emoji: '🕊️', text: 'Confie em Deus com todo o seu coração.' },
  { emoji: '✨', text: 'O Senhor é meu pastor e nada me faltará!' },
  { emoji: '✨', text: 'Sua fé move montanhas!' },
];

const DAILY_CHALLENGES = [
  { emoji: '🌈', text: 'Colorir uma cena e ganhar uma estrela!', short: 'colorir uma cena' },
  { emoji: '📖', text: 'Ler uma história completa com a família.', short: 'ler com a família' },
  { emoji: '⭐', text: 'Completar duas cenas de uma aventura hoje.', short: 'completar duas cenas' },
  { emoji: '🎨', text: 'Usar 5 cores diferentes em um único desenho.', short: 'usar várias cores' },
  { emoji: '💛', text: 'Descobrir a lição do coração de Davi.', short: 'fazer uma boa ação' },
  { emoji: '🙏', text: 'Orar por alguém depois de ler a história.', short: 'orar por alguém' },
  { emoji: '🌟', text: 'Contar uma história bíblica para alguém especial.', short: 'contar uma história' },
];

const WORLDS = [
  {
    id: 'comece',
    label: 'Comece Aqui',
    desc: 'Primeiros passos',
    emoji: '🌈',
    gradient: ['#87CEEB', '#4FC3F7'],
    accessLabel: 'Grátis',
    accessType: 'free',
    available: true,
    navKey: 'comece',
  },
  {
    id: 'pequeninos',
    label: 'Pequeninos',
    desc: 'Histórias simples',
    emoji: '⭐',
    gradient: ['#FFD166', '#F4B400'],
    accessLabel: 'Especial da Família',
    accessType: 'premium',
    available: true,
    navKey: 'pequeninos',
  },
  {
    id: 'descobridores',
    label: 'Descobridores',
    desc: 'Novas descobertas',
    emoji: '🔍',
    gradient: ['#4DB6AC', '#26A69A'],
    accessLabel: 'Especial da Família',
    accessType: 'premium',
    available: true,
    navKey: 'descobridores',
  },
  {
    id: 'jovens_da_fe',
    label: 'Jovens da Fé',
    desc: 'Grandes desafios',
    emoji: '📖',
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

/* ═══════════════════════════════════════════════════════════════════
   BeniHeroScene — cena de entrada do mundo
═══════════════════════════════════════════════════════════════════ */
function BeniHeroScene({ greeting, totalStars, avatar, insets, bubbleMessage }) {
  return (
    <View style={heroS.wrapper}>
      <LinearGradient
        colors={['#FFFBEF', '#FEE9A0', '#BAE6FD']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={[heroS.sky, { paddingTop: Math.max(insets.top, 20) + 4 }]}
      >
        {/* Nuvens decorativas */}
        <View style={heroS.cloud1} />
        <View style={heroS.cloud2} />
        <View style={heroS.cloud3} />

        {/* Saudação + Beni (compacto) */}
        <View style={heroS.contentRow}>
          <View style={heroS.childCircle}>
            <Text style={heroS.childEmoji}>{avatar?.emoji ?? '⭐'}</Text>
          </View>
          <View style={heroS.greetingCol}>
            <Text style={heroS.greetingText} numberOfLines={1}>{greeting}</Text>
            <View style={heroS.starsPill}>
              <Text style={heroS.starsText}>
                ⭐ {totalStars}{' '}
                {totalStars === 1 ? 'estrelinha' : 'estrelinhas'}
              </Text>
            </View>
          </View>
          <View style={heroS.beniCol}>
            <BeniAvatar variant="pointing" size="medium" />
          </View>
        </View>

        {/* Fala única do Beni — vinda do catálogo central, aponta para o portal */}
        <View style={heroS.bubbleWrap}>
          <Text style={heroS.bubbleText}>
            {bubbleMessage}
          </Text>
          {/* Pontinha apontando para baixo */}
          <View style={heroS.bubbleTipDown} />
        </View>
      </LinearGradient>

      {/* Colinas de transição */}
      <View style={heroS.hillsRow}>
        <View style={heroS.hillBack} />
        <View style={heroS.hillFront} />
      </View>
    </View>
  );
}

const heroS = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  sky: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  cloud1: {
    position: 'absolute', top: 18, right: 10,
    width: 88, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  cloud2: {
    position: 'absolute', top: 34, right: 64,
    width: 54, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  cloud3: {
    position: 'absolute', bottom: 44, left: -6,
    width: 66, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  contentRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginTop: 4, marginBottom: 10,
  },
  greetingCol: { flex: 1 },
  childCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.65)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
    flexShrink: 0, elevation: 2,
    shadowColor: '#F4B400',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3,
  },
  childEmoji: { fontSize: 24 },
  greetingText: {
    fontFamily: 'FredokaOne', fontSize: 20, color: '#3A2A1E', marginBottom: 5,
  },
  starsPill: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
    alignSelf: 'flex-start', borderWidth: 1,
    borderColor: 'rgba(244,180,0,0.45)', elevation: 1,
  },
  starsText: {
    fontFamily: 'Nunito', fontSize: 12, color: '#7A5800', fontWeight: '700',
  },
  beniCol: { alignItems: 'center', flexShrink: 0 },
  bubbleWrap: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: 'rgba(108,158,255,0.35)',
    alignItems: 'center',
  },
  bubbleText: {
    fontFamily: 'Nunito', fontSize: 13, color: '#3A2A1E',
    fontWeight: '700', lineHeight: 18, textAlign: 'center',
  },
  bubbleTipDown: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderLeftColor: 'transparent',
    borderRightWidth: 6, borderRightColor: 'transparent',
    borderTopWidth: 8, borderTopColor: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },
  hillsRow: { height: 18, overflow: 'hidden', marginTop: -1 },
  hillBack: {
    position: 'absolute', bottom: 0, left: -20, right: -20, height: 36,
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    backgroundColor: '#D4F0B0', opacity: 0.35,
  },
  hillFront: {
    position: 'absolute', bottom: 0, left: -20, right: -20, height: 24,
    borderTopLeftRadius: 34, borderTopRightRadius: 34,
    backgroundColor: pt.background,
  },
});

/* ── Título de seção ─────────────────────────────────────────────── */
function SectionTitle({ title, style }) {
  return <Text style={[styles.sectionTitle, style]}>{title}</Text>;
}

/* ═══════════════════════════════════════════════════════════════════
   HojeComBeni — painel compacto: capa + botão principal + chips
═══════════════════════════════════════════════════════════════════ */
function HojeComBeni({
  primaryAction,
  primaryStory,
  getProgressCount,
  continueHasDrawing,
  onAdventure,
  adventureLabel,
  onCriar,
  mission,
}) {
  const allDone = primaryAction.targetType === 'openAdventures' && !primaryAction.storyId;
  const hasThumb = primaryStory?.imagemCapa && images[primaryStory.imagemCapa];
  const progCount = primaryStory ? getProgressCount(primaryStory.id) : 0;
  const progTotal = primaryStory?.totalCenas ?? 1;
  const progPct = Math.min(progCount / progTotal, 1) * 100;

  return (
    <View style={styles.hojePanel}>
      {/* Cabeçalho leve */}
      <View style={styles.hojeHeaderRow}>
        <Text style={styles.hojeTitle}>Hoje com Beni</Text>
        <BeniAvatar variant="pointing" size="small" />
      </View>

      {allDone ? (
        <View style={styles.allDoneInline}>
          <Text style={styles.allDoneEmoji}>🏆</Text>
          <Text style={styles.allDoneTitle}>{primaryAction.title}</Text>
          <Text style={styles.allDoneSub}>{primaryAction.description}</Text>
        </View>
      ) : (
        <>
          {/* Capa 16:9 — centro do painel */}
          {hasThumb ? (
            <View style={styles.hojeCover}>
              <Image
                source={images[primaryStory.imagemCapa]}
                style={styles.hojeCoverImg}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={[styles.hojeCover, styles.hojeCoverFallback]}>
              <Text style={styles.hojeCoverEmoji}>{primaryStory?.emoji ?? '⛵'}</Text>
            </View>
          )}

          {primaryAction.targetType === 'pendingRewards' && (
            <Text style={styles.hojePendingLabel}>🎁 Presentes esperando</Text>
          )}
          <Text style={styles.hojeStoryTitle} numberOfLines={1}>
            {primaryStory?.titulo ?? primaryAction.title}
          </Text>

          {primaryAction.targetType === 'continueStory' && primaryStory && (
            <View style={styles.hojeBar}>
              <View style={[styles.hojeBarFill, { width: `${progPct}%` }]} />
            </View>
          )}

          {/* Botão principal — visível na primeira dobra */}
          <SoundButton style={styles.hojeBtn} onPress={onAdventure} activeOpacity={0.85}>
            <LinearGradient
              colors={['#FF8A5B', '#F4651F']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.hojeBtnGradient}
            >
              <Text style={styles.hojeBtnText}>{adventureLabel}</Text>
            </LinearGradient>
          </SoundButton>

          {/* Chips secundários compactos — não viram checklist */}
          <View style={styles.hojeChips}>
            <SoundButton style={styles.chipCriar} onPress={onCriar} activeOpacity={0.85}>
              <Text style={styles.chipText} numberOfLines={1}>🎨 Criar com Beni</Text>
              <Text style={styles.chipArrow}>→</Text>
            </SoundButton>
            <View style={styles.chipMissao}>
              <Text style={styles.chipMissaoText} numberOfLines={2}>
                {mission.emoji} Missão: {mission.short ?? mission.text}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

/* ── Mini mundo de caminho (grid 2×2) ────────────────────────────── */
function WorldCardCompact({ world, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={world.available ? 0.82 : 1}
      onPress={world.available ? onPress : undefined}
      style={styles.worldCompactWrapper}
    >
      <LinearGradient
        colors={world.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.worldCompact}
      >
        {/* Brilho no canto superior */}
        <View style={styles.worldGlow} />
        <Text style={styles.worldCompactEmoji}>{world.emoji}</Text>
        <Text style={styles.worldCompactLabel} numberOfLines={1}>{world.label}</Text>
        <Text style={styles.worldCompactDesc} numberOfLines={1}>{world.desc}</Text>
        <View style={world.accessType === 'free' ? styles.worldBadgeFree : styles.worldBadgePremium}>
          <Text style={world.accessType === 'free' ? styles.worldBadgeFreeText : styles.worldBadgePremiumText}>
            {world.accessType === 'free' ? world.accessLabel : 'Família'}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* ── Missão de hoje ──────────────────────────────────────────────── */
function MissionCard({ challenge }) {
  return (
    <View style={styles.missionCard}>
      <Text style={styles.missionEmoji}>{challenge.emoji}</Text>
      <Text style={styles.missionText}>{challenge.text}</Text>
    </View>
  );
}

/* ── Última conquista ─────────────────────────────────────────────── */
function LastAchievementCard({ lastCompleted, totalStars }) {
  return (
    <View style={styles.achievementCard}>
      {lastCompleted ? (
        <>
          <Text style={styles.achievementEmoji}>🏆</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Aventura concluída!</Text>
            <Text style={styles.achievementSub} numberOfLines={1}>{lastCompleted.titulo}</Text>
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
            <Text style={styles.achievementTitle}>Sua próxima conquista está chegando.</Text>
            <Text style={styles.achievementSub}>Complete uma cena para ganhar estrelas.</Text>
          </View>
        </>
      )}
    </View>
  );
}

/* ── Momento com Beni ────────────────────────────────────────────── */
function BeniMomentCard({ msg, onPress, canAccess }) {
  return (
    <SoundButton style={styles.momentCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.momentRow}>
        <Text style={styles.momentEmoji}>{msg.emoji}</Text>
        <View style={styles.momentInfo}>
          <Text style={styles.momentTitle}>Momento com Beni</Text>
          <Text style={styles.momentVerse} numberOfLines={2}>{msg.text}</Text>
        </View>
      </View>
      <Text style={[styles.momentCta, !canAccess && styles.momentCtaLocked]}>
        {canAccess ? 'Abrir momento →' : 'Pedir ao responsável →'}
      </Text>
    </SoundButton>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Tela principal
═══════════════════════════════════════════════════════════════════ */
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

  function handleAdventurePress() {
    if (!primaryStory) {
      navigation.navigate('Aventuras');
      return;
    }
    if (primaryAction.targetType === 'pendingRewards') {
      navigation.navigate('PostStoryHub', { story: primaryStory });
      return;
    }
    navigation.navigate('StoryDetail', { story: primaryStory });
  }

  function getAdventureButtonLabel() {
    switch (primaryAction.targetType) {
      case 'startFirstStory': return 'Entrar na aventura →';
      case 'continueStory':   return 'Continuar aventura →';
      case 'pendingRewards':  return 'Abrir presentes →';
      case 'openAdventures':
        return primaryAction.storyId ? 'Entrar na aventura →' : 'Rever aventura →';
      default: return 'Ver aventuras →';
    }
  }

  /* ── Hoje com Beni — painel compacto (capa + botão + chips) ── */
  const jornadaBlock = (
    <HojeComBeni
      primaryAction={primaryAction}
      primaryStory={primaryStory}
      getProgressCount={getProgressCount}
      continueHasDrawing={continueHasDrawing}
      onAdventure={handleAdventurePress}
      adventureLabel={getAdventureButtonLabel()}
      onCriar={() => navigation.navigate('Ateliê')}
      mission={dailyChallenge}
    />
  );

  /* ── Mundos para explorar (secundário) ── */
  const worldsBlock = (
    <>
      <SectionTitle title="Mundos para explorar" style={{ marginTop: 20 }} />
      <Text style={styles.worldsSub}>Beni preparou outros caminhos para você.</Text>
      <View style={styles.worldsGrid}>
        {WORLDS.map(world => (
          <WorldCardCompact
            key={world.id}
            world={world}
            onPress={() => navigation.navigate('Stories', { nivel: world.navKey })}
          />
        ))}
      </View>
    </>
  );

  /* ── Última conquista (compacta, abaixo) ── */
  const achievementBlock = (
    <>
      <SectionTitle title="Última conquista" style={{ marginTop: 18 }} />
      <LastAchievementCard lastCompleted={lastCompleted} totalStars={totalStars} />
    </>
  );

  /* ── Momento com Beni ── */
  const canLumi = canOpenMomentoLumi();
  const momentBlock = (
    <BeniMomentCard
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
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* 1. Cena de entrada */}
        <BeniHeroScene
          greeting={greeting}
          totalStars={totalStars}
          avatar={avatar}
          insets={insets}
          bubbleMessage={getBeniGuideMessage('home', {
            hasProgress:
              primaryAction.targetType === 'continueStory' ||
              primaryAction.targetType === 'pendingRewards',
          })}
        />

        <CenteredContent>
          {jornadaBlock}
          {worldsBlock}
          {achievementBlock}
          {momentBlock}
        </CenteredContent>
      </Animated.View>
    </ScrollView>
  );
}

/* ── Estilos ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },

  sectionTitle: {
    fontFamily: 'FredokaOne', fontSize: 16, color: pt.text,
    marginHorizontal: 16, marginBottom: 8, marginTop: 4,
  },

  // ── Hoje com Beni (painel compacto) ──
  hojePanel: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 6,
    backgroundColor: '#FFFDF7',
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: '#F0E2C6',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    ...shadows.card,
  },
  hojeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  hojeTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text },

  hojeCover: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#F0E8FF',
  },
  hojeCoverImg: { width: '100%', height: '100%' },
  hojeCoverFallback: { justifyContent: 'center', alignItems: 'center' },
  hojeCoverEmoji: { fontSize: 48 },
  hojePendingLabel: {
    fontFamily: 'Nunito', fontSize: 11, color: '#7C3AED',
    fontWeight: '700', marginBottom: 2,
  },
  hojeStoryTitle: {
    fontFamily: 'FredokaOne', fontSize: 16, color: pt.text,
    lineHeight: 21, marginBottom: 6,
  },
  hojeBar: {
    height: 5, backgroundColor: pt.border, borderRadius: 3,
    overflow: 'hidden', marginBottom: 8,
  },
  hojeBarFill: { height: '100%', backgroundColor: pt.green, borderRadius: 3 },
  hojeBtn: {
    borderRadius: radii.pill, overflow: 'hidden',
    elevation: 3, shadowColor: '#F4651F',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  hojeBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  hojeBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },

  // Chips secundários
  hojeChips: { marginTop: 10, gap: 8 },
  chipCriar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: pt.lilac,
    borderRadius: radii.pill,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: '#D7C8F5',
  },
  chipText: { fontFamily: 'Nunito', fontSize: 13, color: pt.text, fontWeight: '700', flex: 1 },
  chipArrow: { fontFamily: 'FredokaOne', fontSize: 14, color: '#8E44AD', marginLeft: 8 },
  chipMissao: {
    backgroundColor: pt.goldSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: pt.gold + '55',
  },
  chipMissaoText: { fontFamily: 'Nunito', fontSize: 13, color: '#7A5800', fontWeight: '700' },

  allDoneInline: { alignItems: 'center', paddingVertical: 8 },

  // ── Tudo concluído ──
  allDoneCard: {
    backgroundColor: pt.greenSoft,
    borderRadius: radii.lg, marginHorizontal: 16, marginBottom: 14,
    padding: 20, alignItems: 'center',
    borderLeftWidth: 4, borderLeftColor: pt.green, ...shadows.soft,
  },
  allDoneEmoji: { fontSize: 44, marginBottom: 8 },
  allDoneTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text,
    textAlign: 'center', marginBottom: 4,
  },
  allDoneSub: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center',
  },

  // ── Portal da aventura ──
  portalCard: {
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: radii.xl, overflow: 'hidden',
    ...shadows.card, backgroundColor: '#FFF',
  },
  portalArch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  portalOpenLabel: {
    fontFamily: 'Nunito', fontSize: 11,
    color: '#5B21B6', fontWeight: '700',
    letterSpacing: 0.3,
  },
  portalBody: {
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14,
  },
  portalCoverWindow: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F0E8FF',
  },
  portalCoverImg: { width: '100%', height: '100%' },
  portalCoverFallback: {
    justifyContent: 'center', alignItems: 'center',
  },
  portalCoverEmoji: { fontSize: 52 },
  portalPendingLabel: {
    fontFamily: 'Nunito', fontSize: 11, color: '#7C3AED',
    fontWeight: '700', marginBottom: 4,
  },
  portalTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text,
    lineHeight: 24, marginBottom: 4, textAlign: 'center',
  },
  portalProgress: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.muted,
    textAlign: 'center', marginBottom: 8,
  },
  portalBar: {
    height: 5, backgroundColor: pt.border, borderRadius: 3,
    overflow: 'hidden', marginBottom: 16,
  },
  portalBarFill: { height: '100%', backgroundColor: pt.green, borderRadius: 3 },
  portalBtn: {
    borderRadius: radii.pill, overflow: 'hidden',
    elevation: 3, shadowColor: '#F4651F',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  portalBtnGradient: { paddingVertical: 15, alignItems: 'center' },
  portalBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },

  // ── Portinha do Ateliê ──
  atelierWrapper: { marginHorizontal: 16, marginBottom: 4 },
  atelierLabel: {
    fontFamily: 'Nunito', fontSize: 10, color: pt.muted,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 4, marginLeft: 2,
  },
  atelierShortcut: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: pt.lilac,
    borderRadius: radii.lg,
    padding: 13,
    borderWidth: 1.5, borderColor: '#C4B5FD',
    ...shadows.soft, gap: 10,
  },
  atelierIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#C4B5FD',
    flexShrink: 0, position: 'relative',
  },
  atelierIconEmoji: { fontSize: 22 },
  atelierIconSparkle: {
    position: 'absolute', top: -3, right: -3, fontSize: 11,
  },
  atelierInfo: { flex: 1 },
  atelierTitle: {
    fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 1,
  },
  atelierDesc: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 17,
  },
  atelierBtn: {
    backgroundColor: '#8E44AD',
    borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8, flexShrink: 0,
  },
  atelierBtnText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF' },

  // ── Mapa dos caminhos ──
  worldsSub: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft,
    marginHorizontal: 16, marginBottom: 10,
  },
  worldsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginHorizontal: 16, gap: 8, marginBottom: 4,
  },
  worldCompactWrapper: { width: '47.5%' },
  worldCompact: {
    borderRadius: radii.lg, padding: 12,
    alignItems: 'flex-start', minHeight: 104,
    ...shadows.soft, overflow: 'hidden',
  },
  worldGlow: {
    position: 'absolute', top: -8, right: -8,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  worldCompactEmoji: { fontSize: 22, marginBottom: 4 },
  worldCompactLabel: {
    fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF', lineHeight: 18, marginBottom: 2,
  },
  worldCompactDesc: {
    fontFamily: 'Nunito', fontSize: 10, color: 'rgba(255,255,255,0.82)',
    lineHeight: 14, marginBottom: 7, flex: 1,
  },
  worldBadgeFree: {
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 2,
  },
  worldBadgeFreeText: {
    fontFamily: 'Nunito', fontSize: 10, color: '#FFF', fontWeight: '700',
  },
  worldBadgePremium: {
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 2,
  },
  worldBadgePremiumText: {
    fontFamily: 'Nunito', fontSize: 10, color: 'rgba(255,255,255,0.88)', fontWeight: '700',
  },

  // ── Missão de hoje ──
  missionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: pt.goldSoft,
    borderRadius: radii.lg,
    marginHorizontal: 16, marginBottom: 12,
    padding: 13, borderLeftWidth: 3, borderLeftColor: pt.gold,
    ...shadows.soft, gap: 12,
  },
  missionEmoji: { fontSize: 26, flexShrink: 0 },
  missionText: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.text,
    lineHeight: 19, fontWeight: '700', flex: 1,
  },

  // ── Última conquista ──
  achievementCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: pt.lilac,
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: radii.lg, padding: 13,
    ...shadows.soft, borderLeftWidth: 3, borderLeftColor: pt.purple, gap: 12,
  },
  achievementEmoji: { fontSize: 24 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 2 },
  achievementSub: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 17 },

  // ── Momento com Beni ──
  momentCard: {
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    marginHorizontal: 16, marginBottom: 12,
    padding: 14, borderLeftWidth: 3, borderLeftColor: '#A78BFA',
    ...shadows.soft,
  },
  momentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  momentEmoji: { fontSize: 22, flexShrink: 0 },
  momentInfo: { flex: 1 },
  momentTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 2 },
  momentVerse: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 17 },
  momentCta: { fontFamily: 'FredokaOne', fontSize: 13, color: '#7C3AED', textAlign: 'right' },
  momentCtaLocked: { color: pt.muted },
});
