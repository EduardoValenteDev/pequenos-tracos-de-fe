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
  View, Text, Animated, Pressable, AppState, StyleSheet, ScrollView,
} from 'react-native';
import { useContentViewport } from '../context/ContentViewportContext';
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
import { isCreatorQaModeAllowed, isCreatorQaModeEnabled } from '../services/creatorQaMode';
import { isPremiumUser } from '../services/accessControl';
import { addBonusStars } from '../services/postStoryStorage';
import { useProgressContext } from '../context/ProgressContext';
import { getDailyRounds, consumeRound, toDayKey } from '../services/brincarDailyService';
import {
  readStats, recordOvelhaResult, recordOvelhaFaseTime, marcarApresentacaoOvelha,
  ovelhaApresentouHoje, aplicarApresentacaoOvelha, aplicarTempoFaseOvelha, recordInfinitoResult,
  recordCompletionDificil,
} from '../services/brincarStatsService';
import { playGameSfx, stopGameSfx, preloadGameSfx, releaseGameSfx } from '../services/audioManager';
import { warn } from '../utils/logger';
import { OVELHA_BENI } from '../data/ovelhaSceneData';
import { getScene, cenasHabilitadas } from '../data/ovelhaScenes';
import { OVELHA_BG, OVELHA_POSE_IMG } from '../data/ovelhaAssets';
import {
  buildRoundFromSpot, roundValido, planPartida, planPartidaInfinito, computeViewport, contentRect, artToPx, pxToArt,
  spriteBoxArt, hitboxPxRect, celulaToque, erroElegivel, nivelDicaPorErros, formatarTempoMs,
  getInfiniteStageConfig, pontosFaseInfinito, bonusMarcoInfinito, nivelDicaInfinitoPorTempo, INFINITO,
  expirarFaseFinita,
  MISS_ID, OVELHA_SOUND_EVENTS, OVELHA_DIFFICULTIES, getDifficulty, criarRng, novaSeed, assinaturaDeck,
} from '../services/ovelhaGameService';
import { OVELHA_POSE_JOGO } from '../data/ovelhaAssets';
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

const T = { acerto: 720, erro: 460, coverOut: 190, derrota: 1050, prazoCarga: 7000 };

// OV3R2 — mensagem acolhedora de fase perdida por tempo (Médio). Sem "perdeu/errou/falhou".
const MSG_DERROTA = 'O tempo acabou! A ovelhinha estava aqui.';

// OV3R — alerta sonoro de "relógio acabando": MESMO SFX e padrão (tick 1×/segundo) já aprovados
// em Palavrinhas/Pares. Threshold oficial dominante = 10s (Pares Turbo e Palavrinhas médio),
// que também é o mesmo limiar do alerta VISUAL do cronômetro (restante <= 10000). Sem áudio novo.
const COUNTDOWN_TICK = 'countdown_tick';
const ALERTA_TEMPO_MS = 10000;

function vibrar() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* segue */ }
}

/** Nomes carinhosos das cenas (só p/ exibição no resultado; a fonte é sempre o sceneId). */
const NOME_CENA = Object.freeze({
  farm_lively_01: 'Fazendinha',
  bakery_01: 'Padaria',
  toy_workshop_01: 'Oficina de brinquedos',
  laundry_yard_01: 'Quintal do varal',
  underwater_01: 'Fundo do mar',
});
const nomeCena = (id) => NOME_CENA[id] || 'Paisagem';

/** Textos por modo (só exibição na entrada; a fonte é sempre OVELHA_DIFFICULTIES). */
const MODO_INFO = Object.freeze({
  facil: { desc: 'Sem pressa', info: '5 fases', tempo: 'Sem cronômetro' },
  medio: { desc: 'Atenção e velocidade', info: '7 fases', tempo: '45s por fase' },
  dificil: { desc: 'Um desafio completo', info: '10 ovelhinhas', tempo: '2min30s no total' },
  infinito: { desc: 'Encontre o máximo que conseguir', info: 'Sem número fixo de fases', tempo: '60s de busca ativa' },
});

/** Número com separador de milhar PT-BR ("2450" → "2.450"). */
const milhar = (n) => String(Math.max(0, Math.floor(Number(n) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** Melhor pontuação do Infinito (0 se nenhuma). */
const melhorPontosInfinito = (stats) => Number(stats?.ovelha?.infinito?.bestScore) || 0;

/** Melhor tempo de conclusão do Difícil em ms (0/null se nenhum). */
const melhorCompletionDificil = (stats) => Number(stats?.ovelha?.dificil?.bestCompletionMs) || 0;

/** Melhor tempo (menor ms) já registrado numa dificuldade, entre todas as cenas. null se nenhum. */
function melhorTempoDaDificuldade(stats, difId) {
  const mapa = stats?.ovelha?.[difId]?.bestTimeByScene;
  if (!mapa || typeof mapa !== 'object') return null;
  let menor = null;
  for (const v of Object.values(mapa)) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0 && (menor == null || n < menor)) menor = n;
  }
  return menor;
}

/* ══════════════════════════ TELA ══════════════════════════ */

export default function CadeAOvelhinhaScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  /* [F6.2R] A cena compõe pela REGIÃO que a tela recebeu, não pela janela que ela vê.
     Hoje esta é uma tela de `Stack` e as duas grandezas coincidem — o referencial cai
     na janela fora de um provedor, e isso é o contrato, não tolerância. O que muda é
     que a coincidência deixou de ser PREMISSA: se esta superfície um dia coexistir com
     a barra lateral, a cena nasce dentro do retângulo certo sem que ninguém precise
     lembrar, e sem que uma única coordenada de esconderijo seja tocada. O jogo não
     conhece — e continua não podendo conhecer — a largura da navegação. */
  const { width } = useContentViewport();
  const progressCtx = useProgressContext();
  const refreshProgress = progressCtx?.refreshProgress;
  const premium = isPremiumUser();

  const [tela, setTela] = useState('entrada');
  const [rounds, setRounds] = useState(null);
  const [stats, setStats] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [pausado, setPausado] = useState(false);

  const [dificuldade, setDificuldade] = useState('facil');   // modo escolhido (persiste em "jogar de novo")
  const [vista, setVista] = useState(() => criarJogo({ rounds: getDifficulty('facil').rounds }));
  const [lstate, ldispatch] = useReducer(loadingReducer, undefined, initialLoading);
  const [rodada, setRodada] = useState(null);        // round object corrente (cena+spot)
  const [nivel, setNivel] = useState(0);             // nível de dica 0..3 (por rodada, por ERROS)
  const [ripple, setRipple] = useState(null);
  const [errouAgora, setErrouAgora] = useState(false);
  const [areaVersion, setAreaVersion] = useState(0);
  const [coverFading, setCoverFading] = useState(false);   // overlay ainda montado durante o fade de saída
  const [mostrarHitbox, setMostrarHitbox] = useState(false); // Modo Criador: contorno da área clicável (off por padrão)
  const [ferramentasAbertas, setFerramentasAbertas] = useState(false); // seção DEV recolhida na entrada
  const [detalhesFasesAbertos, setDetalhesFasesAbertos] = useState(false); // detalhes das fases (resultado) recolhidos
  // OV3 — Modo Infinito (estado exibido; refs guardam a fonte síncrona):
  const [pontos, setPontos] = useState(0);
  const [ganhoRecente, setGanhoRecente] = useState(null);   // "+100" efêmero após o acerto
  const [marcoBeni, setMarcoBeni] = useState(null);         // microcelebração de marco (≤400ms)
  const [tempoEsgotadoInf, setTempoEsgotadoInf] = useState(false); // "Tempo!" antes do resultado
  const [derrotaFase, setDerrotaFase] = useState(false);           // OV3R2 — revelação da fase perdida (Médio)
  const [derrotaDificil, setDerrotaDificil] = useState(false);     // OV3R3 — feedback de derrota da PARTIDA (Difícil)

  const dif = getDifficulty(dificuldade);
  const jogoRef = useRef(vista);
  const roundIdRef = useRef(0);
  const planoRef = useRef([]);
  const seedRef = useRef(0);
  // Baralho rotativo + histórico recente (só em memória da sessão): "jogar novamente" continua
  // o ciclo em vez de recomeçar, reduzindo a repetição percebida de posições.
  const deckStateRef = useRef(null);
  const planIdRef = useRef('');
  const salvoRef = useRef(false);
  const timeouts = useRef([]);
  const rafs = useRef([]);
  const montado = useRef(true);
  // [F6-SG-C · CAUSA B] O carimbo `janela` diz em qual largura de janela a área foi
  // medida. `viewport` recalcula quando `width` muda, mas lê esta ref — sem o carimbo
  // ele leria, no primeiro quadro depois da rotação, a área da janela ANTERIOR.
  const areaRef = useRef({ largura: 0, altura: 0, janela: 0 });
  const trocaSeqRef = useRef(0);
  const coverAnim = useRef(new Animated.Value(1)).current;   // 1 = coberto
  // Dica — tudo por rodada (OV2: por ERROS ELEGÍVEIS, não por tempo):
  const nivelRef = useRef(0);
  const errosElegivelRef = useRef(0);          // contador de erros elegíveis da fase (cooldown 700ms)
  const ultimoErroIdRef = useRef(null);
  const ultimoErroMsRef = useRef(0);
  const rodadaSeqRef = useRef(0);
  const fn = useRef({});

  // OV2 — cronômetro por fase (contabiliza só tempo ATIVO; pausa em blur/AppState/overlays/dica direta).
  const faseTimingRoundRef = useRef(null);     // roundId ao qual o tempo atual pertence
  const faseAcumMsRef = useRef(0);             // ms ativos acumulados antes do segmento corrente
  const faseAtivaDesdeRef = useRef(null);      // início (Date.now) do segmento ativo, ou null se pausado
  const faseElegivelRef = useRef(true);        // fase ainda pode virar recorde? (dica/tempo esgotado invalidam)
  const faseComDicaRef = useRef(false);        // alguma dica visível apareceu nesta fase
  const faseEsgotouRef = useRef(false);        // o tempo desta fase esgotou
  const fasesRef = useRef([]);                 // registro por fase para a tela de resultado
  const statsRef = useRef(stats);              // snapshot síncrono p/ decidir recorde sem corrida
  statsRef.current = stats;
  const rodadaRef = useRef(null);              // espelho síncrono da rodada (p/ callbacks estáveis)
  rodadaRef.current = rodada;
  const faseTeveErroRef = useRef(false);       // houve QUALQUER erro nesta fase (quebra "perfeita")
  const retryAgendadoRef = useRef(false);      // OV3 — evita reagendar auto-retry da capa na mesma fase
  const faseResolvidaRef = useRef(null);       // OV3R2 — roundId já RESOLVIDO (acerto/tempo esgotado): trava atômica

  // OV3 — Modo Infinito: cronômetro GLOBAL de 60s ATIVOS + pontuação/sequência da sessão.
  const infinito = dif.infinito === true;
  const infinitoRef = useRef(infinito);
  infinitoRef.current = infinito;
  const sessaoAcumMsRef = useRef(0);           // ms ATIVOS acumulados na sessão (não zera por fase)
  const sessaoAtivaDesdeRef = useRef(null);    // início do segmento ativo da sessão, ou null se pausado
  const pontosRef = useRef(0);                 // pontuação síncrona
  const seqPerfeitaRef = useRef(0);            // sequência perfeita corrente (0 quebra por erro/dica)
  const melhorSeqInfRef = useRef(0);           // maior sequência perfeita da sessão
  const fasesPerfeitasRef = useRef(0);         // nº de fases perfeitas na sessão
  const sessaoEncerradaRef = useRef(false);    // sessão do Infinito terminou (tempo esgotado)

  // OV3R3 — Modo Difícil: cronômetro GLOBAL da PARTIDA (5 min ativos p/ encontrar as 10). Estado
  // PRÓPRIO (não compartilha com a sessão do Infinito). Vitória (10/10) ou derrota (tempo→0).
  const timerTipo = dif.timerTipo;
  const partidaGlobal = timerTipo === 'partida';
  const partidaGlobalRef = useRef(partidaGlobal);
  partidaGlobalRef.current = partidaGlobal;
  const partidaAcumMsRef = useRef(0);          // ms ATIVOS acumulados na PARTIDA (não zera por fase)
  const partidaAtivaDesdeRef = useRef(null);   // início do segmento ativo da partida, ou null se pausado
  const partidaResolvidaRef = useRef(null);    // null | 'vitoria' | 'derrota_tempo' (trava atômica da partida)

  const sceneAtiva = getScene(rodada?.sceneId);
  const viewport = useMemo(
    () => computeViewport({
      // Medida de outra janela é recusada: o cálculo cai no derivado da janela, que
      // já era o caminho do primeiro quadro. `onLayout` corrige, não inaugura.
      largura: (areaRef.current.janela === width && areaRef.current.largura) || Math.min(width - 20, 560),
      altura: (areaRef.current.janela === width && areaRef.current.altura) || 9999,
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
    nivelRef.current = 0;
    errosElegivelRef.current = 0;
    ultimoErroIdRef.current = null;
    ultimoErroMsRef.current = 0;
    if (montado.current) setNivel(0);
  }, []);

  /** Sobe o nível de dica (0→1→2→3), nunca regride, sempre por rodada. Não pontua/avança.
   *  Qualquer dica VISÍVEL (≥2: brilho/contorno) marca a fase como "com ajuda" → sem recorde. */
  const subirDica = useCallback((n) => {
    if (n > nivelRef.current) {
      nivelRef.current = n;
      if (n >= 2) { faseComDicaRef.current = true; faseElegivelRef.current = false; }
      if (montado.current) setNivel(n);
    }
  }, []);

  /* ── Cronômetro por fase: ms ATIVOS decorridos (congela quando pausado). ── */
  const getUsadoMs = useCallback(() => {
    const base = faseAcumMsRef.current;
    const desde = faseAtivaDesdeRef.current;
    return desde != null ? base + Math.max(0, Date.now() - desde) : base;
  }, []);

  /* ── Infinito: ms ATIVOS acumulados na SESSÃO (não zera por fase; congela quando pausado). ── */
  const getSessaoMs = useCallback(() => {
    const base = sessaoAcumMsRef.current;
    const desde = sessaoAtivaDesdeRef.current;
    return desde != null ? base + Math.max(0, Date.now() - desde) : base;
  }, []);

  /* ── Difícil: ms ATIVOS acumulados na PARTIDA (atravessa as cenas; congela quando pausado). ── */
  const getPartidaMs = useCallback(() => {
    const base = partidaAcumMsRef.current;
    const desde = partidaAtivaDesdeRef.current;
    return desde != null ? base + Math.max(0, Date.now() - desde) : base;
  }, []);

  /* ── Tempo esgotado (Médio/Difícil): DERROTA da fase (OV3R2). Resolução ATÔMICA por roundId. ── */
  const aoEsgotarTempo = useCallback((rid) => {
    fn.current.resolverFaseFinita(rid, 'tempo_esgotado');
  }, []);

  /* ── No ACERTO: congela o tempo da fase, decide recorde (síncrono) e registra a fase. ── */
  const registrarTempoFase = useCallback((round) => {
    const usado = getUsadoMs();
    faseAcumMsRef.current = usado;
    faseAtivaDesdeRef.current = null;
    const sceneId = round?.sceneId;
    const elegivel = faseElegivelRef.current && !faseEsgotouRef.current && !faseComDicaRef.current && !!sceneId;
    let recorde = false;
    if (elegivel) {
      // Fonte única de recordes = brincarStatsService. Decide contra o snapshot local
      // (determinístico, sem corrida) e persiste em paralelo.
      const res = aplicarTempoFaseOvelha(statsRef.current, { dificuldade, sceneId, ms: usado, elegivel: true });
      recorde = res.novoRecorde;
      if (recorde) { statsRef.current = res.stats; if (montado.current) setStats(res.stats); }
      recordOvelhaFaseTime({ dificuldade, sceneId, ms: usado, elegivel: true }).catch(() => {});
    }
    fasesRef.current.push({
      sceneId, ms: usado, elegivel, recorde,
      comDica: faseComDicaRef.current, esgotou: faseEsgotouRef.current, erros: errosElegivelRef.current,
    });
  }, [dificuldade, getUsadoMs]);

  /* ── Infinito: no ACERTO, pontua a fase (transparente, sem punição) e mostra "+pontos"/marco. ── */
  const registrarAcertoInfinito = useCallback(() => {
    const usadoFase = getUsadoMs();
    faseAcumMsRef.current = usadoFase;
    faseAtivaDesdeRef.current = null;   // congela o tempo da fase (velocidade)
    const houveErro = faseTeveErroRef.current;
    const usouDica = faseComDicaRef.current;
    const res = pontosFaseInfinito({ ms: usadoFase, houveErro, usouDica, sequenciaAntes: seqPerfeitaRef.current });
    seqPerfeitaRef.current = res.novaSequencia;
    if (res.novaSequencia > melhorSeqInfRef.current) melhorSeqInfRef.current = res.novaSequencia;
    if (res.perfeita) fasesPerfeitasRef.current += 1;
    let ganho = res.pontos;
    const enc = jogoRef.current.encontradas;   // já incrementado pela máquina
    const marco = bonusMarcoInfinito(enc);
    if (marco > 0) {
      ganho += marco;
      setMarcoBeni(`${enc} ovelhinhas!`);
      agendar(() => montado.current && setMarcoBeni(null), 400);
    }
    pontosRef.current += ganho;
    if (montado.current) {
      setPontos(pontosRef.current);
      setGanhoRecente({ key: enc, valor: ganho });
      agendar(() => montado.current && setGanhoRecente((g) => (g && g.key === enc ? null : g)), 600);
    }
  }, [getUsadoMs, agendar]);

  /* ── OV3R2 — RESOLUÇÃO ATÔMICA de uma fase FINITA (Médio/Difícil/Fácil) ──
     Cada roundId resolve EXATAMENTE UMA VEZ (trava síncrona `faseResolvidaRef`); o 1º resultado
     válido vence; callback/toque de fase antiga é ignorado; toque e timeout no mesmo frame não
     avançam duas vezes. `motivo`: 'acerto' | 'tempo_esgotado'. ── */
  const resolverFaseFinita = useCallback((rid, motivo) => {
    if (rid == null) return;
    const round = rodadaRef.current;
    if (!round || round.roundId !== rid) return;            // fase antiga: ignora
    if (jogoRef.current.fase !== FASES.PROCURANDO) return;  // só resolve durante busca ativa
    if (faseResolvidaRef.current === rid) return;           // já resolvida: trava atômica
    faseResolvidaRef.current = rid;                         // (síncrono, antes de qualquer async)
    stopGameSfx(COUNTDOWN_TICK);                            // corta o alerta imediatamente

    if (motivo === 'acerto') {
      const r = aplicar(tocar, round.targetId);             // ACERTO na máquina (encontradas+1, agenda próxima)
      if (r.aceito && r.acerto === true) registrarTempoFase(round);
      return;
    }

    // motivo === 'tempo_esgotado' → DERROTA da fase (não da partida). Sem ovelha, sem recorde/bônus.
    const usado = getUsadoMs();
    faseAcumMsRef.current = usado;
    faseAtivaDesdeRef.current = null;                       // congela o cronômetro da fase
    faseEsgotouRef.current = true;
    faseElegivelRef.current = false;
    fn.current.subirDica(3);                                // revela o contorno (não vira sucesso)
    if (montado.current) setDerrotaFase(true);              // mensagem do Beni + bloqueia input
    // Registra a fase PERDIDA no resumo (status tempo esgotado; NÃO grava bestTimeByScene).
    fasesRef.current.push({
      sceneId: round.sceneId, ms: dif.tempoLimiteMs ?? null, elegivel: false, recorde: false,
      comDica: faseComDicaRef.current, esgotou: true, encontrada: false, erros: errosElegivelRef.current,
    });
    // Após o feedback (~1s), avança a fase (ou finaliza se última). Atado ao roundId; cleanup no unmount/partida.
    agendar(() => {
      if (!montado.current || rodadaRef.current?.roundId !== rid) return;
      setDerrotaFase(false);
      aplicar(expirarFaseFinita);   // PROCURANDO → TROCANDO(próxima) [somTroca] ou FIM [finalizarPartida]
    }, T.derrota);
  }, [aplicar, agendar, getUsadoMs, registrarTempoFase, dif.tempoLimiteMs]);

  /* ── Infinito: hint por TEMPO ATIVO na fase (8s→brilho, 12s→contorno). Chamado pelo tick do
     cronômetro (sem setInterval extra). Erros (3/5) seguem pelo caminho comum (aoTocarCena). ── */
  const aoTickInfinitoFase = useCallback(() => {
    if (!rodadaRef.current || jogoRef.current.fase !== FASES.PROCURANDO) return;
    const nv = nivelDicaInfinitoPorTempo(getUsadoMs());
    if (nv > 0) fn.current.subirDica(nv);
  }, [getUsadoMs]);

  /* ── Infinito: fim da SESSÃO (60s ativos). Salva UMA vez; não consome rodada nem inicia dica. ── */
  const finalizarInfinito = useCallback(async () => {
    if (salvoRef.current) return;
    salvoRef.current = true;
    sessaoEncerradaRef.current = true;
    limparTimers();
    resetarDica();
    aplicar(encerrar);   // trava a máquina (FIM): não aceita mais toque
    playGameSfx(OVELHA_SOUND_EVENTS.VITORIA);
    const g = jogoRef.current;
    const encontradas = g.encontradas;
    const score = pontosRef.current;
    const sequencia = melhorSeqInfRef.current;
    let r = { stats: null, isBestScore: false, starAwarded: false };
    try {
      const day = toDayKey(new Date());
      r = await recordInfinitoResult({ score, encontradas, sequencia, day });
      if (r.starAwarded) { await addBonusStars(1); await refreshProgress?.(); }
    } catch (e) {
      warn('CadeAOvelhinha.finalizarInfinito:', e);
    }
    if (!montado.current) return;
    if (r.stats) { statsRef.current = r.stats; setStats(r.stats); }
    setResultado({
      modo: 'infinito', score, encontradas, sequencia,
      fasesPerfeitas: fasesPerfeitasRef.current, isBestScore: r.isBestScore, starAwarded: r.starAwarded,
    });
    setTela('resultado');
  }, [aplicar, limparTimers, resetarDica, refreshProgress]);

  /* ── Infinito: cronômetro global chegou a zero → "Tempo!" curto e vai ao resultado. ── */
  const aoEsgotarSessao = useCallback((sid) => {
    if (seedRef.current !== sid || sessaoEncerradaRef.current) return;
    sessaoEncerradaRef.current = true;
    setTempoEsgotadoInf(true);
    aplicar(encerrar);   // bloqueia novos toques imediatamente
    agendar(() => fn.current.finalizarInfinito(), 700);
  }, [aplicar, agendar]);

  /* ══════════════ OV3R3 — Modo Difícil: partida inteira (vitória/derrota) ══════════════ */

  /* Salva a PARTIDA do Difícil UMA vez. Vitória: estrela + bestCompletionMs. Derrota: sem estrela. */
  const finalizarDificil = useCallback(async (tipo) => {
    if (salvoRef.current) return;
    salvoRef.current = true;
    limparTimers();
    resetarDica();
    const vitoria = tipo === 'vitoria';
    if (vitoria) playGameSfx(OVELHA_SOUND_EVENTS.VITORIA);
    const g = jogoRef.current;
    const usadoPartida = getPartidaMs();
    let r = { stats: null, isBest: false, starAwarded: false };
    let novoCompletion = false;
    try {
      const day = toDayKey(new Date());
      // Estrela SÓ na vitória (permitirEstrela). Derrota persiste plays/seq SEM conceder/consumir estrela.
      r = await recordOvelhaResult({ dificuldade, day, encontradas: g.encontradas, sequencia: g.bestSequencia, permitirEstrela: vitoria });
      if (vitoria) {
        const c = await recordCompletionDificil(usadoPartida);   // bestCompletionMs (só 10/10)
        novoCompletion = c.novoRecorde;
        if (r.starAwarded) { await addBonusStars(1); await refreshProgress?.(); }
      }
    } catch (e) {
      warn('CadeAOvelhinha.finalizarDificil:', e);
    }
    if (!montado.current) return;
    if (r.stats) { statsRef.current = r.stats; setStats(r.stats); }
    setResultado({
      modo: 'dificil', vitoria,
      encontradas: g.encontradas, total: g.rounds, bestSequencia: g.bestSequencia,
      tempoUsadoMs: usadoPartida, tempoTotalMs: dif.tempoGlobalMs,
      isBest: r.isBest, novoCompletion, starAwarded: vitoria && r.starAwarded,
      dificuldade, fases: fasesRef.current.slice(),
    });
    setTela('resultado');
  }, [dificuldade, limparTimers, resetarDica, refreshProgress, getPartidaMs, dif.tempoGlobalMs]);

  /* Resolve a PARTIDA do Difícil ATOMICAMENTE (1×). Vitória vem do 10º acerto; derrota do tempo→0. */
  const resolverPartidaDificil = useCallback((motivo) => {
    if (partidaResolvidaRef.current != null || salvoRef.current) return;   // trava atômica da partida
    partidaResolvidaRef.current = motivo;
    limparTimers();                 // cancela avanço/celebração pendentes (sem 2º resultado)
    stopGameSfx(COUNTDOWN_TICK);
    if (motivo === 'vitoria') {
      // deixa a celebração do ACERTO tocar; depois abre o resultado de vitória
      agendar(() => fn.current.finalizarDificil('vitoria'), T.acerto);
    } else {
      faseResolvidaRef.current = rodadaRef.current?.roundId ?? null;   // bloqueia toque na fase corrente
      aplicar(encerrar);            // FIM: para o timer e trava a máquina (NÃO revela como fase comum)
      if (montado.current) setDerrotaDificil(true);
      agendar(() => fn.current.finalizarDificil('derrota_tempo'), T.derrota);
    }
  }, [aplicar, agendar, limparTimers]);

  /* Cronômetro global da partida chegou a zero → DERROTA (se ainda não resolvida por vitória). */
  const aoEsgotarPartidaDificil = useCallback((sid) => {
    if (seedRef.current !== sid) return;
    fn.current.resolverPartidaDificil('derrota_tempo');
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
    // Infinito: a dificuldade EFETIVA (hitbox/escala) da fase segue a Faixa progressiva pelo nº já
    // encontrado; modos finitos usam a dificuldade fixa. Assets/spots/contentRect intactos.
    const difBuild = infinitoRef.current ? getInfiniteStageConfig(jogoRef.current.encontradas).difId : dificuldade;
    const r = buildRoundFromSpot({ scene, spot, roundId: token, dificuldade: difBuild });
    if (!r || !roundValido(r)) { warn('CadeAOvelhinha: rodada inválida (contrato).'); return; }
    const iniciou = aplicar(iniciarRodada, { targetId: r.targetId, itemIds: [r.targetId, MISS_ID] });
    if (!iniciou.aceito) return;
    // OV2 — zera o cronômetro da nova fase. O tempo só passa a contar quando a cena for revelada
    // (efeito de timing ao entrar em PROCURANDO), então durante a capa a regressiva fica cheia.
    faseTimingRoundRef.current = null;
    faseAcumMsRef.current = 0;
    faseAtivaDesdeRef.current = null;
    faseElegivelRef.current = true;
    faseComDicaRef.current = false;
    faseEsgotouRef.current = false;
    faseTeveErroRef.current = false;   // OV3 — reinicia "perfeita" da fase (qualquer erro quebra)
    retryAgendadoRef.current = false;  // OV3 — libera 1 auto-retry desta fase, se a capa falhar
    faseResolvidaRef.current = null;   // OV3R2 — nova fase publicada: destrava a resolução atômica
    setRodada(r);
    setRipple(null);
    resetarDica();
    ldispatch({ type: 'NOVA_RODADA', token, sceneId: r.sceneId, spotId: r.spot.id, pose: r.pose });
  }, [aplicar, dificuldade, resetarDica]);

  /* ── Fim da partida (Fácil/Médio finitos). Difícil concluído = VITÓRIA → finalizarDificil. ── */
  const finalizar = useCallback(async () => {
    if (OVELHA_CALIBRACAO || salvoRef.current) return;
    // OV3R3 — chegar aqui no Difícil = 10/10 concluídas = VITÓRIA (o resultado é o da partida).
    if (partidaGlobalRef.current) { fn.current.finalizarDificil('vitoria'); return; }
    salvoRef.current = true;
    limparTimers();
    resetarDica();
    playGameSfx(OVELHA_SOUND_EVENTS.VITORIA);
    const g = jogoRef.current;
    let r = { stats: null, isBest: false, starAwarded: false };
    try {
      const day = toDayKey(new Date());
      r = await recordOvelhaResult({ dificuldade, day, encontradas: g.encontradas, sequencia: g.bestSequencia });
      if (r.starAwarded) { await addBonusStars(1); await refreshProgress?.(); }
    } catch (e) {
      warn('CadeAOvelhinha.finalizar:', e);
    }
    if (!montado.current) return;
    if (r.stats) { statsRef.current = r.stats; setStats(r.stats); }
    setResultado({
      encontradas: g.encontradas, total: g.rounds, bestSequencia: g.bestSequencia,
      isBest: r.isBest, starAwarded: r.starAwarded,
      dificuldade, fases: fasesRef.current.slice(),
    });
    setTela('resultado');
  }, [refreshProgress, limparTimers, resetarDica, dificuldade]);

  fn.current = { aplicar, agendar, finalizar, finalizarInfinito, finalizarDificil, resolverPartidaDificil, subirDica, montarRodada, resolverFaseFinita };

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
  // OV2 — fase "rodando": revelada, procurando e sem pausa. Governa o cronômetro por fase.
  // OV3R2 — durante a revelação da fase perdida (derrotaFase) o cronômetro PARA (sem tick/som).
  const rodando = procurando && !pausado && !derrotaFase;

  /* ── Cobertura: sempre que coberto, o overlay cobre IMEDIATAMENTE (sem fade lento). ── */
  useEffect(() => {
    if (lstate.coverVisible) coverAnim.setValue(1);
  }, [lstate.coverVisible, coverAnim]);

  /* ── Cronômetro por fase (OV2) ──
     Contabiliza SÓ tempo ativo: ao entrar em PROCURANDO revelado e sem pausa, começa/retoma o
     segmento; ao pausar (AppState/blur/overlay/troca) acumula o decorrido. O tempo esgotado
     (Médio/Difícil) é detectado pelo componente <Cronometro> e tratado por aoEsgotarTempo. */
  useEffect(() => {
    const rid = rodada?.roundId;
    if (!jogando || !rid) return;
    const agora = Date.now();
    if (rodando) {
      if (faseTimingRoundRef.current !== rid) {
        // Fase nova: zera acumulador e elegibilidade (o tempo só conta a partir daqui).
        faseTimingRoundRef.current = rid;
        faseAcumMsRef.current = 0;
        faseElegivelRef.current = true;
        faseComDicaRef.current = false;
        faseEsgotouRef.current = false;
      }
      faseAtivaDesdeRef.current = agora;
      // OV3 — sessão do Infinito: retoma o segmento ATIVO (não zera por fase).
      if (sessaoAtivaDesdeRef.current == null) sessaoAtivaDesdeRef.current = agora;
      // OV3R3 — partida do Difícil: retoma o segmento ATIVO (atravessa as cenas; não zera por fase).
      if (partidaAtivaDesdeRef.current == null) partidaAtivaDesdeRef.current = agora;
    } else {
      // Pausa/saída do segmento ativo (fase): acumula o tempo já decorrido e congela.
      if (faseTimingRoundRef.current === rid && faseAtivaDesdeRef.current != null) {
        faseAcumMsRef.current += Math.max(0, agora - faseAtivaDesdeRef.current);
        faseAtivaDesdeRef.current = null;
      }
      // OV3 — sessão do Infinito: congela (pausa capa/celebração/blur/AppState/overlay).
      if (sessaoAtivaDesdeRef.current != null) {
        sessaoAcumMsRef.current += Math.max(0, agora - sessaoAtivaDesdeRef.current);
        sessaoAtivaDesdeRef.current = null;
      }
      // OV3R3 — partida do Difícil: congela (mesma pausa; NÃO reinicia ao trocar de cena).
      if (partidaAtivaDesdeRef.current != null) {
        partidaAcumMsRef.current += Math.max(0, agora - partidaAtivaDesdeRef.current);
        partidaAtivaDesdeRef.current = null;
      }
    }
  }, [jogando, rodando, rodada?.roundId]);

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

  /* ── Começar. Em CALIBRAÇÃO não consome rodada nem sorteia. ──
     `marcarApresentacao`: só quando a partida REALMENTE inicia (autorização real via consumeRound)
     é que a apresentação diária conta como vista — antes disso, não marca. */
  const comecar = useCallback(async ({ marcarApresentacao = false } = {}) => {
    if (!OVELHA_CALIBRACAO) {
      const r = await consumeRound();
      if (!r.ok) { setRounds(await getDailyRounds()); setTela('entrada'); return; }
    }
    if (marcarApresentacao) {
      const hoje = toDayKey(new Date());
      statsRef.current = aplicarApresentacaoOvelha(statsRef.current, hoje).stats;
      if (montado.current) setStats(statsRef.current);
      marcarApresentacaoOvelha(hoje).catch(() => {});
    }
    await preloadOvelhaAssets();
    if (!montado.current) return;
    limparTimers();
    resetarDica();
    fasesRef.current = [];
    faseTimingRoundRef.current = null;
    faseAtivaDesdeRef.current = null;
    faseAcumMsRef.current = 0;
    faseTeveErroRef.current = false;
    // OV3 — reinicia a sessão do Infinito (cronômetro global + pontuação/sequência).
    sessaoAcumMsRef.current = 0;
    sessaoAtivaDesdeRef.current = null;
    sessaoEncerradaRef.current = false;
    pontosRef.current = 0;
    seqPerfeitaRef.current = 0;
    melhorSeqInfRef.current = 0;
    fasesPerfeitasRef.current = 0;
    setPontos(0);
    setGanhoRecente(null);
    setMarcoBeni(null);
    setTempoEsgotadoInf(false);
    setDerrotaFase(false);            // OV3R2 — nova sessão nunca começa em revelação de derrota
    setDerrotaDificil(false);         // OV3R3 — nova partida Difícil nunca começa em derrota
    faseResolvidaRef.current = null;
    // OV3R3 — reinicia o relógio e a trava da PARTIDA (Difícil): novos 5 minutos, guarda destravada.
    partidaAcumMsRef.current = 0;
    partidaAtivaDesdeRef.current = null;
    partidaResolvidaRef.current = null;
    setDetalhesFasesAbertos(false);   // OV3 — detalhes do resultado sempre começam recolhidos
    salvoRef.current = false;
    trocaSeqRef.current += 1;
    coverAnim.setValue(1);
    ldispatch({ type: 'RESET' });
    // Seed de sessão → percurso determinístico e reproduzível (mostrada no Modo Criador).
    const seed = novaSeed();
    seedRef.current = seed;
    const modo = getDifficulty(dificuldade);
    // Baralho rotativo em memória: mesma seed + mesmo deckState → mesmo plano; o deckState é
    // atualizado (não muta a entrada) para a próxima partida continuar consumindo o ciclo.
    // Infinito: plano progressivo (Faixas) e grande (cobre a sessão); modos finitos: plano fixo.
    const plano = modo.infinito
      ? planPartidaInfinito({ rng: criarRng(seed), deckState: deckStateRef.current })
      : planPartida({ rng: criarRng(seed), dificuldade, deckState: deckStateRef.current });
    planoRef.current = plano.plano;
    deckStateRef.current = plano.deckState;
    planIdRef.current = plano.planId;
    jogoRef.current = criarJogo({ rounds: modo.rounds });
    setVista(jogoRef.current);
    setRodada(null);
    setResultado(null);
    setRipple(null);
    setPausado(AppState.currentState !== 'active');
    setTela('jogando');
    if (!OVELHA_CALIBRACAO) setRounds(await getDailyRounds());
    // A rodada 1 é montada pelo ÚNICO caminho autoritativo: o efeito de TROCANDO abaixo
    // (a máquina nasce em TROCANDO). Nada de montagem direta aqui — evita rodada duplicada.
  }, [limparTimers, resetarDica, coverAnim, dificuldade]);

  const abandonar = useCallback(() => {
    limparTimers(); trocaSeqRef.current += 1; resetarDica(); setDerrotaFase(false); aplicar(encerrar); setTela('entrada');
  }, [aplicar, limparTimers, resetarDica]);

  /* ── Entrada → apresentação da ovelha (1×/dia) ou início direto se já vista hoje. ── */
  const iniciarComApresentacao = useCallback(() => {
    const hoje = toDayKey(new Date());
    if (ovelhaApresentouHoje(statsRef.current, hoje)) { comecar(); return; }
    setTela('apresentacao');
  }, [comecar]);

  /* ── onDisplay / onError de cada imagem REAL (gate de prontidão). ── */
  const aoExibir = useCallback((alvo, token) => {
    ldispatch({ type: 'EXIBIDA', alvo, token });
  }, []);
  const aoErro = useCallback((alvo, token) => {
    ldispatch({ type: 'ERRO', alvo, token });
  }, []);
  // Callbacks ESTÁVEIS das imagens da cena (lêem a rodada por ref) → SceneLayer memoizado NÃO
  // re-renderiza a cada tick do cronômetro (só quando muda rodada/dica/acerto/ripple).
  const onBgDisplay = useCallback(() => aoExibir('background', rodadaRef.current?.roundId), [aoExibir]);
  const onBgError = useCallback(() => aoErro('background', rodadaRef.current?.roundId), [aoErro]);
  const onSheepDisplay = useCallback(() => aoExibir('sceneSheep', rodadaRef.current?.roundId), [aoExibir]);
  const onSheepError = useCallback(() => aoErro('sceneSheep', rodadaRef.current?.roundId), [aoErro]);

  /* ── Procurar: revela a cena e libera o jogo de forma DETERMINÍSTICA. ──
     A liberação (máquina PROCURANDO + input) NÃO depende do callback da animação — o fade do
     overlay é só cosmético (o overlay fica montado, sem receber toque, até terminar). Assim o
     bug antigo (native driver cancela o fade ao desmontar → callback com finished:false →
     cenaPronta/LIBERAR nunca rodavam) deixa de existir. */
  const procurar = useCallback(() => {
    if (!botaoHabilitado(lstate)) return;
    const token = lstate.roundToken;
    fn.current.aplicar(cenaPronta);          // ENTRANDO → PROCURANDO (síncrono)
    ldispatch({ type: 'REVELAR', token });   // coverVisible = false (cena aparece)
    ldispatch({ type: 'LIBERAR', token });   // inputEnabled = true
    rodadaSeqRef.current += 1;
    resetarDica();
    setRipple(null);
    setCoverFading(true);                     // mantém o overlay montado durante o fade de saída
    Animated.timing(coverAnim, { toValue: 0, duration: T.coverOut, useNativeDriver: true })
      .start(({ finished }) => { if (finished && montado.current) setCoverFading(false); });
  }, [lstate, coverAnim, resetarDica]);

  /* [F6-SG-C · CAUSA E1] Prazo de carga por rodada — a saída que não depende de `onError`.
   *
   * A cena só descobre quando os TRÊS `onDisplay` chegam com o token corrente, e o único
   * caminho alternativo (`temErro`) exige um `onError` explícito. Há pelo menos um caminho
   * em que nenhum dos dois chega: retângulo de imagem ainda vazio quando o container monta,
   * antes de `medirArea`. Sem prazo, a capa técnica fica para sempre e a criança não recebe
   * sinal nenhum. Girar o tablet agrava — nova medida, novo retângulo, novo ciclo de carga
   * SEM novo token.
   *
   * Quem decide se expirar é legítimo é o reducer (puro e testado); aqui só se agenda e se
   * cancela. O relógio reinicia a cada progresso real, porque `lstate` muda a cada `EXIBIDA`:
   * uma cena que está carregando devagar ganha prazo novo em vez de ser reiniciada no meio.
   */
  useEffect(() => {
    if (!lstate.roundToken || !lstate.coverVisible) return undefined;
    if (prontoParaRevelar(lstate) || temErro(lstate)) return undefined;   // nada a recuperar
    const token = lstate.roundToken;
    const id = setTimeout(() => { ldispatch({ type: 'EXPIRAR', token }); }, T.prazoCarga);
    return () => clearTimeout(id);
  }, [lstate]);

  /* ── Tentar novamente (após erro): recarrega a MESMA rodada. ── */
  const tentarNovamente = useCallback(() => {
    ldispatch({ type: 'RETRY', token: lstate.roundToken });   // avança `recarga` → novo recyclingKey → imagens remontam
  }, [lstate.roundToken]);

  /* ── Toque na OVELHA (wrapper clicável dedicado): ACERTO. ── */
  const scene = sceneAtiva;
  const interativo = !pausado && !inputBloqueado(lstate) && !!rodada && vista.fase === FASES.PROCURANDO;
  const aoTocarOvelha = useCallback(() => {
    if (pausado || inputBloqueado(lstate) || !rodada) return;   // coberto/carregando/erro/transição
    const rid = rodada.roundId;
    if (faseResolvidaRef.current === rid) return;               // fase já resolvida (derrota/acerto): input bloqueado

    // Infinito: sem deadline POR FASE (só o global da sessão) — acerto normal.
    if (infinitoRef.current) {
      const r = aplicar(tocar, rodada.targetId);
      if (r.aceito && r.acerto === true) registrarAcertoInfinito();
      return;
    }
    // OV3R3 — Difícil: AUTORIDADE DO DEADLINE da PARTIDA (relógio único). Toque após o prazo → DERROTA
    // da partida; 10º acerto antes do prazo → VITÓRIA. Cada acerto grava o tempo da fase (recorde/cena).
    if (partidaGlobalRef.current) {
      if (partidaResolvidaRef.current != null) return;
      const limiteGlobal = dif.tempoGlobalMs;
      if (limiteGlobal != null && (limiteGlobal - getPartidaMs()) <= 0) {
        fn.current.resolverPartidaDificil('derrota_tempo');   // toque fora do prazo → derrota da partida
        return;
      }
      const r = aplicar(tocar, rodada.targetId);
      if (r.aceito && r.acerto === true) {
        registrarTempoFase(rodada);                            // recorde por cenário (tempo da busca)
        if (jogoRef.current.encontradas >= jogoRef.current.rounds) {
          fn.current.resolverPartidaDificil('vitoria');        // 10/10 antes do tempo → vitória
        }
      }
      return;
    }
    // Médio/Fácil: AUTORIDADE DO DEADLINE por FASE (não o texto "0s"). Toque após o prazo nunca vence.
    const limiteMs = dif.tempoLimiteMs;
    if (limiteMs != null && (limiteMs - getUsadoMs()) <= 0) {
      fn.current.resolverFaseFinita(rid, 'tempo_esgotado');    // toque fora do prazo → resolve como derrota
      return;
    }
    fn.current.resolverFaseFinita(rid, 'acerto');
  }, [pausado, lstate, rodada, aplicar, registrarAcertoInfinito, registrarTempoFase, getUsadoMs, getPartidaMs, dif.tempoLimiteMs, dif.tempoGlobalMs]);

  /* ── Toque no RESTO do cenário: ERRO leve (feedback), sem avançar rodada nem punir. ── */
  const aoTocarCena = useCallback((e) => {
    if (pausado || inputBloqueado(lstate) || !rodada) return;
    if (faseResolvidaRef.current === rodada.roundId) return;   // OV3R2 — fase resolvida: sem toque na revelação
    const { locationX: px, locationY: py } = e?.nativeEvent ?? {};
    if (OVELHA_CALIBRACAO) { setRipple({ key: `${Date.now()}`, x: px, y: py }); return; }
    const r = aplicar(tocar, MISS_ID);
    if (r.aceito && r.acerto === false) {
      faseTeveErroRef.current = true;   // OV3 — qualquer erro quebra a "fase perfeita" (Infinito)
      setRipple({ key: `${Date.now()}`, x: px, y: py });
      setErrouAgora(true);
      agendar(() => montado.current && setErrouAgora(false), T.erro);
      // OV2 — dica por ERROS ELEGÍVEIS (cooldown 700ms evita spam de toques). Ao cruzar os
      // limites do modo (Fácil 4/6 · Médio 6/8 · Difícil 8/10) sobe a dica: brilho e depois contorno.
      const agora = Date.now();
      const elig = erroElegivel({ id: MISS_ID, ultimoId: ultimoErroIdRef.current, agoraMs: agora, ultimoMs: ultimoErroMsRef.current });
      ultimoErroIdRef.current = MISS_ID;
      ultimoErroMsRef.current = agora;
      if (elig) {
        errosElegivelRef.current += 1;
        const nv = nivelDicaPorErros(errosElegivelRef.current, dif.dicaErros);
        if (nv > 0) fn.current.subirDica(nv);
      }
    }
  }, [aplicar, agendar, pausado, lstate, rodada, dif.dicaErros]);

  const medirArea = useCallback((e) => {
    const { width: w, height: h } = e?.nativeEvent?.layout ?? {};
    if (!w || !h) return;
    // A troca de carimbo TAMBÉM é mudança: é ela que devolve o viewport à medida real
    // depois de a janela girar, mesmo que os números da área tenham ficado iguais.
    const mudou = areaRef.current.janela !== width
      || Math.abs(areaRef.current.largura - w) > 1
      || Math.abs(areaRef.current.altura - h) > 1;
    areaRef.current = { largura: w, altura: h, janela: width };
    if (mudou) setAreaVersion((v) => v + 1);
  }, [width]);

  /* ── OV3 — Transição AUTOMÁTICA entre fases (capa técnica SEM botão) ──
     Assim que as 3 imagens exibem (sceneReady, sem erro), revela sozinha; nada de tocar "Procurar".
     Em falha de imagem, recarrega a MESMA fase uma vez (buttonless). Nunca durante pausa/apresentação. */
  useEffect(() => {
    if (!jogando || pausado) return;
    if (botaoHabilitado(lstate)) { procurar(); return; }
    if (temErro(lstate) && !retryAgendadoRef.current) {
      retryAgendadoRef.current = true;
      agendar(() => { if (montado.current) tentarNovamente(); }, 500);
    }
  }, [jogando, pausado, lstate, procurar, tentarNovamente, agendar]);

  const semRodadas = !premium && rounds != null && rounds.remaining <= 0;
  const mensagem = pausado
    ? 'Joguinho pausado. Volte quando quiser!'
    : errouAgora ? OVELHA_BENI.erro
      : nivel >= 1 ? OVELHA_BENI.incentivo
        : OVELHA_BENI.procurando;

  const dicaNivel = procurando && !pausado ? nivel : 0;   // 0..3 (1 região · 2 brilho · 3 contorno)
  const rodadaNum = Math.min(vista.rodada, vista.rounds);
  const encontrada = vista.fase === FASES.ACERTO;
  // Pose ÚNICA frontal no jogo: cartão, miniatura e cena usam sempre o MESMO asset.
  const criadorAtivo = isCreatorQaModeAllowed() && isCreatorQaModeEnabled();

  /* ══════════════ APRESENTAÇÃO (1×/dia, antes da 1ª fase jogável) ══════════════ */
  if (tela === 'apresentacao') {
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => setTela('entrada')} />
        <View style={styles.entradaWrap}>
          <View style={styles.painel}>
            <BeniGuideBubble message={OVELHA_BENI.entrada} avatarVariant="teaching" tone="purple" compact />
          </View>
          <View style={styles.apreCard}>
            <Text style={styles.apreTitulo}>Encontre esta ovelhinha!</Text>
            <View style={styles.apreSheepBg}>
              <ExpoImage
                source={OVELHA_POSE_IMG[OVELHA_POSE_JOGO]}
                style={styles.apreSheep}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={0}
                recyclingKey={`apre:${OVELHA_POSE_JOGO}`}
              />
            </View>
            <Text style={styles.apreFrase}>
              Ela é a mesma o dia todo. Guarde bem o rostinho dela — em cada fase ela se esconde numa paisagem diferente!
            </Text>
            <View style={styles.apreInfoRow}>
              <View style={styles.apreInfoPill}>
                <FaithIcon name="ovelha" size={13} color={pt.greenDeep} />
                <Text style={styles.apreInfoTxt}>{dif.label} · {infinito ? 'sem fim' : partidaGlobal ? `${dif.rounds} ovelhinhas` : `${dif.rounds} fases`}</Text>
              </View>
              <View style={styles.apreInfoPill}>
                <FaithIcon name="timer" size={13} color={pt.greenDeep} />
                <Text style={styles.apreInfoTxt}>
                  {infinito ? '60s de busca'
                    : partidaGlobal ? `${formatarTempoMs(dif.tempoGlobalMs)} no total`
                      : dif.tempoLimiteMs ? `${formatarTempoMs(dif.tempoLimiteMs)} por fase` : 'Sem tempo'}
                </Text>
              </View>
            </View>
          </View>
          <SoundButton style={styles.btnPrimario} onPress={() => comecar({ marcarApresentacao: true })} activeOpacity={0.9} soundType="success">
            <FaithIcon name="ovelha" size={18} color="#FFF" />
            <Text style={styles.btnPrimarioText}>Vamos procurar!</Text>
          </SoundButton>
          <SoundButton style={styles.btnSecundario} onPress={() => setTela('entrada')} activeOpacity={0.9}>
            <Text style={styles.btnSecundarioText}>Agora não</Text>
          </SoundButton>
        </View>
      </View>
    );
  }

  /* ══════════════ ENTRADA (lista vertical + CTA fixo no rodapé) ══════════════ */
  if (tela === 'entrada') {
    const statusText = rounds == null
      ? 'Preparando suas rodadas…'
      : premium
        ? 'Modo Família: brinque à vontade!'
        : rounds.remaining <= 0
          ? 'As rodadas de hoje acabaram. Amanhã tem mais!'
          : `Hoje você ainda pode brincar ${rounds.remaining} ${rounds.remaining === 1 ? 'vez' : 'vezes'}.`;
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => navigation.goBack()} criadorAtivo={criadorAtivo} />
        <ScrollView contentContainerStyle={styles.entradaScroll} showsVerticalScrollIndicator={false}>
          {/* Hero compacto e CONVIDATIVO (Beni + ovelha + 1 frase). Sem WebP, sem blur, sem loop. */}
          <View style={styles.hero}>
            <View style={styles.heroSheepBg}>
              <ExpoImage
                source={OVELHA_POSE_IMG[OVELHA_POSE_JOGO]}
                style={styles.heroSheep}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={0}
                recyclingKey={`hero:${OVELHA_POSE_JOGO}`}
              />
            </View>
            <View style={styles.heroTexto}>
              <Text style={styles.heroTitulo}>Cadê a Ovelhinha?</Text>
              <Text style={styles.heroFrase}>A ovelhinha adora se esconder. Vamos procurar?</Text>
            </View>
          </View>

          {/* Status diário ÚNICO (sem mensagem duplicada). */}
          <View style={styles.statusPill}>
            <FaithIcon name="star" size={14} color={pt.goldDeep} />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>

          {/* Lista VERTICAL dos 4 modos. Seleção clara (borda + check + fundo), não só cor. */}
          {OVELHA_DIFFICULTIES.map((m) => {
            const sel = m.id === dificuldade;
            const meta = MODO_INFO[m.id] || {};
            const recordeTxt = m.infinito
              ? (melhorPontosInfinito(stats) > 0 ? `Melhor: ${milhar(melhorPontosInfinito(stats))} pontos` : 'Sem recorde')
              : m.timerTipo === 'partida'
                ? (melhorCompletionDificil(stats) > 0 ? `Melhor partida: ${formatarTempoMs(melhorCompletionDificil(stats))}`
                  : melhorTempoDaDificuldade(stats, m.id) != null ? `Melhor fase: ${formatarTempoMs(melhorTempoDaDificuldade(stats, m.id))}` : 'Sem recorde')
                : (melhorTempoDaDificuldade(stats, m.id) != null ? `Melhor fase: ${formatarTempoMs(melhorTempoDaDificuldade(stats, m.id))}` : 'Sem recorde');
            return (
              <SoundButton
                key={m.id}
                style={[styles.modoCard, sel && styles.modoCardSel, m.infinito && styles.modoCardInf, m.infinito && sel && styles.modoCardInfSel]}
                onPress={() => setDificuldade(m.id)}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityState={{ selected: sel }}
              >
                <View style={styles.modoCardTopo}>
                  <Text style={[styles.modoTitulo, sel && styles.modoTituloSel]}>{m.label}</Text>
                  <View style={[styles.modoCheck, sel ? styles.modoCheckOn : styles.modoCheckOff]}>
                    {sel && <FaithIcon name="check" size={13} color="#FFF" />}
                  </View>
                </View>
                <Text style={styles.modoDesc}>{meta.desc}</Text>
                <View style={styles.modoMetaRow}>
                  <View style={styles.modoTag}><FaithIcon name="ovelha" size={11} color={pt.textSoft} /><Text style={styles.modoTagTxt}>{meta.info}</Text></View>
                  <View style={styles.modoTag}><FaithIcon name="timer" size={11} color={pt.textSoft} /><Text style={styles.modoTagTxt}>{meta.tempo}</Text></View>
                </View>
                <Text style={styles.modoRecorde}>{recordeTxt}</Text>
              </SoundButton>
            );
          })}

          {/* Ferramentas de teste (Modo Criador) — recolhidas, discretas, sem competir com o CTA. */}
          {isInternalToolsEnabled() && (
            <View style={styles.devSec}>
              <Pressable style={styles.devSecHead} onPress={() => setFerramentasAbertas((v) => !v)} accessibilityRole="button">
                <Text style={styles.devSecTitulo}>Ferramentas de teste</Text>
                <Text style={styles.devSecChevron}>{ferramentasAbertas ? '▾' : '▸'}</Text>
              </Pressable>
              {ferramentasAbertas && (
                <SoundButton style={styles.btnDev} onPress={() => navigation.navigate(ROUTES.OVELHA_ASSET_GALLERY)} activeOpacity={0.9}>
                  <Text style={styles.btnDevText}>Asset Gallery (dev)</Text>
                </SoundButton>
              )}
            </View>
          )}
        </ScrollView>

        {/* CTA fixo no rodapé SEGURO (fora da ScrollView). Reflete o modo; desabilita sem rodada. */}
        <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          {semRodadas ? (
            <View style={[styles.btnPrimario, styles.btnPrimarioOff]} accessibilityState={{ disabled: true }}>
              <Text style={styles.btnPrimarioOffText}>Volte amanhã</Text>
            </View>
          ) : (
            <SoundButton style={styles.btnPrimario} onPress={iniciarComApresentacao} activeOpacity={0.9} soundType="success">
              <FaithIcon name={infinito ? 'timer' : 'ovelha'} size={18} color="#FFF" />
              <Text style={styles.btnPrimarioText}>Começar no {dif.label}</Text>
            </SoundButton>
          )}
        </View>
      </View>
    );
  }

  /* ══════════════ RESULTADO ══════════════ */
  if (tela === 'resultado') {
    const ehInfinito = resultado?.modo === 'infinito';
    const ehDificil = resultado?.modo === 'dificil';
    const CTAs = (
      <>
        <SoundButton style={styles.btnPrimario} onPress={() => comecar()} activeOpacity={0.9} soundType="success">
          <FaithIcon name="restart" size={18} color="#FFF" />
          <Text style={styles.btnPrimarioText}>Jogar novamente</Text>
        </SoundButton>
        <SoundButton style={styles.btnSecundario} onPress={() => setTela('entrada')} activeOpacity={0.9}>
          <Text style={styles.btnSecundarioText}>{ehInfinito ? 'Trocar modo' : 'Trocar dificuldade'}</Text>
        </SoundButton>
        <SoundButton style={styles.btnTerciario} onPress={() => navigation.navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })} activeOpacity={0.9}>
          <Text style={styles.btnTerciarioText}>Voltar para Brincar</Text>
        </SoundButton>
      </>
    );
    const faixaEstrela = (
      <View style={resultado?.starAwarded ? styles.faixaEstrela : styles.faixaSuave}>
        <FaithIcon name="star" size={15} color={resultado?.starAwarded ? pt.goldDeep : pt.textSoft} />
        <Text style={resultado?.starAwarded ? styles.faixaEstrelaText : styles.faixaSuaveText}>
          {resultado?.starAwarded ? '+1 estrelinha!' : 'Você já ganhou as estrelinhas de hoje. Amanhã tem mais!'}
        </Text>
      </View>
    );

    /* ── Resultado do DIFÍCIL (vitória 10/10 antes do tempo · derrota por tempo→0) ── */
    if (ehDificil) {
      const vit = resultado?.vitoria === true;
      const enc = resultado?.encontradas ?? 0;
      const total = resultado?.total ?? 10;
      const usadoMs = resultado?.tempoUsadoMs ?? 0;
      const totalMs = resultado?.tempoTotalMs ?? dif.tempoGlobalMs;
      const restanteMs = Math.max(0, totalMs - usadoMs);
      const fasesD = resultado?.fases ?? [];
      const semDicaD = fasesD.filter((f) => !f.comDica && !f.esgotou).length;
      return (
        <View style={styles.root}>
          <Header insets={insets} onBack={() => setTela('entrada')} />
          <ScrollView contentContainerStyle={styles.resultadoScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.painel}>
              <BeniGuideBubble
                message={vit ? 'Você encontrou todas as ovelhinhas!' : 'Você chegou pertinho. Tente novamente e bata seu resultado!'}
                avatarVariant={vit ? 'celebrating' : 'teaching'} tone="purple" compact
              />
            </View>
            <View style={styles.vitoriaCard}>
              <Text style={styles.resultadoTitulo}>{vit ? 'Você encontrou todas as ovelhinhas!' : 'O tempo acabou!'}</Text>
              <Text style={styles.destaque}>{enc} de {total}</Text>
              <Text style={styles.destaqueLabel}>ovelhinhas encontradas · Difícil</Text>
              <View style={styles.statsRow3}>
                <Stat label={vit ? 'Tempo usado' : 'Tempo total'} valor={vit ? formatarTempoMs(usadoMs) : formatarTempoMs(totalMs)} />
                <Stat label="Melhor sequência" valor={`${resultado?.bestSequencia ?? 0}`} />
                <Stat label="Fases sem dica" valor={`${semDicaD}`} />
              </View>
              {vit && <Text style={styles.recordeAnterior}>Tempo restante: {formatarTempoMs(restanteMs)}</Text>}
              {vit && resultado?.novoCompletion && (
                <View style={styles.faixaBoa}>
                  <FaithIcon name="trophies" size={16} color="#0E5A3C" />
                  <Text style={styles.faixaBoaText}>Nova melhor partida!</Text>
                </View>
              )}
              {vit && !resultado?.novoCompletion && melhorCompletionDificil(stats) > 0 && (
                <Text style={styles.recordeAnterior}>Melhor partida: {formatarTempoMs(melhorCompletionDificil(stats))}</Text>
              )}
              {/* Estrela SÓ na vitória; a derrota NUNCA insinua recompensa. */}
              {vit ? faixaEstrela : (
                <View style={styles.faixaSuave}>
                  <FaithIcon name="ovelha" size={15} color={pt.textSoft} />
                  <Text style={styles.faixaSuaveText}>Encontre todas antes do tempo para ganhar a estrelinha!</Text>
                </View>
              )}
            </View>
            {CTAs}
            {/* Detalhes: só as fases realmente jogadas (a cena incompleta não vira registro). */}
            {fasesD.length > 0 && (
              <View style={styles.fasesCard}>
                <Pressable style={styles.fasesHead} onPress={() => setDetalhesFasesAbertos((v) => !v)} accessibilityRole="button">
                  <Text style={styles.fasesTitulo}>Ver detalhes das fases</Text>
                  <Text style={styles.devSecChevron}>{detalhesFasesAbertos ? '▾' : '▸'}</Text>
                </Pressable>
                {detalhesFasesAbertos && fasesD.map((f, i) => (<FaseLinha key={i} indice={i + 1} fase={f} />))}
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    /* ── Resultado do INFINITO (próprio, compacto; sem lista de fases, sem ranking) ── */
    if (ehInfinito) {
      const beniMsg = resultado?.isBestScore
        ? 'Novo recorde! Vamos comemorar!'
        : resultado?.encontradas >= 5 ? 'Você encontrou um montão de ovelhinhas!' : 'Cada busca deixa você ainda mais atento!';
      return (
        <View style={styles.root}>
          <Header insets={insets} onBack={() => setTela('entrada')} />
          <ScrollView contentContainerStyle={styles.resultadoScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.painel}>
              <BeniGuideBubble message={beniMsg} avatarVariant="celebrating" tone="purple" compact />
            </View>
            <View style={styles.vitoriaCard}>
              <Text style={styles.destaque}>{milhar(resultado?.score ?? 0)}</Text>
              <Text style={styles.destaqueLabel}>pontos · Infinito</Text>
              {resultado?.isBestScore && (
                <View style={styles.faixaBoa}>
                  <FaithIcon name="trophies" size={16} color="#0E5A3C" />
                  <Text style={styles.faixaBoaText}>Novo recorde!</Text>
                </View>
              )}
              <View style={styles.statsRow3}>
                <Stat label="Ovelhinhas" valor={`${resultado?.encontradas ?? 0}`} />
                <Stat label="Melhor sequência" valor={`${resultado?.sequencia ?? 0}`} />
                <Stat label="Fases perfeitas" valor={`${resultado?.fasesPerfeitas ?? 0}`} />
              </View>
              {melhorPontosInfinito(stats) > 0 && (
                <Text style={styles.recordeAnterior}>Melhor pontuação: {milhar(melhorPontosInfinito(stats))}</Text>
              )}
              {faixaEstrela}
            </View>
            {CTAs}
          </ScrollView>
        </View>
      );
    }

    /* ── Resultado dos modos FINITOS (compacto; CTAs ANTES dos detalhes recolhidos) ── */
    const fases = resultado?.fases ?? [];
    const semDica = fases.filter((f) => !f.comDica && !f.esgotou).length;
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => setTela('entrada')} />
        <ScrollView contentContainerStyle={styles.resultadoScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.painel}>
            <BeniGuideBubble message={OVELHA_BENI.vitoria} avatarVariant="celebrating" tone="purple" compact />
          </View>
          {/* Topo compacto: 3 cards SEPARADOS (rótulos nunca concatenam). */}
          <View style={styles.resumoRow}>
            <ResumoCard icon="ovelha" valor={`${resultado?.encontradas ?? 0}/${resultado?.total ?? dif.rounds}`} label="Encontradas" />
            <ResumoCard icon="star" valor={`${semDica}`} label="Fases sem dica" />
            <ResumoCard icon="trophies" valor={`${resultado?.bestSequencia ?? 0}`} label="Melhor sequência" />
          </View>
          {resultado?.isBest && (
            <View style={styles.faixaBoa}>
              <FaithIcon name="trophies" size={16} color="#0E5A3C" />
              <Text style={styles.faixaBoaText}>Nova melhor sequência!</Text>
            </View>
          )}
          {faixaEstrela}

          {/* CTAs ANTES dos detalhes (o essencial não exige rolar a lista). */}
          {CTAs}

          {/* Detalhes recolhidos por padrão: "Ver detalhes das fases". */}
          {fases.length > 0 && (
            <View style={styles.fasesCard}>
              <Pressable style={styles.fasesHead} onPress={() => setDetalhesFasesAbertos((v) => !v)} accessibilityRole="button">
                <Text style={styles.fasesTitulo}>Ver detalhes das fases</Text>
                <Text style={styles.devSecChevron}>{detalhesFasesAbertos ? '▾' : '▸'}</Text>
              </Pressable>
              {detalhesFasesAbertos && (
                <>
                  {fases.map((f, i) => (<FaseLinha key={i} indice={i + 1} fase={f} />))}
                  <Text style={styles.fasesNota}>O tempo é só para você superar o próprio recorde. As estrelinhas não dependem dele.</Text>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  /* ══════════════ JOGANDO ══════════════ */
  const coberto = lstate.coverVisible;
  return (
    <View style={styles.root}>
      <Header insets={insets} onBack={abandonar} chip={isInternalToolsEnabled() ? 'Em teste' : undefined} criadorAtivo={criadorAtivo} />

      {infinito ? (
        /* HUD do Infinito: Ovelhas · Sequência · Tempo (sem rodada X/Y, sem dificuldade, sem "Procure esta"). */
        <View style={styles.hud}>
          <View style={styles.hudItem}>
            <FaithIcon name="ovelha" size={16} color={pt.textSoft} />
            <Text style={styles.hudText}>Ovelhas {vista.encontradas}</Text>
          </View>
          <View style={styles.hudCentro}>
            <Text style={styles.hudSeq}>Sequência {seqPerfeitaRef.current}</Text>
            <View style={styles.hudPontosRow}>
              <Text style={styles.hudPontos}>{milhar(pontos)} pts</Text>
              {ganhoRecente && <Text style={styles.hudGanho}>+{ganhoRecente.valor}</Text>}
            </View>
          </View>
          <View style={styles.hudDir}>
            <Cronometro
              roundId={seedRef.current}
              limiteMs={INFINITO.SESSAO_MS}
              rodando={rodando}
              encontrada={false}
              getUsadoMs={getSessaoMs}
              onEsgotado={aoEsgotarSessao}
              onTick={aoTickInfinitoFase}
            />
          </View>
        </View>
      ) : (
        /* HUD finito: Fácil/Médio (por fase) e Difícil (relógio da PARTIDA — "Tempo total"). */
        <View style={styles.hud}>
          <View style={styles.hudItem}>
            <FaithIcon name="ovelha" size={16} color={pt.textSoft} />
            <Text style={styles.hudText}>{vista.encontradas} de {vista.rounds}</Text>
          </View>
          <Cronometro
            roundId={partidaGlobal ? seedRef.current : (rodada?.roundId ?? 0)}
            limiteMs={partidaGlobal ? dif.tempoGlobalMs : dif.tempoLimiteMs}
            rodando={rodando}
            encontrada={partidaGlobal ? false : encontrada}
            getUsadoMs={partidaGlobal ? getPartidaMs : getUsadoMs}
            onEsgotado={partidaGlobal ? aoEsgotarPartidaDificil : aoEsgotarTempo}
            formatoMMSS={partidaGlobal}
          />
          <View style={styles.hudDir}>
            <View style={styles.difTag}><Text style={styles.difTagTxt}>{dif.label}</Text></View>
            <Text style={styles.hudRodada} accessibilityLabel={partidaGlobal ? 'Tempo total restante' : undefined}>
              {partidaGlobal ? 'Tempo total' : `Rodada ${rodadaNum}/${vista.rounds}`}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.dicaRow}>
        <Text style={styles.dica} numberOfLines={1}>
          {derrotaDificil ? `O tempo acabou! Você encontrou ${vista.encontradas} de ${vista.rounds} ovelhinhas.`
            : derrotaFase ? MSG_DERROTA
              : marcoBeni ? marcoBeni
                : tempoEsgotadoInf ? 'Tempo!' : mensagem}
        </Text>
      </View>

      {/* [F6.2R2] Quem mede é o retângulo DE DENTRO do respiro, não o de fora.
          `onLayout` entrega a caixa COM padding — e o padding de baixo é justamente
          a faixa do sistema (`insets.bottom`) que a cena não pode ocupar. Medindo o
          filho, `areaRef` passa a guardar o retângulo REALMENTE disponível: viewport,
          contentRect e hitbox continuam derivando dele, agora sem a taskbar dentro. */}
      <View style={[styles.cenaWrap, { paddingBottom: Math.max(insets.bottom, 8) + 4 }]}>
        <View style={styles.cenaMedida} onLayout={medirArea}>
        {/* Pressable-pai = ERRO (toque fora da ovelha). O wrapper da ovelha (dentro do
            SceneLayer) captura o ACERTO e impede que o pai dispare no mesmo toque. */}
        <Pressable
          onPress={aoTocarCena}
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
              retryNonce={lstate.recarga}
              encontrada={vista.fase === FASES.ACERTO}
              dicaNivel={dicaNivel}
              ripple={ripple}
              hitboxMin={dif.hitboxMin}
              debugHitbox={OVELHA_DEBUG_HITBOX}
              criadorAtivo={criadorAtivo}
              mostrarHitbox={mostrarHitbox}
              diag={criadorAtivo ? { dificuldade, sceneId: rodada.sceneId, spotId: rodada.spot.id, zone: rodada.spot.zone, cluster: rodada.spot.cluster, roundId: rodada.roundId, seed: seedRef.current, planId: planIdRef.current, deck: assinaturaDeck(deckStateRef.current, dificuldade), fase: vista.fase, interativo } : null}
              onTocarOvelha={aoTocarOvelha}
              onBgDisplay={onBgDisplay}
              onBgError={onBgError}
              onSheepDisplay={onSheepDisplay}
              onSheepError={onSheepError}
            />
          )}

          {OVELHA_DEBUG_FRAME && <FrameDebug scene={scene} viewport={viewport} />}

          {/* Controle EXCLUSIVO do Modo Criador: liga/desliga o contorno da área clicável. */}
          {criadorAtivo && (
            <SoundButton style={styles.criadorToggle} onPress={() => setMostrarHitbox((v) => !v)} activeOpacity={0.85}>
              <Text style={styles.criadorToggleTxt}>{mostrarHitbox ? '[x]' : '[ ]'} Mostrar área de toque</Text>
            </SoundButton>
          )}

          {/* Capa TÉCNICA discreta (OV3): cobre a cena durante o carregamento, SEM botão. Revela
              sozinha quando as 3 imagens exibem. O preview é só a SONDA de prontidão (pequeno). */}
          {(coberto || coverFading) && (
            <Animated.View
              style={[StyleSheet.absoluteFill, styles.cover, { opacity: coverAnim }]}
              pointerEvents={coberto ? 'auto' : 'none'}
            >
              <CapaTecnica
                roundToken={lstate.roundToken}
                retryNonce={lstate.recarga}
                erro={temErro(lstate)}
                onPreviewDisplay={() => aoExibir('preview', lstate.roundToken)}
                onPreviewError={() => aoErro('preview', lstate.roundToken)}
              />
            </Animated.View>
          )}
        </Pressable>
        </View>
      </View>

      {/* Infinito: "Tempo!" curto antes do resultado (bloqueia toque; sem ajuda automática). */}
      {infinito && tempoEsgotadoInf && (
        <View pointerEvents="none" style={styles.tempoOverlay}>
          <View style={styles.tempoBolha}><Text style={styles.tempoTxt}>Tempo!</Text></View>
        </View>
      )}
    </View>
  );
}

/* ══════════════════════════ SCENE LAYER (cena única, opacidade 1) ══════════════════════════ */

/**
 * Uma cena real: background em retângulo explícito (SEM receber toque) + ovelha FRONTAL num
 * WRAPPER CLICÁVEL (área ≥56×56, acima do bg). O toque no wrapper é o ACERTO; a imagem
 * interna usa pointerEvents="none". Não há clip/peek (pose única frontal). As imagens usam
 * expo-image com recyclingKey estável e onDisplay/onError (prontidão vem do onDisplay).
 */
const SceneLayer = React.memo(function SceneLayer({ round, scene, viewport, retryNonce, encontrada, dicaNivel = 0, ripple, hitboxMin, debugHitbox, criadorAtivo, mostrarHitbox, diag, onTocarOvelha, onBgDisplay, onBgError, onSheepDisplay, onSheepError }) {
  const spot = round.spot;
  const cr = contentRect(scene, viewport);
  const s = cr.scale;
  const centro = artToPx(spot.pos, scene, viewport);
  const sb = spriteBoxArt(spot, scene);
  const spW = sb.w * s;
  const spH = sb.h * s;
  const bg = OVELHA_BG[scene.background?.assetKey];
  const img = OVELHA_POSE_IMG[OVELHA_POSE_JOGO];   // POSE ÚNICA frontal (mesmo asset do card/HUD)
  const aquatico = round.aquatico === true;

  // Retângulo do sprite (px do viewport) e área CLICÁVEL (hitbox px, piso do modo).
  const spriteLeft = cr.x + sb.cx * s - spW / 2;
  const spriteTop = cr.y + sb.cy * s - spH / 2;
  const hb = hitboxPxRect(spot, scene, viewport, hitboxMin);

  const kBg = `background:${round.roundId}:${scene.id}:${retryNonce}`;
  const kSheep = `sheep:${round.roundId}:${scene.id}:${spot.id}:${OVELHA_POSE_JOGO}:${retryNonce}`;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* 0 — background REAL no retângulo explícito (proporção exata da cena → sem cover/zoom).
             NÃO recebe toque: o wrapper da ovelha é quem captura o acerto. */}
      {bg
        ? <ExpoImage
            source={bg}
            pointerEvents="none"
            style={{ position: 'absolute', left: cr.x, top: cr.y, width: cr.w, height: cr.h }}
            contentFit="fill"
            cachePolicy="memory-disk"
            transition={0}
            recyclingKey={kBg}
            onDisplay={onBgDisplay}
            onError={onBgError}
          />
        : <View pointerEvents="none" style={[styles.bgFallback, { position: 'absolute', left: cr.x, top: cr.y, width: cr.w, height: cr.h }]} />}

      {/* DICA nível 1 — REGIÃO ampla (não aponta a resposta). */}
      {dicaNivel >= 1 && <DicaRegiao cx={centro.px} cy={centro.py} viewport={viewport} />}
      {/* DICA nível 2 — brilho/pulso perto da região correta. */}
      {dicaNivel >= 2 && <BrilhoRegiao cx={centro.px} cy={centro.py} r={Math.min(spW, spH) * 0.75} />}
      {/* DICA nível 3 — contorno tracejado em torno da ovelha (dica direta / muitos erros). */}
      {dicaNivel >= 3 && <ContornoVisivel cx={centro.px} cy={centro.py} w={spW} h={spH} />}

      {/* 2 — WRAPPER CLICÁVEL da ovelha (área do modo, acima do bg). Toque aqui = ACERTO. */}
      <Pressable
        onPress={onTocarOvelha}
        hitSlop={8}
        style={{ position: 'absolute', left: hb.x0, top: hb.y0, width: hb.w, height: hb.h, zIndex: 3 }}
        accessibilityRole="button"
        accessibilityLabel="Ovelhinha"
      >
        <View pointerEvents="none" style={{ position: 'absolute', left: spriteLeft - hb.x0, top: spriteTop - hb.y0, width: spW, height: spH }}>
          {/* Fundo do mar: bolha mágica ATRÁS da ovelha frontal (mesmo Pressable, sem nova pose). */}
          {aquatico && <MagicBubble size={Math.max(spW, spH) * 1.32} />}
          <SheepImage spW={spW} spH={spH} img={img} encontrada={encontrada} pulsar={dicaNivel >= 3}
            recyclingKey={kSheep} onDisplay={onSheepDisplay} onError={onSheepError} />
        </View>
      </Pressable>

      {ripple && <TouchRipple key={ripple.key} x={ripple.x} y={ripple.y} />}

      {/* Contorno da área clicável — SÓ no Modo Criador COM o toggle ligado (off por padrão). */}
      {criadorAtivo && mostrarHitbox && (
        <View pointerEvents="none" style={{ position: 'absolute', left: hb.x0, top: hb.y0, width: hb.w, height: hb.h, borderWidth: 2, borderColor: '#7C3AED', borderRadius: 8, zIndex: 6 }} />
      )}
      {/* Diagnóstico discreto do Modo Criador (texto pequeno; não cobre a cena). */}
      {diag && <CriadorDiag diag={diag} />}

      {debugHitbox && <HitboxDebug round={round} scene={scene} viewport={viewport} centro={centro} spW={spW} spH={spH} hb={hb} />}
    </View>
  );
});

/** Ovelha frontal (pose única). Pop no acerto; pulso suave na dica nível 3. */
function SheepImage({ spW, spH, img, encontrada, pulsar, recyclingKey, onDisplay, onError }) {
  const pop = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!encontrada) return undefined;
    const a = Animated.sequence([
      Animated.timing(pop, { toValue: 1.18, duration: 160, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]);
    a.start(); return () => a.stop();
  }, [encontrada, pop]);
  useEffect(() => {
    if (encontrada || !pulsar) return undefined;
    const a = Animated.loop(Animated.sequence([
      Animated.timing(pop, { toValue: 1.14, duration: 380, useNativeDriver: true }),
      Animated.timing(pop, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]));
    a.start(); return () => { a.stop(); pop.setValue(1); };
  }, [pulsar, encontrada, pop]);
  return (
    <Animated.View style={{ width: spW, height: spH, transform: [{ scale: pop }] }}>
      <ExpoImage
        source={img}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
        recyclingKey={recyclingKey}
        onDisplay={onDisplay}
        onError={onError}
        style={{ width: spW, height: spH }}
      />
    </Animated.View>
  );
}

/** Bolha mágica (fundo do mar) — círculo translúcido sutil com brilho; construída em RN. */
function MagicBubble({ size }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 1600, useNativeDriver: true }),
      Animated.timing(p, { toValue: 0, duration: 1600, useNativeDriver: true }),
    ]));
    a.start(); return () => a.stop();
  }, [p]);
  const op = p.interpolate({ inputRange: [0, 1], outputRange: [0.16, 0.28] });
  return (
    <Animated.View pointerEvents="none"
      style={{ position: 'absolute', left: '50%', top: '50%', width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: size / 2, backgroundColor: 'rgba(210,240,255,0.16)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.55)', opacity: op }}
    >
      <View style={{ position: 'absolute', left: size * 0.22, top: size * 0.18, width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1, backgroundColor: 'rgba(255,255,255,0.6)' }} />
    </Animated.View>
  );
}

/** Diagnóstico do Modo Criador (texto discreto): difficulty/sceneId/spotId/roundId/seed/máquina/toque. */
function CriadorDiag({ diag }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 4, left: 6, backgroundColor: 'rgba(124,58,237,0.85)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, zIndex: 6, maxWidth: '92%' }}>
      <Text style={styles.criadorTxt}>{diag.dificuldade} · {diag.sceneId} · {diag.spotId} · {diag.zone} · {diag.cluster}</Text>
      <Text style={styles.criadorTxt}>#{diag.roundId} · seed {diag.seed} · plano {diag.planId} · {diag.fase} · toque {diag.interativo ? 'ON' : 'OFF'}</Text>
      <Text style={styles.criadorTxt}>baralho {diag.deck}</Text>
    </View>
  );
}

/** DICA nível 1 — região ampla (elipse suave grande em torno da área correta, sem apontar). */
function DicaRegiao({ cx, cy, viewport }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.timing(p, { toValue: 0, duration: 1100, useNativeDriver: true }),
    ]));
    a.start(); return () => a.stop();
  }, [p]);
  const rw = Math.min(viewport.w, viewport.h) * 0.42;   // região ampla (não pontual)
  const rh = rw * 0.8;
  const left = clampNum(cx - rw / 2, 0, viewport.w - rw);
  const top = clampNum(cy - rh / 2, 0, viewport.h - rh);
  return (
    <Animated.View pointerEvents="none"
      style={{ position: 'absolute', left, top, width: rw, height: rh, borderRadius: rw / 2, zIndex: 1, backgroundColor: pt.gold, opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.14] }) }}
    />
  );
}
const clampNum = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

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

/* ══════════════════════════ CAPA TÉCNICA + HUD ══════════════════════════ */

/**
 * Capa TÉCNICA (OV3): overlay curto e discreto que cobre a cena durante o carregamento e some
 * SOZINHO (auto-reveal) quando as 3 imagens exibem — SEM botão, SEM alvo grande, SEM revelar a
 * posição. O preview (pequeno, ~44px) é apenas a SONDA de prontidão (dispara onDisplay). Preserva
 * roundId/recyclingKey/onDisplay. Em falha, a tela reagenda o carregamento (buttonless).
 */
function CapaTecnica({ roundToken, retryNonce, erro, onPreviewDisplay, onPreviewError }) {
  const kPreview = `preview:${roundToken}:${OVELHA_POSE_JOGO}:${retryNonce}`;
  return (
    <View style={styles.capaWrap} accessibilityRole="alert">
      <View style={styles.capaPill}>
        <View style={styles.capaSondaBg}>
          <ExpoImage
            source={OVELHA_POSE_IMG[OVELHA_POSE_JOGO]}
            style={styles.capaSonda}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={0}
            recyclingKey={kPreview}
            onDisplay={onPreviewDisplay}
            onError={onPreviewError}
          />
        </View>
        <Text style={styles.capaTxt}>{erro ? 'Ops, recarregando…' : 'Preparando o próximo esconderijo…'}</Text>
      </View>
    </View>
  );
}

/**
 * Cronômetro por fase (OV2). Tica INTERNAMENTE (só re-renderiza a si mesmo → SceneLayer intacto:
 * zero re-render da cena por tick). Deadline monotônico via getUsadoMs() (ms ativos, recomputado
 * do relógio a cada tick — nunca acumulativo). Countdown (Médio/Difícil) mostra o tempo restante
 * e avisa uma única vez ao esgotar; Fácil mostra o tempo só APÓS o acerto.
 */
function Cronometro({ roundId, limiteMs, rodando, encontrada, getUsadoMs, onEsgotado, onTick, formatoMMSS = false }) {
  const [, tick] = useState(0);
  const esgRef = useRef(false);
  const ultimoSegRef = useRef(0);   // OV3R — último segundo já sonorizado (dedup 1×/segundo)
  // Fase/sessão nova (roundId muda): rearma esgotado E o alerta sonoro (começa sem som).
  useEffect(() => { esgRef.current = false; ultimoSegRef.current = 0; }, [roundId]);
  useEffect(() => {
    if (!rodando) return undefined;
    // ÚNICO setInterval do jogo (250ms). Reaproveitado p/ o hint por tempo do Infinito (onTick) e
    // p/ o alerta sonoro de relógio — sem cronômetros paralelos. Deadline monotônico via getUsadoMs.
    const t = setInterval(() => {
      tick((v) => (v + 1) % 1000000);
      if (onTick) onTick();
      if (limiteMs != null) {
        const rem = Math.max(0, limiteMs - getUsadoMs());
        // OV3R — alerta sonoro (mesmo `countdown_tick` dos outros jogos): 1× por SEGUNDO INTEIRO,
        // só com rem>0 && rem<=ALERTA. Nunca toca em zero; nunca mais de 1×/segundo (ultimoSegRef +
        // dedup de 300ms do audioManager). Fora do intervalo/condições → cortado no cleanup.
        if (rem > 0 && rem <= ALERTA_TEMPO_MS) {
          const seg = Math.ceil(rem / 1000);
          if (seg !== ultimoSegRef.current) { ultimoSegRef.current = seg; playGameSfx(COUNTDOWN_TICK); }
        } else if (rem <= 0) {
          stopGameSfx(COUNTDOWN_TICK);   // tempo esgotado: silêncio imediato
        }
        if (!esgRef.current && getUsadoMs() >= limiteMs) {
          esgRef.current = true;
          onEsgotado(roundId);
        }
      }
    }, 250);
    // Sai da busca ativa (acerto/troca/capa/pausa/blur/AppState/resultado/unmount) → interval para
    // E o alerta é cortado. O som de uma fase/sessão nunca vaza para a seguinte.
    return () => { clearInterval(t); stopGameSfx(COUNTDOWN_TICK); };
  }, [rodando, roundId, limiteMs, getUsadoMs, onEsgotado, onTick]);

  const usado = getUsadoMs();
  if (limiteMs == null) {
    if (!encontrada) return <View style={styles.cronoVazio} />;   // Fácil: sem regressiva; tempo só ao achar
    return (
      <View style={styles.cronoPill}>
        <FaithIcon name="timer" size={12} color={pt.greenDeep} />
        <Text style={styles.cronoTxt}>{formatarTempoMs(usado)}</Text>
      </View>
    );
  }
  const restante = Math.max(0, limiteMs - usado);
  const alerta = restante <= ALERTA_TEMPO_MS;   // mesmo limiar do alerta sonoro
  return (
    <View style={[styles.cronoPill, alerta && styles.cronoPillAlerta]}>
      <FaithIcon name="timer" size={12} color={alerta ? '#B4460F' : pt.greenDeep} />
      <Text style={[styles.cronoTxt, alerta && styles.cronoTxtAlerta]}>{formatarTempoMs(restante, true, formatoMMSS)}</Text>
    </View>
  );
}

/** Linha de uma fase no resultado: nº, cenário, tempo e estado (recorde/ajuda/tempo esgotado). */
function FaseLinha({ indice, fase }) {
  const esgotou = !!fase.esgotou;
  const comDica = !!fase.comDica;
  const recorde = !!fase.recorde;
  const tag = esgotou
    ? { txt: 'tempo esgotado', style: styles.faseTagAviso }
    : recorde ? { txt: 'novo recorde!', style: styles.faseTagRecorde }
      : comDica ? { txt: 'com ajuda', style: styles.faseTagNeutra }
        : { txt: 'fase perfeita', style: styles.faseTagBoa };
  return (
    <View style={styles.faseLinha}>
      <View style={styles.faseNumBolha}><Text style={styles.faseNumTxt}>{indice}</Text></View>
      <View style={styles.faseMeio}>
        <Text style={styles.faseCena} numberOfLines={1}>{nomeCena(fase.sceneId)}</Text>
        <View style={[styles.faseTag, tag.style]}><Text style={styles.faseTagTxt}>{tag.txt}</Text></View>
      </View>
      <Text style={styles.faseTempo}>{formatarTempoMs(fase.ms)}</Text>
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
function HitboxDebug({ round, centro, spW, spH, hb }) {
  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', left: centro.px - spW / 2, top: centro.py - spH / 2, width: spW, height: spH, borderWidth: 1, borderColor: '#3B82F6', zIndex: 6 }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: hb.x0, top: hb.y0, width: hb.w, height: hb.h, borderWidth: 1.5, borderColor: '#0E9F6E', zIndex: 6 }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 4, left: 6, zIndex: 6 }}>
        <Text style={styles.debugTxt}>{round.sceneId} · {round.spot.id} · {round.pose} · e{round.spot.escala} · {round.modo}</Text>
      </View>
    </>
  );
}

/* ══════════════════════════ PEÇAS ══════════════════════════ */

function Header({ insets, onBack, chip, criadorAtivo }) {
  // A faixa "MODO CRIADOR ATIVO" (CreatorModeBanner) é um overlay fixo: altura = safe-area do topo
  // + a faixa (texto ~14 + paddingBottom 3 ≈ 20). Quando ativa, o cabeçalho RESERVA essa altura
  // (+ folga) para o título/voltar nunca ficarem cobertos — sem offset específico por aparelho.
  const bannerH = Math.max(insets.top, 4) + 20;
  const topo = criadorAtivo ? bannerH + 8 : Math.max(insets.top, 10);
  return (
    <LinearGradient colors={['#EAF7EF', '#DDF0E6', '#E8F6EF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: topo }]}>
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

/** Card compacto do resumo (resultado finito): ícone + valor + rótulo, SEMPRE separado (nunca concatena). */
function ResumoCard({ icon, valor, label }) {
  return (
    <View style={styles.resumoCard}>
      <FaithIcon name={icon} size={16} color={pt.greenDeep} />
      <Text style={styles.resumoValor}>{valor}</Text>
      <Text style={styles.resumoLabel} numberOfLines={2}>{label}</Text>
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
  difLabel: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.textSoft, marginTop: 14, marginBottom: 6, marginLeft: 2 },
  difRow: { flexDirection: 'row', gap: 8 },
  difChip: { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRadius: radii.lg, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#DCE6E0', ...shadows.soft },
  difChipSel: { borderColor: pt.greenDeep, backgroundColor: '#EAF7EF', borderWidth: 2 },
  difChipCheck: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: pt.greenDeep, alignItems: 'center', justifyContent: 'center' },
  difChipTitulo: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.textSoft },
  difChipTituloSel: { color: pt.greenDeep },
  difChipRodadas: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.textSoft, marginTop: 1 },
  difChipRodadasSel: { color: '#0E5A3C' },
  difChipMeta: { fontFamily: 'Nunito', fontSize: 10, fontWeight: '700', color: pt.textSoft, marginTop: 2, textAlign: 'center' },
  difChipMetaSel: { color: '#0E5A3C' },
  btnPrimario: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 16, backgroundColor: pt.greenDeep, borderRadius: radii.lg, paddingVertical: 15, alignItems: 'center', ...shadows.card },
  btnPrimarioText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
  btnSecundario: { marginTop: 10, paddingVertical: 12, alignItems: 'center', borderRadius: radii.lg, borderWidth: 1.5, borderColor: pt.greenDeep, backgroundColor: '#FFF' },
  btnSecundarioText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.greenDeep },
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
  hudRetratoImg: { width: 54, height: 54, borderRadius: 14, backgroundColor: '#EAF7EF', borderWidth: 1.5, borderColor: '#CDEBD9', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  hudSheep: { width: 46, height: 46 },
  hudRetratoLabel: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.text, marginTop: 2 },
  hudDir: { minWidth: 66, alignItems: 'flex-end', gap: 2 },
  hudRodada: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft, textAlign: 'right' },
  difTag: { backgroundColor: '#EAF7EF', borderRadius: radii.pill, borderWidth: 1, borderColor: '#CDEBD9', paddingHorizontal: 8, paddingVertical: 2 },
  difTagTxt: { fontFamily: 'Nunito', fontSize: 10, fontWeight: '800', color: pt.greenDeep },
  criadorTxt: { fontFamily: 'Nunito', fontSize: 9, fontWeight: '800', color: '#FFF' },
  dicaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 26, marginTop: 1, paddingHorizontal: 12 },
  dica: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', lineHeight: 22, flexShrink: 1 },
  // Cronômetro por fase (HUD discreto; nunca cobre a cena).
  cronoPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EAF7EF', borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: '#CDEBD9', minWidth: 52, justifyContent: 'center' },
  cronoPillAlerta: { backgroundColor: '#FCE9DF', borderColor: '#F1B79A' },
  cronoTxt: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.greenDeep, fontVariant: ['tabular-nums'] },
  cronoTxtAlerta: { color: '#B4460F' },
  cronoVazio: { minWidth: 52 },
  criadorToggle: { position: 'absolute', bottom: 6, alignSelf: 'center', backgroundColor: 'rgba(124,58,237,0.9)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 5, zIndex: 9 },
  criadorToggleTxt: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: '#FFF' },

  cenaWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingTop: 4 },
  cenaMedida: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
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

  // ── Apresentação diária ──
  apreCard: { marginTop: 12, backgroundColor: '#FFF', borderRadius: radii.xl, paddingVertical: 18, paddingHorizontal: 16, alignItems: 'center', ...shadows.card, borderWidth: 1.5, borderColor: '#CDEBD9' },
  apreTitulo: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.text, textAlign: 'center' },
  apreSheepBg: { width: 168, height: 168, borderRadius: 28, backgroundColor: '#F3FBF6', borderWidth: 1, borderColor: '#DDEFE4', alignItems: 'center', justifyContent: 'center', marginVertical: 14 },
  apreSheep: { width: 146, height: 146 },
  apreFrase: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19, textAlign: 'center' },
  apreInfoRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 },
  apreInfoPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EAF7EF', borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 6, borderWidth: 1, borderColor: '#CDEBD9' },
  apreInfoTxt: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#0E5A3C' },

  // ── Resultado (rolável) + tempos por fase ──
  resultadoScroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  fasesCard: { marginTop: 12, backgroundColor: '#FFF', borderRadius: radii.xl, paddingVertical: 14, paddingHorizontal: 14, ...shadows.card },
  fasesTitulo: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 8 },
  fasesNota: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, lineHeight: 16, marginTop: 8 },
  faseLinha: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderTopWidth: 1, borderTopColor: '#EEF3F0' },
  faseNumBolha: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#EAF7EF', borderWidth: 1, borderColor: '#CDEBD9', alignItems: 'center', justifyContent: 'center' },
  faseNumTxt: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.greenDeep },
  faseMeio: { flex: 1 },
  faseCena: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.text },
  faseTag: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  faseTagTxt: { fontFamily: 'Nunito', fontSize: 10, fontWeight: '800', color: '#4B4B4B' },
  faseTagBoa: { backgroundColor: '#DDF3E7' },
  faseTagRecorde: { backgroundColor: pt.goldSoft },
  faseTagNeutra: { backgroundColor: '#EEF1F4' },
  faseTagAviso: { backgroundColor: '#FCE9DF' },
  faseTempo: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, fontVariant: ['tabular-nums'] },

  /* ══════════ OV3 — Entrada vertical + hero + CTA rodapé ══════════ */
  entradaScroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F3FBF6', borderRadius: radii.xl, borderWidth: 1.5, borderColor: '#CDEBD9', padding: 12, ...shadows.card },
  heroSheepBg: { width: 76, height: 76, borderRadius: 20, backgroundColor: '#EAF7EF', borderWidth: 1, borderColor: '#DDEFE4', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroSheep: { width: 64, height: 64 },
  heroTexto: { flex: 1 },
  heroTitulo: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.text },
  heroFrase: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 18, marginTop: 3 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: '#FFF', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 9, ...shadows.soft },
  statusText: { flex: 1, fontFamily: 'Nunito', fontSize: 12.5, color: pt.text, fontWeight: '700' },
  modoCard: { marginTop: 10, backgroundColor: '#FFF', borderRadius: radii.lg, borderWidth: 1.5, borderColor: '#DCE6E0', paddingVertical: 12, paddingHorizontal: 14, ...shadows.soft },
  modoCardSel: { borderColor: pt.greenDeep, borderWidth: 2, backgroundColor: '#EAF7EF' },
  modoCardInf: { borderColor: '#B9A6E8', backgroundColor: '#F6F2FE' },
  modoCardInfSel: { borderColor: '#7C3AED', backgroundColor: '#EFE7FD' },
  modoCardTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modoTitulo: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.textSoft },
  modoTituloSel: { color: pt.greenDeep },
  modoCheck: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  modoCheckOn: { backgroundColor: pt.greenDeep },
  modoCheckOff: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#CBD5C9' },
  modoDesc: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.text, marginTop: 2 },
  modoMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  modoTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F3', borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 4 },
  modoTagTxt: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.textSoft },
  modoRecorde: { fontFamily: 'Nunito', fontSize: 11.5, fontWeight: '800', color: pt.greenDeep, marginTop: 8 },
  devSec: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#E7ECE9', paddingTop: 8 },
  devSecHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  devSecTitulo: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#94A3B8' },
  devSecChevron: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: '#94A3B8' },
  ctaBar: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: pt.background, borderTopWidth: 1, borderTopColor: '#EAF0EC' },
  btnPrimarioOff: { backgroundColor: '#DCE6E0' },
  btnPrimarioOffText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#6B837A' },

  /* ══════════ OV3 — HUD Infinito + capa técnica + "Tempo!" ══════════ */
  hudCentro: { alignItems: 'center', flex: 1 },
  hudSeq: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.textSoft },
  hudPontosRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  hudPontos: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, fontVariant: ['tabular-nums'] },
  hudGanho: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.greenDeep },
  capaWrap: { alignItems: 'center', justifyContent: 'center' },
  capaPill: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: '#CDEBD9', ...shadows.soft },
  capaSondaBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3FBF6', borderWidth: 1, borderColor: '#DDEFE4', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  capaSonda: { width: 34, height: 34 },
  capaTxt: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft },
  tempoOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  tempoBolha: { backgroundColor: 'rgba(20,40,30,0.86)', borderRadius: radii.xl, paddingHorizontal: 30, paddingVertical: 16 },
  tempoTxt: { fontFamily: 'FredokaOne', fontSize: 30, color: '#FFF' },

  /* ══════════ OV3 — Resultado (resumo em 3 cards + detalhes recolhidos) ══════════ */
  statsRow3: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-around', marginTop: 6 },
  recordeAnterior: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.textSoft, marginTop: 12 },
  resultadoTitulo: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center', marginBottom: 6 },
  resumoRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  resumoCard: { flex: 1, alignItems: 'center', backgroundColor: '#FFF', borderRadius: radii.lg, paddingVertical: 12, paddingHorizontal: 6, ...shadows.soft },
  resumoValor: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.text, marginTop: 4 },
  resumoLabel: { fontFamily: 'Nunito', fontSize: 10.5, fontWeight: '800', color: pt.textSoft, textAlign: 'center', marginTop: 1 },
  fasesHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
