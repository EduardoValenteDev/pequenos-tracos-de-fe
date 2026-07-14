/**
 * MonteACenaSpikeScreen.js — ARCHITECTURE SPIKE M1A (interno, dev-gated) de "Monte a Cena".
 *
 * ⚠️ NÃO é o jogo. Baseline técnico C-SVG: prova o recorte de UMA imagem por `react-native-svg`
 * `<ClipPath>` em 4 peças curvas (2×2), arrasto + tap-to-place, encaixe magnético, referência
 * (miniatura + Espiar), participação mínima do Beni e um painel DEV de inspeção/medição.
 *
 * FORA DO ESCOPO (M1A): mural, estrelas, rodadas diárias, 6/9 peças, dificuldades, pack definitivo,
 * cópia de asset. A rota é registrada SÓ sob `isInternalToolsEnabled()` (ver AppNavigator) e o card
 * aparece SÓ na seção interna da aba Brincar.
 *
 * Arrasto SEM dependência nova: `PanResponder` + `Animated.ValueXY` (transform translate).
 * Limitação HONESTA: sem `react-native-reanimated`, o transform corre na JS thread (NÃO se afirma
 * UI thread). Não há `setState` por frame — o gesto escreve no nó Animated, sem re-render.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated, PanResponder,
  AppState, AccessibilityInfo, useWindowDimensions, Platform,
} from 'react-native';
import Svg, { Path, ClipPath, Defs, Image as SvgImage } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import BeniGuideBubble from '../components/beni/BeniGuideBubble';
import BeniAvatar from '../components/beni/BeniAvatar';
import { playGameSfx } from '../services/audioManager';
import { MONTE_A_CENA_SPIKE_SCENE } from '../data/monteACenaSpikeData';
import { buildSpikeGeometry, snapToleranceFor } from '../services/monteACenaGeometry';

const H_MARGIN = 16;
const GAP = 18;

/** Relógio monotônico seguro (performance.now quando existir; Date.now como fallback). */
function nowMs() {
  if (typeof performance !== 'undefined' && performance.now) return performance.now();
  return Date.now();
}

/** Ordem determinística de apresentação das peças no baseline (modo Fácil-like). */
const PIECE_ORDER = ['p0', 'p1', 'p2', 'p3'];

/**
 * Sprite de UMA peça: a MESMA imagem-fonte recortada pelo path da peça (userSpaceOnUse).
 * `overscan` inclui dilatação sub-pixel anti-seam; o viewBox usa coords em px da arte.
 */
function SpikePieceSvg({ scene, piece, boardW, boardH, ghost, showPath }) {
  const { artWidth: W, artHeight: HH } = scene;
  const ob = piece.overscanBounds;
  const w = Math.max(1, ob.w * boardW);
  const h = Math.max(1, ob.h * boardH);
  const viewBox = `${ob.x * W} ${ob.y * HH} ${ob.w * W} ${ob.h * HH}`;
  const clipId = `mac-clip-${piece.id}`;
  return (
    <Svg width={w} height={h} viewBox={viewBox}>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={piece.path} />
        </ClipPath>
      </Defs>
      <SvgImage
        href={scene.source}
        x={0}
        y={0}
        width={W}
        height={HH}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#${clipId})`}
        opacity={ghost ? 0.9 : 1}
      />
      {showPath ? (
        <Path d={piece.path} fill="none" stroke="#FF2D55" strokeWidth={2} />
      ) : null}
    </Svg>
  );
}

export default function MonteACenaSpikeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();

  const scene = MONTE_A_CENA_SPIKE_SCENE;
  const t0Ref = useRef(nowMs());

  // Geometria PURA — construída uma única vez (determinística por seed).
  const geometry = useMemo(
    () =>
      buildSpikeGeometry({
        sceneId: scene.sceneId,
        artWidth: scene.artWidth,
        artHeight: scene.artHeight,
        seed: scene.seed,
        seams: scene.seams,
        tabDepthPx: scene.tabDepthPx,
        protectedRegions: scene.protectedRegions,
      }),
    [scene],
  );
  const pieceById = useMemo(() => {
    const m = {};
    geometry.pieces.forEach((p) => { m[p.id] = p; });
    return m;
  }, [geometry]);

  // ── Layout do tabuleiro (contain 4:5) ──
  const stageW = Math.min(screenW - H_MARGIN * 2, 520);
  const ratio = scene.aspectRatio; // < 1 (portrait)
  const boardMaxH = 460;
  const contentW = Math.min(stageW, boardMaxH * ratio);
  const contentH = contentW / ratio;
  const boardLeft = (stageW - contentW) / 2;
  const boardTop = 0;
  const trayTop = contentH + GAP;
  const trayH = 132;

  // ── Estado ──
  const [placedIds, setPlacedIds] = useState([]);
  const [mode, setMode] = useState('drag'); // 'drag' | 'tap'
  const [selected, setSelected] = useState(false); // tap-to-place: peça ativa selecionada
  const [peeking, setPeeking] = useState(false);
  const [refModal, setRefModal] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showProtected, setShowProtected] = useState(false);
  const [showPaths, setShowPaths] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [snapTolFactor, setSnapTolFactor] = useState(0.42);

  const [geometryReadyMs, setGeometryReadyMs] = useState(null);
  const [imageShownMs, setImageShownMs] = useState(null);
  const [lastSnapMs, setLastSnapMs] = useState(null);
  const [resolvesLastDrop, setResolvesLastDrop] = useState(null);

  const activeId = PIECE_ORDER.find((id) => !placedIds.includes(id)) || null;
  const activePiece = activeId ? pieceById[activeId] : null;
  const done = placedIds.length === PIECE_ORDER.length;

  // ── Refs de gesto (sem setState por frame) ──
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevateAnim = useRef(new Animated.Value(0)).current;
  const gestureActiveRef = useRef(false);
  const resolvingRef = useRef(false);
  const mountedRef = useRef(true);
  const dropStartRef = useRef(0);
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  // Âncora da peça ativa na bandeja (coords do "stage").
  const activeAnchor = useMemo(() => {
    if (!activePiece) return { left: 0, top: trayTop, w: 0, h: 0 };
    const ob = activePiece.overscanBounds;
    const w = ob.w * contentW;
    const h = ob.h * contentH;
    return {
      left: boardLeft + (contentW - w) / 2,
      top: trayTop + Math.max(0, (trayH - h) / 2),
      w,
      h,
    };
  }, [activePiece, boardLeft, contentW, contentH, trayTop, trayH]);

  // ── Efeitos: reduce motion, geometria pronta, cancelamento em blur/AppState ──
  useEffect(() => {
    mountedRef.current = true;
    setGeometryReadyMs(Math.round(nowMs() - t0Ref.current));
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => { if (mountedRef.current) setReduceMotion(!!v); })
      .catch(() => {});
    return () => { mountedRef.current = false; };
  }, []);

  const cancelActiveGesture = useCallback(() => {
    // Nunca deixar uma peça flutuando após interrupção: volta à origem imediatamente.
    gestureActiveRef.current = false;
    resolvingRef.current = false;
    pan.stopAnimation(() => {});
    pan.setValue({ x: 0, y: 0 });
    scaleAnim.setValue(1);
    elevateAnim.setValue(0);
  }, [pan, scaleAnim, elevateAnim]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') cancelActiveGesture();
    });
    const offBlur = navigation.addListener('blur', cancelActiveGesture);
    return () => {
      sub?.remove?.();
      offBlur?.();
    };
  }, [navigation, cancelActiveGesture]);

  // ── Colocação de uma peça (fonte única de resolução; roda 1× por drop) ──
  const placeActive = useCallback(
    (landAtTarget) => {
      if (!activePiece) return;
      const piece = activePiece;
      const finishLock = () => {
        if (!mountedRef.current) return;
        playGameSfx('match_success');
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
        setPlacedIds((prev) => (prev.includes(piece.id) ? prev : [...prev, piece.id]));
        pan.setValue({ x: 0, y: 0 });
        scaleAnim.setValue(1);
        elevateAnim.setValue(0);
        setSelected(false);
      };
      // Destino em coords do stage: onde a peça deve pousar.
      const ob = piece.overscanBounds;
      const targetLeft = boardLeft + ob.x * contentW;
      const targetTop = boardTop + ob.y * contentH;
      const toX = targetLeft - activeAnchor.left;
      const toY = targetTop - activeAnchor.top;
      const startSnap = nowMs();
      setLastSnapMs(Math.round(startSnap - dropStartRef.current));
      if (reduceMotion || !landAtTarget) {
        pan.setValue({ x: toX, y: toY });
        finishLock();
      } else {
        Animated.timing(pan, {
          toValue: { x: toX, y: toY },
          duration: 160,
          useNativeDriver: false,
        }).start(({ finished }) => { if (finished) finishLock(); });
      }
    },
    [activePiece, boardLeft, boardTop, contentW, contentH, activeAnchor, reduceMotion, pan, scaleAnim, elevateAnim],
  );

  const softReturn = useCallback(() => {
    // Drop incorreto: retorno suave à origem, sem punição.
    if (reduceMotion) {
      pan.setValue({ x: 0, y: 0 });
    } else {
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 7 }).start();
    }
    Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: false }).start();
    Animated.timing(elevateAnim, { toValue: 0, duration: 120, useNativeDriver: false }).start();
  }, [pan, scaleAnim, elevateAnim, reduceMotion]);

  const evaluateDrop = useCallback(() => {
    if (!activePiece) return;
    // Resolve UMA vez por drop.
    if (resolvingRef.current) return;
    resolvingRef.current = true;
    let resolves = 1;
    const piece = activePiece;
    const ob = piece.overscanBounds;
    // Posição atual do snapPoint da peça na tela (stage).
    const spriteLeft = activeAnchor.left + pan.x._value;
    const spriteTop = activeAnchor.top + pan.y._value;
    const curSnapX = spriteLeft + (piece.snapPoint[0] - ob.x) * contentW;
    const curSnapY = spriteTop + (piece.snapPoint[1] - ob.y) * contentH;
    const tgtSnapX = boardLeft + piece.snapPoint[0] * contentW;
    const tgtSnapY = boardTop + piece.snapPoint[1] * contentH;
    const dist = Math.hypot(curSnapX - tgtSnapX, curSnapY - tgtSnapY);
    const tolPx = snapToleranceFor(piece, snapTolFactor) * contentW;
    setResolvesLastDrop(resolves);
    if (dist <= tolPx) {
      placeActive(true);
    } else {
      softReturn();
    }
    resolvingRef.current = false;
    void resolves;
  }, [activePiece, activeAnchor, pan, contentW, contentH, boardLeft, boardTop, snapTolFactor, placeActive, softReturn]);

  // ── PanResponder (um gesto por vez) ──
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => mode === 'drag' && !!activePiece && !gestureActiveRef.current && !done,
        onMoveShouldSetPanResponder: () => mode === 'drag' && !!activePiece && !gestureActiveRef.current && !done,
        onPanResponderGrant: () => {
          gestureActiveRef.current = true;
          resolvingRef.current = false;
          pan.setValue({ x: 0, y: 0 });
          Animated.timing(scaleAnim, { toValue: 1.06, duration: 120, useNativeDriver: false }).start();
          Animated.timing(elevateAnim, { toValue: 1, duration: 120, useNativeDriver: false }).start();
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: () => {
          dropStartRef.current = nowMs();
          gestureActiveRef.current = false;
          Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: false }).start();
          Animated.timing(elevateAnim, { toValue: 0, duration: 120, useNativeDriver: false }).start();
          evaluateDrop();
        },
        onPanResponderTerminate: () => { cancelActiveGesture(); },
      }),
    [mode, activePiece, done, pan, scaleAnim, elevateAnim, evaluateDrop, cancelActiveGesture],
  );

  // ── Tap-to-place ──
  const onTapActivePiece = useCallback(() => {
    if (mode !== 'tap' || !activePiece) return;
    setSelected((s) => !s);
  }, [mode, activePiece]);

  const onTapBoard = useCallback(() => {
    if (mode !== 'tap' || !activePiece || !selected) return;
    dropStartRef.current = nowMs();
    // No tap-to-place a criança indica o tabuleiro; colocamos no alvo correto da peça ativa.
    setResolvesLastDrop(1);
    placeActive(true);
  }, [mode, activePiece, selected, placeActive]);

  const resetLab = useCallback(() => {
    cancelActiveGesture();
    setPlacedIds([]);
    setSelected(false);
    setPeeking(false);
    setLastSnapMs(null);
    setResolvesLastDrop(null);
  }, [cancelActiveGesture]);

  // ── Beni: 3 momentos (entrada / 1ª peça / conclusão) ──
  const beniMessage = done
    ? 'Conseguimos! A cena ficou completa!'
    : placedIds.length === 0
      ? 'Vamos montar esta cena?'
      : 'Leve a peça até o lugar certo.';
  const beniVariant = done ? 'celebrating' : placedIds.length === 0 ? 'happy' : 'pointing';

  // Conclusão: som de tabuleiro completo (1×).
  const doneFiredRef = useRef(false);
  useEffect(() => {
    if (done && !doneFiredRef.current) {
      doneFiredRef.current = true;
      playGameSfx('board_complete');
    }
    if (!done) doneFiredRef.current = false;
  }, [done]);

  const noSource = !scene.source;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header interno (sem selo de produto). */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Text style={styles.backTxt}>‹ Voltar</Text>
        </Pressable>
        <View style={styles.labChip}><Text style={styles.labChipTxt}>Laboratório · M1A</Text></View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Beni-guia — nunca cobre o tabuleiro (fica acima dele). */}
        <View style={styles.beniWrap}>
          <BeniGuideBubble message={beniMessage} avatarVariant={beniVariant} compact />
        </View>

        {/* Miniatura de referência (fora do tabuleiro). */}
        <View style={styles.refRow}>
          <Pressable
            onPress={() => setRefModal(true)}
            accessibilityRole="imagebutton"
            accessibilityLabel="Ver a cena completa"
            style={styles.miniBtn}
          >
            {noSource ? (
              <View style={[styles.mini, styles.miniFallback]}><Text style={styles.miniFallbackTxt}>cena</Text></View>
            ) : (
              <Svg width={54} height={54 / ratio} style={styles.mini}>
                <SvgImage href={scene.source} x={0} y={0} width={54} height={54 / ratio} preserveAspectRatio="xMidYMid meet" />
              </Svg>
            )}
            <Text style={styles.miniLabel}>Referência</Text>
          </Pressable>

          <Pressable
            onPressIn={() => setPeeking(true)}
            onPressOut={() => setPeeking(false)}
            accessibilityRole="button"
            accessibilityLabel="Espiar a cena completa. Solte para voltar."
            style={styles.peekBtn}
          >
            <Text style={styles.peekTxt}>👁 Espiar</Text>
          </Pressable>
        </View>

        {/* STAGE: tabuleiro + bandeja + peça ativa (coords compartilhadas). */}
        <View style={[styles.stage, { width: stageW, height: trayTop + trayH }]}>
          {/* Tabuleiro */}
          <Pressable
            onPress={onTapBoard}
            style={[styles.board, { left: boardLeft, top: boardTop, width: contentW, height: contentH }]}
            accessibilityRole={mode === 'tap' ? 'button' : 'image'}
            accessibilityLabel={mode === 'tap' ? 'Toque para colocar a peça selecionada' : 'Tabuleiro da cena'}
          >
            {/* Imagem fantasma (baseline tipo Fácil), baixa opacidade. */}
            {!noSource && !peeking && (
              <Svg width={contentW} height={contentH} style={StyleSheet.absoluteFill}>
                <SvgImage
                  href={scene.source}
                  x={0}
                  y={0}
                  width={contentW}
                  height={contentH}
                  preserveAspectRatio="xMidYMid meet"
                  opacity={0.16}
                  onLoad={() => {
                    if (imageShownMs == null && mountedRef.current) {
                      setImageShownMs(Math.round(nowMs() - t0Ref.current));
                    }
                  }}
                />
              </Svg>
            )}

            {/* Espiar: imagem completa sobre o tabuleiro. */}
            {!noSource && peeking && (
              <Svg width={contentW} height={contentH} style={StyleSheet.absoluteFill}>
                <SvgImage href={scene.source} x={0} y={0} width={contentW} height={contentH} preserveAspectRatio="xMidYMid meet" />
              </Svg>
            )}

            {/* Peças já encaixadas (travadas, na posição do alvo). */}
            {!peeking && placedIds.map((id) => {
              const piece = pieceById[id];
              const ob = piece.overscanBounds;
              return (
                <View
                  key={id}
                  pointerEvents="none"
                  style={{ position: 'absolute', left: ob.x * contentW, top: ob.y * contentH }}
                >
                  <SpikePieceSvg scene={scene} piece={piece} boardW={contentW} boardH={contentH} showPath={showPaths} />
                </View>
              );
            })}

            {/* Overlays DEV: protectedRegions / visualBounds / snapPoints. */}
            {showProtected && scene.protectedRegions.map((r) => (
              <View
                key={r.id}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: r.x * contentW, top: r.y * contentH, width: r.w * contentW, height: r.h * contentH,
                  borderWidth: 2, borderColor: '#FF2D55', backgroundColor: '#FF2D5522',
                }}
              />
            ))}
            {showVisual && geometry.pieces.map((p) => (
              <View
                key={`vb-${p.id}`}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: p.visualBounds.x * contentW, top: p.visualBounds.y * contentH,
                  width: p.visualBounds.w * contentW, height: p.visualBounds.h * contentH,
                  borderWidth: 1, borderColor: '#0E9F6E', borderStyle: 'dashed',
                }}
              />
            ))}
            {showVisual && geometry.pieces.map((p) => (
              <View
                key={`sp-${p.id}`}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: p.snapPoint[0] * contentW - 3, top: p.snapPoint[1] * contentH - 3,
                  width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6',
                }}
              />
            ))}
          </Pressable>

          {/* Bandeja / berço da peça ativa. */}
          <View style={[styles.tray, { left: boardLeft, top: trayTop, width: contentW, height: trayH }]}>
            <Text style={styles.trayLabel}>
              {done ? 'Cena completa' : `Peça ${placedIds.length + 1} de 4`}
            </Text>
          </View>

          {/* Peça ativa (arrastável / selecionável). */}
          {!done && activePiece && !peeking && !noSource && (
            <Animated.View
              {...(mode === 'drag' ? panResponder.panHandlers : {})}
              style={{
                position: 'absolute',
                left: activeAnchor.left,
                top: activeAnchor.top,
                zIndex: 20,
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { scale: scaleAnim },
                ],
                shadowColor: '#000',
                shadowOpacity: elevateAnim.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.30] }),
                shadowRadius: elevateAnim.interpolate({ inputRange: [0, 1], outputRange: [4, 12] }),
                shadowOffset: { width: 0, height: 3 },
                elevation: 8,
              }}
            >
              <Pressable
                onPress={onTapActivePiece}
                accessibilityRole="button"
                accessibilityLabel={
                  mode === 'tap'
                    ? (selected ? 'Peça selecionada. Toque no tabuleiro para colocar.' : 'Toque para selecionar a peça.')
                    : 'Arraste a peça até o lugar certo.'
                }
                style={selected ? styles.selectedRing : null}
              >
                <SpikePieceSvg scene={scene} piece={activePiece} boardW={contentW} boardH={contentH} showPath={showPaths} />
              </Pressable>
            </Animated.View>
          )}
        </View>

        {noSource && (
          <View style={styles.warnBox}>
            <Text style={styles.warnTxt}>
              Fonte da cena indisponível (require ausente). O spike não pode renderizar sem substituir a cena.
            </Text>
          </View>
        )}

        {/* Conclusão: sem estrela, sem rodada — apenas Beni + resetar. */}
        {done && (
          <View style={styles.doneBox}>
            <BeniAvatar variant="celebrating" size="medium" />
            <Text style={styles.doneTxt}>Cena montada! (spike — sem estrela e sem rodada)</Text>
          </View>
        )}

        {/* Controles do laboratório */}
        <View style={styles.controls}>
          <Pressable style={styles.ctrlBtn} onPress={resetLab} accessibilityRole="button" accessibilityLabel="Resetar laboratório">
            <Text style={styles.ctrlTxt}>Resetar</Text>
          </Pressable>
          <Pressable
            style={styles.ctrlBtn}
            onPress={() => { setMode((m) => (m === 'drag' ? 'tap' : 'drag')); setSelected(false); cancelActiveGesture(); }}
            accessibilityRole="button"
            accessibilityLabel={`Interação: ${mode === 'drag' ? 'Arrastar' : 'Tocar'}. Toque para alternar.`}
          >
            <Text style={styles.ctrlTxt}>Interação: {mode === 'drag' ? 'Arrastar' : 'Tocar'}</Text>
          </Pressable>
        </View>

        {/* ── PAINEL DEV (recolhível) ── */}
        <Pressable style={styles.panelToggle} onPress={() => setPanelOpen((o) => !o)} accessibilityRole="button">
          <Text style={styles.panelToggleTxt}>{panelOpen ? '▾' : '▸'} Painel técnico (DEV)</Text>
        </Pressable>
        {panelOpen && (
          <View style={styles.panel}>
            {[
              ['sceneId', scene.sceneId],
              ['status', scene.status],
              ['artSize', `${scene.artWidth}×${scene.artHeight} (4:5)`],
              ['boardSize', `${Math.round(contentW)}×${Math.round(contentH)}`],
              ['layoutVersion', String(scene.layoutVersion)],
              ['seed', scene.seed],
              ['peça ativa', activeId || '—'],
              ['encaixadas', `${placedIds.length}/4 [${placedIds.join(',')}]`],
              ['snapTolFactor', snapTolFactor.toFixed(2)],
              ['último snap (ms)', lastSnapMs == null ? 'pendente' : String(lastSnapMs)],
              ['geometria pronta (ms)', geometryReadyMs == null ? '—' : String(geometryReadyMs)],
              ['imagem exibida (ms)', imageShownMs == null ? 'pendente' : String(imageShownMs)],
              ['resoluções no último drop', resolvesLastDrop == null ? '—' : String(resolvesLastDrop)],
              ['renders da tela', String(renderCountRef.current)],
              ['modo', mode],
              ['reduzir movimento', reduceMotion ? 'sim' : 'não'],
              ['seamCrossesProtected', String(geometry.seamCrossesProtected)],
              ['plataforma', Platform.OS],
            ].map(([k, v]) => (
              <View key={k} style={styles.panelRow}>
                <Text style={styles.panelKey}>{k}</Text>
                <Text style={styles.panelVal}>{v}</Text>
              </View>
            ))}

            <View style={styles.panelToggles}>
              <DevToggle label="protectedRegions" on={showProtected} onPress={() => setShowProtected((v) => !v)} />
              <DevToggle label="paths" on={showPaths} onPress={() => setShowPaths((v) => !v)} />
              <DevToggle label="visualBounds+snap" on={showVisual} onPress={() => setShowVisual((v) => !v)} />
            </View>
            <View style={styles.panelToggles}>
              <DevToggle label="tol −" on={false} onPress={() => setSnapTolFactor((f) => Math.max(0.2, +(f - 0.04).toFixed(2)))} />
              <DevToggle label="tol +" on={false} onPress={() => setSnapTolFactor((f) => Math.min(0.7, +(f + 0.04).toFixed(2)))} />
              <DevToggle label="simular blur" on={false} onPress={cancelActiveGesture} />
              <DevToggle label="reset" on={false} onPress={resetLab} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal simples de referência ampliada (sem pinch/zoom). */}
      {refModal && !noSource && (
        <Pressable style={styles.modalBackdrop} onPress={() => setRefModal(false)} accessibilityRole="button" accessibilityLabel="Fechar">
          <View style={styles.modalCard}>
            <Svg width={contentW} height={contentH}>
              <SvgImage href={scene.source} x={0} y={0} width={contentW} height={contentH} preserveAspectRatio="xMidYMid meet" />
            </Svg>
            <Pressable style={styles.modalClose} onPress={() => setRefModal(false)}>
              <Text style={styles.modalCloseTxt}>Fechar</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </View>
  );
}

function DevToggle({ label, on, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.devToggle, on && styles.devToggleOn]}
      accessibilityRole="button"
      accessibilityLabel={`${label}${on ? ' ligado' : ''}`}
    >
      <Text style={[styles.devToggleTxt, on && styles.devToggleTxtOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F1220' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: H_MARGIN, paddingVertical: 10,
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#1E2338' },
  backTxt: { color: '#CBD5E1', fontSize: 15, fontWeight: '700' },
  labChip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#3B2E66' },
  labChipTxt: { color: '#E9D5FF', fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },

  beniWrap: { width: '100%', paddingHorizontal: H_MARGIN, marginBottom: 8, maxWidth: 560 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  miniBtn: { alignItems: 'center' },
  mini: { borderRadius: 8, backgroundColor: '#1E2338' },
  miniFallback: { width: 54, height: 68, alignItems: 'center', justifyContent: 'center' },
  miniFallbackTxt: { color: '#64748B', fontSize: 11 },
  miniLabel: { color: '#94A3B8', fontSize: 11, marginTop: 3 },
  peekBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#1E2338' },
  peekTxt: { color: '#E2E8F0', fontSize: 14, fontWeight: '700' },

  stage: { position: 'relative', alignSelf: 'center' },
  board: {
    position: 'absolute', borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#161A2C', borderWidth: 1, borderColor: '#2A3150',
  },
  tray: {
    position: 'absolute', borderRadius: 12, borderWidth: 1, borderColor: '#2A3150',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 6,
  },
  trayLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  selectedRing: { borderWidth: 2, borderColor: '#F4B23C', borderRadius: 8 },

  warnBox: { margin: 16, padding: 12, borderRadius: 10, backgroundColor: '#3B1D1D' },
  warnTxt: { color: '#FCA5A5', fontSize: 13 },
  doneBox: { alignItems: 'center', marginTop: 14, gap: 6 },
  doneTxt: { color: '#A7F3D0', fontSize: 14, fontWeight: '700', textAlign: 'center', paddingHorizontal: 20 },

  controls: { flexDirection: 'row', gap: 12, marginTop: 18 },
  ctrlBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#243056' },
  ctrlTxt: { color: '#DBE4FF', fontSize: 14, fontWeight: '800' },

  panelToggle: { marginTop: 22, alignSelf: 'center' },
  panelToggleTxt: { color: '#93C5FD', fontSize: 13, fontWeight: '800' },
  panel: {
    marginTop: 10, width: '92%', maxWidth: 520, backgroundColor: '#12172A',
    borderRadius: 12, borderWidth: 1, borderColor: '#233', padding: 12,
  },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  panelKey: { color: '#7C8BB0', fontSize: 12 },
  panelVal: { color: '#E2E8F0', fontSize: 12, fontWeight: '700', maxWidth: '62%', textAlign: 'right' },
  panelToggles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  devToggle: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#1E2338' },
  devToggleOn: { backgroundColor: '#2563EB' },
  devToggleTxt: { color: '#9FB3D1', fontSize: 12, fontWeight: '700' },
  devToggleTxtOn: { color: '#fff' },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject, backgroundColor: '#000000CC',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modalCard: { backgroundColor: '#0F1220', borderRadius: 14, padding: 12, alignItems: 'center' },
  modalClose: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 12, backgroundColor: '#243056' },
  modalCloseTxt: { color: '#DBE4FF', fontSize: 15, fontWeight: '800' },
});
