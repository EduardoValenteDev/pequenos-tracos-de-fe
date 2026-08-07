import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, Image, StyleSheet, ActivityIndicator, ScrollView,
  Animated, useWindowDimensions, AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { colors as pt, radii } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import AudioPlayer from '../components/AudioPlayer';
import LockedStoryFallback from '../components/premium/LockedStoryFallback';
import SafeScreenHeader from '../components/layout/SafeScreenHeader';
import MagicBookEntrance from '../components/story/MagicBookEntrance';
import { preloadStorySceneIllustrations } from '../services/storyImageService';
import { resolveSceneImageForStory, useSandboxScenePackEntry } from '../hooks/useResolvedStoryMedia';
import { resolveRemoteAudioSource } from '../hooks/useResolvedStoryMedia';
import { hasSceneAudio, getSceneAudio } from '../services/audioService';
import { markStoryBookOpened } from '../services/postStoryStorage';
import { canOpenStoryFullExperience } from '../services/contentAccessService';
import { useProgressContext } from '../context/ProgressContext';
import { useAchievementCelebration } from '../hooks/useAchievementCelebration';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';
import { images } from '../assets/images';
import BeniAvatar from '../components/beni/BeniAvatar';
import { computeBookImageSize } from '../constants/officialImage';
import { breakpoints } from '../theme/tokens';
import { ROUTES } from '../constants/routes';

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

// ── Construtores de visual por tipo (cada slide carrega um destes) ──
//
// [P3J] O visual "arte da criança" (paintWithLineart / paintWithLineartFull) foi APOSENTADO
// junto com o Colorir legado. Ele só existia porque havia um lineart por cena para compor
// por cima da pintura: sem contorno, a página mostraria mancha de cor, e a regra desta tela
// sempre foi "a arte NUNCA é exibida sozinha". Sem lineart não há visual possível — então o
// tipo inteiro sai, em vez de virar um caminho morto que nunca resolve.

// Ilustração oficial da cena.
function makeOfficialVisual(cena, story, official) {
  return {
    type: 'official', visualType: 'official', seal: 'Cena ilustrada', note: null,
    fallbackColor: cena.corTema || '#A78BFA',
    officialImage: official,
  };
}

// Fallback elegante (gradiente + emoji + título + frase curta).
function makeFallbackVisual(cena, story, note) {
  return {
    type: 'fallback', visualType: 'fallback', seal: 'Cena especial',
    note: note || 'Imagem da cena em breve.',
    fallbackColor: cena.corTema || '#A78BFA', officialImage: null,
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
 * MODO ÚNICO (UX 1.0 — Bloco 3, revisto no P3J): "História ilustrada" — SEMPRE a
 * ilustração oficial da cena; sem oficial → fallback seguro. O antigo modo "Meu livrinho
 * colorido" dependia do lineart legado por cena e saiu com ele (ver os construtores acima).
 *
 * Sempre retorna um visual válido (nunca vazio, nunca require quebrado).
 */
function resolveStoryBookPageImage(cena, story, scenePackEntry) {
  // F2.1h v2: imagem oficial via resolveSceneImageForStory (gated a david_goliath;
  // fallback local IDÊNTICO com índice vazio; file:// só com pack ready no sandbox).
  // Retorna sempre um source de <Image> (require OU { uri }), nunca o envelope.
  const official = resolveSceneImageForStory(story.id, cena.id, scenePackEntry);
  if (official) return makeOfficialVisual(cena, story, official);
  return makeFallbackVisual(cena, story);
}

/** Constrói a TIMELINE do Livrinho — 1 slide por cena, no modo único ilustrado. */
function buildStoryBookTimeline(story, scenePackEntry) {
  return (story?.cenas ?? []).map((cena, i) =>
    mkSlide(cena, i + 1, resolveStoryBookPageImage(cena, story, scenePackEntry)),
  );
}

// [P3J] computeArtworkScale / computeLineartStyle / computePaintStyle saíram com o modo
// colorido: existiam só para alinhar pixel a pixel a camada de tinta com o lineart legado.

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
 * BookArtFallback — fallback ilustrado e amigável para criança (gradiente da cena
 * + emoji + título + frase curta). Preenche a moldura inteira (absoluteFill), então
 * cobre o fundo escuro da moldura oficial — nada de quadro preto. Reutilizado por:
 *   • imagem oficial que falhou (OfficialSceneImage),
 *   • o caminho de fallback "normal" do render (cena sem mídia).
 * Layout idêntico ao fallback já existente — não muda o visual do Livrinho.
 */
function BookArtFallback({ fallbackColor, emoji, title, note }) {
  const base = fallbackColor || '#A78BFA';
  return (
    <LinearGradient colors={[base, base + '99']} style={StyleSheet.absoluteFill}>
      <View style={styles.fallbackCenter}>
        <Text style={styles.fallbackEmoji}>{emoji ?? '🎨'}</Text>
        {!!title && <Text style={styles.fallbackTitle}>{title}</Text>}
        {!!note && <Text style={styles.fallbackSub}>{note}</Text>}
      </View>
    </LinearGradient>
  );
}

/**
 * OfficialSceneImage — ilustração oficial da cena com fallback seguro em erro.
 * Estado de erro é por instância; a key no chamador (por slide) remonta a cada
 * página, então o erro nunca vaza de uma cena para outra. Se a imagem falhar,
 * troca para o fallback ilustrado (BookArtFallback) — nunca deixa quadro preto.
 * `onSettled` replica o comportamento do onLoadEnd antigo (libera o fade do slide)
 * tanto no sucesso quanto na falha, para o slide nunca ficar preso em baixa opacidade.
 */
function OfficialSceneImage({ source, cena, fallbackColor, onSettled }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <BookArtFallback
        fallbackColor={fallbackColor}
        emoji={cena?.emojiCena}
        title={cena?.titulo}
        note="Não consegui carregar esta cena agora."
      />
    );
  }
  return (
    <Image
      source={source}
      style={styles.bookFullImage}
      resizeMode="contain"
      onLoadEnd={onSettled}
      onError={() => {
        if (__DEV__) console.warn('[DEV] Livrinho: imagem oficial falhou — usando fallback ilustrado.');
        setFailed(true);
        onSettled?.();
      }}
    />
  );
}

// [P3J] ChildArtWithLineart saiu com o modo colorido: era o compositor que garantia que
// nenhum frame mostrasse a cor sem o contorno. Sem lineart legado não há o que compor.

export default function StoryBookScreen({ route, navigation }) {
  const { story, fromStoryCompletion = false } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const { width, height: screenH } = useWindowDimensions();
  const isTablet = width >= breakpoints.tablet;

  const { refreshProgress, progressByStory, postStoryStatusByStory } = useProgressContext();

  // F2.1h v2: VALOR do packEntry do sandbox (david_goliath) — null p/ outras histórias
  // e com índice vazio. Valor estável ⇒ NÃO recompõe a timeline no load de packs.
  const scenePackEntry = useSandboxScenePackEntry(story?.id);

  const { pendingAchievement, checkForNewAchievements, dismissAchievement } =
    useAchievementCelebration({ progressByStory, postStoryStatusByStory, source: 'StoryBookScreen' });

  const [screenState, setScreenState] = useState('loading');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Modo de reprodução CONTÍNUA do Livrinho: ligado quando a criança toca Play
  // (1ª cena); ao terminar uma cena, a próxima toca sozinha. Pausa manual desliga.
  const [autoplayActive, setAutoplayActive] = useState(false);
  // Área disponível para a arte (entre header e painel) — medida p/ dimensionar a arte.
  const [artSectionSize, setArtSectionSize] = useState({ w: 0, h: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [entering, setEntering] = useState(false); // transição mágica de abertura
  const isBookFocused = useIsFocused(); // F2.4e.5p: usado p/ parar o áudio ao sair da tela
  const markedRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const lockRef = useRef(false);   // trava de toques rápidos (anti avanço duplo)
  const lockTimerRef = useRef(null);
  // LIVRINHO_AUTOPLAY_FIX_1: um fim de áudio que chega DURANTE a trava de transição não
  // pode ser descartado (senão a cena não avança). Marca-se aqui e o avanço é reagendado
  // quando a trava libera (efeito abaixo). SÓ o fim de áudio usa este caminho.
  const pendingAutoAdvanceRef = useRef(false);
  // F2.4e.5pR — HARDENING de lifecycle de áudio. Token de sessão de reprodução:
  // sincronamente invalidado (bump) no blur, no background, na troca manual de cena, no
  // novo início de áudio e na pausa manual. Todo callback que pode AVANÇAR cena ou iniciar
  // autoplay verifica se a sessão ainda é a atual E se a tela está focada E o app ativo.
  const playbackGenerationRef = useRef(0);
  const isBookFocusedRef = useRef(true); // espelho do foco (debug/efeitos); a verdade usada nos guards é navigation.isFocused()
  const appActiveRef = useRef(true);     // AppState 'active' (app em foreground)
  const noAudioTimerRef = useRef(null);  // timer da cena sem áudio (cancelável no invalidate)

  // Timeline derivada (memoizada) — modo único, então só recalcula ao trocar história/pack.
  const timeline = useMemo(
    () => buildStoryBookTimeline(story, scenePackEntry),
    [story?.id, scenePackEntry],
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
        if (!cancelled) setScreenState('intro');
      } catch {
        if (!cancelled) setScreenState('error');
      }
    }
    init();
    return () => { cancelled = true; };
  }, [story?.id]);

  // Fase 2B.6 (RP3): revalida ACESSO ao FOCAR (não só no mount). Se o entitlement caiu
  // (ex.: assinatura expirou com o app aberto), PAUSA o áudio imediatamente (setIsPaused,
  // via prop `paused` do AudioPlayer) e trava em 'locked' (remove o AudioPlayer do render →
  // player.pause() no unmount). Nunca deixa áudio premium tocando após o bloqueio.
  // Preserva LIVRINHO_FIX/UX (não altera autoplay).
  useFocusEffect(
    useCallback(() => {
      if (story?.id && Array.isArray(story?.cenas) && !canOpenStoryFullExperience(story)) {
        setIsPaused(true);
        setScreenState('locked');
      }
    }, [story?.id]),
  );

  // [P3J] O recarregamento de desenhos ao focar (que existia para o contador de artes do
  // modo colorido refletir uma pintura recém-feita) saiu com o modo: o Livrinho não lê mais
  // nenhuma pintura. O storage das pinturas NÃO foi tocado — só deixou de ter leitor aqui.

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
  // quase branca"): cada troca de slide reinicia a opacidade e anima até 1.
  useEffect(() => {
    if (screenState !== 'playing') return undefined;
    // Opacidade inicial alta (0.85) — fade suave sem parecer imagem branca/apagada.
    fadeAnim.setValue(0.85);
    const anim = Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [currentSlideIndex, screenState]);

  // Limpeza de timers ao desmontar.
  useEffect(() => () => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    pendingAutoAdvanceRef.current = false; // LIVRINHO_AUTOPLAY_FIX_1: sem avanço órfão
  }, []);

  // F2.4e.5p — LIFECYCLE DE ÁUDIO: ao PERDER o foco (sair p/ mapa/Início, Voltar, trocar de
  // aba) o áudio DEVE parar e a cadeia de autoplay DEVE haltar. `setIsPaused(true)` aciona o
  // `player.pause()` do AudioPlayer (via prop `paused`) e para o timer das cenas sem áudio;
  // `setAutoplayActive(false)` impede que a próxima cena toque sozinha; o avanço pendente é
  // limpo. Nada volta a tocar no mapa; ao retornar, fica em estado seguro (aguardando Play).
  useEffect(() => {
    isBookFocusedRef.current = isBookFocused; // F2.4e.5pR: espelho síncrono p/ os callbacks
    if (!isBookFocused) {
      // Ordem (F2.4e.5pR): cancelar timers → invalidar token → pausar → desligar autoplay.
      invalidatePlaybackSession(); // limpa timer de cena sem áudio + avanço pendente + bump do token
      setIsPaused(true);           // pausa o áudio (via prop `paused` do AudioPlayer)
      setAutoplayActive(false);    // a próxima cena NÃO toca sozinha
    }
  }, [isBookFocused]);

  // F2.4e.5pR — AppState: ao ir para BACKGROUND / bloquear a tela (o app deixa de estar
  // 'active'), para o áudio e halta o autoplay, MESMO com a tela ainda "focada" na
  // navegação (useIsFocused não muda no background). NÃO retoma sozinho ao voltar —
  // fica em estado seguro aguardando o Play da criança.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      // 'inactive' é TRANSITÓRIO (Central de Controle, banner de notificação, Face ID) —
      // NÃO halta a história (evita cortar a leitura por um toque acidental do sistema).
      // Só o 'background' real (app fora / tela bloqueada) para tudo e halta o autoplay.
      appActiveRef.current = next !== 'background';
      if (next === 'background') {
        invalidatePlaybackSession();
        setIsPaused(true);
        setAutoplayActive(false);
      }
      // volta a 'active': NÃO auto-resume (sem setIsPaused(false)) — estado seguro.
    });
    return () => sub.remove();
  }, []);

  // Auto-avanço por TIMER quando a cena do slide não tem áudio. Um único timer
  // por vez (efeito único, limpo a cada troca). Com áudio, o AudioPlayer avança.
  useEffect(() => {
    if (screenState !== 'playing' || isPaused) return undefined;
    if (!isBookFocused) return undefined; // F2.4e.5pR: sem timer de avanço fora de foco
    const slide = timeline[currentSlideIndex];
    if (!slide) return undefined;
    if (hasSceneAudio(story.id, slide.sceneKey)) return undefined;
    const gen = playbackGenerationRef.current; // F2.4e.5pR: sessão no agendamento
    const timer = setTimeout(() => {
      // Só avança se a sessão ainda é a mesma E a tela está viva (foco + app ativo).
      if (gen !== playbackGenerationRef.current) return;
      if (!isPlaybackContextLive()) return;
      advanceToNextScene();
    }, AUTOPLAY_MS);
    noAudioTimerRef.current = timer;
    return () => {
      clearTimeout(timer);
      if (noAudioTimerRef.current === timer) noAudioTimerRef.current = null;
    };
  }, [screenState, currentSlideIndex, isPaused, isBookFocused]);

  // LIVRINHO_AUTOPLAY_FIX_1 — consome um avanço por FIM DE ÁUDIO que chegou durante a
  // trava de transição. Quando a trava libera (isTransitioning → false), avança UMA vez.
  // Efeito (não o setTimeout da trava) para não capturar um currentSlideIndex obsoleto:
  // ao mudar isTransitioning, o componente re-renderiza e este efeito roda já com a cena
  // atual. O toque manual durante a trava continua sendo ignorado (não usa este caminho).
  useEffect(() => {
    if (isTransitioning) return undefined;              // ainda travado: espera liberar
    if (!pendingAutoAdvanceRef.current) return undefined;
    pendingAutoAdvanceRef.current = false;              // consome UMA vez (sem duplo avanço)
    advanceToNextScene();
    return undefined;
  }, [isTransitioning]);

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
    playbackGenerationRef.current += 1; // F2.4e.5pR: nova sessão de reprodução
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

  // F2.4e.5pR — a reprodução só é "viva" com a tela focada E o app em foreground.
  // Usa navigation.isFocused() como verdade SÍNCRONA do foco (sem o lag de 1 render do
  // useIsFocused): fecha a corrida em que um didJustFinish dispara entre o blur e o efeito
  // atualizar o espelho, avançando cena fora da tela. appActiveRef cobre background/lock.
  function isPlaybackContextLive() {
    return navigation.isFocused() && appActiveRef.current;
  }

  // F2.4e.5pR — invalida a sessão de reprodução atual: incrementa o token (qualquer
  // callback antigo em voo vira no-op), cancela o timer de cena sem áudio e limpa o
  // avanço pendente. Chamado no blur, no background e nas trocas manuais de cena.
  function invalidatePlaybackSession() {
    playbackGenerationRef.current += 1;
    pendingAutoAdvanceRef.current = false;
    if (noAudioTimerRef.current) {
      clearTimeout(noAudioTimerRef.current);
      noAudioTimerRef.current = null;
    }
  }

  function advanceToNextScene() {
    if (lockRef.current) return;
    if (!isPlaybackContextLive()) return; // F2.4e.5pR: nunca avança fora de foco/app ativo
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
    if (!isPlaybackContextLive()) return; // F2.4e.5pR: fim de áudio fora da tela não avança cena
    // LIVRINHO_AUTOPLAY_FIX_1: se a trava de transição estiver ativa, NÃO descarta o
    // fim de áudio (era a causa da cena travar) — marca pendente e o efeito reagenda o
    // avanço quando a trava liberar. Marca uma vez e retorna (sem duplo avanço).
    if (lockRef.current) {
      pendingAutoAdvanceRef.current = true;
      return;
    }
    advanceToNextScene();
  }

  function handlePrevScene() {
    if (lockRef.current) return;
    playbackGenerationRef.current += 1; // F2.4e.5pR: troca manual invalida a sessão anterior
    pendingAutoAdvanceRef.current = false; // LIVRINHO_AUTOPLAY_FIX_1: voltar cancela avanço pendente
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
    pendingAutoAdvanceRef.current = false; // LIVRINHO_AUTOPLAY_FIX_1
    setIsTransitioning(false);
    fadeAnim.setValue(1);
    setCurrentSlideIndex(0);
    setIsPaused(false);
    setAutoplayActive(false);
    playbackGenerationRef.current += 1; // F2.4e.5pR: "Ver de novo" reinicia a sessão
    setScreenState('playing'); // sai de 'ended' (finished → false)
  }

  // [P3J] handleChooseMode ("Escolher outro modo") saiu com o modo colorido — com um único modo
  // não há seleção para reabrir. Reler a história continua por handleReplay.

  function handleTogglePause() {
    if (lockRef.current) return;
    setIsPaused(p => !p);
  }

  // [P3J] handleSelectMode saiu com a escolha de modo: o Livrinho tem um modo só.
  // handleImageAreaLayout media a moldura para alinhar tinta e contorno — sem uso agora.

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
    // [P3J] O modo "Meu livrinho colorido" foi APOSENTADO junto com o Colorir legado. Ele dependia
    // inteiramente dos linearts por cena: a pintura salva é só a camada de tinta, e sem contorno não
    // havia obra a exibir. Sem ele caem também a contagem de artes, o bloqueio "pinte todas as cenas"
    // e o botão "Pintar próxima cena". O Livrinho passa a ter UM caminho — a história ilustrada — sem
    // card vazio, sem seletor de um item só e sem mensagem de "em breve".
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
              Beni vai recontar sua aventura com as imagens da história.
            </Text>
          </View>

          {/* Resumo: quantas cenas o Livrinho vai reler */}
          <View style={styles.introStatsRow}>
            <View style={styles.introStat}>
              <Text style={styles.introStatNum}>{totalScenes}</Text>
              <Text style={styles.introStatLabel}>{totalScenes === 1 ? 'cena' : 'cenas'}</Text>
            </View>
          </View>

          {/* [P3J] Sem escolha de modo, a capa do topo já é a única prévia — nenhum card novo
              foi criado no lugar do seletor, para não duplicar a mesma imagem duas vezes. */}
          <SoundButton style={styles.startBtn} onPress={handleEnterLivrinho} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>▶  Abrir história ilustrada</Text>
          </SoundButton>
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

          {/* [P3J] "Escolher outro modo" saiu com o modo colorido: sobrou um único modo, e o botão
              levaria a uma tela de escolha sem escolha — duplicando "Ver de novo". */}

          <SoundButton
            style={styles.endedBackBtn}
            onPress={() => navigation.navigate(ROUTES.HOME, { screen: ROUTES.ADVENTURES })}
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

  // Áudio: fonte local ATUAL por padrão; remoto file:// só com pack ready+válido (Fase 2B).
  // Sem tocar o autoplay/AudioPlayer (LIVRINHO_FIX_1) — só a FONTE muda.
  let audioAsset = hasSceneAudio(story.id, slide.sceneKey)
    ? (getSceneAudio(story.id, slide.sceneKey)?.audioAsset ?? null)
    : null;
  const remoteAudio = resolveRemoteAudioSource(story.id, slide.sceneNumber, scenePackEntry);
  if (remoteAudio) audioAsset = remoteAudio;

  // key estável por slide (sceneId + visualType + índice) → Image remonta limpo a cada
  // troca. [P3J] O modo saiu da key junto com o modo colorido: só existe uma leitura.
  const slideKey = `${slide.key}-${safeIndex}`;

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
              { width: bookSize.width, height: bookSize.height, backgroundColor: '#0B0B0B' },
            ]}
          >
            {visual.type === 'official' ? (
              // Oficial na moldura fixa 4:5 + contain (width/height 100%) → nasce encaixada, sem zoom.
              // key por slide → estado de erro reseta a cada cena; falha cai no fallback (sem quadro preto).
              <OfficialSceneImage
                key={`official-${slideKey}`}
                source={visual.officialImage}
                cena={cena}
                fallbackColor={visual.fallbackColor}
                onSettled={() => fadeAnim.setValue(1)}
              />
            ) : (
              <BookArtFallback
                fallbackColor={visual.fallbackColor}
                emoji={cena.emojiCena}
                title={cena.titulo}
                note={visual.note}
              />
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
            onPlayStart={() => { playbackGenerationRef.current += 1; setIsPaused(false); setAutoplayActive(true); }}
            onUserPause={() => { playbackGenerationRef.current += 1; setAutoplayActive(false); }}
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
  // [P3J] Saíram daqui, sem substituto, os estilos exclusivos do modo colorido: o destaque
  // "sua arte neste livrinho", o estado bloqueado ("pinte todas as cenas") e todo o seletor de
  // modo (cards, prévias, rádio). Nada ocupou o lugar — a intro tem uma ação só.

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
  // [P3J] endedModeBtn/endedModeBtnText saíram com o botão "Escolher outro modo".
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

  // [P3J] lineartMultiply (blend do contorno) e childLoading/childLoadingText (placeholder da
  // composição cor+contorno) saíram com ChildArtWithLineart.

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
