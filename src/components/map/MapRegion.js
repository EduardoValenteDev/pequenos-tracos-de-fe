/**
 * MapRegion — uma das 4 regiões verticais do Mapa Pergaminho (M2.4).
 *
 * Altura = PROPORÇÃO REAL da arte (768×2048), via computeRegionHeight — NÃO cresce
 * por marcos (isso causava zoom/recorte). A arte é uma camada de Image ABSOLUTA
 * com resizeMode="stretch" (o container tem a MESMA proporção da imagem, então não
 * distorce e não corta). O fundo enquanto a arte carrega é pergaminho NEUTRO (sem
 * azul). A Image só monta quando `renderImage` é true (render progressivo) — o
 * placeholder de pergaminho segura a altura, mantendo scroll/offsets corretos.
 *
 * Camada separada da arte deixa pronta a futura revelação A/B (B base + A por cima
 * com máscara) sem refatorar a estrutura.
 *
 * Sentido da jornada: 1ª história embaixo, última no topo (markerFraction). Marcos
 * só na banda segura (regionMarkerBand), abaixo do título.
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapPath from './MapPath';
import StoryMapMarker from './StoryMapMarker';
import { computeRegionHeight, markerFraction, REGION_PARCHMENT_BG } from '../../data/adventureMap';

const MARKER_W = 132;
const SEAM_H = 56;
const OVERLAP = 28; // sobreposição entre regiões (margem negativa)

export default function MapRegion({ region, frameWidth, awake, currentStoryId, isTop, renderImage, getState, onPressStory }) {
  const list = region.stories || [];
  const n = list.length;
  const pad = 14;
  const innerW = frameWidth - pad * 2;
  const colX = [pad + innerW * 0.29, pad + innerW * 0.71]; // zigue-zague (coords do FRAME)

  // Altura proporcional ao FRAME (não à tela inteira) → reduz a sensação de zoom.
  const regionH = computeRegionHeight(frameWidth);

  // Marcos só na banda segura; 1ª embaixo → caminho sobe; nenhum entra no título.
  const points = list.map((s, i) => ({ x: colX[i % 2], y: Math.round(regionH * markerFraction(i, n)) }));

  const highlightIndex = currentStoryId ? list.findIndex((s) => s.id === currentStoryId) : -1;
  const source = region.images ? (awake ? region.images.awake : region.images.asleep) : null;

  return (
    <View style={[styles.region, { width: frameWidth, height: regionH, marginTop: isTop ? 0 : -OVERLAP }]}>
      {/* Camada da ARTE (absoluta, stretch). Só monta quando próxima do viewport.
          Camada separada deixa pronta a futura revelação A/B (B base + A por cima). */}
      {renderImage && source && (
        <Image source={source} resizeMode="stretch" style={StyleSheet.absoluteFill} fadeDuration={120} />
      )}

      <View style={styles.veil} pointerEvents="none" />

      {/* Seams de névoa de pergaminho — unem as regiões (topo e base) */}
      <LinearGradient colors={['rgba(43,33,20,0.6)', 'rgba(231,214,176,0)']} style={[styles.seam, { top: 0, height: SEAM_H }]} pointerEvents="none" />
      <LinearGradient colors={['rgba(231,214,176,0)', 'rgba(43,33,20,0.6)']} style={[styles.seam, { bottom: 0, height: SEAM_H }]} pointerEvents="none" />

      {/* Chip da região (no alto, dentro da zona segura) */}
      <View style={styles.headerRow}>
        <View style={styles.chip}>
          <Text style={styles.chipTitle}>{region.title}</Text>
          <Text style={styles.chipSub}>{region.subtitle}</Text>
        </View>
      </View>

      {/* Caminho por código (SVG) em coords do FRAME, com brilho até a próxima aventura */}
      <MapPath width={frameWidth} height={regionH} points={points} color="#FFF6E0" highlightIndex={highlightIndex} />

      {/* Marcos (capas) por cima */}
      {list.map((story, i) => (
        <View key={story.id} style={[styles.markerSlot, { left: points[i].x - MARKER_W / 2, top: points[i].y - 56 }]}>
          <StoryMapMarker story={story} state={getState(story)} onPress={() => onPressStory(story)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  region: {
    alignSelf: 'center',           // FRAME centralizado (não full width)
    overflow: 'hidden',
    backgroundColor: REGION_PARCHMENT_BG,
    borderRadius: 14,              // cantos de "quadro" de aventura
  },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,250,235,0.05)' },
  seam: { position: 'absolute', left: 0, right: 0 },
  headerRow: { alignItems: 'center', paddingTop: SEAM_H - 10 },
  chip: {
    backgroundColor: 'rgba(40,30,15,0.50)',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  chipTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFFFFF' },
  chipSub: { fontFamily: 'Nunito', fontSize: 11.5, color: '#F3E8D0', fontWeight: '700' },
  markerSlot: { position: 'absolute', width: MARKER_W, alignItems: 'center' },
});
