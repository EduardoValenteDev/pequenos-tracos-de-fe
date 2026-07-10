/**
 * CadeAOvelhinhaScreen — vertical slice de "Cadê a Ovelhinha?" (Bloco 2.1 · corrigido no 2.1a).
 *
 * A criança acha a ovelhinha entre distratores numa mini-cena. Prova a mecânica antes
 * da arte oficial: 1 sprite temporário (ovelha, com fallback SVG) + distratores SVG.
 * Só Fácil, 5 rodadas, sem cronômetro.
 *
 * ── Modelo ÚNICO (2.1a) ──────────────────────────────────────────────────────
 * A rodada é UM objeto `{ roundId, targetId, items }` (fonte única). A tela RENDERIZA
 * a mesma coleção que a máquina VALIDA, e o Pressable envia `item.id`. O acerto compara
 * o ID tocado com `targetId` — nunca índice de array. Não há listas paralelas que
 * possam divergir (era a causa do "distrator contava como acerto").
 *
 * `montarRodada` só age em `trocandoCena` (idempotente por rodada) — mata a corrida de
 * dupla-montagem. Cada rodada REMONTA os sprites (key = roundId+item.id) → Animated.Value
 * sempre fresco. Halo = anel atrás dos sprites, pointerEvents "none".
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Image, Animated, Pressable, AppState, StyleSheet, useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Ellipse, Polygon, Rect, Path } from 'react-native-svg';
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
import { OVELHA_BENI, OVELHA_DISTRATORES_DEV, OVELHA_ALVO_DEV } from '../data/ovelhaSceneData';
import {
  getDifficulty, buildRound, roundValido, margemDe, nivelDica,
  erroElegivel, visivelFrac,
  OVELHA_ROUNDS, OVELHA_SOUND_EVENTS,
} from '../services/ovelhaGameService';
import {
  FASES, EFEITOS, criarJogo, iniciarRodada, cenaPronta, tocar, liberarErro, avancar, encerrar,
} from '../services/ovelhaGameMachine';

/**
 * Overlay de diagnóstico interno (2.1a §12). DESLIGADO por padrão. Ativado só por esta
 * constante em desenvolvimento — NÃO depende do banner Modo Criador, pointerEvents none,
 * nunca em produção. Serve para provar visual e hitbox alinhados; remover após validar.
 */
const OVELHA_DEBUG_HITBOX = false;

/** Tempos das animações (ms). Constantes: não são estado. */
const T = {
  entrada: 320,     // entrada escalonada da cena
  acerto: 700,      // celebração antes de trocar de cena
  erro: 480,        // balanço + respiro antes de voltar a procurar
};

const DIF_FACIL = getDifficulty('facil');

/** Cores dos oclusores provisórios de cenário (2.1b). Trocados por arte oficial no 2.2. */
const OCLUSOR_CORES = Object.freeze({
  arbusto: { corpo: '#6FA84A', sombra: '#588A38' },
  moita: { corpo: '#7FB456', sombra: '#639542' },
  pedra: { corpo: '#A9A29B', sombra: '#8A837C' },
  feno: { corpo: '#E0B85C', sombra: '#C69B3E' },
});

/** Vibração leve. expo-haptics já é dependência; falhar é irrelevante. */
function vibrar() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* segue */ }
}

/* ══════════════════════════ VISUAIS ══════════════════════════ */

/** Ovelha (asset temporário) com FALLBACK SVG se o PNG falhar. */
function OvelhaVisual({ size }) {
  const [falhou, setFalhou] = useState(false);
  if (falhou) return <OvelhaSvgSprite size={size} />;
  return (
    <Image
      source={OVELHA_ALVO_DEV}
      style={{ width: size, height: size }}
      resizeMode="contain"
      onError={() => {
        if (typeof __DEV__ !== 'undefined' && __DEV__) warn('CadeAOvelhinha: PNG temporário falhou; usando fallback SVG.');
        setFalhou(true);
      }}
    />
  );
}

/** Ovelha desenhada (fallback e diagnóstico). Nunca deixa o alvo invisível. */
function OvelhaSvgSprite({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="38" y="70" width="7" height="18" rx="3.5" fill="#6B5B4E" />
      <Rect x="56" y="70" width="7" height="18" rx="3.5" fill="#6B5B4E" />
      <Circle cx="38" cy="52" r="20" fill="#FBF7F1" />
      <Circle cx="54" cy="46" r="22" fill="#FFFFFF" />
      <Circle cx="66" cy="54" r="17" fill="#FBF7F1" />
      <Ellipse cx="72" cy="44" rx="12" ry="14" fill="#6B5B4E" />
      <Circle cx="72" cy="34" r="7" fill="#FFFFFF" />
      <Circle cx="68" cy="45" r="2.4" fill="#2F241D" />
      <Circle cx="77" cy="45" r="2.4" fill="#2F241D" />
    </Svg>
  );
}

/**
 * Distrator TEMPORÁRIO em SVG. "Claramente diferente" da ovelha (sem lã, corpo liso,
 * patinhas), com sombra de contato para coexistir com o cenário. Trocado no 2.2.
 */
function DistratorSvg({ visualId, size }) {
  const c = OVELHA_DISTRATORES_DEV[visualId] ?? OVELHA_DISTRATORES_DEV.gato;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="92" rx="30" ry="6" fill="#000000" opacity={0.10} />
      <Rect x="36" y="74" width="8" height="16" rx="4" fill={c.corpo} />
      <Rect x="56" y="74" width="8" height="16" rx="4" fill={c.corpo} />
      <Polygon points="30,28 42,10 50,32" fill={c.orelha} />
      <Polygon points="70,28 58,10 50,32" fill={c.orelha} />
      <Circle cx="50" cy="54" r="34" fill={c.corpo} />
      <Ellipse cx="50" cy="60" rx="20" ry="16" fill="#FFFFFF" opacity={0.18} />
      <Circle cx="40" cy="50" r="4.5" fill={c.rosto} />
      <Circle cx="60" cy="50" r="4.5" fill={c.rosto} />
      <Ellipse cx="50" cy="63" rx="5.5" ry="4" fill={c.rosto} />
    </Svg>
  );
}

/* ══════════════════════════ SPRITE ══════════════════════════ */

/**
 * Item tocável. A key (roundId+item.id) muda a cada rodada → REMONTA → Animated.Value
 * fresco (corrige "opacidade presa em zero"/estado de acerto sobrevivendo). A hitbox é a
 * do PRÓPRIO item, centrada no sprite; o Pressable ocupa exatamente essa hitbox.
 */
const Sprite = React.memo(function Sprite({ item, indice, encontrada, errando, onPress }) {
  const entrada = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const [press, setPress] = useState(false);

  useEffect(() => {
    const a = Animated.timing(entrada, {
      toValue: 1, duration: 260, delay: Math.min(indice * 60, 240), useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, []);

  useEffect(() => {
    if (!encontrada) return undefined;
    const a = Animated.sequence([
      Animated.timing(pop, { toValue: 1.22, duration: 160, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]);
    a.start();
    return () => a.stop();
  }, [encontrada]);

  useEffect(() => {
    if (!errando) return undefined;
    const passo = (v, d) => Animated.timing(shake, { toValue: v, duration: d, useNativeDriver: true });
    const a = Animated.sequence([passo(-1, 55), passo(1, 65), passo(-0.6, 65), passo(0.6, 65), passo(0, 70)]);
    a.start();
    return () => a.stop();
  }, [errando]);

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });
  const entradaScale = entrada.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const hb = item.hitbox;
  const vs = item.visualSize;
  const alvo = item.role === 'target';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPress(true)}
      onPressOut={() => setPress(false)}
      // Pressable = EXATAMENTE a hitbox do item (desenho = área tocável, sem hitSlop).
      style={[styles.hit, { left: item.cx - hb / 2, top: item.cy - hb / 2, width: hb, height: hb, zIndex: 3 }]}
      accessibilityRole="button"
      accessibilityLabel={alvo ? 'ovelhinha' : (OVELHA_DISTRATORES_DEV[item.visualId]?.label ?? 'bichinho')}
    >
      <Animated.View
        style={{ width: vs, height: vs, opacity: entrada, transform: [{ translateX: shakeX }, { scale: Animated.multiply(pop, entradaScale) }, { scale: press ? 0.94 : 1 }] }}
      >
        {alvo ? <OvelhaVisual size={vs} /> : <DistratorSvg visualId={item.visualId} size={vs} />}
        {/* OCLUSOR FRONTAL: cobre a BASE do sprite (oclusão parcial). pointerEvents none
            → o toque passa por ele para o Pressable. Nunca cobre 100% (invariante). */}
        <OccluderSvg occluder={item.occluder} size={vs} />
      </Animated.View>

      {OVELHA_DEBUG_HITBOX && (
        <View pointerEvents="none" style={[styles.debugRect, { borderColor: alvo ? '#0E9F6E' : '#C0392B' }]}>
          <Text style={styles.debugTxt}>{item.role[0]}·{item.id.slice(-2)}</Text>
        </View>
      )}
    </Pressable>
  );
});

/** Oclusor frontal provisório (arbusto/pedra/feno/moita) cobrindo a base do sprite. */
function OccluderSvg({ occluder, size }) {
  if (!occluder || !(occluder.coberturaFrac > 0)) return null;
  const cor = OCLUSOR_CORES[occluder.tipo] ?? OCLUSOR_CORES.arbusto;
  const h = Math.max(1, Math.round(size * occluder.coberturaFrac));
  const w = Math.round(size * 1.18);   // um pouco mais largo que o sprite
  return (
    <View pointerEvents="none" style={{ position: 'absolute', bottom: -2, left: (size - w) / 2, width: w, height: h }}>
      <Svg width={w} height={h} viewBox="0 0 100 100" preserveAspectRatio="none">
        {occluder.tipo === 'pedra' ? (
          <Path d="M2,100 Q6,45 26,40 Q42,20 60,38 Q84,34 96,64 L100,100 Z" fill={cor.corpo} />
        ) : occluder.tipo === 'feno' ? (
          <Path d="M0,100 Q10,52 24,54 Q34,34 50,50 Q66,34 78,56 Q92,52 100,100 Z" fill={cor.corpo} />
        ) : (
          // arbusto / moita — lóbulos arredondados
          <Path d="M0,100 Q4,58 22,56 Q30,34 48,50 Q60,32 74,52 Q94,52 100,100 Z" fill={cor.corpo} />
        )}
        <Path d="M0,100 Q4,70 22,68 Q30,52 48,64 Q60,50 74,66 Q94,66 100,100 Z" fill={cor.sombra} opacity={0.5} />
      </Svg>
    </View>
  );
}

/** Decoração de fundo (tufos/flores). pointerEvents none, atrás de tudo. */
function DecorSvg({ decor }) {
  const s = decor.size;
  const alvo = decor.tipo === 'flor';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: decor.cx - s / 2, top: decor.cy - s / 2, width: s, height: s, zIndex: 0, opacity: 0.7 }}>
      <Svg width={s} height={s} viewBox="0 0 100 100">
        {alvo ? (
          <>
            <Circle cx="50" cy="46" r="12" fill="#F6B6C8" />
            <Circle cx="34" cy="52" r="10" fill="#F6B6C8" />
            <Circle cx="66" cy="52" r="10" fill="#F6B6C8" />
            <Circle cx="50" cy="50" r="7" fill="#F4D06A" />
          </>
        ) : (
          <>
            <Path d="M50,95 Q40,55 34,42" stroke="#8BBE5A" strokeWidth="7" fill="none" strokeLinecap="round" />
            <Path d="M50,95 Q50,55 50,40" stroke="#7FB350" strokeWidth="7" fill="none" strokeLinecap="round" />
            <Path d="M50,95 Q60,55 66,42" stroke="#8BBE5A" strokeWidth="7" fill="none" strokeLinecap="round" />
          </>
        )}
      </Svg>
    </View>
  );
}

/** Halo em ANEL (centro transparente), ATRÁS dos sprites, sem receber toque. */
function HaloAnel({ item, evidente }) {
  const pulso = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(pulso, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(pulso, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  // Diâmetro ≈ 1,5× o sprite (entre 1,35 e 1,65).
  const d = Math.round(item.visualSize * (evidente ? 1.6 : 1.45));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.halo,
        {
          left: item.cx - d / 2, top: item.cy - d / 2, width: d, height: d, borderRadius: d / 2,
          borderWidth: evidente ? 5 : 4,
          opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [evidente ? 0.5 : 0.35, evidente ? 0.85 : 0.6] }),
          transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.06] }) }],
        },
      ]}
    />
  );
}

/* ══════════════════════════ TELA ══════════════════════════ */

export default function CadeAOvelhinhaScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const progressCtx = useProgressContext();
  const refreshProgress = progressCtx?.refreshProgress;
  const premium = isPremiumUser();

  const [tela, setTela] = useState('entrada');    // entrada | jogando | resultado
  const [rounds, setRounds] = useState(null);
  const [stats, setStats] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [pausado, setPausado] = useState(false);

  const [vista, setVista] = useState(() => criarJogo({ rounds: OVELHA_ROUNDS }));
  const [round, setRound] = useState(null);       // fonte única da cena renderizada
  const [erradoId, setErradoId] = useState(null); // qual item balança (id, não índice)
  const [nivel, setNivel] = useState(0);          // 0..3 — controlador de dica

  const jogoRef = useRef(vista);
  const roundIdRef = useRef(0);
  const regiaoAnteriorRef = useRef(null);
  const salvoRef = useRef(false);
  const timeouts = useRef([]);
  const montado = useRef(true);
  const areaRef = useRef({ largura: 0, altura: 0 });
  // ── Estado de DICA, TUDO por rodada (nada vaza para a próxima) ──
  const buscaMsRef = useRef(0);        // tempo acumulado procurando (pausa não conta)
  const nivelRef = useRef(0);
  const erroElegivelRef = useRef(0);   // erros que CONTAM para a dica (anti-spam) — por rodada
  const ultimoErroIdRef = useRef(null);
  const ultimoErroMsRef = useRef(0);
  const rodadaSeqRef = useRef(0);      // sobe a cada rodada; timers antigos abortam se divergir
  const fn = useRef({});

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

  /** Zera TODO o sistema de dica. Chamado ao montar rodada, no acerto (via aplicar),
   *  na pausa/saída/unmount/reinício. Nada de tempo, erro ou halo sobrevive à troca. */
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

  /* ── Efeitos pedidos pela máquina ── */
  const executar = useCallback((efeitos) => {
    for (const e of efeitos) {
      switch (e) {
        case EFEITOS.SOM_ACERTO: playGameSfx(OVELHA_SOUND_EVENTS.ACERTO); break;
        case EFEITOS.SOM_ERRO: playGameSfx(OVELHA_SOUND_EVENTS.ERRO); break;
        case EFEITOS.SOM_TROCA: playGameSfx(OVELHA_SOUND_EVENTS.TROCA); break;
        case EFEITOS.VIBRAR_ACERTO: vibrar(); break;
        case EFEITOS.AGENDAR_LIBERAR_ERRO: fn.current.agendar(() => fn.current.aplicar(liberarErro), T.erro); break;
        case EFEITOS.AGENDAR_PROXIMA: fn.current.agendar(() => fn.current.aplicar(avancar), T.acerto); break;
        case EFEITOS.FINALIZAR: fn.current.finalizar(); break;
        default: break;
      }
    }
  }, []);

  /* ── Único caminho de transição: grava no ref (síncrono), depois avisa o React ── */
  const aplicar = useCallback((transicao, ...args) => {
    const r = transicao(jogoRef.current, ...args);
    jogoRef.current = r.estado;
    if (montado.current) setVista(r.estado);
    if (r.estado.fase !== FASES.PROCURANDO) resetarDica();   // sair de procurando cancela a dica
    if (r.efeitos?.length) executar(r.efeitos);
    return r;
  }, [executar, resetarDica]);

  /* ── Monta a geometria de UMA rodada e entra em cena ──
     Idempotente por rodada: só age em `trocandoCena`. Mata a corrida de dupla-montagem. */
  const montarRodada = useCallback(() => {
    if (jogoRef.current.fase !== FASES.TROCANDO) return;   // já montada → no-op total
    const a = areaRef.current;
    if (!a.largura || !a.altura) return;                    // sem medida ainda; onLayout re-chama

    // Gera uma rodada VÁLIDA (invariantes). Se sair inválida, tenta de novo (rnd avança).
    const margem = margemDe(DIF_FACIL, a.largura, a.altura);
    let r = null;
    for (let tent = 0; tent < 6; tent++) {
      roundIdRef.current += 1;
      const cand = buildRound({
        dif: DIF_FACIL, largura: a.largura, altura: a.altura,
        regiaoAnterior: regiaoAnteriorRef.current, roundId: roundIdRef.current,
      });
      if (roundValido(cand, a.largura, a.altura, margem)) { r = cand; break; }
    }
    if (!r) { warn('CadeAOvelhinha: rodada inválida após retries; abortando a montagem.'); return; }

    regiaoAnteriorRef.current = r.regiaoAlvo;
    const iniciou = aplicar(iniciarRodada, { targetId: r.targetId, itemIds: r.items.map((it) => it.id) });
    if (!iniciou.aceito) return;               // barreira: nunca inicia rodada sem alvo válido
    rodadaSeqRef.current += 1;                  // nova sequência: timers antigos abortam
    setRound(r);
    setErradoId(null);
    resetarDica();                             // rodada nova NASCE limpa (tempo/erro/halo zerados)
    fn.current.agendar(() => fn.current.aplicar(cenaPronta), T.entrada);
  }, [aplicar, resetarDica]);

  /* ── Fim da partida: salva UMA vez; resultado aparece mesmo se o storage falhar ── */
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
      r = await recordOvelhaResult({
        dificuldade: 'facil', day,
        encontradas: g.encontradas, sequencia: g.bestSequencia,
      });
      if (r.starAwarded) { await addBonusStars(1); await refreshProgress?.(); }
    } catch (e) {
      warn('CadeAOvelhinha.finalizar:', e);
    }

    if (!montado.current) return;
    if (r.stats) setStats(r.stats);
    setResultado({
      encontradas: g.encontradas, bestSequencia: g.bestSequencia,
      isBest: r.isBest, starAwarded: r.starAwarded,
    });
    setTela('resultado');
  }, [refreshProgress, limparTimers, resetarDica]);

  // Publica handlers frescos (evita closure preso ao primeiro render).
  fn.current = { aplicar, agendar, montarRodada, finalizar };

  /* ── Ciclo de vida ── */
  useEffect(() => {
    montado.current = true;
    preloadGameSfx();
    let vivo = true;
    getDailyRounds().then((r) => vivo && setRounds(r)).catch((e) => warn('CadeAOvelhinha.rounds:', e));
    readStats().then((s) => vivo && setStats(s)).catch((e) => warn('CadeAOvelhinha.stats:', e));
    return () => {
      vivo = false;
      montado.current = false;
      limparTimers();
      releaseGameSfx();
    };
  }, [limparTimers]);

  /* ── Pausa: segundo plano ou tela sem foco ── */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (e) => setPausado(e !== 'active'));
    const off = navigation.addListener('blur', () => setPausado(true));
    const on = navigation.addListener('focus', () => setPausado(AppState.currentState !== 'active'));
    return () => { sub.remove(); off(); on(); };
  }, [navigation]);

  const jogando = tela === 'jogando';
  const procurando = jogando && vista.fase === FASES.PROCURANDO;

  /* ── Controlador de dica: acumula tempo SÓ procurando e não pausado.
     A progressão usa o ERRO ELEGÍVEL DA RODADA (erroElegivelRef), NUNCA o cumulativo
     da máquina — era o vazamento. O `seq` capturado aborta um tick de rodada antiga. */
  useEffect(() => {
    if (!procurando || pausado) return undefined;
    const seq = rodadaSeqRef.current;
    let ultimo = Date.now();
    const t = setInterval(() => {
      if (rodadaSeqRef.current !== seq) return;   // rodada mudou → tick órfão, ignora
      const agora = Date.now();
      buscaMsRef.current += agora - ultimo;
      ultimo = agora;
      fn.current.aplicarNivel?.(buscaMsRef.current, erroElegivelRef.current);
    }, 500);
    return () => clearInterval(t);
  }, [procurando, pausado]);

  // aplicarNivel no ref (para o intervalo pegar sempre a versão fresca).
  fn.current.aplicarNivel = aplicarNivel;

  /* ── Começar: SÓ AQUI a rodada é consumida ── */
  const comecar = useCallback(async () => {
    const r = await consumeRound();
    if (!r.ok) { setRounds(await getDailyRounds()); setTela('entrada'); return; }
    limparTimers();
    resetarDica();
    regiaoAnteriorRef.current = null;
    salvoRef.current = false;
    jogoRef.current = criarJogo({ rounds: OVELHA_ROUNDS });
    setVista(jogoRef.current);
    setRound(null);
    setResultado(null);
    setErradoId(null);
    setPausado(AppState.currentState !== 'active');
    setTela('jogando');
    setRounds(await getDailyRounds());
    if (areaRef.current.largura) fn.current.montarRodada();
  }, [limparTimers, resetarDica]);

  const abandonar = useCallback(() => {
    limparTimers();
    resetarDica();
    aplicar(encerrar);
    setTela('entrada');
  }, [aplicar, limparTimers, resetarDica]);

  /* ── Toque num item, por ID: a máquina decide, de forma síncrona ── */
  const tocarItem = useCallback((id) => {
    if (pausado) return;
    const r = aplicar(tocar, id);
    if (r.aceito && r.acerto === false) {
      // Feedback (balanço + som) em TODO erro.
      setErradoId(id);
      agendar(() => montado.current && setErradoId(null), T.erro);
      // Mas só ERROS ELEGÍVEIS progridem a dica: spam no mesmo item dentro do cooldown
      // não conta. Alternar entre itens errados conta mais.
      const agora = Date.now();
      if (erroElegivel({ id, ultimoId: ultimoErroIdRef.current, agoraMs: agora, ultimoMs: ultimoErroMsRef.current })) {
        erroElegivelRef.current += 1;
        ultimoErroMsRef.current = agora;
      }
      ultimoErroIdRef.current = id;
      aplicarNivel(buscaMsRef.current, erroElegivelRef.current);
    }
  }, [aplicar, agendar, pausado, aplicarNivel]);

  // Após avançar, a máquina volta a `trocandoCena` → monta a próxima rodada.
  useEffect(() => {
    if (jogando && vista.fase === FASES.TROCANDO) fn.current.montarRodada();
  }, [jogando, vista.fase, vista.rodada]);

  /* ── Medição da área ── */
  const medirArea = useCallback((e) => {
    const { width: w, height: h } = e?.nativeEvent?.layout ?? {};
    if (!w || !h) return;
    const mudou = Math.abs(areaRef.current.largura - w) > 1 || Math.abs(areaRef.current.altura - h) > 1;
    areaRef.current = { largura: w, altura: h };
    if (mudou && jogando && jogoRef.current.fase === FASES.TROCANDO) fn.current.montarRodada();
  }, [jogando]);

  const semRodadas = !premium && rounds != null && rounds.remaining <= 0;

  // Mensagem do Beni: no erro recente, fala leve; do nível 1, incentivo (não espacial).
  const mensagem = pausado
    ? 'Joguinho pausado. Volte quando quiser!'
    : erradoId ? OVELHA_BENI.erro
      : nivel >= 1 ? OVELHA_BENI.incentivo
        : OVELHA_BENI.procurando;

  const alvoItem = round?.items?.find((it) => it.id === round.targetId) || null;
  // Halo (ajuda espacial) só do nível 2; some ao pausar/acertar/trocar.
  const mostraHalo = procurando && nivel >= 2 && !pausado && !!alvoItem;

  /* ══════════════ ENTRADA ══════════════ */
  if (tela === 'entrada') {
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => navigation.goBack()} />
        <View style={styles.entradaWrap}>
          <View style={styles.painel}>
            <BeniGuideBubble message={OVELHA_BENI.entrada} avatarVariant="teaching" tone="purple" compact />
            <Text style={styles.explica}>
              Ache a ovelhinha escondida entre os bichinhos. São 5 ovelhinhas para encontrar!
            </Text>
          </View>

          {!premium && (
            <View style={styles.pill}>
              <FaithIcon name="star" size={14} color={pt.goldDeep} />
              <Text style={styles.pillText}>
                {rounds == null
                  ? 'Preparando suas rodadas…'
                  : rounds.remaining > 0
                    ? `Você tem ${rounds.remaining} rodada${rounds.remaining === 1 ? '' : 's'} hoje.`
                    : 'As rodadas de hoje acabaram. Amanhã tem mais!'}
              </Text>
            </View>
          )}

          <View style={styles.difCard}>
            <View style={styles.difIconBg}><FaithIcon name="ovelha" size={22} color={pt.greenDeep} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.difTitulo}>Fácil</Text>
              <Text style={styles.difDesc}>3 bichinhos por cena · 5 rodadas</Text>
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
          <SoundButton
            style={styles.btnTerciario}
            onPress={() => navigation.navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })}
            activeOpacity={0.9}
          >
            <Text style={styles.btnTerciarioText}>Voltar para Brincar</Text>
          </SoundButton>
        </View>
      </View>
    );
  }

  /* ══════════════ JOGANDO ══════════════ */
  const items = round?.items ?? [];
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

      {/* Fundo de campo (gradiente + chão). Camadas empilhadas por zIndex explícito. */}
      <LinearGradient colors={['#DCEFFB', '#EAF7EF', '#E7F3D9']} style={styles.cena} onLayout={medirArea}>
        <View pointerEvents="none" style={styles.chao} />

        {/* Camada 1 — cenário decorativo (tufos/flores), atrás de tudo, sem toque. */}
        {(round?.decor ?? []).map((d) => <DecorSvg key={d.id} decor={d} />)}

        {/* Camada 2 — halo em anel, ATRÁS dos sprites (some sob o oclusor frontal). */}
        {mostraHalo && <HaloAnel item={alvoItem} evidente={nivel >= 3} />}

        {/* Camada 3+4 — sprites (zIndex 3) com o OCLUSOR frontal (dentro, sem toque). */}
        {items.map((it, i) => (
          <Sprite
            key={`${round.roundId}-${it.id}`}
            item={it}
            indice={i}
            encontrada={vista.fase === FASES.ACERTO && it.id === round.targetId}
            errando={erradoId === it.id}
            onPress={() => tocarItem(it.id)}
          />
        ))}

        {OVELHA_DEBUG_HITBOX && round && (
          <View pointerEvents="none" style={styles.debugHud}>
            <Text style={styles.debugTxt}>target={round.targetId.slice(-8)} · vis={Math.round(visivelFrac(alvoItem) * 100)}%</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

/* ══════════════════════════ PEÇAS ══════════════════════════ */

function Header({ insets, onBack, chip }) {
  return (
    <LinearGradient
      colors={['#EAF7EF', '#DDF0E6', '#E8F6EF']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}
    >
      <View style={styles.headerRow}>
        <SoundButton style={styles.backPill} onPress={onBack} activeOpacity={0.85} accessibilityLabel="Voltar" accessibilityRole="button">
          <FaithIcon name="back" size={16} color={pt.greenDeep} />
        </SoundButton>
        <Text style={styles.headerTitle} numberOfLines={1}>Cadê a Ovelhinha?</Text>
        {chip ? (
          <View style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View>
        ) : <View style={styles.chipVazio} />}
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
  backPill: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1, borderColor: 'rgba(14,159,110,0.18)',
  },
  headerTitle: { flex: 1, fontFamily: 'FredokaOne', fontSize: 20, color: pt.text },
  chip: { borderRadius: radii.pill, borderWidth: 1, borderColor: '#E8A33D80', backgroundColor: '#F7C9481F', paddingHorizontal: 11, paddingVertical: 5 },
  chipText: { fontFamily: 'FredokaOne', fontSize: 12, color: '#9A6A00' },
  chipVazio: { width: 0 },

  entradaWrap: { paddingHorizontal: 16, paddingTop: 12 },
  painel: {
    backgroundColor: '#F3FBF6', borderRadius: radii.xl, borderWidth: 1.5, borderColor: '#CDEBD9',
    padding: 12, ...shadows.card,
  },
  explica: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19, marginTop: 8 },

  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
    backgroundColor: '#FFF', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 9, ...shadows.soft,
  },
  pillText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: pt.text, fontWeight: '700' },

  difCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, padding: 12,
    backgroundColor: '#FFF', borderRadius: radii.lg, borderWidth: 1.5, borderColor: pt.greenDeep, ...shadows.soft,
  },
  difIconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#DFF3E6', alignItems: 'center', justifyContent: 'center' },
  difTitulo: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  difDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 1 },

  btnPrimario: {
    flexDirection: 'row', gap: 8, justifyContent: 'center',
    marginTop: 16, backgroundColor: pt.greenDeep, borderRadius: radii.lg,
    paddingVertical: 15, alignItems: 'center', ...shadows.card,
  },
  btnPrimarioText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
  btnTerciario: { marginTop: 10, paddingVertical: 12, alignItems: 'center' },
  btnTerciarioText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.textSoft },

  convite: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, backgroundColor: pt.goldSoft,
    borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: pt.gold + '66',
  },
  conviteText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: '#7A5800', fontWeight: '700', lineHeight: 17 },

  // ── HUD ──
  hud: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, paddingVertical: 8, backgroundColor: '#FFF' },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hudText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.text },
  hudRodada: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft },

  dica: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', height: 24, lineHeight: 24 },

  // ── Cena (camadas por zIndex: chão/decor 0 · halo 1 · sprites 3 · oclusor no sprite) ──
  cena: { flex: 1, marginHorizontal: 12, marginBottom: 12, borderRadius: radii.xl, overflow: 'hidden', ...shadows.soft },
  chao: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '34%', backgroundColor: '#CFE8A6', opacity: 0.55, zIndex: 0 },
  hit: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  // Halo em ANEL: centro transparente (só borda). zIndex 1 → ATRÁS dos sprites (zIndex 3)
  // e atrás do oclusor frontal, para não "desenhar" a resposta por cima do cenário.
  halo: { position: 'absolute', backgroundColor: 'transparent', borderColor: pt.gold, zIndex: 1 },

  debugRect: { ...StyleSheet.absoluteFillObject, borderWidth: 1.5, alignItems: 'flex-start', justifyContent: 'flex-start' },
  debugHud: { position: 'absolute', top: 4, left: 6 },
  debugTxt: { fontFamily: 'Nunito', fontSize: 9, color: '#C0392B', fontWeight: '800' },

  // ── Resultado ──
  vitoriaCard: {
    marginTop: 12, backgroundColor: '#FFF', borderRadius: radii.xl, paddingVertical: 18, paddingHorizontal: 14,
    alignItems: 'center', ...shadows.card,
  },
  vitoriaIconBg: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#DFF3E6', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  destaque: { fontFamily: 'FredokaOne', fontSize: 44, color: pt.text, lineHeight: 50 },
  destaqueLabel: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft, marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'center' },
  stat: { alignItems: 'center' },
  statValor: { fontFamily: 'FredokaOne', fontSize: 22, color: pt.text },
  statLabel: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, textAlign: 'center', marginTop: 1 },
  faixaBoa: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch', marginTop: 12,
    backgroundColor: '#DDF3E7', borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 9,
  },
  faixaBoaText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#0E5A3C' },
  faixaEstrela: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch', marginTop: 10,
    backgroundColor: pt.goldSoft, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 9,
  },
  faixaEstrelaText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#7A5800' },
  faixaSuave: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch', marginTop: 10,
    backgroundColor: '#F3EFE9', borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 9,
  },
  faixaSuaveText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, fontWeight: '700' },
});
