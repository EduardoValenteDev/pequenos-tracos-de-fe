/**
 * MonteACenaGameScreen.js — RODADA JOGÁVEL (M1R2.1, interno/dev-gated) de "Monte a Cena".
 *
 * ESTABILIZAÇÃO FUNCIONAL do NÍVEL 1 (4 peças). Corrige as causas-raiz do M1R2:
 *  (1) CONGELAMENTO: a peça deixava de existir ao arrastar (`return null`) → o PanResponder era
 *      desmontado no meio do gesto e o `gestureActiveRef` ficava preso. AQUI a view do responder
 *      NUNCA desmonta durante o gesto (fica montada com opacity 0) e o arrasto é espelhado numa
 *      CAMADA ATIVA absoluta (pointerEvents none).
 *  (2) LAYOUT MÓVEL: o tabuleiro mudava de tamanho/posição quando o Beni recolhia. AQUI o layout é
 *      FIXO (não depende de `beniOpen`); a faixa do Beni tem ALTURA FIXA e nunca altera `boardY`.
 *  (3) ESCALA DUPLA: o Svg já nascia em tamanho de tabuleiro e ainda recebia `transform scale`.
 *      AQUI a peça ativa recebe EXATAMENTE activeWidth/activeHeight e o Svg preenche a caixa
 *      (scale = 1.0, sem transform de escala).
 *  (4) COORDENADAS: um único sistema (root-local, medido via measureInWindow) para toque, bandeja,
 *      tabuleiro, alvo, snap e retorno.
 *  (5) BANDEJA: mesa única inferior (2×2) com ordem EMBARALHADA (desarranjo por seed).
 *
 * GESTO: `react-native-reanimated` ausente → `PanResponder` + `Animated.ValueXY` (JS thread, sem
 * setState por frame). Fluidez a validar no aparelho.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, PanResponder,
  AppState, AccessibilityInfo, useWindowDimensions, Easing,
} from 'react-native';
import Svg, { Path, ClipPath, Defs, Image as SvgImage } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { colors as pt, radii, shadows } from '../theme/productTheme';
import FaithIcon from '../components/ui/FaithIcon';
import BeniAvatar from '../components/beni/BeniAvatar';
import { isInternalToolsEnabled } from '../config/internalTools';
import { playGameSfx } from '../services/audioManager';
import { getLevelById, getLevelSource, buildLevelGeometry, getNextLevel, isLevelPlayable, shuffledTrayOrder } from '../data/monteACenaLevels';
import { markLevelCompleted } from '../services/monteACenaSession';
import { snapToleranceFor } from '../services/monteACenaGeometry';

const HEADER_H = 48;
const BENI_BAND_H = 54;        // ALTURA FIXA — recolher o Beni NÃO muda isto nem o boardY
const GAP = 10;
const MESA_HEADER_H = 24;
const WELL_GAP = 14;
const MESA_PAD = 14;
const BOARD_SIDE_MARGIN = 40;  // margens maiores → tabuleiro moderadamente reduzido
const MOVE_THRESHOLD = 6;      // < ⇒ toque (seleção); ≥ ⇒ arrasto
const INACTIVITY_MS = 6000;

function nowMs() {
  return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
}

/** Sprite de UMA peça (mesma imagem recortada; viewBox = overscan em px da arte; Svg preenche a caixa). */
function PieceSprite({ source, piece, artW, artH, boardW, boardH, scale, outline, tray }) {
  const ob = piece.overscanBounds;
  const w = Math.max(1, ob.w * boardW * scale);
  const h = Math.max(1, ob.h * boardH * scale);
  const viewBox = `${ob.x * artW} ${ob.y * artH} ${ob.w * artW} ${ob.h * artH}`;
  const clipId = `mac-${piece.id}`;
  return (
    <Svg width={w} height={h} viewBox={viewBox} pointerEvents="none">
      <Defs><ClipPath id={clipId}><Path d={piece.path} /></ClipPath></Defs>
      <SvgImage href={source} x={0} y={0} width={artW} height={artH} preserveAspectRatio="xMidYMid meet" clipPath={`url(#${clipId})`} />
      {outline && tray ? <Path d={piece.path} fill="none" stroke="#FFF8EC" strokeWidth={5} opacity={0.95} /> : null}
      {outline && tray ? <Path d={piece.path} fill="none" stroke="#C9B8F2" strokeWidth={2} opacity={0.7} /> : null}
      {outline && !tray ? <Path d={piece.path} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.95} /> : null}
    </Svg>
  );
}

export default function MonteACenaGameScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const levelId = route?.params?.levelId || 'nivel_1';
  const level = getLevelById(levelId) || getLevelById('nivel_1');
  const playable = isLevelPlayable(level);
  const source = getLevelSource(level);
  const artW = level.artWidth;
  const artH = level.artHeight;
  const ratio = artH / artW;

  const geometry = useMemo(() => buildLevelGeometry(level), [level]);
  const pieceById = useMemo(() => {
    const m = {}; geometry.pieces.forEach((p) => { m[p.id] = p; }); return m;
  }, [geometry]);
  // Ordem EMBARALHADA (desarranjo): nenhuma peça no índice do próprio alvo.
  const trayOrder = useMemo(() => shuffledTrayOrder(geometry.pieces, level.seed), [geometry, level.seed]);

  const [placed, setPlaced] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeId, setActiveId] = useState(null);      // peça na camada absoluta (setState só ao iniciar/terminar o arrasto)
  const [beniExpanded, setBeniExpanded] = useState(true);
  const [beniMsg, setBeniMsg] = useState('Vamos completar esta cena?');
  const [refOpen, setRefOpen] = useState(false);
  const [helpPulseId, setHelpPulseId] = useState(null);
  const [glowTargetId, setGlowTargetId] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [devDrawer, setDevDrawer] = useState(false);    // diagnóstico interno (fechado por padrão)
  const [diag, setDiag] = useState(null);

  const done = placed.length === level.pieceCount;
  const trayCols = 2;                                    // NÍVEL 1: mesa 2×2

  // ── LAYOUT FIXO (não depende de beniExpanded) ──
  const layout = useMemo(() => {
    const topInset = insets.top;
    const bottomInset = insets.bottom;
    // Mesa (2×2) ancorada ao rodapé. wellSize LIMITADO p/ não dominar a tela (poços confortáveis).
    const wellSize = Math.max(60, Math.min(84, Math.floor((Math.min(screenW - 40, 340) - MESA_PAD * 2 - WELL_GAP) / 2)));
    const mesaW = wellSize * 2 + WELL_GAP + MESA_PAD * 2;
    const mesaH = MESA_HEADER_H + wellSize * 2 + WELL_GAP + MESA_PAD * 2;
    const mesaLeft = (screenW - mesaW) / 2;
    const mesaTop = screenH - bottomInset - mesaH - 8;
    // Faixa Beni (fixa) e tabuleiro (entre a faixa e a mesa).
    const beniTop = topInset + HEADER_H + GAP;
    const boardTop = beniTop + BENI_BAND_H + GAP;
    const availH = mesaTop - GAP - boardTop;
    let boardW = Math.min(screenW - BOARD_SIDE_MARGIN * 2, availH / ratio);
    boardW = Math.max(200, boardW);
    const boardH = boardW * ratio;
    const boardLeft = (screenW - boardW) / 2;
    return { topInset, beniTop, boardTop, boardLeft, boardW, boardH, wellSize, mesaLeft, mesaTop, mesaW, mesaH };
  }, [screenW, screenH, insets.top, insets.bottom, ratio]);

  const { beniTop, boardTop, boardLeft, boardW, boardH, wellSize, mesaLeft, mesaTop, mesaW, mesaH } = layout;

  // Escala ÚNICA da bandeja (referência = MAIOR visualBounds do nível; proporção preservada).
  const trayScale = useMemo(() => {
    const inner = wellSize - 12;
    let maxW = 0; let maxH = 0;
    for (const p of geometry.pieces) {
      maxW = Math.max(maxW, p.visualBounds.w * boardW);
      maxH = Math.max(maxH, p.visualBounds.h * boardH);
    }
    return Math.max(0.16, Math.min(0.6, Math.min(inner / maxW, inner / maxH)));
  }, [geometry, boardW, boardH, wellSize]);

  // Poço (well) de um índice da mesa 2×2 (root-local).
  const wellRect = useCallback((idx) => {
    const col = idx % trayCols; const row = Math.floor(idx / trayCols);
    const left = mesaLeft + MESA_PAD + col * (wellSize + WELL_GAP);
    const top = mesaTop + MESA_HEADER_H + MESA_PAD + row * (wellSize + WELL_GAP);
    return { left, top, size: wellSize, cx: left + wellSize / 2, cy: top + wellSize / 2 };
  }, [mesaLeft, mesaTop, wellSize]);

  // Slot (índice na mesa) FIXO por peça — o poço permanece vazio quando a peça sai (não “fecha” buracos).
  const wellIndexOf = (id) => trayOrder.indexOf(id);

  // ── Refs de gesto ──
  const rootRef = useRef(null);
  const rootWin = useRef({ x: 0, y: 0 });
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dragBase = useRef({ x: 0, y: 0 });
  const grabRef = useRef({ x: 0, y: 0 });
  const gsRef = useRef('idle');           // idle|pressed|selected|dragging|returning|snapping|placed
  const activeRef = useRef(null);         // id da peça ativa (síncrono)
  const draggingRef = useRef(false);
  const resolvingRef = useRef(false);
  const mountedRef = useRef(true);
  const boardAtStart = useRef(null);
  const dropStartRef = useRef(0);
  const wrongRef = useRef({});
  const inactivityRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    mountedRef.current = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => { if (mountedRef.current) setReduceMotion(!!v); }).catch(() => {});
    return () => { mountedRef.current = false; };
  }, []);

  const measureRoot = useCallback(() => {
    if (rootRef.current && rootRef.current.measureInWindow) {
      rootRef.current.measureInWindow((x, y) => { rootWin.current = { x: x || 0, y: y || 0 }; });
    }
  }, []);

  // ── Ajuda por inatividade ──
  const clearInactivity = useCallback(() => { if (inactivityRef.current) { clearTimeout(inactivityRef.current); inactivityRef.current = null; } }, []);
  const armInactivity = useCallback(() => {
    clearInactivity();
    if (done) return;
    inactivityRef.current = setTimeout(() => {
      if (!mountedRef.current || done) return;
      const first = geometry.pieces.find((p) => !placed.includes(p.id));
      if (first) { setHelpPulseId(first.id); setBeniMsg('Experimente esta pecinha primeiro.'); setBeniExpanded(true); }
    }, INACTIVITY_MS);
  }, [clearInactivity, done, geometry, placed]);
  const noteInteraction = useCallback(() => { setHelpPulseId(null); armInactivity(); }, [armInactivity]);
  useEffect(() => { armInactivity(); return clearInactivity; }, [armInactivity, clearInactivity]);

  useEffect(() => {
    const active = helpPulseId || glowTargetId;
    if (!active || reduceMotion) { pulseAnim.setValue(0); return undefined; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 620, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 620, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [helpPulseId, glowTargetId, reduceMotion, pulseAnim]);

  // ── Cancelamento (blur / AppState) — peça não fica flutuando ──
  const cancelGesture = useCallback(() => {
    gsRef.current = 'idle'; activeRef.current = null; draggingRef.current = false; resolvingRef.current = false;
    pan.stopAnimation(() => {}); pan.setValue({ x: 0, y: 0 });
    setActiveId(null);
  }, [pan]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s !== 'active') cancelGesture(); });
    const offBlur = navigation.addListener('blur', () => { cancelGesture(); clearInactivity(); });
    const offFocus = navigation.addListener('focus', () => { measureRoot(); armInactivity(); });
    return () => { sub?.remove?.(); offBlur?.(); offFocus?.(); };
  }, [navigation, cancelGesture, clearInactivity, armInactivity, measureRoot]);

  const boardRectSnapshot = useCallback(() => ({ x: boardLeft, y: boardTop, w: boardW, h: boardH }), [boardLeft, boardTop, boardW, boardH]);

  // ── Colocar peça (fonte única; 1×) ──
  const lockPiece = useCallback((piece) => {
    if (!mountedRef.current) return;
    playGameSfx('match_success');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setPlaced((prev) => (prev.includes(piece.id) ? prev : [...prev, piece.id]));
    setSelectedId(null); setActiveId(null); setGlowTargetId(null); setHelpPulseId(null);
    activeRef.current = null; draggingRef.current = false; gsRef.current = 'placed';
    pan.setValue({ x: 0, y: 0 });
    wrongRef.current[piece.id] = 0;
  }, [pan]);

  const snapToTargetAndLock = useCallback((piece) => {
    gsRef.current = 'snapping';
    const ob = piece.overscanBounds;
    const targetLeft = boardLeft + ob.x * boardW;
    const targetTop = boardTop + ob.y * boardH;
    const toX = targetLeft - dragBase.current.x;
    const toY = targetTop - dragBase.current.y;
    setDiag((d) => ({ ...(d || {}), lastSnapMs: Math.round(nowMs() - dropStartRef.current) }));
    if (reduceMotion) { pan.setValue({ x: toX, y: toY }); lockPiece(piece); return; }
    Animated.timing(pan, { toValue: { x: toX, y: toY }, duration: 150, useNativeDriver: false })
      .start(({ finished }) => { if (finished) lockPiece(piece); });
  }, [boardLeft, boardTop, boardW, boardH, reduceMotion, pan, lockPiece]);

  const returnToWell = useCallback((piece) => {
    gsRef.current = 'returning';
    const finish = () => { setActiveId(null); activeRef.current = null; draggingRef.current = false; gsRef.current = 'idle'; pan.setValue({ x: 0, y: 0 }); };
    // volta para a origem exata do gesto (dragBase = ponto onde a peça foi levantada)
    if (reduceMotion) { finish(); return; }
    Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 7, tension: 60 })
      .start(({ finished }) => { if (finished) finish(); });
    void piece;
  }, [reduceMotion, pan]);

  const registerWrong = useCallback((piece) => {
    const n = (wrongRef.current[piece.id] || 0) + 1; wrongRef.current[piece.id] = n;
    if (n >= 2) {
      setGlowTargetId(piece.id); setBeniMsg('Quase! Veja onde essa parte aparece.'); setBeniExpanded(true);
      setTimeout(() => { if (mountedRef.current) setGlowTargetId((g) => (g === piece.id ? null : g)); }, 1600);
    }
  }, []);

  const snapDistancePx = useCallback((piece, spriteLeft, spriteTop) => {
    const ob = piece.overscanBounds;
    const curX = spriteLeft + (piece.snapPoint[0] - ob.x) * boardW;
    const curY = spriteTop + (piece.snapPoint[1] - ob.y) * boardH;
    const tgtX = boardLeft + piece.snapPoint[0] * boardW;
    const tgtY = boardTop + piece.snapPoint[1] * boardH;
    return { dist: Math.hypot(curX - tgtX, curY - tgtY), curX, curY, tgtX, tgtY };
  }, [boardW, boardH, boardLeft, boardTop]);
  const tolPxFor = useCallback((piece) => snapToleranceFor(piece, level.snapFactor) * boardW, [level]);

  // ── PanResponder por peça (montada durante todo o gesto; toque vs arrasto decidido pelo limite) ──
  const makeResponder = useCallback((piece) => PanResponder.create({
    onStartShouldSetPanResponder: () => activeRef.current === null && !done,
    onMoveShouldSetPanResponder: (_e, g) => activeRef.current === null && !done && (Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3),
    onPanResponderGrant: (evt) => {
      gsRef.current = 'pressed'; draggingRef.current = false; resolvingRef.current = false;
      noteInteraction();
      boardAtStart.current = boardRectSnapshot();
      // grab no ponto tocado (converter do sprite pequeno da bandeja p/ a peça em tamanho de tabuleiro)
      grabRef.current = { x: (evt.nativeEvent.locationX || 0) / trayScale, y: (evt.nativeEvent.locationY || 0) / trayScale };
    },
    onPanResponderMove: (_e, g) => {
      if (!draggingRef.current) {
        if (Math.abs(g.dx) < MOVE_THRESHOLD && Math.abs(g.dy) < MOVE_THRESHOLD) return;
        // entra em ARRASTO: cria a peça ativa (setState 1×), ancora no dedo (sem salto)
        draggingRef.current = true; gsRef.current = 'dragging'; activeRef.current = piece.id;
        const localX = (g.x0 - rootWin.current.x); const localY = (g.y0 - rootWin.current.y);
        dragBase.current = { x: localX - grabRef.current.x, y: localY - grabRef.current.y };
        pan.setValue({ x: g.dx, y: g.dy });
        setActiveId(piece.id);
        setSelectedId(null);
      } else {
        pan.x.setValue(g.dx); pan.y.setValue(g.dy);
        const sl = dragBase.current.x + g.dx; const st = dragBase.current.y + g.dy;
        const { dist } = snapDistancePx(piece, sl, st);
        const near = dist <= tolPxFor(piece) * 1.8;
        setGlowTargetId((cur) => (near ? piece.id : (cur === piece.id ? null : cur)));
      }
    },
    onPanResponderRelease: (_e, g) => {
      if (!draggingRef.current) {
        // TOQUE (seleção) — NÃO cria camada absoluta, NÃO cresce a peça
        gsRef.current = 'idle';
        setSelectedId((cur) => (cur === piece.id ? null : piece.id));
        return;
      }
      if (resolvingRef.current) return;
      resolvingRef.current = true;
      dropStartRef.current = nowMs();
      const sl = dragBase.current.x + g.dx; const st = dragBase.current.y + g.dy;
      const info = snapDistancePx(piece, sl, st);
      const tol = tolPxFor(piece);
      if (isInternalToolsEnabled()) {
        const b = boardRectSnapshot(); const b0 = boardAtStart.current || b;
        setDiag((d) => ({ ...(d || {}), dist: Math.round(info.dist), tol: Math.round(tol),
          cur: [Math.round(info.curX), Math.round(info.curY)], tgt: [Math.round(info.tgtX), Math.round(info.tgtY)],
          active: [Math.round(sl), Math.round(st)], board: [Math.round(b.x), Math.round(b.y), Math.round(b.w), Math.round(b.h)],
          boardMoved: Math.round(Math.abs(b.x - b0.x) + Math.abs(b.y - b0.y) + Math.abs(b.w - b0.w) + Math.abs(b.h - b0.h)) }));
      }
      resolvingRef.current = false;
      if (info.dist <= tol) snapToTargetAndLock(piece);
      else { registerWrong(piece); returnToWell(piece); }
    },
    onPanResponderTerminate: () => cancelGesture(),
  }), [done, trayScale, noteInteraction, boardRectSnapshot, pan, snapDistancePx, tolPxFor, snapToTargetAndLock, registerWrong, returnToWell, cancelGesture]);

  // ── Tap-to-place: peça selecionada + toque no tabuleiro perto do alvo ──
  const onBoardPress = useCallback((evt) => {
    if (!selectedId || done || activeRef.current) return;
    const piece = pieceById[selectedId];
    const lx = (evt.nativeEvent.locationX || 0) / boardW;   // 0..1 na arte
    const ly = (evt.nativeEvent.locationY || 0) / boardH;
    const dx = (lx - piece.snapPoint[0]) * boardW; const dy = (ly - piece.snapPoint[1]) * boardH;
    const near = Math.hypot(dx, dy) <= tolPxFor(piece) * 2.2;
    noteInteraction();
    if (!near) { setBeniMsg('Toque bem em cima do lugar dela.'); setBeniExpanded(true); return; }
    // coloca: base = poço da peça (para a animação curta); anima até o alvo
    const wi = wellIndexOf(selectedId); const wr = wellRect(wi < 0 ? 0 : wi);
    dragBase.current = { x: wr.cx - (piece.overscanBounds.w * boardW) / 2, y: wr.cy - (piece.overscanBounds.h * boardH) / 2 };
    dropStartRef.current = nowMs(); activeRef.current = selectedId; draggingRef.current = true;
    pan.setValue({ x: 0, y: 0 }); setActiveId(selectedId);
    snapToTargetAndLock(piece);
  }, [selectedId, done, pieceById, boardW, boardH, tolPxFor, noteInteraction, wellIndexOf, wellRect, pan, snapToTargetAndLock]);

  // ── Beni auto-recolhe (só o conteúdo da faixa; NÃO muda a altura da faixa nem boardY) ──
  useEffect(() => {
    const t = setTimeout(() => { if (mountedRef.current && placed.length === 0) setBeniExpanded(false); }, 4500);
    return () => clearTimeout(t);
  }, [placed.length]);
  useEffect(() => { if (placed.length > 0 && !done) setBeniExpanded(false); }, [placed.length, done]);

  // ── Conclusão ──
  const doneFiredRef = useRef(false);
  useEffect(() => {
    if (done && !doneFiredRef.current) {
      doneFiredRef.current = true; clearInactivity();
      playGameSfx('board_complete'); markLevelCompleted(level.id);
      setBeniExpanded(true); setBeniMsg('Conseguimos! A cena ficou completa!');
    }
    if (!done) doneFiredRef.current = false;
  }, [done, level.id, clearInactivity]);

  const resetLevel = useCallback(() => {
    cancelGesture();
    setPlaced([]); setSelectedId(null); setGlowTargetId(null); setHelpPulseId(null);
    wrongRef.current = {}; setBeniExpanded(true); setBeniMsg('Vamos completar esta cena?');
    doneFiredRef.current = false; armInactivity();
  }, [cancelGesture, armInactivity]);

  const nextLevel = getNextLevel(level.id);
  const nextPlayable = nextLevel && isLevelPlayable(nextLevel);
  const goNext = useCallback(() => { if (nextPlayable) navigation.replace('MonteACenaGame', { levelId: nextLevel.id }); else navigation.goBack(); }, [navigation, nextPlayable, nextLevel]);

  const activePiece = activeId ? pieceById[activeId] : null;
  const progressText = `${placed.length} de ${level.pieceCount}`;
  const noSource = !source;

  // Guard: no M1R2.1 só o nível 1 (available) abre a rodada.
  if (!playable) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={[styles.header, { height: HEADER_H }]}>
          <Pressable style={styles.backPill} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
            <Text style={styles.backText}>‹ Voltar</Text>
          </Pressable>
          <Text style={styles.title}>Monte a Cena</Text>
          <View style={{ width: 72 }} />
        </View>
        <View style={styles.tuningBox}>
          <BeniAvatar variant="happy" size="medium" />
          <Text style={styles.tuningText}>Este desafio ainda está sendo ajustado. Volte em breve!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root} ref={rootRef} onLayout={measureRoot}>
      {/* ── CABEÇALHO ── */}
      <View style={[styles.header, { marginTop: insets.top, height: HEADER_H }]}>
        <Pressable style={styles.backPill} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>Monte a Cena</Text>
        <View style={styles.headerRight}>
          <View style={styles.progressPill}><Text style={styles.progressText}>{progressText}</Text></View>
          <Pressable style={styles.eyeBtn} onPress={() => setRefOpen(true)} accessibilityRole="button" accessibilityLabel="Ver a cena completa" hitSlop={8}>
            <FaithIcon name="eye" size={20} color={pt.purpleDeep} />
          </Pressable>
        </View>
      </View>

      {/* ── FAIXA BENI (ALTURA FIXA — nunca entra no tabuleiro) ── */}
      <Pressable
        style={[styles.beniBand, { top: beniTop, height: BENI_BAND_H }]}
        onPress={() => setBeniExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={`Beni diz: ${beniMsg}`}
      >
        <BeniAvatar variant={done ? 'celebrating' : 'happy'} size="small" />
        {beniExpanded ? <Text style={styles.beniText} numberOfLines={2}>{beniMsg}</Text> : <Text style={styles.beniTextCollapsed}>Toque para ver a dica</Text>}
      </Pressable>

      {/* ── TABULEIRO (posição/tamanho FIXOS) ── */}
      <View style={[styles.board, { left: boardLeft, top: boardTop, width: boardW, height: boardH }]}>
        {noSource ? (
          <View style={styles.boardFallback}><Text style={styles.boardFallbackText}>cena indisponível</Text></View>
        ) : (
          <Svg width={boardW} height={boardH} viewBox={`0 0 ${artW} ${artH}`}>
            <SvgImage href={source} x={0} y={0} width={artW} height={artH} preserveAspectRatio="xMidYMid meet" opacity={done ? 1 : level.guideOpacity} />
            {!done && geometry.pieces.filter((p) => !placed.includes(p.id)).map((p) => (
              <Path key={`slot-${p.id}`} d={p.path} fill="none"
                stroke={glowTargetId === p.id ? pt.goldDeep : pt.purpleDeep}
                strokeWidth={glowTargetId === p.id ? 4 : 2.5}
                opacity={glowTargetId === p.id ? 0.85 : 0.16} strokeLinejoin="round" />
            ))}
          </Svg>
        )}
        {!noSource && placed.map((id) => {
          const p = pieceById[id]; const ob = p.overscanBounds;
          return (
            <View key={`plv-${id}`} pointerEvents="none" style={{ position: 'absolute', left: ob.x * boardW, top: ob.y * boardH }}>
              <PieceSprite source={source} piece={p} artW={artW} artH={artH} boardW={boardW} boardH={boardH} scale={1.0} outline={false} />
            </View>
          );
        })}
        {selectedId && !done && !activeId && (
          <Pressable style={StyleSheet.absoluteFill} onPress={onBoardPress} accessibilityRole="button"
            accessibilityLabel="Colocar a peça selecionada" accessibilityHint="Toque no lugar da peça no desenho para encaixar" />
        )}
      </View>

      {/* ── MESA DE PEÇAS (cartão único inferior, 2×2) ── */}
      {!done && !noSource && (
        <View style={[styles.mesa, { left: mesaLeft, top: mesaTop, width: mesaW, height: mesaH }]}>
          <Text style={styles.mesaHeader}>Escolha uma peça</Text>
          {/* poços discretos */}
          {[0, 1, 2, 3].map((i) => {
            const wr = wellRect(i);
            return <View key={`well-${i}`} pointerEvents="none" style={[styles.well, { left: wr.left - mesaLeft, top: wr.top - mesaTop, width: wellSize, height: wellSize }]} />;
          })}
        </View>
      )}

      {/* ── PEÇAS DA BANDEJA (posição FIXA por peça; responder montado durante todo o gesto) ── */}
      {!done && !noSource && geometry.pieces.filter((p) => !placed.includes(p.id)).map((p) => {
        const wi = wellIndexOf(p.id); const wr = wellRect(wi);
        const spriteW = p.overscanBounds.w * boardW * trayScale;
        const spriteH = p.overscanBounds.h * boardH * trayScale;
        const isActive = activeId === p.id;
        const selected = selectedId === p.id;
        const pulsing = helpPulseId === p.id;
        return (
          <Animated.View
            key={`tray-${p.id}`}
            {...makeResponder(p).panHandlers}
            style={[
              styles.trayPiece,
              { left: wr.cx - spriteW / 2, top: wr.cy - spriteH / 2, width: spriteW, height: spriteH, opacity: isActive ? 0 : 1 },
              selected && styles.selectedRing,
              pulsing && !reduceMotion ? { transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }] } : null,
            ]}
          >
            <PieceSprite source={source} piece={p} artW={artW} artH={artH} boardW={boardW} boardH={boardH} scale={trayScale} outline tray />
          </Animated.View>
        );
      })}

      {/* ── CAMADA ATIVA (peça arrastada; tamanho EXATO do tabuleiro; sem transform scale) ── */}
      {activePiece && !noSource && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute', left: dragBase.current.x, top: dragBase.current.y, zIndex: 50,
            width: activePiece.overscanBounds.w * boardW, height: activePiece.overscanBounds.h * boardH,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
            shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 14,
          }}
        >
          <PieceSprite source={source} piece={activePiece} artW={artW} artH={artH} boardW={boardW} boardH={boardH} scale={1.0} outline />
        </Animated.View>
      )}

      {/* ── CONCLUSÃO ── */}
      {done && (
        <View style={[styles.donePanel, { bottom: insets.bottom + 20 }]}>
          <Text style={styles.doneTitle}>Conseguimos! A cena ficou completa!</Text>
          <View style={styles.doneBtns}>
            <Pressable style={[styles.doneBtn, styles.doneBtnPrimary]} onPress={goNext} accessibilityRole="button" accessibilityLabel={nextPlayable ? 'Próximo nível' : 'Voltar aos níveis'}>
              <Text style={styles.doneBtnTextPrimary}>{nextPlayable ? 'Próximo nível' : 'Voltar aos níveis'}</Text>
            </Pressable>
            <Pressable style={styles.doneBtn} onPress={resetLevel} accessibilityRole="button" accessibilityLabel="Jogar novamente">
              <Text style={styles.doneBtnText}>Jogar novamente</Text>
            </Pressable>
            <Pressable style={styles.doneBtn} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Escolher nível">
              <Text style={styles.doneBtnText}>Escolher nível</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── DIAGNÓSTICO INTERNO (fechado por padrão; só sob Modo Criador) ── */}
      {isInternalToolsEnabled() && (
        <Pressable style={[styles.devDot, { top: insets.top + 6 }]} onPress={() => setDevDrawer((v) => !v)} accessibilityLabel="Diagnóstico interno">
          <Text style={styles.devDotText}>•</Text>
        </Pressable>
      )}
      {isInternalToolsEnabled() && devDrawer && diag && (
        <View style={[styles.devDrawer, { top: insets.top + 30 }]} pointerEvents="none">
          <Text style={styles.devLine}>dist {diag.dist} / tol {diag.tol}</Text>
          <Text style={styles.devLine}>cur {diag.cur && diag.cur.join(',')}  tgt {diag.tgt && diag.tgt.join(',')}</Text>
          <Text style={styles.devLine}>active {diag.active && diag.active.join(',')}</Text>
          <Text style={styles.devLine}>board {diag.board && diag.board.join(',')}</Text>
          <Text style={styles.devLine}>boardMoved {diag.boardMoved}  snap {diag.lastSnapMs}ms</Text>
        </View>
      )}

      {/* ── REFERÊNCIA (um toque; backdrop claro) ── */}
      {refOpen && !noSource && (
        <Pressable style={styles.refBackdrop} onPress={() => setRefOpen(false)} accessibilityRole="button" accessibilityLabel="Voltar ao jogo">
          <View style={styles.refCard}>
            <Text style={styles.refTitle}>Veja a cena</Text>
            <Svg width={Math.min(screenW - 80, 300)} height={Math.min(screenW - 80, 300) * ratio}>
              <SvgImage href={source} x={0} y={0} width={Math.min(screenW - 80, 300)} height={Math.min(screenW - 80, 300) * ratio} preserveAspectRatio="xMidYMid meet" />
            </Svg>
            <Pressable style={styles.refClose} onPress={() => setRefOpen(false)} accessibilityRole="button" accessibilityLabel="Voltar ao jogo">
              <Text style={styles.refCloseText}>Voltar ao jogo</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  backPill: { backgroundColor: 'rgba(124,58,237,0.10)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  backText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  title: { flex: 1, textAlign: 'center', fontFamily: 'FredokaOne', fontSize: 18, color: pt.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressPill: { backgroundColor: pt.goldSoft, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 5 },
  progressText: { fontFamily: 'FredokaOne', fontSize: 12, color: pt.goldDeep },
  eyeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: pt.cream, alignItems: 'center', justifyContent: 'center', ...shadows.soft },

  beniBand: {
    position: 'absolute', left: 16, right: 16, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12,
    backgroundColor: pt.cream, borderRadius: radii.lg, ...shadows.soft,
  },
  beniText: { flex: 1, fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.text, lineHeight: 18 },
  beniTextCollapsed: { flex: 1, fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: pt.textSoft },

  board: {
    position: 'absolute', backgroundColor: '#FFFFFF', borderRadius: radii.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: pt.creamStrong, ...shadows.card,
  },
  boardFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  boardFallbackText: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft },

  mesa: {
    position: 'absolute', backgroundColor: pt.goldSoft,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomLeftRadius: radii.lg, borderBottomRightRadius: radii.lg,
    borderWidth: 1, borderColor: pt.creamStrong, ...shadows.card,
  },
  mesaHeader: { textAlign: 'center', fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#8A6D1E', paddingTop: 6, height: MESA_HEADER_H },
  well: { position: 'absolute', borderRadius: 16, backgroundColor: 'rgba(224,162,26,0.10)' },

  trayPiece: { position: 'absolute', zIndex: 5, alignItems: 'center', justifyContent: 'center' },
  selectedRing: { borderWidth: 2, borderColor: pt.goldDeep, borderRadius: 12, backgroundColor: 'rgba(249,199,79,0.14)' },

  tuningBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 },
  tuningText: { fontFamily: 'Nunito', fontSize: 15, fontWeight: '700', color: pt.textSoft, textAlign: 'center' },

  donePanel: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  doneTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.greenDeep, textAlign: 'center', marginBottom: 12 },
  doneBtns: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  doneBtn: { backgroundColor: pt.cream, borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 11, ...shadows.soft },
  doneBtnPrimary: { backgroundColor: pt.purple },
  doneBtnText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  doneBtnTextPrimary: { fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF' },

  devDot: { position: 'absolute', right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(124,58,237,0.12)', alignItems: 'center', justifyContent: 'center', zIndex: 90 },
  devDotText: { color: pt.purpleDeep, fontSize: 18, lineHeight: 20 },
  devDrawer: { position: 'absolute', right: 6, backgroundColor: 'rgba(15,18,32,0.9)', borderRadius: 10, padding: 8, zIndex: 90 },
  devLine: { color: '#CFE', fontSize: 10, fontFamily: 'Nunito' },

  refBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(90,72,60,0.32)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 60 },
  refCard: { backgroundColor: pt.background, borderRadius: radii.lg, padding: 16, alignItems: 'center', ...shadows.card },
  refTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 10 },
  refClose: { marginTop: 14, backgroundColor: pt.purple, borderRadius: radii.pill, paddingHorizontal: 24, paddingVertical: 10 },
  refCloseText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
});
