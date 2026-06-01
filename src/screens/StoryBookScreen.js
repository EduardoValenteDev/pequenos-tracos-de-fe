import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Image, StyleSheet, ActivityIndicator, ScrollView,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { colors as pt, radii } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import AudioPlayer from '../components/AudioPlayer';
import LockedStoryFallback from '../components/premium/LockedStoryFallback';
import { getColoringImage } from '../assets/coloringImages';
import { getSavedDrawing } from '../services/drawingStorage';
import { hasSceneAudio, getSceneAudio } from '../services/audioService';
import { markStoryBookOpened } from '../services/postStoryStorage';
import { canOpenStoryFullExperience } from '../services/contentAccessService';
import { useProgressContext } from '../context/ProgressContext';
import { useAchievementCelebration } from '../hooks/useAchievementCelebration';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';
import { images } from '../assets/images';

const PROGRESS_KEY = '@ptf_progress';

/**
 * Parses the raw saved drawing value returned by getSavedDrawing().
 *
 * v1 — raw data URL: 'data:image/png;base64,...'
 * v2 — JSON payload: '{"v":2,"W":390,"H":600,"imgX":3,"imgY":15,...,"data":"data:image/png..."}'
 *
 * The `data` field in v2 is ONLY the transparent paint layer (colors where painted,
 * alpha=0 elsewhere). It does NOT include the cream background or lineart.
 *
 * Returns { uri, W, H, imgX, imgY, imgW, imgH } or null on failure.
 * `uri` is always a valid PNG data URL safe for <Image source={{ uri }}/>.
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

/**
 * Determines how to render a scene's artwork in the Livrinho playback.
 *
 * Priority:
 *   1. paintWithLineart — saved v2 paint + lineart + complete layout metadata.
 *      The lineart is overlaid at EXACT pixel-aligned coordinates from the v2
 *      metadata. mixBlendMode:'multiply' makes the white lineart bg transparent,
 *      leaving only the dark outlines visible on top of the paint colors.
 *      NEVER use this mode without the v2 layout metadata — misaligned layers
 *      create a ghost/double-image effect (the Sprint 5.2 bug).
 *   2. paintOnly — saved paint exists but lineart unavailable or v1 format (no
 *      layout metadata to align). Shows paint on cream background, no overlay.
 *   3. lineartOnly — no paint saved, but lineart exists. Shows the original
 *      line art (uncolored) on cream background.
 *   4. fallback — no paint, no lineart. Shows a colored gradient with the
 *      scene emoji and title.
 */
function resolveStoryBookVisual(cena, story, drawings) {
  const rawDrawing = drawings[cena.id] ?? null;
  const baseImage = getColoringImage(story.id, cena.id);
  const fallbackColor = cena.corTema || '#A78BFA';

  const noLineart = { baseImage: null, fallbackColor, canvasW: null, canvasH: null, lineartImgX: null, lineartImgY: null, lineartImgW: null, lineartImgH: null };
  const withLineart = { baseImage, fallbackColor, canvasW: null, canvasH: null, lineartImgX: null, lineartImgY: null, lineartImgW: null, lineartImgH: null };

  if (!rawDrawing) {
    return baseImage
      ? { type: 'lineartOnly', paintUri: null, ...withLineart }
      : { type: 'fallback', paintUri: null, ...noLineart };
  }

  const p = parseDrawingPayload(rawDrawing);
  if (!p) {
    return baseImage
      ? { type: 'lineartOnly', paintUri: null, ...withLineart }
      : { type: 'fallback', paintUri: null, ...noLineart };
  }

  const hasLayout = p.W && p.H && p.imgX !== null && p.imgY !== null && p.imgW && p.imgH;

  if (hasLayout && baseImage) {
    return {
      type: 'paintWithLineart',
      paintUri: p.uri,
      baseImage,
      fallbackColor,
      canvasW: p.W, canvasH: p.H,
      lineartImgX: p.imgX, lineartImgY: p.imgY,
      lineartImgW: p.imgW, lineartImgH: p.imgH,
    };
  }

  return {
    type: 'paintOnly',
    paintUri: p.uri,
    ...noLineart,
  };
}

/**
 * Computes the absolute {position, left, top, width, height} style for the
 * lineart overlay so it aligns pixel-perfect with the paint layer.
 *
 * The paint layer (canvasW × canvasH) is displayed with resizeMode="contain"
 * inside the container (containerW × containerH). We replicate the same
 * contain-scaling transform and apply it to the lineart's canvas coordinates
 * (lineartImgX, lineartImgY, lineartImgW, lineartImgH) to get the exact
 * absolute position in the container.
 *
 * Returns { position:'absolute', opacity:0 } when dimensions are unknown
 * (first frame before onLayout fires) — hides the lineart harmlessly.
 */
function computeLineartStyle(containerW, containerH, visual) {
  if (!containerW || !containerH || !visual.canvasW || !visual.canvasH) {
    return { position: 'absolute', opacity: 0 };
  }
  const scale = Math.min(containerW / visual.canvasW, containerH / visual.canvasH);
  const paintDisplayW = visual.canvasW * scale;
  const paintDisplayH = visual.canvasH * scale;
  const offsetX = (containerW - paintDisplayW) / 2;
  const offsetY = (containerH - paintDisplayH) / 2;
  return {
    position: 'absolute',
    left: offsetX + visual.lineartImgX * scale,
    top: offsetY + visual.lineartImgY * scale,
    width: visual.lineartImgW * scale,
    height: visual.lineartImgH * scale,
  };
}

/**
 * Returns audio readiness for Livrinho auto-play.
 *
 * canAutoPlay is true ONLY when every scene has a real ready audio file.
 * While canAutoPlay is false the Livrinho works visually but advances manually.
 * Adding audio to all scenes in audioManifest flips canAutoPlay to true.
 */
function getStoryBookPlaybackReadiness(story) {
  if (!story?.cenas?.length) {
    return { totalScenes: 0, scenesWithAudio: 0, allScenesHaveAudio: false, canAutoPlay: false, missingAudioSceneIds: [] };
  }
  const totalScenes = story.cenas.length;
  const missingAudioSceneIds = story.cenas
    .filter(c => !hasSceneAudio(story.id, c.id))
    .map(c => c.id);
  const scenesWithAudio = totalScenes - missingAudioSceneIds.length;
  const allScenesHaveAudio = missingAudioSceneIds.length === 0;
  return { totalScenes, scenesWithAudio, allScenesHaveAudio, canAutoPlay: allScenesHaveAudio, missingAudioSceneIds };
}

// State machine:
//   loading → intro | locked | notCompleted | invalidStory | emptyScenes | error
//   intro   → playing (index 0)   bookOpened marked here, never before
//   playing → playing (index+1) | playing (index-1) | intro | ended
//     isPaused=true: audio paused, scene stays visible, no auto-advance
//     audioAsset=null (waitingForAudio): AudioPlayer=null, no auto-advance
//   ended   → playing (index 0)   [Ver de novo]
//
// Auto-advance chain (future with real audio):
//   AudioPlayer.onFinished → onSceneAudioComplete → advanceToNextScene
//   Fires only when expo-audio emits didJustFinish on a real audio asset.
//   Without audio: AudioPlayer returns null → onSceneAudioComplete never fires.
//   With audio: every scene advances automatically when its narration ends.

export default function StoryBookScreen({ route, navigation }) {
  const { story } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { refreshProgress, progressByStory, postStoryStatusByStory } = useProgressContext();

  const { pendingAchievement, checkForNewAchievements, dismissAchievement } =
    useAchievementCelebration({ progressByStory, postStoryStatusByStory, source: 'StoryBookScreen' });

  const [screenState, setScreenState] = useState('loading');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [drawings, setDrawings] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [imgContainerSize, setImgContainerSize] = useState({ w: 0, h: 0 });
  const markedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

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

  // bookOpened is marked only here — when the child actually taps "Iniciar Livrinho".
  // Never on data load, never if locked, never if not completed.
  function handleStartLivrinho() {
    if (!markedRef.current) {
      markedRef.current = true;
      markStoryBookOpened(story.id);
      refreshProgress();
      setTimeout(() => { checkForNewAchievements(); }, 1000);
    }
    setCurrentSceneIndex(0);
    setIsPaused(false);
    setScreenState('playing');
  }

  // Core advance logic. Called by both the audio callback and the manual ▶▶ button.
  function advanceToNextScene() {
    if (currentSceneIndex >= story.cenas.length - 1) {
      setScreenState('ended');
    } else {
      setCurrentSceneIndex(i => i + 1);
      setIsPaused(false);
    }
  }

  // Called by AudioPlayer when real narration finishes (expo-audio didJustFinish).
  // AudioPlayer returns null when audioAsset is null → this never fires without real audio.
  function onSceneAudioComplete() {
    advanceToNextScene();
  }

  // ▶▶ manual auxiliary control — same advance logic as the audio callback.
  function handleSceneEnd() {
    advanceToNextScene();
  }

  function handlePrevScene() {
    if (currentSceneIndex === 0) {
      setScreenState('intro');
    } else {
      setCurrentSceneIndex(i => i - 1);
      setIsPaused(false);
    }
  }

  function handleReplay() {
    setCurrentSceneIndex(0);
    setIsPaused(false);
    setScreenState('playing');
  }

  function handleTogglePause() {
    setIsPaused(p => !p);
  }

  const handleImageAreaLayout = useCallback((e) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setImgContainerSize({ w, h });
  }, []);

  // ── loading ────────────────────────────────────────────────────────────────
  if (screenState === 'loading') {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Abrindo seu Livrinho…</Text>
      </View>
    );
  }

  // ── locked ─────────────────────────────────────────────────────────────────
  if (screenState === 'locked') {
    return (
      <LockedStoryFallback
        onBack={() => navigation.navigate('Home')}
        onCallResponsible={() => navigation.navigate('ParentArea')}
        title="Seu Livrinho da Fé é Especial da Família."
        subtitle="Peça para um responsável abrir essa área com você."
      />
    );
  }

  // ── invalidStory ───────────────────────────────────────────────────────────
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

  // ── emptyScenes ────────────────────────────────────────────────────────────
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

  // ── notCompleted ───────────────────────────────────────────────────────────
  if (screenState === 'notCompleted') {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateEmoji}>🌟</Text>
        <Text style={styles.stateTitle}>Continue a aventura!</Text>
        <Text style={styles.stateSub}>
          Complete todas as cenas para desbloquear seu Livrinho da Fé.
        </Text>
        <SoundButton style={styles.stateBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
          <Text style={styles.stateBtnText}>🏠 Ir para o início</Text>
        </SoundButton>
      </View>
    );
  }

  // ── error ──────────────────────────────────────────────────────────────────
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

  // ── Shared gradient header (quiz-style) — used in intro and ended ──────────
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

  // ── intro ──────────────────────────────────────────────────────────────────
  if (screenState === 'intro') {
    const hasCover = story.imagemCapa && images[story.imagemCapa];
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
              <Image
                source={images[story.imagemCapa]}
                style={styles.introCoverImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.introCoverFallback}>
                <Text style={styles.introCoverEmoji}>{story.emoji ?? '📖'}</Text>
              </View>
            )}
          </View>

          <Text style={styles.introDesc}>
            Reveja cada cena da aventura que você completou.
          </Text>

          <Text style={styles.introSceneCount}>
            {story.cenas.length} {story.cenas.length === 1 ? 'cena' : 'cenas'}
          </Text>

          <SoundButton style={styles.startBtn} onPress={handleStartLivrinho} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>▶  Iniciar Livrinho</Text>
          </SoundButton>
        </ScrollView>
      </View>
    );
  }

  // ── ended ──────────────────────────────────────────────────────────────────
  if (screenState === 'ended') {
    return (
      <View style={styles.wrapper}>
        {renderHeader('🙏', 'Seu Livrinho da Fé ficou pronto!', story.titulo)}

        <View style={[styles.endedBody, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}>
          <SoundButton style={styles.endedReplayBtn} onPress={handleReplay} activeOpacity={0.85}>
            <Text style={styles.endedReplayBtnText}>↩  Ver de novo</Text>
          </SoundButton>
          <SoundButton style={styles.endedBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.endedBackBtnText}>← Voltar para a aventura</Text>
          </SoundButton>
        </View>
      </View>
    );
  }

  // ── playing ────────────────────────────────────────────────────────────────
  const cena = story.cenas[currentSceneIndex];
  const visual = resolveStoryBookVisual(cena, story, drawings);

  const audioAsset = hasSceneAudio(story.id, cena.id)
    ? (getSceneAudio(story.id, cena.id)?.audioAsset ?? null)
    : null;

  // Compute lineart absolute position only when container size is known.
  // computeLineartStyle replicates the resizeMode="contain" scale of the paint
  // layer and positions the lineart at the exact matching coordinates.
  const lineartAbsStyle = visual.type === 'paintWithLineart' && imgContainerSize.w > 0
    ? computeLineartStyle(imgContainerSize.w, imgContainerSize.h, visual)
    : null;

  return (
    <View style={styles.playingWrapper}>

      {/* ── Playing top bar — exits livrinho or goes home ── */}
      <View style={[styles.playingTopBar, { paddingTop: Math.max(insets.top, 8) }]}>
        <SoundButton style={styles.playingNavBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.playingNavBtnText}>← Voltar</Text>
        </SoundButton>
        <Text style={styles.playingTopTitle} numberOfLines={1}>📖 {story.titulo}</Text>
        <SoundButton style={styles.playingNavBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
          <Text style={styles.playingNavBtnText}>🏠</Text>
        </SoundButton>
      </View>

      {/* ── Scene image area ─────────────────────────────────────────────────
          onLayout fires once (and on rotation) so imgContainerSize is always
          current. The paint layer fills this area with resizeMode="contain".
          The lineart is positioned using absolute coordinates computed from
          the v2 payload metadata so both layers align perfectly.            ── */}
      <View style={styles.playingImageArea} onLayout={handleImageAreaLayout}>

        {visual.type === 'paintWithLineart' ? (
          <>
            {/* Paint layer: transparent PNG with child's colors, cream bg behind it */}
            <Image
              source={{ uri: visual.paintUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
            />
            {/* Lineart: absolute-positioned to match the paint canvas coordinate space.
                mixBlendMode:'multiply' keeps dark outlines visible while making the
                white lineart background transparent over the paint colors.           */}
            {lineartAbsStyle && (
              <Image
                source={visual.baseImage}
                style={[lineartAbsStyle, styles.lineartMultiply]}
                resizeMode="stretch"
              />
            )}
          </>
        ) : visual.type === 'paintOnly' ? (
          // v1 format or no lineart: paint on cream background, no overlay attempt
          <Image
            source={{ uri: visual.paintUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        ) : visual.type === 'lineartOnly' ? (
          <Image
            source={visual.baseImage}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        ) : (
          // Fallback: gradient + scene emoji + title
          <LinearGradient
            colors={[visual.fallbackColor, visual.fallbackColor + '99']}
            style={StyleSheet.absoluteFill}
          >
            <View style={styles.fallbackCenter}>
              <Text style={styles.fallbackEmoji}>{cena.emojiCena ?? '🎨'}</Text>
              <Text style={styles.fallbackTitle}>{cena.titulo}</Text>
            </View>
          </LinearGradient>
        )}

      </View>

      {/* ── Bottom panel: scene info + audio + scene controls ── */}
      <View style={[styles.playingBottomPanel, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}>

        <View style={styles.sceneInfoRow}>
          <Text style={styles.sceneInfoEmoji}>{cena.emojiCena ?? '✨'}</Text>
          <View style={styles.sceneInfoText}>
            <Text style={styles.sceneInfoTitle} numberOfLines={1}>{cena.titulo}</Text>
            {!!cena.licaoCurta && (
              <Text style={styles.sceneInfoLicao} numberOfLines={2}>{cena.licaoCurta}</Text>
            )}
          </View>
        </View>

        {/* AudioPlayer renders null when audioAsset is null — no fake player shown.
            key={cena.id} resets all player state when the scene changes.
            onFinished fires only from real expo-audio didJustFinish → onSceneAudioComplete.
            paused syncs StoryBookScreen's play/pause state into the player. */}
        <AudioPlayer
          key={cena.id}
          audioAsset={audioAsset}
          onFinished={onSceneAudioComplete}
          paused={isPaused}
        />

        {/* Scene controls — play/pause is the primary control (largest, centered).
            ◀ and ▶▶ are auxiliary: small and dim, not the main CTA. */}
        <View style={styles.controlsRow}>
          <SoundButton style={styles.ctrlBtnAux} onPress={handlePrevScene} activeOpacity={0.8}>
            <Text style={styles.ctrlBtnText}>◀</Text>
          </SoundButton>

          <SoundButton style={styles.ctrlBtnPlay} onPress={handleTogglePause} activeOpacity={0.8}>
            <Text style={styles.ctrlBtnPlayText}>{isPaused ? '▶' : '⏸'}</Text>
          </SoundButton>

          <View style={styles.counterBox}>
            <Text style={styles.counterText}>{currentSceneIndex + 1} / {story.cenas.length}</Text>
          </View>

          <SoundButton style={styles.ctrlBtnAux} onPress={handleSceneEnd} activeOpacity={0.8}>
            <Text style={styles.ctrlBtnText}>▶▶</Text>
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
  // ── Shared center states ──────────────────────────────────────────────────
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

  // ── Wrapper (intro + ended) ───────────────────────────────────────────────
  wrapper: { flex: 1, backgroundColor: pt.background },

  // ── Quiz-style gradient header (intro + ended) ────────────────────────────
  // Matches QuizScreen/ReflectionScreen visual: LinearGradient + nav row + content
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

  // ── Intro ─────────────────────────────────────────────────────────────────
  introScroll: { flex: 1 },
  introScrollContent: {
    alignItems: 'center', paddingHorizontal: 24, paddingTop: 24,
  },
  introScrollContentTablet: { paddingHorizontal: 64 },

  introCoverCard: {
    width: '100%', aspectRatio: 16 / 9,
    borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#E8E0D8',
    marginBottom: 20,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8,
  },
  introCoverImage: { width: '100%', height: '100%' },
  introCoverFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  introCoverEmoji: { fontSize: 80 },

  introDesc: {
    fontFamily: 'Nunito', fontSize: 15, color: pt.textSoft,
    textAlign: 'center', lineHeight: 22, marginBottom: 6,
  },
  introSceneCount: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.muted,
    textAlign: 'center', marginBottom: 24,
  },
  startBtn: {
    backgroundColor: colors.action, borderRadius: radii.pill,
    paddingVertical: 18, paddingHorizontal: 40,
    width: '100%', alignItems: 'center',
    elevation: 6, shadowColor: colors.action,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  startBtnText: { fontFamily: 'FredokaOne', fontSize: 20, color: '#FFF' },

  // ── Ended ─────────────────────────────────────────────────────────────────
  endedBody: {
    flex: 1, justifyContent: 'center', padding: 32, gap: 12,
  },
  endedReplayBtn: {
    backgroundColor: colors.primary, borderRadius: radii.pill,
    paddingVertical: 16, paddingHorizontal: 40,
    alignItems: 'center',
    elevation: 4, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  endedReplayBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
  endedBackBtn: {
    backgroundColor: pt.border, borderRadius: radii.pill,
    paddingVertical: 14, paddingHorizontal: 40,
    alignItems: 'center',
  },
  endedBackBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },

  // ── Playing ───────────────────────────────────────────────────────────────
  playingWrapper: { flex: 1, backgroundColor: '#111' },

  playingTopBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.72)',
    gap: 8, zIndex: 10,
  },
  playingNavBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  playingNavBtnText: {
    fontFamily: 'Nunito', fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700',
  },
  playingTopTitle: {
    flex: 1, fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF', textAlign: 'center',
  },

  // Image area: cream background so unpainted transparent regions look natural.
  // absoluteFill children fill this area; contain behavior shows the full image.
  playingImageArea: { flex: 1, backgroundColor: '#FFFDF8' },

  // Lineart overlay: multiply blend makes white pixels transparent, dark lines remain.
  // Position is computed by computeLineartStyle — never absoluteFill, always absolute coords.
  lineartMultiply: { mixBlendMode: 'multiply' },

  fallbackCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  fallbackEmoji: { fontSize: 80, marginBottom: 16 },
  fallbackTitle: {
    fontFamily: 'FredokaOne', fontSize: 22, color: '#FFF', textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4,
  },

  playingBottomPanel: {
    backgroundColor: 'rgba(0,0,0,0.88)',
    paddingHorizontal: 16, paddingTop: 12,
  },

  sceneInfoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8,
  },
  sceneInfoEmoji: { fontSize: 22 },
  sceneInfoText: { flex: 1 },
  sceneInfoTitle: {
    fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF', marginBottom: 2,
  },
  sceneInfoLicao: {
    fontFamily: 'Nunito', fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 17,
  },

  controlsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8,
  },
  // ◀ and ▶▶ — small secondary auxiliaries, not the main CTA
  ctrlBtnAux: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  // ⏸/▶ — primary play/pause, large and prominent
  ctrlBtnPlay: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6,
  },
  ctrlBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },
  ctrlBtnPlayText: { fontFamily: 'FredokaOne', fontSize: 22, color: '#FFF' },
  counterBox: { flex: 1, alignItems: 'center' },
  counterText: {
    fontFamily: 'Nunito', fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '700',
  },
});
