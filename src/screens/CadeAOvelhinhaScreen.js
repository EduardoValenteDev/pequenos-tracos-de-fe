/**
 * CadeAOvelhinhaScreen — vertical slice de "Cadê a Ovelhinha?" (Bloco 2.1).
 *
 * A criança acha a ovelhinha entre distratores espalhados numa mini-cena. Prova a
 * mecânica antes de produzir a arte oficial: usa 1 sprite temporário (ovelha) e
 * distratores desenhados em SVG. Só a dificuldade Fácil, 5 rodadas, sem cronômetro.
 *
 * ── Quem manda ───────────────────────────────────────────────────────────────
 * Toda a regra vive em `ovelhaGameMachine` (pura, num ref) e `ovelhaGameService`
 * (geometria pura). A tela só desenha o estado e executa os efeitos que a máquina
 * emite. O ref é atualizado SÍNCRONAMENTE no toque — impossível aceitar toque durante
 * a resolução. Este padrão é herdado do Pares, mas NADA é importado de lá.
 *
 * Sem emoji: só FaithIcon. Sons reaproveitados (nenhum arquivo novo). Assets
 * temporários → a rota só existe sob o gate interno; em produção o card fica "Chegando".
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Image, Animated, Pressable, AppState, StyleSheet, useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Ellipse, Polygon } from 'react-native-svg';
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
  getDifficulty, buildRound, OVELHA_ROUNDS, OVELHA_SOUND_EVENTS,
} from '../services/ovelhaGameService';
import {
  FASES, EFEITOS, criarJogo, iniciarRodada, cenaPronta, tocar, liberarErro, avancar, encerrar,
} from '../services/ovelhaGameMachine';

/** Tempos das animações. Constantes: não são estado. */
const T = {
  entrada: 320,     // entrada escalonada da cena
  acerto: 700,      // celebração antes de trocar de cena
  erro: 480,        // balanço + respiro antes de voltar a procurar
  dicaMs: 5000,     // halo após 5 s sem acerto
};

const DIF_FACIL = getDifficulty('facil');

/** Vibração leve. expo-haptics já é dependência; falhar é irrelevante. */
function vibrar() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* segue */ }
}

/* ══════════════════════════ SPRITE ══════════════════════════ */

/**
 * Um elemento tocável. A ovelha é o asset temporário; os distratores são SVG.
 * A HITBOX é maior que o sprite (Pressable dimensionado pela hitbox), então o toque
 * é confortável mesmo com o desenho menor. `pointerEvents` do halo é "none".
 */
const Sprite = React.memo(function Sprite({ item, encontrada, errando, comHalo, onPress }) {
  const entrada = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const [press, setPress] = useState(false);

  useEffect(() => {
    const a = Animated.timing(entrada, {
      toValue: 1, duration: 260, delay: Math.min(item.indice * 60, 240), useNativeDriver: true,
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

  useEffect(() => {
    if (!comHalo) { halo.stopAnimation(); halo.setValue(0); return undefined; }
    const a = Animated.loop(Animated.sequence([
      Animated.timing(halo, { toValue: 1, duration: 620, useNativeDriver: true }),
      Animated.timing(halo, { toValue: 0, duration: 620, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [comHalo]);

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });
  const entradaScale = entrada.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const hb = item.hitbox;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPress(true)}
      onPressOut={() => setPress(false)}
      style={[styles.hit, { left: item.cx - hb / 2, top: item.cy - hb / 2, width: hb, height: hb }]}
      accessibilityRole="button"
      accessibilityLabel={item.tipo === 'alvo' ? 'ovelhinha' : (OVELHA_DISTRATORES_DEV[item.kind]?.label ?? 'bichinho')}
    >
      {/* halo da dica — decorativo, atrás do sprite, não recebe toque */}
      {comHalo && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            { width: hb, height: hb, borderRadius: hb / 2,
              opacity: halo.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.6] }),
              transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] }) }] },
          ]}
        />
      )}
      <Animated.View
        style={{ opacity: entrada, transform: [{ translateX: shakeX }, { scale: Animated.multiply(pop, entradaScale) }, { scale: press ? 0.94 : 1 }] }}
      >
        {item.tipo === 'alvo'
          ? <Image source={OVELHA_ALVO_DEV} style={{ width: item.size, height: item.size }} resizeMode="contain" />
          : <DistratorDev kind={item.kind} size={item.size} />}
      </Animated.View>
    </Pressable>
  );
});

/** Distrator TEMPORÁRIO em SVG (nenhum asset). Trocado por arte oficial no Bloco 2.2. */
function DistratorDev({ kind, size }) {
  const c = OVELHA_DISTRATORES_DEV[kind] ?? OVELHA_DISTRATORES_DEV.gato;
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="30,25 42,8 50,28" fill={c.orelha} />
      <Polygon points="70,25 58,8 50,28" fill={c.orelha} />
      <Circle cx="50" cy="56" r="38" fill={c.corpo} />
      <Circle cx="38" cy="50" r="5" fill={c.rosto} />
      <Circle cx="62" cy="50" r="5" fill={c.rosto} />
      <Ellipse cx="50" cy="66" rx="6" ry="4" fill={c.rosto} />
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

  const [tela, setTela] = useState('entrada');    // entrada | jogando | resultado
  const [rounds, setRounds] = useState(null);
  const [stats, setStats] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [pausado, setPausado] = useState(false);

  const [vista, setVista] = useState(() => criarJogo({ rounds: OVELHA_ROUNDS }));
  const [sprites, setSprites] = useState([]);      // geometria da rodada atual
  const [dicaVisivel, setDicaVisivel] = useState(false);
  const [errandoIndice, setErrandoIndice] = useState(-1);   // qual distrator balança
  const [area, setArea] = useState({ largura: 0, altura: 0 });

  const jogoRef = useRef(vista);
  const regiaoAnteriorRef = useRef(null);
  const dicaAtivaRef = useRef(false);
  const salvoRef = useRef(false);
  const timeouts = useRef([]);
  const montado = useRef(true);
  const areaRef = useRef({ largura: 0, altura: 0 });
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

  const cancelarDica = useCallback(() => {
    dicaAtivaRef.current = false;
    if (montado.current) setDicaVisivel(false);
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
        case EFEITOS.AGENDAR_DICA:
          // Uma dica por rodada. Dispara após T.dicaMs sem acerto (o erro também mostra
          // o halo, imediatamente — ver `aplicar` no ramo de erro).
          fn.current.agendar(() => {
            if (montado.current && jogoRef.current.fase === FASES.PROCURANDO) fn.current.mostrarDica();
          }, T.dicaMs);
          break;
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
    // Sair de "procurando" cancela qualquer dica pendente/visível.
    if (r.estado.fase !== FASES.PROCURANDO) cancelarDica();
    if (r.efeitos?.length) executar(r.efeitos);
    return r;
  }, [executar, cancelarDica]);

  const mostrarDica = useCallback(() => {
    if (dicaAtivaRef.current) return;   // nunca dois halos
    dicaAtivaRef.current = true;
    if (montado.current) setDicaVisivel(true);
  }, []);

  /* ── Monta a geometria de uma rodada e entra em cena ── */
  const montarRodada = useCallback(() => {
    const a = areaRef.current;
    if (!a.largura || !a.altura) return;   // ainda sem medida; o onLayout re-chama
    const cena = buildRound({
      dif: DIF_FACIL, largura: a.largura, altura: a.altura,
      regiaoAnterior: regiaoAnteriorRef.current,
    });
    regiaoAnteriorRef.current = cena.regiaoAlvo;
    setSprites(cena.sprites.map((s, i) => ({ ...s, indice: i })));
    aplicar(iniciarRodada, { alvoIndex: cena.alvoIndex, n: cena.sprites.length });
    // A cena entra e libera o toque (procurando) ao fim da animação.
    agendar(() => aplicar(cenaPronta), T.entrada);
  }, [aplicar, agendar]);

  /* ── Fim da partida: salva UMA vez; resultado aparece mesmo se o storage falhar ── */
  const finalizar = useCallback(async () => {
    if (salvoRef.current) return;
    salvoRef.current = true;
    limparTimers();
    cancelarDica();
    playGameSfx(OVELHA_SOUND_EVENTS.VITORIA);

    const g = jogoRef.current;
    const anterior = stats?.ovelha?.facil?.bestSequencia ?? 0;
    let r = { stats: null, isBest: false, starAwarded: false };
    try {
      const day = toDayKey(new Date());
      r = await recordOvelhaResult({
        dificuldade: 'facil', day,
        encontradas: g.encontradas, sequencia: g.bestSequencia,
      });
      if (r.starAwarded) {
        await addBonusStars(1);
        await refreshProgress?.();
      }
    } catch (e) {
      warn('CadeAOvelhinha.finalizar:', e);
    }

    if (!montado.current) return;
    if (r.stats) setStats(r.stats);
    setResultado({
      encontradas: g.encontradas, bestSequencia: g.bestSequencia,
      recorde: Math.max(anterior, g.bestSequencia),
      isBest: r.isBest, starAwarded: r.starAwarded,
    });
    setTela('resultado');
  }, [stats, refreshProgress, limparTimers, cancelarDica]);

  // Publica handlers frescos (evita closure preso ao primeiro render, quando stats=null).
  fn.current = { aplicar, agendar, mostrarDica, montarRodada, finalizar };

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

  /* ── Pausa: segundo plano ou tela sem foco. Só interrompe timers/dica visualmente ── */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (e) => setPausado(e !== 'active'));
    const off = navigation.addListener('blur', () => setPausado(true));
    const on = navigation.addListener('focus', () => setPausado(AppState.currentState !== 'active'));
    return () => { sub.remove(); off(); on(); };
  }, [navigation]);

  useEffect(() => {
    // Pausou durante a busca → esconde a dica (ela reaparece pela regra ao voltar).
    if (pausado) cancelarDica();
  }, [pausado, cancelarDica]);

  const jogando = tela === 'jogando';

  /* ── Começar: SÓ AQUI a rodada é consumida ── */
  const comecar = useCallback(async () => {
    const r = await consumeRound();
    if (!r.ok) {
      setRounds(await getDailyRounds());
      setTela('entrada');
      return;
    }
    limparTimers();
    cancelarDica();
    regiaoAnteriorRef.current = null;
    salvoRef.current = false;
    jogoRef.current = criarJogo({ rounds: OVELHA_ROUNDS });
    setVista(jogoRef.current);
    setResultado(null);
    setSprites([]);
    setPausado(AppState.currentState !== 'active');
    setTela('jogando');
    setRounds(await getDailyRounds());
    // Se a área já foi medida, monta já; senão o onLayout dispara.
    if (areaRef.current.largura) fn.current.montarRodada();
  }, [limparTimers, cancelarDica]);

  const abandonar = useCallback(() => {
    limparTimers();
    cancelarDica();
    aplicar(encerrar);
    setTela('entrada');
  }, [aplicar, limparTimers, cancelarDica]);

  /* ── Toque num sprite: a máquina decide, de forma síncrona ── */
  const tocarSprite = useCallback((i) => {
    if (pausado) return;
    const r = aplicar(tocar, i);
    if (r.aceito && jogoRef.current.fase === FASES.ERRO) {
      setErrandoIndice(i);                 // balança o distrator tocado
      agendar(() => montado.current && setErrandoIndice(-1), T.erro);
      mostrarDica();                       // o erro também revela o halo
    }
  }, [aplicar, agendar, pausado, mostrarDica]);

  // Quando a máquina volta para "trocandoCena" (após avançar), monta a próxima rodada.
  useEffect(() => {
    if (jogando && vista.fase === FASES.TROCANDO) fn.current.montarRodada();
  }, [jogando, vista.fase, vista.rodada]);

  /* ── Medição da área de jogo ── */
  const medirArea = useCallback((e) => {
    const { width: w, height: h } = e?.nativeEvent?.layout ?? {};
    if (!w || !h) return;
    const mudou = Math.abs(areaRef.current.largura - w) > 1 || Math.abs(areaRef.current.altura - h) > 1;
    areaRef.current = { largura: w, altura: h };
    if (mudou) setArea({ largura: w, altura: h });
    // Primeira medição durante a partida sem cena montada → monta agora.
    if (jogando && jogoRef.current.fase === FASES.TROCANDO && !sprites.length) fn.current.montarRodada();
  }, [jogando, sprites.length]);

  const semRodadas = !premium && rounds != null && rounds.remaining <= 0;
  const alvoIndex = vista.alvoIndex;

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
              <Stat label="Recorde do Fácil" valor={`${resultado?.recorde ?? 0}`} />
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
  return (
    <View style={styles.root}>
      <Header insets={insets} onBack={abandonar} chip="Em teste" />
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <FaithIcon name="ovelha" size={16} color={pt.textSoft} />
          <Text style={styles.hudText}>{vista.encontradas} de {vista.rounds}</Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={styles.hudRodada}>Rodada {Math.min(vista.rodada, vista.rounds)} de {vista.rounds}</Text>
        </View>
      </View>

      <Text style={styles.dica} numberOfLines={1}>
        {pausado ? 'Joguinho pausado. Volte quando quiser!' : OVELHA_BENI.procurando}
      </Text>

      <LinearGradient colors={['#EAF7EF', '#DFF3E6', '#EFF9F2']} style={styles.cena} onLayout={medirArea}>
        {sprites.map((s, i) => (
          <Sprite
            key={`${vista.rodada}-${s.id}`}
            item={s}
            encontrada={vista.fase === FASES.ACERTO && i === alvoIndex}
            errando={errandoIndice === i}
            comHalo={dicaVisivel && i === alvoIndex}
            onPress={() => tocarSprite(i)}
          />
        ))}
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
  hud: { flexDirection: 'row', justifyContent: 'center', gap: 22, paddingVertical: 8, backgroundColor: '#FFF' },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hudText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.text },
  hudRodada: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft },

  dica: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', height: 24, lineHeight: 24 },

  // ── Cena ──
  cena: { flex: 1, marginHorizontal: 12, marginBottom: 12, borderRadius: radii.xl, overflow: 'hidden', ...shadows.soft },
  hit: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', backgroundColor: pt.gold },

  // ── Resultado ──
  vitoriaCard: {
    marginTop: 12, backgroundColor: '#FFF', borderRadius: radii.xl, paddingVertical: 18, paddingHorizontal: 14,
    alignItems: 'center', ...shadows.card,
  },
  vitoriaIconBg: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#DFF3E6', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  destaque: { fontFamily: 'FredokaOne', fontSize: 44, color: pt.text, lineHeight: 50 },
  destaqueLabel: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft, marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-around' },
  stat: { alignItems: 'center', flex: 1 },
  statValor: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.text },
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
