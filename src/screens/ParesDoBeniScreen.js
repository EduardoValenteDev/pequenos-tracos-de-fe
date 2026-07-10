/**
 * ParesDoBeniScreen — primeiro jogo real da aba Brincar (Bloco 1.3, polido no 1.4).
 *
 * Jogo da memória com as CAPAS das histórias (assets já existentes). Define o padrão
 * de UX dos próximos jogos: entrada → modo → dificuldade → partida → resultado.
 *
 * ── Dois modos ───────────────────────────────────────────────────────────────
 * Clássico — todos os pares, sem relógio contra a criança. Recorde: jogadas/tempo.
 * Turbo    — 60 s, grade se renova ao ser limpa, combo multiplica pontos.
 *            Recorde: pontos. Erro NUNCA tira tempo.
 *
 * ── Regras de plano ──────────────────────────────────────────────────────────
 * Free: 2 rodadas por dia (brincarDailyService), só a dificuldade Fácil.
 * Plano Família: rodadas ilimitadas, todas as dificuldades.
 * O bloqueio é um CONVITE, nunca uma punição.
 *
 * ── Rodada e estrelinha (invariantes travados no smoke) ──────────────────────
 * A rodada só é consumida quando a partida COMEÇA (`comecar`). Abrir a tela, trocar
 * de modo ou olhar os recordes não consome nada. A estrelinha só é creditada quando
 * a partida TERMINA (`finalizar`), uma única vez por partida (`finalizadoRef`), e
 * respeita o teto diário compartilhado pelos dois modos — senão o Turbo viraria uma
 * fonte infinita de recompensa.
 *
 * Sem emoji: só FaithIcon. Som e vibração são bônus: falharem não quebra o jogo.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Image, Animated, Pressable, AppState,
  StyleSheet, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import FaithIcon from '../components/ui/FaithIcon';
import { BeniGuideBubble } from '../components/beni';
import { ROUTES } from '../constants/routes';
import { stories } from '../data/stories';
import { getStoryCoverImage } from '../services/storyImageService';
import { getCardFraming, computeCardImageLayout } from '../data/gameCardFraming';
import { isPremiumUser } from '../services/accessControl';
import { addBonusStars } from '../services/postStoryStorage';
import { useProgressContext } from '../context/ProgressContext';
import { getDailyRounds, consumeRound, toDayKey } from '../services/brincarDailyService';
import { readStats, recordParesResult, saveLastMode } from '../services/brincarStatsService';
import { playGameSfx, preloadGameSfx, releaseGameSfx } from '../services/audioManager';
import { warn } from '../utils/logger';
import {
  DIFFICULTIES, getDifficulty, buildDeck, pickStoryIds, isPair,
  computeScore, formatTime, BRINCAR_DAILY_STAR_CAP,
  GAME_MODES, getMode, DEFAULT_MODE,
  TURBO_DURATION_MS, addTurboTime, comboMultiplier, pointsForMatch,
  PARES_SOUND_EVENTS,
} from '../services/paresGameService';

/** Falas do Beni no jogo (texto por enquanto; a voz vem no bloco de áudio do Beni). */
const BENI = {
  entrada: 'Vamos achar os pares? Toque em duas cartinhas iguais!',
  primeiroPar: 'Isso! Você achou o primeiro par.',
  metade: 'Você já está na metade. Continue!',
  incentivo: 'Quase! Respira e tenta de novo, eu tô aqui.',
  vitoria: 'Você conseguiu! Que memória boa!',
  turboFim: 'Que corrida boa! Olha quantos pares você achou.',
  turboNovaGrade: 'Limpou tudo! Chegaram cartinhas novas.',
  semRodadas: 'As rodadas de hoje acabaram. Amanhã a gente joga de novo!',
};

/** Tempos das animações. Fora do componente: são constantes, não estado. */
const T = {
  flip: 300,        // virar a carta
  observar: 550,    // erro: tempo para a criança OLHAR as duas cartas
  chacoalhar: 380,  // erro: chacoalhada
  celebrar: 380,    // acerto: pop + respiro antes de liberar
  novaGrade: 650,   // turbo: troca de grade
};

const IDS_COM_CAPA = stories.map((s) => s.id).filter((id) => !!getStoryCoverImage(id));

/** Vibração muito leve. expo-haptics já é dependência; falhar aqui é irrelevante. */
function vibrar(tipo) {
  try {
    if (tipo === 'acerto') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else Haptics.selectionAsync();
  } catch { /* sem vibração — segue o jogo */ }
}

/* ══════════════════════════════ CARTA ══════════════════════════════ */

/**
 * Carta com flip real no eixo Y. As duas faces coexistem, giradas 180° entre si,
 * com `backfaceVisibility: hidden` — assim a imagem nunca aparece espelhada.
 * Tudo no driver nativo (só rotate/scale/translate).
 */
const Carta = React.memo(function Carta({ carta, aberta, casada, errando, size, indice, onPress }) {
  const virada = aberta || casada;
  const flip = useRef(new Animated.Value(virada ? 1 : 0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const entrada = useRef(new Animated.Value(0)).current;
  const [pressionada, setPressionada] = useState(false);

  // Entrada escalonada — a grade "chega", não aparece de repente.
  useEffect(() => {
    const anim = Animated.timing(entrada, {
      toValue: 1, duration: 260, delay: Math.min(indice * 22, 320), useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, []);

  useEffect(() => {
    const anim = Animated.timing(flip, {
      toValue: virada ? 1 : 0, duration: T.flip, useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [virada]);

  // Acerto: pop curto de crescer e voltar.
  useEffect(() => {
    if (!casada) return undefined;
    const anim = Animated.sequence([
      Animated.timing(pop, { toValue: 1.1, duration: 140, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [casada]);

  // Erro: chacoalhada horizontal curta e leve.
  useEffect(() => {
    if (!errando) return undefined;
    const passo = (v, d) => Animated.timing(shake, { toValue: v, duration: d, useNativeDriver: true });
    const anim = Animated.sequence([
      passo(-1, 60), passo(1, 70), passo(-0.7, 70), passo(0.7, 70), passo(0, 80),
    ]);
    anim.start();
    return () => anim.stop();
  }, [errando]);

  const rotVerso = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const rotFrente = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-7, 7] });
  const entradaScale = entrada.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] });

  const w = size;
  const h = size * 1.12;

  return (
    <Pressable
      onPress={onPress}
      disabled={virada}
      hitSlop={2}
      onPressIn={() => setPressionada(true)}
      onPressOut={() => setPressionada(false)}
      accessibilityRole="button"
      accessibilityLabel={casada ? 'Par encontrado' : virada ? 'Carta virada' : 'Carta fechada'}
      accessibilityState={{ disabled: virada }}
    >
      <Animated.View
        style={[
          styles.cartaBox,
          { width: w, height: h },
          pressionada && !virada && styles.cartaPressionada,
          {
            opacity: entrada,
            transform: [
              { translateX: shakeX },
              { scale: Animated.multiply(pop, entradaScale) },
            ],
          },
        ]}
      >
        {/* Verso */}
        <Animated.View
          style={[
            styles.face, styles.cartaVerso,
            { transform: [{ perspective: 800 }, { rotateY: rotVerso }] },
          ]}
        >
          <FaithIcon name="pares" size={w * 0.34} color="#FFFFFFAA" />
        </Animated.View>

        {/* Frente */}
        <Animated.View
          style={[
            styles.face, styles.cartaFrente,
            casada && styles.cartaFrenteCasada,
            errando && styles.cartaFrenteErro,
            { transform: [{ perspective: 800 }, { rotateY: rotFrente }] },
          ]}
        >
          <CartaImagem storyId={carta.storyId} w={w} h={h} />
          {casada && (
            <View style={styles.cartaCheck}>
              <FaithIcon name="check" size={16} color="#FFF" />
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

/**
 * Imagem da capa recortada pelo PONTO FOCAL da história (ver gameCardFraming).
 * As capas são panorâmicas; um recorte centrado apagava personagens laterais.
 */
function CartaImagem({ storyId, w, h }) {
  const cover = getStoryCoverImage(storyId);
  const layout = useMemo(() => {
    if (!cover) return null;
    const src = Image.resolveAssetSource(cover);
    if (!src?.width || !src?.height) return null;
    return computeCardImageLayout(src.width, src.height, w, h, getCardFraming(storyId));
  }, [storyId, w, h, cover]);

  if (!cover) {
    return (
      <View style={[styles.cartaImgVazia, { width: w, height: h }]}>
        <FaithIcon name="bible" size={22} color={pt.textSoft} />
      </View>
    );
  }
  // Sem metadados do asset: cai no comportamento antigo (recorte centrado).
  if (!layout) return <Image source={cover} style={{ width: w, height: h }} resizeMode="cover" />;

  return (
    <View style={{ width: w, height: h, overflow: 'hidden' }}>
      <Image source={cover} style={{ position: 'absolute', ...layout }} />
    </View>
  );
}

/* ══════════════════════════════ TELA ══════════════════════════════ */

export default function ParesDoBeniScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // O contexto pode não estar montado (ex.: tela aberta fora do Provider em um teste).
  // O jogo não depende dele: se faltar, apenas não atualizamos o resumo de estrelinhas.
  const progressCtx = useProgressContext();
  const refreshProgress = progressCtx?.refreshProgress;
  const premium = isPremiumUser();

  const [fase, setFase] = useState('entrada'); // entrada | jogando | resultado
  const [modoId, setModoId] = useState(DEFAULT_MODE);
  const [difId, setDifId] = useState('facil');
  const [deck, setDeck] = useState([]);
  const [gradeId, setGradeId] = useState(0);    // muda → cartas reentram (Turbo)
  const [abertas, setAbertas] = useState([]);   // índices virados agora
  const [casadas, setCasadas] = useState([]);   // chaves já casadas
  const [errando, setErrando] = useState([]);   // índices chacoalhando
  const [rounds, setRounds] = useState(null);
  const [stats, setStats] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [dica, setDica] = useState(BENI.entrada);

  // Placar visível (espelho dos refs — refs são a verdade dentro dos callbacks).
  const [placar, setPlacar] = useState({ jogadas: 0, erros: 0, pontos: 0, combo: 0, pares: 0 });
  const [decorridoMs, setDecorridoMs] = useState(0);
  const [restanteMs, setRestanteMs] = useState(TURBO_DURATION_MS);
  const [pausado, setPausado] = useState(false);

  const jogo = useRef({ jogadas: 0, erros: 0, pontos: 0, combo: 0, maiorCombo: 0, pares: 0 });
  const decorridoRef = useRef(0);
  const restanteRef = useRef(TURBO_DURATION_MS);
  const travado = useRef(false);        // trava a grade durante a verificação
  const finalizado = useRef(false);     // 1 partida = 1 resultado = 1 recompensa
  const timeouts = useRef([]);
  const montado = useRef(true);

  const modo = getMode(modoId);
  const dif = getDifficulty(difId) || DIFFICULTIES[0];

  /* ── Timers: TODOS passam por aqui, para serem limpos no unmount ── */
  const agendar = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timeouts.current = timeouts.current.filter((x) => x !== id);
      if (montado.current) fn();
    }, ms);
    timeouts.current.push(id);
    return id;
  }, []);

  const limparTimers = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  useEffect(() => {
    montado.current = true;
    preloadGameSfx();
    let vivo = true;
    // Rodadas e recordes são informativos: se a leitura falhar, o jogo abre do mesmo jeito.
    getDailyRounds().then((r) => vivo && setRounds(r)).catch((e) => warn('ParesDoBeni.rounds:', e));
    readStats().then((s) => {
      if (!vivo) return;
      setStats(s);
      if (s?.lastMode) setModoId(s.lastMode);   // lembra o último modo escolhido
    }).catch((e) => warn('ParesDoBeni.stats:', e));

    return () => {
      vivo = false;
      montado.current = false;
      limparTimers();
      releaseGameSfx();   // nenhum som sobrevive à saída da tela
    };
  }, [limparTimers]);

  /* ── Pausa: app em segundo plano ou tela perdeu o foco ── */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (estado) => {
      setPausado(estado !== 'active');
    });
    const off = navigation.addListener('blur', () => setPausado(true));
    const on = navigation.addListener('focus', () => setPausado(AppState.currentState !== 'active'));
    return () => { sub.remove(); off(); on(); };
  }, [navigation]);

  /* ── Relógio único dos dois modos ──
     Acumula por delta: parar o intervalo PAUSA de verdade, sem correr por baixo. */
  useEffect(() => {
    if (fase !== 'jogando' || pausado) return undefined;
    let ultimo = Date.now();
    const t = setInterval(() => {
      const agora = Date.now();
      const delta = agora - ultimo;
      ultimo = agora;

      decorridoRef.current += delta;
      setDecorridoMs(decorridoRef.current);

      if (modo.timed) {
        restanteRef.current = Math.max(0, restanteRef.current - delta);
        setRestanteMs(restanteRef.current);
        if (restanteRef.current <= 0) finalizar();
      }
    }, 200);
    return () => clearInterval(t);
  }, [fase, pausado, modo.timed]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Fim da partida: SÓ AQUI a estrelinha é creditada, uma única vez ──
     A criança terminou: o resultado aparece mesmo se o registro do recorde ou o
     crédito da estrelinha falhar. Recompensa é bônus; o resultado não pode sumir. */
  const finalizar = useCallback(async () => {
    if (finalizado.current) return;   // impede segunda tela de resultado / recompensa dupla
    finalizado.current = true;
    travado.current = true;
    limparTimers();

    const g = { ...jogo.current };
    const elapsedMs = decorridoRef.current;
    playGameSfx(modo.timed ? PARES_SOUND_EVENTS.TURBO_END : PARES_SOUND_EVENTS.WIN);

    let r = { stats: null, isBest: false, starAwarded: false };
    const anterior = modo.timed
      ? (stats?.turbo?.[difId]?.bestScore ?? 0)
      : (stats?.pares?.[difId]?.bestMoves ?? null);

    try {
      const day = toDayKey(new Date());
      r = await recordParesResult({
        modo: modoId, dificuldade: difId, day,
        elapsedMs, erros: g.erros, jogadas: g.jogadas,
        pontos: g.pontos, pares: g.pares, maiorCombo: g.maiorCombo,
      });
      if (r.starAwarded) {
        await addBonusStars(1);
        await refreshProgress?.();
      }
    } catch (e) {
      warn('ParesDoBeni.finalizar:', e);
    }

    if (!montado.current) return;
    if (r.stats) setStats(r.stats);
    setResultado({
      modo: modoId, elapsedMs, anterior,
      jogadas: g.jogadas, erros: g.erros, pontos: g.pontos,
      pares: g.pares, maiorCombo: g.maiorCombo,
      score: computeScore({ pairs: dif.pairs, erros: g.erros, elapsedMs }),
      isBest: r.isBest, starAwarded: r.starAwarded,
    });
    setDica(modo.timed ? BENI.turboFim : BENI.vitoria);
    setFase('resultado');
  }, [modoId, difId, dif.pairs, modo.timed, stats, refreshProgress, limparTimers]);

  /* ── Começar: SÓ AQUI a rodada é consumida ── */
  const comecar = useCallback(async () => {
    const r = await consumeRound();
    if (!r.ok) {
      setRounds(await getDailyRounds());
      setDica(BENI.semRodadas);
      setFase('entrada');
      return;
    }
    limparTimers();
    jogo.current = { jogadas: 0, erros: 0, pontos: 0, combo: 0, maiorCombo: 0, pares: 0 };
    setPlacar({ jogadas: 0, erros: 0, pontos: 0, combo: 0, pares: 0 });
    decorridoRef.current = 0; setDecorridoMs(0);
    restanteRef.current = TURBO_DURATION_MS; setRestanteMs(TURBO_DURATION_MS);
    finalizado.current = false;
    travado.current = false;

    setDeck(buildDeck(pickStoryIds(IDS_COM_CAPA, dif.pairs)));
    setGradeId((n) => n + 1);
    setAbertas([]); setCasadas([]); setErrando([]); setResultado(null);
    setDica(BENI.entrada);
    setPausado(false);
    setFase('jogando');
    setRounds(await getDailyRounds());
  }, [dif.pairs, limparTimers]);

  /* ── Turbo: grade limpa → nova grade, sem consumir outra rodada ── */
  const renovarGrade = useCallback(() => {
    setDica(BENI.turboNovaGrade);
    agendar(() => {
      setDeck(buildDeck(pickStoryIds(IDS_COM_CAPA, dif.pairs)));
      setGradeId((n) => n + 1);
      setAbertas([]); setCasadas([]);
      travado.current = false;
    }, T.novaGrade);
  }, [dif.pairs, agendar]);

  const sincronizarPlacar = useCallback(() => {
    const g = jogo.current;
    setPlacar({ jogadas: g.jogadas, erros: g.erros, pontos: g.pontos, combo: g.combo, pares: g.pares });
  }, []);

  /* ── Toque na carta ──
     `travado` fica ligado do instante em que a 2ª carta abre até o fim da sequência.
     Nenhuma 3ª carta abre no meio da verificação, e toques repetidos não contam duas vezes. */
  const tocarCarta = useCallback((i) => {
    if (travado.current || finalizado.current || fase !== 'jogando' || pausado) return;
    if (abertas.includes(i) || casadas.includes(deck[i]?.key)) return;

    playGameSfx(PARES_SOUND_EVENTS.FLIP);
    const novas = [...abertas, i];
    setAbertas(novas);
    if (novas.length < 2) return;

    travado.current = true;   // a partir daqui a grade está trancada
    const g = jogo.current;
    g.jogadas += 1;

    const [a, b] = novas.map((k) => deck[k]);
    if (isPair(a, b)) {
      g.combo += 1;
      g.maiorCombo = Math.max(g.maiorCombo, g.combo);
      g.pares += 1;
      if (modo.timed) {
        g.pontos += pointsForMatch(g.combo);
        restanteRef.current = addTurboTime(restanteRef.current);
        setRestanteMs(restanteRef.current);
      }
      sincronizarPlacar();
      playGameSfx(PARES_SOUND_EVENTS.MATCH);
      vibrar('acerto');

      const novasCasadas = [...casadas, a.key, b.key];
      setCasadas(novasCasadas);
      setAbertas([]);

      const feitosNaGrade = novasCasadas.length / 2;
      if (!modo.timed) {
        if (feitosNaGrade === 1) setDica(BENI.primeiroPar);
        else if (feitosNaGrade === Math.ceil(dif.pairs / 2)) setDica(BENI.metade);
      }

      if (feitosNaGrade === dif.pairs) {
        // Grade limpa: Clássico acaba; Turbo continua com cartas novas.
        if (modo.timed) renovarGrade();
        else agendar(() => finalizar(), T.celebrar);
        return;
      }
      agendar(() => { travado.current = false; }, T.celebrar);
      return;
    }

    // ── Erro: observar → som → chacoalhar → virar de volta → liberar ──
    g.erros += 1;
    g.combo = 0;
    sincronizarPlacar();
    if (!modo.timed && g.erros % 3 === 0) setDica(BENI.incentivo);

    agendar(() => {
      playGameSfx(PARES_SOUND_EVENTS.MISMATCH);
      vibrar('erro');
      setErrando(novas);
      agendar(() => {
        setErrando([]);
        setAbertas([]);
        travado.current = false;   // a grade só libera no fim da sequência
      }, T.chacoalhar);
    }, T.observar);
  }, [abertas, casadas, deck, fase, pausado, modo.timed, dif.pairs, agendar, finalizar, renovarGrade, sincronizarPlacar]);

  /* ── Derivados ── */
  const semRodadas = !premium && rounds != null && rounds.remaining <= 0;
  const cardSize = useMemo(() => {
    const larguraUtil = Math.min(width, 520) - 32 - (dif.cols - 1) * 8;
    return Math.floor(larguraUtil / dif.cols);
  }, [width, dif.cols]);

  const trocarModo = useCallback((id) => {
    setModoId(id);
    saveLastMode(id);   // preferência leve; falhar não afeta o jogo
  }, []);

  /* ══════════════ ENTRADA ══════════════ */
  if (fase === 'entrada') {
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => navigation.goBack()} titulo="Pares do Beni" />
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
          <View style={styles.painel}>
            <BeniGuideBubble message={dica} avatarVariant="teaching" tone="purple" compact />
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

          <Text style={styles.secao}>Como você quer jogar?</Text>
          <View style={styles.modoRow}>
            {GAME_MODES.map((m) => {
              const ativo = modoId === m.id;
              const cor = m.id === 'turbo' ? pt.beniDeep : pt.faithBlue;
              return (
                <SoundButton
                  key={m.id}
                  style={[styles.modoCard, ativo && { borderColor: cor, backgroundColor: cor + '10' }]}
                  onPress={() => trocarModo(m.id)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                  accessibilityLabel={`${m.label}. ${m.desc}`}
                >
                  <View style={styles.modoTopo}>
                    <View style={[styles.modoIconBg, { backgroundColor: cor + '1F' }]}>
                      <FaithIcon name={m.icon} size={20} color={cor} />
                    </View>
                    {ativo && <FaithIcon name="check" size={20} color={pt.greenDeep} />}
                  </View>
                  <Text style={styles.modoTitulo}>{m.label}</Text>
                  <Text style={styles.modoDesc}>{m.desc}</Text>
                  {m.id === 'turbo' && (
                    <Text style={[styles.modoTag, { color: cor }]}>60 segundos</Text>
                  )}
                </SoundButton>
              );
            })}
          </View>

          <Text style={styles.secao}>Escolha o tamanho</Text>
          {DIFFICULTIES.map((d) => {
            const bloqueado = d.premium && !premium;
            const rec = modo.timed
              ? stats?.turbo?.[d.id]?.bestScore || 0
              : stats?.pares?.[d.id]?.bestMoves ?? null;
            return (
              <SoundButton
                key={d.id}
                style={[styles.difCard, difId === d.id && !bloqueado && styles.difCardAtivo, bloqueado && styles.difCardBloqueado]}
                onPress={() => !bloqueado && setDifId(d.id)}
                activeOpacity={0.85}
                disabled={bloqueado}
                accessibilityState={{ selected: difId === d.id, disabled: bloqueado }}
              >
                <View style={styles.difIconBg}>
                  <FaithIcon name={bloqueado ? 'lock' : 'pares'} size={18} color={bloqueado ? pt.textSoft : pt.purple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.difTitulo}>{d.label}</Text>
                  <Text style={styles.difDesc}>
                    {bloqueado
                      ? 'Faz parte do Plano Família.'
                      : modo.timed
                        ? (rec ? `${d.pairs} pares · seu recorde: ${rec} pontos` : `${d.pairs} pares por grade`)
                        : (rec ? `${d.pairs} pares · seu melhor: ${rec} jogadas` : `${d.pairs} pares`)}
                  </Text>
                </View>
                {difId === d.id && !bloqueado && <FaithIcon name="check" size={20} color={pt.greenDeep} />}
              </SoundButton>
            );
          })}

          {semRodadas ? (
            <View style={styles.convite}>
              <FaithIcon name="family" size={16} color="#7A5800" />
              <Text style={styles.conviteText}>
                Com o Plano Família você brinca quantas vezes quiser e abre os tamanhos Médio e Difícil.
              </Text>
            </View>
          ) : (
            <SoundButton style={styles.btnPrimario} onPress={comecar} activeOpacity={0.9} soundType="success">
              <Text style={styles.btnPrimarioText}>Começar a jogar</Text>
            </SoundButton>
          )}

          {!premium && !semRodadas && (
            <View style={styles.convite}>
              <FaithIcon name="family" size={16} color="#7A5800" />
              <Text style={styles.conviteText}>
                No Plano Família as rodadas são ilimitadas e os tamanhos Médio e Difícil ficam abertos.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  /* ══════════════ RESULTADO ══════════════ */
  if (fase === 'resultado') {
    const turbo = resultado?.modo === 'turbo';
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => setFase('entrada')} titulo="Pares do Beni" />
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
          <View style={styles.painel}>
            <BeniGuideBubble
              message={turbo ? BENI.turboFim : BENI.vitoria}
              avatarVariant="celebrating"
              tone="purple"
              compact
            />
          </View>

          <View style={styles.vitoriaCard}>
            <View style={styles.scoreRow}>
              {[1, 2, 3].map((n) => (
                <FaithIcon key={n} name="star" size={30} color={n <= (resultado?.score ?? 1) ? pt.gold : '#E3DDD4'} />
              ))}
            </View>
            <Text style={styles.vitoriaTitulo}>
              {turbo ? `${resultado?.pontos ?? 0} pontos!` : 'Você achou todos os pares!'}
            </Text>

            {turbo ? (
              <View style={styles.statsRow}>
                <Stat label="Pares" valor={String(resultado?.pares ?? 0)} />
                <Stat label="Maior combo" valor={`${resultado?.maiorCombo ?? 0}×`} />
                <Stat label="Antes" valor={resultado?.anterior ? String(resultado.anterior) : '—'} />
              </View>
            ) : (
              <View style={styles.statsRow}>
                <Stat label="Jogadas" valor={String(resultado?.jogadas ?? 0)} />
                <Stat label="Pares" valor={String(resultado?.pares ?? 0)} />
                <Stat label="Tempo" valor={formatTime(resultado?.elapsedMs)} />
              </View>
            )}

            {!turbo && (
              <Text style={styles.comparacao}>
                {resultado?.anterior
                  ? `Seu melhor antes: ${resultado.anterior} jogadas.`
                  : 'Este é o seu primeiro resultado neste tamanho.'}
              </Text>
            )}
            {turbo && !resultado?.anterior && (
              <Text style={styles.comparacao}>Este é o seu primeiro resultado no Turbo.</Text>
            )}

            {resultado?.isBest && (
              <View style={styles.faixaBoa}>
                <FaithIcon name="trophies" size={16} color="#0E5A3C" />
                <Text style={styles.faixaBoaText}>Novo recorde no {dif.label}!</Text>
              </View>
            )}
            {resultado?.starAwarded ? (
              <View style={styles.faixaBoa}>
                <FaithIcon name="star" size={16} color="#0E5A3C" />
                <Text style={styles.faixaBoaText}>Você ganhou 1 estrelinha!</Text>
              </View>
            ) : (
              <View style={styles.faixaSuave}>
                <Text style={styles.faixaSuaveText}>
                  Você já ganhou as {BRINCAR_DAILY_STAR_CAP} estrelinhas de hoje. Amanhã tem mais!
                </Text>
              </View>
            )}
          </View>

          <SoundButton style={styles.btnPrimario} onPress={comecar} activeOpacity={0.9} soundType="success">
            <Text style={styles.btnPrimarioText}>Jogar novamente</Text>
          </SoundButton>
          <SoundButton style={styles.btnSecundario} onPress={() => setFase('entrada')} activeOpacity={0.9}>
            <FaithIcon name="swap" size={16} color={pt.text} />
            <Text style={styles.btnSecundarioText}>Trocar modo</Text>
          </SoundButton>
          <SoundButton
            style={styles.btnTerciario}
            onPress={() => navigation.navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })}
            activeOpacity={0.9}
          >
            <Text style={styles.btnTerciarioText}>Voltar para Brincar</Text>
          </SoundButton>
        </ScrollView>
      </View>
    );
  }

  /* ══════════════ JOGANDO ══════════════ */
  const progresso = modo.timed
    ? restanteMs / TURBO_DURATION_MS
    : (casadas.length / 2) / Math.max(1, dif.pairs);

  return (
    <View style={styles.root}>
      <Header insets={insets} onBack={() => { limparTimers(); setFase('entrada'); }} titulo={modo.label} />

      <View style={styles.hud}>
        {modo.timed ? (
          <>
            <HudItem icone="timer" texto={formatTime(restanteMs)} destaque={restanteMs <= 10000} />
            <HudItem icone="star" texto={`${placar.pontos}`} />
            <HudItem icone="combo" texto={placar.combo > 1 ? `${comboMultiplier(placar.combo)}×` : '—'} />
          </>
        ) : (
          <>
            <HudItem icone="timer" texto={formatTime(decorridoMs)} />
            <HudItem icone="pares" texto={`${casadas.length / 2} de ${dif.pairs}`} />
            <HudItem icone="restart" texto={`${placar.jogadas}`} />
          </>
        )}
      </View>

      {/* Barra: progresso no Clássico, tempo no Turbo. */}
      <View style={styles.barraFundo}>
        <View
          style={[
            styles.barraFrente,
            {
              width: `${Math.max(0, Math.min(1, progresso)) * 100}%`,
              backgroundColor: modo.timed ? (restanteMs <= 10000 ? pt.beniDeep : pt.beni) : pt.green,
            },
          ]}
        />
      </View>

      <Text style={styles.dica} numberOfLines={2}>
        {pausado ? 'Jogo pausado. Volte quando quiser!' : dica}
      </Text>

      <ScrollView contentContainerStyle={[styles.grade, { paddingBottom: insets.bottom + 24 }]}>
        {deck.map((c, i) => (
          <Carta
            key={`${gradeId}-${c.key}`}
            carta={c}
            indice={i}
            aberta={abertas.includes(i)}
            casada={casadas.includes(c.key)}
            errando={errando.includes(i)}
            size={cardSize}
            onPress={() => tocarCarta(i)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

/* ══════════════════════════════ PEÇAS ══════════════════════════════ */

function Header({ insets, onBack, titulo }) {
  return (
    <LinearGradient
      colors={['#F0E8FF', '#E0D4FF', '#D0EAFF']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: Math.max(insets.top, 28) }]}
    >
      <SoundButton style={styles.backPill} onPress={onBack} activeOpacity={0.85} accessibilityLabel="Voltar">
        <FaithIcon name="back" size={16} color="#6E3FB5" />
        <Text style={styles.backPillText}>Voltar</Text>
      </SoundButton>
      <Text style={styles.headerTitle}>{titulo}</Text>
    </LinearGradient>
  );
}

function HudItem({ icone, texto, destaque }) {
  return (
    <View style={styles.hudItem}>
      <FaithIcon name={icone} size={14} color={destaque ? pt.beniDeep : pt.textSoft} />
      <Text style={[styles.hudText, destaque && { color: pt.beniDeep }]}>{texto}</Text>
    </View>
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

  header: { paddingHorizontal: 18, paddingBottom: 14 },
  backPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.18)',
  },
  backPillText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#6E3FB5' },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 24, color: pt.text },

  painel: {
    marginTop: 12, marginHorizontal: 16, backgroundColor: '#FBF7FF',
    borderRadius: radii.xl, borderWidth: 1.5, borderColor: '#E5D9F7',
    padding: 12, ...shadows.card,
  },

  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 12, marginHorizontal: 16,
    backgroundColor: '#FFF', borderRadius: radii.pill,
    paddingHorizontal: 12, paddingVertical: 9, ...shadows.soft,
  },
  pillText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: pt.text, fontWeight: '700' },

  secao: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginTop: 18, marginHorizontal: 18, marginBottom: 8 },

  // ── Modos ──
  modoRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16 },
  modoCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: radii.lg,
    borderWidth: 2, borderColor: '#EDE7F6', padding: 12, ...shadows.soft,
  },
  modoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  modoIconBg: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modoTitulo: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 3, minHeight: 36 },
  modoDesc: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, lineHeight: 15, minHeight: 30 },
  modoTag: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', marginTop: 6 },

  difCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 8, padding: 12,
    backgroundColor: '#FFF', borderRadius: radii.lg,
    borderWidth: 1.5, borderColor: '#EDE7F6', ...shadows.soft,
  },
  difCardAtivo: { borderColor: pt.purple },
  difCardBloqueado: { opacity: 0.72, backgroundColor: '#F7F5F2' },
  difIconBg: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: '#EDE4FF',
    alignItems: 'center', justifyContent: 'center',
  },
  difTitulo: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  difDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 1 },

  btnPrimario: {
    marginTop: 16, marginHorizontal: 16, backgroundColor: pt.purple,
    borderRadius: radii.lg, paddingVertical: 15, alignItems: 'center', ...shadows.card,
  },
  btnPrimarioText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
  btnSecundario: {
    flexDirection: 'row', gap: 8, justifyContent: 'center',
    marginTop: 10, marginHorizontal: 16, backgroundColor: '#FFF',
    borderRadius: radii.lg, paddingVertical: 13, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E3DDD4',
  },
  btnSecundarioText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  btnTerciario: { marginTop: 8, marginHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  btnTerciarioText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.textSoft },

  convite: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 14, marginHorizontal: 16, backgroundColor: pt.goldSoft,
    borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: pt.gold + '66',
  },
  conviteText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: '#7A5800', fontWeight: '700', lineHeight: 17 },

  // ── HUD ──
  hud: {
    flexDirection: 'row', justifyContent: 'center', gap: 18,
    paddingVertical: 10, backgroundColor: '#FFF',
  },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 62, justifyContent: 'center' },
  hudText: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.text },

  barraFundo: { height: 6, backgroundColor: '#EFEAE3', overflow: 'hidden' },
  barraFrente: { height: '100%', borderTopRightRadius: 3, borderBottomRightRadius: 3 },

  dica: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft,
    textAlign: 'center', marginTop: 10, marginHorizontal: 24, lineHeight: 17, minHeight: 34,
  },

  // ── Cartas ──
  grade: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 8, paddingHorizontal: 16, paddingTop: 6,
  },
  // A sombra vive na CAIXA: as faces recortam (overflow hidden) e engoliriam a sombra.
  cartaBox: { borderRadius: radii.md, ...shadows.soft },
  cartaPressionada: { opacity: 0.86 },
  face: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.md, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 2,
  },
  cartaVerso: { backgroundColor: '#7C3AED', borderColor: '#6D28D9' },
  cartaFrente: { backgroundColor: '#FFF', borderColor: '#E5D9F7' },
  cartaFrenteCasada: { borderColor: '#0E9F6E' },
  cartaFrenteErro: { borderColor: '#E8A33D' },
  cartaImgVazia: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3EFE9' },
  cartaCheck: {
    position: 'absolute', right: 4, bottom: 4,
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#0E9F6E',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Resultado ──
  vitoriaCard: {
    marginTop: 14, marginHorizontal: 16, backgroundColor: '#FFF',
    borderRadius: radii.xl, padding: 16, alignItems: 'center', ...shadows.card,
  },
  scoreRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  vitoriaTitulo: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 12, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 22, marginBottom: 6 },
  stat: { alignItems: 'center', minWidth: 74 },
  statValor: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text },
  statLabel: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, textAlign: 'center' },
  comparacao: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 6, textAlign: 'center' },

  faixaBoa: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch',
    marginTop: 10, backgroundColor: '#DDF3E7', borderRadius: radii.md,
    paddingHorizontal: 12, paddingVertical: 9,
  },
  faixaBoaText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#0E5A3C' },
  faixaSuave: {
    alignSelf: 'stretch', marginTop: 10, backgroundColor: '#F3EFE9',
    borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 9,
  },
  faixaSuaveText: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, fontWeight: '700', lineHeight: 17 },
});
