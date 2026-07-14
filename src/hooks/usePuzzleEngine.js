/**
 * usePuzzleEngine.js — MOTOR de "Monte a Cena" em MODO SEGURO (M1R5R recuperação P0 · M1R6 premium).
 *
 * BASE PRESERVADA (não regride o P0):
 *   • PUZZLE_GESTURE_RUNTIME = 'js-safe' e PUZZLE_ENGINE_SAFE_MODE = true.
 *   • Todos os gestos usam `.runOnJS(true)` → reconhecimento e decisão semântica no runtime JS.
 *   • NENHUM callback semântico roda no UI runtime; nenhuma diretiva de worklet neste arquivo.
 *   • Reanimated é usado SÓ para shared values + useAnimatedStyle + withTiming/withSequence (VISUAL).
 *   • Conclusão de snap/retorno via setTimeout no JS (nunca callback de withTiming no UI runtime).
 *   • Alvo por id explícito (targetId === pieceId); SEM onBoardPress global; SEM tolerância por
 *     distância ao alvo correto (hit test = interseção real de área).
 *   • COMMIT só em SNAP_FINISHED (depois da animação). Seleção/arrasto/erro/cancelamento NÃO gravam.
 *
 * CAMADA PREMIUM (M1R6, tudo aditivo e visual/estado — não toca a base acima):
 *   • Corredor de orientação (mensagem derivada do estado).
 *   • Efeitos localizados: acerto (anel+estrelas), erro (pulso âmbar no alvo + oscilação da peça).
 *   • Retorno suave (300–380 ms, Easing.out cubic, encolhe até a bandeja) vs cancelamento silencioso.
 *   • Ajuda progressiva por tentativas erradas na MESMA peça (2 → brilho do alvo + dica; 4 → mais forte).
 *   • reduceMotion: encurta/parte trajetórias, mantém retorno visível, som, háptico e mensagens.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming, withSequence, withDelay, Easing } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { initialPuzzleState, puzzleReducer } from './usePuzzleMachine';
import { MONTE_A_CENA_MOTION as MOTION } from '../data/monteACenaMotionTokens';

// rAF seguro (RN expõe requestAnimationFrame; fallback defensivo p/ ambientes sem ele).
const raf = (fn) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(fn, 16));

export const MONTE_A_CENA_ENGINE_VERSION = 'M1R5_INTEGRATED';
export const PUZZLE_GESTURE_RUNTIME = 'js-safe';
export const PUZZLE_ENGINE_SAFE_MODE = true;
export const MONTE_A_CENA_PREMIUM_VERSION = 'M1R6_PREMIUM';

const MIN_INTERSECTION = 0.16;
const FINGER_GAP = 20;
const H_MARGIN = 8;
const HINT_ATTEMPTS_1 = 2; // após 2 erros na mesma peça → brilho do alvo + dica de cor/desenho
const HINT_ATTEMPTS_2 = 4; // após 4 → brilho mais forte (ação continua com a criança)
const clamp = (v, lo, hi) => (v < lo ? lo : (v > hi ? hi : v));
const finite = (n) => typeof n === 'number' && Number.isFinite(n);
function devlog(tag) { if (typeof __DEV__ !== 'undefined' && __DEV__) { try { console.log(`[PuzzleGesture] ${tag}`); } catch {} } }
function guard(fn, onError) { try { return fn(); } catch (e) { if (typeof __DEV__ !== 'undefined' && __DEV__) { try { console.log('[PuzzleGesture][ERROR]', e && e.stack ? e.stack : e); } catch {} } onError?.(e); return undefined; } }

export function usePuzzleEngine({ totalPieces, onCommit, onSound, onHaptic, onComplete, reduceMotion = false, guideOpacity = null, initialPlacedIds }) {
  const [state, dispatch] = useReducer(puzzleReducer, undefined, () => initialPuzzleState(totalPieces, initialPlacedIds));
  const stateRef = useRef(state); stateRef.current = state;
  const restoredCount = (state.placedPieceIds || []).length; // peças restauradas contam como commits+efeitos
  const [activeId, setActiveId] = useState(null);
  const [diag, setDiag] = useState({});

  // Durações (ms) — FONTE ÚNICA em monteACenaMotionTokens. reduceMotion encurta e parte trajetórias,
  // MAS mantém o retorno visível.
  const rm = (v, floor = 0) => (reduceMotion ? Math.max(floor, Math.round(v * 0.55)) : v);
  const SNAP_DUR = rm(MOTION.snapDuration);              // 210
  const RETURN_DUR = rm(MOTION.wrongReturnDuration, 160); // 330 (retorno sempre visível)
  const CANCEL_DUR = rm(MOTION.cancelReturnDuration, 160); // 290
  const SHAKE_MS = reduceMotion ? 0 : MOTION.wrongReactionDuration; // 90
  const DRAG_LIFT = reduceMotion ? 0 : MOTION.dragLiftDuration;     // 110

  // Efeitos premium (estado observado pela tela; NÃO altera lógica de commit).
  const [fx, setFx] = useState({ wrongKey: 0, lastWrongTargetId: null, lastEffect: null });
  const firstSuccessRef = useRef(false);

  // ── EVENTO DE SUCESSO ÚNICO por encaixe (M1R8A). Cada SNAP_FINISHED válido cria exatamente um
  // successEventId (crescente). A tela renderiza o efeito com `successEventId` como KEY → cada acerto
  // tem seu componente independente (sem timer compartilhado, sem um efeito antigo apagar um novo).
  // Invariante: successfulCommitCount === successEffectCount (após o handoff de cada acerto). ──
  const [successEvent, setSuccessEvent] = useState(null);
  const successEventIdRef = useRef(0);
  const successCommitRef = useRef(restoredCount);  // commits (peças restauradas já contam)
  const successEffectRef = useRef(restoredCount);  // efeitos emitidos (1 por commit, após o handoff)

  // Handoff visual (transferência overlay→peça encaixada, sem piscada). Estado observável p/ diagnóstico.
  const [overlayShown, setOverlayShown] = useState(false); // overlay realmente visível (opacity 1)
  const [handoffReady, setHandoffReady] = useState(false); // commit feito, aguardando ocultar o overlay

  // ── Mensagens do Beni: CONTROLADAS (cada uma UMA vez por rodada; erro/conclusão têm prioridade) ──
  const [message, setMessage] = useState('Escolha uma peça.');
  const [messageTone, setMessageTone] = useState('neutral');
  const msgTimer = useRef(null);
  const shownMsgRef = useRef({ start: true }); // 'start' já exibida na montagem
  const msgPriorityRef = useRef(0);
  const showMsg = useCallback((key, text, tone = 'neutral', priority = 0) => {
    if (shownMsgRef.current[key]) return;              // cada mensagem só uma vez por rodada
    shownMsgRef.current[key] = true;
    if (priority < msgPriorityRef.current) return;     // não rebaixa uma mensagem de maior prioridade ainda ativa
    msgPriorityRef.current = priority;
    setMessage(text); setMessageTone(tone);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => { if (mountedRef.current) { setMessage(''); setMessageTone('neutral'); msgPriorityRef.current = 0; } }, MOTION.messageDuration);
  }, []);

  // Ajuda progressiva: tentativas erradas por peça.
  const attemptsRef = useRef({});
  const [attemptsTick, setAttemptsTick] = useState(0);

  // Geometria em REFS JS simples (nunca capturadas em animação da UI).
  const rootWinRef = useRef({ x: 0, y: 0, rootW: 0, rootH: 0 });
  const targetsRef = useRef([]);   // [{ id, left, top, right, bottom, cx, cy }]
  const wellsRef = useRef([]);     // [{ id, left, top, cx, cy }]
  const trayScaleRef = useRef(1);  // escala da peça na bandeja (para o retorno encolher até lá)

  // Overlay (Reanimated — só visual).
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  // Timers/estado de interação (JS).
  const snapTimer = useRef(null);
  const returnTimer = useRef(null);
  const firstUpdateRef = useRef({});
  const mountedRef = useRef(true);
  useEffect(() => () => {
    mountedRef.current = false;
    if (snapTimer.current) clearTimeout(snapTimer.current);
    if (returnTimer.current) clearTimeout(returnTimer.current);
    if (msgTimer.current) clearTimeout(msgTimer.current);
  }, []);

  const setGeometry = useCallback(({ root, targets, wells }) => {
    if (root) rootWinRef.current = root;
    if (targets) targetsRef.current = targets;
    if (wells) wellsRef.current = wells;
  }, []);
  const setTrayScale = useCallback((s) => { if (finite(s) && s > 0) trayScaleRef.current = s; }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  // Mostra o overlay SÓ com coordenadas prontas e finitas (anti-glitch 0,0).
  const showOverlayAt = useCallback((x, y) => {
    if (!finite(x) || !finite(y)) { devlog('overlay:blocked-nonfinite'); return false; }
    tx.value = x; ty.value = y; scale.value = 1; opacity.value = 1;
    setOverlayShown(true);
    return true;
  }, [tx, ty, scale, opacity]);

  const hideOverlay = useCallback(() => { opacity.value = 0; setOverlayShown(false); }, [opacity]);

  // ── HANDOFF SEM PISCADA (M1R7): a peça encaixada é renderizada ANTES de ocultar o overlay.
  // Sequência: snap termina (overlay no centro exato, escala 1) → COMMIT (peça fixa aparece SOB o
  // overlay, que segue com opacity 1) → espera um frame de pintura → oculta o overlay → SÓ ENTÃO o
  // efeito de sucesso. NUNCA há um frame com overlay E peça fixa invisíveis.
  const handleSnapFinished = useCallback((pieceId, iid) => {
    if (!mountedRef.current) return;
    guard(() => {
      if (iid != null && iid !== stateRef.current.interactionId) return; // callback antigo
      // 1) COMMIT primeiro: a peça fixa passa a existir SOB o overlay (overlay continua opacity 1).
      dispatch({ type: 'SNAP_FINISHED' });
      onCommit?.(pieceId);
      delete attemptsRef.current[pieceId];
      successCommitRef.current += 1; // COMMIT contado (um por SNAP_FINISHED válido)
      setHandoffReady(true);
      devlog('commit');
      // 2) Depois de a peça fixa pintar (2 rAF), oculta o overlay e inicia O EVENTO DE SUCESSO.
      raf(() => raf(() => {
        if (!mountedRef.current) return;
        guard(() => {
          hideOverlay(); setActiveId(null); setHandoffReady(false);
          // UM successEvent por commit: som, háptico, estrelas, anel e progresso usam ESTE evento.
          const t = targetsRef.current.find((x) => x.id === pieceId);
          const eid = successEventIdRef.current + 1; successEventIdRef.current = eid;
          successEffectRef.current += 1; // EFEITO contado → invariante commit===effect (pós-handoff)
          setFx((f) => ({ ...f, lastEffect: 'success' }));
          setSuccessEvent({
            successEventId: eid, interactionId: iid, pieceId, targetId: pieceId,
            centerX: t ? t.cx : 0, centerY: t ? t.cy : 0,
            size: t ? Math.min(t.right - t.left, t.bottom - t.top) : 0,
            createdAt: eid,
          });
          onSound?.('match_success'); // som do MESMO evento (idempotente por acerto)
          onHaptic?.('success');
          // Mensagens (uma vez): última peça tem prioridade sobre "Muito bem!".
          const placedNow = stateRef.current.placedPieceIds.length;
          const total = stateRef.current.totalPieces;
          if (placedNow < total) {
            if (total - placedNow === 1) showMsg('lastPiece', 'Falta só uma!', 'success', 2);
            else showMsg('firstHit', 'Muito bem!', 'success', 1);
          }
          if (!firstSuccessRef.current) firstSuccessRef.current = true;
        });
      }));
    });
  }, [hideOverlay, onCommit, onSound, onHaptic, showMsg]);

  // Retorno: mesmo princípio de handoff — o overlay some SÓ no frame seguinte à chegada, quando a
  // peça original reaparece na bandeja. AQUI a troca precisa ser ATÔMICA: a peça da bandeja reaparece
  // por `setActiveId(null)` (commit do React) e o overlay some DESMONTANDO no MESMO commit. NÃO usar
  // `hideOverlay()` (opacity.value=0 é canal UI-thread do Reanimated) — ele pode aplicar 1 frame ANTES
  // do commit do React e abrir um frame em branco no poço. O próximo `showOverlayAt` reseta opacity=1.
  const handleReturnFinished = useCallback(() => {
    if (!mountedRef.current) return;
    guard(() => {
      dispatch({ type: 'RETURN_FINISHED' });
      setHandoffReady(true);
      raf(() => raf(() => {
        if (!mountedRef.current) return;
        guard(() => { setActiveId(null); setOverlayShown(false); setHandoffReady(false); devlog('return:end'); });
      }));
    });
  }, []);

  // Anima o overlay para (toX,toY) na escala toScale. Uso VISUAL apenas.
  const animateTo = useCallback((toX, toY, dur, toScale) => {
    const easing = Easing.out(Easing.cubic);
    scale.value = withTiming(toScale, { duration: dur, easing });
    tx.value = withTiming(toX, { duration: dur, easing });
    ty.value = withTiming(toY, { duration: dur, easing });
  }, [scale, tx, ty]);

  const startSnap = useCallback((pieceId, iid) => {
    devlog('animation:start');
    const t = targetsRef.current.find((x) => x.id === pieceId); if (!t) { handleReturnFinished(); return; }
    const dims = pieceDimsRef.current[pieceId] || { w: 1, h: 1 };
    // Alvo do snap = o TOP-LEFT EXATO onde a peça fixa será renderizada (snapLeft/snapTop), para que
    // o overlay e a peça encaixada ocupem o MESMO retângulo — handoff pixel-perfeito, sem salto.
    const toX = finite(t.snapLeft) ? t.snapLeft : t.cx - dims.w / 2;
    const toY = finite(t.snapTop) ? t.snapTop : t.cy - dims.h / 2;
    animateTo(toX, toY, SNAP_DUR, 1);
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => handleSnapFinished(pieceId, iid), SNAP_DUR + 20);
  }, [animateTo, handleSnapFinished, handleReturnFinished, SNAP_DUR]);

  // Retorno ao poço. `shake` = erro (oscila + pulso âmbar no alvo); sem shake = cancelamento silencioso.
  const startReturn = useCallback((pieceId, { shake = false, wrongTargetId = null } = {}) => {
    devlog(shake ? 'return:start:error' : 'return:start:cancel');
    const w = wellsRef.current.find((x) => x.id === pieceId);
    const dims = pieceDimsRef.current[pieceId] || { w: 1, h: 1 };
    const toScale = trayScaleRef.current || 1;
    const dur = shake ? RETURN_DUR : CANCEL_DUR;
    const easing = Easing.out(Easing.cubic);
    if (shake) {
      setFx((f) => ({ ...f, wrongKey: f.wrongKey + 1, lastWrongTargetId: wrongTargetId, lastEffect: 'error' }));
      onHaptic?.('warning');
      // Mensagem de erro (prioridade sobre instruções). Cancelamento (área vazia) NÃO fala nada.
      const secondSame = (attemptsRef.current[pieceId] || 0) >= HINT_ATTEMPTS_1;
      if (secondSame) showMsg('secondError', 'Observe as cores e os desenhos.', 'neutral', 2);
      else showMsg('firstError', 'Quase. Tente outro espaço.', 'error', 2);
    } else {
      setFx((f) => ({ ...f, lastEffect: 'cancel' }));
    }
    if (w) {
      const wellX = w.cx - dims.w / 2;
      const wellY = w.cy - dims.h / 2;
      if (shake && SHAKE_MS > 0 && finite(tx.value)) {
        const base = tx.value;
        // pequena oscilação horizontal (≤3 pt) → depois viaja de volta (trajetória visível)
        tx.value = withSequence(
          withTiming(base - 3, { duration: SHAKE_MS / 3, easing: Easing.inOut(Easing.quad) }),
          withTiming(base + 3, { duration: SHAKE_MS / 3, easing: Easing.inOut(Easing.quad) }),
          withTiming(wellX, { duration: dur, easing }),
        );
        ty.value = withDelay(SHAKE_MS, withTiming(wellY, { duration: dur, easing }));
        scale.value = withDelay(SHAKE_MS, withTiming(toScale, { duration: dur, easing }));
      } else {
        animateTo(wellX, wellY, dur, toScale);
      }
    }
    const total = (shake ? SHAKE_MS : 0) + dur + 30;
    if (returnTimer.current) clearTimeout(returnTimer.current);
    returnTimer.current = setTimeout(handleReturnFinished, total);
  }, [animateTo, handleReturnFinished, onHaptic, showMsg, RETURN_DUR, CANCEL_DUR, SHAKE_MS, tx, ty, scale]);

  // Dimensões da peça ativa (informadas pelo chamador via makePieceGesture/onTargetTapped).
  const pieceDimsRef = useRef({});

  const bumpAttempt = useCallback((pieceId) => {
    if (pieceId == null) return;
    attemptsRef.current[pieceId] = (attemptsRef.current[pieceId] || 0) + 1;
    setAttemptsTick((t) => t + 1);
  }, []);

  // ── Toque no ALVO por id explícito (compara selectedPieceId com o alvo tocado; sem distância) ──
  const onTargetTapped = useCallback((targetId, dims) => guard(() => {
    const s = stateRef.current;
    if (dims) pieceDimsRef.current[targetId] = dims;
    if (s.selectedPieceId == null) return;
    dispatch({ type: 'TARGET_TAPPED', targetId });
    devlog(`target:tap ${targetId} sel=${s.selectedPieceId}`);
    if (s.selectedPieceId === targetId) {
      const iid = s.interactionId; const d = dims || pieceDimsRef.current[targetId] || { w: 1, h: 1 };
      const w = wellsRef.current.find((x) => x.id === targetId);
      if (!w) return;
      setActiveId(targetId);
      if (!showOverlayAt(w.cx - d.w / 2, w.cy - d.h / 2)) { setActiveId(null); return; }
      devlog('hit:evaluated correct(tap)'); // som de acerto agora toca no successEvent (pós-handoff)
      startSnap(targetId, iid);
    } else {
      onSound?.('wrong_place'); devlog('hit:evaluated wrong(tap)');
      bumpAttempt(s.selectedPieceId);
      setFx((f) => ({ ...f, wrongKey: f.wrongKey + 1, lastWrongTargetId: targetId, lastEffect: 'error' }));
      onHaptic?.('warning');
      const secondSame = (attemptsRef.current[s.selectedPieceId] || 0) >= HINT_ATTEMPTS_1;
      if (secondSame) showMsg('secondError', 'Observe as cores e os desenhos.', 'neutral', 2);
      else showMsg('firstError', 'Quase. Tente outro espaço.', 'error', 2);
    }
  }), [showOverlayAt, startSnap, onSound, onHaptic, bumpAttempt, showMsg]);

  const onEmptyAreaTapped = useCallback(() => { guard(() => dispatch({ type: 'EMPTY_AREA_TAPPED' })); }, []);

  // Hit test JS (interseção real com cada alvo; sem distância ao próprio alvo).
  const hitTest = useCallback((left, top, pieceId, dims) => {
    const ts = targetsRef.current; const aArea = dims.w * dims.h; let bestId = null; let bestRatio = 0;
    for (let i = 0; i < ts.length; i++) {
      const t = ts[i];
      if (stateRef.current.placedPieceIds.includes(t.id)) continue;
      const ix = Math.max(0, Math.min(left + dims.w, t.right) - Math.max(left, t.left));
      const iy = Math.max(0, Math.min(top + dims.h, t.bottom) - Math.max(top, t.top));
      const ratio = (ix * iy) / aArea;
      if (ratio > bestRatio) { bestRatio = ratio; bestId = t.id; }
    }
    if (bestRatio < MIN_INTERSECTION) return { type: 'empty', id: null };
    return { type: bestId === pieceId ? 'correct' : 'wrong', id: bestId };
  }, []);

  // Ocupado = animação de snap/retorno em curso. O reducer já ignora eventos nesse período; aqui
  // barramos também os efeitos colaterais do motor (setActiveId/overlay) para não piscar a peça nem
  // engolir um novo gesto durante a janela da animação (robustez, sem tocar o invariante de commit).
  const isBusy = useCallback(() => stateRef.current.status === 'snapping' || stateRef.current.status === 'returning', []);

  // ── Gestos por peça: Race(Pan, Tap) — TODOS em runOnJS(true) ──
  const makePieceGesture = useCallback((pieceId, dims) => {
    pieceDimsRef.current[pieceId] = dims;
    const tap = Gesture.Tap().runOnJS(true).maxDistance(6)
      .onEnd(() => guard(() => { if (isBusy()) return; devlog(`tap:selected ${pieceId}`); dispatch({ type: 'PIECE_TAPPED', pieceId }); onHaptic?.('select'); }));
    const pan = Gesture.Pan().runOnJS(true).minDistance(8)
      .onStart((e) => guard(() => {
        if (isBusy()) return;
        devlog('pan:start');
        const w = wellsRef.current.find((x) => x.id === pieceId);
        const startX = w ? w.cx - dims.w / 2 : (e.absoluteX - rootWinRef.current.x - dims.w / 2);
        const startY = w ? w.cy - dims.h / 2 : (e.absoluteY - rootWinRef.current.y - dims.h - FINGER_GAP);
        setActiveId(pieceId);
        dispatch({ type: 'PAN_STARTED', pieceId });
        showOverlayAt(startX, startY);
        // ELEVAÇÃO no início: o overlay nasce no tamanho da peça na bandeja (trayScale) e cresce até o
        // tabuleiro (escala 1) em ~110 ms, centrado no poço. Depois segue o dedo sem atraso (onUpdate).
        if (DRAG_LIFT > 0) {
          const ts = trayScaleRef.current || 1;
          if (ts < 1) { scale.value = ts; scale.value = withTiming(1, { duration: DRAG_LIFT, easing: Easing.out(Easing.cubic) }); }
        }
        firstUpdateRef.current[pieceId] = false;
      }, () => setActiveId(null)))
      .onUpdate((e) => guard(() => {
        const rw = rootWinRef.current;
        const lx = e.absoluteX - rw.x; const ly = e.absoluteY - rw.y;
        const ax = clamp(lx - dims.w / 2, H_MARGIN, rw.rootW - H_MARGIN - dims.w);
        const ay = ly - dims.h - FINGER_GAP;
        if (finite(ax) && finite(ay)) { tx.value = ax; ty.value = ay; }
        if (!firstUpdateRef.current[pieceId]) { firstUpdateRef.current[pieceId] = true; devlog('pan:update:first'); setDiag({ absoluteX: Math.round(e.absoluteX), absoluteY: Math.round(e.absoluteY), localX: Math.round(lx), localY: Math.round(ly), translateX: Math.round(ax), translateY: Math.round(ay) }); }
      }))
      .onEnd(() => guard(() => {
        devlog('pan:end');
        const left = tx.value; const top = ty.value;
        const hit = hitTest(left, top, pieceId, dims);
        devlog(`hit:evaluated ${hit.type} tgt=${hit.id}`);
        setDiag((d) => ({ ...d, hitResult: hit.type, hitTargetId: hit.id }));
        dispatch({ type: 'PAN_ENDED', hit: hit.type === 'empty' ? 'none' : hit.type, targetId: hit.id });
        const iid = stateRef.current.interactionId;
        if (hit.type === 'correct') { startSnap(pieceId, iid); } // som de acerto toca no successEvent (pós-handoff)
        else if (hit.type === 'wrong') { onSound?.('wrong_place'); bumpAttempt(pieceId); startReturn(pieceId, { shake: true, wrongTargetId: hit.id }); }
        else { startReturn(pieceId, { shake: false }); } // 'none' = cancelamento silencioso
      }));
    return Gesture.Race(pan, tap);
  }, [showOverlayAt, hitTest, startSnap, startReturn, onSound, onHaptic, bumpAttempt, isBusy, scale, DRAG_LIFT, tx, ty]);

  // Conclusão (uma vez).
  const doneFired = useRef(false);
  useEffect(() => {
    if (state.status === 'celebrating' && !doneFired.current) { doneFired.current = true; guard(() => { onComplete?.(); onSound?.('board_complete'); onHaptic?.('success'); devlog('celebration'); }); }
    if (state.status !== 'celebrating' && state.status !== 'viewingArtwork' && state.status !== 'showingActions') doneFired.current = false;
  }, [state.status, onComplete, onSound, onHaptic]);

  const revealArtwork = useCallback(() => dispatch({ type: 'ARTWORK_REVEALED' }), []);
  const showActions = useCallback(() => dispatch({ type: 'ACTIONS_REQUESTED' }), []);
  const reset = useCallback(() => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
    if (returnTimer.current) clearTimeout(returnTimer.current);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    attemptsRef.current = {}; firstSuccessRef.current = false;
    setActiveId(null); opacity.value = 0; setOverlayShown(false); setHandoffReady(false);
    setFx({ wrongKey: 0, lastWrongTargetId: null, lastEffect: null });
    setSuccessEvent(null); successEventIdRef.current = 0; successCommitRef.current = 0; successEffectRef.current = 0;
    // reinicia as mensagens do Beni: só "Escolha uma peça." fica disponível de novo.
    shownMsgRef.current = { start: true }; msgPriorityRef.current = 0;
    setMessage('Escolha uma peça.'); setMessageTone('neutral');
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => { if (mountedRef.current) { setMessage(''); setMessageTone('neutral'); } }, MOTION.messageDuration);
    dispatch({ type: 'RESET' });
  }, [opacity]);

  // "Início" some sozinha após MessageDuration (montagem = mensagem inicial já visível).
  useEffect(() => {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => { if (mountedRef.current) { setMessage(''); setMessageTone('neutral'); } }, MOTION.messageDuration);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Primeira seleção → "Agora encontre o lugar dela." (uma vez). Depois disso o Beni fica em silêncio,
  // exceto erro / última peça / conclusão.
  const sawSelectionRef = useRef(false);
  useEffect(() => {
    if (state.selectedPieceId != null && !sawSelectionRef.current) {
      sawSelectionRef.current = true;
      showMsg('firstSelect', 'Agora encontre o lugar dela.', 'neutral', 1);
    }
  }, [state.selectedPieceId, showMsg]);

  // ── Ajuda progressiva: nível de dica para a peça selecionada (só com peça selecionada) ──
  const selectedAttempts = state.selectedPieceId != null ? (attemptsRef.current[state.selectedPieceId] || 0) : 0;
  void attemptsTick; // força recomputo quando as tentativas mudam
  const hintLevel = state.selectedPieceId == null ? 0 : (selectedAttempts >= HINT_ATTEMPTS_2 ? 2 : (selectedAttempts >= HINT_ATTEMPTS_1 ? 1 : 0));
  const hintTargetId = hintLevel >= 1 ? state.selectedPieceId : null; // o alvo correto da peça selecionada

  // Durante a conclusão, o corredor não fala (a gaveta assume). `guidance` = mensagem controlada.
  const done = state.status === 'celebrating' || state.status === 'viewingArtwork' || state.status === 'showingActions';
  const guidance = done ? '' : message;
  const guidanceTone = done ? 'neutral' : messageTone;

  // ── Ações de teste do MODO CRIADOR (não afetam a jogabilidade real; só o painel dev) ──
  const devForcePlace = useCallback((pieceId, dims) => guard(() => {
    if (pieceId == null) return;
    if (stateRef.current.placedPieceIds.includes(pieceId)) return;
    dispatch({ type: 'PIECE_TAPPED', pieceId });
    if (dims) pieceDimsRef.current[pieceId] = dims;
    setTimeout(() => onTargetTapped(pieceId, dims), 0); // após o render, toca o alvo correto → snap → commit
  }), [onTargetTapped]);
  const devFlash = useCallback((kind, targetId) => guard(() => {
    if (kind === 'success') {
      const t = targetsRef.current.find((x) => x.id === targetId);
      const eid = successEventIdRef.current + 1; successEventIdRef.current = eid;
      setFx((f) => ({ ...f, lastEffect: 'success' }));
      setSuccessEvent({ successEventId: eid, interactionId: -1, pieceId: targetId, targetId, centerX: t ? t.cx : 0, centerY: t ? t.cy : 0, size: t ? Math.min(t.right - t.left, t.bottom - t.top) : 60, createdAt: eid });
    } else if (kind === 'error') setFx((f) => ({ ...f, wrongKey: f.wrongKey + 1, lastWrongTargetId: targetId ?? f.lastWrongTargetId, lastEffect: 'error' }));
  }), []);

  // Invariante do handoff (M1R7): NUNCA um frame com overlay E peça fixa invisíveis.
  const placedVisualVisible = state.placedPieceIds.length > 0 || activeId != null;
  const handoffInvariant = overlayShown || placedVisualVisible;

  // Invariante do efeito de acerto (M1R8A): 1 efeito por commit.
  const successOk = successCommitRef.current === successEffectRef.current;

  const diagnostics = useMemo(() => ({
    engineVersion: MONTE_A_CENA_ENGINE_VERSION, premiumVersion: MONTE_A_CENA_PREMIUM_VERSION,
    gestureRuntime: PUZZLE_GESTURE_RUNTIME, runtime: PUZZLE_GESTURE_RUNTIME, safeMode: PUZZLE_ENGINE_SAFE_MODE,
    machineState: state.status, interactionId: state.interactionId,
    selectedPieceId: state.selectedPieceId, activePieceId: activeId,
    placedPieceIds: state.placedPieceIds, lastEvent: state.lastCommand,
    lastHitResult: state.hitResult, lastTargetId: state.lastTargetId, lastSound: state.lastSound,
    lastEffect: fx.lastEffect, snapDuration: SNAP_DUR, returnDuration: RETURN_DUR, cancelDuration: CANCEL_DUR,
    overlayVisible: overlayShown, placedVisualVisible, handoffReady, handoffInvariant,
    // M1R8A — efeito de acerto: contadores e último evento (invariante commit===effect)
    successfulCommitCount: successCommitRef.current, successEffectCount: successEffectRef.current,
    lastSuccessEventId: successEvent ? successEvent.successEventId : 0,
    lastSuccessPieceId: successEvent ? successEvent.pieceId : null,
    lastSuccessTargetId: successEvent ? successEvent.targetId : null, successOk,
    guideOpacity, hintLevel, reduceMotion: !!reduceMotion, ...diag,
  }), [state, activeId, diag, fx.lastEffect, SNAP_DUR, RETURN_DUR, CANCEL_DUR, overlayShown, placedVisualVisible, handoffReady, handoffInvariant, successEvent, successOk, guideOpacity, hintLevel, reduceMotion]);

  return {
    state, activeId, phase: state.status, placedPieceIds: state.placedPieceIds, selectedPieceId: state.selectedPieceId,
    overlayStyle, setGeometry, setTrayScale, makePieceGesture, onTargetTapped, onEmptyAreaTapped,
    revealArtwork, showActions, reset, diagnostics,
    // M1R7: mensagens controladas + estado do handoff observável pela tela
    guidance, guidanceTone, hintTargetId, hintLevel, fx,
    overlayShown, placedVisualVisible, handoffReady,
    // M1R8A: evento de sucesso único por encaixe (a tela renderiza o efeito com key=successEventId)
    successEvent,
    snapDuration: SNAP_DUR, returnDuration: RETURN_DUR, cancelDuration: CANCEL_DUR,
    // modo criador
    devForcePlace, devFlash,
    engineVersion: MONTE_A_CENA_ENGINE_VERSION, runtime: PUZZLE_GESTURE_RUNTIME, safeMode: PUZZLE_ENGINE_SAFE_MODE,
    dispatch,
  };
}

export default usePuzzleEngine;
