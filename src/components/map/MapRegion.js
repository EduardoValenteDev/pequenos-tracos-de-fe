/**
 * MapRegion — uma das 4 regiões verticais do Mapa Pergaminho (M1).
 *
 * Fundo PROVISÓRIO por código (tom pergaminho da região) — não importa
 * assets/maps/. As 4 regiões empilhadas simulam o encaixe futuro de R1..R4 (M2).
 * Posiciona os marcos em zigue-zague e desenha o caminho (SVG) por trás deles.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapPath from './MapPath';
import StoryMapMarker from './StoryMapMarker';

const HEADER_H = 60;
const ROW_H = 132;
const BOTTOM_PAD = 28;
const MARKER_W = 112;

export default function MapRegion({ region, width, getState, onPressStory }) {
  const list = region.stories || [];
  const pad = 18;
  const innerW = width - pad * 2;
  // Zigue-zague: alterna esquerda/direita para o caminho ondular.
  const colX = [pad + innerW * 0.27, pad + innerW * 0.73];

  const points = list.map((s, i) => ({
    x: colX[i % 2],
    y: HEADER_H + ROW_H * i + ROW_H / 2,
  }));
  const contentH = HEADER_H + ROW_H * list.length + BOTTOM_PAD;

  return (
    <View style={[styles.region, { backgroundColor: region.tint, minHeight: contentH }]}>
      {/* Cabeçalho da região (chip) */}
      <View style={styles.headerRow}>
        <View style={[styles.chip, { borderColor: region.accent }]}>
          <Text style={[styles.chipTitle, { color: region.accent }]}>{region.title}</Text>
          <Text style={styles.chipSub}>{region.subtitle}</Text>
        </View>
      </View>

      {/* Caminho por código (SVG) ligando os marcos */}
      <MapPath width={width} height={contentH} points={points} color={region.accent} />

      {/* Marcos posicionados ao longo do caminho */}
      {list.map((story, i) => (
        <View
          key={story.id}
          style={[styles.markerSlot, { left: points[i].x - MARKER_W / 2, top: points[i].y - 42 }]}
        >
          <StoryMapMarker
            story={story}
            state={getState(story)}
            onPress={() => onPressStory(story)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  region: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(120,90,40,0.08)',
  },
  headerRow: { alignItems: 'center', paddingTop: 12 },
  chip: {
    backgroundColor: '#FFFFFFEE',
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 5,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chipTitle: { fontFamily: 'FredokaOne', fontSize: 15 },
  chipSub: { fontFamily: 'Nunito', fontSize: 11, color: '#7A6A4E', fontWeight: '700' },
  markerSlot: { position: 'absolute', width: MARKER_W, alignItems: 'center' },
});
