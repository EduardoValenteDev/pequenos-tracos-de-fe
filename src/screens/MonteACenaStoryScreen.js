/**
 * MonteACenaStoryScreen.js — TELA DA HISTÓRIA (M1R6 · virtualizada M1R8B). Mostra os quadros de UMA
 * história (de 1 a 10) em DUAS colunas via FlatList — só as MINIATURAS visíveis são montadas (janela
 * do FlatList). Imagens grandes, título curto, estado (Novo / Em andamento / Concluído), dificuldades
 * concluídas, coroa discreta no Plano Família. A tela CRESCE conforme a quantidade disponível — SEM
 * moldura vazia para completar grade artificial. No cabeçalho: "N quadros disponíveis" + progresso.
 *
 * Ao tocar num quadro premium no plano grátis: comunicação gentil (sem venda agressiva) e retorno
 * imediato à coleção — a criança NÃO é tirada da história. Quadros acessíveis → Mesa do Beni.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Image as SvgImage } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors as pt, radii, shadows } from '../theme/productTheme';
import FaithIcon from '../components/ui/FaithIcon';
import ROUTES from '../constants/routes';
import { useProfile } from '../context/ProfileContext';
import { isPremiumUser } from '../services/accessControl';
import { getStory, getStorySceneSource } from '../data/monteACenaStories';
import { getCompletedList } from '../services/monteACenaGallery';
import { getActiveSession, quadroState, storyProgressCounts, isStoryComplete } from '../services/monteACenaProgress';

const QuadroCard = React.memo(function QuadroCard({ scene, state, counts, premiumLocked, onPress }) {
  const source = getStorySceneSource(scene);
  const cp = { x0: scene.crop.x * scene.artWidth, y0: scene.crop.y * scene.artHeight, w: scene.crop.w * scene.artWidth, h: scene.crop.h * scene.artHeight };
  const cw = 156; const ch = cw * 1.0;
  const done = state === 'concluido';
  const inProgress = state === 'andamento';
  return (
    <Pressable style={[styles.card, done && styles.cardDone]} onPress={onPress} accessibilityRole="button"
      accessibilityLabel={`${scene.title}. ${done ? 'Concluído' : inProgress ? 'Em andamento' : 'Novo'}.${premiumLocked ? ' Plano Família.' : ''} Montar.`}>
      <View style={styles.coverWrap}>
        {source ? (
          <Svg width={cw} height={ch} style={styles.cover}>
            <SvgImage href={source} x={0} y={0} width={cw} height={ch} preserveAspectRatio="xMidYMin slice" viewBox={`${cp.x0} ${cp.y0} ${cp.w} ${cp.h}`} />
          </Svg>
        ) : <View style={[styles.cover, { width: cw, height: ch, backgroundColor: pt.creamStrong }]} />}
        {premiumLocked && <View style={styles.crown}><FaithIcon name="star" size={13} color="#8A6D1E" /></View>}
        {done && <View style={styles.doneSeal}><FaithIcon name="check" size={12} color="#FFF" /></View>}
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{scene.title}</Text>
      <View style={styles.stateRow}>
        {done ? (
          <View style={[styles.chip, styles.chipDone]}><Text style={styles.chipDoneText}>Concluído</Text></View>
        ) : inProgress ? (
          <View style={[styles.chip, styles.chipProgress]}><Text style={styles.chipProgressText}>Em andamento</Text></View>
        ) : (
          <View style={[styles.chip, styles.chipNew]}><Text style={styles.chipNewText}>Novo</Text></View>
        )}
        {done && counts && counts.length > 0 && (
          <Text style={styles.countsText}>{counts.join(' · ')} peças</Text>
        )}
      </View>
    </Pressable>
  );
});

export default function MonteACenaStoryScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const profileId = (profile && (profile.id || profile.avatarId)) || 'default';
  const premium = isPremiumUser();
  const story = getStory(route?.params?.storyId);
  const [completed, setCompleted] = useState([]);
  const [session, setSession] = useState(null);
  const [lockedNotice, setLockedNotice] = useState(false);

  useFocusEffect(useCallback(() => {
    let alive = true;
    getCompletedList(profileId).then((list) => { if (alive) setCompleted(list); });
    getActiveSession(profileId).then((s) => { if (alive) setSession(s); });
    return () => { alive = false; };
  }, [profileId]));

  if (!story) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backPill} onPress={() => navigation.goBack()} hitSlop={8}><Text style={styles.backText}>‹ Voltar</Text></Pressable>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.err}>História não encontrada.</Text>
      </View>
    );
  }

  const completedMap = {};
  completed.forEach((c) => { completedMap[c.puzzleSceneId] = c.completedPieceCounts || []; });
  const completedIds = completed.map((c) => c.puzzleSceneId);
  const sceneIds = story.puzzleScenes.map((p) => p.puzzleSceneId);
  const { done, total } = storyProgressCounts(sceneIds, completedIds);
  const collectionComplete = isStoryComplete(sceneIds, completedIds);

  const openQuadro = useCallback((scene) => {
    if (scene.premium && !premium) { setLockedNotice(true); return; }
    navigation.navigate(ROUTES.MONTE_A_CENA_DIFFICULTY, { puzzleSceneId: scene.puzzleSceneId, storyId: story.storyId });
  }, [premium, navigation, story]);

  const renderQuadro = useCallback(({ item }) => (
    <QuadroCard scene={item}
      state={quadroState(item.puzzleSceneId, completedIds, session)}
      counts={completedMap[item.puzzleSceneId]}
      premiumLocked={item.premium && !premium}
      onPress={() => openQuadro(item)} />
  ), [completedIds, session, completedMap, premium, openQuadro]);

  const listHeader = useMemo(() => (
    <View>
      <Text style={styles.phrase}>{story.collectionPhrase}</Text>
      <View style={styles.progressRow}>
        <View style={styles.availPill}><Text style={styles.availText}>{total} {total === 1 ? 'quadro disponível' : 'quadros disponíveis'}</Text></View>
        {done > 0 && (
          <View style={[styles.progressPill, collectionComplete && styles.progressPillDone]}>
            <Text style={[styles.progressText, collectionComplete && styles.progressTextDone]}>{done} de {total} concluídos</Text>
          </View>
        )}
        {collectionComplete && (
          <View style={styles.collComplete}><FaithIcon name="star" size={14} color={pt.goldDeep} /><Text style={styles.collCompleteText}>Coleção completa!</Text></View>
        )}
      </View>
    </View>
  ), [story.collectionPhrase, total, done, collectionComplete]);

  const listFooter = story.quadrosTotal < story.quadrosTarget
    ? <Text style={styles.moreSoon}>Mais quadros desta história chegam em breve.</Text>
    : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backPill} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{story.storyTitle}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* grade VIRTUALIZADA: 1 a 10 quadros, sem molduras vazias; cresce conforme o disponível */}
      <FlatList
        data={story.puzzleScenes}
        keyExtractor={(item) => item.puzzleSceneId}
        renderItem={renderQuadro}
        numColumns={2}
        columnWrapperStyle={styles.column}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />

      <Modal visible={lockedNotice} transparent animationType="fade" onRequestClose={() => setLockedNotice(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setLockedNotice(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalCrown}><FaithIcon name="star" size={22} color={pt.goldDeep} /></View>
            <Text style={styles.modalTitle}>Um quadro do Plano Família</Text>
            <Text style={styles.modalText}>Este quadro faz parte do Plano Família. Você pode voltar e montar os quadros disponíveis quando quiser.</Text>
            <Pressable style={styles.modalBtn} onPress={() => setLockedNotice(false)} accessibilityRole="button" accessibilityLabel="Voltar para a história">
              <Text style={styles.modalBtnText}>Voltar para a história</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  err: { fontFamily: 'Nunito', fontSize: 15, color: pt.textSoft, textAlign: 'center', marginTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backPill: { backgroundColor: 'rgba(124,58,237,0.10)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  backText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  title: { flex: 1, textAlign: 'center', fontFamily: 'FredokaOne', fontSize: 18, color: pt.text },

  phrase: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '700', color: pt.textSoft, lineHeight: 20, marginTop: 2, marginBottom: 12, marginHorizontal: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14, marginHorizontal: 4 },
  availPill: { backgroundColor: pt.lilac, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 5 },
  availText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  progressPill: { backgroundColor: pt.faithBlueSoft, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 5 },
  progressPillDone: { backgroundColor: pt.goldSoft },
  progressText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.faithBlue },
  progressTextDone: { color: pt.goldDeep },
  collComplete: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  collCompleteText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.goldDeep },

  column: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#FFFDF7', borderRadius: radii.lg + 2, borderWidth: 2, borderColor: '#F0D9A0', padding: 8, marginBottom: 14, ...shadows.card },
  cardDone: { borderColor: pt.goldDeep, borderWidth: 2.5, backgroundColor: '#FFFBF0' },
  coverWrap: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFFFFF', ...shadows.soft },
  cover: { borderRadius: 12 },
  crown: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,243,204,0.96)', alignItems: 'center', justifyContent: 'center' },
  doneSeal: { position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: pt.greenDeep, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginTop: 8, marginLeft: 2 },
  stateRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4, marginLeft: 2, marginBottom: 2 },
  chip: { borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 3 },
  chipNew: { backgroundColor: pt.faithBlueSoft },
  chipNewText: { fontFamily: 'FredokaOne', fontSize: 10, color: pt.faithBlue },
  chipProgress: { backgroundColor: pt.beniSoft },
  chipProgressText: { fontFamily: 'FredokaOne', fontSize: 10, color: pt.beniDeep },
  chipDone: { backgroundColor: pt.greenSoft },
  chipDoneText: { fontFamily: 'FredokaOne', fontSize: 10, color: pt.greenDeep },
  countsText: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', color: pt.textSoft },
  moreSoon: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.muted, textAlign: 'center', marginTop: 4 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(24,18,40,0.42)', alignItems: 'center', justifyContent: 'center', padding: 30 },
  modalCard: { backgroundColor: '#FFFDF7', borderRadius: radii.xl, padding: 22, alignItems: 'center', maxWidth: 340, ...shadows.card },
  modalCrown: { width: 48, height: 48, borderRadius: 24, backgroundColor: pt.goldSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  modalTitle: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 6, textAlign: 'center' },
  modalText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '700', color: pt.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  modalBtn: { backgroundColor: pt.purple, borderRadius: radii.pill, paddingHorizontal: 26, paddingVertical: 12 },
  modalBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
});
