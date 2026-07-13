/**
 * PalavrinhasDoBeniScreen — "Palavrinhas do Beni" (Feature 009 · P4R8 · SEM imagem de palavra).
 *
 * Coordena estados; os desenhos vivem em componentes próprios (PalavrinhasHud, PalavrinhasPowerDock,
 * PalavrinhasChest, PalavrinhasPowerEffect, PalavrinhasBeniWarmer) + cache compartilhado
 * (beniAssetWarmup, aquecido já na BrincarScreen). Novidades P4R8:
 *  1. carregamento antecipado/decodificado do Beni (sem moldura vazia);
 *  2. Corrida e Turbo INFINITOS (terminam por tempo ou encerramento manual);
 *  3. Baú a cada 4 palavras na Corrida (vários por partida; segura o prêmio se o inventário estiver cheio);
 *  4. Bolso Mágico na barra INFERIOR; ativação MANUAL; consumo no IMPACT da máquina de efeito;
 *  5. mantém o Turbo AUTORITATIVO do P4R7 (deadline + TEMPO_ESGOTADO terminal).
 * Sem traçado/MONTE/assets.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Animated, Pressable, ScrollView, StyleSheet, Easing, AppState, AccessibilityInfo, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { ROUTES } from '../constants/routes';
import SoundButton from '../components/SoundButton';
import FaithIcon from '../components/ui/FaithIcon';
import BeniStageCharacter from '../components/beni/BeniStageCharacter';
import PalavrinhasBeniWarmer from '../components/palavrinhas/PalavrinhasBeniWarmer';
import PalavrinhasHud from '../components/palavrinhas/PalavrinhasHud';
import PalavrinhasPowerDock from '../components/palavrinhas/PalavrinhasPowerDock';
import PalavrinhasChest from '../components/palavrinhas/PalavrinhasChest';
import PalavrinhasPowerEffect from '../components/palavrinhas/PalavrinhasPowerEffect';
import PalavrinhasPowerDetailsPanel from '../components/palavrinhas/PalavrinhasPowerDetailsPanel';
import { BENI_POSE_KEYS } from '../assets/mascot/beniImages';
import { iniciarWarmup, minimasProntas as minimasProntasCache, poseReady, readyEvent, assinar } from '../services/beniAssetWarmup';
import { isCreatorQaModeEnabled, subscribeCreatorQaMode } from '../services/creatorQaMode';
import { playGameSfx, preloadGameSfx, releaseGameSfx, stopGameSfx } from '../services/audioManager';
import { getWord } from '../data/palavrinhasWords';
import {
  criarRng, novaSeed, criarDeckState, getDifficulty, PALAVRINHAS_DIFFICULTIES, proximaPaginaAdaptativa, devePausarBloco, PAUSA_BLOCO,
} from '../services/palavrinhasGameService';
import { PALAVRINHAS_PODERES, avaliarUsoDoPoder, sortearCartas, parKey, VOGAIS, fxDuracaoTotal } from '../services/palavrinhasPoderes';
import {
  PORTRAIT_POSES, EVENT_FALLBACK, eventoDoMarco, PERMANENCIA_MS,
  PARTICULAS_TRIPLO, PARTICULAS_SUPER, PARTICULAS_PALAVRA, RAIOS_SUPER,
} from '../services/palavrinhasVisualDirector';
import { addTurboTime, segundosRestantes } from '../services/paresGameService';
import { FASES, EVENTOS, brilhoDaPalavra, criarSessao, reduzir } from '../services/palavrinhasGameMachine';

const ALERTA = '#C0392B';
const TICK = 'countdown_tick';
const TIME_UP = 'time_up_alarm';
const SFX_KEYS = ['card_flip', 'match_success', 'match_error', 'board_complete', 'game_victory', 'classic_victory_jingle', TICK, TIME_UP];
const ALTURA_BANNER_CRIADOR = 22;
const LANTERNA_DELAY_MS = 2600;
const RELAMPAGO_RAPIDO_MS = 3500;
const PRELOAD_TIMEOUT_MS = 4500;

/** Hierarquia sonora (§23) — maiores calam menores; game_victory nunca encoberto. Sem áudio novo. */
const SONS = {
  toque: 'card_flip', letraOk: 'match_success', erro: 'match_error', palavra: 'board_complete',
  triplo: 'classic_victory_jingle', superx: 'game_victory', superCompacto: 'board_complete',
  bauPronto: 'card_flip', bauAbrir: 'card_flip', bauFim: 'board_complete',
  cartaGuardada: 'card_flip', poderPreparo: 'card_flip', poderImpacto: 'board_complete', fim: TIME_UP,
};
const MENORES = ['card_flip', 'match_success', 'match_error', 'board_complete', TICK];
function tocar(key, maior = false) {
  const s = SONS[key] || key;
  if (maior) MENORES.forEach((m) => { if (m !== s) stopGameSfx(m); });
  playGameSfx(s);
}

const TEMAS = {
  facil: { grad: ['#FFFDF7', '#F3FAEE'], gradOk: ['#F0FBEF', '#E7F6E2'], borda: '#E7E2C2', accent: pt.greenDeep },
  medio: { grad: ['#FBF4FF', '#FFF1E2'], gradOk: ['#F6EEFF', '#FFE9D6'], borda: '#E7D4F5', accent: pt.purple },
  dificil: { grad: ['#FFF2EA', '#FFE4DC'], gradOk: ['#FFEDE0', '#FFDACE'], borda: '#F3C9B8', accent: pt.beniDeep },
};
const GRAD_DOURADO = ['#FFF6D6', '#FFE9A8'];

function falaBeni({ estado, feedback, modoResgate, tempoBaixo, faltam }) {
  if (estado === 'entrada') return 'Vamos descobrir as letrinhas escondidas?';
  if (modoResgate) return 'Toque na letrinha que brilha.';
  if (feedback === 'acerto') return 'Boa! Continua assim.';
  if (feedback === 'erro2') return 'Com calma. Olhe de novo.';
  if (feedback === 'erro') return 'Quase! Tente outra.';
  if (tempoBaixo) return 'O tempo corre. Vamos!';
  if (faltam > 1) return 'Quais letrinhas faltam?';
  return 'Qual letrinha falta?';
}

const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

function MolduraAlerta({ pulso, largura }) {
  const esp = Math.round(Math.min(10, Math.max(6, largura * 0.018)));
  const op = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  const faixa = (pos, extra) => <Animated.View key={pos} pointerEvents="none" style={[{ position: 'absolute', backgroundColor: ALERTA, opacity: op }, extra]} />;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {faixa('t', { top: 0, left: 0, right: 0, height: esp })}
      {faixa('b', { bottom: 0, left: 0, right: 0, height: esp })}
      {faixa('l', { top: 0, bottom: 0, left: 0, width: esp })}
      {faixa('r', { top: 0, bottom: 0, right: 0, width: esp })}
    </View>
  );
}

function Particulas({ layout, anim, cores, reduzMovim }) {
  return (
    <View pointerEvents="none" style={styles.particulasWrap}>
      {layout.map((p, i) => {
        const rad = (p.anguloDeg * Math.PI) / 180;
        const dx = Math.cos(rad) * p.distF * 150;
        const dy = Math.sin(rad) * p.distF * 150;
        const op = anim.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 1, 1, 0] });
        const trans = reduzMovim
          ? [{ scale: anim }]
          : [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) }, { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) }, { scale: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1, 0.9] }) }];
        return (
          <Animated.View key={i} style={{ position: 'absolute', opacity: op, transform: trans }}>
            <FaithIcon name="star" size={p.size} color={cores[i % cores.length]} />
          </Animated.View>
        );
      })}
    </View>
  );
}

function RaiosSuper({ anim }) {
  const rot = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const op = anim.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 0.9, 0.9, 0] });
  return (
    <Animated.View pointerEvents="none" style={[styles.raios, { opacity: op, transform: [{ rotate: rot }] }]}>
      {Array.from({ length: RAIOS_SUPER }).map((_, i) => (
        <View key={i} style={[styles.raio, { backgroundColor: i % 2 ? '#F3722C' : pt.gold, transform: [{ rotate: `${i * (180 / RAIOS_SUPER)}deg` }] }]} />
      ))}
    </Animated.View>
  );
}

export default function PalavrinhasDoBeniScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardW = Math.min(width - 20, 500);

  const [tela, setTela] = useState('entrada');
  const [nivel, setNivel] = useState('facil');
  const [estado, setEstado] = useState(() => criarSessao());
  const [pagina, setPagina] = useState(null);
  const [preenchidas, setPreenchidas] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [modoResgate, setModoResgate] = useState(false);
  const [reduzMovim, setReduzMovim] = useState(false);
  const [restante, setRestante] = useState(0);
  const [comboPalavras, setComboPalavras] = useState(0);
  const [melhorCombo, setMelhorCombo] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const [efeito, setEfeito] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [overlayPose, setOverlayPose] = useState(EVENT_FALLBACK);
  const [inputTravado, setInputTravado] = useState(false);
  const [magia, setMagia] = useState(0);
  const [bauPronto, setBauPronto] = useState(false);
  const [bolso, setBolso] = useState([]);
  const [poderFxAtivo, setPoderFxAtivo] = useState(null);
  const [escudoArmado, setEscudoArmado] = useState(false);
  const [palcoDim, setPalcoDim] = useState(false);
  const [dicaBolso, setDicaBolso] = useState(false);
  const [pausaModal, setPausaModal] = useState(false);
  const [pausaPedago, setPausaPedago] = useState(null);   // pausa pedagógica { n } (modos infinitos)
  const [capitulo, setCapitulo] = useState(false);
  const [portraitPose, setPortraitPose] = useState('avatarBase');   // pose ESTÁVEL da palavra (só muda entre palavras)
  const [poderDetalhe, setPoderDetalhe] = useState(null);           // poder aberto no painel
  const [compacto, setCompacto] = useState(null);                   // celebração compacta { tipo, seq }
  const [criadorAtivo, setCriadorAtivo] = useState(isCreatorQaModeEnabled());
  const [voo, setVoo] = useState(null);
  const [shakeIdx, setShakeIdx] = useState(-1);
  const [slotErro, setSlotErro] = useState(-1);
  const [bauCartas, setBauCartas] = useState([]);
  const [lanternaAlvo, setLanternaAlvo] = useState(null);
  const [dourada, setDourada] = useState(false);
  const [minimasProntas, setMinimasProntas] = useState(minimasProntasCache());
  const [diag, setDiag] = useState(false);
  const [diagCena, setDiagCena] = useState('poses');
  const [, setTickPoses] = useState(0);

  const estadoRef = useRef(estado);
  const deckStateRef = useRef(criarDeckState());
  const rngRef = useRef(null);
  const validandoRef = useRef(false);
  const montado = useRef(true);
  const timers = useRef([]);
  const intervalRef = useRef(null);
  const restanteRef = useRef(0);
  const deadlineRef = useRef(0);
  const ultimoSegRef = useRef(0);
  const finalizadoRef = useRef(false);
  const motivoFimRef = useRef(null);   // 'livro' | 'tempo' | 'encerrada'
  const comboRef = useRef(0);
  const melhorRef = useRef(0);
  const seqRef = useRef(0);
  const magiaRef = useRef(0);
  const bausRef = useRef(0);
  const bauPendenteRef = useRef(false);
  const poderesUsadosRef = useRef(0);
  const poderEscolhidoRef = useRef(null);
  const bolsoRef = useRef([]);
  const ultimoParRef = useRef(null);
  const dicaBolsoRef = useRef(false);
  const bonusSegRef = useRef(0);
  const maiorPalavraRef = useRef(0);
  const brilhoBonusRef = useRef(0);
  const assistidaRef = useRef(false);
  const errosLacunaRef = useRef({ pos: -1, n: 0 });
  const errosSeguidosRef = useRef(0);
  const telaBauRef = useRef(false);
  const lanternaRef = useRef(false);
  const escudoRef = useRef(false);
  const douradaRef = useRef(false);
  const pageStartRef = useRef(0);
  const relampagoRef = useRef(false);
  const perfeitaRef = useRef(false);
  const eventoTokenRef = useRef(0);
  const inputTravadoRef = useRef(false);
  const overlayAtivoRef = useRef(false);
  const pausaModalRef = useRef(false);
  const pausaPedagoRef = useRef(false);   // pausa pedagógica aberta (congela deadline + bloqueia input)
  const pausaMarcoRef = useRef(0);        // último marco (16/32/…) em que a pausa já abriu
  const poderFxAtivoRef = useRef(null);
  const portraitPoseRef = useRef(null);
  const superGrandeFeitoRef = useRef(false);   // Super grande só na PRIMEIRA vez (seq 5)
  const superSeqRef = useRef(0);
  const preenchidasRef = useRef({});
  const paginaRef = useRef(null);
  const slotRefs = useRef([]);
  const optRefs = useRef([]);
  const entrada = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const raiosAnim = useRef(new Animated.Value(0)).current;
  const particAnim = useRef(new Animated.Value(0)).current;
  const anelAnim = useRef(new Animated.Value(0)).current;
  const textoAnim = useRef(new Animated.Value(0)).current;
  const vooAnim = useRef(new Animated.Value(0)).current;
  const beniJump = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shineX = useRef(new Animated.Value(0)).current;

  const cfg = getDifficulty(nivel);
  const tema = TEMAS[nivel] || TEMAS.facil;
  const tempoBaixo = cfg.timed && tela === 'jogando' && restante > 0 && restante <= (cfg.alertaMs || 0);
  const tempoCritico = tempoBaixo && restante <= 3000;
  const faltam = pagina ? pagina.lacunas.length - Object.keys(preenchidas).length : 0;

  const agendar = useCallback((fn, ms) => { const t = setTimeout(() => { if (montado.current) fn(); }, ms); timers.current.push(t); return t; }, []);
  const limparTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  const pararRelogio = useCallback(() => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } stopGameSfx(TICK); }, []);
  const aplicarPreench = useCallback((next) => { preenchidasRef.current = next; setPreenchidas(next); }, []);
  // Overlay/Baú só abrem com a pose EVENT decodificada (readyEvent); senão, fallback já pronto.
  const poseEventProntaOuFallback = useCallback((pose) => (readyEvent(pose) ? pose : (readyEvent(EVENT_FALLBACK) ? EVENT_FALLBACK : (readyEvent('avatarBase') ? 'avatarBase' : null))), []);
  // Pose portrait ESTÁVEL da palavra: escolhida por RNG da partida, sem repetir a anterior.
  const escolherPosePortrait = useCallback(() => {
    const anterior = portraitPoseRef.current;
    const cands = PORTRAIT_POSES.filter((p) => p !== anterior);
    const r = rngRef.current ? rngRef.current() : 0.5;
    const nova = cands[Math.floor(r * cands.length)] || 'avatarBase';
    portraitPoseRef.current = nova; setPortraitPose(nova);
  }, []);

  useEffect(() => {
    montado.current = true;
    preloadGameSfx(SFX_KEYS);   // sons prontos antes da partida
    iniciarWarmup();            // reutiliza o cache já iniciado na BrincarScreen
    setMinimasProntas(minimasProntasCache());
    const off = assinar(() => { if (montado.current) { setMinimasProntas(minimasProntasCache()); setTickPoses((n) => n + 1); } });
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => { if (montado.current) setReduzMovim(!!v); }).catch(() => {});
    setCriadorAtivo(isCreatorQaModeEnabled());
    const unsub = subscribeCreatorQaMode(() => { if (montado.current) setCriadorAtivo(isCreatorQaModeEnabled()); });
    const sub = AppState.addEventListener('change', (s) => { if (s !== 'active') { pararRelogio(); return; } recalcularDeadline(); });
    const blur = navigation.addListener('blur', () => pararRelogio());
    const to = setTimeout(() => { if (montado.current) setMinimasProntas(true); }, PRELOAD_TIMEOUT_MS);
    return () => {
      montado.current = false; limparTimers(); pararRelogio(); clearTimeout(to);
      pulso.stopAnimation(); overlayAnim.stopAnimation(); raiosAnim.stopAnimation(); particAnim.stopAnimation();
      anelAnim.stopAnimation(); textoAnim.stopAnimation(); vooAnim.stopAnimation(); beniJump.stopAnimation(); shineX.stopAnimation();
      stopGameSfx(TICK); releaseGameSfx();
      off && off(); unsub && unsub(); sub && sub.remove(); blur && blur();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSt = useCallback((st) => { estadoRef.current = st; setEstado(st); }, []);
  const disparar = useCallback((ev) => { const r = reduzir(estadoRef.current, ev); setSt(r.estado); return r; }, [setSt]);

  useEffect(() => {
    if (!tempoBaixo || reduzMovim) { pulso.stopAnimation(); pulso.setValue(0); return undefined; }
    const dur = restante <= 3000 ? 240 : 410;
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(pulso, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(pulso, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]));
    anim.start();
    return () => anim.stop();
  }, [tempoBaixo, reduzMovim, restante, pulso]);

  const pularBeni = useCallback(() => {
    if (reduzMovim) return;
    beniJump.setValue(0);
    Animated.sequence([Animated.spring(beniJump, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }), Animated.timing(beniJump, { toValue: 0, duration: 200, useNativeDriver: true })]).start();
  }, [beniJump, reduzMovim]);

  /* ─── Relógio por DEADLINE (mantém o Turbo AUTORITATIVO do P4R7) ─── */
  const pausadoAgora = useCallback(() => estadoRef.current.fase !== FASES.PENSANDO || telaBauRef.current || inputTravadoRef.current || overlayAtivoRef.current || pausaModalRef.current || pausaPedagoRef.current || !!poderFxAtivoRef.current, []);

  const tick = useCallback(() => {
    if (!montado.current || finalizadoRef.current) return;
    if (pausadoAgora()) { deadlineRef.current = Date.now() + restanteRef.current; return; }
    const rem = Math.max(0, deadlineRef.current - Date.now());
    restanteRef.current = rem;
    const segNow = Math.ceil(rem / 1000);
    if (segNow !== ultimoSegRef.current) { ultimoSegRef.current = segNow; setRestante(rem); if (rem > 0 && rem <= (cfg.alertaMs || 0)) playGameSfx(TICK); }
    if (rem <= 0) esgotarTempo();   // eslint-disable-line no-use-before-define
  }, [pausadoAgora, cfg.alertaMs]);

  const recalcularDeadline = useCallback(() => {
    if (!cfg.timed || finalizadoRef.current || tela !== 'jogando') return;
    if (pausadoAgora()) { deadlineRef.current = Date.now() + restanteRef.current; return; }
    const rem = Math.max(0, deadlineRef.current - Date.now());
    restanteRef.current = rem; setRestante(rem);
    if (rem <= 0) esgotarTempo();   // eslint-disable-line no-use-before-define
  }, [cfg.timed, tela, pausadoAgora]);

  const iniciarRelogio = useCallback(() => {
    if (!cfg.timed) return;
    restanteRef.current = cfg.tempoInicialMs; setRestante(cfg.tempoInicialMs);
    deadlineRef.current = Date.now() + cfg.tempoInicialMs;
    ultimoSegRef.current = Math.ceil(cfg.tempoInicialMs / 1000);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => tick(), 250);
  }, [cfg, tick]);

  const ajustarTempo = useCallback((deltaMs) => {
    if (!cfg.timed) return;
    if (deltaMs >= 0) { restanteRef.current = addTurboTime(restanteRef.current, deltaMs, cfg.tempoMaxMs); bonusSegRef.current += Math.round(deltaMs / 1000); }
    else restanteRef.current = Math.max(0, restanteRef.current + deltaMs);
    deadlineRef.current = Date.now() + restanteRef.current;
    setRestante(restanteRef.current);
    if (restanteRef.current > (cfg.alertaMs || 0)) stopGameSfx(TICK);
  }, [cfg]);

  const dispararOverlayAnims = useCallback(() => {
    overlayAnim.setValue(reduzMovim ? 1 : 0); particAnim.setValue(0); anelAnim.setValue(0); textoAnim.setValue(0);
    if (reduzMovim) { anelAnim.setValue(1); textoAnim.setValue(1); particAnim.setValue(1); return; }
    Animated.timing(overlayAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    Animated.timing(anelAnim, { toValue: 1, duration: 300, delay: 150, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }).start();
    Animated.timing(particAnim, { toValue: 1, duration: 620, delay: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    Animated.sequence([Animated.timing(textoAnim, { toValue: 1, duration: 260, delay: 400, useNativeDriver: true }), Animated.timing(textoAnim, { toValue: 0.85, duration: 200, useNativeDriver: true }), Animated.timing(textoAnim, { toValue: 1, duration: 160, useNativeDriver: true })]).start();
  }, [overlayAnim, particAnim, anelAnim, textoAnim, reduzMovim]);

  const correrShine = useCallback(() => {
    if (reduzMovim) return;
    shineX.setValue(0);
    Animated.timing(shineX, { toValue: 1, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [shineX, reduzMovim]);

  const animarEntradaPagina = useCallback(() => {
    entrada.setValue(reduzMovim ? 1 : 0);
    if (!reduzMovim) Animated.timing(entrada, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [entrada, reduzMovim]);

  const limparEvento = useCallback(() => {
    setOverlay(null); overlayAtivoRef.current = false; setEfeito(null); setPalcoDim(false); setCompacto(null);
    overlayAnim.setValue(0); raiosAnim.setValue(0); particAnim.setValue(0); anelAnim.setValue(0); textoAnim.setValue(0);
    inputTravadoRef.current = false; setInputTravado(false);
  }, [overlayAnim, raiosAnim, particAnim, anelAnim, textoAnim]);

  const armarLanterna = useCallback(() => {
    if (!lanternaRef.current) return;
    if (estadoRef.current.fase === FASES.RESGATANDO) return;
    agendar(() => {
      if (!montado.current || !lanternaRef.current) return;
      if (estadoRef.current.fase !== FASES.PENSANDO) return;
      const pg = paginaRef.current; if (!pg) return;
      const filled = Object.keys(preenchidasRef.current).length;
      const pos = pg.lacunas[filled];
      if (pos == null) return;
      setLanternaAlvo(pg.word.letters[pos]);
      lanternaRef.current = false;
    }, reduzMovim ? 900 : LANTERNA_DELAY_MS);
  }, [agendar, reduzMovim]);

  const montarPagina = useCallback((pag) => {
    const word = getWord(pag.wordId);
    const options = pag.options.slice();
    eventoTokenRef.current += 1;
    setOverlay(null); overlayAtivoRef.current = false; setEfeito(null); setPalcoDim(false); inputTravadoRef.current = false; setInputTravado(false);
    slotRefs.current = []; optRefs.current = [];
    aplicarPreench({}); setModoResgate(false); setFeedback(null); setVoo(null); setLanternaAlvo(null); setSlotErro(-1); assistidaRef.current = false;
    errosLacunaRef.current = { pos: -1, n: 0 };
    pageStartRef.current = Date.now();
    const nova = { word, lacunas: pag.lacunas.slice(), options };
    paginaRef.current = nova; setPagina(nova);
    setPoderDetalhe(null); setCompacto(null);
    escolherPosePortrait();   // NOVA pose portrait só quando a palavra entra (estável durante a palavra)
    disparar({ tipo: EVENTOS.PALAVRA_PRONTA, letras: pag.lacunas.length, dicaAuto: false });
    animarEntradaPagina();
    correrShine();
    armarLanterna();
  }, [disparar, animarEntradaPagina, correrShine, armarLanterna, aplicarPreench, escolherPosePortrait]);

  const apresentarPagina = useCallback((primeira) => {
    if (finalizadoRef.current) return;
    const r = proximaPaginaAdaptativa({
      dificuldade: nivel, rng: rngRef.current, deckState: deckStateRef.current,
      combo: comboRef.current, errosSeguidos: errosSeguidosRef.current, primeira: !!primeira,
    });
    deckStateRef.current = r.deckState;
    if (!r.pagina) { pararRelogio(); setTela('fim'); return; }
    montarPagina(r.pagina);
  }, [nivel, pararRelogio, montarPagina]);

  const esgotarTempo = useCallback(() => {
    if (finalizadoRef.current) return;
    finalizadoRef.current = true; motivoFimRef.current = 'tempo';
    limparTimers(); pararRelogio(); eventoTokenRef.current += 1;
    inputTravadoRef.current = true;
    lanternaRef.current = false; escudoRef.current = false; douradaRef.current = false;
    restanteRef.current = 0; setRestante(0);
    disparar({ tipo: EVENTOS.TEMPO_ESGOTADO });
    limparEvento();
    tocar('fim', true);
    setTela('fim');
  }, [limparTimers, pararRelogio, disparar, limparEvento]);

  /* ─── Encerramento MANUAL (§2) ─── */
  const abrirPausa = useCallback(() => { if (finalizadoRef.current) return; pausaModalRef.current = true; setPausaModal(true); stopGameSfx(TICK); }, []);
  const continuarPartida = useCallback(() => { pausaModalRef.current = false; setPausaModal(false); }, []);
  const encerrarManual = useCallback((comSom = true) => {
    if (finalizadoRef.current) return;
    finalizadoRef.current = true; motivoFimRef.current = 'encerrada';
    limparTimers(); pararRelogio(); eventoTokenRef.current += 1;
    inputTravadoRef.current = true;
    const st = estadoRef.current;
    if (st && st.fase !== FASES.FINALIZADO) estadoRef.current = reduzir(st, { tipo: EVENTOS.ABANDONAR }).estado;
    pausaModalRef.current = false; setPausaModal(false); pausaPedagoRef.current = false; setPausaPedago(null);
    limparEvento();
    if (comSom) tocar('fim', true);   // encerramento manual do cabeçalho; a pausa pedagógica encerra SEM alarme
    setTela('fim');
  }, [limparTimers, pararRelogio, limparEvento]);

  /* ─── Pausa PEDAGÓGICA (P4.1) — só nos modos infinitos, a cada 16 palavras ─── */
  const abrirPausaPedagogica = useCallback((n) => {
    pausaMarcoRef.current = n;   // não repete no mesmo marco
    pausaPedagoRef.current = true; inputTravadoRef.current = true; setInputTravado(true);
    stopGameSfx(TICK);
    setPausaPedago({ n });       // deadline congelado por pausadoAgora (pausaPedagoRef)
  }, []);
  const continuarPausaPedago = useCallback(() => {
    if (finalizadoRef.current) return;
    pausaPedagoRef.current = false; setPausaPedago(null);
    inputTravadoRef.current = false; setInputTravado(false);
    apresentarPagina(false);     // monta a próxima palavra; deadline retoma sem perder tempo da pausa
  }, [apresentarPagina]);   // eslint-disable-line no-use-before-define

  const abrirBau = useCallback(() => {
    telaBauRef.current = true; bauPendenteRef.current = false; setBauPronto(false); setTela('bau');
    tocar('bauAbrir', true);
    agendar(() => playGameSfx(SONS.bauFim), 170);
    const ctx = { timed: cfg.timed, restanteMs: restanteRef.current, tempoMaxMs: cfg.tempoMaxMs, ativos: bolsoRef.current.map((p) => p.id), nOpcoes: cfg.opcoes };
    const cartas = sortearCartas(rngRef.current, ctx, ultimoParRef.current);
    ultimoParRef.current = parKey(cartas);
    setBauCartas(cartas);
  }, [cfg.timed, cfg.tempoMaxMs, cfg.opcoes, agendar]);

  const guardarNoBolso = useCallback((poder) => {
    if (bolsoRef.current.length >= 2) return;
    const novo = [...bolsoRef.current, { id: poder.id, nome: poder.nome, curto: poder.curto, icon: poder.icon, cor: poder.cor, label: poder.label }];
    bolsoRef.current = novo; setBolso(novo);
    if (!dicaBolsoRef.current) { dicaBolsoRef.current = true; setDicaBolso(true); agendar(() => { if (montado.current) setDicaBolso(false); }, 3800); }   // onboarding único, 3,5–4s
  }, [agendar]);

  const escolherCarta = useCallback((poder) => {
    poderEscolhidoRef.current = { nome: poder.nome };
    tocar('cartaGuardada');
    guardarNoBolso(poder);
    magiaRef.current = 0; setMagia(0);
    telaBauRef.current = false;
    setTela('jogando');
    agendar(() => apresentarPagina(false), reduzMovim ? 60 : 260);
  }, [guardarNoBolso, agendar, apresentarPagina, reduzMovim]);

  const celebrarEAvancar = useCallback((token) => {
    if (finalizadoRef.current) return;
    if (token != null && eventoTokenRef.current !== token) return;
    limparEvento();
    const a = disparar({ tipo: EVENTOS.AVANCAR_PAGINA });
    if (a.estado.fase !== FASES.APRESENTANDO_PALAVRA) {   // fim (Livro concluído em modo finito)
      pararRelogio(); if (!cfg.infinito) motivoFimRef.current = 'livro'; setTela('fim'); return;
    }
    // Baú a cada 4 palavras (Corrida). 1º Baú abre automático (onboarding); os seguintes ficam
    // "Baú pronto" na barra (manual). Segura o prêmio se o inventário estiver cheio ou a imagem não pronta.
    const querBau = cfg.magia && (magiaRef.current >= cfg.bauApos || bauPendenteRef.current);
    if (querBau) {
      const poseBauOk = readyEvent('comBau') || readyEvent(EVENT_FALLBACK) || readyEvent('avatarBase');
      const auto = bausRef.current === 0;   // primeiro Baú = onboarding automático (prioridade sobre a pausa)
      if (auto && bolsoRef.current.length < 2 && poseBauOk) { bausRef.current += 1; abrirBau(); return; }
      bauPendenteRef.current = true; setBauPronto(true); tocar('bauPronto');   // seguintes: "Baú pronto" manual
    }
    // Pausa PEDAGÓGICA (P4.1): ponto SEGURO entre palavras; só nos modos infinitos, a cada 16.
    if (devePausarBloco(cfg, a.estado.concluidas, pausaMarcoRef.current)) {
      abrirPausaPedagogica(a.estado.concluidas); return;   // NÃO monta a próxima palavra ainda
    }
    apresentarPagina(false);
  }, [disparar, apresentarPagina, pararRelogio, abrirBau, limparEvento, abrirPausaPedagogica, cfg]);

  // Abertura MANUAL do Baú (barra "Baú pronto") — só na palavra, sem interromper evento/poder.
  const abrirBauManual = useCallback(() => {
    if (finalizadoRef.current || !bauPendenteRef.current || bolsoRef.current.length >= 2) return;
    if (inputTravadoRef.current || overlayAtivoRef.current || poderFxAtivoRef.current || estadoRef.current.fase !== FASES.PENSANDO) return;
    if (!(readyEvent('comBau') || readyEvent(EVENT_FALLBACK) || readyEvent('avatarBase'))) return;
    bausRef.current += 1; abrirBau();
  }, [abrirBau]);

  const iniciarEventoCelebracao = useCallback((kind, seq) => {
    if (finalizadoRef.current) return;
    const token = (eventoTokenRef.current += 1);
    setFeedback('acerto'); setEfeito('completa');   // portrait NÃO muda (bPose é a pose da palavra)
    correrShine();
    ajustarTempo(cfg.bonusMs || 0);
    // Super GRANDE só na PRIMEIRA vez (seq 5); marcos seguintes (10/15/…) e Triplo = compacto.
    const superGrande = kind === 'super' && seq === 5 && !superGrandeFeitoRef.current;
    const poseEv = superGrande ? poseEventProntaOuFallback('celebrando2') : null;
    let dwell;
    if (superGrande && poseEv) {
      superGrandeFeitoRef.current = true; superSeqRef.current = seq;
      inputTravadoRef.current = true; setInputTravado(true); overlayAtivoRef.current = true;
      setOverlayPose(poseEv); setOverlay('super'); dispararOverlayAnims();   // 1º frame já com imagem ready
      raiosAnim.setValue(0); if (!reduzMovim) Animated.timing(raiosAnim, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }).start();
      tocar('superx', true);
      dwell = PERMANENCIA_MS.SUPER_BENI;
    } else if (kind === 'super' || kind === 'triplo') {
      // celebração COMPACTA (abaixo do palco; sem overlay de personagem; ≤700ms)
      if (kind === 'super') superGrandeFeitoRef.current = true;
      inputTravadoRef.current = true; setInputTravado(true);
      setCompacto({ tipo: kind, seq });
      tocar(kind === 'super' ? 'superCompacto' : 'triplo', true);
      if (kind === 'triplo') ajustarTempo(2000);
      dwell = 680;
    } else {
      pularBeni();
      particAnim.setValue(0); if (!reduzMovim) Animated.timing(particAnim, { toValue: 1, duration: 620, useNativeDriver: true }).start();
      tocar('palavra', true);
      dwell = PERMANENCIA_MS.PALAVRA_COMPLETA;
    }
    agendar(() => {
      if (!montado.current || finalizadoRef.current || eventoTokenRef.current !== token) return;
      celebrarEAvancar(token);
    }, dwell + 20);
  }, [correrShine, pularBeni, ajustarTempo, cfg.bonusMs, poseEventProntaOuFallback, dispararOverlayAnims, raiosAnim, particAnim, reduzMovim, agendar, celebrarEAvancar]);

  const finalizarPalavra = useCallback(() => {
    if (finalizadoRef.current) return;
    disparar({ tipo: EVENTOS.TRACADO_PRONTO }); disparar({ tipo: EVENTOS.TRACADO_OK }); disparar({ tipo: EVENTOS.RESOLVER });
    const palavraFinal = estadoRef.current.palavra || {};
    const resgatou = !!palavraFinal.resgate;
    const brilho = brilhoDaPalavra(palavraFinal);
    const rp = disparar({ tipo: EVENTOS.PROXIMA_PAGINA });
    const seqNova = rp.estado.sequencia;
    comboRef.current = seqNova; setComboPalavras(seqNova);
    if (seqNova > melhorRef.current) { melhorRef.current = seqNova; setMelhorCombo(seqNova); }
    if (douradaRef.current) { brilhoBonusRef.current += brilho; douradaRef.current = false; setDourada(false); }
    if (cfg.magia) { magiaRef.current = Math.min(cfg.bauApos, magiaRef.current + 1); setMagia(magiaRef.current); }
    if (pagina && pagina.word.letters.length > maiorPalavraRef.current) maiorPalavraRef.current = pagina.word.letters.length;
    if (!resgatou && !assistidaRef.current && pageStartRef.current && (Date.now() - pageStartRef.current) < RELAMPAGO_RAPIDO_MS) relampagoRef.current = true;
    if (brilho === 3 && !resgatou) perfeitaRef.current = true;
    // "Novo capítulo" a cada 8 na Corrida (transição curta, sem overlay longo)
    if (cfg.id === 'medio' && rp.estado.concluidas > 0 && rp.estado.concluidas % 8 === 0) { setCapitulo(true); agendar(() => { if (montado.current) setCapitulo(false); }, 600); }
    const ev = eventoDoMarco(seqNova);
    const kind = ev === 'SUPER_BENI' ? 'super' : ev === 'BRILHO_TRIPLO' ? 'triplo' : 'completa';
    iniciarEventoCelebracao(kind, seqNova);
  }, [disparar, pagina, cfg.magia, cfg.bauApos, cfg.id, iniciarEventoCelebracao, agendar]);

  const finalizarAcerto = useCallback((pos, faseAposResolver) => {
    if (finalizadoRef.current) return;
    const next = { ...preenchidasRef.current, [pos]: true };
    aplicarPreench(next);
    setLanternaAlvo(null);
    validandoRef.current = false;
    if (faseAposResolver === FASES.PREPARANDO_TRACADO) finalizarPalavra();
    else armarLanterna();
  }, [finalizarPalavra, armarLanterna, aplicarPreench]);

  const voarPeca = useCallback((idx, pos, letra, faseAposResolver) => {
    const oRef = optRefs.current[idx]; const sRef = slotRefs.current[pos];
    if (reduzMovim || !oRef || !sRef || !oRef.measureInWindow) { finalizarAcerto(pos, faseAposResolver); return; }
    oRef.measureInWindow((ox, oy, ow, oh) => {
      if (!montado.current) return;
      sRef.measureInWindow((sx, sy, sw, sh) => {
        if (!montado.current) { finalizarAcerto(pos, faseAposResolver); return; }
        setVoo({ letra, from: { x: ox + ow / 2, y: oy + oh / 2 }, to: { x: sx + sw / 2, y: sy + sh / 2 } });
        vooAnim.setValue(0);
        Animated.timing(vooAnim, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true })
          .start(() => { if (montado.current) { setVoo(null); finalizarAcerto(pos, faseAposResolver); } });
      });
    });
  }, [reduzMovim, finalizarAcerto, vooAnim]);

  const balancarErro = useCallback((idx, pos) => {
    setShakeIdx(idx); setSlotErro(pos);
    if (!reduzMovim) { shakeAnim.setValue(0); Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }), Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }), Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start(); }
    agendar(() => { if (montado.current) { setShakeIdx(-1); setSlotErro(-1); } }, 520);
  }, [shakeAnim, reduzMovim, agendar]);

  /* ─── Poderes: ativação MANUAL → máquina de efeito (consumo no IMPACT) ─── */
  const ctxAtivacao = useCallback((excluirId) => {
    const pg = paginaRef.current;
    const filled = Object.keys(preenchidasRef.current).length;
    const emResgate = estadoRef.current.fase === FASES.RESGATANDO;
    const pos = pg ? pg.lacunas[filled] : null;
    const corretas = pg ? new Set(pg.lacunas.map((p) => pg.word.letters[p])) : new Set();
    const incorretas = pg ? pg.options.filter((o) => !corretas.has(o)) : [];
    const vogalNaLacunaAtual = pg && pos != null ? VOGAIS.includes((pg.word.normalizedWord || '')[pos]) : false;
    return {
      timed: cfg.timed, restanteMs: restanteRef.current, tempoMaxMs: cfg.tempoMaxMs,
      ativos: bolsoRef.current.map((p) => p.id).filter((id) => id !== excluirId),
      lacunaAtiva: !!pg && filled < pg.lacunas.length, emResgate,
      nOpcoes: pg ? pg.options.length : 0, nIncorretasRemoviveis: incorretas.length,
      palavraComecada: filled > 0, palavraAtiva: !!pg && estadoRef.current.fase === FASES.PENSANDO,
      vogalNaLacunaAtual, temOutraPalavra: true, emCelebracao: !!overlayAtivoRef.current || inputTravadoRef.current,
    };
  }, [cfg.timed, cfg.tempoMaxMs]);

  const removerDoBolso = useCallback((id) => { const novo = bolsoRef.current.filter((p) => p.id !== id); bolsoRef.current = novo; setBolso(novo); }, []);

  const preencherLacunaAtual = useCallback((assist) => {
    if (finalizadoRef.current) return;
    const pg = paginaRef.current; if (!pg) return;
    const filled = Object.keys(preenchidasRef.current).length;
    const pos = pg.lacunas[filled]; if (pos == null) return;
    if (estadoRef.current.fase !== FASES.PENSANDO) return;
    validandoRef.current = true;
    if (assist) assistidaRef.current = true;
    seqRef.current += 1; setSequencia(seqRef.current);
    disparar({ tipo: EVENTOS.TOCAR_LETRA, correta: true });
    const r = disparar({ tipo: EVENTOS.RESOLVER });
    finalizarAcerto(pos, r.estado.fase);
  }, [disparar, finalizarAcerto]);

  const trocarPalavra = useCallback(() => { if (!finalizadoRef.current) apresentarPagina(false); }, [apresentarPagina]);

  const aplicarVento = useCallback(() => {
    const pg = paginaRef.current; if (!pg) return;
    const corretas = new Set(pg.lacunas.map((p) => pg.word.letters[p]));
    const erradas = pg.options.filter((o) => !corretas.has(o));
    const podeRemover = Math.min(2, Math.max(0, pg.options.length - 2), erradas.length);
    if (podeRemover <= 0) return;
    const remover = new Set(erradas.slice(0, podeRemover));
    const novasOpts = pg.options.filter((o) => !remover.has(o));
    const np = { ...pg, options: novasOpts }; paginaRef.current = np; setPagina(np);
  }, []);

  // impacto: consome (remove do bolso) e aplica a lógica imediata
  const onPoderImpact = useCallback(() => {
    const poder = poderFxAtivoRef.current; if (!poder) return;
    playGameSfx(SONS.poderImpacto);
    removerDoBolso(poder.id);   // consumo NO IMPACT
    if (poder.id === 'lanterna') { setPalcoDim(true); const pg = paginaRef.current; const filled = Object.keys(preenchidasRef.current).length; const pos = pg ? pg.lacunas[filled] : null; if (pos != null) setLanternaAlvo(pg.word.letters[pos]); lanternaRef.current = false; }
    else if (poder.id === 'relogio') ajustarTempo(6000);
    else if (poder.id === 'vento') aplicarVento();
    else if (poder.id === 'escudo') { escudoRef.current = true; setEscudoArmado(true); }
    else if (poder.id === 'dourada') { douradaRef.current = true; setDourada(true); }
  }, [ajustarTempo, aplicarVento, removerDoBolso]);

  // fim: limpa, retoma; efeitos de preenchimento/troca ocorrem aqui (após a animação)
  const onPoderFinish = useCallback(() => {
    const poder = poderFxAtivoRef.current;
    poderFxAtivoRef.current = null; setPoderFxAtivo(null); setPalcoDim(false);
    inputTravadoRef.current = false; setInputTravado(false);
    if (poder && (poder.id === 'ima' || poder.id === 'vogais')) preencherLacunaAtual(true);
    else if (poder && poder.id === 'troca') trocarPalavra();
  }, [preencherLacunaAtual, trocarPalavra]);

  // TOQUE no slot → abre o PAINEL (nunca ativa em silêncio; o slot SEMPRE responde).
  const abrirPainelPoder = useCallback((poder) => {
    if (finalizadoRef.current || overlayAtivoRef.current || poderFxAtivoRef.current) return;
    setDicaBolso(false);   // a dica de onboarding some ao tocar / abrir o painel
    setPoderDetalhe(poder);
  }, []);
  const fecharPainelPoder = useCallback(() => setPoderDetalhe(null), []);

  // "Usar agora" no painel: só executa se avaliarUsoDoPoder permitir; senão o painel mostra o motivo.
  const usarPoderDoPainel = useCallback((poder) => {
    if (finalizadoRef.current || inputTravadoRef.current || overlayAtivoRef.current || poderFxAtivoRef.current) return;
    const aval = avaliarUsoDoPoder(poder, ctxAtivacao(poder.id));
    if (!aval.podeUsar) return;   // painel continua mostrando o motivo (não consome)
    setPoderDetalhe(null);
    inputTravadoRef.current = true; setInputTravado(true);
    poderFxAtivoRef.current = poder; setPoderFxAtivo(poder);
    poderesUsadosRef.current += 1;
    playGameSfx(SONS.poderPreparo);
    // SEGURANÇA: garante limpeza mesmo se o efeito não chamar onFinish (nunca trava a partida).
    agendar(() => {
      if (montado.current && poderFxAtivoRef.current === poder) {
        try { onPoderImpact(); } catch (_) { /* noop */ }
        try { onPoderFinish(); } catch (_) { /* noop */ }   // eslint-disable-line no-use-before-define
      }
    }, fxDuracaoTotal(poder.id) + 600);
  }, [ctxAtivacao, agendar, onPoderImpact]);

  const onTapLetra = useCallback((letra, idx) => {
    if (finalizadoRef.current) return;
    const st = estadoRef.current;
    if (validandoRef.current || !pagina || inputTravadoRef.current) return;
    const filled = Object.keys(preenchidasRef.current).length;
    const pos = pagina.lacunas[filled];
    const esperada = pos != null ? pagina.word.letters[pos] : null;
    if (st.fase === FASES.RESGATANDO) {
      if (letra !== esperada) return;
      validandoRef.current = true;
      const r = disparar({ tipo: EVENTOS.RESGATE_CONCLUIDO }); setModoResgate(false);
      voarPeca(idx, pos, letra, r.estado.fase);
      return;
    }
    if (st.fase !== FASES.PENSANDO) return;
    validandoRef.current = true;
    const correta = letra === esperada;
    if (correta) {
      setFeedback(null); errosLacunaRef.current = { pos: -1, n: 0 }; errosSeguidosRef.current = 0;
      seqRef.current += 1; setSequencia(seqRef.current);
      disparar({ tipo: EVENTOS.TOCAR_LETRA, correta: true });
      const r = disparar({ tipo: EVENTOS.RESOLVER });
      const completa = r.estado.fase === FASES.PREPARANDO_TRACADO;
      if (!completa) tocar('letraOk');
      voarPeca(idx, pos, letra, r.estado.fase);
    } else {
      seqRef.current = 0; setSequencia(0);
      if (escudoRef.current) {   // Escudo consumido no erro REAL
        escudoRef.current = false; setEscudoArmado(false); setFeedback('erro'); tocar('erro'); balancarErro(idx, pos);
        agendar(() => { validandoRef.current = false; }, 120);
        agendar(() => { if (montado.current) setFeedback((f) => (f === 'erro' ? null : f)); }, 900);
        return;
      }
      errosSeguidosRef.current += 1;
      tocar('erro'); balancarErro(idx, pos);
      const el = errosLacunaRef.current; const n = el.pos === pos ? el.n + 1 : 1; errosLacunaRef.current = { pos, n };
      disparar({ tipo: EVENTOS.TOCAR_LETRA, correta: false });
      const r = disparar({ tipo: EVENTOS.RESOLVER });
      if (n >= 2) {
        setFeedback('erro2');
        setPagina((prev) => { const np = prev ? { ...prev, options: [...prev.options].reverse() } : prev; paginaRef.current = np; return np; });
        ajustarTempo(-(cfg.penalidade2oErroMs || 0));
      } else {
        setFeedback('erro');
        if (cfg.id === 'facil' || cfg.id === 'medio') setLanternaAlvo(esperada);
      }
      agendar(() => { validandoRef.current = false; }, 120);
      agendar(() => { if (montado.current) setFeedback((f) => (f === 'erro' || f === 'erro2' ? null : f)); }, 1000);
      if (r.estado.fase === FASES.RESGATANDO) setModoResgate(true);
    }
  }, [pagina, disparar, agendar, voarPeca, balancarErro, ajustarTempo, cfg]);

  const sairComSeguranca = useCallback(() => {
    limparTimers(); pararRelogio();
    const st = estadoRef.current;
    if (st && st.fase !== FASES.FINALIZADO && st.fase !== FASES.SELECIONANDO_DIFICULDADE) estadoRef.current = reduzir(st, { tipo: EVENTOS.ABANDONAR }).estado;
    navigation.goBack();
  }, [navigation, limparTimers, pararRelogio]);

  const comecar = useCallback(() => {
    limparTimers(); pararRelogio(); setDiag(false); limparEvento();
    validandoRef.current = false; finalizadoRef.current = false; motivoFimRef.current = null; comboRef.current = 0; melhorRef.current = 0; seqRef.current = 0;
    magiaRef.current = 0; bausRef.current = 0; bauPendenteRef.current = false; poderesUsadosRef.current = 0; poderEscolhidoRef.current = null; bonusSegRef.current = 0; maiorPalavraRef.current = 0; brilhoBonusRef.current = 0;
    errosSeguidosRef.current = 0; telaBauRef.current = false; lanternaRef.current = false; escudoRef.current = false; douradaRef.current = false;
    pageStartRef.current = 0; relampagoRef.current = false; perfeitaRef.current = false; assistidaRef.current = false; eventoTokenRef.current += 1;
    bolsoRef.current = []; ultimoParRef.current = null; dicaBolsoRef.current = false; pausaModalRef.current = false; poderFxAtivoRef.current = null;
    pausaPedagoRef.current = false; pausaMarcoRef.current = 0; setPausaPedago(null);
    portraitPoseRef.current = null; superGrandeFeitoRef.current = false;
    setComboPalavras(0); setMelhorCombo(0); setSequencia(0); setMagia(0); setBauPronto(false); setDourada(false); setLanternaAlvo(null); setBolso([]); setEscudoArmado(false); setDicaBolso(false); setPausaModal(false); setPoderFxAtivo(null); setCapitulo(false); setPoderDetalhe(null); setCompacto(null);
    const seed = novaSeed(); rngRef.current = criarRng(seed); deckStateRef.current = criarDeckState();
    const dummy = new Array(Math.min(cfg.rounds, 9999)).fill(0).map(() => ({}));
    let st = criarSessao();
    st = reduzir(st, { tipo: EVENTOS.ESCOLHER_DIFICULDADE, dificuldade: nivel }).estado;
    st = reduzir(st, { tipo: EVENTOS.SESSAO_PRONTA, plano: dummy }).estado;
    st = reduzir(st, { tipo: EVENTOS.LIVRO_ABERTO }).estado;
    setSt(st); setTela('jogando'); iniciarRelogio();
    agendar(() => apresentarPagina(true), 0);
  }, [nivel, limparTimers, pararRelogio, limparEvento, setSt, iniciarRelogio, agendar, apresentarPagina, cfg.rounds]);

  /* ─────────────────────────── Render ─────────────────────────── */
  const headerTop = Math.max(insets.top, 10) + (criadorAtivo ? ALTURA_BANNER_CRIADOR : 0);
  const inputBloqueado = estado.fase !== FASES.PENSANDO && estado.fase !== FASES.RESGATANDO;
  const seg = segundosRestantes(restante);

  // A pose do guia é ESTÁVEL na palavra (não muda por acerto/erro/evento/tempo/Resgate).
  const bPose = portraitPose;

  const p = pagina;
  const nLetras = p ? p.word.letters.length : 4;
  const fb = nLetras <= 5 ? 48 : nLetras <= 8 ? 40 : nLetras <= 10 ? 32 : 26;
  const slotW = Math.max(22, Math.min(fb, Math.floor((cardW - 30) / nLetras) - 5));
  const fSize = Math.max(17, Math.round(slotW * 0.62));
  const slotsEl = useMemo(() => {
    if (!p) return null;
    const filledCount = Object.keys(preenchidas).length;
    return (
      <View style={styles.slots}>
        {p.word.letters.map((ch, i) => {
          const isGap = p.lacunas.includes(i);
          const val = preenchidas[i];
          const atual = isGap && !val && p.lacunas[filledCount] === i;
          const mostra = !isGap || val;
          const erroAqui = slotErro === i;
          return (
            <View key={`${p.word.id}-${i}`} ref={(r) => { if (isGap) slotRefs.current[i] = r; }}
              style={[styles.slot, { width: slotW, height: slotW + 10 }, isGap && !val && styles.slotVazio, atual && styles.slotAtual, dourada && styles.slotDourado, erroAqui && styles.slotErro, val && styles.slotOk]}>
              <Text style={[styles.slotTxt, { fontSize: fSize }, val && { color: pt.greenDeep }]}>{mostra ? ch : ''}</Text>
            </View>
          );
        })}
        {!reduzMovim ? <Animated.View pointerEvents="none" style={[styles.shine, { opacity: shineX.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.7, 0.7, 0] }), transform: [{ translateX: shineX.interpolate({ inputRange: [0, 1], outputRange: [-40, cardW] }) }] }]} /> : null}
      </View>
    );
  }, [p, preenchidas, slotErro, dourada, slotW, fSize, reduzMovim, shineX, cardW]);

  // Título COMPACTO só durante partida ativa com controles concorrentes (relógio + Encerrar) — P4.1.
  const emPartidaComControles = tela === 'jogando' && cfg.timed;
  const tituloHeader = emPartidaComControles ? 'Palavrinhas' : 'Palavrinhas do Beni';
  const Header = (
    <LinearGradient colors={[pt.beniSoft, '#FFF7EC']} style={[styles.header, { paddingTop: headerTop }]}>
      <View style={styles.headerRow}>
        <SoundButton style={styles.backPill} onPress={sairComSeguranca} accessibilityLabel="Voltar"><FaithIcon name="back" size={16} color={pt.text} /></SoundButton>
        <Text style={styles.headerTitle} numberOfLines={1}>{tituloHeader}</Text>
        {emPartidaComControles ? (
          <View style={styles.headerDir}>
            <Animated.View style={[styles.relogio, tempoBaixo && { backgroundColor: ALERTA + '22', borderColor: ALERTA }, tempoBaixo && !reduzMovim && { transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]}>
              <FaithIcon name="timer" size={13} color={tempoBaixo ? ALERTA : pt.beniDeep} />
              <Text style={[styles.relogioTxt, tempoBaixo && { color: ALERTA }]}>{seg}s</Text>
            </Animated.View>
            <SoundButton style={styles.encerrarBtn} onPress={abrirPausa} accessibilityRole="button" accessibilityLabel="Encerrar a partida"><FaithIcon name="home" size={13} color={pt.beniDeep} /><Text style={styles.encerrarTxt}>Encerrar</Text></SoundButton>
          </View>
        ) : <View style={{ width: 56 }} />}
      </View>
    </LinearGradient>
  );

  /* ── Laboratório DEV ── */
  if (tela === 'entrada' && diag && criadorAtivo) {
    const cenas = ['poses', 'triplo', 'super', 'poderes', 'tempo'];
    return (
      <View style={styles.root}>{Header}<PalavrinhasBeniWarmer />
        <ScrollView contentContainerStyle={[styles.diagWrap, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.diagTitulo}>Laboratório visual (dev)</Text>
          <View style={styles.diagAbas}>
            {cenas.map((c) => <SoundButton key={c} onPress={() => setDiagCena(c)} style={[styles.diagAba, diagCena === c && styles.diagAbaSel]}><Text style={[styles.diagAbaTxt, diagCena === c && styles.diagAbaTxtSel]}>{c}</Text></SoundButton>)}
          </View>
          {diagCena === 'poses' && (
            <View style={styles.diagGrid}>
              {BENI_POSE_KEYS.map((pose) => {
                const noPortrait = PORTRAIT_POSES.includes(pose);
                const ready = poseReady(pose);
                return (
                  <View key={pose} style={styles.diagItem}>
                    <View style={styles.diagDupla}>
                      {noPortrait ? <BeniStageCharacter presentation="portrait" pose={pose} size={64} reduzMovim={reduzMovim} /> : <View style={[styles.diagVazio, { width: 64, height: 64 }]}><Text style={styles.diagNA}>—</Text></View>}
                      <BeniStageCharacter presentation="event" pose={pose} size={72} reduzMovim={reduzMovim} />
                    </View>
                    <Text style={styles.diagLabel}>{pose}</Text>
                    <Text style={[styles.diagTag, { color: ready ? pt.greenDeep : pt.danger }]}>{ready ? 'ready' : 'loading'}</Text>
                  </View>
                );
              })}
            </View>
          )}
          {(diagCena === 'triplo' || diagCena === 'super') && (
            <View style={styles.diagCenaBox}>
              <View style={styles.diagEvento}>
                {diagCena === 'super' ? <RaiosSuper anim={raiosAnim} /> : null}
                <BeniStageCharacter presentation="event" pose={diagCena === 'super' ? 'celebrando2' : 'celebrando'} size={diagCena === 'super' ? 168 : 150} reduzMovim={reduzMovim} />
              </View>
            </View>
          )}
          {diagCena === 'poderes' && (
            <View style={styles.diagGrid}>
              {PALAVRINHAS_PODERES.map((pd) => <View key={pd.id} style={styles.diagPoder}><View style={[styles.cartaIcon, { backgroundColor: pd.cor + '22' }]}><FaithIcon name={pd.icon} size={26} color={pd.cor} /></View><Text style={styles.diagLabel}>{pd.curto}</Text></View>)}
            </View>
          )}
          {diagCena === 'tempo' && <Text style={styles.diagSub}>Turbo/Corrida infinitos; encerramento manual; relógio por deadline (0s finaliza ≤250ms).</Text>}
          <SoundButton style={styles.btnSecundario} onPress={() => setDiag(false)}><Text style={styles.btnSecundarioTxt}>Fechar</Text></SoundButton>
        </ScrollView>
      </View>
    );
  }

  /* ── Entrada ── */
  if (tela === 'entrada') {
    return (
      <View style={styles.root}>{Header}<PalavrinhasBeniWarmer />
        <View style={[styles.centro, { paddingBottom: insets.bottom + 16 }]}>
          <BeniStageCharacter presentation="event" pose="celebrando" lado="esquerda" size={128} reduzMovim={reduzMovim} />
          <View style={[styles.balaoSolo, { maxWidth: cardW }]}><Text style={styles.balaoTxt}>{falaBeni({ estado: 'entrada' })}</Text></View>
          <LinearGradient colors={['#FFFDF7', '#FFF3DD']} style={[styles.livro, { width: cardW }]}>
            <View style={styles.livroFaixa}><Text style={styles.livroFaixaTxt}>Livro Mágico de Palavrinhas</Text></View>
            <Text style={styles.livroSub}>Escolha como quer brincar</Text>
            <View style={styles.difCol}>
              {PALAVRINHAS_DIFFICULTIES.map((m) => {
                const sel = nivel === m.id;
                const sub = m.infinito ? (m.magia ? 'sem fim · com Baú e poderes' : 'sem fim · o mais rápido possível') : `${m.rounds} palavras · sem pressa`;
                return (
                  <SoundButton key={m.id} onPress={() => setNivel(m.id)} style={[styles.difChip, sel && styles.difChipSel]}>
                    <Text style={[styles.difChipTxt, sel && styles.difChipTxtSel]}>{m.label}</Text>
                    <Text style={[styles.difChipSub, sel && styles.difChipTxtSel]}>{sub}</Text>
                  </SoundButton>
                );
              })}
            </View>
          </LinearGradient>
          {minimasProntas ? (
            <SoundButton style={styles.btnPrimario} soundType="success" onPress={comecar}><FaithIcon name="palavrinhas" size={20} color="#FFF" /><Text style={styles.btnPrimarioTxt}>Abrir o Livro</Text></SoundButton>
          ) : (
            <View style={[styles.btnPrimario, styles.btnPrimarioOff]}><FaithIcon name="palavrinhas" size={20} color="#FFF" /><Text style={styles.btnPrimarioTxt}>Preparando o Beni...</Text></View>
          )}
          {criadorAtivo ? <SoundButton style={styles.btnDev} onPress={() => setDiag(true)}><Text style={styles.btnDevTxt}>Laboratório (dev)</Text></SoundButton> : null}
        </View>
      </View>
    );
  }

  /* ── Baú ── */
  if (tela === 'bau') {
    return (
      <View style={styles.root}>{Header}<PalavrinhasBeniWarmer />
        <LinearGradient colors={['#FFF6E2', '#F3E8FF']} style={[styles.centroBau, { paddingBottom: insets.bottom + 16 }]}>
          <PalavrinhasChest
            cartas={bauCartas}
            onEscolher={escolherCarta}
            beni={<BeniStageCharacter presentation="event" pose={poseEventProntaOuFallback('comBau') || 'comBau'} lado="esquerda" size={120} reduzMovim={reduzMovim} />}
          />
        </LinearGradient>
      </View>
    );
  }

  /* ── Fim ── */
  if (tela === 'fim') {
    const semPalavras = estado.concluidas === 0;
    const brilhos = estado.brilhoTotal + brilhoBonusRef.current;
    const maior = maiorPalavraRef.current;
    const motivo = motivoFimRef.current;
    const motivoTxt = motivo === 'tempo' ? 'Tempo esgotado' : motivo === 'encerrada' ? 'Partida encerrada' : (cfg.id === 'facil' ? 'Livro concluído' : null);
    const principal = cfg.infinito ? plural(estado.concluidas, 'palavra', 'palavras') : plural(estado.concluidas, 'palavra aprendida', 'palavras aprendidas');
    const stats = [];
    stats.push({ n: melhorCombo, lbl: 'Melhor sequência\nde palavras' });
    stats.push({ star: true, lbl: plural(brilhos, 'brilho', 'brilhos') });
    if (maior > 0) stats.push({ n: maior, lbl: `Maior palavra\n${plural(maior, 'letra', 'letras')}` });
    if (cfg.timed && bonusSegRef.current > 0) stats.push({ n: `${bonusSegRef.current}s`, lbl: 'Tempo bônus' });
    if (cfg.magia && poderesUsadosRef.current > 0) stats.push({ icon: 'star', lbl: `${plural(poderesUsadosRef.current, 'poder usado', 'poderes usados')}` });
    const stats4 = stats.slice(0, 4);
    const destaques = [];
    if (perfeitaRef.current) destaques.push({ icon: 'star', nome: 'Palavra Perfeita' });
    if (relampagoRef.current) destaques.push({ icon: 'timer', nome: 'Resposta Relâmpago' });
    if (melhorCombo >= 3) destaques.push({ icon: 'combo', nome: 'Sequência Brilhante' });
    if (cfg.magia && bausRef.current > 0) destaques.push({ icon: 'lumi', nome: 'Guardião da Magia' });
    if (cfg.sobrevivencia && estado.concluidas >= 8) destaques.push({ icon: 'star', nome: 'Recorde do Turbo' });
    const destaques2 = destaques.slice(0, 2);
    return (
      <View style={styles.root}>{Header}<PalavrinhasBeniWarmer />
        <ScrollView contentContainerStyle={[styles.centroFim, { paddingBottom: insets.bottom + 16 }]}>
          <BeniStageCharacter presentation="event" pose="celebrando2" lado="esquerda" size={140} reduzMovim={reduzMovim} />
          {semPalavras ? (
            <>
              <Text style={styles.fimTitulo}>Você começou seu livrinho!</Text>
              <View style={[styles.balaoSolo, { maxWidth: cardW }]}><Text style={styles.balaoTxt}>Toda tentativa vale. Vamos tentar de novo?</Text></View>
            </>
          ) : (
            <>
              {motivoTxt ? <Text style={styles.fimSelo}>{motivoTxt}</Text> : null}
              <Text style={styles.fimPrincipal}>{principal}</Text>
              {destaques2.length ? (
                <View style={styles.destaquesRow}>{destaques2.map((d) => <View key={d.nome} style={styles.destaque}><FaithIcon name={d.icon} size={15} color={pt.goldDeep} /><Text style={styles.destaqueTxt}>{d.nome}</Text></View>)}</View>
              ) : null}
              <View style={styles.statsRow}>
                {stats4.map((s, i) => (
                  <View key={i} style={styles.statBox}>
                    {s.star ? <View style={styles.statStar}><FaithIcon name="star" size={18} color={pt.goldDeep} /></View>
                      : s.icon ? <View style={styles.statStar}><FaithIcon name={s.icon} size={18} color={pt.purpleDeep} /></View>
                        : <Text style={styles.statNum}>{s.n}</Text>}
                    <Text style={styles.statLbl}>{s.lbl}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          <SoundButton style={styles.btnPrimario} soundType="success" onPress={comecar}><FaithIcon name="restart" size={18} color="#FFF" /><Text style={styles.btnPrimarioTxt}>Jogar de novo</Text></SoundButton>
          <SoundButton style={styles.btnSecundario} onPress={() => setTela('entrada')}><Text style={styles.btnSecundarioTxt}>Trocar modo</Text></SoundButton>
          <View style={styles.fimLinha}>
            <SoundButton style={styles.btnMini} onPress={() => navigation.navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })}><FaithIcon name="brincar" size={15} color={pt.textSoft} /><Text style={styles.btnMiniTxt}>Brincar</Text></SoundButton>
            <SoundButton style={styles.btnMini} onPress={() => navigation.navigate(ROUTES.HOME)}><FaithIcon name="home" size={15} color={pt.textSoft} /><Text style={styles.btnMiniTxt}>Início</Text></SoundButton>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ── Jogando ── */
  const pulseBorderColor = pulso.interpolate({ inputRange: [0, 1], outputRange: [tema.borda, ALERTA] });
  const gradPalco = dourada ? GRAD_DOURADO : (efeito === 'completa' ? tema.gradOk : tema.grad);
  const falaAtual = (overlay || poderFxAtivo) ? '' : falaBeni({ estado: 'jogo', feedback, modoResgate, tempoBaixo, faltam });

  return (
    <View style={styles.root}>{Header}<PalavrinhasBeniWarmer />
      <View style={[styles.jogo, { paddingBottom: insets.bottom + 6 }]}>
        <PalavrinhasHud nivel={nivel} cfg={cfg} tema={tema} concluidas={estado.concluidas} brilhoTotal={estado.brilhoTotal} comboPalavras={comboPalavras} melhorCombo={melhorCombo} />
        {capitulo ? <View style={styles.capitulo}><Text style={styles.capituloTxt}>Novo capítulo</Text></View> : null}

        {p && (
          <Animated.View style={{ width: cardW, opacity: entrada, transform: [{ translateX: entrada.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }) }] }}>
            <View style={styles.guiaRow}>
              <BeniStageCharacter presentation="portrait" pose={bPose} lado="esquerda" size={72} reduzMovim={reduzMovim} jump={beniJump} />
              <View style={[styles.balaoGuia, { maxWidth: cardW - 96 }]}><Text style={styles.balaoTxt} numberOfLines={2}>{falaAtual}</Text></View>
            </View>

            <Animated.View style={[styles.palcoCard, dourada && styles.palcoDourado, efeito === 'super' && styles.palcoSuper, efeito === 'triplo' && styles.palcoTriplo, { borderColor: tempoBaixo && !reduzMovim ? pulseBorderColor : (efeito === 'completa' ? tema.accent : tema.borda) }]}>
              <LinearGradient colors={gradPalco} style={styles.palcoBg}>
                <View pointerEvents="none" style={styles.fundoStars}>
                  {[0, 1, 2, 3, 4].map((i) => <FaithIcon key={i} name="star" size={14 + (i % 3) * 6} color={tema.accent + '18'} />)}
                </View>
                {(lanternaAlvo || palcoDim) && !reduzMovim ? <View pointerEvents="none" style={styles.lanternaDim} /> : null}
                {slotsEl}
                {tempoBaixo && seg <= 3 && seg > 0 ? <Text style={styles.contagemGrande}>{seg}</Text> : null}
              </LinearGradient>
            </Animated.View>

            <View style={styles.efeitosArea} pointerEvents="none">
              {compacto ? (
                <View style={[styles.compacto, compacto.tipo === 'super' && styles.compactoSuper]}>
                  <View style={styles.compactoStars}>{[0, 1, 2].map((k) => <FaithIcon key={k} name="star" size={compacto.tipo === 'super' ? 30 : 26} color={compacto.tipo === 'super' ? '#F3722C' : pt.gold} />)}</View>
                  <Text style={styles.compactoTxt}>{compacto.tipo === 'super' ? `Super Beni! ${compacto.seq} seguidas` : 'Brilho Triplo!'}</Text>
                </View>
              ) : (efeito === 'completa' && !overlay && !reduzMovim ? <Particulas layout={PARTICULAS_PALAVRA} anim={particAnim} cores={[pt.gold, '#FFE08A']} reduzMovim={reduzMovim} /> : null)}
            </View>

            <View style={styles.opcoes}>
              {p.options.map((op, idx) => {
                const filled = Object.keys(preenchidas).length;
                const esperada = p.word.letters[p.lacunas[filled]];
                const emResgate = estado.fase === FASES.RESGATANDO;
                const revelar = (modoResgate && op === esperada) || (lanternaAlvo && op === lanternaAlvo);
                const desativado = emResgate ? op !== esperada : (inputBloqueado || inputTravado);
                const shaking = shakeIdx === idx;
                return (
                  <Animated.View key={`${op}-${idx}`} ref={(r) => { optRefs.current[idx] = r; }}
                    style={shaking && !reduzMovim ? { transform: [{ translateX: shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-7, 7] }) }] } : null}>
                    <Pressable disabled={desativado} onPressIn={() => { if (!desativado) tocar('toque'); }} onPress={() => onTapLetra(op, idx)} accessibilityLabel={`Letra ${op}`}
                      style={({ pressed }) => [styles.opt, revelar && styles.optRevelar, desativado && !revelar && styles.optOff, pressed && !desativado && styles.optPress]}>
                      <Text style={styles.optTxt}>{op}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        <View style={{ flex: 1 }} />

        {/* Barra INFERIOR do Bolso Mágico (só na Corrida) */}
        {nivel === 'medio' ? (
          <PalavrinhasPowerDock magia={magia} bauApos={cfg.bauApos} bauPronto={bauPronto} bolso={bolso} onUsar={abrirPainelPoder} onAbrirBau={abrirBauManual} coach={dicaBolso && !overlay && !poderFxAtivo && !pausaModal} reduzMovim={reduzMovim} bloqueado={inputTravado} escudoArmado={escudoArmado} />
        ) : null}
      </View>

      {voo && !reduzMovim ? (
        <Animated.View pointerEvents="none" style={[styles.voo, {
          left: voo.from.x - 22, top: voo.from.y - 22,
          transform: [
            { translateX: vooAnim.interpolate({ inputRange: [0, 1], outputRange: [0, voo.to.x - voo.from.x] }) },
            { translateY: vooAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -30, voo.to.y - voo.from.y] }) },
            { scale: vooAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 0.9] }) },
          ],
        }]}><Text style={styles.vooTxt}>{voo.letra}</Text></Animated.View>
      ) : null}

      {/* Efeito de PODER (máquina prepare/impact/resolve/finish) */}
      {poderFxAtivo ? <PalavrinhasPowerEffect poder={poderFxAtivo} reduzMovim={reduzMovim} onImpact={onPoderImpact} onFinish={onPoderFinish} /> : null}

      {/* ACONTECIMENTO: Super / Triplo */}
      {overlay ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay, { opacity: overlayAnim }]}>
          <View style={overlay === 'super' ? styles.overlayDimForte : styles.overlayDim} />
          {overlay === 'super' && !reduzMovim ? <RaiosSuper anim={raiosAnim} /> : null}
          <Animated.View style={[styles.anelUm, { opacity: anelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }), transform: [{ scale: anelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]} />
          {overlay === 'super' ? <Animated.View style={[styles.anelDois, { opacity: anelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }), transform: [{ scale: anelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.15] }) }] }]} /> : null}
          <View style={styles.overlayCentro}>
            <BeniStageCharacter presentation="event" pose={overlayPose} size={overlay === 'super' ? 190 : 158} reduzMovim={reduzMovim} jump={beniJump} />
            <Particulas layout={overlay === 'super' ? PARTICULAS_SUPER : PARTICULAS_TRIPLO} anim={particAnim} cores={overlay === 'super' ? ['#FFD54A', '#FFE9A8', '#F3722C'] : ['#FFD54A', '#FFF0B0']} reduzMovim={reduzMovim} />
            <Animated.Text style={[overlay === 'super' ? styles.superTxt : styles.triploTxt, { opacity: textoAnim, transform: [{ scale: textoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>{overlay === 'super' ? 'SUPER BENI!' : 'BRILHO TRIPLO!'}</Animated.Text>
            {overlay === 'super' ? <Animated.Text style={[styles.superSub, { opacity: textoAnim }]}>{superSeqRef.current} palavras seguidas</Animated.Text> : null}
          </View>
        </Animated.View>
      ) : null}

      {/* Confirmação de encerramento manual */}
      {pausaModal ? (
        <View style={[StyleSheet.absoluteFill, styles.modalWrap]}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Encerrar a partida?</Text>
            <Text style={styles.modalSub}>Seu resultado será salvo nesta rodada.</Text>
            <SoundButton style={styles.btnPrimario} soundType="success" onPress={continuarPartida}><Text style={styles.btnPrimarioTxt}>Continuar jogando</Text></SoundButton>
            <SoundButton style={styles.btnSecundario} onPress={() => encerrarManual(true)}><Text style={styles.btnSecundarioTxt}>Encerrar partida</Text></SoundButton>
          </View>
        </View>
      ) : null}

      {/* Pausa PEDAGÓGICA (P4.1) — acolhedora, reutiliza a pose portrait já decodificada */}
      {pausaPedago ? (
        <View style={[StyleSheet.absoluteFill, styles.modalWrap]}>
          <View style={styles.modalCard}>
            <BeniStageCharacter presentation="portrait" pose={bPose} size={84} reduzMovim={reduzMovim} />
            <Text style={styles.modalTitulo}>Você já completou {pausaPedago.n} palavras!</Text>
            <Text style={styles.modalSub}>Quer continuar brincando ou encerrar por aqui?</Text>
            <SoundButton style={styles.btnPrimario} soundType="success" onPress={continuarPausaPedago} accessibilityRole="button" accessibilityLabel="Continuar jogando"><Text style={styles.btnPrimarioTxt}>Continuar jogando</Text></SoundButton>
            <SoundButton style={styles.btnSecundario} onPress={() => encerrarManual(false)} accessibilityRole="button" accessibilityLabel="Encerrar partida"><Text style={styles.btnSecundarioTxt}>Encerrar partida</Text></SoundButton>
          </View>
        </View>
      ) : null}

      {/* Painel LARGO de informação do poder (abre no toque do slot; "Usar agora" ativa) */}
      {poderDetalhe ? (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={fecharPainelPoder} accessibilityLabel="Fechar" />
          <PalavrinhasPowerDetailsPanel
            poder={poderDetalhe}
            aval={avaliarUsoDoPoder(poderDetalhe, ctxAtivacao(poderDetalhe.id))}
            onUsar={usarPoderDoPainel}
            onGuardar={fecharPainelPoder}
            largura={Math.min(width - 32, 460)}
            bottom={insets.bottom + 100}
          />
        </>
      ) : null}

      {tempoBaixo && !reduzMovim && <MolduraAlerta pulso={pulso} largura={width} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  header: { paddingHorizontal: 14, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerDir: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  encerrarBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: radii.pill, backgroundColor: pt.surface, borderWidth: 1.5, borderColor: '#F0DEB8' },
  encerrarTxt: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.beniDeep },
  compacto: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: pt.goldSoft, borderWidth: 1.5, borderColor: pt.goldDeep },
  compactoSuper: { backgroundColor: pt.beniSoft, borderColor: pt.beni },
  compactoStars: { flexDirection: 'row', gap: 4 },
  compactoTxt: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.beniDeep },
  backPill: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: '#F0DEB8' },
  headerTitle: { flex: 1, fontFamily: 'FredokaOne', fontSize: 18, color: pt.text },
  relogio: { minWidth: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 10, height: 30, borderRadius: 15, backgroundColor: pt.surface, borderWidth: 1.5, borderColor: '#F0DEB8' },
  relogioTxt: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.beniDeep },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, gap: 12 },
  centroBau: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  centroFim: { alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10, paddingHorizontal: 12, gap: 10, flexGrow: 1 },
  jogo: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 6, paddingHorizontal: 12, gap: 8 },
  capitulo: { paddingVertical: 4, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: pt.goldSoft, borderWidth: 1, borderColor: pt.goldDeep },
  capituloTxt: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.premiumText },
  guiaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 84, paddingLeft: 2 },
  balaoGuia: { flex: 1, backgroundColor: pt.cream, borderRadius: radii.lg, paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: '#EBD9AE' },
  palcoCard: { borderRadius: radii.xl, borderWidth: 3, ...shadows.card, overflow: 'hidden', marginTop: 4 },
  palcoTriplo: { borderColor: pt.goldDeep },
  palcoSuper: { borderColor: pt.beni },
  palcoDourado: { borderColor: pt.goldDeep },
  palcoBg: { paddingTop: 20, paddingBottom: 20, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', minHeight: 128 },
  fundoStars: { position: 'absolute', top: 6, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-around', opacity: 0.7 },
  lanternaDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,20,10,0.22)' },
  slots: { flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' },
  slot: { borderRadius: 12, backgroundColor: pt.surface, borderWidth: 2, borderColor: '#E6D6AE', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  slotVazio: { backgroundColor: '#FFFBF0', borderColor: '#E7C98C', borderStyle: 'dashed' },
  slotAtual: { borderColor: pt.beni, backgroundColor: pt.beniSoft, borderWidth: 3 },
  slotDourado: { borderColor: pt.goldDeep },
  slotErro: { borderColor: pt.beni, backgroundColor: '#FFEDE0', borderWidth: 3 },
  slotOk: { backgroundColor: pt.greenSoft, borderColor: pt.greenDeep },
  slotTxt: { fontFamily: 'FredokaOne', color: pt.text },
  shine: { position: 'absolute', top: -4, bottom: -4, width: 34, backgroundColor: '#FFFFFF', borderRadius: 20 },
  contagemGrande: { position: 'absolute', bottom: 6, right: 12, fontFamily: 'FredokaOne', fontSize: 38, color: ALERTA, opacity: 0.9 },
  efeitosArea: { minHeight: 34, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  particulasWrap: { position: 'absolute', width: 0, height: 0, top: '50%', left: '50%', alignItems: 'center', justifyContent: 'center' },
  opcoes: { flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 6 },
  opt: { width: 64, height: 64, borderRadius: 18, backgroundColor: pt.surface, borderWidth: 2, borderColor: pt.beni, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  optPress: { transform: [{ scale: 0.9 }], backgroundColor: pt.beniSoft, borderColor: pt.beniDeep, ...shadows.soft },
  optRevelar: { backgroundColor: pt.goldSoft, borderColor: pt.goldDeep },
  optOff: { opacity: 0.45 },
  optTxt: { fontFamily: 'FredokaOne', fontSize: 30, color: pt.beniDeep },
  voo: { position: 'absolute', width: 44, height: 44, borderRadius: 14, backgroundColor: pt.beniSoft, borderWidth: 2, borderColor: pt.beni, alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  vooTxt: { fontFamily: 'FredokaOne', fontSize: 26, color: pt.beniDeep },
  overlay: { alignItems: 'center', justifyContent: 'center', zIndex: 30 },
  overlayDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,12,4,0.32)' },
  overlayDimForte: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16,9,2,0.56)' },
  overlayCentro: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  anelUm: { position: 'absolute', width: 230, height: 230, borderRadius: 115, borderWidth: 6, borderColor: pt.gold },
  anelDois: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 5, borderColor: '#F3722C' },
  raios: { position: 'absolute', width: 360, height: 360, alignItems: 'center', justifyContent: 'center' },
  raio: { position: 'absolute', width: 360, height: 16, borderRadius: 8, opacity: 0.55 },
  superTxt: { fontFamily: 'FredokaOne', fontSize: 34, color: '#FFF', letterSpacing: 1, textShadowColor: '#8A3B00', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  superSub: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.gold },
  triploTxt: { fontFamily: 'FredokaOne', fontSize: 27, color: '#FFF', letterSpacing: 1, textShadowColor: '#8A6A00', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  modalWrap: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20,12,4,0.4)', zIndex: 40 },
  modalCard: { width: 280, alignItems: 'center', gap: 10, paddingVertical: 22, paddingHorizontal: 18, borderRadius: radii.xl, backgroundColor: pt.surface, ...shadows.card },
  modalTitulo: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.text },
  modalSub: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.textSoft, marginBottom: 4 },
  livro: { borderRadius: radii.xl, paddingVertical: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#EFE2C2', ...shadows.card, alignItems: 'center', overflow: 'hidden' },
  livroFaixa: { alignSelf: 'stretch', backgroundColor: pt.beni, borderRadius: radii.lg, paddingVertical: 8, alignItems: 'center', marginBottom: 8 },
  livroFaixaTxt: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },
  livroSub: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.textSoft, marginBottom: 12 },
  difCol: { alignSelf: 'stretch', gap: 8 },
  difChip: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: radii.lg, backgroundColor: pt.surface, borderWidth: 2, borderColor: '#EBD9AE', alignItems: 'center' },
  difChipSel: { backgroundColor: pt.beniSoft, borderColor: pt.beni },
  difChipTxt: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text },
  difChipSub: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: pt.textSoft, marginTop: 2 },
  difChipTxtSel: { color: pt.beniDeep },
  balaoSolo: { backgroundColor: pt.goldSoft, borderRadius: radii.lg, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: pt.gold + '55' },
  balaoTxt: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.text, textAlign: 'center' },
  btnPrimario: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: pt.beni, paddingVertical: 14, paddingHorizontal: 30, borderRadius: radii.pill, ...shadows.card },
  btnPrimarioOff: { backgroundColor: '#D9CBB8' },
  btnPrimarioTxt: { fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF' },
  btnSecundario: { paddingVertical: 11, paddingHorizontal: 22, borderRadius: radii.pill, backgroundColor: pt.surface, borderWidth: 1, borderColor: '#EBD9AE', alignItems: 'center' },
  btnSecundarioTxt: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.textSoft },
  btnDev: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radii.pill, backgroundColor: pt.lilac, borderWidth: 1, borderColor: '#E0CDF5' },
  btnDevTxt: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.purpleDeep },
  fimLinha: { flexDirection: 'row', gap: 10, marginTop: 2 },
  btnMini: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 16, borderRadius: radii.pill, backgroundColor: pt.cream, borderWidth: 1, borderColor: '#EBD9AE' },
  btnMiniTxt: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft },
  fimSelo: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.beniDeep, letterSpacing: 1 },
  fimTitulo: { fontFamily: 'FredokaOne', fontSize: 22, color: pt.beniDeep, textAlign: 'center', paddingHorizontal: 10 },
  fimPrincipal: { fontFamily: 'FredokaOne', fontSize: 24, color: pt.beniDeep, textAlign: 'center', paddingHorizontal: 10 },
  destaquesRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  destaque: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 12, borderRadius: radii.pill, backgroundColor: pt.goldSoft, borderWidth: 1, borderColor: pt.goldDeep },
  destaqueTxt: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.premiumText },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 380 },
  statBox: { alignItems: 'center', minWidth: 84, paddingVertical: 9, paddingHorizontal: 8, borderRadius: radii.lg, backgroundColor: pt.surface, borderWidth: 1, borderColor: '#F1E2BE' },
  statStar: { height: 22, justifyContent: 'center' },
  statNum: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.beniDeep },
  statLbl: { fontFamily: 'Nunito', fontSize: 10, fontWeight: '700', color: pt.textSoft, marginTop: 2, textAlign: 'center' },
  cartaIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: pt.lilac, alignItems: 'center', justifyContent: 'center' },
  diagWrap: { alignItems: 'center', paddingHorizontal: 14, paddingTop: 10, gap: 10 },
  diagTitulo: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center' },
  diagAbas: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  diagAba: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radii.pill, backgroundColor: pt.surface, borderWidth: 1, borderColor: '#E0CDF5' },
  diagAbaSel: { backgroundColor: pt.lilac, borderColor: pt.purple },
  diagAbaTxt: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.textSoft },
  diagAbaTxtSel: { color: pt.purpleDeep },
  diagSub: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', color: pt.textSoft, textAlign: 'center' },
  diagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', paddingVertical: 8 },
  diagItem: { alignItems: 'center', gap: 4, width: 150 },
  diagDupla: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  diagVazio: { borderRadius: 32, borderWidth: 1, borderColor: '#E0CDF5', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  diagNA: { fontFamily: 'Nunito', fontSize: 18, color: pt.muted },
  diagLabel: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.text, textAlign: 'center' },
  diagTag: { fontFamily: 'Nunito', fontSize: 9, fontWeight: '700', color: pt.textSoft, textAlign: 'center' },
  diagCenaBox: { alignItems: 'center', gap: 12, paddingVertical: 10 },
  diagEvento: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16,9,2,0.4)', borderRadius: radii.xl },
  diagPoder: { alignItems: 'center', gap: 4, width: 90 },
});
