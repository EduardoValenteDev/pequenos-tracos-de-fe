/**
 * TrophiesScreen — Álbum de Estrelinhas (Álbum do Beni).
 *
 * Álbum emocional de conquistas: hero + progresso geral + PRÓXIMA CONQUISTA +
 * seções por categoria (Jornada, Histórias, Arte, Quiz, Livrinho, Coração).
 * Cada conquista abre um detalhe (modal). Sem ranking, pressão ou comparação.
 *
 * ── Retenção futura (Plano Mestre — NÃO implementado nesta sprint) ───────────
 *   Ganchos previstos, apenas anotados:
 *     • Modo Cultinho em Casa        • Certificado por história
 *     • História do Domingo          • Conquista por rotina semanal
 *     • Relatório semanal (Área dos Pais)
 *     • Card compartilhável seguro (somente via Área dos Pais)
 *   Nada disso coleta dado sensível, usa foto da criança ou cria recurso social.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, SectionList, StyleSheet, Modal,
  useWindowDimensions,
} from 'react-native';
import FaithIcon from '../components/ui/FaithIcon';
import { BeniAvatar } from '../components/beni';
import SoundButton from '../components/SoundButton';
import BeniGuideOverlay from '../components/BeniGuideOverlay';
import { useScreenGuide } from '../hooks/useScreenGuide';
import { STARS_GUIDE } from '../data/beniGuides';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { stories } from '../data/stories';
import { useProgressContext } from '../context/ProgressContext';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../data/achievements';
import { buildCtx } from '../services/achievementService';
import {
  getSeenAchievementIds,
  markAchievementAsSeen,
  diffNewAchievements,
} from '../services/achievementSeenService';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';
import { backLabelFor } from '../utils/originBack';

/* Extrai a unidade ("cenas", "artes"...) do progressLabel para frases naturais. */
function unitFromLabel(label) {
  if (!label) return 'conquistas';
  const m = label.replace(/^\d+\s*de\s*\d+\s*/i, '').trim();
  return m || 'passos';
}

/* Executa check(ctx) com segurança — nunca lança. */
function safeCheck(achievement, ctx) {
  if (!ctx || typeof achievement.check !== 'function') return false;
  try { return !!achievement.check(ctx); } catch (_) { return false; }
}

/* Executa progress(ctx) com segurança — nunca lança, sempre retorna shape válido ou null. */
function safeProgress(achievement, ctx) {
  if (!ctx || typeof achievement.progress !== 'function') return null;
  try {
    const p = achievement.progress(ctx);
    if (p && typeof p.current === 'number' && typeof p.target === 'number' && p.target > 0) {
      return { current: Math.max(p.current, 0), target: p.target };
    }
  } catch (_) { /* progress nunca pode quebrar o card */ }
  return null;
}

/* Executa progressLabel(ctx) com segurança. */
function safeProgressLabel(achievement, ctx) {
  if (!ctx || typeof achievement.progressLabel !== 'function') return null;
  try { return achievement.progressLabel(ctx); } catch (_) { return null; }
}

/* Descobre a próxima conquista mais perto de ser desbloqueada (dados reais). */
function computeNextAchievement(ctx) {
  if (!ctx) return null;
  let best = null;
  for (const a of ACHIEVEMENTS) {
    if (safeCheck(a, ctx)) continue;
    const prog = safeProgress(a, ctx);
    if (!prog || prog.current >= prog.target) continue;
    const ratio = prog.current / prog.target;
    if (!best || ratio > best.ratio) {
      best = {
        achievement: a, current: prog.current, target: prog.target, ratio,
        remaining: prog.target - prog.current,
        unit: unitFromLabel(safeProgressLabel(a, ctx) || ''),
      };
    }
  }
  return best;
}

/* ── Card de conquista ───────────────────────────────────────────── */
function AchievementCard({ achievement, unlocked, ctx, isTablet, onPress }) {
  const prog = !unlocked ? safeProgress(achievement, ctx) : null;
  const ratio = prog ? Math.min(prog.current / prog.target, 1) : 0;
  const progLabel = safeProgressLabel(achievement, ctx);
  const inProgress = !!prog && prog.current > 0 && !!progLabel;

  return (
    <SoundButton
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        isTablet && styles.cardTablet,
        unlocked
          ? [styles.cardUnlocked, { borderColor: achievement.color, backgroundColor: achievement.color + '12' }]
          : styles.cardLocked,
      ]}
    >
      {unlocked && (
        <View style={[styles.stickerCorner, { backgroundColor: achievement.color }]}>
          <Text style={styles.stickerCornerText}>⭐</Text>
        </View>
      )}
      <View style={[styles.emojiCircle, { backgroundColor: unlocked ? achievement.color + '2A' : '#ECE7E0' }]}>
        <Text style={[styles.cardEmoji, !unlocked && styles.cardEmojiDimmed]}>{achievement.emoji}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, !unlocked && styles.cardTitleLocked]} numberOfLines={1}>
          {achievement.title}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{achievement.desc}</Text>

        {unlocked ? (
          <View style={[styles.unlockedBadge, { backgroundColor: achievement.color + '26' }]}>
            <Text style={[styles.unlockedBadgeText, { color: achievement.color }]}>✨ Você conquistou isso!</Text>
          </View>
        ) : inProgress ? (
          <View style={styles.cardProgressWrap}>
            <View style={styles.cardProgressBar}>
              <View style={[styles.cardProgressFill, { width: `${ratio * 100}%`, backgroundColor: achievement.color }]} />
            </View>
            <Text style={styles.cardProgressText}>{progLabel}</Text>
          </View>
        ) : (
          <Text style={styles.lockedHint} numberOfLines={2}>
            🔒 {achievement.how || 'Toque para ver como conquistar'}
          </Text>
        )}
      </View>
    </SoundButton>
  );
}

/* ── Tela principal ──────────────────────────────────────────────── */
export default function TrophiesScreen({ navigation, route }) {
  // true quando aberta como push do Stack (modal pós cena ou conclusão de história).
  // false quando aberta normalmente pela aba inferior.
  const fromCena =
    route?.params?.fromPostSceneCelebration === true ||
    route?.params?.fromStoryCompletion === true;

  // UX 2.3: guia de Estrelinhas DESATIVADO (reprovado) — só reativa no bloco UX 2.6.
  const starsGuide = useScreenGuide('stars', false);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { progressByStory, postStoryStatusByStory } = useProgressContext();

  const [ctx, setCtx] = useState(null);
  const [pendingAchievement, setPendingAchievement] = useState(null);
  const [selected, setSelected] = useState(null); // detalhe da conquista

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

  const isUnlocked = a => safeCheck(a, ctx);
  const unlockedCount = ctx ? ACHIEVEMENTS.filter(isUnlocked).length : 0;
  const total = ACHIEVEMENTS.length;
  const next = computeNextAchievement(ctx);

  // Seções por categoria para a SectionList (pula categorias sem conquistas).
  // No tablet, agrupa em pares para manter a grade 2-col aprovada; no celular,
  // 1-col (cada conquista é um item). Mesmas categorias/ordem/visual de antes.
  const albumSections = ACHIEVEMENT_CATEGORIES
    .map(cat => {
      const items = ACHIEVEMENTS.filter(a => a.category === cat.id);
      if (items.length === 0) return null;
      const catUnlocked = items.filter(isUnlocked).length;
      const data = isTablet
        ? items.reduce((rows, a, i) => {
            if (i % 2 === 0) rows.push([a]); else rows[rows.length - 1].push(a);
            return rows;
          }, [])
        : items;
      return { key: cat.id, cat, totalItems: items.length, catUnlocked, data };
    })
    .filter(Boolean);

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
      {fromCena && (
        <View style={[styles.backRow, { paddingTop: insets.top || 16 }]}>
          <SoundButton style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>‹ {backLabelFor(route?.params?.from)}</Text>
          </SoundButton>
        </View>
      )}
      <SectionList
        style={styles.container}
        contentContainerStyle={[styles.content, {
          paddingTop: fromCena ? 8 : Math.max(insets.top, 24),
          paddingBottom: 24,
        }]}
        showsVerticalScrollIndicator={false}
        sections={albumSections}
        keyExtractor={(item, index) => (isTablet ? `row-${item[0]?.id ?? index}` : String(item.id))}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <>
            {/* ── HERO ── */}
            <LinearGradient
              colors={['#F4EFFF', '#E7DBFF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.headerTopRow}>
                <View style={styles.headerIconCircle}>
                  <FaithIcon name="star" size={34} color="#B8860B" />
                </View>
                <BeniAvatar variant="celebrating" size="medium" />
              </View>
              <Text style={styles.headerTitle}>Álbum de Estrelinhas</Text>
              <Text style={styles.headerSub}>
                Você ganha estrelinhas ao completar cenas, histórias e momentos especiais.
              </Text>
              <Text style={styles.headerNote}>
                As estrelinhas mostram seu progresso. O Baú guarda suas lembranças.
              </Text>
              <Text style={styles.headerCount}>{unlockedCount} de {total} conquistas</Text>
              <View style={styles.headerProgressRow}>
                <View style={styles.headerProgressBar}>
                  <View style={[styles.headerProgressFill, { width: total > 0 ? `${(unlockedCount / total) * 100}%` : '0%' }]} />
                </View>
              </View>
            </LinearGradient>

            {/* ── PRÓXIMA CONQUISTA ── */}
            {next ? (
              <View style={styles.nextCard}>
                <View style={styles.nextLabelRow}>
                  <Text style={styles.nextLabel}>🎯 PRÓXIMA CONQUISTA</Text>
                </View>
                <View style={styles.nextBody}>
                  <View style={[styles.nextEmojiCircle, { backgroundColor: next.achievement.color + '22' }]}>
                    <Text style={styles.nextEmoji}>{next.achievement.emoji}</Text>
                  </View>
                  <View style={styles.nextInfo}>
                    <Text style={styles.nextTitle}>{next.achievement.title}</Text>
                    <Text style={styles.nextHow}>
                      Faltam {next.remaining} {next.unit} para desbloquear.
                    </Text>
                    <View style={styles.nextBar}>
                      <View style={[styles.nextBarFill, { width: `${next.ratio * 100}%`, backgroundColor: next.achievement.color }]} />
                    </View>
                  </View>
                </View>
              </View>
            ) : ctx && unlockedCount < total ? (
              <View style={styles.nextCardSoft}>
                <Text style={styles.nextSoftText}>
                  ✨ Continue uma aventura para descobrir sua próxima estrelinha.
                </Text>
              </View>
            ) : ctx && unlockedCount === total ? (
              <View style={styles.nextCardSoft}>
                <Text style={styles.nextSoftText}>
                  🏅 Uau! Você acendeu todas as estrelinhas. Beni está muito orgulhoso!
                </Text>
              </View>
            ) : null}
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{section.cat.icon}</Text>
            <Text style={styles.sectionTitle}>{section.cat.label}</Text>
            <Text style={styles.sectionCount}>{section.catUnlocked}/{section.totalItems}</Text>
          </View>
        )}
        renderSectionFooter={() => <View style={styles.sectionFooterGap} />}
        renderItem={({ item }) => (
          isTablet ? (
            <View style={styles.grid}>
              {item.map(a => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  unlocked={isUnlocked(a)}
                  ctx={ctx}
                  isTablet
                  onPress={() => setSelected(a)}
                />
              ))}
            </View>
          ) : (
            <AchievementCard
              achievement={item}
              unlocked={isUnlocked(item)}
              ctx={ctx}
              isTablet={false}
              onPress={() => setSelected(item)}
            />
          )
        )}
        ListFooterComponent={<View style={{ height: 16 }} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={9}
        removeClippedSubviews
      />

      {/* ── DETALHE DA CONQUISTA ── */}
      <Modal visible={!!selected} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setSelected(null)}>
        <View style={styles.detailOverlay}>
          {selected && (() => {
            const unlocked = isUnlocked(selected);
            return (
              <View style={styles.detailBox}>
                <View style={[styles.detailEmojiCircle, { backgroundColor: selected.color + (unlocked ? '2A' : '18') }]}>
                  <Text style={[styles.detailEmoji, !unlocked && { opacity: 0.5 }]}>{selected.emoji}</Text>
                </View>
                <Text style={styles.detailTitle}>{selected.title}</Text>
                <Text style={styles.detailDesc}>{selected.desc}</Text>

                <View style={styles.detailHowBox}>
                  <Text style={styles.detailHowLabel}>
                    {unlocked ? 'COMO VOCÊ GANHOU' : 'COMO CONQUISTAR'}
                  </Text>
                  <Text style={styles.detailHowText}>
                    {unlocked
                      ? (selected.earned || 'Você conquistou esta estrelinha!')
                      : (selected.how || safeProgressLabel(selected, ctx) || selected.desc)}
                  </Text>
                </View>

                {unlocked ? (
                  <View style={[styles.detailStatus, { backgroundColor: pt.greenSoft }]}>
                    <Text style={[styles.detailStatusText, { color: pt.greenDeep }]}>✅ Beni viu essa vitória!</Text>
                  </View>
                ) : (
                  <View style={[styles.detailStatus, { backgroundColor: pt.faithBlueSoft }]}>
                    <Text style={[styles.detailStatusText, { color: pt.faithBlueDeep }]}>
                      Continue sua jornada para desbloquear.
                    </Text>
                  </View>
                )}

                <SoundButton style={styles.detailBtn} onPress={() => setSelected(null)} activeOpacity={0.85}>
                  <Text style={styles.detailBtnText}>Fechar</Text>
                </SoundButton>
              </View>
            );
          })()}
        </View>
      </Modal>

      {/* ── CELEBRAÇÃO ── */}
      {pendingAchievement && (
        <AchievementUnlockModal
          achievement={pendingAchievement}
          onDismiss={handleDismissModal}
          onSeeAlbum={null}
        />
      )}

      {/* UX 2.2 — Guia contextual de Estrelinhas (1ª visita pela aba). */}
      {starsGuide.visible && (
        <BeniGuideOverlay steps={STARS_GUIDE} finalLabel="Entendi" onFinish={starsGuide.close} onSkip={starsGuide.close} />
      )}
    </View>
  );
}

/* ── Estilos ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },
  content: { paddingHorizontal: 16, paddingBottom: 24 },

  // Hero
  header: {
    alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20,
    borderRadius: radii.xl, marginBottom: 14,
    borderWidth: 1.5, borderColor: '#F2DFA0',
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  headerIconCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#FFF6DA',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#F2DFA0',
  },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 24, color: pt.text, marginBottom: 3 },
  headerSub: { fontFamily: 'Nunito', fontSize: 13, color: '#8A6D1F', textAlign: 'center', marginBottom: 6, lineHeight: 18, paddingHorizontal: 6 },
  headerNote: { fontFamily: 'Nunito', fontSize: 11.5, color: '#A07A2A', fontWeight: '700', textAlign: 'center', marginBottom: 8, lineHeight: 16, fontStyle: 'italic', paddingHorizontal: 6 },
  headerCount: { fontFamily: 'Nunito', fontSize: 12, color: '#9B7B30', fontWeight: '700', marginBottom: 10 },
  headerProgressRow: { width: '70%' },
  headerProgressBar: { height: 10, backgroundColor: 'rgba(122,88,0,0.15)', borderRadius: 5, overflow: 'hidden' },
  headerProgressFill: { height: '100%', backgroundColor: pt.gold, borderRadius: 5 },

  // Próxima conquista
  nextCard: {
    backgroundColor: '#FFFDF7', borderRadius: radii.xl,
    borderWidth: 1.5, borderColor: '#F0E2C6',
    padding: 14, marginBottom: 18,
    elevation: 4, shadowColor: '#B07A2E',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 10,
  },
  nextLabelRow: { marginBottom: 10 },
  nextLabel: { fontFamily: 'FredokaOne', fontSize: 11, color: '#9A6B12', letterSpacing: 0.5 },
  nextBody: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  nextEmojiCircle: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  nextEmoji: { fontSize: 28 },
  nextInfo: { flex: 1 },
  nextTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginBottom: 2 },
  nextHow: { fontFamily: 'Nunito', fontSize: 12.5, color: pt.textSoft, fontWeight: '700', marginBottom: 8 },
  nextBar: { height: 8, backgroundColor: pt.border, borderRadius: 4, overflow: 'hidden' },
  nextBarFill: { height: '100%', borderRadius: 4 },

  nextCardSoft: {
    backgroundColor: pt.faithBlueSoft, borderRadius: radii.lg,
    padding: 14, marginBottom: 18,
    borderWidth: 1, borderColor: 'rgba(43,91,161,0.18)',
  },
  nextSoftText: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.faithBlueDeep,
    fontWeight: '700', textAlign: 'center', lineHeight: 19,
  },

  // Seções
  section: { marginBottom: 16 },
  // Recupera o espaçamento entre categorias que antes vinha de styles.section.
  sectionFooterGap: { height: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 2 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text, flex: 1 },
  sectionCount: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted, fontWeight: '800' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  // Cards
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radii.xl, padding: 14, marginBottom: 10, gap: 14,
    position: 'relative', overflow: 'hidden',
  },
  cardTablet: { width: '48%' },
  cardUnlocked: {
    borderWidth: 2,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6,
  },
  cardLocked: {
    backgroundColor: '#F7F2EB',
    borderWidth: 1.5, borderColor: '#E7DECF',
    opacity: 0.96,
  },
  stickerCorner: {
    position: 'absolute', top: 8, right: 8,
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  stickerCornerText: { fontSize: 11 },
  emojiCircle: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  cardEmoji: { fontSize: 26 },
  cardEmojiDimmed: { opacity: 0.35 },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 3 },
  cardTitleLocked: { color: pt.muted },
  cardDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 17 },
  lockedHint: { fontFamily: 'Nunito', fontSize: 11, color: pt.muted, fontWeight: '700', marginTop: 5 },
  unlockedBadge: { alignSelf: 'flex-start', borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  unlockedBadgeText: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700' },
  cardProgressWrap: { marginTop: 7 },
  cardProgressBar: { height: 6, backgroundColor: pt.border, borderRadius: 3, overflow: 'hidden', marginBottom: 3 },
  cardProgressFill: { height: '100%', borderRadius: 3 },
  cardProgressText: { fontFamily: 'Nunito', fontSize: 10.5, color: pt.muted, fontWeight: '700' },

  // Detalhe
  detailOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28,
  },
  detailBox: {
    backgroundColor: '#FFFDF8', borderRadius: radii.xl, padding: 26,
    width: '100%', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#F0E2C6',
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20,
  },
  detailEmojiCircle: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  detailEmoji: { fontSize: 46 },
  detailTitle: { fontFamily: 'FredokaOne', fontSize: 21, color: pt.text, textAlign: 'center', marginBottom: 6 },
  detailDesc: { fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft, textAlign: 'center', lineHeight: 21, marginBottom: 14 },
  detailHowBox: {
    width: '100%', backgroundColor: pt.cream, borderRadius: radii.md,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
  },
  detailHowLabel: { fontFamily: 'FredokaOne', fontSize: 10, color: '#9A6B12', letterSpacing: 0.5, marginBottom: 4 },
  detailHowText: { fontFamily: 'Nunito', fontSize: 13, color: pt.text, fontWeight: '700', lineHeight: 19 },
  detailStatus: { width: '100%', borderRadius: radii.md, paddingVertical: 10, alignItems: 'center', marginBottom: 16 },
  detailStatusText: { fontFamily: 'FredokaOne', fontSize: 13 },
  detailBtn: {
    backgroundColor: pt.gold, borderRadius: radii.pill,
    paddingVertical: 13, paddingHorizontal: 40, alignSelf: 'stretch', alignItems: 'center',
  },
  detailBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#5A3E12' },

  // Botão Voltar — só visível quando aberta via modal pós cena (EstrelinhasCena)
  backRow: {
    backgroundColor: '#FFF6D8',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backBtnText: {
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: '#8A6D1F',
  },
});
