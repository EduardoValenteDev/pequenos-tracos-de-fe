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
import { View, Text, Image, Modal, Pressable, StyleSheet, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getAdventureRegions, getOrderedAdventureStories, computeRegionHeight, getStoryMapCoord, MAP_ASPECT, REGION_PARCHMENT_BG } from '../data/adventureMap';
import { getStoryAccessStatus, getStoryLockReason } from '../services/contentAccessService';
import { useProgressContext } from '../context/ProgressContext';
import SoundButton from '../components/SoundButton';
import MapRegion from '../components/map/MapRegion';
import StoryFocusModal from '../components/map/StoryFocusModal';

const REGION_OVERLAP = 28; // deve casar com OVERLAP de MapRegion

export default function AdventureMapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { isStoryCompleted, getStoryCompletionPercent } = useProgressContext();

  // Entrada: o mapa abre JÁ VISÍVEL (opacity 1 desde o 1º frame). Mantemos só um
  // translateY levíssimo de charme — o mapa NUNCA fica invisível.
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, [entrance]);
  const entranceTranslate = entrance.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

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
      arr.push({ id: r.id, title: r.title, top, height: h, count: (r.stories || []).length });
      prevBottom = top + h;
    });
    return arr;
  }, [regionsVisual, width]);

  // Região ativa (índice visual). Começa na base (comece_aqui), pois a câmera
  // inicia embaixo. Usada pela pílula de orientação e pelo modo "Ver mapa".
  const [activeIdx, setActiveIdx] = useState(regionsVisual.length - 1);
  const activeRegion = regionsVisual[activeIdx] || regionsVisual[regionsVisual.length - 1];

  const [focusStory, setFocusStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // MODO 2 — Visão Geral ("Ver mapa"): modal de orientação da região ativa.
  const [overviewVisible, setOverviewVisible] = useState(false);
  const overviewAnim = useRef(new Animated.Value(0)).current;
  const openOverview = useCallback(() => {
    setOverviewVisible(true);
    overviewAnim.setValue(0);
    Animated.spring(overviewAnim, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }).start();
  }, [overviewAnim]);
  const closeOverview = useCallback(() => {
    Animated.timing(overviewAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => setOverviewVisible(false));
  }, [overviewAnim]);

  const isOpenable = useCallback((story) => getStoryAccessStatus(story) === 'full', []);

  const currentId = useMemo(() => {
    const next = ordered.find((s) => isOpenable(s) && !isStoryCompleted(s.id));
    return next ? next.id : null;
  }, [ordered, isOpenable, isStoryCompleted]);

  // História que a câmera deve focar: próxima disponível; senão última concluída;
  // senão A Criação (começo). Só leitura.
  const cameraStoryId = useMemo(() => {
    if (currentId) return currentId;
    const completed = ordered.filter((s) => isStoryCompleted(s.id));
    if (completed.length) return completed[completed.length - 1].id;
    return ordered[0]?.id;
  }, [currentId, ordered, isStoryCompleted]);

  // Offset inicial da câmera calculado de forma SÍNCRONA (antes do 1º paint), via
  // prop contentOffset → abre já na base correta, sem pulo. (onContentSize depois
  // só refina com a altura real do viewport, então a correção é imperceptível.)
  const initialOffsetY = useMemo(() => {
    if (!regionLayout.length) return 0;
    const last = regionLayout[regionLayout.length - 1];
    const contentH = last.top + last.height + insets.bottom + 8;
    const vpEst = Math.max(220, height - (insets.top + 56) - (insets.bottom + 56)); // header + tab bar aprox.
    let anchorY = contentH - vpEst;
    const idx = regionsVisual.findIndex((r) => (r.stories || []).some((s) => s.id === cameraStoryId));
    if (idx >= 0 && regionLayout[idx]) {
      anchorY = regionLayout[idx].top + getStoryMapCoord(cameraStoryId).y * regionLayout[idx].height;
    }
    return Math.max(0, Math.min(anchorY - vpEst * 0.58, Math.max(0, contentH - vpEst)));
  }, [regionLayout, regionsVisual, cameraStoryId, height, insets.top, insets.bottom]);

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

  // Câmera inicial: pousa na BASE mostrando A Criação (1º marco da última região),
  // com contexto de mapa em volta. CLAMP em [0, contentH - viewport] → nunca mostra
  // vazio/preto no rodapé (sem rolar ao fim bruto).
  const scrollRef = useRef(null);
  const scrollViewH = useRef(0);
  const didInitScroll = useRef(false);
  const onScrollLayout = useCallback((e) => { scrollViewH.current = e.nativeEvent.layout.height; }, []);
  const onContentSize = useCallback((w, h) => {
    if (didInitScroll.current || scrollViewH.current <= 0) return;
    didInitScroll.current = true;
    const vp = scrollViewH.current;
    const maxY = Math.max(0, h - vp);
    // Câmera por MARCO: âncora = coordenada Y do marco focado (próxima aventura;
    // senão última concluída; senão A Criação). Coloca o marco ~58% do viewport,
    // deixando caminho acima. Clamp → nunca mostra vazio/preto.
    let anchorY = maxY;
    const idx = regionsVisual.findIndex((r) => (r.stories || []).some((s) => s.id === cameraStoryId));
    if (idx >= 0 && regionLayout[idx]) {
      const coord = getStoryMapCoord(cameraStoryId);
      anchorY = regionLayout[idx].top + coord.y * regionLayout[idx].height;
    }
    const target = Math.max(0, Math.min(anchorY - vp * 0.58, maxY));
    scrollRef.current?.scrollTo({ y: target, animated: false });
  }, [regionLayout, regionsVisual, cameraStoryId]);

  // Atualiza o índice da região ativa conforme a rolagem (só quando muda — leve).
  const onScroll = useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y + 90; // sonda perto do topo do viewport
    let idx = regionLayout.length - 1;
    for (let i = 0; i < regionLayout.length; i++) {
      const r = regionLayout[i];
      if (y >= r.top && y < r.top + r.height) { idx = i; break; }
    }
    setActiveIdx((prev) => (prev === idx ? prev : idx));
  }, [regionLayout]);

  // ── DEBUG VISUAL TEMPORÁRIO (será revertido). Só leitura, sem cálculo novo. ──
  const dbgRegionH = computeRegionHeight(width);
  const dbgRegion = regions[0]; // comece_aqui (1ª região)
  const dbgSource = dbgRegion?.images ? (isRegionAwake(dbgRegion) ? dbgRegion.images.awake : dbgRegion.images.asleep) : null;
  const dbgArt = dbgSource ? (Image.resolveAssetSource(dbgSource) || {}) : {};

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F4E6C8', '#E8D3A6']} style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 2 }]}>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Mapa das Aventuras</Text>
          <Text style={styles.headerSub}>Suba o caminho da fé ✨</Text>
        </View>
        {/* MODO 2: botão discreto "Ver mapa" (Visão Geral) */}
        <SoundButton style={styles.overviewBtn} onPress={openOverview} accessibilityLabel="Ver mapa" activeOpacity={0.85}>
          <Text style={styles.overviewBtnText}>🗺️ Ver mapa</Text>
        </SoundButton>
      </LinearGradient>

      <Animated.View style={{ flex: 1, backgroundColor: REGION_PARCHMENT_BG, opacity: 1, transform: [{ translateY: entranceTranslate }] }}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          onLayout={onScrollLayout}
          onContentSizeChange={onContentSize}
          onScroll={onScroll}
          scrollEventThrottle={32}
          contentOffset={{ x: 0, y: initialOffsetY }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
          showsVerticalScrollIndicator={false}
        >
          {regionsVisual.map((region) => (
            <MapRegion
              key={region.id}
              region={region}
              width={width}
              awake={isRegionAwake(region)}
              currentStoryId={currentId}
              isTop={region.id === regionsVisual[0].id}
              // TODAS as regiões desenham a arte de imediato (sem branco na abertura).
              renderImage
              getState={getState}
              onPressStory={openFocus}
            />
          ))}
        </ScrollView>
        {/* (Orientação de região fica no chip INTERNO de cada região — sem pílula
            flutuante duplicada competindo com os labels.) */}
      </Animated.View>

      {/* ── DEBUG VISUAL TEMPORÁRIO (será revertido) ── */}
      <View style={[styles.dbgOverlay, { top: Math.max(insets.top, 8) + 56 }]} pointerEvents="none">
        <Text style={styles.dbgText}>width = {width}</Text>
        <Text style={styles.dbgText}>regionH = {dbgRegionH}</Text>
        <Text style={styles.dbgText}>ratio = {(dbgRegionH / width).toFixed(4)}  (esp. ~1.778)</Text>
        <Text style={styles.dbgText}>MAP_ASPECT = {MAP_ASPECT.toFixed(4)}  (esp. 0.5625)</Text>
        <Text style={styles.dbgText}>art = {dbgArt.width ?? '?'} x {dbgArt.height ?? '?'}  (esp. 941x1672)</Text>
        <Text style={styles.dbgText}>
          artRatio = {dbgArt.width && dbgArt.height ? (dbgArt.width / dbgArt.height).toFixed(4) : '?'}  (esp. 0.5625)
        </Text>
      </View>

      <StoryFocusModal
        visible={modalVisible}
        story={focusStory}
        state={focusStory ? getState(focusStory) : 'locked'}
        lockReason={focusStory ? getStoryLockReason(focusStory) : null}
        progressPercent={focusStory ? getStoryCompletionPercent(focusStory.id) : 0}
        onClose={closeFocus}
        onOpen={confirmOpenStory}
      />

      {/* MODO 2 — Visão Geral ("Ver mapa"): região INTEIRA em contain, só orientação */}
      <Modal visible={overviewVisible} transparent animationType="none" onRequestClose={closeOverview}>
        <Animated.View style={[styles.ovBackdrop, { opacity: overviewAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeOverview} />
          <Animated.View
            style={[styles.ovCard, { transform: [{ scale: overviewAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}
          >
            <SoundButton style={styles.ovClose} onPress={closeOverview} accessibilityLabel="Fechar" activeOpacity={0.8}>
              <Text style={styles.ovCloseText}>✕</Text>
            </SoundButton>
            <Text style={styles.ovTitle}>{activeRegion?.title ?? ''}</Text>
            <View style={styles.ovImageBox}>
              {activeRegion?.images && (
                <Image
                  source={isRegionAwake(activeRegion) ? activeRegion.images.awake : activeRegion.images.asleep}
                  resizeMode="contain"
                  style={StyleSheet.absoluteFill}
                />
              )}
            </View>
            <Text style={styles.ovHint}>Toque fora para voltar à caminhada</Text>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Fundo de pergaminho claro (full-bleed, SEM borda lateral, SEM preto). Só
  // aparece no topo/base e como fallback enquanto a arte carrega.
  container: { flex: 1, backgroundColor: REGION_PARCHMENT_BG },
  scroll: { flex: 1, backgroundColor: REGION_PARCHMENT_BG },
  // DEBUG VISUAL TEMPORÁRIO (revertido depois)
  dbgOverlay: {
    position: 'absolute',
    left: 8,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  dbgText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', fontFamily: 'Nunito' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,90,40,0.22)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
  },
  headerTexts: { flex: 1 },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 19, color: '#5A4420' },
  headerSub: { fontFamily: 'Nunito', fontSize: 12, color: '#7A6238', fontWeight: '700', marginTop: 0 },
  overviewBtn: {
    backgroundColor: 'rgba(90,68,32,0.14)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(90,68,32,0.25)',
  },
  overviewBtnText: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '800', color: '#5A4420' },
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

  /* ── Visão Geral ("Ver mapa") ── */
  ovBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(38,28,14,0.72)', // escurecido quente, não preto puro
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  ovCard: {
    width: '100%',
    maxWidth: 420,
    height: '86%',
    backgroundColor: '#F5EAD2',
    borderRadius: 24,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  ovClose: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 5,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  ovCloseText: { fontSize: 16, color: '#6B5A3E', fontWeight: '900' },
  ovTitle: { fontFamily: 'FredokaOne', fontSize: 18, color: '#5A4420', marginBottom: 8 },
  ovImageBox: { flex: 1, width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: '#E7D6B0' },
  ovHint: { fontFamily: 'Nunito', fontSize: 11.5, fontWeight: '700', color: '#8A7A5E', marginTop: 8 },
});
