/**
 * PuzzleGestureLabScreen.js — LABORATÓRIO ISOLADO do motor (M1R4, Portão 1). SÓ Modo Criador.
 *
 * Prova seleção/arrasto/toque/erro/cancelamento/encaixe/retorno SEM imagem, SVG, catálogo,
 * moldura, persistência (apenas retângulos). Usa o `react-native-gesture-handler` (já instalado;
 * GestureHandlerRootView já está no App.js) com Gesture.Race(Pan, Tap) — resolve a AMBIGUIDADE
 * toque×arrasto que o PanResponder causava. Cada ALVO tem seu PRÓPRIO Gesture.Tap (não há onPress
 * global no fundo do tabuleiro). Coordenadas: absolutas da janela → root-local (measureInWindow),
 * conversão ÚNICA; overlay ocupa a raiz inteira (absoluteFillObject). Reducer puro = invariante.
 */

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, useWindowDimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { colors as pt, radii, shadows } from '../theme/productTheme';
import { playGameSfx, preloadGameSfx } from '../services/audioManager';
import { initialPuzzleState, puzzleReducer } from '../hooks/usePuzzleMachine';

const PIECE = 84;              // lado do retângulo-peça (px)
const MARGIN = 12;             // margem de clamp
const LIFT = 20;
const COLORS = ['#C4A8FF', '#F9C74F', '#90BE6D', '#7CC6E8'];
const IDS = ['p0', 'p1', 'p2', 'p3'];
const clamp = (v, lo, hi) => (v < lo ? lo : (v > hi ? hi : v));

export default function PuzzleGestureLabScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const [state, dispatch] = useReducer(puzzleReducer, undefined, () => initialPuzzleState(4));
  const stateRef = useRef(state); stateRef.current = state;

  const rootRef = useRef(null);
  const rootWin = useRef({ x: 0, y: 0 });
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [diag, setDiag] = useState({});

  useEffect(() => { try { preloadGameSfx(['match_success', 'match_error', 'board_complete']); } catch {} }, []);

  const measureRoot = useCallback(() => {
    if (rootRef.current?.measureInWindow) rootRef.current.measureInWindow((x, y) => { rootWin.current = { x: x || 0, y: y || 0 }; });
  }, []);

  // ── Geometria simples: 4 ALVOS (2×2) no topo; 4 POÇOS (linha) embaixo ── (root-local)
  const layout = useMemo(() => {
    const boardTop = insets.top + 70;
    const cell = Math.min((screenW - MARGIN * 2 - 16) / 2, 150);
    const boardLeft = (screenW - (cell * 2 + 16)) / 2;
    const targets = IDS.map((id, i) => ({
      id, x: boardLeft + (i % 2) * (cell + 16), y: boardTop + Math.floor(i / 2) * (cell + 16), w: cell, h: cell,
      cx: boardLeft + (i % 2) * (cell + 16) + cell / 2, cy: boardTop + Math.floor(i / 2) * (cell + 16) + cell / 2,
    }));
    const trayTop = boardTop + cell * 2 + 16 + 40;
    const gap = (screenW - MARGIN * 2 - PIECE * 4) / 5;
    const wells = IDS.map((id, i) => ({ id, x: MARGIN + gap + i * (PIECE + gap), y: trayTop, cx: MARGIN + gap + i * (PIECE + gap) + PIECE / 2, cy: trayTop + PIECE / 2 }));
    return { targets, wells, boardTop, cell, trayTop, rootW: screenW };
  }, [screenW, insets.top]);

  const wellOf = (id) => layout.wells.find((w) => w.id === id) || layout.wells[0];
  const targetOf = (id) => layout.targets.find((t) => t.id === id) || layout.targets[0];

  const playSound = useCallback((name) => { try { playGameSfx(name); } catch {} }, []);

  // ── COMMIT só após a animação de snap ──
  const finishSnap = useCallback(() => {
    dispatch({ type: 'SNAP_FINISHED' });
  }, []);
  const finishReturn = useCallback(() => { dispatch({ type: 'RETURN_FINISHED' }); }, []);

  // Anima o overlay até o alvo e então commita (SNAP_FINISHED).
  const animateToTargetAndCommit = useCallback((pieceId) => {
    const t = targetOf(pieceId);
    Animated.timing(pan, { toValue: { x: t.cx - PIECE / 2, y: t.cy - PIECE / 2 }, duration: 220, useNativeDriver: false })
      .start(({ finished }) => { if (finished) finishSnap(); });
  }, [pan, finishSnap]);

  const animateReturn = useCallback((pieceId) => {
    const w = wellOf(pieceId);
    Animated.timing(pan, { toValue: { x: w.cx - PIECE / 2, y: w.cy - PIECE / 2 }, duration: 240, useNativeDriver: false })
      .start(({ finished }) => { if (finished) finishReturn(); });
  }, [pan, finishReturn]);

  // Reage às transições que precisam de animação/áudio (fonte única: o reducer).
  const prevStatus = useRef(state.status);
  useEffect(() => {
    if (state.status === 'snapping' && prevStatus.current !== 'snapping' && state.activePieceId) {
      playSound('match_success'); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      animateToTargetAndCommit(state.activePieceId);
    }
    if (state.status === 'returning' && prevStatus.current !== 'returning' && state.activePieceId) {
      if (state.hitResult === 'wrong') { playSound('match_error'); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {} }
      animateReturn(state.activePieceId);
    }
    if (state.status === 'celebrating' && prevStatus.current !== 'celebrating') {
      playSound('board_complete'); try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    }
    prevStatus.current = state.status;
  }, [state.status, state.activePieceId, state.hitResult, playSound, animateToTargetAndCommit, animateReturn]);

  // Som de erro no TOQUE em alvo incorreto (o reducer marca lastSound=wrong_place).
  const lastSndRef = useRef({ cmd: null });
  useEffect(() => {
    if (state.lastCommand === 'TARGET_TAPPED_WRONG' && lastSndRef.current.cmd !== state.interactionId + '|' + state.lastCommand) {
      playSound('match_error'); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    }
    lastSndRef.current.cmd = state.interactionId + '|' + state.lastCommand;
  }, [state.lastCommand, state.interactionId, playSound]);

  // ── Hit test (root-local): centro da peça ativa sobre qual alvo? ──
  const hitTest = useCallback((cx, cy, pieceId) => {
    for (const t of layout.targets) {
      if (state.placedPieceIds.includes(t.id)) continue;
      if (cx >= t.x && cx <= t.x + t.w && cy >= t.y && cy <= t.y + t.h) return t.id === pieceId ? 'correct' : 'wrong';
    }
    return 'none';
  }, [layout.targets, state.placedPieceIds]);

  // ── Gestos por peça: Race(Pan, Tap) ──
  const makeGesture = useCallback((pieceId) => {
    const tap = Gesture.Tap().runOnJS(true).maxDistance(6).onEnd(() => { dispatch({ type: 'PIECE_TAPPED', pieceId }); });
    const panG = Gesture.Pan().runOnJS(true).minDistance(8)
      .onStart((e) => {
        dispatch({ type: 'PAN_STARTED', pieceId });
        const localX = e.absoluteX - rootWin.current.x; const localY = e.absoluteY - rootWin.current.y;
        pan.setValue({ x: clamp(localX - PIECE / 2, MARGIN, layout.rootW - MARGIN - PIECE), y: localY - PIECE - LIFT });
      })
      .onUpdate((e) => {
        const localX = e.absoluteX - rootWin.current.x; const localY = e.absoluteY - rootWin.current.y;
        const ax = clamp(localX - PIECE / 2, MARGIN, layout.rootW - MARGIN - PIECE);
        const ay = localY - PIECE - LIFT;
        pan.setValue({ x: ax, y: ay });
        setDiag({ absoluteX: Math.round(e.absoluteX), absoluteY: Math.round(e.absoluteY), rootWinX: Math.round(rootWin.current.x), rootWinY: Math.round(rootWin.current.y), localX: Math.round(localX), localY: Math.round(localY), activeX: Math.round(ax), activeY: Math.round(ay) });
      })
      .onEnd((e) => {
        const localX = e.absoluteX - rootWin.current.x; const localY = e.absoluteY - rootWin.current.y;
        const ax = clamp(localX - PIECE / 2, MARGIN, layout.rootW - MARGIN - PIECE);
        const ay = localY - PIECE - LIFT;
        const hit = hitTest(ax + PIECE / 2, ay + PIECE / 2, pieceId);
        dispatch({ type: 'PAN_ENDED', hit });
      });
    return Gesture.Race(panG, tap);
  }, [pan, layout.rootW, hitTest]);

  // Cada ALVO tem seu próprio toque (sem onPress global no fundo).
  const makeTargetGesture = useCallback((targetId) => Gesture.Tap().runOnJS(true).maxDistance(24).onEnd(() => {
    const s = stateRef.current;
    dispatch({ type: 'TARGET_TAPPED', targetId });
    // toque-correto: anima a partir do poço (nasce no poço, sem teleporte).
    if (s.selectedPieceId != null && s.selectedPieceId === targetId) {
      const w = wellOf(targetId); pan.setValue({ x: w.cx - PIECE / 2, y: w.cy - PIECE / 2 });
    }
  }), [pan]);

  const activeId = state.activePieceId;
  const isActive = (id) => activeId === id;

  // Ações do diagnóstico (seção 29)
  const act = {
    selectNoPlace: () => dispatch({ type: 'PIECE_TAPPED', pieceId: 'p0' }),
    simCorrect: () => { dispatch({ type: 'PIECE_TAPPED', pieceId: 'p0' }); dispatch({ type: 'TARGET_TAPPED', targetId: 'p0' }); },
    simWrong: () => { dispatch({ type: 'PIECE_TAPPED', pieceId: 'p0' }); dispatch({ type: 'TARGET_TAPPED', targetId: 'p1' }); },
    simEmpty: () => { dispatch({ type: 'PIECE_TAPPED', pieceId: 'p0' }); dispatch({ type: 'EMPTY_AREA_TAPPED' }); },
    left: () => { dispatch({ type: 'PAN_STARTED', pieceId: 'p0' }); Animated.timing(pan, { toValue: { x: MARGIN, y: layout.boardTop + 40 }, duration: 300, useNativeDriver: false }).start(); },
    right: () => { dispatch({ type: 'PAN_STARTED', pieceId: 'p0' }); Animated.timing(pan, { toValue: { x: layout.rootW - MARGIN - PIECE, y: layout.boardTop + 40 }, duration: 300, useNativeDriver: false }).start(); },
    testReturn: () => { dispatch({ type: 'PAN_STARTED', pieceId: 'p0' }); dispatch({ type: 'PAN_ENDED', hit: 'none' }); },
    complete: () => { let done = 0; IDS.forEach((id) => { dispatch({ type: 'PIECE_TAPPED', pieceId: id }); dispatch({ type: 'TARGET_TAPPED', targetId: id }); done++; }); },
    clear: () => dispatch({ type: 'RESET' }),
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} ref={rootRef} onLayout={measureRoot}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
          <Text style={styles.backTxt}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.title}>Laboratório de gestos</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* ALVOS (2×2) — cada um com seu próprio toque */}
      {layout.targets.map((t, i) => {
        const placed = state.placedPieceIds.includes(t.id);
        return (
          <GestureDetector key={t.id} gesture={makeTargetGesture(t.id)}>
            <View style={[styles.target, { left: t.x, top: t.y, width: t.w, height: t.h, borderColor: COLORS[i] }, placed && { backgroundColor: COLORS[i] }]}>
              {!placed && <Text style={[styles.targetLabel, { color: COLORS[i] }]}>{t.id}</Text>}
            </View>
          </GestureDetector>
        );
      })}

      {/* POÇOS + PEÇAS (peça invisível enquanto ativa) */}
      {layout.wells.map((w, i) => {
        const placed = state.placedPieceIds.includes(w.id);
        if (placed) return <View key={w.id} style={[styles.well, { left: w.x, top: w.y }]} />;
        const selected = state.selectedPieceId === w.id;
        return (
          <React.Fragment key={w.id}>
            <View style={[styles.well, { left: w.x, top: w.y }, selected && styles.wellSelected]} />
            <GestureDetector gesture={makeGesture(w.id)}>
              <Animated.View style={[styles.piece, { left: w.x, top: w.y, backgroundColor: COLORS[i], opacity: isActive(w.id) ? 0 : 1 }, selected && styles.pieceSelected]}>
                <Text style={styles.pieceLabel}>{w.id}</Text>
              </Animated.View>
            </GestureDetector>
          </React.Fragment>
        );
      })}

      {/* OVERLAY ATIVO (raiz inteira; peça acima do dedo) */}
      {activeId && (
        <Animated.View pointerEvents="none" style={[styles.overlayPiece, { backgroundColor: COLORS[IDS.indexOf(activeId)], transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}>
          <Text style={styles.pieceLabel}>{activeId}</Text>
        </Animated.View>
      )}

      {/* Orientação de seleção (fora do tabuleiro) */}
      {state.status === 'selected' && (
        <Text style={[styles.hint, { top: layout.trayTop - 34 }]}>Peça escolhida! Toque no lugar certo ou arraste até ele.</Text>
      )}

      {/* DIAGNÓSTICO */}
      <View style={[styles.diag, { bottom: insets.bottom + 8 }]}>
        <Text style={styles.diagLine}>state {state.status} · sel {String(state.selectedPieceId)} · active {String(state.activePieceId)} · placed [{state.placedPieceIds.join(',')}]</Text>
        <Text style={styles.diagLine}>iid {state.interactionId} · cmd {state.lastCommand} · sound {String(state.lastSound)} · hit {String(state.hitResult)}</Text>
        <Text style={styles.diagLine}>abs {diag.absoluteX},{diag.absoluteY} · rootWin {diag.rootWinX},{diag.rootWinY} · local {diag.localX},{diag.localY} · active {diag.activeX},{diag.activeY}</Text>
        <Text style={styles.diagLine}>screenW {layout.rootW} · pieceW {PIECE}</Text>
        <View style={styles.acts}>
          {[['sel', act.selectNoPlace], ['✓alvo', act.simCorrect], ['✗alvo', act.simWrong], ['vazio', act.simEmpty], ['←', act.left], ['→', act.right], ['retorno', act.testReturn], ['concluir', act.complete], ['limpar', act.clear]].map(([lbl, fn]) => (
            <Pressable key={lbl} style={styles.actBtn} onPress={fn}><Text style={styles.actTxt}>{lbl}</Text></Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 44 },
  back: { backgroundColor: 'rgba(124,58,237,0.10)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  backTxt: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  title: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text },

  target: { position: 'absolute', borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.02)' },
  targetLabel: { fontFamily: 'FredokaOne', fontSize: 16, opacity: 0.5 },
  well: { position: 'absolute', width: PIECE, height: PIECE, borderRadius: 14, backgroundColor: 'rgba(91,33,182,0.06)' },
  wellSelected: { backgroundColor: 'rgba(249,199,79,0.28)' },
  piece: { position: 'absolute', width: PIECE, height: PIECE, borderRadius: 14, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  pieceSelected: { borderWidth: 3, borderColor: pt.goldDeep, transform: [{ scale: 1.08 }, { translateY: -6 }], ...shadows.card },
  overlayPiece: { position: 'absolute', left: 0, top: 0, width: PIECE, height: PIECE, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 50, borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 14 },
  pieceLabel: { fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF' },

  hint: { position: 'absolute', left: 16, right: 16, textAlign: 'center', fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.purpleDeep },

  diag: { position: 'absolute', left: 8, right: 8, backgroundColor: 'rgba(15,18,32,0.92)', borderRadius: 10, padding: 8 },
  diagLine: { color: '#CFE', fontSize: 10, fontFamily: 'Nunito' },
  acts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  actBtn: { backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  actTxt: { color: '#fff', fontSize: 10, fontFamily: 'Nunito', fontWeight: '700' },
});
