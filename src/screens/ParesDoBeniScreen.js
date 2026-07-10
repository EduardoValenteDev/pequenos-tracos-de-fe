/**
 * ParesDoBeniScreen — primeiro jogo real da aba Brincar (1.3 · polido no 1.4 · endurecido no 1.4b).
 *
 * ── Quem manda no jogo ───────────────────────────────────────────────────────
 * Esta tela NÃO decide regra nenhuma. Toda a lógica vive em `paresGameMachine`, uma
 * máquina de estados PURA guardada num ref (`jogoRef`). O ref é atualizado de forma
 * SÍNCRONA no primeiro instante do toque — antes de qualquer setState, som, vibração
 * ou animação. É isso que torna impossível abrir uma terceira carta: quem decide não
 * é o estado do React (que chega atrasado), é a fase.
 *
 * A verificação do par só acontece quando o flip da 2ª carta TERMINA de verdade —
 * a `Carta` avisa por callback (`onFlipEnd`). Nenhum atraso adivinha a duração.
 *
 * ── Dois modos ───────────────────────────────────────────────────────────────
 * Clássico — todos os pares, sem relógio contra a criança. Recorde: jogadas/tempo.
 * Turbo    — tempo por nível; limpar a grade traz outra (a partida só acaba no zero).
 *            Combo multiplica pontos. Erro NUNCA tira tempo. Recorde: pontos + top 5.
 *
 * ── Regras de plano ──────────────────────────────────────────────────────────
 * Free: 2 rodadas por dia; só a dificuldade Fácil. Plano Família: tudo aberto.
 * O bloqueio é um CONVITE, nunca uma punição.
 *
 * ── Rodada, estrelinha e salvamento (invariantes travados no smoke) ──────────
 * Rodada consumida só em `comecar()`. Partida salva UMA vez, em `salvarPartida()`,
 * no instante em que ela termina — nunca ao abrir a tela de detalhes. A estrelinha
 * respeita o teto diário compartilhado pelos dois modos. O ranking pessoal é local
 * e não concede estrelinha nenhuma.
 *
 * Sem emoji: só FaithIcon. Som e vibração são bônus: falharem não quebra o jogo.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Image, Animated, Pressable, AppState, Easing,
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
import { readStats, recordParesResult, saveLastMode, RANKING_MAX } from '../services/brincarStatsService';
import { playGameSfx, preloadGameSfx, releaseGameSfx, stopGameSfx } from '../services/audioManager';
import { warn } from '../utils/logger';
import {
  DIFFICULTIES, getDifficulty, buildDeck, pickStoryIds,
  computeScore, formatTime, BRINCAR_DAILY_STAR_CAP,
  GAME_MODES, getMode, DEFAULT_MODE, getTurboDuration,
  addTurboTime, comboMultiplier, segundosRestantes,
  TURBO_ALERTA_MS, TURBO_TICK_MS, PARES_SOUND_EVENTS,
} from '../services/paresGameService';
import {
  FASES, EFEITOS, criarJogo, tocar, flipConcluido, verificar,
  liberar, fechar, novaGrade, encerrar,
} from '../services/paresGameMachine';

/** Falas do Beni (texto por enquanto; a voz vem no bloco de áudio do Beni). */
const BENI = {
  entrada: 'Vamos achar os pares? Toque em duas cartinhas iguais!',
  primeiroPar: 'Isso! Você achou o primeiro par.',
  metade: 'Você já está na metade. Continue!',
  incentivo: 'Quase! Respira e tenta de novo, eu tô aqui.',
  vitoria: 'Você conseguiu! Que memória boa!',
  gradeCompleta: 'Grade completa! Mais pares chegando!',
  tempoFim: 'Vamos ver quantos pares você encontrou?',
  semRodadas: 'As rodadas de hoje acabaram. Amanhã a gente joga de novo!',
};

/** Elogios do Turbo — sempre positivos, nunca comparativos. */
const BENI_TURBO = [
  'Cada partida deixa você ainda melhor!',
  'Que memória boa você tem!',
  'Você foi muito rápido!',
  'Que memória incrível!',
];
function elogioTurbo(pares, recorde) {
  if (recorde) return 'Que memória incrível! Você bateu seu recorde!';
  if (pares >= 10) return 'Você foi muito rápido!';
  if (pares >= 5) return 'Que memória boa você tem!';
  return BENI_TURBO[0];
}

/** Tempos das animações. Constantes: não são estado. */
const T = {
  flip: 300,        // virar a carta (a Carta avisa quando termina de verdade)
  observar: 420,    // as duas cartas visíveis antes de o jogo verificar
  celebrar: 420,    // acerto: pop + respiro antes de liberar a grade
  chacoalhar: 380,  // erro: chacoalhada (300–450 ms)
  novaGrade: 750,   // Turbo: troca de grade
  aviso: 1800,      // "Novo recorde!" some sozinho
};

const IDS_COM_CAPA = stories.map((s) => s.id).filter((id) => !!getStoryCoverImage(id));

const novoDeck = (pares) => buildDeck(pickStoryIds(IDS_COM_CAPA, pares));

/** Vibração muito leve. expo-haptics já é dependência; falhar aqui é irrelevante. */
function vibrar(tipo) {
  try {
    if (tipo === 'acerto') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else Haptics.selectionAsync();
  } catch { /* sem vibração — segue o jogo */ }
}

/** 'YYYY-MM-DD' → 'dd/mm'. Entrada estranha → ''. */
function dataCurta(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  return m ? `${m[3]}/${m[2]}` : '';
}

/* ══════════════════════════════ CARTA ══════════════════════════════ */

/**
 * Carta com flip real no eixo Y. As duas faces coexistem, giradas 180° entre si,
 * com `backfaceVisibility: hidden` — assim a imagem nunca aparece espelhada.
 *
 * `onFlipEnd` dispara quando o giro de ABERTURA termina. É esse callback — e não um
 * atraso — que autoriza o jogo a verificar o par.
 */
const Carta = React.memo(function Carta({ carta, aberta, casada, errando, size, indice, onPress, onFlipEnd }) {
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
    // Só o giro de ABERTURA avisa. Fechar a carta não verifica nada.
    anim.start(({ finished }) => {
      if (finished && virada && onFlipEnd) onFlipEnd(indice);
    });
    return () => anim.stop();
  }, [virada]);   // eslint-disable-line react-hooks/exhaustive-deps

  // Acerto: pop curto de crescer e voltar. Só depois da verificação (casada).
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
          { opacity: entrada, transform: [{ translateX: shakeX }, { scale: Animated.multiply(pop, entradaScale) }] },
        ]}
      >
        <Animated.View style={[styles.face, styles.cartaVerso, { transform: [{ perspective: 800 }, { rotateY: rotVerso }] }]}>
          <FaithIcon name="pares" size={w * 0.34} color="#FFFFFFAA" />
        </Animated.View>

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

/** Capa recortada pelo PONTO FOCAL da história (ver gameCardFraming). */
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
  // O contexto pode não estar montado. O jogo não depende dele: se faltar, apenas
  // não atualizamos o resumo de estrelinhas.
  const progressCtx = useProgressContext();
  const refreshProgress = progressCtx?.refreshProgress;
  const premium = isPremiumUser();

  // Fase da TELA (o que se vê). A fase do JOGO vive na máquina, em jogoRef.
  const [tela, setTela] = useState('entrada');   // entrada | jogando | tempoEsgotado | resultado
  const [modoId, setModoId] = useState(DEFAULT_MODE);
  const [difId, setDifId] = useState('facil');
  const [rounds, setRounds] = useState(null);
  const [stats, setStats] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [dica, setDica] = useState(BENI.entrada);
  const [aviso, setAviso] = useState(null);      // "Novo recorde!" / "Grade completa!"
  const [pausado, setPausado] = useState(false);

  const modo = getMode(modoId);
  const dif = getDifficulty(difId) || DIFFICULTIES[0];
  const duracaoMs = getTurboDuration(difId);

  // ── FONTE ÚNICA da lógica: a máquina, num ref (síncrona). `vista` só desenha. ──
  const jogoRef = useRef(criarJogo({ deck: [], pares: dif.pairs }));
  const [vista, setVista] = useState(jogoRef.current);

  const [decorridoMs, setDecorridoMs] = useState(0);
  const [restanteMs, setRestanteMs] = useState(duracaoMs);
  const decorridoRef = useRef(0);
  const restanteRef = useRef(duracaoMs);
  const ultimoSegundoRef = useRef(null);   // 1 tique por segundo, no máximo
  const tempoAcabouRef = useRef(false);    // alarme e painel: uma vez só
  const salvoRef = useRef(false);          // partida salva: uma vez só
  const timeouts = useRef([]);
  const montado = useRef(true);

  const pulso = useRef(new Animated.Value(0)).current;   // borda/relógio nos últimos 10 s
  const tique = useRef(new Animated.Value(1)).current;   // número cresce a cada segundo

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

  const mostrarAviso = useCallback((texto) => {
    setAviso(texto);
    agendar(() => setAviso(null), T.aviso);
  }, [agendar]);

  /**
   * Handlers sempre FRESCOS. `executar` e o relógio são memoizados, mas precisam
   * chamar funções que dependem de `stats` (carregado depois). Sem este ref, eles
   * ficariam presos ao primeiro render — quando `stats` ainda era null — e o recorde
   * anterior sairia errado. Atribuído no corpo do render: nunca desatualiza.
   */
  const fn = useRef({});

  /* ── Efeitos que a máquina pede. A máquina não conhece som nem timer. ── */
  const executar = useCallback((efeitos) => {
    for (const e of efeitos) {
      switch (e) {
        case EFEITOS.SOM_FLIP: playGameSfx(PARES_SOUND_EVENTS.FLIP); break;
        case EFEITOS.SOM_ACERTO: playGameSfx(PARES_SOUND_EVENTS.MATCH); break;
        case EFEITOS.SOM_ERRO: playGameSfx(PARES_SOUND_EVENTS.MISMATCH); break;
        case EFEITOS.SOM_GRADE: playGameSfx(PARES_SOUND_EVENTS.BOARD_COMPLETE); break;
        case EFEITOS.VIBRAR_ACERTO: vibrar('acerto'); break;
        case EFEITOS.VIBRAR_ERRO: vibrar('erro'); break;
        case EFEITOS.BONUS_TEMPO:
          restanteRef.current = addTurboTime(restanteRef.current);
          setRestanteMs(restanteRef.current);
          break;
        case EFEITOS.RECORDE_BATIDO: fn.current.mostrarAviso('Novo recorde!'); break;
        case EFEITOS.AGENDAR_VERIFICAR: fn.current.agendar(() => fn.current.aplicar(verificar), T.observar); break;
        case EFEITOS.AGENDAR_LIBERAR: fn.current.agendar(() => fn.current.aplicar(liberar), T.celebrar); break;
        case EFEITOS.AGENDAR_FECHAR: fn.current.agendar(() => fn.current.aplicar(fechar), T.chacoalhar); break;
        case EFEITOS.AGENDAR_NOVA_GRADE:
          fn.current.mostrarAviso(BENI.gradeCompleta);
          fn.current.agendar(() => fn.current.aplicar(novaGrade, novoDeck(fn.current.pares)), T.novaGrade);
          break;
        case EFEITOS.FIM_DE_JOGO: fn.current.encerrarClassico(); break;
        default: break;
      }
    }
  }, []);

  /**
   * Único caminho de transição. Lê a máquina do ref, aplica, GRAVA no ref de forma
   * síncrona e só então avisa o React. Nenhum toque concorrente vê estado velho.
   */
  const aplicar = useCallback((transicao, ...args) => {
    const r = transicao(jogoRef.current, ...args);
    jogoRef.current = r.estado;
    if (montado.current) setVista(r.estado);
    if (r.efeitos?.length) executar(r.efeitos);
    return r;
  }, [executar]);

  /* ── Ciclo de vida ── */
  useEffect(() => {
    montado.current = true;
    preloadGameSfx();
    let vivo = true;
    getDailyRounds().then((r) => vivo && setRounds(r)).catch((e) => warn('ParesDoBeni.rounds:', e));
    readStats().then((s) => {
      if (!vivo) return;
      setStats(s);
      if (s?.lastMode) setModoId(s.lastMode);
    }).catch((e) => warn('ParesDoBeni.stats:', e));

    return () => {
      vivo = false;
      montado.current = false;
      limparTimers();
      pulso.stopAnimation(); tique.stopAnimation();
      stopGameSfx(PARES_SOUND_EVENTS.COUNTDOWN_TICK);
      releaseGameSfx();   // nenhum som sobrevive à saída da tela
    };
  }, [limparTimers]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Pausa: app em segundo plano ou tela sem foco ── */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (estado) => setPausado(estado !== 'active'));
    const off = navigation.addListener('blur', () => setPausado(true));
    const on = navigation.addListener('focus', () => setPausado(AppState.currentState !== 'active'));
    return () => { sub.remove(); off(); on(); };
  }, [navigation]);

  // Pausou? O relógio já para (o intervalo é desmontado). Falta calar o tique.
  useEffect(() => {
    if (pausado) stopGameSfx(PARES_SOUND_EVENTS.COUNTDOWN_TICK);
  }, [pausado]);

  const jogando = tela === 'jogando';

  /* ── Relógio único dos dois modos ──
     Acumula por delta: parar o intervalo PAUSA de verdade, sem correr por baixo. */
  useEffect(() => {
    if (!jogando || pausado) return undefined;
    let ultimo = Date.now();
    const t = setInterval(() => {
      const agora = Date.now();
      const delta = agora - ultimo;
      ultimo = agora;

      decorridoRef.current += delta;
      setDecorridoMs(decorridoRef.current);
      if (!modo.timed) return;

      restanteRef.current = Math.max(0, restanteRef.current - delta);
      setRestanteMs(restanteRef.current);

      // Últimos 5 s: um tique por segundo, casado com a troca do número.
      const seg = segundosRestantes(restanteRef.current);
      if (seg > 0 && seg <= TURBO_TICK_MS / 1000 && seg !== ultimoSegundoRef.current) {
        ultimoSegundoRef.current = seg;
        playGameSfx(PARES_SOUND_EVENTS.COUNTDOWN_TICK);
        Animated.sequence([
          Animated.timing(tique, { toValue: 1.28, duration: 110, useNativeDriver: true }),
          Animated.timing(tique, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start();
      }

      if (restanteRef.current <= 0) fn.current.tempoEsgotou();
    }, 100);
    return () => clearInterval(t);
  }, [jogando, pausado, modo.timed]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Pulso vermelho dos últimos 10 s (borda + relógio) ── */
  const emAlerta = jogando && modo.timed && !pausado && restanteMs > 0 && restanteMs <= TURBO_ALERTA_MS;
  useEffect(() => {
    if (!emAlerta) { pulso.stopAnimation(); pulso.setValue(0); return undefined; }
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(pulso, { toValue: 1, duration: 480, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulso, { toValue: 0, duration: 480, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, [emAlerta]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Salvar a partida: UMA vez, quando ela termina ── */
  const salvarPartida = useCallback(async () => {
    if (salvoRef.current) return;
    salvoRef.current = true;

    const g = jogoRef.current;
    const elapsedMs = decorridoRef.current;
    const anterior = modo.timed
      ? (stats?.turbo?.[difId]?.bestScore ?? 0)
      : (stats?.pares?.[difId]?.bestMoves ?? null);

    let r = { stats: null, isBest: false, starAwarded: false, posicao: 0 };
    try {
      const day = toDayKey(new Date());
      r = await recordParesResult({
        modo: modoId, dificuldade: difId, day, data: day,
        elapsedMs, erros: g.erros, jogadas: g.jogadas,
        pontos: g.pontos, pares: g.paresTotais, maiorCombo: g.maiorCombo,
        grades: g.gradesCompletas, duracaoMs,
      });
      if (r.starAwarded) {
        await addBonusStars(1);
        await refreshProgress?.();
      }
    } catch (e) {
      warn('ParesDoBeni.salvarPartida:', e);   // resultado aparece mesmo assim
    }

    if (!montado.current) return;
    if (r.stats) setStats(r.stats);
    setResultado({
      modo: modoId, dificuldade: difId, elapsedMs, anterior,
      jogadas: g.jogadas, erros: g.erros, pontos: g.pontos,
      pares: g.paresTotais, maiorCombo: g.maiorCombo, grades: g.gradesCompletas,
      score: computeScore({ pairs: dif.pairs, erros: g.erros, elapsedMs }),
      isBest: r.isBest, starAwarded: r.starAwarded, posicao: r.posicao,
      ranking: r.stats?.turbo?.[difId]?.ranking ?? [],
    });
  }, [modoId, difId, dif.pairs, duracaoMs, modo.timed, stats, refreshProgress]);

  /** Clássico: grade limpa = fim. Vinheta de vitória e resultado direto. */
  const encerrarClassico = useCallback(() => {
    limparTimers();
    playGameSfx(PARES_SOUND_EVENTS.CLASSIC_JINGLE);
    salvarPartida();
    setTela('resultado');
  }, [limparTimers, salvarPartida]);

  /** Turbo: zero no relógio. Alarme + painel "Tempo encerrado" — uma vez só. */
  const tempoEsgotou = useCallback(() => {
    if (tempoAcabouRef.current) return;
    tempoAcabouRef.current = true;

    aplicar(encerrar);            // a máquina para de aceitar toque, para sempre
    limparTimers();               // cancela verificação/chacoalhada/nova grade pendentes
    stopGameSfx(PARES_SOUND_EVENTS.COUNTDOWN_TICK);
    pulso.stopAnimation(); pulso.setValue(0);
    playGameSfx(PARES_SOUND_EVENTS.TIME_UP);

    restanteRef.current = 0;
    setRestanteMs(0);
    salvarPartida();              // salvo AQUI, não ao abrir os detalhes
    setTela('tempoEsgotado');
  }, [aplicar, limparTimers, salvarPartida]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Começar: SÓ AQUI a rodada é consumida ── */
  const comecar = useCallback(async () => {
    const r = await consumeRound();
    if (!r.ok) {
      setRounds(await getDailyRounds());
      setDica(BENI.semRodadas);
      setTela('entrada');
      return;
    }
    limparTimers();
    const recordeAtual = stats?.turbo?.[difId]?.bestScore ?? 0;
    jogoRef.current = criarJogo({
      deck: novoDeck(dif.pairs), pares: dif.pairs,
      cronometrado: modo.timed, recordeAtual,
    });
    setVista(jogoRef.current);

    decorridoRef.current = 0; setDecorridoMs(0);
    restanteRef.current = duracaoMs; setRestanteMs(duracaoMs);
    ultimoSegundoRef.current = null;
    tempoAcabouRef.current = false;
    salvoRef.current = false;
    setResultado(null); setAviso(null);
    setDica(BENI.entrada);
    setPausado(AppState.currentState !== 'active');
    setTela('jogando');
    setRounds(await getDailyRounds());
  }, [dif.pairs, duracaoMs, modo.timed, difId, stats, limparTimers]);

  /** Sair da partida (botão Voltar durante o jogo): encerra e limpa tudo. */
  const abandonar = useCallback(() => {
    limparTimers();
    stopGameSfx(PARES_SOUND_EVENTS.COUNTDOWN_TICK);
    pulso.stopAnimation();
    aplicar(encerrar);
    setTela('entrada');
  }, [aplicar, limparTimers]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Toque na carta: a máquina decide, de forma síncrona ── */
  const tocarCarta = useCallback((i) => {
    if (pausado) return;
    aplicar(tocar, i);   // recusado → nenhum efeito: sem som, sem vibração, sem jogada
  }, [aplicar, pausado]);

  const cartaAbriu = useCallback((i) => { aplicar(flipConcluido, i); }, [aplicar]);

  /* ── Dica do Beni no Clássico (não interfere na lógica) ── */
  useEffect(() => {
    if (!jogando || modo.timed) return;
    const feitos = vista.casadas.length / 2;
    if (feitos === 1) setDica(BENI.primeiroPar);
    else if (feitos === Math.ceil(dif.pairs / 2)) setDica(BENI.metade);
  }, [vista.casadas.length, jogando, modo.timed, dif.pairs]);

  useEffect(() => {
    if (jogando && !modo.timed && vista.erros > 0 && vista.erros % 3 === 0) setDica(BENI.incentivo);
  }, [vista.erros, jogando, modo.timed]);

  /* ── Derivados ── */
  const semRodadas = !premium && rounds != null && rounds.remaining <= 0;
  const cardSize = useMemo(() => {
    const larguraUtil = Math.min(width, 520) - 32 - (dif.cols - 1) * 8;
    return Math.floor(larguraUtil / dif.cols);
  }, [width, dif.cols]);

  const trocarModo = useCallback((id) => { setModoId(id); saveLastMode(id); }, []);

  // Publica os handlers frescos deste render. Feito no corpo (não em efeito) para
  // que um toque no mesmo frame já enxergue a versão nova.
  fn.current = { aplicar, agendar, mostrarAviso, encerrarClassico, tempoEsgotou, pares: dif.pairs };

  /* ══════════════ ENTRADA ══════════════ */
  if (tela === 'entrada') {
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
                    <Text style={[styles.modoTag, { color: cor }]}>{Math.round(duracaoMs / 1000)} segundos</Text>
                  )}
                </SoundButton>
              );
            })}
          </View>

          <Text style={styles.secao}>Escolha o tamanho</Text>
          {DIFFICULTIES.map((d) => {
            const bloqueado = d.premium && !premium;
            const t = stats?.turbo?.[d.id];
            const c = stats?.pares?.[d.id];
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
                  {bloqueado ? (
                    <Text style={styles.difDesc}>Faz parte do Plano Família.</Text>
                  ) : modo.timed ? (
                    <>
                      <Text style={styles.difDesc}>
                        {d.pairs} pares por grade · {Math.round(getTurboDuration(d.id) / 1000)} segundos
                      </Text>
                      <Text style={styles.difRec}>
                        {t?.bestScore
                          ? `Melhor: ${t.bestScore} pontos · ${t.bestPairs} pares · combo ${t.bestCombo}×`
                          : 'Você ainda não jogou o Turbo neste tamanho.'}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.difDesc}>
                      {c?.bestMoves ? `${d.pairs} pares · seu melhor: ${c.bestMoves} jogadas` : `${d.pairs} pares`}
                    </Text>
                  )}
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

  /* ══════════════ TEMPO ENCERRADO (só Turbo) ══════════════ */
  if (tela === 'tempoEsgotado') {
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => setTela('entrada')} titulo="Pares do Beni" />
        <View style={styles.centro}>
          <View style={styles.tempoCard}>
            <View style={styles.tempoIconBg}>
              <FaithIcon name="timer" size={34} color={pt.beniDeep} />
            </View>
            <Text style={styles.tempoTitulo}>Tempo encerrado!</Text>
            <Text style={styles.tempoSub}>{BENI.tempoFim}</Text>
            <SoundButton
              style={styles.btnPrimarioCheio}
              onPress={() => { playGameSfx(PARES_SOUND_EVENTS.TURBO_JINGLE); setTela('resultado'); }}
              activeOpacity={0.9}
              soundType="success"
            >
              <Text style={styles.btnPrimarioText}>Ver meu resultado</Text>
            </SoundButton>
          </View>
        </View>
      </View>
    );
  }

  /* ══════════════ RESULTADO ══════════════ */
  if (tela === 'resultado') {
    const turbo = resultado?.modo === 'turbo';
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => setTela('entrada')} titulo="Pares do Beni" />
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
          <View style={styles.painel}>
            <BeniGuideBubble
              message={turbo ? elogioTurbo(resultado?.pares ?? 0, resultado?.isBest) : BENI.vitoria}
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
              <>
                <View style={styles.statsRow}>
                  <Stat label="Pares" valor={String(resultado?.pares ?? 0)} />
                  <Stat label="Maior combo" valor={`${resultado?.maiorCombo ?? 0}×`} />
                  <Stat label="Grades" valor={String(resultado?.grades ?? 0)} />
                </View>
                <Text style={styles.comparacao}>
                  {resultado?.anterior
                    ? `Seu recorde antes: ${resultado.anterior} pontos.`
                    : 'Este é o seu primeiro resultado no Turbo.'}
                </Text>
                {resultado?.posicao > 0 && (
                  <Text style={styles.comparacao}>
                    Esta partida é a {resultado.posicao}ª melhor do {dif.label}.
                  </Text>
                )}
              </>
            ) : (
              <>
                <View style={styles.statsRow}>
                  <Stat label="Jogadas" valor={String(resultado?.jogadas ?? 0)} />
                  <Stat label="Pares" valor={String(resultado?.pares ?? 0)} />
                  <Stat label="Tempo" valor={formatTime(resultado?.elapsedMs)} />
                </View>
                <Text style={styles.comparacao}>
                  {resultado?.anterior
                    ? `Seu melhor antes: ${resultado.anterior} jogadas.`
                    : 'Este é o seu primeiro resultado neste tamanho.'}
                </Text>
              </>
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

          {turbo && (
            <RankingTabela
              lista={resultado?.ranking ?? []}
              posicaoAtual={resultado?.posicao ?? 0}
              nivel={dif.label}
            />
          )}

          <SoundButton style={styles.btnPrimario} onPress={comecar} activeOpacity={0.9} soundType="success">
            <Text style={styles.btnPrimarioText}>Jogar novamente</Text>
          </SoundButton>
          <SoundButton style={styles.btnSecundario} onPress={() => setTela('entrada')} activeOpacity={0.9}>
            <FaithIcon name="pares" size={16} color={pt.text} />
            <Text style={styles.btnSecundarioText}>Trocar nível</Text>
          </SoundButton>
          <SoundButton style={styles.btnSecundario} onPress={() => setTela('entrada')} activeOpacity={0.9}>
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
  const feitosNaGrade = vista.casadas.length / 2;
  const progresso = modo.timed ? restanteMs / duracaoMs : feitosNaGrade / Math.max(1, dif.pairs);
  const critico = modo.timed && restanteMs <= TURBO_ALERTA_MS && restanteMs > 0;
  const segundos = segundosRestantes(restanteMs);
  const contando = modo.timed && segundos > 0 && segundos <= TURBO_TICK_MS / 1000;
  const errando = vista.fase === FASES.ERROR ? vista.abertas : [];

  const faltaPRecorde = modo.timed && vista.recordeAtual > 0 && vista.pontos <= vista.recordeAtual
    ? vista.recordeAtual - vista.pontos + 1
    : 0;

  return (
    <View style={styles.root}>
      <Header insets={insets} onBack={abandonar} titulo={modo.label} />

      <View style={styles.hud}>
        {modo.timed ? (
          <>
            <Animated.View style={[styles.hudItem, contando && { transform: [{ scale: tique }] }]}>
              <FaithIcon name="timer" size={14} color={critico ? '#C0392B' : pt.textSoft} />
              <Text style={[styles.hudText, critico && styles.hudCritico]}>{formatTime(restanteMs)}</Text>
            </Animated.View>
            <HudItem icone="star" texto={`${vista.pontos}`} />
            <HudItem icone="pares" texto={`${vista.paresTotais}`} />
            <HudItem icone="combo" texto={vista.combo > 1 ? `${comboMultiplier(vista.combo)}×` : '—'} />
          </>
        ) : (
          <>
            <HudItem icone="timer" texto={formatTime(decorridoMs)} />
            <HudItem icone="pares" texto={`${feitosNaGrade} de ${dif.pairs}`} />
            <HudItem icone="restart" texto={`${vista.jogadas}`} />
          </>
        )}
      </View>

      {/* Meta: quanto falta para o recorde. Uma linha só, sem poluir. */}
      {modo.timed && (
        <Text style={styles.meta} numberOfLines={1}>
          {faltaPRecorde > 0
            ? `Faltam ${faltaPRecorde} pontos para seu recorde (${vista.recordeAtual})`
            : vista.recordeAtual > 0
              ? `Você passou seu recorde de ${vista.recordeAtual} pontos!`
              : `Grades completas: ${vista.gradesCompletas}`}
        </Text>
      )}

      <View style={styles.barraFundo}>
        <View
          style={[
            styles.barraFrente,
            {
              width: `${Math.max(0, Math.min(1, progresso)) * 100}%`,
              backgroundColor: modo.timed ? (critico ? '#C0392B' : pt.beni) : pt.green,
            },
          ]}
        />
      </View>

      <Text style={styles.dica} numberOfLines={2}>
        {pausado ? 'Jogo pausado. Volte quando quiser!' : (aviso || dica)}
      </Text>

      <View style={styles.areaJogo}>
        {/* Borda que pulsa em vermelho nos últimos 10 s. Não cobre as cartas. */}
        {critico && (
          <Animated.View
            pointerEvents="none"
            style={[styles.bordaAlerta, { opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.75] }) }]}
          />
        )}
        <ScrollView contentContainerStyle={[styles.grade, { paddingBottom: insets.bottom + 24 }]}>
          {vista.deck.map((c, i) => (
            <Carta
              key={`${vista.gradesCompletas}-${c.key}`}
              carta={c}
              indice={i}
              aberta={vista.abertas.includes(i)}
              casada={vista.casadas.includes(c.key)}
              errando={errando.includes(i)}
              size={cardSize}
              onPress={() => tocarCarta(i)}
              onFlipEnd={cartaAbriu}
            />
          ))}
        </ScrollView>
      </View>
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

function HudItem({ icone, texto }) {
  return (
    <View style={styles.hudItem}>
      <FaithIcon name={icone} size={14} color={pt.textSoft} />
      <Text style={styles.hudText}>{texto}</Text>
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

/** Histórico pessoal do Turbo: as cinco melhores partidas daquele nível. Local. */
function RankingTabela({ lista, posicaoAtual, nivel }) {
  if (!lista.length) return null;
  const CORES = ['#E0A21A', '#9AA5B1', '#B06A3B'];   // ouro · prata · bronze
  return (
    <View style={styles.ranking}>
      <Text style={styles.rankingTitulo}>Suas {RANKING_MAX} melhores no {nivel}</Text>
      {lista.map((e, i) => {
        const atual = posicaoAtual === i + 1;
        const cor = CORES[i] ?? pt.textSoft;
        return (
          <View key={`${e.data}-${e.pontos}-${i}`} style={[styles.rankLinha, atual && styles.rankLinhaAtual]}>
            <View style={[styles.rankMedalha, { backgroundColor: cor + '22', borderColor: cor }]}>
              <Text style={[styles.rankPos, { color: cor }]}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankPontos}>
                {e.pontos} pontos{atual ? ' · esta partida' : ''}
              </Text>
              <Text style={styles.rankDetalhe}>
                {e.pares} pares · combo {e.maiorCombo}× · {dataCurta(e.data) || 'hoje'}
              </Text>
            </View>
            {i === 0 && <FaithIcon name="trophies" size={18} color={CORES[0]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  centro: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },

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
  difRec: { fontFamily: 'Nunito', fontSize: 11, color: pt.goldDeep, fontWeight: '800', marginTop: 2 },

  btnPrimario: {
    marginTop: 16, marginHorizontal: 16, backgroundColor: pt.purple,
    borderRadius: radii.lg, paddingVertical: 15, alignItems: 'center', ...shadows.card,
  },
  btnPrimarioCheio: {
    marginTop: 18, alignSelf: 'stretch', backgroundColor: pt.purple,
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

  // ── Tempo encerrado ──
  tempoCard: {
    backgroundColor: '#FFF', borderRadius: radii.xl, padding: 22,
    alignItems: 'center', ...shadows.card,
  },
  tempoIconBg: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: pt.beniSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  tempoTitulo: { fontFamily: 'FredokaOne', fontSize: 24, color: pt.text, textAlign: 'center' },
  tempoSub: { fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  // ── HUD ──
  hud: {
    flexDirection: 'row', justifyContent: 'center', gap: 16,
    paddingVertical: 10, backgroundColor: '#FFF',
  },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 54, justifyContent: 'center' },
  hudText: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.text },
  hudCritico: { color: '#C0392B' },

  meta: {
    fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', color: pt.textSoft,
    textAlign: 'center', backgroundColor: '#FFF', paddingBottom: 8,
  },

  barraFundo: { height: 6, backgroundColor: '#EFEAE3', overflow: 'hidden' },
  barraFrente: { height: '100%', borderTopRightRadius: 3, borderBottomRightRadius: 3 },

  dica: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft,
    textAlign: 'center', marginTop: 10, marginHorizontal: 24, lineHeight: 17, minHeight: 34,
  },

  areaJogo: { flex: 1 },
  bordaAlerta: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4, borderColor: '#C0392B', borderRadius: radii.lg,
    margin: 6,
  },

  grade: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 8, paddingHorizontal: 16, paddingTop: 6,
  },
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
  statsRow: { flexDirection: 'row', gap: 18, marginBottom: 6 },
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

  // ── Ranking pessoal ──
  ranking: {
    marginTop: 16, marginHorizontal: 16, backgroundColor: '#FFF',
    borderRadius: radii.xl, padding: 14, ...shadows.card,
  },
  rankingTitulo: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 10 },
  rankLinha: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 10, marginBottom: 6,
    borderRadius: radii.md, backgroundColor: '#FBF9F5',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  rankLinhaAtual: { borderColor: pt.purple, backgroundColor: '#F7F1FF' },
  rankMedalha: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  rankPos: { fontFamily: 'FredokaOne', fontSize: 15 },
  rankPontos: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  rankDetalhe: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, marginTop: 1 },
});
