/**
 * usePuzzleController.js — CÉREBRO do "Monte a Cena" V2 (M1R2R). Um ÚNICO motor de gesto para os
 * três níveis (4/6/9 peças). Corrige o deslocamento lateral do M1R2.1 abandonando o grabOffset:
 *
 *   MODELO "PEÇA ACIMA DO DEDO" (item 3):
 *     fingerX = pageX − rootWindowX ; fingerY = pageY − rootWindowY
 *     activeLeft = clamp( fingerX − activeWidth/2, marginL, rootW − marginR − activeWidth )
 *     activeTop  = clamp( fingerY − activeHeight − LIFT, minTop, maxTop )
 *   A peça fica centralizada ~20 pt ACIMA do dedo, sempre inteiramente visível (clamp), sem depender
 *   de locationX/trayScale. A source-view do responder NUNCA desmonta (fica invisível durante o
 *   arrasto); a camada ativa é absoluta e `pointerEvents:"none"`.
 *
 * Estados: idle · pressed · selected · dragging · returning · snapping · placed · completed.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, AppState, AccessibilityInfo, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { playGameSfx, preloadGameSfx } from '../services/audioManager';
import { buildLevelGeometry, getLevelSource, shuffledTrayOrder } from '../data/monteACenaLevels';
import { markLevelCompleted } from '../services/monteACenaSession';
import { snapToleranceFor } from '../services/monteACenaGeometry';
import { saveCompletion } from '../services/monteACenaGallery';
import { isPremiumUser } from '../services/accessControl';

const LIFT = 20;              // a peça fica 20 pt acima do dedo
const MOVE_THRESHOLD = 5;
const INACTIVITY_MS = 6000;

function nowMs() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
const clamp = (v, lo, hi) => (v < lo ? lo : (v > hi ? hi : v));

export function usePuzzleController(level, geomLayout, navigation, opts = {}) {
  const { scene = null, profileId = 'default', onNext = null } = opts;
  const isPremium = isPremiumUser();
  const source = getLevelSource(level);
  const artW = level.artWidth;
  const artH = level.artHeight;
  const geometry = useMemo(() => buildLevelGeometry(level), [level]);
  const pieceById = useMemo(() => { const m = {}; geometry.pieces.forEach((p) => { m[p.id] = p; }); return m; }, [geometry]);
  const trayOrder = useMemo(() => shuffledTrayOrder(geometry.pieces, level.seed), [geometry, level.seed]);

  const { boardLeft, boardTop, boardW, boardH, rootW, marginL, marginR, minTop, maxBottom, wellRect } = geomLayout;

  const [placed, setPlaced] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [glowTargetId, setGlowTargetId] = useState(null);
  const [helpPulseId, setHelpPulseId] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [beniMsg, setBeniMsg] = useState('Vamos completar esta cena?');
  const [beniExpanded, setBeniExpanded] = useState(true);
  const [refOpen, setRefOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [diag, setDiag] = useState(null);
  const [audioStatus, setAudioStatus] = useState({ ready: false, lastError: null });
  const [effect, setEffect] = useState(null); // { type:'snap'|'complete'|'error', x, y, at }
  // Fase da experiência: playing → celebrating → viewingArtwork → showingActions
  const [phase, setPhase] = useState('playing');

  const done = placed.length === level.pieceCount;

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const rootWin = useRef({ x: 0, y: 0 });
  const rootRef = useRef(null);
  const gsRef = useRef('idle');
  const activeRef = useRef(null);
  const draggingRef = useRef(false);
  const resolvingRef = useRef(false);
  const mountedRef = useRef(true);
  const dropStartRef = useRef(0);
  const wrongRef = useRef({});
  const inactivityRef = useRef(null);

  // trayScale único por nível (referência = maior visualBounds; proporção preservada).
  const trayScale = useMemo(() => {
    const inner = geomLayout.wellSize - 12;
    let maxW = 0; let maxH = 0;
    for (const p of geometry.pieces) { maxW = Math.max(maxW, p.visualBounds.w * boardW); maxH = Math.max(maxH, p.visualBounds.h * boardH); }
    return Math.max(0.16, Math.min(0.6, Math.min(inner / maxW, inner / maxH)));
  }, [geometry, boardW, boardH, geomLayout.wellSize]);

  const wellIndexOf = useCallback((id) => trayOrder.indexOf(id), [trayOrder]);

  // ── init: reduce motion + preload de áudio (auditoria real) ──
  useEffect(() => {
    mountedRef.current = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => { if (mountedRef.current) setReduceMotion(!!v); }).catch(() => {});
    try {
      preloadGameSfx(['match_success', 'board_complete']);
      if (mountedRef.current) setAudioStatus({ ready: true, lastError: null });
    } catch (e) { if (mountedRef.current) setAudioStatus({ ready: false, lastError: String(e && e.message || e) }); }
    return () => { mountedRef.current = false; };
  }, []);

  const measureRoot = useCallback(() => {
    if (rootRef.current && rootRef.current.measureInWindow) {
      rootRef.current.measureInWindow((x, y) => { rootWin.current = { x: x || 0, y: y || 0 }; });
    }
  }, []);

  // ── ajuda por inatividade ──
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

  // pulso da ajuda (peça/alvo) — respeita movimento reduzido
  const pulseAnim = useRef(new Animated.Value(0)).current;
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

  const cancelGesture = useCallback(() => {
    gsRef.current = 'idle'; activeRef.current = null; draggingRef.current = false; resolvingRef.current = false;
    pan.stopAnimation(() => {}); setActiveId(null);
  }, [pan]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s !== 'active') cancelGesture(); });
    const offBlur = navigation.addListener('blur', () => { cancelGesture(); clearInactivity(); });
    const offFocus = navigation.addListener('focus', () => { measureRoot(); armInactivity(); });
    return () => { sub?.remove?.(); offBlur?.(); offFocus?.(); };
  }, [navigation, cancelGesture, clearInactivity, armInactivity, measureRoot]);

  // Dimensões da peça ativa (tamanho EXATO do tabuleiro; sem escala extra).
  const activeSize = useCallback((piece) => ({ w: piece.overscanBounds.w * boardW, h: piece.overscanBounds.h * boardH }), [boardW, boardH]);

  // Posição "peça acima do dedo" com clamp — root-local.
  const positionAboveFinger = useCallback((piece, pageX, pageY) => {
    const fingerX = pageX - rootWin.current.x;
    const fingerY = pageY - rootWin.current.y;
    const { w, h } = activeSize(piece);
    const left = clamp(fingerX - w / 2, marginL, rootW - marginR - w);
    const top = clamp(fingerY - h - LIFT, minTop, maxBottom - h);
    return { left, top, w, h, fingerX, fingerY };
  }, [activeSize, marginL, marginR, rootW, minTop, maxBottom]);

  const targetTopLeft = useCallback((piece) => {
    const ob = piece.overscanBounds;
    return { x: boardLeft + ob.x * boardW, y: boardTop + ob.y * boardH };
  }, [boardLeft, boardTop, boardW, boardH]);

  const snapInfo = useCallback((piece, left, top) => {
    const ob = piece.overscanBounds;
    const curX = left + (piece.snapPoint[0] - ob.x) * boardW;
    const curY = top + (piece.snapPoint[1] - ob.y) * boardH;
    const tgtX = boardLeft + piece.snapPoint[0] * boardW;
    const tgtY = boardTop + piece.snapPoint[1] * boardH;
    return { dist: Math.hypot(curX - tgtX, curY - tgtY), curX, curY, tgtX, tgtY };
  }, [boardLeft, boardTop, boardW, boardH]);
  const tolPxFor = useCallback((piece) => snapToleranceFor(piece, level.snapFactor) * boardW, [level]);

  const playSfx = useCallback((name) => {
    try { playGameSfx(name); } catch (e) { setAudioStatus((s) => ({ ...s, lastError: String(e && e.message || e) })); }
  }, []);

  const lockPiece = useCallback((piece) => {
    if (!mountedRef.current) return;
    playSfx('match_success');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    const tl = targetTopLeft(piece); const sz = activeSize(piece);
    setEffect({ type: 'snap', x: tl.x + sz.w / 2, y: tl.y + sz.h / 2, at: nowMs() });
    setBeniMsg(['Muito bem!', 'Essa parte combinou!', 'Está ficando lindo!'][placed.length % 3]);
    setPlaced((prev) => (prev.includes(piece.id) ? prev : [...prev, piece.id]));
    setSelectedId(null); setActiveId(null); setGlowTargetId(null); setHelpPulseId(null);
    activeRef.current = null; draggingRef.current = false; gsRef.current = 'placed';
    pan.setValue({ x: 0, y: 0 }); wrongRef.current[piece.id] = 0;
  }, [playSfx, targetTopLeft, activeSize, placed.length, pan]);

  const snapToTarget = useCallback((piece) => {
    gsRef.current = 'snapping';
    const tl = targetTopLeft(piece);
    dropStartRef.current = nowMs();
    if (reduceMotion) { pan.setValue({ x: tl.x, y: tl.y }); lockPiece(piece); return; }
    Animated.spring(pan, { toValue: { x: tl.x, y: tl.y }, useNativeDriver: false, friction: 6, tension: 80 })
      .start(({ finished }) => { if (finished) lockPiece(piece); });
  }, [targetTopLeft, reduceMotion, pan, lockPiece]);

  // RETORNO SEM SALTO: o overlay é a ÚNICA representação; anima (timing, SEM mola/rebote) até o poço
  // real e só então revela a peça da bandeja (frame seguinte). A peça original nunca reaparece antes.
  const returnToWell = useCallback((piece) => {
    gsRef.current = 'returning';
    const wi = wellIndexOf(piece.id); const wr = wellRect(wi < 0 ? 0 : wi);
    const sz = activeSize(piece);
    const to = { x: wr.cx - sz.w / 2, y: wr.cy - sz.h / 2 };
    const finish = () => { setActiveId(null); activeRef.current = null; draggingRef.current = false; gsRef.current = 'idle'; pan.setValue({ x: 0, y: 0 }); };
    if (reduceMotion) { finish(); return; }
    Animated.timing(pan, { toValue: to, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false })
      .start(({ finished }) => { if (finished) finish(); });
  }, [wellIndexOf, wellRect, activeSize, reduceMotion, pan]);

  // ERRO VERDADEIRO = soltar perto do alvo de OUTRA peça (não vazio). CANCELAMENTO = área sem alvo.
  const isWrongTargetDrop = useCallback((piece, left, top) => {
    const cx = left + (piece.overscanBounds.w * boardW) / 2;
    const cy = top + (piece.overscanBounds.h * boardH) / 2;
    for (const other of geometry.pieces) {
      if (other.id === piece.id || placed.includes(other.id)) continue;
      const tx = boardLeft + other.snapPoint[0] * boardW;
      const ty = boardTop + other.snapPoint[1] * boardH;
      if (Math.hypot(cx - tx, cy - ty) <= tolPxFor(other) * 1.4) return other.id;
    }
    return null;
  }, [geometry, placed, boardLeft, boardTop, boardW, boardH, tolPxFor]);

  const registerWrong = useCallback((piece, wrongTargetId) => {
    const n = (wrongRef.current[piece.id] || 0) + 1; wrongRef.current[piece.id] = n;
    if (wrongTargetId) {
      // ERRO: som gentil (match_error) + balanço/atenção no alvo incorreto (não permanente).
      playSfx('match_error');
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      const tl = { x: boardLeft + geometry.pieces.find((p) => p.id === wrongTargetId).snapPoint[0] * boardW, y: boardTop + geometry.pieces.find((p) => p.id === wrongTargetId).snapPoint[1] * boardH };
      setEffect({ type: 'error', x: tl.x, y: tl.y, at: nowMs() });
    }
    if (n >= 2) {
      setGlowTargetId(piece.id); setBeniMsg('Quase! Veja onde essa parte aparece.'); setBeniExpanded(true);
      setTimeout(() => { if (mountedRef.current) setGlowTargetId((g) => (g === piece.id ? null : g)); }, 1600);
    }
  }, [boardLeft, boardTop, boardW, geometry]);

  // ── responder por peça (montada durante todo o gesto) ──
  const makePieceResponder = useCallback((piece) => PanResponder.create({
    onStartShouldSetPanResponder: () => activeRef.current === null && !done,
    onMoveShouldSetPanResponder: (_e, g) => activeRef.current === null && !done && (Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3),
    onPanResponderGrant: () => { gsRef.current = 'pressed'; draggingRef.current = false; resolvingRef.current = false; noteInteraction(); },
    onPanResponderMove: (_e, g) => {
      if (!draggingRef.current) {
        if (Math.abs(g.dx) < MOVE_THRESHOLD && Math.abs(g.dy) < MOVE_THRESHOLD) return;
        draggingRef.current = true; gsRef.current = 'dragging'; activeRef.current = piece.id;
        setActiveId(piece.id); setSelectedId(null);
      }
      const pos = positionAboveFinger(piece, g.moveX, g.moveY);
      pan.setValue({ x: pos.left, y: pos.top });
      const near = snapInfo(piece, pos.left, pos.top).dist <= tolPxFor(piece) * 1.8;
      setGlowTargetId((cur) => (near ? piece.id : (cur === piece.id ? null : cur)));
    },
    onPanResponderRelease: (_e, g) => {
      if (!draggingRef.current) { gsRef.current = 'idle'; setSelectedId((cur) => (cur === piece.id ? null : piece.id)); return; }
      if (resolvingRef.current) return; resolvingRef.current = true;
      const pos = positionAboveFinger(piece, g.moveX, g.moveY);
      const info = snapInfo(piece, pos.left, pos.top);
      const tol = tolPxFor(piece);
      setDiag({
        finger: [Math.round(pos.fingerX), Math.round(pos.fingerY)], page: [Math.round(g.moveX), Math.round(g.moveY)],
        rootWin: [Math.round(rootWin.current.x), Math.round(rootWin.current.y)],
        active: [Math.round(pos.left), Math.round(pos.top)], activeSize: [Math.round(pos.w), Math.round(pos.h)],
        center: [Math.round(pos.left + pos.w / 2), Math.round(pos.top + pos.h / 2)],
        target: [Math.round(info.tgtX), Math.round(info.tgtY)], dist: Math.round(info.dist), tol: Math.round(tol),
      });
      resolvingRef.current = false;
      if (info.dist <= tol) { gsRef.current = 'checking'; snapToTarget(piece); }
      else {
        // ERRO (soltou no alvo de outra peça) toca som; CANCELAMENTO (área vazia) é silencioso.
        const wrongId = isWrongTargetDrop(piece, pos.left, pos.top);
        registerWrong(piece, wrongId);
        returnToWell(piece);
      }
    },
    onPanResponderTerminate: () => cancelGesture(),
  }), [done, noteInteraction, positionAboveFinger, pan, snapInfo, tolPxFor, snapToTarget, isWrongTargetDrop, registerWrong, returnToWell, cancelGesture]);

  // ── tap-to-place ──
  const onBoardPress = useCallback((evt) => {
    if (!selectedId || done || activeRef.current) return;
    const piece = pieceById[selectedId];
    const lx = (evt.nativeEvent.locationX || 0) / boardW;
    const ly = (evt.nativeEvent.locationY || 0) / boardH;
    const near = Math.hypot((lx - piece.snapPoint[0]) * boardW, (ly - piece.snapPoint[1]) * boardH) <= tolPxFor(piece) * 2.4;
    noteInteraction();
    if (!near) { setBeniMsg('Toque bem em cima do lugar dela.'); setBeniExpanded(true); return; }
    const wi = wellIndexOf(selectedId); const wr = wellRect(wi < 0 ? 0 : wi); const sz = activeSize(piece);
    pan.setValue({ x: wr.cx - sz.w / 2, y: wr.cy - sz.h / 2 });
    activeRef.current = selectedId; draggingRef.current = true; setActiveId(selectedId);
    snapToTarget(piece);
  }, [selectedId, done, pieceById, boardW, boardH, tolPxFor, noteInteraction, wellIndexOf, wellRect, activeSize, pan, snapToTarget]);

  // Beni auto-recolhe (só conteúdo; a faixa é fixa na tela)
  useEffect(() => { const t = setTimeout(() => { if (mountedRef.current && placed.length === 0) setBeniExpanded(false); }, 4500); return () => clearTimeout(t); }, [placed.length]);
  useEffect(() => { if (placed.length > 0 && !done) setBeniExpanded(false); }, [placed.length, done]);

  // CONCLUSÃO em FASES: celebrating → (sem modal) viewingArtwork → (toque) showingActions.
  const doneFiredRef = useRef(false);
  const celebTimer = useRef(null);
  useEffect(() => {
    if (done && !doneFiredRef.current) {
      doneFiredRef.current = true; clearInactivity();
      setPhase('celebrating');
      playSfx('board_complete');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      markLevelCompleted(level.id);
      // Persiste em "Meus Quadros" só no Plano Família (grátis contempla mas não salva).
      if (isPremium && scene) {
        saveCompletion(profileId, { puzzleSceneId: scene.puzzleSceneId, storyId: scene.storyId, sceneNumber: scene.sceneNumber, pieceCount: level.pieceCount, completedAt: null });
      }
      setBeniExpanded(true); setBeniMsg('Conseguimos! A cena ficou completa!');
      setEffect({ type: 'complete', x: boardLeft + boardW / 2, y: boardTop + boardH / 2, at: nowMs() });
      // celebração → contemplação (NÃO abre modal; mostra o quadro)
      celebTimer.current = setTimeout(() => { if (mountedRef.current) setPhase('viewingArtwork'); }, reduceMotion ? 500 : 1500);
    }
    if (!done) { doneFiredRef.current = false; if (celebTimer.current) { clearTimeout(celebTimer.current); celebTimer.current = null; } }
    return undefined;
  }, [done, level.id, level.pieceCount, clearInactivity, playSfx, boardLeft, boardTop, boardW, boardH, isPremium, scene, profileId, reduceMotion]);

  // Contemplação: um toque revela as ações (o quadro permanece visível).
  const revealActions = useCallback(() => { if (phase === 'viewingArtwork') setPhase('showingActions'); }, [phase]);

  const reset = useCallback(() => {
    cancelGesture(); setPlaced([]); setSelectedId(null); setGlowTargetId(null); setHelpPulseId(null);
    wrongRef.current = {}; setBeniExpanded(true); setBeniMsg('Vamos completar esta cena?'); setEffect(null);
    doneFiredRef.current = false; setPhase('playing'); armInactivity();
  }, [cancelGesture, armInactivity]);

  const goNext = useCallback(() => { if (onNext) onNext(); else navigation.goBack(); }, [navigation, onNext]);

  // Diagnóstico de áudio (interno)
  const testMatch = useCallback(() => playSfx('match_success'), [playSfx]);
  const testComplete = useCallback(() => playSfx('board_complete'), [playSfx]);

  return {
    source, artW, artH, geometry, pieceById, trayOrder, trayScale, wellIndexOf,
    placed, selectedId, activeId, activePiece: activeId ? pieceById[activeId] : null,
    glowTargetId, helpPulseId, reduceMotion, done, pan, pulse: pulseAnim,
    beni: { msg: beniMsg, expanded: beniExpanded, setExpanded: setBeniExpanded },
    reference: { open: refOpen, setOpen: setRefOpen },
    dev: { open: devOpen, setOpen: setDevOpen, diag, audioStatus, testMatch, testComplete, setPhase },
    effect, phase, revealActions, isPremium,
    progress: { placed: placed.length, total: level.pieceCount, done },
    makePieceResponder, onBoardPress, reset, goNext, hasNext: !!onNext,
    rootRef, measureRoot,
  };
}

export default usePuzzleController;
