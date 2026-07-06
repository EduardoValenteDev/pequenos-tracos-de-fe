import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as pt, radii } from '../../theme/productTheme';
import OfficialSceneImage from './OfficialSceneImage';

/**
 * StorySceneVisual — visual principal da cena na aventura.
 *
 * 3 estados:
 *   A) ilustração oficial da cena → mostra a imagem 16:9 + legenda "Cena ilustrada".
 *   B) sem ilustração oficial, mas há capa → usa a capa como AMBIENTAÇÃO suave
 *      (desfoque leve + overlay), com o emoji da cena em destaque e selo
 *      "Cena especial". Não finge ser a imagem específica da cena.
 *   C) sem capa → fundo ilustrado (gradiente da cor-tema) + "Cena especial".
 *
 * Sem linguagem técnica. Sem "Asset"/"Sem imagem"/"Imagem pendente".
 *
 * @param {object}  scene                 — objeto da cena (emojiCena, titulo, corTema)
 * @param {object}  story                 — história (emoji de fallback)
 * @param {*}       officialIllustration  — asset da ilustração oficial ou null
 * @param {*}       officialFallback      — require local da cena p/ onError (fallback) ou null
 * @param {*}       storyCover            — asset da capa ou null
 * @param {number}  sceneNumber           — número da cena
 * @param {number}  totalScenes           — total de cenas
 */
export default function StorySceneVisual({
  scene,
  story,
  officialIllustration = null,
  officialFallback = null,
  storyCover = null,
  sceneNumber,
  totalScenes,
}) {
  const emoji = scene?.emojiCena ?? story?.emoji ?? '✨';
  const titulo = scene?.titulo ?? `Cena ${sceneNumber}`;
  const corTema = scene?.corTema ?? scene?.ilustracaoCor ?? '#8ED7DC';

  const SceneNumberBadge = () => (
    <View style={styles.numBadge}>
      <Text style={styles.numBadgeText}>{sceneNumber}/{totalScenes}</Text>
    </View>
  );

  // ── Estado A — ilustração oficial (4:5 retrato, responsiva, protagonista) ──
  if (officialIllustration) {
    return (
      <OfficialSceneImage
        source={officialIllustration}
        fallbackSource={officialFallback}
        variant="scene"
        sealLabel="Cena ilustrada"
        style={styles.officialMargin}
      />
    );
  }

  // ── Estado B — capa como ambientação suave ──
  if (storyCover) {
    return (
      <View style={styles.wrapper}>
        <Image source={storyCover} style={styles.image} resizeMode="cover" blurRadius={3} />
        <LinearGradient
          colors={['rgba(45,30,70,0.30)', 'rgba(45,30,70,0.62)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.centerContent} pointerEvents="none">
          <View style={styles.emojiCircle}>
            <Text style={styles.emojiBig}>{emoji}</Text>
          </View>
          <View style={styles.seal}>
            <Text style={styles.sealText}>✨ Cena especial</Text>
          </View>
          <Text style={styles.softNote}>A ilustração desta parte será adicionada depois.</Text>
        </View>
        <SceneNumberBadge />
      </View>
    );
  }

  // ── Estado C — fundo ilustrado (gradiente) ──
  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={[corTema, corTema + 'BB']} style={styles.fallback}>
        <Text style={styles.emojiBig}>{emoji}</Text>
        <Text style={styles.fallbackTitle} numberOfLines={2}>{titulo}</Text>
        <View style={styles.seal}>
          <Text style={styles.sealText}>✨ Cena especial</Text>
        </View>
      </LinearGradient>
      <SceneNumberBadge />
    </View>
  );
}

const HEIGHT = 240;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    height: HEIGHT,
    backgroundColor: '#EDE7F6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  // Estado A — imagem oficial protagonista (4:5 responsiva via OfficialSceneImage)
  officialMargin: { marginBottom: 12 },
  image: { width: '100%', height: '100%' },
  fallback: {
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },

  // Ambientação (estado B)
  centerContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24, gap: 8,
  },
  emojiCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 6,
  },
  emojiBig: { fontSize: 46 },
  softNote: {
    fontFamily: 'Nunito', fontSize: 12, color: 'rgba(255,255,255,0.9)',
    textAlign: 'center', fontStyle: 'italic', lineHeight: 17,
  },

  // Selo "Cena especial"
  seal: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radii.pill,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  sealText: { fontFamily: 'Nunito', fontSize: 12, color: pt.premiumText, fontWeight: '700' },

  fallbackTitle: {
    fontFamily: 'FredokaOne', fontSize: 20, color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
    textAlign: 'center', paddingHorizontal: 20,
  },

  // Legenda (estado A)
  caption: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3,
  },
  captionText: { fontFamily: 'Nunito', fontSize: 11, color: '#FFF', fontWeight: '700' },

  numBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  numBadgeText: { fontFamily: 'FredokaOne', fontSize: 12, color: '#FFF' },
});
