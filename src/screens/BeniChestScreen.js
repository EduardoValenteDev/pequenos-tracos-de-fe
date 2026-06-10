/**
 * BeniChestScreen — "Baú do Beni" 2.0 (revelação + coleção viva).
 *
 * Abre revelando cartinhas novas (modal com Beni), organiza por abas/categorias,
 * limita cards bloqueados visíveis e mostra cartinhas colecionáveis com raridade.
 * Tudo derivado de dados existentes; só ids de cartinhas vistas são salvos.
 *
 * TODO(assets): baú fechado/aberto animado, verso de cartinha, molduras por
 * categoria, brilho shiny e ícones próprios de categoria.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import { BeniAvatar, BeniChestCard } from '../components/beni';
import { stories } from '../data/stories';
import { useProgressContext } from '../context/ProgressContext';
import { buildCtx } from '../services/achievementService';
import { listArts } from '../services/atelierStorage';
import {
  buildBeniChestCards, getBeniChestSummary, getNextChestCard,
  CHEST_CATEGORIES, RARITY_LABEL, resolveCardImageSource, CARD_FALLBACK,
} from '../services/beniChestService';
import {
  getSeenChestCardIds, markManyChestCardsSeen, getUnseenUnlockedChestCards,
} from '../services/beniChestSeenStorage';
import { backLabelFor } from '../utils/originBack';

const TABS = [
  { id: 'todas', label: 'Todas' },
  ...CHEST_CATEGORIES.filter(c => c.id !== 'beni').map(c => ({ id: c.id, label: c.label })),
];

const MAX_LOCKED_TODAS = 6;
const MAX_LOCKED_CATEGORY = 4;

/* Texto da "próxima cartinha" — sem usar "Você encontrou" para bloqueada. */
function nextCardText(card) {
  if (!card) return 'Continue uma aventura para encontrar mais cartinhas.';
  if (card.storyTitle) return `Continue ${card.storyTitle} para revelar uma nova lembrança.`;
  if (card.hint) return card.hint;
  return 'Continue sua jornada para revelar uma nova lembrança.';
}

export default function BeniChestScreen({ navigation, route }) {
  const backLabel = backLabelFor(route?.params?.from);
  const insets = useSafeAreaInsets();
  const { progressByStory, postStoryStatusByStory } = useProgressContext();

  const [arts, setArts] = useState([]);
  const [ctx, setCtx] = useState(null);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('todas');
  const [expandedCats, setExpandedCats] = useState({});

  // Cartinhas novas (não vistas) deste acesso — usadas para revelação + badge.
  const [newIds, setNewIds] = useState([]);
  const [revealQueue, setRevealQueue] = useState([]);  // cartinhas a revelar
  const revealAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const list = await listArts().catch(() => []);
        const built = await buildCtx(progressByStory, stories, { postStoryStatusByStory }).catch(() => null);
        if (!alive) return;
        setArts(Array.isArray(list) ? list : []);
        setCtx(built);

        const cards = buildBeniChestCards({ progressByStory, stories, arts: list, ctx: built });

        // Preload best-effort das imagens locais (require) das cartinhas
        // desbloqueadas → reduz a demora ao rolar. Nunca trava nem lança.
        try {
          const localImgs = cards
            .filter(cd => cd && cd.unlocked)
            .map(cd => resolveCardImageSource(cd))
            .filter(s => typeof s === 'number');
          if (localImgs.length > 0) {
            Promise.allSettled(localImgs.map(n => Asset.fromModule(n).downloadAsync())).catch(() => {});
          }
        } catch { /* preload é opcional; ignora qualquer falha */ }

        const unseen = await getUnseenUnlockedChestCards(cards);
        if (!alive) return;
        // Não revela a cartinha inicial do Beni como "descoberta".
        const toReveal = unseen.filter(c => c.id !== 'beni_welcome');
        setNewIds(toReveal.map(c => c.id));
        if (toReveal.length > 0) {
          setRevealQueue(toReveal);
          revealAnim.setValue(0);
          Animated.spring(revealAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }).start();
        }
        // A cartinha inicial do Beni é marcada vista silenciosamente.
        const beniSeen = unseen.find(c => c.id === 'beni_welcome');
        if (beniSeen) markManyChestCardsSeen(['beni_welcome']);
      })();
      return () => { alive = false; };
    }, [progressByStory, postStoryStatusByStory]),
  );

  const cards = buildBeniChestCards({ progressByStory, stories, arts, ctx });
  const { unlocked, total } = getBeniChestSummary(cards);
  const next = getNextChestCard(cards);
  const ratio = total > 0 ? unlocked / total : 0;
  const newSet = new Set(newIds);
  const hasNew = revealQueue.length > 0;

  // Ação contextual do detalhe ("o que posso fazer com isso?"). Só quando faz
  // sentido e a rota é segura — senão o detalhe mostra apenas "Fechar".
  function detailAction(card) {
    if (!card || !card.unlocked) return null;
    if ((card.category === 'historias' || card.category === 'cenas') && card.storyId) {
      const story = stories.find(s => s && s.id === card.storyId);
      if (story) {
        return {
          label: 'Rever história',
          onPress: () => { setSelected(null); navigation.navigate('StoryDetail', { story }); },
        };
      }
    }
    if (card.category === 'artes') {
      return {
        label: 'Ver minhas artes',
        onPress: () => { setSelected(null); navigation.navigate('AtelierGallery'); },
      };
    }
    return null;
  }

  function handleGuardar() {
    // Guarda TODAS as novas de uma vez: marca como vistas (persistente) e some
    // o badge "Nova" agora. Ao reabrir, getUnseenUnlockedChestCards já as exclui.
    markManyChestCardsSeen(revealQueue.map(c => c.id));
    setNewIds([]);
    setRevealQueue([]);
  }

  // Ordena cartinhas de uma lista: novas → desbloqueadas → bloqueadas.
  function orderCards(list) {
    const isNew = c => newSet.has(c.id);
    return [...list].sort((a, b) => {
      const an = isNew(a) ? 0 : a.unlocked ? 1 : 2;
      const bn = isNew(b) ? 0 : b.unlocked ? 1 : 2;
      return an - bn;
    });
  }

  // Monta as seções conforme a aba ativa, aplicando limites de bloqueadas.
  function buildSections() {
    if (activeTab === 'todas') {
      const ordered = orderCards(cards);
      const unlockedCards = ordered.filter(c => c.unlocked);
      const lockedCards = ordered.filter(c => !c.unlocked).slice(0, MAX_LOCKED_TODAS);
      return [{ key: 'todas', cards: [...unlockedCards, ...lockedCards] }];
    }
    const items = cards.filter(c => c.category === activeTab);
    const unlockedCards = orderCards(items.filter(c => c.unlocked));
    const allLocked = items.filter(c => !c.unlocked);
    const expanded = !!expandedCats[activeTab];
    const lockedShown = expanded ? allLocked : allLocked.slice(0, MAX_LOCKED_CATEGORY);
    return [{
      key: activeTab,
      cards: [...unlockedCards, ...lockedShown],
      hiddenLocked: allLocked.length - lockedShown.length,
    }];
  }

  const sections = buildSections();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={{ paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <SoundButton onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>‹ {backLabel}</Text>
          </SoundButton>
        </View>

        {/* Hero */}
        <LinearGradient colors={['#FFF1C9', '#F6E2FB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroChest}>🧰</Text>
            <BeniAvatar variant="celebrating" size="medium" />
          </View>
          <Text style={styles.heroTitle}>Baú do Beni</Text>
          <Text style={styles.heroSub}>Suas cartinhas guardam lembranças das aventuras que você viveu com Beni.</Text>
          <Text style={styles.heroLine}>Cada aventura pode revelar uma nova lembrança.</Text>
          <Text style={styles.heroCount}>{unlocked} cartinha{unlocked === 1 ? '' : 's'} encontrada{unlocked === 1 ? '' : 's'}</Text>
          <View style={styles.heroBar}>
            <View style={[styles.heroBarFill, { width: `${ratio * 100}%` }]} />
          </View>
          <Text style={styles.heroState}>
            {hasNew ? '✨ Você tem cartinha nova!' : 'Continue uma aventura para encontrar mais.'}
          </Text>
        </LinearGradient>

        {/* Próxima cartinha */}
        <View style={styles.nextCard}>
          <Text style={styles.nextLabel}>🔎 PRÓXIMA CARTINHA</Text>
          <Text style={styles.nextText}>{nextCardText(next)}</Text>
        </View>

        {/* Abas/chips de categoria */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}
        >
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <SoundButton
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{tab.label}</Text>
              </SoundButton>
            );
          })}
        </ScrollView>

        {/* Grade */}
        {sections.map(sec => (
          <View key={sec.key} style={styles.section}>
            <View style={styles.grid}>
              {sec.cards.map(card => (
                <BeniChestCard
                  key={card.id}
                  card={card}
                  isNew={newSet.has(card.id)}
                  onPress={() => setSelected(card)}
                />
              ))}
            </View>
            {sec.hiddenLocked > 0 && (
              <SoundButton
                style={styles.revealMoreBtn}
                onPress={() => setExpandedCats(prev => ({ ...prev, [activeTab]: true }))}
                activeOpacity={0.85}
              >
                <Text style={styles.revealMoreText}>Ver cartinhas escondidas ({sec.hiddenLocked})</Text>
              </SoundButton>
            )}
          </View>
        ))}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── MODAL DE REVELAÇÃO ── */}
      <Modal visible={revealQueue.length > 0} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.revealOverlay}>
          {revealQueue.length > 0 && (
            <Animated.View style={[styles.revealBox, { transform: [{ scale: revealAnim }] }]}>
              <BeniAvatar variant="celebrating" size="large" />
              <Text style={styles.revealHeader}>Beni encontrou uma nova cartinha!</Text>
              <View style={styles.revealCardWrap}>
                <BeniChestCard card={revealQueue[0]} isNew onPress={() => {}} style={styles.revealCard} />
              </View>
              <Text style={styles.revealName}>{revealQueue[0].title}</Text>
              <Text style={styles.revealOrigin}>{revealQueue[0].origin}</Text>
              {revealQueue.length > 1 && (
                <Text style={styles.revealMore}>Mais cartinhas esperam no Baú.</Text>
              )}
              <SoundButton style={styles.revealBtn} onPress={handleGuardar} activeOpacity={0.85}>
                <Text style={styles.revealBtnText}>Guardar no Baú ✨</Text>
              </SoundButton>
            </Animated.View>
          )}
        </View>
      </Modal>

      {/* ── DETALHE DA CARTINHA ── */}
      <Modal visible={!!selected} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setSelected(null)}>
        <View style={styles.detailOverlay}>
          {selected && (selected.unlocked ? (
            <View style={styles.detailBox}>
              <View style={[styles.detailArt, { backgroundColor: selected.color + '14' }]}>
                {(() => {
                  if (selected.beni) return <BeniAvatar variant="celebrating" size="hero" />;
                  const src = resolveCardImageSource(selected);
                  const fb = CARD_FALLBACK[selected.category] || CARD_FALLBACK.beni;
                  if (src) {
                    return (
                      <Image
                        source={src}
                        style={styles.detailImg}
                        resizeMode={selected.category === 'artes' ? 'contain' : 'cover'}
                      />
                    );
                  }
                  return (
                    <LinearGradient colors={fb.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.detailFallback}>
                      <Text style={styles.detailFallbackIcon}>{fb.icon}</Text>
                      <Text style={styles.detailFallbackLabel}>{fb.label}</Text>
                    </LinearGradient>
                  );
                })()}
              </View>
              <View style={styles.detailBadges}>
                <View style={[styles.detailTypeBadge, { backgroundColor: selected.color }]}>
                  <Text style={styles.detailTypeText}>{selected.type}</Text>
                </View>
                <View style={styles.detailRarityBadge}>
                  <Text style={styles.detailRarityText}>
                    {selected.rarity === 'shiny' ? '✨ ' : ''}{RARITY_LABEL[selected.rarity] || 'Comum'}
                  </Text>
                </View>
              </View>
              <Text style={styles.detailTitle}>{selected.title}</Text>
              {(() => {
                const cat = CHEST_CATEGORIES.find(c => c.id === selected.category);
                return cat ? (
                  <Text style={styles.detailCategory}>{cat.icon} {cat.label}</Text>
                ) : null;
              })()}
              <Text style={styles.detailPhrase}>{selected.phrase}</Text>
              <Text style={styles.detailBeniLine}>Beni guardou essa lembrança para você. 💛</Text>
              <View style={styles.detailOriginBox}>
                <Text style={styles.detailOriginLabel}>Como você ganhou</Text>
                <Text style={styles.detailOriginText}>{selected.origin}</Text>
              </View>
              {(() => {
                const action = detailAction(selected);
                return action ? (
                  <SoundButton style={styles.detailActionBtn} onPress={action.onPress} activeOpacity={0.85}>
                    <Text style={styles.detailActionText}>{action.label}</Text>
                  </SoundButton>
                ) : null;
              })()}
              <SoundButton
                style={detailAction(selected) ? styles.detailBtnSecondary : styles.detailBtn}
                onPress={() => setSelected(null)}
                activeOpacity={0.85}
              >
                <Text style={detailAction(selected) ? styles.detailBtnSecondaryText : styles.detailBtnText}>Fechar</Text>
              </SoundButton>
            </View>
          ) : (
            <View style={styles.detailBoxSmall}>
              <Text style={styles.detailLockEmoji}>🔒</Text>
              <Text style={styles.detailLockTitle}>Cartinha escondida</Text>
              <Text style={styles.detailLockText}>Continue sua jornada para revelar.</Text>
              {selected.hint ? <Text style={styles.detailLockHint}>{selected.hint}</Text> : null}
              <SoundButton style={styles.detailBtn} onPress={() => setSelected(null)} activeOpacity={0.85}>
                <Text style={styles.detailBtnText}>Fechar</Text>
              </SoundButton>
            </View>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },

  headerRow: { paddingHorizontal: 12, paddingBottom: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 8, alignSelf: 'flex-start' },
  backBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.faithBlue },

  // Hero
  hero: { marginHorizontal: 16, borderRadius: radii.xl, padding: 20, alignItems: 'center', borderWidth: 1.5, borderColor: '#F0DEB6', marginBottom: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  heroChest: { fontSize: 40 },
  heroTitle: { fontFamily: 'FredokaOne', fontSize: 24, color: pt.text, marginBottom: 2 },
  heroSub: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  heroLine: { fontFamily: 'Nunito', fontSize: 12.5, color: '#8A5A12', fontWeight: '700', textAlign: 'center', marginBottom: 12, fontStyle: 'italic' },
  heroCount: { fontFamily: 'FredokaOne', fontSize: 13, color: '#9A6B12', marginBottom: 8 },
  heroBar: { width: '72%', height: 10, backgroundColor: 'rgba(122,88,0,0.15)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  heroBarFill: { height: '100%', backgroundColor: pt.gold, borderRadius: 5 },
  heroState: { fontFamily: 'Nunito', fontSize: 12, color: '#7A5A12', fontWeight: '800' },

  // Próxima cartinha
  nextCard: { marginHorizontal: 16, marginBottom: 14, backgroundColor: '#FFFDF7', borderRadius: radii.lg, padding: 14, borderWidth: 1.5, borderColor: '#F0E2C6', ...shadows.soft },
  nextLabel: { fontFamily: 'FredokaOne', fontSize: 11, color: '#9A6B12', letterSpacing: 0.5, marginBottom: 4 },
  nextText: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, fontWeight: '700', lineHeight: 18 },

  // Chips
  chipsScroll: { flexGrow: 0, marginBottom: 12 },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  chip: { backgroundColor: '#FFF', borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: pt.border },
  chipActive: { backgroundColor: pt.faithBlue, borderColor: pt.faithBlue },
  chipText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.muted },
  chipTextActive: { color: '#FFF' },

  // Grade
  section: { paddingHorizontal: 16, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  revealMoreBtn: { alignSelf: 'center', backgroundColor: pt.lilac, borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 10, marginTop: 4, marginBottom: 8, borderWidth: 1, borderColor: '#E0D2FA' },
  revealMoreText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },

  // Revelação
  revealOverlay: { flex: 1, backgroundColor: 'rgba(20,12,30,0.62)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  revealBox: { backgroundColor: '#FFFDF8', borderRadius: radii.xl, padding: 24, width: '100%', alignItems: 'center', borderWidth: 1.5, borderColor: '#F0DEB6', elevation: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 24 },
  revealHeader: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center', marginTop: 6, marginBottom: 14 },
  revealCardWrap: { width: 150, marginBottom: 12 },
  revealCard: { width: '100%' },
  revealName: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center', marginBottom: 2 },
  revealOrigin: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  revealMore: { fontFamily: 'Nunito', fontSize: 12, color: pt.purpleDeep, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  revealBtn: { backgroundColor: pt.gold, borderRadius: radii.pill, paddingVertical: 14, alignSelf: 'stretch', alignItems: 'center', marginTop: 4 },
  revealBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#5A3E12' },

  // Detalhe
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  detailBox: { backgroundColor: '#FFFDF8', borderRadius: radii.xl, padding: 22, width: '100%', alignItems: 'center', borderWidth: 1.5, borderColor: '#F0E2C6', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20 },
  detailArt: { width: 160, height: 160, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  detailImg: { width: '100%', height: '100%' },
  detailEmoji: { fontSize: 72 },
  detailFallback: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  detailFallbackIcon: { fontSize: 56, marginBottom: 6 },
  detailFallbackLabel: { fontFamily: 'FredokaOne', fontSize: 14, color: 'rgba(58,42,30,0.66)' },
  detailBadges: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  detailTypeBadge: { borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 3 },
  detailTypeText: { fontFamily: 'Nunito', fontSize: 11, color: '#FFF', fontWeight: '800' },
  detailRarityBadge: { borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 3, backgroundColor: pt.cream, borderWidth: 1, borderColor: '#F0E2C6' },
  detailRarityText: { fontFamily: 'Nunito', fontSize: 11, color: '#9A6B12', fontWeight: '800' },
  detailTitle: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.text, textAlign: 'center', marginBottom: 2 },
  detailCategory: { fontFamily: 'Nunito', fontSize: 12.5, color: pt.textSoft, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  detailPhrase: { fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft, textAlign: 'center', lineHeight: 21, marginBottom: 6 },
  detailBeniLine: { fontFamily: 'FredokaOne', fontSize: 12.5, color: pt.purpleDeep, textAlign: 'center', marginBottom: 12 },
  detailOriginBox: { backgroundColor: pt.cream, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, width: '100%' },
  detailOriginLabel: { fontFamily: 'FredokaOne', fontSize: 11, color: '#9A6B12', letterSpacing: 0.4, textAlign: 'center', marginBottom: 3 },
  detailOriginText: { fontFamily: 'Nunito', fontSize: 13, color: pt.text, fontWeight: '700', textAlign: 'center' },
  detailBtn: { backgroundColor: pt.gold, borderRadius: radii.pill, paddingVertical: 13, alignSelf: 'stretch', alignItems: 'center' },
  detailBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#5A3E12' },
  // Ação contextual (primária) + Fechar (secundário) quando há ação
  detailActionBtn: { backgroundColor: pt.faithBlue, borderRadius: radii.pill, paddingVertical: 13, alignSelf: 'stretch', alignItems: 'center', marginBottom: 8 },
  detailActionText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },
  detailBtnSecondary: { backgroundColor: 'transparent', borderRadius: radii.pill, paddingVertical: 11, alignSelf: 'stretch', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2D2A8' },
  detailBtnSecondaryText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#9A6B12' },

  // Detalhe bloqueada (menor)
  detailBoxSmall: { backgroundColor: '#FFFDF8', borderRadius: radii.xl, padding: 24, width: '100%', alignItems: 'center', borderWidth: 1.5, borderColor: '#E7DECF', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20 },
  detailLockEmoji: { fontSize: 40, marginBottom: 8 },
  detailLockTitle: { fontFamily: 'FredokaOne', fontSize: 19, color: pt.text, marginBottom: 6 },
  detailLockText: { fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft, fontWeight: '700', textAlign: 'center', marginBottom: 8, lineHeight: 20 },
  detailLockHint: { fontFamily: 'Nunito', fontSize: 13, color: pt.faithBlueDeep, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
});
