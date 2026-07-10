/**
 * CadeAOvelhinhaScreen — "Cadê a Ovelhinha?" (2.1→2.1b protótipo · 2.2a cenas autorais).
 *
 * ── Mudança de direção (2.2a) ─────────────────────────────────────────────────
 * Saiu o modelo de "3 ícones tocáveis em posições livres". Agora a rodada sorteia um
 * ESCONDERIJO autoral (ver ovelhaScenes) dentro de uma cena 4:5. A CENA INTEIRA recebe
 * o toque; o acerto é o ponto cair na hitbox do esconderijo. Distratores são parte da
 * ARTE (não Pressables). A ovelha fica ATRÁS do foreground, mas a hitbox segue tocável.
 *
 * ATENCAO: Nenhuma arte oficial neste bloco: fundo/ovelha/oclusores são MOCKS internos
 * (`tipo:'placeholder'`). A rota só existe sob o gate interno; o card fica "Em teste".
 *
 * Preservado do protótipo: máquina de estados, 5 rodadas, persistência, teto
 * compartilhado, salvamento único, anti-spam + reset de dica por rodada, ciclo de vida.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Animated, Pressable, AppState, StyleSheet, useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Ellipse, Rect, Path, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
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
import { getScene, OVELHA_SCENE_PADRAO } from '../data/ovelhaScenes';
import {
  buildRound, roundValido, computeViewport, escalaArte, artToPx, pxToArt,
  toqueAcertou, celulaToque, erroElegivel, nivelDica, estagioDica,
  MISS_ID, OVELHA_ROUNDS, OVELHA_SOUND_EVENTS,
} from '../services/ovelhaGameService';
import {
  FASES, criarJogo, iniciarRodada, cenaPronta, tocar, liberarErro, avancar, encerrar,
} from '../services/ovelhaGameMachine';

/** Overlay de diagnóstico interno (2.2a §11). DESLIGADO por padrão, nunca em produção. */
const OVELHA_DEBUG_HITBOX = false;

/** Tempos das animações (ms). */
const T = { entrada: 320, acerto: 720, erro: 460 };

/** Cor de cada mock de foreground/oclusor autoral (provisório; trocado por arte no bloco de assets). */
const FG_CORES = Object.freeze({
  arbusto: { corpo: '#6FA84A', sombra: '#588A38' },
  pedra: { corpo: '#A9A29B', sombra: '#8A837C' },
  feno: { corpo: '#E0B85C', sombra: '#C69B3E' },
  cerca: { corpo: '#B98A57', sombra: '#946A3E' },
});

function vibrar() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* segue */ }
}

/* ══════════════════════════ VISUAIS (mocks provisórios) ══════════════════════════ */

/** Ovelha MOCK (fallback interno até a arte oficial). Poses aproximadas por transformação. */
function OvelhaMock({ size, pose, flip }) {
  const crouch = pose === 'crouched' ? 0.86 : 1;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G scale={flip ? -1 : 1} originX={50} originY={50}>
        <G scaleY={crouch} originY={90}>
          <Rect x="38" y="70" width="7" height="18" rx="3.5" fill="#6B5B4E" />
          <Rect x="56" y="70" width="7" height="18" rx="3.5" fill="#6B5B4E" />
          <Circle cx="38" cy="52" r="20" fill="#FBF7F1" />
          <Circle cx="54" cy="46" r="22" fill="#FFFFFF" />
          <Circle cx="66" cy="54" r="17" fill="#FBF7F1" />
          <Ellipse cx="72" cy="44" rx="12" ry="14" fill="#6B5B4E" />
          <Circle cx="72" cy="34" r="7" fill="#FFFFFF" />
          <Circle cx="68" cy="45" r="2.4" fill="#2F241D" />
          <Circle cx="77" cy="45" r="2.4" fill="#2F241D" />
        </G>
      </G>
    </Svg>
  );
}

/** Foreground/oclusor MOCK (arbusto/pedra/feno/cerca) que esconde a base da ovelha. */
function ForegroundMock({ mock, w, h }) {
  const c = FG_CORES[mock] ?? FG_CORES.arbusto;
  return (
    <Svg width={w} height={h} viewBox="0 0 100 100" preserveAspectRatio="none">
      {mock === 'pedra' ? (
        <Path d="M2,100 Q6,45 26,40 Q42,20 60,38 Q84,34 96,64 L100,100 Z" fill={c.corpo} />
      ) : mock === 'feno' ? (
        <Path d="M0,100 Q10,50 24,54 Q34,32 50,50 Q66,32 78,56 Q92,50 100,100 Z" fill={c.corpo} />
      ) : mock === 'cerca' ? (
        <>
          <Rect x="6" y="30" width="88" height="12" rx="3" fill={c.corpo} />
          <Rect x="14" y="24" width="10" height="70" rx="3" fill={c.sombra} />
          <Rect x="46" y="24" width="10" height="70" rx="3" fill={c.sombra} />
          <Rect x="78" y="24" width="10" height="70" rx="3" fill={c.sombra} />
        </>
      ) : (
        <Path d="M0,100 Q4,55 22,54 Q30,32 48,50 Q60,30 74,52 Q94,52 100,100 Z" fill={c.corpo} />
      )}
      {mock !== 'cerca' && <Path d="M0,100 Q4,72 22,70 Q30,54 48,64 Q60,50 74,66 Q94,66 100,100 Z" fill={c.sombra} opacity={0.5} />}
    </Svg>
  );
}

/** Cenário decorativo MOCK (árvore/flor/grama). Parte da arte, sem toque. */
function DecorMock({ tipo, size }) {
  if (tipo === 'arvore') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect x="44" y="60" width="12" height="38" rx="4" fill="#9A6B3F" />
        <Circle cx="50" cy="42" r="30" fill="#7FB350" />
        <Circle cx="32" cy="52" r="20" fill="#8BBE5A" />
        <Circle cx="68" cy="52" r="20" fill="#8BBE5A" />
      </Svg>
    );
  }
  if (tipo === 'flor') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="46" r="14" fill="#F6B6C8" />
        <Circle cx="32" cy="54" r="12" fill="#F6B6C8" />
        <Circle cx="68" cy="54" r="12" fill="#F6B6C8" />
        <Circle cx="50" cy="50" r="8" fill="#F4D06A" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M50,95 Q40,55 34,42" stroke="#8BBE5A" strokeWidth="7" fill="none" strokeLinecap="round" />
      <Path d="M50,95 Q50,55 50,40" stroke="#7FB350" strokeWidth="7" fill="none" strokeLinecap="round" />
      <Path d="M50,95 Q60,55 66,42" stroke="#8BBE5A" strokeWidth="7" fill="none" strokeLinecap="round" />
    </Svg>
  );
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
  const [round, setRound] = useState(null);
  const [nivel, setNivel] = useState(0);
  const [ripple, setRipple] = useState(null);      // { key, x, y } — feedback de erro no ponto
  const [errouAgora, setErrouAgora] = useState(false);

  const jogoRef = useRef(vista);
  const roundIdRef = useRef(0);
  const spotAnteriorRef = useRef(null);
  const salvoRef = useRef(false);
  const timeouts = useRef([]);
  const montado = useRef(true);
  const areaRef = useRef({ largura: 0, altura: 0 });
  // Dica — tudo por rodada (nada vaza):
  const buscaMsRef = useRef(0);
  const nivelRef = useRef(0);
  const erroElegivelRef = useRef(0);
  const ultimoErroIdRef = useRef(null);
  const ultimoErroMsRef = useRef(0);
  const rodadaSeqRef = useRef(0);
  const fn = useRef({});

  const viewport = useMemo(
    () => computeViewport({ largura: areaRef.current.largura || Math.min(width - 24, 520), altura: areaRef.current.altura || 9999 }),
    [width, round, tela],  // recompõe quando a área muda (medida via onLayout força re-render por round)
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

  /* ── Monta UMA rodada a partir da cena autoral. Idempotente por rodada. ── */
  const montarRodada = useCallback(() => {
    if (jogoRef.current.fase !== FASES.TROCANDO) return;
    let r = null;
    for (let tent = 0; tent < 6; tent++) {
      roundIdRef.current += 1;
      const cand = buildRound({
        sceneId: OVELHA_SCENE_PADRAO, dificuldade: 'facil',
        spotAnterior: spotAnteriorRef.current, roundId: roundIdRef.current,
      });
      if (cand && roundValido(cand, 'facil')) { r = cand; break; }
    }
    if (!r) { warn('CadeAOvelhinha: rodada inválida (contrato de cena); abortando.'); return; }

    spotAnteriorRef.current = r.spot.id;
    // itemIds = [alvo, MISS] → a máquina segue igual: alvo=acerto, MISS=erro suave.
    const iniciou = aplicar(iniciarRodada, { targetId: r.targetId, itemIds: [r.targetId, MISS_ID] });
    if (!iniciou.aceito) return;
    rodadaSeqRef.current += 1;
    setRound(r);
    setRipple(null);
    resetarDica();
    fn.current.agendar(() => fn.current.aplicar(cenaPronta), T.entrada);
  }, [aplicar, resetarDica]);

  /* ── Fim da partida: salva UMA vez ── */
  const finalizar = useCallback(async () => {
    if (salvoRef.current) return;
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

  fn.current = { aplicar, agendar, montarRodada, finalizar, aplicarNivel };

  /* ── Ciclo de vida ── */
  useEffect(() => {
    montado.current = true;
    preloadGameSfx();
    let vivo = true;
    getDailyRounds().then((r) => vivo && setRounds(r)).catch((e) => warn('CadeAOvelhinha.rounds:', e));
    readStats().then((s) => vivo && setStats(s)).catch((e) => warn('CadeAOvelhinha.stats:', e));
    return () => { vivo = false; montado.current = false; limparTimers(); releaseGameSfx(); };
  }, [limparTimers]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (e) => setPausado(e !== 'active'));
    const off = navigation.addListener('blur', () => setPausado(true));
    const on = navigation.addListener('focus', () => setPausado(AppState.currentState !== 'active'));
    return () => { sub.remove(); off(); on(); };
  }, [navigation]);

  const jogando = tela === 'jogando';
  const procurando = jogando && vista.fase === FASES.PROCURANDO;

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

  /* ── Começar ── */
  const comecar = useCallback(async () => {
    const r = await consumeRound();
    if (!r.ok) { setRounds(await getDailyRounds()); setTela('entrada'); return; }
    limparTimers();
    resetarDica();
    spotAnteriorRef.current = null;
    salvoRef.current = false;
    jogoRef.current = criarJogo({ rounds: OVELHA_ROUNDS });
    setVista(jogoRef.current);
    setRound(null);
    setResultado(null);
    setRipple(null);
    setPausado(AppState.currentState !== 'active');
    setTela('jogando');
    setRounds(await getDailyRounds());
    if (areaRef.current.largura) fn.current.montarRodada();
  }, [limparTimers, resetarDica]);

  const abandonar = useCallback(() => {
    limparTimers(); resetarDica(); aplicar(encerrar); setTela('entrada');
  }, [aplicar, limparTimers, resetarDica]);

  /* ── Toque na CENA inteira: converte para arte e decide acerto/erro ── */
  const scene = getScene(round?.sceneId);
  const tocarCena = useCallback((e) => {
    if (pausado || !round) return;
    const { locationX: px, locationY: py } = e?.nativeEvent ?? {};
    const acertou = toqueAcertou(px, py, round.spot, scene, viewport);
    const r = aplicar(tocar, acertou ? round.targetId : MISS_ID);
    if (r.aceito && r.acerto === false) {
      // Feedback de erro NO PONTO tocado (ripple) + balanço da mensagem.
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
  }, [aplicar, agendar, pausado, round, scene, viewport, aplicarNivel]);

  useEffect(() => {
    if (jogando && vista.fase === FASES.TROCANDO) fn.current.montarRodada();
  }, [jogando, vista.fase, vista.rodada]);

  const medirArea = useCallback((e) => {
    const { width: w, height: h } = e?.nativeEvent?.layout ?? {};
    if (!w || !h) return;
    const mudou = Math.abs(areaRef.current.largura - w) > 1 || Math.abs(areaRef.current.altura - h) > 1;
    areaRef.current = { largura: w, altura: h };
    if (mudou && jogando && jogoRef.current.fase === FASES.TROCANDO) fn.current.montarRodada();
  }, [jogando]);

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

      {/* Container que mede a área; o VIEWPORT 4:5 centrado captura o toque. */}
      <View style={styles.cenaWrap} onLayout={medirArea}>
        <Pressable
          onPress={tocarCena}
          style={[styles.viewport, { width: viewport.w, height: viewport.h }]}
          accessibilityRole="button"
          accessibilityLabel="Procure a ovelhinha na paisagem"
        >
          {round && (
            <CenaAutoral
              round={round}
              scene={scene}
              viewport={viewport}
              encontrada={vista.fase === FASES.ACERTO}
              estagio={estagio}
              ripple={ripple}
              debug={OVELHA_DEBUG_HITBOX}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

/* ══════════════════════════ CENA (camadas) ══════════════════════════ */

/**
 * Renderiza a cena em camadas por zIndex:
 *   0 background · 1 decor · 2 ovelha · 3 foreground(sem toque) · 4 dica · 5 ripple
 * O toque é capturado pela Pressable-pai (cena inteira), então nada aqui recebe toque.
 */
function CenaAutoral({ round, scene, viewport, encontrada, estagio, ripple, debug }) {
  const s = escalaArte(scene, viewport);
  const spot = round.spot;
  const centro = artToPx(spot.pos, scene, viewport);
  const hbW = spot.hitbox.w * s;
  const hbH = spot.hitbox.h * s;
  const ovSize = Math.min(hbW, hbH) * 0.92 * (spot.escala || 1);
  const fgH = ovSize * (1 - (spot.visivelFrac ?? 0.5));   // altura coberta pelo foreground
  const fgW = ovSize * 1.2;
  const fgMock = scene.foregrounds?.[spot.foreground]?.mock ?? 'arbusto';

  return (
    <>
      {/* 0 — background placeholder (gradiente de campo/céu). */}
      <LinearGradient colors={['#CDE8FB', '#E7F4E4', '#DCEBB6']} style={styles.bg} pointerEvents="none" />
      <View pointerEvents="none" style={styles.chao} />

      {/* 1 — cenário decorativo (parte da arte, sem toque). */}
      {(scene.decorativeLayers ?? []).map((d) => {
        const p = artToPx(d.pos, scene, viewport);
        const sz = d.size * s;
        return (
          <View key={d.id} pointerEvents="none" style={{ position: 'absolute', left: p.px - sz / 2, top: p.py - sz / 2, width: sz, height: sz, zIndex: 1, opacity: 0.85 }}>
            <DecorMock tipo={d.tipo} size={sz} />
          </View>
        );
      })}

      {/* 4 (parte) — brilho discreto na região (estágio 3), ATRÁS da ovelha. Sem círculo grande. */}
      {estagio >= 3 && <BrilhoRegiao cx={centro.px} cy={centro.py} r={ovSize * 0.62} zIndex={1} />}

      {/* 2 — ovelha (atrás do foreground). */}
      <SheepView cx={centro.px} cy={centro.py} size={ovSize} pose={spot.pose} flip={spot.orientacao === 'flip'} encontrada={encontrada} />

      {/* 4 (contorno) — pequeno contorno na PARTE VISÍVEL (estágio 4). */}
      {estagio >= 4 && <ContornoVisivel cx={centro.px} cy={centro.py} size={ovSize} visivelFrac={spot.visivelFrac} />}

      {/* 3 — foreground/oclusor (cobre a base da ovelha; NÃO recebe toque). */}
      <View pointerEvents="none" style={{ position: 'absolute', left: centro.px - fgW / 2, top: centro.py + ovSize / 2 - fgH, width: fgW, height: fgH, zIndex: 3 }}>
        <ForegroundMock mock={fgMock} w={fgW} h={fgH} />
      </View>

      {/* 2 (folha) — movimento de folha/arbusto próximo (estágio 2), reforço não-espacial. */}
      {estagio >= 2 && <FolhaMovimento cx={centro.px} cy={centro.py} size={ovSize} />}

      {/* 5 — ripple de erro no ponto tocado. */}
      {ripple && <TouchRipple key={ripple.key} x={ripple.x} y={ripple.y} />}

      {debug && <DebugOverlay round={round} scene={scene} viewport={viewport} centro={centro} hbW={hbW} hbH={hbH} />}
    </>
  );
}

function SheepView({ cx, cy, size, pose, flip, encontrada }) {
  const pop = useRef(new Animated.Value(1)).current;
  const entrada = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(entrada, { toValue: 1, duration: 300, useNativeDriver: true });
    a.start(); return () => a.stop();
  }, []);
  useEffect(() => {
    if (!encontrada) return undefined;
    const a = Animated.sequence([
      Animated.timing(pop, { toValue: 1.2, duration: 160, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]);
    a.start(); return () => a.stop();
  }, [encontrada]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, zIndex: 2, opacity: entrada, transform: [{ scale: pop }] }}
    >
      <OvelhaMock size={size} pose={encontrada ? 'celebrating' : pose} flip={flip} />
    </Animated.View>
  );
}

/** Brilho discreto (estágio 3) — halo suave e PEQUENO, atrás da ovelha. Não preenche. */
function BrilhoRegiao({ cx, cy, r, zIndex = 1 }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(p, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]));
    a.start(); return () => a.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: r, zIndex, backgroundColor: pt.gold, opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.20] }) }}
    />
  );
}

/** Contorno na parte visível (estágio 4) — arco fino no topo da ovelha, sem tapar. */
function ContornoVisivel({ cx, cy, size, visivelFrac }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(p, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]));
    a.start(); return () => a.stop();
  }, []);
  const d = size * 0.92;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: cx - d / 2, top: cy - d / 2, width: d, height: d, zIndex: 4, opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] }) }}>
      <Svg width={d} height={d} viewBox="0 0 100 100">
        <Path d="M12,54 A38,38 0 0 1 88,54" stroke={pt.goldDeep} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="6 6" />
      </Svg>
    </Animated.View>
  );
}

/** Movimento de folha/arbusto próximo (estágio 2) — balanço leve, reforço não-espacial. */
function FolhaMovimento({ cx, cy, size }) {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(r, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(r, { toValue: -1, duration: 260, useNativeDriver: true }),
      Animated.timing(r, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]));
    a.start(); return () => a.stop();
  }, []);
  const rot = r.interpolate({ inputRange: [-1, 1], outputRange: ['-10deg', '10deg'] });
  const s = size * 0.28;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: cx + size * 0.32, top: cy + size * 0.18, width: s, height: s, zIndex: 3, transform: [{ rotate: rot }] }}>
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Path d="M50,90 Q30,50 50,15 Q70,50 50,90 Z" fill="#7FB350" />
        <Path d="M50,85 L50,25" stroke="#588A38" strokeWidth="4" />
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
  }, []);
  const d = 54;
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: d / 2, borderWidth: 3, borderColor: '#E8A33D', zIndex: 5,
        opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.3] }) }] }}
    />
  );
}

function DebugOverlay({ round, scene, viewport, centro, hbW, hbH }) {
  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', left: centro.px - hbW / 2, top: centro.py - hbH / 2, width: hbW, height: hbH, borderWidth: 1.5, borderColor: '#0E9F6E', zIndex: 6 }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 4, left: 6, zIndex: 6 }}>
        <Text style={styles.debugTxt}>vp {viewport.w}×{viewport.h} · {round.spot.id} · {round.pose} · fg={round.foreground} · vis={Math.round((round.visivelFrac ?? 0) * 100)}%</Text>
      </View>
    </>
  );
}

/* ══════════════════════════ PEÇAS ══════════════════════════ */

function Header({ insets, onBack, chip }) {
  return (
    <LinearGradient colors={['#EAF7EF', '#DDF0E6', '#E8F6EF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
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

  header: { paddingHorizontal: 14, paddingBottom: 10 },
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

  hud: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, paddingVertical: 8, backgroundColor: '#FFF' },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hudText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.text },
  hudRodada: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft },
  dica: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', height: 24, lineHeight: 24 },

  // ── Cena: container mede a área; viewport 4:5 centrado ──
  cenaWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingBottom: 12 },
  viewport: { borderRadius: radii.xl, overflow: 'hidden', backgroundColor: '#DDEFF6', ...shadows.soft },
  bg: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  chao: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '34%', backgroundColor: '#CFE8A6', opacity: 0.5, zIndex: 0 },
  debugTxt: { fontFamily: 'Nunito', fontSize: 9, color: '#C0392B', fontWeight: '800' },

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
