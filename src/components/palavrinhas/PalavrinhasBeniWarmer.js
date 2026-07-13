/**
 * PalavrinhasBeniWarmer — aquecedor de DECODIFICAÇÃO das poses do Beni (P4R8).
 *
 * Montado na BrincarScreen e no jogo. Usa `Image` do react-native com `source` estático de
 * BENI_IMAGES e dimensões NUMÉRICAS (portrait ~128, event ~210), fora da área visível (offscreen +
 * opacity 0), `pointerEvents="none"`, SEM `display:none` e SEM width/height zero. Ao decodificar,
 * `onLoadEnd` alimenta o cache compartilhado (`beniAssetWarmup`). Permanece montado durante a sessão.
 */
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { BENI_IMAGES, BENI_POSE_KEYS } from '../../assets/mascot/beniImages';
import { marcarProntaPortrait, marcarProntaEvent, marcarErro } from '../../services/beniAssetWarmup';

/**
 * Pool PERMANENTE de decodificação: DUAS Images fixas por pose (portrait 128, event 220). Uma Image
 * por (pose, apresentação); source estático; nunca troca de source; nunca desmonta; offscreen +
 * opacity 0 (NUNCA display:none, NUNCA 0×0). onLoadEnd de cada tamanho → readyPortrait/readyEvent.
 */
export default function PalavrinhasBeniWarmer() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {BENI_POSE_KEYS.map((pose) => (
        <View key={pose} style={styles.linha}>
          <Image source={BENI_IMAGES[pose]} resizeMode="cover" fadeDuration={0} style={styles.portrait}
            onLoadEnd={() => marcarProntaPortrait(pose)} onError={() => marcarErro(pose)} />
          <Image source={BENI_IMAGES[pose]} resizeMode="cover" fadeDuration={0} style={styles.event}
            onLoadEnd={() => marcarProntaEvent(pose)} onError={() => marcarErro(pose)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: -9999, top: -9999, width: 360, height: 4, opacity: 0, overflow: 'hidden' },
  linha: { flexDirection: 'row' },
  portrait: { width: 128, height: 128 },
  event: { width: 220, height: 220 },
});
