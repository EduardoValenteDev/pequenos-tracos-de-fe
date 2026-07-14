/**
 * MonteACenaTableGameScreen.js — RODADA REAL (M1R5 integrada · M1R6 premium · M1R7 polimento · M1R8A
 * consolidação). Tela que a CRIANÇA usa. Motor DEFINITIVO `usePuzzleEngine` em MODO SEGURO (js-safe).
 * NÃO importa `usePuzzleController`, PanResponder, nem onBoardPress global.
 *
 * Marca de integração: MONTE_A_CENA_ENGINE_VERSION = 'M1R5_INTEGRATED' (Modo Criador + console.log).
 *
 * M1R8A — três consolidações críticas:
 *   (1) EFEITO DE ACERTO em TODA peça: a tela renderiza um efeito por `successEventId` (key) → cada
 *       acerto tem seu componente independente (sem timer compartilhado apagando efeito novo).
 *   (2) BANDEJA EMBARALHADA: ordem determinística por seed (derangement) — o 1º poço não corresponde
 *       ao 1º alvo. Só muda a posição visual; alvo/id intocados.
 *   (3) NAVEGAÇÃO da conclusão: `exitToMonteAcenaHome`/`exitToBrincar` (popTo, sem cadeia de goBack;
 *       a conclusão não fica na pilha). "Montar novamente" remonta a rodada (nova ordem) SEM empilhar.
 *
 * A camada externa resolve a SESSÃO (ordem + peças restauradas) e só então monta a rodada (motor com
 * `initialPlacedIds`). "Montar novamente" = nova sessionId → remonta com nova ordem.
 *
 * ⚠️ Reanimated é módulo NATIVO → já presente na build de desenvolvimento instalada (sem build nova).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, Animated as RNAnimated, AccessibilityInfo, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path, Image as SvgImage } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { colors as pt, radii, shadows } from '../theme/productTheme';
import FaithIcon from '../components/ui/FaithIcon';
import BeniAvatar from '../components/beni/BeniAvatar';
import { isInternalToolsEnabled } from '../config/internalTools';
import { useProfile } from '../context/ProfileContext';
import { isPremiumUser } from '../services/accessControl';
import { playGameSfx, preloadGameSfx } from '../services/audioManager';
import { consumeRound } from '../services/brincarDailyService';
import { getCatalogScene, buildCatalogLevel, MONTE_A_CENA_CATALOG } from '../data/monteACenaCatalog';
import { getStoryForScene } from '../data/monteACenaStories';
import { buildLevelGeometry, getLevelSource } from '../data/monteACenaLevels';
import { saveCompletion, getCompletedList } from '../services/monteACenaGallery';
import { saveActiveSession, clearActiveSession, getRawSession, isResumable, collectionMessage } from '../services/monteACenaProgress';
import { createSeededDerangement } from '../data/monteACenaShuffle';
import { computeTableLayout, HEADER_H, CORRIDOR_H } from '../services/monteACenaLayout';
import { MONTE_A_CENA_MOTION as MOTION } from '../data/monteACenaMotionTokens';
import { exitToMonteAcenaHome, exitToBrincar } from '../navigation/monteACenaExit';
import usePuzzleEngine, { MONTE_A_CENA_ENGINE_VERSION } from '../hooks/usePuzzleEngine';
import PuzzlePiece from '../components/monteACena/PuzzlePiece';
import PuzzleTarget from '../components/monteACena/PuzzleTarget';
import TrayPieceView from '../components/monteACena/TrayPieceView';
import GuidanceCorridor from '../components/monteACena/GuidanceCorridor';
import PuzzleSuccessBurst from '../components/monteACena/PuzzleSuccessBurst';

// Mapeia o nome semântico do motor → chave de áudio real (o motor emite 'wrong_place', o banco tem
// 'match_error'). Assim o erro TOCA de verdade (antes era no-op silencioso).
function playPuzzleSfx(name) {
  try { playGameSfx(name === 'wrong_place' ? 'match_error' : name); } catch { /* nunca lança */ }
}
function doHaptic(kind) {
  try {
    if (kind === 'select') Haptics.selectionAsync();
    else if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'warning') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch { /* háptico é opcional */ }
}

function ContemplationParticles({ boardW, boardH, reduceMotion }) {
  const tw = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) { tw.setValue(0.7); return undefined; }
    const loop = RNAnimated.loop(RNAnimated.sequence([
      RNAnimated.timing(tw, { toValue: 1, duration: 900, useNativeDriver: true }),
      RNAnimated.timing(tw, { toValue: 0.3, duration: 900, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, tw]);
  const spots = [{ x: 0.06, y: 0.05 }, { x: 0.92, y: 0.08 }, { x: 0.5, y: -0.02 }, { x: 0.04, y: 0.94 }, { x: 0.95, y: 0.9 }, { x: 0.5, y: 1.0 }];
  const use = reduceMotion ? spots.slice(0, 3) : spots;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {use.map((s, i) => (<RNAnimated.View key={i} style={[styles.particle, { left: s.x * boardW - 4, top: s.y * boardH - 4, opacity: tw }]} />))}
    </View>
  );
}

function LightSweep({ boardW, boardH, reduceMotion }) {
  const t = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => { if (reduceMotion) return undefined; RNAnimated.timing(t, { toValue: 1, duration: 900, useNativeDriver: true }).start(); return undefined; }, [reduceMotion, t]);
  if (reduceMotion) return null;
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [-boardW * 0.6, boardW * 1.1] });
  const opacity = t.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.35, 0.35, 0] });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <RNAnimated.View style={{ position: 'absolute', top: -boardH * 0.2, height: boardH * 1.4, width: boardW * 0.28, backgroundColor: '#FFFFFF', opacity, transform: [{ translateX: tx }, { rotate: '14deg' }] }} />
    </View>
  );
}

/* ════════════════════ RODADA (motor + jogo). Monta com a sessão já resolvida. ════════════════════ */
function PuzzleRound({ scene, pieceCount, story, premium, profileId, reduceMotion, sessionId, shuffleSeed, trayPieceOrder, initialPlacedIds, canReplay, onReplay, navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const level = useMemo(() => buildCatalogLevel(scene, pieceCount), [scene, pieceCount]);
  const source = getLevelSource(level);
  const geometry = useMemo(() => buildLevelGeometry(level), [level]);
  const pieceById = useMemo(() => { const m = {}; geometry.pieces.forEach((p) => { m[p.id] = p; }); return m; }, [geometry]);
  const artW = level.artWidth; const artH = level.artHeight;
  const ratio = geometry.boardRatio;

  useEffect(() => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`[DEV][MonteACena] screen=M1R5 engine=${MONTE_A_CENA_ENGINE_VERSION}`); // __DEV__ marca de integração
    }
    try { preloadGameSfx(['match_success', 'match_error', 'board_complete', 'game_victory']); } catch {}
  }, []);

  // Layout em CINCO zonas; a bandeja usa a ordem EMBARALHADA (trayOrder).
  const L = useMemo(() => computeTableLayout({
    screenW, screenH, insetTop: insets.top, insetBottom: insets.bottom, pieceCount, ratio, pieces: geometry.pieces, trayOrder: trayPieceOrder,
  }), [screenW, screenH, insets.top, insets.bottom, pieceCount, ratio, geometry.pieces, trayPieceOrder]);
  const { boardTop, boardLeft, boardW, boardH, trayTop, trayH, wellSize, wellsById, trayScale } = L;

  const pieceDims = useCallback((p) => ({ w: p.overscanBounds.w * boardW, h: p.overscanBounds.h * boardH }), [boardW, boardH]);

  const sceneIds = useMemo(() => (story ? story.puzzleScenes.map((p) => p.puzzleSceneId) : [scene.puzzleSceneId]), [story, scene]);
  const [completedIds, setCompletedIds] = useState([]);
  const refreshCompleted = useCallback(() => { getCompletedList(profileId).then((list) => setCompletedIds(list.map((c) => c.puzzleSceneId))).catch(() => {}); }, [profileId]);
  useEffect(() => { refreshCompleted(); }, [refreshCompleted]);

  // Persiste a sessão (ordem + peças) a cada encaixe; limpa ao concluir.
  const onCommit = useCallback((pieceId) => {
    const placedPieceIds = Array.from(new Set([...(engineRef.current?.placedPieceIds || []), pieceId]));
    saveActiveSession(profileId, {
      sessionId, puzzleSceneId: scene.puzzleSceneId, storyId: scene.storyId, sceneNumber: scene.sceneNumber,
      pieceCount, placedPieceIds, trayPieceOrder, shuffleSeed, startedAt: sessionId, updatedAt: null,
    });
  }, [profileId, scene, pieceCount, sessionId, trayPieceOrder, shuffleSeed]);

  const onComplete = useCallback(() => {
    clearActiveSession(profileId);
    if (premium) {
      saveCompletion(profileId, { puzzleSceneId: scene.puzzleSceneId, storyId: scene.storyId, sceneNumber: scene.sceneNumber, pieceCount, completedAt: null })
        .then(refreshCompleted).catch(() => {});
    }
  }, [premium, profileId, scene, pieceCount, refreshCompleted]);

  const engine = usePuzzleEngine({
    totalPieces: pieceCount,
    onSound: playPuzzleSfx,
    onHaptic: doHaptic,
    onCommit,
    onComplete,
    reduceMotion,
    guideOpacity: level.guideOpacity,
    initialPlacedIds,
  });
  const engineRef = useRef(engine); engineRef.current = engine;

  // Geometria root-local (alvos com snapLeft/snapTop; poços na ordem embaralhada).
  const rootRef = useRef(null);
  const pushGeometry = useCallback(() => {
    const targets = geometry.pieces.map((p) => {
      const c = p.cellRect; const ob = p.overscanBounds;
      const left = boardLeft + c.x * boardW; const top = boardTop + c.y * boardH;
      const width = c.w * boardW; const height = c.h * boardH;
      return {
        id: p.id, left, top, right: left + width, bottom: top + height, cx: left + width / 2, cy: top + height / 2,
        snapLeft: boardLeft + ob.x * boardW, snapTop: boardTop + ob.y * boardH,
      };
    });
    const wells = geometry.pieces.map((p) => ({ id: p.id, ...wellsById[p.id] }));
    engine.setTrayScale(trayScale);
    const send = (rx, ry) => engine.setGeometry({ root: { x: rx, y: ry, rootW: screenW, rootH: screenH }, targets, wells });
    if (rootRef.current?.measureInWindow) rootRef.current.measureInWindow((x, y) => send(x || 0, y || 0));
    else send(0, 0);
  }, [geometry, boardLeft, boardTop, boardW, boardH, wellsById, trayScale, screenW, screenH, engine]);
  useEffect(() => { pushGeometry(); }, [pushGeometry]);

  // ── EFEITO DE ACERTO por evento (M1R8A): lista de bursts independentes, cada um com key=successEventId. ──
  const [bursts, setBursts] = useState([]);
  useEffect(() => {
    const ev = engine.successEvent;
    if (ev && ev.successEventId > 0) {
      setBursts((list) => (list.some((b) => b.successEventId === ev.successEventId) ? list : [...list, ev]));
    }
  }, [engine.successEvent]);
  const removeBurst = useCallback((id) => setBursts((list) => list.filter((b) => b.successEventId !== id)), []);

  // Ritual de conclusão (4 fases) automático.
  const ritual = useRef(new RNAnimated.Value(0)).current;
  const framePulse = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    if (engine.phase === 'celebrating') {
      RNAnimated.timing(ritual, { toValue: 1, duration: reduceMotion ? 200 : MOTION.seamFadeDuration, useNativeDriver: true }).start();
      const t = setTimeout(() => engine.revealArtwork(), reduceMotion ? 240 : MOTION.seamFadeDuration);
      return () => clearTimeout(t);
    }
    if (engine.phase === 'viewingArtwork') {
      RNAnimated.sequence([
        RNAnimated.timing(framePulse, { toValue: 1, duration: 180, useNativeDriver: true }),
        RNAnimated.timing(framePulse, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
      const t = setTimeout(() => engine.showActions(), reduceMotion ? 1200 : MOTION.completionRevealDuration);
      return () => clearTimeout(t);
    }
    if (engine.phase === 'idle' || engine.phase === 'selected' || engine.phase === 'dragging') { ritual.setValue(0); }
    return undefined;
  }, [engine.phase, reduceMotion, ritual, framePulse]);

  const progPop = useRef(new RNAnimated.Value(0)).current;
  const placedCountRef = useRef(engine.placedPieceIds.length);
  useEffect(() => {
    const n = engine.placedPieceIds.length;
    if (n !== placedCountRef.current) {
      placedCountRef.current = n;
      if (n > 0 && !reduceMotion) {
        RNAnimated.sequence([
          RNAnimated.timing(progPop, { toValue: 1, duration: 110, useNativeDriver: true }),
          RNAnimated.timing(progPop, { toValue: 0, duration: 140, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [engine.placedPieceIds.length, reduceMotion, progPop]);

  const placed = engine.placedPieceIds;
  const done = engine.phase === 'celebrating' || engine.phase === 'viewingArtwork' || engine.phase === 'showingActions';
  const unplaced = geometry.pieces.filter((p) => !placed.includes(p.id));
  const activePiece = engine.activeId ? pieceById[engine.activeId] : null;
  const ad = activePiece ? pieceDims(activePiece) : { w: 1, h: 1 };

  const completedInStory = useMemo(() => {
    const set = new Set([...completedIds, scene.puzzleSceneId]);
    return sceneIds.filter((id) => set.has(id)).length;
  }, [completedIds, scene, sceneIds]);
  const collLine = collectionMessage(sceneIds.length, completedInStory);

  const corridorTone = engine.guidanceTone || 'neutral';
  const boardLift = ritual.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const boardScale = framePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] });
  const progScale = progPop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

  // Diagnóstico compacto vs expandido (Modo Criador).
  const [diagExpanded, setDiagExpanded] = useState(false);

  return (
    <View style={styles.root} ref={rootRef} onLayout={pushGeometry}>
      <View style={{ height: insets.top }} />
      <RNAnimated.View style={[styles.header, { height: HEADER_H, opacity: done ? ritual.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }) : 1 }]}>
        <Pressable style={styles.iconPill} onPress={() => exitToMonteAcenaHome(navigation)} accessibilityRole="button" accessibilityLabel="Voltar ao Monte a Cena" hitSlop={8}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
        <RNAnimated.View style={[styles.progressPill, { transform: [{ scale: progScale }] }]}><Text style={styles.progressText}>{placed.length} de {pieceCount}</Text></RNAnimated.View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} onPress={onReplay} accessibilityRole="button" accessibilityLabel="Recomeçar" hitSlop={6}>
            <FaithIcon name="restart" size={18} color={pt.purpleDeep} />
          </Pressable>
        </View>
      </RNAnimated.View>
      <View style={{ height: L.boardZoneH }} />
      <View style={{ height: CORRIDOR_H }}>
        {!done && <GuidanceCorridor message={engine.guidance} height={CORRIDOR_H} tone={corridorTone} reduceMotion={reduceMotion} />}
      </View>
      <View style={[styles.trayZone, { height: trayH }]}>
        {!done && (<Text style={styles.dockHint}>Peças restantes <Text style={styles.dockCount}>{unplaced.length}</Text></Text>)}
      </View>
      <View style={{ height: insets.bottom }} />

      {/* ══ TABULEIRO ══ */}
      <RNAnimated.View style={[styles.board, { left: boardLeft, top: boardTop, width: boardW, height: boardH, transform: [{ translateY: boardLift }, { scale: boardScale }] }, done && styles.boardDone]}>
        {source && (
          <Svg width={boardW} height={boardH} viewBox={`${geometry.cropPx.x0} ${geometry.cropPx.y0} ${geometry.cropPx.w} ${geometry.cropPx.h}`} pointerEvents="none">
            <SvgImage href={source} x={0} y={0} width={artW} height={artH} preserveAspectRatio="xMidYMid meet" opacity={done ? 1 : level.guideOpacity} />
            {/* célula vazia: guia por-célula um pouco mais forte que a guia geral */}
            {!done && unplaced.map((p) => (<Path key={`cg-${p.id}`} d={p.path} fill="none" stroke={pt.purpleDeep} strokeWidth={2} opacity={0.10} strokeLinejoin="round" />))}
          </Svg>
        )}
        {source && placed.map((id) => {
          const p = pieceById[id]; const ob = p.overscanBounds;
          return (
            <View key={`pl-${id}`} pointerEvents="none" style={{ position: 'absolute', left: ob.x * boardW, top: ob.y * boardH }}>
              <PuzzlePiece source={source} piece={p} artW={artW} artH={artH} boardW={boardW} boardH={boardH} scale={1} variant="placed" />
            </View>
          );
        })}
        {(engine.phase === 'viewingArtwork' || engine.phase === 'showingActions') && (
          <>
            <LightSweep boardW={boardW} boardH={boardH} reduceMotion={reduceMotion} />
            <ContemplationParticles boardW={boardW} boardH={boardH} reduceMotion={reduceMotion} />
          </>
        )}
      </RNAnimated.View>

      {/* ══ ALVOS ══ */}
      {!done && unplaced.map((p) => {
        const c = p.cellRect;
        const isHint = engine.hintTargetId === p.id;
        const isWrong = engine.fx.lastWrongTargetId === p.id;
        return (
          <PuzzleTarget key={`t-${p.id}`} targetPieceId={p.id}
            left={boardLeft + c.x * boardW} top={boardTop + c.y * boardH} width={c.w * boardW} height={c.h * boardH}
            hintLevel={isHint ? engine.hintLevel : 0} pulseKey={isWrong ? engine.fx.wrongKey : 0} reduceMotion={reduceMotion}
            onTap={(id) => engine.onTargetTapped(id, pieceDims(pieceById[id]))} />
        );
      })}

      {/* ══ POÇOS + PEÇAS — renderizados no NÍVEL DA RAIZ (coords root-local). `opacity` esconde SÓ a ativa. ══ */}
      {!done && unplaced.map((p) => {
        const w = wellsById[p.id];
        const sw = p.overscanBounds.w * boardW * trayScale; const sh = p.overscanBounds.h * boardH * trayScale;
        const selected = engine.selectedPieceId === p.id;
        const returning = engine.phase === 'returning' && engine.activeId === p.id;
        const isThisActive = engine.activeId === p.id;   // esconde SÓ esta peça, não todas
        return (
          <React.Fragment key={`w-${p.id}`}>
            <View pointerEvents="none" style={[styles.well, { left: w.left, top: w.top, width: wellSize, height: wellSize }, (selected || returning) && styles.wellGlow]} />
            <GestureDetector gesture={engine.makePieceGesture(p.id, pieceDims(p))}>
              <View style={{ position: 'absolute', left: w.cx - sw / 2, top: w.cy - sh / 2, width: sw, height: sh, opacity: isThisActive ? 0 : 1, alignItems: 'center', justifyContent: 'center' }}>
                <TrayPieceView piece={p} source={source} artW={artW} artH={artH} boardW={boardW} boardH={boardH} trayScale={trayScale} selected={selected} reduceMotion={reduceMotion} />
              </View>
            </GestureDetector>
          </React.Fragment>
        );
      })}

      {/* ══ OVERLAY ATIVO ══ */}
      {activePiece && (
        <Animated.View pointerEvents="none" style={[styles.overlay, { width: ad.w, height: ad.h }, engine.overlayStyle]}>
          <PuzzlePiece source={source} piece={activePiece} artW={artW} artH={artH} boardW={boardW} boardH={boardH} scale={1} variant="active" />
        </Animated.View>
      )}

      {/* ══ EFEITOS DE ACERTO — um por successEventId (independentes, cada um se remove via onDone) ══ */}
      {bursts.map((b) => (
        <PuzzleSuccessBurst key={b.successEventId} eventId={b.successEventId}
          x={b.centerX - b.size / 2} y={b.centerY - b.size / 2} size={b.size}
          reduceMotion={reduceMotion} onDone={removeBurst} />
      ))}

      {/* ══ CONTEMPLAÇÃO (fase 3) ══ */}
      {engine.phase === 'viewingArtwork' && (
        <View pointerEvents="none" style={[styles.contemplate, { top: boardTop + boardH + 10 }]}>
          <BeniAvatar variant="celebrating" size="medium" />
          <Text style={styles.contTitle}>Quadro concluído!</Text>
          {collLine && <Text style={styles.contColl}>{collLine}</Text>}
        </View>
      )}

      {/* ══ AÇÕES (fase 4): tela final simplificada — 2 controles principais + link discreto ══ */}
      {engine.phase === 'showingActions' && (
        <View style={[styles.drawer, { paddingBottom: insets.bottom + 14 }]}>
          <View style={styles.drawerHead}>
            <View style={styles.doneSeal}><FaithIcon name="check" size={13} color="#FFF" /></View>
            <Text style={styles.drawerKicker}>Quadro concluído!</Text>
          </View>
          <Text style={styles.drawerScene}>{scene.title}</Text>
          {collLine ? <Text style={styles.drawerColl}>{collLine}</Text> : (premium ? <Text style={styles.drawerStory}>Guardado em Meus Quadros</Text> : null)}
          {!canReplay && !premium && (<Text style={styles.limitInline}>Você já montou duas vezes hoje. Amanhã tem mais!</Text>)}
          <View style={styles.actRow}>
            {canReplay && (
              <Pressable style={[styles.actBtn, styles.actPrimary]} onPress={onReplay} accessibilityRole="button" accessibilityLabel="Montar novamente">
                <Text style={styles.actTxtP}>Montar novamente</Text>
              </Pressable>
            )}
            <Pressable style={styles.actBtn} onPress={() => exitToMonteAcenaHome(navigation)} accessibilityRole="button" accessibilityLabel="Voltar ao Monte a Cena">
              <Text style={styles.actTxt}>Voltar ao Monte a Cena</Text>
            </Pressable>
          </View>
          <Pressable style={styles.brincarLink} onPress={() => exitToBrincar(navigation)} accessibilityRole="button" accessibilityLabel="Voltar ao Brincar">
            <Text style={styles.brincarLinkTxt}>Voltar ao Brincar</Text>
          </Pressable>
        </View>
      )}

      {/* ══ DIAGNÓSTICO (Modo Criador) — compacto por padrão; "Ver detalhes" expande ══ */}
      {isInternalToolsEnabled() && !done && (
        <View style={[styles.diag, { bottom: insets.bottom + 6 }]}>
          <Pressable onPress={() => setDiagExpanded((v) => !v)} accessibilityRole="button" accessibilityLabel="Diagnóstico Monte a Cena">
            <Text style={styles.diagLine}>Motor M1R7 · {engine.diagnostics.machineState} · ativa {String(engine.diagnostics.activePieceId)} · {String(engine.diagnostics.lastHitResult)} · {diagExpanded ? 'Ocultar' : 'Ver detalhes'}</Text>
          </Pressable>
          {diagExpanded && (
            <>
              <Text style={styles.diagLine} pointerEvents="none">Motor: M1R5 integrado ({engine.engineVersion}) · runtime {engine.runtime} · safe {String(engine.safeMode)} · M1R8A</Text>
              <Text style={styles.diagLine} pointerEvents="none">defs {geometry.pieces.length} · remaining {unplaced.length} · rendered {unplaced.length} · visible {unplaced.filter((p) => engine.activeId !== p.id).length} · src {String(!!source)}</Text>
              <Text style={styles.diagLine} pointerEvents="none">commits {engine.diagnostics.successfulCommitCount} · effects {engine.diagnostics.successEffectCount} · ok {String(engine.diagnostics.successOk)} · lastEv {engine.diagnostics.lastSuccessEventId} · overlay {String(engine.diagnostics.overlayVisible)} · handoff {String(engine.diagnostics.handoffReady)}</Text>
              <Text style={styles.diagLine} pointerEvents="none">seed {String(shuffleSeed)} · order [{(trayPieceOrder || []).join(',')}] · placed [{engine.diagnostics.placedPieceIds.join(',')}]</Text>
              <View style={styles.diagBtns}>
                {unplaced[0] && <Pressable style={styles.diagBtn} onPress={() => engine.devForcePlace(unplaced[0].id, pieceDims(unplaced[0]))}><Text style={styles.diagBtnTxt}>testar acerto</Text></Pressable>}
                <Pressable style={styles.diagBtn} onPress={() => engine.devFlash('error', unplaced[0]?.id)}><Text style={styles.diagBtnTxt}>testar erro</Text></Pressable>
                <Pressable style={styles.diagBtn} onPress={() => unplaced.forEach((p, i) => setTimeout(() => engine.devForcePlace(p.id, pieceDims(p)), i * 300))}><Text style={styles.diagBtnTxt}>testar conclusão</Text></Pressable>
                <Pressable style={styles.diagBtn} onPress={onReplay}><Text style={styles.diagBtnTxt}>nova ordem</Text></Pressable>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

/* ════════════════════ OUTER: resolve sessão (ordem + restauração) + regra do plano grátis. ════════════════════ */
export default function MonteACenaTableGameScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const profileId = (profile && (profile.id || profile.avatarId)) || 'default';
  const premium = isPremiumUser();
  const scene = getCatalogScene(route?.params?.puzzleSceneId) || MONTE_A_CENA_CATALOG[0];
  const pieceCount = route?.params?.pieceCount || 4;
  const story = getStoryForScene(scene.puzzleSceneId);
  const wantResume = !!route?.params?.resume;

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => { if (alive) setReduceMotion(!!v); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Ids naturais (para o shuffle) — geometria determinística por (cena, nº de peças).
  const naturalIds = useMemo(() => buildLevelGeometry(buildCatalogLevel(scene, pieceCount)).pieces.map((p) => p.id), [scene, pieceCount]);

  // Sessão: { status: 'loading'|'ready'|'limit', session: { sessionId, shuffleSeed, trayPieceOrder, initialPlacedIds }, remaining }
  const [state, setState] = useState({ status: 'loading', session: null, remaining: Infinity });
  const replayRef = useRef(0);
  const base = `${scene.puzzleSceneId}|${pieceCount}`;

  const startFreshSession = useCallback((remaining) => {
    const seed = replayRef.current === 0 ? `${base}|s0` : `${base}|r${replayRef.current}`;
    const order = createSeededDerangement(naturalIds, seed);
    saveActiveSession(profileId, {
      sessionId: seed, puzzleSceneId: scene.puzzleSceneId, storyId: scene.storyId, sceneNumber: scene.sceneNumber,
      pieceCount, placedPieceIds: [], trayPieceOrder: order, shuffleSeed: seed, startedAt: seed, updatedAt: null,
    });
    setState({ status: 'ready', session: { sessionId: seed, shuffleSeed: seed, trayPieceOrder: order, initialPlacedIds: [] }, remaining });
  }, [base, naturalIds, profileId, scene, pieceCount]);

  // Montagem: consome a rodada (grátis conta ao começar) e resolve a sessão (restaura OU cria nova).
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return undefined;
    bootedRef.current = true;
    (async () => {
      let raw = null;
      try { raw = await getRawSession(profileId); } catch { raw = null; }
      const canRestore = wantResume && raw && raw.puzzleSceneId === scene.puzzleSceneId && raw.pieceCount === pieceCount
        && Array.isArray(raw.trayPieceOrder) && isResumable(raw);
      if (canRestore) {
        // CONTINUAR: mesma ordem, mesmas peças, sem novo shuffle e sem consumir rodada (já começou antes).
        replayRef.current = 0;
        setState({ status: 'ready', session: { sessionId: raw.sessionId || raw.shuffleSeed || `${base}|s0`, shuffleSeed: raw.shuffleSeed, trayPieceOrder: raw.trayPieceOrder, initialPlacedIds: raw.placedPieceIds || [] }, remaining: premium ? Infinity : 1 });
        return;
      }
      // NOVA rodada: conta no contador diário.
      let r = { ok: true, remaining: Infinity, premium };
      try { r = await consumeRound(); } catch { r = { ok: true, remaining: Infinity, premium: true }; }
      if (!r.ok && !r.premium) { setState({ status: 'limit', session: null, remaining: 0 }); return; }
      startFreshSession(r.remaining);
    })();
    return undefined;
  }, [profileId, wantResume, scene, pieceCount, premium, base, startFreshSession]);

  // "Montar novamente": nova seed/ordem/sessionId, peças limpas — remonta a rodada (novo key), sem empilhar.
  const handleReplay = useCallback(() => {
    (async () => {
      let r = { ok: true, remaining: Infinity, premium };
      try { r = await consumeRound(); } catch { r = { ok: true, remaining: Infinity, premium: true }; }
      if (!r.ok && !r.premium) { setState((s) => ({ ...s, remaining: 0 })); return; }
      replayRef.current += 1;
      startFreshSession(r.remaining);
    })();
  }, [premium, startFreshSession]);

  const goMonteACena = () => exitToMonteAcenaHome(navigation);

  if (state.status === 'loading') {
    return (<View style={[styles.root, styles.center]}><ActivityIndicator color={pt.purple} /></View>);
  }
  if (state.status === 'limit') {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={[styles.header, { height: HEADER_H }]}>
          <Pressable style={styles.iconPill} onPress={goMonteACena} accessibilityRole="button" accessibilityLabel="Voltar ao Monte a Cena" hitSlop={8}><Text style={styles.backText}>‹ Voltar</Text></Pressable>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.limitBox}>
          <BeniAvatar variant="happy" size="large" />
          <Text style={styles.limitTitle}>Você já montou duas vezes hoje.</Text>
          <Text style={styles.limitSub}>Amanhã tem mais!</Text>
          <Pressable style={[styles.actBtn, styles.actPrimary, { marginTop: 18 }]} onPress={goMonteACena} accessibilityRole="button" accessibilityLabel="Voltar ao Monte a Cena"><Text style={styles.actTxtP}>Voltar ao Monte a Cena</Text></Pressable>
          <Pressable style={styles.brincarLink} onPress={() => exitToBrincar(navigation)} accessibilityRole="button" accessibilityLabel="Voltar ao Brincar"><Text style={styles.brincarLinkTxt}>Voltar ao Brincar</Text></Pressable>
        </View>
      </View>
    );
  }

  const canReplay = premium || state.remaining > 0;
  return (
    <PuzzleRound
      key={state.session.sessionId}
      scene={scene} pieceCount={pieceCount} story={story} premium={premium} profileId={profileId} reduceMotion={reduceMotion}
      sessionId={state.session.sessionId} shuffleSeed={state.session.shuffleSeed} trayPieceOrder={state.session.trayPieceOrder}
      initialPlacedIds={state.session.initialPlacedIds} canReplay={canReplay} onReplay={handleReplay} navigation={navigation}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  iconPill: { backgroundColor: 'rgba(124,58,237,0.10)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  backText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  progressPill: { backgroundColor: pt.goldSoft, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 5 },
  progressText: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.goldDeep },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(124,58,237,0.10)', alignItems: 'center', justifyContent: 'center' },

  board: { position: 'absolute', backgroundColor: '#FBF4E4', borderRadius: radii.lg + 4, overflow: 'hidden', borderWidth: 2, borderColor: '#F0D9A0', ...shadows.card },
  boardDone: { borderColor: pt.goldDeep, borderWidth: 3, shadowColor: pt.goldDeep, shadowOpacity: 0.3, shadowRadius: 12 },
  particle: { position: 'absolute', width: 8, height: 8, borderRadius: 2, backgroundColor: pt.gold, transform: [{ rotate: '45deg' }] },

  trayZone: { backgroundColor: '#F6F3FF', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: 'rgba(124,58,237,0.14)' },
  dockHint: { paddingTop: 10, paddingHorizontal: 20, fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.purpleDeep },
  dockCount: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.purple },
  well: { position: 'absolute', borderRadius: 16, backgroundColor: 'rgba(91,33,182,0.05)' },
  wellGlow: { backgroundColor: 'rgba(249,199,79,0.22)', borderWidth: 1.5, borderColor: 'rgba(224,162,26,0.5)' },

  overlay: { position: 'absolute', left: 0, top: 0, zIndex: 50 },

  contemplate: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 40, gap: 6 },
  contTitle: { fontFamily: 'FredokaOne', fontSize: 19, color: pt.greenDeep },
  contColl: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.goldDeep, textAlign: 'center' },

  drawer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFDF7', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1.5, borderColor: '#F0D9A0', paddingTop: 16, paddingHorizontal: 18, zIndex: 60, ...shadows.card },
  drawerHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doneSeal: { width: 24, height: 24, borderRadius: 12, backgroundColor: pt.greenDeep, alignItems: 'center', justifyContent: 'center' },
  drawerKicker: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.greenDeep },
  drawerScene: { fontFamily: 'FredokaOne', fontSize: 19, color: pt.text, marginTop: 8 },
  drawerStory: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.goldDeep, marginBottom: 4 },
  drawerColl: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.goldDeep, marginBottom: 4 },
  limitInline: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.beniDeep, marginTop: 6 },
  actRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  actBtn: { backgroundColor: pt.cream, borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 12, ...shadows.soft },
  actPrimary: { backgroundColor: pt.beni },
  actTxt: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.purpleDeep },
  actTxtP: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
  brincarLink: { alignSelf: 'center', paddingVertical: 10, marginTop: 4 },
  brincarLinkTxt: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft, textDecorationLine: 'underline' },

  limitBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 4 },
  limitTitle: { fontFamily: 'FredokaOne', fontSize: 19, color: pt.text, marginTop: 12, textAlign: 'center' },
  limitSub: { fontFamily: 'Nunito', fontSize: 15, fontWeight: '800', color: pt.beniDeep },

  diag: { position: 'absolute', left: 8, right: 8, backgroundColor: 'rgba(15,18,32,0.9)', borderRadius: 10, padding: 8 },
  diagLine: { color: '#CFE', fontSize: 10, fontFamily: 'Nunito' },
  diagBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  diagBtn: { backgroundColor: 'rgba(124,58,237,0.5)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  diagBtnTxt: { color: '#FFF', fontSize: 10, fontFamily: 'Nunito', fontWeight: '700' },
});
