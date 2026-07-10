/**
 * CadeAOvelhinhaScreen — "Cadê a Ovelhinha?" (2.2d duplo buffer + card do alvo).
 *
 * ── Enquadramento (2.2d) ──────────────────────────────────────────────────────
 * O background é desenhado num RETÂNGULO EXPLÍCITO (contentRect: left/top/width/height),
 * não em absoluteFill+contain. Como o retângulo já tem a proporção exata da arte, a imagem
 * o preenche por inteiro (resizeMode="stretch") — sem cover, sem zoom, sem transform, sem
 * corte. A auditoria perceptual (scripts/audit-ovelha-backgrounds.js) prova que o WebP
 * processado contém o quadro completo; o recorte anterior era da árvore de render.
 *
 * ── Duplo buffer (2.2d) ───────────────────────────────────────────────────────
 * Duas camadas COMPLETAS (activeLayer + stagingLayer), cada uma com background + ovelha
 * REAIS montados desde o início (sem loader 1×1). A staging só é revelada quando as duas
 * imagens reais terminam `onLoadEnd` (mesmo roundId) e passam 2 requestAnimationFrame. A
 * troca é um cross-fade das duas camadas (bg e ovelha juntos); a active nunca é desmontada
 * antes da staging estar pronta. Lógica pura e testável em services/ovelhaTransition.
 *
 * ── Card do alvo (2.2d) ───────────────────────────────────────────────────────
 * Antes de cada rodada, um card "Encontre esta ovelhinha!" mostra a POSE que será
 * procurada (coleira/sino visíveis) enquanto a staging prepara; some só quando a cena nova
 * está realmente pronta. Durante a busca, o HUD mostra um retrato pequeno da mesma pose.
 *
 * A rota só existe sob o gate interno; o card fica "Em teste". Ferramentas dev
 * (OVELHA_DEBUG_HITBOX / OVELHA_DEBUG_FRAME / OVELHA_CALIBRACAO) são SEMPRE false em produção.
 * Preservado: máquina, 5 rodadas, persistência, teto compartilhado, anti-spam de dica.
 */
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  View, Text, Image, Animated, Pressable, AppState, StyleSheet, useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Asset } from 'expo-asset';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import FaithIcon from '../components/ui/FaithIcon';
import { BeniGuideBubble } from '../components/beni';
import { ROUTES } from '../constants/routes';
import { isPremiumUser } from '../services/accessControl';
import { addBonusStars } from '../services/postStoryStorage';
import { useProgressContext } from '../context/ProgressContext';
import { getDailyRounds, consumeRound, toDayKey } from '../services/brincarDailyService';
import { readStats, recordOvelhaResult } from '../services/brincarStatsService';
import { playGameSfx, preloadGameSfx, releaseGameSfx } from '../services/audioManager';
import { warn } from '../utils/logger';
import { OVELHA_BENI } from '../data/ovelhaSceneData';
import { getScene, OVELHA_SCENES } from '../data/ovelhaScenes';
import {
  buildRoundFromSpot, roundValido, planPartida, computeViewport, contentRect, artToPx, pxToArt,
  spriteBoxArt, visibleBoxArt, hitboxPxRect, toqueAcertou, celulaToque, erroElegivel,
  nivelDica, estagioDica, MISS_ID, OVELHA_ROUNDS, OVELHA_SOUND_EVENTS, OVELHA_ART_W, OVELHA_ART_H,
} from '../services/ovelhaGameService';
import {
  transitionReducer, initialTransition, stagingPronta, podeCrossfade, inputBloqueado, mostrandoAlvo, TFASE,
} from '../services/ovelhaTransition';
import {
  FASES, criarJogo, iniciarRodada, cenaPronta, tocar, liberarErro, avancar, encerrar,
} from '../services/ovelhaGameMachine';

/** Assets REAIS: backgrounds WebP processados; ovelhas recortadas por alpha bbox. */
const OVELHA_BG = {
  warehouse_01: require('../../assets/games/cade_a_ovelhinha/backgrounds/processed/warehouse_01.webp'),
  farm_01: require('../../assets/games/cade_a_ovelhinha/backgrounds/processed/farm_01.webp'),
};
const OVELHA_POSE_IMG = {
  front: require('../../assets/games/cade_a_ovelhinha/sheep/processed/sheep_front.png'),
  peekLeft: require('../../assets/games/cade_a_ovelhinha/sheep/processed/sheep_peek_left.png'),
  peekRight: require('../../assets/games/cade_a_ovelhinha/sheep/processed/sheep_peek_right.png'),
};

/**
 * Pré-carrega os 5 assets do jogo (2 backgrounds + 3 poses) via expo-asset (sem dep nova).
 * Idempotente e resiliente. A staging só usa assets já resolvidos.
 */
const OVELHA_ASSET_MODULES = [...Object.values(OVELHA_BG), ...Object.values(OVELHA_POSE_IMG)];
let ovelhaPreloadPromise = null;
function preloadOvelhaAssets() {
  if (ovelhaPreloadPromise) return ovelhaPreloadPromise;
  ovelhaPreloadPromise = Promise.allSettled(
    OVELHA_ASSET_MODULES.map((m) => Asset.fromModule(m).downloadAsync()),
  ).then(() => true).catch(() => true);
  return ovelhaPreloadPromise;
}

/**
 * Ferramentas internas. SEMPRE `false` em produção.
 *   OVELHA_DEBUG_HITBOX  — overlay: sprite box, hitbox, clip, ids, pose, escala.
 *   OVELHA_DEBUG_FRAME   — overlay: borda do viewport + contentRect + cantos da arte + dims.
 *   OVELHA_CALIBRACAO    — navega/ajusta esconderijos sem consumir rodada/salvar.
 */
const OVELHA_DEBUG_HITBOX = false;
const OVELHA_DEBUG_FRAME = false;
const OVELHA_CALIBRACAO = false;

/** Tempos (ms). */
const T = { acerto: 720, erro: 460, xfade: 260, previewMin: 1200 };

/** Passos da calibração (dev). */
const CALIB_PASSO_XY = 6;
const CALIB_PASSO_ESC = 0.005;

const clampEsc = (v) => Math.max(0.06, Math.min(0.18, v));
const wrap = (i, n) => ((i % n) + n) % n;
const CALIB_SPOTS = OVELHA_SCENES.flatMap((sc) => sc.hidingSpots.map((sp) => ({ sceneId: sc.id, spot: sp })));

function vibrar() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* segue */ }
}

/* ══════════════════════════ TELA ══════════════════════════ */

export default function CadeAOvelhinhaScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const progressCtx = useProgressContext();
  const refreshProgress = progressCtx?.refreshProgress;
  const premium = isPremiumUser();

  const [tela, setTela] = useState('entrada');
  const [rounds, setRounds] = useState(null);
  const [stats, setStats] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [pausado, setPausado] = useState(false);

  const [vista, setVista] = useState(() => criarJogo({ rounds: OVELHA_ROUNDS }));
  const [tstate, dispatch] = useReducer(transitionReducer, undefined, initialTransition);
  const [nivel, setNivel] = useState(0);
  const [ripple, setRipple] = useState(null);
  const [errouAgora, setErrouAgora] = useState(false);
  const [areaVersion, setAreaVersion] = useState(0);
  const [calibSel, setCalibSel] = useState(null);

  const jogoRef = useRef(vista);
  const roundIdRef = useRef(0);
  const planoRef = useRef([]);
  const calibIdxRef = useRef(0);
  const salvoRef = useRef(false);
  const timeouts = useRef([]);
  const rafs = useRef([]);
  const montado = useRef(true);
  const areaRef = useRef({ largura: 0, altura: 0 });
  const transSeqRef = useRef(0);
  const xfadeRef = useRef(false);       // evita reanimar o mesmo cross-fade
  // Cross-fade das duas camadas:
  const opAtiva = useRef(new Animated.Value(1)).current;
  const opStaging = useRef(new Animated.Value(0)).current;
  // Dica — tudo por rodada (nada vaza):
  const buscaMsRef = useRef(0);
  const nivelRef = useRef(0);
  const erroElegivelRef = useRef(0);
  const ultimoErroIdRef = useRef(null);
  const ultimoErroMsRef = useRef(0);
  const rodadaSeqRef = useRef(0);
  const fn = useRef({});

  const viewport = useMemo(
    () => computeViewport({
      largura: areaRef.current.largura || Math.min(width - 20, 560),
      altura: areaRef.current.altura || 9999,
    }),
    [width, areaVersion, tela],
  );

  /* ── Timers e rAF centralizados ── */
  const agendar = useCallback((cb, ms) => {
    const id = setTimeout(() => {
      timeouts.current = timeouts.current.filter((x) => x !== id);
      if (montado.current) cb();
    }, ms);
    timeouts.current.push(id);
    return id;
  }, []);
  const limparTimers = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    rafs.current.forEach((id) => cancelAnimationFrame(id));
    rafs.current = [];
  }, []);

  const resetarDica = useCallback(() => {
    buscaMsRef.current = 0;
    nivelRef.current = 0;
    erroElegivelRef.current = 0;
    ultimoErroIdRef.current = null;
    ultimoErroMsRef.current = 0;
    if (montado.current) setNivel(0);
  }, []);

  const aplicarNivel = useCallback((elapsedMs, errosElegiveis) => {
    const n = nivelDica(elapsedMs, errosElegiveis);
    if (n > nivelRef.current) { nivelRef.current = n; if (montado.current) setNivel(n); }
  }, []);

  const executar = useCallback((efeitos) => {
    for (const e of efeitos) {
      switch (e) {
        case 'somAcerto': playGameSfx(OVELHA_SOUND_EVENTS.ACERTO); break;
        case 'somErro': playGameSfx(OVELHA_SOUND_EVENTS.ERRO); break;
        case 'somTroca': playGameSfx(OVELHA_SOUND_EVENTS.TROCA); break;
        case 'vibrarAcerto': vibrar(); break;
        case 'agendarLiberarErro': fn.current.agendar(() => fn.current.aplicar(liberarErro), T.erro); break;
        case 'agendarProximaRodada': fn.current.agendar(() => fn.current.aplicar(avancar), T.acerto); break;
        case 'finalizarPartida': fn.current.finalizar(); break;
        default: break;
      }
    }
  }, []);

  const aplicar = useCallback((transicao, ...args) => {
    const r = transicao(jogoRef.current, ...args);
    jogoRef.current = r.estado;
    if (montado.current) setVista(r.estado);
    if (r.estado.fase !== FASES.PROCURANDO) resetarDica();
    if (r.efeitos?.length) executar(r.efeitos);
    return r;
  }, [executar, resetarDica]);

  /* ── Prepara a próxima rodada: máquina + card do alvo + staging (invisível). ── */
  const prepararRodada = useCallback((round) => {
    const iniciou = aplicar(iniciarRodada, { targetId: round.targetId, itemIds: [round.targetId, MISS_ID] });
    if (!iniciou.aceito) return;
    const seq = (transSeqRef.current += 1);
    xfadeRef.current = false;
    opStaging.setValue(0);                 // staging entra invisível
    dispatch({ type: 'PREPARAR', round, seq });
    agendar(() => dispatch({ type: 'PREVIEW_MIN', seq }), T.previewMin);
  }, [aplicar, agendar, opStaging]);

  /* ── Monta a rodada seguindo o PLANO determinístico. ── */
  const buildRoundParaRodada = useCallback((rodada1based) => {
    const plano = planoRef.current;
    if (!plano.length) return null;
    const entry = plano[(rodada1based - 1) % plano.length] || plano[0];
    const scene = getScene(entry.sceneId);
    const spot = scene.hidingSpots.find((s) => s.id === entry.spotId) || scene.hidingSpots[0];
    roundIdRef.current += 1;
    const r = buildRoundFromSpot({ scene, spot, roundId: roundIdRef.current });
    if (!r || !roundValido(r, 'facil')) { warn('CadeAOvelhinha: rodada inválida (contrato).'); return null; }
    return r;
  }, []);

  /* ── Fim da partida: salva UMA vez. Nunca em CALIBRAÇÃO. ── */
  const finalizar = useCallback(async () => {
    if (OVELHA_CALIBRACAO || salvoRef.current) return;
    salvoRef.current = true;
    limparTimers();
    resetarDica();
    playGameSfx(OVELHA_SOUND_EVENTS.VITORIA);
    const g = jogoRef.current;
    let r = { stats: null, isBest: false, starAwarded: false };
    try {
      const day = toDayKey(new Date());
      r = await recordOvelhaResult({ dificuldade: 'facil', day, encontradas: g.encontradas, sequencia: g.bestSequencia });
      if (r.starAwarded) { await addBonusStars(1); await refreshProgress?.(); }
    } catch (e) {
      warn('CadeAOvelhinha.finalizar:', e);
    }
    if (!montado.current) return;
    if (r.stats) setStats(r.stats);
    setResultado({ encontradas: g.encontradas, bestSequencia: g.bestSequencia, isBest: r.isBest, starAwarded: r.starAwarded });
    setTela('resultado');
  }, [refreshProgress, limparTimers, resetarDica]);

  fn.current = { aplicar, agendar, finalizar, aplicarNivel };

  /* ── Ciclo de vida ── */
  useEffect(() => {
    montado.current = true;
    preloadGameSfx();
    preloadOvelhaAssets();
    let vivo = true;
    getDailyRounds().then((r) => vivo && setRounds(r)).catch((e) => warn('CadeAOvelhinha.rounds:', e));
    readStats().then((s) => vivo && setStats(s)).catch((e) => warn('CadeAOvelhinha.stats:', e));
    return () => { vivo = false; montado.current = false; transSeqRef.current += 1; limparTimers(); releaseGameSfx(); };
  }, [limparTimers]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (e) => setPausado(e !== 'active'));
    const off = navigation.addListener('blur', () => setPausado(true));
    const on = navigation.addListener('focus', () => setPausado(AppState.currentState !== 'active'));
    return () => { sub.remove(); off(); on(); };
  }, [navigation]);

  const jogando = tela === 'jogando';
  const procurando = jogando && vista.fase === FASES.PROCURANDO && tstate.fase === TFASE.ACTIVE;

  /* ── Controlador de dica (por rodada; usa erro ELEGÍVEL, não o cumulativo) ── */
  useEffect(() => {
    if (!procurando || pausado) return undefined;
    const seq = rodadaSeqRef.current;
    let ultimo = Date.now();
    const t = setInterval(() => {
      if (rodadaSeqRef.current !== seq) return;
      const agora = Date.now();
      buscaMsRef.current += agora - ultimo;
      ultimo = agora;
      fn.current.aplicarNivel?.(buscaMsRef.current, erroElegivelRef.current);
    }, 500);
    return () => clearInterval(t);
  }, [procurando, pausado]);

  /* ── Dispara a preparação da rodada quando a máquina entra em TROCANDO. ── */
  useEffect(() => {
    if (!jogando || OVELHA_CALIBRACAO) return;
    if (vista.fase !== FASES.TROCANDO) return;
    if (jogoRef.current.fase !== FASES.TROCANDO) return;
    const r = buildRoundParaRodada(vista.rodada);
    if (r) prepararRodada(r);
  }, [jogando, vista.fase, vista.rodada, buildRoundParaRodada, prepararRodada]);

  /* ── Staging: após bg REAL + ovelha REAL carregarem, esperar 2 frames. ── */
  useEffect(() => {
    if (!tstate.stagingRound || !tstate.bgLoaded || !tstate.poseLoaded || tstate.framesReady) return undefined;
    const seq = tstate.seq;
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => {
        if (montado.current) dispatch({ type: 'FRAMES_PRONTOS', seq });
      });
      rafs.current.push(r2);
    });
    rafs.current.push(r1);
    return undefined;
  }, [tstate.stagingRound, tstate.bgLoaded, tstate.poseLoaded, tstate.framesReady, tstate.seq]);

  /* ── Quando a staging fica pronta e o card cumpriu o tempo, inicia o cross-fade. ── */
  useEffect(() => {
    if (podeCrossfade(tstate)) dispatch({ type: 'CROSSFADE', seq: tstate.seq });
  }, [tstate]);

  /* ── Cross-fade: bg e ovelha entram JUNTOS; promove e libera o input ao final. ── */
  useEffect(() => {
    if (tstate.fase !== TFASE.CROSSFADE || xfadeRef.current) return undefined;
    xfadeRef.current = true;
    const seq = tstate.seq;
    const a = Animated.parallel([
      Animated.timing(opAtiva, { toValue: 0, duration: T.xfade, useNativeDriver: true }),
      Animated.timing(opStaging, { toValue: 1, duration: T.xfade, useNativeDriver: true }),
    ]);
    a.start(({ finished }) => {
      if (!finished || !montado.current) return;
      opAtiva.setValue(1); opStaging.setValue(0);      // a camada promovida (mesma key) segue em 1
      dispatch({ type: 'PROMOVER', seq });
      fn.current.aplicar(cenaPronta);                  // ENTRANDO → PROCURANDO (libera input)
      rodadaSeqRef.current += 1;
      resetarDica();
      setRipple(null);
    });
    return () => a.stop();
  }, [tstate.fase, tstate.seq, opAtiva, opStaging, resetarDica]);

  /* ── Começar. Em CALIBRAÇÃO não consome rodada nem sorteia. ── */
  const comecar = useCallback(async () => {
    if (!OVELHA_CALIBRACAO) {
      const r = await consumeRound();
      if (!r.ok) { setRounds(await getDailyRounds()); setTela('entrada'); return; }
    }
    await preloadOvelhaAssets();
    if (!montado.current) return;
    limparTimers();
    resetarDica();
    salvoRef.current = false;
    transSeqRef.current += 1;
    xfadeRef.current = false;
    opAtiva.setValue(1); opStaging.setValue(0);
    dispatch({ type: 'RESET' });
    planoRef.current = planPartida({ rounds: OVELHA_ROUNDS, rnd: Math.random });
    calibIdxRef.current = 0;
    jogoRef.current = criarJogo({ rounds: OVELHA_ROUNDS });
    setVista(jogoRef.current);
    setResultado(null);
    setRipple(null);
    setPausado(AppState.currentState !== 'active');
    if (OVELHA_CALIBRACAO) setCalibSel({ sceneId: CALIB_SPOTS[0].sceneId, spot: { ...CALIB_SPOTS[0].spot, pos: { ...CALIB_SPOTS[0].spot.pos } } });
    setTela('jogando');
    if (!OVELHA_CALIBRACAO) setRounds(await getDailyRounds());
  }, [limparTimers, resetarDica, opAtiva, opStaging]);

  /* ── CALIBRAÇÃO: monta o esconderijo selecionado sem consumir rodada nem salvar. ── */
  useEffect(() => {
    if (!OVELHA_CALIBRACAO || tela !== 'jogando' || !calibSel) return;
    limparTimers();
    transSeqRef.current += 1;
    xfadeRef.current = false;
    opAtiva.setValue(1); opStaging.setValue(0);
    dispatch({ type: 'RESET' });
    jogoRef.current = criarJogo({ rounds: OVELHA_ROUNDS });
    setVista(jogoRef.current);
    const scene = getScene(calibSel.sceneId);
    roundIdRef.current += 1;
    const r = buildRoundFromSpot({ scene, spot: calibSel.spot, roundId: roundIdRef.current });
    if (r) prepararRodada(r);
  }, [calibSel, tela, limparTimers, opAtiva, opStaging, prepararRodada]);

  const calibNavegar = useCallback((delta) => {
    calibIdxRef.current = wrap(calibIdxRef.current + delta, CALIB_SPOTS.length);
    const base = CALIB_SPOTS[calibIdxRef.current];
    setCalibSel({ sceneId: base.sceneId, spot: { ...base.spot, pos: { ...base.spot.pos } } });
  }, []);
  const calibNudge = useCallback((campo, delta) => {
    setCalibSel((prev) => {
      if (!prev) return prev;
      const sp = { ...prev.spot, pos: { ...prev.spot.pos } };
      if (campo === 'x') sp.pos.x = Math.max(0, Math.min(OVELHA_ART_W, sp.pos.x + delta));
      if (campo === 'y') sp.pos.y = Math.max(0, Math.min(OVELHA_ART_H, sp.pos.y + delta));
      if (campo === 'e') sp.escala = clampEsc(Math.round((sp.escala + delta) * 1000) / 1000);
      return { ...prev, spot: sp };
    });
  }, []);
  const calibPose = useCallback(() => {
    setCalibSel((prev) => {
      if (!prev) return prev;
      const ordem = ['peekLeft', 'peekRight'];
      const prox = ordem[(ordem.indexOf(prev.spot.pose) + 1) % ordem.length];
      const sp = { ...prev.spot, pos: { ...prev.spot.pos }, pose: prox, modo: 'PEEK' };
      sp.clip = { side: prox === 'peekLeft' ? 'right' : 'left', visibleFraction: 0.6 };
      return { ...prev, spot: sp };
    });
  }, []);

  const abandonar = useCallback(() => {
    limparTimers(); transSeqRef.current += 1; resetarDica(); aplicar(encerrar); setTela('entrada');
  }, [aplicar, limparTimers, resetarDica]);

  /* ── Toque na CENA inteira: só com a rodada ativa e input liberado. ── */
  const activeRound = tstate.activeRound;
  const stagingRound = tstate.stagingRound;
  const scene = getScene(activeRound?.sceneId);
  const tocarCena = useCallback((e) => {
    if (pausado || inputBloqueado(tstate) || !activeRound) return;
    const { locationX: px, locationY: py } = e?.nativeEvent ?? {};
    if (OVELHA_CALIBRACAO) { setRipple({ key: `${Date.now()}`, x: px, y: py }); return; }
    const acertou = toqueAcertou(px, py, activeRound.spot, scene, viewport);
    const r = aplicar(tocar, acertou ? activeRound.targetId : MISS_ID);
    if (r.aceito && r.acerto === false) {
      setRipple({ key: `${Date.now()}`, x: px, y: py });
      setErrouAgora(true);
      agendar(() => montado.current && setErrouAgora(false), T.erro);
      const artPt = pxToArt(px, py, scene, viewport);
      const cel = celulaToque(artPt, scene);
      const agora = Date.now();
      if (erroElegivel({ id: cel, ultimoId: ultimoErroIdRef.current, agoraMs: agora, ultimoMs: ultimoErroMsRef.current })) {
        erroElegivelRef.current += 1;
        ultimoErroMsRef.current = agora;
      }
      ultimoErroIdRef.current = cel;
      aplicarNivel(buscaMsRef.current, erroElegivelRef.current);
    }
  }, [aplicar, agendar, pausado, tstate, activeRound, scene, viewport, aplicarNivel]);

  const medirArea = useCallback((e) => {
    const { width: w, height: h } = e?.nativeEvent?.layout ?? {};
    if (!w || !h) return;
    const mudou = Math.abs(areaRef.current.largura - w) > 1 || Math.abs(areaRef.current.altura - h) > 1;
    areaRef.current = { largura: w, altura: h };
    if (mudou) setAreaVersion((v) => v + 1);
  }, []);

  const semRodadas = !premium && rounds != null && rounds.remaining <= 0;
  const mensagem = pausado
    ? 'Joguinho pausado. Volte quando quiser!'
    : errouAgora ? OVELHA_BENI.erro
      : nivel >= 1 ? OVELHA_BENI.incentivo
        : OVELHA_BENI.procurando;

  const estagio = procurando && !pausado ? estagioDica(nivel) : 0;
  const posePreview = stagingRound?.pose || activeRound?.pose || 'front';

  /* ══════════════ ENTRADA ══════════════ */
  if (tela === 'entrada') {
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => navigation.goBack()} />
        <View style={styles.entradaWrap}>
          <View style={styles.painel}>
            <BeniGuideBubble message={OVELHA_BENI.entrada} avatarVariant="teaching" tone="purple" compact />
            <Text style={styles.explica}>
              A ovelhinha se escondeu na paisagem. Antes de cada rodada eu mostro qual procurar — são 5!
            </Text>
          </View>
          {!premium && (
            <View style={styles.pill}>
              <FaithIcon name="star" size={14} color={pt.goldDeep} />
              <Text style={styles.pillText}>
                {rounds == null ? 'Preparando suas rodadas…'
                  : rounds.remaining > 0 ? `Você tem ${rounds.remaining} rodada${rounds.remaining === 1 ? '' : 's'} hoje.`
                    : 'As rodadas de hoje acabaram. Amanhã tem mais!'}
              </Text>
            </View>
          )}
          <View style={styles.difCard}>
            <View style={styles.difIconBg}><FaithIcon name="ovelha" size={22} color={pt.greenDeep} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.difTitulo}>Fácil</Text>
              <Text style={styles.difDesc}>Paisagem com esconderijos · 5 rodadas</Text>
            </View>
            <FaithIcon name="check" size={20} color={pt.greenDeep} />
          </View>
          {semRodadas ? (
            <View style={styles.convite}>
              <FaithIcon name="family" size={16} color="#7A5800" />
              <Text style={styles.conviteText}>{OVELHA_BENI.semRodadas}</Text>
            </View>
          ) : (
            <SoundButton style={styles.btnPrimario} onPress={comecar} activeOpacity={0.9} soundType="success">
              <Text style={styles.btnPrimarioText}>Começar a brincar</Text>
            </SoundButton>
          )}
        </View>
      </View>
    );
  }

  /* ══════════════ RESULTADO ══════════════ */
  if (tela === 'resultado') {
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => setTela('entrada')} />
        <View style={styles.entradaWrap}>
          <View style={styles.painel}>
            <BeniGuideBubble message={OVELHA_BENI.vitoria} avatarVariant="celebrating" tone="purple" compact />
          </View>
          <View style={styles.vitoriaCard}>
            <View style={styles.vitoriaIconBg}><FaithIcon name="ovelha" size={34} color={pt.greenDeep} /></View>
            <Text style={styles.destaque}>{resultado?.encontradas ?? 0}</Text>
            <Text style={styles.destaqueLabel}>
              {resultado?.encontradas === 1 ? 'ovelhinha encontrada' : 'ovelhinhas encontradas'}
            </Text>
            <View style={styles.statsRow}>
              <Stat label="Melhor sequência" valor={`${resultado?.bestSequencia ?? 0}`} />
            </View>
            {resultado?.isBest && (
              <View style={styles.faixaBoa}>
                <FaithIcon name="trophies" size={16} color="#0E5A3C" />
                <Text style={styles.faixaBoaText}>Nova melhor sequência!</Text>
              </View>
            )}
            <View style={resultado?.starAwarded ? styles.faixaEstrela : styles.faixaSuave}>
              <FaithIcon name="star" size={15} color={resultado?.starAwarded ? pt.goldDeep : pt.textSoft} />
              <Text style={resultado?.starAwarded ? styles.faixaEstrelaText : styles.faixaSuaveText}>
                {resultado?.starAwarded ? '+1 estrelinha!' : 'Você já ganhou as estrelinhas de hoje. Amanhã tem mais!'}
              </Text>
            </View>
          </View>
          <SoundButton style={styles.btnPrimario} onPress={comecar} activeOpacity={0.9} soundType="success">
            <FaithIcon name="restart" size={18} color="#FFF" />
            <Text style={styles.btnPrimarioText}>Jogar novamente</Text>
          </SoundButton>
          <SoundButton style={styles.btnTerciario} onPress={() => navigation.navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })} activeOpacity={0.9}>
            <Text style={styles.btnTerciarioText}>Voltar para Brincar</Text>
          </SoundButton>
        </View>
      </View>
    );
  }

  /* ══════════════ JOGANDO ══════════════ */
  return (
    <View style={styles.root}>
      <Header insets={insets} onBack={abandonar} chip="Em teste" />
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <FaithIcon name="ovelha" size={16} color={pt.textSoft} />
          <Text style={styles.hudText}>{vista.encontradas} de {vista.rounds}</Text>
        </View>
        {/* Retrato pequeno da ovelha a procurar. */}
        <View style={styles.hudRetrato}>
          <View style={styles.hudRetratoImg}><Image source={OVELHA_POSE_IMG[activeRound?.pose || posePreview]} style={styles.hudSheep} resizeMode="contain" /></View>
          <Text style={styles.hudRetratoLabel}>Procure esta</Text>
        </View>
        <Text style={styles.hudRodada}>Rodada {Math.min(vista.rodada, vista.rounds)}/{vista.rounds}</Text>
      </View>

      <Text style={styles.dica} numberOfLines={1}>{mensagem}</Text>

      <View style={[styles.cenaWrap, { paddingBottom: Math.max(insets.bottom, 8) + 4 }]} onLayout={medirArea}>
        <Pressable
          onPress={tocarCena}
          style={[styles.viewport, { width: viewport.w, height: viewport.h }]}
          accessibilityRole="button"
          accessibilityLabel="Procure a ovelhinha na paisagem"
        >
          {/* Camada ATIVA (o que está em jogo). */}
          {activeRound && (
            <SceneLayer
              key={`L-${activeRound.roundId}`}
              round={activeRound}
              scene={getScene(activeRound.sceneId)}
              viewport={viewport}
              opacity={opAtiva}
              encontrada={vista.fase === FASES.ACERTO}
              estagio={estagio}
              ripple={ripple}
              debugHitbox={OVELHA_DEBUG_HITBOX}
            />
          )}
          {/* Camada STAGING (próxima cena, montada com bg+ovelha REAIS, invisível). */}
          {stagingRound && (
            <SceneLayer
              key={`L-${stagingRound.roundId}`}
              round={stagingRound}
              scene={getScene(stagingRound.sceneId)}
              viewport={viewport}
              opacity={opStaging}
              staging
              seq={tstate.seq}
              onBgLoadEnd={(seq) => dispatch({ type: 'BG_CARREGADO', seq })}
              onPoseLoadEnd={(seq) => dispatch({ type: 'POSE_CARREGADA', seq })}
            />
          )}

          {OVELHA_DEBUG_FRAME && <FrameDebug scene={scene} viewport={viewport} />}

          {/* Card do alvo: cobre a cena enquanto a staging prepara. */}
          {mostrandoAlvo(tstate) && (
            <TargetCard
              pose={posePreview}
              rodada={Math.min(vista.rodada, vista.rounds)}
              total={vista.rounds}
              onProcurar={() => dispatch({ type: 'PREVIEW_MIN', seq: tstate.seq })}
            />
          )}
        </Pressable>

        {OVELHA_CALIBRACAO && calibSel && (
          <CalibBar sel={calibSel} onNav={calibNavegar} onPose={calibPose} onNudge={calibNudge} />
        )}
      </View>
    </View>
  );
}

/* ══════════════════════════ SCENE LAYER (camada completa) ══════════════════════════ */

/**
 * Uma camada COMPLETA: background (retângulo explícito do contentRect) + ovelha REAL (com
 * clip) + dica + ripple. Montada inteira desde o início (staging carrega ambas as imagens
 * reais e reporta onLoadEnd). A opacidade da camada é controlada pela tela (cross-fade).
 */
function SceneLayer({ round, scene, viewport, opacity, encontrada, estagio, ripple, debugHitbox, staging, seq, onBgLoadEnd, onPoseLoadEnd }) {
  const spot = round.spot;
  const cr = contentRect(scene, viewport);
  const s = cr.scale;
  const centro = artToPx(spot.pos, scene, viewport);
  const sb = spriteBoxArt(spot, scene);
  const vb = visibleBoxArt(spot, scene);
  const spW = sb.w * s;
  const spH = sb.h * s;
  const bg = OVELHA_BG[scene.background?.assetKey];
  const img = OVELHA_POSE_IMG[spot.pose] || OVELHA_POSE_IMG.front;
  const flip = spot.orientacao === 'flip';

  const clip = spot.clip;
  const clipW = (clip ? vb.w : sb.w) * s;
  const clipH = (clip ? vb.h : sb.h) * s;
  const clipLeft = cr.x + vb.cx * s - clipW / 2;
  const clipTop = cr.y + vb.cy * s - clipH / 2;
  const spriteLeft = cr.x + sb.cx * s - spW / 2;
  const spriteTop = cr.y + sb.cy * s - spH / 2;
  const offX = spriteLeft - clipLeft;
  const offY = spriteTop - clipTop;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      {/* 0 — background REAL no RETÂNGULO EXPLÍCITO (contentRect). Preenche o retângulo, que
             já tem a proporção exata da arte → imagem inteira, sem cover/zoom/transform. */}
      {bg
        ? <Image
            source={bg}
            style={{ position: 'absolute', left: cr.x, top: cr.y, width: cr.w, height: cr.h }}
            resizeMode="stretch"
            onLoadEnd={staging ? () => onBgLoadEnd?.(seq) : undefined}
          />
        : <View style={[styles.bgFallback, { position: 'absolute', left: cr.x, top: cr.y, width: cr.w, height: cr.h }]} />}

      {estagio >= 3 && <BrilhoRegiao cx={centro.px} cy={centro.py} r={Math.min(spW, spH) * 0.55} />}

      {/* 2 — ovelha REAL, recortada pela janela de clip. Montada desde o início. */}
      <Animated.View
        style={{ position: 'absolute', left: clipLeft, top: clipTop, width: clipW, height: clipH, overflow: 'hidden', zIndex: 2 }}
      >
        <SheepImage img={img} offX={offX} offY={offY} spW={spW} spH={spH} flip={flip} encontrada={encontrada}
          onLoadEnd={staging ? () => onPoseLoadEnd?.(seq) : undefined} />
      </Animated.View>

      {estagio >= 4 && <ContornoVisivel cx={cr.x + vb.cx * s} cy={cr.y + vb.cy * s} w={clipW} h={clipH} />}

      {ripple && <TouchRipple key={ripple.key} x={ripple.x} y={ripple.y} />}

      {debugHitbox && <HitboxDebug round={round} scene={scene} viewport={viewport} centro={centro} spW={spW} spH={spH} clipLeft={clipLeft} clipTop={clipTop} clipW={clipW} clipH={clipH} />}
    </Animated.View>
  );
}

function SheepImage({ img, offX, offY, spW, spH, flip, encontrada, onLoadEnd }) {
  const pop = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!encontrada) return undefined;
    const a = Animated.sequence([
      Animated.timing(pop, { toValue: 1.18, duration: 160, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]);
    a.start(); return () => a.stop();
  }, [encontrada, pop]);
  return (
    <Animated.Image
      source={img}
      resizeMode="contain"
      onLoadEnd={onLoadEnd}
      style={{ position: 'absolute', left: offX, top: offY, width: spW, height: spH, transform: [{ scaleX: flip ? -1 : 1 }, { scale: pop }] }}
    />
  );
}

/** Brilho discreto (estágio 3) — halo suave e PEQUENO, atrás da ovelha. */
function BrilhoRegiao({ cx, cy, r }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(p, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]));
    a.start(); return () => a.stop();
  }, [p]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: r, zIndex: 1, backgroundColor: pt.gold, opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] }) }}
    />
  );
}

/** Contorno na parte visível (estágio 4) — arco fino tracejado no topo. */
function ContornoVisivel({ cx, cy, w, h }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(p, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]));
    a.start(); return () => a.stop();
  }, [p]);
  const d = Math.min(w, h) * 1.02;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: cx - d / 2, top: cy - d / 2, width: d, height: d, zIndex: 4, opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] }) }}>
      <Svg width={d} height={d} viewBox="0 0 100 100">
        <Path d="M12,52 A38,38 0 0 1 88,52" stroke={pt.goldDeep} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="6 6" />
      </Svg>
    </Animated.View>
  );
}

/** Ripple de erro no ponto tocado. */
function TouchRipple({ x, y }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(p, { toValue: 1, duration: 420, useNativeDriver: true });
    a.start(); return () => a.stop();
  }, [p]);
  const d = 54;
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: d / 2, borderWidth: 3, borderColor: '#E8A33D', zIndex: 5,
        opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.3] }) }] }}
    />
  );
}

/* ══════════════════════════ CARD DO ALVO + HUD ══════════════════════════ */

/** Card "Encontre esta ovelhinha!" — mostra a pose que será procurada, fundo neutro. */
function TargetCard({ pose, rodada, total, onProcurar }) {
  const ent = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.spring(ent, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true });
    a.start(); return () => a.stop();
  }, [ent]);
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.cardOverlay, { opacity: ent }]}
      accessibilityRole="alert"
    >
      <Animated.View style={[styles.cardBox, { transform: [{ scale: ent.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
        <Text style={styles.cardTitulo}>Encontre esta ovelhinha!</Text>
        <View style={styles.cardSheepBg}>
          <Image source={OVELHA_POSE_IMG[pose] || OVELHA_POSE_IMG.front} style={styles.cardSheep} resizeMode="contain" />
        </View>
        <Text style={styles.cardRodada}>Rodada {rodada} de {total}</Text>
        <SoundButton style={styles.cardBtn} onPress={onProcurar} activeOpacity={0.9} soundType="success">
          <Text style={styles.cardBtnText}>Procurar</Text>
        </SoundButton>
      </Animated.View>
    </Animated.View>
  );
}

/** Overlay de diagnóstico do ENQUADRAMENTO: viewport, contentRect, cantos da arte, dims. */
function FrameDebug({ scene, viewport, }) {
  const cr = contentRect(scene, viewport);
  const cantos = [
    artToPx({ x: 0, y: 0 }, scene, viewport),
    artToPx({ x: scene.designWidth, y: 0 }, scene, viewport),
    artToPx({ x: 0, y: scene.designHeight }, scene, viewport),
    artToPx({ x: scene.designWidth, y: scene.designHeight }, scene, viewport),
  ];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={{ position: 'absolute', left: 0, top: 0, width: viewport.w, height: viewport.h, borderWidth: 1, borderColor: '#E11D48', zIndex: 7 }} />
      <View style={{ position: 'absolute', left: cr.x, top: cr.y, width: cr.w, height: cr.h, borderWidth: 1, borderColor: '#2563EB', zIndex: 7 }} />
      {cantos.map((c, i) => (
        <View key={i} style={{ position: 'absolute', left: c.px - 5, top: c.py - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#16A34A', zIndex: 8 }} />
      ))}
      <View style={{ position: 'absolute', top: 4, left: 6, zIndex: 8 }}>
        <Text style={styles.debugTxt}>vp {viewport.w}×{viewport.h} · cr {Math.round(cr.w)}×{Math.round(cr.h)} @ {Math.round(cr.x)},{Math.round(cr.y)} · art {scene.designWidth}×{scene.designHeight}</Text>
      </View>
    </View>
  );
}

/** Overlay de diagnóstico da HITBOX (dev). */
function HitboxDebug({ round, scene, viewport, centro, spW, spH, clipLeft, clipTop, clipW, clipH }) {
  const hb = hitboxPxRect(round.spot, scene, viewport);
  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', left: centro.px - spW / 2, top: centro.py - spH / 2, width: spW, height: spH, borderWidth: 1, borderColor: '#3B82F6', zIndex: 6 }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: clipLeft, top: clipTop, width: clipW, height: clipH, borderWidth: 1, borderColor: '#7C3AED', zIndex: 6 }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: hb.x0, top: hb.y0, width: hb.w, height: hb.h, borderWidth: 1.5, borderColor: '#0E9F6E', zIndex: 6 }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 4, left: 6, zIndex: 6 }}>
        <Text style={styles.debugTxt}>{round.sceneId} · {round.spot.id} · {round.pose} · e{round.spot.escala} · {round.modo}</Text>
      </View>
    </>
  );
}

/* ══════════════════════════ CALIBRAÇÃO (dev) ══════════════════════════ */

function CalibBar({ sel, onNav, onPose, onNudge }) {
  const sp = sel.spot;
  const xN = (sp.pos.x / OVELHA_ART_W).toFixed(3);
  const yN = (sp.pos.y / OVELHA_ART_H).toFixed(3);
  const side = sp.clip ? sp.clip.side : '—';
  return (
    <View style={styles.calibWrap} pointerEvents="box-none">
      <View style={styles.calibRow}>
        <SoundButton style={styles.calibBtn} onPress={() => onNav(-1)} accessibilityLabel="Anterior"><Text style={styles.calibTxt}>‹</Text></SoundButton>
        <SoundButton style={styles.calibBtn} onPress={onPose} accessibilityLabel="Pose"><Text style={styles.calibMini}>{sp.pose}</Text></SoundButton>
        <SoundButton style={styles.calibBtn} onPress={() => onNav(1)} accessibilityLabel="Próximo"><Text style={styles.calibTxt}>›</Text></SoundButton>
      </View>
      <View style={styles.calibRow}>
        <SoundButton style={styles.calibBtn} onPress={() => onNudge('x', -CALIB_PASSO_XY)}><Text style={styles.calibMini}>x−</Text></SoundButton>
        <SoundButton style={styles.calibBtn} onPress={() => onNudge('x', CALIB_PASSO_XY)}><Text style={styles.calibMini}>x+</Text></SoundButton>
        <SoundButton style={styles.calibBtn} onPress={() => onNudge('y', -CALIB_PASSO_XY)}><Text style={styles.calibMini}>y−</Text></SoundButton>
        <SoundButton style={styles.calibBtn} onPress={() => onNudge('y', CALIB_PASSO_XY)}><Text style={styles.calibMini}>y+</Text></SoundButton>
        <SoundButton style={styles.calibBtn} onPress={() => onNudge('e', -CALIB_PASSO_ESC)}><Text style={styles.calibMini}>e−</Text></SoundButton>
        <SoundButton style={styles.calibBtn} onPress={() => onNudge('e', CALIB_PASSO_ESC)}><Text style={styles.calibMini}>e+</Text></SoundButton>
      </View>
      <Text style={styles.calibInfo}>{sel.sceneId} · {sp.id}</Text>
      <Text style={styles.calibInfo}>x {xN} · y {yN} · e {sp.escala.toFixed(3)} · side {side}</Text>
    </View>
  );
}

/* ══════════════════════════ PEÇAS ══════════════════════════ */

function Header({ insets, onBack, chip }) {
  return (
    <LinearGradient colors={['#EAF7EF', '#DDF0E6', '#E8F6EF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.headerRow}>
        <SoundButton style={styles.backPill} onPress={onBack} activeOpacity={0.85} accessibilityLabel="Voltar" accessibilityRole="button">
          <FaithIcon name="back" size={16} color={pt.greenDeep} />
        </SoundButton>
        <Text style={styles.headerTitle} numberOfLines={1}>Cadê a Ovelhinha?</Text>
        {chip ? <View style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View> : <View style={styles.chipVazio} />}
      </View>
    </LinearGradient>
  );
}

function Stat({ label, valor }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValor}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },

  header: { paddingHorizontal: 14, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backPill: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1, borderColor: 'rgba(14,159,110,0.18)' },
  headerTitle: { flex: 1, fontFamily: 'FredokaOne', fontSize: 20, color: pt.text },
  chip: { borderRadius: radii.pill, borderWidth: 1, borderColor: '#E8A33D80', backgroundColor: '#F7C9481F', paddingHorizontal: 11, paddingVertical: 5 },
  chipText: { fontFamily: 'FredokaOne', fontSize: 12, color: '#9A6A00' },
  chipVazio: { width: 0 },

  entradaWrap: { paddingHorizontal: 16, paddingTop: 12 },
  painel: { backgroundColor: '#F3FBF6', borderRadius: radii.xl, borderWidth: 1.5, borderColor: '#CDEBD9', padding: 12, ...shadows.card },
  explica: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19, marginTop: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: '#FFF', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 9, ...shadows.soft },
  pillText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: pt.text, fontWeight: '700' },
  difCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, padding: 12, backgroundColor: '#FFF', borderRadius: radii.lg, borderWidth: 1.5, borderColor: pt.greenDeep, ...shadows.soft },
  difIconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#DFF3E6', alignItems: 'center', justifyContent: 'center' },
  difTitulo: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  difDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 1 },
  btnPrimario: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 16, backgroundColor: pt.greenDeep, borderRadius: radii.lg, paddingVertical: 15, alignItems: 'center', ...shadows.card },
  btnPrimarioText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
  btnTerciario: { marginTop: 10, paddingVertical: 12, alignItems: 'center' },
  btnTerciarioText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.textSoft },
  convite: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, backgroundColor: pt.goldSoft, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: pt.gold + '66' },
  conviteText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: '#7A5800', fontWeight: '700', lineHeight: 17 },

  hud: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 5, backgroundColor: '#FFF' },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 66 },
  hudText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.text },
  hudRetrato: { alignItems: 'center' },
  hudRetratoImg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EAF7EF', borderWidth: 1, borderColor: '#CDEBD9', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  hudSheep: { width: 34, height: 34 },
  hudRetratoLabel: { fontFamily: 'Nunito', fontSize: 9, fontWeight: '800', color: pt.textSoft, marginTop: 1 },
  hudRodada: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft, minWidth: 66, textAlign: 'right' },
  dica: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', height: 22, lineHeight: 22, marginTop: 2 },

  cenaWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 10, paddingTop: 4 },
  viewport: { borderRadius: radii.xl, overflow: 'hidden', backgroundColor: '#EAF2F5', ...shadows.soft },
  bgFallback: { backgroundColor: '#DDEFF6' },
  debugTxt: { fontFamily: 'Nunito', fontSize: 9, color: '#C0392B', fontWeight: '800' },

  // ── Card do alvo ──
  cardOverlay: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(233,244,239,0.96)', zIndex: 10 },
  cardBox: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: radii.xl, paddingHorizontal: 22, paddingVertical: 18, ...shadows.card, borderWidth: 1.5, borderColor: '#CDEBD9' },
  cardTitulo: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center' },
  cardSheepBg: { width: 150, height: 150, borderRadius: 24, backgroundColor: '#F3FBF6', borderWidth: 1, borderColor: '#DDEFE4', alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  cardSheep: { width: 128, height: 128 },
  cardRodada: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft, marginBottom: 12 },
  cardBtn: { backgroundColor: pt.greenDeep, borderRadius: radii.lg, paddingHorizontal: 32, paddingVertical: 12, ...shadows.soft },
  cardBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },

  // ── Calibração (dev) ──
  calibWrap: { marginTop: 8, backgroundColor: '#FFF', borderRadius: radii.lg, paddingHorizontal: 8, paddingVertical: 8, alignItems: 'center', gap: 6, ...shadows.soft },
  calibRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calibBtn: { minWidth: 34, height: 34, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF7EF' },
  calibTxt: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.greenDeep, lineHeight: 22 },
  calibMini: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.greenDeep },
  calibInfo: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.textSoft },

  vitoriaCard: { marginTop: 12, backgroundColor: '#FFF', borderRadius: radii.xl, paddingVertical: 18, paddingHorizontal: 14, alignItems: 'center', ...shadows.card },
  vitoriaIconBg: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#DFF3E6', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  destaque: { fontFamily: 'FredokaOne', fontSize: 44, color: pt.text, lineHeight: 50 },
  destaqueLabel: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft, marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'center' },
  stat: { alignItems: 'center' },
  statValor: { fontFamily: 'FredokaOne', fontSize: 22, color: pt.text },
  statLabel: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, textAlign: 'center', marginTop: 1 },
  faixaBoa: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch', marginTop: 12, backgroundColor: '#DDF3E7', borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 9 },
  faixaBoaText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#0E5A3C' },
  faixaEstrela: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch', marginTop: 10, backgroundColor: pt.goldSoft, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 9 },
  faixaEstrelaText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#7A5800' },
  faixaSuave: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch', marginTop: 10, backgroundColor: '#F3EFE9', borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 9 },
  faixaSuaveText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, fontWeight: '700' },
});
