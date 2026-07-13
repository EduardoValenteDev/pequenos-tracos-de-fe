/**
 * PalavrinhasBeniWarmer — aquecedor de DECODIFICAÇÃO CANÔNICA das poses do Beni (PERF1).
 *
 * Montado na BrincarScreen e no jogo. Mantém UMA Image canônica por pose (11 no total, não 22):
 * `source` estático de BENI_IMAGES, dimensões NUMÉRICAS iguais a `BENI_CANON` e `resizeMode="cover"`
 * — EXATAMENTE a mesma chave de cache nativo usada pelo BeniStageCharacter visível. Assim a
 * decodificação é ÚNICA por pose e reusada por retrato e overlays.
 *
 * Carregamento CONTROLADO (sem timeout): admite as poses em ORDEM_CANON (inicial → mínimas →
 * restantes), começando com no máximo `CONCORRENCIA_WARMUP` simultâneas e avançando a fila a cada
 * `onLoadEnd`/`onError`. Uma vez admitida, a Image permanece MONTADA durante toda a sessão
 * (retenção do bitmap; offscreen + opacity 0, nunca display:none, nunca 0×0).
 */
import React, { useCallback, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
// P4.3: warmer de OVERLAYS usa o mapa OTIMIZADO (o portrait agora é o PalavrinhasBeniPortraitStack).
import { BENI_PALAVRINHAS_IMAGES as BENI_IMAGES } from '../../assets/mascot/beniPalavrinhasImages';
import { BENI_CANON, CONCORRENCIA_WARMUP, ORDEM_CANON, marcarProntaCanon, marcarErro } from '../../services/beniAssetWarmup';

export default function PalavrinhasBeniWarmer() {
  // Nº de poses (em ORDEM_CANON) já admitidas para montar. Só cresce (retenção); avança por onLoadEnd.
  const [admitidas, setAdmitidas] = useState(Math.min(CONCORRENCIA_WARMUP, ORDEM_CANON.length));
  const avancar = useCallback(() => setAdmitidas((n) => Math.min(ORDEM_CANON.length, n + 1)), []);
  const fila = ORDEM_CANON.slice(0, admitidas);
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {fila.map((pose) => (
        <Image
          key={pose}
          source={BENI_IMAGES[pose]}
          resizeMode="cover"
          fadeDuration={0}
          style={styles.canon}
          onLoadEnd={() => { marcarProntaCanon(pose); avancar(); }}
          onError={() => { marcarErro(pose); avancar(); }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: -9999, top: -9999, width: BENI_CANON, height: 4, opacity: 0, overflow: 'hidden' },
  canon: { width: BENI_CANON, height: BENI_CANON },
});
