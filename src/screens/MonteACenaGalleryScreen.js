/**
 * MonteACenaGalleryScreen.js — "Meus Quadros" ORGANIZADO POR HISTÓRIA (M1R6 · virtualizado M1R8B).
 * Só as histórias que têm ≥1 quadro concluído aparecem (via FlatList, seções janeladas). Concluídos
 * mostram a cena (imagem reutilizada do catálogo por puzzleSceneId — SEM cópia); não concluídos ficam
 * como molduras vazias suaves. EXCLUSIVO do Plano Família. No plano grátis, bloqueio GENTIL.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Image as SvgImage } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors as pt, radii, shadows } from '../theme/productTheme';
import FaithIcon from '../components/ui/FaithIcon';
import ROUTES from '../constants/routes';
import { useProfile } from '../context/ProfileContext';
import { isPremiumUser } from '../services/accessControl';
import { getCompletedList } from '../services/monteACenaGallery';
import { MONTE_A_CENA_STORIES, getStorySceneSource } from '../data/monteACenaStories';
import { storyProgressCounts } from '../services/monteACenaProgress';

const QuadroFrame = React.memo(function QuadroFrame({ scene, counts, onPress }) {
  const done = !!counts;
  const source = done ? getStorySceneSource(scene) : null;
  const cp = { x0: scene.crop.x * scene.artWidth, y0: scene.crop.y * scene.artHeight, w: scene.crop.w * scene.artWidth, h: scene.crop.h * scene.artHeight };
  const w = 150; const h = w * 1.0;
  return (
    <Pressable style={[styles.frame, done ? styles.frameDone : styles.frameEmpty]} onPress={done ? onPress : undefined} disabled={!done}
      accessibilityRole="button" accessibilityLabel={done ? `${scene.title}. Concluído. Montar novamente.` : `${scene.title}. Ainda não concluído.`}>
      {done && source ? (
        <Svg width={w} height={h} style={styles.frameImg}>
          <SvgImage href={source} x={0} y={0} width={w} height={h} preserveAspectRatio="xMidYMin slice" viewBox={`${cp.x0} ${cp.y0} ${cp.w} ${cp.h}`} />
        </Svg>
      ) : (
        <View style={[styles.frameImg, styles.emptyArt, { width: w, height: h }]}>
          <FaithIcon name="puzzle" size={26} color="#D8C7A6" />
        </View>
      )}
      <Text style={[styles.frameTitle, !done && styles.frameTitleEmpty]} numberOfLines={1}>{scene.title}</Text>
      {done ? <Text style={styles.frameMeta}>{counts.join(' · ')} peças</Text> : <Text style={styles.frameMetaEmpty}>Ainda não concluído</Text>}
    </Pressable>
  );
});

export default function MonteACenaGalleryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const profileId = (profile && (profile.id || profile.avatarId)) || 'default';
  const premium = isPremiumUser();
  const [completedMap, setCompletedMap] = useState({});
  const [completedIds, setCompletedIds] = useState([]);

  useFocusEffect(useCallback(() => {
    if (!premium) return undefined;
    let alive = true;
    getCompletedList(profileId).then((list) => {
      if (!alive) return;
      const m = {}; list.forEach((c) => { m[c.puzzleSceneId] = c.completedPieceCounts || []; });
      setCompletedMap(m); setCompletedIds(list.map((c) => c.puzzleSceneId));
    });
    return () => { alive = false; };
  }, [premium, profileId]));

  const anyDone = completedIds.length > 0;
  // Só histórias com ≥1 quadro concluído (relevância + performance: não monta 200 molduras).
  const storiesWithProgress = useMemo(
    () => MONTE_A_CENA_STORIES.filter((s) => s.puzzleScenes.some((p) => completedIds.includes(p.puzzleSceneId))),
    [completedIds],
  );

  const renderStorySection = useCallback(({ item: story }) => {
    const ids = story.puzzleScenes.map((p) => p.puzzleSceneId);
    const { done, total } = storyProgressCounts(ids, completedIds);
    return (
      <View style={styles.storySection}>
        <View style={styles.storyHead}>
          <Text style={styles.storyName}>{story.storyTitle}</Text>
          <Text style={styles.storyCount}>{done} de {total}</Text>
        </View>
        <View style={styles.grid}>
          {story.puzzleScenes.map((scene) => (
            <QuadroFrame key={scene.puzzleSceneId} scene={scene} counts={completedMap[scene.puzzleSceneId]}
              onPress={() => navigation.navigate(ROUTES.MONTE_A_CENA_DIFFICULTY, { puzzleSceneId: scene.puzzleSceneId, storyId: story.storyId })} />
          ))}
        </View>
      </View>
    );
  }, [completedIds, completedMap, navigation]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backPill} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.title}>Meus Quadros</Text>
        <View style={{ width: 60 }} />
      </View>

      {!premium ? (
        <View style={styles.lockedBox}>
          <FaithIcon name="lock" size={34} color={pt.purple} />
          <Text style={styles.lockedTitle}>Guarde seus quadros</Text>
          <Text style={styles.lockedText}>Com o Plano Família, você pode guardar seus quadros e montá-los sempre que quiser. Você pode continuar montando à vontade — só o guardar fica para o Plano Família.</Text>
        </View>
      ) : !anyDone ? (
        <View style={styles.emptyHint}>
          <FaithIcon name="gallery" size={30} color={pt.purple} />
          <Text style={styles.emptyHintText}>Monte um quadro até o fim para guardá-lo aqui. Ele aparece na história certinha.</Text>
        </View>
      ) : (
        <FlatList
          data={storiesWithProgress}
          keyExtractor={(item) => item.storyId}
          renderItem={renderStorySection}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backPill: { backgroundColor: 'rgba(124,58,237,0.10)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  backText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  title: { flex: 1, textAlign: 'center', fontFamily: 'FredokaOne', fontSize: 18, color: pt.text },

  lockedBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 10 },
  lockedTitle: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginTop: 6 },
  lockedText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '700', color: pt.textSoft, textAlign: 'center', lineHeight: 20 },

  emptyHint: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: pt.lilac, borderRadius: radii.lg, padding: 14, marginBottom: 8 },
  emptyHintText: { flex: 1, fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.textSoft, lineHeight: 19 },

  storySection: { marginTop: 14 },
  storyHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginHorizontal: 2 },
  storyName: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text },
  storyCount: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.goldDeep },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  frame: { width: '47%', borderRadius: radii.lg, padding: 8, marginBottom: 12, alignItems: 'center' },
  frameDone: { backgroundColor: '#FFFDF7', borderWidth: 2, borderColor: pt.goldDeep, ...shadows.card },
  frameEmpty: { backgroundColor: '#F7F2E9', borderWidth: 2, borderColor: '#E7DCC8', borderStyle: 'dashed' },
  frameImg: { borderRadius: 10 },
  emptyArt: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0E8D8' },
  frameTitle: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.text, marginTop: 8 },
  frameTitleEmpty: { color: pt.muted },
  frameMeta: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', color: pt.textSoft, marginTop: 2 },
  frameMetaEmpty: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', color: pt.muted, marginTop: 2 },
});
