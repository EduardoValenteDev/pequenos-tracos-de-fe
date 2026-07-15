/**
 * StorybookCover — capa de história dentro do livro, com FALLBACK REAL (O2.3 · §8).
 *
 * Se a imagem falhar, mostra uma área com gradiente quente + ícone de livro + título (mesma
 * geometria, sem "imagem indisponível", sem moldura vazia). `fadeDuration={0}` (asset local já
 * aquecido — a imagem aparece junto com a página, sem fade próprio). O aro dourado dá acabamento.
 */
import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FaithIcon from '../ui/FaithIcon';
import { getStoryCover } from '../../assets/storyCovers';
import { OB } from '../../theme/onboardingVisualTokens';

export default function StorybookCover({ storyId, title, width, height, style }) {
  const cover = getStoryCover(storyId);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [storyId]);

  return (
    <View style={[styles.wrap, { width, height }, style]}>
      {cover && !failed ? (
        <Image
          source={cover}
          style={{ width, height, borderRadius: 8 }}
          resizeMode="cover"
          fadeDuration={0}
          onError={() => setFailed(true)}
          accessible
          accessibilityRole="image"
          accessibilityLabel={title}
        />
      ) : (
        <LinearGradient colors={[OB.peach, OB.goldFaint]} style={[styles.fallback, { width, height }]}>
          <FaithIcon name="adventures" size={Math.round(width * 0.28)} color={OB.gold} />
          <Text style={styles.fallbackTitle} numberOfLines={2}>{title}</Text>
        </LinearGradient>
      )}
      <View style={[styles.glow, { width, height }]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 8 },
  fallback: { borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 8 },
  fallbackTitle: { fontFamily: 'FredokaOne', fontSize: 12, color: OB.gold, textAlign: 'center' },
  glow: { position: 'absolute', left: 0, top: 0, borderRadius: 8, borderWidth: 2, borderColor: OB.goldGlow },
});
