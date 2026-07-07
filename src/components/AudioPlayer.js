import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, AppState } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import SoundButton from './SoundButton';
import { onNarrationStart, onNarrationEnd } from '../services/audioManager';
import { colors } from '../theme/colors';
import { colors as pt } from '../theme/productTheme';

// LIVRINHO_FIX_1 — rede de segurança do autoplay do Livrinho. Bug observado: o áudio entra em
// "playing" (otimista) mas currentTime NÃO progride e didJustFinish nunca dispara → a cena não
// avança. Watchdog de INÍCIO (baseado SÓ em currentTime — não em playing/timeControlStatus, que
// mentem no bug) re-tenta play() de forma LIMITADA; ao esgotar → estado de erro (retry manual),
// SEM chamar onFinished. Backstop de FINALIZAÇÃO só avança quando o áudio REALMENTE chegou ao fim
// (duration>0 + near-end) — nunca pula narração não ouvida. onFinished continua o ÚNICO avanço.
const WATCHDOG_WINDOW_MS = 1500;      // janela p/ currentTime avançar após play()
const MIN_PROGRESS_DELTA_S = 0.15;    // avanço mínimo p/ considerar "progrediu"
const MAX_START_RETRIES = 2;          // tentativas de retry (bounded; sem loop)
const SEEK_RESET_THRESHOLD_S = 0.3;   // só seekTo(0) se claramente no início
const FINISH_EPSILON_S = 0.35;        // currentTime >= duration - ε = efetivamente terminou
const FINISH_GRACE_MS = 500;          // sustentar near-end antes do backstop

/** PURO: o áudio progrediu >= minDelta entre duas amostras de currentTime? (sem I/O) */
function hasAudioProgressed(prevSec, currSec, minDeltaSec) {
  return Number.isFinite(prevSec) && Number.isFinite(currSec) && (currSec - prevSec) >= minDeltaSec;
}
/** PURO: currentTime chegou perto do fim? Exige duration conhecida (>0). Sem teto cego. */
function isAudioNearEnd(currentTimeSec, durationSec, epsilonSec) {
  return durationSec > 0 && Number.isFinite(currentTimeSec) && currentTimeSec >= (durationSec - epsilonSec);
}

export default function AudioPlayer({ audioAsset, onFinished, paused, autoPlay = false, onPlayStart, onUserPause }) {
  if (!audioAsset) return null;
  return (
    <AudioPlayerInner
      audioAsset={audioAsset}
      onFinished={onFinished}
      paused={paused}
      autoPlay={autoPlay}
      onPlayStart={onPlayStart}
      onUserPause={onUserPause}
    />
  );
}

function AudioPlayerInner({ audioAsset, onFinished, paused, autoPlay, onPlayStart, onUserPause }) {
  const player = useAudioPlayer(audioAsset, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const [appStatus, setAppStatus] = useState('idle');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);
  // Prevents onFinished from firing more than once per playback — guards against
  // expo-audio emitting didJustFinish on multiple consecutive status updates.
  const finishedCalledRef = useRef(false);
  // Auto-play (Livrinho contínuo): inicia UMA vez por montagem quando autoPlay
  // está ligado e não está pausado. Opt-in — callers sem autoPlay (NarrationScreen)
  // seguem manuais. didJustFinish/done NÃO disparam onUserPause (só o botão pausa).
  const autoStartedRef = useRef(false);
  // F2.4e.5pR: marca que a pausa foi imposta pelo lifecycle (background) — usado p/
  // REFORÇAR a pausa ao voltar ao foreground e anular um auto-resume nativo.
  const pausedByLifecycleRef = useRef(false);
  // LIVRINHO_FIX_1 — watchdog de reprodução: contagem de retries, timer, espelho do status.
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const watchdogTimerRef = useRef(null);
  const statusRef = useRef(status);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
    }).catch(e => { if (__DEV__) console.warn('AudioPlayer: setAudioModeAsync failed', e); });
  }, []);

  // Reset guard when a new audio asset is provided (scene change).
  useEffect(() => {
    finishedCalledRef.current = false;
    retryCountRef.current = 0; // LIVRINHO_FIX_1: novo asset → novo ciclo de retries
  }, [audioAsset]);

  // LIVRINHO_FIX_1: espelha o status mais recente p/ os watchdogs lerem sem closure obsoleto;
  // mountedRef evita setState/retry após desmontar (troca de cena por key, saída da tela).
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // Auto-start da narração no Livrinho contínuo (Livrinho 1.1): toca SOZINHO, mas
  // SÓ depois que o asset da cena CARREGOU (status.isLoaded). A causa do autoplay
  // intermitente do 1.0 era chamar player.play() antes do load do novo asset: em
  // alguns remounts era no-op e a cena ficava "tocando" muda, sem didJustFinish,
  // exigindo Play de novo. Esperar o load torna o play determinístico por cena.
  // autoStartedRef garante UMA vez por montagem; toque manual também marca a flag.
  useEffect(() => {
    if (!autoPlay || paused) return;
    if (autoStartedRef.current) return;
    if (!status.isLoaded) return; // espera carregar — corrige autoplay intermitente
    autoStartedRef.current = true;
    player.play();
    setAppStatus('playing');
    if (__DEV__) console.log('[AudioPlayer] auto-start (asset loaded) → play');
    onPlayStart?.();
  }, [autoPlay, paused, status.isLoaded]);

  // ── Coordenação com a música de fundo (Bloco 5) ──
  // Regra: a música NUNCA se sobrepõe à narração. Ao tocar a narração, a música
  // pausa; ao sair do player (desmontar a tela de narração), a música retoma
  // apenas se musicEnabled estiver ligado. Hoje é no-op (música default off),
  // mas garante a regra sem reescrever o pipeline de narração.
  useEffect(() => {
    if (appStatus === 'playing') onNarrationStart();
  }, [appStatus]);

  // F2.4e.5p: ao DESMONTAR (sair da tela, troca de cena por key, blur), PARA o player —
  // nunca deixa áudio tocando fora da tela. Defensivo (try/catch: o player pode já ter sido
  // liberado). Não altera play/pause/replay/autoplay; só garante o stop no fim de vida.
  useEffect(() => () => {
    try { player.pause(); } catch { /* player já liberado */ }
    onNarrationEnd();
  }, []);

  // Real end-of-audio detection via expo-audio status — no timers, no simulation.
  useEffect(() => {
    if (status.didJustFinish && !finishedCalledRef.current) {
      finishedCalledRef.current = true;
      setAppStatus('done');
      onFinished?.();
    }
  }, [status.didJustFinish]);

  // LIVRINHO_FIX_1 — WATCHDOG DE INÍCIO (rolling): enquanto deveria estar tocando, garante que
  // currentTime PROGRIDE. Critério de stall = SÓ currentTime (não usa playing/timeControlStatus).
  // Buffering NÃO conta (espera legítima). Stall → retry LIMITADO (player.play(); seekTo(0) só se
  // no início); ao ESGOTAR → limpa o timer, NÃO reagenda, NÃO chama onFinished → setAppStatus('error').
  // Arma ao entrar em 'playing' (deps SEM currentTime → não re-arma a cada tick); auto-agenda.
  useEffect(() => {
    if (!autoPlay || paused || appStatus !== 'playing' || !status.isLoaded) return undefined;
    let cancelled = false;
    let lastCheck = statusRef.current.currentTime;
    const schedule = () => { watchdogTimerRef.current = setTimeout(tick, WATCHDOG_WINDOW_MS); };
    function tick() {
      if (cancelled || !mountedRef.current) return;
      const s = statusRef.current;
      if (paused || s.isBuffering) { lastCheck = s.currentTime; schedule(); return; } // espera legítima
      if (hasAudioProgressed(lastCheck, s.currentTime, MIN_PROGRESS_DELTA_S)) {
        retryCountRef.current = 0; lastCheck = s.currentTime; schedule(); return;       // saudável
      }
      // STALL confirmado (currentTime parado, não-buffering):
      if (retryCountRef.current < MAX_START_RETRIES) {
        retryCountRef.current += 1;
        try { if (s.currentTime < SEEK_RESET_THRESHOLD_S) player.seekTo(0); player.play(); } catch { /* player liberado */ }
        lastCheck = s.currentTime; schedule();
      } else {
        if (watchdogTimerRef.current) { clearTimeout(watchdogTimerRef.current); watchdogTimerRef.current = null; }
        setAppStatus('error'); // esgotou: sem reagendar, sem onFinished → erro + retry manual
      }
    }
    schedule();
    return () => {
      cancelled = true;
      if (watchdogTimerRef.current) { clearTimeout(watchdogTimerRef.current); watchdogTimerRef.current = null; }
    };
  }, [autoPlay, paused, appStatus, status.isLoaded]);

  // LIVRINHO_FIX_1 — BACKSTOP DE FINALIZAÇÃO: rede p/ áudio que TOCOU até o fim mas cujo
  // didJustFinish não veio. SÓ avança com prova de que foi OUVIDO: duration>0 E currentTime
  // near-end (isAudioNearEnd). SEM teto cego de tempo → nunca pula narração não ouvida. Passa
  // pelo MESMO finishedCalledRef (uma vez). Se duration desconhecida / sem progresso → não avança.
  useEffect(() => {
    if (finishedCalledRef.current || paused) return undefined;
    if (!isAudioNearEnd(status.currentTime, status.duration, FINISH_EPSILON_S)) return undefined;
    const t = setTimeout(() => {
      const s = statusRef.current;
      if (!finishedCalledRef.current && !paused
          && isAudioNearEnd(s.currentTime, s.duration, FINISH_EPSILON_S) && !s.didJustFinish) {
        finishedCalledRef.current = true;
        setAppStatus('done');
        onFinished?.();
      }
    }, FINISH_GRACE_MS);
    return () => clearTimeout(t);
  }, [status.currentTime, status.duration, paused]);

  // Sync with external paused prop so the parent (e.g. StoryBookScreen) can
  // pause/resume without duplicating play controls.
  // F2.4e.5pR: pausa também quando o áudio ainda está CARREGANDO ('loading'). Antes só
  // pausava em 'playing' — um áudio que começou durante o load ESCAPAVA ao perder o foco
  // ou ir para background (áudio no mapa). Nunca inicia a partir de 'idle'/'done' (não
  // toca sozinho sem Play); retoma somente de 'paused'.
  useEffect(() => {
    if (paused === undefined) return;
    if (paused) {
      if (appStatus === 'playing' || appStatus === 'loading') {
        player.pause();
        setAppStatus('paused');
      }
    } else if (appStatus === 'paused') {
      player.play();
      setAppStatus('playing');
    }
  }, [paused]);

  // F2.4e.5pR — background/lock: a narração NÃO pode continuar quando o app sai de
  // foreground e NÃO pode retomar sozinha ao voltar. Reage a 'background' (app fora):
  // para o player e marca a pausa por lifecycle; ao voltar a 'active', REFORÇA a pausa
  // (anula um eventual auto-resume nativo pós-background — ex.: fim de interrupção).
  // 'inactive' transitório é ignorado (não corta a história por Central de Controle /
  // banner de notificação / Face ID). Nunca retoma sozinho — a criança toca Play.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background') {
        pausedByLifecycleRef.current = true;
        try { player.pause(); } catch { /* player já liberado */ }
        setAppStatus(s => (s === 'playing' || s === 'loading') ? 'paused' : s);
      } else if (next === 'active' && pausedByLifecycleRef.current) {
        pausedByLifecycleRef.current = false;
        try { player.pause(); } catch { /* player já liberado */ } // NÃO retoma sozinho
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (appStatus === 'loading' && status.isLoaded) {
      setAppStatus('playing');
    }
  }, [appStatus, status.isLoaded]);

  useEffect(() => {
    if (appStatus === 'idle') {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseLoop.current = null;
      pulseAnim.setValue(1);
    }
    return () => {
      pulseLoop.current?.stop();
      pulseLoop.current = null;
    };
  }, [appStatus]);

  function handlePlay() {
    if (appStatus === 'loading') return;
    retryCountRef.current = 0; // LIVRINHO_FIX_1: retry manual = novo ciclo limpo (e sai de 'error')
    autoStartedRef.current = true; // toque manual já conta como início (sem auto-start duplo)
    if (statusRef.current.currentTime < SEEK_RESET_THRESHOLD_S) { try { player.seekTo(0); } catch { /* player liberado */ } }
    player.play();
    setAppStatus(status.isLoaded ? 'playing' : 'loading');
    onPlayStart?.(); // entra/retoma o modo de reprodução contínua no pai
  }

  function handlePause() {
    if (appStatus !== 'playing') return;
    player.pause();
    setAppStatus('paused');
    onUserPause?.(); // pausa MANUAL → o pai interrompe o autoplay até novo Play
  }

  async function handleReplay() {
    setAppStatus('playing');
    await player.seekTo(0);
    player.play();
  }

  const progress = status.duration > 0
    ? Math.min((status.currentTime / status.duration) * 100, 100)
    : 0;

  const isPlaying = appStatus === 'playing';
  const isLoading = appStatus === 'loading';
  const isDone = appStatus === 'done';
  const isError = appStatus === 'error';
  const showReplay = isDone || appStatus === 'paused' || isPlaying;

  function getLabel() {
    if (isLoading) return 'Carregando...';
    if (isError) return 'Erro ao carregar. Toque para tentar de novo';
    if (isPlaying) return 'Ouvindo a história...';
    if (isDone) return 'Você ouviu! ✓';
    if (appStatus === 'paused') return 'Pausado. Toque para continuar';
    return 'Toque para ouvir a história!';
  }

  function getIcon() {
    if (isLoading) return '⏳';
    if (isDone) return '✓';
    if (isPlaying) return '⏸';
    return '▶';
  }

  function getPlayBtnStyle() {
    if (isPlaying) return [styles.playBtn, styles.playBtnActive];
    if (isDone) return [styles.playBtn, styles.playBtnDone];
    if (isError) return [styles.playBtn, styles.playBtnError];
    return [styles.playBtn];
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Animated.View style={{ transform: [{ scale: appStatus === 'idle' ? pulseAnim : 1 }] }}>
          <SoundButton
            style={getPlayBtnStyle()}
            onPress={isPlaying ? handlePause : handlePlay}
            disabled={isLoading}
            activeOpacity={isLoading ? 1 : 0.8}
            accessibilityLabel={isPlaying ? 'Pausar narração' : isDone ? 'Narração concluída' : 'Ouvir narração'}
            accessibilityRole="button"
            accessibilityHint={isPlaying ? 'Toque para pausar' : isDone ? '' : 'Toque para ouvir a história'}
          >
            <Text style={styles.playBtnText}>{getIcon()}</Text>
          </SoundButton>
        </Animated.View>

        <View style={styles.textArea}>
          <Text style={styles.label}>{getLabel()}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {showReplay && (
          <SoundButton
            style={styles.replayBtn}
            onPress={handleReplay}
            accessibilityLabel="Ouvir novamente"
            accessibilityRole="button"
          >
            <Text style={styles.replayText}>🔄</Text>
          </SoundButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: pt.faithBlueSoft,
    borderRadius: 22,
    marginVertical: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(43,91,161,0.18)',
    elevation: 3,
    shadowColor: pt.faithBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  playBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: pt.faithBlue,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6,
    shadowColor: pt.faithBlueDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 6,
  },
  playBtnActive: { backgroundColor: pt.faithBlueDeep, shadowColor: pt.faithBlueDeep },
  playBtnDone: { backgroundColor: pt.greenDeep, shadowColor: pt.greenDeep },
  playBtnError: { backgroundColor: '#9E9E9E', shadowColor: '#9E9E9E' },
  playBtnText: { fontSize: 28, color: '#FFF' },
  textArea: { flex: 1 },
  label: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.faithBlueDeep,
    marginBottom: 8, fontWeight: '800',
  },
  progressBar: {
    height: 8, backgroundColor: 'rgba(43,91,161,0.16)', borderRadius: 4, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: pt.faithBlue, borderRadius: 4,
  },
  replayBtn: { padding: 8 },
  replayText: { fontSize: 22 },
});
