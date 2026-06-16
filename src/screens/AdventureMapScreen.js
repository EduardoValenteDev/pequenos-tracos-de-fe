/**
 * AdventureMapScreen — Mapa Pergaminho (M2.2).
 *
 * É a experiência da aba Aventuras: mapa vertical com as imagens REAIS de
 * assets/maps/ (A=desperta/colorida, B=adormecida), caminho SVG e card de foco.
 *
 * JORNADA DE BAIXO PARA CIMA: as regiões são renderizadas invertidas (topo =
 * Jovens da Fé, base = Comece Aqui), e a câmera inicial parte da BASE (onde está
 * `creation`) com um pequeno "passo" para cima. A ordem LÓGICA dos dados continua
 * a original (creation primeiro) para detectar a próxima aventura.
 *
 * Tudo é leitura: estados e revelação A/B derivam de serviços EXISTENTES
 * (contentAccessService + ProgressContext). O toque abre o modal; a navegação
 * para a história continua sendo navigate('StoryDetail', { story }), no botão.
 */
import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Entrada mágica: fade-in + leve slide do mapa ao abrir (curto, uma vez).
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [entrance]);
  const entranceTranslate = entrance.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  const regions = useMemo(() => getAdventureRegions(), []);
  // Ordem VISUAL invertida: topo = última região, base = comece_aqui.
  const regionsVisual = useMemo(() => regions.slice().reverse(), [regions]);
  const ordered = useMemo(() => getOrderedAdventureStories(), []);

  const [focusStory, setFocusStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isOpenable = useCallback((story) => getStoryAccessStatus(story) === 'full', []);

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

  // A/B: região DESPERTA (A) quando a criança engajou (concluída, com progresso,
  // ou contém a história atual); senão ADORMECIDA (B). Só leitura, sem paywall novo.
  const isRegionAwake = useCallback(
    (region) =>
      (region.stories || []).some(
        (s) => isStoryCompleted(s.id) || getStoryCompletionPercent(s.id) > 0 || s.id === currentId,
      ),
    [isStoryCompleted, getStoryCompletionPercent, currentId],
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

  const currentStory = useMemo(() => ordered.find((s) => s.id === currentId), [ordered, currentId]);
  const allDone = !currentStory;
  const bannerStory = currentStory || ordered.find(isOpenable) || ordered[0];

  // Câmera inicial: começa na BASE (entrada da jornada, onde está creation) e dá
  // um pequeno "passo" para cima — sensação de subir o caminho.
  const scrollRef = useRef(null);
  const scrollViewH = useRef(0);
  const didInitScroll = useRef(false);
  const onScrollLayout = useCallback((e) => { scrollViewH.current = e.nativeEvent.layout.height; }, []);
  const onContentSize = useCallback((w, h) => {
    if (didInitScroll.current || scrollViewH.current <= 0) return;
    didInitScroll.current = true;
    const bottomY = Math.max(0, h - scrollViewH.current);
    scrollRef.current?.scrollTo({ y: bottomY, animated: false });
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, bottomY - 120), animated: true });
    }, 480);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F4E6C8', '#E8D3A6']}
        style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 6 }]}
      >
        <Text style={styles.headerTitle}>Mapa das Aventuras</Text>
        <Text style={styles.headerSub}>Suba o caminho e descubra cada história ✨</Text>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: entrance, transform: [{ translateY: entranceTranslate }] }}>
        <ScrollView
          ref={scrollRef}
          onLayout={onScrollLayout}
          onContentSizeChange={onContentSize}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {regionsVisual.map((region, idx) => (
            <MapRegion
              key={region.id}
              region={region}
              width={width}
              awake={isRegionAwake(region)}
              currentStoryId={currentId}
              isTop={idx === 0}
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
      </Animated.View>

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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,90,40,0.25)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 21, color: '#5A4420' },
  headerSub: { fontFamily: 'Nunito', fontSize: 13, color: '#7A6238', fontWeight: '700', marginTop: 2 },
});
