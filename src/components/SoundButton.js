import React, { useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

let popPlayer = null;
let audioReady = false;

async function initAudio() {
  if (audioReady) return;
  audioReady = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
    });
    popPlayer = createAudioPlayer(require('../../assets/audio/pop.wav'), {
      keepAudioSessionActive: true,
    });
    popPlayer.volume = 0.7;
  } catch (e) {
    audioReady = false;
  }
}

initAudio();

async function playPop() {
  if (!popPlayer) {
    await initAudio();
    if (!popPlayer) return;
  }
  try {
    await popPlayer.seekTo(0);
    popPlayer.play();
  } catch (e) {
    // som falhou silenciosamente — app continua funcionando
  }
}

export default function SoundButton({ onPress, children, style, activeOpacity = 0.8, disabled, ...rest }) {
  const busy = useRef(false);

  function handlePress(...args) {
    if (busy.current) return;
    busy.current = true;
    setTimeout(() => { busy.current = false; }, 500);
    playPop();
    if (onPress) onPress(...args);
  }

  return (
    <TouchableOpacity
      style={style}
      onPress={disabled ? undefined : handlePress}
      activeOpacity={activeOpacity}
      disabled={disabled}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
}
