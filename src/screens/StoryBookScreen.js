import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, Image, StyleSheet, ActivityIndicator, ScrollView,
  Animated, useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { colors as pt, radii } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import AudioPlayer from '../components/AudioPlayer';
import LockedStoryFallback from '../components/premium/LockedStoryFallback';
import SafeScreenHeader from '../components/layout/SafeScreenHeader';
import MagicBookEntrance from '../components/story/MagicBookEntrance';
import { getColoringImage } from '../assets/coloringImages';
import { getSavedDrawing, hasMeaningfulPaint } from '../services/drawingStorage';
import { getOfficialSceneIllustration, preloadStorySceneIllustrations } from '../services/storyImageService';
import { hasSceneAudio, getSceneAudio } from '../services/audioService';
import { markStoryBookOpened } from '../services/postStoryStorage';
import { canOpenStoryFullExperience } from '../services/contentAccessService';
import { useProgressContext } from '../context/ProgressContext';
import { useAchievementCelebration } from '../hooks/useAchievementCelebration';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';
import { images } from '../assets/images';
import BeniAvatar from '../components/beni/BeniAvatar';
import { computeBookImageSize } from '../constants/officialImage';

const PROGRESS_KEY = '@ptf_progress';
const AUTOPLAY_MS = 5000;

// Livrinho 1.0 — a arte é a PROTAGONISTA: ocupa o máximo da área disponível entre
// o header e o painel de controles (medida em tempo real), mantendo 4:5 e com tetos
// de respiro. Maior em telas altas/tablet, segura em telas pequenas (sem empurrar
// os controles). Antes da medição, cai no tamanho responsivo base (sem pulo grande).
const BOOK_ART_MAX_W = 560;    // teto de largura (tablet não vira faixa larga demais)
const BOOK_ART_SIDE_PAD = 16;  // respiro lateral da arte
const BOOK_ART_V_PAD = 10;     // respiro vertical da arte dentro da seção

/** Maior caixa 4:5 (retrato) que cabe em (availW, availH). */
function fitBookArt45(availW, availH) {
  const ratio = 4 / 5; // largura/altura
  const w = Math.max(0, Math.min(availW, availH * ratio));
  return { width: Math.round(w), height: Math.round(w / ratio) };
}

/**
 * Parses the raw saved drawing value returned by getSavedDrawing().
 *
 * v1 — raw data URL: 'data:image/png;base64,...'
 * v2 — JSON payload: '{"v":2,"W":390,"H":600,"imgX":3,...,"data":"data:image/png..."}'
 *
 * Returns { uri, W, H, imgX, imgY, imgW, imgH } or null on failure.
 */
function parseDrawingPayload(raw) {
  if (!raw) return null;
  try {
    if (raw.startsWith('data:')) {
      return { uri: raw, W: null, H: null, imgX: null, imgY: null, imgW: null, imgH: null };
    }
    const p = JSON.parse(raw);
    if (!p?.data) return null;
    return {
      uri: p.data,
      W: p.W ?? null, H: p.H ?? null,
      imgX: p.imgX ?? null, imgY: p.imgY ?? null,
      imgW: p.imgW ?? null, imgH: p.imgH ?? null,
    };
  } catch {
    return null;
  }
}

const EMPTY_LAYOUT = {
  baseImage: null, officialImage: null,
  canvasW: null, canvasH: null,
  lineartImgX: null, lineartImgY: null, lineartImgW: null, lineartImgH: null,
};

// ── Construtores de visual por tipo (cada slide carrega um destes) ──

// Arte da criança — SEMPRE com o contorno (lineart) por cima.
//   v2 (com layout)  → paintWithLineart: lineart alinhado pixel-perfect.
//   v1 (sem layout)  → paintWithLineartFull: lineart em contain, alinhado pela
//                      mesma moldura 4:5 do paint (restaura o contorno).
// Sem lineart (coloringImage) disponível → retorna null: a arte NUNCA é exibida
// sozinha; o chamador cai para oficial/fallback.
function makeChildArtVisual(cena, story, p) {
  const baseImage = getColoringImage(story.id, cena.id);
  if (!baseImage) return null; // sem contorno disponível → não mostra cor sozinha
  const fallbackColor = cena.corTema || '#A78BFA';
  const hasLayout = p.W && p.H && p.imgX !== null && p.imgY !== null && p.imgW && p.imgH;
  if (hasLayout) {
    return {
      type: 'paintWithLineart', visualType: 'childArt', seal: 'Sua arte', note: null,
      paintUri: p.uri, baseImage, officialImage: null, fallbackColor,
      canvasW: p.W, canvasH: p.H,
      lineartImgX: p.imgX, lineartImgY: p.imgY, lineartImgW: p.imgW, lineartImgH: p.imgH,
    };
  }
  return {
    type: 'paintWithLineartFull', visualType: 'childArt', seal: 'Sua arte', note: null,
    paintUri: p.uri, baseImage, officialImage: null, fallbackColor, ...EMPTY_LAYOUT,
  };
}

// Ilustração oficial da cena.
function makeOfficialVisual(cena, story, official) {
  return {
    type: 'official', visualType: 'official', seal: 'Cena ilustrada', note: null,
    paintUri: null, fallbackColor: cena.corTema || '#A78BFA', ...EMPTY_LAYOUT,
    officialImage: official,
  };
}

// Fallback elegante (gradiente + emoji + título + frase curta).
function makeFallbackVisual(cena, story, note) {
  return {
    type: 'fallback', visualType: 'fallback', seal: 'Cena especial',
    note: note || 'Imagem da cena em breve.',
    paintUri: null, fallbackColor: cena.corTema || '#A78BFA', ...EMPTY_LAYOUT,
  };
}

// sceneKey do manifesto de áudio (keyed por 'scene_01'..'scene_10', pela posição da cena)
function sceneKeyFor(sceneNumber) {
  return `scene_${String(sceneNumber).padStart(2, '0')}`;
}

function mkSlide(cena, sceneNumber, visual) {
  return {
    key: `${visual.visualType}-${cena.id}`,
    cenaId: cena.id, sceneKey: sceneKeyFor(sceneNumber),
    cena, sceneNumber, visual,
  };
}

/**
 * resolveStoryBookPageImage — resolução central de UMA imagem por cena no Livrinho.
 *
 * DOIS MODOS FINAIS (UX 1.0 — Bloco 3). Sem modo misto: cada modo é previsível
 * e visivelmente diferente, mesmo com 10 artes salvas.
 *
 *   'official' (História ilustrada): SEMPRE a ilustração oficial da cena.
 *     NUNCA troca a página pela arte da criança quando ela existe.
 *     Sem oficial → fallback seguro.
 *   'child' (Meu livrinho colorido): SOMENTE a arte da criança (com contorno).
 *     Sem arte real nesta cena → fallback suave "ainda não pintou".
 *     Nunca usa ilustração oficial (não recria a história).
 *
 * Sempre retorna um visual válido (nunca vazio, nunca require quebrado). A arte
 * da criança só é usada quando makeChildArtVisual entrega o contorno por cima
 * (Bloco 1): nenhuma página renderiza mancha de cor sem lineart.
 */
function resolveStoryBookPageImage(cena, story, drawings, mode) {
  // 'official' — História ilustrada: imagem oficial sempre, nunca a arte da criança.
  if (mode === 'official') {
    const official = getOfficialSceneIllustration(story.id, cena.id);
    if (official) return makeOfficialVisual(cena, story, official);
    return makeFallbackVisual(cena, story);
  }
  // 'child' — Meu livrinho colorido: só a arte da criança (com contorno garantido).
  const raw = drawings[cena.id] ?? null;
  if (hasMeaningfulPaint(raw)) {
    const p = parseDrawingPayload(raw);
    const childVisual = p ? makeChildArtVisual(cena, story, p) : null;
    if (childVisual) return childVisual;
  }
  return makeFallbackVisual(cena, story, 'Você ainda não pintou esta cena.');
}

/**
 * Constrói a TIMELINE do Livrinho — 1 slide por cena, conforme o modo.
 * Dois modos finais: 'official' (História ilustrada) e 'child' (Meu livrinho colorido).
 */
function buildStoryBookTimeline(story, drawings, mode) {
  return (story?.cenas ?? []).map((cena, i) =>
    mkSlide(cena, i + 1, resolveStoryBookPageImage(cena, story, drawings, mode)),
  );
}

/**
 * Computes the absolute style for the lineart overlay so it aligns pixel-perfect
 * with the paint layer (which is displayed with resizeMode="contain").
 */
// Livrinho 1.1 — a ARTE (retângulo do lineart) é a PROTAGONISTA: preenche o card.
// A arte salva é o CANVAS INTEIRO (W×H) com o desenho num sub-retângulo centralizado
// (imgX/Y/W/H) cercado de margem creme. Antes containávamos o canvas todo → arte
// pequena dentro de um card grande. Agora escalamos pelo RETÂNGULO DA ARTE (contain
// do rect no card): o canvas extrapola o card e é recortado (overflow hidden do
// frame), mostrando só a arte, grande. Paint e lineart usam a MESMA escala/âncora,
// então cor e contorno seguem alinhados pixel a pixel.
function computeArtworkScale(containerW, containerH, visual) {
  if (!containerW || !containerH || !visual.canvasW || !visual.canvasH || !visual.lineartImgW || !visual.lineartImgH) {
    return null;
  }
  const scale = Math.min(containerW / visual.lineartImgW, containerH / visual.lineartImgH);
  const rectW = visual.lineartImgW * scale;
  const rectH = visual.lineartImgH * scale;
  const rectLeft = (containerW - rectW) / 2;
  const rectTop = (containerH - rectH) / 2;
  return { scale, rectW, rectH, rectLeft, rectTop };
}

/** Estilo do CONTORNO (lineart) — preenche o card com o retângulo real da arte. */
function computeLineartStyle(containerW, containerH, visual) {
  const a = computeArtworkScale(containerW, containerH, visual);
  if (!a) return { position: 'absolute', opacity: 0 };
  return { position: 'absolute', left: a.rectLeft, top: a.rectTop, width: a.rectW, height: a.rectH };
}

/** Estilo da PINTURA (canvas inteiro) deslocado p/ o retângulo da arte cair sobre o lineart. */
function computePaintStyle(containerW, containerH, visual) {
  const a = computeArtworkScale(containerW, containerH, visual);
  if (!a) return null;
  return {
    position: 'absolute',
    left: a.rectLeft - visual.lineartImgX * a.scale,
    top: a.rectTop - visual.lineartImgY * a.scale,
    width: visual.canvasW * a.scale,
    height: visual.canvasH * a.scale,
  };
}

/**
 * Audio readiness for Livrinho auto-play. canAutoPlay is true ONLY when every
 * scene has a real ready audio file. Without audio the Livrinho advances by timer.
 */
function getStoryBookPlaybackReadiness(story) {
  if (!story?.cenas?.length) {
    return { totalScenes: 0, scenesWithAudio: 0, allScenesHaveAudio: false, canAutoPlay: false, missingAudioSceneIds: [] };
  }
  const totalScenes = story.cenas.length;
  const missingAudioSceneIds = story.cenas
    .filter((c, i) => !hasSceneAudio(story.id, sceneKeyFor(i + 1)))
    .map(c => c.id);
  const scenesWithAudio = totalScenes - missingAudioSceneIds.length;
  const allScenesHaveAudio = missingAudioSceneIds.length === 0;
  return { totalScenes, scenesWithAudio, allScenesHaveAudio, canAutoPlay: allScenesHaveAudio, missingAudioSceneIds };
}

/**
 * ChildArtWithLineart — compõe a arte da criança (cor) + o contorno (lineart)
 * garantindo que NENHUM frame mostre a cor sem o contorno.
 *
 * Problema que resolve: a cor é um data-URI base64 (decodifica quase instantâneo)
 * e o lineart é um asset require'd (carrega assíncrono). Empilhar no JSX não
 * basta — a cor aparecia alguns ms antes do lineart. Aqui as DUAS camadas são
 * renderizadas invisíveis (opacity 0) só para disparar onLoad; a composição só
 * fica visível quando `paintLoaded && lineartLoaded` (e, no modo posicionado v2,
 * quando a moldura já foi medida). Enquanto isso, mostra "Carregando desenho…".
 *
 * Estado é por instância: a key no chamador (história+cena+modo+arte) remonta a
 * cada página, então loaded/error nunca vazam de uma cena para outra.
 */
function ChildArtWithLineart({ visual, containerW, containerH }) {
  const [paintLoaded, setPaintLoaded] = useState(false);
  const [lineartLoaded, setLineartLoaded] = useState(false);

  const positioned = visual.type === 'paintWithLineart';
  // v2 (com layout): cor e contorno escalados pelo retângulo da arte → arte grande.
  const lineartAbsStyle = positioned ? computeLineartStyle(containerW, containerH, visual) : null;
  const paintAbsStyle = positioned ? computePaintStyle(containerW, containerH, visual) : null;
  // Posicionado só está pronto quando a moldura foi medida (paintAbsStyle calculado).
  const measured = !positioned || !!paintAbsStyle;
  // Só revela quando cor E contorno carregaram (e o lineart pode ser posicionado).
  const ready = paintLoaded && lineartLoaded && measured;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Camadas reais — invisíveis até cor + contorno estarem prontos juntos */}
      <View style={[StyleSheet.absoluteFill, { opacity: ready ? 1 : 0 }]}>
        <Image
          source={{ uri: visual.paintUri }}
          style={positioned && paintAbsStyle ? paintAbsStyle : styles.bookFullImage}
          resizeMode={positioned && paintAbsStyle ? 'stretch' : 'contain'}
          fadeDuration={0}
          onLoad={() => setPaintLoaded(true)}
        />
        {positioned ? (
          <Image
            source={visual.baseImage}
            style={[lineartAbsStyle, styles.lineartMultiply]}
            resizeMode="stretch"
            fadeDuration={0}
            onLoad={() => setLineartLoaded(true)}
          />
        ) : (
          <Image
            source={visual.baseImage}
            style={[StyleSheet.absoluteFill, styles.lineartMultiply]}
            resizeMode="contain"
            fadeDuration={0}
            onLoad={() => setLineartLoaded(true)}
          />
        )}
      </View>

      {/* Placeholder honesto enquanto não há composição completa */}
      {!ready && (
        <View style={[StyleSheet.absoluteFill, styles.childLoading]} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.childLoadingText}>Carregando desenho…</Text>
        </View>
      )}
    </View>
  );
}

export default function StoryBookScreen({ route, navigation }) {
  const { story, fromStoryCompletion = false } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const { width, height: screenH } = useWindowDimensions();
  const isTablet = width >= 768;

  const { refreshProgress, progressByStory, postStoryStatusByStory } = useProgressContext();

  const { pendingAchievement, checkForNewAchievements, dismissAchievement } =
    useAchievementCelebration({ progressByStory, postStoryStatusByStory, source: 'StoryBookScreen' });

  const [screenState, setScreenState] = useState('loading');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [drawings, setDrawings] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  // Modo de reprodução CONTÍNUA do Livrinho: ligado quando a criança toca Play
  // (1ª cena); ao terminar uma cena, a próxima toca sozinha. Pausa manual desliga.
  const [autoplayActive, setAutoplayActive] = useState(false);
  const [imgContainerSize, setImgContainerSize] = useState({ w: 0, h: 0 });
  // Área disponível para a arte (entre header e painel) — medida p/ dimensionar a arte.
  const [artSectionSize, setArtSectionSize] = useState({ w: 0, h: 0 });
  const [viewMode, setViewMode] = useState('official'); // 'official' (História ilustrada) | 'child' (Meu livrinho colorido)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [entering, setEntering] = useState(false); // transição mágica de abertura
  const markedRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const lockRef = useRef(false);   // trava de toques rápidos (anti avanço duplo)
  const lockTimerRef = useRef(null);

  // Timeline derivada (memoizada) — só recalcula ao trocar história, artes ou modo.
  const timeline = useMemo(
    () => buildStoryBookTimeline(story, drawings, viewMode),
    [story?.id, drawings, viewMode],
  );
  const totalSlides = timeline.length;

  useEffect(() => {
    let cancelled = false;
    // Carregamento antecipado APENAS da história aberta (sem preload global).
    // No-op hoje (manifesto vazio); reduz piscadas quando as artes IA entrarem.
    if (story?.id) preloadStorySceneIllustrations(story.id);
    async function init() {
      try {
        if (!story?.id || !Array.isArray(story.cenas)) {
          if (!cancelled) setScreenState('invalidStory');
          return;
        }
        if (!canOpenStoryFullExperience(story)) {
          if (!cancelled) setScreenState('locked');
          return;
        }
        if (story.cenas.length === 0) {
          if (!cancelled) setScreenState('emptyScenes');
          return;
        }
        const raw = await AsyncStorage.getItem(`${PROGRESS_KEY}_${story.id}`);
        const progresso = raw ? JSON.parse(raw) : {};
        const allDone = story.cenas.every(cena => !!progresso[cena.id]);
        if (!allDone) {
          if (!cancelled) setScreenState('notCompleted');
          return;
        }
        const drawingMap = {};
        await Promise.all(
          story.cenas.map(async (cena) => {
            drawingMap[cena.id] = await getSavedDrawing(story.id, cena.id);
          }),
        );
        if (!cancelled) {
          setDrawings(drawingMap);
          setScreenState('intro');
        }
      } catch {
        if (!cancelled) setScreenState('error');
      }
    }
    init();
    return () => { cancelled = true; };
  }, [story?.id]);

  // DEV: relata cenas sem som (autoplay cai no timer nelas). A Criação tem os 10.
  useEffect(() => {
    if (!__DEV__ || !story?.id) return;
    const r = getStoryBookPlaybackReadiness(story);
    if (r.missingAudioSceneIds.length) {
      if (__DEV__) console.log('[StoryBook][DEV] cenas sem som:', r.missingAudioSceneIds, '— autoplay por timer');
    } else if (__DEV__) {
      console.log('[StoryBook][DEV] todas as', r.totalScenes, 'cenas têm som (autoplay contínuo)');
    }
  }, [story?.id]);

  // Fade-in do slide atual. SEMPRE termina em 1 (defesa contra imagem "presa
  // quase branca"): cada troca de slide/modo reinicia a opacidade e anima até 1.
  useEffect(() => {
    if (screenState !== 'playing') return undefined;
    // Opacidade inicial alta (0.85) — fade suave sem parecer imagem branca/apagada.
    fadeAnim.setValue(0.85);
    const anim = Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [currentSlideIndex, viewMode, screenState]);

  // Limpeza de timers ao desmontar.
  useEffect(() => () => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
  }, []);

  // Auto-avanço por TIMER quando a cena do slide não tem áudio. Um único timer
  // por vez (efeito único, limpo a cada troca). Com áudio, o AudioPlayer avança.
  useEffect(() => {
    if (screenState !== 'playing' || isPaused) return undefined;
    const slide = timeline[currentSlideIndex];
    if (!slide) return undefined;
    if (hasSceneAudio(story.id, slide.sceneKey)) return undefined;
    const timer = setTimeout(() => { advanceToNextScene(); }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [screenState, currentSlideIndex, isPaused, viewMode]);

  // Entrada mágica: toca o botão → transição curta → leitura.
  function handleEnterLivrinho() {
    setEntering(true);
  }

  // bookOpened marcado só aqui — quando a criança "abre" o livrinho.
  function handleStartLivrinho() {
    if (!markedRef.current) {
      markedRef.current = true;
      markStoryBookOpened(story.id);
      refreshProgress();
      setTimeout(() => { checkForNewAchievements(); }, 1000);
    }
    setEntering(false);
    fadeAnim.setValue(1);
    setCurrentSlideIndex(0);
    setIsPaused(false);
    setAutoplayActive(false); // 1ª cena espera o Play da criança; depois segue sozinho
    setScreenState('playing');
  }

  // Trava de toques rápidos: ignora próximo/anterior/play enquanto transiciona;
  // o setTimeout SEMPRE libera a trava e força opacidade 1 (à prova de toque rápido).
  function beginLock() {
    lockRef.current = true;
    setIsTransitioning(true);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      lockRef.current = false;
      setIsTransitioning(false);
      fadeAnim.setValue(1); // garante que nada fique preso em baixa opacidade
    }, 260);
  }

  function advanceToNextScene() {
    if (lockRef.current) return;
    if (currentSlideIndex >= totalSlides - 1) {
      if (__DEV__) console.log('[StoryBook] last scene reached → ended (no loop)');
      setScreenState('ended'); // não tenta avançar p/ cena inexistente, sem loop
    } else {
      if (__DEV__) console.log('[StoryBook] advance to scene', currentSlideIndex + 2, 'continuous=', autoplayActive);
      beginLock();
      setCurrentSlideIndex(i => i + 1);
      setIsPaused(false);
      // continuousPlayback (autoplayActive) NÃO é alterado aqui: o fim natural do
      // áudio mantém o modo contínuo → a próxima cena toca sozinha (gate isLoaded).
    }
  }

  function onSceneAudioComplete() {
    if (__DEV__) console.log('[StoryBook] finished scene', currentSlideIndex + 1);
    advanceToNextScene();
  }

  function handlePrevScene() {
    if (lockRef.current) return;
    if (currentSlideIndex === 0) {
      setScreenState('intro');
    } else {
      beginLock();
      setCurrentSlideIndex(i => i - 1);
      setIsPaused(false);
    }
  }

  function handleNextScene() {
    advanceToNextScene();
  }

  // "Ver de novo" — reinicia o livrinho no modo atual, do primeiro slide.
  function handleReplay() {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockRef.current = false;
    setIsTransitioning(false);
    fadeAnim.setValue(1);
    setCurrentSlideIndex(0);
    setIsPaused(false);
    setAutoplayActive(false);
    setScreenState('playing'); // sai de 'ended' (finished → false)
  }

  // "Escolher outro modo" — volta para a tela de seleção SEM sair do StoryBookScreen.
  function handleChooseMode() {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockRef.current = false;
    setIsTransitioning(false);
    fadeAnim.setValue(1);
    setCurrentSlideIndex(0);
    setIsPaused(false);
    setAutoplayActive(false);
    setScreenState('intro'); // mostra de novo os 3 modos (finished → false)
  }

  function handleTogglePause() {
    if (lockRef.current) return;
    setIsPaused(p => !p);
  }

  // Trocar de modo: pausa, reseta a timeline para o começo e opacidade em 1.
  function handleSelectMode(id) {
    setViewMode(id);
    setCurrentSlideIndex(0);
    setIsPaused(false);
    setAutoplayActive(false);
    fadeAnim.setValue(1);
  }

  const handleImageAreaLayout = useCallback((e) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setImgContainerSize({ w, h });
  }, []);

  // Mede a área disponível para a arte (entre header e painel de controles).
  const handleArtSectionLayout = useCallback((e) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setArtSectionSize((prev) => (
      prev.w === Math.round(w) && prev.h === Math.round(h) ? prev : { w: Math.round(w), h: Math.round(h) }
    ));
  }, []);

  // ── loading ──
  if (screenState === 'loading') {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Abrindo seu Livrinho…</Text>
      </View>
    );
  }

  // ── locked ──
  if (screenState === 'locked') {
    return (
      <LockedStoryFallback
        onBack={() => navigation.navigate('Home')}
        onCallResponsible={() => navigation.navigate('ParentArea')}
        title="Seu Livrinho da Fé é Plano Família."
        subtitle="Peça para um responsável abrir essa área com você."
      />
    );
  }

  // ── invalidStory ──
  if (screenState === 'invalidStory') {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateEmoji}>📖</Text>
        <Text style={styles.stateTitle}>História não encontrada.</Text>
        <SoundButton style={styles.stateBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
          <Text style={styles.stateBtnText}>🏠 Voltar para o início</Text>
        </SoundButton>
      </View>
    );
  }

  // ── emptyScenes ──
  if (screenState === 'emptyScenes') {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateEmoji}>📭</Text>
        <Text style={styles.stateTitle}>Essa história ainda não tem cenas.</Text>
        <SoundButton style={styles.stateBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
          <Text style={styles.stateBtnText}>🏠 Voltar para o início</Text>
        </SoundButton>
      </View>
    );
  }

  // ── notCompleted ──
  if (screenState === 'notCompleted') {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateEmoji}>🌟</Text>
        <Text style={styles.stateTitle}>Continue a aventura!</Text>
        <Text style={styles.stateSub}>
          Complete todas as cenas para desbloquear seu Livrinho da Fé.
        </Text>
        <SoundButton
          style={styles.stateBtn}
          onPress={() => navigation.navigate('StoryDetail', { story })}
          activeOpacity={0.85}
        >
          <Text style={styles.stateBtnText}>▶ Continuar história</Text>
        </SoundButton>
        <SoundButton style={[styles.stateBtn, { marginTop: 10, backgroundColor: 'transparent', elevation: 0, borderWidth: 1.5, borderColor: colors.primary }]} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
          <Text style={[styles.stateBtnText, { color: colors.primary }]}>🏠 Ir para o início</Text>
        </SoundButton>
      </View>
    );
  }

  // ── error ──
  if (screenState === 'error') {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateEmoji}>😕</Text>
        <Text style={styles.stateTitle}>Algo deu errado.</Text>
        <SoundButton style={styles.stateBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.stateBtnText}>← Voltar</Text>
        </SoundButton>
      </View>
    );
  }

  // ── Shared gradient header (intro + ended) ──
  function renderHeader(emoji, title, subtitle) {
    return (
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}
      >
        <View style={styles.headerNav}>
          <SoundButton style={styles.headerNavBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Text style={styles.headerNavText}>← Voltar</Text>
          </SoundButton>
          <SoundButton style={styles.headerNavBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.75}>
            <Text style={styles.headerNavText}>🏠</Text>
          </SoundButton>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>{emoji}</Text>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
      </LinearGradient>
    );
  }

  // ── intro ──
  if (screenState === 'intro') {
    const hasCover = story.imagemCapa && images[story.imagemCapa];
    const totalScenes = story.cenas.length;
    const childArtCount = story.cenas.filter(c => hasMeaningfulPaint(drawings[c.id])).length;
    // Prévia do modo "História ilustrada" — ilustração oficial da 1ª cena (ou capa).
    const firstCena = story.cenas[0];
    const officialPreview = firstCena ? getOfficialSceneIllustration(story.id, firstCena.id) : null;
    return (
      <View style={styles.wrapper}>
        {renderHeader('📖', 'Livrinho da Fé', story.titulo)}

        <ScrollView
          style={styles.introScroll}
          contentContainerStyle={[
            styles.introScrollContent,
            isTablet && styles.introScrollContentTablet,
            { paddingBottom: Math.max(insets.bottom + 32, 48) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCoverCard}>
            {hasCover ? (
              <Image source={images[story.imagemCapa]} style={styles.introCoverImage} resizeMode="contain" />
            ) : (
              <View style={styles.introCoverFallback}>
                <Text style={styles.introCoverEmoji}>{story.emoji ?? '📖'}</Text>
              </View>
            )}
          </View>

          <Text style={styles.introCoverTitle}>{story.titulo}</Text>
          {!!story.referencia && (
            <Text style={styles.introCoverRef}>{story.referencia}</Text>
          )}
          <Text style={styles.introDesc}>
            Sua aventura ficou guardada aqui. Reveja cada cena com carinho.
          </Text>

          <View style={styles.beniReaderRow}>
            <BeniAvatar variant="reading" size="small" />
            <Text style={styles.beniReaderText}>
              Beni vai recontar sua aventura com as imagens da história e suas artes.
            </Text>
          </View>

          {/* Resumo: cenas · suas artes (o Livrinho é feito com os desenhos da criança) */}
          <View style={styles.introStatsRow}>
            <View style={styles.introStat}>
              <Text style={styles.introStatNum}>{totalScenes}</Text>
              <Text style={styles.introStatLabel}>{totalScenes === 1 ? 'cena' : 'cenas'}</Text>
            </View>
            <View style={styles.introStat}>
              <Text style={styles.introStatNum}>{childArtCount}</Text>
              <Text style={styles.introStatLabel}>{childArtCount === 1 ? 'sua arte' : 'suas artes'}</Text>
            </View>
          </View>

          {childArtCount > 0 && (
            <View style={styles.introArtHighlight}>
              <Text style={styles.introArtHighlightText}>
                ✨ Você colocou sua arte neste livrinho.
              </Text>
            </View>
          )}

          {/* ── Escolha de modo: 2 modos reais, previsíveis e visivelmente diferentes ── */}
          <Text style={styles.modeTitle}>Como você quer ver?</Text>
          <View style={styles.modeList}>
            {[
              { id: 'official', emoji: '📖', title: 'História ilustrada', sub: 'Reveja a aventura com as imagens da história.' },
              { id: 'child', emoji: '🎨', title: 'Meu livrinho colorido', sub: 'Veja as cenas que você pintou.' },
            ].map(opt => {
              const active = viewMode === opt.id;
              return (
                <SoundButton
                  key={opt.id}
                  style={[styles.modeCard, active && styles.modeCardActive]}
                  onPress={() => handleSelectMode(opt.id)}
                  activeOpacity={0.85}
                  accessibilityLabel={opt.title}
                >
                  {/* Prévia visual distinta por modo (entende-se a diferença em 5s) */}
                  {opt.id === 'official' ? (
                    officialPreview ? (
                      <Image source={officialPreview} style={styles.modePreview} resizeMode="contain" />
                    ) : hasCover ? (
                      <Image source={images[story.imagemCapa]} style={styles.modePreview} resizeMode="contain" />
                    ) : (
                      <View style={[styles.modePreview, styles.modePreviewOfficial]}>
                        <Text style={styles.modePreviewEmoji}>📖</Text>
                      </View>
                    )
                  ) : (
                    <View style={[styles.modePreview, styles.modePreviewChild]}>
                      <Text style={styles.modePreviewEmoji}>🎨</Text>
                      <Text style={styles.modePreviewBadge}>{childArtCount}</Text>
                    </View>
                  )}
                  <View style={styles.modeTextWrap}>
                    <Text style={[styles.modeCardTitle, active && styles.modeCardTitleActive]}>{opt.title}</Text>
                    <Text style={styles.modeCardSub}>{opt.sub}</Text>
                  </View>
                  <View style={[styles.modeRadio, active && styles.modeRadioActive]}>
                    {active && <Text style={styles.modeRadioDot}>✓</Text>}
                  </View>
                </SoundButton>
              );
            })}
          </View>

          {viewMode === 'child' && childArtCount === 0 ? (
            /* ── Meu livrinho colorido sem nenhuma arte: estado vazio honesto + CTA ── */
            <View style={styles.bookEmptyState}>
              <Text style={styles.bookEmptyEmoji}>🎨</Text>
              <Text style={styles.bookEmptyTitle}>Você ainda não pintou cenas desta aventura.</Text>
              <Text style={styles.bookEmptySub}>
                Pinte uma cena para criar seu livrinho colorido.
              </Text>
              <SoundButton
                style={styles.startBtn}
                onPress={() => navigation.navigate('Coloring', { story, cenaIndex: 0 })}
                activeOpacity={0.85}
              >
                <Text style={styles.startBtnText}>🎨  Colorir uma cena</Text>
              </SoundButton>
            </View>
          ) : (
            <SoundButton style={styles.startBtn} onPress={handleEnterLivrinho} activeOpacity={0.85}>
              <Text style={styles.startBtnText}>
                {viewMode === 'child' ? '▶  Abrir meu livrinho colorido' : '▶  Abrir história ilustrada'}
              </Text>
            </SoundButton>
          )}
        </ScrollView>

        {/* Entrada mágica do Livrinho (overlay curto antes da leitura) */}
        {entering && (
          <MagicBookEntrance
            emoji={story.emoji ?? '📖'}
            onDone={handleStartLivrinho}
          />
        )}
      </View>
    );
  }

  // ── ended ──
  if (screenState === 'ended') {
    return (
      <View style={styles.wrapper}>
        {renderHeader('📖', 'Livrinho da Fé', story.titulo)}
        <ScrollView
          contentContainerStyle={[styles.endedBody, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.endedIconCircle}>
            <Text style={styles.endedIcon}>🙏</Text>
          </View>
          <Text style={styles.endedTitle}>Você completou esta aventura!</Text>
          <Text style={styles.endedSub}>
            Beni ficou muito feliz em ler esta história com você.
          </Text>
          <BeniAvatar variant="celebrating" size="small" style={{ alignSelf: 'center', marginBottom: 16 }} />

          {fromStoryCompletion && (
            <SoundButton style={styles.endedConclusionBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Text style={styles.endedConclusionBtnText}>🏆  Ver conclusão</Text>
            </SoundButton>
          )}

          <SoundButton style={styles.endedReplayBtn} onPress={handleReplay} activeOpacity={0.85}>
            <Text style={styles.endedReplayBtnText}>↩  Ver de novo</Text>
          </SoundButton>

          <SoundButton style={styles.endedModeBtn} onPress={handleChooseMode} activeOpacity={0.85}>
            <Text style={styles.endedModeBtnText}>📖  Escolher outro modo</Text>
          </SoundButton>

          <SoundButton
            style={styles.endedBackBtn}
            onPress={() => navigation.navigate('Home', { screen: 'Aventuras' })}
            activeOpacity={0.85}
          >
            <Text style={styles.endedBackBtnText}>← Voltar para Aventuras</Text>
          </SoundButton>
        </ScrollView>
      </View>
    );
  }

  // ── playing ──
  const safeIndex = Math.min(currentSlideIndex, Math.max(0, totalSlides - 1));
  const slide = timeline[safeIndex] ?? timeline[0];
  const visual = slide.visual;
  const cena = slide.cena;
  const totalScenes = story.cenas.length;
  const progressPct = totalSlides > 0 ? Math.round(((safeIndex + 1) / totalSlides) * 100) : 0;

  const audioAsset = hasSceneAudio(story.id, slide.sceneKey)
    ? (getSceneAudio(story.id, slide.sceneKey)?.audioAsset ?? null)
    : null;

  // key estável por slide (mode + sceneId + visualType + índice) → Image remonta
  // limpo a cada troca, evitando base64 "preso" da cena anterior.
  const slideKey = `${viewMode}-${slide.key}-${safeIndex}`;

  // Tamanho 4:5 do Livrinho — a arte é PROTAGONISTA: preenche a área medida entre
  // header e painel (maior em telas altas/tablet), com tetos de respiro. Antes da
  // medição, usa o tamanho responsivo base (sem pulo grande na 1ª pintura).
  const fallbackBookSize = computeBookImageSize(width, screenH);
  const bookSize = (artSectionSize.w > 0 && artSectionSize.h > 0)
    ? fitBookArt45(
        Math.min(artSectionSize.w - BOOK_ART_SIDE_PAD * 2, BOOK_ART_MAX_W),
        artSectionSize.h - BOOK_ART_V_PAD * 2,
      )
    : fallbackBookSize;
  // Arte da criança é PNG com transparência: precisa de fundo CLARO (senão fica preta)
  const isUserArt = visual.type === 'paintWithLineart' || visual.type === 'paintWithLineartFull';

  return (
    <View style={styles.bookPlayerRoot}>

      {/* ── Header escuro seguro ── */}
      <SafeScreenHeader
        title={story.titulo}
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('Home')}
        backgroundColor="rgba(0,0,0,0.85)"
        variant="dark"
      />

      {/* ── Imagem 4:5 protagonista — ocupa a área medida entre header e painel ── */}
      <View style={styles.bookImageSection} onLayout={handleArtSectionLayout}>
        <Animated.View key={slideKey} style={[styles.bookSlideWrap, { opacity: fadeAnim }]}>
          <View
            style={[
              styles.bookArtFrame,
              { width: bookSize.width, height: bookSize.height,
                backgroundColor: isUserArt ? '#FFFDF8' : '#0B0B0B' },
            ]}
            onLayout={handleImageAreaLayout}
          >
            {isUserArt ? (
              // Arte da criança: composição cor + contorno com readiness explícita.
              // NUNCA mostra a cor sem o lineart (nem por 1 frame) — ver ChildArtWithLineart.
              // key estável (história+cena+modo+arte) força remount limpo por página.
              <ChildArtWithLineart
                key={`art-${story.id}-${cena.id}-${viewMode}-${(visual.paintUri || '').length}`}
                visual={visual}
                containerW={imgContainerSize.w}
                containerH={imgContainerSize.h}
              />
            ) : visual.type === 'official' ? (
              // Oficial na moldura fixa 4:5 + contain (width/height 100%) → nasce encaixada, sem zoom
              <Image
                source={visual.officialImage}
                style={styles.bookFullImage}
                resizeMode="contain"
                onLoadEnd={() => fadeAnim.setValue(1)}
              />
            ) : (
              <LinearGradient
                colors={[visual.fallbackColor, visual.fallbackColor + '99']}
                style={StyleSheet.absoluteFill}
              >
                <View style={styles.fallbackCenter}>
                  <Text style={styles.fallbackEmoji}>{cena.emojiCena ?? '🎨'}</Text>
                  <Text style={styles.fallbackTitle}>{cena.titulo}</Text>
                  <Text style={styles.fallbackSub}>{visual.note}</Text>
                </View>
              </LinearGradient>
            )}

            <View style={styles.sealPill} pointerEvents="none">
              <Text style={styles.sealPillText}>{visual.seal}</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* ── Painel inferior separado (título, progresso, controles) ── */}
      <View style={[styles.bookBottomPanel, { paddingBottom: Math.max(insets.bottom + 20, 32) }]}>

        <View style={styles.sceneInfoRow}>
          <Text style={styles.sceneInfoEmoji}>{cena.emojiCena ?? '✨'}</Text>
          <View style={styles.sceneInfoText}>
            <Text style={styles.sceneInfoTitle} numberOfLines={1}>{cena.titulo}</Text>
            {!!cena.licaoCurta && (
              <Text style={styles.sceneInfoLicao} numberOfLines={2}>{cena.licaoCurta}</Text>
            )}
          </View>
        </View>

        {/* ── Área de áudio: card dominante (com áudio) OU controle de tempo (sem áudio) ── */}
        {audioAsset ? (
          <AudioPlayer
            key={slideKey}
            audioAsset={audioAsset}
            onFinished={onSceneAudioComplete}
            paused={isPaused}
            autoPlay={autoplayActive}
            onPlayStart={() => setAutoplayActive(true)}
            onUserPause={() => setAutoplayActive(false)}
          />
        ) : (
          <View style={styles.noAudioCard}>
            <SoundButton
              style={styles.noAudioBtn}
              onPress={handleTogglePause}
              activeOpacity={0.85}
              accessibilityLabel={isPaused ? 'Continuar livrinho' : 'Pausar livrinho'}
            >
              <Text style={styles.noAudioBtnText}>{isPaused ? '▶' : '❚❚'}</Text>
            </SoundButton>
            <Text style={styles.noAudioLabel}>
              {isPaused ? 'Em pausa. Toque para continuar.' : 'Virando as páginas com você…'}
            </Text>
          </View>
        )}

        {/* ── Navegação de páginas — secundária (setas pequenas + contador + barra fina) ── */}
        <View style={styles.pageNavRow}>
          <SoundButton style={styles.pageArrow} onPress={handlePrevScene} activeOpacity={0.8} accessibilityLabel="Página anterior">
            <Text style={styles.pageArrowText}>‹</Text>
          </SoundButton>
          <View style={styles.pageCenter}>
            <Text style={styles.pageCounter}>Página {slide.sceneNumber} de {totalScenes}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>
          <SoundButton style={styles.pageArrow} onPress={handleNextScene} activeOpacity={0.8} accessibilityLabel="Próxima página">
            <Text style={styles.pageArrowText}>›</Text>
          </SoundButton>
        </View>

      </View>

      {pendingAchievement && (
        <AchievementUnlockModal
          achievement={pendingAchievement}
          onDismiss={dismissAchievement}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Shared center states ──
  centerState: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 32, backgroundColor: pt.background,
  },
  loadingText: { fontFamily: 'Nunito', fontSize: 15, color: pt.textSoft, marginTop: 12 },
  stateEmoji: { fontSize: 60, marginBottom: 16 },
  stateTitle: {
    fontFamily: 'FredokaOne', fontSize: 22, color: pt.text,
    textAlign: 'center', marginBottom: 10,
  },
  stateSub: {
    fontFamily: 'Nunito', fontSize: 15, color: pt.textSoft,
    textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  stateBtn: {
    backgroundColor: colors.primary, borderRadius: radii.pill,
    paddingVertical: 14, paddingHorizontal: 32,
    elevation: 4, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  stateBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },

  // ── Wrapper (intro + ended) ──
  wrapper: { flex: 1, backgroundColor: pt.background },

  // ── Header (intro + ended) ──
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  headerNavBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  headerNavText: {
    fontFamily: 'Nunito', fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700',
  },
  headerContent: { alignItems: 'center' },
  headerEmoji: { fontSize: 38, marginBottom: 4 },
  headerTitle: {
    fontFamily: 'FredokaOne', fontSize: 19, color: '#FFF',
    textAlign: 'center', marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.8)',
  },

  // ── Intro ──
  introScroll: { flex: 1 },
  introScrollContent: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
  introScrollContentTablet: { paddingHorizontal: 64 },
  introCoverCard: {
    width: '100%', aspectRatio: 16 / 9,
    borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#E8E0D8', marginBottom: 20,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8,
  },
  introCoverImage: { width: '100%', height: '100%' },
  introCoverFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  introCoverEmoji: { fontSize: 80 },
  introDesc: {
    fontFamily: 'Nunito', fontSize: 15, color: pt.textSoft,
    textAlign: 'center', lineHeight: 22, marginBottom: 12,
  },
  beniReaderRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(108,158,255,0.25)',
  },
  beniReaderText: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, fontWeight: '700', flex: 1,
  },
  introStatsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16,
  },
  introStat: {
    minWidth: 86, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.18)',
  },
  introStatNum: { fontFamily: 'FredokaOne', fontSize: 22, color: colors.primary },
  introStatLabel: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, fontWeight: '700',
    textAlign: 'center', marginTop: 2,
  },
  introArtHighlight: {
    backgroundColor: '#FFF6E0', borderRadius: 16,
    paddingVertical: 10, paddingHorizontal: 16, marginBottom: 22,
    borderWidth: 1, borderColor: '#FFE0A3',
  },
  // Estado vazio: sem desenhos salvos (o Livrinho é recompensa de criação)
  bookEmptyState: {
    alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, width: '100%',
  },
  bookEmptyEmoji: { fontSize: 56, marginBottom: 12 },
  bookEmptyTitle: {
    fontFamily: 'FredokaOne', fontSize: 19, color: pt.text,
    textAlign: 'center', marginBottom: 8,
  },
  bookEmptySub: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft,
    textAlign: 'center', lineHeight: 21, marginBottom: 22,
  },
  introArtHighlightText: {
    fontFamily: 'Nunito', fontSize: 14, color: '#8A6D00', fontWeight: '700', textAlign: 'center',
  },

  // ── Escolha de modo ──
  modeTitle: {
    fontFamily: 'FredokaOne', fontSize: 17, color: pt.text,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  modeList: { width: '100%', gap: 10, marginBottom: 22 },
  modeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF', borderRadius: 18,
    paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 2, borderColor: pt.border,
  },
  modeCardActive: { borderColor: colors.primary, backgroundColor: '#F6F1FF' },
  modeEmoji: { fontSize: 30 },
  // Prévia visual de cada modo (52×52): ilustração oficial vs. tile colorido.
  modePreview: {
    width: 52, height: 52, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#EFE7DA', alignItems: 'center', justifyContent: 'center',
  },
  modePreviewOfficial: { backgroundColor: '#E8E0D8' },
  modePreviewChild: { backgroundColor: '#FFF1D9', borderWidth: 1, borderColor: '#FFD98A' },
  modePreviewEmoji: { fontSize: 26 },
  modePreviewBadge: {
    position: 'absolute', right: 3, bottom: 2,
    fontFamily: 'FredokaOne', fontSize: 11, color: '#8A6D00',
    backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 8,
    paddingHorizontal: 5, overflow: 'hidden',
  },
  modeTextWrap: { flex: 1 },
  modeCardTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 1 },
  modeCardTitleActive: { color: colors.primary },
  modeCardSub: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 16 },
  modeRadio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: pt.border,
    justifyContent: 'center', alignItems: 'center',
  },
  modeRadioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  modeRadioDot: { fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF' },

  startBtn: {
    backgroundColor: colors.action, borderRadius: radii.pill,
    paddingVertical: 18, paddingHorizontal: 40,
    width: '100%', alignItems: 'center',
    elevation: 6, shadowColor: colors.action,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  startBtnText: { fontFamily: 'FredokaOne', fontSize: 20, color: '#FFF' },

  // ── Ended ──
  endedBody: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 28, paddingTop: 28, gap: 12,
  },
  endedIconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#F6F1FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2, borderColor: 'rgba(124,58,237,0.18)',
  },
  endedIcon: { fontSize: 48 },
  endedTitle: {
    fontFamily: 'FredokaOne', fontSize: 22, color: pt.text,
    textAlign: 'center', marginBottom: 2,
  },
  endedSub: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft,
    textAlign: 'center', lineHeight: 21, marginBottom: 18,
  },
  // Principal — forte (coral/dourado)
  endedReplayBtn: {
    backgroundColor: colors.action, borderRadius: radii.pill,
    paddingVertical: 17, paddingHorizontal: 40, alignItems: 'center',
    width: '100%',
    elevation: 6, shadowColor: colors.action,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  endedReplayBtnText: { fontFamily: 'FredokaOne', fontSize: 19, color: '#FFF' },
  // Secundário importante — creme com borda dourada
  endedModeBtn: {
    backgroundColor: '#FFF6E0', borderRadius: radii.pill,
    paddingVertical: 15, paddingHorizontal: 36, alignItems: 'center',
    width: '100%',
    borderWidth: 2, borderColor: '#FFCE5A',
    elevation: 2, shadowColor: '#FFC02D',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5,
  },
  endedModeBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#8A6D00' },
  // Terciário — discreto mas claramente clicável (não cinza apagado)
  endedBackBtn: {
    backgroundColor: '#F0EAFB', borderRadius: radii.pill,
    paddingVertical: 14, paddingHorizontal: 36, alignItems: 'center',
    width: '100%',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)',
  },
  endedBackBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: colors.primary },

  // ── Playing ──
  playingWrapper: { flex: 1, backgroundColor: '#111' },
  playingTopBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.72)', gap: 8, zIndex: 10,
  },
  playingNavBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  playingNavBtnText: {
    fontFamily: 'Nunito', fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700',
  },
  playingTopTitle: {
    flex: 1, fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF', textAlign: 'center',
  },

  // Raiz do player do Livrinho
  bookPlayerRoot: { flex: 1, backgroundColor: '#000' },

  // Seção da imagem: OCUPA a área entre header e painel (flex:1) e centraliza a
  // arte 4:5 — sem faixa preta sobrando e com a arte o maior possível por tela.
  bookImageSection: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  bookSlideWrap: { alignSelf: 'center' },
  // Moldura 4:5 (tamanho e cor de fundo via inline: claro p/ arte da criança)
  bookArtFrame: {
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
  },
  // Imagem ocupa a moldura inteira (width/height 100% num container de tamanho
  // FIXO → nasce encaixada, sem absoluteFill que causava zoom no primeiro frame)
  bookFullImage: { width: '100%', height: '100%' },
  // Painel inferior COMPACTO — logo abaixo da imagem (sem roubar altura).
  // O espaço vazio fica DEPOIS dos controles (fundo preto do root), não acima da imagem.
  bookBottomPanel: {
    backgroundColor: 'rgba(0,0,0,0.92)',
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  lineartMultiply: { mixBlendMode: 'multiply' },

  // Placeholder enquanto cor + contorno não estão prontos (arte da criança)
  childLoading: {
    backgroundColor: '#FFFDF8',
    alignItems: 'center', justifyContent: 'center',
  },
  childLoadingText: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    fontWeight: '700', marginTop: 8,
  },

  sealPill: {
    position: 'absolute', left: 12, bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  sealPillText: { fontFamily: 'Nunito', fontSize: 12, color: '#FFF', fontWeight: '700' },

  fallbackCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  fallbackEmoji: { fontSize: 80, marginBottom: 16 },
  fallbackTitle: {
    fontFamily: 'FredokaOne', fontSize: 22, color: '#FFF', textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4,
  },
  fallbackSub: {
    fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.9)',
    textAlign: 'center', marginTop: 10, fontStyle: 'italic',
  },

  playingBottomPanel: {
    backgroundColor: 'rgba(0,0,0,0.88)', paddingHorizontal: 16, paddingTop: 12,
  },
  sceneInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  sceneInfoEmoji: { fontSize: 22 },
  sceneInfoText: { flex: 1 },
  sceneInfoTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF', marginBottom: 2 },
  sceneInfoLicao: {
    fontFamily: 'Nunito', fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 17,
  },

  progressTrack: {
    height: 4, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden', marginTop: 6,
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#FFC02D' },

  // Controle de tempo quando NÃO há áudio real (mantém play/pause do autoplay)
  noAudioCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, marginVertical: 8,
  },
  noAudioBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FFC02D', justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#FFC02D',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.45, shadowRadius: 6,
  },
  noAudioBtnText: { fontFamily: 'FredokaOne', fontSize: 20, color: '#3A2A00' },
  noAudioLabel: {
    flex: 1, fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '700',
  },

  // Navegação de páginas — secundária (setas pequenas, contador, barra fina)
  pageNavRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8,
  },
  pageArrow: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  pageArrowText: { fontFamily: 'FredokaOne', fontSize: 24, color: '#FFF', marginTop: -3 },
  pageCenter: { flex: 1 },
  pageCounter: {
    fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '700',
    textAlign: 'center',
  },

  // Capa editorial da intro
  introCoverTitle: {
    fontFamily: 'FredokaOne', fontSize: 22, color: colors.primary,
    textAlign: 'center', marginTop: 4, marginBottom: 2,
  },
  introCoverRef: {
    fontFamily: 'Nunito', fontSize: 13, color: '#9A6B12',
    textAlign: 'center', marginBottom: 8, fontWeight: '700',
  },

  // Ended: botão "Ver conclusão"
  endedConclusionBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: radii.pill, paddingVertical: 14, paddingHorizontal: 28,
    alignItems: 'center', marginHorizontal: 20, marginBottom: 10,
    elevation: 4, shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  endedConclusionBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
});
