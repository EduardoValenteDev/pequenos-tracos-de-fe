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
import { View, Text, Image, Modal, Pressable, ActivityIndicator, InteractionManager, StyleSheet, ScrollView, Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { getAdventureRegions, getOrderedAdventureStories, getJourneyRegionRevealFraction, computeImageRect, computeRegionArtWidth, REGION_PARCHMENT_BG, MAP_ASPECT } from '../data/adventureMap';
import { computeRegionLayout, getStoryAnchor, computeCameraTarget, resolveActiveRegion } from '../services/mapAnchor';
import { getStoryAccessStatus, getStoryLockReason } from '../services/contentAccessService';
import { useProgressContext } from '../context/ProgressContext';
import SoundButton from '../components/SoundButton';
import MapRegion from '../components/map/MapRegion';
import StoryFocusModal from '../components/map/StoryFocusModal';
import BeniGuideOverlay from '../components/BeniGuideOverlay';
import { hasSeenBeniAppTour, markBeniAppTourSeen, markGuideSeen, consumeInitialTourRequest, resolveInitialTourRequest, subscribeInitialTourRequest, setAdventureTourActive, setAdventureTabCalloutActive } from '../services/beniTourService';
import { useGuideTargets } from '../hooks/useGuideTargets';
import { measureGuideTarget } from '../services/guideTargetRegistry';
import { INITIAL_TOUR } from '../data/beniGuides';

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
    // antes do mount). [F6-R3.x · A-03] Os dois transportes carregam UM pedido só, e o
    // sinal precisa ser consumido em AMBOS os caminhos — o `||` escrito à mão aqui
    // curto-circuitava o consumo sempre que o param já era verdadeiro, deixando o pedido
    // pendente para o assinante reabrir. O resolvedor consome primeiro e só então decide.
    if (resolveInitialTourRequest(route?.params?.startBeniTour)) maybeShow();
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

  // Fase 1.1.3: enquanto o tour de Aventuras está ativo, BLOQUEIA a troca de aba
  // (tab bar mobile / sidebar tablet) — sem Modal, sem cobrir o mapa, sem travar o
  // pan. O AppNavigator/TabletSidebar leem isAdventureTourActive(). Libera ao fechar
  // o tour OU ao desmontar a tela (cleanup), garantindo que a navegação volte.
  useEffect(() => {
    setAdventureTourActive(showBeniTour);
    return () => setAdventureTourActive(false);
  }, [showBeniTour]);

  // Fase 1.1.4: enquanto o tour está ativo e o usuário ROLA o mapa, avisa o overlay
  // (mapScrolling → esconde halo/seta/hit zone, sem stale) e, ao parar (settle),
  // bump no nonce → o overlay re-mede o alvo do passo (segue ou some, fallback honesto).
  const [mapScrolling, setMapScrolling] = useState(false);
  const [mapScrollNonce, setMapScrollNonce] = useState(0);
  const mapScrollingRef = useRef(false);
  const scrollSettleTimer = useRef(null);
  useEffect(() => () => { if (scrollSettleTimer.current) clearTimeout(scrollSettleTimer.current); }, []);

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
  // A0.10 — CONTRATO da jornada: o mapa (reveal, pulso, câmera, região, nextJourney E
  // selo) avança por journeyComplete, NÃO mais por cenas. getStoryContractStatus é a
  // fonte única (acesso + jornada + sequência). getStoryCompletionPercent segue só
  // para o progresso narrativo de cenas mostrado no card.
  const { isStoryJourneyComplete, getStoryContractStatus, getStoryCompletionPercent } = useProgressContext();

  // "Ver mapa" (Visão Geral): dimensiona a IMAGEM no aspecto real da arte (MAP_ASPECT
  // = 9:16) dentro do card, em vez de deixar a caixa `flex` ficar mais alta que a arte
  // (o que sobrava como faixa em cima/embaixo). Limita por largura E por altura útil,
  // então funciona tanto em iPhone alto quanto em telas menores, sem corte nem branco.
  const ovImg = useMemo(() => {
    const BACKDROP_PAD = 18; // styles.ovBackdrop.padding
    const CARD_HPAD = 12;    // styles.ovCard.paddingHorizontal
    const CARD_MAXW = 420;   // styles.ovCard.maxWidth
    const V_CHROME = 84;     // título + dica + paddings verticais do card
    const cardW = Math.min(width - BACKDROP_PAD * 2, CARD_MAXW);
    const boxW = cardW - CARD_HPAD * 2;
    const availH = height * 0.92 - V_CHROME; // card limitado a 92% da altura
    let w = boxW;
    let h = Math.round(w / MAP_ASPECT); // arte é mais alta que larga
    if (h > availH) {
      h = availH;
      w = Math.round(h * MAP_ASPECT);
    }
    return { width: Math.max(0, Math.round(w)), height: Math.max(0, Math.round(h)) };
  }, [width, height]);

  // TABLET FIX: o mapa deve usar a largura da ÁREA DE CONTEÚDO (à direita da sidebar),
  // não a largura total da tela — senão fica cortado. Medimos o container; no celular
  // isso é igual à largura da janela (sem regressão).
  //
  // [F6-SG-C · CAUSA B] A medida só vale para a janela em que foi tirada. Sem o
  // carimbo, o quadro seguinte a uma rotação desenha com a janela NOVA e a largura
  // VELHA — o salto em duas etapas. Com ele, `onLayout` volta ao papel de CORREÇÃO:
  // o primeiro quadro da janela nova já usa a janela (o fallback que sempre existiu
  // aqui), e a medida real confirma no quadro seguinte.
  //
  // O carimbo entra no CÁLCULO, não no portão de montagem: `contentW` segue sendo a
  // medida crua ("já mediu alguma vez") porque é ela que monta o ScrollView — e
  // desmontar o ScrollView a cada rotação perderia a posição de rolagem, que é
  // exatamente o estado que a câmera do mapa existe para preservar. `G-MAP-3` lacra
  // essa montagem por medida real; nada aqui a afrouxa.
  //
  // [F6-SG-C · CAUSA C2] A viewport livre (altura REAL entre header e tab/sidebar) é
  // medida aqui em cima porque agora ela participa da ESCALA, não só da câmera: a
  // região ganhou teto de altura relativo à janela que a mostra. `mapWidth` deixou de
  // ser "a largura da área" para ser "a largura da ARTE" — é ela que a geometria
  // inteira consome (layout, âncoras, marcadores), e é por isso que guarda o nome.
  // `areaWidth` é o espaço disponível; o teto decide quanto dele a arte ocupa.
  //
  // [F6-SG-C · CAUSA B · REABERTURA POR C2] E foi aqui que a CAUSA B voltou. Ao
  // trazer a ALTURA para a escala, C2 pôs uma SEGUNDA medida na geometria e deixou
  // essa sem carimbo: a largura recusava medida de outra janela, a altura não. Na
  // campanha física o primeiro quadro da janela nova escalava a arte pela altura da
  // ORIENTAÇÃO ANTERIOR — 664dp onde cabiam 394dp ao entrar em paisagem, 394dp onde
  // cabiam 643dp ao voltar — e o quadro seguinte corrigia à vista.
  //
  // A separação é a MESMA que a largura já fazia, agora escrita nos dois eixos:
  //   · `contentW`/`mapViewportH` são as medidas CRUAS ("já mediu alguma vez").
  //     São elas que montam o ScrollView e ancoram a câmera — e continuam cruas de
  //     propósito, porque desmontar o ScrollView a cada rotação perderia a rolagem
  //     que a CAUSA C1 existe para preservar (`G-MAP-3` lacra essa montagem).
  //   · `areaWidth`/`areaHeight` são as CARIMBADAS. São elas, e só elas, que
  //     mandam na geometria: medida de outra janela não entra no cálculo.
  const [viewportM, setViewportM] = useState({ h: 0, janela: 0 });
  const mapViewportH = viewportM.h;
  const [contentM, setContentM] = useState({ w: 0, janela: 0 });
  const contentW = contentM.w;
  const areaWidth = contentM.janela === width && contentW > 0 ? contentW : width;
  const areaHeight = viewportM.janela === width && mapViewportH > 0 ? mapViewportH : 0;
  const mapWidth = computeRegionArtWidth(areaWidth, areaHeight);
  // Recusada a medida, a escala fica SEM viewport — e nenhum valor derivado da janela
  // a substitui sem estimar o cromo, estimativa que `G-MAP-3` proíbe. Então a arte
  // não é PINTADA enquanto as duas medidas não forem desta janela. Não é atraso
  // artificial: é a ausência de resposta enquanto o `onLayout` não respondeu — e na
  // ABERTURA nada muda, porque as duas medidas chegam no mesmo passo de layout em que
  // o ScrollView monta: o mapa segue nascendo visível, no primeiro quadro em que existe.
  const medidasDaJanela = contentM.janela === width && viewportM.janela === width;
  const onContainerLayout = useCallback((e) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setContentM((prev) => (prev.w === w && prev.janela === width ? prev : { w, janela: width }));
  }, [width]);

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

  // B5.3.1 + A0.10 — reveal GLOBAL da jornada. A fronteira avança por journeyComplete
  // (não por cenas): se A Criação está só em andamento, a cor sobe até A Criação e
  // NÃO até Noé. Helper puro; aqui injetamos isStoryJourneyComplete.
  const journeyRevealFraction = useCallback(
    (region) => getJourneyRegionRevealFraction(region, regions, isStoryJourneyComplete),
    [regions, isStoryJourneyComplete],
  );

  // Layout canônico: recebe a mesma ordem VISUAL usada pelos marcadores.
  const regionLayout = useMemo(
    () => computeRegionLayout(regionsVisual, mapWidth),
    [regionsVisual, mapWidth],
  );
  const anchorContext = useMemo(
    () => ({ regions: regionsVisual, regionLayout, width: mapWidth }),
    [regionsVisual, regionLayout, mapWidth],
  );

  // Âncora EXPLÍCITA da região inicial da jornada ("Comece Aqui"), por id (não por
  // ordem frágil). É a região onde o usuário começa — referência do 1º acesso.
  const comeceRegionIdx = useMemo(() => {
    const i = regionsVisual.findIndex((r) => r.id === 'comece_aqui');
    return i >= 0 ? i : regionsVisual.length - 1;
  }, [regionsVisual]);

  // Região ativa (índice visual). Começa em "Comece Aqui" (início da jornada). Usada
  // pela pílula de orientação e pelo modo "Ver mapa".
  const [activeIdx, setActiveIdx] = useState(comeceRegionIdx);
  // Fase 1.1.3: ref SEMPRE atual da região visível (atualizada no onScroll), para o
  // "Ver mapa" abrir a região ATIVA no momento do toque, sem closure stale.
  const activeIdxRef = useRef(comeceRegionIdx);
  // Fase 1.1.5: enquanto o usuário NÃO rolou MANUALMENTE, mantemos a região ativa em
  // "Comece Aqui" (o scroll inicial é programático e não deve sequestrar o activeIdx).
  // Vira true no 1º arrasto do usuário → a partir daí o "Ver mapa" segue a viewport.
  const userScrolledRef = useRef(false);
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
  // Região mostrada pelo overview: por padrão a ativa (rolagem); o tour pode pedir
  // uma região específica (a do foco) ao abrir "Ver mapa" — sem mexer no activeIdx.
  const [ovRegionIdx, setOvRegionIdx] = useState(null);
  const overviewAnim = useRef(new Animated.Value(0)).current;
  // MAPA 1.1: abertura SUAVE e intencional (não um "pop"). Timing com easing macio
  // + escala leve (0.96→1) em vez de spring rápido; mesmo comportamento no celular,
  // iPad e tablet. NÃO há scrollTo aqui: o overview é um modal contain (sem salto).
  const openOverview = useCallback((regionIdx) => {
    // Fase 1.1.3: "Ver mapa" abre a região ATIVA (visível) no momento do toque —
    // o header passa o EVENTO de press (não-número) → usa activeIdxRef.current; o
    // tour também chama sem índice. Antes ficava preso na 1ª região (cameraRegionIdx).
    const idx = typeof regionIdx === 'number' ? regionIdx : activeIdxRef.current;
    setOvRegionIdx(idx != null ? idx : activeIdx);
    setOvLoaded(false);
    setOverviewVisible(true);
    overviewAnim.setValue(0);
    Animated.timing(overviewAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [overviewAnim]);
  const closeOverview = useCallback(() => {
    Animated.timing(overviewAnim, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => setOverviewVisible(false));
  }, [overviewAnim]);

  const isOpenable = useCallback((story) => getStoryAccessStatus(story) === 'full', []);

  // PRÓXIMA história da JORNADA = 1ª da trilha oficial ainda não concluída (B3.7).
  // Se liberada → 'current' (pulso normal). Se bloqueada → 'nextLocked' (cadeado +
  // pulso sutil), indicando para onde a jornada segue SEM liberar acesso. Se tudo
  // concluído → nenhuma das duas. Só leitura (não altera acesso/progresso).
  const nextJourney = useMemo(
    () => ordered.find((s) => !isStoryJourneyComplete(s.id)) || null,
    [ordered, isStoryJourneyComplete],
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
    const completed = ordered.filter((s) => isStoryJourneyComplete(s.id));
    if (completed.length) return completed[completed.length - 1].id;
    return ordered[0]?.id;
  }, [currentId, nextLockedId, ordered, isStoryJourneyComplete]);

  const cameraAnchor = useMemo(
    () => getStoryAnchor(cameraStoryId, anchorContext),
    [cameraStoryId, anchorContext],
  );
  const mapContentH = useMemo(() => {
    const last = regionLayout[regionLayout.length - 1];
    return last ? last.top + last.height + SCROLL_BOTTOM_PAD : 0;
  }, [regionLayout]);


  // Região efetivamente exibida pelo overview: a pedida (rolagem/active) ou a ativa.
  const overviewRegion = regionsVisual[ovRegionIdx != null ? ovRegionIdx : activeIdx] || activeRegion;

  // O ScrollView só monta depois da medição do container livre; `contentOffset` nasce
  // da viewport real, sem os antigos 56dp estimados e sem correção visível posterior.
  const initialOffsetY = useMemo(() => {
    if (!cameraAnchor || mapViewportH <= 0) return 0;
    const mode = cameraAnchor.regionIndex === comeceRegionIdx ? 'regionTop' : 'anchor';
    return computeCameraTarget(cameraAnchor, mapViewportH, mapContentH, { mode });
  }, [cameraAnchor, mapViewportH, mapContentH, comeceRegionIdx]);

  // A0.10 — estado do marco pela FONTE ÚNICA (contrato). Hierarquia: comingSoon >
  // journeyLocked (jornada não chegou → cadeado, "Complete a anterior") > premiumLocked
  // (alcançada mas premium → convite sutil) > journeyComplete (✓) > fronteira atual
  // (pulso). Cenas completas NÃO avançam nada aqui.
  const getState = useCallback(
    (story) => {
      const c = getStoryContractStatus(story.id);
      if (!c) return 'locked';
      if (c.journeyComplete) return 'completed';
      if (c.status === 'comingSoon') return 'locked';
      if (c.status === 'journeyLocked') return 'locked';     // não alcançada → sem convite
      if (c.status === 'premiumLocked') return 'nextLocked'; // alcançada + premium → convite sutil
      if (c.canShowAsNext) return 'current';                 // fronteira liberada e aberta → pulso
      return 'available';
    },
    [getStoryContractStatus],
  );

  const isRegionAwake = useCallback(
    (region) =>
      (region.stories || []).some(
        (s) => isStoryJourneyComplete(s.id) || getStoryCompletionPercent(s.id) > 0 || s.id === currentId,
      ),
    [isStoryJourneyComplete, getStoryCompletionPercent, currentId],
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

  // Fase 1.1: "Começar minha jornada" (CTA final) e o toque no pin destacado seguem
  // o MESMO caminho — fecha o tour (libera o mapa: o véu some ao desmontar o overlay)
  // e abre o card de foco da história atual. Não depende de toque direto no mapa.
  const startJourneyFromTour = useCallback(() => {
    const story = ordered.find((s) => s.id === cameraStoryId);
    closeBeniTour();
    if (story) openFocus(story);
  }, [ordered, cameraStoryId, closeBeniTour, openFocus]);

  // Câmera inicial: pousa na BASE mostrando A Criação (1º marco da última região),
  // com contexto de mapa em volta. CLAMP em [0, contentH - viewport] → nunca mostra
  // vazio/preto no rodapé (sem rolar ao fim bruto).
  const scrollRef = useRef(null);
  const scrollViewH = useRef(0);
  const contentSizeRef = useRef({ width: 0, height: 0 });
  const didInitScroll = useRef(false);

  /* ── [F6-R3.1 · TK-A-017/018/019] POSIÇÃO DA CRIANÇA SOBREVIVE À MUDANÇA DE LARGURA ──
     Antes, mudar a largura do mapa (girar o aparelho, arrastar o divisor do Split View,
     a medição da área de conteúdo no tablet) era tratado como PRIMEIRA MONTAGEM: o
     efeito repunha `didInitScroll` e a câmera recalculava do zero, DESCARTANDO o ponto
     onde a criança estava. Era o `F6-LFC-01`/`P-152`.

     Agora a largura nova agenda uma REPROJEÇÃO: quando o `contentSize` novo chega, o
     mapa volta para o MESMO PAR LÓGICO — a região e a fração dentro dela —, não para a
     câmera. Como as alturas das regiões escalam com a largura, a fração é o que
     atravessa a mudança de geometria; o deslocamento em pixels não atravessaria.

     [F6-SG-C · CAUSA C1] O par valia só depois do PRIMEIRO ARRASTO MANUAL. A premissa
     era que sem arrasto não haveria posição da criança a preservar — e ela é falsa: a
     câmera posiciona sozinha na abertura, e esse lugar é lugar. Hoje o par é gravado a
     partir de QUALQUER posição visível. A abertura em si não muda: no primeiro quadro
     ainda não houve evento de rolagem nenhum, o par segue inválido e a reconciliação
     cai na câmera, preservando a recentragem da medição inicial no tablet
     (`TK-A-020`/`CN-2`). O `userScrolledRef` NÃO é reposto pela troca de largura. */
  const posLogicaRef = useRef({ regionIndex: -1, frac: 0, valida: false });
  const reprojetarRef = useRef(false);

  const regiaoDe = useCallback(
    (coordY) => resolveActiveRegion(coordY, regionLayout),
    [regionLayout],
  );

  const onMapViewportLayout = useCallback((e) => {
    const measured = Math.round(e.nativeEvent.layout.height);
    scrollViewH.current = measured;
    // [F6-SG-C · CAUSA B] Carimbada com a janela em que foi tirada, como a largura.
    setViewportM((prev) => (prev.h === measured && prev.janela === width ? prev : { h: measured, janela: width }));
  }, [width]);

  // Reconcilia somente quando AMBAS as medidas reais pertencem à geometria corrente.
  // Assim, contentSize→layout e layout→contentSize levam ao mesmo resultado.
  const reconcileMeasuredMap = useCallback((measuredW, h) => {
    const vp = scrollViewH.current;
    if (vp <= 0 || h <= 0 || Math.round(measuredW) !== Math.round(mapWidth)) return;
    // [TK-A-018] Reprojeção pendente com par gravado: restaura a posição lógica e sai.
    // Sem par gravado a reprojeção CAI no caminho da câmera abaixo — que é o comportamento
    // de hoje para a medição de abertura, preservado intacto por `TK-A-020`.
    const reprojetando = reprojetarRef.current;
    reprojetarRef.current = false;
    const par = posLogicaRef.current;
    if (reprojetando && par.valida && regionLayout[par.regionIndex]) {
      const r = regionLayout[par.regionIndex];
      const alvoY = Math.max(0, Math.min(r.top + par.frac * r.height, Math.max(0, h - scrollViewH.current)));
      scrollRef.current?.scrollTo({ y: alvoY, animated: false });
      // [TK-A-019] `activeIdx` reconciliado a partir da posição REAL restaurada, pela
      // mesma sonda do `onScroll` — a pílula de região e o "Ver mapa" acompanham.
      const idxReconciliado = regiaoDe(alvoY + 90);
      activeIdxRef.current = idxReconciliado;
      setActiveIdx((prev) => (prev === idxReconciliado ? prev : idxReconciliado));
      return;
    }
    if (didInitScroll.current && !reprojetando) return;
    didInitScroll.current = true;
    const idx = cameraAnchor?.regionIndex ?? -1;
    const mode = idx === comeceRegionIdx ? 'regionTop' : 'anchor';
    let target = computeCameraTarget(cameraAnchor, vp, h, { mode });
    if (idx === comeceRegionIdx && regionLayout[idx]) {
      // Fase 1.1.5 — 1º acesso / início da jornada: alinha "Comece Aqui" no TOPO da
      // viewport → região inicial CLARA, sem abrir entre duas regiões.
      target = computeCameraTarget(cameraAnchor, vp, h, { mode: 'regionTop' });
    }
    scrollRef.current?.scrollTo({ y: target, animated: false });
    // Região ativa = a da CÂMERA (não a sonda do onScroll) antes do 1º arrasto, para o
    // "Ver mapa" abrir a região certa mesmo se o usuário tocar rápido.
    const camIdx = idx >= 0 ? idx : comeceRegionIdx;
    activeIdxRef.current = camIdx;
    setActiveIdx((prev) => (prev === camIdx ? prev : camIdx));
  }, [mapWidth, regionLayout, regiaoDe, cameraAnchor, comeceRegionIdx]);

  const onContentSize = useCallback((w, h) => {
    contentSizeRef.current = { width: w, height: h };
    reconcileMeasuredMap(w, h);
  }, [reconcileMeasuredMap]);

  useEffect(() => {
    reprojetarRef.current = true;
    const measured = contentSizeRef.current;
    if (Math.round(measured.width) === Math.round(mapWidth) && measured.height > 0) {
      reconcileMeasuredMap(measured.width, measured.height);
    }
  }, [mapWidth, mapViewportH]);

  // Atualiza o índice da região ativa conforme a rolagem (só quando muda — leve).
  const onScroll = useCallback((e) => {
    // Fase 1.1.5: só segue a viewport DEPOIS do 1º arrasto manual. Antes disso a região
    // ativa é a da câmera ("Comece Aqui" no 1º acesso), definida no scroll inicial — o
    // scroll programático não pode sequestrar o activeIdx (senão "Ver mapa" abre errado).
    const offsetY = e.nativeEvent.contentOffset.y;
    if (userScrolledRef.current) {
      const idx = regiaoDe(offsetY + 90); // sonda perto do topo do viewport
      activeIdxRef.current = idx; // ref sempre atual (lida pelo "Ver mapa")
      setActiveIdx((prev) => (prev === idx ? prev : idx));
    }
    // [F6-R3.1 · TK-A-017] Grava o PAR LÓGICO da posição corrente: a região que contém
    // o deslocamento CRU (não a sonda — o par precisa ser invertível) e a fração dentro
    // dela. Duas contas sobre o `regionLayout` que já existe, escritas em campos de uma
    // ref criada uma única vez: sem alocação por evento e sem `setState` adicional.
    //
    // [F6-SG-C · CAUSA C1] A gravação saiu de dentro do guarda de gesto. O par é FUNÇÃO
    // DO ESTADO VISÍVEL: sempre que há layout válido, o ponto lógico no topo da viewport
    // é conhecido — venha ele de arrasto, da câmera ou da abertura. Preso ao gesto, quem
    // entrava, deixava a câmera posicionar e girava SEM ARRASTAR chegava à rotação com
    // `valida = false`, e a reconciliação caía no caminho da câmera: o mapa voltava para
    // a âncora e a criança perdia o lugar. O guarda continua acima, onde ele tem razão de
    // ser — `activeIdx` não pode ser sequestrado por scroll programático (Fase 1.1.5).
    const idxPos = regiaoDe(offsetY);
    const rPos = regionLayout[idxPos];
    if (rPos && rPos.height > 0) {
      posLogicaRef.current.regionIndex = idxPos;
      posLogicaRef.current.frac = (offsetY - rPos.top) / rPos.height;
      posLogicaRef.current.valida = true;
    }
    // Durante o tour: esconde o halo enquanto rola; re-mede o alvo ao parar (settle).
    if (showBeniTour) {
      if (!mapScrollingRef.current) { mapScrollingRef.current = true; setMapScrolling(true); }
      if (scrollSettleTimer.current) clearTimeout(scrollSettleTimer.current);
      scrollSettleTimer.current = setTimeout(() => {
        mapScrollingRef.current = false;
        setMapScrolling(false);
        setMapScrollNonce((n) => n + 1);
      }, 180);
    }
  }, [regionLayout, regiaoDe, showBeniTour]);

  // UX 2.3.1: ao abrir o guia de Aventuras, traz o pin foco para a área visível
  // (mesma geometria da câmera) → maximiza a chance de medir o brilho. Se não der,
  // o overlay cai no fallback honesto (sem halo). Não mexe em coords/pins.
  const scrollPinIntoView = useCallback(() => {
    const vp = scrollViewH.current;
    if (vp <= 0 || !cameraAnchor) return;
    const target = computeCameraTarget(cameraAnchor, vp, mapContentH);
    scrollRef.current?.scrollTo({ y: target, animated: true });
  }, [cameraAnchor, mapContentH]);
  // UX 2.4.2: o tour avisa qual alvo entrou; ao chegar no pin do brilho, rolamos o
  // pin para a viewport (depois o overlay mede com settle).
  const onTourStep = useCallback((target) => {
    if (target === 'adventures.nextPin') scrollPinIntoView();
  }, [scrollPinIntoView]);

  // A0.10 — contrato da história em foco (card) + título da ANTERIOR (para o texto
  // "Complete [história]" quando bloqueada por jornada). Derivado, barato.
  const focusContract = focusStory ? getStoryContractStatus(focusStory.id) : null;
  const focusPrevTitle = (() => {
    if (!focusStory) return null;
    const idx = ordered.findIndex((s) => s.id === focusStory.id);
    return idx > 0 ? ordered[idx - 1].titulo : null;
  })();

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
        onLayout={onMapViewportLayout}
        style={{ flex: 1, backgroundColor: REGION_PARCHMENT_BG, opacity: medidasDaJanela ? 1 : 0, transform: [{ translateY: entranceTranslate }] }}
      >
        {mapViewportH > 0 && contentW > 0 && <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          onContentSizeChange={onContentSize}
          onScroll={onScroll}
          // Fase 1.1.5: 1º arrasto manual → "Ver mapa" passa a seguir a região visível.
          onScrollBeginDrag={() => { userScrolledRef.current = true; }}
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
              anchorContext={anchorContext}
              // B5.3.1 — reveal GLOBAL da jornada (completa→1 · fronteira→parcial ·
              // futuras→0 sépia). Sem awake binário; sem cor acima da fronteira global.
              revealFraction={journeyRevealFraction(region)}
              currentStoryId={currentId}
              // PREVIEW leve aparece sempre; arte FINAL entra de forma escalonada
              // (comece_aqui primeiro) para a abertura parecer instantânea.
              renderImageFinal={loadedFinalIds.has(region.id)}
              getState={getState}
              onPressStory={openFocus}
              registerPinTarget={registerNextPin}
            />
          ))}
        </ScrollView>}
        {/* (Orientação de região fica no chip INTERNO de cada região — sem pílula
            flutuante duplicada competindo com os labels.) */}
      </Animated.View>

      {/* [FIX 2] `canOpen` não é mais repassada ao modal: ele nunca a leu, e este caminho leva só
          à tela de DETALHES — que uma história bloqueada continua podendo abrir. */}
      <StoryFocusModal
        visible={modalVisible}
        story={focusStory}
        // A0.10: o card usa o CONTRATO (status + sequência) como fonte única —
        // "Concluída" só com journeyComplete; journeyLocked mostra "Complete [anterior]".
        contractStatus={focusContract ? focusContract.status : 'locked'}
        journeyComplete={focusContract ? focusContract.journeyComplete : false}
        previousStoryTitle={focusPrevTitle}
        lockReason={focusStory ? getStoryLockReason(focusStory) : null}
        progressPercent={focusStory ? getStoryCompletionPercent(focusStory.id) : 0}
        onClose={closeFocus}
        onOpen={confirmOpenStory}
      />

      {/* UX 2.4.2 — TOUR ÚNICO falado sobre Aventuras, pós-onboarding. Bloqueante
          (Modal), com aviso de som, alvos medidos e CTA só no fim. Ao fechar, marca
          'initial' e 'adventures' como vistos (não reabre guia).
          Fase 1.1.1: renderizado ANTES do Modal de "Ver mapa" abaixo → quando o
          overview abre durante o tour, ele fica POR CIMA (Modal posterior na árvore),
          corrigindo o "Ver mapa" que antes abria atrás do tour. */}
      {showBeniTour && (
        <BeniGuideOverlay
          steps={tourSteps}
          measure={measureTarget}
          embedded
          mapScrolling={mapScrolling}
          mapScrollNonce={mapScrollNonce}
          onTabHighlight={setAdventureTabCalloutActive}
          withAudioPrompt
          finalLabel="Começar minha jornada"
          onStep={onTourStep}
          onViewMap={() => {
            // Fase 1.1.3 — interação controlada: tocar no botão REAL "Ver mapa"
            // destacado abre a Visão Geral da REGIÃO ATIVA (a visível no momento, via
            // activeIdxRef) — não mais presa à 1ª região. SEM avançar nem fechar o
            // tour; ao fechar o overview, continua no mesmo card. (Sem botão duplicado.)
            openOverview();
          }}
          onTargetPress={startJourneyFromTour}
          // Fase 1.1: "Começar minha jornada" é o caminho PRINCIPAL — fecha o tour e
          // abre o foco da história atual (não depende de tocar no pin). O pin segue
          // brilhando como indicação e também abre, mas não é mais obrigatório.
          onFinish={startJourneyFromTour}
          onSkip={closeBeniTour}
        />
      )}

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
            <Text style={styles.ovTitle}>{overviewRegion?.title ?? ''}</Text>
            <View
              style={[styles.ovImageBox, { width: ovImg.width, height: ovImg.height }]}
              onLayout={(e) => {
                const { width: bw, height: bh } = e.nativeEvent.layout;
                setOvBox((prev) => (prev.w === Math.round(bw) && prev.h === Math.round(bh) ? prev : { w: Math.round(bw), h: Math.round(bh) }));
              }}
            >
              {(() => {
                const awakeReg = isRegionAwake(overviewRegion);
                const imgs = overviewRegion?.images || null;
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
    maxHeight: '92%',
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
  ovImageBox: { alignSelf: 'center', borderRadius: 16, overflow: 'hidden', backgroundColor: '#E7D6B0' },
  ovLoading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ovLoadingText: { marginTop: 6, fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: '#8A7A5E' },
  ovHint: { fontFamily: 'Nunito', fontSize: 11.5, fontWeight: '700', color: '#8A7A5E', marginTop: 8 },
});
