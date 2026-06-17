/**
 * AdventureMapScreen — Mapa Pergaminho (M2.3).
 *
 * Aba Aventuras: mapa vertical com as imagens REAIS de assets/maps/ (A=desperta,
 * B=adormecida), caminho SVG e card de foco. JORNADA DE BAIXO PARA CIMA: regiões
 * renderizadas invertidas (topo = Jovens da Fé, base = Comece Aqui); a câmera
 * inicial parte da BASE (creation) com um pequeno passo para cima.
 *
 * Uma PÍLULA de região acompanha a rolagem (mostra em qual jornada a criança
 * está). Sem CTA inferior. Tudo é leitura (contentAccessService + ProgressContext);
 * o toque abre o modal e a navegação continua navigate('StoryDetail', { story }).
 */
import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getAdventureRegions, getOrderedAdventureStories, computeRegionHeight } from '../data/adventureMap';
import { getStoryAccessStatus, getStoryLockReason } from '../services/contentAccessService';
import { useProgressContext } from '../context/ProgressContext';
import MapRegion from '../components/map/MapRegion';
import StoryFocusModal from '../components/map/StoryFocusModal';

const REGION_OVERLAP = 28; // deve casar com OVERLAP de MapRegion

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

  // Render progressivo: as regiões de BAIXO (onde a câmera começa) montam a arte
  // primeiro; as de cima entram pouco depois — evita montar 4 imagens pesadas de
  // uma vez (lentidão/flash). O placeholder de pergaminho segura a altura.
  const [mountedAll, setMountedAll] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMountedAll(true), 260);
    return () => clearTimeout(t);
  }, []);

  const regions = useMemo(() => getAdventureRegions(), []);
  // Ordem VISUAL invertida: topo = última região, base = comece_aqui.
  const regionsVisual = useMemo(() => regions.slice().reverse(), [regions]);
  const ordered = useMemo(() => getOrderedAdventureStories(), []);

  // Layout das regiões (offsets) para a pílula de região acompanhar a rolagem.
  const regionLayout = useMemo(() => {
    const arr = [];
    let prevBottom = 0;
    regionsVisual.forEach((r, i) => {
      const h = computeRegionHeight(width);
      const top = i === 0 ? 0 : prevBottom - REGION_OVERLAP;
      arr.push({ id: r.id, title: r.title, top, height: h });
      prevBottom = top + h;
    });
    return arr;
  }, [regionsVisual, width]);

  // Pílula começa na base (comece_aqui), pois a câmera inicia embaixo.
  const [activeRegionTitle, setActiveRegionTitle] = useState(
    () => regionsVisual[regionsVisual.length - 1]?.title ?? '',
  );

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

  // Câmera inicial: começa na BASE (creation) e dá um pequeno passo para cima.
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

  // Atualiza a pílula de região conforme a rolagem (só quando muda — leve).
  const onScroll = useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y + 90; // sonda perto do topo do viewport
    let title = regionLayout[regionLayout.length - 1]?.title ?? '';
    for (const r of regionLayout) {
      if (y >= r.top && y < r.top + r.height) { title = r.title; break; }
    }
    setActiveRegionTitle((prev) => (prev === title ? prev : title));
  }, [regionLayout]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F4E6C8', '#E8D3A6']} style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 4 }]}>
        <Text style={styles.headerTitle}>Mapa das Aventuras</Text>
        <Text style={styles.headerSub}>Suba o caminho da fé ✨</Text>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: entrance, transform: [{ translateY: entranceTranslate }] }}>
        <ScrollView
          ref={scrollRef}
          onLayout={onScrollLayout}
          onContentSizeChange={onContentSize}
          onScroll={onScroll}
          scrollEventThrottle={32}
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
              // Bottom 2 (base, onde a câmera começa) primeiro; o resto após o tick.
              renderImage={idx >= regionsVisual.length - 2 || mountedAll}
              getState={getState}
              onPressStory={openFocus}
            />
          ))}
        </ScrollView>

        {/* Pílula de região que acompanha a rolagem (não cobre marcos) */}
        <View style={styles.regionPillWrap} pointerEvents="none">
          <View style={styles.regionPill}>
            <Text style={styles.regionPillText}>{activeRegionTitle}</Text>
          </View>
        </View>
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
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,90,40,0.22)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
  },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 20, color: '#5A4420' },
  headerSub: { fontFamily: 'Nunito', fontSize: 12.5, color: '#7A6238', fontWeight: '700', marginTop: 1 },
  regionPillWrap: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center', zIndex: 5 },
  regionPill: {
    backgroundColor: 'rgba(40,30,15,0.62)',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,236,190,0.35)',
  },
  regionPillText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF1D6' },
});
