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
  View, Text, ScrollView, Image, Animated, AppState, Easing,
  StyleSheet, useWindowDimensions, PixelRatio, AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import FaithIcon from '../components/ui/FaithIcon';
import { BeniGuideBubble } from '../components/beni';
import ParesFlipCard from '../components/pares/ParesFlipCard';
import ParesCreatorDiagnostics from '../components/pares/ParesCreatorDiagnostics';
import ParesStreakMeter from '../components/pares/ParesStreakMeter';
import { ParesSpark, ParesFogoEmbers } from '../components/pares/ParesStreakFx';
import { ROUTES } from '../constants/routes';
import { stories } from '../data/stories';
import { getStoryCoverImage } from '../services/storyImageService';
import { isPremiumUser } from '../services/accessControl';
import { addBonusStars } from '../services/postStoryStorage';
import { useProgressContext } from '../context/ProgressContext';
import { getDailyRounds, consumeRound, toDayKey } from '../services/brincarDailyService';
import { readStats, recordParesResult, saveLastMode } from '../services/brincarStatsService';
import { playGameSfx, preloadGameSfx, releaseGameSfx, stopGameSfx } from '../services/audioManager';
import { warn } from '../utils/logger';
import {
  DIFFICULTIES, getDifficulty, buildDeck, pickStoryIds,
  computeScore, formatTime, BRINCAR_DAILY_STAR_CAP,
  GAME_MODES, getMode, DEFAULT_MODE, getTurboDuration,
  addTurboTime, segundosRestantes,
  CARD_RATIO,
  TURBO_ALERTA_MS, TURBO_TICK_MS, TURBO_AVISO_MS, PARES_SOUND_EVENTS,
} from '../services/paresGameService';
import { computeGridLayout } from '../services/paresGridLayout';
import { preloadCovers, coversReady, deckStoryIds } from '../services/paresImagePreload';
import { streakLevel, streakLabel, isFogo } from '../services/paresStreak';
import {
  FASES, FASES_QUE_ACEITAM, EFEITOS, criarJogo, tocar, flipConcluido, verificar,
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

/** Vermelho do alerta. Um só lugar: moldura, relógio e barra usam o mesmo tom. */
const ALERTA = '#C0392B';

/** Geometria do tabuleiro (R2B §3 · gap ÓPTICO). O gap de layout = óptico + sombra dos dois
 *  lados; a carta encolhe alguns pontos para caber sem rolagem. `SHADOW_BLEED` acompanha a
 *  sombra curta da carta (raio 2 + offset 1 ≈ 2 pt por lado). */
const GRADE_PADDING_H = 14;
const GRADE_PADDING_V = 6;
const CARD_SHADOW_BLEED = 2;
const opticalGapFor = (w) => (w >= 375 ? 9 : 6);   // gap VISÍVEL desejado
const minOpticalGapFor = (w) => (w >= 375 ? 8 : 6); // invariante: nunca abaixo disto

const IDS_COM_CAPA = stories.map((s) => s.id).filter((id) => !!getStoryCoverImage(id));

const novoDeck = (pares) => buildDeck(pickStoryIds(IDS_COM_CAPA, pares));

/** Vibração muito leve. expo-haptics já é dependência; falhar aqui é irrelevante. */
function vibrar(tipo) {
  try {
    if (tipo === 'acerto') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else Haptics.selectionAsync();
  } catch { /* sem vibração — segue o jogo */ }
}

/** R2B §8 — haptic de CONQUISTA (Fogo da Memória). Nunca punitivo; falhar é irrelevante. */
function vibrarConquista() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* segue o jogo */ }
}

/** 'YYYY-MM-DD' → 'dd/mm'. Entrada estranha → ''. */
function dataCurta(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  return m ? `${m[3]}/${m[2]}` : '';
}

/* ══════════════════════════════ CARTA ══════════════════════════════ */
// A carta virou componente próprio (R2A): `ParesFlipCard` (flip + frente marfim premium) e
// `ParesCardBack` (verso premium SVG). O flip permanece em RN Animated, na UI thread.

/* ══════════════════════════════ TELA ══════════════════════════════ */

export default function ParesDoBeniScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
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

  // R2A §2 — a rodada só aceita toque quando as capas estão decodificadas. Enquanto não,
  // "Beni está preparando as cartas...". `cartasProntas` é true de imediato quando as capas
  // já estão quentes (preload de boot), evitando um flash desnecessário.
  const [cartasProntas, setCartasProntas] = useState(true);

  // R2A §2 — movimento reduzido: transição curta, sem rotação completa. Origem: sistema
  // (AccessibilityInfo) OU override do diagnóstico do criador.
  const [reduceMotionOS, setReduceMotionOS] = useState(false);

  // R2A §10 — overrides do diagnóstico (só sob Modo Criador). Nunca afetam produção.
  const [diag, setDiag] = useState({ reduceMotion: false, missingImage: false });
  const reduceMotion = reduceMotionOS || diag.reduceMotion;

  // R2B §8 — Fogo da Memória. A CONTAGEM vive na máquina (`combo`/`maiorCombo`); aqui só se
  // dispara a centelha por EVENTO único (para um evento antigo não apagar o novo) e as brasas.
  const [streakEvent, setStreakEvent] = useState(null);   // { id, x, y, toX, level }
  const [fogoEventId, setFogoEventId] = useState(0);
  const streakEventIdRef = useRef(0);
  const prevComboRef = useRef(0);

  // R2C §4 — contemplação final: null | 'celebrando' | 'contemplando'. Entre o último par e a
  // tela de resultado há 2,5 s com o tabuleiro inteiro visível. `conclusaoRef` impede reentrada.
  const [conclusao, setConclusao] = useState(null);
  const conclusaoRef = useRef(false);
  const resultadoAnim = useRef(new Animated.Value(1)).current;   // fade/entrada da tela de resultado

  // R2C §5/§6 — override de sequência SÓ do Modo Criador (nunca afeta produção): força o medidor
  // a mostrar 2×/3×/4× para validar o Fogo da Memória sem precisar de uma sequência real.
  const [diagStreakOverride, setDiagStreakOverride] = useState(0);

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
  const tempoAcabouRef = useRef(false);    // alarme e aviso: uma vez só
  const salvoRef = useRef(false);          // partida salva: uma vez só
  const transicaoResultadoRef = useRef(null);  // aviso → resultado: agendado uma vez só
  const timeouts = useRef([]);
  const montado = useRef(true);

  const pulso = useRef(new Animated.Value(0)).current;   // moldura/relógio nos últimos 10 s
  const tique = useRef(new Animated.Value(1)).current;   // número cresce a cada segundo
  const aviso3s = useRef(new Animated.Value(0)).current; // entrada do "Tempo encerrado!"

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
    // A transição do aviso vive num desses timeouts: matá-la aqui evita que uma
    // partida antiga abra o resultado por cima de uma partida nova.
    transicaoResultadoRef.current = null;
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

    // R2A §2 — respeita "reduzir movimento" do sistema; ouve mudanças em tempo real.
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => vivo && setReduceMotionOS(!!v)).catch(() => {});
    const rm = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setReduceMotionOS(!!v));

    return () => {
      vivo = false;
      montado.current = false;
      limparTimers();
      pulso.stopAnimation(); tique.stopAnimation();
      stopGameSfx(PARES_SOUND_EVENTS.COUNTDOWN_TICK);
      releaseGameSfx();   // nenhum som sobrevive à saída da tela
      rm?.remove?.();
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
    // R2A §2 — o relógio só corre depois que as cartas estão prontas: não vale gastar
    // o tempo do Turbo enquanto o Beni ainda "prepara as cartas".
    if (!jogando || pausado || !cartasProntas) return undefined;
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
  }, [jogando, pausado, cartasProntas, modo.timed]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Pulso vermelho dos últimos 10 s (borda + relógio) ── */
  const emAlerta = jogando && modo.timed && !pausado && restanteMs > 0 && restanteMs <= TURBO_ALERTA_MS;
  useEffect(() => {
    if (!emAlerta) { pulso.stopAnimation(); pulso.setValue(0); return undefined; }
    // Ciclo de 820 ms (410 ida + 410 volta): respira, não pisca.
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(pulso, { toValue: 1, duration: 410, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulso, { toValue: 0, duration: 410, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
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

  /**
   * Clássico: grade limpa = fim. R2C §4 — CONTEMPLAÇÃO de 2,5 s antes do resultado:
   *   finalMatchCelebration (~700 ms, tabuleiro visível, celebração do último par, som 1×) →
   *   boardContemplation (cartas abertas, brilho discreto, sem stats/botões) →
   *   results (após 2.500 ms desde o último par, com fade suave). Roda UMA vez (`conclusaoRef`);
   *   todos os timers passam por `agendar()` (limpos no unmount/reinício), nunca abrindo uma
   *   rodada antiga. O som de conclusão toca aqui, uma única vez (não se repete no resultado).
   */
  const encerrarClassico = useCallback(() => {
    if (conclusaoRef.current) return;
    conclusaoRef.current = true;
    limparTimers();
    playGameSfx(PARES_SOUND_EVENTS.CLASSIC_JINGLE);   // som de conclusão — UMA vez
    salvarPartida();                                  // prepara o resultado (não abre ainda)
    setConclusao('celebrando');                       // tabuleiro segue visível
    agendar(() => setConclusao('contemplando'), 700); // §4 — finalMatchCelebration ~700 ms
    agendar(() => { setConclusao(null); setTela('resultado'); }, 2500);   // §4 — results após 2,5 s
  }, [limparTimers, salvarPartida, agendar]);

  /**
   * Turbo: zero no relógio. Roda UMA vez (`tempoAcabouRef`) e faz, em ordem:
   * trava a máquina · cancela timers pendentes · cala o tique · para o pulso ·
   * alarme · salva a partida · mostra o aviso · agenda a abertura do resultado.
   *
   * O resultado abre sozinho depois de TURBO_AVISO_MS. `transicaoResultadoRef` impede
   * agendamento duplicado; `agendar()` garante que o timeout morre no unmount.
   */
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
    salvarPartida();              // salvo AQUI, uma vez só (salvoRef)
    setTela('tempoEsgotado');

    // Entrada discreta do aviso, e transição automática.
    aviso3s.setValue(0);
    Animated.timing(aviso3s, { toValue: 1, duration: 260, useNativeDriver: true }).start();

    if (transicaoResultadoRef.current == null) {
      transicaoResultadoRef.current = agendar(() => {
        transicaoResultadoRef.current = null;
        playGameSfx(PARES_SOUND_EVENTS.TURBO_JINGLE);   // uma vez, na transição
        setTela('resultado');
      }, TURBO_AVISO_MS);
    }
  }, [aplicar, limparTimers, salvarPartida, agendar]);   // eslint-disable-line react-hooks/exhaustive-deps

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
    const deck = novoDeck(dif.pairs);
    jogoRef.current = criarJogo({
      deck, pares: dif.pairs,
      cronometrado: modo.timed, recordeAtual,
    });
    setVista(jogoRef.current);

    decorridoRef.current = 0; setDecorridoMs(0);
    restanteRef.current = duracaoMs; setRestanteMs(duracaoMs);
    ultimoSegundoRef.current = null;
    tempoAcabouRef.current = false;
    salvoRef.current = false;
    prevComboRef.current = 0;               // R2B §8 — sequência começa do zero
    setStreakEvent(null); setFogoEventId(0);
    conclusaoRef.current = false; setConclusao(null);   // R2C §4 — cancela conclusão antiga
    setResultado(null); setAviso(null);
    setDica(BENI.entrada);
    setPausado(AppState.currentState !== 'active');

    // R2A §2 — só libera as cartas quando as capas estão decodificadas. Quentes (preload
    // de boot) → começa pronto, sem "preparando". Frias → mostra o preparo e aquece.
    const ids = deckStoryIds(deck);
    const jaProntas = coversReady(ids);
    setCartasProntas(jaProntas);
    setTela('jogando');
    if (!jaProntas) {
      preloadCovers(ids).then(() => { if (montado.current) setCartasProntas(true); });
    }
    setRounds(await getDailyRounds());
  }, [dif.pairs, duracaoMs, modo.timed, difId, stats, limparTimers]);

  /** Sair da partida (botão Voltar durante o jogo): encerra e limpa tudo. */
  const abandonar = useCallback(() => {
    limparTimers();
    stopGameSfx(PARES_SOUND_EVENTS.COUNTDOWN_TICK);
    pulso.stopAnimation();
    aplicar(encerrar);
    conclusaoRef.current = false; setConclusao(null);   // R2C §4 — cancela conclusão em andamento
    setTela('entrada');
  }, [aplicar, limparTimers]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Toque na carta: a máquina decide, de forma síncrona ── */
  const tocarCarta = useCallback((i) => {
    if (pausado || !cartasProntas || conclusao) return;   // §2/§4 — nada durante preparo/conclusão
    aplicar(tocar, i);   // recusado → nenhum efeito: sem som, sem vibração, sem jogada
  }, [aplicar, pausado, cartasProntas, conclusao]);

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

  /* ── R2B §8 — Fogo da Memória: a cada NOVO par (combo sobe), uma centelha nasce no par.
     No 4º par seguido, brasas + haptic de conquista. O erro zera o combo na máquina: a
     chama apaga sozinha (sem texto negativo, sem punição, sem vibração). ── */
  useEffect(() => {
    const combo = vista.combo;
    if (combo > prevComboRef.current && combo > 0) {
      const L = layoutRef.current;
      let x = 0; let y = 0; let toX = 0;
      if (L) {
        const centros = vista.casadas.slice(-2)
          .map((k) => vista.deck.findIndex((d) => d.key === k))
          .filter((i) => i >= 0)
          .map((i) => {
            const p = L.positions[i] || { x: L.offsetX, y: L.offsetY };
            return { x: p.x - L.offsetX + L.cardWidth / 2, y: p.y - L.offsetY + L.cardHeight / 2 };
          });
        if (centros.length) {
          x = centros.reduce((a, c) => a + c.x, 0) / centros.length;
          y = centros.reduce((a, c) => a + c.y, 0) / centros.length;
          toX = L.gridWidth / 2;
        }
      }
      const id = (streakEventIdRef.current += 1);
      setStreakEvent({ id, x, y, toX, level: streakLevel(combo) });
      if (isFogo(combo)) { setFogoEventId(id); vibrarConquista(); }
    }
    prevComboRef.current = combo;
  }, [vista.combo]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── R2C §4 — entrada suave da tela de resultado: fade 210 ms + subida ≤8 pt. Sem corte
     brusco, sem repetir o som de conclusão (o som tocou na celebração). ── */
  useEffect(() => {
    if (tela !== 'resultado') return undefined;
    resultadoAnim.setValue(0);
    const anim = Animated.timing(resultadoAnim, { toValue: 1, duration: 210, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [tela]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Derivados ── */
  const semRodadas = !premium && rounds != null && rounds.remaining <= 0;

  /**
   * Tabuleiro responsivo. A altura útil não dá para adivinhar (cabeçalho, HUD, barra
   * e dica mudam de altura entre modos e aparelhos): medimos a área real que sobrou.
   * Antes da primeira medida, `alturaTabuleiro` é 0 e o cálculo cai na restrição
   * horizontal — exatamente o comportamento antigo, sem salto visual.
   */
  const [alturaTabuleiro, setAlturaTabuleiro] = useState(0);
  const medirTabuleiro = useCallback((e) => {
    const h = e?.nativeEvent?.layout?.height ?? 0;
    setAlturaTabuleiro((atual) => (Math.abs(atual - h) > 1 ? h : atual));
  }, []);

  // R2A §4 + R2B §3 — geometria numa fonte única, agora com GAP ÓPTICO: o layout separa o
  // espaço visível desejado da sombra que o invade, para as cartas não parecerem coladas.
  // R2C §3 — a safe area inferior sai da altura JOGÁVEL (footerHeight): a grade dimensiona e
  // centraliza dentro da área real entre a barra e a safe area de baixo, não na tela toda.
  const larguraGrade = Math.min(width, 520);
  const layout = useMemo(() => computeGridLayout({
    screenWidth: larguraGrade,
    screenHeight: alturaTabuleiro,
    cardCount: dif.pairs * 2,
    columns: dif.cols,
    desiredOpticalGapX: opticalGapFor(larguraGrade),
    desiredOpticalGapY: opticalGapFor(larguraGrade),
    shadowBleed: CARD_SHADOW_BLEED,
    minimumOpticalGap: minOpticalGapFor(larguraGrade),
    cardAspectRatio: CARD_RATIO,
    outerPaddingX: GRADE_PADDING_H,
    outerPaddingY: GRADE_PADDING_V,
    footerHeight: insets.bottom,   // exclui a barra/indicador de baixo do espaço jogável
    round: PixelRatio.roundToNearestPixel,
  }), [larguraGrade, alturaTabuleiro, dif.cols, dif.pairs, insets.bottom]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const trocarModo = useCallback((id) => { setModoId(id); saveLastMode(id); }, []);

  /* ── R2A §10 — Ações do diagnóstico do criador (só sob Modo Criador) ── */
  const diagAction = useCallback((id) => {
    const g = jogoRef.current;
    const pares = {};
    g.deck.forEach((c, i) => { (pares[c.storyId] = pares[c.storyId] || []).push(i); });
    const parCompleto = Object.values(pares).find((idx) => idx.length >= 2);
    const doisDiferentes = (() => {
      const keys = Object.keys(pares);
      if (keys.length < 2) return null;
      return [pares[keys[0]][0], pares[keys[1]][0]];
    })();

    switch (id) {
      case 'movimento_reduzido':
        setDiag((d) => ({ ...d, reduceMotion: !d.reduceMotion }));
        break;
      case 'imagem_ausente':
        setDiag((d) => ({ ...d, missingImage: !d.missingImage }));
        break;
      case 'imagem_lenta':
        // Simula capas frias: segura o tabuleiro e libera após o teto de preparo.
        setCartasProntas(false);
        agendar(() => setCartasProntas(true), 2500);
        break;
      case 'giro':
        if (parCompleto) tocarCarta(parCompleto[0]);   // vira UMA carta (giro real)
        break;
      case 'retorno':
        // Abre duas cartas DIFERENTES: a máquina fecha as duas juntas (retorno real).
        if (doisDiferentes) {
          tocarCarta(doisDiferentes[0]);
          agendar(() => tocarCarta(doisDiferentes[1]), 340);
        }
        break;
      case 'acerto':
        // Abre as duas cartas do MESMO par: acerto real (efeitos de ouro/estrela).
        if (parCompleto) {
          tocarCarta(parCompleto[0]);
          agendar(() => tocarCarta(parCompleto[1]), 340);
        }
        break;
      case 'reiniciar':
        limparTimers();
        jogoRef.current = criarJogo({
          deck: novoDeck(dif.pairs), pares: dif.pairs,
          cronometrado: modo.timed, recordeAtual: stats?.turbo?.[difId]?.bestScore ?? 0,
        });
        setVista(jogoRef.current);
        decorridoRef.current = 0; setDecorridoMs(0);
        restanteRef.current = duracaoMs; setRestanteMs(duracaoMs);
        ultimoSegundoRef.current = null; tempoAcabouRef.current = false; salvoRef.current = false;
        conclusaoRef.current = false; setConclusao(null); setDiagStreakOverride(0);
        setCartasProntas(true);
        break;
      // R2C §5/§6 — validar a sequência/Fogo sem uma partida real: força o medidor + a centelha.
      case 'simular_2x': case 'simular_3x': case 'simular_4x': {
        const n = id === 'simular_4x' ? 4 : id === 'simular_3x' ? 3 : 2;
        setDiagStreakOverride(n);
        const L = layoutRef.current;
        const cx = L ? L.gridWidth / 2 : 0;
        const cy = L ? L.gridHeight / 2 : 0;
        const eid = (streakEventIdRef.current += 1);
        setStreakEvent({ id: eid, x: cx, y: cy, toX: cx, level: streakLevel(n) });
        if (isFogo(n)) { setFogoEventId(eid); vibrarConquista(); }
        agendar(() => setDiagStreakOverride(0), 2600);
        break;
      }
      // R2C §5 — simular a conclusão para ver a contemplação (sem encerrar a partida real).
      case 'simular_ultimo_par':
        setConclusao('celebrando');
        agendar(() => setConclusao('contemplando'), 700);
        agendar(() => setConclusao(null), 2500);
        break;
      case 'simular_contemplacao':
        setConclusao('contemplando');
        agendar(() => setConclusao(null), 2500);
        break;
      default:
        break;
    }
  }, [agendar, tocarCarta, limparTimers, dif.pairs, modo.timed, difId, duracaoMs, stats]);

  // Publica os handlers frescos deste render. Feito no corpo (não em efeito) para
  // que um toque no mesmo frame já enxergue a versão nova.
  fn.current = { aplicar, agendar, mostrarAviso, encerrarClassico, tempoEsgotou, pares: dif.pairs };

  /* ══════════════ ENTRADA ══════════════ */
  if (tela === 'entrada') {
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => navigation.goBack()} />
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
    // Transição curta e centralizada. Sem cabeçalho, sem chip, sem botão: a criança
    // não precisa fazer nada — o resultado abre sozinho (ver `tempoEsgotou`).
    return (
      <View style={[styles.root, styles.avisoRoot]}>
        <Animated.View
          style={[
            styles.tempoCard,
            {
              opacity: aviso3s,
              transform: [{ scale: aviso3s.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.tempoIconBg}>
            <FaithIcon name="timer" size={32} color={pt.beniDeep} />
          </View>
          <Text style={styles.tempoTitulo}>Tempo encerrado!</Text>
          <Text style={styles.tempoSub}>{BENI.tempoFim}</Text>
        </Animated.View>
      </View>
    );
  }

  /* ══════════════ RESULTADO ══════════════ */
  if (tela === 'resultado') {
    const turbo = resultado?.modo === 'turbo';
    // R2C §4 — entrada suave (fade + subida ≤8 pt). Clássico e Turbo usam a MESMA conclusão.
    return (
      <Animated.View
        style={[
          styles.root,
          { opacity: resultadoAnim, transform: [{ translateY: resultadoAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
        ]}
      >
        <Header
          insets={insets}
          onBack={() => setTela('entrada')}
          chip={turbo ? 'Turbo' : 'Clássico'}
          corChip={turbo ? pt.beniDeep : pt.faithBlue}
          compacto
        />
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
          {/* 1 — Beni */}
          <View style={styles.painel}>
            <BeniGuideBubble
              message={turbo ? elogioTurbo(resultado?.pares ?? 0, resultado?.isBest) : BENI.vitoria}
              avatarVariant="celebrating"
              tone="purple"
              compact
            />
          </View>

          {/* 2 — Resultado principal, e 3 — três métricas curtas */}
          <View style={styles.vitoriaCard}>
            <View style={styles.scoreRow}>
              {[1, 2, 3].map((n) => (
                <FaithIcon key={n} name="star" size={26} color={n <= (resultado?.score ?? 1) ? pt.gold : '#E3DDD4'} />
              ))}
            </View>
            <Text style={styles.destaque}>{turbo ? `${resultado?.pontos ?? 0}` : `${resultado?.pares ?? 0}`}</Text>
            <Text style={styles.destaqueLabel}>
              {turbo ? 'pontos' : (resultado?.pares === 1 ? 'par encontrado' : 'pares encontrados')}
            </Text>

            <View style={styles.statsRow}>
              {turbo ? (
                <>
                  <Stat label="Pares" valor={String(resultado?.pares ?? 0)} />
                  <Stat label="Combo" valor={`${resultado?.maiorCombo ?? 0}×`} />
                  <Stat label="No ranking" valor={resultado?.posicao > 0 ? `${resultado.posicao}º` : '—'} />
                </>
              ) : (
                <>
                  <Stat label="Jogadas" valor={String(resultado?.jogadas ?? 0)} />
                  <Stat label="Tempo" valor={formatTime(resultado?.elapsedMs)} />
                  <Stat label="Combo" valor={`${resultado?.maiorCombo ?? 0}×`} />
                </>
              )}
            </View>
          </View>

          {/* 4 — Melhor recorde e estrelinha, em uma faixa leve */}
          <View style={styles.faixas}>
            {resultado?.isBest ? (
              <View style={styles.faixaBoa}>
                <FaithIcon name="trophies" size={16} color="#0E5A3C" />
                <Text style={styles.faixaBoaText}>Novo recorde no {dif.label}!</Text>
              </View>
            ) : (
              <View style={styles.faixaSuave}>
                <FaithIcon name="trophies" size={15} color={pt.textSoft} />
                <Text style={styles.faixaSuaveText}>
                  {resultado?.anterior
                    ? (turbo ? `Seu recorde: ${resultado.anterior} pontos` : `Seu melhor: ${resultado.anterior} jogadas`)
                    : 'Seu primeiro resultado aqui!'}
                </Text>
              </View>
            )}
            <View style={resultado?.starAwarded ? styles.faixaEstrela : styles.faixaSuave}>
              <FaithIcon name="star" size={15} color={resultado?.starAwarded ? pt.goldDeep : pt.textSoft} />
              <Text style={resultado?.starAwarded ? styles.faixaEstrelaText : styles.faixaSuaveText}>
                {resultado?.starAwarded
                  ? '+1 estrelinha!'
                  : `Estrelinhas de hoje: ${BRINCAR_DAILY_STAR_CAP}/${BRINCAR_DAILY_STAR_CAP}`}
              </Text>
            </View>
          </View>

          {/* 5 — Ranking */}
          {turbo && (
            <RankingTabela
              lista={resultado?.ranking ?? []}
              posicaoAtual={resultado?.posicao ?? 0}
              nivel={dif.label}
            />
          )}

          {/* 6 — Ações. "Trocar nível" e "Trocar modo" levavam à MESMA tela: viraram um
              botão só. Menos escolha aparente, mesmo destino, leitura imediata. */}
          <SoundButton style={styles.btnPrimario} onPress={comecar} activeOpacity={0.9} soundType="success">
            <FaithIcon name="restart" size={18} color="#FFF" />
            <Text style={styles.btnPrimarioText}>Jogar novamente</Text>
          </SoundButton>
          <SoundButton style={styles.btnSecundario} onPress={() => setTela('entrada')} activeOpacity={0.9}>
            <FaithIcon name="swap" size={16} color={pt.text} />
            <Text style={styles.btnSecundarioText}>Trocar modo ou nível</Text>
          </SoundButton>
          <SoundButton
            style={styles.btnTerciario}
            onPress={() => navigation.navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })}
            activeOpacity={0.9}
          >
            <Text style={styles.btnTerciarioText}>Voltar para Brincar</Text>
          </SoundButton>
        </ScrollView>
      </Animated.View>
    );
  }

  /* ══════════════ JOGANDO ══════════════ */
  const feitosNaGrade = vista.casadas.length / 2;
  const progresso = modo.timed ? restanteMs / duracaoMs : feitosNaGrade / Math.max(1, dif.pairs);
  const critico = modo.timed && restanteMs <= TURBO_ALERTA_MS && restanteMs > 0;
  const segundos = segundosRestantes(restanteMs);
  const contando = modo.timed && segundos > 0 && segundos <= TURBO_TICK_MS / 1000;
  const errando = vista.fase === FASES.ERROR ? vista.abertas : [];

  // A frase do Beni some depois da primeira jogada: ela ensina, não acompanha.
  const frase = pausado
    ? 'Jogo pausado. Volte quando quiser!'
    : (aviso || (vista.jogadas === 0 ? dica : ''));

  // R2A §10 — retrato para o diagnóstico do criador (só computado sob Modo Criador).
  const diagInfo = buildDiagInfo(vista, layout, cartasProntas);

  // R2B §8/§9 — sequência (Fogo da Memória). Conta PARES (combo da máquina), Clássico=Turbo.
  // R2C §5 — sob Modo Criador, `diagStreakOverride` força o nível para validação.
  const streakBase = diagStreakOverride || vista.combo;
  const streakNivel = streakLevel(streakBase);
  const streakTexto = streakLabel(streakBase);
  const streakFogo = isFogo(streakBase);

  // R2C §3 — equilíbrio vertical: centraliza na área jogável (sem a safe area de baixo) e sobe
  // ~24–36 pt quando há folga; nunca passa do topo (sem cortar a 1ª linha). Em 320×568 (folga
  // pequena) o valor cai a ~0 e nada é cortado.
  const folgaTopo = Math.max(0, (alturaTabuleiro - layout.gridHeight) / 2);
  // FLOOR: a subida nunca passa da folga do topo → JAMAIS corta a primeira linha.
  const subirGrade = Math.floor(Math.min(insets.bottom / 2 + 28, folgaTopo));

  return (
    <View style={styles.root}>
      <Header
        insets={insets}
        onBack={abandonar}
        chip={modo.timed ? 'Turbo' : 'Clássico'}
        corChip={modo.timed ? pt.beniDeep : pt.faithBlue}
        compacto
      />

      {/* HUD compacto (R2B §9): tempo · pares · MEDIDOR de sequência (fogo maior). */}
      <View style={styles.hud}>
        {modo.timed ? (
          <Animated.View style={[styles.hudItem, contando && { transform: [{ scale: tique }] }]}>
            <FaithIcon name="timer" size={15} color={critico ? ALERTA : pt.textSoft} />
            <Text style={[styles.hudText, critico && styles.hudCritico]}>{formatTime(restanteMs)}</Text>
          </Animated.View>
        ) : (
          <HudItem icone="timer" texto={formatTime(decorridoMs)} />
        )}
        <HudItem icone="pares" texto={modo.timed ? `${vista.paresTotais}` : `${feitosNaGrade}/${dif.pairs}`} />
        <ParesStreakMeter
          streak={streakBase}
          level={streakNivel}
          label={streakTexto}
          fogo={streakFogo}
          eventId={streakEvent?.id || 0}
          reduceMotion={reduceMotion}
        />
      </View>

      <View style={styles.barraFundo}>
        <View
          style={[
            styles.barraFrente,
            {
              width: `${Math.max(0, Math.min(1, progresso)) * 100}%`,
              backgroundColor: modo.timed ? (critico ? ALERTA : pt.beni) : pt.green,
            },
          ]}
        />
      </View>

      {/* Linha única e baixa. Vazia, some sem deixar buraco (altura fixa pequena). */}
      <Text style={styles.dica} numberOfLines={1}>{frase}</Text>

      {/* O tabuleiro MEDE a altura que sobrou; a geometria (posições) sai de computeGridLayout.
          Enquanto as capas não decodificam, "Beni está preparando as cartas..." (§2). */}
      <View style={styles.areaJogo} onLayout={medirTabuleiro}>
        {!cartasProntas ? (
          <View style={styles.preparando} accessibilityLiveRegion="polite">
            <FaithIcon name="pares" size={34} color={pt.purple} />
            <Text style={styles.preparandoText}>Beni está preparando as cartas...</Text>
          </View>
        ) : (
          <View style={{ width: layout.gridWidth, height: layout.gridHeight, transform: [{ translateY: -subirGrade }] }}>
            {/* R2C §4 — brilho MUITO discreto no conjunto durante a contemplação final. */}
            {conclusao === 'contemplando' && (
              <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.contemplacaoGlow]} />
            )}
            {vista.deck.map((c, i) => {
              const pos = layout.positions[i] || { x: layout.offsetX, y: layout.offsetY };
              return (
                <View
                  key={`${vista.gradesCompletas}-${c.key}`}
                  style={{
                    position: 'absolute',
                    left: pos.x - layout.offsetX,
                    top: pos.y - layout.offsetY,
                    width: layout.cardWidth,
                    height: layout.cardHeight,
                  }}
                >
                  <ParesFlipCard
                    carta={c}
                    indice={i}
                    aberta={vista.abertas.includes(i)}
                    casada={vista.casadas.includes(c.key)}
                    errando={errando.includes(i)}
                    width={layout.cardWidth}
                    height={layout.cardHeight}
                    radius={radii.md}
                    reduceMotion={reduceMotion}
                    forceNoCover={diag.missingImage}
                    onPress={() => tocarCarta(i)}
                    onFlipEnd={cartaAbriu}
                  />
                </View>
              );
            })}

            {/* R2B §8 — centelha do par → medidor. `key` do evento reinicia limpo (evento
                antigo não apaga o novo). Vive no bloco da grade: nasce no centro do par. */}
            {streakEvent && !reduceMotion && (
              <ParesSpark
                key={streakEvent.id}
                x={streakEvent.x}
                y={streakEvent.y}
                toX={streakEvent.toX}
                level={streakEvent.level}
                reduceMotion={reduceMotion}
              />
            )}
          </View>
        )}
      </View>

      {/* Moldura de alerta: encosta nos limites da JANELA, por cima de tudo, sem tocar em nada. */}
      {critico && <MolduraAlerta pulso={pulso} largura={width} />}

      {/* R2B §8 — brasas do Fogo da Memória pelas margens (não cobrem cartas). Máx. 700 ms. */}
      {fogoEventId > 0 && !reduceMotion && (
        <ParesFogoEmbers key={fogoEventId} width={width} height={height} reduceMotion={reduceMotion} />
      )}

      {/* Diagnóstico do criador — renderiza null em produção. */}
      <ParesCreatorDiagnostics info={diagInfo} overrides={diag} onAction={diagAction} />
    </View>
  );
}

/** Retrato do jogo para o painel do criador (§10). Puro, derivado do estado da máquina. */
function buildDiagInfo(vista, layout, cartasProntas) {
  const foco = vista.abertas.length ? vista.abertas[vista.abertas.length - 1] : 0;
  const cartaFoco = vista.deck[foco];
  const casada = cartaFoco ? vista.casadas.includes(cartaFoco.key) : false;
  const aberta = vista.abertas.includes(foco);
  const girando = vista.fase === FASES.FIRST_FLIP || vista.fase === FASES.SECOND_FLIP;
  const flipState = casada ? 'casada' : aberta ? (girando ? 'abrindo' : 'aberta') : 'fechada';

  let dims = '—';
  const cover = cartaFoco && getStoryCoverImage(cartaFoco.storyId);
  if (cover) {
    const s = Image.resolveAssetSource(cover);
    dims = s?.width ? `${s.width}×${s.height}` : 'sem dims';
  } else if (cartaFoco) {
    dims = 'sem capa';
  }

  return {
    fase: vista.fase,
    inputLocked: !FASES_QUE_ACEITAM.includes(vista.fase) || vista.abertas.length >= 2,
    openCardIds: vista.abertas,
    matchedCardIds: vista.casadas,
    imageReady: cartasProntas,
    carta: {
      cardId: cartaFoco?.key ?? '—',
      flipState,
      imageDimensions: dims,
      rotationProgress: (aberta || casada) ? '→ 1.0' : '0.0',
    },
    grade: {
      gridWidth: layout.gridWidth, gridHeight: layout.gridHeight,
      cardWidth: layout.cardWidth, cardHeight: layout.cardHeight,
      layoutGapX: layout.layoutGapX, layoutGapY: layout.layoutGapY,
      opticalGapX: layout.opticalGapX, opticalGapY: layout.opticalGapY,
      shadowBleed: layout.shadowBleed,
      columns: layout.columns, rows: layout.rows,
    },
    streak: {
      current: vista.combo, best: vista.maiorCombo,
      level: streakLevel(vista.combo), fogo: isFogo(vista.combo),
    },
  };
}

/**
 * Moldura de urgência dos últimos 10 s (Bloco 1.4d).
 *
 * Quatro faixas absolutas em `top/bottom/left/right: 0` — nos limites da JANELA, não da
 * safe area. É decoração: pode passar por baixo do notch e da barra inferior. Sem raio
 * (raio faria parecer um card), sem deslocar layout, sem roubar toque.
 *
 * Fica na raiz da tela, DEPOIS do tabuleiro. Não pode viver dentro de `areaJogo`, que
 * recorta, nem dentro da grade.
 */
function MolduraAlerta({ pulso, largura }) {
  // Celular ~7px; tablet cresce um pouco, com teto — nunca uma tarja grossa.
  const esp = Math.round(Math.min(10, Math.max(6, largura * 0.018)));
  const opacidade = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  const faixa = (posicao) => (
    <Animated.View
      key={posicao}
      pointerEvents="none"
      style={[
        styles.faixaAlerta,
        posicao === 'topo' && { top: 0, left: 0, right: 0, height: esp },
        posicao === 'base' && { bottom: 0, left: 0, right: 0, height: esp },
        posicao === 'esq' && { top: 0, bottom: 0, left: 0, width: esp },
        posicao === 'dir' && { top: 0, bottom: 0, right: 0, width: esp },
        { opacity: opacidade },
      ]}
    />
  );

  return (
    <View pointerEvents="none" style={styles.moldura}>
      {['topo', 'base', 'esq', 'dir'].map(faixa)}
    </View>
  );
}

/* ══════════════════════════════ PEÇAS ══════════════════════════════ */

/**
 * Cabeçalho compacto (Bloco 1.4c). O título do JOGO é sempre "Pares do Beni"; o modo
 * vira um chip pequeno ao lado. Voltar e título dividem a mesma faixa, em vez de
 * empilharem dois blocos altos — isso devolve ~40 px de altura ao tabuleiro.
 */
function Header({ insets, onBack, chip, corChip, compacto }) {
  return (
    <LinearGradient
      colors={['#F0E8FF', '#E0D4FF', '#D0EAFF']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[
        styles.header,
        compacto && styles.headerCompacto,
        { paddingTop: Math.max(insets.top, 12) },   // safe area preservada
      ]}
    >
      <View style={styles.headerRow}>
        <SoundButton
          style={styles.backPill}
          onPress={onBack}
          activeOpacity={0.85}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <FaithIcon name="back" size={16} color="#6E3FB5" />
        </SoundButton>
        <Text style={[styles.headerTitle, compacto && styles.headerTitleCompacto]} numberOfLines={1}>
          Pares do Beni
        </Text>
        {chip ? (
          <View style={[styles.chip, { backgroundColor: corChip + '1F', borderColor: corChip + '55' }]}>
            <Text style={[styles.chipText, { color: corChip }]}>{chip}</Text>
          </View>
        ) : <View style={styles.chipVazio} />}
      </View>
    </LinearGradient>
  );
}

function HudItem({ icone, texto, cor }) {
  return (
    <View style={styles.hudItem}>
      <FaithIcon name={icone} size={15} color={cor || pt.textSoft} />
      <Text style={[styles.hudText, cor && { color: cor }]}>{texto}</Text>
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

/**
 * Histórico pessoal do Turbo: as cinco melhores daquele nível. Local, sem servidor.
 * Uma linha = posição · pontuação · pares · data. O combo fica pequeno, ao lado.
 */
function RankingTabela({ lista, posicaoAtual, nivel }) {
  if (!lista.length) return null;
  const CORES = ['#E0A21A', '#9AA5B1', '#B06A3B'];   // ouro · prata · bronze
  return (
    <View style={styles.ranking}>
      <Text style={styles.rankingTitulo}>Suas melhores no {nivel}</Text>
      {lista.map((e, i) => {
        const atual = posicaoAtual === i + 1;
        const cor = CORES[i] ?? '#CFC7BC';
        return (
          <View key={`${e.data}-${e.pontos}-${i}`} style={[styles.rankLinha, atual && styles.rankLinhaAtual]}>
            <View style={[styles.rankMedalha, { backgroundColor: cor + '22', borderColor: cor }]}>
              <Text style={[styles.rankPos, { color: i < 3 ? cor : pt.textSoft }]}>{i + 1}</Text>
            </View>
            <Text style={[styles.rankPontos, i === 0 && styles.rankPontosTopo]}>{e.pontos}</Text>
            <Text style={styles.rankPares}>{e.pares} pares</Text>
            <Text style={styles.rankCombo}>{e.maiorCombo}×</Text>
            <Text style={styles.rankData}>{atual ? 'agora' : (dataCurta(e.data) || '—')}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },

  // Cabeçalho compacto: uma faixa só (voltar · título · chip do modo).
  header: { paddingHorizontal: 14, paddingBottom: 12 },
  headerCompacto: { paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backPill: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.18)',
  },
  headerTitle: { flex: 1, fontFamily: 'FredokaOne', fontSize: 22, color: pt.text },
  headerTitleCompacto: { fontSize: 19 },
  chip: {
    borderRadius: radii.pill, borderWidth: 1,
    paddingHorizontal: 11, paddingVertical: 5,
  },
  chipText: { fontFamily: 'FredokaOne', fontSize: 12 },
  chipVazio: { width: 0 },

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
    flexDirection: 'row', gap: 8, justifyContent: 'center',
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

  // ── Tempo encerrado: transição curta, centralizada, sem interação ──
  avisoRoot: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  tempoCard: {
    alignSelf: 'stretch', backgroundColor: '#FFF', borderRadius: radii.xl,
    paddingVertical: 26, paddingHorizontal: 20, alignItems: 'center', ...shadows.card,
  },
  tempoIconBg: {
    width: 62, height: 62, borderRadius: 31, backgroundColor: pt.beniSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  tempoTitulo: { fontFamily: 'FredokaOne', fontSize: 23, color: pt.text, textAlign: 'center' },
  tempoSub: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', marginTop: 8, lineHeight: 19 },

  // ── HUD: três itens, baixo ──
  hud: {
    flexDirection: 'row', justifyContent: 'center', gap: 22,
    paddingVertical: 7, backgroundColor: '#FFF',
  },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 56, justifyContent: 'center' },
  hudText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: pt.text },
  hudCritico: { color: ALERTA },

  barraFundo: { height: 5, backgroundColor: '#EFEAE3', overflow: 'hidden' },
  barraFrente: { height: '100%', borderTopRightRadius: 3, borderBottomRightRadius: 3 },

  // Altura fixa e baixa: a frase pode sumir sem o tabuleiro pular.
  dica: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft,
    textAlign: 'center', marginHorizontal: 24,
    height: 22, lineHeight: 22,
  },

  areaJogo: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // §2 — enquanto as capas decodificam.
  preparando: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  preparandoText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.purpleDeep, textAlign: 'center' },

  // R2C §4 — brilho MUITO discreto sobre a grade durante a contemplação final.
  contemplacaoGlow: { borderRadius: radii.lg, backgroundColor: '#FFE9B8', opacity: 0.10 },

  // Moldura da JANELA: ancorada na raiz, por cima de tudo. Sem insets, sem raio:
  // é decoração e pode passar pela safe area.
  moldura: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  faixaAlerta: {
    position: 'absolute',
    backgroundColor: ALERTA,
    // Brilho suave voltado para dentro da tela (iOS) / elevação (Android).
    shadowColor: ALERTA,
    shadowOpacity: 0.85,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },

  // ── Resultado: um número grande, três métricas, faixas leves ──
  vitoriaCard: {
    marginTop: 12, marginHorizontal: 16, backgroundColor: '#FFF',
    borderRadius: radii.xl, paddingVertical: 16, paddingHorizontal: 14,
    alignItems: 'center', ...shadows.card,
  },
  scoreRow: { flexDirection: 'row', gap: 7, marginBottom: 6 },
  destaque: { fontFamily: 'FredokaOne', fontSize: 44, color: pt.text, lineHeight: 50 },
  destaqueLabel: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft, marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-around' },
  stat: { alignItems: 'center', flex: 1 },
  statValor: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text },
  statLabel: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, textAlign: 'center', marginTop: 1 },

  faixas: { marginHorizontal: 16, marginTop: 10, gap: 8 },
  faixaBoa: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#DDF3E7', borderRadius: radii.md,
    paddingHorizontal: 12, paddingVertical: 9,
  },
  faixaBoaText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#0E5A3C' },
  faixaEstrela: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: pt.goldSoft, borderRadius: radii.md,
    paddingHorizontal: 12, paddingVertical: 9,
  },
  faixaEstrelaText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#7A5800' },
  faixaSuave: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F3EFE9', borderRadius: radii.md,
    paddingHorizontal: 12, paddingVertical: 9,
  },
  faixaSuaveText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, fontWeight: '700' },

  // ── Ranking pessoal: uma linha = posição · pontos · pares · combo · data ──
  ranking: {
    marginTop: 14, marginHorizontal: 16, backgroundColor: '#FFF',
    borderRadius: radii.xl, padding: 12, ...shadows.card,
  },
  rankingTitulo: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 8, marginLeft: 2 },
  rankLinha: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 7, paddingHorizontal: 8, marginBottom: 4,
    borderRadius: radii.md, backgroundColor: '#FBF9F5',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  rankLinhaAtual: { borderColor: pt.purple, backgroundColor: '#F7F1FF' },
  rankMedalha: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  rankPos: { fontFamily: 'FredokaOne', fontSize: 12 },
  rankPontos: { flex: 1, fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  rankPontosTopo: { color: '#E0A21A' },
  rankPares: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.textSoft, width: 56, textAlign: 'right' },
  rankCombo: { fontFamily: 'Nunito', fontSize: 11, color: pt.muted, width: 26, textAlign: 'right' },
  rankData: { fontFamily: 'Nunito', fontSize: 11, color: pt.muted, width: 42, textAlign: 'right' },
});
