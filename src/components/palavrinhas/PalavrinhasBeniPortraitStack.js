/**
 * PalavrinhasBeniPortraitStack — portrait PERSISTENTE do Beni na partida (P4.3, ETAPA 3).
 *
 * Substitui o BeniStageCharacter no portrait da rodada. Monta UMA `Image` (RN puro, NUNCA
 * Animated.Image) para cada uma das 11 poses, TODAS no mesmo contêiner, todas `position:absolute`,
 * montadas UMA única vez durante a vida da tela. A pose ativa fica `opacity:1`; as demais `opacity:0`.
 * A troca de pose muda SOMENTE a opacidade declarativa (derivada de `activePose`) — sem crossfade,
 * sem Animated.timing, sem scale de entrada, sem atual/anterior, sem copiar a prop para estado,
 * sem efeito de sincronização, sem trocar `source`, sem `key` que dependa da pose ativa, sem
 * desmontar/montar Image ao trocar de palavra. Assim, mudar de palavra = mudar de opacidade no
 * MESMO render, sem qualquer nova apresentação nativa da imagem.
 *
 * Usa o mapa OTIMIZADO exclusivo do Palavrinhas (base 1x + @2x/@3x resolvidos pelo Metro).
 * Cada Image reporta seu PRÓPRIO carregamento (onLoadEnd/onError) — a prontidão pertence às
 * instâncias realmente exibidas (nunca a uma Image offscreen diferente).
 *
 * Props: activePose · size · lado · visivel · onPoseReady(pose) · onPoseErro(pose).
 */
import React, { useCallback } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { BENI_PALAVRINHAS_IMAGES, BENI_PALAVRINHAS_POSE_KEYS, BENI_PALAVRINHAS_DEFAULT } from '../../assets/mascot/beniPalavrinhasImages';
import { posePortraitSegura, presetDe } from '../../services/palavrinhasVisualDirector';

const fonte = (p) => BENI_PALAVRINHAS_IMAGES[p] || BENI_PALAVRINHAS_IMAGES[BENI_PALAVRINHAS_DEFAULT];

export default function PalavrinhasBeniPortraitStack({
  activePose = 'avatarBase', size = 72, lado = 'esquerda', visivel = true, onPoseReady, onPoseErro,
}) {
  const poseAtiva = posePortraitSegura(activePose);   // garante uma pose portrait válida
  const flip = lado === 'direita' ? -1 : 1;
  const raio = Math.round(size / 2);

  const aoCarregar = useCallback((pose) => { if (onPoseReady) { try { onPoseReady(pose); } catch (_) { /* noop */ } } }, [onPoseReady]);
  const aoErro = useCallback((pose) => { if (onPoseErro) { try { onPoseErro(pose); } catch (_) { /* noop */ } } }, [onPoseErro]);

  const estilo = (pose) => {
    const pr = presetDe(pose, 'portrait');
    return {
      position: 'absolute', left: 0, top: 0, width: size, height: size,
      transform: [{ scaleX: flip }, { translateX: (pr.translateXf || 0) * size }, { translateY: (pr.translateYf || 0) * size }, { scale: (pr.scale || 1) * (pr.overscan || 1) }],
    };
  };

  return (
    <View pointerEvents="none" style={[styles.moldura, { width: size, height: size, borderRadius: raio, opacity: visivel ? 1 : 0 }]}>
      {BENI_PALAVRINHAS_POSE_KEYS.map((pose) => (
        <Image
          key={pose}
          pointerEvents="none"
          source={fonte(pose)}
          resizeMode="cover"
          fadeDuration={0}
          onLoadEnd={() => aoCarregar(pose)}
          onError={() => aoErro(pose)}
          style={[estilo(pose), { opacity: pose === poseAtiva ? 1 : 0 }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  moldura: {
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center', zIndex: 6,
    backgroundColor: '#FFF7EC', borderWidth: 2.5, borderColor: '#EAD3A2',
  },
});
