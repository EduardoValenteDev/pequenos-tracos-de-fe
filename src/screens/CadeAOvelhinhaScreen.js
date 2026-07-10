/**
 * CadeAOvelhinhaScreen — "Cadê a Ovelhinha?" (2.2e cobertura opaca + expo-image onDisplay).
 *
 * ── Carregamento estável (2.2e) ───────────────────────────────────────────────
 * Saiu o duplo buffer visual frágil do 2.2d. Agora existe UMA cena real, montada com
 * opacidade 1 por baixo de um OVERLAY OPACO (o card do alvo). A prontidão é decidida por
 * `onDisplay` (expo-image) das TRÊS imagens reais — retrato do card, background e ovelha da
 * cena — todas do mesmo `roundToken`; NUNCA por `onLoadEnd`. O botão "Procurar" só habilita
 * com os três `onDisplay` e sem erro. Ao tocar, apenas o overlay some (a cena já está
 * desenhada). Lógica pura e testável em services/ovelhaTransition (loadingReducer).
 *
 * ── Enquadramento ─────────────────────────────────────────────────────────────
 * O background é desenhado num RETÂNGULO EXPLÍCITO (contentRect da cena ATIVA, com as
 * dimensões reais dela) e preenchido por inteiro — sem cover, zoom ou transform.
 *
 * A rota só existe sob o gate interno; o card fica "Em teste". Ferramentas dev
 * (OVELHA_DEBUG_HITBOX / OVELHA_DEBUG_FRAME / OVELHA_CALIBRACAO) são SEMPRE false em produção.
 * Preservado: máquina, 5 rodadas, persistência, teto compartilhado, anti-spam de dica.
 */
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  View, Text, Animated, Pressable, AppState, StyleSheet, useWindowDimensions,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
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
import { isInternalToolsEnabled } from '../config/internalTools';
import { isPremiumUser } from '../services/accessControl';
import { addBonusStars } from '../services/postStoryStorage';
import { useProgressContext } from '../context/ProgressContext';
import { getDailyRounds, consumeRound, toDayKey } from '../services/brincarDailyService';
import { readStats, recordOvelhaResult } from '../services/brincarStatsService';
import { playGameSfx, preloadGameSfx, releaseGameSfx } from '../services/audioManager';
import { warn } from '../utils/logger';
import { OVELHA_BENI } from '../data/ovelhaSceneData';
import { getScene, cenasHabilitadas } from '../data/ovelhaScenes';
import { OVELHA_BG, OVELHA_POSE_IMG } from '../data/ovelhaAssets';
import {
  buildRoundFromSpot, roundValido, planPartida, computeViewport, contentRect, artToPx, pxToArt,
  spriteBoxArt, visibleBoxArt, hitboxPxRect, toqueAcertou, celulaToque, erroElegivel,
  nivelDica, estagioDica, MISS_ID, OVELHA_ROUNDS, OVELHA_SOUND_EVENTS,
} from '../services/ovelhaGameService';
import {
  loadingReducer, initialLoading, prontoParaRevelar, temErro, botaoHabilitado, inputBloqueado,
} from '../services/ovelhaTransition';
import {
  FASES, criarJogo, iniciarRodada, cenaPronta, tocar, liberarErro, avancar, encerrar,
} from '../services/ovelhaGameMachine';

/**
 * Pré-carrega (aquece o cache) os assets do jogo via expo-asset. Prefetch NÃO é prova
 * visual — o gate final é o `onDisplay`. Idempotente e resiliente.
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

/** Ferramentas internas. SEMPRE `false` em produção. */
const OVELHA_DEBUG_HITBOX = false;
const OVELHA_DEBUG_FRAME = false;
const OVELHA_CALIBRACAO = false;

const T = { acerto: 720, erro: 460, coverOut: 190 };

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
  const [lstate, ldispatch] = useReducer(loadingReducer, undefined, initialLoading);
  const [rodada, setRodada] = useState(null);        // round object corrente (cena+spot)
  const [retryNonce, setRetryNonce] = useState(0);   // muda o recyclingKey para recarregar
  const [nivel, setNivel] = useState(0);
  const [ripple, setRipple] = useState(null);
  const [errouAgora, setErrouAgora] = useState(false);
  const [areaVersion, setAreaVersion] = useState(0);

  const jogoRef = useRef(vista);
  const roundIdRef = useRef(0);
  const planoRef = useRef([]);
  const salvoRef = useRef(false);
  const timeouts = useRef([]);
  const rafs = useRef([]);
  const montado = useRef(true);
  const areaRef = useRef({ largura: 0, altura: 0 });
  const trocaSeqRef = useRef(0);
  const coverAnim = useRef(new Animated.Value(1)).current;   // 1 = coberto
  // Dica — tudo por rodada:
  const buscaMsRef = useRef(0);
  const nivelRef = useRef(0);
  const erroElegivelRef = useRef(0);
  const ultimoErroIdRef = useRef(null);
  const ultimoErroMsRef = useRef(0);
  const rodadaSeqRef = useRef(0);
  const fn = useRef({});

  const sceneAtiva = getScene(rodada?.sceneId);
  const viewport = useMemo(
    () => computeViewport({
      largura: areaRef.current.largura || Math.min(width - 20, 560),
      altura: areaRef.current.altura || 9999,
      artW: sceneAtiva?.designWidth,
      artH: sceneAtiva?.designHeight,
    }),
    [width, areaVersion, tela, sceneAtiva?.designWidth, sceneAtiva?.designHeight],
  );

  /* ── Timers / rAF centralizados ── */
  const agendar = useCallback((cb, ms) => {
    const id = setTimeout(() => {
      timeouts.current = timeouts.current.filter((x) => x !== id);
      if (montado.current) cb();
    }, ms);
    timeouts.current.push(id);
    return id;
  }, []);
  const proximoFrame = useCallback((cb) => {
    const id = requestAnimationFrame(() => {
      rafs.current = rafs.current.filter((x) => x !== id);
      if (montado.current) cb();
    });
    rafs.current.push(id);
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

  /* ── Monta a próxima rodada do PLANO e a registra (coberta). ── */
  const montarRodada = useCallback((rodada1based) => {
    const plano = planoRef.current;
    if (!plano.length) return;
    const entry = plano[(rodada1based - 1) % plano.length] || plano[0];
    const scene = getScene(entry.sceneId);
    const spot = scene.hidingSpots.find((s) => s.id === entry.spotId) || scene.hidingSpots[0];
    roundIdRef.current += 1;
    const token = roundIdRef.current;
    const r = buildRoundFromSpot({ scene, spot, roundId: token });
    if (!r || !roundValido(r, 'facil')) { warn('CadeAOvelhinha: rodada inválida (contrato).'); return; }
    const iniciou = aplicar(iniciarRodada, { targetId: r.targetId, itemIds: [r.targetId, MISS_ID] });
    if (!iniciou.aceito) return;
    setRodada(r);
    setRipple(null);
    ldispatch({ type: 'NOVA_RODADA', token, sceneId: r.sceneId, spotId: r.spot.id, pose: r.pose });
  }, [aplicar]);

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
    return () => { vivo = false; montado.current = false; trocaSeqRef.current += 1; limparTimers(); releaseGameSfx(); };
  }, [limparTimers]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (e) => setPausado(e !== 'active'));
    const off = navigation.addListener('blur', () => setPausado(true));
    const on = navigation.addListener('focus', () => setPausado(AppState.currentState !== 'active'));
    return () => { sub.remove(); off(); on(); };
  }, [navigation]);

  const jogando = tela === 'jogando';
  const procurando = jogando && vista.fase === FASES.PROCURANDO && !inputBloqueado(lstate);

  /* ── Cobertura: sempre que coberto, o overlay cobre IMEDIATAMENTE (sem fade lento). ── */
  useEffect(() => {
    if (lstate.coverVisible) coverAnim.setValue(1);
  }, [lstate.coverVisible, coverAnim]);

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

  /* ── Entre rodadas: máquina em TROCANDO → cobre, espera 1 frame, só então troca a cena. ── */
  useEffect(() => {
    if (!jogando || OVELHA_CALIBRACAO) return;
    if (vista.fase !== FASES.TROCANDO) return;
    if (jogoRef.current.fase !== FASES.TROCANDO) return;
    const seq = (trocaSeqRef.current += 1);
    ldispatch({ type: 'COBRIR' });                    // overlay cobre a cena atual JÁ
    proximoFrame(() => {                              // garante 1 frame com o overlay pintado
      if (trocaSeqRef.current !== seq) return;        // token: ignora troca antiga
      fn.current.montarRodada(vista.rodada);          // só agora troca sceneId/spot/pose/sources
    });
  }, [jogando, vista.fase, vista.rodada, proximoFrame]);

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
    trocaSeqRef.current += 1;
    coverAnim.setValue(1);
    ldispatch({ type: 'RESET' });
    planoRef.current = planPartida({ rounds: OVELHA_ROUNDS, rnd: Math.random });
    jogoRef.current = criarJogo({ rounds: OVELHA_ROUNDS });
    setVista(jogoRef.current);
    setRodada(null);
    setResultado(null);
    setRipple(null);
    setPausado(AppState.currentState !== 'active');
    setTela('jogando');
    if (!OVELHA_CALIBRACAO) setRounds(await getDailyRounds());
    fn.current.montarRodada(1);   // rodada 1 (já coberta pelo RESET)
  }, [limparTimers, resetarDica, coverAnim]);

  const abandonar = useCallback(() => {
    limparTimers(); trocaSeqRef.current += 1; resetarDica(); aplicar(encerrar); setTela('entrada');
  }, [aplicar, limparTimers, resetarDica]);

  /* ── onDisplay / onError de cada imagem REAL (gate de prontidão). ── */
  const aoExibir = useCallback((alvo, token) => {
    ldispatch({ type: 'EXIBIDA', alvo, token });
  }, []);
  const aoErro = useCallback((alvo, token) => {
    ldispatch({ type: 'ERRO', alvo, token });
  }, []);

  /* ── Procurar: revela (só o overlay sai) e libera input após a saída. ── */
  const procurar = useCallback(() => {
    if (!botaoHabilitado(lstate)) return;
    const token = lstate.roundToken;
    ldispatch({ type: 'REVELAR', token });
    Animated.timing(coverAnim, { toValue: 0, duration: T.coverOut, useNativeDriver: true }).start(({ finished }) => {
      if (!finished || !montado.current) return;
      fn.current.aplicar(cenaPronta);       // ENTRANDO → PROCURANDO
      ldispatch({ type: 'LIBERAR', token });
      rodadaSeqRef.current += 1;
      resetarDica();
      setRipple(null);
    });
  }, [lstate, coverAnim, resetarDica]);

  /* ── Tentar novamente (após erro): recarrega a MESMA rodada. ── */
  const tentarNovamente = useCallback(() => {
    ldispatch({ type: 'RETRY', token: lstate.roundToken });
    setRetryNonce((n) => n + 1);   // novo recyclingKey → imagens remontam e reportam onDisplay/onError
  }, [lstate.roundToken]);

  /* ── Toque na CENA: só com input liberado (não coberto/carregando/erro) e máquina procurando. ── */
  const scene = sceneAtiva;
  const tocarCena = useCallback((e) => {
    if (pausado || inputBloqueado(lstate) || !rodada) return;
    const { locationX: px, locationY: py } = e?.nativeEvent ?? {};
    if (OVELHA_CALIBRACAO) { setRipple({ key: `${Date.now()}`, x: px, y: py }); return; }
    const acertou = toqueAcertou(px, py, rodada.spot, scene, viewport);
    const r = aplicar(tocar, acertou ? rodada.targetId : MISS_ID);
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
  }, [aplicar, agendar, pausado, lstate, rodada, scene, viewport, aplicarNivel]);

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
  const posePreview = lstate.pose || rodada?.pose || 'front';
  const rodadaNum = Math.min(vista.rodada, vista.rounds);

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
          {isInternalToolsEnabled() && (
            <SoundButton style={styles.btnDev} onPress={() => navigation.navigate(ROUTES.OVELHA_ASSET_GALLERY)} activeOpacity={0.9}>
              <Text style={styles.btnDevText}>Asset Gallery (dev)</Text>
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
  const coberto = lstate.coverVisible;
  return (
    <View style={styles.root}>
      <Header insets={insets} onBack={abandonar} chip="Em teste" />
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <FaithIcon name="ovelha" size={16} color={pt.textSoft} />
          <Text style={styles.hudText}>{vista.encontradas} de {vista.rounds}</Text>
        </View>
        <HudRetrato pose={rodada?.pose || posePreview} />
        <Text style={styles.hudRodada}>Rodada {rodadaNum}/{vista.rounds}</Text>
      </View>

      <Text style={styles.dica} numberOfLines={1}>{mensagem}</Text>

      <View style={[styles.cenaWrap, { paddingBottom: Math.max(insets.bottom, 8) + 4 }]} onLayout={medirArea}>
        <Pressable
          onPress={tocarCena}
          style={[styles.viewport, { width: viewport.w, height: viewport.h }]}
          accessibilityRole="button"
          accessibilityLabel="Procure a ovelhinha na paisagem"
        >
          {/* ÚNICA cena real, opacidade 1, montada por baixo do overlay. */}
          {rodada && (
            <SceneLayer
              round={rodada}
              scene={scene}
              viewport={viewport}
              retryNonce={retryNonce}
              encontrada={vista.fase === FASES.ACERTO}
              estagio={estagio}
              ripple={ripple}
              debugHitbox={OVELHA_DEBUG_HITBOX}
              onBgDisplay={() => aoExibir('background', rodada.roundId)}
              onBgError={() => aoErro('background', rodada.roundId)}
              onSheepDisplay={() => aoExibir('sceneSheep', rodada.roundId)}
              onSheepError={() => aoErro('sceneSheep', rodada.roundId)}
            />
          )}

          {OVELHA_DEBUG_FRAME && <FrameDebug scene={scene} viewport={viewport} />}

          {/* Overlay OPACO = card do alvo. Cobre a cena até estar pronta e revelada. */}
          {coberto && (
            <Animated.View style={[StyleSheet.absoluteFill, styles.cover, { opacity: coverAnim }]}>
              <TargetCard
                pose={posePreview}
                rodada={rodadaNum}
                total={vista.rounds}
                roundToken={lstate.roundToken}
                retryNonce={retryNonce}
                pronto={botaoHabilitado(lstate)}
                erro={temErro(lstate)}
                onPreviewDisplay={() => aoExibir('preview', lstate.roundToken)}
                onPreviewError={() => aoErro('preview', lstate.roundToken)}
                onProcurar={procurar}
                onRetry={tentarNovamente}
              />
            </Animated.View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/* ══════════════════════════ SCENE LAYER (cena única, opacidade 1) ══════════════════════════ */

/**
 * Uma cena real (background em retângulo explícito + ovelha com clip), montada com
 * opacidade 1. As imagens usam expo-image com recyclingKey estável e onDisplay/onError.
 * A prontidão vem do onDisplay (não onLoadEnd).
 */
function SceneLayer({ round, scene, viewport, retryNonce, encontrada, estagio, ripple, debugHitbox, onBgDisplay, onBgError, onSheepDisplay, onSheepError }) {
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

  const kBg = `background:${round.roundId}:${scene.id}:${retryNonce}`;
  const kSheep = `sheep:${round.roundId}:${scene.id}:${spot.id}:${spot.pose}:${retryNonce}`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 0 — background REAL no retângulo explícito (proporção exata da cena → sem cover/zoom). */}
      {bg
        ? <ExpoImage
            source={bg}
            style={{ position: 'absolute', left: cr.x, top: cr.y, width: cr.w, height: cr.h }}
            contentFit="fill"
            cachePolicy="memory-disk"
            transition={0}
            recyclingKey={kBg}
            onDisplay={onBgDisplay}
            onError={onBgError}
          />
        : <View style={[styles.bgFallback, { position: 'absolute', left: cr.x, top: cr.y, width: cr.w, height: cr.h }]} />}

      {estagio >= 3 && <BrilhoRegiao cx={centro.px} cy={centro.py} r={Math.min(spW, spH) * 0.55} />}

      {/* 2 — ovelha REAL recortada pela janela de clip. */}
      <SheepView clipLeft={clipLeft} clipTop={clipTop} clipW={clipW} clipH={clipH}
        offX={offX} offY={offY} spW={spW} spH={spH} img={img} flip={flip} encontrada={encontrada}
        recyclingKey={kSheep} onDisplay={onSheepDisplay} onError={onSheepError} />

      {estagio >= 4 && <ContornoVisivel cx={cr.x + vb.cx * s} cy={cr.y + vb.cy * s} w={clipW} h={clipH} />}

      {ripple && <TouchRipple key={ripple.key} x={ripple.x} y={ripple.y} />}

      {debugHitbox && <HitboxDebug round={round} scene={scene} viewport={viewport} centro={centro} spW={spW} spH={spH} clipLeft={clipLeft} clipTop={clipTop} clipW={clipW} clipH={clipH} />}
    </View>
  );
}

function SheepView({ clipLeft, clipTop, clipW, clipH, offX, offY, spW, spH, img, flip, encontrada, recyclingKey, onDisplay, onError }) {
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
    <Animated.View
      style={{ position: 'absolute', left: clipLeft, top: clipTop, width: clipW, height: clipH, overflow: 'hidden', zIndex: 2, transform: [{ scale: pop }] }}
    >
      <ExpoImage
        source={img}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
        recyclingKey={recyclingKey}
        onDisplay={onDisplay}
        onError={onError}
        style={{ position: 'absolute', left: offX, top: offY, width: spW, height: spH, transform: [{ scaleX: flip ? -1 : 1 }] }}
      />
    </Animated.View>
  );
}

/* ── Dica visual ── */
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
    <Animated.View pointerEvents="none"
      style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: r, zIndex: 1, backgroundColor: pt.gold, opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] }) }}
    />
  );
}
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
function TouchRipple({ x, y }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(p, { toValue: 1, duration: 420, useNativeDriver: true });
    a.start(); return () => a.stop();
  }, [p]);
  const d = 54;
  return (
    <Animated.View pointerEvents="none"
      style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: d / 2, borderWidth: 3, borderColor: '#E8A33D', zIndex: 5,
        opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.3] }) }] }}
    />
  );
}

/* ══════════════════════════ CARD DO ALVO + HUD ══════════════════════════ */

/** Card = overlay opaco: mostra a pose a procurar; o botão só habilita quando tudo exibiu. */
function TargetCard({ pose, rodada, total, roundToken, retryNonce, pronto, erro, onPreviewDisplay, onPreviewError, onProcurar, onRetry }) {
  const ent = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.spring(ent, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true });
    a.start(); return () => a.stop();
  }, [ent]);
  const kPreview = `preview:${roundToken}:${pose}:${retryNonce}`;
  return (
    <View style={styles.cardWrap} accessibilityRole="alert">
      <Animated.View style={[styles.cardBox, { opacity: ent, transform: [{ scale: ent.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
        <Text style={styles.cardTitulo}>Encontre esta ovelhinha!</Text>
        <View style={styles.cardSheepBg}>
          <ExpoImage
            source={OVELHA_POSE_IMG[pose] || OVELHA_POSE_IMG.front}
            style={styles.cardSheep}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={0}
            recyclingKey={kPreview}
            onDisplay={onPreviewDisplay}
            onError={onPreviewError}
          />
        </View>
        <Text style={styles.cardRodada}>Rodada {rodada} de {total}</Text>

        {erro ? (
          <>
            <Text style={styles.cardErro}>Não conseguimos preparar a cena.</Text>
            <SoundButton style={styles.cardBtn} onPress={onRetry} activeOpacity={0.9}>
              <Text style={styles.cardBtnText}>Tentar novamente</Text>
            </SoundButton>
          </>
        ) : pronto ? (
          <SoundButton style={styles.cardBtn} onPress={onProcurar} activeOpacity={0.9} soundType="success">
            <Text style={styles.cardBtnText}>Procurar</Text>
          </SoundButton>
        ) : (
          <View style={[styles.cardBtn, styles.cardBtnOff]} accessibilityState={{ disabled: true }}>
            <Text style={styles.cardBtnOffText}>Preparando a brincadeira…</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

/** Retrato pequeno da ovelha a procurar (expo-image, memory-disk); com fallback visual. */
function HudRetrato({ pose }) {
  const [falhou, setFalhou] = useState(false);
  return (
    <View style={styles.hudRetrato}>
      <View style={styles.hudRetratoImg}>
        {falhou
          ? <FaithIcon name="ovelha" size={22} color={pt.greenDeep} />
          : <ExpoImage source={OVELHA_POSE_IMG[pose] || OVELHA_POSE_IMG.front} style={styles.hudSheep} contentFit="contain" cachePolicy="memory-disk" transition={0} recyclingKey={`hud:${pose}`} onError={() => setFalhou(true)} />}
      </View>
      <Text style={styles.hudRetratoLabel}>Procure esta</Text>
    </View>
  );
}

/* ── Diagnósticos (dev) ── */
function FrameDebug({ scene, viewport }) {
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
  btnDev: { marginTop: 10, paddingVertical: 10, alignItems: 'center', borderRadius: radii.md, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F1F5F9' },
  btnDevText: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#475569' },
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

  // ── Overlay opaco = card do alvo ──
  cover: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9F4EF', zIndex: 10 },
  cardWrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  cardBox: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: radii.xl, paddingHorizontal: 22, paddingVertical: 18, ...shadows.card, borderWidth: 1.5, borderColor: '#CDEBD9' },
  cardTitulo: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center' },
  cardSheepBg: { width: 150, height: 150, borderRadius: 24, backgroundColor: '#F3FBF6', borderWidth: 1, borderColor: '#DDEFE4', alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  cardSheep: { width: 128, height: 128 },
  cardRodada: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft, marginBottom: 12 },
  cardErro: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: '#B4460F', textAlign: 'center', marginBottom: 10 },
  cardBtn: { backgroundColor: pt.greenDeep, borderRadius: radii.lg, paddingHorizontal: 32, paddingVertical: 12, ...shadows.soft },
  cardBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },
  cardBtnOff: { backgroundColor: '#DCE6E0' },
  cardBtnOffText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: '#6B837A' },

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
