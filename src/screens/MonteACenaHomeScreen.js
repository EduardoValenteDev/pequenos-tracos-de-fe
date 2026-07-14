/**
 * MonteACenaHomeScreen.js — GALERIA DE HISTÓRIAS (M1R6 · virtualizada M1R8B). Entrada de "Monte a
 * Cena". A criança escolhe uma HISTÓRIA: 20 histórias em DUAS colunas via FlatList (só a CAPA de cada
 * história é carregada — as cenas dos quadros NÃO são pré-carregadas aqui; o FlatList janela e só monta
 * os cartões próximos da área visível). Coroa discreta no Plano Família; moldura dourada quando a
 * coleção está completa. "Continue montando" só com partida em andamento. Ao final, um cartão discreto
 * "Novos quadros em breve".
 *
 * Fluxo: Home (histórias) → História (quadros) → Mesa do Beni (dificuldade) → rodada. NÃO navega para
 * telas legadas. O laboratório de gestos segue REMOVIDO da Home (M1R5R) — só no Modo Criador.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Image as SvgImage, Rect, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors as pt, radii, shadows } from '../theme/productTheme';
import FaithIcon from '../components/ui/FaithIcon';
import ROUTES from '../constants/routes';
import { useProfile } from '../context/ProfileContext';
import { isPremiumUser } from '../services/accessControl';
import { MONTE_A_CENA_STORIES, getStoryCoverSource, getPuzzleScene, getStoryForScene } from '../data/monteACenaStories';
import { getCompletedList } from '../services/monteACenaGallery';
import { getActiveSession, storyProgressCounts, isStoryComplete, placedOf } from '../services/monteACenaProgress';

function PuzzleGlyphs() {
  return (
    <Svg width={70} height={52} viewBox="0 0 72 54">
      <Rect x="4" y="6" width="28" height="28" rx="7" fill="#C4A8FF" opacity="0.9" />
      <Rect x="30" y="16" width="26" height="26" rx="7" fill="#F9C74F" opacity="0.9" />
      <Path d="M40 6 h20 a4 4 0 0 1 4 4 v14 h-24 z" fill="#90BE6D" opacity="0.85" />
    </Svg>
  );
}

const StoryCard = React.memo(function StoryCard({ story, completedIds, onPress }) {
  const source = getStoryCoverSource(story);
  const scene0 = story.puzzleScenes[0];
  const cp = scene0 ? { x0: scene0.crop.x * scene0.artWidth, y0: scene0.crop.y * scene0.artHeight, w: scene0.crop.w * scene0.artWidth, h: scene0.crop.h * scene0.artHeight } : null;
  const sceneIds = story.puzzleScenes.map((p) => p.puzzleSceneId);
  const { done, total } = storyProgressCounts(sceneIds, completedIds);
  const complete = isStoryComplete(sceneIds, completedIds);
  const cw = 156; const ch = cw * 1.0;
  return (
    <Pressable style={[styles.card, complete && styles.cardComplete]} onPress={onPress} accessibilityRole="button"
      accessibilityLabel={`${story.storyTitle}. ${total} ${total === 1 ? 'quadro' : 'quadros'}. ${done} de ${total} concluídos. ${story.premium ? 'Plano Família.' : ''} Abrir.`}>
      <View style={styles.coverWrap}>
        {source && cp ? (
          <Svg width={cw} height={ch} style={styles.cover}>
            <SvgImage href={source} x={0} y={0} width={cw} height={ch} preserveAspectRatio="xMidYMin slice" viewBox={`${cp.x0} ${cp.y0} ${cp.w} ${cp.h}`} />
          </Svg>
        ) : <View style={[styles.cover, { width: cw, height: ch, backgroundColor: pt.creamStrong }]} />}
        {story.premium && <View style={styles.crown}><FaithIcon name="star" size={13} color="#8A6D1E" /></View>}
        {complete && <View style={styles.doneSeal}><FaithIcon name="check" size={12} color="#FFF" /></View>}
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{story.storyTitle}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.cardCount}>{total} {total === 1 ? 'quadro' : 'quadros'}</Text>
        <Text style={styles.cardDot}>·</Text>
        <Text style={[styles.cardProgress, complete && styles.cardProgressDone]}>{done} de {total}</Text>
      </View>
    </Pressable>
  );
});

function ComingSoonCard() {
  return (
    <View style={styles.comingSoon} accessibilityRole="text">
      <View style={styles.comingSoonIcon}><FaithIcon name="puzzle" size={20} color={pt.purpleDeep} /></View>
      <Text style={styles.comingSoonTitle}>Novos quadros em breve</Text>
      <Text style={styles.comingSoonText}>Continuaremos adicionando novas histórias, momentos e desafios ao Monte a Cena.</Text>
    </View>
  );
}

export default function MonteACenaHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const profileId = (profile && (profile.id || profile.avatarId)) || 'default';
  const premium = isPremiumUser();
  const [completed, setCompleted] = useState([]);
  const [session, setSession] = useState(null);

  useFocusEffect(useCallback(() => {
    let alive = true;
    getCompletedList(profileId).then((list) => { if (alive) setCompleted(list); });
    getActiveSession(profileId).then((s) => { if (alive) setSession(s); });
    return () => { alive = false; };
  }, [profileId]));
  const completedIds = completed.map((c) => c.puzzleSceneId);

  const sessionPlaced = session ? placedOf(session) : 0;
  const sessionScene = session ? getPuzzleScene(session.puzzleSceneId) : null;
  const sessionStory = session ? getStoryForScene(session.puzzleSceneId) : null;
  const sessionSource = sessionScene ? getStoryCoverSource({ puzzleScenes: [sessionScene], coverSceneId: sessionScene.puzzleSceneId }) : null;
  const sessCp = sessionScene ? { x0: sessionScene.crop.x * sessionScene.artWidth, y0: sessionScene.crop.y * sessionScene.artHeight, w: sessionScene.crop.w * sessionScene.artWidth, h: sessionScene.crop.h * sessionScene.artHeight } : null;

  const openStory = useCallback((storyId) => navigation.navigate(ROUTES.MONTE_A_CENA_STORY, { storyId }), [navigation]);
  const renderStory = useCallback(({ item }) => (
    <StoryCard story={item} completedIds={completedIds} onPress={() => openStory(item.storyId)} />
  ), [completedIds, openStory]);

  const header = useMemo(() => (
    <View>
      <View style={styles.hero}>
        <PuzzleGlyphs />
        <View style={styles.heroTexts}>
          <Text style={styles.heroTitle}>Monte a Cena</Text>
          <Text style={styles.heroSub}>Escolha uma história e monte seus momentos favoritos.</Text>
        </View>
      </View>

      {/* Continue montando — só com partida em andamento (resume: restaura ordem+peças, sem novo shuffle) */}
      {session && sessionScene && (
        <Pressable style={styles.resume}
          onPress={() => navigation.navigate(ROUTES.MONTE_A_CENA_TABLE_GAME, { puzzleSceneId: session.puzzleSceneId, pieceCount: session.pieceCount, resume: true })}
          accessibilityRole="button"
          accessibilityLabel={`Continue montando. ${sessionStory ? sessionStory.storyTitle : ''}. ${sessionScene.title}. ${sessionPlaced} de ${session.pieceCount} peças.`}>
          <View style={styles.resumeThumbWrap}>
            {sessionSource && sessCp ? (
              <Svg width={74} height={74} style={styles.resumeThumb}>
                <SvgImage href={sessionSource} x={0} y={0} width={74} height={74} preserveAspectRatio="xMidYMid slice" viewBox={`${sessCp.x0} ${sessCp.y0} ${sessCp.w} ${sessCp.h}`} />
              </Svg>
            ) : <View style={[styles.resumeThumb, { width: 74, height: 74, backgroundColor: pt.creamStrong }]} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeKicker}>Continue montando</Text>
            <Text style={styles.resumeTitle} numberOfLines={1}>{sessionScene.title}</Text>
            {sessionStory && <Text style={styles.resumeStory} numberOfLines={1}>{sessionStory.storyTitle}</Text>}
            <Text style={styles.resumeProgress}>{sessionPlaced} de {session.pieceCount} peças</Text>
          </View>
          <FaithIcon name="play" size={22} color={pt.beniDeep} />
        </Pressable>
      )}

      {/* Meus Quadros */}
      <Pressable style={[styles.galleryCard, !premium && styles.galleryLocked]}
        onPress={() => navigation.navigate(ROUTES.MONTE_A_CENA_GALLERY)}
        accessibilityRole="button"
        accessibilityLabel={premium ? `Meus Quadros. ${completed.length} concluídos.` : 'Meus Quadros. Disponível no Plano Família.'}>
        <View style={styles.galleryIcon}><FaithIcon name="gallery" size={22} color={pt.purpleDeep} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.galleryTitle}>Meus Quadros</Text>
          {premium
            ? <Text style={styles.gallerySub}>{completed.length} {completed.length === 1 ? 'quadro concluído' : 'quadros concluídos'}</Text>
            : <Text style={styles.gallerySub}>Guarde e remonte seus quadros no Plano Família</Text>}
        </View>
        {premium ? <Text style={styles.galleryArrow}>›</Text> : <FaithIcon name="lock" size={18} color={pt.textSoft} />}
      </Pressable>

      <Text style={styles.sectionTitle}>Escolha uma história</Text>
    </View>
  ), [session, sessionScene, sessionStory, sessionSource, sessCp, sessionPlaced, premium, completed.length, navigation]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backPill} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
        <View style={{ width: 60 }} />
      </View>

      {/* GALERIA VIRTUALIZADA: 20 histórias, só a CAPA de cada uma (não pré-carrega os 200 quadros) */}
      <FlatList
        data={MONTE_A_CENA_STORIES}
        keyExtractor={(item) => item.storyId}
        renderItem={renderStory}
        numColumns={2}
        columnWrapperStyle={styles.column}
        ListHeaderComponent={header}
        ListFooterComponent={ComingSoonCard}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  backPill: { backgroundColor: 'rgba(124,58,237,0.10)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  backText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },

  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: pt.cream, borderRadius: radii.lg + 4, padding: 16, marginBottom: 14, ...shadows.soft },
  heroTexts: { flex: 1 },
  heroTitle: { fontFamily: 'FredokaOne', fontSize: 22, color: pt.text, marginBottom: 4 },
  heroSub: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: pt.textSoft, lineHeight: 17 },

  resume: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: pt.beniSoft, borderRadius: radii.lg + 2, borderWidth: 1.5, borderColor: '#F6C9A8', padding: 12, marginBottom: 14, ...shadows.card },
  resumeThumbWrap: { borderRadius: 14, overflow: 'hidden', ...shadows.soft },
  resumeThumb: { borderRadius: 14 },
  resumeKicker: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.beniDeep, textTransform: 'uppercase', letterSpacing: 0.4 },
  resumeTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginTop: 1 },
  resumeStory: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: pt.textSoft },
  resumeProgress: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.beniDeep, marginTop: 2 },

  galleryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F3E8FF', borderRadius: radii.lg, borderWidth: 1.5, borderColor: '#D7C2F5', padding: 14, marginBottom: 16, ...shadows.soft },
  galleryLocked: { opacity: 0.9 },
  galleryIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E7DEFB', alignItems: 'center', justifyContent: 'center' },
  galleryTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  gallerySub: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: pt.textSoft, marginTop: 2 },
  galleryArrow: { fontFamily: 'FredokaOne', fontSize: 22, color: pt.purpleDeep },

  sectionTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginBottom: 12, marginLeft: 4 },
  column: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#FFFDF7', borderRadius: radii.lg + 2, borderWidth: 2, borderColor: '#F0D9A0', padding: 8, marginBottom: 14, ...shadows.card },
  cardComplete: { borderColor: pt.goldDeep, borderWidth: 2.5, backgroundColor: '#FFFBF0' },
  coverWrap: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFFFFF', ...shadows.soft },
  cover: { borderRadius: 12 },
  crown: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,243,204,0.96)', alignItems: 'center', justifyContent: 'center' },
  doneSeal: { position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: pt.greenDeep, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginTop: 8, marginLeft: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, marginLeft: 2, marginBottom: 2 },
  cardCount: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.textSoft },
  cardDot: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted },
  cardProgress: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.faithBlue },
  cardProgressDone: { color: pt.greenDeep },

  comingSoon: { backgroundColor: pt.lilac, borderRadius: radii.lg, borderWidth: 1, borderColor: '#E2D6F7', padding: 16, marginTop: 2, alignItems: 'center' },
  comingSoonIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E7DEFB', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  comingSoonTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.purpleDeep, marginBottom: 4 },
  comingSoonText: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: pt.textSoft, textAlign: 'center', lineHeight: 17 },
});
