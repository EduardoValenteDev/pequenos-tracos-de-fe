/**
 * AdventureMapScreen — Mapa Pergaminho (M2, visual real).
 *
 * É a experiência da aba Aventuras. Mapa vertical com as imagens REAIS de
 * assets/maps/ como fundo das 4 regiões, caminho SVG (trilha), marcos grandes
 * com as capas oficiais, e um CARD DE FOCO (estilo Livrinho) ao tocar.
 *
 * Tudo aqui é leitura: estados e revelação A/B derivam de serviços EXISTENTES
 * (contentAccessService + ProgressContext). Nenhuma regra de paywall/mídia/
 * progresso é alterada, e nenhuma história hoje bloqueada é liberada. O toque
 * abre o modal; a navegação para a história continua sendo a de antes —
 * navigate('StoryDetail', { story }) — disparada pelo BOTÃO do modal.
 */
import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { getAdventureRegions, getOrderedAdventureStories } from '../data/adventureMap';
import { getStoryAccessStatus, getStoryLockReason } from '../services/contentAccessService';
import { useProgressContext } from '../context/ProgressContext';
import MapRegion from '../components/map/MapRegion';
import NextAdventureBanner from '../components/map/NextAdventureBanner';
import StoryFocusModal from '../components/map/StoryFocusModal';

export default function AdventureMapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isStoryCompleted, getStoryCompletionPercent } = useProgressContext();

  const regions = useMemo(() => getAdventureRegions(), []);
  const ordered = useMemo(() => getOrderedAdventureStories(), []);

  // Foco: toque abre o modal; navegação acontece pelo botão do modal.
  const [focusStory, setFocusStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Aberto = mídia pronta + plano ok (regra existente). NÃO libera bloqueada.
  const isOpenable = useCallback((story) => getStoryAccessStatus(story) === 'full', []);

  // Marco atual = primeira história aberta e ainda não concluída (próxima da trilha).
  const currentId = useMemo(() => {
    const next = ordered.find((s) => isOpenable(s) && !isStoryCompleted(s.id));
    return next ? next.id : null;
  }, [ordered, isOpenable, isStoryCompleted]);

  const getState = useCallback(
    (story) => {
      if (isStoryCompleted(story.id)) return 'completed';
      if (story.id === currentId) return 'current';
      return isOpenable(story) ? 'available' : 'locked';
    },
    [currentId, isOpenable, isStoryCompleted],
  );

  // Revelação A/B: região "desperta" (B) quando já tem progresso relevante
  // (ao menos uma história concluída); senão "adormecida" (A). Regra simples e
  // segura — ambas as imagens já estão importadas.
  const isRegionAwake = useCallback(
    (region) => (region.stories || []).some((s) => isStoryCompleted(s.id)),
    [isStoryCompleted],
  );

  const openFocus = useCallback((story) => {
    setFocusStory(story);
    setModalVisible(true);
  }, []);

  const closeFocus = useCallback(() => setModalVisible(false), []);

  const confirmOpenStory = useCallback(() => {
    const story = focusStory;
    setModalVisible(false);
    if (story) navigation.navigate('StoryDetail', { story });
  }, [focusStory, navigation]);

  // Alvo da faixa: o marco atual; se tudo concluído, convida a revisitar.
  const currentStory = useMemo(() => ordered.find((s) => s.id === currentId), [ordered, currentId]);
  const allDone = !currentStory;
  const bannerStory = currentStory || ordered.find(isOpenable) || ordered[0];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 6 }]}>
        <Text style={styles.headerTitle}>Mapa das Aventuras</Text>
        <Text style={styles.headerSub}>Siga o caminho e descubra cada história ✨</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {regions.map((region) => (
          <MapRegion
            key={region.id}
            region={region}
            width={width}
            awake={isRegionAwake(region)}
            getState={getState}
            onPressStory={openFocus}
          />
        ))}

        <NextAdventureBanner
          story={bannerStory}
          allDone={allDone}
          onPress={() => bannerStory && openFocus(bannerStory)}
        />
      </ScrollView>

      <StoryFocusModal
        visible={modalVisible}
        story={focusStory}
        state={focusStory ? getState(focusStory) : 'locked'}
        lockReason={focusStory ? getStoryLockReason(focusStory) : null}
        progressPercent={focusStory ? getStoryCompletionPercent(focusStory.id) : 0}
        onClose={closeFocus}
        onOpen={confirmOpenStory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2B2114' },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,90,40,0.10)',
  },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 20, color: colors.text },
  headerSub: { fontFamily: 'Nunito', fontSize: 13, color: '#7A6A4E', fontWeight: '700', marginTop: 2 },
});
