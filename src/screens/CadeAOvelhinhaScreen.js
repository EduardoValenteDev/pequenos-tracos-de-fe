/**
 * CadeAOvelhinhaScreen — "Cadê a Ovelhinha?" (2.1→2.2c enquadramento + transição atômica).
 *
 * ── Enquadramento correto (2.2c) ──────────────────────────────────────────────
 * O background aparece INTEIRO (CONTAIN, sem zoom/cover). O viewport tem a razão real da
 * arte (1122×1402); a imagem preenche esse viewport e qualquer folga mínima vira um
 * `contentRect` REAL. TODA conversão arte<->pixel (ovelha, hitbox, toque) passa pelo
 * contentRect — é o que alinha a ovelha ao que o olho vê.
 *
 * ── Transição atômica de rodada (2.2c) ────────────────────────────────────────
 * Dois estados: `activeRound` (o que está na tela) e `pendingRound` (o que está sendo
 * preparado). A troca é: bloqueia input → fade-out do SceneLayer atual → promove o
 * pendente (remonta o SceneLayer com KEY nova) → só quando `sceneReady` (background E pose
 * carregados para AQUELE roundId) a ovelha aparece e faz fade-in → libera input. A ovelha
 * nunca aparece sobre o background antigo, e não "anda" entre esconderijos.
 *
 * A rota só existe sob o gate interno; o card fica "Em teste". Ferramentas dev
 * (OVELHA_DEBUG_HITBOX / OVELHA_CALIBRACAO) são SEMPRE false em produção.
 *
 * Preservado: máquina de estados, 5 rodadas, persistência, teto compartilhado, salvamento
 * único, anti-spam + reset de dica por rodada, ciclo de vida.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  FASES, criarJogo, iniciarRodada, cenaPronta, tocar, liberarErro, avancar, encerrar,
} from '../services/ovelhaGameMachine';

/**
 * Assets REAIS. Backgrounds em WebP processado (exibidos por CONTAIN); ovelhas recortadas
 * por alpha bbox. `require` estático. Um fallback interno (só segurança) cobre uma cena
 * sem background.
 */
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
 * Pré-carrega os 5 assets do jogo (2 backgrounds + 3 poses) uma única vez, via expo-asset
 * (sem dependência nova). Assim o `pendingRound` só usa assets já resolvidos e a transição
 * atômica não pisca. Idempotente e resiliente (não quebra se um download demorar).
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
 * Ferramentas internas. SEMPRE `false` em produção — nunca aparecem no jogo real.
 *   OVELHA_DEBUG_HITBOX  — overlay: sprite box, hitbox, clip, centro, ids, pose, escala.
 *   OVELHA_CALIBRACAO    — calibração: navega/ajusta esconderijos sem consumir rodada/salvar.
 */
const OVELHA_DEBUG_HITBOX = false;
const OVELHA_CALIBRACAO = false;

/** Tempos das animações (ms). */
const T = { acerto: 720, erro: 460, fadeOut: 170, fadeIn: 210 };

/** Passos da calibração (dev). */
const CALIB_PASSO_XY = 6;        // px de arte por toque
const CALIB_PASSO_ESC = 0.005;   // fração por toque

const clampEsc = (v) => Math.max(0.06, Math.min(0.18, v));
const wrap = (i, n) => ((i % n) + n) % n;

/** Lista achatada de todos os esconderijos (para calibração). */
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
  const [activeRound, setActiveRound] = useState(null);   // rodada PINTADA na tela
  const [pendingRound, setPendingRound] = useState(null); // rodada em preparação (invisível)
  const [sceneReady, setSceneReady] = useState(false);    // background E pose prontos p/ activeRound
  const [nivel, setNivel] = useState(0);
  const [ripple, setRipple] = useState(null);             // { key, x, y } — feedback de erro no ponto
  const [errouAgora, setErrouAgora] = useState(false);
  const [areaVersion, setAreaVersion] = useState(0);      // bump quando a área medida muda
  const [calibSel, setCalibSel] = useState(null);         // { sceneId, spot } em calibração

  const jogoRef = useRef(vista);
  const roundIdRef = useRef(0);
  const planoRef = useRef([]);          // plano determinístico das 5 rodadas (cena+spot+pose)
  const calibIdxRef = useRef(0);        // índice do esconderijo no modo calibração
  const activeRoundRef = useRef(null);  // espelho síncrono de activeRound
  const salvoRef = useRef(false);
  const timeouts = useRef([]);
  const montado = useRef(true);
  const areaRef = useRef({ largura: 0, altura: 0 });
  // Transição atômica:
  const layerAnim = useRef(new Animated.Value(0)).current;   // opacidade do SceneLayer
  const readyRef = useRef({ roundId: -1, bg: false, pose: false, seq: 0 });
  const transSeqRef = useRef(0);
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

  /* ── Timers centralizados ── */
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

  /* ── Prontidão: só quando background E pose carregam para o roundId corrente. ──
     Callback de load de rodada antiga é ignorado (roundId não bate). */
  const marcarCarregado = useCallback((qual, roundId) => {
    const r = readyRef.current;
    if (!r || r.roundId !== roundId) return;
    if (qual === 'bg') r.bg = true; else r.pose = true;
    if (r.bg && r.pose && montado.current) setSceneReady(true);
  }, []);

  /* ── Transição ATÔMICA: prepara a rodada, faz fade-out, promove e espera sceneReady. ──
     A ovelha nova nunca aparece sobre o background antigo. */
  const iniciarTransicao = useCallback((round, { comFade }) => {
    const iniciou = aplicar(iniciarRodada, { targetId: round.targetId, itemIds: [round.targetId, MISS_ID] });
    if (!iniciou.aceito) return;   // rodada inválida: a máquina não inicia
    const seq = (transSeqRef.current += 1);
    readyRef.current = { roundId: round.roundId, bg: false, pose: false, seq };
    setPendingRound(round);

    const promover = () => {
      if (transSeqRef.current !== seq || !montado.current) return;
      setSceneReady(false);            // esconde a ovelha até o novo background carregar
      setActiveRound(round);           // remonta o SceneLayer (key nova), opacidade 0
      activeRoundRef.current = round;
      setPendingRound(null);
      setRipple(null);
    };

    if (comFade && activeRoundRef.current) {
      Animated.timing(layerAnim, { toValue: 0, duration: T.fadeOut, useNativeDriver: true })
        .start(({ finished }) => { if (finished) promover(); });
    } else {
      layerAnim.setValue(0);
      promover();
    }
  }, [aplicar, layerAnim]);

  /* ── Fade-in + liberação: quando a cena fica pronta, revela e passa a aceitar toque. ── */
  useEffect(() => {
    if (!sceneReady) return undefined;
    if (jogoRef.current.fase !== FASES.ENTRANDO) return undefined;
    const a = Animated.timing(layerAnim, { toValue: 1, duration: T.fadeIn, useNativeDriver: true });
    a.start(({ finished }) => {
      if (finished && montado.current) {
        fn.current.aplicar(cenaPronta);       // ENTRANDO → PROCURANDO (libera input)
        rodadaSeqRef.current += 1;            // nova sequência de dica
        resetarDica();
      }
    });
    return () => a.stop();
  }, [sceneReady, layerAnim, resetarDica]);

  /* ── Monta a rodada seguindo o PLANO determinístico da partida. ── */
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

  /* ── Fim da partida: salva UMA vez. Nunca salva em CALIBRAÇÃO. ── */
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
  const procurando = jogando && vista.fase === FASES.PROCURANDO && sceneReady;

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
    if (jogoRef.current.fase !== FASES.TROCANDO) return;   // idempotente
    const r = buildRoundParaRodada(vista.rodada);
    if (r) iniciarTransicao(r, { comFade: true });
  }, [jogando, vista.fase, vista.rodada, buildRoundParaRodada, iniciarTransicao]);

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
    layerAnim.setValue(0);
    planoRef.current = planPartida({ rounds: OVELHA_ROUNDS, rnd: Math.random });
    calibIdxRef.current = 0;
    jogoRef.current = criarJogo({ rounds: OVELHA_ROUNDS });
    setVista(jogoRef.current);
    setActiveRound(null);
    activeRoundRef.current = null;
    setPendingRound(null);
    setSceneReady(false);
    setResultado(null);
    setRipple(null);
    setPausado(AppState.currentState !== 'active');
    if (OVELHA_CALIBRACAO) setCalibSel({ sceneId: CALIB_SPOTS[0].sceneId, spot: { ...CALIB_SPOTS[0].spot, pos: { ...CALIB_SPOTS[0].spot.pos } } });
    setTela('jogando');
    if (!OVELHA_CALIBRACAO) setRounds(await getDailyRounds());
  }, [limparTimers, resetarDica, layerAnim]);

  /* ── CALIBRAÇÃO: monta o esconderijo selecionado sem consumir rodada nem salvar. ── */
  useEffect(() => {
    if (!OVELHA_CALIBRACAO || tela !== 'jogando' || !calibSel) return;
    limparTimers();
    transSeqRef.current += 1;
    layerAnim.setValue(0);
    jogoRef.current = criarJogo({ rounds: OVELHA_ROUNDS });
    setVista(jogoRef.current);
    setActiveRound(null);
    activeRoundRef.current = null;
    const scene = getScene(calibSel.sceneId);
    roundIdRef.current += 1;
    const r = buildRoundFromSpot({ scene, spot: calibSel.spot, roundId: roundIdRef.current });
    if (r) iniciarTransicao(r, { comFade: false });
  }, [calibSel, tela, limparTimers, layerAnim, iniciarTransicao]);

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
      const ordem = ['front', 'peekLeft', 'peekRight'];
      const prox = ordem[(ordem.indexOf(prev.spot.pose) + 1) % ordem.length];
      const sp = { ...prev.spot, pos: { ...prev.spot.pos }, pose: prox };
      if (prox === 'front') { sp.modo = 'CAMOUFLAGE'; delete sp.clip; }
      else { sp.modo = 'PEEK'; sp.clip = { side: prox === 'peekLeft' ? 'right' : 'left', visibleFraction: 0.6 }; }
      return { ...prev, spot: sp };
    });
  }, []);

  const abandonar = useCallback(() => {
    limparTimers(); transSeqRef.current += 1; resetarDica(); aplicar(encerrar); setTela('entrada');
  }, [aplicar, limparTimers, resetarDica]);

  /* ── Toque na CENA inteira: só conta com a cena pronta e a máquina procurando. ── */
  const scene = getScene(activeRound?.sceneId);
  const tocarCena = useCallback((e) => {
    if (pausado || !activeRound || !sceneReady) return;   // input bloqueado durante transição
    const { locationX: px, locationY: py } = e?.nativeEvent ?? {};
    if (OVELHA_CALIBRACAO) { setRipple({ key: `${Date.now()}`, x: px, y: py }); return; }  // só inspeção
    const acertou = toqueAcertou(px, py, activeRound.spot, scene, viewport);
    const r = aplicar(tocar, acertou ? activeRound.targetId : MISS_ID);
    if (r.aceito && r.acerto === false) {
      setRipple({ key: `${Date.now()}`, x: px, y: py });
      setErrouAgora(true);
      agendar(() => montado.current && setErrouAgora(false), T.erro);
      // Anti-spam: a "identidade" do erro é a CÉLULA tocada (mesma região no cooldown não conta).
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
  }, [aplicar, agendar, pausado, activeRound, sceneReady, scene, viewport, aplicarNivel]);

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

  /* ══════════════ ENTRADA ══════════════ */
  if (tela === 'entrada') {
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => navigation.goBack()} />
        <View style={styles.entradaWrap}>
          <View style={styles.painel}>
            <BeniGuideBubble message={OVELHA_BENI.entrada} avatarVariant="teaching" tone="purple" compact />
            <Text style={styles.explica}>
              A ovelhinha se escondeu na paisagem. Procure com atenção — são 5 para encontrar!
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
        <Text style={styles.hudRodada}>Rodada {Math.min(vista.rodada, vista.rounds)} de {vista.rounds}</Text>
      </View>

      <Text style={styles.dica} numberOfLines={1}>{mensagem}</Text>

      {/* Container que mede a área; o VIEWPORT (razão da arte) captura o toque. */}
      <View style={styles.cenaWrap} onLayout={medirArea}>
        <Pressable
          onPress={tocarCena}
          style={[styles.viewport, { width: viewport.w, height: viewport.h }]}
          accessibilityRole="button"
          accessibilityLabel="Procure a ovelhinha na paisagem"
        >
          {activeRound && (
            <SceneLayer
              key={`${activeRound.roundId}:${activeRound.sceneId}:${activeRound.spot.id}`}
              round={activeRound}
              scene={scene}
              viewport={viewport}
              layerAnim={layerAnim}
              sceneReady={sceneReady}
              encontrada={vista.fase === FASES.ACERTO}
              estagio={estagio}
              ripple={ripple}
              debug={OVELHA_DEBUG_HITBOX}
              onBgLoad={() => marcarCarregado('bg', activeRound.roundId)}
              onPoseLoad={() => marcarCarregado('pose', activeRound.roundId)}
            />
          )}
        </Pressable>

        {/* Calibração (dev): navega/ajusta esconderijos; nunca em produção. */}
        {OVELHA_CALIBRACAO && calibSel && (
          <CalibBar sel={calibSel} onNav={calibNavegar} onPose={calibPose} onNudge={calibNudge} />
        )}
      </View>
    </View>
  );
}

/* ══════════════════════════ SCENE LAYER (container único) ══════════════════════════ */

/**
 * Um único container visual por rodada (background + ovelha + clip + dica + ripple),
 * remontado por KEY a cada troca. A opacidade `layerAnim` faz o fade do container INTEIRO
 * (nunca background e ovelha separados). A ovelha só é renderizada com `sceneReady=true`.
 */
function SceneLayer({ round, scene, viewport, layerAnim, sceneReady, encontrada, estagio, ripple, debug, onBgLoad, onPoseLoad }) {
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

  // Janela de CLIP (px do viewport) em torno da caixa VISÍVEL; o sprite inteiro vive dentro.
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
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: layerAnim }]} pointerEvents="none">
      {/* 0 — background REAL por CONTAIN (imagem inteira, sem zoom/cover). */}
      {bg
        ? <Image source={bg} style={styles.bg} resizeMode="contain" onLoad={onBgLoad} />
        : <View style={[styles.bg, styles.bgFallback]} />}
      {/* Detector invisível do load da POSE (a ovelha visível só entra com sceneReady). */}
      <Image source={img} style={styles.poseLoader} resizeMode="contain" onLoad={onPoseLoad} />

      {sceneReady && estagio >= 3 && <BrilhoRegiao cx={centro.px} cy={centro.py} r={Math.min(spW, spH) * 0.55} />}

      {sceneReady && (
        <SheepView
          clipLeft={clipLeft} clipTop={clipTop} clipW={clipW} clipH={clipH}
          offX={offX} offY={offY} spW={spW} spH={spH} img={img} flip={flip} encontrada={encontrada}
        />
      )}

      {sceneReady && estagio >= 4 && <ContornoVisivel cx={cr.x + vb.cx * s} cy={cr.y + vb.cy * s} w={clipW} h={clipH} />}

      {ripple && <TouchRipple key={ripple.key} x={ripple.x} y={ripple.y} />}

      {debug && <DebugOverlay round={round} scene={scene} viewport={viewport}
        centro={centro} spW={spW} spH={spH} clipLeft={clipLeft} clipTop={clipTop} clipW={clipW} clipH={clipH} />}
    </Animated.View>
  );
}

function SheepView({ clipLeft, clipTop, clipW, clipH, offX, offY, spW, spH, img, flip, encontrada }) {
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
    // Janela de CLIP (overflow hidden) alinhada à área visível; o sprite inteiro vive dentro.
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: clipLeft, top: clipTop, width: clipW, height: clipH, overflow: 'hidden', zIndex: 2, transform: [{ scale: pop }] }}
    >
      <Image
        source={img}
        resizeMode="contain"
        style={{ position: 'absolute', left: offX, top: offY, width: spW, height: spH, transform: [{ scaleX: flip ? -1 : 1 }] }}
      />
    </Animated.View>
  );
}

/** Brilho discreto (estágio 3) — halo suave e PEQUENO, atrás da ovelha. Não preenche. */
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

/** Contorno na parte visível (estágio 4) — arco fino tracejado no topo, sem tapar. */
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

/** Overlay de diagnóstico: sprite box, hitbox (px via contentRect), clip, ids, pose, escala. */
function DebugOverlay({ round, scene, viewport, centro, spW, spH, clipLeft, clipTop, clipW, clipH }) {
  const hb = hitboxPxRect(round.spot, scene, viewport);
  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', left: centro.px - spW / 2, top: centro.py - spH / 2, width: spW, height: spH, borderWidth: 1, borderColor: '#3B82F6', zIndex: 6 }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: clipLeft, top: clipTop, width: clipW, height: clipH, borderWidth: 1, borderColor: '#7C3AED', zIndex: 6 }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: hb.x0, top: hb.y0, width: hb.w, height: hb.h, borderWidth: 1.5, borderColor: '#0E9F6E', zIndex: 6 }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 4, left: 6, zIndex: 6 }}>
        <Text style={styles.debugTxt}>vp {viewport.w}×{viewport.h} · {round.sceneId} · {round.spot.id} · {round.pose} · e{round.spot.escala} · {round.modo}</Text>
      </View>
    </>
  );
}

/* ══════════════════════════ CALIBRAÇÃO (dev) ══════════════════════════ */

/** Barra de calibração: navega esconderijos, troca pose e ajusta x/y/escala; mostra normalizado. */
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

  hud: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, paddingVertical: 6, backgroundColor: '#FFF' },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hudText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.text },
  hudRodada: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft },
  dica: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', height: 22, lineHeight: 22, marginTop: 2 },

  // ── Cena: container mede a área; viewport (razão da arte) alinhado ao TOPO (menos vazio). ──
  cenaWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 10, paddingTop: 4, paddingBottom: 8 },
  viewport: { borderRadius: radii.xl, overflow: 'hidden', backgroundColor: '#EAF2F5', ...shadows.soft },
  bg: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  bgFallback: { backgroundColor: '#DDEFF6' },
  poseLoader: { position: 'absolute', width: 1, height: 1, left: 0, top: 0, opacity: 0 },
  debugTxt: { fontFamily: 'Nunito', fontSize: 9, color: '#C0392B', fontWeight: '800' },

  // ── Barra de calibração (dev; OVELHA_CALIBRACAO) ──
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
