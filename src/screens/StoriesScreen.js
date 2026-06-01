import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Modal,
  TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { stories } from '../data/stories';
import { CATALOG } from '../data/catalog';
import StoryCard from '../components/StoryCard';
import StoryFallbackCover from '../components/story/StoryFallbackCover';
import StatusBadge from '../components/ui/StatusBadge';
import SoundButton from '../components/SoundButton';
import FaithIcon from '../components/ui/FaithIcon';
import { LumiGuideCard, LumiEmptyState } from '../components/lumi';
import CenteredContent from '../components/layout/CenteredContent';
import { useProgressContext } from '../context/ProgressContext';

/* ── Trail definitions ───────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: 'comece',
    label: 'Comece Aqui',
    faithIcon: 'star',
    shortDesc: 'Primeiros passos da fé',
    desc: 'Trilha inicial com histórias gratuitas para os primeiros passos da fé.',
    available: true,
    isTrail: true,
    accessType: 'free',
  },
  {
    id: 'pequeninos',
    label: 'Pequeninos',
    faithIcon: 'heart',
    shortDesc: 'Para pequenos corações',
    desc: 'Histórias simples e fofas para pequenos corações corajosos.',
    available: true,
    accessType: 'premium',
  },
  {
    id: 'descobridores',
    label: 'Descobridores',
    faithIcon: 'bible',
    shortDesc: 'Explore a Bíblia',
    desc: 'Aventuras bíblicas mais profundas para explorar a fé.',
    available: true,
    accessType: 'premium',
  },
  {
    id: 'jovens_da_fe',
    label: 'Jovens da Fé',
    faithIcon: 'trophies',
    shortDesc: 'Cresça com coragem',
    desc: 'Desafios maiores para crescer com coragem e fé.',
    available: true,
    accessType: 'premium',
  },
];

function nivelToCategory(nivel) {
  const VALID = ['comece', 'pequeninos', 'descobridores', 'jovens_da_fe'];
  if (VALID.includes(nivel)) return nivel;
  if (nivel === 'jovens') return 'jovens_da_fe';
  return 'pequeninos';
}

function getCatalogEntries(categoryId, storyMap) {
  const entries = CATALOG[categoryId] ?? [];
  return entries.map(entry => {
    if (entry.type === 'story') {
      const story = storyMap[entry.storyId];
      return story ? { type: 'story', story } : null;
    }
    return entry;
  }).filter(Boolean);
}

/* ── Catalog placeholder card (coming-soon story) ───────────────── */
function CatalogCard({ entry }) {
  const themeColor = entry.accessType === 'premium' ? '#F4B400' : '#4FC3F7';
  return (
    <View style={styles.catalogCard}>
      <View style={styles.catalogCoverWrap}>
        <StoryFallbackCover
          title={entry.titulo}
          themeColor={themeColor}
          icon={entry.emoji ?? '✨'}
          status="coming_soon"
          accessType={entry.accessType ?? 'free'}
          compact
          style={styles.catalogCoverFallback}
        />
      </View>
      <View style={styles.catalogCardInfo}>
        <Text style={styles.catalogCardTitle} numberOfLines={2}>{entry.titulo}</Text>
        <Text style={styles.catalogCardRef}>{entry.referencia}</Text>
        <View style={styles.catalogBadgeRow}>
          <StatusBadge type={entry.accessType === 'premium' ? 'premium' : 'free'} />
          <StatusBadge type="coming_soon" style={{ marginLeft: 4 }} />
        </View>
      </View>
    </View>
  );
}

/* ── Modal for unavailable categories ───────────────────────────── */
function ComingSoonModal({ category, onClose }) {
  if (!category) return null;
  return (
    <Modal transparent animationType="fade" visible={!!category} statusBarTranslucent>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalBox}>
          <FaithIcon name={category.faithIcon ?? 'lock'} size={52} color={pt.gold} style={{ marginBottom: 12 }} />
          <StatusBadge type="coming_soon" style={{ marginBottom: 12 }} />
          <Text style={styles.modalTitle}>{category.label}</Text>
          <Text style={styles.modalDesc}>
            Esse mundo será liberado em breve.{'\n'}
            Continue brilhando nas aventuras de agora! ✨
          </Text>
          <SoundButton style={styles.modalBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.modalBtnText}>Entendi 😊</Text>
          </SoundButton>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

/* ── Main screen ─────────────────────────────────────────────────── */
export default function StoriesScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const { nivel } = route.params ?? {};
  const initialCategory = nivelToCategory(nivel);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [modalCategory, setModalCategory] = useState(null);

  const outerScrollRef = useRef(null);
  const chipScrollRef = useRef(null);
  const chipLayouts = useRef({});

  const { progressByStory } = useProgressContext();
  const progressMap = progressByStory;

  const storyMap = Object.fromEntries(stories.map(s => [s.id, s]));

  function getCount(storyId) {
    const p = progressMap[storyId] || {};
    return Object.values(p).filter(Boolean).length;
  }

  const catalogEntries = getCatalogEntries(activeCategory, storyMap);

  const continueStory = stories.find(s => {
    const count = getCount(s.id);
    return (s.totalCenas ?? 0) > 0 && count > 0 && count < s.totalCenas;
  });

  function handleCategoryPress(cat) {
    if (!cat.available) {
      setModalCategory(cat);
      return;
    }
    setActiveCategory(cat.id);
  }

  // Scroll to top of list when switching trails
  useEffect(() => {
    outerScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeCategory]);

  // Center active chip in horizontal scroll
  useEffect(() => {
    const layout = chipLayouts.current[activeCategory];
    if (!layout || !chipScrollRef.current) return;
    const scrollX = layout.x + layout.width / 2 - screenWidth / 2;
    chipScrollRef.current.scrollTo({ x: Math.max(0, scrollX), animated: true });
  }, [activeCategory, screenWidth]);

  const activeCat = CATEGORIES.find(c => c.id === activeCategory) ?? CATEGORIES[0];

  const storyListContent = (
    <>
      {!activeCat.available ? (
        <View style={styles.emptyWrap}>
          <LumiEmptyState
            title={`${activeCat.label} está chegando!`}
            message="Esse mundo de aventuras está sendo preparado com muito carinho. Explore as histórias disponíveis enquanto isso!"
          />
        </View>
      ) : catalogEntries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <LumiEmptyState
            title="Em breve mais histórias aqui!"
            message="Novas aventuras estão a caminho. Fique de olho!"
          />
        </View>
      ) : (
        catalogEntries.map((entry, index) => {
          if (entry.type === 'placeholder') {
            return <CatalogCard key={entry.slug} entry={entry} />;
          }
          const item = entry.story;
          const prevEntry = catalogEntries[index - 1];
          const prevStoryId = prevEntry?.type === 'story' ? prevEntry.story.id : null;
          const locked = index > 0 && prevStoryId != null && getCount(prevStoryId) === 0;
          return (
            <StoryCard
              key={String(item.id)}
              story={item}
              locked={locked}
              progressCount={getCount(item.id)}
              onPress={() => navigation.navigate('StoryDetail', { story: item })}
            />
          );
        })
      )}
    </>
  );

  return (
    <View style={styles.screenWrapper}>
      <ScrollView
        ref={outerScrollRef}
        style={styles.container}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── COLUNA ÚNICA CENTRALIZADA ─────────────────────── */}
        <CenteredContent>

          {/* ── HEADER INFANTIL ────────────────────────────── */}
          <View style={styles.screenHeader}>
            <Text style={styles.screenTitle}>Estante de Histórias</Text>
            <Text style={styles.screenSubtitle}>Qual aventura vai abrir hoje?</Text>
          </View>

          {continueStory && (
            <View style={styles.continueBlock}>
              <Text style={styles.continueBlockLabel}>📍 Continue de onde parou</Text>
              <View style={styles.continueCard}>
                <View style={[styles.continueIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={styles.continueEmoji}>{continueStory.emoji}</Text>
                </View>
                <View style={styles.continueInfo}>
                  <Text style={styles.continueTitle} numberOfLines={1}>{continueStory.titulo}</Text>
                  <Text style={styles.continueProgress}>
                    {getCount(continueStory.id)}/{continueStory.totalCenas}{' '}
                    {getCount(continueStory.id) === 1 ? 'cena concluída' : 'cenas concluídas'}
                  </Text>
                  <View style={styles.continueBar}>
                    <View
                      style={[styles.continueBarFill,
                        { width: `${(getCount(continueStory.id) / continueStory.totalCenas) * 100}%` }]}
                    />
                  </View>
                </View>
                <SoundButton
                  style={styles.continueBtn}
                  onPress={() => navigation.navigate('StoryDetail', { story: continueStory })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueBtnText}>▶</Text>
                </SoundButton>
              </View>
            </View>
          )}

          {/* ── TRAIL CHIPS ────────────────────────────────── */}
          <ScrollView
            ref={chipScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.trailScroll}
            contentContainerStyle={styles.trailContent}
          >
            {CATEGORIES.map(cat => {
              const isActive = cat.id === activeCategory;
              return (
                <SoundButton
                  key={cat.id}
                  style={[styles.trailChip, isActive && styles.trailChipActive, !cat.available && styles.trailChipLocked]}
                  onPress={() => handleCategoryPress(cat)}
                  activeOpacity={0.8}
                  onLayout={(e) => { chipLayouts.current[cat.id] = e.nativeEvent.layout; }}
                >
                  <FaithIcon
                    name={cat.faithIcon}
                    size={20}
                    color={isActive ? pt.premiumText : pt.muted}
                  />
                  <Text style={[styles.trailChipLabel, isActive && styles.trailChipLabelActive]}>
                    {cat.label}
                  </Text>
                  <Text style={styles.trailChipDesc} numberOfLines={1}>
                    {cat.shortDesc}
                  </Text>
                  <View style={[
                    styles.trailChipBadge,
                    cat.accessType === 'free' ? styles.trailBadgeFree : styles.trailBadgePremium,
                  ]}>
                    <Text style={[
                      styles.trailChipBadgeText,
                      cat.accessType === 'free' && styles.trailChipBadgeTextFree,
                    ]}>
                      {cat.accessType === 'free' ? 'Grátis' : 'Especial da Família'}
                    </Text>
                  </View>
                  {!cat.available && (
                    <FaithIcon name="lock" size={11} color={pt.muted} style={{ marginTop: 2 }} />
                  )}
                </SoundButton>
              );
            })}
          </ScrollView>

          {/* ── CATEGORY HEADER ────────────────────────────── */}
          <View style={styles.catHeader}>
            <View style={styles.catTitleRow}>
              <FaithIcon name={activeCat.faithIcon} size={18} color={pt.premiumText} />
              <Text style={styles.catTitle}>{activeCat.label}</Text>
              {activeCat.isTrail && (
                <View style={styles.trailBadge}>
                  <Text style={styles.trailBadgeText}>Trilha Guiada</Text>
                </View>
              )}
            </View>
            <Text style={styles.catDesc}>{activeCat.desc}</Text>
          </View>

          {storyListContent}
          <LumiGuideCard context="adventures" style={styles.lumiCard} />
        </CenteredContent>

      </ScrollView>
      <ComingSoonModal category={modalCategory} onClose={() => setModalCategory(null)} />
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  screenWrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: pt.background },

  lumiCard: { marginHorizontal: 16, marginTop: 8, marginBottom: 14 },

  // Screen header (infantile identity)
  screenHeader: { marginHorizontal: 16, marginBottom: 14 },
  screenTitle: { fontFamily: 'FredokaOne', fontSize: 24, color: pt.text, marginBottom: 2 },
  screenSubtitle: { fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft, lineHeight: 20 },

  // Continue block
  continueBlock: { marginHorizontal: 16, marginBottom: 16 },
  continueBlockLabel: {
    fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 8,
  },
  continueCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: radii.lg, padding: 14, gap: 12,
    ...shadows.card,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  continueIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  continueEmoji: { fontSize: 22 },
  continueInfo: { flex: 1 },
  continueTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 2 },
  continueProgress: { fontFamily: 'Nunito', fontSize: 11, color: pt.muted, marginBottom: 6 },
  continueBar: { height: 5, backgroundColor: pt.border, borderRadius: 3, overflow: 'hidden' },
  continueBarFill: { height: '100%', backgroundColor: pt.green, borderRadius: 3 },
  continueBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.action,
    justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: colors.action,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4,
  },
  continueBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },

  // Trail chips
  trailScroll: { flexGrow: 0, marginBottom: 4 },
  trailContent: { paddingHorizontal: 16, gap: 10 },
  trailChip: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5, borderColor: pt.border,
    minWidth: 90,
    gap: 4,
    ...shadows.soft,
  },
  trailChipActive: {
    backgroundColor: pt.goldSoft,
    borderColor: pt.gold,
    elevation: 4, shadowColor: pt.gold, shadowOpacity: 0.2,
  },
  trailChipLocked: { opacity: 0.65 },
  trailChipLabel: {
    fontFamily: 'FredokaOne', fontSize: 12, color: pt.muted, textAlign: 'center',
  },
  trailChipLabelActive: { color: pt.premiumText },
  trailChipDesc: {
    fontFamily: 'Nunito', fontSize: 10, color: pt.muted, textAlign: 'center', lineHeight: 13,
  },
  trailChipBadge: {
    borderRadius: radii.pill, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2,
  },
  trailBadgeFree: { backgroundColor: pt.greenSoft ?? '#E8F5E9' },
  trailBadgePremium: { backgroundColor: pt.goldSoft ?? '#FFF8E1' },
  trailChipBadgeText: {
    fontFamily: 'Nunito', fontSize: 9, color: pt.premiumText, fontWeight: '700',
  },
  trailChipBadgeTextFree: { color: pt.freeText ?? '#388E3C' },

  // Category header
  catHeader: { marginHorizontal: 16, marginTop: 14, marginBottom: 12 },
  catTitleRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 3,
  },
  catTitle: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text },
  trailBadge: {
    backgroundColor: pt.goldSoft, borderRadius: radii.sm,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: pt.gold + '60',
  },
  trailBadgeText: { fontFamily: 'Nunito', fontSize: 10, color: pt.premiumText, fontWeight: '700' },
  catDesc: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19 },

  // Catalog placeholder card
  catalogCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: radii.lg, overflow: 'hidden', opacity: 0.75,
    ...shadows.soft,
  },
  catalogCoverWrap: { width: 80, height: 80 },
  catalogCoverFallback: { width: '100%', height: '100%', borderRadius: 0, borderWidth: 0 },
  catalogCardInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  catalogCardTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 2 },
  catalogCardRef: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.muted, fontStyle: 'italic', marginBottom: 6,
  },
  catalogBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },

  // Empty state
  emptyWrap: { marginHorizontal: 16, marginTop: 8 },

  // Coming soon modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: '#FFF',
    borderRadius: radii.xl, padding: 28,
    alignItems: 'center', width: '100%',
    elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20,
  },
  modalTitle: {
    fontFamily: 'FredokaOne', fontSize: 22, color: pt.text,
    marginBottom: 10, textAlign: 'center', marginTop: 4,
  },
  modalDesc: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft,
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill, paddingVertical: 14, paddingHorizontal: 32,
    width: '100%', alignItems: 'center', elevation: 4,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
  modalBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
});
