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
import { View, Text, Image, Modal, Pressable, ActivityIndicator, InteractionManager, StyleSheet, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { getAdventureRegions, getOrderedAdventureStories, computeRegionHeight, computeImageRect, getStoryMapCoord, REGION_PARCHMENT_BG } from '../data/adventureMap';
import { getStoryAccessStatus, getStoryLockReason } from '../services/contentAccessService';
import { useProgressContext } from '../context/ProgressContext';
import SoundButton from '../components/SoundButton';
import MapRegion from '../components/map/MapRegion';
import StoryFocusModal from '../components/map/StoryFocusModal';
import BeniGuideOverlay from '../components/BeniGuideOverlay';
import { hasSeenBeniAppTour, markBeniAppTourSeen, markGuideSeen, consumeInitialTourRequest, subscribeInitialTourRequest } from '../services/beniTourService';
import { useGuideTargets } from '../hooks/useGuideTargets';
import { measureGuideTarget } from '../services/guideTargetRegistry';
import { INITIAL_TOUR } from '../data/beniGuides';

const REGION_OVERLAP = 0; // regiões se tocam exatamente (sem overlap que cortava a base da arte)

// Espaço inferior do scroll. A TAB BAR (não-absoluta) já reserva 64 + insets.bottom
// abaixo da tela, então NÃO se soma insets.bottom aqui (era espaço morto). Mapa
// imersivo → 0: a última região termina limpa, encostando na área da tab bar, sem
// faixa morta de pergaminho. (Mesma constante alimenta o cálculo de câmera.)
const SCROLL_BOTTOM_PAD = 0;

export default function AdventureMapScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  // ── UX 2.0: Tour Mágico do Beni — só após o onboarding (param startBeniTour) e
  // só UMA vez (guardado por beniTourService). Usuário antigo entra pela aba sem o
  // param → tour nunca aparece. É puramente visual: não toca acesso/progresso.
  const [showBeniTour, setShowBeniTour] = useState(false);
  useEffect(() => {
    let alive = true;
    const maybeShow = () => hasSeenBeniAppTour().then((seen) => { if (alive && !seen) setShowBeniTour(true); });
    // Gatilho por param (mobile) OU pelo SINAL pendente (tablet pós-onboarding, já setado
    // antes do mount). Consome o sinal para não reabrir.
    if (route?.params?.startBeniTour || consumeInitialTourRequest()) maybeShow();
    // E também enquanto montado (ex.: "Rever Tour" no tablet com Aventuras já ativa).
    const unsub = subscribeInitialTourRequest(() => { consumeInitialTourRequest(); maybeShow(); });
    return () => { alive = false; unsub(); };
  }, [route?.params?.startBeniTour]);
  const closeBeniTour = useCallback(() => {
    setShowBeniTour(false);
    markBeniAppTourSeen();        // 'initial' visto
    markGuideSeen('adventures');  // impede o guia separado de Aventuras de disparar
    navigation.setParams?.({ startBeniTour: false });
  }, [navigation]);

  // Alvos REAIS medidos do tour (UX 2.3.1+): mapa + pin foco + botão Ver mapa.
  const guideTargets = useGuideTargets();
  // ref ESTÁVEL do pin foco (current/nextLocked), registrado só pelo MapRegion que o
  // contém. measureInWindow (nativo) já considera o scroll.
  const registerNextPin = useMemo(() => guideTargets.register('adventures.nextPin'), [guideTargets.register]);
  // Medição combinada: alvos LOCAIS (mapa/pin/Ver mapa) + alvos GLOBAIS (item
  // Aventuras da sidebar no tablet, registrado em outro componente).
  const measureTarget = useCallback(
    (name) => guideTargets.measure(name).then((r) => r || measureGuideTarget(name)),
    [guideTargets.measure],
  );
  const { width, height } = useWindowDimensions();
  const { isStoryCompleted, getStoryCompletionPercent } = useProgressContext();

  // TABLET FIX: o mapa deve usar a largura da ÁREA DE CONTEÚDO (à direita da sidebar),
  // não a largura total da tela — senão fica cortado. Medimos o container; no celular
  // isso é igual à largura da janela (sem regressão).
  const [contentW, setContentW] = useState(0);
  const mapWidth = contentW > 0 ? contentW : width;
  const onContainerLayout = useCallback((e) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setContentW((prev) => (prev === w ? prev : w));
  }, []);

  // Entrada: o mapa abre JÁ VISÍVEL (opacity 1 desde o 1º frame). Mantemos só um
  // translateY levíssimo de charme — o mapa NUNCA fica invisível.
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, [entrance]);
  const entranceTranslate = entrance.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

  // Preload LEVE e TARDIO: só DEPOIS da 1ª pintura (runAfterInteractions), aquece a
  // arte da região inicial (Comece Aqui) primeiro e as vizinhas de forma espaçada —
  // nunca no mount nem bloqueando o render (a regressão anterior foi preload global
  // no mount). Fire-and-forget; cancelável.
  useEffect(() => {
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      const all = getAdventureRegions(); // ordem lógica: comece_aqui primeiro
      const pairs = all.map((r) => r.images).filter(Boolean);
      pairs.forEach((pair, i) => {
        setTimeout(() => {
          if (cancelled) return;
          [pair.awake, pair.asleep].forEach((m) => {
            try { Asset.fromModule(m).downloadAsync(); } catch (e) { /* fire-and-forget */ }
          });
        }, i * 250);
      });
    });
    return () => { cancelled = true; task.cancel?.(); };
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
      const h = computeRegionHeight(mapWidth);
      const top = i === 0 ? 0 : prevBottom - REGION_OVERLAP;
      arr.push({ id: r.id, title: r.title, top, height: h, count: (r.stories || []).length });
      prevBottom = top + h;
    });
    return arr;
  }, [regionsVisual, mapWidth]);

  // Região ativa (índice visual). Começa na base (comece_aqui), pois a câmera
  // inicia embaixo. Usada pela pílula de orientação e pelo modo "Ver mapa".
  const [activeIdx, setActiveIdx] = useState(regionsVisual.length - 1);
  const activeRegion = regionsVisual[activeIdx] || regionsVisual[regionsVisual.length - 1];

  // ── Lazy render da arte FINAL por região (Bloco 2.5) ─────────────────────────
  // A PREVIEW leve (~60 KB, em MapRegion) aparece de IMEDIATO em todas as regiões;
  // a arte FINAL (941×1672, cara de decodificar) monta de forma ESCALONADA para não
  // competir toda no 1º frame. Prioridade máxima: comece_aqui (onde a câmera abre),
  // depois pequeninos → descobridores → jovens_da_fe.
  const [loadedFinalIds, setLoadedFinalIds] = useState(() => new Set(['comece_aqui']));
  const addFinal = useCallback((id) => {
    if (!id) return;
    setLoadedFinalIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);
  // Escalonamento por TEMPO (após a 1ª pintura): cada região seguinte entra com folga.
  useEffect(() => {
    const t1 = setTimeout(() => addFinal('pequeninos'), 300);
    const t2 = setTimeout(() => addFinal('descobridores'), 700);
    const t3 = setTimeout(() => addFinal('jovens_da_fe'), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [addFinal]);
  // Por PROXIMIDADE: ao rolar para uma região, garante a arte final dela e das
  // vizinhas (caso a criança chegue antes do escalonamento por tempo).
  useEffect(() => {
    [activeIdx - 1, activeIdx, activeIdx + 1].forEach((i) => addFinal(regionsVisual[i]?.id));
  }, [activeIdx, regionsVisual, addFinal]);

  const [focusStory, setFocusStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // MODO 2 — Visão Geral ("Ver mapa"): modal de orientação da região ativa.
  const [overviewVisible, setOverviewVisible] = useState(false);
  const [ovBox, setOvBox] = useState({ w: 0, h: 0 }); // caixa medida do modal
  const [ovLoaded, setOvLoaded] = useState(false);     // arte do modal já decodificada?
  const overviewAnim = useRef(new Animated.Value(0)).current;
  const openOverview = useCallback(() => {
    setOvLoaded(false);
    setOverviewVisible(true);
    overviewAnim.setValue(0);
    Animated.spring(overviewAnim, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }).start();
  }, [overviewAnim]);
  const closeOverview = useCallback(() => {
    Animated.timing(overviewAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => setOverviewVisible(false));
  }, [overviewAnim]);

  const isOpenable = useCallback((story) => getStoryAccessStatus(story) === 'full', []);

  // PRÓXIMA história da JORNADA = 1ª da trilha oficial ainda não concluída (B3.7).
  // Se liberada → 'current' (pulso normal). Se bloqueada → 'nextLocked' (cadeado +
  // pulso sutil), indicando para onde a jornada segue SEM liberar acesso. Se tudo
  // concluído → nenhuma das duas. Só leitura (não altera acesso/progresso).
  const nextJourney = useMemo(
    () => ordered.find((s) => !isStoryCompleted(s.id)) || null,
    [ordered, isStoryCompleted],
  );
  const currentId = useMemo(
    () => (nextJourney && isOpenable(nextJourney) ? nextJourney.id : null),
    [nextJourney, isOpenable],
  );
  const nextLockedId = useMemo(
    () => (nextJourney && !isOpenable(nextJourney) ? nextJourney.id : null),
    [nextJourney, isOpenable],
  );

  // UX 2.4.3: tour ÚNICO de 5 cards (estático). Os áudios next_available/next_locked
  // NÃO entram no tour inicial (ficam reservados p/ guia contextual futuro).
  const tourSteps = INITIAL_TOUR;

  // História que a câmera deve focar: o foco da jornada (disponível OU bloqueada);
  // senão última concluída; senão A Criação (começo). Só leitura.
  const cameraStoryId = useMemo(() => {
    if (currentId) return currentId;
    if (nextLockedId) return nextLockedId;
    const completed = ordered.filter((s) => isStoryCompleted(s.id));
    if (completed.length) return completed[completed.length - 1].id;
    return ordered[0]?.id;
  }, [currentId, nextLockedId, ordered, isStoryCompleted]);

  // Offset inicial da câmera calculado de forma SÍNCRONA (antes do 1º paint), via
  // prop contentOffset → abre já na base correta, sem pulo. (onContentSize depois
  // só refina com a altura real do viewport, então a correção é imperceptível.)
  const initialOffsetY = useMemo(() => {
    if (!regionLayout.length) return 0;
    const last = regionLayout[regionLayout.length - 1];
    const contentH = last.top + last.height + SCROLL_BOTTOM_PAD;
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
      if (story.id === nextLockedId) return 'nextLocked';
      return isOpenable(story) ? 'available' : 'locked';
    },
    [currentId, nextLockedId, isOpenable, isStoryCompleted],
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
  // Câmera re-centraliza quando a largura do mapa muda (ex.: medição da área de
  // conteúdo no tablet) — senão o scroll inicial fica calculado p/ a largura errada.
  useEffect(() => { didInitScroll.current = false; }, [mapWidth]);
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

  // UX 2.3.1: ao abrir o guia de Aventuras, traz o pin foco para a área visível
  // (mesma geometria da câmera) → maximiza a chance de medir o brilho. Se não der,
  // o overlay cai no fallback honesto (sem halo). Não mexe em coords/pins.
  const scrollPinIntoView = useCallback(() => {
    const vp = scrollViewH.current;
    if (vp <= 0 || !regionLayout.length || !cameraStoryId) return;
    const idx = regionsVisual.findIndex((r) => (r.stories || []).some((s) => s.id === cameraStoryId));
    if (idx < 0 || !regionLayout[idx]) return;
    const anchorY = regionLayout[idx].top + getStoryMapCoord(cameraStoryId).y * regionLayout[idx].height;
    const last = regionLayout[regionLayout.length - 1];
    const contentH = last.top + last.height + SCROLL_BOTTOM_PAD;
    const maxY = Math.max(0, contentH - vp);
    const target = Math.max(0, Math.min(anchorY - vp * 0.5, maxY));
    scrollRef.current?.scrollTo({ y: target, animated: true });
  }, [regionLayout, regionsVisual, cameraStoryId]);
  // UX 2.4.2: o tour avisa qual alvo entrou; ao chegar no pin do brilho, rolamos o
  // pin para a viewport (depois o overlay mede com settle).
  const onTourStep = useCallback((target) => {
    if (target === 'adventures.nextPin') scrollPinIntoView();
  }, [scrollPinIntoView]);

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <LinearGradient colors={['#F4E6C8', '#E8D3A6']} style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 2 }]}>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Mapa das Aventuras</Text>
          <Text style={styles.headerSub}>Suba o caminho da fé ✨</Text>
        </View>
        {/* MODO 2: botão discreto "Ver mapa" (Visão Geral). View medível p/ o guia. */}
        <View ref={guideTargets.register('adventures.viewMapButton')} collapsable={false}>
          <SoundButton style={styles.overviewBtn} onPress={openOverview} accessibilityLabel="Ver mapa" activeOpacity={0.85}>
            <Text style={styles.overviewBtnText}>🗺️ Ver mapa</Text>
          </SoundButton>
        </View>
      </LinearGradient>

      <Animated.View
        ref={guideTargets.register('adventures.map')}
        collapsable={false}
        style={{ flex: 1, backgroundColor: REGION_PARCHMENT_BG, opacity: 1, transform: [{ translateY: entranceTranslate }] }}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          onLayout={onScrollLayout}
          onContentSizeChange={onContentSize}
          onScroll={onScroll}
          scrollEventThrottle={32}
          contentOffset={{ x: 0, y: initialOffsetY }}
          contentContainerStyle={{ paddingBottom: SCROLL_BOTTOM_PAD }}
          showsVerticalScrollIndicator={false}
        >
          {regionsVisual.map((region) => (
            <MapRegion
              key={region.id}
              region={region}
              width={mapWidth}
              awake={isRegionAwake(region)}
              currentStoryId={currentId}
              // PREVIEW leve aparece sempre; arte FINAL entra de forma escalonada
              // (comece_aqui primeiro) para a abertura parecer instantânea.
              renderImageFinal={loadedFinalIds.has(region.id)}
              getState={getState}
              onPressStory={openFocus}
              registerPinTarget={registerNextPin}
            />
          ))}
        </ScrollView>
        {/* (Orientação de região fica no chip INTERNO de cada região — sem pílula
            flutuante duplicada competindo com os labels.) */}
      </Animated.View>

      <StoryFocusModal
        visible={modalVisible}
        story={focusStory}
        state={(() => {
          const st = focusStory ? getState(focusStory) : 'locked';
          // No card de foco, nextLocked se comporta EXATAMENTE como locked (mesmo
          // fluxo bloqueado, nada é liberado) — o destaque pulsante é só no mapa.
          return st === 'nextLocked' ? 'locked' : st;
        })()}
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
            <View
              style={styles.ovImageBox}
              onLayout={(e) => {
                const { width: bw, height: bh } = e.nativeEvent.layout;
                setOvBox((prev) => (prev.w === Math.round(bw) && prev.h === Math.round(bh) ? prev : { w: Math.round(bw), h: Math.round(bh) }));
              }}
            >
              {(() => {
                const awakeReg = isRegionAwake(activeRegion);
                const imgs = activeRegion?.images || null;
                const ovSource = imgs ? (awakeReg ? imgs.awake : imgs.asleep) : null;
                // PREVIEW leve (mesmo rect contain) — aparece de imediato; a final entra
                // por cima ao decodificar. Ver mapa também abre quase instantâneo.
                const ovPreview = imgs ? (awakeReg ? imgs.awakePreview : imgs.asleepPreview) : null;
                // Retângulo EXPLÍCITO (contain) dentro da caixa medida → arte inteira,
                // centralizada, sem zoom/recorte. Sem StyleSheet.absoluteFill.
                const rect = ovBox.w > 0 && ovBox.h > 0 ? computeImageRect(ovBox.w, ovBox.h) : null;
                const rectStyle = rect ? { position: 'absolute', left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null;
                return (
                  <>
                    {ovPreview && rect && (
                      <Image source={ovPreview} resizeMode="contain" fadeDuration={0} style={rectStyle} />
                    )}
                    {ovSource && rect && (
                      <Image
                        source={ovSource}
                        resizeMode="contain"
                        fadeDuration={120}
                        onLoadEnd={() => setOvLoaded(true)}
                        onError={() => setOvLoaded(true)}
                        style={rectStyle}
                      />
                    )}
                    {/* Spinner só quando NÃO há preview para cobrir o vazio. */}
                    {(!rect || (!ovLoaded && !ovPreview)) && (
                      <View style={styles.ovLoading} pointerEvents="none">
                        <ActivityIndicator size="small" color="#8A7A5E" />
                        <Text style={styles.ovLoadingText}>Abrindo o mapa…</Text>
                      </View>
                    )}
                  </>
                );
              })()}
            </View>
            <Text style={styles.ovHint}>Toque fora para voltar à caminhada</Text>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* UX 2.4.2 — TOUR ÚNICO falado (6 cards) sobre Aventuras, pós-onboarding.
          Bloqueante (Modal), com aviso de som, alvos medidos e CTA só no fim.
          Ao fechar, marca 'initial' e 'adventures' como vistos (não reabre guia). */}
      {showBeniTour && (
        <BeniGuideOverlay
          steps={tourSteps}
          measure={measureTarget}
          withAudioPrompt
          finalLabel="Começar minha jornada"
          onStep={onTourStep}
          onTargetPress={() => {
            // Card final: tocar no pin destacado = comportamento NORMAL do pin (abre o
            // card de foco da história). Fecha o tour antes. Paywall preservado.
            const story = ordered.find((s) => s.id === cameraStoryId);
            closeBeniTour();
            if (story) openFocus(story);
          }}
          onFinish={closeBeniTour}
          onSkip={closeBeniTour}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Fundo de pergaminho claro (full-bleed, SEM borda lateral, SEM preto). Só
  // aparece no topo/base e como fallback enquanto a arte carrega.
  container: { flex: 1, backgroundColor: REGION_PARCHMENT_BG },
  scroll: { flex: 1, backgroundColor: REGION_PARCHMENT_BG },
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
  ovLoading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ovLoadingText: { marginTop: 6, fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: '#8A7A5E' },
  ovHint: { fontFamily: 'Nunito', fontSize: 11.5, fontWeight: '700', color: '#8A7A5E', marginTop: 8 },
});
