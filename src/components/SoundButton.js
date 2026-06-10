import React, { useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { playUiSound } from '../services/audioManager';

/**
 * SoundButton — botão com som de toque sutil, controlado pelo AudioManager
 * central (respeita a preferência "Sons de botões" da Área dos Pais).
 *
 * Props de áudio:
 *   silent     — não toca som (use em ações de ALTA repetição: paleta de cores,
 *                tamanho de pincel, ferramentas do Ateliê, etc.).
 *   soundType  — 'tap' (padrão) | 'success' | 'reward'.
 */
export default function SoundButton({
  onPress, children, style, activeOpacity = 0.8, disabled,
  silent = false, soundType = 'tap', ...rest
}) {
  const busy = useRef(false);

  function handlePress(...args) {
    if (busy.current) return;
    busy.current = true;
    setTimeout(() => { busy.current = false; }, 500);
    if (!silent) playUiSound(soundType);
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
