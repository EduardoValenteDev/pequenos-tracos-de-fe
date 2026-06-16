/**
 * MapRegion — uma das 4 regiões verticais do Mapa Pergaminho (M2.1).
 *
 * Fundo = imagem REAL da região (assets/maps/), em par adormecido (A) / desperto
 * (B): `awake` escolhe qual exibir. resizeMode="cover" preenche a largura.
 *
 * Sentido da jornada: dentro de cada região o caminho SOBE (marcos posicionados
 * de baixo para cima), respeitando as artes (parte épica no topo). As 4 regiões
 * empilham com SEAMS de névoa (LinearGradient) no topo e na base, para não
 * parecerem "fotos coladas". O caminho (SVG) fica por cima do mapa, atrás dos
 * marcos; as capas ficam por cima de tudo.
 */
import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapPath from './MapPath';
import StoryMapMarker from './StoryMapMarker';

const HEADER_H = 60;
const ROW_H = 166;
const BOTTOM_PAD = 40;
const MARKER_W = 140;
const SEAM_H = 46;

export default function MapRegion({ region, width, awake, getState, onPressStory }) {
  const list = region.stories || [];
  const pad = 16;
  const innerW = width - pad * 2;
  // Zigue-zague suave para o caminho ondular.
  const colX = [pad + innerW * 0.29, pad + innerW * 0.71];

  const markerSpan = HEADER_H + ROW_H * list.length + BOTTOM_PAD;
  // Mostra mais da arte vertical (evita corte feio); seams escondem as bordas.
  const regionH = Math.max(markerSpan, Math.round(width * 1.32));

  // Sentido de baixo para cima: o índice 0 (1ª história) fica EMBAIXO e a jornada
  // sobe. O caminho liga os marcos do fundo para o topo da região.
  const points = list.map((s, i) => ({
    x: colX[i % 2],
    y: regionH - BOTTOM_PAD - ROW_H / 2 - ROW_H * i,
  }));

  const source = region.images ? (awake ? region.images.awake : region.images.asleep) : null;

  return (
    <ImageBackground
      source={source}
      resizeMode="cover"
      style={[styles.region, { height: regionH, backgroundColor: region.tint }]}
    >
      {/* Véu suave para legibilidade sobre a arte */}
      <View style={styles.veil} pointerEvents="none" />

      {/* Seams de névoa de pergaminho — unem as regiões (topo e base) */}
      <LinearGradient
        colors={['rgba(43,33,20,0.55)', 'rgba(251,244,230,0)']}
        style={[styles.seam, { top: 0, height: SEAM_H }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(251,244,230,0)', 'rgba(43,33,20,0.55)']}
        style={[styles.seam, { bottom: 0, height: SEAM_H }]}
        pointerEvents="none"
      />

      {/* Cabeçalho da região (chip translúcido integrado ao mapa) */}
      <View style={styles.headerRow}>
        <View style={styles.chip}>
          <Text style={styles.chipTitle}>{region.title}</Text>
          <Text style={styles.chipSub}>{region.subtitle}</Text>
        </View>
      </View>

      {/* Caminho por código (SVG) ligando os marcos — atrás dos marcos */}
      <MapPath width={width} height={regionH} points={points} color="#FFF6E0" />

      {/* Marcos (capas) por cima */}
      {list.map((story, i) => (
        <View
          key={story.id}
          style={[styles.markerSlot, { left: points[i].x - MARKER_W / 2, top: points[i].y - 60 }]}
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
  region: { width: '100%', overflow: 'hidden' },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,250,235,0.08)' },
  seam: { position: 'absolute', left: 0, right: 0 },
  headerRow: { alignItems: 'center', paddingTop: 14 },
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
