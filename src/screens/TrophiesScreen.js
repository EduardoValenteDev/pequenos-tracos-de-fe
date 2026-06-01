import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  useWindowDimensions,
} from 'react-native';
import FaithIcon from '../components/ui/FaithIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { stories } from '../data/stories';
import { useProgressContext } from '../context/ProgressContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { buildCtx } from '../services/achievementService';
import {
  getSeenAchievementIds,
  markAchievementAsSeen,
  diffNewAchievements,
} from '../services/achievementSeenService';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';

/* ── Achievement card ────────────────────────────────────────────── */
function AchievementCard({ achievement, unlocked, isTablet, ctx }) {
  return (
    <View
      style={[
        styles.card,
        isTablet && styles.cardTablet,
        unlocked
          ? [styles.cardUnlocked, { borderLeftColor: achievement.color }]
          : styles.cardLocked,
      ]}
    >
      <View
        style={[
          styles.emojiCircle,
          { backgroundColor: unlocked ? achievement.color + '28' : '#EDEBE8' },
        ]}
      >
        <Text style={[styles.cardEmoji, !unlocked && styles.cardEmojiDimmed]}>
          {achievement.emoji}
        </Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, !unlocked && styles.cardTitleLocked]}>
          {achievement.title}
        </Text>
        <Text style={styles.cardDesc}>{achievement.desc}</Text>
        {unlocked ? (
          <View style={[styles.unlockedBadge, { backgroundColor: achievement.color + '28' }]}>
            <Text style={[styles.unlockedBadgeText, { color: achievement.color }]}>
              ✨ Você conquistou isso!
            </Text>
          </View>
        ) : ctx && achievement.progressLabel ? (
          <Text style={styles.progressHint}>{achievement.progressLabel(ctx)}</Text>
        ) : null}
      </View>
    </View>
  );
}

/* ── Main screen ─────────────────────────────────────────────────── */
export default function TrophiesScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { progressByStory, postStoryStatusByStory } = useProgressContext();

  const [ctx, setCtx] = useState(null);
  const [pendingAchievement, setPendingAchievement] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const built = await buildCtx(progressByStory, stories, { postStoryStatusByStory });
      if (cancelled) return;
      setCtx(built);

      const seen = await getSeenAchievementIds();
      const unlockedIds = ACHIEVEMENTS.filter(a => a.check(built)).map(a => a.id);
      const newIds = diffNewAchievements(unlockedIds, seen);
      if (newIds.length > 0 && !cancelled) {
        setPendingAchievement(ACHIEVEMENTS.find(a => a.id === newIds[0]) ?? null);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [progressByStory, postStoryStatusByStory]);

  const unlockedCount = ctx ? ACHIEVEMENTS.filter(a => a.check(ctx)).length : 0;

  async function handleDismissModal() {
    if (!pendingAchievement) return;
    const dismissing = pendingAchievement;
    setPendingAchievement(null);
    await markAchievementAsSeen(dismissing.id);

    if (!ctx) return;
    const seen = await getSeenAchievementIds();
    const unlockedIds = ACHIEVEMENTS.filter(a => a.check(ctx)).map(a => a.id);
    const newIds = diffNewAchievements(unlockedIds, seen);
    if (newIds.length > 0) {
      setPendingAchievement(ACHIEVEMENTS.find(a => a.id === newIds[0]) ?? null);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 24), paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerIconCircle}>
            <FaithIcon name="star" size={44} color="#B8860B" />
          </View>
          <Text style={styles.headerTitle}>Minhas Estrelinhas</Text>
          <Text style={styles.headerSub}>
            {unlockedCount} de {ACHIEVEMENTS.length} conquistadas
          </Text>
          <View style={styles.headerProgressRow}>
            <View style={styles.headerProgressBar}>
              <View
                style={[
                  styles.headerProgressFill,
                  { width: ACHIEVEMENTS.length > 0 ? `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` : '0%' },
                ]}
              />
            </View>
          </View>
        </View>

        {/* ── Achievement grid (tablet: 2-col) ── */}
        <View style={isTablet ? styles.achievementsGrid : null}>
          {ACHIEVEMENTS.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={!!(ctx && achievement.check(ctx))}
              isTablet={isTablet}
              ctx={ctx}
            />
          ))}
        </View>

        {unlockedCount === 0 && (
          <View style={styles.emptyHint}>
            <Text style={styles.emptyHintText}>
              ⭐ Pinte sua primeira cena para acender a primeira estrelinha!
            </Text>
          </View>
        )}

        <View style={styles.teaser}>
          <Text style={styles.teaserText}>🌟 Mais conquistas chegando em breve!</Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      {pendingAchievement && (
        <AchievementUnlockModal
          achievement={pendingAchievement}
          onDismiss={handleDismissModal}
        />
      )}
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },
  content: { paddingHorizontal: 16, paddingBottom: 24 },

  header: { alignItems: 'center', paddingVertical: 24 },
  headerIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFF1BF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 26, color: pt.text, marginBottom: 4 },
  headerSub: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    textAlign: 'center', marginBottom: 12,
  },
  headerProgressRow: { width: '60%' },
  headerProgressBar: {
    height: 8, backgroundColor: pt.border, borderRadius: 4, overflow: 'hidden',
  },
  headerProgressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 4 },

  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radii.lg, padding: 16, marginBottom: 12, gap: 14,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4,
  },
  cardTablet: { width: '48%' },
  cardUnlocked: { backgroundColor: '#FFF' },
  cardLocked: { backgroundColor: '#F5EFE8', borderLeftColor: '#D8CEC4' },

  emojiCircle: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  cardEmoji: { fontSize: 26 },
  cardEmojiDimmed: { opacity: 0.28 },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 3 },
  cardTitleLocked: { color: pt.muted },
  cardDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 17 },
  progressHint: {
    fontFamily: 'Nunito',
    fontSize: 11,
    color: pt.muted,
    fontWeight: '700',
    marginTop: 4,
  },
  unlockedBadge: {
    alignSelf: 'flex-start', borderRadius: radii.sm,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 6,
  },
  unlockedBadgeText: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700' },

  emptyHint: {
    backgroundColor: '#FFFBF0',
    borderRadius: radii.lg,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F4B400' + '44',
  },
  emptyHintText: {
    fontFamily: 'Nunito', fontSize: 14, color: '#B8860B',
    fontWeight: '700', textAlign: 'center', lineHeight: 21,
  },
  teaser: { alignItems: 'center', paddingVertical: 20 },
  teaserText: { fontFamily: 'Nunito', fontSize: 13, color: pt.muted, fontStyle: 'italic' },
});
