import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import SoundButton from './SoundButton';
import { colors } from '../theme/colors';

export default function AudioPlayer({ audioAsset, onFinished, paused }) {
  if (!audioAsset) return null;
  return <AudioPlayerInner audioAsset={audioAsset} onFinished={onFinished} paused={paused} />;
}

function AudioPlayerInner({ audioAsset, onFinished, paused }) {
  const player = useAudioPlayer(audioAsset, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const [appStatus, setAppStatus] = useState('idle');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);
  // Prevents onFinished from firing more than once per playback — guards against
  // expo-audio emitting didJustFinish on multiple consecutive status updates.
  const finishedCalledRef = useRef(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
    }).catch(e => console.warn('AudioPlayer: setAudioModeAsync failed', e));
  }, []);

  // Reset guard when a new audio asset is provided (scene change).
  useEffect(() => {
    finishedCalledRef.current = false;
  }, [audioAsset]);

  // Real end-of-audio detection via expo-audio status — no timers, no simulation.
  useEffect(() => {
    if (status.didJustFinish && !finishedCalledRef.current) {
      finishedCalledRef.current = true;
      setAppStatus('done');
      onFinished?.();
    }
  }, [status.didJustFinish]);

  // Sync with external paused prop so the parent (e.g. StoryBookScreen) can
  // pause/resume without duplicating play controls.
  useEffect(() => {
    if (paused === undefined) return;
    if (paused && appStatus === 'playing') {
      player.pause();
      setAppStatus('paused');
    } else if (!paused && appStatus === 'paused') {
      player.play();
      setAppStatus('playing');
    }
  }, [paused]);

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
    player.play();
    setAppStatus(status.isLoaded ? 'playing' : 'loading');
  }

  function handlePause() {
    if (appStatus !== 'playing') return;
    player.pause();
    setAppStatus('paused');
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
    if (isError) return 'Erro ao carregar — tente novamente';
    if (isPlaying) return 'Ouvindo a história...';
    if (isDone) return 'Você ouviu! ✓';
    if (appStatus === 'paused') return 'Pausado — toque para continuar';
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
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FF6B35',
    justifyContent: 'center', alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 6,
  },
  playBtnActive: { backgroundColor: colors.secondary, shadowColor: colors.secondary },
  playBtnDone: { backgroundColor: colors.success, shadowColor: colors.success },
  playBtnError: { backgroundColor: '#9E9E9E', shadowColor: '#9E9E9E' },
  playBtnText: { fontSize: 28, color: '#FFF' },
  textArea: { flex: 1 },
  label: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.text,
    marginBottom: 8, fontWeight: '700',
  },
  progressBar: {
    height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: '#FF6B35', borderRadius: 4,
  },
  replayBtn: { padding: 8 },
  replayText: { fontSize: 22 },
});
