/**
 * AdventureMapScreen — Mapa Pergaminho (M1, esqueleto funcional).
 *
 * É a NOVA experiência da aba Aventuras (substitui a lista de cards). Mapa
 * vertical com scroll, 4 regiões (fundo provisório por código), caminho SVG,
 * marcos de histórias com 3 estados e faixa de convite no rodapé.
 *
 * Tudo aqui é leitura: os estados dos marcos derivam de serviços EXISTENTES
 * (contentAccessService + ProgressContext). Nenhuma regra de paywall/mídia/
 * progresso é alterada, e nenhuma história hoje bloqueada é liberada. Tocar num
 * marco usa o MESMO fluxo de antes: navigate('StoryDetail', { story }).
 *
 * M1 não importa assets/maps/ nem os Benis novos — isso entra em M2/M3.
 */
import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { getAdventureRegions, getOrderedAdventureStories } from '../data/adventureMap';
import { getStoryAccessStatus } from '../services/contentAccessService';
import { useProgressContext } from '../context/ProgressContext';
import MapRegion from '../components/map/MapRegion';
import NextAdventureBanner from '../components/map/NextAdventureBanner';

export default function AdventureMapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isStoryCompleted } = useProgressContext();

  const regions = useMemo(() => getAdventureRegions(), []);
  const ordered = useMemo(() => getOrderedAdventureStories(), []);

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

  const openStory = useCallback(
    (story) => navigation.navigate('StoryDetail', { story }),
    [navigation],
  );

  // Alvo da faixa de convite: o marco atual; se tudo concluído, convida a revisitar.
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
            getState={getState}
            onPressStory={openStory}
          />
        ))}

        <NextAdventureBanner
          story={bannerStory}
          allDone={allDone}
          onPress={() => bannerStory && openStory(bannerStory)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF4E6' },
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
