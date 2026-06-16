/**
 * MapRegion — uma das 4 regiões verticais do Mapa Pergaminho (M2).
 *
 * Fundo = imagem REAL da região (assets/maps/), em par adormecido (A) / desperto
 * (B): `awake` escolhe qual exibir. resizeMode="cover" preenche a largura. As 4
 * regiões empilhadas formam o mapa contínuo. O caminho (SVG) fica POR CIMA do
 * mapa mas ATRÁS dos marcos; os marcos (capas) ficam por cima de tudo.
 */
import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import MapPath from './MapPath';
import StoryMapMarker from './StoryMapMarker';

const HEADER_H = 64;
const ROW_H = 158;
const BOTTOM_PAD = 34;
const MARKER_W = 132;

export default function MapRegion({ region, width, awake, getState, onPressStory }) {
  const list = region.stories || [];
  const pad = 16;
  const innerW = width - pad * 2;
  // Zigue-zague suave: alterna esquerda/direita para o caminho ondular.
  const colX = [pad + innerW * 0.28, pad + innerW * 0.72];

  const points = list.map((s, i) => ({
    x: colX[i % 2],
    y: HEADER_H + ROW_H * i + ROW_H / 2,
  }));
  const contentH = HEADER_H + ROW_H * list.length + BOTTOM_PAD;

  const source = region.images ? (awake ? region.images.awake : region.images.asleep) : null;

  return (
    <ImageBackground
      source={source}
      resizeMode="cover"
      style={[styles.region, { minHeight: contentH, backgroundColor: region.tint }]}
    >
      {/* Véu suave para legibilidade dos marcos/títulos sobre a arte do mapa */}
      <View style={styles.veil} pointerEvents="none" />

      {/* Cabeçalho da região (chip translúcido integrado ao mapa) */}
      <View style={styles.headerRow}>
        <View style={styles.chip}>
          <Text style={styles.chipTitle}>{region.title}</Text>
          <Text style={styles.chipSub}>{region.subtitle}</Text>
        </View>
      </View>

      {/* Caminho por código (SVG) ligando os marcos — atrás dos marcos */}
      <MapPath width={width} height={contentH} points={points} color="#FFF6E0" />

      {/* Marcos (capas) por cima */}
      {list.map((story, i) => (
        <View
          key={story.id}
          style={[styles.markerSlot, { left: points[i].x - MARKER_W / 2, top: points[i].y - 56 }]}
        >
          <StoryMapMarker
            story={story}
            state={getState(story)}
            onPress={() => onPressStory(story)}
          />
        </View>
      ))}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  region: { width: '100%' },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,250,235,0.10)' },
  headerRow: { alignItems: 'center', paddingTop: 14 },
  chip: {
    backgroundColor: 'rgba(40,30,15,0.55)',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  chipTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFFFFF' },
  chipSub: { fontFamily: 'Nunito', fontSize: 11.5, color: '#F3E8D0', fontWeight: '700' },
  markerSlot: { position: 'absolute', width: MARKER_W, alignItems: 'center' },
});
