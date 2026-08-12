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
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, SectionList, StyleSheet, Modal,
} from 'react-native';
import FaithIcon from '../components/ui/FaithIcon';
import { BeniAvatar } from '../components/beni';
import SoundButton from '../components/SoundButton';
import BeniGuideOverlay from '../components/BeniGuideOverlay';
import { useScreenGuide } from '../hooks/useScreenGuide';
import { useGuideTargets } from '../hooks/useGuideTargets';
import { measureGuideTarget } from '../services/guideTargetRegistry';
import { STARS_GUIDE } from '../data/beniGuides';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { stories } from '../data/stories';
import { useProgressContext } from '../context/ProgressContext';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, isAchievementVisible } from '../data/achievements';
import { buildCtx } from '../services/achievementService';
import {
  getSeenAchievementIds,
  markAchievementAsSeen,
  diffNewAchievements,
} from '../services/achievementSeenService';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';
import { backLabelFor } from '../utils/originBack';
import { useHubComposition, hubRows } from '../components/layout/HubSurface';

/**
 * [F6-SG-C · TK-C-008] O que a TELA sabe e o arquétipo não: onde a conquista deixa de
 * ser legível. O card é uma linha — círculo de 44, intervalo de 14, título e barra de
 * progresso —, e abaixo de ~320dp o título começa a quebrar em três linhas. Este é o
 * piso que, em 1180dp, autoriza a terceira coluna e, em 700dp, mantém duas.
 */
const HUB_MIN_CARD = 320;
const HUB_GAP = 10;

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

/**
 * [P3J] Lista de conquistas que ESTE usuário pode ver. Idêntica a `ACHIEVEMENTS` para todo mundo,
 * exceto pelas conquistas legadas aposentadas (hoje só `artist_ark`), que aparecem apenas para
 * quem já as tem — ninguém recebe um card trancado por um caminho que o app não oferece mais.
 * Sem ctx (primeiro render, antes de `buildCtx` resolver) nada está desbloqueado, então as
 * aposentadas ficam ocultas: durante o carregamento é melhor não mostrar do que piscar um card
 * impossível e escondê-lo em seguida.
 */
function visibleAchievements(ctx) {
  return ACHIEVEMENTS.filter(a => isAchievementVisible(a, safeCheck(a, ctx)));
}

/* Descobre a próxima conquista mais perto de ser desbloqueada (dados reais). */
function computeNextAchievement(ctx) {
  if (!ctx) return null;
  let best = null;
  // [P3J] Nunca sugerir uma aposentada como próximo objetivo. Hoje `artist_ark` já cairia no
  // filtro de `progress` logo abaixo (não tem barra de progresso), mas a intenção fica explícita
  // aqui para não depender desse detalhe.
  for (const a of visibleAchievements(ctx)) {
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
function AchievementCard({ achievement, unlocked, ctx, onPress }) {
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
        {/* Bloco 1.3: conquistas novas trazem `faithIcon` (sem emoji). As antigas
            seguem com `emoji` — nada quebra. */}
        {achievement.faithIcon ? (
          <FaithIcon name={achievement.faithIcon} size={24} color={unlocked ? achievement.color : '#B9B2A9'} />
        ) : (
          <Text style={[styles.cardEmoji, !unlocked && styles.cardEmojiDimmed]}>{achievement.emoji}</Text>
        )}
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

  // Estrelinhas 1.0: guia falado ATIVO na 1ª visita PELA ABA (flag @ptf_beni_guide_stars_v1).
  // Aberto por push (modal pós-cena / conclusão) NÃO dispara o guia.
  const starsGuide = useScreenGuide('stars', !fromCena);
  // Alvos REAIS de Estrelinhas (measureInWindow) — sem medição → fallback sem seta.
  const starsTargets = useGuideTargets();
  const measureStarsTarget = useCallback(
    (name) => starsTargets.measure(name).then((r) => r || measureGuideTarget(name)),
    [starsTargets.measure],
  );
  // Os alvos (conquistas/próxima) ficam no topo (cabeçalho da lista); garante o topo
  // visível antes de medir. SectionList → scroll responder do VirtualizedList.
  const listRef = useRef(null);
  const onStarsStep = useCallback(() => {
    try { listRef.current?.getScrollResponder?.()?.scrollTo?.({ y: 0, animated: true }); } catch { /* topo já visível */ }
  }, []);

  const insets = useSafeAreaInsets();
  // [F6-SG-C · TK-C-003 → TK-C-008] Aqui morava `isTablet = band !== COMPACT`, e com
  // ele a terceira estrutura que `TK-C-003` deliberadamente NÃO criou — porque criá-la
  // ali teria sido redesenho disfarçado de migração. `C-C4` é onde ela cabe: a faixa
  // continua entrando (por dentro de `useHubComposition`), mas agora como TETO, e a
  // pergunta binária "é tablet?" desaparece da tela.
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
  // [P3J] Álbum, contador e "próxima conquista" passam a falar da MESMA lista visível. Para quem
  // conquistou `artist_ark`, nada muda: ela continua contando e aparecendo. Para quem não
  // conquistou, ela some do denominador também — senão o álbum ficaria travado em 26/27 para
  // sempre, e "100% das conquistas" viraria uma meta inalcançável.
  const visible = visibleAchievements(ctx);
  const unlockedCount = ctx ? visible.filter(isUnlocked).length : 0;
  const total = visible.length;
  const next = computeNextAchievement(ctx);

  // Seções por categoria para a SectionList (pula categorias sem conquistas).
  //
  // [F6-SG-C · TK-C-008] A densidade vem da família Hub. O fatiador embutido daqui —
  // preso ao número dois — era o único do app, e é dele que `hubRows` nasceu: a lista
  // continua virtualizando LINHAS, exatamente como antes, mas quantas conquistas
  // cabem numa linha deixou de ser resposta de "é tablet?" e passou a ser composição
  // do inventário do álbum com a largura real. Em 1180dp a grade abre a terceira
  // coluna (PLAN §18) em vez de manter duas metades de 560.
  const { columns } = useHubComposition({ itemCount: total, minItemWidth: HUB_MIN_CARD, gap: HUB_GAP });
  const emGrade = columns > 1;

  const albumSections = ACHIEVEMENT_CATEGORIES
    .map(cat => {
      const items = visible.filter(a => a.category === cat.id);
      if (items.length === 0) return null;
      const catUnlocked = items.filter(isUnlocked).length;
      const data = emGrade ? hubRows(items, columns) : items;
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
        ref={listRef}
        style={styles.container}
        contentContainerStyle={[styles.content, {
          paddingTop: fromCena ? 8 : Math.max(insets.top, 24),
          paddingBottom: 24,
        }]}
        showsVerticalScrollIndicator={false}
        sections={albumSections}
        keyExtractor={(item, index) => (emGrade ? `row-${item[0]?.id ?? index}` : String(item.id))}
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
              {/* Alvo do guia (Card 2 "Suas conquistas"): contagem + barra de progresso. */}
              <View ref={starsTargets.register('stars.achievements')} collapsable={false} style={styles.heroAchievements}>
                <Text style={styles.headerCount}>{unlockedCount} de {total} conquistas</Text>
                <View style={styles.headerProgressRow}>
                  <View style={styles.headerProgressBar}>
                    <View style={[styles.headerProgressFill, { width: total > 0 ? `${(unlockedCount / total) * 100}%` : '0%' }]} />
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* ── PRÓXIMA CONQUISTA ── */}
            {next ? (
              <View ref={starsTargets.register('stars.next')} collapsable={false} style={styles.nextCard}>
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
              <View ref={starsTargets.register('stars.next')} collapsable={false} style={styles.nextCardSoft}>
                <Text style={styles.nextSoftText}>
                  ✨ Continue uma aventura para descobrir sua próxima estrelinha.
                </Text>
              </View>
            ) : ctx && unlockedCount === total ? (
              <View ref={starsTargets.register('stars.next')} collapsable={false} style={styles.nextCardSoft}>
                <Text style={styles.nextSoftText}>
                  🏅 Uau! Você acendeu todas as estrelinhas. Beni está muito orgulhoso!
                </Text>
              </View>
            ) : null}
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            {section.cat.faithIcon ? (
              <FaithIcon name={section.cat.faithIcon} size={20} color={section.cat.color} style={styles.sectionIcon} />
            ) : (
              <Text style={styles.sectionIcon}>{section.cat.icon}</Text>
            )}
            <Text style={styles.sectionTitle}>{section.cat.label}</Text>
            <Text style={styles.sectionCount}>{section.catUnlocked}/{section.totalItems}</Text>
          </View>
        )}
        renderSectionFooter={() => <View style={styles.sectionFooterGap} />}
        renderItem={({ item }) => (
          emGrade ? (
            <View style={styles.grid}>
              {item.map(a => (
                <View key={a.id} style={styles.gridCell}>
                  <AchievementCard
                    achievement={a}
                    unlocked={isUnlocked(a)}
                    ctx={ctx}
                    onPress={() => setSelected(a)}
                  />
                </View>
              ))}
              {/* Categoria com número ímpar de conquistas fecha com célula vazia: sem
                  ela a última ficaria larga como a linha inteira e a grade entortaria. */}
              {Array.from({ length: columns - item.length }, (_, i) => (
                <View key={`gap-${i}`} style={styles.gridCell} />
              ))}
            </View>
          ) : (
            <AchievementCard
              achievement={item}
              unlocked={isUnlocked(item)}
              ctx={ctx}
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

      {/* Estrelinhas 1.0 — Guia falado (1ª visita pela aba), alvos medidos. */}
      {starsGuide.visible && (
        <BeniGuideOverlay
          steps={STARS_GUIDE}
          measure={measureStarsTarget}
          finalLabel="Entendi"
          onStep={onStarsStep}
          onFinish={starsGuide.close}
          onSkip={starsGuide.close}
        />
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
  // Alvo medível do guia (Card 2): contagem + barra, centralizado, ocupa a largura do hero.
  heroAchievements: { alignSelf: 'stretch', alignItems: 'center' },
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

  // [TK-C-008] A largura da conquista deixou de ser `48%` — dois por definição. A
  // célula divide o que sobra por igual, seja a grade de duas ou de três colunas.
  grid: { flexDirection: 'row', gap: HUB_GAP },
  gridCell: { flex: 1 },

  // Cards
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radii.xl, padding: 14, marginBottom: 10, gap: 14,
    position: 'relative', overflow: 'hidden',
  },
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
